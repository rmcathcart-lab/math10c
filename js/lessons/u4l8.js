/* Math 10C · Unit 4 · Lesson 8 — Unit 4 Review: Factoring (AN5)
 * Assignment questions 1–24 (u4_L08.tex: Beginning, Progressing and Mastery sections laid out like the unit test, plus
 * the Lesson 7 extension) and the whole Lesson 8 Extra Practice (u4_EP08.tex, Q1–22).
 * Every part is a generator that keeps the booklet question's structure (GCF first or not, monic or not, sign pattern,
 * number of letters, perfect squares, sums of squares, negative leading coefficients) and changes the numbers; the
 * booklet's numbers are one of the possible values. Factored keys are built from the generated factors with HW.factor
 * and HW.poly, so they always expand to the question. Levels follow LEVEL_RUBRIC.md (recognition formats one level below
 * the constructed task, capped at PRG). */
(function (root) {
  'use strict';
  var HW = root.HW, K = HW.kit, KP = K.P, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form, P = HW.poly, FX = HW.factor, F = HW.fmt;

  HW.addCodes({
    'gcf-one': 'Dropped the 1 left when a term equal to the GCF is divided', 'gcf-power': 'Wrong power of the variable in the GCF',
    'sign-swap': 'Signs in the wrong brackets (pair by product only)', 'dos-square': 'Wrote a difference of squares as a square',
    'sum-split': 'Tried to factor a sum of squares', 'swap-const': 'Constants in the wrong brackets', 'student-ans': 'Repeated the student’s answer',
    'gcf-small': 'Took out a common factor that isn’t the greatest', 'neg-gcf': 'Took out a negative GCF', 'nr-sign': 'Sign slip in the numerical response',
    'not-doubled': 'Middle term of a perfect square not doubled', 'half-perim': 'Gave half the perimeter', 'area-not-perim': 'Gave the area instead of the perimeter',
    'perim-s': 'Added the two unknown sides only once', 'count-pos': 'Counted only the positive values', 'count-ordered': 'Counted each pair twice',
    'count-zero': 'Counted b = 0', 'not-form': 'Not of the form x² + bx + c', 'wrong-c': 'Wrong constant term', 'can-factor': 'Example can actually be factored',
    'cannot-factor': 'Example cannot be factored', 'divided-x': 'Divided by x and lost the root 0', 'forgot-m': 'Root of (mx − s) taken as s instead of s/m',
    'no-rearrange': 'Didn’t move every term to one side first', 'smallest-sum': 'Used the smallest pair sum, not the largest', 'forgot-1': 'Left out the pair 1 × c',
    'times-c': 'Multiplied instead of using the pair', 'kept-neg': 'Kept the root that has no meaning', 'bad-dim': 'A dimension is zero or negative',
    'coef-fraction': 'Coefficients not integers', 'root-missing': 'Equation is missing a required root', 'root-extra': 'Equation has an extra root',
    'root-sign': 'Root ↔ factor sign mix-up', 'double-root': 'Repeated root not repeated in the equation', 'minus-dist': 'Subtracted a bracket without changing every sign',
    'no-middle': 'Squared a binomial without the middle term', 'count-const': 'Counted a constant factor as giving a solution', 'count-repeat': 'Counted a repeated factor twice',
    'dos-again': 'Didn’t split a difference of squares again', 'gcf-dropped': 'Dropped the common factor', 'grid-alt': 'Wrong method in the table', 'other-root': 'Gave the rejected root'
  });

  /* ---------------- polynomial helpers ---------------- */
  function M(c, v, e) { var o = {}; if (v) o[v] = e == null ? 1 : e; return P.mono(c, o); }   // c·v^e
  function MM(c, vs) { return P.mono(c, vs); }                                                 // c·x^a·y^b
  function N(c) { return P.num(c); }
  function sum(arr) { return P.add.apply(null, arr); }
  function seq(arr) { return P.seq(arr); }
  function br(arr) { return '(' + seq(arr) + ')'; }
  function tx(p, o) { return P.tex(p, o); }
  function lin(a, v, b) { return [M(a, v), N(b)]; }             // a v + b, as terms
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t2 = a % b; a = b; b = t2; } return a; }
  function pick(gen, test) { for (var i = 0; i < 4000; i++) { var v = gen(); if (test(v)) return v; } throw new Error('pick failed'); }
  function lc(n) { return n === 1 ? '' : n === -1 ? '-' : String(n); }   // coefficient in front of a letter
  function pv(n) { return n < 0 ? '(' + n + ')' : String(n); }
  function sg(n) { return n < 0 ? String(n) : '+' + n; }
  function isSq(n) { var r = Math.round(Math.sqrt(n)); return n >= 0 && r * r === n; }
  function pairsOf(c) { var out = []; for (var d = 1; d * d <= c; d++) if (c % d === 0) out.push([d, c / d]); return out; }
  function sumsOf(c) { return pairsOf(c).map(function (q) { return q[0] + q[1]; }); }
  function plain(s) { return String(s).replace(/\\left|\\right|\\,|\\ /g, '').replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '$1/$2').replace(/\\cdot/g, '·').replace(/\\times/g, '×').replace(/\\pm/g, '±').replace(/[{}\\]/g, ''); }
  function frac(p, q) { var g = gcd(p, q); p /= g; q /= g; if (q < 0) { p = -p; q = -q; } return q === 1 ? String(p) : (p < 0 ? '-' : '') + '\\frac{' + Math.abs(p) + '}{' + q + '}'; }
  function rat(p, q) { var g = gcd(p, q); p /= g; q /= g; if (q < 0) { p = -p; q = -q; } return q === 1 ? p : [p, q]; }

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
  /* "factor (completely)" part; wrongs: [{ is: FT | list | poly, code, hint }] (any equal to the target are dropped) */
  function fac(prompt, Ft, wrongs, sol, hints, text, o) {
    o = o || {}; var T = Ft.poly, ws = [], seen = [];
    (wrongs || []).forEach(function (w) {
      if (!w || !w.is) return; var p = prodOf(w.is);
      if (P.eq(p, T) || seen.some(function (q) { return P.eq(q, p); })) return;
      seen.push(p); ws.push({ is: p, code: w.code, hint: w.hint, tex: wtex(w.is) });
    });
    var part = KP.factored(prompt, Ft.list, { wrong: ws.map(function (w) { return { is: w.is, code: w.code, hint: w.hint }; }), keyTex: Ft.tex, gcfOnly: o.gcfOnly, vars: o.vars }, sol, hints, text);
    part.bad = ws.map(function (w) { return w.tex; }).concat(o.bad || []);
    part.good = o.good || [];
    return part;
  }
  function cleanW(T, ws) {
    var out = [];
    (ws || []).forEach(function (w) { if (!w || !w.is) return; var p = P.lift(w.is); if (P.eq(p, T) || out.some(function (o) { return P.eq(o.is, p); })) return; out.push({ is: p, code: w.code, hint: w.hint }); });
    return out;
  }
  function polyPart(prompt, target, wrongs, sol, hints, text, o) {
    o = o || {}; var T = P.lift(target), ws = cleanW(T, wrongs);
    var p = KP.poly(prompt, T, { wrong: ws, keyTex: o.keyTex, vars: o.vars, expanded: o.expanded }, sol, hints, text);
    p.bad = ws.map(function (w) { return tx(w.is); }).concat(o.bad || []);
    p.good = [tx(T, { order: 'asc' })].concat(o.good || []);
    return p;
  }
  function mc(r, prompt, opts, sol, hints, text, keep) { return KP.mc(r, prompt, opts, sol, hints, text, keep); }
  function nr(prompt, ans, diag, sol, hints, text) { var p = KP.nr(prompt, ans, diag, sol, hints, text); return p; }
  function vs(prompt, values, opt, sol, hints, text, bad) { var p = KP.valueSet(prompt, values, opt, sol, hints, text); p.bad = bad || []; return p; }
  function numBox(label, name) { return { label: label, name: name || label.replace(/<[^>]*>|\\\(|\\\)/g, '') }; }
  function polyBox(label, vars, name) { return { label: label, name: name || label.replace(/<[^>]*>|\\\(|\\\)/g, ''), mode: 'math', keys: 'poly', vars: vars || ['x'], wide: true }; }
  function readP(s) {
    var a = K.read(s); if (a.res) return { res: a.res };
    var r = P.read(a.ast); if (!r.ok) return { res: wrong('not-poly', 'That isn’t a polynomial.') };
    return { p: r.p, ast: a.ast };
  }
  function dimsPart(prompt, A, B, sol, hints, text, diag) { // two binomial boxes, either order
    var at = tx(A), bt = tx(B);
    return { prompt: prompt, input: { type: 'fields', fields: [polyBox('Length:', ['x']), polyBox('Width:', ['x'])] }, key: [at, bt], answer: t('(' + at + ')(' + bt + ')'), solution: sol, hints: hints, text: text,
      check: function (resp) {
        resp = resp || [];
        if (!resp[0] || !resp[1]) return form('blank', 'Fill in both dimensions.');
        var a = readP(resp[0]), b = readP(resp[1]); if (a.res) return a.res; if (b.res) return b.res;
        if ((P.eq(a.p, A) && P.eq(b.p, B)) || (P.eq(a.p, B) && P.eq(b.p, A))) return ok();
        var h = diag ? diag(a.p, b.p) : null; if (h) return wrong(h.code, h.hint);
        if (P.eq(a.p, A) || P.eq(a.p, B) || P.eq(b.p, A) || P.eq(b.p, B)) return wrong('one-dim', 'One dimension is right. Count the tiles along the other side again.');
        return wrong('value', null);
      }, bad: [[at, at], [tx(P.add(A, N(1))), bt]] };
  }
  HW.addCodes({ 'one-dim': 'One dimension wrong' });

  /* ---------------- drawings ---------------- */
  var POS = '#9aa3ad', NEG = '#ffffff', STK = '#2b3340';
  function tile(x, y, w, h, neg) {
    var s = '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="1.5" fill="' + (neg ? NEG : POS) + '" stroke="' + STK + '" stroke-width="1.3"/>';
    if (neg) { var cx = x + w / 2, cy = y + h / 2, L = Math.min(w, h) * 0.32; s += '<line x1="' + (cx - L) + '" y1="' + cy + '" x2="' + (cx + L) + '" y2="' + cy + '" stroke="' + STK + '" stroke-width="1.3"/>'; }
    return s;
  }
  /* a loose pile: n2 x²-tiles, n1 x-tiles, n0 unit tiles (negative counts = negative tiles); units stacked four high */
  function pile(n2, n1, n0) {
    var X = 44, U = 12, G = 4, x = 2, s = '', i;
    for (i = 0; i < Math.abs(n2); i++) { s += tile(x, 2, X, X, n2 < 0); x += X + G; }
    x += 6;
    for (i = 0; i < Math.abs(n1); i++) { s += tile(x, 2, U, X, n1 < 0); x += U + G; }
    x += 6;
    var cols = Math.ceil(Math.abs(n0) / 4);
    for (i = 0; i < Math.abs(n0); i++) { var c = Math.floor(i / 4), rr = i % 4; s += tile(x + c * (U + 3), 2 + rr * (U + 3), U, U, n0 < 0); }
    x += cols * (U + 3);
    var W = x + 2, H = Math.max(X, 4 * U + 9) + 4;
    return '<svg class="tiles-svg" viewBox="0 0 ' + W + ' ' + H + '" width="100%" style="max-width:' + Math.min(520, Math.round(W * 1.5)) + 'px" role="img" aria-label="algebra tiles">' + s + '</svg>';
  }
  /* the rectangle for (x + p)(x + q): x² at top left, p x-tiles across, q x-tiles down, pq units; "?" for both sides */
  function tileRect(p, q) {
    var X = 44, U = 12, ox = 22, oy = 20, s = '', i, j;
    s += tile(ox, oy, X, X, false);
    for (i = 0; i < p; i++) s += tile(ox + X + i * U, oy, U, X, false);
    for (j = 0; j < q; j++) s += tile(ox, oy + X + j * U, X, U, false);
    for (i = 0; i < p; i++) for (j = 0; j < q; j++) s += tile(ox + X + i * U, oy + X + j * U, U, U, false);
    var W = X + p * U, H = X + q * U;
    s += '<rect x="' + ox + '" y="' + oy + '" width="' + W + '" height="' + H + '" fill="none" stroke="' + STK + '" stroke-width="2.4"/>';
    s += '<text x="' + (ox + W / 2) + '" y="' + (oy - 6) + '" font-size="13" text-anchor="middle" fill="currentColor">?</text>';
    s += '<text x="' + (ox - 10) + '" y="' + (oy + H / 2 + 4) + '" font-size="13" text-anchor="middle" fill="currentColor">?</text>';
    return '<svg class="fig-svg" viewBox="0 0 ' + (ox + W + 8) + ' ' + (oy + H + 6) + '" width="100%" style="max-width:' + Math.round((ox + W + 8) * 1.6) + 'px" role="img" aria-label="algebra tile rectangle">' + s + '</svg>';
  }
  /* rectangle ABCD split into four regions (Q19) */
  function abcd(K0) {
    var s = '<rect x="24" y="14" width="220" height="150" fill="none" stroke="' + STK + '" stroke-width="2"/>';
    s += '<line x1="156" y1="14" x2="156" y2="164" stroke="' + STK + '" stroke-width="1.5"/><line x1="24" y1="120" x2="244" y2="120" stroke="' + STK + '" stroke-width="1.5"/>';
    var lab = function (x, y, txt) { return '<text x="' + x + '" y="' + y + '" font-size="15" text-anchor="middle" fill="currentColor">' + txt + '</text>'; };
    s += lab(13, 20, 'A') + lab(255, 20, 'B') + lab(255, 170, 'C') + lab(13, 170, 'D');
    s += '<text x="90" y="72" font-size="16" text-anchor="middle" fill="currentColor"><tspan font-style="italic">b</tspan><tspan font-size="11" dy="-7">2</tspan></text>';
    s += lab(200, 147, String(K0));
    return '<svg class="fig-svg" viewBox="0 0 268 178" width="100%" style="max-width:340px" role="img" aria-label="rectangle ABCD in four regions">' + s + '</svg>';
  }

  /* ---------------- generators shared by several questions ---------------- */
  function genNonMonic(r, v) { // g(pv + s)(qv + u), booklet 2(3m+4)(2m−3)
    return pick(function () { return { g: r.pick([2, 2, 3]), p: r.int(2, 5), s: r.pick([1, 2, 3, 4, 5]), q: r.int(2, 5), u: -r.pick([1, 2, 3, 4, 5]) }; },
      function (z) { var b = z.p * z.u + z.q * z.s; return z.p !== z.q && gcd(z.p, z.s) === 1 && gcd(z.q, z.u) === 1 && b !== 0 && Math.abs(b) <= 6; });
  }
  function genGroup(r) { return pick(function () { return { p: r.int(1, 7), q: r.int(2, 6) }; }, function (z) { return z.p !== z.q; }); } // (x+p)(x−q)(x+q)
  function genPST2(r) { return pick(function () { return { a: r.int(2, 7), b: r.int(2, 7) }; }, function (z) { return z.a !== z.b && gcd(z.a, z.b) === 1; }); } // (a·u − b·w)²
  function genQuartic(r) { return { k: r.pick([2, 3, 5]), q: r.pick([1, 2, 3]) }; } // k(t⁴ − q⁴)
  function genSumSq(r) { return genPST2(r); } // a²p² + b²q²

  HW.defineLesson({
    id: 'u4l8', unit: 4, num: '8', title: 'Unit 4 Review: Factoring', outcome: 'AN5',
    blurb: 'Laid out like the unit test: Beginning, Progressing and Mastery questions on every factoring tool, then a short look back at solving by factoring.',
    questions: [
      /* ================= BEGINNING ================= */
      { num: '1', section: 'Beginning (BEG) — common factors, x²+bx+c, patterns', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '1', level: 'LIM', make: function (r) {
          var z = pick(function () { return { g: r.int(2, 7), m: r.int(1, 3), a: r.int(2, 5), b: r.int(1, 5), c: r.int(2, 5) }; },
            function (z) { return gcd(gcd(z.a, z.b), z.c) === 1 && z.g !== z.a && z.a !== z.c && z.b * z.b - 4 * z.a * z.c < 0; });
          var poly = seq([M(z.g * z.a, 'x', z.m + 2), M(-z.g * z.b, 'x', z.m + 1), M(z.g * z.c, 'x', z.m)]), G = tx(M(z.g, 'x', z.m));
          var right = seq([M(z.a, 'x', 2), M(-z.b, 'x'), N(z.c)]);
          return mc(r, 'One factor of ' + t(poly) + ' is', [
            { html: t(right), right: true },
            { html: t(tx(M(z.g * z.a, 'x', z.m + 2))), why: t(tx(M(z.g * z.a, 'x', z.m + 2))) + ' is the first <b>term</b>, not a factor of the whole polynomial — it doesn’t divide the other terms. Find the GCF first.' },
            { html: t(seq([M(z.g, 'x', 2), M(-z.b, 'x'), N(z.c)])), why: 'Check the first term of the bracket: ' + t(tx(M(z.g * z.a, 'x', z.m + 2)) + '\\div ' + G + '=' + tx(M(z.a, 'x', 2))) + '.' },
            { html: t(seq([M(z.a, 'x', 2), M(-z.b, 'x'), N(1)])), why: 'Check the last term of the bracket: ' + t(tx(M(z.g * z.c, 'x', z.m)) + '\\div ' + G + '=' + z.c) + '. A term divided by the GCF gives ' + t('1') + ' only when the term <i>equals</i> the GCF.' }],
            'The GCF is ' + t(G) + ' (' + t('\\gcd(' + [z.g * z.a, z.g * z.b, z.g * z.c].join(',') + ')=' + z.g) + ', lowest power ' + t(tx(M(1, 'x', z.m))) + '):<br>' + t(poly + '=' + G + '(' + right + ')') + '<br>So ' + t(right) + ' is a factor.',
            ['Find the GCF of the three terms first: the greatest common factor of the coefficients and the lowest power of ' + t('x') + '.', 'Divide every term by the GCF to get the other factor.'], 'one factor of ' + plain(poly));
        } }] },
      { num: '2', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '2', level: 'LIM', make: function (r) {
          var L = r.pick([['s', 't'], ['a', 'b'], ['m', 'n'], ['x', 'y']]), s = L[0], u = L[1], p = r.int(2, 5), q = r.int(2, 5);
          var mo = function (c, e1, e2) { var o = {}; o[s] = e1; o[u] = e2; return MM(c, o); };
          var poly = seq([mo(1, p + 1, q), mo(-1, p, q + 1)]), G = tx(mo(1, p, q)), right = G + '(' + s + '-' + u + ')';
          return mc(r, 'When fully factored, ' + t(poly) + ' is written', [
            { html: t(right), right: true },
            { html: t(tx(mo(1, p + 1, q)) + '(1-' + u + ')'), why: 'Expand it: ' + t(tx(mo(1, p + 1, q)) + '(1-' + u + ')=' + seq([mo(1, p + 1, q), mo(-1, p + 1, q + 1)])) + ' — not the original. The GCF uses the <b>lowest</b> power of each letter.' },
            { html: t(tx(mo(1, p - 1, q - 1)) + '(' + seq([mo(1, 2, 1), mo(-1, 1, 2)]) + ')'), why: 'That does expand back to the original, but the bracket still has the common factor ' + t(s + u) + ', so it isn’t <b>fully</b> factored.' },
            { html: t(G + '(' + u + '-' + s + ')'), why: 'Check the signs: ' + t(G + '(' + u + '-' + s + ')') + ' is the opposite of the original polynomial.' }],
            'Lowest power of ' + t(s) + ': ' + t(s + '^{' + p + '}') + '; lowest power of ' + t(u) + ': ' + t(u + '^{' + q + '}') + '. GCF ' + t('=' + G) + '.<br>' + t(poly + '=' + right),
            ['The GCF takes the lowest power of each letter that appears in every term.', '“Fully factored” means the bracket has no common factor left.'], 'fully factor ' + plain(poly));
        } }] },
      { num: '3', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '3', level: 'LIM', make: function (r) {
          var L = r.pick([['u', 'v'], ['a', 'b'], ['p', 'q'], ['m', 'n']]), u = L[0], v = L[1], g = r.int(2, 9), k = r.int(2, 5);
          var mo = function (c, e1, e2) { var o = {}; o[u] = e1; o[v] = e2; return MM(c, o); };
          var poly = seq([mo(g, 1, 2), mo(-g * k, 3, 1), mo(g, 1, 1)]), G = tx(mo(g, 1, 1));
          var inner = seq([M(1, v), M(-k, u, 2), N(1)]);
          var A = [{ html: t(G + '(' + inner + ')'), right: true },
            { html: t(u + v + '(' + seq([M(g, v), M(-g * k, u, 2), N(g)]) + ')'), why: 'This expands back to the original, but every number in the bracket is still divisible by ' + t(g) + ' — the GCF includes ' + t(g) + '.' },
            { html: t(tx(M(g, u)) + '(' + seq([M(1, v, 2), mo(-k, 2, 1), M(1, v)]) + ')'), why: 'This expands back to the original, but every term in the bracket still has a ' + t(v) + ' — the GCF includes ' + t(v) + '.' }];
          var opts = r.shuffle(A).concat([{ html: 'none of these', why: 'One of the choices is fully factored. Find the GCF: ' + t('\\gcd(' + g + ',' + g * k + ',' + g + ')=' + g) + ', and every term has at least one ' + t(u) + ' and one ' + t(v) + '.' }]);
          return mc(r, 'The expression ' + t(poly) + ', when fully factored, is', opts,
            t('\\gcd(' + g + ',' + g * k + ',' + g + ')=' + g) + ' and every term has at least one ' + t(u) + ' and one ' + t(v) + ', so GCF ' + t('=' + G) + '.<br>' + t(poly + '=' + G + '(' + inner + ')') + '<br>The other two brackets still have a common factor, so they aren’t <i>fully</i> factored.',
            ['Find the GCF of all three terms, numbers and letters.', 'For each choice, ask: does the bracket still have a common factor?'], 'fully factor ' + plain(poly), true);
        } }] },
      { num: '4', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '4', level: 'LIM', make: function (r) {
          var v = r.pick(['p', 'x', 'a', 'n', 'y']), z = pick(function () { return { m: r.int(5, 12), n: r.int(2, 6) }; }, function (z) { return z.m - z.n >= 2; });
          var poly = seq([M(1, v, 2), M(z.n - z.m, v), N(-z.m * z.n)]);
          return mc(r, 'One factor of ' + t(poly) + ' is', [
            { html: t(v + '-' + z.m), right: true },
            { html: t(v + '-' + z.n), why: 'The pair is ' + t(-z.m) + ' and ' + t(z.n) + ' (product ' + t(-z.m * z.n) + ', sum ' + t(z.n - z.m) + '). Check the sign that goes with ' + t(z.n) + '.' },
            { html: t(v + '+' + z.m), why: 'Signs swapped: ' + t(z.m + '+(-' + z.n + ')=' + (z.m - z.n)) + ', but the middle coefficient is ' + t(z.n - z.m) + '.' },
            { html: t(v + '-' + z.m * z.n), why: t(z.m * z.n) + ' is the constant term. You need two numbers that <b>multiply</b> to ' + t(-z.m * z.n) + ' and <b>add</b> to ' + t(z.n - z.m) + '.' }],
            'Two integers with product ' + t(-z.m * z.n) + ' and sum ' + t(z.n - z.m) + ': ' + t(-z.m) + ' and ' + t(z.n) + '.<br>' + t(poly + '=(' + v + '-' + z.m + ')(' + v + '+' + z.n + ')') + '<br>Of the choices only ' + t(v + '-' + z.m) + ' appears.',
            ['Find two integers that multiply to the constant term and add to the middle coefficient.'], 'factor of ' + plain(poly));
        } }] },
      { num: '5', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '5', level: 'EMG', make: function (r) {
          var z = pick(function () { return { g: r.int(4, 20), b: r.int(2, 7), c: r.int(2, 7) }; }, function (z) { return gcd(z.b, z.c) === 1 && z.b !== z.c && z.g - z.b + z.c > 0; });
          var ans = z.g - z.b + z.c, poly = seq([M(z.g * z.b, 'x'), M(-z.g * z.c, 'x', 2)]);
          return nr('When the greatest common factor is removed from the binomial ' + t(poly) + ', the binomial can be written in the form ' + t('ax(b+cx)') + '. The value of ' + t('a-b-c') + ' is ________.', ans, function (v) {
            if (v === z.g - z.b - z.c) return { code: 'nr-sign', hint: t('c') + ' is negative here: ' + t('c=' + (-z.c)) + ', so ' + t('-c=+' + z.c) + '.' };
            if (v === -ans) return { code: 'neg-gcf', hint: 'Take out the <b>positive</b> GCF, so ' + t('a') + ' is positive.' };
            if (z.g % 2 === 0 && v === z.g / 2 - 2 * z.b + 2 * z.c) return { code: 'gcf-small', hint: t(z.g / 2 + 'x') + ' is a common factor, but not the <b>greatest</b> one.' };
            if (v === z.g + z.b - z.c || v === z.g + z.b + z.c) return { code: 'nr-sign', hint: 'Check the signs: you want ' + t('a-b-c') + ' with ' + t('c') + ' negative.' };
            return null;
          }, t('\\gcd(' + z.g * z.b + ',' + z.g * z.c + ')=' + z.g) + ' and both terms contain ' + t('x') + ', so GCF ' + t('=' + z.g + 'x') + '.<br>' + t(poly + '=' + z.g + 'x(' + z.b + '-' + z.c + 'x)') + '<br>So ' + t('a=' + z.g + ',\\ b=' + z.b + ',\\ c=' + (-z.c)) + ' and ' + t('a-b-c=' + z.g + '-' + z.b + '-(' + (-z.c) + ')=' + ans) + '.',
          ['Take out the GCF (number and ' + t('x') + '), then match the bracket to ' + t('b+cx') + '.', 'Keep the sign with ' + t('c') + ': it is negative.'], 'a−b−c for ' + plain(poly));
        } }] },
      { num: '6', stem: 'Factor completely.', parts: [
        { id: '6a', level: 'BEG', make: function (r) {
          var g = r.int(2, 9), k = r.int(2, 5), cd = MM(g, { c: 1, d: 1 });
          var poly = seq([MM(g, { c: 1, d: 2 }), MM(-g * k, { c: 3, d: 1 }), MM(g, { c: 1, d: 1 })]);
          var Ft = FT(cd, [[M(1, 'd'), M(-k, 'c', 2), N(1)]]);
          return fac(t(poly), Ft, [{ is: [cd, P.add(M(1, 'd'), M(-k, 'c', 2))], code: 'gcf-one', hint: 'The last term ' + t(tx(cd)) + ' divided by the GCF ' + t(tx(cd)) + ' is ' + t('1') + ' — keep the ' + t('+1') + ' in the bracket.' }],
            'Every coefficient is divisible by ' + t(g) + ', and every term has at least one ' + t('c') + ' and one ' + t('d') + ', so GCF ' + t('=' + tx(cd)) + '.<br>' + t(poly + '=' + Ft.tex) + '<br>The bracket has no common factor and doesn’t factor again.',
            ['Find the GCF: the greatest common factor of the numbers and the lowest power of each letter.', 'Divide every term by the GCF. Check by expanding.'], 'factor ' + plain(poly));
        } },
        { id: '6b', level: 'BEG', make: function (r) {
          var z = pick(function () { return { m: r.int(6, 12), n: r.int(2, 8) }; }, function (z) { return z.m - z.n >= 2; });
          var poly = seq([M(1, 'k', 2), M(z.n - z.m, 'k'), N(-z.m * z.n)]), Ft = FT(null, [lin(1, 'k', -z.m), lin(1, 'k', z.n)]);
          return fac(t(poly), Ft, [{ is: FT(null, [lin(1, 'k', z.m), lin(1, 'k', -z.n)]), code: 'sign-swap', hint: 'Your pair multiplies to ' + t(-z.m * z.n) + ' but adds to ' + t(z.m - z.n) + ', not ' + t(z.n - z.m) + '. Swap the signs.' }],
            'Product ' + t(-z.m * z.n) + ', sum ' + t(z.n - z.m) + ': ' + t(-z.m) + ' and ' + t(z.n) + '.<br>' + t(poly + '=' + Ft.tex) + '<br>Check: ' + t(seq([M(1, 'k', 2), M(z.n, 'k'), M(-z.m, 'k'), N(-z.m * z.n)]) + '=' + poly) + ' ✓',
            ['Find two integers that multiply to ' + t(-z.m * z.n) + ' and add to ' + t(z.n - z.m) + '.', 'The larger number gets the sign of the middle term.'], 'factor ' + plain(poly));
        } },
        { id: '6c', level: 'BEG', make: function (r) {
          var z = pick(function () { return { a: r.int(2, 9), b: r.int(2, 11) }; }, function (z) { return gcd(z.a, z.b) === 1; });
          var poly = seq([M(z.a * z.a, 'm', 2), N(-z.b * z.b)]), Ft = FT(null, [lin(z.a, 'm', -z.b), lin(z.a, 'm', z.b)]);
          return fac(t(poly), Ft, [{ is: FT(null, [{ terms: lin(z.a, 'm', -z.b), k: 2 }]), code: 'dos-square', hint: t('(' + seq(lin(z.a, 'm', -z.b)) + ')^{2}') + ' has a middle term. A difference of squares factors into one ' + t('-') + ' bracket and one ' + t('+') + ' bracket.' },
            { is: FT(null, [{ terms: lin(z.a, 'm', z.b), k: 2 }]), code: 'dos-square', hint: 'A difference of squares factors into one ' + t('-') + ' bracket and one ' + t('+') + ' bracket.' }],
            t(poly + '=(' + z.a + 'm)^{2}-' + z.b + '^{2}') + ', a difference of squares.<br>' + t(poly + '=' + Ft.tex),
            ['Both terms are perfect squares and they are subtracted: ' + t('A^{2}-B^{2}=(A-B)(A+B)') + '.'], 'factor ' + plain(poly));
        } }] },

      /* ================= PROGRESSING ================= */
      { num: '7', section: 'Progressing (PRG) — ax²+bx+c, models, factoring completely', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '7', level: 'EMG', make: function (r) {
          var z = pick(function () { return { p: r.int(4, 9), q: r.int(2, 5) }; }, function (z) { return z.p > z.q && z.p * z.q <= 32 && z.p - z.q <= 6; });
          var p = z.p, q = z.q, d = p - q, ex = seq([N(p * q), M(-d, 'x'), M(-1, 'x', 2)]);
          return mc(r, 'The algebra tiles below represent an expression (shaded tiles are positive; white tiles with a minus sign are negative). The factored form of the expression is' + pile(-1, -d, p * q), [
            { html: t('(' + q + '-x)(' + p + '+x)'), right: true },
            { html: t('(' + q + '-x)(' + p + '-x)'), why: 'Expand it: ' + t('(' + q + '-x)(' + p + '-x)=' + seq([N(p * q), M(-(p + q), 'x'), M(1, 'x', 2)])) + '. Count the tiles: there is one <b>negative</b> ' + t('x^{2}') + '-tile.' },
            { html: t('(' + p + '-x)(' + q + '+x)'), why: 'Expand it: ' + t('(' + p + '-x)(' + q + '+x)=' + seq([N(p * q), M(d, 'x'), M(-1, 'x', 2)])) + ' — the ' + t('x') + '-term should be ' + t(tx(M(-d, 'x'))) + ' (the ' + t('x') + '-tiles are negative).' },
            { html: t(ex), why: 'That is the expression the tiles show, but it is in <b>expanded</b> form, not factored form.' }],
            'Tiles: one negative ' + t('x^{2}') + ', ' + t(d) + ' negative ' + t('x') + '-tiles and ' + t(p * q) + ' positive units: ' + t(seq([M(-1, 'x', 2), M(-d, 'x'), N(p * q)])) + '.<br>Take out ' + t('-1') + ': ' + t('-(x^{2}+' + lc(d) + 'x-' + p * q + ')=-(x+' + p + ')(x-' + q + ')=(' + q + '-x)(' + p + '+x)') + '.<br>Check: ' + t('(' + q + '-x)(' + p + '+x)=' + seq([N(p * q), M(q, 'x'), M(-p, 'x'), M(-1, 'x', 2)]) + '=' + ex) + ' ✓',
            ['Write the expression from the tiles first (white tiles are negative).', 'Expand each choice and compare.'], 'tiles −x²−' + d + 'x+' + p * q);
        } }] },
      { num: '8', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '8', level: 'EMG', make: function (r) {
          var a = r.int(2, 7), m = pick(function () { return r.int(1, 8); }, function (m) { return m !== a; });
          var z = pick(function () { return { p: r.int(2, 9), q: r.pick([a - 1, a + 1, a + 2]) }; }, function (z) { return z.q >= 1 && z.q !== a && z.p !== z.q && z.p !== a && z.q - z.p !== 0; });
          var n = 'n', A = seq([M(1, n, 2), M(a, n)]), B = seq([M(1, n, 3), M(-a * a, n)]), C = seq([M(1, n, 2), M(a - m, n), N(-a * m)]), D = seq([M(1, n, 2), M(z.q - z.p, n), N(-z.p * z.q)]);
          var fa = 'n+' + a;
          return mc(r, 'For which of the following polynomials is ' + t(fa) + ' <b>not</b> a factor?', [
            { html: t(A), why: t(A + '=n(' + fa + ')') + ', so ' + t(fa) + ' <i>is</i> a factor.' },
            { html: t(B), why: t(B + '=n(n^{2}-' + a * a + ')=n(n-' + a + ')(' + fa + ')') + ', so ' + t(fa) + ' <i>is</i> a factor.' },
            { html: t(C), why: t(C + '=(' + fa + ')(n-' + m + ')') + ', so ' + t(fa) + ' <i>is</i> a factor.' },
            { html: t(D), right: true }],
            'Factor each one:<br>' + t(A + '=n(' + fa + ')') + '<br>' + t(B + '=n(n-' + a + ')(' + fa + ')') + '<br>' + t(C + '=(' + fa + ')(n-' + m + ')') + '<br>' + t(D + '=(n-' + z.p + ')(n+' + z.q + ')') + ' — no ' + t(fa) + '.',
            ['Factor each polynomial completely and look for ' + t('(' + fa + ')') + '.', 'Quick test: ' + t(fa) + ' is a factor exactly when substituting ' + t('n=-' + a) + ' gives ' + t('0') + '.'], 'n+' + a + ' not a factor');
        } }] },
      { num: '9', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '9', level: 'EMG', make: function (r) {
          var g = r.pick([2, 3, 5, 6, 7]), k = r.pick([2, 3, 4]), poly = seq([M(g, 'a', 2), M(-g * k * k, 'a', 4)]);
          return mc(r, 'One factor of ' + t(poly) + ' is', [
            { html: t('1-' + k + 'a'), right: true },
            { html: t(tx(M(g * k * k, 'a', 4))), why: 'That is a <b>term</b> of the polynomial, not a factor of it. Take out the GCF first.' },
            { html: t('1-' + k * k + 'a'), why: 'After the GCF you have ' + t('1-' + k * k + 'a^{2}') + ', a difference of squares: ' + t(k * k + 'a^{2}=(' + k + 'a)^{2}') + '.' },
            { html: t('1-a'), why: 'Check by expanding the factored form: ' + t(tx(M(g, 'a', 2)) + '(1-' + k + 'a)(1+' + k + 'a)') + '. Is ' + t('1-a') + ' in it?' }],
            'GCF ' + t('=' + tx(M(g, 'a', 2))) + ': ' + t(poly + '=' + tx(M(g, 'a', 2)) + '(1-' + k * k + 'a^{2})') + ', and ' + t('1-' + k * k + 'a^{2}') + ' is a difference of squares:<br>' + t(poly + '=' + tx(M(g, 'a', 2)) + '(1-' + k + 'a)(1+' + k + 'a)'),
            ['Take out the GCF, then check whether the bracket is a difference of squares.'], 'one factor of ' + plain(poly));
        } }] },
      { num: '10', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '10', level: 'EMG', make: function (r) {
          var z = pick(function () { var s = r.pick([1, 2, 3]), u = r.pick([1, 2, 3]); if (r.chance(0.5)) s = -s; else u = -u; return { m: r.int(2, 5), n: r.int(2, 5), s: s, u: u }; },
            function (z) { var b = z.m * z.u + z.n * z.s; return z.m !== z.n && gcd(z.m, z.s) === 1 && gcd(z.n, z.u) === 1 && b !== 0 && Math.abs(b) <= 7; });
          var A = lin(z.m, 'y', z.s), B = lin(z.n, 'y', z.u), T = P.mul(sum(A), sum(B)), poly = tx(T), useB = r.chance(0.5);
          var R = useB ? B : A, O = useB ? A : B, Rs = useB ? z.u : z.s, Os = useB ? z.s : z.u, Rm = useB ? z.n : z.m, Om = useB ? z.m : z.n;
          return mc(r, 'Which of the following is a factor of ' + t(poly) + '?', [
            { html: t(seq(R)), right: true },
            { html: t(seq(lin(Rm, 'y', -Rs))), why: 'Expand with the other factor: the signs are in the wrong brackets. The two constants must multiply to ' + t(z.s * z.u) + ' and the outside + inside products must add to ' + t(tx(M(z.m * z.u + z.n * z.s, 'y'))) + '.' },
            { html: t(seq(lin(Om, 'y', -Os))), why: 'Close — ' + t(Om + 'y') + ' is right, but check the sign of the constant: expand your two factors and compare the middle term.' },
            { html: t(seq(lin(z.m * z.n, 'y', z.s * z.u))), why: 'The factors aren’t found by keeping the first and last terms together. Decompose: ' + t('ac=' + z.m * z.n * z.s * z.u) + '.' }],
            t('ac=' + pv(z.m * z.n) + '\\cdot ' + pv(z.s * z.u) + '=' + z.m * z.n * z.s * z.u) + '; the pair with that product and sum ' + t(z.m * z.u + z.n * z.s) + ' is ' + t(z.m * z.u) + ' and ' + t(z.n * z.s) + '.<br>' + t(poly + '=' + br(A) + br(B)) + '<br>Check: ' + t(br(A) + br(B) + '=' + seq([M(z.m * z.n, 'y', 2), M(z.m * z.u, 'y'), M(z.n * z.s, 'y'), N(z.s * z.u)]) + '=' + poly) + ' ✓',
            ['Decompose: find two numbers that multiply to ' + t('ac') + ' and add to ' + t('b') + '.', 'Or expand each choice with a partner and see which one rebuilds the trinomial.'], 'factor of ' + plain(poly));
        } }] },
      { num: '11', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '11', level: 'EMG', make: function (r) {
          var z = pick(function () { var s = r.int(1, 4), u = r.int(1, 3); if (r.chance(0.5)) s = -s; else u = -u; return { a: r.pick([2, 3, 5, 7]), s: s, u: u }; },
            function (z) { return gcd(z.a, z.u) === 1 && z.a * z.s + z.u !== 0; });
          var X = lin(1, 't', z.s), Y = lin(z.a, 't', z.u), Xn = lin(1, 't', -z.s), Yn = lin(z.a, 't', -z.u), T = P.mul(sum(X), sum(Y)), poly = tx(T);
          var pr = function (a, b) { return t(seq(a)) + ' and ' + t(seq(b)); };
          return mc(r, 'Which two binomials are <b>both</b> factors of ' + t(poly) + '?', [
            { html: pr(Yn, Xn), why: 'Expand: ' + t(br(Yn) + br(Xn) + '=' + tx(P.mul(sum(Yn), sum(Xn)))) + ' — the middle term has the wrong sign.' },
            { html: pr(Yn, X), why: 'Expand: the constants multiply to ' + t(-z.s * z.u) + ', but the constant term is ' + t(z.s * z.u) + '.' },
            { html: pr(X, Y), right: true },
            { html: pr(Xn, Y), why: 'Expand: the constants multiply to ' + t(-z.s * z.u) + ', but the constant term is ' + t(z.s * z.u) + '.' }],
            t('ac=' + z.a * z.s * z.u) + '; the pair with sum ' + t(z.a * z.s + z.u) + ' is ' + t(z.a * z.s) + ' and ' + t(z.u) + '.<br>' + t(poly + '=' + br(X) + br(Y)),
            ['Expand each pair and compare with the trinomial — the middle term and the constant both have to match.'], 'both factors of ' + plain(poly), true);
        } }] },
      { num: '12', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '12', level: 'PRG', make: function (r) {
          var z = pick(function () { return { a: r.int(2, 5), p: r.int(2, 8), q: r.int(1, 7) }; }, function (z) { return gcd(z.a, z.q) === 1 && z.p * z.q <= 99 && z.q !== z.p; });
          var c = z.p * z.q, expr = seq([M(z.a, 'x', 2), M(-z.a * z.p, 'x'), M(-z.q, 'x')]) + '+c';
          return nr('The expression ' + t(expr) + ' can be factored by grouping into the product of two binomials. If one of these binomials is ' + t('x-' + z.p) + ', then the value of ' + t('c') + ' is ________.', c, function (v) {
            if (v === -c) return { code: 'nr-sign', hint: 'Check the sign: ' + t('-' + lc(z.q) + '(x-' + z.p + ')=-' + lc(z.q) + 'x+' + c) + '.' };
            if (v === z.q || v === z.p) return { code: 'times-c', hint: 'The second group ' + t('-' + lc(z.q) + 'x+c') + ' must equal ' + t('-' + lc(z.q) + '(x-' + z.p + ')') + '. Expand that.' };
            if (v === z.p + z.q) return { code: 'times-c', hint: 'Multiply, don’t add: ' + t('-' + z.q + '\\times(-' + z.p + ')') + '.' };
            if (v === z.a * z.p * z.q) return { code: 'times-c', hint: 'Only the second group needs to make ' + t('(x-' + z.p + ')') + ': ' + t('-' + lc(z.q) + 'x+c=-' + lc(z.q) + '(x-' + z.p + ')') + '.' };
            return null;
          }, t('(' + seq([M(z.a, 'x', 2), M(-z.a * z.p, 'x')]) + ')+(-' + lc(z.q) + 'x+c)=' + z.a + 'x(x-' + z.p + ')+(-' + lc(z.q) + 'x+c)') + '.<br>For ' + t('x-' + z.p) + ' to be the common binomial, ' + t('-' + lc(z.q) + 'x+c=-' + lc(z.q) + '(x-' + z.p + ')') + ', so ' + t('c=' + c) + '.<br>Check: ' + t(z.a + 'x(x-' + z.p + ')-' + lc(z.q) + '(x-' + z.p + ')=(x-' + z.p + ')(' + z.a + 'x-' + z.q + ')') + ' ✓',
          ['Group the first two terms and take out their GCF. What must the last two terms look like?', 'The second group must be a multiple of ' + t('(x-' + z.p + ')') + '.'], 'grouping c with x−' + z.p);
        } }] },
      { num: '13', stem: 'Factor completely.', parts: [
        { id: '13a', level: 'PRG', make: function (r) {
          var z = pick(function () { return { g: r.int(2, 6), m: r.pick([2, 3, 5]), s: r.int(1, 3), u: r.int(1, 3) }; }, function (z) { return gcd(z.m, z.s) === 1 && z.s !== z.m * z.u; });
          var G = M(z.g, 'x', 2), Ft = FT(G, [lin(z.m, 'x', -z.s), lin(1, 'x', -z.u)]), poly = tx(Ft.poly), inner = seq([M(z.m, 'x', 2), M(-(z.m * z.u + z.s), 'x'), N(z.s * z.u)]);
          return fac(t(poly), Ft, [{ is: [M(z.g, 'x'), sum(lin(z.m, 'x', -z.s)), sum(lin(1, 'x', -z.u))], code: 'gcf-power', hint: 'Check the power of ' + t('x') + ' in your common factor: every term has at least ' + t('x^{2}') + '.' }],
            'GCF ' + t('=' + tx(G)) + ': ' + t(poly + '=' + tx(G) + '(' + inner + ')') + '.<br>' + t('ac=' + z.m * z.s * z.u) + '; pair ' + t(-z.m * z.u) + ', ' + t(-z.s) + ': ' + t(inner + '=' + br(lin(z.m, 'x', -z.s)) + br(lin(1, 'x', -z.u))) + '.<br>' + t(poly + '=' + Ft.tex),
            ['Take out the GCF first (number and power of ' + t('x') + ').', 'Then factor the trinomial in the bracket and check that nothing factors again.'], 'factor ' + plain(poly));
        } },
        { id: '13b', level: 'PRG', make: function (r) {
          var z = pick(function () { var s = r.int(1, 5), u = r.int(1, 5); if (r.chance(0.5)) s = -s; else u = -u; return { m: r.int(2, 5), n: r.int(2, 5), s: s, u: u }; },
            function (z) { var b = z.m * z.u + z.n * z.s; return z.m !== z.n && gcd(z.m, z.s) === 1 && gcd(z.n, z.u) === 1 && b !== 0 && Math.abs(b) <= 7 && Math.abs(z.s) !== Math.abs(z.u); });
          var A = lin(z.m, 'x', z.s), B = lin(z.n, 'x', z.u), Ft = FT(null, [A, B]), poly = tx(Ft.poly), ac = z.m * z.n * z.s * z.u;
          return fac(t(poly), Ft, [{ is: FT(null, [lin(z.m, 'x', z.u), lin(z.n, 'x', z.s)]), code: 'swap-const', hint: 'The first and last terms are right, but the constants are in the wrong brackets — check the outside and inside products.' },
            { is: FT(null, [lin(z.m, 'x', -z.s), lin(z.n, 'x', -z.u)]), code: 'sign-swap', hint: 'Your factors give the middle term with the wrong sign. Swap the signs in the brackets.' }],
            t('ac=' + z.m * z.n + '(' + z.s * z.u + ')=' + ac) + '; pair with product ' + t(ac) + ' and sum ' + t(z.m * z.u + z.n * z.s) + ': ' + t(z.m * z.u) + ' and ' + t(z.n * z.s) + '.<br>' + t(poly + '=' + seq([M(z.m * z.n, 'x', 2), M(z.m * z.u, 'x'), M(z.n * z.s, 'x'), N(z.s * z.u)])) + '<br>' + t('=' + z.m + 'x' + br(B) + sg(z.s) + br(B) + '=' + Ft.tex) + '<br>Check: ' + t(Ft.tex + '=' + seq([M(z.m * z.n, 'x', 2), M(z.m * z.u, 'x'), M(z.n * z.s, 'x'), N(z.s * z.u)]) + '=' + poly) + ' ✓',
            ['Decompose: find two numbers that multiply to ' + t('ac=' + ac) + ' and add to ' + t(z.m * z.u + z.n * z.s) + '.', 'Split the middle term with that pair, then group.'], 'factor ' + plain(poly));
        } },
        { id: '13c', level: 'PRG', make: function (r) {
          var z = pick(function () { return { g: r.int(2, 5), p: r.int(3, 8), q: r.int(1, 5) }; }, function (z) { return z.p - z.q >= 2; });
          var Ft = FT(N(-z.g), [lin(1, 'x', -z.p), lin(1, 'x', z.q)]), poly = tx(Ft.poly), d = z.p - z.q;
          return fac(t(poly), Ft, [{ is: FT(N(-z.g), [lin(1, 'x', z.p), lin(1, 'x', -z.q)]), code: 'sign-swap', hint: 'Your bracket pair adds to ' + t(d) + ', but it should add to ' + t(-d) + ' (after taking out ' + t(-z.g) + ', the bracket is ' + t('x^{2}-' + d + 'x-' + z.p * z.q) + ').' }],
            'Negative leading coefficient: take out ' + t(-z.g) + '.<br>' + t(poly + '=-' + z.g + '(x^{2}-' + d + 'x-' + z.p * z.q + ')') + '; pair ' + t(-z.p) + ', ' + t(z.q) + '.<br>' + t(poly + '=' + Ft.tex),
            ['The leading coefficient is negative: take out ' + t(-z.g) + ' — every sign in the bracket changes.', 'Then factor the trinomial in the bracket.'], 'factor ' + plain(poly));
        } }] },
      { num: '14', stem: function (sh) { return 'The algebra tiles below have been arranged into a rectangle.' + tileRect(sh.p, sh.q); },
        shared: function (r) { return pick(function () { return { p: r.int(1, 6), q: r.int(1, 6) }; }, function (z) { return z.p !== z.q && z.p * z.q <= 30; }); },
        parts: [
          { id: '14a', level: 'BEG', make: function (r, sh) {
            var A = sum(lin(1, 'x', sh.p)), B = sum(lin(1, 'x', sh.q));
            return dimsPart('What binomial multiplication does the rectangle represent? Give its two dimensions.', A, B,
              'Across the top: one ' + t('x') + ' and ' + t(sh.p) + ' unit' + (sh.p > 1 ? 's' : '') + ', ' + t('x+' + sh.p) + '. Down the side: one ' + t('x') + ' and ' + t(sh.q) + ' unit' + (sh.q > 1 ? 's' : '') + ', ' + t('x+' + sh.q) + '. The rectangle shows ' + t('(x+' + sh.p + ')(x+' + sh.q + ')') + '.',
              ['Read along the top edge: how many ' + t('x') + '-lengths and how many units?', 'Then do the same down the left side.'], 'tile rectangle dimensions', function (a, b) {
                var bad = sum(lin(1, 'x', sh.p * sh.q)); if (P.eq(a, bad) || P.eq(b, bad)) return { code: 'value', hint: 'Count the unit-tile lengths along <b>one edge</b> only, not all the unit tiles.' }; return null; });
          } },
          { id: '14b', level: 'EMG', make: function (r, sh) {
            var Ft = FT(null, [lin(1, 'x', sh.p), lin(1, 'x', sh.q)]), T = Ft.poly, e = tx(T);
            var c1 = K.poly(T, { wrong: cleanW(T, [{ is: P.add(M(1, 'x', 2), M(sh.p * sh.q, 'x'), N(sh.p + sh.q)), code: 'value', hint: 'Count again: the ' + t('x') + '-tiles give the middle term and the unit tiles give the constant.' }]) });
            var p = KP.fields('Write the polynomial the tiles represent in expanded form, and its factored form.', [polyBox('Expanded form:', ['x']), polyBox('Factored form:', ['x'])], [c1, K.factored(Ft.list, {})],
              [e, Ft.tex], t(e + '=' + Ft.tex),
              t('1') + ' ' + t('x^{2}') + '-tile, ' + t(sh.p + '+' + sh.q + '=' + (sh.p + sh.q)) + ' ' + t('x') + '-tiles and ' + t(sh.p * sh.q) + ' unit tiles: ' + t(e + '=' + Ft.tex) + '.<br>Check: ' + t(seq([M(1, 'x', 2), M(sh.q, 'x'), M(sh.p, 'x'), N(sh.p * sh.q)]) + '=' + e) + ' ✓',
              ['Count each kind of tile for the expanded form.', 'The factored form is (length)(width).'], 'tile rectangle polynomial');
            p.bad = [[Ft.tex, e], [e, '(x+' + (sh.p + 1) + ')(x+' + sh.q + ')']];
            return p;
          } }] },

      /* ================= MASTERY ================= */
      { num: '15', section: 'Mastery (MAS) — reasoning, unknown coefficients, errors, several steps', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '15', level: 'PRG', make: function (r) {
          var c = r.pick([24, 24, 30, 36, 40, 42, 48, 18, 20, 28]), S = sumsOf(c), mx = Math.max.apply(null, S);
          var cand = []; for (var k = 2; k < mx; k++) if (S.indexOf(k) < 0) cand.push(k);
          var bad = r.pick(cand) * (r.chance(0.5) ? 1 : -1), goods = r.sample(S, 3).map(function (s) { return r.chance(0.5) ? s : -s; });
          var pairFor = function (v) { var s = Math.abs(v), pq = pairsOf(c).filter(function (q) { return q[0] + q[1] === s; })[0], sgn = v < 0 ? '-' : '+'; return t('(x' + sgn + pq[0] + ')(x' + sgn + pq[1] + ')'); };
          var opts = goods.map(function (v) { return { html: t(v), why: t('p=' + v) + ' works: ' + t('x^{2}' + sg(v) + 'x+' + c) + '=' + pairFor(v) + '.' }; }).concat([{ html: t(bad), right: true }]);
          return mc(r, 'The expression ' + t('x^{2}+px+' + c) + ' <b>cannot</b> be factored over the integers if ' + t('p') + ' has the value', opts,
            t('p') + ' must be the sum of a factor pair of ' + t(c) + ' (both the same sign): ' + pairsOf(c).map(function (q) { return t(q[0] + '+' + q[1] + '=' + (q[0] + q[1])); }).join(', ') + ', or their negatives.<br>' + t(bad) + ' is not on the list.',
            ['List the factor pairs of ' + t(c) + ' and their sums. Negative sums work too (both numbers negative).'], 'x²+px+' + c + ' cannot factor');
        } }] },
      { num: '16', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '16', level: 'ADV', make: function (r) {
          var c = r.pick([35, 55, 65, 77, 85, 91, 95, 39, 51, 57, 33, 45, 63, 75, 99]), S = sumsOf(c), mn = Math.min.apply(null, S);
          return nr('The largest value of ' + t('w') + ' for which ' + t('x^{2}-wx+' + c) + ' can be factored over the integers is ________.', c + 1, function (v) {
            if (v === mn && mn !== c + 1) return { code: 'smallest-sum', hint: t(v) + ' works, but it isn’t the <b>largest</b>. Which factor pair of ' + t(c) + ' has the biggest sum?' };
            if (v === c) return { code: 'forgot-1', hint: 'Use the pair ' + t('1\\times ' + c) + ': its sum is ' + t('1+' + c) + '.' };
            if (S.indexOf(v) >= 0) return { code: 'smallest-sum', hint: t(v) + ' works, but there is a larger value.' };
            return null;
          }, 'Need ' + t('(x-m)(x-n)') + ' with ' + t('mn=' + c) + ' and ' + t('w=m+n') + '. Sums: ' + pairsOf(c).map(function (q) { return t(q[0] + '+' + q[1] + '=' + (q[0] + q[1])); }).join(', ') + '.<br>Largest ' + t('w=' + (c + 1)) + ': ' + t('x^{2}-' + (c + 1) + 'x+' + c + '=(x-1)(x-' + c + ')') + '.',
          ['The two integers multiply to ' + t(c) + ' and add to ' + t('w') + '.', 'Try every factor pair of ' + t(c) + '.'], 'largest w for x²−wx+' + c);
        } }] },
      { num: '17', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '17', level: 'ADV', make: function (r) {
          var z = pick(function () { return { a: r.int(2, 9), b: r.int(1, 9) }; }, function (z) { return gcd(z.a, z.b) === 1 && z.a !== z.b; });
          var k = 2 * z.a * z.b;
          return nr('If ' + t(z.a * z.a + 'x^{2}-kx+' + z.b * z.b) + ' is a perfect square trinomial and ' + t('k>0') + ', then the value of ' + t('k') + ' is ________.', k, function (v) {
            if (v === z.a * z.b) return { code: 'not-doubled', hint: 'The middle term of ' + t('(A-B)^{2}') + ' is ' + t('2AB') + ' — don’t forget the ' + t('2') + '.' };
            if (v === z.a * z.a + z.b * z.b || v === (z.a + z.b) * (z.a + z.b)) return { code: 'value', hint: 'Find ' + t('A') + ' and ' + t('B') + ' (the square roots of the first and last terms); the middle term is ' + t('2AB') + '.' };
            if (v === 2 * z.a * z.a * z.b * z.b) return { code: 'value', hint: 'Use the square roots: ' + t('\\sqrt{' + z.a * z.a + 'x^{2}}=' + z.a + 'x') + ' and ' + t('\\sqrt{' + z.b * z.b + '}=' + z.b) + '.' };
            return null;
          }, t(z.a * z.a + 'x^{2}=(' + z.a + 'x)^{2}') + ' and ' + t(z.b * z.b + '=' + z.b + '^{2}') + '; the middle term must be ' + t('-2(' + z.a + 'x)(' + z.b + ')=-' + k + 'x') + ', so ' + t('k=' + k) + ' and ' + t(z.a * z.a + 'x^{2}-' + k + 'x+' + z.b * z.b + '=(' + z.a + 'x-' + z.b + ')^{2}') + '.',
          ['A perfect square trinomial is ' + t('A^{2}-2AB+B^{2}=(A-B)^{2}') + '.', 'Find ' + t('A') + ' and ' + t('B') + ' from the first and last terms.'], 'k for perfect square ' + z.a * z.a + 'x²−kx+' + z.b * z.b);
        } }] },
      { num: '18', stem: 'Factor completely.', parts: [
        { id: '18', level: 'ADV', make: function (r) {
          var z = r.pick([[3, 2], [3, 1], [2, 1], [2, 3], [3, 5], [2, 5]]), p = z[0], q = z[1];
          var A = lin(p, 'a', -q), B = lin(p, 'a', q), C = [M(p * p, 'a', 2), N(q * q)], Ft = FT(null, [A, B, C]), poly = tx(Ft.poly);
          return fac(t(poly), Ft, [
            { is: FT(null, [{ terms: [M(p * p, 'a', 2), N(-q * q)], k: 2 }]), code: 'dos-square', hint: t('(' + seq([M(p * p, 'a', 2), N(-q * q)]) + ')^{2}') + ' has a middle term. A difference of squares is ' + t('(A-B)(A+B)') + '.' },
            { is: FT(null, [A, { terms: B, k: 3 }]), code: 'sum-split', hint: t(seq(C)) + ' is a <b>sum</b> of squares — it doesn’t factor. (' + t('(' + seq(B) + ')^{2}') + ' has a middle term.)' },
            { is: FT(null, [A, B, A, B]), code: 'sum-split', hint: t(seq(C)) + ' is a <b>sum</b> of squares — it doesn’t factor into ' + t(br(A) + br(B)) + '.' }],
            t(poly + '=(' + tx(M(p * p, 'a', 2)) + ')^{2}-' + q * q + '^{2}=' + br([M(p * p, 'a', 2), N(-q * q)]) + br(C)) + '.<br>Not finished: ' + t(seq([M(p * p, 'a', 2), N(-q * q)]) + '=(' + tx(M(p, 'a')) + ')^{2}-' + q + '^{2}') + ' is a difference of squares again; ' + t(seq(C)) + ' is a sum of squares and does not factor.<br>' + t(poly + '=' + Ft.tex),
            ['Write it as ' + t('A^{2}-B^{2}') + ' first.', 'Check each bracket: can it be factored again?'], 'factor ' + plain(poly));
        } }] },
      { num: '19', stem: function (sh) { return 'Rectangle ' + t('ABCD') + ' has been subdivided into four regions, as shown. The areas of two of the regions are ' + t('b^{2}') + ' and ' + t(sh.w * sh.h) + ', and the combined area of the other two regions is ' + t(tx(M(sh.w + sh.h, 'b'))) + '. The region with area ' + t('b^{2}') + ' is a square.' + abcd(sh.w * sh.h); },
        shared: function (r) { var z = r.chance(0.35) ? { w: 9, h: 9 } : pick(function () { return { w: r.int(2, 12), h: r.int(2, 12) }; }, function (z) { return z.w <= z.h && z.w * z.h <= 120 && !(z.w === 1); }); return z; },
        parts: [
          { id: '19', level: 'MAS', make: function (r, sh) {
            var S = sh.w + sh.h, T = P.add(M(4, 'b'), N(2 * S));
            return polyPart('Determine the perimeter of rectangle ' + t('ABCD') + ', in terms of ' + t('b') + '.', T, [
              { is: P.add(M(2, 'b'), N(S)), code: 'half-perim', hint: 'That is half the perimeter (one length plus one width). The perimeter goes all the way around.' },
              { is: P.add(M(4, 'b'), N(S)), code: 'perim-s', hint: 'The two unknown widths appear twice each around the rectangle: ' + t('2(w+h)') + '.' },
              { is: P.add(M(2, 'b'), N(2 * S)), code: 'perim-s', hint: 'The side ' + t('b') + ' appears four times around the rectangle (twice on a length, twice on a width).' },
              { is: P.add(M(1, 'b', 2), M(S, 'b'), N(sh.w * sh.h)), code: 'area-not-perim', hint: 'That is the area of the whole rectangle. The question asks for the perimeter.' }],
              'The top-left region is a square of area ' + t('b^{2}') + ', so the top row has height ' + t('b') + ' and the left column has width ' + t('b') + '. Let the right column have width ' + t('w') + ' and the bottom row height ' + t('h') + '; then ' + t('hw=' + sh.w * sh.h) + '.<br>The other two regions have areas ' + t('bw') + ' and ' + t('bh') + ', so ' + t('b(w+h)=' + S + 'b') + ' and ' + t('w+h=' + S) + '.<br>' + t('P=2[(b+w)+(b+h)]=4b+2(w+h)=4b+' + 2 * S) + (sh.w === sh.h ? '<br>(Here ' + t('w=h=' + sh.w) + ', so ' + t('ABCD') + ' is the square ' + t('(b+' + sh.w + ')^{2}=b^{2}+' + 2 * sh.w + 'b+' + sh.w * sh.w) + '.)' : '<br>(Here ' + t('w') + ' and ' + t('h') + ' are ' + t(sh.w) + ' and ' + t(sh.h) + ': ' + t('b^{2}+' + S + 'b+' + sh.w * sh.h + '=(b+' + sh.w + ')(b+' + sh.h + ')') + '.)'),
              ['Call the unknown width of the right column ' + t('w') + ' and the height of the bottom row ' + t('h') + '. Write each region’s area.', 'What does ' + t(S + 'b') + ' tell you about ' + t('w+h') + '?'], 'perimeter ABCD (' + sh.w + ',' + sh.h + ')', { vars: ['b'] });
          } }] },
      { num: '20', stem: 'Identify and explain the error in each factorization. Then write the correct factored form.',
        shared: function (r) { return { a: gen20a(r), q: r.pick([2, 3, 4, 5]) }; }, // (a i)/(a ii) and (b i)/(b ii) use the same factorization
        parts: [
        { id: '20a1', sub: 'a i', level: 'EMG', make: function (r, sh) {
          var z = sh.a, stu = br(lin(z.m, 'x', z.s)) + br(lin(z.n, 'x', -z.u));
          return mc(r, t(z.poly + '=' + stu) + '. What is the error?', [
            { html: 'The signs are in the wrong brackets: ' + t(stu + '=' + z.stuExp) + ', so the middle term has the wrong sign.', right: true },
            { html: 'The pair of constants is wrong: they don’t multiply to the constant term.', why: 'They do: ' + t(z.s + '\\times(-' + z.u + ')=' + (-z.s * z.u)) + '. Expand the student’s answer and compare the <b>middle</b> term.' },
            { html: 'The trinomial has a common factor that wasn’t taken out first.', why: 'The coefficients ' + t(z.a + ',\\ ' + z.b + ',\\ ' + z.c) + ' have no common factor. Expand the student’s answer.' },
            { html: 'There is no error.', why: 'Expand the student’s answer: ' + t(stu + '=' + z.stuExp) + '. Is that the original?' }],
            'Expanding gives ' + t(stu + '=' + seq([M(z.m * z.n, 'x', 2), M(-z.m * z.u, 'x'), M(z.n * z.s, 'x'), N(-z.s * z.u)]) + '=' + z.stuExp) + ': the middle term is ' + t(tx(M(-z.b, 'x'))) + ' instead of ' + t(tx(M(z.b, 'x'))) + '. The signs are in the wrong brackets.',
            ['Expand the student’s answer and compare it with the original, term by term.'], 'error: ' + plain(z.poly) + ' = ' + plain(stu));
        } },
        { id: '20a2', sub: 'a ii', level: 'PRG', make: function (r, sh) {
          var z = sh.a, Ft = FT(null, [lin(z.m, 'x', -z.s), lin(z.n, 'x', z.u)]);
          return fac('Write the correct factored form of ' + t(z.poly) + ' (the student wrote ' + t(br(lin(z.m, 'x', z.s)) + br(lin(z.n, 'x', -z.u))) + ').', Ft, [{ is: FT(null, [lin(z.m, 'x', z.s), lin(z.n, 'x', -z.u)]), code: 'student-ans', hint: 'That is the student’s answer — it expands to ' + t(z.stuExp) + '. Swap the signs.' }],
            t('ac=' + (z.a * z.c)) + '; the pair with sum ' + t(z.b) + ' is ' + t(z.m * z.u) + ' and ' + t(-z.n * z.s) + '.<br>' + t(z.poly + '=' + Ft.tex) + '<br>Check: ' + t(Ft.tex + '=' + seq([M(z.m * z.n, 'x', 2), M(z.m * z.u, 'x'), M(-z.n * z.s, 'x'), N(-z.s * z.u)]) + '=' + z.poly) + ' ✓',
            ['Keep the student’s brackets but fix the signs so the middle term comes out right.'], 'correct ' + plain(z.poly));
        } },
        { id: '20b1', sub: 'b i', level: 'EMG', make: function (r, sh) {
          var q = sh.q, q2 = q * q, poly = 'x^{4}-' + q2 * q2, stu = '(x^{2}-' + q2 + ')^{2}';
          return mc(r, t(poly + '=' + stu) + '. What is the error?', [
            { html: t(stu + '=x^{4}-' + 2 * q2 + 'x^{2}+' + q2 * q2) + ' has a middle term. A difference of squares factors as ' + t('(A-B)(A+B)') + ' — one minus, one plus — and ' + t('x^{2}-' + q2) + ' factors again.', right: true },
            { html: 'There is no error.', why: 'Expand: ' + t(stu + '=x^{4}-' + 2 * q2 + 'x^{2}+' + q2 * q2) + '. Is that the original?' },
            { html: 'It should be ' + t('(x^{2}+' + q2 + ')^{2}') + '.', why: t('(x^{2}+' + q2 + ')^{2}') + ' also has a middle term (' + t('+' + 2 * q2 + 'x^{2}') + ').' },
            { html: 'It should be ' + t('(x-' + q + ')^{4}') + '.', why: 'A power of one bracket can’t be right: ' + t('(x-' + q + ')^{4}') + ' has an ' + t('x^{3}') + ' term.' }],
            t(stu + '=x^{4}-' + 2 * q2 + 'x^{2}+' + q2 * q2) + ', not the original. Correct: ' + t(poly + '=(x^{2}-' + q2 + ')(x^{2}+' + q2 + ')') + ', and ' + t('x^{2}-' + q2) + ' factors again.',
            ['Expand the student’s answer.', 'What is the pattern for ' + t('A^{2}-B^{2}') + '?'], 'error: ' + plain(poly) + ' = ' + plain(stu));
        } },
        { id: '20b2', sub: 'b ii', level: 'PRG', make: function (r, sh) {
          var q = sh.q, q2 = q * q, Ft = FT(null, [lin(1, 'x', -q), lin(1, 'x', q), [M(1, 'x', 2), N(q2)]]), poly = tx(Ft.poly);
          return fac('Write the correct, complete factored form of ' + t(poly) + '.', Ft, [
            { is: FT(null, [{ terms: [M(1, 'x', 2), N(-q2)], k: 2 }]), code: 'student-ans', hint: 'That is the student’s answer — it has a middle term when expanded.' },
            { is: FT(null, [lin(1, 'x', -q), { terms: lin(1, 'x', q), k: 3 }]), code: 'sum-split', hint: t('x^{2}+' + q2) + ' is a <b>sum</b> of squares and doesn’t factor.' }],
            t(poly + '=(x^{2})^{2}-' + q2 + '^{2}=(x^{2}-' + q2 + ')(x^{2}+' + q2 + ')') + '<br>' + t('x^{2}-' + q2) + ' is again a difference of squares; ' + t('x^{2}+' + q2) + ' is a sum and stops.<br>' + t(poly + '=' + Ft.tex),
            ['Use ' + t('A^{2}-B^{2}=(A-B)(A+B)') + ' with ' + t('A=x^{2}') + '.', 'Then check each bracket again.'], 'factor ' + plain(poly));
        } }] },
      { num: '21', stem: function (sh) { return '<i>(Written Response)</i> Students are investigating polynomials of the form ' + t('x^{2}+bx+c') + ', where ' + t('b') + ' and ' + t('c') + ' are integers, with ' + t('c=' + sh.c) + '.'; },
        shared: function (r) { var c = r.pick([20, 20, 12, 18, 28, 30, 24, 40, 44, 45, 50]), S = sumsOf(c), mx = Math.min(c - 1, 15), cand = []; for (var k = 1; k <= mx; k++) if (S.indexOf(k) < 0) cand.push(k); return { c: c, S: S, nb: r.pick(cand) }; },
        parts: [
          { id: '21a', sub: 'a', level: 'EMG', make: function (r, sh) {
            var c = sh.c, S = sh.S, pq = r.pick(pairsOf(c)), key = 'x^{2}+' + (pq[0] + pq[1]) + 'x+' + c;
            var p = KP.math('State a polynomial with ' + t('c=' + c) + ' which <b>can</b> be factored over the integers.', bCheck(c, S, true), key,
              'Any pair of integers that multiplies to ' + t(c) + ' works. For example ' + t(pq[0]) + ' and ' + t(pq[1]) + ' give ' + t('b=' + (pq[0] + pq[1])) + ': ' + t(key + '=(x+' + pq[0] + ')(x+' + pq[1] + ')') + '.',
              ['Pick two integers that multiply to ' + t(c) + '. Their sum is ' + t('b') + '.'], 'factorable x²+bx+' + c, { keys: 'poly', vars: ['x'] });
            p.good = S.map(function (s) { return 'x^{2}-' + s + 'x+' + c; }); p.bad = ['x^{2}+' + lc(sh.nb) + 'x+' + c, '2x^{2}+' + S[0] + 'x+' + c, 'x^{2}+' + S[0] + 'x+' + (c + 1)];
            return p;
          } },
          { id: '21b', sub: 'b i', level: 'EMG', make: function (r, sh) {
            var c = sh.c, key = 'x^{2}+' + lc(sh.nb) + 'x+' + c;
            var p = KP.math('State a polynomial with ' + t('c=' + c) + ' which <b>cannot</b> be factored over the integers.', bCheck(c, sh.S, false), key,
              'For example ' + t(key) + '. The factor pairs of ' + t(c) + ' are ' + pairsOf(c).map(function (q) { return t(q[0] + '\\ \\&\\ ' + q[1]); }).join(', ') + ' with sums ' + t(sh.S.map(function (s) { return '\\pm' + s; }).join(',\\ ')) + '. ' + t(sh.nb) + ' is not one of them.',
              ['Choose a value of ' + t('b') + ' that is <b>not</b> the sum of a factor pair of ' + t(c) + '.'], 'non-factorable x²+bx+' + c, { keys: 'poly', vars: ['x'] });
            p.good = ['x^{2}-' + lc(sh.nb) + 'x+' + c]; p.bad = ['x^{2}+' + sh.S[0] + 'x+' + c, 'x^{2}-' + sh.S[sh.S.length - 1] + 'x+' + c];
            return p;
          } },
          { id: '21bw', sub: 'b ii', level: 'EMG', make: function (r, sh) {
            var c = sh.c, b = sh.nb, ps = pairsOf(c), big = ps[0][0] + ps[0][1], small = ps[ps.length - 1][0] + ps[ps.length - 1][1];
            var opts = [
              { html: 'No two integers multiply to ' + t(c) + ' and add to ' + t(b) + '.', right: true },
              { html: 'Because ' + t(c) + ' is not a perfect square.', why: t('x^{2}+' + small + 'x+' + c + '=(x+' + ps[ps.length - 1][0] + ')(x+' + ps[ps.length - 1][1] + ')') + ' factors, and ' + t(c) + ' still isn’t a perfect square.' },
              { html: 'Because ' + t('b') + ' is smaller than ' + t('c') + '.', why: t('x^{2}+' + small + 'x+' + c) + ' has ' + t(small + '<' + c) + ' and it factors: ' + t('(x+' + ps[ps.length - 1][0] + ')(x+' + ps[ps.length - 1][1] + ')') + '.' },
              { html: 'A trinomial ' + t('x^{2}+bx+' + c) + ' can only be factored when ' + t('b') + ' is ' + (big % 2 ? 'even' : 'odd') + '.', why: t('x^{2}+' + big + 'x+' + c + '=(x+1)(x+' + c + ')') + ' factors, and ' + t(big) + ' is ' + (big % 2 ? 'odd' : 'even') + '.' }];
            return mc(r, 'Explain why ' + t('x^{2}+' + lc(b) + 'x+' + c) + ' cannot be factored over the integers.', opts,
              'To factor ' + t('x^{2}+bx+' + c) + ' you need two integers that multiply to ' + t(c) + ' and add to ' + t('b') + '. The factor pairs of ' + t(c) + ' have sums ' + t(sh.S.map(function (s) { return '\\pm' + s; }).join(',\\ ')) + ' — never ' + t(b) + '.',
              ['What two things must the integers in ' + t('(x+m)(x+n)') + ' do?'], 'why x²+' + b + 'x+' + c + ' cannot factor');
          } },
          { id: '21c', sub: 'c', level: 'ADV', make: function (r, sh) {
            var c = sh.c, n = sh.S.length, ans = 2 * n;
            return KP.number('Determine how many polynomials of the form ' + t('x^{2}+bx+' + c) + ' (with ' + t('b') + ' a nonzero integer) can be factored over the integers.', ans, function (v) {
              if (v === n) return { code: 'count-pos', hint: 'You have the positive values of ' + t('b') + '. Two negative integers can also multiply to ' + t(c) + '.' };
              if (v === 2 * ans || v === ans * 2 - (isSq(c) ? 2 : 0)) return { code: 'count-ordered', hint: t('(x+4)(x+5)') + ' and ' + t('(x+5)(x+4)') + ' are the same polynomial — count each pair once.' };
              if (v === ans + 1) return { code: 'count-zero', hint: t('b') + ' must be nonzero (and ' + t('x^{2}+' + c) + ' doesn’t factor anyway).' };
              return null;
            }, 'Since ' + t('c=' + c + '>0') + ', the two integers have the same sign: ' + pairsOf(c).map(function (q) { return t('(x\\pm' + q[0] + ')(x\\pm' + q[1] + ')') + ', ' + t('b=\\pm' + (q[0] + q[1])); }).join('; ') + '. That is <b>' + ans + '</b> polynomials.',
            ['List the factor pairs of ' + t(c) + '. Each pair gives one positive and one negative value of ' + t('b') + '.'], 'count factorable x²+bx+' + c);
          } }] },

      /* ================= EXTENSION ================= */
      { num: '22', section: 'Extension — solving by factoring (Lesson 7, Math 20-1 preview)', stem: 'Solve by factoring.', parts: [
        { id: '22a', level: 'EMG', make: function (r) {
          var z = pick(function () { return { p: r.int(2, 9), q: r.int(2, 9) }; }, function (z) { return z.p < z.q; });
          var eq = seq([M(1, 'x', 2), M(-(z.p + z.q), 'x'), N(z.p * z.q)]) + '=0';
          return vs(t(eq), [z.p, z.q], {}, 'Pair: ' + t(-z.p) + ' and ' + t(-z.q) + '.<br>' + t('(x-' + z.p + ')(x-' + z.q + ')=0') + '<br>' + t('x=' + z.p) + ' or ' + t('x=' + z.q),
            ['Factor the left side, then set each factor equal to ' + t('0') + '.'], 'solve ' + plain(eq), ['x=' + (-z.p) + ', x=' + (-z.q), 'x=' + z.p]);
        } },
        { id: '22b', level: 'PRG', make: function (r) {
          var z = pick(function () { return { m: r.pick([2, 3, 5]), s: r.int(1, 7), q: r.int(1, 6) }; }, function (z) { return gcd(z.m, z.s) === 1 && z.s % z.m !== 0 && z.m * z.q - z.s > 0; });
          var b = z.m * z.q - z.s, eq = seq([M(z.m, 'x', 2), M(b, 'x')]) + '=' + z.s * z.q;
          return vs(t(eq), [[z.s, z.m], -z.q], { diag: function (A) {
            if (A.length === 2 && A.some(function (v) { return v === z.s; }) && A.some(function (v) { return v === -z.q; })) return { code: 'forgot-m', hint: t(z.m + 'x-' + z.s + '=0') + ' gives ' + t('x=' + frac(z.s, z.m)) + ', not ' + t(z.s) + '.' };
            return null; } },
            'One side must be ' + t('0') + ' first: ' + t(seq([M(z.m, 'x', 2), M(b, 'x'), N(-z.s * z.q)]) + '=0') + '; ' + t('ac=' + (-z.m * z.s * z.q)) + ', pair ' + t(z.m * z.q) + ', ' + t(-z.s) + '.<br>' + t('(' + z.m + 'x-' + z.s + ')(x+' + z.q + ')=0') + '<br>' + t('x=' + frac(z.s, z.m)) + ' or ' + t('x=-' + z.q),
            ['Move every term to one side so the equation equals ' + t('0') + '.', 'Then factor and set each factor equal to ' + t('0') + '.'], 'solve ' + plain(eq), ['x=' + z.s + ', x=' + (-z.q)]);
        } },
        { id: '22c', level: 'EMG', make: function (r) {
          var k = r.int(2, 12), eq = 'x^{2}=' + k + 'x';
          return vs(t(eq), [0, k], { diag: function (A) { if (A.length === 1 && A[0] === k) return { code: 'divided-x', hint: 'There is another solution. Don’t divide by ' + t('x') + ' — move everything to one side and factor: ' + t('x(x-' + k + ')=0') + '.' }; return null; } },
            t('x^{2}-' + k + 'x=0') + '<br>' + t('x(x-' + k + ')=0') + '<br>' + t('x=0') + ' or ' + t('x=' + k) + '<br><i>Do not divide by ' + t('x') + '.</i>',
            ['Move every term to one side first.', 'Take out the common factor ' + t('x') + '.'], 'solve ' + plain(eq), ['x=' + k]);
        } }] },
      { num: '23', stem: '<i>(Extension)</i>', parts: [
        { id: '23', level: 'EMG', make: function (r) {
          var k = r.int(2, 12);
          return mc(r, 'Kiran solves ' + t('x^{2}=' + k + 'x') + ' by dividing both sides by ' + t('x') + ' to get ' + t('x=' + k) + '. Which statement explains the error and gives the complete solution?', [
            { html: 'Dividing by ' + t('x') + ' assumes ' + t('x\\neq 0') + ', but ' + t('x=0') + ' is a solution. Complete solution: ' + t('x=0') + ' or ' + t('x=' + k) + '.', right: true },
            { html: 'There is no error: ' + t('x=' + k) + ' is the only solution.', why: 'Try ' + t('x=0') + ': ' + t('0^{2}=' + k + '(0)') + ' is true.' },
            { html: 'He should have taken the square root of both sides: ' + t('x=\\pm\\sqrt{' + k + 'x}') + '.', why: 'That still has ' + t('x') + ' on both sides. Move everything to one side and factor: ' + t('x(x-' + k + ')=0') + '.' },
            { html: 'He lost the negative root: the complete solution is ' + t('x=\\pm ' + k) + '.', why: 'Try ' + t('x=-' + k) + ': ' + t('(-' + k + ')^{2}=' + k * k) + ' but ' + t(k + '(-' + k + ')=-' + k * k) + '.' }],
            'Dividing by ' + t('x') + ' is only allowed when ' + t('x\\neq 0') + ', and here ' + t('x=0') + ' <i>is</i> a solution, so that step throws a root away.<br>Correct method: ' + t('x^{2}-' + k + 'x=0') + ', ' + t('x(x-' + k + ')=0') + ', so ' + t('x=0') + ' or ' + t('x=' + k) + '.',
            ['Substitute ' + t('x=0') + ' into the original equation.'], 'Kiran divides by x (k=' + k + ')');
        } }] },
      { num: '24', stem: function (sh) { return 'A rectangular array of chairs has ' + t(sh.d) + ' more chairs in each row than there are rows, and ' + t(sh.r * (sh.r + sh.d)) + ' chairs in total.'; },
        shared: function (r) { return { r: r.int(5, 12), d: r.int(2, 7) }; },
        parts: [
          { id: '24a', sub: 'a', level: 'ADV', make: function (r, sh) {
            var n = sh.r * (sh.r + sh.d);
            return vs('Write an equation for the number of rows ' + t('r') + ', and solve it. Give <b>both</b> roots of the equation.', [sh.r, -(sh.r + sh.d)], { v: 'r' },
              'Let ' + t('r=') + ' number of rows; each row holds ' + t('r+' + sh.d) + ' chairs.<br>' + t('r(r+' + sh.d + ')=' + n + '\\ \\Rightarrow\\ r^{2}+' + sh.d + 'r-' + n + '=0') + '<br>' + t('(r-' + sh.r + ')(r+' + (sh.r + sh.d) + ')=0') + '<br>' + t('r=' + sh.r) + ' or ' + t('r=-' + (sh.r + sh.d)),
              ['Rows × chairs per row = total: ' + t('r(r+' + sh.d + ')=' + n) + '.', 'Expand, move ' + t(n) + ' to the left side, and factor.'], 'chairs r(r+' + sh.d + ')=' + n, ['r=' + sh.r, 'r=' + (-sh.r) + ', r=' + (sh.r + sh.d)]);
          } },
          { id: '24b', sub: 'b i', level: 'EMG', make: function (r, sh) {
            var p = KP.fields('State the number of rows and the number of chairs in each row.', [numBox('Rows:'), numBox('Chairs per row:')],
              [K.number(sh.r, function (v) { return v === -(sh.r + sh.d) ? { code: 'kept-neg', hint: 'A number of rows can’t be negative.' } : v === sh.r + sh.d ? { code: 'value', hint: 'That is the number of chairs in each row. There are ' + t(sh.d) + ' fewer rows.' } : null; }),
                K.number(sh.r + sh.d, function (v) { return v === sh.r ? { code: 'value', hint: 'That is the number of rows; each row has ' + t(sh.d) + ' more chairs.' } : null; })],
              [String(sh.r), String(sh.r + sh.d)], t(sh.r) + ' rows of ' + t(sh.r + sh.d) + ' chairs',
              t(sh.r) + ' rows of ' + t(sh.r + sh.d) + ' chairs (' + t(sh.r + '\\times ' + (sh.r + sh.d) + '=' + sh.r * (sh.r + sh.d)) + ' ✓).',
              ['Use the positive root for the number of rows.'], 'chairs rows and per row');
            p.bad = [[String(sh.r + sh.d), String(sh.r)]];
            return p;
          } },
          { id: '24c', sub: 'b ii', level: 'BEG', make: function (r, sh) {
            var neg = -(sh.r + sh.d);
            return mc(r, 'Why must the root ' + t('r=' + neg) + ' be rejected?', [
              { html: 'A number of rows must be a positive whole number.', right: true },
              { html: 'Because it is larger in size than the other root.', why: 'Size isn’t the reason — think about what ' + t('r') + ' counts.' },
              { html: 'Because it does not satisfy the equation.', why: 'Check: ' + t('(' + neg + ')(' + neg + '+' + sh.d + ')=' + neg * (neg + sh.d)) + ' — it does satisfy the equation. The reason is the context.' },
              { html: 'Because quadratic equations only have one real root.', why: 'This equation has two roots; one of them makes no sense here.' }],
              'Reject ' + t('r=' + neg) + ': it does satisfy the equation, but a number of rows must be a positive whole number.',
              ['What does ' + t('r') + ' stand for?'], 'reject negative root');
          } }] }
    ],

    /* ======================= EXTRA PRACTICE ======================= */
    extra: [
      { num: '1', section: 'Extra practice A — Choosing and applying', stem: function (sh) { return 'Work down the Lesson 6 checklist for each expression, but <b>do not factor yet</b>. Example: ' + t('5x^{3}-45x') + ' — common factor first? yes, ' + t('5x') + '; method on what is left: difference of squares.'; },
        shared: function (r) { return { ex: ep1Exprs(r), order: r.shuffle(['a', 'b', 'c', 'd', 'e']) }; },
        parts: [
          { id: 'e1a', sub: 'a', level: 'BEG', make: function (r, sh) {
            var rows = sh.order.map(function (k) { return { id: k, html: t(sh.ex[k].tex) }; }), want = { a: 'yes', b: 'no', c: 'no', d: 'yes', e: 'no' };
            var p = KP.grid('Does each expression have a <b>common factor</b> to take out first?', rows, [{ id: 'yes', html: 'Yes' }, { id: 'no', html: 'No' }], want, { colHead: 'Common factor first?', why: function (row) { return { code: 'row', hint: 'Check ' + t(sh.ex[row].tex) + ' again: ' + (want[row] === 'yes' ? 'every term shares ' + t(sh.ex[row].gcf) + '.' : 'its terms have no common factor (other than 1).') }; } },
              sh.order.map(function (k) { return t(sh.ex[k].tex) + ': ' + (want[k] === 'yes' ? 'yes, ' + t(sh.ex[k].gcf) : 'no'); }).join('<br>'),
              ['Look at every coefficient (and every variable): do they all share a factor?'], 'EP1 common factor table');
            return p;
          } },
          { id: 'e1b', sub: 'b', level: 'EMG', make: function (r, sh) {
            var rows = sh.order.map(function (k) { return { id: k, html: t(sh.ex[k].tex) }; });
            var cols = [{ id: 'dos', html: 'DS' }, { id: 'tri', html: 'T' }, { id: 'pst', html: 'PS' }, { id: 'grp', html: 'G' }, { id: 'none', html: 'N' }];
            var allow = { a: ['tri'], b: ['grp'], c: ['pst', 'tri'], d: ['dos'], e: ['none'] }, name = { dos: 'difference of squares', tri: 'trinomial (decomposition)', pst: 'perfect square trinomial', grp: 'grouping', none: 'does not factor' };
            var why = { a: 'After the common factor there are three terms with ' + t('a\\neq 1') + ': decomposition.', b: 'Four terms: grouping (then a difference of squares).', c: 'Three terms, and the first and last are perfect squares with the right middle term: a perfect square trinomial.', d: 'After the common factor it is a difference of squares (twice).', e: 'Two terms, but a <b>sum</b> of squares: no method applies.' };
            return { prompt: 'Which method do you use on what is left (after any common factor)?<br><span class="muted">DS = difference of squares · T = trinomial (decomposition) · PS = perfect square trinomial · G = grouping · N = does not factor</span>', input: { type: 'grid', rows: rows, cols: cols, multi: false, rowHead: 'Expression' }, key: { a: 'tri', b: 'grp', c: 'pst', d: 'dos', e: 'none' },
              answer: sh.order.map(function (k) { return t(sh.ex[k].tex) + ': ' + allow[k].map(function (c) { return name[c]; }).join(' or '); }).join('<br>'),
              check: function (resp) {
                resp = resp || {}; var ks = ['a', 'b', 'c', 'd', 'e'], miss = ks.filter(function (k) { return resp[k] == null; });
                if (miss.length === 5) return form('empty', 'Fill in the table first.'); if (miss.length) return form('incomplete', 'Finish every row (' + (5 - miss.length) + ' of 5 done).');
                var bad = sh.order.filter(function (k) { return allow[k].indexOf(resp[k]) < 0; });
                if (!bad.length) return ok();
                return wrong('grid-alt', 'Check ' + t(sh.ex[bad[0]].tex) + ': ' + why[bad[0]] + ' (' + (5 - bad.length) + ' of 5 correct.)');
              },
              solution: sh.order.map(function (k) { return t(sh.ex[k].tex) + ': ' + why[k]; }).join('<br>'), hints: ['Count the terms of what is left: two terms → difference of squares; three → trinomial (watch for a perfect square); four → grouping.'], text: 'EP1 method table',
              bad: [{ a: 'dos', b: 'grp', c: 'pst', d: 'dos', e: 'none' }, { a: 'tri', b: 'grp', c: 'pst', d: 'dos', e: 'dos' }] };
          } }] },
      { num: '2', stem: 'Factor each expression completely. One of the five does not factor.', parts: [
        { id: 'e2a', level: 'PRG', make: function (r) { var z = genNonMonic(r); return nonMonicPart(z, 'm'); } },
        { id: 'e2b', level: 'PRG', make: function (r) { return groupDoSPart(genGroup(r), 'x'); } },
        { id: 'e2c', level: 'PRG', make: function (r) { return pst2Part(genPST2(r), 'a', 'b'); } },
        { id: 'e2d', level: 'PRG', make: function (r) { return quarticPart(genQuartic(r), 't'); } },
        { id: 'e2e', level: 'BEG', make: function (r) {
          var z = genSumSq(r), A = z.a, B = z.b, e = seq([MM(A * A, { p: 2 }), MM(B * B, { q: 2 })]);
          return mc(r, 'Which is true about ' + t(e) + '?', [
            { html: 'It does not factor over the integers.', right: true },
            { html: 'It factors as ' + t('(' + A + 'p+' + B + 'q)^{2}'), why: 'Expand: ' + t('(' + A + 'p+' + B + 'q)^{2}=' + A * A + 'p^{2}+' + 2 * A * B + 'pq+' + B * B + 'q^{2}') + ' — there is a middle term.' },
            { html: 'It factors as ' + t('(' + A + 'p-' + B + 'q)(' + A + 'p+' + B + 'q)'), why: 'That is ' + t(A * A + 'p^{2}-' + B * B + 'q^{2}') + ' — a <b>difference</b>, not a sum.' },
            { html: 'It factors as ' + t('pq(' + A * A + 'p+' + B * B + 'q)'), why: 'Expand: ' + t(A * A + 'p^{2}q+' + B * B + 'pq^{2}') + '. Neither variable is in both terms, so there is no common factor.' }],
            '<b>Does not factor.</b> There is no common factor (' + t('\\gcd(' + A * A + ',' + B * B + ')=1') + ', and no variable is in both terms). It has two terms, but ' + t(e + '=(' + A + 'p)^{2}+(' + B + 'q)^{2}') + ' is a <b>sum</b> of squares, and a sum of squares never factors over the integers.',
            ['Is it a difference or a sum?'], 'sum of squares ' + plain(e));
        } }] },
      { num: '3', stem: function (sh) { return 'Every expression below opens with ' + t('4x^{2}') + ' or ' + t('4x^{4}') + ', and no single method handles all six. Factor each completely.'; },
        shared: function (r) {
          var s = r.pick([3, 5, 7, 9, 9, 11]), pq = r.pick(pairsOf2(s)), mn = pick(function () { var n = r.int(1, 4); return [s + n, n]; }, function (v) { return v[0] * v[1] <= 60; });
          return { s: s, q: r.int(2, 7), pq: pq, mn: mn };
        },
        parts: [
          { id: 'e3a', level: 'BEG', make: function (r, sh) {
            var q = sh.q, Ft = FT(N(4), [lin(1, 'x', -q), lin(1, 'x', q)]), poly = tx(Ft.poly);
            return fac(t(poly), Ft, [{ is: FT(N(4), [{ terms: lin(1, 'x', -q), k: 2 }]), code: 'dos-square', hint: t('(x-' + q + ')^{2}') + ' has a middle term. A difference of squares is ' + t('(A-B)(A+B)') + '.' }], 'GCF ' + t('=4') + ': ' + t(poly + '=4(x^{2}-' + q * q + ')') + '<br>Difference of squares: ' + t('=' + Ft.tex), ['Take out the common factor first, then look at what is left.'], 'factor ' + plain(poly));
          } },
          { id: 'e3b', level: 'BEG', make: function (r, sh) {
            var Ft = FT(M(4, 'x'), [lin(1, 'x', -sh.s)]), poly = tx(Ft.poly);
            return fac(t(poly), Ft, [], 'GCF ' + t('=4x') + ': ' + t(poly + '=' + Ft.tex) + '<br>' + t('x-' + sh.s) + ' does not factor, so this is complete.', ['Both terms share ' + t('4') + ' and ' + t('x') + '.'], 'factor ' + plain(poly));
          } },
          { id: 'e3c', level: 'PRG', make: function (r, sh) {
            var s = sh.s, Ft = FT(null, [{ terms: lin(2, 'x', -s), k: 2 }]), poly = tx(Ft.poly);
            return fac(t(poly), Ft, [{ is: FT(null, [lin(2, 'x', -s), lin(2, 'x', s)]), code: 'dos-square', hint: 'That gives ' + t('4x^{2}-' + s * s) + ' — no middle term. The middle term ' + t('-' + 4 * s + 'x') + ' means a perfect square.' }],
              'No common factor (' + t(s * s) + ' is odd).<br>' + t('\\sqrt{4x^{2}}=2x') + ', ' + t('\\sqrt{' + s * s + '}=' + s) + ', and ' + t('2(2x)(' + s + ')=' + 4 * s + 'x') + ', with a minus sign. <b>Perfect square:</b><br>' + t(poly + '=' + Ft.tex),
              ['Are the first and last terms perfect squares? Check the middle term: ' + t('2AB') + '.'], 'factor ' + plain(poly));
          } },
          { id: 'e3d', level: 'BEG', make: function (r, sh) {
            var p = sh.pq[0], q = sh.pq[1], Ft = FT(N(4), [lin(1, 'x', -q), lin(1, 'x', -p)]), poly = tx(Ft.poly);
            return fac(t(poly), Ft, [], 'GCF ' + t('=4') + ': ' + t('4(x^{2}-' + sh.s + 'x+' + p * q + ')') + '<br>Product ' + t(p * q) + ', sum ' + t(-sh.s) + ': ' + t(-q) + ' and ' + t(-p) + '.<br>' + t('=' + Ft.tex), ['Take out the common factor ' + t('4') + ' first.'], 'factor ' + plain(poly));
          } },
          { id: 'e3e', level: 'BEG', make: function (r, sh) {
            var m = sh.mn[0], n = sh.mn[1], Ft = FT(N(4), [lin(1, 'x', -m), lin(1, 'x', n)]), poly = tx(Ft.poly);
            return fac(t(poly), Ft, [{ is: FT(N(4), [lin(1, 'x', m), lin(1, 'x', -n)]), code: 'sign-swap', hint: 'Your pair adds to ' + t(sh.s) + ' instead of ' + t(-sh.s) + '. Swap the signs.' }], 'GCF ' + t('=4') + ': ' + t('4(x^{2}-' + sh.s + 'x-' + m * n + ')') + '<br>Product ' + t(-m * n) + ', sum ' + t(-sh.s) + ': ' + t(-m) + ' and ' + t(n) + '.<br>' + t('=' + Ft.tex), ['Take out the common factor ' + t('4') + ' first.'], 'factor ' + plain(poly));
          } },
          { id: 'e3f', level: 'PRG', make: function (r, sh) {
            var s = sh.s, Ft = FT(null, [{ terms: [M(2, 'x', 2), N(-s)], k: 2 }]), poly = tx(Ft.poly);
            return fac(t(poly), Ft, [{ is: FT(null, [{ terms: lin(2, 'x', -s), k: 2 }]), code: 'value', hint: 'The first term is ' + t('4x^{4}=(2x^{2})^{2}') + ', so the bracket starts with ' + t('2x^{2}') + '.' }],
              'No common factor. A perfect square in ' + t('x^{2}') + ': ' + t('\\sqrt{4x^{4}}=2x^{2}') + ', ' + t('\\sqrt{' + s * s + '}=' + s) + ', ' + t('2(2x^{2})(' + s + ')=' + 4 * s + 'x^{2}') + '.<br>' + t(poly + '=' + Ft.tex) + '<br>' + t('2x^{2}') + ' is not a perfect square, so ' + t('2x^{2}-' + s) + ' stops.',
              ['Treat ' + t('x^{2}') + ' as the variable: is it a perfect square trinomial?'], 'factor ' + plain(poly));
          } },
          { id: 'e3g', sub: 'g', level: 'EMG', make: function (r, sh) {
            return mc(r, 'Four of the six start with a common factor and two do not. What should you look at <b>first</b> to separate (a)–(f)?', [
              { html: 'Whether the <b>other</b> coefficients share a factor with the ' + t('4') + ' (the leading ' + t('4') + ' is the same in all six); then count the terms to choose the method.', right: true },
              { html: 'The leading coefficient — it decides which method to use.', why: 'The leading coefficient is ' + t('4') + ' in all six, so it can’t separate them.' },
              { html: 'Whether the constant term is a perfect square.', why: 'That only matters for perfect squares and differences of squares — and (b) has no constant at all. Check for a common factor first.' },
              { html: 'The number of variables.', why: 'All six have just one variable, ' + t('x') + '.' }],
              'The common-factor question is settled by the <i>other</i> coefficients, because the leading coefficient is ' + t('4') + ' everywhere. (a), (b), (d) and (e) have a common factor; (c) and (f) do not (' + t(sh.s * sh.s) + ' is odd). Then the number of terms chooses the method: two terms → difference of squares; three terms → inspection or decomposition, watching for a perfect square.',
              ['What do all six have in common? Then it can’t be what separates them.'], 'EP3 what to look at first');
          } }] },
      { num: '4', section: 'Extra practice B — Factoring completely', stem: 'Factor completely. Every one takes at least two of the unit’s methods.', parts: [
        { id: 'e4a', level: 'PRG', make: function (r) {
          var g = r.pick([2, 3, 5, 6, 7]), q = r.int(2, 6), Ft = FT(M(g, 'x'), [lin(1, 'x', -q), lin(1, 'x', q)]), poly = tx(Ft.poly);
          return fac(t(poly), Ft, [{ is: FT(M(g, 'x'), [{ terms: lin(1, 'x', -q), k: 2 }]), code: 'dos-square', hint: t('(x-' + q + ')^{2}') + ' has a middle term; a difference of squares is ' + t('(A-B)(A+B)') + '.' }],
            'GCF ' + t('=' + g + 'x') + ': ' + t(poly + '=' + g + 'x(x^{2}-' + q * q + ')') + '<br>Difference of squares: ' + t('=' + Ft.tex), ['Common factor first, then look at the bracket.'], 'factor ' + plain(poly));
        } },
        { id: 'e4b', level: 'ADV', make: function (r) {
          var z = pick(function () { return { g: r.pick([2, 3, 5]), q: r.int(1, 3), m: r.int(2, 5), n: r.int(1, 5) }; }, function (z) { return gcd(z.m, z.n) === 1 && z.n !== z.m * z.q * z.q; });
          var Ft = FT(M(z.g, 'y'), [lin(1, 'x', -z.q), lin(1, 'x', z.q), [M(z.m, 'x', 2), N(z.n)]]), poly = seq(P.sorted(Ft.poly, { var: 'x' }).map(function (T) { return P.mono(T.c, T.v); }));
          var inner = seq([M(z.m, 'x', 4), M(z.n - z.m * z.q * z.q, 'x', 2), N(-z.n * z.q * z.q)]), ac = -z.m * z.n * z.q * z.q;
          return fac(t(poly), Ft, [], 'GCF ' + t('=' + z.g + 'y') + ': ' + t(z.g + 'y(' + inner + ')') + '<br>In ' + t('x^{2}') + ': ' + t('ac=' + ac) + '; pair ' + t(-z.m * z.q * z.q) + ' and ' + t(z.n) + '.<br>' + t('=' + z.g + 'y(x^{2}-' + z.q * z.q + ')(' + seq([M(z.m, 'x', 2), N(z.n)]) + ')') + '<br>' + t('x^{2}-' + z.q * z.q) + ' is a difference of squares; ' + t(seq([M(z.m, 'x', 2), N(z.n)])) + ' is a sum and stops.<br>' + t('=' + Ft.tex),
            ['Take out the common factor (including ' + t('y') + ').', 'The bracket is a trinomial in ' + t('x^{2}') + ': decompose it, then check each bracket again.'], 'factor ' + plain(poly), { vars: ['x', 'y'] });
        } },
        { id: 'e4c', level: 'PRG', make: function (r) {
          var z = pick(function () { return { g: r.pick([2, 3, 5]), a: r.int(2, 5), b: r.int(1, 5) }; }, function (z) { return gcd(z.a, z.b) === 1 && z.a !== z.b; });
          var G = MM(z.g, { m: 2 }), Ft = FT(G, [[M(z.a, 'm'), M(-z.b, 'n')], [M(z.a, 'm'), M(z.b, 'n')]]), poly = seq([MM(z.g * z.a * z.a, { m: 4 }), MM(-z.g * z.b * z.b, { m: 2, n: 2 })]);
          return fac(t(poly), Ft, [{ is: [MM(z.g, { m: 1 }), P.add(MM(z.a, { m: 1 }), MM(-z.b, { n: 1 })), P.add(MM(z.a, { m: 1 }), MM(z.b, { n: 1 }))], code: 'gcf-power', hint: 'Check the power of ' + t('m') + ' in your common factor: both terms have at least ' + t('m^{2}') + '.' }],
            'GCF ' + t('=' + tx(G)) + ': ' + t(tx(G) + '(' + z.a * z.a + 'm^{2}-' + lc(z.b * z.b) + 'n^{2})') + '<br>' + t(z.a * z.a + 'm^{2}-' + lc(z.b * z.b) + 'n^{2}=(' + z.a + 'm)^{2}-' + (z.b === 1 ? 'n^{2}' : '(' + z.b + 'n)^{2}')) + '<br>' + t('=' + Ft.tex), ['Common factor first (number and power of ' + t('m') + ').', 'Then a difference of squares.'], 'factor ' + plain(poly));
        } },
        { id: 'e4d', level: 'PRG', make: function (r) {
          var z = pick(function () { return { g: r.pick([2, 3, 4, 6]), p: r.int(2, 5), s: r.int(1, 3), u: r.int(1, 5) }; }, function (z) { return gcd(z.p, z.s) === 1 && z.s !== z.p * z.u; });
          var Ft = FT(M(-z.g, 'x'), [lin(z.p, 'x', -z.s), lin(1, 'x', -z.u)]), poly = tx(Ft.poly), inner = seq([M(z.p, 'x', 2), M(-(z.p * z.u + z.s), 'x'), N(z.s * z.u)]);
          return fac(t(poly), Ft, [{ is: FT(M(-z.g, 'x'), [lin(z.p, 'x', z.s), lin(1, 'x', z.u)]), code: 'sign-swap', hint: 'After taking out ' + t('-' + z.g + 'x') + ' the bracket is ' + t(inner) + ' — both brackets need minus signs.' }],
            'Leading term negative, so take out ' + t('-' + z.g + 'x') + ': ' + t('-' + z.g + 'x(' + inner + ')') + '<br>' + t('ac=' + z.p * z.s * z.u) + '; pair ' + t(-z.s) + ' and ' + t(-z.p * z.u) + '.<br>' + t('=' + Ft.tex),
            ['Take out a <b>negative</b> common factor so the bracket starts with a positive term.', 'Then decompose the trinomial.'], 'factor ' + plain(poly));
        } },
        { id: 'e4e', level: 'PRG', make: function (r) {
          var z = pick(function () { return { p: r.int(1, 7), q: r.int(2, 7) }; }, function (z) { return z.p !== z.q; });
          var Ft = FT(null, [lin(1, 'x', -z.p), lin(1, 'x', -z.q), lin(1, 'x', z.q)]), poly = tx(Ft.poly);
          return fac(t(poly), Ft, [], 'Four terms ⇒ grouping: ' + t('(' + seq([M(1, 'x', 3), M(-z.p, 'x', 2)]) + ')+(' + seq([M(-z.q * z.q, 'x'), N(z.p * z.q * z.q)]) + ')') + '<br>' + t('=x^{2}(x-' + z.p + ')-' + z.q * z.q + '(x-' + z.p + ')=(x-' + z.p + ')(x^{2}-' + z.q * z.q + ')') + '<br>Difference of squares: ' + t('=' + Ft.tex), ['Group two and two, take out a common factor from each pair.', 'Check the brackets again.'], 'factor ' + plain(poly));
        } },
        { id: 'e4f', level: 'PRG', make: function (r) {
          var z = pick(function () { return { p: r.int(1, 6), s: r.int(1, 7), m: r.int(2, 5) }; }, function (z) { return gcd(z.m, z.s) === 1 && z.s - z.m * z.p !== 0; });
          var A = lin(1, 'x', z.p), B = [N(z.s), M(-z.m, 'x')], Ft = FT(null, [A, B]), poly = tx(Ft.poly, { order: 'asc' });
          return fac(t(poly) + ' (keep the negative <i>inside</i> a bracket)', Ft, [{ is: FT(null, [A, lin(z.m, 'x', -z.s)]), code: 'sign-all', hint: 'Your factors give every sign opposite. Put the negative back: ' + t('(' + z.s + '-' + z.m + 'x)') + ' or ' + t('-(' + z.m + 'x-' + z.s + ')') + '.' }],
            'Descending order: ' + t(tx(Ft.poly)) + '. Factor ' + t(tx(P.neg(Ft.poly))) + ' and restore the sign: ' + t('ac=' + (-z.m * z.p * z.s)) + ', pair ' + t(z.m * z.p) + ' and ' + t(-z.s) + '.<br>' + t(tx(P.neg(Ft.poly)) + '=' + br(A) + '(' + z.m + 'x-' + z.s + ')') + '<br>So ' + t(poly + '=-' + br(A) + '(' + z.m + 'x-' + z.s + ')=' + Ft.tex),
            ['Rewrite in descending order and take out ' + t('-1') + '.', 'Factor, then move the ' + t('-1') + ' into one bracket.'], 'factor ' + plain(poly), { good: ['-' + br(A) + '(' + z.m + 'x-' + z.s + ')'] });
        } }] },
      { num: '5', stem: 'Each of these is a trinomial in a <b>monomial disguise</b>. Decompose first, then check every bracket for a difference of squares.', parts: [
        { id: 'e5a', level: 'ADV', make: function (r) {
          var z = pick(function () { return { r: r.pick([2, 3]), q: r.pick([1, 2, 3]) }; }, function (z) { return !(z.r === 1); });
          var Ft = FT(null, [lin(z.r, 'a', -1), lin(z.r, 'a', 1), lin(1, 'a', -z.q), lin(1, 'a', z.q)]), poly = tx(Ft.poly);
          var b1 = seq([M(z.r * z.r, 'a', 2), N(-1)]), b2 = seq([M(1, 'a', 2), N(-z.q * z.q)]);
          return fac(t(poly), Ft, [], 'A trinomial in ' + t('a^{2}') + ': ' + t('ac=' + z.r * z.r * z.q * z.q) + '; pair ' + t(-1) + ' and ' + t(-z.r * z.r * z.q * z.q) + '.<br>' + t(poly + '=(' + b1 + ')(' + b2 + ')') + '<br>Both brackets are differences of squares:<br>' + t('=' + Ft.tex),
            ['Treat ' + t('a^{2}') + ' as the variable and decompose.', 'Then factor each bracket again.'], 'factor ' + plain(poly));
        } },
        { id: 'e5b', level: 'ADV', make: function (r) {
          var z = r.pick([[4, 2], [3, 2], [2, 3], [4, 3], [3, 1], [2, 1]]), a = z[0], q = z[1];
          var Ft = FT(null, [[M(a, 'm'), M(-1, 'n')], [M(a, 'm'), M(1, 'n')], [M(1, 'm'), M(-q, 'n')], [M(1, 'm'), M(q, 'n')]]), poly = seq([M(a * a, 'm', 4), MM(-(a * a * q * q + 1), { m: 2, n: 2 }), M(q * q, 'n', 4)]);
          return fac(t(poly), Ft, [], 'A trinomial in ' + t('m^{2}') + ' and ' + t('n^{2}') + ': ' + t('ac=' + a * a * q * q) + '; pair ' + t(-1) + ' and ' + t(-a * a * q * q) + '.<br>' + t('=(' + a * a + 'm^{2}-n^{2})(m^{2}-' + (q === 1 ? '' : q * q) + 'n^{2})') + '<br>Both brackets are differences of squares:<br>' + t('=' + Ft.tex),
            ['Decompose as if ' + t('m^{2}') + ' and ' + t('n^{2}') + ' were single letters.', 'Then factor each bracket again.'], 'factor ' + plain(poly));
        } },
        { id: 'e5c', level: 'PRG', make: function (r) {
          var z = pick(function () { return { p: r.int(2, 5), s: r.int(1, 7), q: r.int(2, 5), u: r.int(2, 7) }; }, function (z) { return gcd(z.p, z.s) === 1 && gcd(z.q, z.u) === 1 && z.q * z.s - z.p * z.u !== 0 && !(isSq(z.q) && isSq(z.u)) && z.p !== z.q; });
          var A = [M(z.p, 'x', 2), N(z.s)], B = [M(z.q, 'x', 2), N(-z.u)], Ft = FT(null, [A, B]), poly = tx(Ft.poly);
          return fac(t(poly), Ft, [], 'A trinomial in ' + t('x^{2}') + ': ' + t('ac=' + (-z.p * z.q * z.s * z.u)) + '; pair ' + t(z.q * z.s) + ' and ' + t(-z.p * z.u) + '.<br>' + t(poly + '=' + Ft.tex) + '<br>Neither bracket splits: ' + t(seq(A)) + ' is a sum, and ' + t(seq(B)) + ' is not a difference of two perfect squares.',
            ['Decompose with ' + t('x^{2}') + ' as the variable.', 'Check each bracket: is it a difference of perfect squares?'], 'factor ' + plain(poly));
        } },
        { id: 'e5d', level: 'PRG', make: function (r) {
          var z = genPST2(r), Ft = FT(null, [{ terms: [MM(z.a, { p: 1, q: 1 }), N(-z.b)], k: 2 }]), poly = seq([MM(z.a * z.a, { p: 2, q: 2 }), MM(-2 * z.a * z.b, { p: 1, q: 1 }), N(z.b * z.b)]);
          return fac(t(poly), Ft, [{ is: FT(null, [[MM(z.a, { p: 1, q: 1 }), N(-z.b)], [MM(z.a, { p: 1, q: 1 }), N(z.b)]]), code: 'dos-square', hint: 'That gives no middle term. Check: ' + t('2(' + z.a + 'pq)(' + z.b + ')=' + 2 * z.a * z.b + 'pq') + '.' }],
            'A trinomial in ' + t('pq') + ': ' + t('\\sqrt{' + z.a * z.a + 'p^{2}q^{2}}=' + z.a + 'pq') + ', ' + t('\\sqrt{' + z.b * z.b + '}=' + z.b) + ', ' + t('2(' + z.a + 'pq)(' + z.b + ')=' + 2 * z.a * z.b + 'pq') + ': a perfect square.<br>' + t(poly + '=' + Ft.tex),
            ['Treat ' + t('pq') + ' as one quantity.', 'Check for a perfect square trinomial.'], 'factor ' + plain(poly));
        } }] },
      { num: '6', stem: 'Each line shows a student’s <i>first</i> step. Finish the factoring — or, if the expression is already factored completely, type it as it is.', parts: [
        { id: 'e6a', level: 'PRG', make: function (r) {
          var k = r.pick([2, 3, 5]), q = r.pick([2, 3]), q2 = q * q, Ft = FT(N(k), [lin(1, 'x', -q), lin(1, 'x', q), [M(1, 'x', 2), N(q2)]]);
          var first = k + 'x^{4}-' + k * q2 * q2 + '=' + k + '(x^{4}-' + q2 * q2 + ')';
          return fac(t(first), Ft, [{ is: FT(N(k), [lin(1, 'x', -q), lin(1, 'x', q), lin(1, 'x', -q), lin(1, 'x', q)]), code: 'sum-split', hint: t('x^{2}+' + q2) + ' is a sum of squares and doesn’t factor.' }],
            '<b>Not finished.</b> ' + t('x^{4}-' + q2 * q2 + '=(x^{2})^{2}-' + q2 + '^{2}=(x^{2}-' + q2 + ')(x^{2}+' + q2 + ')') + '<br>' + t('x^{2}-' + q2) + ' splits again; ' + t('x^{2}+' + q2) + ' is a sum.<br>' + t('=' + Ft.tex),
            ['Can the bracket be factored again? Is it a difference of squares?'], 'finish ' + plain(first));
        } },
        { id: 'e6b', level: 'PRG', make: function (r) {
          var z = pick(function () { return { g: r.pick([2, 3]), a: r.pick([2, 3]), b: r.int(1, 7) }; }, function (z) { return gcd(z.a, z.b) === 1; });
          var G = M(z.g, 'x'), sq = [M(z.a * z.a, 'x', 2), M(2 * z.a * z.b, 'x'), N(z.b * z.b)], Ft = FT(G, [{ terms: lin(z.a, 'x', z.b), k: 2 }]);
          var first = tx(Ft.poly) + '=' + tx(G) + '(' + seq(sq) + ')';
          return fac(t(first), Ft, [{ is: FT(G, [lin(z.a, 'x', -z.b), lin(z.a, 'x', z.b)]), code: 'dos-square', hint: 'Check the middle term: that gives none. The bracket is a perfect square trinomial.' }],
            '<b>Not finished</b> — watch for perfect squares. ' + t('\\sqrt{' + z.a * z.a + 'x^{2}}=' + z.a + 'x') + ', ' + t('\\sqrt{' + z.b * z.b + '}=' + z.b) + ', ' + t('2(' + z.a + 'x)(' + z.b + ')=' + 2 * z.a * z.b + 'x') + ':<br>' + t(seq(sq) + '=(' + seq(lin(z.a, 'x', z.b)) + ')^{2}') + '<br>' + t(tx(Ft.poly) + '=' + Ft.tex),
            ['Is the bracket a perfect square trinomial?'], 'finish ' + plain(first));
        } },
        { id: 'e6c', level: 'PRG', make: function (r) {
          var z = pick(function () { return { g: r.pick([2, 3]), p: r.int(1, 5), m: r.pick([2, 3, 5]), q: r.int(1, 7) }; }, function (z) { return gcd(z.m, z.q) === 1 && z.q - z.m * z.p !== 0; });
          var A = lin(1, 'x', -z.p), B = lin(z.m, 'x', z.q), inner = P.mul(sum(A), sum(B)), Ft = FT(N(z.g), [A, B]), first = tx(Ft.poly) + '=' + z.g + '(' + tx(inner) + ')';
          return fac(t(first), Ft, [], '<b>Not finished</b> — decompose the bracket. ' + t('ac=' + (-z.m * z.p * z.q)) + '; pair ' + t(-z.m * z.p) + ' and ' + t(z.q) + '.<br>' + t(tx(inner) + '=' + br(A) + br(B)) + '<br>' + t('=' + Ft.tex),
            ['Factor the trinomial in the bracket.'], 'finish ' + plain(first));
        } },
        { id: 'e6d', level: 'EMG', make: function (r) {
          var z = pick(function () { return { p: r.int(2, 5), q: r.int(1, 5), a: r.int(2, 5), s: r.int(2, 7) }; }, function (z) { return gcd(z.p, z.q) === 1 && gcd(z.a, z.s) === 1 && !(isSq(z.a) && isSq(z.s)); });
          var A = lin(z.p, 'y', z.q), B = [M(z.a, 'y', 2), N(-z.s)], Ft = FT(null, [A, B]), first = tx(Ft.poly) + '=' + Ft.tex;
          return fac(t(first), Ft, [], '<b>Already factored completely.</b> ' + t(seq(A)) + ' is linear. ' + t(seq(B)) + ' has two terms, but ' + (isSq(z.a) ? t(z.s) : t(z.a + 'y^{2}')) + ' is not a perfect square, so it is not a difference of squares over the integers.<br>' + t(Ft.tex),
            ['Check each bracket: could it be a difference of two perfect squares?'], 'already complete ' + plain(Ft.tex), { bad: ['(' + seq(A) + ')(' + z.a + 'y-' + z.s + ')(y+1)'] });
        } },
        { id: 'e6e', level: 'EMG', make: function (r) {
          var z = pick(function () { return { a: r.pick([2, 3]), q: r.pick([2, 3, 4]) }; }, function (z) { return z.a !== z.q; });
          var Ft = FT(null, [lin(z.a, 'x', -1), lin(z.a, 'x', 1), lin(1, 'x', -z.q), lin(1, 'x', z.q)]), b1 = seq([M(z.a * z.a, 'x', 2), N(-1)]), b2 = seq([M(1, 'x', 2), N(-z.q * z.q)]);
          var first = tx(Ft.poly) + '=(' + b1 + ')(' + b2 + ')';
          return fac(t(first), Ft, [], '<b>Not finished</b> — use the difference of squares on both brackets:<br>' + t(b1 + '=(' + seq(lin(z.a, 'x', -1)) + ')(' + seq(lin(z.a, 'x', 1)) + ')') + '<br>' + t(b2 + '=(x-' + z.q + ')(x+' + z.q + ')') + '<br>' + t('=' + Ft.tex),
            ['Both brackets are differences of squares.'], 'finish ' + plain(first));
        } },
        { id: 'e6f', level: 'EMG', make: function (r) {
          var z = pick(function () { return { q: r.int(1, 6), a: r.int(2, 5), s: r.int(1, 7) }; }, function (z) { return gcd(z.a, z.s) === 1; });
          var A = lin(1, 'x', z.q), B = [M(z.a, 'x', 2), N(z.s)], Ft = FT(null, [A, B]), first = tx(Ft.poly) + '=' + Ft.tex;
          return fac(t(first), Ft, [], '<b>Already factored completely.</b> ' + t(seq(A)) + ' is linear, and ' + t(seq(B)) + ' is a <i>sum</i>, not a difference, so neither bracket factors.<br>' + t(Ft.tex),
            ['Is ' + t(seq(B)) + ' a difference or a sum?'], 'already complete ' + plain(Ft.tex));
        } }] },
      { num: '7', section: 'Extra practice C — Solving equations', stem: 'Solve each equation. Factor the left side completely first, then apply the Zero Product Law to every factor. Watch the number of roots — it is not always two.', parts: [
        { id: 'e7a', level: 'PRG', make: function (r) {
          var z = pick(function () { return { g: r.pick([2, 3, 4, 5]), p: r.int(1, 9), q: r.int(1, 9) }; }, function (z) { return z.p < z.q && z.g !== z.p && z.g !== z.q; });
          var eq = seq([M(z.g, 'x', 2), M(-z.g * (z.p + z.q), 'x'), N(z.g * z.p * z.q)]) + '=0';
          return vs(t(eq), [z.p, z.q], { diag: function (A) { if (A.indexOf(z.g) >= 0) return { code: 'count-const', hint: 'The factor ' + t(z.g) + ' is never ' + t('0') + ', so it gives no solution.' }; return null; } },
            'GCF ' + t(z.g) + ': ' + t(z.g + '(x^{2}-' + (z.p + z.q) + 'x+' + z.p * z.q + ')=0') + '<br>' + t(z.g + '(x-' + z.p + ')(x-' + z.q + ')=0') + '<br>' + t(z.g + '\\neq 0') + ', so ' + t('x=' + z.p) + ' or ' + t('x=' + z.q),
            ['Take out the common factor, then factor the trinomial.'], 'solve ' + plain(eq), ['x=' + z.g + ', x=' + z.p + ', x=' + z.q]);
        } },
        { id: 'e7b', level: 'PRG', make: function (r) {
          var z = pick(function () { return { g: r.pick([2, 3]), a: r.pick([2, 3]), s: r.int(1, 7) }; }, function (z) { return gcd(z.a, z.s) === 1; });
          var eq = seq([M(z.g * z.a * z.a, 'x', 3), M(-z.g * z.s * z.s, 'x')]) + '=0';
          return vs(t(eq), [0, rat(z.s, z.a), rat(-z.s, z.a)], { diag: function (A) { if (A.indexOf(0) < 0 && A.length === 2) return { code: 'divided-x', hint: 'The common factor ' + t(z.g + 'x') + ' gives a solution too: ' + t('x=0') + '.' }; return null; } },
            'GCF ' + t(z.g + 'x') + ': ' + t(z.g + 'x(' + z.a * z.a + 'x^{2}-' + z.s * z.s + ')=0') + '<br>' + t(z.g + 'x(' + z.a + 'x-' + z.s + ')(' + z.a + 'x+' + z.s + ')=0') + '<br>' + t('x=0') + ', ' + t('x=' + frac(z.s, z.a)) + ' or ' + t('x=' + frac(-z.s, z.a)),
            ['Take out ' + t(z.g + 'x') + ' — it gives a solution too.', 'Then a difference of squares.'], 'solve ' + plain(eq), ['x=' + frac(z.s, z.a) + ', x=' + frac(-z.s, z.a)]);
        } },
        { id: 'e7c', level: 'PRG', make: function (r) {
          var z = pick(function () { return { p: r.int(2, 5), s: r.int(1, 7), q: r.int(2, 5), u: r.int(1, 7) }; }, function (z) { return z.p !== z.q && gcd(z.p, z.s) === 1 && gcd(z.q, z.u) === 1 && z.s % z.p && z.u % z.q && z.q * z.s - z.p * z.u !== 0; });
          var b = z.q * z.s - z.p * z.u, eq = seq([M(z.p * z.q, 'x', 2), M(b, 'x')]) + '=' + z.s * z.u;
          return vs(t(eq), [rat(-z.s, z.p), rat(z.u, z.q)], {},
            'One side must be ' + t('0') + ': ' + t(seq([M(z.p * z.q, 'x', 2), M(b, 'x'), N(-z.s * z.u)]) + '=0') + '; ' + t('ac=' + (-z.p * z.q * z.s * z.u)) + ', pair ' + t(z.q * z.s) + ' and ' + t(-z.p * z.u) + '.<br>' + t('(' + z.p + 'x+' + z.s + ')(' + z.q + 'x-' + z.u + ')=0') + '<br>' + t('x=' + frac(-z.s, z.p)) + ' or ' + t('x=' + frac(z.u, z.q)),
            ['Move every term to one side first.', 'Decompose, then set each factor equal to ' + t('0') + '.'], 'solve ' + plain(eq), ['x=' + (-z.s) + ', x=' + z.u]);
        } },
        { id: 'e7d', level: 'PRG', make: function (r) {
          var z = pick(function () { return { p: r.pick([2, 3, 5]), s: r.int(1, 7), q: r.int(1, 4) }; }, function (z) { return gcd(z.p, z.s) === 1 && z.s % z.p !== 0; });
          var eq = seq([M(z.p, 'x', 3), M(z.s, 'x', 2), M(-z.p * z.q * z.q, 'x'), N(-z.s * z.q * z.q)]) + '=0';
          return vs(t(eq), [rat(-z.s, z.p), z.q, -z.q], {},
            'Four terms ⇒ grouping: ' + t('x^{2}(' + z.p + 'x+' + z.s + ')-' + z.q * z.q + '(' + z.p + 'x+' + z.s + ')=0') + '<br>' + t('(' + z.p + 'x+' + z.s + ')(x^{2}-' + z.q * z.q + ')=0') + '<br>' + t('(' + z.p + 'x+' + z.s + ')(x-' + z.q + ')(x+' + z.q + ')=0') + '<br>' + t('x=' + frac(-z.s, z.p)) + ', ' + t('x=' + z.q) + ' or ' + t('x=-' + z.q),
            ['Group two and two.', 'Factor every bracket completely — there are three roots.'], 'solve ' + plain(eq), ['x=' + frac(-z.s, z.p) + ', x=' + z.q]);
        } },
        { id: 'e7e', level: 'ADV', make: function (r) {
          var z = pick(function () { return { p: r.int(1, 6), q: r.int(2, 7) }; }, function (z) { return z.p < z.q; });
          var eq = seq([M(1, 'x', 4), M(-(z.p * z.p + z.q * z.q), 'x', 2), N(z.p * z.p * z.q * z.q)]) + '=0';
          return vs(t(eq), [z.p, -z.p, z.q, -z.q], { diag: function (A) { if (A.length === 2 && A.indexOf(z.p * z.p) >= 0 && A.indexOf(z.q * z.q) >= 0) return { code: 'dos-again', hint: 'Those are the values of ' + t('x^{2}') + '. Factor each bracket again: ' + t('x^{2}-' + z.p * z.p + '=(x-' + z.p + ')(x+' + z.p + ')') + '.' }; return null; } },
            'A trinomial in ' + t('x^{2}') + ': product ' + t(z.p * z.p * z.q * z.q) + ', sum ' + t(-(z.p * z.p + z.q * z.q)) + ': ' + t(-z.p * z.p) + ' and ' + t(-z.q * z.q) + '.<br>' + t('(x^{2}-' + z.p * z.p + ')(x^{2}-' + z.q * z.q + ')=0') + '<br>' + t('(x-' + z.p + ')(x+' + z.p + ')(x-' + z.q + ')(x+' + z.q + ')=0') + '<br>' + t('x=\\pm ' + z.p) + ' or ' + t('x=\\pm ' + z.q),
            ['Treat ' + t('x^{2}') + ' as the variable first.', 'Each bracket is a difference of squares — four roots.'], 'solve ' + plain(eq), ['x=' + z.p * z.p + ', x=' + z.q * z.q, 'x=' + z.p + ', x=' + z.q]);
        } },
        { id: 'e7f', level: 'PRG', make: function (r) {
          var z = pick(function () { return { a: r.int(2, 5), s: r.int(1, 9) }; }, function (z) { return gcd(z.a, z.s) === 1 && z.s % z.a !== 0; });
          var eq = seq([M(z.a * z.a, 'x', 2), M(-2 * z.a * z.s, 'x'), N(z.s * z.s)]) + '=0';
          return vs(t(eq), [rat(z.s, z.a)], {},
            t('\\sqrt{' + z.a * z.a + 'x^{2}}=' + z.a + 'x') + ', ' + t('\\sqrt{' + z.s * z.s + '}=' + z.s) + ', ' + t('2(' + z.a + 'x)(' + z.s + ')=' + 2 * z.a * z.s + 'x') + ': a perfect square.<br>' + t('(' + z.a + 'x-' + z.s + ')^{2}=0') + '<br>' + t(z.a + 'x-' + z.s + '=0') + '<br>' + t('x=' + frac(z.s, z.a)) + ' only',
            ['Is it a perfect square trinomial?'], 'solve ' + plain(eq), ['x=' + frac(z.s, z.a) + ', x=' + frac(-z.s, z.a)]);
        } }] },
      { num: '8', stem: 'Equations can have different numbers of solutions.', parts: [
        { id: 'e8a', level: 'EMG', make: function (r) {
          var k = r.int(0, 4), e, n, why, diag;
          if (k === 0) { var g = r.int(2, 5), p = r.int(1, 6), q = r.int(7, 9); e = g + '(x-' + p + ')(x-' + q + ')=0'; n = 2; why = 'The factor ' + t(g) + ' is never zero; ' + t('x=' + p) + ' and ' + t('x=' + q) + '.'; diag = function (v) { return v === 3 ? { code: 'count-const', hint: 'A nonzero constant factor like ' + t(g) + ' can never be ' + t('0') + ', so it gives no solution.' } : null; }; }
          else if (k === 1) { var g2 = r.pick([2, 3]), a = r.pick([2, 3]), s = r.pick([1, 5, 7]); e = g2 + 'x(' + a + 'x-' + s + ')(' + a + 'x+' + s + ')=0'; n = 3; why = t('x=0') + ', ' + t('x=' + frac(s, a)) + ' and ' + t('x=' + frac(-s, a)) + '.'; diag = function (v) { return v === 2 ? { code: 'divided-x', hint: 'The factor ' + t(g2 + 'x') + ' gives a solution too: ' + t('x=0') + '.' } : null; }; }
          else if (k === 2) { var a3 = r.int(2, 5), s3 = r.pick([1, 3, 7]); e = '(' + a3 + 'x-' + s3 + ')^{2}=0'; n = 1; why = 'Both factors are ' + t(a3 + 'x-' + s3) + ', so the only solution is ' + t('x=' + frac(s3, a3)) + '.'; diag = function (v) { return v === 2 ? { code: 'count-repeat', hint: 'The two factors are the <b>same</b>, so they give the same solution.' } : null; }; }
          else if (k === 3) { var p4 = r.int(1, 3), q4 = r.int(4, 6); e = '(x^{2}-' + p4 * p4 + ')(x^{2}-' + q4 * q4 + ')=0'; n = 4; why = 'Each bracket is a difference of squares: ' + t('x=\\pm ' + p4) + ' and ' + t('x=\\pm ' + q4) + '.'; diag = function (v) { return v === 2 ? { code: 'dos-again', hint: 'Factor each bracket again: each is a difference of squares and gives two solutions.' } : null; }; }
          else { var p5 = r.int(1, 6), q5 = r.int(1, 6); e = '(x-' + p5 + ')^{2}(x+' + q5 + ')=0'; n = 2; why = t('x=' + p5) + ' (from the repeated factor) and ' + t('x=-' + q5) + '.'; diag = function (v) { return v === 3 ? { code: 'count-repeat', hint: 'The squared factor ' + t('(x-' + p5 + ')') + ' gives only one solution.' } : null; }; }
          return KP.number('How many <b>different</b> solutions does ' + t(e) + ' have?', n, diag, why + ' Each <i>different</i> factor containing ' + t('x') + ' (after factoring completely) gives exactly one solution, so there are <b>' + n + '</b>.', ['Factor completely, then count the different factors that contain ' + t('x') + '.'], 'number of solutions ' + plain(e));
        } },
        { id: 'e8b', level: 'EMG', make: function (r) {
          var a = r.int(2, 5), s = pick(function () { return r.int(1, 9); }, function (s) { return gcd(a, s) === 1; }), e = seq([M(a * a, 'x', 2), M(-2 * a * s, 'x'), N(s * s)]) + '=0';
          return mc(r, t(e) + ' has only one solution even though it is a quadratic. Why?', [
            { html: 'It factors as ' + t('(' + a + 'x-' + s + ')(' + a + 'x-' + s + ')=0') + ': both factors give the same equation, ' + t(a + 'x-' + s + '=0') + ', so the two roots are the same number.', right: true },
            { html: 'A perfect square can’t equal zero, so one root is lost.', why: 'It can: at ' + t('x=' + frac(s, a)) + ' the square is ' + t('0') + '.' },
            { html: 'The Zero Product Law doesn’t apply to squares.', why: 'It does: ' + t('(' + a + 'x-' + s + ')^{2}') + ' is a product of two equal factors.' },
            { html: 'The other solution is ' + t('x=' + frac(-s, a)) + ', which has to be rejected.', why: 'Substitute it: ' + t('(' + a + '\\cdot ' + frac(-s, a) + '-' + s + ')^{2}=' + 4 * s * s + '\\neq 0') + '. It isn’t a solution at all.' }],
            'A perfect square trinomial factors as one linear factor repeated: ' + t('(' + a + 'x-' + s + ')(' + a + 'x-' + s + ')=0') + '. The Zero Product Law sets each factor to ' + t('0') + ', but both give the same equation, so the solution is the single value ' + t('x=' + frac(s, a)) + ' (a double root).',
            ['Factor it. What do the two factors look like?'], 'perfect square one solution');
        } },
        { id: 'e8c', level: 'EMG', make: function (r) {
          var g = r.pick([2, 3, 4, 5]);
          return mc(r, 'In ' + t(g + '(x-' + (g + 2) + ')(x-1)=0') + ', why does the factor ' + t(g) + ' give no solution?', [
            { html: 'Setting ' + t(g + '=0') + ' is false for every ' + t('x') + ': a nonzero constant is never zero.', right: true },
            { html: 'It does: it gives ' + t('x=' + g) + '.', why: 'Substitute ' + t('x=' + g) + ': ' + t(g + '(' + g + '-' + (g + 2) + ')(' + g + '-1)=' + g * (-2) * (g - 1) + '\\neq 0') + '.' },
            { html: 'It gives ' + t('x=0') + '.', why: t('x=0') + ' comes from a factor ' + t('x') + '; there is none here. Substitute ' + t('x=0') + ' to check.' },
            { html: 'You must divide it out first, or it would change the solutions.', why: 'Dividing by ' + t(g) + ' is allowed, but not needed — a constant factor never changes the roots.' }],
            'The Zero Product Law gives a root only from a factor that can equal ' + t('0') + '. Setting ' + t(g + '=0') + ' is false for every ' + t('x') + ', so it contributes no solution. The roots are ' + t('x=' + (g + 2)) + ' and ' + t('x=1') + '.',
            ['Can ' + t(g) + ' ever equal ' + t('0') + '?'], 'constant factor no solution');
        } }] },
      { num: '9', stem: 'Solve. Each of these needs rearranging before anything can be factored.',
        shared: function (r) { return pick(function () { return { r: r.pick([2, 3, 5]), s: r.int(1, 7), u: r.int(2, 7) }; }, function (z) { return gcd(z.r, z.s) === 1 && z.u !== z.s && ((z.s + z.u) % z.r === 0 || (z.s - z.u) % z.r === 0); }); },
        parts: [
          { id: 'e9a', level: 'PRG', make: function (r) {
            var z = pick(function () { var A = r.int(4, 9), B = r.int(2, 6), d = r.int(1, B - 1); return { A: A, B: B, d: d, p: A - d, q: B - d }; }, function (z) { return z.A !== z.B && z.q >= 1 && z.p >= 1 && z.p !== z.q; });
            var k = z.A * z.B - z.p * z.q, eq = '(x-' + z.p + ')(x+' + z.q + ')=' + k, bm = z.q - z.p;
            return vs(t(eq), [z.A, -z.B], { diag: function (A) { if (A.length === 2 && A.indexOf(z.p) >= 0 && A.indexOf(-z.q) >= 0) return { code: 'no-rearrange', hint: 'The Zero Product Law only works when one side is ' + t('0') + '. Expand and move ' + t(k) + ' over first.' }; return null; } },
              'Expand, then move ' + t(k) + ' over: ' + t(seq([M(1, 'x', 2), M(bm, 'x'), N(-z.p * z.q)]) + '=' + k) + '<br>' + t(seq([M(1, 'x', 2), M(bm, 'x'), N(-z.A * z.B)]) + '=0') + '<br>' + t('(x-' + z.A + ')(x+' + z.B + ')=0') + '<br>' + t('x=' + z.A) + ' or ' + t('x=-' + z.B),
              ['The right side must be ' + t('0') + ' before you use the Zero Product Law.'], 'solve ' + plain(eq), ['x=' + z.p + ', x=' + (-z.q)]);
          } },
          { id: 'e9b', level: 'PRG', make: function (r) {
            var z = pick(function () { return { m: r.pick([2, 3, 5]), s: r.int(1, 4), q: r.int(1, 6) }; }, function (z) { return gcd(z.m, z.s) === 1 && z.s % z.m !== 0; });
            var eq = seq([M(z.m, 'x', 2), N(z.s * z.q)]) + '=' + tx(M(z.m * z.q + z.s, 'x'));
            return vs(t(eq), [rat(z.s, z.m), z.q], {},
              t(seq([M(z.m, 'x', 2), M(-(z.m * z.q + z.s), 'x'), N(z.s * z.q)]) + '=0') + '; ' + t('ac=' + z.m * z.s * z.q) + ', pair ' + t(-z.s) + ' and ' + t(-z.m * z.q) + '.<br>' + t('(' + z.m + 'x-' + z.s + ')(x-' + z.q + ')=0') + '<br>' + t('x=' + frac(z.s, z.m)) + ' or ' + t('x=' + z.q),
              ['Move every term to the left side, in descending order.'], 'solve ' + plain(eq), ['x=' + z.s + ', x=' + z.q]);
          } },
          { id: 'e9c', level: 'PRG', make: function (r, sh) {
            var eq = '(' + sh.r + 'x-' + sh.s + ')^{2}=' + sh.u * sh.u, x1 = rat(sh.s + sh.u, sh.r), x2 = rat(sh.s - sh.u, sh.r);
            var e2 = seq([M(sh.r * sh.r, 'x', 2), M(-2 * sh.r * sh.s, 'x'), N(sh.s * sh.s - sh.u * sh.u)]);
            return vs(t(eq), [x1, x2], {},
              'Expand, then move ' + t(sh.u * sh.u) + ' over: ' + t(e2 + '=0') + '<br>' + t('(' + sh.r + 'x-' + (sh.s + sh.u) + ')(' + sh.r + 'x' + sg(sh.u - sh.s) + ')=0') + ' (or use ' + t(sh.r + 'x-' + sh.s + '=\\pm ' + sh.u) + ')<br>' + t('x=' + frac(sh.s + sh.u, sh.r)) + ' or ' + t('x=' + frac(sh.s - sh.u, sh.r)),
              ['Expand the square and move ' + t(sh.u * sh.u) + ' to the left side.', 'Or: ' + t(sh.r + 'x-' + sh.s) + ' must be ' + t(sh.u) + ' or ' + t(-sh.u) + '.'], 'solve ' + plain(eq), ['x=' + frac(sh.s + sh.u, sh.r)]);
          } },
          { id: 'e9d', level: 'PRG', make: function (r) {
            var z = pick(function () { return { a: r.pick([2, 3]), s: r.int(1, 7) }; }, function (z) { return gcd(z.a, z.s) === 1; });
            var eq = tx(M(z.a * z.a, 'x', 3)) + '=' + tx(M(z.s * z.s, 'x'));
            return vs(t(eq), [0, rat(z.s, z.a), rat(-z.s, z.a)], { diag: function (A) { if (A.indexOf(0) < 0) return { code: 'divided-x', hint: 'Don’t divide by ' + t('x') + ': move everything to one side and take out ' + t('x') + '. It gives ' + t('x=0') + '.' }; return null; } },
              t(seq([M(z.a * z.a, 'x', 3), M(-z.s * z.s, 'x')]) + '=0') + ' (do not divide by ' + t('x') + ')<br>' + t('x(' + z.a * z.a + 'x^{2}-' + z.s * z.s + ')=0') + '<br>' + t('x(' + z.a + 'x-' + z.s + ')(' + z.a + 'x+' + z.s + ')=0') + '<br>' + t('x=0') + ', ' + t('x=' + frac(z.s, z.a)) + ' or ' + t('x=' + frac(-z.s, z.a)),
              ['Move everything to the left side and take out the common factor ' + t('x') + '.'], 'solve ' + plain(eq), ['x=' + frac(z.s, z.a) + ', x=' + frac(-z.s, z.a)]);
          } },
          { id: 'e9e', level: 'PRG', make: function (r) {
            var z = pick(function () { return { A: r.int(3, 9), B: r.int(1, 8), a: 0 }; }, function (z) { return z.A > z.B; }); z.a = z.A - z.B;
            var c = z.A * z.B, eq = 'x(' + seq([M(2, 'x'), N(-z.a)]) + ')=x^{2}+' + c;
            return vs(t(eq), [z.A, -z.B], {},
              t(seq([M(2, 'x', 2), M(-z.a, 'x')]) + '=x^{2}+' + c) + '<br>' + t(seq([M(1, 'x', 2), M(-z.a, 'x'), N(-c)]) + '=0') + '<br>Product ' + t(-c) + ', sum ' + t(-z.a) + ': ' + t(-z.A) + ' and ' + t(z.B) + '.<br>' + t('(x-' + z.A + ')(x+' + z.B + ')=0') + '<br>' + t('x=' + z.A) + ' or ' + t('x=-' + z.B),
              ['Expand the left side, then move every term to the left.'], 'solve ' + plain(eq), ['x=' + (-z.A) + ', x=' + z.B]);
          } },
          { id: 'e9f', level: 'PRG', make: function (r) {
            var z = pick(function () { return { A: r.pick([6, 8, 10, 12, 14, 16]), B: r.pick([2, 4, 6]) }; }, function (z) { return z.A > z.B && (z.A - z.B) % 4 === 0; });
            var bq = (z.A - z.B) / 4, cq = z.A * z.B / 4, eq = '\\frac{1}{4}x^{2}' + (bq === 1 ? '-x' : '-' + bq + 'x') + '-' + cq + '=0';
            return vs(t(eq), [z.A, -z.B], {},
              'Multiply every term by ' + t('4') + ' to clear the fraction: ' + t(seq([M(1, 'x', 2), M(-(z.A - z.B), 'x'), N(-z.A * z.B)]) + '=0') + '<br>Product ' + t(-z.A * z.B) + ', sum ' + t(-(z.A - z.B)) + ': ' + t(-z.A) + ' and ' + t(z.B) + '.<br>' + t('(x-' + z.A + ')(x+' + z.B + ')=0') + '<br>' + t('x=' + z.A) + ' or ' + t('x=-' + z.B),
              ['Multiply both sides by ' + t('4') + ' first.'], 'solve ' + plain(eq), ['x=' + (-z.A) + ', x=' + z.B]);
          } },
          { id: 'e9g', sub: 'g', level: 'PRG', make: function (r, sh) {
            var a = sh.s + sh.u, b = sh.s - sh.u, Ft = complete([lin(sh.r, 'x', -a), lin(sh.r, 'x', -b)]);
            return fac('Part (c) can also be solved as a difference of squares: ' + t('(' + sh.r + 'x-' + sh.s + ')^{2}-' + sh.u + '^{2}=0') + '. Factor ' + t('(' + sh.r + 'x-' + sh.s + ')^{2}-' + sh.u + '^{2}') + ' completely.', Ft,
              [{ is: FT(null, [lin(sh.r, 'x', -sh.s - sh.u * sh.u), lin(sh.r, 'x', -sh.s + sh.u * sh.u)]), code: 'value', hint: 'Use ' + t('B=' + sh.u) + ', not ' + t(sh.u * sh.u) + ': ' + t('A^{2}-B^{2}=(A-B)(A+B)') + '.' }],
              t('[(' + sh.r + 'x-' + sh.s + ')-' + sh.u + '][(' + sh.r + 'x-' + sh.s + ')+' + sh.u + ']=(' + seq(lin(sh.r, 'x', -a)) + ')(' + seq(lin(sh.r, 'x', -b)) + ')') + (Ft.tex !== '(' + seq(lin(sh.r, 'x', -a)) + ')(' + seq(lin(sh.r, 'x', -b)) + ')' ? '<br>Take out the common factor: ' + t('=' + Ft.tex) : '') + '<br>Setting each factor to ' + t('0') + ' gives the same pair of roots as part (c). ✓',
              ['Let ' + t('A=' + sh.r + 'x-' + sh.s) + ' and ' + t('B=' + sh.u) + ' in ' + t('A^{2}-B^{2}=(A-B)(A+B)') + '.', 'Check the brackets for a common factor.'], 'DoS route (' + sh.r + 'x−' + sh.s + ')²−' + sh.u * sh.u);
          } }] },
      { num: '10', section: 'Extra practice D — Geometry and applications', stem: function (sh) { return 'The area of a rectangle is ' + t('A=' + tx(sh.T) + '') + ' square centimetres, and both side lengths are binomials with integer coefficients.'; },
        shared: function (r) {
          var z = pick(function () { return { n: r.int(2, 3), s: r.int(1, 5), m: r.int(3, 5), u: r.int(2, 7), x0: r.int(1, 3) }; }, function (z) { return z.m > z.n && z.u > z.s && gcd(z.n, z.s) === 1 && gcd(z.m, z.u) === 1; });
          z.A = lin(z.n, 'x', z.s); z.B = lin(z.m, 'x', z.u); z.T = P.mul(sum(z.A), sum(z.B)); z.A0 = (z.n * z.x0 + z.s) * (z.m * z.x0 + z.u); z.K = z.m * z.n * z.x0 + z.n * z.u + z.m * z.s; return z;
        },
        parts: [
          { id: 'e10a', level: 'PRG', make: function (r, sh) {
            var Ft = FT(null, [sh.A, sh.B]), ac = sh.m * sh.n * sh.s * sh.u;
            return fac('Factor ' + t('A') + ' to recover the two side lengths.', Ft, [{ is: FT(null, [lin(sh.n, 'x', sh.u), lin(sh.m, 'x', sh.s)]), code: 'swap-const', hint: 'The constants are in the wrong brackets — check the middle term.' }],
              'Decomposition: ' + t('ac=' + ac) + '; pair ' + t(sh.n * sh.u) + ' and ' + t(sh.m * sh.s) + '.<br>' + t(tx(sh.T) + '=' + Ft.tex) + '<br>Side lengths: ' + t(seq(sh.A)) + ' cm and ' + t(seq(sh.B)) + ' cm.',
              ['Find two numbers that multiply to ' + t('ac=' + ac) + ' and add to ' + t(sh.n * sh.u + sh.m * sh.s) + '.'], 'factor area ' + plain(tx(sh.T)));
          } },
          { id: 'e10b', level: 'EMG', make: function (r, sh) {
            var d = sum([M(sh.m - sh.n, 'x'), N(sh.u - sh.s)]), Lt = seq(sh.B), St = seq(sh.A);
            return mc(r, 'For ' + t('x>0') + ', which of the two sides is longer?', [
              { html: t(Lt) + ', because ' + t('(' + Lt + ')-(' + St + ')=' + tx(d)) + ', which is positive for every ' + t('x>0') + '.', right: true },
              { html: t(St) + ', because it has the smaller coefficient.', why: 'Subtract the sides: ' + t('(' + Lt + ')-(' + St + ')=' + tx(d)) + '. Is that positive or negative when ' + t('x>0') + '?' },
              { html: 'It depends on the value of ' + t('x') + '.', why: 'The difference ' + t(tx(d)) + ' is positive for <b>every</b> ' + t('x>0') + '.' },
              { html: 'They are equal when ' + t('x=1') + '.', why: 'At ' + t('x=1') + ' they are ' + t(sh.n + sh.s) + ' and ' + t(sh.m + sh.u) + '.' }],
              'Subtract the sides: ' + t('(' + Lt + ')-(' + St + ')=' + tx(d)) + '. For ' + t('x>0') + ' this is positive, so ' + t(Lt) + ' is always the longer side.',
              ['Subtract one side from the other and look at the sign.'], 'longer side');
          } },
          { id: 'e10c', level: 'ADV', make: function (r, sh) {
            var C = sh.s * sh.u - sh.A0, eq2 = seq([M(sh.m * sh.n, 'x', 2), M(sh.n * sh.u + sh.m * sh.s, 'x'), N(C)]);
            return vs('Solve ' + t(tx(sh.T) + '=' + sh.A0) + ' to find when the area is ' + t(sh.A0 + '\\text{ cm}^{2}') + '. Give <b>both</b> roots of the equation.', [sh.x0, rat(-sh.K, sh.m * sh.n)], {},
              t(eq2 + '=0') + '<br>' + t('ac=' + sh.m * sh.n * C) + '; pair ' + t(sh.K) + ' and ' + t(-sh.m * sh.n * sh.x0) + '.<br>' + t('(x-' + sh.x0 + ')(' + sh.m * sh.n + 'x+' + sh.K + ')=0') + '<br>' + t('x=' + sh.x0) + ' or ' + t('x=' + frac(-sh.K, sh.m * sh.n)) + '<br>Reject ' + t('x=' + frac(-sh.K, sh.m * sh.n)) + ': it makes both side lengths negative.',
              ['Move ' + t(sh.A0) + ' to the left side first, then decompose.'], 'area = ' + sh.A0, ['x=' + sh.x0]);
          } },
          { id: 'e10d', level: 'EMG', make: function (r, sh) {
            var a = sh.n * sh.x0 + sh.s, b = sh.m * sh.x0 + sh.u, per = 2 * (a + b);
            var p = KP.fields('Using that value of ' + t('x') + ', state the two side lengths and the perimeter of the rectangle.', [numBox('Shorter side (cm):'), numBox('Longer side (cm):'), numBox('Perimeter (cm):')],
              [K.number(a), K.number(b), K.number(per, function (v) { return v === a + b ? { code: 'half-perim', hint: 'That is half the perimeter: there are two of each side.' } : v === a * b ? { code: 'area-not-perim', hint: 'That is the area.' } : null; })],
              [String(a), String(b), String(per)], t(a) + ' cm, ' + t(b) + ' cm, perimeter ' + t(per) + ' cm',
              t(seq(sh.A) + '=' + sh.n + '(' + sh.x0 + ')+' + sh.s + '=' + a) + ' cm; ' + t(seq(sh.B) + '=' + sh.m + '(' + sh.x0 + ')+' + sh.u + '=' + b) + ' cm. Check: ' + t(a + '\\times ' + b + '=' + sh.A0) + ' ✓<br>Perimeter ' + t('=2(' + a + '+' + b + ')=' + per) + ' cm.',
              ['Substitute ' + t('x=' + sh.x0) + ' into each side length.'], 'sides and perimeter');
            p.bad = [[String(a), String(b), String(a + b)]];
            return p;
          } }] },
      { num: '11', stem: function (sh) { return 'A square metal plate of side ' + t('(2x+' + sh.b + ')') + ' cm has a square hole of side ' + t('(x-' + sh.c + ')') + ' cm cut out of its centre.'; },
        shared: function (r) { var z = pick(function () { return { b: r.int(2, 6), c: r.int(1, 4) }; }, function (z) { return z.b > z.c && (z.b - z.c) % 3 !== 0; }); z.x0 = z.c + r.int(1, 3); z.A0 = (2 * z.x0 + z.b) * (2 * z.x0 + z.b) - (z.x0 - z.c) * (z.x0 - z.c); return z; },
        parts: [
          { id: 'e11a', level: 'ADV', make: function (r, sh) {
            var A = lin(1, 'x', sh.b + sh.c), B = lin(3, 'x', sh.b - sh.c), Ft = FT(null, [A, B]);
            return fac('Write the remaining area as a difference of two squares, then factor it completely.', Ft, [
              { is: FT(null, [lin(1, 'x', sh.b - sh.c), B]), code: 'minus-dist', hint: 'Subtracting ' + t('(x-' + sh.c + ')') + ' changes both signs: ' + t('-(x-' + sh.c + ')=-x+' + sh.c) + '.' }],
              'Area ' + t('=(2x+' + sh.b + ')^{2}-(x-' + sh.c + ')^{2}') + '<br>' + t('=[(2x+' + sh.b + ')-(x-' + sh.c + ')][(2x+' + sh.b + ')+(x-' + sh.c + ')]') + '<br>' + t('=(2x+' + sh.b + '-x+' + sh.c + ')(2x+' + sh.b + '+x-' + sh.c + ')') + '<br>' + t('=' + Ft.tex),
              ['Area left = plate − hole = ' + t('A^{2}-B^{2}') + ' with ' + t('A=2x+' + sh.b) + ', ' + t('B=x-' + sh.c) + '.', 'Be careful with the minus sign in front of ' + t('(x-' + sh.c + ')') + '.'], 'plate DoS');
          } },
          { id: 'e11b', level: 'EMG', make: function (r, sh) {
            var T = P.sub(P.pow(sum(lin(2, 'x', sh.b)), 2), P.pow(sum(lin(1, 'x', -sh.c)), 2));
            return polyPart('Expand ' + t('(2x+' + sh.b + ')^{2}-(x-' + sh.c + ')^{2}') + ' (it should agree with your factored form expanded).', T, [
              { is: P.add(M(3, 'x', 2), N(sh.b * sh.b - sh.c * sh.c)), code: 'no-middle', hint: 'Squaring a binomial gives a middle term: ' + t('(2x+' + sh.b + ')^{2}=4x^{2}+' + 4 * sh.b + 'x+' + sh.b * sh.b) + '.' },
              { is: P.sub(P.pow(sum(lin(2, 'x', sh.b)), 2), P.add(M(1, 'x', 2), M(-2 * sh.c, 'x'), N(-sh.c * sh.c))), code: 'minus-dist', hint: 'Subtract the <b>whole</b> square: ' + t('-(x^{2}-' + 2 * sh.c + 'x+' + sh.c * sh.c + ')') + ' changes every sign.' }],
              t('(4x^{2}+' + 4 * sh.b + 'x+' + sh.b * sh.b + ')-(x^{2}' + (sh.c === 0 ? '' : '-' + 2 * sh.c + 'x') + '+' + sh.c * sh.c + ')=' + tx(T)) + '<br>' + t('(x+' + (sh.b + sh.c) + ')(3x+' + (sh.b - sh.c) + ')=' + tx(T)) + ' as well. ✓',
              ['Expand each square, then subtract the whole second square.'], 'plate expanded');
          } },
          { id: 'e11c', level: 'PRG', make: function (r, sh) {
            var x0 = sh.x0, pl = 2 * x0 + sh.b, ho = x0 - sh.c, other = -(3 * x0 + 2 * (2 * sh.b + sh.c)) / 3; // the rejected root
            var p = KP.fields('The remaining area is ' + t(sh.A0 + '\\text{ cm}^{2}') + '. Determine ' + t('x') + ', the side of the plate and the side of the hole.', [numBox(t('x') + ' =', 'x'), numBox('Plate side (cm):'), numBox('Hole side (cm):')],
              [K.number(x0, function (v) { return Math.abs(v - other) < 1e-9 ? { code: 'other-root', hint: 'That root is negative — a length can’t be.' } : null; }), K.number(pl), K.number(ho)],
              [String(x0), String(pl), String(ho)], t('x=' + x0) + '; plate ' + t(pl) + ' cm, hole ' + t(ho) + ' cm',
              t(tx(P.sub(P.pow(sum(lin(2, 'x', sh.b)), 2), P.pow(sum(lin(1, 'x', -sh.c)), 2))) + '=' + sh.A0) + '<br>' + t(tx(P.add(P.sub(P.pow(sum(lin(2, 'x', sh.b)), 2), P.pow(sum(lin(1, 'x', -sh.c)), 2)), N(-sh.A0))) + '=0') + '<br>' + t('(x-' + x0 + ')(3x' + sg(3 * x0 + 2 * (2 * sh.b + sh.c)) + ')=0') + ', so ' + t('x=' + x0) + ' (the other root is negative).<br>Plate: ' + t('2(' + x0 + ')+' + sh.b + '=' + pl) + ' cm; hole: ' + t(x0 + '-' + sh.c + '=' + ho) + ' cm. Check: ' + t(pl * pl + '-' + ho * ho + '=' + sh.A0) + ' ✓',
              ['Set your expanded area equal to ' + t(sh.A0) + ', move it over, and factor.'], 'plate area ' + sh.A0);
            p.bad = [[String(x0), String(pl), String(ho + 1)]];
            return p;
          } },
          { id: 'e11d', level: 'EMG', make: function (r, sh) {
            return mc(r, 'Why must ' + t('x') + ' be greater than ' + t(sh.c) + ' here?', [
              { html: 'The hole has side ' + t('x-' + sh.c) + ', and a length must be positive, so ' + t('x>' + sh.c) + '. That alone rules out the negative root.', right: true },
              { html: 'Because the plate side ' + t('2x+' + sh.b) + ' must be positive.', why: 'That only gives ' + t('x>' + frac(-sh.b, 2)) + ' — a weaker condition. Look at the hole.' },
              { html: 'Because the remaining area is ' + t(sh.A0) + '.', why: 'The area condition gives the equation, not the restriction. Which side length could become zero or negative?' },
              { html: 'Because ' + t('x') + ' must be a whole number.', why: 'Lengths don’t have to be whole numbers. Think about the hole’s side ' + t('x-' + sh.c) + '.' }],
              'The hole has side ' + t('x-' + sh.c) + ', and a length must be positive: ' + t('x-' + sh.c + '>0') + ', i.e. ' + t('x>' + sh.c) + '. The second root of the equation is negative, so its sign alone rules it out.',
              ['Which length in the problem could be zero or negative?'], 'why x > ' + sh.c);
          } }] },
      { num: '12', stem: function (sh) { return 'A rectangular prism has volume ' + t('V=' + tx(sh.T)) + ' cubic centimetres, and each of its three dimensions is one of the factors of ' + t('V') + '.'; },
        shared: function (r) { var z = pick(function () { return { g: r.int(2, 5), p: r.int(1, 5), q: r.int(2, 6) }; }, function (z) { return z.p < z.q; }); z.T = FX.product([M(z.g, 'x'), sum(lin(1, 'x', -z.p)), sum(lin(1, 'x', -z.q))]); return z; },
        parts: [
          { id: 'e12a', sub: 'a', level: 'PRG', make: function (r, sh) {
            var Ft = FT(M(sh.g, 'x'), [lin(1, 'x', -sh.p), lin(1, 'x', -sh.q)]);
            return fac('Factor ' + t('V') + ' completely to find the three dimensions.', Ft, [{ is: FT(M(sh.g, 'x'), [lin(1, 'x', sh.p), lin(1, 'x', sh.q)]), code: 'sign-swap', hint: 'Your pair adds to ' + t(sh.p + sh.q) + '; it should add to ' + t(-(sh.p + sh.q)) + '.' }],
              'GCF ' + t('=' + sh.g + 'x') + ': ' + t(sh.g + 'x(x^{2}-' + (sh.p + sh.q) + 'x+' + sh.p * sh.q + ')') + '<br>Product ' + t(sh.p * sh.q) + ', sum ' + t(-(sh.p + sh.q)) + ': ' + t(-sh.p) + ' and ' + t(-sh.q) + '.<br>' + t('V=' + Ft.tex) + '<br>Dimensions: ' + t(sh.g + 'x') + ', ' + t('x-' + sh.p) + ' and ' + t('x-' + sh.q) + ' cm.',
              ['Take out the common factor first.'], 'factor V');
          } },
          { id: 'e12b', sub: 'b i', level: 'EMG', make: function (r, sh) {
            return vs('Solve ' + t('V=0') + '.', [0, sh.p, sh.q], {}, t(sh.g + 'x(x-' + sh.p + ')(x-' + sh.q + ')=0') + '<br>' + t('x=0') + ', ' + t('x=' + sh.p) + ' or ' + t('x=' + sh.q),
              ['Use the factored form: set each factor equal to ' + t('0') + '.'], 'solve V=0', ['x=' + sh.p + ', x=' + sh.q]);
          } },
          { id: 'e12c', sub: 'b ii', level: 'EMG', make: function (r, sh) {
            return mc(r, 'Why can none of the roots of ' + t('V=0') + ' be the value of ' + t('x') + ' for a real prism?', [
              { html: 'Each root makes one dimension exactly ' + t('0') + ', so the box would be flat with no volume.', right: true },
              { html: 'The roots are the three dimensions of the box, not values of ' + t('x') + '.', why: 'The dimensions are ' + t(sh.g + 'x') + ', ' + t('x-' + sh.p) + ' and ' + t('x-' + sh.q) + '. The roots are values of ' + t('x') + '.' },
              { html: 'Only ' + t('x=0') + ' is impossible; the other roots are possible sizes.', why: 'At ' + t('x=' + sh.p) + ', the dimension ' + t('x-' + sh.p) + ' is ' + t('0') + '.' },
              { html: 'They are the values where the volume is greatest.', why: 'At the roots the volume is ' + t('0') + ' — the smallest it can be.' }],
              'Each root makes one dimension (' + t(sh.g + 'x') + ', ' + t('x-' + sh.p) + ' or ' + t('x-' + sh.q) + ') exactly ' + t('0') + ', so the box flattens and has no volume. A real prism needs every dimension positive.',
              ['Substitute each root into the three dimensions.'], 'meaning of roots of V');
          } },
          { id: 'e12d', sub: 'c', level: 'PRG', make: function (r, sh) {
            var x = sh.q + 1, V = sh.g * x * (x - sh.p) * (x - sh.q);
            var p = KP.fields('Determine the smallest whole-number value of ' + t('x') + ' for which the prism actually exists, and evaluate ' + t('V') + ' there.', [numBox(t('x') + ' =', 'x'), numBox(t('V') + ' (cm³) =', 'V')],
              [K.number(x, function (v) { return v === sh.q ? { code: 'bad-dim', hint: 'At ' + t('x=' + sh.q) + ' the dimension ' + t('x-' + sh.q) + ' is ' + t('0') + '. Every dimension must be positive.' } : v < sh.q ? { code: 'bad-dim', hint: 'At ' + t('x=' + v) + ' the dimension ' + t('x-' + sh.q) + ' is not positive.' } : null; }), K.number(V)],
              [String(x), String(V)], t('x=' + x) + ', ' + t('V=' + F(V)) + ' cm³',
              'Every dimension positive: ' + t(sh.g + 'x>0') + ', ' + t('x-' + sh.p + '>0') + ', ' + t('x-' + sh.q + '>0') + '. The strictest is ' + t('x>' + sh.q) + ', so ' + t('x=' + x) + '.<br>' + t('V=' + sh.g + '(' + x + ')(' + (x - sh.p) + ')(' + (x - sh.q) + ')=' + F(V)) + ' cm³',
              ['Which dimension is the last to become positive?'], 'smallest x for prism');
            p.bad = [[String(sh.q), '0']];
            return p;
          } }] },
      { num: '13', stem: function (sh) { return 'A club’s profit, in dollars, from selling ' + t('x') + ' tickets to an event is modelled by ' + t('P=' + tx(sh.T)) + '.'; },
        shared: function (r) { var z = { g: r.pick([2, 2, 3, 4]), p: r.int(3, 8), d: r.int(3, 6), j: r.int(1, 5) }; z.q = z.p + 2 * z.d; z.h = z.p + z.d; z.M = z.g * z.d * z.d; z.T = FX.product([N(-z.g), sum(lin(1, 'x', -z.p)), sum(lin(1, 'x', -z.q))]); return z; },
        parts: [
          { id: 'e13a', level: 'PRG', make: function (r, sh) {
            var Ft = FT(N(-sh.g), [lin(1, 'x', -sh.p), lin(1, 'x', -sh.q)]);
            return fac('Factor ' + t('P') + ' completely. Take out the negative common factor so the bracket opens positively.', Ft, [{ is: FT(N(-sh.g), [lin(1, 'x', sh.p), lin(1, 'x', sh.q)]), code: 'sign-swap', hint: 'After taking out ' + t(-sh.g) + ' the bracket is ' + t('x^{2}-' + (sh.p + sh.q) + 'x+' + sh.p * sh.q) + ': the pair adds to ' + t(-(sh.p + sh.q)) + '.' }],
              'Take out ' + t(-sh.g) + ': ' + t('P=-' + sh.g + '(x^{2}-' + (sh.p + sh.q) + 'x+' + sh.p * sh.q + ')') + '<br>Product ' + t(sh.p * sh.q) + ', sum ' + t(-(sh.p + sh.q)) + ': ' + t(-sh.p) + ' and ' + t(-sh.q) + '.<br>' + t('P=' + Ft.tex),
              ['Take out ' + t(-sh.g) + ' — every sign in the bracket changes.'], 'factor profit');
          } },
          { id: 'e13b', level: 'EMG', make: function (r, sh) {
            return vs('Solve ' + t('P=0') + ' (the break-even points).', [sh.p, sh.q], {}, t('-' + sh.g + '(x-' + sh.p + ')(x-' + sh.q + ')=0') + '<br>' + t('-' + sh.g + '\\neq 0') + ', so ' + t('x=' + sh.p) + ' or ' + t('x=' + sh.q) + '. Selling ' + t(sh.p) + ' or ' + t(sh.q) + ' tickets gives a profit of exactly ' + t('\\$0') + '.',
              ['Use your factored form.'], 'break-even', ['x=' + (-sh.p) + ', x=' + (-sh.q)]);
          } },
          { id: 'e13c', level: 'EMG', make: function (r, sh) {
            var p = KP.fields('For which whole-number values of ' + t('x') + ' does the club make a profit? Give the smallest and the largest.', [numBox('Smallest:'), numBox('Largest:')],
              [K.number(sh.p + 1, function (v) { return v === sh.p ? { code: 'value', hint: 'At ' + t('x=' + sh.p) + ' the profit is exactly ' + t('\\$0') + ' — no profit.' } : null; }), K.number(sh.q - 1, function (v) { return v === sh.q ? { code: 'value', hint: 'At ' + t('x=' + sh.q) + ' the profit is exactly ' + t('\\$0') + '.' } : null; })],
              [String(sh.p + 1), String(sh.q - 1)], t('x=' + (sh.p + 1) + ',' + (sh.p + 2) + ',\\ldots,' + (sh.q - 1)),
              'Test ' + t('x=' + sh.h) + ' (between the roots): ' + t('P=-' + sh.g + '(' + sh.d + ')(-' + sh.d + ')=' + sh.M + '>0') + ' ✓. Test ' + t('x=' + (sh.q + 1)) + ' (outside): ' + t('P=-' + sh.g + '(' + (sh.q + 1 - sh.p) + ')(1)<0') + '.<br>The club profits strictly between the roots: ' + t('x=' + (sh.p + 1) + ',\\ldots,' + (sh.q - 1)) + '.',
              ['Test a value between the roots and one outside them.'], 'profit interval');
            p.bad = [[String(sh.p), String(sh.q)]];
            return p;
          } },
          { id: 'e13d', level: 'ADV', make: function (r, sh) {
            return KP.number('Determine the number of tickets for which the profit is exactly ' + t('\\$' + sh.M) + '. (The equation you get is a perfect square trinomial.)', sh.h, null,
              t(tx(sh.T) + '=' + sh.M) + '<br>' + t(tx(P.add(sh.T, N(-sh.M))) + '=0') + '<br>' + t('-' + sh.g + '(x^{2}-' + 2 * sh.h + 'x+' + sh.h * sh.h + ')=0') + '<br>' + t('-' + sh.g + '(x-' + sh.h + ')^{2}=0') + ', so ' + t('x=' + sh.h) + ' tickets.',
              ['Move ' + t(sh.M) + ' to the left side and take out ' + t(-sh.g) + '.', 'The bracket is a perfect square.'], 'profit = ' + sh.M);
          } },
          { id: 'e13e', level: 'EMG', make: function (r, sh) {
            var X = sh.M + sh.g * sh.j;
            return mc(r, 'Part (d) has only one answer, while ' + t('P=0') + ' had two. Why can no number of tickets give a profit of ' + t('\\$' + X) + '?', [
              { html: t('\\$' + sh.M) + ' is reached at only one value of ' + t('x') + ' — it is the greatest profit possible, so ' + t('\\$' + X) + ' is never reached.', right: true },
              { html: 'Because ' + t(X) + ' isn’t a multiple of the number of tickets.', why: 'Profit doesn’t have to divide evenly by anything. Try solving ' + t('P=' + X) + ': ' + t('x^{2}-' + 2 * sh.h + 'x+' + (sh.h * sh.h + sh.j) + '=(x-' + sh.h + ')^{2}+' + sh.j) + ', which is never ' + t('0') + '.' },
              { html: 'Because the answer would be a fraction of a ticket.', why: 'It’s worse than a fraction: ' + t('(x-' + sh.h + ')^{2}+' + sh.j + '=0') + ' has no solution at all.' },
              { html: 'Because the equation would have two solutions, and we can only pick one.', why: 'Solve it: ' + t('(x-' + sh.h + ')^{2}+' + sh.j + '=0') + ' has <b>no</b> solutions.' }],
              'A repeated factor means ' + t('\\$' + sh.M) + ' is reached at exactly one value of ' + t('x') + ' — it is the <b>greatest profit possible</b>, at ' + t('x=' + sh.h) + '.<br>For ' + t('\\$' + X) + ': ' + t('-' + sh.g + '(x^{2}-' + 2 * sh.h + 'x+' + (sh.h * sh.h + sh.j) + ')=0') + ', and ' + t('x^{2}-' + 2 * sh.h + 'x+' + (sh.h * sh.h + sh.j) + '=(x-' + sh.h + ')^{2}+' + sh.j) + ' is at least ' + t(sh.j) + ', never ' + t('0') + '.',
              ['What does a perfect square (one repeated root) tell you about ' + t('\\$' + sh.M) + '?'], 'no x gives $' + X);
          } }] },
      { num: '14', section: 'Extra practice E — Reasoning and error analysis', stem: 'Decide whether each statement is <b>true</b> or <b>false</b>.', parts: [
        { id: 'e14a', level: 'EMG', make: function (r) {
          var c = r.pick([20, 12, 18, 28, 30]), S = sumsOf(c), mx = Math.max.apply(null, S), cand = []; for (var k = 1; k < mx; k++) if (S.indexOf(k) < 0) cand.push(k); var b = r.pick(cand);
          return KP.tf(r, 'Every quadratic trinomial can be factored over the integers.', false, 'Try ' + t('x^{2}+' + lc(b) + 'x+' + c) + ': the factor pairs of ' + t(c) + ' have sums ' + t(S.map(function (s) { return '\\pm' + s; }).join(',\\ ')) + ' — never ' + t(b) + '.',
            '<b>False.</b> Counterexample: ' + t('x^{2}+' + lc(b) + 'x+' + c) + '. The factor pairs of ' + t(c) + ' have sums ' + t(S.map(function (s) { return '\\pm' + s; }).join(',\\ ')) + ' — never ' + t(b) + '.', ['Can you find a trinomial where no pair works?'], 'TF every trinomial factors');
        } },
        { id: 'e14b', level: 'LIM', make: function (r) {
          return KP.tf(r, 'If a product of two factors equals ' + t('0') + ', then at least one of those factors is ' + t('0') + '.', true, 'This is the Zero Product Law: a product can be ' + t('0') + ' only if a factor is ' + t('0') + '.',
            '<b>True.</b> This is the Zero Product Law: a product can equal ' + t('0') + ' only if at least one of its factors is ' + t('0') + '.', ['Try to find two nonzero numbers whose product is ' + t('0') + '.'], 'TF zero product law');
        } },
        { id: 'e14c', level: 'EMG', make: function (r) {
          var n = r.pick([12, 18, 20, 24, 30, 36]), pq = pairsOf(n).filter(function (q) { return q[0] > 1; }), q = r.pick(pq);
          return KP.tf(r, 'If a product of two factors equals ' + t(n) + ', then at least one of those factors is ' + t(n) + '.', false, 'Counterexample: ' + t(q[0] + '\\times ' + q[1] + '=' + n) + ', and neither factor is ' + t(n) + '.',
            '<b>False.</b> Counterexample: ' + t(q[0] + '\\times ' + q[1] + '=' + n) + ', and neither factor is ' + t(n) + '. Only ' + t('0') + ' has this special property.', ['Think of two numbers that multiply to ' + t(n) + '.'], 'TF product equals ' + n);
        } },
        { id: 'e14d', level: 'PRG', make: function (r) {
          var k = r.pick([2, 3, 4, 5]), m = r.int(1, 4);
          return KP.tf(r, 'An expression made of one square <b>plus</b> another square can never be factored at all.', false, 'Counterexample: ' + t(k * k + 'x^{2}+' + k * k * m * m + '=(' + k + 'x)^{2}+' + k * m + '^{2}') + ' is a sum of squares, but it has a common factor: ' + t(k * k + '(x^{2}+' + m * m + ')') + '.',
            '<b>False.</b> ' + t(k * k + 'x^{2}+' + k * k * m * m + '=(' + k + 'x)^{2}+' + k * m + '^{2}') + ' is a sum of squares, yet ' + t(k * k + 'x^{2}+' + k * k * m * m + '=' + k * k + '(x^{2}+' + m * m + ')') + '. What is true is that the bracket ' + t('x^{2}+' + m * m) + ' does not factor.', ['Could a sum of squares have a common factor?'], 'TF sum of squares never factors');
        } },
        { id: 'e14e', level: 'EMG', make: function (r) {
          var a = r.int(2, 9);
          return KP.tf(r, t('(x-' + a + ')(x+' + a + ')') + ' and ' + t('(' + a + '-x)(' + a + '+x)') + ' are factorings of the same polynomial.', false, 'Expand both: ' + t('(x-' + a + ')(x+' + a + ')=x^{2}-' + a * a) + ' but ' + t('(' + a + '-x)(' + a + '+x)=' + a * a + '-x^{2}') + '.',
            '<b>False.</b> ' + t('(x-' + a + ')(x+' + a + ')=x^{2}-' + a * a) + ', but ' + t('(' + a + '-x)(' + a + '+x)=' + a * a + '-x^{2}=-(x^{2}-' + a * a + ')') + '. They are opposites, not the same polynomial.', ['Expand both products.'], 'TF (x−a)(x+a) vs (a−x)(a+x)');
        } },
        { id: 'e14f', level: 'EMG', make: function (r) {
          var a = r.int(2, 5), s = pick(function () { return r.int(1, 9); }, function (s) { return gcd(a, s) === 1; });
          return KP.tf(r, 'A quadratic equation always has exactly two different solutions.', false, 'Counterexample: ' + t(seq([M(a * a, 'x', 2), M(-2 * a * s, 'x'), N(s * s)]) + '=0') + ' is ' + t('(' + a + 'x-' + s + ')^{2}=0') + ', with only one solution.',
            '<b>False.</b> Counterexample: ' + t(seq([M(a * a, 'x', 2), M(-2 * a * s, 'x'), N(s * s)]) + '=0') + ' is ' + t('(' + a + 'x-' + s + ')^{2}=0') + ', with only one solution, ' + t('x=' + frac(s, a)) + '.', ['Think about a perfect square trinomial set equal to ' + t('0') + '.'], 'TF quadratic two solutions');
        } }] },
      { num: '15', stem: function (sh) { return 'Asked to solve ' + t('x^{2}+' + lc(sh.b) + 'x=' + sh.N) + ', a student wrote ' + t('x(x+' + sh.b + ')=' + sh.N) + ', so ' + t('x=' + sh.N) + ' or ' + t('x+' + sh.b + '=' + sh.N) + ', giving ' + t('x=' + sh.N) + ' or ' + t('x=' + (sh.N - sh.b)) + '.'; },
        shared: function (r) { var z = pick(function () { return { p: r.int(2, 6), q: r.int(3, 10) }; }, function (z) { return z.q > z.p && z.q - z.p <= 7; }); z.b = z.q - z.p; z.N = z.p * z.q; return z; },
        parts: [
          { id: 'e15a', level: 'BEG', make: function (r, sh) {
            var v1 = sh.N * sh.N + sh.b * sh.N, x2 = sh.N - sh.b, v2 = x2 * x2 + sh.b * x2;
            var p = KP.fields('Substitute both of the student’s answers into the left side ' + t('x^{2}+' + lc(sh.b) + 'x') + '.', [numBox('At ' + t('x=' + sh.N) + ':', 'at x=' + sh.N), numBox('At ' + t('x=' + x2) + ':', 'at x=' + x2)], [K.number(v1), K.number(v2)], [String(v1), String(v2)],
              t(F(v1)) + ' and ' + t(F(v2)) + ' — neither is ' + t(sh.N), t(sh.N + '^{2}+' + sh.b + '(' + sh.N + ')=' + F(sh.N * sh.N) + '+' + sh.b * sh.N + '=' + F(v1) + '\\neq ' + sh.N) + '<br>' + t(x2 + '^{2}+' + sh.b + '(' + x2 + ')=' + F(x2 * x2) + '+' + sh.b * x2 + '=' + F(v2) + '\\neq ' + sh.N) + '<br>Neither satisfies the equation.',
              ['Square the value, then add ' + t(sh.b) + ' times the value.'], 'check student roots');
            return p;
          } },
          { id: 'e15b', level: 'EMG', make: function (r, sh) {
            return mc(r, 'The first line, ' + t('x(x+' + sh.b + ')=' + sh.N) + ', is correct. Which step after it is invalid?', [
              { html: 'Setting each factor equal to ' + t(sh.N) + '. The Zero Product Law works <b>only when the product is ' + t('0') + '</b>.', right: true },
              { html: 'Subtracting ' + t(sh.b) + ' to get ' + t('x=' + (sh.N - sh.b)) + '.', why: 'That subtraction is fine. The mistake is the step before it.' },
              { html: 'Factoring the left side as ' + t('x(x+' + sh.b + ')') + '.', why: 'The question says that line is correct.' },
              { html: 'The student should have divided both sides by ' + t('x') + '.', why: 'Dividing by ' + t('x') + ' is never a safe step — it can lose solutions. The problem is using the Zero Product Law with ' + t(sh.N) + ' instead of ' + t('0') + '.' }],
              'The invalid step is setting each factor equal to ' + t(sh.N) + '. The Zero Product Law says: if ' + t('A\\cdot B=0') + ', then ' + t('A=0') + ' or ' + t('B=0') + '. It applies only when the product is ' + t('0') + '; a product of ' + t(sh.N) + ' could be ' + t(pairsOf(sh.N).slice(1).map(function (q) { return q[0] + '\\times ' + q[1]; }).join(',\\ ') || '1\\times ' + sh.N) + ', …',
              ['What does the Zero Product Law need on one side of the equation?'], 'invalid step x(x+b)=N');
          } },
          { id: 'e15c', level: 'EMG', make: function (r, sh) {
            return vs('Solve the equation correctly.', [sh.p, -sh.q], {}, t('x^{2}+' + lc(sh.b) + 'x-' + sh.N + '=0') + '<br>Product ' + t(-sh.N) + ', sum ' + t(sh.b) + ': ' + t(sh.q) + ' and ' + t(-sh.p) + '.<br>' + t('(x+' + sh.q + ')(x-' + sh.p + ')=0') + '<br>' + t('x=-' + sh.q) + ' or ' + t('x=' + sh.p) + '<br>Check: ' + t('(' + (-sh.q) + ')^{2}+' + sh.b + '(' + (-sh.q) + ')=' + (sh.q * sh.q) + '-' + sh.b * sh.q + '=' + sh.N) + ' ✓',
              ['Move ' + t(sh.N) + ' to the left side first, then factor.'], 'solve x²+' + sh.b + 'x=' + sh.N, ['x=' + sh.N + ', x=' + (sh.N - sh.b), 'x=' + (-sh.p) + ', x=' + sh.q]);
          } }] },
      { num: '16', stem: function (sh) { return 'Asked to factor ' + t(tx(sh.T)) + ' completely, a student wrote ' + t(tx(sh.T) + '=-' + sh.g + '(x^{2}-' + sh.d + 'x+' + sh.C + ')') + ' and then said the bracket does not factor.'; },
        shared: function (r) { var z = pick(function () { return { g: r.int(2, 5), p: r.int(4, 9), q: r.int(1, 4) }; }, function (z) { return z.p - z.q >= 2; }); z.d = z.p - z.q; z.C = z.g * z.p * z.q; z.T = FX.product([N(-z.g), sum(lin(1, 'x', -z.p)), sum(lin(1, 'x', z.q))]); return z; },
        parts: [
          { id: 'e16a', level: 'BEG', make: function (r, sh) {
            var S = P.mul(N(-sh.g), P.add(M(1, 'x', 2), M(-sh.d, 'x'), N(sh.C)));
            return polyPart('Expand the student’s line ' + t('-' + sh.g + '(x^{2}-' + sh.d + 'x+' + sh.C + ')') + '.', S, [{ is: sh.T, code: 'value', hint: 'Multiply <b>every</b> term in the bracket by ' + t(-sh.g) + ', including ' + t(sh.C) + '.' }],
              t('-' + sh.g + '(x^{2}-' + sh.d + 'x+' + sh.C + ')=' + tx(S)) + '. The constant is ' + t(-sh.g * sh.C) + ', not ' + t('+' + sh.C) + ', so the student’s line is <b>not equal</b> to ' + t(tx(sh.T)) + '.',
              ['Multiply each of the three terms by ' + t(-sh.g) + '.'], 'expand student line');
          } },
          { id: 'e16b', level: 'EMG', make: function (r, sh) {
            return mc(r, 'Which term did the student handle wrongly?', [
              { html: 'The constant term: ' + t(sh.C + '\\div(-' + sh.g + ')=-' + sh.p * sh.q) + '. When a negative common factor is taken out, <b>every</b> term must be divided by it and changes sign.', right: true },
              { html: 'The ' + t('x^{2}') + ' term: it should be ' + t('-x^{2}') + '.', why: t('-' + sh.g + 'x^{2}\\div(-' + sh.g + ')=x^{2}') + ' — that one is right.' },
              { html: 'The ' + t('x') + ' term: it should be ' + t('+' + sh.d + 'x') + '.', why: t(sh.g * sh.d + 'x\\div(-' + sh.g + ')=-' + sh.d + 'x') + ' — that one is right.' },
              { html: 'None — the bracket really doesn’t factor.', why: 'Expand the student’s line: the constant comes out as ' + t(-sh.g * sh.C) + ', not ' + t(sh.C) + '.' }],
              'The constant term: ' + t('+' + sh.C + '\\div(-' + sh.g + ')=-' + sh.p * sh.q) + ', not ' + t('+' + sh.C) + '. Rule: when a negative common factor is taken out, every term in the bracket changes sign. The student changed the first two terms and copied the third.',
              ['Divide each term of the original by ' + t(-sh.g) + '.'], 'which term wrong');
          } },
          { id: 'e16c', level: 'PRG', make: function (r, sh) {
            var Ft = FT(N(-sh.g), [lin(1, 'x', -sh.p), lin(1, 'x', sh.q)]);
            return fac('Write the complete factoring of ' + t(tx(sh.T)) + '.', Ft, [{ is: FT(N(-sh.g), [lin(1, 'x', sh.p), lin(1, 'x', -sh.q)]), code: 'sign-swap', hint: 'Your pair adds to ' + t(sh.d) + '; the bracket ' + t('x^{2}-' + sh.d + 'x-' + sh.p * sh.q) + ' needs a sum of ' + t(-sh.d) + '.' }],
              t(tx(sh.T) + '=-' + sh.g + '(x^{2}-' + sh.d + 'x-' + sh.p * sh.q + ')') + '<br>Product ' + t(-sh.p * sh.q) + ', sum ' + t(-sh.d) + ': ' + t(-sh.p) + ' and ' + t(sh.q) + '.<br>' + t('=' + Ft.tex) + '<br>The correct bracket <b>does</b> factor.',
              ['Take out ' + t(-sh.g) + ' correctly first.'], 'factor ' + plain(tx(sh.T)));
          } }] },
      { num: '17', stem: function (sh) { return 'Asked to solve ' + t('(x+' + sh.a + ')(x-' + sh.b + ')=(x+' + sh.a + ')(2x-' + sh.d + ')') + ', a student cancelled the factor ' + t('(x+' + sh.a + ')') + ' from both sides, obtaining ' + t('x-' + sh.b + '=2x-' + sh.d) + ', and answered ' + t('x=' + sh.x0) + '.'; },
        shared: function (r) { var z = { a: r.int(1, 6), b: r.int(1, 5), x0: r.int(3, 8) }; z.d = z.b + z.x0; return z; },
        parts: [
          { id: 'e17a', level: 'BEG', make: function (r, sh) {
            var L = (sh.x0 + sh.a) * (sh.x0 - sh.b);
            return KP.fields('Substitute ' + t('x=' + sh.x0) + ' into both sides of the original equation.', [numBox('Left side:'), numBox('Right side:')], [K.number(L), K.number(L)], [String(L), String(L)], 'Both sides equal ' + t(L),
              'Left: ' + t('(' + sh.x0 + '+' + sh.a + ')(' + sh.x0 + '-' + sh.b + ')=' + (sh.x0 + sh.a) + '(' + (sh.x0 - sh.b) + ')=' + L) + '<br>Right: ' + t('(' + sh.x0 + '+' + sh.a + ')(' + 2 * sh.x0 + '-' + sh.d + ')=' + (sh.x0 + sh.a) + '(' + (2 * sh.x0 - sh.d) + ')=' + L) + '<br>Both sides are equal, so ' + t('x=' + sh.x0) + ' is a genuine root. ✓',
              ['Work out each bracket, then multiply.'], 'check x=' + sh.x0);
          } },
          { id: 'e17b', level: 'PRG', make: function (r, sh) {
            return vs('Move everything to one side, take out the common binomial factor, and solve.', [-sh.a, sh.x0], { diag: function (A) { if (A.length === 1 && A[0] === sh.x0) return { code: 'root-missing', hint: 'The common factor ' + t('(x+' + sh.a + ')') + ' gives a solution too.' }; return null; } },
              t('(x+' + sh.a + ')(x-' + sh.b + ')-(x+' + sh.a + ')(2x-' + sh.d + ')=0') + '<br>' + t('(x+' + sh.a + ')[(x-' + sh.b + ')-(2x-' + sh.d + ')]=0') + '<br>' + t('(x+' + sh.a + ')(' + seq([M(-1, 'x'), N(sh.d - sh.b)]) + ')=0') + '<br>' + t('x=-' + sh.a) + ' or ' + t('x=' + sh.x0) + '. The cancelling destroyed ' + t('x=-' + sh.a) + '.',
              ['Subtract the right side from both sides, then take out ' + t('(x+' + sh.a + ')') + '.'], 'solve by common binomial', ['x=' + sh.a + ', x=' + sh.x0]);
          } },
          { id: 'e17c', level: 'EMG', make: function (r, sh) {
            return mc(r, 'Cancelling a <i>number</i> from both sides is safe; cancelling ' + t('(x+' + sh.a + ')') + ' is not. Why?', [
              { html: 'Cancelling divides both sides by ' + t('(x+' + sh.a + ')') + ', which is ' + t('0') + ' when ' + t('x=-' + sh.a) + ' — so that root is lost. Never divide by an expression containing the variable; move everything to one side and factor.', right: true },
              { html: 'Cancelling is always allowed, because the same factor appears on both sides.', why: 'Try ' + t('x=-' + sh.a) + ' in the original: both sides are ' + t('0') + ', so it is a root — but ' + t('x-' + sh.b + '=2x-' + sh.d) + ' doesn’t have it.' },
              { html: 'Cancelling a number is unsafe too.', why: 'A nonzero number is never ' + t('0') + ', so dividing by it loses nothing.' },
              { html: 'Cancelling is fine as long as you check your answer afterwards.', why: 'Checking ' + t('x=' + sh.x0) + ' shows it works, but checking can’t find the root that was thrown away.' }],
              'Cancelling means dividing both sides. A number such as ' + t('3') + ' is never ' + t('0') + ', so dividing by it loses nothing. ' + t('(x+' + sh.a + ')') + ' <i>is</i> ' + t('0') + ' when ' + t('x=-' + sh.a) + ', and division by ' + t('0') + ' is undefined, so that case silently disappears.<br><b>Rule:</b> never divide both sides by an expression containing the variable — move everything to one side and factor instead.',
              ['When is ' + t('x+' + sh.a) + ' equal to ' + t('0') + '?'], 'why not cancel');
          } }] },
      { num: '18', section: 'Extra practice F — Challenge', stem: 'Each expression has <b>four</b> terms, but grouping them two-and-two leads nowhere. Group them <b>one and three</b> instead: three of the terms form a perfect square trinomial, and the whole expression becomes a difference of squares.', parts: [
        { id: 'e18a', level: 'ADV', make: function (r) {
          var p = r.int(2, 9), q = r.int(2, 7), Ft = FT(null, [[M(1, 'x'), N(p), M(-q, 'y')], [M(1, 'x'), N(p), M(q, 'y')]]), poly = seq([M(1, 'x', 2), M(2 * p, 'x'), N(p * p), M(-q * q, 'y', 2)]);
          return fac(t(poly), Ft, [{ is: FT(null, [[M(1, 'x'), N(p), M(-q, 'y')], [M(1, 'x'), N(-p), M(q, 'y')]]), code: 'minus-dist', hint: 'Both brackets start with the whole ' + t('A=x+' + p) + ': ' + t('(A-B)(A+B)') + '.' }],
            'Group one and three: ' + t('(x^{2}+' + 2 * p + 'x+' + p * p + ')-' + q * q + 'y^{2}=(x+' + p + ')^{2}-(' + q + 'y)^{2}') + '<br>' + t('=[(x+' + p + ')-' + q + 'y][(x+' + p + ')+' + q + 'y]') + '<br>' + t('=' + Ft.tex),
            ['Which three terms make a perfect square trinomial?', 'Then use ' + t('A^{2}-B^{2}=(A-B)(A+B)') + ' with ' + t('A=x+' + p) + '.'], 'factor ' + plain(poly), { vars: ['x', 'y'] });
        } },
        { id: 'e18b', level: 'ADV', make: function (r) {
          var p = r.int(2, 9), Ft = FT(null, [[M(1, 'm'), M(-1, 'n'), N(p)], [M(1, 'm'), M(1, 'n'), N(-p)]]), poly = seq([M(1, 'm', 2), M(-1, 'n', 2), M(2 * p, 'n'), N(-p * p)]);
          return fac(t(poly), Ft, [{ is: FT(null, [[M(1, 'm'), M(-1, 'n'), N(-p)], [M(1, 'm'), M(1, 'n'), N(p)]]), code: 'minus-dist', hint: t('m-(n-' + p + ')=m-n+' + p) + ' — the minus sign changes both signs inside.' }],
            t('m^{2}+(-n^{2}+' + 2 * p + 'n-' + p * p + ')=m^{2}-(n^{2}-' + 2 * p + 'n+' + p * p + ')=m^{2}-(n-' + p + ')^{2}') + '<br>' + t('=[m-(n-' + p + ')][m+(n-' + p + ')]') + '<br>' + t('=' + Ft.tex),
            ['Take out ' + t('-1') + ' from the last three terms.', 'Then it is ' + t('m^{2}-(\\ldots)^{2}') + '.'], 'factor ' + plain(poly), { vars: ['m', 'n'] });
        } },
        { id: 'e18c', level: 'ADV', make: function (r) {
          var z = pick(function () { return { a: r.int(2, 5), b: r.int(1, 5), u: r.int(2, 9) }; }, function (z) { return gcd(z.a, z.b) === 1 && z.a !== z.b; });
          var Ft = FT(null, [[M(z.a, 'p'), M(-z.b, 'q'), N(-z.u)], [M(z.a, 'p'), M(-z.b, 'q'), N(z.u)]]), poly = seq([M(z.a * z.a, 'p', 2), MM(-2 * z.a * z.b, { p: 1, q: 1 }), M(z.b * z.b, 'q', 2), N(-z.u * z.u)]);
          var A = seq([M(z.a, 'p'), M(-z.b, 'q')]);
          return fac(t(poly), Ft, [], 'Group three and one: ' + t('(' + seq([M(z.a * z.a, 'p', 2), MM(-2 * z.a * z.b, { p: 1, q: 1 }), M(z.b * z.b, 'q', 2)]) + ')-' + z.u * z.u + '=(' + A + ')^{2}-' + z.u + '^{2}') + '<br>' + t('=[(' + A + ')-' + z.u + '][(' + A + ')+' + z.u + ']') + '<br>' + t('=' + Ft.tex),
            ['The first three terms are a perfect square trinomial.', 'Then use ' + t('A^{2}-B^{2}') + '.'], 'factor ' + plain(poly), { vars: ['p', 'q'] });
        } },
        { id: 'e18d', level: 'EMG', make: function (r) {
          var p = r.int(2, 9);
          return mc(r, 'In ' + t('m^{2}-n^{2}+' + 2 * p + 'n-' + p * p) + ', the perfect square is the <i>second</i> group and it is subtracted. What does ' + t('-n^{2}+' + 2 * p + 'n-' + p * p) + ' become when you take out ' + t('-1') + '?', [
              { html: t('-(n^{2}-' + 2 * p + 'n+' + p * p + ')=-(n-' + p + ')^{2}') + ': every sign changes, and the bracket becomes a perfect square.', right: true },
              { html: t('-(n^{2}+' + 2 * p + 'n-' + p * p + ')'), why: 'Taking out ' + t('-1') + ' changes the sign of <b>every</b> term, not just the first.' },
              { html: t('-(n^{2}-' + 2 * p + 'n-' + p * p + ')'), why: 'The last term changes sign too: ' + t('-' + p * p + '=-(+' + p * p + ')') + '.' },
              { html: 'Nothing needs to change: ' + t('-n^{2}+' + 2 * p + 'n-' + p * p + '=(n-' + p + ')^{2}') + '.', why: 'Expand ' + t('(n-' + p + ')^{2}=n^{2}-' + 2 * p + 'n+' + p * p) + ' — that is the opposite.' }],
            'Taking out ' + t('-1') + ' changes the sign of every term: ' + t('-n^{2}+' + 2 * p + 'n-' + p * p + '=-(n^{2}-' + 2 * p + 'n+' + p * p + ')') + '. Now the bracket has first term ' + t('n^{2}') + ', last term ' + t(p * p + '=' + p + '^{2}') + ' and middle term ' + t('-2(n)(' + p + ')') + ': a perfect square, ' + t('(n-' + p + ')^{2}') + '. The whole expression is ' + t('m^{2}-(n-' + p + ')^{2}') + ', a difference of squares.',
            ['Take out ' + t('-1') + ' term by term.'], 'sign change taking out −1');
        } }] },
      { num: '19', stem: 'Working backwards from the answers: write a polynomial <b>equation with integer coefficients</b> whose complete solution is the set given.', parts: [
        { id: 'e19a', level: 'EMG', make: function (r) {
          var z = pick(function () { return { A: r.int(1, 8), B: r.int(2, 9) }; }, function (z) { return z.A !== z.B; });
          return eqPart('A', t('x=-' + z.A) + ' and ' + t('x=' + z.B), [-z.A, z.B], FT(null, [lin(1, 'x', z.A), lin(1, 'x', -z.B)]),
            'Each root gives a factor: ' + t('x=-' + z.A + '\\Rightarrow(x+' + z.A + ')') + ', ' + t('x=' + z.B + '\\Rightarrow(x-' + z.B + ')') + '.<br>');
        } },
        { id: 'e19b', level: 'PRG', make: function (r) {
          var z = pick(function () { return { q: r.pick([2, 3, 4, 5]), u: r.int(1, 7), A: r.int(1, 7) }; }, function (z) { return gcd(z.q, z.u) === 1; });
          return eqPart('B', t('x=' + frac(z.u, z.q)) + ' and ' + t('x=-' + z.A), [z.u / z.q, -z.A], FT(null, [lin(z.q, 'x', -z.u), lin(1, 'x', z.A)]),
            t('x=' + frac(z.u, z.q) + '\\Rightarrow ' + z.q + 'x=' + z.u + '\\Rightarrow(' + z.q + 'x-' + z.u + ')') + '; ' + t('x=-' + z.A + '\\Rightarrow(x+' + z.A + ')') + '.<br>Using ' + t(z.q + 'x-' + z.u) + ' rather than ' + t('x-' + frac(z.u, z.q)) + ' keeps the coefficients integers.<br>');
        } },
        { id: 'e19c', level: 'EMG', make: function (r) {
          var A = r.int(2, 9);
          return eqPart('C', t('x=0') + ', ' + t('x=' + A) + ' and ' + t('x=-' + A), [0, A, -A], FT(M(1, 'x'), [lin(1, 'x', -A), lin(1, 'x', A)]),
            t('x=0\\Rightarrow x') + '; ' + t('x=' + A + '\\Rightarrow(x-' + A + ')') + '; ' + t('x=-' + A + '\\Rightarrow(x+' + A + ')') + '.<br>');
        } },
        { id: 'e19d', level: 'PRG', make: function (r) {
          var z = pick(function () { return { q: r.pick([2, 3, 4, 5]), u: r.int(1, 7) }; }, function (z) { return gcd(z.q, z.u) === 1; });
          return eqPart('D', 'A <b>quadratic</b> equation with ' + t('x=' + frac(z.u, z.q)) + ' and no other solution', [z.u / z.q], FT(null, [{ terms: lin(z.q, 'x', -z.u), k: 2 }]),
            t('x=' + frac(z.u, z.q) + '\\Rightarrow(' + z.q + 'x-' + z.u + ')') + '. Only one solution, so the factor is repeated (a quadratic with a double root):<br>', true);
        } },
        { id: 'e19e', level: 'EMG', make: function (r) {
          var A = r.int(1, 8), B = pick(function () { return r.int(2, 9); }, function (b) { return b !== A; }), T = P.mul(sum(lin(1, 'x', A)), sum(lin(1, 'x', -B)));
          return mc(r, 'An equation with solutions ' + t('x=-' + A) + ' and ' + t('x=' + B) + ' is ' + t(tx(T) + '=0') + ', but it isn’t the only one. What must <b>every</b> correct quadratic answer have in common?', [
            { html: 'It has the factors ' + t('(x+' + A + ')') + ' and ' + t('(x-' + B + ')') + ' and nothing else that gives a root — so it is a nonzero constant multiple of ' + t(tx(T)) + ', such as ' + t(tx(P.scale(T, 2)) + '=0') + '.', right: true },
            { html: 'It must be exactly ' + t(tx(T) + '=0') + '.', why: t(tx(P.scale(T, 2)) + '=0') + ' is ' + t('2(x+' + A + ')(x-' + B + ')=0') + ' and has the same solutions.' },
            { html: 'Its constant term must be ' + t(-A * B) + '.', why: t(tx(P.scale(T, 2)) + '=0') + ' has constant term ' + t(-2 * A * B) + ' and the same solutions.' },
            { html: 'Its leading coefficient must be ' + t('1') + '.', why: 'Multiplying by a nonzero constant changes the leading coefficient but not the solutions.' }],
            'E.g. multiply by ' + t('2') + ': ' + t(tx(P.scale(T, 2)) + '=0') + ', which is ' + t('2(x+' + A + ')(x-' + B + ')=0') + '. Every correct answer must have ' + t('(x+' + A + ')') + ' and ' + t('(x-' + B + ')') + ' as factors and no factor that gives another root; among quadratics, that means they differ only by a nonzero constant multiple.',
            ['Multiply the equation by ' + t('2') + ' — do the solutions change?'], 'all equations with given roots');
        } }] },
      { num: '20', stem: 'Working backwards from factors. Determine each unknown constant.', parts: [
        { id: 'e20a', level: 'ADV', make: function (r) {
          var z = pick(function () { return { p: r.int(2, 5), s: r.int(1, 7), q: r.int(2, 5), u: r.int(1, 7) }; }, function (z) { return z.p !== z.q && gcd(z.p, z.s) === 1 && gcd(z.q, z.u) === 1 && z.p * z.u - z.q * z.s !== 0; });
          var b = z.p * z.u - z.q * z.s, other = sum(lin(z.q, 'x', z.u)), lead = z.p * z.q, c = -z.s * z.u, poly = lead + 'x^{2}+bx-' + z.s * z.u;
          var p = KP.fields(t(poly) + ' has ' + t('(' + z.p + 'x-' + z.s + ')') + ' as one factor. Determine the other factor and the value of ' + t('b') + '.', [polyBox('Other factor:', ['x']), numBox(t('b') + ' =', 'b')],
            [K.poly(other, { expanded: false, wrong: cleanW(other, [{ is: sum(lin(z.q, 'x', -z.u)), code: 'sign', hint: 'The constants must multiply to ' + t(c) + ': ' + t('-' + z.s + '\\times n=' + c) + '.' }]) }), K.number(b, function (v) { return v === -b ? { code: 'sign', hint: 'Check the sign of the middle term: ' + t(z.p + 'x\\cdot ' + z.u + '+(-' + z.s + ')\\cdot ' + z.q + 'x') + '.' } : null; })],
            [tx(other), String(b)], t(tx(other)) + ', ' + t('b=' + b),
            'The other factor is ' + t('(' + z.q + 'x+n)') + ', since ' + t(z.p + 'x\\cdot ' + z.q + 'x=' + lead + 'x^{2}') + '; the constants give ' + t('-' + lc(z.s) + 'n=' + c) + ', so ' + t('n=' + z.u) + '.<br>Other factor: ' + t(tx(other)) + '<br>' + t('(' + z.p + 'x-' + z.s + ')(' + tx(other) + ')=' + seq([M(lead, 'x', 2), M(z.p * z.u, 'x'), M(-z.q * z.s, 'x'), N(c)]) + '=' + seq([M(lead, 'x', 2), M(b, 'x'), N(c)])) + ', so ' + t('b=' + b) + '.',
            ['What times ' + t(z.p + 'x') + ' gives ' + t(lead + 'x^{2}') + '? What times ' + t(-z.s) + ' gives ' + t(c) + '?'], 'other factor and b');
          p.bad = [[tx(sum(lin(z.q, 'x', -z.u))), String(b)], [tx(other), String(-b)]];
          return p;
        } },
        { id: 'e20b', level: 'ADV', make: function (r) {
          var z = pick(function () { return { a: r.int(1, 7), q: r.int(2, 5) }; }, function (z) { return z.a !== z.q; });
          var poly = 'x^{3}+ax^{2}-' + z.q * z.q + 'x-' + z.a * z.q * z.q, Ft = FT(null, [lin(1, 'x', z.a), lin(1, 'x', -z.q), lin(1, 'x', z.q)]);
          var p = KP.fields(t(poly) + ' can be factored by grouping. Determine ' + t('a') + ', then factor the cubic completely.', [numBox(t('a') + ' =', 'a'), polyBox('Complete factoring:', ['x'])],
            [K.number(z.a, function (v) { return v === -z.a ? { code: 'sign', hint: t('-' + z.q * z.q + 'x-' + z.a * z.q * z.q + '=-' + z.q * z.q + '(x+' + z.a + ')') + ', so the first pair must give ' + t('(x+' + z.a + ')') + '.' } : null; }), K.factored(Ft.list, {})],
            [String(z.a), Ft.tex], t('a=' + z.a) + '; ' + t(tx(Ft.poly) + '=' + Ft.tex),
            'Last pair: ' + t('-' + z.q * z.q + 'x-' + z.a * z.q * z.q + '=-' + z.q * z.q + '(x+' + z.a + ')') + '. First pair: ' + t('x^{3}+ax^{2}=x^{2}(x+a)') + ', which must also give ' + t('(x+' + z.a + ')') + ', so ' + t('a=' + z.a) + '.<br>' + t('x^{2}(x+' + z.a + ')-' + z.q * z.q + '(x+' + z.a + ')=(x+' + z.a + ')(x^{2}-' + z.q * z.q + ')=' + Ft.tex),
            ['Take out the GCF of the last two terms first. What binomial do you get?'], 'grouping find a');
          p.bad = [[String(-z.a), Ft.tex], [String(z.a), '(x+' + z.a + ')(x^{2}-' + z.q * z.q + ')']];
          return p;
        } },
        { id: 'e20c', level: 'ADV', make: function (r) {
          var z = genPST2(r), k = 2 * z.a * z.b;
          return vs(t(z.a * z.a + 'x^{2}+kx+' + z.b * z.b) + ' is a perfect square trinomial. Determine <b>both</b> values of ' + t('k') + '.', [k, -k], { v: 'k', diag: function (A) { if (A.length === 1) return { code: 'count-pos', hint: 'There is a second value: ' + t('(' + z.a + 'x-' + z.b + ')^{2}') + ' is a perfect square too.' }; if (A.indexOf(z.a * z.b) >= 0) return { code: 'not-doubled', hint: 'The middle term is ' + t('\\pm 2AB') + ' — don’t forget the ' + t('2') + '.' }; return null; } },
            t('\\sqrt{' + z.a * z.a + 'x^{2}}=' + z.a + 'x') + ', ' + t('\\sqrt{' + z.b * z.b + '}=' + z.b) + ', so the middle term is ' + t('\\pm 2(' + z.a + 'x)(' + z.b + ')=\\pm ' + k + 'x') + '.<br>' + t('k=' + k) + ': ' + t('(' + z.a + 'x+' + z.b + ')^{2}') + '; ' + t('k=-' + k) + ': ' + t('(' + z.a + 'x-' + z.b + ')^{2}'),
            ['The middle term of ' + t('(A\\pm B)^{2}') + ' is ' + t('\\pm 2AB') + '.'], 'both k for perfect square', ['k=' + k, 'k=' + z.a * z.b + ', k=-' + z.a * z.b]);
        } },
        { id: 'e20d', level: 'PRG', make: function (r) {
          var h = r.int(2, 9);
          var p = KP.fields(t('x^{2}-' + 2 * h + 'x+c=0') + ' has exactly one solution. Determine ' + t('c') + ' and the solution.', [numBox(t('c') + ' =', 'c'), numBox(t('x') + ' =', 'x')],
            [K.number(h * h, function (v) { return v === 2 * h ? { code: 'value', hint: 'One solution means a perfect square: ' + t('(x-' + h + ')^{2}') + '. What is its constant term?' } : null; }), K.number(h, function (v) { return v === -h ? { code: 'sign', hint: t('x-' + h + '=0') + ' gives ' + t('x=' + h) + '.' } : null; })],
            [String(h * h), String(h)], t('c=' + h * h) + ', ' + t('x=' + h),
            'One solution means a perfect square. The middle term ' + t('-' + 2 * h + 'x=-2(x)(' + h + ')') + ', so the square is ' + t('(x-' + h + ')^{2}') + ' and ' + t('c=' + h + '^{2}=' + h * h) + '.<br>' + t('(x-' + h + ')^{2}=0') + ', so ' + t('x=' + h) + '.',
            ['One solution ⇒ a repeated factor ⇒ a perfect square trinomial.'], 'c for one solution');
          p.bad = [[String(h * h), String(-h)]];
          return p;
        } }] },
      { num: '21', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: 'e21', level: 'EMG', make: function (r) {
          var z = pick(function () { return { p: r.int(1, 7), q: r.int(2, 6) }; }, function (z) { return z.p !== z.q; });
          var eq = seq([M(1, 'x', 3), M(-z.p, 'x', 2), M(-z.q * z.q, 'x'), N(z.p * z.q * z.q)]) + '=0';
          return mc(r, 'The complete solution to ' + t(eq) + ' is', [
            { html: t('x=' + z.p) + ' only', why: 'That comes from ' + t('(x-' + z.p + ')') + ' — the bracket ' + t('(x^{2}-' + z.q * z.q + ')') + ' gives two more.' },
            { html: t('x=-' + z.q) + ' and ' + t('x=' + z.q), why: 'Those come from ' + t('x^{2}-' + z.q * z.q) + '; the factor ' + t('(x-' + z.p + ')') + ' gives another.' },
            { html: t('x=-' + z.q) + ', ' + t('x=' + z.q) + ' and ' + t('x=' + z.p), right: true },
            { html: t('x=-' + z.p) + ', ' + t('x=-' + z.q) + ' and ' + t('x=' + z.q), why: 'Check the sign: ' + t('x-' + z.p + '=0') + ' gives ' + t('x=' + z.p) + '.' }],
            'Grouping: ' + t('x^{2}(x-' + z.p + ')-' + z.q * z.q + '(x-' + z.p + ')=0') + '<br>' + t('(x-' + z.p + ')(x^{2}-' + z.q * z.q + ')=0') + '<br>' + t('(x-' + z.p + ')(x-' + z.q + ')(x+' + z.q + ')=0') + '<br>' + t('x=' + z.p) + ', ' + t('x=' + z.q) + ' or ' + t('x=-' + z.q),
            ['Group the four terms two and two, then factor completely.'], 'solve cubic by grouping', true);
        } }] },
      { num: '22', stem: '<i>(Numerical Response)</i>', parts: [
        { id: 'e22', level: 'PRG', make: function (r) {
          var z = pick(function () { var b = r.int(1, 9), d = r.int(1, 9); if (r.chance(0.5)) b = -b; else d = -d; return { a: r.int(3, 9), b: b, c: r.int(2, 6), d: d }; },
            function (z) { var s = z.a + z.b + z.c + z.d, m = z.a * z.d + z.b * z.c; return z.a > z.c && gcd(z.a, z.b) === 1 && gcd(z.c, z.d) === 1 && m !== 0 && Math.abs(m) <= 12 && s > 0 && z.a * z.c <= 36; });
          var T = P.mul(sum(lin(z.a, 'x', z.b)), sum(lin(z.c, 'x', z.d))), ans = z.a + z.b + z.c + z.d, ac = z.a * z.c * z.b * z.d;
          return nr('When ' + t(tx(T)) + ' is factored completely it can be written ' + t('(ax+b)(cx+d)') + ', where ' + t('a') + ', ' + t('b') + ', ' + t('c') + ' and ' + t('d') + ' are integers with ' + t('a>c>0') + '. The value of ' + t('a+b+c+d') + ' is ________.', ans, function (v) {
            if (v === z.a - z.b + z.c - z.d) return { code: 'sign-swap', hint: 'Check the signs of ' + t('b') + ' and ' + t('d') + ': expand your factors and compare the middle term.' };
            if (v === z.a + z.d + z.c + z.b) return null;
            if (v === z.a + z.c + Math.abs(z.b) + Math.abs(z.d)) return { code: 'nr-sign', hint: 'One of ' + t('b') + ', ' + t('d') + ' is negative — keep its sign when you add.' };
            return null;
          }, t('ac=' + z.a * z.c + '(' + z.b * z.d + ')=' + ac) + '; pair with product ' + t(ac) + ' and sum ' + t(z.a * z.d + z.b * z.c) + ': ' + t(z.a * z.d) + ' and ' + t(z.b * z.c) + '.<br>' + t(tx(T) + '=' + br(lin(z.a, 'x', z.b)) + br(lin(z.c, 'x', z.d))) + '<br>With ' + t('a>c>0') + ': ' + t('a=' + z.a + ',\\ b=' + z.b + ',\\ c=' + z.c + ',\\ d=' + z.d) + ', so ' + t('a+b+c+d=' + ans) + '.',
          ['Decompose: ' + t('ac=' + ac) + '.', 'Put the factor with the larger ' + t('x') + '-coefficient first.'], 'a+b+c+d for ' + plain(tx(T)));
        } }] }
    ]
  });

  /* ---------------- part makers that need the helpers above ---------------- */
  function gen20a(r) {
    var z = pick(function () { return { m: r.int(2, 5), n: r.int(2, 4), s: r.int(1, 5), u: r.int(1, 3) }; }, function (z) { var b = z.m * z.u - z.n * z.s; return z.m !== z.n && gcd(z.m, z.s) === 1 && gcd(z.n, z.u) === 1 && b !== 0 && Math.abs(b) <= 6 && z.m * z.n <= 15; });
    z.a = z.m * z.n; z.b = z.m * z.u - z.n * z.s; z.c = -z.s * z.u;
    z.poly = seq([M(z.a, 'x', 2), M(z.b, 'x'), N(z.c)]); z.stuExp = seq([M(z.a, 'x', 2), M(-z.b, 'x'), N(z.c)]);
    return z;
  }
  /* 21(a)/(b): a monic quadratic x² + bx + c with the given c that can (want = true) or cannot be factored */
  function bCheck(c, S, want) {
    return function (resp) {
      var a = readP(resp); if (a.res) return a.res;
      var p = a.p, vs2 = P.vars(p);
      if (vs2.some(function (v) { return v !== 'x'; }) || P.degree(p) !== 2) return wrong('not-form', 'Write a polynomial of the form ' + t('x^{2}+bx+' + c) + '.');
      var l = P.coef(p, { x: 2 }); if (l[0] !== 1 || l[1] !== 1) return wrong('not-form', 'The ' + t('x^{2}') + ' term must have coefficient ' + t('1') + ' (the form is ' + t('x^{2}+bx+c') + ').');
      var cc = P.constant(p); if (cc[1] !== 1 || cc[0] !== c) return wrong('wrong-c', 'The constant term must be ' + t(c) + '.');
      var b = P.coef(p, { x: 1 }); if (b[1] !== 1) return wrong('not-form', t('b') + ' must be an integer.');
      var bv = b[0], can = S.indexOf(Math.abs(bv)) >= 0;
      if (want && !can) return wrong('cannot-factor', bv === 0 ? t('x^{2}+' + c) + ' is a sum and does not factor. Choose ' + t('b') + ' as the sum of a factor pair of ' + t(c) + '.' : 'No two integers multiply to ' + t(c) + ' and add to ' + t(bv) + ', so this one can’t be factored. Pick a factor pair of ' + t(c) + ' and use its sum.');
      if (!want && can) { var pq = pairsOf(c).filter(function (q) { return q[0] + q[1] === Math.abs(bv); })[0], sgn = bv < 0 ? '-' : '+'; return wrong('can-factor', 'That one <i>can</i> be factored: ' + t('(x' + sgn + pq[0] + ')(x' + sgn + pq[1] + ')') + '. Choose a ' + t('b') + ' that is not the sum of a factor pair of ' + t(c) + '.'); }
      return ok();
    };
  }
  /* EP1/EP2 expressions */
  function ep1Exprs(r) {
    var a = genNonMonic(r), b = genGroup(r), c = genPST2(r), d = genQuartic(r), e = genSumSq(r);
    var ta = tx(P.scale(P.mul(sum(lin(a.p, 'm', a.s)), sum(lin(a.q, 'm', a.u))), a.g)), tb = tx(FX.product([sum(lin(1, 'x', b.p)), sum(lin(1, 'x', -b.q)), sum(lin(1, 'x', b.q))]));
    var tc = seq([M(c.a * c.a, 'a', 2), MM(-2 * c.a * c.b, { a: 1, b: 1 }), M(c.b * c.b, 'b', 2)]), td = d.k + 't^{4}-' + d.k * Math.pow(d.q, 4), te = seq([M(e.a * e.a, 'p', 2), M(e.b * e.b, 'q', 2)]);
    return { a: { tex: ta, gcf: String(a.g) }, b: { tex: tb }, c: { tex: tc }, d: { tex: td, gcf: String(d.k) }, e: { tex: te } };
  }
  function pairsOf2(s) { var out = []; for (var p = 1; p < s - p; p++) if (p * (s - p) <= 40) out.push([p, s - p]); return out; }
  function nonMonicPart(z, v) {
    var A = lin(z.p, v, z.s), B = lin(z.q, v, z.u), inner = P.mul(sum(A), sum(B)), Ft = FT(N(z.g), [A, B]), poly = tx(Ft.poly), ac = z.p * z.q * z.s * z.u;
    return fac(t(poly), Ft, [{ is: FT(null, [A, B]), code: 'gcf-dropped', hint: 'Your factors multiply to ' + t(tx(inner)) + ' — you dropped the common factor ' + t(z.g) + '. Keep it in front.' }],
      'GCF ' + t('=' + z.g) + ': ' + t(poly + '=' + z.g + '(' + tx(inner) + ')') + '<br>' + t('ac=' + ac) + '; pair with product ' + t(ac) + ' and sum ' + t(z.p * z.u + z.q * z.s) + ': ' + t(z.p * z.u) + ' and ' + t(z.q * z.s) + '.<br>' + t('=' + Ft.tex),
      ['Take out the common factor first.', 'Then decompose: two numbers that multiply to ' + t('ac') + ' and add to ' + t('b') + '.'], 'factor ' + plain(poly));
  }
  function groupDoSPart(z, v) {
    var Ft = FT(null, [lin(1, v, z.p), lin(1, v, -z.q), lin(1, v, z.q)]), poly = tx(Ft.poly);
    return fac(t(poly), Ft, [{ is: FT(null, [lin(1, v, z.p), { terms: lin(1, v, -z.q), k: 2 }]), code: 'dos-square', hint: t(v + '^{2}-' + z.q * z.q) + ' is a difference of squares: ' + t('(' + v + '-' + z.q + ')(' + v + '+' + z.q + ')') + '.' }],
      'Four terms ⇒ grouping: ' + t('(' + seq([M(1, v, 3), M(z.p, v, 2)]) + ')+(' + seq([M(-z.q * z.q, v), N(-z.p * z.q * z.q)]) + ')') + '<br>' + t('=' + v + '^{2}(' + v + '+' + z.p + ')-' + z.q * z.q + '(' + v + '+' + z.p + ')=(' + v + '+' + z.p + ')(' + v + '^{2}-' + z.q * z.q + ')') + '<br>' + t(v + '^{2}-' + z.q * z.q) + ' is a difference of squares: ' + t('=' + Ft.tex),
      ['Four terms: group two and two.', 'Check every bracket again.'], 'factor ' + plain(poly));
  }
  function pst2Part(z, u, w) {
    var A = [M(z.a, u), M(-z.b, w)], Ft = FT(null, [{ terms: A, k: 2 }]), poly = seq([M(z.a * z.a, u, 2), MM(-2 * z.a * z.b, (function () { var o = {}; o[u] = 1; o[w] = 1; return o; })()), M(z.b * z.b, w, 2)]);
    return fac(t(poly), Ft, [{ is: FT(null, [A, [M(z.a, u), M(z.b, w)]]), code: 'dos-square', hint: 'That gives no middle term. The middle term ' + t(tx(MM(-2 * z.a * z.b, (function () { var o = {}; o[u] = 1; o[w] = 1; return o; })()))) + ' says it is a perfect square.' }],
      'No common factor. ' + t('\\sqrt{' + z.a * z.a + u + '^{2}}=' + z.a + u) + ', ' + t('\\sqrt{' + z.b * z.b + w + '^{2}}=' + z.b + w) + '; the middle term ' + t('2(' + z.a + u + ')(' + z.b + w + ')=' + 2 * z.a * z.b + u + w) + ' matches, with a minus sign. <b>Perfect square:</b><br>' + t(poly + '=' + Ft.tex),
      ['Are the first and last terms perfect squares? Is the middle term ' + t('2AB') + '?'], 'factor ' + plain(poly), { vars: [u, w] });
  }
  function quarticPart(z, v) {
    var q2 = z.q * z.q, Ft = FT(N(z.k), [lin(1, v, -z.q), lin(1, v, z.q), [M(1, v, 2), N(q2)]]), poly = tx(Ft.poly);
    return fac(t(poly), Ft, [{ is: FT(N(z.k), [lin(1, v, -z.q), lin(1, v, z.q), lin(1, v, -z.q), lin(1, v, z.q)]), code: 'sum-split', hint: t(v + '^{2}+' + q2) + ' is a sum of squares — it doesn’t factor.' }],
      'GCF ' + t('=' + z.k) + ': ' + t(poly + '=' + z.k + '(' + v + '^{4}-' + q2 * q2 + ')') + '<br>' + t(v + '^{4}-' + q2 * q2 + '=(' + v + '^{2}-' + q2 + ')(' + v + '^{2}+' + q2 + ')') + '<br>' + t(v + '^{2}-' + q2) + ' is again a difference of squares; ' + t(v + '^{2}+' + q2) + ' is a sum and stops.<br>' + t('=' + Ft.tex),
      ['Common factor first.', 'Then a difference of squares — twice.'], 'factor ' + plain(poly));
  }
  /* a factored form with the constants pulled out of each bracket (each bracket primitive, leading term positive) */
  function complete(brs) {
    var k = 1, prims = [], tex = '';
    brs.forEach(function (b) { var cn = FX.content(sum(b)); k *= cn.c[0] / cn.c[1]; prims.push(cn.prim); });
    var list = [N(k)].concat(prims);
    tex = (k === 1 ? '' : k === -1 ? '-' : String(k)) + prims.map(function (p) { return '(' + tx(p) + ')'; }).join('');
    return { list: list, tex: tex, poly: FX.product(list) };
  }
  /* EP19: an equation with integer coefficients and exactly the given roots (any nonzero multiple; factored or expanded) */
  /* true when S (in x) is a constant times a product of powers of (x − r), r in roots (exact rational division) */
  function onlyRoots(S, roots) {
    var dg = P.degree(S); if (!(dg >= 0)) return false;
    var rq = function (a) { var g = gcd(a[0], a[1]) || 1, p = a[0] / g, q = a[1] / g; return q < 0 ? [-p, -q] : [p, q]; };
    var a = []; for (var e = dg; e >= 0; e--) a.push(P.coef(S, e ? { x: e } : {}));
    roots.forEach(function (rt) {
      var q = 1; while (q < 1000 && Math.abs(Math.round(rt * q) - rt * q) > 1e-9) q++;
      var r = rq([Math.round(rt * q), q]);
      while (a.length > 1) {
        var b = [a[0]];
        for (var i = 1; i < a.length; i++) { var m = rq([r[0] * b[i - 1][0], r[1] * b[i - 1][1]]); b.push(rq([a[i][0] * m[1] + m[0] * a[i][1], a[i][1] * m[1]])); }
        if (b.pop()[0] !== 0) break;
        a = b;
      }
    });
    return a.length === 1 && a[0][0] !== 0;
  }
  function eqPart(tag, rootsTex, roots, Ft, lead, quad) {
    var T = Ft.poly, key = tx(T), deg = P.degree(T);
    var check = function (resp) {
      var s = String(resp == null ? '' : resp).replace(/=\s*0\s*$/, '');
      if (/=/.test(s)) return form('relation', 'Type the left side only — the ' + t('=0') + ' is already there.');
      var a = readP(s); if (a.res) return a.res;
      var S = a.p, vs3 = P.vars(S);
      if (P.isZero(S)) return wrong('value', t('0=0') + ' is true for <b>every</b> ' + t('x') + ' — build the left side from one factor per root.');
      if (vs3.some(function (v) { return v !== 'x'; })) return wrong('var', 'Use the variable ' + t('x') + ' only.');
      var lt = P.lead(S, 'x'), lT = P.lead(T, 'x');
      var same = !P.isZero(S) && P.eq(P.scale(S, [lT[0] * lt[1], lT[1] * lt[0]]), T);
      if (same) {
        if (P.terms(S).some(function (u) { return u.c[1] !== 1; })) return form('coef-fraction', 'Right roots — now multiply through so every coefficient is an integer.');
        return ok();
      }
      var at = function (x) { return P.at(S, { x: x }); };
      var miss = roots.filter(function (x) { return Math.abs(at(x)) > 1e-9; });
      if (!miss.length && onlyRoots(S, roots)) { // c·∏(x − r)^m: a repeated factor adds no new solution
        if (quad && P.degree(S) !== 2) return wrong('double-root', P.degree(S) < 2 ? 'Right solution, but the question asks for a <b>quadratic</b>: repeat the factor.' : 'Right solution, but that isn’t a <b>quadratic</b> — use the factor exactly twice.');
        if (P.terms(S).some(function (u) { return u.c[1] !== 1; })) return form('coef-fraction', 'Right roots — now multiply through so every coefficient is an integer.');
        return ok();
      }
      if (miss.length && roots.every(function (x) { return Math.abs(at(-x)) < 1e-9; }) && miss.length === roots.filter(function (x) { return x !== 0; }).length) return wrong('root-sign', 'Check the signs: the root ' + t('x=' + rootTex(miss[0])) + ' comes from the factor that is ' + t('0') + ' there, e.g. ' + t('x=-4') + ' gives ' + t('(x+4)') + '.');
      if (miss.length) return wrong('root-missing', t('x=' + rootTex(miss[0])) + ' is not a solution of your equation. Each root ' + t('r') + ' needs a factor that is ' + t('0') + ' at ' + t('r') + '.');
      if (P.degree(S) < deg) return wrong('double-root', 'Your equation has the right root, but a quadratic with only that root has the factor <b>repeated</b>.');
      return wrong('root-extra', 'Your equation has all the roots, but also another one. Use exactly one factor for each root.');
    };
    var p = KP.math(rootsTex + '. Type the left side of your equation (the right side is ' + t('0') + ').', check, key, lead + t(Ft.tex + '=0') + '<br>Expand: ' + t(key + '=0'), ['Each root ' + t('r') + ' gives a factor that is ' + t('0') + ' at ' + t('r') + ', e.g. ' + t('x=5\\Rightarrow(x-5)') + '.', 'Multiply the factors and set the product equal to ' + t('0') + '.'], 'equation from roots ' + tag, { keys: 'poly', vars: ['x'] });
    p.answer = t(key + '=0');
    p.good = [Ft.tex, tx(P.scale(T, 2)), tx(T, { order: 'asc' })];
    p.bad = [tx(P.mul(T, sum(lin(1, 'x', -11)))), tx(P.add(T, N(1)))];
    return p;
  }
  function rootTex(x) { if (Number.isInteger(x)) return String(x); for (var q = 2; q <= 12; q++) { var p = Math.round(x * q); if (Math.abs(p / q - x) < 1e-9) return frac(p, q); } return String(x); }
})(window);
