/* Math 10C · Unit 3 · Lesson 6 — Polynomial Operations: Comprehensive Review (AN4)
 * Assignment questions 1–13 (u3_L06.tex: Part A multiple choice, Part B numerical response, Part C written response,
 * Part D extension) and the Lesson 6 Extra Practice (u3_EP06.tex, Q1–20).
 * Every part is a generator: it keeps the idea and difficulty of the booklet question (the booklet's numbers are one
 * of the possible values) and changes the numbers. Keys are built with HW.poly from the generated numbers.
 * Local helpers: lin/quad (build polynomials), wl (filters opt.wrong lists), pairCheck (two factors in either order),
 * prodCheck (two factors whose product is a target), factorCheck (the missing factor of a product),
 * exampleTri (a trinomial with stated features), and small SVG figures (card and photo, box net, tile rectangle, cube,
 * drilled block). Levels: LIM BEG EMG PRG ADV MAS. */
(function (root) {
  'use strict';
  var HW = root.HW, F = HW.fmt, K = HW.kit, KP = K.P, Y = HW.poly, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form;

  HW.addCodes({
    'terms-count': 'Counted the terms instead of the degree', 'max-exp': 'Used the largest single exponent (multi-variable term)', 'all-exp': 'Added every exponent in the polynomial',
    'neg-exp-poly': 'Counted an expression with a negative exponent as a polynomial', 'multi-var-deg': 'Missed the degree of a two-variable term', 'hidden-higher': 'Missed a higher-degree term written later',
    'fl-only': 'Multiplied only first terms and last terms', 'no-middle': 'Left out the middle term of a square', 'middle-not-doubled': 'Middle term of a square not doubled',
    'outer-inner': 'Left out the outer and inner products', 'added-middle': 'Added the outer and inner products wrongly', 'const-sign': 'Wrong sign on the constant term',
    'sub-sign': 'Subtracted a bracket without changing every sign', 'added-areas': 'Added the areas instead of subtracting', 'photo-square': 'Squared a binomial as two squares',
    'line-error': 'Picked the wrong line in the student’s work', 'only-a': 'Gave a (or b) instead of a + b', 'dos-sign': 'Sign error in the difference of squares',
    'box-dims': 'Box dimensions L − x instead of L − 2x', 'no-height': 'Forgot the height of the box', 'q-not-mult': 'Second term not multiplied through the trinomial',
    'factor-swap': 'Factors swapped (top/side)', 'tile-sign': 'Misread the sign of a tile', 'tile-count': 'Miscounted tiles', 'no-zero-pairs': 'Did not cancel zero pairs',
    'cs-half': 'Did not halve the x-coefficient', 'cs-sign': 'Sign of p wrong', 'cs-q': 'Wrong q (constant adjustment)', 'not-trinomial': 'Not a trinomial', 'deg-wrong': 'Wrong degree',
    'lead-wrong': 'Wrong leading coefficient', 'const-wrong': 'Wrong constant term', 'deg-mult': 'Multiplied degrees instead of adding', 'lead-add': 'Added leading coefficients instead of multiplying',
    'const-add': 'Added constants instead of multiplying', 'terms-wrong': 'Wrong number of terms', 'cancel-missed': 'Missed terms that cancel', 'factor-degree': 'Missing factor has the wrong degree',
    'factor-const': 'Missing factor has the wrong constant', 'factor-middle': 'Missing factor has a wrong middle term', 'trivial-factor': 'Used 1 (or a constant) as a factor', 'cube-each': 'Cubed each term separately',
    'not-doubled': 'Surface area not doubled', 'partial-miss': 'Missed a partial product', 'cross-once': 'Counted a cross product once', 'drop-term': 'Dropped one partial product',
    'zero-missed': 'Missed k = 0', 'not-zero': 'A value that changes the area', 'neg-a': 'Gave a negative value', 'a-b-swap': 'Swapped a and b'
  });

  /* ---------- polynomial helpers ---------- */
  function vo(v, e) { var o = {}; o[v || 'x'] = e == null ? 1 : e; return o; }
  function mono(c, v, e) { return Y.mono(c, vo(v, e)); }
  function lin(a, b, v) { return Y.add(mono(a, v), Y.num(b)); }               // a·v + b
  function quad(a, b, c, v) { return Y.add(mono(a, v, 2), mono(b, v), Y.num(c)); } // a·v² + b·v + c
  function tx(p) { return Y.tex(p); }
  function bt(p) { return Y.btex(p); }
  function ord(p, v) { return Y.tex(p, { order: 'desc', var: v || 'x' }); }
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var q = a % b; a = b; b = q; } return a; }
  function nz(r, lo, hi) { var v; do { v = r.int(lo, hi); } while (v === 0); return v; }
  function par(n) { return n < 0 ? '(' + n + ')' : String(n); }
  function cf(p, v, e) { var c = Y.coef(p, e === 0 ? {} : vo(v, e)); return c[0] / c[1]; }
  function pickWhere(gen, test) { for (var i = 0; i < 800; i++) { var v = gen(); if (test(v)) return v; } throw new Error('pickWhere failed'); }
  /* opt.wrong list without entries equal to the target (or to each other) */
  function wl(target, list) {
    var out = [];
    list.forEach(function (w) { if (!w || !w.is) return; var p = Y.lift(w.is); if (Y.eq(p, target)) return; if (out.some(function (o) { return Y.eq(o.is, p); })) return; out.push({ is: p, code: w.code, hint: w.hint }); });
    return out;
  }
  function poly(prompt, target, opt, sol, hints, text) {
    opt = opt || {}; if (opt.wrong) opt.wrong = wl(target, opt.wrong);
    var p = KP.poly(prompt, target, opt, sol, hints, text);
    p.bad = (opt.wrong || []).map(function (w) { return Y.tex(w.is); });
    return p;
  }
  function allDistinct(list) { var s = {}; for (var i = 0; i < list.length; i++) { if (s[list[i]]) return false; s[list[i]] = 1; } return true; }
  /* MC whose options are polynomials: right + [{p, why}] -> null when two options print the same */
  function polyMC(r, prompt, right, wrongs, sol, hints, text, keep) {
    var opts = [{ html: t(tx(right)), right: true }].concat(wrongs.map(function (w) { return { html: t(tx(w.p)), why: w.why, code: w.code }; }));
    if (!allDistinct(opts.map(function (o) { return o.html; }))) return null;
    return KP.mc(r, prompt, opts, sol, hints, text, keep);
  }
  function readPoly(resp) {
    var a = K.read(resp); if (a.res) return { res: a.res };
    var rr = Y.read(a.ast);
    if (!rr.ok) return { res: wrong(rr.why === 'not-poly' ? 'not-poly' : 'value', rr.why === 'not-poly' ? 'That isn’t a polynomial. Check your work.' : null) };
    var fi = Y.formIssue(a.ast);
    return { p: rr.p, ast: a.ast, fi: fi };
  }
  /* two boxes holding two factors, in either order (opt.ordered: swapped order gets a form nudge) */
  function pairCheck(f1, f2, opt) {
    opt = opt || {};
    return function (resp) {
      resp = resp || [];
      var a = readPoly(resp[0] == null ? '' : resp[0]); if (a.res) return lab(a.res, opt.labels[0]);
      var b = readPoly(resp[1] == null ? '' : resp[1]); if (b.res) return lab(b.res, opt.labels[1]);
      var straight = Y.eq(a.p, f1) && Y.eq(b.p, f2), swapped = Y.eq(a.p, f2) && Y.eq(b.p, f1);
      if (straight || swapped) {
        if (a.fi) return lab(form(a.fi.code, a.fi.msg || 'Simplify it fully.'), opt.labels[0]);
        if (b.fi) return lab(form(b.fi.code, b.fi.msg || 'Simplify it fully.'), opt.labels[1]);
        if (swapped && !straight && opt.ordered) return form('factor-swap', opt.swapHint || 'Those are the two factors — but they are in the wrong boxes.');
        return ok();
      }
      var h = opt.diag ? opt.diag(a.p, b.p) : null;
      if (h) return wrong(h.code, h.hint);
      return wrong('value', null);
    };
  }
  function lab(res, label) { if (res.hint && label) res = { v: res.v, code: res.code, hint: '<b>' + label + ':</b> ' + res.hint }; return res; }
  /* two boxes whose product must be target, each with nTerms terms */
  function prodCheck(target, nTerms, labels, diag) {
    return function (resp) {
      resp = resp || [];
      var a = readPoly(resp[0] == null ? '' : resp[0]); if (a.res) return lab(a.res, labels[0]);
      var b = readPoly(resp[1] == null ? '' : resp[1]); if (b.res) return lab(b.res, labels[1]);
      if (Y.eq(Y.mul(a.p, b.p), target)) {
        if (Y.count(a.p) !== nTerms || Y.count(b.p) !== nTerms) return wrong('trivial-factor', 'Their product is right, but each factor should be a ' + (nTerms === 2 ? 'binomial' : 'trinomial') + ' (' + nTerms + ' terms).');
        if (a.fi) return lab(form(a.fi.code, a.fi.msg || 'Simplify it fully.'), labels[0]);
        if (b.fi) return lab(form(b.fi.code, b.fi.msg || 'Simplify it fully.'), labels[1]);
        return ok();
      }
      var h = diag ? diag(a.p, b.p) : null;
      if (h) return wrong(h.code, h.hint);
      return wrong('value', 'Multiply your two factors together: the product should be ' + t(tx(target)) + '.');
    };
  }
  /* the missing factor M in given × M = target (want = the true M) */
  function factorCheck(given, want, target, v) {
    v = v || 'x';
    return function (resp) {
      var a = readPoly(resp); if (a.res) return a.res;
      var S = a.p;
      if (Y.eq(Y.mul(given, S), target)) { if (a.fi) return form(a.fi.code, a.fi.msg || 'Simplify it fully.'); return ok(); }
      if (Y.eq(S, Y.neg(want))) return wrong('sign-all', 'Every sign is the opposite of what it should be. Divide the leading terms (and the constants) with their signs.');
      var dS = Y.degree(S), dW = Y.degree(want);
      if (dS !== dW || cf(S, v, dW) !== cf(want, v, dW)) return wrong('factor-degree', 'Check the first term: it must multiply ' + t(tx(leadTerm(given, v))) + ' to give the leading term ' + t(tx(leadTerm(target, v))) + '.');
      if (cf(S, v, 0) !== cf(want, v, 0)) return wrong('factor-const', 'Check the constant term: it must multiply ' + t(String(cf(given, v, 0))) + ' to give the constant ' + t(String(cf(target, v, 0))) + '.');
      return wrong('factor-middle', 'Your first and last terms are right. Expand ' + t(bt(given) + '\\left(' + tx(S) + '\\right)') + ' and compare it with ' + t(tx(target)) + ' to fix the middle term.');
    };
  }
  function leadTerm(p, v) { var T0 = Y.sorted(p, { order: 'desc', var: v || 'x' })[0], o = {}; o[T0.key] = { c: T0.c, v: T0.v }; return o; }
  function features(p, v) { return { deg: Y.degree(p), lead: (function () { var c = Y.lead(p, v || 'x'); return c[0] / c[1]; })(), cst: cf(p, v, 0), n: Y.count(p) }; }
  function numDiag(list) { return function (x) { for (var i = 0; i < list.length; i++) if (list[i][0] === x) return { code: list[i][1], hint: list[i][2] }; return null; }; }

  /* ---------- SVG figures (labels written plainly; letters italic) ---------- */
  var INK = '#1d2430', STROKE = '#2b3340', SHADE = '#c3c9d1', TILE = '#9aa3ad';
  function sl(s) { return String(s).replace(/(\S)([+-])/g, '$1 $2 ').replace(/-/g, '−').replace(/([a-z])/g, '<tspan font-style="italic">$1</tspan>'); }
  function lb(p) { return sl(tx(p)); }
  function txt(x, y, s, o) { o = o || {}; return '<text x="' + x + '" y="' + y + '" text-anchor="' + (o.anchor || 'middle') + '" font-size="' + (o.size || 15) + '" fill="' + INK + '"' + (o.rot ? ' transform="rotate(' + o.rot + ' ' + x + ' ' + y + ')"' : '') + '>' + s + '</text>'; }
  function svgOpen(w, h, max, label) { return '<svg class="fig-svg" viewBox="0 0 ' + w + ' ' + h + '" width="100%" style="max-width:' + max + 'px" role="img" aria-label="' + label + '">'; }
  function cardSvg(L, Wd, S) {
    return svgOpen(360, 240, 420, 'rectangular card with a square photo glued on it') +
      '<rect x="48" y="34" width="282" height="164" fill="' + SHADE + '" stroke="' + STROKE + '" stroke-width="1.5"/>' +
      '<rect x="206" y="62" width="104" height="104" fill="#fff" stroke="' + STROKE + '" stroke-width="1.5"/>' +
      txt(258, 119, 'photo') + txt(189, 22, 'length of card = ' + lb(L)) + txt(30, 116, 'width = ' + lb(Wd), { rot: -90 }) + txt(189, 226, 'side of photo = ' + lb(S)) + '</svg>';
  }
  function netSvg(L, Wd) {
    var x0 = 50, y0 = 20, w = 250, h = Math.round(250 * Wd / L), c = 30, s = '';
    s += svgOpen(360, h + 92, 420, 'sheet of cardboard with a square cut from each corner');
    [[x0, y0], [x0 + w - c, y0], [x0, y0 + h - c], [x0 + w - c, y0 + h - c]].forEach(function (q) { s += '<rect x="' + q[0] + '" y="' + q[1] + '" width="' + c + '" height="' + c + '" fill="' + SHADE + '" stroke="#8a929c" stroke-width="1"/>'; });
    s += '<path d="M' + (x0 + c) + ' ' + y0 + ' H' + (x0 + w - c) + ' V' + (y0 + c) + ' H' + (x0 + w) + ' V' + (y0 + h - c) + ' H' + (x0 + w - c) + ' V' + (y0 + h) + ' H' + (x0 + c) + ' V' + (y0 + h - c) + ' H' + x0 + ' V' + (y0 + c) + ' H' + (x0 + c) + ' Z" fill="none" stroke="' + STROKE + '" stroke-width="2"/>';
    s += '<rect x="' + (x0 + c) + '" y="' + (y0 + c) + '" width="' + (w - 2 * c) + '" height="' + (h - 2 * c) + '" fill="none" stroke="' + STROKE + '" stroke-width="1.2" stroke-dasharray="6 4"/>';
    s += txt(x0 + w / 2, y0 + h + 22, L + ' cm') + txt(x0 - 14, y0 + h / 2, Wd + ' cm', { rot: -90 }) + txt(x0 + c / 2, y0 + c / 2 + 5, sl('x'), { size: 14 }) + txt(x0 + w - c / 2, y0 + h - c / 2 + 5, sl('x'), { size: 14 });
    s += txt(180, y0 + h + 52, 'shaded squares of side ' + sl('x') + ' are cut out;', { size: 13 }) + txt(180, y0 + h + 70, 'fold up along the dashed lines', { size: 13 });
    return s + '</svg>';
  }

  /* ---------- assignment: shared generators ---------- */
  function q8Work(r) {
    // (x + p)(x^2 + bx + c), the student's lines, and where the error is
    var s = pickWhere(function () { return { p: nz(r, -5, 5), b: nz(r, -5, 5), c: nz(r, -6, 6), err: r.pick([3, 3, 1, 2, 0]) }; },
      function (s) { return Math.abs(s.p) >= 2 && s.b + s.p !== 0 && s.c + s.p * s.b !== 0 && s.c - s.p * s.b !== 0; });
    var T = quad(1, s.b, s.c), pp = s.err === 1 ? -s.p : s.p; // line 1 error: wrong sign on the second factor term
    var l1 = 'x\\left(' + tx(T) + '\\right)' + (pp < 0 ? '-' + (-pp) : '+' + pp) + '\\left(' + tx(T) + '\\right)';
    var terms = [mono(1, 'x', 3), mono(s.b, 'x', 2), mono(s.c, 'x'), mono(pp, 'x', 2), mono(pp * s.b, 'x'), Y.num(pp * s.c)];
    if (s.err === 2) terms[5] = Y.num(-pp * s.c); // line 2 error: sign of the last product
    var l2 = Y.seq(terms), res = Y.add.apply(null, terms);
    if (s.err === 3) res = Y.add(res, mono(-2 * s.c, 'x')); // line 3 error: combined the x terms wrongly
    var correct = Y.mul(lin(1, s.p), T);
    s.T = T; s.l1 = l1; s.l2 = l2; s.l3 = tx(res); s.correct = correct; s.res = res;
    return s;
  }
  function tilesQ12(r) {
    return pickWhere(function () {
      var a = r.pick([1, 2, 2, 3]), b = nz(r, -3, 3), c = r.int(1, 3) * (b > 0 ? -1 : 1);
      return { a: a, b: b, c: c };
    }, function (s) { return s.a + Math.abs(s.b) <= 5 && s.a * s.c + s.b !== 0 && gcd(s.a, Math.abs(s.b)) === 1; });
  }
  function tokens(n, kind) { var o = []; for (var i = 0; i < Math.abs(n); i++) o.push((n < 0 ? '-' : '') + kind); return o; }

  /* ---------- extra practice: helpers ---------- */
  function plusTex(p) { var s = tx(p); return s.charAt(0) === '-' ? s : '+' + s; }
  /* "write a trinomial in x with degree 2, leading coefficient A, constant C, in descending order" */
  function exampleTri(A, C) {
    var key = quad(A, 1, C);
    var p = KP.math('Write a trinomial ' + t('P') + ' in ' + t('x') + ' that has degree ' + t(2) + ', leading coefficient ' + t(A) + ' and constant term ' + t(C) + '. Write it in descending order.', function (resp) {
      var a = readPoly(resp); if (a.res) return a.res;
      var S = a.p;
      if (Y.vars(S).some(function (v) { return v !== 'x'; })) return wrong('var', 'Use only the variable ' + t('x') + '.');
      if (a.fi) return form(a.fi.code, a.fi.msg || 'Simplify it fully.');
      if (Y.degree(S) !== 2) return wrong('deg-wrong', 'The degree must be ' + t(2) + ': the highest power of ' + t('x') + ' is ' + t('x^{2}') + '.');
      if (cf(S, 'x', 2) !== A) return wrong('lead-wrong', 'The leading coefficient (the number in front of ' + t('x^{2}') + ') must be ' + t(A) + '.');
      if (cf(S, 'x', 0) !== C) return wrong('const-wrong', 'The constant term must be ' + t(C) + '.');
      if (Y.count(S) !== 3) return wrong('not-trinomial', 'A trinomial has <b>three</b> terms — you also need an ' + t('x') + '-term (any nonzero coefficient).');
      var want = Y.sorted(S, { order: 'desc', var: 'x' }).map(function (T) { return T.key; });
      if (Y.writtenOrder(a.ast).join('|') !== want.join('|')) return wrong('order', 'Write it in <b>descending order</b>: the ' + t('x^{2}') + ' term first, then the ' + t('x') + ' term, then the constant.');
      return ok();
    }, tx(key), 'Answers vary. Degree ' + t(2) + ' with leading coefficient ' + t(A) + ' makes the first term ' + t(A + 'x^{2}') + '; the constant term ' + t(C) + ' is the last term. A trinomial needs one more term, of degree ' + t(1) + ': for example ' + t('P=' + tx(key)) + '.',
    ['Start with ' + t(A + 'x^{2}') + ' and end with ' + t(C) + '. What kind of term goes in the middle?'], 'example trinomial', { keys: 'poly', vars: ['x'] });
    p.good = [tx(quad(A, -4, C)), tx(quad(A, 7, C))];
    p.bad = [tx(quad(A, 0, C)), tx(quad(A, 1, -C)), Y.seq([Y.num(C), mono(1, 'x'), mono(A, 'x', 2)]), tx(quad(A + 1, 1, C)), tx(Y.add(mono(A, 'x', 3), mono(1, 'x'), Y.num(C)))];
    return p;
  }
  /* degree, number of terms, leading coefficient of a product */
  function auditPart(R, exprTex, sol, termsDiag, degDiag, leadDiag) {
    var f = features(R, 'x'), fl = [{ name: 'Degree', label: 'degree' }, { name: 'Terms', label: 'number of terms' }, { name: 'Leading coefficient', label: 'leading coefficient' }];
    return KP.fields(t(exprTex), fl, [K.number(f.deg, numDiag(degDiag || [])), K.number(f.n, numDiag(termsDiag || [])), K.number(f.lead, numDiag((leadDiag || []).concat([[-f.lead, 'sign', 'Check the sign of the leading coefficient.']])))],
      [String(f.deg), String(f.n), String(f.lead)], 'degree ' + t(f.deg) + ', ' + t(f.n) + ' terms, leading coefficient ' + t(f.lead),
      sol + '<br>Degree ' + t(f.deg) + ', ' + t(f.n) + ' terms, leading coefficient ' + t(f.lead) + '.', ['Predict the highest-degree term from the leading terms, then check whether any terms collect or cancel.'], 'audit ' + exprTex);
  }
  function missingPart(G, M, T, side, sol) {
    var q = side === 'left' ? '\\left(\\ ?\\ \\right)\\left(' + tx(G) + '\\right)' : bt(G) + '\\left(\\ ?\\ \\right)';
    var p = KP.math('Find the missing factor: ' + t(q + '=' + tx(T)), factorCheck(G, M, T), tx(M), sol,
      ['Divide the leading terms to get the first term, and the constants to get the last term.', 'Then expand your product to check it (and to find any middle term).'], 'missing factor', { keys: 'poly', vars: ['x'] });
    p.bad = [tx(Y.neg(M)), tx(Y.add(M, mono(1, 'x')))];
    return p;
  }
  /* EP14: the student's work on m(x − p)² − (x + q)(x² − rx + s) */
  function ex14(s) {
    var m = s.m, p = s.p, q = s.q, rr = s.rr, ss = s.s, sq = Y.pow(lin(1, -p), 2), T = quad(1, -rr, ss), prod = Y.mul(lin(1, q), T), correct = Y.sub(Y.scale(sq, m), prod);
    var c2 = q - rr, c1 = ss - q * rr, c0 = q * ss;
    var terms = [mono(m, 'x', 2), Y.num(-m * p * p), mono(-1, 'x', 3), mono(-c2, 'x', 2), mono(-c1, 'x'), Y.num(c0)], res3 = Y.add.apply(null, terms);
    var v0 = Y.at(correct, { x: 1 }), v3 = Y.at(res3, { x: 1 });
    return { exprTex: m + '(x-' + p + ')^{2}-(x+' + q + ')\\left(' + tx(T) + '\\right)', l1: m + '(x^{2}-' + p * p + ')-\\left(' + tx(prod) + '\\right)', l2: Y.seq(terms), l3: ord(res3), res3: res3,
      sq: sq, prod: prod, correct: correct, v0: v0, v3: v3, okay: c2 !== 0 && c1 !== 0 && m - c2 !== 0 && c0 - m * p * p !== 0 && Y.count(correct) === 4 && v0 !== v3 && Y.count(res3) === 4 };
  }
  /* EP15: (x + a)(x² + bx − c) and a claim with the wrong x coefficient */
  function ex15(s) {
    var T = quad(1, s.b, -s.c), R = Y.mul(lin(1, s.a), T), S = Y.add(R, mono(-s.a * s.b, 'x')), lhs = '(x+' + s.a + ')\\left(' + tx(T) + '\\right)';
    return { T: T, R: R, S: S, lhs: lhs, claimTex: lhs + '=' + tx(S) };
  }
  /* figures */
  function tileRect(a, b) {
    var U = 12, X = 44, g = 3, x0 = 2, y0 = 2, s = '', Wd = x0 + X + g + a * (U + g) + 1, H = y0 + X + g + b * (U + g) + 1;
    function rc(x, y, w, h) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="1.5" fill="' + TILE + '" stroke="' + STROKE + '" stroke-width="1.3"/>'; }
    s += rc(x0, y0, X, X);
    for (var i = 0; i < a; i++) s += rc(x0 + X + g + i * (U + g), y0, U, X);
    for (var j = 0; j < b; j++) { s += rc(x0, y0 + X + g + j * (U + g), X, U); for (i = 0; i < a; i++) s += rc(x0 + X + g + i * (U + g), y0 + X + g + j * (U + g), U, U); }
    return '<svg class="tiles-svg" viewBox="0 0 ' + Wd + ' ' + H + '" width="100%" style="max-width:' + Math.round(Wd * 2.2) + 'px" role="img" aria-label="algebra tiles arranged in a rectangle">' + s + '</svg>';
  }
  function cubeSvg(k) {
    var x0 = 50, y0 = 80, S = 140, dx = 60, dy = -50, f = 0.68, sx = x0 + S * f, sy = y0 + S * (1 - f), s = svgOpen(300, 255, 340, 'cube sliced into eight blocks');
    s += '<polygon points="' + x0 + ',' + y0 + ' ' + (x0 + dx) + ',' + (y0 + dy) + ' ' + (x0 + S + dx) + ',' + (y0 + dy) + ' ' + (x0 + S) + ',' + y0 + '" fill="#e3e7ec" stroke="' + STROKE + '" stroke-width="1.6"/>';
    s += '<polygon points="' + (x0 + S) + ',' + y0 + ' ' + (x0 + S + dx) + ',' + (y0 + dy) + ' ' + (x0 + S + dx) + ',' + (y0 + S + dy) + ' ' + (x0 + S) + ',' + (y0 + S) + '" fill="' + SHADE + '" stroke="' + STROKE + '" stroke-width="1.6"/>';
    s += '<rect x="' + x0 + '" y="' + y0 + '" width="' + S + '" height="' + S + '" fill="#f2f4f6" stroke="' + STROKE + '" stroke-width="1.6"/>';
    var dash = ' stroke="' + STROKE + '" stroke-width="1.1" stroke-dasharray="5 4"';
    s += '<line x1="' + sx + '" y1="' + y0 + '" x2="' + sx + '" y2="' + (y0 + S) + '"' + dash + '/><line x1="' + x0 + '" y1="' + sy + '" x2="' + (x0 + S) + '" y2="' + sy + '"' + dash + '/>';
    s += '<line x1="' + sx + '" y1="' + y0 + '" x2="' + (sx + dx) + '" y2="' + (y0 + dy) + '"' + dash + '/><line x1="' + (x0 + S) + '" y1="' + sy + '" x2="' + (x0 + S + dx) + '" y2="' + (sy + dy) + '"' + dash + '/>';
    s += '<line x1="' + (x0 + dx * f) + '" y1="' + (y0 + dy * f) + '" x2="' + (x0 + S + dx * f) + '" y2="' + (y0 + dy * f) + '"' + dash + '/><line x1="' + (x0 + S + dx * f) + '" y1="' + (y0 + dy * f) + '" x2="' + (x0 + S + dx * f) + '" y2="' + (y0 + S + dy * f) + '"' + dash + '/>';
    s += txt((x0 + sx) / 2, y0 + S + 22, sl('x')) + txt((sx + x0 + S) / 2, y0 + S + 22, String(k)) + txt(x0 - 16, (y0 + sy) / 2 + 5, String(k)) + txt(x0 - 16, (sy + y0 + S) / 2 + 5, sl('x'));
    return s + '</svg>';
  }
  function blockSvg(sh) {
    var O = lin(sh.a, sh.b), I = lin(1, sh.c), big = 140, inner = Math.max(40, Math.min(80, Math.round(big * (3 + sh.c) / (3 * sh.a + sh.b)))), x0 = 34, y0 = 16, ix = x0 + (big - inner) / 2, s = svgOpen(400, 232, 440, 'top view and side view of a block with a square shaft');
    s += '<rect x="' + x0 + '" y="' + y0 + '" width="' + big + '" height="' + big + '" fill="' + SHADE + '" stroke="' + STROKE + '" stroke-width="1.6"/>';
    s += '<rect x="' + ix + '" y="' + (y0 + (big - inner) / 2) + '" width="' + inner + '" height="' + inner + '" fill="#fff" stroke="' + STROKE + '" stroke-width="1.4"/>';
    s += txt(x0 + big / 2, y0 + big / 2 + 5, lb(I), { size: 13 }) + txt(x0 + big / 2, y0 + big + 22, lb(O)) + txt(x0 - 14, y0 + big / 2, lb(O), { rot: -90 }) + txt(x0 + big / 2, y0 + big + 46, 'top view', { size: 13 });
    var sx0 = 232, sy0 = 46, sw = big, shh = 96;
    s += '<rect x="' + sx0 + '" y="' + sy0 + '" width="' + sw + '" height="' + shh + '" fill="' + SHADE + '" stroke="' + STROKE + '" stroke-width="1.6"/>';
    s += '<line x1="' + (sx0 + (big - inner) / 2) + '" y1="' + sy0 + '" x2="' + (sx0 + (big - inner) / 2) + '" y2="' + (sy0 + shh) + '" stroke="' + STROKE + '" stroke-dasharray="5 4"/><line x1="' + (sx0 + (big + inner) / 2) + '" y1="' + sy0 + '" x2="' + (sx0 + (big + inner) / 2) + '" y2="' + (sy0 + shh) + '" stroke="' + STROKE + '" stroke-dasharray="5 4"/>';
    s += txt(sx0 + sw / 2, sy0 + shh + 22, lb(O)) + txt(sx0 + sw + 16, sy0 + shh / 2, lb(mono(sh.h, 'x')), { rot: -90 }) + txt(sx0 + sw / 2, y0 + big + 46, 'side view', { size: 13 });
    return s + '</svg>';
  }

  HW.defineLesson({
    id: 'u3l6', unit: 3, num: '6', title: 'Polynomial Operations: Comprehensive Review', outcome: 'AN4',
    blurb: 'Every skill in the unit, mixed: classify and find degree, expand products and special products, area and volume, and catch the classic errors.',
    questions: [
      { num: '1', section: 'Part A — Multiple Choice', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '1', level: 'BEG', make: function (r) {
          var V = r.pick([['a', 'b'], ['a', 'b'], ['x', 'y'], ['m', 'n']]), u = V[0], w = V[1];
          var s = pickWhere(function () { return { p: r.int(2, 4), q: r.int(2, 4), rr: r.int(3, 6), c1: r.int(2, 9), c2: r.int(2, 9), c3: r.int(2, 9) }; },
            function (s) { return s.rr > Math.max(s.p, s.q) && s.rr < s.p + s.q && s.rr !== 3; });
          var D = s.p + s.q, all = s.p + s.q + 2 + s.rr;
          var expr = s.c1 + u + '^{' + s.p + '}' + w + '^{' + s.q + '}-' + s.c2 + u + w + '+' + s.c3 + w + '^{' + s.rr + '}';
          return KP.mc(r, 'The degree of the polynomial ' + t(expr) + ' is', [
            { html: t(3), code: 'terms-count', why: t(3) + ' is the number of <b>terms</b>. The degree is the largest degree of any one term.' },
            { html: t(s.rr), code: 'max-exp', why: 'That is the largest single exponent. A term with two variables has degree equal to the <b>sum</b> of its exponents: ' + t(u + '^{' + s.p + '}' + w + '^{' + s.q + '}') + ' has degree ' + t(s.p + '+' + s.q) + '.' },
            { html: t(D), right: true },
            { html: t(all), code: 'all-exp', why: 'Don’t add every exponent in the polynomial. Find the degree of each term separately, then take the largest.' }],
            'Degree of each term: ' + t(s.c1 + u + '^{' + s.p + '}' + w + '^{' + s.q + '}') + ' has degree ' + t(s.p + '+' + s.q + '=' + D) + '; ' + t('-' + s.c2 + u + w) + ' has degree ' + t('1+1=2') + '; ' + t(s.c3 + w + '^{' + s.rr + '}') + ' has degree ' + t(s.rr) + '. The largest is ' + t(D) + ', so the degree is <b>' + D + '</b>.',
            ['Find the degree of each term (add the exponents in that term), then take the largest.'], 'degree of ' + expr, true);
        } }] },
      { num: '2', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '2', level: 'EMG', make: function (r) {
          var D = r.pick([4, 4, 5, 6]), m = r.int(2, D - 2), c = r.int(2, 9), d = r.int(2, 9), e = r.int(2, 9), f = r.int(2, 9), g = r.int(2, 9);
          var types = {
            one: c + 'x^{' + D + '}-x',
            higher: d + 'x^{' + D + '}-' + e + 'x^{' + (D + 1) + '}',
            two: 'x^{' + m + '}y^{' + (D - m) + '}+' + f,
            neg: g + 'x^{' + (D - 1) + '}-' + r.int(2, 7) + 'x^{-1}+x^{' + D + '}'
          };
          var roles = r.shuffle(['one', 'higher', 'two', 'neg']), RN = ['I', 'II', 'III', 'IV'], num = {};
          roles.forEach(function (k, i) { num[k] = RN[i]; });
          function setName(keys) { var ns = keys.map(function (k) { return roles.indexOf(k); }).sort().map(function (i) { return RN[i]; }); return ns.length === 1 ? ns[0] + ' only' : ns.length === 4 ? 'I, II, III and IV' : ns.slice(0, -1).join(', ') + ' and ' + ns[ns.length - 1] + ' only'; }
          var list = '<div>' + roles.map(function (k, i) { return '<span style="display:inline-block;margin:4px 18px 4px 0;white-space:nowrap">' + RN[i] + '. ' + t(types[k]) + '</span>'; }).join('') + '</div>';
          return KP.mc(r, 'Which of the following are polynomials of degree ' + t(D) + '?' + list, [
            { html: setName(['one']), code: 'multi-var-deg', why: 'Look again at ' + num.two + ': the degree of ' + t('x^{' + m + '}y^{' + (D - m) + '}') + ' is ' + t(m + '+' + (D - m) + '=' + D) + '.' },
            { html: setName(['one', 'two']), right: true },
            { html: setName(['one', 'two', 'neg']), code: 'neg-exp-poly', why: num.neg + ' has the term with ' + t('x^{-1}') + ': a negative exponent is not allowed, so ' + num.neg + ' is not a polynomial at all.' },
            { html: 'I, II, III and IV', code: 'hidden-higher', why: num.higher + ' contains ' + t('x^{' + (D + 1) + '}') + ' (written second), so its degree is ' + t(D + 1) + '. And ' + num.neg + ' has a negative exponent.' }],
            num.one + ': degree ' + t(D) + ' — yes. ' + num.higher + ': the term ' + t('-' + e + 'x^{' + (D + 1) + '}') + ' makes the degree ' + t(D + 1) + ' — no. ' + num.two + ': ' + t('x^{' + m + '}y^{' + (D - m) + '}') + ' has degree ' + t(m + '+' + (D - m) + '=' + D) + ' — yes. ' + num.neg + ': ' + t('x^{-1}') + ' has a negative exponent, so it is not a polynomial — no.<br>So <b>' + setName(['one', 'two']) + '</b>.',
            ['Check each expression: is it a polynomial (no negative exponents)? What is the degree of its highest-degree term (add exponents within a term)?'], 'degree-' + D + ' polynomials', true);
        } }] },
      { num: '3', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '3', level: 'EMG', make: function (r) {
          var s = pickWhere(function () { return { a: r.int(2, 5), b: r.int(2, 9), c: r.int(1, 9) }; }, function (s) { return s.c !== s.b && s.a !== s.b; });
          var a = s.a, b = s.b, c = s.c;
          return KP.mc(r, 'Which product, when expanded and simplified, has exactly <b>two</b> terms?', [
            { html: t('(' + a + 'x+' + b + ')(' + b + '-' + a + 'x)'), right: true },
            { html: t('(x+' + b + ')^{2}'), code: 'opt-square', why: 'A square of a binomial has a middle term: ' + t('(x+' + b + ')^{2}=x^{2}+' + 2 * b + 'x+' + b * b) + ' — three terms.' },
            { html: t('(x-' + b + ')(x+' + c + ')'), code: 'opt-binom', why: t('(x-' + b + ')(x+' + c + ')=' + tx(Y.mul(lin(1, -b), lin(1, c)))) + ': the middle terms ' + t(tx(mono(-b, 'x'))) + ' and ' + t('+' + tx(mono(c, 'x'))) + ' don’t cancel.' },
            { html: t('(x-' + b + ')(' + b + '-x)'), code: 'opt-trap', why: 'It looks like a sum times a difference, but ' + t('x-' + b) + ' and ' + t(b + '-x') + ' are opposites: ' + t('(x-' + b + ')(' + b + '-x)=' + tx(Y.mul(lin(1, -b), lin(-1, b)))) + ' — three terms.' }],
            t('(' + a + 'x+' + b + ')(' + b + '-' + a + 'x)=(' + b + '+' + a + 'x)(' + b + '-' + a + 'x)=' + (b * b) + '-' + (a * a) + 'x^{2}') + ': a sum times a difference, so the middle terms cancel and <b>two terms</b> remain.<br>The others: ' + t(tx(Y.pow(lin(1, b), 2))) + ', ' + t(tx(Y.mul(lin(1, -b), lin(1, c)))) + ' and ' + t(tx(Y.mul(lin(1, -b), lin(-1, b)))) + ' each have three terms.',
            ['Look for a sum times a difference of the <b>same two terms</b>: ' + t('(A+B)(A-B)=A^{2}-B^{2}') + '. The order inside a bracket doesn’t matter.'], 'two-term product');
        } }] },
      { num: '4', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '4', level: 'EMG', make: function (r) {
          var s = pickWhere(function () { return { p: r.int(2, 6), q: r.int(2, 8), a: r.int(2, 5), b: r.int(1, 5), c: r.int(2, 3), d: r.int(1, 6), e: r.int(2, 7), f: r.int(3, 9), err: r.pick(['sq', 'sq', 'bin', 'fl']) }; },
            function (s) { return s.p !== s.q && s.d !== s.c * s.e && s.a !== s.b; });
          var A = Y.mul(lin(1, -s.p), lin(1, s.q)), B = Y.pow(lin(s.a, -s.b), 2), C = Y.mul(lin(s.c, s.d), lin(1, -s.e)), D = Y.mul(lin(1, s.f), lin(1, -s.f));
          var As = A, Bs = B, Cs = C;
          if (s.err === 'sq') Bs = quad(s.a * s.a, -s.a * s.b, s.b * s.b);
          if (s.err === 'bin') Cs = Y.add(C, mono(2 * s.e * s.c, 'x'));            // outer product sign wrong: +ce x instead of −ce x
          if (s.err === 'fl') As = quad(1, 0, -s.p * s.q);
          var opts = [
            { html: t('(x-' + s.p + ')(x+' + s.q + ')=' + tx(As)), right: s.err === 'fl', code: 'opt-A', why: s.err === 'fl' ? null : 'Check it: ' + t('x^{2}+' + s.q + 'x-' + s.p + 'x-' + s.p * s.q + '=' + tx(A)) + ' — this one is correct.' },
            { html: t('(' + s.a + 'x-' + s.b + ')^{2}=' + tx(Bs)), right: s.err === 'sq', code: 'opt-B', why: s.err === 'sq' ? null : 'Check it: ' + t('(' + s.a + 'x)^{2}-2(' + s.a + 'x)(' + s.b + ')+' + s.b + '^{2}=' + tx(B)) + ' — correct.' },
            { html: t('(' + (s.c === 1 ? '' : s.c) + 'x+' + s.d + ')(x-' + s.e + ')=' + tx(Cs)), right: s.err === 'bin', code: 'opt-C', why: s.err === 'bin' ? null : 'Check it: ' + t(tx(mono(s.c, 'x', 2)) + tx(mono(-s.c * s.e, 'x')) + '+' + s.d + 'x-' + s.d * s.e + '=' + tx(C)) + ' — correct.' },
            { html: t('(x+' + s.f + ')(x-' + s.f + ')=' + tx(D)), code: 'opt-D', why: 'A sum times a difference: ' + t('x^{2}-' + s.f + '^{2}=' + tx(D)) + ' — correct.' }];
          var sol = s.err === 'sq' ? 'The middle term of a square is doubled: ' + t('2(' + s.a + 'x)(-' + s.b + ')=' + tx(mono(-2 * s.a * s.b, 'x'))) + ', so ' + t('(' + s.a + 'x-' + s.b + ')^{2}=' + tx(B)) + ', not ' + t(tx(Bs)) + '.'
            : s.err === 'bin' ? 'Outer and inner: ' + t(tx(mono(-s.c * s.e, 'x')) + '+' + s.d + 'x=' + tx(mono(s.d - s.c * s.e, 'x'))) + ', so the product is ' + t(tx(C)) + ', not ' + t(tx(Cs)) + '.'
              : 'The outer and inner products are missing: ' + t('(x-' + s.p + ')(x+' + s.q + ')=x^{2}+' + s.q + 'x-' + s.p + 'x-' + s.p * s.q + '=' + tx(A)) + '.';
          return KP.mc(r, 'Exactly one of the following expansions is <b>incorrect</b>. Which one?', opts, sol + ' The other three expansions are correct.',
            ['Expand each product yourself (all four partial products), and compare.', 'For a square, remember the middle term is <b>doubled</b>: ' + t('(a-b)^{2}=a^{2}-2ab+b^{2}') + '.'], 'which expansion is incorrect (' + s.err + ')', true);
        } }] },
      { num: '5', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '5', level: 'BEG', make: function (r) {
          var v = r.pick(['k', 'k', 'm', 'n', 't', 'w']), s = pickWhere(function () { return { a: r.int(2, 4), b: r.int(1, 7), c: r.int(2, 8) }; }, function (s) { return s.a * s.c - s.b > 0 && s.a * s.c !== s.b; });
          var a = s.a, b = s.b, c = s.c, R = Y.mul(lin(a, -b, v), lin(1, c, v));
          var mc = polyMC(r, 'The area, in m' + t('^{2}') + ', of a rectangle with length ' + t('(' + a + v + '-' + b + ')') + ' m and width ' + t('(' + v + '+' + c + ')') + ' m is', R, [
            { p: quad(a, 0, -b * c, v), code: 'outer-inner', why: 'You multiplied only the first terms and the last terms. A product of two binomials has four partial products — include the outer and inner ones.' },
            { p: quad(a, a * c + b, -b * c, v), code: 'added-middle', why: 'Check the inner product: ' + t('(-' + b + ')(' + v + ')=' + tx(mono(-b, v))) + ', so the middle term is ' + t(Y.seq([mono(a * c, v), mono(-b, v)])) + '.' },
            { p: quad(a, a * c - b, b * c, v), code: 'const-sign', why: 'Check the constant: ' + t('(-' + b + ')(' + c + ')=-' + b * c) + '.' }],
            t('(' + a + v + '-' + b + ')(' + v + '+' + c + ')=' + Y.seq([mono(a, v, 2), mono(a * c, v), mono(-b, v), Y.num(-b * c)]) + '=' + tx(R)) + '.',
            ['Area = length × width. Multiply every term of the first binomial by every term of the second.'], 'area (' + a + v + '-' + b + ')(' + v + '+' + c + ')');
          return mc;
        } }] },
      { num: '6', stem: '<i>(Multiple Choice)</i> <i>Use the following diagram.</i>', parts: [
        { id: '6', level: 'EMG', make: function (r) {
          var s = pickWhere(function () { return { a: r.pick([2, 2, 3]), b: r.int(1, 9), c: r.int(3, 9), d: r.int(1, 6) }; }, function (s) { return s.d < s.c && s.b * s.c - s.d * s.d > 0 && s.a * s.c + s.b - 2 * s.d > 0; });
          var L = lin(s.a, s.b), Wd = lin(1, s.c), S = lin(1, s.d), card = Y.mul(L, Wd), photo = Y.pow(S, 2), R = Y.sub(card, photo);
          var mc = polyMC(r, 'A square photo with side length ' + t(bt(S)) + ' cm is glued onto a rectangular card that is ' + t(bt(L)) + ' cm long and ' + t(bt(Wd)) + ' cm wide.' + cardSvg(L, Wd, S) +
            'The area of the card, in cm' + t('^{2}') + ', that is <b>not</b> covered by the photo is', R, [
            { p: Y.add(Y.sub(card, photo), Y.num(2 * s.d * s.d)), code: 'sub-sign', why: 'When you subtract the photo’s area, change the sign of <b>every</b> term: ' + t('-(' + tx(photo) + ')=' + tx(Y.neg(photo))) + '.' },
            { p: Y.sub(card, quad(1, 0, s.d * s.d)), code: 'photo-square', why: t(bt(S) + '^{2}') + ' is not ' + t('x^{2}+' + s.d * s.d) + ': a square of a binomial has a middle term, ' + t(bt(S) + '^{2}=' + tx(photo)) + '.' },
            { p: Y.add(card, photo), code: 'added-areas', why: 'The uncovered part is the card <b>minus</b> the photo, not card plus photo.' }],
            'Card: ' + t(bt(L) + bt(Wd) + '=' + tx(card)) + '.<br>Photo: ' + t(bt(S) + '^{2}=' + tx(photo)) + '.<br>Not covered: ' + t('(' + tx(card) + ')-(' + tx(photo) + ')=' + tx(R)) + '.',
            ['Uncovered area = area of the card − area of the photo.'], 'card minus photo');
          return mc;
        } }] },
      { num: '7', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '7', level: 'EMG', make: function (r) {
          var s = pickWhere(function () { return { p: r.pick([2, 2, 3]), q: r.int(-3, -1), u: r.int(1, 5), w: r.int(-5, -1) }; }, function (s) {
            var R = Y.mul(lin(s.p, s.q, 'a'), lin(1, s.u, 'a'), lin(1, s.w, 'a')); return Y.count(R) === 4 && s.u + s.w !== 0;
          });
          var A = lin(s.p, s.q, 'a'), B1 = lin(1, s.u, 'a'), B2 = lin(1, s.w, 'a'), mid = Y.mul(B1, B2), R = Y.mul(A, mid);
          var c2 = cf(R, 'a', 2), cst = cf(R, 'a', 0);
          return polyMC(r, 'Expand ' + t(bt(A) + bt(B1) + bt(B2)) + '.', R, [
            { p: Y.add(mono(s.p, 'a', 3), Y.num(s.q * s.u * s.w)), code: 'fl-only', why: 'That multiplies only the first terms and the last terms. Multiply two of the brackets first, then multiply every term of that result by the third.' },
            { p: Y.add(R, mono(-2 * s.q, 'a', 2)), code: 'opt-a2', why: 'Check the ' + t('a^{2}') + ' terms: ' + t(par(s.q) + '\\times a^{2}=' + tx(mono(s.q, 'a', 2))) + ' (watch the sign).' },
            { p: Y.add(R, Y.num(-2 * cst)), code: 'const-sign', why: 'Check the constant: ' + t(par(s.q) + '\\times' + par(s.u) + '\\times' + par(s.w) + '=' + cst) + '.' }],
            t(bt(B1) + bt(B2) + '=' + tx(mid)) + '.<br>' + t(bt(A) + '(' + tx(mid) + ')=' + tx(Y.mul(mono(s.p, 'a'), mid)) + tx(Y.mul(Y.num(s.q), mid)) + '=' + tx(R)) + '.',
            ['Multiply two of the binomials first, then multiply that trinomial by the third binomial.'], 'expand three binomials');
        } }] },
      { num: '8', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '8', level: 'EMG', make: function (r) {
          var s = q8Work(r), pTex = (s.p < 0 ? '' : '+') + s.p;
          var work = '\\[\\begin{array}{ll}(x' + pTex + ')\\left(' + tx(s.T) + '\\right) & \\\\ =' + s.l1 + ' & \\text{Line 1}\\\\ =' + s.l2 + ' & \\text{Line 2}\\\\ =' + s.l3 + ' & \\text{Line 3}\\end{array}\\]';
          var good = {
            1: 'Line 1 splits ' + t('(x' + pTex + ')') + ' into ' + t('x') + ' and ' + t(par(s.p)) + ' and multiplies each by the trinomial' + (s.err === 1 ? '' : ' — that is correct') + '.',
            2: 'Check each product in Line 2 against Line 1' + (s.err === 2 ? '' : ' — they are all correct') + '.',
            3: 'Collect the like terms of Line 2 yourself and compare' + (s.err === 3 ? '' : ' — Line 3 matches') + '.'
          };
          var opts = [1, 2, 3].map(function (n) { return { html: 'The student made an error in Line ' + n + '.', right: s.err === n, code: 'line' + n, why: s.err === n ? null : good[n] }; });
          opts.push({ html: 'The student’s expansion is correct.', right: s.err === 0, code: 'line0', why: s.err === 0 ? null : 'Expand it yourself: ' + t('(x' + pTex + ')\\left(' + tx(s.T) + '\\right)=' + tx(s.correct)) + '.' });
          var sol = s.err === 1 ? 'Line 1 should be ' + t('x\\left(' + tx(s.T) + '\\right)' + (s.p < 0 ? '-' + (-s.p) : '+' + s.p) + '\\left(' + tx(s.T) + '\\right)') + ': the student changed the sign of ' + t(par(s.p)) + '. The correct result is ' + t(tx(s.correct)) + '.'
            : s.err === 2 ? 'Line 2: ' + t(par(s.p) + '\\times' + par(s.c) + '=' + s.p * s.c) + ', not ' + t(-s.p * s.c) + '. The correct result is ' + t(tx(s.correct)) + '.'
              : s.err === 3 ? 'Lines 1 and 2 are correct. Line 3: the ' + t('x') + ' terms are ' + t(tx(mono(s.c, 'x')) + (s.p * s.b < 0 ? '' : '+') + tx(mono(s.p * s.b, 'x')) + '=' + tx(mono(s.c + s.p * s.b, 'x'))) + ', not ' + t(tx(mono(s.c + s.p * s.b - 2 * s.c, 'x'))) + '. The correct result is ' + t(tx(s.correct)) + '.'
                : 'Every line is correct: ' + t('(x' + pTex + ')\\left(' + tx(s.T) + '\\right)=' + tx(s.correct)) + '.';
          return KP.mc(r, 'A student expands ' + t('(x' + pTex + ')\\left(' + tx(s.T) + '\\right)') + '. Her work is shown below.' + work + 'Which of the following statements is true?', opts, sol,
            ['Check each line against the line before it: the distributing in Line 1, each of the six products in Line 2, then the collecting in Line 3.'], 'error line (' + s.err + ')', true);
        } }] },
      { num: '9', section: 'Part B — Numerical Response', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '9', level: 'PRG', make: function (r) {
          var s = pickWhere(function () { return { p: nz(r, -6, 6), q: r.int(2, 9) }; }, function (s) { return Math.abs(s.p) >= 2 && Math.abs(s.p) !== s.q && (r.chance(0.7) ? s.p > 0 : true); });
          var p = s.p, q = s.q, a = 2 * p, b = p * p + q * q, ans = a + b, sq = tx(lin(1, p));
          return KP.nr('When ' + t('(' + sq + ')^{2}-(x+' + q + ')(x-' + q + ')') + ' is expanded and simplified, it can be written in the form ' + t('ax+b') + '. The value of ' + t('a+b') + ' is ________.', ans,
            numDiag([[p * p + q * q, 'no-middle', 'Did you include the middle term? ' + t('(' + sq + ')^{2}=x^{2}' + (p < 0 ? '-' : '+') + Math.abs(2 * p) + 'x+' + p * p) + ' — that gives ' + t('a') + '.'],
              [2 * p + p * p - q * q, 'dos-sign', 'Check the sign: subtracting ' + t('(x^{2}-' + q * q + ')') + ' gives ' + t('-x^{2}+' + q * q) + '.'],
              [a, 'only-a', 'That is ' + t('a') + '. The question asks for ' + t('a+b') + '.'], [b, 'only-a', 'That is ' + t('b') + '. The question asks for ' + t('a+b') + '.']]),
            t('(' + sq + ')^{2}=' + tx(Y.pow(lin(1, p), 2))) + ' and ' + t('(x+' + q + ')(x-' + q + ')=x^{2}-' + q * q) + '.<br>' + t('(' + tx(Y.pow(lin(1, p), 2)) + ')-(x^{2}-' + q * q + ')=' + tx(lin(a, b))) + ', so ' + t('a=' + a) + ', ' + t('b=' + b) + ' and ' + t('a+b=' + ans) + '.',
            ['Expand the square (it has a middle term) and the sum-times-difference separately, then subtract.'], 'a+b for square minus difference of squares');
        } }] },
      { num: '10', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '10', level: 'EMG', make: function (r) {
          var s = pickWhere(function () { return { L: 2 * r.int(8, 15), W: 2 * r.int(5, 9), x: r.int(2, 4) }; }, function (s) { return s.W < s.L && s.W - 2 * s.x >= 4 && s.x * (s.L - 2 * s.x) * (s.W - 2 * s.x) <= 9999; });
          var l = s.L - 2 * s.x, w = s.W - 2 * s.x, V = s.x * l * w;
          return KP.nr('A sheet of cardboard measures ' + t(s.L) + ' cm by ' + t(s.W) + ' cm. A square of side ' + t('x') + ' cm is cut from each corner, and the sides are folded up to make an open box.' + netSvg(s.L, s.W) + 'When ' + t('x=' + s.x) + ', the volume of the box, in cm' + t('^{3}') + ', is ________.', V,
            numDiag([[s.x * (s.L - s.x) * (s.W - s.x), 'box-dims', 'A square is cut from <b>both</b> ends of each side, so the length is ' + t(s.L + '-2x') + ', not ' + t(s.L + '-x') + '.'], [l * w, 'no-height', 'That is the area of the base. The height of the box is ' + t('x') + ' — multiply by it too.']]),
            'Length ' + t('=' + s.L + '-2x') + ', width ' + t('=' + s.W + '-2x') + ', height ' + t('=x') + ', so ' + t('V=x(' + s.L + '-2x)(' + s.W + '-2x)') + '.<br>At ' + t('x=' + s.x) + ': ' + t('V=' + s.x + '\\times' + l + '\\times' + w + '=' + F(V)) + ' cm' + t('^{3}') + '.',
            ['After folding, how long is the base? A square comes off each end of the side.', 'Volume = length × width × height, and the height is the side of the cut square.'], 'open box volume');
        } }] },
      { num: '11', section: 'Part C — Written Response',
        shared: function (r) {
          var A = pickWhere(function () { return { a: r.int(2, 5), b: -r.int(1, 7), c: r.int(2, 5), d: r.int(1, 7) }; }, function (s) { return s.a * s.d + s.b * s.c !== 0 && s.a !== s.c && gcd(s.a, -s.b) === 1 && gcd(s.c, s.d) === 1; });
          var B = pickWhere(function () { return { p: r.int(2, 4), q: -r.int(1, 5), u: nz(r, -5, 5), w: nz(r, -6, 6), v: r.pick([2, 2, 3, -1]) }; }, function (s) {
            var R = Y.mul(lin(s.p, s.q), quad(1, s.u, s.w)); return Y.count(R) === 4 && Y.at(R, { x: s.v }) !== 0 && Math.abs(s.u) !== 1 && gcd(s.p, -s.q) === 1;
          });
          return { A: A, B: B };
        },
        stem: '<i>(Written Response)</i>', parts: [
          { id: '11a', level: 'PRG', make: function (r, sh) {
            var s = sh.A, X1 = lin(s.a, s.b), X2 = lin(s.c, s.d), R = Y.mul(X1, X2);
            return poly('Expand and simplify ' + t(bt(X1) + bt(X2)) + '.', R, { wrong: [
              { is: quad(s.a * s.c, 0, s.b * s.d), code: 'fl-only', hint: 'You multiplied the first terms and the last terms only. Include the outer and inner products too.' },
              { is: quad(s.a * s.c, s.a * s.d - s.b * s.c, s.b * s.d), code: 'added-middle', hint: 'Check the inner product: ' + t(par(s.b) + '\\times ' + s.c + 'x=' + tx(mono(s.b * s.c, 'x'))) + '.' }] },
              'F: ' + t(tx(mono(s.a * s.c, 'x', 2))) + ', O: ' + t(tx(mono(s.a * s.d, 'x'))) + ', I: ' + t(tx(mono(s.b * s.c, 'x'))) + ', L: ' + t(s.b * s.d) + '.<br>' + t('=' + Y.seq([mono(s.a * s.c, 'x', 2), mono(s.a * s.d, 'x'), mono(s.b * s.c, 'x'), Y.num(s.b * s.d)]) + '=' + tx(R)),
              ['Multiply each term of the first binomial by each term of the second (four products), then collect the ' + t('x') + ' terms.'], 'expand ' + tx(X1) + ' × ' + tx(X2));
          } },
          { id: '11b', level: 'PRG', make: function (r, sh) {
            var s = sh.B, X1 = lin(s.p, s.q), T = quad(1, s.u, s.w), R = Y.mul(X1, T), A1 = Y.mul(mono(s.p, 'x'), T), A2 = Y.mul(Y.num(s.q), T);
            return poly('Expand and simplify ' + t(bt(X1) + '\\left(' + tx(T) + '\\right)') + '.', R, { wrong: [
              { is: Y.add(mono(s.p, 'x', 3), Y.num(s.q * s.w)), code: 'fl-only', hint: 'Every term of the binomial multiplies <b>every</b> term of the trinomial — six products in all.' },
              { is: Y.add(A1, Y.num(s.q)), code: 'q-not-mult', hint: 'The ' + t(par(s.q)) + ' must multiply each term of the trinomial too: ' + t(par(s.q) + '\\left(' + tx(T) + '\\right)') + '.' },
              { is: Y.sub(A1, A2), code: 'sub-sign', hint: 'Watch the signs when you multiply by ' + t(par(s.q)) + ': ' + t(par(s.q) + '\\left(' + tx(T) + '\\right)=' + tx(A2)) + '.' }] },
              t('=' + s.p + 'x\\left(' + tx(T) + '\\right)' + s.q + '\\left(' + tx(T) + '\\right)') + '<br>' + t('=' + tx(A1) + (cf(A2, 'x', 2) < 0 ? '' : '+') + Y.tex(A2)) + '<br>' + t('=' + tx(R)),
              ['Multiply ' + t(s.p + 'x') + ' by each term of the trinomial, then ' + t(par(s.q)) + ' by each term, then collect like terms.'], 'expand binomial × trinomial');
          } },
          { id: '11c', level: 'BEG', make: function (r, sh) {
            var s = sh.B, X1 = lin(s.p, s.q), T = quad(1, s.u, s.w), R = Y.mul(X1, T), v = s.v, L1 = Y.at(X1, { x: v }), L2 = Y.at(T, { x: v }), val = L1 * L2;
            var terms = Y.sorted(R, { order: 'desc' }).map(function (T1) { var e = T1.v.x || 0, c = T1.c[0]; return (c < 0 ? '-' : '+') + (e && Math.abs(c) === 1 ? '' : Math.abs(c)) + (e ? '(' + v + ')' + (e > 1 ? '^{' + e + '}' : '') : ''); }).join('').replace(/^\+/, '');
            return KP.number('Verify your answer to (b), the expansion of ' + t(bt(X1) + '\\left(' + tx(T) + '\\right)') + ', by substituting ' + t('x=' + v) + ' into both the original product and your expansion. What value do both sides give?', val,
              numDiag([[L1, 'only-a', 'That is just the value of ' + t(bt(X1)) + '. Multiply it by the value of the trinomial.'], [L2, 'only-a', 'That is just the value of the trinomial. Multiply it by the value of ' + t(bt(X1)) + '.']]),
              'Original: ' + t('(' + s.p + '(' + v + ')' + s.q + ')\\left((' + v + ')^{2}' + (s.u < 0 ? '' : '+') + s.u + '(' + v + ')' + (s.w < 0 ? '' : '+') + s.w + '\\right)=(' + L1 + ')(' + L2 + ')=' + val) + '.<br>Expansion: ' + t(terms + '=' + val) + '.<br>Both sides give ' + t(val) + ', so the expansion checks out.',
              ['Replace every ' + t('x') + ' with ' + t(par(v)) + ' in the original product and work it out.'], 'check at x = ' + v);
          } }] },
      { num: '12', stem: function (sh) {
          var top = tokens(sh.a, 'x').concat(tokens(sh.b, '1')), side = ['x'].concat(tokens(sh.c, '1'));
          return '<i>(Written Response)</i> The factor tiles for a product are shown across the top and down the side of the frame.' + HW.tiles.legend() + HW.tiles.frame(top, side);
        },
        shared: function (r) { return tilesQ12(r); },
        parts: [
          { id: '12a', level: 'BEG', make: function (r, sh) {
            var top = lin(sh.a, sh.b), side = lin(1, sh.c), fl = [{ name: 'Top', label: 'across the top', mode: 'math', keys: 'poly', vars: ['x'] }, { name: 'Side', label: 'down the side', mode: 'math', keys: 'poly', vars: ['x'] }];
            var p = KP.fields('State the two factors.', fl, [], [tx(top), tx(side)], t(bt(top)) + ' and ' + t(bt(side)),
              'Top: ' + t(sh.a) + ' shaded ' + t('x') + '-tile' + (sh.a > 1 ? 's' : '') + ' and ' + t(Math.abs(sh.b)) + ' ' + (sh.b < 0 ? 'unshaded' : 'shaded') + ' unit tile' + (Math.abs(sh.b) > 1 ? 's' : '') + ', so ' + t(tx(top)) + '.<br>Side: one shaded ' + t('x') + '-tile and ' + t(Math.abs(sh.c)) + ' ' + (sh.c < 0 ? 'unshaded' : 'shaded') + ' unit tile' + (Math.abs(sh.c) > 1 ? 's' : '') + ', so ' + t(tx(side)) + '.',
              ['Count the long thin tiles (' + t('x') + '-tiles) and the small squares (unit tiles) along each edge. Unshaded tiles are negative.'], 'tile factors');
            p.check = pairCheck(top, side, { labels: ['Top', 'Side'], ordered: true, swapHint: 'Those are the two factors — but the top factor goes in the first box and the side factor in the second.', diag: function (A, B) {
              var tops = [top, side];
              if ([lin(sh.a, -sh.b), lin(1, -sh.c)].some(function (w) { return Y.eq(A, w) || Y.eq(B, w); })) return { code: 'tile-sign', hint: 'Check the signs of the unit tiles: <b>shaded</b> is positive, <b>white</b> is negative.' };
              if (!tops.some(function (w) { return Y.eq(A, w); }) || !tops.some(function (w) { return Y.eq(B, w); })) return { code: 'tile-count', hint: 'Count the tiles again: each long strip is ' + t('x') + ', each small square is ' + t('1') + ' (or ' + t('-1') + ' if white).' };
              return null;
            } });
            p.bad = [[tx(lin(sh.a, -sh.b)), tx(side)], [tx(top), tx(lin(1, -sh.c))]];
            return p;
          } },
          { id: '12b', level: 'EMG', make: function (r, sh) {
            var top = lin(sh.a, sh.b), side = lin(1, sh.c), R = Y.mul(top, side), xs = sh.a * sh.c, us = sh.b;
            var topT = tokens(sh.a, 'x').concat(tokens(sh.b, '1')), sideT = ['x'].concat(tokens(sh.c, '1'));
            var pos = (xs > 0 ? xs : 0) + (us > 0 ? us : 0), neg = (xs < 0 ? -xs : 0) + (us < 0 ? -us : 0), zp = Math.min(pos, neg);
            return poly('Complete the tile rectangle using the shading rule, and state the product, simplified.', R, { wrong: [
              { is: Y.mul(lin(sh.a, Math.abs(sh.b)), lin(1, Math.abs(sh.c))), code: 'tile-sign', hint: 'Some tiles are white (negative). Use the shading rule: same colours give a shaded (positive) tile, different colours give a white (negative) tile.' },
              { is: quad(sh.a, pos + neg, sh.b * sh.c), code: 'no-zero-pairs', hint: 'A shaded ' + t('x') + '-tile and a white ' + t('x') + '-tile make a zero pair — they cancel. Count shaded minus white.' },
              { is: quad(sh.a, -(pos + neg), sh.b * sh.c), code: 'no-zero-pairs', hint: 'A shaded ' + t('x') + '-tile and a white ' + t('x') + '-tile make a zero pair — they cancel. Count shaded minus white.' }] },
              HW.tiles.frame(topT, sideT, { fill: true }) + 'Inside: ' + t(sh.a) + ' ' + t('x^{2}') + '-tile' + (sh.a > 1 ? 's' : '') + ', ' + t(pos) + ' shaded and ' + t(neg) + ' white ' + t('x') + '-tiles, and ' + t(Math.abs(sh.b * sh.c)) + ' white unit tiles. ' + t(zp) + ' zero pair' + (zp > 1 ? 's' : '') + ' of ' + t('x') + '-tiles cancel' + (zp > 1 ? '' : 's') + '.<br>' + t(bt(top) + bt(side) + '=' + Y.seq([mono(sh.a, 'x', 2), mono(xs, 'x'), mono(us, 'x'), Y.num(sh.b * sh.c)]) + '=' + tx(R)),
              ['Each product tile is (top tile) × (side tile). Same colours → shaded (+), different colours → white (−).', 'Then cancel zero pairs and count what is left.'], 'tile product');
          } },
          { id: '12c', level: 'EMG', make: function (r, sh) {
            var xs = sh.a * sh.c, us = sh.b, pos = (xs > 0 ? xs : 0) + (us > 0 ? us : 0), neg = (xs < 0 ? -xs : 0) + (us < 0 ? -us : 0), zp = Math.min(pos, neg), left = pos - neg;
            var leftTxt = t(Math.abs(left)) + ' ' + (left > 0 ? 'shaded' : 'white') + ' ' + t('x') + '-tile' + (Math.abs(left) > 1 ? 's' : '') + ' (' + t(tx(mono(left, 'x'))) + ')';
            return KP.mc(r, 'How are zero pairs used to simplify the product?', [
              { html: 'Each shaded ' + t('x') + '-tile paired with a white ' + t('x') + '-tile makes ' + t('0') + ', so ' + t(zp) + ' pair' + (zp > 1 ? 's are' : ' is') + ' removed, leaving ' + leftTxt + '.', right: true },
              { html: 'The unit tiles form zero pairs with the ' + t('x') + '-tiles, so the constant term is ' + t('0') + '.', code: 'zp-units', why: 'A zero pair is two tiles of the <b>same size</b> with opposite colours. A unit tile and an ' + t('x') + '-tile can’t cancel.' },
              { html: 'An ' + t('x^{2}') + '-tile and a white ' + t('x') + '-tile form a zero pair, so the ' + t('x^{2}') + ' term gets smaller.', code: 'zp-x2', why: 'Only tiles of the same size and opposite colours cancel. ' + t('x^{2}') + ' and ' + t('x') + ' are not like terms.' },
              { html: 'The factor tiles across the top and down the side cancel each other, so they are not counted.', code: 'zp-frame', why: 'The factor tiles are the dimensions, not part of the product. Zero pairs are formed <b>inside</b> the rectangle.' }],
              'Inside the rectangle there are ' + t(pos) + ' shaded and ' + t(neg) + ' white ' + t('x') + '-tiles. A shaded and a white ' + t('x') + '-tile add to ' + t('0') + ', so ' + t(zp) + ' zero pair' + (zp > 1 ? 's are' : ' is') + ' removed, leaving ' + leftTxt + '.',
              ['A zero pair is a positive and a negative tile of the same size.'], 'zero pairs in tile product');
          } }] },
      { num: '13', section: 'Part D — Extension (not part of the core Math 10C review)', stem: '<i>(Extension)</i> <i>(Numerical Response)</i>', parts: [
        { id: '13', level: 'MAS', make: function (r) {
          var p = r.int(3, 12), q = r.int(1, 9), c = p * p + q, T = quad(1, -2 * p, c);
          var fl = [{ name: 'p', label: t('p'), mode: 'number' }, { name: 'q', label: t('q'), mode: 'number' }];
          return KP.fields('The trinomial ' + t(tx(T)) + ' can be expressed in the form ' + t('(x-p)^{2}+q') + '. Find the values of ' + t('p') + ' and ' + t('q') + '.', fl, [
            K.number(p, numDiag([[-p, 'cs-sign', 'In ' + t('(x-p)^{2}') + ' the middle term is ' + t('-2px') + '. Match it with ' + t(tx(mono(-2 * p, 'x'))) + ': ' + t('p') + ' is positive.'], [2 * p, 'cs-half', t('(x-p)^{2}=x^{2}-2px+p^{2}') + ': the ' + t('x') + '-coefficient is <b>twice</b> ' + t('p') + ', so halve it.']])),
            K.number(q, numDiag([[c, 'cs-q', t('(x-' + p + ')^{2}') + ' already supplies the constant ' + t(p * p) + '. ' + t('q') + ' is what is left over.'], [c - p, 'cs-q', 'Square ' + t('p') + ': ' + t('(x-' + p + ')^{2}') + ' has constant ' + t(p + '^{2}=' + p * p) + '.'], [c + p * p, 'cs-q', 'Subtract ' + t(p * p) + ' from ' + t(c) + ' (don’t add).']]))],
            [String(p), String(q)], t('p=' + p) + ', ' + t('q=' + q),
            'Half of ' + t(-2 * p) + ' is ' + t(-p) + ', so ' + t('p=' + p) + ': ' + t('(x-' + p + ')^{2}=x^{2}-' + 2 * p + 'x+' + p * p) + '.<br>' + t(tx(T) + '=(x^{2}-' + 2 * p + 'x+' + p * p + ')+' + q) + ', so ' + t(tx(T) + '=(x-' + p + ')^{2}+' + q) + ' and ' + t('q=' + q) + '.',
            ['Expand ' + t('(x-p)^{2}+q') + ' and match it term by term with ' + t(tx(T)) + '.', 'The ' + t('x') + ' terms give ' + t('-2p=' + (-2 * p)) + '.'], 'complete the square ' + tx(T));
        } }] }
    ],
    extra: [
      { num: '1', section: 'Extra practice A — Vocabulary and structure',
        shared: function (r) { return pickWhere(function () { return { A: r.int(2, 5), C: nz(r, -7, 7), m: r.pick([1, 1, 2, -1, -2, 3]), d: r.int(2, 3), e: nz(r, -9, 9) }; }, function (s) { return Math.abs(s.C) >= 2 && Math.abs(s.e) >= 2 && s.C * s.e !== 0; }); },
        stem: function (sh) { return 'A polynomial’s <b>degree</b>, <b>leading coefficient</b> and <b>constant term</b> can be predicted for a product <i>before</i> the product is expanded. Let ' + t('Q=' + tx(lin(sh.d, sh.e))) + '.'; },
        parts: [
          { id: 'e1a', level: 'BEG', make: function (r, sh) { return exampleTri(sh.A, sh.C); } },
          { id: 'e1b', level: 'EMG', make: function (r, sh) {
            var A = sh.A, C = sh.C, d = sh.d, e = sh.e, fl = [{ name: 'Degree', label: 'degree of ' + t('PQ') }, { name: 'Leading coefficient', label: 'leading coefficient of ' + t('PQ') }, { name: 'Constant term', label: 'constant term of ' + t('PQ') }];
            return KP.fields('Let ' + t('P') + ' be a trinomial of degree ' + t(2) + ' with leading coefficient ' + t(A) + ' and constant term ' + t(C) + '. <b>Predict</b> the degree, leading coefficient and constant term of the product ' + t('PQ') + ' without expanding.', fl,
              [K.number(3, numDiag([[2, 'deg-wrong', 'Degrees <b>add</b> when you multiply: ' + t('2+1') + '.'], [4, 'deg-wrong', 'Degrees add when you multiply: ' + t('2+1') + ', not ' + t('2\\times 2') + '.']])),
                K.number(A * d, numDiag([[A + d, 'lead-add', 'The leading term of the product is (leading term of ' + t('P') + ') × (leading term of ' + t('Q') + '): the coefficients <b>multiply</b>.']])),
                K.number(C * e, numDiag([[C + e, 'const-add', 'The constant term is (constant of ' + t('P') + ') × (constant of ' + t('Q') + '): multiply, don’t add.'], [-C * e, 'const-sign', 'Check the sign: ' + t(par(C) + '\\times' + par(e)) + '.']]))],
              ['3', String(A * d), String(C * e)], 'degree ' + t(3) + ', leading coefficient ' + t(A * d) + ', constant term ' + t(C * e),
              t('Q=' + tx(lin(d, e))) + ' has degree ' + t(1) + ', leading coefficient ' + t(d) + ' and constant term ' + t(e) + '.<br>Degree of ' + t('PQ') + ': ' + t('2+1=3') + ' (only ' + t(A + 'x^{2}\\times ' + d + 'x') + ' reaches degree 3).<br>Leading coefficient: ' + t(A + '\\times ' + d + '=' + A * d) + '.<br>Constant term: ' + t(par(C) + '\\times' + par(e) + '=' + C * e) + '.',
              ['The highest-degree term of the product comes only from (leading term) × (leading term); the constant comes only from (constant) × (constant).'], 'predict features of PQ');
          } },
          { id: 'e1c', level: 'PRG', make: function (r, sh) {
            var Pp = quad(sh.A, sh.m, sh.C), Q = lin(sh.d, sh.e), R = Y.mul(Pp, Q);
            return poly('Take ' + t('P=' + tx(Pp)) + '. Expand ' + t('PQ=\\left(' + tx(Pp) + '\\right)' + bt(Q)) + ' and write the answer in descending order.', R, { order: 'desc', var: 'x', wrong: [
              { is: Y.add(mono(sh.A * sh.d, 'x', 3), Y.num(sh.C * sh.e)), code: 'fl-only', hint: 'Every term of ' + t('P') + ' multiplies every term of ' + t('Q') + ': six products in all.' }] },
              t('=' + sh.A + 'x^{2}' + bt(Q) + (sh.m < 0 ? '' : '+') + tx(mono(sh.m, 'x')) + bt(Q) + (sh.C < 0 ? '' : '+') + sh.C + bt(Q)) + '<br>' + t('=' + tx(Y.mul(mono(sh.A, 'x', 2), Q)) + plusTex(Y.mul(mono(sh.m, 'x'), Q)) + plusTex(Y.mul(Y.num(sh.C), Q))) + '<br>' + t('=' + tx(R)) + '<br>Degree ' + t(3) + ', leading coefficient ' + t(sh.A * sh.d) + ', constant term ' + t(sh.C * sh.e) + ' — as predicted.',
              ['Multiply each term of the trinomial by ' + t(bt(Q)) + ', then collect like terms.'], 'expand PQ');
          } },
          { id: 'e1d', level: 'EMG', make: function (r, sh) {
            return KP.mc(r, 'Only one of the six partial products of ' + t('PQ') + ' lands in the constant term. Which one, and why can no other partial product ever land there?', [
              { html: 'Constant × constant. Every other partial product has at least one factor containing ' + t('x') + ', and exponents add, so its degree is at least ' + t(1) + '.', right: true },
              { html: 'Leading term × leading term, because the biggest terms always decide the constant.', code: 'opt-lead', why: 'Leading × leading gives the <b>highest</b>-degree term, ' + t(sh.A * sh.d + 'x^{3}') + ' — not the constant.' },
              { html: 'Constant × constant, but an ' + t('x') + '-term × ' + t('x') + '-term can also give a constant when the signs cancel.', code: 'opt-xx', why: t('x\\cdot x=x^{2}') + ': exponents add, so a product of two ' + t('x') + '-terms is never a constant. Signs change the coefficient, not the degree.' },
              { html: 'Any partial product with a negative coefficient, since those are subtracted at the end.', code: 'opt-neg', why: 'The sign of a coefficient doesn’t decide whether a term is a constant — its degree does.' }],
              'The constant term comes only from ' + t('(\\text{constant})\\times(\\text{constant})=' + par(sh.C) + '\\times' + par(sh.e) + '=' + sh.C * sh.e) + '. Every other partial product uses ' + t(sh.A + 'x^{2}') + ', an ' + t('x') + '-term or ' + t(sh.d + 'x') + ', and since exponents add, it has degree at least ' + t(1) + '.',
              ['Which partial products have no ' + t('x') + ' in them at all?'], 'constant term partial product');
          } }] },
      { num: '2', stem: '<b>Audit each product without fully expanding it where you can.</b> Give the degree of the simplified product, how many terms it has once simplified, and its leading coefficient.', parts: [
        { id: 'e2a', level: 'EMG', make: function (r) { var a = r.int(2, 5), b = r.int(1, 9); return auditPart(Y.mul(lin(a, -b), lin(a, b)), '(' + a + 'x-' + b + ')(' + a + 'x+' + b + ')', 'A sum times a difference: ' + t('(' + a + 'x)^{2}-' + b + '^{2}=' + tx(quad(a * a, 0, -b * b))) + '. The middle terms cancel.', [[3, 'cancel-missed', 'It’s a sum times a difference: the middle terms cancel.'], [4, 'cancel-missed', 'It’s a sum times a difference: the middle terms cancel.']]); } },
        { id: 'e2b', level: 'EMG', make: function (r) {
          var s = pickWhere(function () { return { p: nz(r, -5, 5), q: nz(r, -6, 6), w: nz(r, -5, 5) }; }, function (s) { return s.p + s.w !== 0; });
          var A = Y.add(mono(1, 'x', 2), Y.num(s.p)), B = quad(1, s.q, s.w), R = Y.mul(A, B);
          return auditPart(R, bt(A) + '\\left(' + tx(B) + '\\right)', t('=' + tx(Y.mul(mono(1, 'x', 2), B)) + plusTex(Y.mul(Y.num(s.p), B)) + '=' + tx(R)) + '. Six partial products; only the two ' + t('x^{2}') + ' terms collect.', [[6, 'cancel-missed', 'There are six partial products, but two of them are like terms (' + t('x^{2}') + ') and collect.']]);
        } },
        { id: 'e2c', level: 'PRG', make: function (r) {
          var a = r.int(2, 5), b = r.int(1, 6), S = Y.pow(lin(a, -b), 2), R = Y.sub(S, mono(a * a, 'x', 2));
          return auditPart(R, '(' + a + 'x-' + b + ')^{2}-' + a * a + 'x^{2}', t('(' + a + 'x-' + b + ')^{2}=' + tx(S)) + ', and subtracting ' + t(a * a + 'x^{2}') + ' cancels the ' + t('x^{2}') + ' term: ' + t(tx(R)) + '. The degree <b>drops</b> to ' + t(1) + '.', [[3, 'cancel-missed', 'The ' + t('x^{2}') + ' terms cancel.']], [[2, 'deg-wrong', 'Expand first: the ' + t(a * a + 'x^{2}') + ' terms cancel, so the degree drops.']], [[a * a, 'cancel-missed', 'The ' + t('x^{2}') + ' terms cancel. What is the highest-degree term left?']]);
        } },
        { id: 'e2d', level: 'PRG', make: function (r) {
          var p = r.int(1, 4), rr = r.int(1, 4), q = p + rr, R = Y.mul(lin(1, p), lin(1, -q), lin(1, rr));
          return auditPart(R, '(x+' + p + ')(x-' + q + ')(x+' + rr + ')', t('(x+' + p + ')(x-' + q + ')=' + tx(Y.mul(lin(1, p), lin(1, -q)))) + ', then ' + t('\\left(' + tx(Y.mul(lin(1, p), lin(1, -q))) + '\\right)(x+' + rr + ')=' + tx(R)) + '. The ' + t('x^{2}') + ' terms cancel, leaving only three terms.', [[4, 'cancel-missed', 'Expand it: the ' + t('x^{2}') + ' terms cancel.']]);
        } },
        { id: 'e2e', level: 'EMG', make: function (r) {
          var c = r.int(2, 5), a = r.int(2, 4), d = r.int(2, 5), f = r.int(2, 5), M = Y.mono(-c, { x: a, y: 1 }), B = Y.add(Y.mono(d, { x: 1, y: 2 }), Y.mono(-f, { x: 2 })), R = Y.mul(M, B);
          var fl = [{ name: 'Degree', label: 'degree' }, { name: 'Terms', label: 'number of terms' }];
          return KP.fields(t(tx(M) + '\\left(' + tx(B) + '\\right)') + ' (degree and number of terms only)', fl,
            [K.number(a + 4, numDiag([[a + 3, 'deg-wrong', 'Find the degree of <b>each</b> term of the product (add the exponents on ' + t('x') + ' and ' + t('y') + ') and take the larger.']])), K.number(2)],
            [String(a + 4), '2'], 'degree ' + t(a + 4) + ', ' + t(2) + ' terms',
            t('=' + tx(R)) + '. Term degrees: ' + t((a + 1) + '+3=' + (a + 4)) + ' and ' + t((a + 2) + '+1=' + (a + 3)) + ', so the degree is ' + t(a + 4) + '; ' + t(2) + ' terms.',
            ['A monomial times a binomial gives two terms. For each, add the exponents on ' + t('x') + ' and ' + t('y') + '.'], 'audit monomial × binomial (two letters)');
        } },
        { id: 'e2f', level: 'EMG', make: function (r) {
          var m = r.pick([2, 2, 3]), sg = r.pick([-1, -1, 1]), B = Y.add(mono(1, 'x', m), Y.mono(sg, { y: m })), R = Y.pow(B, 2);
          return auditPart(R, '\\left(' + tx(B) + '\\right)^{2}', 'Square of a binomial: ' + t('(x^{' + m + '})^{2}' + (sg < 0 ? '-' : '+') + '2(x^{' + m + '})(y^{' + m + '})+(y^{' + m + '})^{2}=' + tx(R)) + '. Every term has degree ' + t(2 * m) + '; the leading coefficient is ' + t(1) + ' in powers of ' + t('x') + ' (and of ' + t('y') + ').', [[2, 'no-middle', 'A square of a binomial has a middle term: ' + t('(A' + (sg < 0 ? '-' : '+') + 'B)^{2}=A^{2}' + (sg < 0 ? '-' : '+') + '2AB+B^{2}') + '.']], [[m * m, 'deg-mult', 'Add the exponents within a term: ' + t('x^{' + m + '}\\cdot x^{' + m + '}=x^{' + 2 * m + '}') + '.']]);
        } }] },
      { num: '3', stem: 'Expand and simplify, then write each answer in <b>descending order</b>.',
        shared: function (r) {
          return {
            a: pickWhere(function () { return { a: r.int(2, 3), b: nz(r, -5, 5), c: nz(r, -7, 7), d: nz(r, -5, 5) }; }, function (s) { var R = Y.mul(lin(s.a, s.b, 'y'), quad(1, s.d, s.c, 'y')); return Y.count(R) === 4 && Math.abs(s.c) >= 2 && Math.abs(s.d) >= 2; }),
            b: pickWhere(function () { return { e: r.int(1, 3), f: r.int(2, 4), g: nz(r, -3, 3), h: nz(r, -5, 5) }; }, function (s) { var R = Y.mul(lin(-s.f, s.e, 'm'), quad(1, s.g, s.h, 'm')); return Y.count(R) === 4; }),
            k: r.int(2, 6)
          };
        },
        parts: [
          { id: 'e3a', level: 'PRG', make: function (r, sh) {
            var s = sh.a, B = lin(s.a, s.b, 'y'), T = quad(1, s.d, s.c, 'y'), R = Y.mul(B, T), shown = Y.seq([mono(1, 'y', 2), Y.num(s.c), mono(s.d, 'y')]);
            return poly(t(bt(B) + '\\left(' + shown + '\\right)') + ' — the trinomial is not written in order.', R, { order: 'desc', var: 'y', wrong: [{ is: Y.add(mono(s.a, 'y', 3), Y.num(s.b * s.c)), code: 'fl-only', hint: 'Every term of the binomial multiplies every term of the trinomial: six products.' }] },
              'Reorder the bracket first: ' + t(bt(B) + '\\left(' + tx(T) + '\\right)') + '<br>' + t('=' + tx(Y.mul(mono(s.a, 'y'), T)) + plusTex(Y.mul(Y.num(s.b), T))) + '<br>' + t('=' + ord(R, 'y')) + ' (4 terms: a polynomial of degree ' + t(3) + ').',
              ['Rewrite the trinomial in descending order first, then multiply each of its terms by ' + t(s.a + 'y') + ' and by ' + t(par(s.b)) + '.'], 'expand (ay+b)(y² + c + dy)');
          } },
          { id: 'e3b', level: 'PRG', make: function (r, sh) {
            var s = sh.b, B = lin(-s.f, s.e, 'm'), T = quad(1, s.g, s.h, 'm'), R = Y.mul(B, T), shownB = s.e + '-' + s.f + 'm';
            return poly(t('(' + shownB + ')\\left(' + tx(T) + '\\right)'), R, { order: 'desc', var: 'm', wrong: [{ is: Y.add(Y.mul(Y.num(s.e), T), Y.mul(mono(s.f, 'm'), T)), code: 'sub-sign', hint: 'The ' + t('-' + s.f + 'm') + ' is negative: ' + t('-' + s.f + 'm\\left(' + tx(T) + '\\right)=' + tx(Y.mul(mono(-s.f, 'm'), T))) + '.' }] },
              t('=' + s.e + '\\left(' + tx(T) + '\\right)-' + s.f + 'm\\left(' + tx(T) + '\\right)') + '<br>' + t('=' + tx(Y.mul(Y.num(s.e), T)) + plusTex(Y.mul(mono(-s.f, 'm'), T))) + '<br>' + t('=' + ord(R, 'm')) + ' (leading coefficient ' + t(-s.f) + ').',
              ['Multiply ' + t(s.e) + ' and then ' + t('-' + s.f + 'm') + ' by each term of the trinomial. Then start your answer with the highest power of ' + t('m') + '.'], 'expand (e − fm)(trinomial)');
          } },
          { id: 'e3c', level: 'EMG', make: function (r, sh) {
            var k = sh.k, R = mono(-k * k, 'x', 2);
            return poly(t('(x^{2}+' + k + 'x)(x^{2}-' + k + 'x)-x^{4}'), R, { wrong: [{ is: Y.add(mono(1, 'x', 4), mono(-k * k, 'x', 2)), code: 'cancel-missed', hint: 'Don’t forget to subtract the ' + t('x^{4}') + ' at the end.' }, { is: mono(-2 * k, 'x', 2), code: 'exponent', hint: t('(' + k + 'x)^{2}=' + k * k + 'x^{2}') + ': square the coefficient too.' }] },
              'A sum times a difference: ' + t('(x^{2}+' + k + 'x)(x^{2}-' + k + 'x)=(x^{2})^{2}-(' + k + 'x)^{2}=x^{4}-' + k * k + 'x^{2}') + '.<br>' + t('x^{4}-' + k * k + 'x^{2}-x^{4}=' + tx(R)) + '.',
              ['Spot the pattern ' + t('(A+B)(A-B)=A^{2}-B^{2}') + ' with ' + t('A=x^{2}') + ' and ' + t('B=' + k + 'x') + '.'], 'sum × difference minus x⁴');
          } },
          { id: 'e3d', level: 'EMG', make: function (r, sh) {
            var k = sh.k, fl = [{ name: 'Terms', label: 'number of terms' }, { name: 'Degree', label: 'degree' }, { name: 'Leading coefficient', label: 'leading coefficient' }, { name: 'Constant term', label: 'constant term' }];
            return KP.fields('For your answer to (c), ' + t('-' + k * k + 'x^{2}') + ', state the number of terms, the degree, the leading coefficient and the constant term.', fl,
              [K.number(1), K.number(2), K.number(-k * k, numDiag([[k * k, 'lead-wrong', 'Keep the sign: the leading coefficient is the whole number in front, including the minus.']])), K.number(0, numDiag([[-k * k, 'const-wrong', 'There is no term without ' + t('x') + ', so the constant term is ' + t(0) + '.']]))],
              ['1', '2', String(-k * k), '0'], t(1) + ' term (a monomial), degree ' + t(2) + ', leading coefficient ' + t(-k * k) + ', constant term ' + t(0),
              t('-' + k * k + 'x^{2}') + ' has ' + t(1) + ' term, so it is a <b>monomial</b>. Degree ' + t(2) + ', leading coefficient ' + t(-k * k) + ', and constant term ' + t(0) + ' (no term without ' + t('x') + ').',
              ['A missing constant term counts as ' + t(0) + '.'], 'features of a monomial');
          } }] },
      { num: '4', stem: function (sh) { return '<b>Tiles and products together.</b>' + HW.tiles.legend() + 'The tiles below have been arranged into one large rectangle.' + tileRect(sh.a, sh.b); },
        shared: function (r) { var a = r.int(2, 4), b = r.int(1, 3); if (a === b) a++; var p = r.int(1, 3), q = r.int(p + 1, 5), u = r.int(2, 5), w = r.int(2, 6); return { a: a, b: b, p: p, q: q, u: u, w: w }; },
        parts: [
          { id: 'e4a', level: 'EMG', make: function (r, sh) {
            var Wd = lin(1, sh.a), H = lin(1, sh.b), fl = [{ name: 'Width', label: 'width (across)', mode: 'math', keys: 'poly', vars: ['x'] }, { name: 'Height', label: 'height (down)', mode: 'math', keys: 'poly', vars: ['x'] }];
            var p = KP.fields('Read the width and the height of the whole rectangle off the tiles.', fl, [], [tx(Wd), tx(H)], 'width ' + t(tx(Wd)) + ', height ' + t(tx(H)),
              'Across the top: one ' + t('x^{2}') + '-tile, then ' + t(sh.a) + ' unit-wide columns, so ' + t(tx(Wd)) + '.<br>Down the side: one ' + t('x^{2}') + '-tile, then ' + t(sh.b) + ' unit-high row' + (sh.b > 1 ? 's' : '') + ', so ' + t(tx(H)) + '.',
              ['The ' + t('x^{2}') + '-tile is ' + t('x') + ' by ' + t('x') + '. Each strip or small square beside it adds ' + t(1) + '.'], 'tile rectangle dimensions');
            p.check = pairCheck(Wd, H, { labels: ['Width', 'Height'], ordered: true, swapHint: 'Those are the two dimensions — but the width is across the top and the height is down the side.', diag: function () { return { code: 'tile-count', hint: 'The ' + t('x^{2}') + '-tile gives ' + t('x') + ' along each edge; each strip or small square beside it adds ' + t(1) + '. Count them along the top, then down the side.' }; } });
            p.bad = [[tx(lin(1, sh.a + 1)), tx(H)], ['x', tx(H)]];
            return p;
          } },
          { id: 'e4b', level: 'BEG', make: function (r, sh) {
            var R = Y.mul(lin(1, sh.a), lin(1, sh.b));
            return poly('Write the product the rectangle represents, expanded, in descending order.', R, { order: 'desc', var: 'x', wrong: [{ is: quad(1, 0, sh.a * sh.b), code: 'outer-inner', hint: 'Count the ' + t('x') + '-tiles too: they are the middle term.' }] },
              t('(x+' + sh.a + ')(x+' + sh.b + ')=' + Y.seq([mono(1, 'x', 2), mono(sh.b, 'x'), mono(sh.a, 'x'), Y.num(sh.a * sh.b)]) + '=' + tx(R)) + '.<br>The tiles agree: one ' + t('x^{2}') + '-tile, ' + t(sh.a + '+' + sh.b + '=' + (sh.a + sh.b)) + ' ' + t('x') + '-tiles and ' + t(sh.a + '\\times ' + sh.b + '=' + sh.a * sh.b) + ' unit tiles.',
              ['Count each kind of tile in the rectangle: ' + t('x^{2}') + '-tiles, ' + t('x') + '-tiles, unit tiles.'], 'tile rectangle product');
          } },
          { id: 'e4c', level: 'BEG', make: function (r, sh) {
            var fl = [{ name: 'Degree', label: 'degree' }, { name: 'Leading coefficient', label: 'leading coefficient' }, { name: 'Constant term', label: 'constant term' }];
            return KP.fields('State the degree, leading coefficient and constant term of the product.', fl, [K.number(2), K.number(1, numDiag([[0, 'lead-wrong', 'A term ' + t('x^{2}') + ' has coefficient ' + t(1) + '.']])), K.number(sh.a * sh.b, numDiag([[sh.a + sh.b, 'const-wrong', 'That is the number of ' + t('x') + '-tiles. The constant term is the number of unit tiles.']]))],
              ['2', '1', String(sh.a * sh.b)], 'degree ' + t(2) + ', leading coefficient ' + t(1) + ', constant term ' + t(sh.a * sh.b),
              'Degree ' + t(2) + ' and leading coefficient ' + t(1) + ' both come from the single ' + t('x^{2}') + '-tile. The constant term ' + t(sh.a * sh.b) + ' is the block of unit tiles in the corner.',
              ['Which tile is the largest? How many unit tiles are there?'], 'features from tiles');
          } },
          { id: 'e4d', level: 'BEG', make: function (r, sh) {
            var u = sh.u, w = sh.w, fl = [{ name: 'x²-tiles', label: t('x^{2}') + '-tiles' }, { name: 'x-tiles', label: t('x') + '-tiles' }, { name: 'unit tiles', label: 'unit tiles' }];
            return KP.fields('Without drawing anything, how many tiles of each kind would ' + t('(x+' + u + ')(x+' + w + ')') + ' need?', fl, [K.number(1), K.number(u + w, numDiag([[u * w, 'tile-count', 'The ' + t('x') + '-tiles run along the two sides: ' + t(u + '+' + w) + '.']])), K.number(u * w, numDiag([[u + w, 'tile-count', 'The unit tiles fill a ' + t(u) + ' by ' + t(w) + ' block: multiply.']]))],
              ['1', String(u + w), String(u * w)], t(1) + ', ' + t(u + w) + ', ' + t(u * w),
              'One ' + t('x^{2}') + '-tile; ' + t(u + '+' + w + '=' + (u + w)) + ' ' + t('x') + '-tiles; ' + t(u + '\\times ' + w + '=' + u * w) + ' unit tiles. So ' + t('(x+' + u + ')(x+' + w + ')=' + tx(Y.mul(lin(1, u), lin(1, w)))) + '.',
              ['Picture the rectangle: an ' + t('x^{2}') + '-tile in the corner, ' + t('x') + '-tiles along each side, and a block of unit tiles.'], 'tile counts');
          } },
          { id: 'e4e', level: 'EMG', make: function (r, sh) {
            var p = sh.p, q = sh.q;
            return KP.mc(r, 'Why can’t ' + t('(x+' + p + ')(x-' + q + ')') + ' be shown as one all-shaded rectangle of tiles?', [
              { html: 'A side of ' + t('x-' + q) + ' needs ' + t(q) + ' negative (white) unit tiles, so some tiles in the rectangle must be white.', right: true },
              { html: 'Because ' + t(q) + ' is bigger than ' + t(p) + ', the rectangle can’t close up.', code: 'opt-size', why: 'Rectangles of any size can be built. The problem is the <b>sign</b> of the tiles.' },
              { html: 'An ' + t('x^{2}') + '-tile can only be used with all-positive factors.', code: 'opt-x2', why: 'The ' + t('x^{2}') + '-tile is shaded here (' + t('x\\cdot x') + '). The problem is the negative unit tiles on one side.' },
              { html: 'Because the product has no constant term.', code: 'opt-const', why: 'The product has constant term ' + t(-p * q) + '. Think about the tiles needed for ' + t('x-' + q) + '.' }],
              'The side ' + t('x-' + q) + ' is one ' + t('x') + '-tile and ' + t(q) + ' <b>white</b> unit tiles. Products with a white tile are white (negative), so the rectangle mixes shaded and white tiles.',
              ['What colour are the tiles that model ' + t('-' + q) + '?'], 'why not all shaded');
          } },
          { id: 'e4f', level: 'EMG', make: function (r, sh) {
            var p = sh.p, q = sh.q, R = Y.mul(lin(1, p), lin(1, -q)), fl = [{ name: 'Product', label: 'expansion', mode: 'math', keys: 'poly', vars: ['x'] }, { name: 'Zero pairs', label: 'number of zero pairs of ' + t('x') + '-tiles' }];
            return KP.fields('Expand ' + t('(x+' + p + ')(x-' + q + ')') + ', and say how many zero pairs of ' + t('x') + '-tiles form.', fl,
              [K.poly(R, { wrong: wl(R, [{ is: quad(1, p + q, -p * q), code: 'no-zero-pairs', hint: 'Shaded and white ' + t('x') + '-tiles cancel: ' + t(p + 'x-' + q + 'x') + '.' }]) }), K.number(p, numDiag([[q, 'no-zero-pairs', 'Each zero pair uses one shaded <b>and</b> one white tile. There are only ' + t(p) + ' shaded ' + t('x') + '-tiles.'], [p + q, 'no-zero-pairs', 'A zero pair is two tiles (one shaded, one white). Count pairs, not tiles.']]))],
              [tx(R), String(p)], t(tx(R)) + '; ' + t(p) + ' zero pair' + (p > 1 ? 's' : ''),
              t('(x+' + p + ')(x-' + q + ')=' + Y.seq([mono(1, 'x', 2), mono(-q, 'x'), mono(p, 'x'), Y.num(-p * q)]) + '=' + tx(R)) + '.<br>The ' + t(p) + ' shaded and ' + t(q) + ' white ' + t('x') + '-tiles form ' + t(p) + ' zero pair' + (p > 1 ? 's' : '') + ', leaving ' + t(q - p) + ' white ' + t('x') + '-tile' + (q - p > 1 ? 's' : '') + '; all ' + t(p * q) + ' unit tiles are white.',
              ['Shaded × white = white. Pair each shaded ' + t('x') + '-tile with a white one.'], 'tiles with zero pairs');
          } }] },
      { num: '5', section: 'Extra practice B — Expanding with every tool',
        stem: 'Each expression needs more than one technique. Expand every bracket completely before you collect anything, and write each answer in descending order.',
        shared: function (r) {
          return {
            a: pickWhere(function () { return { a: r.int(2, 3), b: r.int(1, 5), c: r.int(1, 5), d: r.int(2, 3), e: r.int(1, 3), f: r.int(2, 6), g: r.int(2, 4), h: r.int(3, 8), k: r.int(1, 5) }; }, function (s) {
              var R = Y.add(Y.pow(lin(s.a, -s.b), 2), Y.mul(lin(1, s.c), quad(s.d, -s.e, s.f)), Y.neg(Y.add(mono(s.g, 'x', 3), mono(-s.h, 'x', 2), mono(s.k, 'x')))); return Y.count(R) === 4 && s.g !== s.d;
            }),
            b: pickWhere(function () { var q = r.pick([2, 3]), rt = r.pick(q === 2 ? [[1, 4], [2, 2], [4, 1]] : [[1, 9], [3, 3], [9, 1]]); return { p: r.int(2, 4), q: q, rr: rt[0], tt: rt[1], s: r.int(1, 4) }; }, function (s) { if (gcd(s.p, s.q) !== 1) return false;
              var R = Y.sub(Y.pow(lin(s.p, s.q, 'a'), 2), Y.mul(lin(1, -s.rr, 'a'), quad(1, s.s, -s.tt, 'a'))); return Y.count(R) === 3;
            }),
            c: pickWhere(function () { return { a: r.int(2, 4), b: r.int(2, 5), V: r.pick([['m', 'n'], ['m', 'n'], ['a', 'b'], ['p', 'q']]) }; }, function (s) { return s.a !== s.b; }),
            d: r.int(2, 4)
          };
        },
        parts: [
          { id: 'e5a', level: 'PRG', make: function (r, sh) {
            var s = sh.a, S = Y.pow(lin(s.a, -s.b), 2), M = Y.mul(lin(1, s.c), quad(s.d, -s.e, s.f)), Z = Y.add(mono(s.g, 'x', 3), mono(-s.h, 'x', 2), mono(s.k, 'x')), R = Y.sub(Y.add(S, M), Z);
            return poly(t(bt(lin(s.a, -s.b)) + '^{2}+' + bt(lin(1, s.c)) + '\\left(' + tx(quad(s.d, -s.e, s.f)) + '\\right)-\\left(' + tx(Z) + '\\right)'), R, { order: 'desc', var: 'x', wrong: [
              { is: Y.sub(Y.add(quad(s.a * s.a, 0, s.b * s.b), M), Z), code: 'no-middle', hint: 'The square has a middle term: ' + t(bt(lin(s.a, -s.b)) + '^{2}=' + tx(S)) + '.' },
              { is: Y.add(S, M, mono(-s.g, 'x', 3), mono(-s.h, 'x', 2), mono(s.k, 'x')), code: 'sub-sign', hint: 'The minus in front of the last bracket changes the sign of <b>every</b> term inside it.' }] },
              t(bt(lin(s.a, -s.b)) + '^{2}=' + tx(S)) + '<br>' + t(bt(lin(1, s.c)) + '\\left(' + tx(quad(s.d, -s.e, s.f)) + '\\right)=' + tx(M)) + '<br>Change every sign in the subtracted bracket: ' + t('-\\left(' + tx(Z) + '\\right)=' + tx(Y.neg(Z))) + '<br>Collect: ' + t(ord(R)),
              ['Do the three pieces separately: the square, the binomial × trinomial, and the subtracted bracket (change every sign). Then collect.'], 'square + product − bracket');
          } },
          { id: 'e5b', level: 'PRG', make: function (r, sh) {
            var s = sh.b, S = Y.pow(lin(s.p, s.q, 'a'), 2), M = Y.mul(lin(1, -s.rr, 'a'), quad(1, s.s, -s.tt, 'a')), R = Y.sub(S, M);
            return poly(t(bt(lin(s.p, s.q, 'a')) + '^{2}-' + bt(lin(1, -s.rr, 'a')) + '\\left(' + tx(quad(1, s.s, -s.tt, 'a')) + '\\right)'), R, { order: 'desc', var: 'a', wrong: [
              { is: Y.add(S, M), code: 'sub-sign', hint: 'Subtract the <b>whole</b> product: put it in brackets and change every sign.' },
              { is: Y.sub(quad(s.p * s.p, 0, s.q * s.q, 'a'), M), code: 'no-middle', hint: 'The square has a middle term: ' + t(bt(lin(s.p, s.q, 'a')) + '^{2}=' + tx(S)) + '.' }] },
              t(bt(lin(s.p, s.q, 'a')) + '^{2}=' + tx(S)) + '<br>' + t(bt(lin(1, -s.rr, 'a')) + '\\left(' + tx(quad(1, s.s, -s.tt, 'a')) + '\\right)=' + tx(M)) + '<br>Subtract the whole product: ' + t(tx(S) + plusTex(Y.neg(M)) + '=' + ord(R, 'a')) + ' (the constants cancel).',
              ['Expand the square and the product separately. Then subtract the whole product (change every sign).'], 'square − binomial × trinomial');
          } },
          { id: 'e5c', level: 'PRG', make: function (r, sh) {
            var s = sh.c, u = s.V[0], w = s.V[1], A = Y.add(mono(s.a, u), mono(-s.b, w)), B = Y.add(mono(s.a, u), mono(s.b, w)), P1 = Y.mul(A, B), P2 = Y.pow(A, 2), R = Y.add(P1, P2);
            return poly(t(bt(A) + bt(B) + '+' + bt(A) + '^{2}'), R, { order: 'desc', var: u, wrong: [{ is: Y.add(P1, Y.add(mono(s.a * s.a, u, 2), mono(s.b * s.b, w, 2))), code: 'no-middle', hint: 'The square has a middle term: ' + t(bt(A) + '^{2}=' + tx(P2)) + '.' }] },
              t(bt(A) + bt(B) + '=' + tx(P1)) + ' (sum × difference)<br>' + t(bt(A) + '^{2}=' + tx(P2)) + '<br>Add: ' + t(tx(P1) + plusTex(P2) + '=' + tx(R)),
              ['One product is a sum times a difference, the other is a square. Expand each, then add.'], 'sum×difference + square (two letters)');
          } },
          { id: 'e5d', level: 'PRG', make: function (r, sh) {
            var c = sh.d, c2 = c * c, D1 = quad(1, 0, -c2), D2 = Y.add(mono(1, 'x', 2), Y.num(c2)), R = Y.sub(Y.mul(D1, D2), Y.pow(D1, 2));
            return poly(t('(x+' + c + ')(x-' + c + ')(x^{2}+' + c2 + ')-(x^{2}-' + c2 + ')^{2}'), R, { order: 'desc', var: 'x', wrong: [
              { is: Y.sub(Y.mul(D1, D2), Y.add(mono(1, 'x', 4), Y.num(c2 * c2))), code: 'no-middle', hint: 'The square has a middle term: ' + t('(x^{2}-' + c2 + ')^{2}=' + tx(Y.pow(D1, 2))) + '.' },
              { is: Y.add(Y.mul(D1, D2), Y.pow(D1, 2)), code: 'sub-sign', hint: 'Subtract the whole square: change every sign of its expansion.' }] },
              t('(x+' + c + ')(x-' + c + ')=x^{2}-' + c2) + '<br>' + t('(x^{2}-' + c2 + ')(x^{2}+' + c2 + ')=' + tx(Y.mul(D1, D2))) + '<br>' + t('(x^{2}-' + c2 + ')^{2}=' + tx(Y.pow(D1, 2))) + '<br>Subtract: ' + t(tx(Y.mul(D1, D2)) + plusTex(Y.neg(Y.pow(D1, 2))) + '=' + tx(R)),
              ['Use the sum-times-difference pattern twice, then subtract the square.'], 'double sum×difference − square');
          } },
          { id: 'e5e', level: 'EMG', make: function (r, sh) {
            var s = sh.c, u = s.V[0], w = s.V[1], bb = s.b * s.b;
            return KP.mc(r, 'In part (c), a whole pair of terms vanished. Which terms cancelled, and where did each one come from?', [
              { html: t('-' + bb + w + '^{2}') + ' from the sum × difference and ' + t('+' + bb + w + '^{2}') + ' from the square.', right: true },
              { html: 'The ' + t(u + w) + ' terms: one from each product.', code: 'opt-mw', why: 'The sum × difference has <b>no</b> ' + t(u + w) + ' term (its middle terms cancel inside it). The square’s ' + t('-' + 2 * s.a * s.b + u + w) + ' term stays.' },
              { html: 'The ' + t(u + '^{2}') + ' terms: one from each product.', code: 'opt-m2', why: 'Both ' + t(u + '^{2}') + ' terms are ' + t('+' + s.a * s.a + u + '^{2}') + ', so they add to ' + t(2 * s.a * s.a + u + '^{2}') + '.' },
              { html: 'Nothing cancels; the answer just has fewer terms because the square has no middle term.', code: 'opt-none', why: 'The square does have a middle term. Look at the ' + t(w + '^{2}') + ' terms in each product.' }],
              t(bt(Y.add(mono(s.a, u), mono(-s.b, w))) + bt(Y.add(mono(s.a, u), mono(s.b, w))) + '=' + s.a * s.a + u + '^{2}-' + bb + w + '^{2}') + ' and ' + t(bt(Y.add(mono(s.a, u), mono(-s.b, w))) + '^{2}=' + s.a * s.a + u + '^{2}-' + 2 * s.a * s.b + u + w + '+' + bb + w + '^{2}') + '. The ' + t('-' + bb + w + '^{2}') + ' and ' + t('+' + bb + w + '^{2}') + ' cancel.',
              ['Write both expansions out and look for two terms with opposite signs.'], 'which terms cancelled');
          } }] },
      { num: '6', stem: 'Three factors at a time. In each, <i>one</i> pair of the factors is a special product — multiply that pair first.',
        parts: [
          { id: 'e6a', level: 'EMG', make: function (r) {
            var s = pickWhere(function () { return { a: r.int(2, 6), b: r.int(1, 5) }; }, function (s) { return s.a !== s.b; }), R = Y.mul(lin(1, -s.a), lin(1, s.a), lin(1, -s.b)), D = quad(1, 0, -s.a * s.a);
            return poly('Expand ' + t('(x-' + s.a + ')(x+' + s.a + ')(x-' + s.b + ')') + '.', R, { wrong: [{ is: Y.mul(quad(1, 0, s.a * s.a), lin(1, -s.b)), code: 'dos-sign', hint: t('(x-' + s.a + ')(x+' + s.a + ')=x^{2}-' + s.a * s.a) + ' (a difference of squares).' }] },
              t('(x-' + s.a + ')(x+' + s.a + ')=x^{2}-' + s.a * s.a) + ' (sum × difference: no middle term)<br>' + t('(x^{2}-' + s.a * s.a + ')(x-' + s.b + ')=' + tx(R)),
              ['Multiply the sum-times-difference pair first: it gives just two terms.'], 'three factors with a sum × difference');
          } },
          { id: 'e6b', level: 'PRG', make: function (r) {
            var p = r.int(2, 3), q = r.pick(p === 2 ? [1, 3, 5] : [1, 2, 4, 5]), sv = r.int(1, 5), B = lin(p, q, 'a'), S = Y.pow(B, 2), R = Y.mul(S, lin(1, -sv, 'a'));
            return poly('Expand ' + t(bt(B) + bt(B) + '(a-' + sv + ')') + '.', R, { wrong: [{ is: Y.mul(quad(p * p, 0, q * q, 'a'), lin(1, -sv, 'a')), code: 'no-middle', hint: 'The square has a middle term: ' + t(bt(B) + '^{2}=' + tx(S)) + '.' }] },
              'The repeated factor is a square: ' + t(bt(B) + '^{2}=' + tx(S)) + '<br>' + t('\\left(' + tx(S) + '\\right)(a-' + sv + ')=' + tx(Y.mul(S, mono(1, 'a'))) + plusTex(Y.mul(S, Y.num(-sv))) + '=' + tx(R)),
              ['The first two factors are the same — use the square-of-a-binomial pattern.'], 'square times binomial');
          } },
          { id: 'e6c', level: 'PRG', make: function (r) {
            var cd = r.pick([[3, 1], [3, 1], [2, 1], [1, 2], [2, 3], [3, 2]]), c = cd[0], d = cd[1];
            var A = Y.add(mono(c, 'p'), mono(-d, 'q')), B = Y.add(mono(c, 'p'), mono(d, 'q')), Cq = Y.add(mono(c * c, 'p', 2), mono(d * d, 'q', 2)), D1 = Y.mul(A, B), R = Y.mul(D1, Cq);
            return poly('Expand ' + t(bt(A) + bt(B) + bt(Cq)) + '.', R, { wrong: [{ is: Y.add(mono(Math.pow(c, 4), 'p', 4), mono(Math.pow(d, 4), 'q', 4)), code: 'dos-sign', hint: 'Check the sign: ' + t('(A-B)(A+B)=A^{2}-B^{2}') + '.' }] },
              t(bt(A) + bt(B) + '=' + tx(D1)) + ' (sum × difference)<br>That pairs with ' + t(bt(Cq)) + ' as <i>another</i> sum × difference: ' + t('\\left(' + tx(D1) + '\\right)\\left(' + tx(Cq) + '\\right)=' + tx(R)),
              ['Multiply the first two factors (a sum times a difference). Look at what you get next to the third factor.'], 'double sum × difference');
          } },
          { id: 'e6d', level: 'PRG', make: function (r) {
            var k = r.int(2, 5), v = r.pick(['y', 'y', 'x', 'a']), S = Y.pow(lin(1, -k, v), 2), R = Y.pow(lin(1, -k, v), 3);
            return poly('Expand ' + t('(' + v + '-' + k + ')^{3}') + '.', R, { wrong: [{ is: Y.add(mono(1, v, 3), Y.num(-k * k * k)), code: 'cube-each', hint: 'You can’t cube each term separately. Write it as ' + t('(' + v + '-' + k + ')(' + v + '-' + k + ')(' + v + '-' + k + ')') + '.' }, { is: Y.mul(quad(1, 0, k * k, v), lin(1, -k, v)), code: 'no-middle', hint: 'Square first, with the middle term: ' + t('(' + v + '-' + k + ')^{2}=' + tx(S)) + '.' }] },
              t('(' + v + '-' + k + ')^{2}=' + tx(S)) + '<br>' + t('(' + v + '-' + k + ')\\left(' + tx(S) + '\\right)=' + tx(Y.mul(S, mono(1, v))) + plusTex(Y.mul(S, Y.num(-k))) + '=' + tx(R)) + '<br>Degree ' + t('1+1+1=3') + ' and leading coefficient ' + t('1\\times1\\times1=1') + ', as predicted.',
              ['Write it as three factors. Square first, then multiply by the third factor.'], 'cube of a binomial');
          } },
          { id: 'e6e', level: 'EMG', make: function (r) {
            var m = r.int(2, 6), n = r.int(1, 6); if (n === m) n++;
            var F3 = r.shuffle([{ id: 'A', tex: 'x+' + m }, { id: 'B', tex: 'x-' + n }, { id: 'C', tex: 'x-' + m }]), show = F3.map(function (f) { return '(' + f.tex + ')'; }).join('');
            return KP.mc(r, 'To expand ' + t(show) + ', which pair of factors is the short one to multiply first?', [
              { html: t('(x+' + m + ')(x-' + m + ')') + ', because a sum times a difference gives just ' + t('x^{2}-' + m * m) + '.', right: true },
              { html: t('(x+' + m + ')(x-' + n + ')') + ', because they are written next to each other.', code: 'opt-adj', why: 'Order doesn’t matter in a product. Look for a pair that gives only two terms.' },
              { html: t('(x-' + n + ')(x-' + m + ')') + ', because both have minus signs.', code: 'opt-minus', why: 'Two minus signs give a trinomial with a middle term. A sum times a difference has no middle term.' },
              { html: 'It makes no difference which pair you choose: every pair gives three terms.', code: 'opt-same', why: 'Check ' + t('(x+' + m + ')(x-' + m + ')') + ': the middle terms cancel, leaving two terms.' }],
              t('(x+' + m + ')(x-' + m + ')=x^{2}-' + m * m) + ' (two terms), so ' + t(show + '=(x^{2}-' + m * m + ')(x-' + n + ')=' + tx(Y.mul(quad(1, 0, -m * m), lin(1, -n)))) + '.',
              ['Which two factors are a sum and a difference of the same two terms?'], 'which pair first');
          } }] },
      { num: '7', stem: '<b>One coefficient only.</b> Do not expand completely — find only the number asked for, using the partial products that feed into it.',
        parts: [
          { id: 'e7a', level: 'EMG', make: function (r) {
            var s = pickWhere(function () { return { a: r.int(1, 5), b: r.int(2, 4), c: r.int(1, 7), d: r.int(1, 9) }; }, function (s) { return s.a * s.b - s.c !== 0 && s.a * s.b !== s.c; });
            var ans = s.a * s.b - s.c, T = quad(s.b, -s.c, s.d);
            return KP.number('The coefficient of ' + t('x^{2}') + ' in ' + t('(x+' + s.a + ')\\left(' + tx(T) + '\\right)') + ' is', ans,
              numDiag([[-s.c, 'partial-miss', 'That is only ' + t('x\\times(-' + s.c + 'x)') + '. Another partial product also gives ' + t('x^{2}') + ': ' + t(s.a + '\\times ' + s.b + 'x^{2}') + '.'], [s.a * s.b, 'partial-miss', 'That is only ' + t(s.a + '\\times ' + s.b + 'x^{2}') + '. Another partial product also gives ' + t('x^{2}') + ': ' + t('x\\times(-' + s.c + 'x)') + '.'], [s.a * s.b + s.c, 'sign', 'Check the sign of ' + t('x\\times(-' + s.c + 'x)') + '.']]),
              'Only two partial products give ' + t('x^{2}') + ': ' + t('x\\times(' + tx(mono(-s.c, 'x')) + ')=' + tx(mono(-s.c, 'x', 2))) + ' and ' + t(s.a + '\\times ' + s.b + 'x^{2}=' + s.a * s.b + 'x^{2}') + '. ' + t('-' + s.c + '+' + s.a * s.b + '=' + ans) + '.',
              ['Which pairs of terms (one from each bracket) multiply to give ' + t('x^{2}') + '?'], 'coefficient of x²');
          } },
          { id: 'e7b', level: 'EMG', make: function (r) {
            var s = pickWhere(function () { return { a: r.int(2, 5), b: r.int(2, 4), c: nz(r, -5, 5), d: nz(r, -3, 3), e: nz(r, -9, 9) }; }, function (s) { return s.d - s.a * s.b !== 0; });
            var ans = s.d - s.a * s.b, Cq = Y.add(mono(s.b, 'x', 3), mono(s.c, 'x', 2), mono(s.d, 'x'), Y.num(s.e));
            return KP.number('The coefficient of ' + t('x^{3}') + ' in ' + t('(x^{2}-' + s.a + ')\\left(' + tx(Cq) + '\\right)') + ' is', ans,
              numDiag([[s.d, 'partial-miss', 'Also ' + t('-' + s.a + '\\times ' + s.b + 'x^{3}') + ' gives an ' + t('x^{3}') + ' term.'], [-s.a * s.b, 'partial-miss', 'Also ' + t('x^{2}\\times ' + tx(mono(s.d, 'x'))) + ' gives an ' + t('x^{3}') + ' term.'], [s.d + s.a * s.b, 'sign', 'Check the sign of ' + t('-' + s.a + '\\times ' + s.b + 'x^{3}') + '.']]),
              'Pairs whose degrees add to ' + t(3) + ': ' + t('x^{2}\\times ' + par(tx(mono(s.d, 'x'))) + '=' + tx(mono(s.d, 'x', 3))) + ' and ' + t('-' + s.a + '\\times ' + s.b + 'x^{3}=' + tx(mono(-s.a * s.b, 'x', 3))) + '. ' + t(s.d + (-s.a * s.b < 0 ? '' : '+') + (-s.a * s.b) + '=' + ans) + '.',
              ['Look for pairs of terms whose exponents add to ' + t(3) + '.'], 'coefficient of x³');
          } },
          { id: 'e7c', level: 'BEG', make: function (r) {
            var a = r.int(2, 4), b = r.pick([1, 3, 5, 7].filter(function (v) { return gcd(v, a) === 1; })), c = nz(r, -5, 5), d = r.int(1, 7), e = r.int(1, 5), ans = (-b) * (-d) * e;
            return KP.number('The constant term of ' + t('(' + a + 'x-' + b + ')\\left(' + tx(quad(1, c, -d)) + '\\right)(x+' + e + ')') + ' is', ans,
              numDiag([[-ans, 'const-sign', 'Multiply the three constants with their signs: ' + t('(-' + b + ')(-' + d + ')(' + e + ')') + '.'], [-b - d + e, 'const-add', 'Multiply the constants — don’t add them.']]),
              'Only constant × constant × constant has no ' + t('x') + ': ' + t('(-' + b + ')(-' + d + ')(' + e + ')=' + ans) + '.',
              ['Which partial product has no ' + t('x') + ' in it?'], 'constant of a triple product');
          } },
          { id: 'e7d', level: 'EMG', make: function (r) {
            var a = r.int(2, 4), m = r.pick([2, 3]), b = r.int(2, 5), n = r.pick([2, 3, 4]), c = r.int(1, 7), d = r.int(1, 6), deg = m + n + 1;
            var fl = [{ name: 'Degree', label: 'degree' }, { name: 'Leading coefficient', label: 'leading coefficient' }];
            return KP.fields('State the degree and the leading coefficient of ' + t('(' + a + 'x^{' + m + '}-x)(' + b + 'x^{' + n + '}+' + c + ')(x-' + d + ')') + '.', fl,
              [K.number(deg, numDiag([[m * n, 'deg-mult', 'Degrees <b>add</b> when terms multiply: ' + t(m + '+' + n + '+1') + '.'], [m + n, 'deg-wrong', 'Don’t forget the third factor ' + t('(x-' + d + ')') + ': its leading term ' + t('x') + ' adds ' + t(1) + '.']])),
                K.number(a * b, numDiag([[a + b, 'lead-add', 'Leading coefficients <b>multiply</b>: ' + t(a + '\\times ' + b + '\\times 1') + '.'], [a * b * d, 'lead-wrong', 'Use only the leading terms: ' + t(a + 'x^{' + m + '}') + ', ' + t(b + 'x^{' + n + '}') + ' and ' + t('x') + '.']]))],
              [String(deg), String(a * b)], 'degree ' + t(deg) + ', leading coefficient ' + t(a * b),
              'Leading terms only: ' + t(a + 'x^{' + m + '}') + ', ' + t(b + 'x^{' + n + '}') + ', ' + t('x') + '.<br>Degree: ' + t(m + '+' + n + '+1=' + deg) + '. Leading coefficient: ' + t(a + '\\times ' + b + '\\times 1=' + a * b) + '.',
              ['The highest-degree term comes from multiplying the leading terms of all three factors.'], 'degree and leading coefficient of a triple product');
          } },
          { id: 'e7e', level: 'PRG', make: function (r) {
            var a = r.int(2, 4), b = r.int(2, 5), c = r.int(1, 4), ans = 2 * a * b;
            return KP.number('The coefficient of ' + t('xy') + ' in ' + t('(' + a + 'x+' + b + 'y-' + c + ')^{2}') + ' is', ans,
              numDiag([[a * b, 'cross-once', 'Write it as ' + t('(' + a + 'x+' + b + 'y-' + c + ')(' + a + 'x+' + b + 'y-' + c + ')') + ': ' + t(a + 'x\\times ' + b + 'y') + ' <b>and</b> ' + t(b + 'y\\times ' + a + 'x') + ' both give ' + t('xy') + '.']]),
              t('(' + a + 'x+' + b + 'y-' + c + ')(' + a + 'x+' + b + 'y-' + c + ')') + '. The ' + t('xy') + ' partial products: ' + t(a + 'x\\times ' + b + 'y=' + a * b + 'xy') + ' and ' + t(b + 'y\\times ' + a + 'x=' + a * b + 'xy') + '. ' + t(a * b + '+' + a * b + '=' + ans) + '.',
              ['Write the square as a product of two equal brackets. Which pairs give ' + t('xy') + '?'], 'xy coefficient of a trinomial square');
          } },
          { id: 'e7f', level: 'PRG', make: function (r) {
            var s = pickWhere(function () { return { a: r.int(1, 4), b: r.int(2, 6), c: r.int(2, 7) }; }, function (s) { return s.a !== s.b && s.b !== s.c && -s.a * s.b + s.a * s.c - s.b * s.c !== 0; });
            var p1 = s.b * (-s.c), p2 = (-s.a) * (-s.c), p3 = (-s.a) * s.b, ans = p1 + p2 + p3;
            return KP.number('The coefficient of ' + t('x') + ' in ' + t('(x-' + s.a + ')(x+' + s.b + ')(x-' + s.c + ')') + ' is', ans,
              numDiag([[p1 + p2, 'drop-term', 'There are <b>three</b> ways to make an ' + t('x') + ' term: take ' + t('x') + ' from one bracket and the constants from the other two.'], [p1 + p3, 'drop-term', 'There are three ways to make an ' + t('x') + ' term — one for each bracket.'], [p2 + p3, 'drop-term', 'There are three ways to make an ' + t('x') + ' term — one for each bracket.'], [-ans, 'sign', 'Check the signs of the constants.']]),
              'Each ' + t('x') + ' term takes ' + t('x') + ' from one bracket and the constants from the other two:<br>' + t('x(' + s.b + ')(-' + s.c + ')=' + p1 + 'x') + ', ' + t('(-' + s.a + ')x(-' + s.c + ')=' + p2 + 'x') + ', ' + t('(-' + s.a + ')(' + s.b + ')x=' + p3 + 'x') + '.<br>' + t(p1 + (p2 < 0 ? '' : '+') + p2 + (p3 < 0 ? '' : '+') + p3 + '=' + ans) + '.',
              ['An ' + t('x') + ' term uses ' + t('x') + ' from exactly one bracket. How many ways is that?'], 'x coefficient of three binomials');
          } }] },
      { num: '8', stem: '<b>Working backwards.</b> Every expansion below came from a product. Find the missing factor.',
        parts: [
          { id: 'e8a', level: 'PRG', make: function (r) {
            var a = r.int(2, 6), b = r.int(2, 7), G = lin(1, a), M = Y.add(mono(1, 'x', 2), Y.num(-b)), T = Y.mul(G, M);
            return missingPart(G, M, T, 'right', 'First term: ' + t('x^{3}\\div x=x^{2}') + '. Constant: ' + t(cf(T, 'x', 0) + '\\div ' + a + '=' + (-b)) + '. Try ' + t(tx(M)) + '.<br>Check: ' + t(bt(G) + '(' + tx(M) + ')=' + tx(T)) + ' ✓');
          } },
          { id: 'e8b', level: 'ADV', make: function (r) {
            var s = pickWhere(function () { return { p: r.int(2, 3), q: nz(r, -4, 4), u: nz(r, -5, 5), w: nz(r, -6, 6) }; }, function (s) { var T = Y.mul(lin(s.p, s.q), quad(1, s.u, s.w)); return Y.count(T) === 4 && Math.abs(s.u) >= 2; });
            var G = lin(s.p, s.q), M = quad(1, s.u, s.w), T = Y.mul(G, M), c2 = cf(T, 'x', 2);
            return missingPart(G, M, T, 'right', 'First term: ' + t(s.p + 'x^{3}\\div ' + s.p + 'x=x^{2}') + '. Constant: ' + t(cf(T, 'x', 0) + '\\div ' + par(s.q) + '=' + s.w) + '.<br>Middle term ' + t('bx') + ': the ' + t('x^{2}') + ' terms give ' + t(s.p + 'b' + (s.q < 0 ? '' : '+') + s.q + '=' + c2) + ', so ' + t('b=' + s.u) + '. The factor is ' + t(tx(M)) + '.<br>Check: ' + t(bt(G) + '\\left(' + tx(M) + '\\right)=' + tx(T)) + ' ✓');
          } },
          { id: 'e8c', level: 'PRG', make: function (r) {
            var c = r.int(2, 7), d = r.int(2, 7); if (c === d) d++;
            var V = r.pick([['a', 'b'], ['a', 'b'], ['x', 'y'], ['m', 'n']]), B = Y.add(mono(c, V[0]), mono(-d, V[1])), T = Y.pow(B, 2), mv = {}; mv[V[0]] = 1; mv[V[1]] = 1;
            var p = KP.math('Find the binomial: ' + t('\\left(\\ ?\\ \\right)^{2}=' + tx(T)), function (resp) {
              var a = readPoly(resp); if (a.res) return a.res;
              if (Y.eq(Y.pow(a.p, 2), T)) { if (a.fi) return form(a.fi.code, a.fi.msg || 'Simplify it fully.'); return ok(); }
              if (Y.eq(a.p, Y.add(mono(c, V[0]), mono(d, V[1]))) || Y.eq(a.p, Y.add(mono(-c, V[0]), mono(-d, V[1])))) return wrong('sign', 'The middle term ' + t(tx(Y.mono(-2 * c * d, mv))) + ' is negative, so the two terms of the binomial have opposite signs.');
              if (Y.eq(a.p, Y.add(mono(c * c, V[0]), mono(-d * d, V[1])))) return wrong('exponent', 'Take the square <b>root</b> of each end term: ' + t(c * c + V[0] + '^{2}=(' + c + V[0] + ')^{2}') + '.');
              return wrong('value', null);
            }, tx(B), 'Ends: ' + t(c * c + V[0] + '^{2}=(' + c + V[0] + ')^{2}') + ' and ' + t(d * d + V[1] + '^{2}=(' + d + V[1] + ')^{2}') + '; the middle term is negative, so try ' + t(tx(B)) + '.<br>Check: ' + t('(' + c + V[0] + ')^{2}-2(' + c + V[0] + ')(' + d + V[1] + ')+(' + d + V[1] + ')^{2}=' + tx(T)) + ' ✓ (' + t(tx(Y.neg(B))) + ' works too.)',
              ['The first and last terms are perfect squares. The middle term is ' + t('2AB') + '.'], 'square root of a perfect-square trinomial', { keys: 'poly', vars: V.slice().sort() });
            p.good = [tx(Y.neg(B))]; p.bad = [tx(Y.add(mono(c, V[0]), mono(d, V[1]))), tx(Y.add(mono(c * c, V[0]), mono(-d * d, V[1])))];
            return p;
          } },
          { id: 'e8d', level: 'PRG', make: function (r) {
            var c = r.int(2, 9), d = r.int(2, 9); if (c === d) d++;
            var A = Y.add(mono(c, 'x', 2), mono(-d, 'y')), B = Y.add(mono(c, 'x', 2), mono(d, 'y')), T = Y.mul(A, B), fl = [{ name: 'First factor', label: 'first factor', mode: 'math', keys: 'poly', vars: ['x', 'y'] }, { name: 'Second factor', label: 'second factor', mode: 'math', keys: 'poly', vars: ['x', 'y'] }];
            var p = KP.fields('Find the two binomial factors: ' + t('\\left(\\ ?\\ \\right)\\left(\\ ?\\ \\right)=' + tx(T)), fl, [], [tx(A), tx(B)], t(bt(A) + bt(B)),
              'No middle term: a difference of squares. ' + t(c * c + 'x^{4}=(' + c + 'x^{2})^{2}') + ' and ' + t(d * d + 'y^{2}=(' + d + 'y)^{2}') + '.<br>Check: ' + t(bt(A) + bt(B) + '=' + c * c + 'x^{4}+' + c * d + 'x^{2}y-' + c * d + 'x^{2}y-' + d * d + 'y^{2}=' + tx(T)) + ' ✓',
              ['There is no middle term, so it came from a sum times a difference. Take the square root of each term.'], 'difference of squares backwards');
            p.check = prodCheck(T, 2, ['First factor', 'Second factor'], function (P1, P2) { if (Y.eq(Y.mul(P1, P2), Y.neg(T))) return { code: 'sign', hint: 'Check the signs: one factor is a sum, the other a difference.' }; return null; });
            p.bad = [[tx(A), tx(A)], [tx(B), tx(B)]];
            return p;
          } },
          { id: 'e8e', level: 'ADV', make: function (r) {
            var a = r.int(1, 3), b = r.int(2, 5), sg = r.pick([-1, -1, 1]); if (a === 1 && b === 2) b = 3;
            var G = lin(a, sg * b), M = quad(a * a, -sg * a * b, b * b), T = Y.mul(G, M);
            return missingPart(G, M, T, 'right', 'First term: ' + t(tx(mono(a * a * a, 'x', 3)) + '\\div ' + (a === 1 ? '' : a) + 'x=' + tx(mono(a * a, 'x', 2))) + '. Constant: ' + t(cf(T, 'x', 0) + '\\div ' + par(sg * b) + '=' + b * b) + '.<br>Middle term ' + t('kx') + ': the ' + t('x^{2}') + ' terms must cancel, so ' + t((a === 1 ? '' : a) + 'k' + (sg * b * a * a < 0 ? '' : '+') + sg * b * a * a + '=0') + ', ' + t('k=' + (-sg * a * b)) + '. The factor is ' + t(tx(M)) + '.<br>Check: ' + t(bt(G) + '\\left(' + tx(M) + '\\right)=' + tx(T)) + ' ✓');
          } },
          { id: 'e8f', level: 'PRG', make: function (r) {
            var s = pickWhere(function () { return { c: nz(r, -6, 6), d: nz(r, -7, 7), e: nz(r, -9, 9) }; }, function (s) { var T = Y.mul(lin(1, s.c), quad(1, s.d, s.e)); return Y.count(T) === 4 && Math.abs(s.c) >= 2; });
            var G = quad(1, s.d, s.e), M = lin(1, s.c), T = Y.mul(M, G);
            return missingPart(G, M, T, 'left', 'First term: ' + t('x^{3}\\div x^{2}=x') + '. Constant: ' + t(cf(T, 'x', 0) + '\\div ' + par(s.e) + '=' + s.c) + '. Try ' + t(tx(M)) + '.<br>Check: ' + t(bt(M) + '\\left(' + tx(G) + '\\right)=' + tx(T)) + ' ✓');
          } }] },
      { num: '9', section: 'Extra practice C — Geometry and applications',
        shared: function (r) { return { k: r.int(1, 5) }; },
        stem: function (sh) { return 'A cube has edge ' + t('(x+' + sh.k + ')') + ' cm. Each edge is divided into a piece of length ' + t('x') + ' and a piece of length ' + t(sh.k) + ', and the cube is sliced right through on all three cuts. This breaks it into ' + t(8) + ' rectangular blocks.' + cubeSvg(sh.k); },
        parts: [
          { id: 'e9a', level: 'EMG', make: function (r, sh) {
            var k = sh.k, B = lin(1, k), S = Y.pow(B, 2), R = Y.pow(B, 3);
            return poly('<b>By algebra.</b> Write the volume of the cube as a polynomial in descending order.', R, { order: 'desc', var: 'x', wrong: [{ is: Y.add(mono(1, 'x', 3), Y.num(k * k * k)), code: 'cube-each', hint: 'You can’t cube each term separately: ' + t('(x+' + k + ')^{3}=(x+' + k + ')(x+' + k + ')(x+' + k + ')') + '.' }, { is: Y.mul(quad(1, 0, k * k), B), code: 'no-middle', hint: 'Square first, with the middle term: ' + t('(x+' + k + ')^{2}=' + tx(S)) + '.' }] },
              t('(x+' + k + ')^{2}=' + tx(S)) + '<br>' + t('(x+' + k + ')\\left(' + tx(S) + '\\right)=' + tx(Y.mul(S, mono(1, 'x'))) + plusTex(Y.mul(S, Y.num(k))) + '=' + tx(R)) + ' cm' + t('^{3}'),
              ['Expand ' + t('(x+' + k + ')^{2}') + ' first, then multiply by ' + t('(x+' + k + ')') + ' again.'], 'cube volume');
          } },
          { id: 'e9b', level: 'EMG', make: function (r, sh) {
            var k = sh.k, mm = function (n) { return { mode: 'math', keys: 'poly', vars: ['x'], name: n, label: n }; };
            var fl = [mm('one ' + 'x × x × x cube'), mm('three x × x × ' + k + ' slabs'), mm('three x × ' + k + ' × ' + k + ' bars'), mm('one ' + k + ' × ' + k + ' × ' + k + ' cube')];
            fl.forEach(function (f) { f.label = f.label.replace(/x/g, '<i>x</i>'); });
            var want = [mono(1, 'x', 3), mono(3 * k, 'x', 2), mono(3 * k * k, 'x'), Y.num(k * k * k)];
            return KP.fields('<b>By the blocks.</b> Of the ' + t(8) + ' pieces, one is ' + t('x') + ' by ' + t('x') + ' by ' + t('x') + ', three are ' + t('x') + ' by ' + t('x') + ' by ' + t(k) + ', three are ' + t('x') + ' by ' + t(k) + ' by ' + t(k) + ', and one is ' + t(k) + ' by ' + t(k) + ' by ' + t(k) + '. Write each group’s <b>total</b> volume.', fl,
              [K.poly(want[0]), K.poly(want[1], { wrong: [{ is: mono(k, 'x', 2), code: 'tile-count', hint: 'There are <b>three</b> slabs: ' + t('3(' + k + 'x^{2})') + '.' }] }), K.poly(want[2], { wrong: [{ is: mono(k * k, 'x'), code: 'tile-count', hint: 'There are <b>three</b> bars: ' + t('3(' + k * k + 'x)') + '.' }] }), K.poly(want[3])],
              want.map(tx), want.map(function (p) { return t(tx(p)); }).join(', '),
              'One cube: ' + t('x\\cdot x\\cdot x=x^{3}') + '<br>Three slabs: ' + t('3(x\\cdot x\\cdot ' + k + ')=' + tx(want[1])) + '<br>Three bars: ' + t('3(x\\cdot ' + k + '\\cdot ' + k + ')=' + tx(want[2])) + '<br>Corner cube: ' + t(k + '\\cdot ' + k + '\\cdot ' + k + '=' + k * k * k) + '<br>Total: ' + t(tx(Y.pow(lin(1, k), 3))) + ' — the same as by algebra.',
              ['Volume of a block = length × width × height. Multiply by the number of blocks in the group.'], 'cube by blocks');
          } },
          { id: 'e9c', level: 'BEG', make: function (r, sh) {
            var k = sh.k, e = 3 + k, V = e * e * e;
            return KP.number('Check at ' + t('x=3') + ': what is the volume of the cube, in cm' + t('^{3}') + '?', V, numDiag([[27 + k * k * k, 'cube-each', 'Cube the whole edge: ' + t('(3+' + k + ')^{3}') + '.']]),
              'At ' + t('x=3') + ' the edge is ' + t('3+' + k + '=' + e) + ' cm, and ' + t(e + '^{3}=' + V) + ' cm' + t('^{3}') + '.<br>Expansion: ' + t('27+' + 3 * k + '(9)+' + 3 * k * k + '(3)+' + k * k * k + '=' + V) + ' ✓',
              ['What is the real edge length when ' + t('x=3') + '?'], 'cube check at x = 3');
          } },
          { id: 'e9d', level: 'EMG', make: function (r, sh) {
            var k = sh.k;
            return KP.mc(r, 'In ' + t(tx(Y.pow(lin(1, sh.k), 3))) + ', where does the ' + t(3) + ' in “three slabs” and “three bars” come from?', [
              { html: 'From the cube’s three directions: a slab can lie against any one of the three pairs of opposite faces, and a bar can run along any one of the three edge directions.', right: true },
              { html: 'From the exponent: ' + t('(x+' + k + ')^{3}') + ' has power ' + t(3) + ', so every coefficient is a multiple of ' + t(3) + '.', code: 'opt-exp', why: 'The first and last coefficients are ' + t(1) + ' and ' + t(k * k * k) + ', which aren’t multiples of ' + t(3) + ' in general. Think about the shape.' },
              { html: 'The cube was cut three times, so every group has three pieces.', code: 'opt-cuts', why: 'Two groups have only one piece (the big cube and the small corner cube).' },
              { html: 'It comes from ' + t(k + '+1') + ', the number of pieces along each edge.', code: 'opt-pieces', why: 'Each edge is cut into two pieces. Count how many ways a slab can be placed in the cube.' }],
              t('1\\to') + ' the ' + t('x^{3}') + ' cube; ' + t(3 * k + '\\to') + ' the three ' + t(k + 'x^{2}') + ' slabs; ' + t(3 * k * k + '\\to') + ' the three ' + t(k * k + 'x') + ' bars; ' + t(k * k * k + '\\to') + ' the corner cube. A cube has three directions, so there are three slabs and three bars.',
              ['Picture the slabs: which face of the big cube does each one sit against?'], 'why three slabs');
          } }] },
      { num: '10',
        shared: function (r) { return pickWhere(function () { return { a: r.int(2, 3), b: r.int(3, 7), c: r.int(1, 3), h: r.int(2, 4) }; }, function (s) { return s.c < s.b && gcd(s.a, s.b) === 1; }); },
        stem: function (sh) { return 'A solid block is a rectangular prism with a square cross-section of side ' + t(bt(lin(sh.a, sh.b))) + ' cm and height ' + t(sh.h + 'x') + ' cm. A square shaft of side ' + t(bt(lin(1, sh.c))) + ' cm is drilled straight through it from top to bottom.' + blockSvg(sh); },
        parts: [
          { id: 'e10a', level: 'PRG', make: function (r, sh) {
            var O = lin(sh.a, sh.b), I = lin(1, sh.c), S1 = Y.pow(O, 2), S2 = Y.pow(I, 2), R = Y.sub(S1, S2);
            return poly('Find the cross-sectional area (the shaded ring) by expanding ' + t(bt(O) + '^{2}') + ' and ' + t(bt(I) + '^{2}') + ', then subtracting.', R, { wrong: [
              { is: quad(sh.a * sh.a - 1, 0, sh.b * sh.b - sh.c * sh.c), code: 'no-middle', hint: 'Each square of a binomial has a middle term: ' + t(bt(O) + '^{2}=' + tx(S1)) + '.' },
              { is: Y.add(S1, quad(-1, 2 * sh.c, sh.c * sh.c)), code: 'sub-sign', hint: 'Subtract the whole square: ' + t('-(' + tx(S2) + ')=' + tx(Y.neg(S2))) + '.' }] },
              t(bt(O) + '^{2}=' + tx(S1)) + '<br>' + t(bt(I) + '^{2}=' + tx(S2)) + '<br>' + t('(' + tx(S1) + ')-(' + tx(S2) + ')=' + tx(R)) + ' cm' + t('^{2}'),
              ['Area of the ring = area of the big square − area of the shaft’s square.'], 'ring area by subtracting squares');
          } },
          { id: 'e10b', level: 'EMG', make: function (r, sh) {
            var O = lin(sh.a, sh.b), I = lin(1, sh.c), D = Y.sub(O, I), S = Y.add(O, I), fl = [{ name: 'a − b', label: t('a-b'), mode: 'math', keys: 'poly', vars: ['x'] }, { name: 'a + b', label: t('a+b'), mode: 'math', keys: 'poly', vars: ['x'] }];
            return KP.fields('The same area is a difference of two squares, ' + t('a^{2}-b^{2}=(a-b)(a+b)') + ', with ' + t('a=' + tx(O)) + ' and ' + t('b=' + tx(I)) + '. Simplify both brackets.', fl,
              [K.poly(D, { wrong: wl(D, [{ is: lin(sh.a - 1, sh.b + sh.c), code: 'sub-sign', hint: 'Subtract the whole of ' + t('b') + ': ' + t('-(' + tx(I) + ')=' + tx(Y.neg(I))) + '.' }]) }), K.poly(S)],
              [tx(D), tx(S)], t('a-b=' + tx(D)) + ', ' + t('a+b=' + tx(S)),
              t('a-b=(' + tx(O) + ')-(' + tx(I) + ')=' + tx(D)) + '<br>' + t('a+b=(' + tx(O) + ')+(' + tx(I) + ')=' + tx(S)) + '<br>' + t(bt(D) + bt(S) + '=' + tx(Y.mul(D, S))) + ' — the same as by subtracting the squares ✓',
              ['Collect like terms inside each bracket. In ' + t('a-b') + ', subtract both terms of ' + t('b') + '.'], 'difference of squares route');
          } },
          { id: 'e10c', level: 'EMG', make: function (r, sh) {
            var A = Y.sub(Y.pow(lin(sh.a, sh.b), 2), Y.pow(lin(1, sh.c), 2)), V = Y.mul(mono(sh.h, 'x'), A);
            return poly('Multiply the cross-sectional area by the height to write the volume of the drilled block in descending order.', V, { order: 'desc', var: 'x', wrong: [{ is: Y.add(Y.mul(mono(sh.h, 'x'), Y.add(mono(cf(A, 'x', 2), 'x', 2), mono(cf(A, 'x', 1), 'x'))), Y.num(cf(A, 'x', 0))), code: 'q-not-mult', hint: 'Multiply ' + t(sh.h + 'x') + ' by <b>every</b> term of the area, including the constant.' }] },
              t('V=' + sh.h + 'x\\left(' + tx(A) + '\\right)=' + tx(V)) + ' cm' + t('^{3}'),
              ['Volume = (area of the cross-section) × height.'], 'drilled block volume');
          } },
          { id: 'e10d', level: 'BEG', make: function (r, sh) {
            var A = Y.sub(Y.pow(lin(sh.a, sh.b), 2), Y.pow(lin(1, sh.c), 2)), V = Y.mul(mono(sh.h, 'x'), A), L = cf(V, 'x', 3), fl = [{ name: 'Degree', label: 'degree' }, { name: 'Leading coefficient', label: 'leading coefficient' }, { name: 'Constant term', label: 'constant term' }];
            return KP.fields('State the degree, leading coefficient and constant term of the volume ' + t(tx(V)) + '.', fl, [K.number(3), K.number(L), K.number(0, numDiag([[cf(V, 'x', 1), 'const-wrong', 'The constant term has no ' + t('x') + '. Every term here contains ' + t('x') + ', so the constant term is ' + t(0) + '.']]))],
              ['3', String(L), '0'], 'degree ' + t(3) + ', leading coefficient ' + t(L) + ', constant term ' + t(0),
              'Degree ' + t(3) + ', leading coefficient ' + t(L) + ', constant term ' + t(0) + '. The height ' + t(sh.h + 'x') + ' multiplies every term, so every term contains ' + t('x') + ' — at ' + t('x=0') + ' the block has no height and no volume.',
              ['Is there a term without ' + t('x') + '?'], 'features of the volume');
          } },
          { id: 'e10e', level: 'BEG', make: function (r, sh) {
            var o = sh.a + sh.b, i = 1 + sh.c, h = sh.h, V = (o * o - i * i) * h;
            return KP.number('Check at ' + t('x=1') + ': what is the volume of the drilled block, in cm' + t('^{3}') + '?', V, numDiag([[o * o * h, 'no-height', 'Remember to subtract the shaft.'], [o * o - i * i, 'no-height', 'That is the cross-sectional area. Multiply by the height, ' + t(h) + ' cm.']]),
              'Outer side ' + t(sh.a + '(1)+' + sh.b + '=' + o) + ' cm, shaft ' + t('1+' + sh.c + '=' + i) + ' cm, height ' + t(h) + ' cm.<br>Area ' + t('=' + o * o + '-' + i * i + '=' + (o * o - i * i)) + ' cm' + t('^{2}') + ', so ' + t('V=' + (o * o - i * i) + '\\times ' + h + '=' + V) + ' cm' + t('^{3}') + ', which matches the polynomial at ' + t('x=1') + '.',
              ['Work out the three real measurements first.'], 'drilled block check at x = 1');
          } },
          { id: 'e10f', level: 'EMG', make: function (r) {
            var s = pickWhere(function () { return { a: r.int(5, 8), b: r.int(10, 15), c: r.int(2, 4), d: r.int(3, 6) }; }, function (s) { return s.c < s.a - 1 && s.d < s.b && gcd(s.a, s.b) === 1 && gcd(s.c, s.d) === 1; });
            return KP.mc(r, 'If the outer side were ' + t('(' + s.a + 'x+' + s.b + ')') + ' and the shaft were ' + t('(' + s.c + 'x+' + s.d + ')') + ', which route would you rather use for the cross-sectional area?', [
              { html: 'The difference-of-squares route: ' + t('(a-b)(a+b)=(' + tx(lin(s.a - s.c, s.b - s.d)) + ')(' + tx(lin(s.a + s.c, s.b + s.d)) + ')') + ' is a single product of two binomials.', right: true },
              { html: 'Squaring both binomials, because it always has fewer steps.', code: 'opt-square', why: 'Squaring both gives two trinomials (six terms) with large coefficients to subtract. The other route needs one product.' },
              { html: 'Neither works: the shaft’s side has to be ' + t('(x+1)') + ' for these methods.', code: 'opt-neither', why: 'Both routes work for any two squares. Which one carries fewer terms?' },
              { html: 'Multiply ' + t('(' + s.a + 'x+' + s.b + ')(' + s.c + 'x+' + s.d + ')') + ', since the ring is between the two squares.', code: 'opt-product', why: 'The ring’s area is a <b>difference</b> of the two square areas, not their product.' }],
              'Route (b): ' + t('a-b=' + tx(lin(s.a - s.c, s.b - s.d))) + ' and ' + t('a+b=' + tx(lin(s.a + s.c, s.b + s.d))) + ', then one product of two binomials. Route (a) squares both binomials (two trinomials) and subtracts term by term. Fewer terms carried means fewer places to slip.',
              ['Count how many terms each route makes you carry.'], 'choose the route');
          } }] },
      { num: '11',
        shared: function (r) { return pickWhere(function () { var a = r.int(5, 8), b = r.int(1, 4); return { a: a, b: b, k0: r.int(1, Math.max(1, a - b - 1)) }; }, function (s) { return s.a - s.b >= 3 && s.k0 < s.a - s.b; }); },
        stem: function (sh) { return 'A rectangular plot measures ' + t('(x+' + sh.a + ')') + ' m long by ' + t('(x+' + sh.b + ')') + ' m wide. The owner shortens the <b>length</b> by ' + t('k') + ' m and lengthens the <b>width</b> by the same ' + t('k') + ' m.'; },
        parts: [
          { id: 'e11a', level: 'BEG', make: function (r, sh) {
            var R = Y.mul(lin(1, sh.a), lin(1, sh.b));
            return poly('Expand the original area, in m' + t('^{2}') + '.', R, { wrong: [{ is: quad(1, 0, sh.a * sh.b), code: 'outer-inner', hint: 'Include the outer and inner products: ' + t(sh.b + 'x+' + sh.a + 'x') + '.' }] },
              t('(x+' + sh.a + ')(x+' + sh.b + ')=' + Y.seq([mono(1, 'x', 2), mono(sh.b, 'x'), mono(sh.a, 'x'), Y.num(sh.a * sh.b)]) + '=' + tx(R)) + ' m' + t('^{2}'), ['Area = length × width.'], 'plot area');
          } },
          { id: 'e11b', level: 'EMG', make: function (r, sh) {
            var R = lin(4, 2 * (sh.a + sh.b));
            return poly('Write the perimeter of the new plot, ' + t('(x+' + sh.a + '-k)') + ' by ' + t('(x+' + sh.b + '+k)') + ', simplified.', R, { vars: ['k'], wrong: [{ is: lin(2, sh.a + sh.b), code: 'not-doubled', hint: 'A rectangle has <b>two</b> lengths and <b>two</b> widths: ' + t('P=2(l+w)') + '.' }] },
              t('P=2\\left[(x+' + sh.a + '-k)+(x+' + sh.b + '+k)\\right]=2(2x+' + (sh.a + sh.b) + ')=' + tx(R)) + '.<br>The ' + t('-k') + ' and ' + t('+k') + ' cancel, so the perimeter is the same for every ' + t('k') + '.',
              ['Perimeter = 2(length + width). Collect like terms: what happens to the ' + t('k') + '’s?'], 'new perimeter');
          } },
          { id: 'e11c', level: 'BEG', make: function (r, sh) {
            var L = lin(1, sh.a - sh.k0), Wd = lin(1, sh.b + sh.k0), R = Y.mul(L, Wd);
            return poly('Take ' + t('k=' + sh.k0) + '. Expand the new area, in m' + t('^{2}') + '.', R, { wrong: [{ is: Y.mul(lin(1, sh.a + sh.k0), lin(1, sh.b - sh.k0)), code: 'factor-swap', hint: 'The <b>length</b> gets shorter (' + t('-k') + ') and the <b>width</b> gets longer (' + t('+k') + ').' }] },
              'Sides: ' + t('x+' + sh.a + '-' + sh.k0 + '=' + tx(L)) + ' and ' + t('x+' + sh.b + '+' + sh.k0 + '=' + tx(Wd)) + '.<br>' + t(bt(L) + bt(Wd) + '=' + tx(R)) + ' m' + t('^{2}'),
              ['Write the two new side lengths first.'], 'new area at k');
          } },
          { id: 'e11d', level: 'EMG', make: function (r, sh) {
            var ch = sh.k0 * (sh.a - sh.b - sh.k0);
            return KP.number('For ' + t('k=' + sh.k0) + ', by how many square metres does the area change? (Use a negative number for a decrease.)', ch, numDiag([[-ch, 'sign', 'Subtract the original area from the new area: new − original.']]),
              t('(' + tx(Y.mul(lin(1, sh.a - sh.k0), lin(1, sh.b + sh.k0))) + ')-(' + tx(Y.mul(lin(1, sh.a), lin(1, sh.b))) + ')=' + ch) + '. The area grows by exactly ' + t(ch) + ' m' + t('^{2}') + ', whatever ' + t('x') + ' is.',
              ['Subtract the original area from the new area. The ' + t('x^{2}') + ' and ' + t('x') + ' terms cancel.'], 'area change at k');
          } },
          { id: 'e11e', level: 'PRG', make: function (r, sh) {
            var d = sh.a - sh.b, R = Y.add(mono(d, 'k'), mono(-1, 'k', 2));
            return poly('Now keep ' + t('k') + ' as a letter. Expand ' + t('(x+' + sh.a + '-k)(x+' + sh.b + '+k)') + ', subtract the original area, and simplify the change.', R, { expanded: false, vars: ['x'], wrong: [{ is: Y.add(mono(d, 'k'), mono(1, 'k', 2)), code: 'sign', hint: 'Check the ' + t('k^{2}') + ' term: ' + t('(-k)(+k)=-k^{2}') + '.' }] },
              t('(x+' + sh.a + '-k)(x+' + sh.b + '+k)=' + Y.seq([mono(1, 'x', 2), mono(sh.b, 'x'), Y.mono(1, { k: 1, x: 1 }), mono(sh.a, 'x'), Y.num(sh.a * sh.b), mono(sh.a, 'k'), Y.mono(-1, { k: 1, x: 1 }), mono(-sh.b, 'k'), mono(-1, 'k', 2)])) + '<br>' + t('=x^{2}+' + (sh.a + sh.b) + 'x+' + sh.a * sh.b + '+' + d + 'k-k^{2}') + ' (the ' + t('kx') + ' terms cancel)<br>Change ' + t('=' + d + 'k-k^{2}=k(' + d + '-k)') + ' m' + t('^{2}'),
              ['Multiply each of the three terms in the first bracket by each of the three in the second (nine products), collect, then subtract ' + t(tx(Y.mul(lin(1, sh.a), lin(1, sh.b)))) + '.'], 'area change in k');
          } },
          { id: 'e11f', level: 'ADV', make: function (r, sh) {
            var d = sh.a - sh.b, want = [0, d];
            return { prompt: 'The change, ' + t(d + 'k-k^{2}=k(' + d + '-k)') + ', contains no ' + t('x') + '. Find <b>every</b> value of ' + t('k') + ' that leaves the area unchanged.', input: { type: 'list' }, key: want, answer: t('k=0') + ' and ' + t('k=' + d), text: 'k values with no area change',
              check: function (resp) {
                if (!resp || !resp.length) return form('empty', 'Add the values one at a time.');
                var bad = resp.filter(function (v) { return v * (d - v) !== 0; });
                if (bad.length) return wrong('not-zero', 'At ' + t('k=' + bad[0]) + ' the change is ' + t(bad[0] + '(' + d + '-' + bad[0] + ')=' + bad[0] * (d - bad[0])) + ', not ' + t(0) + '.');
                if (resp.indexOf(0) < 0) return wrong('zero-missed', 'One more: what if the owner changes nothing at all?');
                if (resp.indexOf(d) < 0) return wrong('missing', 'One more: a product is ' + t(0) + ' when <b>either</b> factor is ' + t(0) + '.');
                return ok();
              },
              solution: 'A product is ' + t(0) + ' only when a factor is ' + t(0) + ': ' + t('k=0') + ' or ' + t(d + '-k=0') + ', so ' + t('k=' + d) + '.<br>' + t('k=0') + ' changes nothing. ' + t('k=' + d) + ' makes the sides ' + t('(x+' + sh.b + ')') + ' by ' + t('(x+' + sh.a + ')') + ' — the same rectangle with length and width swapped.',
              hints: ['When is ' + t('k(' + d + '-k)') + ' equal to ' + t(0) + '?'], bad: [[d], [0], [0, d, 1]] };
          } }] },
      { num: '12',
        shared: function (r) { return pickWhere(function () { return { p: r.int(1, 4), q: r.int(2, 3), s: r.int(1, 3), u: r.int(1, 5) }; }, function (s) { return s.u !== s.p && s.s !== s.q; }); },
        stem: function (sh) { var V = Y.mul(lin(1, sh.p), lin(sh.q, sh.s), lin(1, sh.u)); return 'A closed storage box has volume ' + t('(' + tx(V) + ')') + ' cm' + t('^{3}') + '. Two of its three edges are ' + t(bt(lin(1, sh.p))) + ' cm and ' + t(bt(lin(sh.q, sh.s))) + ' cm.'; },
        parts: [
          { id: 'e12a', level: 'PRG', make: function (r, sh) {
            var G = Y.mul(lin(1, sh.p), lin(sh.q, sh.s)), M = lin(1, sh.u), V = Y.mul(G, M);
            var p = KP.math('Multiply the two known edges, then work backwards to find the third edge.', factorCheck(G, M, V), tx(M),
              t(bt(lin(1, sh.p)) + bt(lin(sh.q, sh.s)) + '=' + tx(G)) + '<br>Third edge: first term ' + t(sh.q + 'x^{3}\\div ' + sh.q + 'x^{2}=x') + ', constant ' + t(cf(V, 'x', 0) + '\\div ' + cf(G, 'x', 0) + '=' + sh.u) + ', so ' + t(bt(M)) + ' cm.<br>Check: ' + t('\\left(' + tx(G) + '\\right)' + bt(M) + '=' + tx(V)) + ' ✓',
              ['Volume = (edge 1)(edge 2)(edge 3). Divide the leading terms, then the constants.'], 'third edge of the box', { keys: 'poly', vars: ['x'] });
            p.bad = [tx(lin(1, -sh.u)), tx(lin(1, sh.u + 1))];
            return p;
          } },
          { id: 'e12b', level: 'PRG', make: function (r, sh) {
            var l = lin(sh.q, sh.s), w = lin(1, sh.p), h = lin(1, sh.u), lw = Y.mul(l, w), lh = Y.mul(l, h), wh = Y.mul(w, h), S = Y.add(lw, lh, wh), SA = Y.scale(S, 2);
            return poly('Using ' + t('SA=2(lw+lh+wh)') + ' with ' + t('l=' + tx(l)) + ', ' + t('w=' + tx(w)) + ' and ' + t('h=' + tx(h)) + ', write and simplify an expression for the surface area in cm' + t('^{2}') + '.', SA, { wrong: [{ is: S, code: 'not-doubled', hint: 'Each face has an opposite face of the same size: double the sum.' }] },
              t('lw=' + tx(lw)) + '<br>' + t('lh=' + tx(lh)) + '<br>' + t('wh=' + tx(wh)) + '<br>Sum: ' + t(tx(S)) + ', so ' + t('SA=2\\left(' + tx(S) + '\\right)=' + tx(SA)) + ' cm' + t('^{2}'),
              ['Expand all three products, add them, then double.'], 'box surface area');
          } },
          { id: 'e12c', level: 'BEG', make: function (r, sh) {
            var SA = Y.scale(Y.add(Y.mul(lin(sh.q, sh.s), lin(1, sh.p)), Y.mul(lin(sh.q, sh.s), lin(1, sh.u)), Y.mul(lin(1, sh.p), lin(1, sh.u))), 2), f = features(SA);
            var fl = [{ name: 'Degree', label: 'degree' }, { name: 'Leading coefficient', label: 'leading coefficient' }, { name: 'Constant term', label: 'constant term' }];
            return KP.fields('State the degree, leading coefficient and constant term of the surface area ' + t(tx(SA)) + '.', fl, [K.number(2), K.number(f.lead), K.number(f.cst)],
              ['2', String(f.lead), String(f.cst)], 'degree ' + t(2) + ', leading coefficient ' + t(f.lead) + ', constant term ' + t(f.cst),
              t(tx(SA)) + ': degree ' + t(2) + ', leading coefficient ' + t(f.lead) + ', constant term ' + t(f.cst) + '. (The volume ' + t(tx(Y.mul(lin(1, sh.p), lin(sh.q, sh.s), lin(1, sh.u)))) + ' has degree ' + t(3) + '.)',
              ['Read them straight off the simplified polynomial.'], 'features of the surface area');
          } },
          { id: 'e12d', level: 'EMG', make: function (r) {
            return KP.mc(r, 'Why does the volume come out one degree higher than the surface area?', [
              { html: 'The volume multiplies <b>three</b> binomials (degrees ' + t('1+1+1=3') + '); each face area multiplies only <b>two</b> (' + t('1+1=2') + '), and adding and doubling can’t raise the degree.', right: true },
              { html: 'Because the surface area is doubled, which lowers its degree.', code: 'opt-double', why: 'Multiplying by a number doesn’t change the degree at all.' },
              { html: 'Because a box has six faces but only one volume.', code: 'opt-faces', why: 'The number of faces changes how many terms you add, not the degree. Count the factors multiplied in each formula.' },
              { html: 'Because adding the three face areas raises the degree by one.', code: 'opt-add', why: 'Adding polynomials never raises the degree. Count the binomial factors multiplied.' }],
              'Degrees add when you multiply: the volume is a product of three binomials (degree ' + t(3) + '); each face is a product of two (degree ' + t(2) + '). Adding the faces and doubling keeps the degree at ' + t(2) + '.',
              ['How many binomials are multiplied in each formula?'], 'why volume degree is higher');
          } },
          { id: 'e12e', level: 'BEG', make: function (r, sh) {
            var l = sh.q + sh.s, w = 1 + sh.p, h = 1 + sh.u, V = l * w * h, SA = 2 * (l * w + l * h + w * h);
            var fl = [{ name: 'Volume', label: 'volume', after: 'cm' + t('^{3}') }, { name: 'Surface area', label: 'surface area', after: 'cm' + t('^{2}') }];
            return KP.fields('Check at ' + t('x=1') + ': find the volume and the surface area.', fl, [K.number(V), K.number(SA, numDiag([[SA / 2, 'not-doubled', 'Double the sum of the three face areas.']]))],
              [String(V), String(SA)], 'volume ' + t(V) + ' cm' + t('^{3}') + ', surface area ' + t(SA) + ' cm' + t('^{2}'),
              'Edges: ' + t(l) + ', ' + t(w) + ' and ' + t(h) + ' cm.<br>' + t('V=' + l + '\\times ' + w + '\\times ' + h + '=' + V) + ' cm' + t('^{3}') + '; ' + t('SA=2(' + l * w + '+' + l * h + '+' + w * h + ')=' + SA) + ' cm' + t('^{2}') + '. Both match the polynomials at ' + t('x=1') + ' ✓',
              ['Find the three real edge lengths first.'], 'box check at x = 1');
          } }] },
      { num: '13', section: 'Extra practice D — Reasoning and error analysis', stem: 'Each claim is about the whole unit. Decide <b>true</b> or <b>false</b> and choose the correct justification.',
        parts: [
          { id: 'e13a', level: 'PRG', make: function (r) {
            var c = r.int(2, 9), d = r.int(2, 9);
            return KP.mc(r, '“The product of two binomials always has three terms.”', [
              { html: '<b>False.</b> ' + t('(x+' + c + ')(x-' + c + ')=x^{2}-' + c * c) + ' has two terms, and ' + t('(x+' + c + ')(y+' + d + ')=xy+' + d + 'x+' + c + 'y+' + c * d) + ' has four.', right: true },
              { html: '<b>True.</b> FOIL always gives four products, and two of them always combine.', code: 'opt-foil', why: 'Try ' + t('(x+' + c + ')(x-' + c + ')') + ': the two middle products cancel completely.' },
              { html: '<b>False</b>, but only because some products have four terms; a product of two binomials never has fewer than three.', code: 'opt-fewer', why: 'A sum times a difference has only two: ' + t('(x+' + c + ')(x-' + c + ')=x^{2}-' + c * c) + '.' },
              { html: '<b>True</b> for binomials in one variable; only products like ' + t('(x+' + c + ')(y+' + d + ')') + ' break the rule.', code: 'opt-onevar', why: t('(x+' + c + ')(x-' + c + ')') + ' is in one variable and has two terms.' }],
              '<b>False.</b> Fewer: ' + t('(x+' + c + ')(x-' + c + ')=x^{2}-' + c * c) + ' (the middle terms cancel). More: ' + t('(x+' + c + ')(y+' + d + ')') + ' has four terms, since no two partial products are like terms. Three is only the usual case.',
              ['Try a sum times a difference, and a product with two different letters.'], 'claim: binomial × binomial has 3 terms');
          } },
          { id: 'e13b', level: 'PRG', make: function (r) {
            var c = r.int(2, 9);
            return KP.mc(r, '“The degree of a product is the sum of the degrees of the two factors.”', [
              { html: '<b>True.</b> The leading terms ' + t('px^{m}') + ' and ' + t('qx^{n}') + ' multiply to ' + t('pq\\,x^{m+n}') + ' with ' + t('pq\\neq 0') + ', and every other partial product has a lower degree, so nothing can cancel it.', right: true },
              { html: '<b>False:</b> ' + t('(x+' + c + ')(x-' + c + ')=x^{2}-' + c * c) + ', where the middle terms cancel.', code: 'opt-dos', why: 'The middle terms cancel, but ' + t('x^{2}') + ' is still there: degree ' + t('2=1+1') + '.' },
              { html: '<b>False:</b> ' + t('(x^{3}+2x)+(-x^{3}+' + c + ')=2x+' + c) + ' has degree ' + t(1) + '.', code: 'opt-sum', why: 'That is a <b>sum</b>, not a product.' },
              { html: '<b>True</b>, but only when all the coefficients are positive.', code: 'opt-pos', why: 'Signs don’t matter: ' + t('pq\\neq 0') + ' whenever ' + t('p\\neq 0') + ' and ' + t('q\\neq 0') + '.' }],
              '<b>True.</b> If the leading terms are ' + t('px^{m}') + ' and ' + t('qx^{n}') + ' (' + t('p,q\\neq 0') + '), their product ' + t('pq\\,x^{m+n}') + ' has ' + t('pq\\neq 0') + '. Every other partial product uses a lower-degree term, so it has degree less than ' + t('m+n') + ' and can’t cancel it.',
              ['Which partial product has the highest degree? Can anything else reach that degree?'], 'claim: degree of a product');
          } },
          { id: 'e13c', level: 'PRG', make: function (r) {
            var c = r.int(2, 9);
            return KP.mc(r, '“The degree of a <b>sum</b> is the sum of the degrees.”', [
              { html: '<b>False.</b> The degree of a sum is the larger of the two degrees — or less, if the leading terms cancel, as in ' + t('(x^{3}+2x)+(-x^{3}+' + c + ')=2x+' + c) + '.', right: true },
              { html: '<b>True:</b> degrees add, just as they do for products.', code: 'opt-true', why: 'Try ' + t('(x^{2}+1)+x^{3}=x^{3}+x^{2}+1') + ': degree ' + t(3) + ', not ' + t(5) + '. Adding never multiplies powers together.' },
              { html: '<b>False.</b> The degree of a sum is always exactly the larger of the two degrees.', code: 'opt-always', why: 'Not always: if the leading terms cancel, the degree drops, e.g. ' + t('(x^{3}+2x)+(-x^{3}+' + c + ')=2x+' + c) + '.' },
              { html: '<b>False.</b> The degree of a sum is the smaller of the two degrees.', code: 'opt-smaller', why: 'Try ' + t('(x^{2}+1)+x^{3}') + ': the ' + t('x^{3}') + ' term is still there.' }],
              '<b>False.</b> ' + t('(x^{3}+2x)+(-x^{3}+' + c + ')=2x+' + c) + ': two degree-' + t(3) + ' polynomials with a sum of degree ' + t(1) + ', not ' + t(6) + '. The degree of a sum is the <b>larger</b> of the two degrees, except when the leading terms cancel (same degree, opposite coefficients) — then it drops.',
              ['Add two polynomials and look at the highest power that survives.'], 'claim: degree of a sum');
          } },
          { id: 'e13d', level: 'PRG', make: function (r) {
            var k = r.int(1, 3), T = quad(1, k, k * k), R = Y.mul(lin(1, -k), T);
            return KP.mc(r, '“A binomial times a trinomial always has exactly six terms.”', [
              { html: '<b>False.</b> Six counts the <i>partial products</i>. At most six terms survive, as in ' + t('(x+y)(a+b+c)') + ', and like terms can collapse it, e.g. ' + t(bt(lin(1, -k)) + '\\left(' + tx(T) + '\\right)=' + tx(R)) + '.', right: true },
              { html: '<b>True:</b> ' + t('2\\times 3=6') + ' terms every time.', code: 'opt-true', why: 'Expand ' + t(bt(lin(1, -k)) + '\\left(' + tx(T) + '\\right)') + ': almost everything cancels.' },
              { html: '<b>False:</b> after collecting it always has exactly four terms.', code: 'opt-four', why: t('(x+y)(a+b+c)') + ' keeps all six terms, and ' + t(bt(lin(1, -k)) + '\\left(' + tx(T) + '\\right)') + ' has only two.' },
              { html: '<b>False:</b> it can have more than six terms.', code: 'opt-more', why: 'Each term of the answer comes from a partial product, and there are only ' + t('2\\times 3=6') + ' of them.' }],
              '<b>False.</b> Six is the number of partial products (' + t('2\\times 3') + '), so six is the <b>most</b> that can survive, e.g. ' + t('(x+y)(a+b+c)') + '. Like terms can collect or cancel: ' + t(bt(lin(1, -k)) + '\\left(' + tx(T) + '\\right)=' + tx(Y.mul(mono(1, 'x'), T)) + plusTex(Y.mul(Y.num(-k), T)) + '=' + tx(R)) + ' has two terms.',
              ['Expand ' + t(bt(lin(1, -k)) + '\\left(' + tx(T) + '\\right)') + '.'], 'claim: binomial × trinomial has 6 terms');
          } }] },
      { num: '14',
        shared: function (r) { return pickWhere(function () { return { m: r.pick([2, 2, 3]), p: r.int(2, 5), q: r.int(1, 4), rr: r.int(1, 4), s: r.int(2, 7) }; }, function (s) { return ex14(s).okay; }); },
        stem: function (sh) { var w = ex14(sh); return 'A student was asked to simplify ' + t(w.exprTex) + ' and wrote:\\[\\begin{array}{ll}' + w.exprTex + ' & \\\\ =' + w.l1 + ' & \\text{Line 1}\\\\ =' + w.l2 + ' & \\text{Line 2}\\\\ =' + w.l3 + ' & \\text{Line 3}\\end{array}\\]<b>Line 4:</b> “a polynomial of degree ' + t(3) + ' with leading coefficient ' + t(1) + '”.<br>There are <b>three</b> separate errors in this work.'; },
        parts: [
          { id: 'e14a', level: 'BEG', make: function (r, sh) {
            var w = ex14(sh), fl = [{ name: 'Original', label: 'original expression at ' + t('x=1') }, { name: 'Line 3', label: 'Line 3 at ' + t('x=1') }];
            return KP.fields('Substitute ' + t('x=1') + ' into the original expression and into Line 3.', fl, [K.number(w.v0), K.number(w.v3)], [String(w.v0), String(w.v3)], t(w.v0) + ' and ' + t(w.v3),
              'Original: ' + t(sh.m + '(1-' + sh.p + ')^{2}-(1+' + sh.q + ')(1-' + sh.rr + '+' + sh.s + ')=' + sh.m * (1 - sh.p) * (1 - sh.p) + '-' + (1 + sh.q) * (1 - sh.rr + sh.s) + '=' + w.v0) + '.<br>Line 3: ' + t(w.v3) + '. They are different, so the work is wrong.',
              ['Replace every ' + t('x') + ' with ' + t(1) + '.'], 'substitution check x = 1');
          } },
          { id: 'e14b', level: 'PRG', make: function (r, sh) {
            var rows = [1, 2, 3, 4].map(function (n) { return { id: 'L' + n, html: 'Line ' + n }; }), cols = [{ id: 'ok', html: 'correct' }, { id: 'err', html: 'error' }];
            var why = { L1: 'Line 1: is ' + t('(x-' + sh.p + ')^{2}') + ' really ' + t('x^{2}-' + sh.p * sh.p) + '?', L2: 'Line 2: check the sign of every term after the minus sign in front of the bracket.', L3: 'Line 3 only collects the terms of Line 2 — check whether it does that correctly.', L4: 'Line 4: what is the coefficient of ' + t('x^{3}') + ' in Line 3?' };
            return KP.grid('For each line, decide whether the step is correct or contains an error.', rows, cols, { L1: 'err', L2: 'err', L3: 'ok', L4: 'err' }, { why: function (row) { return { code: 'line-error', hint: why[row] }; } },
              '<b>Line 1:</b> error — ' + t('(x-' + sh.p + ')^{2}') + ' is a square, ' + t('x^{2}-' + 2 * sh.p + 'x+' + sh.p * sh.p) + ', not ' + t('x^{2}-' + sh.p * sh.p) + '.<br><b>Line 2:</b> error — the minus sign was not applied to the last term: ' + t('-(+' + sh.q * sh.s + ')=-' + sh.q * sh.s) + '.<br><b>Line 3:</b> correct — it collects Line 2 properly.<br><b>Line 4:</b> error — the leading term is ' + t('-x^{3}') + ', so the leading coefficient is ' + t(-1) + '.',
              ['Check each line only against the line before it.'], 'which lines have errors');
          } },
          { id: 'e14c', level: 'EMG', make: function (r, sh) {
            var p = sh.p, m = sh.m;
            return KP.mc(r, 'What is the error in Line 1?', [
              { html: t('(x-' + p + ')^{2}') + ' was written as ' + t('x^{2}-' + p * p) + ' (the sum-times-difference pattern). The square has a middle term: ' + t('x^{2}-' + 2 * p + 'x+' + p * p) + '.', right: true },
              { html: 'The ' + t(m) + ' should have been multiplied into the bracket before squaring.', code: 'opt-distribute', why: 'Order of operations: square first, then multiply by ' + t(m) + '. Multiplying in first would be a second error.' },
              { html: 'The product ' + t('(x+' + sh.q + ')\\left(' + tx(quad(1, -sh.rr, sh.s)) + '\\right)') + ' was expanded incorrectly.', code: 'opt-product', why: 'Check it: ' + t('(x+' + sh.q + ')\\left(' + tx(quad(1, -sh.rr, sh.s)) + '\\right)=' + tx(ex14(sh).prod)) + ' — that part is right.' },
              { html: 'There is no error in Line 1; all the errors are later.', code: 'opt-none', why: 'Expand ' + t('(x-' + p + ')^{2}') + ' carefully: how many terms does it have?' }],
              t('(x-' + p + ')^{2}=x^{2}-' + 2 * p + 'x+' + p * p) + '. Writing ' + t('x^{2}-' + p * p) + ' uses the sum-times-difference pattern and loses the middle term.',
              ['Expand ' + t('(x-' + p + ')(x-' + p + ')') + ' yourself.'], 'Line 1 error');
          } },
          { id: 'e14d', level: 'PRG', make: function (r, sh) {
            var w = ex14(sh);
            return poly('Redo the whole simplification correctly, in descending order.', w.correct, { order: 'desc', var: 'x', wrong: [
              { is: w.res3, code: 'no-middle', hint: 'That is the student’s answer. ' + t('(x-' + sh.p + ')^{2}') + ' has a middle term.' },
              { is: Y.sub(Y.scale(quad(1, 0, -sh.p * sh.p), sh.m), w.prod), code: 'no-middle', hint: t('(x-' + sh.p + ')^{2}=x^{2}-' + 2 * sh.p + 'x+' + sh.p * sh.p) + ' — don’t forget the middle term.' },
              { is: Y.add(Y.scale(w.sq, sh.m), Y.neg(w.prod), Y.num(2 * sh.q * sh.s)), code: 'sub-sign', hint: 'The minus in front of the product changes the sign of <b>every</b> term, including the constant.' }] },
              t(sh.m + '(x-' + sh.p + ')^{2}=' + sh.m + '\\left(' + tx(w.sq) + '\\right)=' + tx(Y.scale(w.sq, sh.m))) + '<br>' + t('(x+' + sh.q + ')\\left(' + tx(quad(1, -sh.rr, sh.s)) + '\\right)=' + tx(w.prod)) + '<br>' + t(tx(Y.scale(w.sq, sh.m)) + plusTex(Y.neg(w.prod)) + '=' + ord(w.correct)),
              ['Square first (with the middle term), multiply by ' + t(sh.m) + ', expand the product, then subtract the whole product.'], 'correct simplification');
          } },
          { id: 'e14e', level: 'BEG', make: function (r, sh) {
            var w = ex14(sh), f = features(w.correct), fl = [{ name: 'Degree', label: 'degree' }, { name: 'Leading coefficient', label: 'leading coefficient' }, { name: 'Constant term', label: 'constant term' }];
            return KP.fields('State the degree, leading coefficient and constant term of your correct answer.', fl, [K.number(3), K.number(-1, numDiag([[1, 'lead-wrong', 'The leading term is ' + t('-x^{3}') + ': its coefficient is ' + t(-1) + '.']])), K.number(f.cst)],
              ['3', '-1', String(f.cst)], 'degree ' + t(3) + ', leading coefficient ' + t(-1) + ', constant term ' + t(f.cst),
              t(ord(w.correct)) + ': degree ' + t(3) + ', leading coefficient ' + t(-1) + ', constant term ' + t(f.cst) + '. At ' + t('x=1') + ' it gives ' + t(Y.at(w.correct, { x: 1 })) + ', matching the original ✓',
              ['Read them off your answer to the previous part.'], 'features of the corrected answer');
          } }] },
      { num: '15',
        shared: function (r) { return pickWhere(function () { return { a: r.int(1, 4), b: r.int(1, 5), c: r.int(2, 7) }; }, function (s) { return s.a * s.b - s.c !== 0 && s.a + s.b !== 0; }); },
        stem: function (sh) { return '<b>Substitution as a check — and its limits.</b> A student claims ' + t(ex15(sh).claimTex) + '.'; },
        parts: [
          { id: 'e15a', level: 'EMG', make: function (r, sh) {
            var w = ex15(sh);
            return poly('Expand the left side correctly.', w.R, { wrong: [{ is: w.S, code: 'drop-term', hint: 'That is the student’s answer. Check the ' + t('x') + ' terms: there are two of them to collect.' }] },
              t(w.lhs + '=' + tx(Y.mul(mono(1, 'x'), w.T)) + plusTex(Y.mul(Y.num(sh.a), w.T)) + '=' + tx(w.R)) + '.<br>The student’s ' + t('x') + ' coefficient is wrong: ' + t(tx(mono(-sh.c, 'x')) + '+' + sh.a * sh.b + 'x=' + tx(mono(sh.a * sh.b - sh.c, 'x'))) + '.',
              ['Multiply ' + t('x') + ' and then ' + t(sh.a) + ' by each term of the trinomial.'], 'correct expansion');
          } },
          { id: 'e15b', level: 'EMG', make: function (r, sh) {
            var v = -sh.a * sh.c;
            return KP.mc(r, 'Substitute ' + t('x=0') + ' into the original product and into the student’s answer. What happens, and what would a student who checked only at ' + t('x=0') + ' conclude?', [
              { html: 'Both give ' + t(v) + ', so the student would wrongly conclude the expansion is correct.', right: true },
              { html: 'They give different values, so the student would find the error.', code: 'opt-diff', why: 'Work them out: the product gives ' + t('(' + sh.a + ')(' + -sh.c + ')=' + v) + ' and the student’s answer gives ' + t(v) + ' too.' },
              { html: 'Both give ' + t(0) + ', so substituting ' + t('x=0') + ' tells you nothing.', code: 'opt-zero', why: 'The constant terms don’t vanish: both sides give ' + t(v) + '.' },
              { html: 'Both give ' + t(v) + ', which proves the expansion is correct.', code: 'opt-proof', why: 'One matching value doesn’t prove two polynomials are equal — and here the expansion is wrong.' }],
              'Product: ' + t('(0+' + sh.a + ')(0+0-' + sh.c + ')=' + v) + '. Student: ' + t('0+0-0' + (v < 0 ? '' : '+') + v + '=' + v) + '. They agree, so checking only at ' + t('x=0') + ' would wrongly suggest the expansion is right.',
              ['At ' + t('x=0') + ' only the constant terms are left.'], 'check at x = 0');
          } },
          { id: 'e15c', level: 'BEG', make: function (r, sh) {
            var w = ex15(sh), a = Y.at(w.R, { x: 2 }), b = Y.at(w.S, { x: 2 }), fl = [{ name: 'Product', label: 'original product at ' + t('x=2') }, { name: 'Student', label: 'student’s answer at ' + t('x=2') }];
            return KP.fields('Now check at ' + t('x=2') + '.', fl, [K.number(a), K.number(b)], [String(a), String(b)], t(a) + ' and ' + t(b),
              'Product: ' + t('(2+' + sh.a + ')(4+' + 2 * sh.b + '-' + sh.c + ')=' + (2 + sh.a) + '\\times ' + (4 + 2 * sh.b - sh.c) + '=' + a) + '. Student: ' + t(b) + '. They disagree, so the claim is wrong.',
              ['Replace every ' + t('x') + ' with ' + t(2) + '.'], 'check at x = 2');
          } },
          { id: 'e15d', level: 'EMG', make: function (r, sh) {
            var w = ex15(sh), D = mono(sh.a * sh.b, 'x');
            return poly('Subtract the student’s answer from the correct expansion and simplify.', D, { wrong: [{ is: Y.neg(D), code: 'sign-all', hint: 'Correct expansion <b>minus</b> the student’s answer.' }] },
              t('(' + tx(w.R) + ')-(' + tx(w.S) + ')=' + tx(D)) + '.<br>The two expressions agree only where ' + t(tx(D) + '=0') + ', that is, only at ' + t('x=0') + ' — the one value that can never catch this error.',
              ['Change every sign of the student’s answer, then collect like terms. Most terms cancel.'], 'difference of the two answers');
          } },
          { id: 'e15e', level: 'PRG', make: function (r) {
            return KP.mc(r, 'Two cubic expressions agree at three different values of ' + t('x') + '. Does that <b>prove</b> they are equal?', [
              { html: 'No. Their difference can be ' + t(0) + ' at up to three values without being ' + t(0) + ' everywhere; only expanding and matching every coefficient is a proof (four agreeing values would settle it).', right: true },
              { html: 'Yes. Three agreements can’t all be accidents.', code: 'opt-yes', why: 'Their difference is a polynomial of degree at most ' + t(3) + ', which can be ' + t(0) + ' at three values, e.g. ' + t('(x-1)(x-2)(x-3)') + '.' },
              { html: 'Yes, as long as one of the values is ' + t('x=0') + '.', code: 'opt-zero', why: t('x=0') + ' is the weakest test of all: it only checks the constant terms.' },
              { html: 'No. Substitution can never tell you anything about an expansion.', code: 'opt-never', why: 'A disagreeing value proves the expansion is <b>wrong</b>, and agreements are good evidence — just not a proof.' }],
              'One agreement can be an accident, and three are strong evidence. But two different cubics can agree at three values: their difference, such as ' + t('(x-1)(x-2)(x-3)') + ', can be ' + t(0) + ' at up to three values. Only the algebra — expanding and matching every coefficient — is a proof.',
              ['Think about the difference of the two expressions: how many zeros can a polynomial of degree ' + t(3) + ' have?'], 'do agreements prove equality');
          } }] },
      { num: '16', section: 'Extra practice E — Challenge', stem: '<b>Group before you expand.</b> Each of these becomes short if you first treat a whole bracketful of terms as a single letter.',
        parts: [
          { id: 'e16a', level: 'ADV', make: function (r) {
            var k = r.int(2, 6), xy = Y.add(mono(1, 'x'), mono(1, 'y')), R = Y.add(Y.mono(4, { x: 1, y: 1 }), Y.num(-k * k)), sq = Y.pow(Y.add(mono(1, 'x'), mono(-1, 'y')), 2);
            return poly('Expand and simplify ' + t('\\big[(x+y)+' + k + '\\big]\\big[(x+y)-' + k + '\\big]-(x-y)^{2}') + '.', R, { wrong: [
              { is: Y.sub(Y.sub(Y.pow(xy, 2), Y.num(k * k)), Y.add(mono(1, 'x', 2), mono(-1, 'y', 2))), code: 'no-middle', hint: t('(x-y)^{2}=x^{2}-2xy+y^{2}') + ' — it has a middle term.' },
              { is: Y.add(Y.pow(xy, 2), Y.num(-k * k), mono(-1, 'x', 2), Y.mono(-2, { x: 1, y: 1 }), mono(1, 'y', 2)), code: 'sub-sign', hint: 'Subtract the <b>whole</b> square: ' + t('-(x^{2}-2xy+y^{2})=-x^{2}+2xy-y^{2}') + '.' }] },
              'Let ' + t('a=x+y') + ': ' + t('(a+' + k + ')(a-' + k + ')=a^{2}-' + k * k + '=(x+y)^{2}-' + k * k + '=x^{2}+2xy+y^{2}-' + k * k) + '.<br>Subtract ' + t('(x-y)^{2}=x^{2}-2xy+y^{2}') + ': ' + t('x^{2}+2xy+y^{2}-' + k * k + '-x^{2}+2xy-y^{2}=' + tx(R)),
              ['Treat ' + t('x+y') + ' as one quantity ' + t('a') + ': the first product is ' + t('(a+' + k + ')(a-' + k + ')') + '.'], 'grouped sum × difference');
          } },
          { id: 'e16b', level: 'ADV', make: function (r) {
            var k = r.int(1, 3), kc = (k === 1 ? '' : k) + 'c', R = Y.add(Y.mono(4, { a: 1, b: 1 }), mono(-k * k, 'c', 2));
            return poly('Expand and simplify ' + t('(a+b+' + kc + ')(a+b-' + kc + ')-(a-b)^{2}') + '.', R, { wrong: [{ is: Y.add(Y.mono(2, { a: 1, b: 1 }), mono(2, 'b', 2), mono(-k * k, 'c', 2)), code: 'no-middle', hint: t('(a-b)^{2}=a^{2}-2ab+b^{2}') + ' — it has a middle term.' }] },
              'Let ' + t('A=a+b') + ': ' + t('(A+' + kc + ')(A-' + kc + ')=A^{2}-' + tx(mono(k * k, 'c', 2)) + '=a^{2}+2ab+b^{2}-' + tx(mono(k * k, 'c', 2))) + '.<br>Subtract ' + t('(a-b)^{2}=a^{2}-2ab+b^{2}') + ': ' + t('=' + tx(R)),
              ['Treat ' + t('a+b') + ' as one quantity.'], 'grouped trinomials');
          } },
          { id: 'e16c', level: 'PRG', make: function (r) {
            var s = pickWhere(function () { return { k: r.int(1, 3), m: r.int(1, 4) }; }, function (s) { return 2 * s.m - s.k * s.k !== 0; });
            var A = quad(1, s.k, s.m), B = quad(1, -s.k, s.m), R = Y.mul(A, B), G = Y.add(mono(1, 'x', 2), Y.num(s.m));
            return poly('Expand ' + t('\\left(' + tx(A) + '\\right)\\left(' + tx(B) + '\\right)') + '. (Hint: group as ' + t('(' + tx(G) + ')+' + tx(mono(s.k, 'x'))) + ' and ' + t('(' + tx(G) + ')-' + tx(mono(s.k, 'x'))) + '.)', R, { wrong: [{ is: Y.sub(Y.pow(G, 2), mono(s.k, 'x', 2)), code: 'exponent', hint: t('(' + tx(mono(s.k, 'x')) + ')^{2}=' + tx(mono(s.k * s.k, 'x', 2))) + ': square the coefficient too.' }] },
              t('A=' + tx(G)) + ', ' + t('B=' + tx(mono(s.k, 'x'))) + ': ' + t('(A+B)(A-B)=A^{2}-B^{2}=(' + tx(G) + ')^{2}-' + tx(mono(s.k * s.k, 'x', 2)) + '=' + tx(Y.pow(G, 2)) + plusTex(mono(-s.k * s.k, 'x', 2)) + '=' + tx(R)),
              ['With the grouping, it is a sum times a difference.'], 'grouped trinomial product');
          } },
          { id: 'e16d', level: 'ADV', make: function (r) {
            var k = r.int(1, 3), k3 = Math.pow(k, 3), R = Y.add(mono(1, 'x', 6), Y.num(-k3 * k3));
            var T1 = quad(1, k, k * k), T2 = quad(1, -k, k * k), Pq = Y.mul(T1, T2);
            return poly('Expand ' + t('(x-' + k + ')(x+' + k + ')\\left(' + tx(T1) + '\\right)\\left(' + tx(T2) + '\\right)') + ' in two short steps.', R, { wrong: [{ is: Y.add(mono(1, 'x', 6), Y.num(k3 * k3)), code: 'dos-sign', hint: t('(x-' + k + ')(x+' + k + ')=x^{2}-' + k * k) + ': check the sign of the constant.' }] },
              'Step 1: ' + t('(x-' + k + ')(x+' + k + ')=x^{2}-' + k * k) + ' and, grouping as a sum times a difference, ' + t('\\left(' + tx(T1) + '\\right)\\left(' + tx(T2) + '\\right)=' + tx(Pq)) + '.<br>Step 2: ' + t('(x^{2}-' + k * k + ')\\left(' + tx(Pq) + '\\right)=' + tx(R)) + '.<br>Check at ' + t('x=2') + ': ' + t('(' + (2 - k) + ')(' + (2 + k) + ')(' + (4 + 2 * k + k * k) + ')(' + (4 - 2 * k + k * k) + ')=' + Y.at(R, { x: 2 }) + '=2^{6}-' + k3 * k3) + ' ✓',
              ['Pair the factors into two sums × differences first.'], 'four-factor product');
          } }] },
      { num: '17',
        shared: function (r) { return { k: r.pick([1, 1, 2]), n1: r.pick([20, 30, 40, 50]), n2: r.pick([20, 30, 40, 50, 60]), N: r.int(14, 30) }; },
        stem: function (sh) { return sh.k === 1 ? '<b>Three consecutive integers</b> can be written ' + t('n-1') + ', ' + t('n') + ' and ' + t('n+1') + '.' : '<b>Three consecutive even integers</b> can be written ' + t('n-2') + ', ' + t('n') + ' and ' + t('n+2') + '.'; },
        parts: [
          { id: 'e17a', level: 'BEG', make: function (r, sh) {
            var k = sh.k, R = quad(1, 0, -k * k, 'n');
            return poly('Expand ' + t('(n-' + k + ')(n+' + k + ')') + '.', R, { wrong: [{ is: quad(1, 0, k * k, 'n'), code: 'dos-sign', hint: t('(-' + k + ')(+' + k + ')=-' + k * k) + '.' }] },
              t('(n-' + k + ')(n+' + k + ')=n^{2}+' + (k === 1 ? '' : k) + 'n-' + (k === 1 ? '' : k) + 'n-' + k * k + '=' + tx(R)) + '. The product of the outer two is always exactly ' + t(k * k) + ' less than the square of the middle one.',
              ['A sum times a difference: the middle terms cancel.'], 'outer product');
          } },
          { id: 'e17b', level: 'EMG', make: function (r, sh) {
            var k = sh.k, R = Y.add(mono(1, 'n', 3), mono(-k * k, 'n'));
            return poly('Expand ' + t('(n-' + k + ')n(n+' + k + ')') + ' and write the result in descending order.', R, { order: 'desc', var: 'n', wrong: [{ is: Y.add(mono(1, 'n', 3), Y.num(-k * k)), code: 'q-not-mult', hint: 'Multiply <b>every</b> term of ' + t('n^{2}-' + k * k) + ' by ' + t('n') + '.' }] },
              t('(n-' + k + ')n(n+' + k + ')=n(n^{2}-' + k * k + ')=' + tx(R)) + ': degree ' + t(3) + ', constant term ' + t(0) + '.',
              ['Multiply the outer two first (you just did), then multiply by ' + t('n') + '.'], 'product of three consecutive');
          } },
          { id: 'e17c', level: 'BEG', make: function (r, sh) {
            var k = sh.k, n = sh.n1, v = n * n * n - k * k * n;
            return KP.number('Use ' + t('n^{3}-' + (k === 1 ? '' : k * k) + 'n') + ' to evaluate ' + t((n - k) + '\\times ' + n + '\\times ' + (n + k)) + ' without a calculator.', v, numDiag([[n * n * n, 'drop-term', 'Don’t forget to subtract ' + t((k === 1 ? '' : k * k + '\\times ') + n) + '.']]),
              'Middle number ' + t('n=' + n) + ': ' + t((n - k) + '\\times ' + n + '\\times ' + (n + k) + '=' + n + '^{3}-' + (k === 1 ? '' : k * k + '(') + n + (k === 1 ? '' : ')') + '=' + F(n * n * n) + '-' + k * k * n + '=' + F(v)) + '.',
              ['Which number plays the part of ' + t('n') + '?'], 'evaluate product using n³ − k²n');
          } },
          { id: 'e17d', level: 'EMG', make: function (r, sh) {
            var k = sh.k, R = quad(3, 0, 2 * k * k, 'n');
            return poly('Expand ' + t('(n-' + k + ')^{2}+n^{2}+(n+' + k + ')^{2}') + ' and simplify.', R, { wrong: [{ is: quad(3, 0, 0, 'n'), code: 'cancel-missed', hint: 'The constants ' + t(k * k) + ' and ' + t(k * k) + ' don’t cancel — they add.' }, { is: quad(3, 0, -2 * k * k, 'n'), code: 'sign', hint: t('(-' + k + ')^{2}=+' + k * k) + '.' }] },
              t('(n^{2}-' + 2 * k + 'n+' + k * k + ')+n^{2}+(n^{2}+' + 2 * k + 'n+' + k * k + ')=' + tx(R)) + '. The ' + t('-' + 2 * k + 'n') + ' and ' + t('+' + 2 * k + 'n') + ' cancel: the two outer squares differ only in the sign of their middle term.',
              ['Expand both squares (each has a middle term), then collect.'], 'sum of three squares');
          } },
          { id: 'e17e', level: 'BEG', make: function (r, sh) {
            var k = sh.k, n = sh.n2, v = 3 * n * n + 2 * k * k;
            return KP.number('Use your answer to (d) to evaluate ' + t((n - k) + '^{2}+' + n + '^{2}+' + (n + k) + '^{2}') + ' mentally.', v, numDiag([[3 * n * n, 'drop-term', 'Add the ' + t(2 * k * k) + ' too.']]),
              t('n=' + n) + ': ' + t('3(' + n + ')^{2}+' + 2 * k * k + '=' + F(3 * n * n) + '+' + 2 * k * k + '=' + F(v)) + '. Check: ' + t(F((n - k) * (n - k)) + '+' + F(n * n) + '+' + F((n + k) * (n + k)) + '=' + F(v)) + ' ✓',
              ['Which number is ' + t('n') + '?'], 'evaluate sum of squares');
          } },
          { id: 'e17f', level: 'PRG', make: function (r, sh) {
            var k = sh.k, C = Y.pow(lin(1, k, 'n'), 3), R = Y.sub(C, mono(1, 'n', 3));
            return poly('Expand ' + t('(n+' + k + ')^{3}-n^{3}') + '.', R, { wrong: [{ is: Y.num(k * k * k), code: 'cube-each', hint: 'You can’t cube each term separately: ' + t('(n+' + k + ')^{3}=(n+' + k + ')(n+' + k + ')(n+' + k + ')') + '.' }] },
              t('(n+' + k + ')^{3}=(n+' + k + ')(' + tx(Y.pow(lin(1, k, 'n'), 2)) + ')=' + tx(C)) + '<br>' + t('(n+' + k + ')^{3}-n^{3}=' + tx(R)),
              ['Expand ' + t('(n+' + k + ')^{2}') + ' first, then multiply by ' + t('(n+' + k + ')') + '.'], 'difference of cubes of neighbours');
          } },
          { id: 'e17g', level: 'BEG', make: function (r, sh) {
            var k = sh.k, N = sh.N, v = 3 * k * N * N + 3 * k * k * N + k * k * k;
            return KP.number('Use your answer to (f) to find ' + t((N + k) + '^{3}-' + N + '^{3}') + ' without cubing anything.', v, null,
              t('n=' + N) + ': ' + t(3 * k + '(' + N + ')^{2}+' + 3 * k * k + '(' + N + ')+' + k * k * k + '=' + F(3 * k * N * N) + '+' + 3 * k * k * N + '+' + k * k * k + '=' + F(v)) + '.',
              ['Substitute ' + t('n=' + N) + ' into your answer to (f).'], 'evaluate difference of cubes');
          } }] },
      { num: '18',
        shared: function (r) { var S = r.sample([[4, 2, 2], [64, 8, 4], [324, 18, 6]], 2); return { one: S[0], two: S[1] }; },
        stem: '<b>An identity worth keeping.</b> Consider ' + t('(x^{2}+ax+b)(x^{2}-ax+b)') + ', where ' + t('a') + ' and ' + t('b') + ' are numbers.',
        parts: [
          { id: 'e18a', level: 'ADV', make: function () {
            var R = Y.add(mono(1, 'x', 4), Y.mono(2, { b: 1, x: 2 }), Y.mono(-1, { a: 2, x: 2 }), mono(1, 'b', 2));
            return poly('Expand it fully. (Hint: group as ' + t('(x^{2}+b)+ax') + ' and ' + t('(x^{2}+b)-ax') + '.)', R, { var: 'x', wrong: [{ is: Y.add(mono(1, 'x', 4), Y.mono(2, { b: 1, x: 2 }), Y.mono(1, { a: 2, x: 2 }), mono(1, 'b', 2)), code: 'dos-sign', hint: t('(A+B)(A-B)=A^{2}-B^{2}') + ': the ' + t('a^{2}x^{2}') + ' term is subtracted.' }, { is: Y.add(mono(1, 'x', 4), Y.mono(-1, { a: 2, x: 2 }), mono(1, 'b', 2)), code: 'no-middle', hint: t('(x^{2}+b)^{2}') + ' has a middle term, ' + t('2bx^{2}') + '.' }] },
              t('\\big[(x^{2}+b)+ax\\big]\\big[(x^{2}+b)-ax\\big]=(x^{2}+b)^{2}-(ax)^{2}') + '<br>' + t('=x^{4}+2bx^{2}+b^{2}-a^{2}x^{2}=x^{4}+(2b-a^{2})x^{2}+b^{2}') + '<br>The odd-degree terms (' + t('x^{3}') + ' and ' + t('x') + ') all cancel.',
              ['With the grouping it is a sum times a difference: ' + t('A=x^{2}+b') + ', ' + t('B=ax') + '.'], 'identity expansion');
          } },
          { id: 'e18b', level: 'ADV', make: function (r, sh) {
            var K0 = sh.one[0], b = sh.one[1], a = sh.one[2], fl = [{ name: 'a', label: t('a') }, { name: 'b', label: t('b') }];
            var p = KP.fields('Choose ' + t('a') + ' and ' + t('b') + ' (with ' + t('a>0') + ') so that the ' + t('x^{2}') + ' term vanishes as well and the product is exactly ' + t('x^{4}+' + K0) + '.', fl,
              [K.number(a, numDiag([[2 * b, 'cs-half', t('2b-a^{2}=0') + ' means ' + t('a^{2}=2b=' + 2 * b) + ', so ' + t('a') + ' is the square root of ' + t(2 * b) + '.'], [-a, 'neg-a', 'Take ' + t('a>0') + '.'], [b, 'a-b-swap', 'That is ' + t('b') + '. You need ' + t('a^{2}=2b') + '.']])),
                K.number(b, numDiag([[K0, 'cs-q', t('b^{2}=' + K0) + ', so ' + t('b') + ' is the square root of ' + t(K0) + '.'], [-b, 'neg-a', 'With ' + t('b=-' + b) + ' you would need ' + t('a^{2}=2b<0') + ', which is impossible.']]))],
              [String(a), String(b)], t('a=' + a) + ', ' + t('b=' + b) + ': ' + t('x^{4}+' + K0 + '=\\left(' + tx(quad(1, a, b)) + '\\right)\\left(' + tx(quad(1, -a, b)) + '\\right)'),
              'Need ' + t('b^{2}=' + K0) + ' and ' + t('2b-a^{2}=0') + '. ' + t('b=' + b) + ' gives ' + t('a^{2}=' + 2 * b) + ', so ' + t('a=' + a) + '. (' + t('b=-' + b) + ' would need ' + t('a^{2}=-' + 2 * b) + ', impossible.)<br>' + t('x^{4}+' + K0 + '=\\left(' + tx(quad(1, a, b)) + '\\right)\\left(' + tx(quad(1, -a, b)) + '\\right)'),
              ['Use ' + t('x^{4}+(2b-a^{2})x^{2}+b^{2}') + ': match the constant, and make the ' + t('x^{2}') + ' coefficient ' + t(0) + '.'], 'choose a and b');
            p.bad = [[String(a), String(K0)], [String(-a), String(-b)], [String(2 * b), String(b)]];
            return p;
          } },
          { id: 'e18c', level: 'BEG', make: function (r, sh) {
            var K0 = sh.one[0], b = sh.one[1], a = sh.one[2], v = 81 + K0, f1 = 9 + 3 * a + b, f2 = 9 - 3 * a + b;
            return KP.number('Test your factors at ' + t('x=3') + ': what value do ' + t('x^{4}+' + K0) + ' and the product of your two factors both give?', v, numDiag([[f1, 'only-a', 'That is just one factor. Multiply both factors.'], [f2, 'only-a', 'That is just one factor. Multiply both factors.']]),
              t('3^{4}+' + K0 + '=' + v) + ', and ' + t('(9+' + 3 * a + '+' + b + ')(9-' + 3 * a + '+' + b + ')=' + f1 + '\\times ' + f2 + '=' + v) + ' ✓',
              ['Work out ' + t('3^{4}') + ' first.'], 'test factors at x = 3');
          } },
          { id: 'e18d', level: 'ADV', make: function (r, sh) {
            var K0 = sh.two[0], b = sh.two[1], a = sh.two[2], A = quad(1, a, b), B = quad(1, -a, b), T = Y.add(mono(1, 'x', 4), Y.num(K0));
            var fl = [{ name: 'First factor', label: 'first factor', mode: 'math', keys: 'poly', vars: ['x'] }, { name: 'Second factor', label: 'second factor', mode: 'math', keys: 'poly', vars: ['x'] }];
            var p = KP.fields('Write ' + t('x^{4}+' + K0) + ' as a product of two trinomials.', fl, [], [tx(A), tx(B)], t('\\left(' + tx(A) + '\\right)\\left(' + tx(B) + '\\right)'),
              'Need ' + t('b^{2}=' + K0) + ', so ' + t('b=' + b) + '; then ' + t('a^{2}=2b=' + 2 * b) + ', so ' + t('a=' + a) + '.<br>' + t('x^{4}+' + K0 + '=\\left(' + tx(A) + '\\right)\\left(' + tx(B) + '\\right)') + '<br>Rule: for ' + t('x^{4}+k') + ', choose ' + t('b^{2}=k') + ' and ' + t('a^{2}=2b') + '.',
              ['Use the same method as in (b): first ' + t('b') + ', then ' + t('a') + '.'], 'x⁴ + k as two trinomials');
            p.check = prodCheck(T, 3, ['First factor', 'Second factor'], function (P1, P2) { if (Y.eq(Y.mul(P1, P2), Y.add(mono(1, 'x', 4), Y.num(K0), mono(2 * b, 'x', 2)))) return { code: 'dos-sign', hint: 'The two factors must differ in the sign of the ' + t('x') + ' term: ' + t('x^{2}+ax+b') + ' and ' + t('x^{2}-ax+b') + '.' }; return null; });
            p.bad = [[tx(A), tx(A)], [tx(quad(1, 0, b)), tx(quad(1, 0, b))]];
            return p;
          } }] },
      { num: '19', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: 'e19', level: 'EMG', make: function (r) {
          var s = pickWhere(function () { return { a: r.int(2, 3), b: r.int(1, 5), c: r.int(2, 6), d: r.int(1, 4) }; }, function (s) { return s.a * s.c - s.b !== 0; });
          var X = lin(s.a, -s.b), T = quad(1, s.c, -s.d), R = Y.mul(X, T);
          return polyMC(r, 'Expand and simplify ' + t(bt(X) + '\\left(' + tx(T) + '\\right)') + '.', R, [
            { p: Y.add(R, Y.num(-2 * s.b * s.d)), code: 'const-sign', why: 'Check the constant: ' + t('(-' + s.b + ')(-' + s.d + ')=+' + s.b * s.d) + '.' },
            { p: Y.add(R, mono(2 * s.b, 'x', 2)), code: 'opt-x2', why: 'Check the ' + t('x^{2}') + ' terms: ' + t('(-' + s.b + ')(x^{2})=-' + s.b + 'x^{2}') + '.' },
            { p: Y.add(R, mono(2 * s.b * s.c, 'x')), code: 'opt-x', why: 'Check the ' + t('x') + ' terms: ' + t(tx(mono(-s.a * s.d, 'x')) + '-' + s.b * s.c + 'x') + ' — both are negative.' }],
            t('=' + tx(Y.mul(mono(s.a, 'x'), T)) + plusTex(Y.mul(Y.num(-s.b), T)) + '=' + tx(R)),
            ['Multiply ' + t(s.a + 'x') + ' and then ' + t('-' + s.b) + ' by each term of the trinomial.'], 'MC binomial × trinomial');
        } }] },
      { num: '20', stem: '<i>(Numerical Response)</i>', parts: [
        { id: 'e20', level: 'PRG', make: function (r) {
          var p = r.int(2, 3), q = r.pick([1, 2, 3, 4, 5].filter(function (v) { return gcd(v, p) === 1; })), rr = r.int(2, 6), a = p * p - 1, b = 2 * p * q, c = q * q + rr * rr - 1, ans = a + b + c;
          return KP.nr('The expression ' + t('(' + p + 'x+' + q + ')^{2}-(x-' + rr + ')(x+' + rr + ')+(x-1)(x^{2}+x+1)') + ' simplifies to ' + t('x^{3}+ax^{2}+bx+c') + '. The value of ' + t('a+b+c') + ' is ________.', ans,
            numDiag([[ans - b, 'no-middle', 'The square has a middle term: ' + t('(' + p + 'x+' + q + ')^{2}=' + tx(Y.pow(lin(p, q), 2))) + '.'], [ans - 2 * rr * rr, 'dos-sign', 'Subtracting ' + t('(x^{2}-' + rr * rr + ')') + ' gives ' + t('-x^{2}+' + rr * rr) + '.'], [ans + 2, 'const-sign', t('(x-1)(x^{2}+x+1)=x^{3}-1') + '.'], [ans + 1, 'only-a', 'Don’t include the coefficient of ' + t('x^{3}') + ': only ' + t('a') + ', ' + t('b') + ' and ' + t('c') + '.']]),
            t('(' + p + 'x+' + q + ')^{2}=' + tx(Y.pow(lin(p, q), 2))) + '<br>' + t('-(x-' + rr + ')(x+' + rr + ')=-x^{2}+' + rr * rr) + '<br>' + t('(x-1)(x^{2}+x+1)=x^{3}-1') + '<br>Collect: ' + t(tx(Y.add(mono(1, 'x', 3), quad(a, b, c)))) + ', so ' + t('a+b+c=' + a + '+' + b + '+' + c + '=' + ans) + '.',
            ['Expand each of the three pieces separately, then collect.'], 'NR a+b+c');
        } }] }
    ]

  });
})(window);
