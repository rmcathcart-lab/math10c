/* Math 10C · Unit 3 · Lesson 1 — Polynomials: Review and Preview (AN4)
 * Assignment questions 1–19 (u3_L01.tex) and the Lesson 1 Extra Practice (u3_EP01.tex, Q1–21 except 17(c)).
 * Every part is a generator: it keeps the idea and difficulty of the booklet question (the booklet's numbers are one
 * of the possible values unless noted) and changes the numbers. Levels: LIM BEG EMG PRG ADV MAS.
 * Local checkers: numChk (a number such as 2π, √7, −1/8 or 0 typed in a math box), exampleChk ("give an example of…"
 * with every listed property tested), nameChk (monomial / binomial / trinomial / polynomial typed as a word) and a
 * zero-answer wrapper (K.poly nudges a bare "0" as a "0 term").
 * Algebra tiles: "state the polynomial the diagram shows" stays a typed answer; "draw the tiles for …" (EP Q7, and the
 * tiles to add in EP Q9) uses the tile builder (js/draw.js tilepad, poly mode) via buildPart / tileBuildChk.
 * Q10(b) and Q11: a tile part first (10b: the mat starts with the first polynomial, add the second and remove the zero
 * pairs; 11: take-away tiles with zero pairs, js/draw2.js) and then the typed result, sharing the numbers. */
(function (root) {
  'use strict';
  var HW = root.HW, F = HW.fmt, K = HW.kit, KP = K.P, ex = HW.ex, P = HW.poly, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form;

  HW.addCodes({
    'name-count': 'Named the polynomial with the wrong number of terms', 'deg-coef': 'Used the coefficient as the degree', 'deg-max': 'Took the largest exponent instead of the sum',
    'deg-prod': 'Multiplied the exponents instead of adding', 'deg-hidden1': 'Forgot a hidden exponent of 1', 'deg-const': 'Gave a constant a degree other than 0',
    'deg-sum-all': 'Added the exponents of every term (degree of a polynomial)', 'lc-first': 'Took the first coefficient written as the leading coefficient', 'lc-exp': 'Gave the exponent as the leading coefficient',
    'lc-sign': 'Dropped the sign of the leading coefficient', 'lc-pi': 'Left π out of the coefficient', 'ct-sign': 'Dropped the sign of the constant term', none: 'Said “none” for a constant term of 0',
    'has-var': 'Included the variable in a coefficient', 'ex-terms': 'Example: wrong number of terms', 'ex-vars': 'Example: wrong number of variables', 'ex-degree': 'Example: wrong degree',
    'ex-const': 'Example: wrong constant term', 'ex-coef': 'Example: wrong coefficient', 'ex-zero': 'Example: used the zero polynomial', 'ex-order': 'Example: not in descending order',
    'ex-simplify': 'Example not simplified', 'ex-other': 'Example misses a condition', 'add-exp': 'Added the exponents when adding like terms', 'white-pos': 'Counted white (negative) tiles as positive',
    'white-skip': 'Ignored the white (negative) tiles', 'first-only': 'Changed the sign of only the first term in the subtracted bracket', 'no-change': 'Added instead of subtracting (no signs changed)',
    'reversed': 'Subtracted in the wrong order (A − B instead of B − A)', 'second-added': 'Added the second bracket instead of subtracting it', 'frac-add': 'Added numerators and denominators',
    'unlike-combined': 'Combined unlike terms', 'neg-sub': 'Sign error substituting a negative value', 'name': 'Wrong name for the polynomial', 'zero-pairs': 'Miscounted zero pairs',
    'lc-coef': 'Gave the coefficient of a different term', 'inner-sign': 'Sign error with nested brackets', 'mult-exp': 'Multiplied the powers instead of adding like terms',
    'tile-colour': 'Tiles: every colour reversed', 'tile-shape': 'Tiles: x²- and x-tiles swapped', 'tile-zp': 'Tiles: left zero pairs in the model', 'tile-away-opp': 'Take-away tiles: took away the opposite'
  });

  /* ---------------- small helpers ---------------- */
  function T(c, x, e) { var v = {}; if (x && e) v[x] = e; return P.mono(c, v); }            // c·xᵉ (e = 0 → constant)
  function M(c, v) { return P.mono(c, v || {}); }                                              // c·(monomial)
  function S(arr) { return P.add.apply(null, arr); }                                          // the polynomial of a written term list
  function W(arr) { return P.seq(arr); }                                                      // LaTeX of a term list in the order written
  function B(arr) { return arr.length > 1 ? '(' + W(arr) + ')' : W(arr); }
  function NEG(arr) { return arr.map(P.neg); }
  function tx(p) { return P.tex(p); }
  function termsOf(p) { return P.sorted(p).map(function (q) { return M(q.c, q.v); }); }
  function nz(r, a, b) { var v = 0; while (v === 0) v = r.int(a, b); return v; }
  function rt(c) { return K.ratTex(c); }
  function plain(s) { return String(s).replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '($1)/($2)').replace(/\\sqrt\{([^}]*)\}/g, '√$1').replace(/\\pi/g, 'π').replace(/\\[a-z]+/g, ' ').replace(/[{}]/g, '').replace(/\s+/g, ' ').trim(); }
  function hasVar(a) { if (!a || typeof a !== 'object') return false; if (a.t === 'var') return true; return hasVar(a.a) || hasVar(a.b) || hasVar(a.n); }
  var PH = 'e.g. 3x^2 - 5x + 4';
  var NAME = { 1: 'monomial', 2: 'binomial', 3: 'trinomial' };
  function nameOf(n) { return NAME[n] || 'polynomial'; }
  function termsCount(n) { return n + ' term' + (n === 1 ? '' : 's'); }

  /* collect like terms: one line per group, in descending order, like the booklet's worked solutions */
  function groupsTex(list) {
    var by = {}, vs = {}, keys = [];
    list.forEach(function (p) { P.terms(p).forEach(function (q) { if (!by[q.key]) { by[q.key] = []; vs[q.key] = q.v; keys.push(q.key); } by[q.key].push(q.c); }); });
    var dummy = {}; keys.forEach(function (k) { dummy[k] = { c: [1, 1], v: vs[k] }; });
    return P.sorted(dummy).map(function (d) {
      var k = d.key, cs = by[k], s = cs.reduce(function (a, c) { return ex.norm(a[0] * c[1] + c[0] * a[1], a[1] * c[1]); }, [0, 1]);
      var lab = k ? P.monoTex(vs[k]) : '\\text{const.}';
      var body = cs.map(function (c, i) { var x = rt(c); return i && x.charAt(0) !== '-' ? '+' + x : x; }).join('');
      return t(lab + ':\\ ' + (cs.length > 1 ? body + '=' + rt(s) : body));
    }).join(';&nbsp; ');
  }
  /* worked solution for a sum/difference of brackets. parts: [{ s: +1|-1, a: termList }] */
  function bracketSol(parts, ans, lead) {
    var flat = [], anySub = false;
    parts.forEach(function (q) { if (q.s < 0) anySub = true; flat = flat.concat(q.s < 0 ? NEG(q.a) : q.a); });
    return (lead ? lead + '<br>' : '') + (anySub ? 'Subtracting a bracket means adding its opposite — change the sign of <b>every</b> term inside it:<br>' : 'Remove the brackets:<br>') + t(W(flat)) +
      '<br>Collect like terms: ' + groupsTex(flat) + '<br>' + t('=' + tx(ans));
  }
  function bracketsTex(parts) { return parts.map(function (q, i) { return (q.s < 0 ? '-' : i ? '+' : '') + '(' + W(q.a) + ')'; }).join(''); }

  /* wrong-answer list for K.poly: drop entries equal to the target or to each other */
  function wl(target, list) {
    var out = [];
    (list || []).forEach(function (w) { if (!w || !w.is) return; var p = P.lift(w.is); if (P.eq(p, target)) return; if (out.some(function (o) { return P.eq(o.is, p); })) return; out.push({ is: p, code: w.code, hint: w.hint }); });
    return out;
  }
  /* a polynomial-answer part. o: { order, var, vars, wrong, sol, hints, text, good, bad, keyTex } */
  function pp(prompt, target, o) {
    o = o || {};
    var ws = wl(target, o.wrong);
    var part = KP.poly(prompt, target, { order: o.order, var: o.var, vars: o.vars, wrong: ws, diag: o.diag, keyTex: o.keyTex }, o.sol, o.hints || [], o.text);
    part.bad = ws.map(function (w) { return tx(w.is); }).concat(o.bad || []);
    part.good = o.good || [];
    part.input.placeholder = PH;
    return part;
  }
  /* K.poly for a target of 0 (it would nudge a bare "0" as a "0 term") */
  function zeroChk(opt) {
    var base = K.poly(P.num(0), opt);
    return function (resp) {
      var a = K.read(resp);
      if (!a.res) { var r = P.read(a.ast); if (r.ok && P.isZero(r.p)) { var top = a.ast; while (top.t === 'paren') top = top.a; return top.t === 'num' ? ok() : form('zero-simplify', 'Right — everything cancels. Write the answer as just ' + t('0') + '.'); } }
      return base(resp);
    };
  }
  /* a number (π, roots, fractions and decimals allowed) typed in a math box. diags: [{ v, code, hint, form }] */
  function numChk(target, diags, o) {
    o = o || {};
    var base = K.value(target);
    return function (resp) {
      var s = String(resp == null ? '' : resp).replace(/\s/g, '');
      if (/^(none|no|nothing|\\text\{none\}|\\mathrm\{none\})$/i.test(s)) return target === 0 ? wrong('none', 'When there is no term without a variable, the constant term is ' + t('0') + '. Type ' + t('0') + '.') : wrong('value', 'There is a term with no variable here. Look again.');
      var a = K.read(resp); if (a.res) return a.res;
      if (hasVar(a.ast)) return wrong('has-var', 'Give just the number' + (o.what ? ' (' + o.what + ')' : '') + ' — leave the variable out.');
      var res = base(resp); if (res.v !== 'wrong') return res;
      var v = a.val;
      for (var i = 0; i < (diags || []).length; i++) { var d = diags[i]; if (d && isFinite(v) && Math.abs(v - d.v) < 1e-9 && Math.abs(d.v - target) > 1e-9) return d.form ? form(d.code, d.hint) : wrong(d.code, d.hint); }
      if (o.irr && isFinite(v) && Math.abs(v - target) < 0.02 * Math.max(1, Math.abs(target))) return form('decimal', 'That’s a decimal approximation. Give the <b>exact</b> value (use the keypad’s ' + (o.irr === 'pi' ? 'π' : '√') + ' key).');
      return res;
    };
  }
  /* "monomial / binomial / trinomial / polynomial" typed as a word */
  function nameChk(n) {
    return function (resp) {
      var s = String(resp || '').replace(/\\text\{([^}]*)\}/g, '$1').trim().toLowerCase();
      if (!s) return form('empty', 'Type the name.');
      var got = /^mono/.test(s) ? 1 : /^bi/.test(s) ? 2 : /^tri/.test(s) ? 3 : /poly|four|^4/.test(s) ? 4 : 0;
      if (!got) return form('name-word', 'Type one of: monomial, binomial, trinomial, polynomial.');
      var want = Math.min(n, 4);
      if (got === want) return ok();
      if (got === 4 && n < 4) return form('name-special', 'True, every one of these is a polynomial — but use the special name for a polynomial with ' + termsCount(n) + '.');
      return wrong('name', 'Count the terms (the pieces separated by ' + t('+') + ' or ' + t('-') + ' signs): there ' + (n === 1 ? 'is 1 term' : 'are ' + n + ' terms') + '.');
    };
  }
  /* "give an example of …": spec = { terms, nvars, degree, constant, neg, coef, lead, order:'desc', distinctNeg, vars:[...], extra(S) -> {code,hint}|null } */
  function exampleChk(spec) {
    return function (resp) {
      var a = K.read(resp); if (a.res) return a.res;
      var r = P.read(a.ast);
      if (!r.ok) {
        if (r.why === 'irrational') return form('ex-coef-irr', 'Use whole numbers or fractions as the coefficients in your example.');
        if (r.why === 'not-poly') return wrong('not-poly', 'That isn’t a polynomial: every exponent on a variable must be a whole number, and no variable may be in a denominator.');
        return wrong('value', null);
      }
      var Sp = r.p;
      if (P.isZero(Sp)) return wrong('ex-zero', 'The polynomial ' + t('0') + ' is special: it has no terms to count and no degree. Choose something else.');
      if (P.formIssue(a.ast)) return form('ex-simplify', 'Write your example in simplest form (no brackets, like terms collected, one number per term) so its terms can be counted.');
      var ts = P.terms(Sp), n = ts.length, vs = P.vars(Sp), deg = P.degree(Sp);
      if (spec.terms && n !== spec.terms) return wrong('ex-terms', 'Your example has ' + termsCount(n) + '. A ' + nameOf(spec.terms) + (spec.terms > 3 ? ' here' : '') + ' needs exactly ' + spec.terms + '.');
      if (spec.nvars != null && vs.length !== spec.nvars) return wrong('ex-vars', 'Your example uses ' + (vs.length ? vs.length + ' variable' + (vs.length > 1 ? 's' : '') + ' (' + t(vs.join(',\\ ')) + ')' : 'no variables') + '. It needs ' + (spec.nvars ? 'exactly ' + spec.nvars : 'none') + '.');
      if (spec.degree != null && deg !== spec.degree) return wrong('ex-degree', 'Your example has degree ' + t(deg) + ' (the largest sum of the exponents in one term). It needs degree ' + t(spec.degree) + '.');
      if (spec.constant != null && !ex.eq(P.constant(Sp)[0] / P.constant(Sp)[1], spec.constant) && !(spec.constant === 0 && P.constant(Sp)[0] === 0)) return wrong('ex-const', spec.constant === 0 ? 'It must have <b>no</b> constant term (no term without a variable).' : 'The constant term (the term with no variable) must be ' + t(spec.constant) + '.');
      if (spec.neg && ts[0].c[0] >= 0) return wrong('ex-coef', 'The numerical coefficient must be <b>negative</b>.');
      if (spec.coef && (ts[0].c[0] * spec.coef[1] !== spec.coef[0] * ts[0].c[1])) return wrong('ex-coef', 'The numerical coefficient (the number in front) must be ' + t(rt(spec.coef)) + '.');
      if (spec.lead) { var L = P.lead(Sp, vs[0]); if (L[0] * spec.lead[1] !== spec.lead[0] * L[1]) return wrong('ex-coef', 'The leading coefficient (the coefficient of the highest power) must be ' + t(rt(spec.lead)) + '.'); }
      if (spec.distinctNeg) {
        var cs = ts.map(function (q) { return q.c; });
        if (cs.some(function (c) { return c[1] !== 1 || c[0] >= 0; })) return wrong('ex-coef', 'Every coefficient (the constant term too) must be a <b>negative integer</b>.');
        if (cs.some(function (c, i) { return cs.some(function (d, j) { return j > i && d[0] === c[0]; }); })) return wrong('ex-coef', 'The ' + ['', '', 'two', 'three', 'four', 'five'][cs.length] + ' coefficients must all be <b>different</b>.');
      }
      if (spec.order) { var want = P.sorted(Sp, { order: 'desc', var: vs[0] }).map(function (q) { return q.key; }), got = P.writtenOrder(a.ast); if (got.join('|') !== want.join('|')) return wrong('ex-order', 'It must be written in <b>descending</b> order: highest power first, constant term last.'); }
      if (spec.extra) { var h = spec.extra(Sp); if (h) return wrong(h.code || 'ex-other', h.hint); }
      return ok();
    };
  }
  function examplePart(prompt, spec, key, good, bad, sol, hints, text) {
    var p = KP.math(prompt, exampleChk(spec), key, sol, hints, text, { keys: 'poly', vars: spec.vars || ['x', 'y'] });
    p.good = good; p.bad = bad; p.answer = 'One possible answer: ' + t(key); p.input.placeholder = PH;
    return p;
  }

  /* ---------------- drawings ---------------- */
  /* c = { x2: [shaded, white], x: [shaded, white], one: [shaded, white] } */
  function toks(c) {
    var out = [];
    [['x2', 'x2'], ['x', 'x'], ['one', '1']].forEach(function (k) { var pn = c[k[0]] || [0, 0], i; for (i = 0; i < pn[0]; i++) out.push(k[1]); for (i = 0; i < pn[1]; i++) out.push('-' + k[1]); });
    return out;
  }
  function tilePoly(c) { var g = function (k) { var pn = c[k] || [0, 0]; return pn[0] - pn[1]; }; return S([T(g('x2'), 'x', 2), T(g('x'), 'x', 1), T(g('one'))]); }
  function tileDesc(c) {
    var parts = [], nm = { x2: t('x^{2}') + '-tile', x: t('x') + '-tile', one: 'unit tile' };
    ['x2', 'x', 'one'].forEach(function (k) { var pn = c[k] || [0, 0]; if (pn[0]) parts.push(pn[0] + ' shaded ' + nm[k] + (pn[0] > 1 ? 's' : '')); if (pn[1]) parts.push(pn[1] + ' white ' + nm[k] + (pn[1] > 1 ? 's' : '')); });
    return parts.join(', ');
  }
  function tilesFig(c, label) { return '<div class="fig">' + HW.tiles.row(toks(c), { label: label || 'algebra tiles' }) + '</div>'; }
  /* labels in SVG: letters italic, minus signs as − */
  function svgLabel(s) { return String(s).replace(/-/g, '−').replace(/([a-z])/g, '<tspan font-style="italic">$1</tspan>'); }
  function isoSvg(side, base) {
    var st = 'stroke="#2b3340" stroke-width="2"';
    return '<svg class="fig-svg" viewBox="0 0 280 175" width="100%" style="max-width:320px" role="img" aria-label="isosceles triangle with sides ' + side + ', ' + side + ' and base ' + base + '">' +
      '<polygon points="50,140 230,140 140,30" fill="none" ' + st + ' stroke-linejoin="round"/>' +
      '<line x1="88.8" y1="79.9" x2="101.2" y2="90.1" ' + st + '/><line x1="178.8" y1="90.1" x2="191.2" y2="79.9" ' + st + '/>' +
      '<text x="140" y="164" text-anchor="middle" font-size="17" font-family="serif">' + svgLabel(base) + '</text>' +
      '<text x="84" y="80" text-anchor="end" font-size="17" font-family="serif">' + svgLabel(side) + '</text>' +
      '<text x="196" y="80" text-anchor="start" font-size="17" font-family="serif">' + svgLabel(side) + '</text></svg>';
  }
  function plainPoly(p) { return plain(tx(p)); }
  function vert(top, bottom) { return '\\begin{array}{r} ' + W(top) + ' \\\\ -\\ (' + W(bottom) + ') \\\\ \\hline \\end{array}'; }
  function shuffledNot(r, arr, bad) { var s = arr.slice(); for (var g = 0; g < 30; g++) { s = r.shuffle(arr); if (!bad(s)) return s; } return s; }
  function isDesc(arr, x) { var d = arr.map(function (p) { return P.degreeIn(p, x); }); return d.every(function (v, i) { return !i || v < d[i - 1]; }); }
  function isAsc(arr, x) { var d = arr.map(function (p) { return P.degreeIn(p, x); }); return d.every(function (v, i) { return !i || v > d[i - 1]; }); }
  var FR = [[1, 5], [2, 3], [1, 4], [3, 5], [1, 2], [2, 5], [1, 3], [3, 4], [5, 6], [3, 8], [2, 7], [4, 5]];

  /* ---------------- part makers ---------------- */
  /* Q1: name by number of terms */
  function namePart(r, polyTex, n, extraWhy) {
    var opts = [1, 2, 3, 4].map(function (k) {
      var why = k === n ? null : 'Count the terms — the pieces separated by ' + t('+') + ' or ' + t('-') + ' signs. ' + t(polyTex) + ' has ' + termsCount(n) + '.' + (extraWhy && k > n ? ' ' + extraWhy : '');
      return { html: k === 4 ? 'a polynomial with 4 or more terms' : 'a ' + NAME[k], right: k === n, why: why };
    });
    var p = KP.mc(r, 'Identify ' + t(polyTex) + ' as a monomial, a binomial, or a trinomial.', opts,
      t(polyTex) + ' has ' + termsCount(n) + ', so it is a <b>' + nameOf(n) + '</b>.', ['Terms are separated by ' + t('+') + ' and ' + t('-') + ' signs. 1 term: monomial; 2: binomial; 3: trinomial.'], 'name of ' + plain(polyTex), true);
    return p;
  }
  /* Q2 / EP1: degree of a monomial. vs = [[letter, exp]], diags extra */
  function degPart(coefTex, vs, extraDiag) {
    var d = vs.reduce(function (s, v) { return s + v[1]; }, 0), body = coefTex + vs.map(function (v) { return v[1] === 1 ? v[0] : v[0] + '^{' + v[1] + '}'; }).join('');
    var mx = vs.length ? Math.max.apply(null, vs.map(function (v) { return v[1]; })) : 0, pr = vs.reduce(function (s, v) { return s * v[1]; }, 1);
    var hid = vs.filter(function (v) { return v[1] === 1; }).length, shown = d - hid;
    return KP.number(t(body), d, function (v) {
      if (extraDiag) { var h = extraDiag(v); if (h) return h; }
      if (!vs.length) { if (v !== 0) return { code: 'deg-const', hint: 'The degree counts the exponents on the <b>variables</b>. A constant has no variable (' + t(coefTex + '=' + coefTex + 'x^{0}') + '), so its degree is ' + t('0') + '.' }; return null; }
      if (hid && v === shown) return { code: 'deg-hidden1', hint: 'A variable with no exponent showing has exponent ' + t('1') + ' (' + t(vs.filter(function (q) { return q[1] === 1; })[0][0] + '=' + vs.filter(function (q) { return q[1] === 1; })[0][0] + '^{1}') + '). Count it too.' };
      if (vs.length > 1 && v === mx) return { code: 'deg-max', hint: 'The degree of a monomial is the <b>sum</b> of the exponents of all its variables, not the largest one.' };
      if (vs.length > 1 && v === pr) return { code: 'deg-prod', hint: '<b>Add</b> the exponents, don’t multiply them.' };
      if (vs.length === 1 && vs[0][1] === 1 && v === 0) return { code: 'deg-hidden1', hint: t(vs[0][0] + '=' + vs[0][0] + '^{1}') + ': the exponent is ' + t('1') + ' even though it isn’t written.' };
      return null;
    }, 'Degree = sum of the exponents of the variables' + (vs.length ? ': ' + t(vs.map(function (v) { return v[1]; }).join('+') + '=' + d) + (hid ? ' (a variable with no exponent shown has exponent ' + t('1') + ')' : '') : ': there is no variable, so the degree is ' + t('0')) + '. The coefficient doesn’t count.',
    ['Add the exponents of all the variables. The number in front doesn’t count.'], 'degree of ' + plain(body));
  }
  function degCoefDiag(c, hint) { return function (v) { return v === c ? { code: 'deg-coef', hint: hint || 'That’s the coefficient. The degree comes from the <b>exponents</b> of the variables.' } : null; }; }

  /* Q3: polynomial or not? (four fixed reasons) */
  var Q3OPTS = ['Yes — it is a polynomial.', 'No — a variable has a negative exponent (a variable in a denominator means a negative exponent).', 'No — a variable has an exponent that is not a whole number.', 'No — it contains a fraction or a square root, so it can’t be a polynomial.'];
  function isPolyPart(r, exprTex, right, whys, sol, text) {
    var opts = Q3OPTS.map(function (h, i) { return { html: h, right: i === right, why: i === right ? null : whys[i] }; });
    return KP.mc(r, 'Is ' + t(exprTex) + ' a polynomial expression? If not, why not?', opts, sol, ['A polynomial’s variables may only have whole-number exponents ' + t('0, 1, 2, \\ldots') + ', and no variable may be in a denominator. The coefficients can be any numbers.'], text, true);
  }

  /* Q4: leading coefficient / constant term / degree row */
  function rowPart(polyTex, lc, lcTex, ct, ctTex, deg, d, sol, text) {
    var fl = [{ name: 'Leading coefficient', label: 'Leading coefficient', mode: 'math', keys: 'expr' }, { name: 'Constant term', label: 'Constant term', mode: 'math', keys: 'expr' }, { name: 'Degree', label: 'Degree' }];
    var p = KP.fields(t(polyTex), fl, [numChk(lc, d.lc, { what: 'the leading coefficient', irr: d.lcIrr }), numChk(ct, d.ct, { what: 'the constant term', irr: d.ctIrr }), K.number(deg, d.deg)], [lcTex, ctTex, String(deg)],
      'Leading coefficient ' + t(lcTex) + ', constant term ' + t(ctTex) + ', degree ' + t(deg), sol,
      ['Find the term with the highest power of the variable first: its coefficient is the leading coefficient and its power is the degree.', 'The constant term is the term with no variable (it is ' + t('0') + ' if there isn’t one).'], text);
    return p;
  }

  /* add/subtract part: parts [{s, a}] */
  function bracketPart(prompt, parts, o) {
    o = o || {};
    var ans = P.add.apply(null, parts.map(function (q) { return q.s < 0 ? P.neg(S(q.a)) : S(q.a); }));
    var ws = (o.wrong || []).slice();
    // classic: subtracted brackets with only the first term's sign changed; signs not changed at all
    var firstOnly = P.add.apply(null, parts.map(function (q) { return q.s < 0 ? P.add(P.neg(q.a[0]), S(q.a.slice(1))) : S(q.a); }));
    var noChange = P.add.apply(null, parts.map(function (q) { return S(q.a); }));
    if (parts.some(function (q) { return q.s < 0 && q.a.length > 1; })) ws.push({ is: firstOnly, code: 'first-only', hint: 'A minus sign in front of a bracket changes the sign of <b>every</b> term inside it, not just the first one.' });
    if (parts.some(function (q) { return q.s < 0; })) ws.push({ is: noChange, code: 'no-change', hint: 'It looks like you <b>added</b> the bracket after the minus sign. To subtract, change the sign of every term inside it (add the opposite).' });
    return pp(prompt, ans, { wrong: ws, vars: o.vars, sol: o.sol || bracketSol(parts, ans, o.lead), text: o.text,
      hints: o.hints || ['Remove the brackets first' + (parts.some(function (q) { return q.s < 0; }) ? ': a minus sign in front of a bracket changes the sign of every term inside it.' : '.'), 'Then collect like terms: same variables with the same exponents.'] });
  }
  function addSub(prompt, parts, o) { return bracketPart(prompt === null ? t(bracketsTex(parts)) : prompt, parts, o); }

  /* tiles reading part */
  function tileReadPart(c, o) {
    o = o || {};
    var ans = tilePoly(c), allPos = S([T((c.x2 || [0, 0])[0] + (c.x2 || [0, 0])[1], 'x', 2), T((c.x || [0, 0])[0] + (c.x || [0, 0])[1], 'x', 1), T((c.one || [0, 0])[0] + (c.one || [0, 0])[1])]);
    var posOnly = S([T((c.x2 || [0, 0])[0], 'x', 2), T((c.x || [0, 0])[0], 'x', 1), T((c.one || [0, 0])[0])]);
    var hasZP = ['x2', 'x', 'one'].some(function (k) { var pn = c[k] || [0, 0]; return pn[0] && pn[1]; });
    var sol = 'The diagram shows ' + tileDesc(c) + '. Shaded tiles are positive, white tiles are negative.' + (hasZP ? '<br>A shaded and a white tile of the same shape form a <b>zero pair</b>: ' + groupsTex(toks(c).map(function (tk) { var neg = tk.charAt(0) === '-', k = tk.replace('-', ''); return T(neg ? -1 : 1, k === '1' ? null : 'x', k === 'x2' ? 2 : k === 'x' ? 1 : 0); })) : '') + '<br>' + t('=' + tx(ans));
    return pp(tilesFig(c, 'algebra tiles for the expression'), ans, { order: o.order, var: o.order ? 'x' : undefined,
      wrong: [{ is: allPos, code: 'white-pos', hint: 'White tiles are <b>negative</b> (see the legend). Count them with a minus sign.' }, posOnly && !P.isZero(posOnly) ? { is: posOnly, code: 'white-skip', hint: 'Don’t ignore the white tiles — each one is worth a negative amount (' + t('-x^{2}') + ', ' + t('-x') + ' or ' + t('-1') + ').' } : null],
      sol: sol, text: 'tiles → ' + plainPoly(ans), hints: ['Count each shape: big squares are ' + t('x^{2}') + ', long rectangles are ' + t('x') + ', small squares are ' + t('1') + '. Shaded = positive, white = negative.'].concat(hasZP ? ['A shaded and a white tile of the same shape cancel (zero pair).'] : []) });
  }

  /* ======================== EXTRA PRACTICE ======================== */
  function homog(r) { // 4-term homogeneous polynomial of degree d in x, y with distinct x-powers
    var d = r.pick([4, 4, 5]), xs = r.sample(d === 4 ? [0, 1, 2, 3, 4] : [0, 1, 2, 3, 4, 5], 4);
    return xs.map(function (e) { return M(nz(r, -7, 7), { x: e, y: d - e }); });
  }
  var EXTRA = [
    { num: '1', section: 'Extra practice A — Degree, Coefficients and Order', stem: 'The degree of a term is the <b>sum</b> of the exponents of its variables. State the degree of each monomial.', parts: [
      { id: 'e1a', level: 'BEG', make: function (r) { var a = r.int(2, 5), b = r.int(3, 6); return degPart('-' + r.int(2, 9), [['x', a], ['y', b]]); } },
      { id: 'e1b', level: 'BEG', make: function (r) { var f = r.pick([[2, 9], [3, 5], [1, 4], [5, 7]]), e = r.int(2, 3); return degPart('\\frac{' + f[0] + '}{' + f[1] + '}', [['a', e], ['b', e], ['c', e]], function (v) { return v === e ? { code: 'deg-max', hint: 'Each variable has exponent ' + t(e) + ', and there are three of them: add all three exponents.' } : v === f[0] || v === f[1] ? { code: 'deg-coef', hint: 'The fraction is the coefficient; it doesn’t affect the degree.' } : null; }); } },
      { id: 'e1c', level: 'EMG', make: function (r) { var m = r.pick([11, 3, 5, 7, 13]), a = r.int(3, 5); return degPart('\\sqrt{' + m + '}\\,', [['m', a], ['n', 1]], function (v) { return v === m || v === a + 1 + 1 || v === a + 1 + 0.5 ? { code: 'deg-coef', hint: t('\\sqrt{' + m + '}') + ' is just a number (the coefficient). Only the exponents on the variables count.' } : null; }); } },
      { id: 'e1d', level: 'BEG', make: function (r) { var a = r.int(2, 4), b = r.int(2, 3); return degPart(String(r.int(2, 15)), [['p', 1], ['q', a], ['r', b], ['s', 1]]); } },
      { id: 'e1e', level: 'EMG', make: function (r) {
        var a = r.int(4, 7), d = r.pick([5, 3, 7]), body = '-\\frac{u^{' + a + '}v}{' + d + '}';
        return KP.number(t(body), a + 1, function (v) { return v === a ? { code: 'deg-hidden1', hint: t('v=v^{1}') + ': count its exponent too.' } : v === d ? { code: 'deg-coef', hint: 'The ' + t(d) + ' is only dividing (it is part of the coefficient ' + t('-\\frac{1}{' + d + '}') + '). Add the exponents.' } : null; },
          t(body + '=-\\frac{1}{' + d + '}u^{' + a + '}v') + ': the fraction bar only divides by the number ' + t(d) + '. Degree ' + t(a + '+1=' + (a + 1)) + '.', ['The fraction bar only divides by a number, so this is still a monomial. Add the exponents of ' + t('u') + ' and ' + t('v') + '.'], 'degree of ' + plain(body));
      } },
      { id: 'e1f', level: 'LIM', make: function (r) { var c = r.int(5, 30); return degPart('-' + c, [], function (v) { return v === c || v === -c ? { code: 'deg-coef', hint: 'That’s the value of the constant. Its degree counts exponents on variables — there are none.' } : null; }); } }] },
    { num: '2', stem: 'For each polynomial in <b>two</b> variables, state the degree of every term, then the degree of the whole polynomial, then its name.', parts: [
      { id: 'e2a', level: 'EMG', make: function (r) { var a = r.int(2, 3), b = r.int(3, 4), d = r.int(a + 2, 5); return twoVarPart(r, [M(r.int(2, 6), { x: a, y: 1 }), M(-r.int(2, 6), { x: 1, y: b }), M(1, { x: d })]); } },
      { id: 'e2b', level: 'EMG', make: function (r) { var p = r.int(3, 4), q = r.int(2, 3); return twoVarPart(r, [M(r.int(2, 9), { a: p, b: q }), M(-1, { a: p - 1, b: q }), M(r.int(2, 7), { a: 1, b: 1 }), M(-r.int(2, 9))]); } },
      { id: 'e2c', level: 'EMG', make: function (r) { var a = r.int(2, 3), b = r.int(2, 3), c = r.int(Math.max(a, b) + 1, a + b - 1 >= Math.max(a, b) + 1 ? a + b - 1 : Math.max(a, b) + 1); return twoVarPart(r, [M(1, { m: a, n: b }), M(-r.int(2, 9), { m: c })]); } },
      { id: 'e2d', level: 'BEG', make: function (r) { return twoVarPart(r, [M(-r.int(2, 9), { p: r.int(3, 6), q: r.int(2, 5) })]); } }] },
    { num: '3', stem: 'None of these is in descending order, so the leading coefficient is <b>not</b> the number you see first. Rewrite each in descending powers of the variable, then state the leading coefficient, the constant term and the degree.', parts: [
      { id: 'e3a', level: 'BEG', make: function (r) { var n = r.int(4, 5), lc = r.int(2, 5), b; do { b = r.int(2, 9); } while (b === lc); return descRowPart(r, 'x', [T(b, 'x', 1), T(-r.int(2, 9)), T(lc, 'x', n), T(-1, 'x', n - 1)]); } },
      { id: 'e3b', level: 'EMG', make: function (r) { var f = r.pick([[-1, 2], [-1, 3], [-2, 3], [-3, 4]]); return descRowPart(r, 'y', [T(-r.int(2, 9)), T(r.int(2, 9), 'y', 2), T(f, 'y', r.int(4, 6)), T(1, 'y', 1)]); } },
      { id: 'e3c', level: 'EMG', make: function (r) { var n = r.int(5, 7), m = r.int(3, n - 1); return descRowPart(r, 't', [T(r.int(2, 9), 't', 2), T(-1, 't', n), T(r.int(2, 9), 't', m === 2 ? 3 : m)]); } }] },
    { num: '4', stem: function (sh) { return 'Consider ' + t(W(sh.terms)) + '. It is in two variables, which makes “leading coefficient” a question worth asking carefully.'; },
      shared: function (r) { var terms, lx, ly, g = 0; do { terms = homog(r); lx = P.lead(S(terms), 'x'); ly = P.lead(S(terms), 'y'); g++; } while (g < 100 && lx[0] * ly[1] === ly[0] * lx[1]); return { terms: r.shuffle(terms), d: P.degree(terms[0]) }; },
      parts: [
        { id: 'e4a', level: 'BEG', make: function (r, sh) {
          var fl = sh.terms.map(function (q) { return { name: 'Degree of ' + plainPoly(q), label: 'Degree of ' + t(tx(q)) }; }).concat([{ name: 'Degree of the polynomial', label: 'Degree of the polynomial' }]);
          return KP.fields('State the degree of each of the four terms, then the degree of the polynomial.', fl, sh.terms.map(function (q) { return K.number(sh.d, degTermDiag(q)); }).concat([K.number(sh.d)]), fl.map(function () { return String(sh.d); }), 'Every term has degree ' + t(sh.d) + '; the polynomial has degree ' + t(sh.d) + '.',
            sh.terms.map(function (q) { return t(tx(q)) + ': ' + t(degSumTex(q)); }).join('; ') + '.<br>The degree of the polynomial is ' + t(sh.d) + ' — and <b>every</b> term has that degree, so no single term is “the” highest-degree term.', ['Degree of a term = sum of the exponents of its variables (' + t('x=x^{1}') + ').'], 'degrees of a homogeneous polynomial');
        } },
        { id: 'e4b', level: 'EMG', make: function (r, sh) {
          var ans = S(sh.terms);
          return pp('Write the polynomial in descending powers of ' + t('x') + '.', ans, { order: 'desc', var: 'x', text: 'descending in x', keyTex: P.tex(ans, { order: 'desc', var: 'x' }), sol: 'Order the terms by the power of ' + t('x') + ' (highest first; ' + t('y') + ' alone means ' + t('x^{0}') + '):<br>' + t(P.tex(ans, { order: 'desc', var: 'x' })), hints: ['Look only at the exponent of ' + t('x') + ' in each term.'] });
        } },
        { id: 'e4c', level: 'EMG', make: function (r, sh) {
          var ans = S(sh.terms);
          return pp('Now write it in descending powers of ' + t('y') + '.', ans, { order: 'desc', var: 'y', text: 'descending in y', keyTex: P.tex(ans, { order: 'desc', var: 'y' }), sol: 'Order the terms by the power of ' + t('y') + ':<br>' + t(P.tex(ans, { order: 'desc', var: 'y' })), hints: ['Look only at the exponent of ' + t('y') + ' in each term.'] });
        } },
        { id: 'e4d', level: 'PRG', make: function (r, sh) {
          var ans = S(sh.terms), lx = P.lead(ans, 'x'), ly = P.lead(ans, 'y');
          return KP.mc(r, 'The booklet defines the leading coefficient for a polynomial in a <b>single</b> variable. What can you say about a leading coefficient for this polynomial?', [
            { html: 'It has no single leading coefficient: ordering by ' + t('x') + ' suggests ' + t(rt(lx)) + ', ordering by ' + t('y') + ' suggests ' + t(rt(ly)) + ', and all the terms have the same degree.', right: true },
            { html: 'It is ' + t(rt(P.terms(S([sh.terms[0]]))[0].c)) + ', the coefficient of the first term written.', why: 'The first term written isn’t special — the terms can be written in any order.' },
            { html: 'It is ' + t(rt(lx)) + ', because ' + t('x') + ' always comes before ' + t('y') + '.', why: 'Nothing makes ' + t('x') + ' more important than ' + t('y') + '. Ordering by ' + t('y') + ' gives a different first term.' },
            { html: 'It is ' + t(sh.d) + ', the degree of the polynomial.', why: 'The degree and the leading coefficient are different things: the leading coefficient is a coefficient (the number in front of a term).' }],
            'The definition takes the coefficient of the highest power of <b>the</b> variable, which assumes one variable. Here all four terms tie at degree ' + t(sh.d) + ', so which term comes first depends on the variable you sort by: ' + t(rt(lx)) + ' (by ' + t('x') + ') or ' + t(rt(ly)) + ' (by ' + t('y') + '). There is no single leading coefficient until you say which variable you mean.',
            ['Compare your two orderings from (b) and (c). Do they start with the same term?'], 'leading coefficient in two variables');
        } }] },
    { num: '5', stem: 'Give an example of each. (Answers will vary — yours must meet <b>every</b> condition listed.)', parts: [
      { id: 'e5a', level: 'EMG', make: function (r) {
        var d = r.pick([5, 5, 4, 6]), c = r.pick([-4, -4, 3, -7, 8]), key = 'x^{3}y' + (d - 3 === 1 ? '' : '^{' + (d - 3) + '}') + '+xy' + (c < 0 ? c : '+' + c);
        return examplePart('a <b>trinomial</b> in <b>two</b> variables, of degree ' + t(d) + ', whose constant term is ' + t(c), { terms: 3, nvars: 2, degree: d, constant: c, vars: ['x', 'y'] }, key,
          ['x^' + (d - 1) + 'y-2x' + (c < 0 ? c : '+' + c), '5xy^' + (d - 1) + '+y' + (c < 0 ? c : '+' + c)], ['x^' + d + '+x' + (c < 0 ? c : '+' + c), 'x^3y^' + (d - 3) + '+xy+' + (c - 1 === 0 ? 2 : c - 1), 'x^3y^' + (d - 2) + '+xy' + (c < 0 ? c : '+' + c)],
          'For example ' + t(key) + ': three terms in ' + t('x') + ' and ' + t('y') + '; their degrees are ' + t(d + ', 2, 0') + ', so the degree is ' + t(d) + '; constant term ' + t(c) + '.', ['Start with the constant ' + t(c) + '. One term must have exponents adding to ' + t(d) + '; the other must have a smaller degree.'], 'example: trinomial 2 vars degree ' + d);
      } },
      { id: 'e5b', level: 'EMG', make: function (r) {
        var d = r.pick([4, 4, 3, 5]), lc = r.pick([-3, -3, -2, -5]), key = lc + 'x^{' + d + '}+7x';
        return examplePart('a <b>binomial</b> in <b>one</b> variable, of degree ' + t(d) + ', with leading coefficient ' + t(lc) + ' and <b>no</b> constant term', { terms: 2, nvars: 1, degree: d, lead: [lc, 1], constant: 0, vars: ['x'] }, key,
          [lc + 'x^' + d + '-x^2', lc + 'x^' + d + '+\\frac{1}{2}x'], [lc + 'x^' + d + '+7', (-lc) + 'x^' + d + '+7x', lc + 'x^' + d + '+7x+1', lc + 'x^' + (d + 1) + '+7x'],
          'For example ' + t(key) + ': two terms in ' + t('x') + ', highest power ' + t(d) + ' with coefficient ' + t(lc) + ', and no term without ' + t('x') + '.', ['The highest-power term must be ' + t(lc + 'x^{' + d + '}') + '. The other term needs an ' + t('x') + ' in it (so there is no constant).'], 'example: binomial degree ' + d + ' LC ' + lc);
      } },
      { id: 'e5c', level: 'EMG', make: function (r) {
        var d = r.pick([7, 7, 6, 8]), f = r.pick([[1, 2], [1, 2], [2, 3], [3, 4]]), fr = '\\frac{' + f[0] + '}{' + f[1] + '}', key = fr + 'a^{' + (d - 3) + '}b^{2}c';
        return examplePart('a <b>monomial</b> of degree ' + t(d) + ' in <b>three</b> variables, with numerical coefficient ' + t(fr), { terms: 1, nvars: 3, degree: d, coef: f, vars: ['a', 'b', 'c'] }, key,
          [fr + 'abc^' + (d - 2), '\\frac{' + f[0] + 'a^' + (d - 2) + 'bc}{' + f[1] + '}'], [fr + 'a^' + (d - 2) + 'b^2c', fr + 'a^' + (d - 2) + 'b', f[0] + 'a^' + (d - 3) + 'b^2c'],
          'For example ' + t(key) + ': one term, the three variables ' + t('a,\\ b,\\ c') + ', degree ' + t((d - 3) + '+2+1=' + d) + ', coefficient ' + t(fr) + '.', ['Write ' + t(fr) + ' in front of three different letters whose exponents add to ' + t(d) + '.'], 'example: monomial degree ' + d + ' 3 vars');
      } },
      { id: 'e5d', level: 'PRG', make: function (r) {
        var d = r.pick([3, 3, 4]), key = d === 3 ? '-x^{3}-2x^{2}-3x-4' : '-x^{4}-2x^{3}-3x^{2}-4x-5', n = d + 1;
        return examplePart('a ' + (n === 4 ? 'four' : 'five') + '-term polynomial in one variable, of degree ' + t(d) + ', written in <b>descending</b> order, whose ' + (n === 4 ? 'four' : 'five') + ' coefficients are ' + (n === 4 ? 'four' : 'five') + ' <b>different negative integers</b>', { terms: n, nvars: 1, degree: d, distinctNeg: true, order: 'desc', vars: ['x'] }, key,
          d === 3 ? ['-5x^3-x^2-7x-2', '-2x^3-9x^2-4x-1'] : ['-5x^4-x^3-7x^2-2x-3'], d === 3 ? ['-4-3x-2x^2-x^3', '-x^3-2x^2-3x+4', '-x^3-x^2-3x-4', '-x^3-2x^2-3x'] : ['-5-4x-3x^2-2x^3-x^4', '-x^4-2x^3-3x^2-4x+5'],
          'For example ' + t(key) + ': ' + (n) + ' terms in ' + t('x') + ' (so every power from ' + t(d) + ' down to ' + t('0') + ' appears), descending order, and the coefficients ' + t(key.match(/-\d?/g).map(function (s) { return s === '-' ? '-1' : s; }).join(',\\ ')) + ' are different negative integers.', ['With ' + n + ' terms and degree ' + t(d) + ' in one variable, every power from ' + t(d) + ' down to ' + t('0') + ' must appear (the constant is a coefficient too).'], 'example: ' + n + '-term descending negatives');
      } }] },
    { num: '6', section: 'Extra practice B — Algebra Tiles', stem: 'State the polynomial expression which describes each diagram. Write each answer in descending powers of ' + t('x') + '.' + HW.tiles.legend(), parts: [
      { id: 'e6a', level: 'BEG', make: function (r) { return tileReadPart({ x2: [0, 1], x: [r.int(2, 4), 0], one: [0, r.int(1, 3)] }, { order: 'desc' }); } },
      { id: 'e6b', level: 'BEG', make: function (r) { return tileReadPart({ x2: [r.int(2, 3), 0], x: [0, r.int(2, 4)], one: [r.int(1, 2), 0] }, { order: 'desc' }); } },
      { id: 'e6c', level: 'BEG', make: function (r) { return tileReadPart({ x2: [0, r.int(1, 3)], x: [r.int(1, 3), 0] }, { order: 'desc' }); } }] },
    { num: '7', stem: 'Now go the other way. For each polynomial, build the tiles that represent it. (Shaded = positive, white = negative.)', parts: [
      { id: 'e7a', level: 'BEG', make: function (r) { return buildPart({ x2: r.int(2, 3), x: -r.int(1, 3), one: r.int(2, 4) }); } },
      { id: 'e7b', level: 'BEG', make: function (r) { return buildPart({ x2: -r.int(1, 2), x: -r.int(2, 3), one: 0 }); } },
      { id: 'e7c', level: 'BEG', make: function (r) { return buildPart({ x2: 0, x: r.int(2, 3), one: -r.int(3, 5) }); } }] },
    { num: '8', stem: function (sh) { return 'The diagram below has not been simplified — it still contains <b>zero pairs</b> (a shaded and a white tile of the same shape, worth ' + t('0') + ' together).' + tilesFig(sh.c, 'unsimplified algebra tiles'); },
      shared: function (r) {
        var c; do { c = { x2: [r.int(1, 3), r.int(1, 2)], x: [r.int(1, 2), r.int(1, 4)], one: [r.int(2, 4), r.int(1, 3)] }; } while (P.count(tilePoly(c)) < 2 || c.x2[0] + c.x2[1] + c.x[0] + c.x[1] + c.one[0] + c.one[1] > 14);
        return { c: c };
      },
      parts: [
        { id: 'e8a', level: 'BEG', make: function (r, sh) {
          var c = sh.c, zp = ['x2', 'x', 'one'].map(function (k) { return Math.min(c[k][0], c[k][1]); });
          var fl = [{ name: 'x² zero pairs', label: t('x^{2}') + '-tiles' }, { name: 'x zero pairs', label: t('x') + '-tiles' }, { name: 'unit zero pairs', label: 'unit tiles' }];
          return KP.fields('How many zero pairs of each shape are there?', fl, zp.map(function (z, i) { var k = ['x2', 'x', 'one'][i]; return K.number(z, function (v) { return v === c[k][0] + c[k][1] ? { code: 'zero-pairs', hint: 'A zero pair is <b>one</b> shaded and <b>one</b> white tile. Count pairs, not tiles.' } : v === Math.max(c[k][0], c[k][1]) ? { code: 'zero-pairs', hint: 'Each pair needs one tile of each colour, so the number of pairs is limited by the colour with fewer tiles.' } : null; }); }),
            zp.map(String), zp.join(', '), ['x2', 'x', 'one'].map(function (k, i) { return ['x²', 'x', 'unit'][i] + ': ' + c[k][0] + ' shaded, ' + c[k][1] + ' white → <b>' + zp[i] + '</b> zero pair' + (zp[i] === 1 ? '' : 's'); }).join('<br>'),
            ['Match each white tile with a shaded tile of the same shape.'], 'zero pairs');
        } },
        { id: 'e8b', level: 'EMG', make: function (r, sh) { var p = tileReadPart(sh.c, { order: 'desc' }); p.prompt = 'Write the simplified polynomial in descending powers of ' + t('x') + '.'; return p; } }] },
    { num: '9', stem: function (sh) { return 'With tiles, a subtraction is done by <b>adding the opposite</b>. Consider ' + t(bracketsTex([{ s: 1, a: sh.A }, { s: -1, a: sh.B }])) + '.'; },
      shared: function (r) {
        var A, Bq, g = 0;
        do { A = [T(r.int(2, 3), 'x', 2), T(-r.int(2, 4), 'x', 1), T(r.int(1, 3))]; Bq = [T(1, 'x', 2), T(-r.int(3, 6), 'x', 1), T(-r.int(1, 3))]; g++; } while (g < 100 && P.count(P.sub(S(A), S(Bq))) < 3);
        return { A: A, B: Bq };
      },
      parts: [
        { id: 'e9a', sub: 'a i', level: 'BEG', make: function (r, sh) {
          var opp = P.neg(S(sh.B));
          return pp('Write the opposite of ' + t(W(sh.B)) + '.', opp, { text: 'opposite of ' + plainPoly(S(sh.B)), wrong: [{ is: P.add(P.neg(sh.B[0]), sh.B[1], sh.B[2]), code: 'first-only', hint: 'The opposite changes the sign of <b>every</b> term.' }],
            sol: 'Change the sign of every term: ' + t(tx(opp)) + '. With tiles: flip every tile to the other colour (' + tileDesc({ x2: tc(P.coef(opp, { x: 2 })[0]), x: tc(P.coef(opp, { x: 1 })[0]), one: tc(P.constant(opp)[0]) }) + ').', hints: ['The opposite of a polynomial has every sign changed.'] });
        } },
        { id: 'e9t', sub: 'a ii', level: 'BEG', make: function (r, sh) {
          var Bp = S(sh.B), cf = function (p, e) { return e ? P.coef(p, { x: e })[0] : P.constant(p)[0]; };
          var b = { x2: cf(Bp, 2), x: cf(Bp, 1), one: cf(Bp, 0) }, opp = { x2: -b.x2, x: -b.x, one: -b.one };
          return buildPart(opp, { prompt: 'Which tiles would you <b>add</b> to subtract ' + t(B(sh.B)) + '? Build them.', text: 'tiles for the opposite of ' + plainPoly(Bp),
            flipHint: 'Those are the tiles for ' + t(W(sh.B)) + ' itself. Subtracting means adding the <b>opposite</b>: flip every tile to the other colour.',
            wrong: [{ is: { x2: -b.x2, x: b.x, one: b.one }, code: 'first-only', hint: 'You flipped only the first tile group. The opposite changes the sign of <b>every</b> term, so flip every tile.' }],
            bad: [{ x2: -b.x2, x: b.x, one: b.one }],
            sol: 'Subtracting ' + t(B(sh.B)) + ' is the same as adding its opposite, ' + t(P.tex(P.neg(Bp))) + ': flip every tile to the other colour. Add ' + tileDesc({ x2: tc(opp.x2), x: tc(opp.x), one: tc(opp.one) }) + '.',
            hints: ['Start from the tiles for ' + t(W(sh.B)) + ', then change the colour of every tile.'] });
        } },
        { id: 'e9b', sub: 'b', level: 'EMG', make: function (r, sh) {
          var opp = P.neg(S(sh.B)), A = S(sh.A), keys = [{ x: 2 }, { x: 1 }, {}];
          var zp = keys.map(function (v) { var a = P.coef(A, v)[0], b = P.coef(opp, v)[0]; return a * b < 0 ? Math.min(Math.abs(a), Math.abs(b)) : 0; });
          var fl = [{ name: 'x² zero pairs', label: t('x^{2}') + '-tiles' }, { name: 'x zero pairs', label: t('x') + '-tiles' }, { name: 'unit zero pairs', label: 'unit tiles' }];
          return KP.fields('After the tiles for ' + t(W(sh.A)) + ' and for the opposite, ' + t(tx(opp)) + ', are put together, how many zero pairs of each shape form?', fl, zp.map(function (z, i) { var a = P.coef(A, keys[i])[0], b = P.coef(opp, keys[i])[0]; return K.number(z, function (v) { return a * b > 0 && v > 0 ? { code: 'zero-pairs', hint: 'These tiles are all the same colour, so they can’t form zero pairs.' } : null; }); }),
            zp.map(String), zp.join(', '), keys.map(function (v, i) { var a = P.coef(A, v)[0], b = P.coef(opp, v)[0]; return ['x²', 'x', 'unit'][i] + ': ' + t(a) + ' and ' + t(b) + ' → <b>' + zp[i] + '</b> zero pair' + (zp[i] === 1 ? '' : 's'); }).join('<br>'),
            ['A zero pair needs one positive and one negative tile of the same shape.'], 'zero pairs in subtraction');
        } },
        { id: 'e9c', sub: 'c', level: 'EMG', make: function (r, sh) { return addSub('State the result.', [{ s: 1, a: sh.A }, { s: -1, a: sh.B }], { text: 'subtract by opposite' }); } },
        { id: 'e9d', sub: 'd', level: 'BEG', make: function (r, sh) {
          var ans = P.sub(S(sh.A), S(sh.B)), v = P.at(ans, { x: 1 }), a1 = P.at(S(sh.A), { x: 1 }), b1 = P.at(S(sh.B), { x: 1 });
          var fl = [{ name: 'Original', label: 'Original expression at ' + t('x=1') }, { name: 'Answer', label: 'Result at ' + t('x=1') }];
          return KP.fields('The simplified result is ' + t(tx(ans)) + '. Check it by substituting ' + t('x=1') + ' into the original expression and into this result.', fl, [K.number(v, function (x) { return x === a1 + b1 ? { code: 'no-change', hint: 'Work out each bracket at ' + t('x=1') + ', then <b>subtract</b>: ' + t('(' + a1 + ')-(' + b1 + ')') + '.' } : null; }), K.number(v)], [String(v), String(v)], t(v) + ' and ' + t(v),
            'Original: ' + t('(' + a1 + ')-(' + b1 + ')=' + v) + '. Answer: ' + t(tx(ans) + '\\big|_{x=1}=' + v) + '. They agree. ✓', ['Replace every ' + t('x') + ' with ' + t('1') + ' (so ' + t('x^{2}=1') + ').'], 'check at x=1');
        } }] },
    { num: '10', section: 'Extra practice C — Like Terms in Two Variables', stem: 'Terms are <b>like</b> only if they have the same variables raised to the same exponents. Classify each pair.', parts: [
      { id: 'e10a', level: 'EMG', make: function (r) {
        var c = r.int(2, 9), a = r.int(2, 4), b = r.int(2, 5), cc = r.int(2, 9); if (a === b) b = a + 1; var f = r.pick([[1, 2], [1, 3], [3, 4]]), fr = '\\frac{' + f[0] + '}{' + f[1] + '}';
        var rows = [{ tex: c + 'xy,\\ ' + c + 'x^{2}y', w: 'exp', why: t(c + 'xy=' + c + 'x^{1}y') + ': the exponent on ' + t('x') + ' is ' + t('1') + ' in one term and ' + t('2') + ' in the other.' },
          { tex: '-' + cc + 'a^{' + a + '}b^{' + b + '},\\ ' + (cc + 2) + 'b^{' + b + '}a^{' + a + '}', w: 'like', why: 'The order of the factors doesn’t matter: both are ' + t('a^{' + a + '}b^{' + b + '}') + '. Different coefficients are fine.' },
          { tex: fr + 'm^{2}n,\\ ' + fr + 'mn^{2}', w: 'exp', why: 'Same letters, but the exponents are swapped: ' + t('m^{2}n') + ' vs ' + t('mn^{2}') + '. Equal coefficients don’t make terms like.' }];
        return likeGrid(rows, 'like/unlike pairs (a)–(c)');
      } },
      { id: 'e10b', level: 'BEG', make: function (r) {
        var c = r.int(2, 9), d = r.int(2, 9), k = r.int(2, 9);
        var rows = [{ tex: c + 'x^{2}y,\\ -x^{2}y', w: 'like', why: 'Both are ' + t('x^{2}y') + '; only the coefficients (' + t(c) + ' and ' + t('-1') + ') differ.' },
          { tex: k + 'pq,\\ ' + k + 'p', w: 'var', why: t(k + 'pq') + ' contains ' + t('q') + '; ' + t(k + 'p') + ' has no ' + t('q') + ' at all.' },
          { tex: '-' + d + ',\\ \\frac{7}{3}', w: 'like', why: 'Both are constants (no variables, degree ' + t('0') + '), so they are like terms.' }];
        return likeGrid(r.shuffle(rows), 'like/unlike pairs (d)–(f)');
      } }] },
    { num: '11', stem: 'Simplify by collecting like terms. Sort the terms into groups <b>before</b> you add — ' + t('xy') + ', ' + t('x^{2}y') + ' and ' + t('xy^{2}') + ' are three different groups.', parts: [
      { id: 'e11a', level: 'BEG', make: function (r) { var a = r.int(2, 9), b = r.int(2, 5), c = r.int(2, 9); return likePart([M(a, { x: 1, y: 1 }), M(-b, { x: 2, y: 1 }), M(c, { x: 1, y: 1 }), M(1, { x: 2, y: 1 })]); } },
      { id: 'e11b', level: 'BEG', make: function (r) { var a = r.int(3, 9), b = r.int(2, 6), c; do { c = r.int(2, 9); } while (c === b); return likePart([M(a, { a: 2, b: 1 }), M(-b, { a: 1, b: 2 }), M(-1, { a: 2, b: 1 }), M(c, { a: 1, b: 2 })]); } },
      { id: 'e11c', level: 'EMG', make: function (r) { var b = r.int(2, 5), c, d = r.int(2, 6); do { c = r.int(2, 4); } while (c === b); return likePart([M(1, { m: 2, n: 1 }), M(b, { m: 1, n: 2 }), M(-d, { m: 2, n: 1 }), M(1, { m: 1, n: 1 }), M(-c, { m: 1, n: 2 })]); } },
      { id: 'e11d', level: 'EMG', make: function (r) { var a = r.int(2, 5), b = r.int(2, 6), c = r.int(2, 6), d; do { d = r.int(3, 12); } while (d === c); return likePart([M(a, { x: 2, y: 2 }), M(-b, { x: 1, y: 1 }), M(c), M(-1, { x: 2, y: 2 }), M(b, { x: 1, y: 1 }), M(-d)]); } },
      { id: 'e11e', level: 'EMG', make: function (r) { var a = r.int(2, 9), b = r.int(2, 6), c = r.int(2, 7); return likePart([M(a, { p: 1, q: 2 }), M(-b, { p: 2, q: 1 }), M(c, { p: 1, q: 1 }), M(-a, { p: 1, q: 2 }), M(b, { p: 2, q: 1 })]); } },
      { id: 'e11f', level: 'EMG', make: function (r) { var f = r.pick([[1, 2], [1, 3], [1, 4]]), g = r.pick([3, 5, 7].filter(function (x) { return x % f[1] !== 0 || true; })), b = r.int(2, 5), c; do { c = r.int(1, 4); } while (c === b); return likePart([M(f, { u: 2, v: 1 }), M(b, { u: 1, v: 2 }), M([-g, f[1]], { u: 2, v: 1 }), M(-c, { u: 1, v: 2 })]); } }] },
    { num: '12', section: 'Extra practice D — Adding and Subtracting Whole Brackets', stem: 'Every subtraction sign in front of a bracket must reach <b>every</b> term inside it. Simplify.', parts: [
      { id: 'e12a', level: 'BEG', make: function (r) {
        var a = r.int(3, 6), b = r.int(2, 6), c = r.int(4, 9), d, e, f; do { d = r.int(1, 5); e = r.int(1, 2); f = r.int(1, 5); } while (d === b || a === e || f === c);
        var A = [M(a, { x: 2, y: 1 }), M(-b, { x: 1, y: 1 }), T(c)], Bq = [M(d, { x: 1, y: 1 }), M(-e, { x: 2, y: 1 }), T(-f)];
        return addSub(null, [{ s: 1, a: A }, { s: 1, a: Bq }], { text: 'add two-variable brackets' });
      } },
      { id: 'e12b', level: 'EMG', make: function (r) {
        var A = [T(r.int(3, 8), 'a', 3), T(-r.int(1, 4), 'a', 1), T(r.int(1, 5))], Bq = [T(1, 'a', 3), T(-r.int(2, 6), 'a', 2), T(r.int(1, 4), 'a', 1), T(-r.int(2, 9))];
        return addSub(null, [{ s: 1, a: A }, { s: -1, a: Bq }], { text: 'subtract (missing a² in first)' });
      } },
      { id: 'e12c', level: 'PRG', make: function (r) {
        var a = r.int(2, 4), b1 = r.int(1, a - 1), b = r.int(3, 9), c = r.int(2, 6);
        var A = [T(a + 1, 'm', 2), T(-b, 'm', 1)], Bq = [T(b1, 'm', 2), T(-c)], C = [T(a + 1 - b1, 'm', 2), T(-b, 'm', 1), T(c)];
        var parts = [{ s: 1, a: A }, { s: -1, a: Bq }, { s: -1, a: C }], flat = A.concat(NEG(Bq), NEG(C));
        var firstOnly = P.add(S(A), P.neg(Bq[0]), Bq[1], P.neg(C[0]), C[1], C[2]);
        var p = KP.math(t(bracketsTex(parts)), zeroChk({ wrong: wl(P.num(0), [{ is: firstOnly, code: 'first-only', hint: 'A minus sign in front of a bracket changes the sign of <b>every</b> term inside it.' }, { is: P.add(S(A), S(Bq), S(C)), code: 'no-change', hint: 'Subtract both brackets: change every sign inside each one.' }]) }), '0',
          'Change every sign in both subtracted brackets:<br>' + t(W(flat)) + '<br>Collect like terms: ' + groupsTex(flat) + '<br>' + t('=0') + ' — everything cancels.', ['Remove all the brackets first, changing the signs inside each bracket that follows a minus sign.'], 'three brackets cancelling to 0', { keys: 'poly', vars: ['m'], placeholder: PH });
        p.bad = [tx(firstOnly)];
        return p;
      } },
      { id: 'e12d', level: 'PRG', make: function (r) {
        var A, Bq, C, inner, ans, g = 0;
        do {
          A = [T(r.int(3, 6), 'y', 3), T(-1, 'y', 1)]; Bq = [T(r.int(2, 3), 'y', 3), T(r.int(2, 5), 'y', 2)]; C = [T(1, 'y', 3), T(-1, 'y', 1), T(r.int(2, 8))];
          inner = P.sub(S(Bq), S(C)); ans = P.sub(S(A), inner); g++;
        } while (g < 100 && P.count(ans) < 4);
        var prompt = t('(' + W(A) + ')-\\big[(' + W(Bq) + ')-(' + W(C) + ')\\big]');
        return pp(prompt, ans, { text: 'nested brackets', wrong: [{ is: P.sub(P.sub(S(A), S(Bq)), S(C)), code: 'inner-sign', hint: 'The minus in front of the square bracket reaches everything inside it, so the ' + t('-(' + W(C) + ')') + ' becomes ' + t('+(' + W(C) + ')') + '. Simplify the inner bracket first.' }],
          sol: 'Inner bracket first: ' + t('(' + W(Bq) + ')-(' + W(C) + ')=' + W(Bq.concat(NEG(C))) + '=' + tx(inner)) + '.<br>Then ' + t('(' + W(A) + ')-(' + tx(inner) + ')=' + tx(ans)) + '.', hints: ['Simplify the inner bracket ' + t('[\\ \\ ]') + ' first, then subtract the result.'] });
      } }] },
    { num: '13', stem: 'Subtract in the vertical format. Change the sign of every term in the bottom polynomial first, then add down the columns.', parts: [
      { id: 'e13a', level: 'EMG', make: function (r) { var A = [T(r.int(5, 9), 'x', 2), T(-r.int(2, 6), 'x', 1), T(r.int(2, 9))], Bq = [T(r.int(2, 4), 'x', 2), T(-r.int(7, 9), 'x', 1), T(-r.int(1, 5))]; return addSub(t(vert(A, Bq)), [{ s: 1, a: A }, { s: -1, a: Bq }], { text: 'vertical subtraction' }); } },
      { id: 'e13b', level: 'EMG', make: function (r) { var bx = r.int(2, 6), c = r.int(2, 9); var A = [T(-r.int(2, 5), 'x', 3), T(bx, 'x', 1), T(-c)], Bq = [T(1, 'x', 3), T(-r.int(1, 4), 'x', 2), T(bx, 'x', 1), T(-c)]; return addSub(t(vert(A, Bq)), [{ s: 1, a: A }, { s: -1, a: Bq }], { text: 'vertical subtraction, a column cancels', lead: 'The top row has no ' + t('x^{2}') + '-term (think of it as ' + t('0x^{2}') + '). Change every sign in the bottom row, then add down the columns.' }); } },
      { id: 'e13c', level: 'EMG', make: function (r) { var b = r.int(3, 6); var A = [M(r.int(3, 8), { a: 2, b: 1 }), M(-b, { a: 1, b: 1 }), T(r.int(1, 5))], Bq = [M(-r.int(1, 3), { a: 2, b: 1 }), M(r.int(2, 6), { a: 1, b: 1 }), T(-r.int(2, 9))]; return addSub(t(vert(A, Bq)), [{ s: 1, a: A }, { s: -1, a: Bq }], { text: 'vertical subtraction two variables' }); } }] },
    { num: '14', stem: 'Subtract as directed. Read the wording carefully — “subtract ' + t('A') + ' from ' + t('B') + '” means ' + t('B-A') + '.', parts: [
      { id: 'e14a', level: 'PRG', make: function (r) {
        var A = [T(1, 'x', 2), T(r.int(2, 6), 'x', 1), T(-r.int(2, 7))], Bq = [T(r.int(2, 5), 'x', 2), T(-r.int(1, 4), 'x', 1), T(r.int(1, 4))], C = [T(r.int(2, 4), 'x', 2), T(-r.int(5, 9), 'x', 1), T(r.int(2, 6))];
        var sum = P.add(S(A), S(Bq)), ans = P.sub(sum, S(C));
        return pp('Subtract ' + t('(' + W(C) + ')') + ' from the sum of ' + t('(' + W(A) + ')') + ' and ' + t('(' + W(Bq) + ')') + '.', ans, { text: 'subtract from a sum',
          wrong: [{ is: P.sub(S(C), sum), code: 'reversed', hint: '“Subtract ' + t('C') + ' from the sum” means ' + t('(\\text{sum})-C') + '.' }, { is: P.add(sum, S(C)), code: 'no-change', hint: 'Subtracting means changing the sign of every term of ' + t('(' + W(C) + ')') + '.' }, { is: P.add(sum, P.neg(C[0]), C[1], C[2]), code: 'first-only', hint: 'Change the sign of <b>every</b> term of ' + t('(' + W(C) + ')') + ', not just the first.' }],
          sol: 'Sum: ' + t('(' + W(A) + ')+(' + W(Bq) + ')=' + tx(sum)) + '.<br>Then ' + t('(' + tx(sum) + ')-(' + W(C) + ')=' + tx(sum) + W(NEG(C)).replace(/^([^-])/, '+$1') + '=' + tx(ans)) + '.', hints: ['Add the two brackets first. Then subtract ' + t('(' + W(C) + ')') + ' from that sum.'] });
      } },
      { id: 'e14b', level: 'PRG', make: function (r) {
        var mn = function (c, a, b) { return M(c, { m: a, n: b }); }, X, Y, Z, ans, g = 0;
        do { X = [mn(r.int(6, 9), 2, 1), mn(-r.int(2, 5), 1, 1), T(r.int(1, 5))]; Y = [mn(r.int(1, 3), 2, 1), mn(r.int(1, 3), 1, 1)]; Z = [mn(r.int(1, 2), 2, 1), mn(-r.int(3, 6), 1, 1), T(-r.int(1, 5))]; ans = P.sub(S(X), P.add(S(Y), S(Z))); g++; } while (g < 100 && P.count(ans) < 2);
        var sum = P.add(S(Y), S(Z));
        return pp('From ' + t('(' + W(X) + ')') + ' subtract the sum of ' + t('(' + W(Y) + ')') + ' and ' + t('(' + W(Z) + ')') + '.', ans, { text: 'from X subtract sum',
          wrong: [{ is: P.sub(sum, S(X)), code: 'reversed', hint: '“From ' + t('X') + ' subtract …” means start with ' + t('X') + ': ' + t('X-(\\text{sum})') + '.' }, { is: P.add(P.sub(S(X), S(Y)), S(Z)), code: 'second-added', hint: 'Subtract the <b>whole</b> sum: find ' + t('(' + W(Y) + ')+(' + W(Z) + ')') + ' first.' }],
          sol: 'Sum: ' + t('(' + W(Y) + ')+(' + W(Z) + ')=' + tx(sum)) + '.<br>Then ' + t('(' + W(X) + ')-(' + tx(sum) + ')=' + tx(ans)) + '.', hints: ['Find the sum first, then subtract it from ' + t('(' + W(X) + ')') + '.'] });
      } },
      { id: 'e14c', level: 'PRG', make: function (r) {
        var A = [T(r.int(2, 4), 'x', 2), T(-r.int(2, 6), 'x', 1), T(r.int(1, 4))], Bq = [T(1, 'x', 2), T(r.int(2, 5), 'x', 1), T(-r.int(2, 6))], ans = P.sub(S(Bq), S(A));
        return pp('What must be <b>added</b> to ' + t('(' + W(A) + ')') + ' to give ' + t('(' + W(Bq) + ')') + '?', ans, { text: 'what must be added',
          wrong: [{ is: P.sub(S(A), S(Bq)), code: 'reversed', hint: 'Check: ' + t('(' + W(A) + ')+(\\text{your answer})') + ' should give ' + t('(' + W(Bq) + ')') + '. You need target − start.' }, { is: P.add(S(A), S(Bq)), code: 'no-change', hint: 'The missing piece is the <b>difference</b>: target − start.' }],
          sol: 'Missing = target − start: ' + t('(' + W(Bq) + ')-(' + W(A) + ')=' + W(Bq.concat(NEG(A))) + '=' + tx(ans)) + '.<br>Check: ' + t('(' + W(A) + ')+(' + tx(ans) + ')=' + W(Bq)) + ' ✓', hints: ['If ' + t('A+?=B') + ', then ' + t('?=B-A') + '.'] });
      } }] },
    { num: '15', section: 'Extra practice E — Find the Error', stem: function (sh) { return 'Asked to simplify ' + t(sh.a + 'x^{2}+' + sh.b + 'x') + ', a student wrote ' + t(sh.a + 'x^{2}+' + sh.b + 'x=' + (sh.a + sh.b) + 'x^{3}') + '.'; },
      shared: function (r) { return { a: r.int(2, 6), b: r.int(2, 6), x: r.pick([2, 3]) }; },
      parts: [
        { id: 'e15a', level: 'BEG', make: function (r, sh) {
          var o = sh.a * sh.x * sh.x + sh.b * sh.x, s = (sh.a + sh.b) * Math.pow(sh.x, 3), fl = [{ name: 'Original', label: 'Original at ' + t('x=' + sh.x) }, { name: 'Student', label: 'Student’s answer at ' + t('x=' + sh.x) }];
          return KP.fields('Substitute ' + t('x=' + sh.x) + ' into the original expression and into the student’s answer.', fl, [K.number(o, function (v) { return v === sh.a * 2 * sh.x + sh.b * sh.x ? { code: 'mult-exp', hint: t('x^{2}') + ' means ' + t('x\\times x') + ', not ' + t('2x') + '.' } : null; }), K.number(s)], [String(o), String(s)], t(o) + ' and ' + t(s),
            'Original: ' + t(sh.a + '(' + sh.x + ')^{2}+' + sh.b + '(' + sh.x + ')=' + sh.a * sh.x * sh.x + '+' + sh.b * sh.x + '=' + o) + '. Student: ' + t((sh.a + sh.b) + '(' + sh.x + ')^{3}=' + s) + '. They are different, so the student’s answer is wrong.', ['Square or cube first, then multiply by the coefficient.'], 'substitute to test');
        } },
        { id: 'e15b', level: 'EMG', make: function (r, sh) {
          var e = sh.a + 'x^{2}+' + sh.b + 'x';
          return KP.mc(r, 'Why can’t ' + t(sh.a + 'x^{2}') + ' and ' + t(sh.b + 'x') + ' be combined, and what is the simplest form of ' + t(e) + '?', [
            { html: 'They are unlike terms (the exponents on ' + t('x') + ' are different), so ' + t(e) + ' is already in simplest form.', right: true },
            { html: 'They can be combined, but the answer is ' + t((sh.a + sh.b) + 'x^{2}') + '.', why: 'Only like terms (same variable, <b>same exponent</b>) can be added. ' + t('x^{2}') + ' and ' + t('x') + ' have different exponents.' },
            { html: 'They have different coefficients, so they can’t be combined; the simplest form is ' + t(e) + '.', why: 'Different coefficients are fine for like terms (' + t('2x+3x=5x') + '). The reason is the <b>exponents</b>.' },
            { html: 'They can be combined to ' + t((sh.a + sh.b) + 'x^{3}') + ' because ' + t('2+1=3') + '.', why: 'Exponents are added when terms are <b>multiplied</b>, not added. And unlike terms can’t be added into one term at all.' }],
            'Like terms need the same variable raised to the <b>same exponent</b>. ' + t(sh.a + 'x^{2}') + ' has exponent ' + t('2') + ', ' + t(sh.b + 'x') + ' has exponent ' + t('1'), ['Compare the exponents of ' + t('x') + ' in the two terms.'], 'why unlike terms');
        } },
        { id: 'e15c', level: 'BEG', make: function (r, sh) {
          var ans = M(sh.a + sh.b, { x: 2 });
          return pp('The same student then wrote ' + t(sh.a + 'x^{2}+' + sh.b + 'x^{2}=' + (sh.a + sh.b) + 'x^{4}') + '. Write the correct simplification of ' + t(sh.a + 'x^{2}+' + sh.b + 'x^{2}') + '.', ans, { text: 'correct ax^2+bx^2',
            wrong: [{ is: M(sh.a + sh.b, { x: 4 }), code: 'add-exp', hint: 'When like terms are added, the coefficients are added but the variable part — exponent included — stays the same.' }, { is: M(sh.a * sh.b, { x: 4 }), code: 'mult-exp', hint: 'You multiplied the terms. Here they are <b>added</b>: add the coefficients, keep ' + t('x^{2}') + '.' }],
            sol: t(sh.a + 'x^{2}+' + sh.b + 'x^{2}=(' + sh.a + '+' + sh.b + ')x^{2}=' + (sh.a + sh.b) + 'x^{2}') + '. The coefficients are added; the variable part, exponent included, is unchanged.', hints: ['Add the coefficients; keep the variable part the same.'] });
        } }] },
    { num: '16', stem: function (sh) { return 'A second student was asked to simplify ' + t(bracketsTex([{ s: 1, a: sh.A }, { s: -1, a: sh.B }])) + ' and wrote:' + '\\[\\begin{aligned}&' + bracketsTex([{ s: 1, a: sh.A }, { s: -1, a: sh.B }]) + '\\\\ &=' + W(sh.A.concat([P.neg(sh.B[0]), sh.B[1], sh.B[2]])) + '\\\\ &=' + tx(sh.stu) + '\\end{aligned}\\]'; },
      shared: function (r) {
        var A, Bq, stu, ans, g = 0;
        do { A = [T(r.int(4, 8), 'y', 2), T(-r.int(2, 6), 'y', 1), T(r.int(3, 9))]; Bq = [T(r.int(1, 3), 'y', 2), T(-r.int(3, 9), 'y', 1), T(r.int(1, 5))]; stu = P.add(S(A), P.neg(Bq[0]), Bq[1], Bq[2]); ans = P.sub(S(A), S(Bq)); g++; } while (g < 100 && (P.count(ans) < 3 || P.count(stu) < 3 || P.at(stu, { y: 1 }) === P.at(ans, { y: 1 })));
        return { A: A, B: Bq, stu: stu, ans: ans };
      },
      parts: [
        { id: 'e16a', level: 'EMG', make: function (r, sh) {
          var b1 = tx(sh.B[1]), b2 = tx(sh.B[2]);
          return KP.mc(r, 'What mistake did the student make?', [
            { html: 'They changed the sign of only the first term of the second bracket: ' + t(b1) + ' and ' + t('+' + b2.replace(/^\+/, '')) + ' should have become ' + t(tx(P.neg(sh.B[1]))) + ' and ' + t(tx(P.neg(sh.B[2]))) + '.', right: true },
            { html: 'They should not have changed the sign of ' + t(tx(sh.B[0])) + '.', why: 'Changing that sign was correct. Look at the <b>other</b> terms of the second bracket.' },
            { html: 'They collected the like terms incorrectly.', why: 'Check their collecting: given the line they wrote, the collecting is correct. The error is earlier, when they removed the brackets.' },
            { html: 'There is no mistake.', why: 'Substitute ' + t('y=1') + ' into the original and into their answer — do you get the same value?' }],
            'The minus sign in front of the bracket must reach <b>every</b> term: the opposite of ' + t(W(sh.B)) + ' is ' + t(tx(P.neg(S(sh.B)))) + '. Only the first term was changed.', ['Write the opposite of the whole second bracket and compare it with what the student wrote.'], 'identify subtraction error');
        } },
        { id: 'e16b', level: 'EMG', make: function (r, sh) {
          return pp('Redo the subtraction correctly.', sh.ans, { text: 'correct the subtraction', wrong: [{ is: sh.stu, code: 'first-only', hint: 'That’s the student’s answer. Change the sign of <b>every</b> term in the second bracket.' }],
            sol: 'Opposite of the second bracket: ' + t(tx(P.neg(S(sh.B))))
              + '.<br>' + t('(' + W(sh.A) + ')+(' + tx(P.neg(S(sh.B))) + ')') + ': ' + groupsTex(sh.A.concat(NEG(sh.B))) + '<br>' + t('=' + tx(sh.ans)), hints: ['Write the opposite of the whole second bracket, then add.'] });
        } },
        { id: 'e16c', level: 'EMG', make: function (r, sh) {
          var o = P.at(S(sh.A), { y: 1 }) - P.at(S(sh.B), { y: 1 }), s = P.at(sh.stu, { y: 1 }), m = P.at(sh.ans, { y: 1 });
          var fl = [{ name: 'Original', label: 'Original' }, { name: 'Student', label: 'Student’s answer' }, { name: 'Correct', label: 'Correct answer' }];
          return KP.fields('The correct result is ' + t(tx(sh.ans)) + '. Substitute ' + t('y=1') + ' into the original expression, into the student’s answer and into the correct result.', fl, [K.number(o), K.number(s), K.number(m)], [String(o), String(s), String(m)], t(o) + ', ' + t(s) + ', ' + t(m),
            'Original: ' + t('(' + P.at(S(sh.A), { y: 1 }) + ')-(' + P.at(S(sh.B), { y: 1 }) + ')=' + o) + '; student: ' + t(s) + '; correct answer: ' + t(m) + '. The original and the correct answer agree, which shows the student’s answer is wrong.', ['At ' + t('y=1') + ', every power of ' + t('y') + ' is ' + t('1') + ': just add up the coefficients (with signs).'], 'check at y=1');
        } }] },
    { num: '17', section: 'Extra practice F — Reasoning About Degree', stem: 'Choose the answer with the correct reason.', parts: [
      { id: 'e17a', level: 'PRG', make: function (r) {
        return KP.mc(r, 'Can a <b>trinomial</b> have degree ' + t('1') + '?', [
          { html: 'Yes, with two or more variables, e.g. ' + t('2x+3y-5') + '; but not with only one variable, since ' + t('x') + '-terms would combine, leaving at most 2 terms.', right: true },
          { html: 'No — a trinomial always has degree at least ' + t('2') + '.', why: 'Try ' + t('2x+3y-5') + ': three terms, and the highest degree of a term is ' + t('1') + '.' },
          { html: 'Yes, for example ' + t('x+2x+3') + '.', why: t('x+2x+3') + ' simplifies to ' + t('3x+3') + ' — only two terms. Like terms must be collected before you count.' },
          { html: 'Yes, in one variable: for example ' + t('x+x^{0}+1') + '.', why: t('x^{0}=1') + ', so this is ' + t('x+2') + ': two terms.' }],
          'Degree ' + t('1') + ' means every term is a constant or a single variable to the first power. In one variable that allows only an ' + t('x') + '-term and a constant (at most 2 terms). With more variables, ' + t('2x+3y-5') + ' is a trinomial of degree ' + t('1') + '.', ['What kinds of terms can a degree-1 polynomial contain? How many different ones are possible in one variable?'], 'trinomial of degree 1?');
      } },
      { id: 'e17b', level: 'BEG', make: function (r) {
        var c = r.int(5, 30);
        return KP.mc(r, 'What is the degree of the non-zero constant ' + t('-' + c) + '?', [
          { html: t('0') + ', because it has no variables, so the sum of the exponents of its variables is ' + t('0') + ' (' + t('-' + c + '=-' + c + 'x^{0}') + ').', right: true },
          { html: t('1') + ', because it is one term.', why: 'Being one term makes it a monomial; the degree counts exponents on variables.' },
          { html: t(c) + ', because that is its size.', why: 'The value of a number isn’t its degree. Count the exponents on the variables.' },
          { html: 'It has no degree, because there is no variable.', why: 'Only the zero polynomial has no degree. A non-zero constant can be written ' + t('-' + c + 'x^{0}') + '.' }],
          t('-' + c + '=-' + c + 'x^{0}') + ': no variable, so the degree is ' + t('0') + '.', ['Degree = sum of the exponents of the variables in the term.'], 'degree of a constant');
      } },
      { id: 'e17d', sub: 'd', level: 'EMG', make: function (r) {
        return KP.mc(r, 'Can a <b>binomial</b> have degree ' + t('0') + '?', [
          { html: 'No. Both terms would have to be constants, and two constants are like terms that combine into one (e.g. ' + t('4+(-9)=-5') + '), leaving a monomial.', right: true },
          { html: 'Yes, for example ' + t('4-9') + '.', why: t('4-9=-5') + ': one term after simplifying. Constants are like terms.' },
          { html: 'Yes, for example ' + t('x+5') + '.', why: t('x+5') + ' has degree ' + t('1') + ', because of the ' + t('x') + '-term.' },
          { html: 'No, because a binomial must contain ' + t('x^{2}') + '.', why: t('x+5') + ' is a binomial of degree ' + t('1') + '. The real reason is about the constants.' }],
          'For degree ' + t('0') + ', both terms would need degree ' + t('0') + ', i.e. both would be constants. Any two constants combine into a single number, so the result is a monomial, not a binomial.', ['What does each term look like if its degree is ' + t('0') + '?'], 'binomial of degree 0?');
      } }] },
    { num: '18', section: 'Extra practice G — Stretch', stem: function (sh) { return 'A quadrilateral has a perimeter of ' + t('(' + tx(sh.per) + ')') + ' cm. Three of its sides measure ' + sh.s.slice(0, 3).map(function (s) { return t('(' + W(s) + ')'); }).join(', ') + ' cm.'; },
      shared: function (r) {
        var s, per, v, vals, g = 0;
        do {
          s = [[T(r.int(2, 4), 'x', 2), T(-r.int(1, 3), 'x', 1), T(r.int(1, 3))], [T(r.int(2, 5), 'x', 2), T(r.int(1, 3), 'x', 1), T(-r.int(3, 6))], [T(1, 'x', 2), T(r.int(3, 7), 'x', 1)], [T(r.int(2, 5), 'x', 2), T(-r.int(2, 4))]];
          per = P.add(S(s[0]), S(s[1]), S(s[2]), S(s[3])); v = r.pick([2, 2, 3]); g++;
          vals = s.map(function (q) { return P.at(S(q), { x: v }); });   // the four sides at x = v must make a real quadrilateral
        } while (g < 100 && (P.count(per) < 3 || vals.some(function (a) { return a <= 0 || 2 * a >= vals[0] + vals[1] + vals[2] + vals[3]; })));
        return { s: s, per: per, v: v };
      },
      parts: [
        { id: 'e18a', level: 'PRG', make: function (r, sh) {
          var parts = [{ s: 1, a: termsOf(sh.per) }, { s: -1, a: sh.s[0] }, { s: -1, a: sh.s[1] }, { s: -1, a: sh.s[2] }];
          var known = P.add(S(sh.s[0]), S(sh.s[1]), S(sh.s[2]));
          var p = addSub('Write and simplify an expression for the length of the fourth side.', parts, { text: 'fourth side',
            sol: 'Sum of the three sides: ' + groupsTex(sh.s[0].concat(sh.s[1], sh.s[2])) + ', i.e. ' + t(tx(known)) + '.<br>Fourth side ' + t('=(' + tx(sh.per) + ')-(' + tx(known) + ')=' + tx(S(sh.s[3]))) + ' cm.',
            wrong: [{ is: P.sub(known, sh.per), code: 'reversed', hint: 'Fourth side = perimeter − (sum of the other three).' }] });
          p.input.after = t('\\text{ cm}');
          return p;
        } },
        { id: 'e18b', level: 'BEG', make: function (r, sh) {
          var f = S(sh.s[3]);
          return KP.mc(r, 'Name the polynomial you found for the fourth side, ' + t(tx(f)) + ', and state its degree.', [
            { html: 'a binomial of degree ' + t('2'), right: true }, { html: 'a binomial of degree ' + t('1'), why: 'The degree is the highest power of ' + t('x') + ': ' + t('x^{2}') + '.' },
            { html: 'a trinomial of degree ' + t('2'), why: 'Count the terms: there are two.' }, { html: 'a monomial of degree ' + t('2'), why: 'Count the terms: the constant is a term too.' }],
            t(tx(f)) + ' has 2 terms (a binomial) and highest power ' + t('x^{2}') + ' (degree ' + t('2') + ').', ['Count the terms, then find the highest power.'], 'name and degree of fourth side', true);
        } },
        { id: 'e18c', level: 'EMG', make: function (r, sh) {
          var env = { x: sh.v }, vals = sh.s.map(function (s) { return P.at(S(s), env); });
          var fl = sh.s.map(function (s, i) { return { name: 'Side ' + (i + 1), label: t(W(s)), after: 'cm' }; });
          return KP.fields('Determine all four side lengths when ' + t('x=' + sh.v) + '.', fl, sh.s.map(function (s, i) { var q = S(s), w = P.coef(q, { x: 2 })[0] * 2 * sh.v + P.coef(q, { x: 1 })[0] * sh.v + P.constant(q)[0]; return K.number(vals[i], function (v) { return v === w ? { code: 'mult-exp', hint: t('x^{2}') + ' at ' + t('x=' + sh.v) + ' is ' + t(sh.v * sh.v) + ', not ' + t(2 * sh.v) + '.' } : null; }); }), vals.map(String), vals.map(function (v) { return t(v + '\\text{ cm}'); }).join(', '),
            sh.s.map(function (s, i) { return t(W(s)) + ' → ' + t(vals[i]) + ' cm'; }).join('<br>') + '<br>Sum: ' + t(vals.join('+') + '=' + vals.reduce(function (a, b) { return a + b; }, 0)) + ' cm; perimeter at ' + t('x=' + sh.v) + ': ' + t(P.at(sh.per, env)) + ' cm ✓',
            ['At ' + t('x=' + sh.v) + ', ' + t('x^{2}=' + sh.v * sh.v) + '.'], 'side lengths at x=' + sh.v);
        } },
        { id: 'e18d', level: 'EMG', make: function (r, sh) {
          var z = sh.s.map(function (s) { return P.at(S(s), { x: 0 }); });
          return KP.mc(r, 'Why can’t ' + t('x=0') + ' be an actual value in this situation?', [
            { html: 'At ' + t('x=0') + ' the sides would be ' + t(z.join(',\\ ')) + ' cm; side lengths must be positive, so some of these are impossible.', right: true },
            { html: 'Because ' + t('0') + ' can never be substituted into a polynomial.', why: 'You can substitute any number. The problem is what the side lengths turn out to be.' },
            { html: 'Because the perimeter would be ' + t('0') + '.', why: 'Work it out: at ' + t('x=0') + ' the perimeter is ' + t(P.at(sh.per, { x: 0 })) + ', not ' + t('0') + '. Look at the individual sides.' },
            { html: 'Because ' + t('x') + ' must be a whole number greater than ' + t('10') + '.', why: 'Nothing says that. Substitute ' + t('x=0') + ' into each side and look at the lengths.' }],
            'At ' + t('x=0') + ' the four sides are ' + t(z.join(',\\ ')) + ' cm. A side length must be positive, and ' + z.filter(function (v) { return v <= 0; }).map(function (v) { return t(v); }).join(', ') + ' are not, so ' + t('x=0') + ' is impossible.', ['Substitute ' + t('x=0') + ' into each side.'], 'why x=0 impossible');
        } }] },
    { num: '19', stem: 'Build a polynomial to order — every condition must hold at once.', parts: [
      { id: 'e19a', level: 'PRG', make: function (r) {
        var D = r.pick([6, 6, 5, 7]), k = r.pick([3, 3, 2]), c = r.pick([9, 9, 4, -5]), key = '-4x^{' + (D - 2) + '}y^{2}+x' + (k - 1 === 1 ? '' : '^{' + (k - 1) + '}') + 'y' + (c < 0 ? c : '+' + c);
        var spec = { terms: 3, nvars: 2, degree: D, constant: c, vars: ['x', 'y'], extra: function (Sp) {
          var ts = P.terms(Sp), top = ts.filter(function (q) { return P.degree(M(1, q.v)) === D; });
          if (top.length !== 1) return { code: 'ex-other', hint: 'Exactly <b>one</b> term may have degree ' + t(D) + '.' };
          if (Object.keys(top[0].v).filter(function (x) { return top[0].v[x]; }).length < 2) return { code: 'ex-other', hint: 'The degree-' + t(D) + ' term must contain <b>both</b> ' + t('x') + ' and ' + t('y') + '.' };
          if (!ts.some(function (q) { return P.degree(M(1, q.v)) === k; })) return { code: 'ex-other', hint: 'The third term must have degree ' + t(k) + '.' };
          return null;
        } };
        return examplePart('Write one polynomial that is a trinomial in ' + t('x') + ' and ' + t('y') + ', has degree ' + t(D) + ', has exactly one term of degree ' + t(D) + ' and that term contains <b>both</b> variables, has a third term of degree ' + t(k) + ', and has ' + t(c) + ' as its constant term.', spec, key,
          ['x^' + (D - 1) + 'y+y^' + k + (c < 0 ? c : '+' + c), '2x^3y^' + (D - 3) + '-xy^' + (k - 1) + (c < 0 ? c : '+' + c)], ['x^' + D + '+x^' + (k - 1) + 'y' + (c < 0 ? c : '+' + c), 'x^' + (D - 2) + 'y^2+x^' + k + 'y' + (c < 0 ? c : '+' + c), 'x^' + (D - 2) + 'y^2+x^' + (k - 1) + 'y+' + (c + 1)],
          'For example ' + t(key) + ': three terms in ' + t('x') + ' and ' + t('y') + '; degrees ' + t(D + ', ' + k + ', 0') + '; the only degree-' + t(D) + ' term contains both variables; constant term ' + t(c) + '.', ['Build it term by term: a degree-' + t(D) + ' term with both letters, a degree-' + t(k) + ' term, then the constant.'], 'example: built to order');
      } },
      { id: 'e19b', level: 'PRG', make: function (r) {
        return KP.mc(r, 'Is there a polynomial in <b>one</b> variable that is a binomial of degree ' + t('4') + ' whose two terms <b>both</b> have degree ' + t('4') + '?', [
          { html: 'No: both terms would be a number times ' + t('x^{4}') + ' — like terms, which combine into one term (e.g. ' + t('3x^{4}+5x^{4}=8x^{4}') + ').', right: true },
          { html: 'Yes: ' + t('3x^{4}+5x^{4}') + '.', why: 'Simplify it: ' + t('3x^{4}+5x^{4}=8x^{4}') + ', a monomial.' },
          { html: 'Yes: ' + t('x^{4}+y^{4}') + '.', why: 'That uses two variables. The question asks for one variable.' },
          { html: 'No, because a binomial can only have degree ' + t('1') + '.', why: t('x^{4}+1') + ' is a binomial of degree ' + t('4') + '. The issue is that <b>both</b> terms have degree ' + t('4') + '.' }],
          'In one variable, a term of degree ' + t('4') + ' must be a number times ' + t('x^{4}') + '. Two such terms are like terms and combine, leaving a monomial — so no such binomial exists. (With two variables, ' + t('x^{4}+y^{4}') + ' would work.)', ['What does a degree-4 term in one variable look like?'], 'binomial with both terms degree 4');
      } }] },
    { num: '20', stem: '<i>(Multiple Choice)</i>', parts: [
      { id: 'e20', level: 'PRG', make: function (r) {
        var A, Bq, tgt, g = 0;
        do { A = [T(r.int(2, 4), 'x', 2), T(r.int(1, 3), 'x', 1), T(-r.int(1, 4))]; Bq = [T(r.int(3, 5), 'x', 2), T(-r.int(2, 4), 'x', 1), T(r.int(1, 4))]; tgt = P.sub(S(A), S(Bq)); g++; } while (g < 100 && (P.count(tgt) < 3 || P.coef(tgt, { x: 2 })[0] >= 0));
        var a2 = P.coef(tgt, { x: 2 })[0], a1 = P.coef(tgt, { x: 1 })[0], a0 = P.constant(tgt)[0];
        var Cc = [T(1, 'x', 2), T(a1, 'x', 1)], Cd = [T(1 - a2, 'x', 2), T(a0)], Copt = P.sub(S(Cc), S(Cd)), k1, m1;
        do { k1 = nz(r, -3, 3); m1 = r.int(3, 9); } while (k1 === a1 || m1 === a0);
        var Dpt = [T(-a2 + 1, 'x', 2), T(k1, 'x', 1), T(m1)], Dq = [T(1, 'x', 2), T(k1 - a1, 'x', 1), T(m1 - a0)];
        var opts = [{ tex: bracketsTex([{ s: 1, a: A }, { s: -1, a: Bq }]), val: tgt, right: true }, { tex: bracketsTex([{ s: 1, a: A }, { s: 1, a: Bq }]), val: P.add(S(A), S(Bq)) },
          { tex: bracketsTex([{ s: 1, a: Cc }, { s: -1, a: Cd }]), val: Copt }, { tex: bracketsTex([{ s: 1, a: Dpt }, { s: -1, a: Dq }]), val: P.sub(S(Dpt), S(Dq)) }];
        return KP.mc(r, 'Which expression simplifies to ' + t(tx(tgt)) + '?', opts.map(function (o) { return { html: t(o.tex), right: !!o.right, why: o.right ? null : 'Simplify it: it equals ' + t(tx(o.val)) + '. Check every sign after a minus in front of a bracket.' }; }),
          opts.map(function (o) { return t(o.tex + '=' + tx(o.val)) + (o.right ? ' ✓' : ''); }).join('<br>'), ['Simplify each option: change every sign inside a bracket that follows a minus sign.'], 'which simplifies to ' + plainPoly(tgt));
      } }] },
    { num: '21', stem: '<i>(Numerical Response)</i>', parts: [
      { id: 'e21', level: 'EMG', make: function (r) {
        var p = r.int(2, 3), q = r.int(2, 4), a = p + q, n = r.int(6, 8), lc = r.pick([1, 1, 2, 3]), f = r.int(2, 5), b = n, c = lc, ans = a * b * c;
        var tri = W([M(r.int(2, 9), { x: p, y: q }), M(-r.int(2, 6), { x: 1, y: 1 }), T(r.int(5, 15))]), one = [T(f, 'x', n - 2), T(-r.int(2, 9), 'x', 2), T(lc, 'x', n), T(-r.int(2, 6))];
        return KP.nr('The trinomial ' + t(tri) + ' has degree ' + t('a') + '. The polynomial ' + t(W(one)) + ' has degree ' + t('b') + ' and, once written in descending order, leading coefficient ' + t('c') + '. The value of ' + t('a\\times b\\times c') + ' is ________.', ans, function (v) {
          if (v === a * b * f) return { code: 'lc-first', hint: 'The leading coefficient is the coefficient of ' + t('x^{' + n + '}') + ' (the highest power), not of the first term written.' };
          if (v === Math.max(p, q) * b * c) return { code: 'deg-max', hint: 'The degree of ' + t('x^{' + p + '}y^{' + q + '}') + ' is the <b>sum</b> ' + t(p + '+' + q) + '.' };
          if (v === a * (n - 2) * f) return { code: 'lc-first', hint: 'Write the second polynomial in descending order first: the highest power is ' + t('x^{' + n + '}') + '.' };
          return null;
        }, t('a=' + p + '+' + q + '=' + a) + ' (degree of ' + t('x^{' + p + '}y^{' + q + '}') + '). Descending: ' + t(tx(S(one))) + ', so ' + t('b=' + n) + ' and ' + t('c=' + lc) + '. ' + t('a\\times b\\times c=' + a + '\\times ' + n + '\\times ' + lc + '=' + ans) + '.',
        ['Two-variable term: add the exponents. One-variable polynomial: rewrite it in descending order first.'], 'NR a×b×c');
      } }] }
  ];
  HW.defineLesson({
    id: 'u3l1', unit: 3, num: '1', title: 'Polynomials: Review and Preview', outcome: 'AN4',
    blurb: 'Terms, degree and names of polynomials — then algebra tiles, like terms, and adding and subtracting polynomials.',
    questions: [
      /* ================= Part A ================= */
      { num: '1', section: 'Part A — Vocabulary, Terms and Degree', stem: 'Identify as a monomial, a binomial, or a trinomial.', parts: [
        { id: '1a', level: 'LIM', make: function (r) {
          var y = r.pick(['y', 'x', 'm', 'n', 'a']), k = r.pick([1, 1, 2, 3, 4, 5, 7]), c = nz(r, -9, 9);
          var arr = r.chance(0.75) ? [T(k, y, 1), T(c)] : [T(Math.abs(c)), T(r.pick([1, -1]) * k, y, 1)];
          return namePart(r, W(arr), 2);
        } },
        { id: '1b', level: 'LIM', make: function (r) {
          var y = r.pick(['y', 'x', 'p', 'k']), k = r.int(2, 9) * (r.chance(0.25) ? -1 : 1), e = r.int(2, 6);
          return namePart(r, W([T(k, y, e)]), 1, 'An exponent doesn’t create extra terms.');
        } },
        { id: '1c', level: 'LIM', make: function (r) {
          var y = r.pick(['y', 'x', 'm', 't']);
          return namePart(r, W([T(r.int(2, 6), y, 2), T(nz(r, -7, 7), y, 1), T(nz(r, -9, 9))]), 3);
        } }] },
      { num: '2', stem: 'State the degree of each monomial.', parts: [
        { id: '2a', level: 'LIM', make: function (r) { var c = r.int(2, 12), v = r.pick(['b', 'x', 'm', 'k']); return degPart(String(c), [[v, 1]], degCoefDiag(c)); } },
        { id: '2b', level: 'BEG', make: function (r) { var c = r.int(2, 9), a = r.int(2, 4), v = r.pick([['x', 'y'], ['a', 'b'], ['m', 'n']]); return degPart(String(c), [[v[0], a], [v[1], 1]], degCoefDiag(c)); } },
        { id: '2c', level: 'BEG', make: function (r) { var c = r.int(3, 30); return degPart(String(c), [], function (v) { return v === c ? { code: 'deg-coef', hint: t(c) + ' is the value of the constant, not its degree. The degree counts the exponents on the variables — and there aren’t any.' } : v === 1 ? { code: 'deg-const', hint: 'There is no variable at all: ' + t(c + '=' + c + 'x^{0}') + '. So the degree is ' + t('0') + '.' } : null; }); } },
        { id: '2d', level: 'BEG', make: function (r) {
          var c = r.int(2, 9), a, b; do { a = r.int(2, 5); b = r.int(2, 4); } while (a === b || a * b === a + b);
          var v = r.pick([['m', 'n'], ['x', 'y'], ['a', 'b']]);
          return degPart('-' + c, [[v[0], a], [v[1], b]], function (x) { return x === c || x === -c ? { code: 'deg-coef', hint: 'That’s the coefficient (with or without its sign). The degree comes from the exponents.' } : null; });
        } },
        { id: '2e', level: 'EMG', make: function (r) {
          var c = r.int(2, 9), a, b; do { a = r.int(2, 4); b = r.int(2, 4); } while (a === b);
          var v = r.pick([['p', 'q', 'r'], ['a', 'b', 'c'], ['x', 'y', 'z']]);
          return degPart(String(c), [[v[0], 1], [v[1], a], [v[2], b]], degCoefDiag(c));
        } }] },
      { num: '3', stem: 'State whether or not each expression is a polynomial. If it is not, choose the reason.', parts: [
        { id: '3a', level: 'BEG', make: function (r) {
          var f = r.pick([[1, 3], [1, 2], [2, 5], [3, 4], [1, 4]]), b = r.int(2, 9), x = r.pick(['x', 'y', 'a']);
          var e = W([T(f, x, 2), T(-b, x, 1)]);
          return isPolyPart(r, e, 0, [null, 'Look at the exponents on ' + t(x) + ': ' + t('2') + ' and ' + t('1') + '. Neither is negative.', 'The exponents are ' + t('2') + ' and ' + t('1') + ' — both whole numbers.', 'A fraction as a <b>coefficient</b> is fine: ' + t(rt(f)) + ' is just a number. Only the exponents on the variables matter.'],
            '<b>Yes.</b> The coefficient ' + t(rt(f)) + ' is just a number, and the exponents ' + t('2') + ' and ' + t('1') + ' are whole numbers.', 'polynomial? ' + plain(e));
        } },
        { id: '3b', level: 'LIM', make: function (r) {
          var k = r.int(2, 9), e = r.int(1, 4), x = r.pick(['n', 'x', 'm']), ex1 = k + x + '^{-' + e + '}';
          return isPolyPart(r, ex1, 1, ['The exponent ' + t('-' + e) + ' is negative. A polynomial’s variables need whole-number exponents ' + t('0, 1, 2, \\ldots'), null, t('-' + e) + ' is an integer — but it is <b>negative</b>. Which reason fits that?', 'There is no fraction or root written here. Look at the exponent.'],
            '<b>No.</b> ' + t(ex1) + ' has a <b>negative exponent</b> on a variable.', 'polynomial? ' + plain(ex1));
        } },
        { id: '3c', level: 'EMG', make: function (r) {
          var m = r.pick([10, 2, 3, 5, 6, 7, 11, 13, 15]), e = '\\sqrt{' + m + '}';
          return isPolyPart(r, e, 0, [null, 'There is no variable at all, so no exponent can be negative.', 'There is no variable at all.', t(e) + ' is just a number (about ' + t((Math.round(Math.sqrt(m) * 100) / 100)) + '): a constant, which is a monomial of degree ' + t('0') + '. Roots of numbers are allowed.'],
            '<b>Yes.</b> ' + t(e) + ' is a constant — a monomial of degree ' + t('0') + '. The square root of a <b>number</b> is just a number.', 'polynomial? √' + m);
        } },
        { id: '3d', level: 'BEG', make: function (r) {
          var k = r.int(2, 9), e = r.int(2, 5), x = r.pick(['x', 'y', 't']), ex1 = '\\frac{' + k + '}{' + x + '^{' + e + '}}';
          return isPolyPart(r, ex1, 1, ['A variable in the denominator: ' + t(ex1 + '=' + k + x + '^{-' + e + '}') + '. That isn’t allowed in a polynomial.', null, t(ex1 + '=' + k + x + '^{-' + e + '}') + ': the exponent is a whole number in size, but it is <b>negative</b>.', 'Right that it isn’t a polynomial — but a fraction alone isn’t the problem (' + t('\\frac{1}{2}x') + ' is a polynomial). What happens to the <b>exponent</b> when ' + t(x) + ' is in the denominator?'],
            '<b>No.</b> ' + t(ex1 + '=' + k + x + '^{-' + e + '}') + ': a variable in the denominator means a <b>negative exponent</b>.', 'polynomial? ' + plain(ex1));
        } },
        { id: '3e', level: 'EMG', make: function (r) {
          var d = r.pick([4, 3, 5, 7]), k = r.pick([1, 2, 3, 5, 7, 9].filter(function (v) { return ex.gcd(v, d) === 1; })), e = r.int(2, 5), x = r.pick(['x', 'y']);
          var ex1 = '\\frac{' + (k === 1 ? '' : k) + x + '^{' + e + '}}{' + d + '}';
          return isPolyPart(r, ex1, 0, [null, 'Rewrite it: ' + t(ex1 + '=\\frac{' + k + '}{' + d + '}' + x + '^{' + e + '}') + '. The exponent is ' + t(e) + ', not negative.', 'Rewrite it: ' + t(ex1 + '=\\frac{' + k + '}{' + d + '}' + x + '^{' + e + '}') + '. The exponent ' + t(e) + ' is a whole number.', 'The fraction bar only divides by the <b>number</b> ' + t(d) + ': ' + t(ex1 + '=\\frac{' + k + '}{' + d + '}' + x + '^{' + e + '}') + '. A number in the denominator is fine; only a <b>variable</b> there is a problem.'],
            '<b>Yes.</b> ' + t(ex1 + '=\\frac{' + k + '}{' + d + '}' + x + '^{' + e + '}') + ': the ' + t(d) + ' is a numerical denominator, not a variable one.', 'polynomial? ' + plain(ex1));
        } },
        { id: '3f', level: 'BEG', make: function (r) {
          var a = r.int(3, 6), h = r.pick(['2.5', '1.5', '0.5', '3.5'].filter(function (s) { return Number(s) < a; })), k = r.int(2, 8), x = r.pick(['x', 'y']);
          var ex1 = x + '^{' + a + '}+' + k + x + '^{' + h + '}';
          return isPolyPart(r, ex1, 2, ['Look at the exponent ' + t(h) + ' on the second term. Is it a whole number?', t(h) + ' isn’t negative. What else is wrong with it?', null, 'There is no fraction or root written — the problem is the exponent ' + t(h) + '.'],
            '<b>No.</b> The exponent ' + t(h) + ' is not a whole number.', 'polynomial? ' + plain(ex1));
        } }] },
      { num: '4', stem: 'For each single-variable polynomial, state the leading coefficient, the constant term and the degree.', parts: [
        { id: '4a', level: 'BEG', make: function (r) {
          var v = r.pick(['t', 'x', 'm', 'w']), n = r.int(3, 6), b = r.pick([1, 1, 2, 3]), c = r.int(2, 12);
          var arr = [T(1, v, n), T(-b, v, 1), T(c)], e = W(arr);
          return rowPart(e, 1, '1', c, String(c), n, { lc: [{ v: n, code: 'lc-exp', hint: t(n) + ' is the exponent (that’s the degree). ' + t(v + '^{' + n + '}=1' + v + '^{' + n + '}') + ', so the leading coefficient is ' + t('1') + '.' }, { v: 0, code: 'lc-hidden', hint: t(v + '^{' + n + '}') + ' means ' + t('1' + v + '^{' + n + '}') + '.' }, { v: -b, code: 'lc-coef', hint: 'That’s the coefficient of the ' + t(v) + '-term. The leading coefficient belongs to the term with the <b>highest</b> power.' }],
            ct: [{ v: -c, code: 'ct-sign', hint: 'Check the sign: the constant term is ' + t('+' + c) + '.' }], deg: function (x) { return x === n + 1 ? { code: 'deg-sum-all', hint: 'The degree of a polynomial is the degree of its <b>highest</b> term, not the sum of all the exponents.' } : x === 3 && n !== 3 ? { code: 'deg-terms', hint: 'That’s the number of terms. The degree is the highest power.' } : null; } },
          'Highest power: ' + t(v + '^{' + n + '}=1' + v + '^{' + n + '}') + ', so the leading coefficient is ' + t('1') + ' and the degree is ' + t(n) + '. The term with no variable is ' + t(c) + '.', 'LC/CT/degree ' + plain(e));
        } },
        { id: '4b', level: 'BEG', make: function (r) {
          var v = r.pick(['s', 'x', 'p']), ds = r.sample([1, 2, 3, 4, 5, 6, 7, 8, 9], 4), cs = [[ds[0], 10], [-ds[1], 10], [ds[2], 10], [-ds[3], 10]];
          var arr = [T(cs[0], v, 3), T(cs[1], v, 2), T(cs[2], v, 1), T(cs[3])], e = arr.map(function (p, i) { var s = P.tex(p, { dec: true }); return i && s.charAt(0) !== '-' ? '+' + s : s; }).join('');
          var lc = ds[0] / 10, ct = -ds[3] / 10;
          return rowPart(e, lc, String(lc), ct, String(ct), 3, { lc: [{ v: -lc, code: 'lc-sign', hint: 'Check the sign of the leading coefficient.' }, { v: 3, code: 'lc-exp', hint: t('3') + ' is the exponent (the degree). The leading coefficient is the number in front of ' + t(v + '^{3}') + '.' }],
            ct: [{ v: -ct, code: 'ct-sign', hint: 'The constant term keeps its sign: it is ' + t(ct) + '.' }], deg: function (x) { return x === 6 ? { code: 'deg-sum-all', hint: 'The degree is the <b>highest</b> power, not the sum of the exponents.' } : x === 4 ? { code: 'deg-terms', hint: 'That’s the number of terms. The degree is the highest power of ' + t(v) + '.' } : null; } },
          'It is already in descending order. The first term ' + t(P.tex(arr[0], { dec: true })) + ' gives leading coefficient ' + t(lc) + ' and degree ' + t('3') + '; the constant term is ' + t(ct) + ' (signs included).', 'LC/CT/degree ' + plain(e));
        } },
        { id: '4c', level: 'EMG', make: function (r) {
          var m = r.pick([7, 2, 3, 5, 6, 10, 11]), n = r.int(3, 7), v = r.pick(['x', 'y', 'n']), e = '\\sqrt{' + m + '}-' + v + '^{' + n + '}';
          return rowPart(e, -1, '-1', Math.sqrt(m), '\\sqrt{' + m + '}', n, { lc: [{ v: Math.sqrt(m), code: 'lc-first', hint: 'The polynomial isn’t in descending order. The highest power is ' + t(v + '^{' + n + '}') + ' — what is its coefficient?' }, { v: 1, code: 'lc-sign', hint: t('-' + v + '^{' + n + '}=-1' + v + '^{' + n + '}') + ': keep the sign.' }, { v: n, code: 'lc-exp', hint: t(n) + ' is the exponent (the degree), not the coefficient.' }], lcIrr: false,
            ct: [{ v: -Math.sqrt(m), code: 'ct-sign', hint: 'The constant term is ' + t('+\\sqrt{' + m + '}') + '.' }, { v: m, code: 'ct-root', hint: 'Keep the square root: the constant term is ' + t('\\sqrt{' + m + '}') + '.' }], ctIrr: 'root',
            deg: function (x) { return x === 0 ? { code: 'deg-first', hint: 'The degree comes from the highest power of the variable, wherever that term is written.' } : null; } },
          'In descending order: ' + t('-' + v + '^{' + n + '}+\\sqrt{' + m + '}') + '. The leading term is ' + t('-' + v + '^{' + n + '}=-1' + v + '^{' + n + '}') + ', so the leading coefficient is ' + t('-1') + ' and the degree is ' + t(n) + '. The constant term is ' + t('\\sqrt{' + m + '}') + ' (a number, so it counts).', 'LC/CT/degree ' + plain(e));
        } },
        { id: '4d', level: 'EMG', make: function (r) {
          var k = r.pick([2, 3, 4, 5]), c = r.int(2, 12), b = r.int(2, 9), v = r.pick(['x', 'r', 'y']);
          var e = k + '\\pi ' + v + '^{2}-' + c + '-' + b + v;
          return rowPart(e, k * Math.PI, k + '\\pi', -c, String(-c), 2, { lc: [{ v: k, code: 'lc-pi', hint: t('\\pi') + ' is a number too — it is part of the coefficient: ' + t(k + '\\pi') + '.' }, { v: -b, code: 'lc-coef', hint: 'That’s the coefficient of the ' + t(v) + '-term. Which term has the highest power?' }], lcIrr: 'pi',
            ct: [{ v: c, code: 'ct-sign', hint: 'Keep the sign: the constant term is ' + t(-c) + '.' }, { v: -b, code: 'ct-coef', hint: t('-' + b + v) + ' has a variable. The constant term has none.' }],
            deg: function (x) { return x === 3 ? { code: 'deg-sum-all', hint: 'The degree is the highest power, not the sum of the exponents.' } : null; } },
          'In descending order: ' + t(k + '\\pi ' + v + '^{2}-' + b + v + '-' + c) + '. Leading coefficient ' + t(k + '\\pi') + ' (' + t('\\pi') + ' is a number), constant term ' + t(-c) + ', degree ' + t('2') + '.', 'LC/CT/degree ' + plain(e));
        } },
        { id: '4e', level: 'EMG', make: function (r) {
          var f = r.pick([[1, 8], [1, 3], [1, 5], [2, 3], [3, 4], [1, 6], [5, 8]]), n = r.int(2, 4), v = r.pick(['c', 'x', 'k']), e = '-\\frac{' + f[0] + '}{' + f[1] + '}' + v + '^{' + n + '}';
          return rowPart(e, -f[0] / f[1], '-\\frac{' + f[0] + '}{' + f[1] + '}', 0, '0', n, { lc: [{ v: f[0] / f[1], code: 'lc-sign', hint: 'Keep the sign of the coefficient.' }, { v: -f[0], code: 'lc-frac', hint: 'The whole fraction is the coefficient: ' + t('-\\frac{' + f[0] + '}{' + f[1] + '}') + '.' }],
            ct: [{ v: -f[0] / f[1], code: 'ct-coef', hint: 'That number multiplies ' + t(v + '^{' + n + '}') + ', so it isn’t a constant term. There is no term without a variable.' }], deg: null },
          'There is only one term, ' + t(e) + '. Leading coefficient ' + t('-\\frac{' + f[0] + '}{' + f[1] + '}') + ', degree ' + t(n) + '. No term is free of the variable, so the constant term is ' + t('0') + '.', 'LC/CT/degree ' + plain(e));
        } }] },
      { num: '5', stem: 'Give an example of each. (Answers will vary — yours must meet every condition.)', parts: [
        { id: '5a', level: 'BEG', make: function (r) {
          var d = r.pick([3, 3, 4, 5]);
          return examplePart('a <b>trinomial</b> of degree ' + t(d) + ' in <b>one</b> variable', { terms: 3, nvars: 1, degree: d, vars: ['x', 'y'] }, 'x^{' + d + '}+x^{2}-4',
            ['2x^' + d + '-5x+1', 'y^' + d + '+y+7', '-x^' + d + '+3x^2+x'], ['x^' + d + '+x^2', 'x^' + d + '+y^2-4', 'x^' + (d + 1) + '+x^2-4', 'x^' + d + '+x^2+x-4'],
            'For example ' + t('x^{' + d + '}+x^{2}-4') + ': ' + termsCount(3) + ', one variable, highest power ' + t(d) + '.', ['A trinomial has exactly 3 terms. Use one letter only, and make the highest power ' + t(d) + '.'], 'example: trinomial degree ' + d + ' one variable');
        } },
        { id: '5b', level: 'EMG', make: function (r) {
          var k = r.pick([5, 5, 4, 3]), c = r.pick([9, 9, 4, 7, -2, -5]), L = ['p', 'q', 'r', 's', 't'].slice(0, k), key = L.join('') + (c > 0 ? '+' : '') + c;
          return examplePart('a <b>binomial</b> in <b>' + ['', '', '', 'three', 'four', 'five'][k] + '</b> variables with a constant term of ' + t(c), { terms: 2, nvars: k, constant: c, vars: L.concat(['x']) }, key,
            ['2' + L.join('') + (c > 0 ? '+' : '') + c, '-' + L.slice().reverse().join('') + (c > 0 ? '+' : '') + c], [L.join('') + '+' + (c + 1), L.slice(0, k - 1).join('') + (c > 0 ? '+' : '') + c, L.join('') + '+x' + (c > 0 ? '+' : '') + c],
            'For example ' + t(key) + ': ' + termsCount(2) + ', the variables ' + t(L.join(',\\ ')) + ', and constant term ' + t(c) + '. (One term can hold all ' + k + ' variables.)', ['Only 2 terms are allowed, and one of them must be the constant ' + t(c) + '. So the other term must contain all ' + k + ' variables.'], 'example: binomial ' + k + ' variables constant ' + c);
        } },
        { id: '5c', level: 'EMG', make: function (r) {
          var d = r.pick([4, 4, 5, 6]), key = '-5m^{2}n^{' + (d - 2) + '}';
          return examplePart('a <b>monomial</b> of degree ' + t(d) + ' in <b>two</b> variables with a <b>negative</b> numerical coefficient', { terms: 1, nvars: 2, degree: d, neg: true, vars: ['m', 'n', 'x', 'y'] }, key,
            ['-x^' + (d - 1) + 'y', '-\\frac{1}{2}a^{2}b^{' + (d - 2) + '}', '-mn^' + (d - 1)], ['5m^2n^' + (d - 2), '-5m^' + d + 'n', '-5m^' + d, '-m^2n^' + (d - 2) + '+1'],
            'For example ' + t(key) + ': one term, the two variables ' + t('m,\\ n') + ', degree ' + t('2+' + (d - 2) + '=' + d) + ', coefficient ' + t('-5') + '.', ['One term, two different letters, exponents that add to ' + t(d) + ', and a minus sign in front.'], 'example: monomial degree ' + d + ' two variables negative');
        } },
        { id: '5d', level: 'BEG', make: function (r) {
          return examplePart('a <b>monomial</b> with a degree of ' + t('0'), { terms: 1, nvars: 0, vars: ['x', 'y'] }, '12', ['-3', '\\frac{1}{2}', '7'], ['12x', 'x^0+x', '0'],
            'For example ' + t('12') + ': a constant is a monomial with no variable, so its degree is ' + t('0') + '. (Any number except ' + t('0') + ' works — the zero polynomial has no degree.)', ['Which kind of term has no variable at all?'], 'example: monomial degree 0');
        } }] },
      /* ================= Part B ================= */
      { num: '6', section: 'Part B — Ordering, True/False and Tiles', stem: 'Arrange the following in descending powers of the variable.', parts: [
        { id: '6a', level: 'EMG', make: function (r) {
          var a = r.pick(['a', 'b', 'p', 'w']), fs = r.sample(FR, 2), c = r.int(2, 9);
          var terms = [T(fs[0], a, 2), T([-fs[1][0], fs[1][1]], a, 3), T(-c), T(-1, a, 1)];
          var shown = r.chance(0.5) ? terms : shuffledNot(r, terms, function (s) { return isDesc(s, a); }), ans = S(terms);
          return pp(t(W(shown)), ans, { order: 'desc', var: a, bad: [W(shown)], text: 'descending ' + plain(W(shown)),
            sol: 'Powers of ' + t(a) + ' from highest to lowest: ' + t('3, 2, 1, 0') + '. Each term keeps its own sign as it moves:<br>' + t(tx(ans)),
            hints: ['Find the term with the highest power of ' + t(a) + ' and write it first. Each term takes its sign with it.', 'The constant term (power ' + t('0') + ') goes last.'] });
        } },
        { id: '6b', level: 'BEG', make: function (r) {
          var z = r.pick(['z', 'x', 'k', 'n']), hi = r.int(5, 8), mid = r.int(3, hi - 2), c = r.int(2, 5), d = r.int(2, 9);
          var terms = [T(1, z, 1), T(-d), T(-c, z, hi), T(1, z, mid)];
          var shown = r.chance(0.5) ? terms : shuffledNot(r, terms, function (s) { return isDesc(s, z); }), ans = S(terms);
          return pp(t(W(shown)), ans, { order: 'desc', var: z, bad: [W(shown)], text: 'descending ' + plain(W(shown)),
            sol: 'Powers of ' + t(z) + ': ' + t(hi + ', ' + mid + ', 1, 0') + '. Each term keeps its sign:<br>' + t(tx(ans)),
            hints: ['Start with ' + t(z + '^{' + hi + '}') + ' (the highest power) and take its sign with it.'] });
        } }] },
      { num: '7', stem: 'Arrange the following in ascending powers of the variable.', parts: [
        { id: '7a', level: 'BEG', make: function (r) {
          var x = r.pick(['x', 'y', 'm']), pw = [0, 1].concat(r.sample([2, 3, 4, 5, 6, 7], 4)).sort(function (p, q) { return p - q; });
          var terms = pw.map(function (e) { return T(nz(r, -9, 9), x, e); });
          var shown = shuffledNot(r, terms, function (s) { return isAsc(s, x) || isDesc(s, x); }), ans = S(terms);
          return pp(t(W(shown)), ans, { order: 'asc', var: x, bad: [W(shown), tx(ans)], text: 'ascending ' + plain(W(shown)),
            sol: 'Powers of ' + t(x) + ' from lowest to highest: ' + t(pw.join(', ')) + ' (the constant term has power ' + t('0') + '):<br>' + t(P.tex(ans, { order: 'asc', var: x })),
            hints: ['Ascending means the powers <b>increase</b>: start with the constant term, then ' + t(x) + ', then ' + t(x + '^{2}') + ', …', 'Each term takes its sign with it.'] });
        } },
        { id: '7b', level: 'LIM', make: function (r) {
          var x = r.pick(['x', 'y', 'a']), c = r.int(2, 9), hi = r.pick([3, 3, 4, 5]), mid = hi === 3 ? 1 : r.pick([1, 2]);
          var terms = [T(c, x, hi), T(-c, x, mid), T(c)], ans = S(terms);
          return pp(t(W(terms)), ans, { order: 'asc', var: x, bad: [W(terms)], text: 'ascending ' + plain(W(terms)),
            sol: 'Powers from lowest to highest: ' + t('0, ' + mid + ', ' + hi) + ':<br>' + t(P.tex(ans, { order: 'asc', var: x })),
            hints: ['Ascending: start with the constant term (power ' + t('0') + ') and finish with the highest power. Keep each sign with its term.'] });
        } }] },
      { num: '8', stem: 'State whether each statement is true or false.', parts: [
        { id: '8a', level: 'LIM', make: function (r) {
          var k = r.pick([78, 12, 45, 150, 9, 31]);
          return KP.tf(r, t('-' + k) + ' is a polynomial.', true, 'A single number is a monomial (a constant term), and every monomial is a polynomial.', '<b>True</b> — a single number is a monomial, and every monomial is a polynomial.', ['Is a single number a monomial?'], 'TF -' + k + ' polynomial');
        } },
        { id: '8b', level: 'BEG', make: function (r) {
          var c = r.int(2, 9), a, b; do { a = r.int(2, 5); b = r.int(2, 5); } while (a * b === a + b);
          var d = a + b, truth = r.chance(0.55), claim = truth ? d : r.pick([a * b, Math.max(a, b)].filter(function (v) { return v !== d; }));
          var m = c + 'x^{' + a + '}y^{' + b + '}';
          return KP.tf(r, 'The degree of the polynomial ' + t(m) + ' is ' + t(claim) + '.', truth, truth ? 'Add the exponents of the variables: ' + t(a + '+' + b + '=' + d) + '.' : 'The degree is the <b>sum</b> of the exponents: ' + t(a + '+' + b + '=' + d) + ', not ' + t(claim) + '.',
            '<b>' + (truth ? 'True' : 'False') + '</b> — the degree is ' + t(a + '+' + b + '=' + d) + '.', ['Add the exponents of all the variables in the term.'], 'TF degree ' + m + ' = ' + claim);
        } },
        { id: '8c', level: 'BEG', make: function (r) {
          var p, q; do { p = r.int(2, 9); q = r.int(2, 9); } while (p === q || ex.gcd(p, q) > 1);
          var truth = r.chance(0.35), claim = truth ? '\\frac{' + p + '}{' + q + '}' : String(p), e = '\\frac{' + p + 'x}{' + q + '}';
          return KP.tf(r, 'The numerical coefficient of ' + t(e) + ' is ' + t(claim) + '.', truth, truth ? t(e + '=\\frac{' + p + '}{' + q + '}x') + ', so the coefficient really is ' + t('\\frac{' + p + '}{' + q + '}') + '.' : t(e + '=\\frac{' + p + '}{' + q + '}x') + ': the coefficient includes the denominator.',
            '<b>' + (truth ? 'True' : 'False') + '</b> — ' + t(e + '=\\frac{' + p + '}{' + q + '}x') + ', so the numerical coefficient is ' + t('\\frac{' + p + '}{' + q + '}') + '.', ['Rewrite the term as (number)' + t('\\times x') + '.'], 'TF coefficient of ' + p + 'x/' + q);
        } },
        { id: '8d', level: 'LIM', make: function (r) {
          var n = r.pick([5000, 1000, 250, 100, 12000]);
          return KP.tf(r, 'A polynomial may have ' + t(F(n)) + ' terms.', true, 'There is no limit on the number of terms: with 4 or more terms it is simply called a polynomial.', '<b>True</b> — a polynomial may have any number of terms.', ['Is there a maximum number of terms in the definition?'], 'TF ' + n + ' terms');
        } },
        { id: '8e', level: 'EMG', make: function (r) {
          var k = r.int(2, 9), e = r.int(2, 5), b = r.pick(['b', 'x', 'y']), c = r.int(1, 6), sg = r.pick(['-', '+']), m = '\\frac{' + k + '}{' + b + '^{' + e + '}}' + sg + c;
          return KP.tf(r, t(m) + ' is a binomial.', false, 'It has two parts, but ' + t('\\frac{' + k + '}{' + b + '^{' + e + '}}=' + k + b + '^{-' + e + '}') + ' has a negative exponent — so it isn’t a polynomial at all, and can’t be a binomial.',
            '<b>False</b> — ' + t('\\frac{' + k + '}{' + b + '^{' + e + '}}=' + k + b + '^{-' + e + '}') + ' has a negative exponent, so the expression isn’t a polynomial (and so not a binomial).', ['Before counting terms, check: is it a polynomial?'], 'TF binomial? ' + plain(m));
        } },
        { id: '8f', level: 'BEG', make: function (r) {
          var c = r.int(3, 20), truth = r.chance(0.6), claim = truth ? 0 : r.pick([c, 1]);
          return KP.tf(r, 'The degree of the polynomial ' + t(c) + ' is ' + t(claim) + '.', truth, truth ? t(c) + ' has no variable (' + t(c + '=' + c + 'x^{0}') + '), so its degree is ' + t('0') + '.' : 'A non-zero constant has no variable: ' + t(c + '=' + c + 'x^{0}') + ', so its degree is ' + t('0') + '.',
            '<b>' + (truth ? 'True' : 'False') + '</b> — ' + t(c) + ' is a non-zero constant (' + t(c + '=' + c + 'x^{0}') + '), so its degree is ' + t('0') + '. (The zero polynomial ' + t('0') + ' is different: it has no degree.)', ['What is the exponent of the variable in a term with no variable?'], 'TF degree of ' + c + ' = ' + claim);
        } },
        { id: '8g', level: 'LIM', make: function (r) {
          var cs = [r.int(2, 9), r.int(2, 9), r.int(2, 9), r.int(2, 9)], terms = [T(cs[0], 'x', 3), T(cs[1], 'x', 2), T(cs[2], 'x', 1), T(cs[3])];
          var v = r.pick([['d', 'asc'], ['d', 'asc'], ['a', 'asc'], ['d', 'desc'], ['a', 'desc']]), shown = v[0] === 'd' ? terms : terms.slice().reverse(), truth = (v[0] === 'a') === (v[1] === 'asc');
          var pw = v[0] === 'd' ? '3, 2, 1, 0' : '0, 1, 2, 3', isA = v[0] === 'a';
          return KP.tf(r, 'The polynomial ' + t(W(shown)) + ' is written in <b>' + (v[1] === 'asc' ? 'ascending' : 'descending') + '</b> powers of ' + t('x') + '.', truth, 'The powers run ' + t(pw) + ': they ' + (isA ? 'increase, so it is in ascending order.' : 'decrease, so it is in descending order.'),
            '<b>' + (truth ? 'True' : 'False') + '</b> — the powers run ' + t(pw) + ', which is <b>' + (isA ? 'ascending' : 'descending') + '</b> order.', ['Read the powers of ' + t('x') + ' from left to right. Do they go up or down?'], 'TF order ' + v.join('/'));
        } },
        { id: '8h', level: 'LIM', make: function (r) {
          var a, b, c; do { a = r.int(2, 9); b = r.int(2, 9); c = r.int(2, 9); } while (a === c || a === b || b === c);
          var A = [T(a, 'x', 2), T(-b, 'x', 1), T(c)], truth = r.chance(0.6), Bt = truth ? A.slice().reverse() : [T(a), T(-b, 'x', 1), T(c, 'x', 2)];
          return KP.tf(r, 'The polynomials ' + t(W(A)) + ' and ' + t(W(Bt)) + ' are equivalent.', truth, truth ? 'Each term (with its sign) is the same — only the order changed. Reordering terms doesn’t change a polynomial.' : 'Compare term by term: ' + t(a + 'x^{2}') + ' in the first, but ' + t(c + 'x^{2}') + ' in the second. A coefficient has to move <b>with</b> its variable.',
            '<b>' + (truth ? 'True' : 'False') + '</b> — ' + (truth ? 'the same terms, just in a different order.' : 'the ' + t('x^{2}') + '-terms are ' + t(a + 'x^{2}') + ' and ' + t(c + 'x^{2}') + ', and the constant terms are ' + t(c) + ' and ' + t(a) + '.'), ['Match each term of the first polynomial with the term with the same power of ' + t('x') + ' in the second.'], 'TF equivalent ' + (truth ? 'reordered' : 'swapped'));
        } }] },
      { num: '9', stem: 'State the polynomial expression which describes each diagram.' + HW.tiles.legend(), parts: [
        { id: '9a', level: 'BEG', make: function (r) { return tileReadPart({ x: [0, r.int(1, 4)], one: [r.int(1, 3), 0] }); } },
        { id: '9b', level: 'BEG', make: function (r) { return tileReadPart({ x2: [r.int(1, 3), 0], x: [0, r.int(1, 3)], one: [r.int(1, 4), 0] }); } },
        { id: '9c', level: 'EMG', make: function (r) {
          var c;
          for (var g = 0; g < 200; g++) {
            c = { x2: [r.int(0, 2), r.int(0, 2)], x: [r.int(0, 3), r.int(0, 2)], one: [r.int(0, 3), r.int(0, 2)] };
            var ks = ['x2', 'x', 'one'], zp = ks.filter(function (k) { return c[k][0] && c[k][1]; }).length, gone = ks.filter(function (k) { return c[k][0] && c[k][0] === c[k][1]; }).length;
            var res = tilePoly(c), tot = ks.reduce(function (s, k) { return s + c[k][0] + c[k][1]; }, 0);
            if (zp >= 2 && gone >= 1 && P.count(res) >= 2 && tot <= 10 && ks.every(function (k) { return c[k][0] + c[k][1] > 0; })) break;
          }
          return tileReadPart(c);
        } }] },
      /* ================= Part C ================= */
      { num: '10', section: 'Part C — Adding and Subtracting Polynomials', stem: 'Use algebra tiles (or reasoning about zero pairs) to determine the result of the addition.',
        /* (b) is shared so the tile model (b i) and the typed sum (b ii) use the same numbers; ≤ 22 tiles in all */
        shared: function (r) {
          var a, b, c, d, g = 0;
          do { a = r.int(2, 7); b = r.int(1, 5); c = r.int(2, 4); d = r.int(2, 8); g++; } while (g < 200 && (d === b || 2 * a + b + c + d > 22));
          if (r.chance(0.15)) { a = 5; b = 3; c = 3; d = 5; }
          return { b: { a: a, b: b, c: c, d: d, A: [T(a, 'x', 1), T(b)], B: [T(c, 'x', 2), T(-a, 'x', 1), T(-d)] } };
        },
        parts: [
        { id: '10a', sub: 'a', level: 'BEG', make: function (r) {
          var a = r.int(1, 6), b = r.int(1, 6), c = r.int(1, 6), d = r.int(1, 6);
          var A = [T(1, 'x', 2), T(-a, 'x', 1), T(-b)], Bq = [T(1, 'x', 2), T(-c, 'x', 1), T(-d)];
          return addSub(null, [{ s: 1, a: A }, { s: 1, a: Bq }], { text: 'add ' + plain(bracketsTex([{ s: 1, a: A }, { s: 1, a: Bq }])),
            wrong: [{ is: S([T(2, 'x', 4), T(-a - c, 'x', 1), T(-b - d)]), code: 'add-exp', hint: 'When you add like terms, add the <b>coefficients</b> and keep the exponent: ' + t('x^{2}+x^{2}=2x^{2}') + ', not ' + t('2x^{4}') + '.' }] });
        } },
        { id: '10bt', sub: 'b i', level: 'BEG', make: function (r, sh) { return addTilesPart(sh.b.A, sh.b.B); } },
        { id: '10b', sub: 'b ii', level: 'BEG', make: function (r, sh) {
          var a = sh.b.a, b = sh.b.b, c = sh.b.c, d = sh.b.d, A = sh.b.A, Bq = sh.b.B;
          return addSub(t(bracketsTex([{ s: 1, a: A }, { s: 1, a: Bq }])) + '<br>State the result.', [{ s: 1, a: A }, { s: 1, a: Bq }], { text: 'add ' + plain(bracketsTex([{ s: 1, a: A }, { s: 1, a: Bq }])),
            wrong: [{ is: S([T(c, 'x', 2), T(2 * a, 'x', 1), T(b - d)]), code: 'sign', hint: t(a + 'x') + ' and ' + t('-' + a + 'x') + ' are opposites: they form ' + a + ' zero pairs and cancel.' }] });
        } }] },
      { num: '11', stem: 'Use algebra tiles (or reasoning about zero pairs) to determine the result of the subtraction.',
        /* shared so the take-away tiles (i) and the typed result (ii) use the same numbers; the tile counts stay small
           enough to fit the mat (start + zero pairs ≤ 22 tiles) */
        shared: function (r) {
          var a, b, c, d, A, Bq, g = 0;
          do { a = r.int(2, 6); c = r.int(2, 3); b = r.int(1, 3); d = r.int(1, 4); g++; } while (g < 200 && 1 + a + 2 * (c - 1 + b + d) > 22);
          if (r.chance(0.15)) { a = 5; c = 3; b = 2; d = 3; }
          var qa = { A: [T(1, 'x', 2), T(-a)], B: [T(c, 'x', 2), T(b, 'x', 1), T(d)] };
          g = 0;
          do { a = r.int(3, 8); b = r.int(1, 4); c = r.int(1, 6); d = r.int(2, 6); g++; } while (g < 200 && (c === a || d === b || a + b + 1 + 2 * (Math.max(0, c - a) + Math.max(0, d - b) + 1) > 22));
          if (r.chance(0.15)) { a = 5; b = 2; c = 2; d = 4; }
          var qb = { A: [T(a), T(-b, 'x', 1), T(-1, 'x', 2)], B: [T(c), T(-d, 'x', 1), T(1, 'x', 2)] };
          return { a: qa, b: qb };
        },
        parts: [
        { id: '11at', sub: 'a i', level: 'EMG', make: function (r, sh) { return takeAwayPart(sh.a.A, sh.a.B); } },
        { id: '11a', sub: 'a ii', level: 'EMG', make: function (r, sh) {
          var A = sh.a.A, Bq = sh.a.B;
          return addSub(t(bracketsTex([{ s: 1, a: A }, { s: -1, a: Bq }])) + '<br>State the result.', [{ s: 1, a: A }, { s: -1, a: Bq }], { text: 'subtract ' + plain(bracketsTex([{ s: 1, a: A }, { s: -1, a: Bq }])) });
        } },
        { id: '11bt', sub: 'b i', level: 'EMG', make: function (r, sh) { return takeAwayPart(sh.b.A, sh.b.B); } },
        { id: '11b', sub: 'b ii', level: 'EMG', make: function (r, sh) {
          var A = sh.b.A, Bq = sh.b.B;
          return addSub(t(bracketsTex([{ s: 1, a: A }, { s: -1, a: Bq }])) + '<br>State the result.', [{ s: 1, a: A }, { s: -1, a: Bq }], { text: 'subtract ' + plain(bracketsTex([{ s: 1, a: A }, { s: -1, a: Bq }])) });
        } }] },
      { num: '12', stem: 'Simplify.', parts: [
        { id: '12a', level: 'EMG', make: function (r) {
          var y = r.pick(['y', 'x', 'm']), q = r.pick([3, 3, 4, 5]), m = r.pick([1, 2, 2, 3]), p1; do { p1 = r.int(1, q - 1); } while (ex.gcd(p1, q) > 1);
          var p2 = m * q - p1, c1 = r.int(2, 9), c2; do { c2 = r.int(5, 25); } while (c2 === c1);
          var terms = [T([p1, q], y, 1), T(-c1), T([p2, q], y, 1), T(c2)], ans = S(terms);
          var badFrac = S([T(ex.norm(p1 + p2, 2 * q), y, 1), T(c2 - c1)]);
          var raw = W(terms);
          return pp(t(raw), ans, { text: 'simplify ' + plain(raw), wrong: [{ is: badFrac, code: 'frac-add', hint: 'Adding fractions with the same denominator: add the <b>numerators</b> only and keep the denominator, ' + t('\\frac{' + p1 + '}{' + q + '}+\\frac{' + p2 + '}{' + q + '}=\\frac{' + (p1 + p2) + '}{' + q + '}') + '.' }],
            sol: y + '-terms: ' + t('\\left(\\frac{' + p1 + '}{' + q + '}+\\frac{' + p2 + '}{' + q + '}\\right)' + y + '=\\frac{' + (p1 + p2) + '}{' + q + '}' + y + '=' + (m === 1 ? '' : m) + y) + ';&nbsp; constants: ' + t(-c1 + '+' + c2 + '=' + (c2 - c1)) + '.<br>' + t('=' + tx(ans)),
            hints: ['Group the ' + t(y) + '-terms and the constants. Fractions with the same denominator: add the numerators.'] });
        } },
        { id: '12b', level: 'BEG', make: function (r) {
          var b = r.pick(['b', 'x', 'a']), A = r.int(2, 7), Bc = r.int(4, 9), C = r.int(1, 5), D, E = r.int(1, 4); do { D = r.int(2, 9); } while (D === Bc);
          var terms = [T(A, b, 3), T(Bc, b, 1), T(-C, b, 2), T(-D, b, 1), T(-A, b, 3), T(-E, b, 2)], ans = S(terms);
          return pp(t(W(terms)), ans, { text: 'simplify ' + plain(W(terms)), sol: 'Collect like terms: ' + groupsTex(terms) + '.<br>' + t('=' + tx(ans)),
            wrong: [{ is: S([T(-C - E, b, 2), T(Bc + D, b, 1)]), code: 'sign', hint: 'Each term takes the sign in front of it: ' + t(Bc + b + '-' + D + b + '=' + (Bc - D) + b) + '.' }],
            hints: ['Group terms with the same power of ' + t(b) + ' (keep each sign with its term). Some terms may cancel to ' + t('0') + '.'] });
        } },
        { id: '12c', level: 'BEG', make: function (r) {
          var c1 = r.int(2, 9), a1 = r.int(2, 5), b1 = r.int(2, 8), b2 = r.int(2, 8), a2 = r.int(2, 5), e = r.int(2, 9), c2; do { c2 = r.int(5, 15); } while (c2 === c1);
          var terms = [T(c1), T(-a1, 'x', 1), T(b1, 'y', 1), T(b2, 'y', 1), T(-a2, 'x', 1), T(e, 'z', 1), T(-c2)], ans = S(terms);
          return pp(t(W(terms)), ans, { text: 'simplify ' + plain(W(terms)), sol: 'Collect like terms: ' + groupsTex(terms) + '.<br>' + t('=' + tx(ans)),
            hints: ['Only like terms combine: ' + t('x') + '-terms together, ' + t('y') + '-terms together, constants together. ' + t('z') + ' has no partner.'] });
        } }] },
      { num: '13', stem: 'Simplify by collecting like terms.', parts: [
        { id: '13a', level: 'BEG', make: function (r) {
          var a = r.int(3, 9), b = r.int(2, 9), c = r.int(2, 6), d = r.int(1, 4), e = r.int(2, 9), f; do { f = r.int(1, 5); } while (f === a);
          var A = [T(a, 'p', 1), T(-b, 'q', 1), T(-c, 'r', 1)], Bq = [T(d, 'r', 1), T(-e, 'q', 1), T(-f, 'p', 1)];
          if (c === d) Bq[0] = T(d + 1, 'r', 1);
          return addSub(null, [{ s: 1, a: A }, { s: 1, a: Bq }], { text: 'add ' + plain(bracketsTex([{ s: 1, a: A }, { s: 1, a: Bq }])) });
        } },
        { id: '13b', level: 'EMG', make: function (r) {
          var x = 'x', a, f, k, bx, d, h, c, e, g;
          do { a = r.int(2, 5); f = r.int(3, 6); k = f - a; bx = r.int(2, 5); d = r.int(1, 4); h = r.int(2, 5); c = r.int(1, 4); e = r.int(2, 6); g = r.int(1, 5); } while (k <= 0 || bx + d - h === 0 || g - c - e === 0);
          var A = [T(a, x, 2), T(bx, x, 1), T(-c)], Bq = [T(d, x, 1), T(-e), T(-f, x, 2)], C = [T(g), T(-h, x, 1), T(k, x, 2)];
          return addSub(null, [{ s: 1, a: A }, { s: 1, a: Bq }, { s: 1, a: C }], { text: 'add three ' + plain(bracketsTex([{ s: 1, a: A }, { s: 1, a: Bq }, { s: 1, a: C }])) });
        } },
        { id: '13c', level: 'EMG', make: function (r) {
          var a = r.int(2, 8), c, b = r.int(3, 9), d; do { c = r.int(2, 9); d = r.int(1, 6); } while (c === a || d === b);
          var A = [T(a, 'p', 1), T(-b, 'q', 1)], Bq = [T(c, 'p', 1), T(-d, 'q', 1)];
          return addSub(null, [{ s: 1, a: A }, { s: -1, a: Bq }], { text: 'subtract ' + plain(bracketsTex([{ s: 1, a: A }, { s: -1, a: Bq }])) });
        } },
        { id: '13d', level: 'EMG', make: function (r) {
          var a = r.int(3, 9), b = r.int(1, 6), c = r.int(1, 6), d = r.int(2, 6), e = r.int(1, 6);
          var A = [T(a, 'x', 2), T(b, 'x', 1), T(-c)], Bq = [T(-d, 'x', 2), T(-e, 'x', 1), T(-c)], parts = [{ s: 1, a: A }, { s: -1, a: Bq }];
          return addSub(t(vert(A, Bq)), parts, { text: 'vertical ' + plain(bracketsTex(parts)), lead: 'Change the sign of every term in the bottom row, then add down the columns.' });
        } },
        { id: '13e', level: 'EMG', make: function (r) {
          var a, b, c, d, e, f; do { a = r.int(2, 7); b = r.int(1, 6); c = r.int(2, 9); d = r.int(2, 7); e = r.int(1, 6); f = r.int(1, 5); } while (f === a || d === b);
          var A = [T(-a, 'x', 2), T(b, 'x', 1), T(-c)], Bq = [T(d, 'x', 1), T(e), T(-f, 'x', 2)], parts = [{ s: 1, a: A }, { s: -1, a: Bq }];
          return addSub(t(vert(A, Bq)), parts, { text: 'vertical ' + plain(bracketsTex(parts)), lead: 'The bottom row is not in the same order as the top row: line up <b>like terms</b>, not positions. Change every sign in the bottom row, then add.' });
        } }] },
      { num: '14', stem: 'Subtract as directed.', parts: [
        { id: '14a', level: 'EMG', make: function (r) {
          var A = [T(r.int(2, 6), 'x', 2), T(-r.int(2, 6), 'x', 1), T(r.int(2, 9))], Bq;
          do { Bq = [T(r.int(5, 9), 'x', 2), T(-r.int(3, 9), 'x', 1), T(-r.int(1, 6))]; } while (P.count(P.sub(S(Bq), S(A))) < 3);
          var parts = [{ s: 1, a: Bq }, { s: -1, a: A }];
          return addSub('Subtract ' + t(W(A)) + ' from ' + t(W(Bq)) + '.', parts, { text: 'subtract ' + plainPoly(S(A)) + ' from ' + plainPoly(S(Bq)),
            lead: '“Subtract ' + t('A') + ' from ' + t('B') + '” means ' + t('B-A') + ': ' + t('(' + W(Bq) + ')-(' + W(A) + ')'),
            wrong: [{ is: P.sub(S(A), S(Bq)), code: 'reversed', hint: '“Subtract ' + t('A') + ' from ' + t('B') + '” means ' + t('B-A') + ': start with ' + t(W(Bq)) + ' and take ' + t(W(A)) + ' away.' }] });
        } },
        { id: '14b', level: 'PRG', make: function (r) {
          var A1, A2, Bq, ans, g = 0;
          do {
            A1 = [T(r.int(2, 5), 'x', 3), T(-r.int(2, 6), 'x', 2), T(-r.int(2, 6), 'x', 1), T(r.int(1, 5))];
            A2 = [T(r.int(2, 8)), T(-r.int(1, 5), 'x', 1), T(r.int(2, 6), 'x', 2), T(-r.int(3, 7), 'x', 3)];
            Bq = [T(r.int(2, 5), 'x', 3), T(-r.int(3, 9), 'x', 1), T(r.int(3, 9))];
            ans = P.sub(S(Bq), P.add(S(A1), S(A2))); g++;
          } while (g < 200 && (P.count(ans) < 4 || P.count(P.add(S(A1), S(A2))) < 4));
          var sum = P.add(S(A1), S(A2));
          return pp('Subtract the sum of ' + t('(' + W(A1) + ')') + ' and ' + t('(' + W(A2) + ')') + ' from ' + t('(' + W(Bq) + ')') + '.', ans, { text: 'subtract sum from ' + plainPoly(S(Bq)),
            wrong: [{ is: P.sub(sum, S(Bq)), code: 'reversed', hint: '“Subtract the sum from ' + t('B') + '” means ' + t('B-(\\text{sum})') + ': start with ' + t(W(Bq)) + '.' },
              { is: P.add(P.sub(S(Bq), S(A1)), S(A2)), code: 'second-added', hint: 'You must subtract the <b>whole sum</b>: both brackets are taken away. Find the sum first, then subtract it.' },
              { is: P.add(S(Bq), sum), code: 'no-change', hint: 'Subtracting the sum means changing the sign of <b>every</b> term of the sum before adding.' },
              ],
            sol: 'First the sum: ' + groupsTex(A1.concat(A2)) + ', so the sum is ' + t(tx(sum)) + '.<br>Then ' + t('(' + W(Bq) + ')-(' + tx(sum) + ')=' + W(Bq.concat(NEG(termsOf(sum))))) + '<br>' + t('=' + tx(ans)),
            hints: ['Work in two steps: add the two brackets, then subtract that sum from ' + t('(' + W(Bq) + ')') + '.', 'When you subtract the sum, change the sign of every one of its terms.'] });
        } }] },
      { num: '15', stem: function (sh) { return 'A triangle has a perimeter of ' + t('(' + tx(sh.per) + ')') + ' cm. One side measures ' + t('(' + W(sh.s1) + ')') + ' cm and another side measures ' + t('(' + W(sh.s2) + ')') + ' cm.'; },
        shared: function (r) {
          var a1, b1, a2, b2, a3, b3, m, n, v1, v2, v3, g = 0;
          do {
            a1 = r.int(2, 4); b1 = r.int(2, 5); a2 = r.int(1, 3); b2 = r.int(2, 5); a3 = r.int(1, 3); b3 = r.int(1, 3); m = r.int(3, 8); n = -r.int(1, 3);
            v1 = a1 * m - b1 * n; v2 = a2 * m + b2 * n; v3 = a3 * m + b3 * n; g++;
          } while (g < 500 && (v1 <= 0 || v2 <= 0 || v3 <= 0 || v1 >= v2 + v3 || v2 >= v1 + v3 || v3 >= v1 + v2 || a1 + a2 + a3 === 0 || -b1 + b2 + b3 === 0 || a2 * m === b2 * -n));
          var s1 = [T(a1, 'm', 1), T(-b1, 'n', 1)], s2 = [T(b2, 'n', 1), T(a2, 'm', 1)], s3 = S([T(a3, 'm', 1), T(b3, 'n', 1)]);
          return { s1: s1, s2: s2, s3: s3, per: P.add(S(s1), S(s2), s3), m: m, n: n, v: [v1, v2, v3] };
        },
        parts: [
          { id: '15a', level: 'EMG', make: function (r, sh) {
            var parts = [{ s: 1, a: termsOf(sh.per) }, { s: -1, a: sh.s1 }, { s: -1, a: sh.s2 }];
            var p = addSub('Write and simplify an expression for the length of the third side.', parts, { vars: ['m', 'n'], text: 'third side of triangle',
              lead: 'Third side = perimeter − the other two sides: ' + t(bracketsTex(parts)),
              wrong: [{ is: P.add(P.sub(sh.per, S(sh.s1)), S(sh.s2)), code: 'second-added', hint: 'Both known sides must be <b>subtracted</b> from the perimeter.' }, { is: P.add(sh.per, S(sh.s1), S(sh.s2)), code: 'no-change', hint: 'The third side is the perimeter <b>minus</b> the other two sides.' }] });
            p.input.after = t('\\text{ cm}');
            return p;
          } },
          { id: '15b', level: 'EMG', make: function (r, sh) {
            var sides = [S(sh.s1), S(sh.s2), sh.s3], env = { m: sh.m, n: sh.n }, flip = { m: sh.m, n: -sh.n };
            var fl = sides.map(function (s, i) { return { name: 'Side ' + (i + 1), label: t(i < 2 ? W(i ? sh.s2 : sh.s1) : tx(s)), after: 'cm' }; });
            var chks = sides.map(function (s) { var v = P.at(s, env), w = P.at(s, flip); return K.number(v, function (x) { return x === w ? { code: 'neg-sub', hint: t('n=' + sh.n) + ' is negative: substitute it in brackets, e.g. ' + t(P.coef(s, { n: 1 })[0] + '(' + sh.n + ')=' + P.coef(s, { n: 1 })[0] * sh.n) + '.' } : null; }); });
            return KP.fields('Determine the measure of each side when ' + t('m=' + sh.m) + ' and ' + t('n=' + sh.n) + '. (The third side is ' + t('(' + tx(sh.s3) + ')') + ' cm, the expression from (a).)', fl, chks, sh.v.map(String), sh.v.map(function (v) { return t(v + '\\text{ cm}'); }).join(', '),
              sides.map(function (s, i) { var c = P.coef(s, { m: 1 })[0], d = P.coef(s, { n: 1 })[0]; return 'Side ' + (i + 1) + ': ' + t(c + '(' + sh.m + ')' + (d < 0 ? '-' + -d : '+' + d) + '(' + sh.n + ')=' + c * sh.m + (d * sh.n < 0 ? '-' + -d * sh.n : '+' + d * sh.n) + '=' + sh.v[i]) + ' cm'; }).join('<br>') + '<br>Check: ' + t(sh.v.join('+') + '=' + (sh.v[0] + sh.v[1] + sh.v[2])) + ' and ' + t(tx(sh.per)) + ' at these values is also ' + t(P.at(sh.per, env)) + '. ✓',
              ['Substitute ' + t('m=' + sh.m) + ' and ' + t('n=(' + sh.n + ')') + ' into each side. Brackets around the negative help.'], 'triangle sides at m=' + sh.m + ', n=' + sh.n);
          } }] },
      /* ================= Part D ================= */
      { num: '16', section: 'Part D — Multiple Choice and Numerical Response', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '16', level: 'EMG', make: function (r) {
          var a = r.int(2, 7), b = r.int(2, 6), c = r.int(2, 5), d = r.int(2, 9), f1 = r.pick([[2, 5], [1, 3], [3, 4]]), f2 = r.pick([[3, 7], [1, 2], [2, 9]]);
          var A = W([T(a, 'x', 5), T(-b, 'x', 2)]), Bo = W([T(r.int(2, 7), 'x', 4), T(-c, 'x', 3)]) + '+' + c + 'x^{-1}+x-' + d, C = '\\frac{' + W([T(a + 1, 'x', 4), T(-b - 1, 'x', 1)]) + '}{x}';
          var D = W([T(r.int(2, 9)), T(r.int(2, 6), 'x', 1), T([-f1[0], f1[1]], 'x', 2), T(-1, 'x', 3), T(f2, 'x', 4)]);
          return KP.mc(r, 'Which of the following is a polynomial expression of degree ' + t('4') + '?', [
            { html: t(A), why: 'Its highest power is ' + t('x^{5}') + ', so its degree is ' + t('5') + ', not ' + t('4') + '.' },
            { html: t(Bo), why: 'Look at ' + t(c + 'x^{-1}') + ': a negative exponent on a variable means it isn’t a polynomial.' },
            { html: t(C), why: 'As written, there is a variable in the denominator, so it isn’t a polynomial expression (and dividing gives degree ' + t('3') + ' anyway).' },
            { html: t(D), right: true }],
            'A: degree ' + t('5') + '. B: contains ' + t(c + 'x^{-1}') + ' (negative exponent), not a polynomial. C: a variable in the denominator, not a polynomial. D: every exponent is a whole number and the highest power is ' + t('x^{4}') + '. <b>Answer: D</b>',
            ['Check each option twice: is it a polynomial (whole-number exponents, no variable in a denominator)? Is its highest power ' + t('4') + '?'], 'which is a degree-4 polynomial', true);
        } }] },
      { num: '17', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '17', level: 'PRG', make: function (r) {
          var k = r.pick([6, 6, 4, 5, 7, 8, 9]), X = function (c, e) { return T(c, 'x', e); };
          var tpl = [
            function (want) { var p = r.int(2, 5), rr = r.int(2, 5), q = want == null ? -r.int(2, 5) : want + rr; return { tex: '(' + W([X(p, 2), X(q, 1)]) + ')-(' + W([X(rr, 1), X(p, 2)]) + ')', val: P.sub(S([X(p, 2), X(q, 1)]), S([X(rr, 1), X(p, 2)])) }; },
            function (want) { var s = want == null ? r.int(1, 3) : r.int(1, Math.max(1, Math.floor((want - 1) / 2))), m = want == null ? k : want - 2 * s; return { tex: W([X(m, 1)]) + '-(' + W([X(s, 2), X(-s, 1)]) + ')+(' + W([X(s, 2), X(s, 1)]) + ')', val: P.add(X(m, 1), P.neg(S([X(s, 2), X(-s, 1)])), S([X(s, 2), X(s, 1)])) }; },
            function (want) { var c = r.int(3, 9), d = r.int(2, 6), a = r.int(2, 4), b = want == null ? a + k + r.pick([-3, -2, 2, 3]) : a + want; return { tex: c + '+(' + W([T(d), X(-a, 1)]) + ')-(' + W([T(c + d), X(-b, 1)]) + ')', val: P.sub(P.add(T(c), S([T(d), X(-a, 1)])), S([T(c + d), X(-b, 1)])) }; },
            function (want) { var tt = r.int(2, 5), u = r.int(2, 6), v = r.int(2, 7), w = want == null ? k + r.pick([3, -2, 2, 4]) : want; return { tex: '(' + W([X(tt, 2), X(-u, 1), T(v)]) + ')-(' + W([X(tt, 2), X(-u, 1)]) + ')+(' + W([X(w, 1), T(-v)]) + ')', val: P.add(P.sub(S([X(tt, 2), X(-u, 1), T(v)]), S([X(tt, 2), X(-u, 1)])), S([X(w, 1), T(-v)])) }; }];
          var target = X(k, 1), opts, g = 0;
          do {
            var ri = r.int(0, 3);
            opts = tpl.map(function (f, i) { var o = f(i === ri ? k : null); o.right = i === ri; return o; });
            g++;
          } while (g < 300 && (!opts.every(function (o) { return o.right ? P.eq(o.val, target) : !P.eq(o.val, target) && !P.isZero(o.val) && P.count(o.val) === 1; }) || opts.some(function (o, i) { return opts.some(function (q, j) { return j > i && P.eq(o.val, q.val); }); })));
          return KP.mc(r, 'Which of the following polynomial expressions, when simplified, is equal to ' + t(tx(target)) + '?', opts.map(function (o) {
            return { html: t(o.tex), right: o.right, why: o.right ? null : 'Simplify it carefully: it equals ' + t(tx(o.val)) + '. Remember that a minus sign in front of a bracket changes the sign of every term inside.' };
          }), 'Simplify each option:<br>' + opts.map(function (o) { return t(o.tex + '=' + tx(o.val)) + (o.right ? ' ✓' : ''); }).join('<br>'),
          ['Simplify every option. Change the sign of every term in a bracket that follows a minus sign.'], 'which simplifies to ' + k + 'x');
        } }] },
      { num: '18', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '18', level: 'EMG', make: function (r) {
          var a = r.int(2, 6), c = r.int(1, 3), mono = r.chance(0.25), d; do { d = mono ? 2 * a : r.int(1, 5); } while (!mono && d === 2 * a);
          var side = S([T(1, 'x', 1), T(a)]), base = S([T(c, 'x', 1), T(-d)]), per = P.add(side, side, base), n = P.count(per);
          var labels = ['a monomial', 'a binomial', 'a trinomial', 'none of the above'];
          return KP.mc(r, 'The perimeter of the isosceles triangle shown can be represented by<div class="fig">' + isoSvg(plainPoly(side).replace(/\+/g, ' + '), plainPoly(base).replace(/-/g, ' - ')) + '</div>', labels.map(function (l, i) {
            var right = i === n - 1;
            return { html: l, right: right, why: right ? null : i === 2 ? 'There are three sides, but that’s not the number of <b>terms</b>. Add the sides and collect like terms first.' : i === 3 ? 'Add the three sides and collect like terms; then count the terms.' : 'Add all three sides (the two equal sides both count) and collect like terms, then count the terms.' };
          }), 'The two equal sides are ' + t(tx(side)) + ' each and the base is ' + t(tx(base)) + ':<br>' + t('(' + tx(side) + ')+(' + tx(side) + ')+(' + tx(base) + ')=' + tx(per)) + ', which has ' + termsCount(n) + '. <b>Answer: ' + labels[n - 1] + '</b>.',
          ['The tick marks show which two sides are equal. Add all three sides, then count the terms.'], 'isosceles perimeter is a ' + nameOf(n), true);
        } }] },
      { num: '19', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '19', level: 'EMG', make: function (r) {
          var c0 = r.int(2, 9), c1 = -r.int(2, 6), c2 = r.int(2, 6), n = r.int(4, 6), cn = -r.int(2, 8);
          var terms = [T(c0), T(c1, 'x', 1), T(c2, 'x', 2), T(cn, 'x', n)], a = n, b = cn, c = c0, ans = 2 * a - 3 * b + c;
          var f = function (A, Bv, C) { return 2 * A - 3 * Bv + C; };
          var diags = [[f(a, c0, c), 'lc-first', 'The leading coefficient belongs to the term with the <b>highest power</b>, ' + t(cn + 'x^{' + n + '}') + ' — not the first number written.'], [f(a, -b, c), 'lc-sign', 'The leading coefficient is ' + t(cn) + ' (negative). Then ' + t('-3b=-3(' + cn + ')') + ' is positive.'],
            [f(a, c1, c), 'lc-coef', 'The leading coefficient is the coefficient of the highest power, ' + t('x^{' + n + '}') + '.'], [f(4, b, c), 'deg-terms', 'The degree is the highest power, ' + t(n) + ', not the number of terms.'], [2 * a + 3 * b + c, 'neg-sub', 'Careful with signs: ' + t('-3b=-3(' + b + ')=' + (-3 * b)) + '.']];
          return KP.nr('If the polynomial ' + t(W(terms)) + ' has degree ' + t('a') + ', leading coefficient ' + t('b') + ', and constant term ' + t('c') + ', then the value of ' + t('2a-3b+c') + ' is ________.', ans, function (v) {
            for (var i = 0; i < diags.length; i++) if (v === diags[i][0] && diags[i][0] !== ans) return { code: diags[i][1], hint: diags[i][2] };
            return null;
          }, 'Highest power ' + t('x^{' + n + '}') + ', so ' + t('a=' + n) + '; its coefficient is ' + t(cn) + ', so ' + t('b=' + cn) + '; the term with no variable is ' + t(c0) + ', so ' + t('c=' + c0) + '.<br>' + t('2a-3b+c=2(' + n + ')-3(' + cn + ')+' + c0 + '=' + 2 * n + '+' + (-3 * cn) + '+' + c0 + '=' + ans),
          ['The polynomial isn’t in descending order. Find the highest power first.', 'Substitute with brackets: ' + t('-3(b)') + '.'], 'NR 2a-3b+c');
        } }] }
    ],
    extra: EXTRA
  });


  /* ---------- part makers used by the extras ---------- */
  function tc(n) { return n > 0 ? [n, 0] : [0, -n]; }
  function degSumTex(q) { var v = P.terms(q)[0].v, ks = Object.keys(v).filter(function (x) { return v[x]; }).sort(); return ks.length ? ks.map(function (x) { return v[x]; }).join('+') + '=' + P.degree(q) : '0'; }
  function degTermDiag(q) {
    var v = P.terms(q)[0].v, ks = Object.keys(v).filter(function (x) { return v[x]; }), mx = ks.length ? Math.max.apply(null, ks.map(function (x) { return v[x]; })) : 0, c = Math.abs(P.terms(q)[0].c[0]);
    return function (x) { if (ks.length > 1 && x === mx) return { code: 'deg-max', hint: 'Add the exponents of <b>all</b> the variables in the term (' + t(degSumTex(q)) + ').' }; if (x === c && c !== P.degree(q)) return { code: 'deg-coef', hint: 'The coefficient doesn’t count. Add the exponents.' }; return null; };
  }
  function twoVarPart(r, terms) {
    var Sp = S(terms), d = P.degree(Sp), n = terms.length, shown = r.chance(0.5) ? terms : r.shuffle(terms);
    var fl = shown.map(function (q, i) { return { name: 'Degree of term ' + (i + 1), label: 'Degree of ' + t(tx(q)) }; }).concat([{ name: 'Degree of the polynomial', label: 'Degree of the polynomial' }, { name: 'Name', label: 'Name', mode: 'text', placeholder: 'e.g. binomial' }]);
    var chks = shown.map(function (q) { return K.number(P.degree(q), degTermDiag(q)); }).concat([K.number(d, function (v) { var all = terms.reduce(function (s, q) { return s + P.degree(q); }, 0); return v === all ? { code: 'deg-sum-all', hint: 'The degree of the polynomial is the degree of its <b>highest</b> term, not the total.' } : null; }), nameChk(n)]);
    return KP.fields(t(W(shown)), fl, chks, shown.map(function (q) { return String(P.degree(q)); }).concat([String(d), nameOf(n)]),
      shown.map(function (q) { return t(tx(q)) + ': ' + t(P.degree(q)); }).join(', ') + '; degree ' + t(d) + '; ' + nameOf(n),
      shown.map(function (q) { return t(tx(q)) + ': ' + t(degSumTex(q)); }).join(';&nbsp; ') + '.<br>The highest is ' + t(d) + ', so the polynomial has degree ' + t(d) + '. It has ' + termsCount(n) + ': a <b>' + nameOf(n) + '</b>' + (n > 3 ? ' (no special name)' : '') + '.',
      ['Degree of a term: add the exponents of its variables. Degree of the polynomial: the highest term degree.', 'Name: 1 term monomial, 2 binomial, 3 trinomial, 4 or more polynomial.'], 'degrees & name of ' + plain(W(shown)));
  }
  function descRowPart(r, x, terms) {
    var Sp = S(terms), lead = P.lead(Sp, x), ct = P.constant(Sp), d = P.degreeIn(Sp, x), first = terms[0].length ? P.terms(terms[0])[0].c : [0, 1];
    var fl = [{ name: 'Descending order', label: 'Descending', mode: 'math', keys: 'poly', vars: [x], placeholder: PH }, { name: 'Leading coefficient', label: 'Leading coeff.', mode: 'math', keys: 'poly', vars: [x] }, { name: 'Constant term', label: 'Constant term', mode: 'math', keys: 'poly', vars: [x] }, { name: 'Degree', label: 'Degree' }];
    var lcV = lead[0] / lead[1], ctV = ct[0] / ct[1];
    var chks = [K.poly(Sp, { order: 'desc', var: x }), numChk(lcV, [{ v: first[0] / first[1], code: 'lc-first', hint: 'The leading coefficient belongs to the term with the <b>highest</b> power, not the first term written.' }, { v: -lcV, code: 'lc-sign', hint: 'Keep the sign of the leading coefficient.' }, { v: d, code: 'lc-exp', hint: 'That’s the degree. The leading coefficient is the number in front of the highest power.' }], { what: 'the leading coefficient' }),
      numChk(ctV, [{ v: -ctV, code: 'ct-sign', hint: 'Keep the sign of the constant term.' }], { what: 'the constant term' }), K.number(d)];
    return KP.fields(t(W(terms)), fl, chks, [P.tex(Sp, { order: 'desc', var: x }), rt(lead), rt(ct), String(d)],
      t(P.tex(Sp, { order: 'desc', var: x })) + '; leading coefficient ' + t(rt(lead)) + ', constant term ' + t(rt(ct)) + ', degree ' + t(d),
      'Descending powers of ' + t(x) + ': ' + t(P.tex(Sp, { order: 'desc', var: x })) + '.<br>Leading coefficient ' + t(rt(lead)) + ' (the coefficient of ' + t(x + '^{' + d + '}') + '), constant term ' + t(rt(ct)) + (ct[0] === 0 ? ' (there is no term without ' + t(x) + ')' : '') + ', degree ' + t(d) + '.',
      ['Rewrite it first, highest power first. Then read the leading coefficient and degree from the first term and the constant term from the last.'], 'descending + LC/CT/deg ' + plain(W(terms)));
  }
  /* ---------- algebra-tile builder (js/draw.js tilepad, poly mode) ---------- */
  /* shaded / white counts per shape from the builder's raw tokens (falls back to the net counts when there is no raw) */
  function rawCounts(resp) {
    var c = { x2: [0, 0], x: [0, 0], one: [0, 0] }, list = resp && resp.raw && resp.raw.mat;
    if (list) list.forEach(function (tk) { var neg = tk.charAt(0) === '-', k = tk.replace('-', ''); c[k === 'x2' ? 'x2' : k === 'x' ? 'x' : 'one'][neg ? 1 : 0]++; });
    else ['x2', 'x', 'one'].forEach(function (k) { c[k] = tc((resp && resp[k]) || 0); });
    return c;
  }
  /* cnt = { x2, x, one } net counts of the target. o.flipHint: hint when every tile has the other colour; o.wrong: [{ is: counts, code, hint }] */
  function tileBuildChk(cnt, o) {
    o = o || {};
    var base = K.tilePoly(tilePoly({ x2: tc(cnt.x2), x: tc(cnt.x), one: tc(cnt.one) }));
    var same = function (n, w) { return n.x2 === (w.x2 || 0) && n.x === (w.x || 0) && n.one === (w.one || 0); };
    return function (resp) {
      resp = resp || {};
      var n = { x2: resp.x2 || 0, x: resp.x || 0, one: resp.one || 0 }, rc = rawCounts(resp);
      var placed = rc.x2[0] + rc.x2[1] + rc.x[0] + rc.x[1] + rc.one[0] + rc.one[1];
      if (!n.x2 && !n.x && !n.one) return placed ? wrong('zero-pairs', 'Every tile you placed is cancelled by a tile of the same shape and the other colour, so your tiles are worth ' + t('0') + '. Start again with only the tiles the polynomial needs.') : form('empty', 'Add some tiles first: tap a tile to put it on the mat.');
      if (base(resp).v === 'correct') {
        var zp = ['x2', 'x', 'one'].filter(function (k) { return rc[k][0] && rc[k][1]; });
        if (zp.length) return form('tile-zp', 'Your tiles are worth the right amount, but they include zero pairs (a shaded and a white tile of the same shape). Remove the pairs so the model uses the fewest tiles.');
        return ok();
      }
      for (var i = 0; i < (o.wrong || []).length; i++) if (same(n, o.wrong[i].is)) return wrong(o.wrong[i].code, o.wrong[i].hint);
      if (same(n, { x2: -cnt.x2, x: -cnt.x, one: -cnt.one })) return wrong('tile-colour', o.flipHint || 'Every tile has the wrong colour. <b>Shaded</b> tiles are positive and <b>white</b> tiles are negative.');
      if (cnt.x2 !== cnt.x && same(n, { x2: cnt.x, x: cnt.x2, one: cnt.one })) return wrong('tile-shape', 'You swapped the shapes: the big square is the ' + t('x^{2}') + '-tile and the long thin rectangle is the ' + t('x') + '-tile.');
      return base(resp);
    };
  }
  /* build a polynomial with tiles. cnt = { x2, x, one } (net, signed). o: { prompt, text, sol, hints, flipHint, wrong, bad } */
  function buildPart(cnt, o) {
    o = o || {};
    var c = { x2: tc(cnt.x2), x: tc(cnt.x), one: tc(cnt.one) }, ans = tilePoly(c), n = toks(c).length;
    var key = { x2: cnt.x2, x: cnt.x, one: cnt.one };
    var p = KP.tiles(o.prompt || 'Build ' + t(tx(ans)) + ' with algebra tiles.', { mode: 'poly' }, ans,
      o.sol || t(tx(ans)) + ': ' + tileDesc(c) + ' — ' + n + ' tile' + (n === 1 ? '' : 's') + ' altogether.<br>Each term gives the shape (the power of ' + t('x') + '), the number of tiles (the size of the coefficient) and the colour (the sign: shaded positive, white negative).',
      o.hints || ['Each term tells you the shape (from the power of ' + t('x') + '), how many tiles (the size of the coefficient) and the colour (the sign).', 'Shaded = positive, white = negative. A term that isn’t there needs no tiles.'],
      o.text || 'build tiles for ' + plainPoly(ans), key);
    p.check = tileBuildChk(cnt, o);
    var bad = [{ x2: -cnt.x2, x: -cnt.x, one: -cnt.one }, { x2: cnt.x2, x: cnt.x, one: cnt.one === 0 ? 1 : -cnt.one }];
    if (cnt.x2 !== cnt.x) bad.push({ x2: cnt.x, x: cnt.x2, one: cnt.one });
    bad.push({ x2: cnt.x2, x: cnt.x, one: cnt.one, raw: { mat: toks(c).concat(['1', '-1']) } });   // right value, but with a zero pair
    p.bad = bad.concat(o.bad || []);
    return p;
  }
  /* ---------- take-away tiles with zero pairs (js/draw2.js: tilepad takeaway) ---------- */
  /* net counts { x2, x, one } of a polynomial in x */
  function cntOf(p) { return { x2: P.coef(p, { x: 2 })[0] || 0, x: P.coef(p, { x: 1 })[0] || 0, one: P.constant(p)[0] || 0 }; }
  var TK = { x2: 'x2', x: 'x', one: '1' }, TNM = { x2: t('x^{2}') + '-tile', x: t('x') + '-tile', one: 'unit tile' };
  function nTiles(n, k, col) { return n + ' ' + col + ' ' + TNM[k] + (n === 1 ? '' : 's'); }
  /* the mat shows A; take away B. Returns the zero pairs needed per shape and the key drawing */
  function takePlan(Ap, Bp) {
    var s = cntOf(Ap), b = cntOf(Bp), zp = {}, mat = [], away = [];
    ['x2', 'x', 'one'].forEach(function (k) {
      var have = s[k] * b[k] > 0 ? Math.abs(s[k]) : 0; zp[k] = Math.max(0, Math.abs(b[k]) - have);
      var i, tok = TK[k], ps = s[k] > 0 ? tok : '-' + tok, pb = b[k] > 0 ? tok : '-' + tok, list = [];
      for (i = 0; i < Math.abs(s[k]); i++) list.push(ps);
      for (i = 0; i < zp[k]; i++) list.push(tok, '-' + tok);
      for (i = 0; i < Math.abs(b[k]); i++) { list.splice(list.indexOf(pb), 1); away.push(pb); }
      mat = mat.concat(list);
    });
    var left = P.sub(Ap, Bp), lc = cntOf(left);
    return { s: s, b: b, zp: zp, left: left, total: mat.length + away.length, key: { x2: lc.x2, x: lc.x, one: lc.one, away: { x2: b.x2, x: b.x, one: b.one }, raw: { mat: mat, away: away } } };
  }
  function awayCounts(resp) {
    var c = { x2: [0, 0], x: [0, 0], one: [0, 0] };
    (((resp || {}).raw || {}).away || []).forEach(function (tk) { var neg = tk.charAt(0) === '-', k = tk.replace('-', ''); c[k === 'x2' ? 'x2' : k === 'x' ? 'x' : 'one'][neg ? 1 : 0]++; });
    return c;
  }
  function takeAwayPart(Aterms, Bterms) {
    var Ap = S(Aterms), Bp = S(Bterms), pl = takePlan(Ap, Bp), base = K.tileTakeaway(pl.s, tx(Bp));
    var need = function (k) { var b = pl.b[k]; return b ? nTiles(Math.abs(b), k, b > 0 ? 'shaded' : 'white') : 'no ' + TNM[k] + 's'; };
    var zpTxt = ['x2', 'x', 'one'].filter(function (k) { return pl.zp[k]; }).map(function (k) { return pl.zp[k] + ' zero pair' + (pl.zp[k] === 1 ? '' : 's') + ' of ' + TNM[k] + 's'; });
    var p = KP.tiles('The mat shows ' + t(W(Aterms)) + '. Use the tiles to subtract ' + t(B(Bterms)) + ': take away its tiles. If a tile you need isn’t on the mat, add <b>zero pairs</b> first.',
      { takeaway: true, start: pl.s, zeroKinds: ['x2', 'x', '1'], limit: 26 }, tx(Bp),
      'To take away ' + t(W(Bterms)) + ' you need ' + ['x2', 'x', 'one'].filter(function (k) { return pl.b[k]; }).map(need).join(', ') + '.<br>' +
        'The mat doesn’t have them all, so add ' + zpTxt.join(', ') + ' — each zero pair is worth ' + t('0') + ', so the mat still shows ' + t(W(Aterms)) + '.<br>' +
        'Take the tiles of ' + t(W(Bterms)) + ' away. What is left is ' + t(tx(pl.left)) + '.',
      ['To take away ' + t(W(Bterms)) + ', count the shapes and colours it needs: ' + ['x2', 'x', 'one'].filter(function (k) { return pl.b[k]; }).map(need).join(', ') + '.', 'Not enough of a tile on the mat? Add a zero pair (one shaded and one white tile of that shape — together worth ' + t('0') + '), then take away the one you need.'],
      'take away ' + plain(B(Bterms)) + ' from ' + plain(W(Aterms)), pl.key);
    p.check = function (resp) {
      var res = base(resp); if (res.v !== 'wrong' || res.code === 'tile-away-zero') return res;
      var a = awayCounts(resp), opp = ['x2', 'x', 'one'].every(function (k) { var b = pl.b[k]; return a[k][b > 0 ? 1 : 0] === Math.abs(b) && a[k][b > 0 ? 0 : 1] === 0; });
      if (opp) return wrong('tile-away-opp', 'You took away the tiles of the <b>opposite</b>, ' + t(tx(P.neg(Bp))) + '. Take away exactly the tiles of ' + t(W(Bterms)) + ' — same shapes, same colours.');
      for (var i = 0; i < 3; i++) {
        var k = ['x2', 'x', 'one'][i], b = pl.b[k], want = b > 0 ? [b, 0] : [0, -b];
        if (a[k][0] === want[0] && a[k][1] === want[1]) continue;
        var wrongCol = b && a[k][b > 0 ? 1 : 0] > 0;
        return wrong('tile-away', 'Check the ' + TNM[k] + 's you took away: ' + t(W(Bterms)) + ' needs ' + need(k) + (wrongCol ? ' — no ' + (b > 0 ? 'white' : 'shaded') + ' ones' : '') + '.' + (pl.zp[k] && a[k][0] + a[k][1] < Math.abs(b) ? ' The mat doesn’t have enough, so add zero pairs of ' + TNM[k] + 's first.' : ''));
      }
      return res;
    };
    var only = { raw: { mat: [], away: [] } };   // took away only what was already on the mat
    ['x2', 'x', 'one'].forEach(function (k) { var b = pl.b[k], n = Math.min(Math.abs(b), pl.s[k] * b > 0 ? Math.abs(pl.s[k]) : 0); for (var i = 0; i < n; i++) only.raw.away.push(b > 0 ? TK[k] : '-' + TK[k]); });
    var oppA = { raw: { mat: [], away: pl.key.raw.away.map(function (tk) { return tk.charAt(0) === '-' ? tk.slice(1) : '-' + tk; }) } };
    var extra = { raw: { mat: [], away: pl.key.raw.away.concat(['x', '-x']) } };
    p.bad = [oppA, extra].concat(only.raw.away.length ? [only] : []);
    p.total = pl.total;
    return p;
  }
  /* addition with tiles: the mat starts with A's tiles; the student adds B's tiles and removes the zero pairs (poly mode) */
  function addTilesPart(Aterms, Bterms) {
    var Ap = S(Aterms), Bp = S(Bterms), ans = P.add(Ap, Bp), a = cntOf(Ap), b = cntOf(Bp), n = cntOf(ans);
    var zp = ['x2', 'x', 'one'].filter(function (k) { return a[k] * b[k] < 0; }).map(function (k) { return Math.min(Math.abs(a[k]), Math.abs(b[k])) + ' zero pair' + (Math.min(Math.abs(a[k]), Math.abs(b[k])) === 1 ? '' : 's') + ' of ' + TNM[k] + 's'; });
    var p = buildPart(n, { prompt: 'The mat shows ' + t(W(Aterms)) + '. Add the tiles for ' + t(W(Bterms)) + ', then remove the zero pairs. The tiles left show the sum.', text: 'add with tiles ' + plain(W(Aterms)) + ' + ' + plain(B(Bterms)),
      sol: 'Add ' + tileDesc({ x2: tc(b.x2), x: tc(b.x), one: tc(b.one) }) + ' to the mat.' + (zp.length ? ' Remove ' + zp.join(' and ') + ' — each pair is worth ' + t('0') + '.' : '') + '<br>Left: ' + tileDesc({ x2: tc(n.x2), x: tc(n.x), one: tc(n.one) }) + ', so the sum is ' + t(tx(ans)) + '.',
      hints: ['Add the tiles for ' + t(W(Bterms)) + ': the shape comes from the power of ' + t('x') + ', the colour from the sign.', 'A shaded and a white tile of the same shape cancel: remove each such pair (tap a tile to remove it).'],
      wrong: [{ is: a, code: 'no-change', hint: 'The mat still shows only ' + t(W(Aterms)) + '. Add the tiles for ' + t(W(Bterms)) + ' too.' }, { is: cntOf(P.sub(Ap, Bp)), code: 'tile-colour', hint: 'You added the tiles of the <b>opposite</b> of ' + t(B(Bterms)) + '. This is an addition: add its tiles with their own colours (negative terms are white).' }],
      bad: [a, cntOf(P.sub(Ap, Bp))] });
    p.input = { mode: 'poly', start: a, limit: 26 };
    p.input.type = 'tilepad';
    p.bad.push({ x2: n.x2, x: n.x, one: n.one, raw: { mat: HW.tiles.count(a).concat(HW.tiles.count(b)) } });   // right value, zero pairs left in
    return p;
  }
  function likeGrid(rows, text) {
    var cols = [{ id: 'like', html: 'Like' }, { id: 'exp', html: 'Unlike (exp.)' }, { id: 'var', html: 'Unlike (letters)' }], want = {};
    var rr = rows.map(function (x, i) { want['r' + i] = x.w; return { id: 'r' + i, html: t(x.tex), label: plain(x.tex) }; });
    return KP.grid('Like or unlike? If unlike, choose the reason: <b>exp.</b> = the exponents differ, <b>letters</b> = the variables differ.', rr, cols, want, { tries: 2, why: function (row) { return { code: 'row', hint: rows[Number(row.slice(1))].why }; } },
      rows.map(function (x) { return t(x.tex) + ': <b>' + cols.filter(function (c) { return c.id === x.w; })[0].html + '</b> — ' + x.why; }).join('<br>'), ['Like terms: the same variables with the same exponents (the coefficients and the order of the letters don’t matter).'], text);
  }
  function likePart(terms) {
    var ans = S(terms), lumpVars = P.terms(terms[0])[0].v, total = terms.reduce(function (s, q) { var c = P.terms(q)[0] ? P.terms(q)[0].c : [0, 1]; return ex.norm(s[0] * c[1] + c[0] * s[1], s[1] * c[1]); }, [0, 1]);
    return pp(t(W(terms)), ans, { text: 'collect ' + plain(W(terms)), wrong: [{ is: M(total, lumpVars), code: 'unlike-combined', hint: 'Only <b>like</b> terms combine: ' + t('xy') + ', ' + t('x^{2}y') + ' and ' + t('xy^{2}') + ' are different groups. Sort the terms into groups first.' }],
      sol: 'Groups: ' + groupsTex(terms) + '<br>' + t('=' + tx(ans)), hints: ['Sort the terms into groups with exactly the same variable part (same letters, same exponents), then add the coefficients in each group.'] });
  }
})(window);
