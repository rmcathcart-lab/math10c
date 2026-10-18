/* Math 10C · Unit 4 · Lesson 6 — Choosing a Factoring Strategy (AN5)
 * Assignment questions 1–9 (u4_L06.tex) and the Lesson 6 Extra Practice (u4_EP06.tex).
 * Every part is a generator that keeps the booklet question's structure (which checklist step applies, signs, letters,
 * a GCF or a negative to take out first, the booklet's term order, perfect squares, blocks like x² or t³) and changes
 * the numbers; the booklet's own numbers are among the possible values. Expressions are built from their factors
 * (tri / dos / grp below), so keys, classic wrong answers and worked solutions all come from the same numbers.
 * "Name the method" / "explain the error" items are multiple choice or grids; "factor, or say it does not factor"
 * items use one poly box with a "none" key. Levels: LIM BEG EMG PRG ADV MAS. */
(function (root) {
  'use strict';
  var HW = root.HW, K = HW.kit, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form, B = K.P, P = HW.poly, FA = HW.factor;

  HW.addCodes({
    'swap-signs': 'Factor pair with both signs switched', 'pair-place': 'Numbers in the wrong brackets (middle term off)',
    'gcf-missing': 'Dropped the common factor', 'drop-var': 'Left the second variable out of the brackets',
    'dos-square': 'Wrote a difference of squares as a square', 'sum-squares': 'Factored a sum of squares as a difference',
    'sum-as-square': 'Wrote a sum of squares as a square', 'pst-as-dos': 'Wrote a perfect square as a difference of squares',
    'group-sign': 'Wrong sign on a group’s common factor', 'said-none': 'Said it does not factor (it does)',
    'not-none': 'Factored something that does not factor', 'none-hint': 'Rewrote an expression that does not factor',
    'not-finished': 'Accepted an answer that is not factored completely', 'gcf-neg': 'Positive GCF when the leading term is negative',
    'gcf-not-greatest': 'A common factor, but not the greatest', 'gcf-not-common': 'Not a factor of every term', 'gcf-sign': 'Wrong sign on the GCF',
    'terms-count': 'Wrong number of terms left in the bracket', 'k-half': 'Middle coefficient not doubled', 'k-squares': 'Added the squares instead of 2ab',
    'k-four': 'Middle coefficient doubled twice', 'k-sum': 'Added the square roots instead of 2ab', 'nr-forgot-a': 'Left a out of a + b + c',
    'nr-partial-gcf': 'Used the squares instead of their roots', 'pair-wrong': 'Pair does not multiply to ac and add to b', 'ac-wrong': 'Wrong value of ac',
    'expand-sign': 'Expanded a sum × difference as a sum', 'sub-wrong': 'Substitution arithmetic slip', 'group-gcf': 'Wrong common factor for a group'
  });

  /* ---------------- small helpers ---------------- */
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var r = a % b; a = b; b = r; } return a; }
  function M(c, v) { var o = {}; if (typeof v === 'string') { if (v) o[v] = 1; } else if (v) o = v; return P.mono(c, o); }
  function N(c) { return P.num(c); }
  function S() { return P.add.apply(null, arguments); }
  function tx(p) { return P.tex(p); }
  function lift(k) { return k == null ? N(1) : typeof k === 'number' ? N(k) : P.lift(k); }
  function isOne(p) { return P.eq(p, N(1)); }
  function lead(p) { var ts = P.sorted(p); return ts.length ? ts[0].c[0] / ts[0].c[1] : 0; }
  function two(r, a, b) { var x = r.int(a, b), y; do { y = r.int(a, b); } while (y === x); return [x, y]; }
  function cop(r, a, b, c, d) { var p, q; do { p = r.int(a, b); q = r.int(c, d); } while (gcd(p, q) !== 1 || p === q); return [p, q]; }
  function isSq(n) { var s = Math.round(Math.sqrt(Math.abs(n))); return n >= 0 && s * s === n; }
  function msqrt(m) { var T = P.terms(m)[0], v = {}; Object.keys(T.v).forEach(function (x) { v[x] = T.v[x] / 2; }); return P.mono(Math.round(Math.sqrt(T.c[0] / T.c[1])), v); }
  function sqx(m) { var s = tx(m); return /^(\d+|[a-z])$/.test(s) ? s : '(' + s + ')'; }
  function pz(m) { return '(' + tx(m) + ')'; }
  function kpre(k) { var s = tx(k); return s === '1' ? '' : s === '-1' ? '-' : s; }
  function plain(s) { return String(s).replace(/\\left|\\right|\\,/g, '').replace(/[{}]/g, ''); }
  function lst(list) { return FA.tex(list); }
  function nn(n) { return n < 0 ? '(' + n + ')' : String(n); }
  function hasPair(prod, sum) { var m = Math.abs(prod); if (!m) return true; for (var d = 1; d <= m; d++) if (m % d === 0) { var e = prod / d; if (d + e === sum || -d - e === sum) return true; } return false; }
  function pairs(n) { var out = [], m = Math.abs(n); for (var d = 1; d * d <= m; d++) if (m % d === 0) { if (n > 0) out.push([d, m / d]); else { out.push([d, -m / d]); if (d * d !== m) out.push([-d, m / d]); } } return out; }
  /* "the pairs 1, 15 and 3, 5 give sums 16 and 8" — for a trinomial that does not factor */
  function noPairText(prod, sum) {
    var ps = pairs(prod), list = ps.map(function (p) { return t(p[0] + ',\\ ' + p[1]); }), sums = ps.map(function (p) { return t(p[0] + p[1]); });
    var and = function (a) { return a.length === 1 ? a[0] : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; };
    return 'Product ' + t(prod) + ', sum ' + t(sum) + ': the ' + (ps.length === 1 ? 'only pair is ' : 'pairs ') + and(list) + (ps.length === 1 ? ', with sum ' : ' give sums ') + and(sums) +
      (prod > 0 ? (ps.length === 1 ? ' (the negative pair gives the opposite sum)' : ' (the negative pairs give the opposite sums)') : '') + '. None adds to ' + t(sum) + '.';
  }
  var X = M(1, 'x');
  function V(n) { return M(1, n); }

  /* ---------------- problems built from their factors ----------------
   * Each returns { expr, tex, list, keyTex, sol, wrongs, hints, text, … }. */

  /* trinomial k·(aX + uY)(bX + vY). X, Y monomials (Y = 1 by default; X may be a block like x² or t³). */
  function tri(o) {
    var Xm = o.X, Y = o.Y || N(1), k = lift(o.k), a = o.a, u = o.u, b = o.b, v = o.v;
    var f1 = S(P.scale(Xm, a), P.scale(Y, u)), f2 = S(P.scale(Xm, b), P.scale(Y, v));
    var inner = P.mul(f1, f2), expr = P.mul(k, inner), hasK = !isOne(k);
    var A = a * b, Bm = a * v + b * u, C = u * v, pst = a === b && u === v;
    var XX = P.pow(Xm, 2), XY = P.mul(Xm, Y), YY = P.pow(Y, 2), fix = o.fix || function (s) { return s; };
    var list = (hasK ? [k] : []).concat(pst ? [{ p: f1, k: 2 }] : [f1, f2]);
    var tex = fix(o.tex || P.tex(expr, { order: o.order }));
    var keyTex = fix(o.keyTex || lst(list));
    var blk = P.degree(Xm) > 1 ? tx(Xm) : null, twoVar = P.vars(Y).length > 0;
    var L = [];
    if (o.reorder) L.push('<b>Write it in descending order first:</b> ' + t(tex + '=' + fix(tx(expr))) + '.');
    if (hasK) L.push((lead(k) < 0 ? '<b>Common factor first</b> — the leading coefficient is negative, so take out ' + t(tx(k)) + ' (every sign in the bracket changes): ' : '<b>Common factor first:</b> every term is divisible by ' + t(tx(k)) + '. ') +
      t(fix(tx(expr)) + '=' + kpre(k) + '(' + fix(tx(inner)) + ')'));
    var desc = (blk ? 'a trinomial in ' + t(blk) + ', ' : twoVar ? 'a trinomial in two variables, ' : '');
    var split = fix(P.seq([P.scale(XX, A), P.scale(XY, a * v), P.scale(XY, b * u), P.scale(YY, C)]));
    if (pst) {
      var aX = P.scale(Xm, Math.abs(a)), uY = P.scale(Y, Math.abs(u));
      L.push('<b>Three terms — spot the perfect square trinomial.</b> ' + t(fix(tx(P.scale(XX, A))) + '=' + sqx(aX) + '^{2}') + ', ' + t(fix(tx(P.scale(YY, C))) + '=' + sqx(uY) + '^{2}') + ' and ' +
        t(fix(tx(P.scale(XY, Bm))) + '=' + (Bm < 0 ? '-' : '') + '2' + pz(aX) + pz(uY)) + '.');
      if (A === 1) L.push('(By inspection: product ' + t(C) + ', sum ' + t(Bm) + ': ' + t(u) + ' and ' + t(u) + '.)');
    } else if (A === 1) {
      L.push('<b>Three terms — ' + desc + t('a=1') + ' ⇒ inspection.</b>' + (blk ? ' Treat ' + t(blk) + ' as one block.' : '') + ' Product ' + t(C) + ', sum ' + t(Bm) + ': ' + t(u) + ' and ' + t(v) + '.');
    } else {
      L.push('<b>Three terms — ' + desc + t('a\\neq 1') + ' ⇒ decomposition.</b>' + (blk ? ' Treat ' + t(blk) + ' as one block.' : '') + ' ' + t('ac=' + A + '\\times ' + nn(C) + '=' + A * C) + ', sum ' + t(Bm) + ': ' + t(a * v) + ' and ' + t(b * u) + '.');
      var aXs = P.scale(Xm, a), uYs = P.scale(Y, u), ft = fix(tx(f2));
      L.push(t(split + '=' + fix(tx(aXs)) + '(' + ft + ')' + (lead(uYs) > 0 ? '+' : '') + fix(tx(uYs)) + '(' + ft + ')'));
      L.push(t('=' + fix(lst([f2, f1]))));
    }
    L.push(t(tex + '=' + keyTex));
    if (o.check) L.push('Check: ' + t(fix(lst([f1, f2])) + '=' + split + '=' + fix(tx(inner))) + ' ✓');
    var W = [], pre = hasK ? [k] : [];
    var s1 = S(P.scale(Xm, a), P.scale(Y, -u)), s2 = S(P.scale(Xm, b), P.scale(Y, -v));
    if (!pst) W.push({ is: pre.concat([s1, s2]), code: 'swap-signs', hint: A === 1 ? 'Close — your two numbers multiply to ' + t(C) + ' but add to ' + t(-Bm) + ', not ' + t(Bm) + '. Switch the sign of both numbers.'
      : 'Close — the first and last terms are right, but your middle term comes out as ' + t(fix(tx(P.scale(XY, -Bm)))) + '. Switch the signs in both brackets.' });
    if (a !== b) W.push({ is: pre.concat([S(P.scale(Xm, a), P.scale(Y, v)), S(P.scale(Xm, b), P.scale(Y, u))]), code: 'pair-place',
      hint: 'The first and last terms are right, but the middle term isn’t: the outside and inside products must add to ' + t(fix(tx(P.scale(XY, Bm)))) + '. Swap the numbers between the brackets — or decompose: split the middle term with two numbers that multiply to ' + t('ac=' + A * C) + ' and add to ' + t(Bm) + '.' });
    if (hasK) W.push({ is: pst ? [{ p: f1, k: 2 }] : [f1, f2], code: 'gcf-missing', hint: 'Your brackets are right, but you dropped the common factor ' + t(tx(k)) + ' that you took out first. Keep it in front of the brackets.' });
    if (twoVar) W.push({ is: pre.concat([S(P.scale(Xm, a), N(u)), S(P.scale(Xm, b), N(v))]), code: 'drop-var', hint: 'Each bracket needs ' + t(fix(tx(Y))) + ' in its second term — the last term of the trinomial is ' + t(fix(tx(P.scale(YY, C)))) + '.' });
    if (pst) W.push({ is: pre.concat([f1, S(P.scale(Xm, a), P.scale(Y, -u))]), code: 'pst-as-dos', hint: 'A sum times a difference gives a <b>difference of squares</b> — it has no middle term. This trinomial is a perfect square: the same binomial twice, ' + t('(A' + (u < 0 ? '-' : '+') + 'B)^{2}') + '.' });
    var H = [];
    if (o.reorder) H.push('Write the terms in descending order first.');
    if (hasK) H.push('Checklist step 1: every term shares a common factor. Take out ' + t(tx(k)) + ' first' + (lead(k) < 0 ? ' — a negative one, because the leading coefficient is negative' : '') + '.');
    if (pst) H.push('Are the first and last terms perfect squares? Is the middle term twice the product of their square roots?');
    else if (A === 1) H.push('Find two integers that multiply to ' + t(C) + ' and add to ' + t(Bm) + '.' + (blk ? ' Treat ' + t(blk) + ' as one block.' : ''));
    else H.push('Decomposition: find two integers that multiply to ' + t('ac=' + A * C) + ' and add to ' + t(Bm) + ', split the middle term, then group.');
    return { expr: expr, inner: inner, k: k, f1: f1, f2: f2, tex: tex, list: list, keyTex: keyTex, sol: L.join('<br>'), wrongs: W, hints: H, text: 'factor ' + plain(tex),
      A: A, Bm: Bm, C: C, pst: pst, method: pst ? 'pst' : A === 1 ? 'insp' : 'dec', good: o.good };
  }

  /* difference of squares k·(A² − B²), A, B monomials. o.again: A and B are squares too, so A − B factors again. */
  function dos(o) {
    var k = lift(o.k), A = o.A, Bq = o.B, hasK = !isOne(k), pre = hasK ? [k] : [];
    var inner = P.sub(P.pow(A, 2), P.pow(Bq, 2)), expr = P.mul(k, inner), mi = P.sub(A, Bq), pl = P.add(A, Bq);
    var U, Vv, list;
    if (o.again) { U = msqrt(A); Vv = msqrt(Bq); list = pre.concat([P.sub(U, Vv), P.add(U, Vv), pl]); } else list = pre.concat([mi, pl]);
    var tex = o.tex || P.tex(expr, { order: o.order }), io = o.reorder ? undefined : o.order;
    var innerTex = P.tex(inner, { order: io }), sm = function (a, b) { return '(' + P.seq([a, P.neg(b)]) + ')'; }, sp = function (a, b) { return '(' + P.seq([a, b]) + ')'; };
    var keyTex = kpre(k) + (o.again ? sm(U, Vv) + sp(U, Vv) + sp(A, Bq) : sm(A, Bq) + sp(A, Bq));
    var L = [];
    if (o.reorder) L.push('<b>Reorder first:</b> ' + t(tex + '=' + tx(expr)) + '.');
    if (hasK) L.push((lead(k) < 0 ? '<b>Common factor first</b> — the leading coefficient is negative, so take out ' + t(tx(k)) + ': ' : '<b>Common factor first:</b> every term is divisible by ' + t(tx(k)) + '. ') + t((o.reorder ? tx(expr) : tex) + '=' + kpre(k) + '(' + innerTex + ')'));
    L.push('<b>Two terms ⇒ difference of squares:</b> ' + t(innerTex + '=' + sqx(A) + '^{2}-' + sqx(Bq) + '^{2}') + '.');
    L.push(t('=' + kpre(k) + sm(A, Bq) + sp(A, Bq)));
    if (o.again) {
      L.push(t(P.seq([A, P.neg(Bq)])) + ' is still a difference of squares, ' + t(sqx(U) + '^{2}-' + sqx(Vv) + '^{2}') + '; ' + t(P.seq([A, Bq])) + ' is a <b>sum</b> of squares and does not factor.');
      L.push(t('=' + keyTex));
    }
    if (o.reorder || hasK || o.again) L.push(t(tex + '=' + keyTex));
    var W = [];
    W.push({ is: pre.concat([{ p: mi, k: 2 }]), code: 'dos-square', hint: 'A difference of squares factors into a <b>sum times a difference</b>, ' + t('A^{2}-B^{2}=(A-B)(A+B)') + '. A square like ' + t('(A-B)^{2}') + ' would have a middle term.' });
    W.push({ is: pre.concat([{ p: pl, k: 2 }]), code: 'dos-square', hint: 'A difference of squares factors into a <b>sum times a difference</b>, ' + t('A^{2}-B^{2}=(A-B)(A+B)') + '. A square like ' + t('(A+B)^{2}') + ' would have a middle term.' });
    if (hasK) W.push({ is: o.again ? [P.sub(U, Vv), P.add(U, Vv), pl] : [mi, pl], code: 'gcf-missing', hint: 'Your brackets are right, but you dropped the common factor ' + t(tx(k)) + ' that you took out first. Keep it in front of the brackets.' });
    if (o.again) {
      W.push({ is: pre.concat([P.sub(U, Vv), P.add(U, Vv), { p: P.add(U, Vv), k: 2 }]), code: 'sum-as-square', hint: t(P.seq([A, Bq])) + ' is a <b>sum</b> of squares — it does not factor. ' + t('(' + P.seq([U, Vv]) + ')^{2}') + ' would have a middle term.' });
      W.push({ is: pre.concat([P.sub(U, Vv), P.add(U, Vv), P.sub(U, Vv), P.add(U, Vv)]), code: 'sum-squares', hint: 'Only ' + t(P.seq([A, P.neg(Bq)])) + ' is a difference of squares. ' + t(P.seq([A, Bq])) + ' is a <b>sum</b> of squares and does not factor: ' + t(sm(U, Vv) + sp(U, Vv)) + ' multiplies to ' + t(P.seq([A, P.neg(Bq)])) + ', not ' + t(P.seq([A, Bq])) + '.' });
    }
    var H = [];
    if (o.reorder) H.push('Reorder the terms so the positive one comes first.');
    if (hasK) H.push('Checklist step 1: take out the common factor ' + t(tx(k)) + ' first.');
    H.push('Two terms with a minus sign between perfect squares: ' + t('A^{2}-B^{2}=(A-B)(A+B)') + '.');
    if (o.again) H.push('After the first step, check every bracket: can it be factored again?');
    return { expr: expr, inner: inner, k: k, tex: tex, list: list, keyTex: keyTex, sol: L.join('<br>'), wrongs: W, hints: H, text: 'factor ' + plain(tex), method: 'dos', A: A, B: Bq };
  }

  /* four terms (A1 + A2)(B1 + B2), written in the order A1B1, A1B2, A2B1, A2B2 (o.idx reorders the display) */
  function grp(o) {
    var A1 = o.A1, A2 = o.A2, B1 = o.B1, B2 = o.B2;
    var t4 = [P.mul(A1, B1), P.mul(A1, B2), P.mul(A2, B1), P.mul(A2, B2)];
    var f1 = S(A1, A2), f2 = S(B1, B2), expr = P.mul(f1, f2), bt = P.seq([B1, B2]);
    var tex = P.seq(o.idx ? o.idx.map(function (i) { return t4[i]; }) : t4);
    var list = [f2, f1], keyTex = '(' + bt + ')(' + P.seq([A1, A2]) + ')';
    var L = ['<b>Four terms ⇒ grouping.</b>' + (lead(A2) < 0 ? ' The second pair starts with a minus sign, so take out ' + t(tx(A2)) + ' to make the brackets match.' : ''),
      t('(' + P.seq([t4[0], t4[1]]) + ')+(' + P.seq([t4[2], t4[3]]) + ')=' + tx(A1) + '(' + bt + ')' + (lead(A2) > 0 ? '+' : '') + tx(A2) + '(' + bt + ')'), t('=' + keyTex)];
    if (o.note) L.push(o.note);
    var W = [{ is: [f2, S(A1, P.neg(A2))], code: 'group-sign', hint: 'Check the common factor of the second pair, ' + t(P.seq([t4[2], t4[3]])) + ': it is ' + t(tx(A2)) + (lead(A2) < 0 ? ' — negative, because that pair starts with a minus sign. Then its bracket matches ' + t('(' + bt + ')') + '.' : '.') },
      { is: [S(B1, P.neg(B2)), f1], code: 'group-sign', hint: 'Your brackets give the wrong signs on two of the terms. Factor each pair again and make sure the two brackets match exactly.' }];
    return { expr: expr, tex: tex, list: list, keyTex: keyTex, sol: L.join('<br>'), wrongs: W, t4: t4, f1: f1, f2: f2,
      hints: ['Four terms: group the first two and the last two, and take the common factor out of each pair.', 'The two brackets must match. If the second pair starts with a minus sign, take out a negative.'], text: 'factor ' + plain(tex), method: 'grp' };
  }

  /* a "factor completely" part from a problem */
  function fac(pr, o) {
    o = o || {};
    var T = pr.expr, seen = [], ws = [];
    pr.wrongs.concat(o.wrong || []).forEach(function (w) {
      if (!w) return; var p = FA.product(w.is);
      if (P.eq(p, T) || seen.some(function (q) { return P.eq(q, p); })) return;
      seen.push(p); ws.push({ is: w.is, code: w.code, hint: w.hint });
    });
    var part = B.factored(o.prompt || t(pr.tex), pr.list, { wrong: ws, keyTex: pr.keyTex, gcfOnly: o.gcfOnly }, o.sol || pr.sol, o.hints || pr.hints, o.text || pr.text);
    part.bad = ws.map(function (w) { return lst(w.is); }).concat(o.bad || []);
    part.good = [lst(pr.list.slice().reverse()), lst(pr.list)].concat(pr.good || [], o.good || []);
    return part;
  }
  /* a checker that turns "not factored completely" nudges into real mistakes (for "is it finished?" questions) */
  function strict(chk, msg) {
    return function (resp) { var r = chk(resp); if (r.v === 'form' && (r.code === 'factor-more' || r.code === 'gcf-inside')) return wrong('not-finished', (msg ? msg + ' ' : '') + r.hint.replace(/^Equal, but not factored completely: /, 'Not finished: ')); return r; };
  }
  function polyBox(vars, none) { return { name: '', label: '', mode: 'math', keys: 'poly', vars: vars, none: !!none, wide: true, placeholder: 'e.g. 3x(x - 4)(x + 2)' }; }
  /* "Factor completely, or press none": pr = problem (it factors) or null with o.expr (it does not) */
  function fnone(pr, o) {
    o = o || {};
    var T = pr ? pr.expr : o.expr, vars = P.vars(T), chk, key, answer;
    if (pr) {
      var ws = pr.wrongs.concat(o.wrong || []).filter(function (w) { return w && !P.eq(FA.product(w.is), T); });
      var base = K.factored(pr.list, { wrong: ws });
      chk = function (s) { if (s === 'none') return wrong('said-none', 'It does factor. ' + (o.why || pr.hints[pr.hints.length - 1])); return base(s); };
      key = pr.keyTex; answer = t(pr.tex + '=' + pr.keyTex);
    } else {
      chk = function (s) {
        if (s === 'none') return ok();
        var a = K.read(s); if (a.res) return a.res;
        var rd = P.read(a.ast); if (!rd.ok) return wrong('value', null);
        if (P.eq(rd.p, T)) return form('none-hint', 'That’s the expression again. If it can’t be factored over the integers, press <b>none</b>.');
        return wrong('not-none', 'Your factors multiply to ' + t(tx(rd.p)) + ', not ' + t(tx(T)) + '. ' + (o.whyNot || 'Check whether any factorization really works — if none does, press <b>none</b>.'));
      };
      key = 'none'; answer = 'Does not factor over the integers';
    }
    var p = B.fields(o.prompt || t(pr ? pr.tex : o.tex), [polyBox(vars, true)], [chk], [key], answer, o.sol || pr.sol, o.hints || (pr ? pr.hints : []), o.text || (pr ? pr.text : 'factor or none: ' + plain(o.tex)));
    p.bad = pr ? [['none']].concat(ws.map(function (w) { return [lst(w.is)]; })) : (o.bad || []).map(function (b) { return [b]; });
    p.good = pr ? [[lst(pr.list.slice().reverse())]] : [];
    return p;
  }
  /* GCF box checker: target monomial g (sign included) */
  function gcfChk(g, terms) {
    var G = P.terms(g)[0];
    function divides(m, n) { var a = P.terms(m)[0], b = P.terms(n)[0]; if (!a || !b) return false; if (b.c[0] % a.c[0] !== 0) return false; return Object.keys(a.v).every(function (x) { return (b.v[x] || 0) >= a.v[x]; }); }
    return function (resp) {
      var a = K.read(resp); if (a.res) return a.res;
      var rd = P.read(a.ast); if (!rd.ok || P.count(rd.p) !== 1) return wrong('value', 'The GCF is a single term (a monomial), like ' + t('3x') + '.');
      if (P.eq(rd.p, g)) return ok();
      if (P.eq(rd.p, P.neg(g))) return G.c[0] < 0 ? wrong('gcf-neg', 'Right size — but the leading coefficient is negative, so take out a <b>negative</b> common factor.') : wrong('gcf-sign', 'Check the sign: the leading term is positive, so the GCF is positive.');
      var m = rd.p, mp = P.terms(m)[0].c[0] < 0 ? P.neg(m) : m, gp = G.c[0] < 0 ? P.neg(g) : g;
      if (!terms.every(function (T) { return divides(mp, T); })) return wrong('gcf-not-common', t(tx(m)) + ' doesn’t divide every term. Check each term’s number and each variable’s exponent.');
      if (divides(mp, gp)) return wrong('gcf-not-greatest', t(tx(m)) + ' is a common factor, but not the <b>greatest</b> one. Is there more that every term shares (a bigger number, or more of a variable)?');
      return wrong('value', null);
    };
  }

  /* ---------------- method choices (grids) ---------------- */
  var MCOL = [{ id: 'gcf', html: 'GCF' }, { id: 'dos', html: 'diff.<br>sq.' }, { id: 'insp', html: 'insp.' }, { id: 'dec', html: 'dec.' }, { id: 'grp', html: 'grp.' }, { id: 'none', html: 'none' }];
  var LEG = { gcf: '<b>GCF</b> = common factor only', dos: '<b>diff. sq.</b> = difference of squares', insp: '<b>insp.</b> = inspection', dec: '<b>dec.</b> = decomposition', grp: '<b>grp.</b> = grouping', none: '<b>none</b> = does not factor' };
  function legend(cols, over) { return '<div class="w-help">' + cols.map(function (c) { return (over && over[c.id]) || LEG[c.id]; }).join(' · ') + '</div>'; }
  var MNAME = { gcf: 'common factor only', dos: 'difference of squares', insp: 'inspection', dec: 'decomposition', grp: 'grouping', none: 'does not factor' };
  var NUDGE = {
    gcf: 'take out the GCF first — can what is left be factored at all?',
    dos: 'two terms — are both perfect squares, with a minus sign between them?',
    insp: 'three terms — look at the leading coefficient (after any GCF).',
    dec: 'three terms — is the leading coefficient ' + t('1') + '?',
    grp: 'count the terms again.',
    none: 'two perfect squares with a <b>plus</b> sign between them — can a sum of squares be factored?'
  };
  function methodGrid(prompt, rows, cols, sol, text) {
    var want = {}; rows.forEach(function (rw) { want[rw.id] = rw.m; });
    return B.grid(prompt + legend(cols, { none: cols.length === 5 && cols[4].id === 'none' ? '<b>none</b> = nothing more to do' : null }), rows.map(function (rw) { return { id: rw.id, html: rw.label || rw.html }; }), cols, want, {
      why: function (id) { var rw = rows.filter(function (x) { return x.id === id; })[0]; return { code: 'row', hint: 'Look at ' + rw.html + ' again: ' + (rw.nudge || NUDGE[rw.m]) }; }
    }, sol, ['Run the checklist in order: common factor? then count the terms — two (difference of squares?), three (' + t('a=1') + ': inspection; ' + t('a\\neq1') + ': decomposition), four (grouping).'], text);
  }

  /* ---------------- multiple choice helpers ---------------- */
  function mcPart(r, prompt, opts, sol, hints, text, keepOrder) { return B.mc(r, prompt, opts, sol, hints, text, keepOrder); }

  /* ---------------- generators reused in several places ---------------- */
  // (ax + u)(bx − v), primitive, a·b ≥ 4 (decomposition), middle ≠ 0
  function decPair(r, A, Bs, U, Vs, sign) {
    for (var i = 0; i < 400; i++) {
      var a = r.pick(A), b = r.pick(Bs), u = r.int(U[0], U[1]), v = r.int(Vs[0], Vs[1]);
      if (gcd(a, u) !== 1 || gcd(b, v) !== 1) continue;
      var mid = -a * v + b * u; if (!mid) continue; if (sign === '+' && mid < 0) continue; if (sign === '-' && mid > 0) continue;
      if (a === b && u === v) continue;
      return { a: a, u: u, b: b, v: v, mid: mid };
    }
    return { a: 2, u: 3, b: 3, v: 4, mid: 1 };
  }
  function irreducibleMonic(r, bLo, bHi, cLo, cHi, cSign) {
    for (var i = 0; i < 400; i++) { var b = r.int(bLo, bHi) * (r.chance(0.5) && cSign === 'any' ? -1 : 1), c = r.int(cLo, cHi) * (cSign === '-' ? -1 : 1); if (!hasPair(c, b)) return { b: b, c: c }; }
    return { b: 6, c: 15 };
  }

  HW.defineLesson({
    id: 'u4l6', unit: 4, num: '6', title: 'Choosing a Factoring Strategy', outcome: 'AN5',
    blurb: 'No new technique — a checklist for picking the right tool (common factor, difference of squares, inspection, decomposition, grouping), then a mixture of expressions to factor completely.',
    questions: [
      /* ---------- Part A ---------- */
      { num: '1', section: 'Part A — Choosing and Using a Strategy', stem: 'Factor completely. Run the checklist first: common factor? Then count the terms. (For (b), the worked solution shows the check by expanding.)', parts: [
        { id: '1a', level: 'BEG', make: function (r) { return fac(dos({ A: X, B: N(r.int(6, 15)) })); } },
        { id: '1b', level: 'BEG', make: function (r) {
          var p, q; do { p = r.int(4, 12); q = r.int(2, p - 1); } while (p * q > 96);
          return fac(tri({ a: 1, u: -p, b: 1, v: q, X: X, check: true }));
        } },
        { id: '1c', level: 'EMG', make: function (r) {
          var k = r.pick([2, 3, 5, 6, 7]), mn = r.pick([[2, 1], [2, 3], [2, 5], [3, 1], [3, 2], [3, 4], [3, 5], [2, 3], [1, 2], [1, 3]]), m = mn[0], n = mn[1];
          var inner = S(M(m * m, { x: 2 }), N(n * n)), expr = P.mul(N(k), inner), tex = tx(expr), keyTex = k + '(' + tx(inner) + ')';
          var pr = { expr: expr, tex: tex, list: [N(k), inner], keyTex: keyTex, text: 'factor ' + plain(tex),
            sol: '<b>Common factor first:</b> ' + t(tex + '=' + keyTex) + '.<br>' + t(tx(inner) + '=' + sqx(M(m, 'x')) + '^{2}+' + n + '^{2}') + ' is a <b>sum</b> of squares, which does not factor over the integers, so this is fully factored.<br>' + t(tex + '=' + keyTex),
            hints: ['Checklist step 1: every term is divisible by ' + t(k) + '.', 'Then look at the two terms left. Is it a <b>difference</b> of squares?'],
            wrongs: [{ is: [N(k), S(M(m, 'x'), N(-n)), S(M(m, 'x'), N(n))], code: 'sum-squares', hint: t(tx(inner)) + ' is a <b>sum</b> of squares. ' + t('(' + m + 'x-' + n + ')(' + m + 'x+' + n + ')') + ' multiplies to ' + t(tx(P.sub(M(m * m, { x: 2 }), N(n * n)))) + ', a difference. A sum of squares does not factor.' },
              { is: [N(k), { p: S(M(m, 'x'), N(n)), k: 2 }], code: 'sum-as-square', hint: t('(' + tx(S(M(m, 'x'), N(n))) + ')^{2}') + ' has a middle term. A sum of squares, ' + t(tx(inner)) + ', does not factor.' },
              { is: [inner], code: 'gcf-missing', hint: 'Take out the common factor ' + t(k) + ' first.' }] };
          var part = fac(pr); part.good = [];
          return part;
        } },
        { id: '1d', level: 'EMG', make: function (r) {
          var p = r.int(1, 5), q = r.int(1, 6), b = V('b');
          return fac(grp({ A1: M(1, { b: 2 }), A2: N(q), B1: b, B2: N(p), note: t('b^{2}+' + q) + ' is a sum and does not factor, so this is complete.' }));
        } },
        { id: '1e', level: 'EMG', make: function (r) {
          var a, s, u; do { a = r.pick([2, 3, 5]); s = r.int(1, 6); u = r.int(1, 7); } while (gcd(a, u) !== 1 || u - a * s >= 0 || a * s * u > 72);
          return fac(tri({ a: 1, u: -s, b: a, v: u, X: V('q') }));
        } },
        { id: '1f', level: 'BEG', make: function (r) { var pq; do { pq = two(r, 2, 9); } while (pq[0] * pq[1] > 72); return fac(tri({ a: 1, u: Math.max(pq[0], pq[1]), b: 1, v: Math.min(pq[0], pq[1]), X: V('w') })); } }] },

      { num: '2', stem: 'Factor completely.', parts: [
        { id: '2a', level: 'EMG', make: function (r) {
          var a, s, u; do { a = r.pick([3, 5, 7]); s = r.int(2, 6); u = r.int(1, 9); } while (gcd(a, u) !== 1 || u - a * s >= 0 || u === s);
          return fac(tri({ a: 1, u: -s, b: a, v: u, X: X }));
        } },
        { id: '2b', level: 'PRG', make: function (r) {
          var a, u, s; do { a = r.pick([2, 3, 5]); u = r.int(2, 7); s = r.int(1, 4); } while (gcd(a, u) !== 1 || a * s - u === 0);
          var pr = tri({ k: -1, a: a, u: -u, b: 1, v: s, X: X, order: 'asc', reorder: true });
          pr.good = ['(' + u + '-' + a + 'x)(x+' + s + ')'];
          return fac(pr);
        } },
        { id: '2c', level: 'EMG', make: function (r) { return fac(dos({ A: V('m'), B: M(r.int(2, 12), 'n') })); } },
        { id: '2d', level: 'EMG', make: function (r) { var k = r.pick([2, 3, 5, 6, 7]), a = r.int(2, 9); return fac(dos({ k: k, A: N(a), B: V('z'), order: 'asc' })); } },
        { id: '2e', level: 'EMG', make: function (r) { var pq = two(r, 1, 9); return fac(tri({ a: 1, u: Math.max(pq[0], pq[1]), b: 1, v: Math.min(pq[0], pq[1]), X: M(1, { x: 2 }) })); } },
        { id: '2f', level: 'PRG', make: function (r) {
          var k, a, u, s; do { k = r.pick([2, 3, 4, 5]); a = r.pick([2, 3, 5]); u = r.int(1, 7); s = r.int(1, 6); } while (gcd(a, u) !== 1 || u - a * s >= 0);
          return fac(tri({ k: k, a: a, u: u, b: 1, v: -s, X: V('v') }));
        } }] },

      { num: '3', stem: 'Factor completely.', parts: [
        { id: '3a', level: 'EMG', make: function (r) { var us = two(r, 2, 9); return fac(grp({ A1: V('m'), A2: N(-us[1]), B1: V('n'), B2: N(us[0]) })); } },
        { id: '3b', level: 'PRG', make: function (r) { var pq = cop(r, 2, 9, 2, 9); return fac(tri({ a: pq[0], u: pq[1], b: pq[0], v: pq[1], X: V('a') })); } },
        { id: '3c', level: 'PRG', make: function (r) {
          var a, b, u, v; do { a = r.pick([2, 3, 4, 5]); b = r.pick([2, 3]); u = r.int(1, 7); v = r.int(1, 7); } while (gcd(a, u) !== 1 || gcd(b, v) !== 1 || (a === b && u === v) || a * v === b * u);
          return fac(tri({ a: a, u: u, b: b, v: v, X: V('g'), order: 'asc', reorder: true }));
        } },
        { id: '3d', level: 'PRG', make: function (r) { var k = r.pick([1, 1, 2, 3]), a = r.pick([1, 2, 3]); return fac(dos({ k: M(k, 'x'), A: M(1, { x: 2 }), B: N(a * a), again: true })); } },
        { id: '3e', level: 'PRG', make: function (r) { var a = r.pick([2, 3, 4, 5]); return fac(dos({ A: M(1, { t: 2 }), B: N(a * a), again: true, order: 'asc', reorder: true })); } }] },

      { num: '4', stem: 'Factor completely.', parts: [
        { id: '4a', level: 'PRG', make: function (r) { var p, q; do { p = r.int(5, 12); q = r.int(2, p - 2); } while (p * q > 96); return fac(tri({ a: 1, u: -p, b: 1, v: q, X: X, Y: V('y') })); } },
        { id: '4b', level: 'PRG', make: function (r) {
          var u, c, v; do { u = r.int(1, 5); c = r.pick([2, 3, 4, 5, 6]); v = r.int(1, 7); } while (gcd(c, v) !== 1 || (c === 1 && u === v) || v === c * u);
          return fac(tri({ a: 1, u: u, b: c, v: v, X: V('a'), Y: V('b') }));
        } }] },

      { num: '5', stem: '<i>(Explain your strategy)</i> For each polynomial, name the method you would use <b>first</b> and why. Then factor completely.',
        shared: function (r) {
          var k = r.pick([2, 3, 5]), n = r.int(2, 7);
          var d = decPair(r, [2, 3, 4], [2, 3], [1, 7], [1, 5]);
          var us = two(r, 2, 7);
          return { k: k, n: n, d: d, u: us[0], s: us[1] };
        },
        parts: [
          { id: '5a1', sub: 'a i', level: 'EMG', make: function (r, sh) {
            var pr = dos({ k: M(sh.k, 'x'), A: X, B: N(sh.n) });
            return mcPart(r, 'Which method should you use <b>first</b> on ' + t(pr.tex) + ', and why?', [
              { html: '<b>Common factor first</b>: every term shares ' + t(sh.k + 'x') + '. What is left, ' + t('x^{2}-' + sh.n * sh.n) + ', is then a difference of squares.', right: true },
              { html: '<b>Difference of squares</b> straight away: there are two terms with a minus sign between them.', why: 'Two terms is a good sign, but ' + t(sh.k + 'x^{3}') + ' and ' + t(sh.k * sh.n * sh.n + 'x') + ' are not perfect squares. Step 1 comes first: take out ' + t(sh.k + 'x') + ', then look again.' },
              { html: '<b>Inspection</b>: find two integers that multiply to ' + t(-sh.k * sh.n * sh.n) + '.', why: 'Inspection is for a trinomial ' + t('x^{2}+bx+c') + '. This has only two terms.' },
              { html: '<b>Grouping</b>: split it into two pairs.', why: 'Grouping needs four terms. This has two — and every term shares a common factor, so step 1 applies first.' }],
              'Every term shares ' + t(sh.k + 'x') + ', so <b>common factor first</b>: ' + t(pr.tex + '=' + sh.k + 'x(x^{2}-' + sh.n * sh.n + ')') + '. That leaves two terms, a difference of squares.', ['Checklist step 1: does every term share a factor?'], 'method for ' + plain(pr.tex));
          } },
          { id: '5a2', sub: 'a ii', level: 'PRG', make: function (r, sh) { return fac(dos({ k: M(sh.k, 'x'), A: X, B: N(sh.n) }), { prompt: 'Now factor ' + t(P.tex(P.mul(M(sh.k, 'x'), P.sub(M(1, { x: 2 }), N(sh.n * sh.n))))) + ' completely.' }); } },
          { id: '5b1', sub: 'b i', level: 'BEG', make: function (r, sh) {
            var d = sh.d, pr = tri({ a: d.a, u: d.u, b: d.b, v: -d.v, X: X });
            return mcPart(r, 'Which method should you use <b>first</b> on ' + t(pr.tex) + ', and why?', [
              { html: '<b>Decomposition</b>: three terms, no common factor, and the leading coefficient ' + t(pr.A) + ' is not ' + t('1') + '.', right: true },
              { html: '<b>Inspection</b>: three terms, so find two integers that multiply to ' + t(pr.C) + ' and add to ' + t(pr.Bm) + '.', why: 'Inspection only works when the leading coefficient is ' + t('1') + '. Here ' + t('a=' + pr.A) + ', so decompose using ' + t('ac=' + pr.A * pr.C) + '.' },
              { html: '<b>Common factor first</b>: every term shares a factor.', why: t(pr.A) + ', ' + t(pr.Bm) + ' and ' + t(pr.C) + ' have no common factor except ' + t('1') + ', and the last term has no ' + t('x') + '. There is nothing to take out.' },
              { html: '<b>Difference of squares</b>: the first term is a product of two equal factors.', why: 'A difference of squares has exactly two terms. This has three.' }],
              'No common factor; three terms with ' + t('a=' + pr.A + '\\neq 1') + ', so <b>decomposition</b>.', ['Count the terms, then look at the leading coefficient.'], 'method for ' + plain(pr.tex));
          } },
          { id: '5b2', sub: 'b ii', level: 'PRG', make: function (r, sh) { var d = sh.d, pr = tri({ a: d.a, u: d.u, b: d.b, v: -d.v, X: X }); return fac(pr, { prompt: 'Now factor ' + t(pr.tex) + ' completely.' }); } },
          { id: '5c1', sub: 'c i', level: 'BEG', make: function (r, sh) {
            var pr = grp({ A1: V('a'), A2: N(sh.u), B1: V('b'), B2: N(-sh.s) });
            return mcPart(r, 'Which method should you use <b>first</b> on ' + t(pr.tex) + ', and why?', [
              { html: '<b>Grouping</b>: four terms, and no factor is common to all four.', right: true },
              { html: '<b>Common factor</b>: every term shares a factor.', why: 'Look again: ' + t(pr.t4.map(tx).join(',\\ ')) + ' have no factor common to all four terms. <i>Pairs</i> share factors — that is what grouping uses.' },
              { html: '<b>Decomposition</b>: split the middle term.', why: 'Decomposition is for a trinomial (three terms). This already has four terms — it is like a decomposition with the split already done.' },
              { html: '<b>Difference of squares</b>: two of the terms are perfect squares.', why: 'A difference of squares has exactly two terms. This has four.' }],
              'Four terms and no common factor to all four, so <b>grouping</b>.', ['Count the terms.'], 'method for ' + plain(pr.tex));
          } },
          { id: '5c2', sub: 'c ii', level: 'EMG', make: function (r, sh) { var pr = grp({ A1: V('a'), A2: N(sh.u), B1: V('b'), B2: N(-sh.s) }); return fac(pr, { prompt: 'Now factor ' + t(pr.tex) + ' completely.' }); } }] },

      { num: '6', stem: 'Each factorization below has an error. Identify it, then write the correct factored form (or decide that it does not factor).',
        shared: function (r) {
          var p, q; do { p = r.int(3, 8); q = r.int(1, p - 1); } while (p * q > 30);
          return { k: r.pick([2, 3, 5, 7]), n: r.int(2, 7), m: r.int(2, 9), ck: r.pick([2, 3, 4, 5]), p: p, q: q };
        },
        parts: [
          { id: '6a1', sub: 'a i', level: 'EMG', make: function (r, sh) {
            var k = sh.k, n = sh.n, s = t(k + 'x^{2}-' + k * n * n + '=' + k + '(x^{2}-' + n * n + ')') + ', fully factored';
            return mcPart(r, 'A student writes ' + s + '. What is wrong?', [
              { html: 'It isn’t finished: ' + t('x^{2}-' + n * n) + ' is a difference of squares and still factors.', right: true },
              { html: 'The common factor should be ' + t(k * n * n) + ', not ' + t(k) + '.', why: t(k * n * n) + ' doesn’t divide ' + t(k + 'x^{2}') + '. The common factor ' + t(k) + ' is right — look at what is left in the bracket.' },
              { html: 'Nothing — once the common factor is out, the expression is fully factored.', why: 'Checklist step 6: look at each factor and ask whether <i>it</i> can be factored again. ' + t('x^{2}-' + n * n + '=x^{2}-' + n + '^{2}') + '.' },
              { html: 'The bracket should be ' + t('x^{2}+' + n * n) + '.', why: 'Expand: ' + t(k + '(x^{2}+' + n * n + ')=' + k + 'x^{2}+' + k * n * n) + ', which has the wrong sign. The bracket ' + t('x^{2}-' + n * n) + ' is correct.' }],
              'The student stopped one step early: ' + t('x^{2}-' + n * n + '=x^{2}-' + n + '^{2}') + ' is a difference of squares (checklist step 6).', ['After taking out the common factor, can the bracket be factored again?'], 'error: stopped early ' + k + '(x^2-' + n * n + ')');
          } },
          { id: '6a2', sub: 'a ii', level: 'BEG', make: function (r, sh) { var pr = dos({ k: sh.k, A: X, B: N(sh.n) }); return fac(pr, { prompt: 'Write the correct, complete factorization of ' + t(pr.tex) + '.' }); } },
          { id: '6b', sub: 'b', level: 'EMG', make: function (r, sh) {
            var m = sh.m, m2 = m * m;
            return mcPart(r, 'A student writes ' + t('x^{2}+' + m2 + '=(x+' + m + ')(x-' + m + ')') + '. Which statement is correct?', [
              { html: t('(x+' + m + ')(x-' + m + ')') + ' multiplies to ' + t('x^{2}-' + m2) + '. ' + t('x^{2}+' + m2) + ' is a <b>sum</b> of squares, so it does not factor over the integers.', right: true },
              { html: 'Both signs should be ' + t('+') + ': ' + t('x^{2}+' + m2 + '=(x+' + m + ')^{2}') + '.', why: 'Expand: ' + t('(x+' + m + ')^{2}=x^{2}+' + 2 * m + 'x+' + m2) + '. That has a middle term.' },
              { html: 'Nothing is wrong — the order of the factors doesn’t matter.', why: 'Expand the student’s answer: ' + t('(x+' + m + ')(x-' + m + ')=x^{2}-' + m2) + ', not ' + t('x^{2}+' + m2) + '.' },
              { html: 'It should be ' + t('(x-' + m + ')^{2}') + '.', why: 'Expand: ' + t('(x-' + m + ')^{2}=x^{2}-' + 2 * m + 'x+' + m2) + '. That has a middle term.' }],
              t('(x+' + m + ')(x-' + m + ')=x^{2}-' + m2) + '. ' + t('x^{2}+' + m2) + ' is a <b>sum</b> of squares and <b>does not factor</b> over the integers.', ['Expand the student’s answer. Do you get back ' + t('x^{2}+' + m2) + '?'], 'error: sum of squares x^2+' + m2);
          } },
          { id: '6c1', sub: 'c i', level: 'EMG', make: function (r, sh) {
            var k = sh.ck, b = sh.p - sh.q, c = sh.p * sh.q, given = t('-' + k + 'x^{2}+' + k * b + 'x+' + k * c + '=-' + k + '(x^{2}+' + (b === 1 ? '' : b) + 'x+' + c + ')');
            return mcPart(r, 'A student writes ' + given + '. What is wrong?', [
              { html: 'Taking out ' + t('-' + k) + ' changes the sign of <b>every</b> term: the bracket should be ' + t('x^{2}-' + (b === 1 ? '' : b) + 'x-' + c) + '.', right: true },
              { html: 'The common factor should be ' + t(k) + ', not ' + t('-' + k) + '.', why: 'Taking out ' + t('-' + k) + ' is right when the leading coefficient is negative. The problem is the signs inside the bracket.' },
              { html: 'Nothing — ' + t('x^{2}+' + (b === 1 ? '' : b) + 'x+' + c) + ' doesn’t factor, so it is complete.', why: 'Expand the student’s answer: ' + t('-' + k + '(x^{2}+' + (b === 1 ? '' : b) + 'x+' + c + ')=-' + k + 'x^{2}-' + k * b + 'x-' + k * c) + '. That isn’t the original expression.' },
              { html: 'Only the last sign is wrong: the bracket should be ' + t('x^{2}+' + (b === 1 ? '' : b) + 'x-' + c) + '.', why: t(k * b + 'x\\div(-' + k + ')=-' + (b === 1 ? '' : b) + 'x') + ' — the middle sign changes too.' }],
              'Dividing by ' + t('-' + k) + ' flips every sign: ' + t(k * b + 'x\\div(-' + k + ')=-' + (b === 1 ? '' : b) + 'x') + ' and ' + t(k * c + '\\div(-' + k + ')=-' + c) + '.', ['Expand the student’s answer and compare it with the original.'], 'error: signs not flipped');
          } },
          { id: '6c2', sub: 'c ii', level: 'PRG', make: function (r, sh) { var pr = tri({ k: -sh.ck, a: 1, u: -sh.p, b: 1, v: sh.q, X: X }); return fac(pr, { prompt: 'Write the correct, complete factorization of ' + t(pr.tex) + '.' }); } }] },

      /* ---------- Part B ---------- */
      { num: '7', section: 'Part B — Multiple Choice and Numerical Response', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '7', level: 'EMG', make: function (r) {
          var p, q, rr, s, mid; do { p = r.pick([2, 3]); rr = r.pick([2, 3, 4, 5]); q = r.int(1, 7); s = r.int(1, 7); mid = -p * s + q * rr; } while (p === rr || gcd(p, q) !== 1 || gcd(rr, s) !== 1 || !mid || q === s);
          var pr = tri({ a: p, u: q, b: rr, v: -s, X: X }), f = function (a, b) { return t(tx(S(M(a, 'x'), N(b))) ); };
          return mcPart(r, t(pr.tex) + ' has a factor of', [
            { html: f(p, q), right: true },
            { html: f(p, -q), why: 'Right numbers, wrong sign. Test it: ' + t('(' + tx(S(M(p, 'x'), N(-q))) + ')(' + tx(S(M(rr, 'x'), N(s))) + ')') + ' gives a middle term of ' + t(-mid + 'x') + ', not ' + t(mid + 'x') + '.' },
            { html: f(rr, s), why: 'Right numbers, wrong sign. Factor it fully: ' + t(pr.tex + '=' + pr.keyTex) + '.' },
            { html: f(1, -s), why: 'The coefficient of ' + t('x') + ' matters. Factor it fully — by decomposition, ' + t('ac=' + pr.A * pr.C) + ' — and compare.' }],
            '<b>Three terms, ' + t('a\\neq 1') + ' ⇒ decomposition.</b> ' + t('ac=' + pr.A + '\\times' + nn(pr.C) + '=' + pr.A * pr.C) + ', sum ' + t(mid) + '.<br>' + t(pr.tex + '=' + pr.keyTex) + '. Of the options, only ' + f(p, q) + ' is one of these factors.',
            ['Factor it completely by decomposition, then compare with the options.'], 'which is a factor of ' + plain(pr.tex));
        } }] },
      { num: '8', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '8', level: 'PRG', make: function (r) {
          var pq = cop(r, 2, 9, 2, 9), p = pq[0], q = pq[1], k = 2 * p * q;
          return B.nr('If ' + t(p * p + 'a^{2}+ka+' + q * q) + ' is a perfect square trinomial and ' + t('k>0') + ', then the value of ' + t('k') + ' is ________.', k, function (v) {
            if (v === p * q) return { code: 'k-half', hint: 'The middle term of ' + t('(A+B)^{2}') + ' is ' + t('2AB') + ' — don’t forget the ' + t('2') + '.' };
            if (v === p * p + q * q) return { code: 'k-squares', hint: 'The middle coefficient isn’t the sum of the outside numbers. It is ' + t('2AB') + ', where ' + t('A^{2}') + ' and ' + t('B^{2}') + ' are the first and last terms.' };
            if (v === 4 * p * q) return { code: 'k-four', hint: 'You doubled twice. The middle term is ' + t('2AB') + '.' };
            if (v === p + q || v === 2 * (p + q)) return { code: 'k-sum', hint: 'Multiply, don’t add: the middle term is ' + t('2AB') + '.' };
            return null;
          }, '<b>Perfect square trinomial pattern.</b> ' + t(p * p + 'a^{2}=(' + p + 'a)^{2}') + ' and ' + t(q * q + '=' + q + '^{2}') + ', so the middle term must be ' + t('\\pm 2(' + p + 'a)(' + q + ')=\\pm ' + k + 'a') + '.<br>Since ' + t('k>0') + ', ' + t('k=' + k) + ', and ' + t(p * p + 'a^{2}+' + k + 'a+' + q * q + '=(' + p + 'a+' + q + ')^{2}') + '.',
          ['Write the first and last terms as squares: ' + t('(\\ ?\\ )^{2}') + '.', 'In ' + t('(A+B)^{2}=A^{2}+2AB+B^{2}') + ', the middle term is ' + t('2AB') + '.'], 'k for perfect square ' + p * p + 'a^2+ka+' + q * q);
        } }] },

      /* ---------- Part C ---------- */
      { num: '9', section: 'Part C — Extension', stem: '<i>(Extension)</i> Factor completely.', parts: [
        { id: '9a', level: 'PRG', make: function (r) {
          var p, q, pool = [2, 3, 4, 5, 6, 7, 9, 10]; do { p = r.pick(pool); q = r.pick(pool); } while (q >= p || p * q > 63);
          var pr = tri({ a: 1, u: -p, b: 1, v: q, X: M(1, { t: 3 }) });
          pr.sol += '<br>Neither bracket factors further over the integers.';
          return fac(pr);
        } },
        { id: '9b', level: 'ADV', make: function (r) {
          var a, b, u, v, mid; do { a = r.pick([2, 3]); b = r.pick([3, 4, 5]); u = r.int(1, 5); v = r.int(1, 5); mid = a * v - u * b; } while (a === b || gcd(a, u) !== 1 || gcd(b, v) !== 1 || !mid);
          var fix = function (s) { return s.replace(/p\^\{2\}t\^\{3\}/g, 't^{3}p^{2}'); };
          return fac(tri({ a: a, u: -u, b: b, v: v, X: M(1, { t: 3 }), Y: M(1, { p: 2 }), fix: fix }));
        } }] }
    ],

    extra: [
      /* ---------- EP Part A — name the strategy ---------- */
      { num: '1', section: 'Extra practice A — Name the strategy, do not factor', stem: function (sh) { return '<b>Do not factor these.</b> Here are eight expressions:<br>' + sh.rows.map(function (rw) { return rw.html; }).join('<br>'); },
        shared: function (r) {
          var rows = [], ab;
          ab = cop(r, 2, 9, 2, 9); rows.push({ tex: tx(S(M(ab[0] * ab[0], { x: 2 }), M(-ab[1] * ab[1], { y: 2 }))), n: 2, m: 'dos', why: 'two perfect squares, ' + t('(' + ab[0] + 'x)^{2}') + ' and ' + t('(' + ab[1] + 'y)^{2}') + ', with a minus between them: a <b>difference of squares</b>.' });
          var k, s, u; do { k = r.int(2, 5); s = r.int(2, 7); u = r.int(2, 7); } while (gcd(k, s) !== 1);
          rows.push({ tex: grp({ A1: M(k, 'a'), A2: N(-s), B1: X, B2: N(u) }).tex, n: 4, m: 'grp', why: 'no factor common to all four: <b>grouping</b>.' });
          var pq = two(r, 2, 9); rows.push({ tex: tri({ a: 1, u: pq[0], b: 1, v: pq[1], X: X }).tex, n: 3, m: 'insp', why: 'no common factor, ' + t('a=1') + ': <b>inspection</b>.' });
          var d = decPair(r, [3, 5], [2, 3, 5], [1, 5], [1, 5]); var dp = tri({ a: d.a, u: d.u, b: d.b, v: -d.v, X: X }); rows.push({ tex: dp.tex, n: 3, m: 'dec', why: 'no common factor, ' + t('a=' + dp.A + '\\neq1') + ': <b>decomposition</b>.' });
          var g = r.pick([2, 3, 4, 6]), c3; do { c3 = [r.int(2, 5), r.int(2, 5), r.int(2, 7)]; } while (gcd(gcd(c3[0], c3[1]), c3[2]) !== 1);
          var gm = M(g, { a: 2, b: 2 }), br3 = S(M(c3[0], 'a'), M(c3[1], 'b'), N(-c3[2])); rows.push({ tex: tx(P.mul(gm, br3)), n: 3, m: 'gcf', why: 'the GCF ' + t(tx(gm)) + ' leaves ' + t(tx(br3)) + ', which cannot factor: <b>common factor only</b>.' });
          var nn2 = r.int(3, 10); rows.push({ tex: 'p^{2}+' + nn2 * nn2, n: 2, m: 'none', why: t('p^{2}+' + nn2 + '^{2}') + ' is a <b>sum</b> of squares: it <b>does not factor</b>.' });
          var mq = two(r, 1, 5).sort(); rows.push({ tex: tri({ a: 1, u: -mq[0] * mq[0], b: 1, v: -mq[1] * mq[1], X: M(1, { x: 2 }) }).tex, n: 3, m: 'insp', why: 'a trinomial in ' + t('x^{2}') + ' with ' + t('a=1') + ': <b>inspection</b> (then difference of squares on the brackets).' });
          var pq2 = cop(r, 2, 9, 2, 9), hp = tri({ a: pq2[0], u: -pq2[1], b: pq2[0], v: -pq2[1], X: V('c'), Y: V('d') }); rows.push({ tex: hp.tex, n: 3, m: 'dec', why: t('a=' + hp.A + '\\neq1') + ': <b>decomposition</b> — and it is a perfect square trinomial, ' + t('(' + pq2[0] + 'c-' + pq2[1] + 'd)^{2}') + '.' });
          rows.forEach(function (rw, i) { rw.id = String.fromCharCode(97 + i); rw.html = '(' + rw.id + ') ' + t(rw.tex); rw.label = rw.id; });
          return { rows: rows };
        },
        parts: [
          { id: 'e1a', sub: 'i', level: 'LIM', make: function (r, sh) {
            var cols = [{ id: '2', html: '2 terms' }, { id: '3', html: '3 terms' }, { id: '4', html: '4 terms' }], want = {};
            sh.rows.forEach(function (rw) { want[rw.id] = String(rw.n); });
            return B.grid('(i) How many terms does each expression have?', sh.rows.map(function (rw) { return { id: rw.id, html: rw.label }; }), cols, want, {
              why: function (id) { var rw = sh.rows.filter(function (x) { return x.id === id; })[0]; return { code: 'row', hint: 'Count the terms of ' + t(rw.tex) + ' again: terms are separated by ' + t('+') + ' and ' + t('-') + ' signs.' }; }
            }, sh.rows.map(function (rw) { return rw.html + ': ' + rw.n + ' terms'; }).join('<br>'), ['Terms are separated by plus and minus signs.'], 'count terms (8 expressions)');
          } },
          { id: 'e1b', sub: 'ii a–d', level: 'BEG', make: function (r, sh) {
            var rows = sh.rows.slice(0, 4);
            return methodGrid('(ii) Name the method you would use for (a)–(d).', rows, MCOL, rows.map(function (rw) { return rw.html + ': ' + rw.n + ' terms; ' + rw.why; }).join('<br>'), 'method names (a)-(d)');
          } },
          { id: 'e1c', sub: 'ii e–h', level: 'EMG', make: function (r, sh) {
            var rows = sh.rows.slice(4);
            return methodGrid('(ii) Name the method you would use for (e)–(h).', rows, MCOL, rows.map(function (rw) { return rw.html + ': ' + rw.n + ' terms; ' + rw.why; }).join('<br>'), 'method names (e)-(h)');
          } }] },

      { num: '2', stem: '<b>Still do not factor.</b> Each of these needs step 1 before its shape is visible.',
        shared: function (r) {
          var L = [];
          var k = r.pick([2, 3, 4, 5]), a = r.int(2, 7);
          L.push({ g: M(k, 'x'), br: P.sub(M(1, { x: 2 }), N(a * a)), m: 'dos' });
          var k2 = r.pick([2, 3, 5]), a2, u2, v2; do { a2 = r.pick([2, 3]); u2 = r.int(1, 7); v2 = r.int(1, 7); } while (gcd(a2, v2) !== 1 || a2 * u2 - v2 === 0); // (a y − v)(y + u)
          L.push({ g: M(k2, 'y'), br: P.mul(S(M(a2, 'y'), N(-v2)), S(V('y'), N(u2))), m: 'dec' });
          var k3 = r.pick([2, 3, 4, 5, 6]), pq = two(r, 1, 6); L.push({ g: M(k3, 'm'), br: P.mul(S(V('m'), N(pq[0])), S(V('m'), N(-pq[1]))), m: 'insp' });
          var k4 = r.pick([2, 3, 5]), p4 = r.int(1, 5), q4 = r.int(2, 4); L.push({ g: N(k4), br: P.mul(S(X, N(p4)), P.sub(M(1, { x: 2 }), N(q4 * q4))), m: 'grp', note: ' — and the bracket ' + t('x^{2}-' + q4 * q4) + ' it produces is then a difference of squares' });
          var k5 = r.pick([2, 3, 5, 7]), n5 = r.int(2, 6); L.push({ g: N(k5), br: S(M(1, { t: 2 }), N(n5 * n5)), m: 'none' });
          var k6 = r.pick([2, 3, 5]), pq6 = cop(r, 2, 3, 1, 7); L.push({ g: N(-k6), br: P.sub(M(pq6[0] * pq6[0], { k: 2 }), N(pq6[1] * pq6[1])), m: 'dos' });
          L.forEach(function (it, i) { it.expr = P.mul(it.g, it.br); it.tex = tx(it.expr); it.n = P.count(it.br); it.id = String.fromCharCode(97 + i); });
          return { L: L };
        },
        parts: ['a', 'b', 'c', 'd', 'e', 'f'].map(function (s, i) {
          return { id: 'e2' + s, sub: s, level: ['BEG', 'BEG', 'BEG', 'EMG', 'BEG', 'EMG'][i], make: function (r, sh) {
            var it = sh.L[i], terms = P.terms(it.expr).map(function (T) { return P.mono(T.c, T.v); }), vs = P.vars(it.expr);
            return B.fields('For ' + t(it.tex) + ', write (i) the greatest common factor and (ii) how many terms are left inside the bracket.',
              [{ name: 'GCF', label: '(i) GCF', mode: 'math', keys: 'poly', vars: vs, wide: false, placeholder: 'e.g. 3x' }, { name: 'Terms left', label: '(ii) terms left' }],
              [gcfChk(it.g, terms), K.number(it.n, function (v) { return { code: 'terms-count', hint: 'Divide every term by the GCF: ' + t(it.tex + '=' + kpre(it.g) + '(\\ldots)') + '. Count the terms in the bracket.' }; })],
              [tx(it.g), String(it.n)], 'GCF ' + t(tx(it.g)) + '; ' + it.n + ' terms left',
              t(it.tex + '=' + kpre(it.g) + '(' + tx(it.br) + ')') + '<br>(i) GCF ' + t(tx(it.g)) + (lead(it.g) < 0 ? ' (the leading term is negative, so take the negative out too)' : '') + '<br>(ii) <b>' + it.n + ' terms</b> left',
              ['Find the greatest number that divides every coefficient, then the lowest power of each variable that appears in <b>every</b> term.', lead(it.g) < 0 ? 'The leading coefficient is negative: take out a negative.' : 'Divide each term by the GCF and count what is left.'], 'GCF and terms: ' + plain(it.tex));
          } };
        }).concat([{ id: 'e2g', sub: 'iii', level: 'EMG', make: function (r, sh) {
          var cols = MCOL.slice(1);
          var rows = sh.L.map(function (it) {
            var w = { dos: 'two perfect squares with a minus between them: <b>difference of squares</b>', insp: 'three terms with ' + t('a=1') + ': <b>inspection</b>', dec: 'three terms with ' + t('a\\neq1') + ': <b>decomposition</b>', grp: 'four terms: <b>grouping</b>' + (it.note || ''), none: 'a <b>sum</b> of squares: nothing more to do, stop' };
            return { id: it.id, label: it.id, br: '(' + it.id + ') ' + t(tx(it.br)), html: '(' + it.id + ') ' + t(it.tex + '=' + kpre(it.g) + '(' + tx(it.br) + ')'), m: it.m, why: t(tx(it.br)) + ' is ' + w[it.m] + '.' };
          });
          return methodGrid('(iii) Once the GCF is out, which method applies to what is inside the bracket?<br>' + rows.map(function (rw) { return rw.br; }).join('<br>'), rows, cols, rows.map(function (rw) { return rw.html + ': ' + rw.why; }).join('<br>'), 'method inside the bracket (a)-(f)');
        } }]) },

      { num: '3', stem: 'Each expression is a student’s answer — most are partly factored, and one was left exactly as it was given. Using step 6 only (can any factor be factored again?), choose the verdict.',
        shared: function (r) {
          var kinds = r.shuffle(['nf1', 'c1', 'c2', 'nf2', 'd', 'nf3']), rows = [];
          kinds.forEach(function (kd) {
            var o;
            if (kd === 'nf1') { var pq = two(r, 2, 6); o = { given: '(x+' + pq[0] + ')(x^{2}-' + pq[1] * pq[1] + ')', v: 'nf', list: [S(X, N(pq[0])), S(X, N(-pq[1])), S(X, N(pq[1]))], why: 'the bracket ' + t('x^{2}-' + pq[1] * pq[1] + '=x^{2}-' + pq[1] + '^{2}') + ' is a difference of squares.' }; }
            if (kd === 'c1') { var d = decPair(r, [2, 3, 5], [2, 3], [1, 9], [1, 7]); o = { given: '(' + tx(S(M(d.a, 'x'), N(-d.u))) + ')(' + tx(S(M(d.b, 'x'), N(d.v))) + ')', v: 'c', why: 'neither bracket has a common factor, and neither is a difference of squares.' }; }
            if (kd === 'c2') { var kk = r.pick([2, 3, 5, 7]), n = r.int(2, 7); o = { given: kk + '(x^{2}+' + n * n + ')', v: 'c', why: t('x^{2}+' + n * n) + ' is a <b>sum</b> of squares, which does not factor over the integers.' }; }
            if (kd === 'nf2') { var g = r.pick([2, 3, 5]), pq2 = cop(r, 2, 3, 1, 7); var pst = P.pow(S(M(pq2[0], 'x'), N(-pq2[1])), 2); o = { given: g + 'x(' + tx(pst) + ')', v: 'nf', list: [M(g, 'x'), { p: S(M(pq2[0], 'x'), N(-pq2[1])), k: 2 }], why: t(tx(pst)) + ' is a perfect square trinomial, ' + t('(' + pq2[0] + 'x)^{2}-2(' + pq2[0] + 'x)(' + pq2[1] + ')+' + pq2[1] + '^{2}') + '.' }; }
            if (kd === 'd') { var ir = irreducibleMonic(r, 1, 6, 2, 12, '+'); o = { given: tx(S(M(1, { x: 2 }), M(ir.b, 'x'), N(ir.c))), v: 'd', why: noPairText(ir.c, ir.b) };
            }
            if (kd === 'nf3') { var p3 = r.int(1, 6), m3 = r.pick([2, 3]), aq; do { aq = [r.int(1, 3), r.int(1, 7)]; } while (gcd(aq[0], aq[1]) !== 1 || gcd(m3 * aq[0], m3 * aq[1]) !== m3); o = { given: '(x-' + p3 + ')(' + tx(S(M(m3 * aq[0], 'x'), N(m3 * aq[1]))) + ')', v: 'nf', list: [N(m3), S(X, N(-p3)), S(M(aq[0], 'x'), N(aq[1]))], why: 'the bracket ' + t('(' + tx(S(M(m3 * aq[0], 'x'), N(m3 * aq[1]))) + ')') + ' still has a common factor, ' + t(m3) + '.' }; }
            o.kind = kd; rows.push(o);
          });
          rows.forEach(function (rw, i) { rw.id = String.fromCharCode(97 + i); rw.html = '(' + rw.id + ') ' + t(rw.given); });
          return { rows: rows, nf: rows.filter(function (rw) { return rw.v === 'nf'; }) };
        },
        parts: [
          { id: 'e3', sub: 'verdicts', level: 'EMG', make: function (r, sh) {
            var cols = [{ id: 'c', html: 'factored<br>completely' }, { id: 'nf', html: 'not yet<br>finished' }, { id: 'd', html: 'does not<br>factor' }], want = {}, VN = { c: '<b>factored completely</b>', nf: '<b>not yet finished</b>', d: '<b>does not factor</b> over the integers' };
            sh.rows.forEach(function (rw) { want[rw.id] = rw.v; });
            return B.grid('Choose the verdict for each answer:<br>' + sh.rows.map(function (rw) { return rw.html; }).join('<br>'), sh.rows.map(function (rw) { return { id: rw.id, html: '(' + rw.id + ')' }; }), cols, want, {
              why: function (id) { var rw = sh.rows.filter(function (x) { return x.id === id; })[0]; return { code: 'row', hint: rw.html + ': look at each factor again — can it be factored? Does a pair of integers exist?' }; }
            }, sh.rows.map(function (rw) { return rw.html + ': ' + VN[rw.v] + ' — ' + rw.why; }).join('<br>'), ['For each bracket: is there a common factor? Is it a difference of squares? A trinomial that factors?', 'A sum of squares, and a trinomial with no integer pair, do not factor.'], 'verdicts on six answers');
          } }].concat([0, 1, 2].map(function (j) {
            return { id: 'e3n' + (j + 1), sub: 'finish ' + ['i', 'ii', 'iii'][j], level: 'BEG', make: function (r, sh) {
              var rw = sh.nf[j], pr = { expr: FA.product(rw.list), tex: rw.given, list: rw.list, keyTex: lst(rw.list), wrongs: [], hints: ['Look for the bracket that can still be factored.'] };
              pr.sol = 'Not yet finished: ' + rw.why + '<br>' + t(rw.given + '=' + pr.keyTex);
              return fac(pr, { prompt: 'Finish the factoring of answer (' + rw.id + '), ' + t(rw.given) + '.', text: 'finish ' + plain(rw.given) });
            } };
          })) },

      /* ---------- EP Part B — sort first ---------- */
      { num: '4', section: 'Extra practice B — Sort first, factor later', stem: 'Here are twelve expressions. <b>Do not factor any of them yet.</b> Put each one into the column for the method you would use.',
        shared: function (r) {
          var L = [];
          L.push({ tex: tx(P.sub(M(1, { x: 2 }), N(Math.pow(r.int(2, 9), 2)))), m: 'dos' });
          var dB = decPair(r, [2, 3], [2, 3], [1, 5], [1, 5]); L.push({ tex: tri({ a: dB.a, u: dB.u, b: dB.b, v: -dB.v, X: X }).tex, m: 'dec' });
          var gC = r.pick([2, 3, 4, 5]), pqC = cop(r, 2, 5, 2, 5); L.push({ tex: tx(P.mul(M(gC, { x: 2, y: 1 }), S(M(pqC[0], 'x'), M(-pqC[1], 'y')))), m: 'gcf' });
          var pqD = two(r, 2, 9); L.push({ tex: tri({ a: 1, u: pqD[0], b: 1, v: pqD[1], X: X }).tex, m: 'insp' });
          var aE, uE, sE; do { aE = r.int(2, 5); uE = r.int(2, 7); sE = r.int(2, 5); } while (gcd(aE, uE) !== 1); L.push({ tex: grp({ A1: M(aE, 'a'), A2: N(uE), B1: V('b'), B2: N(-sE) }).tex, m: 'grp' });
          var pqF = cop(r, 2, 9, 2, 9); L.push({ tex: tx(S(M(pqF[0] * pqF[0], { m: 2 }), M(-pqF[1] * pqF[1], { n: 2 }))), m: 'dos' });
          var pqG = two(r, 2, 9); L.push({ tex: tri({ a: 1, u: -pqG[0], b: 1, v: -pqG[1], X: X }).tex, m: 'insp' });
          var dH = decPair(r, [3, 5], [2, 3], [1, 7], [1, 5]); L.push({ tex: tri({ a: dH.a, u: -dH.u, b: dH.b, v: -dH.v, X: V('p') }).tex, m: 'dec' });
          var qI = r.int(2, 9), pI = r.int(2, 6); L.push({ tex: grp({ A1: M(1, { y: 2 }), A2: N(qI), B1: V('y'), B2: N(-pI) }).tex, m: 'grp' });
          L.push({ tex: P.tex(P.sub(N(Math.pow(r.int(2, 9), 2)), M(1, { t: 2 })), { order: 'asc' }), m: 'dos' });
          var gK = r.pick([2, 3, 5, 7]), pqK = cop(r, 2, 5, 2, 5); L.push({ tex: tx(P.mul(M(gK, { u: 3, v: 3 }), S(M(pqK[0], 'u'), M(pqK[1], 'v')))), m: 'gcf' });
          var pL, qL; do { pL = r.int(3, 9); qL = r.int(2, pL - 1); } while (pL * qL > 72); L.push({ tex: tri({ a: 1, u: -pL, b: 1, v: qL, X: X }).tex, m: 'insp' });
          var why = { dos: 'two perfect squares with a minus between them: <b>difference of squares</b>', dec: 'three terms, no GCF, ' + t('a\\neq1') + ': <b>decomposition</b>', gcf: 'the GCF leaves a bracket that can’t factor: <b>common factor only</b>', insp: 'three terms, ' + t('a=1') + ': <b>inspection</b>', grp: 'four terms: <b>grouping</b>' };
          L.forEach(function (it, i) { it.id = String.fromCharCode(65 + i); it.html = '<b>' + it.id + '.</b> ' + t(it.tex); it.label = '<b>' + it.id + '</b>'; it.why = why[it.m] + '.'; });
          return { L: L };
        },
        parts: [0, 1].map(function (h) {
          return { id: 'e4' + 'ab'.charAt(h), sub: h ? 'G–L' : 'A–F', level: 'BEG', make: function (r, sh) {
            var rows = sh.L.slice(6 * h, 6 * h + 6), cols = MCOL.slice(0, 5);
            return methodGrid('Sort these by the method you would use:<br>' + rows.map(function (rw) { return rw.html; }).join('<br>'), rows, cols, rows.map(function (rw) { return rw.html + ': ' + rw.why; }).join('<br>'), 'sort ' + (h ? 'G-L' : 'A-F'));
          } };
        }) },

      { num: '5', stem: 'Factor completely. First decide which method each one needs — decomposition, grouping, difference of squares or inspection — then use it.', parts: [
        { id: 'e5a', level: 'PRG', make: function (r) { var d = decPair(r, [2, 3], [2, 3], [1, 5], [1, 5]); return fac(tri({ a: d.a, u: d.u, b: d.b, v: -d.v, X: X })); } },
        { id: 'e5b', level: 'PRG', make: function (r) { var a, u, s; do { a = r.int(2, 5); u = r.int(2, 7); s = r.int(2, 5); } while (gcd(a, u) !== 1); return fac(grp({ A1: M(a, 'a'), A2: N(u), B1: V('b'), B2: N(-s) })); } },
        { id: 'e5c', level: 'PRG', make: function (r) { var pq = cop(r, 2, 9, 2, 9); return fac(dos({ A: M(pq[0], 'm'), B: M(pq[1], 'n') })); } },
        { id: 'e5d', level: 'PRG', make: function (r) { var d = decPair(r, [3, 5], [2, 3], [1, 7], [1, 5]); return fac(tri({ a: d.a, u: -d.u, b: d.b, v: -d.v, X: V('p') })); } },
        { id: 'e5e', level: 'EMG', make: function (r) { var q = r.int(2, 9), p = r.int(2, 6); return fac(grp({ A1: M(1, { y: 2 }), A2: N(q), B1: V('y'), B2: N(-p), note: t('y^{2}+' + q) + ' does not factor, so this is complete.' })); } },
        { id: 'e5f', level: 'BEG', make: function (r) { var p, q; do { p = r.int(3, 9); q = r.int(2, p - 1); } while (p * q > 72); return fac(tri({ a: 1, u: -p, b: 1, v: q, X: X })); } }] },

      /* ---------- EP Part C — two-step decisions ---------- */
      { num: '6', section: 'Extra practice C — Two-step decisions', stem: 'The common factor is what <b>reveals</b> the difference of squares. Take out the GCF, then keep applying step 2 until no bracket is a difference of squares.', parts: [
        { id: 'e6a', level: 'PRG', make: function (r) { var g = r.pick([2, 3]), pq = cop(r, 2, 5, 1, 7); return fac(dos({ k: M(g, 'x'), A: M(pq[0], 'x'), B: N(pq[1]) })); } },
        { id: 'e6b', level: 'PRG', make: function (r) { var g = r.pick([2, 3, 5, 7]), n = r.pick([1, 1, 2]); return fac(dos({ k: M(g, 'b'), A: M(1, { a: 2 }), B: M(n * n, { b: 2 }), again: true })); } },
        { id: 'e6c', level: 'PRG', make: function (r) { var g = r.pick([2, 3]), pq = cop(r, 2, 4, 2, 7); return fac(dos({ k: M(g, 'y'), A: N(pq[1]), B: M(pq[0], 'y'), order: 'asc' })); } },
        { id: 'e6d', level: 'PRG', make: function (r) { var g = r.pick([2, 3]), pq = cop(r, 3, 5, 1, 4); return fac(dos({ k: M(g, 'w'), A: M(pq[0], 'w'), B: N(pq[1]) })); } }] },

      { num: '7', stem: 'Here the common factor reveals a trinomial with ' + t('a\\neq1') + '. Take out the GCF, then decompose what is left (find ' + t('ac') + ', the sum ' + t('b') + ', and the split).',
        shared: function (r) { var g = r.pick([2, 3]), d = decPair(r, [3, 2], [2, 3], [2, 5], [2, 5]); return { g: g, d: d }; },
        parts: [
          { id: 'e7s', sub: 'a steps', level: 'EMG', make: function (r, sh) {
            var d = sh.d, pr = tri({ k: M(sh.g, 'x'), a: d.a, u: d.u, b: d.b, v: -d.v, X: X }), ac = pr.A * pr.C, m1 = d.a * -d.v, m2 = d.b * d.u;
            var terms = P.terms(pr.expr).map(function (T) { return P.mono(T.c, T.v); });
            var gchk = gcfChk(pr.k, terms), acchk = K.number(ac, function (v) { return v === pr.A * pr.C * sh.g * sh.g || v === ac * sh.g ? { code: 'ac-wrong', hint: 'Use ' + t('a') + ' and ' + t('c') + ' from the bracket <b>after</b> taking out the GCF: ' + t(tx(pr.inner)) + '.' } : null; });
            var check = function (resp) {
              resp = resp || [];
              var r1 = gchk(resp[0] || ''); if (r1.v !== 'correct') return { v: r1.v, code: r1.code, hint: '<b>GCF:</b> ' + (r1.hint || 'Check this one again.') };
              var r2 = acchk(resp[1] || ''); if (r2.v !== 'correct') return { v: r2.v, code: r2.code, hint: '<b>ac:</b> ' + (r2.hint || 'Multiply the first and last coefficients of the bracket.') };
              var x = HW.parse.number(resp[2] || ''), y = HW.parse.number(resp[3] || '');
              if (!x.ok || !y.ok) return form('empty', '<b>Split:</b> type the two numbers, one in each box.');
              var a = x.value, b = y.value;
              if ((a === m1 && b === m2) || (a === m2 && b === m1)) return ok();
              return wrong('pair-wrong', '<b>Split:</b> ' + t(nn(a) + '\\times' + nn(b) + '=' + a * b) + ' and ' + t(nn(a) + '+' + nn(b) + '=' + (a + b)) + '. You need product ' + t(ac) + ' and sum ' + t(pr.Bm) + '.');
            };
            return { prompt: 'For ' + t(pr.tex) + ': take out the GCF, then give ' + t('ac') + ' for the trinomial that is left and the two numbers you split the middle term into.',
              input: { type: 'fields', fields: [{ name: 'GCF', label: 'GCF', mode: 'math', keys: 'poly', vars: ['x'], wide: false, placeholder: 'e.g. 3x' }, { name: 'ac', label: t('ac') }, { name: 'first number', label: 'split:' }, { name: 'second number', label: 'and' }] },
              check: check, key: [tx(pr.k), String(ac), String(m1), String(m2)], answer: 'GCF ' + t(tx(pr.k)) + ', ' + t('ac=' + ac) + ', split ' + t(m1) + ' and ' + t(m2),
              solution: pr.sol.split('<br>').slice(0, 3).join('<br>'), hints: ['Take out the GCF first, then use the ' + t('a') + ' and ' + t('c') + ' of the bracket.', 'Find two integers with product ' + t('ac') + ' and sum ' + t('b') + '.'], text: 'decomposition steps ' + plain(pr.tex),
              good: [[tx(pr.k), String(ac), String(m2), String(m1)]], bad: [[tx(pr.k), String(ac), String(-m1), String(-m2)], [tx(P.scale(pr.k, 1 / sh.g)), String(ac), String(m1), String(m2)]] };
          } },
          { id: 'e7a', sub: 'a', level: 'PRG', make: function (r, sh) { var d = sh.d; return fac(tri({ k: M(sh.g, 'x'), a: d.a, u: d.u, b: d.b, v: -d.v, X: X }), { prompt: 'Factor ' + t(P.tex(P.mul(M(sh.g, 'x'), S(M(d.a, 'x'), N(d.u)), S(M(d.b, 'x'), N(-d.v))))) + ' completely.' }); } },
          { id: 'e7b', sub: 'b', level: 'PRG', make: function (r) { var g = r.pick([2, 3, 5]), d = decPair(r, [1], [5, 6, 7, 10], [1, 3], [3, 9]); return fac(tri({ k: M(g, 'b'), a: 1, u: d.u, b: d.b, v: -d.v, X: V('a') })); } },
          { id: 'e7c', sub: 'c', level: 'PRG', make: function (r) { var g = r.pick([2, 3]), d = decPair(r, [2, 3], [2, 3], [1, 4], [1, 4]); return fac(tri({ k: M(-g, 'k'), a: d.a, u: -d.u, b: d.b, v: -d.v, X: V('k') })); } },
          { id: 'e7d', sub: 'd', level: 'PRG', make: function (r) { var g = r.pick([2, 3]), d = decPair(r, [1], [7, 11, 13, 14], [1, 1], [2, 5]); return fac(tri({ k: M(g, { p: 1, q: 1 }), a: 1, u: -d.u, b: d.b, v: -d.v, X: V('p') })); } }] },

      { num: '8', stem: 'When a trinomial has a common factor, the GCF should come out <b>before</b> you decompose.', parts: [
        { id: 'e8', level: 'EMG', make: function (r) {
          var g = r.pick([2, 3]), d = decPair(r, [2, 3], [2, 3], [2, 5], [2, 5]), pr = tri({ k: M(g, 'x'), a: d.a, u: d.u, b: d.b, v: -d.v, X: X });
          return mcPart(r, 'What goes wrong if you try decomposition on ' + t(pr.tex) + ' <b>without</b> removing ' + t(g + 'x') + ' first?', [
            { html: 'Its terms have degrees ' + t('3') + ', ' + t('2') + ' and ' + t('1') + ' — it isn’t of the form ' + t('ax^{2}+bx+c') + ', so there is no ' + t('a') + ' (or ' + t('c') + ') to use until the GCF is out.', right: true },
            { html: 'Nothing: use ' + t('a=' + P.coef(pr.expr, { x: 3 })[0]) + ' and ' + t('c=' + P.coef(pr.expr, { x: 1 })[0]) + ', it just gives bigger numbers.', why: t(P.coef(pr.expr, { x: 1 })[0] + 'x') + ' is an ' + t('x') + '-term, not a constant — the expression has no constant term at all. Decomposition needs a trinomial ' + t('ax^{2}+bx+c') + '.' },
            { html: 'Use ' + t('a=' + g + 'x') + ', because the GCF is the leading coefficient.', why: 'The GCF is what every term shares; it isn’t ' + t('a') + '. Take it out first, then read ' + t('a') + ', ' + t('b') + ', ' + t('c') + ' from the bracket.' },
            { html: 'A cubic can never be factored, so there is nothing to do.', why: 'Taking out ' + t(g + 'x') + ' leaves a quadratic trinomial that decomposes: ' + t(pr.tex + '=' + pr.keyTex) + '.' }],
            'Decomposition works on a trinomial ' + t('ax^{2}+bx+c') + '. The terms of ' + t(pr.tex) + ' have degrees ' + t('3,2,1') + ': there is no constant term and the leading term is an ' + t('x^{3}') + '-term, so there is <b>no value to use for</b> ' + t('a') + '. Only after removing the GCF, ' + t(pr.tex + '=' + g + 'x(' + tx(pr.inner) + ')') + ', does a genuine trinomial appear, with ' + t('a=' + pr.A + ',\\ b=' + pr.Bm + ',\\ c=' + pr.C) + '. That is why step 1 comes first.',
            ['What does decomposition need? Look at the degrees of the three terms.'], 'why GCF before decomposition');
        } }] },

      /* ---------- EP Part D — mixed ---------- */
      { num: '9', section: 'Extra practice D — Mixed set: decide every time', stem: 'Factor completely. The methods are scrambled — run the checklist before each one. One of these does not factor at all: if you meet it, press <b>none</b>.', parts: [
        { id: 'e9a', level: 'BEG', make: function (r) { var p = r.int(5, 13); return fnone(tri({ a: 1, u: -p, b: 1, v: -p, X: X })); } },
        { id: 'e9b', level: 'BEG', make: function (r) { var pq = cop(r, 2, 5, 3, 9); return fnone(dos({ A: M(pq[0], 'n'), B: N(pq[1]) })); } },
        { id: 'e9c', level: 'PRG', make: function (r) { var p, q, s; do { p = r.int(2, 9); q = r.int(1, 7); s = r.int(2, 6); } while (gcd(p, q) !== 1); return fnone(grp({ A1: V('c'), A2: N(-s), B1: M(p, 'a'), B2: N(q) })); } },
        { id: 'e9d', level: 'PRG', make: function (r) { var pq = cop(r, 2, 5, 2, 9); return fnone(tri({ a: pq[0], u: pq[1], b: pq[0], v: pq[1], X: V('h') })); } },
        { id: 'e9e', level: 'PRG', make: function (r) { var k = r.pick([2, 3, 5]), n = r.int(2, 7); return fnone(dos({ k: M(k, 'g'), A: V('g'), B: N(n) })); } },
        { id: 'e9f', level: 'EMG', make: function (r) {
          var ir = irreducibleMonic(r, 3, 9, 5, 20, '+'), T = S(M(1, { x: 2 }), M(ir.b, 'x'), N(ir.c)), tex = tx(T);
          return fnone(null, { expr: T, tex: tex, sol: 'No common factor, ' + t('a=1') + '. ' + noPairText(ir.c, ir.b) + '<br><b>Does not factor over the integers.</b>', hints: ['Find two integers that multiply to ' + t(ir.c) + ' and add to ' + t(ir.b) + ' — if there are none, it does not factor.'],
            whyNot: 'No pair of integers multiplies to ' + t(ir.c) + ' and adds to ' + t(ir.b) + ' — check every pair. If none works, press <b>none</b>.', bad: ['(x+1)(x+' + ir.c + ')'] });
        } }] },

      { num: '10', stem: 'Factor completely. Again the order is scrambled, and again one of them does not factor — press <b>none</b> for that one.', parts: [
        { id: 'e10a', level: 'PRG', make: function (r) { var d = decPair(r, [3, 4, 5], [4, 5, 6], [1, 5], [1, 5], '+'); return fnone(tri({ a: d.a, u: d.u, b: d.b, v: -d.v, X: V('r') })); } },
        { id: 'e10b', level: 'EMG', make: function (r) {
          var mn = r.sample([2, 3, 5, 6, 7], 2).sort(), pr = tri({ a: 1, u: -mn[0], b: 1, v: -mn[1], X: M(1, { z: 2 }) });
          pr.sol += '<br>' + t(mn[0]) + ' and ' + t(mn[1]) + ' are not perfect squares, so neither bracket factors further.';
          return fnone(pr);
        } },
        { id: 'e10c', level: 'PRG', make: function (r) { var g = r.pick([2, 3, 5]), pq = cop(r, 2, 5, 1, 5); return fnone(dos({ k: M(g, 't'), A: M(pq[0], 's'), B: M(pq[1], 't') })); } },
        { id: 'e10d', level: 'EMG', make: function (r) { var uv = two(r, 2, 9); return fnone(grp({ A1: V('a'), A2: N(uv[0]), B1: V('b'), B2: N(uv[1]) })); } },
        { id: 'e10e', level: 'BEG', make: function (r) {
          var g = r.pick([2, 3, 4, 5]), c; do { c = [r.int(2, 5), r.int(2, 7), r.int(2, 9)]; } while (gcd(gcd(c[0], c[1]), c[2]) !== 1);
          var gm = M(g, { u: 2, v: 2 }), brk = S(M(c[0], 'u'), M(-c[1], 'v'), N(c[2])), T = P.mul(gm, brk), tex = tx(T), key = lst([gm, brk]);
          var pr = { expr: T, tex: tex, list: [gm, brk], keyTex: key, text: 'factor ' + plain(tex), wrongs: [],
            sol: '<b>Common factor:</b> GCF ' + t(tx(gm)) + '.<br>' + t(tex + '=' + key) + '<br>The bracket’s terms share no factor and it isn’t a trinomial in one variable, so this is complete.',
            hints: ['Find the GCF: the greatest number that divides ' + t(g * c[0]) + ', ' + t(g * c[1]) + ' and ' + t(g * c[2]) + ', and the lowest power of each variable.'] };
          return fnone(pr);
        } },
        { id: 'e10f', level: 'BEG', make: function (r) {
          var n = r.int(4, 12), T = S(M(1, { t: 2 }), N(n * n)), tex = tx(T);
          return fnone(null, { expr: T, tex: tex, sol: t('t^{2}+' + n + '^{2}') + ' is a <b>sum</b> of squares.<br><b>Does not factor over the integers.</b>', hints: ['Is it a difference of squares, or a sum?'],
            whyNot: 'A sum of squares does not factor over the integers (only a <b>difference</b> ' + t('A^{2}-B^{2}') + ' does). Press <b>none</b>.', bad: ['(t-' + n + ')(t+' + n + ')', '(t+' + n + ')^2'] });
        } }] },

      /* ---------- EP Part E — knowing when to stop ---------- */
      { num: '11', section: 'Extra practice E — Knowing when to stop', stem: 'Each line is a student’s <b>final</b> answer. Is it factored completely? Type the completely factored form — if the student’s answer is already complete, type it as it is.', parts: [
        { id: 'e11a', level: 'BEG', make: function (r) { var k = r.pick([2, 3, 5, 7]), n = r.int(2, 9); return stopPart(k + '(x^{2}-' + n * n + ')', dos({ k: k, A: X, B: N(n) }), 'Not complete: ' + t('x^{2}-' + n * n + '=x^{2}-' + n + '^{2}') + ' is a difference of squares.'); } },
        { id: 'e11b', level: 'BEG', make: function (r) { var pq = cop(r, 2, 5, 1, 7); var pr = dos({ A: M(pq[0], 'x'), B: N(pq[1]) }); return stopPart('(' + pq[0] + 'x-' + pq[1] + ')(' + pq[0] + 'x+' + pq[1] + ')', pr, 'Neither bracket has a common factor or is a difference of squares. <b>Complete.</b>'); } },
        { id: 'e11c', level: 'EMG', make: function (r) {
          var k = r.int(2, 7), b, c; do { b = r.int(1, 6); c = r.int(2, 12); } while (hasPair(c, b) || b * b >= 4 * c);
          var inner = S(M(1, { x: 2 }), M(b, 'x'), N(c)), given = k + 'x(' + tx(inner) + ')', T = P.mul(M(k, 'x'), inner);
          return stopPart(given, { expr: T, list: [M(k, 'x'), inner], keyTex: given, wrongs: [], hints: ['Can ' + t(tx(inner)) + ' be factored? Look for two integers that multiply to ' + t(c) + ' and add to ' + t(b) + '.'] }, t(tx(inner)) + ': ' + noPairText(c, b) + ' So it is <b>complete</b>.');
        } },
        { id: 'e11d', level: 'PRG', make: function (r) {
          var k = r.pick([2, 3, 5]), p = r.int(1, 5), given = '(x+' + p + ')(' + k + 'x^{2}-' + k * p * p + ')';
          var list = [N(k), S(X, N(-p)), { p: S(X, N(p)), k: 2 }], T = FA.product(list);
          return stopPart(given, { expr: T, list: list, keyTex: lst(list), wrongs: [{ is: [N(k), S(X, N(p)), S(X, N(-p))], code: 'value', hint: 'You lost a factor of ' + t('(x+' + p + ')') + ': the student’s first bracket is still there.' }], hints: ['The second bracket has a common factor, and what is left is a difference of squares.', 'Then collect the repeated factor as a square.'] },
            'Not complete: ' + t(k + 'x^{2}-' + k * p * p) + ' has a GCF of ' + t(k) + ', and ' + t('x^{2}-' + p * p) + ' is a difference of squares.<br>' + t(given + '=' + k + '(x+' + p + ')(x^{2}-' + p * p + ')=' + k + '(x+' + p + ')(x-' + p + ')(x+' + p + ')'));
        } },
        { id: 'e11e', level: 'BEG', make: function (r) {
          var k = r.pick([2, 3, 4, 5, 6]), n = r.int(2, 9), inner = S(M(1, { x: 2 }), N(n * n)), given = k + '(' + tx(inner) + ')';
          return stopPart(given, { expr: P.mul(N(k), inner), list: [N(k), inner], keyTex: given, wrongs: [{ is: [N(k), S(X, N(-n)), S(X, N(n))], code: 'sum-squares', hint: t(tx(inner)) + ' is a <b>sum</b> of squares — it does not factor. ' + t('(x-' + n + ')(x+' + n + ')=x^{2}-' + n * n) + '.' }], hints: ['Is ' + t(tx(inner)) + ' a difference of squares?'] },
            t(tx(inner)) + ' is a <b>sum</b> of squares, which does not factor. <b>Complete.</b>');
        } },
        { id: 'e11f', level: 'PRG', make: function (r) {
          var pq = two(r, 1, 6), p = pq[0], q = pq[1], inner = P.mul(S(X, N(-p)), S(X, N(-q))), given = '(x-' + p + ')(' + tx(inner) + ')';
          var list = [S(X, N(-q)), { p: S(X, N(-p)), k: 2 }];
          return stopPart(given, { expr: FA.product(list), list: list, keyTex: lst(list), wrongs: [], hints: ['Can ' + t(tx(inner)) + ' be factored by inspection?', 'Collect the repeated factor as a square.'] },
            'Not complete: ' + t(tx(inner)) + ' factors by inspection (product ' + t(p * q) + ', sum ' + t(-(p + q)) + ': ' + t(-p) + ' and ' + t(-q) + ').<br>' + t(given + '=(x-' + p + ')(x-' + p + ')(x-' + q + ')'));
        } }] },

      { num: '12', stem: 'Exactly <b>four</b> of the six below do not factor over the integers. Factor the two that do; for each of the others press <b>none</b>.',
        shared: function (r) {
          var A = irreducibleMonic(r, 2, 9, 2, 15, '+');
          var Bq = cop(r, 2, 6, 1, 9);
          var a, b, c; do { a = r.pick([2, 3, 5]); b = r.int(3, 11); c = r.int(1, 7); } while (gcd(gcd(a, b), c) !== 1 || hasPair(a * c, b));
          var D = irreducibleMonic(r, 1, 5, 1, 7, '-');
          var ea, ep, eu; do { ea = r.pick([2, 3, 5]); ep = r.int(1, 5); eu = r.int(1, 9); } while (gcd(ea, eu) !== 1);
          var F = cop(r, 2, 5, 1, 7);
          var tA = S(M(1, { x: 2 }), M(A.b, 'x'), N(A.c)), tB = S(M(Bq[0] * Bq[0], { x: 2 }), N(Bq[1] * Bq[1])), tC = S(M(a, { x: 2 }), M(b, 'x'), N(c)), tD = S(M(1, { x: 2 }), M(-D.b, 'x'), N(D.c));
          return { A: A, Bq: Bq, C: [a, b, c], D: D, E: [ea, ep, eu], F: F, tex: [tx(tA), tx(tB), tx(tC), tx(tD)] };
        },
        parts: [
          { id: 'e12a', sub: 'a', level: 'EMG', make: function (r, sh) { return noneTri(1, sh.A.b, sh.A.c); } },
          { id: 'e12b', sub: 'b', level: 'BEG', make: function (r, sh) {
            var pq = sh.Bq, T = S(M(pq[0] * pq[0], { x: 2 }), N(pq[1] * pq[1])), tex = tx(T);
            return fnone(null, { expr: T, tex: tex, sol: t(tex + '=(' + pq[0] + 'x)^{2}+' + pq[1] + '^{2}') + ' is a <b>sum</b> of squares.<br><b>Does not factor.</b>', hints: ['Difference or sum?'],
              whyNot: 'A sum of squares does not factor over the integers. Press <b>none</b>.', bad: ['(' + pq[0] + 'x-' + pq[1] + ')(' + pq[0] + 'x+' + pq[1] + ')'] });
          } },
          { id: 'e12c', sub: 'c', level: 'EMG', make: function (r, sh) { return noneTri(sh.C[0], sh.C[1], sh.C[2]); } },
          { id: 'e12d', sub: 'd', level: 'EMG', make: function (r, sh) { return noneTri(1, -sh.D.b, sh.D.c); } },
          { id: 'e12e', sub: 'e', level: 'PRG', make: function (r, sh) { var e = sh.E; return fnone(tri({ a: 1, u: -e[1], b: e[0], v: -e[2], X: X })); } },
          { id: 'e12f', sub: 'f', level: 'PRG', make: function (r, sh) { return fnone(tri({ a: sh.F[0], u: -sh.F[1], b: sh.F[0], v: -sh.F[1], X: X })); } },
          { id: 'e12g', sub: 'reasons', level: 'EMG', make: function (r, sh) {
            var ids = ['a', 'b', 'c', 'd'], ms = ['pair', 'sum', 'pair', 'pair'];
            var rows = ids.map(function (id, i) { return { id: id, html: '(' + id + ') ' + t(sh.tex[i]) }; });
            var cols = [{ id: 'sum', html: 'sum of<br>squares' }, { id: 'pair', html: 'no integer<br>pair' }], want = {}; ids.forEach(function (id, i) { want[id] = ms[i]; });
            var C = sh.C, D = sh.D;
            return B.grid('(a)–(d) do not factor. Give the reason for each.', rows, cols, want, {
              why: function (id) { return { code: 'row', hint: id === 'b' ? 'Two terms, both perfect squares, with a <b>plus</b> between them.' : 'Three terms: the trouble is that no pair of integers has the right product and sum.' }; }
            }, '(a) ' + t(sh.tex[0]) + ': <b>no integer pair</b> with product ' + t(sh.A.c) + ' and sum ' + t(sh.A.b) + '.<br>(b) ' + t(sh.tex[1] + '=(' + sh.Bq[0] + 'x)^{2}+' + sh.Bq[1] + '^{2}') + ': a <b>sum of squares</b>.<br>(c) ' + t(sh.tex[2]) + ': <b>no integer pair</b> with product ' + t('ac=' + C[0] * C[2]) + ' and sum ' + t(C[1]) + '.<br>(d) ' + t(sh.tex[3]) + ': <b>no integer pair</b> with product ' + t(D.c) + ' and sum ' + t(-D.b) + '.',
            ['A binomial fails if it is a sum of squares; a trinomial fails if no pair of integers works.'], 'reasons it does not factor');
          } }] },

      /* ---------- EP Part F — error analysis ---------- */
      { num: '13', section: 'Extra practice F — Error analysis', stem: function (sh) { return 'A student is asked to factor ' + t(sh.pr.tex) + '. Their work begins: <i>“' + t('a=' + sh.a + ',\\ c=' + (-sh.q * sh.p)) + ', so ' + t('ac=' + (-sh.a * sh.q * sh.p)) + '. I need two integers with product ' + t(-sh.a * sh.q * sh.p) + ' and sum ' + t(sh.a * sh.p) + '…”</i>'; },
        shared: function (r) { var a, p, q; do { a = r.pick([2, 3, 5, 6, 7]); p = r.int(2, 6); q = r.int(1, 7); } while (gcd(a, q) !== 1); return { a: a, p: p, q: q, pr: grp({ A1: M(a, { x: 2 }), A2: N(-q), B1: X, B2: N(p), note: t(a + 'x^{2}-' + q) + ' is not a difference of squares over the integers, so this is complete.' }) }; },
        parts: [
          { id: 'e13a', sub: 'a', level: 'EMG', make: function (r, sh) {
            return mcPart(r, 'Which line of the checklist did the student use, and which should they have used?', [
              { html: 'They used <b>decomposition</b> (line 4), but the expression has <b>four</b> terms, so they should use <b>grouping</b> (line 5).', right: true },
              { html: 'They used grouping, but it is a trinomial, so they should use decomposition.', why: 'Count the terms of ' + t(sh.pr.tex) + ': there are four. And ' + t('a') + ', ' + t('c') + ', ' + t('ac') + ' are decomposition words.' },
              { html: 'They used decomposition correctly — only their sum is wrong.', why: 'There is no single middle term to split: the expression already has four terms, so ' + t('a') + ', ' + t('c') + ' and the sum mean nothing here.' },
              { html: 'They should have used difference of squares, because the first and last terms are separated by a minus sign.', why: 'Difference of squares is for exactly two terms. This has four.' }],
              'The student used line 4, <b>decomposition</b>, which is only for a trinomial ' + t('ax^{2}+bx+c') + '. ' + t(sh.pr.tex) + ' has <b>four</b> terms (and no factor common to all four), so they should have used line 5, <b>factoring by grouping</b>.', ['Count the terms first.'], 'which checklist line');
          } },
          { id: 'e13b', sub: 'b', level: 'PRG', make: function (r, sh) {
            var pr = sh.pr; pr.sol += '<br>Check: ' + t(pr.keyTex + '=' + P.seq([pr.t4[0], pr.t4[2], pr.t4[1], pr.t4[3]]) + '=' + pr.tex) + ' ✓';
            return fac(pr, { prompt: 'Factor ' + t(pr.tex) + ' completely by the correct method.' });
          } }] },

      { num: '14', stem: function (sh) { return 'A student writes ' + t(sh.p * sh.p + 'x^{2}+' + sh.q * sh.q + '=(' + sh.p + 'x-' + sh.q + ')(' + sh.p + 'x+' + sh.q + ')') + '.'; },
        shared: function (r) { var pq = cop(r, 2, 6, 1, 9); return { p: pq[0], q: pq[1] }; },
        parts: [
          { id: 'e14a', sub: 'a', level: 'BEG', make: function (r, sh) {
            var p = sh.p, q = sh.q, T = P.sub(M(p * p, { x: 2 }), N(q * q));
            var part = B.poly('Expand the student’s answer ' + t('(' + p + 'x-' + q + ')(' + p + 'x+' + q + ')') + '. (This is what they actually factored.)', T, { wrong: [{ is: S(M(p * p, { x: 2 }), N(q * q)), code: 'expand-sign', hint: 'The last terms are ' + t('-' + q) + ' and ' + t('+' + q) + ': their product is ' + t('-' + q * q) + ', not ' + t('+' + q * q) + '.' }] },
              t('(' + p + 'x-' + q + ')(' + p + 'x+' + q + ')=' + p * p + 'x^{2}+' + p * q + 'x-' + p * q + 'x-' + q * q + '=' + tx(T)) + '<br>They actually factored ' + t(tx(T)) + ', a <b>difference</b> of squares, not ' + t(p * p + 'x^{2}+' + q * q) + '.',
              ['Multiply every term in the first bracket by every term in the second.'], 'expand (' + p + 'x-' + q + ')(' + p + 'x+' + q + ')');
            part.bad = [tx(S(M(p * p, { x: 2 }), N(q * q)))];
            return part;
          } },
          { id: 'e14b', sub: 'b', level: 'BEG', make: function (r, sh) {
            var p = sh.p, q = sh.q, L = p * p + q * q, R = (p - q) * (p + q);
            return B.fields('Substitute ' + t('x=1') + ' into both sides to give a one-line disproof.', [{ name: 'Left side', label: 'Left: ' + t(p * p + '(1)^{2}+' + q * q + '=') }, { name: 'Right side', label: 'Right: ' + t('(' + p + '-' + q + ')(' + p + '+' + q + ')=') }],
              [K.number(L, function (v) { return v === p * p - q * q ? { code: 'sub-wrong', hint: 'The left side is ' + t(p * p + '+' + q * q) + ' — a sum.' } : v === p + q * q || v === 2 * p + q * q ? { code: 'sub-wrong', hint: t(p * p + '(1)^{2}=' + p * p) + '.' } : null; }),
                K.number(R, function (v) { return v === L ? { code: 'sub-wrong', hint: 'Work out each bracket at ' + t('x=1') + ': ' + t(p + '-' + q + '=' + (p - q)) + ' and ' + t(p + '+' + q + '=' + (p + q)) + '.' } : null; })],
              [String(L), String(R)], 'Left ' + t(L) + ', right ' + t(R),
              'At ' + t('x=1') + ':<br>Left: ' + t(p * p + '(1)^{2}+' + q * q + '=' + L) + '<br>Right: ' + t('(' + p + '-' + q + ')(' + p + '+' + q + ')=' + (p - q) + '\\times' + nn(p + q) + '=' + R) + '<br>' + t(L + '\\neq' + nn(R)) + ', so the factoring is <b>wrong</b>.',
              ['Replace ' + t('x') + ' with ' + t('1') + ' on each side and work it out.'], 'x = 1 disproof');
          } },
          { id: 'e14c', sub: 'c', level: 'EMG', make: function (r, sh) {
            var p = sh.p, q = sh.q, e = p * p + 'x^{2}+' + q * q;
            return mcPart(r, 'What is the correct verdict for ' + t(e) + ', and the general rule behind it?', [
              { html: 'It <b>does not factor</b> over the integers: ' + t('A^{2}-B^{2}=(A-B)(A+B)') + ' works only for a <b>difference</b>; a sum of squares ' + t('A^{2}+B^{2}') + ' does not factor.', right: true },
              { html: 'It factors as ' + t('(' + p + 'x+' + q + ')^{2}') + ', because both signs must be ' + t('+') + '.', why: 'Expand: ' + t('(' + p + 'x+' + q + ')^{2}=' + p * p + 'x^{2}+' + 2 * p * q + 'x+' + q * q) + ' — it has a middle term.' },
              { html: 'The student is right; substituting ' + t('x=1') + ' isn’t a fair check.', why: 'A factorization is an identity: it must be true for <b>every</b> value of ' + t('x') + '. One value that fails disproves it.' },
              { html: 'Take out a common factor first, then it becomes a difference of squares.', why: t(p * p) + ' and ' + t(q * q) + ' have no common factor, and taking one out never turns a sum into a difference.' }],
              t(e) + ' <b>does not factor over the integers</b>. Rule: ' + t('A^{2}-B^{2}=(A-B)(A+B)') + ' works only for a <b>difference</b>; a <b>sum</b> of squares ' + t('A^{2}+B^{2}') + ' does not factor over the integers.', ['Which pattern did the student use? Does it fit a sum?'], 'verdict sum of squares');
          } }] },

      { num: '15', stem: function (sh) { return 'A student factors ' + t(sh.T) + ' as ' + t(sh.stu) + '.'; },
        shared: function (r) {
          var k = r.pick([2, 3]), pq = cop(r, 1, 4, 1, 7), p = pq[0], q = pq[1];
          var T = tx(P.scale(P.sub(M(p * p, { x: 2 }), N(q * q)), k)), stu = '(' + tx(S(M(p, 'x'), N(-q))) + ')(' + tx(S(M(k * p, 'x'), N(k * q))) + ')';
          return { k: k, p: p, q: q, T: T, stu: stu };
        },
        parts: [
          { id: 'e15a', sub: 'a', level: 'EMG', make: function (r, sh) {
            var kp = tx(S(M(sh.k * sh.p, 'x'), N(sh.k * sh.q)));
            return mcPart(r, 'The student’s product really is ' + t(sh.T) + ' (expand to check). So what <b>is</b> wrong with the answer?', [
              { html: 'It isn’t factored completely: the bracket ' + t('(' + kp + ')') + ' still has a common factor of ' + t(sh.k) + '.', right: true },
              { html: 'The product is wrong.', why: 'Expand it: ' + t(sh.stu + '=' + sh.T) + '. The product is right — look at the brackets themselves.' },
              { html: 'Nothing — any pair of brackets that multiplies back correctly is a complete factorization.', why: 'Checklist step 6: can any factor be factored again? ' + t('(' + kp + ')') + ' can.' },
              { html: 'The signs should be swapped between the brackets.', why: 'Swapping signs gives the same product here, but it still leaves a common factor inside a bracket.' }],
              t(sh.stu + '=' + sh.T) + ' ✓ The product is right, but the answer is <b>not factored completely</b>: ' + t(kp + '=' + sh.k + '(' + tx(S(M(sh.p, 'x'), N(sh.q))) + ')') + ' still has a common factor.', ['Look inside each bracket: is there a common factor?'], 'what is wrong: gcf left inside');
          } },
          { id: 'e15b', sub: 'b', level: 'BEG', make: function (r, sh) { return fac(dos({ k: sh.k, A: M(sh.p, 'x'), B: N(sh.q) }), { prompt: 'Give the completely factored form of ' + t(sh.T) + '.' }); } },
          { id: 'e15c', sub: 'b steps', level: 'EMG', make: function (r, sh) {
            return mcPart(r, 'Which checklist step did the student skip at the start, and which did they fail at the end?', [
              { html: 'Skipped <b>step 1</b> (common factor first); failed <b>step 6</b> (can any factor be factored again?).', right: true },
              { html: 'Skipped step 2 (difference of squares); failed step 1.', why: 'They did use a difference-of-squares style answer. What they never did was take out ' + t(sh.k) + ' first.' },
              { html: 'Skipped step 5 (grouping); failed step 4 (decomposition).', why: 'Grouping is for four terms; this has two.' },
              { html: 'Skipped step 6 only; step 1 doesn’t apply to two terms.', why: 'Step 1 always applies: ' + t(sh.T) + ' has a common factor of ' + t(sh.k) + '.' }],
              t(sh.T + '=' + sh.k + '(' + tx(P.sub(M(sh.p * sh.p, { x: 2 }), N(sh.q * sh.q))) + ')') + ': they skipped <b>step 1</b> (common factor first) at the start and failed <b>step 6</b> (check each factor) at the end.', ['What does the checklist say to do first? And last?'], 'which steps skipped');
          } }] },

      /* ---------- EP Part G — stretch ---------- */
      { num: '16', section: 'Extra practice G — Stretch', stem: function (sh) { return 'Factor ' + t(sh.tex) + ' by decomposition.'; },
        shared: function (r) {
          var a, u, b, v; do { a = r.int(2, 4); u = r.int(2, 5); b = r.int(2, 5); v = r.int(2, 5); } while (gcd(a, u) !== 1 || gcd(b, v) !== 1 || a === b || a * v === b * u);
          var f1 = S(M(a, 'x'), N(u)), f2 = S(M(b, 'x'), N(v));
          return { a: a, u: u, b: b, v: v, f1: f1, f2: f2, tex: tx(P.mul(f1, f2)), A: a * b, m1: b * u, m2: a * v, C: u * v };
        },
        parts: [0, 1].map(function (j) {
          return { id: 'e16' + 'ab'.charAt(j), sub: 'ab'.charAt(j), level: 'EMG', make: function (r, sh) {
            var first = j ? sh.m2 : sh.m1, second = j ? sh.m1 : sh.m2;
            var g1 = j ? [M(sh.a, 'x'), sh.f2] : [M(sh.b, 'x'), sh.f1], g2 = j ? [N(sh.u), sh.f2] : [N(sh.v), sh.f1];
            var p1 = P.seq([M(sh.A, { x: 2 }), M(first, 'x')]), p2 = P.seq([M(second, 'x'), N(sh.C)]);
            var box = function (name, lab) { return { name: name, label: lab, mode: 'math', keys: 'poly', vars: ['x'], wide: true, placeholder: 'e.g. 2x(3x + 1)' }; };
            var c1 = K.factored(g1, { gcfOnly: true }), c2 = K.factored(g2, { gcfOnly: true }), c3 = K.factored([sh.f1, sh.f2]);
            var res = lst(j ? [sh.f2, sh.f1] : [sh.f1, sh.f2]);
            var p = B.fields('Split the middle term as ' + t(first + 'x+' + second + 'x') + ': ' + t(P.seq([M(sh.A, { x: 2 }), M(first, 'x'), M(second, 'x'), N(sh.C)])) + '. Factor each pair, then write the result.',
              [box('First pair', t(p1 + '=')), box('Second pair', t(p2 + '=')), box('Factored form', 'So ' + t(sh.tex + '='))],
              [c1, c2, c3], [lst(g1), lst(g2), res], t(p1 + '=' + lst(g1)) + ', ' + t(p2 + '=' + lst(g2)) + '; ' + t(sh.tex + '=' + res),
              t(sh.tex + '=' + P.seq([M(sh.A, { x: 2 }), M(first, 'x'), M(second, 'x'), N(sh.C)])) + '<br>' + t('=' + lst(g1) + '+' + lst(g2)) + '<br>' + t('=' + res),
              ['Take the GCF out of each pair. The two brackets you get should match.'], 'decomposition split ' + first + 'x+' + second + 'x');
            p.bad = [[lst(g1), lst(g2), lst([S(M(sh.a, 'x'), N(-sh.u)), sh.f2])]];
            return p;
          } };
        }).concat([{ id: 'e16c', sub: 'c', level: 'EMG', make: function (r, sh) {
          return mcPart(r, 'The two groupings look nothing alike. Why must they give the same answer?', [
            { html: 'Both rewrite the <b>same</b> polynomial, and multiplication is commutative: they reach the same two brackets, just in the other order.', right: true },
            { html: 'They don’t have to — one of the two splits is wrong.', why: 'Both splits add to ' + t(sh.m1 + sh.m2 + 'x') + ', so both are correct rewrites of the same polynomial. Finish both and compare.' },
            { html: 'Because the first terms ' + t(sh.A + 'x^{2}') + ' are the same in both.', why: 'Matching first terms isn’t enough on its own — the whole polynomial is the same in both, which is why the factors match.' },
            { html: 'Because every quadratic can be factored in only one order.', why: 'Order doesn’t matter in a product: ' + t(lst([sh.f1, sh.f2]) + '=' + lst([sh.f2, sh.f1])) + '.' }],
            'Both groupings rewrite the <b>same</b> polynomial, so they must give equal products. They pull out different common factors but reach the same two brackets, ' + t(P.btex(sh.f1)) + ' and ' + t(P.btex(sh.f2)) + ', in the other order. Multiplication is commutative, so the order of the split never changes the answer.', ['Are the two split versions the same polynomial?'], 'why both splits agree');
        } }]) },

      { num: '17', stem: 'Neither of these is in a helpful order. Rearrange first, then factor completely.',
        shared: function (r) { var p = r.int(2, 7), q = r.int(1, 3); return { p: p, q: q, pr: grp({ A1: X, A2: N(p), B1: X, B2: M(q, 'y'), idx: [0, 3, 2, 1] }) }; },
        parts: [
          { id: 'e17a1', sub: 'a i', level: 'EMG', make: function (r, sh) {
            var t4 = sh.pr.t4, first = P.seq([t4[0], t4[3]]);
            return mcPart(r, 'In ' + t(sh.pr.tex) + ', why does grouping the first two terms, ' + t('(' + first + ')') + ', get you nowhere?', [
              { html: t(tx(t4[0])) + ' and ' + t(tx(t4[3])) + ' have no common factor, so nothing comes out and no matching bracket can appear.', right: true },
              { html: 'Because the first pair has two different variables, and grouping only works with one variable.', why: 'Grouping works fine with several variables (for example ' + t('x(x+' + sh.p + ')+' + (sh.q === 1 ? '' : sh.q) + 'y(x+' + sh.p + ')') + '). The problem is that this pair shares no factor.' },
              { html: 'Because a four-term expression must be factored by decomposition.', why: 'Four terms ⇒ grouping. The pairs just need to be chosen so each shares a factor.' },
              { html: 'It does work: ' + t(first + '=x(x+' + sh.p * sh.q + 'y)') + '.', why: 'Expand ' + t('x(x+' + sh.p * sh.q + 'y)') + ': you get ' + t('x^{2}+' + sh.p * sh.q + 'xy') + ', not ' + t(first) + '.' }],
              t(first) + ' has no common factor, so the first pair gives nothing to take out and no matching bracket can appear. Regroup so each pair shares a factor: ' + t(P.seq([t4[0], t4[2], t4[1], t4[3]])) + '.', ['What do ' + t(tx(t4[0])) + ' and ' + t(tx(t4[3])) + ' have in common?'], 'why the first grouping fails');
          } },
          { id: 'e17a2', sub: 'a ii', level: 'PRG', make: function (r, sh) {
            var pr = sh.pr, t4 = pr.t4;
            pr.sol = '<b>Regroup</b> so each pair shares a factor:<br>' + t(pr.tex + '=' + P.seq([t4[0], t4[2], t4[1], t4[3]])) + '<br>' + t('=x(x+' + sh.p + ')+' + (sh.q === 1 ? '' : sh.q) + 'y(x+' + sh.p + ')') + '<br>' + t('=' + lst([S(X, N(sh.p)), S(X, M(sh.q, 'y'))]));
            pr.keyTex = lst([S(X, N(sh.p)), S(X, M(sh.q, 'y'))]);
            pr.hints = ['Grouping the terms in the order given gets nowhere. Rearrange them so each pair shares a factor: put ' + t(tx(t4[0])) + ' next to ' + t(tx(t4[2])) + '.', 'Take the common factor out of each pair — the two brackets must match.'];
            return fac(pr, { prompt: 'Regroup and factor ' + t(pr.tex) + ' completely.' });
          } },
          { id: 'e17b', sub: 'b', level: 'PRG', make: function (r) {
            var pq = cop(r, 2, 5, 1, 7), p = pq[0], q = pq[1];
            var tex = P.seq([M(2 * p * q, 'x'), N(-q * q), M(-p * p, { x: 2 })]);
            var pr = tri({ k: -1, a: p, u: -q, b: p, v: -q, X: X, tex: tex, reorder: true });
            return fac(pr, { prompt: t(tex) + '<br><i>Write it in descending order, take out the common factor including its sign, then look again.</i>' });
          } }] },

      { num: '18', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: 'e18', level: 'PRG', make: function (r) {
          var k = r.pick([2, 3]), n = r.int(3, 9), p = r.int(1, 5), q = r.int(2, 6), m = r.pick([2, 3, 5, 6, 7]), c = r.int(2, 5), d = r.int(1, 4), kc = r.pick([2, 3, 4]);
          var A = k + '(x^{2}-' + n * n + ')', Bt = '(x+' + p + ')(2x-' + 2 * q + ')', C = kc + 'x(x^{2}+' + m + ')', D = '(x-' + d + ')(x^{2}-' + d * d + ')';
          return mcPart(r, 'Which of the following is factored <b>completely</b>?', [
            { html: t(A), why: t('x^{2}-' + n * n) + ' is a difference of squares: ' + t(A + '=' + k + '(x-' + n + ')(x+' + n + ')') + '.' },
            { html: t(Bt), why: t('2x-' + 2 * q) + ' has a common factor of ' + t('2') + ': ' + t(Bt + '=2(x+' + p + ')(x-' + q + ')') + '.' },
            { html: t(C), right: true },
            { html: t(D), why: t('x^{2}-' + d * d) + ' is a difference of squares: ' + t(D + '=(x-' + d + ')^{2}(x+' + d + ')') + '.' }],
            t(A + '=' + k + '(x-' + n + ')(x+' + n + ')') + ' — not complete.<br>' + t(Bt + '=2(x+' + p + ')(x-' + q + ')') + ' — not complete.<br>' + t(C) + ': ' + t('x^{2}+' + m) + ' is a <b>sum</b>, not a difference, and has no common factor — <b>complete</b>.<br>' + t(D + '=(x-' + d + ')(x-' + d + ')(x+' + d + ')=(x-' + d + ')^{2}(x+' + d + ')') + ' — not complete.',
            ['For each option, check every bracket: a common factor? a difference of squares?'], 'which is factored completely');
        } }] },

      { num: '19', stem: '<i>(Numerical Response)</i>', parts: [
        { id: 'e19', level: 'PRG', make: function (r) {
          var a = r.pick([2, 3, 5]), bc = cop(r, 2, 5, 1, 9), b = bc[0], c = bc[1], tex = tx(S(M(a * b * b, { x: 3 }), M(-a * c * c, 'x'))), ans = a + b + c;
          return B.nr('When ' + t(tex) + ' is factored completely it has the form ' + t('ax(bx-c)(bx+c)') + ', where ' + t('a') + ', ' + t('b') + ' and ' + t('c') + ' are positive integers. The value of ' + t('a+b+c') + ' is ________.', ans, function (v) {
            if (v === b + c) return { code: 'nr-forgot-a', hint: 'Don’t forget ' + t('a') + ' — the number part of the GCF.' };
            if (v === a + b * b + c * c) return { code: 'nr-partial-gcf', hint: 'Take out the GCF ' + t(a + 'x') + ' first; then the bracket is a difference of squares with ' + t('b') + ' and ' + t('c') + ' its square roots.' };
            return null;
          }, t(tex + '=' + a + 'x(' + b * b + 'x^{2}-' + c * c + ')') + '<br>' + t('=' + a + 'x\\big((' + b + 'x)^{2}-' + c + '^{2}\\big)=' + a + 'x(' + b + 'x-' + c + ')(' + b + 'x+' + c + ')') + '<br>So ' + t('a=' + a + ',\\ b=' + b + ',\\ c=' + c) + ' and ' + t('a+b+c=' + ans) + '.',
          ['Take out the GCF first, then factor the difference of squares.'], 'a+b+c for ' + plain(tex));
        } }] }
    ]
  });

  /* "is it finished? type the complete form" (Extra 11) */
  function stopPart(given, pr, why) {
    var chk = strict(K.factored(pr.list, { wrong: (pr.wrongs || []).filter(function (w) { return !P.eq(FA.product(w.is), pr.expr); }) }));
    var complete = lst(pr.list) === lst(FA.split(given).factors.map(function (f) { return { p: f.p, k: f.k }; }));
    var sol = why + '<br>' + t(given + (complete ? '' : '=' + pr.keyTex));
    var p = B.math('Student’s final answer: ' + t(given), chk, pr.keyTex, sol, pr.hints || ['Look at each factor: can it be factored again?'], 'stop or finish: ' + plain(given), { keys: 'poly', vars: P.vars(pr.expr), placeholder: 'the complete factored form' });
    p.good = [lst(pr.list)];
    if (!complete) p.bad = [given];
    return p;
  }
  /* a trinomial that does not factor (Extra 12) */
  function noneTri(a, b, c) {
    var T = S(M(a, { x: 2 }), M(b, 'x'), N(c)), tex = tx(T), ac = a * c;
    return fnone(null, { expr: T, tex: tex, sol: (a === 1 ? 'No GCF, ' + t('a=1') + '. ' : 'No GCF, ' + t('a=' + a) + ': ' + t('ac=' + ac) + '. ') + noPairText(ac, b) + '<br><b>Does not factor</b> — no integer pair.',
      hints: [a === 1 ? 'Look for two integers that multiply to ' + t(c) + ' and add to ' + t(b) + '.' : 'Decomposition: two integers that multiply to ' + t('ac=' + ac) + ' and add to ' + t(b) + '.'],
      whyNot: 'No pair of integers multiplies to ' + t(ac) + ' and adds to ' + t(b) + ' — check every pair. If none works, press <b>none</b>.' });
  }
})(window);
