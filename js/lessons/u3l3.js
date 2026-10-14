/* Math 10C · Unit 3 · Lesson 3 — Multiplying Polynomials I: Special Products (AN4)
 * Assignment questions 1–9 (u3_L03.tex) and the Lesson 3 Extra Practice (u3_EP03.tex).
 * Every part is a generator that keeps the booklet question's structure (signs, letters, which bracket carries the
 * coefficient, the booklet's term order) and changes the numbers; the booklet's own numbers are among the possible values.
 * Expansions are built as a list of signed products (see `T` below); the classic wrong answers for squares of binomials,
 * sums × differences, a number out front and subtracted products are computed from the generated numbers and given
 * targeted hints through K.poly's opt.wrong. Levels: LIM BEG EMG PRG ADV MAS. */
(function (root) {
  'use strict';
  var HW = root.HW, F = HW.fmt, K = HW.kit, t = K.t, B = K.P, P = HW.poly;

  HW.addCodes({
    'sq-no-middle': 'Squared a binomial without the middle term', 'sq-not-doubled': 'Middle term of a square not doubled',
    'sq-middle-sign': 'Wrong sign on the middle term of a square', 'sq-last-neg': 'Made the last square negative',
    'sq-as-sd': 'Treated a square as sum × difference', 'coef-not-squared': 'Coefficient not squared', 'neg-square': 'Square of a negative term written as negative',
    'sd-middle': 'Stray middle term in sum × difference', 'sd-plus': 'Sum × difference gave a² + b²', 'sd-as-square': 'Treated sum × difference as a square',
    'fl-only': 'FOIL with only First and Last', 'dist-first': 'Multiplied only the first term in the bracket',
    'k-first': 'Number in front multiplied into only one term', 'k-forgot': 'Forgot the number in front', 'k-both': 'Number in front multiplied into both brackets',
    'k-in-square': 'Number in front put inside the square', 'minus-first': 'Subtracted product: only the first sign changed', 'minus-ignored': 'Added a product that is subtracted',
    'not-subtracted': 'Did not subtract the old area', 'corner-only': 'Counted only the corner square', 'no-corner': 'Left out the corner square', 'one-strip': 'Counted only one strip',
    'new-area': 'Gave the new area instead of the increase', 'lhs-value': 'Gave the other side’s value', 'forgot-a2': 'Forgot to subtract a²', 'gave-a': 'Gave a instead of b',
    'not-sq': 'Did not square', 'sum-squares': 'Added the squares instead of subtracting', 'no-square-d': 'Did not square d', 'cross-not-doubled': 'Cross term not doubled',
    'no-cross': 'Left out the cross terms', 'gap-sign': 'Gap with the wrong sign', 'mid-missing': 'Left out the middle piece (2Nd)', 'mid-not-doubled': 'Middle piece not doubled',
    'mid-sign': 'Wrong sign on the middle piece', 'squared-k': 'Squared the coefficient instead of doubling', 'no-group-middle': 'Squared the grouped binomial without its middle term',
    perimeter: 'Gave the perimeter instead of the area', piece: 'Wrong area for one piece', 'n-d': 'Wrong N or d', cross: 'Counted cross terms wrongly', 'forgot-1': 'Forgot to subtract 1'
  });

  /* ---------------- building blocks ---------------- */
  function V(c, vars) { var v = {}; if (typeof vars === 'string') { if (vars) v[vars] = 1; } else if (vars) v = vars; return P.mono(c, v); }
  function bin(a, b) { return { p: P.add(a, b), tex: '(' + P.seq([a, b]) + ')', terms: [a, b] }; }
  function grp(list) { return { p: P.add.apply(null, list), tex: '(' + P.seq(list) + ')', terms: list }; }
  function mono(m) { return { p: m, tex: P.tex(m), mono: true, terms: [m] }; }
  /* a signed product: s = +1 / -1 (the sign in front), k = positive number in front, f = factors, sq = the one factor is squared */
  function T(s, k, f, sq) { return { s: s, k: k == null ? 1 : k, f: f || [], sq: !!sq }; }
  function bodyTex(tm) { return tm.f.map(function (f) { return f.tex; }).join('') + (tm.sq ? '^{2}' : ''); }
  function termTex(tm, first) { var op = tm.s < 0 ? '-' : first ? '' : '+'; if (!tm.f.length) return op + tm.k; return op + (tm.k !== 1 ? tm.k : '') + bodyTex(tm); }
  function exprTex(terms) { return terms.map(function (tm, i) { return termTex(tm, i === 0); }).join(''); }
  function innerOf(tm) { if (!tm.f.length) return P.num(1); if (tm.sq) return P.pow(tm.f[0].p, 2); return P.mul.apply(null, tm.f.map(function (f) { return f.p; })); }
  function cof(m) { var ts = P.terms(m); return ts.length ? ts[0].c[0] / ts[0].c[1] : 0; }
  function pos(m) { return cof(m) < 0 ? P.neg(m) : m; }
  function unsq(m) { var tt = P.terms(m)[0], v = {}; Object.keys(tt.v).forEach(function (x) { v[x] = 2 * tt.v[x]; }); return P.mono([Math.abs(tt.c[0]), tt.c[1]], v); }
  function firstTerm(p) { var ts = P.sorted(p); return P.mono(ts[0].c, ts[0].v); }
  function sqp(m) { var s = P.tex(m); return /^([a-z]|\d+)$/.test(s) ? s : '(' + s + ')'; }
  function pp(m) { return '(' + P.tex(m) + ')'; }
  function isBin(f) { return !f.mono && f.terms.length === 2; }
  function two(r, a, b) { var x = r.int(a, b), y; do { y = r.int(a, b); } while (y === x); return [x, y]; }
  function frac(p, q) { return '\\frac{' + p + '}{' + q + '}'; }
  var X = V(1, 'x'), Y = V(1, 'y');
  var SQ = t('(a\\pm b)^{2}=a^{2}\\pm 2ab+b^{2}'), SD = t('(a+b)(a-b)=a^{2}-b^{2}');

  function classify(tm) {
    var f = tm.f;
    if (tm.sq && isBin(f[0])) return { kind: 'sq', A: f[0].terms[0], B: f[0].terms[1], sqT: f[0].tex + '^{2}', two: f[0].tex + f[0].tex };
    if (f.length === 2 && isBin(f[0]) && isBin(f[1])) {
      if (P.eq(f[0].p, f[1].p)) return { kind: 'sq', same: true, A: f[0].terms[0], B: f[0].terms[1], sqT: f[0].tex + f[1].tex, two: f[0].tex + f[1].tex };
      for (var i = 0; i < 2; i++) for (var j = 0; j < 2; j++)
        if (P.eq(f[0].terms[i], f[1].terms[j]) && P.eq(f[0].terms[1 - i], P.neg(f[1].terms[1 - j]))) return { kind: 'sd', A: f[0].terms[i], B: f[0].terms[1 - i], sdT: f[0].tex + f[1].tex, swapped: i !== 0 || j !== 0 };
      return { kind: 'foil', a: f[0].terms, b: f[1].terms, T: f[0].tex + f[1].tex };
    }
    if (f.length === 2 && f[0].mono && !f[1].mono) return { kind: 'dist', m: f[0].p, terms: f[1].terms };
    return { kind: 'other' };
  }

  /* the classic wrong values of the bracket product itself (before the number in front) */
  function innerVariants(cl) {
    var out = [];
    function add(p, code, hint) { out.push({ p: p, code: code, hint: hint }); }
    if (cl.kind === 'sq' || cl.kind === 'sd') {
      var A = cl.A, Bm = cl.B, A2 = P.pow(A, 2), B2 = P.pow(Bm, 2), AB = P.mul(A, Bm), AB2 = P.scale(AB, 2);
      var notSq = function (Xm) { if (cl.kind === 'sd') Xm = pos(Xm); if (!P.vars(Xm).length) return 'Don’t forget to <b>square</b> the last term: ' + t('(' + P.tex(Xm) + ')^{2}') + ' is not ' + t(P.tex(unsq(Xm))) + '.';
        return 'Square the <b>whole</b> term, coefficient and all: ' + t('(' + P.tex(Xm) + ')^{2}') + ' is not ' + t(P.tex(unsq(Xm))) + '.'; };
      var negSq = 'A square is never negative: ' + t('(' + P.tex(A) + ')^{2}') + ' is positive, because a negative times a negative is positive.';
      if (cl.kind === 'sq') {
        var S = cl.sqT;
        add(P.add(A2, B2), 'sq-no-middle', 'Squaring a binomial always gives a <b>middle term</b>. ' + t(S) + ' means ' + t(cl.two) + ', and the outer and inner products don’t cancel. Use ' + SQ + '.');
        add(P.add(A2, AB, B2), 'sq-not-doubled', 'Check the middle term: it is <b>twice</b> the product of the two terms, ' + t('2ab') + '. The outer and inner products are equal, and you need both of them.');
        add(P.add(A2, P.neg(AB2), B2), 'sq-middle-sign', 'Check the <b>sign of the middle term</b>. It is ' + t('2ab') + ' using the signs of the two terms as written: ' + (cof(AB) < 0 ? 'one of them is negative, so the middle term is negative.' : 'they have the same sign, so the middle term is positive.'));
        add(P.add(A2, AB2, P.neg(B2)), 'sq-last-neg', 'The last term of a square is ' + t('b^{2}') + ', and a square is never negative: ' + t('(' + P.tex(Bm) + ')^{2}') + ' is positive.');
        add(P.sub(A2, B2), 'sq-as-sd', t(S) + ' is a <b>square</b> — the same binomial times itself — not a sum times a difference. Use ' + SQ + ', which has a middle term.');
        if (Math.abs(cof(A)) !== 1 || P.degree(A) > 1) add(P.add(unsq(A), AB2, B2), 'coef-not-squared', notSq(A));
        if (Math.abs(cof(Bm)) !== 1 || P.degree(Bm) > 1) add(P.add(A2, AB2, unsq(Bm)), 'coef-not-squared', notSq(Bm));
        if (cof(A) < 0) add(P.add(P.neg(A2), AB2, B2), 'neg-square', negSq);
      } else {
        var D = cl.sdT;
        add(P.add(A2, AB2, P.neg(B2)), 'sd-middle', 'In ' + t(D) + ' the outer and inner products are opposites, so they <b>cancel</b>: a sum times a difference has no middle term. ' + SD + '.');
        add(P.sub(P.sub(A2, AB2), B2), 'sd-middle', 'In ' + t(D) + ' the outer and inner products are opposites, so they <b>cancel</b>: a sum times a difference has no middle term. ' + SD + '.');
        add(P.add(A2, B2), 'sd-plus', t(D) + ' is a sum times a difference, so the result is a <b>difference</b> of squares, ' + t('a^{2}-b^{2}') + '. The two last terms have opposite signs, so their product is negative.');
        add(P.add(A2, AB2, B2), 'sd-as-square', 'The two brackets are not the same: they have the same two terms with <b>opposite</b> signs on one of them. That is a sum times a difference, ' + SD + ' — no middle term.');
        add(P.add(P.sub(A2, AB2), B2), 'sd-as-square', 'The two brackets are not the same: they have the same two terms with <b>opposite</b> signs on one of them. That is a sum times a difference, ' + SD + ' — no middle term.');
        if (Math.abs(cof(A)) !== 1 || P.degree(A) > 1) add(P.sub(unsq(A), B2), 'coef-not-squared', notSq(A));
        if (Math.abs(cof(Bm)) !== 1 || P.degree(Bm) > 1) add(P.sub(A2, unsq(Bm)), 'coef-not-squared', notSq(Bm));
        if (cof(A) < 0) add(P.sub(P.neg(A2), B2), 'neg-square', negSq);
      }
    } else if (cl.kind === 'foil') {
      add(P.add(P.mul(cl.a[0], cl.b[0]), P.mul(cl.a[1], cl.b[1])), 'fl-only', 'You have only the <b>First</b> and <b>Last</b> products. ' + t(cl.T) + ' also needs the <b>Outer</b> and <b>Inner</b> products — together they make the middle term.');
    } else if (cl.kind === 'dist') {
      add(P.add(P.mul(cl.m, cl.terms[0]), P.add.apply(null, cl.terms.slice(1))), 'dist-first', 'Multiply ' + t(P.tex(cl.m)) + ' by <b>every</b> term in the bracket, not just the first one.');
    }
    return out;
  }

  /* everything about one signed product: its value, its wrong values, its tex */
  function termInfo(tm, first) {
    var inner = innerOf(tm), m = tm.s * tm.k, cl = classify(tm), vs = [], body = bodyTex(tm), full = (tm.k !== 1 ? tm.k : '') + body;
    innerVariants(cl).forEach(function (v) { vs.push({ p: P.scale(v.p, m), code: v.code, hint: v.hint }); });
    if (tm.f.length && tm.k !== 1) {
      var t1 = firstTerm(inner), kk = first ? m : tm.k, sg = first ? 1 : tm.s;
      if (P.count(inner) > 1) vs.push({ p: P.scale(P.add(P.scale(t1, kk), P.sub(inner, t1)), sg), code: 'k-first', hint: 'Multiply <b>every</b> term of the expansion by ' + t(kk) + ', not just the first term.' });
      vs.push({ p: P.scale(inner, tm.s), code: 'k-forgot', hint: 'Don’t forget the ' + t(kk) + ' in front of ' + t(body) + ': expand the brackets, then multiply every term by it.' });
      if (cl.kind === 'sq') {
        vs.push({ p: P.scale(inner, first ? m * m : tm.s * tm.k * tm.k), code: 'k-in-square', hint: 'Expand the square <b>first</b>, then multiply by ' + t(tm.k) + '. Putting ' + t(tm.k) + ' inside the bracket before squaring multiplies by ' + t(tm.k + '^{2}=' + tm.k * tm.k) + ' instead.' });
      } else if (tm.f.length >= 2) {
        var both = 'The ' + t(kk) + ' multiplies the product <b>once</b>. Multiplying it into both brackets multiplies by ' + t(tm.k * tm.k) + '. Expand the brackets first, then multiply every term by ' + t(kk) + '.';
        vs.push({ p: P.scale(inner, tm.s * tm.k * tm.k), code: 'k-both', hint: both });
        if (first && tm.s < 0) vs.push({ p: P.scale(inner, m * m), code: 'k-both', hint: both });
      }
    }
    if (tm.s < 0 && tm.f.length) {
      var E = P.scale(inner, tm.k);
      if (P.count(E) > 1) { var e1 = firstTerm(E); vs.push({ p: P.add(P.neg(e1), P.sub(E, e1)), code: 'minus-first', hint: 'The minus sign in front of ' + t(full) + ' changes the sign of <b>every</b> term that comes out of it, not just the first. Keep the expansion in brackets, then subtract.' }); }
      vs.push({ p: E, code: 'minus-ignored', hint: 'Check the sign in front of ' + t(full) + ': ' + (first ? 'the negative multiplies every term of the expansion.' : 'that whole product is <b>subtracted</b>.') });
    }
    return { tm: tm, first: first, inner: inner, m: m, val: P.scale(inner, m), cl: cl, vs: vs, body: body, full: full };
  }

  function sqSteps(A, Bm) {
    if (cof(Bm) < 0 && cof(A) > 0) { var nb = P.neg(Bm); return sqp(A) + '^{2}-2' + pp(A) + pp(nb) + '+' + sqp(nb) + '^{2}'; }
    return sqp(A) + '^{2}+2' + pp(A) + pp(Bm) + '+' + sqp(Bm) + '^{2}';
  }
  function steps(info) {
    var cl = info.cl;
    if (cl.kind === 'sq') return sqSteps(cl.A, cl.B);
    if (cl.kind === 'sd') return sqp(cl.A) + '^{2}-' + sqp(pos(cl.B)) + '^{2}';
    if (cl.kind === 'foil') return P.seq([P.mul(cl.a[0], cl.b[0]), P.mul(cl.a[0], cl.b[1]), P.mul(cl.a[1], cl.b[0]), P.mul(cl.a[1], cl.b[1])]);
    if (cl.kind === 'dist') return P.seq(cl.terms.map(function (x) { return P.mul(cl.m, x); }));
    return null;
  }
  /* worked solution, booklet style: expand each product (shortcut shown), the number in front, then collect */
  function solve(infos, target) {
    var lines = [];
    infos.forEach(function (I) {
      var tm = I.tm; if (!tm.f.length) return;
      var st = steps(I), cl = I.cl, inT = P.tex(I.inner), pre = '';
      if (cl.kind === 'other' && !tm.sq && tm.f.length === 1) return;
      if (cl.kind === 'sq' && cl.same) pre = 'Same binomial twice, so it is a square: ';
      else if (cl.kind === 'sq') pre = 'Square: ';
      else if (cl.kind === 'sd') pre = (cl.swapped ? 'Sum × difference (same two terms ' + t(P.tex(cl.A)) + ' and ' + t(P.tex(pos(cl.B))) + ', opposite signs on ' + t(P.tex(pos(cl.B))) + '): ' : 'Sum × difference: ');
      var inShow = (infos.length === 1 && tm.k === 1 && tm.s > 0 && cl.kind === 'sq') ? P.seq([P.pow(cl.A, 2), P.scale(P.mul(cl.A, cl.B), 2), P.pow(cl.B, 2)])
        : (infos.length === 1 && tm.k === 1 && tm.s > 0 && cl.kind === 'sd') ? P.seq([P.pow(cl.A, 2), P.neg(P.pow(cl.B, 2))]) : inT;
      var line = pre + t(I.body + '=' + (st && st !== inShow ? st + '=' : '') + inShow);
      if (tm.k !== 1) { var kk = I.first ? I.m : tm.k; line += ', so ' + t(kk + '(' + inT + ')=' + P.tex(P.scale(I.inner, kk))); }
      lines.push(line);
    });
    if (infos.length > 1) {
      var parts = infos.map(function (I, i) {
        var E = I.first ? I.val : P.scale(I.inner, I.tm.k), tx = P.tex(E);
        if (I.first) return tx;
        return (I.tm.s < 0 ? '-' : '+') + (P.count(E) > 1 || cof(E) < 0 ? '(' + tx + ')' : tx);
      });
      var flat = [];
      infos.forEach(function (I) { var E = I.first ? I.val : P.scale(I.inner, I.tm.s * I.tm.k); P.sorted(E).forEach(function (q) { flat.push(P.mono(q.c, q.v)); }); });
      lines.push('Now combine: ' + t(parts.join('')));
      var flatT = P.seq(flat);
      if (flatT !== parts.join('')) lines.push(t('=' + flatT));
      lines.push(t('=' + P.tex(target)));
    }
    return lines.join('<br>');
  }
  /* analyse an expression: target, opt.wrong list (single slips first, then the same slip everywhere), solution */
  function analyse(terms, extra) {
    var infos = terms.map(function (tm, i) { return termInfo(tm, i === 0); });
    var target = P.add.apply(null, infos.map(function (I) { return I.val; }));
    var wrongs = [], seen = [target];
    function push(p, code, hint) { if (seen.some(function (q) { return P.eq(q, p); })) return; seen.push(p); wrongs.push({ is: p, code: code, hint: hint }); }
    (extra || []).forEach(function (w) { push(P.lift(w.is), w.code, w.hint); });
    infos.forEach(function (I) { I.vs.forEach(function (v) { push(P.add(P.sub(target, I.val), v.p), v.code, v.hint); }); });
    var codes = {};
    infos.forEach(function (I, i) { var done = {}; I.vs.forEach(function (v) { if (done[v.code]) return; done[v.code] = 1; (codes[v.code] = codes[v.code] || []).push({ i: i, v: v }); }); });
    Object.keys(codes).forEach(function (c) {
      if (codes[c].length < 2) return;
      var W = target; codes[c].forEach(function (o) { W = P.add(W, P.sub(o.v.p, infos[o.i].val)); });
      push(W, c, codes[c][0].v.hint);
    });
    var vars = [];
    terms.forEach(function (tm) { tm.f.forEach(function (f) { P.vars(f.p).forEach(function (v) { if (vars.indexOf(v) < 0) vars.push(v); }); }); });
    return { target: target, wrongs: wrongs, tex: exprTex(terms), sol: solve(infos, target), vars: vars.sort(), infos: infos };
  }
  function defaultHints(terms) {
    if (terms.length === 1) {
      var cl = classify(terms[0]);
      var h0 = cl.kind === 'sq' ? 'This is the square of a binomial: ' + SQ + '. Square the first term, double the product of the two terms, square the last term.'
        : cl.kind === 'sd' ? 'Same two terms, opposite signs: ' + SD + '. The middle terms cancel.'
          : terms[0].k !== 1 ? 'Expand the brackets first (FOIL), then multiply every term by the number in front.' : 'Use FOIL: multiply the First, Outer, Inner and Last terms, then collect like terms.';
      if (terms[0].k !== 1 && cl.kind !== 'foil') h0 += ' Then multiply every term by the number in front.';
      return [h0, 'Check: put a small number such as ' + t('1') + ' in for the variable(s) in the question and in your answer — the two values must match.'];
    }
    return ['Expand <b>every</b> product completely first (use ' + SQ + ' and ' + SD + ' where they fit), keep each result in brackets, then collect like terms.',
      'A minus sign in front of a product changes the sign of <b>every</b> term that comes out of it. Check by putting ' + t('1') + ' in for the variable(s).'];
  }
  /* o: prompt, sol, hints, text, order, var, after, extra (more wrongs), before */
  function exprPart(terms, o) {
    o = o || {};
    var A = analyse(terms, o.extra);
    var opt = { wrong: A.wrongs, order: o.order, var: o.var, vars: A.vars, after: o.after, before: o.before };
    if (!o.order && terms.length === 1 && terms[0].k === 1 && terms[0].s > 0) { // key in the pattern's own order: a² ± 2ab + b², a² − b²
      var cl = A.infos[0].cl;
      if (cl.kind === 'sq') opt.keyTex = P.seq([P.pow(cl.A, 2), P.scale(P.mul(cl.A, cl.B), 2), P.pow(cl.B, 2)]);
      if (cl.kind === 'sd') opt.keyTex = P.seq([P.pow(cl.A, 2), P.neg(P.pow(cl.B, 2))]);
    }
    var p = B.poly(o.prompt || t(A.tex), A.target, opt, o.sol || A.sol, o.hints || defaultHints(terms), o.text || ('expand ' + A.tex));
    p.bad = A.wrongs.slice(0, 8).map(function (w) { return P.tex(w.is); });
    if (!o.order && P.count(A.target) > 1) p.good = [P.tex(A.target, { order: 'asc' })];
    p.target = A.target;
    return p;
  }
  /* shorthand: a whole question part that is just "expand this" */
  function ex(terms, o) { return exprPart(terms, o); }

  /* ---------------- Q6: how many of four expansions are wrong ---------------- */
  function q6(r) {
    var a = r.int(2, 9), b = r.int(2, 5), c = r.int(2, 5), d = r.int(2, 6), e = r.int(2, 9);
    var items = [
      { q: '(x+' + a + ')^{2}', right: P.add(V(1, { x: 2 }), V(2 * a, 'x'), V(a * a)), bad: [P.add(V(1, { x: 2 }), V(a * a))], why: ['the middle term ' + t(2 * a + 'x') + ' is missing'] },
      { q: '(' + b + 'x-y)(' + b + 'x-y)', right: P.add(V(b * b, { x: 2 }), V(-2 * b, { x: 1, y: 1 }), V(1, { y: 2 })), bad: [P.add(V(b * b, { x: 2 }), V(-1, { y: 2 })), P.add(V(b * b, { x: 2 }), V(-b, { x: 1, y: 1 }), V(1, { y: 2 }))], why: ['it is a square, not a sum times a difference', 'the middle term is not doubled'] },
      { q: '(' + c + 'x+y)(' + c + 'x-y)', right: P.add(V(c * c, { x: 2 }), V(-1, { y: 2 })), bad: [P.add(V(c * c, { x: 2 }), V(-2 * c, { x: 1, y: 1 }), V(-1, { y: 2 })), P.add(V(c * c, { x: 2 }), V(1, { y: 2 }))], why: ['the middle terms cancel in a sum times a difference', 'the last term should be negative'] },
      { q: '(' + d + 'x+' + e + ')^{2}', right: P.add(V(d * d, { x: 2 }), V(2 * d * e, 'x'), V(e * e)), bad: [P.add(V(d * d, { x: 2 }), V(d * e, 'x'), V(e * e)), P.add(V(d, { x: 2 }), V(2 * d * e, 'x'), V(e * e))], why: ['the middle term is not doubled', 'the coefficient ' + t(d) + ' was not squared'] }
    ];
    var n = r.pick([1, 1, 2, 2, 3, 4]), wrongIdx = r.sample([0, 1, 2, 3], n);
    items.forEach(function (it, i) { it.isBad = wrongIdx.indexOf(i) >= 0; if (it.isBad) { var j = r.int(0, it.bad.length - 1); it.shown = it.bad[j]; it.reason = it.why[j]; } else it.shown = it.right; });
    var list = items.map(function (it) { return t(it.q + '=' + P.tex(it.shown)); }).join('<br>');
    var names = ['One', 'Two', 'Three', 'Four'];
    var opts = names.map(function (nm, i) {
      var v = i + 1;
      return { html: nm, right: v === n, why: v < n ? 'More of them are wrong than that. Expand each product yourself and compare: look for a missing or undoubled middle term, a coefficient that wasn’t squared, and the sign of the last term.' : 'Fewer are wrong than that — at least one you counted as incorrect is right. Expand each one carefully with ' + SQ + ' and ' + SD + '.' };
    });
    var sol = items.map(function (it) { return t(it.q + '=' + P.tex(it.shown)) + ': ' + (it.isBad ? '<b>incorrect</b> — ' + it.reason + '. Correct: ' + t(it.q + '=' + P.tex(it.right)) + '.' : '<b>correct</b>.'); }).join('<br>') + '<br>So <b>' + names[n - 1].toLowerCase() + '</b> of the expansions ' + (n === 1 ? 'is' : 'are') + ' incorrect.';
    return B.mc(r, 'A student provides the following expansions for four binomial products.<br>' + list + '<br>How many of the student’s expansions are <i>incorrect</i>?', opts, sol,
      ['Expand each product yourself. Squares: ' + SQ + '. Sum × difference: ' + SD + '.'], 'MC: how many of four expansions are wrong (' + n + ')', true);
  }

  /* ---------------- figure: the (x+n)^2 square cut into four pieces ---------------- */
  function squareFig(n) {
    return HW.areaModel(['x', String(n)], ['x', String(n)], [['\\text{I}', '\\text{II}'], ['\\text{III}', '\\text{IV}']], { widths: [3, 2], heights: [3, 2], max: 260 });
  }
  function polyField(name, before, vars) { return { name: name, before: before, mode: 'math', keys: 'poly', vars: vars || ['x'] }; }
  function numDiag(rows) { return function (v) { for (var i = 0; i < rows.length; i++) if (Math.abs(v - rows[i][0]) < 1e-9) return { code: rows[i][1], hint: rows[i][2] }; return null; }; }

  /* ---------------- Extra 9 / 10 / 11 / 13: mental arithmetic with the patterns ---------------- */
  function sdArith(r, N, d) {
    var a = N + d, b = N - d, ans = N * N - d * d, first = r.chance(0.5);
    var shown = first ? F(a) + '\\times ' + F(b) : F(b) + '\\times ' + F(a);
    return B.fields('Write ' + t(shown) + ' as ' + t('(N+d)(N-d)') + ' with a round number ' + t('N') + ', then evaluate it as ' + t('N^{2}-d^{2}') + '.',
      [{ name: 'N', before: t('N=') }, { name: 'd', before: t('d=') }, { name: 'Product', before: t(shown + '='), wide: true }],
      [K.number(N, numDiag([[a, 'n-d', 'N is the round number in the <b>middle</b>, halfway between the two factors.'], [b, 'n-d', 'N is the round number in the <b>middle</b>, halfway between the two factors.']])),
        K.number(d, numDiag([[2 * d, 'n-d', 'd is the distance from ' + t('N') + ' to <b>each</b> factor, not the distance between the factors.']])),
        K.number(ans, numDiag([[N * N + d * d, 'sum-squares', 'It is a <b>difference</b> of squares: ' + t('N^{2}-d^{2}') + '.'], [N * N - d, 'no-square-d', 'Square ' + t('d') + ' too: subtract ' + t('d^{2}') + '.'], [N * N, 'no-square-d', 'Don’t forget to subtract ' + t('d^{2}') + '.']]))],
      [String(N), String(d), String(ans)], t('(' + F(N) + '+' + d + ')(' + F(N) + '-' + d + ')=' + F(N * N) + '-' + d * d + '=' + F(ans)),
      t(shown + '=(' + F(N) + '+' + d + ')(' + F(N) + '-' + d + ')') + '<br>' + t('=' + F(N) + '^{2}-' + d + '^{2}=' + F(N * N) + '-' + F(d * d) + '=' + F(ans)),
      ['Find the number exactly halfway between the two factors: that is ' + t('N') + '. Each factor is ' + t('d') + ' away from it.'], 'difference of squares: ' + a + '×' + b);
  }
  function sqArith(N, d, dec) {
    // value (N + d)^2 where d may be negative; dec: number of decimals in d
    var f = Math.pow(10, dec || 0), Ni = Math.round(N * f), di = Math.round(d * f), ans = (Ni + di) * (Ni + di) / (f * f);
    var num = (Ni + di) / f, Nt = String(N), dt = String(Math.abs(d)), sgn = d < 0 ? '-' : '+';
    var N2 = N * N, mid = Math.round(2 * Ni * Math.abs(di)) / (f * f), d2 = di * di / (f * f);
    var rows = [[N2 + d2, 'mid-missing', 'You left out the middle piece ' + t('2Nd') + ': ' + t('(N\\pm d)^{2}') + ' is not ' + t('N^{2}+d^{2}') + '.'],
      [d < 0 ? N2 - mid / 2 + d2 : N2 + mid / 2 + d2, 'mid-not-doubled', 'The middle piece is ' + t('2Nd') + ' — don’t forget the ' + t('2') + '.'],
      [d < 0 ? N2 + mid + d2 : N2 - mid + d2, 'mid-sign', 'Check the sign of the middle piece: it is ' + t((d < 0 ? '-' : '+') + '2Nd') + ' here.'],
      [d < 0 ? N2 - mid - d2 : N2 + mid - d2, 'sq-last-neg', 'The last piece is ' + t('d^{2}') + ', which is always added.']];
    var round = function (x) { return Math.round(x * 1e6) / 1e6; };
    rows = rows.map(function (q) { return [round(q[0]), q[1], q[2]]; });
    var Ft = function (x) { return dec ? String(round(x)) : F(round(x)); };
    return B.number('Evaluate ' + t(Ft(num) + '^{2}') + ' without a calculator: write it as ' + t('N\\pm d') + ' with ' + t('N') + ' round, then use ' + t('(N\\pm d)^{2}=N^{2}\\pm 2Nd+d^{2}') + '.', round(ans), numDiag(rows),
      t(Ft(num) + '=' + Nt + sgn + dt) + '<br>' + t('(' + Nt + sgn + dt + ')^{2}=' + Nt + '^{2}' + sgn + '2(' + Nt + ')(' + dt + ')+' + dt + '^{2}') + '<br>' + t('=' + Ft(N2) + sgn + Ft(mid) + '+' + Ft(d2) + '=' + Ft(ans)),
      ['Write the three pieces ' + t('N^{2}') + ', ' + t('2Nd') + ' and ' + t('d^{2}') + ' first, then add (or subtract the middle one).'], 'square by pattern: ' + num + '^2');
  }

  /* ================================================================================================ */
  HW.defineLesson({
    id: 'u3l3', unit: 3, num: '3', title: 'Multiplying Polynomials I: Special Products', outcome: 'AN4',
    blurb: 'Squaring a binomial and multiplying a sum by a difference — the two shortcuts, a number out front, and expressions that add or subtract several products.',
    questions: [
      { num: '1', section: 'Squares of binomials and sum × difference', stem: 'Expand and simplify where possible.', parts: [
        { id: '1a', level: 'BEG', make: function (r) { var n = r.int(2, 12); return ex([T(1, 1, [bin(X, V(-n))], true)]); } },
        { id: '1b', level: 'BEG', make: function (r) { var n = r.int(4, 15); return ex([T(1, 1, [bin(X, V(-n)), bin(X, V(n))])]); } },
        { id: '1c', level: 'EMG', make: function (r) { var p = r.int(2, 9); return ex([T(1, 1, [bin(V(p, 'x'), V(-1, 'y'))], true)]); } },
        { id: '1d', level: 'PRG', make: function (r) { var pq = two(r, 2, 7); return ex([T(1, 1, [bin(V(pq[0], 'x'), V(pq[1], 'y'))], true)]); } },
        { id: '1e', level: 'EMG', make: function (r) { var pq = two(r, 2, 9); return ex([T(1, 1, [bin(V(pq[0], 'x'), V(-pq[1])), bin(V(pq[0], 'x'), V(pq[1]))])]); } },
        { id: '1f', level: 'PRG', make: function (r) { var p = r.int(2, 6), q = r.int(1, 7); return ex([T(1, 1, [bin(V(-p, 'y'), V(q))], true)]); } },
        { id: '1g', level: 'EMG', make: function (r) { var p = r.int(2, 9), q = r.int(2, 9); return ex([T(1, 1, [bin(V(p, 'p'), V(q))], true)]); } },
        { id: '1h', level: 'EMG', make: function (r) { var pq = two(r, 2, 9); return ex([T(1, 1, [bin(V(pq[0], 'm'), V(pq[1], 'n')), bin(V(pq[0], 'm'), V(-pq[1], 'n'))])]); } },
        { id: '1i', level: 'PRG', make: function (r) { var pq = two(r, 2, 9); return ex([T(1, 1, [bin(V(pq[0], 'a'), V(-pq[1], 'b'))], true)]); } },
        { id: '1j', level: 'EMG', make: function (r) { var p = r.int(2, 12), q = r.int(2, 9); return ex([T(1, 1, [bin(V(p), V(-q, { x: 2 })), bin(V(p), V(q, { x: 2 }))])]); } },
        { id: '1k', level: 'PRG', make: function (r) { var pq = two(r, 2, 9), f = bin(V(pq[0], 'a'), V(-pq[1], 'b')); return ex([T(1, 1, [f, f])]); } },
        { id: '1l', level: 'EMG', make: function (r) { var p = r.int(2, 6), q = r.int(2, 9), e = r.pick([2, 3, 3, 4]), A = V(p, { a: e }); return ex([T(1, 1, [bin(A, V(-q)), bin(A, V(q))])]); } }] },

      { num: '2', section: 'A number out front', stem: 'Expand and simplify where possible.', parts: [
        { id: '2a', level: 'PRG', make: function (r) { return ex([T(1, r.int(2, 5), [bin(V(r.int(2, 4), 'x'), V(-r.int(1, 7))), bin(V(r.int(2, 5), 'x'), V(-r.int(1, 5)))])]); } },
        { id: '2b', level: 'PRG', make: function (r) { var a, b, c, d; do { a = r.int(2, 5); b = r.int(1, 5); c = r.int(2, 6); d = r.int(1, 5); } while (a * d - b * c === 0 || a === c); return ex([T(1, r.int(2, 5), [bin(V(a, 'x'), V(-b)), bin(V(c, 'x'), V(d))])]); } },
        { id: '2c', level: 'PRG', make: function (r) { return ex([T(-1, r.int(2, 5), [bin(V(1, 'a'), V(r.int(2, 9))), bin(V(r.int(2, 4), 'a'), V(r.int(1, 9)))])]); } },
        { id: '2d', level: 'PRG', make: function (r) { return ex([T(1, r.int(2, 5), [bin(V(r.int(2, 6), 'x'), V(r.int(1, 7)))], true)]); } },
        { id: '2e', level: 'PRG', make: function (r) { var c = r.int(2, 6), k = r.int(2, 3), p = r.int(2, 5), q = r.int(1, 4); return ex([T(1, c, [bin(V(k * p, 'x'), V(-k * q, 'y')), bin(V(p, 'x'), V(q, 'y'))])]); } },
        { id: '2f', level: 'PRG', make: function (r) { var p, q, s; do { p = r.int(2, 5); q = r.int(2, 4); s = r.int(1, 5); } while (p * q - s === 0); return ex([T(-1, r.int(2, 6), [bin(V(1, 'a'), V(p, 'b')), bin(V(q, 'a'), V(-s, 'b'))])]); } }] },

      { num: '3', section: 'Adding and subtracting products', stem: 'Expand and simplify where possible.', parts: [
        { id: '3a', level: 'EMG', make: function (r) { var a, b, c, d; do { a = r.int(2, 9); b = r.int(2, 9); c = r.int(2, 9); d = r.int(2, 9); } while (c + d === a + b || a === b || c === d); return ex([T(1, 1, [bin(X, V(-a)), bin(X, V(-b))]), T(1, 1, [bin(X, V(c)), bin(X, V(d))])]); } },
        { id: '3b', level: 'PRG', make: function (r) { var a, b, c, d; do { a = r.int(2, 9); b = r.int(2, 9); c = r.int(2, 9); d = r.int(2, 9); } while (b - a - c + d === 0 || c * d === a * b || a === b || c === d); return ex([T(1, 1, [bin(X, V(-a)), bin(X, V(b))]), T(-1, 1, [bin(X, V(c)), bin(X, V(-d))])]); } },
        { id: '3c', level: 'EMG', make: function (r) { var n = r.int(2, 9); return ex([T(1, 1, [bin(X, V(-n))], true), T(1, 1, [bin(X, V(n))], true)]); } },
        { id: '3d', level: 'PRG', make: function (r) { var a = r.pick([1, 1, 2, 3]), b; do { b = r.int(2, 7); } while (b === a); return ex([T(1, 1, [bin(X, V(-a, 'y')), bin(X, V(-b, 'y'))]), T(-1, 1, [bin(X, V(a, 'y')), bin(X, V(-a, 'y'))])]); } }] },

      { num: '4', stem: 'Expand and simplify where possible.', parts: [
        { id: '4a', level: 'PRG', make: function (r) { var p, u, q, rr, s; do { p = r.int(2, 4); u = r.int(1, 3); q = r.int(2, 6); rr = r.int(2, 5); s = r.int(2, 5); } while (p === rr || p * q + u === rr * s); return ex([T(1, 1, [bin(V(p, 'x'), V(-u)), bin(X, V(-q))]), T(-1, 1, [mono(V(rr, 'x')), bin(X, V(-s))])]); } },
        { id: '4b', level: 'PRG', make: function (r) { var ac = two(r, 2, 4), a = ac[0], c = ac[1], b, d, f, h; do { b = r.int(1, 6); d = r.int(1, 6); f = r.int(1, 6); h = r.int(1, 6); } while (b * d === f * h); return ex([T(1, 1, [bin(V(a, 'x'), V(b)), bin(V(c, 'x'), V(d))]), T(-1, 1, [bin(V(c, 'x'), V(-f)), bin(V(a, 'x'), V(-h))])]); } },
        { id: '4c', level: 'PRG', make: function (r) { var a, b, c, d, e; do { a = r.int(3, 8); b = r.int(1, 3); c = r.int(2, 5); d = r.int(2, 3); e = r.int(1, 4); } while (a === d * d || b * c + e * e === 0); return ex([T(1, 1, [bin(V(a, 'x'), V(-b)), bin(X, V(-c))]), T(-1, 1, [bin(V(d, 'x'), V(e)), bin(V(d, 'x'), V(-e))])]); } },
        { id: '4d', level: 'PRG', make: function (r) { var k1, a, b, c, d, k2, e; do { k1 = r.int(2, 6); a = r.int(2, 5); b = r.int(1, 3); c = r.int(2, 5); d = r.int(2, 5); k2 = r.int(2, 3); e = r.int(1, 4); } while (k1 * (a * d - b * c) - 2 * k2 * e === 0 || k1 * a * c === k2 * e * e || a * d === b * c);
          return ex([T(1, k1, [bin(V(a), V(-b, 'x')), bin(V(c), V(d, 'x'))]), T(-1, k2, [bin(V(e), X)], true)]); } },
        { id: '4e', level: 'PRG', make: function (r) { var a, b, c, k1, k2, d, e; do { a = r.int(2, 4); b = r.int(1, 5); c = r.int(1, 5); k1 = r.int(2, 4); k2 = r.int(2, 3); d = r.int(1, 6); e = r.int(1, 6); } while (b === c || d === e || k1 * a * (c - b) + k2 * (d + e) === 0 || -k1 * b * c + k2 * d * e === 0);
          return ex([T(1, k1, [bin(V(a, 'x'), V(-b)), bin(V(a, 'x'), V(c))]), T(1, k2, [bin(X, V(d)), bin(X, V(e))])]); } },
        { id: '4f', level: 'PRG', make: function (r) { var k, a, b, c, d, e, tg; for (var g = 0; g < 200; g++) { k = r.int(2, 3); a = r.int(2, 4); b = r.int(1, 3); c = r.int(2, 5); d = r.int(2, 6); e = r.int(2, 8);
            tg = [k * a * a - c * d, 2 * k * a * b - (c * e - d), k * b * b + e]; if (tg[0] && tg[1] && tg[2]) break; }
          return ex([T(1, k, [bin(V(a, 'p'), V(b, 'q'))], true), T(-1, 1, [bin(V(c, 'p'), V(-1, 'q')), bin(V(d, 'p'), V(e, 'q'))])]); } }] },

      { num: '5', stem: 'Expand and simplify where possible.', parts: [
        { id: '5a', level: 'EMG', make: function (r) { var ab = two(r, 2, 9); return ex([T(1, 1, [bin(X, V(ab[0]))], true), T(1, 1, [bin(X, V(ab[1]))], true)]); } },
        { id: '5b', level: 'PRG', make: function (r) { var p, q, rr; do { p = r.int(2, 5); q = r.int(2, 4); rr = r.int(2, 5); } while (p === q || rr === 1); return ex([T(1, 1, [bin(V(p, 'a'), V(-1, 'b'))], true), T(-1, 1, [bin(V(q, 'a'), V(rr, 'b'))], true)]); } },
        { id: '5c', level: 'PRG', make: function (r) { var k1, a, k2, b; do { k1 = r.int(2, 5); a = r.int(2, 4); k2 = r.int(2, 4); b = r.int(2, 3); } while (k1 === k2 * b * b || k1 * a === k2 * b); return ex([T(1, k1, [bin(V(1, 'y'), V(-a))], true), T(-1, k2, [bin(V(b, 'y'), V(-1))], true)]); } },
        { id: '5d', level: 'PRG', make: function (r) { var C, k, a, b, p, c, d; do { C = r.int(2, 9); k = r.int(2, 4); a = r.int(1, 5); b = r.int(2, 6); p = r.int(2, 3); c = r.int(1, 5); d = r.int(2, 6); } while (p === k || a === b || -k * (b - a) - (p * d + c) === 0);
          return ex([T(1, C, []), T(-1, k, [bin(X, V(-a)), bin(X, V(b))]), T(1, 1, [bin(V(p, 'x'), V(-c)), bin(X, V(-d))])]); } },
        { id: '5e', level: 'PRG', make: function (r) { var k, p, q, a, b; do { k = r.int(2, 5); p = r.int(2, 3); q = r.int(2, 5); a = r.int(1, 5); b = r.int(2, 6); } while (a === b || k * (p * q - 1) + 2 * (a + b) === 0);
          return ex([T(1, k, [bin(V(1), V(p, 'y')), bin(V(q), V(-1, 'y'))]), T(-1, 1, [bin(V(2, 'y'), V(-a)), bin(V(2, 'y'), V(-b))])]); } }] },

      { num: '6', section: 'Checking and using the patterns', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '6', level: 'EMG', make: function (r) { return q6(r); } }] },

      { num: '7', stem: function (sh) { return 'A square patio has side length ' + t('x') + ' m. Each side length of the patio is increased by ' + t(sh.n) + ' m.'; },
        shared: function (r) { return { n: r.int(2, 6), s: r.int(4, 9) }; },
        parts: [
          { id: '7a', level: 'BEG', make: function (r, sh) { var n = sh.n;
            return ex([T(1, 1, [bin(X, V(n))], true)], { prompt: 'Write and simplify an expression for the area of the new patio.', after: t('\\text{ m}^{2}'),
              extra: [{ is: P.add(V(1, { x: 2 }), V(n)), code: 'sq-no-middle', hint: 'The new side is ' + t('(x+' + n + ')') + ' m, so the area is ' + t('(x+' + n + ')^{2}') + '. Use ' + SQ + '.' }, { is: P.add(V(4, 'x'), V(4 * n)), code: 'perimeter', hint: 'That is the perimeter. Area of a square = side × side.' }],
              sol: 'New side ' + t('=(x+' + n + ')') + ' m.<br>' + t('(x+' + n + ')^{2}=x^{2}+2(x)(' + n + ')+' + n + '^{2}=x^{2}+' + 2 * n + 'x+' + n * n) + ' m²', text: 'patio new area (x+' + n + ')^2' }); } },
          { id: '7b', level: 'EMG', make: function (r, sh) { var n = sh.n, T2 = P.add(V(2 * n, 'x'), V(n * n));
            var p = B.poly('Write and simplify an expression for the <i>increase</i> in area.', T2, { vars: ['x'], after: t('\\text{ m}^{2}'), wrong: [
              { is: P.add(V(1, { x: 2 }), V(2 * n, 'x'), V(n * n)), code: 'not-subtracted', hint: 'That is the new area. The <b>increase</b> is the new area minus the old area, ' + t('x^{2}') + '.' },
              { is: V(n * n), code: 'corner-only', hint: 'The new patio gains two ' + t(n + '\\times x') + ' strips along the sides as well as the ' + t(n + '\\times ' + n) + ' corner.' },
              { is: V(2 * n, 'x'), code: 'no-corner', hint: 'Don’t forget the ' + t(n + '\\times ' + n) + ' corner square: it is part of the increase too.' },
              { is: P.add(V(n, 'x'), V(n * n)), code: 'one-strip', hint: 'There are <b>two</b> strips of area ' + t(n + 'x') + ' — the middle term of ' + t('(x+' + n + ')^{2}') + ' is doubled.' },
              { is: P.add(V(1, { x: 2 }), V(n * n)), code: 'sq-no-middle', hint: 'Subtract the old area ' + t('x^{2}') + ' from the new area ' + t('(x+' + n + ')^{2}') + ' — and remember the square has a middle term.' }] },
              'Increase ' + t('=') + ' new area ' + t('-') + ' old area<br>' + t('=(x^{2}+' + 2 * n + 'x+' + n * n + ')-x^{2}') + '<br>' + t('=' + 2 * n + 'x+' + n * n) + ' m²',
              ['Increase = new area − old area. The old patio had area ' + t('x^{2}') + '.'], 'patio increase in area');
            p.bad = [P.tex(V(n * n)), P.tex(V(2 * n, 'x')), 'x^{2}+' + 2 * n + 'x+' + n * n]; return p; } },
          { id: '7c', level: 'BEG', make: function (r, sh) { var n = sh.n, s = sh.s, ans = 2 * n * s + n * n;
            return B.number('Check your answer to (b) for a patio that was ' + t(s) + ' m by ' + t(s) + ' m: by how many square metres does the area increase?', ans,
              numDiag([[(s + n) * (s + n), 'new-area', 'That is the area of the new patio. Subtract the old area, ' + t(s + '\\times ' + s + '=' + s * s) + '.'], [2 * n * s, 'no-corner', 'Don’t forget the corner square, ' + t(n + '\\times ' + n) + '.'], [n * n, 'corner-only', 'The increase includes the two strips along the sides, not just the corner.']]),
              'New patio: ' + t((s + n) + '\\times ' + (s + n) + '=' + (s + n) * (s + n)) + ' m², old: ' + t(s * s) + ' m², increase ' + t((s + n) * (s + n) + '-' + s * s + '=' + ans) + ' m².<br>Check with (b): ' + t(2 * n + '(' + s + ')+' + n * n + '=' + ans) + ' ✓',
              ['Work out the new area and the old area, then subtract — or substitute ' + t('x=' + s) + ' into your answer to (b).'], 'patio increase at x=' + s, { after: t('\\text{ m}^{2}') }); } }] },

      { num: '8', stem: function (sh) { return 'Use substitution to check two expansions of ' + t('(' + sh.a + 'x-' + sh.b + ')^{2}') + '.'; },
        shared: function (r) { var a, b, c; do { a = r.int(2, 5); b = r.int(1, 7); c = r.int(2, 3); } while (a * c - b === 0 || Math.abs(a * c - b) > 6); return { a: a, b: b, c: c }; },
        parts: [
          { id: '8a', level: 'BEG', make: function (r, sh) { var a = sh.a, b = sh.b, c = sh.c, L = (a * c - b) * (a * c - b), rhs = a * a + 'x^{2}-' + 2 * a * b + 'x+' + b * b;
            return B.fields('Verify that ' + t('(' + a + 'x-' + b + ')^{2}=' + rhs) + ' by substituting ' + t('x=' + c) + ' into both sides.',
              [{ name: 'Left side', label: 'Left side', before: t('(' + a + 'x-' + b + ')^{2}=') }, { name: 'Right side', label: 'Right side', before: t(rhs + '=') }],
              [K.number(L, numDiag([[a * c - b, 'not-sq', 'Square the bracket after you work out the inside.'], [a * c * a * c - b * b, 'sum-squares', 'Work out the bracket first: ' + t(a + '(' + c + ')-' + b + '=' + (a * c - b)) + ', then square it.']])),
                K.number(L, numDiag([[a * a * c * c + 2 * a * b * c + b * b, 'sign', 'The middle term is ' + t('-' + 2 * a * b + 'x') + ': subtract it.'], [a * a * c + b * b - 2 * a * b * c, 'not-sq', t('x^{2}') + ' means ' + t(c + '^{2}=' + c * c) + '.']]))],
              [String(L), String(L)], 'both sides ' + t('=' + L),
              'LS ' + t('=(' + a + '(' + c + ')-' + b + ')^{2}=' + (a * c - b < 0 ? '(' + (a * c - b) + ')' : a * c - b) + '^{2}=' + L) + '<br>RS ' + t('=' + a * a + '(' + c * c + ')-' + 2 * a * b + '(' + c + ')+' + b * b + '=' + a * a * c * c + '-' + 2 * a * b * c + '+' + b * b + '=' + L) + '<br>LS = RS, so the expansion checks. ✓',
              ['Replace every ' + t('x') + ' with ' + t(c) + '. On the left, work out the bracket first, then square.'], 'verify expansion at x=' + c); } },
          { id: '8b1', sub: 'b i', level: 'BEG', make: function (r, sh) { var a = sh.a, b = sh.b, c = sh.c, J = a * a * c * c + b * b, L = (a * c - b) * (a * c - b);
            return B.number('Jen says ' + t('(' + a + 'x-' + b + ')^{2}=' + a * a + 'x^{2}+' + b * b) + '. What is the value of Jen’s right side when ' + t('x=' + c) + '?', J,
              numDiag([[L, 'lhs-value', 'That is the value of the left side, ' + t('(' + a + 'x-' + b + ')^{2}') + '. Evaluate Jen’s expression ' + t(a * a + 'x^{2}+' + b * b) + '.'], [a * a * c + b * b, 'not-sq', t('x^{2}') + ' means ' + t(c + '^{2}=' + c * c) + '.']]),
              t(a * a + '(' + c + ')^{2}+' + b * b + '=' + a * a * c * c + '+' + b * b + '=' + J) + ', but ' + t('(' + a + '(' + c + ')-' + b + ')^{2}=' + L) + '. Since ' + t(J + '\\neq ' + L) + ', Jen is wrong.',
              ['Substitute ' + t('x=' + c) + ' into ' + t(a * a + 'x^{2}+' + b * b) + '.'], 'Jen value at x=' + c); } },
          { id: '8b2', sub: 'b ii', level: 'EMG', make: function (r, sh) { var a = sh.a, b = sh.b;
            return B.mc(r, 'Which explains Jen’s error in ' + t('(' + a + 'x-' + b + ')^{2}=' + a * a + 'x^{2}+' + b * b) + '?', [
              { html: 'She left out the middle term ' + t('2(' + a + 'x)(-' + b + ')=-' + 2 * a * b + 'x') + ': she squared each term separately.', right: true },
              { html: 'She should have subtracted: the answer is ' + t(a * a + 'x^{2}-' + b * b) + '.', why: 'That is ' + t('(' + a + 'x-' + b + ')(' + a + 'x+' + b + ')') + ', a sum times a difference. A <b>square</b> has a middle term.' },
              { html: 'She squared the coefficient by mistake: it should be ' + t(a + 'x^{2}+' + b * b) + '.', why: t('(' + a + 'x)^{2}=' + a * a + 'x^{2}') + ' — she got that part right.' },
              { html: 'The last term should be ' + t('-' + b * b) + '.', why: t('(-' + b + ')^{2}=+' + b * b) + ' — a square is never negative, so her last term is right.' }],
              t('(' + a + 'x-' + b + ')^{2}=' + a * a + 'x^{2}-' + 2 * a * b + 'x+' + b * b) + '. Jen squared each term and left out the middle term ' + t('2(' + a + 'x)(-' + b + ')=-' + 2 * a * b + 'x') + '.',
              ['Expand ' + t('(' + a + 'x-' + b + ')^{2}') + ' correctly and compare it with Jen’s answer.'], 'Jen’s error: missing middle term'); } }] },

      { num: '9', stem: '<i>(Extension)</i> <i>(Numerical Response)</i>', parts: [
        { id: '9', level: 'ADV', make: function (r) { var a = r.int(3, 9), b = r.int(1, 9), c = a * a + b;
          return B.nr('Given that, for every value of ' + t('x') + ', ' + t('x^{2}-' + 2 * a + 'x+' + c + '=(x-a)^{2}+b') + ', then the value of ' + t('b') + ' must be ____.', b,
            numDiag([[c, 'forgot-a2', 'Expand ' + t('(x-a)^{2}+b=x^{2}-2ax+a^{2}+b') + ': the constant ' + t(c) + ' has to equal ' + t('a^{2}+b') + '.'], [a, 'gave-a', 'That is ' + t('a') + '. The question asks for ' + t('b') + '.'], [c + a * a, 'sign', 'Check: ' + t('a^{2}+b=' + c) + ', so subtract ' + t('a^{2}') + '.'], [2 * a, 'gave-a', 'Match the ' + t('x') + ' terms: ' + t('-2a=-' + 2 * a) + ', so ' + t('a=' + a) + '. Then use the constants.']]),
            'Expand the form: ' + t('(x-a)^{2}+b=x^{2}-2ax+(a^{2}+b)') + '.<br>Match the ' + t('x') + ' terms: ' + t('-2a=-' + 2 * a) + ', so ' + t('a=' + a) + '.<br>Match the constants: ' + t('a^{2}+b=' + c) + ', so ' + t(a * a + '+b=' + c) + ' and ' + t('b=' + b) + '.<br>Check: ' + t('(x-' + a + ')^{2}+' + b + '=x^{2}-' + 2 * a + 'x+' + a * a + '+' + b + '=x^{2}-' + 2 * a + 'x+' + c) + ' ✓',
            ['Expand ' + t('(x-a)^{2}+b') + ' and match it term by term with ' + t('x^{2}-' + 2 * a + 'x+' + c) + '.', 'The ' + t('x') + ' terms give ' + t('a') + '; the constant terms then give ' + t('b') + '.'], 'NR: completing the square, b'); } }] }
    ],

    extra: [
      { num: '1', section: 'Extra practice A — Both patterns, pushed further', stem: 'Square each binomial using ' + SQ + '. Square the <b>whole</b> term, coefficient and exponent together. Write every answer in descending order.', parts: [
        { id: 'e1a', level: 'PRG', make: function (r) { var p = r.int(2, 5), q = r.int(2, 7); return ex([T(1, 1, [bin(V(p, { x: 2 }), V(-q, 'y'))], true)], { order: 'desc', var: 'x' }); } },
        { id: 'e1b', level: 'PRG', make: function (r) { var p = r.int(2, 7), q = r.int(2, 5); return ex([T(1, 1, [bin(V(p, { a: 3 }), V(q, { b: 2 }))], true)], { order: 'desc', var: 'a' }); } },
        { id: 'e1c', level: 'PRG', make: function (r) { var p = r.int(2, 5), q = r.int(2, 9); return ex([T(1, 1, [bin(V(p, { m: 2 }), V(q, { n: 3 }))], true)], { order: 'desc', var: 'm' }); } },
        { id: 'e1d', level: 'EMG', make: function (r) { var e = r.int(3, 5), n = r.int(2, 12); return ex([T(1, 1, [bin(V(1, { x: e }), V(-n))], true)], { order: 'desc', var: 'x' }); } },
        { id: 'e1e', level: 'PRG', make: function (r) { var p = r.int(2, 5), q = r.int(2, 6); return ex([T(1, 1, [bin(V(-p, 'p'), V(-q, { q: 2 }))], true)], { order: 'desc', var: 'p' }); } },
        { id: 'e1f', level: 'PRG', make: function (r) { var d = r.int(2, 4), n = d * r.int(1, 4); if (n === d) n = d * 3; return ex([T(1, 1, [bin(V([1, d], 'x'), V(-n))], true)], { order: 'desc', var: 'x' }); } }] },
      { num: '2', stem: 'Each of these is a sum times a difference of the <i>same</i> two terms, so only ' + t('a^{2}-b^{2}') + ' survives. Identify ' + t('a') + ' and ' + t('b') + ' first, then square each.', parts: [
        { id: 'e2a', level: 'EMG', make: function (r) { var p = r.int(2, 5), q = r.int(2, 9), e = r.int(2, 4), A = V(p, { x: e }); return ex([T(1, 1, [bin(A, V(-q, 'y')), bin(A, V(q, 'y'))])]); } },
        { id: 'e2b', level: 'EMG', make: function (r) { var p = r.int(2, 9), q = r.int(2, 5), e = r.int(2, 3), f = r.int(3, 5), A = V(p, { a: e }), Bq = V(q, { b: f }); return ex([T(1, 1, [bin(A, Bq), bin(A, P.neg(Bq))])]); } },
        { id: 'e2c', level: 'EMG', make: function (r) { var c = r.int(5, 12), p = r.int(2, 5), e = r.int(2, 4), M = V(p, { m: e }); return ex([T(1, 1, [bin(V(c), P.neg(M)), bin(V(c), M)])]); } },
        { id: 'e2d', level: 'EMG', make: function (r) { var den = r.int(2, 5), nu = r.pick([1, 2, 3, 4].filter(function (x) { return x < den && HW.ex.gcd(x, den) === 1; })), c = r.int(2, 9), A = V([nu, den], 'k'); return ex([T(1, 1, [bin(A, V(c)), bin(A, V(-c))])]); } },
        { id: 'e2e', level: 'EMG', make: function (r) { var p = r.int(2, 9), q = r.int(2, 9), A = V(-p, 'c'), Bq = V(q, { d: 2 }); return ex([T(1, 1, [bin(A, Bq), bin(A, P.neg(Bq))])]); } },
        { id: 'e2f', level: 'EMG', make: function (r) { var q = r.int(2, 12), A = V(1, { x: 2, y: 1 }); return ex([T(1, 1, [bin(A, V(-q)), bin(A, V(q))])]); } }] },
      { num: '3', stem: function (sh) { return '<b>Decide before you expand.</b> Each product is a <b>square</b>, a <b>sum × difference</b>, or <b>neither</b>. (Two are disguised: the terms are not in the order you expect.)'; },
        shared: function (r) {
          var pq = two(r, 2, 9), cd = two(r, 2, 9), e = r.int(2, 6), fg = two(r, 1, 5);
          while (pq[0] > 6) pq = two(r, 2, 9);
          var A = V(pq[0], 'x'), Bq = V(pq[1]), C = V(cd[0], 'm'), D = V(cd[1], 'n');
          var list = [
            [T(1, 1, [bin(A, P.neg(Bq)), bin(A, Bq)])], [T(1, 1, [bin(A, P.neg(Bq)), bin(A, P.neg(Bq))])], [T(1, 1, [bin(A, P.neg(Bq)), bin(V(pq[1], 'x'), V(pq[0]))])],
            [T(1, 1, [bin(C, D), bin(C, P.neg(D))])], [T(1, 1, [bin(C, D), bin(D, P.neg(C))])], [T(1, 1, [bin(V(e, 'p'), V(-fg[0])), bin(V(e, 'p'), V(fg[1]))])]];
          return { list: list, kinds: ['sd', 'sq', 'neither', 'sd', 'sd', 'neither'] };
        },
        parts: [
          { id: 'e3', sub: 'decide', level: 'EMG', make: function (r, sh) {
            var cols = [{ id: 'sq', html: 'square' }, { id: 'sd', html: 'sum ×<br>diff.' }, { id: 'neither', html: 'neither' }], want = {};
            var rows = sh.list.map(function (terms, i) { var id = String.fromCharCode(97 + i); want[id] = sh.kinds[i]; var pcs = exprTex(terms).split(')('); return { id: id, html: '(' + id + ') ' + pcs.map(function (x, k) { return t((k ? '(' : '') + x + (k < pcs.length - 1 ? ')' : '')); }).join('<wbr>') }; });
            var sol = sh.list.map(function (terms, i) { var cl = classify(terms[0]), id = String.fromCharCode(97 + i);
              return '(' + id + ') ' + t(exprTex(terms)) + ': ' + (cl.kind === 'sq' ? '<b>square</b> — the same binomial twice' : cl.kind === 'sd' ? '<b>sum × difference</b> — same two terms, opposite signs' + (cl.swapped ? ' (reorder a bracket to see it)' : '') : '<b>neither</b> — the two brackets do not have the same two terms'); }).join('<br>');
            return B.grid('For each product, choose the pattern.', rows, cols, want, { why: function (row, got, w) {
              var tx = t(exprTex(sh.list[row.charCodeAt(0) - 97]));
              if (w === 'neither') return { code: 'row', hint: 'Look at ' + tx + ' again: the two brackets don’t contain the same two terms (the numbers are swapped or different), so no shortcut applies.' };
              if (w === 'sq') return { code: 'row', hint: tx + ' is the same binomial twice — that is a square.' };
              return { code: 'row', hint: tx + ': the brackets have the same two terms, with opposite signs on one of them' + (row === 'e' ? ' (reorder one bracket to see it)' : '') + '. That is a sum × difference.' };
            } }, sol, ['A square is one binomial times itself. A sum × difference has the same two terms with opposite signs on one of them. Anything else is neither.'], 'classify six products'); } },
          { id: 'e3a', sub: 'a', level: 'EMG', make: function (r, sh) { return ex(sh.list[0]); } },
          { id: 'e3b', sub: 'b', level: 'EMG', make: function (r, sh) { return ex(sh.list[1]); } },
          { id: 'e3c', sub: 'c', level: 'PRG', make: function (r, sh) { return ex(sh.list[2]); } },
          { id: 'e3d', sub: 'd', level: 'EMG', make: function (r, sh) { return ex(sh.list[3]); } },
          { id: 'e3e', sub: 'e', level: 'PRG', make: function (r, sh) { return ex(sh.list[4]); } },
          { id: 'e3f', sub: 'f', level: 'EMG', make: function (r, sh) { return ex(sh.list[5]); } }] },

      { num: '4', section: 'Extra practice B — Where the middle term comes from', stem: function (sh) { return 'The square below has side length ' + t('x+' + sh.n) + ', cut into four pieces.' + squareFig(sh.n); },
        shared: function (r) { return { n: r.int(3, 9), xv: r.int(2, 5) }; },
        parts: [
          { id: 'e4a', level: 'BEG', make: function (r, sh) { var n = sh.n, x2 = V(1, { x: 2 }), nx = V(n, 'x'), n2 = V(n * n), tot = P.add(x2, V(2 * n, 'x'), n2);
            var pc = function (want, other) { return K.poly(want, { wrong: [{ is: other, code: 'piece', hint: 'Area of a rectangle = width × height: read the two side lengths of that piece.' }] }); };
            return B.fields('Write the area of each piece, then add them to give the expanded form of ' + t('(x+' + n + ')^{2}') + '.',
              [polyField('I', t('\\text{I}=')), polyField('II', t('\\text{II}=')), polyField('III', t('\\text{III}=')), polyField('IV', t('\\text{IV}=')), polyField('Total', t('(x+' + n + ')^{2}='))],
              [pc(x2, V(2, 'x')), pc(nx, V(n + 1, 'x')), pc(nx, V(n + 1, 'x')), pc(n2, V(2 * n)), K.poly(tot, { wrong: [{ is: P.add(x2, nx, n2), code: 'sq-not-doubled', hint: 'There are <b>two</b> rectangles of area ' + t(n + 'x') + ' (II and III).' }, { is: P.add(x2, n2), code: 'sq-no-middle', hint: 'Add <b>all four</b> pieces, including the two rectangles.' }] })],
              ['x^{2}', n + 'x', n + 'x', String(n * n), P.tex(tot)], t('\\text{I}=x^{2},\\ \\text{II}=' + n + 'x,\\ \\text{III}=' + n + 'x,\\ \\text{IV}=' + n * n) + '; ' + t('(x+' + n + ')^{2}=' + P.tex(tot)),
              'I ' + t('=x\\cdot x=x^{2}') + ', II ' + t('=' + n + '\\cdot x=' + n + 'x') + ', III ' + t('=x\\cdot ' + n + '=' + n + 'x') + ', IV ' + t('=' + n + '\\cdot ' + n + '=' + n * n) + '.<br>Total: ' + t('x^{2}+' + n + 'x+' + n + 'x+' + n * n + '=' + P.tex(tot)),
              ['Each piece is a rectangle: multiply its width by its height.'], 'area pieces of (x+' + n + ')^2'); } },
          { id: 'e4b', level: 'EMG', make: function (r, sh) { var n = sh.n;
            return B.mc(r, 'Exactly two pieces make the middle term. Which two, and why does the middle term carry a factor of ' + t('2') + '?', [
              { html: 'II and III: each is an ' + t('x') + ' by ' + t(n) + ' rectangle, so ' + t(n + 'x+' + n + 'x=2(' + n + 'x)') + '. Both sides of the square are cut the same way.', right: true },
              { html: 'I and IV: the two squares ' + t('x^{2}') + ' and ' + t(n * n) + ' combine into the middle term.', why: 'I and IV are the squared terms ' + t('x^{2}') + ' and ' + t(n * n) + ' — the first and last terms, not the middle.' },
              { html: 'II and III, but they are different sizes, so the ' + t('2') + ' is a coincidence.', why: 'Compare their side lengths: both are ' + t('x') + ' by ' + t(n) + ', so they always have the same area.' },
              { html: 'II only: the ' + t('2') + ' comes from the two sides labelled ' + t(n) + '.', why: 'Piece II alone has area ' + t(n + 'x') + '. The middle term ' + t(2 * n + 'x') + ' needs a second rectangle.' }],
              'Pieces <b>II and III</b>. Each has one side ' + t('x') + ' and the other side ' + t(n) + ', so each has area ' + t(n + 'x') + ': ' + t(n + 'x+' + n + 'x=' + 2 * n + 'x') + '. The ' + t('2') + ' in ' + t('2ab') + ' counts these two congruent rectangles.',
              ['Which pieces have area ' + t(n + 'x') + '?'], 'which pieces make the middle term'); } },
          { id: 'e4c', level: 'BEG', make: function (r, sh) { var n = sh.n;
            return B.mc(r, 'A student claims ' + t('(x+' + n + ')^{2}=x^{2}+' + n * n) + '. Which pieces has the student counted?', [
              { html: 'Counted I and IV; threw away II and III.', right: true },
              { html: 'Counted II and III; threw away I and IV.', why: t('x^{2}') + ' is piece I and ' + t(n * n) + ' is piece IV.' },
              { html: 'Counted I, II and III; threw away IV.', why: 'The student’s answer has no ' + t('x') + ' term, so neither rectangle was counted.' },
              { html: 'Counted all four pieces correctly.', why: 'All four pieces add to ' + t('x^{2}+' + 2 * n + 'x+' + n * n) + ', not ' + t('x^{2}+' + n * n) + '.' }],
              'The student counted the two squares, <b>I</b> (' + t('x^{2}') + ') and <b>IV</b> (' + t(n * n) + '), and threw away <b>II and III</b>, the two ' + t(n + 'x') + ' rectangles — the whole middle term ' + t(2 * n + 'x') + '.',
              ['Match each term of ' + t('x^{2}+' + n * n) + ' with a piece.'], 'which pieces the student kept'); } },
          { id: 'e4d', level: 'BEG', make: function (r, sh) { var n = sh.n, x = sh.xv, tr = (x + n) * (x + n), st = x * x + n * n;
            return B.fields('Take ' + t('x=' + x) + '. Find the true area of the whole square, the student’s total, and the missing area.',
              [{ name: 'True area', label: 'True area', before: t('(x+' + n + ')^{2}=') }, { name: 'Student', label: 'Student’s total', before: t('x^{2}+' + n * n + '=') }, { name: 'Missing', label: 'Missing area' }],
              [K.number(tr, numDiag([[x * x + n * n, 'sq-no-middle', 'That is the student’s total. The true area is ' + t('(' + x + '+' + n + ')^{2}=' + (x + n) + '^{2}') + '.']])), K.number(st), K.number(tr - st, numDiag([[st - tr, 'gap-sign', 'Subtract the student’s total from the true area.']]))],
              [String(tr), String(st), String(tr - st)], t(tr + ',\\ ' + st + ',\\ ' + (tr - st)),
              'True area: ' + t('(' + x + '+' + n + ')^{2}=' + (x + n) + '^{2}=' + tr) + '<br>Student: ' + t(x + '^{2}+' + n * n + '=' + x * x + '+' + n * n + '=' + st) + '<br>Missing: ' + t(tr + '-' + st + '=' + (tr - st)) + '<br>Pieces II + III: ' + t(n + '(' + x + ')+' + n + '(' + x + ')=' + (tr - st)) + ' ✓',
              ['Substitute ' + t('x=' + x) + ' into both expressions.'], 'missing area at x=' + x); } }] },
      { num: '5', stem: 'The statement ' + t('(a+b)^{2}=a^{2}+b^{2}') + ' is the single most common error in this lesson. This question measures how wrong it is.', parts: [
        { id: 'e5a', level: 'BEG', make: function (r) { var ab = two(r, 1, 7), a = ab[0], b = ab[1], s = (a + b) * (a + b), q = a * a + b * b;
          return B.fields('Evaluate ' + t('(a+b)^{2}') + ' and ' + t('a^{2}+b^{2}') + ' for ' + t('a=' + a) + ', ' + t('b=' + b) + ', and record the gap between them.',
            [{ name: '(a+b)²', before: t('(a+b)^{2}=') }, { name: 'a²+b²', before: t('a^{2}+b^{2}=') }, { name: 'Gap', before: t('\\text{gap}=') }],
            [K.number(s, numDiag([[q, 'sq-no-middle', 'Add first, then square: ' + t('(' + a + '+' + b + ')^{2}=' + (a + b) + '^{2}') + '.']])), K.number(q), K.number(s - q, numDiag([[q - s, 'gap-sign', 'Give the gap as a positive number: the larger value minus the smaller.']]))],
            [String(s), String(q), String(s - q)], t(s + ',\\ ' + q + ',\\ \\text{gap }' + (s - q)),
            t('(' + a + '+' + b + ')^{2}=' + (a + b) + '^{2}=' + s) + '<br>' + t(a + '^{2}+' + b + '^{2}=' + a * a + '+' + b * b + '=' + q) + '<br>Gap ' + t('=' + s + '-' + q + '=' + (s - q)) + ' (that is ' + t('2ab=2(' + a + ')(' + b + ')') + ').',
            ['Brackets first: add ' + t('a+b') + ', then square.'], 'gap (a+b)^2 vs a^2+b^2'); } },
        { id: 'e5b', level: 'EMG', make: function (r) { var a = -r.int(2, 5), b = r.int(2, 6); if (a + b === 0) b++; var s = (a + b) * (a + b), q = a * a + b * b;
          return B.mc(r, 'Now take ' + t('a=' + a) + ', ' + t('b=' + b) + ': ' + t('(a+b)^{2}=' + s) + ' and ' + t('a^{2}+b^{2}=' + q) + '. This time ' + t('(a+b)^{2}') + ' is the <i>smaller</i> one. What changed?', [
            { html: 'The missing term ' + t('2ab') + ' is now negative, because ' + t('a') + ' and ' + t('b') + ' have opposite signs.', right: true },
            { html: 'Squaring a negative number gives a negative, so ' + t('a^{2}') + ' is negative.', why: t('(' + a + ')^{2}=' + a * a) + ' — the square of a negative number is positive.' },
            { html: t('(a+b)^{2}') + ' is always smaller than ' + t('a^{2}+b^{2}') + '.', why: 'Not always — in part (a) with two positive numbers it was larger.' },
            { html: t('a+b') + ' is negative, so its square is negative.', why: 'A square is never negative; here ' + t('(a+b)^{2}=' + s) + '.' }],
            'The gap is ' + t('(a+b)^{2}-(a^{2}+b^{2})=2ab') + '. Here ' + t('2ab=2(' + a + ')(' + b + ')=' + 2 * a * b) + ', which is negative because ' + t('a') + ' and ' + t('b') + ' have opposite signs, so the true square is the smaller one: ' + t(s + '-' + q + '=' + (s - q)) + '.',
            ['What is the gap ' + t('(a+b)^{2}-(a^{2}+b^{2})') + ' in general?'], 'why (a+b)^2 is smaller'); } },
        { id: 'e5c', sub: 'c i', level: 'EMG', make: function (r) {
          return B.poly('Subtract ' + t('a^{2}+b^{2}') + ' from the correct expansion of ' + t('(a+b)^{2}') + ' to get a formula for the gap.', P.parse('2ab'), { vars: ['a', 'b'], wrong: [{ is: P.num(0), code: 'sq-no-middle', hint: 'Use the <b>correct</b> expansion ' + t('(a+b)^{2}=a^{2}+2ab+b^{2}') + ', then subtract ' + t('a^{2}+b^{2}') + '.' }, { is: P.parse('ab'), code: 'sq-not-doubled', hint: 'The middle term of ' + t('(a+b)^{2}') + ' is ' + t('2ab') + '.' }, { is: P.parse('2a^2+2ab+2b^2'), code: 'minus-ignored', hint: '<b>Subtract</b> ' + t('a^{2}+b^{2}') + ' — don’t add it.' }] },
            t('(a+b)^{2}-(a^{2}+b^{2})') + '<br>' + t('=a^{2}+2ab+b^{2}-a^{2}-b^{2}') + '<br>' + t('=2ab'), ['Expand ' + t('(a+b)^{2}') + ' first, then subtract each term of ' + t('a^{2}+b^{2}') + '.'], 'gap formula 2ab'); } },
        { id: 'e5d', sub: 'c ii', level: 'PRG', make: function (r) {
          return B.mc(r, 'Use the gap formula: exactly when are ' + t('(a+b)^{2}') + ' and ' + t('a^{2}+b^{2}') + ' equal?', [
            { html: 'When ' + t('a=0') + ' or ' + t('b=0') + '.', right: true },
            { html: 'When ' + t('a=b') + '.', why: 'Try ' + t('a=b=1') + ': ' + t('(1+1)^{2}=4') + ' but ' + t('1^{2}+1^{2}=2') + '. The gap ' + t('2ab') + ' is zero only when a factor is zero.' },
            { html: 'Never.', why: 'Try ' + t('a=0') + ': both sides become ' + t('b^{2}') + '.' },
            { html: 'When ' + t('a') + ' and ' + t('b') + ' are both positive.', why: 'Then ' + t('2ab') + ' is positive, so ' + t('(a+b)^{2}') + ' is bigger.' }],
            'They are equal exactly when the gap ' + t('2ab=0') + ', that is, when ' + t('a=0') + ' or ' + t('b=0') + '.', ['When is ' + t('2ab=0') + '?'], 'when is (a+b)^2 = a^2+b^2'); } }] },

      { num: '6', section: 'Extra practice C — Find and fix the error', stem: function (sh) { return 'Asked to expand ' + t('(' + sh.p + 'x-' + sh.q + ')^{2}') + ', a student wrote ' + t('(' + sh.p + 'x-' + sh.q + ')^{2}=' + sh.p * sh.p + 'x^{2}-' + sh.q * sh.q) + '.'; },
        shared: function (r) { var p = r.int(2, 5), q; do { q = r.int(3, 9); } while (q === p || q % p === 0); return { p: p, q: q }; },
        parts: [
          { id: 'e6a', level: 'BEG', make: function (r, sh) { var p = sh.p, q = sh.q, tr = (p - q) * (p - q), st = p * p - q * q;
            return B.fields('Substitute ' + t('x=1') + ' into ' + t('(' + p + 'x-' + q + ')^{2}') + ' and into the student’s answer.',
              [{ name: 'True value', before: t('(' + p + 'x-' + q + ')^{2}=') }, { name: 'Student', before: t(p * p + 'x^{2}-' + q * q + '=') }],
              [K.number(tr, numDiag([[-tr, 'neg-square', 'A square is never negative: ' + t('(' + (p - q) + ')^{2}=' + tr) + '.'], [p - q, 'not-sq', 'Square the bracket after working out the inside.']])), K.number(st)],
              [String(tr), String(st)], t(tr + ' \\text{ and } ' + st),
              t('(' + p + '(1)-' + q + ')^{2}=(' + (p - q) + ')^{2}=' + tr) + '<br>Student: ' + t(p * p + '(1)^{2}-' + q * q + '=' + st) + '<br>' + t(tr + '\\neq ' + st) + ', so the statement is false.',
              ['Replace ' + t('x') + ' with ' + t('1') + ' everywhere.'], 'test student expansion at x=1'); } },
          { id: 'e6b', level: 'EMG', make: function (r, sh) { return ex([T(1, 1, [bin(V(sh.p, 'x'), V(-sh.q))], true)], { prompt: 'Expand ' + t('(' + sh.p + 'x-' + sh.q + ')^{2}') + ' correctly.' }); } },
          { id: 'e6c', level: 'EMG', make: function (r, sh) { var p = sh.p, q = sh.q;
            return B.mc(r, 'The student’s answer is the correct expansion of a <i>different</i> product. Which product, and which shortcut did the student reach for by mistake?', [
              { html: t('(' + p + 'x-' + q + ')(' + p + 'x+' + q + ')') + ' — the sum × difference shortcut ' + t('a^{2}-b^{2}') + '.', right: true },
              { html: t('(' + p + 'x+' + q + ')^{2}') + ' — the square shortcut.', why: 'Any square of a binomial has a middle term, and the student’s answer has none.' },
              { html: t('(' + p + 'x-' + q + ')(' + p + 'x+' + q + ')') + ' — the square shortcut ' + t('a^{2}-2ab+b^{2}') + '.', why: 'The product is right, but the shortcut that gives ' + t('a^{2}-b^{2}') + ' is the <b>sum × difference</b> one.' },
              { html: t('(' + p + 'x-' + q + ')(' + p + 'x-' + q + ')') + ' — the sum × difference shortcut.', why: 'That is the original square. The student’s ' + t('a^{2}-b^{2}') + ' belongs to brackets with <b>opposite</b> signs.' }],
              t('(' + p + 'x-' + q + ')(' + p + 'x+' + q + ')=(' + p + 'x)^{2}-' + q + '^{2}=' + p * p + 'x^{2}-' + q * q) + '. The student used the <b>sum × difference</b> shortcut, but both brackets of ' + t('(' + p + 'x-' + q + ')^{2}') + ' are ' + t('(' + p + 'x-' + q + ')') + ': it is a square.',
              ['Which product gives exactly ' + t('a^{2}-b^{2}') + '?'], 'which product the student expanded'); } }] },
      { num: '7', stem: function (sh) { return 'A second student keeps the middle term but gets its sign wrong: ' + t('(' + sh.p + 'm-' + sh.q + 'n)^{2}=' + sh.p * sh.p + 'm^{2}+' + 2 * sh.p * sh.q + 'mn+' + sh.q * sh.q + 'n^{2}') + '.'; },
        shared: function (r) { var pq = two(r, 2, 6); return { p: pq[0], q: pq[1] }; },
        parts: [
          { id: 'e7a', level: 'BEG', make: function (r, sh) { var p = sh.p, q = sh.q, tr = (p - q) * (p - q), st = (p + q) * (p + q);
            return B.fields('Substitute ' + t('m=1') + ', ' + t('n=1') + ' into both sides. How far apart are they?',
              [{ name: 'Left side', before: t('(' + p + 'm-' + q + 'n)^{2}=') }, { name: 'Student', before: t('\\text{student}=') }, { name: 'Apart', label: 'How far apart' }],
              [K.number(tr), K.number(st), K.number(st - tr, numDiag([[tr - st, 'gap-sign', 'Give the distance as a positive number.']]))],
              [String(tr), String(st), String(st - tr)], t(tr + ',\\ ' + st + ',\\ ' + (st - tr) + '\\text{ apart}'),
              'Correct: ' + t('(' + p + '-' + q + ')^{2}=' + tr) + '<br>Student: ' + t(p * p + '+' + 2 * p * q + '+' + q * q + '=' + st) + '<br>They are ' + t(st + '-' + tr + '=' + (st - tr)) + ' apart — twice the ' + t(2 * p * q + 'mn') + ' that has the wrong sign.',
              ['Replace every letter with ' + t('1') + '.'], 'test sign error at m=n=1'); } },
          { id: 'e7b', level: 'PRG', make: function (r, sh) { return ex([T(1, 1, [bin(V(sh.p, 'm'), V(-sh.q, 'n'))], true)], { prompt: 'Give the correct expansion of ' + t('(' + sh.p + 'm-' + sh.q + 'n)^{2}') + '.' }); } },
          { id: 'e7c', level: 'EMG', make: function (r) {
            return B.mc(r, 'Complete the rule: “In ' + t('(a\\pm b)^{2}') + ' the last term is <i>always</i> positive because ____, while the middle term takes ____.”', [
              { html: 'it is a square, ' + t('(\\pm b)^{2}=b^{2}') + ' · the sign written in the bracket', right: true },
              { html: t('b') + ' is always positive · the sign of the first term', why: t('b') + ' can be negative; the last term is positive because it is a <b>square</b>. The middle term is ' + t('2ab') + ', with the sign from the bracket.' },
              { html: 'it is a square · always a plus sign', why: 'The middle term is ' + t('2a(\\pm b)') + ': in ' + t('(a-b)^{2}') + ' it is negative.' },
              { html: 'it is the product of the last terms · always a minus sign', why: 'In ' + t('(a+b)^{2}') + ' the middle term is ' + t('+2ab') + '.' }],
              'The last term is ' + t('(\\pm b)^{2}=b^{2}') + ', and a square is never negative. The middle term is ' + t('2a(\\pm b)=\\pm 2ab') + ': it takes the sign written in the bracket.', ['Think about ' + t('(a-b)^{2}=a^{2}-2ab+b^{2}') + '.'], 'rule for signs in (a±b)^2', true); } }] },
      { num: '8', stem: function (sh) { return 'Four more slips:<br>' + sh.rows.map(function (q, i) { return '(' + String.fromCharCode(97 + i) + ') ' + t(q.slip); }).join('<br>'); },
        shared: function (r) {
          var n = r.int(2, 9), p = r.int(2, 5), q = r.int(2, 7), s = r.int(2, 5), u = r.int(2, 9), L = r.pick([['a', 'b'], ['m', 'n'], ['x', 'y']]), ll = r.pick(['a', 'b', 'k', 'y']);
          var rows = [];
          rows.push({ terms: [T(1, 1, [bin(X, V(n))], true)], slip: '(x+' + n + ')^{2}=x^{2}+' + n + 'x+' + n * n, kind: 'double' });
          rows.push({ terms: [T(1, 1, [bin(V(p, 'y'), V(-q))], true)], slip: '(' + p + 'y-' + q + ')^{2}=' + p + 'y^{2}-' + 2 * p * q + 'y+' + q * q, kind: 'coef' });
          rows.push({ terms: [T(1, 1, [bin(V(s, ll), V(u)), bin(V(s, ll), V(-u))])], slip: '(' + s + ll + '+' + u + ')(' + s + ll + '-' + u + ')=' + s * s + ll + '^{2}+' + u * u, kind: 'last' });
          var a2 = {}, b2 = {}; a2[L[0]] = 2; b2[L[1]] = 2;
          rows.push({ terms: [T(1, 1, [bin(V(1, a2), V(-1, b2))], true)], slip: '(' + L[0] + '^{2}-' + L[1] + '^{2})^{2}=' + L[0] + '^{4}+' + L[1] + '^{4}', kind: 'missing' });
          return { rows: rows };
        },
        parts: [
          { id: 'e8', sub: 'name', level: 'EMG', make: function (r, sh) {
            var cols = [{ id: 'double', html: 'middle term not doubled' }, { id: 'coef', html: 'coefficient not squared' }, { id: 'last', html: 'wrong sign on the last term' }, { id: 'missing', html: 'middle term missing' }], want = {};
            var rows = sh.rows.map(function (q, i) { var id = String.fromCharCode(97 + i); want[id] = q.kind; return { id: id, html: '(' + id + ')' }; });
            var names = { double: 'the middle term was not doubled', coef: 'the coefficient was not squared', last: 'wrong sign on the last term — a sum × difference gives ' + t('a^{2}-b^{2}'), missing: 'the middle term is missing (squaring each term separately)' };
            return B.grid('Name the mistake in each slip.', rows, cols, want, { why: function (row) { var q = sh.rows[row.charCodeAt(0) - 97]; return { code: 'row', hint: 'Look at (' + row + ') again: expand ' + t(exprTex(q.terms)) + ' yourself and compare it term by term with the slip.' }; } },
              sh.rows.map(function (q, i) { return '(' + String.fromCharCode(97 + i) + ') ' + names[q.kind] + '.'; }).join('<br>'), ['Expand each product correctly, then compare: which term is different, and how?'], 'name four slips'); } },
          { id: 'e8a', sub: 'a', level: 'BEG', make: function (r, sh) { return ex(sh.rows[0].terms, { prompt: 'Give the correct expansion of ' + t(exprTex(sh.rows[0].terms)) + '.' }); } },
          { id: 'e8b', sub: 'b', level: 'EMG', make: function (r, sh) { return ex(sh.rows[1].terms, { prompt: 'Give the correct expansion of ' + t(exprTex(sh.rows[1].terms)) + '.' }); } },
          { id: 'e8c', sub: 'c', level: 'EMG', make: function (r, sh) { return ex(sh.rows[2].terms, { prompt: 'Give the correct expansion of ' + t(exprTex(sh.rows[2].terms)) + '.' }); } },
          { id: 'e8d', sub: 'd', level: 'EMG', make: function (r, sh) { return ex(sh.rows[3].terms, { prompt: 'Give the correct expansion of ' + t(exprTex(sh.rows[3].terms)) + '.' }); } }] },

      { num: '9', section: 'Extra practice D — The patterns in reverse: arithmetic without a calculator', stem: 'Every one of these products is a sum times a difference in disguise.', parts: [
        { id: 'e9a', level: 'BEG', make: function (r) { return sdArith(r, 10 * r.int(3, 9), 1); } },
        { id: 'e9b', level: 'BEG', make: function (r) { return sdArith(r, 10 * r.int(3, 9), 2); } },
        { id: 'e9c', level: 'BEG', make: function (r) { return sdArith(r, 10 * r.int(3, 9), 3); } },
        { id: 'e9d', level: 'BEG', make: function (r) { return sdArith(r, 10 * r.pick([3, 5, 7, 8, 9]), 5); } },
        { id: 'e9e', level: 'BEG', make: function (r) { return sdArith(r, 10 * r.int(2, 3), 1); } },
        { id: 'e9f', level: 'EMG', make: function (r) { return sdArith(r, 1000, r.int(2, 7)); } }] },
      { num: '10', stem: 'Now the squaring pattern.', parts: [
        { id: 'e10a', level: 'BEG', make: function (r) { return sqArith(100, r.int(1, 4)); } },
        { id: 'e10b', level: 'BEG', make: function (r) { return sqArith(10 * r.int(3, 8), -r.int(1, 2)); } },
        { id: 'e10c', level: 'BEG', make: function (r) { return sqArith(100 * r.int(2, 4), 5); } },
        { id: 'e10d', level: 'EMG', make: function (r) { return sqArith(1000, -r.int(1, 3)); } },
        { id: 'e10e', level: 'BEG', make: function (r) { return sqArith(10 * r.int(2, 9), 1); } },
        { id: 'e10f', level: 'EMG', make: function (r) { return sqArith(10, -r.int(1, 3) / 10, 1); } }] },
      { num: '11', stem: 'When is the sum-times-difference trick actually worth using?', parts: [
        { id: 'e11a', level: 'EMG', make: function (r) { var N = 10 * r.int(3, 9), d = r.int(2, 4);
          return B.mc(r, t((N - d) + '\\times ' + (N + d)) + ' works beautifully. What condition must two factors satisfy for this method to apply at all?', [
            { html: 'They must be the same distance ' + t('d') + ' either side of one number ' + t('N') + ' (and the trick is quick when ' + t('N') + ' is round).', right: true },
            { html: 'They must both be close to ' + t('100') + '.', why: t((N - d) + '\\times ' + (N + d)) + ' isn’t close to 100 and the trick still works: what matters is the middle number.' },
            { html: 'They must both be odd.', why: t('88\\times 92') + ' works too. What matters is that both are the same distance from a middle number.' },
            { html: 'They must differ by exactly ' + t(2 * d) + '.', why: 'Any difference works: ' + t('N+d') + ' and ' + t('N-d') + ' differ by ' + t('2d') + ' for any ' + t('d') + '.' }],
            'The factors must be ' + t('N+d') + ' and ' + t('N-d') + ': the same distance either side of one number. ' + t((N - d) + '\\times ' + (N + d) + '=(' + N + '-' + d + ')(' + N + '+' + d + ')=' + F(N * N) + '-' + d * d + '=' + F(N * N - d * d)) + '.',
            ['Look at ' + t((N - d) + '\\times ' + (N + d)) + ': how far is each factor from ' + t(N) + '?'], 'condition for the N±d trick'); } },
        { id: 'e11b', level: 'BEG', make: function (r) { return sdArith(r, 10 * r.int(4, 8), r.int(2, 6)); } },
        { id: 'e11c', level: 'EMG', make: function (r) { var M = 10 * r.int(4, 8) + r.pick([1, 3]), d = r.int(2, 4), a = M + d, b = M - d;
          return B.mc(r, 'Try the method on ' + t(a + '\\times ' + b) + '. It still works — why does it save you nothing here?', [
            { html: 'The middle number is ' + t(M) + ', and ' + t(M + '^{2}') + ' is as hard to work out as the original product.', right: true },
            { html: 'The method gives the wrong answer here.', why: t('(' + M + '+' + d + ')(' + M + '-' + d + ')=' + M + '^{2}-' + d * d) + ' is still exactly right — it just isn’t easier.' },
            { html: t(a) + ' and ' + t(b) + ' are not both even.', why: 'Evenness doesn’t matter. Find the number halfway between them.' },
            { html: 'The difference of squares only works for numbers under ' + t(50) + '.', why: 'It works for any numbers — ' + t('995\\times 1005') + ' was easy.' }],
            'Halfway between is ' + t(M) + ', so ' + t(a + '\\times ' + b + '=' + M + '^{2}-' + d + '^{2}=' + F(M * M) + '-' + d * d + '=' + F(a * b)) + '. Correct, but squaring ' + t(M) + ' is as hard as the original product: nothing is saved.',
            ['What is the middle number? Is it round?'], 'why the trick saves nothing'); } },
        { id: 'e11d', level: 'BEG', make: function (r) { return sdArith(r, 100 * r.int(2, 5), r.int(2, 4)); } }] },

      { num: '12', section: 'Extra practice E — Adding two squares: what survives', stem: 'Each of these adds a pair of squared binomials. Expand each fully, then collect, and watch what disappears.', parts: [
        { id: 'e12a', level: 'EMG', make: function (r) { var n = r.int(2, 9); return ex([T(1, 1, [bin(X, V(n))], true), T(1, 1, [bin(X, V(-n))], true)]); } },
        { id: 'e12b', level: 'EMG', make: function (r) { var L = r.pick([['a', 'b'], ['m', 'n'], ['p', 'q'], ['x', 'y']]), a = V(1, L[0]), b = V(1, L[1]); return ex([T(1, 1, [bin(a, b)], true), T(1, 1, [bin(a, P.neg(b))], true)]); } },
        { id: 'e12c', level: 'PRG', make: function (r) { var pq = two(r, 2, 6); return ex([T(1, 1, [bin(V(pq[0], 'm'), V(pq[1], 'n'))], true), T(1, 1, [bin(V(pq[0], 'm'), V(-pq[1], 'n'))], true)]); } },
        { id: 'e12d', level: 'PRG', make: function (r) { var k = r.int(2, 6); return ex([T(1, 1, [bin(V(k, 'p'), V(-1, 'q'))], true), T(1, 1, [bin(V(k, 'p'), V(1, 'q'))], true)]); } },
        { id: 'e12e', level: 'EMG', make: function (r) { var L = r.pick([['x', 'y'], ['a', 'b'], ['m', 'n']]), a = V(1, L[0]), b = V(1, L[1]), a2 = {}, b2 = {}; a2[L[0]] = 2; b2[L[1]] = 2;
          return ex([T(1, 1, [bin(a, b)], true), T(-1, 1, [grp([V(1, a2), V(1, b2)])])]); } },
        { id: 'e12f', level: 'EMG', make: function (r) { var n = r.int(2, 9); return ex([T(1, 1, [bin(V(1, 'a'), V(n))], true), T(1, 1, [bin(V(1, 'a'), V(-n))], true), T(-1, 1, [mono(V(2, { a: 2 }))])]); } }] },
      { num: '13', stem: 'Read your answers to question 12 back.', parts: [
        { id: 'e13a', level: 'EMG', make: function (r) {
          return B.mc(r, 'In 12(a)–(d) every middle term vanished. Why, and what is the general result for ' + t('(a+b)^{2}+(a-b)^{2}') + '?', [
            { html: 'The middle terms are ' + t('+2ab') + ' and ' + t('-2ab') + ', so they cancel: ' + t('(a+b)^{2}+(a-b)^{2}=2a^{2}+2b^{2}') + '.', right: true },
            { html: 'Both squares have the same middle term, so it doubles: ' + t('2a^{2}+4ab+2b^{2}') + '.', why: 'The middle term of ' + t('(a-b)^{2}') + ' is ' + t('-2ab') + ' — opposite to the one in ' + t('(a+b)^{2}') + '.' },
            { html: 'Squared binomials have no middle terms: ' + t('a^{2}+b^{2}') + '.', why: 'Every squared binomial has a middle term ' + t('\\pm 2ab') + '; here they cancel, and the squares double.' },
            { html: 'The middle terms cancel and so do the squares: ' + t('0') + '.', why: 'The squares ' + t('a^{2}') + ' and ' + t('b^{2}') + ' appear with the same sign in both, so they add.' }],
            t('(a^{2}+2ab+b^{2})+(a^{2}-2ab+b^{2})=2a^{2}+2b^{2}') + ': the two expansions differ only in the sign of the middle term, so adding cancels it and doubles the squares.', ['Write both expansions and add them.'], 'why the middle terms cancel'); } },
        { id: 'e13b', level: 'EMG', make: function (r) {
          return B.mc(r, 'The matching identity for a difference is ' + t('(a+b)^{2}-(a-b)^{2}=4ab') + '. Why does adding destroy the cross terms while subtracting destroys the squares?', [
            { html: 'The squares match in both expansions and the cross terms are opposites: adding cancels opposites, subtracting cancels matches.', right: true },
            { html: 'Subtracting always gives a smaller answer than adding.', why: 'That doesn’t explain which terms cancel. Compare the signs of each term in ' + t('(a+b)^{2}') + ' and ' + t('(a-b)^{2}') + '.' },
            { html: 'The cross terms are both ' + t('+2ab') + ', so subtracting cancels them.', why: 'In ' + t('(a-b)^{2}') + ' the cross term is ' + t('-2ab') + '. Subtracting it gives ' + t('2ab-(-2ab)=4ab') + '.' },
            { html: 'Squares can’t be subtracted, so they vanish.', why: 'They can: ' + t('a^{2}-a^{2}=0') + ' because the squares <b>match</b>.' }],
            t('(a+b)^{2}=a^{2}+2ab+b^{2}') + ' and ' + t('(a-b)^{2}=a^{2}-2ab+b^{2}') + '. The squares are the same in both; the cross terms are opposites. Adding cancels the opposites (cross terms) and doubles the matches; subtracting cancels the matches (squares) and doubles the opposites: ' + t('2ab-(-2ab)=4ab') + '.',
            ['Compare the signs of each term in the two expansions.'], 'adding vs subtracting squares'); } },
        { id: 'e13c', level: 'PRG', make: function (r) { var N = 5 * r.int(4, 10), d = r.int(1, 4), a = N + d, b = N - d, ans = 2 * N * N + 2 * d * d;
          return B.fields('Use ' + t('(a+b)^{2}+(a-b)^{2}=2a^{2}+2b^{2}') + ' to evaluate ' + t(a + '^{2}+' + b + '^{2}') + ' mentally. State your ' + t('a') + ' and ' + t('b') + ' first.',
            [{ name: 'a', before: t('a=') }, { name: 'b', before: t('b=') }, { name: 'Value', before: t(a + '^{2}+' + b + '^{2}='), wide: true }],
            [K.number(N, numDiag([[a, 'n-d', t(a) + ' is ' + t('a+b') + '. Here ' + t('a') + ' is the number halfway between ' + t(a) + ' and ' + t(b) + '.']])), K.number(d), K.number(ans, numDiag([[N * N + d * d, 'sq-not-doubled', 'The identity gives <b>2</b>' + t('a^{2}') + ' + <b>2</b>' + t('b^{2}') + '.']]))],
            [String(N), String(d), String(ans)], t('a=' + N + ',\\ b=' + d + ',\\ ' + F(ans)),
            t(a + '=' + N + '+' + d) + ', ' + t(b + '=' + N + '-' + d) + ', so ' + t('a=' + N) + ', ' + t('b=' + d) + '.<br>' + t('2(' + N + ')^{2}+2(' + d + ')^{2}=' + F(2 * N * N) + '+' + 2 * d * d + '=' + F(ans)) + '<br>Check: ' + t(F(a * a) + '+' + F(b * b) + '=' + F(ans)) + ' ✓',
            ['Write ' + t(a) + ' and ' + t(b) + ' as ' + t('a+b') + ' and ' + t('a-b') + ': ' + t('a') + ' is the number halfway between them.'], 'sum of squares mentally'); } },
        { id: 'e13d', level: 'EMG', make: function (r) { var p = r.int(2, 9), q = r.int(2, 9); return ex([T(1, 1, [bin(V(p, 'x'), V(q))], true), T(1, 1, [bin(V(p, 'x'), V(-q))], true)], { prompt: 'Without expanding, write down the value of ' + t('(' + p + 'x+' + q + ')^{2}+(' + p + 'x-' + q + ')^{2}') + '.',
          sol: 'Here ' + t('a=' + p + 'x') + ' and ' + t('b=' + q) + ', so the sum is ' + t('2a^{2}+2b^{2}=2(' + p + 'x)^{2}+2(' + q + ')^{2}=2(' + p * p + 'x^{2})+2(' + q * q + ')=' + 2 * p * p + 'x^{2}+' + 2 * q * q) + '.' }); } }] },
      { num: '14', stem: 'A coefficient out front, and two different patterns in the same expression. Expand every product completely before collecting.', parts: [
        { id: 'e14a', level: 'PRG', make: function (r) { var k = r.int(2, 4), n = r.int(2, 6); return ex([T(1, k, [bin(X, V(n))], true), T(-1, 1, [bin(X, V(-n)), bin(X, V(n))])]); } },
        { id: 'e14b', level: 'PRG', make: function (r) { var p = r.int(2, 5), q = r.int(2, 5); if (p === q) q = p + 1; return ex([T(1, 1, [bin(V(p, 'a'), V(-q, 'b'))], true), T(1, 1, [bin(V(p, 'a'), V(q, 'b')), bin(V(p, 'a'), V(-q, 'b'))])]); } },
        { id: 'e14c', level: 'PRG', make: function (r) { var k = r.int(3, 6), j = r.int(2, 3), q = r.int(2, 3); if (j === k) j = 2; return ex([T(1, k, [bin(V(1, 'm'), V(q, 'n')), bin(V(1, 'm'), V(-q, 'n'))]), T(-1, j, [bin(V(1, 'm'), V(-q, 'n'))], true)]); } },
        { id: 'e14d', level: 'PRG', make: function (r) { var n = r.int(1, 4), x2 = V(1, { x: 2 }); return ex([T(1, 1, [bin(x2, V(n)), bin(x2, V(-n))]), T(-1, 1, [bin(x2, V(-n))], true)]); } }] },

      { num: '15', section: 'Extra practice F — Stretch', stem: 'Squaring a <i>trinomial</i>: treat ' + t('(a+b+c)^{2}') + ' as the square of the two terms ' + t('(a+b)') + ' and ' + t('c') + '.', parts: [
        { id: 'e15a', level: 'PRG', make: function (r) { var T3 = P.parse('a^2+b^2+c^2+2ab+2ac+2bc');
          var p = B.poly('Expand ' + t('(a+b+c)^{2}') + ' completely.', T3, { vars: ['a', 'b', 'c'], wrong: [
            { is: P.parse('a^2+b^2+c^2'), code: 'no-cross', hint: 'Squaring a sum always gives cross terms. Treat it as ' + t('\\big((a+b)+c\\big)^{2}=(a+b)^{2}+2(a+b)c+c^{2}') + '.' },
            { is: P.parse('a^2+b^2+c^2+ab+ac+bc'), code: 'cross-not-doubled', hint: 'Each cross term comes from the middle term ' + t('2ab') + ' of a square, so each one is <b>doubled</b>.' },
            { is: P.parse('a^2+2ab+b^2+c^2'), code: 'no-cross', hint: 'You expanded ' + t('(a+b)^{2}') + ' but left out the middle term ' + t('2(a+b)c') + ' of the outer square.' },
            { is: P.parse('a^2+2ab+b^2+2ac+c^2'), code: 'dist-first', hint: 'Multiply ' + t('2c') + ' by <b>both</b> terms of ' + t('(a+b)') + '.' }] },
            t('\\big((a+b)+c\\big)^{2}=(a+b)^{2}+2(a+b)c+c^{2}') + '<br>' + t('=a^{2}+2ab+b^{2}+2ac+2bc+c^{2}') + '<br>' + t('=a^{2}+b^{2}+c^{2}+2ab+2ac+2bc'), ['Let ' + t('A=a+b') + '. Then ' + t('(A+c)^{2}=A^{2}+2Ac+c^{2}') + '; expand ' + t('A^{2}') + ' and ' + t('2Ac') + '.'], '(a+b+c)^2');
          p.bad = ['a^2+b^2+c^2', 'a^2+b^2+c^2+ab+ac+bc']; return p; } },
        { id: 'e15b', level: 'EMG', make: function (r) {
          return B.fields('State the result as a rule: how many squared terms, how many cross terms, and what coefficient does each cross term carry?',
            [{ name: 'Squared terms', label: 'Number of squared terms' }, { name: 'Cross terms', label: 'Number of cross terms' }, { name: 'Coefficient', label: 'Coefficient of each cross term' }],
            [K.number(3), K.number(3, numDiag([[6, 'cross', 'Count each <b>pair</b> once: ' + t('ab, ac, bc') + '.']])), K.number(2, numDiag([[1, 'cross-not-doubled', 'Look at ' + t('2ab') + ' in your expansion.']]))],
            ['3', '3', '2'], '3 squared terms, 3 cross terms, each with coefficient 2',
            '<b>Three squared terms</b> (' + t('a^{2},b^{2},c^{2}') + '), <b>three cross terms</b> — one for every pair (' + t('ab,ac,bc') + ') — and each cross term has coefficient <b>2</b>.',
            ['Read them off your answer to (a).'], 'trinomial square rule'); } },
        { id: 'e15c', level: 'BEG', make: function (r) { var a = r.int(1, 3), b = r.int(2, 4), c = r.int(3, 5); if (b <= a) b = a + 1; if (c <= b) c = b + 1; var s = (a + b + c) * (a + b + c);
          return B.fields('Check the rule with ' + t('a=' + a) + ', ' + t('b=' + b) + ', ' + t('c=' + c) + ' by evaluating both sides.',
            [{ name: '(a+b+c)²', before: t('(a+b+c)^{2}=') }, { name: 'Expansion', before: t('a^{2}+b^{2}+c^{2}+2ab+2ac+2bc='), wide: true }],
            [K.number(s), K.number(s, numDiag([[a * a + b * b + c * c, 'no-cross', 'Include the cross terms ' + t('2ab+2ac+2bc') + '.'], [a * a + b * b + c * c + a * b + a * c + b * c, 'cross-not-doubled', 'Each cross term is doubled.']]))],
            [String(s), String(s)], 'both ' + t(s),
            t('(' + a + '+' + b + '+' + c + ')^{2}=' + (a + b + c) + '^{2}=' + s) + '<br>' + t(a * a + '+' + b * b + '+' + c * c + '+' + 2 * a * b + '+' + 2 * a * c + '+' + 2 * b * c + '=' + s) + ' ✓',
            ['Substitute into both expressions.'], 'check trinomial rule'); } },
        { id: 'e15d', level: 'ADV', make: function (r) { var p = r.int(2, 4), q = r.int(2, 5), c = r.int(2, 7), A = V(p, 'x'), Bq = V(-q, 'y'), C = V(c);
          var tg = P.pow(P.add(A, Bq, C), 2), sqs = P.add(P.pow(A, 2), P.pow(Bq, 2), P.pow(C, 2)), cr = P.add(P.mul(A, Bq), P.mul(A, C), P.mul(Bq, C));
          var p2 = B.poly('Use the rule to expand ' + t('(' + p + 'x-' + q + 'y+' + c + ')^{2}') + ' in one pass.', tg, { vars: ['x', 'y'], wrong: [
            { is: sqs, code: 'no-cross', hint: 'You have the three squares; now add the three cross terms ' + t('2ab+2ac+2bc') + '.' },
            { is: P.add(sqs, cr), code: 'cross-not-doubled', hint: 'Each cross term is <b>doubled</b>: ' + t('2ab') + ', not ' + t('ab') + '.' },
            { is: P.add(P.mul(V(p), V(1, { x: 2 })), P.mul(V(q), V(1, { y: 2 })), V(c * c), P.scale(cr, 2)), code: 'coef-not-squared', hint: 'Square the <b>whole</b> term: ' + t('(' + p + 'x)^{2}=' + p * p + 'x^{2}') + '.' }] },
            t('a=' + p + 'x,\\ b=-' + q + 'y,\\ c=' + c) + '<br>Squares: ' + t('(' + p + 'x)^{2}=' + p * p + 'x^{2},\\ (-' + q + 'y)^{2}=' + q * q + 'y^{2},\\ ' + c + '^{2}=' + c * c) + '<br>Cross terms: ' + t('2(' + p + 'x)(-' + q + 'y)=' + P.tex(P.scale(P.mul(A, Bq), 2)) + ',\\ 2(' + p + 'x)(' + c + ')=' + 2 * p * c + 'x,\\ 2(-' + q + 'y)(' + c + ')=-' + 2 * q * c + 'y') + '<br>' + t('=' + P.seq([P.pow(A, 2), P.pow(Bq, 2), P.pow(C, 2), P.scale(P.mul(A, Bq), 2), P.scale(P.mul(A, C), 2), P.scale(P.mul(Bq, C), 2)])),
            ['Three squares: ' + t('(' + p + 'x)^{2}') + ', ' + t('(-' + q + 'y)^{2}') + ', ' + t(c + '^{2}') + '. Three cross terms: twice each pair.', 'Watch the signs: ' + t('-' + q + 'y') + ' is negative.'], '(px-qy+c)^2');
          p2.bad = [P.tex(sqs), P.tex(P.add(sqs, cr))]; return p2; } }] },
      { num: '16', stem: 'A difference of squares in which each “term” is itself a binomial. Group the terms into an ' + t('a') + ' and a ' + t('b') + ' first, apply ' + t('a^{2}-b^{2}') + ', and only then expand what is left.', parts: [
        { id: 'e16a', level: 'PRG', make: function (r) { var k = r.int(2, 9), S = P.parse('x+y'), tg = P.sub(P.pow(S, 2), V(k * k));
          var p = B.poly('Expand ' + t('(x+y+' + k + ')(x+y-' + k + ')') + '.', tg, { vars: ['x', 'y'], wrong: [
            { is: P.parse('x^2+y^2-' + k * k), code: 'no-group-middle', hint: t('(x+y)^{2}') + ' is a square of a binomial: it has a middle term ' + t('2xy') + '.' },
            { is: P.sub(P.pow(S, 2), V(k)), code: 'not-sq', hint: 'Square ' + t('b=' + k) + ' too: ' + t('b^{2}=' + k * k) + '.' },
            { is: P.add(P.pow(S, 2), V(k * k)), code: 'sd-plus', hint: 'It is ' + t('a^{2}-b^{2}') + ': subtract ' + t(k * k) + '.' }] },
            t('A=x+y,\\ B=' + k) + '<br>' + t('(A+B)(A-B)=A^{2}-B^{2}=(x+y)^{2}-' + k + '^{2}') + '<br>' + t('=x^{2}+2xy+y^{2}-' + k * k), ['Let ' + t('A=x+y') + ': the product is ' + t('(A+' + k + ')(A-' + k + ')') + '.'], '(x+y+k)(x+y-k)');
          p.good = ['x^2+2xy+y^2-' + k * k, '-' + k * k + '+y^2+2xy+x^2']; return p; } },
        { id: 'e16b', level: 'PRG', make: function (r) { var p0 = r.int(2, 4), k = r.int(2, 5), S = P.add(V(p0, 'a'), V(1, 'b')), tg = P.sub(P.pow(S, 2), V(k * k));
          return B.poly('Expand ' + t('(' + p0 + 'a+b-' + k + ')(' + p0 + 'a+b+' + k + ')') + '.', tg, { vars: ['a', 'b'], wrong: [
            { is: P.sub(P.add(V(p0 * p0, { a: 2 }), V(1, { b: 2 })), V(k * k)), code: 'no-group-middle', hint: t('(' + p0 + 'a+b)^{2}') + ' has a middle term ' + t('2(' + p0 + 'a)(b)') + '.' },
            { is: P.sub(P.add(V(p0, { a: 2 }), V(2 * p0, { a: 1, b: 1 }), V(1, { b: 2 })), V(k * k)), code: 'coef-not-squared', hint: 'Square the whole term: ' + t('(' + p0 + 'a)^{2}=' + p0 * p0 + 'a^{2}') + '.' },
            { is: P.add(P.pow(S, 2), V(k * k)), code: 'sd-plus', hint: 'It is ' + t('A^{2}-B^{2}') + ': subtract ' + t(k * k) + '.' }] },
            t('A=' + p0 + 'a+b,\\ B=' + k) + '<br>' + t('(A-B)(A+B)=A^{2}-B^{2}=(' + p0 + 'a+b)^{2}-' + k + '^{2}') + '<br>' + t('=' + P.tex(tg)), ['Let ' + t('A=' + p0 + 'a+b') + ' and ' + t('B=' + k) + '.'], '(pa+b-k)(pa+b+k)'); } },
        { id: 'e16c', level: 'ADV', make: function (r) { var k = r.int(2, 9), M = V(1, 'm'), N = V(1, 'n'), tg = P.sub(P.pow(M, 2), P.pow(P.sub(N, V(k)), 2));
          return B.poly('Expand ' + t('(m-n+' + k + ')(m+n-' + k + ')') + '. (Hint: group ' + t('-n+' + k) + ' as ' + t('-(n-' + k + ')') + '.)', tg, { vars: ['m', 'n'], wrong: [
            { is: P.parse('m^2-n^2-' + k * k), code: 'no-group-middle', hint: t('(n-' + k + ')^{2}') + ' has a middle term: ' + t('-2(n)(' + k + ')') + '.' },
            { is: P.parse('m^2-n^2+' + k * k), code: 'no-group-middle', hint: t('(n-' + k + ')^{2}') + ' has a middle term, and the whole square is subtracted.' },
            { is: P.parse('m^2-n^2-' + 2 * k + 'n-' + k * k), code: 'sq-middle-sign', hint: 'Subtract ' + t('(n-' + k + ')^{2}=n^{2}-' + 2 * k + 'n+' + k * k) + ': every sign changes.' },
            { is: P.parse('m^2-n^2+' + 2 * k + 'n+' + k * k), code: 'minus-first', hint: 'The minus sign in front of ' + t('(n-' + k + ')^{2}') + ' changes the sign of <b>every</b> term of its expansion.' }] },
            t('m-n+' + k + '=m-(n-' + k + ')') + ' and ' + t('m+n-' + k + '=m+(n-' + k + ')') + '<br>' + t('A=m,\\ B=n-' + k) + '<br>' + t('=m^{2}-(n-' + k + ')^{2}=m^{2}-(n^{2}-' + 2 * k + 'n+' + k * k + ')') + '<br>' + t('=' + P.tex(tg)),
            ['The product is ' + t('\\big(m-(n-' + k + ')\\big)\\big(m+(n-' + k + ')\\big)') + '.'], '(m-n+k)(m+n-k)'); } },
        { id: 'e16d', level: 'ADV', make: function (r) { var p, q, rr, s; do { p = r.int(2, 4); q = r.int(1, 3); rr = r.int(1, 2); s = r.int(2, 5); } while (rr >= p || s === q);
          var A = P.add(V(p, 'x'), V(q, 'y')), Bm = P.sub(V(rr, 'x'), V(s, 'y')), dif = P.sub(A, Bm), sum = P.add(A, Bm);
          var terms16 = [T(1, 1, [bin(V(p, 'x'), V(q, 'y'))], true), T(-1, 1, [bin(V(rr, 'x'), V(-s, 'y'))], true)];
          return ex(terms16, {
            prompt: 'Expand ' + t(exprTex(terms16)) + '. (Do it as a difference of squares, not by expanding both.)',
            sol: t('A=' + P.tex(A) + ',\\ B=' + P.tex(Bm)) + '<br>' + t('A^{2}-B^{2}=(A-B)(A+B)') + '<br>' + t('A-B=' + P.tex(dif) + ',\\ A+B=' + P.tex(sum)) + '<br>' + t('(' + P.tex(dif) + ')(' + P.tex(sum) + ')=' + P.tex(P.mul(dif, sum))),
            hints: ['Let ' + t('A=' + P.tex(A)) + ' and ' + t('B=' + P.tex(Bm)) + '. Work out ' + t('A-B') + ' and ' + t('A+B') + ' first (watch the signs), then multiply them.', 'Check by expanding both squares and subtracting.'] }); } }] },
      { num: '17', stem: 'Chaining the difference of squares.', parts: [
        { id: 'e17a', level: 'PRG', make: function (r) { var k = r.pick([1, 1, 2, 3]), ky = k === 1 ? 'y' : k + 'y', k2 = k * k, tg = P.sub(V(1, { x: 4 }), V(k2 * k2, { y: 4 }));
          return B.poly('Expand ' + t('(x-' + ky + ')(x+' + ky + ')(x^{2}+' + (k2 === 1 ? '' : k2) + 'y^{2})') + ' by multiplying the first two brackets first.', tg, { vars: ['x', 'y'], wrong: [
            { is: P.add(V(1, { x: 4 }), V(k2 * k2, { y: 4 })), code: 'sd-plus', hint: t('(x^{2}-' + (k2 === 1 ? '' : k2) + 'y^{2})(x^{2}+' + (k2 === 1 ? '' : k2) + 'y^{2})') + ' is another sum × difference: the result is a <b>difference</b>.' },
            { is: P.add(V(1, { x: 4 }), V(-2 * k2, { x: 2, y: 2 }), V(k2 * k2, { y: 4 })), code: 'sd-as-square', hint: 'The brackets ' + t('(x^{2}-' + (k2 === 1 ? '' : k2) + 'y^{2})') + ' and ' + t('(x^{2}+' + (k2 === 1 ? '' : k2) + 'y^{2})') + ' are a sum and a difference — no middle term.' }].concat(k > 1 ? [{ is: P.sub(V(1, { x: 4 }), V(k2, { y: 4 })), code: 'coef-not-squared', hint: 'Square the whole term: ' + t('(' + k2 + 'y^{2})^{2}=' + k2 * k2 + 'y^{4}') + '.' }] : []) },
            t('(x-' + ky + ')(x+' + ky + ')=x^{2}-' + (k2 === 1 ? '' : k2) + 'y^{2}') + '<br>' + t('(x^{2}-' + (k2 === 1 ? '' : k2) + 'y^{2})(x^{2}+' + (k2 === 1 ? '' : k2) + 'y^{2})=(x^{2})^{2}-(' + (k2 === 1 ? '' : k2) + 'y^{2})^{2}') + '<br>' + t('=' + P.tex(tg)),
            ['The first two brackets give a difference of squares — and that result pairs with the third bracket as another sum × difference.'], 'chain sd 3 factors'); } },
        { id: 'e17b', level: 'ADV', make: function (r) { var k = r.pick([1, 1, 2]), c = function (e) { return Math.pow(k, e); }, tg = P.sub(V(1, { x: 8 }), V(c(8)));
          return B.poly('Extend the idea: expand ' + t('(x-' + k + ')(x+' + k + ')(x^{2}+' + c(2) + ')(x^{4}+' + c(4) + ')') + '.', tg, { vars: ['x'], wrong: [
            { is: P.add(V(1, { x: 8 }), V(c(8))), code: 'sd-plus', hint: 'Every step is a sum × difference, so the last step gives a <b>difference</b>.' },
            { is: P.sub(V(1, { x: 7 }), V(c(8))), code: 'exponent', hint: 'Each step squares the previous: ' + t('x\\to x^{2}\\to x^{4}\\to x^{8}') + '.' },
            ].concat(k > 1 ? [{ is: P.sub(V(1, { x: 8 }), V(c(4))), code: 'not-sq', hint: 'At each step the constant is squared too: ' + t(c(4) + '^{2}=' + c(8)) + '.' }] : []) },
            t('(x-' + k + ')(x+' + k + ')=x^{2}-' + c(2)) + '<br>' + t('(x^{2}-' + c(2) + ')(x^{2}+' + c(2) + ')=x^{4}-' + c(4)) + '<br>' + t('(x^{4}-' + c(4) + ')(x^{4}+' + c(4) + ')=x^{8}-' + c(8)),
            ['Multiply the first two brackets, then the result with the next bracket, and so on — each step is a sum × difference.'], 'chain sd 4 factors'); } },
        { id: 'e17c', level: 'BEG', make: function (r) { var x = r.int(2, 4), fs = [x - 1, x + 1, x * x + 1, Math.pow(x, 4) + 1], pr = Math.pow(x, 8) - 1;
          return B.fields('Put ' + t('x=' + x) + ' into ' + t('(x-1)(x+1)(x^{2}+1)(x^{4}+1)') + ' to evaluate ' + t(x + '^{8}-1') + ' from four small factors.',
            [{ name: 'x−1', before: t('x-1=') }, { name: 'x+1', before: t('x+1=') }, { name: 'x²+1', before: t('x^{2}+1=') }, { name: 'x⁴+1', before: t('x^{4}+1=') }, { name: 'Product', before: t(x + '^{8}-1='), wide: true }],
            [K.number(fs[0]), K.number(fs[1]), K.number(fs[2]), K.number(fs[3], numDiag([[4 * x + 1, 'not-sq', t('x^{4}') + ' means ' + t(x + '\\times ' + x + '\\times ' + x + '\\times ' + x) + '.']])), K.number(pr, numDiag([[pr + 1, 'forgot-1', 'That is ' + t(x + '^{8}') + '; subtract ' + t('1') + '.']]))],
            fs.map(String).concat([String(pr)]), t(fs.join('\\times ') + '=' + F(pr)),
            'Factors at ' + t('x=' + x) + ': ' + t(fs.join(',\\ ')) + '<br>' + t(fs.join('\\times ') + '=' + F(pr)) + '<br>' + t(x + '^{8}-1=' + F(pr + 1) + '-1=' + F(pr)) + ' ✓',
            ['Evaluate each factor, then multiply all four.'], 'evaluate x^8-1 at x=' + x); } }] },
      { num: '18', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: 'e18', level: 'EMG', make: function (r) { var p = r.int(3, 6), q = r.int(2, 9);
          var tx = function (pl) { return t(P.tex(pl)); }, A = V(p, { x: 2 }), Bq = V(-q, 'y'), A2 = P.pow(A, 2), B2 = P.pow(Bq, 2), mid = P.scale(P.mul(A, Bq), 2);
          return B.mc(r, 'The expansion of ' + t('(' + p + 'x^{2}-' + q + 'y)^{2}') + ' is', [
            { html: tx(P.sub(A2, B2)), why: 'That is the sum × difference result. A square has a middle term ' + t('2ab') + '.' },
            { html: tx(P.add(A2, B2)), why: 'That drops the middle term. ' + SQ + '.' },
            { html: tx(P.add(A2, mid, B2)), right: true },
            { html: tx(P.add(V(2 * p, { x: 4 }), mid, B2)), why: t('(' + p + 'x^{2})^{2}') + ' means ' + t(p + 'x^{2}\\cdot ' + p + 'x^{2}') + ': square the ' + t(p) + ', don’t double it.' }],
            t('=(' + p + 'x^{2})^{2}-2(' + p + 'x^{2})(' + q + 'y)+(' + q + 'y)^{2}=' + P.tex(P.add(A2, mid, B2))) + '. The first option is the sum × difference result, the second drops the middle term, the last doubles the ' + t(p) + ' instead of squaring it.',
            ['Use ' + SQ + ' with ' + t('a=' + p + 'x^{2}') + ' and ' + t('b=' + q + 'y') + '.'], 'MC (px^2-qy)^2', true); } }] },
      { num: '19', stem: '<i>(Numerical Response)</i>', parts: [
        { id: 'e19', level: 'PRG', make: function (r) { var p = r.int(2, 6), q = r.int(2, 9), c = r.int(2, 5), ans = 2 * p * q;
          return B.nr('When ' + t('(' + p + 'm+' + q + 'n+' + c + ')^{2}') + ' is expanded and simplified, the coefficient of the ' + t('mn') + ' term is ____. (Record your answer as a three-digit number.)', ans,
            numDiag([[p * q, 'cross-not-doubled', 'Each cross term of a trinomial square is <b>doubled</b>: ' + t('2ab') + '.'], [p * p * q * q, 'squared-k', 'The ' + t('mn') + ' term is a cross term ' + t('2(' + p + 'm)(' + q + 'n)') + ', not a square.']]),
            'Only one cross term contains ' + t('mn') + ': ' + t('2(' + p + 'm)(' + q + 'n)=' + ans + 'mn') + '.<br>Full: ' + t(P.tex(P.pow(P.add(V(p, 'm'), V(q, 'n'), V(c)), 2))) + '<br>Answer: <b>' + ('00' + ans).slice(-3) + '</b>',
            ['Squares: ' + t('a^{2},b^{2},c^{2}') + '; cross terms: ' + t('2ab,2ac,2bc') + '. Which one has ' + t('m') + ' and ' + t('n') + '?'], 'NR coefficient of mn'); } }] }
    ]
  });
})(window);
