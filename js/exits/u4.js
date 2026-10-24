/* Math 10C · Unit 4 (Factoring Polynomial Expressions, AN5) — exit slips for Lessons 1–8 (u4l1x … u4l8x), written in test mode.
 * One HW.defineExit per lesson: 3 questions (3–5 parts), about 5–8 minutes at the end of class, checking that day's main
 * skills with content taught up to that lesson. Each slip has a Beginning question (like the lesson's BEG assignment items),
 * a Progressing question (its PRG items) and a Mastery question (a step past the assignment: working backwards, a whole
 * family of answers, an extra factoring step), so "highest level right" separates students. The questions are new (wording,
 * structure details and contexts differ from the assignment and the unit test) but test the same skills; every part is
 * generated from the seed, with a key, a worked solution, hints and `bad` answers with u4x- codes. Factored answers are
 * checked with K.factored (js/factor.js): equal but not factored completely is a 'form' nudge. Every trinomial is built from
 * its factors, so the key is always the factorization the question was made from.
 * Lesson 8 (the unit review) is a short mix across the unit. No calculator (as on the Unit 4 test). */
(function (root) {
  'use strict';
  var HW = root.HW, K = HW.kit, KP = K.P, P = HW.poly, FX = HW.factor, ex = HW.ex, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form;

  HW.addCodes({
    'u4x-gcf-high': 'GCF: used a higher power of a variable', 'u4x-gcf-nocoef': 'GCF: left out the number', 'u4x-gcf-small': 'A common factor, but not the greatest',
    'u4x-gcf-lcm': 'Gave a common multiple instead of a common factor', 'u4x-exp-kept': 'Divided the coefficients but not the variables', 'u4x-bracket-sign': 'Sign slip inside the bracket',
    'u4x-neg-gcf': 'Took out a positive factor when a negative one was asked', 'u4x-neg-signs': 'Negative common factor: signs in the bracket not all changed', 'u4x-drop-one': 'Dropped the 1 left by a term equal to the GCF',
    'u4x-gcf-exp': 'Used one term’s exponent instead of the GCF’s', 'u4x-bcf-sign': 'Wrong sign in the leftover bracket', 'u4x-lost-term': 'Lost a term of the leftover bracket', 'u4x-bin-twice': 'Took the common bracket out twice',
    'u4x-group-sign': 'Wrong sign on a group’s common factor', 'u4x-pair-sum': 'Pair with the right product but the wrong sum', 'u4x-pair-product': 'Pair with the right sum but the wrong product',
    'u4x-pair-signs': 'Pair with the wrong signs', 'u4x-swap-bc': 'Numbers multiply to b and add to c (roles swapped)', 'u4x-gcf-dropped': 'Dropped the common factor', 'u4x-gcf-part': 'Took out only part of the GCF',
    'u4x-other-factor': 'Gave a factor of only one of the trinomials', 'u4x-k-sign': 'Value with the wrong sign', 'u4x-dos-square': 'Wrote a difference of squares as a perfect square',
    'u4x-no-root': 'Used a square instead of its square root in a bracket', 'u4x-gcf-one': 'Common factor put into only one bracket', 'u4x-minus-bracket': 'Minus sign not applied to every term of the subtracted square',
    'u4x-ac-sum': 'Added a and c instead of multiplying', 'u4x-ac-c': 'Used c instead of ac', 'u4x-pair-wrong': 'Pair does not multiply to ac and add to b',
    'u4x-pair-as-factors': 'Wrote the decomposition pair into the brackets (as if a = 1)', 'u4x-const-swap': 'Constant terms in the wrong brackets', 'u4x-sign-swap': 'Signs of both constants switched',
    'u4x-pairs-c': 'Used the factor pairs of c instead of ac', 'u4x-missing-b': 'Missed some values of b', 'u4x-not-b': 'Listed a value of b that does not work',
    'u4x-mid-half': 'Middle term: used ab instead of 2ab', 'u4x-mid-square': 'Middle term: used a square instead of 2ab', 'u4x-no-var': 'Left the variable off the term',
    'u4x-pst-dos': 'Wrote a perfect square trinomial as a difference of squares', 'u4x-pst-sign': 'Perfect square with the wrong sign in the bracket', 'u4x-block-sign': 'Factored the trinomial in x² with the wrong signs',
    'u4x-sum-split': 'Factored a sum of squares', 'u4x-neg-b': 'Listed negative values of b as well', 'u4x-perim-sum': 'Perimeter: used L + W instead of 2(L + W)', 'u4x-perim-gave-dim': 'Gave a side length instead of x'
  });
  HW.addPartial({
    'u4x-gcf-high': 'b', 'u4x-gcf-nocoef': 's', 'u4x-gcf-small': 'b', 'u4x-gcf-lcm': 'n', 'u4x-exp-kept': 'b', 'u4x-bracket-sign': 's',
    'u4x-neg-signs': 'b', 'u4x-drop-one': 's', 'u4x-gcf-exp': 'n', 'u4x-bcf-sign': 'b', 'u4x-lost-term': 'b', 'u4x-bin-twice': 'b', 'u4x-group-sign': 'b',
    'u4x-pair-sum': 'n', 'u4x-pair-product': 'n', 'u4x-pair-signs': 's', 'u4x-swap-bc': 'n', 'u4x-gcf-dropped': 's', 'u4x-gcf-part': 'b', 'u4x-other-factor': 'n', 'u4x-k-sign': 's',
    'u4x-dos-square': 'n', 'u4x-no-root': 'b', 'u4x-gcf-one': 'b', 'u4x-minus-bracket': 'b', 'u4x-ac-sum': 'n', 'u4x-ac-c': 'n', 'u4x-pair-wrong': 'n', 'u4x-pair-as-factors': 'n',
    'u4x-const-swap': 'b', 'u4x-sign-swap': 'b', 'u4x-pairs-c': 'n', 'u4x-missing-b': 'b', 'u4x-not-b': 'n', 'u4x-mid-half': 'b', 'u4x-mid-square': 'n', 'u4x-no-var': 's',
    'u4x-pst-dos': 'n', 'u4x-pst-sign': 'b', 'u4x-block-sign': 'b', 'u4x-sum-split': 'n', 'u4x-perim-sum': 'b', 'u4x-perim-gave-dim': 'n'
  });

  /* ---------------- small tools ---------------- */
  function pickWhere(gen, test) { for (var i = 0; i < 3000; i++) { var o = gen(); if (o && test(o)) return o; } throw new Error('u4 exits: no instance found'); }
  function nz(r, lo, hi) { return (r.chance(0.5) ? -1 : 1) * r.int(lo, hi); }
  function sg(n) { return n < 0 ? '-' + (-n) : '+' + n; }
  function par(n) { return n < 0 ? '(' + n + ')' : String(n); }
  function V(v, e) { var o = {}; o[v] = e || 1; return P.mono(1, o); }
  function Mo(c, vars) { return P.mono(c, vars || {}); }
  function T(c, v, e) { if (!e) return P.num(c); var o = {}; o[v] = e; return P.mono(c, o); }
  function bin(u, n, w) { return P.add(u, P.scale(w || P.num(1), n)); }
  function lin(a, b, v, w) { return P.add(T(a, v, 1), w ? P.scale(V(w), b) : P.num(b)); }
  function tx(p) { return P.tex(p); }
  function br(p) { return '(' + tx(p) + ')'; }
  var gcd = ex.gcd;
  function posPairs(n) { n = Math.abs(n); var o = []; for (var u = 1; u * u <= n; u++) if (n % u === 0) o.push([u, n / u]); return o; }
  function pairsTex(n) { return posPairs(n).map(function (pq) { return pq[0] + '\\times ' + pq[1]; }).join(',\\ \\ '); }
  function prodOf(list) { return FX.product(list); }
  function varsOf(p) { var vs = P.vars(p); return vs.length ? vs : ['x']; }
  function numChk(ans, alts) { return K.number(ans, function (v) { for (var i = 0; i < alts.length; i++) if (alts[i] && v === alts[i].v && v !== ans) return { code: alts[i].code, hint: alts[i].hint }; return null; }); }
  function badRows(key, i, vals) { var out = []; vals.forEach(function (v) { if (v == null || String(v) === String(key[i])) return; var row = key.slice(); row[i] = String(v); out.push(row); }); return out; }
  function nbox(label, extra) { return Object.assign({ label: label, name: label.replace(/\\\(|\\\)|<[^>]+>/g, '').replace(/:$/, '') }, extra || {}); }
  function fbox(label, vars, extra) { return Object.assign({ label: label, name: label.replace(/\\\(|\\\)|<[^>]+>/g, '').replace(/:$/, ''), mode: 'math', keys: 'poly', vars: vars, wide: true, placeholder: 'e.g. 3x(x - 4)(x + 2)' }, extra || {}); }

  /* wrongs: [{ is: factor list | polynomial, code, hint }] — those equal to the target (or to each other) are dropped; bad = their LaTeX */
  function wfilter(target, ws) {
    var seen = [prodOf(target)], W = [], bad = [];
    (ws || []).forEach(function (w) {
      if (!w || !w.is) return;
      var p = Array.isArray(w.is) ? prodOf(w.is) : P.lift(w.is);
      if (seen.some(function (s) { return P.eq(s, p); })) return;
      seen.push(p); W.push({ is: w.is, code: w.code, hint: w.hint }); bad.push(Array.isArray(w.is) ? FX.tex(w.is) : tx(p));
    });
    return { W: W, bad: bad };
  }
  /* a "factor (completely)" part; target = list of factors */
  function fpart(prompt, target, ws, sol, hints, text, opt) {
    opt = opt || {};
    var f = wfilter(target, ws), keyTex = opt.keyTex || FX.tex(target);
    var part = KP.factored(prompt, target, Object.assign({}, opt, { wrong: f.W, keyTex: keyTex, vars: opt.vars || varsOf(prodOf(target)) }), sol, hints, text);
    part.check = noProduct(part.check);
    part.bad = f.bad.concat(opt.bad || []);
    return part;
  }
  /* an answer that isn't a product at all (e.g. the expression typed back) shows no factoring: wrong, not the 2/3 "form" nudge */
  function noProduct(chk) { return function (resp) { var res = chk(resp); return res && res.v === 'form' && res.code === 'not-factored' ? wrong('not-factored', res.hint) : res; }; }
  function fchk(target, ws, opt) { var f = wfilter(target, ws); return { check: noProduct(K.factored(target, Object.assign({}, opt || {}, { wrong: f.W }))), bad: f.bad, key: FX.tex(target) }; }
  /* the monomial factors of a typed answer multiply to a negative number? (for "take out a negative common factor") */
  function monoSign(resp) {
    var a = K.read(resp); if (a.res) return 0;
    var sp = FX.split(a.ast); if (!sp.ok) return 0;
    var s = 1; sp.factors.forEach(function (f) { if (P.count(f.p) === 1) { var c = P.terms(f.p)[0].c; if (c[0] < 0 && f.k % 2) s = -s; } });
    return s;
  }
  /* a list of factors with every bracket's common factor taken out in front: [k, prim1, prim2, …] */
  function cleanList(list) {
    var k = [1, 1], out = [];
    list.forEach(function (f) {
      var p = f && f.p ? P.lift(f.p) : P.lift(f), m = f && f.k ? f.k : 1;
      if (P.count(p) <= 1) { var tm = P.terms(p)[0]; for (var i = 0; i < m; i++) k = ex.norm(k[0] * tm.c[0], k[1] * tm.c[1]); if (Object.keys(tm.v).length) out.push(m > 1 ? { p: P.mono(1, tm.v), k: m } : P.mono(1, tm.v)); return; }
      var cn = FX.content(p); for (var j = 0; j < m; j++) k = ex.norm(k[0] * cn.c[0], k[1] * cn.c[1]);
      if (Object.keys(cn.v).length) out.push(m > 1 ? { p: P.mono(1, cn.v), k: m } : P.mono(1, cn.v));
      out.push(m > 1 ? { p: cn.prim, k: m } : cn.prim);
    });
    if (k[0] !== 1 || k[1] !== 1) out.unshift(P.num(k));
    return out;
  }

  /* ---------------- monic trinomials, built from their factors (as in Lesson 3) ----------------
   * o = { v: 'x', y: second letter, G: common factor (polynomial), p, q } → G(u + p·w)(u + q·w) */
  function spec(o) {
    var u = V(o.v || 'x'), w = o.y ? V(o.y) : null, G = o.G || P.num(1);
    var A = bin(u, o.p, w), Bq = bin(u, o.q, w), inner = P.mul(A, Bq), full = P.mul(G, inner), g1 = P.eq(G, P.num(1));
    var list = o.p === o.q ? [{ p: A, k: 2 }] : [A, Bq];
    if (!g1) list = [G].concat(list);
    var gt = tx(G);
    return { u: u, w: w, G: G, g1: g1, p: o.p, q: o.q, b: o.p + o.q, c: o.p * o.q, A: A, B: Bq, inner: inner, full: full, list: list, key: FX.tex(list), gtex: gt, gpre: gt === '-1' ? '-' : gt };
  }
  function signHint(b, c) {
    if (c > 0) return b > 0 ? 'The product is positive and the sum is positive, so <b>both</b> integers are positive.' : 'The product is positive but the sum is negative, so <b>both</b> integers are negative.';
    return 'The product is negative, so one integer is positive and one is negative; the one further from ' + t('0') + ' has the same sign as the sum, ' + t(b) + '.';
  }
  function coefRel(S, m) { var tm = P.terms(m)[0], c = P.coef(S, tm.v); return (c[0] * tm.c[1]) / (c[1] * tm.c[0]); }
  function pairDiag(s) {
    var m2 = P.mul(s.G, P.pow(s.u, 2)), m1 = P.mul(s.G, s.u, s.w || 1), m0 = P.mul(s.G, s.w ? P.pow(s.w, 2) : 1);
    var b = s.b, c = s.c, inside = s.g1 ? '' : ' (inside the bracket)';
    return function (S) {
      var L = coefRel(S, m2), M = coefRel(S, m1), C = coefRel(S, m0);
      if (L !== 1 || M % 1 || C % 1) return null;
      if (!P.eq(S, P.add(m2, P.scale(m1, M), P.scale(m0, C)))) return null;
      var pre = 'Your factors multiply to ' + t(tx(S)) + ', not ' + t(tx(s.full)) + '. ';
      if (C === c && M === -b) return { code: 'u4x-pair-signs', hint: pre + 'Your numbers multiply to ' + t(c) + ' but add to ' + t(-b) + ', not ' + t(b) + ': the signs are backwards. ' + signHint(b, c) };
      if (M === c && C === b && b !== c) return { code: 'u4x-swap-bc', hint: pre + 'Your numbers multiply to ' + t(b) + ' and add to ' + t(c) + ' — the wrong way round. They must <b>multiply to the constant</b> and <b>add to the middle coefficient</b>' + inside + '.' };
      if (C === c) return { code: 'u4x-pair-sum', hint: pre + 'Your numbers multiply to ' + t(c) + ' ✓ but add to ' + t(M) + ', not ' + t(b) + '. Try another factor pair of ' + t(Math.abs(c)) + '.' };
      if (M === b && C === -c) return { code: 'u4x-pair-signs', hint: pre + 'Your numbers add to ' + t(b) + ' ✓ but multiply to ' + t(-c) + ', not ' + t(c) + '. ' + (c > 0 ? 'A positive product needs two numbers with the <b>same</b> sign.' : 'A negative product needs one positive and one negative number.') };
      if (M === b) return { code: 'u4x-pair-product', hint: pre + 'Your numbers add to ' + t(b) + ' ✓ but multiply to ' + t(C) + ', not ' + t(c) + '. The last terms of the brackets must multiply to the constant term' + inside + '.' };
      if (C === -c) return { code: 'u4x-pair-signs', hint: pre + 'Your numbers multiply to ' + t(C) + ', not ' + t(c) + '. ' + signHint(b, c) };
      return null;
    };
  }
  function stdWrongs(s) {
    var out = [];
    if (!s.g1) out.push({ is: s.inner, code: 'u4x-gcf-dropped', hint: 'Your brackets are right, but the common factor ' + t(s.gtex) + ' is missing. Multiply your answer out: you get ' + t(tx(s.inner)) + ', not ' + t(tx(s.full)) + '.' });
    var flip = P.mul(s.G, bin(s.u, -s.p, s.w), bin(s.u, -s.q, s.w));
    out.push({ is: [s.G, bin(s.u, -s.p, s.w), bin(s.u, -s.q, s.w)], code: 'u4x-pair-signs', hint: 'Every sign in your brackets is backwards. ' + signHint(s.b, s.c) });
    void flip;
    return out;
  }
  function solFac(s) {
    var out = [], ride = s.w ? ' The ' + t(tx(s.w)) + ' goes with the second term of each bracket.' : '';
    if (!s.g1) out.push('Take out the common factor ' + t(s.gtex) + ' first: ' + t(tx(s.full) + '=' + s.gpre + '(' + tx(s.inner) + ')') + '.');
    out.push('Two integers with product ' + t(s.c) + ' and sum ' + t(s.b) + ': ' + t(sg(s.p)) + ' and ' + t(sg(s.q)) + '.' + ride);
    out.push(t(tx(s.full) + '=' + s.key));
    return out.join('<br>');
  }
  function hintsFac(s) {
    var pair = 'Look for two integers with product ' + t(s.c) + ' and sum ' + t(s.b) + '.';
    if (!s.g1) return ['Every term has a common factor of ' + t(s.gtex) + '. Take it out first, then factor the trinomial left in the bracket.', pair + ' ' + signHint(s.b, s.c)];
    return [pair, signHint(s.b, s.c)];
  }
  function monicPart(prompt, s, extra, text) {
    var bad = [], c = s.c, b = s.b, pre = s.g1 ? [] : [s.G];
    var other = posPairs(c).map(function (pq) { return c > 0 ? (b > 0 ? pq : [-pq[0], -pq[1]]) : (Math.abs(b) === b ? [pq[1], -pq[0]] : [-pq[1], pq[0]]); }).filter(function (pq) { return pq[0] + pq[1] !== b; })[0];
    if (other) bad.push(FX.tex(pre.concat([bin(s.u, other[0], s.w), bin(s.u, other[1], s.w)]))); // right product, wrong sum
    if (b - 1 !== 0 && (b - 1) !== s.p && (b - 1) !== s.q) bad.push(FX.tex(pre.concat([bin(s.u, b - 1, s.w), bin(s.u, 1, s.w)]))); // right sum, wrong product
    return fpart(prompt, s.list, stdWrongs(s).concat(extra || []), solFac(s), hintsFac(s), text || 'factor ' + tx(s.full), { diag: pairDiag(s), keyTex: s.key, bad: bad });
  }
  function monicPair(r, sameSign, lo, hi) {
    return pickWhere(function () { var p = nz(r, lo || 1, hi || 9), q = nz(r, lo || 1, hi || 9); return { p: p, q: q }; },
      function (o) { return o.p !== o.q && o.p + o.q !== 0 && (sameSign ? o.p * o.q > 0 : o.p * o.q < 0) && Math.abs(o.p * o.q) <= 90 && Math.abs(o.p) !== Math.abs(o.q); });
  }

  /* ---------------- ax² + bx + c from (px + q)(rx + s) ---------------- */
  function axSpec(p, q, r, s, v, w) {
    v = v || 'x';
    var A = lin(p, q, v, w), B = lin(r, s, v, w), full = P.mul(A, B), a = p * r, c = q * s, b = p * s + q * r;
    return { p: p, q: q, r: r, s: s, v: v, w: w, A: A, B: B, full: full, a: a, b: b, c: c, ac: a * c, m: p * s, n: q * r, list: [A, B] };
  }
  function axSol(o, pre) {
    var v = o.v, W = o.w ? V(o.w) : P.num(1), lo = Math.min(o.m, o.n), hi = Math.max(o.m, o.n);
    var exp4 = [T(o.a, v, 2), P.mul(T(o.m, v, 1), W), P.mul(T(o.n, v, 1), W), P.mul(P.num(o.c), W, W)];
    return (pre || '') + t('ac=' + par(o.a) + '\\times ' + par(o.c) + '=' + o.ac) + '. Two integers with product ' + t(o.ac) + ' and sum ' + t(o.b) + ': ' + t(lo) + ' and ' + t(hi) + '.' +
      '<br>Split the middle term and group in pairs: ' + t(P.seq(exp4)) + '<br>' + t('=' + grp(o)) + '<br>' + t('=' + br(o.B) + br(o.A));
  }
  function grp(o) { // p v (r v + s w) + q (r v + s w)
    var first = (o.p === 1 ? '' : o.p) + o.v, second = o.w ? (Math.abs(o.q) === 1 ? (o.q < 0 ? '-' : '+') : sg(o.q)) + (o.w) : sg(o.q);
    return first + '(' + tx(o.B) + ')' + second + '(' + tx(o.B) + ')';
  }
  function axWrongs(o) {
    var out = [];
    out.push({ is: [lin(o.p, -o.q, o.v, o.w), lin(o.r, -o.s, o.v, o.w)], code: 'u4x-sign-swap', hint: 'Your brackets give a middle term with the wrong sign. Expand your answer to check: the outside and inside products must add to ' + t(tx(o.w ? P.mul(T(o.b, o.v, 1), V(o.w)) : T(o.b, o.v, 1))) + '.' });
    out.push({ is: [lin(o.p, o.s, o.v, o.w), lin(o.r, o.q, o.v, o.w)], code: 'u4x-const-swap', hint: 'The first and last terms are right, but the constants are in the wrong brackets: the outside and inside products don’t add to the middle term.' });
    out.push({ is: [lin(1, o.m, o.v, o.w), lin(1, o.n, o.v, o.w)], code: 'u4x-pair-as-factors', hint: 'The decomposition numbers don’t go straight into the brackets when ' + t('a\\ne 1') + '. Use them to split the middle term, then group in pairs.' });
    return out;
  }

  /* ======================= Lesson 1: the GCF ======================= */
  function l1q1a(r) {
    var two = r.chance(0.6), s = pickWhere(function () { return { g: r.int(2, 9), m1: r.int(1, 7), m2: r.int(2, 7), e1: r.int(1, 6), e2: r.int(1, 6), f1: r.int(1, 4), f2: r.int(1, 4), vs: r.pick([['x', 'y'], ['a', 'b'], ['m', 'n'], ['p', 'q']]) }; },
      function (s) { return gcd(s.m1, s.m2) === 1 && s.m1 !== s.m2 && s.e1 !== s.e2 && (!two || s.f1 !== s.f2) && s.g * Math.max(s.m1, s.m2) <= 60; });
    var x = s.vs[0], y = s.vs[1], o1 = {}, o2 = {}, og = {}, oh = {}, ol = {};
    o1[x] = s.e1; o2[x] = s.e2; og[x] = Math.min(s.e1, s.e2); oh[x] = Math.max(s.e1, s.e2); ol[x] = oh[x];
    if (two) { o1[y] = s.f1; o2[y] = s.f2; og[y] = Math.min(s.f1, s.f2); oh[y] = Math.max(s.f1, s.f2); ol[y] = oh[y]; }
    var A = Mo(s.g * s.m1, o1), B = Mo(s.g * s.m2, o2), G = Mo(s.g, og), sp = HW.nt.smallestPrimeFactor(s.g);
    var ws = [{ is: Mo(s.g, oh), code: 'u4x-gcf-high', hint: 'A common factor must divide <b>every</b> term, so use the <b>lowest</b> power of each letter.' },
      { is: Mo(1, og), code: 'u4x-gcf-nocoef', hint: 'The coefficients ' + t(s.g * s.m1) + ' and ' + t(s.g * s.m2) + ' have a common factor too: include the greatest one.' },
      { is: Mo(s.g * s.m1 * s.m2, ol), code: 'u4x-gcf-lcm', hint: 'That is a common <b>multiple</b>. The GCF divides <b>into</b> both monomials, so it can’t be bigger than either.' }];
    if (sp < s.g) ws.push({ is: Mo(s.g / sp, og), code: 'u4x-gcf-small', hint: 'That divides both, but it isn’t the <b>greatest</b>: the coefficients share a bigger factor.' });
    var seen = [G], W = [];
    ws.forEach(function (w) { if (seen.some(function (q) { return P.eq(q, w.is); })) return; seen.push(w.is); W.push(w); });
    var part = KP.poly('Find the greatest common factor of ' + t(tx(A)) + ' and ' + t(tx(B)) + '.', G, { wrong: W },
      'Coefficients: the GCF of ' + t(s.g * s.m1) + ' and ' + t(s.g * s.m2) + ' is ' + t(s.g) + '.<br>Letters: take each letter that is in both, to its <b>lowest</b> power: ' + t(tx(Mo(1, og))) + '.<br>GCF ' + t('=' + tx(G)),
      ['Find the GCF of the coefficients first.', 'For each letter in both monomials, use the <b>lower</b> exponent.'], 'GCF of two monomials');
    part.bad = W.map(function (w) { return tx(w.is); });
    return part;
  }
  function l1q1b(r) {
    var v = r.pick(['x', 'y', 'a', 't', 'n']), s = pickWhere(function () { return { G: r.int(2, 6), e: r.int(1, 2), a: r.int(1, 5), b: nz(r, 1, 7), c: nz(r, 1, 9) }; },
      function (s) { var D = s.b * s.b - 4 * s.a * s.c, rt = Math.round(Math.sqrt(Math.abs(D))); return gcd(gcd(s.a, Math.abs(s.b)), Math.abs(s.c)) === 1 && Math.abs(s.b) !== Math.abs(s.c) && !(D >= 0 && rt * rt === D); }); // the bracket doesn't factor again (Lesson 1: the GCF is the whole job)
    var G = T(s.G, v, s.e), Br = P.add(T(s.a, v, 2), T(s.b, v, 1), P.num(s.c)), full = P.mul(G, Br);
    var keptExp = P.add(T(s.a, v, 2 + s.e), T(s.b, v, 1 + s.e), T(s.c, v, s.e));
    return fpart('Factor ' + t(tx(full)) + ' by removing the greatest common factor.', [G, Br],
      [{ is: [G, keptExp], code: 'u4x-exp-kept', hint: 'You divided the coefficients but not the powers of ' + t(v) + ': dividing ' + t(v + '^{' + (2 + s.e) + '}') + ' by ' + t(tx(V(v, s.e))) + ' leaves ' + t(tx(V(v, 2))) + '. Expand your answer to check.' },
        { is: [G, P.add(T(s.a, v, 2), T(-s.b, v, 1), P.num(s.c))], code: 'u4x-bracket-sign', hint: 'Each term in the bracket keeps its sign when you divide by a positive factor.' },
        { is: [G, P.add(T(s.a, v, 2), T(s.b, v, 1))], code: 'u4x-lost-term', hint: 'The bracket needs one term for <b>each</b> term of the polynomial: three terms in, three terms out.' }],
      'The coefficients ' + t(s.G * s.a + ',\\ ' + s.G * s.b + ',\\ ' + s.G * s.c) + ' have GCF ' + t(s.G) + ', and every term has at least ' + t(tx(V(v, s.e))) + '. GCF ' + t('=' + tx(G)) + '.<br>Divide each term by it: ' + t(tx(full) + '=' + tx(G) + '(' + tx(Br) + ')') + '.<br>Check: expanding gives back the original.',
      ['Find the GCF of the coefficients and the lowest power of ' + t(v) + ' in every term.', 'Divide <b>each</b> term by the GCF to get the bracket.'], 'remove the GCF of a trinomial');
  }
  function l1q2(r) {
    var vs = r.pick([['a', 'b'], ['m', 'n'], ['x', 'y'], ['p', 'q']]), u = vs[0], w = vs[1];
    var s = pickWhere(function () { return { g: r.int(2, 6), i: r.int(1, 3), j: r.int(1, 3), p: r.int(2, 6), q: nz(r, 2, 6) }; }, function (s) { return Math.abs(s.p) !== Math.abs(s.q); });
    var og = {}; og[u] = s.i; og[w] = s.j;
    var G = Mo(-s.g, og), Br = P.add(T(s.p, u, 1), T(s.q, w, 1), P.num(1)), full = P.mul(G, Br), terms = P.sorted(full).map(function (x) { return P.mono(x.c, x.v); });
    var shown = P.seq(terms);
    var base = fpart('Factor ' + t(shown) + ' by removing the greatest common factor. Take out a <b>negative</b> common factor.', [G, Br],
      [{ is: [G, P.add(T(s.p, u, 1), T(-s.q, w, 1), P.num(-1))], code: 'u4x-neg-signs', hint: 'Dividing by a <b>negative</b> factor changes the sign of <b>every</b> term — check the signs of the last two terms in your bracket.' },
        { is: [G, P.add(T(s.p, u, 1), T(s.q, w, 1))], code: 'u4x-drop-one', hint: 'One term equals the common factor itself: dividing it by the GCF leaves ' + t('1') + ', which must stay in the bracket.' },
        { is: [G, P.add(T(-s.p, u, 1), T(-s.q, w, 1), P.num(-1))], code: 'u4x-neg-signs', hint: 'You took out a negative factor, so the signs inside the bracket change: expand your answer to check.' }],
      'Every term has the factor ' + t(tx(Mo(s.g, og))) + '; take out ' + t(tx(G)) + ' (negative, as asked).<br>Divide each term by ' + t(tx(G)) + ' — the signs all change, and the term equal to ' + t(tx(G)) + ' leaves ' + t('1') + ':<br>' + t(shown + '=' + tx(G) + '(' + tx(Br) + ')'),
      ['The GCF is the greatest number and the lowest power of each letter in every term. Make it negative.', 'Dividing by a negative changes every sign; a term equal to the GCF leaves ' + t('1') + '.'], 'negative GCF, leftover 1');
    var chk = base.check;
    base.check = function (resp) { var res = chk(resp); if (res.v === 'correct' && monoSign(resp) > 0) return form('u4x-neg-gcf', 'Right — now take out the <b>negative</b> common factor, ' + t(tx(G)) + ', as the question asks.'); return res; };
    return base;
  }
  function l1q3Shared(r) {
    return pickWhere(function () {
      var G = r.int(2, 9), a = r.int(1, 6), b = r.int(2, 7), g1 = r.int(1, 4), g2 = r.int(1, 3);
      return { G: G, a: a, b: b, g1: g1, g2: g2, e1: g2 + r.int(1, 3), e2: g1 + r.int(1, 3), sign: r.chance(0.5) ? 1 : -1, vs: r.pick([['x', 'y'], ['a', 'b'], ['p', 'q'], ['c', 'd']]) };
    }, function (s) { var sq = function (n) { return Math.round(Math.sqrt(n)) * Math.round(Math.sqrt(n)) === n; }; return gcd(s.a, s.b) === 1 && s.a !== s.b && s.G * s.b <= 60 && !(s.sign < 0 && sq(s.a) && sq(s.b) && (s.e1 - s.g2) % 2 === 0 && (s.e2 - s.g1) % 2 === 0); }); // bracket never a difference of squares
  }
  function l1q3(r, s) {
    var x = s.vs[0], y = s.vs[1], A = s.G * s.a, B = s.G * s.b * s.sign, g1 = s.g1, g2 = s.g2, e1 = s.e1, e2 = s.e2;
    var o1 = {}; o1[x] = g1; o1[y] = e1; var o2 = {}; o2[x] = e2; o2[y] = g2; var og = {}; og[x] = g1; og[y] = g2;
    var t1 = Mo(A, o1), t2 = Mo(B, o2), Gm = Mo(s.G, og), Br = P.add(T(s.a, y, e1 - g2), T(s.b * s.sign, x, e2 - g1)), full = P.add(t1, t2);
    var term1 = A + x + '^{m}' + y + '^{' + e1 + '}', term2 = Math.abs(B) + x + '^{' + e2 + '}' + y + '^{n}', gtex = tx(Gm);
    var brTex = P.seq([T(s.a, y, e1 - g2), T(s.b * s.sign, x, e2 - g1)]), keyF = gtex + '(' + brTex + ')', shownSum = P.seq([t1, t2]);
    var fc = fchk([Gm, Br], [{ is: [Gm, P.add(T(s.a, y, e1 - g2), T(-s.b * s.sign, x, e2 - g1))], code: 'u4x-bracket-sign', hint: 'Divide each term by the GCF and keep its sign.' }]);
    var key = [String(g1), String(g2), keyF];
    var pt = KP.fields('The greatest common factor of ' + t(term1) + ' and ' + t(term2) + ' is ' + t(gtex) + ', where ' + t('m') + ' and ' + t('n') + ' are whole numbers. Find ' + t('m') + ' and ' + t('n') + '. Then factor ' + t(term1 + (s.sign < 0 ? '-' : '+') + term2) + ' completely for those values.',
      [nbox(t('m=')), nbox(t('n=')), fbox('Factored form:', [x, y])],
      [numChk(g1, [{ v: e2, code: 'u4x-gcf-exp', hint: 'The GCF has ' + t(x + (g1 > 1 ? '^{' + g1 + '}' : '')) + '. It takes the <b>lower</b> power of ' + t(x) + ' from the two terms, and the second term has ' + t(x + '^{' + e2 + '}') + ', so the first term must have the lower power.' }].concat(e2 + 1 <= 9 ? [{ v: e2 + 1, code: 'u4x-gcf-exp', hint: 'If ' + t('m') + ' were that big, the GCF would have ' + t(x + '^{' + e2 + '}') + '.' }] : [])),
        numChk(g2, [{ v: e1, code: 'u4x-gcf-exp', hint: 'The GCF has ' + t(y + (g2 > 1 ? '^{' + g2 + '}' : '')) + '. It takes the <b>lower</b> power of ' + t(y) + ', and the first term has ' + t(y + '^{' + e1 + '}') + ', so the second term must have the lower power.' }]), fc.check],
      key, t('m=' + g1) + ', ' + t('n=' + g2) + '; ' + t(keyF),
      'The GCF uses the <b>lower</b> power of each letter. The second term has ' + t(x + '^{' + e2 + '}') + ' but the GCF has only ' + t(x + (g1 > 1 ? '^{' + g1 + '}' : '')) + ', so the lower power comes from the first term: ' + t('m=' + g1) + '.<br>Likewise the first term has ' + t(y + '^{' + e1 + '}') + ' but the GCF has ' + t(y + (g2 > 1 ? '^{' + g2 + '}' : '')) + ', so ' + t('n=' + g2) + '.<br>Then ' + t(shownSum + '=' + keyF) + ' (divide each term by the GCF).<br>Check: ' + t(keyF + '=' + shownSum) + ' ✓'.replace(/ \(divide.*\)/, ' (divide each term by the GCF)'),
      ['The GCF takes each letter to the <b>lowest</b> power found in the terms. Which term must supply that lowest power?', 'Then divide each term by the GCF.'], 'GCF backwards: find the exponents');
    pt.bad = badRows(key, 0, [e2]).concat(badRows(key, 1, [e1]), badRows(key, 2, fc.bad));
    return pt;
  }

  /* ======================= Lesson 2: binomial common factors and grouping ======================= */
  function l2q1(r) {
    var v = r.pick(['x', 'y', 'm', 'a']), s = pickWhere(function () { return { p: nz(r, 1, 9), a: r.int(2, 9), b: nz(r, 1, 9) }; }, function (s) { return gcd(s.a, Math.abs(s.b)) === 1 && Math.abs(s.b) !== Math.abs(s.p); });
    var X = lin(1, s.p, v), lead = T(s.a, v, 1), full = P.add(P.mul(lead, X), P.scale(X, s.b));
    var shown = t(s.a + v + br(X) + (s.b < 0 ? '-' : '+') + Math.abs(s.b) + br(X));
    var other = lin(s.a, s.b, v);
    return fpart('Factor ' + shown + '.', [X, other],
      [{ is: [X, lin(s.a, -s.b, v)], code: 'u4x-bcf-sign', hint: 'The second term is ' + t(sg(s.b) + br(X)) + ': its sign goes into the leftover bracket too.' },
        { is: [X, lead], code: 'u4x-lost-term', hint: 'Taking ' + t(br(X)) + ' out of ' + t(sg(s.b) + br(X)) + ' leaves ' + t(sg(s.b)) + ' — it must go in the second bracket.' },
        { is: [{ p: X, k: 2 }, other], code: 'u4x-bin-twice', hint: 'The common bracket ' + t(br(X)) + ' is taken out <b>once</b>; what is left of each term goes in the second bracket.' }],
      'Both terms have the common binomial factor ' + t(br(X)) + '. Take it out; what is left of each term makes the second bracket:<br>' + shown + t('=' + br(X) + br(other)),
      ['Treat ' + t(br(X)) + ' as one block: it is a factor of both terms.', 'Write ' + t(br(X)) + ' once, then a bracket with what is left of each term (signs included).'], 'common binomial factor');
  }
  function l2q2(r) {
    var v = r.pick(['x', 'b', 'a', 'y']), s = pickWhere(function () { return { m: r.int(1, 5), n: nz(r, 1, 7), k: r.int(1, 5), j: nz(r, 1, 7) }; },
      function (s) { return s.m * s.k >= 2 && s.n < 0 && gcd(s.m, Math.abs(s.n)) === 1 && gcd(s.k, Math.abs(s.j)) === 1 && s.m * s.j !== s.n * s.k && s.m * s.j + s.n * s.k !== 0 && !(s.m === s.k && s.n === s.j); });
    var K1 = lin(s.k, s.j, v), M1 = lin(s.m, s.n, v), terms = [T(s.m * s.k, v, 2), T(s.m * s.j, v, 1), T(s.n * s.k, v, 1), P.num(s.n * s.j)], shown = P.seq(terms);
    return fpart('Factor by grouping: ' + t(shown) + '.', [M1, K1],
      [{ is: [lin(s.m, -s.n, v), K1], code: 'u4x-group-sign', hint: 'Check the second group: take out ' + t(s.n) + ' (negative), so the bracket left over matches the first group’s bracket.' },
        { is: [M1, lin(s.k, -s.j, v)], code: 'u4x-group-sign', hint: 'Both groups must leave the <b>same</b> bracket. Check the signs when you take out the second group’s factor.' }],
      'Group in pairs: ' + t('(' + P.seq(terms.slice(0, 2)) + ')+(' + P.seq(terms.slice(2)) + ')') + '.<br>Common factor of each pair: ' + t((s.m === 1 ? '' : s.m) + v + br(K1) + (s.n < 0 ? '-' : '+') + Math.abs(s.n) + br(K1)) + '.<br>Common bracket: ' + t('=' + br(K1) + br(M1)),
      ['Group the first two terms and the last two terms; take a common factor out of each pair.', 'If the first term of the second pair is negative, take out a <b>negative</b> factor so both brackets match.'], 'factor by grouping');
  }
  function l2q3(r) {
    var vs = r.pick([['a', 'b'], ['x', 'y'], ['m', 'n'], ['s', 't']]), u = vs[0], w = vs[1];
    var s = pickWhere(function () { return { c: r.int(1, 3), p: nz(r, 2, 9), q: nz(r, 2, 9) }; }, function (s) { return Math.abs(s.p) !== Math.abs(s.q) && gcd(s.c, Math.abs(s.p)) === 1; });
    var A = lin(s.c, s.p, u), B = lin(1, s.q, w), uw = {}; uw[u] = 1; uw[w] = 1;
    var terms = [Mo(s.c, uw), P.num(s.p * s.q), T(s.c * s.q, u, 1), T(s.p, w, 1)], shown = P.seq(r.chance(0.5) ? terms : [terms[1], terms[0], terms[3], terms[2]]);
    return fpart('Factor completely: ' + t(shown) + '.', [A, B],
      [{ is: [lin(s.c, -s.p, u), B], code: 'u4x-group-sign', hint: 'Expand your answer to check the signs: each group’s common factor must keep the sign of its terms.' },
        { is: [A, lin(1, -s.q, w)], code: 'u4x-group-sign', hint: 'Expand your answer to check the signs: each group’s common factor must keep the sign of its terms.' }],
      'The terms as written don’t pair up (' + t(tx(terms[0])) + ' and ' + t(tx(terms[1])) + ' share no variable). Rearrange so each pair shares a factor:<br>' + t(P.seq(terms[0] ? [terms[0], terms[2]] : []) + P.seq([terms[3], terms[1]]).replace(/^(?!-)/, '+')) + '<br>' + t('=' + (s.c === 1 ? '' : s.c) + u + br(B) + (s.p < 0 ? '-' : '+') + Math.abs(s.p) + br(B)) + '<br>' + t('=' + br(B) + br(A)),
      ['Four terms with no common factor: try grouping. Put together two terms that share a variable.', 'Rearrange so the two groups leave the <b>same</b> bracket.'], 'rearrange, then group');
  }

  /* ======================= Lesson 3: x² + bx + c ======================= */
  var L3V = ['x', 'y', 'n', 'a', 'm', 't'];
  function l3q1(r, same) { var v = r.pick(L3V), pq = monicPair(r, same, 1, 12), s = spec({ v: v, p: pq.p, q: pq.q }); return monicPart(t(tx(s.full)), s, [], 'factor x² + bx + c'); }
  function l3q2(r) {
    var v = r.pick(['x', 'a', 'p', 'y']), k = r.int(2, 5), pq = monicPair(r, r.chance(0.4), 1, 9), s = spec({ v: v, p: pq.p, q: pq.q, G: P.num(-k) });
    var p = monicPart('Factor completely: ' + t(tx(s.full)) + '.', s, [{ is: [P.num(k), s.A, s.B], code: 'u4x-neg-signs', hint: 'Taking out a common factor can’t change the value: expand your answer — every sign is opposite. Take out ' + t('-' + k) + ' so the ' + t(v + '^{2}') + ' term in the bracket is positive.' }], 'negative GCF, then x² + bx + c');
    return p;
  }
  function l3q3Shared(r) {
    return pickWhere(function () {
      var p = nz(r, 1, 7), q = nz(r, 1, 9), s2 = nz(r, 1, 9), v = r.pick(['x', 'x', 'n', 'y']);
      return { p: p, q: q, s: s2, v: v };
    }, function (o) {
      var c1 = o.p * o.s, k = o.p + o.s;
      if (o.p === o.q || o.p === o.s || o.q === o.s || k === 0 || o.p + o.q === 0 || Math.abs(c1) < 4) return false;
      return c1 % o.q !== 0; // only (x + p) can be the common factor
    });
  }
  function l3q3(r, o) {
    var v = o.v, X = V(v), Fp = bin(X, o.p), Fq = bin(X, o.q), Fs = bin(X, o.s), c1 = o.p * o.s, k = o.p + o.s, T2 = P.mul(Fp, Fq);
    var first = v + '^{2}+k' + v + sg(c1), second = tx(T2);
    var fc = K.poly(Fp, { wrong: [{ is: Fq, code: 'u4x-other-factor', hint: t(tx(Fq)) + ' is a factor of ' + t(second) + ', but it can’t be a factor of ' + t(first) + ': ' + t(c1) + ' is not a multiple of ' + t(o.q) + '.' }] });
    var key = [tx(Fp), String(k)];
    var pt = KP.fields('The trinomials ' + t(first) + ' and ' + t(second) + ' have a common binomial factor, and ' + t('k') + ' is an integer. Find the common factor and the value of ' + t('k') + '.',
      [fbox('Common factor:', [v], { placeholder: 'e.g. x - 4' }), nbox(t('k='))],
      [fc, numChk(k, [{ v: -k, code: 'u4x-k-sign', hint: t('k') + ' is the sum of the two numbers in ' + t('(' + v + sg(o.p) + ')(' + v + '+\\square)') + '. Check the signs.' }, { v: o.p * o.s, code: 'u4x-swap-bc', hint: 'The numbers in the brackets <b>multiply</b> to ' + t(c1) + ' and <b>add</b> to ' + t('k') + '.' }])],
      key, 'Common factor ' + t(tx(Fp)) + ', ' + t('k=' + k),
      'Factor the trinomial you know: ' + t(second + '=' + br(Fq) + br(Fp)) + '.<br>The common factor is one of these. The other trinomial’s constant is ' + t(c1) + ', so its brackets’ numbers multiply to ' + t(c1) + ': ' + t(o.q) + ' does not divide ' + t(c1) + ', but ' + t(o.p) + ' does.<br>So the common factor is ' + t(tx(Fp)) + ', and ' + t(first) + t('=' + br(Fp) + br(Fs)) + '.<br>' + t('k=' + par(o.p) + '+' + par(o.s) + '=' + k),
      ['Factor ' + t(second) + ' first: the common factor is one of its two brackets.', 'The brackets of ' + t(first) + ' must have numbers that multiply to ' + t(c1) + '. Which bracket can work?'], 'common factor of two trinomials');
    pt.bad = [[tx(Fq), String(o.q + c1 / o.q)]].concat(badRows(key, 1, [-k]));
    return pt;
  }

  /* ======================= Lesson 4: difference of squares ======================= */
  function dosWrongs(Au, b, list) { // A² − b² with A = Au (polynomial), b number or polynomial
    var B = P.lift(b), Am = bin(Au, -1, B), Ap = bin(Au, 1, B);
    return [{ is: [{ p: Am, k: 2 }], code: 'u4x-dos-square', hint: t('(' + tx(Am) + ')^{2}') + ' has a middle term. A difference of squares factors as a <b>sum times a difference</b>: ' + t('(a-b)(a+b)') + '.' },
      { is: [{ p: Ap, k: 2 }], code: 'u4x-dos-square', hint: 'A difference of squares factors as a <b>sum times a difference</b>: ' + t('(a-b)(a+b)') + '.' }].concat(list || []);
  }
  function l4q1a(r) {
    var v = r.pick(['x', 'y', 'k', 'm', 'd']), n = r.int(4, 15), X = V(v), full = P.sub(P.mul(X, X), P.num(n * n));
    return fpart(t(tx(full)), [bin(X, -n), bin(X, n)], dosWrongs(X, n, [{ is: [bin(X, -n * n), bin(X, n * n)], code: 'u4x-no-root', hint: 'Use the square <b>roots</b>: ' + t(n * n + '=' + n + '^{2}') + '.' }]),
      t(tx(full) + '=' + v + '^{2}-' + n + '^{2}') + ', a difference of squares: ' + t('a^{2}-b^{2}=(a-b)(a+b)') + '.<br>' + t('=(' + v + '-' + n + ')(' + v + '+' + n + ')'),
      ['Is each term a perfect square? ' + t(n * n + '=' + n + '^{2}') + '.', t('a^{2}-b^{2}=(a-b)(a+b)') + '.'], 'difference of squares v² − n²');
  }
  function l4q1b(r) {
    var v = r.pick(['x', 'a', 'p', 'z']), s = pickWhere(function () { return { a: r.int(2, 7), b: r.int(1, 11) }; }, function (s) { return gcd(s.a, s.b) === 1; });
    var AX = T(s.a, v, 1), full = P.sub(P.mul(AX, AX), P.num(s.b * s.b));
    return fpart(t(tx(full)), [bin(AX, -s.b), bin(AX, s.b)], dosWrongs(AX, s.b, [{ is: [lin(s.a * s.a, -s.b, v), lin(s.a * s.a, s.b, v)], code: 'u4x-no-root', hint: 'The first term is ' + t('(' + s.a + v + ')^{2}') + ': use its square root, ' + t(s.a + v) + '.' }]),
      t(tx(full) + '=(' + s.a + v + ')^{2}-' + s.b + '^{2}') + '.<br>' + t('=(' + s.a + v + '-' + s.b + ')(' + s.a + v + '+' + s.b + ')'),
      ['Write each term as a square: ' + t(s.a * s.a + v + '^{2}=(' + s.a + v + ')^{2}') + '.', t('a^{2}-b^{2}=(a-b)(a+b)') + '.'], 'difference of squares a²x² − b²');
  }
  function l4q2(r) {
    var vs = r.pick([['m', 'n'], ['x', 'y'], ['a', 'b'], ['p', 'q']]), s = pickWhere(function () { return { k: r.int(2, 7), a: r.int(1, 5), b: r.int(1, 7) }; }, function (s) { return gcd(s.a, s.b) === 1 && s.a !== s.b && s.k * Math.max(s.a, s.b) * Math.max(s.a, s.b) <= 200; });
    var A = T(s.a, vs[0], 1), B = T(s.b, vs[1], 1), Am = P.sub(A, B), Ap = P.add(A, B), full = P.scale(P.mul(Am, Ap), s.k);
    return fpart('Factor completely: ' + t(tx(full)) + '.', [P.num(s.k), Am, Ap],
      [{ is: [Am, Ap], code: 'u4x-gcf-dropped', hint: 'Your brackets are right, but the common factor ' + t(s.k) + ' is missing.' },
        { is: [P.num(s.k), { p: Am, k: 2 }], code: 'u4x-dos-square', hint: 'After taking out ' + t(s.k) + ', the bracket is a difference of squares: a <b>sum times a difference</b>.' },
        { is: [P.scale(Am, s.k), P.scale(Ap, s.k)], code: 'u4x-gcf-one', hint: 'Expand your answer: ' + t(s.k) + ' times ' + t(s.k) + ' is ' + t(s.k * s.k) + '. Take the common factor out in front <b>once</b>.' }],
      'Common factor first: ' + t(tx(full) + '=' + s.k + '(' + tx(P.mul(Am, Ap)) + ')') + '.<br>The bracket is a difference of squares: ' + t('(' + tx(A) + ')^{2}-(' + tx(B) + ')^{2}') + '.<br>' + t('=' + s.k + br(Am) + br(Ap)),
      ['Take out the common factor ' + t(s.k) + ' first.', 'Then the bracket is ' + t('a^{2}-b^{2}=(a-b)(a+b)') + '.'], 'GCF then difference of squares');
  }
  function l4q3(r) {
    var v = r.pick(['x', 'x', 'y']), s = pickWhere(function () { var m = r.pick([2, 3, 3]), n = m === 3 ? r.pick([1, 2]) : 1; return { m: m, n: n, a: nz(r, 1, 9), b: r.int(1, 9) }; },
      function (s) { return s.a !== s.b && s.a + s.b !== 0 && s.a !== -s.b; });
    var A = lin(s.m, s.a, v), B = lin(s.n, s.b, v), D1 = P.sub(A, B), D2 = P.add(A, B), full = P.sub(P.mul(A, A), P.mul(B, B));
    var target = cleanList([D1, D2]), keyTex = FX.tex(target);
    return fpart('Factor completely: ' + t('(' + tx(A) + ')^{2}-(' + tx(B) + ')^{2}') + '.', target,
      [{ is: [P.add(P.sub(A, P.scale(V(v), s.n)), P.num(s.b)), D2], code: 'u4x-minus-bracket', hint: 'In ' + t('[(' + tx(A) + ')-(' + tx(B) + ')]') + ' the minus sign applies to <b>both</b> terms of ' + t(br(B)) + '.' },
        { is: [{ p: D1, k: 2 }], code: 'u4x-dos-square', hint: 'A difference of squares is a <b>sum times a difference</b>: ' + t('a^{2}-b^{2}=(a-b)(a+b)') + ' with ' + t('a=' + tx(A)) + ' and ' + t('b=' + tx(B)) + '.' }],
      'This is ' + t('a^{2}-b^{2}') + ' with ' + t('a=' + tx(A)) + ' and ' + t('b=' + tx(B)) + ': ' + t('(a-b)(a+b)') + '.<br>' + t('[(' + tx(A) + ')-(' + tx(B) + ')][(' + tx(A) + ')+(' + tx(B) + ')]=' + br(D1) + br(D2)) + (keyTex !== FX.tex([D1, D2]) ? '<br>Take out the common factors: ' + t('=' + keyTex) : '') + '<br>(Check: expanding gives ' + t(tx(full)) + '.)',
      ['Treat each bracket as one block: this is ' + t('a^{2}-b^{2}') + ' with ' + t('a=' + tx(A)) + ' and ' + t('b=' + tx(B)) + '.', 'Simplify inside each new bracket (the minus sign reaches every term), then take out any common factor.'], 'difference of squares of binomials', { keyTex: keyTex });
  }

  /* ======================= Lesson 5: ax² + bx + c ======================= */
  function l5q1(r) {
    var v = r.pick(['x', 'x', 'y', 'n']), o = pickWhere(function () { var a = r.pick([2, 3, 5, 7]), first = r.chance(0.5); return axSpec(first ? a : 1, r.int(1, 7), first ? 1 : a, r.int(1, 7), v); },
      function (o) { return gcd(o.p, o.q) === 1 && gcd(o.r, o.s) === 1 && o.m !== o.n && o.q !== o.s && o.b <= 30; });
    var lo = Math.min(o.m, o.n), hi = Math.max(o.m, o.n), full = tx(o.full);
    var fc = fchk(o.list, axWrongs(o));
    var pairHint = function (vv, which) { if (vv === lo || vv === hi) return { code: 'u4x-pair-wrong', hint: t(vv) + ' is one of the pair, but this box takes the <b>' + which + '</b> integer.' }; return vv && o.ac % vv === 0 ? { code: 'u4x-pair-wrong', hint: t(vv) + ' is a factor of ' + t(o.ac) + ', but ' + t(vv + '+' + o.ac / vv + '=' + (vv + o.ac / vv)) + ', not ' + t(o.b) + '.' } : { code: 'u4x-pair-wrong', hint: t(vv) + ' doesn’t divide ' + t(o.ac) + '. The two integers multiply to ' + t('ac') + '.' }; };
    var key = [String(o.ac), String(lo), String(hi), FX.tex(o.list)];
    var pt = KP.fields('Factor ' + t(full) + ' by decomposition. Find ' + t('ac') + ', the two integers with product ' + t('ac') + ' and sum ' + t(o.b) + ', then the factored form.',
      [nbox(t('ac=')), nbox('Smaller integer:'), nbox('Larger integer:'), fbox('Factored form:', [v], { placeholder: 'e.g. (2x + 1)(x + 3)' })],
      [numChk(o.ac, [{ v: o.a + o.c, code: 'u4x-ac-sum', hint: t('ac') + ' means ' + t('a\\times c') + ': multiply.' }, { v: o.c, code: 'u4x-ac-c', hint: 'When ' + t('a\\ne 1') + ', use the product ' + t('a\\times c') + ', not just ' + t('c') + '.' }]),
        K.number(lo, function (vv) { return vv === lo ? null : pairHint(vv, 'smaller'); }), K.number(hi, function (vv) { return vv === hi ? null : pairHint(vv, 'larger'); }), fc.check],
      key, t('ac=' + o.ac) + '; ' + t(lo) + ' and ' + t(hi) + '; ' + t(FX.tex(o.list)),
      axSol(o), ['Multiply ' + t('a') + ' by ' + t('c') + ', then list the factor pairs of ' + t(o.ac) + ': which pair adds to ' + t(o.b) + '?', 'Split the middle term with that pair, group in twos, and take out the common bracket.'], 'decomposition steps');
    var chk = pt.check, same = function (s, n) { return String(s == null ? '' : s).replace(/\s/g, '') === String(n); };
    pt.check = function (resp) { if (resp && same(resp[1], hi) && same(resp[2], lo)) { resp = resp.slice(); resp[1] = String(lo); resp[2] = String(hi); } return chk(resp); }; // the right pair in the other order
    pt.bad = badRows(key, 0, [o.a + o.c, o.c]).concat(badRows(key, 3, fc.bad));
    return pt;
  }
  function l5q2(r) {
    var v = r.pick(['x', 'a', 'm', 't']), o = pickWhere(function () { return axSpec(r.int(2, 5), nz(r, 1, 9), r.int(2, 5), nz(r, 1, 9), v); },
      function (o) { return o.c < 0 && o.b !== 0 && gcd(o.p, Math.abs(o.q)) === 1 && gcd(o.r, Math.abs(o.s)) === 1 && !(o.p === o.r && o.q === o.s) && Math.abs(o.b) <= 30 && Math.abs(o.ac) <= 300 && o.a <= 20; });
    return fpart(t(tx(o.full)), o.list, axWrongs(o), axSol(o), ['Find two integers with product ' + t('ac=' + o.ac) + ' and sum ' + t(o.b) + '. ' + signHint(o.b, o.ac), 'Split the middle term with them, group in pairs, and take out the common bracket. Expand to check.'], 'decomposition, c < 0');
  }
  function l5q3(r) {
    var v = r.pick(['x', 'y']), s = pickWhere(function () { return { a: r.pick([2, 3, 4, 5, 6, 7]), c: r.int(2, 12) }; }, function (s) {
      var ac = s.a * s.c, sums = posPairs(ac).map(function (pq) { return pq[0] + pq[1]; }), cs = posPairs(s.c).map(function (pq) { return pq[0] + pq[1]; });
      return gcd(s.a, s.c) === 1 && sums.length >= 3 && sums.length <= 5 && cs.join() !== sums.join() && ac <= 72; // gcd(a, c) = 1: otherwise every b sharing that factor “factors” by a GCF alone
    });
    var a = s.a, c = s.c, ac = a * c, pairs = posPairs(ac), sums = pairs.map(function (pq) { return pq[0] + pq[1]; }).sort(function (x, y) { return x - y; }), csums = posPairs(c).map(function (pq) { return pq[0] + pq[1]; }).sort(function (x, y) { return x - y; });
    var expr = a + v + '^{2}+b' + v + '+' + c;
    return { prompt: 'List <b>every positive</b> integer ' + t('b') + ' for which ' + t(expr) + ' can be factored over the integers.', input: { type: 'list' }, key: sums, answer: t(sums.join(',\\ ')),
      check: function (resp) {
        if (!resp || !resp.length) return form('empty', 'Add the values one at a time (press Enter or comma after each).');
        resp = resp.map(Number); if (resp.some(function (x) { return !Number.isInteger(x); })) return wrong('u4x-not-b', 'Each value of ' + t('b') + ' is an integer.');
        var seen = {}; for (var i = 0; i < resp.length; i++) { if (seen[resp[i]]) return form('duplicate', 'You listed ' + t(resp[i]) + ' more than once.'); seen[resp[i]] = 1; }
        var srt = resp.slice().sort(function (x, y) { return x - y; }), pos = srt.filter(function (x) { return x > 0; });
        if (pos.length < srt.length) return pos.join() === sums.join() ? form('u4x-neg-b', 'Your positive values are all right — the question asks for <b>positive</b> values of ' + t('b') + ' only, so leave out the others.') : wrong('u4x-not-b', 'The question asks for <b>positive</b> values of ' + t('b') + ' only. For each positive factor pair of ' + t('ac=' + ac) + ', the sum is one value of ' + t('b') + '.');
        if (srt.join() === csums.join()) return wrong('u4x-pairs-c', 'Those come from the factor pairs of ' + t(c) + '. With ' + t('a=' + a) + ', the decomposition pair must multiply to ' + t('ac=' + ac) + '.');
        var bad = resp.filter(function (x) { return sums.indexOf(x) < 0; });
        if (bad.length) return wrong('u4x-not-b', 'For ' + t('b=' + bad[0]) + ' no pair of integers multiplies to ' + t('ac=' + ac) + ' and adds to ' + t(bad[0]) + ', so ' + t(a + v + '^{2}+' + bad[0] + v + '+' + c) + ' doesn’t factor.');
        if (resp.length < sums.length) return wrong('u4x-missing-b', 'You have ' + resp.length + ' of the ' + sums.length + ' values. Go through every factor pair of ' + t(ac) + ': ' + t('1\\times ' + ac) + ', ' + t('2\\times ?') + ', …');
        return ok();
      },
      solution: 'Decomposition needs two integers with product ' + t('ac=' + a + '\\times ' + c + '=' + ac) + ' and sum ' + t('b') + '. For a positive ' + t('b') + ', use the positive factor pairs of ' + t(ac) + ':<br>' + pairs.map(function (pq) { return t(pq[0] + '\\times ' + pq[1]) + ' → ' + t('b=' + (pq[0] + pq[1])); }).join(', ') + '.<br>So ' + t('b=' + sums.join(',\\ ')) + '. (For example, ' + t('b=' + sums[0]) + ' gives ' + t(FX.tex(cleanFromPair(a, c, pairs[pairs.length - 1], v))) + '.)',
      hints: ['When ' + t('a\\ne 1') + ', the decomposition pair multiplies to ' + t('ac') + ', not ' + t('c') + '.', 'Every positive factor pair of ' + t(ac) + ' gives one value of ' + t('b') + ': its sum.'], text: 'all positive b for ' + a + 'x^2+bx+' + c,
      bad: [csums, sums.slice(1), sums.concat([sums[sums.length - 1] + 1]), sums.slice(1).concat([-sums[0]])] };
  }
  /* the factorization of ax² + (m+n)x + c from a pair m·n = ac */
  function cleanFromPair(a, c, pq, v) {
    var m = pq[0], n = pq[1], g = gcd(a, m), A = lin(a / g, m / g, v), B = lin(g, c / (m / g) , v);
    if (!P.eq(P.mul(A, B), P.add(T(a, v, 2), T(m + n, v, 1), P.num(c)))) { g = gcd(a, n); A = lin(a / g, n / g, v); B = lin(g, c * g / n, v); }
    return [A, B];
  }

  /* ======================= Lesson 6: further factoring ======================= */
  function l6q1a(r) {
    var v = r.pick(['x', 'y', 'm', 'k']), n = r.int(4, 12), minus = r.chance(0.5), mid = T(2 * n, v, 1);
    var W = [{ is: T(n, v, 1), code: 'u4x-mid-half', hint: 'The middle term of a perfect square is <b>twice</b> the product of the square roots: ' + t('2\\cdot ' + v + '\\cdot ' + n) + '.' },
      { is: T(n * n, v, 1), code: 'u4x-mid-square', hint: 'The middle term is ' + t('2ab') + ' with ' + t('a=' + v) + ' and ' + t('b=' + n) + ', not ' + t('b^{2}') + '.' },
      { is: P.num(2 * n), code: 'u4x-no-var', hint: 'The middle term is ' + t('2\\cdot ' + v + '\\cdot ' + n) + ': it has the variable in it.' }];
    var part = KP.poly('Fill in the missing middle term so that ' + t(v + '^{2}' + (minus ? '-' : '+') + '\\square+' + n * n) + ' is a perfect square trinomial. (The sign is already shown.)', mid, { wrong: W },
      t(n * n + '=' + n + '^{2}') + ', so the trinomial is ' + t('(' + v + (minus ? '-' : '+') + n + ')^{2}=' + v + '^{2}' + (minus ? '-' : '+') + 2 * n + v + '+' + n * n) + '.<br>The middle term is ' + t('2\\cdot ' + v + '\\cdot ' + n + '=' + 2 * n + v) + '.',
      ['A perfect square trinomial is ' + t('a^{2}\\pm 2ab+b^{2}') + '. What are ' + t('a') + ' and ' + t('b') + ' here?', 'The middle term is ' + t('2ab') + '.'], 'missing middle term of a perfect square');
    part.bad = W.map(function (w) { return tx(w.is); });
    return part;
  }
  function l6q1b(r) {
    var v = r.pick(['x', 'a', 'p', 'w']), k = nz(r, 3, 11), X = V(v), A = bin(X, k), full = P.mul(A, A);
    return fpart(t(tx(full)), [{ p: A, k: 2 }],
      [{ is: [bin(X, -k), bin(X, k)], code: 'u4x-pst-dos', hint: 'That multiplies to ' + t(v + '^{2}-' + k * k) + ' — no middle term. The constant is ' + t('+' + k * k) + ', so both brackets have the same sign.' },
        { is: [{ p: bin(X, -k), k: 2 }], code: 'u4x-pst-sign', hint: 'Check the sign: the middle term ' + t(tx(T(2 * k, v, 1))) + ' tells you the sign in the bracket.' }],
      t(v + '^{2}') + ' and ' + t(k * k + '=' + Math.abs(k) + '^{2}') + ' are squares, and ' + t(tx(T(2 * k, v, 1)) + '=2\\cdot ' + v + '\\cdot ' + par(k)) + ': a perfect square trinomial.<br>' + t(tx(full) + '=(' + tx(A) + ')^{2}'),
      ['Are the first and last terms perfect squares? Is the middle term twice the product of their roots?', 'The sign of the middle term is the sign in the bracket.'], 'factor a perfect square trinomial');
  }
  function l6q2(r) {
    var v = r.pick(['x', 'x', 'a', 'y']), s = pickWhere(function () { var both = r.chance(0.5); return { p: r.int(1, 5), q: r.int(1, both ? 6 : 9), both: both }; },
      function (s) { return s.both ? s.p !== s.q && s.p * s.p + s.q * s.q <= 50 : s.q !== s.p * s.p && s.q - s.p * s.p !== 0; });
    var X = V(v), X2 = V(v, 2), Q = s.both ? P.sub(X2, P.num(s.q * s.q)) : P.add(X2, P.num(s.q)), D = P.sub(X2, P.num(s.p * s.p)), full = P.mul(D, Q);
    var target = [bin(X, -s.p), bin(X, s.p)].concat(s.both ? [bin(X, -s.q), bin(X, s.q)] : [Q]);
    var flipped = s.both ? [P.add(X2, P.num(s.p * s.p)), P.add(X2, P.num(s.q * s.q))] : [P.add(X2, P.num(s.p * s.p)), P.sub(X2, P.num(s.q))];
    return fpart('Factor completely: ' + t(tx(full)) + '.', target,
      [{ is: flipped, code: 'u4x-block-sign', hint: 'Think of it as a trinomial in ' + t(v + '^{2}') + ': the two numbers must multiply to ' + t(P.constant(full)[0]) + ' and add to ' + t(P.coef(full, (function () { var o = {}; o[v] = 2; return o; })())[0]) + '. Check the signs.' }].concat(s.both ? [] : [{ is: [bin(X, -s.p), bin(X, s.p), bin(X, -s.q), bin(X, s.q)], code: 'u4x-sum-split', hint: t(tx(Q)) + ' is a <b>sum</b> of squares (or not a square at all): it doesn’t factor over the integers.' }]),
      'Let ' + t('u=' + v + '^{2}') + ': ' + t(tx(full).replace(new RegExp(v + '\\^\\{4\\}', 'g'), 'u^{2}').replace(new RegExp(v + '\\^\\{2\\}', 'g'), 'u') + '=' + '(' + tx(D).replace(new RegExp(v + '\\^\\{2\\}', 'g'), 'u') + ')(' + tx(Q).replace(new RegExp(v + '\\^\\{2\\}', 'g'), 'u') + ')') + '.<br>Put ' + t(v + '^{2}') + ' back: ' + t(br(D) + br(Q)) + '.<br>' + t(tx(D)) + (s.both ? ' and ' + t(tx(Q)) + ' are both differences of squares' : ' is a difference of squares; ' + t(tx(Q)) + ' does not factor') + ':<br>' + t('=' + FX.tex(target)),
      ['Treat ' + t(v + '^{2}') + ' as one block: factor ' + t(tx(full)) + ' like a trinomial ' + t('u^{2}+bu+c') + '.', 'Then check each bracket: a difference of squares factors again.'], 'trinomial in x², then difference of squares');
  }
  function l6q3(r) {
    var hasY = r.chance(0.6), s = pickWhere(function () { return { k: r.pick([2, 3, 5]), a: r.int(1, 3), b: r.int(1, 3) }; }, function (s) { return gcd(s.a, s.b) === 1 && (s.a > 1 || s.b > 1) && !(s.a === 1 && s.b === 1); });
    var x = 'x', AX = T(s.a, x, 1), B = hasY ? T(s.b, 'y', 1) : P.num(s.b), Am = P.sub(AX, B), Ap = P.add(AX, B), S2 = P.add(P.mul(AX, AX), P.mul(B, B)), full = P.scale(P.mul(Am, Ap, S2), s.k);
    var D2 = P.sub(P.mul(AX, AX), P.mul(B, B));
    return fpart('Factor completely: ' + t(tx(full)) + '.', [P.num(s.k), Am, Ap, S2],
      [{ is: [Am, Ap, S2], code: 'u4x-gcf-dropped', hint: 'Your brackets are right, but the common factor ' + t(s.k) + ' is missing.' },
        { is: [P.num(s.k), { p: Am, k: 2 }, { p: Ap, k: 2 }], code: 'u4x-sum-split', hint: t(tx(S2)) + ' is a <b>sum</b> of squares: it does not factor. Only the difference of squares splits again.' },
        { is: [P.num(s.k), Am, Ap, P.sub(P.mul(AX, AX), P.mul(B, B))], code: 'u4x-dos-square', hint: 'Check the last bracket: the difference of squares gives a <b>sum</b> and a <b>difference</b>, so one bracket is ' + t(tx(S2)) + '.' }],
      'Common factor first: ' + t(tx(full) + '=' + s.k + '(' + tx(P.mul(D2, S2)) + ')') + '.<br>Difference of squares: ' + t(tx(P.mul(D2, S2)) + '=(' + tx(D2) + ')(' + tx(S2) + ')') + '.<br>' + t(tx(D2)) + ' is a difference of squares again; ' + t(tx(S2)) + ' is a sum and doesn’t factor:<br>' + t('=' + FX.tex([P.num(s.k), Am, Ap, S2])),
      ['Take out the common factor first. What is left is a difference of two squares.', 'One of the new brackets is a difference of squares again — keep going until nothing factors.'], 'GCF, difference of squares twice');
  }

  /* ======================= Lesson 7: choosing a strategy ======================= */
  function l7q1a(r) { var v = r.pick(['x', 'y', 'w', 'm']), n = r.int(11, 20), X = V(v), full = P.sub(P.mul(X, X), P.num(n * n)); return fpart(t(tx(full)), [bin(X, -n), bin(X, n)], dosWrongs(X, n), 'Two terms, both perfect squares, subtracted: a difference of squares. ' + t(n * n + '=' + n + '^{2}') + '.<br>' + t(tx(full) + '=(' + v + '-' + n + ')(' + v + '+' + n + ')'), ['How many terms? Is each one a perfect square?', t('a^{2}-b^{2}=(a-b)(a+b)')], 'choose: difference of squares'); }
  function l7q1b(r) { var v = r.pick(['x', 'w', 'q', 'k']), pq = pickWhere(function () { return { p: nz(r, 2, 15), q: nz(r, 2, 15) }; }, function (o) { return o.p * o.q < 0 && Math.abs(o.p * o.q) >= 24 && Math.abs(o.p * o.q) <= 120 && o.p + o.q !== 0 && Math.abs(o.p + o.q) >= 2; }), s = spec({ v: v, p: pq.p, q: pq.q }); return monicPart(t(tx(s.full)), s, [], 'choose: x² + bx + c'); }
  function l7q2(r) {
    var v = r.pick(['x', 'v', 'a', 'n']);
    if (r.chance(0.5)) {
      var k = r.int(2, 5), n = r.int(2, 9), X = V(v), G = T(k, v, 1), full = P.mul(G, P.sub(P.mul(X, X), P.num(n * n)));
      return fpart('Factor completely: ' + t(tx(full)) + '.', [G, bin(X, -n), bin(X, n)],
        [{ is: [G, P.sub(P.mul(X, X), P.num(n * n))], code: 'u4x-dos-square', hint: 'Not finished? ' + t(v + '^{2}-' + n * n) + ' is a difference of squares — it factors again.' },
          { is: [bin(X, -n), bin(X, n)], code: 'u4x-gcf-dropped', hint: 'Your brackets are right, but the common factor ' + t(tx(G)) + ' is missing.' },
          { is: [G, { p: bin(X, -n), k: 2 }], code: 'u4x-dos-square', hint: 'A difference of squares is a sum times a difference, not a square.' }],
        'Common factor first: ' + t(tx(full) + '=' + tx(G) + '(' + v + '^{2}-' + n * n + ')') + '.<br>The bracket is a difference of squares: ' + t('=' + tx(G) + '(' + v + '-' + n + ')(' + v + '+' + n + ')'),
        ['Always look for a common factor first.', 'Then check what is left: two squares subtracted?'], 'GCF then difference of squares');
    }
    var o = pickWhere(function () { return { k: r.int(2, 5), ax: axSpec(r.pick([1, 2, 3, 5]), nz(r, 1, 7), 1, nz(r, 1, 7), v) }; }, function (o) { var a = o.ax; return a.a > 1 && gcd(a.p, Math.abs(a.q)) === 1 && a.b !== 0 && a.q !== a.s && Math.abs(a.b) <= 20; });
    var a = o.ax, full2 = P.scale(a.full, o.k);
    return fpart('Factor completely: ' + t(tx(full2)) + '.', [P.num(o.k)].concat(a.list),
      [{ is: a.list, code: 'u4x-gcf-dropped', hint: 'Your brackets are right, but the common factor ' + t(o.k) + ' is missing.' }].concat(axWrongs(a).map(function (w) { return { is: [P.num(o.k)].concat(w.is), code: w.code, hint: w.hint }; })),
      'Common factor first: ' + t(tx(full2) + '=' + o.k + '(' + tx(a.full) + ')') + '.<br>' + axSol(a) + '<br>So ' + t(tx(full2) + '=' + FX.tex([P.num(o.k)].concat(a.list))),
      ['Always look for a common factor first.', 'The trinomial left has ' + t('a\\ne 1') + ': decompose with ' + t('ac') + '.'], 'GCF then decomposition');
  }
  function l7q3(r) {
    var mono = r.pick([['x'], ['y'], ['x', 'y']]), s = pickWhere(function () { return { g: r.int(2, 5), ax: axSpec(r.int(1, 4), nz(r, 1, 7), r.int(2, 5), nz(r, 1, 7), 'x', 'y') }; },
      function (s) { var a = s.ax; return a.a >= 4 && gcd(a.p, Math.abs(a.q)) === 1 && gcd(a.r, Math.abs(a.s)) === 1 && a.b !== 0 && !(a.p === a.r && a.q === a.s) && Math.abs(a.b) <= 25; });
    var ov = {}; mono.forEach(function (x) { ov[x] = 1; });
    var G = Mo(s.g, ov), a = s.ax, full = P.mul(G, a.full);
    return fpart('Factor completely: ' + t(tx(full)) + '.', [G].concat(a.list),
      [{ is: a.list, code: 'u4x-gcf-dropped', hint: 'Your brackets are right, but the common factor ' + t(tx(G)) + ' is missing.' }].concat(axWrongs(a).map(function (w) { return { is: [G].concat(w.is), code: w.code, hint: w.hint }; })),
      'Common factor first: ' + t(tx(full) + '=' + tx(G) + '(' + tx(a.full) + ')') + '.<br>' + axSol(a) + '<br>So ' + t(tx(full) + '=' + FX.tex([G].concat(a.list))),
      ['Take out the greatest common factor, letters included.', 'What is left is a trinomial in ' + t('x') + ' and ' + t('y') + ' with ' + t('a\\ne 1') + ': decompose it, keeping ' + t('y') + ' with the second term of each bracket.'], 'GCF then decomposition in two variables');
  }

  /* ======================= Lesson 8: unit review ======================= */
  function l8q1a(r) {
    var vs = r.pick([['c', 'd'], ['x', 'y'], ['m', 'n'], ['a', 'b']]), u = vs[0], w = vs[1];
    var s = pickWhere(function () { return { g: r.int(2, 9), i: r.int(1, 2), j: r.int(1, 2), p: r.int(2, 6), q: nz(r, 2, 5) }; }, function (s) { return Math.abs(s.p) !== Math.abs(s.q); });
    var og = {}; og[u] = s.i; og[w] = s.j;
    var G = Mo(s.g, og), o2 = {}; o2[u] = 2;
    var Br = P.add(T(s.q, w, 1), Mo(s.p, o2), P.num(1)), full = P.mul(G, Br);
    return fpart(t(tx(full)), [G, Br],
      [{ is: [G, P.sub(Br, P.num(1))], code: 'u4x-drop-one', hint: 'One term equals the GCF: dividing it by the GCF leaves ' + t('1') + ', which stays in the bracket.' },
        { is: [G, P.add(T(s.q, w, 1), Mo(-s.p, o2), P.num(1))], code: 'u4x-bracket-sign', hint: 'Divide each term by the GCF and keep its sign.' }],
      'GCF: ' + t(s.g) + ' and the lowest power of each letter, ' + t(tx(Mo(1, og))) + ': ' + t(tx(G)) + '.<br>Divide every term (the term equal to the GCF leaves ' + t('1') + '): ' + t(tx(full) + '=' + tx(G) + '(' + tx(Br) + ')'),
      ['Find the greatest number and the lowest power of each letter common to all three terms.', 'Divide every term by it; don’t lose the ' + t('1') + '.'], 'review: GCF with a leftover 1');
  }
  function l8q1b(r) { var v = r.pick(['k', 'p', 'x', 'z']), pq = monicPair(r, r.chance(0.4), 1, 11), s = spec({ v: v, p: pq.p, q: pq.q }); return monicPart(t(tx(s.full)), s, [], 'review: x² + bx + c'); }
  function l8q2(r) {
    var v = r.pick(['x', 'x', 'a', 'y']), s = pickWhere(function () { return { g: r.int(2, 4), e: r.int(1, 2), ax: axSpec(r.int(1, 5), nz(r, 1, 6), r.int(1, 5), nz(r, 1, 6), v) }; },
      function (s) { var a = s.ax; return a.a >= 2 && (a.p > 1 || a.r > 1) && gcd(a.p, Math.abs(a.q)) === 1 && gcd(a.r, Math.abs(a.s)) === 1 && a.b !== 0 && !(a.p === a.r && a.q === a.s) && Math.abs(a.b) <= 20 && a.a <= 15; });
    var G = T(s.g, v, s.e), a = s.ax, full = P.mul(G, a.full);
    return fpart('Factor completely: ' + t(tx(full)) + '.', [G].concat(a.list),
      [{ is: a.list, code: 'u4x-gcf-dropped', hint: 'Your brackets are right, but the common factor ' + t(tx(G)) + ' is missing.' }].concat(axWrongs(a).map(function (w) { return { is: [G].concat(w.is), code: w.code, hint: w.hint }; })),
      'Common factor first: ' + t(tx(full) + '=' + tx(G) + '(' + tx(a.full) + ')') + '.<br>' + axSol(a) + '<br>So ' + t(tx(full) + '=' + FX.tex([G].concat(a.list))),
      ['Take out the greatest common factor first (number and power of ' + t(v) + ').', 'Then factor the trinomial left in the bracket — by inspection if ' + t('a=1') + ', by decomposition otherwise.'], 'review: GCF then trinomial');
  }
  function l8q3(r) {
    var s = pickWhere(function () { var a = r.pick([2, 3, 4, 5]); return { a: a, p: r.int(1, 8), q: nz(r, 1, 9), x: r.int(3, 9), u: r.pick(['cm', 'm']) }; }, function (s) {
      var o = axSpec(1, s.p, s.a, s.q, 'x'); return gcd(s.a, Math.abs(s.q)) === 1 && s.a * s.x + s.q > 0 && s.p !== s.q && o.b !== 0 && s.a * s.x + s.q !== s.x + s.p;
    });
    var o = axSpec(1, s.p, s.a, s.q, 'x'), x = s.x, u = s.u, L = x + s.p, W = s.a * x + s.q, Pm = 2 * (L + W), coef = 2 * (1 + s.a), cst = 2 * (s.p + s.q);
    var fc = fchk(o.list, axWrongs(o));
    var key = [FX.tex(o.list), String(x)];
    var halfX = (Pm - (s.p + s.q)) / (1 + s.a), halfX2 = (Pm / 2 - (s.p + s.q)) / (1 + s.a) * 2;
    var pt = KP.fields('A rectangle has an area of ' + t('(' + tx(o.full) + ')') + ' ' + t('\\text{' + u + '}^{2}') + '. Its length and width are binomials with integer coefficients. Its perimeter is ' + t(Pm) + ' ' + u + '. Factor the area to find the dimensions, then find ' + t('x') + '.',
      [fbox('Area in factored form:', ['x'], { placeholder: 'e.g. (2x + 1)(x + 3)' }), nbox(t('x='))],
      [fc.check, numChk(x, [Number.isInteger(halfX) ? { v: halfX, code: 'u4x-perim-sum', hint: 'The perimeter is <b>two</b> lengths and <b>two</b> widths: ' + t('P=2(L+W)') + '.' } : null, { v: L, code: 'u4x-perim-gave-dim', hint: 'That is a side length. The question asks for ' + t('x') + '.' }, { v: W, code: 'u4x-perim-gave-dim', hint: 'That is a side length. The question asks for ' + t('x') + '.' }])],
      key, t(FX.tex(o.list)) + '; ' + t('x=' + x) + ' (the rectangle is ' + t(L) + ' by ' + t(W) + ' ' + u + ')',
      axSol(o) + '<br>Perimeter: ' + t('2[(' + tx(o.A) + ')+(' + tx(o.B) + ')]=' + tx(P.add(T(coef, 'x', 1), P.num(cst)))) + '.<br>' + t(tx(P.add(T(coef, 'x', 1), P.num(cst))) + '=' + Pm) + ', so ' + t(coef + 'x=' + (Pm - cst)) + ' and ' + t('x=' + x) + '.<br>Check: the sides are ' + t(L) + ' and ' + t(W) + ' ' + u + ', and ' + t('2(' + L + '+' + W + ')=' + Pm) + ' ✓',
      ['Factor the area (decomposition): its two factors are the length and the width.', 'Perimeter ' + t('=2(L+W)') + ': add the two binomials, double, and solve for ' + t('x') + '.'], 'review: factor an area, then use the perimeter');
    void halfX2;
    pt.bad = badRows(key, 0, fc.bad).concat(badRows(key, 1, [Number.isInteger(halfX) ? halfX : null, L]));
    return pt;
  }

  /* ======================= the exit slips ======================= */
  HW.defineExit({ lesson: 'u4l1', calc: false, outcome: 'AN5',
    blurb: 'GCF of two monomials, removing a GCF, a negative GCF with a leftover 1, and a GCF worked backwards.',
    questions: [
      { num: '1', outcome: 'AN5', stem: 'Greatest common factors.', parts: [{ id: '1a', outcome: 'AN5', level: 'BEG', make: l1q1a }, { id: '1b', outcome: 'AN5', level: 'BEG', make: l1q1b }] },
      { num: '2', outcome: 'AN5', stem: 'A negative common factor.', parts: [{ id: '2', outcome: 'AN5', level: 'PRG', make: l1q2 }] },
      { num: '3', outcome: 'AN5', stem: 'Working backwards.', shared: l1q3Shared, parts: [{ id: '3', outcome: 'AN5', level: 'MAS', make: l1q3 }] }] });

  HW.defineExit({ lesson: 'u4l2', calc: false, outcome: 'AN5',
    blurb: 'A common binomial factor, factoring by grouping, and four terms that must be rearranged before grouping.',
    questions: [
      { num: '1', outcome: 'AN5', stem: 'A common binomial factor.', parts: [{ id: '1', outcome: 'AN5', level: 'BEG', make: l2q1 }] },
      { num: '2', outcome: 'AN5', stem: 'Grouping.', parts: [{ id: '2', outcome: 'AN5', level: 'PRG', make: l2q2 }] },
      { num: '3', outcome: 'AN5', stem: 'Four terms.', parts: [{ id: '3', outcome: 'AN5', level: 'ADV', make: l2q3 }] }] });

  HW.defineExit({ lesson: 'u4l3', calc: false, outcome: 'AN5',
    blurb: 'Factoring x² + bx + c (both sign patterns), a negative common factor first, and the common factor of two trinomials.',
    questions: [
      { num: '1', outcome: 'AN5', stem: 'Factor.', parts: [{ id: '1a', outcome: 'AN5', level: 'BEG', make: function (r) { return l3q1(r, true); } }, { id: '1b', outcome: 'AN5', level: 'BEG', make: function (r) { return l3q1(r, false); } }] },
      { num: '2', outcome: 'AN5', stem: 'Common factor first.', parts: [{ id: '2', outcome: 'AN5', level: 'PRG', make: l3q2 }] },
      { num: '3', outcome: 'AN5', stem: 'A shared factor.', shared: l3q3Shared, parts: [{ id: '3', outcome: 'AN5', level: 'MAS', make: l3q3 }] }] });

  HW.defineExit({ lesson: 'u4l4', calc: false, outcome: 'AN5',
    blurb: 'Differences of squares (x² − n², a²x² − b²), a common factor first, and a difference of two squared binomials.',
    questions: [
      { num: '1', outcome: 'AN5', stem: 'Factor.', parts: [{ id: '1a', outcome: 'AN5', level: 'BEG', make: l4q1a }, { id: '1b', outcome: 'AN5', level: 'BEG', make: l4q1b }] },
      { num: '2', outcome: 'AN5', stem: 'Common factor first.', parts: [{ id: '2', outcome: 'AN5', level: 'PRG', make: l4q2 }] },
      { num: '3', outcome: 'AN5', stem: 'Squares of binomials.', parts: [{ id: '3', outcome: 'AN5', level: 'MAS', make: l4q3 }] }] });

  HW.defineExit({ lesson: 'u4l5', calc: false, outcome: 'AN5',
    blurb: 'Decomposition step by step, factoring ax² + bx + c with c < 0, and every b that makes ax² + bx + c factorable.',
    questions: [
      { num: '1', outcome: 'AN5', stem: 'Decomposition.', parts: [{ id: '1', outcome: 'AN5', level: 'BEG', make: l5q1 }] },
      { num: '2', outcome: 'AN5', stem: 'Factor.', parts: [{ id: '2', outcome: 'AN5', level: 'PRG', make: l5q2 }] },
      { num: '3', outcome: 'AN5', stem: 'Which values of b?', parts: [{ id: '3', outcome: 'AN5', level: 'ADV', make: l5q3 }] }] });

  HW.defineExit({ lesson: 'u4l6', calc: false, outcome: 'AN5',
    blurb: 'Perfect square trinomials, a trinomial in x² that splits again, and a GCF with two differences of squares.',
    questions: [
      { num: '1', outcome: 'AN5', stem: 'Perfect square trinomials.', parts: [{ id: '1a', outcome: 'AN5', level: 'BEG', make: l6q1a }, { id: '1b', sub: 'b', outcome: 'AN5', level: 'BEG', make: function (r) { var p = l6q1b(r); p.prompt = 'Factor ' + p.prompt + '.'; return p; } }] },
      { num: '2', outcome: 'AN5', stem: 'Factor completely.', parts: [{ id: '2', outcome: 'AN5', level: 'PRG', make: l6q2 }] },
      { num: '3', outcome: 'AN5', stem: 'Factor completely.', parts: [{ id: '3', outcome: 'AN5', level: 'ADV', make: l6q3 }] }] });

  HW.defineExit({ lesson: 'u4l7', calc: false, outcome: 'AN5',
    blurb: 'Choosing the method (difference of squares, x² + bx + c), a GCF plus a second method, and a GCF plus decomposition in two variables.',
    questions: [
      { num: '1', outcome: 'AN5', stem: 'Choose a method and factor.', parts: [{ id: '1a', outcome: 'AN5', level: 'BEG', make: l7q1a }, { id: '1b', outcome: 'AN5', level: 'BEG', make: l7q1b }] },
      { num: '2', outcome: 'AN5', stem: 'Two methods.', parts: [{ id: '2', outcome: 'AN5', level: 'PRG', make: l7q2 }] },
      { num: '3', outcome: 'AN5', stem: 'Every step.', parts: [{ id: '3', outcome: 'AN5', level: 'ADV', make: l7q3 }] }] });

  HW.defineExit({ lesson: 'u4l8', calc: false, outcome: 'AN5',
    blurb: 'Unit review mix: a GCF with a leftover 1, x² + bx + c, a GCF plus a trinomial, and a rectangle found from its area and perimeter.',
    questions: [
      { num: '1', outcome: 'AN5', stem: 'Factor.', parts: [{ id: '1a', outcome: 'AN5', level: 'BEG', make: l8q1a }, { id: '1b', outcome: 'AN5', level: 'BEG', make: l8q1b }] },
      { num: '2', outcome: 'AN5', stem: 'Factor completely.', parts: [{ id: '2', outcome: 'AN5', level: 'PRG', make: l8q2 }] },
      { num: '3', outcome: 'AN5', stem: 'Area and perimeter.', parts: [{ id: '3', outcome: 'AN5', level: 'MAS', make: l8q3 }] }] });
  void wrong;
})(window);
