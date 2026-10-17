/* Math 10C · Unit 5 · Lesson 6 — Exploring Real-World Relations With a Graphing Calculator (RF1, RF2)
 * Assignment questions 1–8 (u5_L06.tex) and the Lesson 6 Extra Practice (u5_EP06.tex).
 * Every part is a generator: each question keeps the booklet's model type (linear cost / cooling / profit, a quadratic
 * height or revenue with a vertex, a discrete count) and the same kind of numbers, and the booklet's own numbers are one
 * of the possible versions.
 * Conversions: "sketch the graph / state a window" → four window boxes (Xmin, Xmax, Ymin, Ymax), checked against the
 * features the prompt names (any window that shows them is right, but not a negative Xmin for a time or a count, and not
 * a window 10× too big); values found with TRACE / zero / maximum / intersect → numbers (exact, or rounded to the
 * hundredth as the booklet asks); "explain / describe the significance" → multiple choice with misconception hints;
 * practical domain and range → set answers (K.P.set; a count is a list such as {n | 0 ≤ n ≤ 300, n ∈ W}).
 * Calculator work drops a level (LEVEL_RUBRIC.md). Levels: LIM BEG EMG PRG ADV MAS. */
(function (root) {
  'use strict';
  var HW = root.HW, F = HW.fmt, K = HW.kit, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form, B = K.P;

  HW.addCodes({
    'win-number': 'Window value not a number', 'win-order': 'Window min not less than max', 'win-neg-x': 'Negative Xmin for an input that can’t be negative',
    'win-cut-left': 'Window cuts off the start', 'win-cut-x': 'Window cuts off the end (Xmax too small)', 'win-cut-top': 'Window cuts off the top (Ymax too small)',
    'win-cut-bottom': 'Window cuts off the bottom (Ymin too big)', 'win-huge': 'Window far too large', 'win-neg-y': 'Most of the window below zero for a quantity that can’t be negative',
    'ctx-no-fee': 'Left out the fixed amount', 'ctx-no-sub': 'Didn’t subtract the starting amount before dividing', 'ctx-added': 'Added the starting amount instead of subtracting',
    'ctx-eval': 'Substituted instead of solving', 'ctx-mult': 'Multiplied instead of dividing', 'ctx-sign': 'Sign slip in the model', 'ctx-change': 'Gave the change instead of the value',
    'int-sign': 'Intercept with the wrong sign', 'int-no-divide': 'Didn’t divide by the coefficient', 'int-gave-y': 'Gave the other intercept',
    'ctx-zero-start': 'Said the starting height is 0', 'ctx-sign-sq': 'Lost the minus sign on the squared term', 'ctx-no-c': 'Left out the constant term',
    'ctx-max-time': 'Gave the input of the vertex instead of the output', 'ctx-gave-h': 'Gave the output of the vertex instead of the input', 'ctx-coef': 'Gave a coefficient of the formula',
    'ctx-half-land': 'Took the vertex halfway to the landing', 'ctx-neg-time': 'Kept the negative root', 'ctx-double-vertex': 'Doubled the vertex time for the landing',
    'ctx-revenue': 'Revenue instead of profit', 'ctx-not-whole': 'Continuous set for a whole-number count', 'ctx-dom-breakeven': 'Domain started at break-even',
    'ctx-dom-vertex': 'Domain stopped at the vertex', 'ctx-dom-open': 'Domain with no upper end', 'ctx-dom-neg': 'Domain includes negative inputs',
    'ctx-rng-start': 'Range started at the starting value, not 0', 'ctx-rng-vertex-x': 'Used the input of the vertex in the range', 'ctx-rng-open': 'Range with a missing end',
    'ctx-no-k': 'Left out the factor in front of the bracket', 'ctx-gave-end': 'Gave the end of the domain', 'ctx-used': 'Gave the amount used instead of the amount left',
    'ctx-to-empty': 'Distance to empty instead of to the refuel level', 'ctx-swap-boxes': 'Two answers in each other’s boxes', 'ctx-round-down': 'Rounded down where the count must round up',
    'ctx-round-up': 'Rounded up where the count must round down', 'ctx-year-round': 'Rounded the year up', 'ctx-gave-a': 'Gave a number from the formula, not the intercept',
    'ctx-gave-cost': 'Gave the expenses instead of the number of tickets', whole: 'Decimal where a whole number is needed', 'order-boxes': 'Two right answers in each other’s boxes', 'ctx-start-diff': 'Gave a starting height instead of the difference', 'ctx-more-cases': 'Chose the price that sells more', 'ctx-sum': 'Added the two zeros'
  });

  /* ---------------- numbers and LaTeX ---------------- */
  function cl(x) { return Math.round(x * 1e6) / 1e6; }
  function nT(x) { return F(cl(x)); }                                 // number for display (thin spaces ≥ 1000)
  function pT(x) { return String(cl(x)); }                            // plain number (inside set notation)
  function isDp(x, d) { var f = Math.pow(10, d); return Math.abs(x * f - Math.round(x * f)) < 1e-6; }
  function rd(x, d) { return K.roundTo(x, d); }
  function rT(x, d) { return isDp(x, d) ? nT(x) : F(rd(x, d).toFixed(d)); }   // exact, or rounded to d places
  function ap(x, d) { return isDp(x, d) ? '=' : '\\approx '; }
  function money(x) { var a = Math.abs(cl(x)); return (x < 0 ? '-' : '') + '\\$' + (isDp(a, 0) ? F(a) : F(a.toFixed(2))); }
  function sg(c) { c = cl(c); return c < 0 ? nT(c) : '+' + nT(c); }
  function sgp(c) { c = cl(c); return c < 0 ? '(' + nT(c) + ')' : nT(c); }
  function quadT(a, b, c, v) {                                         // a v^2 + b v + c
    var s = '';
    [[a, v + '^{2}'], [b, v], [c, '']].forEach(function (p) {
      var k = cl(p[0]); if (!k) return;
      var mag = nT(Math.abs(k)); if (p[1] && mag === '1') mag = '';
      s += (k < 0 ? '-' : s ? '+' : '') + mag + p[1];
    });
    return s || '0';
  }
  function rng(a, b, step) { var o = []; for (var x = a; x <= b + 1e-9; x += (step || 1)) o.push(cl(x)); return o; }
  function pickWhere(gen, okf) { for (var i = 0; i < 3000; i++) { var o = gen(); if (okf(o)) return o; } throw new Error('u5l6: no valid numbers'); }
  function margin(x, d) { var f = Math.pow(10, d), fr = x * f - Math.floor(x * f); return isDp(x, d) || Math.abs(fr - 0.5) > 0.04; }  // exact, or safely away from a rounding tie
  function kb(s) { return '<b>' + s + '</b>'; }
  function cd(s) { return '<code>' + s + '</code>'; }
  function niceUp(v) { if (v <= 0) return 0; var p = Math.pow(10, Math.floor(Math.log10(v))), ms = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 7, 8, 10]; for (var i = 0; i < ms.length; i++) if (ms[i] * p >= v - 1e-9) return cl(ms[i] * p); return cl(10 * p); }
  function niceStep(v) { var p = Math.pow(10, Math.floor(Math.log10(v))), ms = [1, 2, 2.5, 5, 10]; for (var i = 0; i < ms.length; i++) if (ms[i] * p >= v - 1e-9) return cl(ms[i] * p); return cl(10 * p); }
  function quadRoots(a, b, c) { var D = b * b - 4 * a * c; if (D < 0) return []; var s = Math.sqrt(D), r1 = (-b - s) / (2 * a), r2 = (-b + s) / (2 * a); return [Math.min(r1, r2), Math.max(r1, r2)]; }
  function setT(v, lo, hi, ns) { return '\\{' + v + '\\mid ' + pT(lo) + '\\le ' + v + '\\le ' + pT(hi) + ',\\ ' + v + '\\in ' + (ns || '\\mathbb{R}') + '\\}'; }

  /* ---------------- answer checkers ---------------- */
  /* diagnoses: cands = [{ v, code, hint }] matched to the typed value (to within rounding) */
  function near(cands, x, d) {
    var tol = 0.5 * Math.pow(10, -d) + 1e-6;
    var list = (cands || []).filter(function (c) { return c && c.v != null && isFinite(c.v) && Math.abs(c.v - x) >= 1.5 * tol; });
    return function (v) { for (var i = 0; i < list.length; i++) if (Math.abs(v - list[i].v) < tol) return { code: list[i].code, hint: list[i].hint }; return null; };
  }
  /* a value: exact when it has at most d decimals, otherwise rounded to d places */
  function numChk(x, d, cands) { d = d == null ? 2 : d; return isDp(x, d) ? K.number(cl(x), near(cands, x, d)) : K.approx(x, d, { diag: near(cands, x, d) }); }
  function numKey(x, d) { d = d == null ? 2 : d; return isDp(x, d) ? String(cl(x)) : rd(x, d).toFixed(d); }
  function numPart(prompt, x, d, cands, sol, hints, text, inp) {
    inp = inp || {}; d = d == null ? 2 : d;
    var key = numKey(x, d), shown = inp.money ? money(Number(key)) : F(key);
    var answer = (inp.money ? t(shown) : (inp.before ? inp.before + ' ' : '') + t(shown)) + (inp.after ? ' ' + inp.after : '');
    var input = { type: 'number' }; if (inp.money) input.before = '$'; else if (inp.before) input.before = inp.before; if (inp.after) input.after = inp.after;
    return { prompt: prompt, input: input, check: numChk(x, d, cands), key: key, answer: answer, solution: sol, hints: hints || [], text: text,
      bad: (cands || []).filter(function (c) { return c && isFinite(c.v) && Math.abs(c.v - x) > 0.02; }).map(function (c) { return numKey(c.v, d); }) };
  }
  /* several number boxes: boxes = [{ label, x, d, cands, after, before }]; opt.swap: 'form' | 'wrong' when two answers are swapped */
  function fieldsPart(prompt, boxes, sol, hints, text, opt) {
    opt = opt || {};
    var checks = boxes.map(function (b) { return numChk(b.x, b.d == null ? 2 : b.d, b.cands); });
    var fields = boxes.map(function (b) { return { name: b.label, label: b.label, before: b.before, after: b.after }; });
    var inner = K.fields(checks, { labels: boxes.map(function (b) { return b.label; }) });
    var check = function (resp) {
      resp = resp || [];
      if (opt.swap && boxes.length === 2 && Math.abs(boxes[0].x - boxes[1].x) > 0.02) {
        var a = numChk(boxes[1].x, boxes[1].d == null ? 2 : boxes[1].d)(resp[0] == null ? '' : resp[0]), b = numChk(boxes[0].x, boxes[0].d == null ? 2 : boxes[0].d)(resp[1] == null ? '' : resp[1]);
        if (a.v === 'correct' && b.v === 'correct') return opt.swap === 'form' ? form('order-boxes', 'Both values are right — but they are in each other’s boxes. Put the ' + boxes[0].label.toLowerCase() + ' first.') : wrong('ctx-swap-boxes', opt.swapHint || 'Your two answers are in each other’s boxes. Read the labels again.');
      }
      return inner(resp);
    };
    var keys = boxes.map(function (b) { return numKey(b.x, b.d == null ? 2 : b.d); });
    return { prompt: prompt, input: { type: 'fields', fields: fields }, check: check, key: keys,
      answer: boxes.map(function (b, i) { return b.label + ': ' + (b.before || '') + t(b.plain ? keys[i] : F(keys[i])) + (b.after ? ' ' + b.after : ''); }).join('<br>'),
      solution: sol, hints: hints || [], text: text, bad: opt.swap ? [keys.slice().reverse()] : [] };
  }
  /* window settings. o = { x:[lo,hi], y:[lo,hi] (what must be visible), xv, yv, xHi, xHiHow, yHi, yHiHow, yLo, yNonneg, key, good, bad } */
  var WN = ['Xmin', 'Xmax', 'Ymin', 'Ymax'];
  function winCheck(o) {
    var xs = o.x[1] - o.x[0], ys = o.y[1] - o.y[0];
    return function (resp) {
      resp = resp || []; var v = [];
      for (var i = 0; i < 4; i++) {
        var p = HW.parse.number(resp[i] == null ? '' : resp[i]);
        if (!p.ok) return form(p.code === 'empty' ? 'empty' : 'win-number', p.code === 'empty' ? 'Fill in all four window settings.' : '<b>' + WN[i] + ':</b> enter a single number.');
        v.push(p.value);
      }
      var x0 = v[0], x1 = v[1], y0 = v[2], y1 = v[3];
      if (x0 >= x1) return wrong('win-order', cd('Xmin') + ' must be less than ' + cd('Xmax') + ' — the left edge of the screen comes first.');
      if (y0 >= y1) return wrong('win-order', cd('Ymin') + ' must be less than ' + cd('Ymax') + ' — the bottom edge of the screen comes first.');
      if (x0 < -1e-9) return wrong('win-neg-x', t(o.xv) + ' ' + o.xNeg + ', so negative values of ' + t(o.xv) + ' never happen in this situation. Start the window at ' + cd('Xmin') + ' = 0.');
      if (x0 > o.x[0] + 1e-9) return wrong('win-cut-left', 'With ' + cd('Xmin') + ' = ' + t(nT(x0)) + ' the start of the situation (' + t(o.xv + '=0') + ') is off the screen.');
      if (x1 < Math.min(o.x[1], rd(o.x[1], 2)) - 1e-9) return wrong('win-cut-x',   // Xmax = the landing time to the hundredth (e.g. 4.12 for 4.1213) is fine cd('Xmax') + ' = ' + t(nT(x1)) + ' cuts off ' + o.xHi + '. ' + o.xHiHow);
      if (y1 < o.y[1] - 1e-9) return wrong('win-cut-top', cd('Ymax') + ' = ' + t(nT(y1)) + ' cuts off ' + o.yHi + '. ' + o.yHiHow);
      if (y0 > o.y[0] + 1e-9) return wrong('win-cut-bottom', cd('Ymin') + ' = ' + t(nT(y0)) + ' hides ' + o.yLo + '.');
      if (x1 - x0 > 10 * xs) return wrong('win-huge', 'That window is so wide that the graph is squeezed into a thin strip at the left. Bring ' + cd('Xmax') + ' down to just past the values the question needs.');
      if (y1 - y0 > 10 * ys) return wrong('win-huge', 'That window is so tall that the graph is squashed flat. Bring ' + cd('Ymin') + ' / ' + cd('Ymax') + ' closer to the values the question needs.');
      if (o.yNonneg && y0 < -0.5 * ys) return wrong('win-neg-y', t(o.yv) + ' can’t be negative here, but your window spends a big part of the screen below ' + t(o.yv + '=0') + '. Use ' + cd('Ymin') + ' = 0 (or just a little below).');
      return ok();
    };
  }
  function winPart(o) {
    return { prompt: o.prompt, input: { type: 'fields', fields: WN.map(function (n) { return { name: n, label: n + ' =' }; }) }, check: winCheck(o), key: o.key.map(String),
      answer: 'For example ' + WN.map(function (n, i) { return cd(n) + ' = ' + t(nT(o.key[i])); }).join(', ') + '. Any window that shows ' + o.need + ' is right.',
      solution: o.sol, hints: o.hints || ['List what has to be on the screen: the start (' + t(o.xv + '=0') + '), ' + o.need + '. Find those values first, then choose bounds a little beyond them.', 'Choose ' + cd('Xmin') + ' and ' + cd('Ymin') + ' to suit the quantities: a time or a count starts at 0.'],
      text: o.text, good: (o.good || []).map(function (w) { return w.map(String); }), bad: (o.bad || []).map(function (w) { return w.map(String); }) };
  }
  function winKey(x, y) { return [0, niceUp(x[1] * 1.04), y[0] < 0 ? -niceUp(-y[0] * 1.05) : 0, niceUp(y[1] * 1.05)]; }
  /* a calculator-screen style picture of the model in a window */
  function screen(win, o) {
    var xs = win[1] - win[0], ys = win[3] - win[2], gx = niceStep(xs / 8), gy = niceStep(ys / 6);
    return HW.graph({ x: [win[0], win[1]], y: [win[2], win[3]], unitX: 260 / xs, unitY: 160 / ys, grid: gx, gridY: gy, labels: 1, labelsX: gx * 2, labelsY: ys / gy > 6 ? gy * 2 : gy,
      firstQuadrant: true, xName: o.xv, yName: o.yv, yTitle: Math.max(Math.abs(win[2]), Math.abs(win[3])) >= 1000 ? '\u00a0' : undefined, max: 330, fns: o.fns, points: o.points, segs: o.segs, aria: o.aria || 'graph of the model' });
  }
  function mc(r, prompt, opts, sol, hints, text, keep) { return B.mc(r, prompt, opts, sol, hints || [], text, keep); }
  function setPart(prompt, target, opt, sol, hints, text) { return B.set(prompt, target, opt, sol, hints, text); }

  /* ---------------- shared hint text ---------------- */
  var H_TRACE = 'For the output at a given input, use ' + kb('TRACE') + ' (type the input, press ' + kb('ENTER') + ') or the table — or substitute the input into the formula.';
  var H_INT = 'For the input that gives a certain output, graph that output as ' + t('Y_2') + ' and use ' + cd('2ND TRACE → 5:intersect') + ' — or set the formula equal to it and solve.';
  var H_ZERO = 'Where the graph meets the horizontal axis the output is ' + t('0') + ': use ' + cd('2ND TRACE → 2:zero') + ', or set the formula equal to ' + t('0') + ' and solve.';
  var H_MAX = 'The highest point is the vertex: ' + cd('2ND TRACE → 4:maximum') + ' (left bound, right bound, guess). It gives both coordinates.';
  var H_VERT = 'Algebra check: the vertex of ' + t('y=ax^{2}+bx+c') + ' is at ' + t('x=-\\frac{b}{2a}') + '; substitute that back in for the greatest value.';
  var H_DOM = ['The practical domain runs from where the situation starts to where it ends (a landing, an empty tank, the last value that makes sense).', 'The practical range runs from the least to the greatest output in that domain — for a parabola, check the vertex.'];
  function zeroSol(eqLeft, v, roots, keepIdx, d, extra) {
    return 'Calculator: ' + cd('2ND TRACE → 2:zero') + ' on the crossing in the practical domain.<br>Algebra: ' + t(eqLeft + '=0') + ' gives ' + roots.map(function (x) { return t(v + ap(x, d) + rT(x, d)); }).join(' or ') + (extra || '') + '.';
  }

  /* ---------------- model generators ---------------- */
  function jerseys(r) {
    var m = r.pick([2, 3, 4, 5, 6]), ks = rng(Math.max(5, Math.ceil(20 / m)), Math.min(20, Math.floor(90 / m))), k = r.pick(ks), f = m * k;
    var N = r.int(15, 40), n0 = pickWhere(function () { return r.int(30, 75); }, function (x) { return x !== N; });
    return { m: m, k: k, f: f, N: N, n0: n0, X: m * n0 + f, Nmax: r.pick([40, 50, 60, 80]), eq: 'C=' + m + 'n+' + f, y1: 'Y_1=' + m + 'X+' + f };
  }
  function tea(r) {
    var opts = [];
    [0.4, 0.5, 0.6, 0.8].forEach(function (rt) { for (var T0 = 76; T0 <= 96; T0++) { var ti = T0 / rt; if (isDp(ti, 0) && ti >= 90 && ti <= 240) opts.push([rt, T0]); } });
    var o = r.pick(opts), rt = o[0], T0 = o[1], ti = cl(T0 / rt), t1 = r.pick([10, 15, 20, 25, 30, 35, 40]);
    var t2s = rng(20, 90, 5).filter(function (x) { var Tc = T0 - rt * x; return x !== t1 && isDp(Tc, 0) && Tc >= 35 && Tc <= 70; });
    var t2 = r.pick(t2s);
    return { rt: rt, T0: T0, ti: ti, t1: t1, T1: cl(T0 - rt * t1), t2: t2, Tc: cl(T0 - rt * t2), eq: 'T=-' + nT(rt) + 't+' + T0, y1: 'Y_1=-' + nT(rt) + 'X+' + T0 };
  }
  function shuttle(r) {
    return pickWhere(function () {
      var b = r.pick([12, 14, 16, 18, 20]), c = r.pick([1, 1.5, 2, 2.5]), t1 = r.pick([0.5, 1, 1.5]);
      var rt = quadRoots(-5, b, c);
      return { a: -5, b: b, c: c, t1: t1, h1: cl(-5 * t1 * t1 + b * t1 + c), tv: cl(b / 10), hm: cl(c + b * b / 20), land: rt[1], neg: rt[0], eq: 'h=' + quadT(-5, b, c, 't'), y1: 'Y_1=' + quadT(-5, b, c, 'X') };
    }, function (o) { return margin(o.land, 2) && margin(o.neg, 2) && o.t1 < o.land - 0.5; });
  }
  function charity(r) {
    return pickWhere(function () {
      var p = r.pick([5, 8, 10, 12, 15, 20]), k = r.int(40, 90), E = p * k, cap = r.pick([200, 250, 300, 350]);
      var n3s = rng(k + 30, cap - 20).filter(function (n) { return (p * n - E) % 100 === 0; });
      var n3 = n3s.length ? r.pick(n3s) : 0, N4 = r.pick(rng(Math.ceil((k + 20) / 10) * 10, cap - 10, 10).filter(function (n) { return n !== n3; }));
      return { p: p, k: k, E: E, cap: cap, n3: n3, Pt: p * n3 - E, N4: N4, P4: p * N4 - E, top: p * cap - E, eq: 'P=' + p + 'n-' + E, y1: 'Y_1=' + p + 'X-' + E };
    }, function (o) { return o.n3 > 0 && o.cap > o.k + 60 && o.Pt > 0; });
  }
  function soccer(r) {
    var k = r.pick([0.02, 0.04, 0.05]), L = r.pick([30, 32, 34, 36, 38, 40]), d1 = r.int(L / 2 + 3, L - 2), d2 = r.int(3, L / 2 - 4);
    var h = function (d) { return cl(k * (-d * d + L * d)); };
    return { k: k, L: L, d1: d1, d2: d2, h1: h(d1), h2: h(d2), hm: h(L / 2), dv: L / 2, h: h, eq: 'h=' + nT(k) + '(-d^{2}+' + L + 'd)', y1: 'Y_1=' + nT(k) + '(-X^{2}+' + L + 'X)' };
  }
  function shell(r) {   // fireworks shell h = -5t^2 + bt + c (EP1, EP2)
    return pickWhere(function () {
      var b = r.pick([20, 24, 26, 28, 30, 32]), c = r.pick([1, 1.5, 2, 2.5, 3]), tv = cl(b / 10), pk = cl(c + b * b / 20), rt = quadRoots(-5, b, c);
      var Hs = rng(Math.ceil((c + 8) / 5) * 5, pk - 4, 5), H = Hs.length ? r.pick(Hs) : 0, ht = H ? quadRoots(-5, b, c - H) : [0, 0];
      return { b: b, c: c, tv: tv, pk: pk, land: rt[1], neg: rt[0], H: H, h1: ht[0], h2: ht[1], eq: 'h=' + quadT(-5, b, c, 't'), y1: 'Y_1=' + quadT(-5, b, c, 'X') };
    }, function (o) { return o.H && margin(o.land, 2) && margin(o.neg, 2) && margin(o.h1, 2) && margin(o.h2, 2) && o.pk > 25; });
  }
  function windowsFor(s) {   // the four students' windows for a shell
    var Xg = Math.ceil(s.land + 0.3), Yg = Math.ceil((s.pk + 1) / 10) * 10, Yl = Math.max(10, Math.round(s.pk * 0.4 / 10) * 10);
    return { Ama: [-10, 10, -10, 10], Beni: [0, s.tv, 0, Yg], Carly: [0, Xg, 0, Yg], Dev: [0, Xg, 0, Yl] };
  }
  function quadFig(s, win, extraPts) {
    return screen(win, { xv: 't', yv: 'h', fns: [{ f: function (x) { return -5 * x * x + s.b * x + s.c; }, from: 0, to: s.land }], points: extraPts || [] });
  }

  HW.defineLesson({
    id: 'u5l6', unit: 5, num: '6', title: 'Exploring Real-World Relations With a Graphing Calculator', outcome: 'RF1',
    blurb: 'Linear and quadratic models in context: set a window that fits the situation, find intercepts, trace, intersect and the vertex, and state a domain and range that make sense.',
    questions: [
      /* ---------- Q1 jerseys ---------- */
      { num: '1', section: 'Relations in context (linear: 1, 2, 4 · quadratic: 3, 5)', shared: jerseys,
        stem: function (s) { return 'A school team sells custom jerseys. The cost of producing them is modelled by ' + t(s.eq) + ', where ' + t('C') + ' is the total cost in dollars and ' + t('n') + ' is the number of jerseys produced.'; },
        parts: [
          { id: '1a1', sub: 'a-i', level: 'BEG', make: function (r, s) {
            var top = s.m * s.Nmax + s.f, key = [0, s.Nmax, 0, niceUp(top * 1.04)];
            var pts = []; for (var n = 0; n <= s.Nmax; n += s.Nmax <= 50 ? 2 : 4) pts.push({ x: n, y: s.m * n + s.f });
            return winPart({ prompt: 'Graph ' + t(s.eq) + ' on a graphing calculator. The team will produce at most ' + t(s.Nmax) + ' jerseys. Enter a window that shows every point from ' + t('n=0') + ' to ' + t('n=' + s.Nmax) + '.',
              x: [0, s.Nmax], y: [s.f, top], xv: 'n', yv: 'C', xNeg: 'counts jerseys', yNonneg: true, need: 'the points from ' + t('n=0') + ' to ' + t('n=' + s.Nmax) + ' (costs from ' + t(money(s.f)) + ' to ' + t(money(top)) + ')',
              xHi: 'the last jerseys', xHiHow: 'The team can produce up to ' + t(s.Nmax) + ' jerseys, so ' + cd('Xmax') + ' must reach ' + t(s.Nmax) + '.',
              yHi: 'the most expensive orders', yHiHow: 'Trace to ' + t('n=' + s.Nmax) + ' to see the greatest cost, then choose ' + cd('Ymax') + ' at or above it.', yLo: 'the first point, the cost of 0 jerseys (the ' + t('C') + '-intercept)',
              key: key, good: s.Nmax === 60 && s.m === 3 && s.f === 45 ? [[0, 60, 0, 225]] : [[0, s.Nmax, 0, top], [0, s.Nmax + 5, -10, top + 20]], bad: [[-10, 10, -10, 10], [0, s.Nmax / 2, 0, top], [0, s.Nmax, 0, s.f], [-5, s.Nmax, 0, top]],
              sol: 'Jerseys can’t be negative, so ' + cd('Xmin') + ' = 0 and ' + cd('Xmax') + ' = ' + t(s.Nmax) + '. The cost starts at ' + t(money(s.f)) + ' (at ' + t('n=0') + ') and reaches ' + t('C=' + s.m + '(' + s.Nmax + ')+' + s.f + '=' + top) + ' at ' + t('n=' + s.Nmax) + ', so ' + cd('Ymin') + ' = 0 and ' + cd('Ymax') + ' = ' + t(top) + ' or a little more.' + screen(key, { xv: 'n', yv: 'C', points: pts }),
              text: 'window for ' + s.eq });
          } },
          { id: '1a2', sub: 'a-ii', level: 'EMG', make: function (r, s) {
            return mc(r, 'Why does the graph of this relation consist of separate points rather than a continuous line?', [
              { html: 'Only a whole number of jerseys can be produced, so only whole-number values of ' + t('n') + ' make sense.', right: true },
              { html: 'The cost goes up in jumps of ' + t(money(s.m)) + ', so the line has gaps.', why: 'The jumps happen <i>because</i> ' + t('n') + ' jumps from one whole number to the next. Ask yourself: can a team produce ' + t('2.5') + ' jerseys?' },
              { html: 'A graphing calculator can only plot separate points.', why: 'A calculator normally draws a connected line. The points are separate because of what ' + t('n') + ' counts.' },
              { html: 'A cost can’t be a decimal number of dollars.', why: 'Costs like ' + t('\\$46.50') + ' are fine. It’s the <b>input</b>, the number of jerseys, that has to be a whole number.' }],
              'The input ' + t('n') + ' counts jerseys. There is no such thing as producing ' + t('2.5') + ' jerseys, so only ' + t('n=0, 1, 2, \\ldots') + ' make sense: the graph is a set of separate points (the data are <b>discrete</b>).', ['What kind of number is ' + t('n') + '? Could it be ' + t('2.5') + '?'], 'why jersey graph is discrete');
          } },
          { id: '1b1', sub: 'b-i', level: 'EMG', make: function (r, s) {
            return numPart('Determine the ' + t('n') + '-intercept of the graph.', -s.k, 0, [
              { v: s.k, code: 'int-sign', hint: 'Check the sign: ' + t('0=' + s.m + 'n+' + s.f) + ' gives ' + t(s.m + 'n=-' + s.f) + '.' },
              { v: -s.f, code: 'int-no-divide', hint: 'After ' + t(s.m + 'n=-' + s.f) + ', divide both sides by ' + t(s.m) + '.' },
              { v: s.f, code: 'int-gave-y', hint: t(s.f) + ' is the ' + t('C') + '-intercept (the cost when ' + t('n=0') + '). The ' + t('n') + '-intercept is where ' + t('C=0') + '.' }],
              'At the ' + t('n') + '-intercept ' + t('C=0') + ' (calculator: ' + cd('2:zero') + ', after widening the window to the left).<br>' + t('0=' + s.m + 'n+' + s.f + '\\Rightarrow ' + s.m + 'n=-' + s.f + '\\Rightarrow n=-' + s.k) + '.',
              [H_ZERO], 'n-intercept of ' + s.eq);
          } },
          { id: '1b2', sub: 'b-ii', level: 'EMG', make: function (r, s) {
            return mc(r, 'The ' + t('n') + '-intercept is ' + t('-' + s.k) + '. Is it relevant to the graph of this relation?', [
              { html: 'No — it would mean producing ' + t('-' + s.k) + ' jerseys, and a negative number of jerseys can’t be produced.', right: true },
              { html: 'Yes — it is the number of jerseys the team must sell to break even.', why: 'This formula is only the <b>cost</b>; there is no income in it, so it can’t show breaking even. And look at the sign of ' + t('n') + '.' },
              { html: 'Yes — it shows that ' + t(s.k) + ' jerseys can be produced for ' + t('\\$0') + '.', why: 'The intercept is ' + t('n=-' + s.k) + ', not ' + t(s.k) + '. Producing jerseys always costs at least ' + t(money(s.f)) + '.' },
              { html: 'No — intercepts are never relevant in a real situation.', why: 'The ' + t('C') + '-intercept here is very relevant: it is the fixed cost. Decide by what ' + t('n=-' + s.k) + ' would mean.' }],
              t('0=' + s.m + 'n+' + s.f) + ' gives ' + t('n=-' + s.k) + '. That would be ' + t('-' + s.k) + ' jerseys, which can’t happen, so the ' + t('n') + '-intercept is <b>not relevant</b>: the graph starts at ' + t('n=0') + '.', ['What would a negative value of ' + t('n') + ' mean here?'], 'jersey n-intercept relevant?');
          } },
          { id: '1c', sub: 'c', level: 'BEG', make: function (r, s) {
            var C = s.m * s.N + s.f;
            return numPart('What would be the cost of producing ' + t(s.N) + ' jerseys?', C, 2, [
              { v: s.m * s.N, code: 'ctx-no-fee', hint: 'Don’t forget the fixed ' + t(money(s.f)) + ': ' + t('C=' + s.m + '(' + s.N + ')+' + s.f) + '.' },
              { v: (s.m + s.f) * s.N, code: 'ctx-mult', hint: 'Only the ' + t(money(s.m)) + ' per jersey is multiplied by the number of jerseys; the ' + t(money(s.f)) + ' is added once.' }],
              kb('TRACE') + ' to ' + t('X=' + s.N) + ' (or substitute): ' + t('C=' + s.m + '(' + s.N + ')+' + s.f + '=' + (s.m * s.N) + '+' + s.f + '=' + money(C)) + '.', [H_TRACE], 'cost of ' + s.N + ' jerseys, ' + s.eq, { money: true });
          } },
          { id: '1d', sub: 'd', level: 'EMG', make: function (r, s) {
            return numPart('How many jerseys are produced if the total cost is ' + t(money(s.X)) + '?', s.n0, 2, [
              { v: s.X / s.m, code: 'ctx-no-sub', hint: 'First take away the fixed ' + t(money(s.f)) + ': only the rest of the cost comes from the ' + t(money(s.m)) + ' per jersey.' },
              { v: (s.X + s.f) / s.m, code: 'ctx-added', hint: 'Subtract the fixed ' + t(money(s.f)) + ' from both sides (don’t add it).' },
              { v: s.m * s.X + s.f, code: 'ctx-eval', hint: t(F(s.X)) + ' is the <b>cost</b> (the output). Set ' + t(s.m + 'n+' + s.f + '=' + s.X) + ' and solve for ' + t('n') + '.' }],
              'Calculator: ' + t(s.y1) + ', ' + t('Y_2=' + s.X) + ', ' + cd('5:intersect') + ' gives ' + t('(' + s.n0 + ',\\ ' + s.X + ')') + '.<br>Check: ' + t(s.X + '=' + s.m + 'n+' + s.f + '\\Rightarrow ' + s.m + 'n=' + (s.X - s.f) + '\\Rightarrow n=' + s.n0) + ' jerseys.', [H_INT], 'jerseys for cost ' + s.X, { after: 'jerseys' });
          } },
          { id: '1e', sub: 'e', level: 'EMG', make: function (r, s) {
            return mc(r, 'Describe the significance of the ' + t('C') + '-intercept, ' + t(s.f) + '.', [
              { html: 'It is a fixed cost of ' + t(money(s.f)) + ' (such as a setup or design fee) that is charged no matter how many jerseys are produced.', right: true },
              { html: 'Each jersey costs ' + t(money(s.f)) + ' to produce.', why: 'Each jersey adds ' + t(money(s.m)) + ' (the number multiplied by ' + t('n') + '). The ' + t('C') + '-intercept is the cost when ' + t('n=0') + '.' },
              { html: 'The team can produce at most ' + t(s.f) + ' jerseys.', why: 'The ' + t('C') + '-intercept is a value of ' + t('C') + ' — a cost in dollars, not a number of jerseys.' },
              { html: 'It is the cost of producing ' + t(s.f) + ' jerseys.', why: 'At the ' + t('C') + '-intercept ' + t('n=0') + ': no jerseys at all. Producing ' + t(s.f) + ' jerseys costs ' + t(money(s.m * s.f + s.f)) + '.' }],
              'The ' + t('C') + '-intercept is found at ' + t('n=0') + ': ' + t('C=' + s.m + '(0)+' + s.f + '=' + s.f) + '. Even before one jersey is made the team pays ' + t(money(s.f)) + ' — a fixed (setup) cost. Each jersey then adds ' + t(money(s.m)) + '.', ['Find ' + t('C') + ' when ' + t('n=0') + '. What does a cost for zero jerseys represent?'], 'meaning of C-intercept');
          } }] },

      /* ---------- Q2 tea ---------- */
      { num: '2', shared: tea,
        stem: function (s) { return 'For a science experiment, a beaker of tea is poured and left to cool. Its temperature ' + t('T') + ', in degrees Celsius, after ' + t('t') + ' minutes is estimated by ' + t(s.eq) + '.'; },
        parts: [
          { id: '2a', sub: 'a', level: 'EMG', make: function (r, s) {
            var key = winKey([0, s.ti], [0, s.T0]);
            return winPart({ prompt: 'Graph ' + t(s.eq) + ' on a graphing calculator. Enter a window that shows the line from the moment the tea is poured until the model reaches ' + t('0^\\circ\\text{C}') + '.',
              x: [0, s.ti], y: [0, s.T0], xv: 't', yv: 'T', xNeg: 'is time since the tea was poured', yNonneg: true, need: 'the line from ' + t('t=0') + ' (' + t(s.T0 + '^\\circ\\text{C}') + ') down to the ' + t('t') + '-axis',
              xHi: 'the point where the line reaches the ' + t('t') + '-axis', xHiHow: 'Find when ' + t('T=0') + ' (' + cd('2:zero') + ', or solve ' + t('-' + nT(s.rt) + 't+' + s.T0 + '=0') + ') and set ' + cd('Xmax') + ' a little past it.',
              yHi: 'the starting temperature', yHiHow: 'The tea starts at ' + t(s.T0 + '^\\circ\\text{C}') + ' (the ' + t('T') + '-intercept).', yLo: 'the ' + t('t') + '-axis, where the line ends',
              key: key, good: s.rt === 0.5 && s.T0 === 85 ? [[0, 180, -10, 90]] : [[0, Math.ceil(s.ti / 10) * 10, -10, Math.ceil(s.T0 / 10) * 10]], bad: [[-10, 10, -10, 10], [0, s.ti / 2, 0, s.T0 + 5], [0, s.ti + 10, 0, s.T0 - 10], [0, s.ti + 10, 20, s.T0 + 5]],
              sol: 'Time starts at pouring, so ' + cd('Xmin') + ' = 0. The model reaches ' + t('0^\\circ\\text{C}') + ' when ' + t('-' + nT(s.rt) + 't+' + s.T0 + '=0') + ', so ' + t('t=' + s.T0 + '\\div ' + nT(s.rt) + '=' + nT(s.ti)) + ': ' + cd('Xmax') + ' at least ' + t(nT(s.ti)) + '. ' + t('T') + ' falls from ' + t(s.T0) + ' to ' + t('0') + ': ' + cd('Ymin') + ' = 0 (or a little below) and ' + cd('Ymax') + ' at least ' + t(s.T0) + '.' + screen(key, { xv: 't', yv: 'T', fns: [{ f: function (x) { return s.T0 - s.rt * x; }, from: 0, to: s.ti }] }),
              text: 'window for ' + s.eq });
          } },
          { id: '2b', sub: 'b', level: 'BEG', make: function (r, s) {
            return numPart('What was the temperature of the tea at ' + t(s.t1) + ' minutes?', s.T1, 2, [
              { v: s.T0 + s.rt * s.t1, code: 'ctx-sign', hint: 'The tea is cooling: ' + t('-' + nT(s.rt) + '(' + s.t1 + ')') + ' is subtracted from ' + t(s.T0) + '.' },
              { v: s.rt * s.t1, code: 'ctx-change', hint: 'That is how many degrees the tea has <b>dropped</b>. The temperature is ' + t(s.T0) + ' minus that.' }],
              kb('TRACE') + ' to ' + t('X=' + s.t1) + ': ' + t('T=-' + nT(s.rt) + '(' + s.t1 + ')+' + s.T0 + '=' + nT(-s.rt * s.t1) + '+' + s.T0 + '=' + nT(s.T1) + '^\\circ\\text{C}') + '.', [H_TRACE], 'tea temperature at ' + s.t1, { after: '°C' });
          } },
          { id: '2c', sub: 'c', level: 'EMG', make: function (r, s) {
            return numPart('How long did it take for the tea to cool to ' + t(s.Tc + '^\\circ\\text{C}') + '?', s.t2, 2, [
              { v: -s.t2, code: 'ctx-sign', hint: 'A time can’t be negative. Check the signs: ' + t(s.Tc + '-' + s.T0 + '=-' + nT(s.rt) + 't') + ', and both sides are negative.' },
              { v: s.Tc / s.rt, code: 'ctx-no-sub', hint: 'First subtract the starting ' + t(s.T0) + ' from both sides, then divide by ' + t('-' + nT(s.rt)) + '.' },
              { v: s.T0 - s.rt * s.Tc, code: 'ctx-eval', hint: t(s.Tc) + ' is a <b>temperature</b> (the output). Set ' + t('-' + nT(s.rt) + 't+' + s.T0 + '=' + s.Tc) + ' and solve for ' + t('t') + '.' },
              { v: (s.T0 - s.Tc) * s.rt, code: 'ctx-mult', hint: 'Divide by ' + t(nT(s.rt)) + ' — don’t multiply.' }],
              'Calculator: ' + t(s.y1) + ', ' + t('Y_2=' + s.Tc) + ', ' + cd('5:intersect') + ' gives ' + t('(' + s.t2 + ',\\ ' + s.Tc + ')') + '.<br>Check: ' + t(s.Tc + '=-' + nT(s.rt) + 't+' + s.T0 + '\\Rightarrow -' + nT(s.rt) + 't=' + (s.Tc - s.T0) + '\\Rightarrow t=' + s.t2) + ' minutes.', [H_INT], 'time to cool to ' + s.Tc, { after: 'minutes' });
          } },
          { id: '2d1', sub: 'd-i', level: 'EMG', make: function (r, s) {
            return numPart('Determine the ' + t('t') + '-intercept of the graph.', s.ti, 2, [
              { v: s.T0, code: 'int-gave-y', hint: t(s.T0) + ' is the ' + t('T') + '-intercept (the temperature when ' + t('t=0') + '). The ' + t('t') + '-intercept is where ' + t('T=0') + '.' },
              { v: s.T0 * s.rt, code: 'ctx-mult', hint: 'From ' + t(nT(s.rt) + 't=' + s.T0) + ', divide by ' + t(nT(s.rt)) + ' — don’t multiply.' },
              { v: -s.ti, code: 'int-sign', hint: 'Check the sign: ' + t('0=-' + nT(s.rt) + 't+' + s.T0) + ' gives ' + t(nT(s.rt) + 't=' + s.T0) + '.' }],
              cd('2:zero') + ' gives ' + t('t=' + nT(s.ti)) + '. Check: ' + t('0=-' + nT(s.rt) + 't+' + s.T0 + '\\Rightarrow ' + nT(s.rt) + 't=' + s.T0 + '\\Rightarrow t=' + nT(s.ti)) + '.', [H_ZERO], 't-intercept of ' + s.eq, { after: 'minutes' });
          } },
          { id: '2d2', sub: 'd-ii', level: 'PRG', make: function (r, s) {
            return mc(r, 'The ' + t('t') + '-intercept is ' + t(nT(s.ti)) + '. Describe its significance in this question.', [
              { html: 'It is when the model predicts the tea reaches ' + t('0^\\circ\\text{C}') + '. Real tea levels off near room temperature, so the straight-line model stops being realistic well before ' + t('t=' + nT(s.ti)) + '.', right: true },
              { html: 'It is when the tea reaches room temperature.', why: 'At the ' + t('t') + '-intercept ' + t('T=0') + ': ' + t('0^\\circ\\text{C}') + ', the freezing point — far below room temperature.' },
              { html: 'It is the temperature of the tea when it was poured.', why: 'That is the ' + t('T') + '-intercept (where ' + t('t=0') + '), ' + t(s.T0 + '^\\circ\\text{C}') + '.' },
              { html: 'It is when the tea has finished cooling, and the model is accurate right up to that time.', why: 'Tea on a desk can’t cool below the temperature of the room, so the model can’t be trusted all the way down to ' + t('0^\\circ\\text{C}') + '.' }],
              'At the ' + t('t') + '-intercept ' + t('T=0') + ': the model says the tea is at ' + t('0^\\circ\\text{C}') + ' after ' + t(nT(s.ti)) + ' minutes. That can’t really happen in a warm room — the tea levels off at room temperature — so the line is only realistic for the first part of the cooling.', ['What is the value of ' + t('T') + ' at a ' + t('t') + '-intercept? Can tea on a desk get that cold?'], 'meaning of tea t-intercept');
          } },
          { id: '2e', sub: 'e', level: 'EMG', make: function (r, s) {
            return mc(r, 'Describe the relation in words.', [
              { html: 'The tea starts at ' + t(s.T0 + '^\\circ\\text{C}') + ' and cools at a constant rate of ' + t(nT(s.rt) + '^\\circ\\text{C}') + ' per minute.', right: true },
              { html: 'The tea starts at ' + t(nT(s.rt) + '^\\circ\\text{C}') + ' and warms by ' + t(s.T0 + '^\\circ\\text{C}') + ' per minute.', why: 'The constant term ' + t(s.T0) + ' is the starting value (at ' + t('t=0') + '); the number multiplied by ' + t('t') + ' is the change per minute.' },
              { html: 'The tea starts at ' + t(s.T0 + '^\\circ\\text{C}') + ' and its temperature is cut in half every minute.', why: t('-' + nT(s.rt) + 't') + ' <b>subtracts</b> ' + t(nT(s.rt)) + ' degrees for each minute — the same drop every minute, not a halving.' },
              { html: 'The tea starts at ' + t(s.T0 + '^\\circ\\text{C}') + ' and cools faster and faster.', why: 'The graph is a straight line, so the rate is constant: ' + t(nT(s.rt) + '^\\circ\\text{C}') + ' every minute.' }],
              'In ' + t(s.eq) + ' the constant ' + t(s.T0) + ' is the temperature at ' + t('t=0') + ' and ' + t('-' + nT(s.rt)) + ' is the change per minute. So the tea is poured at ' + t(s.T0 + '^\\circ\\text{C}') + ' and its temperature drops at a constant ' + t(nT(s.rt) + '^\\circ\\text{C}') + ' per minute.', ['Which number is the value at ' + t('t=0') + '? Which is the change for each minute?'], 'describe ' + s.eq);
          } }] },

      /* ---------- Q3 shuttlecock ---------- */
      { num: '3', shared: shuttle,
        stem: function (s) { return 'During a badminton practice, a player strikes a shuttlecock. Its height above the court is modelled by ' + t(s.eq) + ', where ' + t('t') + ' is the time in seconds since contact and ' + t('h') + ' is the height in metres.'; },
        parts: [
          { id: '3a', sub: 'a', level: 'EMG', make: function (r, s) {
            var key = winKey([0, s.land], [0, s.hm]);
            return winPart({ prompt: 'Graph the relation on a graphing calculator. Enter a window that shows the whole flight: from contact, through the highest point, to the landing.',
              x: [0, s.land], y: [0, s.hm], xv: 't', yv: 'h', xNeg: 'is time since contact', yNonneg: true, need: 'the whole flight from contact to landing, including the highest point',
              xHi: 'the landing', xHiHow: 'The curve must come back down to ' + t('h=0') + ' on the screen: find that time with ' + cd('2:zero') + ' and set ' + cd('Xmax') + ' a little past it.',
              yHi: 'the top of the flight', yHiHow: 'Find the greatest height with ' + cd('4:maximum') + ' and set ' + cd('Ymax') + ' above it.', yLo: 'the court (' + t('h=0') + '), where the shuttlecock lands',
              key: key, good: s.b === 16 && s.c === 2 ? [[0, 3.5, 0, 16]] : [[0, Math.ceil(s.land), 0, Math.ceil(s.hm + 1)]], bad: [[-10, 10, -10, 10], [0, s.tv, 0, s.hm + 2], [0, s.land + 1, 0, s.hm / 2]],
              sol: 'Time starts at contact: ' + cd('Xmin') + ' = 0. ' + cd('2:zero') + ' gives the landing at ' + t('t\\approx ' + rT(s.land, 2)) + ' and ' + cd('4:maximum') + ' gives the top at ' + t('h=' + nT(s.hm)) + '. So ' + cd('Xmax') + ' a little more than ' + t(rT(s.land, 2)) + ', ' + cd('Ymin') + ' = 0 and ' + cd('Ymax') + ' a little more than ' + t(nT(s.hm)) + '.' + quadFig(s, key, [{ x: s.tv, y: s.hm }]),
              text: 'window for ' + s.eq });
          } },
          { id: '3b', sub: 'b', level: 'LIM', make: function (r, s) {
            return numPart('What was the height of the shuttlecock above the court at the moment of contact?', s.c, 2, [
              { v: 0, code: 'ctx-zero-start', hint: 'At contact ' + t('t=0') + ' — but the racket hits the shuttlecock above the court. Substitute ' + t('t=0') + '.' },
              { v: s.b, code: 'ctx-coef', hint: 'Substitute ' + t('t=0') + ': every term with ' + t('t') + ' becomes ' + t('0') + '.' }],
              'At contact ' + t('t=0') + ': ' + t('h=-5(0)^{2}+' + s.b + '(0)+' + nT(s.c) + '=' + nT(s.c)) + ' m — the ' + t('h') + '-intercept.', ['Contact is the start: ' + t('t=0') + '.'], 'height at contact ' + s.eq, { after: 'm' });
          } },
          { id: '3c', sub: 'c', level: 'BEG', make: function (r, s) {
            return numPart('What was the height of the shuttlecock above the court ' + t(nT(s.t1)) + ' second' + (s.t1 === 1 ? '' : 's') + ' after contact?', s.h1, 2, [
              { v: 5 * s.t1 * s.t1 + s.b * s.t1 + s.c, code: 'ctx-sign-sq', hint: 'Keep the minus sign: ' + t('-5(' + nT(s.t1) + ')^{2}=' + nT(-5 * s.t1 * s.t1)) + '.' },
              { v: -5 * s.t1 * s.t1 + s.b * s.t1, code: 'ctx-no-c', hint: 'Don’t forget the ' + t('+' + nT(s.c)) + ' at the end.' },
              { v: -25 * s.t1 * s.t1 + s.b * s.t1 + s.c, code: 'ctx-sign-sq', hint: 'Square ' + t('t') + ' first, then multiply by ' + t('-5') + ': ' + t('-5(' + nT(s.t1) + ')^{2}') + ', not ' + t('(-5\\times ' + nT(s.t1) + ')^{2}') + '.' }],
              kb('TRACE') + ' to ' + t('X=' + nT(s.t1)) + ': ' + t('h=-5(' + nT(s.t1) + ')^{2}+' + s.b + '(' + nT(s.t1) + ')+' + nT(s.c) + '=' + nT(-5 * s.t1 * s.t1) + '+' + nT(s.b * s.t1) + '+' + nT(s.c) + '=' + nT(s.h1)) + ' m.', [H_TRACE], 'height at t=' + s.t1, { after: 'm' });
          } },
          { id: '3d', sub: 'd', level: 'EMG', make: function (r, s) {
            return numPart('What is the maximum height the shuttlecock reaches?', s.hm, 2, [
              { v: s.tv, code: 'ctx-max-time', hint: t(nT(s.tv)) + ' is <b>when</b> the maximum happens (the ' + t('t') + '-coordinate). The height is the other coordinate of the vertex.' },
              { v: s.hm - s.c, code: 'ctx-no-c', hint: 'Include the starting ' + t(nT(s.c)) + ' m: substitute the vertex time into the whole formula.' },
              { v: s.b, code: 'ctx-coef', hint: t(s.b) + ' is a coefficient in the formula, not a height. Use ' + cd('4:maximum') + '.' }],
              cd('4:maximum') + ' gives ' + t('(' + nT(s.tv) + ',\\ ' + nT(s.hm) + ')') + '.<br>Check: ' + t('t=-\\frac{' + s.b + '}{2(-5)}=' + nT(s.tv)) + ', ' + t('h=-5(' + nT(s.tv) + ')^{2}+' + s.b + '(' + nT(s.tv) + ')+' + nT(s.c) + '=' + nT(s.hm)) + ' m.', [H_MAX, H_VERT], 'max height ' + s.eq, { after: 'm' });
          } },
          { id: '3e', sub: 'e', level: 'BEG', make: function (r, s) {
            return numPart('How many seconds after contact does the shuttlecock reach its maximum height?', s.tv, 2, [
              { v: s.hm, code: 'ctx-gave-h', hint: t(nT(s.hm)) + ' is the greatest <b>height</b>. The question asks <b>when</b> — the ' + t('t') + '-coordinate of the vertex.' },
              { v: s.land / 2, code: 'ctx-half-land', hint: 'The shuttlecock starts ' + t(nT(s.c)) + ' m up, so the top is <i>not</i> halfway to the landing time. Use ' + cd('4:maximum') + '.' }],
              'The ' + t('t') + '-coordinate of the vertex from ' + cd('4:maximum') + ': ' + t('t=' + nT(s.tv)) + ' s. Check: ' + t('t=-\\frac{b}{2a}=-\\frac{' + s.b + '}{2(-5)}=' + nT(s.tv)) + '.', [H_MAX], 'time of max ' + s.eq, { after: 's' });
          } },
          { id: '3f', sub: 'f', level: 'EMG', make: function (r, s) {
            return numPart('To the nearest hundredth of a second, how long does it take for the shuttlecock to land on the court?', s.land, 2, [
              { v: s.neg, code: 'ctx-neg-time', hint: 'That zero is at a negative time — before the shuttlecock was hit. Use the crossing on the right.' },
              { v: s.tv, code: 'ctx-max-time', hint: 'That is the time of the highest point. Landing means ' + t('h=0') + '.' },
              { v: 2 * s.tv, code: 'ctx-double-vertex', hint: 'At ' + t('t=' + nT(2 * s.tv)) + ' the shuttlecock is back at its starting height, ' + t(nT(s.c)) + ' m — it still has to fall to the court. Use ' + cd('2:zero') + '.' }],
              'Landing means ' + t('h=0') + ': ' + cd('2:zero') + ' on the right-hand crossing gives ' + t('t\\approx ' + rd(s.land, 4)) + ', so ' + t('t\\approx ' + rT(s.land, 2)) + ' s.<br>Check: ' + t('h(' + rT(s.land, 2) + ')=-5(' + rT(s.land, 2) + ')^{2}+' + s.b + '(' + rT(s.land, 2) + ')+' + nT(s.c) + '\\approx ' + rT(-5 * Math.pow(rd(s.land, 2), 2) + s.b * rd(s.land, 2) + s.c, 2) + '\\approx 0') + ' ✓ (the other zero, ' + t(rT(s.neg, 2)) + ', is before contact).', [H_ZERO, 'Use the zero on the right: the one at a negative time is before the shuttlecock was hit.'], 'landing time ' + s.eq, { after: 's' });
          } }] },

      /* ---------- Q4 charity ---------- */
      { num: '4', shared: charity,
        stem: function (s) { return 'A charity is planning a benefit dinner-dance. Tickets sell for ' + t(money(s.p)) + ' each and the expenses total ' + t(money(s.E)) + ', so the profit is ' + t(s.eq) + ', where ' + t('P') + ' is the profit in dollars and ' + t('n') + ' is the number of tickets sold. The venue holds at most ' + t(s.cap) + ' guests.'; },
        parts: [
          { id: '4a', sub: 'a', level: 'EMG', make: function (r, s) {
            var key = winKey([0, s.cap], [-s.E, s.top]); key[1] = s.cap;
            return winPart({ prompt: 'Graph the relation on a graphing calculator. Enter a window that shows the profit for every possible number of tickets, from ' + t('0') + ' up to a full venue.',
              x: [0, s.cap], y: [-s.E, s.top], xv: 'n', yv: 'P', xNeg: 'counts tickets', yNonneg: false, need: 'the profits from ' + t('n=0') + ' (a loss of ' + t(money(s.E)) + ') to a full venue, ' + t('n=' + s.cap),
              xHi: 'the larger ticket sales', xHiHow: 'The venue holds ' + t(s.cap) + ' guests, so ' + cd('Xmax') + ' must reach ' + t(s.cap) + '.',
              yHi: 'the biggest profits', yHiHow: 'Trace to ' + t('n=' + s.cap) + ' for the greatest profit and set ' + cd('Ymax') + ' at or above it.', yLo: 'the losses: with few tickets sold the profit is negative, down to ' + t(money(-s.E)) + ' at ' + t('n=0'),
              key: key, good: s.p === 10 && s.E === 650 && s.cap === 300 ? [[0, 300, -700, 2400]] : [[0, s.cap, -s.E, s.top]], bad: [[-10, 10, -10, 10], [0, s.cap, 0, s.top + 100], [0, s.cap / 2, -s.E - 50, s.top + 50]],
              sol: 'Tickets can’t be negative: ' + cd('Xmin') + ' = 0, and the venue caps sales at ' + cd('Xmax') + ' = ' + t(s.cap) + '. At ' + t('n=0') + ' the profit is ' + t(money(-s.E)) + ' (a loss), and at ' + t('n=' + s.cap) + ' it is ' + t(s.p + '(' + s.cap + ')-' + s.E + '=' + s.top) + '. So ' + cd('Ymin') + ' at most ' + t(-s.E) + ' and ' + cd('Ymax') + ' at least ' + t(F(s.top)) + '.' + screen([key[0], key[1], key[2], key[3]], { xv: 'n', yv: 'P', fns: [{ f: function (x) { return s.p * x - s.E; }, from: 0, to: s.cap }] }),
              text: 'window for ' + s.eq });
          } },
          { id: '4b', sub: 'b', level: 'EMG', make: function (r, s) {
            return numPart('How many tickets need to be sold to break even?', s.k, 2, [
              { v: -s.k, code: 'int-sign', hint: 'A number of tickets can’t be negative: ' + t('0=' + s.p + 'n-' + s.E) + ' gives ' + t(s.p + 'n=' + s.E) + '.' },
              { v: s.E, code: 'ctx-gave-cost', hint: t(money(s.E)) + ' is the expenses. Break even means ' + t('P=0') + ': how many ' + t(money(s.p)) + ' tickets cover the expenses?' },
              { v: -s.E, code: 'int-gave-y', hint: t(-s.E) + ' is the ' + t('P') + '-intercept (the profit if no tickets are sold). Break even is where ' + t('P=0') + '.' }],
              'Break even means ' + t('P=0') + ' (' + cd('2:zero') + '): ' + t('0=' + s.p + 'n-' + s.E + '\\Rightarrow ' + s.p + 'n=' + s.E + '\\Rightarrow n=' + s.k) + ' tickets.', ['Break even means no profit and no loss: ' + t('P=0') + '.', H_ZERO], 'break even ' + s.eq, { after: 'tickets' });
          } },
          { id: '4c', sub: 'c', level: 'EMG', make: function (r, s) {
            return numPart('How many tickets need to be sold to earn a ' + t(money(s.Pt)) + ' profit?', s.n3, 2, [
              { v: s.Pt / s.p, code: 'ctx-no-sub', hint: 'The tickets must also pay the ' + t(money(s.E)) + ' expenses: ' + t(s.Pt + '=' + s.p + 'n-' + s.E) + '.' },
              { v: (s.Pt - s.E) / s.p, code: 'ctx-added', hint: 'Add ' + t(s.E) + ' to both sides (don’t subtract it): ' + t(s.p + 'n=' + s.Pt + '+' + s.E) + '.' },
              { v: s.p * s.Pt - s.E, code: 'ctx-eval', hint: t(money(s.Pt)) + ' is a <b>profit</b> (the output). Set ' + t(s.p + 'n-' + s.E + '=' + s.Pt) + ' and solve for ' + t('n') + '.' }],
              'Calculator: ' + t(s.y1) + ', ' + t('Y_2=' + s.Pt) + ', ' + cd('5:intersect') + ' gives ' + t('(' + s.n3 + ',\\ ' + s.Pt + ')') + '.<br>Check: ' + t(s.Pt + '=' + s.p + 'n-' + s.E + '\\Rightarrow ' + s.p + 'n=' + (s.Pt + s.E) + '\\Rightarrow n=' + s.n3) + ' tickets.', [H_INT], 'tickets for profit ' + s.Pt, { after: 'tickets' });
          } },
          { id: '4d', sub: 'd', level: 'BEG', make: function (r, s) {
            return numPart('What profit is earned if ' + t(s.N4) + ' tickets are sold?', s.P4, 2, [
              { v: s.p * s.N4, code: 'ctx-revenue', hint: 'That is the ticket money (revenue). Profit is what’s left after the ' + t(money(s.E)) + ' expenses.' },
              { v: s.p * s.N4 + s.E, code: 'ctx-added', hint: 'Expenses are <b>subtracted</b>: ' + t('P=' + s.p + '(' + s.N4 + ')-' + s.E) + '.' }],
              kb('TRACE') + ' to ' + t('X=' + s.N4) + ': ' + t('P=' + s.p + '(' + s.N4 + ')-' + s.E + '=' + (s.p * s.N4) + '-' + s.E + '=' + money(s.P4)) + '.', [H_TRACE], 'profit for ' + s.N4 + ' tickets', { money: true });
          } },
          { id: '4e1', sub: 'e-i', level: 'PRG', outcome: 'RF2', make: function (r, s) {
            var tg = setT('n', 0, s.cap, 'W');
            return setPart('State the domain of this relation. (Tickets are counted in whole numbers.)', tg, { v: 'n', wrong: [
              { is: '[0, ' + s.cap + ']', code: 'ctx-not-whole', hint: 'Tickets come in whole numbers, so ' + t('n') + ' can’t be ' + t('12.5') + '. Finish the set notation with ' + t('n\\in W') + ', e.g. ' + t('\\{n\\mid 0\\le n\\le\\ldots,\\ n\\in W\\}') + '.' },
              { is: setT('n', s.k, s.cap, 'W'), code: 'ctx-dom-breakeven', hint: 'Selling fewer than ' + t(s.k) + ' tickets is possible — it just gives a loss. The domain starts at ' + t('0') + ' tickets.' },
              { is: '[' + s.k + ', ' + s.cap + ']', code: 'ctx-dom-breakeven', hint: 'Selling fewer than ' + t(s.k) + ' tickets is possible — it just gives a loss. Also, tickets are whole numbers: use ' + t('n\\in W') + '.' }] },
              t('n') + ' counts tickets, so it is a whole number from ' + t('0') + ' up to the venue’s ' + t(s.cap) + ': ' + t('D=' + tg) + '.', ['What is the fewest tickets that could be sold? The most?', 'Tickets are whole numbers: end with ' + t('n\\in W') + '.'], 'domain charity n≤' + s.cap);
          } },
          { id: '4e2', sub: 'e-ii', level: 'EMG', outcome: 'RF2', make: function (r, s) {
            var lo = -s.E, hi = s.top;
            return mc(r, 'Which is the range of this relation?', [
              { html: t('\\{' + lo + ',\\ ' + (lo + s.p) + ',\\ ' + (lo + 2 * s.p) + ',\\ \\ldots,\\ ' + F(hi) + '\\}'), right: true },
              { html: t('\\{P\\mid ' + lo + '\\le P\\le ' + F(hi) + ',\\ P\\in\\mathbb{R}\\}'), why: 'The profit changes ' + t(money(s.p)) + ' at a time (one ticket at a time), so values in between, like ' + t(lo + 1) + ', can’t happen. List the values.' },
              { html: t('\\{0,\\ ' + s.p + ',\\ ' + (2 * s.p) + ',\\ \\ldots,\\ ' + F(s.p * s.cap) + '\\}'), why: 'That is the ticket money, ' + t(s.p + 'n') + '. The profit also subtracts the ' + t(money(s.E)) + ' expenses.' },
              { html: t('\\{P\\mid 0\\le P\\le ' + F(hi) + ',\\ P\\in\\mathbb{R}\\}'), why: 'With fewer than ' + t(s.k) + ' tickets sold the profit is negative (a loss), and that can happen. Also the profit only changes in steps of ' + t(money(s.p)) + '.' }],
              'Each ticket adds exactly ' + t(money(s.p)) + ', so ' + t('P') + ' climbs in steps of ' + t(s.p) + ' from ' + t(s.p + '(0)-' + s.E + '=' + lo) + ' to ' + t(s.p + '(' + s.cap + ')-' + s.E + '=' + F(hi)) + ': ' + t('R=\\{' + lo + ',\\ ' + (lo + s.p) + ',\\ \\ldots,\\ ' + F(hi) + '\\}') + '.', ['Find the profit for the fewest and the most tickets. Can the profit take values in between those steps?'], 'range charity');
          } }] },

      /* ---------- Q5 soccer ---------- */
      { num: '5', shared: soccer,
        stem: function (s) { return 'A soccer player takes a shot on goal. The height of the ball above the field is modelled by ' + t(s.eq) + ', where ' + t('h') + ' is the height in metres and ' + t('d') + ' is the horizontal distance in metres the ball has travelled.'; },
        parts: [
          { id: '5a', sub: 'a', level: 'EMG', make: function (r, s) {
            var key = winKey([0, s.L], [0, s.hm]);
            return winPart({ prompt: 'Graph the relation on a graphing calculator. Enter a window that shows the whole shot, from the kick until the ball comes back down to the field.',
              x: [0, s.L], y: [0, s.hm], xv: 'd', yv: 'h', xNeg: 'is the distance the ball has travelled', yNonneg: true, need: 'the whole shot, from the kick to where the ball comes down, including its highest point',
              xHi: 'where the ball comes back down', xHiHow: 'Find the other ' + t('d') + '-intercept (' + cd('2:zero') + ') and set ' + cd('Xmax') + ' at or past it.',
              yHi: 'the top of the shot', yHiHow: 'Find the greatest height with ' + cd('4:maximum') + '.', yLo: 'the field (' + t('h=0') + ')',
              key: key, good: s.k === 0.04 && s.L === 36 ? [[0, 40, 0, 15]] : [[0, s.L, 0, Math.ceil(s.hm)]], bad: [[-10, 10, -10, 10], [0, s.L / 2, 0, s.hm + 1], [0, s.L + 2, 0, s.hm / 2]],
              sol: 'The ball is kicked at ' + t('d=0') + ' and lands at the other zero, ' + t('d=' + s.L) + '; ' + cd('4:maximum') + ' gives the top, ' + t('h=' + nT(s.hm)) + ' m. So ' + cd('Xmin') + ' = 0, ' + cd('Xmax') + ' at least ' + t(s.L) + ', ' + cd('Ymin') + ' = 0 and ' + cd('Ymax') + ' a little more than ' + t(nT(s.hm)) + '.' + screen(key, { xv: 'd', yv: 'h', fns: [{ f: s.h, from: 0, to: s.L }], points: [{ x: s.dv, y: s.hm }] }),
              text: 'window for ' + s.eq });
          } },
          { id: '5b', sub: 'b', level: 'LIM', make: function (r, s) {
            return numPart('What is the height from which the ball is kicked?', 0, 2, [{ v: s.L, code: 'ctx-coef', hint: 'Substitute ' + t('d=0') + ' (the kick): both terms in the bracket become ' + t('0') + '.' }, { v: s.k, code: 'ctx-coef', hint: 'Substitute ' + t('d=0') + ' (the kick) into the whole formula.' }],
              'At the kick ' + t('d=0') + ': ' + t('h=' + nT(s.k) + '(-(0)^{2}+' + s.L + '(0))=0') + ' m — the ball is kicked from the ground.', ['The kick happens at ' + t('d=0') + '.'], 'kick height ' + s.eq, { after: 'm' });
          } },
          { id: '5c', sub: 'c', level: 'EMG', make: function (r, s) {
            return numPart('What is the maximum height the ball reaches?', s.hm, 2, [
              { v: s.dv, code: 'ctx-max-time', hint: t(s.dv) + ' m is <b>where</b> the maximum happens (the ' + t('d') + '-coordinate). The height is the other coordinate.' },
              { v: s.dv * s.dv, code: 'ctx-no-k', hint: 'Multiply by the ' + t(nT(s.k)) + ' in front of the bracket too.' }],
              t(s.y1) + ', ' + cd('4:maximum') + ' gives ' + t('(' + s.dv + ',\\ ' + nT(s.hm) + ')') + '.<br>Check: ' + t('h=' + nT(s.k) + '(-' + s.dv + '^{2}+' + s.L + '(' + s.dv + '))=' + nT(s.k) + '(' + (s.dv * s.dv) + ')=' + nT(s.hm)) + ' m.', [H_MAX], 'max height ' + s.eq, { after: 'm' });
          } },
          { id: '5d', sub: 'd', level: 'BEG', make: function (r, s) {
            return numPart('At what horizontal distance does the ball reach its maximum height?', s.dv, 2, [
              { v: s.hm, code: 'ctx-gave-h', hint: t(nT(s.hm)) + ' m is the greatest <b>height</b>. The question asks for the horizontal distance, the ' + t('d') + '-coordinate of the vertex.' },
              { v: s.L, code: 'ctx-gave-end', hint: 'At ' + t('d=' + s.L) + ' the ball is back on the ground. The top is halfway between the two ' + t('d') + '-intercepts.' }],
              'The ' + t('d') + '-coordinate of the vertex: ' + t('d=' + s.dv) + ' m (halfway between the zeros ' + t('0') + ' and ' + t(s.L) + ').', [H_MAX], 'distance of max ' + s.eq, { after: 'm' });
          } },
          { id: '5e', sub: 'e', level: 'BEG', make: function (r, s) {
            return numPart('A defender heads the ball after it has travelled ' + t(s.d1) + ' m. What is the height of the ball at that point?', s.h1, 2, [
              { v: s.k * (s.d1 * s.d1 + s.L * s.d1), code: 'ctx-sign-sq', hint: 'Keep the minus sign: ' + t('-(' + s.d1 + ')^{2}=-' + s.d1 * s.d1) + '.' },
              { v: -s.d1 * s.d1 + s.L * s.d1, code: 'ctx-no-k', hint: 'Multiply the bracket by ' + t(nT(s.k)) + '.' }],
              kb('TRACE') + ' to ' + t('X=' + s.d1) + ': ' + t('h=' + nT(s.k) + '(-(' + s.d1 + ')^{2}+' + s.L + '(' + s.d1 + '))=' + nT(s.k) + '(' + (-s.d1 * s.d1) + '+' + (s.L * s.d1) + ')=' + nT(s.k) + '(' + (s.L * s.d1 - s.d1 * s.d1) + ')=' + nT(s.h1)) + ' m.', [H_TRACE], 'height at d=' + s.d1, { after: 'm' });
          } },
          { id: '5f', sub: 'f', level: 'BEG', make: function (r, s) {
            return numPart('How high is the ball when it has travelled ' + t(s.d2) + ' m?', s.h2, 2, [
              { v: s.k * (s.d2 * s.d2 + s.L * s.d2), code: 'ctx-sign-sq', hint: 'Keep the minus sign: ' + t('-(' + s.d2 + ')^{2}=-' + s.d2 * s.d2) + '.' },
              { v: -s.d2 * s.d2 + s.L * s.d2, code: 'ctx-no-k', hint: 'Multiply the bracket by ' + t(nT(s.k)) + '.' }],
              t('h=' + nT(s.k) + '(-(' + s.d2 + ')^{2}+' + s.L + '(' + s.d2 + '))=' + nT(s.k) + '(' + (-s.d2 * s.d2) + '+' + (s.L * s.d2) + ')=' + nT(s.k) + '(' + (s.L * s.d2 - s.d2 * s.d2) + ')=' + nT(s.h2)) + ' m (or ' + kb('TRACE') + ' to ' + t('X=' + s.d2) + ').', [H_TRACE], 'height at d=' + s.d2, { after: 'm' });
          } },
          { id: '5g1', sub: 'g-i', level: 'PRG', outcome: 'RF2', make: function (r, s) {
            var tg = setT('d', 0, s.L), rg = setT('h', 0, s.hm);
            return setPart('State the domain of this relation.', tg, { v: 'd', other: rg, otherName: 'range', wrong: [
              { is: setT('d', 0, s.dv), code: 'ctx-dom-vertex', hint: 'The shot doesn’t stop at its highest point — the ball comes back down to the field. Where is ' + t('h=0') + ' again?' },
              { is: 'd\\ge 0', code: 'ctx-dom-open', hint: 'The relation only describes the ball while it is in the air: it stops where the ball comes back down (' + t('h=0') + ').' },
              { is: 'd\\in\\mathbb{R}', code: 'ctx-dom-open', hint: 'Negative distances and distances after the ball lands don’t fit the situation. Start at the kick and stop at the landing.' }] },
              'The ball returns to the field when ' + t('h=0') + ': ' + t('d(-' + nT(s.k) + 'd+' + nT(s.k * s.L) + ')=0') + ', so ' + t('d=0') + ' or ' + t('d=' + s.L) + ' (' + cd('2:zero') + '). The shot spans ' + t(s.L) + ' m: ' + t('D=' + tg) + '.', H_DOM, 'domain ' + s.eq);
          } },
          { id: '5g2', sub: 'g-ii', level: 'PRG', outcome: 'RF2', make: function (r, s) {
            var tg = setT('h', 0, s.hm), dg = setT('d', 0, s.L);
            return setPart('State the range of this relation.', tg, { v: 'h', other: dg, otherName: 'domain', wrong: [
              { is: setT('h', 0, s.dv), code: 'ctx-rng-vertex-x', hint: t(s.dv) + ' is the <b>distance</b> of the highest point. The range is about heights: up to the greatest height.' },
              { is: 'h\\ge 0', code: 'ctx-rng-open', hint: 'The ball doesn’t go up forever: the greatest height is at the vertex.' },
              { is: 'h\\le ' + pT(s.hm), code: 'ctx-rng-open', hint: 'The ball never goes below the field, so the least height is ' + t('0') + '.' }] },
              'The heights run from ' + t('0') + ' (on the field) up to the vertex height ' + t(nT(s.hm)) + ' m: ' + t('R=' + tg) + '.', H_DOM, 'range ' + s.eq);
          } }] },

      /* ---------- Q6–8 diploma style ---------- */
      { num: '6', section: 'Diploma-style questions', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '6', level: 'PRG', outcome: 'RF2', make: function (r) {
          var o = pickWhere(function () { return [r.pick([8000, 9000, 10000, 12000, 15000, 18000]), r.pick([1000, 1200, 1500, 2000, 2500, 3000])]; }, function (o) { var y = o[0] / o[1]; return isDp(y, 0) && y >= 4 && y <= 12; });
          var V0 = o[0], R = o[1], Y = V0 / R;
          return mc(r, 'The value of a snowmobile is modelled by ' + t('V=' + F(V0) + '-' + F(R) + 't') + ', where ' + t('V') + ' is the value in dollars and ' + t('t') + ' is its age in years. The most appropriate domain is', [
            { html: t('\\{t\\mid t\\in\\mathbb{R}\\}'), why: 'Negative ages, and ages after the value reaches ' + t('\\$0') + ', don’t make sense here.' },
            { html: t('\\{t\\mid 0\\le t\\le ' + Y + ',\\ t\\in\\mathbb{R}\\}'), right: true },
            { html: t('\\{t\\mid 0\\le t\\le ' + F(V0) + ',\\ t\\in\\mathbb{R}\\}'), why: t(F(V0)) + ' is the starting <b>value</b> in dollars — that belongs to the range, not to the age.' },
            { html: t('\\{t\\mid t\\ge 0,\\ t\\in W\\}'), why: 'Age can be any number of years (like ' + t('2.5') + '), not just whole years — and after ' + t(Y) + ' years the formula gives a negative value.' }],
            'The value reaches ' + t('0') + ' when ' + t(F(R) + 't=' + F(V0)) + ', so ' + t('t=' + Y) + '. The age can be any value from ' + t('0') + ' to ' + t(Y) + ' years: ' + t('\\{t\\mid 0\\le t\\le ' + Y + ',\\ t\\in\\mathbb{R}\\}') + '.', ['When is the snowmobile worth ' + t('\\$0') + '? Can the age be a decimal?'], 'snowmobile domain', true);
        } }] },
      { num: '7', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '7', level: 'EMG', make: function (r) {
          var o = pickWhere(function () { var tv = r.pick([1, 1.5, 2, 2.5, 3]), c = r.pick([1.2, 1.5, 1.8, 2, 2.4]); return { tv: tv, c: c, b: cl(9.8 * tv), hm: 4.9 * tv * tv + c }; },
            function (o) { var vals = [rd(o.tv, 1), rd(o.b, 1), rd(o.hm, 1), rd(o.b * o.tv + o.c, 1)]; return margin(o.hm, 1) && vals.every(function (v, i) { return vals.indexOf(v) === i; }); });
          var opts = [
            { v: rd(o.tv, 1), why: t(rd(o.tv, 1).toFixed(1)) + ' is the <b>time</b> of the maximum (the ' + t('t') + '-coordinate). The height is the other coordinate.' },
            { v: rd(o.b, 1), why: t(nT(o.b)) + ' is the coefficient of ' + t('t') + ' in the formula, not a height. Use ' + cd('4:maximum') + '.' },
            { v: rd(o.hm, 1), right: true },
            { v: rd(o.b * o.tv + o.c, 1), why: 'Include the ' + t('-4.9t^{2}') + ' term when you substitute the vertex time: ' + t('-4.9(' + nT(o.tv) + ')^{2}') + '.' }].sort(function (a, b) { return a.v - b.v; });
          return mc(r, 'A ball’s height, ' + t('h') + ' metres, after ' + t('t') + ' seconds is ' + t('h=' + quadT(-4.9, o.b, o.c, 't')) + '. Using the maximum feature of a graphing calculator, the greatest height of the ball, to the nearest tenth of a metre, is',
            opts.map(function (x) { return { html: t(x.v.toFixed(1)) + ' m', right: !!x.right, why: x.why }; }),
            cd('4:maximum') + ' gives ' + t('t\\approx ' + nT(o.tv)) + ', ' + t('h\\approx ' + rd(o.hm, 1).toFixed(1)) + '.<br>Check: ' + t('-4.9(' + nT(o.tv) + ')^{2}+' + nT(o.b) + '(' + nT(o.tv) + ')+' + nT(o.c) + '=' + nT(-4.9 * o.tv * o.tv) + '+' + nT(o.b * o.tv) + '+' + nT(o.c) + '\\approx ' + rd(o.hm, 1).toFixed(1)) + ' m.', [H_MAX], 'max height ' + quadT(-4.9, o.b, o.c, 't'), true);
        } }] },
      { num: '8', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '8', level: 'EMG', make: function (r) {
          var o = pickWhere(function () { var rt = r.pick([0.05, 0.1, 0.15, 0.2, 0.25]), b = r.pick([15, 20, 25, 30, 35]), m = 5 * r.int(12, 80); return { rt: rt, b: b, m: m, C: cl(b + rt * m) }; }, function (o) { return isDp(o.C, 2) && o.m * o.rt >= 10; });
          var p = B.nr('A phone plan costs ' + t('C=' + nT(o.rt) + 'm+' + o.b) + ' dollars per month, where ' + t('m') + ' is the number of minutes of calls. Using the intersect feature, the number of minutes that gives a monthly bill of ' + t(money(o.C)) + ' is ________.', o.m, near([
            { v: o.C / o.rt, code: 'ctx-no-sub', hint: 'Take away the ' + t(money(o.b)) + ' base fee first: only the rest of the bill comes from minutes.' },
            { v: (o.C + o.b) / o.rt, code: 'ctx-added', hint: 'Subtract the ' + t(money(o.b)) + ' (don’t add it) before dividing by ' + t(nT(o.rt)) + '.' },
            { v: (o.C - o.b) * o.rt, code: 'ctx-mult', hint: 'Divide by ' + t(nT(o.rt)) + ' — don’t multiply.' }], o.m, 0),
            t('Y_1=' + nT(o.rt) + 'X+' + o.b) + ', ' + t('Y_2=' + nT(o.C)) + ': ' + cd('5:intersect') + ' gives ' + t('(' + o.m + ',\\ ' + nT(o.C) + ')') + '.<br>Check: ' + t(nT(o.rt) + '(' + o.m + ')+' + o.b + '=' + nT(o.rt * o.m) + '+' + o.b + '=' + nT(o.C)) + ' ✓. Answer: ' + t(o.m) + '.', [H_INT], 'phone plan minutes for ' + o.C);
          p.bad = [String(rd(o.C / o.rt, 0))].filter(function (x) { return Number(x) !== o.m; });
          return p;
        } }] }
    ],

    extra: [
      /* ---------- Part A — windows ---------- */
      { num: '1', section: 'Extra practice A — Setting a window you can trust', shared: function (r) { var s = shell(r); s.w = windowsFor(s); return s; },
        stem: function (s) {
          var row = function (n) { return '<tr><th>' + n + '</th>' + s.w[n].map(function (v) { return '<td>' + t(nT(v)) + '</td>'; }).join('') + '</tr>'; };
          return 'A fireworks shell is fired from the top of a mortar tube. Its height above the ground, in metres, ' + t('t') + ' seconds after firing is ' + t(s.eq) + '. Four students graph it in different windows:' +
            '<table class="vtab"><tr><th>Student</th><th>Xmin</th><th>Xmax</th><th>Ymin</th><th>Ymax</th></tr>' + ['Ama', 'Beni', 'Carly', 'Dev'].map(row).join('') + '</table>';
        },
        parts: [
          { id: 'e1a', sub: 'a', level: 'EMG', make: function (r, s) {
            return mc(r, 'Which student’s window shows the whole flight, from firing to landing?', [
              { html: 'Ama', why: 'Ama’s ' + cd('Ymax') + ' is ' + t('10') + ', but the shell climbs much higher than ' + t('10') + ' m — the top of the arc is off the screen.' },
              { html: 'Beni', why: 'Beni’s ' + cd('Xmax') + ' = ' + t(nT(s.tv)) + ' is the time of the highest point, so the whole descent and the landing are cut off.' },
              { html: 'Carly', right: true },
              { html: 'Dev', why: 'Dev’s ' + cd('Ymax') + ' = ' + t(s.w.Dev[3]) + ' is below the peak, so the top of the flight is cut off.' }],
              'The shell lands at ' + t('t\\approx ' + rT(s.land, 2)) + ' s (' + cd('2:zero') + ') and peaks at ' + t(nT(s.pk)) + ' m (' + cd('4:maximum') + '). A window needs ' + cd('Xmax') + ' past ' + t(rT(s.land, 2)) + ' and ' + cd('Ymax') + ' above ' + t(nT(s.pk)) + ', starting from ' + t('0') + '. Only <b>Carly</b>’s does.' + quadFig(s, s.w.Carly, [{ x: s.tv, y: s.pk }]),
              ['Find the landing time and the greatest height first, then compare each window with them.'], 'which window shows flight', true);
          } },
          { id: 'e1b', sub: 'b', level: 'PRG', make: function (r, s) {
            var rows = [{ id: 'Ama', html: 'Ama' }, { id: 'Beni', html: 'Beni' }, { id: 'Carly', html: 'Carly' }, { id: 'Dev', html: 'Dev' }];
            var cols = [{ id: 'top', html: 'cuts off the top' }, { id: 'land', html: 'cuts off the landing' }, { id: 'neg', html: 'wastes screen on negative values' }];
            var want = { Ama: ['top', 'neg'], Beni: ['land'], Carly: [], Dev: ['top'] };
            var why = { Ama: 'Ama (the standard ' + kb('ZOOM 6') + ' window): ' + cd('Ymax') + ' = 10 is far below the peak, and ' + cd('Xmin') + ' = ' + cd('Ymin') + ' = −10 spend half the screen on negative times and heights. Its ' + cd('Xmax') + ' = 10 is past the landing, so the landing is fine.',
              Beni: 'Beni: ' + cd('Xmax') + ' = ' + t(nT(s.tv)) + ' stops at the top of the arc, so the descent and landing are missing. Its ' + cd('Ymax') + ' is high enough.',
              Carly: 'Carly’s window shows everything — tick nothing for her.', Dev: 'Dev: ' + cd('Ymax') + ' = ' + t(s.w.Dev[3]) + ' is below the ' + t(nT(s.pk)) + ' m peak. His ' + cd('Xmax') + ' reaches past the landing.' };
            return B.grid('For each window, tick every problem it has. (A window with no problems gets no ticks.)', rows, cols, want, { allowBlank: true, why: function (row) { return { code: 'row', hint: why[row] }; } },
              'The flight needs ' + t('0\\le t\\le ' + rT(s.land, 2)) + ' and ' + t('0\\le h\\le ' + nT(s.pk)) + '.<br>' + rows.map(function (x) { return why[x.id]; }).join('<br>'),
              ['Compare each ' + cd('Xmax') + ' with the landing time and each ' + cd('Ymax') + ' with the greatest height.', 'Negative times and heights can’t happen here.'], 'window problems grid');
          } },
          { id: 'e1c', sub: 'd', level: 'EMG', make: function (r, s) {
            return mc(r, 'On Dev’s screen the curve runs off the top edge and comes back. Why is that <b>not</b> the maximum?', [
              { html: 'The curve only crosses the window’s top edge, ' + t('h=' + s.w.Dev[3]) + '. It turns out of sight, higher up: the edge is the window’s limit, not the shell’s.', right: true },
              { html: 'It is the maximum: the highest point you can see is the greatest height.', why: 'A maximum is where the curve <b>turns</b>. On Dev’s screen it is still rising when it leaves the screen.' },
              { html: 'A calculator can’t find the maximum of a parabola.', why: cd('4:maximum') + ' finds it — once the turning point is on the screen.' },
              { html: 'The maximum of a height model is always at ' + t('t=0') + '.', why: 'The shell rises after it is fired, so the greatest height comes later, at the vertex.' }],
              'A maximum is where the curve turns. Dev’s curve crosses ' + t('h=' + s.w.Dev[3]) + ' on the way up and on the way down; it turns out of sight at ' + t(nT(s.pk)) + ' m. Raise ' + cd('Ymax') + ' to see it.', ['Is the curve turning at the edge, or still rising?'], 'edge is not a maximum');
          } }] },
      { num: '2', shared: shell,
        stem: function (s) { return 'Use a fireworks shell with height ' + t(s.eq) + ' metres, ' + t('t') + ' seconds after firing. Graph it on your calculator in a window you trust.'; },
        parts: [
          { id: 'e2a', sub: 'window', level: 'EMG', make: function (r, s) {
            var key = winKey([0, s.land], [0, s.pk]);
            return winPart({ prompt: 'Enter a window that shows the whole flight, from firing to landing, including the highest point.', x: [0, s.land], y: [0, s.pk], xv: 't', yv: 'h', xNeg: 'is time since firing', yNonneg: true,
              need: 'the whole flight from firing to landing, including the highest point', xHi: 'the landing', xHiHow: 'Find the landing with ' + cd('2:zero') + ' and set ' + cd('Xmax') + ' a little past it.', yHi: 'the top of the flight', yHiHow: 'Find the greatest height with ' + cd('4:maximum') + '.', yLo: 'the ground (' + t('h=0') + ')',
              key: key, good: s.b === 30 && s.c === 2 ? [[0, 7, 0, 50]] : [[0, Math.ceil(s.land), 0, Math.ceil(s.pk + 1)]], bad: [[-10, 10, -10, 10], [0, s.tv, 0, s.pk + 3], [0, s.land + 1, 0, s.pk * 0.4]],
              sol: cd('2:zero') + ' gives the landing at ' + t('t\\approx ' + rT(s.land, 2)) + ' and ' + cd('4:maximum') + ' gives the peak ' + t(nT(s.pk)) + ' m, so a window like ' + t('[0,\\ ' + nT(key[1]) + ']') + ' by ' + t('[0,\\ ' + nT(key[3]) + ']') + ' works.' + quadFig(s, key, [{ x: s.tv, y: s.pk }]), text: 'window ' + s.eq });
          } },
          { id: 'e2b', sub: 'a', level: 'BEG', make: function (r, s) {
            return numPart('State the ' + t('h') + '-intercept. (It is the height of the mouth of the mortar tube.)', s.c, 2, [{ v: 0, code: 'ctx-zero-start', hint: 'The shell starts at the top of the tube, above the ground. Substitute ' + t('t=0') + '.' }],
              'At ' + t('t=0') + ': ' + t('h=-5(0)^{2}+' + s.b + '(0)+' + nT(s.c) + '=' + nT(s.c)) + '. The mouth of the tube is ' + t(nT(s.c)) + ' m above the ground — that is where the shell starts.', ['The ' + t('h') + '-intercept is the value at ' + t('t=0') + '.'], 'h-intercept ' + s.eq, { after: 'm' });
          } },
          { id: 'e2c', sub: 'b', level: 'EMG', make: function (r, s) {
            return numPart('Use ' + cd('2:zero') + ' to find the ' + t('t') + '-intercept in the practical domain (to the nearest hundredth). It is when the shell lands.', s.land, 2, [
              { v: s.neg, code: 'ctx-neg-time', hint: 'That zero is at a negative time — before the shell was fired. Use the crossing on the right.' },
              { v: s.tv, code: 'ctx-max-time', hint: 'That is the time of the highest point, not the landing.' },
              { v: 2 * s.tv, code: 'ctx-double-vertex', hint: 'At ' + t('t=' + nT(2 * s.tv)) + ' the shell is back at the height of the tube, ' + t(nT(s.c)) + ' m — not yet on the ground.' }],
              zeroSol(quadT(-5, s.b, s.c, 't'), 't', [s.neg, s.land], 1, 2, ' (the negative one is before firing)') + ' The shell is back on the ground ' + t(rT(s.land, 2)) + ' s after firing.', [H_ZERO], 'landing ' + s.eq, { after: 's' });
          } },
          { id: 'e2d', sub: 'c', level: 'EMG', make: function (r, s) {
            return fieldsPart('Use ' + cd('4:maximum') + '. State the greatest height reached and the time it happens.', [
              { label: 'Greatest height', x: s.pk, d: 2, after: 'm', cands: [{ v: s.tv, code: 'ctx-max-time', hint: 'That is the time. The height is the other coordinate of the vertex.' }] },
              { label: 'Time', x: s.tv, d: 2, after: 's', cands: [{ v: s.pk, code: 'ctx-gave-h', hint: 'That is the height. The time is the ' + t('t') + '-coordinate of the vertex.' }] }],
              cd('4:maximum') + ' gives ' + t('(' + nT(s.tv) + ',\\ ' + nT(s.pk) + ')') + '. Check: ' + t('h(' + nT(s.tv) + ')=-5(' + nT(s.tv) + ')^{2}+' + s.b + '(' + nT(s.tv) + ')+' + nT(s.c) + '=' + nT(s.pk)) + '. Greatest height ' + t(nT(s.pk)) + ' m, ' + t(nT(s.tv)) + ' s after firing.', [H_MAX, H_VERT], 'max ' + s.eq, { swap: 'wrong', swapHint: 'Your height and time are swapped: the vertex is ' + t('(t,\\ h)') + ' = (time, height).' });
          } },
          { id: 'e2e', sub: 'd', level: 'EMG', make: function (r, s) {
            return fieldsPart('The shell is set to burst at ' + t(s.H) + ' m. Graph ' + t('Y_2=' + s.H) + ' and use ' + cd('5:intersect') + '. At what two times is the shell ' + t(s.H) + ' m up? (Nearest hundredth.)', [
              { label: 'Earlier time', x: s.h1, d: 2, after: 's', cands: [{ v: s.tv, code: 'ctx-max-time', hint: 'That is the time of the peak. Find where the curve meets the line ' + t('h=' + s.H) + '.' }] },
              { label: 'Later time', x: s.h2, d: 2, after: 's', cands: [{ v: s.land, code: 'ctx-gave-end', hint: 'That is the landing. Find where the falling curve passes ' + t(s.H) + ' m.' }] }],
              t(s.y1) + ', ' + t('Y_2=' + s.H) + ', ' + cd('5:intersect') + ' twice.<br>Algebra: ' + t(quadT(-5, s.b, s.c, 't') + '=' + s.H) + ' gives ' + t(quadT(5, -s.b, s.H - s.c, 't') + '=0') + ', so ' + t('t\\approx ' + rT(s.h1, 2)) + ' and ' + t('t\\approx ' + rT(s.h2, 2)) + ' s.', [H_INT, 'The curve passes this height twice: once going up, once coming down.'], 'times at h=' + s.H, { swap: 'form' });
          } },
          { id: 'e2f', sub: 'e', level: 'EMG', make: function (r, s) {
            var d = rd(s.tv - s.h1, 2);
            return mc(r, 'Why are there two answers when you find the times at ' + t(s.H) + ' m, and which one must the fuse be set for?', [
              { html: 'The parabola is symmetric about ' + t('t=' + nT(s.tv)) + ': the shell passes ' + t(s.H) + ' m once rising and once falling. The fuse is set for the first time, ' + t(rT(s.h1, 2)) + ' s.', right: true },
              { html: 'The parabola is symmetric about ' + t('t=' + nT(s.tv)) + ': the shell passes ' + t(s.H) + ' m twice. The fuse is set for the later time, ' + t(rT(s.h2, 2)) + ' s.', why: 'A fuse burns from the moment of firing: the shell bursts the first time it reaches ' + t(s.H) + ' m, on the way up.' },
              { html: 'Only ' + t(rT(s.h1, 2)) + ' s is real; ' + t(rT(s.h2, 2)) + ' s is a calculator error.', why: 'Substitute ' + t(rT(s.h2, 2)) + ' into the relation: it really gives about ' + t(s.H) + ' m. The shell comes back down past that height.' },
              { html: 'The calculator found two different shells.', why: 'There is one shell. A parabola can meet a horizontal line twice — once on each side of the vertex.' }],
              'The two times are each about ' + t(nT(d)) + ' s from the axis of symmetry ' + t('t=' + nT(s.tv)) + ' (' + t(nT(s.tv) + '\\mp ' + nT(d)) + '): the shell passes ' + t(s.H) + ' m going up and again coming down. The fuse must fire the first time: ' + t(rT(s.h1, 2)) + ' s.', ['Where is the vertex? Which time is on the way up?'], 'symmetry two times');
          } },
          { id: 'e2g', sub: 'f-i', level: 'PRG', outcome: 'RF2', make: function (r, s) {
            var L = rd(s.land, 2), tg = setT('t', 0, L), rg = setT('h', 0, s.pk);
            return setPart('State the practical domain (use the landing time to the nearest hundredth).', tg, { v: 't', other: rg, otherName: 'range', wrong: [
              { is: setT('t', 0, s.tv), code: 'ctx-dom-vertex', hint: 'The flight doesn’t end at the top — the shell comes back down. End the domain at the landing.' },
              { is: setT('t', rd(s.neg, 2), L), code: 'ctx-dom-neg', hint: 'The negative zero is before the shell was fired. The flight starts at ' + t('t=0') + '.' },
              { is: 't\\ge 0', code: 'ctx-dom-open', hint: 'The relation stops describing the shell when it lands.' }] },
              'From firing (' + t('t=0') + ') to landing (' + t('t\\approx ' + L.toFixed(2)) + '): ' + t('D=' + tg) + '.', H_DOM, 'domain ' + s.eq);
          } },
          { id: 'e2h', sub: 'f-ii', level: 'PRG', outcome: 'RF2', make: function (r, s) {
            var tg = setT('h', 0, s.pk), dg = setT('t', 0, rd(s.land, 2));
            return setPart('State the practical range.', tg, { v: 'h', other: dg, otherName: 'domain', wrong: [
              { is: setT('h', s.c, s.pk), code: 'ctx-rng-start', hint: 'The shell starts at ' + t(nT(s.c)) + ' m, but it ends on the ground: the lowest height is ' + t('0') + '.' },
              { is: setT('h', 0, s.tv), code: 'ctx-rng-vertex-x', hint: t(nT(s.tv)) + ' is the <b>time</b> of the peak. The range is about heights.' }] },
              'The lowest height is ' + t('0') + ' (landing) and the highest is ' + t(nT(s.pk)) + ' m at the vertex: ' + t('R=' + tg) + '.', H_DOM, 'range ' + s.eq);
          } }] },
      { num: '3', shared: function (r) {
          var o = r.pick([[84, 0.14], [72, 0.12], [90, 0.15], [96, 0.16], [60, 0.12], [78, 0.13], [105, 0.15], [120, 0.2], [70, 0.14], [88, 0.11], [64, 0.16], [91, 0.13]]);
          var F0 = o[0], k = o[1], dI = Math.round(F0 / k), dT = r.pick(rng(100, dI - 100, 50)), R = r.pick([10, 15, 20, 25]);
          return { F0: F0, k: k, dI: dI, dT: dT, FT: cl(F0 - k * dT), R: R, dR: (F0 - R) / k, eq: 'F=' + F0 + '-' + nT(k) + 'd', y1: 'Y_1=' + F0 + '-' + nT(k) + 'X' };
        },
        stem: function (s) { return 'A transport truck leaves a depot with a full tank. The fuel remaining, ' + t('F') + ' litres, after the truck has driven ' + t('d') + ' kilometres is modelled by ' + t(s.eq) + '.'; },
        parts: [
          { id: 'e3a', sub: 'a', level: 'BEG', make: function (r, s) {
            var key = winKey([0, s.dI], [0, s.F0]);
            return winPart({ prompt: 'Enter a window that shows the line from the depot until the tank is empty.', x: [0, s.dI], y: [0, s.F0], xv: 'd', yv: 'F', xNeg: 'is the distance driven from the depot', yNonneg: true,
              need: 'the line from the depot (' + t('d=0') + ', full tank) to an empty tank', xHi: 'the point where the tank is empty', xHiHow: 'Find the ' + t('d') + '-intercept (' + cd('2:zero') + ', or solve ' + t(s.F0 + '-' + nT(s.k) + 'd=0') + ').', yHi: 'the full tank', yHiHow: 'The tank starts with ' + t(s.F0) + ' L.', yLo: 'the empty tank (' + t('F=0') + ')',
              key: key, good: s.F0 === 84 ? [[0, 600, 0, 90]] : [[0, s.dI, 0, s.F0]], bad: [[-100, s.dI, 0, s.F0 + 5], [0, s.dI / 2, 0, s.F0 + 5], [0, s.dI + 50, 0, s.F0 / 2]],
              sol: 'The truck starts at the depot with ' + t(s.F0) + ' L and is empty when ' + t(nT(s.k) + 'd=' + s.F0) + ', ' + t('d=' + s.dI) + ' km. A window ' + t('[0,\\ ' + nT(key[1]) + ']') + ' by ' + t('[0,\\ ' + nT(key[3]) + ']') + ' shows it all.' + screen(key, { xv: 'd', yv: 'F', fns: [{ f: function (x) { return s.F0 - s.k * x; }, from: 0, to: s.dI }] }), text: 'window ' + s.eq });
          } },
          { id: 'e3b', sub: 'b', level: 'EMG', make: function (r, s) {
            return fieldsPart('State the ' + t('F') + '-intercept and the ' + t('d') + '-intercept.', [
              { label: t('F') + '-intercept', x: s.F0, d: 2, after: 'L', cands: [] },
              { label: t('d') + '-intercept', x: s.dI, d: 2, after: 'km', cands: [{ v: s.F0 * s.k, code: 'ctx-mult', hint: 'From ' + t(nT(s.k) + 'd=' + s.F0) + ', divide by ' + t(nT(s.k)) + '.' }] }],
              t('d=0') + ': ' + t('F=' + s.F0) + ' — the truck leaves with ' + t(s.F0) + ' L. ' + t('F=0') + ': ' + t(nT(s.k) + 'd=' + s.F0 + '\\Rightarrow d=' + s.dI) + ' — the tank is empty after ' + t(s.dI) + ' km.', [H_ZERO, 'The ' + t('F') + '-intercept is the value at ' + t('d=0') + '.'], 'intercepts ' + s.eq, { swap: 'wrong', swapHint: 'The two intercepts are in each other’s boxes: the ' + t('F') + '-intercept is a number of litres (at ' + t('d=0') + ').' });
          } },
          { id: 'e3c', sub: 'c', level: 'BEG', make: function (r, s) {
            return numPart('Use ' + kb('TRACE') + ' to find how much fuel is left after ' + t(s.dT) + ' km.', s.FT, 2, [
              { v: s.k * s.dT, code: 'ctx-used', hint: 'That is the fuel <b>used</b>. The fuel left is ' + t(s.F0) + ' minus that.' },
              { v: s.F0 + s.k * s.dT, code: 'ctx-sign', hint: 'Fuel goes down as the truck drives: subtract ' + t(nT(s.k) + '(' + s.dT + ')') + '.' }],
              kb('TRACE') + ' to ' + t('X=' + s.dT) + ': ' + t('F=' + s.F0 + '-' + nT(s.k) + '(' + s.dT + ')=' + s.F0 + '-' + nT(s.k * s.dT) + '=' + nT(s.FT)) + ' L.', [H_TRACE], 'fuel after ' + s.dT, { after: 'L' });
          } },
          { id: 'e3d', sub: 'd', level: 'EMG', make: function (r, s) {
            return numPart('The driver refuels when ' + t(s.R) + ' L remain. How far can the truck go first? (Nearest hundredth.)', s.dR, 2, [
              { v: s.R / s.k, code: 'ctx-no-sub', hint: 'That is how far ' + t(s.R) + ' L would last. Solve ' + t(s.F0 + '-' + nT(s.k) + 'd=' + s.R) + '.' },
              { v: s.dI, code: 'ctx-to-empty', hint: 'That is the distance until the tank is empty. The driver stops when ' + t(s.R) + ' L are left.' },
              { v: (s.F0 + s.R) / s.k, code: 'ctx-added', hint: 'Subtract ' + t(s.R) + ' from ' + t(s.F0) + ' (don’t add): ' + t(nT(s.k) + 'd=' + s.F0 + '-' + s.R) + '.' }],
              t('Y_2=' + s.R) + ', ' + cd('5:intersect') + '. Algebra: ' + t(s.R + '=' + s.F0 + '-' + nT(s.k) + 'd\\Rightarrow ' + nT(s.k) + 'd=' + (s.F0 - s.R) + '\\Rightarrow d=\\frac{' + (s.F0 - s.R) + '}{' + nT(s.k) + '}' + ap(s.dR, 2) + rT(s.dR, 2)) + ' km.', [H_INT], 'distance to ' + s.R + ' L', { after: 'km' });
          } },
          { id: 'e3e', sub: 'e-i', level: 'PRG', outcome: 'RF2', make: function (r, s) {
            var tg = setT('d', 0, s.dI), rg = setT('F', 0, s.F0);
            return setPart('State the practical domain.', tg, { v: 'd', other: rg, otherName: 'range', wrong: [{ is: 'd\\ge 0', code: 'ctx-dom-open', hint: 'The truck can’t keep driving once the tank is empty.' }] },
              t('D=' + tg) + ': ' + t('d\\ge 0') + ' because distance driven can’t be negative; ' + t('d\\le ' + s.dI) + ' because the tank is empty there and the truck stops.', H_DOM, 'domain ' + s.eq);
          } },
          { id: 'e3f', sub: 'e-ii', level: 'PRG', outcome: 'RF2', make: function (r, s) {
            var tg = setT('F', 0, s.F0), dg = setT('d', 0, s.dI);
            return setPart('State the practical range.', tg, { v: 'F', other: dg, otherName: 'domain', wrong: [{ is: 'F\\le ' + s.F0, code: 'ctx-rng-open', hint: 'A tank can’t hold a negative amount of fuel: the least value is ' + t('0') + '.' }] },
              t('R=' + tg) + ': ' + t('F\\ge 0') + ' (a tank can’t hold negative fuel) and ' + t('F\\le ' + s.F0) + ' (the tank was full at the start).', H_DOM, 'range ' + s.eq);
          } },
          { id: 'e3g', sub: 'f', level: 'EMG', make: function (r, s) {
            return mc(r, 'A student sets ' + cd('Xmin') + ' = −100 “so the ' + t('y') + '-axis isn’t on the edge of the screen.” What is wrong with a negative ' + cd('Xmin') + ' here?', [
              { html: t('d') + ' counts kilometres driven from the depot, so ' + t('d<0') + ' never happened: the screen would show fuel levels above a full tank (' + t('F>' + s.F0) + ') that never existed. Keep ' + cd('Xmin') + ' = 0.', right: true },
              { html: 'Nothing — a negative ' + cd('Xmin') + ' always makes the graph easier to read.', why: 'The part left of ' + t('d=0') + ' describes distances the truck never drove. Fit the window to the situation.' },
              { html: 'The calculator can’t graph negative values of ' + t('X') + '.', why: 'It can — that is the problem: it draws a part of the line that has no meaning here.' },
              { html: 'It hides the ' + t('F') + '-intercept.', why: 'The ' + t('F') + '-intercept (at ' + t('d=0') + ') is still on the screen. The trouble is the extra piece to its left.' }],
              t('d') + ' is the distance <i>from</i> the depot, so negative values never happen; the graph left of ' + t('d=0') + ' shows ' + t('F>' + s.F0) + ', more fuel than the full tank. Use ' + cd('Xmin') + ' = 0 (and widen ' + cd('Xmax') + ' if you want room).', ['What would ' + t('d=-100') + ' mean for the truck?'], 'negative Xmin');
          } }] },

      /* ---------- Part B — revenue, profit, vertex ---------- */
      { num: '4', section: 'Extra practice B — Revenue, profit, and what the vertex means', shared: function (r) {
          var Bc = r.pick([2, 4, 5]), Z = r.pick([20, 24, 30, 36, 40]), A = Bc * Z, p1 = r.int(3, Z / 2 - 3), p2 = Z - p1;
          return { B: Bc, Z: Z, A: A, pv: Z / 2, Vm: Bc * Z * Z / 4, p1: p1, p2: p2, T: Bc * p1 * p2, eq: 'V=' + A + 'p-' + Bc + 'p^{2}' };
        },
        stem: function (s) { return 'A shop finds that if it charges ' + t('p') + ' dollars for a phone case, it sells ' + t(s.A + '-' + s.B + 'p') + ' cases a week. Its weekly revenue, ' + t('V') + ' dollars, is ' + t('V=p(' + s.A + '-' + s.B + 'p)') + ', which expands to ' + t(s.eq) + '.'; },
        parts: [
          { id: 'e4a', sub: 'b-i', level: 'EMG', make: function (r, s) {
            return B.valueSet('Find both ' + t('p') + '-intercepts.', [0, s.Z], { v: 'p', diag: function (A) { if (A.length === 1 && Math.abs(A[0] - s.A) < 1e-9) return { code: 'ctx-gave-a', hint: t(s.A) + ' is the number of cases sold when the price is ' + t('\\$0') + '. Solve ' + t('p(' + s.A + '-' + s.B + 'p)=0') + '.' }; return null; } },
              cd('2:zero') + ' twice, or factor: ' + t('p(' + s.A + '-' + s.B + 'p)=0') + ', so ' + t('p=0') + ' or ' + t(s.A + '-' + s.B + 'p=0\\Rightarrow p=' + s.Z) + '.', [H_ZERO, 'Each factor of ' + t('p(' + s.A + '-' + s.B + 'p)') + ' can be zero.'], 'p-intercepts ' + s.eq);
          } },
          { id: 'e4b', sub: 'b-ii', level: 'EMG', make: function (r, s) {
            return mc(r, 'The two ' + t('p') + '-intercepts mean two <i>different</i> things. Which explanation is right?', [
              { html: t('p=\\$0') + ': ' + t(s.A) + ' cases are given away free, so the revenue is ' + t('\\$0') + '. ' + t('p=\\$' + s.Z) + ': nobody buys a case, so again the revenue is ' + t('\\$0') + '.', right: true },
              { html: 'Both mean that no cases are sold.', why: 'At ' + t('p=0') + ' the shop “sells” ' + t(s.A + '-' + s.B + '(0)=' + s.A) + ' cases — but for nothing.' },
              { html: t('p=\\$0') + ': the shop is closed. ' + t('p=\\$' + s.Z) + ': the shop sells out.', why: 'Use the formula for cases sold, ' + t(s.A + '-' + s.B + 'p') + ': at ' + t('p=' + s.Z) + ' it is ' + t('0') + ' cases.' },
              { html: t('p=\\$' + s.Z) + ' is the best price, because it is the largest intercept.', why: 'At an intercept the revenue is ' + t('\\$0') + '. The best price is at the vertex, between the intercepts.' }],
              'At ' + t('p=0') + ' the cases are free: ' + t(s.A) + ' sold × ' + t('\\$0') + ' = ' + t('\\$0') + '. At ' + t('p=' + s.Z) + ', ' + t(s.A + '-' + s.B + '(' + s.Z + ')=0') + ' cases sell: ' + t('\\$0') + ' again.', ['Find the number of cases sold, ' + t(s.A + '-' + s.B + 'p') + ', at each intercept.'], 'meaning of revenue intercepts');
          } },
          { id: 'e4c', sub: 'c', level: 'EMG', make: function (r, s) {
            return fieldsPart('Use ' + cd('4:maximum') + '. State the price that earns the most and the revenue it earns.', [
              { label: 'Price', x: s.pv, d: 2, before: '$', cands: [] }, { label: 'Weekly revenue', x: s.Vm, d: 2, before: '$', cands: [] }],
              cd('4:maximum') + ' gives ' + t('(' + s.pv + ',\\ ' + s.Vm + ')') + '. Check: ' + t(s.A + '(' + s.pv + ')-' + s.B + '(' + s.pv + ')^{2}=' + (s.A * s.pv) + '-' + (s.B * s.pv * s.pv) + '=' + s.Vm) + '. Charge ' + t(money(s.pv)) + ' per case for ' + t(money(s.Vm)) + ' a week.', [H_MAX, H_VERT], 'max revenue ' + s.eq, { swap: 'wrong', swapHint: 'Price and revenue are swapped: the vertex is (price, revenue).' });
          } },
          { id: 'e4d', sub: 'd', level: 'BEG', make: function (r, s) {
            var n = s.A - s.B * s.pv;
            return numPart('How many cases are sold at that price?', n, 2, [{ v: s.Vm, code: 'ctx-gave-h', hint: 'That is the revenue. Cases sold = ' + t(s.A + '-' + s.B + 'p') + '.' }, { v: s.pv, code: 'ctx-gave-a', hint: 'That is the price. Substitute it into ' + t(s.A + '-' + s.B + 'p') + '.' }],
              t(s.A + '-' + s.B + '(' + s.pv + ')=' + n) + ' cases. Check: ' + t(n + '\\times\\$' + s.pv + '=\\$' + F(s.Vm)) + ' ✓.', ['Substitute the price into the number of cases sold, ' + t(s.A + '-' + s.B + 'p') + '.'], 'cases at best price', { after: 'cases' });
          } },
          { id: 'e4e', sub: 'e', level: 'PRG', make: function (r, s) {
            return B.valueSet('Use ' + cd('5:intersect') + ' with ' + t('Y_2=' + s.T) + '. Two prices give a weekly revenue of ' + t(money(s.T)) + '. Find both.', [s.p1, s.p2], { v: 'p' },
              t(s.y1 || ('Y_1=' + s.A + 'X-' + s.B + 'X^{2}')) + ', ' + t('Y_2=' + s.T) + ': ' + cd('5:intersect') + ' on each side of the vertex.<br>Algebra: ' + t(s.A + 'p-' + s.B + 'p^{2}=' + s.T + '\\Rightarrow p^{2}-' + s.Z + 'p+' + (s.p1 * s.p2) + '=0\\Rightarrow (p-' + s.p1 + ')(p-' + s.p2 + ')=0') + ', so ' + t('p=' + s.p1) + ' or ' + t('p=' + s.p2) + '.', [H_INT, 'The line ' + t('V=' + s.T) + ' meets the parabola twice, once on each side of the vertex.'], 'prices for revenue ' + s.T);
          } },
          { id: 'e4f', sub: 'f', level: 'PRG', make: function (r, s) {
            var c1 = s.A - s.B * s.p1, c2 = s.A - s.B * s.p2;
            return fieldsPart('The owner says “the same money for fewer cases is better.” Which of the two prices should she charge, and how many cases does she sell?', [
              { label: 'Price', x: s.p2, d: 2, before: '$', cands: [{ v: s.p1, code: 'ctx-more-cases', hint: 'At ' + t(money(s.p1)) + ' she sells ' + t(c1) + ' cases. Which price sells <b>fewer</b> cases for the same money?' }] },
              { label: 'Cases sold', x: c2, d: 2, after: 'cases', cands: [{ v: c1, code: 'ctx-more-cases', hint: 'That is the number of cases at the lower price.' }] }],
              'At ' + t(money(s.p1)) + ': ' + t(s.A + '-' + s.B + '(' + s.p1 + ')=' + c1) + ' cases. At ' + t(money(s.p2)) + ': ' + t(s.A + '-' + s.B + '(' + s.p2 + ')=' + c2) + ' cases. Same ' + t(money(s.T)) + ' for fewer cases: charge ' + t(money(s.p2)) + ' and sell ' + t(c2) + ' cases.', ['Find the cases sold at each price with ' + t(s.A + '-' + s.B + 'p') + '.'], 'fewer cases price');
          } },
          { id: 'e4g', sub: 'g-i', level: 'PRG', outcome: 'RF2', make: function (r, s) {
            var tg = setT('p', 0, s.Z), rg = setT('V', 0, s.Vm);
            return setPart('State the practical domain.', tg, { v: 'p', other: rg, otherName: 'range', wrong: [{ is: setT('p', 0, s.pv), code: 'ctx-dom-vertex', hint: 'Prices above ' + t(money(s.pv)) + ' are possible — they just earn less. The domain ends where sales reach ' + t('0') + '.' }, { is: 'p\\ge 0', code: 'ctx-dom-open', hint: 'Above ' + t(money(s.Z)) + ' the formula gives a negative number of cases sold.' }] },
              'Prices from ' + t('\\$0') + ' up to ' + t(money(s.Z)) + ', where sales reach ' + t('0') + ': ' + t('D=' + tg) + '.', H_DOM, 'domain ' + s.eq);
          } },
          { id: 'e4h', sub: 'g-ii', level: 'PRG', outcome: 'RF2', make: function (r, s) {
            var tg = setT('V', 0, s.Vm), dg = setT('p', 0, s.Z);
            return setPart('State the practical range.', tg, { v: 'V', other: dg, otherName: 'domain', wrong: [{ is: setT('V', 0, s.pv), code: 'ctx-rng-vertex-x', hint: t(s.pv) + ' is the best <b>price</b>. The range is about revenue.' }] },
              'Revenue from ' + t('\\$0') + ' (at either intercept) up to the ' + t(money(s.Vm)) + ' peak: ' + t('R=' + tg) + '.', H_DOM, 'range ' + s.eq);
          } }] },
      { num: '5', shared: function (r) {
          return pickWhere(function () {
            var b = r.pick([30, 36, 40, 44, 50]), c = r.pick([150, 200, 250, 300, 350]), D = b * b - 2 * c, sq = Math.sqrt(D), N = r.int(15, 35);
            return { b: b, c: c, r1: b - sq, r2: b + sq, nv: b, Pm: 0.5 * b * b - c, N: N, PN: cl(-0.5 * N * N + b * N - c), eq: 'P=' + quadT(-0.5, b, -c, 'n'), P: function (n) { return cl(-0.5 * n * n + b * n - c); } };
          }, function (o) { return o.r1 > 3 && margin(o.r1, 2) && margin(o.r2, 2) && Math.abs(o.r1 - Math.round(o.r1)) > 0.05 && o.N > o.r1 + 2 && o.N < o.nv - 2; });
        },
        stem: function (s) { return 'A food truck’s daily profit, ' + t('P') + ' dollars, from selling ' + t('n') + ' meals is modelled by ' + t(s.eq) + '.'; },
        parts: [
          { id: 'e5a', sub: 'a-i', level: 'BEG', make: function (r, s) {
            return numPart('Find the ' + t('P') + '-intercept.', -s.c, 2, [{ v: s.c, code: 'int-sign', hint: 'Check the sign: at ' + t('n=0') + ' only the ' + t('-' + s.c) + ' is left.' }, { v: 0, code: 'ctx-zero-start', hint: 'Substitute ' + t('n=0') + ': the constant term stays.' }],
              t('n=0') + ': ' + t('P=-0.5(0)^{2}+' + s.b + '(0)-' + s.c + '=-' + s.c) + '.', ['The ' + t('P') + '-intercept is the value at ' + t('n=0') + '.'], 'P-intercept ' + s.eq, { money: true });
          } },
          { id: 'e5b', sub: 'a-ii', level: 'EMG', make: function (r, s) {
            return mc(r, 'What does a <b>negative</b> ' + t('P') + '-intercept mean for the truck?', [
              { html: 'With no meals sold the truck is ' + t(money(s.c)) + ' down: its fixed daily costs (permit, fuel, propane) with no sales to pay for them.', right: true },
              { html: 'The truck must sell ' + t(s.c) + ' meals to break even.', why: 'The ' + t('P') + '-intercept is a profit in dollars at ' + t('n=0') + ', not a number of meals.' },
              { html: 'The truck starts each day with ' + t(money(s.c)) + ' in cash.', why: 'The value is negative: a loss, not money in hand.' },
              { html: 'The model doesn’t work at ' + t('n=0') + ', so the intercept means nothing.', why: 'A day with no sales can happen, and the truck still pays its costs — the intercept is meaningful.' }],
              t('P(0)=-' + s.c) + ': on a day with no sales the truck still pays its fixed costs, so it loses ' + t(money(s.c)) + '.', ['What is the profit when ' + t('n=0') + '? What does a negative profit mean?'], 'negative P-intercept meaning');
          } },
          { id: 'e5c', sub: 'b', level: 'EMG', make: function (r, s) {
            return fieldsPart('Use ' + cd('2:zero') + ' twice. State both break-even values of ' + t('n') + ' (nearest hundredth).', [
              { label: 'Smaller', x: s.r1, d: 2, after: 'meals', cands: [{ v: s.nv, code: 'ctx-max-time', hint: 'That is the vertex. Break even is where ' + t('P=0') + '.' }] },
              { label: 'Larger', x: s.r2, d: 2, after: 'meals', cands: [{ v: s.nv, code: 'ctx-max-time', hint: 'That is the vertex. Break even is where ' + t('P=0') + '.' }] }],
              cd('2:zero') + ' on each crossing. Algebra: ' + t(quadT(-0.5, s.b, -s.c, 'n') + '=0\\Rightarrow n^{2}-' + (2 * s.b) + 'n+' + (2 * s.c) + '=0\\Rightarrow n=' + s.b + '\\pm\\sqrt{' + (s.b * s.b - 2 * s.c) + '}') + ', so ' + t('n\\approx ' + rT(s.r1, 2)) + ' and ' + t('n\\approx ' + rT(s.r2, 2)) + '.', [H_ZERO], 'break-even ' + s.eq, { swap: 'form' });
          } },
          { id: 'e5d', sub: 'c', level: 'ADV', make: function (r, s) {
            var lo = Math.ceil(s.r1), hi = Math.floor(s.r2);
            return wholeOnly(fieldsPart('Meals are sold whole. State the smallest and the largest whole numbers of meals that still make a profit.', [
              { label: 'Smallest', x: lo, d: 0, after: 'meals', cands: [{ v: lo - 1, code: 'ctx-round-down', hint: 'Check: ' + t('P(' + (lo - 1) + ')=' + money(s.P(lo - 1))) + ' — still a loss. Round <b>up</b> from ' + t(rT(s.r1, 2)) + '.' }] },
              { label: 'Largest', x: hi, d: 0, after: 'meals', cands: [{ v: hi + 1, code: 'ctx-round-up', hint: 'Check: ' + t('P(' + (hi + 1) + ')=' + money(s.P(hi + 1))) + ' — a loss. Round <b>down</b> from ' + t(rT(s.r2, 2)) + '.' }] }],
              'A profit needs ' + t(rT(s.r1, 2) + '<n<' + rT(s.r2, 2)) + '. Smallest: ' + t(lo) + ' meals, ' + t('P(' + lo + ')=' + money(s.P(lo)) + '>0') + '. Largest: ' + t(hi) + ' meals, ' + t('P(' + hi + ')=' + money(s.P(hi)) + '>0') + '. The neighbours lose: ' + t('P(' + (lo - 1) + ')=' + money(s.P(lo - 1))) + ', ' + t('P(' + (hi + 1) + ')=' + money(s.P(hi + 1))) + '.', ['The profit is positive between the two break-even values. Which whole numbers are inside that interval?', 'Check your answers by substituting them (and their neighbours) into ' + t('P') + '.'], 'whole meals for profit'), 'Meals are sold whole: give whole numbers of meals. Which whole numbers lie between the two break-even values?');
          } },
          { id: 'e5e', sub: 'd', level: 'EMG', make: function (r, s) {
            return fieldsPart('What is the greatest daily profit, and how many meals produce it?', [
              { label: 'Greatest profit', x: s.Pm, d: 2, before: '$', cands: [{ v: s.nv, code: 'ctx-max-time', hint: 'That is the number of meals. The profit is the other coordinate.' }] },
              { label: 'Meals', x: s.nv, d: 2, after: 'meals', cands: [{ v: s.Pm, code: 'ctx-gave-h', hint: 'That is the profit. The number of meals is the ' + t('n') + '-coordinate of the vertex.' }] }],
              cd('4:maximum') + ' gives ' + t('(' + s.nv + ',\\ ' + s.Pm + ')') + '. Check: ' + t('n=-\\frac{' + s.b + '}{2(-0.5)}=' + s.nv) + ', ' + t('P(' + s.nv + ')=' + nT(-0.5 * s.nv * s.nv) + '+' + (s.b * s.nv) + '-' + s.c + '=' + s.Pm) + '.', [H_MAX, H_VERT], 'max profit ' + s.eq, { swap: 'wrong', swapHint: 'Profit and meals are swapped: the vertex is (meals, profit).' });
          } },
          { id: 'e5f', sub: 'e', level: 'BEG', make: function (r, s) {
            return numPart('Find the profit on a day when ' + t(s.N) + ' meals are sold.', s.PN, 2, [{ v: 0.5 * s.N * s.N + s.b * s.N - s.c, code: 'ctx-sign-sq', hint: 'Keep the minus sign: ' + t('-0.5(' + s.N + ')^{2}=' + nT(-0.5 * s.N * s.N)) + '.' }, { v: -0.5 * s.N * s.N + s.b * s.N, code: 'ctx-no-c', hint: 'Subtract the ' + t(s.c) + ' too.' }],
              t('P=-0.5(' + s.N + ')^{2}+' + s.b + '(' + s.N + ')-' + s.c + '=' + nT(-0.5 * s.N * s.N) + '+' + (s.b * s.N) + '-' + s.c + '=' + money(s.PN)) + '.', [H_TRACE], 'profit at ' + s.N, { money: true });
          } },
          { id: 'e5g', sub: 'f', level: 'PRG', make: function (r, s) {
            return mc(r, 'Why does selling <b>more</b> than ' + t(s.nv) + ' meals lower the profit, even though every meal is sold at a price?', [
              { html: 'Past the vertex the parabola falls: the ' + t('-0.5n^{2}') + ' cost term grows faster than the ' + t(s.b + 'n') + ' income, so each extra meal costs more to make than it brings in.', right: true },
              { html: 'It doesn’t: selling more meals always earns more profit.', why: 'Compare ' + t('P(' + s.nv + ')=' + money(s.Pm)) + ' with ' + t('P(' + (s.nv + 1) + ')=' + money(s.P(s.nv + 1))) + '.' },
              { html: 'After ' + t(s.nv) + ' meals the price of a meal drops below ' + t('\\$0') + '.', why: 'The model is about profit, not price. Look at how the two terms ' + t(s.b + 'n') + ' and ' + t('-0.5n^{2}') + ' grow.' },
              { html: 'The truck runs out of food after ' + t(s.nv) + ' meals.', why: 'Then the profit would stay the same, not fall. The falling graph says each extra meal loses money.' }],
              'The graph turns at the vertex ' + t('(' + s.nv + ',\\ ' + s.Pm + ')') + ' and then falls: ' + t('P(' + (s.nv + 1) + ')=' + money(s.P(s.nv + 1)) + '<' + money(s.Pm)) + '. The ' + t('-0.5n^{2}') + ' term (costs like overtime and waste) grows faster than the ' + t(s.b + 'n') + ' income.', ['What does the graph do after the vertex?'], 'why profit falls past vertex');
          } }] },
      { num: '6', shared: function (r) {
          return pickWhere(function () {
            var a = r.pick([2, 3, 4]), r1 = r.pick([16, 18, 20, 22, 24]), r2 = r.pick([2, 4]), b = a * (r1 - r2), c = a * r1 * r2, tv = (r1 - r2) / 2, pk = a * Math.pow((r1 + r2) / 2, 2);
            var Ts = rng(Math.ceil((c + 0.3 * (pk - c)) / 50) * 50, pk - 0.15 * (pk - c), 50), T = Ts.length ? r.pick(Ts) : 0, d = T ? Math.sqrt((pk - T) / a) : 0;
            return { a: a, r1: r1, r2: r2, b: b, c: c, tv: tv, pk: pk, T: T, t1: tv - d, t2: tv + d, eq: 'N=' + quadT(-a, b, c, 't') };
          }, function (o) { return o.T && margin(o.t1, 2) && margin(o.t2, 2) && o.c < 400; });
        },
        stem: function (s) { return 'A lake is stocked with trout. The number of trout, ' + t('N') + ', in the lake ' + t('t') + ' years after stocking is modelled by ' + t(s.eq) + '.'; },
        parts: [
          { id: 'e6a', sub: 'b', level: 'BEG', make: function (r, s) {
            return numPart('How many trout were put in the lake? (Which feature of the graph tells you?)', s.c, 0, [{ v: s.pk, code: 'ctx-gave-h', hint: 'That is the greatest population. The number stocked is the value at ' + t('t=0') + '.' }],
              t('t=0') + ': ' + t('N=-' + s.a + '(0)^{2}+' + s.b + '(0)+' + s.c + '=' + s.c) + '. ' + t(s.c) + ' trout were stocked — the ' + t('N') + '-intercept.', ['The stocking happens at ' + t('t=0') + ': the ' + t('N') + '-intercept.'], 'trout stocked', { after: 'trout' });
          } },
          { id: 'e6b', sub: 'c', level: 'EMG', make: function (r, s) {
            return fieldsPart('Find the vertex: when does the population peak, and how many trout are there then?', [
              { label: 'Time', x: s.tv, d: 2, after: 'years', cands: [] }, { label: 'Greatest number', x: s.pk, d: 0, after: 'trout', cands: [] }],
              cd('4:maximum') + ' gives ' + t('(' + s.tv + ',\\ ' + s.pk + ')') + '. Check: ' + t('t=-\\frac{' + s.b + '}{2(-' + s.a + ')}=' + s.tv) + ', ' + t('N(' + s.tv + ')=' + (-s.a * s.tv * s.tv) + '+' + (s.b * s.tv) + '+' + s.c + '=' + s.pk) + '. The population peaks at ' + t(s.pk) + ' trout, ' + t(s.tv) + ' years after stocking.', [H_MAX, H_VERT], 'trout vertex', { swap: 'wrong', swapHint: 'Time and number are swapped: the vertex is (time, number of trout).' });
          } },
          { id: 'e6c', sub: 'd', level: 'EMG', make: function (r, s) {
            return numPart('Use ' + cd('2:zero') + '. How many years after stocking does the model predict the trout are gone?', s.r1, 2, [
              { v: -s.r2, code: 'ctx-neg-time', hint: 'That zero is before the lake was stocked. Use the crossing on the right.' },
              { v: s.tv, code: 'ctx-max-time', hint: 'That is when the population peaks, not when it reaches ' + t('0') + '.' }],
              zeroSol(quadT(-s.a, s.b, s.c, 't'), 't', [-s.r2, s.r1], 1, 2) + ' (factored: ' + t('-' + s.a + '(t-' + s.r1 + ')(t+' + s.r2 + ')=0') + '). Reject ' + t('t=-' + s.r2) + ': the trout are gone ' + t(s.r1) + ' years after stocking.', [H_ZERO], 'trout gone', { after: 'years' });
          } },
          { id: 'e6d', sub: 'e', level: 'EMG', make: function (r, s) {
            return fieldsPart('Use ' + cd('5:intersect') + ' with ' + t('Y_2=' + s.T) + ' to find both times the population is ' + t(s.T) + ' trout (nearest hundredth).', [
              { label: 'Earlier time', x: s.t1, d: 2, after: 'years', cands: [{ v: s.tv, code: 'ctx-max-time', hint: 'That is the peak. Find where the curve meets ' + t('N=' + s.T) + '.' }] },
              { label: 'Later time', x: s.t2, d: 2, after: 'years', cands: [{ v: s.r1, code: 'ctx-gave-end', hint: 'That is when the trout are gone. Find where the falling curve passes ' + t(s.T) + '.' }] }],
              t('Y_2=' + s.T) + ', ' + cd('5:intersect') + ' twice. Algebra: ' + t(quadT(-s.a, s.b, s.c, 't') + '=' + s.T + '\\Rightarrow ' + quadT(s.a, -s.b, s.T - s.c, 't') + '=0') + ', ' + t('t\\approx ' + rT(s.t1, 2)) + ' and ' + t('t\\approx ' + rT(s.t2, 2)) + ' years (symmetric about ' + t('t=' + s.tv) + ').', [H_INT], 'trout = ' + s.T, { swap: 'form' });
          } },
          { id: 'e6e', sub: 'f-i', level: 'PRG', outcome: 'RF2', make: function (r, s) {
            var tg = setT('t', 0, s.r1), rg = setT('N', 0, s.pk);
            return setPart('State the practical domain.', tg, { v: 't', other: rg, otherName: 'range', wrong: [{ is: setT('t', -s.r2, s.r1), code: 'ctx-dom-neg', hint: 'Before stocking (' + t('t<0') + ') this relation describes nothing. Start at ' + t('t=0') + '.' }, { is: setT('t', 0, s.tv), code: 'ctx-dom-vertex', hint: 'The model goes on after the peak, until the trout are gone.' }] },
              'From stocking (' + t('t=0') + ') until the trout are gone (' + t('t=' + s.r1) + '): ' + t('D=' + tg) + '.', H_DOM, 'trout domain');
          } },
          { id: 'e6f', sub: 'f-ii', level: 'PRG', outcome: 'RF2', make: function (r, s) {
            var tg = setT('N', 0, s.pk), dg = setT('t', 0, s.r1);
            return setPart('State the practical range.', tg, { v: 'N', other: dg, otherName: 'domain', wrong: [{ is: setT('N', s.c, s.pk), code: 'ctx-rng-start', hint: 'The population falls below the ' + t(s.c) + ' stocked, all the way to ' + t('0') + '.' }] },
              'Fewest ' + t('0') + ' (when they are gone), most ' + t(s.pk) + ' at the vertex: ' + t('R=' + tg) + '.', H_DOM, 'trout range');
          } },
          { id: 'e6g', sub: 'g', level: 'EMG', make: function (r, s) {
            return mc(r, 'The other ' + t('t') + '-intercept is ' + t('t=-' + s.r2) + '. Why does the calculator draw it while a biologist ignores it?', [
              { html: 'The calculator graphs the whole equation, which has two roots. ' + t('t=-' + s.r2) + ' is ' + t(s.r2) + ' years <i>before</i> stocking, outside the practical domain.', right: true },
              { html: t('t=-' + s.r2) + ' is a calculator rounding error.', why: 'Substitute ' + t('t=-' + s.r2) + ': ' + t('N=0') + ' exactly. It is a real root of the equation.' },
              { html: 'It means the trout were gone ' + t(s.r2) + ' years ago.', why: 'Before stocking there were no trout in this model at all; the relation only starts at ' + t('t=0') + '.' },
              { html: 'Biologists only use positive numbers.', why: 'The reason is the situation: time is measured from the stocking.' }],
              'The equation has two roots, and the calculator draws both. But ' + t('t') + ' is measured from the stocking, so ' + t('t=-' + s.r2) + ' is before anything happened: it lies outside the practical domain.', ['When does this situation start?'], 'ignore negative root');
          } }] },

      /* ---------- Part C — where the model stops being realistic ---------- */
      { num: '7', section: 'Extra practice C — Where the model stops being realistic', shared: function (r) {
          return pickWhere(function () {
            var T0 = r.int(85, 95), rt = r.pick([2.4, 2.5, 3.2, 3.6, 4]), room = r.pick([20, 21, 22]), t1 = r.int(5, 15), t2 = r.pick([5, 10, 15]);
            return { T0: T0, rt: rt, room: room, t1: t1, T1: cl(T0 - rt * t1), t2: t2, Tc: cl(T0 - rt * t2), ti: T0 / rt, tr: (T0 - room) / rt, eq: 'T=' + T0 + '-' + nT(rt) + 't' };
          }, function (o) { return isDp(o.Tc, 0) && o.Tc > o.room + 10 && o.T1 > o.room + 3 && (isDp(o.tr, 2) || margin(o.tr, 2)) && (isDp(o.ti, 2) || margin(o.ti, 2)); });
        },
        stem: function (s) { return 'A mug of coffee is poured at ' + t(s.T0 + '^\\circ\\text{C}') + ' in a room kept at ' + t(s.room + '^\\circ\\text{C}') + '. For the first while, its temperature ' + t('T') + ' (in ' + t('^\\circ\\text{C}') + ') after ' + t('t') + ' minutes is modelled by ' + t(s.eq) + '.'; },
        parts: [
          { id: 'e7a', sub: 'a', level: 'BEG', make: function (r, s) {
            return numPart('Use ' + kb('TRACE') + ' to find the temperature after ' + t(s.t1) + ' minutes.', s.T1, 2, [{ v: s.rt * s.t1, code: 'ctx-change', hint: 'That is the drop. Subtract it from ' + t(s.T0) + '.' }, { v: s.T0 + s.rt * s.t1, code: 'ctx-sign', hint: 'The coffee cools: subtract ' + t(nT(s.rt) + '(' + s.t1 + ')') + '.' }],
              t('T=' + s.T0 + '-' + nT(s.rt) + '(' + s.t1 + ')=' + s.T0 + '-' + nT(s.rt * s.t1) + '=' + nT(s.T1) + '^\\circ\\text{C}') + '.', [H_TRACE], 'coffee at ' + s.t1, { after: '°C' });
          } },
          { id: 'e7b', sub: 'b', level: 'EMG', make: function (r, s) {
            return numPart('Use ' + cd('5:intersect') + ' to find when the coffee reaches ' + t(s.Tc + '^\\circ\\text{C}') + '.', s.t2, 2, [{ v: s.Tc / s.rt, code: 'ctx-no-sub', hint: 'Solve ' + t(s.T0 + '-' + nT(s.rt) + 't=' + s.Tc) + ': first subtract ' + t(s.T0) + '.' }, { v: s.T0 - s.rt * s.Tc, code: 'ctx-eval', hint: t(s.Tc) + ' is a temperature (output). Set the formula equal to it.' }],
              t('Y_2=' + s.Tc) + ', ' + cd('5:intersect') + ' gives ' + t('(' + s.t2 + ',\\ ' + s.Tc + ')') + '. Algebra: ' + t(s.T0 + '-' + nT(s.rt) + 't=' + s.Tc + '\\Rightarrow ' + nT(s.rt) + 't=' + (s.T0 - s.Tc) + '\\Rightarrow t=' + s.t2) + ' minutes.', [H_INT], 'coffee reaches ' + s.Tc, { after: 'minutes' });
          } },
          { id: 'e7c', sub: 'c-i', level: 'EMG', make: function (r, s) {
            return numPart('Find the ' + t('t') + '-intercept of the line (nearest hundredth).', s.ti, 2, [{ v: s.tr, code: 'ctx-to-empty', hint: 'That is when the line reaches room temperature. The ' + t('t') + '-intercept is where ' + t('T=0') + '.' }, { v: s.T0, code: 'int-gave-y', hint: 'That is the ' + t('T') + '-intercept. Set ' + t('T=0') + '.' }],
              t('0=' + s.T0 + '-' + nT(s.rt) + 't\\Rightarrow t=\\frac{' + s.T0 + '}{' + nT(s.rt) + '}' + ap(s.ti, 2) + rT(s.ti, 2)) + ' minutes (' + cd('2:zero') + ').', [H_ZERO], 'coffee t-intercept', { after: 'min' });
          } },
          { id: 'e7d', sub: 'c-ii', level: 'EMG', make: function (r, s) {
            return mc(r, 'Why is the ' + t('t') + '-intercept nonsense for a mug of coffee?', [
              { html: 'The model says the coffee reaches ' + t('0^\\circ\\text{C}') + ', but in a ' + t(s.room + '^\\circ\\text{C}') + ' room it can never get colder than the room.', right: true },
              { html: 'It is negative, and times can’t be negative.', why: 'The intercept, ' + t(rT(s.ti, 2)) + ', is positive. Think about the temperature it predicts.' },
              { html: 'Coffee always boils away before it cools that much.', why: 'Cooling coffee doesn’t boil. Compare ' + t('0^\\circ\\text{C}') + ' with the room temperature.' },
              { html: 'It isn’t nonsense: coffee left long enough freezes.', why: 'Coffee on a table in a ' + t(s.room + '^\\circ\\text{C}') + ' room ends up at room temperature, not frozen.' }],
              'At the ' + t('t') + '-intercept the line predicts ' + t('0^\\circ\\text{C}') + ' (freezing). A mug in a ' + t(s.room + '^\\circ\\text{C}') + ' room can only cool down to ' + t(s.room + '^\\circ\\text{C}') + '.', ['What temperature does the model give at the ' + t('t') + '-intercept?'], 'coffee intercept nonsense');
          } },
          { id: 'e7e', sub: 'd', level: 'EMG', make: function (r, s) {
            return numPart('Graph ' + t('Y_2=' + s.room) + '. At what time does the line reach room temperature (nearest hundredth)? From then on the model stops being realistic.', s.tr, 2, [{ v: s.ti, code: 'ctx-to-empty', hint: 'That is when the line reaches ' + t('0^\\circ\\text{C}') + '. Use ' + t('Y_2=' + s.room) + '.' }, { v: s.room / s.rt, code: 'ctx-no-sub', hint: 'Solve ' + t(s.T0 + '-' + nT(s.rt) + 't=' + s.room) + ': subtract ' + t(s.T0) + ' first.' }],
              cd('5:intersect') + ' with ' + t('Y_2=' + s.room) + '. Algebra: ' + t(s.T0 + '-' + nT(s.rt) + 't=' + s.room + '\\Rightarrow ' + nT(s.rt) + 't=' + (s.T0 - s.room) + '\\Rightarrow t' + ap(s.tr, 2) + rT(s.tr, 2)) + ' min. After this the line predicts temperatures below the room’s, which can’t happen.', [H_INT], 'coffee reaches room temp', { after: 'min' });
          } },
          { id: 'e7f', sub: 'e-i', level: 'PRG', outcome: 'RF2', make: function (r, s) {
            var hi = rd(s.tr, 2), tg = setT('t', 0, hi), rg = setT('T', s.room, s.T0);
            return setPart('State the practical domain, using your answer to the previous part (room temperature) as the upper bound.', tg, { v: 't', other: rg, otherName: 'range', wrong: [{ is: setT('t', 0, rd(s.ti, 2)), code: 'ctx-to-empty', hint: 'The model stops being realistic at room temperature, before it reaches ' + t('0^\\circ\\text{C}') + '.' }] },
              'From pouring to reaching room temperature: ' + t('D=' + tg) + '.', H_DOM, 'coffee domain');
          } },
          { id: 'e7g', sub: 'e-ii', level: 'PRG', outcome: 'RF2', make: function (r, s) {
            var tg = setT('T', s.room, s.T0), dg = setT('t', 0, rd(s.tr, 2));
            return setPart('State the practical range.', tg, { v: 'T', other: dg, otherName: 'domain', wrong: [{ is: setT('T', 0, s.T0), code: 'ctx-rng-start', hint: 'The coffee only cools down to room temperature, ' + t(s.room + '^\\circ\\text{C}') + '.' }] },
              'From ' + t(s.T0 + '^\\circ\\text{C}') + ' down to ' + t(s.room + '^\\circ\\text{C}') + ': ' + t('R=' + tg) + '.', H_DOM, 'coffee range');
          } },
          { id: 'e7h', sub: 'f', level: 'EMG', make: function (r, s) {
            return mc(r, 'Real coffee doesn’t drop below room temperature, and it cools fastest at the start. How does the true graph differ from this straight line?', [
              { html: 'It is a curve: steep at first, then flattening out as it approaches ' + t(s.room + '^\\circ\\text{C}') + ', levelling off there instead of crossing it.', right: true },
              { html: 'It is a steeper straight line that reaches ' + t('0^\\circ\\text{C}') + ' sooner.', why: 'Real coffee never reaches ' + t('0^\\circ\\text{C}') + ' in a warm room, and its rate of cooling changes.' },
              { html: 'It is a curve that starts flat and gets steeper and steeper.', why: 'The question says it cools <b>fastest at the start</b> — steepest at first.' },
              { html: 'It is the same line, but it stops at ' + t(s.room + '^\\circ\\text{C}') + '.', why: 'A straight line means a constant rate. Real coffee slows down as it gets close to room temperature.' }],
              'Fastest at the start means steepest at the start; never below room temperature means it flattens and levels off at ' + t(s.room + '^\\circ\\text{C}') + '. So the true graph is a curve that bends toward the line ' + t('T=' + s.room) + '.', ['Steep where it cools fast, flat where it cools slowly.'], 'true cooling curve');
          } }] },
      { num: '8', shared: function (r) {
          return pickWhere(function () {
            var P0 = r.pick([3600, 4200, 4800, 5400, 6000]), rt = r.pick([60, 75, 85, 90, 110, 120]), base = r.pick([2005, 2010, 2015]), Pt = 100 * r.int(15, 50), Y = r.pick([15, 20, 25]);
            return { P0: P0, rt: rt, base: base, Pt: Pt, t1: (P0 - Pt) / rt, ti: P0 / rt, Y: Y, PY: P0 - rt * Y, eq: 'P=' + F(P0) + '-' + rt + 't' };
          }, function (o) { return o.t1 > 6 && o.t1 < 26 && !isDp(o.t1, 0) && margin(o.t1, 2) && (isDp(o.ti, 2) || margin(o.ti, 2)) && o.ti > 30 && o.PY > 500 && Math.floor(o.base + o.t1) !== Math.ceil(o.base + o.t1); });
        },
        stem: function (s) { return 'A town’s population, ' + t('P') + ', is modelled by ' + t(s.eq) + ', where ' + t('t') + ' is the number of years since ' + s.base + '.'; },
        parts: [
          { id: 'e8a', sub: 'b', level: 'EMG', make: function (r, s) {
            var yr = Math.floor(s.base + s.t1);
            return fieldsPart('In what year does the model give a population of ' + t(F(s.Pt)) + '? Give the number of years (nearest hundredth) and then the calendar year.', [
              { label: 'Years since ' + s.base, x: s.t1, d: 2, cands: [{ v: s.Pt / s.rt, code: 'ctx-no-sub', hint: 'Solve ' + t(F(s.P0) + '-' + s.rt + 't=' + F(s.Pt)) + ': the change is ' + t(F(s.P0) + '-' + F(s.Pt)) + '.' }] },
              { label: 'Calendar year', x: yr, d: 0, plain: true, cands: [{ v: yr + 1, code: 'ctx-year-round', hint: t(s.base + '+' + rT(s.t1, 2) + '=' + rT(s.base + s.t1, 2)) + ' is part-way through ' + yr + ', so it happens <b>during</b> ' + yr + '.' }, { v: Math.round(s.t1), code: 'ctx-year-round', hint: 'Add the years to ' + s.base + ' to get the calendar year.' }] }],
              t(F(s.P0) + '-' + s.rt + 't=' + F(s.Pt) + '\\Rightarrow ' + s.rt + 't=' + F(s.P0 - s.Pt) + '\\Rightarrow t\\approx ' + rT(s.t1, 2)) + ' years (' + cd('5:intersect') + '). ' + t(s.base + '+' + rT(s.t1, 2) + '=' + rT(s.base + s.t1, 2)) + ', so during ' + yr + '.', [H_INT, 'Add the years to ' + s.base + '; a part-way year is still that calendar year.'], 'year population ' + s.Pt);
          } },
          { id: 'e8b', sub: 'c', level: 'EMG', make: function (r, s) {
            return numPart('Find the ' + t('t') + '-intercept (nearest hundredth). The model claims the town is empty then.', s.ti, 2, [{ v: s.P0, code: 'int-gave-y', hint: 'That is the ' + t('P') + '-intercept. Set ' + t('P=0') + '.' }, { v: s.base + s.ti, code: 'ctx-year-round', hint: 'Give the number of years since ' + s.base + ', not the calendar year.' }],
              t('0=' + F(s.P0) + '-' + s.rt + 't\\Rightarrow t=\\frac{' + F(s.P0) + '}{' + s.rt + '}' + ap(s.ti, 2) + rT(s.ti, 2)) + ' years: the model claims the town is empty during ' + Math.floor(s.base + s.ti) + '.', [H_ZERO], 'town t-intercept', { after: 'years' });
          } },
          { id: 'e8c', sub: 'd', level: 'EMG', make: function (r, s) {
            return mc(r, 'Which is the best reason a straight line is a poor model for the town that far into the future?', [
              { html: 'A line loses exactly ' + t(s.rt) + ' people every year for decades; real towns change (a new employer, a closure), and the line goes below zero people after ' + t(rT(s.ti, 2)) + ' years.', right: true },
              { html: 'Populations always grow, so the line should go up.', why: 'Many towns do shrink. The issue is that a constant change for decades is unrealistic.' },
              { html: 'A line can’t be used for populations at all.', why: 'For a few years a line can be a fine model; it is the long-term prediction that fails.' },
              { html: 'The model is wrong because ' + t(F(s.P0)) + ' is too big for a town.', why: 'The starting size is fine. Think about what happens to the line decades later.' }],
              'A straight line assumes the same change, ' + t('-' + s.rt) + ' people per year, forever. Over decades real causes change the rate, and a population can’t fall below zero as the line does after ' + t(rT(s.ti, 2)) + ' years.', ['What does the line assume about the change each year?'], 'line poor long-term');
          } },
          { id: 'e8d', sub: 'e-i', level: 'PRG', outcome: 'RF2', make: function (r, s) {
            var tg = setT('t', 0, s.Y), rg = setT('P', s.PY, s.P0);
            return setPart('The council trusts the model for ' + t(s.Y) + ' years only. State the practical domain under that restriction.', tg, { v: 't', other: rg, otherName: 'range', wrong: [{ is: setT('t', 0, rd(s.ti, 2)), code: 'ctx-dom-open', hint: 'The council only trusts the first ' + t(s.Y) + ' years.' }] },
              t('D=' + tg) + '.', H_DOM, 'town domain');
          } },
          { id: 'e8e', sub: 'e-ii', level: 'PRG', outcome: 'RF2', make: function (r, s) {
            var tg = setT('P', s.PY, s.P0), dg = setT('t', 0, s.Y);
            return setPart('State the practical range for those ' + t(s.Y) + ' years.', tg, { v: 'P', other: dg, otherName: 'domain', wrong: [{ is: setT('P', 0, s.P0), code: 'ctx-rng-start', hint: 'Only the first ' + t(s.Y) + ' years count: find ' + t('P') + ' at ' + t('t=' + s.Y) + '.' }] },
              t('t=0') + ': ' + t('P=' + F(s.P0)) + '. ' + t('t=' + s.Y) + ': ' + t('P=' + F(s.P0) + '-' + s.rt + '(' + s.Y + ')=' + F(s.PY)) + '. So ' + t('R=' + tg) + '.', H_DOM, 'town range');
          } },
          { id: 'e8f', sub: 'f', level: 'EMG', outcome: 'RF2', make: function (r, s) {
            return mc(r, 'A population is a whole number of people, yet the range above uses ' + t('P\\in\\mathbb{R}') + '. Why is that reasonable for a model?', [
              { html: 'The model gives the trend: as ' + t('t') + ' varies continuously the line passes through every value between the ends. A real head count just rounds those values.', right: true },
              { html: 'It isn’t reasonable: a population range must always be written with ' + t('\\in I') + '.', why: 'For a model of a trend, ' + t('\\in\\mathbb{R}') + ' is a fair description; ' + t('\\in I') + ' would be a list of ' + t(F(s.P0 - s.PY + 1)) + ' values.' },
              { html: 'Because towns can contain fractions of people.', why: 'People are whole — the model’s outputs just aren’t. A count would round them.' },
              { html: 'Because ' + t('\\mathbb{R}') + ' means the population is rising.', why: t('\\mathbb{R}') + ' only says which numbers are allowed (all real numbers between the ends).' }],
              'The line is a model of the trend, and as ' + t('t') + ' varies it passes through every value between ' + t(F(s.PY)) + ' and ' + t(F(s.P0)) + '. Insisting on whole people would give ' + t('\\{P\\mid ' + s.PY + '\\le P\\le ' + s.P0 + ',\\ P\\in I\\}') + ', a list of whole numbers.', ['What does a model describe: exact head counts, or the trend?'], 'R vs I for population');
          } }] },
      { num: '9', stem: 'Every calculator draws more of a curve than the situation allows.', parts: [
        { id: 'e9a', sub: 'a–c', level: 'EMG', make: function (r) {
          var Z = r.pick([20, 25, 30]), Bc = r.pick([4, 5]), b = r.pick([20, 25, 30]), c = r.pick([1, 2, 3]), F0 = r.pick([72, 84, 90]), k = { 72: 0.12, 84: 0.14, 90: 0.15 }[F0], dI = Math.round(F0 / k);
          var list = '<ol type="a"><li>' + t('V=' + (Bc * Z) + 'p-' + Bc + 'p^{2}') + ', the weekly revenue when a phone case costs ' + t('p') + ' dollars and ' + t((Bc * Z) + '-' + Bc + 'p') + ' cases sell, for ' + t('p>' + Z) + '</li><li>' + t('h=' + quadT(-5, b, c, 't')) + ', a fireworks shell ' + t('t') + ' seconds after firing, for ' + t('t<0') + '</li><li>' + t('F=' + F0 + '-' + nT(k) + 'd') + ', the fuel left after ' + t('d') + ' km, for ' + t('d>' + dI) + '</li></ol>';
          var rows = [{ id: 'rev', html: '(a) revenue' }, { id: 'shell', html: '(b) shell' }, { id: 'fuel', html: '(c) fuel' }];
          var cols = [{ id: 'before', html: 'time before it began' }, { id: 'neg', html: 'impossible negative amount' }];
          var want = { rev: 'neg', shell: 'before', fuel: 'neg' };
          var why = { rev: '(a) For ' + t('p>' + Z) + ', ' + t((Bc * Z) + '-' + Bc + 'p<0') + ': a negative number of cases sold (and negative revenue). A price of ' + t(money(Z + 1)) + ' is fine — the shop simply sells nothing.',
            shell: '', fuel: '(c) For ' + t('d>' + dI) + ', ' + t('F<0') + ': a negative volume of fuel. The truck stops when the tank is empty.' };
          why.shell = '(b) ' + t('t<0') + ' is time <b>before</b> the shell was fired; it was still in the tube.';
          return B.grid('The calculator draws each of these pieces, but the situation throws them away:' + list + 'For each piece, choose the reason.', rows, cols, want, { why: function (row) { return { code: 'row', hint: why[row] }; } },
            rows.map(function (x) { return why[x.id]; }).join('<br>'), ['For each piece, ask: is the problem the input (when) or the output (how much)?'], 'pieces the situation throws away');
        } },
        { id: 'e9b', sub: 'd', level: 'PRG', make: function (r) {
          var o = pickWhere(function () { var b = r.pick([30, 36, 40, 44]), c = r.pick([200, 250, 300, 350]), r1 = b - Math.sqrt(b * b - 2 * c), n = Math.floor(r1 * 0.6); return { b: b, c: c, r1: r1, n: n, Pn: cl(-0.5 * n * n + b * n - c) }; }, function (o) { return o.n >= 2 && o.Pn < 0; });
          return mc(r, 'A student concludes: “the practical part of any graph is the part in Quadrant I.” Use a food truck’s profit ' + t('P=' + quadT(-0.5, o.b, -o.c, 'n')) + ' (for ' + t('n') + ' meals sold) to test the claim.', [
            { html: '<b>False.</b> For a slow day, e.g. ' + t('n=' + o.n) + ', ' + t('P=' + money(o.Pn)) + ': the point is in Quadrant IV and perfectly realistic. What decides is which values the quantities can really take.', right: true },
            { html: '<b>True.</b> A negative profit never makes sense, so only Quadrant I counts.', why: 'Can a food truck lose money? A negative profit is a loss — it really happens.' },
            { html: '<b>False.</b> The practical part is always the whole parabola.', why: 'Negative numbers of meals still make no sense. The rule is about the quantities, not “all” or “Quadrant I”.' },
            { html: '<b>True.</b> The calculator only graphs Quadrant I when ' + cd('Xmin') + ' = 0.', why: 'The window doesn’t decide what is realistic. Check a slow day: ' + t('P(' + o.n + ')') + '.' }],
            t('P(' + o.n + ')=' + nT(-0.5 * o.n * o.n) + '+' + (o.b * o.n) + '-' + o.c + '=' + money(o.Pn)) + ': a real loss on a slow day, at ' + t('(' + o.n + ',\\ ' + o.Pn + ')') + ' in Quadrant IV. The practical domain and range come from which values the quantities can take, not from the quadrant.', ['Find the profit for a small number of meals.'], 'Quadrant I claim');
        } }] },

      /* ---------- Part D — saying what each feature means ---------- */
      { num: '10', section: 'Extra practice D — Saying what each feature means', stem: 'Each model below comes with one feature already found. Choose the sentence that says, in context, what that feature means.', parts: [
        { id: 'e10a', sub: 'a', level: 'EMG', make: function (r) {
          var b = r.pick([15, 20, 25, 30]), c = r.pick([1.2, 1.5, 1.8, 2]), tv = cl(b / 10), pk = cl(b * b / 20 + c);
          return mc(r, t('h=' + quadT(-5, b, c, 't')) + ' — the height of a thrown ball, ' + t('h') + ' in metres, ' + t('t') + ' in seconds. <i>Vertex:</i> ' + t('(' + nT(tv) + ',\\ ' + nT(pk) + ')') + '.', [
            { html: 'The ball reaches its greatest height, ' + t(nT(pk)) + ' m, ' + t(nT(tv)) + ' s after it is thrown.', right: true },
            { html: 'The ball reaches its greatest height, ' + t(nT(tv)) + ' m, ' + t(nT(pk)) + ' s after it is thrown.', why: 'The vertex is ' + t('(t,\\ h)') + ': time first, then height.' },
            { html: 'The ball lands ' + t(nT(tv)) + ' s after it is thrown.', why: 'At the landing ' + t('h=0') + '. The vertex is the highest point.' },
            { html: 'The ball is thrown from a height of ' + t(nT(pk)) + ' m.', why: 'The starting height is the ' + t('h') + '-intercept, ' + t(nT(c)) + ' m.' }],
            'Check: ' + t('h(' + nT(tv) + ')=' + nT(-5 * tv * tv) + '+' + nT(b * tv) + '+' + nT(c) + '=' + nT(pk)) + '. The vertex is the top of the flight: greatest height ' + t(nT(pk)) + ' m at ' + t(nT(tv)) + ' s.', ['A vertex is (input, output) at the turning point.'], 'meaning of vertex');
        } },
        { id: 'e10b', sub: 'b', level: 'EMG', make: function (r) {
          var u = r.pick([0.45, 0.62, 0.75, 0.85]), S = r.pick([120, 150, 180, 240]);
          return mc(r, t('C=' + nT(u) + 'n+' + S) + ' — the cost of printing ' + t('n') + ' concert programs, ' + t('C') + ' in dollars. <i>' + t('C') + '-intercept:</i> ' + t(S) + '.', [
            { html: 'Printing no programs still costs ' + t(money(S)) + ': a fixed setup charge paid before any program is printed. Each program then adds ' + t(money(u)) + '.', right: true },
            { html: 'Each program costs ' + t(money(S)) + ' to print.', why: 'Each program adds ' + t(money(u)) + '. The ' + t('C') + '-intercept is the cost at ' + t('n=0') + '.' },
            { html: t(S) + ' programs can be printed for free.', why: 'The intercept is a cost (' + t('C') + ') at ' + t('n=0') + ', not a number of programs.' },
            { html: 'The printer can print at most ' + t(S) + ' programs.', why: 'The intercept says nothing about a limit; it is the cost when ' + t('n=0') + '.' }],
            'At ' + t('n=0') + ', ' + t('C=' + S) + ': ' + t(money(S)) + ' before a single program is printed — the fixed setup charge.', ['Find ' + t('C') + ' when ' + t('n=0') + '.'], 'meaning of C-intercept programs');
        } },
        { id: 'e10c', sub: 'c', level: 'EMG', make: function (r) {
          var rt = r.pick([300, 400, 450, 500, 600]), M = r.int(9, 15), V0 = rt * M;
          return mc(r, t('V=' + F(V0) + '-' + rt + 't') + ' — the value of a snow machine, ' + t('V') + ' in dollars, ' + t('t') + ' in months. <i>' + t('t') + '-intercept:</i> ' + t(M) + '.', [
            { html: 'The model says the snow machine is worth ' + t('\\$0') + ' ' + t(M) + ' months after it is bought.', right: true },
            { html: 'The snow machine loses ' + t(money(M)) + ' each month.', why: 'It loses ' + t(money(rt)) + ' a month. The ' + t('t') + '-intercept is a time, where ' + t('V=0') + '.' },
            { html: 'The snow machine is worth ' + t(money(M)) + ' when it is bought.', why: 'Its starting value is the ' + t('V') + '-intercept, ' + t(money(V0)) + '.' },
            { html: 'The snow machine is worth ' + t(money(V0)) + ' after ' + t(M) + ' months.', why: 'At the ' + t('t') + '-intercept the value is ' + t('0') + '.' }],
            'Check: ' + t(F(V0) + '-' + rt + '(' + M + ')=0') + '. The ' + t('t') + '-intercept is when the value reaches ' + t('\\$0') + ': ' + t(M) + ' months after purchase.', ['At a ' + t('t') + '-intercept, ' + t('V=0') + '.'], 'meaning of t-intercept value');
        } },
        { id: 'e10d', sub: 'd', level: 'EMG', make: function (r) {
          var o = pickWhere(function () { var b = r.pick([20, 24, 30, 36]), c = r.pick([100, 150, 200, 250, 300]), q = Math.sqrt(b * b - c); return { b: b, c: c, r1: 2 * b - 2 * q, r2: 2 * b + 2 * q }; }, function (o) { return o.r1 > 1.5 && !isDp(o.r1, 0); });
          var lo = Math.ceil(o.r1), hi = Math.floor(o.r2);
          return mc(r, t('P=' + quadT(-0.25, o.b, -o.c, 'n')) + ' — the profit from a banquet, ' + t('P') + ' in dollars, ' + t('n') + ' meals served. <i>' + t('n') + '-intercepts:</i> ' + t(rT(o.r1, 2)) + ' and ' + t(rT(o.r2, 2)) + '.', [
            { html: 'The banquet breaks even (profit ' + t('\\$0') + ') at about ' + t(rT(o.r1, 2)) + ' and ' + t(rT(o.r2, 2)) + ' meals; serving from ' + t(lo) + ' to ' + t(hi) + ' meals makes a profit, fewer or more loses money.', right: true },
            { html: 'The banquet makes its greatest profit at ' + t(rT(o.r1, 2)) + ' and ' + t(rT(o.r2, 2)) + ' meals.', why: 'At an ' + t('n') + '-intercept the profit is ' + t('\\$0') + '. The greatest profit is at the vertex, between them.' },
            { html: 'The banquet loses money when it serves between ' + t(lo) + ' and ' + t(hi) + ' meals.', why: 'The parabola opens down, so the profit is <b>positive</b> between the intercepts.' },
            { html: 'The banquet earns ' + t(money(rd(o.r1, 2))) + ' and ' + t(money(rd(o.r2, 2))) + '.', why: 'The intercepts are numbers of meals (' + t('n') + '), where ' + t('P=0') + '.' }],
            'At the ' + t('n') + '-intercepts ' + t('P=0') + ': break-even points. The parabola opens down, so between them the profit is positive; meals are whole, so it profits from ' + t(lo) + ' to ' + t(hi) + ' meals.', ['What is ' + t('P') + ' at an ' + t('n') + '-intercept? Is the profit positive between them or outside them?'], 'meaning of n-intercepts');
        } }] },
      { num: '11', shared: function (r) {
          var a = r.pick([4, 5]), R = r.pick([5, 7]), tv = (R - 1) / 2, h0 = a * R, pk = a * Math.pow((R + 1) / 2, 2);
          return { a: a, R: R, tv: tv, h0: h0, pk: pk, H: pk - a, b: a * (R - 1), eq: 'h=' + quadT(-a, a * (R - 1), a * R, 't') };
        },
        stem: function (s) {
          // grid squares are a metres up, so A, B, D and the height in (f) all sit on grid lines (h0 = aR, pk and H are multiples of a)
          var ly = s.a === 4 || s.pk > 54 ? 20 : 10, top = Math.ceil((s.pk + 6) / ly) * ly, f = function (x) { return -s.a * x * x + s.b * x + s.h0; };
          return 'A stunt diver is launched upward from a platform above a lake. Her height above the water, in metres, ' + t('t') + ' seconds after launch is ' + t(s.eq) + '. Each grid square is ' + t('0.5') + ' s across and ' + t(s.a) + ' m up.' +
            HW.graph({ x: [0, s.R + 0.5], y: [0, top], unitX: 270 / (s.R + 0.5), unitY: 190 / top, grid: 0.5, gridY: s.a, labels: 1, labelsX: 1, labelsY: ly, firstQuadrant: true, xName: 't', yName: 'h', xTitle: 'Time (s)', yTitle: 'Height (m)', max: 360,
              fns: [{ f: f, from: 0, to: s.R }], points: [{ x: 0, y: s.h0, label: 'A' }, { x: s.tv, y: s.pk, label: 'B' }, { x: s.R, y: 0, label: 'C' }, { x: 2 * s.tv, y: s.h0, label: 'D' }], aria: 'graph of the diver’s height with points A, B, C, D' });
        },
        parts: [
          { id: 'e11a', sub: 'a', level: 'BEG', make: function (r, s) { return ptPart('State the coordinates of ' + t('A') + '.', 'A', [0, s.h0], t('h(0)=' + s.h0) + ', so ' + t('A(0,\\ ' + s.h0 + ')') + ': the platform is ' + t(s.h0) + ' m above the water — her height at launch.', 'diver A'); } },
          { id: 'e11b', sub: 'b', level: 'EMG', make: function (r, s) { return ptPart('State the coordinates of ' + t('B') + ', the highest point.', 'B', [s.tv, s.pk], t('t=-\\frac{' + s.b + '}{2(-' + s.a + ')}=' + s.tv) + ', ' + t('h(' + s.tv + ')=' + (-s.a * s.tv * s.tv) + '+' + (s.b * s.tv) + '+' + s.h0 + '=' + s.pk) + ': ' + t('B(' + s.tv + ',\\ ' + s.pk + ')') + ' — ' + t(s.tv) + ' s after launch she reaches her greatest height, ' + t(s.pk) + ' m.', 'diver B'); } },
          { id: 'e11c', sub: 'c', level: 'BEG', make: function (r, s) { return ptPart('State the coordinates of ' + t('C') + ', where she enters the water.', 'C', [s.R, 0], t('h(' + s.R + ')=' + (-s.a * s.R * s.R) + '+' + (s.b * s.R) + '+' + s.h0 + '=0') + ': ' + t('C(' + s.R + ',\\ 0)') + ' — she enters the water ' + t(s.R) + ' s after launch.', 'diver C'); } },
          { id: 'e11d', sub: 'd', level: 'EMG', make: function (r, s) {
            return mc(r, t('A') + ' and ' + t('D') + ' have the same height. Why?', [
              { html: 'The axis of symmetry is ' + t('t=' + s.tv) + ', through ' + t('B') + '. ' + t('A') + ' (' + t('t=0') + ') and ' + t('D') + ' (' + t('t=' + 2 * s.tv) + ') are each ' + t(s.tv) + ' s from it, so their heights match.', right: true },
              { html: 'She stops at ' + t('D') + ' to rest at platform height.', why: 'The graph keeps falling through ' + t('D') + '; she passes the platform height on the way down.' },
              { html: t('D') + ' is halfway between ' + t('B') + ' and ' + t('C') + '.', why: 'Check the times: ' + t('D') + ' is at ' + t('t=' + 2 * s.tv) + '. Compare its distance from the vertex with ' + t('A') + '’s.' },
              { html: 'Every parabola has the same height at ' + t('t=0') + ' and ' + t('t=' + 2 * s.tv) + '.', why: 'That depends on where the vertex is: here the axis of symmetry is ' + t('t=' + s.tv) + '.' }],
              'The parabola is symmetric about ' + t('t=' + s.tv) + '. ' + t('A') + ' and ' + t('D') + ' are each ' + t(s.tv) + ' s from it, so ' + t('h(' + 2 * s.tv + ')=h(0)=' + s.h0) + ' m: she passes the platform height on the way down.', ['Where is the axis of symmetry?'], 'diver symmetry');
          } },
          { id: 'e11e', sub: 'e-i', level: 'PRG', outcome: 'RF2', make: function (r, s) {
            var tg = setT('t', 0, s.R), rg = setT('h', 0, s.pk);
            return setPart('State the practical domain.', tg, { v: 't', other: rg, otherName: 'range', wrong: [{ is: setT('t', 0, s.tv), code: 'ctx-dom-vertex', hint: 'Her dive goes on after the top, until she enters the water at ' + t('C') + '.' }, { is: setT('t', -1, s.R), code: 'ctx-dom-neg', hint: 'Before launch she isn’t flying; start at ' + t('t=0') + '.' }] },
              'Launch (' + t('t=0') + ') to entering the water (' + t('t=' + s.R) + '): ' + t('D=' + tg) + '.', H_DOM, 'diver domain');
          } },
          { id: 'e11f', sub: 'e-ii', level: 'PRG', outcome: 'RF2', make: function (r, s) {
            var tg = setT('h', 0, s.pk), dg = setT('t', 0, s.R);
            return setPart('State the practical range.', tg, { v: 'h', other: dg, otherName: 'domain', wrong: [{ is: setT('h', s.h0, s.pk), code: 'ctx-rng-start', hint: 'She ends at the water, ' + t('h=0') + ', below the platform.' }] },
              'Lowest ' + t('0') + ' (the water), highest ' + t(s.pk) + ' m at ' + t('B') + ': ' + t('R=' + tg) + '.', H_DOM, 'diver range');
          } },
          { id: 'e11g', sub: 'f', level: 'EMG', make: function (r, s) {
            return fieldsPart('A rescue boat must stay clear while the diver is above ' + t(s.H) + ' m. Between which two times is she above ' + t(s.H) + ' m? Read them from the graph and check on your calculator.', [
              { label: 'Earlier time', x: s.tv - 1, d: 2, after: 's', cands: [] }, { label: 'Later time', x: s.tv + 1, d: 2, after: 's', cands: [{ v: s.R, code: 'ctx-gave-end', hint: 'That is when she enters the water. Find where she passes ' + t(s.H) + ' m on the way down.' }] }],
              'On the graph ' + t('h=' + s.H) + ' at ' + t('t=' + (s.tv - 1)) + ' and ' + t('t=' + (s.tv + 1)) + '. Check: ' + t(s.eq.slice(2) + '=' + s.H + '\\Rightarrow ' + quadT(1, -(s.R - 1), s.H / s.a - s.R, 't') + '=0\\Rightarrow (t-' + (s.tv - 1) + ')(t-' + (s.tv + 1) + ')=0') + '. She is above ' + t(s.H) + ' m from ' + t(s.tv - 1) + ' s to ' + t(s.tv + 1) + ' s.', [H_INT], 'diver above ' + s.H, { swap: 'form' });
          } }] },

      /* ---------- Part E — error analysis ---------- */
      { num: '12', section: 'Extra practice E — Error analysis', shared: function (r) {
          var o = r.pick([[4, 2], [3, 1], [5, 1], [6, 2], [5, 3]]), R = o[0], S = o[1];
          return { R: R, S: S, b: 5 * (R - S), c: 5 * R * S, tv: (R - S) / 2, pk: 5 * Math.pow((R + S) / 2, 2), eq: 'h=' + quadT(-5, 5 * (R - S), 5 * R * S, 't') };
        },
        stem: function (s) { return 'A ball is thrown upward from a balcony. Its height above the ground, in metres, after ' + t('t') + ' seconds is ' + t(s.eq) + '. Asked how long the ball is in the air, a student uses ' + cd('2:zero') + ', reports <b>' + t('-' + s.S) + ' seconds</b>, and moves on.'; },
        parts: [
          { id: 'e12a', sub: 'a', level: 'BEG', make: function (r, s) {
            return B.tf(r, 'True or false: substituting ' + t('t=-' + s.S) + ' gives ' + t('h=0') + ', so ' + t('t=-' + s.S) + ' is a solution of the equation ' + t(quadT(-5, s.b, s.c, 't') + '=0') + '.', true, 'Substitute: ' + t('-5(-' + s.S + ')^{2}+' + s.b + '(-' + s.S + ')+' + s.c + '=' + (-5 * s.S * s.S) + (-s.b * s.S) + '+' + s.c + '=0') + '. It does solve the equation.',
              t('h(-' + s.S + ')=-5(' + (s.S * s.S) + ')-' + (s.b * s.S) + '+' + s.c + '=0') + ' — <b>true</b>: ' + t('t=-' + s.S) + ' is a solution of the equation. The trouble is elsewhere.', ['Substitute ' + t('t=-' + s.S) + ' and see whether you get ' + t('0') + '.'], 'is -S a root');
          } },
          { id: 'e12b', sub: 'b', level: 'EMG', make: function (r, s) {
            return mc(r, '“Correct algebra, wrong answer.” Why can’t ' + t('-' + s.S) + ' seconds be the answer?', [
              { html: t('t') + ' is measured from the throw, so ' + t('t=-' + s.S) + ' is ' + t(s.S) + ' s <i>before</i> the ball was released — outside the practical domain, even though it solves the equation.', right: true },
              { html: 'It doesn’t solve the equation; the student made an arithmetic error.', why: 'Substitute it: ' + t('h(-' + s.S + ')=0') + '. The algebra is fine; the problem is what ' + t('t=-' + s.S) + ' means.' },
              { html: 'It can: the minus sign just shows the ball is falling.', why: 'A negative ' + t('t') + ' is a time before the throw, not a direction.' },
              { html: 'A ball can’t be in the air for less than ' + t('5') + ' seconds.', why: 'There is no such rule. Ask what ' + t('t=-' + s.S) + ' means for this throw.' }],
              'Both zeros satisfy the equation, so the algebra is sound. But ' + t('t') + ' starts at the throw, and ' + t('t=-' + s.S) + ' is before it — the ball was still in the thrower’s hand. Only the positive zero lies in the practical domain.', ['What does a negative value of ' + t('t') + ' mean here?'], 'why negative root wrong');
          } },
          { id: 'e12c', sub: 'c', level: 'EMG', make: function (r, s) {
            return numPart('Find the other ' + t('t') + '-intercept: how long is the ball in the air?', s.R, 2, [
              { v: -s.S, code: 'ctx-neg-time', hint: 'That is the student’s answer, before the throw. Use the other zero.' },
              { v: s.S, code: 'int-sign', hint: 'The other zero isn’t just the opposite of ' + t('-' + s.S) + '. Use ' + cd('2:zero') + ' on the right-hand crossing.' },
              { v: s.tv, code: 'ctx-max-time', hint: 'That is the time of the highest point.' },
              { v: s.R + s.S, code: 'ctx-sum', hint: 'Don’t combine the two zeros: the ball is thrown at ' + t('t=0') + ' and lands at the positive zero.' }],
              zeroSol(quadT(-5, s.b, s.c, 't'), 't', [-s.S, s.R], 1, 2) + ' (factored: ' + t('-5(t-' + s.R + ')(t+' + s.S + ')=0') + '). The ball is in the air ' + t(s.R) + ' s.', [H_ZERO], 'time in air', { after: 's' });
          } },
          { id: 'e12d', sub: 'd', level: 'EMG', make: function (r, s) {
            return mc(r, 'What single window setting would have stopped this mistake before it started?', [
              { html: cd('Xmin') + ' = 0', right: true },
              { html: cd('Ymin') + ' = 0', why: 'The negative zero is on the ' + t('t') + '-axis at ' + t('h=0') + ', so it is still on the screen. Hide the negative <b>times</b> instead.' },
              { html: cd('Xmax') + ' = 10', why: 'That changes the right edge. The mistake was on the left: negative times.' },
              { html: 'The standard window ' + kb('ZOOM 6'), why: 'That window runs from ' + t('-10') + ' to ' + t('10') + ' and shows the negative zero.' }],
              'Time starts at the throw. With ' + cd('Xmin') + ' = 0 the negative zero is off the screen, so ' + cd('2:zero') + ' can only find ' + t('t=' + s.R) + '.', ['Which edge of the screen is the negative zero near?'], 'window prevents error');
          } },
          { id: 'e12e', sub: 'e', level: 'EMG', make: function (r, s) {
            return fieldsPart('State the height of the balcony and the greatest height the ball reaches.', [
              { label: 'Balcony height', x: s.c, d: 2, after: 'm', cands: [] }, { label: 'Greatest height', x: s.pk, d: 2, after: 'm', cands: [{ v: s.tv, code: 'ctx-max-time', hint: 'That is the time of the highest point. Substitute it into the formula.' }] }],
              t('h(0)=' + s.c) + ': the balcony is ' + t(s.c) + ' m up. Vertex: ' + t('t=-\\frac{' + s.b + '}{2(-5)}=' + s.tv) + ', ' + t('h(' + s.tv + ')=' + (-5 * s.tv * s.tv) + '+' + (s.b * s.tv) + '+' + s.c + '=' + s.pk) + ' m (' + cd('4:maximum') + ').', [H_MAX, 'The balcony height is the value at ' + t('t=0') + '.'], 'balcony and max', { swap: 'wrong', swapHint: 'Those are swapped: the balcony is the height at ' + t('t=0') + ', the greatest height is at the vertex.' });
          } }] },
      { num: '13', shared: function (r) {
          var a = r.pick([0.2, 0.4, 0.5]), nv = r.pick([40, 50, 60, 75, 80]), b = cl(2 * a * nv), Ws = nv - r.pick([10, 20]);
          var V = function (n) { return cl(-a * n * n + b * n); };
          return { a: a, nv: nv, b: b, Ws: Ws, Vs: V(Ws), Vm: V(nv), V: V, eq: 'V=' + quadT(-a, b, 0, 'n') };
        },
        stem: function (s) {
          var top = niceUp(s.Vs * 1.08);
          return 'A booth’s revenue from selling ' + t('n') + ' souvenirs is ' + t(s.eq) + ' dollars. A student graphs it in the window ' + t('[0,\\ ' + s.Ws + ']') + ' by ' + t('[0,\\ ' + F(top) + ']') + ', presses ' + cd('4:maximum') + ' and reports “the most revenue is ' + t(money(s.Vs)) + ', at ' + t(s.Ws) + ' souvenirs.” The student’s screen:' +
            screen([0, s.Ws, 0, top], { xv: 'n', yv: 'V', fns: [{ f: s.V, from: 0, to: s.Ws }], points: [{ x: s.Ws, y: s.Vs }], aria: 'the student’s calculator screen' });
        },
        parts: [
          { id: 'e13a', sub: 'a', level: 'BEG', make: function (r, s) {
            return numPart('Check the student’s arithmetic: what is ' + t('V') + ' when ' + t('n=' + s.Ws) + '?', s.Vs, 2, [{ v: s.a * s.Ws * s.Ws + s.b * s.Ws, code: 'ctx-sign-sq', hint: 'Keep the minus sign on ' + t('-' + nT(s.a) + 'n^{2}') + '.' }],
              t('V=-' + nT(s.a) + '(' + s.Ws + ')^{2}+' + nT(s.b) + '(' + s.Ws + ')=' + nT(-s.a * s.Ws * s.Ws) + '+' + nT(s.b * s.Ws) + '=' + money(s.Vs)) + '. The number is right — it is just the value at the window’s right edge, not the maximum.', [H_TRACE], 'V at window edge', { money: true });
          } },
          { id: 'e13b', sub: 'b', level: 'EMG', make: function (r, s) {
            return fieldsPart('Find the true maximum revenue and the number of souvenirs that produces it.', [
              { label: 'Maximum revenue', x: s.Vm, d: 2, before: '$', cands: [{ v: s.Vs, code: 'ctx-gave-end', hint: 'That is the student’s value at the edge of the window. Widen the window until the curve turns.' }] },
              { label: 'Souvenirs', x: s.nv, d: 0, cands: [{ v: s.Ws, code: 'ctx-gave-end', hint: 'That is the edge of the student’s window, not the vertex.' }] }],
              'Vertex: ' + t('n=-\\frac{' + nT(s.b) + '}{2(-' + nT(s.a) + ')}=' + s.nv) + ', ' + t('V(' + s.nv + ')=' + nT(-s.a * s.nv * s.nv) + '+' + nT(s.b * s.nv) + '=' + F(s.Vm)) + ' (or ' + cd('4:maximum') + ' in a wider window). Maximum ' + t(money(s.Vm)) + ' at ' + t(s.nv) + ' souvenirs.' +
              screen([0, niceUp(2 * s.nv * 1.04), 0, niceUp(s.Vm * 1.05)], { xv: 'n', yv: 'V', fns: [{ f: s.V, from: 0, to: 2 * s.nv }], points: [{ x: s.nv, y: s.Vm }] }), [H_MAX, H_VERT], 'true max revenue', { swap: 'wrong', swapHint: 'Revenue and souvenirs are swapped.' });
          } },
          { id: 'e13c', sub: 'c', level: 'EMG', make: function (r, s) {
            return mc(r, 'What feature of the student’s screen should have warned them not to trust it?', [
              { html: 'The curve is still rising at the right edge: no turning point is visible, so nothing on that screen is a maximum.', right: true },
              { html: 'The curve starts at the origin.', why: 'Selling no souvenirs really does earn ' + t('\\$0') + '. Look at the right edge.' },
              { html: 'The curve is bending.', why: 'A parabola always bends. A maximum needs the curve to rise, turn and fall on the screen.' },
              { html: 'The numbers on the axes are too big.', why: 'The scale is fine. Look at what the curve is doing at the right edge.' }],
              'On the student’s screen the curve is still climbing when it reaches ' + t('n=' + s.Ws) + ': the turn happens off the screen. Trust a maximum only if the curve rises, turns and falls inside the window.', ['Is the curve turning at the right edge, or still going up?'], 'warning sign window');
          } },
          { id: 'e13d', sub: 'd', level: 'EMG', make: function (r, s) {
            return numPart('By how many dollars was the student’s reported maximum too low?', s.Vm - s.Vs, 2, [{ v: s.Vs - s.Vm, code: 'int-sign', hint: 'Give the size of the difference: true maximum minus the student’s value.' }, { v: s.Vm, code: 'ctx-gave-h', hint: 'That is the true maximum. Subtract the student’s ' + t(money(s.Vs)) + '.' }],
              t(F(s.Vm) + '-' + F(s.Vs) + '=' + F(s.Vm - s.Vs)) + ': the student was ' + t(money(s.Vm - s.Vs)) + ' too low.', ['True maximum minus the reported value.'], 'how far off', { money: true });
          } },
          { id: 'e13e', sub: 'e', level: 'PRG', outcome: 'RF2', make: function (r, s) {
            var tg = setT('n', 0, 2 * s.nv, 'W');
            return setPart('Souvenirs are counted. Find the other ' + t('n') + '-intercept and state the practical domain.', tg, { v: 'n', wrong: [
              { is: '[0, ' + 2 * s.nv + ']', code: 'ctx-not-whole', hint: 'Souvenirs are whole numbers: finish with ' + t('n\\in W') + ' (or ' + t('n\\in I') + ').' },
              { is: setT('n', 0, s.nv, 'W'), code: 'ctx-dom-vertex', hint: 'The booth can sell more than ' + t(s.nv) + ' — the revenue just falls. End where ' + t('V=0') + ' again.' },
              { is: setT('n', 0, s.Ws, 'W'), code: 'ctx-gave-end', hint: t(s.Ws) + ' is only the edge of the student’s window.' }] },
              t('n(-' + nT(s.a) + 'n+' + nT(s.b) + ')=0') + ', so ' + t('n=0') + ' or ' + t('n=' + 2 * s.nv) + '. Souvenirs are counted: ' + t('D=' + tg) + '.', H_DOM.concat(['Counted quantities end with ' + t('n\\in W') + '.']), 'booth domain');
          } }] },

      /* ---------- Part F — a stretch, and two for the test ---------- */
      { num: '14', section: 'Extra practice F — A stretch, and two for the test', shared: function (r) {
          return pickWhere(function () {
            var vA = r.pick([30, 35, 40]), D = r.pick([5, 10]), c = r.pick([12, 15, 18, 20]), vB = vA - D, ts = c / D, landB = quadRoots(-5, vB, c)[1];
            return { vA: vA, vB: vB, D: D, c: c, ts: ts, hs: cl(-5 * ts * ts + vA * ts), landA: vA / 5, landB: landB, tA: vA / 10, hA: vA * vA / 20, tB: vB / 10, hB: vB * vB / 20 + c, eqA: 'h_{A}=' + quadT(-5, vA, 0, 't'), eqB: 'h_{B}=' + quadT(-5, vB, c, 't') };
          }, function (o) { return isDp(o.ts, 1) && o.ts < o.landB - 0.5 && margin(o.landB, 2) && margin(o.landA - o.landB, 2) && o.landA > o.landB; });
        },
        stem: function (s) { return 'Two model rockets are launched at the same instant from the same field: Rocket A from the ground, Rocket B from a platform. Their heights, in metres, ' + t('t') + ' seconds after launch are ' + t(s.eqA) + ' and ' + t(s.eqB) + '. Graph both together.'; },
        parts: [
          { id: 'e14a', sub: 'b', level: 'BEG', make: function (r, s) {
            return numPart('Which rocket starts higher, and by how many metres? (Give the difference.)', s.c, 2, [{ v: 0, code: 'ctx-zero-start', hint: 'Find each height at ' + t('t=0') + ': ' + t('h_{A}(0)') + ' and ' + t('h_{B}(0)') + '.' }],
              t('h_{A}(0)=0') + ', ' + t('h_{B}(0)=' + s.c) + ': Rocket B starts ' + t(s.c) + ' m higher.', ['Find both heights at ' + t('t=0') + '.'], 'start difference', { after: 'm higher (Rocket B)' });
          } },
          { id: 'e14b', sub: 'c', level: 'EMG', make: function (r, s) {
            return fieldsPart('Use ' + cd('5:intersect') + '. At what time are the two rockets at the same height, and what height is that?', [
              { label: 'Time', x: s.ts, d: 2, after: 's', cands: [] }, { label: 'Height', x: s.hs, d: 2, after: 'm', cands: [] }],
              t('Y_1=' + quadT(-5, s.vA, 0, 'X')) + ', ' + t('Y_2=' + quadT(-5, s.vB, s.c, 'X')) + ', ' + cd('5:intersect') + '.<br>Algebra: ' + t(quadT(-5, s.vA, 0, 't') + '=' + quadT(-5, s.vB, s.c, 't') + '\\Rightarrow ' + s.D + 't=' + s.c + '\\Rightarrow t=' + nT(s.ts)) + ', ' + t('h_{A}(' + nT(s.ts) + ')=' + nT(-5 * s.ts * s.ts) + '+' + nT(s.vA * s.ts) + '=' + nT(s.hs)) + ' m.', [H_INT, 'The ' + t('-5t^{2}') + ' terms cancel when you set the two heights equal.'], 'rockets meet', { swap: 'wrong', swapHint: 'Time and height are swapped.' });
          } },
          { id: 'e14c', sub: 'd', level: 'EMG', make: function (r, s) {
            return mc(r, 'Which rocket is higher <i>before</i> ' + t(nT(s.ts)) + ' s, and which is higher <i>after</i>?', [
              { html: 'Before: Rocket B (it started ' + t(s.c) + ' m up). After: Rocket A (it was launched faster).', right: true },
              { html: 'Before: Rocket A. After: Rocket B.', why: 'At ' + t('t=0') + ' Rocket B is ' + t(s.c) + ' m up and Rocket A is on the ground.' },
              { html: 'Rocket B is always higher.', why: 'Check ' + t('h_{A}-h_{B}=' + s.D + 't-' + s.c) + ': it becomes positive after ' + t(nT(s.ts)) + ' s.' },
              { html: 'Rocket A is always higher.', why: 'At launch Rocket A is at ' + t('0') + ' m and Rocket B at ' + t(s.c) + ' m.' }],
              t('h_{A}-h_{B}=' + s.D + 't-' + s.c) + ' is negative before ' + t(nT(s.ts)) + ' s (B higher, it started on the platform) and positive after (A higher, launched faster).', ['Compare the heights at ' + t('t=0') + ' and at a time after they meet.'], 'which rocket higher');
          } },
          { id: 'e14d', sub: 'e', level: 'EMG', make: function (r, s) {
            return fieldsPart('Find each rocket’s maximum height.', [
              { label: 'Rocket A', x: s.hA, d: 2, after: 'm', cands: [{ v: s.tA, code: 'ctx-max-time', hint: 'That is the time of A’s peak. Substitute it.' }] },
              { label: 'Rocket B', x: s.hB, d: 2, after: 'm', cands: [{ v: s.tB, code: 'ctx-max-time', hint: 'That is the time of B’s peak. Substitute it.' }, { v: s.hB - s.c, code: 'ctx-no-c', hint: 'Include B’s ' + t(s.c) + ' m platform.' }] }],
              'A: ' + t('t=-\\frac{' + s.vA + '}{2(-5)}=' + nT(s.tA)) + ', ' + t('h_{A}=' + nT(s.hA)) + ' m. B: ' + t('t=-\\frac{' + s.vB + '}{2(-5)}=' + nT(s.tB)) + ', ' + t('h_{B}=' + nT(-5 * s.tB * s.tB) + '+' + nT(s.vB * s.tB) + '+' + s.c + '=' + nT(s.hB)) + ' m. (' + cd('4:maximum') + ' on each curve.)', [H_MAX, H_VERT], 'rocket maxima', { swap: 'wrong', swapHint: 'The two rockets’ heights are in each other’s boxes.' });
          } },
          { id: 'e14e', sub: 'f', level: 'PRG', make: function (r, s) {
            return fieldsPart('Find when each rocket lands (nearest hundredth), and how much longer Rocket A is in the air.', [
              { label: 'Rocket A lands', x: s.landA, d: 2, after: 's', cands: [{ v: s.tA, code: 'ctx-max-time', hint: 'That is the time of A’s peak. Landing means ' + t('h=0') + '.' }] },
              { label: 'Rocket B lands', x: s.landB, d: 2, after: 's', cands: [{ v: s.tB, code: 'ctx-max-time', hint: 'That is the time of B’s peak.' }, { v: 2 * s.tB, code: 'ctx-double-vertex', hint: 'At that time B is back at platform height, not yet on the ground.' }] },
              { label: 'A is in the air longer by', x: s.landA - s.landB, d: 2, after: 's', cands: [] }],
              'A: ' + t('-5t(t-' + nT(s.landA) + ')=0\\Rightarrow t=' + nT(s.landA)) + ' s. B: ' + cd('2:zero') + ', or ' + t(quadT(5, -s.vB, -s.c, 't') + '=0\\Rightarrow t=\\frac{' + s.vB + '+\\sqrt{' + (s.vB * s.vB + 20 * s.c) + '}}{10}\\approx ' + rT(s.landB, 2)) + ' s. A is up longer by ' + t(nT(s.landA) + '-' + rT(s.landB, 4) + '\\approx ' + rT(s.landA - s.landB, 2)) + ' s.', [H_ZERO], 'rocket landings');
          } },
          { id: 'e14f', sub: 'g', level: 'PRG', outcome: 'RF2', make: function (r, s) {
            var L = rd(s.landB, 2), tg = setT('t', 0, L);
            return setPart('State the practical domain of Rocket B’s relation.', tg, { v: 't', wrong: [{ is: setT('t', 0, s.landA), code: 'ctx-gave-end', hint: 'That is when Rocket A lands. Each rocket’s domain ends when <i>that</i> rocket lands.' }, { is: setT('t', 0, s.tB), code: 'ctx-dom-vertex', hint: 'Rocket B keeps flying after its peak until it lands.' }] },
              'From launch to Rocket B’s landing: ' + t('D_{B}=' + tg) + '. (Rocket A’s is ' + t('\\{t\\mid 0\\le t\\le ' + nT(s.landA) + ',\\ t\\in\\mathbb{R}\\}') + ': launched faster, it stays up longer although it started lower.)', H_DOM, 'rocket B domain');
          } }] },
      { num: '15', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: 'e15', level: 'PRG', outcome: 'RF2', make: function (r) {
          var o = pickWhere(function () { return [r.int(6, 14), r.int(1, 4)]; }, function (o) { return (o[0] - o[1]) % 2 === 0 && o[0] > o[1] + 1 && Math.pow((o[0] + o[1]) / 2, 2) !== o[0]; });
          var R = o[0], S = o[1], tv = (R - S) / 2, pk = Math.pow((R + S) / 2, 2), b = R - S, c = R * S;
          return mc(r, 'A gull is sighted flying above a beach. Its height above the beach, in metres, ' + t('t') + ' seconds after it is first sighted is ' + t('h=' + quadT(-1, b, c, 't')) + '. It lands on the beach when ' + t('h=0') + '. The practical domain of this relation is', [
            { html: t('\\{t\\mid -' + S + '\\le t\\le ' + R + ',\\ t\\in\\mathbb{R}\\}'), why: t('t=-' + S) + ' is the rejected root: the gull wasn’t sighted yet. Time starts at ' + t('t=0') + '.' },
            { html: t('\\{t\\mid 0\\le t\\le ' + R + ',\\ t\\in\\mathbb{R}\\}'), right: true },
            { html: t('\\{t\\mid 0\\le t\\le ' + pk + ',\\ t\\in\\mathbb{R}\\}'), why: t(pk) + ' is the greatest <b>height</b>, ' + t('h(' + tv + ')') + ' — not a time.' },
            { html: t('\\{t\\mid 0\\le t\\le ' + tv + ',\\ t\\in\\mathbb{R}\\}'), why: 'That stops at the vertex and cuts off the descent to the beach.' }],
            t('-t^{2}+' + b + 't+' + c + '=0\\Rightarrow (t-' + R + ')(t+' + S + ')=0') + ', so ' + t('t=' + R) + ' or ' + t('t=-' + S) + '. Time starts at the sighting, ' + t('t=0') + ', and ends at the landing, ' + t('t=' + R) + '.', ['Find both zeros, then decide where the situation starts and ends.'], 'gull domain', true);
        } }] },
      { num: '16', stem: '<i>(Numerical Response)</i>', parts: [
        { id: 'e16', level: 'EMG', make: function (r) {
          var b = r.pick([20, 30, 40, 50]), c = r.int(5, 20), tv = b / 10, pk = b * b / 20 + c;
          var p = B.nr('A model rocket is fired from the roof of a shed. Its height above the ground, in metres, ' + t('t') + ' seconds after firing is ' + t('h=' + quadT(-5, b, c, 't')) + '. The greatest height the rocket reaches, to the nearest metre, is ________ m.', pk, near([
            { v: tv, code: 'ctx-max-time', hint: 'That is the time of the peak. Substitute it to get the height.' },
            { v: pk - c, code: 'ctx-no-c', hint: 'Include the ' + t(c) + ' m roof height.' },
            { v: c, code: 'ctx-zero-start', hint: 'That is the starting height (the roof). The rocket climbs higher.' }], pk, 0),
            'Vertex: ' + t('t=-\\frac{' + b + '}{2(-5)}=' + tv) + ' s. ' + t('h(' + tv + ')=-5(' + (tv * tv) + ')+' + (b * tv) + '+' + c + '=' + pk) + ' m (' + cd('4:maximum') + ' agrees). Answer: ' + t(pk) + '.', [H_MAX, H_VERT], 'NR max height ' + quadT(-5, b, c, 't'));
          p.bad = [String(tv), String(pk - c)];
          return p;
        } }] }
    ]
  });

  /* boxes that must hold whole numbers: a decimal gets a nudge that doesn't use a try */
  function wholeOnly(p, hint) {
    var c = p.check;
    p.check = function (resp) { var bad = (resp || []).some(function (v) { var q = HW.parse.number(v == null ? '' : v); return q.ok && Math.abs(q.value - Math.round(q.value)) > 1e-9; }); return bad ? form('whole', hint) : c(resp); };
    return p;
  }
  /* a point read from a graph (one ordered pair) */
  function ptPart(prompt, name, xy, sol, text) {
    var p = B.pairs(prompt, [xy], {}, sol, ['Read across to the time (' + t('t') + ') first, then up to the height (' + t('h') + '). Check with the formula.'], text);
    p.key = '(' + xy[0] + ', ' + xy[1] + ')'; p.answer = t(name + '(' + xy[0] + ',\\ ' + xy[1] + ')');
    p.bad = xy[0] !== xy[1] ? ['(' + xy[1] + ', ' + xy[0] + ')'] : [];
    return p;
  }
})(window);
