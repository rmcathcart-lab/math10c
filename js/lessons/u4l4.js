/* Math 10C · Unit 4 · Lesson 4 — Factoring ax² + bx + c (where a ≠ 1) (AN5)
 * Assignment questions 1–16 (u4_L04.tex) and the Lesson 4 Extra Practice (u4_EP04.tex).
 * Every trinomial is built from its factors: Tri({ p, q, r, s, k, gv, v, w }) is  k·(gv-monomial)·(p v + q w)(r v + s w),
 * with gcd(p, q) = gcd(r, s) = 1, so the key is always the generated factorization. The decomposition pair is
 * m = p·s and n = q·r, and the grouping  p v(r v + s w) + q w(r v + s w)  is the worked solution. Each part keeps the
 * booklet question's structure (sign pattern of b and c, size of ac, a GCF to take out first, a negative leading term,
 * the booklet's term order, two variables, the letters used) and the booklet's own numbers are among the possible values.
 * Classic wrong factorizations (both signs switched, constants in the wrong brackets, the pair written straight into the
 * brackets as if a = 1, the "slide" without dividing, a lost common factor or minus sign, a missing second variable)
 * are computed from the generated numbers and given targeted hints through K.factored's opt.wrong.
 * Levels: LIM BEG EMG PRG ADV MAS (conservative; recognition formats one level below and capped at PRG). */
(function (root) {
  'use strict';
  var HW = root.HW, K = HW.kit, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form, B = K.P, PL = HW.poly, FX = HW.factor, nt = HW.nt;

  HW.addCodes({
    'ax-sign-swap': 'Signs of both constants switched', 'ax-const-swap': 'Constant terms in the wrong brackets', 'ax-pair-as-factors': 'Wrote the pair into the brackets as if a = 1',
    'ax-no-divide': 'Used ax ± m, ax ± n without dividing out a', 'ax-gcf-dropped': 'Dropped the common factor', 'ax-lost-negative': 'Lost the negative common factor',
    'ax-gcf-sign': 'Common factor with the wrong sign', 'ax-no-y': 'Left out the second variable', 'ax-group-sign': 'Sign error taking out the second group’s factor',
    'ax-need-x': 'Box entries without the variable', 'ax-pair-signs': 'Pair with both signs wrong', 'ax-pair-sum': 'Pair has the right product, wrong sum',
    'ax-pair-product': 'Pair has the right sum, wrong product', 'ax-pair-product-sign': 'Pair product has the wrong sign', 'ax-pair-int': 'Pair not two integers',
    'ax-collected': 'Collected the middle terms', 'ax-sum-not-product': 'Added instead of multiplying', 'ax-ac-wrong': 'Wrong value of ac',
    'ax-outer': 'Gave the outer area instead of the path', 'ax-one-side': 'Path added on one side only', 'ax-minus-first': 'Subtracted only the first term',
    'ax-cm': 'Did not convert cm to m', 'ax-bed-area': 'Used the bed’s area', 'ax-outer-area': 'Used the outer area', 'ax-tank': 'Gave the tank’s volume',
    'ax-added': 'Added the water instead of subtracting', 'ax-water': 'Gave the water’s volume', 'ax-neg-exp': 'Ignored the negative exponent', 'ax-digit-order': 'Digits in the wrong order',
    'ax-dos-square': 'Difference of squares written as a square', 'ax-pairs-not-divisors': 'Counted pairs instead of divisors', 'ax-divisors-not-pairs': 'Counted divisors instead of pairs',
    'ax-missing-b': 'Missing some values of b', 'ax-extra-b': 'A value of b that does not work', 'ax-only-positive': 'Left out the negative values of b', 'ax-unsimplified': 'Brackets not simplified',
    'ax-sq-no-middle': 'Squared a binomial without its middle term', 'ax-same-sign': 'Took out a positive factor from a negative group', 'ax-lead': 'Wrong leading coefficient'
  });

  /* ---------------- polynomial building blocks ---------------- */
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var x = b; b = a % b; a = x; } return a; }
  function vo(v, e, w, f) { var o = {}; if (v && e) o[v] = e; if (w && f) o[w] = (o[w] || 0) + f; return o; }
  function M(c, vars) { return PL.mono(c, vars || {}); }
  function N(c) { return PL.num(c); }
  function lin(p, q, v, w) { return PL.add(M(p, vo(v || 'x', 1)), w ? M(q, vo(w, 1)) : N(q)); }
  function tx(p, o) { return PL.tex(p, o); }
  function br(p) { return PL.btex(p); }
  function sg(n) { return n < 0 ? String(n) : '+' + n; }
  function pn(n) { return n < 0 ? '(' + n + ')' : String(n); }
  function mulAll(list) { return list.reduce(function (acc, f) { return PL.mul(acc, f); }, N(1)); }
  function cf(n) { return n === 1 ? '' : n === -1 ? '-' : String(n); }
  function cfs(n) { return n === 1 ? '+' : n === -1 ? '-' : sg(n); }

  /* a trinomial built from its factors */
  function Tri(o) {
    var v = o.v || 'x', w = o.w || null, T = { p: o.p, q: o.q, r: o.r, s: o.s, v: v, w: w };
    T.F1 = lin(o.p, o.q, v, w); T.F2 = lin(o.r, o.s, v, w);
    T.inner = PL.mul(T.F1, T.F2);
    T.a = o.p * o.r; T.b = o.p * o.s + o.q * o.r; T.c = o.q * o.s; T.ac = T.a * T.c;
    T.m = o.p * o.s; T.n = o.q * o.r;
    T.gm = M(o.k || 1, o.gv || {}); T.hasG = !PL.eq(T.gm, N(1)); T.neg = (o.k || 1) < 0;
    T.full = PL.mul(T.gm, T.inner);
    T.tex = tx(T.full); T.asc = tx(T.full, { order: 'asc' }); T.innerTex = tx(T.inner);
    T.list = T.hasG ? [T.gm, T.F2, T.F1] : [T.F2, T.F1];
    T.key = FX.tex(T.list);
    return T;
  }
  function gpre(T) { var g = tx(T.gm); return g === '1' ? '' : g === '-1' ? '-' : g; }
  function splitTex(T) { var v = T.v, w = T.w; return PL.seq([M(T.a, vo(v, 2)), M(T.m, vo(v, 1, w, 1)), M(T.n, vo(v, 1, w, 1)), M(T.c, vo(w, 2))]); }
  function groupTex(T) {
    var g1 = M(T.p, vo(T.v, 1)), g2 = T.w ? M(T.q, vo(T.w, 1)) : N(T.q), b2 = br(T.F2), g2t = tx(g2);
    return tx(g1) + b2 + (g2t.charAt(0) === '-' ? '' : '+') + g2t + b2;
  }
  function altNeg(T) { // -(F2)(F1) written with the minus inside one bracket, e.g. (x+2)(7-6x)
    var negF1 = T.q < 0 || T.s > 0; // negate the bracket whose constant is negative
    return negF1 ? br(T.F2) + '(' + tx(PL.neg(T.F1), { order: 'asc' }) + ')' : '(' + tx(PL.neg(T.F2), { order: 'asc' }) + ')' + br(T.F1);
  }
  function pairLine(T) { return t('ac=' + T.a + '(' + T.c + ')=' + T.ac) + '; the pair with product ' + t(T.ac) + ' and sum ' + t(T.b) + ' is ' + t(T.m) + ' and ' + t(T.n) + '.'; }
  function solDecomp(T, o) {
    o = o || {};
    var L = [];
    if (o.asc) L.push('Descending order first: ' + t(T.asc + '=' + T.tex) + '.');
    if (T.hasG) L.push((T.neg ? 'The leading term is negative, so take out ' + (gpre(T) === '-' ? t('-1') : 'the negative common factor ' + t(tx(T.gm))) : 'Take out the common factor ' + t(tx(T.gm)) + ' first') + ': ' + t((o.asc ? T.tex : T.tex) + '=' + gpre(T) + '(' + T.innerTex + ')') + '.');
    L.push((T.hasG ? 'For ' + t(T.innerTex) + ': ' : '') + pairLine(T));
    L.push(t(T.innerTex + '=' + splitTex(T)));
    L.push(t('=' + groupTex(T)));
    L.push(t('=' + br(T.F2) + br(T.F1)));
    if (T.hasG) L.push('So ' + t((o.asc ? T.asc : T.tex) + '=' + T.key) + (T.neg && gpre(T) === '-' ? ', or ' + t(altNeg(T)) : '') + '.');
    else if (o.asc) L.push('So ' + t(T.asc + '=' + T.key) + '.');
    return L.join('<br>');
  }
  function hintsFor(T, o) {
    o = o || {};
    var h = [];
    if (o.asc) h.push('Rearrange it into descending order first: ' + t(T.tex) + '.');
    if (T.hasG) h.push(T.neg ? 'The leading term is negative: take out a <b>negative</b> common factor first.' : 'Look for a common factor first — it makes ' + t('ac') + ' much smaller.');
    h.push('For ' + t(T.innerTex) + ': find two integers with product ' + t('ac=' + T.ac) + ' and sum ' + t('b=' + T.b) + ', split the middle term with them, then group.');
    return h.slice(0, 2);
  }
  /* classic wrong factorizations, computed from the numbers */
  function stdWrongs(T) {
    var out = [], seen = [T.full], v = T.v, w = T.w, g = T.gm;
    function add(fs, code, hint) {
      var pr = mulAll(fs);
      if (PL.isZero(pr) || seen.some(function (x) { return PL.eq(x, pr); })) return;
      seen.push(pr); out.push({ is: pr, code: code, hint: hint(t(tx(pr))), tex: FX.tex(fs) });
    }
    add([g, lin(T.p, -T.q, v, w), lin(T.r, -T.s, v, w)], 'ax-sign-swap', function (P) { return 'Your factors multiply to ' + P + ': the middle term has the wrong sign. Change the sign of the constant term in <b>both</b> brackets.'; });
    add([g, lin(T.p, T.s, v, w), lin(T.r, T.q, v, w)], 'ax-const-swap', function (P) { return 'Your factors multiply to ' + P + '. The first and last terms are right but the middle term isn’t: the constant terms are in the wrong brackets. Expand to check, or split the middle term and group.'; });
    if (!T.hasG) {
      add([lin(1, T.m, v, w), lin(1, T.n, v, w)], 'ax-pair-as-factors', function (P) { return 'Your factors multiply to ' + P + '. Writing the pair straight into the brackets only works when ' + t('a=1') + '. Use the pair to <b>split the middle term</b>, then group.'; });
      add([lin(T.a, T.m, v, w), lin(T.a, T.n, v, w)], 'ax-no-divide', function (P) { return 'Your factors multiply to ' + P + ', which is ' + t(T.a) + ' times too big. Split the middle term with the pair and group instead.'; });
    } else {
      add([T.F1, T.F2], T.neg && gpre(T) === '-' ? 'ax-lost-negative' : 'ax-gcf-dropped', function (P) {
        return T.neg && gpre(T) === '-' ? 'Your factors multiply to ' + P + ' — the opposite of the expression. You took out ' + t('-1') + ', so keep the minus sign in front, or put it into one bracket.'
          : 'Don’t lose the common factor: ' + t(tx(T.gm)) + ' stays in front of the brackets.';
      });
      if (T.neg && gpre(T) !== '-') add([PL.neg(g), T.F1, T.F2], 'ax-gcf-sign', function (P) { return 'Your factors multiply to ' + P + ' — the opposite of the expression. The leading term is negative, so the common factor is ' + t(tx(T.gm)) + '.'; });
    }
    if (w) add([g, lin(T.p, T.q, v), lin(T.r, T.s, v)], 'ax-no-y', function () { return 'Each bracket needs a ' + t(w) + '-term: the last term of the trinomial is ' + t(tx(M(T.c, vo(w, 2)))) + '.'; });
    return out;
  }
  function factorPart(T, o) {
    o = o || {};
    var W = stdWrongs(T).concat(o.wrong || []).filter(function (x) { return !PL.eq(x.is, T.full); });
    var p = B.factored(o.prompt || t(o.asc ? T.asc : T.tex), T.list, { wrong: W }, o.sol || solDecomp(T, o), o.hints || hintsFor(T, o), o.text || 'factor ' + (o.asc ? T.asc : T.tex));
    p.bad = W.map(function (x) { return x.tex || tx(x.is); }).concat(o.bad || []);
    p.good = [FX.tex(T.hasG ? [T.gm, T.F1, T.F2] : [T.F1, T.F2])];
    if (T.neg && gpre(T) === '-') { var al = altNeg(T); p.good.push(al); p.answer = t(T.key) + ' or ' + t(al); }
    return p;
  }
  /* constrained random (p, q, r, s); the booklet's numbers are inside every range */
  function val(r, x) { return typeof x === 'number' ? x : Array.isArray(x) ? r.int(x[0], x[1]) : r.pick(x.of); }
  function pick(r, sp) {
    for (var i = 0; i < 1500; i++) {
      var o = { p: val(r, sp.p), q: val(r, sp.q), r: val(r, sp.r), s: val(r, sp.s) };
      if (!o.q || !o.s || o.p < 1 || o.r < 1 || gcd(o.p, o.q) !== 1 || gcd(o.r, o.s) !== 1) continue;
      o.a = o.p * o.r; o.b = o.p * o.s + o.q * o.r; o.c = o.q * o.s; o.ac = o.a * o.c;
      if (o.a < 2 || !o.b) continue;
      if (o.p === o.r && o.q === o.s && !sp.square) continue;
      if (sp.test && !sp.test(o)) continue;
      return o;
    }
    return sp.book;
  }
  function tri(r, sp, extra) { var o = pick(r, sp); return Tri(Object.assign({ p: o.p, q: o.q, r: o.r, s: o.s }, extra || {})); }
  function npairs(n) { return Math.ceil(nt.numDivisors(Math.abs(n)) / 2); }
  function hasPair(ac, b) { var d = nt.divisors(Math.abs(ac)); for (var i = 0; i < d.length; i++) for (var sgn = -1; sgn <= 1; sgn += 2) { var x = sgn * d[i], y = ac / x; if (x + y === b) return [x, y]; } return null; }
  function factorInt(a, b, c) {
    var k = gcd(gcd(a, b), c); if (a < 0) k = -k;
    var A = a / k, Bb = b / k, C = c / k;
    for (var p = 1; p <= A; p++) if (A % p === 0) { var r = A / p; for (var q = -Math.abs(C); q <= Math.abs(C); q++) if (q && C % q === 0) { var s = C / q; if (p * s + q * r === Bb && gcd(p, q) === 1 && gcd(r, s) === 1) return { k: k, p: p, q: q, r: r, s: s }; } }
    return null;
  }

  /* ---------------- answer readers and small checkers ---------------- */
  function readPoly(resp) {
    var a = K.read(resp == null ? '' : resp); if (a.res) return { res: a.res };
    var rr = PL.read(a.ast);
    if (!rr.ok) return { res: wrong(rr.why === 'not-poly' ? 'not-poly' : 'value', rr.why === 'not-poly' ? 'That isn’t a polynomial. Check your work.' : null) };
    return { p: rr.p, fi: PL.formIssue(a.ast) };
  }
  function readInt(resp) { var a = K.read(resp == null ? '' : resp); if (a.res) return { res: a.res }; if (!isFinite(a.val) || Math.abs(a.val - Math.round(a.val)) > 1e-9) return { bad: true }; return { v: Math.round(a.val) }; }
  function lab(res, label) { return res.hint && label ? { v: res.v, code: res.code, hint: '<b>' + label + ':</b> ' + res.hint } : res; }
  function constOf(p) { return PL.vars(p).length ? null : PL.constant(p)[0] / PL.constant(p)[1]; }
  function coefOf(p, v) { if (PL.count(p) !== 1) return null; var c = PL.coef(p, vo(v, 1)); return c[0] && c[1] === 1 && PL.count(PL.sub(p, M(c[0], vo(v, 1)))) === 0 ? c[0] : null; }
  function pbox(label, vars) { return { label: label, name: label.replace(/<[^>]*>|\\\(|\\\)/g, ''), mode: 'math', keys: 'poly', vars: vars || ['x'] }; }
  function nbox(label, vars) { return pbox(label, vars || []); }
  function fieldsPart(prompt, fields, check, key, answer, sol, hints, text) { return { prompt: prompt, input: { type: 'fields', fields: fields }, check: check, key: key, answer: answer, solution: sol, hints: hints || [], text: text }; }
  /* a pair of integers in two boxes, either order */
  function pairEval(x, y, m, n, ac, b) {
    if ((x === m && y === n) || (x === n && y === m)) return null;
    if (x * y === ac && x + y === -b) return wrong('ax-pair-signs', 'Those multiply to ' + t(ac) + ' but add to ' + t(-b) + '. Change the sign of <b>both</b> numbers.');
    if (x * y === ac) return wrong('ax-pair-sum', t(pn(x) + '\\times ' + pn(y) + '=' + ac) + ' ✓, but ' + t(pn(x) + '+' + pn(y) + '=' + (x + y)) + ', not ' + t(b) + '. Keep working through the factor pairs of ' + t(Math.abs(ac)) + '.');
    if (x + y === b) return wrong('ax-pair-product', 'They add to ' + t(b) + ' ✓, but ' + t(pn(x) + '\\times ' + pn(y) + '=' + (x * y)) + ', not ' + t(ac) + '.');
    if (x * y === -ac) return wrong('ax-pair-product-sign', 'Check the signs: the product must be ' + t(ac) + (ac < 0 ? ', which is negative, so the two numbers have opposite signs.' : ', which is positive, so the two numbers have the same sign.'));
    return wrong('value', 'The two numbers must multiply to ' + t(ac) + ' and add to ' + t(b) + '.');
  }
  function pairCheck(m, n, ac, b, labels, offset) {
    offset = offset || 0; labels = labels || ['First integer', 'Second integer'];
    return function (resp) {
      resp = resp || [];
      var A = readInt(resp[offset]), C = readInt(resp[offset + 1]);
      if (A.res) return lab(A.res, labels[0]); if (C.res) return lab(C.res, labels[1]);
      if (A.bad || C.bad) return wrong('ax-pair-int', 'Both boxes need an integer (a whole number, possibly negative).');
      return pairEval(A.v, C.v, m, n, ac, b) || ok();
    };
  }
  /* two polynomial boxes holding f1, f2 in either order */
  function twoPolyCheck(f1, f2, labels, diag) {
    return function (resp) {
      resp = resp || [];
      var A = readPoly(resp[0]), C = readPoly(resp[1]);
      if (A.res) return lab(A.res, labels[0]); if (C.res) return lab(C.res, labels[1]);
      if ((PL.eq(A.p, f1) && PL.eq(C.p, f2)) || (PL.eq(A.p, f2) && PL.eq(C.p, f1))) {
        if (A.fi) return lab(form(A.fi.code, A.fi.msg || 'Simplify it fully.'), labels[0]);
        if (C.fi) return lab(form(C.fi.code, C.fi.msg || 'Simplify it fully.'), labels[1]);
        return ok();
      }
      var h = diag ? diag(A.p, C.p) : null; if (h) return h;
      return wrong('value', null);
    };
  }
  /* the two middle cells of an area box / the two middle pieces of an uncollected expansion */
  function middleCheck(T, labels, mode) {
    var v = T.v, mx = M(T.m, vo(v, 1)), nx = M(T.n, vo(v, 1)), BX = tx(M(T.b, vo(v, 1))), ACX = tx(M(T.ac, vo(v, 2)));
    return twoPolyCheck(mx, nx, labels, function (P1, P2) {
      var c0 = constOf(P1), c1 = constOf(P2);
      if (c0 != null && c1 != null && ((c0 === T.m && c1 === T.n) || (c0 === T.n && c1 === T.m))) return form('ax-need-x', 'Right numbers — but these are ' + t(v) + '-terms: write ' + t(tx(mx)) + ', not ' + t(T.m) + '.');
      var k0 = coefOf(P1, v), k1 = coefOf(P2, v);
      if (mode === 'expand' && ((k0 === T.b && c1 === 0) || (k1 === T.b && c0 === 0) || k0 === T.b || k1 === T.b)) return wrong('ax-collected', 'That is the middle term after collecting. Write the two pieces <b>before</b> you add them: outside product and inside product.');
      if (k0 != null && k1 != null) {
        var r = pairEval(k0, k1, T.m, T.n, T.ac, T.b);
        if (r && r.code === 'ax-pair-sum') return wrong('ax-pair-sum', 'Those multiply to ' + t(ACX) + ' ✓, but they add to ' + t(tx(M(k0 + k1, vo(v, 1)))) + ', not ' + t(BX) + '.');
        if (r && r.code === 'ax-pair-product') return wrong('ax-pair-product', 'They add to ' + t(BX) + ' ✓, but they multiply to ' + t(tx(M(k0 * k1, vo(v, 2)))) + ', not ' + t(ACX) + '.');
        if (r && r.code !== 'value') return r;
      }
      return wrong('value', mode === 'expand' ? 'Multiply the outside terms and the inside terms of the two brackets.' : 'The two middle boxes must multiply to ' + t(ACX) + ' (the product of the two corner boxes) and add to ' + t(BX) + '.');
    });
  }

  /* ---------------- figures ---------------- */
  function boxFig(T, full) {
    var v = T.v, A = tx(M(T.a, vo(v, 2))), C = String(T.c);
    if (!full) return HW.areaModel(['\\phantom{0}', '\\phantom{0}'], ['\\phantom{0}', '\\phantom{0}'], [[A, '?'], ['?', C]], { max: 260 });
    return HW.areaModel([tx(M(T.r, vo(v, 1))), sg(T.s)], [tx(M(T.p, vo(v, 1))), sg(T.q)], [[A, tx(M(T.m, vo(v, 1)))], [tx(M(T.n, vo(v, 1))), C]], { max: 260 });
  }
  function boxSol(T) {
    var v = T.v, px = tx(M(T.p, vo(v, 1))), rx = tx(M(T.r, vo(v, 1)));
    return t('ac=' + T.a + '(' + T.c + ')=' + T.ac) + ': the middle boxes multiply to ' + t(tx(M(T.ac, vo(v, 2)))) + ' and add to ' + t(tx(M(T.b, vo(v, 1)))) + ', so they are ' + t(tx(M(T.m, vo(v, 1)))) + ' and ' + t(tx(M(T.n, vo(v, 1)))) + '.' + boxFig(T, true)
      + 'Row 1 shares ' + t(px) + ', row 2 shares ' + t(T.q) + '; the columns are ' + t(rx) + ' and ' + t(T.s) + ' (choose the signs so the rows and columns agree).<br>So ' + t(T.tex + '=' + FX.tex([T.F1, T.F2])) + '.';
  }
  function tileFrame(T) { var top = [], side = [], i; for (i = 0; i < T.p; i++) top.push('x'); for (i = 0; i < T.q; i++) top.push('1'); for (i = 0; i < T.r; i++) side.push('x'); for (i = 0; i < T.s; i++) side.push('1'); return HW.tiles.frame(top, side, { fill: true }); }
  function tankSvg(k, F1, F2) {
    var s = '<svg class="fig-svg" viewBox="0 0 300 175" width="100%" style="max-width:340px" role="img" aria-label="rectangular prism tank">';
    s += '<polygon points="50,55 90,25 260,25 220,55" fill="#e3e7ec" stroke="#2b3340" stroke-width="1.6"/><polygon points="220,55 260,25 260,115 220,145" fill="#c3c9d1" stroke="#2b3340" stroke-width="1.6"/>';
    s += '<rect x="50" y="55" width="170" height="90" fill="#f2f4f6" stroke="#2b3340" stroke-width="1.6"/>';
    var st = ' font-size="15" font-style="italic" fill="#1d2430" font-family="KaTeX_Main, Times New Roman, serif"';
    s += '<text x="135" y="166" text-anchor="middle"' + st + '>' + F1 + '</text><text x="44" y="105" text-anchor="end"' + st + '>' + k + '</text>';
    s += '<text x="248" y="148" text-anchor="middle" transform="rotate(-37 248 148)"' + st + '>' + F2 + '</text></svg>';
    return '<div class="fig">' + s + '</div>';
  }
  function plain(p) { return tx(p).replace(/-/g, ' − ').replace(/\+/g, ' + ').replace(/^ − /, '−'); }

  /* ---------------- question makers ---------------- */
  function mcPart(r, prompt, opts, sol, hints, text, keepOrder) { return B.mc(r, prompt, opts, sol, hints, text, keepOrder); }
  function isFactorOf(full, L) { var ts = PL.terms(L), c0 = PL.constant(L)[0], l0 = PL.coef(L, { x: 1 })[0]; if (ts.length !== 2 || !l0) return false; var v = PL.atExact(full, { x: [-c0, l0] }); return v[0] === 0; }
  /* "one factor of …" MC: right option R, distractors that are not factors */
  function oneFactorMC(r, T, prompt, text) {
    for (var g = 0; g < 50; g++) {
      var R = r.chance(0.5) ? T.F1 : T.F2, O = R === T.F1 ? T.F2 : T.F1;
      var rc = PL.constant(R)[0], rl = PL.coef(R, { x: 1 })[0], oc = PL.constant(O)[0], ol = PL.coef(O, { x: 1 })[0];
      var k = T.hasG ? Math.abs(PL.terms(T.gm)[0].c[0]) : 1;
      var D = [lin(rl, -rc), lin(ol, -oc), k > 1 ? lin(k * rl, -k * rc) : lin(Math.abs(rc), (rc < 0 ? -1 : 1) * rl)];
      var all = [R].concat(D), okD = D.every(function (d) { return !isFactorOf(T.full, d); }) && all.every(function (x, i) { return all.every(function (y, j) { return i === j || !PL.eq(x, y); }); });
      if (okD) break;
    }
    var gcfNote = T.hasG ? 'Take out the common factor ' + t(tx(T.gm)) + ' first, then factor ' + t(T.innerTex) + '. ' : 'Factor it by decomposition first. ';
    var opts = [{ html: t(tx(R)), right: true },
      { html: t(tx(D[0])), why: gcfNote + 'Check the signs: the constants in the brackets must multiply to ' + t(T.c) + '.' },
      { html: t(tx(D[1])), why: gcfNote + 'Then check the sign of each constant term.' },
      { html: t(tx(D[2])), why: k > 1 ? t(tx(D[2]) + '=' + k + br(D[0])) + ', and ' + t(tx(D[0])) + ' is not a factor. ' + gcfNote : gcfNote + 'This bracket has its coefficients the wrong way round.' }];
    return mcPart(r, prompt, opts, (T.hasG ? 'Common factor first: ' + t(T.tex + '=' + gpre(T) + '(' + T.innerTex + ')') + '.<br>For ' + t(T.innerTex) + ': ' : '') + pairLine(T) + '<br>' + t(T.innerTex + '=' + splitTex(T) + '=' + groupTex(T) + '=' + br(T.F2) + br(T.F1)) + '<br>So ' + t(T.tex + '=' + T.key) + ', and ' + t(tx(R)) + ' is a factor.',
      [gcfNote + 'Then compare with the options.'], text);
  }

  HW.defineLesson({
    id: 'u4l4', unit: 4, num: '4', title: 'Factoring ax² + bx + c (where a ≠ 1)', outcome: 'AN5',
    blurb: 'Algebra tiles, the area (box) model, and the method of decomposition — split the middle term with two integers whose product is ac and whose sum is b, then group.',
    questions: [
      { num: '1', section: 'Part A — Tiles, Area Boxes and Grouping', stem: function (sh) {
          return 'Use algebra tiles to factor ' + t(sh.T.tex) + '.' + HW.tiles.legend() + '<div class="fig">' + HW.tiles.row(HW.tiles.count({ x2: sh.T.a, x: sh.T.b, one: sh.T.c }), { label: sh.T.a + ' x-squared tiles, ' + sh.T.b + ' x tiles and ' + sh.T.c + ' unit tiles' }) + '</div>';
        },
        shared: function (r) { return { T: tri(r, { p: [2, 5], q: [1, 3], r: 1, s: [1, 3], test: function (o) { return o.b <= 16 && o.c <= 6; }, book: { p: 5, q: 1, r: 1, s: 2 } }) }; },
        parts: [
          { id: '1a', level: 'EMG', make: function (r, sh) {
            var T = sh.T, labels = ['Length', 'Width'];
            var p = fieldsPart('Arrange the tiles into a rectangle. State its length and width (in either order).', [pbox('Length'), pbox('Width')],
              twoPolyCheck(T.F1, T.F2, labels, function (P1, P2) { return wrong('value', 'Those multiply to ' + t(tx(PL.mul(P1, P2))) + ', not ' + t(T.tex) + '. Put the ' + T.a + ' ' + t('x^{2}') + '-tiles in a row, then use <b>all</b> ' + T.b + ' ' + t('x') + '-tiles along the side and the bottom so the unit tiles fill the corner.'); }),
              [tx(T.F1), tx(T.F2)], t(tx(T.F1)) + ' by ' + t(tx(T.F2)),
              'Put the ' + T.a + ' ' + t('x^{2}') + '-tiles in a row. Under them go ' + T.s + ' row' + (T.s > 1 ? 's' : '') + ' of ' + T.p + ' flat ' + t('x') + '-tiles (' + T.a * T.s + ' tiles); ' + T.q + ' more ' + t('x') + '-tile' + (T.q > 1 ? 's stand' : ' stands') + ' up at the right end; the ' + T.c + ' unit tile' + (T.c > 1 ? 's fill' : ' fills') + ' the corner:' + tileFrame(T) + 'Length ' + t(tx(T.F1)) + ' (across), width ' + t(tx(T.F2)) + ' (down).',
              ['The ' + T.a + ' ' + t('x^{2}') + '-tiles go side by side, so the rectangle is ' + t(T.a + 'x+\\ldots') + ' long.', 'The unit tiles fill the bottom-right corner: their rows times columns must be ' + T.c + '.'], 'tile rectangle ' + T.tex);
            p.bad = [[tx(T.F1), 'x']]; if (!PL.eq(PL.mul(lin(T.p, T.s), lin(T.r, T.q)), T.full)) p.bad.push([tx(lin(T.p, T.s)), tx(lin(T.r, T.q))]);
            return p;
          } },
          { id: '1b', level: 'BEG', make: function (r, sh) {
            var T = sh.T;
            return factorPart(T, { prompt: 'Write ' + t(T.tex) + ' in factored form.', sol: 'The rectangle is ' + t(tx(T.F1)) + ' by ' + t(tx(T.F2)) + ', so ' + t(T.tex + '=' + FX.tex([T.F1, T.F2])) + '.<br>Check: ' + t(FX.tex([T.F1, T.F2]) + '=' + PL.seq([M(T.a, { x: 2 }), M(T.m, { x: 1 }), M(T.n, { x: 1 }), N(T.c)]) + '=' + T.tex) + ' ✓',
              hints: ['Length × width of the tile rectangle.'], text: 'tiles factored ' + T.tex });
          } }] },
      { num: '2', stem: 'Complete an area box for each trinomial, then write it in factored form. The top-left box holds ' + t('ax^{2}') + ', the bottom-right box holds ' + t('c') + ', and the two middle boxes split ' + t('bx') + ' into two pieces that multiply to ' + t('ac\\,x^{2}') + '.',
        shared: function (r) {
          return {
            A: tri(r, { p: [2, 3], q: [1, 5], r: 1, s: [1, 6], test: function (o) { return o.c >= 4 && o.c <= 20 && o.b <= 15; }, book: { p: 2, q: 3, r: 1, s: 4 } }),
            B: tri(r, { p: [2, 4], q: [-5, -1], r: [2, 3], s: [1, 5], test: function (o) { return o.b > 0 && o.b <= 5 && Math.abs(o.c) <= 20; }, book: { p: 3, q: -4, r: 2, s: 3 } }),
            C: tri(r, { p: [2, 3], q: [-5, -1], r: [2, 3], s: [-5, -1], test: function (o) { return o.a >= 4 && o.c <= 15; }, book: { p: 2, q: -3, r: 2, s: -1 } })
          };
        },
        parts: ['A', 'B', 'C'].reduce(function (acc, X, i) {
          var L = 'abc'.charAt(i), lv = [['BEG', 'BEG'], ['EMG', 'PRG'], ['EMG', 'EMG']][i];
          acc.push({ id: '2' + L + '1', sub: L + ' i', level: lv[0], make: function (r, sh) {
            var T = sh[X];
            var p = fieldsPart(t(T.tex) + ' — what goes in the two empty boxes?' + boxFig(T), [pbox('Top-right box'), pbox('Bottom-left box')], middleCheck(T, ['Top-right box', 'Bottom-left box']),
              [tx(M(T.m, { x: 1 })), tx(M(T.n, { x: 1 }))], t(tx(M(T.m, { x: 1 }))) + ' and ' + t(tx(M(T.n, { x: 1 }))) + ' (either way round)', boxSol(T),
              ['The two middle boxes multiply to the product of the corners, ' + t(tx(M(T.a, { x: 2 })) + '\\times ' + pn(T.c) + '=' + tx(M(T.ac, { x: 2 }))) + ', and add to ' + t(tx(M(T.b, { x: 1 }))) + '.'], 'area box cells ' + T.tex);
            p.bad = [[String(T.m), String(T.n)], [tx(M(-T.m, { x: 1 })), tx(M(-T.n, { x: 1 }))]];
            return p;
          } });
          acc.push({ id: '2' + L + '2', sub: L + ' ii', level: lv[1], make: function (r, sh) {
            var T = sh[X];
            return factorPart(T, { prompt: 'Write ' + t(T.tex) + ' in factored form.', sol: boxSol(T), hints: ['Take the GCF of each row and each column of your box. Choose each row’s sign so the columns agree.'], text: 'area box factored ' + T.tex });
          } });
          return acc;
        }, []) },
      { num: '3', stem: 'Factor the following polynomials by grouping, and verify by expanding.', parts: [
        { id: '3a', level: 'BEG', make: function (r) { return groupPart(tri(r, { p: [2, 5], q: [1, 7], r: [2, 5], s: [1, 5], test: function (o) { return o.a <= 25 && o.c <= 25; }, book: { p: 2, q: 5, r: 2, s: 1 } })); } },
        { id: '3b', level: 'EMG', make: function (r) { return groupPart(tri(r, { p: [2, 5], q: [-5, -1], r: [2, 5], s: [1, 5], test: function (o) { return o.a <= 25 && Math.abs(o.c) <= 25; }, book: { p: 3, q: -2, r: 5, s: 2 } })); } }] },
      { num: '4', stem: function (sh) { return '<i>(Explain)</i> This question shows why the decomposition pair must multiply to ' + t('ac') + '. Use the product ' + t(br(sh.T.F1) + br(sh.T.F2)) + '.'; },
        shared: function (r) { return { T: tri(r, { p: [2, 4], q: [1, 7], r: [2, 5], s: [-5, -1], book: { p: 2, q: 5, r: 3, s: -1 } }) }; },
        parts: [
          { id: '4a', level: 'BEG', make: function (r, sh) {
            var T = sh.T, lb = ['First middle term', 'Second middle term'];
            var p = fieldsPart('(a) Expand ' + t(br(T.F1) + br(T.F2)) + ' <b>without</b> collecting the two middle terms: ' + t(tx(M(T.a, { x: 2 })) + '+\\square+\\square' + sg(T.c)) + '. What are the two middle terms?', [pbox(lb[0]), pbox(lb[1])], middleCheck(T, lb, 'expand'),
              [tx(M(T.m, { x: 1 })), tx(M(T.n, { x: 1 }))], t(br(T.F1) + br(T.F2) + '=' + splitTex(T)),
              'Outside: ' + t(tx(M(T.p, { x: 1 })) + '\\cdot ' + pn(T.s) + '=' + tx(M(T.m, { x: 1 }))) + '. Inside: ' + t(pn(T.q) + '\\cdot ' + tx(M(T.r, { x: 1 })) + '=' + tx(M(T.n, { x: 1 }))) + '.<br>' + t(br(T.F1) + br(T.F2) + '=' + splitTex(T)) + ' ' + t('(=' + T.innerTex + ')') + '.',
              ['FOIL: the middle terms are the <b>outside</b> product and the <b>inside</b> product.'], 'uncollected expansion');
            p.bad = [[tx(M(T.b, { x: 1 })), '0'], [tx(M(-T.m, { x: 1 })), tx(M(-T.n, { x: 1 }))]];
            return p;
          } },
          { id: '4b', level: 'BEG', make: function (r, sh) {
            var T = sh.T, lb = ['Product of the two middle coefficients', 'Value of ' + t('ac')];
            var chk = function (resp) {
              resp = resp || [];
              var A = readInt(resp[0]), C = readInt(resp[1]);
              if (A.res) return lab(A.res, 'Product'); if (C.res) return lab(C.res, t('ac'));
              if (A.bad || C.bad) return wrong('value', 'Both answers are integers.');
              if (A.v !== T.m * T.n) return wrong(A.v === T.m + T.n ? 'ax-sum-not-product' : 'value', '<b>Product:</b> ' + (A.v === T.m + T.n ? 'that’s the sum. Multiply the two coefficients: ' + t(pn(T.m) + '\\times ' + pn(T.n)) + '.' : 'multiply the coefficients of your two middle terms, ' + t(T.m) + ' and ' + t(T.n) + '.'));
              if (C.v !== T.ac) return wrong('ax-ac-wrong', '<b>' + t('ac') + ':</b> for ' + t(T.innerTex) + ', ' + t('a=' + T.a) + ' and ' + t('c=' + T.c) + '.');
              return ok();
            };
            var p = fieldsPart('(b) The trinomial is ' + t(T.innerTex) + '. Show that the two middle coefficients multiply to ' + t('ac') + '.', [nbox(lb[0]), nbox(lb[1])], chk, [String(T.m * T.n), String(T.ac)], t(pn(T.m) + '\\times ' + pn(T.n) + '=' + T.ac) + ' and ' + t('ac=' + T.a + '(' + T.c + ')=' + T.ac),
              t('(' + T.m + ')(' + T.n + ')=' + T.m * T.n) + ' and ' + t('ac=' + T.a + '(' + T.c + ')=' + T.ac) + ' ✓ — they are equal. (The middle coefficients also add to ' + t('b=' + T.b) + '.)', ['Multiply the two numbers in front of the middle terms from (a). Then multiply the first and last coefficients.'], 'middle product = ac');
            p.bad = [[String(T.m + T.n), String(T.ac)], [String(T.ac), String(T.a + T.c)]];
            return p;
          } },
          { id: '4c', level: 'PRG', make: function (r, sh) {
            var T = sh.T;
            return mcPart(r, '(c) Why must the decomposition pair of <b>any</b> factorable ' + t('ax^{2}+bx+c') + ' have product ' + t('ac') + '?', [
              { html: 'Expanding ' + t('(px+q)(rx+s)') + ' gives ' + t('prx^{2}+psx+qrx+qs') + ', so ' + t('a=pr') + ', ' + t('c=qs') + ', and the middle pieces multiply to ' + t('(ps)(qr)=(pr)(qs)=ac') + '.', right: true },
              { html: 'Because the two middle pieces always <b>add</b> to ' + t('ac') + '.', why: 'The middle pieces add to ' + t('b') + ' (here ' + t(T.m + '+' + pn(T.n) + '=' + T.b) + '). Look at what they <b>multiply</b> to.' },
              { html: 'Because the two middle coefficients are always ' + t('a') + ' and ' + t('c') + '.', why: 'In part (a) the middle coefficients were ' + t(T.m) + ' and ' + t(T.n) + ', not ' + t(T.a) + ' and ' + t(T.c) + '. Their <b>product</b> equals ' + t('ac') + '.' },
              { html: 'It only happens for this example; usually the pair multiplies to ' + t('c') + '.', why: 'Multiplying to ' + t('c') + ' is the ' + t('a=1') + ' rule. The argument with ' + t('(px+q)(rx+s)') + ' works for every factorable trinomial.' }],
              t('(px+q)(rx+s)=prx^{2}+psx+qrx+qs') + '. Here ' + t('a=pr') + ', ' + t('b=ps+qr') + ' and ' + t('c=qs') + '. The two middle pieces multiply to ' + t('(ps)(qr)=(pr)(qs)=ac') + ' and add to ' + t('b') + ' — for every factorable trinomial.', ['Write the general product ' + t('(px+q)(rx+s)') + ' without collecting, and compare the middle coefficients with ' + t('a') + ' and ' + t('c') + '.'], 'why ac');
          } }] },
      { num: '5', section: 'Part B — The Method of Decomposition', stem: 'Factor using the method of decomposition.', parts: [
        { id: '5a', level: 'EMG', make: function (r) { return factorPart(tri(r, { p: [2, 4], q: [1, 5], r: [2, 5], s: [1, 5], test: function (o) { return o.a >= 6 && o.ac <= 120; }, book: { p: 2, q: 3, r: 4, s: 3 } })); } },
        { id: '5b', level: 'EMG', make: function (r) { return factorPart(tri(r, { p: [2, 3], q: [1, 4], r: [2, 3], s: [1, 4], test: function (o) { return o.ac <= 40; }, book: { p: 3, q: 2, r: 2, s: 1 } })); } },
        { id: '5c', level: 'PRG', make: function (r) { return factorPart(tri(r, { p: [2, 5], q: [-5, -1], r: [2, 5], s: [1, 5], test: function (o) { return o.b > 0 && o.ac >= -60; }, book: { p: 5, q: -1, r: 2, s: 3 } })); } },
        { id: '5d', level: 'PRG', make: function (r) { return factorPart(tri(r, { p: [2, 5], q: [1, 5], r: [2, 5], s: [-5, -1], test: function (o) { return o.b < 0 && o.ac >= -60; }, book: { p: 4, q: 1, r: 2, s: -3 } }, { v: 'a' })); } }] },
      { num: '6', stem: 'Factor.', parts: [
        { id: '6a', level: 'PRG', make: function (r) { return factorPart(tri(r, { p: [2, 4], q: [-5, -1], r: [2, 4], s: [1, 5], test: function (o) { return o.b > 0 && o.ac >= -40; }, book: { p: 2, q: -1, r: 2, s: 3 } }, { v: 'a' })); } },
        { id: '6b', level: 'PRG', make: function (r) { return factorPart(tri(r, { p: [2, 3], q: [1, 9], r: [2, 3], s: [-9, -1], test: function (o) { return o.b <= -10 && o.c >= -15; }, book: { p: 3, q: 1, r: 2, s: -7 } })); } },
        { id: '6c', level: 'EMG', make: function (r) { return factorPart(tri(r, { p: { of: [2, 3, 5, 7] }, q: [-5, -1], r: 1, s: [-7, -1], test: function (o) { return o.b <= -6 && o.c <= 25; }, book: { p: 3, q: -1, r: 1, s: -5 } }, { v: 'p' })); } },
        { id: '6d', level: 'PRG', make: function (r) { return factorPart(tri(r, { p: [2, 5], q: [-5, -1], r: [2, 5], s: [-5, -1], test: function (o) { return o.a >= 6 && o.ac <= 60; }, book: { p: 4, q: -1, r: 2, s: -3 } })); } }] },
      { num: '7', stem: 'Factor. <i>(Watch for a leading negative term, and for a common factor.)</i>', parts: [
        { id: '7a', level: 'EMG', make: function (r) { return factorPart(tri(r, { p: [2, 5], q: [1, 5], r: [2, 5], s: [1, 5], test: function (o) { return o.a >= 6 && o.ac <= 120; }, book: { p: 2, q: 3, r: 5, s: 3 } }, { v: 'y' }), { asc: true }); } },
        { id: '7b', level: 'PRG', make: function (r) { return factorPart(tri(r, { p: [1, 3], q: [1, 5], r: [2, 7], s: [-9, -1], test: function (o) { return o.b > 0 && o.a >= 4 && Math.abs(o.c) <= 20; }, book: { p: 1, q: 2, r: 6, s: -7 } }, { k: -1 }), { asc: true }); } },
        { id: '7c', level: 'PRG', make: function (r) { return factorPart(tri(r, { p: [2, 5], q: [-5, -1], r: [2, 5], s: [1, 5], test: function (o) { return o.b < 0 && o.a >= 10; }, book: { p: 4, q: -3, r: 5, s: 2 } }, { k: -1, v: 'a' }), { asc: true }); } },
        { id: '7d', level: 'PRG', make: function (r) { return factorPart(tri(r, { p: [1, 3], q: [1, 5], r: [2, 3], s: [-5, -1], test: function (o) { return o.b > 0; }, book: { p: 2, q: 5, r: 2, s: -1 } }, { k: r.int(2, 5), v: 'a' })); } }] },
      { num: '8', stem: 'Factor. The method is unchanged — the split pieces each carry both variables.', parts: [
        { id: '8a', level: 'EMG', make: function (r) { return factorPart(tri(r, { p: [2, 4], q: [1, 3], r: [2, 4], s: [1, 3], book: { p: 2, q: 1, r: 3, s: 2 } }, { v: 'x', w: 'y' })); } },
        { id: '8b', level: 'PRG', make: function (r) { return factorPart(tri(r, { p: [2, 3], q: [1, 5], r: [2, 3], s: [-7, -1], test: function (o) { return o.b < 0; }, book: { p: 2, q: 3, r: 2, s: -5 } }, { v: 'm', w: 'n' })); } }] },
      { num: '9', stem: 'Factor completely. Use a systematic factor-pair list (divide on the calculator) when ' + t('ac') + ' is large.',
        shared: function (r) { return { T: tri(r, { p: [2, 6], q: [-9, -1], r: [2, 6], s: [1, 9], test: function (o) { return o.b < 0 && o.b >= -11 && o.ac <= -90; }, book: { p: 3, q: -4, r: 4, s: 3 } }) }; },
        parts: [
          { id: '9a', sub: 'a', level: 'PRG', make: function (r, sh) { return factorPart(sh.T); } },
          { id: '9a2', sub: 'a check', level: 'BEG', make: function (r, sh) {
            var T = sh.T, v2 = PL.at(T.full, { x: 2 }), f1 = PL.at(T.F2, { x: 2 }), f2 = PL.at(T.F1, { x: 2 });
            return B.number('Verify (a): substitute ' + t('x=2') + ' into ' + t(T.tex) + ' and into your factored form. What value do both give?', v2, function (v) {
              if (v === PL.at(T.full, { x: -2 })) return { code: 'value', hint: 'Substitute ' + t('x=2') + ', not ' + t('x=-2') + '.' };
              if (v === f1 || v === f2) return { code: 'value', hint: 'That is the value of just one bracket. Multiply the two brackets’ values.' };
              return null;
            }, 'Trinomial: ' + t(T.a + '(4)' + sg(T.b) + '(2)' + sg(T.c) + '=' + v2) + '. Factored: ' + t(br(T.F2) + br(T.F1)) + ' at ' + t('x=2') + ' is ' + t('(' + f1 + ')(' + f2 + ')=' + v2) + ' ✓',
            ['Work out ' + t(T.tex) + ' with ' + t('x=2') + ' (square first, then multiply).'], 'check at x=2');
          } },
          { id: '9b', sub: 'b', level: 'PRG', make: function (r) { return factorPart(tri(r, { p: [2, 6], q: [-9, -1], r: [2, 6], s: [1, 9], test: function (o) { return o.b < 0 && o.b >= -5 && o.ac <= -60 && o.ac >= -200; }, book: { p: 3, q: -5, r: 2, s: 3 } })); } },
          { id: '9c', sub: 'c', level: 'PRG', make: function (r) { return factorPart(tri(r, { p: [2, 4], q: [1, 4], r: [2, 4], s: [-4, -1], test: function (o) { return o.b > 0 && o.ac >= -30; }, book: { p: 3, q: 2, r: 2, s: -1 } }, { k: r.int(2, 5) })); } },
          { id: '9d', sub: 'd', level: 'PRG', make: function (r) { return factorPart(tri(r, { p: [2, 6], q: [-9, -1], r: [2, 6], s: [1, 9], test: function (o) { return o.b < 0 && o.ac >= -100 && o.ac <= -40; }, book: { p: 2, q: -3, r: 5, s: 2 } })); } },
          { id: '9e', sub: 'e', level: 'PRG', make: function (r) { return factorPart(tri(r, { p: [2, 8], q: [1, 9], r: [2, 8], s: [-9, -1], test: function (o) { return o.b > 0 && o.b <= 5 && o.ac <= -200; }, book: { p: 6, q: 5, r: 4, s: -3 } })); } },
          { id: '9f', sub: 'f', level: 'PRG', make: function (r) { return factorPart(tri(r, { p: [2, 8], q: [1, 9], r: [2, 8], s: [-9, -1], test: function (o) { return o.b < 0 && o.b >= -3 && o.ac <= -150; }, book: { p: 4, q: 3, r: 5, s: -4 } })); } },
          { id: '9g', sub: 'g', level: 'PRG', make: function (r) { return factorPart(tri(r, { p: [2, 6], q: [-9, -1], r: [2, 6], s: [1, 9], test: function (o) { return o.b < 0 && o.ac <= -80; }, book: { p: 2, q: -5, r: 4, s: 3 } }, { k: -1 })); } },
          { id: '9h', sub: 'h', level: 'PRG', make: function (r) { return factorPart(tri(r, { p: [2, 9], q: [1, 9], r: [2, 9], s: [-9, -1], test: function (o) { return o.b > 0 && o.b <= 9 && o.ac <= -400; }, book: { p: 9, q: 8, r: 4, s: -3 } })); } }] },
      { num: '10', stem: 'Identify the error in each factorization. Then write the correct factored form.',
        shared: function (r) {
          return {
            A: tri(r, { p: { of: [2, 3, 5, 7] }, q: [-3, 3], r: 1, s: [-5, 5], test: function (o) { return o.c < 0 && Math.abs(o.c) <= 12; }, book: { p: 3, q: 1, r: 1, s: -2 } }),
            B: tri(r, { p: [2, 3], q: [1, 5], r: [1, 2], s: [1, 4], test: function (o) { return o.c <= 15; }, book: { p: 2, q: 3, r: 1, s: 1 } }, { k: r.pick([2, 2, 3]) }),
            C: tri(r, { p: [2, 5], q: [-5, -1], r: [2, 4], s: [1, 4], test: function (o) { return o.a <= 20 && o.m !== -o.n; }, book: { p: 4, q: -3, r: 2, s: 1 } })
          };
        },
        parts: [
          { id: '10a1', sub: 'a error', level: 'EMG', make: function (r, sh) {
            var T = sh.A, stu = [lin(T.p, -T.q), lin(T.r, -T.s)], sp = mulAll(stu), sw = mulAll([lin(T.p, -T.s), lin(T.r, -T.q)]);
            var opts = [{ html: 'The signs in the brackets are switched: ' + t(FX.tex(stu)) + ' expands to ' + t(tx(sp)) + ', so the middle term has the wrong sign.', right: true },
              { html: 'There is no error — it expands to ' + t(T.tex) + '.', why: 'Expand it: ' + t(FX.tex(stu) + '=' + tx(sp)) + '. Compare the middle term with ' + t(T.tex) + '.' },
              { html: t(T.tex) + ' cannot be factored, because ' + t('ac') + ' is negative.', why: 'A negative ' + t('ac') + ' only means the pair has opposite signs. Here ' + t('ac=' + T.ac) + ' and the pair ' + t(T.m) + ', ' + t(T.n) + ' works.' }];
            if (!PL.eq(sw, T.full) && !PL.eq(sw, sp)) opts.push({ html: 'The constants are in the wrong brackets; it should be ' + t(FX.tex([lin(T.p, -T.s), lin(T.r, -T.q)])) + '.', why: 'Expand that: ' + t(tx(sw)) + ' — not the trinomial either. Expand the student’s answer and compare the middle term.' });
            else opts.push({ html: 'The first terms are wrong: both brackets should start with ' + t(T.a + 'x') + '.', why: t(T.a + 'x\\cdot ' + T.a + 'x=' + T.a * T.a + 'x^{2}') + ' is too big. The first terms ' + t(T.p + 'x\\cdot x=' + T.a + 'x^{2}') + ' are fine — expand and compare the middle term.' });
            return mcPart(r, 'A student wrote ' + t(T.tex + '=' + FX.tex(stu)) + '. What is the error?', opts,
              t(FX.tex(stu) + '=' + tx(sp)) + ': the ' + t('x') + '-term has the wrong sign. For ' + t('ac=' + T.ac) + ' and sum ' + t(T.b) + ' the pair is ' + t(T.m) + ' and ' + t(T.n) + ', which switches both signs: ' + t(T.tex + '=' + FX.tex([T.F1, T.F2])) + '.',
              ['Expand the student’s answer and compare it, term by term, with ' + t(T.tex) + '.'], 'error: switched signs');
          } },
          { id: '10a2', sub: 'a fix', level: 'PRG', make: function (r, sh) { return factorPart(sh.A, { prompt: 'Write the correct factored form of ' + t(sh.A.tex) + '.' }); } },
          { id: '10b1', sub: 'b error', level: 'EMG', make: function (r, sh) {
            var T = sh.B, k = PL.terms(T.gm)[0].c[0], kF = PL.scale(T.F1, k), stu = '(' + tx(kF) + ')' + br(T.F2), o3 = mulAll([lin(k * T.p, T.s), lin(T.r, k * T.q)]);
            var opts = [{ html: t(tx(kF)) + ' still has a common factor of ' + t(k) + ', so it is not factored completely.', right: true },
              { html: 'It expands to the wrong trinomial.', why: 'Expand it: ' + t(stu + '=' + T.tex) + ' — it is equal. The problem is something else.' },
              { html: 'Nothing — it is fully factored, because both brackets are binomials.', why: 'A binomial can still have a common factor: ' + t(tx(kF) + '=' + k + br(T.F1)) + '.' }];
            if (!PL.eq(o3, T.full)) opts.push({ html: 'The constants are in the wrong brackets; it should be ' + t(FX.tex([lin(k * T.p, T.s), lin(T.r, k * T.q)])) + '.', why: 'Expand that: ' + t(tx(o3)) + ' — not equal. The student’s product <i>is</i> equal; look for a factor that can still come out.' });
            else opts.push({ html: 'The ' + t('x^{2}') + '-term should come from ' + t(k + 'x') + ' in both brackets.', why: 'The product is already equal to the trinomial. Look for a common factor left inside a bracket.' });
            return mcPart(r, 'A student wrote ' + t(T.tex + '=' + stu) + ', “fully factored”. What is the error?', opts,
              'It expands correctly, but ' + t(tx(kF) + '=' + k + br(T.F1)) + ': the common factor ' + t(k) + ' should have come out first. Correct: ' + t(T.tex + '=' + k + br(T.F1) + br(T.F2)) + '.',
              ['Is the answer equal to the trinomial? Then check whether each bracket still has a common factor.'], 'error: GCF inside');
          } },
          { id: '10b2', sub: 'b fix', level: 'EMG', make: function (r, sh) {
            var T = sh.B, k = PL.terms(T.gm)[0].c[0];
            return factorPart(T, { prompt: 'Write ' + t(T.tex) + ' in fully factored form.', sol: 'Take out the GCF ' + t(k) + ' first: ' + t(T.tex + '=' + k + '(' + T.innerTex + ')') + '.<br>' + pairLine(T) + '<br>' + t(T.innerTex + '=' + splitTex(T) + '=' + groupTex(T) + '=' + br(T.F2) + br(T.F1)) + '<br>So ' + t(T.tex + '=' + T.key) + '.', bad: ['(' + tx(PL.scale(T.F1, k)) + ')' + br(T.F2)] });
          } },
          { id: '10c1', sub: 'c error', level: 'PRG', make: function (r, sh) {
            var T = sh.C, wrongB = lin(T.r, -T.s), g2 = tx(N(T.q)), stuG = tx(M(T.p, { x: 1 })) + br(T.F2) + g2 + br(wrongB), seg = PL.seq([M(T.n, { x: 1 }), N(T.c)]);
            var opts = [{ html: 'A sign error: ' + t(seg + '=' + g2 + br(T.F2)) + ', not ' + t(g2 + br(wrongB)) + '. The brackets do match, so it factors.', right: true },
              { html: 'The pair ' + t(T.m) + ' and ' + t(T.n) + ' is wrong.', why: 'Check it: ' + t(pn(T.m) + '\\times ' + pn(T.n) + '=' + T.ac + '=ac') + ' and ' + t(T.m + '+' + pn(T.n) + '=' + T.b + '=b') + '. The pair is right.' },
              { html: 'Nothing — the brackets don’t match, so the trinomial does not factor.', why: 'When the pair is right, the brackets <b>must</b> match. Expand ' + t(g2 + br(wrongB)) + ' and compare it with ' + t(seg) + '.' },
              { html: 'The middle term was split in the wrong order; it should be ' + t(PL.seq([M(T.a, { x: 2 }), M(T.n, { x: 1 }), M(T.m, { x: 1 }), N(T.c)])) + '.', why: 'Either order works when the pair is right. Expand ' + t(g2 + br(wrongB)) + ' — does it give ' + t(seg) + '?' }];
            return mcPart(r, 'A student wrote ' + t(T.tex + '=' + splitTex(T) + '=' + stuG) + ', “so it does not factor.” What is the error?', opts,
              t(g2 + br(wrongB) + '=' + tx(PL.mul(N(T.q), wrongB))) + ', not ' + t(seg) + '. The second group is ' + t(seg + '=' + g2 + br(T.F2)) + ', so the brackets match: ' + t(T.tex + '=' + groupTex(T) + '=' + br(T.F2) + br(T.F1)) + '.',
              ['Expand each group of the student’s work and compare it with the four terms.'], 'error: sign in second group');
          } },
          { id: '10c2', sub: 'c fix', level: 'EMG', make: function (r, sh) { return factorPart(sh.C, { prompt: 'Write the correct factored form of ' + t(sh.C.tex) + '.' }); } }] },
      { num: '11', section: 'Part C — Problem Solving', stem: function (sh) { return 'A rectangular flower bed has area ' + t('(' + sh.T.tex + ')\\ \\text{m}^{2}') + '.'; },
        shared: function (r) { return { T: tri(r, { p: 1, q: [1, 5], r: [2, 5], s: [-4, -1], test: function (o) { return o.s > -o.r && o.b > 0; }, book: { p: 1, q: 2, r: 3, s: -1 } }, { v: 'a' }), w: r.pick([1, 1, 2]), d: r.pick([10, 10, 15, 20]), A: r.int(4, 10) }; },
        parts: [
          { id: '11a', level: 'EMG', make: function (r, sh) { var p = factorPart(sh.T, { prompt: '(a) Write the area as the product of two binomials.' }); p.solution += '<br>The bed is ' + t(br(sh.T.F1)) + ' m by ' + t(br(sh.T.F2)) + ' m.'; return p; } },
          { id: '11b', level: 'PRG', make: function (r, sh) {
            var T = sh.T, w = sh.w, Lo = PL.add(T.F1, N(2 * w)), Wo = PL.add(T.F2, N(2 * w)), outer = PL.mul(Lo, Wo), path = PL.sub(outer, T.inner);
            var wr = [{ is: outer, code: 'ax-outer', hint: 'That is the area of the bed <b>and</b> the path together. Subtract the bed’s area.' },
              { is: PL.sub(PL.mul(PL.add(T.F1, N(w)), PL.add(T.F2, N(w))), T.inner), code: 'ax-one-side', hint: 'The path goes along <b>both</b> sides, so each dimension grows by ' + t(2 * w) + ' m, not ' + t(w) + ' m.' },
              { is: PL.sub(PL.add(outer, T.inner), PL.scale(M(T.a, { a: 2 }), 2)), code: 'ax-minus-first', hint: 'When you subtract ' + t('(' + T.innerTex + ')') + ', change the sign of <b>every</b> term in the bracket.' }].filter(function (x) { return !PL.eq(x.is, path); });
            return B.poly('(b) The bed is to be completely surrounded by a path ' + w + ' m wide. Find and simplify an expression for the area of the path.', path, { wrong: wr, after: t('\\text{ m}^{2}') },
              'A ' + w + ' m path adds ' + w + ' m at each end, so each dimension grows by ' + t(2 * w) + ':<br>outer ' + t('=' + br(Lo) + br(Wo) + '=' + tx(outer)) + '<br>path ' + t('=(' + tx(outer) + ')-(' + T.innerTex + ')=' + tx(path)) + ' m².',
              ['Path = (bed + path) − bed. Each dimension of the outer rectangle is ' + t(2 * w) + ' m longer than the bed.'], 'path area');
          } },
          { id: '11c', level: 'EMG', make: function (r, sh) {
            var T = sh.T, w = sh.w, path = PL.sub(PL.mul(PL.add(T.F1, N(2 * w)), PL.add(T.F2, N(2 * w))), T.inner), A = sh.A, area = PL.at(path, { a: A }), d = sh.d, vol = area * d / 100;
            var bed = PL.at(T.inner, { a: A }), out = area + bed;
            return B.number('(c) The path is poured concrete to a depth of ' + d + ' cm. Calculate the volume of concrete used if ' + t('a=' + A) + '.', vol, function (v) {
              if (Math.abs(v - area * d) < 1e-9) return { code: 'ax-cm', hint: 'Convert the depth to metres first: ' + t(d + '\\text{ cm}=' + (d / 100) + '\\text{ m}') + '.' };
              if (Math.abs(v - bed * d / 100) < 1e-9) return { code: 'ax-bed-area', hint: 'That uses the area of the <b>bed</b>. The concrete is the path: use your answer to (b).' };
              if (Math.abs(v - out * d / 100) < 1e-9) return { code: 'ax-outer-area', hint: 'That uses the outer rectangle. The concrete covers only the path.' };
              if (Math.abs(v - area) < 1e-9) return { code: 'value', hint: 'That is the area of the path. Multiply by the depth (in metres) to get the volume.' };
              return null;
            }, 'Depth ' + t(d + '\\text{ cm}=' + (d / 100) + '\\text{ m}') + '. At ' + t('a=' + A) + ' the path’s area is ' + t(tx(path).replace(/a/g, '(' + A + ')') + '=' + area) + ' m².<br>Volume ' + t('=' + area + '\\times ' + (d / 100) + '=' + vol) + ' m³.',
            ['Volume = area of the path × depth. Change the depth to metres.'], 'concrete volume', { after: t('\\text{ m}^{3}') });
          } }] },
      { num: '12', stem: function (sh) { return 'A tank in the shape of a rectangular prism has dimensions ' + t(sh.k + 'x') + ', ' + t(tx(sh.G)) + ' and ' + t(tx(sh.H)) + ' metres. A wooden block is dropped into the tank and the tank is then filled with water. The volume of water is ' + t(tx(sh.water)) + ' cubic metres.' + tankSvg(sh.k + 'x', plain(sh.G), plain(sh.H)); },
        shared: function (r) {
          var o = { p: 2, q: 1, u: 4, v: 1, k: 3, rr: 4, s: 3 };
          for (var i = 0; i < 500; i++) {
            var c = { p: r.int(2, 3), q: r.int(1, 3), u: r.int(2, 5), v: r.int(1, 3), k: r.int(2, 4), rr: r.int(2, 5), s: r.int(1, 4) };
            if (gcd(c.p, c.q) !== 1 || gcd(c.u, c.v) !== 1 || gcd(c.rr, c.s) !== 1 || (c.u === c.p && c.v === c.q) || (c.rr === c.u && c.s === c.v) || (c.rr === c.p && c.s === c.q)) continue;
            if (c.k * c.rr - c.u <= 0 || c.k * c.s - c.v <= 0 || c.p * c.u < 4) continue;
            o = c; break;
          }
          var G = lin(o.p, o.q), H = lin(o.rr, o.s), U = lin(o.u, o.v), X = M(1, { x: 1 });
          var tank = mulAll([M(o.k, { x: 1 }), G, H]), block = mulAll([X, G, U]);
          return { k: o.k, G: G, H: H, U: U, tank: tank, block: block, water: PL.sub(tank, block), T: Tri({ p: o.p, q: o.q, r: o.u, s: o.v, k: 1, gv: { x: 1 } }) };
        },
        parts: [
          { id: '12a', level: 'PRG', make: function (r, sh) {
            var wr = [{ is: sh.tank, code: 'ax-tank', hint: 'That is the volume of the whole tank. The block is what is left after you subtract the water.' },
              { is: PL.add(sh.tank, sh.water), code: 'ax-added', hint: 'The block takes up the space the water doesn’t: <b>subtract</b> the water from the tank.' },
              { is: sh.water, code: 'ax-water', hint: 'That is the water. Find the tank’s volume first, then subtract the water.' }];
            return B.poly('(a) Determine a polynomial expression for the volume of the wooden block.', sh.block, { wrong: wr },
              'Tank ' + t('=' + sh.k + 'x' + br(sh.G) + br(sh.H) + '=' + sh.k + 'x(' + tx(PL.mul(sh.G, sh.H)) + ')=' + tx(sh.tank)) + '.<br>Block = tank − water ' + t('=(' + tx(sh.tank) + ')-(' + tx(sh.water) + ')=' + tx(sh.block)) + '.',
              ['Volume of the tank = product of its three dimensions. The block fills the part the water doesn’t.'], 'block volume');
          } },
          { id: '12b', level: 'PRG', make: function (r, sh) {
            var T = sh.T, p = factorPart(T, { prompt: '(b) Factor your expression from (a) completely to determine the dimensions of the wooden block.' });
            p.solution = 'Take out the common factor ' + t('x') + ': ' + t(tx(sh.block) + '=x(' + T.innerTex + ')') + '.<br>For ' + t(T.innerTex) + ': ' + pairLine(T) + '<br>' + t(T.innerTex + '=' + splitTex(T) + '=' + groupTex(T) + '=' + br(T.F2) + br(T.F1)) + '<br>So ' + t(tx(sh.block) + '=' + T.key) + ': the block is ' + t('x') + ' by ' + t(tx(T.F1)) + ' by ' + t(tx(T.F2)) + ' metres.';
            return p;
          } }] },
      { num: '13', section: 'Part D — Multiple Choice and Numerical Response', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '13', level: 'EMG', make: function (r) {
          var T = tri(r, { p: [2, 3], q: [-5, 5], r: [2, 3], s: [-5, 5], test: function (o) { return o.c < 0 && o.ac >= -36 && o.ac <= -6; }, book: { p: 2, q: 3, r: 3, s: -1 } }, { k: r.int(2, 4) });
          return oneFactorMC(r, T, 'One factor of ' + t(T.tex) + ' is', 'one factor with GCF');
        } }] },
      { num: '14', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '14', level: 'EMG', make: function (r) {
          var o = { p: 2, q: 3, r: 3, s: -1 };
          for (var i = 0; i < 400; i++) {
            var c = { p: r.int(2, 5), q: r.pick([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]), r: r.int(2, 4), s: r.pick([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]) };
            if (gcd(c.p, c.q) !== 1 || gcd(c.r, c.s) !== 1 || c.p * c.s + c.q * c.r === 0 || (c.r === c.p && Math.abs(c.s) === Math.abs(c.q)) || c.p * c.p * 1 > 25) continue;
            o = c; break;
          }
          var C = lin(o.p, o.q), D = lin(o.p, -o.q), R = lin(o.r, o.s), Rn = lin(o.r, -o.s), dos = PL.mul(C, D), tr = PL.mul(C, R);
          var Tq = Tri({ p: o.p, q: o.q, r: o.r, s: o.s });
          return mcPart(r, 'The polynomials ' + t(tx(tr)) + ' and ' + t(tx(dos)) + ' have in common a factor of', [
            { html: t(tx(C)), right: true },
            { html: t(tx(D)), why: 'That is a factor of ' + t(tx(dos)) + ', but not of ' + t(tx(tr)) + '. Factor the trinomial too.' },
            { html: t(tx(R)), why: 'That is a factor of the trinomial, but not of ' + t(tx(dos)) + ' (a difference of squares).' },
            { html: t(tx(Rn)), why: 'Factor both polynomials: ' + t(tx(Rn)) + ' is not a factor of either.' }],
            'Trinomial: ' + pairLine(Tq) + ' ' + t(tx(tr) + '=' + splitTex(Tq) + '=' + groupTex(Tq) + '=' + br(Tq.F2) + br(Tq.F1)) + '.<br>Difference of squares: ' + t(tx(dos) + '=' + br(D) + br(C)) + '.<br>The common factor is ' + t(tx(C)) + '.',
            ['Factor each polynomial completely, then look for the bracket that appears in both.'], 'common factor of trinomial and difference of squares');
        } }] },
      { num: '15', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '15', level: 'PRG', make: function (r) {
          var choices = [[2, -1], [3, -1], [3, -2], [4, -1], [4, -3], [5, -1], [5, -2], [5, -3], [6, -1], [7, -1], [7, -2]], o = null;
          for (var i = 0; i < 300; i++) { var bc = r.pick(choices), A = r.pick([-9, -8, -7, -6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7, 8, 9]); if (A * bc[0] + bc[1] === 0 || Math.abs(A * bc[0] + bc[1]) > 40) continue; o = { A: A, b: bc[0], c: bc[1] }; break; }
          if (!o) o = { A: 4, b: 5, c: -2 };
          var T = Tri({ p: 1, q: o.A, r: o.b, s: o.c }), x = Math.pow(o.b, o.c);
          return B.approx('The factored form of ' + t(T.tex) + ' is ' + t('(x+a)(bx+c)') + ', where ' + t('a') + ', ' + t('b') + ' and ' + t('c') + ' are integers. The value of ' + t('b^{c}') + ', to the nearest hundredth, is ________.', x, 2, { nr: true, diag: function (v) {
            if (Math.abs(v - K.roundTo(Math.pow(o.b, -o.c), 2)) < 1e-9) return { code: 'ax-neg-exp', hint: t('c') + ' is negative, so ' + t('b^{c}') + ' is a fraction: ' + t('b^{-n}=\\frac{1}{b^{n}}') + '.' };
            if (o.A > 0 && Math.abs(v - K.roundTo(Math.pow(o.A, o.c), 2)) < 1e-9) return { code: 'value', hint: t('b') + ' is the coefficient of ' + t('x') + ' in the <b>second</b> bracket, ' + t('(bx+c)') + '.' };
            return null;
          } }, pairLine(T) + '<br>' + t(T.tex + '=' + splitTex(T) + '=' + groupTex(T) + '=' + br(T.F1) + br(T.F2)) + '<br>So ' + t('a=' + o.A + ',\\ b=' + o.b + ',\\ c=' + o.c) + ' and ' + t('b^{c}=' + o.b + '^{' + o.c + '}=\\frac{1}{' + Math.pow(o.b, -o.c) + '}\\approx ' + K.roundTo(x, 2).toFixed(2)) + '.',
          ['Factor by decomposition, then match your answer to ' + t('(x+a)(bx+c)') + '.', 'A negative exponent means a reciprocal: ' + t('b^{-n}=\\frac{1}{b^{n}}') + '.'], 'b^c from (x+a)(bx+c)');
        } }] },
      { num: '16', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '16', level: 'PRG', make: function (r) {
          var o = { A: 4, B: 5, C: 3, D: 7 };
          for (var i = 0; i < 400; i++) {
            var c = { A: r.int(2, 6), B: r.int(1, 9), C: r.int(2, 6), D: r.int(1, 9) };
            if (gcd(c.A, c.B) !== 1 || gcd(c.C, c.D) !== 1 || c.A * c.D - c.B * c.C === 0 || c.A * c.C > 36) continue;
            o = c; break;
          }
          var T = Tri({ p: o.A, q: -o.B, r: o.C, s: o.D }), ans = o.A * 1000 + o.B * 100 + o.C * 10 + o.D;
          return B.nr('The expression ' + t(T.tex) + ' can be written in the form ' + t('(ax-b)(cx+d)') + ', where ' + t('a') + ', ' + t('b') + ', ' + t('c') + ' and ' + t('d') + ' are all positive integers. Write the values of ' + t('a') + ', ' + t('b') + ', ' + t('c') + ' and ' + t('d') + ' in the four boxes, in that order.', ans, function (v) {
            if (v === o.C * 1000 + o.D * 100 + o.A * 10 + o.B) return { code: 'ax-digit-order', hint: 'Right factors, wrong order: ' + t('a') + ' and ' + t('b') + ' come from the bracket with the <b>minus</b> sign.' };
            if (v === o.A * 1000 + o.D * 100 + o.C * 10 + o.B) return { code: 'ax-const-swap', hint: 'Expand your brackets: the constants are in the wrong brackets (the middle term won’t match).' };
            return null;
          }, pairLine(T) + '<br>' + t(T.tex + '=' + splitTex(T) + '=' + groupTex(T) + '=' + br(T.F2) + br(T.F1)) + '<br>In the form ' + t('(ax-b)(cx+d)') + ': ' + t(br(T.F1) + br(T.F2)) + ', so ' + t('a=' + o.A + ',\\ b=' + o.B + ',\\ c=' + o.C + ',\\ d=' + o.D) + '. Answer: ' + t(ans) + '.',
          ['Factor by decomposition first. The bracket with the minus sign is ' + t('(ax-b)') + '.'], 'NR (ax-b)(cx+d)');
        } }] }
    ],
    extra: [
      { num: '1', section: 'Extra practice A — Decomposition when ac is large', stem: 'Step (2) on its own: find the pair of integers with the given product ' + t('ac') + ' and sum ' + t('b') + '. Work through the factor pairs of ' + t('ac') + ' in order.', parts: [
        { id: 'e1a', level: 'EMG', make: function (r) { return pairPart(r, function () { var m = r.int(3, 20), n = r.int(3, 20); return { m: m, n: n, ok: m !== n && m * n >= 80 && m * n <= 200 && m + n >= 15 }; }, [10, 12]); } },
        { id: 'e1b', level: 'EMG', make: function (r) { return pairPart(r, function () { var m = r.int(2, 15), n = -r.int(2, 30); return { m: m, n: n, ok: m < -n && -m * n >= 80 && -m * n <= 250 }; }, [8, -21]); } },
        { id: 'e1c', level: 'EMG', make: function (r) { return pairPart(r, function () { var m = -r.int(3, 30), n = -r.int(3, 30); return { m: m, n: n, ok: m !== n && m * n >= 100 && m * n <= 300 }; }, [-9, -25]); } },
        { id: 'e1d', level: 'EMG', make: function (r) { return noPairPart(r); } },
        { id: 'e1e', level: 'EMG', make: function (r) { return pairPart(r, function () { var m = r.int(10, 40), n = -r.int(10, 40); return { m: m, n: n, ok: m > -n && m + n <= 15 && -m * n >= 300 && -m * n <= 700 }; }, [30, -21]); } },
        { id: 'e1f', level: 'EMG', make: function (r) { return pairPart(r, function () { var m = -r.int(3, 24), n = -r.int(3, 24); return { m: m, n: n, ok: m !== n && m * n >= 100 && m * n <= 200 }; }, [-9, -16]); } }] },
      { num: '2', stem: 'Factor using the method of decomposition: ' + t('ac') + ', the pair, the split middle term, then group.', parts: [
        { id: 'e2a', level: 'EMG', make: function (r) { var pq = palin(r, [4, 3]); return factorPart(Tri({ p: pq[0], q: pq[1], r: pq[1], s: pq[0] })); } },
        { id: 'e2b', level: 'PRG', make: function (r) { var pq = palin(r, [5, 3]); return factorPart(Tri({ p: pq[0], q: -pq[1], r: pq[1], s: -pq[0] })); } },
        { id: 'e2c', level: 'PRG', make: function (r) { return factorPart(tri(r, { p: [2, 6], q: [1, 9], r: [2, 6], s: [-9, -1], test: function (o) { return o.b >= 15 && o.ac <= -100 && o.ac >= -250; }, book: { p: 5, q: 9, r: 4, s: -1 } })); } },
        { id: 'e2d', level: 'PRG', make: function (r) { return factorPart(tri(r, { p: [2, 8], q: [-9, -1], r: [2, 8], s: [-9, -1], test: function (o) { return o.ac >= 100 && o.ac <= 250 && o.b <= -15; }, book: { p: 8, q: -7, r: 3, s: -1 } })); } },
        { id: 'e2e', level: 'PRG', make: function (r) { return factorPart(tri(r, { p: [2, 6], q: [1, 9], r: [2, 6], s: [-9, -1], test: function (o) { return o.b > 0 && o.b <= 12 && o.ac <= -300; }, book: { p: 3, q: 5, r: 6, s: -7 } }, { v: 'm' })); } },
        { id: 'e2f', level: 'PRG', make: function (r) { return factorPart(tri(r, { p: [2, 7], q: [-9, -1], r: [2, 7], s: [-9, -1], test: function (o) { return o.ac >= 300 && o.b <= -30; }, book: { p: 2, q: -5, r: 7, s: -9 } }, { v: 'y' })); } }] },
      { num: '3', stem: 'Factor. Each one is out of descending order, and two of them have a negative leading term once they are rearranged.', parts: [
        { id: 'e3a', level: 'PRG', make: function (r) { return factorPart(tri(r, { p: [2, 6], q: [-9, -1], r: [2, 6], s: [-9, -1], test: function (o) { return o.ac >= 100 && o.ac <= 300; }, book: { p: 4, q: -3, r: 5, s: -4 } }), { asc: true }); } },
        { id: 'e3b', level: 'PRG', make: function (r) { return factorPart(tri(r, { p: [2, 6], q: [1, 9], r: [2, 6], s: [-9, -1], test: function (o) { return o.b > 0 && o.b <= 5 && o.ac <= -150; }, book: { p: 6, q: 5, r: 4, s: -3 } }, { k: -1 }), { asc: true }); } },
        { id: 'e3c', level: 'PRG', make: function (r) { return factorPart(tri(r, { p: [2, 4], q: [-9, -1], r: [2, 4], s: [1, 9], test: function (o) { return o.b < 0 && o.ac <= -30; }, book: { p: 2, q: -5, r: 3, s: 2 } }, { k: -1, v: 't' }), { asc: true }); } }] },
      { num: '4', stem: function (sh) { return 'For ' + t(sh.T.tex) + ', ' + t('ac=' + sh.T.ac) + '.'; },
        shared: function (r) { return { T: tri(r, { p: [2, 8], q: [1, 9], r: [2, 8], s: [1, 9], test: function (o) { return o.ac >= 120 && o.ac <= 300 && npairs(o.ac) >= 7; }, book: { p: 8, q: 5, r: 2, s: 3 } }) }; },
        parts: [
          { id: 'e4a', level: 'EMG', make: function (r, sh) {
            var ac = sh.T.ac, np = npairs(ac), nd = nt.numDivisors(ac), d = nt.divisors(ac).filter(function (x) { return x * x <= ac; });
            return B.number('List every factor pair of ' + t(ac) + ' made of two <b>positive</b> integers, starting with ' + t('1\\times ' + ac) + '. How many pairs are there?', np, function (v) {
              if (v === nd) return { code: 'ax-divisors-not-pairs', hint: 'That is the number of <b>divisors</b>. Each pair uses two of them.' };
              if (v === np - 1) return { code: 'value', hint: 'One pair is missing. Did you include ' + t('1\\times ' + ac) + '? Test every number up to ' + t('\\sqrt{' + ac + '}\\approx ' + Math.round(Math.sqrt(ac) * 10) / 10) + '.' };
              return null;
            }, d.map(function (x) { return t(x + '\\times ' + ac / x); }).join(', ') + '. Stop at ' + t('\\sqrt{' + ac + '}\\approx ' + Math.round(Math.sqrt(ac) * 10) / 10) + ' (after that the pairs repeat). There are ' + t(np) + ' pairs.',
            ['Test ' + t('1, 2, 3, \\ldots') + ' in order: ' + t(ac + '\\div') + ' the trial number gives the partner.'], 'positive factor pairs of ' + ac);
          } },
          { id: 'e4b', level: 'EMG', make: function (r, sh) {
            var T = sh.T;
            return mcPart(r, 'Why do you never have to test a pair containing a negative integer for this trinomial?', [
              { html: t('ac=' + T.ac) + ' is positive, so both integers have the same sign; their sum ' + t('b=' + T.b) + ' is positive, so both are positive.', right: true },
              { html: 'Two negative integers can never multiply to a positive number.', why: 'They can: ' + t('(-1)(-' + T.ac + ')=' + T.ac) + '. The reason has to do with the <b>sum</b>.' },
              { html: 'Because ' + t('a') + ' is positive.', why: 'The sign of ' + t('a') + ' alone doesn’t decide it — think about the sign of ' + t('ac') + ' and of ' + t('b') + '.' },
              { html: 'Because a negative pair would make ' + t('ac') + ' negative.', why: 'Two negatives multiply to a positive. Look at the sum instead: two negatives add to a negative number.' }],
              t('ac>0') + ' means the two integers have the same sign. Two negatives add to a negative number, but ' + t('b=' + T.b) + ' is positive, so both integers are positive.', ['If both were negative, what sign would their sum have?'], 'why no negative pairs');
          } },
          { id: 'e4c', level: 'PRG', make: function (r, sh) { return factorPart(sh.T, { prompt: 'Factor ' + t(sh.T.tex) + ' by decomposition.' }); } }] },
      { num: '5', section: 'Extra practice B — Common factor first', stem: 'Factor completely. Remove the greatest common factor before you decompose.', parts: [
        { id: 'e5a', level: 'PRG', make: function (r) { return factorPart(tri(r, { p: [1, 3], q: [1, 3], r: [1, 3], s: [1, 3], test: function (o) { return o.ac <= 12; }, book: { p: 2, q: 1, r: 1, s: 3 } }, { k: r.int(2, 5), gv: { x: 1 } })); } },
        { id: 'e5b', level: 'PRG', make: function (r) { var pq = palin(r, [4, 3]); return factorPart(Tri({ p: pq[0], q: -pq[1], r: pq[1], s: -pq[0], k: r.int(2, 3) })); } },
        { id: 'e5c', level: 'PRG', make: function (r) { return factorPart(tri(r, { p: [2, 5], q: [1, 5], r: [2, 5], s: [-5, -1], test: function (o) { return o.b < 0 && o.ac >= -150; }, book: { p: 3, q: 2, r: 5, s: -4 } }, { k: r.int(2, 3) })); } },
        { id: 'e5d', level: 'PRG', make: function (r) { return factorPart(tri(r, { p: [2, 5], q: [1, 5], r: [2, 5], s: [-5, -1], test: function (o) { return o.b > 0 && o.ac >= -40; }, book: { p: 5, q: 3, r: 2, s: -1 } }, { k: r.int(2, 3), gv: { y: 2 }, v: 'y' })); } },
        { id: 'e5e', level: 'PRG', make: function (r) { return factorPart(tri(r, { p: [1, 3], q: [-5, -1], r: [1, 3], s: [-5, -1], test: function (o) { return o.b <= -5; }, book: { p: 2, q: -5, r: 1, s: -3 } }, { k: r.int(2, 3), gv: { a: 1, b: 1 }, v: 'a' })); } },
        { id: 'e5f', level: 'PRG', make: function (r) { return factorPart(tri(r, { p: [1, 4], q: [1, 5], r: [1, 4], s: [-5, -1], test: function (o) { return o.b > 0 && o.ac >= -30; }, book: { p: 1, q: 2, r: 4, s: -3 } }, { k: r.pick([6, 10, 12, 15]) })); } }] },
      { num: '6', stem: 'Factor completely. The leading term is negative, so the common factor you remove is <b>negative</b> as well.', parts: [
        { id: 'e6a', level: 'PRG', make: function (r) { return factorPart(tri(r, { p: [2, 3], q: [-5, -1], r: [2, 3], s: [-5, -1], test: function (o) { return o.ac <= 40; }, book: { p: 2, q: -1, r: 3, s: -4 } }, { k: r.pick([-2, -3]) })); } },
        { id: 'e6b', level: 'PRG', make: function (r) { return factorPart(tri(r, { p: [2, 4], q: [1, 5], r: [2, 4], s: [-5, -1], test: function (o) { return o.b > 0 && o.b <= 6 && o.ac <= -60; }, book: { p: 2, q: 3, r: 4, s: -5 } }, { k: -1 })); } },
        { id: 'e6c', level: 'PRG', make: function (r) { return factorPart(tri(r, { p: [3, 4], q: [1, 3], r: [3, 4], s: [-3, -1], test: function (o) { return o.b < 0; }, book: { p: 3, q: 2, r: 4, s: -3 } }, { k: r.pick([-2, -3]), gv: { x: 1 } })); } }] },
      { num: '7', stem: function (sh) { return 'Look again at ' + t(sh.T.tex) + ' (like Question 5(f)).'; },
        shared: function (r) { return { T: tri(r, { p: [1, 4], q: [1, 5], r: [1, 4], s: [-6, -1], test: function (o) { return o.b > 0 && o.ac >= -40 && o.ac <= -12; }, book: { p: 1, q: 2, r: 4, s: -3 } }, { k: r.pick([6, 10, 12, 15]) }) }; },
        parts: [
          { id: 'e7a', level: 'BEG', make: function (r, sh) {
            var T = sh.T, k = PL.terms(T.gm)[0].c[0], A = T.a * k, C = T.c * k;
            var chk = K.fields([function (s) { var x = readInt(s); if (x.res) return x.res; return x.v === A * C ? ok() : wrong('ax-ac-wrong', 'As written, ' + t('a=' + A) + ' and ' + t('c=' + C) + '.'); }, function (s) { var x = readInt(s); if (x.res) return x.res; return x.v === T.ac ? ok() : wrong('ax-ac-wrong', 'Inside the bracket the trinomial is ' + t(T.innerTex) + '.'); }], { labels: ['As written', 'Inside the bracket'] });
            var p = fieldsPart('Compute ' + t('ac') + ' for the trinomial as written, and again for the trinomial left inside the bracket after the common factor comes out.', [nbox('As written'), nbox('Inside the bracket')], chk, [String(A * C), String(T.ac)], t(A * C) + ' and ' + t(T.ac),
              'As written: ' + t('ac=' + A + '(' + C + ')=' + A * C) + '.<br>Take out ' + t(k) + ': ' + t(T.tex + '=' + k + '(' + T.innerTex + ')') + ', and ' + t('ac=' + T.a + '(' + T.c + ')=' + T.ac) + '.', ['Multiply the first coefficient by the constant term.'], 'ac before/after GCF');
            p.bad = [[String(T.ac), String(A * C)]];
            return p;
          } },
          { id: 'e7b', level: 'PRG', make: function (r, sh) {
            var T = sh.T, k = PL.terms(T.gm)[0].c[0], big = Math.abs(T.a * k * T.c * k), small = Math.abs(T.ac), db = nt.numDivisors(big), ds = nt.numDivisors(small);
            var one = function (n, d) { return function (s) { var x = readInt(s); if (x.res) return x.res; if (x.v === d) return ok(); if (x.v === Math.ceil(d / 2)) return wrong('ax-pairs-not-divisors', 'Count one candidate for <b>each</b> positive divisor ' + t('d') + ' of ' + t(n) + ' (so ' + t('\\{1, -' + n + '\\}') + ' and ' + t('\\{' + n + ', -1\\}') + ' count separately).'); return wrong('value', 'Use the prime factorization of ' + t(n) + ' and the rule ' + t('(a+1)(b+1)(c+1)\\cdots') + '.'); }; };
            var p = fieldsPart('A candidate pair for step (2) is ' + t('\\{d,\\ ac\\div d\\}') + ' for each positive divisor ' + t('d') + ' of ' + t('|ac|') + '. Count the candidates for each of your two values of ' + t('ac') + '.', [{ label: 'For ' + t('|ac|=' + big), name: 'Large ac' }, { label: 'For ' + t('|ac|=' + small), name: 'Small ac' }], K.fields([one(big, db), one(small, ds)], { labels: ['For ' + big, 'For ' + small] }), [String(db), String(ds)], t(db) + ' and ' + t(ds),
              t(big + '=' + K.fac(big)) + ', so it has ' + t(nt.factor(big).map(function (pe) { return '(' + pe[1] + '+1)'; }).join('') + '=' + db) + ' divisors.<br>' + t(small + '=' + K.fac(small)) + ' has ' + t(ds) + ' divisors.<br>Taking out the common factor first cuts the search from ' + t(db) + ' candidates to ' + t(ds) + '.',
              ['Number of divisors: write the number as a product of primes, add 1 to each exponent and multiply.'], 'count candidates');
            return p;
          } },
          { id: 'e7c', level: 'EMG', make: function (r, sh) {
            var T = sh.T, k = PL.terms(T.gm)[0].c[0], big = Math.abs(T.a * k * T.c * k), db = nt.numDivisors(big), ds = nt.numDivisors(Math.abs(T.ac));
            return mcPart(r, 'What does part (b) show about <b>when</b> to remove a common factor?', [
              { html: 'Remove it <b>first</b>, before decomposing: it shrinks ' + t('ac') + ', leaving far fewer pairs to test.', right: true },
              { html: 'Remove it <b>last</b>: taking it out first doesn’t change the number of pairs.', why: 'Part (b) shows the candidates drop from ' + t(db) + ' to ' + t(ds) + '.' },
              { html: 'It doesn’t matter when — both ways test the same pairs.', why: 'The two values of ' + t('ac') + ' have ' + t(db) + ' and ' + t(ds) + ' candidates — very different searches.' },
              { html: 'Only remove a common factor when ' + t('ac') + ' is negative.', why: 'The sign of ' + t('ac') + ' has nothing to do with it; the size of ' + t('ac') + ' does.' }],
              'Removing the common factor first shrinks ' + t('ac') + ' (and the search from ' + t(db) + ' candidates to ' + t(ds) + '), so always look for a common factor before decomposing.', ['Compare the two counts from part (b).'], 'GCF first');
          } }] },
      { num: '8', section: 'Extra practice C — Two variables', stem: 'Factor. The method is unchanged — the two split pieces each carry one of each variable.', parts: [
        { id: 'e8a', level: 'PRG', make: function (r) { return factorPart(tri(r, { p: [2, 4], q: [1, 6], r: [2, 4], s: [-6, -1], test: function (o) { return o.b > 0 && o.ac <= -30; }, book: { p: 2, q: 5, r: 3, s: -2 } }, { v: 'x', w: 'y' })); } },
        { id: 'e8b', level: 'PRG', make: function (r) { var pq = palin(r, [4, 3]); return factorPart(Tri({ p: pq[0], q: -pq[1], r: pq[1], s: -pq[0], v: 'a', w: 'b' })); } },
        { id: 'e8c', level: 'PRG', make: function (r) { return factorPart(tri(r, { p: [2, 6], q: [1, 9], r: [2, 6], s: [-9, -1], test: function (o) { return o.b > 0 && o.b <= 8 && o.ac <= -300; }, book: { p: 3, q: 5, r: 5, s: -7 } }, { v: 'm', w: 'n' })); } }] },
      { num: '9', stem: 'Factor completely. Each of these is a common factor away from a two-variable trinomial.',
        shared: function (r) { return { T: tri(r, { p: [2, 4], q: [-5, -1], r: [2, 5], s: [1, 6], test: function (o) { return o.b < 0 && o.ac <= -60; }, book: { p: 2, q: -3, r: 4, s: 5 } }, { v: 'p', w: 'q', gv: { q: 1 } }) }; },
        parts: [
          { id: 'e9a', level: 'PRG', make: function (r, sh) { return factorPart(sh.T); } },
          { id: 'e9b', level: 'PRG', make: function (r) { return factorPart(tri(r, { p: [2, 6], q: [1, 6], r: [2, 6], s: [-6, -1], test: function (o) { return o.b > 0 && o.b <= 7 && o.ac <= -150; }, book: { p: 6, q: 5, r: 4, s: -3 } }, { v: 'm', w: 'n', gv: { n: 1 } })); } },
          { id: 'e9c', level: 'EMG', make: function (r, sh) {
            var T = sh.T, pc = tx(M(T.m, { p: 1, q: 2 })), pd = tx(M(T.n, { p: 1, q: 2 }));
            var chk = K.fields([function (s) { var x = readInt(s); if (x.res) return x.res; return x.v === T.ac ? ok() : wrong('ax-ac-wrong', 'For the bracket ' + t(T.innerTex) + ': ' + t('a=' + T.a) + ', ' + t('c=' + T.c) + '.'); },
              function (s) { var x = readInt(s); if (x.res) return x.res; if (x.v === T.m * T.n) return wrong('ax-sum-not-product', 'That is the product. Add the two integers.'); return x.v === T.b ? ok() : wrong('value', 'The integers in the pieces are ' + t(T.m) + ' and ' + t(T.n) + '.'); }], { labels: ['ac', 'Sum of the pair'] });
            var p = fieldsPart('In part (a) the two split pieces are ' + t(pc) + ' and ' + t(pd) + '. State ' + t('ac') + ' for the trinomial inside the bracket, and the sum of the two integers in the pieces.', [nbox(t('ac')), nbox('Sum of the pair')], chk, [String(T.ac), String(T.b)], t('ac=' + T.ac) + ', sum ' + t(T.b),
              'Inside the bracket, ' + t(T.innerTex) + ': ' + t('ac=' + T.a + '(' + T.c + ')=' + T.ac) + ' and ' + t('b=' + T.b) + '.<br>' + t(pc + '=q(' + tx(M(T.m, { p: 1, q: 1 })) + ')') + ' and ' + t(pd + '=q(' + tx(M(T.n, { p: 1, q: 1 })) + ')') + ', so the pair is ' + t(T.m) + ' and ' + t(T.n) + ': product ' + t(T.m * T.n + '=ac') + ' ✓, sum ' + t(T.b + '=b') + ' ✓.',
              ['Take the common factor ' + t('q') + ' out first. Then ' + t('a') + ' and ' + t('c') + ' are the coefficients of ' + t('p^{2}') + ' and ' + t('q^{2}') + ' in the bracket.'], 'check the pair');
            p.bad = [[String(T.ac * 1), String(T.m * T.n)]];
            return p;
          } }] },
      { num: '10', section: 'Extra practice D — When the search comes up empty', stem: 'Three of the six trinomials (a)–(f) below factor over the integers and three do not.',
        shared: function (r) { return tenShared(r); },
        parts: [
          { id: 'e10a', sub: 'which factor', level: 'PRG', make: function (r, sh) {
            var rows = sh.items.map(function (it, i) { return { id: 'abcdef'.charAt(i), html: '(' + 'abcdef'.charAt(i) + ') ' + t(it.tex) }; }), want = {};
            sh.items.forEach(function (it, i) { want['abcdef'.charAt(i)] = it.T ? 'yes' : 'no'; });
            return B.grid('Which trinomials factor over the integers?', rows, [{ id: 'yes', html: 'Factors' }, { id: 'no', html: 'Does not factor' }], want, { why: function (rid) {
                var it = sh.items['abcdef'.indexOf(rid)];
                return { code: 'row', hint: 'Check (' + rid + ') ' + t(it.tex) + ': ' + (it.T ? 'there <b>is</b> a pair with product ' + t(it.ac) + ' and sum ' + t(it.b) + '.' : 'list every factor pair of ' + t(Math.abs(it.ac)) + ' — none of them has sum ' + t(it.b) + '.') };
              } },
              sh.items.map(function (it, i) { return '(' + 'abcdef'.charAt(i) + ') ' + t('ac=' + it.ac + ',\\ b=' + it.b) + ': ' + (it.T ? 'pair ' + t(it.T.m) + ' and ' + t(it.T.n) + ' — <b>factors</b>, ' + t(it.T.key) + '.' : 'pairs ' + pairsTex(it.ac, it.b) + ' — none has sum ' + t(it.b) + ', so it <b>does not factor</b>.'); }).join('<br>'),
              ['For each one, compute ' + t('ac') + ' and test every factor pair of ' + t('ac') + ' (with the right signs) for the sum ' + t('b') + '.'], 'which factor');
          } },
          { id: 'e10b', sub: 'factor 1', level: 'PRG', make: function (r, sh) { return tenFactor(sh, 0); } },
          { id: 'e10c', sub: 'factor 2', level: 'PRG', make: function (r, sh) { return tenFactor(sh, 1); } },
          { id: 'e10d', sub: 'factor 3', level: 'PRG', make: function (r, sh) { return tenFactor(sh, 2); } }] },
      { num: '11', stem: '<i>A classmate says: “You can never be sure a trinomial doesn’t factor — maybe you just haven’t found the right pair yet.”</i>',
        shared: function (r) { return { T: tri(r, { p: [1, 4], q: [1, 5], r: [2, 12], s: [-6, -1], test: function (o) { return o.b > 0 && o.ac <= -36 && o.ac >= -120; }, book: { p: 1, q: 1, r: 12, s: -5 } }) }; },
        parts: [
          { id: 'e11a', level: 'EMG', make: function (r) {
            return mcPart(r, 'Why does the search in step (2) always end after finitely many tests?', [
              { html: 'Both integers must be <b>divisors</b> of ' + t('ac') + ', and ' + t('ac') + ' has only finitely many divisors — so the list of candidates is finite, and testing all of them is a complete check.', right: true },
              { html: 'Because you can stop as soon as you find a pair with the right product.', why: 'Many pairs have the right product; at most one has the right sum. The point is that the list of all candidates is finite.' },
              { html: 'It doesn’t: you should test numbers up to ' + t('1000') + ' to be safe.', why: 'Any integer in the pair must divide ' + t('ac') + ', so nothing bigger than ' + t('|ac|') + ' can ever work.' },
              { html: 'Because ' + t('b') + ' is always smaller than ' + t('ac') + '.', why: 'That isn’t always true, and it isn’t the reason. Think about what each integer in the pair must divide.' }],
              'The two integers multiply to ' + t('ac') + ', so each one is a divisor of ' + t('ac') + '. A non-zero integer has finitely many divisors, so the factor pairs of ' + t('|ac|') + ' form a finite list containing every possible candidate. If none works, the trinomial definitely does not factor.', ['What must each integer in the pair divide?'], 'search is finite');
          } },
          { id: 'e11b', level: 'EMG', make: function (r, sh) {
            var T = sh.T, n = Math.abs(T.ac), d = nt.numDivisors(n);
            return B.number('For ' + t(T.tex) + ', ' + t('ac=' + T.ac) + '. A candidate pair is ' + t('\\{d,\\ ' + T.ac + '\\div d\\}') + ' for each positive divisor ' + t('d') + ' of ' + t(n) + '. Exactly how many candidate pairs are there?', d, function (v) {
              if (v === Math.ceil(d / 2)) return { code: 'ax-pairs-not-divisors', hint: 'One candidate for <b>each</b> positive divisor: ' + t('\\{1, ' + T.ac + '\\}') + ' and ' + t('\\{' + n + ', -1\\}') + ' are different candidates.' };
              return null;
            }, 'The positive divisors of ' + t(n) + ' are ' + t(K.listTex(nt.divisors(n))) + ', so there are exactly ' + t(d) + ' candidates. The one that works is ' + t(T.m) + ' and ' + t(T.n) + ': ' + t(pn(T.m) + '\\times ' + pn(T.n) + '=' + T.ac) + ', ' + t(T.m + '+' + pn(T.n) + '=' + T.b) + '.',
            ['List the positive divisors of ' + t(n) + ' and count them.'], 'count candidates ' + T.ac);
          } },
          { id: 'e11c', level: 'PRG', make: function (r, sh) { var p = factorPart(sh.T, { prompt: 'Factor ' + t(sh.T.tex) + '.' }); p.solution += '<br>To the classmate: the list of candidate pairs is finite, so testing every factor pair of ' + t('ac') + ' is a complete check — if none works, the trinomial definitely does not factor.'; return p; } }] },
      { num: '12', section: 'Extra practice E — Working backwards', stem: function (sh) { return 'Consider ' + t(sh.a + 'x^{2}+bx+' + sh.c) + ', where ' + t('b') + ' is an integer.'; },
        shared: function (r) {
          var o = { a: 6, c: 15 };
          for (var i = 0; i < 300; i++) { var a = r.pick([4, 6, 8, 10, 12]), c = r.pick([5, 7, 9, 15, 21, 25]), ac = a * c; if (ac < 40 || ac > 160 || npairs(ac) < 4 || npairs(ac) > 7) continue; o = { a: a, c: c }; break; }
          var ac = o.a * o.c, ds = nt.divisors(ac).filter(function (d) { return d * d <= ac; }), bs = ds.map(function (d) { return d + ac / d; }).filter(function (x, i, arr) { return arr.indexOf(x) === i; }).sort(function (x, y) { return x - y; });
          return { a: o.a, c: o.c, ac: ac, ds: ds, bs: bs };
        },
        parts: [
          { id: 'e12a', level: 'ADV', make: function (r, sh) {
            var vals = []; sh.bs.forEach(function (b) { vals.push(b, -b); });
            var p = K.P.valueSet('Find <b>every</b> value of ' + t('b') + ' for which the trinomial factors over the integers. (Use the factor pairs of ' + t('ac') + ' — each pair gives one ' + t('b') + '.)', vals, { v: 'b', keyTex: sh.bs.map(function (b) { return '\\pm' + b; }).join(', '), diag: function (A, T) {
                var miss = T.filter(function (x) { return A.indexOf(x) < 0; }), extra = A.filter(function (x) { return T.indexOf(x) < 0; });
                if (extra.length) return { code: 'ax-extra-b', hint: t('b=' + extra[0]) + ' doesn’t work: no pair of integers with product ' + t(sh.ac) + ' has that sum.' };
                if (miss.length && miss.every(function (x) { return x < 0; })) return { code: 'ax-only-positive', hint: 'Don’t forget the <b>negative</b> pairs: two negatives also multiply to ' + t(sh.ac) + '.' };
                if (miss.length) return { code: 'ax-missing-b', hint: 'You’re missing ' + (miss.length === 1 ? 'a value' : miss.length + ' values') + '. Each factor pair of ' + t(sh.ac) + ' gives a value of ' + t('b') + ' (and its negative).' };
                return null;
              } },
              t('ac=' + sh.a + '(' + sh.c + ')=' + sh.ac) + ', positive, so the pair shares a sign. Positive pairs (sum): ' + sh.ds.map(function (d) { return t('\\{' + d + ',' + sh.ac / d + '\\}\\to ' + (d + sh.ac / d)); }).join('; ') + '. Each negative pair gives the opposite sum.<br>' + t('b=' + sh.bs.map(function (b) { return '\\pm' + b; }).join(',\\ ')) + ' — ' + 2 * sh.bs.length + ' values.',
              ['List every factor pair of ' + t('ac=' + sh.ac) + '. Each pair’s sum is a possible ' + t('b') + '.', 'Negative pairs multiply to ' + t(sh.ac) + ' too.'], 'all b for ' + sh.a + 'x^2+bx+' + sh.c);
            p.good = [sh.bs.map(function (b) { return '\\pm' + b; }).join(', '), vals.map(function (b) { return 'b=' + b; }).join(', ')];
            p.bad = [sh.bs.join(', '), sh.bs.slice(1).map(function (b) { return '\\pm' + b; }).join(', ')];
            return p;
          } },
          { id: 'e12b', level: 'EMG', make: function (r, sh) {
            var b = sh.bs[0], F = factorInt(sh.a, b, sh.c), G = factorInt(sh.a, -b, sh.c), T1 = Tri(F), T2 = Tri(G);
            return mcPart(r, 'Why do the values of ' + t('b') + ' come in pairs ' + t('+b') + ' and ' + t('-b') + ', and what changes in the factored form when the sign of ' + t('b') + ' flips?', [
              { html: t('ac=' + sh.ac) + ' is positive, so the pair shares a sign; replacing both integers by their negatives keeps the product and flips the sum. In the factored form, the <b>constant terms</b> change sign.', right: true },
              { html: 'Because ' + t('b^{2}') + ' is always positive. The leading terms of the brackets change sign.', why: 'Compare ' + t(T1.key) + ' with ' + t(T2.key) + ': only the constant terms change sign.' },
              { html: 'Because ' + t('a') + ' and ' + t('c') + ' can be swapped. Nothing changes in the factored form.', why: 'Swapping ' + t('a') + ' and ' + t('c') + ' doesn’t flip the sign of ' + t('b') + '. Negating both integers of a pair does.' },
              { html: 'Because a negative pair always has a negative product. The brackets swap places.', why: 'Two negatives have a <b>positive</b> product. And the brackets themselves change: compare ' + t(T1.key) + ' with ' + t(T2.key) + '.' }],
              'Negating both integers of a pair keeps the product ' + t(sh.ac) + ' and reverses the sum, so if ' + t('b') + ' works, ' + t('-b') + ' works too. In the factored form the constants change sign: ' + t('b=' + b) + ' gives ' + t(T1.key) + '; ' + t('b=' + (-b)) + ' gives ' + t(T2.key) + '.', ['What happens to the product and to the sum if you replace a pair by its negatives?'], 'why ±b');
          } },
          { id: 'e12c', level: 'PRG', make: function (r, sh) {
            var b = sh.bs[0], F = factorInt(sh.a, b, sh.c), T = Tri(F);
            var p = factorPart(T, { prompt: 'Factor the trinomial for the <b>smallest positive</b> value of ' + t('b') + ' you found.' });
            p.solution = 'The smallest positive ' + t('b') + ' is ' + t(b) + ' (from the pair closest to ' + t('\\sqrt{' + sh.ac + '}') + '): ' + t(T.tex) + '.<br>' + solDecomp(T);
            p.hints = ['The smallest positive sum comes from the factor pair of ' + t(sh.ac) + ' whose numbers are closest together.', hintsFor(T)[0]];
            return p;
          } }] },
      { num: '13', stem: 'Find the missing leading coefficient or missing factor. Check each answer by expanding.', parts: [
        { id: 'e13a', level: 'ADV', make: function (r) {
          var o = pick(r, { p: [2, 5], q: [1, 5], r: [2, 5], s: [-7, -1], test: function (o) { return o.b < 0; }, book: { p: 4, q: 3, r: 3, s: -5 } }), T = Tri(o);
          var chk = K.fields([K.poly(T.F2), K.value(T.a, { diag: function (v) { return v === T.p ? { code: 'ax-lead', hint: t('a') + ' is the product of the two leading coefficients.' } : null; } })], { labels: ['Missing factor', 'a'] });
          var p = fieldsPart(t('ax^{2}' + sg(T.b) + 'x' + sg(T.c) + '=' + br(T.F1) + '(\\underline{\\qquad\\quad})') + '. Find the missing factor and ' + t('a') + '.', [pbox('Missing factor'), nbox(t('a'))], chk, [tx(T.F2), String(T.a)], t(tx(T.F2)) + ', ' + t('a=' + T.a),
            'Let the factor be ' + t('(kx+m)') + '. Constants: ' + t(T.q + 'm=' + T.c) + ', so ' + t('m=' + T.s) + '.<br>Middle term: ' + t(tx(M(T.p, { x: 1 })) + '\\cdot ' + pn(T.s) + '+' + T.q + '(kx)=' + tx(M(T.b, { x: 1 }))) + ', so ' + t(T.q + 'k=' + (T.b - T.m)) + ' and ' + t('k=' + T.r) + '.<br>Missing factor ' + t(tx(T.F2)) + '; ' + t('a=' + T.p + '(' + T.r + ')=' + T.a) + '.<br>Check: ' + t(br(T.F1) + br(T.F2) + '=' + T.tex) + ' ✓',
            ['The constants multiply to ' + t(T.c) + ', so you can find the constant in the missing factor first.', 'Then make the outside and inside products add to ' + t(tx(M(T.b, { x: 1 }))) + '.'], 'missing factor and a');
          p.bad = [[tx(lin(T.r, -T.s)), String(T.a)], [tx(T.F2), String(T.p)]];
          return p;
        } },
        { id: 'e13b', level: 'ADV', make: function (r) {
          var o = pick(r, { p: [2, 5], q: [-5, -1], r: [1, 4], s: [-5, -1], test: function (o) { return o.b <= -8; }, book: { p: 3, q: -4, r: 2, s: -3 } }), T = Tri(o);
          var chk = K.fields([K.value(T.a, { diag: function (v) { return v === T.p ? { code: 'ax-lead', hint: t('a') + ' is the product of the two leading coefficients.' } : null; } }), K.poly(T.F2)], { labels: ['a', 'Other factor'] });
          var p = fieldsPart(t('ax^{2}' + sg(T.b) + 'x' + sg(T.c)) + ' has ' + t(br(T.F1)) + ' as a factor. Find ' + t('a') + ' and the other factor.', [nbox(t('a')), pbox('Other factor')], chk, [String(T.a), tx(T.F2)], t('a=' + T.a) + ', ' + t(tx(T.F2)),
            'Let the other factor be ' + t('(kx+m)') + '. Constants: ' + t(pn(T.q) + 'm=' + T.c) + ', so ' + t('m=' + T.s) + '.<br>Middle: ' + t(tx(M(T.p, { x: 1 })) + '\\cdot ' + pn(T.s) + '+' + pn(T.q) + '(kx)') + ' must be ' + t(tx(M(T.b, { x: 1 }))) + ', so ' + t(T.m + sg(T.q) + 'k=' + T.b) + ' and ' + t('k=' + T.r) + '.<br>Other factor ' + t(tx(T.F2)) + '; ' + t('a=' + T.p + '(' + T.r + ')=' + T.a) + '.<br>Check: ' + t(br(T.F1) + br(T.F2) + '=' + T.tex) + ' ✓',
            ['Find the constant of the other factor first: the constants multiply to ' + t(T.c) + '.'], 'a and other factor');
          p.bad = T.r !== 1 ? [[String(T.p), tx(T.F2)]] : [[String(T.a), tx(lin(T.r, -T.s))]];
          return p;
        } },
        { id: 'e13c', level: 'ADV', make: function (r) {
          var o = pick(r, { p: [2, 4], q: [-9, -1], r: [1, 4], s: [1, 9], test: function (o) { return Math.abs(o.b) <= 20 && o.a <= 16; }, book: { p: 4, q: -7, r: 2, s: 3 } }), T = Tri(o);
          var chk = K.fields([K.value(T.b, { diag: function (v) { return v === T.m * T.n ? { code: 'ax-sum-not-product', hint: 'Add the outside and inside products, don’t multiply them.' } : null; } }), K.poly(T.F2)], { labels: ['b', 'Other factor'] });
          var p = fieldsPart(t(T.a + 'x^{2}+bx' + sg(T.c)) + ' has ' + t(br(T.F1)) + ' as a factor. Find ' + t('b') + ' and the other factor.', [nbox(t('b')), pbox('Other factor')], chk, [String(T.b), tx(T.F2)], t('b=' + T.b) + ', ' + t(tx(T.F2)),
            'Let the other factor be ' + t('(kx+m)') + '. Leading: ' + t(T.p + 'k=' + T.a) + ', so ' + t('k=' + T.r) + '. Constants: ' + t(pn(T.q) + 'm=' + T.c) + ', so ' + t('m=' + T.s) + '.<br>' + t(br(T.F1) + br(T.F2) + '=' + splitTex(T) + '=' + T.tex) + ', so ' + t('b=' + T.b) + '.',
            ['The leading coefficients multiply to ' + t(T.a) + ' and the constants to ' + t(T.c) + '. Then expand to find ' + t('b') + '.'], 'b and other factor');
          p.bad = [[String(-T.b), tx(T.F2)]];
          return p;
        } }] },
      { num: '14', stem: function (sh) { return t('ax^{2}+bx+c') + ' factors as ' + t(br(sh.T.F1) + br(sh.T.F2)) + '.'; },
        shared: function (r) { var o = pick(r, { p: [2, 5], q: [-7, -1], r: [2, 5], s: [1, 5], book: { p: 3, q: -5, r: 4, s: 3 } }); return { T: Tri(o) }; },
        parts: [
          { id: 'e14a', level: 'BEG', make: function (r, sh) {
            var T = sh.T, vc = function (n, nm) { return function (s) { var x = readInt(s); if (x.res) return x.res; if (x.v === n) return ok(); if (x.v === -n) return wrong('sign', 'Check the sign of ' + t(nm) + '.'); return wrong('value', nm === 'b' ? 'Add the outside and inside products.' : null); }; };
            var p = fieldsPart('State ' + t('a') + ', ' + t('b') + ' and ' + t('c') + '.', [nbox(t('a')), nbox(t('b')), nbox(t('c'))], K.fields([vc(T.a, 'a'), vc(T.b, 'b'), vc(T.c, 'c')], { labels: ['a', 'b', 'c'] }), [String(T.a), String(T.b), String(T.c)], t('a=' + T.a + ',\\ b=' + T.b + ',\\ c=' + T.c),
              t(br(T.F1) + br(T.F2) + '=' + PL.seq([M(T.a, { x: 2 }), M(T.n, { x: 1 }), M(T.m, { x: 1 }), N(T.c)]) + '=' + T.tex) + ', so ' + t('a=' + T.a + ',\\ b=' + T.b + ',\\ c=' + T.c) + '.', ['Expand the two brackets and collect the middle terms.'], 'a, b, c from factors');
            p.bad = [[String(T.a), String(-T.b), String(T.c)]];
            return p;
          } },
          { id: 'e14b', level: 'EMG', make: function (r, sh) {
            var T = sh.T, pc = pairCheck(T.m, T.n, T.ac, T.b, ['First integer of the pair', 'Second integer of the pair'], 1);
            var chk = function (resp) { resp = resp || []; var x = readInt(resp[0]); if (x.res) return lab(x.res, 'ac'); if (x.v !== T.ac) return wrong('ax-ac-wrong', '<b>ac:</b> ' + t('a=' + T.a) + ' and ' + t('c=' + T.c) + '.'); return pc(resp); };
            var p = fieldsPart('State ' + t('ac') + ' and the pair of integers a student would find in step (2).', [nbox(t('ac')), nbox('Pair: first'), nbox('Pair: second')], chk, [String(T.ac), String(T.m), String(T.n)], t('ac=' + T.ac) + '; pair ' + t(T.m) + ' and ' + t(T.n),
              t('ac=' + T.a + '(' + T.c + ')=' + T.ac) + '. The pair with product ' + t(T.ac) + ' and sum ' + t(T.b) + ' is ' + t(T.m) + ' and ' + t(T.n) + ' — exactly the outside and inside products of ' + t(br(T.F1) + br(T.F2)) + '.', ['The pair is the outside and inside products of the two brackets (without the ' + t('x') + ').'], 'ac and pair');
            p.bad = [[String(T.ac), String(-T.m), String(-T.n)]]; if (T.a * T.b !== T.ac) p.bad.push([String(T.a * T.b), String(T.m), String(T.n)]);
            return p;
          } },
          { id: 'e14c', level: 'EMG', make: function (r, sh) {
            var T = sh.T, g1 = M(T.p, { x: 1 }), g2 = N(T.q), lb = ['First common factor', 'Second common factor'];
            var chk = function (resp) {
              resp = resp || [];
              var A = readPoly(resp[0]), C = readPoly(resp[1]);
              if (A.res) return lab(A.res, lb[0]); if (C.res) return lab(C.res, lb[1]);
              if (!PL.eq(A.p, g1)) return wrong('value', '<b>First:</b> the GCF of ' + t(tx(M(T.a, { x: 2 })) + ' and ' + tx(M(T.m, { x: 1 }))) + '.');
              if (PL.eq(C.p, PL.neg(g2))) return wrong('ax-group-sign', '<b>Second:</b> ' + t(tx(PL.neg(g2)) + br(T.F2) + '=' + tx(PL.mul(PL.neg(g2), T.F2))) + ', not ' + t(PL.seq([M(T.n, { x: 1 }), N(T.c)])) + '. The second group starts with a negative term, so take out a <b>negative</b> factor.');
              if (!PL.eq(C.p, g2)) return wrong('value', '<b>Second:</b> what times ' + t(br(T.F2)) + ' gives ' + t(PL.seq([M(T.n, { x: 1 }), N(T.c)])) + '?');
              return ok();
            };
            var p = fieldsPart('Split: ' + t(T.tex + '=' + splitTex(T)) + '. Grouping gives ' + t('\\square' + br(T.F2) + '+\\square' + br(T.F2)) + '. Fill in the two common factors.', [pbox(lb[0]), pbox(lb[1])], chk, [tx(g1), tx(g2)], t(groupTex(T)),
              t(splitTex(T) + '=' + groupTex(T) + '=' + br(T.F2) + br(T.F1)) + ' — the two given factors ✓', ['Take the GCF of the first two terms, then of the last two. The second group starts with a negative term.'], 'grouping returns factors');
            p.bad = [[tx(g1), tx(PL.neg(g2))]];
            return p;
          } }] },
      { num: '15', section: 'Extra practice F — Find the error', stem: function (sh) { return 'Asked to factor ' + t(sh.T.tex) + ', a student wrote: “I need two numbers with product ' + t(-sh.T.c) + ' and sum ' + t(sh.T.b) + ', so ' + t(sh.u) + ' and ' + t(sh.wv) + ': ' + t(sh.T.tex + '=' + sh.split) + '” — and then could not finish.'; },
        shared: function (r) {
          var T = null, u = 0;
          for (var i = 0; i < 600 && !T; i++) {
            var o = pick(r, { p: [1, 5], q: [-6, 6], r: [1, 5], s: [-6, 6], test: function (o) { return o.a >= 2 && o.a <= 6 && o.c < 0 && o.b > 0 && o.b <= 12; }, book: { p: 1, q: 2, r: 3, s: -2 } });
            for (var x = 1; x < o.b; x++) if (x * (o.b - x) === -o.c) { u = x; T = Tri(o); break; }
          }
          if (!T) { T = Tri({ p: 1, q: 2, r: 3, s: -2 }); u = 2; }
          var w = T.b - u, split = PL.seq([M(T.a, { x: 2 }), M(u, { x: 1 }), M(w, { x: 1 }), N(T.c)]);
          var g1 = gcd(T.a, u), g2 = gcd(w, T.c), B1 = lin(T.a / g1, u / g1), B2 = lin(w / g2, T.c / g2);
          return { T: T, u: u, wv: w, split: split, grouped: tx(M(g1, { x: 1 })) + br(B1) + '+' + g2 + br(B2), B1: B1, B2: B2 };
        },
        parts: [
          { id: 'e15a', level: 'EMG', make: function (r, sh) {
            var T = sh.T;
            return mcPart(r, 'The split really does equal the trinomial (' + t(sh.u + 'x+' + sh.wv + 'x=' + T.b + 'x') + '). So which step went wrong, and what should the product have been?', [
              { html: 'Step (2): the pair must have product ' + t('ac=' + T.a + '(' + T.c + ')=' + T.ac) + ', not ' + t(-T.c) + '.', right: true },
              { html: 'Step (2): the product should have been ' + t(-T.ac) + '.', why: 'The sign matters: ' + t('ac=' + T.a + '(' + T.c + ')=' + T.ac) + ', so the pair has opposite signs.' },
              { html: 'Step (3): the split is not equal to the trinomial.', why: 'Check: ' + t(sh.u + 'x+' + sh.wv + 'x=' + T.b + 'x') + '. The split is fine — the problem is the product the student used.' },
              { html: 'Step (4): the student grouped the terms the wrong way.', why: 'No grouping can work when the pair is wrong. Look at the product the student used.' }],
              'Step (2) went wrong: the student used product ' + t(-T.c) + ' (from ' + t('c') + ' alone). The product must be ' + t('ac=' + T.a + '(' + T.c + ')=' + T.ac) + '; only the sum is ' + t('b=' + T.b) + '.', ['The product of the pair is not ' + t('c') + ' when ' + t('a\\neq1') + '.'], 'wrong product in step 2');
          } },
          { id: 'e15b', level: 'EMG', make: function (r, sh) {
            return mcPart(r, 'Group the student’s four terms anyway. What happens?', [
              { html: t(sh.split + '=' + sh.grouped) + ': the brackets are different, so there is no common binomial to take out.', right: true },
              { html: t(sh.split + '=' + sh.grouped) + ', so the answer is ' + t(br(sh.B1) + br(sh.B2)) + '.', why: 'You can only take out a common binomial when <b>both</b> groups have the same bracket. Expand ' + t(br(sh.B1) + br(sh.B2)) + ' to see it isn’t equal.' },
              { html: 'Nothing goes wrong — grouping always works when the split equals the trinomial.', why: 'Grouping needs the pair to multiply to ' + t('ac') + '. Try it: the two brackets come out different.' },
              { html: 'It stalls because the trinomial cannot be factored.', why: 'It can be factored, with the right pair. The stall is a sign that the pair was wrong.' }],
              t(sh.split + '=' + sh.grouped) + '. The brackets ' + t(br(sh.B1)) + ' and ' + t(br(sh.B2)) + ' are different, so step (4) is impossible. The stall signals that the pair was wrong.', ['Take the GCF of the first two terms and of the last two. Are the brackets the same?'], 'grouping stalls');
          } },
          { id: 'e15c', level: 'EMG', make: function (r, sh) { return factorPart(sh.T, { prompt: 'Factor ' + t(sh.T.tex) + ' correctly.' }); } }] },
      { num: '16', stem: function (sh) { var T = sh.T; return 'Asked to factor ' + t(T.tex) + ', a second student wrote ' + t(T.tex + '=' + splitTex(T) + '=' + sh.stuG + '=' + sh.stuAns) + '.'; },
        shared: function (r) {
          var T = Tri(pick(r, { p: [2, 6], q: [-5, -1], r: [2, 5], s: [-5, -1], test: function (o) { return o.a <= 30; }, book: { p: 5, q: -3, r: 2, s: -1 } }));
          var wrongF = lin(T.p, -T.q);
          return { T: T, wrongF: wrongF, stuG: tx(M(T.p, { x: 1 })) + br(T.F2) + '+' + (-T.q) + br(T.F2), stuAns: br(T.F2) + br(wrongF), stuP: PL.mul(T.F2, wrongF) };
        },
        parts: [
          { id: 'e16a', level: 'BEG', make: function (r, sh) {
            return B.poly('Expand the student’s answer ' + t(sh.stuAns) + ' to show it is wrong.', sh.stuP, {}, t(sh.stuAns + '=' + tx(sh.stuP)) + ' ' + t('\\neq ' + sh.T.tex) + '. The ' + t('x^{2}') + ' coefficient is right, but the middle coefficient and the constant are wrong.', ['FOIL: first, outside, inside, last.'], 'expand wrong answer');
          } },
          { id: 'e16b', level: 'EMG', make: function (r, sh) {
            var T = sh.T, seg = PL.seq([M(T.n, { x: 1 }), N(T.c)]);
            return B.number('The split middle term is correct; the slip is in step (4). What common factor should come out of ' + t(seg) + ' so that the bracket matches ' + t(br(T.F2)) + '?', T.q, function (v) {
              if (v === -T.q) return { code: 'ax-same-sign', hint: 'That is what the student did: ' + t((-T.q) + br(T.F2) + '=' + tx(PL.mul(N(-T.q), T.F2))) + ', not ' + t(seg) + '. The group starts with a negative term.' };
              return null;
            }, 'From ' + t(seg) + ' take out ' + t(T.q) + ': ' + t(seg + '=' + T.q + br(T.F2)) + '. The student’s ' + t('+' + (-T.q) + br(T.F2) + '=' + tx(PL.mul(N(-T.q), T.F2))) + '.<br>Rule: when the third term of the split is negative, take out a <b>negative</b> common factor, so the second bracket matches the first.',
            ['Which number times ' + t(br(T.F2)) + ' gives ' + t(seg) + '?'], 'common factor of second group');
          } },
          { id: 'e16c', level: 'EMG', make: function (r, sh) { var p = factorPart(sh.T, { prompt: 'Finish the factoring correctly.' }); p.bad.push(sh.stuAns); return p; } }] },
      { num: '17', section: 'Extra practice G — Stretch', stem: 'A trinomial in ' + t('x^{2}') + ': decomposition works exactly as before, with ' + t('x^{2}') + ' playing the role of ' + t('x') + ' — and then each bracket factors again.', parts: [
        { id: 'e17a', level: 'ADV', make: function (r) { return quarticPart(r, 'x', [1, 1, 2, 3]); } },
        { id: 'e17b', level: 'ADV', make: function (r) { return quarticPart(r, 'y', [3, 2, 1, 2]); } },
        { id: 'e17c', level: 'EMG', make: function (r) {
          return mcPart(r, 'How do you know four brackets like ' + t('(x-1)(x+1)(2x-3)(2x+3)') + ' cannot be factored any further, and why is a factorization not finished at the decomposition stage?', [
            { html: 'Each bracket is a degree-1 binomial with no common factor, so none factors further. Decomposition only splits the trinomial into two factors — those can still factor again (here, as differences of squares).', right: true },
            { html: 'Because every bracket contains a minus or a plus sign, and signed brackets never factor.', why: t('x^{2}-9') + ' has a minus sign and still factors. What matters is the degree and any common factor.' },
            { html: 'Because decomposition always gives the complete factorization.', why: 'In ' + t('4x^{4}-13x^{2}+9') + ' decomposition gives ' + t('(x^{2}-1)(4x^{2}-9)') + ', and both brackets factor again.' },
            { html: 'Because four is the most factors a polynomial can have.', why: 'A polynomial of degree 4 can have at most four linear factors, but the reason each bracket stops is that it is linear with no common factor.' }],
            'Each of the four brackets is a linear binomial whose terms have no common factor, so none can be factored further. Decomposition only splits a trinomial into two factors; it doesn’t check whether those factors factor again — that is what “factor completely” means.', ['Could ' + t('2x-3') + ' be written as a product of two non-constant polynomials?'], 'factor completely');
        } }] },
      { num: '18', stem: function (sh) { return 'Substitution. In ' + t(sh.disp) + ' the repeated bracket ' + t('(m' + sg(-sh.h) + ')') + ' plays the role of the variable.'; },
        shared: function (r) {
          var o = pick(r, { p: [2, 3], q: [1, 6], r: [2, 3], s: [-5, -1], test: function (o) { return o.b > 0; }, book: { p: 2, q: 5, r: 2, s: -1 } }), h = 3;
          for (var i = 0; i < 50; i++) { h = r.int(1, 5); if (o.q - o.p * h !== 0 && o.s - o.r * h !== 0) break; }
          if (o.q - o.p * h === 0 || o.s - o.r * h === 0) { o = { p: 2, q: 5, r: 2, s: -1 }; h = 3; }
          var T = Tri({ p: o.p, q: o.q, r: o.r, s: o.s, v: 'u' }), G1 = lin(o.p, o.q - o.p * h, 'm'), G2 = lin(o.r, o.s - o.r * h, 'm'), ub = '(m' + sg(-h) + ')';
          return { T: T, h: h, G1: G1, G2: G2, E: PL.mul(G1, G2), ub: ub, disp: cf(T.a) + ub + '^{2}' + cfs(T.b) + ub + sg(T.c) };
        },
        parts: [
          { id: 'e18a', level: 'PRG', make: function (r, sh) { return factorPart(sh.T, { prompt: 'Let ' + t('u=m' + sg(-sh.h)) + ' and factor ' + t(sh.T.tex) + ' by decomposition.' }); } },
          { id: 'e18b', level: 'ADV', make: function (r, sh) {
            var T = sh.T, base = K.factored([sh.G2, sh.G1]);
            var chk = function (resp) {
              var res = base(resp); if (res.v !== 'correct') return res;
              var sp = FX.split(String(resp)); if (sp.ok && sp.factors.some(function (f) { return f.ast && PL.formIssue(f.ast); })) return form('ax-unsimplified', 'Right — now simplify inside each bracket, e.g. ' + t(T.p + sh.ub + sg(T.q) + '=' + tx(sh.G1)) + '.');
              return ok();
            };
            var key = FX.tex([sh.G2, sh.G1]);
            var p = B.math('Replace ' + t('u') + ' with ' + t('m' + sg(-sh.h)) + ' in your answer to (a) and simplify each bracket.', chk, key,
              t(br(T.F2) + '\\to ' + T.r + sh.ub + sg(T.s) + '=' + tx(sh.G2)) + ' and ' + t(br(T.F1) + '\\to ' + T.p + sh.ub + sg(T.q) + '=' + tx(sh.G1)) + '.<br>So ' + t(sh.disp + '=' + key) + '.',
              ['Substitute ' + t('m' + sg(-sh.h)) + ' for ' + t('u') + ' in each bracket, then expand and collect inside the bracket.'], 'substitution factoring', { keys: 'poly', vars: ['m'] });
            p.bad = ['(' + T.r + sh.ub + sg(T.s) + ')(' + T.p + sh.ub + sg(T.q) + ')', FX.tex([lin(T.p, T.q + T.p * sh.h, 'm'), lin(T.r, T.s + T.r * sh.h, 'm')])];
            p.good = [FX.tex([sh.G1, sh.G2])];
            return p;
          } },
          { id: 'e18c', level: 'PRG', make: function (r, sh) {
            var T = sh.T, h = sh.h, sqW = PL.add(PL.scale(PL.add(M(1, { m: 2 }), N(h * h)), T.a), PL.scale(lin(1, -h, 'm'), T.b), N(T.c));
            return B.poly('Check by expanding the original expression ' + t(sh.disp) + ' into the form ' + t('am^{2}+bm+c') + '.', sh.E, { wrong: PL.eq(sqW, sh.E) ? [] : [{ is: sqW, code: 'ax-sq-no-middle', hint: t(sh.ub + '^{2}=m^{2}' + sg(-2 * h) + 'm+' + h * h) + ' — don’t forget the middle term when you square the bracket.' }] },
              t(T.a + '(m^{2}' + sg(-2 * h) + 'm+' + h * h + ')' + cfs(T.b) + 'm' + sg(-T.b * h) + sg(T.c) + '=' + tx(sh.E)) + '.<br>Factoring it directly gives ' + t(FX.tex([sh.G2, sh.G1])) + ' — the same ✓',
              ['Expand ' + t(sh.ub + '^{2}') + ' first (it has a middle term), then distribute and collect.'], 'expand substitution');
          } }] },
      { num: '19', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: 'e19', level: 'EMG', make: function (r) {
          var T = tri(r, { p: [2, 6], q: [1, 9], r: [2, 6], s: [-9, -1], test: function (o) { return o.ac <= -100 && o.b > 0 && o.b <= 10; }, book: { p: 6, q: 5, r: 3, s: -2 } });
          return oneFactorMC(r, T, 'One factor of ' + t(T.tex) + ' is', 'one factor, large ac');
        } }] },
      { num: '20', stem: '<i>(Numerical Response)</i>', parts: [
        { id: 'e20', level: 'PRG', make: function (r) {
          var o = { A: 3, Bq: 5, C: 4, D: 7 };
          for (var i = 0; i < 500; i++) {
            var c = { A: r.int(2, 5), Bq: r.int(1, 9), C: r.int(2, 5), D: r.int(1, 9) }, a = c.A * c.C, b = c.A * c.D - c.Bq * c.C;
            if (gcd(c.A, c.Bq) !== 1 || gcd(c.C, c.D) !== 1 || !b || Math.pow(c.A, c.C) > 9999 || Math.pow(c.A, c.C) < 10) continue;
            var uniq = true; for (var A2 = 1; A2 <= a; A2++) if (a % A2 === 0 && A2 !== c.A && A2 * c.D - c.Bq * (a / A2) === b) uniq = false;
            if (!uniq) continue;
            o = c; break;
          }
          var T = Tri({ p: o.A, q: -o.Bq, r: o.C, s: o.D }), ans = Math.pow(o.A, o.C);
          return B.nr('The trinomial ' + t(T.tex) + ' factors as ' + t('(ax-' + o.Bq + ')(cx+' + o.D + ')') + ', where ' + t('a') + ' and ' + t('c') + ' are positive integers. The value of ' + t('a^{c}') + ' is ________.', ans, function (v) {
            if (v === Math.pow(o.C, o.A)) return { code: 'ax-digit-order', hint: 'That is ' + t('c^{a}') + '. Check which coefficient goes with ' + t('-' + o.Bq) + '.' };
            if (v === o.A * o.C) return { code: 'value', hint: t('a^{c}') + ' means ' + t('a') + ' to the power ' + t('c') + ', not ' + t('a\\times c') + '.' };
            return null;
          }, pairLine(T) + '<br>' + t(T.tex + '=' + splitTex(T) + '=' + groupTex(T) + '=' + br(T.F1) + br(T.F2)) + '<br>So ' + t('a=' + o.A) + ', ' + t('c=' + o.C) + ' and ' + t('a^{c}=' + o.A + '^{' + o.C + '}=' + ans) + '.',
          ['Factor by decomposition, then match the brackets to ' + t('(ax-' + o.Bq + ')(cx+' + o.D + ')') + '.'], 'a^c from factors');
        } }] }
    ]
  });

  /* ---------------- part makers that use the helpers above ---------------- */
  function groupPart(T) {
    var sp = splitTex(T), wr = [{ is: PL.mul(T.F2, lin(T.p, -T.q)), code: 'ax-group-sign', hint: 'Check the second group: ' + t(PL.seq([M(T.n, { x: 1 }), N(T.c)]) + '=' + tx(N(T.q)) + br(T.F2)) + '. Its common factor has the same sign as its first term.' }];
    return factorPart(T, { prompt: t(sp), wrong: wr, text: 'grouping ' + sp,
      sol: t(sp) + '<br>' + t('=' + groupTex(T)) + '<br>' + t('=' + br(T.F2) + br(T.F1)) + '<br>Check: ' + t(br(T.F2) + br(T.F1) + '=' + PL.seq([M(T.a, { x: 2 }), M(T.n, { x: 1 }), M(T.m, { x: 1 }), N(T.c)]) + '=' + T.tex) + ' ✓',
      hints: ['Take the GCF out of the first two terms, then out of the last two. Both brackets should match.'] });
  }
  function palin(r, book) { for (var i = 0; i < 200; i++) { var p = r.int(2, 7), q = r.int(2, 7); if (p !== q && gcd(p, q) === 1 && p * q <= 35) return [p, q]; } return book; }
  function pairPart(r, gen, book) {
    var o = null; for (var i = 0; i < 2000; i++) { var c = gen(); if (c.ok) { o = c; break; } }
    var m = o ? o.m : book[0], n = o ? o.n : book[1], ac = m * n, b = m + n;
    var lst = nt.divisors(Math.abs(ac)).filter(function (d) { return d * d <= Math.abs(ac); }).map(function (d) { var x = ac > 0 ? (b < 0 ? -d : d) : d, y = ac / x; return { x: x, y: y }; });
    if (ac < 0) lst = lst.map(function (pq) { var x = pq.x, y = pq.y; if ((x + y > 0) !== (b > 0)) { x = -x; y = -y; } return { x: x, y: y }; });
    var p = fieldsPart(t('ac=' + ac + ',\\quad b=' + b), [nbox('First integer'), nbox('Second integer')], pairCheck(m, n, ac, b), [String(m), String(n)], t(m) + ' and ' + t(n),
      t('ac=' + ac) + (ac > 0 ? ' > 0, so the pair shares a sign; ' + t('b=' + b) + ' makes both ' + (b > 0 ? 'positive' : 'negative') + '.' : ' < 0, so the signs differ; the sizes differ by ' + t(Math.abs(b)) + ' and the larger size takes the sign of ' + t('b') + '.') + '<br>'
        + lst.map(function (pq) { var s = pq.x + pq.y; return t('\\{' + pq.x + ',' + pq.y + '\\}\\to ' + s) + (s === b ? ' ✓' : ''); }).join('; ') + '<br>Pair: ' + t(m) + ' and ' + t(n) + '.',
      [ac > 0 ? 'The product is positive, so both numbers have the same sign as ' + t('b') + '.' : 'The product is negative, so the numbers have opposite signs; the bigger one (in size) has the sign of ' + t('b') + '.', 'List the factor pairs of ' + t(Math.abs(ac)) + ' in order: ' + t('1\\times ' + Math.abs(ac)) + ', ' + t('2\\times\\ldots') + ', …'], 'pair for ac=' + ac + ', b=' + b);
    p.bad = [[String(-m), String(-n)], [String(m), String(-n)]];
    return p;
  }
  function noPairPart(r) {
    var ac = 72, b = 11;
    for (var i = 0; i < 300; i++) {
      var a = r.pick([48, 60, 72, 84, 90, 96, 120, 144]), ds = nt.divisors(a).filter(function (d) { return d * d <= a; }), sums = ds.map(function (d) { return d + a / d; });
      var bb = r.int(5, 30); if (sums.indexOf(bb) >= 0 || bb >= Math.max.apply(null, sums)) continue;
      var best = ds.map(function (d) { return [d, a / d]; }).sort(function (x, y) { return Math.abs(x[0] + x[1] - bb) - Math.abs(y[0] + y[1] - bb); })[0];
      if (!best) continue; ac = a; b = bb; break;
    }
    var dl = nt.divisors(ac).filter(function (d) { return d * d <= ac; }), near = dl.map(function (d) { return [d, ac / d]; }).sort(function (x, y) { return Math.abs(x[0] + x[1] - b) - Math.abs(y[0] + y[1] - b); })[0];
    var u = Math.floor(b / 2) - 1; if (u < 1) u = 1; if (u * (b - u) === ac) u++;
    return mcPart(r, t('ac=' + ac + ',\\quad b=' + b) + '. Which is the pair of integers with this product and sum?', [
      { html: 'There is no such pair.', right: true },
      { html: t(near[0]) + ' and ' + t(near[1]), why: t(near[0] + '\\times ' + near[1] + '=' + ac) + ' ✓, but ' + t(near[0] + '+' + near[1] + '=' + (near[0] + near[1])) + ', not ' + t(b) + '.' },
      { html: t(u) + ' and ' + t(b - u), why: t(u + '+' + (b - u) + '=' + b) + ' ✓, but ' + t(u + '\\times ' + (b - u) + '=' + u * (b - u)) + ', not ' + t(ac) + '.' },
      { html: t(-near[0]) + ' and ' + t(-near[1]), why: 'Two negative numbers add to a negative number, but ' + t('b=' + b) + ' is positive.' }],
      t('ac=' + ac + '>0') + ' and ' + t('b>0') + ', so both integers would be positive. Pairs (sum): ' + dl.map(function (d) { return t('\\{' + d + ',' + ac / d + '\\}\\to ' + (d + ac / d)); }).join('; ') + '. None has sum ' + t(b) + ': <b>no such pair</b>.', ['List every factor pair of ' + t(ac) + ' and its sum.'], 'no pair for ac=' + ac + ', b=' + b);
  }
  function pairsTex(ac, b) {
    var out = [], d = nt.divisors(Math.abs(ac)).filter(function (x) { return x * x <= Math.abs(ac); });
    d.forEach(function (x) { var y = ac / x; if (ac > 0) { var s = b < 0 ? -1 : 1; out.push(t('\\{' + s * x + ',' + s * y + '\\}\\to ' + s * (x + y))); } else { out.push(t('\\{' + x + ',' + y + '\\}\\to ' + (x + y))); out.push(t('\\{' + (-x) + ',' + (-y) + '\\}\\to ' + (-x - y))); } });
    return out.join('; ');
  }
  function tenShared(r) {
    var F = [], Nn = [], used = {};
    for (var i = 0; i < 400 && F.length < 3; i++) {
      var o = pick(r, { p: [1, 5], q: [-6, 6], r: [2, 5], s: [-6, 6], test: function (o) { return o.a >= 4 && o.a <= 15 && Math.abs(o.c) <= 10 && Math.abs(o.b) <= 20; }, book: [{ p: 2, q: 3, r: 3, s: 2 }, { p: 2, q: 1, r: 5, s: -3 }, { p: 3, q: 2, r: 5, s: -3 }][F.length] });
      var T = Tri(o); if (used[T.tex]) continue; used[T.tex] = 1; F.push({ tex: T.tex, T: T, ac: T.ac, b: T.b });
    }
    var bookN = [[6, 5, 3], [9, -12, 5], [4, 7, -5]];
    for (i = 0; i < 2000 && Nn.length < 3; i++) {
      var a = r.int(4, 15), c = r.pick([-9, -7, -6, -5, -4, -3, -2, 2, 3, 4, 5, 6, 7, 9]), b = r.pick([-15, -13, -12, -11, -9, -8, -7, -5, -4, -3, -1, 1, 2, 3, 4, 5, 7, 8, 9, 11, 12, 13]);
      if (gcd(gcd(a, b), c) !== 1 || hasPair(a * c, b)) continue;
      var tex = tx(PL.add(M(a, { x: 2 }), M(b, { x: 1 }), N(c))); if (used[tex]) continue; used[tex] = 1; Nn.push({ tex: tex, T: null, ac: a * c, b: b });
    }
    while (Nn.length < 3) { var bn = bookN[Nn.length]; Nn.push({ tex: tx(PL.add(M(bn[0], { x: 2 }), M(bn[1], { x: 1 }), N(bn[2]))), T: null, ac: bn[0] * bn[2], b: bn[1] }); }
    var items = r.shuffle(F.concat(Nn));
    return { items: items, fac: items.map(function (it, i) { return it.T ? i : -1; }).filter(function (i) { return i >= 0; }) };
  }
  function tenFactor(sh, j) {
    var i = sh.fac[j], it = sh.items[i];
    return factorPart(it.T, { prompt: 'Factor trinomial (' + 'abcdef'.charAt(i) + '), ' + t(it.T.tex) + ', which does factor.' });
  }
  function quarticPart(r, v, book) {
    var o = null;
    for (var i = 0; i < 500; i++) {
      var A = r.int(1, 3), Bq = r.int(1, 4), C = r.int(1, 3), D = r.int(1, 5);
      if (gcd(A, Bq) !== 1 || gcd(C, D) !== 1 || (A === C && Bq === D) || A * A * C * C < 4) continue;
      var bb = A * A * D * D + Bq * Bq * C * C; if (bb > 60 || Bq * Bq * D * D > 100) continue;
      o = [A, Bq, C, D]; break;
    }
    o = o || book;
    var A2 = o[0] * o[0], B2 = o[1] * o[1], C2 = o[2] * o[2], D2 = o[3] * o[3], a = A2 * C2, b = -(A2 * D2 + B2 * C2), c = B2 * D2;
    var X2 = function (k, e) { var ob = {}; ob[v] = e; return M(k, ob); };
    var full = PL.add(X2(a, 4), X2(b, 2), N(c)), list = [lin(o[0], -o[1], v), lin(o[0], o[1], v), lin(o[2], -o[3], v), lin(o[2], o[3], v)];
    var Q1 = PL.add(X2(A2, 2), N(-B2)), Q2 = PL.add(X2(C2, 2), N(-D2)), key = FX.tex(list);
    var wr = [{ is: mulAll([lin(o[0], -o[1], v), lin(o[0], -o[1], v), lin(o[2], -o[3], v), lin(o[2], -o[3], v)]), code: 'ax-dos-square', hint: 'A difference of squares ' + t('a^{2}-b^{2}') + ' factors as ' + t('(a-b)(a+b)') + ', not ' + t('(a-b)^{2}') + '.' }];
    var p = B.factored(t(tx(full)), list, { wrong: wr },
      t('ac=' + a + '(' + c + ')=' + a * c) + '; the pair with product ' + t(a * c) + ' and sum ' + t(b) + ' is ' + t(-A2 * D2) + ' and ' + t(-B2 * C2) + '.<br>' + t(tx(full) + '=' + PL.seq([X2(a, 4), X2(-A2 * D2, 2), X2(-B2 * C2, 2), N(c)])) + '<br>' + t('=' + tx(X2(A2, 2)) + '(' + tx(Q2) + ')-' + B2 + '(' + tx(Q2) + ')=(' + tx(Q2) + ')(' + tx(Q1) + ')') + '<br>Each bracket is a difference of squares: ' + t(tx(Q1) + '=' + FX.tex(list.slice(0, 2))) + ', ' + t(tx(Q2) + '=' + FX.tex(list.slice(2))) + '.<br>So ' + t(tx(full) + '=' + key) + '.',
      ['Treat ' + t(v + '^{2}') + ' as the variable: ' + t('ac=' + a * c) + ', find the pair with sum ' + t(b) + ', split and group.', 'Then look at each bracket: is it a difference of squares?'], 'quartic ' + tx(full));
    p.bad = ['(' + tx(Q1) + ')(' + tx(Q2) + ')'];
    return p;
  }
})(window);
