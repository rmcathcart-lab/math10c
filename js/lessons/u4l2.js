/* Math 10C · Unit 4 · Lesson 2 — Factoring Trinomials of the Form x² + bx + c (AN5)
 * Assignment questions 1–23 (u4_L02.tex) and the Lesson 2 Extra Practice (u4_EP02.tex).
 * Every part is a generator that keeps the booklet question's structure (sign pattern of b and c, a common factor to
 * take out first, a negative leading coefficient, a second variable, a perfect square, a trinomial that does not
 * factor) and changes the numbers; the booklet's own numbers are among the possible values.
 * Each trinomial is built from its factors (`spec` below), so the key is always the factorization the question was made
 * from. Wrong factorizations are diagnosed from the student's two numbers (right product / wrong sum, right sum / wrong
 * product, wrong signs, product and sum swapped), a dropped or partial common factor and a missing second variable.
 * "Factor where possible" parts use one box with a <b>none</b> key, so the input never gives away which ones factor.
 * Levels: LIM BEG EMG PRG ADV MAS. */
(function (root) {
  'use strict';
  var HW = root.HW, K = HW.kit, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form, B = K.P, P = HW.poly, FX = HW.factor;

  HW.addCodes({
    'pair-sum': 'Pair with the right product but the wrong sum', 'pair-product': 'Pair with the right sum but the wrong product',
    'pair-signs': 'Pair with the wrong signs', 'swap-bc': 'Numbers multiply to b and add to c (roles swapped)',
    'gcf-dropped': 'Dropped the common factor', 'gcf-part': 'Took out only part of the GCF', 'y-missing': 'Second variable missing from a bracket',
    'said-none': 'Said it can’t be factored (it can)', 'no-pair': 'Wrote factors for a trinomial that doesn’t factor', 'use-none': 'Retyped a trinomial that doesn’t factor',
    'tile-colour': 'Ignored the colours (signs) of the tiles', 'tile-count': 'Mixed up x-tiles and unit tiles', 'sign-in-blank': 'Typed a sign the bracket already shows',
    'gave-sum': 'Gave the sum instead of the missing number', 'sq-no-middle': 'Perfect square written without its middle term', 'gave-product': 'Gave the product instead of the missing number',
    'swap-letters': 'Swapped the values of two letters', 'decode': 'Decoded the message wrongly', 'swap-dims': 'Length and width swapped',
    'other-number': 'Gave the other number in the pair instead of the coefficient', 'not-largest': 'Gave a valid b that isn’t the largest', 'gave-c': 'Gave c instead of b',
    'half-k': 'Gave n instead of 2n', 'no-negatives': 'Forgot the negative values', 'not-b': 'Listed a value that isn’t a pair sum', 'missing-b': 'Missed some values of b',
    'sum-squares': 'Factored a sum of squares', 'fl-only': 'Expanded with only First and Last', 'not-subst': 'Substitution slip', 'digits': 'Wrong digit order / extra digits'
  });

  /* ---------------- small tools ---------------- */
  function pickWhere(gen, test) { for (var i = 0; i < 800; i++) { var o = gen(); if (test(o)) return o; } throw new Error('u4l2: no instance found'); }
  function sg(n) { return n < 0 ? '-' + (-n) : '+' + n; }
  function par(n) { return n < 0 ? '(' + n + ')' : String(n); }
  function V(v, e) { var o = {}; o[v] = e || 1; return P.mono(1, o); }
  function bin(u, n, w) { return P.add(u, P.scale(w || P.num(1), n)); }
  function tx(p) { return P.tex(p); }
  function isSq(n) { if (n < 0) return false; var s = Math.round(Math.sqrt(n)); return s * s === n; }
  function factorable(b, c) { return isSq(b * b - 4 * c); }
  function posPairs(n) { n = Math.abs(n); var o = []; for (var u = 1; u * u <= n; u++) if (n % u === 0) o.push([u, n / u]); return o; }
  function pairsTex(n) { return posPairs(n).map(function (pq) { return pq[0] + '\\times ' + pq[1]; }).join(',\\ \\ '); }
  /* every signed pair with product c, and its sum */
  function signedPairs(c) { var o = []; posPairs(c).forEach(function (pq) { if (c > 0) { o.push([pq[0], pq[1]]); o.push([-pq[0], -pq[1]]); } else { o.push([pq[0], -pq[1]]); o.push([-pq[0], pq[1]]); } }); return o; }
  function triTex(v, b, c) { return tx(P.add(V(v, 2), P.scale(V(v), b), P.num(c))); }
  function varsOf(p) { var vs = P.vars(p); return vs.length ? vs : ['x']; }
  function signHint(b, c) {
    if (c > 0) return b > 0 ? 'The product is positive and the sum is positive, so <b>both</b> integers are positive.' : 'The product is positive but the sum is negative, so <b>both</b> integers are negative.';
    if (b === 0) return 'The product is negative, so one integer is positive and one is negative; a sum of ' + t('0') + ' means they are the same size.';
    return 'The product is negative, so one integer is positive and one is negative; the one further from ' + t('0') + ' has the same sign as the sum, ' + t(b) + '.';
  }

  /* ---------------- a factorable trinomial, built from its factors ----------------
   * o = { v: 'x', e: 1 (power of the letter), y: second letter, G: common factor (polynomial), p, q }
   * full = G · (u + p·w)(u + q·w), where u = v^e and w = y (or 1). */
  function spec(o) {
    var u = o.u || V(o.v || 'x', o.e || 1), w = o.y ? V(o.y) : null, G = o.G || P.num(1);
    var A = bin(u, o.p, w), Bq = bin(u, o.q, w), inner = P.mul(A, Bq), full = P.mul(G, inner), g1 = P.eq(G, P.num(1));
    var list = o.p === o.q ? [{ p: A, k: 2 }] : [A, Bq];
    if (!g1) list = [G].concat(list);
    var gt = tx(G);
    return { u: u, w: w, G: G, g1: g1, p: o.p, q: o.q, b: o.p + o.q, c: o.p * o.q, A: A, B: Bq, inner: inner, full: full, list: list, key: FX.tex(list),
      gtex: gt, gpre: gt === '-1' ? '-' : gt };
  }
  function coefRel(S, m) { var tm = P.terms(m)[0], c = P.coef(S, tm.v); return (c[0] * tm.c[1]) / (c[1] * tm.c[0]); }
  /* reads the student's two numbers from the product of their factors and says what is off */
  function pairDiag(s) {
    var m2 = P.mul(s.G, P.pow(s.u, 2)), m1 = P.mul(s.G, s.u, s.w || 1), m0 = P.mul(s.G, s.w ? P.pow(s.w, 2) : 1);
    var b = s.b, c = s.c, inside = s.g1 ? '' : ' (inside the bracket)';
    return function (S) {
      var L = coefRel(S, m2), M = coefRel(S, m1), C = coefRel(S, m0);
      if (L !== 1 || M % 1 || C % 1) return null;
      if (!P.eq(S, P.add(m2, P.scale(m1, M), P.scale(m0, C)))) return null;
      var pre = 'Your factors multiply to ' + t(tx(S)) + ', not ' + t(tx(s.full)) + '. ';
      if (C === c && M === -b) return { code: 'pair-signs', hint: pre + 'Your numbers multiply to ' + t(c) + ' but add to ' + t(-b) + ', not ' + t(b) + ': the signs are backwards. ' + signHint(b, c) };
      if (M === c && C === b && b !== c) return { code: 'swap-bc', hint: pre + 'Your numbers multiply to ' + t(b) + ' and add to ' + t(c) + ' — the wrong way round. They must <b>multiply to the constant</b> ' + t(c) + ' and <b>add to the middle coefficient</b> ' + t(b) + inside + '.' };
      if (C === c) return { code: 'pair-sum', hint: pre + 'Your numbers multiply to ' + t(c) + ' ✓ but add to ' + t(M) + ', not ' + t(b) + '. Try another factor pair of ' + t(Math.abs(c)) + '.' };
      if (M === b && C === -c) return { code: 'pair-signs', hint: pre + 'Your numbers add to ' + t(b) + ' ✓ but multiply to ' + t(-c) + ', not ' + t(c) + '. ' + (c > 0 ? 'A positive product needs two numbers with the <b>same</b> sign.' : 'A negative product needs one positive and one negative number.') };
      if (M === b) return { code: 'pair-product', hint: pre + 'Your numbers add to ' + t(b) + ' ✓ but multiply to ' + t(C) + ', not ' + t(c) + '. The last terms of the brackets must multiply to the constant term' + inside + '.' };
      if (C === -c && M === -b) return { code: 'pair-signs', hint: pre + 'Every sign in your brackets is backwards. The numbers must multiply to ' + t(c) + ' and add to ' + t(b) + '.' };
      if (C === -c) return { code: 'pair-signs', hint: pre + 'Your numbers multiply to ' + t(C) + ', not ' + t(c) + '. ' + (c > 0 ? 'A positive product needs two numbers with the <b>same</b> sign.' : 'A negative product needs one positive and one negative number.') + ' Then choose the pair that adds to ' + t(b) + '.' };
      return null;
    };
  }
  /* classic wrong factorizations: dropped / partial GCF, a missing second variable */
  function stdWrongs(s) {
    var out = [];
    if (!s.g1) {
      out.push({ is: s.inner, code: 'gcf-dropped', hint: 'Your brackets are right, but the common factor ' + t(s.gtex) + ' is missing. Multiply your answer out: you get ' + t(tx(s.inner)) + ', not ' + t(tx(s.full)) + '.' });
      var gt = P.terms(s.G)[0], gv = Object.keys(gt.v).length, gn = gt.c[0] / gt.c[1];
      if (gv && Math.abs(gn) !== 1) {
        out.push({ is: P.mul(P.num(gn), s.inner), code: 'gcf-part', hint: 'Take out the <b>whole</b> common factor: every term also has a factor of ' + t(P.monoTex(gt.v)) + '. The GCF is ' + t(s.gtex) + '.' });
        out.push({ is: P.mul(P.mono(gn < 0 ? -1 : 1, gt.v), s.inner), code: 'gcf-part', hint: 'Take out the <b>whole</b> common factor: every coefficient is also divisible by ' + t(Math.abs(gn)) + '. The GCF is ' + t(s.gtex) + '.' });
      } else if (gv) out.push({ is: P.mul(P.num(gn), s.inner), code: 'gcf-part', hint: 'Take out the <b>whole</b> common factor: every term also has a factor of ' + t(P.monoTex(gt.v)) + '. The GCF is ' + t(s.gtex) + '.' });
    }
    if (s.w) {
      var yh = 'Each bracket needs its own ' + t(tx(s.w)) + ': the last term ' + t(tx(P.mul(P.num(s.c), P.pow(s.w, 2)))) + ' comes from multiplying the two last terms, so each must supply one ' + t(tx(s.w)) + '.';
      out.push({ is: P.mul(s.G, bin(s.u, s.p), bin(s.u, s.q, s.w)), code: 'y-missing', hint: yh });
      out.push({ is: P.mul(s.G, bin(s.u, s.p, s.w), bin(s.u, s.q)), code: 'y-missing', hint: yh });
      out.push({ is: P.mul(s.G, bin(s.u, s.p), bin(s.u, s.q)), code: 'y-missing', hint: 'Don’t leave out ' + t(tx(s.w)) + ': factor it like ' + t(tx(P.mul(bin(s.u, s.p), bin(s.u, s.q)))) + ', then put ' + t(tx(s.w)) + ' with the second term of each bracket.' });
    }
    return out.filter(function (w) { return !P.eq(w.is, s.full); });
  }
  function foilTex(s) {
    var w = s.w || P.num(1);
    return P.seq([P.pow(s.u, 2), P.mul(s.u, w, P.num(s.q)), P.mul(s.u, w, P.num(s.p)), P.mul(P.pow(w, 2), P.num(s.c))].filter(function (x) { return P.count(x); }));
  }
  function solFac(s, opt) {
    opt = opt || {};
    var out = [], ride = s.w ? ' The ' + t(tx(s.w)) + ' rides along with the second term of each bracket.' : '';
    if (!s.g1) out.push('Take out the common factor ' + t(s.gtex) + ' first: ' + t(tx(s.full) + '=' + s.gpre + '(' + tx(s.inner) + ')') + '.');
    if (P.degree(s.u) > 1 && !s.w) out.push('Think of it as a trinomial in ' + t(tx(s.u)) + ': ' + t('(' + tx(s.u) + ')^{2}=' + tx(P.pow(s.u, 2))) + '.');
    out.push('Two integers with product ' + t(s.c) + ' and sum ' + t(s.b) + ': ' + t(sg(s.p)) + ' and ' + t(sg(s.q)) + '.' + ride);
    out.push(t(tx(s.full) + '=' + s.key));
    if (opt.check) out.push('Check: ' + t('(' + tx(s.A) + ')(' + tx(s.B) + ')=' + foilTex(s) + '=' + tx(s.inner)) + ' ✓');
    return out.join('<br>');
  }
  function hintsFac(s) {
    var pair = 'Look for two integers with product ' + t(s.c) + ' and sum ' + t(s.b) + '.';
    if (!s.g1) return ['Every term has a common factor of ' + t(s.gtex) + '. Take it out first, then factor the trinomial left in the bracket.', pair + ' ' + signHint(s.b, s.c)];
    if (s.w) return [pair + ' ' + signHint(s.b, s.c), 'Each bracket has the form ' + t('(' + tx(s.u) + '+\\square ' + tx(s.w) + ')') + '.'];
    return [pair, signHint(s.b, s.c)];
  }
  /* "factor (completely)" part */
  function facPart(s, opt) {
    opt = opt || {};
    var prompt = opt.prompt || t(tx(s.full));
    var part = B.factored(prompt, s.list, { wrong: stdWrongs(s).concat(opt.wrong || []), diag: pairDiag(s), keyTex: s.key, vars: varsOf(s.full) },
      opt.sol || solFac(s, opt), opt.hints || hintsFac(s), opt.text || 'factor ' + tx(s.full));
    var A = '(' + tx(s.A) + ')', Bt = '(' + tx(s.B) + ')', pre = s.g1 ? '' : s.gpre;
    part.good = [pre + Bt + A];
    if (s.gtex === '-1') part.good.push('(' + tx(P.neg(s.A)) + ')' + Bt);
    if (s.p === s.q) part.good.push(pre + A + A);
    var flip = P.mul(s.G, bin(s.u, -s.p, s.w), bin(s.u, -s.q, s.w)), bad = [];
    if (!P.eq(flip, s.full)) bad.push(pre + '(' + tx(bin(s.u, -s.p, s.w)) + ')(' + tx(bin(s.u, -s.q, s.w)) + ')');
    if (!s.g1) bad.push(A + Bt);
    part.bad = bad.concat(opt.bad || []);
    return part;
  }

  /* ---------------- "factor where possible": one box with a none key ---------------- */
  function noneField(vars) { return [{ name: 'Factored form', label: 'Factored form', mode: 'math', keys: 'poly', vars: vars, none: true, wide: true, placeholder: 'e.g. (x - 4)(x + 2)' }]; }
  function noneVal(resp) { var v = String((resp || [])[0] || '').trim(); return /^\\(text|mathrm)\{\s*none\s*\}$/i.test(v) ? 'none' : v; }
  var NONE_EMPTY = 'Type the factored form, or press <b>none</b> if it can’t be factored over the integers.';
  function canPart(s, opt) {
    var base = facPart(s, opt), chk = base.check;
    return { prompt: base.prompt, input: { type: 'fields', fields: noneField(varsOf(s.full)) }, key: [base.key], answer: base.answer, solution: base.solution, hints: base.hints, text: base.text,
      check: function (resp) {
        var v = noneVal(resp);
        if (!v) return form('empty', NONE_EMPTY);
        if (/^none$/i.test(v)) return wrong('said-none', 'It <b>can</b> be factored: there is a pair of integers with product ' + t(s.c) + ' and sum ' + t(s.b) + '. Go through the factor pairs of ' + t(Math.abs(s.c)) + ' again. ' + signHint(s.b, s.c));
        return chk(v);
      },
      good: base.good.map(function (g) { return [g]; }), bad: [['none']].concat(base.bad.map(function (b) { return [b]; })) };
  }
  function nonePart(v, b, c, opt) {
    opt = opt || {};
    var T = P.add(V(v, 2), P.scale(V(v), b), P.num(c)), sp = signedPairs(c);
    var sol = 'Need two integers with product ' + t(c) + ' and sum ' + t(b) + '.<br>Pairs with product ' + t(c) + ': ' + sp.map(function (pq) { return t(pq[0] + '\\ \\&\\ ' + pq[1]) + ' (sum ' + t(pq[0] + pq[1]) + ')'; }).join(', ') + '.<br>No pair has sum ' + t(b) + ', so ' + t(tx(T)) + ' <b>cannot be factored</b> over the integers.';
    var near = sp.slice().sort(function (x, y) { return Math.abs(x[0] + x[1] - b) - Math.abs(y[0] + y[1] - b); })[0];
    return { prompt: opt.prompt || t(tx(T)), input: { type: 'fields', fields: noneField([v]) }, key: ['none'], answer: 'It cannot be factored over the integers.', solution: sol,
      hints: ['List every pair of integers with product ' + t(c) + ' and add each pair. Is any sum equal to ' + t(b) + '?', 'If no pair works, the trinomial cannot be factored over the integers — press <b>none</b>.'], text: opt.text || 'factor where possible ' + tx(T) + ' (none)',
      check: function (resp) {
        var s = noneVal(resp);
        if (!s) return form('empty', NONE_EMPTY);
        if (/^none$/i.test(s)) return ok();
        var a = K.read(s); if (a.res) return a.res;
        var spl = FX.split(a.ast); if (!spl.ok) return wrong('value', null);
        var S = spl.factors.reduce(function (acc, f) { return P.mul(acc, P.pow(f.p, f.k)); }, P.num(1));
        if (P.eq(S, T)) return form('use-none', 'That is the trinomial itself. If no pair of integers works, press <b>none</b>.');
        return wrong('no-pair', 'Your factors multiply to ' + t(tx(S)) + ', not ' + t(tx(T)) + '. Test every pair of integers with product ' + t(c) + ': does any pair add to ' + t(b) + '?');
      },
      bad: [['(' + tx(bin(V(v), near[0])) + ')(' + tx(bin(V(v), near[1])) + ')'], [tx(T)]] };
  }

  /* ---------------- two integers with a given sum and product ---------------- */
  function pairSol(p, q) {
    var s = p + q, c = p * q;
    return signHint(s, c) + '<br>Factor pairs of ' + t(Math.abs(c)) + ': ' + t(pairsTex(c)) + '.<br>' + t(sg(p)) + ' and ' + t(sg(q)) + ': product ' + t(par(p) + '\\times ' + par(q) + '=' + c) + ', sum ' + t(par(p) + '+' + par(q) + '=' + s) + ' ✓';
  }
  function pairCheck(p, q, labels) {
    var s = p + q, c = p * q;
    return function (resp) {
      resp = resp || [];
      var A = HW.parse.number(resp[0] == null ? '' : resp[0]), Bn = HW.parse.number(resp[1] == null ? '' : resp[1]);
      if (!A.ok || !Bn.ok) return form('empty', 'Enter one integer in each box.');
      var x = A.value, y = Bn.value;
      if ((x === p && y === q) || (x === q && y === p)) return ok();
      var both = 'Yours: ' + t(par(x) + '\\times ' + par(y) + '=' + x * y) + ' and ' + t(par(x) + '+' + par(y) + '=' + (x + y)) + '. ';
      if (x * y === c && x + y === -s) return wrong('pair-signs', both + 'Right product, but the sum must be ' + t(s) + ', not ' + t(-s) + '. ' + signHint(s, c));
      if (x * y === c) return wrong('pair-sum', both + 'The product is right ✓ but the sum must be ' + t(s) + '. Try another factor pair of ' + t(Math.abs(c)) + '.');
      if (x + y === s && x * y === -c) return wrong('pair-signs', both + 'The sum is right ✓ but the product must be ' + t(c) + '. ' + (c > 0 ? 'A positive product needs two numbers with the same sign.' : 'A negative product needs one positive and one negative number.'));
      if (x + y === s) return wrong('pair-product', both + 'The sum is right ✓ but the product must be ' + t(c) + '. Start from the factor pairs of ' + t(Math.abs(c)) + ' instead.');
      if ((Math.abs(x) === Math.abs(p) && Math.abs(y) === Math.abs(q)) || (Math.abs(x) === Math.abs(q) && Math.abs(y) === Math.abs(p))) return wrong('pair-signs', both + 'Right sizes — now fix the signs. ' + signHint(s, c));
      return wrong('value', both + 'Find two integers that multiply to ' + t(c) + ' and add to ' + t(s) + '.');
    };
  }
  function pairPart(p, q, opt) {
    opt = opt || {};
    var s = p + q, c = p * q, lab = opt.labels || ['Integer 1', 'Integer 2'];
    var hi = Math.abs(p) >= Math.abs(q) ? p : q, lo = hi === p ? q : p;
    return { prompt: opt.prompt || 'Sum ' + t(s) + ', product ' + t(c) + '.', input: { type: 'fields', fields: [{ name: lab[0], label: lab[0] }, { name: lab[1], label: lab[1] }] },
      check: pairCheck(p, q), key: [String(hi), String(lo)], answer: t(hi + ',\\ ' + lo), solution: opt.sol || pairSol(p, q),
      hints: ['List the factor pairs of ' + t(Math.abs(c)) + ' and add each pair.', signHint(s, c)], text: opt.text || 'pair: sum ' + s + ', product ' + c,
      good: [[String(lo), String(hi)]], bad: [[String(-hi), String(-lo)], [String(hi), String(-lo)]].filter(function (b) { var x = +b[0], y = +b[1]; return !((x === p && y === q) || (x === q && y === p)); }) };
  }

  /* ---------------- two polynomial answers in either order (length & width) ---------------- */
  function polyBox(label, vars) { return { name: label, label: label, mode: 'math', keys: 'poly', vars: vars || ['x'], wide: true }; }
  function eitherOrder(cs, labels) {
    return function (resp) {
      resp = resp || [];
      var r0 = String(resp[0] || '').trim(), r1 = String(resp[1] || '').trim();
      if (!r0 || !r1) return form('empty', 'Fill in both boxes.');
      var a0 = cs[0](r0), b1 = cs[1](r1), b0 = cs[1](r0), a1 = cs[0](r1);
      if (a0.v === 'correct' && b1.v === 'correct') return ok();
      if (b0.v === 'correct' && a1.v === 'correct') return ok();
      function lab(i, res) { return { v: res.v, code: res.code, hint: '<b>' + labels[i] + ':</b> ' + (res.hint || 'Check this one again.') }; }
      if (a0.v === 'correct') return lab(1, b1);
      if (b0.v === 'correct') return lab(1, a1);
      if (a1.v === 'correct') return lab(0, b0);
      if (b1.v === 'correct') return lab(0, a0);
      return lab(0, a0.v === 'form' ? a0 : b0.v === 'form' ? b0 : a0);
    };
  }

  /* ---------------- algebra-tile rectangle (x + rows)(x + cols), drawn like the booklet's \tilerectS ---------------- */
  function rectSvg(rows, cols, sideLab, topLab) {
    var U = 12, XL = 44, POS = '#9aa3ad', NEG = '#ffffff', ST = '#2b3340', nr = Math.abs(rows), nc = Math.abs(cols);
    var ox = sideLab.length > 2 ? 46 : 22, oy = 20, W = XL + nc * U, H = XL + nr * U, s = '';
    function rc(x, y, w, h, neg) { return '<rect x="' + (ox + x) + '" y="' + (oy + y) + '" width="' + w + '" height="' + h + '" rx="1.2" fill="' + (neg ? NEG : POS) + '" stroke="' + ST + '" stroke-width="1.1"/>'; }
    s += rc(0, 0, XL, XL, false);
    for (var i = 0; i < nc; i++) s += rc(XL + i * U, 0, U, XL, cols < 0);
    for (var j = 0; j < nr; j++) s += rc(0, XL + j * U, XL, U, rows < 0);
    for (i = 0; i < nc; i++) for (j = 0; j < nr; j++) s += rc(XL + i * U, XL + j * U, U, U, rows * cols < 0);
    s += '<rect x="' + ox + '" y="' + oy + '" width="' + W + '" height="' + H + '" fill="none" stroke="' + ST + '" stroke-width="2.4"/>';
    s += '<text x="' + (ox + W / 2) + '" y="' + (oy - 6) + '" text-anchor="middle" font-size="12" font-style="italic" fill="currentColor">' + topLab + '</text>';
    s += '<text x="' + (ox - 6) + '" y="' + (oy + H / 2 + 4) + '" text-anchor="end" font-size="12" font-style="italic" fill="currentColor">' + sideLab + '</text>';
    var VW = ox + W + 6, VH = oy + H + 6;
    return '<div class="fig"><svg class="tiles-svg" viewBox="0 0 ' + VW + ' ' + VH + '" width="100%" style="max-width:' + Math.min(320, Math.round(VW * 1.7)) + 'px" role="img" aria-label="algebra tile rectangle">' + s + '</svg></div>';
  }
  function linLab(n) { return 'x ' + (n < 0 ? '− ' + (-n) : '+ ' + n); }
  function pile(b, c) { return '<div class="fig">' + HW.tiles.row(HW.tiles.count({ x2: 1, x: b, one: c }), { label: 'algebra tiles' }) + '</div>'; }
  /* tile-rectangle builder (js/draw.js rect mode): any rectangle whose sides multiply to the target is accepted; the
   * classic monic mistakes get their own hint before K.tileRect's generic ones */
  HW.addCodes({ 'tile-one-side': 'Rectangle: all unit tiles on one side', 'tile-sum-c': 'Rectangle: put c unit tiles along the edges', 'tile-pair-product': 'Rectangle: x-tiles right, corner wrong' });
  function tileProd(v) { var f = HW.draw.tileFactors(v); return P.mul(f[0], f[1]); }
  function tileBuildPart(s, prompt, sol, hints, text) {
    var b = s.b, c = s.c, key = { top: { x: 1, one: s.q }, side: { x: 1, one: s.p } };
    var part = B.tiles(prompt, { mode: 'rect' }, s.inner, sol, hints, text, key), base = part.check;
    part.check = function (resp) {
      var res = base(resp); if (res.v === 'correct' || res.v === 'form') return res;
      var a = (resp && resp.top) || {}, d = (resp && resp.side) || {}, u = a.one || 0, w = d.one || 0;
      if ((a.x || 0) === 1 && (d.x || 0) === 1 && u >= 0 && w >= 0) {
        if ((u === 0) !== (w === 0)) return wrong('tile-one-side', 'All your unit tiles are on one side, so the corner of the rectangle is empty. The corner holds (unit tiles on top) × (unit tiles down the side), and that must be ' + t(c) + '. Share them out: a factor pair of ' + t(c) + ' that adds to ' + t(b) + '.');
        if (u + w === c && u * w !== c) return wrong('tile-sum-c', 'You used ' + t(c) + ' unit tiles along the edges, but the edges only set the size of the corner: it fills with ' + t(u + '\\times ' + w + '=' + u * w) + ' unit tiles. You need two numbers that <b>multiply</b> to ' + t(c) + ' (the corner) and <b>add</b> to ' + t(b) + ' (the ' + t('x') + '-tiles).');
        if (u + w === b && u * w !== c) return wrong('tile-pair-product', 'Your ' + t('x') + '-tiles add to ' + t(b) + ' ✓, but the corner holds ' + t(u + '\\times ' + w + '=' + u * w) + ' unit tiles, not ' + t(c) + '. Try another pair of numbers that adds to ' + t(b) + '.');
      }
      return res;
    };
    part.answer += '<div>Length ' + t(tx(s.B)) + ', width ' + t(tx(s.A)) + ' (either way round).</div>';
    part.good = [{ top: key.side, side: key.top }];
    part.bad = [{ top: { x: 1, one: 1 }, side: { x: 1, one: c } }, { top: { x: 1, one: c }, side: { x: 1, one: 0 } }, { top: { x: 1, one: b }, side: { x: 1, one: 1 } }, { top: { x: 1, one: 0 }, side: { x: 1, one: b } }]
      .filter(function (v) { return !P.eq(tileProd(v), s.inner); });
    return part;
  }
  /* tile rectangle with negative tiles (Example 8(c)): (x + u)(x + w), at least one of u, w negative. The classic slips —
   * both signs switched, everything shaded, the right corner with the wrong x-tiles, the right x-tiles with the wrong
   * corner — are diagnosed from the student's unit tiles before K.tileRect's generic hints. */
  HW.addCodes({ 'tile-sign-swap': 'Rectangle: negative tiles on the wrong side', 'tile-all-pos': 'Rectangle: no negative tiles used', 'tile-neg-corner': 'Rectangle: corner sign wrong' });
  function negBuildPart(s) {
    var b = s.b, c = s.c, u = s.p, w = s.q, key = { top: { x: 1, one: u }, side: { x: 1, one: w } };
    var X = function (n) { return t(Math.abs(n)) + ' ' + (n < 0 ? 'white' : 'shaded'); }, xT = function (n) { return (n < 0 ? '-' : '+') + (Math.abs(n) === 1 ? '' : Math.abs(n)) + 'x'; };
    var prompt = 'Now a new trinomial: build a tile rectangle for ' + t(tx(s.inner)) + '. Put ' + t('x') + '-tiles and unit tiles along the top and down the side — use <b>white (negative)</b> unit tiles where you need them. The inside fills in.';
    var sol = 'Two integers with product ' + t(c) + ' and sum ' + t(b) + ': ' + t(sg(u)) + ' and ' + t(sg(w)) + '. ' + signHint(b, c) + '<br>Along the top: one ' + t('x') + '-tile and ' + X(u) + ' unit tile' + (Math.abs(u) > 1 ? 's' : '') + '; down the side: one ' + t('x') + '-tile and ' + X(w) + ' unit tile' + (Math.abs(w) > 1 ? 's' : '') + '.'
      + rectSvg(w, u, linLab(w), linLab(u)) + 'Inside: ' + t((xT(u) + xT(w)).replace(/^\+/, '') + '=' + tx(P.scale(V('x'), b))) + ', and the corner holds ' + t(Math.abs(c)) + ' ' + (c < 0 ? 'white' : 'shaded') + ' unit tiles (' + t(par(u) + '\\times ' + par(w) + '=' + c) + '). Length ' + t(tx(s.A)) + ', width ' + t(tx(s.B)) + '.';
    var part = B.tiles(prompt, { mode: 'rect' }, s.inner, sol,
      ['The corner holds (units on top) × (units down the side), so they must multiply to ' + t(c) + '; the ' + t('x') + '-tiles inside add to ' + t(b) + '. ' + signHint(b, c), 'White tiles are negative: a shaded tile times a white tile gives a white (negative) unit tile.'], 'build tile rectangle with negatives', key);
    var base = part.check;
    part.check = function (resp) {
      var res = base(resp); if (res.v === 'correct' || res.v === 'form') return res;
      var a = (resp && resp.top) || {}, d = (resp && resp.side) || {}, x = a.one || 0, y = d.one || 0;
      if ((a.x || 0) !== 1 || (d.x || 0) !== 1) return res;
      if (x * y === c && x + y === -b) return wrong('tile-sign-swap', 'The corner is right ✓, but the ' + t('x') + '-tiles inside come to ' + t(tx(P.scale(V('x'), -b))) + ', not ' + t(tx(P.scale(V('x'), b))) + '. Switch the colours of the unit tiles on <b>both</b> sides.');
      if (c < 0 && x >= 0 && y >= 0 && (x || y)) return wrong('tile-all-pos', 'The constant term is ' + t(c) + ', so the corner must be <b>white</b> (negative) unit tiles — that happens when one side has shaded unit tiles and the other side has white ones.');
      if (x * y === -c) return wrong('tile-neg-corner', 'The corner has the wrong colour: it holds ' + t(Math.abs(c)) + ' ' + (x * y < 0 ? 'white' : 'shaded') + ' tiles, but the constant term is ' + t(c) + '. ' + signHint(b, c));
      if (x * y === c) return wrong('tile-pair-product', 'The corner is right ✓ (' + t(par(x) + '\\times ' + par(y) + '=' + c) + '), but the ' + t('x') + '-tiles inside come to ' + t(tx(P.scale(V('x'), x + y))) + ', not ' + t(tx(P.scale(V('x'), b))) + '. Try another factor pair of ' + t(c) + '.');
      if (x + y === b) return wrong('tile-pair-product', 'The ' + t('x') + '-tiles inside come to ' + t(tx(P.scale(V('x'), b))) + ' ✓, but the corner holds ' + t(par(x) + '\\times ' + par(y) + '=' + x * y) + ' unit tiles, not ' + t(c) + '. Try another pair that adds to ' + t(b) + '.');
      return res;
    };
    part.answer += '<div>Length ' + t(tx(s.A)) + ', width ' + t(tx(s.B)) + ' (either way round).</div>';
    part.good = [{ top: key.side, side: key.top }, { top: { x: -1, one: -u }, side: { x: -1, one: -w } }];
    part.bad = [{ top: { x: 1, one: -u }, side: { x: 1, one: -w } }, { top: { x: 1, one: Math.abs(u) }, side: { x: 1, one: Math.abs(w) } }, { top: { x: 1, one: -Math.abs(u) }, side: { x: 1, one: -Math.abs(w) } }, { top: { x: 1, one: u }, side: { x: 1, one: 0 } }]
      .filter(function (v) { return !P.eq(tileProd(v), s.inner); });
    return part;
  }

  /* ---------------- a number typed into a blank that already shows its sign ---------------- */
  function blankNumPart(s, given, missing, bracketSign, prompt, text) {
    // s: spec; given/missing: the two integers (missing is what the blank completes); bracketSign: +1 for (x + _), -1 for (x − _)
    var want = Math.abs(missing), full = facPart(s);
    var v = tx(s.u);
    return { prompt: prompt, input: { type: 'number', before: 'Blank =' }, key: String(want), answer: t(want) + ', so ' + t(s.key),
      check: function (resp) {
        var pn = HW.parse.number(resp);
        if (!pn.ok) return form(pn.code === 'empty' ? 'empty' : 'notnumber', pn.code === 'empty' ? 'Type your answer first.' : 'Enter a single number.');
        var e = pn.value, n = bracketSign * e;
        if (n === missing) return ok();
        if (bracketSign < 0 && e === missing) return form('sign-in-blank', 'The bracket already shows the minus sign, so type just the number: ' + t('(' + v + '-3)') + ' means the integer ' + t('-3') + '.');
        if (e === s.b || e === -s.b) return wrong('gave-sum', t(Math.abs(s.b)) + ' comes from the middle term — it is the <b>sum</b>. The blank holds the number that pairs with ' + t(sg(given)) + ': together they multiply to ' + t(s.c) + ' and add to ' + t(s.b) + '.');
        if (e === s.c || e === -s.c) return wrong('gave-product', t(Math.abs(s.c)) + ' is the <b>product</b> of the two numbers. Which number times ' + t(par(given)) + ' gives ' + t(s.c) + '?');
        return full.check('(' + tx(bin(s.u, given)) + ')(' + tx(bin(s.u, n)) + ')');
      },
      solution: 'Two integers with product ' + t(s.c) + ' and sum ' + t(s.b) + ': ' + t(sg(given)) + ' and ' + t(sg(missing)) + '.<br>The bracket shows the sign already, so the blank is ' + t(want) + ': ' + t(tx(s.full) + '=' + s.key) + '.',
      hints: ['The two numbers in the brackets multiply to ' + t(s.c) + ' and add to ' + t(s.b) + '. One of them is ' + t(sg(given)) + '.', 'What times ' + t(par(given)) + ' gives ' + t(s.c) + '?'], text: text,
      bad: [String(Math.abs(s.b)), String(-want)] };
  }
  function blankPairPart(s, bracketSign, prompt, text) {
    var full = facPart(s), v = tx(s.u), w1 = Math.abs(s.p), w2 = Math.abs(s.q), lab = ['First blank', 'Second blank'];
    return { prompt: prompt, input: { type: 'fields', fields: [{ name: lab[0], label: lab[0] }, { name: lab[1], label: lab[1] }] }, key: [String(Math.min(w1, w2)), String(Math.max(w1, w2))],
      answer: t(Math.min(w1, w2)) + ' and ' + t(Math.max(w1, w2)) + ', so ' + t(s.key),
      check: function (resp) {
        resp = resp || [];
        var A = HW.parse.number(resp[0] == null ? '' : resp[0]), Bn = HW.parse.number(resp[1] == null ? '' : resp[1]);
        if (!A.ok || !Bn.ok) return form('empty', 'Enter one number in each blank.');
        var x = bracketSign * A.value, y = bracketSign * Bn.value;
        if ((x === s.p && y === s.q) || (x === s.q && y === s.p)) return ok();
        if (bracketSign < 0 && ((-x === s.p && -y === s.q) || (-x === s.q && -y === s.p))) return form('sign-in-blank', 'The brackets already show the minus signs, so type just the numbers: ' + t('(' + v + '-3)') + ' means the integer ' + t('-3') + '.');
        return full.check('(' + tx(bin(s.u, x)) + ')(' + tx(bin(s.u, y)) + ')');
      },
      solution: 'Two integers with product ' + t(s.c) + ' and sum ' + t(s.b) + ': ' + t(sg(s.p)) + ' and ' + t(sg(s.q)) + '.' + (bracketSign < 0 ? ' The brackets already carry the minus signs, so the blanks are ' + t(w1) + ' and ' + t(w2) + '.' : '') + '<br>' + t(tx(s.full) + '=' + s.key),
      hints: ['The two numbers multiply to ' + t(s.c) + ' and add to ' + t(s.b) + '.', 'List the factor pairs of ' + t(Math.abs(s.c)) + ' and add each pair.'], text: text,
      good: [[String(Math.max(w1, w2)), String(Math.min(w1, w2))]], bad: [[String(Math.abs(s.b)), String(Math.abs(s.c))]] };
  }
  function blankBinPart(s, given, missing, prompt, text) {
    var full = facPart(s), v = tx(s.u), Mb = bin(s.u, missing), vs = varsOf(s.full);
    var p = B.math(prompt, function (resp) {
      var a = K.read(resp); if (a.res) return a.res;
      if (!/[a-z]/i.test(String(resp))) return form('whole-bracket', 'Write the whole bracket, e.g. ' + t(v + '+4') + ' — not just the number.');
      return full.check('(' + tx(bin(s.u, given)) + ')(' + String(resp) + ')');
    }, tx(Mb), 'Two integers with product ' + t(s.c) + ' and sum ' + t(s.b) + ': ' + t(sg(given)) + ' and ' + t(sg(missing)) + '.<br>So the missing factor is ' + t('(' + tx(Mb) + ')') + ' and ' + t(tx(s.full) + '=' + s.key) + '.',
    ['The numbers in the two brackets multiply to ' + t(s.c) + ' and add to ' + t(s.b) + '.', 'One of them is ' + t(sg(given)) + '. Which number goes with it?'], text, { keys: 'poly', vars: vs, before: t('(' + tx(bin(s.u, given)) + ')') });
    p.good = ['(' + tx(Mb) + ')', missing + '+' + v];
    p.bad = [tx(bin(s.u, -missing)), String(Math.abs(missing))];
    return p;
  }
  HW.addCodes({ 'whole-bracket': 'Typed only the number, not the whole bracket' });

  /* ---------------- numbers in fields ---------------- */
  function numField(label, after) { return { name: label, label: label, after: after }; }
  function setCheck(want, diag) { // unordered integers
    return function (resp) {
      resp = resp || [];
      var vals = [];
      for (var i = 0; i < want.length; i++) { var pn = HW.parse.number(resp[i] == null ? '' : resp[i]); if (!pn.ok) return form('empty', 'Enter one number in each box.'); vals.push(pn.value); }
      var a = vals.slice().sort(function (x, y) { return x - y; }).join(','), b = want.slice().sort(function (x, y) { return x - y; }).join(',');
      if (a === b) return ok();
      var h = diag ? diag(vals) : null;
      return h ? wrong(h.code, h.hint) : wrong('value', null);
    };
  }

  /* ================= Lesson ================= */
  var LETTERS = ['B', 'I', 'L', 'O', 'A', 'G', 'N', 'S', 'T'];
  function letterCheck(val, all, name) {
    return K.number(val, function (v) {
      var other = Object.keys(all).filter(function (k) { return k !== name && all[k] === v; })[0];
      if (other) return { code: 'swap-letters', hint: t(v) + ' is the value of ' + t(other) + '. Match each letter to its place in the brackets.' };
      if (v === -val) return { code: 'sign', hint: 'Each letter is a whole number from ' + t('1') + ' to ' + t('9') + ' — the sign is already written in the bracket.' };
      return null;
    });
  }

  HW.defineLesson({
    id: 'u4l2', unit: 4, num: '2', title: 'Factoring Trinomials of the Form x² + bx + c', outcome: 'AN5',
    blurb: 'Algebra tiles, then inspection: two integers whose product is c and whose sum is b — with a common factor out first, negative terms, and a second variable.',
    questions: [
      /* ---------------- Part A ---------------- */
      { num: '1', section: 'Part A — Algebra Tiles and Sum–Product Pairs',
        shared: function (r) { return pickWhere(function () { var p = r.int(1, 4), q = r.int(p + 1, 8); return { p: p, q: q }; }, function (o) { return o.p * o.q <= 15 && o.p + o.q <= 9; }); },
        stem: function (sh) { return 'Consider the collection of algebra tiles shown below.' + HW.tiles.legend() + pile(sh.p + sh.q, sh.p * sh.q); },
        parts: [
          { id: '1a', level: 'LIM', make: function (r, sh) {
            var s = spec({ p: sh.p, q: sh.q });
            return B.poly('Write the polynomial expression represented by the tiles.', s.inner, { wrong: s.b !== s.c ? [{ is: P.add(V('x', 2), P.scale(V('x'), s.c), P.num(s.b)), code: 'tile-count', hint: 'Check the shapes: the long thin rectangles are ' + t('x') + '-tiles and the small squares are unit tiles.' }] : [] },
              'One ' + t('x^{2}') + '-tile, ' + s.b + ' ' + t('x') + '-tiles and ' + s.c + ' unit tile' + (s.c > 1 ? 's' : '') + ': ' + t(tx(s.inner)) + '.',
              ['Count each kind of tile: big squares are ' + t('x^{2}') + ', long rectangles are ' + t('x') + ', small squares are ' + t('1') + '.'], 'tile pile → trinomial');
          } },
          { id: '1b', level: 'BEG', make: function (r, sh) {
            var s = spec({ p: sh.p, q: sh.q }), L = s.B, W = s.A;
            return tileBuildPart(s, 'Arrange the tiles into a rectangle (no gaps or overlaps). Build it below: put ' + t('x') + '-tiles and unit tiles along the top and down the side — the ' + t('x^{2}') + '-tile goes in the corner and the inside fills in. Its length and width show under the rectangle.',
              'Put the ' + t('x^{2}') + '-tile in the corner, ' + sh.q + ' ' + t('x') + '-tiles along the top, ' + sh.p + ' down the side, and the ' + s.c + ' unit tiles in the corner (' + t(sh.p + '\\times ' + sh.q + '=' + s.c) + '). Along the top: ' + t('x') + ' and ' + sh.q + ' unit' + (sh.q > 1 ? 's' : '') + '; down the side: ' + t('x') + ' and ' + sh.p + ' unit' + (sh.p > 1 ? 's' : '') + '.' + rectSvg(sh.p, sh.q, linLab(sh.p), linLab(sh.q)) + 'Length ' + t(tx(L)) + ', width ' + t(tx(W)) + '.',
              ['The unit tiles must fill a rectangle in the corner: which factor pair of ' + t(s.c) + ' uses up exactly ' + t(s.b) + ' ' + t('x') + '-tiles along the two sides?', 'Put one ' + t('x') + '-tile along the top and one down the side (they make the ' + t('x^{2}') + '-tile), then add the unit tiles of your factor pair: one number along the top, the other down the side.'], 'build tile rectangle');
          } },
          { id: '1c', level: 'BEG', make: function (r, sh) { var s = spec({ p: sh.p, q: sh.q }); return facPart(s, { prompt: 'Write the polynomial in factored form.', text: 'tile pile → factored form' }); } }] },
      { num: '2', stem: 'Find two integers with the given sum and the given product.',
        shared: function (r) { var p = r.int(3, 6), q = pickWhere(function () { return r.int(7, 10); }, function (v) { return v !== 2 * p; }); return { c: [p, q] }; },
        parts: [
          { id: '2a', level: 'LIM', make: function (r) { var p = r.int(2, 5), q = pickWhere(function () { return r.int(2, 6); }, function (v) { return v !== p && p * v <= 24; }); return pairPart(p, q); } },
          { id: '2b', level: 'LIM', make: function (r) { return pairPart(1, r.pick([6, 8, 10, 12, 14, 15])); } },
          { id: '2c', level: 'BEG', make: function (r, sh) { return pairPart(sh.c[0], sh.c[1]); } },
          { id: '2d', level: 'BEG', make: function (r, sh) { return pairPart(-sh.c[0], -sh.c[1]); } },
          { id: '2e', level: 'LIM', make: function (r) { return pairPart(1, r.pick([4, 9, 16, 25])); } },
          { id: '2f', level: 'BEG', make: function (r) { return pairPart(-r.int(2, 3), -r.int(5, 9)); } },
          { id: '2g', level: 'EMG', make: function (r) { var o = pickWhere(function () { return [r.int(2, 4), r.int(12, 18)]; }, function (o) { return posPairs(o[0] * o[1]).length >= 4; }); return pairPart(-o[0], -o[1]); } },
          { id: '2h', level: 'EMG', make: function (r) { var p = r.int(6, 9), q = r.int(p + 2, p + 6); return pairPart(-p, -q); } }] },
      { num: '3', stem: 'Find two integers with the given sum and the given product.',
        shared: function (r) {
          return pickWhere(function () { var N = r.pick([24, 30, 36, 40, 48, 60]), pr = posPairs(N).filter(function (pq) { return pq[0] > 1 && pq[0] !== pq[1]; }); var two = r.sample(pr, 2); return { N: N, a: two[0], c: two[1] }; },
            function (o) { return o.a && o.c && o.a[1] - o.a[0] >= 2 && o.c[1] - o.c[0] >= 2; });
        },
        parts: [
          { id: '3a', level: 'BEG', make: function (r, sh) { return pairPart(sh.a[1], -sh.a[0]); } },
          { id: '3b', level: 'BEG', make: function (r, sh) { return pairPart(-sh.a[1], sh.a[0]); } },
          { id: '3c', level: 'BEG', make: function (r, sh) { return pairPart(sh.c[0], -sh.c[1]); } },
          { id: '3d', level: 'BEG', make: function (r) { var p = r.int(6, 10), q = r.int(2, p - 2); return pairPart(p, -q); } },
          { id: '3e', level: 'BEG', make: function (r) { var o = pickWhere(function () { return [r.int(2, 5), r.int(6, 12)]; }, function (o) { return posPairs(o[0] * o[1]).length >= 3 && o[0] * o[1] <= 60; }); return pairPart(-o[0], -o[1]); } },
          { id: '3f', level: 'BEG', make: function (r) { var k = r.int(3, 9); return pairPart(k, -k); } }] },
      { num: '4',
        shared: function (r) {
          var o = pickWhere(function () { return { p: -r.int(2, 5), q: r.int(1, 3) }; }, function (o) { return o.p + o.q !== 0; });
          // 4d/4e: a second trinomial to build with negative tiles (booklet Example 8(c): x² + 2x − 8); mostly mixed signs, sometimes both negative
          o.n = pickWhere(function () { var a = r.int(1, 6), b = r.int(1, 6); return r.chance(0.7) ? { u: a, w: -b } : { u: -a, w: -b }; },
            function (n) { var lo = Math.min(n.u, n.w), hi = Math.max(n.u, n.w), mlo = Math.min(o.p, o.q), mhi = Math.max(o.p, o.q);
              return n.u + n.w !== 0 && n.u !== n.w && Math.abs(n.u * n.w) >= 3 && Math.abs(n.u * n.w) <= 18 && !(lo === mlo && hi === mhi); });
          return o;
        },
        stem: function (sh) { return 'The rectangle below is made of algebra tiles.' + HW.tiles.legend() + rectSvg(sh.p, sh.q, '?', '?'); },
        parts: [
          { id: '4a', level: 'BEG', make: function (r, sh) {
            var s = spec({ p: sh.p, q: sh.q }), X = V('x'), n = Math.abs(sh.p), wr = [];
            wr.push({ is: P.add(V('x', 2), P.scale(X, n + sh.q), P.num(n * sh.q)), code: 'tile-colour', hint: 'Check the colours: white tiles are <b>negative</b>. Count shaded and white tiles separately.' });
            wr.push({ is: P.add(V('x', 2), P.scale(X, sh.p + sh.q), P.num(n * sh.q)), code: 'tile-colour', hint: 'Your ' + t('x') + '-term is right. Look at the colour of the unit tiles: white means negative.' });
            wr.push({ is: P.add(V('x', 2), P.scale(X, n + sh.q), P.num(s.c)), code: 'tile-colour', hint: 'Check the ' + t('x') + '-tiles: the white ones are negative, so they cancel shaded ones (zero pairs).' });
            return B.poly('Write the trinomial the tiles represent.', s.inner, { wrong: wr.filter(function (w) { return !P.eq(w.is, s.inner); }) },
              'One ' + t('x^{2}') + '-tile; ' + t('x') + '-tiles: ' + t(sh.q) + ' shaded and ' + t(n) + ' white, so ' + t(sh.q + '-' + n + '=' + s.b) + ' and the term is ' + t(tx(P.scale(X, s.b))) + '; ' + t(n * sh.q) + ' white unit tiles, ' + t(s.c) + '.<br>' + t(tx(s.inner)),
              ['Shaded tiles are positive, white tiles are negative.', 'A shaded and a white ' + t('x') + '-tile together make ' + t('0') + '.'], 'tile rectangle → trinomial');
          } },
          { id: '4b1', sub: 'b i', level: 'EMG', make: function (r, sh) {
            var s = spec({ p: sh.p, q: sh.q }), top = s.B, side = s.A;
            var p = { prompt: 'State the length and width of the rectangle.', input: { type: 'fields', fields: [polyBox('Top'), polyBox('Side')] },
              check: eitherOrder([K.poly(top), K.poly(side)], ['Top', 'Side']), key: [tx(top), tx(side)], answer: 'Top ' + t(tx(top)) + ', side ' + t(tx(side)),
              solution: 'Across the top: the ' + t('x^{2}') + '-tile and ' + t(sh.q) + ' shaded ' + t('x') + '-tile' + (sh.q > 1 ? 's' : '') + ', so ' + t(tx(top)) + '.<br>Down the side: the ' + t('x^{2}') + '-tile and ' + t(-sh.p) + ' white ' + t('x') + '-tiles, so ' + t(tx(side)) + '.',
              hints: ['Read along the top edge and down the left edge: each side is ' + t('x') + ' plus (or minus) the number of ' + t('x') + '-tiles on it.', 'White tiles are negative.'], text: 'read tile rectangle sides' };
            p.good = [[tx(side), tx(top)]]; p.bad = [[tx(bin(V('x'), -sh.q)), tx(bin(V('x'), -sh.p))], [tx(top), tx(bin(V('x'), -sh.p))]];
            return p;
          } },
          { id: '4b2', sub: 'b ii', level: 'BEG', make: function (r, sh) { return facPart(spec({ p: sh.p, q: sh.q }), { prompt: 'Write the trinomial in factored form.', text: 'tile rectangle → factored form' }); } },
          { id: '4c', sub: 'c', level: 'EMG', make: function (r, sh) {
            return B.mc(r, 'Why are the unit tiles negative?', [
              { html: 'Each unit tile is in the row of a negative ' + t('x') + '-tile and the column of a positive ' + t('x') + '-tile, and ' + t('(+1)\\times(-1)=-1') + '.', right: true },
              { html: 'Because the ' + t('x') + '-term of the trinomial is negative.', why: 'A unit tile gets its sign from the tiles at the end of its row and its column. For example, ' + t('(x-2)(x-3)') + ' has a negative ' + t('x') + '-term but <b>positive</b> unit tiles.' },
              { html: 'Because there are more negative ' + t('x') + '-tiles than positive ones.', why: 'Counting doesn’t decide it: in ' + t('(x-2)(x-3)') + ' every ' + t('x') + '-tile is negative, yet the unit tiles are positive. Look at the signs of the row and column.' },
              { html: 'Because the constant term of a trinomial is always negative.', why: 'Not always — ' + t('x^{2}+5x+6') + ' has positive unit tiles. Look at the signs of the row and column each unit tile sits in.' }],
              'Each unit tile sits where a row and a column cross. Its row ends in a <b>white</b> (negative) ' + t('x') + '-tile and its column in a <b>shaded</b> (positive) ' + t('x') + '-tile, so its sign is ' + t('(+1)\\times(-1)=-1') + ': negative. That is why the constant term is ' + t(sh.p * sh.q) + '.',
              ['Multiplying tiles works like multiplying numbers: same signs give positive, different signs give negative.'], 'why unit tiles negative');
          } },
          { id: '4d', sub: 'd', level: 'EMG', make: function (r, sh) { return negBuildPart(spec({ p: sh.n.u, q: sh.n.w })); } },
          { id: '4e', sub: 'e', level: 'BEG', make: function (r, sh) { var s = spec({ p: sh.n.u, q: sh.n.w }); return facPart(s, { prompt: 'Use your rectangle from (d) to write ' + t(tx(s.inner)) + ' in factored form.', text: 'negative tile rectangle → factored form' }); } }] },

      /* ---------------- Part B ---------------- */
      { num: '5', section: 'Part B — Factoring x² + bx + c', stem: 'Complete the following.', parts: [
        { id: '5a', level: 'LIM', make: function (r) {
          var o = pickWhere(function () { return [r.int(2, 6), r.int(3, 9)]; }, function (o) { return o[0] !== o[1] && o[0] * o[1] <= 54; });
          var s = spec({ p: o[0], q: o[1] }), gi = r.chance(0.5) ? 0 : 1, given = o[gi], miss = o[1 - gi];
          return blankNumPart(s, given, miss, 1, t(tx(s.full) + '=(x+' + given + ')(x+\\underline{\\quad\\;})'), 'fill blank (x+a)(x+_)');
        } },
        { id: '5b', level: 'BEG', make: function (r) {
          var o = pickWhere(function () { return [r.int(1, 3), r.int(4, 12)]; }, function (o) { return o[0] * o[1] <= 36 && posPairs(o[0] * o[1]).length >= 2; });
          var s = spec({ p: o[0], q: o[1] });
          return blankPairPart(s, 1, t(tx(s.full) + '=(x+\\underline{\\quad\\;})(x+\\underline{\\quad\\;})'), 'fill blanks (x+_)(x+_)');
        } },
        { id: '5c', level: 'BEG', make: function (r) {
          var p = r.int(2, 4), q = r.int(p + 3, 9), s = spec({ p: -p, q: -q });
          return blankNumPart(s, -p, -q, -1, t(tx(s.full) + '=(x-' + p + ')(x-\\underline{\\quad\\;})'), 'fill blank (x-a)(x-_)');
        } },
        { id: '5d', level: 'BEG', make: function (r) {
          var q = r.pick([6, 8, 10, 12, 14, 15, 18, 20]), s = spec({ v: 't', p: -1, q: -q });
          return blankPairPart(s, -1, t(tx(s.full) + '=(t-\\underline{\\quad\\;})(t-\\underline{\\quad\\;})'), 'fill blanks (t-_)(t-_)');
        } },
        { id: '5e', level: 'BEG', make: function (r) {
          var p = r.int(2, 4), q = pickWhere(function () { return r.int(5, 12); }, function (v) { return v !== 2 * p && v !== p; }), s = spec({ v: 'z', p: p, q: q });
          return blankBinPart(s, p, q, t(tx(s.full) + '=(z+' + p + ')(\\underline{\\qquad})'), 'missing factor (z+a)(__)');
        } },
        { id: '5f', level: 'BEG', make: function (r) {
          var p = r.int(2, 3), q = r.int(7, 14), s = spec({ v: 'b', p: -p, q: -q });
          return blankBinPart(s, -p, -q, t(tx(s.full) + '=(b-' + p + ')(\\underline{\\qquad})'), 'missing factor (b-a)(__)');
        } }] },
      { num: '6', stem: 'Factor the following. (Part (a): check your answer by expanding.)',
        shared: function (r) { var p = r.int(1, 2); return { p: p, q: r.int(p + 2, 7) }; },
        parts: [
          { id: '6a', level: 'BEG', make: function (r, sh) { return facPart(spec({ p: sh.p, q: sh.q }), { check: true }); } },
          { id: '6b', level: 'BEG', make: function (r, sh) { return facPart(spec({ p: -sh.p, q: -sh.q })); } },
          { id: '6c', level: 'BEG', make: function (r) { var p = r.int(2, 4), q = r.int(p + 3, 10); return facPart(spec({ p: -p, q: -q })); } },
          { id: '6d', level: 'BEG', make: function (r) { var p = r.int(2, 5), q = pickWhere(function () { return r.int(p + 4, 12); }, function (v) { return posPairs(p * v).length >= 3; }); return facPart(spec({ p: -p, q: -q })); } }] },
      { num: '7', stem: 'Factor where possible. If a trinomial can’t be factored over the integers, press <b>none</b>.',
        shared: function (r) { return { q: r.pick([10, 12, 16, 18, 22]) }; },
        parts: [
          { id: '7a', level: 'BEG', make: function (r, sh) { return canPart(spec({ p: 1, q: sh.q })); } },
          { id: '7b', level: 'EMG', make: function (r, sh) { return nonePart('x', sh.q, sh.q + 1); } },
          { id: '7c', level: 'BEG', make: function (r) { var p = r.int(2, 5), q = r.int(p + 4, 12); return canPart(spec({ v: 'y', p: -p, q: -q })); } },
          { id: '7d', level: 'BEG', make: function (r) { var p = r.int(2, 4), q = r.int(12, 18); return canPart(spec({ v: 'y', p: p, q: q })); } },
          { id: '7e', level: 'BEG', make: function (r) { var p = r.int(2, 4), q = r.int(p + 3, 9); return canPart(spec({ v: 'f', p: -p, q: -q })); } },
          { id: '7f', level: 'BEG', make: function (r) { var p = r.int(2, 3), q = r.int(10, 16); return canPart(spec({ v: 'p', p: -p, q: -q })); } },
          { id: '7g', level: 'EMG', make: function (r) {
            var o = pickWhere(function () { var c = r.pick([12, 14, 15, 18, 20, 21, 24, 28]), sums = posPairs(c).map(function (pq) { return pq[0] + pq[1]; }); return { c: c, b: r.int(Math.min.apply(null, sums) + 1, Math.max.apply(null, sums) - 1), sums: sums }; },
              function (o) { return o.sums.indexOf(o.b) < 0 && !factorable(o.b, o.c); });
            return nonePart('c', o.b, o.c);
          } }] },
      { num: '8', stem: 'Factor the following trinomials.',
        shared: function (r) { var d = r.int(2, 4), n1 = r.int(1, 3); return { d: d, n1: n1, n2: r.int(n1 + 2, n1 + 5) }; },
        parts: [
          { id: '8a', level: 'BEG', make: function (r, sh) { return facPart(spec({ p: -(sh.n1 + sh.d), q: sh.n1 })); } },
          { id: '8b', level: 'BEG', make: function (r, sh) { return facPart(spec({ p: -(sh.n2 + sh.d), q: sh.n2 })); } },
          { id: '8c', level: 'BEG', make: function (r, sh) { return facPart(spec({ p: sh.n2 + sh.d, q: -sh.n2 })); } },
          { id: '8d', level: 'BEG', make: function (r) { var n = r.int(2, 4), m = r.int(n + 4, 11); return facPart(spec({ p: -m, q: n })); } }] },
      { num: '9', stem: 'Factor where possible. If a trinomial can’t be factored over the integers, press <b>none</b>.',
        shared: function (r) { return pickWhere(function () { var n = r.int(2, 4); return { m: r.int(n + 2, 9), n: n }; }, function (o) { return !factorable(-(o.m - o.n), o.m * o.n); }); },
        parts: [
          { id: '9a', level: 'BEG', make: function (r) { var p = r.int(2, 3), q = r.int(8, 13); return canPart(spec({ p: -q, q: -p })); } },
          { id: '9b', level: 'BEG', make: function (r) { var n = r.int(2, 4), m = r.int(n + 2, 9); return canPart(spec({ p: -m, q: n })); } },
          { id: '9c', level: 'BEG', make: function (r) { var n = r.int(2, 4), m = r.int(n + 2, 10); return canPart(spec({ p: m, q: -n })); } },
          { id: '9d', level: 'EMG', make: function (r, sh) { return nonePart('x', -(sh.m - sh.n), sh.m * sh.n); } },
          { id: '9e', level: 'BEG', make: function (r, sh) { return canPart(spec({ p: -sh.m, q: sh.n })); } },
          { id: '9f', level: 'BEG', make: function (r) { var k = r.int(4, 9); return canPart(spec({ p: -k, q: -k }), { wrong: [{ is: P.add(V('x', 2), P.num(k * k)), code: 'sq-no-middle', hint: 'A perfect square ' + t('(x-' + k + ')^{2}') + ' has a middle term. Find two integers with product ' + t(k * k) + ' and sum ' + t(-2 * k) + '.' }] }); } },
          { id: '9g', level: 'EMG', make: function (r) { var p = r.int(2, 3), q = r.int(15, 24); return canPart(spec({ v: 'm', p: q, q: p })); } },
          { id: '9h', level: 'EMG', make: function (r) { var p = r.int(2, 4), q = r.int(12, 18); return canPart(spec({ v: 'a', p: -q, q: -p })); } }] },
      { num: '10', stem: 'Factor completely.', parts: [
        { id: '10a', level: 'EMG', make: function (r) { var p = r.int(1, 3), q = r.int(p + 1, 6); return facPart(spec({ G: P.num(r.pick([2, 3, 5])), p: p, q: q })); } },
        { id: '10b', level: 'PRG', make: function (r) { var p = r.int(4, 7), q = r.int(p + 1, 9); return facPart(spec({ G: P.num(r.pick([2, 3, 4])), p: -p, q: -q })); } },
        { id: '10c', level: 'PRG', make: function (r) { var p = r.int(3, 7), q = r.int(p + 1, 9); return facPart(spec({ v: 'a', G: P.num(-r.pick([2, 3])), p: p, q: q })); } },
        { id: '10d', level: 'EMG', make: function (r) { var p = r.int(1, 2), q = r.int(p + 1, 5); return facPart(spec({ G: P.num(r.pick([2, 3, 4, 5])), p: -p, q: -q })); } },
        { id: '10e', level: 'PRG', make: function (r) { var p = r.int(2, 6), q = r.int(p + 1, 8); return facPart(spec({ G: V(r.pick(['a', 'a', 'k', 'm'])), p: -p, q: -q })); } },
        { id: '10f', level: 'PRG', make: function (r) { var p = r.int(2, 6), q = r.int(p + 1, 8); return facPart(spec({ v: 'a', G: P.mono(-r.pick([2, 3, 4, 5, 6]), { a: 2 }), p: -p, q: -q })); } }] },
      { num: '11', stem: 'Factor completely.', parts: [
        { id: '11a', level: 'EMG', make: function (r) { var p = r.int(2, 4), q = r.int(p + 1, 7); return facPart(spec({ G: P.num(r.pick([2, 3])), p: q, q: p })); } },
        { id: '11b', level: 'PRG', make: function (r) { var n = r.int(1, 3), m = r.int(n + 3, 8); return facPart(spec({ G: P.num(r.pick([2, 3, 4, 5])), p: -m, q: n })); } },
        { id: '11c', level: 'EMG', make: function (r) { return facPart(spec({ G: P.num(r.pick([2, 3, 5])), p: -r.int(3, 7), q: -1 })); } },
        { id: '11d', level: 'PRG', make: function (r) { var m = r.int(5, 9), n = r.int(2, m - 1); return facPart(spec({ v: 'a', G: P.num(-r.pick([2, 3])), p: -m, q: n })); } },
        { id: '11e', level: 'PRG', make: function (r) { var m = r.int(5, 10), n = r.int(2, m - 2); return facPart(spec({ G: V(r.pick(['b', 'a']), 2), p: -m, q: n })); } },
        { id: '11f', level: 'PRG', make: function (r) { var m = r.int(3, 7), n = r.int(2, m - 1); return facPart(spec({ G: P.mono(r.pick([2, 3, 5]), { x: 1 }), p: m, q: -n })); } }] },
      { num: '12',
        shared: function (r) { var p = r.int(5, 9); return { p: p, q: r.int(p + 2, 12), x: r.int(3, 8) }; },
        stem: function (sh) { return 'A rectangular soccer field has an area of ' + t(tx(spec({ p: sh.p, q: sh.q }).full)) + ' square metres.'; },
        parts: [
          { id: '12a', level: 'BEG', make: function (r, sh) {
            var s = spec({ p: sh.p, q: sh.q }), f = facPart(s, { prompt: 'Factor ' + t(tx(s.full)) + ' to find binomials representing the length and width of the field.', text: 'soccer field factor' });
            f.solution += '<br>So the field is ' + t('(' + tx(s.B) + ')') + ' m by ' + t('(' + tx(s.A) + ')') + ' m.';
            return f;
          } },
          { id: '12b', level: 'EMG', make: function (r, sh) {
            var L = sh.x + sh.q, W = sh.x + sh.p, area = L * W, x = sh.x;
            var cL = K.number(L), cW = K.number(W);
            return { prompt: 'If ' + t('x=' + x) + ', determine the length and width of the field.', input: { type: 'fields', fields: [numField('Length', 'm'), numField('Width', 'm')] },
              key: [String(L), String(W)], answer: 'Length ' + t(L + '\\text{ m}') + ', width ' + t(W + '\\text{ m}'),
              check: function (resp) {
                resp = resp || [];
                var a = HW.parse.number(resp[0] == null ? '' : resp[0]), b = HW.parse.number(resp[1] == null ? '' : resp[1]);
                if (!a.ok || !b.ok) return form('empty', 'Enter a number in each box.');
                if (a.value === L && b.value === W) return ok();
                if (a.value === W && b.value === L) return form('swap-dims', 'Right numbers — the length is the longer side, so swap them.');
                if (a.value * b.value === area) return wrong('value', 'Those multiply to the right area, ' + t(area) + ', but they aren’t the binomials evaluated at ' + t('x=' + x) + '. Substitute into each factor.');
                if (a.value === sh.q || b.value === sh.p) return wrong('not-subst', 'Substitute ' + t('x=' + x) + ' into each binomial: ' + t('x+' + sh.q) + ' becomes ' + t(x + '+' + sh.q) + '.');
                return K.fields([cL, cW], { labels: ['Length', 'Width'] })(resp);
              },
              solution: 'Length ' + t('=' + x + '+' + sh.q + '=' + L) + ' m, width ' + t('=' + x + '+' + sh.p + '=' + W) + ' m.<br>Check: ' + t(L + '\\times ' + W + '=' + area) + ' and ' + t(x + '^{2}+' + (sh.p + sh.q) + '(' + x + ')+' + sh.p * sh.q + '=' + area) + ' ✓',
              hints: ['Use your factors from part (a): substitute ' + t('x=' + x) + ' into each one.'], text: 'soccer field dimensions at x', bad: [[String(W), String(L)], [String(sh.q), String(sh.p)]] };
          } }] },
      { num: '13',
        shared: function (r) {
          var perm = pickWhere(function () { return r.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]); }, function (pm) { return pm[8] >= 3; }), L = {};
          LETTERS.forEach(function (k, i) { L[k] = perm[i]; });
          var X = V('x');
          var e1 = spec({ p: L.O, q: -L.B }), e2 = spec({ p: -L.L, q: L.A }), e3 = spec({ G: X, p: -L.I, q: L.G });
          var e4 = P.mul(P.num(L.T), P.pow(bin(X, -L.N), 2)), e5 = P.mul(P.num(-L.T), bin(X, L.S), bin(X, -L.T));
          return { L: L, e: [tx(e1.full) + '=(x+O)(x-B)', tx(e2.full) + '=(x-L)(x+A)', tx(e3.full) + '=x(x-I)(x+G)', tx(e4) + '=T(x-N)^{2}', tx(e5) + '=-' + L.T + '(x+S)(x-T)'],
            code: ['B', 'I', 'L', 'B', 'O', 'B', 'A', 'G', 'G', 'I', 'N', 'S'].map(function (k) { return L[k]; }) };
        },
        stem: function (sh) {
          return 'In the following, each letter represents a different whole number from ' + t('1') + ' to ' + t('9') + '.<div class="eqs">' + sh.e.map(function (e) { return t(e); }).join('<br>') + '</div>' +
            'Find the value of each letter, then decode the fictional character: ' + t(sh.code.slice(0, 5).map(function (d) { return '(' + d + ')'; }).join('\\,') + '\\quad ' + sh.code.slice(5).map(function (d) { return '(' + d + ')'; }).join('\\,'));
        },
        parts: [
          { id: '13a', sub: 'O, B', level: 'BEG', make: function (r, sh) {
            var L = sh.L, s = spec({ p: L.O, q: -L.B });
            return B.fields('Use ' + t(sh.e[0]) + ' to find ' + t('O') + ' and ' + t('B') + '.', [numField('O'), numField('B')], [letterCheck(L.O, { O: L.O, B: L.B }, 'O'), letterCheck(L.B, { O: L.O, B: L.B }, 'B')], [String(L.O), String(L.B)],
              t('O=' + L.O + ',\\ B=' + L.B), 'Product ' + t(s.c) + ', sum ' + t(s.b) + ': ' + t(sg(L.O)) + ' and ' + t(sg(-L.B)) + ', so ' + t(tx(s.full) + '=' + s.key) + '.<br>So ' + t('O=' + L.O) + ' and ' + t('B=' + L.B) + '.',
              ['Factor ' + t(tx(s.full)) + ': two integers with product ' + t(s.c) + ' and sum ' + t(s.b) + '.', 'The positive integer goes with ' + t('O') + ', and the size of the negative one is ' + t('B') + '.'], 'BILBO: O, B');
          } },
          { id: '13b', sub: 'L, A', level: 'BEG', make: function (r, sh) {
            var L = sh.L, s = spec({ p: -L.L, q: L.A }), all = { L: L.L, A: L.A };
            return B.fields('Use ' + t(sh.e[1]) + ' to find ' + t('L') + ' and ' + t('A') + '.', [numField('L'), numField('A')], [letterCheck(L.L, all, 'L'), letterCheck(L.A, all, 'A')], [String(L.L), String(L.A)],
              t('L=' + L.L + ',\\ A=' + L.A), 'Product ' + t(s.c) + ', sum ' + t(s.b) + ': ' + t(sg(-L.L)) + ' and ' + t(sg(L.A)) + ', so ' + t(tx(s.full) + '=' + s.key) + '.<br>So ' + t('L=' + L.L) + ' and ' + t('A=' + L.A) + '.',
              ['Factor ' + t(tx(s.full)) + ': two integers with product ' + t(s.c) + ' and sum ' + t(s.b) + '.'], 'BILBO: L, A');
          } },
          { id: '13c', sub: 'I, G', level: 'EMG', make: function (r, sh) {
            var L = sh.L, s = spec({ p: -L.I, q: L.G }), all = { I: L.I, G: L.G };
            return B.fields('Use ' + t(sh.e[2]) + ' to find ' + t('I') + ' and ' + t('G') + '.', [numField('I'), numField('G')], [letterCheck(L.I, all, 'I'), letterCheck(L.G, all, 'G')], [String(L.I), String(L.G)],
              t('I=' + L.I + ',\\ G=' + L.G), 'Take out ' + t('x') + ': ' + t('x(' + tx(s.inner) + ')') + '. Product ' + t(s.c) + ', sum ' + t(s.b) + ': ' + t(sg(-L.I)) + ' and ' + t(sg(L.G)) + ', so it is ' + t('x' + s.key) + '.<br>So ' + t('I=' + L.I) + ' and ' + t('G=' + L.G) + '.',
              ['Take out the common factor ' + t('x') + ' first.', 'Then find two integers with product ' + t(s.c) + ' and sum ' + t(s.b) + '.'], 'BILBO: I, G');
          } },
          { id: '13d', sub: 'T, N', level: 'EMG', make: function (r, sh) {
            var L = sh.L, all = { T: L.T, N: L.N }, inner = P.pow(bin(V('x'), -L.N), 2);
            return B.fields('Use ' + t(sh.e[3]) + ' to find ' + t('T') + ' and ' + t('N') + '.', [numField('T'), numField('N')], [letterCheck(L.T, all, 'T'), letterCheck(L.N, all, 'N')], [String(L.T), String(L.N)],
              t('T=' + L.T + ',\\ N=' + L.N), 'Common factor ' + t(L.T) + ': ' + t(L.T + '(' + tx(inner) + ')') + '. Product ' + t(L.N * L.N) + ', sum ' + t(-2 * L.N) + ': ' + t(-L.N) + ' and ' + t(-L.N) + ', so ' + t(L.T + '(x-' + L.N + ')^{2}') + '.<br>So ' + t('T=' + L.T) + ' and ' + t('N=' + L.N) + '.',
              ['Take out the common factor first — that is ' + t('T') + '.', 'What is left is a perfect square: two equal integers.'], 'BILBO: T, N');
          } },
          { id: '13e', sub: 'S', level: 'PRG', make: function (r, sh) {
            var L = sh.L, inner = P.mul(bin(V('x'), L.S), bin(V('x'), -L.T)), s = spec({ p: L.S, q: -L.T });
            return B.number('Use ' + t(sh.e[4]) + ' to find ' + t('S') + '. (Check that the value of ' + t('T') + ' agrees with part (d).)', L.S, function (v) {
              if (v === L.T) return { code: 'swap-letters', hint: t(v) + ' is ' + t('T') + ' (it is in the bracket ' + t('(x-T)') + '). ' + t('S') + ' is in the other bracket.' };
              if (v === -L.S) return { code: 'sign', hint: 'Letters are whole numbers from ' + t('1') + ' to ' + t('9') + ' — the bracket ' + t('(x+S)') + ' already shows the sign.' };
              return null;
            }, 'Common factor ' + t(-L.T) + ': ' + t('-' + L.T + '(' + tx(inner) + ')') + '. Product ' + t(s.c) + ', sum ' + t(s.b) + ': ' + t(sg(L.S)) + ' and ' + t(sg(-L.T)) + ', so ' + t('-' + L.T + s.key) + '.<br>So ' + t('S=' + L.S) + ', and ' + t('T=' + L.T) + ' again ✓.',
            ['Take out ' + t(-L.T) + ' first — watch every sign inside the bracket.', 'Then find two integers with product ' + t(s.c) + ' and sum ' + t(s.b) + '.'], 'BILBO: S');
          } },
          { id: '13f', sub: 'code', level: 'BEG', make: function (r, sh) {
            var L = sh.L, ans = 'BILBO BAGGINS', table = LETTERS.slice().sort(function (a, b) { return L[a] - L[b]; }).map(function (k) { return L[k] + '=' + k; }).join(',\\ ');
            return { prompt: 'Decode the message: replace each number in the code with the letter that has that value.', input: { type: 'fields', fields: [{ name: 'Character', label: 'Character', mode: 'text', wide: true, placeholder: 'the name in capitals' }] },
              key: [ans], answer: '<b>' + ans + '</b>',
              check: function (resp) {
                var v = String((resp || [])[0] || '').toUpperCase().replace(/[^A-Z]/g, '');
                if (!v) return form('empty', 'Type the name you decoded.');
                if (v === 'BILBOBAGGINS') return ok();
                return wrong('decode', 'Check your letter values: each number in the code is a value, so ' + t('(' + sh.code[0] + ')') + ' is the letter whose value is ' + t(sh.code[0]) + '.');
              },
              solution: 'The values are ' + t(table) + '. Reading the code gives B–I–L–B–O  B–A–G–G–I–N–S: <b>' + ans + '</b>.', hints: ['Write the letters in order of their values, ' + t('1') + ' to ' + t('9') + ', then read the code.'], text: 'BILBO decode', bad: [['BILBO'], ['FRODO BAGGINS']] };
          } }] },
      { num: '14', stem: 'Each factorization below contains an error. Identify the error, then write the correct factored form.',
        shared: function (r) {
          var a = pickWhere(function () { return [r.int(5, 9), r.int(2, 4)]; }, function (o) { return o[0] - o[1] >= 2; }), bp = r.int(2, 4), k = r.int(2, 5), cp = r.int(1, 3);
          return { a: a, b: [bp, r.int(bp + 1, 5)], c: [k, cp, r.int(cp + 1, 5)] };
        },
        parts: [
        { id: '14a1', sub: 'a i', level: 'EMG', make: function (r, sh) {
          var m = sh.a[0], n = sh.a[1], s = spec({ p: -m, q: n });
          return B.mc(r, t(tx(s.full) + '=(x-' + m + ')(x-' + n + ')') + '. What is the error?', [
            { html: 'The constant term is negative, so the two numbers need <b>opposite</b> signs; ' + t('-' + m) + ' and ' + t('-' + n) + ' multiply to ' + t('+' + m * n) + '.', right: true },
            { html: 'The numbers should add to ' + t(-m * n) + ' and multiply to ' + t(s.b) + '.', why: 'That swaps the roles. The two numbers <b>multiply to the constant</b> and <b>add to the middle coefficient</b>.' },
            { html: 'Nothing — the factors can be written in either order.', why: 'Expand ' + t('(x-' + m + ')(x-' + n + ')') + ': you get ' + t(triTex('x', -(m + n), m * n)) + ', not the original.' },
            { html: 'The pair should be ' + t('-' + m * n) + ' and ' + t('+1') + '.', why: 'Those multiply to ' + t(-m * n) + ' but add to ' + t(1 - m * n) + ', not ' + t(s.b) + '.' }],
            'Expanding the student’s answer gives ' + t(triTex('x', -(m + n), m * n)) + ': the constant is ' + t('+' + m * n) + ', not ' + t(-m * n) + '. A negative product needs one positive and one negative number.',
            ['Expand the student’s answer and compare it with the trinomial.'], 'error: same signs for negative c');
        } },
        { id: '14a2', sub: 'a ii', level: 'BEG', make: function (r, sh) {
          var s = spec({ p: -sh.a[0], q: sh.a[1] });
          return facPart(s, { prompt: 'Write the correct factored form of ' + t(tx(s.full)) + '.' });
        } },
        { id: '14b1', sub: 'b i', level: 'EMG', make: function (r, sh) {
          var p = sh.b[0], q = sh.b[1], c = p * q, s = spec({ p: p, q: q });
          return B.mc(r, t(tx(s.full) + '=(x+' + c + ')(x+1)') + '. What is the error?', [
            { html: t(c) + ' and ' + t(1) + ' have the right product but the wrong sum: ' + t(c + '+1=' + (c + 1)) + ', not ' + t(p + q) + '.', right: true },
            { html: 'The signs should be negative.', why: 'The constant and the middle coefficient are both positive, so both numbers are positive.' },
            { html: 'Nothing — it multiplies back to the original.', why: 'Expand it: ' + t('(x+' + c + ')(x+1)=' + triTex('x', c + 1, c)) + '. The middle term is wrong.' },
            { html: 'The constant term should be ' + t(c + 1) + '.', why: 'The constant comes from multiplying: ' + t(c + '\\times 1=' + c) + ' ✓. It is the middle term that is wrong.' }],
            'Expanding gives ' + t(triTex('x', c + 1, c)) + ': the product ' + t(c) + ' is right, but the sum ' + t(c + 1) + ' should be ' + t(p + q) + '. The pair must satisfy <b>both</b> conditions.',
            ['Check both conditions for the pair: the product and the sum.'], 'error: right product wrong sum');
        } },
        { id: '14b2', sub: 'b ii', level: 'BEG', make: function (r, sh) {
          var s = spec({ p: sh.b[0], q: sh.b[1] });
          return facPart(s, { prompt: 'Write the correct factored form of ' + t(tx(s.full)) + '.' });
        } },
        { id: '14c1', sub: 'c i', level: 'EMG', make: function (r, sh) {
          var k = sh.c[0], p = sh.c[1], q = sh.c[2], s = spec({ G: P.num(k), p: p, q: q });
          var big = '(x+' + k * p + ')(x+' + k * q + ')';
          return B.mc(r, t(tx(s.full) + '=(x+' + p + ')(x+' + q + ')') + '. What is the error?', [
            { html: 'The common factor ' + t(k) + ' was dropped: ' + t('(x+' + p + ')(x+' + q + ')') + ' multiplies to ' + t(tx(s.inner)) + ', not the original.', right: true },
            { html: 'The numbers should be ' + t(k * p) + ' and ' + t(k * q) + ': ' + t(big) + '.', why: 'Expand ' + t(big) + ': it gives ' + t(triTex('x', k * (p + q), k * k * p * q)) + '. Take out the common factor first instead.' },
            { html: 'Nothing — dividing every term by ' + t(k) + ' gives an equivalent expression.', why: 'Dividing by ' + t(k) + ' gives a different expression, one ' + (k === 2 ? 'half' : k === 3 ? 'third' : k === 4 ? 'quarter' : 'fifth') + ' as big. The ' + t(k) + ' has to stay as a factor out front.' },
            { html: 'The signs in the brackets should be negative.', why: 'All the terms are positive, so the numbers in the brackets are positive.' }],
            'Expanding gives ' + t(tx(s.inner)) + ' — the original divided by ' + t(k) + '. The common factor must stay in the answer: ' + t(tx(s.full) + '=' + s.key) + '.',
            ['Expand the student’s answer and compare it with the original.'], 'error: dropped GCF');
        } },
        { id: '14c2', sub: 'c ii', level: 'EMG', make: function (r, sh) {
          var s = spec({ G: P.num(sh.c[0]), p: sh.c[1], q: sh.c[2] });
          return facPart(s, { prompt: 'Write the correct factored form of ' + t(tx(s.full)) + '.' });
        } }] },

      /* ---------------- Part C ---------------- */
      { num: '15', section: 'Part C — Two Variables', stem: 'Factor each trinomial completely.', parts: [
        { id: '15a', level: 'EMG', make: function (r) { var p = r.int(3, 8), q = r.int(p + 1, 9); return facPart(spec({ y: 'y', p: p, q: q })); } },
        { id: '15b', level: 'PRG', make: function (r) { var n = r.int(2, 4), m = r.int(n + 3, 12); return facPart(spec({ y: 'y', p: m, q: -n })); } },
        { id: '15c', level: 'EMG', make: function (r) { var k = r.int(3, 9); return facPart(spec({ v: 'a', y: 'b', p: -k, q: -k })); } },
        { id: '15d', level: 'EMG', make: function (r) { return facPart(spec({ v: 'p', y: 'q', p: -r.pick([8, 10, 12, 14, 15]), q: -1 })); } },
        { id: '15e', level: 'PRG', make: function (r) { var k = r.int(5, 11); return facPart(spec({ y: 'y', p: k + 1, q: -k })); } },
        { id: '15f', level: 'PRG', make: function (r) { var n = r.int(2, 5), m = r.int(15, 25); return facPart(spec({ y: 'y', p: -m, q: n })); } }] },
      { num: '16', stem: 'Factor completely.', parts: [
        { id: '16a', level: 'PRG', make: function (r) { var p = r.int(5, 8), q = r.int(p + 1, 10); return facPart(spec({ y: 'y', G: P.num(r.pick([2, 3, 4])), p: -p, q: -q })); } },
        { id: '16b', level: 'PRG', make: function (r) { var m = r.int(12, 18), n = r.int(6, 11); return facPart(spec({ v: 'b', y: 'v', G: P.num(r.pick([2, 3])), p: -m, q: n })); } },
        { id: '16c', level: 'PRG', make: function (r) { var m = r.int(8, 12), n = r.int(5, m - 1); return facPart(spec({ v: 'c', y: 'd', G: P.num(r.pick([2, 4, 5])), p: m, q: -n })); } }] },

      /* ---------------- Part D ---------------- */
      { num: '17', section: 'Part D — Multiple Choice and Numerical Response', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '17', level: 'EMG', make: function (r) {
          var k = r.pick([2, 3, 5]), o = pickWhere(function () { return [r.int(2, 8), r.int(3, 9)]; }, function (o) { return o[0] < o[1] && o[0] * o[1] <= 60; }), p = o[0], q = o[1];
          var cand = []; for (var d = 2; d <= 9; d++) if (d !== p && d !== q) cand.push(d);
          var divs = cand.filter(function (d) { return (p * q) % d === 0; }), rr = r.pick(divs.length ? divs : cand), s = spec({ v: 'm', G: P.num(k), p: -p, q: -q });
          var fh = 'Factor completely: ' + t(tx(s.full) + '=' + s.key) + '. That one <b>is</b> a factor.';
          return B.mc(r, 'Which of the following is <b>not</b> a factor of ' + t(tx(s.full)) + '?', [
            { html: t('m-' + rr), right: true }, { html: t('m-' + p), why: fh }, { html: t('m-' + q), why: fh }, { html: t(k), why: 'The common factor ' + t(k) + ' is a factor: ' + t(tx(s.full) + '=' + s.key) + '.' }],
            'Common factor ' + t(k) + ': ' + t(k + '(' + tx(s.inner) + ')') + '. Product ' + t(s.c) + ', sum ' + t(s.b) + ': ' + t(-p) + ' and ' + t(-q) + '.<br>' + t(tx(s.full) + '=' + s.key) + '. The factors are ' + t(k) + ', ' + t('m-' + p) + ' and ' + t('m-' + q) + '; ' + t('m-' + rr) + ' is not one of them.',
            ['Factor completely first: take out the common factor, then factor the trinomial.'], 'MC not a factor');
        } }] },
      { num: '18', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '18', level: 'EMG', make: function (r) {
          var k = r.int(3, 8), m = pickWhere(function () { return r.int(2, 7); }, function (v) { return v !== k; }), N = m * k;
          var prs = posPairs(N).filter(function (pq) { return pq[0] !== k && pq[1] !== k && !(pq[0] === m || pq[1] === m) && pq[0] !== pq[1]; });
          var nice = prs.filter(function (pq) { return pq[0] > 1; }), D = (nice.length ? r.pick(nice) : prs.length ? prs[0] : [1, N]);
          var A = spec({ v: 'a', p: 1, q: k }), Bs = spec({ v: 'a', p: m, q: k }), C = spec({ v: 'a', p: k, q: k }), Dd = spec({ v: 'a', p: D[0], q: D[1] });
          function has(sx) { return t(tx(sx.full) + '=' + sx.key) + ' — that one does have ' + t('(a+' + k + ')') + '.'; }
          return B.mc(r, 'For which of the following trinomials is ' + t('(a+' + k + ')') + ' <b>not</b> a factor?', [
            { html: t(tx(Dd.full)), right: true }, { html: t(tx(A.full)), why: has(A) }, { html: t(tx(Bs.full)), why: has(Bs) }, { html: t(tx(C.full)), why: has(C) }],
            'Factor each: ' + t(tx(A.full) + '=' + A.key) + ', ' + t(tx(Bs.full) + '=' + Bs.key) + ', ' + t(tx(C.full) + '=' + C.key) + ', but ' + t(tx(Dd.full) + '=' + Dd.key) + ' — no ' + t('(a+' + k + ')') + '.',
            ['Factor each trinomial, or check: if ' + t('(a+' + k + ')') + ' is a factor, the other number is the constant divided by ' + t(k) + ' — does that pair add to the middle coefficient?'], 'MC which lacks (a+k)');
        } }] },
      { num: '19', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '19', level: 'EMG', make: function (r) {
          var o = pickWhere(function () { var rr = r.int(3, 7); return { r: rr, s: r.int(2, 8), u: r.int(rr + 1, rr + 5) }; }, function (o) { return o.s !== o.r && o.u !== o.s; });
          var T1 = spec({ p: -o.r, q: -o.s }), T2 = spec({ p: o.u, q: -o.r });
          return B.mc(r, 'When factored, the trinomials ' + t(tx(T1.full)) + ' and ' + t(tx(T2.full)) + ' have one binomial factor in common. This factor is', [
            { html: t('x-' + o.r), right: true }, { html: t('x+' + o.r), why: 'Check the signs: factor both trinomials and compare the brackets exactly.' },
            { html: t('x-' + o.s), why: 'That is a factor of ' + t(tx(T1.full)) + ' only: ' + t(tx(T2.full) + '=' + T2.key) + '.' }, { html: t('x+' + o.u), why: 'That is a factor of ' + t(tx(T2.full)) + ' only: ' + t(tx(T1.full) + '=' + T1.key) + '.' }],
            t(tx(T1.full) + '=' + T1.key) + ' and ' + t(tx(T2.full) + '=' + T2.key) + '. The shared factor is ' + t('(x-' + o.r + ')') + '.', ['Factor both trinomials, then look for the bracket that appears in both.'], 'MC common factor');
        } }] },
      { num: '20', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '20', level: 'EMG', make: function (r) {
          var q = r.int(2, 4), p = pickWhere(function () { return r.int(q + 1, 7); }, function (v) { return v * q <= 24; }), s = spec({ v: 'm', G: P.mono(-1, { m: 1 }), p: p, q: -q });
          return B.mc(r, 'One factor of ' + t(tx(s.full)) + ' is', [
            { html: t('m-' + q), right: true }, { html: t('m+' + q), why: 'Take out the common factor ' + t('-m') + ' first — that changes every sign inside the bracket. Then check the signs of your pair.' },
            { html: t('m-' + p), why: 'Take out ' + t('-m') + ' (not ' + t('m') + '): ' + t('-m(' + tx(s.inner) + ')') + '. Then factor the bracket.' },
            { html: t('m+' + p * q), why: t(p * q) + ' is the product; the numbers in the brackets must also add to the middle coefficient.' }],
            'Take out the GCF ' + t('-m') + ': ' + t(tx(s.full) + '=-m(' + tx(s.inner) + ')') + '. Product ' + t(s.c) + ', sum ' + t(s.b) + ': ' + t(sg(p)) + ' and ' + t(sg(-q)) + '.<br>' + t(tx(s.full) + '=' + s.key) + '. Only ' + t('m-' + q) + ' is offered.',
            ['Take out ' + t('-m') + ' so the bracket starts with ' + t('+m^{2}') + '.'], 'MC factor of -m^3...');
        } }] },
      { num: '21', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '21', level: 'EMG', make: function (r) {
          var k = r.int(2, 6), q = r.int(2, 6), p = q + r.int(1, 3), s = spec({ y: 'y', G: P.num(k), p: -p, q: q });
          return B.mc(r, 'One factor of ' + t(tx(s.full)) + ' is', [
            { html: t('x+' + q + 'y'), right: true }, { html: t(k + 'x'), why: t(k + 'x') + ' is not a common factor: the last term ' + t(tx(P.mul(P.num(-k * p * q), V('y', 2)))) + ' has no ' + t('x') + '. The GCF is just ' + t(k) + '.' },
            { html: t('x-' + q + 'y'), why: 'Check the signs: the numbers multiply to ' + t(s.c) + ' and add to ' + t(s.b) + '.' }, { html: t('x+' + p + 'y'), why: 'Check the signs: the numbers multiply to ' + t(s.c) + ' and add to ' + t(s.b) + '. The one further from 0 is negative.' }],
            'GCF ' + t(k) + ' (not ' + t(k + 'x') + ' — the last term has no ' + t('x') + '): ' + t(k + '(' + tx(s.inner) + ')') + '. Product ' + t(s.c) + ', sum ' + t(s.b) + ': ' + t(-p) + ' and ' + t(sg(q)) + '.<br>' + t(tx(s.full) + '=' + s.key) + '.',
            ['Take out the common factor first, then factor the trinomial in ' + t('x') + ' and ' + t('y') + '.'], 'MC factor two variables');
        } }] },
      { num: '22', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '22', level: 'PRG', make: function (r) {
          var h = r.int(2, 6), b = -2 * h, right = h * h - r.pick([-1, -2, -3, 2, 3, 5, 6, 7].filter(function (m) { return !isSq(m) && h * h - m !== 0; }));
          var cands = [h * h, h * h - 1, h * h - (h + 1) * (h + 1), h * h - 4, h * h - (h + 2) * (h + 2)].filter(function (c, i, arr) { return c !== 0 && c !== right && arr.indexOf(c) === i; });
          var opts = r.sample(cands, 3).map(function (c) { var j = Math.round(Math.sqrt(h * h - c)), p = -h + j, q = -h - j, sx = spec({ p: p, q: q }); return { html: t(c), why: 'That value works: ' + t(tx(sx.full) + '=' + sx.key) + '.' }; });
          return B.mc(r, 'The expression ' + t('x^{2}' + b + 'x+c') + ' <b>cannot</b> be factored over the integers if ' + t('c') + ' has the value', [{ html: t(right), right: true }].concat(opts),
            'We need two integers with sum ' + t(b) + ' and product ' + t('c') + '. Test each option. For ' + t('c=' + right) + ': ' + signedPairs(right).map(function (pq) { return t(pq[0] + '\\ \\&\\ ' + pq[1]) + ' (sum ' + t(pq[0] + pq[1]) + ')'; }).join(', ') + ' — none adds to ' + t(b) + '. Every other option factors.',
            ['For each option, look for two integers with that product and sum ' + t(b) + '.'], 'MC which c cannot factor');
        } }] },
      { num: '23', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '23', level: 'PRG', make: function (r) {
          var c = r.pick([24, 30, 36, 40, 48, 60, 72]), sums = posPairs(c).map(function (pq) { return pq[0] + pq[1]; }), ans = c + 1;
          return B.nr('The largest value of ' + t('b') + ' for which ' + t('x^{2}+bx+' + c) + ' can be factored over the integers is ________.', ans, function (v) {
            if (v === c) return { code: 'gave-c', hint: t(c) + ' is the constant. ' + t('b') + ' is the <b>sum</b> of a pair of integers whose product is ' + t(c) + '.' };
            if (sums.indexOf(v) >= 0) return { code: 'not-largest', hint: 'That value of ' + t('b') + ' works, but it isn’t the largest. Which factor pair of ' + t(c) + ' has the biggest sum?' };
            return null;
          }, 'We need ' + t('b=p+q') + ' with ' + t('pq=' + c) + '. To make ' + t('b') + ' as large as possible, take both positive and as far apart as possible.<br>' + posPairs(c).map(function (pq) { return t(pq[0] + '\\times ' + pq[1]) + ' (sum ' + t(pq[0] + pq[1]) + ')'; }).join(', ') + '.<br>The largest is <b>' + ans + '</b>, from ' + t('x^{2}+' + ans + 'x+' + c + '=(x+1)(x+' + c + ')') + '.',
          ['List every factor pair of ' + t(c) + ' and add each pair.'], 'NR largest b');
        } }] }
    ],

    extra: [
      { num: '1', section: 'Extra practice A — Reading the Signs Before You Hunt',
        shared: function (r) { var m = r.int(1, 3), u = r.int(3, 6); return { m: m, n: r.int(m + 3, 9), u: u, v: pickWhere(function () { return r.int(u + 1, u + 4); }, function (v) { return posPairs(u * v).length >= 2; }) }; },
        stem: function (sh) { var r1 = spec({ p: sh.m, q: sh.n }); return 'Rows 1 and 2 hide the same two integers, up to sign, and so do rows 3 and 4. Row 1 is done for you: in ' + t(tx(r1.full)) + ', ' + t('b>0') + ' and ' + t('c>0') + ', so both integers are positive and it factors as ' + t(r1.key) + '. (“Mixed” below means one positive and one negative integer.)'; },
        parts: [
          { id: 'e1', sub: 'signs', level: 'BEG', make: function (r, sh) {
            var R = [{ id: '2', s: spec({ p: -sh.m, q: -sh.n }), want: 'nn' }, { id: '3', s: spec({ p: -sh.u, q: sh.v }), want: 'op' }, { id: '4', s: spec({ p: sh.u, q: -sh.v }), want: 'on' }];
            var want = {}; R.forEach(function (x) { want[x.id] = x.want; });
            return B.grid('For rows 2–4, what do the signs of ' + t('b') + ' and ' + t('c') + ' say about the two integers?', R.map(function (x) { return { id: x.id, html: t(tx(x.s.full)) }; }),
              [{ id: 'pp', html: 'both +' }, { id: 'nn', html: 'both −' }, { id: 'op', html: 'mixed, bigger +' }, { id: 'on', html: 'mixed, bigger −' }], want,
              { why: function (id) { var x = R.filter(function (y) { return y.id === id; })[0]; return { code: 'row', hint: 'Row ' + id + ': ' + signHint(x.s.b, x.s.c) }; } },
              R.map(function (x) { return 'Row ' + x.id + ': ' + t('b' + (x.s.b > 0 ? '>' : '<') + '0') + ', ' + t('c' + (x.s.c > 0 ? '>' : '<') + '0') + ' → ' + t(sg(x.s.p)) + ' and ' + t(sg(x.s.q)) + '.'; }).join('<br>'),
              ['If ' + t('c>0') + ' the integers share a sign — the sign of ' + t('b') + '. If ' + t('c<0') + ' the signs are opposite and the bigger one has the sign of ' + t('b') + '.'], 'sign pattern table');
          } },
          { id: 'e1f', sub: 'factored', level: 'BEG', make: function (r, sh) {
            var S = [spec({ p: -sh.m, q: -sh.n }), spec({ p: -sh.u, q: sh.v }), spec({ p: sh.u, q: -sh.v })];
            var p = B.fields('Write the factored form for rows 2, 3 and 4.', S.map(function (s, i) { return { name: 'Row ' + (i + 2), label: t(tx(s.full) + '='), mode: 'math', keys: 'poly', vars: ['x'], wide: true }; }),
              S.map(function (s) { return facPart(s).check; }), S.map(function (s) { return s.key; }), S.map(function (s) { return t(tx(s.full) + '=' + s.key); }).join('<br>'),
              S.map(function (s) { return t(sg(s.p)) + ' and ' + t(sg(s.q)) + ': product ' + t(s.c) + ', sum ' + t(s.b) + ', so ' + t(tx(s.full) + '=' + s.key); }).join('<br>'),
              ['Rows 3 and 4 use the same two sizes; only the signs change.'], 'sign pattern table factored');
            p.bad = [S.map(function (s) { return '(' + tx(bin(V('x'), -s.p)) + ')(' + tx(bin(V('x'), -s.q)) + ')'; })];
            return p;
          } },
          { id: 'e1a', sub: 'a', level: 'EMG', make: function (r) {
            return B.mc(r, 'Complete the rule: if ' + t('c>0') + ' the two integers both carry the sign of ___; if ' + t('c<0') + ' they have ___ signs and the one further from zero carries the sign of ___.', [
              { html: t('b') + '; opposite; ' + t('b'), right: true },
              { html: t('c') + '; opposite; ' + t('c'), why: 'When ' + t('c>0') + ' the sign of ' + t('c') + ' is always ' + t('+') + ', yet the integers can both be negative (row 2). The sum decides: look at ' + t('b') + '.' },
              { html: t('b') + '; the same; ' + t('c'), why: 'A negative product needs one positive and one negative number, so the signs are opposite.' },
              { html: t('c') + '; opposite; ' + t('b'), why: 'Row 2 has ' + t('c>0') + ' but both integers negative — they follow the sign of ' + t('b') + ', not ' + t('c') + '.' }],
              'If ' + t('c>0') + ' the product is positive, so the integers have the <b>same</b> sign, and their sum ' + t('b') + ' has that sign too. If ' + t('c<0') + ' the signs are <b>opposite</b>; the sum takes the sign of the integer further from zero, so that one carries the sign of ' + t('b') + '.',
              ['Test the rule on the four rows of the table.'], 'sign rule');
          } },
          { id: 'e1b', sub: 'b', level: 'PRG', make: function (r, sh) {
            var c = sh.u * sh.v, d = sh.v - sh.u;
            return B.mc(r, 'Rows 3 and 4 have the same ' + t('|b|=' + d) + ' and ' + t('|c|=' + c) + ', yet the brackets differ. What does changing the sign of ' + t('b') + ' alone do, and why do the sizes ' + t(sh.u) + ' and ' + t(sh.v) + ' never change?', [
              { html: 'It flips both signs, so the other integer becomes the positive one; the sizes are fixed because ' + t(sh.u) + ' and ' + t(sh.v) + ' are the only factor pair of ' + t(c) + ' that differ by ' + t(d) + '.', right: true },
              { html: 'It changes the sizes to a different factor pair of ' + t(c) + '.', why: 'Compare rows 3 and 4: both use ' + t(sh.u) + ' and ' + t(sh.v) + '. The product ' + t(c) + ' and the gap ' + t(d) + ' fix the sizes.' },
              { html: 'It only changes the sign of the larger number; the smaller one keeps its sign.', why: 'The product must stay negative, so if one sign changes the other must change too.' },
              { html: 'Nothing: rows 3 and 4 have the same factored form.', why: 'Expand them: the middle terms are ' + t('+' + d + 'x') + ' and ' + t('-' + d + 'x') + ', so the factored forms must differ.' }],
              'Row 3: ' + t(sg(-sh.u)) + ' and ' + t(sg(sh.v)) + ' (sum ' + t('+' + d) + '). Row 4: ' + t(sg(sh.u)) + ' and ' + t(sg(-sh.v)) + ' (sum ' + t('-' + d) + '). Changing the sign of ' + t('b') + ' flips both signs. The sizes are set by ' + t('|c|=' + c) + ': its pairs are ' + t(pairsTex(c)) + ', and only ' + t(sh.u) + ' and ' + t(sh.v) + ' differ by ' + t(d) + '.',
              ['Write the two integers for rows 3 and 4 side by side.'], 'why sizes stay');
          } }] },
      { num: '2', stem: 'Decide the sign pattern of the two integers first (from the signs of ' + t('b') + ' and ' + t('c') + '), then factor.',
        shared: function (r) { var N = r.pick([24, 30, 36, 40, 48, 60]), pr = posPairs(N).filter(function (pq) { return pq[0] > 1 && pq[1] - pq[0] >= 2; }); return { N: N, pr: r.pick(pr) }; },
        parts: [
          { id: 'e2a', level: 'BEG', make: function (r, sh) { return facPart(spec({ p: sh.pr[0], q: sh.pr[1] })); } },
          { id: 'e2b', level: 'BEG', make: function (r, sh) { return facPart(spec({ p: -sh.pr[0], q: -sh.pr[1] })); } },
          { id: 'e2c', level: 'BEG', make: function (r, sh) { return facPart(spec({ p: -sh.pr[0], q: sh.pr[1] })); } },
          { id: 'e2d', level: 'BEG', make: function (r, sh) { return facPart(spec({ p: sh.pr[0], q: -sh.pr[1] })); } },
          { id: 'e2e', level: 'BEG', make: function (r, sh) { return facPart(spec({ p: 1, q: -sh.N })); } },
          { id: 'e2f', level: 'BEG', make: function (r) { return facPart(spec({ p: r.int(2, 4), q: r.pick([11, 13, 17]) })); } }] },
      { num: '3', stem: 'All four of these are built from the <b>same</b> two numbers.',
        shared: function (r) { var u = r.int(2, 5); return { u: u, v: r.int(u + 2, 9) }; },
        parts: [
          { id: 'e3', sub: 'a–d', level: 'BEG', make: function (r, sh) {
            var S = [spec({ p: sh.u, q: sh.v }), spec({ p: -sh.u, q: -sh.v }), spec({ p: -sh.u, q: sh.v }), spec({ p: sh.u, q: -sh.v })];
            var p = B.fields('Factor each one.', S.map(function (s, i) { return { name: '(' + 'abcd'[i] + ')', label: t(tx(s.full) + '='), mode: 'math', keys: 'poly', vars: ['x'], wide: true }; }),
              S.map(function (s) { return facPart(s).check; }), S.map(function (s) { return s.key; }), S.map(function (s) { return t(tx(s.full) + '=' + s.key); }).join('<br>'),
              S.map(function (s) { return t(sg(s.p)) + ' and ' + t(sg(s.q)) + ': product ' + t(s.c) + ', sum ' + t(s.b) + ', so ' + t(tx(s.full) + '=' + s.key); }).join('<br>'),
              ['The sizes are always ' + t(sh.u) + ' and ' + t(sh.v) + ' — only the signs change. Use the signs of ' + t('b') + ' and ' + t('c') + '.'], 'same pair four ways');
            p.bad = [S.map(function (s) { return '(' + tx(bin(V('x'), -s.p)) + ')(' + tx(bin(V('x'), -s.q)) + ')'; })];
            return p;
          } },
          { id: 'e3e', sub: 'e', level: 'EMG', make: function (r, sh) {
            var a = sh.u + sh.v, d = sh.v - sh.u;
            return B.mc(r, 'In (a) and (b) the middle coefficient is ' + t('\\pm' + a) + '; in (c) and (d) it is only ' + t('\\pm' + d) + '. Where do ' + t(a) + ' and ' + t(d) + ' come from?', [
              { html: 'When ' + t('c>0') + ' the numbers have the same sign, so the sizes add: ' + t(sh.u + '+' + sh.v + '=' + a) + '. When ' + t('c<0') + ' the signs are opposite, so the sizes subtract: ' + t(sh.v + '-' + sh.u + '=' + d) + '.', right: true },
              { html: t(a) + ' is the sum and ' + t(d) + ' is the product of ' + t(sh.u) + ' and ' + t(sh.v) + '.', why: 'The product of ' + t(sh.u) + ' and ' + t(sh.v) + ' is ' + t(sh.u * sh.v) + ' — that is the constant term, not the middle coefficient.' },
              { html: 'They are unrelated: (c) and (d) use a different pair of numbers.', why: 'Factor (c): its brackets also contain ' + t(sh.u) + ' and ' + t(sh.v) + ', just with opposite signs.' },
              { html: t(d) + ' comes from dividing: ' + t(a + '\\div ' + sh.v) + '.', why: 'Try it with the actual numbers: the middle coefficient is the <b>sum</b> of the two signed integers.' }],
              'The middle coefficient is the sum of the two signed integers. Same signs: ' + t(sh.u + '+' + sh.v + '=' + a) + ' (or ' + t(-a) + '). Opposite signs: ' + t(sh.v + '+(-' + sh.u + ')=' + d) + ' (or ' + t(-d) + ').',
              ['Write the two signed integers for each of (a)–(d) and add them.'], 'where 11 and 3 come from');
          } },
          { id: 'e3f', sub: 'f', level: 'EMG', make: function (r, sh) {
            var c = sh.u * sh.v;
            return B.mc(r, 'Is there a trinomial ' + t('x^{2}+bx+' + c) + ' or ' + t('x^{2}+bx-' + c) + ' that uses the pair ' + t(sh.u) + ' and ' + t(sh.v) + ' but is <b>not</b> one of (a)–(d)?', [
              { html: 'No: the pair can only be signed four ways, ' + t('(+,+),(-,-),(-,+),(+,-)') + ', giving exactly (a)–(d).', right: true },
              { html: 'Yes: ' + t('x^{2}+' + (c + 1) + 'x+' + c) + '.', why: 'That one uses the pair ' + t(1) + ' and ' + t(c) + ', not ' + t(sh.u) + ' and ' + t(sh.v) + '.' },
              { html: 'Yes: swapping the order of the brackets gives new trinomials.', why: 'The order of the brackets doesn’t change the product, so it gives the same trinomial.' },
              { html: 'Yes: you can also use ' + t('\\pm' + c) + ' as the middle coefficient.', why: 'The middle coefficient is the sum of the pair, which can only be ' + t('\\pm' + (sh.u + sh.v)) + ' or ' + t('\\pm' + (sh.v - sh.u)) + '.' }],
              'Each of ' + t(sh.u) + ' and ' + t(sh.v) + ' can be ' + t('+') + ' or ' + t('-') + ': four sign choices. ' + t('+,+') + ' and ' + t('-,-') + ' give product ' + t(c) + ' and ' + t('b=\\pm' + (sh.u + sh.v)) + '; the mixed ones give ' + t(-c) + ' and ' + t('b=\\pm' + (sh.v - sh.u)) + '. That is exactly (a)–(d).',
              ['Count the ways to put signs on the two numbers.'], 'only four trinomials');
          } }] },
      { num: '4', section: 'Extra practice B — Take the Common Factor Out First', stem: 'Each of these becomes ' + t('x^{2}+bx+c') + ' once the common factor is removed. Factor completely.', parts: [
        { id: 'e4a', level: 'EMG', make: function (r) { var p = r.int(1, 4), q = r.int(p + 1, 6); return facPart(spec({ G: P.num(r.pick([2, 3, 4, 5])), p: p, q: q })); } },
        { id: 'e4b', level: 'PRG', make: function (r) { var p = r.int(2, 4), q = r.int(p + 1, 7); return facPart(spec({ G: P.mono(r.pick([2, 3, 5]), { x: 1 }), p: -p, q: -q })); } },
        { id: 'e4c', level: 'EMG', make: function (r) { var q = r.int(2, 5), p = q + r.int(1, 2); return facPart(spec({ G: P.num(r.pick([3, 5, 7])), p: -p, q: q })); } },
        { id: 'e4d', level: 'PRG', make: function (r) { var q = r.int(2, 6), p = q + r.int(1, 3); return facPart(spec({ G: P.mono(1, { x: 1, y: 1 }), p: -p, q: q })); } },
        { id: 'e4e', level: 'PRG', make: function (r) { var q = r.int(3, 6), p = q + r.int(2, 4); return facPart(spec({ G: P.mono(r.pick([2, 3, 4, 6]), { x: 2 }), p: p, q: -q })); } },
        { id: 'e4f', level: 'PRG', make: function (r) { var q = r.int(4, 8); return facPart(spec({ G: P.mono(r.pick([2, 3]), { y: 2 }), p: q + 1, q: -q })); } }] },
      { num: '5', stem: 'Each of these has a <b>negative</b> leading coefficient. Remove a negative common factor so that what is left starts with ' + t('+x^{2}') + ', then factor. Watch every sign inside the bracket.', parts: [
        { id: 'e5a', level: 'EMG', make: function (r) { var p = r.int(2, 5), q = r.int(p + 1, 6); return facPart(spec({ G: P.num(-1), p: p, q: q })); } },
        { id: 'e5b', level: 'PRG', make: function (r) { var p = r.int(2, 4), q = r.int(p + 1, 6); return facPart(spec({ G: P.num(-r.pick([2, 3, 4, 5])), p: -p, q: -q })); } },
        { id: 'e5c', level: 'PRG', make: function (r) { var q = r.int(3, 6), p = q + r.int(1, 2); return facPart(spec({ G: P.mono(-r.pick([2, 3, 4]), { x: 1 }), p: -p, q: q })); } },
        { id: 'e5d', level: 'EMG', make: function (r) { var q = r.int(2, 6), p = q + r.int(2, 5); var s = spec({ G: P.num(-1), p: -p, q: q }), f = facPart(s); f.good.push('(' + p + '-x)(' + tx(s.B) + ')'); return f; } },
        { id: 'e5e', level: 'PRG', make: function (r) { var q = r.int(3, 6); return facPart(spec({ v: 'a', y: 'b', G: P.num(-r.pick([2, 3, 5])), p: q + 1, q: -q })); } },
        { id: 'e5f', level: 'PRG', make: function (r) { var p = r.int(2, 4), q = r.int(p + 3, 9); return facPart(spec({ v: 'm', G: P.mono(-1, { m: 2 }), p: -p, q: -q })); } }] },
      { num: '6', stem: 'Two questions about the common-factor step itself.', parts: [
        { id: 'e6a', sub: 'a', level: 'EMG', make: function (r) {
          var q = r.int(2, 6), p = q + r.int(2, 5), s = spec({ G: P.num(-1), p: -p, q: q }), alt = '(' + p + '-x)(x+' + q + ')';
          return B.mc(r, 'You factored ' + t(tx(s.full)) + ' as ' + t(s.key) + '. A classmate writes ' + t(tx(s.full) + '=' + alt) + ' instead. Which statement is true?', [
            { html: 'Both are correct: ' + t('-(x-' + p + ')=' + p + '-x') + ', so the ' + t('-1') + ' has just been moved into the first bracket.', right: true },
            { html: 'Only ' + t(s.key) + ' is correct; a factor must start with ' + t('x') + '.', why: 'Expand ' + t(alt) + ': you get ' + t(tx(s.full)) + '. The product is unchanged, so it is a correct factorization.' },
            { html: t(alt) + ' equals ' + t(tx(s.inner)) + ', the opposite expression.', why: 'Expand it carefully: ' + t(p + '\\cdot x+' + p * q + '-x^{2}-' + q + 'x') + '. The ' + t('-x^{2}') + ' term is there.' },
            { html: 'They are equal only when ' + t('x=' + p) + '.', why: 'Expand both: they give the same polynomial, so they are equal for every value of ' + t('x') + '.' }],
            t(alt + '=' + p + 'x+' + p * q + '-x^{2}-' + q + 'x=' + tx(s.full)) + ' ✓. Multiplying ' + t('-1') + ' into the first bracket gives ' + t('-(x-' + p + ')=' + p + '-x') + ', so the product is the same. The ' + t('-1') + ' has to live somewhere: out front, or absorbed into a bracket.',
            ['Expand the classmate’s answer.'], 'negative absorbed in bracket');
        } },
        { id: 'e6b', sub: 'b', level: 'EMG', make: function (r) {
          var p = r.int(1, 4), q = pickWhere(function () { return r.pick([1, 3, 5, 7]); }, function (v) { return v !== 2 * p; }), T = P.mul(bin(V('x'), p), P.add(P.scale(V('x'), 2), P.num(q)));
          return B.mc(r, 'A student tries to start ' + t(tx(T)) + ' with a common-factor step and gets stuck. Why?', [
            { html: 'The coefficients have no common factor greater than ' + t('1') + ' (the middle one is odd), so the ' + t('2') + ' can’t be divided out of every term; the common-factor step only works when the leading coefficient divides every coefficient.', right: true },
            { html: 'You should take out ' + t('2') + ' anyway: ' + t('2(x^{2}+' + (2 * p + q) / 2 + 'x+' + (p * q) / 2 + ')') + '.', why: 'That leaves a non-integer coefficient. Factoring over the integers needs integer coefficients in every factor.' },
            { html: 'It cannot be factored at all.', why: 'It does factor — ' + t(tx(T) + '=(x+' + p + ')(2x+' + q + ')') + ' — but by a different method (Lesson 4).' },
            { html: 'Take out ' + t('x') + ' first.', why: 'The constant term has no ' + t('x') + ', so ' + t('x') + ' is not a common factor.' }],
            'The coefficients ' + t('2') + ', ' + t((2 * p + q)) + ', ' + t(p * q) + ' have no common factor greater than ' + t('1') + ', so no common factor can turn this into ' + t('x^{2}+bx+c') + '. Another method is needed: ' + t(tx(T) + '=(x+' + p + ')(2x+' + q + ')') + '.',
            ['What number divides all three coefficients?'], 'no common factor for ax^2');
        } }] },
      { num: '7', section: 'Extra practice C — Two Variables', stem: 'Factor completely. The second variable rides along with the second term of each bracket.', parts: [
        { id: 'e7a', level: 'EMG', make: function (r) { var p = r.int(2, 4), q = r.int(p + 1, 6); return facPart(spec({ y: 'y', p: p, q: q })); } },
        { id: 'e7b', level: 'EMG', make: function (r) { var p = r.int(2, 3), q = r.int(5, 10); return facPart(spec({ v: 'a', y: 'b', p: -p, q: -q })); } },
        { id: 'e7c', level: 'PRG', make: function (r) { var q = r.int(4, 8), p = q + r.int(2, 4); return facPart(spec({ v: 'm', y: 'n', p: p, q: -q })); } },
        { id: 'e7d', level: 'PRG', make: function (r) { var q = r.int(3, 6), p = q + r.int(4, 8); return facPart(spec({ y: 'y', p: -p, q: q })); } },
        { id: 'e7e', level: 'PRG', make: function (r) { var q = r.int(3, 6); return facPart(spec({ v: 'p', y: 'q', G: P.num(r.pick([2, 3, 5])), p: -(q + 1), q: q })); } },
        { id: 'e7f', level: 'PRG', make: function (r) { var q = r.int(3, 5); return facPart(spec({ v: 'u', y: 'v', G: P.num(-r.pick([2, 3, 4])), p: -(q + 1), q: q })); } },
        { id: 'e7g', sub: 'g', level: 'EMG', make: function (r) {
          var p = r.int(2, 4), q = r.int(p + 1, 6), s = spec({ y: 'y', p: p, q: q }), wrongP = P.mul(bin(V('x'), p), bin(V('x'), q, V('y')));
          return B.mc(r, 'A student factors ' + t(tx(s.full)) + ' as ' + t('(x+' + p + ')(x+' + q + 'y)') + '. Why must <b>both</b> brackets carry a ' + t('y') + '?', [
            { html: 'The last term ' + t(s.c + 'y^{2}') + ' is the product of the two last terms, so each must supply one ' + t('y') + '. The student’s answer expands to ' + t(tx(wrongP)) + '.', right: true },
            { html: 'It doesn’t matter which bracket has the ' + t('y') + '; one is enough.', why: 'Expand ' + t('(x+' + p + ')(x+' + q + 'y)') + ': you get ' + t(tx(wrongP)) + ' — no ' + t('y^{2}') + ' term at all.' },
            { html: 'Because ' + t('y') + ' must appear in the first term of each bracket.', why: 'The first terms multiply to ' + t('x^{2}') + ', so they are both ' + t('x') + '. The ' + t('y') + ' goes with the <b>second</b> term.' },
            { html: 'Because the middle term has a ' + t('y') + ' in it.', why: 'The middle term only needs one ' + t('y') + '. It is the ' + t('y^{2}') + ' in the last term that forces a ' + t('y') + ' in each bracket.' }],
            t('(x+' + p + ')(x+' + q + 'y)=' + tx(wrongP)) + ': stray terms and no ' + t('y^{2}') + '. To make ' + t(s.c + 'y^{2}') + ', the last terms must multiply to ' + t('y\\cdot y') + ', so ' + t(tx(s.full) + '=' + s.key) + '.',
            ['Expand the student’s answer.'], 'why both brackets carry y');
        } }] },
      { num: '8', section: 'Extra practice D — Higher Powers in Disguise', stem: 'Each of these is ' + t('x^{2}+bx+c') + ' in disguise: the first term is the square of something, and the middle term has that something to the first power. Factor each one.', parts: [
        { id: 'e8a', level: 'PRG', make: function (r) { var p = r.int(1, 4), q = r.int(p + 1, 6); return facPart(spec({ e: 2, p: p, q: q })); } },
        { id: 'e8b', level: 'PRG', make: function (r) { var o = pickWhere(function () { return [r.int(2, 5), r.int(3, 9)]; }, function (o) { return o[0] < o[1] && !isSq(o[0]) && !isSq(o[1]); }); return facPart(spec({ e: 2, p: -o[0], q: -o[1] })); } },
        { id: 'e8c', level: 'PRG', make: function (r) { var o = pickWhere(function () { return [r.int(3, 8), r.int(2, 7)]; }, function (o) { return o[0] > o[1] && !isSq(o[1]); }); return facPart(spec({ v: 'a', e: 2, p: o[0], q: -o[1] })); } },
        { id: 'e8d', level: 'ADV', make: function (r) { var o = pickWhere(function () { return [r.int(2, 5), r.int(3, 7)]; }, function (o) { return o[0] < o[1] && [1, 8, 27].indexOf(o[0]) < 0 && [1, 8, 27].indexOf(o[1]) < 0; }); return facPart(spec({ e: 3, p: o[0], q: o[1] })); } },
        { id: 'e8e', level: 'ADV', make: function (r) { var q = pickWhere(function () { return r.int(3, 9); }, function (v) { return !isSq(v + 1) && v !== 4; }); return facPart(spec({ v: 'y', e: 4, p: -(q + 1), q: q })); } },
        { id: 'e8f', level: 'PRG', make: function (r) { var p = r.int(1, 3), q = r.int(p + 1, 5); return facPart(spec({ e: 2, G: P.num(r.pick([2, 3, 4])), p: p, q: q })); } }] },
      { num: '9', stem: 'Same idea, but at least one bracket factors <b>again</b> as a difference of squares, ' + t('a^{2}-b^{2}=(a-b)(a+b)') + ' (a sum of squares ' + t('a^{2}+b^{2}') + ' does not factor). Factor completely.', parts: [
        { id: 'e9a', level: 'PRG', make: function (r) { var h = r.int(1, 2), k = r.int(h + 1, 4); return dsqPart(-h, -k); } },
        { id: 'e9b', level: 'PRG', make: function (r) { var h = r.int(1, 3), k = r.int(h + 1, 5); return dsqPart(h, -k); } },
        { id: 'e9c', level: 'PRG', make: function (r) { var k = r.int(1, 3), h = r.int(k + 1, 4); return dsqPart(h, -k); } },
        { id: 'e9d', level: 'PRG', make: function (r) { var h = r.int(1, 3), k = r.int(4, 6); return dsqPart(-h, -k); } },
        { id: 'e9e', sub: 'e', level: 'PRG', make: function (r) {
          var h = r.int(1, 3), k = r.int(h + 1, 5), T = P.mul(P.add(V('x', 2), P.num(h * h)), P.sub(V('x', 2), P.num(k * k))), sq = 'x^{2}+' + h * h;
          return B.mc(r, 'Factoring ' + t(tx(T)) + ' stops at three brackets: ' + t('(' + sq + ')(x-' + k + ')(x+' + k + ')') + '. Why can’t ' + t('(' + sq + ')') + ' be taken further?', [
            { html: 'It is a <b>sum</b> of squares: as ' + t('x^{2}+0x+' + h * h) + ' it would need two integers with product ' + t(h * h) + ' and sum ' + t('0') + ', and none exist.', right: true },
            { html: 'It can: ' + t('(x+' + h + ')(x-' + h + ')') + '.', why: 'Expand ' + t('(x+' + h + ')(x-' + h + ')') + ': it gives ' + t('x^{2}-' + h * h) + ', not ' + t(sq) + '.' },
            { html: 'It can: ' + t('(x+' + h + ')^{2}') + '.', why: t('(x+' + h + ')^{2}=x^{2}+' + 2 * h + 'x+' + h * h) + ' — it has a middle term.' },
            { html: 'Because ' + t(h * h) + ' is not a perfect square.', why: t(h * h + '=' + h + '^{2}') + ' is a perfect square. The problem is the <b>plus</b> sign.' }],
            t(sq) + ' is a sum of squares. Over the integers it would need two integers with product ' + t(h * h) + ' (same signs) and sum ' + t('0') + ' (opposite signs) — impossible. So it does not factor.',
            ['Try to write ' + t(sq) + ' as ' + t('x^{2}+0x+' + h * h) + ' and look for the pair.'], 'why sum of squares stops');
        } },
        { id: 'e9f', sub: 'f', level: 'EMG', make: function (r) {
          var h = r.int(2, 3);
          return B.mc(r, 'Why is ' + t('x^{2}+' + h * h) + ' not a difference of squares, even though ' + t(h * h) + ' is a perfect square?', [
            { html: 'A difference of squares needs a <b>subtraction</b> between the two squares; here they are added.', right: true },
            { html: 'Because ' + t('x^{2}') + ' is not a perfect square.', why: t('x^{2}=(x)^{2}') + ' is a perfect square. Look at the sign between the terms.' },
            { html: 'Because it has only two terms.', why: 'A difference of squares also has two terms, like ' + t('x^{2}-' + h * h) + '. The sign is what matters.' },
            { html: 'It is one: ' + t('x^{2}+' + h * h + '=(x-' + h + ')(x+' + h + ')') + '.', why: 'Expand ' + t('(x-' + h + ')(x+' + h + ')') + ': it gives ' + t('x^{2}-' + h * h) + '.' }],
            t('a^{2}-b^{2}=(a-b)(a+b)') + ' needs a minus sign. In ' + t('x^{2}+' + h * h) + ' the squares are added, so the pattern does not apply (' + t('x^{2}-' + h * h) + ' would give ' + t('(x-' + h + ')(x+' + h + ')') + ').',
            ['Expand ' + t('(x-' + h + ')(x+' + h + ')') + ' and compare.'], 'sum vs difference of squares');
        } }] },
      { num: '10', section: 'Extra practice E — When the Method Terminates', stem: 'Factor where possible. If a trinomial can’t be factored over the integers, press <b>none</b>.',
        shared: function (r) {
          var ab = pickWhere(function () { var p = r.int(2, 4), q = r.int(p + 1, 6); return { p: p, q: q }; }, function (o) { return !factorable(o.p + o.q, o.p * o.q + 1); });
          var cd = pickWhere(function () { var p = r.int(1, 3), q = r.int(p + 1, 6); return { p: p, q: q }; }, function (o) { return !factorable(-(o.p + o.q), -o.p * o.q); });
          var ef = pickWhere(function () { var v = r.int(3, 6), u = v + r.int(2, 5); return { u: u, v: v, w: r.int(2, 12) }; }, function (o) { return !factorable(o.u - o.v, -o.w) && o.w !== o.u * o.v; });
          return { ab: ab, cd: cd, ef: ef };
        },
        parts: [
          { id: 'e10a', level: 'EMG', make: function (r, sh) { return nonePart('x', sh.ab.p + sh.ab.q, sh.ab.p * sh.ab.q + 1); } },
          { id: 'e10b', level: 'BEG', make: function (r, sh) { return canPart(spec({ p: sh.ab.p, q: sh.ab.q })); } },
          { id: 'e10c', level: 'EMG', make: function (r, sh) { return nonePart('x', -(sh.cd.p + sh.cd.q), -sh.cd.p * sh.cd.q); } },
          { id: 'e10d', level: 'BEG', make: function (r, sh) { return canPart(spec({ p: -sh.cd.p, q: -sh.cd.q })); } },
          { id: 'e10e', level: 'EMG', make: function (r, sh) { return nonePart('x', sh.ef.u - sh.ef.v, -sh.ef.w); } },
          { id: 'e10f', level: 'BEG', make: function (r, sh) { return canPart(spec({ p: sh.ef.u, q: -sh.ef.v })); } },
          { id: 'e10g', level: 'BEG', make: function (r) { var p = r.int(2, 4), q = r.int(p + 2, 8); return canPart(spec({ p: -p, q: -q })); } },
          { id: 'e10h', level: 'EMG', make: function (r) {
            var o = pickWhere(function () { return { c: r.pick([6, 8, 10, 12, 14, 15, 18, 20, 21]), b: r.int(1, 5) }; }, function (o) { return !factorable(o.b, o.c); });
            return nonePart('x', o.b, o.c);
          } }] },
      { num: '11', stem: 'Knowing when to stop.', parts: [
        { id: 'e11a', sub: 'a', level: 'EMG', make: function (r) {
          var p = r.pick([5, 7, 11, 13]), b = r.int(1, 3);
          return B.mc(r, 'How can you be certain ' + t('x^{2}+' + (b === 1 ? '' : b) + 'x+' + p) + ' cannot be factored over the integers after testing only <b>two</b> pairs?', [
            { html: t(p) + ' is prime, so the only integer pairs with product ' + t(p) + ' are ' + t('1\\ \\&\\ ' + p) + ' (sum ' + t(p + 1) + ') and ' + t('-1\\ \\&\\ -' + p) + ' (sum ' + t(-(p + 1)) + '). Neither sum is ' + t(b) + '.', right: true },
            { html: 'Because the middle coefficient is small, there are only two pairs to try.', why: 'The number of pairs depends on the <b>constant term</b>, not the middle coefficient.' },
            { html: 'Because only positive pairs need testing, and there are two of them.', why: 'Negative pairs also have a positive product, so they must be tested too. ' + t(p) + ' has just one positive pair.' },
            { html: 'You can’t be certain without testing every integer up to ' + t(p) + '.', why: 'The two integers must multiply to ' + t(p) + ', and a prime has only the factors ' + t('\\pm1') + ' and ' + t('\\pm' + p) + '.' }],
            t(p) + ' is prime, so the only pairs are ' + t('1\\ \\&\\ ' + p) + ' (sum ' + t(p + 1) + ') and ' + t('-1\\ \\&\\ -' + p) + ' (sum ' + t(-(p + 1)) + '). Neither is ' + t(b) + ', and there is nothing else to test.',
            ['What are the factors of ' + t(p) + '?'], 'prime constant: two pairs');
        } },
        { id: 'e11b', sub: 'b', level: 'PRG', make: function (r) {
          var p = r.pick([11, 13, 17, 19, 23]);
          var q = B.fields('For the prime ' + t(p) + ', ' + t('x^{2}+bx+' + p) + ' can be factored over the integers for exactly two values of ' + t('b') + '. State both.', [numField('b ='), numField('b =')], [function () { return ok(); }, function () { return ok(); }],
            [String(p + 1), String(-(p + 1))], t('b=' + (p + 1)) + ' and ' + t('b=-' + (p + 1)),
            'A prime ' + t(p) + ' has exactly two integer factor pairs: ' + t('1\\ \\&\\ ' + p) + ' (sum ' + t(p + 1) + ') and ' + t('-1\\ \\&\\ -' + p) + ' (sum ' + t(-(p + 1)) + ').<br>So ' + t('b=\\pm(' + p + '+1)=\\pm' + (p + 1)) + ': ' + t('x^{2}+' + (p + 1) + 'x+' + p + '=(x+1)(x+' + p + ')') + ' and ' + t('x^{2}-' + (p + 1) + 'x+' + p + '=(x-1)(x-' + p + ')') + '.',
            ['A prime has only the factors ' + t('\\pm1') + ' and ' + t('\\pm' + p) + '.', 'Don’t forget the negative pair.'], 'prime c: values of b');
          q.check = setCheck([p + 1, -(p + 1)], function (v) {
            var a = v.map(Math.abs);
            if (a[0] === p && a[1] === p) return { code: 'gave-c', hint: t(p) + ' is the constant. ' + t('b') + ' is the <b>sum</b> of a factor pair of ' + t(p) + '.' };
            if (v[0] === v[1]) return { code: 'no-negatives', hint: 'The two values must be different — remember the negative pair ' + t('-1\\ \\&\\ -' + p) + '.' };
            return null;
          });
          q.bad = [[String(p), String(-p)], [String(p + 1), String(p + 1)]];
          return q;
        } }] },
      { num: '12', section: 'Extra practice F — Working Backwards',
        shared: function (r) { return { c: r.pick([24, 18, 20, 30, 28, 40, 12]) }; },
        stem: function (sh) { return 'Consider ' + t('x^{2}+bx+' + sh.c) + ', where ' + t('b') + ' is an integer.'; },
        parts: [
          { id: 'e12a', sub: 'a', level: 'PRG', make: function (r, sh) {
            var c = sh.c, sums = posPairs(c).map(function (pq) { return pq[0] + pq[1]; });
            return { prompt: 'List every <b>positive</b> value of ' + t('b') + ' for which it can be factored over the integers.', input: { type: 'list' }, key: sums.slice().sort(function (a, b) { return a - b; }), answer: t(sums.slice().sort(function (a, b) { return a - b; }).join(',\\ ')),
              check: function (resp) {
                if (!resp || !resp.length) return form('empty', 'Add the values one at a time (press Enter or comma after each).');
                var seen = {}; for (var i = 0; i < resp.length; i++) { if (seen[resp[i]]) return form('duplicate', 'You listed ' + t(resp[i]) + ' more than once.'); seen[resp[i]] = 1; }
                var bad = resp.filter(function (v) { return sums.indexOf(v) < 0; });
                if (bad.length) return wrong('not-b', t(bad[0]) + ' is not the sum of a factor pair of ' + t(c) + ', so ' + t('x^{2}+' + bad[0] + 'x+' + c) + ' doesn’t factor.');
                if (resp.length < sums.length) return wrong('missing-b', 'You have ' + resp.length + ' of the ' + sums.length + ' values. Go through the factor pairs of ' + t(c) + ' in order: ' + t('1\\times ' + c) + ', ' + t('2\\times ?') + ', …');
                return ok();
              },
              solution: 'Each positive factor pair of ' + t(c) + ' gives one positive ' + t('b') + ' (its sum): ' + posPairs(c).map(function (pq) { return t(pq[0] + '\\ \\&\\ ' + pq[1]) + ' → ' + t(pq[0] + pq[1]); }).join(', ') + '.',
              hints: ['List the factor pairs of ' + t(c) + ' and add each pair.'], text: 'positive b values for x^2+bx+' + c, bad: [[c], sums.slice(1)] };
          } },
          { id: 'e12b', sub: 'b', level: 'PRG', make: function (r, sh) {
            var n = posPairs(sh.c).length;
            return B.number('How many integer values of ' + t('b') + ' are there in all (positive and negative)?', 2 * n, function (v) {
              if (v === n) return { code: 'no-negatives', hint: 'Each positive pair has a negative partner with the same product: e.g. ' + t('(-1)(-' + sh.c + ')=' + sh.c) + '. Count those too.' };
              return null;
            }, 'The positive pairs give ' + t(n) + ' values; each has a negative partner (both integers negative, same product, opposite sum). So there are ' + t('2\\times ' + n + '=' + 2 * n) + ' values: ' + t(posPairs(sh.c).map(function (pq) { return '\\pm' + (pq[0] + pq[1]); }).join(',\\ ')) + '.',
            ['Two negative integers can also multiply to ' + t(sh.c) + '.'], 'count of b values');
          } },
          { id: 'e12c', sub: 'c', level: 'EMG', make: function (r, sh) {
            return B.mc(r, 'Every positive value of ' + t('b') + ' has a negative partner of the same size. Why must that happen for <b>any</b> positive constant term?', [
              { html: 'If ' + t('m\\cdot n=c') + ', then ' + t('(-m)(-n)=c') + ' too, with the opposite sum ' + t('-(m+n)') + '.', right: true },
              { html: 'Because ' + t('b') + ' is always even.', why: 'Not so: ' + t('x^{2}+' + (sh.c + 1) + 'x+' + sh.c) + ' factors. The reason is about the signs of the pair.' },
              { html: 'Because the negative of a factor of ' + t('c') + ' is never a factor.', why: 'Negative integers can be factors: ' + t('(-1)(-' + sh.c + ')=' + sh.c) + '.' },
              { html: 'It only happens for this particular ' + t('c') + '.', why: 'Try another positive constant: the negative pairs always exist.' }],
              'With ' + t('c>0') + ' the two integers share a sign. Any positive pair ' + t('m,\\ n') + ' has a mirror pair ' + t('-m,\\ -n') + ' with the same product ' + t('(-m)(-n)=mn') + ' but the opposite sum. So the values of ' + t('b') + ' come in ' + t('\\pm') + ' partners.',
              ['Multiply two negative numbers.'], 'why ± partners');
          } }] },
      { num: '13', stem: 'One factor is given. Determine the missing coefficient.', parts: [
        { id: 'e13a', level: 'EMG', make: function (r) { var s0 = r.int(3, 8), o = pickWhere(function () { return r.int(1, s0 + 3); }, function (v) { return v !== s0; }); return backPart('x^{2}+' + (s0 + o) + 'x+c', 'c', s0, o, 'c'); } },
        { id: 'e13b', level: 'PRG', make: function (r) { var s0 = r.int(6, 12), b = r.int(2, s0 - 2); return backPart('x^{2}-' + b + 'x+c', 'c', -s0, s0 - b, 'c'); } },
        { id: 'e13c', level: 'PRG', make: function (r) { var s0 = r.int(6, 12), o = r.int(2, 5); return backPart('x^{2}+bx-' + s0 * o, 'b', s0, -o, 'b'); } },
        { id: 'e13d', level: 'ADV', make: function (r) { var s0 = r.int(2, 6), b = r.int(5, 12); return backPart('x^{2}-' + b + 'x+c', 'c', s0, -b - s0, 'c'); } },
        { id: 'e13e', level: 'PRG', make: function (r) { var s0 = r.int(5, 12), o = pickWhere(function () { return r.int(2, 6); }, function (v) { return v !== s0; }); return backPart('x^{2}+kx-' + s0 * o, 'k', s0, -o, 'b'); } },
        { id: 'e13f', level: 'PRG', make: function (r) { var s0 = r.int(3, 9); return backPart('x^{2}-x+c', 'c', s0, -1 - s0, 'c'); } }] },
      { num: '14', stem: '<i>(Numerical Response)</i>', parts: [
        { id: 'e14', level: 'ADV', make: function (r) {
          var c = r.pick([18, 12, 20, 28, 30, 24, 16, 32]), sums = posPairs(c).map(function (pq) { return pq[0] + pq[1]; }), ans = sums.reduce(function (a, b) { return a + b; }, 0);
          return B.nr('The sum of all <b>positive</b> integer values of ' + t('b') + ' for which ' + t('x^{2}+bx+' + c) + ' can be factored over the integers is ________.', ans, function (v) {
            if (v === c + 1) return { code: 'not-largest', hint: 'That is just one value of ' + t('b') + ' (from ' + t('1\\times ' + c) + '). Add <b>all</b> the positive values.' };
            if (v === 0) return { code: 'no-negatives', hint: 'Only the <b>positive</b> values of ' + t('b') + ' are added.' };
            if (v === ans - (c + 1)) return { code: 'missing-b', hint: 'Don’t forget the pair ' + t('1\\times ' + c) + '.' };
            return null;
          }, 'Positive ' + t('b') + ' needs a positive pair with product ' + t(c) + ': ' + posPairs(c).map(function (pq) { return t(pq[0] + '\\ \\&\\ ' + pq[1]) + ' (sum ' + t(pq[0] + pq[1]) + ')'; }).join(', ') + '.<br>Sum: ' + t(sums.join('+') + '=' + ans) + '.',
          ['List every positive factor pair of ' + t(c) + ' and its sum.'], 'NR sum of positive b');
        } }] },
      { num: '15', section: 'Extra practice G — Find the Error',
        shared: function (r) {
          return pickWhere(function () { var c = r.pick([24, 30, 36, 40, 48, 60]), pr = posPairs(c).filter(function (pq) { return pq[0] > 1 && pq[0] !== pq[1]; }); var two = r.sample(pr, 2); return { c: c, ok: two[0], st: two[1] }; }, function (o) { return o.ok && o.st; });
        },
        stem: function (sh) { return 'Asked to factor ' + t(triTex('x', sh.ok[0] + sh.ok[1], sh.c)) + ', a student wrote ' + t('(x+' + sh.st[0] + ')(x+' + sh.st[1] + ')') + ', reasoning that ' + t(sh.st[0] + '\\times ' + sh.st[1] + '=' + sh.c) + '.'; },
        parts: [
          { id: 'e15a', sub: 'a', level: 'BEG', make: function (r, sh) {
            var S = spec({ p: sh.st[0], q: sh.st[1] });
            var p = B.poly('Expand the student’s answer.', S.inner, { wrong: [{ is: P.add(V('x', 2), P.num(sh.c)), code: 'fl-only', hint: 'You have only the First and Last products. Add the Outer and Inner products for the middle term.' }] },
              t('(x+' + sh.st[0] + ')(x+' + sh.st[1] + ')=' + foilTex(S) + '=' + tx(S.inner)) + '. The constant ' + t(sh.c) + ' is right, but the <b>middle term</b> is ' + t((sh.st[0] + sh.st[1]) + 'x') + ' instead of ' + t((sh.ok[0] + sh.ok[1]) + 'x') + '.',
              ['Use FOIL: First, Outer, Inner, Last.'], 'expand student answer');
            return p;
          } },
          { id: 'e15b', sub: 'b', level: 'BEG', make: function (r, sh) { var s = spec({ p: sh.ok[0], q: sh.ok[1] }); return facPart(s, { prompt: 'The student checked the product but not the sum. Write the correct factored form.', check: true }); } },
          { id: 'e15c', sub: 'c', level: 'EMG', make: function (r, sh) {
            var b = sh.ok[0] + sh.ok[1];
            return B.mc(r, 'Why can checking the product alone never be enough?', [
              { html: t(sh.c) + ' has several factor pairs (' + t(pairsTex(sh.c)) + '), and they all have product ' + t(sh.c) + '; only the <b>sum</b> picks out the right one.', right: true },
              { html: 'Because the product of the pair should be ' + t(b) + ', not ' + t(sh.c) + '.', why: 'The product is the constant term, ' + t(sh.c) + ' — the student got that right. The sum is ' + t(b) + '.' },
              { html: 'It is enough, as long as you pick the pair with the smallest numbers.', why: t('1\\times ' + sh.c) + ' has the smallest number in it, but its sum is ' + t(sh.c + 1) + ', not ' + t(b) + '.' },
              { html: 'Because the student should have used negative numbers.', why: 'Both coefficients are positive, so both numbers are positive. The problem is the sum.' }],
              'Pairs of ' + t(sh.c) + ': ' + posPairs(sh.c).map(function (pq) { return t(pq[0] + '\\ \\&\\ ' + pq[1]) + ' (sum ' + t(pq[0] + pq[1]) + ')'; }).join(', ') + '. All have product ' + t(sh.c) + ', so the product alone can’t choose. Only ' + t(sh.ok[0] + '\\ \\&\\ ' + sh.ok[1]) + ' gives the sum ' + t(b) + '.',
              ['List all the factor pairs of ' + t(sh.c) + ' with their sums.'], 'product alone not enough');
          } }] },
      { num: '16',
        shared: function (r) { var p = r.int(1, 4); return { p: p, q: r.int(p + 1, 6) }; },
        stem: function (sh) { return 'Asked to factor ' + t(triTex('x', -(sh.p + sh.q), sh.p * sh.q)) + ', a second student wrote ' + t('(x+' + sh.p + ')(x+' + sh.q + ')') + ', reasoning that ' + t(sh.p + '\\times ' + sh.q + '=' + sh.p * sh.q) + ' and ' + t(sh.p + '+' + sh.q + '=' + (sh.p + sh.q)) + '.'; },
        parts: [
          { id: 'e16a', sub: 'a', level: 'BEG', make: function (r, sh) {
            var o = 1 - (sh.p + sh.q) + sh.p * sh.q, st = (1 + sh.p) * (1 + sh.q);
            return B.fields('Substitute ' + t('x=1') + ' into the original trinomial and into the student’s answer.', [numField('Original'), numField('Student’s answer')], [K.number(o, function (v) { return v === st ? { code: 'not-subst', hint: 'That is the student’s value. Substitute into ' + t(triTex('x', -(sh.p + sh.q), sh.p * sh.q)) + '.' } : null; }), K.number(st)], [String(o), String(st)],
              'Original ' + t(o) + ', student ' + t(st), 'Original: ' + t('1^{2}-' + (sh.p + sh.q) + '(1)+' + sh.p * sh.q + '=' + o) + '. Student: ' + t('(1+' + sh.p + ')(1+' + sh.q + ')=' + (1 + sh.p) + '\\times ' + (1 + sh.q) + '=' + st) + '.<br>' + t(o + '\\neq ' + st) + ', so the answer is wrong.',
              ['Replace every ' + t('x') + ' with ' + t('1') + '.'], 'substitute x=1');
          } },
          { id: 'e16b', sub: 'b', level: 'EMG', make: function (r, sh) {
            var b = -(sh.p + sh.q), c = sh.p * sh.q;
            return B.mc(r, 'What do the signs of ' + t('b=' + b) + ' and ' + t('c=' + c) + ' force the two integers to be, and where did the student go wrong?', [
              { html: 'Both negative. The student matched the product and the <b>size</b> of the sum, but ' + t('+' + sh.p) + ' and ' + t('+' + sh.q) + ' add to ' + t(-b) + ', not ' + t(b) + '.', right: true },
              { html: 'Both positive; the student’s answer is right but in the wrong order.', why: 'Two positive numbers can’t add to a negative number. Check the sum.' },
              { html: 'Opposite signs; the student should have used ' + t('+' + sh.p) + ' and ' + t('-' + sh.q) + '.', why: 'Opposite signs give a negative product, but ' + t('c=' + c) + ' is positive.' },
              { html: 'Both negative; the student got the product wrong.', why: t('(-' + sh.p + ')(-' + sh.q + ')') + ' and ' + t(sh.p + '\\times ' + sh.q) + ' are both ' + t(c) + ' — the product was fine. It is the sum that is wrong.' }],
              t('c>0') + ' and ' + t('b<0') + ', so the two integers are <b>both negative</b>. The student never checked the signs: ' + t('+' + sh.p) + ' and ' + t('+' + sh.q) + ' have sum ' + t('+' + (sh.p + sh.q)) + '.',
              ['Use the sign rule: ' + t('c>0') + ' means same signs — the sign of ' + t('b') + '.'], 'sign reasoning');
          } },
          { id: 'e16c1', sub: 'c i', level: 'BEG', make: function (r, sh) { var s = spec({ p: -sh.p, q: -sh.q }); return facPart(s, { prompt: 'Factor ' + t(tx(s.full)) + ' correctly.' }); } },
          { id: 'e16c2', sub: 'c ii', level: 'BEG', make: function (r, sh) {
            var s = spec({ p: sh.p, q: sh.q });
            return B.poly('Write the trinomial that ' + t('(x+' + sh.p + ')(x+' + sh.q + ')') + ' <b>is</b> the factored form of.', s.inner, { wrong: [{ is: P.add(V('x', 2), P.scale(V('x'), -s.b), P.num(s.c)), code: 'sign', hint: 'Expand ' + t('(x+' + sh.p + ')(x+' + sh.q + ')') + ' — every term is positive.' }] },
              t('(x+' + sh.p + ')(x+' + sh.q + ')=' + foilTex(s) + '=' + tx(s.inner)), ['Expand with FOIL.'], 'which trinomial');
          } }] },
      { num: '17', section: 'Extra practice H — Stretch', stem: 'A <b>perfect-square trinomial</b> is one that factors as ' + t('(x+n)^{2}') + ' or ' + t('(x-n)^{2}') + '.',
        shared: function (r) { return { n: r.int(4, 9) }; },
        parts: [
          { id: 'e17a', sub: 'a', level: 'PRG', make: function (r, sh) {
            var n = sh.n, c = n * n;
            var p = B.fields('Find every value of ' + t('k') + ' for which ' + t('x^{2}+kx+' + c) + ' is a perfect-square trinomial.', [numField('k ='), numField('k =')],
              [function () { return ok(); }, function () { return ok(); }], [String(2 * n), String(-2 * n)], t('k=' + 2 * n) + ' and ' + t('k=-' + 2 * n),
              'A perfect square needs the two integers to be equal: ' + t('n\\times n=' + c) + ', so ' + t('n=' + n) + ' or ' + t('n=-' + n) + '.<br>' + t(sg(n) + '\\ \\&\\ ' + sg(n)) + ': sum ' + t(2 * n) + ', so ' + t('x^{2}+' + 2 * n + 'x+' + c + '=(x+' + n + ')^{2}') + '.<br>' + t(-n + '\\ \\&\\ ' + -n) + ': sum ' + t(-2 * n) + ', so ' + t('x^{2}-' + 2 * n + 'x+' + c + '=(x-' + n + ')^{2}') + '.',
              ['In a perfect square the two integers are the same number.', 'Don’t forget the negative case.'], 'perfect square values of k');
            p.check = setCheck([2 * n, -2 * n], function (v) {
              var a = v.map(Math.abs);
              if (a[0] === n && a[1] === n) return { code: 'half-k', hint: t('n=\\pm' + n) + ' are the integers in the brackets. ' + t('k') + ' is their <b>sum</b>: ' + t('n+n') + '.' };
              if (v[0] === v[1]) return { code: 'no-negatives', hint: 'The two values must be different. There is a negative case too: ' + t('(x-n)^{2}') + '.' };
              if (v.indexOf(2 * n) >= 0 || v.indexOf(-2 * n) >= 0) return { code: 'value', hint: 'One value is right. The other comes from the opposite sign.' };
              return null;
            });
            p.bad = [[String(n), String(-n)], [String(2 * n), String(2 * n)], [String(c), String(-c)]];
            return p;
          } },
          { id: 'e17b', sub: 'b', level: 'PRG', make: function (r) {
            return B.mc(r, 'Generalise: for ' + t('x^{2}+kx+c') + ' to be a perfect-square trinomial, what must be true?', [
              { html: t('c') + ' must be a perfect square, ' + t('c=n^{2}') + ', and ' + t('k=\\pm2n=\\pm2\\sqrt{c}') + '.', right: true },
              { html: t('c') + ' must be a perfect square and ' + t('k=\\pm\\sqrt{c}') + '.', why: 'Expand ' + t('(x+n)^{2}=x^{2}+2nx+n^{2}') + ': the middle coefficient is ' + t('2n') + ', not ' + t('n') + '.' },
              { html: t('k') + ' must be even; ' + t('c') + ' can be anything.', why: 'Try ' + t('x^{2}+6x+5') + ': ' + t('k') + ' is even, but ' + t('(x+1)(x+5)') + ' is not a square.' },
              { html: t('c=k^{2}') + '.', why: 'Test it: ' + t('(x+3)^{2}=x^{2}+6x+9') + ', and ' + t('9\\neq 6^{2}') + '.' }],
              t('(x\\pm n)^{2}=x^{2}\\pm 2nx+n^{2}') + '. So ' + t('c=n^{2}') + ' must be a perfect square, and ' + t('k=\\pm 2n=\\pm 2\\sqrt{c}') + '.',
              ['Expand ' + t('(x+n)^{2}') + ' and match it to ' + t('x^{2}+kx+c') + '.'], 'perfect square rule');
          } },
          { id: 'e17c', sub: 'c', level: 'EMG', make: function (r, sh) {
            var c = r.chance(0.5) ? sh.n * sh.n - 1 : sh.n * sh.n + sh.n;
            return B.mc(r, 'Is there any integer ' + t('k') + ' making ' + t('x^{2}+kx+' + c) + ' a perfect-square trinomial?', [
              { html: '<b>No</b>: ' + t(c) + ' is not a perfect square (no integer times itself gives ' + t(c) + '), so ' + t('k=\\pm2\\sqrt{' + c + '}') + ' is not an integer.', right: true },
              { html: '<b>Yes</b>: ' + t('k=' + (c + 1)) + ', because ' + t('x^{2}+' + (c + 1) + 'x+' + c + '=(x+1)(x+' + c + ')') + '.', why: 'That factors, but ' + t('(x+1)(x+' + c + ')') + ' is not a <b>square</b> — the two brackets are different.' },
              { html: '<b>Yes</b>: ' + t('k=' + 2 * c) + '.', why: 'A square ' + t('(x+n)^{2}') + ' needs ' + t('n^{2}=' + c) + '. Is ' + t(c) + ' a perfect square?' },
              { html: 'It depends on the value of ' + t('x') + '.', why: 'Being a perfect-square trinomial is about the expression, not a value of ' + t('x') + '. Use the rule from (b).' }],
              t((sh.n - 1) + '^{2}=' + (sh.n - 1) * (sh.n - 1)) + ', ' + t(sh.n + '^{2}=' + sh.n * sh.n) + ', ' + t((sh.n + 1) + '^{2}=' + (sh.n + 1) * (sh.n + 1)) + ': ' + t(c) + ' is not a perfect square, so ' + t('\\sqrt{' + c + '}') + ' is not an integer and no integer ' + t('k') + ' works.',
              ['Use the rule from (b): is ' + t(c) + ' a perfect square?'], 'non-square c');
          } }] },
      { num: '18', stem: function (sh) { return 'Look at this family: ' + [2, 5, 8].map(function (n) { var s = spec({ p: n, q: n + 1 }); return t(s.key + '=' + tx(s.full)); }).join(', ') + '.'; },
        shared: function (r) { return { n: r.int(9, 15) }; },
        parts: [
          { id: 'e18a', sub: 'a', level: 'PRG', make: function (r) {
            return B.mc(r, 'In each one the two integers are consecutive. How are ' + t('b') + ' and ' + t('c') + ' built from the smaller integer ' + t('n') + '?', [
              { html: t('b=2n+1') + ' (the sum ' + t('n+(n+1)') + ') and ' + t('c=n(n+1)') + ' (the product).', right: true },
              { html: t('b=2n') + ' and ' + t('c=n^{2}') + '.', why: 'Test it on ' + t('n=5') + ': ' + t('2n=10') + ', but ' + t('b=11') + '.' },
              { html: t('b=n+1') + ' and ' + t('c=n^{2}+1') + '.', why: 'Test it on ' + t('n=5') + ': ' + t('n+1=6') + ', but ' + t('b=11') + '.' },
              { html: t('b=2n+1') + ' and ' + t('c=n^{2}+1') + '.', why: 'Test ' + t('c') + ' on ' + t('n=5') + ': ' + t('n^{2}+1=26') + ', but ' + t('c=30') + '.' }],
              'The pair is ' + t('n') + ' and ' + t('n+1') + '. Sum: ' + t('b=2n+1') + '. Product: ' + t('c=n(n+1)') + '. Check ' + t('n=5') + ': ' + t('b=11') + ', ' + t('c=30') + ' ✓',
              ['Test each rule on ' + t('(x+5)(x+6)=x^{2}+11x+30') + '.'], 'consecutive rule');
          } },
          { id: 'e18b', sub: 'b', level: 'EMG', make: function (r, sh) {
            var s = spec({ p: sh.n, q: sh.n + 1 });
            return facPart(s, { prompt: 'Use the pattern to factor ' + t(tx(s.full)) + ' without hunting through factor pairs.', check: true,
              sol: t('2n+1=' + s.b) + ', so ' + t('n=' + sh.n) + '; the pair is ' + t(sh.n) + ' and ' + t(sh.n + 1) + '. Check: ' + t(sh.n + '\\times ' + (sh.n + 1) + '=' + s.c) + ' ✓<br>' + t(tx(s.full) + '=' + s.key) });
          } },
          { id: 'e18c', sub: 'c', level: 'ADV', make: function (r) {
            var bT = P.parse('2n+1'), cT = P.parse('n^2+n');
            return B.fields('Write the general identity ' + t('(x+n)(x+n+1)=x^{2}+bx+c') + ': express ' + t('b') + ' and ' + t('c') + ' in terms of ' + t('n') + '.', [polyBox('b =', ['n']), polyBox('c =', ['n'])],
              [K.poly(bT, { wrong: [{ is: P.parse('2n'), code: 'value', hint: 'Add the two numbers: ' + t('n+(n+1)') + '.' }, { is: P.parse('n+1'), code: 'value', hint: t('b') + ' is the sum of <b>both</b> numbers, ' + t('n') + ' and ' + t('n+1') + '.' }] }),
                K.poly(cT, { expanded: false, wrong: [{ is: P.parse('n^2'), code: 'value', hint: 'Multiply the two numbers: ' + t('n(n+1)') + '.' }, { is: P.parse('n^2+1'), code: 'value', hint: t('n(n+1)') + ' is not ' + t('n^{2}+1') + ': distribute the ' + t('n') + '.' }] })],
              ['2n+1', 'n^{2}+n'], t('b=2n+1') + ', ' + t('c=n^{2}+n'),
              t('(x+n)(x+n+1)=x^{2}+(n+1)x+nx+n(n+1)=x^{2}+(2n+1)x+(n^{2}+n)') + '. So ' + t('b=2n+1') + ' and ' + t('c=n^{2}+n') + '.',
              ['Expand ' + t('(x+n)(x+n+1)') + ' and collect the ' + t('x') + ' terms.'], 'consecutive identity');
          } }] },
      { num: '19', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: 'e19', level: 'EMG', make: function (r) {
          var o = pickWhere(function () { var u = r.pick([6, 7, 8, 10, 11, 12]), v = r.int(2, u - 2); return { u: u, v: v, w: r.int(2, 9) }; }, function (o) { return !isSq(o.u) && !isSq(o.v) && o.w !== o.u && o.w !== o.v; });
          var s = spec({ e: 2, p: -o.u, q: o.v });
          return B.mc(r, 'Which of the following is a factor of ' + t(tx(s.full)) + '?', [
            { html: t('x^{2}+' + o.v), right: true }, { html: t('x^{2}-' + o.v), why: 'Check the signs: the two numbers multiply to ' + t(s.c) + ' and add to ' + t(s.b) + '.' },
            { html: t('x^{2}+' + o.u), why: 'Check the signs: the number further from 0 must have the sign of the middle coefficient, ' + t(s.b) + '.' }, { html: t('x^{2}-' + o.w), why: 'Treat it as a trinomial in ' + t('x^{2}') + ': two numbers with product ' + t(s.c) + ' and sum ' + t(s.b) + '.' }],
            'In terms of ' + t('x^{2}') + ': ' + t(sg(-o.u)) + ' and ' + t(sg(o.v)) + ' (product ' + t(s.c) + ', sum ' + t(s.b) + '). ' + t(tx(s.full) + '=' + s.key) + '. Neither bracket factors further, so the listed factor is ' + t('x^{2}+' + o.v) + '.',
            ['Let ' + t('u=x^{2}') + ': factor ' + t(triTex('u', s.b, s.c)) + '.'], 'MC factor of x^4 trinomial');
        } }] }
    ]
  });

  /* ---------------- helpers used above (hoisted) ---------------- */
  function dsqPart(h, k) { // (x² + h·|h|)(x² + k·|k|): a negative argument means x² − n², which splits again
    var X = V('x'), a = h < 0 ? -h * h : h * h, b = k < 0 ? -k * k : k * k, s = spec({ e: 2, p: a, q: b }), list = [];
    [h, k].forEach(function (z) { if (z < 0) { list.push(bin(X, z)); list.push(bin(X, -z)); } else list.push(P.add(V('x', 2), P.num(z * z))); });
    s.list = list; s.key = FX.tex(list);
    var wr = [];
    [h, k].forEach(function (z, i) {
      if (z > 0) { var other = [h, k][1 - i], rest = other < 0 ? [bin(X, other), bin(X, -other)] : [P.add(V('x', 2), P.num(other * other))];
        wr.push({ is: [bin(X, z), bin(X, -z)].concat(rest), code: 'sum-squares', hint: t('x^{2}+' + z * z) + ' is a <b>sum</b> of squares — it doesn’t factor. ' + t('(x-' + z + ')(x+' + z + ')=x^{2}-' + z * z) + '.' }); }
    });
    var steps = [h, k].map(function (z) { return z < 0 ? t('x^{2}-' + z * z + '=(x-' + (-z) + ')(x+' + (-z) + ')') : t('x^{2}+' + z * z) + ' does not factor (sum of squares)'; }).join('; ');
    var sol = 'In terms of ' + t('x^{2}') + ': ' + t(sg(a)) + ' and ' + t(sg(b)) + ' (product ' + t(s.c) + ', sum ' + t(s.b) + '), so ' + t(tx(s.full) + '=' + FX.tex([s.A, s.B])) + '.<br>Then ' + steps + '.<br>' + t(tx(s.full) + '=' + s.key);
    var p = facPart(s, { wrong: wr, sol: sol, hints: ['First treat it as a trinomial in ' + t('x^{2}') + ': two numbers with product ' + t(s.c) + ' and sum ' + t(s.b) + '.', 'Then check each bracket: ' + t('x^{2}-n^{2}') + ' factors again; ' + t('x^{2}+n^{2}') + ' does not.'] });
    p.good = [FX.tex(list.slice().reverse())]; p.bad = [FX.tex([s.A, s.B])].concat(wr.map(function (w) { return FX.tex(w.is); }));
    return p;
  }
  function backPart(triT, letter, given, other, kind) {
    // (x + given)(x + other): kind 'c' → answer given·other; 'b' → given + other
    var c = given * other, b = given + other, ans = kind === 'c' ? c : b, gT = 'x' + sg(given);
    var fullT = triTex('x', b, c);
    return B.number(t(triT) + ' has ' + t('(' + gT + ')') + ' as a factor. Find ' + t(letter) + '.', ans, function (v) {
      if (v === -ans && ans !== 0) return { code: 'sign', hint: 'Check the sign. Write ' + t('(' + gT + ')(x+q)') + ' and find ' + t('q') + ' first, with its sign.' };
      if (v === other || v === -other) return { code: 'other-number', hint: t(Math.abs(other)) + ' is the size of the number in the <b>other</b> bracket. ' + (kind === 'c' ? t(letter) + ' is the product of the two numbers.' : t(letter) + ' is the sum of the two numbers.') };
      if (kind === 'c' && v === given * b) return { code: 'value', hint: t(letter) + ' is not ' + t(par(given) + '\\times ' + par(b)) + '. First find the other number ' + t('q') + ': ' + t(par(given) + '+q=' + b) + '.' };
      if (kind === 'b' && v === given - other) return { code: 'sign', hint: 'Check the sign of the other number: ' + t(par(given) + '\\times q=' + c) + ', so ' + t('q=' + other) + '.' };
      return null;
    }, (kind === 'c' ? t('(' + gT + ')(x+q)') + ': sum ' + t(par(given) + '+q=' + b) + ', so ' + t('q=' + other) + '.<br>Product ' + t(letter + '=' + par(given) + '\\times ' + par(other)) + ', so ' + t(letter + '=' + c) + '.'
      : t('(' + gT + ')(x+q)') + ': product ' + t(par(given) + 'q=' + c) + ', so ' + t('q=' + other) + '.<br>Sum ' + t(letter + '=' + par(given) + '+' + par(other)) + ', so ' + t(letter + '=' + b) + '.') + '<br>Check: ' + t('(' + gT + ')(x' + sg(other) + ')=' + fullT) + ' ✓',
    ['Write the other factor as ' + t('(x+q)') + '. Use the coefficient you know to find ' + t('q') + ' (with its sign).', kind === 'c' ? 'Then ' + t(letter) + ' is the product of the two numbers.' : 'Then ' + t(letter) + ' is the sum of the two numbers.'], 'missing ' + letter + ' from a factor');
  }
})(window);
