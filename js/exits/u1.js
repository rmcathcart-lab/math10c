/* Math 10C · Unit 1 (Number) — exit slips, one per lesson (u1l1x … u1l9x), written in test mode at the end of class.
 * Each slip has 2–4 short questions (about 5–8 minutes, no calculator, like the Unit 1 Test) on that day's main skills,
 * spread over the Beginning / Progressing / Mastery boxes so "highest level right per outcome" can tell students apart.
 * The questions are new (wording, contexts, structure) but test the same skills at the same difficulty as the lesson's
 * assignment; every part is a generator (each student gets their own numbers) with a key, a worked solution, hints and
 * typical wrong answers (codes u1x-…, labelled below, each with a partial-credit decision). Lesson 9 (the review) mixes
 * AN1 and AN2. */
(function (root) {
  'use strict';
  var HW = root.HW, nt = HW.nt, ex = HW.ex, F = HW.fmt, K = HW.kit, P = K.P, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form;

  HW.addCodes({
    'u1x-nonfactor': 'Listed a number that isn’t a factor', 'u1x-missing-1n': 'Left out 1 or the number itself', 'u1x-missing-pair': 'Left out the partner of a factor',
    'u1x-missing-factors': 'Left out several factors', 'u1x-composite': 'Left a composite number in a product of primes', 'u1x-prime-missing': 'Product of primes is missing a factor',
    'u1x-prime-extra': 'Product of primes has an extra factor', 'u1x-lead': 'Product of primes for a different number', 'u1x-self': 'Wrote a composite number as its own factorization',
    'u1x-nothing': 'No prime factors given', 'u1x-odd-once': 'Removed only one copy of the prime', 'u1x-odd-prime': 'Gave one prime instead of the largest such factor',
    'u1x-odd-all': 'Gave the number itself', 'u1x-gcf-lcm': 'Gave the LCM instead of the GCF', 'u1x-gcf-product': 'Multiplied the numbers for the GCF',
    'u1x-gcf-small': 'A common factor, but not the greatest', 'u1x-gcf-notcommon': 'Not a common factor', 'u1x-lcm-gcf': 'Gave the GCF instead of the LCM',
    'u1x-lcm-product': 'Multiplied the numbers for the LCM', 'u1x-lcm-big': 'A common multiple, but not the least', 'u1x-lcm-notmult': 'Not a common multiple',
    'u1x-tool': 'Chose the wrong tool (GCF vs LCM)', 'u1x-group-total': 'Gave a total instead of the size of each group', 'u1x-count-part': 'Counted only one of the two groups',
    'u1x-count-swap': 'Swapped the two counts', 'u1x-sqcube-one': 'One number misjudged (square / cube)', 'u1x-sqcube': 'Several numbers misjudged (square / cube)',
    'u1x-sq-one': 'Multiplied by only one of the missing primes', 'u1x-sq-square': 'Multiplied by a bigger number than needed', 'u1x-sq-all': 'Multiplied by every prime, not only the odd powers',
    'u1x-root-product': 'Gave the product instead of its root', 'u1x-only-square': 'Made only a perfect square (exponents even, not multiples of 6)', 'u1x-only-cube': 'Made only a perfect cube (exponents multiples of 3, not 6)',
    'u1x-roots-swap': 'Square root and cube root swapped', 'u1x-ratirr-one': 'One number misclassified (rational / irrational)', 'u1x-ratirr': 'Several numbers misclassified (rational / irrational)',
    'u1x-alg-nosub': 'Algebraic method: didn’t subtract the equations', 'u1x-alg-mult': 'Algebraic method: wrong powers of 10', 'u1x-alg-tails': 'Algebraic method: repeating tails don’t cancel',
    'u1x-alg-rhs': 'Algebraic method: subtraction slip', 'u1x-as-term': 'Treated a repeating decimal as terminating', 'u1x-bar-all': 'Treated the digits before the bar as repeating',
    'u1x-no-whole': 'Lost the whole-number part', 'u1x-sets-R': 'Left out R', 'u1x-est-place': 'Estimate off by a power of ten', 'u1x-est-square': 'Gave the perfect square instead of its root',
    'u1x-cond': 'Number doesn’t meet the condition', 'u1x-cond-range': 'Right kind of number, outside the range', 'u1x-root-div': 'Divided by the index instead of taking the root',
    'u1x-root-coef': 'Dropped the number in front of the root', 'u1x-rad-muldiv': 'Multiplied where the radicands divide', 'u1x-rad-add': 'Added or subtracted radicands', 'u1x-rad-nodiv': 'Didn’t divide by the radical in the denominator',
    'u1x-froot-coef': 'Forgot the number in front of the root', 'u1x-root-pm': 'Gave only the positive root of an even index', 'u1x-root-odd-pm': 'Gave ± for an odd index',
    'u1x-root-notreal': 'Gave a value for an even root of a negative', 'u1x-coef-forgot': 'Forgot to multiply by the number in front', 'u1x-coef-added': 'Added the numbers in front instead of multiplying',
    'u1x-diag-2d': 'Used only two of the three dimensions', 'u1x-diag-sum': 'Added lengths instead of using the Pythagorean theorem', 'u1x-var-exp': 'Didn’t divide a variable’s exponent by the index',
    'u1x-var-coef': 'Number part of the radical wrong', 'u1x-sq-perim': 'Perimeter: not four sides', 'u1x-sq-diag-side': 'Gave the side for the diagonal',
    'u1x-sq-half': 'Halved the area instead of taking its square root', 'u1x-root-index': 'Used the wrong index for the root', 'u1x-power-index': 'Squared the number in front instead of raising it to the index'
  });
  HW.addPartial({
    'u1x-nonfactor': 'b', 'u1x-missing-1n': 's', 'u1x-missing-pair': 's', 'u1x-missing-factors': 'b', 'u1x-composite': 'b', 'u1x-prime-missing': 's', 'u1x-prime-extra': 's',
    'u1x-lead': 'n', 'u1x-self': 'n', 'u1x-nothing': 'n', 'u1x-odd-once': 'b', 'u1x-odd-prime': 'n', 'u1x-odd-all': 'n', 'u1x-gcf-lcm': 'n', 'u1x-gcf-product': 'n',
    'u1x-gcf-small': 'b', 'u1x-gcf-notcommon': 'n', 'u1x-lcm-gcf': 'n', 'u1x-lcm-product': 'b', 'u1x-lcm-big': 'b', 'u1x-lcm-notmult': 'n', 'u1x-tool': 'n',
    'u1x-group-total': 'n', 'u1x-count-part': 's', 'u1x-count-swap': 's', 'u1x-sqcube-one': 's', 'u1x-sqcube': 'n', 'u1x-sq-one': 'b', 'u1x-sq-square': 'b', 'u1x-sq-all': 'b',
    'u1x-root-product': 'b', 'u1x-only-square': 'b', 'u1x-only-cube': 'b', 'u1x-roots-swap': 's', 'u1x-ratirr-one': 's', 'u1x-ratirr': 'n', 'u1x-alg-nosub': 'n',
    'u1x-alg-mult': 'b', 'u1x-alg-tails': 'b', 'u1x-alg-rhs': 's', 'u1x-as-term': 'n', 'u1x-bar-all': 'b', 'u1x-no-whole': 's', 'u1x-sets-R': 's', 'u1x-est-place': 'b',
    'u1x-est-square': 'n', 'u1x-cond': 'n', 'u1x-cond-range': 'b', 'u1x-root-div': 'n', 'u1x-root-coef': 's', 'u1x-rad-muldiv': 'b', 'u1x-rad-nodiv': 'b', 'u1x-rad-add': 'n', 'u1x-froot-coef': 's',
    'u1x-root-pm': 'b', 'u1x-root-odd-pm': 'b', 'u1x-root-notreal': 'n', 'u1x-coef-forgot': 'b', 'u1x-coef-added': 'b', 'u1x-diag-2d': 'b', 'u1x-diag-sum': 'n',
    'u1x-var-exp': 'b', 'u1x-var-coef': 'b', 'u1x-sq-perim': 's', 'u1x-sq-diag-side': 'n', 'u1x-sq-half': 'n', 'u1x-root-index': 'b', 'u1x-power-index': 'b'
  });

  /* ---------- number helpers ---------- */
  function gcd(a, b) { return ex.gcd(a, b); }
  function lcm(a, b) { return a / gcd(a, b) * b; }
  function prodOf(a) { return a.reduce(function (m, x) { return m * x; }, 1); }
  function sortN(a) { return a.slice().sort(function (x, y) { return x - y; }); }
  function fVal(f) { return f.reduce(function (m, pe) { return m * Math.pow(pe[0], pe[1]); }, 1); }
  function fTex(f) { var g = f.filter(function (pe) { return pe[1] > 0; }); return g.length ? HW.texFactors(g) : '1'; }
  function plainFac(n) { return nt.factor(n).map(function (pe) { return pe[1] > 1 ? pe[0] + '^' + pe[1] : String(pe[0]); }).join(' × '); }
  function facEq(n) { return nt.isPrime(n) ? t(F(n)) + ' (prime)' : t(F(n) + '=' + K.fac(n)); }
  function find(gen, test, fallback) { for (var i = 0; i < 1500; i++) { var v = gen(); if (v != null && test(v)) return v; } return fallback; }
  function isPow(v, n) { if (v < 0) return false; var c = Math.round(Math.pow(v, 1 / n)); for (var d = Math.max(0, c - 1); d <= c + 1; d++) if (Math.pow(d, n) === v) return true; return false; }
  function intRoot(v, n) { var c = Math.round(Math.pow(v, 1 / n)); for (var d = Math.max(0, c - 1); d <= c + 1; d++) if (Math.pow(d, n) === v) return d; return null; }
  function nlist(nums) { var s = nums.map(function (n) { return t(F(n)); }); return s.length === 2 ? s[0] + ' and ' + s[1] : s.slice(0, -1).join(', ') + ' and ' + s[s.length - 1]; }
  function rad(k, n, m) { return ex.texRadical([k, 1], n, m); }
  function rt(n, inner) { return ex.texRoot(n, inner); }
  function rootWord(n) { return n === 2 ? 'square' : n === 3 ? 'cube' : n === 4 ? 'fourth' : n === 5 ? 'fifth' : n + 'th'; }
  function powWord(n) { return n === 2 ? 'square' : n === 3 ? 'cube' : n === 4 ? 'fourth power' : n + 'th power'; }
  function normX(s) { return String(s == null ? '' : s).replace(/(\d)\s*[xX]\s*(?=\d)/g, '$1*'); }
  function frT(p, q) { var r = ex.norm(p, q); return ex.texRat(r); }

  /* ---------- checkers ---------- */
  /* rename a checker's wrong-answer codes (shared codes → this file's labelled ones) */
  function rc(check, map) { return function (resp) { var res = check(resp); if (res && res.v === 'wrong' && map[res.code]) return { v: 'wrong', code: map[res.code], hint: res.hint }; return res; }; }
  var PROD_MAP = { composite: 'u1x-composite', missing: 'u1x-prime-missing', extra: 'u1x-prime-extra', lead: 'u1x-lead', self: 'u1x-self', nothing: 'u1x-nothing' };
  var LIST_MAP = { nonfactor: 'u1x-nonfactor', 'missing-1n': 'u1x-missing-1n', 'missing-partner': 'u1x-missing-pair', missing: 'u1x-missing-factors' };
  /* n as a product of primes (exp: 'either' | 'required'); a bare number equal to n is a format slip */
  function prodChk(n, exp, alts) {
    var c = rc(K.product(n, exp || 'either'), PROD_MAP);
    return function (resp) {
      var s = normX(resp), pn = HW.parse.number(s), pp = HW.parse.product(s), v = pn.ok ? pn.value : pp.ok ? pp.value : null;
      if (pn.ok && pn.value === n && !nt.isPrime(n)) return form('as-number', 'Right value — now write it as a product of prime factors' + (exp === 'required' ? ' in exponent form' : '') + ', like ' + t('2^{3}\\times 3') + '.');
      if (v != null && v !== n) for (var i = 0; i < (alts || []).length; i++) if (v === alts[i].v) return wrong(alts[i].code, alts[i].hint);
      return c(s);
    };
  }
  function numChk(n, alts, extra) {
    return K.number(n, function (v) {
      for (var i = 0; i < (alts || []).length; i++) if (v === alts[i].v && v !== n) return { code: alts[i].code, hint: alts[i].hint };
      return extra ? extra(v) : null;
    });
  }
  /* a whole number, typed as a number or as a product of primes */
  function valChk(target, alts) {
    return function (resp) {
      var s = normX(resp), pn = HW.parse.number(s), v = null;
      if (pn.ok) v = pn.value; else { var p = HW.parse.product(s); if (p.ok) v = p.value; else return form(pn.code === 'empty' ? 'empty' : 'notnumber', pn.code === 'empty' ? 'Type your answer first.' : 'Type a whole number (or a product such as ' + t('2^{2}\\times 3') + ').'); }
      if (v === target) return ok();
      for (var i = 0; i < (alts || []).length; i++) if (v === alts[i].v) return wrong(alts[i].code, alts[i].hint);
      return wrong('value', null);
    };
  }
  function gcfDiag(nums) {
    var g = nums.reduce(gcd), L = nums.reduce(lcm), pr = prodOf(nums), mn = Math.min.apply(null, nums);
    return function (v) {
      if (v === L && L !== g) return { code: 'u1x-gcf-lcm', hint: 'That’s the <b>least common multiple</b>. The GCF divides <b>into</b> every number, so it can’t be bigger than ' + t(F(mn)) + '.' };
      if (v === pr && pr !== g) return { code: 'u1x-gcf-product', hint: 'Multiplying the numbers gives a common <b>multiple</b>, not a common factor.' };
      if (!(v > 0) || v % 1) return null;
      var miss = nums.filter(function (n) { return n % v; });
      if (!miss.length) return { code: 'u1x-gcf-small', hint: t(F(v)) + ' divides into every number, but it isn’t the <b>greatest</b> common factor. Use every shared prime, to its lowest power.' };
      return { code: 'u1x-gcf-notcommon', hint: t(F(v)) + ' doesn’t divide evenly into ' + t(F(miss[0])) + ', so it isn’t a common factor.' };
    };
  }
  function lcmDiag(nums) {
    var g = nums.reduce(gcd), L = nums.reduce(lcm), pr = prodOf(nums), mx = Math.max.apply(null, nums);
    return function (v) {
      if (v === g && g !== L) return { code: 'u1x-lcm-gcf', hint: 'That’s the <b>greatest common factor</b>. The LCM is a common <b>multiple</b>: every number divides into it, so it is at least ' + t(F(mx)) + '.' };
      if (v === pr && pr !== L) return { code: 'u1x-lcm-product', hint: 'Multiplying the numbers gives <i>a</i> common multiple, but not the <b>least</b> one: the shared prime factors got counted twice.' };
      if (!(v > 0) || v % 1) return null;
      var miss = nums.filter(function (n) { return v % n; });
      if (!miss.length) return { code: 'u1x-lcm-big', hint: t(F(v)) + ' is a common multiple, but not the <b>least</b> one. Use each prime once, at its highest power.' };
      return { code: 'u1x-lcm-notmult', hint: t(F(miss[0])) + ' doesn’t divide evenly into ' + t(F(v)) + ', so it isn’t a common multiple.' };
    };
  }
  /* the k-th root as a whole number (or a product), or "none" */
  function isNo(s) { return /^(no|none|nope|not|neither|n\/a|-+|—)(\s.*|\.)?$/.test(s); }
  function rootOrNone(root, k, nTex, alts) {
    var word = rootWord(k), vc = root != null ? valChk(root, alts) : null, test = k === 2 ? 'even' : 'a multiple of ' + t('3');
    return function (resp) {
      var s = String(resp == null ? '' : resp).trim().toLowerCase();
      if (!s) return form('empty', 'Type the ' + word + ' root, or <b>none</b> if it is not a perfect ' + word + '.');
      if (isNo(s)) return root == null ? ok() : wrong('u1x-sqcube-one', 'Look at the exponents in the prime factorization: are they all ' + test + '? Then ' + t(nTex) + ' <b>is</b> a perfect ' + word + '.');
      if (root == null) {
        var s2 = normX(s), pn = HW.parse.number(s2), pp = HW.parse.product(s2);
        if (!pn.ok && !pp.ok) return form('notnumber', 'Type a number, or <b>none</b>.');
        return wrong('u1x-sqcube-one', 'Look at the exponents in the prime factorization: are they all ' + test + '? If not, there is no whole-number ' + word + ' root — type <b>none</b>.');
      }
      return vc(s);
    };
  }
  /* "GCF" or "LCM" typed in a box */
  function toolChk(want, why) {
    return function (resp) {
      var s = String(resp == null ? '' : resp).trim().toLowerCase().replace(/[^a-z ]/g, '').replace(/\s+/g, ' ');
      if (!s) return form('empty', 'Type <b>GCF</b> or <b>LCM</b>.');
      var isG = /^(the )?(gcf|gcd|hcf|greatest common (factor|divisor))$/.test(s), isL = /^(the )?(lcm|least common multiple|lowest common multiple)$/.test(s);
      if (!isG && !isL) return form('tool-format', 'Type <b>GCF</b> or <b>LCM</b>.');
      return (want === 'GCF' ? isG : isL) ? ok() : wrong('u1x-tool', why);
    };
  }
  /* a table of choices, scored on how many rows are wrong (one row = small slip) */
  function gridChk(want, why, oneCode, manyCode) {
    var base = K.grid(want, { allowBlank: true });
    return function (resp) {
      var res = base(resp); if (res.v !== 'wrong') return res;
      resp = resp || {};
      var bad = Object.keys(want).filter(function (r) { var g = resp[r], w = want[r]; if (Array.isArray(w)) return (g || []).slice().sort().join('|') !== w.slice().sort().join('|'); return g !== w; });
      var h = why(bad[0], resp[bad[0]]);
      return wrong(bad.length === 1 ? oneCode : manyCode, (bad.length > 1 ? bad.length + ' rows aren’t right yet. ' : '') + h);
    };
  }
  /* equivalence with known wrong answers: list [[tex, code, hint]], vars = letters */
  function knownDiag(list, vars) {
    var L = list.map(function (k) { var p = ex.parse(k[0]); if (!p.ok) throw new Error('bad known tex ' + k[0]); return { ast: p.ast, code: k[1], hint: k[2] }; });
    return function (ast) { for (var i = 0; i < L.length; i++) if (ex.equiv(ast, L[i].ast, vars, 6)) return { code: L[i].code, hint: L[i].hint }; return null; };
  }

  /* ---------- radicals ---------- */
  function radPool(n, kr, lo, hi) { var o = []; for (var k = kr[0]; k <= kr[1]; k++) for (var m = 2; m <= 15; m++) { var N = Math.pow(k, n) * m; if (ex.simplest(m, n) && N >= lo && N <= hi) o.push([k, m]); } return o; }
  var BEG_RAD = radPool(2, [2, 7], 8, 100);
  function mixedSol(k, n, m) { var big = Math.pow(k, n); return t(rt(n, F(big * m)) + '=' + rt(n, big + '\\times ' + m) + '=' + rt(n, big) + '\\times ' + rt(n, m) + '=' + rad(k, n, m)) + (n > 2 ? ' (' + t(k + '^{' + n + '}=' + big) + ')' : '') + '. ' + t(m) + ' has no perfect ' + powWord(n) + ' factor left, so this is simplest form.'; }
  function mixedPart(k, n, m, prompt) {
    var p = P.radical(prompt || 'Write ' + t(rt(n, F(Math.pow(k, n) * m))) + ' as a mixed radical in simplest form.', { k: k, n: n, m: m }, 'mixed', mixedSol(k, n, m),
      ['Find the <b>largest</b> perfect ' + powWord(n) + ' that divides ' + t(F(Math.pow(k, n) * m)) + (n === 2 ? ' (4, 9, 16, 25, 36, 49, …)' : n === 3 ? ' (8, 27, 64, 125, …)' : ' (16, 81, 256, …)') + '.', 'Its ' + rootWord(n) + ' root comes out in front of the radical.'], 'mixed radical: ' + rootWord(n) + ' root of ' + Math.pow(k, n) * m);
    var N = Math.pow(k, n) * m, sm = []; for (var d = 2; d < k; d++) if (k % d === 0) sm.push(d); // a smaller perfect power that also divides
    p.bad = [String(Math.pow(k, n)) + rt(n, String(m)), rt(n, String(N))];
    if (sm.length) p.bad.push(sm[0] + rt(n, String(N / Math.pow(sm[0], n))));
    return p;
  }
  function entireSol(k, n, m) { var a = Math.abs(k), neg = k < 0; return t(rad(k, n, m) + '=' + rt(n, (neg ? '(-' + a + ')' : a) + '^{' + n + '}\\times ' + m) + '=' + rt(n, (neg ? '-' : '') + Math.pow(a, n) + '\\times ' + m) + '=' + rt(n, (neg ? '-' : '') + F(Math.pow(a, n) * m))) + '.' + (n === 3 ? ' With index ' + t('3') + ', the number in front is <b>cubed</b>' + (neg ? ', and a negative cubed stays negative.' : '.') : n === 4 ? ' With index ' + t('4') + ', the number in front is raised to the <b>fourth power</b>.' : ''); }
  function entirePart(k, n, m, prompt) {
    var p = P.radical(prompt || 'Write ' + t(rad(k, n, m)) + ' as an entire radical.', { k: k, n: n, m: m }, 'entire', entireSol(k, n, m),
      ['Write the number in front as a ' + rootWord(n) + ' root: ' + t(Math.abs(k) + '=' + rt(n, Math.pow(Math.abs(k), n))) + '.', 'Then multiply the numbers under one radical.'], 'entire radical: ' + k + ' root' + n + ' of ' + m,
      { diag: function (val, rr) { if (n > 2 && rr && rr.n === n && Math.abs(rr.k[0]) === 1 && rr.k[1] === 1 && rr.m === k * k * m) return { code: 'u1x-power-index', hint: 'With index ' + t(n) + ', the number in front must be raised to the power ' + t(n) + ' (not squared) before it moves inside: ' + t(Math.abs(k) + '=' + rt(n, Math.pow(Math.abs(k), n))) + '.' }; return null; } });
    var a = Math.abs(k), s = k < 0 ? '-' : '';
    p.bad = [rt(n, s + String(a * m)), rt(n, s + String(Math.pow(a, n) + m))];
    if (n > 2) p.bad.push(rt(n, s + String(a * a * m)));
    return p;
  }

  /* ---------- figure: a rectangular box with its two diagonals ---------- */
  function boxSvg(a, b, c) {
    var W = 150, D = 60, H = 90, x0 = 30, y0 = 140, dx = D * 0.8, dy = -D * 0.5;
    function P2(x, y) { return x.toFixed(1) + ' ' + y.toFixed(1); }
    var A = [x0, y0], B = [x0 + W, y0], C = [x0 + W + dx, y0 + dy], Dd = [x0 + dx, y0 + dy];
    var A2 = [A[0], A[1] - H], B2 = [B[0], B[1] - H], C2 = [C[0], C[1] - H], D2 = [Dd[0], Dd[1] - H];
    var s = '<path d="M' + P2(A[0], A[1]) + ' L' + P2(B[0], B[1]) + ' L' + P2(C[0], C[1]) + ' L' + P2(C2[0], C2[1]) + ' L' + P2(D2[0], D2[1]) + ' L' + P2(A2[0], A2[1]) + ' Z"/>' +
      '<path d="M' + P2(A2[0], A2[1]) + ' L' + P2(B2[0], B2[1]) + ' L' + P2(C2[0], C2[1]) + ' M' + P2(B2[0], B2[1]) + ' L' + P2(B[0], B[1]) + '"/>' +
      '<path stroke-dasharray="4 3" stroke-width="1.1" d="M' + P2(A[0], A[1]) + ' L' + P2(Dd[0], Dd[1]) + ' L' + P2(C[0], C[1]) + ' M' + P2(Dd[0], Dd[1]) + ' L' + P2(D2[0], D2[1]) + '"/>' +
      '<line x1="' + A[0] + '" y1="' + A[1] + '" x2="' + C[0].toFixed(1) + '" y2="' + C[1].toFixed(1) + '" stroke="#c0392b" stroke-width="1.8" stroke-dasharray="7 4"/>' +
      '<line x1="' + A[0] + '" y1="' + A[1] + '" x2="' + C2[0].toFixed(1) + '" y2="' + C2[1].toFixed(1) + '" stroke="#1f6fb2" stroke-width="2"/>';
    function lab(x, y, str, col) { return '<text x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" fill="' + (col || 'currentColor') + '" stroke="none" text-anchor="middle" dominant-baseline="central" font-size="15">' + str + '</text>'; }
    s += lab((A[0] + B[0]) / 2, A[1] + 14, a + ' cm') + lab(B[0] + dx / 2 + 26, B[1] + dy / 2 + 6, b + ' cm') + lab(C[0] + 30, (C[1] + C2[1]) / 2, c + ' cm') +
      lab((A[0] + C[0]) / 2 + 12, (A[1] + C[1]) / 2 + 9, 'd', '#c0392b') + lab(x0 + W * 0.52, y0 - H * 0.62, 'L', '#1f6fb2');
    return '<div style="margin:.4em 0 .2em"><svg viewBox="0 0 ' + (x0 + W + dx + 70) + ' ' + (y0 + 26) + '" width="100%" style="max-width:300px;display:block" role="img" aria-label="a rectangular box ' + a + ' by ' + b + ' by ' + c + ' centimetres with the bottom diagonal d and the long diagonal L" fill="none" stroke="currentColor" stroke-width="1.5" font-family="KaTeX_Main,\'Times New Roman\',serif" font-style="italic">' + s + '</svg></div>';
  }

  /* ---------- reading a typed real number exactly (Lesson 5) ---------- */
  function swapPi(a) {
    if (!a || typeof a !== 'object') return a;
    if (a.t === 'pi') return { t: 'var', n: '#pi' };
    var o = {}; Object.keys(a).forEach(function (k) { o[k] = (k === 'a' || k === 'b' || k === 'n') ? swapPi(a[k]) : a[k]; }); return o;
  }
  function readReal(resp) {
    var a = K.read(resp); if (a.res) return a;
    var sh = ex.shape(a.ast), vars = Object.keys(sh.vars);
    if (vars.some(function (v) { return v !== 'e'; })) return { res: form('variable', 'Give a number — no letters other than ' + t('\\pi') + '.') };
    if (sh.ell) return { res: form('dots-exact', 'A decimal ending in “…” could be anything. Give an exact number, like ' + t('\\frac{3}{7}') + ' or ' + t('\\sqrt{2}') + '.') };
    var b = swapPi(a.ast), v1 = ex.value(b, { '#pi': Math.PI, e: Math.E }), v2 = ex.value(b, { '#pi': 3.3, e: 2.9 });
    if (!isFinite(v1)) return { res: wrong('u1x-cond', 'That doesn’t have a real value (for example, the square root of a negative number).') };
    if ((vars.length || sh.pi) && Math.abs(v1 - v2) > 1e-9) return { v: v1, rational: false };
    var r = ex.rat(a.ast); if (r) return { v: r[0] / r[1], rational: true, p: r[0], q: r[1], dec: sh.decimals > 0 && !sh.rep };
    for (var q = 1; q <= 1000; q++) { var p = Math.round(v1 * q); if (Math.abs(v1 * q - p) < 1e-13 * q * Math.max(1, Math.abs(v1))) { var g = gcd(Math.abs(p), q) || 1; return { v: p / q, rational: true, p: p / g, q: q / g }; } }
    return { v: v1, rational: false };
  }

  /* ---------- Lesson 5: sets ---------- */
  var SET_COLS = [{ id: 'N', html: t('N'), label: 'N' }, { id: 'W', html: t('W'), label: 'W' }, { id: 'I', html: t('I'), label: 'I' }, { id: 'Q', html: t('Q'), label: 'Q' }, { id: 'Qb', html: t('\\overline{Q}'), label: 'Q-bar' }, { id: 'R', html: t('R'), label: 'R' }];
  var SETS = { nat: ['N', 'W', 'I', 'Q', 'R'], zero: ['W', 'I', 'Q', 'R'], negint: ['I', 'Q', 'R'], frac: ['Q', 'R'], irr: ['Qb', 'R'] };
  var SET_TEX = { N: 'N', W: 'W', I: 'I', Q: 'Q', Qb: '\\overline{Q}', R: 'R' };
  function setHint(c, got) {
    got = got || []; var has = function (x) { return got.indexOf(x) >= 0; }, X = t(c.tex), why = c.note ? ' (' + t(c.note) + ')' : '';
    if (has('Q') && has('Qb')) return { code: 'sets-both', hint: 'A number is rational <b>or</b> irrational, never both. Decide which one ' + X + ' is.' };
    if (c.cls === 'irr' && !has('Qb')) return { code: 'sets-irr', hint: X + ' is irrational' + why + ': its decimal never ends and never repeats.' };
    if (c.cls !== 'irr' && has('Qb')) return { code: 'sets-rat', hint: X + ' is rational' + why + ': it can be written as a fraction of integers.' };
    if (c.cls === 'irr' && (has('N') || has('W') || has('I') || has('Q'))) return { code: 'sets-irr-int', hint: 'An irrational number is only in ' + t('\\overline{Q}') + ' and ' + t('R') + ': ' + t('N') + ', ' + t('W') + ', ' + t('I') + ' and ' + t('Q') + ' hold only rational numbers.' };
    if (c.cls === 'zero' && has('N')) return { code: 'sets-zero-N', hint: t('0') + ' is a whole number, but the natural numbers start at ' + t('1') + '.' };
    if (c.cls === 'negint' && (has('N') || has('W'))) return { code: 'sets-neg', hint: X + why + ' is negative. Natural and whole numbers are never negative.' };
    if (c.cls === 'frac' && (has('N') || has('W') || has('I'))) return { code: 'sets-frac', hint: X + why + ' is not an integer, so it isn’t in ' + t('N') + ', ' + t('W') + ' or ' + t('I') + '.' };
    if (c.cls !== 'irr' && !has('Q')) return { code: 'sets-Q', hint: X + why + ' can be written as a fraction of integers, so it is rational.' };
    if (c.cls === 'nat' && !(has('N') && has('W') && has('I'))) return { code: 'sets-nat', hint: X + why + ' is a natural (counting) number, so it is also a whole number and an integer.' };
    if (c.cls === 'negint' && !has('I')) return { code: 'sets-negint', hint: X + why + ' is a negative integer.' };
    if (!has('R')) return { code: 'u1x-sets-R', hint: 'Every one of these numbers is a <b>real</b> number, so tick ' + t('R') + ' too.' };
    return null;
  }

  /* ---------- Lesson 4: the algebraic method for I.lead(block) ---------- */
  function repInfo(I, lead, block) {
    var L = lead.length, B = block.length, x = ex.repRat(I + '.' + lead, block);
    var hi = Math.pow(10, L + B), lo = Math.pow(10, L), c = hi - lo, n = Number(String(I) + lead + block) - Number(String(I) + lead);
    return { I: I, lead: lead, block: block, L: L, B: B, x: x, hi: hi, lo: lo, c: c, n: n, g: gcd(n, c), tex: I + '.' + lead + '\\overline{' + block + '}' };
  }
  function shiftTex(R, k) { return F(Number(String(R.I) + R.lead + (k === R.hi ? R.block : ''))) + '.\\overline{' + R.block + '}'; }
  function algebraPart(R) {
    var X = R.x, labels = ['After subtracting', 'Right side', 'Answer'];
    var trunc = ex.norm(Number(String(R.I) + R.lead + R.block), Math.pow(10, R.L + R.B)), whole = R.lead ? ex.repRat(R.I + '.', R.lead + R.block) : null, noInt = R.I ? [X[0] - R.I * X[1], X[1]] : null;
    var fr = K.fraction(X, { diag: function (v) {
      if (ex.eq(v, trunc[0] / trunc[1])) return { code: 'u1x-as-term', hint: 'That fraction is the <b>terminating</b> decimal ' + t(String(trunc[0] / trunc[1])) + '. The bar means the block repeats forever.' };
      if (whole && ex.eq(v, whole[0] / whole[1])) return { code: 'u1x-bar-all', hint: 'Only the digits under the bar repeat. The digit ' + t(R.lead) + ' comes once.' };
      if (noInt && ex.eq(v, noInt[0] / noInt[1])) return { code: 'u1x-no-whole', hint: 'Don’t forget the whole-number part ' + t(R.I) + '.' };
      return null;
    } });
    function num(s) { var a = K.read(s); if (a.res) return null; return ex.rat(a.ast); }
    var check = function (resp) {
      resp = resp || [];
      var filled = [0, 1, 2].filter(function (i) { return resp[i] != null && String(resp[i]).trim() !== ''; });
      if (!filled.length) return form('empty', 'Fill in the boxes: the equation you get after subtracting, then the fraction.');
      if (filled.length < 3) return form('incomplete', 'Fill in all three boxes (the number in front of ' + t('x') + ', the right side, and the fraction).');
      var cp = HW.parse.number(resp[0]);
      if (!cp.ok || cp.value <= 0 || cp.value % 1) return form('coef', '<b>' + labels[0] + ':</b> the first box is the whole number in front of ' + t('x') + ' after you subtract, e.g. ' + t('90') + '.');
      var c = cp.value, n = num(resp[1]);
      if (!n) return form('rhs', '<b>' + labels[1] + ':</b> type the number on the right side of the equation.');
      if (!/^9+0*$/.test(String(c))) {
        if (/^10*$/.test(String(c))) return wrong('u1x-alg-nosub', '<b>' + labels[0] + ':</b> subtract the two equations so the repeating tails cancel. The number in front of ' + t('x') + ' will look like ' + t('99') + ' or ' + t('990') + '.');
        return wrong('u1x-alg-mult', '<b>' + labels[0] + ':</b> after subtracting, the number in front of ' + t('x') + ' is one power of ' + t('10') + ' minus another, like ' + t('99') + ' or ' + t('990') + '.');
      }
      if (n[0] * X[1] !== c * X[0] * n[1]) {
        if ((c * X[0]) % X[1] !== 0) return wrong('u1x-alg-tails', '<b>' + labels[1] + ':</b> with that subtraction the repeating tails don’t line up, so they don’t cancel. Use one multiplier that moves the block left of the point and one that puts it just right of the point.');
        return wrong('u1x-alg-rhs', '<b>' + labels[1] + ':</b> check your subtraction. Line up the two equations — the repeating tails cancel, leaving a whole number.');
      }
      var res = fr(resp[2]);
      if (res.v !== 'correct') return { v: res.v, code: res.code, hint: '<b>' + labels[2] + ':</b> ' + (res.hint || 'Divide both sides by ' + t(F(c)) + ' and reduce.') };
      return ok();
    };
    var key = [String(R.c), String(R.n), X[0] + '/' + X[1]];
    var sol = 'Let ' + t('x=' + R.tex) + '. The block ' + t(R.block) + ' has ' + R.B + ' digits and ' + R.L + ' digit comes before it.<br>' +
      t(F(R.hi) + 'x=' + shiftTex(R, R.hi)) + ' (block left of the point)<br>' + t(F(R.lo) + 'x=' + shiftTex(R, R.lo)) + ' (block just right of the point)<br>' +
      'Subtract: ' + t(F(R.c) + 'x=' + F(R.n)) + ', so ' + t('x=\\frac{' + F(R.n) + '}{' + F(R.c) + '}' + (R.g > 1 ? '=' + ex.texRat(X) : '')) + (R.g > 1 ? ' (divide the top and bottom by ' + t(R.g) + ').' : '.');
    return { prompt: 'Use the algebraic method (no calculator) to write ' + t(R.tex) + ' as an improper fraction in simplest form. Fill in the equation you get after subtracting, then the fraction.',
      input: { type: 'fields', fields: [{ label: 'Subtract:', after: t('x'), name: labels[0] }, { before: t('='), name: labels[1], wide: true, mode: 'text' }, { label: 'So', before: t('x='), wide: true, name: labels[2], mode: 'math', keys: 'fraction' }] },
      check: check, key: key, answer: t(F(R.c) + 'x=' + F(R.n)) + ', so ' + t('x=' + ex.texRat(X)), solution: sol,
      bad: [[String(R.c), String(R.n + 1), key[2]], [String(R.hi), String(R.n), key[2]], [String(Math.pow(10, R.B) - 1), String(Number(R.lead + R.block)), key[2]], [key[0], key[1], trunc[0] + '/' + trunc[1]]].filter(function (b) { return b.join('|') !== key.join('|'); }),
      hints: ['Write ' + t('x=' + R.tex) + '. Multiply by ' + t(F(R.hi)) + ' to move the whole block left of the point, and by ' + t(R.lo) + ' to put the block just right of the point. Subtract.', 'Type the fraction like ' + t('11/15') + ' and reduce it to lowest terms.'],
      text: 'algebraic method ' + R.tex };
  }

  /* ---------- Lesson 6: all real roots ---------- */
  function parseRoots(resp) {
    var s = String(resp == null ? '' : resp).trim().replace(/−/g, '-').replace(/\\pm|±|\+\s*\/?\s*-/g, '±').replace(/\\left|\\right|\\,|\$/g, '');
    if (!s) return { empty: true };
    if (/^(none|no( real)?( roots?| solutions?| numbers?)?|not real|no solution|∅|\{\s*\})\.?$/i.test(s)) return { vals: [] };
    var toks = s.split(/\s*(?:,|;|\band\b|\bor\b)\s*/i).filter(function (x) { return x !== ''; }), vals = [];
    for (var i = 0; i < toks.length; i++) {
      var tk = toks[i].replace(/^x\s*=\s*/i, ''), pm = /^±/.test(tk); if (pm) tk = tk.replace(/^±\s*/, '');
      var a = K.read(tk); if (a.res || !isFinite(a.val)) return { bad: true };
      vals.push(a.val); if (pm) vals.push(-a.val);
    }
    return { vals: vals };
  }
  function rootsChk(want, even, negRad) {
    return function (resp) {
      var p = parseRoots(resp);
      if (p.empty) return form('empty', 'Type the roots, separated by commas (for example ' + t('3, -3') + ' or ' + t('\\pm 3') + '), or <b>none</b>.');
      if (p.bad) return form('roots-format', 'Type each root as a number or fraction, separated by commas (or use ±), or type <b>none</b>.');
      var got = p.vals.filter(function (v, i) { return p.vals.findIndex(function (w) { return ex.eq(v, w, 1e-9); }) === i; });
      var same = got.length === want.length && want.every(function (w) { return got.some(function (v) { return ex.eq(v, w, 1e-9); }); });
      if (same) return ok();
      if (negRad && even && got.length) return wrong('u1x-root-notreal', 'No real number raised to an <b>even</b> power is negative, so this has no real roots. Type <b>none</b>.');
      if (even && want.length === 2 && got.length === 1 && want.some(function (w) { return ex.eq(w, got[0], 1e-9); })) return wrong('u1x-root-pm', 'There is another one: an even power of a negative number is positive too, so ' + t('-' + ex.texRat(ex.norm(Math.round(Math.abs(got[0]) * 1e6), 1e6))) + '… check both signs.');
      if (!even && want.length === 1 && got.length === 2 && got.some(function (v) { return ex.eq(v, want[0], 1e-9); })) return wrong('u1x-root-odd-pm', 'An <b>odd</b> root has only one real value: the other sign raised to this odd power gives the opposite sign.');
      if (want.length === 1 && got.length === 1 && ex.eq(got[0], -want[0], 1e-9)) return wrong('sign', 'Check the sign: raise your answer to the power and compare.');
      return wrong('value', null);
    };
  }

  /* ---------- exit slips ---------- */

  /* ===== Lesson 1 — Prime Building Blocks of Numbers ===== */
  var L1_POOL = [];
  [2, 3, 5].forEach(function (a) { nt.primesBetween(11, 47).forEach(function (p) { if (a * p <= 99) L1_POOL.push(a * p); }); });
  L1_POOL = L1_POOL.concat([45, 63, 75, 99, 98, 50]);
  var L1_CTX = [
    function (n) { return 'A teacher is setting out ' + t(n) + ' chairs in rows, with the same number of chairs in every row and none left over. Every possible number of rows is a factor of ' + t(n) + '.'; },
    function (n) { return 'A baker packs ' + t(n) + ' muffins into boxes, with the same number in every box and none left over. Every possible number of boxes is a factor of ' + t(n) + '.'; },
    function (n) { return 'A coach splits ' + t(n) + ' athletes into teams of equal size, with nobody left out. Every possible number of teams is a factor of ' + t(n) + '.'; }];
  HW.defineExit({
    lesson: 'u1l1', calc: false, outcome: 'AN1',
    blurb: 'Factors, primes and composites, and writing a number as a product of primes.',
    questions: [
      { num: '1', outcome: 'AN1', stem: '', parts: [
        { id: '1', outcome: 'AN1', level: 'BEG', make: function (r) {
          var n = r.pick(L1_POOL), ctx = r.pick(L1_CTX), d = nt.divisors(n);
          var p = { prompt: ctx(n) + ' List <b>every</b> factor of ' + t(n) + '.', input: { type: 'list' }, check: rc(K.factorList(n), LIST_MAP), key: d, answer: t(K.listTex(d)), text: 'factors of ' + n,
            solution: 'Work through the factor pairs in order: ' + t(K.pairsTex(n)) + '.<br>The factors of ' + t(n) + ' are ' + t(K.listTex(d)) + '.',
            hints: ['Start with ' + t('1\\times ' + n) + ', then test ' + t('2') + ', ' + t('3') + ', ' + t('4') + ', … Each factor that works brings its partner.', 'Stop when the pairs start repeating.'] };
          var nonf = find(function () { return r.int(2, n - 1); }, function (x) { return n % x !== 0; }, n - 1);
          p.bad = [d.slice(1, -1), d.concat([nonf]).sort(function (a, b) { return a - b; }), d.filter(function (x) { return x !== d[1] && x !== d[d.length - 2]; })].filter(function (b) { return b.length; });
          return p;
        } }] },
      { num: '2', outcome: 'AN1', stem: 'Use a division ladder or a factor tree on paper.', parts: [
        { id: '2', outcome: 'AN1', level: 'EMG', make: function (r) {
          var f = find(function () { var ps = sortN(r.sample([2, 3, 5, 7, 11], 3)); return ps.map(function (q) { return [q, r.int(1, 3)]; }); }, function (f) {
            var N = fVal(f); return N >= 1000 && N <= 9999 && f.filter(function (pe) { return pe[1] >= 2; }).length >= 2;
          }, [[2, 2], [3, 3], [5, 2]]);
          var N = fVal(f), sm = f[0], comp = f.filter(function (pe) { return pe[1] >= 2; })[0];
          var compTex = HW.texFactors(f.filter(function (pe) { return pe !== comp; }).concat([[comp[0] * comp[0], 1], [comp[0], comp[1] - 2]]).filter(function (pe) { return pe[1] > 0; }).sort(function (a, b) { return a[0] - b[0]; }));
          var p = { prompt: 'Write ' + t(F(N)) + ' as a product of prime factors in <b>exponent form</b>.', input: { type: 'math', before: t(F(N) + '=') }, check: prodChk(N, 'required'), key: K.fac(N), answer: t(F(N) + '=' + K.fac(N)), text: 'exponent form: ' + N,
            solution: 'Divide by the smallest prime each time:' + K.ladderSolution(N) + t(F(N) + '=' + K.exp(N) + '=' + K.fac(N)),
            hints: ['Start with the smallest prime that divides ' + t(F(N)) + ' and keep dividing until you reach ' + t('1') + '.', 'Write each repeated prime once, with an exponent: ' + t('3\\times 3\\times 3=3^{3}') + '.'] };
          p.bad = [compTex, fTex(f.filter(function (pe) { return pe !== sm; })), fTex(f.map(function (pe, i) { return i === f.length - 1 ? [pe[0], pe[1] + 1] : pe; }))];
          return p;
        } }] },
      { num: '3', outcome: 'AN1',
        shared: function (r) {
          return find(function () { var q = r.pick([5, 7, 11]); return { a: r.int(2, 4), b: r.int(1, 3), q: q, c: q === 11 ? 1 : r.int(1, 2) }; }, function (s) { var N = Math.pow(2, s.a) * Math.pow(3, s.b) * Math.pow(s.q, s.c); return N >= 300 && N <= 6000; }, { a: 3, b: 2, q: 5, c: 1 });
        },
        stem: function (s) { var f = [[2, s.a], [3, s.b], [s.q, s.c]]; return 'A number ' + t('N') + ' has the prime factorization ' + t('N=' + HW.texFactors(f) + '=' + F(fVal(f))) + '. Use the prime factors — no need to list every factor.'; },
        parts: [
          { id: '3', outcome: 'AN1', level: 'ADV', make: function (r, s) {
            var f = [[2, s.a], [3, s.b], [s.q, s.c]], N = fVal(f), odd = fVal([[3, s.b], [s.q, s.c]]), no3 = fVal([[2, s.a], [s.q, s.c]]);
            var p = P.fields('Find the <b>largest odd factor</b> of ' + t('N') + ', and the <b>largest factor</b> of ' + t('N') + ' that is <b>not a multiple of ' + t('3') + '</b>.',
              [{ name: 'Largest odd factor', label: 'Largest odd factor:' }, { name: 'Not a multiple of 3', label: 'Largest factor that is not a multiple of ' + t('3') + ':' }],
              [numChk(odd, [{ v: N / 2, code: 'u1x-odd-once', hint: t(F(N / 2)) + ' is still even: it has ' + t('2^{' + (s.a - 1) + '}') + ' in it. An odd factor can’t use <b>any</b> 2s.' }, { v: s.q, code: 'u1x-odd-prime', hint: t(s.q) + ' is an odd factor, but not the largest. Use every odd prime factor, each to its full power.' }, { v: 3, code: 'u1x-odd-prime', hint: t('3') + ' is an odd factor, but not the largest. Use every odd prime factor, each to its full power.' }, { v: N, code: 'u1x-odd-all', hint: t('N') + ' itself is even. Remove every factor of ' + t('2') + '.' }]),
                numChk(no3, [{ v: N / 3, code: 'u1x-odd-once', hint: t(F(N / 3)) + ' is still a multiple of ' + t('3') + (s.b > 1 ? ' (it has ' + t('3^{' + (s.b - 1) + '}') + ' in it)' : '') + '. Remove <b>every</b> factor of ' + t('3') + '.' }, { v: odd, code: 'u1x-odd-prime', hint: 'That’s the largest <b>odd</b> factor. This box needs the largest factor with no 3s in it.' }, { v: N, code: 'u1x-odd-all', hint: t('N') + ' itself is a multiple of ' + t('3') + '. Remove every factor of ' + t('3') + '.' }])],
              [String(odd), String(no3)], 'Largest odd factor ' + t(F(odd)) + '; largest factor not a multiple of 3: ' + t(F(no3)),
              'Every factor of ' + t('N') + ' is built from its prime factors, each used up to its exponent.<br>An odd factor can’t use any 2s, so the largest one uses all the other primes: ' + t(fTex([[3, s.b], [s.q, s.c]]) + '=' + F(odd)) + '.<br>A factor that is not a multiple of 3 can’t use any 3s: ' + t(fTex([[2, s.a], [s.q, s.c]]) + '=' + F(no3)) + '.',
              ['A factor of ' + t('N') + ' is made from some (or all) of its prime factors.', 'Leave out every copy of the prime you must avoid, and keep everything else.'], 'largest odd factor / not multiple of 3 of ' + N);
            p.bad = [[String(N / 2), String(no3)], [String(odd), String(N / 3)], [String(s.q), String(no3)]].filter(function (b) { return b.join('|') !== p.key.join('|'); });
            return p;
          } }] }
    ]
  });

  /* ===== Lesson 2 — GCF and LCM ===== */
  var GCF_CTX = [
    { text: function (a, b) { return 'A choir has ' + t(a) + ' sopranos and ' + t(b) + ' altos. For a photo they stand in rows. Every row has the same number of singers, each row is all sopranos or all altos, and the rows are as long as possible.'; }, ask: ' How many singers are in each row, and how many rows are there?', per: 'Singers in each row:', count: 'Number of rows:' },
    { text: function (a, b) { return 'A gardener has ' + t(a) + ' tomato plants and ' + t(b) + ' pepper plants. She plants them in rows with the same number of plants in every row, only one kind of plant in each row, and as few rows as possible.'; }, ask: ' How many plants are in each row, and how many rows are there?', per: 'Plants in each row:', count: 'Number of rows:' },
    { text: function (a, b) { return 'A librarian has ' + t(a) + ' novels and ' + t(b) + ' comic books. She stacks them in piles with the same number of books in every pile, only one kind of book in each pile, and as few piles as possible.'; }, ask: ' How many books are in each pile, and how many piles are there?', per: 'Books in each pile:', count: 'Number of piles:' }];
  var LCM_CTX = [
    { text: function (a, b) { return 'Veggie dogs come in packs of ' + t(a) + ' and buns come in packs of ' + t(b) + '. For a barbecue, Jordan wants exactly the same number of veggie dogs and buns, and wants to buy as few as possible.'; }, total: 'Number of each:', c1: function () { return 'Packs of veggie dogs:'; }, c2: function () { return 'Packs of buns:'; } },
    { text: function (a, b) { return 'Two lighthouse beacons flash together at midnight. One flashes every ' + t(a) + ' seconds and the other every ' + t(b) + ' seconds.'; }, ask: ' How many seconds until they next flash together, and how many times has each one flashed by then?', total: 'Seconds until they flash together:', c1: function (a) { return 'Flashes of the ' + t(a) + '-second beacon:'; }, c2: function (a, b) { return 'Flashes of the ' + t(b) + '-second beacon:'; } }];
  HW.defineExit({
    lesson: 'u1l2', calc: false, outcome: 'AN1',
    blurb: 'Greatest common factor and least common multiple: by listing, by prime factorization, and in a word problem.',
    questions: [
      { num: '1', outcome: 'AN1', stem: '', parts: [
        { id: '1a', outcome: 'AN1', level: 'BEG', make: function (r) {
          var v = find(function () { var g = r.int(6, 16), xy = r.pick([[2, 3], [3, 4], [3, 5], [2, 5], [4, 5], [5, 6], [2, 7], [3, 7]]); return r.chance(0.5) ? [g * xy[0], g * xy[1]] : [g * xy[1], g * xy[0]]; }, function (v) { return Math.max(v[0], v[1]) <= 99; }, [36, 60]);
          var g = gcd(v[0], v[1]), s = sortN(v), ds = nt.divisors(s[0]).reverse(), shown = [];
          for (var i = 0; i < ds.length; i++) { shown.push(ds[i]); if (ds[i] === g) break; }
          var p = P.number('What is the <b>greatest</b> whole number that divides evenly into both ' + t(v[0]) + ' and ' + t(v[1]) + '? (This is their GCF.)', g, gcfDiag(v),
            'The factors of ' + t(s[0]) + ', largest first: ' + t(shown.join(',\\ ')) + ' — the first one that also divides ' + t(s[1]) + ' is ' + t(g) + '.<br>(Or with primes: ' + v.map(facEq).join(', ') + '; shared primes, lowest power: ' + t(K.fac(g) + (nt.isPrime(g) ? '' : '=' + g)) + '.)',
            ['List the factors of the smaller number, largest first, and find the first one that divides the other number.'], 'GCF of ' + v.join(', '), { before: t('\\text{GCF}=') });
          p.bad = [String(lcm(v[0], v[1])), String(g / nt.smallestPrimeFactor(g))];
          return p;
        } },
        { id: '1b', outcome: 'AN1', level: 'BEG', make: function (r) {
          var v = find(function () { return r.sample([4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20], 2); }, function (v) { return gcd(v[0], v[1]) > 1 && v[0] % v[1] && v[1] % v[0] && lcm(v[0], v[1]) <= 90; }, [10, 12]);
          var L = lcm(v[0], v[1]), M = Math.max(v[0], v[1]), m = Math.min(v[0], v[1]), ms = [];
          for (var i = 1; i <= L / M; i++) ms.push(M * i);
          var p = P.number('What is the <b>smallest</b> whole number that both ' + t(v[0]) + ' and ' + t(v[1]) + ' divide into evenly? (This is their LCM.)', L, lcmDiag(v),
            'Multiples of ' + t(M) + ': ' + t(ms.join(',\\ ')) + '. The first one that ' + t(m) + ' also divides is ' + t(L) + '.<br>(With primes: ' + v.map(facEq).join(', ') + '; every prime, highest power: ' + t(K.fac(L) + '=' + L) + '.)',
            ['List the multiples of the larger number until you reach one that the smaller number divides into.'], 'LCM of ' + v.join(', '), { before: t('\\text{LCM}=') });
          p.bad = [String(v[0] * v[1]), String(gcd(v[0], v[1]))];
          return p;
        } }] },
      { num: '2', outcome: 'AN1', stem: 'Use prime factorization.', parts: [
        { id: '2', outcome: 'AN1', level: 'EMG', make: function (r) {
          var v = find(function () { var g = r.pick([6, 10, 12, 14, 15, 18, 20, 21, 22, 26, 28]), x = r.int(2, 13), y = r.int(2, 13); return { g: g, a: g * x, b: g * y, x: x, y: y }; },
            function (v) { return v.x !== v.y && gcd(v.x, v.y) === 1 && v.a >= 60 && v.b >= 60 && v.a <= 400 && v.b <= 400; }, { g: 66, a: 132, b: 198, x: 2, y: 3 });
          var a = v.a, b = v.b, G = gcd(a, b), L = lcm(a, b);
          var p = P.fields('Write ' + t(a) + ' and ' + t(b) + ' as products of prime factors. Then use them to find the GCF and the LCM of ' + t(a) + ' and ' + t(b) + '.',
            [{ name: String(a), before: t(a + '='), mode: 'math', wide: true }, { name: String(b), before: t(b + '='), mode: 'math', wide: true }, { name: 'GCF', before: t('\\text{GCF}=') }, { name: 'LCM', before: t('\\text{LCM}=') }],
            [prodChk(a, 'either'), prodChk(b, 'either'), K.number(G, gcfDiag([a, b])), K.number(L, lcmDiag([a, b]))],
            [plainFac(a), plainFac(b), String(G), String(L)],
            t(a + '=' + K.fac(a)) + ', ' + t(b + '=' + K.fac(b)) + '; ' + t('\\text{GCF}=' + F(G)) + ', ' + t('\\text{LCM}=' + F(L)),
            t(a + '=' + K.fac(a)) + '<br>' + t(b + '=' + K.fac(b)) + '<br>GCF: the shared primes, each to its <b>lower</b> power: ' + t(K.fac(G) + '=' + F(G)) + '.<br>LCM: every prime, each to its <b>higher</b> power: ' + t(K.fac(L) + '=' + F(L)) + '.',
            ['Write each number as a product of primes.', 'GCF: shared primes, lower power. LCM: every prime, higher power.'], 'GCF & LCM of ' + a + ', ' + b);
          p.bad = [[plainFac(a), plainFac(b), String(L), String(G)], [plainFac(a), plainFac(b), String(G), String(a * b)]];
          return p;
        } }] },
      { num: '3', outcome: 'AN1', stem: 'Decide whether the problem needs the <b>GCF</b> or the <b>LCM</b>, then solve it.', parts: [
        { id: '3', outcome: 'AN1', level: 'MAS', make: function (r) {
          if (r.chance(0.5)) {
            var c = r.pick(GCF_CTX), v = find(function () { var g = r.pick([6, 8, 9, 12, 14, 15, 16, 18]), xy = r.pick([[2, 3], [3, 4], [3, 5], [2, 5], [4, 5], [2, 7], [3, 7], [5, 6]]); return r.chance(0.5) ? { g: g, x: xy[0], y: xy[1] } : { g: g, x: xy[1], y: xy[0] }; }, function (v) { return v.g * Math.max(v.x, v.y) <= 120; }, { g: 12, x: 3, y: 5 });
            var a = v.g * v.x, b = v.g * v.y, g = v.g, n = v.x + v.y;
            var p = P.fields(c.text(a, b) + c.ask,
              [{ name: 'Tool', label: 'GCF or LCM?', mode: 'text', wide: true, placeholder: 'type GCF or LCM' }, { name: 'Each', label: c.per }, { name: 'Count', label: c.count }],
              [toolChk('GCF', 'Each group has to divide <b>into</b> both totals with nothing left over, so the group size is a common <b>factor</b>; the largest groups use the greatest one.'),
                numChk(g, [{ v: lcm(a, b), code: 'u1x-gcf-lcm', hint: 'That’s the LCM — more than either total! The group size must divide <b>into</b> ' + t(a) + ' and ' + t(b) + '.' }, { v: a, code: 'u1x-group-total', hint: 'That’s a total, not the size of each group.' }, { v: b, code: 'u1x-group-total', hint: 'That’s a total, not the size of each group.' }], gcfDiag([a, b])),
                numChk(n, [{ v: v.x, code: 'u1x-count-part', hint: 'That counts only the first kind. Add the groups of the second kind too.' }, { v: v.y, code: 'u1x-count-part', hint: 'That counts only the second kind. Add the groups of the first kind too.' }, { v: g, code: 'u1x-group-total', hint: 'That’s the size of each group. How many groups are there?' }])],
              ['GCF', String(g), String(n)], 'GCF; ' + t(g) + ' in each, ' + t(n) + ' altogether',
              '<b>GCF</b>: each group must divide evenly into both totals, so its size is a common factor, and the biggest groups use the greatest one.<br>' + facEq(a) + ', ' + facEq(b) + ', so ' + t('\\text{GCF}=' + g) + '.<br>Groups: ' + t(a + '\\div ' + g + '=' + v.x) + ' and ' + t(b + '\\div ' + g + '=' + v.y) + ', so ' + t(v.x + '+' + v.y + '=' + n) + ' altogether.',
              ['Must the group size divide <b>into</b> the totals, or must the totals divide into it?', 'Then divide each total by the group size and add.'], 'GCF word problem ' + a + ', ' + b);
            p.bad = [['LCM', String(g), String(n)], ['GCF', String(g), String(v.x)], ['GCF', String(lcm(a, b)), String(n)]];
            return p;
          }
          var d = r.pick(LCM_CTX), w = find(function () { return r.sample([6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 24], 2); }, function (w) { return gcd(w[0], w[1]) > 1 && w[0] % w[1] && w[1] % w[0] && lcm(w[0], w[1]) <= 120; }, [8, 12]);
          var A = w[0], B = w[1], L = lcm(A, B);
          var q = P.fields(d.text(A, B) + (d.ask || ' How many of each does Jordan buy, and how many packs of each?'),
            [{ name: 'Tool', label: 'GCF or LCM?', mode: 'text', wide: true, placeholder: 'type GCF or LCM' }, { name: 'Total', label: d.total }, { name: 'First', label: d.c1(A, B) }, { name: 'Second', label: d.c2(A, B) }],
            [toolChk('LCM', 'The answer has to be a <b>multiple</b> of both ' + t(A) + ' and ' + t(B) + ' (it comes in whole packs / repeats), so it is a common <b>multiple</b>; the first one is the LCM.'),
              numChk(L, [{ v: gcd(A, B), code: 'u1x-lcm-gcf', hint: 'That’s the GCF. The answer must be a <b>multiple</b> of both ' + t(A) + ' and ' + t(B) + '.' }], lcmDiag([A, B])),
              numChk(L / A, [{ v: L / B, code: 'u1x-count-swap', hint: 'Those two counts are swapped: divide the total by ' + t(A) + ' for this one.' }, { v: B, code: 'u1x-group-total', hint: 'Divide the total by ' + t(A) + '.' }]),
              numChk(L / B, [{ v: L / A, code: 'u1x-count-swap', hint: 'Those two counts are swapped: divide the total by ' + t(B) + ' for this one.' }, { v: A, code: 'u1x-group-total', hint: 'Divide the total by ' + t(B) + '.' }])],
            ['LCM', String(L), String(L / A), String(L / B)], 'LCM; ' + t(L) + '; ' + t(L / A) + ' and ' + t(L / B),
            '<b>LCM</b>: the total must be a multiple of both ' + t(A) + ' and ' + t(B) + ', and the smallest one is the LCM.<br>' + facEq(A) + ', ' + facEq(B) + ', so ' + t('\\text{LCM}=' + K.fac(L) + '=' + L) + '.<br>' + t(L + '\\div ' + A + '=' + L / A) + ' and ' + t(L + '\\div ' + B + '=' + L / B) + '.',
            ['Must the answer divide <b>into</b> ' + t(A) + ' and ' + t(B) + ', or be a <b>multiple</b> of both?', 'Then divide the LCM by each number.'], 'LCM word problem ' + A + ', ' + B);
          q.bad = [['GCF', String(L), String(L / A), String(L / B)], ['LCM', String(L), String(L / B), String(L / A)], ['LCM', String(A * B), String(B), String(A)]].filter(function (b) { return b.join('|') !== q.key.join('|'); });
          return q;
        } }] }
    ]
  });

  /* ===== Lesson 3 — Perfect Squares and Perfect Cubes ===== */
  var SQ_ONLY = [100, 144, 196, 225, 324, 400, 441, 484, 576, 784, 900], CU_ONLY = [125, 216, 343, 512, 1000, 1331], SQCU = [64, 729], NEITHER = [72, 96, 108, 128, 162, 200, 250, 288, 300, 360, 500, 648];
  function sqcubeOf(n) { var e = nt.factor(n).map(function (pe) { return pe[1]; }); return { sq: e.every(function (x) { return x % 2 === 0; }), cu: e.every(function (x) { return x % 3 === 0; }) }; }
  HW.defineExit({
    lesson: 'u1l3', calc: false, outcome: 'AN1',
    blurb: 'Using prime factorization to recognize perfect squares and cubes, find their roots, and make a number into one.',
    questions: [
      { num: '1', outcome: 'AN1', stem: 'A craft store sells bags of small wooden cubes. Use prime factorization to decide what each bag can be built into.', parts: [
        { id: '1', outcome: 'AN1', level: 'BEG', make: function (r) {
          var nums = r.shuffle([r.pick(SQ_ONLY), r.pick(CU_ONLY), r.pick(NEITHER)]);
          var extra = find(function () { return r.pick(r.pick([SQ_ONLY, CU_ONLY, SQCU, NEITHER])); }, function (x) { return nums.indexOf(x) < 0; }, 64);
          nums = r.shuffle(nums.concat([extra]));
          var rows = nums.map(function (n, i) { return { id: 'r' + i, html: t(F(n)) + ' cubes', label: String(n), n: n }; }), want = {}, by = {};
          rows.forEach(function (x) { var k = sqcubeOf(x.n), w = []; if (k.sq) w.push('sq'); if (k.cu) w.push('cu'); want[x.id] = w; by[x.id] = x; });
          var desc = function (n) { var k = sqcubeOf(n); return t(F(n) + '=' + K.fac(n)) + ': ' + (k.sq && k.cu ? 'every exponent is a multiple of 6, so it is <b>both</b> (a ' + intRoot(n, 2) + ' by ' + intRoot(n, 2) + ' square, or a ' + intRoot(n, 3) + '×' + intRoot(n, 3) + '×' + intRoot(n, 3) + ' cube)' : k.sq ? 'every exponent is even, so it makes a ' + intRoot(n, 2) + ' by ' + intRoot(n, 2) + ' square (not a cube)' : k.cu ? 'every exponent is a multiple of 3, so it makes a ' + intRoot(n, 3) + '×' + intRoot(n, 3) + '×' + intRoot(n, 3) + ' cube (not a square)' : 'the exponents are neither all even nor all multiples of 3, so it is <b>neither</b>'); };
          var p = P.grid('The bags hold ' + nlist(nums) + ' cubes. Tick <b>Square</b> if all the cubes in a bag can be laid out as one solid square (one layer), and <b>Cube</b> if they can be stacked into one solid cube. Tick both, or leave both blank, when that is right.',
            rows, [{ id: 'sq', html: 'Square', label: 'Square' }, { id: 'cu', html: 'Cube', label: 'Cube' }], want, { rowHead: 'Bag', allowBlank: true },
            rows.map(function (x) { return desc(x.n); }).join('<br>'),
            ['Write each number as a product of primes in exponent form.', 'A perfect square has every exponent even; a perfect cube has every exponent a multiple of ' + t('3') + '.'], 'square/cube bags ' + nums.join(','));
          p.check = gridChk(want, function (id) { return desc(by[id].n) + '.'; }, 'u1x-sqcube-one', 'u1x-sqcube');
          var allSq = {}, flip = {}; rows.forEach(function (x, i) { allSq[x.id] = ['sq']; flip[x.id] = i === 0 ? (want[x.id].length ? [] : ['sq']) : want[x.id]; });
          p.bad = [allSq, flip];
          return p;
        } }] },
      { num: '2', outcome: 'AN1', stem: '', parts: [
        { id: '2', outcome: 'AN1', level: 'PRG', make: function (r) {
          var f = find(function () { var ps = sortN(r.sample([2, 3, 5, 7], 3)); var odd = r.sample([0, 1, 2], 2); return ps.map(function (q, i) { return [q, odd.indexOf(i) >= 0 ? r.pick([1, 1, 3, 5]) : r.pick([2, 2, 4])]; }); }, function (f) { var M = fVal(f); return M >= 150 && M <= 4000; }, [[2, 3], [3, 2], [5, 1]]);
          var M = fVal(f), need = f.filter(function (pe) { return pe[1] % 2; }), n = prodOf(need.map(function (pe) { return pe[0]; })), root = intRoot(M * n, 2);
          var one = need[0][0], all = prodOf(f.map(function (pe) { return pe[0]; }));
          var p = P.fields('What is the <b>smallest</b> whole number ' + t('n') + ' that ' + t(F(M)) + ' must be multiplied by to give a perfect square? Write ' + t(F(M)) + ' as a product of primes, then give ' + t('n') + ' and the square root of the result.',
            [{ name: 'Prime factorization', before: t(F(M) + '='), mode: 'math', wide: true }, { name: 'n', before: t('n=') }, { name: 'Square root', before: t('\\sqrt{' + F(M) + 'n}=') }],
            [prodChk(M, 'either'), numChk(n, [{ v: one, code: 'u1x-sq-one', hint: 'Multiplying by ' + t(one) + ' fixes only one exponent. Every exponent must be even: which other prime has an odd exponent?' }, { v: n * n, code: 'u1x-sq-square', hint: 'That works, but it isn’t the <b>smallest</b>: one more of each odd-exponent prime is enough.' }, { v: all, code: 'u1x-sq-all', hint: 'Only the primes with an <b>odd</b> exponent need one more copy.' }]),
              numChk(root, [{ v: M * n, code: 'u1x-root-product', hint: 'That’s ' + t(F(M) + 'n') + ' itself. Now take its square root: halve each exponent.' }])],
            [plainFac(M), String(n), String(root)], t(F(M) + '=' + K.fac(M)) + ', ' + t('n=' + n) + ', ' + t('\\sqrt{' + F(M * n) + '}=' + root),
            t(F(M) + '=' + K.fac(M)) + '.<br>For a perfect square every exponent must be even. ' + need.map(function (pe) { return t(pe[0] + (pe[1] > 1 ? '^{' + pe[1] + '}' : '')); }).join(' and ') + ' have odd exponents, so each needs one more copy: ' + t('n=' + need.map(function (pe) { return pe[0]; }).join('\\times ') + '=' + n) + '.<br>' + t(F(M) + '\\times ' + n + '=' + F(M * n) + '=' + K.fac(M * n)) + ', so ' + t('\\sqrt{' + F(M * n) + '}=' + K.fac(root) + '=' + root) + '.',
            ['Write ' + t(F(M)) + ' as a product of primes and look at each exponent.', 'Raise each odd exponent to the next even number — and no further.'], 'smallest n: ' + M + 'n a perfect square');
          p.bad = [[plainFac(M), String(one), String(root)], [plainFac(M), String(n), String(M * n)], [plainFac(M), String(all), String(root)]];
          return p;
        } }] },
      { num: '3', outcome: 'AN1', stem: 'Show your reasoning with prime factors.', parts: [
        { id: '3', outcome: 'AN1', level: 'MAS', make: function (r) {
          var v = find(function () { var ps = r.pick([[2, 3], [2, 5], [3, 5], [2, 7]]); return [[ps[0], r.pick([1, 2, 3, 4, 5, 7, 8])], [ps[1], r.pick([1, 2, 3, 4, 5])]]; }, function (f) {
            var M = fVal(f), up = f.map(function (pe) { return Math.ceil(pe[1] / 6) * 6; }); return M >= 50 && M <= 5000 && fVal(f.map(function (pe, i) { return [pe[0], up[i]]; })) <= 3e6 && f.every(function (pe) { return pe[1] % 6; });
          }, [[2, 2], [3, 4]]);
          var f = v, M = fVal(f), up = f.map(function (pe) { return [pe[0], Math.ceil(pe[1] / 6) * 6]; }), nf = f.map(function (pe, i) { return [pe[0], up[i][1] - pe[1]]; }), n = fVal(nf), MN = M * n;
          var sq = fVal(up.map(function (pe) { return [pe[0], pe[1] / 2]; })), cu = fVal(up.map(function (pe) { return [pe[0], pe[1] / 3]; }));
          var onlySq = fVal(f.map(function (pe) { return [pe[0], pe[1] % 2]; })), onlyCu = fVal(f.map(function (pe) { return [pe[0], (3 - pe[1] % 3) % 3]; }));
          var p = P.fields('Find the <b>smallest</b> whole number ' + t('n') + ' so that ' + t(F(M) + 'n') + ' is <b>both</b> a perfect square and a perfect cube. Then give the square root and the cube root of ' + t(F(M) + 'n') + '. (You may type ' + t('n') + ' and the roots as products of primes, like ' + t('2^{3}\\times 5') + '.)',
            [{ name: 'Prime factorization', before: t(F(M) + '='), mode: 'math', wide: true }, { name: 'n', before: t('n='), mode: 'math', wide: true }, { name: 'Square root', before: t('\\sqrt{' + F(M) + 'n}='), mode: 'math', wide: true }, { name: 'Cube root', before: t('\\sqrt[3]{' + F(M) + 'n}='), mode: 'math', wide: true }],
            [prodChk(M, 'either'), valChk(n, [{ v: onlySq, code: 'u1x-only-square', hint: 'That makes every exponent even (a perfect square), but a perfect cube also needs every exponent to be a multiple of ' + t('3') + '. Both at once: multiples of ' + t('6') + '.' }, { v: onlyCu, code: 'u1x-only-cube', hint: 'That makes every exponent a multiple of ' + t('3') + ' (a perfect cube), but a perfect square also needs them even. Both at once: multiples of ' + t('6') + '.' }]),
              valChk(sq, [{ v: cu, code: 'u1x-roots-swap', hint: 'That’s the <b>cube</b> root. For the square root, halve each exponent.' }, { v: MN, code: 'u1x-root-product', hint: 'That’s ' + t(F(M) + 'n') + ' itself. Halve each exponent to get its square root.' }]),
              valChk(cu, [{ v: sq, code: 'u1x-roots-swap', hint: 'That’s the <b>square</b> root. For the cube root, divide each exponent by ' + t('3') + '.' }, { v: MN, code: 'u1x-root-product', hint: 'That’s ' + t(F(M) + 'n') + ' itself. Divide each exponent by 3 to get its cube root.' }])],
            [plainFac(M), String(n), String(sq), String(cu)], t(F(M) + '=' + K.fac(M)) + ', ' + t('n=' + fTex(nf) + '=' + F(n)) + ', ' + t('\\sqrt{' + F(MN) + '}=' + F(sq)) + ', ' + t('\\sqrt[3]{' + F(MN) + '}=' + F(cu)),
            t(F(M) + '=' + K.fac(M)) + '.<br>A perfect square needs even exponents and a perfect cube needs multiples of ' + t('3') + ', so both at once needs every exponent to be a multiple of ' + t('6') + '.<br>Raise each exponent to the next multiple of 6: ' + t(fTex(f) + '\\times ' + fTex(nf) + '=' + fTex(up)) + ', so ' + t('n=' + fTex(nf) + '=' + F(n)) + '.<br>' +
              t('\\sqrt{' + fTex(up) + '}=' + fTex(up.map(function (pe) { return [pe[0], pe[1] / 2]; })) + '=' + F(sq)) + ' and ' + t('\\sqrt[3]{' + fTex(up) + '}=' + fTex(up.map(function (pe) { return [pe[0], pe[1] / 3]; })) + '=' + F(cu)) + '.',
            ['What must every exponent be for a number to be a square <b>and</b> a cube?', 'Raise each exponent to the next multiple of ' + t('6') + '; halve them for the square root, divide them by 3 for the cube root.'], 'smallest n: ' + M + 'n square and cube');
          p.bad = [[plainFac(M), String(onlySq), String(sq), String(cu)], [plainFac(M), String(onlyCu), String(sq), String(cu)], [plainFac(M), String(n), String(cu), String(sq)]].filter(function (b) { return b.join('|') !== p.key.join('|'); });
          return p;
        } }] }
    ]
  });

  /* ===== Lesson 4 — Rational and Irrational Numbers, Decimal Patterns ===== */
  HW.defineExit({
    lesson: 'u1l4', calc: false, outcome: 'AN2',
    blurb: 'Rational or irrational, writing a fraction as a repeating decimal, and the algebraic method for a repeating decimal.',
    questions: [
      { num: '1', outcome: 'AN2', stem: 'Decide whether each number is <b>rational</b> ' + t('(Q)') + ' or <b>irrational</b> ' + t('(\\overline{Q})') + '.', parts: [
        { id: '1', outcome: 'AN2', level: 'BEG', make: function (r) {
          var k = r.int(4, 15), n = r.pick([8, 12, 18, 24, 30, 40, 45, 60, 72, 90]), d = r.int(1, 8), e = r.int(1, 9), f = r.pick([3, 7, 9, 11, 13]), p0 = r.int(1, f - 1);
          var a2 = r.int(1, 6), b2 = r.pick([5, 7, 8, 9, 10, 11].filter(function (x) { return x > a2 && gcd(x, a2) === 1; }));
          var dd = r.int(1, 8), pat = '0.' + dd + '0' + dd + '00' + dd + '000' + dd + '\\ldots';
          var pool = [
            { id: 's', tex: '-\\sqrt{' + k * k + '}', rat: 1, why: t('\\sqrt{' + k * k + '}=' + k) + ', so this is the integer ' + t('-' + k) },
            { id: 'n', tex: '\\sqrt{' + n + '}', rat: 0, why: t(n) + ' is not a perfect square, so the decimal never ends and never repeats' },
            { id: 'r', tex: e + '.\\overline{' + d + e + '}', rat: 1, why: 'the block ' + t(d + '' + e) + ' repeats forever, and every repeating decimal is a fraction' },
            { id: 'p', tex: r.pick(['\\pi', '3\\pi', '\\frac{\\pi}{2}']), rat: 0, why: 'a multiple of ' + t('\\pi') + ' never ends and never repeats' },
            { id: 'f', tex: '\\frac{' + p0 + '}{' + f + '}', rat: 1, why: 'it is a fraction of integers' },
            { id: 'd', tex: pat, rat: 0, why: 'the run of zeros keeps growing, so no block ever repeats' },
            { id: 'q', tex: '\\sqrt{\\frac{' + a2 * a2 + '}{' + b2 * b2 + '}}', rat: 1, why: t('\\sqrt{\\frac{' + a2 * a2 + '}{' + b2 * b2 + '}}=\\frac{' + a2 + '}{' + b2 + '}') },
            { id: 't', tex: r.int(1, 9) + '.' + r.int(10, 99) + '5', rat: 1, why: 'it is a terminating decimal, so it is a fraction over a power of 10' }];
          var rows = r.shuffle(r.sample(pool.filter(function (x) { return !x.rat; }), 2).concat(r.sample(pool.filter(function (x) { return x.rat; }), 3)));
          var want = {}, by = {}; rows.forEach(function (x) { want[x.id] = x.rat ? 'Q' : 'Qb'; by[x.id] = x; });
          var p = P.grid('Choose ' + t('Q') + ' or ' + t('\\overline{Q}') + ' for each of ' + rows.map(function (x) { return t(x.tex); }).join(', ') + '.', rows.map(function (x) { return { id: x.id, html: t(x.tex), label: x.id }; }),
            [{ id: 'Q', html: t('Q') + ' rational', label: 'Q' }, { id: 'Qb', html: t('\\overline{Q}') + ' irrational', label: 'Q-bar' }], want, { rowHead: 'Number' },
            rows.map(function (x) { return t(x.tex) + ': ' + (x.rat ? t('Q') : t('\\overline{Q}')) + ' — ' + x.why + '.'; }).join('<br>'),
            ['A rational number can be written as a fraction of integers: its decimal ends or repeats.', 'Simplify each root first: is the number under it a perfect square?'], 'rational or irrational: 5 numbers');
          p.check = gridChk(want, function (id) { var x = by[id]; return t(x.tex) + ' is ' + (x.rat ? 'rational' : 'irrational') + ': ' + x.why + '.'; }, 'u1x-ratirr-one', 'u1x-ratirr');
          var flip1 = {}, allQ = {}; rows.forEach(function (x, i) { flip1[x.id] = i === 0 ? (want[x.id] === 'Q' ? 'Qb' : 'Q') : want[x.id]; allQ[x.id] = 'Q'; });
          p.bad = [flip1, allQ];
          return p;
        } }] },
      { num: '2', outcome: 'AN2', stem: '', parts: [
        { id: '2', outcome: 'AN2', level: 'EMG', make: function (r) {
          var fr = find(function () { var q = r.pick([6, 9, 11, 12, 15, 18, 22, 33]), p = r.int(1, q - 1); return [p, q]; }, function (fr) { return gcd(fr[0], fr[1]) === 1; }, [5, 18]);
          var dec = K.decTex(fr), val = fr[0] / fr[1], plain = val.toFixed(4).replace(/0+$/, '');
          var p = P.repeating('<b>Without a calculator</b>, divide to write ' + t('\\frac{' + fr[0] + '}{' + fr[1] + '}') + ' as a decimal. Put a bar over the block of digits that repeats.', fr, {},
            'Long division: ' + t(fr[0] + '\\div ' + fr[1] + '=' + val.toFixed(6) + '\\ldots') + '. The remainders start to repeat, so the digits do too: ' + t('\\frac{' + fr[0] + '}{' + fr[1] + '}=' + dec) + '.',
            ['Divide ' + t(fr[0] + '.000000') + ' by ' + t(fr[1]) + '. Watch the remainders: when one comes back, the digits repeat from there.', 'The bar goes over exactly the digits that repeat.'], 'fraction to repeating decimal ' + fr.join('/'));
          var mt = /^(.*?)\\overline\{(\d+)\}$/.exec(dec), pre = mt[1], blk = mt[2];
          var wrongBar = blk.length > 1 ? pre + blk.slice(0, -1) + '\\overline{' + blk.slice(-1) + '}' : /\d$/.test(pre) ? pre.slice(0, -1) + '\\overline{' + pre.slice(-1) + blk + '}' : pre + blk + blk + blk + blk;
          p.bad = [plain, wrongBar];
          return p;
        } }] },
      { num: '3', outcome: 'AN2', stem: '<i>(Extension)</i>', parts: [
        { id: '3', outcome: 'AN2', level: 'ADV', make: function (r) {
          var R = find(function () {
            var I = r.int(0, 7), lead = String(r.int(0, 9)), block = String(r.int(0, 9)) + String(r.int(0, 9));
            return { I: I, lead: lead, block: block };
          }, function (v) { var b = v.block; return b[0] !== b[1] && v.lead !== b[1] && !/^(00|99)$/.test(b) && !(v.lead === '0' && v.I === 0); }, { I: 6, lead: '0', block: '84' });
          return algebraPart(repInfo(R.I, R.lead, R.block));
        } }] }
    ]
  });

  /* ===== Lesson 5 — Classifying the Real Number System ===== */
  function estPair(r, small) {
    return find(function () {
      var s = r.int(1, 9), u = r.pick([-0.35, -0.3, -0.25, -0.2, -0.15, 0.15, 0.2, 0.25, 0.3, 0.35]), x = s + u, k = r.int(1, 2);
      if (s === 1 && u < 0) return null;
      if (!small) { var N = Math.round(x * x * Math.pow(100, k)); return { s: s, k: k, N: N, tex: F(N), want: s * Math.pow(10, k), wantS: String(s * Math.pow(10, k)) }; }
      var d = Number((x * x / Math.pow(100, k)).toPrecision(3)), w = s / Math.pow(10, k);
      return { s: s, k: k, N: d, tex: String(d).replace(/^(0\.\d{3})(\d+)$/, '$1\\,$2'), want: w, wantS: w.toFixed(k) };
    }, function (v) { var rt0 = Math.sqrt(v.N); return Number(rt0.toPrecision(1)) === v.want && Math.abs(rt0 - v.want) / v.want < 0.2; }, small ? { s: 3, k: 1, N: 0.0908, tex: '0.090\\,8', want: 0.3, wantS: '0.3' } : { s: 8, k: 1, N: 6784, tex: '6\\,784', want: 80, wantS: '80' });
  }
  function estChk(v) {
    return function (resp) {
      var p = HW.parse.number(resp);
      if (!p.ok) return form(p.code === 'empty' ? 'empty' : 'notnumber', p.code === 'empty' ? 'Type your estimate first.' : 'Type a single number.');
      var x = p.value; if (Math.abs(x - v.want) < 1e-9 * Math.max(1, v.want)) return ok();
      var lead = Number(Math.abs(x).toPrecision(1));
      if (Math.abs(x - v.want) / v.want < 0.2 && lead === v.want) return form('u1x-sig', 'Close — now round your estimate to <b>one</b> significant digit.');
      for (var e = -3; e <= 3; e++) if (e && Math.abs(x - v.want * Math.pow(10, e)) < 1e-9 * Math.max(1, x)) return wrong('u1x-est-place', 'Right digit, wrong place value. Check the size: square your answer and compare it with ' + t(v.tex) + '.');
      if (Math.abs(x - v.want * v.want) < 1e-9 * Math.max(1, x)) return wrong('u1x-est-square', 'That’s the perfect square near the number. The estimate is its <b>square root</b>.');
      return wrong('value', null);
    };
  }
  var FIND = {
    irrBetween: function (r) { var a = r.int(2, 9); return { text: 'An <b>irrational</b> number between ' + t(a) + ' and ' + t(a + 1) + '.', key: '\\sqrt{' + (a * a + 2) + '}', ex: t('\\sqrt{' + (a * a + 1) + '}') + ', ' + t('\\sqrt{' + (a * a + 2) + '}') + ', …, ' + t('\\sqrt{' + (a * a + 2 * a) + '}') + ' (or ' + t(a + '+\\frac{\\pi}{10}') + ')', why: 'any square root of a whole number between ' + t(a * a) + ' and ' + t((a + 1) * (a + 1)) + ' (not a perfect square) works', bad: [String(a) + '.5', '\\sqrt{' + (a * a) + '}', '\\sqrt{' + ((a + 1) * (a + 1) + 3) + '}'],
      test: function (o) { if (o.rational) return { code: 'u1x-cond', hint: 'Your number is rational (its decimal ends or repeats). Try the square root of a whole number that is not a perfect square.' }; if (!(o.v > a && o.v < a + 1)) return { code: 'u1x-cond-range', hint: 'It is irrational, but not between ' + t(a) + ' and ' + t(a + 1) + '. Square ' + t(a) + ' and ' + t(a + 1) + ': the number under the root must be between them.' }; return null; } }; },
    sqrtRat: function () { return { text: 'A positive <b>rational</b> number that is <b>not an integer</b>, but whose <b>square root is rational</b>.', key: '\\frac{4}{9}', ex: t('\\frac{4}{9}') + ' (' + t('\\sqrt{\\frac{4}{9}}=\\frac{2}{3}') + ') or ' + t('0.25') + ' (' + t('\\sqrt{0.25}=0.5') + ')', why: 'a fraction whose top and bottom are both perfect squares works', bad: ['\\frac{1}{2}', '16', '\\frac{2}{3}'],
      test: function (o) { if (!o.rational) return { code: 'u1x-cond', hint: 'Your number is irrational. Start with a fraction.' }; if (o.q === 1) return { code: 'u1x-cond', hint: 'Your number is an integer. You need a fraction (not an integer).' }; if (o.p < 0) return { code: 'u1x-cond', hint: 'It must be positive — a negative number has no real square root.' }; if (!isPow(o.p, 2) || !isPow(o.q, 2)) return { code: 'u1x-cond', hint: 'Its square root is irrational: in lowest terms, the top and bottom must <b>both</b> be perfect squares (like ' + t('\\frac{9}{25}') + ').' }; return null; } }; },
    negCube: function (r) { return { text: 'A <b>negative integer</b> whose <b>cube root</b> is an integer.', key: '-' + Math.pow(r.int(2, 5), 3), ex: t('-8') + ', ' + t('-27') + ', ' + t('-64') + ', …', why: 'the cube of any negative integer works: ' + t('\\sqrt[3]{-27}=-3'), bad: ['-9', '27', '-\\frac{1}{8}'],
      test: function (o) { if (!o.rational || o.q !== 1 || o.p >= 0) return { code: 'u1x-cond', hint: 'You need a <b>negative integer</b>.' }; if (!isPow(-o.p, 3)) return { code: 'u1x-cond-range', hint: 'It is a negative integer, but its cube root isn’t an integer. Cube a negative integer, like ' + t('(-2)^{3}') + '.' }; return null; } }; },
    irrSqW: function () { return { text: 'An <b>irrational</b> number whose <b>square</b> is a whole number.', key: '\\sqrt{7}', ex: t('\\sqrt{7}') + ' (' + t('(\\sqrt{7})^{2}=7') + ') or ' + t('3\\sqrt{2}') + ' (square ' + t('18') + ')', why: 'the square root of any whole number that is not a perfect square works', bad: ['\\pi', '\\sqrt{9}', '\\frac{1}{3}'],
      test: function (o) { if (o.rational) return { code: 'u1x-cond', hint: 'Your number is rational. Try a square root.' }; var s = o.v * o.v; if (Math.abs(s - Math.round(s)) > 1e-7 || Math.round(s) < 0) return { code: 'u1x-cond-range', hint: 'It is irrational, but its square isn’t a whole number. Square roots of whole numbers work: ' + t('(\\sqrt{n})^{2}=n') + '.' }; return null; } }; },
    ratBetween: function (r) { var k = r.pick([10, 11, 12, 13, 14, 17, 18, 19, 20, 22, 23, 26, 27, 28, 29, 30, 31, 33, 34, 35, 38, 39, 40, 41, 42, 44, 45, 46, 47, 48]), lo = Math.sqrt(k), hi = Math.sqrt(k + 1), best = null;
      for (var q = 10; q <= 100 && !best; q *= 10) for (var p = Math.ceil(lo * q); p / q < hi; p++) if (p / q > lo && p / q < hi && (p * p) % (q * q) !== 0) { best = [p, q]; break; }
      var keyT = (best[0] / best[1]).toFixed(best[1] === 10 ? 1 : 2);
      return { text: 'A <b>rational</b> number between ' + t('\\sqrt{' + k + '}') + ' and ' + t('\\sqrt{' + (k + 1) + '}') + '.', key: keyT, ex: t(keyT) + ' (because ' + t(keyT + '^{2}=' + (best[0] * best[0] / (best[1] * best[1])).toFixed(best[1] === 10 ? 2 : 4)) + ')', why: 'square a terminating decimal and check it lands between ' + t(k) + ' and ' + t(k + 1), bad: ['\\sqrt{' + k + '.5}', String(Math.floor(lo)), String(Math.ceil(hi))],
      test: function (o) { if (!o.rational) return { code: 'u1x-cond', hint: 'Your number is irrational. You need a fraction or a terminating decimal.' }; if (!(o.v * o.v > k && o.v * o.v < k + 1)) return { code: 'u1x-cond-range', hint: 'It is rational, but not between the two roots: its square must be between ' + t(k) + ' and ' + t(k + 1) + '.' }; return null; } }; }
  };
  function findChk(c) { return function (resp) { var o = readReal(resp); if (o.res) return o.res; var h = c.test(o); return h ? wrong(h.code, h.hint) : ok(); }; }
  HW.defineExit({
    lesson: 'u1l5', calc: false, outcome: 'AN2',
    blurb: 'The sets of the real number system, estimating square roots, and finding numbers that fit a description.',
    questions: [
      { num: '1', outcome: 'AN2', stem: 'Tick <b>every</b> set each number belongs to.', parts: [
        { id: '1', outcome: 'AN2', level: 'BEG', make: function (r) {
          var k1 = r.int(2, 9), k2 = r.int(2, 12), a = r.int(1, 9), b = r.pick([3, 4, 7, 8, 9].filter(function (x) { return gcd(x, a) === 1; })), m = r.int(3, 8);
          var cats = {
            negint: r.pick([{ tex: '-\\sqrt{' + k1 * k1 + '}', note: '-\\sqrt{' + k1 * k1 + '}=-' + k1 }, { tex: '-' + (k1 + 10), note: null }, { tex: '\\frac{-' + m * k1 + '}{' + m + '}', note: '\\frac{-' + m * k1 + '}{' + m + '}=-' + k1 }]),
            nat: r.pick([{ tex: '\\sqrt{' + k2 * k2 + '}', note: '\\sqrt{' + k2 * k2 + '}=' + k2 }, { tex: '\\frac{' + m * k2 + '}{' + m + '}', note: '\\frac{' + m * k2 + '}{' + m + '}=' + k2 }]),
            frac: r.pick([{ tex: '-\\frac{' + a + '}{' + b + '}', note: null }, { tex: '0.\\overline{' + a + '}', note: null }, { tex: '-' + a + '.' + r.int(1, 9) + '5', note: null }]),
            irr: r.pick([{ tex: '\\sqrt{' + r.pick([15, 22, 35, 50, 61, 80]) + '}', note: null }, { tex: '\\frac{\\pi}{' + r.int(2, 4) + '}', note: null }, { tex: '-\\sqrt{' + r.pick([3, 6, 10, 13]) + '}', note: null }]),
            zero: r.pick([{ tex: '0', note: null }, { tex: '\\sqrt{0}', note: '\\sqrt{0}=0' }, { tex: '\\frac{0}{' + m + '}', note: '\\frac{0}{' + m + '}=0' }])
          };
          var pick = ['irr', 'negint'].concat(r.sample(['nat', 'frac', 'zero'], 2));
          var items = r.shuffle(pick.map(function (c, i) { return { id: 'r' + i, tex: cats[c].tex, note: cats[c].note, cls: c }; }));
          var want = {}, by = {}; items.forEach(function (x) { want[x.id] = SETS[x.cls].slice(); by[x.id] = x; });
          var p = P.grid('Tick every set that each of ' + items.map(function (x) { return t(x.tex); }).join(', ') + ' belongs to.', items.map(function (x) { return { id: x.id, html: t(x.tex), label: x.id }; }), SET_COLS, want,
            { why: function (id, got) { return setHint(by[id], got); }, rowHead: 'Number' },
            items.map(function (x) { return t(x.tex) + (x.note ? ': ' + t(x.note) : '') + ' → ' + t(want[x.id].map(function (s) { return SET_TEX[s]; }).join(',\\ ')); }).join('<br>'),
            ['Simplify each number first. Then work up the chain ' + t('N\\subset W\\subset I\\subset Q\\subset R') + '; an irrational number is in ' + t('\\overline{Q}') + ' and ' + t('R') + ' only.'], 'number sets: 4 numbers');
          var noR = {}, allQ = {}; items.forEach(function (x) { noR[x.id] = want[x.id].filter(function (s) { return s !== 'R'; }); allQ[x.id] = ['Q', 'R']; });
          p.bad = [noR, allQ];
          return p;
        } }] },
      { num: '2', outcome: 'AN2', stem: '<b>Without a calculator</b>, estimate each square root to <b>one significant digit</b>. Use the perfect squares nearby.', parts: [
        { id: '2', outcome: 'AN2', level: 'EMG', make: function (r) {
          var big = estPair(r, false), sm = estPair(r, true);
          var p = P.fields('Estimate ' + t('\\sqrt{' + big.tex + '}') + ' and ' + t('\\sqrt{' + sm.tex + '}') + ' to one significant digit.',
            [{ name: 'big', before: t('\\sqrt{' + big.tex + '}\\approx') }, { name: 'small', before: t('\\sqrt{' + sm.tex + '}\\approx') }], [estChk(big), estChk(sm)], [big.wantS, sm.wantS],
            t('\\sqrt{' + big.tex + '}\\approx ' + big.wantS) + ', ' + t('\\sqrt{' + sm.tex + '}\\approx ' + sm.wantS),
            t(big.tex) + ' is close to ' + t(F(big.want * big.want)) + ' ' + t('=' + big.wantS + '^{2}') + ', so ' + t('\\sqrt{' + big.tex + '}\\approx ' + big.wantS) + '.<br>' + t(sm.tex) + ' is close to ' + t(String(Number((sm.want * sm.want).toPrecision(2)))) + ' ' + t('=' + sm.wantS + '^{2}') + ', so ' + t('\\sqrt{' + sm.tex + '}\\approx ' + sm.wantS) + '.',
            ['Find a perfect square close to the number with only one non-zero digit in its root, like ' + t('6\\,400=80^{2}') + ' or ' + t('0.09=0.3^{2}') + '.', 'Check the size: square your estimate and compare.'], 'estimate sqrt ' + big.N + ', sqrt ' + sm.N);
          p.bad = [[String(big.want * 10), sm.wantS], [big.wantS, String(sm.want * 10)], [String(big.want * big.want), sm.wantS]];
          return p;
        } }] },
      { num: '3', outcome: 'AN2', stem: 'Find one number that fits each description. (Use the keypad for fractions, roots and ' + t('\\pi') + '.)', parts: [
        { id: '3', outcome: 'AN2', level: 'ADV', make: function (r) {
          var two = r.sample(['irrBetween', 'sqrtRat', 'negCube', 'irrSqW', 'ratBetween'], 2).map(function (k) { return FIND[k](r); });
          var p = P.fields('(i) ' + two[0].text + '<br>(ii) ' + two[1].text,
            [{ name: '(i)', label: '(i)', mode: 'math', keys: 'expr', wide: true }, { name: '(ii)', label: '(ii)', mode: 'math', keys: 'expr', wide: true }], [findChk(two[0]), findChk(two[1])], [two[0].key, two[1].key],
            '(answers vary) e.g. (i) ' + t(two[0].key) + ', (ii) ' + t(two[1].key),
            '(i) ' + two[0].ex + ': ' + two[0].why + '.<br>(ii) ' + two[1].ex + ': ' + two[1].why + '.',
            ['Decide which set your number must be in first, then make it fit the rest of the description.', 'Test your number: square it or take its root to check.'], 'find numbers: ' + two.map(function (x) { return x.text.replace(/<[^>]+>|\\\(|\\\)/g, ''); }).join(' / ').slice(0, 90));
          p.bad = [[two[0].bad[0], two[1].key], [two[0].key, two[1].bad[0]], [two[0].bad[2], two[1].key]];
          return p;
        } }] }
    ]
  });

  /* ===== Lesson 6 — Roots of Real Numbers ===== */
  function cubeOrFifth(r) { return r.chance(0.5) ? { n: 4, m: r.int(2, 5) } : r.chance(0.5) ? { n: 5, m: r.int(2, 3) } : { n: 3, m: r.int(6, 10) }; }
  HW.defineExit({
    lesson: 'u1l6', calc: false, outcome: 'AN2',
    blurb: 'Evaluating roots of any index (including negative radicands and fractions), combining radicals, and all the real roots of a number.',
    questions: [
      { num: '1', outcome: 'AN2', stem: 'Evaluate mentally. Give each answer as an integer or a fraction.', parts: [
        { id: '1', outcome: 'AN2', level: 'BEG', make: function (r) {
          var A = cubeOrFifth(r), An = Math.pow(A.m, A.n), k = r.int(2, 5), c = r.int(2, 5), n3 = r.chance(0.5) ? 3 : 2;
          var fa = find(function () { return n3 === 3 ? [r.int(1, 3), r.int(2, 5)] : [r.int(1, 7), r.int(2, 10)]; }, function (v) { return v[0] < v[1] && gcd(v[0], v[1]) === 1; }, [2, 3]), neg = n3 === 3 && r.chance(0.6);
          var t1 = rt(A.n, F(An)), t2 = k + rt(3, '-' + Math.pow(c, 3)), t3 = rt(n3, (neg ? '-' : '') + '\\frac{' + Math.pow(fa[0], n3) + '}{' + Math.pow(fa[1], n3) + '}');
          var a3 = neg ? [-fa[0], fa[1]] : fa;
          var p = P.fields('Evaluate ' + t(t1) + ', ' + t(t2) + ' and ' + t(t3) + '.',
            [{ name: '(i)', before: t(t1 + '='), mode: 'math', keys: 'fraction' }, { name: '(ii)', before: t(t2 + '='), mode: 'math', keys: 'fraction' }, { name: '(iii)', before: t(t3 + '='), mode: 'math', keys: 'fraction' }],
            [K.value(A.m, { diag: function (v) { if (ex.eq(v, An / A.n)) return { code: 'u1x-root-div', hint: 'A root isn’t a division: find the number that, used as a factor ' + t(A.n) + ' times, gives ' + t(F(An)) + '.' }; if (ex.eq(v, Math.pow(A.m, A.n - 1)) || (A.n !== 2 && ex.eq(v, intRoot(An, 2) || -1))) return { code: 'u1x-root-index', hint: 'Check the index: you need ' + t('x^{' + A.n + '}=' + F(An)) + '.' }; return null; } }),
              K.value(-k * c, { diag: function (v) { if (ex.eq(v, -c)) return { code: 'u1x-root-coef', hint: t(rt(3, '-' + Math.pow(c, 3)) + '=-' + c) + ' — now multiply by the ' + t(k) + ' in front.' }; return null; } }),
              K.fraction(a3, { diag: function (v) { if (ex.eq(v, Math.pow(fa[0], n3) / Math.pow(fa[1], n3) / n3)) return { code: 'u1x-root-div', hint: 'Take the root of the top and of the bottom.' }; return null; } })],
            [String(A.m), String(-k * c), ex.texRat(a3)], t(t1 + '=' + A.m) + ', ' + t(t2 + '=' + (-k * c)) + ', ' + t(t3 + '=' + ex.texRat(a3)),
            t(t1 + '=' + A.m) + ' because ' + t(A.m + '^{' + A.n + '}=' + F(An)) + '.<br>' + t(rt(3, '-' + Math.pow(c, 3)) + '=-' + c) + ' because ' + t('(-' + c + ')^{3}=-' + Math.pow(c, 3)) + ', so ' + t(t2 + '=' + k + '(-' + c + ')=' + (-k * c)) + '.<br>' +
              t(t3 + '=' + (neg ? '-' : '') + '\\frac{' + rt(n3, Math.pow(fa[0], n3)) + '}{' + rt(n3, Math.pow(fa[1], n3)) + '}=' + ex.texRat(a3)) + (neg ? ' (an odd root of a negative is negative).' : '.'),
            ['Ask: what number, used as a factor that many times, gives the radicand?', 'An odd root of a negative number is negative. For a fraction, take the root of the top and of the bottom.'], 'evaluate roots');
          p.bad = [[String(Math.pow(A.m, A.n - 1)), String(-k * c), ex.texRat(a3)], [String(A.m), String(-c), ex.texRat(a3)], [String(A.m), String(k * c), ex.texRat(a3)]];
          return p;
        } }] },
      { num: '2', outcome: 'AN2', stem: '', parts: [
        { id: '2a', outcome: 'AN2', level: 'EMG', make: function (r) {
          var v = find(function () { var c = r.pick([2, 3, 5]), u = r.pick([2, 3, 5, 7, 11]), w = r.pick([2, 3, 5, 6, 7, 10, 11, 13]); return { c: c, a: c * u, b: w, x: u * w }; },
            function (v) { return !isPow(v.x, 2) && !isPow(v.a, 2) && v.a !== v.b && v.x !== v.a && v.x !== v.b && gcd(v.a / v.c, v.b) === 1 && v.b % v.c !== 0; }, { c: 2, a: 14, b: 6, x: 21 });
          var top = '\\sqrt{' + v.a + '}\\sqrt{' + v.b + '}', q = '\\dfrac{' + top + '}{\\sqrt{' + v.c + '}}';
          var p = P.radical('Write ' + t(q) + ' as a single radical ' + t('\\sqrt{x}') + '.', { k: 1, n: 2, m: v.x }, 'entire',
            t(q + '=\\sqrt{\\frac{' + v.a + '\\times ' + v.b + '}{' + v.c + '}}=\\sqrt{\\frac{' + v.a * v.b + '}{' + v.c + '}}=\\sqrt{' + v.x + '}') + '. (Multiply under one root, divide under one root.)',
            ['Use ' + t('\\sqrt{a}\\sqrt{b}=\\sqrt{ab}') + ' and ' + t('\\frac{\\sqrt{a}}{\\sqrt{b}}=\\sqrt{\\frac{a}{b}}') + '.'], 'single radical ' + v.a + '·' + v.b + '/' + v.c,
            { diag: function (val, rr) { if (rr && rr.n === 2 && rr.m === v.a * v.b * v.c && rr.k[0] === 1) return { code: 'u1x-rad-muldiv', hint: 'The ' + t('\\sqrt{' + v.c + '}') + ' is in the denominator: <b>divide</b> by ' + t(v.c) + ' under the root, don’t multiply.' }; if (rr && rr.n === 2 && rr.m === v.a * v.b && rr.k[0] === 1) return { code: 'u1x-rad-nodiv', hint: t('\\sqrt{' + v.a + '}\\sqrt{' + v.b + '}=\\sqrt{' + v.a * v.b + '}') + ' — now divide by the ' + t('\\sqrt{' + v.c + '}') + ' in the denominator: ' + t('\\frac{\\sqrt{a}}{\\sqrt{b}}=\\sqrt{\\frac{a}{b}}') + '.' }; if (rr && rr.n === 2 && rr.k[0] === 1 && (rr.m === v.a + v.b - v.c || rr.m === v.a + v.b)) return { code: 'u1x-rad-add', hint: 'Radicals multiply under one root: ' + t('\\sqrt{a}\\sqrt{b}=\\sqrt{ab}') + ' — the radicands are multiplied, not added.' }; return null; } });
          p.bad = ['\\sqrt{' + v.a * v.b * v.c + '}', '\\sqrt{' + (v.a + v.b - v.c) + '}', '\\sqrt{' + v.a * v.b + '}'].filter(function (b) { return b !== '\\sqrt{' + v.x + '}'; });
          return p;
        } },
        { id: '2b', outcome: 'AN2', level: 'EMG', make: function (r) {
          var v = find(function () { var n = r.pick([2, 3, 4]), a = r.int(1, n === 4 ? 3 : n === 3 ? 4 : 9), b = r.int(2, n === 4 ? 5 : n === 3 ? 6 : 12), c = r.int(1, 6), d = r.int(2, 9); return { n: n, a: a, b: b, c: c, d: d }; },
            function (v) { return v.a < v.b && gcd(v.a, v.b) === 1 && gcd(v.c, v.d) === 1 && (v.c * v.a) % 1 === 0 && Math.pow(v.b, v.n) <= 1300; }, { n: 4, a: 4, b: 5, c: 5, d: 4 });
          var A = Math.pow(v.a, v.n), B = Math.pow(v.b, v.n), ans = ex.norm(v.c * v.a, v.d * v.b), tx = '\\frac{' + v.c + '}{' + v.d + '}' + rt(v.n, '\\dfrac{' + F(A) + '}{' + F(B) + '}');
          var p = P.fraction('Evaluate ' + t(tx) + '.', ans, { diag: function (val) { if (ex.eq(val, v.a / v.b)) return { code: 'u1x-froot-coef', hint: t(rt(v.n, '\\frac{' + A + '}{' + B + '}') + '=\\frac{' + v.a + '}{' + v.b + '}') + ' — now multiply by ' + t('\\frac{' + v.c + '}{' + v.d + '}') + '.' }; if (ex.eq(val, v.c * A / (v.d * B))) return { code: 'u1x-root-div', hint: 'Take the ' + rootWord(v.n) + ' root of ' + t('\\frac{' + A + '}{' + B + '}') + ' first.' }; return null; } },
            t(rt(v.n, '\\frac{' + F(A) + '}{' + F(B) + '}') + '=\\frac{' + v.a + '}{' + v.b + '}') + ' because ' + t(v.a + '^{' + v.n + '}=' + F(A)) + ' and ' + t(v.b + '^{' + v.n + '}=' + F(B)) + '.<br>' + t('\\frac{' + v.c + '}{' + v.d + '}\\times\\frac{' + v.a + '}{' + v.b + '}=' + ex.texRat(ans)) + '.',
            ['Take the root of the top and of the bottom separately.', 'Then multiply by the fraction in front and reduce.'], 'evaluate ' + v.c + '/' + v.d + ' root' + v.n + ' ' + A + '/' + B);
          p.bad = [ex.texRat(ex.norm(v.a, v.b)), ex.texRat(ex.norm(v.c * A, v.d * B))].filter(function (b) { return b !== ex.texRat(ans); });
          return p;
        } }] },
      { num: '3', outcome: 'AN2', stem: 'State <b>all</b> the real roots asked for. Separate two roots with a comma (or use ' + t('\\pm') + '), and type <b>none</b> if there is no real root.', parts: [
        { id: '3', outcome: 'AN2', level: 'ADV', make: function (r) {
          var ne = r.pick([2, 4]), fa = find(function () { return ne === 4 ? [r.int(1, 3), r.int(2, 5)] : [r.int(1, 9), r.int(2, 11)]; }, function (v) { return v[0] < v[1] && gcd(v[0], v[1]) === 1; }, [2, 3]);
          var c = r.int(2, 5), oddN = r.pick([3, 5]), cv = oddN === 3 ? c : r.int(2, 3), d = r.pick([2, 4, 6]), dv = d === 2 ? Math.pow(r.int(3, 9), 2) : d === 4 ? Math.pow(r.int(2, 4), 4) : 64;
          var items = r.shuffle([
            { q: 'the real ' + (ne === 2 ? 'square' : 'fourth') + ' roots of ' + t('\\frac{' + Math.pow(fa[0], ne) + '}{' + Math.pow(fa[1], ne) + '}'), want: [fa[0] / fa[1], -fa[0] / fa[1]], even: true, neg: false, key: '\\pm\\frac{' + fa[0] + '}{' + fa[1] + '}', keyS: fa[0] + '/' + fa[1] + ', -' + fa[0] + '/' + fa[1],
              sol: t('\\left(\\frac{' + fa[0] + '}{' + fa[1] + '}\\right)^{' + ne + '}') + ' and ' + t('\\left(-\\frac{' + fa[0] + '}{' + fa[1] + '}\\right)^{' + ne + '}') + ' both equal ' + t('\\frac{' + Math.pow(fa[0], ne) + '}{' + Math.pow(fa[1], ne) + '}') + ' (even index): two roots, ' + t('\\pm\\frac{' + fa[0] + '}{' + fa[1] + '}') + '.' },
            { q: 'the real ' + (oddN === 3 ? 'cube' : 'fifth') + ' roots of ' + t('-' + Math.pow(cv, oddN)), want: [-cv], even: false, neg: true, key: '-' + cv, keyS: '-' + cv,
              sol: t('(-' + cv + ')^{' + oddN + '}=-' + Math.pow(cv, oddN)) + ', and an odd power keeps the sign, so ' + t('+' + cv) + ' doesn’t work: one root, ' + t('-' + cv) + '.' },
            { q: 'the real ' + (d === 2 ? 'square' : d === 4 ? 'fourth' : 'sixth') + ' roots of ' + t('-' + dv), want: [], even: true, neg: true, key: '\\text{none}', keyS: 'none',
              sol: 'Any real number raised to the even power ' + t(d) + ' is positive or zero, never ' + t('-' + dv) + ': <b>no real roots</b>.' }]);
          var p = P.fields('Give (i) ' + items[0].q + ', (ii) ' + items[1].q + ', (iii) ' + items[2].q + '.',
            items.map(function (x, i) { return { name: '(' + ['i', 'ii', 'iii'][i] + ')', label: '(' + ['i', 'ii', 'iii'][i] + ')', mode: 'text', wide: true, placeholder: 'e.g. 3, -3  or  none' }; }),
            items.map(function (x) { return rootsChk(x.want, x.even, x.neg); }), items.map(function (x) { return x.keyS; }), items.map(function (x, i) { return '(' + ['i', 'ii', 'iii'][i] + ') ' + t(x.key); }).join(', '),
            items.map(function (x, i) { return '(' + ['i', 'ii', 'iii'][i] + ') ' + x.sol; }).join('<br>'),
            ['An even index (2, 4, 6) gives two real roots of a positive number (' + t('\\pm') + ') and none of a negative number.', 'An odd index (3, 5) gives exactly one real root, with the same sign as the radicand.'], 'all real roots');
          var pos = items.map(function (x) { return x.even && !x.neg ? x.keyS.split(',')[0] : x.keyS; }), pm = items.map(function (x) { return x.neg && !x.even ? x.keyS + ', ' + x.keyS.slice(1) : x.keyS; }), nr = items.map(function (x) { return x.even && x.neg ? String(Math.round(Math.pow(dv, 1 / d))) : x.keyS; });
          p.bad = [pos, pm, nr];
          return p;
        } }] }
    ]
  });

  /* ===== Lesson 7 — Entire and Mixed Radicals ===== */
  var SQF = [2, 3, 5, 6, 7, 10, 11, 13, 14, 15];
  HW.defineExit({
    lesson: 'u1l7', calc: false, outcome: 'AN2',
    blurb: 'Entire radicals to mixed radicals and back, radicals with a number in front, and exact lengths with the Pythagorean theorem.',
    questions: [
      { num: '1', outcome: 'AN2', stem: '', parts: [
        { id: '1a', outcome: 'AN2', level: 'BEG', make: function (r) { var km = r.pick(BEG_RAD); return mixedPart(km[0], 2, km[1]); } },
        { id: '1b', outcome: 'AN2', level: 'BEG', make: function (r) { var km = r.pick(BEG_RAD.filter(function (x) { return x[0] <= 6; })); return entirePart(km[0], 2, km[1]); } }] },
      { num: '2', outcome: 'AN2', stem: '', parts: [
        { id: '2', outcome: 'AN2', level: 'PRG', make: function (r) {
          var v = find(function () { var s = r.int(3, 10), m = r.pick([2, 3, 5, 6, 7, 10, 11]), c = r.pick([[-2, 1], [-3, 1], [-4, 1], [-5, 1], [1, 2], [-1, 2], [1, 3], [2, 3], [-1, 3], [3, 4], [1, 4], [-2, 5]]); return { s: s, m: m, c: c }; },
            function (v) { var k = v.c[0] * v.s / v.c[1]; return v.s * v.s * v.m <= 700 && v.s * v.s * v.m >= 50 && k % 1 === 0 && Math.abs(k) > 1; }, { s: 6, m: 7, c: [-5, 1] });
          var N = v.s * v.s * v.m, k = v.c[0] * v.s / v.c[1], cT = v.c[1] === 1 ? String(v.c[0]) : (v.c[0] < 0 ? '-' : '') + '\\frac{' + Math.abs(v.c[0]) + '}{' + v.c[1] + '}';
          var p = P.radical('Write ' + t(cT + '\\sqrt{' + N + '}') + ' as a mixed radical in simplest form.', { k: k, n: 2, m: v.m }, 'mixed',
            t(cT + '\\sqrt{' + N + '}=' + cT + '\\sqrt{' + v.s * v.s + '\\times ' + v.m + '}=' + cT + '\\times ' + v.s + '\\sqrt{' + v.m + '}=' + rad(k, 2, v.m)) + '.',
            ['Simplify ' + t('\\sqrt{' + N + '}') + ' first: find its largest perfect-square factor.', 'Then multiply the number that comes out by the ' + t(cT) + ' in front.'], 'mixed radical ' + cT + 'sqrt' + N,
            { diag: function (val, rr) { if (rr && rr.n === 2 && rr.m === v.m && rr.k[1] === 1 && rr.k[0] === v.s) return { code: 'u1x-coef-forgot', hint: 'You simplified the root, but the ' + t(cT) + ' in front still multiplies it.' }; if (rr && rr.n === 2 && rr.m === v.m && rr.k[1] === 1 && v.c[1] === 1 && rr.k[0] === v.c[0] + v.s) return { code: 'u1x-coef-added', hint: 'Multiply the numbers in front, don’t add them: ' + t(cT + '\\times ' + v.s) + '.' }; return null; } });
          p.bad = [rad(v.s, 2, v.m), rad(-k, 2, v.m)].concat(v.c[1] === 1 ? [rad(v.c[0] + v.s, 2, v.m)] : []);
          return p;
        } }] },
      { num: '3', outcome: 'AN2',
        shared: function (r) {
          return find(function () { var d = sortN([r.int(2, 12), r.int(2, 12), r.int(2, 10)]); return [d[2], d[1], d[0]]; }, function (d) {
            var b2 = d[0] * d[0] + d[1] * d[1], s2 = b2 + d[2] * d[2], fb = ex.nthFactor(b2, 2), fs = ex.nthFactor(s2, 2);
            return d[0] !== d[1] && fb > 1 && b2 / (fb * fb) > 1 && fs > 1 && s2 / (fs * fs) > 1 && s2 <= 300;
          }, [4, 2, 6]);
        },
        stem: function (d) { return 'A rectangular storage box is ' + t(d[0]) + ' cm long, ' + t(d[1]) + ' cm wide and ' + t(d[2]) + ' cm tall.' + boxSvg(d[0], d[1], d[2]); },
        parts: [
          { id: '3', outcome: 'AN2', level: 'MAS', make: function (r, d) {
            var b2 = d[0] * d[0] + d[1] * d[1], s2 = b2 + d[2] * d[2], fb = ex.nthFactor(b2, 2), fs = ex.nthFactor(s2, 2), mb = b2 / (fb * fb), ms = s2 / (fs * fs);
            var two = [d[0] * d[0] + d[2] * d[2], d[1] * d[1] + d[2] * d[2]];
            var space = K.radical({ k: fs, n: 2, m: ms }, 'mixed', { diag: function (val, rr) {
              for (var i = 0; i < 2; i++) if (ex.eq(val, Math.sqrt(two[i]))) return { code: 'u1x-diag-2d', hint: 'That uses only two of the dimensions. ' + t('L') + ' is the hypotenuse of a right triangle whose legs are ' + t('d') + ' and the height ' + t(d[2]) + ': ' + t('L^{2}=d^{2}+' + d[2] + '^{2}') + '.' };
              if (ex.eq(val, d[0] + d[1] + d[2]) || ex.eq(val, Math.sqrt(b2) + d[2])) return { code: 'u1x-diag-sum', hint: 'Lengths along a slant don’t add. Use the Pythagorean theorem: ' + t('L^{2}=d^{2}+' + d[2] + '^{2}') + '.' };
              return null; } });
            var base = K.radical({ k: fb, n: 2, m: mb }, 'mixed', { diag: function (val) { if (ex.eq(val, d[0] + d[1])) return { code: 'u1x-diag-sum', hint: 'Use the Pythagorean theorem: ' + t('d^{2}=' + d[0] + '^{2}+' + d[1] + '^{2}') + '.' }; return null; } });
            var p = P.fields('Find the exact length of ' + t('d') + ', the diagonal across the bottom, and of ' + t('L') + ', the longest straight rod that fits in the box (from a bottom corner to the opposite top corner). Give each as a mixed radical in simplest form.',
              [{ name: 'd', before: t('d='), mode: 'math', keys: 'radical', after: 'cm' }, { name: 'L', before: t('L='), mode: 'math', keys: 'radical', after: 'cm' }], [base, space],
              [rad(fb, 2, mb), rad(fs, 2, ms)], t('d=' + rad(fb, 2, mb)) + ' cm, ' + t('L=' + rad(fs, 2, ms)) + ' cm',
              'Bottom face: ' + t('d^{2}=' + d[0] + '^{2}+' + d[1] + '^{2}=' + b2) + ', so ' + t('d=\\sqrt{' + b2 + '}=\\sqrt{' + fb * fb + '\\times ' + mb + '}=' + rad(fb, 2, mb)) + ' cm.<br>' +
                'The rod is the hypotenuse of a right triangle with legs ' + t('d') + ' and the height: ' + t('L^{2}=d^{2}+' + d[2] + '^{2}=' + b2 + '+' + d[2] * d[2] + '=' + s2) + ', so ' + t('L=\\sqrt{' + s2 + '}=\\sqrt{' + fs * fs + '\\times ' + ms + '}=' + rad(fs, 2, ms)) + ' cm.',
              ['The bottom diagonal ' + t('d') + ' is the hypotenuse of a right triangle with legs ' + t(d[0]) + ' and ' + t(d[1]) + '.', t('L') + ' stands on ' + t('d') + ' with the height ' + t(d[2]) + ' going straight up: ' + t('L^{2}=d^{2}+' + d[2] + '^{2}') + '. Keep ' + t('d^{2}') + ' exact.'], 'box diagonals ' + d.join('×'));
            p.bad = [[rad(fb, 2, mb), '\\sqrt{' + two[0] + '}'], [rad(fb, 2, mb), '\\sqrt{' + s2 + '}'], [String(d[0] + d[1]), rad(fs, 2, ms)]];
            return p;
          } }] }
    ]
  });

  /* ===== Lesson 8 — Index 3 and higher; radicals with variables ===== */
  function vt(x, e) { return e === 0 ? '' : e === 1 ? x : x + '^{' + e + '}'; }
  function varRadPart(prompt, c, n, s, vars, text) {
    // c·ⁿ√(s · Π x^e): s = k^n·m
    var k = ex.nthFactor(s, n), m = s / Math.pow(k, n), out = '', inn = '', outBad = '', inBad = '';
    vars.forEach(function (ve) { var q = Math.floor(ve[1] / n), rr = ve[1] % n; out += vt(ve[0], q); inn += vt(ve[0], rr); outBad += vt(ve[0], ve[1] - rr); inBad += vt(ve[0], rr); });
    var coef = c * k, inside = (m > 1 ? String(m) : '') + inn, target = (coef === 1 ? '' : coef === -1 ? '-' : String(coef)) + out + (inside ? rt(n, inside) : '');
    var given = (c === 1 ? '' : String(c)) + rt(n, F(s) + vars.map(function (ve) { return vt(ve[0], ve[1]); }).join(''));
    var vs = vars.map(function (ve) { return ve[0]; });
    var wrongs = [[String(coef) + outBad + (inside ? rt(n, inside) : ''), 'u1x-var-exp', 'When ' + t(vars[0][0] + '^{' + vars[0][1] + '}') + ' comes out of a ' + rootWord(n) + ' root, its exponent is <b>divided</b> by ' + t(n) + '.'],
      [String(c * Math.pow(k, n)) + out + (inside ? rt(n, inside) : ''), 'u1x-var-coef', 'The perfect ' + powWord(n) + ' ' + t(Math.pow(k, n)) + ' comes out as its ' + rootWord(n) + ' root, ' + t(k) + '.']];
    if (c !== 1) wrongs.push([String(k) + out + (inside ? rt(n, inside) : ''), 'u1x-coef-forgot', 'Don’t forget to multiply by the ' + t(c) + ' in front.']);
    var kd = knownDiag(wrongs.filter(function (w) { var a = ex.parse(w[0]), b = ex.parse(target); return a.ok && b.ok && !ex.equiv(a.ast, b.ast, vs, 6); }), vs);
    var p = P.math(prompt || 'Write ' + t(given) + ' as a mixed radical in simplest form.', K.varRadical(target, 'mixed', { diag: function (rr, ast) { return kd(ast); } }), target,
      t(given + '=' + (c === 1 ? '' : c) + rt(n, (k > 1 ? Math.pow(k, n) + '\\times ' : '') + (m > 1 ? m : '') + vars.map(function (ve) { var q = Math.floor(ve[1] / n), rr = ve[1] % n; return (q ? vt(ve[0], q * n) : '') + (rr ? '\\cdot ' + vt(ve[0], rr) : ''); }).join('\\cdot ')) + '=' + target) + '.<br>Each perfect ' + powWord(n) + ' comes out: ' + (k > 1 ? t(rt(n, Math.pow(k, n)) + '=' + k) + ', ' : '') + vars.filter(function (ve) { return ve[1] >= n; }).map(function (ve) { var q = Math.floor(ve[1] / n); return t(rt(n, vt(ve[0], q * n)) + '=' + vt(ve[0], q)); }).join(', ') + (c !== 1 ? '; then multiply by the ' + t(c) + ' in front' : '') + '.',
      ['Split the radicand into the largest perfect ' + powWord(n) + ' and what is left. For a variable, use the largest exponent that is a multiple of ' + t(n) + '.', 'Divide those exponents by ' + t(n) + ' as they come out of the root.'], text, { keys: 'expo', vars: vs });
    p.bad = wrongs.map(function (w) { return w[0]; }).filter(function (b) { return b !== target; });
    return p;
  }
  HW.defineExit({
    lesson: 'u1l8', calc: false, outcome: 'AN2',
    blurb: 'Mixed and entire radicals with index 3 and higher, and simplifying radicals with variables.',
    questions: [
      { num: '1', outcome: 'AN2', stem: '', parts: [
        { id: '1a', outcome: 'AN2', level: 'EMG', make: function (r) { var km = r.pick(radPool(3, [2, 5], 16, 1000).filter(function (x) { return x[1] <= 7; })); return mixedPart(km[0], 3, km[1]); } },
        { id: '1b', outcome: 'AN2', level: 'EMG', make: function (r) {
          if (r.chance(0.5)) { var km = r.pick(radPool(3, [2, 5], 16, 800).filter(function (x) { return x[1] <= 7; })); return entirePart(r.chance(0.4) ? -km[0] : km[0], 3, km[1]); }
          var k4 = r.pick(radPool(4, [2, 3], 32, 900).filter(function (x) { return x[1] <= 10; })); return entirePart(k4[0], 4, k4[1]);
        } }] },
      { num: '2', outcome: 'AN2', stem: 'Assume every variable is positive.', parts: [
        { id: '2', outcome: 'AN2', level: 'PRG', make: function (r) {
          var v = find(function () { var s = r.int(2, 6), m = r.pick([2, 3, 5, 6, 7]), L = r.pick([['a', 'b'], ['x', 'y'], ['m', 'n']]); return { s: s, m: m, L: L, e1: r.int(2, 9), e2: r.int(1, 8) }; },
            function (v) { return (v.e1 % 2 === 1 || v.e2 % 2 === 1) && v.e1 !== v.e2 && v.s * v.s * v.m <= 250 && (v.e1 >= 2 && v.e2 >= 2); }, { s: 6, m: 3, L: ['a', 'b'], e1: 5, e2: 7 });
          return varRadPart(null, 1, 2, v.s * v.s * v.m, [[v.L[0], v.e1], [v.L[1], v.e2]], 'mixed radical with variables');
        } }] },
      { num: '3', outcome: 'AN2', stem: 'Assume every variable is positive.', parts: [
        { id: '3', outcome: 'AN2', level: 'ADV', make: function (r) {
          var n = r.chance(0.6) ? 3 : 4;
          var v = find(function () { var k = r.int(2, n === 3 ? 5 : 3), m = r.pick(n === 3 ? [2, 3, 4, 5, 6] : [2, 3, 5]), c = r.pick([1, 1, 2, 3]), e = r.int(n === 3 ? 7 : 9, n === 3 ? 14 : 15), x = r.pick(['a', 'x', 'y']); return { k: k, m: m, c: c, e: e, x: x }; },
            function (v) { return v.e % n !== 0 && Math.pow(v.k, n) * v.m <= 700; }, { k: 6, m: 3, c: 3, e: 14, x: 'a' });
          return varRadPart(null, v.c, n, Math.pow(v.k, n) * v.m, [[v.x, v.e]], 'index ' + n + ' radical with a variable');
        } }] }
    ]
  });

  /* ===== Lesson 9 — Number Unit Review (AN1 and AN2) ===== */
  HW.defineExit({
    lesson: 'u1l9', calc: false, outcome: 'AN1',
    blurb: 'A short mix of the unit: LCM, a mixed radical, perfect squares and cubes, and exact lengths of a square.',
    questions: [
      { num: '1', outcome: 'AN1', stem: '', parts: [
        { id: '1', outcome: 'AN1', level: 'BEG', make: function (r) {
          var v = find(function () { return sortN(r.sample([4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 21, 24], 2)); }, function (v) { return gcd(v[0], v[1]) > 1 && v[1] % v[0] !== 0 && lcm(v[0], v[1]) <= 120; }, [8, 12]);
          var L = lcm(v[0], v[1]), ms = []; for (var i = 1; i <= L / v[1]; i++) ms.push(v[1] * i);
          var p = P.number('Find the least common multiple of ' + nlist(v) + '.', L, lcmDiag(v),
            'Multiples of ' + t(v[1]) + ': ' + t(ms.join(',\\ ')) + '. The first one that ' + t(v[0]) + ' also divides is ' + t(L) + '. (With primes: ' + v.map(facEq).join(', ') + ', so ' + t('\\text{LCM}=' + K.fac(L) + '=' + L) + '.)',
            ['List the multiples of ' + t(v[1]) + ' until you reach one that ' + t(v[0]) + ' divides into.'], 'LCM of ' + v.join(', '), { before: t('\\text{LCM}=') });
          p.bad = [String(v[0] * v[1]), String(gcd(v[0], v[1]))];
          return p;
        } }] },
      { num: '2', outcome: 'AN2', stem: '', parts: [
        { id: '2', outcome: 'AN2', level: 'BEG', make: function (r) { var km = r.pick(BEG_RAD); return mixedPart(km[0], 2, km[1]); } }] },
      { num: '3', outcome: 'AN1', stem: 'Use prime factorization.', parts: [
        { id: '3', outcome: 'AN1', level: 'PRG', make: function (r) {
          var kind = r.pick(['sq', 'cu', 'both', 'neither']);
          var n = kind === 'sq' ? Math.pow(r.pick([14, 15, 18, 20, 21, 22, 24, 26, 28, 30, 33, 35, 36, 40, 42, 45]), 2) : kind === 'cu' ? Math.pow(r.pick([6, 10, 12, 14, 15, 18, 20, 21]), 3) : kind === 'both' ? Math.pow(r.pick([2, 3, 5, 6]), 6) :
            find(function () { var ps = sortN(r.sample([2, 3, 5, 7], 2)); return fVal(ps.map(function (q) { return [q, r.int(2, 5)]; })); }, function (x) { var k = sqcubeOf(x); return !k.sq && !k.cu && x >= 500 && x <= 8000; }, 1800);
          var k = sqcubeOf(n), sr = k.sq ? intRoot(n, 2) : null, cr = k.cu ? intRoot(n, 3) : null, f = nt.factor(n);
          var label = k.sq && k.cu ? 'both' : k.sq ? 'a perfect square only' : k.cu ? 'a perfect cube only' : 'neither';
          var p = P.fields('Is ' + t(F(n)) + ' a perfect square, a perfect cube, both, or neither? Write its prime factorization, then give each root that is a whole number. Type <b>none</b> for a root that is not a whole number.',
            [{ name: 'Prime factorization', before: t(F(n) + '='), mode: 'math', wide: true }, { name: 'Square root', before: t('\\sqrt{' + F(n) + '}='), mode: 'math', none: true }, { name: 'Cube root', before: t('\\sqrt[3]{' + F(n) + '}='), mode: 'math', none: true }],
            [prodChk(n, 'either'), rootOrNone(sr, 2, F(n), cr != null ? [{ v: cr, code: 'u1x-roots-swap', hint: 'That’s the <b>cube</b> root. For the square root, halve each exponent.' }] : []), rootOrNone(cr, 3, F(n), sr != null ? [{ v: sr, code: 'u1x-roots-swap', hint: 'That’s the <b>square</b> root. For the cube root, divide each exponent by 3.' }] : [])],
            [plainFac(n), k.sq ? String(sr) : 'none', k.cu ? String(cr) : 'none'],
            t(F(n) + '=' + K.fac(n)) + ' — ' + label + (k.sq ? '; ' + t('\\sqrt{' + F(n) + '}=' + F(sr)) : '') + (k.cu ? '; ' + t('\\sqrt[3]{' + F(n) + '}=' + F(cr)) : ''),
            t(F(n) + '=' + K.fac(n)) + '.<br><b>Square?</b> ' + (k.sq ? 'Every exponent is even, so yes: ' + t('\\sqrt{' + F(n) + '}=' + fTex(f.map(function (pe) { return [pe[0], pe[1] / 2]; })) + '=' + F(sr)) + '.' : 'Not every exponent is even, so no.') +
              '<br><b>Cube?</b> ' + (k.cu ? 'Every exponent is a multiple of 3, so yes: ' + t('\\sqrt[3]{' + F(n) + '}=' + fTex(f.map(function (pe) { return [pe[0], pe[1] / 3]; })) + '=' + F(cr)) + '.' : 'Not every exponent is a multiple of 3, so no.'),
            ['Factor ' + t(F(n)) + ' into primes and look at the exponents.', 'Square: every exponent even. Cube: every exponent a multiple of 3. Divide the exponents by 2 or 3 to get the root.'], 'square/cube/both/neither ' + n);
          p.bad = [[plainFac(n), k.sq ? 'none' : '7', k.cu ? 'none' : '7'], [plainFac(n), k.cu ? String(cr) : 'none', k.sq ? String(sr) : 'none']].filter(function (b) { return b.join('|') !== p.key.join('|'); });
          return p;
        } }] },
      { num: '4', outcome: 'AN2',
        shared: function (r) { return find(function () { return { m: r.pick([2, 3, 5, 6, 7]), k: r.int(2, 7), what: r.pick(['patio', 'quilt', 'garden', 'mural', 'rug']) }; }, function (s) { return s.m * s.k * s.k <= 200; }, { m: 2, k: 6, what: 'patio' }); },
        stem: function (s) { return 'A square ' + s.what + ' has an area of ' + t(s.m * s.k * s.k + '\\text{ m}^{2}') + '.'; },
        parts: [
          { id: '4', outcome: 'AN2', level: 'MAS', make: function (r, s) {
            var A = s.m * s.k * s.k, d2 = 2 * A, fd = ex.nthFactor(d2, 2), md = d2 / (fd * fd);
            var side = K.radical({ k: s.k, n: 2, m: s.m }, 'mixed', { diag: function (val) { if (ex.eq(val, A / 2)) return { code: 'u1x-sq-half', hint: 'The side isn’t half the area: the area of a square is side × side, so the side is ' + t('\\sqrt{' + A + '}') + '.' }; return null; } });
            var per = K.radical({ k: 4 * s.k, n: 2, m: s.m }, 'mixed', { diag: function (val) { if (ex.eq(val, 2 * s.k * Math.sqrt(s.m))) return { code: 'u1x-sq-perim', hint: 'A square has <b>four</b> equal sides: perimeter ' + t('=4s') + '.' }; return null; } });
            var dg = K.radical({ k: fd, n: 2, m: md }, 'mixed', { diag: function (val) { if (ex.eq(val, s.k * Math.sqrt(s.m))) return { code: 'u1x-sq-diag-side', hint: 'That’s the side. The diagonal is the hypotenuse: ' + t('d^{2}=s^{2}+s^{2}') + '.' }; return null; } });
            var dTex = md === 1 ? String(fd) : rad(fd, 2, md);
            var p = P.fields('Find the <b>exact</b> side length, perimeter and diagonal of the ' + s.what + '. Write radicals in simplest form.',
              [{ name: 'Side', label: 'Side:', mode: 'math', keys: 'radical', after: 'm' }, { name: 'Perimeter', label: 'Perimeter:', mode: 'math', keys: 'radical', after: 'm' }, { name: 'Diagonal', label: 'Diagonal:', mode: 'math', keys: 'radical', after: 'm' }],
              [side, per, dg], [rad(s.k, 2, s.m), rad(4 * s.k, 2, s.m), dTex], 'side ' + t(rad(s.k, 2, s.m)) + ' m, perimeter ' + t(rad(4 * s.k, 2, s.m)) + ' m, diagonal ' + t(dTex) + ' m',
              'Side: ' + t('s=\\sqrt{' + A + '}=\\sqrt{' + s.k * s.k + '\\times ' + s.m + '}=' + rad(s.k, 2, s.m)) + ' m.<br>Perimeter: ' + t('4\\times ' + rad(s.k, 2, s.m) + '=' + rad(4 * s.k, 2, s.m)) + ' m.<br>Diagonal: ' + t('d^{2}=s^{2}+s^{2}=' + A + '+' + A + '=' + d2) + ', so ' + t('d=\\sqrt{' + d2 + '}' + (md === 1 ? '=' + fd : '=\\sqrt{' + fd * fd + '\\times ' + md + '}=' + dTex)) + ' m.',
              ['Area of a square = side × side, so the side is the square root of the area.', 'The diagonal is the hypotenuse of a right triangle whose legs are two sides: ' + t('d^{2}=s^{2}+s^{2}') + '.'], 'square area ' + A + ': side, perimeter, diagonal');
            p.bad = [[rad(s.k, 2, s.m), rad(2 * s.k, 2, s.m), dTex], [rad(s.k, 2, s.m), rad(4 * s.k, 2, s.m), rad(s.k, 2, s.m)]].concat(A % 2 ? [] : [[String(A / 2), rad(4 * s.k, 2, s.m), dTex]]);
            return p;
          } }] }
    ]
  });
})(window);
