/* Math 10C · Unit 4 Test (AN5) — the paper outcomes-based unit test (u4_test_A/B/C.tex) as generators.
 * The paper has three pages for AN5 (Part 1: common factors and x²+bx+c; Part 2: ax²+bx+c, differences of squares,
 * perfect squares; Part 3: factoring completely, choosing a strategy, connections), each in BEG / PRG / MAS boxes. Every
 * question keeps its box and its paper number (defineTest orders them Beginning → Progressing → Mastery). Each part takes
 * its numbers from the seed, inside the range Versions A, B and C show (their numbers are possible values); factored keys
 * are built from the generated factors, so they always expand to the question.
 * Conversions from paper: "explain the error" → checkable steps (expand the student’s answer, the missing term, the pair
 * that works, the step that should change) plus the corrected factorization; "show it is a perfect square" → the square
 * root and the 2AB check in boxes; "circle the one that is not a difference of squares and explain" → multiple choice
 * where each option is a binomial with a reason; "write the letter" → a table; "multiply to check" → the expansion, then
 * correct / not correct; "is it complete? explain" → a yes/no table, the common factor left over, and the complete form;
 * mental arithmetic → the factored (or difference-of-squares) form, then the value. Q6 and Q13a "find all k" → a list of
 * values. The "check it by expanding" line of Q14 is in its worked solution (the expansion is the question itself).
 * The paper has no solving-by-factoring question (old Lesson 4.7), so nothing was left out for that. */
(function (root) {
  'use strict';
  var HW = root.HW, K = HW.kit, KP = K.P, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form, P = HW.poly, FX = HW.factor, F = HW.fmt;

  HW.addCodes({
    'u4t-kept-error': 'Repeated the student’s error', 'u4t-expand-orig': 'Wrote the original instead of expanding the student’s answer',
    'u4t-dos-square': 'Wrote a difference of squares as a perfect square', 'u4t-pst-dos': 'Wrote a perfect square trinomial as a difference of squares',
    'u4t-pair-sum': 'Integers with the right product but the wrong sum', 'u4t-pair-product': 'Integers with the right sum but the wrong product',
    'u4t-split': 'Middle term not split with the pair', 'u4t-group': 'A group not factored to match the other',
    'u4t-k-plus-c': 'Used factor pairs of +c instead of −c', 'u4t-k-one': 'Gave only one value of k', 'u4t-k-pos': 'Gave only the positive values of k',
    'u4t-c-root': 'Gave the square root instead of the constant', 'u4t-c-monic': 'Squared half the middle coefficient as if a = 1',
    'u4t-cut-not-squared': 'Subtracted the side of the cut square instead of its area', 'u4t-side-minus': 'Took the cut off the side length instead of the area',
    'u4t-two-not-four': 'Took only one 2 out (the common factor is 4)', 'u4t-tile-count': 'Mixed up x-tiles and unit tiles',
    'u4t-no-root': 'Used a square instead of its square root in a bracket', 'u4t-mental-dos': 'Squared the difference instead of multiplying the difference and the sum',
    'u4t-mental-arith': 'Arithmetic slip in the last step', 'u4t-pair-as-factors': 'Wrote the pair into the brackets as if a = 1', 'u4t-no-divide': 'Used ax ± m, ax ± n without dividing out a', 'u4t-not-dos': 'Not written as a difference of squares', 'u4t-wrong-line': 'Picked the wrong line as the error', 'u4t-show-how': 'Value given without the factoring step'
  });
  HW.addPartial({
    'u4t-kept-error': 'n', 'u4t-expand-orig': 'n', 'u4t-dos-square': 'n', 'u4t-pst-dos': 'n', 'u4t-pair-sum': 'b', 'u4t-pair-product': 'b',
    'u4t-split': 'b', 'u4t-group': 'b', 'u4t-k-plus-c': 'b', 'u4t-k-one': 'b', 'u4t-k-pos': 'b', 'u4t-c-root': 'b', 'u4t-c-monic': 'b',
    'u4t-cut-not-squared': 's', 'u4t-side-minus': 'n', 'u4t-two-not-four': 's', 'u4t-tile-count': 'b', 'u4t-no-root': 'b',
    'u4t-mental-dos': 'n', 'u4t-mental-arith': 's', 'u4t-pair-as-factors': 'n', 'u4t-no-divide': 'n', 'u4t-wrong-line': 'b'
  });

  /* ---------------- polynomial helpers ---------------- */
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var x = a % b; a = b; b = x; } return a; }
  function pick(gen, test) { for (var i = 0; i < 4000; i++) { var v = gen(); if (test(v)) return v; } throw new Error('u4test: no valid numbers'); }
  function M(c, v, e) { var o = {}; if (v) o[v] = e == null ? 1 : e; return P.mono(c, o); }   // c·v^e
  function MM(c, vs) { return P.mono(c, vs); }                                                 // c·x^a·y^b
  function N(c) { return P.num(c); }
  function PS(c, s) { return P.scale(s ? P.parse(s) : P.num(1), c); }                         // c·(monomial from LaTeX)
  function sum(arr) { return P.add.apply(null, arr); }
  function seq(arr) { return P.seq(arr); }
  function br(arr) { return '(' + seq(arr) + ')'; }
  function tx(p) { return P.tex(p); }
  function lin(a, v, b) { return [M(a, v), N(b)]; }             // a v + b, as terms
  function lin2(a, v, b, w) { return [M(a, v), M(b, w)]; }      // a v + b w
  function sg(n) { return n < 0 ? String(n) : '+' + n; }
  function pv(n) { return n < 0 ? '(' + n + ')' : String(n); }
  function lc(n) { return n === 1 ? '' : n === -1 ? '-' : String(n); }
  function plain(s) { return String(s).replace(/\\left|\\right|\\,|\\ /g, '').replace(/\\times/g, '×').replace(/[{}\\]/g, ''); }

  /* a factored form built from term arrays: pre = monomial in front (or null), brs = [terms] or { terms, k } */
  function FT(pre, brs) {
    var list = [], tex = '';
    if (pre) { list.push(pre); var s = tx(pre); tex = s === '1' ? '' : s === '-1' ? '-' : s; }
    brs.forEach(function (b) {
      var terms = Array.isArray(b) ? b : b.terms, k = Array.isArray(b) ? 1 : (b.k || 1), p = sum(terms);
      list.push(k > 1 ? { p: p, k: k } : p); tex += '(' + seq(terms) + ')' + (k > 1 ? '^{' + k + '}' : '');
    });
    return { list: list, tex: tex, poly: FX.product(list) };
  }
  function prodOf(x) { return Array.isArray(x) ? FX.product(x) : x && x.list ? x.poly : P.lift(x); }
  function wtex(x) { return x && x.tex ? x.tex : Array.isArray(x) ? FX.tex(x) : tx(x); }
  function cleanW(T, ws) {
    var out = [];
    (ws || []).forEach(function (w) { if (!w || !w.is) return; var p = prodOf(w.is); if (P.eq(p, T) || out.some(function (o) { return P.eq(o.is, p); })) return; out.push({ is: p, code: w.code, hint: w.hint, tex: w.tex || wtex(w.is) }); });
    return out;
  }
  /* "factor (completely)" part; wrongs: [{ is: FT | list | poly, code, hint }] (any equal to the target are dropped) */
  function fac(prompt, Ft, wrongs, sol, hints, text, o) {
    o = o || {}; var ws = cleanW(Ft.poly, wrongs);
    var part = KP.factored(prompt, Ft.list, { wrong: ws.map(function (w) { return { is: w.is, code: w.code, hint: w.hint }; }), keyTex: Ft.tex, gcfOnly: o.gcfOnly, vars: o.vars, before: o.before, after: o.after }, sol, hints, text);
    part.bad = ws.map(function (w) { return w.tex; }).concat(o.bad || []);
    return part;
  }
  function facCheck(Ft, wrongs, o) { o = o || {}; return K.factored(Ft.list, { wrong: cleanW(Ft.poly, wrongs).map(function (w) { return { is: w.is, code: w.code, hint: w.hint }; }), gcfOnly: o.gcfOnly }); }
  function polyCheck(T, wrongs) { return K.poly(T, { wrong: cleanW(T, wrongs).map(function (w) { return { is: w.is, code: w.code, hint: w.hint }; }) }); }
  function polyPart(prompt, T, wrongs, sol, hints, text, o) {
    o = o || {}; var ws = cleanW(T, wrongs);
    var p = KP.poly(prompt, T, { wrong: ws.map(function (w) { return { is: w.is, code: w.code, hint: w.hint }; }), vars: o.vars, before: o.before }, sol, hints, text);
    p.bad = ws.map(function (w) { return tx(w.is); }).concat(o.bad || []);
    return p;
  }
  function numBox(label, o) { o = o || {}; return { label: label, name: o.name || label.replace(/<[^>]*>|\\\(|\\\)|:$/g, ''), before: o.before, after: o.after }; }
  function polyBox(label, vars, o) { o = o || {}; return { label: label, name: o.name || label.replace(/<[^>]*>|\\\(|\\\)|:$/g, ''), mode: 'math', keys: 'poly', vars: vars || ['x'], wide: o.wide !== false, before: o.before, after: o.after, placeholder: o.ph }; }
  /* a number box that also takes a leading + sign */
  function numPlus(ans, diag) { var c = K.number(ans, diag); return function (resp) { return c(String(resp == null ? '' : resp).replace(/^\s*\+\s*/, '')); }; }
  /* several boxes checked together (checks[i](value, all) → result); reports the first wrong box, else the first form issue */
  function boxes(prompt, fields, checks, keys, answer, sol, hints, text, bad, good) {
    var labels = fields.map(function (f) { return f.name || f.label; });
    return { prompt: prompt, input: { type: 'fields', fields: fields }, key: keys, answer: answer, solution: sol, hints: hints || [], text: text, bad: bad || [], good: good || [],
      check: function (resp) {
        resp = resp || []; var firstForm = null, firstWrong = null;
        for (var i = 0; i < checks.length; i++) {
          var r = checks[i](resp[i] == null ? '' : resp[i], resp); if (r.v === 'correct') continue;
          var out = { v: r.v, code: r.code, hint: '<b>' + labels[i] + ':</b> ' + (r.hint || 'Check this one again.') };
          if (r.v === 'form') { if (!firstForm) firstForm = out; } else if (!firstWrong) firstWrong = out;
        }
        return firstWrong || firstForm || ok();
      } };
  }
  function blank(v) { return v == null || !String(v).trim(); }
  /* two integer boxes in either order: want = [m, n] */
  function pairCheck(want, prod, total, diag) {
    return function (a, b) {
      if (blank(a) || blank(b)) return form('empty', 'Fill in both integers.');
      var pa = HW.parse.number(String(a).replace(/^\s*\+/, '')), pb = HW.parse.number(String(b).replace(/^\s*\+/, ''));
      if (!pa.ok || !pb.ok) return form('notnumber', 'Type an integer in each box.');
      var x = pa.value, y = pb.value;
      if ((x === want[0] && y === want[1]) || (x === want[1] && y === want[0])) return ok();
      var h = diag ? diag(x, y) : null; if (h) return wrong(h.code, h.hint);
      if (x * y === prod && x + y !== total) return wrong('u4t-pair-sum', t(x + '\\times ' + pv(y) + '=' + prod) + ' is right, but ' + t(x + '+' + pv(y) + '=' + (x + y)) + ', not ' + t(total) + '.');
      if (x + y === total && x * y !== prod) return wrong('u4t-pair-product', 'They add to ' + t(total) + ', but ' + t(x + '\\times ' + pv(y) + '=' + x * y) + ', not ' + t(prod) + '.');
      return wrong('value', 'The two integers must multiply to ' + t(prod) + ' and add to ' + t(total) + '.');
    };
  }
  function readPoly(s) { var a = K.read(s); if (a.res) return { res: a.res }; var r = P.read(a.ast); if (!r.ok) return { res: wrong('not-poly', 'That isn’t a polynomial.') }; return { p: r.p, ast: a.ast }; }
  function coefOf(m) { return Math.abs(P.sorted(m)[0].c[0]); }
  function strip(a) { while (a && a.t === 'paren') a = a.a; return a; }

  /* ---------------- drawings ---------------- */
  var STK = '#2b3340', FILL = { x2: '#dfe3e8', x: '#a7b0ba', u: '#6c7783' }; // the paper's three shades: x², x and 1 tiles
  function tile(x, y, w, h, kind) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="1.5" fill="' + FILL[kind] + '" stroke="' + STK + '" stroke-width="1.3"/>'; }
  /* the rectangle for (x + p)(x + q): x² at top left, p x-tiles across, q x-tiles down, pq unit tiles */
  function tileRect(p, q) {
    var X = 76, U = 22, ox = 6, oy = 6, s = '', i, j;
    s += tile(ox, oy, X, X, 'x2') + '<text x="' + (ox + X / 2) + '" y="' + (oy + X / 2 + 6) + '" text-anchor="middle" font-size="17" font-style="italic" fill="' + STK + '" font-family="KaTeX_Main,\'Times New Roman\',serif">x²</text>';
    for (i = 0; i < p; i++) s += tile(ox + X + i * U, oy, U, X, 'x');
    for (j = 0; j < q; j++) s += tile(ox, oy + X + j * U, X, U, 'x');
    for (i = 0; i < p; i++) for (j = 0; j < q; j++) s += tile(ox + X + i * U, oy + X + j * U, U, U, 'u');
    var W = X + p * U, H = X + q * U;
    s += '<rect x="' + ox + '" y="' + oy + '" width="' + W + '" height="' + H + '" fill="none" stroke="' + STK + '" stroke-width="2.4"/>';
    return '<div style="margin:.4em 0"><svg class="fig-svg" viewBox="0 0 ' + (ox + W + 6) + ' ' + (oy + H + 6) + '" width="100%" style="max-width:' + (ox + W + 6) + 'px;display:block" role="img" aria-label="algebra tiles arranged in a rectangle">' + s + '</svg></div>';
  }
  /* a square of side 2x + s with a k-by-k square cut from one corner */
  function lShape(s, k) {
    var S = 170, c = 50, ox = 70, oy = 26, X = function (v) { return (ox + v).toFixed(1); }, Y = function (v) { return (oy + v).toFixed(1); };
    var it = function (x, y, txt, o) { o = o || {}; return '<text x="' + x + '" y="' + y + '" fill="currentColor" stroke="none" text-anchor="' + (o.anchor || 'middle') + '" dominant-baseline="central" font-size="17">' + txt + '</text>'; };
    var lab = '2<tspan font-style="italic">x</tspan> + ' + s;
    var body = '<path d="M' + X(0) + ' ' + Y(0) + ' H' + X(S - c) + ' V' + Y(c) + ' H' + X(S) + ' V' + Y(S) + ' H' + X(0) + ' Z" fill="currentColor" fill-opacity="0.1" stroke="currentColor" stroke-width="2"/>' +
      '<path d="M' + X(S - c) + ' ' + Y(0) + ' H' + X(S) + ' V' + Y(c) + '" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="6 4"/>' +
      it(ox + S / 2, oy + S + 18, lab) + it(ox - 10, oy + S / 2 + 10, lab, { anchor: 'end' }) + it(ox + S - c / 2, oy - 13, String(k)) + it(ox + S + 16, oy + c / 2, String(k));
    return '<div style="margin:.4em 0"><svg viewBox="0 0 ' + (ox + S + 34) + ' ' + (oy + S + 34) + '" width="100%" style="max-width:' + (ox + S + 34) + 'px;display:block" role="img" aria-label="a square of side 2x + ' + s + ' with a ' + k + ' by ' + k + ' square cut from one corner" font-family="KaTeX_Main,\'Times New Roman\',serif">' + body + '</svg></div>';
  }

  /* ---------------- binomial common factors and grouping (as in Lesson 2) ---------------- */
  function isUnit(m) { return P.count(m) === 1 && !P.vars(m).length && Math.abs(P.constant(m)[0]) === 1 && P.constant(m)[1] === 1; }
  function times(m, inner, first) { var s = P.tex(m); if (s === '1') s = ''; else if (s === '-1') s = '-'; if (!first && s.charAt(0) !== '-') s = '+' + s; return s + inner; }
  function F1(p) { return { p: p, k: 1 }; }
  function fpart(prompt, target, keyTex, ws, sol, hints, text) {
    var T = FX.product(target), seen = [];
    ws = (ws || []).filter(function (w) {
      if (!w || P.eq(w.is, T)) return false;
      for (var i = 0; i < seen.length; i++) if (P.eq(seen[i], w.is)) return false;
      seen.push(w.is); return true;
    });
    var p = KP.factored(prompt, target, { wrong: ws.map(function (w) { return { is: w.is, code: w.code, hint: w.hint }; }), keyTex: keyTex }, sol, hints, text);
    p.bad = ws.map(function (w) { return w.tex; }).filter(Boolean);
    return p;
  }
  var BCF_HINTS = ['Find the bracket that multiplies <b>both</b> terms and take it out in front, exactly as you would a common monomial.',
    'What multiplies the bracket in each term (with its sign) goes in the second bracket.'];
  var GRP_HINTS = ['Group the first two terms and the last two terms, and take a common factor out of each pair.',
    'Choose the sign of what you take out of the second pair so that both brackets match, then take out the common bracket.'];
  /* o.shown: LaTeX of the question; o.A: the common binomial's terms; o.c: what multiplies it in each term (after any flip);
     o.flip: { from: LaTeX of the opposite bracket as written, c: its coefficient as written } */
  function bcf(o) {
    var A = sum(o.A), At = br(o.A), C = sum(o.c), Ct = br(o.c), key = At + Ct, target = [F1(A), F1(C)], lines = [], ws = [];
    if (o.flip) lines.push(t('(' + o.flip.from + ')') + ' and ' + t(At) + ' are opposites, so ' + t(times(o.flip.c, '(' + o.flip.from + ')', true) + '=' + times(P.neg(o.flip.c), At, true)) + '.');
    lines.push(t(At) + ' is common to both terms:<br>' + t(times(o.c[0], At, true) + times(o.c[1], At, false) + '=' + key));
    lines.push(t(Ct) + ' has no common factor, so the answer is ' + t(key) + '.');
    if (o.flip) ws.push({ is: P.mul(A, sum([o.c[0], o.flip.c])), tex: At + br([o.c[0], o.flip.c]), code: 'not-flipped', hint: t('(' + o.flip.from + ')') + ' and ' + t(At) + ' are <b>opposites</b>, not the same bracket. Rewrite ' + t(times(o.flip.c, '(' + o.flip.from + ')', true)) + ' using ' + t(At) + ' first — the sign in front changes.' });
    ws.push({ is: P.mul(A, sum([o.c[0], P.neg(o.c[1])])), tex: At + br([o.c[0], P.neg(o.c[1])]), code: 'bcf-sign', hint: 'Check the signs in your second bracket: each term keeps the sign of what multiplied ' + t(At) + (o.flip ? ' (after the opposite bracket has been flipped)' : '') + '.' });
    ws.push({ is: P.mul(A, A, C), tex: At + '^{2}' + Ct, code: 'bin-twice', hint: 'The bracket ' + t(At) + ' is a common factor of both terms: take it out <b>once</b>. What multiplies it in each term goes in the second bracket.' });
    return fpart(t(o.shown), target, key, ws, lines.join('<br>'), BCF_HINTS, o.text);
  }
  /* (A)(B): terms in grouping order a1b1, a2b1, a1b2, a2b2 */
  function grouping(o) {
    var T4 = [P.mul(o.A[0], o.B[0]), P.mul(o.A[1], o.B[0]), P.mul(o.A[0], o.B[1]), P.mul(o.A[1], o.B[1])], shown = seq(T4);
    var A = sum(o.A), Bp = sum(o.B), At = br(o.A), Bt = br(o.B), key = At + Bt, target = [F1(A), F1(Bp)], neg2 = P.sorted(o.B[1])[0].c[0] < 0;
    var lines = ['Group the terms in pairs: ' + t('(' + seq(T4.slice(0, 2)) + ')+(' + seq(T4.slice(2)) + ')'),
      'Take a common factor out of each pair' + (neg2 ? ' — take out ' + t(P.tex(o.B[1])) + ' (negative) from the second pair so the brackets match' : '') + ':<br>' + t('=' + times(o.B[0], At, true) + times(o.B[1], At, false)),
      'Take out the common binomial ' + t(At) + ':<br>' + t('=' + key)];
    var ws = [{ is: P.mul(A, sum([o.B[0], P.neg(o.B[1])])), tex: At + br([o.B[0], P.neg(o.B[1])]), code: 'pair-sign', hint: 'Check the sign of the factor you took out of the second pair: multiply it back into ' + t(At) + ' — do you get ' + t(seq(T4.slice(2))) + '?' },
      { is: P.mul(A, A), tex: At + '^{2}', code: 'bin-twice', hint: 'The bracket ' + t(At) + ' appears in both groups, but it is <b>one</b> factor: take it out once. The other factor is made of the two monomials you took out of the pairs.' }];
    return fpart(t(shown), target, key, ws, lines.join('<br>'), GRP_HINTS, o.text);
  }

  /* ---------------- ax² + bx + c built from its factors (as in Lesson 5) ---------------- */
  function vo(v, e, w, f) { var o = {}; if (v && e) o[v] = e; if (w && f) o[w] = (o[w] || 0) + f; return o; }
  function tlin(p, q, v, w) { return P.add(MM(p, vo(v || 'x', 1)), w ? MM(q, vo(w, 1)) : N(q)); }
  function mulAll(list) { return list.reduce(function (acc, f) { return P.mul(acc, f); }, N(1)); }
  function Tri(o) {
    var v = o.v || 'x', w = o.w || null, T = { p: o.p, q: o.q, r: o.r, s: o.s, v: v, w: w };
    T.F1 = tlin(o.p, o.q, v, w); T.F2 = tlin(o.r, o.s, v, w);
    T.inner = P.mul(T.F1, T.F2);
    T.a = o.p * o.r; T.b = o.p * o.s + o.q * o.r; T.c = o.q * o.s; T.ac = T.a * T.c;
    T.m = o.p * o.s; T.n = o.q * o.r;
    T.k = o.k || 1; T.gm = MM(T.k, o.gv || {}); T.hasG = !P.eq(T.gm, N(1)); T.neg = (o.k || 1) < 0;
    T.full = P.mul(T.gm, T.inner);
    T.tex = tx(T.full); T.innerTex = tx(T.inner);
    T.list = T.hasG ? [T.gm, T.F2, T.F1] : [T.F2, T.F1];
    T.key = FX.tex(T.list);
    return T;
  }
  function gpre(T) { var g = tx(T.gm); return g === '1' ? '' : g === '-1' ? '-' : g; }
  function splitTex(T) { var v = T.v, w = T.w; return P.seq([MM(T.a, vo(v, 2)), MM(T.m, vo(v, 1, w, 1)), MM(T.n, vo(v, 1, w, 1)), MM(T.c, vo(w, 2))]); }
  function groupTex(T) {
    var g1 = MM(T.p, vo(T.v, 1)), g2 = T.w ? MM(T.q, vo(T.w, 1)) : N(T.q), b2 = P.btex(T.F2), g2t = tx(g2);
    return tx(g1) + b2 + (g2t.charAt(0) === '-' ? '' : '+') + g2t + b2;
  }
  function solDecomp(T) {
    var L = [];
    if (T.hasG) L.push('Take out the common factor ' + t(tx(T.gm)) + ' first: ' + t(T.tex + '=' + gpre(T) + '(' + T.innerTex + ')') + '.');
    L.push((T.hasG ? 'For ' + t(T.innerTex) + ': ' : '') + t('ac=' + T.a + '\\times ' + pv(T.c) + '=' + T.ac) + '; the pair with product ' + t(T.ac) + ' and sum ' + t(T.b) + ' is ' + t(T.m) + ' and ' + t(T.n) + '.');
    L.push(t(T.innerTex + '=' + splitTex(T)));
    L.push(t('=' + groupTex(T)));
    L.push(t('=' + P.btex(T.F2) + P.btex(T.F1)));
    if (T.hasG) L.push('So ' + t(T.tex + '=' + T.key) + '.');
    L.push('Check: expanding ' + t(T.key) + ' gives ' + t(T.tex) + ' ✓');
    return L.join('<br>');
  }
  function hintsFor(T) {
    var h = [];
    if (T.hasG) h.push('Look for a common factor first — it makes ' + t('ac') + ' much smaller.');
    h.push('Find two integers with product ' + t('ac') + ' and sum ' + t('b') + ', split the middle term with them, then group.');
    return h;
  }
  function stdWrongs(T) {
    var out = [], seen = [T.full], v = T.v, w = T.w, g = T.gm;
    function add(fs, code, hint) {
      var pr = mulAll(fs);
      if (P.isZero(pr) || seen.some(function (x) { return P.eq(x, pr); })) return;
      seen.push(pr); out.push({ is: pr, code: code, hint: hint(t(tx(pr))), tex: FX.tex(fs) });
    }
    add([g, tlin(T.p, -T.q, v, w), tlin(T.r, -T.s, v, w)], 'ax-sign-swap', function (Pt) { return 'Your factors multiply to ' + Pt + ': the middle term has the wrong sign. Change the sign of the constant term in <b>both</b> brackets.'; });
    add([g, tlin(T.p, T.s, v, w), tlin(T.r, T.q, v, w)], 'ax-const-swap', function (Pt) { return 'Your factors multiply to ' + Pt + '. The first and last terms are right but the middle term isn’t: the constant terms are in the wrong brackets.'; });
    if (!T.hasG) {
      add([tlin(1, T.m, v, w), tlin(1, T.n, v, w)], 'u4t-pair-as-factors', function (Pt) { return 'Your factors multiply to ' + Pt + '. Writing the pair straight into the brackets only works when ' + t('a=1') + '. Use the pair to <b>split the middle term</b>, then group.'; });
      add([tlin(T.a, T.m, v, w), tlin(T.a, T.n, v, w)], 'u4t-no-divide', function (Pt) { return 'Your factors multiply to ' + Pt + ', which is ' + t(T.a) + ' times too big. Split the middle term with the pair and group instead.'; });
    } else {
      add([T.F1, T.F2], 'ax-gcf-dropped', function () { return 'Don’t lose the common factor: ' + t(tx(T.gm)) + ' stays in front of the brackets.'; });
      if (P.vars(T.gm).length && Math.abs(T.k) !== 1) add([N(T.k), T.F1, T.F2], 'gcf-dropped', function () { return 'Part of the common factor is missing: every term has a ' + t(P.vars(T.gm).join('')) + ', so it belongs in front too.'; });
    }
    if (w) add([g, tlin(T.p, T.q, v), tlin(T.r, T.s, v)], 'ax-no-y', function () { return 'Each bracket needs a ' + t(w) + '-term: the last term of the trinomial is ' + t(tx(MM(T.c, vo(w, 2)))) + '.'; });
    return out;
  }
  function triPart(T, o) {
    o = o || {};
    var W = stdWrongs(T).filter(function (x) { return !P.eq(x.is, T.full); });
    var p = KP.factored(o.prompt || t(T.tex), T.list, { wrong: W.map(function (x) { return { is: x.is, code: x.code, hint: x.hint }; }) }, solDecomp(T), hintsFor(T), o.text || 'factor ' + plain(T.tex));
    p.bad = W.map(function (x) { return x.tex; });
    return p;
  }
  function triPick(r, gen, test) { return pick(function () { var o = gen(); return o; }, function (o) { return o.q && o.s && gcd(o.p, o.q) === 1 && gcd(o.r, o.s) === 1 && test(o); }); }

  /* ---------------- shared numbers ---------------- */
  var LETTERS2 = [['a', 'b'], ['m', 'n'], ['p', 'q'], ['x', 'y'], ['s', 't']];
  var EXPS = [[2, 0], [1, 1], [0, 1], [1, 0], [2, 1], [1, 2], [0, 2]];
  function mono2(c, u, v, e, f) { var o = {}; if (e) o[u] = e; if (f) o[v] = f; return P.mono(c, o); }
  /* a trinomial G·T1 + G·T2 ± G (Q1b, Q7 i) */
  function gcfTri(r, nT) {
    var L = r.pick(LETTERS2), u = L[0], v = L[1];
    var z = pick(function () {
      var e = r.sample(EXPS, 2).sort(function (A, B) { return (B[0] + B[1]) - (A[0] + A[1]) || B[0] - A[0]; });
      return { g: r.int(3, 9), a1: r.int(1, 5), a2: r.int(1, 5) * r.pick([1, -1]), e1: e[0], e2: e[1], s: r.pick([1, -1]) };
    }, function (z) { return (nT === 'test7' ? z.a1 <= 3 && Math.abs(z.a2) <= 3 && (z.a1 > 1 || Math.abs(z.a2) > 1) : z.a1 >= 2 && Math.abs(z.a2) >= 2) ; });
    var G = MM(z.g, vo(u, 1, v, 1)), T1 = mono2(z.a1, u, v, z.e1[0], z.e1[1]), T2 = mono2(z.a2, u, v, z.e2[0], z.e2[1]);
    var t1 = P.mul(G, T1), t2 = P.mul(G, T2), t3 = P.scale(G, z.s);
    return { u: u, v: v, g: z.g, s: z.s, G: G, T1: T1, T2: T2, t1: t1, t2: t2, t3: t3, poly: seq([t1, t2, t3]), Ft: FT(G, [[T1, T2, N(z.s)]]), stu: FT(G, [[T1, T2]]) };
  }

  HW.defineTest({
    id: 'u4test', unit: 4, title: 'Unit 4 Test', outcome: 'AN5', calc: false,
    blurb: 'The Unit 4 outcomes-based test: AN5 (common factors, x²+bx+c, ax²+bx+c by decomposition, differences of squares and perfect squares, factoring completely, and how factoring and multiplying connect), each at the BEG, PRG and MAS levels.',
    questions: [
      /* ======================= Part 1 · BEG ======================= */
      { num: '1', outcome: 'AN5', stem: 'Factor by removing the greatest common factor.', parts: [
        { id: '1a', outcome: 'AN5', level: 'BEG', make: function (r) {
          var z = pick(function () { return { g: r.int(3, 9), a: r.int(2, 5), b: r.int(1, 9), s: r.pick([1, -1]) }; }, function (z) { return gcd(z.a, z.b) === 1 && z.a !== z.b && z.g * z.a <= 40 && z.g * z.b <= 63; });
          var G = M(z.g, 'x'), Ft = FT(G, [lin(z.a, 'x', z.s * z.b)]), poly = tx(Ft.poly);
          return fac(t(poly), Ft, [{ is: FT(G, [lin(z.a, 'x', -z.s * z.b)]), code: 'sign', hint: 'Check the sign in the bracket: expand your answer and compare it with ' + t(poly) + '.' }],
            'The GCF of ' + t(z.g * z.a) + ' and ' + t(z.g * z.b) + ' is ' + t(z.g) + ', and both terms contain ' + t('x') + ', so the GCF is ' + t(z.g + 'x') + '.<br>' + t(poly + '=' + Ft.tex) + '<br>Check: ' + t(Ft.tex + '=' + poly) + ' ✓',
            ['Find the greatest common factor of the numbers, and the lowest power of ' + t('x') + ' in both terms.', 'Divide each term by the GCF to get the bracket.'], 'GCF ' + plain(poly),
            { gcfOnly: true, bad: [z.g + '(' + seq([M(z.a, 'x', 2), M(z.s * z.b, 'x')]) + ')', 'x(' + seq([M(z.g * z.a, 'x'), N(z.s * z.g * z.b)]) + ')'] });
        } },
        { id: '1b', outcome: 'AN5', level: 'BEG', make: function (r) {
          var z = gcfTri(r), G = tx(z.G);
          return fac(t(z.poly), z.Ft, [{ is: z.stu, code: 'gcf-one', hint: 'The last term ' + t(tx(z.t3)) + ' divided by the GCF ' + t(G) + ' is ' + t(z.s) + ' — keep it in the bracket. (Check: your answer expands to only two terms.)' }],
            'Numbers: the GCF of ' + t([z.t1, z.t2, z.t3].map(coefOf).join(',\\ ')) + ' is ' + t(z.g) + '. Letters: every term has at least one ' + t(z.u) + ' and one ' + t(z.v) + '. So the GCF is ' + t(G) + '.<br>Divide each term by ' + t(G) + ' (the last term gives ' + t(z.s) + '):<br>' + t(z.poly + '=' + z.Ft.tex),
            ['The GCF takes the greatest common factor of the numbers and the lowest power of each letter in every term.', 'A term equal to the GCF leaves ' + t('1') + ' (or ' + t('-1') + ') in the bracket.'], 'GCF ' + plain(z.poly), { gcfOnly: true });
        } }] },
      { num: '2', outcome: 'AN5', shared: function (r) { return pick(function () { return { p: r.int(1, 6), q: r.int(1, 6) }; }, function (z) { return z.p !== z.q && z.p * z.q <= 24; }); },
        stem: function (s) { return 'These algebra tiles form a rectangle. Each large square is ' + t('x^{2}') + ', each strip is ' + t('x') + ' and each small square is ' + t('1') + '.' + tileRect(s.p, s.q); },
        parts: [
          { id: '2', outcome: 'AN5', level: 'BEG', make: function (r, s) {
            var Ft = FT(null, [lin(1, 'x', s.p), lin(1, 'x', s.q)]), T = Ft.poly, e = tx(T);
            var c1 = polyCheck(T, [{ is: P.add(M(1, 'x', 2), M(s.p * s.q, 'x'), N(s.p + s.q)), code: 'u4t-tile-count', hint: 'Count again: the strips (' + t('x') + '-tiles) give the middle term and the small squares give the constant.' }]);
            var p = KP.fields('Write the trinomial the tiles show, and its factored form.', [polyBox('Trinomial:'), polyBox('Factored form:')], [c1, K.factored(Ft.list, {})], [e, Ft.tex], t(e + '=' + Ft.tex),
              'Tiles: one ' + t('x^{2}') + ', ' + t(s.p + s.q) + ' strips and ' + t(s.p * s.q) + ' small squares, so the trinomial is ' + t(e) + '.<br>The rectangle is ' + t('x+' + s.p) + ' wide and ' + t('x+' + s.q) + ' tall, so ' + t(e + '=' + Ft.tex) + '.',
              ['Count each kind of tile for the trinomial.', 'Read the length and the width of the rectangle: the factored form is (length)(width).'], 'tile rectangle ' + s.p + ',' + s.q);
            p.bad = [[Ft.tex, e], [tx(P.add(M(1, 'x', 2), M(s.p * s.q, 'x'), N(s.p + s.q))), Ft.tex], [e, '(x-' + s.p + ')(x-' + s.q + ')']];
            return p;
          } }] },
      { num: '3', outcome: 'AN5', stem: 'Factor.', parts: [
        { id: '3a', outcome: 'AN5', level: 'BEG', make: function (r) {
          var z = pick(function () { return { m: r.int(2, 6), n: r.int(3, 9) }; }, function (z) { return z.m < z.n && z.m * z.n <= 40; });
          var Ft = FT(null, [lin(1, 'x', z.m), lin(1, 'x', z.n)]), poly = tx(Ft.poly);
          return fac(t(poly), Ft, [{ is: FT(null, [lin(1, 'x', 1), lin(1, 'x', z.m * z.n)]), code: 'u4t-pair-sum', hint: 'Your numbers multiply to ' + t(z.m * z.n) + ' but add to ' + t(1 + z.m * z.n) + '. Find the pair that adds to ' + t(z.m + z.n) + '.' }],
            t(z.m + '\\times ' + z.n + '=' + z.m * z.n) + ' and ' + t(z.m + '+' + z.n + '=' + (z.m + z.n)) + ':<br>' + t(poly + '=' + Ft.tex),
            ['Find two integers that multiply to ' + t(z.m * z.n) + ' and add to ' + t(z.m + z.n) + '.'], 'factor ' + plain(poly));
        } },
        { id: '3b', outcome: 'AN5', level: 'BEG', make: function (r) {
          var z = pick(function () { return { M: r.int(4, 9), n: r.int(2, 8) }; }, function (z) { return z.M - z.n >= 1 && z.M * z.n <= 54 && z.M !== z.n; });
          var Ft = FT(null, [lin(1, 'x', -z.M), lin(1, 'x', z.n)]), poly = tx(Ft.poly);
          return fac(t(poly), Ft, [{ is: FT(null, [lin(1, 'x', z.M), lin(1, 'x', -z.n)]), code: 'sign-swap', hint: 'Your pair multiplies to ' + t(-z.M * z.n) + ' but adds to ' + t(z.M - z.n) + ', not ' + t(z.n - z.M) + '. Swap the signs.' }],
            t(-z.M + '\\times ' + z.n + '=' + (-z.M * z.n)) + ' and ' + t(-z.M + '+' + z.n + '=' + (z.n - z.M)) + ':<br>' + t(poly + '=' + Ft.tex) + '<br>Check: ' + t(Ft.tex + '=' + seq([M(1, 'x', 2), M(z.n, 'x'), M(-z.M, 'x'), N(-z.M * z.n)]) + '=' + poly) + ' ✓',
            ['Find two integers that multiply to ' + t(-z.M * z.n) + ' and add to ' + t(z.n - z.M) + '.', 'The product is negative, so one integer is negative; the larger one gets the sign of the middle term.'], 'factor ' + plain(poly));
        } },
        { id: '3c', outcome: 'AN5', level: 'BEG', make: function (r) {
          var z = pick(function () { return { m: r.int(2, 6), n: r.int(3, 9) }; }, function (z) { return z.m < z.n && z.m * z.n <= 42; });
          var Ft = FT(null, [lin(1, 'x', -z.m), lin(1, 'x', -z.n)]), poly = tx(Ft.poly);
          return fac(t(poly), Ft, [{ is: FT(null, [lin(1, 'x', z.m), lin(1, 'x', z.n)]), code: 'sign', hint: 'Your factors give ' + t('+' + (z.m + z.n) + 'x') + '. The middle term is negative and the constant is positive, so <b>both</b> integers are negative.' }],
            t('(' + (-z.m) + ')(' + (-z.n) + ')=' + z.m * z.n) + ' and ' + t(-z.m + '-' + z.n + '=' + (-z.m - z.n)) + ':<br>' + t(poly + '=' + Ft.tex),
            ['Find two integers that multiply to ' + t(z.m * z.n) + ' and add to ' + t(-z.m - z.n) + '.', 'A positive product with a negative sum: both integers are negative.'], 'factor ' + plain(poly));
        } }] },

      /* ======================= Part 1 · PRG ======================= */
      { num: '4', outcome: 'AN5', stem: 'Factor completely.', parts: [
        { id: '4a', outcome: 'AN5', level: 'PRG', make: function (r) {
          var z = pick(function () { return { g: r.int(2, 5), m: r.int(1, 5), n: r.int(2, 6) }; }, function (z) { return z.m < z.n; });
          var Ft = FT(N(z.g), [lin(1, 'x', -z.m), lin(1, 'x', -z.n)]), poly = tx(Ft.poly), inner = seq([M(1, 'x', 2), M(-(z.m + z.n), 'x'), N(z.m * z.n)]);
          return fac(t(poly), Ft, [{ is: FT(null, [lin(1, 'x', -z.m), lin(1, 'x', -z.n)]), code: 'gcf-dropped', hint: 'Don’t lose the common factor ' + t(z.g) + ': it stays in front of the brackets.' }],
            'GCF ' + t('=' + z.g) + ': ' + t(poly + '=' + z.g + '(' + inner + ')') + '<br>' + t('(' + (-z.m) + ')(' + (-z.n) + ')=' + z.m * z.n) + ', ' + t(-z.m + '-' + z.n + '=' + (-z.m - z.n)) + ':<br>' + t('=' + Ft.tex),
            ['Take out the common factor first.', 'Then factor the trinomial in the bracket.'], 'factor ' + plain(poly), { bad: ['(' + seq([M(z.g, 'x'), N(-z.g * z.m)]) + ')(x-' + z.n + ')'] });
        } },
        { id: '4b', outcome: 'AN5', level: 'PRG', make: function (r) {
          var z = pick(function () { return { g: r.int(2, 4), M: r.int(3, 6), n: r.int(2, 5) }; }, function (z) { return z.M > z.n; });
          var G = M(z.g, 'x'), Ft = FT(G, [lin(1, 'x', z.M), lin(1, 'x', -z.n)]), poly = tx(Ft.poly), inner = seq([M(1, 'x', 2), M(z.M - z.n, 'x'), N(-z.M * z.n)]);
          return fac(t(poly), Ft, [{ is: FT(null, [lin(1, 'x', z.M), lin(1, 'x', -z.n)]), code: 'gcf-dropped', hint: 'Don’t lose the common factor ' + t(z.g + 'x') + ': it stays in front of the brackets.' },
            { is: FT(N(z.g), [lin(1, 'x', z.M), lin(1, 'x', -z.n)]), code: 'gcf-dropped', hint: 'Every term has an ' + t('x') + ': the common factor is ' + t(z.g + 'x') + ', not just ' + t(z.g) + '.' },
            { is: FT(G, [lin(1, 'x', -z.M), lin(1, 'x', z.n)]), code: 'sign-swap', hint: 'Your pair adds to ' + t(z.n - z.M) + ' instead of ' + t(z.M - z.n) + '. Swap the signs.' }],
            'GCF ' + t('=' + z.g + 'x') + ': ' + t(poly + '=' + z.g + 'x(' + inner + ')') + '<br>' + t(z.M + '\\times(-' + z.n + ')=' + (-z.M * z.n)) + ', ' + t(z.M + '+(-' + z.n + ')=' + (z.M - z.n)) + ':<br>' + t('=' + Ft.tex),
            ['Take out the common factor (number and ' + t('x') + ') first.', 'Then factor the trinomial in the bracket.'], 'factor ' + plain(poly));
        } },
        { id: '4c', outcome: 'AN5', level: 'PRG', make: function (r) {
          var z = pick(function () { return { B: r.int(5, 8), n: r.int(2, 6), s: r.pick([1, -1]) }; }, function (z) { return z.B - z.n >= 2; });
          var Ft = FT(null, [lin2(1, 'x', z.s * z.B, 'y'), lin2(1, 'x', -z.s * z.n, 'y')]), poly = tx(Ft.poly), b = z.s * (z.B - z.n);
          return fac(t(poly), Ft, [{ is: FT(null, [lin2(1, 'x', -z.s * z.B, 'y'), lin2(1, 'x', z.s * z.n, 'y')]), code: 'sign-swap', hint: 'Your pair adds to ' + t(-b) + ' instead of ' + t(b) + '. Swap the signs.' },
            { is: FT(null, [lin(1, 'x', z.s * z.B), lin(1, 'x', -z.s * z.n)]), code: 'y-missing', hint: 'Each bracket needs a ' + t('y') + '-term: the last term is ' + t(tx(MM(-z.B * z.n, { y: 2 }))) + '.' }],
            'Treat it like ' + t('x^{2}+bx+c') + ' with ' + t('y') + ' carried along: ' + t(pv(z.s * z.B) + '\\times ' + pv(-z.s * z.n) + '=' + (-z.B * z.n)) + ' and ' + t(pv(z.s * z.B) + '+' + pv(-z.s * z.n) + '=' + b) + '.<br>' + t(poly + '=' + Ft.tex) + '<br>Check: ' + t(Ft.tex + '=' + poly) + ' ✓',
            ['Find two integers that multiply to ' + t(-z.B * z.n) + ' and add to ' + t(b) + '.', 'Each bracket is ' + t('x') + ' plus a multiple of ' + t('y') + '.'], 'factor ' + plain(poly), { vars: ['x', 'y'] });
        } }] },
      { num: '5', outcome: 'AN5', stem: 'Factor by removing a common binomial factor, or by grouping.', parts: [
        { id: '5a', outcome: 'AN5', level: 'PRG', make: function (r) {
          var z = pick(function () { return { a: r.int(2, 5), b: r.int(2, 9), p: r.int(1, 9) * r.pick([1, -1]), sb: r.pick([1, -1]) }; }, function (z) { return gcd(z.a, z.b) === 1 && Math.abs(z.p) !== z.b; });
          var A = lin(1, 'y', z.p), At = br(A), c = [M(z.a, 'y'), N(z.sb * z.b)];
          return bcf({ shown: times(c[0], At, true) + times(c[1], At, false), A: A, c: c, text: 'ay(y+p)±b(y+p)' });
        } },
        { id: '5b', outcome: 'AN5', level: 'PRG', make: function (r) {
          var z = pick(function () { return { a: r.int(2, 5), b: r.int(2, 9), p: r.int(2, 9) }; }, function (z) { return gcd(z.a, z.b) === 1 && z.a !== z.b && z.p !== z.b; });
          var A = lin(1, 'x', -z.p), At = br(A), from = z.p + '-x';
          return bcf({ shown: times(M(z.a, 'x'), At, true) + '+' + z.b + '(' + from + ')', A: A, c: [M(z.a, 'x'), N(-z.b)], flip: { from: from, c: N(z.b) }, text: 'ax(x-p)+b(p-x)' });
        } },
        { id: '5c', outcome: 'AN5', level: 'PRG', make: function (r) {
          var z = pick(function () { return { p: r.int(2, 4), q: r.int(1, 5) * r.pick([1, -1]), rr: r.int(2, 5), s: r.int(2, 5) * r.pick([1, -1]) }; }, function (z) { return gcd(z.p, z.q) === 1 && gcd(z.rr, z.s) === 1 && z.p !== z.rr; });
          return grouping({ A: [M(z.p, 'x'), N(z.q)], B: [M(z.rr, 'x'), M(z.s, 'y')], text: 'grouping (px+q)(rx+sy)' });
        } }] },

      /* ======================= Part 1 · MAS ======================= */
      { num: '6', outcome: 'AN5', stem: 'A complete list of the values, from every factor pair, is how you know you have found them all.', parts: [
        { id: '6', outcome: 'AN5', level: 'MAS', make: function (r) {
          var c = r.pick([8, 10, 12, 14, 15, 18, 20, 21, 22, 24, 26, 27, 28, 30, 32, 33, 35, 40, 42, 44, 45, 48, 50]), pairs = [], ks = [];
          for (var d = 1; d * d < c; d++) if (c % d === 0) pairs.push([d, c / d]);
          pairs.forEach(function (q) { ks.push(q[1] - q[0]); ks.push(q[0] - q[1]); });
          ks.sort(function (a, b) { return a - b; });
          var plusC = []; pairs.forEach(function (q) { plusC.push(q[0] + q[1]); plusC.push(-q[0] - q[1]); });
          var has = function (A, x) { return A.some(function (y) { return Math.abs(x - y) < 1e-9; }); };
          var p = KP.valueSet('Find <b>all</b> the integer values of ' + t('k') + ' so that ' + t('x^{2}+kx-' + c) + ' can be factored. List them, separated by commas.', ks, { v: 'k', keyTex: ks.map(function (k) { return 'k=' + k; }).join(',\\ '),
            diag: function (A, T) {
              var miss = T.filter(function (x) { return !has(A, x); }), extra = A.filter(function (x) { return !has(T, x); });
              if (A.length && A.every(function (x) { return has(plusC, x); })) return { code: 'u4t-k-plus-c', hint: 'Those integers multiply to ' + t('+' + c) + '. Here the constant is ' + t('-' + c) + ', so one integer of each pair is negative.' };
              if (!extra.length && miss.length && A.every(function (x) { return x > 0; }) && miss.every(function (x) { return x < 0; })) return { code: 'u4t-k-pos', hint: 'Those all work — but swapping which integer is negative gives the negative values of ' + t('k') + ' too.' };
              if (!extra.length && miss.length) return { code: 'sol-missing', hint: 'Those all work, but some are missing. List <b>every</b> factor pair of ' + t('-' + c) + ' (including ' + t('1') + ' and ' + t(c) + '), both ways round for the sign.' };
              if (extra.length) return { code: 'sol-extra', hint: t('k=' + extra[0]) + ' doesn’t work: no two integers with product ' + t('-' + c) + ' add to ' + t(extra[0]) + '.' };
              return null;
            } },
            'We need two integers with product ' + t('-' + c) + ' and sum ' + t('k') + '. List every factor pair of ' + t('-' + c) + ':<br>' + pairs.map(function (q) { return t(q[0] + ',\\ -' + q[1]) + ': sum ' + t(q[0] - q[1]) + '; ' + t('-' + q[0] + ',\\ ' + q[1]) + ': sum ' + t(q[1] - q[0]); }).join('<br>') +
              '<br>' + t(c) + ' has no other factor pairs, so there are no other values:<br>' + t('k=' + ks.join(',\\ ')) + ' (' + ks.length + ' values).',
            ['Write ' + t('x^{2}+kx-' + c + '=(x+m)(x+n)') + ': then ' + t('mn=-' + c) + ' and ' + t('m+n=k') + '.', 'List every factor pair of ' + t(c) + ', and use each one twice: once with the larger number negative, once with the smaller one negative.'], 'all k for x²+kx−' + c);
          p.bad = [ks.filter(function (k) { return k > 0; }).join(', '), plusC.join(', '), ks.slice(1).join(', ')];
          return p;
        } }] },
      { num: '7', outcome: 'AN5', stem: 'Each factoring has an error. Find it and write the correct factored form.',
        shared: function (r) {
          var a = gcfTri(r, 'test7');
          var b = pick(function () { return { M: r.int(5, 9), n: r.int(2, 7), s: r.pick([1, -1]) }; }, function (z) { return z.M - z.n >= 2 && z.M * z.n <= 54; });
          b.A = -b.s * b.M; b.B = b.s * b.n; b.b = b.A + b.B; b.c = b.A * b.B;
          b.poly = seq([M(1, 'x', 2), M(b.b, 'x'), N(b.c)]); b.stu = FT(null, [lin(1, 'x', -b.A), lin(1, 'x', -b.B)]); b.Ft = FT(null, [lin(1, 'x', b.A), lin(1, 'x', b.B)]);
          return { i: a, ii: b };
        },
        parts: [
          { id: '7ia', sub: 'i a', outcome: 'AN5', level: 'MAS', make: function (r, s) {
            var z = s.i, vars = [z.u, z.v].sort(), E = P.add(z.t1, z.t2);
            return boxes('(i) A student wrote ' + t(z.poly + '=' + z.stu.tex) + '.<br>Expand the student’s answer, then name the term of the original that went missing.',
              [polyBox('Expanded:', vars, { before: t(z.stu.tex + '='), ph: 'the expanded answer' }), polyBox('Missing term:', vars, { wide: false, ph: 'one term' })],
              [polyCheck(E, [{ is: Ft2poly(z), code: 'u4t-expand-orig', hint: 'That is the original expression. Multiply out the <b>student’s</b> answer, ' + t(z.stu.tex) + ', term by term.' }]), polyCheck(z.t3, [{ is: P.neg(z.t3), code: 'sign', hint: 'Right term, wrong sign: look at the sign of the last term in the original.' }])],
              [tx(E), tx(z.t3)], t(z.stu.tex + '=' + tx(E)) + '; missing ' + t(tx(z.t3)),
              t(z.stu.tex + '=' + tx(E)) + ' has only two terms, so the term ' + t(tx(z.t3)) + ' is missing. Removing ' + t(tx(z.G)) + ' from the term ' + t(tx(z.t3)) + ' leaves ' + t(z.s) + ', not nothing.',
              ['Multiply ' + t(tx(z.G)) + ' by each term in the bracket.', 'Compare your expansion with the original, term by term.'], '7(i) expand ' + plain(z.stu.tex),
              [[tx(Ft2poly(z)), tx(z.t3)], [tx(E), tx(P.neg(z.t3))]]);
          } },
          { id: '7ib', sub: 'i b', outcome: 'AN5', level: 'MAS', make: function (r, s) {
            var z = s.i;
            return fac('(i) Write the correct factored form of ' + t(z.poly) + '.', z.Ft, [{ is: z.stu, code: 'u4t-kept-error', hint: 'That is the student’s answer: it expands to only two terms. The term ' + t(tx(z.t3)) + ' divided by ' + t(tx(z.G)) + ' leaves ' + t(z.s) + '.' },
              { is: FT(z.G, [[z.T1, z.T2, N(-z.s)]]), code: 'sign', hint: 'Check the sign of the last term in the bracket: ' + t(tx(z.t3) + '\\div ' + tx(z.G) + '=' + z.s) + '.' }],
              'The GCF is ' + t(tx(z.G)) + ', and ' + t(tx(z.t3) + '\\div ' + tx(z.G) + '=' + z.s) + ':<br>' + t(z.poly + '=' + z.Ft.tex) + '<br>Check: expanding gives three terms again ✓',
              ['Divide <b>every</b> term by the GCF — including the one equal to it.'], '7(i) fix ' + plain(z.poly), { gcfOnly: true, vars: [z.u, z.v] });
          } },
          { id: '7iia', sub: 'ii a', outcome: 'AN5', level: 'MAS', make: function (r, s) {
            var z = s.ii, E = z.stu.poly, pc = pairCheck([z.A, z.B], z.c, z.b, function (x, y) { if ((x === -z.A && y === -z.B) || (x === -z.B && y === -z.A)) return { code: 'u4t-kept-error', hint: 'Those are the student’s integers: they add to ' + t(-z.b) + ', not ' + t(z.b) + '.' }; return null; });
            return boxes('(ii) A student wrote ' + t(z.poly + '=' + z.stu.tex) + '.<br>Expand the student’s answer to find the error. Then give the two integers that do work.',
              [polyBox('Expanded:', ['x'], { before: t(z.stu.tex + '='), ph: 'the expanded answer' }), numBox('Two integers with product ' + t(z.c) + ' and sum ' + t(z.b) + ':', { name: 'First integer' }), numBox('and', { name: 'Second integer' })],
              [polyCheck(E, [{ is: z.Ft.poly, code: 'u4t-expand-orig', hint: 'That is the original expression. Multiply out the <b>student’s</b> answer, ' + t(z.stu.tex) + '.' }]),
                function (v, all) { return pc(all[1], all[2]); }, function () { return ok(); }],
              [tx(E), String(z.A), String(z.B)], t(z.stu.tex + '=' + tx(E)) + '; ' + t(z.A) + ' and ' + t(z.B),
              t(z.stu.tex + '=' + tx(E)) + ': the middle term has the wrong sign. The integers must multiply to ' + t(z.c) + ' <b>and add to</b> ' + t(z.b) + '; the student’s ' + t(-z.A) + ' and ' + t(-z.B) + ' add to ' + t(-z.b) + '. Use ' + t(z.A) + ' and ' + t(z.B) + ': ' + t(z.A + '+' + pv(z.B) + '=' + z.b) + ' ✓',
              ['Expand with FOIL and compare the middle term with the original.', 'You need product ' + t(z.c) + ' and sum ' + t(z.b) + '.'], '7(ii) expand ' + plain(z.stu.tex),
              [[z.poly, String(z.A), String(z.B)], [tx(E), String(-z.A), String(-z.B)], [tx(E), String(z.c), '1']], [[tx(E), String(z.B), String(z.A)], [tx(E), '+' + z.A, String(z.B)]]);
          } },
          { id: '7iib', sub: 'ii b', outcome: 'AN5', level: 'MAS', make: function (r, s) {
            var z = s.ii;
            return fac('(ii) Write the correct factored form of ' + t(z.poly) + '.', z.Ft, [{ is: z.stu, code: 'u4t-kept-error', hint: 'That is the student’s answer — it expands to a middle term of ' + t(tx(M(-z.b, 'x'))) + '. Swap the signs.' }],
              t(z.A + '\\times ' + pv(z.B) + '=' + z.c) + ' and ' + t(z.A + '+' + pv(z.B) + '=' + z.b) + ':<br>' + t(z.poly + '=' + z.Ft.tex) + '<br>Check: ' + t(z.Ft.tex + '=' + seq([M(1, 'x', 2), M(z.B, 'x'), M(z.A, 'x'), N(z.c)]) + '=' + z.poly) + ' ✓',
              ['Keep the numbers, but fix the signs so the middle term comes out right.'], '7(ii) fix ' + plain(z.poly));
          } }] },

      /* ======================= Part 2 · BEG ======================= */
      { num: '8', outcome: 'AN5', stem: 'Differences of squares.',
        shared: function (r) {
          var nums = r.sample([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 4), pq = pick(function () { return { p: r.int(2, 7), q: r.int(1, 9) }; }, function (z) { return gcd(z.p, z.q) === 1; });
          return { n1: nums[0], cc: Math.max(4, nums[1]), s: Math.max(2, nums[2]), pq: pq, m: r.pick(['m', 'y', 'a', 't']) };
        },
        parts: [
          { id: '8a', outcome: 'AN5', level: 'BEG', make: function (r) {
            var v = r.pick(['x', 'x', 'y', 'm', 'a', 't', 'p', 'k']), n = r.int(5, 12), Ft = FT(null, [lin(1, v, -n), lin(1, v, n)]), poly = tx(Ft.poly);
            return fac('Factor ' + t(poly) + '.', Ft, [{ is: FT(null, [{ terms: lin(1, v, -n), k: 2 }]), code: 'u4t-dos-square', hint: t('(' + v + '-' + n + ')^{2}') + ' has a middle term. A difference of squares factors into one ' + t('-') + ' bracket and one ' + t('+') + ' bracket.' },
              { is: FT(null, [lin(1, v, -n * n), lin(1, v, n * n)]), code: 'u4t-no-root', hint: 'Use the square <b>root</b> of ' + t(n * n) + ' in each bracket.' }],
              t(poly + '=' + v + '^{2}-' + n + '^{2}') + ', a difference of squares: ' + t(poly + '=' + Ft.tex), ['Both terms are perfect squares and they are subtracted: ' + t('A^{2}-B^{2}=(A-B)(A+B)') + '.'], 'factor ' + plain(poly));
          } },
          { id: '8b', outcome: 'AN5', level: 'BEG', make: function (r) {
            var v = r.pick(['a', 'x', 'm', 'y']), z = pick(function () { return { p: r.int(2, 5), q: r.int(2, 9) }; }, function (z) { return gcd(z.p, z.q) === 1; });
            var Ft = FT(null, [lin(z.p, v, -z.q), lin(z.p, v, z.q)]), poly = tx(Ft.poly);
            return fac('Factor ' + t(poly) + '.', Ft, [{ is: FT(null, [{ terms: lin(z.p, v, -z.q), k: 2 }]), code: 'u4t-dos-square', hint: 'A difference of squares factors into one ' + t('-') + ' bracket and one ' + t('+') + ' bracket.' },
              { is: FT(null, [lin(z.p * z.p, v, -z.q), lin(z.p * z.p, v, z.q)]), code: 'u4t-no-root', hint: t(z.p * z.p + v + '^{2}=(' + z.p + v + ')^{2}') + ': the bracket uses the square root, ' + t(z.p + v) + '.' }],
              t(poly + '=(' + z.p + v + ')^{2}-' + z.q + '^{2}') + ':<br>' + t(poly + '=' + Ft.tex), ['Write each term as a square: ' + t(z.p * z.p + v + '^{2}=(\\ ?\\ )^{2}') + '.'], 'factor ' + plain(poly));
          } },
          { id: '8c', outcome: 'AN5', level: 'BEG', make: function (r, s) {
            var n1 = s.n1, p = s.pq.p, q = s.pq.q, c = s.cc, m = s.m, S = s.s;
            var A = 'x^{2}-' + n1 * n1, B = p * p + 'x^{2}-' + q * q, C = c * c + '-' + m + '^{2}', D = 'x^{2}+' + S * S;
            var opts = [
              { html: t(D) + ': it is a <b>sum</b> of squares. No two integers have product ' + t(S * S) + ' and sum ' + t('0') + ', so it can’t be factored.', right: true },
              { html: t(C) + ': the variable comes second, so it isn’t a difference of squares.', why: 'Order doesn’t matter: ' + t(C + '=' + c + '^{2}-' + m + '^{2}=(' + c + '-' + m + ')(' + c + '+' + m + ')') + '.' },
              { html: t(B) + ': ' + t(p * p + 'x^{2}') + ' is not a perfect square.', why: t(p * p + 'x^{2}=(' + p + 'x)^{2}') + ', so ' + t(B + '=(' + p + 'x-' + q + ')(' + p + 'x+' + q + ')') + '.' },
              { html: t(A) + ': ' + (n1 === 1 ? t('1') + ' is not a perfect square.' : 'there is no middle term, so it can’t be factored.'), why: n1 === 1 ? t('1=1^{2}') + ', so ' + t('x^{2}-1=(x-1)(x+1)') + '.' : 'A difference of squares never has a middle term: ' + t(A + '=(x-' + n1 + ')(x+' + n1 + ')') + '.' }];
            var shown = r.shuffle([A, B, C, D]);
            return KP.mc(r, 'Which binomial is <b>not</b> a difference of squares, and why can’t it be factored? ' + shown.map(function (x) { return t(x); }).join(',&ensp; '), opts,
              t(D) + ' is a <b>sum</b> of squares. To factor ' + t('x^{2}+0x+' + S * S) + ' you would need two integers with product ' + t(S * S) + ' and sum ' + t('0') + ': impossible, since both would have the same sign. The other three are differences of squares: ' + t(A + '=(x-' + n1 + ')(x+' + n1 + ')') + ', ' + t(B + '=(' + p + 'x-' + q + ')(' + p + 'x+' + q + ')') + ', ' + t(C + '=(' + c + '-' + m + ')(' + c + '+' + m + ')') + '.',
              ['A difference of squares has two perfect squares with a <b>minus</b> sign between them.'], 'not a difference of squares');
          } }] },
      { num: '9', outcome: 'AN5', stem: 'Complete the steps to factor by decomposition.', parts: [
        { id: '9', outcome: 'AN5', level: 'BEG', make: function (r) {
          var z = pick(function () { return { a: r.pick([2, 3, 4, 5]), p: r.int(1, 3), q: r.int(1, 6) }; }, function (z) { return gcd(z.a, z.p) === 1 && z.a * z.q + z.p <= 25 && z.a * z.p * z.q <= 60 && z.a * z.q !== z.p && !(z.p === 1 && z.q === 1); });
          var a = z.a, p = z.p, q = z.q, b = a * q + p, c = p * q, ac = a * c, m = a * q, n = p;
          var poly = seq([M(a, 'x', 2), M(b, 'x'), N(c)]), Bin = sum(lin(a, 'x', p)), Bin2 = sum(lin(1, 'x', q)), Ft = FT(null, [lin(a, 'x', p), lin(1, 'x', q)]);
          var g1 = FT(M(1, 'x'), [lin(a, 'x', p)]), g2 = FT(N(q), [lin(a, 'x', p)]), g1b = FT(M(a, 'x'), [lin(1, 'x', q)]), g2b = FT(N(p), [lin(1, 'x', q)]);
          var order = function (all) { var x = readPoly(all[3]); return x.p && P.eq(x.p, M(m, 'x')) ? 'm' : 'n'; };
          var pc = pairCheck([m, n], ac, b);
          var termChk = function (i) { return function (v, all) {
            var x = readPoly(all[3]), y = readPoly(all[4]);
            if (x.res && i === 3) return x.res; if (y.res && i === 4) return y.res;
            var okSet = x.p && y.p && ((P.eq(x.p, M(m, 'x')) && P.eq(y.p, M(n, 'x'))) || (P.eq(x.p, M(n, 'x')) && P.eq(y.p, M(m, 'x'))));
            if (okSet) return ok();
            if (i === 4) return ok(); // reported once, on the first box
            return wrong('u4t-split', 'Split ' + t(b + 'x') + ' into two ' + t('x') + '-terms using your two integers: ' + t('\\square x+\\square x') + '.');
          }; };
          var grpChk = function (i) { return function (v, all) {
            var mf = order(all) === 'm', G = i === 5 ? (mf ? g1b : g1) : (mf ? g2b : g2);
            var c0 = facCheck(G, [], {}); var res = c0(v);
            if (res.v !== 'correct' && res.v !== 'form' && res.code === 'value') return wrong('u4t-group', 'This group should be ' + t(tx(G.poly)) + ' written as a common factor times ' + t(mf ? '(x+' + q + ')' : '(' + seq(lin(a, 'x', p)) + ')') + '.');
            return res;
          }; };
          var pp = boxes('Factor ' + t(poly) + ' by decomposition. Fill in each step.',
            [numBox('', { before: t('ac='), name: 'ac' }), numBox('Two integers with product ' + t('ac') + ' and sum ' + t(b) + ':', { name: 'First integer' }), numBox('and', { name: 'Second integer' }),
              polyBox('Split the middle term:', ['x'], { before: t(a + 'x^{2}+'), wide: false, name: 'First x-term', ph: 'an x-term' }), polyBox('', ['x'], { before: t('+'), after: t('+' + c), wide: false, name: 'Second x-term', ph: 'an x-term' }),
              polyBox('Common factor from each pair:', ['x'], { before: t('='), after: t('+'), name: 'First group', ph: 'e.g. 2x(x + 3)' }), polyBox('', ['x'], { before: t('\\phantom{=}'), name: 'Second group', ph: 'e.g. 5(x + 3)' }), polyBox('Factored:', ['x'], { before: t('='), name: 'Factored form', ph: 'e.g. (x + 3)(2x + 5)' })],
            [K.number(ac, function (v) { if (v === a + c) return { code: 'ax-ac-wrong', hint: t('ac') + ' means ' + t('a\\times c=' + a + '\\times ' + c) + '.' }; if (v === b) return { code: 'ax-ac-wrong', hint: 'That is ' + t('b') + '. ' + t('ac=' + a + '\\times ' + c) + '.' }; return null; }),
              function (v, all) { return pc(all[1], all[2]); }, function () { return ok(); }, termChk(3), termChk(4), grpChk(5), grpChk(6),
              facCheck(Ft, [{ is: FT(null, [lin(1, 'x', m), lin(1, 'x', n)]), code: 'u4t-pair-as-factors', hint: 'Writing the pair straight into brackets only works when ' + t('a=1') + '. Take out the common bracket from your two groups.' }])],
            [String(ac), String(n), String(m), tx(M(n, 'x')), tx(M(m, 'x')), g1.tex, q === 1 ? '(' + seq(lin(a, 'x', p)) + ')' : g2.tex, Ft.tex],
            t('ac=' + ac) + '; ' + t(n) + ' and ' + t(m) + '; ' + t(poly + '=' + a + 'x^{2}+' + tx(M(n, 'x')) + '+' + tx(M(m, 'x')) + '+' + c + '=' + g1.tex + '+' + g2.tex + '=' + Ft.tex),
            t('ac=' + a + '\\times ' + c + '=' + ac) + '. Two integers with product ' + t(ac) + ' and sum ' + t(b) + ': ' + t(n) + ' and ' + t(m) + '.<br>' + t(poly + '=' + a + 'x^{2}+' + tx(M(n, 'x')) + '+' + tx(M(m, 'x')) + '+' + c) + '<br>' + t('=' + g1.tex + '+' + g2.tex) + '<br>' + t('=' + Ft.tex) +
              '<br>(The other order works too: ' + t(a + 'x^{2}+' + tx(M(m, 'x')) + '+' + tx(M(n, 'x')) + '+' + c + '=' + g1b.tex + '+' + g2b.tex + '=(x+' + q + ')(' + seq(lin(a, 'x', p)) + ')') + '.)',
            ['Multiply ' + t('a') + ' and ' + t('c') + ', then find two integers with that product and sum ' + t(b) + '.', 'Split the middle term with them, take a common factor out of each pair, then take out the common bracket.'], 'decomposition steps ' + plain(poly));
          pp.bad = (a + c !== ac ? [[String(a + c)].concat(pp.key.slice(1))] : []).concat([[String(ac), String(-n), String(-m)].concat(pp.key.slice(3)), pp.key.slice(0, 7).concat(['(x+' + m + ')(x+' + n + ')'])]);
          pp.good = [[String(ac), String(m), String(n), tx(M(m, 'x')), tx(M(n, 'x')), g1b.tex, p === 1 ? '(x+' + q + ')' : g2b.tex, '(x+' + q + ')(' + seq(lin(a, 'x', p)) + ')']];
          return pp;
        } }] },
      { num: '10', outcome: 'AN5', stem: 'A perfect square trinomial has the form ' + t('A^{2}\\pm 2AB+B^{2}=(A\\pm B)^{2}') + '.', parts: [
        { id: '10', outcome: 'AN5', level: 'BEG', make: function (r) {
          var v = r.pick(['x', 'x', 'y', 'a', 'm']), q = r.int(3, 9), sgn = r.pick([1, -1]), Ft = FT(null, [{ terms: lin(1, v, sgn * q), k: 2 }]), poly = tx(Ft.poly);
          var rootChk = K.number(q, function (x) { if (x === -q) return null; if (x === q * q) return { code: 'u4t-no-root', hint: 'Give the number that is squared: ' + t('\\sqrt{' + q * q + '}') + '.' }; return null; });
          var pp = boxes('Show that ' + t(poly) + ' is a perfect square trinomial, then factor it. (The first term is ' + t(v + '^{2}=(' + v + ')^{2}') + '.)',
            [numBox('Last term:', { before: t(q * q + '=\\Big('), after: t('\\Big)^{2}'), name: 'Square root of the last term' }), polyBox('Middle-term check:', [v], { before: t('2\\times ' + v + '\\times(\\text{that number})='), wide: false, name: 'Middle-term check', ph: 'e.g. 6' + v }), polyBox('Factored form:', [v], { ph: 'e.g. (' + v + ' + 5)^2' })],
            [function (x) { return String(x).replace(/\s/g, '') === '-' + q ? ok() : rootChk(x); },
              function (x) { var y = readPoly(x); if (y.res) return y.res; if (P.eq(y.p, M(2 * q, v)) || P.eq(y.p, M(-2 * q, v))) return ok(); if (P.eq(y.p, M(q, v)) || P.eq(y.p, M(-q, v))) return wrong('not-doubled', 'Twice the product: multiply by ' + t('2') + ' as well.'); return wrong('value', 'Multiply ' + t('2') + ', ' + t(v) + ' and the square root of ' + t(q * q) + '.'); },
              facCheck(Ft, [{ is: FT(null, [{ terms: lin(1, v, -sgn * q), k: 2 }]), code: 'pst-sign', hint: 'The middle term is ' + (sgn < 0 ? 'negative' : 'positive') + ', so the bracket is ' + t(v + (sgn < 0 ? '-' : '+') + q) + '.' },
                { is: FT(null, [lin(1, v, -q), lin(1, v, q)]), code: 'u4t-pst-dos', hint: 'That gives ' + t(v + '^{2}-' + q * q) + ' — no middle term. A perfect square trinomial is ' + t('(A\\pm B)^{2}') + '.' }])],
            [String(q), tx(M(sgn * 2 * q, v)), Ft.tex], t(q * q + '=' + q + '^{2}') + ', ' + t('2(' + v + ')(' + q + ')=' + 2 * q + v) + ', so ' + t(poly + '=' + Ft.tex),
            t(v + '^{2}=(' + v + ')^{2}') + ', ' + t(q * q + '=' + q + '^{2}') + ', and the middle term is ' + t((sgn < 0 ? '-' : '') + '2(' + v + ')(' + q + ')=' + tx(M(sgn * 2 * q, v))) + ' ✓<br>So it is a perfect square trinomial: ' + t(poly + '=' + Ft.tex),
            ['A perfect square trinomial is ' + t('A^{2}\\pm 2AB+B^{2}') + ': the first and last terms are squares and the middle term is twice the product of their roots.'], 'show PST ' + plain(poly));
          pp.bad = [[String(q * q), tx(M(2 * q, v)), Ft.tex], [String(q), tx(M(q, v)), Ft.tex], [String(q), tx(M(2 * q, v)), '(' + v + (sgn < 0 ? '+' : '-') + q + ')^{2}'], [String(q), tx(M(2 * q, v)), '(' + v + '-' + q + ')(' + v + '+' + q + ')']];
          pp.good = [['-' + q, tx(M(-sgn * 2 * q, v)), Ft.tex]];
          return pp;
        } }] },

      /* ======================= Part 2 · PRG ======================= */
      { num: '11', outcome: 'AN5', stem: 'Factor by decomposition.', parts: [
        { id: '11a', outcome: 'AN5', level: 'PRG', make: function (r) {
          var z = triPick(r, function () { return { p: r.int(2, 5), q: r.int(1, 7), r: r.int(2, 5), s: -r.int(1, 7) }; }, function (o) { var b = o.p * o.s + o.q * o.r; return o.p < o.r && b >= 3 && Math.abs(o.p * o.r * o.q * o.s) <= 150 && b <= 15; });
          return triPart(Tri(z));
        } },
        { id: '11b', outcome: 'AN5', level: 'PRG', make: function (r) {
          var z = triPick(r, function () { return { p: r.int(1, 3), q: -r.int(1, 5), r: r.int(2, 5), s: -r.int(1, 7) }; }, function (o) { return o.p * o.r >= 3 && o.p * o.r * o.q * o.s <= 120 && !(o.p === 1 && o.q === -1) && o.p !== o.r && o.q !== o.s; });
          return triPart(Tri(z));
        } },
        { id: '11c', outcome: 'AN5', level: 'PRG', make: function (r) {
          var z = triPick(r, function () { var sg1 = r.pick([1, -1]); return { p: 1, q: sg1 * r.int(2, 4), r: r.int(3, 5), s: -sg1 * r.int(1, 4) }; }, function (o) { var b = o.p * o.s + o.q * o.r; return b !== 0 && Math.abs(b) <= 15; });
          z.w = 'y';
          return triPart(Tri(z));
        } }] },
      { num: '12', outcome: 'AN5', stem: 'Factor.', parts: [
        { id: '12a', outcome: 'AN5', level: 'PRG', make: function (r) {
          var z = pick(function () { return { p: r.int(2, 5), q: r.int(3, 9), s: r.pick([1, -1]) }; }, function (z) { return gcd(z.p, z.q) === 1; });
          var A = lin(z.p, 'x', z.s * z.q), Ft = FT(null, [{ terms: A, k: 2 }]), poly = tx(Ft.poly);
          return fac(t(poly), Ft, [{ is: FT(null, [{ terms: lin(z.p, 'x', -z.s * z.q), k: 2 }]), code: 'pst-sign', hint: 'The middle term is ' + (z.s < 0 ? 'negative' : 'positive') + ', so the sign in the bracket is ' + t(z.s < 0 ? '-' : '+') + '.' },
            { is: FT(null, [lin(z.p, 'x', -z.q), lin(z.p, 'x', z.q)]), code: 'u4t-pst-dos', hint: 'That gives ' + t(z.p * z.p + 'x^{2}-' + z.q * z.q) + ' — no middle term. This trinomial is a perfect square.' }],
            t(z.p * z.p + 'x^{2}=(' + z.p + 'x)^{2}') + ', ' + t(z.q * z.q + '=' + z.q + '^{2}') + ', and ' + t('2(' + z.p + 'x)(' + z.q + ')=' + 2 * z.p * z.q + 'x') + ' matches the middle term: a perfect square.<br>' + t(poly + '=' + Ft.tex),
            ['Are the first and last terms perfect squares? Is the middle term twice the product of their roots?'], 'factor ' + plain(poly));
        } },
        { id: '12b', outcome: 'AN5', level: 'PRG', make: function (r) {
          var L = r.pick([['m', 'n'], ['a', 'b'], ['x', 'y'], ['p', 'q']]), z = pick(function () { return { p: r.int(2, 9), q: r.int(2, 9) }; }, function (z) { return gcd(z.p, z.q) === 1; });
          var Ft = FT(null, [lin2(z.p, L[0], -z.q, L[1]), lin2(z.p, L[0], z.q, L[1])]), poly = tx(Ft.poly);
          return fac(t(poly), Ft, [{ is: FT(null, [{ terms: lin2(z.p, L[0], -z.q, L[1]), k: 2 }]), code: 'u4t-dos-square', hint: 'A difference of squares factors into one ' + t('-') + ' bracket and one ' + t('+') + ' bracket.' },
            { is: FT(null, [lin(z.p, L[0], -z.q), lin(z.p, L[0], z.q)]), code: 'y-missing', hint: 'The second term is ' + t(z.q * z.q + L[1] + '^{2}=(' + z.q + L[1] + ')^{2}') + ': keep the ' + t(L[1]) + '.' }],
            t(poly + '=(' + z.p + L[0] + ')^{2}-(' + z.q + L[1] + ')^{2}') + ':<br>' + t(poly + '=' + Ft.tex), ['Write each term as a square, then use ' + t('A^{2}-B^{2}=(A-B)(A+B)') + '.'], 'factor ' + plain(poly), { vars: L });
        } }] },

      /* ======================= Part 2 · MAS ======================= */
      { num: '13', outcome: 'AN5', stem: 'Perfect square trinomials.',
        shared: function (r) {
          var g = function (lo, mx) { return pick(function () { return { p: r.int(2, 6), q: r.int(lo, 9) }; }, function (z) { return gcd(z.p, z.q) === 1 && z.p * z.q <= mx; }); };
          return { a: g(1, 36), b: g(2, 45) };
        },
        parts: [
          { id: '13a', sub: 'a', outcome: 'AN5', level: 'MAS', make: function (r, s) {
            var p = s.a.p, q = s.a.q, k = 2 * p * q, has = function (A, x) { return A.some(function (y) { return Math.abs(x - y) < 1e-9; }); };
            var pr = KP.valueSet('Find <b>all</b> the values of ' + t('k') + ' so that ' + t(p * p + 'x^{2}+kx+' + q * q) + ' is a perfect square trinomial. List them, separated by commas.', [k, -k], { v: 'k', keyTex: 'k=' + k + ',\\ k=-' + k,
              diag: function (A) {
                if (A.length === 1 && Math.abs(A[0]) === k) return { code: 'u4t-k-one', hint: 'That one works — but ' + t('(' + p + 'x' + (A[0] > 0 ? '-' : '+') + q + ')^{2}') + ' is a perfect square too. There is another value.' };
                if (A.some(function (x) { return Math.abs(x) === p * q; })) return { code: 'not-doubled', hint: 'The middle term of ' + t('(A+B)^{2}') + ' is ' + t('2AB') + ' — don’t forget the ' + t('2') + '.' };
                if (A.some(function (x) { return Math.abs(x) === 2 * p * p * q * q || Math.abs(x) === p * p * q * q; })) return { code: 'u4t-no-root', hint: 'Use the square roots of the first and last terms, ' + t(p + 'x') + ' and ' + t(q) + ', not the terms themselves.' };
                if (has(A, k) && A.length > 2) return { code: 'sol-extra', hint: 'Only two values work.' };
                return null;
              } },
              t(p * p + 'x^{2}=(' + p + 'x)^{2}') + ' and ' + t(q * q + '=' + q + '^{2}') + '. The middle term must be twice the product: ' + t('\\pm 2(' + p + 'x)(' + q + ')=\\pm ' + k + 'x') + '.<br>' + t('k=' + k) + ': ' + t('(' + p + 'x+' + q + ')^{2}') + ', or ' + t('k=-' + k) + ': ' + t('(' + p + 'x-' + q + ')^{2}') + '.',
              ['Find the square roots of the first and last terms: ' + t('A') + ' and ' + t('B') + '.', 'The middle term is ' + t('+2AB') + ' or ' + t('-2AB') + '.'], 'all k: PST ' + p * p + 'x²+kx+' + q * q);
            pr.bad = [String(k), k + ', ' + (-p * q), String(p * q) + ', ' + (-p * q)];
            return pr;
          } },
          { id: '13bi', sub: 'b i', outcome: 'AN5', level: 'MAS', make: function (r, s) {
            var p = s.b.p, q = s.b.q, b = 2 * p * q, h = p * q;
            var pr = KP.number('Find the value of ' + t('c') + ' so that ' + t(p * p + 'x^{2}-' + b + 'x+c') + ' is a perfect square trinomial.', q * q, function (v) {
              if (v === q) return { code: 'u4t-c-root', hint: t(q) + ' is the number in the bracket; ' + t('c') + ' is its <b>square</b>.' };
              if (v === h * h) return { code: 'u4t-c-monic', hint: 'Halving the middle coefficient and squaring only works when the first term is ' + t('x^{2}') + '. Here the first term is ' + t('(' + p + 'x)^{2}') + ': solve ' + t('2(' + p + 'x)(B)=' + b + 'x') + ' for ' + t('B') + '.' };
              if (v === -q * q) return { code: 'sign', hint: t('c=B^{2}') + ' is positive.' };
              return null;
            }, t(p * p + 'x^{2}=(' + p + 'x)^{2}') + '. The middle term is ' + t('-2(' + p + 'x)(B)=-' + b + 'x') + ', so ' + t('B=' + q) + ' and ' + t('c=' + q + '^{2}=' + q * q) + '.',
              ['Write the first term as a square, ' + t('(' + p + 'x)^{2}') + '.', 'The middle term is ' + t('2AB') + ': find ' + t('B') + ', then ' + t('c=B^{2}') + '.'], 'c for PST ' + p * p + 'x²−' + b + 'x+c', { before: t('c=') });
            pr.bad = [String(q), String(h * h)];
            return pr;
          } },
          { id: '13bii', sub: 'b ii', outcome: 'AN5', level: 'MAS', make: function (r, s) {
            var p = s.b.p, q = s.b.q, b = 2 * p * q, Ft = FT(null, [{ terms: lin(p, 'x', -q), k: 2 }]);
            return fac('Then factor ' + t(p * p + 'x^{2}-' + b + 'x+c') + ' (with your value of ' + t('c') + ').', Ft, [{ is: FT(null, [{ terms: lin(p, 'x', q), k: 2 }]), code: 'pst-sign', hint: 'The middle term is negative, so the bracket has a minus sign.' },
              { is: FT(null, [lin(p, 'x', -q), lin(p, 'x', q)]), code: 'u4t-pst-dos', hint: 'That has no middle term. This is a perfect square: ' + t('(A-B)^{2}') + '.' }],
              'With ' + t('c=' + q * q) + ': ' + t(p * p + 'x^{2}-' + b + 'x+' + q * q + '=' + Ft.tex) + '<br>Check: ' + t(Ft.tex + '=' + p * p + 'x^{2}-' + b + 'x+' + q * q) + ' ✓',
              ['It is ' + t('(A-B)^{2}') + ' with ' + t('A=' + p + 'x') + '.'], 'factor PST ' + p * p + 'x²−' + b + 'x+c');
          } }] },
      { num: '14', outcome: 'AN5',
        shared: function (r) {
          var z = pick(function () { return { p: r.pick([2, 3]), q: r.int(1, 5), rr: r.int(2, 5), s: r.int(2, 6) }; }, function (z) { return gcd(z.p, z.q) === 1 && gcd(z.rr, z.s) === 1 && z.p * z.s !== z.q * z.rr && z.p !== z.rr && !(z.q === 1 && z.s === 1) && z.p * z.rr * z.q * z.s <= 150; });
          z.name = r.pick(['Jamie', 'Mei', 'Omar', 'Lena', 'Raj', 'Sofia']);
          z.a = z.p * z.rr; z.b = z.p * z.s - z.q * z.rr; z.c = -z.q * z.s; z.ac = z.a * z.c; z.n = -z.q * z.rr; z.m = z.p * z.s;
          z.poly = seq([M(z.a, 'x', 2), M(z.b, 'x'), N(z.c)]); z.Bin = lin(z.p, 'x', -z.q); z.Bt = br(z.Bin);
          z.Ft = FT(null, [z.Bin, lin(z.rr, 'x', z.s)]); z.stu = FT(null, [z.Bin, lin(z.rr, 'x', -z.s)]);
          return z;
        },
        stem: function (z) {
          return z.name + ' factored ' + t(z.poly) + ' by decomposition:<br>' + t('\\begin{aligned}&\\text{Line 1: } ac=' + z.ac + ':\\ ' + z.n + '\\text{ and }' + z.m + '\\\\&\\text{Line 2: } ' + seq([M(z.a, 'x', 2), M(z.n, 'x'), M(z.m, 'x'), N(z.c)]) + '\\\\&\\text{Line 3: } =' + tx(M(z.rr, 'x')) + z.Bt + '-' + z.s + z.Bt + '\\\\&\\text{Line 4: } =' + z.stu.tex + '\\end{aligned}');
        },
        parts: [
          { id: '14a', sub: 'a', outcome: 'AN5', level: 'MAS', make: function (r, z) {
            var sec = seq([M(z.m, 'x'), N(z.c)]);
            var lineWhy = { 1: 'Line 1 is right: ' + t(z.n + '\\times ' + z.m + '=' + z.ac) + ' and ' + t(z.n + '+' + z.m + '=' + z.b) + '.', 2: 'Line 2 is right: it splits ' + t(tx(M(z.b, 'x'))) + ' into ' + t(seq([M(z.n, 'x'), M(z.m, 'x')])) + '.', 4: 'Line 4 does follow from Line 3. The first mistake is earlier: expand each part of Line 3.' };
            return boxes('Find ' + z.name + '’s error: which line is the <b>first</b> one that is wrong? Then fix it: factor the second pair of Line 2 correctly.', [numBox('First wrong line:', { before: 'Line', name: 'First wrong line' }), numBox('Second pair:', { before: t(sec + '='), after: t(z.Bt), name: 'Factor taken out of the second pair' })],
              [K.number(3, function (v) { return lineWhy[v] ? { code: 'u4t-wrong-line', hint: lineWhy[v] } : null; }), numPlus(z.s, function (v) { if (v === -z.s) return { code: 'u4t-kept-error', hint: 'That is ' + z.name + '’s step. Expand it: ' + t('-' + z.s + z.Bt + '=' + seq([M(-z.m, 'x'), N(-z.c)])) + ', not ' + t(sec) + '.' }; return null; })],
              ['3', String(z.s)], 'Line 3: ' + t(sec + '=+' + z.s + z.Bt),
              'Line 3 is wrong: ' + t(sec + '=+' + z.s + z.Bt) + ', not ' + t('-' + z.s + z.Bt) + ' (that would give ' + t(seq([M(-z.m, 'x'), N(-z.c)])) + '). Lines 1 and 2 are right: ' + t(z.n + '\\times ' + z.m + '=' + z.ac) + ' and ' + t(z.n + '+' + z.m + '=' + z.b) + '.',
              ['Expand each line and compare it with the line before.', 'What do you multiply ' + t(z.Bt) + ' by to get ' + t(sec) + '?'], 'Q14 error ' + plain(z.poly), [['3', String(-z.s)], ['2', String(z.s)], ['4', String(z.s)]], [['3', '+' + z.s]]);
          } },
          { id: '14b', sub: 'b', outcome: 'AN5', level: 'MAS', make: function (r, z) {
            return fac('Write the correct factored form of ' + t(z.poly) + '.', z.Ft, [{ is: z.stu, code: 'u4t-kept-error', hint: 'That is ' + z.name + '’s answer. Expand it: the middle term comes out wrong. Fix the sign from Line 3.' },
              { is: FT(null, [lin(z.p, 'x', z.q), lin(z.rr, 'x', -z.s)]), code: 'ax-sign-swap', hint: 'Your factors give the middle term with the wrong sign. Group again: ' + t(tx(M(z.rr, 'x')) + z.Bt + '+' + z.s + z.Bt) + '.' }],
              t(seq([M(z.a, 'x', 2), M(z.n, 'x'), M(z.m, 'x'), N(z.c)]) + '=' + tx(M(z.rr, 'x')) + z.Bt + '+' + z.s + z.Bt + '=' + z.Ft.tex) + '<br>Check by expanding: ' + t(z.Ft.tex + '=' + seq([M(z.a, 'x', 2), M(z.m, 'x'), M(z.n, 'x'), N(z.c)]) + '=' + z.poly) + ' ✓',
              ['Correct Line 3, then take out the common bracket.', 'Check by expanding.'], 'Q14 fix ' + plain(z.poly));
          } }] },

      /* ======================= Part 3 · BEG ======================= */
      { num: '15', outcome: 'AN5', stem: 'Look at each expression before you start factoring it.', parts: [
        { id: '15', outcome: 'AN5', level: 'BEG', make: function (r) {
          var g = pick(function () { return { g: r.int(2, 9), h: r.int(2, 9), s: r.pick([1, -1]) }; }, function (z) { return z.g !== z.h; });
          var q = r.int(5, 10), ins = pick(function () { return { m: r.int(2, 9), n: r.int(1, 7) }; }, function (z) { return z.m !== z.n && z.m * z.n <= 40; }), sI = r.pick([1, -1]);
          var de = pick(function () { return { a: r.pick([2, 3, 5]), p: r.int(1, 4), q: r.int(1, 5) }; }, function (z) { return gcd(z.a, z.p) === 1 && z.a * z.q !== z.p; });
          var items = [
            { kind: 'A', tex: seq([M(g.g, 'x', 2), M(g.s * g.g * g.h, 'x')]), why: 'both terms share ' + t(g.g + 'x') + ': take out the common factor first' },
            { kind: 'B', tex: q * q + '-y^{2}', why: t(q * q + '-y^{2}=' + q + '^{2}-y^{2}') + ' is a difference of squares' },
            { kind: 'C', tex: tx(P.mul(sum(lin(1, 'x', sI * ins.m)), sum(lin(1, 'x', -sI * ins.n)))), why: 'it has the form ' + t('x^{2}+bx+c') + ' with no common factor: inspection' },
            { kind: 'D', tex: tx(P.mul(sum(lin(de.a, 'x', de.p)), sum(lin(1, 'x', de.q)))), why: 'the leading coefficient is not 1 and there is no common factor: decomposition' }];
          items = r.shuffle(items);
          var rows = items.map(function (x, i) { return { id: 'abcd'[i], html: t(x.tex), label: 'abcd'[i] }; }), want = {}, by = {};
          items.forEach(function (x, i) { want['abcd'[i]] = x.kind; by['abcd'[i]] = x; });
          var cols = [{ id: 'A', html: '<b>A</b> common factor', label: 'A' }, { id: 'B', html: '<b>B</b> difference of squares', label: 'B' }, { id: 'C', html: '<b>C</b> inspection', label: 'C' }, { id: 'D', html: '<b>D</b> decomposition', label: 'D' }];
          var p = KP.grid('Choose the method you should use <b>first</b> for each expression.', rows, cols, want, { why: function (id) { return { code: 'row', hint: 'Check ' + t(by[id].tex) + ': ' + by[id].why + '.' }; }, rowHead: 'Expression' },
            items.map(function (x) { return t(x.tex) + ': <b>' + x.kind + '</b> — ' + x.why + '.'; }).join('<br>'),
            ['Always look for a common factor first. Then count the terms: two terms with a minus → difference of squares; three terms → inspection (if ' + t('a=1') + ') or decomposition.'], 'method first');
          var sw = {}; Object.keys(want).forEach(function (k) { sw[k] = want[k]; }); var k0 = Object.keys(sw)[0], k1 = Object.keys(sw)[1], tmp = sw[k0]; sw[k0] = sw[k1]; sw[k1] = tmp;
          p.bad = [sw];
          return p;
        } }] },
      { num: '16', outcome: 'AN5', stem: 'Factor completely. Remove the GCF first.', parts: [
        { id: '16a', outcome: 'AN5', level: 'BEG', make: function (r) {
          var z = pick(function () { return { g: r.int(2, 7), q: r.int(2, 6) }; }, function (z) { return z.g * z.q * z.q <= 100 && z.g !== z.q * z.q; });
          var Ft = FT(N(z.g), [lin(1, 'x', -z.q), lin(1, 'x', z.q)]), poly = tx(Ft.poly);
          return fac(t(poly), Ft, [{ is: FT(null, [lin(1, 'x', -z.q), lin(1, 'x', z.q)]), code: 'gcf-dropped', hint: 'Don’t lose the common factor ' + t(z.g) + ': it stays in front.' },
            { is: FT(N(z.g), [{ terms: lin(1, 'x', -z.q), k: 2 }]), code: 'u4t-dos-square', hint: t('x^{2}-' + z.q * z.q) + ' is a difference of squares: one ' + t('-') + ' bracket and one ' + t('+') + ' bracket.' }],
            'GCF ' + t('=' + z.g) + ': ' + t(poly + '=' + z.g + '(x^{2}-' + z.q * z.q + ')') + '<br>Difference of squares: ' + t('=' + Ft.tex), ['Take out the common factor first, then look at what is left.'], 'factor ' + plain(poly));
        } },
        { id: '16b', outcome: 'AN5', level: 'BEG', make: function (r) {
          var z = pick(function () { return { g: r.int(2, 5), m: r.int(2, 6), n: r.int(2, 6), s: r.pick([1, -1]) }; }, function (z) { return z.m !== z.n; });
          var Ft = FT(N(z.g), [lin(1, 'x', z.s * z.m), lin(1, 'x', -z.s * z.n)]), poly = tx(Ft.poly), b = z.s * (z.m - z.n), c = -z.m * z.n;
          return fac(t(poly), Ft, [{ is: FT(null, [lin(1, 'x', z.s * z.m), lin(1, 'x', -z.s * z.n)]), code: 'gcf-dropped', hint: 'Don’t lose the common factor ' + t(z.g) + ': it stays in front.' },
            { is: FT(N(z.g), [lin(1, 'x', -z.s * z.m), lin(1, 'x', z.s * z.n)]), code: 'sign-swap', hint: 'Your pair adds to ' + t(-b) + ' instead of ' + t(b) + '. Swap the signs.' }],
            'GCF ' + t('=' + z.g) + ': ' + t(poly + '=' + z.g + '(' + seq([M(1, 'x', 2), M(b, 'x'), N(c)]) + ')') + '<br>' + t(pv(z.s * z.m) + '\\times ' + pv(-z.s * z.n) + '=' + c) + ', ' + t(pv(z.s * z.m) + '+' + pv(-z.s * z.n) + '=' + b) + ':<br>' + t('=' + Ft.tex),
            ['Take out the common factor ' + t(z.g) + ' first.', 'Then factor the trinomial in the bracket by inspection.'], 'factor ' + plain(poly));
        } }] },
      { num: '17', outcome: 'AN5', stem: 'Multiply to check each factoring. Then decide whether it is <b>correct</b> or <b>not correct</b>.',
        shared: function (r) {
          var aRight = r.chance(0.5);
          var A = pick(function () { return { u: r.int(2, 8), w: -r.int(2, 8) }; }, function (z) { return z.u + z.w !== 0 && Math.abs(z.u * z.w) <= 48; });
          var B = pick(function () { return { p: r.pick([2, 3, 5]), q: r.int(1, 5) * r.pick([1, -1]), s: r.int(1, 6) * r.pick([1, -1]) }; }, function (z) { return z.q * z.s < 0 && gcd(z.p, z.q) === 1 && z.p * z.s + z.q !== 0 && z.p * z.s !== z.q; });
          A.claim = FT(null, [lin(1, 'x', A.u), lin(1, 'x', A.w)]); B.claim = FT(null, [lin(B.p, 'x', B.q), lin(1, 'x', B.s)]);
          A.ok = aRight; B.ok = !aRight;
          var bA = A.u + A.w, bB = B.p * B.s + B.q;
          A.poly = seq([M(1, 'x', 2), M(aRight ? bA : -bA, 'x'), N(A.u * A.w)]); B.poly = seq([M(B.p, 'x', 2), M(aRight ? -bB : bB, 'x'), N(B.q * B.s)]);
          return { a: A, b: B };
        },
        parts: ['a', 'b'].map(function (w) { return [
          { id: '17' + w + 'i', sub: w + ' i', outcome: 'AN5', level: 'BEG', make: function (r, s) {
            var Z = s[w], e = Z.claim.poly, terms = P.sorted(e), f = Z.claim.tex;
            return polyPart('To check ' + t(Z.poly + '=' + f) + ', multiply out ' + t(f) + ' and simplify.', e, [{ is: P.add(P.mono(terms[0].c, terms[0].v), P.mono(terms[2].c, terms[2].v)), code: 'missing-term', hint: 'You multiplied only the first terms and the last terms. Multiply every term of the first bracket by every term of the second (FOIL), then collect the ' + t('x') + '-terms.' }],
              t(f + '=' + seq(w === 'a' ? [M(1, 'x', 2), M(Z.w, 'x'), M(Z.u, 'x'), N(Z.u * Z.w)] : [M(Z.p, 'x', 2), M(Z.p * Z.s, 'x'), M(Z.q, 'x'), N(Z.q * Z.s)]) + '=' + tx(e)),
              ['Multiply each term of the first bracket by each term of the second.', 'Collect the two ' + t('x') + '-terms.'], '17' + w + ' expand ' + plain(f), { before: t(f + '=') });
          } },
          { id: '17' + w + 'ii', sub: w + ' ii', outcome: 'AN5', level: 'BEG', make: function (r, s) {
            var Z = s[w], e = tx(Z.claim.poly), f = Z.claim.tex;
            var p = KP.mc(r, 'So is ' + t(Z.poly + '=' + f) + ' correct?', [
              { html: '<b>Correct</b>', right: Z.ok, why: Z.ok ? null : 'Your expansion ' + t(f + '=' + e) + ' doesn’t match ' + t(Z.poly) + ': the middle terms have opposite signs.' },
              { html: '<b>Not correct</b>', right: !Z.ok, why: Z.ok ? 'Your expansion ' + t(f + '=' + e) + ' matches ' + t(Z.poly) + ' term for term.' : null }],
              t(f + '=' + e) + (Z.ok ? ', which matches: <b>correct</b>.' : ', but the question has ' + t(Z.poly) + ' (the middle term’s sign is different): <b>not correct</b>.'),
              ['Compare your expansion with the trinomial, term by term.'], '17' + w + ' verdict', true);
            p.input.columns = 2;
            return p;
          } }]; }).reduce(function (a, b) { return a.concat(b); }, []) },

      /* ======================= Part 3 · PRG ======================= */
      { num: '18', outcome: 'AN5', stem: 'Factor completely. Check that no factor can be factored again.', parts: [
        { id: '18a', outcome: 'AN5', level: 'PRG', make: function (r) {
          var z = pick(function () { return { g: r.int(2, 6), q: r.int(2, 7) }; }, function (z) { return z.g * z.q * z.q <= 150; });
          var G = M(z.g, 'x'), Ft = FT(G, [lin(1, 'x', -z.q), lin(1, 'x', z.q)]), poly = tx(Ft.poly);
          return fac(t(poly), Ft, [{ is: FT(N(z.g), [lin(1, 'x', -z.q), lin(1, 'x', z.q)]), code: 'gcf-dropped', hint: 'Both terms have an ' + t('x') + ': the common factor is ' + t(z.g + 'x') + '.' },
            { is: FT(G, [{ terms: lin(1, 'x', -z.q), k: 2 }]), code: 'u4t-dos-square', hint: t('x^{2}-' + z.q * z.q) + ' is a difference of squares: ' + t('(x-' + z.q + ')(x+' + z.q + ')') + '.' }],
            'GCF ' + t('=' + z.g + 'x') + ': ' + t(poly + '=' + z.g + 'x(x^{2}-' + z.q * z.q + ')') + '<br>Difference of squares: ' + t('=' + Ft.tex), ['Take out the common factor (number and ' + t('x') + ') first.', 'Then check the bracket: is it a difference of squares?'], 'factor ' + plain(poly));
        } },
        { id: '18b', outcome: 'AN5', level: 'PRG', make: function (r) {
          var z = pick(function () { return { g: r.int(2, 4), m: r.int(4, 8), n: r.int(1, 5) }; }, function (z) { return z.m - z.n >= 2; });
          var Ft = FT(N(-z.g), [lin(1, 'x', -z.m), lin(1, 'x', z.n)]), poly = tx(Ft.poly), d = z.m - z.n;
          return fac(t(poly), Ft, [{ is: FT(null, [lin(1, 'x', -z.m), lin(1, 'x', z.n)]), code: 'gcf-dropped', hint: 'Don’t lose the common factor ' + t(-z.g) + '.' },
            { is: FT(N(z.g), [lin(1, 'x', -z.m), lin(1, 'x', z.n)]), code: 'gcf-sign', hint: 'Your factors multiply to the opposite of the expression. The leading term is negative, so take out ' + t(-z.g) + '.' },
            { is: FT(N(-z.g), [lin(1, 'x', z.m), lin(1, 'x', -z.n)]), code: 'sign-swap', hint: 'After taking out ' + t(-z.g) + ' the bracket is ' + t('x^{2}-' + d + 'x-' + z.m * z.n) + ': your pair adds to ' + t(d) + ' instead of ' + t(-d) + '.' }],
            'The leading term is negative: take out ' + t(-z.g) + ' (every sign in the bracket changes).<br>' + t(poly + '=-' + z.g + '(x^{2}-' + d + 'x-' + z.m * z.n + ')') + '<br>' + t(-z.m + '\\times ' + z.n + '=' + (-z.m * z.n)) + ', ' + t(-z.m + '+' + z.n + '=' + (-d)) + ':<br>' + t('=' + Ft.tex),
            ['The leading coefficient is negative: take out ' + t(-z.g) + ' first.', 'Then factor the trinomial in the bracket.'], 'factor ' + plain(poly));
        } },
        { id: '18c', outcome: 'AN5', level: 'PRG', make: function (r) {
          var z = triPick(r, function () { var sg1 = r.pick([1, -1]); return { p: r.int(2, 5), q: sg1 * r.int(1, 6), r: 2, s: -sg1 * r.int(1, 3) }; }, function (o) { var b = o.p * o.s + o.q * o.r; return o.p !== o.r && b !== 0 && Math.abs(b) <= 9 && Math.abs(o.p * o.r * o.q * o.s) <= 90; });
          z.k = r.pick([2, 2, 3]); z.gv = { y: 1 };
          return triPart(Tri(z));
        } },
        { id: '18d', outcome: 'AN5', level: 'PRG', make: function (r) {
          var pq = r.pick([[1, 2], [1, 3], [1, 4], [1, 5], [2, 1], [2, 3], [2, 5], [3, 1], [3, 2]]), p = pq[0], q = pq[1], v = r.pick(['x', 'x', 'a', 'm', 't', 'y']);
          var Ft = FT(null, [lin(p, v, -q), lin(p, v, q), [M(p * p, v, 2), N(q * q)]]), poly = tx(Ft.poly), sq = [M(p * p, v, 2), N(-q * q)], ss = [M(p * p, v, 2), N(q * q)];
          return fac(t(poly), Ft, [{ is: FT(null, [{ terms: sq, k: 2 }]), code: 'u4t-dos-square', hint: t('(' + seq(sq) + ')^{2}') + ' has a middle term. A difference of squares is ' + t('(A-B)(A+B)') + '.' },
            { is: FT(null, [lin(p, v, -q), { terms: lin(p, v, q), k: 3 }]), code: 'sum-sq', hint: t(seq(ss)) + ' is a <b>sum</b> of squares — it doesn’t factor.' },
            { is: FT(null, [{ terms: lin(p, v, -q), k: 2 }, { terms: lin(p, v, q), k: 2 }]), code: 'sum-sq', hint: t(seq(ss)) + ' is a <b>sum</b> of squares — it doesn’t factor into ' + t(br(lin(p, v, -q)) + br(lin(p, v, q))) + '.' }],
            t(poly + '=(' + tx(M(p * p, v, 2)) + ')^{2}-' + q * q + '^{2}=' + br(sq) + br(ss)) + '<br>' + t(seq(sq) + '=(' + tx(M(p, v)) + ')^{2}-' + q + '^{2}') + ' is a difference of squares again; ' + t(seq(ss)) + ' is a sum of squares and does not factor.<br>' + t(poly + '=' + Ft.tex),
            ['Write it as ' + t('A^{2}-B^{2}') + ' with ' + t('A=' + tx(M(p * p, v, 2))) + '.', 'Check each bracket: can it be factored again?'], 'factor ' + plain(poly), { bad: [br(sq) + br(ss)] });
        } }] },

      /* ======================= Part 3 · MAS ======================= */
      { num: '19', outcome: 'AN5',
        shared: function (r) {
          var s = r.pick([5, 7, 9, 11, 13]), k = pick(function () { return r.pick([1, 3, 5, 7, 9, 11]); }, function (k) { return k < s; });
          var ctx = r.pick([{ what: 'A square metal sheet', cut: 'square is cut from one corner', rest: 'the remaining sheet', u: 'cm' }, { what: 'A square patio', cut: 'square flower bed fills one corner', rest: 'the paved part', u: 'm' },
            { what: 'A square quilt block', cut: 'square patch fills one corner', rest: 'the part outside the patch', u: 'cm' }]);
          return { s: s, k: k, c: ctx, lo: (s - k) / 2, hi: (s + k) / 2 };
        },
        stem: function (z) { return z.c.what + ' has side length ' + t('(2x+' + z.s + ')') + ' ' + z.c.u + '. A ' + t(z.k) + ' ' + z.c.u + ' by ' + t(z.k) + ' ' + z.c.u + ' ' + z.c.cut + '.' + lShape(z.s, z.k); },
        parts: [
          { id: '19a', sub: 'a', outcome: 'AN5', level: 'MAS', make: function (r, z) {
            var big = sum(lin(2, 'x', z.s)), A = P.sub(P.pow(big, 2), N(z.k * z.k)), key = '(2x+' + z.s + ')^{2}-' + z.k + '^{2}';
            var chk = function (resp) {
              var a = K.read(resp); if (a.res) return a.res;
              var rp = P.read(a.ast); if (!rp.ok) return wrong('value', null);
              var top = strip(a.ast), isSqr = function (n) { n = strip(n); return n && n.t === 'pow' && n.b && n.b.t === 'num' && n.b.v === 2; };
              if (P.eq(rp.p, A)) {
                if (top && top.t === 'sub' && isSqr(top.a) && isSqr(top.b)) return ok();
                if (top && top.t === 'sub' && isSqr(top.a) && strip(top.b).t === 'num' && strip(top.b).v === z.k * z.k) return ok(); // (2x+s)² − k², with k² worked out
                return form('u4t-not-dos', 'Right area — now write it as a difference of two squares, ' + t('A^{2}-B^{2}') + ': the big square minus the cut square.');
              }
              if (P.eq(rp.p, P.sub(P.pow(big, 2), N(z.k)))) return wrong('u4t-cut-not-squared', 'The cut piece is a square of side ' + t(z.k) + ': its area is ' + t(z.k + '^{2}') + ', not ' + t(z.k) + '.');
              if (P.eq(rp.p, P.pow(sum(lin(2, 'x', z.s - z.k)), 2))) return wrong('u4t-side-minus', 'Taking ' + t(z.k) + ' off the side gives a smaller square, not this shape. Subtract the <b>area</b> of the cut square from the area of the big one.');
              if (P.eq(rp.p, P.pow(big, 2))) return wrong('missing-term', 'That is the whole square. Subtract the cut corner.');
              return wrong('value', null);
            };
            var p = KP.math('Write the area of ' + z.c.rest + ' as a difference of squares.', chk, key,
              'Area of the big square minus the area of the cut square:<br>' + t('\\text{Area}=(2x+' + z.s + ')^{2}-' + z.k + '^{2}') + ' ' + z.c.u + t('^{2}'),
              ['The whole square has area ' + t('(\\text{side})^{2}') + '. What area is removed?'], 'L-shape area as DoS ' + z.s + ',' + z.k, { keys: 'poly', vars: ['x'], before: t('\\text{Area}='), after: z.c.u + t('^{2}') });
            p.bad = (z.k > 1 ? ['(2x+' + z.s + ')^{2}-' + z.k] : []).concat([tx(A), '(2x+' + (z.s - z.k) + ')^{2}']);
            return p;
          } },
          { id: '19b', sub: 'b', outcome: 'AN5', level: 'MAS', make: function (r, z) {
            var Ft = FT(N(4), [lin(1, 'x', z.lo), lin(1, 'x', z.hi)]);
            return fac('Factor the area <b>completely</b>.', Ft, [{ is: FT(N(2), [lin(1, 'x', z.lo), lin(1, 'x', z.hi)]), code: 'u4t-two-not-four', hint: 'Each bracket ' + t('(2x+' + 2 * z.lo + ')') + ' and ' + t('(2x+' + 2 * z.hi + ')') + ' gives a ' + t('2') + ': ' + t('2\\times 2=4') + '.' },
              { is: FT(null, [{ terms: lin(2, 'x', z.s - z.k), k: 2 }]), code: 'u4t-side-minus', hint: 'Use ' + t('A^{2}-B^{2}=(A-B)(A+B)') + ' with ' + t('A=2x+' + z.s) + ' and ' + t('B=' + z.k) + '.' }],
              t('(2x+' + z.s + ')^{2}-' + z.k + '^{2}=[(2x+' + z.s + ')-' + z.k + '][(2x+' + z.s + ')+' + z.k + ']') + '<br>' + t('=(2x+' + 2 * z.lo + ')(2x+' + 2 * z.hi + ')=2(x+' + z.lo + ')\\cdot 2(x+' + z.hi + ')') + '<br>' + t('=' + Ft.tex) + ' ' + z.c.u + t('^{2}') + '<br>(Expanding to ' + t(tx(Ft.poly)) + ' and then factoring is also fine.)',
              ['Use ' + t('A^{2}-B^{2}=(A-B)(A+B)') + ' with ' + t('A=2x+' + z.s) + '.', 'Each bracket still has a common factor of ' + t('2') + '.'], 'L-shape factor ' + z.s + ',' + z.k, { after: z.c.u + t('^{2}'), bad: ['(2x+' + 2 * z.lo + ')(2x+' + 2 * z.hi + ')'] });
          } }] },
      { num: '20', outcome: 'AN5', stem: 'Use factoring to calculate each one <b>without a calculator</b>. Show how.', parts: [
        { id: '20a', sub: 'a', outcome: 'AN5', level: 'MAS', make: function (r) {
          var m = pick(function () { return r.int(52, 89); }, function (m) { return m % 10 !== 0; }), n = 100 - m, V = m * m - n * n;
          var fchk = function (resp) {
            var a = K.read(resp); if (a.res) return a.res;
            var top = strip(a.ast);
            if (Math.abs(a.val - V) > 1e-9) { if (Math.abs(a.val - (m - n) * (m - n)) < 1e-9) return wrong('u4t-mental-dos', t(m + '^{2}-' + n + '^{2}') + ' is not ' + t('(' + m + '-' + n + ')^{2}') + '. Use ' + t('A^{2}-B^{2}=(A-B)(A+B)') + '.'); return wrong('value', 'Use ' + t('A^{2}-B^{2}=(A-B)(A+B)') + ' with ' + t('A=' + m) + ' and ' + t('B=' + n) + '.'); }
            if (!top || top.t !== 'mul') return form('u4t-show-how', 'Right value — now show the factoring: write it as ' + t('(A-B)(A+B)') + ' or as the product of two numbers.');
            return ok();
          };
          return boxes('Calculate ' + t(m + '^{2}-' + n + '^{2}') + '.', [polyBox('Factored:', [], { before: t(m + '^{2}-' + n + '^{2}='), name: 'Factored form', ph: 'e.g. (A − B)(A + B)' }), numBox('Value:', { before: t('='), name: 'Value' })],
            [fchk, K.number(V, function (v) { if (v === (m - n) * (m - n)) return { code: 'u4t-mental-dos', hint: 'Multiply the difference by the sum.' }; if (v % 100 === 0 || Math.abs(v - V) <= 200) return { code: 'u4t-mental-arith', hint: 'Check: ' + t((m - n) + '\\times 100') + '.' }; return null; })],
            ['(' + m + '-' + n + ')(' + m + '+' + n + ')', String(V)], t('(' + m + '-' + n + ')(' + m + '+' + n + ')=' + (m - n) + '\\times 100=' + F(V)),
            t(m + '^{2}-' + n + '^{2}=(' + m + '-' + n + ')(' + m + '+' + n + ')=' + (m - n) + '\\times 100=' + F(V)),
            ['It is a difference of squares: ' + t('A^{2}-B^{2}=(A-B)(A+B)') + '.', 'What is ' + t(m + '+' + n) + '?'], 'mental ' + m + '²−' + n + '²', [[String(V), String(V)], ['(' + m + '-' + n + ')^{2}', String((m - n) * (m - n))], ['(' + m + '-' + n + ')(' + m + '+' + n + ')', String(V + 100)]], [[(m - n) + '\\times 100', String(V)]]);
        } },
        { id: '20b', sub: 'b', outcome: 'AN5', level: 'MAS', make: function (r) {
          var c = r.pick([30, 40, 50, 60, 70, 80, 90]), d = r.int(1, 4), V = c * c - d * d;
          var dchk = function (resp) {
            var a = K.read(resp); if (a.res) return a.res;
            var top = strip(a.ast), isPw = function (n, base) { n = strip(n); return n && n.t === 'pow' && strip(n.a) && strip(n.a).t === 'num' && strip(n.a).v === base && n.b && n.b.t === 'num' && n.b.v === 2; };
            if (Math.abs(a.val - V) > 1e-9) { if (Math.abs(a.val - (c * c + d * d)) < 1e-9) return wrong('sign', '(Sum)(difference) gives a <b>difference</b> of squares: ' + t('(A+B)(A-B)=A^{2}-B^{2}') + '.'); return wrong('value', 'Write ' + t((c + d) + '=' + c + '+' + d) + ' and ' + t((c - d) + '=' + c + '-' + d) + ', then use ' + t('(A+B)(A-B)=A^{2}-B^{2}') + '.'); }
            if (top && top.t === 'sub' && isPw(top.a, c) && (isPw(top.b, d) || (strip(top.b).t === 'num' && strip(top.b).v === d * d))) return ok();
            /* (c + d)(c − d), the sum-times-difference step that gives c² − d², shows the factoring too */
            var sd = function (n) { n = strip(n); if (!n || (n.t !== 'add' && n.t !== 'sub')) return null; var u = strip(n.a), w = strip(n.b); return u && w && u.t === 'num' && w.t === 'num' && u.v === c && w.v === d ? n.t : null; };
            if (top && top.t === 'mul' && sd(top.a) && sd(top.b) && sd(top.a) !== sd(top.b)) return ok();
            return form('u4t-show-how', 'Right value — now show the difference of squares, ' + t(c + '^{2}-' + d + '^{2}') + ', before working it out.');
          };
          return boxes('Calculate ' + t((c + d) + '\\times ' + (c - d)) + '.', [polyBox('Difference of squares:', [], { before: t((c + d) + '\\times ' + (c - d) + '='), name: 'Difference of squares', ph: 'e.g. A^2 − B^2' }), numBox('Value:', { before: t('='), name: 'Value' })],
            [dchk, K.number(V, function (v) { if (v === c * c + d * d) return { code: 'sign', hint: 'Subtract ' + t(d + '^{2}') + ', don’t add it.' }; if (v === c * c - 2 * d || v === c * c - d) return { code: 'u4t-mental-arith', hint: t(d + '^{2}=' + d * d) + '.' }; return null; })],
            [c + '^{2}-' + d + '^{2}', String(V)], t('(' + c + '+' + d + ')(' + c + '-' + d + ')=' + c + '^{2}-' + d + '^{2}=' + F(c * c) + '-' + d * d + '=' + F(V)),
            t((c + d) + '\\times ' + (c - d) + '=(' + c + '+' + d + ')(' + c + '-' + d + ')=' + c + '^{2}-' + d + '^{2}') + '<br>' + t('=' + F(c * c) + '-' + d * d + '=' + F(V)),
            ['Both numbers are ' + t(d) + ' away from ' + t(c) + '.', t('(A+B)(A-B)=A^{2}-B^{2}') + '.'], 'mental ' + (c + d) + '×' + (c - d), [[String(V), String(V)], [c + '^{2}+' + d + '^{2}', String(c * c + d * d)]], [[c + '^{2}-' + d * d, String(V)]]);
        } }] },
      { num: '21', outcome: 'AN5',
        shared: function (r) {
          var z = pick(function () { return { g: r.int(2, 5), q: r.int(1, 5), s: r.pick([1, -1]) }; }, function (z) { return z.g * z.q * 2 <= 40; });
          z.name = r.pick(['Lee', 'Ava', 'Noah', 'Sam', 'Priya', 'Jordan']);
          z.Ft = FT(N(z.g), [{ terms: lin(1, 'x', z.s * z.q), k: 2 }]); z.poly = tx(z.Ft.poly); z.stu = FT(null, [lin(z.g, 'x', z.s * z.g * z.q), lin(1, 'x', z.s * z.q)]);
          z.br1 = br(lin(z.g, 'x', z.s * z.g * z.q));
          return z;
        },
        stem: function (z) { return z.name + ' factored ' + t(z.poly) + ' as ' + t(z.stu.tex) + '. Is ' + z.name + '’s answer correct, and is it factored completely?'; },
        parts: [
          { id: '21a', sub: 'a', outcome: 'AN5', level: 'MAS', make: function (r, z) {
            var rows = [{ id: 'eq', html: 'It multiplies out to ' + t(z.poly), label: 'equal' }, { id: 'comp', html: 'It is factored completely', label: 'complete' }];
            var p = KP.grid('Decide whether each statement about ' + z.name + '’s answer is true.', rows, [{ id: 'yes', html: 'True', label: 'true' }, { id: 'no', html: 'False', label: 'false' }], { eq: 'yes', comp: 'no' },
              { why: function (id) { return id === 'eq' ? { code: 'row', hint: 'Expand it: ' + t(z.stu.tex + '=' + z.poly) + '.' } : { code: 'row', hint: 'Look at the bracket ' + t(z.br1) + ': do its terms have a common factor?' }; }, rowHead: 'Statement' },
              'It multiplies out correctly: ' + t(z.stu.tex + '=' + z.poly) + ', so it is <b>equal</b>. But it is <b>not complete</b>: ' + t(z.br1) + ' still has the common factor ' + t(z.g) + '. (Expanding correctly is not enough — no factor may factor again.)',
              ['Expand the answer to test the first statement.', 'For the second, check every bracket for a common factor.'], 'Q21 verdict');
            p.bad = [{ eq: 'yes', comp: 'yes' }, { eq: 'no', comp: 'no' }];
            return p;
          } },
          { id: '21b', sub: 'b', outcome: 'AN5', level: 'MAS', make: function (r, z) {
            var base = facCheck(z.Ft, [{ is: FT(null, [{ terms: lin(1, 'x', z.s * z.q), k: 2 }]), code: 'gcf-dropped', hint: 'Don’t lose the common factor ' + t(z.g) + '.' }]);
            var full = function (resp) { var res = base(resp); if (res.v === 'form' && (res.code === 'gcf-inside')) return wrong('u4t-kept-error', 'That still has a common factor inside a bracket — like ' + z.name + '’s answer, it isn’t factored completely.'); return res; };
            return boxes('Find the common factor that ' + z.name + ' missed, and write ' + t(z.poly) + ' factored completely.',
              [numBox('Common factor still in ' + t(z.br1) + ':', { name: 'Common factor' }), polyBox('Factored completely:', ['x'], { before: t(z.poly + '=') })],
              [K.number(z.g, function (v) { if (v === z.g * z.q || v === z.q) return { code: 'value', hint: 'Which number divides <b>both</b> terms of ' + t(z.br1) + '?' }; return null; }), full],
              [String(z.g), z.Ft.tex], t(z.g) + '; ' + t(z.poly + '=' + z.Ft.tex),
              t(z.br1 + '=' + z.g + br(lin(1, 'x', z.s * z.q))) + ', so ' + t(z.stu.tex + '=' + z.g + br(lin(1, 'x', z.s * z.q)) + br(lin(1, 'x', z.s * z.q))) + '.<br>Or take out the GCF first: ' + t(z.poly + '=' + z.g + '(' + tx(P.mul(sum(lin(1, 'x', z.s * z.q)), sum(lin(1, 'x', z.s * z.q)))) + ')=' + z.Ft.tex),
              ['Take out the GCF of the whole trinomial first.', 'Then factor what is left: it is a perfect square.'], 'Q21 complete ' + plain(z.poly), [[String(z.g), z.stu.tex], [String(z.g), '(x' + sg(z.s * z.q) + ')^{2}']], [[String(z.g), z.g + '(x' + sg(z.s * z.q) + ')(x' + sg(z.s * z.q) + ')']]);
          } }] }
    ]
  });

  function Ft2poly(z) { return P.add(z.t1, z.t2, z.t3); }
})(window);
