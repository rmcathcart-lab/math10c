/* Math 10C · Unit 5 · Lesson 7B — Function Notation (RF8)
 * Assignment questions 1–21 (u5_L07B.tex; 19–21 are the booklet's Extension) and the function-notation questions of
 * the shared Extra Practice 7 (u5_EP07.tex: Q10–19 and Q22–25 — Q1–9, 20 and 21 belong to 7A),
 * plus three short mapping-notation items from the lesson's Extension section.
 * Every part is a generator: it keeps the booklet question's structure (which input is negative, a squared or cubed
 * input, a radical or decimal input, an expression input, two solutions, the context) and changes the numbers; the
 * booklet's own numbers are among the possible values.
 * Graphing parts ("graph the function", "plot the points and draw a smooth curve") are drawn on the graph pad
 * (js/draw.js, points mode with a Join button): discrete domains must stay unjoined, "draw a smooth curve" must be
 * joined; classic mistakes get targeted hints. "Explain" parts become multiple choice with misconception hints. Levels: LIM BEG EMG PRG ADV MAS. */
(function (root) {
  'use strict';
  var HW = root.HW, ex = HW.ex, F = HW.fmt, K = HW.kit, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form, B = K.P, P = HW.poly;

  HW.addCodes({
    'fn-times': 'Read f(a) as f × a', 'fn-concat': 'Wrote 4x with x = 3 as 43', 'fn-add-coef': 'Added the coefficient instead of multiplying',
    'fn-solved': 'Solved f(x) = a instead of evaluating f(a)', 'fn-evaluated': 'Evaluated f(b) instead of solving f(x) = b',
    'fn-neg-sub': 'Sign slip substituting a negative', 'fn-neg-square': 'Squared a negative and got a negative', 'fn-minus-square': 'Treated −x² as (−x)²',
    'fn-square-2x': 'Squared by doubling (x² as 2x)', 'fn-cube-3x': 'Cubed by tripling (x³ as 3x)', 'fn-cube-sq': 'Squared instead of cubing',
    'fn-cube-neg': 'Cube of a negative given as positive', 'fn-const': 'Left out the constant term', 'fn-const-sign': 'Wrong sign on the constant',
    'fn-zero-coef': 'Treated m·0 as m', 'fn-zero-all': 'Gave f(0) = 0', 'fn-order': 'Subtracted before multiplying', 'fn-sign': 'Sign slip',
    'fn-coef-power': 'Squared the coefficient with the input: (3·2)²', 'fn-rad-square': 'Squared the radicand: (√2)² as 4',
    'fn-dist': 'Didn’t multiply every term of the bracket', 'fn-dist-sign': 'Didn’t change the sign of the second term in the bracket',
    'fn-drop': 'Dropped part of the input expression', 'fn-scale-out': 'Multiplied the whole output instead of the input',
    'fn-solve-inverse': 'Inverse-operation slip (added instead of subtracted)', 'fn-solve-divide': 'Didn’t divide by the coefficient',
    'fn-solve-sign': 'Sign slip solving', 'fn-sqrt-not': 'Didn’t take the square root', 'fn-root-solve': 'Took the root instead of squaring',
    'fn-input-sum': 'Added the inputs first (g(6)+g(−3) as g(3))', 'fn-neg-drop': 'Dropped the negative sign of an input',
    'fn-fee': 'Left out the fixed fee', 'fn-swap-rate': 'Swapped the fee and the rate', 'fn-rad-noroot': 'Left the perfect square under the radical',
    'fn-rad-coef': 'Forgot the coefficient in front of the radical', 'fn-rad-add': 'Added instead of multiplying the coefficients',
    'fn-binom-sq': 'Squared a binomial as (a+b)² = a² + b²', 'fn-plus-out': 'Confused f(a + 1) with f(a) + 1', 'fn-plus-in': 'Confused f(a) + 1 with f(a + 1)',
    'fn-coef-in': 'Put the coefficient inside the square: 2(x+4)² as (2x+8)²', 'fn-neg-out': 'Gave −F(x) for F(−x)', 'fn-unchanged': 'Didn’t substitute',
    'fn-sq-coef': 'Squared only the letter: (2a)² as 2a²', 'fn-reverse': 'Subtracted in the wrong order', 'fn-add-fns': 'Added instead of subtracting',
    'fn-comp-order': 'Composed in the wrong order', 'fn-eq-flip': 'Swapped input and output in f(a) = b', 'fn-one-root': 'Used only one solution',
    'fn-inner': 'Ignored the expression inside the brackets', 'fn-sqrt-half': 'Halved instead of taking the square root', 'pairs-identity': 'Gave pairs (x, x)', 'fn-const-zero': 'Gave output 0 for a constant function'
  });

  /* ---------------- numbers and LaTeX ---------------- */
  function cl(x) { return Math.round(x * 1e6) / 1e6; }
  function same(a, b) { return Math.abs(a - b) < 1e-9; }
  function nT(x) { return F(cl(x)); }
  function sgp(x) { x = cl(x); return x < 0 ? '(' + nT(x) + ')' : nT(x); }      // bracket a negative input
  function sg(c) { c = cl(c); return c < 0 ? nT(c) : '+' + nT(c); }              // signed constant "+5" / "-5"
  function range(a, b) { var o = []; for (var i = a; i <= b; i++) o.push(i); return o; }
  function nz(a, b) { return range(a, b).filter(function (x) { return x !== 0; }); }
  function term(c, v, first) {
    c = cl(c); if (!c) return '';
    var neg = c < 0, mag = nT(Math.abs(c));
    if (v && mag === '1') mag = '';
    return (neg ? '-' : first ? '' : '+') + mag + v;
  }
  function lin(list) { var s = ''; list.forEach(function (p) { s += term(p[0], p[1], s === ''); }); return s || '0'; }
  function sortU(a) { var s = a.slice().sort(function (x, y) { return x - y; }); return s.filter(function (x, i) { return i === 0 || !same(x, s[i - 1]); }); }
  function setTex(arr) { return '\\{' + arr.map(nT).join(', ') + '\\}'; }
  function setSame(A, Bs) { A = sortU(A); Bs = sortU(Bs); return A.length === Bs.length && A.every(function (x, i) { return Math.abs(x - Bs[i]) < 1e-6; }); }
  function money(c) { return (c / 100).toFixed(2); }
  function pickWhere(gen, okf) { for (var i = 0; i < 3000; i++) { var o = gen(); if (okf(o)) return o; } throw new Error('u5l7b: no valid numbers'); }
  /* polynomial from [[coef, letter, power], …] */
  function PL(list) { var p = P.num(0); list.forEach(function (q) { var v = {}; if (q[1]) v[q[1]] = q[2] || 1; p = P.add(p, q[1] ? P.mono(q[0], v) : P.num(q[0])); }); return p; }

  /* ---------------- part makers ---------------- */
  function numPart(prompt, ans, dl, sol, hints, text, inp) {
    ans = cl(ans);
    var L = (dl || []).filter(function (d) { return d && isFinite(d[0]) && !same(cl(d[0]), ans); });
    var p = B.number(prompt, ans, function (v) { for (var i = 0; i < L.length; i++) if (Math.abs(v - L[i][0]) < 1e-6) return { code: L[i][1], hint: L[i][2] }; return null; }, sol, hints, text, inp);
    p.bad = L.map(function (d) { return String(cl(d[0])); }).filter(function (s, i, a) { return a.indexOf(s) === i; });
    return p;
  }
  function polyPart(prompt, before, T, keyTex, wl, sol, hints, text, vars) {
    var W = (wl || []).filter(function (w) { return !P.eq(w.is, T); });
    var p = B.poly(prompt, T, { before: before, keyTex: keyTex, wrong: W, vars: vars }, sol, hints, text);
    p.bad = W.map(function (w) { return P.tex(w.is); });
    return p;
  }
  function solPart(prompt, vals, v, dl, sol, hints, text, keyTex) {
    var L = (dl || []).filter(function (d) { return d[0].length && d[0].every(isFinite) && !setSame(d[0], vals); });
    var p = B.valueSet(prompt, vals, { v: v, keyTex: keyTex, diag: function (A) { for (var i = 0; i < L.length; i++) if (setSame(A, L[i][0])) return { code: L[i][1], hint: L[i][2] }; return null; } }, sol, hints, text);
    p.bad = L.map(function (d) { return d[0].map(function (x) { return v + '=' + nT(x); }).join(', '); });
    var s = sortU(vals);
    p.good = [s.slice().reverse().map(function (x) { return v + '=' + nT(x); }).join(', '), s.map(nT).join(', ')];
    if (s.length === 2 && same(s[0], -s[1])) p.good.push('\\pm ' + nT(s[1]));
    return p;
  }
  function mc(r, prompt, opts, sol, hints, text, keepOrder) { return B.mc(r, prompt, opts, sol, hints, text, keepOrder); }
  function mc2(r, prompt, opts, sol, hints, text) { var p = B.mc(r, prompt, opts, sol, hints, text, true); p.tries = 1; p.input.columns = 2; return p; }
  function dots(pts) { return pts.map(function (p) { return { x: p[0], y: p[1] }; }); }
  function yWin(vals, pad) { var lo = Math.min.apply(null, vals.concat([0])) - (pad || 1), hi = Math.max.apply(null, vals.concat([0])) + (pad || 1); return [lo, hi]; }
  function ptsTex(pts) { return pts.map(function (p) { return '(' + nT(p[0]) + ',\\ ' + nT(p[1]) + ')'; }).join(',\\ '); }
  /* ---------------- graphing on the graph pad (js/draw.js) ---------------- */
  var Dr = HW.draw;
  function pT(q) { return '(' + nT(q[0]) + ',\\ ' + nT(q[1]) + ')'; }
  function dv(pts, join) { return { pts: pts.map(function (q) { return [q[0], q[1]]; }), pieces: [], join: join || 'none' }; }
  function joined(pts) { return dv(pts, 'curve'); }
  /* a points-mode pad (with a Join button) sized for phones; win = { x, y, … } */
  function padIn(win) {
    var xs = win.x[1] - win.x[0], ys = win.y[1] - win.y[0];
    return Object.assign({ labels: 1, unitX: Math.min(44, 290 / xs), unitY: Math.min(26, 330 / ys), mode: 'points', join: true, max: 360 }, win);
  }
  var PAD_HELP = '<div class="muted">Press <b>Join</b> only if the points should be joined by a smooth curve.</div>';
  /* plot the points of a function on a discrete domain; wl = [[points, code, hint], …] classic wrong drawings */
  function plotPart(prompt, win, pts, wl, sol, hints, text) {
    var wrongs = [];
    wl.forEach(function (w) { wrongs.push({ is: dv(w[0]), code: w[1], hint: w[2] }); wrongs.push({ is: joined(w[0]), code: w[1], hint: w[2] }); });
    var key = dv(pts), p = B.graph(prompt + PAD_HELP, padIn(win), K.graphExact(key, { joinMatters: true, wrong: wrongs }), key, sol, hints, text);
    p.bad = [joined(pts), dv(pts.map(function (q) { return [q[1], q[0]]; }))].concat(wl.map(function (w) { return dv(w[0]); }));
    return p;
  }

  var HE = ['To evaluate ' + t('f(a)') + ', replace <b>every</b> ' + t('x') + ' in the formula with ' + t('a') + ' (in brackets), then simplify.',
    'The brackets in ' + t('f(a)') + ' mark the input — they do not mean “times”.'];
  var HN = ['Put a negative input in brackets — for example, if ' + t('f(x)=4x-9') + ', then ' + t('f(-2)=4(-2)-9') + '. Then use the sign rules carefully.', 'Do powers first, then multiplication, then addition and subtraction.'];
  var HS = ['To solve ' + t('f(x)=b') + ', you are given the <b>output</b>. Set the formula equal to ' + t('b') + ' and solve for the input ' + t('x') + '.',
    'Check: substitute your answer back into the formula — do you get ' + t('b') + '?'];
  var HX = ['Replace every ' + t('x') + ' with the whole expression, in brackets, then expand and collect like terms.', 'A number in front of the bracket multiplies <b>every</b> term inside it, signs included.'];
  function evalSol(name, ftex, arg, steps, ans) { return t(name + '(' + arg + ')=' + steps + (String(ans) === String(steps) ? '' : '=' + ans)); }

  /* ---------------- Q15 contexts ---------------- */
  var CTX = [
    { v: 'd', unit: 'km', F: [250, 300, 350, 350, 400, 450], R: [110, 120, 120, 125, 140, 150, 175, 200], n: function (r) { return r.int(5, 20); },
      stem: function (Ft, Rt) { return 'A taxi fare, in dollars, for a trip of ' + t('d') + ' kilometres is given by the linear function ' + t('C(d)=' + Ft + '+' + Rt + 'd') + '.'; },
      phrase: function (n) { return 'A ' + n + ' km trip'; }, swap: function (n, V) { return 'You can travel ' + V + ' km for $' + n + '.'; },
      per: 'kilometre', inWord: 'distance', fee: 'fixed pickup fee', after: 'km' },
    { v: 'h', unit: 'h', F: [500, 800, 1000, 1250], R: [450, 600, 750, 800], n: function (r) { return r.int(2, 9); },
      stem: function (Ft, Rt) { return 'The cost, in dollars, to rent an e-bike for ' + t('h') + ' hours is given by the linear function ' + t('C(h)=' + Ft + '+' + Rt + 'h') + '.'; },
      phrase: function (n) { return 'Renting the e-bike for ' + n + ' hours'; }, swap: function (n, V) { return 'You can ride for ' + V + ' hours for $' + n + '.'; },
      per: 'hour', inWord: 'time', fee: 'flat rental fee', after: 'h' },
    { v: 'k', unit: 'km', F: [2500, 3000, 4000, 4500], R: [25, 30, 40, 50], n: function (r) { return 10 * r.int(2, 15); },
      stem: function (Ft, Rt) { return 'Renting a moving van costs ' + t('C(k)=' + Ft + '+' + Rt + 'k') + ' dollars, where ' + t('k') + ' is the number of kilometres driven.'; },
      phrase: function (n) { return 'Driving the van ' + n + ' km'; }, swap: function (n, V) { return 'You can drive ' + V + ' km for $' + n + '.'; },
      per: 'kilometre', inWord: 'distance', fee: 'flat rental fee', after: 'km' }];

  HW.defineLesson({
    id: 'u5l7b', unit: 5, num: '7B', title: 'Function Notation', outcome: 'RF8',
    blurb: 'Naming a function, writing f(x), evaluating f(a) and solving f(x) = b — with numbers, negatives, radicals and expressions as inputs.',
    questions: [
      /* ---------- Q1: linear function on a small domain ---------- */
      { num: '1', section: 'Function notation, tables and graphs', stem: function (sh) { return 'The function ' + t('f(x)=' + sh.ftex) + ' has domain ' + t(setTex(sh.D)) + '.'; },
        shared: function (r) {
          var o = pickWhere(function () { return { m: r.pick([2, 3, 4, 4]), b: r.pick([-5, -4, -3, -3, -2, -1, 1, 2, 3]), s: r.pick([0, 0, 0, 1, -1]) }; },
            function (o) { var y0 = o.m * o.s + o.b, y1 = o.m * (o.s + 3) + o.b; return Math.max(0, y1) - Math.min(0, y0) + 2 <= 15; });   // the graph pad stays at most 15 squares tall
          return { m: o.m, b: o.b, D: [o.s, o.s + 1, o.s + 2, o.s + 3], ftex: lin([[o.m, 'x'], [o.b, '']]) };
        },
        parts: [
          { id: '1a', level: 'BEG', make: function (r, sh) {
            var m = sh.m, b = sh.b, D = sh.D, f = function (x) { return m * x + b; }, ys = sortU(D.map(f));
            var p = B.set('List the elements of the range of the function.', setTex(ys), { other: setTex(D), otherName: 'domain', wrong: [
              { is: setTex(sortU(D.map(function (x) { return m * x; }))), code: 'fn-const', hint: 'You multiplied each input by ' + t(m) + ' — now include the ' + t(sg(b)) + ' as well. Every term of the formula is part of the output.' },
              { is: setTex(sortU(D.map(function (x) { return m * x - b; }))), code: 'fn-const-sign', hint: 'Check the sign of the constant: the formula ends in ' + t(sg(b)) + '.' },
              { is: setTex(sortU(D.map(function (x) { return m + x + b; }))), code: 'fn-add-coef', hint: t(m + 'x') + ' means ' + t(m + '\\times x') + ': multiply the input by ' + t(m) + ', don’t add it.' }] },
              'Evaluate ' + t('f') + ' at each element of the domain:<br>' + D.map(function (x) { return t('f(' + x + ')=' + m + '(' + x + ')' + sg(b) + '=' + f(x)); }).join('<br>') + '<br>Range ' + t('=' + setTex(ys)) + '.',
              ['The range is the set of <b>outputs</b>. Substitute each input from the domain into ' + t('f(x)=' + sh.ftex) + '.', 'List each output once, inside braces.'], 'range of f(x)=' + sh.ftex);
            p.good = [setTex(ys.slice().reverse())]; p.bad = [setTex(sortU(D.map(function (x) { return m * x; }))), setTex(sortU(D.map(function (x) { return m * x - b; }))), setTex(D)];
            return p;
          } },
          { id: '1b', level: 'EMG', make: function (r, sh) {
            var m = sh.m, b = sh.b, D = sh.D, ok0 = D.map(function (x) { return [x, m * x + b]; });
            var ys = ok0.map(function (q) { return q[1]; }), win = { x: [Math.min(-1, D[0] - 1), D[3] + 1], y: [Math.min(0, Math.min.apply(null, ys)) - 1, Math.max(0, Math.max.apply(null, ys)) + 1], labelsY: 2, xName: 'x', yName: 'f(x)' };
            return plotPart('Graph the function ' + t('f') + '.', win, ok0, [
              [D.map(function (x) { return [x, m * x - b]; }), 'fn-const-sign', 'Check one point: ' + t('f(' + D[1] + ')=' + m + '(' + D[1] + ')' + sg(b) + '=' + (m * D[1] + b)) + '. Watch the sign of the constant.'],
              [D.map(function (x) { return [x, m * x]; }), 'fn-const', 'These points leave out the constant ' + t(sg(b)) + '. Check ' + t('f(' + D[0] + ')') + '.'],
              [D.map(function (x) { return [x, m + x + b]; }), 'fn-add-coef', t(m + 'x') + ' means ' + t(m + '\\times x') + ': multiply the input by ' + t(m) + ', don’t add it.']],
              'Plot one point ' + t('(x,\\ f(x))') + ' for each element of the domain: ' + t(ptsTex(ok0)) + '. The domain has only four values, so the graph is four separate points — they are <b>not</b> joined.',
              ['Each element of the domain gives one point ' + t('(x,\\ f(x))') + '. Work out the four outputs first (your range from part (a)).', 'The domain is a short list, not all real numbers: should the points be joined?'], 'graph f(x)=' + sh.ftex + ' on a 4-element domain');
          } }] },
      /* ---------- Q2: cubic on a small domain ---------- */
      { num: '2', stem: function (sh) { return 'The function ' + t('g(x)=' + lin([[1, 'x^{3}'], [sh.c, '']])) + ' has domain ' + t(setTex(sh.D)) + '.'; },
        shared: function (r) { return { c: r.pick([-3, -2, -1, -1, 1, 2, 3]), D: [-2, -1, 0, 1, 2] }; },
        parts: [
          { id: '2a', level: 'EMG', make: function (r, sh) {
            var c = sh.c, D = sh.D, g = function (x) { return x * x * x + c; }, ys = sortU(D.map(g)), gt = lin([[1, 'x^{3}'], [c, '']]);
            var p = B.set('List the elements of the range of the function.', setTex(ys), { other: setTex(D), otherName: 'domain', wrong: [
              { is: setTex(sortU(D.map(function (x) { return Math.abs(x * x * x) + c; }))), code: 'fn-cube-neg', hint: 'Check the negative inputs: ' + t('(-2)^{3}=(-2)(-2)(-2)=-8') + '. An odd power of a negative number is negative.' },
              { is: setTex(sortU(D.map(function (x) { return 3 * x + c; }))), code: 'fn-cube-3x', hint: t('x^{3}') + ' means ' + t('x\\times x\\times x') + ', not ' + t('3\\times x') + '. For example ' + t('2^{3}=8') + '.' },
              { is: setTex(sortU(D.map(function (x) { return x * x * x - c; }))), code: 'fn-const-sign', hint: 'Check the sign of the constant: the formula ends in ' + t(sg(c)) + '.' }] },
              D.map(function (x) { return t('g(' + x + ')=(' + x + ')^{3}' + sg(c) + '=' + (x * x * x) + sg(c) + '=' + g(x)); }).join('<br>') + '<br>Range ' + t('=' + setTex(ys)) + '.',
              ['Substitute each input into ' + t('g(x)=' + gt) + '. Put negative inputs in brackets before cubing.', 'The range is the set of outputs, listed once each.'], 'range of g(x)=' + gt);
            p.good = [setTex(ys.slice().reverse())];
            return p;
          } },
          { id: '2b', level: 'EMG', make: function (r, sh) {
            var c = sh.c, D = sh.D, g = function (x) { return x * x * x + c; }, ok0 = D.map(function (x) { return [x, g(x)]; });
            var win = { x: [-3, 3], y: [c - 9, c + 9], labelsY: 2, xName: 'x', yName: 'g(x)' };
            return plotPart('Graph the function ' + t('g') + '.', win, ok0, [
              [D.map(function (x) { return [x, Math.abs(x * x * x) + c]; }), 'fn-cube-neg', 'Look at the negative inputs: ' + t('g(-2)=(-2)^{3}' + sg(c) + '=-8' + sg(c) + '=' + g(-2)) + '. An odd power of a negative is negative.'],
              [D.map(function (x) { return [x, 3 * x + c]; }), 'fn-cube-3x', 'These points lie on a straight line — they come from ' + t('3x' + sg(c)) + '. Cubing means ' + t('x\\times x\\times x') + ': ' + t('g(2)=8' + sg(c) + '=' + g(2)) + '.'],
              [D.map(function (x) { return [x, x * x * x - c]; }), 'fn-const-sign', 'Check the sign of the constant: the formula ends in ' + t(sg(c)) + '.']],
              'The points are ' + t(ptsTex(ok0)) + '. The domain has five values, so the graph is five separate points (not joined: a curve would mean every real number between ' + t('-2') + ' and ' + t('2') + ' is an input).',
              ['Work out the five outputs (your range from part (a)), then plot ' + t('(x,\\ g(x))') + ' for each.', 'Put negative inputs in brackets before cubing: ' + t('(-1)^{3}=-1') + '.'], 'graph g(x)=x^3' + sg(c) + ' on a 5-element domain');
          } }] },
      /* ---------- Q3: quadratic table and smooth curve ---------- */
      { num: '3', stem: function (sh) { return 'Consider the function ' + t('f(x)=x^{2}' + sg(sh.c)) + '.'; },
        shared: function (r) { return { c: r.pick([1, 2, 3, 3, 4]) }; },   // c ≤ 4 keeps the graph pad at most 15 squares tall
        parts: [
          { id: '3a', level: 'BEG', make: function (r, sh) {
            var c = sh.c, xs = [3, 2, 1, -1, -2, -3], f = function (x) { return x * x + c; };
            var fields = xs.map(function (x) { return { name: t('f(' + x + ')'), before: t('f(' + x + ')=') }; });
            var checks = xs.map(function (x) {
              return K.number(f(x), function (v) {
                if (x < 0 && same(v, -x * x + c)) return { code: 'fn-neg-square', hint: t('(' + x + ')^{2}=(' + x + ')(' + x + ')=' + x * x) + ': a negative times a negative is positive.' };
                if (same(v, 2 * x + c)) return { code: 'fn-square-2x', hint: t('x^{2}') + ' means ' + t('x\\times x') + ', not ' + t('2\\times x') + '.' };
                if (same(v, x * x - c)) return { code: 'fn-const-sign', hint: 'Remember to <b>add</b> ' + t(c) + ' after squaring.' };
                return null;
              });
            });
            var p = B.fields('Complete the table of values for the domain ' + t(setTex(xs)) + '.', fields, checks, xs.map(function (x) { return String(f(x)); }),
              HW.valueTable([[t('x')].concat(xs.map(function (x) { return t(x); })), [t('f(x)')].concat(xs.map(function (x) { return t(f(x)); }))]),
              xs.map(function (x) { return t('f(' + x + ')=' + sgp(x) + '^{2}' + sg(c) + '=' + x * x + sg(c) + '=' + f(x)); }).join('<br>'),
              ['Square the input first (put negatives in brackets), then add ' + t(c) + '.', 'Opposite inputs like ' + t('2') + ' and ' + t('-2') + ' give the same square.'], 'table of x^2' + sg(c));
            p.bad = [xs.map(function (x) { return String(2 * x + c); }), xs.map(function (x) { return String(x < 0 ? -x * x + c : x * x + c); })];
            return p;
          } },
          { id: '3b', level: 'EMG', make: function (r, sh) {
            var c = sh.c, xs = [-3, -2, -1, 1, 2, 3], f = function (x) { return x * x + c; }, pts = xs.map(function (x) { return [x, f(x)]; });
            var win = { x: [-4, 4], y: [-1, c + 10], labelsY: 2, xName: 'x', yName: 'f(x)' };
            var check = function (resp) {
              var v = Dr.norm(resp);
              if (!v.pts.length) return form('empty', 'Plot the points from your table on the grid first.');
              var on = function (q) { return same(q[1], f(q[0])); }, has = function (q) { return v.pts.some(function (z) { return same(z[0], q[0]) && same(z[1], q[1]); }); };
              var off = v.pts.filter(function (q) { return !on(q); });
              if (off.length) {
                if (v.pts.every(function (q) { return same(q[0], f(q[1])); })) return wrong('graph-swap', 'You swapped the coordinates: in ' + t('(x,\\ f(x))') + ' go <b>across</b> to ' + t('x') + ' first, then <b>up</b> to ' + t('f(x)') + '.');
                var q = off[0];
                if (q[0] < 0 && same(q[1], -q[0] * q[0] + c)) return wrong('fn-neg-square', 'Check ' + t(pT(q)) + ': ' + t('(' + nT(q[0]) + ')^{2}=' + q[0] * q[0]) + ' — squaring a negative gives a positive, so ' + t('f(' + nT(q[0]) + ')=' + f(q[0])) + '.');
                if (same(q[1], 2 * q[0] + c)) return wrong('fn-square-2x', 'Check ' + t(pT(q)) + ': ' + t('x^{2}') + ' means ' + t('x\\times x') + ', not ' + t('2\\times x') + '.');
                return wrong('graph-points', t(pT(q)) + ' is not on the graph: ' + t('f(' + nT(q[0]) + ')=' + sgp(q[0]) + '^{2}' + sg(c) + '=' + f(q[0])) + '. Plot the pairs from your table.');
              }
              var miss = pts.filter(function (q) { return !has(q); });
              if (miss.length) return wrong('graph-missing', 'Those points are right — now plot every pair from your table: ' + (miss.length === 1 ? t(pT(miss[0])) + ' is missing.' : miss.length + ' of them are missing.'));
              if (v.join === 'none') return wrong('graph-not-joined', 'Your points are right — now press <b>Join</b>: the domain is ' + t('x\\in\\mathbb{R}') + ', so every value in between is an input too and the graph is a smooth curve.');
              return ok();
            };
            var key = joined(pts), p = B.graph('Plot the ordered pairs from your table, then draw a smooth curve through them (press <b>Join</b>) to show ' + t('f(x)=x^{2}' + sg(c) + ',\\ x\\in\\mathbb{R}') + '. You may plot more points of the graph if you like.', padIn(win), check, key,
              'The points ' + t(ptsTex(pts)) + ' are symmetric about the ' + t('y') + '-axis (' + t('f(-x)=f(x)') + '). The domain is all real numbers, so they are joined by a smooth curve: a U-shaped parabola whose lowest point (vertex) is ' + t('(0,\\ ' + c + ')') + ' — you may plot that point too.',
              ['Use your table: each column gives one point ' + t('(x,\\ f(x))') + '.', 'With domain ' + t('x\\in\\mathbb{R}') + ' the graph is a smooth curve, not separate dots.'], 'smooth curve x^2' + sg(c));
            p.good = [joined(pts.concat([[0, c]]))];
            p.bad = [dv(pts), joined(xs.map(function (x) { return [x, x * Math.abs(x) + c]; }).filter(function (q) { return q[1] >= -1; })), joined(pts.slice(1)), joined(xs.map(function (x) { return [x, 2 * x + c]; }))];
            return p;
          } }] },
      /* ---------- Q4: constant function ---------- */
      { num: '4', stem: function (sh) { return 'The function ' + t('h(x)=' + sh.k) + ' has domain ' + t(setTex(sh.D)) + '.'; },
        shared: function (r) { return { k: r.int(3, 10), D: r.pick([[0, 5, 15], [0, 5, 15], [0, 4, 12], [0, 6, 12], [0, 5, 10], [2, 6, 14], [0, 3, 15]]) }; },
        parts: [
          { id: '4a', level: 'EMG', make: function (r, sh) {
            var k = sh.k, D = sh.D, pts = D.map(function (x) { return [x, k]; });
            var p = B.pairs('List the ordered pairs of the graph of the function.', pts, {},
              'Every input gives the same output ' + t(k) + ': ' + D.map(function (x) { return t('h(' + x + ')=' + k); }).join(', ') + '. The ordered pairs are ' + t(ptsTex(pts)) + '.',
              ['There is no ' + t('x') + ' in the formula, so nothing changes with the input: the output is always ' + t(k) + '.', 'Write one pair (input, output) for each element of the domain.'], 'pairs of h(x)=' + k);
            var base = p.check, tim = K.pairs(D.map(function (x) { return [x, k * x]; })), idc = K.pairs(D.map(function (x) { return [x, x]; })), zer = K.pairs(D.map(function (x) { return [x, 0]; }));
            p.check = function (resp) {
              var res = base(resp); if (res.v !== 'wrong') return res;
              if (tim(resp).v === 'correct') return wrong('fn-times', t('h(x)=' + k) + ' doesn’t mean ' + t(k) + ' times ' + t('x') + ': it says the output is ' + t(k) + ' whatever the input is.');
              if (idc(resp).v === 'correct') return wrong('pairs-identity', 'The second number of each pair is the <b>output</b> ' + t('h(x)') + ', and here ' + t('h(x)=' + k) + ' for every input.');
              if (zer(resp).v === 'correct') return wrong('fn-const-zero', 'There is no ' + t('x') + ' to substitute into, but the output is not ' + t('0') + ': the formula says ' + t('h(x)=' + k) + '.');
              return res;
            };
            p.bad = ['\\{' + D.map(function (x) { return '(' + x + ', ' + k * x + ')'; }).join(', ') + '\\}', '\\{' + D.map(function (x) { return '(' + x + ', ' + x + ')'; }).join(', ') + '\\}', '\\{' + D.map(function (x) { return '(' + k + ', ' + x + ')'; }).join(', ') + '\\}'];
            return p;
          } },
          { id: '4b', level: 'EMG', make: function (r, sh) {
            var k = sh.k, D = sh.D, pts = D.map(function (x) { return [x, k]; });
            var win = { x: [0, 15], y: [0, 15], labels: 5, unitX: 20, unitY: 20, firstQuadrant: true, xName: 'x', yName: 'h(x)' };
            return plotPart('Graph the function ' + t('h') + '.', win, pts, [
              [D.map(function (x) { return [x, 0]; }), 'fn-const-zero', 'The output is ' + t('h(x)=' + k) + ' for every input, not ' + t('0') + '.']],
              'Each input gives the output ' + t(k) + ', so the graph is the three points ' + t(ptsTex(pts)) + ', all at the height ' + t(k) + ' (on the horizontal line ' + t('y=' + k) + '). The domain has only three values, so the points are not joined. A function like this is called a <b>constant function</b>.',
              ['Plot ' + t('(x,\\ h(x))') + ' for each input in the domain — your ordered pairs from part (a).', 'There is no ' + t('x') + ' in the formula: every output is ' + t(k) + '.'], 'graph constant function h(x)=' + k);
          } }] },
      /* ---------- Q5: vocabulary ---------- */
      { num: '5', stem: function (sh) { return 'Each statement below refers to a function ' + t(sh.n) + ' whose graph has equation ' + t('y=' + sh.n + '(x)') + '.'; },
        shared: function (r) { return { n: r.pick(['h', 'h', 'f', 'g']) }; },
        parts: [
          { id: '5a', level: 'LIM', make: function (r, sh) {
            var n = sh.n, val = r.chance(0.5); // ask about h (name) or h(x) (value)
            if (val) return mc2(r, t(n + '(x)') + ' is the ________ of the function at the input ' + t('x') + '.', [{ html: '<b>name</b>', why: 'The name is just the letter ' + t(n) + '. ' + t(n + '(x)') + ' has an input in its brackets: it is what comes out of ' + t(n) + ' for that input.' }, { html: '<b>value</b>', right: true }],
              t(n + '(x)') + ' is the <b>value</b> (output) of the function at the input ' + t('x') + '. The letter ' + t(n) + ' on its own is the function’s name.', ['Compare ' + t(n) + ' with ' + t(n + '(x)') + '. Which one has an input?'], 'h(x) is the value');
            return mc2(r, t(n) + ' is the ________ of the function.', [{ html: '<b>name</b>', right: true }, { html: '<b>value</b>', why: 'A value (output) of the function is written ' + t(n + '(x)') + ' or ' + t(n + '(3)') + '. The letter ' + t(n) + ' on its own is just the function’s name.' }],
              t(n) + ' is the <b>name</b> of the function. Its value at the input ' + t('x') + ' is written ' + t(n + '(x)') + '.', ['Compare ' + t(n) + ' with ' + t(n + '(x)') + '. Which one has an input?'], 'h is the name');
          } },
          { id: '5b', level: 'LIM', make: function (r, sh) {
            var n = sh.n, rows = r.shuffle([{ id: 'x', html: 'The values of ' + t('x') }, { id: 'fx', html: 'The values of ' + t(n + '(x)') }, { id: 'y', html: 'The values of ' + t('y') }]);
            var why = { x: t('x') + ' is what you substitute into the function, so it is the input.', fx: t(n + '(x)') + ' is what comes out of the function for the input ' + t('x') + ', so it is the output.', y: 'On the graph ' + t('y=' + n + '(x)') + ', ' + t('y') + ' stands for ' + t(n + '(x)') + ', so it is the output.' };
            var p = B.grid('Do the values in each row represent the <b>inputs</b> or the <b>outputs</b> of the function?', rows, [{ id: 'in', html: 'inputs' }, { id: 'out', html: 'outputs' }], { x: 'in', fx: 'out', y: 'out' },
              { tries: 2, why: function (row) { return why[row]; } }, why.x + '<br>' + why.fx + '<br>' + why.y, ['Think of the function as a machine: ' + t('x') + ' goes in, ' + t(n + '(x)') + ' comes out.'], 'inputs/outputs x, h(x), y');
            return p;
          } },
          { id: '5c', level: 'BEG', outcome: 'RF2', make: function (r, sh) {
            var n = sh.n, rows = r.shuffle([{ id: 'x', html: t('x') }, { id: 'fx', html: t(n + '(x)') }, { id: 'y', html: t('y') }]);
            var why = { x: t('x') + ' can be chosen freely, so it is the independent variable.', fx: t(n + '(x)') + ' depends on the value of ' + t('x') + ' you chose, so it is the dependent variable.', y: t('y') + ' stands for ' + t(n + '(x)') + ', so it is the dependent variable.' };
            return B.grid('Which variable of the function does each represent: the <b>independent</b> or the <b>dependent</b> variable?', rows, [{ id: 'ind', html: 'independent' }, { id: 'dep', html: 'dependent' }], { x: 'ind', fx: 'dep', y: 'dep' },
              { tries: 2, why: function (row) { return why[row]; } }, why.x + '<br>' + why.fx + '<br>' + why.y, ['The independent variable is the input you choose; the dependent variable is the output that results.'], 'independent/dependent x, h(x), y');
          } }] },
      /* ---------- Q6: evaluate a linear function ---------- */
      { num: '6', section: 'Evaluating functions', stem: function (sh) { return 'If ' + t('f(x)=' + sh.ftex) + ', determine:'; },
        shared: function (r) { var m = r.int(2, 9), b = -r.int(2, 12); return { m: m, b: b, ftex: lin([[m, 'x'], [b, '']]) }; },
        parts: [
          { id: '6a', level: 'BEG', make: function (r, sh) {
            var m = sh.m, b = sh.b, a = r.int(2, 6), ans = m * a + b;
            return numPart(t('f(' + a + ')'), ans, [
              [m * a - b, 'fn-const-sign', 'Check the sign of the constant: ' + t(m + '(' + a + ')' + sg(b)) + '.'],
              [10 * m + a + b, 'fn-concat', 'Careful: ' + t(m + 'x') + ' means ' + t(m + '\\times x') + '. With ' + t('x=' + a) + ' it becomes ' + t(m + '(' + a + ')=' + m * a) + ', not ' + t(10 * m + a) + '.'],
              [m + a + b, 'fn-add-coef', t(m + 'x') + ' means ' + t(m) + ' <b>times</b> ' + t('x') + ': multiply, don’t add.'],
              [(a - b) / m, 'fn-solved', 'That solves ' + t('f(x)=' + a) + '. Here ' + t(a) + ' is the <b>input</b>: substitute it for ' + t('x') + '.']],
              t('f(' + a + ')=' + m + '(' + a + ')' + sg(b) + '=' + m * a + sg(b) + '=' + ans), HE, 'f(' + a + ') for ' + sh.ftex);
          } },
          { id: '6b', level: 'BEG', make: function (r, sh) {
            var m = sh.m, b = sh.b, a = -r.int(1, 5), ans = m * a + b;
            return numPart(t('f(' + a + ')'), ans, [
              [-m * a + b, 'fn-neg-sub', t(m + '(' + a + ')=' + m * a) + ': a positive times a negative is negative.'],
              [m * a - b, 'fn-const-sign', 'Keep the constant as it is: ' + t(m + '(' + a + ')' + sg(b)) + '.'],
              [m + a + b, 'fn-concat', 'Put the input in brackets: ' + t(m + 'x') + ' becomes ' + t(m + '(' + a + ')') + ', which means multiply.'],
              [(a - b) / m, 'fn-solved', 'That solves ' + t('f(x)=' + a) + '. Here ' + t(a) + ' is the <b>input</b>: substitute it for ' + t('x') + '.']],
              t('f(' + a + ')=' + m + '(' + a + ')' + sg(b) + '=' + m * a + sg(b) + '=' + ans), HN, 'f(' + a + ') for ' + sh.ftex);
          } },
          { id: '6c', level: 'LIM', make: function (r, sh) {
            var m = sh.m, b = sh.b;
            return numPart(t('f(0)'), b, [
              [m + b, 'fn-zero-coef', t(m + '(0)=0') + ', not ' + t(m) + '. Anything times zero is zero.'],
              [0, 'fn-zero-all', t(m + '(0)=0') + ', but the constant ' + t(sg(b)) + ' is still there.'],
              [10 * m + b, 'fn-concat', 'Careful: ' + t(m + 'x') + ' with ' + t('x=0') + ' is ' + t(m + '\\times 0') + ', not ' + t(10 * m) + '.'],
              [-b, 'fn-const-sign', 'Check the sign of the constant.']],
              t('f(0)=' + m + '(0)' + sg(b) + '=0' + sg(b) + '=' + b), HE, 'f(0) for ' + sh.ftex);
          } }] },
      /* ---------- Q7: g(x) = c - x^2 ---------- */
      { num: '7', stem: function (sh) { return 'Function ' + t('g') + ' is defined by ' + t('g(x)=' + sh.c + '-x^{2}') + '. Evaluate:'; },
        shared: function (r) { return { c: r.int(5, 12) }; },
        parts: [
          { id: '7a', level: 'BEG', make: function (r, sh) {
            var c = sh.c, a = r.pick([2, 3, 3, 4]), ans = c - a * a;
            return numPart(t('g(' + a + ')'), ans, [
              [c - 2 * a, 'fn-square-2x', t(a + '^{2}=' + a + '\\times ' + a + '=' + a * a) + ', not ' + t(2 * a) + '.'],
              [c + a * a, 'fn-sign', 'The formula <b>subtracts</b> the square: ' + t(c + '-' + a * a) + '.'],
              [(c - a) * (c - a), 'fn-order', 'Square first, then subtract: ' + t(c + '-(' + a + ')^{2}=' + c + '-' + a * a) + '.'],
              [a * a - c, 'fn-sign', 'Check the order of the subtraction: ' + t(c + '-' + a * a) + '.']],
              t('g(' + a + ')=' + c + '-(' + a + ')^{2}=' + c + '-' + a * a + '=' + ans), HE, 'g(' + a + ') for ' + c + '-x^2');
          } },
          { id: '7b', level: 'EMG', make: function (r, sh) {
            var c = sh.c, a = -r.int(3, 6), ans = c - a * a;
            return numPart(t('g(' + a + ')'), ans, [
              [c + a * a, 'fn-minus-square', t('-x^{2}') + ' means “square, then subtract”: ' + t('(' + a + ')^{2}=' + a * a) + ', so ' + t('g(' + a + ')=' + c + '-' + a * a) + '. The minus sign is not part of the square.'],
              [c + 2 * a, 'fn-square-2x', 'Squaring means multiplying the number by itself: ' + t('(' + a + ')^{2}=(' + a + ')(' + a + ')=' + a * a) + '.'],
              [c - 2 * a, 'fn-square-2x', 'Squaring means multiplying the number by itself: ' + t('(' + a + ')^{2}=(' + a + ')(' + a + ')=' + a * a) + '.'],
              [(c - a) * (c - a), 'fn-order', 'Square first, then subtract: ' + t(c + '-(' + a + ')^{2}') + '.']],
              t('g(' + a + ')=' + c + '-(' + a + ')^{2}=' + c + '-' + a * a + '=' + ans), ['Put the negative input in brackets: ' + t('g(' + a + ')=' + c + '-(' + a + ')^{2}') + '.', 'Square first: ' + t('(' + a + ')^{2}') + ' is positive. Then subtract it from ' + t(c) + '.'], 'g(' + a + ') for ' + c + '-x^2');
          } },
          { id: '7c', level: 'EMG', make: function (r, sh) {
            var c = sh.c, k = r.pick([2, 2, 3, 5, 6, 7]), ans = c - k;
            return numPart(t('g(\\sqrt{' + k + '})'), ans, [
              [c - k * k, 'fn-rad-square', t('(\\sqrt{' + k + '})^{2}=\\sqrt{' + k + '}\\times\\sqrt{' + k + '}=' + k) + ': squaring undoes the square root.'],
              [c + k, 'fn-sign', 'The formula subtracts the square: ' + t(c + '-(\\sqrt{' + k + '})^{2}') + '.'],
              [c - 2 * k, 'fn-square-2x', t('(\\sqrt{' + k + '})^{2}=' + k) + ', not ' + t(2 * k) + '.']],
              t('g(\\sqrt{' + k + '})=' + c + '-(\\sqrt{' + k + '})^{2}=' + c + '-' + k + '=' + ans), ['Substitute ' + t('\\sqrt{' + k + '}') + ' for ' + t('x') + ' in brackets.', 'What is ' + t('\\sqrt{' + k + '}\\times\\sqrt{' + k + '}') + '?'], 'g(sqrt' + k + ') for ' + c + '-x^2');
          } }] },
      /* ---------- Q8: x^3 + c, image and value ---------- */
      { num: '8', stem: function (sh) { return 'A function ' + t('f') + ' is defined by the formula ' + t('f(x)=x^{3}' + sg(sh.c)) + '. Find:'; },
        shared: function (r) { return { c: r.pick([-5, -4, -3, -2, -2, -1, 1, 2, 3, 4]) }; },
        parts: [
          { id: '8a', level: 'BEG', make: function (r, sh) {
            var c = sh.c, a = r.pick([2, 3, 3, 4]), ans = a * a * a + c;
            return numPart('the image of ' + t(a) + ' under ' + t('f'), ans, [
              [3 * a + c, 'fn-cube-3x', t(a + '^{3}=' + a + '\\times ' + a + '\\times ' + a + '=' + a * a * a) + ', not ' + t('3\\times ' + a) + '.'],
              [a * a + c, 'fn-cube-sq', 'That is ' + t(a + '^{2}') + '. Cube means three factors: ' + t(a + '\\times ' + a + '\\times ' + a) + '.'],
              [a * a * a - c, 'fn-const-sign', 'Check the sign of the constant ' + t(sg(c)) + '.'],
              [Math.cbrt(a - c), 'fn-solved', 'The <b>image</b> of ' + t(a) + ' is the output when the input is ' + t(a) + ': work out ' + t('f(' + a + ')') + '.']],
              'The image of ' + t(a) + ' is ' + t('f(' + a + ')') + ':<br>' + t('f(' + a + ')=(' + a + ')^{3}' + sg(c) + '=' + a * a * a + sg(c) + '=' + ans),
              ['“The image of ' + t(a) + ' under ' + t('f') + '” means the output ' + t('f(' + a + ')') + '.', 'Cube first, then add the constant.'], 'image of ' + a + ' under x^3' + sg(c));
          } },
          { id: '8b', level: 'EMG', make: function (r, sh) {
            var c = sh.c, a = -r.pick([2, 3, 4, 4]), ans = a * a * a + c;
            return numPart('the value of ' + t('f') + ' at ' + t(a), ans, [
              [-a * a * a + c, 'fn-cube-neg', t('(' + a + ')^{3}=(' + a + ')(' + a + ')(' + a + ')=' + a * a * a) + ': three negative factors give a negative answer.'],
              [3 * a + c, 'fn-cube-3x', t('(' + a + ')^{3}') + ' means ' + t('(' + a + ')(' + a + ')(' + a + ')') + ', not ' + t('3(' + a + ')') + '.'],
              [a * a * a - c, 'fn-const-sign', 'Check the sign of the constant ' + t(sg(c)) + '.'],
              [a * a * a - Math.abs(c), 'fn-sign', 'Watch the signs when you add the constant: ' + t(a * a * a + sg(c)) + '.']],
              t('f(' + a + ')=(' + a + ')^{3}' + sg(c) + '=' + a * a * a + sg(c) + '=' + ans), HN, 'f(' + a + ') for x^3' + sg(c));
          } }] },
      /* ---------- Q9: cubic polynomial ---------- */
      { num: '9', stem: function (sh) { return 'If ' + t('f(x)=' + sh.ftex) + ', evaluate:'; },
        shared: function (r) { var a = r.int(1, 4), b = -r.int(1, 4), d = r.int(1, 6); return { a: a, b: b, d: d, ftex: lin([[1, 'x^{3}'], [a, 'x^{2}'], [b, 'x'], [d, '']]) }; },
        parts: [
          { id: '9a', level: 'EMG', make: function (r, sh) {
            var a = sh.a, b = sh.b, d = sh.d, x = r.pick([2, 2, 3]), f = function (v) { return v * v * v + a * v * v + b * v + d; }, ans = f(x);
            var steps = '(' + x + ')^{3}' + term(a, '(' + x + ')^{2}') + term(b, '(' + x + ')') + sg(d), s2 = x * x * x + sg(a * x * x) + sg(b * x) + sg(d);
            return numPart(t('f(' + x + ')'), ans, [
              [x * x * x + a * x * x - b * x + d, 'fn-sign', 'Check the sign of the ' + t(term(b, 'x', true)) + ' term: ' + t(term(b, '(' + x + ')', true) + '=' + b * x) + '.'],
              [x * x * x + a * a * x * x + b * x + d, 'fn-coef-power', 'Only the input is squared: ' + t(term(a, '(' + x + ')^{2}', true) + '=' + a + '(' + x * x + ')=' + a * x * x) + '.'],
              [3 * x + 2 * a * x + b * x + d, 'fn-cube-3x', 'Powers mean repeated multiplication: ' + t(x + '^{3}=' + x * x * x) + ' and ' + t(x + '^{2}=' + x * x) + '.']],
              t('f(' + x + ')=' + steps) + '<br>' + t('=' + s2 + '=' + ans), HE, 'f(' + x + ') for ' + sh.ftex);
          } },
          { id: '9b', level: 'PRG', make: function (r, sh) {
            var a = sh.a, b = sh.b, d = sh.d, x = -r.pick([2, 3, 3]), f = function (v) { return v * v * v + a * v * v + b * v + d; }, ans = f(x);
            var steps = '(' + x + ')^{3}' + term(a, '(' + x + ')^{2}') + term(b, '(' + x + ')') + sg(d), s2 = x * x * x + sg(a * x * x) + sg(b * x) + sg(d);
            return numPart(t('f(' + x + ')'), ans, [
              [-x * x * x + a * x * x + b * x + d, 'fn-cube-neg', t('(' + x + ')^{3}=' + x * x * x) + ': an odd power of a negative is negative.'],
              [x * x * x - a * x * x + b * x + d, 'fn-neg-square', t('(' + x + ')^{2}=' + x * x) + ': an even power of a negative is positive.'],
              [x * x * x + a * x * x - b * x + d, 'fn-neg-sub', 'Check the ' + t(term(b, 'x', true)) + ' term: ' + t(term(b, '(' + x + ')', true) + '=' + sg(b * x)) + ' — a negative times a negative is positive.'],
              [x * x * x + a * a * x * x + b * x + d, 'fn-coef-power', 'Only the input is squared: ' + t(term(a, '(' + x + ')^{2}', true) + '=' + a + '(' + x * x + ')=' + a * x * x) + '.']],
              t('f(' + x + ')=' + steps) + '<br>' + t('=' + s2 + '=' + ans), HN, 'f(' + x + ') for ' + sh.ftex);
          } }] },
      /* ---------- Q10: f(x) = c - mx, five ways ---------- */
      { num: '10', stem: function (sh) { return 'Consider the function ' + t('f') + ' defined by ' + t('f(x)=' + sh.ftex + ',\\ x\\in\\mathbb{R}') + '. Determine:'; },
        shared: function (r) { var c = r.int(8, 20), m = r.int(2, 5); return { c: c, m: m, ftex: c + '-' + m + 'x' }; },
        parts: [
          { id: '10a', level: 'BEG', make: function (r, sh) {
            var c = sh.c, m = sh.m, a = r.int(2, 5), ans = c - m * a;
            return numPart(t('f(' + a + ')'), ans, [
              [c + m * a, 'fn-sign', 'The formula subtracts: ' + t(c + '-' + m + '(' + a + ')') + '.'],
              [(c - m) * a, 'fn-order', 'Multiply before you subtract: ' + t(c + '-' + m + '(' + a + ')=' + c + '-' + m * a) + '.'],
              [m * a - c, 'fn-sign', 'Check the order: ' + t(c + '-' + m * a) + '.'],
              [c - 10 * m - a, 'fn-concat', t(m + 'x') + ' with ' + t('x=' + a) + ' is ' + t(m + '\\times ' + a) + '.']],
              t('f(' + a + ')=' + c + '-' + m + '(' + a + ')=' + c + '-' + m * a + '=' + ans), HE, 'f(' + a + ') for ' + sh.ftex);
          } },
          { id: '10b', level: 'BEG', make: function (r, sh) {
            var c = sh.c, m = sh.m, a = -r.int(2, 6), ans = c - m * a;
            return numPart('the value of ' + t('f') + ' when ' + t('x=' + a), ans, [
              [c + m * a, 'fn-neg-sub', t('-' + m + '(' + a + ')=+' + (-m * a)) + ': a negative times a negative is positive.'],
              [(c - m) * a, 'fn-order', 'Multiply before you subtract: ' + t(c + '-' + m + '(' + a + ')') + '.'],
              [m * a - c, 'fn-sign', 'Check the order of the subtraction: ' + t(c + '-' + m + '(' + a + ')') + '.']],
              t('f(' + a + ')=' + c + '-' + m + '(' + a + ')=' + c + '+' + (-m * a) + '=' + ans), HN, 'f(' + a + ') for ' + sh.ftex);
          } },
          { id: '10c', level: 'EMG', make: function (r, sh) {
            var c = sh.c, m = sh.m, a = r.pick([0.5, 1.5, 1.5, 2.5, 3.5]), ans = cl(c - m * a);
            return numPart('the image of ' + t(a) + ' under ' + t('f'), ans, [
              [c + m * a, 'fn-sign', 'The formula subtracts: ' + t(c + '-' + m + '(' + a + ')') + '.'],
              [(c - m) * a, 'fn-order', 'Multiply before you subtract: ' + t(c + '-' + m + '(' + a + ')=' + c + '-' + nT(m * a)) + '.'],
              [c - m - a, 'fn-add-coef', t(m + 'x') + ' means ' + t(m + '\\times x') + ': ' + t(m + '(' + a + ')=' + nT(m * a)) + '.'],
              [(c - a) / m, 'fn-solved', 'The <b>image</b> of ' + t(a) + ' is the output ' + t('f(' + a + ')') + ' — substitute ' + t(a) + ' for ' + t('x') + '.']],
              'The image of ' + t(a) + ' is ' + t('f(' + a + ')=' + c + '-' + m + '(' + a + ')=' + c + '-' + nT(m * a) + '=' + nT(ans)),
              ['“The image of ' + t(a) + '” means the output when the input is ' + t(a) + '.', 'A calculator is fine for the decimal multiplication.'], 'image of ' + a + ' under ' + sh.ftex);
          } },
          { id: '10d', level: 'EMG', make: function (r, sh) {
            var c = sh.c, m = sh.m, k = r.int(2, 5), T = PL([[c], [-m * k, 't']]);
            return polyPart('an expression for ' + t('f(' + k + 't)'), t('f(' + k + 't)='), T, c + '-' + m * k + 't', [
              { is: PL([[c], [-(m + k), 't']]), code: 'fn-add-coef', hint: t(m + '(' + k + 't)') + ' means ' + t(m + '\\times ' + k + 't=' + m * k + 't') + ': multiply the numbers.' },
              { is: PL([[c * k], [-m * k, 't']]), code: 'fn-scale-out', hint: 'Only the input changes: replace ' + t('x') + ' with ' + t(k + 't') + '. The ' + t(c) + ' is not multiplied by ' + t(k) + '.' },
              { is: PL([[c - m], [k, 't']]), code: 'fn-order', hint: 'Replace ' + t('x') + ' with ' + t('(' + k + 't)') + ': ' + t(c + '-' + m + '(' + k + 't)') + '. Then multiply ' + t(m + '\\times ' + k + 't') + '.' }],
              t('f(' + k + 't)=' + c + '-' + m + '(' + k + 't)=' + c + '-' + m * k + 't'), HX, 'f(' + k + 't) for ' + sh.ftex);
          } },
          { id: '10e', level: 'PRG', make: function (r, sh) {
            var c = sh.c, m = sh.m, h = r.int(1, 4), T = PL([[c + m * h], [-m, 'a']]);
            var p = polyPart('an expression for ' + t('f(a-' + h + ')'), t('f(a-' + h + ')='), T, (c + m * h) + '-' + m + 'a', [
              { is: PL([[c - m * h], [-m, 'a']]), code: 'fn-dist-sign', hint: t('-' + m + '(a-' + h + ')=-' + m + 'a+' + m * h) + ': a negative times a negative is positive, so the ' + t(m * h) + ' is <b>added</b>.' },
              { is: PL([[c - h], [-m, 'a']]), code: 'fn-dist', hint: 'Put the whole input in brackets: ' + t(c + '-' + m + '(a-' + h + ')') + '. The ' + t(m) + ' multiplies both terms.' },
              { is: PL([[c], [-m, 'a']]), code: 'fn-drop', hint: 'That is ' + t('f(a)') + '. Replace ' + t('x') + ' with the whole expression ' + t('(a-' + h + ')') + '.' }],
              t('f(a-' + h + ')=' + c + '-' + m + '(a-' + h + ')') + '<br>' + t('=' + c + '-' + m + 'a+' + m * h) + '<br>' + t('=' + (c + m * h) + '-' + m + 'a'), HX, 'f(a-' + h + ') for ' + sh.ftex);
            p.good = ['-' + m + 'a+' + (c + m * h)];
            return p;
          } }] },
      /* ---------- Q11: solving f(x) = b ---------- */
      { num: '11', section: 'Solving f(x) = b', stem: 'Solve for the unknown in each case.', parts: [
        { id: '11a', level: 'EMG', make: function (r) {
          var m = r.int(2, 9), b = r.int(2, 12), x = r.int(2, 9), V = m * x - b, ft = m + 'x-' + b;
          return numPart('If ' + t('f(x)=' + ft) + ', determine ' + t('x') + ' if ' + t('f(x)=' + V) + '.', x, [
            [m * V - b, 'fn-evaluated', 'That is ' + t('f(' + V + ')') + '. Here ' + t(V) + ' is the <b>output</b>: solve ' + t(ft + '=' + V) + ' for ' + t('x') + '.'],
            [(V - b) / m, 'fn-solve-inverse', 'To undo ' + t('-' + b) + ', <b>add</b> ' + t(b) + ' to both sides: ' + t(m + 'x=' + (V + b)) + '.'],
            [V + b, 'fn-solve-divide', t(m + 'x=' + (V + b)) + ' — now divide both sides by ' + t(m) + '.'],
            [-x, 'fn-solve-sign', 'Check the sign: substitute your answer into ' + t(ft) + '.']],
            t(ft + '=' + V) + '<br>' + t(m + 'x=' + (V + b)) + '<br>' + t('x=' + x), HS, 'solve ' + ft + '=' + V, { before: t('x=') });
        } },
        { id: '11b', level: 'EMG', make: function (r) {
          var m = r.int(3, 9), b = r.int(2, 9), x = -r.int(2, 6), V = m * x + b, ft = m + 'x+' + b;
          return numPart('If ' + t('g(x)=' + ft) + ', determine ' + t('x') + ' if ' + t('g(x)=' + V) + '.', x, [
            [m * V + b, 'fn-evaluated', 'That is ' + t('g(' + V + ')') + '. Here ' + t(V) + ' is the <b>output</b>: solve ' + t(ft + '=' + V) + '.'],
            [(V + b) / m, 'fn-solve-inverse', 'To undo ' + t('+' + b) + ', <b>subtract</b> ' + t(b) + ' from both sides: ' + t(m + 'x=' + (V - b)) + '.'],
            [V - b, 'fn-solve-divide', t(m + 'x=' + (V - b)) + ' — now divide both sides by ' + t(m) + '.'],
            [-x, 'fn-solve-sign', 'Check the sign: ' + t((V - b) + '\\div ' + m) + ' is negative.']],
            t(ft + '=' + V) + '<br>' + t(m + 'x=' + (V - b)) + '<br>' + t('x=' + x), HS, 'solve ' + ft + '=' + V, { before: t('x=') });
        } },
        { id: '11c', level: 'PRG', make: function (r) {
          var c = r.int(20, 60), m = r.int(2, 9), x = r.int(2, 9), V = c - m * x, ft = c + '-' + m + 't';
          if (V <= 0) { c = m * x + r.int(3, 20); V = c - m * x; ft = c + '-' + m + 't'; }
          return numPart('If ' + t('g(t)=' + ft) + ', determine ' + t('t') + ' if ' + t('g(t)=' + V) + '.', x, [
            [c - m * V, 'fn-evaluated', 'That is ' + t('g(' + V + ')') + '. Here ' + t(V) + ' is the output: solve ' + t(ft + '=' + V) + ' for ' + t('t') + '.'],
            [-x, 'fn-solve-sign', t('-' + m + 't=' + (V - c)) + ': dividing a negative by a negative gives a positive.'],
            [(c + V) / m, 'fn-solve-inverse', 'Subtract ' + t(c) + ' from both sides: ' + t('-' + m + 't=' + V + '-' + c + '=' + (V - c)) + '.'],
            [c - V, 'fn-solve-divide', t('-' + m + 't=' + (V - c)) + ' — now divide both sides by ' + t(-m) + '.']],
            t(ft + '=' + V) + '<br>' + t('-' + m + 't=' + (V - c)) + '<br>' + t('t=' + x), HS, 'solve ' + ft + '=' + V, { before: t('t=') });
        } },
        { id: '11d', level: 'PRG', make: function (r) {
          var m = r.int(2, 6), b = r.int(2, 12), x = -r.int(2, 8), V = -m * x + b, ft = '-' + m + 'x+' + b;
          return numPart('If ' + t('h(x)=' + ft) + ', determine ' + t('x') + ' if ' + t('h(x)=' + V) + '.', x, [
            [-m * V + b, 'fn-evaluated', 'That is ' + t('h(' + V + ')') + '. Here ' + t(V) + ' is the output: solve ' + t(ft + '=' + V) + '.'],
            [-x, 'fn-solve-sign', t('-' + m + 'x=' + (V - b)) + ': divide both sides by ' + t('-' + m) + ' — a positive divided by a negative is negative.'],
            [(V + b) / -m, 'fn-solve-inverse', 'Subtract ' + t(b) + ' from both sides: ' + t('-' + m + 'x=' + (V - b)) + '.'],
            [V - b, 'fn-solve-divide', t('-' + m + 'x=' + (V - b)) + ' — now divide both sides by ' + t('-' + m) + '.']],
            t(ft + '=' + V) + '<br>' + t('-' + m + 'x=' + (V - b)) + '<br>' + t('x=' + x), HS, 'solve ' + ft + '=' + V, { before: t('x=') });
        } },
        { id: '11e', level: 'PRG', make: function (r) {
          var o = pickWhere(function () { var k = r.int(2, 5), s = r.int(2, 6); return { k: k, s: s, c: 10 * r.int(1, 9) }; }, function (o) { return o.c <= o.k * o.s * o.s - 10; });
          var k = o.k, s = o.s, c = o.c, V = c - k * s * s, ft = c + '-' + k + 'x^{2}';
          return solPart('If ' + t('P(x)=' + ft) + ', determine the values of ' + t('x') + ' if ' + t('P(x)=' + V) + '.', [s, -s], 'x', [
            [[s * s, -s * s], 'fn-sqrt-not', t('x^{2}=' + s * s) + ' — now take the square root of both sides.'],
            [[s * s], 'fn-sqrt-not', t('x^{2}=' + s * s) + ' — now take the square root (both the positive and the negative root).'],
            [[Math.sqrt((c + V) / k), -Math.sqrt((c + V) / k)], 'fn-solve-inverse', 'Subtract ' + t(c) + ' from both sides first: ' + t('-' + k + 'x^{2}=' + V + '-' + c + '=' + (V - c)) + '.'],
            [[c - k * V * V], 'fn-evaluated', 'That is ' + t('P(' + V + ')') + '. Here ' + t(V) + ' is the output: solve ' + t(ft + '=' + V) + '.']],
            t(ft + '=' + V) + '<br>' + t('-' + k + 'x^{2}=' + (V - c)) + '<br>' + t('x^{2}=' + s * s) + '<br>' + t('x=\\pm' + s) + ' — two inputs give the output ' + t(V) + '.', HS.concat(['A square has two square roots: ' + t('x^{2}=25') + ' gives ' + t('x=5') + ' or ' + t('x=-5') + '.']), 'solve ' + ft + '=' + V, 'x=\\pm ' + s);
        } }] },
      /* ---------- Q12 ---------- */
      { num: '12', stem: function (sh) { return 'Consider the function ' + t('f') + ' defined by ' + t('f(x)=' + sh.m + 'x-' + sh.b) + '. Find:'; },
        shared: function (r) { return { m: r.int(3, 9), b: r.int(5, 25) }; },
        parts: [
          { id: '12a', level: 'LIM', make: function (r, sh) {
            var m = sh.m, b = sh.b;
            return numPart(t('f(0)'), -b, [[m - b, 'fn-zero-coef', t(m + '(0)=0') + ': anything times zero is zero.'], [0, 'fn-zero-all', t(m + '(0)=0') + ', but the ' + t('-' + b) + ' is still there.'], [b, 'fn-const-sign', 'Check the sign.']],
              t('f(0)=' + m + '(0)-' + b + '=-' + b), HE, 'f(0) for ' + m + 'x-' + b);
          } },
          { id: '12b', level: 'PRG', make: function (r, sh) {
            var m = sh.m, b = sh.b, p = r.int(2, 4), q = r.int(1, 4), T = PL([[m * p, 'x'], [-m * q - b]]);
            return polyPart('an expression for ' + t('f(' + p + 'x-' + q + ')'), t('f(' + p + 'x-' + q + ')='), T, null, [
              { is: PL([[m * p, 'x'], [-q - b]]), code: 'fn-dist', hint: 'The ' + t(m) + ' multiplies <b>both</b> terms of the input: ' + t(m + '(' + p + 'x-' + q + ')=' + m * p + 'x-' + m * q) + '.' },
              { is: PL([[m * p, 'x'], [m * q - b]]), code: 'fn-dist-sign', hint: t(m + '(-' + q + ')=-' + m * q) + ': keep the sign of the second term.' },
              { is: PL([[m * p, 'x'], [-b]]), code: 'fn-drop', hint: 'Don’t lose the ' + t('-' + q) + ' inside the input: ' + t(m + '(' + p + 'x-' + q + ')') + '.' }],
              t('f(' + p + 'x-' + q + ')=' + m + '(' + p + 'x-' + q + ')-' + b) + '<br>' + t('=' + m * p + 'x-' + m * q + '-' + b) + '<br>' + t('=' + m * p + 'x-' + (m * q + b)), HX, 'f(' + p + 'x-' + q + ') for ' + m + 'x-' + b);
          } },
          { id: '12c', level: 'EMG', make: function (r, sh) {
            var m = sh.m, b = sh.b, x = r.int(2, 9), V = m * x - b;
            return numPart('the solution to the equation ' + t('f(x)=' + V), x, [
              [m * V - b, 'fn-evaluated', 'That is ' + t('f(' + V + ')') + '. Solve ' + t(m + 'x-' + b + '=' + V) + ' instead.'],
              [(V - b) / m, 'fn-solve-inverse', 'Add ' + t(b) + ' to both sides: ' + t(m + 'x=' + (V + b)) + '.'],
              [V + b, 'fn-solve-divide', t(m + 'x=' + (V + b)) + ' — now divide by ' + t(m) + '.']],
              t(m + 'x-' + b + '=' + V) + '<br>' + t(m + 'x=' + (V + b)) + '<br>' + t('x=' + x), HS, 'solve ' + m + 'x-' + b + '=' + V, { before: t('x=') });
          } }] },
      /* ---------- Q13: C(x) = sqrt(x) ---------- */
      { num: '13', stem: 'A function ' + t('C') + ' is defined by ' + t('C(x)=\\sqrt{x}') + ', where ' + t('x\\ge 0') + '.', parts: [
        { id: '13a', sub: 'a(i)', level: 'BEG', make: function (r) {
          var n = r.int(4, 15);
          return numPart('Evaluate ' + t('C(' + n * n + ')') + '.', n, [[n * n, 'fn-sqrt-not', t('C(' + n * n + ')=\\sqrt{' + n * n + '}') + ': take the square root.'], [n * n / 2, 'fn-sqrt-half', 'The square root is the number that multiplies by itself to give ' + t(n * n) + ' — not half of it.']],
            t('C(' + n * n + ')=\\sqrt{' + n * n + '}=' + n), ['Replace ' + t('x') + ' with ' + t(n * n) + ': ' + t('C(' + n * n + ')=\\sqrt{' + n * n + '}') + '.'], 'C(' + n * n + ')');
        } },
        { id: '13b', sub: 'a(ii)', level: 'EMG', make: function (r) {
          var n = r.int(3, 12);
          return B.fraction('Evaluate ' + t('C\\left(\\dfrac{1}{' + n * n + '}\\right)') + ' (as a fraction).', [1, n], { diag: function (v) {
            if (same(v, 1 / (n * n))) return { code: 'fn-sqrt-not', hint: 'Take the square root: ' + t('\\sqrt{\\tfrac{1}{' + n * n + '}}=\\tfrac{\\sqrt{1}}{\\sqrt{' + n * n + '}}') + '.' };
            if (same(v, 1 / (2 * n * n)) || same(v, 0.5 / n)) return { code: 'fn-sqrt-half', hint: 'The square root of a fraction is the root of the top over the root of the bottom.' };
            return null;
          } }, t('C\\left(\\tfrac{1}{' + n * n + '}\\right)=\\sqrt{\\tfrac{1}{' + n * n + '}}=\\tfrac{\\sqrt{1}}{\\sqrt{' + n * n + '}}=\\tfrac{1}{' + n + '}'), ['Take the square root of the numerator and of the denominator separately.'], 'C(1/' + n * n + ')');
        } },
        { id: '13c', sub: 'a(iii)', level: 'EMG', make: function (r) {
          var o = pickWhere(function () { var b = r.int(2, 5), k = r.int(2, 5); return { b: b, k: k, a: b * k }; }, function (o) { return o.a <= 15; });
          var a = o.a, b = o.b, k = o.k;
          return numPart('Evaluate ' + t('\\dfrac{C(' + a * a + ')}{C(' + b * b + ')}') + '.', k, [[k * k, 'fn-sqrt-not', 'Evaluate each part first: ' + t('C(' + a * a + ')=\\sqrt{' + a * a + '}=' + a) + '.'], [a - b, 'fn-sign', 'The fraction bar means divide: ' + t(a + '\\div ' + b) + '.'], [a * a / b, 'fn-sqrt-not', 'Take the square root of the bottom too: ' + t('C(' + b * b + ')=' + b) + '.']],
            t('C(' + a * a + ')=\\sqrt{' + a * a + '}=' + a) + ' and ' + t('C(' + b * b + ')=\\sqrt{' + b * b + '}=' + b) + ', so ' + t('\\dfrac{' + a + '}{' + b + '}=' + k) + '.', ['Work out the top and the bottom separately, then divide.'], 'C(' + a * a + ')/C(' + b * b + ')');
        } },
        { id: '13d', sub: 'b', level: 'EMG', make: function (r) {
          var n = r.int(6, 15);
          var p = numPart('If ' + t('C(x)=' + n) + ', find ' + t('x') + '.', n * n, [[2 * n, 'fn-square-2x', 'Undo the square root by <b>squaring</b>: ' + t(n + '^{2}=' + n + '\\times ' + n) + '.'], [n / 2, 'fn-root-solve', 'Undo a square root by squaring, not halving.']],
            t('\\sqrt{x}=' + n) + '<br>' + t('x=' + n + '^{2}=' + n * n) + '<br>Check: ' + t('\\sqrt{' + n * n + '}=' + n) + '.', HS.concat(['What number has a square root of ' + t(n) + '?']), 'solve sqrt x=' + n, { before: t('x=') });
          var c = p.check; p.check = function (resp) { var v = HW.parse.number(resp); if (v.ok && Math.abs(v.value - Math.sqrt(n)) < 0.01) return wrong('fn-root-solve', 'That is ' + t('\\sqrt{' + n + '}') + ' — it evaluates ' + t('C(' + n + ')') + '. Here ' + t(n) + ' is the <b>output</b>: which input has square root ' + t(n) + '?'); return c(resp); };
          p.bad.push(String(Math.round(Math.sqrt(n) * 100) / 100));
          return p;
        } }] },
      /* ---------- Q14 ---------- */
      { num: '14', stem: function () { return 'A function ' + t('g') + ' is defined by a formula of the form ' + t('g(t)=t+c') + '.'; }, parts: [
        { id: '14', level: 'EMG', make: function (r) {
          var c = r.int(5, 30), p = r.int(2, 9), q = -r.int(2, 9), ans = 2 * c + p + q;
          return numPart('If ' + t('g(t)=t+' + c) + ', calculate the value of ' + t('g(' + p + ')+g(' + q + ')') + '.', ans, [
            [p + q + c, 'fn-input-sum', 'Evaluate each part first: ' + t('g(' + p + ')') + ' and ' + t('g(' + q + ')') + ' are two outputs. Each one includes the ' + t('+' + c) + '.'],
            [p + q, 'fn-neg-sub', t('g(' + q + ')=' + q + '+' + c + '=' + (q + c)) + '. Add ' + t(c) + ' to ' + t(q) + ', don’t subtract it.'],
            [2 * c + p - q, 'fn-neg-drop', 'Keep the negative input: ' + t('g(' + q + ')=' + q + '+' + c + '=' + (q + c)) + '.']],
            t('g(' + p + ')=' + p + '+' + c + '=' + (p + c)) + ' and ' + t('g(' + q + ')=' + q + '+' + c + '=' + (q + c)) + ', so ' + t('g(' + p + ')+g(' + q + ')=' + (p + c) + '+' + (q + c) + '=' + ans) + '.', ['Find each output separately, then add the two outputs.'], 'g(' + p + ')+g(' + q + ') for t+' + c);
        } }] },
      /* ---------- Q15: context ---------- */
      { num: '15', stem: function (sh) { return sh.ctx.stem(money(sh.Fc), money(sh.Rc)); },
        shared: function (r) {
          var ctx = r.pick([CTX[0], CTX[0], CTX[1], CTX[2]]), Fc = r.pick(ctx.F), Rc = r.pick(ctx.R), n1 = ctx.n(r), n2 = pickWhere(function () { return ctx.n(r); }, function (x) { return x !== n1; });
          return { ctx: ctx, Fc: Fc, Rc: Rc, n1: n1, n2: n2, C: function (n) { return Fc + Rc * n; } };
        },
        parts: [
          { id: '15a', level: 'EMG', make: function (r, sh) {
            var x = sh.ctx, v = x.v, n = sh.n1, V = sh.C(n), Ft = money(sh.Fc), Rt = money(sh.Rc);
            var p = numPart('Evaluate ' + t('C(' + n + ')') + '.', V / 100, [
              [(sh.Fc + sh.Rc) * n / 100, 'fn-order', 'Multiply first: ' + t(Rt + '(' + n + ')') + ', then add the ' + t(Ft) + '.'],
              [(sh.Fc * n + sh.Rc) / 100, 'fn-swap-rate', 'The ' + t(n) + ' replaces ' + t(v) + ', so it multiplies ' + t(Rt) + ' (the number next to ' + t(v) + '), not ' + t(Ft) + '.'],
              [sh.Rc * n / 100, 'fn-fee', 'Don’t forget the ' + t(Ft) + ' at the start of the formula.']],
              t('C(' + n + ')=' + Ft + '+' + Rt + '(' + n + ')=' + Ft + '+' + money(sh.Rc * n) + '=' + money(V)) + ', so ' + t('\\$' + money(V)) + '.',
              ['Replace ' + t(v) + ' with ' + t(n) + ' and use the order of operations.', 'A calculator is fine here.'], 'C(' + n + ') context', { before: '$' });
            p.answer = t('\\$' + money(V)); p.good = [money(V)];
            return p;
          } },
          { id: '15b', level: 'EMG', make: function (r, sh) {
            var x = sh.ctx, n = sh.n1, V = money(sh.C(n)), Rt = money(sh.Rc);
            return mc(r, 'What does ' + t('C(' + n + ')=' + V) + ' mean in this situation?', [
              { html: x.phrase(n) + ' costs $' + V + '.', right: true },
              { html: 'It costs $' + V + ' for every ' + x.per + '.', why: t('C(' + n + ')') + ' is the <b>total</b> cost for an input of ' + t(n) + '. The cost per ' + x.per + ' is $' + Rt + '.' },
              { html: x.swap(n, V), why: 'That swaps input and output. In ' + t('C(' + x.v + ')') + ' the input ' + t(x.v) + ' is the ' + x.inWord + ' and the output ' + t('C(' + x.v + ')') + ' is the cost.' },
              { html: t('C') + ' multiplied by ' + t(n) + ' is ' + V + '.', why: 'The brackets mark the input: ' + t('C(' + n + ')') + ' is the output when the input is ' + t(n) + '.' }],
              t('C(' + n + ')') + ' is the output (cost, in dollars) when the input (' + x.inWord + ') is ' + t(n) + ': ' + x.phrase(n).toLowerCase() + ' costs $' + V + '.', ['Input: ' + x.inWord + '. Output: cost. Which is which in ' + t('C(' + n + ')=' + V) + '?'], 'meaning of C(n)');
          } },
          { id: '15c', level: 'PRG', make: function (r, sh) {
            var x = sh.ctx, v = x.v, n = sh.n2, Vc = sh.C(n), V = money(Vc), Ft = money(sh.Fc), Rt = money(sh.Rc);
            return numPart('Solve ' + t('C(' + v + ')=' + V) + '.', n, [
              [(sh.Fc + sh.Rc * Vc / 100) / 100, 'fn-evaluated', 'That is ' + t('C(' + V + ')') + '. Here ' + t(V) + ' is the <b>cost</b> (the output): solve ' + t(Ft + '+' + Rt + v + '=' + V) + '.'],
              [Vc / sh.Rc, 'fn-fee', 'Subtract the ' + t(Ft) + ' first: ' + t(Rt + v + '=' + V + '-' + Ft + '=' + money(Vc - sh.Fc)) + '.'],
              [(Vc + sh.Fc) / sh.Rc, 'fn-solve-inverse', 'To undo ' + t('+' + Ft) + ', <b>subtract</b> it from both sides.'],
              [(Vc - sh.Fc) / 100, 'fn-solve-divide', t(Rt + v + '=' + money(Vc - sh.Fc)) + ' — now divide by ' + t(Rt) + '.']],
              t(Ft + '+' + Rt + v + '=' + V) + '<br>' + t(Rt + v + '=' + money(Vc - sh.Fc)) + '<br>' + t(v + '=' + money(Vc - sh.Fc) + '\\div ' + Rt + '=' + n) + ' ' + x.after + '.', HS, 'solve C=' + V + ' context', { before: t(v + '='), after: x.after });
          } },
          { id: '15d', level: 'EMG', make: function (r, sh) {
            var x = sh.ctx, Ft = money(sh.Fc), Rt = money(sh.Rc);
            return mc(r, 'What does ' + t('C(0)=' + Ft) + ' represent?', [
              { html: 'The ' + x.fee + ': $' + Ft + ' is charged even when the ' + x.inWord + ' is ' + t('0') + '.', right: true },
              { html: 'The cost per ' + x.per + '.', why: 'The cost per ' + x.per + ' is the number multiplied by ' + t(x.v) + ' ($' + Rt + '). ' + t('C(0)') + ' is the cost when the input is ' + t('0') + '.' },
              { html: 'The ' + x.inWord + ' you get when the cost is $0.', why: 'In ' + t('C(0)') + ' the <b>input</b> is ' + t('0') + '. The output ' + t(Ft) + ' is a cost.' },
              { html: 'Nothing: an input of ' + t('0') + ' can’t happen, so ' + t('C(0)') + ' has no meaning.', why: 'Substituting ' + t('0') + ' tells you the part of the cost that doesn’t depend on the input — the starting amount.' }],
              t('C(0)=' + Ft + '+' + Rt + '(0)=' + Ft) + ': the cost before any ' + x.inWord + ' is added. It is the ' + x.fee + ' (the starting value, the vertical intercept of the graph).', ['Substitute ' + t('0') + ' into the formula. Which part of the cost is left?'], 'meaning of C(0)');
          } }] },
      /* ---------- Q16–Q18 ---------- */
      { num: '16', section: 'Multiple choice and numerical response', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '16', level: 'EMG', make: function (r) {
          var c = r.int(8, 14), m = r.pick([2, 3, 3, 4]), D = [0, 1, 2, 3, 4], R = D.map(function (k) { return c - m * k; });
          var cand = range(Math.min.apply(null, R) + 1, Math.max.apply(null, R) - 1).filter(function (v) { return R.indexOf(v) < 0; }), ans = r.pick(cand);
          var ins = r.sample(R, 3);
          var opts = ins.map(function (v) { var k = (c - v) / m; return { html: t(v), why: t('f(' + k + ')=' + c + '-' + m + '(' + k + ')=' + v) + ', so ' + t(v) + ' <i>is</i> in the range.' }; }).concat([{ html: t(ans), right: true }]);
          return mc(r, 'The function ' + t('f(x)=' + c + '-' + m + 'x') + ' has domain ' + t(setTex(D)) + '. Which of the following is <b>not</b> an element of the range of the function?', opts,
            D.map(function (k) { return t('f(' + k + ')=' + (c - m * k)); }).join(', ') + ', so the range is ' + t(setTex(sortU(R))) + '. ' + t(ans) + ' is not in it.', ['Evaluate ' + t('f') + ' at every element of the domain to get the range.'], 'not in range of ' + c + '-' + m + 'x');
        } }] },
      { num: '17', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '17', level: 'EMG', make: function (r) {
          var o = pickWhere(function () { var m = r.int(2, 5), b = r.int(1, 6), x = r.int(3, 9); return { m: m, b: b, x: x, V: m * x - b }; }, function (o) { var w = [(o.V - o.b) / o.m, o.V + o.b, o.m * o.V - o.b]; return Number.isInteger(w[0]) && w[0] > 0 && sortU(w.concat([o.x])).length === 4; });
          var m = o.m, b = o.b, x = o.x, V = o.V, vals = sortU([x, (V - b) / m, V + b, m * V - b]);
          var why = {}; why[(V - b) / m] = 'Check it: ' + t('f(' + (V - b) / m + ')=' + (m * (V - b) / m - b)) + ', not ' + t(V) + '. To undo ' + t('-' + b) + ', add ' + t(b) + '.'; why[V + b] = t(m + 't=' + (V + b)) + ' — you still have to divide by ' + t(m) + '.'; why[m * V - b] = 'That is ' + t('f(' + V + ')') + '. ' + t(V) + ' is the output; solve ' + t(m + 't-' + b + '=' + V) + '.';
          return mc(r, 'If ' + t('f(x)=' + m + 'x-' + b) + ' and ' + t('f(t)=' + V) + ', then ' + t('t=') + ' ________', vals.map(function (v) { return { html: t(v), right: v === x, why: v === x ? null : why[v] }; }),
            t(m + 't-' + b + '=' + V) + ', so ' + t(m + 't=' + (V + b)) + ' and ' + t('t=' + x) + '.', HS, 'f(t)=' + V + ' for ' + m + 'x-' + b);
        } }] },
      { num: '18', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '18', level: 'PRG', make: function (r) {
          var o = pickWhere(function () { return { a: r.int(2, 7), s: r.int(2, 5), q: r.pick([2, 3, 5, 5, 6, 7]) }; }, function (o) { return o.s * o.s * o.q <= 200; });
          var a = o.a, s = o.s, q = o.q, n = s * s * q, k = a * s;
          return B.nr('A function ' + t('f') + ' is defined by the formula ' + t('f(x)=' + a + '\\sqrt{x},\\ x\\ge 0') + '. The value of ' + t('f(' + n + ')') + ' can be written in the form ' + t('k\\sqrt{' + q + '}') + '. The value of ' + t('k') + ' is ________.', k, function (v) {
            if (v === a * s * s) return { code: 'fn-rad-noroot', hint: t(s * s) + ' comes out of the radical as its square root: ' + t('\\sqrt{' + s * s + '}=' + s) + '.' };
            if (v === s) return { code: 'fn-rad-coef', hint: 'Don’t forget the ' + t(a) + ' in front: ' + t('f(' + n + ')=' + a + '\\sqrt{' + n + '}') + '.' };
            if (v === a + s) return { code: 'fn-rad-add', hint: t(a + '(' + s + '\\sqrt{' + q + '})') + ' means multiply: ' + t(a + '\\times ' + s) + '.' };
            return null;
          }, t('f(' + n + ')=' + a + '\\sqrt{' + n + '}=' + a + '\\sqrt{' + s * s + '\\cdot ' + q + '}=' + a + '(' + s + '\\sqrt{' + q + '})=' + k + '\\sqrt{' + q + '}') + ', so ' + t('k=' + k) + '.',
          ['Substitute, then simplify the radical: look for a perfect-square factor of ' + t(n) + '.'], 'k for ' + a + 'sqrt(' + n + ')');
        } }] },
      /* ---------- Extension Q19–21 ---------- */
      { num: '19', section: 'Extension — substituting expressions into non-linear functions', stem: '<i>(Extension)</i>', parts: [
        { id: '19', level: 'BEG', make: function (r) {
          var c = r.pick([-5, -4, -3, -2, -2, -1, 1, 2, 3]), T = PL([[1, 'a', 3], [c]]);
          return polyPart('For ' + t('f(x)=x^{3}' + sg(c)) + ', find an expression for ' + t('f(a)') + '.', t('f(a)='), T, null, [
            { is: PL([[3, 'a'], [c]]), code: 'fn-cube-3x', hint: 'Replace ' + t('x') + ' with ' + t('a') + ' and keep the exponent: ' + t('a^{3}') + ', not ' + t('3a') + '.' },
            { is: PL([[1, 'a', 3]]), code: 'fn-const', hint: 'Keep the constant: only the ' + t('x') + ' changes.' }],
            'Replace ' + t('x') + ' with ' + t('a') + ': ' + t('f(a)=a^{3}' + sg(c)) + '.', ['Replace every ' + t('x') + ' with ' + t('a') + '. Nothing else changes.'], 'f(a) for x^3' + sg(c));
        } }] },
      { num: '20', stem: '<i>(Extension)</i>', parts: [
        { id: '20', level: 'ADV', make: function (r) {
          var o = pickWhere(function () { return { s: r.int(2, 5), q: r.pick([2, 3, 3, 5, 6, 7]), c: r.int(5, 30) }; }, function (o) { return o.s * o.s * o.q <= 120; });
          var s = o.s, q = o.q, c = o.c, A = s * s * q, V = A + c, root = s * Math.sqrt(q);
          var p = solPart('For ' + t('g(t)=t+' + c) + ', if ' + t('g(a^{2})=' + V) + ', determine the values of ' + t('a') + ' in simplest radical form.', [root, -root], 'a', [
            [[A, -A], 'fn-sqrt-not', t('a^{2}=' + A) + ' — now take the square root of both sides.'],
            [[Math.sqrt(V + c), -Math.sqrt(V + c)], 'fn-solve-inverse', 'Subtract ' + t(c) + ' from both sides: ' + t('a^{2}=' + V + '-' + c) + '.'],
            [[c + V * V], 'fn-evaluated', t(V) + ' is the output. Replace ' + t('t') + ' with ' + t('a^{2}') + ' and solve ' + t('a^{2}+' + c + '=' + V) + '.']],
            t('g(a^{2})=a^{2}+' + c) + ', so ' + t('a^{2}+' + c + '=' + V) + '<br>' + t('a^{2}=' + A) + '<br>' + t('a=\\pm\\sqrt{' + A + '}=\\pm\\sqrt{' + s * s + '\\cdot ' + q + '}=\\pm ' + s + '\\sqrt{' + q + '}'),
            ['Replace ' + t('t') + ' with ' + t('a^{2}') + ', then solve for ' + t('a^{2}') + ' first.', 'Take both square roots and simplify the radical (look for a perfect-square factor).'], 'g(a^2)=' + V, 'a=\\pm ' + s + '\\sqrt{' + q + '}');
          var c0 = p.check;
          p.check = function (resp) {
            var res = c0(resp); if (res.v !== 'correct') return res;
            var str = String(resp || '');
            if (/\d\.\d/.test(str)) return form('decimal', 'Right values — but give them <b>exactly</b>, in simplest radical form (use ' + t('\\sqrt{\\ }') + '), not as decimals.');
            var m, re = /\\sqrt\{(\d+)\}|sqrt\((\d+)\)|√\{?(\d+)/g;
            while ((m = re.exec(str))) { var N = Number(m[1] || m[2] || m[3]); if (!ex.simplest(N, 2)) return form('not-simplest', 'Right values — now simplify the radical: ' + t(N) + ' has a perfect-square factor.'); }
            return res;
          };
          p.good = ['\\pm ' + s + '\\sqrt{' + q + '}', 'a=-' + s + '\\sqrt{' + q + '}, a=' + s + '\\sqrt{' + q + '}'];
          p.bad.push('\\pm\\sqrt{' + A + '}', '\\pm ' + cl(root), s + '\\sqrt{' + q + '}');
          return p;
        } }] },
      { num: '21', stem: function (sh) { return '<i>(Extension)</i> If ' + t('F(x)=' + sh.ft) + ', determine a simplified expression for:'; },
        shared: function (r) { var a = r.pick([2, 2, 3]), b = -r.int(2, 7), c = -r.int(1, 5); return { a: a, b: b, c: c, h: r.int(2, 5), ft: lin([[a, 'x^{2}'], [b, 'x'], [c, '']]) }; },
        parts: [
          { id: '21a', level: 'PRG', make: function (r, sh) {
            var a = sh.a, b = sh.b, c = sh.c, T = PL([[a, 'x', 2], [-b, 'x'], [c]]);
            return polyPart(t('F(-x)'), t('F(-x)='), T, null, [
              { is: PL([[-a, 'x', 2], [-b, 'x'], [c]]), code: 'fn-neg-square', hint: t('(-x)^{2}=(-x)(-x)=x^{2}') + ': the square is positive.' },
              { is: PL([[-a, 'x', 2], [-b, 'x'], [-c]]), code: 'fn-neg-out', hint: 'That is ' + t('-F(x)') + ': you changed every sign. Only the input changes: replace each ' + t('x') + ' with ' + t('(-x)') + '.' },
              { is: PL([[a, 'x', 2], [b, 'x'], [c]]), code: 'fn-unchanged', hint: 'Replace each ' + t('x') + ' with ' + t('(-x)') + ': the ' + t('x') + ' term changes sign.' }],
              t('F(-x)=' + a + '(-x)^{2}' + term(b, '(-x)') + sg(c)) + '<br>' + t('=' + a + 'x^{2}' + term(-b, 'x') + sg(c)), HX, 'F(-x) for ' + sh.ft);
          } },
          { id: '21b', level: 'ADV', make: function (r, sh) {
            var a = sh.a, b = sh.b, c = sh.c, h = sh.h, xp = PL([[1, 'x'], [h]]);
            var T = P.add(P.scale(P.pow(xp, 2), a), P.scale(xp, b), P.num(c));
            return polyPart(t('F(x+' + h + ')'), t('F(x+' + h + ')='), T, null, [
              { is: P.add(P.scale(PL([[1, 'x', 2], [h * h]]), a), P.scale(xp, b), P.num(c)), code: 'fn-binom-sq', hint: t('(x+' + h + ')^{2}=(x+' + h + ')(x+' + h + ')=x^{2}+' + 2 * h + 'x+' + h * h) + ' — don’t forget the middle term.' },
              { is: PL([[a, 'x', 2], [b, 'x'], [c + h]]), code: 'fn-plus-out', hint: 'That is ' + t('F(x)+' + h) + '. Replace every ' + t('x') + ' in the formula with ' + t('(x+' + h + ')') + '.' },
              { is: P.add(P.pow(PL([[a, 'x'], [a * h]]), 2), P.scale(xp, b), P.num(c)), code: 'fn-coef-in', hint: 'Square the bracket first, then multiply by ' + t(a) + ': ' + t(a + '(x+' + h + ')^{2}=' + a + '(x^{2}+' + 2 * h + 'x+' + h * h + ')') + '.' },
              { is: P.add(P.scale(P.pow(xp, 2), a), PL([[b, 'x'], [-b * h]]), P.num(c)), code: 'fn-dist-sign', hint: t(b + '(x+' + h + ')=' + b + 'x' + sg(b * h)) + ': the ' + t(b) + ' multiplies both terms, sign included.' }],
              t('F(x+' + h + ')=' + a + '(x+' + h + ')^{2}' + term(b, '(x+' + h + ')') + sg(c)) + '<br>' + t('=' + a + '(x^{2}+' + 2 * h + 'x+' + h * h + ')' + term(b, 'x') + sg(b * h) + sg(c)) + '<br>' + t('=' + a + 'x^{2}+' + 2 * a * h + 'x+' + a * h * h + term(b, 'x') + sg(b * h) + sg(c)) + '<br>' + t('=' + P.tex(T)), HX.concat(['Expand ' + t('(x+' + h + ')^{2}') + ' as ' + t('(x+' + h + ')(x+' + h + ')') + ' before multiplying by ' + t(a) + '.']), 'F(x+' + h + ') for ' + sh.ft);
          } }] }
    ],
    extra: [
      /* ---------- EP10: rewriting ---------- */
      { num: '10', section: 'Extra practice C — The name, the value and the graph', stem: 'Each line below says something about a function. Take ' + t('y=f(x)') + ' to be the equation of the graph of ' + t('f') + '.', parts: [
        { id: 'e10a', level: 'LIM', make: function (r) {
          var p = r.pick(nz(-6, 6)), q = pickWhere(function () { return r.pick(nz(-9, 9)); }, function (q) { return q !== p; });
          var part = B.pairs(t('f(' + p + ')=' + q) + '. Write the ordered pair this puts on the graph of ' + t('f') + '.', [[p, q]], {}, 'Input ' + t(p) + ', output ' + t(q) + ': the point ' + t('(' + p + ',\\ ' + q + ')') + '.',
            ['In ' + t('f(a)=b') + ', ' + t('a') + ' is the input (the ' + t('x') + '-coordinate) and ' + t('b') + ' is the output (the ' + t('y') + '-coordinate).'], 'f(p)=q as a point');
          part.bad = ['(' + q + ', ' + p + ')'];
          return part;
        } },
        { id: 'e10b', level: 'BEG', make: function (r) {
          var p = r.pick(nz(-6, 6)), q = pickWhere(function () { return r.pick(nz(-9, 9)); }, function (q) { return q !== p; });
          return fnEqPart('The point ' + t('(' + p + ',\\ ' + q + ')') + ' lies on the graph of ' + t('f') + '. Write this in function notation.', 'f', p, q, false);
        } },
        { id: 'e10c', level: 'BEG', make: function (r) {
          var p = r.pick(nz(-6, 6)), q = pickWhere(function () { return r.pick(nz(-9, 9)); }, function (q) { return q !== p; });
          return fnEqPart('The image of ' + t(p) + ' under ' + t('f') + ' is ' + t(q) + '. Write this in function notation and as a point.', 'f', p, q, true);
        } },
        { id: 'e10d', level: 'BEG', make: function (r) {
          var v = r.pick(nz(-7, 7));
          return mc(r, t('g(0)=' + v) + '. Which feature of the graph of ' + t('g') + ' does this describe?', [
            { html: 'The ' + t('y') + '-intercept, ' + t('(0,\\ ' + v + ')'), right: true },
            { html: 'An ' + t('x') + '-intercept, ' + t('(' + v + ',\\ 0)'), why: 'Here the <b>input</b> is ' + t('0') + ', so the point is ' + t('(0,\\ ' + v + ')') + ', on the ' + t('y') + '-axis. An ' + t('x') + '-intercept has output ' + t('0') + '.' },
            { html: 'The highest point of the graph', why: 'Nothing says ' + t(v) + ' is the largest output. ' + t('g(0)=' + v) + ' only gives the point with input ' + t('0') + '.' },
            { html: 'The slope of the graph', why: 'A single value ' + t('g(0)') + ' gives one point, not a rate of change.' }],
            'Input ' + t('0') + ', output ' + t(v) + ': the point ' + t('(0,\\ ' + v + ')') + ' is on the ' + t('y') + '-axis, so it is the <b>' + t('y') + '-intercept</b>.', ['Write ' + t('g(0)=' + v) + ' as a point. Which axis is it on?'], 'g(0) is the y-intercept');
        } },
        { id: 'e10e', level: 'BEG', make: function (r) {
          var v = r.pick(nz(-7, 7));
          return mc(r, t('h(' + v + ')=0') + '. Which feature of the graph of ' + t('h') + ' does this describe?', [
            { html: 'An ' + t('x') + '-intercept, ' + t('(' + v + ',\\ 0)'), right: true },
            { html: 'The ' + t('y') + '-intercept, ' + t('(0,\\ ' + v + ')'), why: 'The input is ' + t(v) + ' and the output is ' + t('0') + ': the point is ' + t('(' + v + ',\\ 0)') + ', on the ' + t('x') + '-axis.' },
            { html: 'The point where ' + t('h') + ' is not defined', why: 'An output of ' + t('0') + ' is a perfectly good output.' },
            { html: 'The lowest point of the graph', why: 'An output of ' + t('0') + ' doesn’t have to be the lowest one.' }],
            'Input ' + t(v) + ', output ' + t('0') + ': the point ' + t('(' + v + ',\\ 0)') + ' is on the ' + t('x') + '-axis, so it is an <b>' + t('x') + '-intercept</b>.', ['Write ' + t('h(' + v + ')=0') + ' as a point. Which axis is it on?'], 'h(v)=0 is an x-intercept');
        } },
        { id: 'e10f', level: 'EMG', make: function (r) {
          var v = r.int(2, 6);
          return mc(r, t('f(' + v + ')=f(-' + v + ')') + '. What does this say about the graph of ' + t('f') + '?', [
            { html: 'The points with inputs ' + t(v) + ' and ' + t('-' + v) + ' are at the same height: two inputs share one output.', right: true },
            { html: t('f') + ' is not a function, because two inputs give the same output.', why: 'A function may give two inputs the same output. It fails only if one input has two outputs.' },
            { html: 'Both outputs are ' + t('0') + '.', why: 'The outputs are equal to each other, but nothing says they are ' + t('0') + '.' },
            { html: 'The graph passes through ' + t('(' + v + ',\\ -' + v + ')') + '.', why: t('f(' + v + ')') + ' is an output; the statement compares two outputs, it doesn’t give their value.' }],
            'The points ' + t('(' + v + ',\\ f(' + v + '))') + ' and ' + t('(-' + v + ',\\ f(' + v + '))') + ' are at the <b>same height</b>: two inputs share one output, which a function may do.', ['Write both sides as points ' + t('(x,\\ y)') + '. What do the two points have in common?'], 'f(v)=f(-v)');
        } }] },
      /* ---------- EP11: reading a parabola ---------- */
      { num: '11', stem: function (sh) {
          var f = sh.f;
          return 'The graph of a function ' + t('f') + ' is shown. Read every answer off the graph.' + HW.graph({ x: [Math.min(-1, sh.h - 4), Math.max(1, sh.h + 4)], y: [sh.k - 2, sh.k + 10], labels: 2, max: 320, xName: 'x', yName: 'y', fns: [{ f: f, from: sh.h - 3, to: sh.h + 3, start: 'closed', end: 'closed' }], aria: 'graph of f' });
        },
        shared: function (r) {
          var h = r.pick([-2, -1, 1, 1, 2]), k = r.pick([-4, -4, -1]);
          return { h: h, k: k, f: function (x) { return (x - h) * (x - h) + k; }, j: k === -4 ? 1 : 2, root: Math.sqrt(-k) };
        },
        parts: [
          { id: 'e11a', level: 'BEG', make: function (r, sh) {
            var v = sh.f(0);
            return numPart(t('f(0)'), v, [[0, 'fn-zero-all', 'Find where the graph crosses the ' + t('y') + '-axis (input ' + t('0') + ') and read its height.']], 'The graph meets the vertical line ' + t('x=0') + ' at ' + t('(0,\\ ' + v + ')') + ', so ' + t('f(0)=' + v) + '.', ['Go to ' + t('x=0') + ' (the ' + t('y') + '-axis) and read the height of the graph there.'], 'read f(0)');
          } },
          { id: 'e11b', level: 'BEG', make: function (r, sh) {
            var x = sh.h + sh.root === 0 ? sh.h - sh.root : sh.h + sh.root;
            return numPart(t('f(' + x + ')'), 0, [[x, 'fn-eq-flip', 'Go to the input ' + t(x) + ' on the horizontal axis and read the <b>height</b> of the graph there.']], 'The graph crosses the ' + t('x') + '-axis at ' + t('(' + x + ',\\ 0)') + ', so ' + t('f(' + x + ')=0') + '.', ['Find ' + t('x=' + x) + ' on the horizontal axis, then go up or down to the graph.'], 'read f at root');
          } },
          { id: 'e11c', level: 'EMG', make: function (r, sh) {
            var h = sh.h, v = sh.f(h + 3);
            return solPart('All values of ' + t('x') + ' for which ' + t('f(x)=' + v) + '.', [h - 3, h + 3], 'x', [[[v], 'fn-eq-flip', 'You want the <b>inputs</b> where the height is ' + t(v) + '. Draw the horizontal line ' + t('y=' + v) + ' and read the ' + t('x') + '-values where it meets the graph.']],
              'The line ' + t('y=' + v) + ' meets the graph at the endpoints ' + t('(' + (h - 3) + ',\\ ' + v + ')') + ' and ' + t('(' + (h + 3) + ',\\ ' + v + ')') + ', so ' + t('x=' + (h - 3)) + ' or ' + t('x=' + (h + 3)) + '.', ['Draw the horizontal line ' + t('y=' + v) + '. Where does it meet the graph?', 'Check both sides of the graph.'], 'read f(x)=' + v);
          } },
          { id: 'e11d', level: 'EMG', make: function (r, sh) {
            var h = sh.h, j = sh.j, v = sh.f(h + j);
            return solPart('All values of ' + t('x') + ' for which ' + t('f(x)=' + v) + '.', [h - j, h + j], 'x', [[[v], 'fn-eq-flip', 'You want the <b>inputs</b> where the height is ' + t(v) + '. Draw the horizontal line ' + t('y=' + v) + '.']],
              'The line ' + t('y=' + v) + ' meets the graph at ' + t('(' + (h - j) + ',\\ ' + v + ')') + ' and ' + t('(' + (h + j) + ',\\ ' + v + ')') + ', so ' + t('x=' + (h - j)) + ' or ' + t('x=' + (h + j)) + '.', ['Draw the horizontal line ' + t('y=' + v) + '. Where does it meet the graph?'], 'read f(x)=' + v);
          } },
          { id: 'e11e', level: 'EMG', make: function (r, sh) {
            var h = sh.h, k = sh.k;
            return mc(r, 'The equation ' + t('f(x)=' + k) + ' has exactly one solution. Which statement is correct?', [
              { html: t('x=' + h) + ': the point ' + t('(' + h + ',\\ ' + k + ')') + ' is the lowest point (vertex), so the line ' + t('y=' + k) + ' touches the graph only there.', right: true },
              h !== k ? { html: t('x=' + k) + ': it is the lowest point of the graph.', why: t(k) + ' is the <b>output</b> (the height). The solution is the input: read the ' + t('x') + '-coordinate of that point.' }
                : { html: t('x=' + (-h)) + ': it is the lowest point of the graph.', why: 'Check which side of the ' + t('y') + '-axis the lowest point is on: it is ' + t('(' + h + ',\\ ' + k + ')') + ', so the input is ' + t(h) + '.' },
              { html: t('x=' + h) + ': it is where the graph crosses the ' + t('y') + '-axis.', why: 'The ' + t('y') + '-axis is where the input is ' + t('0') + '. Look at what is special about the height ' + t(k) + '.' },
              { html: t('x=' + (h - sh.root)) + ' and ' + t('x=' + (h + sh.root)) + ': the ' + t('x') + '-intercepts.', why: 'Those solve ' + t('f(x)=0') + '. Draw the line ' + t('y=' + k) + ' instead.' }],
              'The line ' + t('y=' + k) + ' touches the graph only at ' + t('(' + h + ',\\ ' + k + ')') + ', the lowest point (vertex). So ' + t('x=' + h) + ' is the only solution.', ['Draw the horizontal line ' + t('y=' + k) + '. How many times does it meet the graph, and where?'], 'f(x)=k at vertex');
          } },
          { id: 'e11f', level: 'PRG', make: function (r, sh) {
            var k = sh.k, v = k - 2;
            return mc(r, 'The equation ' + t('f(x)=' + v) + ' has no solution. Which explanation is correct?', [
              { html: 'The lowest point is at height ' + t(k) + ', so the line ' + t('y=' + v) + ' never meets the graph: ' + t(v) + ' is not in the range. ' + t('f') + ' is still a function, because every vertical line meets the graph at most once.', right: true },
              { html: t('f') + ' is not a function, because some output values have no input.', why: 'The function test is about <b>inputs</b>: each input must have exactly one output. An output value that is never used says nothing about it.' },
              { html: 'The graph would reach ' + t('y=' + v) + ' if it continued past its endpoints.', why: 'Past its endpoints the curve would keep going <b>up</b>. Its lowest point is at height ' + t(k) + '.' },
              { html: t('f(x)') + ' can never be negative.', why: 'Look at the graph: some outputs are negative — for example ' + t('f(' + sh.h + ')=' + k) + '.' }],
              'The whole graph lies on or above ' + t('y=' + k) + ', so the line ' + t('y=' + v) + ' never meets it: ' + t(v) + ' is not in the range. Whether ' + t('f') + ' is a function depends on vertical lines (one output per input), not on unused outputs.', ['What is the lowest height the graph reaches?'], 'f(x)=k-2 no solution');
          } }] },
      /* ---------- EP12: a function given by a table ---------- */
      { num: '12', stem: function (sh) { return 'A function ' + t('f') + ' is given entirely by the table below.' + HW.valueTable([[t('x')].concat(sh.xs.map(function (x) { return t(x); })), [t('f(x)')].concat(sh.ys.map(function (y) { return t(y); }))]); },
        shared: function (r) {
          return pickWhere(function () {
            var xs = sortU(r.sample(nz(-5, 7), 5).concat([0])), vals = r.sample(nz(-5, 9), 4), A = vals[0], Bv = vals[1], C = vals[2], D = vals[3];
            var slots = r.shuffle([0, 1, 2, 3, 4, 5]), ys = []; ys[slots[0]] = A; ys[slots[1]] = A; ys[slots[2]] = Bv; ys[slots[3]] = Bv; ys[slots[4]] = C; ys[slots[5]] = D;
            return { xs: xs, ys: ys, A: A, B: Bv, i0: xs.indexOf(0) };
          }, function (o) { return o.xs.length === 6 && (o.ys[o.i0] !== o.A && o.ys[o.i0] !== o.B); });
        },
        parts: [
          { id: 'e12a', level: 'BEG', make: function (r, sh) {
            var iB = sh.ys.indexOf(sh.B), iU = range(0, 5).filter(function (i) { return i !== sh.i0 && sh.ys[i] !== sh.A && sh.ys[i] !== sh.B; })[0];
            var xa = sh.xs[iB], xb = sh.xs[iU], ya = sh.ys[iB], yb = sh.ys[iU];
            var flip = function (x, y) { return K.number(y, function (v) { return sh.xs.indexOf(v) >= 0 ? { code: 'fn-eq-flip', hint: t(v) + ' is an input (top row). Find ' + t(x) + ' in the <b>' + t('x') + '</b> row, then read the output underneath it.' } : null; }); };
            return B.fields('State ' + t('f(' + xa + ')') + ' and ' + t('f(' + xb + ')') + '.', [{ name: t('f(' + xa + ')'), before: t('f(' + xa + ')=') }, { name: t('f(' + xb + ')'), before: t('f(' + xb + ')=') }], [flip(xa, ya), flip(xb, yb)], [String(ya), String(yb)],
              t('f(' + xa + ')=' + ya) + ', ' + t('f(' + xb + ')=' + yb), 'Read down the columns: under ' + t('x=' + xa) + ' the output is ' + t(ya) + '; under ' + t('x=' + xb) + ' it is ' + t(yb) + '.', ['Find the input in the top row and read the output directly below it.'], 'read table values');
          } },
          { id: 'e12b', level: 'EMG', make: function (r, sh) { return tableSolve(sh, sh.A); } },
          { id: 'e12c', level: 'EMG', make: function (r, sh) { return tableSolve(sh, sh.B); } },
          { id: 'e12d', level: 'EMG', outcome: 'RF2', make: function (r, sh) {
            var A = sh.A, xa = sh.xs.filter(function (x, i) { return sh.ys[i] === A; });
            return mc(r, 'Why does the repeated output ' + t(A) + ' not stop ' + t('f') + ' from being a function?', [
              { html: 'The test restricts inputs, not outputs: each input appears once with one output. Two inputs sharing an output is allowed.', right: true },
              { html: 'It does stop it: an output used twice means ' + t('f') + ' is not a function.', why: 'Look at the definition: each <b>input</b> must have exactly one output. Outputs may repeat.' },
              { html: 'Because ' + t(A) + ' is ' + (A > 0 ? 'positive' : 'negative') + '.', why: 'The sign of an output has nothing to do with the function test.' },
              { html: 'Because the table has more than ' + t('5') + ' columns.', why: 'The size of the table doesn’t matter. Check whether any input has two outputs.' }],
              'The inputs ' + t(sh.xs.join(',\\ ')) + ' each appear once, each with one output. ' + t('f(' + xa[0] + ')=f(' + xa[1] + ')=' + A) + ' is two inputs sharing an output (many-to-one), which is allowed.', ['What does the definition of a function restrict — inputs or outputs?'], 'repeated output ok');
          } },
          { id: 'e12e', level: 'EMG', make: function (r, sh) {
            var y0 = sh.ys[sh.i0], opts = [
              { html: 'No solution: ' + t('0') + ' is not an output in the table.', right: true },
              { html: t('x=0'), why: t('x=0') + ' is an input, and ' + t('f(0)=' + y0) + ', not ' + t('0') + '. Look for ' + t('0') + ' in the <b>output</b> row.' },
              { html: t('x=' + y0), why: t(y0) + ' is the output ' + t('f(0)') + '. Solving ' + t('f(x)=0') + ' asks for an input whose output is ' + t('0') + '.' }];
            for (var i = 0; i + 1 < 6; i++) if (sh.ys[i] * sh.ys[i + 1] < 0) { opts.push({ html: 'A value of ' + t('x') + ' between ' + t(sh.xs[i]) + ' and ' + t(sh.xs[i + 1]) + ', where the outputs change sign.', why: 'The function is given <b>entirely</b> by the table: there are no inputs between the columns.' }); break; }
            if (opts.length < 4) opts.push({ html: 'Every value of ' + t('x') + '.', why: 'Check the output row: is any output equal to ' + t('0') + '?' });
            return mc(r, 'What is the answer to “solve ' + t('f(x)=0') + '” for this function?', opts, t('0') + ' never appears in the ' + t('f(x)') + ' row, so no input has output ' + t('0') + ': <b>no solution</b>.', ['Look for ' + t('0') + ' in the output row.'], 'table f(x)=0');
          } },
          { id: 'e12f', level: 'BEG', make: function (r, sh) {
            var pts = sh.xs.map(function (x, i) { return [x, sh.ys[i]]; });
            return B.pairs('Write the six ordered pairs that lie on the graph of ' + t('y=f(x)') + '.', pts, {}, t(ptsTex(pts)), ['Each column gives one pair (input, output).'], 'table to pairs');
          } }] },
      /* ---------- EP13: expressions as inputs ---------- */
      { num: '13', section: 'Extra practice D — Numbers and expressions as inputs', stem: function (sh) { return 'A function is defined by ' + t('f(x)=' + sh.ft) + '. Determine each of the following, simplified.'; },
        shared: function (r) { var b = -r.int(2, 6), c = r.pick([-3, -2, -1, 1, 1, 2, 3, 4, 5]); return { b: b, c: c, k: r.pick([2, 2, 3]), h: r.pick([1, 1, 2]), q: r.pick([2, 2, 1, 3]), ft: lin([[1, 'x^{2}'], [b, 'x'], [c, '']]) }; },
        parts: [
          { id: 'e13a', level: 'EMG', make: function (r, sh) {
            var b = sh.b, c = sh.c, x = -sh.q, ans = x * x + b * x + c;
            return numPart(t('f(' + x + ')'), ans, [[-x * x + b * x + c, 'fn-neg-square', t('(' + x + ')^{2}=' + x * x) + ': an even power of a negative is positive.'], [x * x - b * x + c, 'fn-neg-sub', t(b + '(' + x + ')=' + sg(b * x)) + ': a negative times a negative is positive.']],
              t('f(' + x + ')=(' + x + ')^{2}' + term(b, '(' + x + ')') + sg(c) + '=' + x * x + sg(b * x) + sg(c) + '=' + ans), HN, 'f(' + x + ') for ' + sh.ft);
          } },
          { id: 'e13b', level: 'BEG', make: function (r, sh) {
            var T = PL([[1, 'a', 2], [sh.b, 'a'], [sh.c]]);
            return polyPart(t('f(a)'), t('f(a)='), T, null, [{ is: PL([[2, 'a'], [sh.b, 'a'], [sh.c]]), code: 'fn-square-2x', hint: 'Keep the exponent: ' + t('x^{2}') + ' becomes ' + t('a^{2}') + '.' }], 'Replace every ' + t('x') + ' with ' + t('a') + ': ' + t('f(a)=' + P.tex(T)) + '.', ['Replace every ' + t('x') + ' with ' + t('a') + '.'], 'f(a)');
          } },
          { id: 'e13c', level: 'PRG', make: function (r, sh) {
            var b = sh.b, c = sh.c, k = sh.k, T = PL([[k * k, 'a', 2], [b * k, 'a'], [c]]);
            return polyPart(t('f(' + k + 'a)'), t('f(' + k + 'a)='), T, null, [
              { is: PL([[k, 'a', 2], [b * k, 'a'], [c]]), code: 'fn-sq-coef', hint: t('(' + k + 'a)^{2}=' + k + 'a\\cdot ' + k + 'a=' + k * k + 'a^{2}') + ': the ' + t(k) + ' is squared too.' },
              { is: PL([[k * k, 'a', 2], [b, 'a'], [c]]), code: 'fn-dist', hint: 'Replace <b>every</b> ' + t('x') + ' with ' + t('(' + k + 'a)') + ', including the one in ' + t(term(b, 'x', true)) + '.' }],
              t('f(' + k + 'a)=(' + k + 'a)^{2}' + term(b, '(' + k + 'a)') + sg(c) + '=' + P.tex(T)), HX, 'f(ka)');
          } },
          { id: 'e13d', level: 'ADV', make: function (r, sh) {
            var b = sh.b, c = sh.c, h = sh.h, ap = PL([[1, 'a'], [h]]), T = P.add(P.pow(ap, 2), P.scale(ap, b), P.num(c));
            return polyPart(t('f(a+' + h + ')'), t('f(a+' + h + ')='), T, null, [
              { is: P.add(PL([[1, 'a', 2], [h * h]]), P.scale(ap, b), P.num(c)), code: 'fn-binom-sq', hint: t('(a+' + h + ')^{2}=(a+' + h + ')(a+' + h + ')=a^{2}+' + 2 * h + 'a+' + h * h) + ' — don’t forget the middle term.' },
              { is: PL([[1, 'a', 2], [b, 'a'], [c + h]]), code: 'fn-plus-out', hint: 'That is ' + t('f(a)+' + h) + '. In ' + t('f(a+' + h + ')') + ' the ' + t('+' + h) + ' is part of the <b>input</b>, so it goes into every ' + t('x') + '.' },
              { is: P.add(P.pow(ap, 2), PL([[b, 'a'], [h]]), P.num(c)), code: 'fn-dist', hint: t(b + '(a+' + h + ')=' + b + 'a' + sg(b * h)) + ': multiply both terms.' }],
              t('f(a+' + h + ')=(a+' + h + ')^{2}' + term(b, '(a+' + h + ')') + sg(c)) + '<br>' + t('=a^{2}+' + 2 * h + 'a+' + h * h + term(b, 'a') + sg(b * h) + sg(c)) + '<br>' + t('=' + P.tex(T)), HX, 'f(a+h)');
          } },
          { id: 'e13e', level: 'EMG', make: function (r, sh) {
            var b = sh.b, c = sh.c, h = sh.h, T = PL([[1, 'a', 2], [b, 'a'], [c + h]]), ap = PL([[1, 'a'], [h]]);
            return polyPart(t('f(a)+' + h), t('f(a)+' + h + '='), T, null, [{ is: P.add(P.pow(ap, 2), P.scale(ap, b), P.num(c)), code: 'fn-plus-in', hint: 'That is ' + t('f(a+' + h + ')') + '. Here the ' + t('+' + h) + ' is outside the brackets: find ' + t('f(a)') + ', then add ' + t(h) + ' to the output.' }],
              t('f(a)+' + h + '=(' + lin([[1, 'a^{2}'], [b, 'a'], [c, '']]) + ')+' + h + '=' + P.tex(T)), ['Find ' + t('f(a)') + ' first, then add ' + t(h) + ' to the finished output.'], 'f(a)+h');
          } },
          { id: 'e13f', level: 'PRG', make: function (r, sh) {
            var h = sh.h;
            return mc(r, 'Your answers for ' + t('f(a+' + h + ')') + ' and ' + t('f(a)+' + h) + ' are different. Why does the ' + t('+' + h) + ' land in a different place?', [
              { html: 'In ' + t('f(a+' + h + ')') + ' the ' + t('+' + h) + ' is part of the input, so it is squared and multiplied along with ' + t('a') + '. In ' + t('f(a)+' + h) + ' it is added to the finished output.', right: true },
              { html: 'They should be the same; one of the answers has an arithmetic error.', why: 'Test with ' + t('a=0') + ': ' + t('f(' + h + ')') + ' and ' + t('f(0)+' + h) + ' are different numbers.' },
              { html: 'Brackets mean multiply, so ' + t('f(a+' + h + ')=f\\cdot a+f\\cdot ' + h) + '.', why: 'In function notation the brackets mark the input — ' + t('f') + ' is a name, not a number.' },
              { html: t('f(a)+' + h) + ' adds ' + t(h) + ' to the input; ' + t('f(a+' + h + ')') + ' adds it to the output.', why: 'That is backwards: whatever is inside the brackets is the input.' }],
              'In ' + t('f(a+' + h + ')') + ' the whole expression ' + t('a+' + h) + ' goes into the machine. In ' + t('f(a)+' + h) + ' the machine works on ' + t('a') + ' and ' + t(h) + ' is added to the output afterwards.', ['Which one has the ' + t('+' + h) + ' inside the brackets?'], 'f(a+h) vs f(a)+h');
          } }] },
      /* ---------- EP14: g(x) = c - mx ---------- */
      { num: '14', stem: function (sh) { return 'A function is defined by ' + t('g(x)=' + sh.c + '-' + sh.m + 'x') + '. Determine each of the following, simplified.'; },
        shared: function (r) { return pickWhere(function () { return { c: r.int(3, 9), m: r.int(2, 4), p: r.int(2, 5), k: r.pick([2, 2, 3]) }; }, function (o) { return o.c > o.m; }); },
        parts: [
          { id: 'e14a', level: 'BEG', make: function (r, sh) {
            var c = sh.c, m = sh.m, a = -sh.p, ans = c - m * a;
            return numPart(t('g(' + a + ')'), ans, [[c + m * a, 'fn-neg-sub', t('-' + m + '(' + a + ')=+' + (-m * a)) + ': a negative times a negative is positive.'], [(c - m) * a, 'fn-order', 'Multiply before subtracting.']],
              t('g(' + a + ')=' + c + '-' + m + '(' + a + ')=' + c + '+' + (-m * a) + '=' + ans), HN, 'g(' + a + ')');
          } },
          { id: 'e14b', level: 'EMG', make: function (r, sh) {
            var c = sh.c, m = sh.m, k = sh.k, T = PL([[c], [-m * k, 'a']]);
            return polyPart(t('g(' + k + 'a)'), t('g(' + k + 'a)='), T, c + '-' + m * k + 'a', [
              { is: PL([[c * k], [-m * k, 'a']]), code: 'fn-scale-out', hint: 'Only the input is ' + t(k + 'a') + ': the ' + t(c) + ' is not multiplied by ' + t(k) + '.' },
              { is: PL([[c], [-(m + k), 'a']]), code: 'fn-add-coef', hint: t(m + '(' + k + 'a)=' + m * k + 'a') + ': multiply the numbers.' }],
              t('g(' + k + 'a)=' + c + '-' + m + '(' + k + 'a)=' + c + '-' + m * k + 'a'), HX, 'g(ka)');
          } },
          { id: 'e14c', level: 'PRG', make: function (r, sh) {
            var c = sh.c, m = sh.m, T = PL([[c - m], [-m, 'a']]);
            return polyPart(t('g(a+1)'), t('g(a+1)='), T, (c - m) + '-' + m + 'a', [
              { is: PL([[c + m], [-m, 'a']]), code: 'fn-dist-sign', hint: t('-' + m + '(a+1)=-' + m + 'a-' + m) + ': the ' + t('-' + m) + ' multiplies the ' + t('+1') + ' too.' },
              { is: PL([[c - 1], [-m, 'a']]), code: 'fn-dist', hint: 'Put the input in brackets: ' + t(c + '-' + m + '(a+1)') + '. The ' + t(m) + ' multiplies both terms.' },
              { is: PL([[c + 1], [-m, 'a']]), code: 'fn-plus-out', hint: 'That is ' + t('g(a)+1') + '. Replace ' + t('x') + ' with the whole input ' + t('(a+1)') + '.' }],
              t('g(a+1)=' + c + '-' + m + '(a+1)=' + c + '-' + m + 'a-' + m + '=' + (c - m) + '-' + m + 'a'), HX, 'g(a+1)');
          } },
          { id: 'e14d', level: 'ADV', make: function (r, sh) {
            var c = sh.c, m = sh.m, T = P.num(m);
            return polyPart(t('g(a)-g(a+1)'), t('g(a)-g(a+1)='), T, null, [
              { is: P.num(-m), code: 'fn-reverse', hint: 'Check the order: ' + t('(' + c + '-' + m + 'a)-(' + (c - m) + '-' + m + 'a)') + '.' },
              { is: PL([[-2 * m, 'a'], [-m]]), code: 'fn-dist-sign', hint: 'When you subtract the bracket ' + t('(' + (c - m) + '-' + m + 'a)') + ', change the sign of <b>every</b> term inside it.' },
              { is: PL([[-2 * m, 'a'], [2 * c - m]]), code: 'fn-add-fns', hint: 'The question asks for the <b>difference</b> ' + t('g(a)-g(a+1)') + '.' }],
              t('g(a)-g(a+1)=(' + c + '-' + m + 'a)-(' + (c - m) + '-' + m + 'a)') + '<br>' + t('=' + c + '-' + m + 'a-' + (c - m) + '+' + m + 'a=' + m), HX.concat(['Find ' + t('g(a)') + ' and ' + t('g(a+1)') + ' first, then subtract the whole second bracket.']), 'g(a)-g(a+1)', ['a']);
          } },
          { id: 'e14e', level: 'PRG', make: function (r, sh) {
            var m = sh.m;
            return mc(r, 'Your answer to ' + t('g(a)-g(a+1)') + ' contains no ' + t('a') + '. What does that tell you about the graph of ' + t('g') + '?', [
              { html: 'Wherever you start, one step right drops the output by exactly ' + t(m) + ': the graph is a straight line with slope ' + t('-' + m) + '.', right: true },
              { html: 'The graph is a horizontal line, because the answer has no ' + t('a') + '.', why: 'It is the <b>change</b> in the output that is always the same, not the output itself.' },
              { html: 'The graph passes through the origin.', why: t('g(0)=' + sh.c) + ', so it doesn’t. The answer is about how the output changes.' },
              { html: 'The graph is a curve that gets steeper.', why: 'A constant change for each step of ' + t('1') + ' means a constant rate of change — a straight line.' }],
              'Each step of ' + t('1') + ' to the right changes the output by the same amount (it drops by ' + t(m) + '), so the graph of ' + t('g') + ' is a <b>straight line</b> with slope ' + t('-' + m) + '.', ['What does ' + t('g(a)-g(a+1)') + ' measure as you move one unit right?'], 'constant difference means line');
          } },
          { id: 'e14f', level: 'PRG', make: function (r, sh) {
            var c = sh.c, m = sh.m;
            return mc(r, 'Compare ' + t('g(a)+g(1)') + ' with ' + t('g(a+1)') + '. Is there any value of ' + t('a') + ' for which ' + t('g(a+1)=g(a)+g(1)') + '?', [
              { html: 'No: ' + t('g(a)+g(1)=' + (2 * c - m) + '-' + m + 'a') + ' is always ' + t(c) + ' more than ' + t('g(a+1)=' + (c - m) + '-' + m + 'a') + '.', right: true },
              { html: 'Yes, for every ' + t('a') + ': that is the distributive property.', why: 'Function notation isn’t multiplication, so there is no distributive property. Work out both sides.' },
              { html: 'Yes, only when ' + t('a=0') + '.', why: 'Test ' + t('a=0') + ': ' + t('g(1)=' + (c - m)) + ' but ' + t('g(0)+g(1)=' + c + '+' + (c - m) + '=' + (2 * c - m)) + '.' },
              { html: 'Yes, only when ' + t('a=1') + '.', why: 'Test ' + t('a=1') + ': ' + t('g(2)=' + (c - 2 * m)) + ' but ' + t('g(1)+g(1)=' + 2 * (c - m)) + '.' }],
              t('g(1)=' + (c - m)) + ', so ' + t('g(a)+g(1)=' + c + '-' + m + 'a+' + (c - m) + '=' + (2 * c - m) + '-' + m + 'a') + '. Setting it equal to ' + t('g(a+1)=' + (c - m) + '-' + m + 'a') + ' gives ' + t((c - m) + '=' + (2 * c - m)) + ', which is false: <b>no value</b> works.', ['Write both expressions in terms of ' + t('a') + ', then set them equal.'], 'g(a+1) vs g(a)+g(1)');
          } }] },
      /* ---------- EP15: two functions ---------- */
      { num: '15', stem: function (sh) { return 'Two functions are defined by ' + t('f(x)=x^{2}+' + sh.p) + ' and ' + t('g(x)=' + lin([[sh.m, 'x'], [sh.q, '']])) + '.'; },
        shared: function (r) {
          return pickWhere(function () { var r1 = r.int(2, 5), r2 = -r.int(1, 3), p = r.int(1, 4); return { r1: r1, r2: r2, p: p, m: r1 + r2, q: p - r1 * r2, u: r.int(1, 3), w: r.int(1, 3), v: r.pick([1, 2]) }; },
            function (o) { return o.m >= 1 && o.q !== 0; });
        },
        parts: [
          { id: 'e15a', level: 'EMG', make: function (r, sh) {
            var u = sh.u, fu = u * u + sh.p, gu = sh.m * u + sh.q;
            return numPart(t('f(' + u + ')+g(' + u + ')'), fu + gu, [[fu * gu, 'fn-add-fns', 'The question says <b>add</b> the outputs.']],
              t('f(' + u + ')=' + u + '^{2}+' + sh.p + '=' + fu) + ', ' + t('g(' + u + ')=' + sh.m + '(' + u + ')' + sg(sh.q) + '=' + gu) + ', so ' + t(fu + '+' + sgp(gu) + '=' + (fu + gu)) + '.', ['Find ' + t('f(' + u + ')') + ' and ' + t('g(' + u + ')') + ' separately.'], 'f(u)+g(u)');
          } },
          { id: 'e15b', level: 'EMG', make: function (r, sh) {
            var v = sh.v, fv = v * v + sh.p, g0 = sh.q;
            return numPart(t('f(-' + v + ')\\cdot g(0)'), fv * g0, [[(-v * v + sh.p) * g0, 'fn-neg-square', t('(-' + v + ')^{2}=' + v * v) + ': the square is positive.'], [fv * (sh.m + sh.q), 'fn-zero-coef', t('g(0)=' + sh.m + '(0)' + sg(sh.q) + '=' + sh.q) + '.'], [fv + g0, 'fn-add-fns', 'The dot means <b>multiply</b> the two outputs.']],
              t('f(-' + v + ')=(-' + v + ')^{2}+' + sh.p + '=' + fv) + ', ' + t('g(0)=' + sh.q) + ', so ' + t(fv + '\\cdot ' + sgp(g0) + '=' + fv * g0) + '.', ['Evaluate each function first, then multiply.'], 'f(-v)g(0)');
          } },
          { id: 'e15c', level: 'PRG', make: function (r, sh) {
            var w = sh.w, gw = sh.m * w + sh.q, ans = gw * gw + sh.p, fw = w * w + sh.p;
            return numPart('Evaluate ' + t('g(' + w + ')') + ', then use that answer as the input to ' + t('f') + '. What is the result?', ans, [[sh.m * fw + sh.q, 'fn-comp-order', 'That puts ' + t('f(' + w + ')') + ' into ' + t('g') + '. Start with ' + t('g(' + w + ')') + ', then put its output into ' + t('f') + '.'], [gw, 'fn-drop', 'That is ' + t('g(' + w + ')') + ' — now use it as the input to ' + t('f') + '.'], [fw * gw, 'fn-times', 'Use ' + t('g(' + w + ')') + ' as the <b>input</b> of ' + t('f') + ' — don’t multiply.']],
              t('g(' + w + ')=' + sh.m + '(' + w + ')' + sg(sh.q) + '=' + gw) + '<br>' + t('f(' + gw + ')=' + sgp(gw) + '^{2}+' + sh.p + '=' + ans), ['Work from the inside out: first ' + t('g(' + w + ')') + ', then ' + t('f') + ' of that number.'], 'f(g(w))');
          } },
          { id: 'e15d', level: 'ADV', make: function (r, sh) {
            var r1 = sh.r1, r2 = sh.r2, m = sh.m, q = sh.q, p = sh.p, cc = p - q;
            return solPart('Solve ' + t('f(x)=g(x)') + '.', [r1, r2], 'x', [[[-r1, -r2], 'sol-sign', 'Check the signs: if ' + t('(x-' + r1 + ')=0') + ' then ' + t('x=' + r1) + '.']],
              t('x^{2}+' + p + '=' + lin([[m, 'x'], [q, '']])) + '<br>' + t(lin([[1, 'x^{2}'], [-m, 'x'], [cc, '']]) + '=0') + '<br>' + t('(x-' + r1 + ')(x+' + (-r2) + ')=0') + '<br>' + t('x=' + r1) + ' or ' + t('x=' + r2), ['Set the two formulas equal, move everything to one side, and factor.', 'Each factor gives one solution.'], 'f(x)=g(x)');
          } }] },
      /* ---------- EP16: f(a+1) - f(a) ---------- */
      { num: '16', stem: 'For a function ' + t('f') + ', the expression ' + t('f(a+1)-f(a)') + ' measures how much the output changes when the input goes up by ' + t('1') + '. Determine and simplify ' + t('f(a+1)-f(a)') + ' for each function.', parts: [
        { id: 'e16a', level: 'PRG', make: function (r) {
          var m = r.int(2, 6), b = -r.int(1, 7), ft = lin([[m, 'x'], [b, '']]);
          return polyPart(t('f(x)=' + ft), t('f(a+1)-f(a)='), P.num(m), null, [
            { is: P.num(-m), code: 'fn-reverse', hint: 'Check the order: ' + t('f(a+1)') + ' comes first.' },
            { is: P.num(m + 2 * b), code: 'fn-dist-sign', hint: 'When you subtract ' + t('(' + ft.replace(/x/g, 'a') + ')') + ', change the sign of <b>every</b> term, including the ' + t(sg(b)) + '.' },
            { is: PL([[2 * m, 'a'], [m + 2 * b]]), code: 'fn-add-fns', hint: 'The question asks for the <b>difference</b>.' }],
            t('[' + m + '(a+1)' + sg(b) + ']-[' + m + 'a' + sg(b) + ']=' + m + 'a' + sg(m + b) + '-' + m + 'a' + sg(-b) + '=' + m), HX, 'diff of linear', ['a']);
        } },
        { id: 'e16b', level: 'ADV', make: function (r) {
          var k = r.pick([1, 1, 2, 3]), ft = (k === 1 ? '' : k) + 'x^{2}', T = PL([[2 * k, 'a'], [k]]);
          return polyPart(t('f(x)=' + ft), t('f(a+1)-f(a)='), T, null, [
            { is: P.num(k), code: 'fn-binom-sq', hint: t('(a+1)^{2}=a^{2}+2a+1') + ', not ' + t('a^{2}+1') + '.' },
            { is: PL([[2 * k, 'a']]), code: 'fn-binom-sq', hint: t('(a+1)^{2}=a^{2}+2a+1') + ': don’t lose the ' + t('+1') + '.' }],
            t((k === 1 ? '' : k) + '(a+1)^{2}-' + (k === 1 ? '' : k) + 'a^{2}=' + (k === 1 ? '' : k + '(') + 'a^{2}+2a+1' + (k === 1 ? '' : ')') + '-' + (k === 1 ? '' : k) + 'a^{2}=' + P.tex(T)), HX, 'diff of kx^2');
        } },
        { id: 'e16c', level: 'ADV', make: function (r) {
          var b = -r.int(2, 6), c = r.pick([-3, -1, 1, 2, 4]), ft = lin([[1, 'x^{2}'], [b, 'x'], [c, '']]), T = PL([[2, 'a'], [1 + b]]);
          return polyPart(t('f(x)=' + ft), t('f(a+1)-f(a)='), T, null, [
            { is: P.num(1 + b), code: 'fn-binom-sq', hint: t('(a+1)^{2}=a^{2}+2a+1') + ': include the middle term ' + t('2a') + '.' },
            { is: PL([[2, 'a'], [1]]), code: 'fn-drop', hint: 'Don’t forget the change in the ' + t(term(b, 'x', true)) + ' term: ' + t(b + '(a+1)-(' + b + 'a)=' + b) + '.' },
            { is: PL([[2, 'a'], [1 + b + 2 * c]]), code: 'fn-dist-sign', hint: 'When you subtract ' + t('f(a)') + ', change the sign of every term, including the constant.' }],
            t('f(a+1)=(a+1)^{2}' + term(b, '(a+1)') + sg(c) + '=' + lin([[1, 'a^{2}'], [2 + b, 'a'], [1 + b + c, '']])) + '<br>' + t('f(a+1)-f(a)=(' + lin([[1, 'a^{2}'], [2 + b, 'a'], [1 + b + c, '']]) + ')-(' + lin([[1, 'a^{2}'], [b, 'a'], [c, '']]) + ')=' + P.tex(T)), HX, 'diff of quadratic');
        } },
        { id: 'e16d', level: 'PRG', make: function (r) {
          return mc(r, 'For ' + t('f(x)=3x-5') + ' the change ' + t('f(a+1)-f(a)') + ' is ' + t('3') + ', which does not depend on ' + t('a') + '. For ' + t('f(x)=x^{2}') + ' it is ' + t('2a+1') + ', which does. Why?', [
            { html: t('3x-5') + ' is <b>linear</b>: a line rises by the same amount (its slope, ' + t('3') + ') for every step of ' + t('1') + ', wherever the step starts.', right: true },
            { html: 'Because ' + t('3x-5') + ' has a negative constant.', why: 'The constant cancels when you subtract. It is the type of function that matters.' },
            { html: 'Because ' + t('x^{2}') + ' is not a function.', why: t('y=x^{2}') + ' passes the vertical line test: it is a function. Its steepness changes from place to place.' },
            { html: 'Because ' + t('a') + ' was chosen differently for each function.', why: 'The same expression ' + t('f(a+1)-f(a)') + ' was used for both. Think about the shape of each graph.' }],
            'A <b>linear</b> function has a constant rate of change: every step of ' + t('1') + ' to the right changes the output by the slope. A quadratic gets steeper, so its change depends on where you start.', ['Picture the two graphs: which one is a straight line?'], 'constant change for linear');
        } }] },
      /* ---------- EP17: given the output, find the input ---------- */
      { num: '17', section: 'Extra practice E — Working backwards: given the output, find the input', stem: 'Solve for the input in each case.', parts: [
        { id: 'e17a', level: 'PRG', make: function (r) {
          var c = r.int(3, 15), m = r.int(2, 6), x = r.int(2, 8), V = c - m * x, ft = c + '-' + m + 'x';
          return numPart(t('f(x)=' + ft) + '; solve ' + t('f(x)=' + V) + '.', x, [[-x, 'fn-solve-sign', t('-' + m + 'x=' + (V - c)) + ': divide by ' + t('-' + m) + '.'], [c - m * V, 'fn-evaluated', 'That is ' + t('f(' + V + ')') + '. Solve ' + t(ft + '=' + V) + '.'], [(V + c) / -m, 'fn-solve-inverse', 'Subtract ' + t(c) + ' from both sides.']],
            t(ft + '=' + V) + '<br>' + t('-' + m + 'x=' + (V - c)) + '<br>' + t('x=' + x), HS, 'solve ' + ft + '=' + V, { before: t('x=') });
        } },
        { id: 'e17b', level: 'PRG', make: function (r) {
          var k = r.pick([2, 3, 3, 4, 5]), b = r.int(4, 12), x = -k * r.int(1, 6), V = x / k + b, ft = '\\dfrac{x}{' + k + '}+' + b;
          return numPart(t('g(x)=' + ft) + '; solve ' + t('g(x)=' + V) + '.', x, [[(V - b) / k, 'fn-solve-divide', 'To undo dividing by ' + t(k) + ', <b>multiply</b> both sides by ' + t(k) + '.'], [k * (V + b), 'fn-solve-inverse', 'Subtract ' + t(b) + ' from both sides first: ' + t('\\tfrac{x}{' + k + '}=' + (V - b)) + '.'], [-x, 'fn-solve-sign', 'Check the sign.'], [V / k + b, 'fn-evaluated', 'That is ' + t('g(' + V + ')') + '. Solve ' + t(ft + '=' + V) + '.']],
            t(ft + '=' + V) + '<br>' + t('\\tfrac{x}{' + k + '}=' + (V - b)) + '<br>' + t('x=' + k + '(' + (V - b) + ')=' + x), HS, 'solve x/k+b', { before: t('x=') });
        } },
        { id: 'e17c', level: 'PRG', make: function (r) {
          var c = r.int(2, 9), s = r.int(3, 9), V = s * s - c, ft = 'x^{2}-' + c;
          return solPart(t('h(x)=' + ft) + '; solve ' + t('h(x)=' + V) + '.', [s, -s], 'x', [[[V + c], 'fn-sqrt-not', t('x^{2}=' + (V + c)) + ' — now take the square root (two roots).'], [[V + c, -(V + c)], 'fn-sqrt-not', t('x^{2}=' + (V + c)) + ' — now take the square root.'], [[Math.sqrt(V - c), -Math.sqrt(V - c)], 'fn-solve-inverse', 'To undo ' + t('-' + c) + ', <b>add</b> ' + t(c) + ' to both sides.']],
            t(ft + '=' + V) + '<br>' + t('x^{2}=' + s * s) + '<br>' + t('x=' + s) + ' or ' + t('x=-' + s) + ' — two inputs give the output ' + t(V) + '.', HS.concat(['A positive number has two square roots.']), 'solve x^2-c', 'x=\\pm ' + s);
        } },
        { id: 'e17d', level: 'EMG', make: function (r) {
          var k = r.int(2, 5), c = r.int(2, 9), ft = k + 'x^{2}+' + c;
          return numPart(t('P(x)=' + ft) + '; solve ' + t('P(x)=' + c) + '.', 0, [[c / k, 'fn-solve-inverse', 'Subtract ' + t(c) + ' from both sides: ' + t(k + 'x^{2}=0') + '.'], [Math.sqrt(c / k), 'fn-solve-inverse', 'Subtract ' + t(c) + ' from both sides: ' + t(k + 'x^{2}=0') + '.']],
            t(ft + '=' + c) + '<br>' + t(k + 'x^{2}=0') + '<br>' + t('x^{2}=0') + ', so ' + t('x=0') + ' — just one solution (' + t('0') + ' and ' + t('-0') + ' are the same).', HS, 'solve kx^2+c=c', { before: t('x=') });
        } },
        { id: 'e17e', level: 'PRG', make: function (r) {
          var k = r.pick([2, 3]), s = r.int(2, 4), c = r.int(20, 60), V = c + k * s * s, ft = c + '-' + k + 'x^{2}';
          return mc(r, t('k(x)=' + ft) + '; solve ' + t('k(x)=' + V) + '.', [
            { html: 'No real solution', right: true },
            { html: t('x=\\pm' + s), why: 'Check it: ' + t('k(' + s + ')=' + c + '-' + k + '(' + s * s + ')=' + (c - k * s * s)) + ', not ' + t(V) + '. Watch the sign when you divide by ' + t('-' + k) + '.' },
            { html: t('x=-' + s), why: 'Follow the steps: ' + t('-' + k + 'x^{2}=' + (V - c)) + ', so ' + t('x^{2}=-' + s * s) + '. Can a square be negative?' },
            { html: t('x=\\pm' + s * s), why: 'Follow the steps: you get ' + t('x^{2}=-' + s * s) + '. No real number squared is negative.' }],
            t(ft + '=' + V) + '<br>' + t('-' + k + 'x^{2}=' + (V - c)) + '<br>' + t('x^{2}=-' + s * s) + '<br>No real number squares to a negative, so there is <b>no real solution</b>: ' + t(V) + ' is not in the range of ' + t('k') + '.', HS, 'solve with x^2 negative');
        } },
        { id: 'e17f', level: 'EMG', make: function (r) {
          var b = r.int(1, 9), s = r.int(3, 12), V = s + b, ft = '\\sqrt{x}+' + b;
          return numPart(t('m(x)=' + ft) + '; solve ' + t('m(x)=' + V) + '.', s * s, [[s, 'fn-root-solve', t('\\sqrt{x}=' + s) + ' — to undo the square root, <b>square</b> both sides.'], [Math.sqrt(s), 'fn-root-solve', t('\\sqrt{x}=' + s) + ' — square both sides, don’t take another root.'], [(V + b) * (V + b), 'fn-solve-inverse', 'Subtract ' + t(b) + ' first: ' + t('\\sqrt{x}=' + s) + '.'], [V * V - b, 'fn-order', 'Subtract ' + t(b) + ' before you square.']],
            t(ft + '=' + V) + '<br>' + t('\\sqrt{x}=' + s) + '<br>' + t('x=' + s + '^{2}=' + s * s), HS, 'solve sqrt x + b', { before: t('x=') });
        } }] },
      /* ---------- EP18: f(x) = mx - b ---------- */
      { num: '18', stem: function (sh) { return 'A function is defined by ' + t('f(x)=' + sh.m + 'x-' + sh.b) + '. Solve each equation for ' + t('x') + '.'; },
        shared: function (r) { return pickWhere(function () { var m = r.int(3, 5); return { m: m, b: (m - 1) * r.int(2, 5), k: r.pick([2, 3]), xc: r.int(1, 4), xd: r.int(-2, 3), h: r.int(1, 4) }; }, function (o) { return o.b % o.m !== 0; }); },
        parts: [
          { id: 'e18a', level: 'PRG', make: function (r, sh) {
            var m = sh.m, b = sh.b, x = b / (m - 1);
            return numPart(t('f(x)=x'), x, [[b / m, 'fn-drop', 'There is an ' + t('x') + ' on both sides: ' + t(m + 'x-' + b + '=x') + '. Subtract ' + t('x') + ' from both sides first.'], [b / (m + 1), 'fn-solve-inverse', 'Subtract ' + t('x') + ' from both sides: ' + t((m - 1) + 'x=' + b) + '.'], [-x, 'fn-solve-sign', 'Check the sign.']],
              t(m + 'x-' + b + '=x') + '<br>' + t((m - 1) + 'x=' + b) + '<br>' + t('x=' + x), ['Replace ' + t('f(x)') + ' with its formula: ' + t(m + 'x-' + b + '=x') + '.', 'Collect the ' + t('x') + '-terms on one side.'], 'f(x)=x', { before: t('x=') });
          } },
          { id: 'e18b', level: 'PRG', make: function (r, sh) {
            var m = sh.m, b = sh.b;
            return B.fraction(t('f(x)=0') + ' (give ' + t('x') + ' as a fraction)', [b, m], { before: t('x='), diag: function (v) { if (same(v, b)) return { code: 'fn-solve-divide', hint: t(m + 'x=' + b) + ' — now divide by ' + t(m) + '.' }; if (same(v, -b)) return { code: 'fn-solve-inverse', hint: 'Add ' + t(b) + ' to both sides: ' + t(m + 'x=' + b) + '.' }; return null; } },
              t(m + 'x-' + b + '=0') + '<br>' + t(m + 'x=' + b) + '<br>' + t('x=\\tfrac{' + b + '}{' + m + '}') + ' (the ' + t('x') + '-intercept of the graph).', ['Set the formula equal to ' + t('0') + ' and solve.', 'Leave the answer as a fraction.'], 'f(x)=0');
          } },
          { id: 'e18c', level: 'ADV', make: function (r, sh) {
            var m = sh.m, b = sh.b, k = sh.k, x = sh.xc, V = m * k * x - b;
            return numPart(t('f(' + k + 'x)=' + V), x, [[(V + b) / m, 'fn-inner', 'That solves ' + t('f(x)=' + V) + '. First write ' + t('f(' + k + 'x)=' + m + '(' + k + 'x)-' + b + '=' + m * k + 'x-' + b) + '.'], [k * (V + b) / m, 'fn-inner', t('f(' + k + 'x)=' + m * k + 'x-' + b) + ': divide by ' + t(m * k) + '.'], [m * k * V - b, 'fn-evaluated', t(V) + ' is the output. Set ' + t(m * k + 'x-' + b + '=' + V) + '.']],
              t('f(' + k + 'x)=' + m + '(' + k + 'x)-' + b + '=' + m * k + 'x-' + b) + '<br>' + t(m * k + 'x-' + b + '=' + V) + '<br>' + t(m * k + 'x=' + (V + b)) + '<br>' + t('x=' + x), ['First find an expression for ' + t('f(' + k + 'x)') + ', then set it equal to ' + t(V) + '.'], 'f(kx)=V', { before: t('x=') });
          } },
          { id: 'e18d', level: 'ADV', make: function (r, sh) {
            var m = sh.m, b = sh.b, h = sh.h, x = sh.xd, V = m * (x + h) - b, cst = m * h - b;
            return numPart(t('f(x+' + h + ')=' + V), x, [[(V + b) / m, 'fn-inner', 'That solves ' + t('f(x)=' + V) + '. First write ' + t('f(x+' + h + ')=' + m + '(x+' + h + ')-' + b) + '.'], [(V + b) / m + h, 'fn-solve-sign', 'Check the sign: substitute your answer into ' + t(m + '(x+' + h + ')-' + b) + '.'], [(V + b - h) / m, 'fn-dist', 'The ' + t(m) + ' multiplies both terms: ' + t(m + '(x+' + h + ')=' + m + 'x+' + m * h) + '.']],
              t('f(x+' + h + ')=' + m + '(x+' + h + ')-' + b + '=' + lin([[m, 'x'], [cst, '']])) + '<br>' + t(lin([[m, 'x'], [cst, '']]) + '=' + V) + '<br>' + t(m + 'x=' + (V - cst)) + '<br>' + t('x=' + x), ['First find an expression for ' + t('f(x+' + h + ')') + ', then set it equal to ' + t(V) + '.'], 'f(x+h)=V', { before: t('x=') });
          } }] },
      /* ---------- EP19: find the mistake ---------- */
      { num: '19', section: 'Extra practice F — Find the mistake', stem: function (sh) { return '<i>(Error analysis)</i> A function is defined by ' + t('f(x)=' + sh.m + 'x+' + sh.b) + '. A student computes ' + t('f(1)=' + (sh.m + sh.b)) + ', then writes: “' + t('f(' + sh.p + ')') + ' means ' + t('f') + ' times ' + t(sh.p) + ', and ' + t('f') + ' is ' + t(sh.m + sh.b) + ', so ' + t('f(' + sh.p + ')=' + sh.p * (sh.m + sh.b)) + '.”'; },
        shared: function (r) { return { m: r.int(2, 6), b: r.int(2, 9), p: r.int(2, 5), h: r.pick([2, 2, 3]) }; },
        parts: [
          { id: 'e19a', level: 'BEG', make: function (r, sh) {
            var m = sh.m, b = sh.b, p = sh.p, ans = m * p + b;
            return numPart('Calculate ' + t('f(' + p + ')') + ' correctly.', ans, [[p * (m + b), 'fn-times', 'That is the student’s answer. The brackets mark the input: replace ' + t('x') + ' with ' + t(p) + '.'], [m * p, 'fn-const', 'Don’t forget the ' + t('+' + b) + '.']],
              t('f(' + p + ')=' + m + '(' + p + ')+' + b + '=' + m * p + '+' + b + '=' + ans), HE, 'f(p) correctly');
          } },
          { id: 'e19b', level: 'EMG', make: function (r, sh) {
            return mc(r, 'The student made two separate mistakes. Which choice names both?', [
              { html: 'The brackets in ' + t('f(' + sh.p + ')') + ' mark the input ' + t(sh.p) + ', not multiplication; and ' + t('f') + ' is the name of the function, not the number ' + t('f(1)') + '.', right: true },
              { html: 'The student should have started from ' + t('f(0)') + ' instead of ' + t('f(1)') + '.', why: 'Starting from any value and multiplying is still the wrong method. What do the brackets mean?' },
              { html: 'The only mistake is the arithmetic in ' + t(sh.p + '\\times ' + (sh.m + sh.b)) + '.', why: 'The arithmetic is right. The mistakes are about what the notation means.' },
              { html: t('f(' + sh.p + ')') + ' means ' + t('f+' + sh.p) + ', not ' + t('f\\times ' + sh.p) + '.', why: 'Neither: the brackets mark an <b>input</b>. ' + t('f(' + sh.p + ')') + ' is the output when ' + t('x=' + sh.p) + '.' }],
              '<b>Brackets:</b> in ' + t('f(' + sh.p + ')') + ' they mark the input, not multiplication. <b>The letter:</b> ' + t('f') + ' names the function; ' + t(sh.m + sh.b) + ' is the value ' + t('f(1)') + ', so “' + t('f') + ' is ' + t(sh.m + sh.b) + '” is meaningless.', ['One mistake is about the brackets, one about the letter ' + t('f') + '.'], 'two notation mistakes');
          } },
          { id: 'e19c', level: 'PRG', make: function (r, sh) {
            var h = sh.h, T = PL([[1, 'x', 2], [2 * h, 'x'], [h * h]]);
            return polyPart('The same student writes ' + t('f(x+' + h + ')=f(x)+' + h) + '. For ' + t('f(x)=x^{2}') + ' that is false (test ' + t('x=1') + ': ' + t('f(' + (1 + h) + ')=' + (1 + h) * (1 + h)) + ' but ' + t('f(1)+' + h + '=' + (1 + h)) + '). State a correct simplified expression for ' + t('f(x+' + h + ')') + '.', t('f(x+' + h + ')='), T, null, [
              { is: PL([[1, 'x', 2], [h]]), code: 'fn-plus-out', hint: 'That is the student’s claim, ' + t('f(x)+' + h) + '. Replace ' + t('x') + ' with ' + t('(x+' + h + ')') + ' and square it.' },
              { is: PL([[1, 'x', 2], [h * h]]), code: 'fn-binom-sq', hint: t('(x+' + h + ')^{2}=(x+' + h + ')(x+' + h + ')') + ' has a middle term.' }],
              t('f(x+' + h + ')=(x+' + h + ')^{2}=(x+' + h + ')(x+' + h + ')=x^{2}+' + 2 * h + 'x+' + h * h), HX, 'f(x+h) for x^2');
          } },
          { id: 'e19d', level: 'PRG', make: function (r, sh) {
            var m = sh.m, p = sh.p, b = sh.b;
            return mc(r, 'For ' + t('f(x)=' + m + 'x') + ' the student’s method happens to work: ' + t('f(' + p + ')=' + m * p) + ' and ' + t(p + 'f(1)=' + p + '(' + m + ')=' + m * p) + '. Why is it still a wrong method?', [
              { html: 'It only works because ' + t(m + 'x') + ' has no constant term (its graph passes through the origin). For ' + t('f(x)=' + m + 'x+' + b) + ' it gives ' + t(p * (m + b)) + ' instead of ' + t(m * p + b) + '.', right: true },
              { html: 'It isn’t wrong: a method that gives the right answer is a correct method.', why: 'Try the same method on ' + t('f(x)=' + m + 'x+' + b) + ': it gives ' + t(p * (m + b)) + ', but ' + t('f(' + p + ')=' + (m * p + b)) + '.' },
              { html: 'It works for every linear function, so it is only wrong for curves.', why: t('f(x)=' + m + 'x+' + b) + ' is linear, and the method fails for it.' },
              { html: 'Brackets really do mean multiplication, so the method is fine for all functions.', why: 'In function notation the brackets mark the input. The method fails as soon as there is a constant term.' }],
              t(p + 'f(1)=f(' + p + ')') + ' only when the function has no constant term. For ' + t(m + 'x+' + b) + ': ' + t(p + 'f(1)=' + p * (m + b)) + ' but ' + t('f(' + p + ')=' + (m * p + b)) + '. A method that only works by luck is still wrong.', ['Test the method on the original function ' + t('f(x)=' + m + 'x+' + b) + '.'], 'right answer wrong method');
          } },
          { id: 'e19e', level: 'BEG', make: function (r, sh) {
            var p = sh.p;
            return mc(r, 'Which sentence gives the meaning of ' + t('f(' + p + ')') + ' and can’t be misread as multiplication?', [
              { html: t('f(' + p + ')') + ' is the output of the function ' + t('f') + ' when the input is ' + t(p) + '.', right: true },
              { html: t('f(' + p + ')') + ' is ' + t('f') + ' multiplied by ' + t(p) + '.', why: 'That is exactly the misreading. The brackets mark an input.' },
              { html: t('f(' + p + ')') + ' is the input that gives an output of ' + t(p) + '.', why: 'Backwards: ' + t(p) + ' is the input; ' + t('f(' + p + ')') + ' is the output.' },
              { html: t('f(' + p + ')') + ' is the value of ' + t('x') + ' when ' + t('f=' + p) + '.', why: t('f') + ' is a name, not a number, so “' + t('f=' + p) + '” has no meaning.' }],
              t('f(' + p + ')') + ' is the <b>output</b> of the function ' + t('f') + ' when the <b>input</b> is ' + t(p) + '.', ['Use the words input and output.'], 'meaning of f(p)');
          } }] },
      /* ---------- EP22 a, b, e, f: true or false ---------- */
      { num: '22', section: 'Extra practice G — True or false', stem: 'State whether each statement is true or false.', parts: [
        { id: 'e22a', sub: 'a', level: 'LIM', make: function (r) {
          if (r.chance(0.5)) return B.tf(r, t('f(x)') + ' means the output of ' + t('f') + ' when the input is ' + t('x') + '.', true, 'The brackets mark the input: ' + t('f(x)') + ' is the output of ' + t('f') + ' at the input ' + t('x') + ' — not ' + t('f') + ' multiplied by ' + t('x') + '.', '<b>True.</b> ' + t('f(x)') + ' is the output of ' + t('f') + ' at the input ' + t('x') + '; the brackets mark an input, not multiplication.', [], 'f(x) is an output');
          return B.tf(r, t('f(x)') + ' means ' + t('f') + ' multiplied by ' + t('x') + '.', false, 'The brackets mark the input: ' + t('f(x)') + ' is the output of ' + t('f') + ' at the input ' + t('x') + '.', '<b>False.</b> ' + t('f(x)') + ' is the output of ' + t('f') + ' at the input ' + t('x') + '; the brackets mark an input.', [], 'f(x) not multiplication');
        } },
        { id: 'e22b', sub: 'b', level: 'LIM', make: function (r) {
          var p = r.pick(nz(-5, 6)), q = pickWhere(function () { return r.pick(nz(-9, 9)); }, function (q) { return q !== p && q !== -p; }), truth = r.chance(0.5), pt = truth ? '(' + p + ',\\ ' + q + ')' : '(' + q + ',\\ ' + p + ')';
          return B.tf(r, 'If ' + t('f(' + p + ')=' + q) + ', the point ' + t(pt) + ' lies on the graph of ' + t('y=f(x)') + '.', truth, truth ? 'Input ' + t(p) + ', output ' + t(q) + ': the point is ' + t('(' + p + ',\\ ' + q + ')') + '.' : 'The input comes first in an ordered pair: ' + t('f(' + p + ')=' + q) + ' gives ' + t('(' + p + ',\\ ' + q + ')') + '.',
            '<b>' + (truth ? 'True' : 'False') + '.</b> Input ' + t(p) + ', output ' + t(q) + ': the point ' + t('(' + p + ',\\ ' + q + ')') + ' is on the graph' + (truth ? '' : ', not ' + t(pt)) + '.', [], 'f(p)=q point');
        } },
        { id: 'e22c', sub: 'c', level: 'EMG', outcome: 'RF2', make: function (r) {
          var p = r.int(1, 5), s = p + r.int(2, 6), q = r.pick(nz(-9, 12));
          if (r.chance(0.5)) return B.tf(r, 'If ' + t('f(' + p + ')=' + q) + ' and ' + t('f(' + s + ')=' + q) + ', then ' + t('f') + ' can still be a function.', true, 'Two different inputs may share an output (many-to-one). A function only forbids one input having two outputs.',
            '<b>True.</b> The inputs ' + t(p) + ' and ' + t(s) + ' share the output ' + t(q) + ' (many-to-one), which is allowed; ' + t('f') + ' can still be a function.', [], 'shared output still a function (true)');
          return B.tf(r, 'If ' + t('f(' + p + ')=' + q) + ' and ' + t('f(' + s + ')=' + q) + ', then ' + t('f') + ' is not a function.', false, 'Two different inputs may share an output (many-to-one). A function only forbids one input having two outputs.',
            '<b>False.</b> The inputs ' + t(p) + ' and ' + t(s) + ' share the output ' + t(q) + ' (many-to-one), which is allowed; ' + t('f') + ' can still be a function.', [], 'shared output still a function');
        } },
        { id: 'e22d', sub: 'd', level: 'BEG', outcome: 'RF2', make: function (r) {
          var p = r.int(1, 6), q = r.pick(nz(-9, 12)), s = pickWhere(function () { return r.pick(nz(-9, 12)); }, function (v) { return v !== q; });
          if (r.chance(0.5)) return B.tf(r, 'If ' + t('f(' + p + ')=' + q) + ' and ' + t('f(' + p + ')=' + s) + ', then ' + t('f') + ' can still be a function.', false, 'The single input ' + t(p) + ' would have two different outputs, ' + t(q) + ' and ' + t(s) + ' — exactly what a function forbids.',
            '<b>False.</b> The input ' + t(p) + ' would have two outputs, ' + t(q) + ' and ' + t(s) + ', so ' + t('f') + ' cannot be a function.', [], 'one input two outputs (false)');
          return B.tf(r, 'If ' + t('f(' + p + ')=' + q) + ' and ' + t('f(' + p + ')=' + s) + ', then ' + t('f') + ' is not a function.', true, 'The single input ' + t(p) + ' would have two different outputs, ' + t(q) + ' and ' + t(s) + ' — exactly what a function forbids.',
            '<b>True.</b> The input ' + t(p) + ' would have two outputs, ' + t(q) + ' and ' + t(s) + ', so ' + t('f') + ' is not a function.', [], 'one input two outputs');
        } },
        { id: 'e22e', sub: 'e', level: 'BEG', make: function (r) {
          if (r.chance(0.5)) return B.tf(r, t('f') + ' and ' + t('f(x)') + ' mean different things.', true, t('f') + ' names the function; ' + t('f(x)') + ' is its output value at the input ' + t('x') + '.', '<b>True.</b> ' + t('f') + ' names the function; ' + t('f(x)') + ' is its output value at the input ' + t('x') + '.', [], 'f vs f(x) (true)');
          return B.tf(r, t('f') + ' and ' + t('f(x)') + ' mean the same thing.', false, t('f') + ' names the function; ' + t('f(x)') + ' is its output value at the input ' + t('x') + '.', '<b>False.</b> ' + t('f') + ' names the function; ' + t('f(x)') + ' is its output value at the input ' + t('x') + '.', [], 'f vs f(x)');
        } },
        { id: 'e22f', sub: 'f', level: 'PRG', make: function (r) {
          if (r.chance(0.5)) return B.tf(r, 'Some functions ' + t('f') + ' do <b>not</b> satisfy ' + t('f(a+b)=f(a)+f(b)') + '.', true, 'Try ' + t('f(x)=x^{2}') + ' with ' + t('a=b=1') + ': ' + t('f(2)=4') + ' but ' + t('f(1)+f(1)=2') + '.', '<b>True.</b> For ' + t('f(x)=x^{2}') + ' and ' + t('a=b=1') + ': ' + t('f(2)=4') + ' but ' + t('f(1)+f(1)=2') + '. (It holds only for some functions, such as ' + t('f(x)=mx') + '.)', [], 'f(a+b) claim (true)');
          return B.tf(r, t('f(a+b)=f(a)+f(b)') + ' for every function ' + t('f') + '.', false, 'Try a counterexample: ' + t('f(x)=x^{2}') + ' with ' + t('a=b=1') + ' gives ' + t('f(2)=4') + ' but ' + t('f(1)+f(1)=2') + '.', '<b>False.</b> For ' + t('f(x)=x^{2}') + ' and ' + t('a=b=1') + ': ' + t('f(2)=4') + ' but ' + t('f(1)+f(1)=2') + '. (It holds only for some functions, such as ' + t('f(x)=mx') + '.)', [], 'f(a+b) claim');
        } }] },
      /* ---------- EP23: zigzag graph ---------- */
      { num: '23', section: 'Extra practice H — A stretch, and two for the test', stem: function (sh) {
          return '<i>(Stretch)</i> The graph of a function ' + t('f') + ' is made of three straight pieces joined end to end, through the points ' + t(ptsTex(sh.P)) + '.' + HW.graph({ x: sh.wx, y: sh.wy, labels: 2, max: 320, segs: [{ pts: sh.P, start: 'closed', end: 'closed' }], points: dots(sh.P), aria: 'zigzag graph of f' });
        },
        shared: function (r) {
          return pickWhere(function () {
            var ds = r.pick([[3, 2], [3, 2], [2, 2], [2, 3]]), d = ds[0], s = ds[1], x0 = r.int(-6, 6 - 3 * d), L = r.int(-5, 5 - s * d), H = L + s * d;
            var P0 = [[x0, L], [x0 + d, H], [x0 + 2 * d, L], [x0 + 3 * d, H]];
            var f = function (x) { for (var i = 0; i < 3; i++) { var a = P0[i], b = P0[i + 1]; if (x >= a[0] - 1e-9 && x <= b[0] + 1e-9) return a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]); } return NaN; };
            var j = r.int(1, d - 1), q3 = x0 + 2 * d + j;
            return { d: d, s: s, x0: x0, L: L, H: H, P: P0, f: f, j: j, q3: q3, wx: [Math.min(x0, -1) - 1, Math.max(x0 + 3 * d, 1) + 1], wy: [Math.min(L, -1) - 1, Math.max(H, 1) + 1] };
          }, function (o) { return o.x0 < 0 && o.x0 + 3 * o.d > 0 && o.q3 !== 0 && o.L < 0 && o.H > 0 && o.x0 + o.d !== 0; });
        },
        parts: [
          { id: 'e23a', level: 'PRG', make: function (r, sh) {
            var qs = [sh.x0 + sh.d, 0, sh.q3], vs = qs.map(sh.f);
            return B.fields('State ' + t('f(' + qs[0] + ')') + ', ' + t('f(0)') + ' and ' + t('f(' + qs[2] + ')') + '.', qs.map(function (q) { return { name: t('f(' + q + ')'), before: t('f(' + q + ')=') }; }), qs.map(function (q, i) { return K.number(vs[i]); }), vs.map(String), qs.map(function (q, i) { return t('f(' + q + ')=' + vs[i]); }).join(', '),
              'Each piece changes height by ' + t(sh.s) + ' for every ' + t('1') + ' across. ' + t('f(' + qs[0] + ')=' + vs[0]) + ' (a corner). For ' + t('f(0)') + ' and ' + t('f(' + qs[2] + ')') + ', count steps of ' + t(sh.s) + ' from the nearest corner: ' + t('f(0)=' + vs[1]) + ', ' + t('f(' + qs[2] + ')=' + vs[2]) + '.', ['Find the slope of each piece (rise over run between the corners).', 'For an input between corners, start at a corner and move ' + t(sh.s) + ' up or down for each step of ' + t('1') + '.'], 'read zigzag values');
          } },
          { id: 'e23b', level: 'EMG', make: function (r, sh) {
            var H = sh.H, xs = [sh.x0 + sh.d, sh.x0 + 3 * sh.d];
            return solPart('Solve ' + t('f(x)=' + H) + '.', xs, 'x', [[[H], 'fn-eq-flip', 'You want the inputs where the height is ' + t(H) + ': read the ' + t('x') + '-coordinates.']], 'The line ' + t('y=' + H) + ' meets the graph at ' + t('(' + xs[0] + ',\\ ' + H + ')') + ' and ' + t('(' + xs[1] + ',\\ ' + H + ')') + ': ' + t('x=' + xs[0]) + ' or ' + t('x=' + xs[1]) + '.', ['Draw the horizontal line ' + t('y=' + H) + '. Where does it meet the graph?'], 'zigzag f(x)=H');
          } },
          { id: 'e23c', level: 'EMG', make: function (r, sh) {
            var L = sh.L, xs = [sh.x0, sh.x0 + 2 * sh.d];
            return solPart('Solve ' + t('f(x)=' + L) + '.', xs, 'x', [[[L], 'fn-eq-flip', 'You want the inputs where the height is ' + t(L) + ': read the ' + t('x') + '-coordinates.']], 'The line ' + t('y=' + L) + ' meets the graph at ' + t('(' + xs[0] + ',\\ ' + L + ')') + ' and ' + t('(' + xs[1] + ',\\ ' + L + ')') + ': ' + t('x=' + xs[0]) + ' or ' + t('x=' + xs[1]) + '.', ['Draw the horizontal line ' + t('y=' + L) + '. Where does it meet the graph?'], 'zigzag f(x)=L');
          } },
          { id: 'e23d', level: 'ADV', make: function (r, sh) {
            var q = sh.q3, v = sh.f(q), a1 = sh.x0 + sh.j, a2 = sh.x0 + 2 * sh.d - sh.j;
            return solPart('Find every value of ' + t('a') + ', with ' + t('a\\ne ' + q) + ', for which ' + t('f(a)=f(' + q + ')') + '.', [a1, a2], 'a', [[[a1, a2, q], 'sol-extra', 'The question excludes ' + t('a=' + q) + ' itself.'], [[v], 'fn-eq-flip', t('f(' + q + ')=' + v) + ' is a height. You want the other <b>inputs</b> with that height.']],
              t('f(' + q + ')=' + v) + '. The line ' + t('y=' + v) + ' meets the other two pieces at ' + t('x=' + a1) + ' and ' + t('x=' + a2) + ' (count steps of ' + t(sh.s) + ' from the corners). So ' + t('a=' + a1) + ' or ' + t('a=' + a2) + '.', ['Find ' + t('f(' + q + ')') + ' first, then draw that horizontal line.', 'It meets each of the three pieces once.'], 'f(a)=f(q)');
          } },
          { id: 'e23e', level: 'PRG', outcome: 'RF2', make: function (r, sh) {
            var v = sh.f(sh.q3);
            return mc(r, 'The equation ' + t('f(x)=' + v) + ' has three solutions. Why is this graph still a function?', [
              { html: 'Three solutions means the horizontal line ' + t('y=' + v) + ' meets the graph three times: three inputs share one output, which is allowed. Every vertical line meets the graph only once.', right: true },
              { html: 'It isn’t a function: an equation with three solutions fails the test.', why: 'The test is about vertical lines (one output per input). Several inputs may share an output.' },
              { html: 'Because the graph is made of straight pieces.', why: 'Straight pieces can still fail the test (a vertical segment does). Use the vertical line test.' },
              { html: 'Because ' + t(v) + ' is between the lowest and highest points.', why: 'That explains why there are three solutions, not why ' + t('f') + ' is a function.' }],
              'The three solutions are inputs that share the output ' + t(v) + ' (many-to-one) — allowed. Every <b>vertical</b> line meets the graph exactly once, so ' + t('f') + ' is a function.', ['Which kind of line decides whether a graph is a function?'], 'many-to-one still a function');
          } },
          { id: 'e23f', level: 'ADV', make: function (r, sh) {
            var L = sh.L, H = sh.H;
            return B.set('For which values of ' + t('k') + ' does ' + t('f(x)=k') + ' have exactly <b>three</b> solutions? Give your answer as an inequality.', '\\{k\\mid ' + L + '<k<' + H + ',\\ k\\in\\mathbb{R}\\}', { v: 'k', wrong: [
              { is: '\\{k\\mid ' + L + '\\le k\\le ' + H + ',\\ k\\in\\mathbb{R}\\}', code: 'set-endpoint', hint: 'Check ' + t('k=' + H) + ': the line ' + t('y=' + H) + ' meets the graph only at the two upper corners. The same happens at ' + t('k=' + L) + '.' },
              { is: '\\{k\\mid ' + (sh.x0) + '<k<' + (sh.x0 + 3 * sh.d) + ',\\ k\\in\\mathbb{R}\\}', code: 'set-swap', hint: t('k') + ' is a <b>height</b> (an output), so read it on the vertical axis.' }] },
              'Each piece covers every height from ' + t(L) + ' to ' + t(H) + ' once. For ' + t(L + '<k<' + H) + ' the line ' + t('y=k') + ' meets each piece once: three solutions. At ' + t('k=' + H) + ' or ' + t('k=' + L) + ' it passes through corners only (two solutions), and beyond that there are none.',
              ['Slide a horizontal line up and down the graph. When does it cross three times?', 'Check what happens exactly at the heights of the corners.'], 'k for three solutions');
          } }] },
      { num: '24', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: 'e24', level: 'BEG', make: function (r) {
          var p = r.pick(nz(-5, 5)), q = pickWhere(function () { return r.pick(nz(-9, 9)); }, function (q) { return q !== p; });
          return mc(r, 'A function ' + t('f') + ' satisfies ' + t('f(' + p + ')=' + q) + '. Which statement must be true?', [
            { html: 'The point ' + t('(' + q + ',\\ ' + p + ')') + ' lies on the graph of ' + t('y=f(x)') + '.', why: 'That reverses the coordinates. The input comes first: ' + t('(' + p + ',\\ ' + q + ')') + '.' },
            { html: 'The point ' + t('(' + p + ',\\ ' + q + ')') + ' lies on the graph of ' + t('y=f(x)') + '.', right: true },
            { html: t('f') + ' multiplied by ' + t(p) + ' equals ' + t(q) + '.', why: 'The brackets mark the input; they don’t mean multiplication.' },
            { html: t('f(' + q + ')=' + p), why: 'That swaps input and output. Nothing tells you the output for the input ' + t(q) + '.' }],
            t('f(' + p + ')=' + q) + ': input ' + t(p) + ', output ' + t(q) + ', so ' + t('(' + p + ',\\ ' + q + ')') + ' is on the graph (input first).', ['In an ordered pair, which comes first — input or output?'], 'f(p)=q statement');
        } }] },
      { num: '25', stem: '<i>(Numerical Response)</i>', parts: [
        { id: 'e25', level: 'ADV', make: function (r) {
          var p = r.int(3, 10), b = r.int(2, 7), V = p * (p + b), q = -(p + b), ans = p - q;
          return B.nr('A function is defined by ' + t('f(x)=x^{2}+' + b + 'x') + '. The equation ' + t('f(x)=' + V) + ' has two solutions, ' + t('p') + ' and ' + t('q') + ', with ' + t('p>q') + '. The value of ' + t('p-q') + ' is ________.', ans, function (v) {
            if (v === p + q || v === -(p + q)) return { code: 'fn-add-fns', hint: 'The question asks for the <b>difference</b> ' + t('p-q') + '. With a negative ' + t('q') + ', subtracting it adds.' };
            if (v === p || v === -q) return { code: 'fn-one-root', hint: 'You need both solutions: factor ' + t('x^{2}+' + b + 'x-' + V + '=0') + '.' };
            if (v === q - p) return { code: 'fn-reverse', hint: t('p') + ' is the larger solution, so ' + t('p-q') + ' is positive.' };
            return null;
          }, t('x^{2}+' + b + 'x-' + V + '=0') + '<br>' + t('(x-' + p + ')(x+' + (-q) + ')=0') + ', so ' + t('x=' + p) + ' or ' + t('x=' + q) + ': ' + t('p=' + p) + ', ' + t('q=' + q) + '.<br>' + t('p-q=' + p + '-(' + q + ')=' + ans) + '.', ['Set ' + t('x^{2}+' + b + 'x=' + V) + ', move ' + t(V) + ' to the left side, and factor.'], 'p-q for x^2+bx=V');
        } }] },
      /* ---------- mapping notation (lesson Extension, Section 4) ---------- */
      { num: 'M', section: 'Extra practice — Mapping notation (lesson extension)', stem: 'Some books write a function as a <b>mapping</b>: ' + t('f: x\\to 3x+1') + ' (“' + t('f') + ' maps ' + t('x') + ' to ' + t('3x+1') + '”), so ' + t('f: 4\\to 13') + ' means the same as ' + t('f(4)=13') + '.', parts: [
        { id: 'em1', level: 'BEG', make: function (r) {
          var o = pickWhere(function () { var m = r.int(2, 6), b = r.pick(nz(-7, 7)), p = r.pick(nz(-4, 5)); return { m: m, b: b, p: p, q: m * p + b }; }, function (o) { return o.q !== o.p; });
          var m = o.m, b = o.b, p = o.p, q = o.q;
          return mc(r, 'For ' + t('f: x\\to ' + lin([[m, 'x'], [b, '']])) + ', which statement means the same as ' + t('f: ' + p + '\\to ' + q) + '?', [
            { html: t('f(' + p + ')=' + q), right: true },
            { html: t('f(' + q + ')=' + p), why: 'In ' + t('f: ' + p + '\\to ' + q) + ' the arrow goes from the input ' + t(p) + ' to the output ' + t(q) + '.' },
            { html: t('f\\times ' + p + '=' + q), why: 'A mapping sends an input to an output; nothing is multiplied by ' + t('f') + '.' },
            { html: 'The point ' + t('(' + q + ',\\ ' + p + ')') + ' is on the graph.', why: 'The input comes first in the ordered pair: ' + t('(' + p + ',\\ ' + q + ')') + '.' }],
            t('f: ' + p + '\\to ' + q) + ' says the input ' + t(p) + ' is sent to the output ' + t(q) + ', which is ' + t('f(' + p + ')=' + q) + '.', ['Which number is the input in ' + t('f: ' + p + '\\to ' + q) + '?'], 'mapping to function notation');
        } },
        { id: 'em2', level: 'BEG', make: function (r) {
          var c = r.int(5, 15), m = r.int(2, 5), p = -r.int(1, 5), ans = c - m * p;
          return numPart('For ' + t('g: x\\to ' + c + '-' + m + 'x') + ', to which number is ' + t(p) + ' mapped?', ans, [[c + m * p, 'fn-neg-sub', t('-' + m + '(' + p + ')=+' + (-m * p)) + ': a negative times a negative is positive.'], [(c - p) / m, 'fn-solved', t(p) + ' is the input: substitute it for ' + t('x') + '.']],
            t('g(' + p + ')=' + c + '-' + m + '(' + p + ')=' + c + '+' + (-m * p) + '=' + ans) + ', so ' + t('g: ' + p + '\\to ' + ans) + '.', ['“Mapped to” means the output for that input.'], 'mapping value');
        } },
        { id: 'em3', level: 'EMG', make: function (r) {
          var c = r.int(1, 9), s = r.int(2, 7), V = s * s - c;
          return solPart('For ' + t('h: x\\to x^{2}-' + c) + ', which inputs are mapped to ' + t(V) + '?', [s, -s], 'x', [[[s], 'sol-missing', 'Both ' + t(s) + ' and ' + t(-s) + ' square to ' + t(s * s) + '.'], [[V * V - c], 'fn-evaluated', 'That is where ' + t(V) + ' is mapped. You want the inputs whose output is ' + t(V) + '.']],
            t('x^{2}-' + c + '=' + V) + ', so ' + t('x^{2}=' + s * s) + ' and ' + t('x=\\pm' + s) + '.', HS, 'mapping inputs', 'x=\\pm ' + s);
        } }] }
    ]
  });

  /* ---------------- part makers used above ---------------- */
  /* "Write this in function notation" (and, with point, "and as a point"): boxes f( _ ) = _ (and a point box) */
  function fnEqPart(prompt, name, p, q, point) {
    var fields = [{ name: 'Input', before: t(name + '\\Big('), after: t('\\Big)'), mode: point ? 'math' : undefined, keys: point ? 'pairs' : undefined }, { name: 'Output', before: t('='), mode: point ? 'math' : undefined, keys: point ? 'pairs' : undefined }];
    if (point) fields.push({ name: 'Point', label: 'Point', mode: 'math', keys: 'pairs', placeholder: 'e.g. (2, 5)' });
    var pc = K.pairs([[p, q]]), keys = [String(p), String(q)].concat(point ? ['(' + p + ', ' + q + ')'] : []);
    var part = B.fields(prompt, fields, [K.number(p), K.number(q)].concat(point ? [pc] : []), keys,
      t(name + '(' + p + ')=' + q) + (point ? ', point ' + t('(' + p + ',\\ ' + q + ')') : ''),
      'Input ' + t(p) + ', output ' + t(q) + ': ' + t(name + '(' + p + ')=' + q) + (point ? ', and the point is ' + t('(' + p + ',\\ ' + q + ')') : '') + '.',
      ['In ' + t(name + '(a)=b') + ', ' + t('a') + ' is the input (the ' + t('x') + '-coordinate) and ' + t('b') + ' the output (the ' + t('y') + '-coordinate).'], point ? 'image as notation and point' : 'point as function notation');
    var base = part.check;
    part.check = function (resp) {
      resp = resp || [];
      var a = HW.parse.number(resp[0] == null ? '' : resp[0]), b = HW.parse.number(resp[1] == null ? '' : resp[1]);
      if (a.ok && b.ok && same(a.value, q) && same(b.value, p)) return wrong('fn-eq-flip', 'Input and output are swapped. The input goes inside the brackets: ' + t(name + '(\\text{input})=\\text{output}') + '.');
      return base(resp);
    };
    part.bad = [[String(q), String(p)].concat(point ? ['(' + p + ', ' + q + ')'] : [])];
    if (point) part.bad.push([String(p), String(q), '(' + q + ', ' + p + ')']);
    return part;
  }
  /* solve f(x) = v from the EP12 table (two inputs share v) */
  function tableSolve(sh, v) {
    var xs = sh.xs.filter(function (x, i) { return sh.ys[i] === v; }), dl = [];
    var j = sh.xs.indexOf(v); if (j >= 0) dl.push([[sh.ys[j]], 'fn-evaluated', 'That is ' + t('f(' + v + ')') + ', reading ' + t(v) + ' as an input. Find ' + t(v) + ' in the <b>output</b> row and read the inputs above it.']);
    return solPart('Solve ' + t('f(x)=' + v) + '.', xs, 'x', dl, 'The output ' + t(v) + ' sits under ' + t('x=' + xs[0]) + ' and ' + t('x=' + xs[1]) + ', so ' + t('x=' + xs[0]) + ' or ' + t('x=' + xs[1]) + '.',
      ['Find ' + t(v) + ' in the ' + t('f(x)') + ' row. Which inputs are above it?', 'Check every column — an output can appear more than once.'], 'table solve f(x)=' + v);
  }
})(window);
