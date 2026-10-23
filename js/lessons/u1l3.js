/* Math 10C · Unit 1 · Lesson 3 — Perfect Squares and Perfect Cubes (AN1)
 * Assignment questions 1–14 (u1_L03.tex) and the Lesson 3 Extra Practice (u1_EP03.tex). Questions 1–3, 4(a), 10–12 and
 * Extra practice 1–4 and 8 were part of the old Lesson 2 (GCF, LCM, and Perfect Powers).
 * Every part is a generator: it keeps the idea and difficulty of the booklet question (the booklet's numbers are one
 * of the possible values) and changes the numbers. Levels: LIM BEG EMG PRG ADV MAS. */
(function (root) {
  'use strict';
  var HW = root.HW, nt = HW.nt, F = HW.fmt, K = HW.kit, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form, P = K.P;

  /* ---------- number helpers ---------- */
  function sortN(a) { return a.slice().sort(function (x, y) { return x - y; }); }
  function fromExps(ps, es) { return ps.reduce(function (m, p, i) { return m * Math.pow(p, es[i]); }, 1); }
  function texE(ps, es) { return HW.texFactors(ps.map(function (p, i) { return [p, es[i]]; }).filter(function (pe) { return pe[1] > 0; })); }
  function plainFac(n) { return nt.factor(n).map(function (pe) { return pe[1] > 1 ? pe[0] + '^' + pe[1] : String(pe[0]); }).join(' × '); }
  function eqv(n) { var f = K.fac(n); return f === String(n) ? F(n) : f + '=' + F(n); }
  function find(r, gen, test, fallback) { for (var i = 0; i < 800; i++) { var v = gen(); if (test(v)) return v; } return fallback; }
  function intRoot(n, k) { var r = Math.round(Math.pow(n, 1 / k)); for (var d = -1; d <= 1; d++) if (r + d >= 0 && Math.pow(r + d, k) === n) return r + d; return null; }
  function rad(n) { return nt.distinctPrimes(n).reduce(function (m, p) { return m * p; }, 1); }
  function normX(s) { return String(s == null ? '' : s).replace(/(\d)\s*[xX]\s*(?=\d)/g, '$1*'); }
  function pw(k) { return k === 2 ? 'square' : 'cube'; }
  function rootTex(k, inner) { return (k === 2 ? '\\sqrt{' : '\\sqrt[3]{') + inner + '}'; }
  function kind(n) { var f = nt.factor(n), sq = f.every(function (pe) { return pe[1] % 2 === 0; }), cu = f.every(function (pe) { return pe[1] % 3 === 0; }); return sq && cu ? 'both' : sq ? 'square' : cu ? 'cube' : 'neither'; }

  /* ---------- small checkers (plain-text boxes) ---------- */
  function prodChk(n, exp) { // n as a product of primes, typed in a plain box ("2^3 * 3", "2x2x2x3" also fine)
    var c = K.product(n, exp || 'either');
    return function (resp) {
      var s = normX(resp), pn = HW.parse.number(s);
      if (pn.ok && pn.value === n && !nt.isPrime(n)) return form('not-factored', 'Write ' + t(F(n)) + ' as a product of primes, like ' + t('2^{3}\\times 3') + '.');
      return c(s);
    };
  }
  function expChk(target, diag) { // a value in exponent form (product of prime powers)
    var c = K.product(target, 'required');
    return function (resp) {
      var s = normX(resp), pn = HW.parse.number(s);
      if (pn.ok && pn.value === target && !nt.isPrime(target)) return form('as-number', 'Right value — now write it in <b>exponent form</b>, as a product of prime powers.');
      var p = HW.parse.product(s);
      if (p.ok && p.value !== target && diag && p.factors.every(function (pe) { return nt.isPrime(pe[0]); })) { var h = diag(p.value); if (h) return wrong(h.code, h.hint); }
      return c(s);
    };
  }
  function valChk(target, diag) { // a whole number, or any product equal to it
    return function (resp) {
      var s = normX(resp), pn = HW.parse.number(s), v = null;
      if (pn.ok) v = pn.value; else { var p = HW.parse.product(s); if (p.ok) v = p.value; else return form(pn.code === 'empty' ? 'empty' : 'notnumber', pn.code === 'empty' ? 'Type your answer first.' : 'Type a whole number (or a product such as ' + t('2^{2}\\times 3') + ').'); }
      if (v === target) return ok();
      var h = diag ? diag(v) : null;
      return h ? wrong(h.code, h.hint) : wrong('value', null);
    };
  }
  function isNo(s) { return /^(no|none|nope|not|neither|n\/a|n|-+|—|x)(\s.*|\.)?$/.test(s); }
  function isYes(s) { return /^(yes|y|yep)\b/.test(s); }
  /* the k-th root (or "none" when the number isn't a perfect k-th power) */
  function rootOrNone(root, k, nTex, diag) {
    var word = pw(k), vc = root != null ? valChk(root, diag) : null;
    return function (resp) {
      var s = String(resp == null ? '' : resp).trim().toLowerCase();
      if (!s) return form('empty', 'Type the ' + word + ' root, or <b>none</b> if it is not a perfect ' + word + '.');
      if (isNo(s)) return root == null ? ok() : wrong('said-not-perfect', 'Look at the exponents in the prime factorization: are they all ' + (k === 2 ? 'even' : 'multiples of ' + t('3')) + '? Then ' + t(nTex) + ' <b>is</b> a perfect ' + word + '.');
      if (isYes(s)) return root != null ? form('yes-root', 'Right, it is a perfect ' + word + ' — now type the ' + word + ' root itself.') : wrong('said-perfect', 'Check the exponents in the prime factorization: are they <b>all</b> ' + (k === 2 ? 'even' : 'multiples of ' + t('3')) + '?');
      if (root == null) {
        var s2 = normX(s), pn = HW.parse.number(s2), pp = HW.parse.product(s2);
        if (!pn.ok && !pp.ok) return form('notnumber', 'Type a number, or <b>none</b>.');
        var v = pn.ok ? pn.value : pp.value, big = Math.pow(v, k);
        return wrong('said-perfect', (v % 1 ? 'A decimal root means the number is <b>not</b> a perfect ' + word + '. ' : (big < 1e12 ? t(F(v) + '^{' + k + '}=' + F(big)) + ', not ' + t(nTex) + '. ' : '')) + 'Look at the exponents in the prime factorization: are they all ' + (k === 2 ? 'even' : 'multiples of ' + t('3')) + '? If not, there is no whole-number ' + word + ' root — type <b>none</b>.');
      }
      return vc(s);
    };
  }
  function rootDiag(n, k) { // common slips when taking a square / cube root of n
    var word = pw(k);
    return function (v) {
      if (v === n / k) return { code: 'divided-by-index', hint: 'A ' + word + ' root isn’t ' + (k === 2 ? 'half' : 'a third') + ' of the number. Split the prime factors into ' + (k === 2 ? 'two' : 'three') + ' identical groups and multiply one group.' };
      if (v === rad(n) && v !== intRoot(n, k)) return { code: 'each-prime-once', hint: 'You used each prime once. Divide each <b>exponent</b> by ' + t(k) + ' instead — a prime with a bigger exponent appears more than once in the root.' };
      if (k === 3 && v === intRoot(n, 2)) return { code: 'used-square-root', hint: 'That’s the <b>square</b> root. For the cube root, divide each exponent by ' + t('3') + '.' };
      if (k === 2 && v === intRoot(n, 3)) return { code: 'used-cube-root', hint: 'That’s the <b>cube</b> root. For the square root, divide each exponent by ' + t('2') + '.' };
      if (v > 0 && v % 1 === 0 && Math.pow(v, k) < 1e12) return { code: 'root-value', hint: t(F(v) + '^{' + k + '}=' + F(Math.pow(v, k))) + ', not ' + t(F(n)) + '. Divide each exponent in the prime factorization by ' + t(k) + '.' };
      return null;
    };
  }

  /* ---------- reusable part makers ---------- */
  function productPart(n, exp) {
    return { prompt: t(F(n)), input: { type: 'math', before: t(F(n) + '=') }, check: K.product(n, exp || 'either'), key: K.fac(n),
      answer: t(F(n) + '=' + K.fac(n)), text: 'product of primes: ' + n,
      solution: 'Divide by the smallest prime each time:' + K.ladderSolution(n) + t(F(n) + '=' + K.exp(n) + '=' + K.fac(n)),
      hints: ['Start with the smallest prime that divides ' + t(F(n)) + ' and keep dividing until you reach ' + t('1') + '.', 'Check: multiply your primes back together on your calculator — do you get ' + t(F(n)) + '?'] };
  }
  /* perfect square / cube test: factorization box + root box ("none" if not perfect) */
  function powerTestPart(n, k) {
    var word = pw(k), root = intRoot(n, k), f = nt.factor(n), rt = rootTex(k, F(n)), test = k === 2 ? 'even' : 'a multiple of ' + t('3');
    var bad = f.filter(function (pe) { return pe[1] % k; })[0];
    var fields = [{ name: 'Prime factorization', before: t(F(n) + '='), mode: 'math', wide: true },
      { name: word === 'square' ? 'Square root' : 'Cube root', before: t(rt + '='), mode: 'text', placeholder: 'number, or none' }];
    var keys = [plainFac(n), root != null ? String(root) : 'none'];
    var sol = t(F(n) + '=' + K.fac(n)) + '.<br>' + (root != null
      ? 'Every exponent is ' + test + ', so the factors split into ' + (k === 2 ? 'two' : 'three') + ' identical groups: ' + t(F(n)) + ' <b>is</b> a perfect ' + word + '.<br>' + (k === 2 ? 'Halve' : 'Divide') + ' each exponent' + (k === 3 ? ' by ' + t('3') : '') + ': ' + t(rt + '=' + (function (rf) { return rf === String(root) ? '' : rf + '='; })(HW.texFactors(f.map(function (pe) { return [pe[0], pe[1] / k]; }))) + F(root)) + '. (Calculator: ' + t(rt + '=' + F(root)) + ' ✓)'
      : 'The exponent of ' + t(bad[0]) + ' is ' + t(bad[1]) + ', which is not ' + test + ', so the factors can’t split into ' + (k === 2 ? 'two' : 'three') + ' identical groups: ' + t(F(n)) + ' is <b>not</b> a perfect ' + word + '.<br>Calculator check: ' + t(rt + '\\approx ' + K.roundTo(Math.pow(n, 1 / k), 2).toFixed(2)) + ', not a whole number.');
    var p = P.fields('Is ' + t(F(n)) + ' a perfect ' + word + '? Write its prime factorization, then give ' + t(rt) + ' — or type <b>none</b> if it is not a perfect ' + word + '.', fields,
      [prodChk(n, 'either'), rootOrNone(root, k, F(n), rootDiag(n, k))], keys,
      t(F(n) + '=' + K.fac(n)) + '<br>' + (root != null ? 'Perfect ' + word + ': ' + t(rt + '=' + F(root)) : 'Not a perfect ' + word + '.'), sol,
      ['Factor ' + t(F(n)) + ' into primes and look at the exponents.', 'A perfect ' + word + ' has every exponent ' + test + '. ' + (k === 2 ? 'Halve' : 'Divide') + ' each exponent' + (k === 3 ? ' by 3' : '') + ' to get the root.'],
      'perfect ' + word + '? ' + n);
    p.good = root != null ? [[nt.primeList(n).join('x'), String(root)], [plainFac(n), K.fac(root) === String(root) ? String(root) : plainFac(root)]] : [[plainFac(n), 'no'], [plainFac(n), 'not a perfect ' + word]];
    p.bad = root != null ? [[plainFac(n), 'no'], [plainFac(n), String(root + 1)], [plainFac(n), String(rad(n))]].filter(function (b) { return b[1] !== String(root); }) : [[plainFac(n), String(Math.round(Math.pow(n, 1 / k)))], [plainFac(n), 'yes']];
    return p;
  }
  /* square, cube, both or neither for a whole number: factorization + square root + cube root ("none" where it isn't whole) */
  function sqCubeNumPart(n) {
    var f = nt.factor(n), sr = intRoot(n, 2), cr = intRoot(n, 3), lab = kind(n);
    var label = { both: 'Both', square: 'Perfect square only', cube: 'Perfect cube only', neither: 'Neither' }[lab];
    var odd = f.filter(function (pe) { return pe[1] % 2; })[0], non3 = f.filter(function (pe) { return pe[1] % 3; })[0];
    var half = function (k) { return HW.texFactors(f.map(function (pe) { return [pe[0], pe[1] / k]; })); };
    var fields = [{ name: 'Prime factorization', before: t(F(n) + '='), mode: 'math', wide: true },
      { name: 'Square root', before: t('\\sqrt{' + F(n) + '}='), mode: 'text', placeholder: 'number, or none' },
      { name: 'Cube root', before: t('\\sqrt[3]{' + F(n) + '}='), mode: 'text', placeholder: 'number, or none' }];
    var sol = t(F(n) + '=' + K.fac(n)) + '.<br><b>Square?</b> ' + (sr != null ? 'Every exponent is even: ' + t('\\sqrt{' + F(n) + '}=' + (half(2) === String(sr) ? '' : half(2) + '=') + F(sr)) + '.' : 'The exponent ' + t(odd[1]) + ' on ' + t(odd[0]) + ' is odd, so it is <b>not</b> a perfect square.') +
      '<br><b>Cube?</b> ' + (cr != null ? 'Every exponent is a multiple of ' + t('3') + ': ' + t('\\sqrt[3]{' + F(n) + '}=' + (half(3) === String(cr) ? '' : half(3) + '=') + F(cr)) + '.' : 'The exponent ' + t(non3[1]) + ' on ' + t(non3[0]) + ' is not a multiple of ' + t('3') + ', so it is <b>not</b> a perfect cube.') +
      '<br><b>' + label + '</b>.';
    var p = P.fields('Is ' + t(F(n)) + ' a perfect square, a perfect cube, both, or neither? Write its prime factorization, then give each root that is a whole number — type <b>none</b> for a root that isn’t.', fields,
      [prodChk(n, 'either'), rootOrNone(sr, 2, F(n), rootDiag(n, 2)), rootOrNone(cr, 3, F(n), rootDiag(n, 3))],
      [plainFac(n), sr != null ? String(sr) : 'none', cr != null ? String(cr) : 'none'],
      t(F(n) + '=' + K.fac(n)) + ': <b>' + label + '</b>' + (sr != null ? '; ' + t('\\sqrt{' + F(n) + '}=' + F(sr)) : '') + (cr != null ? '; ' + t('\\sqrt[3]{' + F(n) + '}=' + F(cr)) : ''), sol,
      ['Factor ' + t(F(n)) + ' and look only at the exponents.', 'All even ⇒ perfect square. All multiples of ' + t('3') + ' ⇒ perfect cube. Both ⇒ every exponent a multiple of ' + t('6') + '.'],
      'square/cube/both/neither: ' + n);
    p.bad = [[plainFac(n), sr != null ? 'none' : String(Math.round(Math.sqrt(n))), cr != null ? 'none' : String(Math.round(Math.cbrt(n)))], [plainFac(n), sr != null ? String(sr + 1) : 'none', cr != null ? String(cr + 1) : 'none']]
      .filter(function (b) { return b[1] !== p.key[1] || b[2] !== p.key[2]; });
    return p;
  }
  /* exponent form + whole number in two boxes */
  function expNumPart(prompt, target, lab, diag, sol, hints, text, after) {
    var fields = [{ name: 'Exponent form', label: 'Exponent form', before: t('\\text{' + lab + '}='), mode: 'math', wide: true, after: after },
      { name: 'Whole number', label: 'Whole number', before: t('\\text{' + lab + '}='), after: after }];
    var p = P.fields(prompt, fields, [expChk(target, diag), K.number(target, diag)], [plainFac(target), String(target)], lab + ' ' + t('=' + eqv(target)) + (after ? ' ' + after : ''), sol, hints, text);
    if (!nt.isPrime(target)) p.bad = [[String(target), String(target)]];
    return p;
  }
  /* smallest multiplier / divisor to reach a perfect k-th power */
  function multFor(n, k) { return nt.factor(n).reduce(function (m, pe) { return m * Math.pow(pe[0], (k - pe[1] % k) % k); }, 1); }
  function divFor(n, k) { return nt.factor(n).reduce(function (m, pe) { return m * Math.pow(pe[0], pe[1] % k); }, 1); }
  function multDiag(n, k) {
    var word = pw(k), m = multFor(n, k), test = k === 2 ? 'even' : 'a multiple of ' + t('3');
    return function (v) {
      if (!(v >= 1) || v % 1) return null;
      var w = n * v;
      if (intRoot(w, k) != null) return v === n ? { code: 'times-itself', hint: 'Multiplying by the number itself does give a perfect ' + word + ', but not with the <b>smallest</b> multiplier. Raise each exponent only as far as the next ' + (k === 2 ? 'even number' : 'multiple of ' + t('3')) + '.' } : { code: 'not-smallest', hint: t(F(n) + '\\times ' + F(v)) + ' is a perfect ' + word + ', but a <b>smaller</b> multiplier works. Raise each exponent only as far as the next ' + (k === 2 ? 'even number' : 'multiple of ' + t('3')) + ' — nothing more.' };
      if (k === 3 && intRoot(w, 2) != null) return { code: 'made-square', hint: 'That makes a perfect <b>square</b>, but you need a perfect <b>cube</b>: every exponent must reach a multiple of ' + t('3') + '.' };
      if (k === 2 && intRoot(w, 3) != null) return { code: 'made-cube', hint: 'That makes a perfect <b>cube</b>, but you need a perfect <b>square</b>: every exponent must be even.' };
      if (m % v === 0) return { code: 'missed-prime', hint: 'Not quite: after multiplying by ' + t(F(v)) + ', some exponent is still not ' + test + '. Check every prime.' };
      return null;
    };
  }
  function multPart(n, k, nTex) {
    var word = pw(k), m = multFor(n, k), N = n * m, rt = intRoot(N, k);
    var rdiag = function (v) {
      if (v === N / k) return { code: 'divided-by-index', hint: 'A ' + word + ' root isn’t ' + (k === 2 ? 'half' : 'a third') + ' of the number. Divide each exponent by ' + t(k) + '.' };
      if (v === rad(N) && v !== rt) return { code: 'each-prime-once', hint: 'Divide each <b>exponent</b> by ' + t(k) + ' — a prime with a bigger exponent appears more than once in the root.' };
      if (v === intRoot(n, k)) return { code: 'root-value', hint: 'That’s the root of the original number. Take the root of the <b>result</b> (after multiplying).' };
      return null;
    };
    var fN = nt.factor(n), fNN = nt.factor(N);
    var p = P.fields(nTex,
      [{ name: 'Multiplier', label: 'Multiply by' }, { name: (k === 2 ? 'Square' : 'Cube') + ' root', label: (k === 2 ? 'Square' : 'Cube') + ' root of the result', mode: 'math' }],
      [K.number(m, multDiag(n, k)), valChk(rt, rdiag)], [String(m), String(rt)],
      'Multiply by ' + t(F(m)) + '; ' + t(rootTex(k, F(N)) + '=' + F(rt)),
      (nTex.indexOf('times') < 0 ? t(F(n) + '=' + K.fac(n)) + '. ' : '') + 'Raise each exponent to the next ' + (k === 2 ? 'even number' : 'multiple of ' + t('3')) + ': ' +
        fN.filter(function (pe) { return pe[1] % k; }).map(function (pe) { return t(pe[0] + '^{' + pe[1] + '}\\to ' + pe[0] + '^{' + (pe[1] + (k - pe[1] % k)) + '}'); }).join(', ') + '.<br>Multiply by ' + t(eqv(m)) + '. Result: ' + t(HW.texFactors(fNN) + (N < 1e9 ? '=' + F(N) : '')) + '.<br>' + (k === 2 ? 'Square' : 'Cube') + ' root: ' + t(HW.texFactors(fNN.map(function (pe) { return [pe[0], pe[1] / k]; })) + '=' + F(rt)) + '.',
      ['Look at the exponents in the prime factorization. Which ones are not ' + (k === 2 ? 'even' : 'a multiple of ' + t('3')) + '?', 'Bring each of those up to the next ' + (k === 2 ? 'even number' : 'multiple of ' + t('3')) + ' — and no further.'],
      'multiply to perfect ' + word + ': ' + n);
    p.bad = [[String(n), String(rt)], [String(m * 2 === n ? m * 3 : m * 2), String(rt)]];
    return p;
  }
  function divPart(n, k) {
    var word = pw(k), d = divFor(n, k), N = n / d, rt = intRoot(N, k), test = k === 2 ? 'even' : 'a multiple of ' + t('3');
    var ddiag = function (v) {
      if (!(v >= 1) || v % 1) return null;
      if (n % v) return { code: 'not-divisor', hint: t(F(n) + '\\div ' + F(v)) + ' isn’t a whole number. Remove only prime factors that ' + t(F(n)) + ' actually has.' };
      var w = n / v;
      if (intRoot(w, k) != null) return { code: 'not-smallest', hint: t(F(n) + '\\div ' + F(v) + '=' + F(w)) + ' is a perfect ' + word + ', but you removed more than you had to. Lower each exponent only to the next ' + (k === 2 ? 'even number' : 'multiple of ' + t('3')) + ' below it.' };
      if (k === 3 && intRoot(w, 2) != null) return { code: 'made-square', hint: 'That leaves a perfect <b>square</b>, but you need a perfect <b>cube</b>.' };
      if (k === 2 && intRoot(w, 3) != null) return { code: 'made-cube', hint: 'That leaves a perfect <b>cube</b>, but you need a perfect <b>square</b>.' };
      return null;
    };
    var fN = nt.factor(n), fR = nt.factor(N);
    var p = P.fields('Find the smallest whole number ' + t(F(n)) + ' can be <b>divided</b> by to leave a perfect ' + word + ', and give the ' + word + ' root.',
      [{ name: 'Divisor', label: 'Divide by' }, { name: (k === 2 ? 'Square' : 'Cube') + ' root', label: (k === 2 ? 'Square' : 'Cube') + ' root', mode: 'text', placeholder: 'number' }],
      [K.number(d, ddiag), valChk(rt, null)], [String(d), String(rt)],
      'Divide by ' + t(F(d)) + '; ' + t(rootTex(k, F(N)) + '=' + F(rt)),
      t(F(n) + '=' + K.fac(n)) + '. Lower each exponent that isn’t ' + test + ' to the one just below it: ' + fN.filter(function (pe) { return pe[1] % k; }).map(function (pe) { return t(pe[0] + '^{' + pe[1] + '}\\to ' + pe[0] + '^{' + (pe[1] - pe[1] % k) + '}'); }).join(', ') + '.<br>Divide by ' + t(eqv(d)) + ': ' + t(F(n) + '\\div ' + F(d) + '=' + F(N) + '=' + HW.texFactors(fR)) + '.<br>' + (k === 2 ? 'Square' : 'Cube') + ' root: ' + t(HW.texFactors(fR.map(function (pe) { return [pe[0], pe[1] / k]; })) + '=' + F(rt)) + '.',
      ['Factor ' + t(F(n)) + ' and look for exponents that are not ' + test + '.', 'Remove just enough of each of those primes.'], 'divide to perfect ' + word + ': ' + n);
    p.bad = [[String(n), '1'], [String(d), String(N)]];
    return p;
  }

  HW.addCodes({
    'not-factored': 'Didn’t write the prime factorization', 'as-number': 'Gave a number instead of exponent form', 'said-not-perfect': 'Said not a perfect square/cube (it is)',
    'said-perfect': 'Said it is a perfect square/cube (it isn’t)', 'yes-root': 'Said yes without giving the root', 'divided-by-index': 'Halved / divided by 3 instead of taking the root',
    'each-prime-once': 'Root: used each prime once (didn’t divide the exponents)', 'used-square-root': 'Gave the square root instead of the cube root', 'used-cube-root': 'Gave the cube root instead of the square root',
    'root-value': 'Wrong root', 'times-itself': 'Multiplied by the number itself (not smallest)', 'not-smallest': 'Works, but not the smallest', 'made-square': 'Made a square instead of a cube',
    'made-cube': 'Made a cube instead of a square', 'missed-prime': 'Missed a prime with the wrong exponent', 'not-divisor': 'Divisor doesn’t divide the number',
    'halved': 'Halved instead of square root', 'perimeter': 'Used the perimeter', 'area': 'Gave the area', 'two-sides': 'Used only two sides', 'side-only': 'Gave one side only',
    'divided-3': 'Divided by 3 instead of cube root', 'square-root': 'Used the square root instead of cube root', 'squared': 'Took two of each prime instead of one',
    'square-only': 'Square, but not a cube (needed both)', 'cube-only': 'Cube, but not a square (needed both)', 'exp-halved': 'Halved the exponents instead of doubling', 'exp-added': 'Added to the exponents instead of multiplying',
    'exp-same': 'Left the exponents unchanged', 'used-sqrt-for-cube': 'Halved the exponents for a cube'
  });

  HW.defineLesson({
    id: 'u1l3', unit: 1, num: '3', title: 'Perfect Squares and Perfect Cubes', outcome: 'AN1',
    blurb: 'Use prime factorization to test for perfect squares and perfect cubes, find square and cube roots, and build perfect squares and cubes.',
    questions: [
      { num: '1', section: 'Part A — Perfect Squares', stem: 'In each case use prime factorization to determine whether the number is a perfect square. If it is a perfect square, state its square root. (Verify with a calculator.)', parts: [
        { id: '1a', level: 'PRG', make: function (r) { var k = r.pick([18, 20, 28, 45, 50, 44, 52, 63]); return powerTestPart(k * k, 2); } },
        { id: '1b', level: 'PRG', make: function (r) { var k = r.pick([30, 42, 66, 70, 78]); return powerTestPart(k * k, 2); } },
        { id: '1c', level: 'PRG', make: function (r) { return powerTestPart(r.pick([686, 250, 375, 1029, 2662, 1715]), 2); } },
        { id: '1d', level: 'PRG', make: function (r) { return powerTestPart(r.pick([1050, 1470, 1350, 1575, 1176, 2450]), 2); } }] },
      { num: '2', section: 'Part B — Perfect Cubes', stem: function (sh) { return 'Consider the number ' + t(F(sh.n)) + '.'; },
        shared: function (r) { var k = r.pick([45, 63, 50, 75, 98, 44, 52, 99, 28, 36]); return { k: k, n: k * k * k }; },
        parts: [
          { id: '2a', level: 'BEG', make: function (r, sh) {
            var n = sh.n, k = sh.k, s = Math.round(Math.sqrt(n));
            return P.number('Use a calculator to find the cube root of ' + t(F(n)) + '.', k, function (v) {
              if (Math.abs(v - Math.sqrt(n)) < 1 || v === s) return { code: 'square-root', hint: 'That’s the <b>square</b> root. Use the cube root: on the TI-30XIIS type ' + t('3') + ', then ' + t('\\sqrt[x]{\\ }') + ' (2nd of ' + t('\\wedge') + '), then the number.' };
              if (v === n / 3) return { code: 'divided-3', hint: 'A cube root isn’t a third of the number. It is the number that, multiplied by itself three times, gives ' + t(F(n)) + '.' };
              return null;
            }, t('\\sqrt[3]{' + F(n) + '}=' + k) + '. Check: ' + t(k + '\\times ' + k + '\\times ' + k + '=' + F(n)) + '.', ['Use the cube-root key, not the square-root key.'], 'cube root of ' + n, { before: t('\\sqrt[3]{' + F(n) + '}=') });
          } },
          { id: '2b1', sub: 'b i', level: 'EMG', make: function (r, sh) { var p = productPart(sh.n, 'required'); p.prompt = 'Write ' + t(F(sh.n)) + ' as a product of primes in exponent form.'; return p; } },
          { id: '2b2', sub: 'b ii', level: 'EMG', make: function (r, sh) {
            var n = sh.n, k = sh.k, f = nt.factor(n), fk = HW.texFactors(nt.factor(k)), exps = f.map(function (pe) { return pe[1]; }), sum = nt.sum(exps), mx = Math.max.apply(null, exps);
            return P.mc(r, 'Which statement explains how the prime factorization ' + t(F(n) + '=' + K.fac(n)) + ' shows that ' + t(F(n)) + ' is a perfect cube, and confirms the cube root?', [
              { html: 'Every exponent (' + t(exps.join(',\\ ')) + ') is a multiple of ' + t('3') + ', so the primes split into three identical groups. One group is ' + t(fk + (fk === String(k) ? '' : '=' + k)) + ', the cube root.', right: true },
              { html: 'The exponents add up to ' + t(sum) + ', a multiple of ' + t('3') + ', so it is a perfect cube with cube root ' + t(k) + '.', why: 'Adding the exponents doesn’t test for a cube: ' + t('18=2\\times 3^{2}') + ' has exponents adding to ' + t('3') + ', but ' + t('18') + ' is not a perfect cube. <b>Each</b> exponent must be a multiple of ' + t('3') + '.' },
              { html: 'The largest exponent, ' + t(mx) + ', is a multiple of ' + t('3') + ', so it is a perfect cube with cube root ' + t(k) + '.', why: 'Every exponent must be a multiple of ' + t('3') + ', not just the largest: ' + t('24=2^{3}\\times 3') + ' is not a perfect cube.' },
              { html: 'Every exponent is a multiple of ' + t('3') + ', so the cube root is ' + t(F(n) + '\\div 3' + (n % 3 ? '\\approx ' + F(Math.round(n / 3 * 100) / 100) : '=' + F(n / 3))) + '.', why: 'Right test, wrong root: a cube root isn’t a third of the number. Divide each <b>exponent</b> by ' + t('3') + ' instead.' }],
              t(F(n) + '=' + K.fac(n)) + '. Every exponent is a multiple of ' + t('3') + ', so the factors group into three matching triples and ' + t(F(n)) + ' is a perfect cube. Dividing each exponent by ' + t('3') + ': ' + t('\\sqrt[3]{' + F(n) + '}=' + fk + (fk === String(k) ? '' : '=' + k)) + ', which matches the calculator. ✓',
              ['For a perfect cube, what must be true of <b>every</b> exponent?'], 'explain perfect cube ' + n);
          } }] },
      { num: '3', stem: 'In each case use prime factorization to determine whether the number is a perfect cube. If it is, state its cube root. (Verify with a calculator.)', parts: [
        { id: '3a', level: 'PRG', make: function (r) { return powerTestPart(r.pick([512, 729, 4096, 15625]), 3); } },
        { id: '3b', level: 'PRG', make: function (r) { return powerTestPart(r.pick([2197, 4913, 6859, 12167]), 3); } },
        { id: '3c', level: 'PRG', make: function (r) { return powerTestPart(r.pick([1024, 256, 625, 2401, 6561]), 3); } },
        { id: '3d', level: 'PRG', make: function (r) { return powerTestPart(r.pick([3025, 1225, 5929, 4225, 8281, 1089]), 3); } }] },
      { num: '4', section: 'Part C — Square, Cube, Both, or Neither?', stem: '', parts: [
        { id: '4a', level: 'PRG', make: function (r) {
          var ex = r.pick([[64, '2^{6}', 8, 4], [729, '3^{6}', 27, 9], [4096, '2^{12}', 64, 16], [15625, '5^{6}', 125, 25], [46656, '2^{6}\\times 3^{6}', 216, 36]]);
          return P.mc(r, 'How could you use prime factorization to determine whether a whole number is <i>both</i> a perfect square and a perfect cube?', [
            { html: 'Find the prime factorization. The number is both exactly when <b>every</b> exponent is a multiple of ' + t('6') + ' (a multiple of both ' + t('2') + ' and ' + t('3') + ').', right: true },
            { html: 'Find the prime factorization. The number is both when every exponent is even.', why: 'Even exponents only make a perfect <b>square</b>: ' + t('4=2^{2}') + ' is a square but not a cube.' },
            { html: 'Find the prime factorization. The number is both when every exponent is a multiple of ' + t('2') + ' <b>or</b> a multiple of ' + t('3') + '.', why: '“Or” isn’t enough: ' + t('108=2^{2}\\times 3^{3}') + ' has one of each, and it is neither a square nor a cube.' },
            { html: 'Find the prime factorization. The number is both when the exponents add up to a multiple of ' + t('6') + '.', why: t('486=2\\times 3^{5}') + ' has exponents adding to ' + t('6') + ', but it is neither a square nor a cube. Look at each exponent on its own.' }],
            'A perfect square needs every exponent to be a multiple of ' + t('2') + '; a perfect cube needs every exponent to be a multiple of ' + t('3') + '. Both at once means every exponent is a multiple of ' + t('6') + '. Example: ' + t(F(ex[0]) + '=' + ex[1]) + ', so ' + t('\\sqrt{' + F(ex[0]) + '}=' + ex[2]) + ' and ' + t('\\sqrt[3]{' + F(ex[0]) + '}=' + ex[3]) + '.',
            ['What must the exponents be for a square? For a cube? What number is a multiple of both?'], 'explain square and cube');
        } },
        { id: '4b', level: 'ADV', make: function (r) {
          var p = r.pick([2, 3, 2, 3, 5, 6]), ans = Math.pow(p, 6), sq = Math.pow(p, 2), cu = Math.pow(p, 3);
          var pf = nt.factor(p), what = p === 6 ? 'divisible by ' + t('6') : 'divisible by ' + t(p);
          return P.number('Find the smallest whole number greater than ' + t('1') + ' that is <b>both</b> a perfect square and a perfect cube and is ' + what + '.', ans, function (v) {
            if (v === sq || (v > 1 && intRoot(v, 2) != null && intRoot(v, 3) == null)) return { code: 'square-only', hint: t(F(v)) + ' is a perfect square, but not a perfect cube. Both at once needs every exponent to be a multiple of ' + t('6') + '.' };
            if (v === cu || (v > 1 && intRoot(v, 3) != null && intRoot(v, 2) == null)) return { code: 'cube-only', hint: t(F(v)) + ' is a perfect cube, but not a perfect square. Both at once needs every exponent to be a multiple of ' + t('6') + '.' };
            if (v > ans && intRoot(v, 6) != null) return { code: 'not-smallest', hint: t(F(v)) + ' is both, but a smaller one works. Use the smallest exponent that is a multiple of ' + t('6') + '.' };
            return null;
          }, 'Both a square and a cube ⇒ every exponent is a multiple of ' + t('6') + '. ' + (p === 6 ? 'It must contain both ' + t('2') + ' and ' + t('3') + '; the smallest is ' + t('2^{6}\\times 3^{6}=' + F(ans)) : 'It must contain ' + t(p) + '; the smallest is ' + t(p + '^{6}=' + F(ans))) + '. (' + t('\\sqrt{' + F(ans) + '}=' + F(Math.pow(p, 3))) + ', ' + t('\\sqrt[3]{' + F(ans) + '}=' + F(Math.pow(p, 2))) + ')',
            ['Both a square and a cube: every exponent must be a multiple of what number?', 'Use the smallest such exponent on ' + (pf.length > 1 ? 'each prime' : t(p)) + '.'], 'smallest square and cube with ' + p);
        } }] },
      { num: '5', stem: 'Decide whether each number is a perfect square, a perfect cube, both, or neither. State each root that is a whole number.', parts: [
        { id: '5a', level: 'EMG', make: function (r) { return sqCubeNumPart(r.pick([256, 400, 324, 196, 1024, 576, 2500])); } },
        { id: '5b', level: 'EMG', make: function (r) { return sqCubeNumPart(r.pick([1331, 216, 2744, 3375, 512, 1000, 2197])); } },
        { id: '5c', level: 'PRG', make: function (r) { return sqCubeNumPart(r.pick([15625, 4096, 729, 64, 46656])); } },
        { id: '5d', level: 'EMG', make: function (r) { return sqCubeNumPart(r.pick([1800, 1200, 72, 108, 250, 1350, 2400])); } }] },
      { num: '6', section: 'Part D — Making Perfect Squares and Perfect Cubes', stem: 'Find the smallest whole number each must be multiplied by to give a perfect square, and state the square root of the result.', parts: [
        { id: '6a', level: 'EMG', make: function (r) { var n = r.pick([18, 12, 20, 28, 45, 50, 75, 8]); return multPart(n, 2, t(F(n))); } },
        { id: '6b', level: 'EMG', make: function (r) { var n = r.pick([245, 147, 363, 175, 99, 117, 539]); return multPart(n, 2, t(F(n))); } },
        { id: '6c', level: 'PRG', make: function (r) { var n = r.pick([600, 1176, 540, 280, 360, 2400]); return multPart(n, 2, t(F(n))); } }] },
      { num: '7', stem: 'Find the smallest whole number each must be multiplied by to give a perfect cube, and state the cube root of the result.', parts: [
        { id: '7a', level: 'EMG', make: function (r) { var n = r.pick([32, 4, 16, 9, 25, 81, 243]); return multPart(n, 3, t(F(n))); } },
        { id: '7b', level: 'PRG', make: function (r) { var n = r.pick([1323, 1125, 392, 675, 1080, 864]); return multPart(n, 3, t(F(n))); } },
        { id: '7c', level: 'PRG', make: function (r) { var n = r.pick([500, 108, 250, 1372, 3087]); return multPart(n, 3, t(F(n))); } }] },
      { num: '8', section: 'Part E — Multiple Choice and Numerical Response', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '8', level: 'PRG', make: function (r) {
          var pq = r.pick([[2, 3], [2, 3], [2, 5], [3, 5], [5, 7], [2, 7]]), e2 = r.pick([6, 6, 12]), want = r.pick(['square', 'square', 'cube']);
          var cat = function (a) { return a % 6 === 0 ? 'both' : a % 2 === 0 ? 'square' : a % 3 === 0 ? 'cube' : 'neither'; };
          var pool = { square: [2, 4, 8, 10], cube: [3, 9, 15], both: [6, 12], neither: [1, 5, 7] };
          var ans = r.pick(pool[want]), other = want === 'square' ? 'cube' : 'square';
          var opts = [ans, r.pick(pool.both), r.pick(pool[other])];
          var fourth = find(r, function () { return r.pick(want === 'square' ? pool.cube.concat(pool.neither) : pool.square.concat(pool.neither)); }, function (a) { return opts.indexOf(a) < 0; }, 1);
          opts.push(fourth);
          var nTex = function (a) { return pq[0] + '^{' + a + '}\\times ' + pq[1] + '^{' + e2 + '}'; };
          var why = function (a) { var c = cat(a); return t(nTex(a)) + ' is ' + (c === 'both' ? '<b>both</b> a square and a cube (' + t(a) + ' is a multiple of ' + t('6') + ')' : c === 'neither' ? '<b>neither</b> (' + t(a) + ' is odd and not a multiple of ' + t('3') + ')' : 'a perfect ' + c + ' only') + '.'; };
          var desc = want === 'square' ? 'a perfect square but <i>not</i> a perfect cube' : 'a perfect cube but <i>not</i> a perfect square';
          return P.mc(r, 'The prime factorization of a whole number is ' + t(pq[0] + '^{a}\\times ' + pq[1] + '^{' + e2 + '}') + '. For the number to be ' + desc + ', the value of ' + t('a') + ' could be',
            sortN(opts).map(function (a) { return { html: t(a), right: a === ans, why: a === ans ? null : why(a) }; }),
            'The exponent ' + t(e2) + ' is already a multiple of ' + t('6') + ', so only ' + t('a') + ' matters. ' + (want === 'square' ? 'A square needs ' + t('a') + ' even; to avoid a cube, ' + t('a') + ' must <b>not</b> be a multiple of ' + t('3') : 'A cube needs ' + t('a') + ' to be a multiple of ' + t('3') + '; to avoid a square, ' + t('a') + ' must be <b>odd</b>') + '. Only ' + t('a=' + ans) + ' does both.<br>' + sortN(opts).filter(function (a) { return a !== ans; }).map(why).join('<br>'),
            ['Square: every exponent even. Cube: every exponent a multiple of ' + t('3') + '.'], 'MC exponent a, ' + want, true);
        } }] },
      { num: '9', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '9', level: 'EMG', make: function (r) {
          var v = find(r, function () { var s = r.pick([2, 3, 6, 7, 14, 10, 12, 21]), m = r.pick([15, 6, 10, 21, 14, 35, 33, 22, 30]); return { n: s * s * m, m: m }; },
            function (v) { return multFor(v.n, 2) === v.m && v.n >= 1000 && v.n <= 9999; }, { n: 2940, m: 15 });
          var n = v.n, m = v.m, N = n * m, d = multDiag(n, 2);
          var p = P.nr('The smallest whole number that ' + t(F(n)) + ' must be multiplied by to give a perfect square is ________.', m, function (x) {
            if (x === m * m) return { code: 'squared', hint: 'Each odd exponent needs just <b>one</b> more of its prime.' };
            return d(x);
          }, t(F(n) + '=' + K.fac(n)) + '. The odd exponents are on ' + nt.factor(m).map(function (pe) { return t(pe[0]); }).join(' and ') + ', so each needs one more. Multiply by ' + t(eqv(m)) + ': ' + t(F(n) + '\\times ' + m + '=' + F(N) + '=' + intRoot(N, 2) + '^{2}') + '. Answer: ' + t(m),
            ['Factor ' + t(F(n)) + ' and find the exponents that are odd.'], 'NR square multiplier ' + n);
          p.bad = [String(n), String(m * m)];
          return p;
        } }] },
      { num: '10', section: 'Part F — Problem Solving', stem: 'Use prime factorization to explain.', parts: [
        { id: '10a', level: 'BEG', make: function (r) {
          var names = r.pick([['Sam', 'Jada'], ['Sam', 'Jada'], ['Eli', 'Mira'], ['Owen', 'Priya']]), sq = r.pick([36, 49, 64, 81, 100, 121, 144, 196, 225]), non = r.pick([20, 18, 45, 50, 72, 98, 75, 48, 28, 63, 80, 12]);
          var firstSq = r.chance(0.5), nA = firstSq ? sq : non, nB = firstSq ? non : sq, A = names[0], B = names[1], sqN = firstSq ? A : B, nonN = firstSq ? B : A, k = Math.sqrt(sq);
          var odd = nt.factor(non).filter(function (pe) { return pe[1] % 2; })[0];
          var whyNon = t(non + '=' + K.fac(non)) + ': the exponent of ' + t(odd[0]) + ' is odd, so the tiles can’t pair up into a square. ' + nonN + ' can only make rectangles.';
          var whySq = t(sq + '=' + K.fac(sq)) + ': every exponent is even, so ' + sqN + ' can make a ' + t(k + '\\times ' + k) + ' square.';
          return P.mc(r, A + ' has ' + t(nA) + ' square tiles and ' + B + ' has ' + t(nB) + '. Who can arrange <b>all</b> of their tiles into one solid square?', [
            { html: 'Only ' + A, right: A === sqN, why: A === sqN ? null : whyNon },
            { html: 'Only ' + B, right: B === sqN, why: B === sqN ? null : whyNon },
            { html: 'Both of them', why: whyNon },
            { html: 'Neither of them', why: whySq }],
            'A solid square needs a perfect-square number of tiles: every exponent in the prime factorization must be even.<br>' + whySq + '<br>' + whyNon + '<br>So only <b>' + sqN + '</b> can.',
            ['Factor both numbers. Is every exponent even?'], 'who can make a square: ' + nA + ', ' + nB, true);
        } },
        { id: '10b', level: 'BEG', make: function (r) {
          var c = r.pick([64, 125, 216, 343, 512, 729, 1000]), nc = r.pick([72, 48, 96, 108, 144, 200, 128, 250, 36]), rowsN = r.shuffle([c, nc]);
          function why(n) { var f = nt.factor(n), b = f.filter(function (pe) { return pe[1] % 3; })[0]; return b ? t(F(n) + '=' + K.fac(n)) + ': the exponent of ' + t(b[0]) + ' isn’t a multiple of ' + t('3') + ', so it is not a perfect cube.' : t(F(n) + '=' + K.fac(n)) + ': every exponent is a multiple of ' + t('3') + ', so it makes a ' + t(intRoot(n, 3) + '\\times ' + intRoot(n, 3) + '\\times ' + intRoot(n, 3)) + ' cube.'; }
          var want = {}; rowsN.forEach(function (n, i) { want['r' + i] = n === c ? 'yes' : 'no'; });
          return P.grid('Can each number of sugar cubes be stacked into one solid cube?', rowsN.map(function (n, i) { return { id: 'r' + i, html: t(F(n)) + ' cubes', label: n + ' cubes' }; }),
            [{ id: 'yes', html: 'Yes', label: 'Yes' }, { id: 'no', html: 'No', label: 'No' }], want,
            { tries: 2, count: false, why: function (row) { return { code: 'row', hint: why(rowsN[Number(row.slice(1))]) }; } },
            'A solid cube needs a perfect-cube number of sugar cubes: every exponent in the prime factorization must be a multiple of ' + t('3') + '.<br>' + rowsN.map(why).join('<br>'),
            ['Factor each number. Is every exponent a multiple of ' + t('3') + '?'], 'cube stacking: ' + rowsN.join(', '));
        } }] },
      { num: '11', stem: function (sh) { return 'A square garden has an area of ' + t(F(sh.n) + '\\text{ m}^{2}') + '.'; },
        shared: function (r) { var k = r.pick([42, 30, 66, 70, 78, 60, 84, 90]); return { k: k, n: k * k }; },
        parts: [
          { id: '11a', level: 'EMG', make: function (r, sh) {
            var n = sh.n, k = sh.k;
            var p = P.number('Use prime factorization to find the side length of the garden.', k, function (v) {
              if (v === n / 2) return { code: 'halved', hint: 'The side length is the <b>square root</b> of the area, not half of it.' };
              if (v === n / 4) return { code: 'perimeter', hint: 'Dividing by ' + t('4') + ' would work for a <b>perimeter</b>. For an area, take the <b>square root</b>.' };
              if (v === rad(n) && v !== k) return { code: 'each-prime-once', hint: 'You used each prime once. Halve each <b>exponent</b> in the prime factorization instead.' };
              return null;
            }, 'Side ' + t('=\\sqrt{' + F(n) + '}') + '. ' + t(F(n) + '=' + K.fac(n)) + ' (every exponent even), so ' + t('\\sqrt{' + F(n) + '}=' + HW.texFactors(nt.factor(k)) + '=' + k) + '. <b>' + k + ' m</b>',
            ['A square’s area is side × side, so the side is the square root of the area.', 'Factor ' + t(F(n)) + ' and halve each exponent.'], 'garden side ' + n, { after: 'm' });
            p.bad = [String(n / 2)];
            return p;
          } },
          { id: '11b', level: 'EMG', make: function (r, sh) {
            var k = sh.k;
            return P.number('How much fencing is needed to enclose it?', 4 * k, function (v) {
              if (v === sh.n) return { code: 'area', hint: 'That’s the area. Fencing goes around the <b>outside</b>: the perimeter.' };
              if (v === 2 * k) return { code: 'two-sides', hint: 'A square has <b>four</b> equal sides.' };
              if (v === k) return { code: 'side-only', hint: 'That’s one side. The fence goes all the way around.' };
              return null;
            }, 'Perimeter ' + t('=4\\times ' + k + '=' + 4 * k) + '. <b>' + 4 * k + ' m</b> of fencing.', ['Fencing goes around all four sides.'], 'fencing for ' + sh.n, { after: 'm' });
          } }] },
      { num: '12', stem: '', parts: [
        { id: '12', level: 'EMG', make: function (r) {
          var k = r.pick([14, 12, 15, 18, 21, 22, 20, 24]), n = k * k * k;
          var p = P.number('A cube-shaped storage box has a volume of ' + t(F(n) + '\\text{ cm}^{3}') + '. Use prime factorization to find the length of each edge.', k, function (v) {
            if (v === n / 3) return { code: 'divided-3', hint: 'The edge is the <b>cube root</b> of the volume, not a third of it.' };
            if (v === Math.round(Math.sqrt(n)) || Math.abs(v - Math.sqrt(n)) < 0.5) return { code: 'square-root', hint: 'That’s close to the <b>square</b> root. A cube’s volume is edge × edge × edge, so take the <b>cube</b> root.' };
            if (v === rad(n) && v !== k) return { code: 'each-prime-once', hint: 'Divide each <b>exponent</b> in the prime factorization by ' + t('3') + '.' };
            return null;
          }, 'Edge ' + t('=\\sqrt[3]{' + F(n) + '}') + '. ' + t(F(n) + '=' + K.fac(n)) + ' (every exponent a multiple of 3), so ' + t('\\sqrt[3]{' + F(n) + '}=' + HW.texFactors(nt.factor(k)) + '=' + k) + '. <b>' + k + ' cm</b>. Check: ' + t(k + '^{3}=' + F(n)) + ' ✓',
          ['Volume of a cube = edge × edge × edge.', 'Factor ' + t(F(n)) + ' and divide each exponent by ' + t('3') + '.'], 'cube edge ' + n, { after: 'cm' });
          p.bad = [String(Math.round(n / 3))];
          return p;
        } }] },
      { num: '13', stem: function (sh) { return 'Squaring and cubing ' + t(sh.k) + '.'; },
        shared: function (r) { return { k: r.pick([28, 28, 12, 20, 18, 45, 50, 44, 63, 52, 75]) }; },
        parts: [
          { id: '13a', level: 'BEG', make: function (r, sh) { var p = productPart(sh.k, 'required'); p.prompt = 'Write ' + t(sh.k) + ' as a product of prime factors in exponent form.'; return p; } },
          { id: '13b', level: 'EMG', make: function (r, sh) {
            var k = sh.k, f = nt.factor(k), k2 = k * k, k3 = k * k * k;
            var dg = function (pow) {
              return function (v) {
                if (v === k) return { code: 'exp-same', hint: 'That’s ' + t(k) + ' itself. ' + (pow === 2 ? 'Squaring' : 'Cubing') + ' writes every prime factor down ' + (pow === 2 ? 'twice' : 'three times') + '.' };
                var alt = f.reduce(function (m, pe) { return m * Math.pow(pe[0], pe[1] + pow); }, 1);
                if (v === alt) return { code: 'exp-added', hint: 'You added ' + t(pow) + ' to each exponent. ' + (pow === 2 ? 'Squaring <b>doubles</b>' : 'Cubing <b>triples</b>') + ' every exponent.' };
                if (pow === 3 && v === k2) return { code: 'exp-halved', hint: 'That’s the square. For the cube, multiply every exponent by ' + t('3') + '.' };
                return null;
              };
            };
            var fl = [{ name: t(k + '^{2}'), before: t(k + '^{2}='), mode: 'math', wide: true }, { name: t(k + '^{3}'), before: t(k + '^{3}='), mode: 'math', wide: true }];
            return P.fields('Without multiplying anything out, write ' + t(k + '^{2}') + ' and ' + t(k + '^{3}') + ' in exponent form.', fl, [expChk(k2, dg(2)), expChk(k3, dg(3))], [plainFac(k2), plainFac(k3)],
              t(k + '^{2}=' + K.fac(k2)) + ', ' + t(k + '^{3}=' + K.fac(k3)),
              t(k + '=' + K.fac(k)) + '.<br>' + t(k + '^{2}=(' + K.fac(k) + ')\\times(' + K.fac(k) + ')=' + K.fac(k2)) + ' (' + t('=' + F(k2)) + '): every exponent doubles.<br>' + t(k + '^{3}=' + K.fac(k3)) + ' (' + t('=' + F(k3)) + '): every exponent triples.',
              ['Write ' + t(k) + ' in exponent form first.', 'Squaring writes every prime factor down twice; cubing, three times.'], 'square and cube in exponent form: ' + k);
          } },
          { id: '13c', level: 'PRG', make: function (r, sh) {
            return P.mc(r, 'Which explains why the square of <i>any</i> whole number has only even exponents in its prime factorization?', [
              { html: 'Squaring writes each prime factor down twice, so every exponent is <b>doubled</b> — and double a whole number is always even.', right: true },
              { html: 'Squaring adds ' + t('2') + ' to every exponent, and adding ' + t('2') + ' keeps it even.', why: 'Squaring <b>doubles</b> each exponent; it doesn’t add ' + t('2') + '. (' + t(sh.k + '=' + K.fac(sh.k)) + ' but ' + t(sh.k + '^{2}=' + K.fac(sh.k * sh.k)) + '.) Adding ' + t('2') + ' to an odd exponent would leave it odd.' },
              { html: 'Every whole number already has only even exponents.', why: t(sh.k + '=' + K.fac(sh.k)) + ' has an odd exponent.' },
              { html: 'A square number is always even.', why: t('9=3^{2}') + ' is a square and is odd. It is the <b>exponents</b> that are even, not the number.' }],
              'If ' + t('n=p^{a}\\times q^{b}\\times\\cdots') + ', then ' + t('n^{2}=n\\times n=p^{2a}\\times q^{2b}\\times\\cdots') + ': every exponent is doubled, so every exponent is even. Example: ' + t(sh.k + '^{2}=' + K.fac(sh.k * sh.k)) + '.',
              ['Compare ' + t(sh.k) + ' and ' + t(sh.k + '^{2}') + ' in exponent form. What happened to each exponent?'], 'why square exponents are even');
          } }] },
      { num: '14', stem: 'Work from the exponents.', parts: [
        { id: '14a', level: 'PRG', make: function (r) {
          var v = find(r, function () { var ps = r.pick([[2, 3, 5], [2, 3, 7], [2, 5, 7], [3, 5, 7]]), es = ps.map(function () { return r.pick([2, 2, 4, 6]); }); return { ps: ps, es: es, s: fromExps(ps, es.map(function (e) { return e / 2; })) }; },
            function (v) { return v.s >= 20 && v.s <= 2000; }, { ps: [2, 3, 5], es: [4, 2, 2], s: 60 });
          var A = fromExps(v.ps, v.es), s = v.s, nTex = texE(v.ps, v.es);
          return expNumPart('A square has an area of ' + t(nTex + '\\text{ cm}^{2}') + '. Find its side length in exponent form and as a whole number.', s, 'side', function (x) {
            if (x === A / 2) return { code: 'halved', hint: 'Halve the <b>exponents</b>, not the area.' };
            if (x === A) return { code: 'area', hint: 'That’s the area. The side is its square root.' };
            if (x === rad(A) && x !== s) return { code: 'each-prime-once', hint: 'Halve each exponent — don’t just use each prime once.' };
            return null;
          }, 'Side ' + t('=\\sqrt{' + nTex + '}') + ': halve each exponent. ' + t('\\text{side}=' + texE(v.ps, v.es.map(function (e) { return e / 2; })) + '=' + F(s)) + ' cm.',
          ['A square’s side is the square root of its area.', 'Halve each exponent.'], 'square side from exponents', 'cm');
        } },
        { id: '14b', level: 'PRG', make: function (r) {
          var v = find(r, function () { var ps = r.pick([[2, 3], [2, 3], [2, 5], [3, 5], [2, 7]]), es = ps.map(function () { return r.pick([3, 6, 9]); }); return { ps: ps, es: es, e: fromExps(ps, es.map(function (x) { return x / 3; })) }; },
            function (v) { return v.e >= 12 && v.e <= 1000 && v.es[0] !== v.es[1]; }, { ps: [2, 3], es: [9, 6], e: 72 });
          var Vol = fromExps(v.ps, v.es), e = v.e, nTex = texE(v.ps, v.es), sqrtE = v.es.every(function (x) { return x % 2 === 0; }) ? fromExps(v.ps, v.es.map(function (x) { return x / 2; })) : null;
          return expNumPart('A cube has a volume of ' + t(nTex + '\\text{ cm}^{3}') + '. Find its edge length in exponent form and as a whole number.', e, 'edge', function (x) {
            if (sqrtE != null && x === sqrtE) return { code: 'used-sqrt-for-cube', hint: 'You halved the exponents. A cube’s edge is the <b>cube</b> root: divide each exponent by ' + t('3') + '.' };
            if (x === Vol / 3) return { code: 'divided-3', hint: 'Divide the <b>exponents</b> by ' + t('3') + ', not the volume.' };
            if (x === rad(Vol) && x !== e) return { code: 'each-prime-once', hint: 'Divide each exponent by ' + t('3') + ' — don’t just use each prime once.' };
            return null;
          }, 'Edge ' + t('=\\sqrt[3]{' + nTex + '}') + ': divide each exponent by ' + t('3') + '. ' + t('\\text{edge}=' + texE(v.ps, v.es.map(function (x) { return x / 3; })) + '=' + F(e)) + ' cm.',
          ['A cube’s edge is the cube root of its volume.', 'Divide each exponent by ' + t('3') + '.'], 'cube edge from exponents', 'cm');
        } }] }
    ],
    extra: [
      { num: '1', section: 'Extra practice A — Perfect squares and cubes from the exponents', stem: 'A number is a perfect square exactly when every exponent in its prime factorization is even, and a perfect cube exactly when every exponent is a multiple of ' + t('3') + '. Decide: square, cube, both, or neither? Give each root that exists (exponent form is fine); type <b>none</b> for a root that isn’t a whole number.', parts: [
        { id: 'e1a', level: 'EMG', make: function (r) { return sqCubePart(r, function (es) { return es.every(function (e) { return e % 2 === 0; }) && es.some(function (e) { return e % 3; }); }, [2, 4, 6, 8], [6, 4]); } },
        { id: 'e1b', level: 'EMG', make: function (r) { return sqCubePart(r, function (es) { return es.every(function (e) { return e % 3 === 0; }) && es.some(function (e) { return e % 2; }); }, [3, 6, 9], [9, 3]); } },
        { id: 'e1c', level: 'PRG', make: function (r) { return sqCubePart(r, function (es) { return es.every(function (e) { return e % 6 === 0; }); }, [6, 12], [6, 12]); } },
        { id: 'e1d', level: 'EMG', make: function (r) { return sqCubePart(r, function (es) { return es.some(function (e) { return e % 2; }) && es.some(function (e) { return e % 3; }); }, [1, 2, 3, 4], [4, 3, 2], 3); } }] },
      { num: '2', section: 'Extra practice B — Making perfect squares and perfect cubes', stem: 'Find the <b>smallest whole number</b> each must be multiplied by to give a perfect square, and state the square root of the result. (Raise each odd exponent to the next even number — nothing more.)', parts: [
        { id: 'e2a', level: 'PRG', make: function (r) {
          var v = find(r, function () { var ps = r.pick([[2, 3, 7], [2, 3, 5], [2, 5, 7], [3, 5, 7]]), es = r.shuffle([r.pick([1, 3, 5]), r.pick([1, 3, 5]), r.pick([2, 4])]); return { ps: ps, es: es, n: fromExps(ps, es) }; }, function (v) { return v.n >= 1000 && v.n * multFor(v.n, 2) <= 5e6; }, { ps: [2, 3, 7], es: [3, 5, 2], n: 95256 });
          return multPart(v.n, 2, t(texE(v.ps, v.es)));
        } },
        { id: 'e2b', level: 'ADV', make: function (r) { var n = r.pick([540, 1350, 600, 1500, 2160]); return multPart(n, 2, t(F(n))); } },
        { id: 'e2c', level: 'PRG', make: function (r) { var n = r.pick([1176, 1512, 980, 1960, 2058, 392]); return multPart(n, 2, t(F(n))); } }] },
      { num: '3', stem: 'Now find the smallest whole number each must be multiplied by to give a perfect <b>cube</b>, and state the cube root of the result.', parts: [
        { id: 'e3a', level: 'PRG', make: function (r) {
          var v = find(r, function () { var ps = r.pick([[2, 3, 7], [2, 3, 5], [2, 5, 7]]), es = r.shuffle([3, r.pick([4, 5]), r.pick([1, 2])]); return { ps: ps, es: es, n: fromExps(ps, es) }; }, function (v) { return v.n * multFor(v.n, 3) <= 3e7; }, { ps: [2, 3, 7], es: [3, 5, 2], n: 95256 });
          return multPart(v.n, 3, t(texE(v.ps, v.es)));
        } },
        { id: 'e3b', level: 'MAS', make: function (r) { var n = r.pick([540, 1350, 600, 1500, 2160]); return multPart(n, 3, t(F(n))); } },
        { id: 'e3c', level: 'ADV', make: function (r) { var n = r.pick([2205, 1575, 2450, 980, 1100]); return multPart(n, 3, t(F(n))); } }] },
      { num: '4', stem: function (sh) { return 'Dividing works the same way — strip off just enough to leave the exponents where you need them.'; },
        shared: function (r) { var pq = r.pick([[2, 5], [2, 5], [2, 3], [3, 2], [2, 7], [5, 2], [3, 5]]); return { p: pq[0], q: pq[1], n: Math.pow(pq[0], 4) * Math.pow(pq[1], 3) }; },
        parts: [
          { id: 'e4a', level: 'PRG', make: function (r, sh) { return divPart(sh.n, 2); } },
          { id: 'e4b', level: 'PRG', make: function (r, sh) { return divPart(sh.n, 3); } },
          { id: 'e4c', level: 'MAS', make: function (r) {
            var n = r.pick([72, 108, 200, 48, 500, 98]), m = multFor(n, 6), s2 = multFor(n, 2), s3 = multFor(n, 3), N = n * m;
            return P.number('Find the smallest whole number ' + t(n) + ' must be <b>multiplied</b> by to give a number that is <i>both</i> a perfect square and a perfect cube.', m, function (v) {
              if (v === s2) return { code: 'made-square', hint: t(n + '\\times ' + v) + ' is a perfect square, but not a perfect cube. Both at once needs every exponent to be a multiple of ' + t('6') + '.' };
              if (v === s3) return { code: 'made-cube', hint: t(n + '\\times ' + v) + ' is a perfect cube, but not a perfect square. Both at once needs every exponent to be a multiple of ' + t('6') + '.' };
              if (v > 0 && v % 1 === 0 && intRoot(n * v, 6) != null) return { code: 'not-smallest', hint: 'That works, but it isn’t the smallest. Raise each exponent only to the next multiple of ' + t('6') + '.' };
              return null;
            }, t(n + '=' + K.fac(n)) + '. Square <b>and</b> cube means every exponent must be a multiple of ' + t('6') + '. ' + nt.factor(n).map(function (pe) { return t(pe[0] + '^{' + pe[1] + '}\\to ' + pe[0] + '^{6}') + ' needs ' + t(pe[0] + (6 - pe[1] > 1 ? '^{' + (6 - pe[1]) + '}' : '')); }).join('; ') + '.<br>Multiply by ' + t(eqv(m)) + ': ' + t(n + '\\times ' + F(m) + '=' + F(N) + '=' + K.fac(N)) + ' (square root ' + t(F(intRoot(N, 2))) + ', cube root ' + t(F(intRoot(N, 3))) + ').',
            ['For both a square and a cube, every exponent must be a multiple of what number?'], 'multiply to square and cube: ' + n, { before: t(n + '\\times') });
          } }] },
      { num: '5', section: 'Extra practice C — Reasoning with exponents', stem: 'Decide whether each statement is <b>always true</b> or <b>not always true</b>.', parts: [
        { id: 'e5', level: 'PRG', make: function (r) {
          var S = [
            { s: 'The product of two perfect squares is a perfect square.', a: true, w: 'Multiplying adds the exponents, and even + even = even: ' + t('4\\times 9=36=6^{2}') + '.' },
            { s: 'The product of two perfect cubes is a perfect cube.', a: true, w: 'Multiplying adds the exponents, and two multiples of ' + t('3') + ' add to a multiple of ' + t('3') + ': ' + t('8\\times 27=216=6^{3}') + '.' },
            { s: 'The sum of two perfect squares is a perfect square.', a: false, w: t('4+9=13') + ' is not a perfect square. Adding numbers doesn’t add their exponents.' },
            { s: 'The sum of two perfect cubes is a perfect cube.', a: false, w: t('1+8=9') + ' is not a perfect cube.' },
            { s: 'If ' + t('n') + ' is a perfect cube, then ' + t('8n') + ' is a perfect cube.', a: true, w: t('8=2^{3}') + ' adds ' + t('3') + ' to the exponent of ' + t('2') + ', which keeps it a multiple of ' + t('3') + '.' },
            { s: 'If ' + t('n') + ' is a perfect cube, then ' + t('27n') + ' is a perfect cube.', a: true, w: t('27=3^{3}') + ' adds ' + t('3') + ' to the exponent of ' + t('3') + ', which keeps it a multiple of ' + t('3') + '.' },
            { s: 'If ' + t('n') + ' is a perfect square, then ' + t('4n') + ' is a perfect square.', a: true, w: t('4=2^{2}') + ' adds ' + t('2') + ' to the exponent of ' + t('2') + ', which keeps it even.' },
            { s: 'If ' + t('n') + ' is a perfect square, then ' + t('2n') + ' is a perfect square.', a: false, w: 'The exponent of ' + t('2') + ' in ' + t('n') + ' is even, so in ' + t('2n') + ' it is odd: ' + t('n=9,\\ 2n=18') + '.' },
            { s: 'If ' + t('n') + ' is a perfect square, then ' + t('3n') + ' is a perfect square.', a: false, w: 'The exponent of ' + t('3') + ' becomes odd: ' + t('n=4,\\ 3n=12') + '.' },
            { s: 'If ' + t('n') + ' is a perfect cube, then ' + t('2n') + ' is a perfect cube.', a: false, w: 'The exponent of ' + t('2') + ' is no longer a multiple of ' + t('3') + ': ' + t('n=27,\\ 2n=54') + '.' }];
          var rows = find(r, function () { return r.sample(S, 4); }, function (v) { var k = v.filter(function (x) { return x.a; }).length; return k >= 1 && k <= 3; }, [S[0], S[2], S[4], S[7]]);
          var want = {}; rows.forEach(function (x, i) { want['r' + i] = x.a ? 'yes' : 'no'; });
          return P.grid('Always true, or not always true?', rows.map(function (x, i) { return { id: 'r' + i, html: x.s, label: 'statement ' + (i + 1) }; }),
            [{ id: 'yes', html: 'Always true', label: 'Always true' }, { id: 'no', html: 'Not always', label: 'Not always true' }], want,
            { tries: 2, count: false, why: function (row) { return { code: 'row', hint: rows[Number(row.slice(1))].w }; } },
            rows.map(function (x) { return x.s + ' <b>' + (x.a ? 'Always true.' : 'Not always true.') + '</b> ' + x.w; }).join('<br>'),
            ['Think about what happens to the <b>exponents</b>. For “not always”, one counterexample is enough.'], 'always true? squares and cubes');
        } }] },
      { num: '6', stem: function (sh) { return 'The number ' + t(sh.k) + ' is a perfect square.'; },
        shared: function (r) { return { k: r.pick([36, 36, 100, 4, 9, 196, 144, 225]) }; },
        parts: [
          { id: 'e6a', level: 'EMG', make: function (r, sh) {
            var k = sh.k, k3 = k * k * k;
            return P.fields('Write ' + t(k + '^{3}') + ' in exponent form, without multiplying it out.', [{ name: t(k + '^{3}'), before: t(k + '^{3}='), mode: 'math', wide: true }], [expChk(k3, null)], [plainFac(k3)], t(k + '^{3}=' + K.fac(k3)),
              t(k + '=' + K.fac(k)) + '. Cubing triples every exponent: ' + t(k + '^{3}=' + K.fac(k3)) + ' (' + t('=' + F(k3)) + ').', ['Write ' + t(k) + ' in exponent form, then triple every exponent.'], 'cube of a square: ' + k);
          } },
          { id: 'e6b', level: 'PRG', make: function (r, sh) {
            var k = sh.k, k3 = k * k * k, s = intRoot(k3, 2);
            var fl = [{ name: 'Square root', before: t('\\sqrt{' + k + '^{3}}='), mode: 'math' }, { name: 'Cube root', before: t('\\sqrt[3]{' + k + '^{3}}='), mode: 'math' }];
            return P.fields(t(k + '^{3}') + ' is both a perfect square and a perfect cube. State both roots.', fl, [valChk(s, rootDiag(k3, 2)), valChk(k, rootDiag(k3, 3))], [String(s), String(k)],
              t('\\sqrt{' + k + '^{3}}=' + F(s)) + ', ' + t('\\sqrt[3]{' + k + '^{3}}=' + k),
              t(k + '^{3}=' + K.fac(k3)) + ': every exponent is a multiple of ' + t('6') + ', so it is both.<br>Square root: halve the exponents, ' + t(HW.texFactors(nt.factor(s)) + '=' + F(s)) + '. Cube root: divide them by ' + t('3') + ', ' + t(HW.texFactors(nt.factor(k)) + '=' + k) + '.',
              ['Halve the exponents for the square root; divide them by ' + t('3') + ' for the cube root.'], 'roots of a sixth power');
          } },
          { id: 'e6c', level: 'PRG', make: function (r) {
            return P.mc(r, 'Why is the cube of <i>any</i> perfect square both a perfect square and a perfect cube?', [
              { html: 'A perfect square has only even exponents. Cubing multiplies each by ' + t('3') + ', and three times an even number is a multiple of ' + t('6') + '.', right: true },
              { html: 'Cubing adds ' + t('3') + ' to each exponent, so they become multiples of ' + t('3') + '.', why: 'Cubing <b>multiplies</b> each exponent by ' + t('3') + '; it doesn’t add ' + t('3') + '.' },
              { html: 'Every cube is also a square.', why: t('8=2^{3}') + ' is a cube but not a square.' },
              { html: 'A perfect square has exponents that are multiples of ' + t('6') + ' already.', why: t('4=2^{2}') + ': the exponent ' + t('2') + ' is even, not a multiple of ' + t('6') + '. It is the cubing that makes it a multiple of ' + t('6') + '.' }],
              'A perfect square has every exponent even. Cubing triples every exponent, and ' + t('3\\times') + ' an even number is a multiple of both ' + t('2') + ' and ' + t('3') + ' — a multiple of ' + t('6') + '. So the cube is both a square and a cube.',
              ['What does cubing do to each exponent? What kind of exponents does a perfect square have?'], 'cube of a square is both');
          } }] },
      { num: '7', section: 'Extra practice D — Multiple choice and numerical response', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: 'e7', level: 'ADV', make: function (r) {
          var v = find(r, function () { var es = [r.pick([4, 5]), r.pick([4, 5]), r.pick([1, 2])]; return { es: es, n: fromExps([2, 3, 5], es) }; }, function () { return true; }, { es: [5, 4, 1], n: 12960 });
          var es = v.es, n = v.n, d = divFor(n, 3), d2 = divFor(n, 2), part = Math.pow(2, es[0] % 3) * Math.pow(3, es[1] % 3), dbl = 2 * d;
          var opts = [d, part, d2, dbl].filter(function (x, i, a) { return a.indexOf(x) === i && x > 1; });
          var extra = [d * 3, d * 5, part * 2, d / 5].filter(function (x) { return x % 1 === 0 && x > 1 && opts.indexOf(x) < 0; });
          while (opts.length < 4 && extra.length) opts.push(extra.shift());
          var nTex = texE([2, 3, 5], es), why = function (x) {
            if (n % x) return t(F(x)) + ' doesn’t divide the number.';
            var w = n / x;
            return 'Dividing by ' + t(F(x)) + ' leaves ' + t(K.fac(w) + (w < 1e6 ? '=' + F(w) : '')) + (intRoot(w, 3) != null ? ', a cube — but you removed more than you had to.' : intRoot(w, 2) != null ? ', a perfect <b>square</b>, not a cube.' : ', which is not a perfect cube.');
          };
          return P.mc(r, 'The smallest whole number that ' + t(nTex) + ' must be <i>divided</i> by to leave a perfect cube is',
            sortN(opts).map(function (x) { return { html: t(F(x)), right: x === d, why: x === d ? null : why(x) }; }),
            'Lower each exponent to the multiple of ' + t('3') + ' just below it: ' + [2, 3, 5].map(function (p, i) { return t(p + '^{' + es[i] + '}\\to ' + p + '^{' + (es[i] - es[i] % 3) + '}'); }).join(', ') + '.<br>Divide by ' + t(eqv(d)) + ': the result is ' + t(K.fac(n / d) + '=' + F(n / d) + '=' + intRoot(n / d, 3) + '^{3}') + '.',
            ['For a cube, every exponent must be a multiple of ' + t('3') + '. How much of each prime must go?'], 'MC divide to a cube', true);
        } }] },
      { num: '8', stem: '<i>(Numerical Response)</i>', parts: [
        { id: 'e8', level: 'ADV', make: function (r) {
          var v = find(r, function () { var b = r.pick([2, 2, 3, 5]), pq = sortN(r.sample([3, 5, 7, 11, 13].filter(function (x) { return x !== b; }), 2)); return { b: b, p: pq[0], q: pq[1], n: b * b * b * pq[0] * pq[0] * pq[1] * pq[1] }; },
            function (v) { return v.n <= 99999 && v.p * v.q <= 999; }, { b: 2, p: 3, q: 7, n: 3528 });
          var n = v.n, m = v.p * v.q, N = n * m;
          return P.nr('The smallest whole number that ' + t(F(n)) + ' must be multiplied by to give a perfect cube is ________. (Record your answer as a three-digit number.)', m, function (x) {
            if (x === m * m) return { code: 'squared', hint: 'You need just <b>one</b> more of each prime with exponent ' + t('2') + ', to reach ' + t('3') + '.' };
            if (x === m * v.b) return { code: 'not-smallest', hint: t(v.b + '^{3}') + ' is already a cube — leave it alone.' };
            if (x > 0 && x % 1 === 0 && intRoot(n * x, 3) != null) return { code: 'not-smallest', hint: 'That makes a cube, but a smaller multiplier works. Raise each exponent only to the next multiple of ' + t('3') + '.' };
            if (x > 1 && m % x === 0) return { code: 'missed-prime', hint: 'Not quite: after multiplying by ' + t(x) + ', some exponent is still not a multiple of ' + t('3') + '. Check every prime.' };
            if (x > 0 && x % 1 === 0 && intRoot(n * x, 2) != null) return { code: 'made-square', hint: 'That makes a perfect <b>square</b>. For a cube, every exponent must be a multiple of ' + t('3') + '.' };
            return null;
          }, t(F(n) + '=' + K.fac(n)) + '. Raise each exponent to a multiple of ' + t('3') + ': ' + t(v.b + '^{3}') + ' is fine, ' + t(v.p + '^{2}\\to ' + v.p + '^{3}') + ' and ' + t(v.q + '^{2}\\to ' + v.q + '^{3}') + ' each need one more. Multiply by ' + t(v.p + '\\times ' + v.q + '=' + m) + ': ' + t(F(n) + '\\times ' + m + '=' + F(N) + '=' + intRoot(N, 3) + '^{3}') + '. Answer: ' + t((m < 100 ? '0' : '') + m),
          ['Factor ' + t(F(n)) + ' and look for exponents that aren’t multiples of ' + t('3') + '.'], 'NR cube multiplier ' + n);
        } }] }
    ]
  });

  /* ---------- part makers used by the extras ---------- */
  function sqCubePart(r, cond, pool, fallback, nPrimes) {
    var v = find(r, function () { var ps = sortN(r.sample([2, 3, 5, 7], nPrimes || 2)), es = ps.map(function () { return r.pick(pool); }); return { ps: ps, es: es }; },
      function (v) { return cond(v.es) && fromExps(v.ps, v.es) < 1e15; }, { ps: fallback.length === 3 ? [2, 3, 5] : fallback[0] === 9 ? [2, 5] : [2, 3], es: fallback });
    var ps = v.ps, es = v.es, nTex = texE(ps, es), sq = es.every(function (e) { return e % 2 === 0; }), cu = es.every(function (e) { return e % 3 === 0; });
    var sr = sq ? fromExps(ps, es.map(function (e) { return e / 2; })) : null, cr = cu ? fromExps(ps, es.map(function (e) { return e / 3; })) : null;
    var srTex = sq ? texE(ps, es.map(function (e) { return e / 2; })) : null, crTex = cu ? texE(ps, es.map(function (e) { return e / 3; })) : null;
    var d2 = function (val) { return cr != null && val === cr ? { code: 'used-cube-root', hint: 'That’s the <b>cube</b> root. For the square root, divide each exponent by ' + t('2') + '.' } : null; };
    var d3 = function (val) { return sr != null && val === sr ? { code: 'used-square-root', hint: 'That’s the <b>square</b> root. For the cube root, divide each exponent by ' + t('3') + '.' } : null; };
    var label = sq && cu ? 'both' : sq ? 'perfect square only' : cu ? 'perfect cube only' : 'neither';
    var p = P.fields(t(nTex), [{ name: 'Square root', label: 'Square root', mode: 'math', none: true, wide: true }, { name: 'Cube root', label: 'Cube root', mode: 'math', none: true, wide: true }],
      [rootOrNone(sr, 2, nTex, d2), rootOrNone(cr, 3, nTex, d3)], [sq ? srTex.replace(/\^\{(\d+)\}/g, '^$1').replace(/\\times /g, ' × ') : 'none', cu ? crTex.replace(/\^\{(\d+)\}/g, '^$1').replace(/\\times /g, ' × ') : 'none'],
      '<b>' + label.charAt(0).toUpperCase() + label.slice(1) + '</b>' + (sq ? '; square root ' + t(srTex + (sr < 1e7 ? '=' + F(sr) : '')) : '') + (cu ? '; cube root ' + t(crTex + (cr < 1e7 ? '=' + F(cr) : '')) : ''),
      'Exponents: ' + t(es.join(',\\ ')) + '.<br>' + (sq ? 'All even ⇒ perfect square; square root ' + t(srTex + (sr < 1e7 ? '=' + F(sr) : '')) + '.' : 'Not all even (' + t(es.filter(function (e) { return e % 2; })[0]) + ' is odd) ⇒ not a square.') + '<br>' + (cu ? 'All multiples of ' + t('3') + ' ⇒ perfect cube; cube root ' + t(crTex + (cr < 1e7 ? '=' + F(cr) : '')) + '.' : 'Not all multiples of ' + t('3') + ' (' + t(es.filter(function (e) { return e % 3; })[0]) + ') ⇒ not a cube.') + '<br><b>' + label.charAt(0).toUpperCase() + label.slice(1) + '</b>.',
      ['Square: is every exponent even? Cube: is every exponent a multiple of ' + t('3') + '?', 'To take a root, divide each exponent by ' + t('2') + ' (square) or ' + t('3') + ' (cube).'], 'square/cube from exponents: ' + label);
    p.bad = [[sq ? 'none' : '2', cu ? 'none' : '2'], [sq ? String(sr + 1) : 'none', cu ? String(cr + 1) : 'none']].filter(function (b) { return !(b[0] === p.key[0] && b[1] === p.key[1]); });
    if (sq && sr < 1e9) p.good = [[String(sr), p.key[1]]];
    return p;
  }
})(window);
