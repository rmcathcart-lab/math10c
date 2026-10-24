/* Math 10C · Unit 3 Test (AN4: multiplying polynomials) — the paper outcomes-based unit test (u3_test_A/B/C.tex) as generators.
 * The paper has three pages for AN4 (Part 1 monomial and binomial products, Part 2 larger products, Part 3 applications),
 * each in BEG / PRG / MAS boxes; every question keeps its box (outcome, level) and its paper number (1–25). Each part takes
 * its numbers from the seed, inside the range Versions A, B and C show (their numbers are possible values), with a key and a
 * worked solution for every version. Polynomial answers use js/poly.js (K.poly: exact equality, then "expanded and
 * simplified" form), with the classic wrong answers of each product recognised (copied from the Unit 3 practice files).
 * Conversions from paper:
 *   "complete the area diagram" → an area box the student fills (js/draw2.js areabox), then the product as its own part
 *     (Q3, Q7, Q11, Q19); Q7's missing side lengths are hidden headers of the box;
 *   reading algebra tiles (Q2, Q6) → typed answers (the multiplication is checked to be the rectangle's own sides);
 *   "write the multiplication" → a typed product of factors, checked by its factors (either order, signs moved allowed);
 *   "explain your reasoning" (Q8, Q15, Q16, Q25) → the values and the step that shows the reasoning, in labelled boxes;
 *   "write two different products" (Q9) → two boxes, each checked to be a monomial × binomial that expands to the target;
 *   true / false with a justification (Q17) → a true/false box plus the expansion (or constant term) that justifies it;
 *   "describe each error" (Q23) → a table: for each kind of error, which student made it (or neither), then the correct
 *     expansion; "show the special product you used" (Q24) → the special product typed, then the value. */
(function (root) {
  'use strict';
  var HW = root.HW, F = HW.fmt, K = HW.kit, KP = K.P, PL = HW.poly, ex = HW.ex, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form;

  HW.addCodes({
    'u3t-tile-dims': 'Tiles: right product, but not the rectangle’s sides', 'u3t-tile-side': 'Tiles: misread a side of the rectangle',
    'u3t-not-product': 'Wrote the expanded form instead of the multiplication', 'u3t-factors': 'Multiplication doesn’t give the product',
    'u3t-a-sign': 'Working backwards: wrong sign on a', 'u3t-b-coef': 'Middle coefficient: left out the leading coefficient', 'u3t-b-one': 'Middle coefficient: only one of the two middle products',
    'u3t-b-sign': 'Middle coefficient: sign slip', 'u3t-one-product': 'Only one of the two products is right', 'u3t-same-product': 'Gave the same product twice',
    'u3t-prod-value': 'Product doesn’t expand to the given polynomial', 'u3t-a-half': 'Didn’t halve the x-coefficient to find a', 'u3t-b-nosq': 'Didn’t square a when finding b',
    'u3t-b-plus': 'Added a² instead of subtracting it', 'u3t-k-sign': 'Wrong sign for k', 'u3t-notice': 'Miscounted the terms of the expansion', 'u3t-tf-only': 'Right working, wrong true/false conclusion',
    'u3t-tf': 'Wrong true/false', 'u3t-tf-word': 'True/false box not filled with true or false', 'u3t-two-edges': 'Volume: multiplied only two of the three edges', 'u3t-box-x': 'Box: took x instead of 2x off each side',
    'u3t-box-height': 'Box: left out the height', 'u3t-err-who': 'Matched an error to the wrong student', 'u3t-err-who2': 'Matched several errors wrongly', 'u3t-sp-value': 'Special product with the wrong value',
    'u3t-sp-form': 'Not written as a special product', 'u3t-new-side': 'Gave the new side length', 'u3t-inc-nod2': 'Solving: left out the d² term'
  });
  HW.addPartial({
    'u3t-tile-dims': 'b', 'u3t-tile-side': 'b', 'u3t-not-product': 'b', 'u3t-factors': 'n', 'u3t-a-sign': 's', 'u3t-b-coef': 'b', 'u3t-b-one': 'b', 'u3t-b-sign': 's',
    'u3t-one-product': 's', 'u3t-same-product': 'b', 'u3t-prod-value': 'n', 'u3t-a-half': 'b', 'u3t-b-nosq': 'b', 'u3t-b-plus': 'b', 'u3t-k-sign': 'b',
    'u3t-notice': 'n', 'u3t-tf-only': 'b', 'u3t-tf': 'n', 'u3t-two-edges': 'b', 'u3t-box-x': 'b', 'u3t-box-height': 'b', 'u3t-err-who': 'b', 'u3t-err-who2': 'n',
    'u3t-sp-value': 'n', 'u3t-sp-form': 'b', 'u3t-new-side': 's', 'u3t-inc-nod2': 'b'
  });

  /* ---------- polynomial helpers ---------- */
  function xm(c, e, v) { var o = {}; o[v || 'x'] = e == null ? 1 : e; return PL.mono(c, o); } // c·x^e
  function M(c, vars) { return PL.mono(c, vars || {}); }
  function N(c) { return PL.num(c); }
  function lin(a, b, v) { return PL.add(xm(a, 1, v), N(b)); }
  var add = PL.add, mul = PL.mul, sub = PL.sub, neg = PL.neg;
  function tx(p) { return PL.tex(p); }
  function seq(list) { return PL.seq(list); }
  function br(list) { return '(' + seq(list) + ')'; }
  function bp(p) { return '(' + tx(p) + ')'; }
  function sumOf(list) { return add.apply(null, list); }
  function pf(p) { var s = tx(p); return PL.count(p) > 1 || s.charAt(0) === '-' ? '(' + s + ')' : s; }
  function dot(a, b) { return pf(a) + '\\cdot ' + pf(b); }
  function coefOf(m) { var ts = PL.terms(m); return ts.length ? ts[0].c[0] / ts[0].c[1] : 0; }
  function lab(p, i) { var s = tx(p); return i > 0 && s.charAt(0) !== '-' ? '+' + s : s; }
  function termsOf(p) { return PL.sorted(p).map(function (q) { return M(q.c, q.v); }); }
  function lead(p) { return termsOf(p)[0]; }
  function find(gen, test, fb) { for (var i = 0; i < 2000; i++) { var v = gen(); if (v != null && test(v)) return v; } return fb; }
  function nz(r, a, b) { return (r.chance(0.5) ? 1 : -1) * r.int(a, b); }
  function sg(n) { return n < 0 ? String(n) : '+' + n; }
  function cnum(n) { return n < 0 ? '(' + n + ')' : String(n); }
  /* every term of A times every term of B, written out, then collected */
  function distTex(A, B) { var ps = []; termsOf(A).forEach(function (a) { termsOf(B).forEach(function (b) { ps.push(mul(a, b)); }); }); var s = seq(ps), res = tx(mul(A, B)); return s === res ? s : s + '=' + res; }
  /* (A)(B) without the middle term of a square: first² + last² */
  function sqNoMid(a) { var la = lead(a), rest = sub(a, la); return add(mul(la, la), mul(rest, rest)); }
  function sqOnce(a) { var la = lead(a), rest = sub(a, la); return add(mul(la, la), mul(la, rest), mul(rest, rest)); }
  /* subtracting B but changing only the sign of its first term */
  function subFirstOnly(A, B) { var lb = lead(B); return add(A, neg(lb), sub(B, lb)); }

  /* ---------- part builders ---------- */
  /* polynomial answer: classic wrong answers that coincide with the key (or each other) are dropped; the rest are bad answers */
  function pp(prompt, target, ws, sol, hints, text, opt) {
    opt = opt || {};
    var seen = [target], W = [];
    (ws || []).forEach(function (w) { if (!w || !w.is) return; var p = PL.lift(w.is); if (seen.some(function (s) { return PL.eq(s, p); })) return; seen.push(p); W.push({ is: p, code: w.code, hint: w.hint }); });
    var part = KP.poly(prompt, target, Object.assign({}, opt, { wrong: W }), sol, hints, text);
    part.bad = W.map(function (w) { return tx(w.is); });
    if (PL.count(target) > 1) part.good = [PL.tex(target, { order: 'asc' })];
    return part;
  }
  function polyChk(target, ws, opt) {
    var seen = [PL.lift(target)], W = [];
    (ws || []).forEach(function (w) { if (!w || !w.is) return; var p = PL.lift(w.is); if (seen.some(function (s) { return PL.eq(s, p); })) return; seen.push(p); W.push({ is: p, code: w.code, hint: w.hint }); });
    var c = K.poly(target, Object.assign({}, opt || {}, { wrong: W }));
    c.wrongs = W;
    return c;
  }
  function numChk(n, alts) {
    return K.number(n, function (v) { for (var i = 0; i < (alts || []).length; i++) if (alts[i] && v === alts[i].v && v !== n) return { code: alts[i].code, hint: alts[i].hint }; return null; });
  }
  function altVals(n, alts) { var seen = [n]; return (alts || []).filter(function (a) { if (!a || !isFinite(a.v) || seen.indexOf(a.v) >= 0) return false; seen.push(a.v); return true; }); }
  function pbox(label, vars, extra) { return Object.assign({ label: label, name: label.replace(/<[^>]*>|\\\(|\\\)/g, '').replace(/:$/, ''), mode: 'math', keys: 'poly', vars: vars || ['x'], wide: true }, extra || {}); }
  function nbox(label, extra) { return Object.assign({ label: label, name: label.replace(/<[^>]*>|\\\(|\\\)/g, '').replace(/:$/, '') }, extra || {}); }

  /* classic wrong answers: a monomial times a bracket */
  function monoWrongs(m, terms) {
    var out = [], prods = terms.map(function (q) { return mul(m, q); }), c = coefOf(m);
    if (terms.length > 1) {
      out.push({ is: sumOf([prods[0]].concat(terms.slice(1))), code: 'first-only', hint: 'Multiply <b>every</b> term in the bracket by ' + t(tx(m)) + ', not just the first one.' });
      if (c < 0) out.push({ is: sumOf([prods[0]].concat(terms.slice(1).map(function (q) { return mul(neg(m), q); }))), code: 'neg-first', hint: 'The negative sign is part of ' + t(tx(m)) + ', so it multiplies <b>every</b> term in the bracket. Check the signs after the first term.' });
      if (PL.vars(m).length) out.push({ is: sumOf([prods[0]].concat(terms.slice(1).map(function (q) { return mul(N(c), q); }))), code: 'var-first', hint: 'The variable part of ' + t(tx(m)) + ' multiplies every term in the bracket too, not just the first one.' });
    }
    return out;
  }
  /* binomial × binomial: (A + B)(C + D) */
  function foil(A, B, C, D) { var Fp = mul(A, C), O = mul(A, D), I = mul(B, C), L = mul(B, D); return { F: Fp, O: O, I: I, L: L, res: add(Fp, O, I, L) }; }
  function binWrongs(A, B, C, D) {
    var f = foil(A, B, C, D), bothNeg = coefOf(B) < 0 && coefOf(D) < 0, mid = 'You have only one of the two middle products. Find both the Outside product ' + t(dot(A, D)) + ' and the Inside product ' + t(dot(B, C)) + '.';
    return [{ is: add(f.F, f.L), code: 'fl-only', hint: 'You multiplied only the <b>First</b> terms and the <b>Last</b> terms. Two binomials give <b>four</b> products — the Outside and Inside products make the middle term.' },
      { is: add(f.F, f.O, f.L), code: 'one-middle', hint: mid }, { is: add(f.F, f.I, f.L), code: 'one-middle', hint: mid },
      { is: add(f.F, f.O, f.I, neg(f.L)), code: 'last-sign', hint: 'Check the sign of the last term: ' + t(dot(B, D)) + '.' + (bothNeg ? ' A negative times a negative is <b>positive</b>.' : '') }];
  }
  function foilSol(A, B, C, D) {
    var f = foil(A, B, C, D), s4 = seq([f.F, f.O, f.I, f.L]);
    return 'F: ' + t(dot(A, C) + '=' + tx(f.F)) + ', &nbsp;O: ' + t(dot(A, D) + '=' + tx(f.O)) + ', &nbsp;I: ' + t(dot(B, C) + '=' + tx(f.I)) + ', &nbsp;L: ' + t(dot(B, D) + '=' + tx(f.L)) + '<br>' + t(s4 + (s4 !== tx(f.res) ? '=' + tx(f.res) : ''));
  }
  var LET = ['x', 'x', 'x', 'x', 'y', 'a', 'm', 'n', 't'];
  var HB = ['Two binomials give <b>four</b> products — First, Outside, Inside, Last — then collect the like terms.', 'Check by substituting a small number for the variable into both the product and your answer: they must match.'];
  /* the square of a binomial A + B */
  function sqWrongs(A, B) {
    var A2 = mul(A, A), B2 = mul(B, B), AB = mul(A, B), S = '(a\\pm b)^{2}=a^{2}\\pm 2ab+b^{2}';
    var out = [{ is: add(A2, B2), code: 'no-middle', hint: 'A square of a binomial is the binomial times <b>itself</b>: expand all four products. The Outside and Inside products give a middle term, ' + t('2ab') + '.' },
      { is: add(A2, AB, B2), code: 'middle-once', hint: 'The Outside and Inside products are the <b>same</b>, so that term appears <b>twice</b>: the middle term is ' + t('2ab') + '.' },
      { is: add(A2, PL.scale(AB, -2), B2), code: 'sq-middle-sign', hint: 'Check the <b>sign of the middle term</b>: it is ' + t('2ab') + ', using the signs of the two terms as written.' },
      { is: add(A2, PL.scale(AB, 2), neg(B2)), code: 'sq-last-neg', hint: 'The last term of a square is ' + t('b^{2}') + ', and a square is never negative.' },
      { is: sub(A2, B2), code: 'sq-as-sd', hint: 'This is a <b>square</b> — the same binomial twice — not a sum times a difference. Use ' + t(S) + ', which has a middle term.' }];
    var ca = Math.abs(coefOf(A)), cb = Math.abs(coefOf(B));
    if (ca !== 1) out.push({ is: add(PL.scale(A2, [1, ca]), PL.scale(AB, 2), B2), code: 'coef-not-squared', hint: 'Square the <b>whole</b> first term, coefficient and all: ' + t('(' + tx(A) + ')^{2}=' + tx(A2)) + '.' });
    if (cb !== 1 && PL.vars(B).length) out.push({ is: add(A2, PL.scale(AB, 2), PL.scale(B2, [1, cb])), code: 'coef-not-squared', hint: 'Square the <b>whole</b> last term, coefficient and all: ' + t('(' + tx(B) + ')^{2}=' + tx(B2)) + '.' });
    return out;
  }
  function sqSol(A, B) {
    var nb = coefOf(B) < 0, Bp = nb ? neg(B) : B, Ap = PL.count(A) === 1 && coefOf(A) === 1 ? tx(A) : '(' + tx(A) + ')', sqA = PL.count(A) === 1 && coefOf(A) === 1 && /^[a-z]$/.test(tx(A)) ? tx(A) : '(' + tx(A) + ')', sqB = PL.vars(Bp).length || coefOf(Bp) !== Math.abs(coefOf(Bp)) ? '(' + tx(Bp) + ')' : tx(Bp);
    var sq = tx(add(A, B));
    return 'Square of a binomial, ' + t('(a' + (nb ? '-' : '+') + 'b)^{2}=a^{2}' + (nb ? '-' : '+') + '2ab+b^{2}') + ':<br>' + t('(' + sq + ')^{2}=' + sqA + '^{2}' + (nb ? '-' : '+') + '2' + Ap + '(' + tx(Bp) + ')+' + sqB + '^{2}=' + tx(mul(add(A, B), add(A, B))));
  }

  /* ---------- reading a typed product (the multiplication) ---------- */
  /* factors of a typed product: { val, multi: [polynomials with 2+ terms], mono, sum: true if it is a sum, not a product } */
  function readFactors(resp) {
    var a = K.read(resp); if (a.res) return { res: a.res };
    var r = PL.read(a.ast); if (!r.ok) return { bad: true };
    var top = a.ast; while (top.t === 'paren') top = top.a;
    if (top.t === 'add' || top.t === 'sub') return { val: r.p, sum: true, multi: [], mono: N(1) };
    var fs = [], sign = 1, bad = false;
    (function walk(x) {
      if (x.t === 'neg') { sign = -sign; walk(x.a); return; }
      if (x.t === 'mul') { walk(x.a); walk(x.b); return; }
      if (x.t === 'paren') { if (x.a.t === 'add' || x.a.t === 'sub') { var q0 = PL.read(x.a); if (q0.ok) fs.push(q0.p); else bad = true; return; } walk(x.a); return; }
      if (x.t === 'pow') {
        var b = x.a; while (b.t === 'paren') b = b.a; var e = ex.rat(x.b);
        if ((b.t === 'add' || b.t === 'sub') && e && e[1] === 1 && e[0] >= 1 && e[0] <= 4) { var q1 = PL.read(b); if (!q1.ok) { bad = true; return; } for (var i = 0; i < e[0]; i++) fs.push(q1.p); return; }
      }
      var q = PL.read(x); if (q.ok) fs.push(q.p); else bad = true;
    })(a.ast);
    if (bad) return { bad: true };
    var multi = fs.filter(function (f) { return PL.count(f) > 1; }), mono = mul.apply(null, fs.filter(function (f) { return PL.count(f) <= 1; }).concat([N(sign)]));
    return { val: r.p, multi: multi, mono: mono };
  }
  /* the multiplication: a product equal to target whose bracket factors are wantMulti (any order, either sign) */
  function factorsChk(target, wantMulti, o) {
    o = o || {};
    return function (resp) {
      var f = readFactors(resp); if (f.res) return f.res; if (f.bad) return wrong('value', null);
      if (!PL.eq(f.val, target)) {
        for (var i = 0; i < (o.wrong || []).length; i++) if (PL.eq(f.val, o.wrong[i].is)) return wrong(o.wrong[i].code, o.wrong[i].hint);
        return wrong('u3t-factors', 'That multiplies out to ' + t(tx(f.val)) + '. ' + (o.hint || 'Check your factors.'));
      }
      if (f.sum) return wrong('u3t-not-product', 'That is the expanded product. Here write the <b>multiplication</b> itself, as a product of its factors, like ' + t(o.example || '2x(x-3)') + '.');
      var left = wantMulti.slice(), match = f.multi.length === wantMulti.length && f.multi.every(function (m) {
        for (var j = 0; j < left.length; j++) if (PL.eq(m, left[j]) || PL.eq(m, neg(left[j]))) { left.splice(j, 1); return true; }
        return false;
      });
      return match ? ok() : wrong(o.dimsCode || 'u3t-tile-dims', o.dimsHint || 'That multiplies out to the right product, but those aren’t the factors shown. Read them from the picture.');
    };
  }

  /* ---------- true / false ---------- */
  function tfRead(s) { s = String(s == null ? '' : s).replace(/\\text\{([^}]*)\}/g, '$1').replace(/[.!\s]+$/, '').trim().toLowerCase(); if (/^(t|true|tru|yes|y)$/.test(s)) return true; if (/^(f|false|fasle|no|n)$/.test(s)) return false; return null; }
  function tfChk(truth) { return function (resp) { var v = tfRead(resp); if (v == null) return form('u3t-tf-word', 'Type <b>true</b> or <b>false</b>.'); return v === truth ? ok() : wrong('u3t-tf', 'Look at your working below: does it show the statement is ' + (truth ? 'false' : 'true') + '?'); }; }
  /* fields: the true/false box first, then the boxes that justify it */
  function tfPart(claim, truth, fields, checkers, keys, answer, sol, hints, text, bad) {
    var p = KP.fields('<b>True or false?</b> “' + claim + '”<br>Type <b>true</b> or <b>false</b>, then fill in the working that justifies it.',
      [{ name: 'True or false', label: 'True or false?', mode: 'text', placeholder: 'T / F' }].concat(fields), [tfChk(truth)].concat(checkers), [truth ? 'true' : 'false'].concat(keys), answer, sol, hints, text);
    var base = p.check;
    p.check = function (resp) {
      resp = resp || []; var v = tfRead(resp[0]);
      if (v != null && v !== truth) {
        var restOk = checkers.every(function (c, i) { return c(resp[i + 1] == null ? '' : resp[i + 1]).v === 'correct'; });
        return restOk ? wrong('u3t-tf-only', '<b>True or false?:</b> Your working is right, but it shows the statement is <b>' + (truth ? 'true' : 'false') + '</b>.') : wrong('u3t-tf', '<b>True or false?:</b> Check your working, then decide again.');
      }
      return base(resp);
    };
    p.bad = (bad || []).concat([[truth ? 'false' : 'true'].concat(keys)]);
    return p;
  }

  /* ---------- area models ---------- */
  function grid(top, side, opt) {
    opt = opt || {};
    var L = function (p, i) { return opt.plus ? lab(p, i) : tx(p); };
    var wd = function (p) { return PL.degree(p) > 0 ? 2 : 1.2; };
    var cells = side.map(function (s, j) { return top.map(function (q, i) { if (opt.cells) return opt.cells[j][i]; return opt.blank ? '' : tx(mul(q, s)); }); });
    return HW.areaModel(opt.topLabels || top.map(L), opt.sideLabels || side.map(L), cells, { widths: opt.widths || top.map(wd), heights: opt.heights || side.map(wd), max: opt.max || 300 });
  }
  /* the area box (js/draw2.js areabox) the student fills: cols = terms along the top, rows = terms down the side;
     o.give = { rows: [i…], cols: [j…], cells: [[i, j]…] } the entries shown (default: every side term, no boxes) */
  function readT(s) { var a = ex.parse(String(s == null ? '' : s).replace(/\\left|\\right/g, '')); if (!a.ok) return null; var q = PL.read(a.ast); return q.ok ? q.p : null; }
  function boxPart(prompt, cols, rows, o) {
    o = o || {};
    var give = o.give || { rows: rows.map(function (q, i) { return i; }), cols: cols.map(function (q, j) { return j; }), cells: [] };
    var has = function (list, v) { return (list || []).some(function (x) { return Array.isArray(x) ? x[0] === v[0] && x[1] === v[1] : x === v; }); };
    var Rt = rows.map(tx), Ct = cols.map(tx), Mp = rows.map(function (a) { return cols.map(function (b) { return mul(a, b); }); }), Mt = Mp.map(function (rw) { return rw.map(tx); });
    var vs = o.vars || PL.vars(sumOf(rows.concat(cols))); if (!vs.length && !o.numeric) vs = ['x'];
    var inp = { rows: Rt.map(function (s, i) { return has(give.rows, i) ? s : null; }), cols: Ct.map(function (s, j) { return has(give.cols, j) ? s : null; }),
      cells: Mt.map(function (rw, i) { return rw.map(function (s, j) { return has(give.cells, [i, j]) ? s : null; }); }), keys: 'poly', vars: vs };
    var hidHead = inp.rows.some(function (x) { return x == null; }) || inp.cols.some(function (x) { return x == null; });
    if (o.numeric) inp.help = 'Tap a box, then type its number. Each box is its row number × its column number.';
    if (hidHead) inp.help = 'Tap a box, then type its term. Each box is (row term) × (column term): a missing side term is a box divided by the side term you know.';
    var key = { rows: Rt.slice(), cols: Ct.slice(), cells: Mt.map(function (rw) { return rw.slice(); }) };
    var list = [];
    rows.forEach(function (a, i) { cols.forEach(function (b, j) { list.push(t(dot(b, a) + '=' + (o.numeric ? F(PL.constant(Mp[i][j])[0]) : Mt[i][j]))); }); });
    var sol = o.sol || (grid(cols, rows, o.gridOpt || {}) + 'Each box is (column term) × (row term): ' + list.join(', &nbsp;') + '.');
    var p = KP.areabox(prompt, inp, {}, key, sol, o.hints || ['Each box is the term at the top of its column times the term at the start of its row — sign included.', 'Multiply the coefficients and add the exponents of matching letters: ' + t('x\\cdot x=x^{2}') + '.'], o.text || 'area box');
    var base = p.check;
    p.check = function (resp) {
      resp = resp || {};
      var res = base(resp); if (res.v !== 'wrong' || res.code === 'ab-one-term') return res;
      if (hidHead) {
        var R = (resp.rows || []).map(readT), C = (resp.cols || []).map(readT);
        for (var i = 0; i < rows.length; i++) for (var j = 0; j < cols.length; j++) {
          if (!has(give.cells, [i, j]) || !R[i] || !C[j]) continue;
          var pr = mul(R[i], C[j]); if (PL.eq(pr, Mp[i][j])) continue;
          var which = !has(give.rows, i) && !has(give.cols, j) ? 'row ' + (i + 1) + ' or column ' + (j + 1) : !has(give.rows, i) ? 'row ' + (i + 1) : 'column ' + (j + 1);
          if (PL.eq(pr, neg(Mp[i][j]))) return wrong('ab-sign', 'Check the sign of the side term in ' + which + ': ' + t(pf(R[i]) + '\\cdot ' + pf(C[j]) + '=' + tx(pr)) + ', but that box is ' + t(Mt[i][j]) + '.');
          return wrong('ab-side', 'Check the side term in ' + which + ': ' + t(pf(R[i]) + '\\cdot ' + pf(C[j]) + '=' + tx(pr)) + ', but that box is ' + t(Mt[i][j]) + '. A missing side = (box) ÷ (the side you know): divide the coefficients and subtract the exponents.');
        }
      }
      if (o.numeric) for (var a = 0; a < rows.length; a++) for (var b = 0; b < cols.length; b++) {
        var got = Number(String(((resp.cells || [])[a] || [])[b] || '').replace(/\\,|[\s,]/g, '')), want = PL.constant(Mp[a][b])[0];
        if (got === want) continue;
        if (got > 0 && want % got === 0 && /^10+$/.test(String(want / got))) return wrong('ab-zeros', 'Check the box in row ' + (a + 1) + ', column ' + (b + 1) + ': ' + t(Rt[a] + '\\times ' + Ct[b]) + ' — these are tens, so keep the zeros (' + t('30\\times 20=600') + ', not ' + t('6') + ').');
        return res;
      }
      return res;
    };
    var bads = [], copy = function () { return { rows: Rt.slice(), cols: Ct.slice(), cells: Mt.map(function (rw) { return rw.slice(); }) }; };
    var cellsAll = []; rows.forEach(function (a, i) { cols.forEach(function (b, j) { cellsAll.push([i, j]); }); });
    var free = cellsAll.filter(function (c) { return !has(give.cells, c); });
    var negC = free.filter(function (c) { return coefOf(Mp[c[0]][c[1]]) < 0; })[0] || free[0];
    if (negC && !(o.numeric && coefOf(Mp[negC[0]][negC[1]]) > 0)) { var b1 = copy(); b1.cells[negC[0]][negC[1]] = tx(neg(Mp[negC[0]][negC[1]])); bads.push(b1); }
    free.some(function (c) {
      var a = rows[c[0]], b = cols[c[1]], s = add(a, b);
      if (o.numeric) { var b3 = copy(); b3.cells[c[0]][c[1]] = tx(s); bads.push(b3); var w = PL.constant(Mp[c[0]][c[1]])[0], z = String(w).replace(/0+$/, ''); if (z !== String(w)) { var b4 = copy(); b4.cells[c[0]][c[1]] = z; bads.push(b4); } return true; }
      var ta = PL.terms(a)[0], tb = PL.terms(b)[0]; if (!ta || !tb) return false;
      var sh = Object.keys(ta.v).filter(function (k) { return ta.v[k] && tb.v[k]; }); if (!sh.length) return false;
      var v = {}; Object.keys(ta.v).concat(Object.keys(tb.v)).forEach(function (k) { v[k] = Math.max(ta.v[k] || 0, tb.v[k] || 0); });
      var b2 = copy(); b2.cells[c[0]][c[1]] = tx(M([ta.c[0] * tb.c[0], ta.c[1] * tb.c[1]], v)); bads.push(b2); return true;
    });
    inp.rows.forEach(function (x, i) { if (x == null) { var b5 = copy(); b5.rows[i] = tx(neg(rows[i])); bads.push(b5); } });
    inp.cols.forEach(function (x, j) { if (x == null) { var b6 = copy(); b6.cols[j] = tx(mul(cols[j], N(2))); bads.push(b6); } });
    p.bad = bads;
    return p;
  }

  /* ---------- figures (inline SVG) ---------- */
  function svgBox(w, h, body, label, maxW) {
    return '<div style="margin:.4em 0 .2em"><svg viewBox="0 0 ' + w + ' ' + h + '" width="100%" style="max-width:' + (maxW || w) + 'px;display:block" role="img" aria-label="' + HW.esc(label) + '" fill="none" stroke="currentColor" stroke-width="1.5" font-size="16" font-family="KaTeX_Main,\'Times New Roman\',serif">' + body + '</svg></div>';
  }
  function txt(x, y, s, o) { o = o || {}; return '<text x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" fill="currentColor" stroke="none" text-anchor="' + (o.anchor || 'middle') + '" dominant-baseline="central"' + (o.size ? ' font-size="' + o.size + '"' : '') + '>' + s + '</text>'; }
  /* plain SVG label: italic letters, superscript digits, real minus signs */
  function svgLab(p) {
    var s = typeof p === 'string' ? p : tx(p), out = '';
    s = s.replace(/\^\{(\d+)\}/g, function (m, d) { return d.split('').map(function (c) { return '⁰¹²³⁴⁵⁶⁷⁸⁹'.charAt(+c); }).join(''); });
    for (var i = 0; i < s.length; i++) {
      var ch = s.charAt(i);
      if (/[a-z]/.test(ch)) out += '<tspan font-style="italic">' + ch + '</tspan>';
      else if (ch === '+') out += ' + ';
      else if (ch === '-') out += i === 0 ? '−' : ' − ';
      else out += ch;
    }
    return out;
  }
  var TPOS = '#9aa3ad', TNEG = '#ffffff', TSTK = '#2b3340', TU = 12, TX = 44;
  function tileRect(x, y, w, h, negT) { return '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + w + '" height="' + h + '" rx="1.5" fill="' + (negT ? TNEG : TPOS) + '" stroke="' + TSTK + '" stroke-width="1.3"/>'; }
  /* Q2: m columns, each an x²-tile above k x-tiles (white when negative) */
  function tileColumnsSvg(m, k, negX) {
    var gapC = 14, gapR = 3, colW = TX, H = TX + k * (TU + gapR) + 6, W = m * colW + (m - 1) * gapC + 6, s = '';
    for (var i = 0; i < m; i++) {
      var x = 3 + i * (colW + gapC);
      s += tileRect(x, 3, TX, TX, false);
      for (var j = 0; j < k; j++) s += tileRect(x, 3 + TX + gapR + j * (TU + gapR), TX, TU, negX);
    }
    return '<div style="margin:.4em 0"><svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" style="max-width:' + Math.round(W * 1.7) + 'px;display:block" role="img" aria-label="' + m + ' columns of algebra tiles, each an x squared tile above ' + k + ' x tiles">' + s + '</svg></div>';
  }
  /* Q6: a rectangle of positive tiles; colsW / rowsH are tile sizes (TX or TU) */
  function tileRectSvg(colsW, rowsH) {
    var g = 1.5, W = colsW.reduce(function (a, b) { return a + b + g; }, 0) + 4, H = rowsH.reduce(function (a, b) { return a + b + g; }, 0) + 4, s = '', y = 2;
    rowsH.forEach(function (h) { var x = 2; colsW.forEach(function (w) { s += tileRect(x, y, w, h, false); x += w + g; }); y += h + g; });
    return '<div style="margin:.4em 0"><svg viewBox="0 0 ' + W.toFixed(1) + ' ' + H.toFixed(1) + '" width="100%" style="max-width:' + Math.round(W * 1.7) + 'px;display:block" role="img" aria-label="a rectangle made of algebra tiles">' + s + '</svg></div>';
  }
  function legend() { return HW.tiles && HW.tiles.legend ? HW.tiles.legend() : ''; }
  /* Q18: a rectangle labelled below and on the left */
  function rectSvg(wLab, hLab) {
    var body = '<rect x="90" y="16" width="230" height="96" fill="rgba(110,150,200,0.18)" stroke-width="2"/>' + txt(205, 132, svgLab(wLab)) + txt(82, 64, svgLab(hLab), { anchor: 'end' });
    return svgBox(360, 146, body, 'a rectangle ' + wLab + ' long and ' + hLab + ' wide', 360);
  }
  /* Q20: a rectangular prism: front width, height, depth */
  function prismSvg(wLab, hLab, dLab) {
    var x0 = 90, y0 = 130, w = 190, h = 92, dx = 62, dy = -38, P = function (x, y) { return x.toFixed(1) + ',' + y.toFixed(1); };
    var body = '<polygon points="' + P(x0, y0) + ' ' + P(x0 + w, y0) + ' ' + P(x0 + w, y0 - h) + ' ' + P(x0, y0 - h) + '" fill="rgba(110,150,200,0.18)" stroke-width="2"/>' +
      '<polygon points="' + P(x0, y0 - h) + ' ' + P(x0 + dx, y0 - h + dy) + ' ' + P(x0 + w + dx, y0 - h + dy) + ' ' + P(x0 + w, y0 - h) + '" fill="rgba(110,150,200,0.28)" stroke-width="2"/>' +
      '<polygon points="' + P(x0 + w, y0) + ' ' + P(x0 + w + dx, y0 + dy) + ' ' + P(x0 + w + dx, y0 - h + dy) + ' ' + P(x0 + w, y0 - h) + '" fill="rgba(110,150,200,0.36)" stroke-width="2"/>' +
      '<path d="M' + P(x0, y0) + ' L' + P(x0 + dx, y0 + dy) + ' L' + P(x0 + w + dx, y0 + dy) + ' M' + P(x0 + dx, y0 + dy) + ' L' + P(x0 + dx, y0 - h + dy) + '" stroke-dasharray="5 4" stroke-width="1.2"/>' +
      txt(x0 + w / 2, y0 + 18, svgLab(wLab)) + txt(x0 - 8, y0 - h / 2, svgLab(hLab), { anchor: 'end' }) + txt(x0 + w + dx / 2 + 10, y0 + dy / 2 + 10, svgLab(dLab), { anchor: 'start' });
    return svgBox(400, 160, body, 'a rectangular prism with edges ' + wLab + ', ' + hLab + ' and ' + dLab, 400);
  }
  /* Q21: a rectangle with a square removed (shaded = what is left) */
  function holeSvg(topLab, leftLab, holeLab) {
    var body = '<path d="M90 30 H330 V176 H90 Z M178 74 V140 H244 V74 Z" fill="rgba(110,150,200,0.32)" fill-rule="evenodd" stroke-width="2"/>' +
      txt(210, 16, svgLab(topLab)) + txt(82, 103, svgLab(leftLab), { anchor: 'end' }) + txt(211, 156, svgLab(holeLab), { size: 14 });
    return svgBox(360, 190, body, 'a rectangle ' + topLab + ' by ' + leftLab + ' with a square of side ' + holeLab + ' removed', 360);
  }
  /* Q22: a sheet with a square cut from each corner, dashed fold lines */
  function netSvg(L, Wd) {
    var S = Math.min(240 / L, 150 / Wd), c = Math.min(L, Wd) * S / 5.5, x0 = 40, y0 = 30, w = L * S, h = Wd * S, P = function (x, y) { return (x0 + x).toFixed(1) + ',' + (y0 + y).toFixed(1); };
    var pts = [[c, 0], [w - c, 0], [w - c, c], [w, c], [w, h - c], [w - c, h - c], [w - c, h], [c, h], [c, h - c], [0, h - c], [0, c], [c, c]];
    var body = '<polygon points="' + pts.map(function (p) { return P(p[0], p[1]); }).join(' ') + '" fill="rgba(110,150,200,0.18)" stroke-width="2"/>' +
      '<rect x="' + (x0 + c).toFixed(1) + '" y="' + (y0 + c).toFixed(1) + '" width="' + (w - 2 * c).toFixed(1) + '" height="' + (h - 2 * c).toFixed(1) + '" stroke-dasharray="6 4" stroke-width="1.2"/>' +
      [[0, 0], [w - c, 0], [0, h - c], [w - c, h - c]].map(function (q) { return '<rect x="' + (x0 + q[0]).toFixed(1) + '" y="' + (y0 + q[1]).toFixed(1) + '" width="' + c.toFixed(1) + '" height="' + c.toFixed(1) + '" stroke-dasharray="2 3" stroke-width="1"/>'; }).join('') +
      txt(x0 + c / 2, y0 + c / 2, '<tspan font-style="italic">x</tspan>', { size: 13 }) + txt(x0 + w / 2, y0 - 14, L + ' cm') + txt(x0 + w + 8, y0 + h / 2, Wd + ' cm', { anchor: 'start' });
    return svgBox(Math.ceil(x0 + w + 70), Math.ceil(y0 + h + 14), body, 'a ' + L + ' cm by ' + Wd + ' cm sheet with an x by x square cut from each corner', Math.ceil(x0 + w + 70));
  }
  /* Q23: two students' work side by side */
  function workTable(n1, n2, lines1, lines2) {
    var col = function (lines) { return lines.map(function (l, i) { return (i ? t('=' + l) : t(l)); }).join('<br>'); };
    return '<table class="u3t-work" style="border-collapse:collapse;margin:.5em 0"><tr><th style="border:1px solid currentColor;padding:.3em .8em;text-align:left">' + n1 + '</th><th style="border:1px solid currentColor;padding:.3em .8em;text-align:left">' + n2 + '</th></tr>' +
      '<tr><td style="border:1px solid currentColor;padding:.4em .8em;vertical-align:top">' + col(lines1) + '</td><td style="border:1px solid currentColor;padding:.4em .8em;vertical-align:top">' + col(lines2) + '</td></tr></table>';
  }

  /* ======================= question makers ======================= */
  /* Q2: tile columns → m·x(x ∓ k) */
  function q2Shared(r) { return { m: r.int(2, 4), k: r.int(1, 4), neg: r.chance(0.8) }; }
  /* Q6: tile rectangle (a x + b)(x + d) */
  function q6Shared(r) { return { a: r.int(2, 3), b: r.int(1, 3), d: r.int(1, 3), flip: r.chance(0.5) }; }
  /* Q7: (p x + q)(r x + s) with some side terms hidden */
  function q7Shared(r) {
    return find(function () { return { p: r.int(2, 5), q: nz(r, 1, 6), rr: r.int(1, 4), s: nz(r, 1, 6) }; }, function (v) { return v.p * v.s + v.q * v.rr !== 0 && v.p !== v.rr; }, { p: 3, q: 4, rr: 2, s: -5 });
  }
  /* Q23: k(p x − q)², two students, two different errors */
  var ERR = {
    pre: 'multiplied the number in front into the bracket <b>before</b> squaring',
    nomid: 'squared each term separately: no middle term, and the last term positive',
    once: 'kept a middle term but did not <b>double</b> it',
    dos: 'made the last term <b>negative</b>, like a difference of squares'
  };
  var NAMES = [['Jordan', 'Maya'], ['Ravi', 'Tess'], ['Owen', 'Lina'], ['Sam', 'Priya'], ['Leah', 'Marco'], ['Aiden', 'Noor']];
  function q23Shared(r) {
    var v = find(function () { return { k: r.int(2, 3), p: r.int(2, 5), q: r.int(1, 5) }; }, function (v) { return v.p !== v.q; }, { k: 2, p: 3, q: 4 });
    var pair = r.pick([['pre', 'nomid'], ['once', 'pre'], ['pre', 'dos'], ['nomid', 'once'], ['dos', 'once'], ['pre', 'once'], ['nomid', 'pre']]);
    v.e = r.chance(0.5) ? pair : [pair[1], pair[0]]; v.names = r.pick(NAMES);
    return v;
  }
  function q23Work(s, e) {
    var k = s.k, A = xm(s.p), B = N(-s.q), A2 = mul(A, A), B2 = mul(B, B), AB = mul(A, B), start = k + '(' + tx(add(A, B)) + ')^{2}';
    if (e === 'pre') { var kb = mul(N(k), add(A, B)); return { lines: [start, '(' + tx(kb) + ')^{2}', tx(mul(kb, kb))], res: mul(kb, kb) }; }
    var inner = e === 'nomid' ? add(A2, B2) : e === 'once' ? add(A2, AB, B2) : sub(A2, B2);
    return { lines: [start, k + '(' + tx(inner) + ')', tx(mul(N(k), inner))], res: mul(N(k), inner) };
  }

  HW.defineTest({
    id: 'u3test', unit: 3, title: 'Unit 3 Test', outcome: 'AN4', calc: false,
    blurb: 'The Unit 3 outcomes-based test on AN4 (multiplying polynomials): monomial and binomial products with algebra tiles and area models, binomial × trinomial, squares of binomials and three binomials, and area, volume and number applications — at the BEG, PRG and MAS levels.',
    questions: [
      /* ======================= AN4 · Part 1: monomial and binomial products ======================= */
      { num: '1', outcome: 'AN4', stem: 'Expand.', parts: [
        { id: '1a', outcome: 'AN4', level: 'BEG', make: function (r) {
          var c = r.int(2, 6), a = r.int(2, 5), b = r.chance(0.7) ? -r.int(2, 6) : r.int(2, 6), terms = [xm(a), N(b)], T = mul(N(c), sumOf(terms));
          return pp(t(c + br(terms)), T, monoWrongs(N(c), terms).concat([{ is: add(xm(c * a), N(c + b)), code: 'add-coef', hint: 'Multiply ' + t(c) + ' by the constant term too: ' + t(c + '\\cdot ' + cnum(b) + '=' + c * b) + '.' }]),
            'Multiply ' + t(c) + ' by each term: ' + t(c + '(' + tx(xm(a)) + ')+' + c + '(' + b + ')=' + tx(T)),
            ['Multiply ' + t(c) + ' by <b>each</b> term in the bracket.', 'Watch the sign of the constant term.'], 'expand ' + c + br(terms));
        } },
        { id: '1b', outcome: 'AN4', level: 'BEG', make: function (r) {
          var m = xm(-r.int(2, 5)), n = nz(r, 2, 7), terms = [xm(1), N(n)], T = mul(m, sumOf(terms));
          return pp(t(tx(m) + br(terms)), T, monoWrongs(m, terms),
            'Multiply ' + t(tx(m)) + ' by each term: ' + t(pf(m) + '(x)' + '+' + pf(m) + '(' + n + ')=' + seq(terms.map(function (q) { return mul(m, q); }))) + '<br>' + t('x\\cdot x=x^{2}') + ', and the negative multiplies <b>both</b> terms.',
            ['Multiply ' + t(tx(m)) + ' by <b>each</b> term: coefficients multiply, and ' + t('x\\cdot x=x^{2}') + '.', 'A negative times a negative is positive.'], 'expand ' + tx(m) + br(terms));
        } },
        { id: '1c', outcome: 'AN4', level: 'BEG', make: function (r) {
          var p = r.int(2, 5), m = xm(p), q = nz(r, 1, 5), rr = nz(r, 2, 6), terms = [xm(1, 2), xm(q), N(rr)], T = mul(m, sumOf(terms));
          return pp(t(tx(m) + br(terms)), T, monoWrongs(m, terms).concat([{ is: add(xm(p, 2), xm(p * q, 2), xm(p * rr)), code: 'mult-exp', hint: 'When you multiply powers, <b>add</b> the exponents: ' + t('x\\cdot x^{2}=x^{1+2}=x^{3}') + '.' }]),
            'Multiply ' + t(tx(m)) + ' by each term (add the exponents):<br>' + t(terms.map(function (q2, i) { var s = pf(m) + '(' + tx(q2) + ')'; return i ? '+' + s : s; }).join('') + '=' + tx(T)),
            ['Multiply ' + t(tx(m)) + ' by <b>each</b> of the three terms.', 'Add the exponents: ' + t('x\\cdot x^{2}=x^{3}') + '.'], 'expand ' + tx(m) + br(terms));
        } }] },
      { num: '2', outcome: 'AN4', shared: q2Shared,
        stem: function (s) { return 'Each column has one ' + t('x^{2}') + '-tile above ' + ['', 'one', 'two', 'three', 'four'][s.k] + ' ' + t('x') + '-tile' + (s.k > 1 ? 's' : '') + ' (shaded ' + t('=') + ' positive, unshaded ' + t('=') + ' negative).' + legend() + tileColumnsSvg(s.m, s.k, s.neg); },
        parts: [
          { id: '2', outcome: 'AN4', level: 'BEG', make: function (r, s) {
            var mono = xm(s.m), kk = s.neg ? -s.k : s.k, bin = lin(1, kk), T = mul(mono, bin), flip = mul(mono, lin(1, -kk));
            var wp = { is: flip, code: 'white-pos', hint: s.neg ? 'The ' + t('x') + '-tiles are <b>white</b>, so they are negative: each column is ' + t('x-' + s.k) + ' tall.' : 'The ' + t('x') + '-tiles are <b>shaded</b>, so they are positive.' };
            var key0 = tx(mono) + bp(bin);
            var p = KP.fields('Write the multiplication shown, and the product.', [pbox('Multiplication:', null, { placeholder: 'write it as a product' }), pbox('Product:')],
              [factorsChk(T, [bin], { wrong: [wp], example: key0, hint: 'Each column is ' + t('x') + ' wide; how tall is it, and how many columns are there?', dimsHint: 'That multiplies out to the right product, but it isn’t the rectangle’s length and width. There are ' + t(s.m) + ' columns, each ' + t('x') + ' wide, so one side is ' + t(tx(mono)) + '; read the other side from one column.' }),
                polyChk(T, [wp, { is: add(xm(s.m, 2), xm(kk)), code: 'first-only', hint: 'Every one of the ' + t(s.m) + ' columns has ' + t(s.k) + ' ' + t('x') + '-tiles: count them all.' }])],
              [key0, tx(T)], t(key0 + '=' + tx(T)),
              'There are ' + t(s.m) + ' columns, each ' + t('x') + ' wide: one side is ' + t(tx(mono)) + '. Each column is an ' + t('x^{2}') + '-tile (height ' + t('x') + ') and ' + t(s.k) + ' ' + (s.neg ? 'white (negative)' : 'shaded') + ' ' + t('x') + '-tiles, so the other side is ' + t(tx(bin)) + '.<br>' + t(key0 + '=' + tx(T)) + ' (' + t(s.m) + ' ' + t('x^{2}') + '-tiles and ' + t(s.m * s.k) + ' ' + (s.neg ? 'negative' : 'positive') + ' ' + t('x') + '-tiles).',
              ['One side is the width of all the columns together; the other is the height of one column.', 'Unshaded tiles are negative.'], 'tile columns ' + key0);
            p.bad = [[tx(flip), tx(flip)], [tx(T), tx(T)], ['x' + bp(lin(s.m, s.m * kk)), tx(T)]];
            return p;
          } }] },
      { num: '3', outcome: 'AN4',
        shared: function (r) { return find(function () { var a = r.int(1, 7), b = r.int(1, 7); return r.chance(0.5) ? { a: a, b: -b } : { a: -a, b: b }; }, function (v) { return Math.abs(v.a) !== Math.abs(v.b); }, { a: 5, b: -2 }); },
        stem: 'Complete the area diagram, then write the product in expanded form.',
        parts: [
          { id: '3a', outcome: 'AN4', level: 'BEG', make: function (r, s) {
            return boxPart('Complete the area diagram for ' + t('(x' + sg(s.a) + ')(x' + sg(s.b) + ')') + ': fill in the area of each box.', [xm(1), N(s.a)], [xm(1), N(s.b)], { text: 'area box (x' + sg(s.a) + ')(x' + sg(s.b) + ')' });
          } },
          { id: '3b', outcome: 'AN4', level: 'BEG', make: function (r, s) {
            var A = xm(1), B = N(s.a), C = xm(1), D = N(s.b), f = foil(A, B, C, D);
            return pp('Write ' + t('(x' + sg(s.a) + ')(x' + sg(s.b) + ')') + ' in expanded form.', f.res, binWrongs(A, B, C, D),
              grid([A, B], [C, D]) + 'Add the four boxes and collect the ' + t('x') + '-terms: ' + t(seq([f.F, f.O, f.I, f.L]) + '=' + tx(f.res)), ['Add the four areas from your diagram.', 'Collect the two ' + t('x') + '-terms.'], 'expand (x' + sg(s.a) + ')(x' + sg(s.b) + ')', { before: t('(x' + sg(s.a) + ')(x' + sg(s.b) + ')=') });
          } }] },
      { num: '4', outcome: 'AN4', stem: 'Expand and simplify.', parts: [
        { id: '4a', outcome: 'AN4', level: 'PRG', make: function (r) {
          var v = find(function () { return { a: r.int(2, 5), b: nz(r, 1, 7), c: r.int(2, 5), d: nz(r, 1, 7) }; }, function (v) { return v.a * v.d + v.b * v.c !== 0 && v.a * v.d !== v.b * v.c; }, { a: 3, b: -2, c: 2, d: 5 });
          var A = xm(v.a), B = N(v.b), C = xm(v.c), D = N(v.d), f = foil(A, B, C, D), pr = br([A, B]) + br([C, D]);
          return pp(t(pr), f.res, binWrongs(A, B, C, D), foilSol(A, B, C, D), HB, 'expand ' + pr);
        } },
        { id: '4b', outcome: 'AN4', level: 'PRG', make: function (r) {
          var L = r.pick([['a', 'b'], ['m', 'n'], ['p', 'q'], ['x', 'y']]), u = function (c, i) { var o = {}; o[L[i]] = 1; return M(c, o); };
          var v = find(function () { return { p: r.int(2, 4), q: nz(r, 1, 5), rr: r.int(1, 3), s: nz(r, 1, 5) }; }, function (v) { return v.p * v.s + v.q * v.rr !== 0 && !(v.p === v.rr && v.q === v.s); }, { p: 4, q: -3, rr: 1, s: 2 });
          var A = u(v.p, 0), B = u(v.q, 1), C = u(v.rr, 0), D = u(v.s, 1), f = foil(A, B, C, D), pr = br([A, B]) + br([C, D]);
          return pp(t(pr), f.res, binWrongs(A, B, C, D), foilSol(A, B, C, D), HB, 'expand ' + pr);
        } }] },
      { num: '5', outcome: 'AN4', stem: 'Expand and simplify.', parts: [
        { id: '5', outcome: 'AN4', level: 'PRG', make: function (r) {
          var v = find(function () { return { m: r.int(2, 5), a: r.int(1, 3), b: nz(r, 1, 5), n: r.int(2, 4), c: r.int(1, 3), d: nz(r, 1, 5), e: nz(r, 2, 6) }; },
            function (v) { return v.m * v.a !== v.n * v.c && v.m * v.b !== v.n * v.d; }, { m: 3, a: 2, b: -1, n: 2, c: 1, d: -4, e: 3 });
          var m1 = xm(v.m), t1 = [xm(v.a), N(v.b)], P1 = mul(m1, sumOf(t1)), t2 = [xm(v.c, 2), xm(v.d), N(v.e)], Q = sumOf(t2), P2 = mul(N(v.n), Q), T = sub(P1, P2);
          var ex1 = tx(m1) + br(t1) + '-' + v.n + br(t2);
          var ws = [{ is: subFirstOnly(P1, P2), code: 'sub-first', hint: 'The ' + t('-' + v.n) + ' multiplies <b>every</b> term of ' + t(br(t2)) + ', so every sign in that bracket changes.' },
            { is: add(P1, P2), code: 'minus-ignored', hint: 'The second product is <b>subtracted</b>: multiply by ' + t('-' + v.n) + ', not ' + t('+' + v.n) + '.' },
            { is: sub(P1, add(mul(N(v.n), t2[0]), t2[1], t2[2])), code: 'first-only', hint: 'Multiply <b>every</b> term of ' + t(br(t2)) + ' by ' + t('-' + v.n) + '.' },
            { is: sub(add(mul(m1, t1[0]), t1[1]), P2), code: 'first-only', hint: 'Multiply <b>both</b> terms of ' + t(br(t1)) + ' by ' + t(tx(m1)) + '.' }];
          return pp(t(ex1), T, ws,
            t(tx(m1) + br(t1) + '=' + tx(P1)) + '<br>' + t('-' + v.n + br(t2) + '=' + tx(neg(P2))) + '<br>' + t(seq(termsOf(P1).concat(termsOf(neg(P2)))) + '=' + tx(T)),
            ['Expand each product first. The ' + t('-' + v.n) + ' changes the sign of every term in its bracket.', 'Then collect like terms.'], 'expand ' + ex1);
        } }] },
      { num: '6', outcome: 'AN4', shared: q6Shared,
        stem: function (s) {
          var cw = [], rh = [], i;
          if (!s.flip) { for (i = 0; i < s.a; i++) cw.push(TX); for (i = 0; i < s.b; i++) cw.push(TU); rh.push(TX); for (i = 0; i < s.d; i++) rh.push(TU); }
          else { cw.push(TX); for (i = 0; i < s.d; i++) cw.push(TU); for (i = 0; i < s.a; i++) rh.push(TX); for (i = 0; i < s.b; i++) rh.push(TU); }
          return 'These positive algebra tiles form one rectangle.' + legend() + tileRectSvg(cw, rh);
        },
        parts: [
          { id: '6', outcome: 'AN4', level: 'PRG', make: function (r, s) {
            var F1 = lin(s.a, s.b), F2 = lin(1, s.d), T = mul(F1, F2), L = s.flip ? F2 : F1, W = s.flip ? F1 : F2;
            var sideChk = function (want, other, i) {
              return function (resp) {
                var a = K.read(resp); if (a.res) return a.res; var q = PL.read(a.ast); if (!q.ok) return wrong('value', null);
                if (PL.eq(q.p, want) || PL.eq(q.p, other)) { var fi = PL.formIssue(a.ast); return fi && fi.code !== 'not-poly' ? form(fi.code, fi.msg || 'Simplify it.') : ok(); }
                return wrong('u3t-tile-side', 'Count along that side: each ' + t('x^{2}') + '-tile or long side of an ' + t('x') + '-tile is ' + t('x') + ', each unit tile or short side is ' + t('1') + '.');
              };
            };
            var prodC = polyChk(T, binWrongs(xm(s.a), N(s.b), xm(1), N(s.d)));
            var fields = [pbox('Length (across):'), pbox('Width (down):'), pbox('Product:')];
            var p = KP.fields('Write the rectangle’s length and width, then the multiplication ' + t('(\\text{length})(\\text{width})') + ' as a product in expanded form.', fields, [sideChk(L, W), sideChk(W, L), prodC], [tx(L), tx(W), tx(T)],
              'length ' + t(tx(L)) + ', width ' + t(tx(W)) + '; ' + t(bp(L) + bp(W) + '=' + tx(T)),
              'Across: ' + (s.flip ? 'one ' + t('x^{2}') + '-tile (' + t('x') + ') and ' + s.d + ' short side' + (s.d > 1 ? 's' : '') + ' (' + t(s.d) + ')' : s.a + ' ' + t('x^{2}') + '-tiles (' + t(s.a + 'x') + ') and ' + s.b + ' short side' + (s.b > 1 ? 's' : '') + ' (' + t(s.b) + ')') + ', so the length is ' + t(tx(L)) + '.<br>' +
                'Down: ' + (s.flip ? s.a + ' ' + t('x^{2}') + '-tiles (' + t(s.a + 'x') + ') and ' + s.b + ' unit row' + (s.b > 1 ? 's' : '') + ' (' + t(s.b) + ')' : 'one ' + t('x^{2}') + '-tile (' + t('x') + ') and ' + s.d + ' unit row' + (s.d > 1 ? 's' : '') + ' (' + t(s.d) + ')') + ', so the width is ' + t(tx(W)) + '.<br>' +
                t(bp(L) + bp(W) + '=' + tx(T)) + ' (check: ' + s.a + ' ' + t('x^{2}') + '-tiles, ' + (s.a * s.d + s.b) + ' ' + t('x') + '-tiles, ' + s.b * s.d + ' unit tiles).',
              ['Read each side: an ' + t('x^{2}') + '-tile’s side is ' + t('x') + ', a unit tile’s side is ' + t('1') + '.', 'Count the tiles to check: the product must give the same numbers of ' + t('x^{2}') + '-, ' + t('x') + '- and unit tiles.'], 'tile rectangle ' + tx(T));
            var base = p.check;
            p.check = function (resp) {
              resp = resp || []; var R = [resp[0], resp[1]].map(readT);
              if (R[0] && R[1] && PL.eq(R[0], R[1])) return wrong('u3t-tile-side', '<b>Width (down):</b> the two sides are different: read the other side of the rectangle.');
              return base(resp);
            };
            p.good = [[tx(W), tx(L), tx(T)]];
            p.bad = [[tx(L), tx(L), tx(T)], [tx(lin(s.a, s.b + 1)), tx(W), tx(T)], [tx(L), tx(W), tx(add(mul(xm(s.a), xm(1)), N(s.b * s.d)))]];
            return p;
          } }] },
      { num: '7', outcome: 'AN4', shared: q7Shared,
        stem: function (s) { var R0 = xm(s.p), C0 = xm(s.rr); return 'An area diagram for a product of two binomials has ' + t(tx(C0)) + ' as its first column term, and three of its boxes are ' + t(tx(mul(R0, C0))) + ', ' + t(tx(mul(R0, N(s.s)))) + ' and ' + t(tx(mul(N(s.q), N(s.s)))) + '. Fill in the missing side lengths and area. Then write the multiplication and its product in expanded form.'; },
        parts: [
          { id: '7a', outcome: 'AN4', level: 'MAS', make: function (r, s) {
            var rows = [xm(s.p), N(s.q)], cols = [xm(s.rr), N(s.s)], f = mul(rows[0], cols[0]), g = mul(rows[0], cols[1]), h = mul(rows[1], cols[1]);
            return boxPart('Fill in the missing side lengths (the two terms down the side and the second term along the top) and the missing area.', cols, rows,
              { give: { rows: [], cols: [0], cells: [[0, 0], [0, 1], [1, 1]] }, text: 'area box backwards (' + tx(add(rows[0], rows[1])) + ')(' + tx(add(cols[0], cols[1])) + ')',
                sol: grid(cols, rows, { plus: true }) + 'Row 1: ' + t(tx(f) + '\\div ' + pf(cols[0]) + '=' + tx(rows[0])) + '. Column 2: ' + t(pf(g) + '\\div ' + pf(rows[0]) + '=' + tx(cols[1])) + '. Row 2: ' + t(pf(h) + '\\div ' + pf(cols[1]) + '=' + tx(rows[1])) + '. Missing area: ' + t(pf(rows[1]) + '\\cdot ' + pf(cols[0]) + '=' + tx(mul(rows[1], cols[0]))) + '.',
                hints: ['Start with the top-left box: ' + t(tx(f)) + ' divided by the column term ' + t(tx(cols[0])) + ' gives the first row term.', 'Then use that row term to find the second column term, and so on. Signs count.'] });
          } },
          { id: '7b', outcome: 'AN4', level: 'MAS', make: function (r, s) {
            var A = xm(s.p), B = N(s.q), C = xm(s.rr), D = N(s.s), F1 = add(A, B), F2 = add(C, D), T = mul(F1, F2), key0 = bp(F1) + bp(F2);
            var p = KP.fields('Write the multiplication the diagram shows, and its product in expanded form.', [pbox('Multiplication:', null, { placeholder: 'write it as a product' }), pbox('Product:')],
              [factorsChk(T, [F1, F2], { example: '(2x+1)(x-3)', hint: 'Use the side terms you found: (row terms) times (column terms).', dimsCode: 'u3t-factors', dimsHint: 'That multiplies out to the right product, but use the diagram’s own side lengths: ' + t('(\\text{row terms})(\\text{column terms})') + '.' }),
                polyChk(T, binWrongs(A, B, C, D))],
              [key0, tx(T)], t(key0 + '=' + tx(T)),
              t(key0 + '=' + seq([mul(A, C), mul(A, D), mul(B, C), mul(B, D)]) + '=' + tx(T)), ['The multiplication is (sum of the row terms) times (sum of the column terms).', 'The product is the sum of the four boxes.'], 'multiplication ' + key0);
            p.bad = [[key0, tx(add(mul(A, C), mul(B, D)))], [tx(T), tx(T)]];
            p.good = [[bp(F2) + bp(F1), tx(T)]];
            return p;
          } }] },
      { num: '8', outcome: 'AN4', stem: 'Work backwards from the product.', parts: [
        { id: '8', outcome: 'AN4', level: 'MAS', make: function (r) {
          var v = find(function () { return { p: r.int(2, 4), q: nz(r, 1, 5), a: nz(r, 1, 7) }; }, function (v) { var b = v.p * v.q + v.a; return b !== 0 && Math.abs(v.a * v.q) >= 4 && Math.abs(v.a * v.q) <= 40 && Math.abs(v.a) !== Math.abs(v.q); }, { p: 2, q: -3, a: 4 });
          var p = v.p, q = v.q, a = v.a, c = a * q, b = p * q + a, lhs = '(' + p + 'x+a)(x' + sg(q) + ')', rhs = p + 'x^{2}+bx' + sg(c);
          var aAlts = altVals(a, [{ v: -a, code: 'u3t-a-sign', hint: 'Check the sign: ' + t('a\\times' + cnum(q) + '=' + c) + '.' }, { v: c - q, code: 'u3t-a-sign', hint: 'The constant term is a <b>product</b>: ' + t('a\\times' + cnum(q) + '=' + c) + ', so divide.' }]);
          var bAlts = altVals(b, [{ v: a + q, code: 'u3t-b-coef', hint: 'The outside product is ' + t(p + 'x\\cdot' + cnum(q) + '=' + p * q + 'x') + ': include the ' + t(p) + '.' }, { v: p * q, code: 'u3t-b-one', hint: t('b') + ' is the sum of <b>both</b> middle products: the outside ' + t(p * q + 'x') + ' and the inside ' + t('a\\cdot x') + '.' }, { v: a, code: 'u3t-b-one', hint: t('b') + ' is the sum of <b>both</b> middle products: the outside ' + t(p + 'x\\cdot' + cnum(q)) + ' and the inside ' + t('a\\cdot x') + '.' }, { v: p * q - a, code: 'u3t-b-sign', hint: 'Check the sign of the inside product, ' + t('a\\cdot x') + ', with ' + t('a=' + a) + '.' }]);
          var P0 = KP.fields('Find ' + t('a') + ' and ' + t('b') + ' so that ' + t(lhs + '=' + rhs) + ' for every value of ' + t('x') + '.', [nbox(t('a=')), nbox(t('b='))], [numChk(a, aAlts), numChk(b, bAlts)], [String(a), String(b)], t('a=' + a) + ', ' + t('b=' + b),
            'Constant terms: ' + t('a\\times' + cnum(q) + '=' + c) + ', so ' + t('a=' + a) + '.<br>Then ' + t('(' + p + 'x' + sg(a) + ')(x' + sg(q) + ')=' + seq([xm(p, 2), xm(p * q), xm(a), N(c)]) + '=' + tx(add(xm(p, 2), xm(b), N(c)))) + ', so ' + t('b=' + b) + '. (' + t('b') + ' is the sum of the outside and inside products: ' + t(seq([xm(p * q), xm(a)])) + '.)',
            ['Match the constant terms first: the last terms of the brackets multiply to ' + t(c) + '.', 'Then expand with your ' + t('a') + ' and read off the ' + t('x') + '-coefficient.'], 'find a and b: ' + lhs + '=' + rhs);
          P0.bad = aAlts.map(function (x) { return [String(x.v), String(b)]; }).concat(bAlts.map(function (x) { return [String(a), String(x.v)]; }));
          return P0;
        } }] },
      { num: '9', outcome: 'AN4', stem: 'Write <b>two different</b> products, each a monomial times a binomial.', parts: [
        { id: '9', outcome: 'AN4', level: 'MAS', make: function (r) {
          var v = find(function () { return { G: r.pick([4, 5, 6, 8, 10]), u: r.int(2, 4), w: nz(r, 1, 5) }; }, function (v) { return ex.gcd(v.u, Math.abs(v.w)) === 1 && v.G * v.u <= 40 && v.G * Math.abs(v.w) <= 50; }, { G: 6, u: 2, w: -3 });
          var T = add(xm(v.G * v.u, 2), xm(v.G * v.w)), Ttex = tx(T);
          var one = function (resp) {
            var f = readFactors(resp); if (f.res) return f.res; if (f.bad) return wrong('u3t-prod-value', 'That can’t be read as a product.');
            if (!PL.eq(f.val, T)) return wrong('u3t-prod-value', 'That expands to ' + t(tx(f.val)) + ', not ' + t(Ttex) + '.');
            if (f.sum || f.multi.length !== 1 || PL.count(f.multi[0]) !== 2) return wrong('u3t-not-product', 'Right value — but write it as a <b>monomial times a binomial</b>, like ' + t('3x(\\ldots)') + '.');
            return ok();
          };
          var k1 = tx(xm(v.G)) + bp(lin(v.u, v.w)), k2 = 'x' + bp(lin(v.G * v.u, v.G * v.w)), alt = (v.G % 2 === 0 ? tx(xm(v.G / 2)) + bp(lin(2 * v.u, 2 * v.w)) : tx(xm(-v.G)) + bp(lin(-v.u, -v.w)));
          var p = KP.fields('Write two different products, each a monomial times a binomial, that both expand to ' + t(Ttex) + '.', [pbox('Product 1:', null, { placeholder: 'write it as a product' }), pbox('Product 2:', null, { placeholder: 'write it as a product' })], [one, one], [k1, k2],
            t(k1) + ' and ' + t(k2) + ' (or ' + t(alt) + ', …)',
            'Any monomial that divides both terms works. For example:<br>' + t(k1 + '=' + Ttex) + '<br>' + t(k2 + '=' + Ttex) + '<br>' + t(alt + '=' + Ttex) + '<br>(Each one must expand back to ' + t(Ttex) + '.)',
            ['Take out a common factor of ' + t(tx(xm(v.G * v.u, 2))) + ' and ' + t(tx(xm(v.G * v.w))) + ' — the GCF is one choice, a smaller one gives another.', 'Check each product by expanding it.'], 'two products for ' + Ttex);
          var base = p.check;
          p.check = function (resp) {
            resp = resp || []; var r1 = one(resp[0]), r2 = one(resp[1]);
            if (r1.v === 'correct' && r2.v === 'correct') {
              var f1 = readFactors(resp[0]), f2 = readFactors(resp[1]);
              if (PL.eq(f1.mono, f2.mono)) return wrong('u3t-same-product', '<b>Product 2:</b> that is the same product as Product 1. Use a different monomial factor.');
              return ok();
            }
            if (r1.v === 'correct' && r2.v === 'wrong') return wrong('u3t-one-product', '<b>Product 2:</b> ' + r2.hint);
            if (r2.v === 'correct' && r1.v === 'wrong') return wrong('u3t-one-product', '<b>Product 1:</b> ' + r1.hint);
            return base(resp);
          };
          p.good = [[alt, k1], [k2, k1]];
          p.bad = [[k1, k1], [k1, tx(add(xm(v.G * v.u, 2), xm(v.G * v.w + 1)))], [Ttex, k2], [k1, 'x' + bp(lin(v.G * v.u, v.w))]];
          return p;
        } }] },

      /* ======================= AN4 · Part 2: larger products ======================= */
      { num: '10', outcome: 'AN4', stem: 'Expand. Use the square-of-a-binomial or sum-times-difference pattern.', parts: [
        { id: '10a', outcome: 'AN4', level: 'BEG', make: function (r) {
          var a = r.int(2, 12), v = r.pick(LET), A = xm(1, 1, v), B = N(a), T = mul(add(A, B), add(A, B)), pr = '(' + v + '+' + a + ')^{2}';
          return pp(t(pr), T, sqWrongs(A, B), sqSol(A, B), ['A square of a binomial: ' + t('(a+b)^{2}=a^{2}+2ab+b^{2}') + '.', 'The middle term is <b>twice</b> ' + t(v + '\\cdot ' + a) + '.'], 'expand ' + pr);
        } },
        { id: '10b', outcome: 'AN4', level: 'BEG', make: function (r) {
          var a = r.int(2, 12), v = r.pick(LET), A = xm(1, 1, v), B = N(-a), T = mul(add(A, B), add(A, B)), pr = '(' + v + '-' + a + ')^{2}';
          return pp(t(pr), T, sqWrongs(A, B), sqSol(A, B), ['A square of a binomial: ' + t('(a-b)^{2}=a^{2}-2ab+b^{2}') + '.', 'The last term is ' + t('(-' + a + ')^{2}') + ', which is positive.'], 'expand ' + pr);
        } },
        { id: '10c', outcome: 'AN4', level: 'BEG', make: function (r) {
          var a = r.int(2, 12), v = r.pick(LET), X = xm(1, 1, v), first = r.chance(0.5), pr = first ? '(' + v + '+' + a + ')(' + v + '-' + a + ')' : '(' + v + '-' + a + ')(' + v + '+' + a + ')', T = add(xm(1, 2, v), N(-a * a));
          return pp(t(pr), T, [{ is: add(xm(1, 2, v), N(a * a)), code: 'sd-plus', hint: 'A sum times a difference gives a <b>difference</b> of squares: ' + t('(+' + a + ')(-' + a + ')') + ' is negative.' },
            { is: add(xm(1, 2, v), xm(-2 * a, 1, v), N(-a * a)), code: 'sd-middle', hint: 'The outside and inside products are opposites, so they <b>cancel</b>: there is no middle term.' },
            { is: add(xm(1, 2, v), xm(2 * a, 1, v), N(a * a)), code: 'sd-as-square', hint: 'The brackets are not the same: one is a sum and one a difference. ' + t('(a+b)(a-b)=a^{2}-b^{2}') + '.' }],
            'Sum times difference, ' + t('(a+b)(a-b)=a^{2}-b^{2}') + ':<br>' + t(pr + '=' + seq([xm(1, 2, v), xm(first ? -a : a, 1, v), xm(first ? a : -a, 1, v), N(-a * a)]) + '=' + tx(T)) + ' (the middle terms cancel).',
            ['The outside and inside products cancel.', t('(a+b)(a-b)=a^{2}-b^{2}') + '.'], 'expand ' + pr);
        } }] },
      { num: '11', outcome: 'AN4',
        shared: function (r) { return find(function () { return { a: nz(r, 1, 5), b: nz(r, 1, 5), c: nz(r, 1, 5) }; }, function (v) { return v.a + v.b !== 0 && v.c + v.a * v.b !== 0 && !(v.b === -v.a && v.c === v.a * v.a) && Math.abs(v.c) !== 1; }, { a: 2, b: 3, c: -1 }); },
        stem: function (s) { return 'Complete the grid to multiply ' + t(bp(lin(1, s.a)) + bp(add(xm(1, 2), xm(s.b), N(s.c)))) + '. Then collect like terms.'; },
        parts: [
          { id: '11a', outcome: 'AN4', level: 'BEG', make: function (r, s) {
            return boxPart('Fill in each box of the grid.', [xm(1, 2), xm(s.b), N(s.c)], [xm(1), N(s.a)], { text: 'grid (x' + sg(s.a) + ')(x^2' + sg(s.b) + 'x' + sg(s.c) + ')' });
          } },
          { id: '11b', outcome: 'AN4', level: 'BEG', make: function (r, s) {
            var A = lin(1, s.a), Q = add(xm(1, 2), xm(s.b), N(s.c)), T = mul(A, Q), pr = bp(A) + bp(Q), xp = mul(xm(1), Q), ap = mul(N(s.a), Q);
            return pp('Write ' + t(pr) + ' in expanded form.', T, [{ is: add(xp, N(s.a)), code: 'first-only', hint: 'Both terms of ' + t(bp(A)) + ' multiply every term of the trinomial: the bottom row of the grid is ' + t(tx(ap)) + '.' },
              { is: add(xm(1, 3), N(s.a * s.c)), code: 'fl-only', hint: 'Add <b>all six</b> boxes of the grid, then collect like terms.' }],
              grid([xm(1, 2), xm(s.b), N(s.c)], [xm(1), N(s.a)]) + t(seq(termsOf(xp).concat(termsOf(ap))) + '=' + tx(T)) + '<br>(' + t('x^{2}') + ': ' + t(seq([xm(s.b, 2), xm(s.a, 2)]) + '=' + tx(xm(s.a + s.b, 2))) + '; ' + t('x') + ': ' + t(seq([xm(s.c), xm(s.a * s.b)]) + '=' + tx(xm(s.c + s.a * s.b))) + ')',
              ['Add the six boxes.', 'Collect the ' + t('x^{2}') + '-terms and the ' + t('x') + '-terms.'], 'expand ' + pr, { before: t(pr + '=') });
          } }] },
      { num: '12', outcome: 'AN4', stem: 'Expand and simplify.', parts: [
        { id: '12a', outcome: 'AN4', level: 'PRG', make: function (r) {
          var v = find(function () { return { p: r.int(2, 3), q: nz(r, 1, 5), b: nz(r, 1, 5), c: nz(r, 2, 5) }; }, function (v) { return v.p * v.b + v.q !== 0 && v.p * v.c + v.q * v.b !== 0; }, { p: 2, q: -3, b: -4, c: 5 });
          var A = lin(v.p, v.q), Q = add(xm(1, 2), xm(v.b), N(v.c)), T = mul(A, Q), pr = bp(A) + bp(Q), xp = mul(xm(v.p), Q), qp = mul(N(v.q), Q);
          return pp(t(pr), T, [{ is: add(xp, N(v.q)), code: 'first-only', hint: 'Multiply ' + t(v.q) + ' by every term of the trinomial too.' }, { is: add(xp, neg(qp)), code: 'sign', hint: 'Check the signs of the products with ' + t(v.q) + '.' },
            { is: add(mul(xm(v.p), xm(1, 2)), mul(N(v.q), N(v.c))), code: 'fl-only', hint: 'Every term of the binomial multiplies every term of the trinomial: six products.' }],
            t(pr + '=' + seq(termsOf(xp).concat(termsOf(qp)))) + '<br>' + t('=' + tx(T)), ['Multiply each term of the binomial by each term of the trinomial: six products.', 'Collect like terms.'], 'expand ' + pr);
        } },
        { id: '12b', outcome: 'AN4', level: 'PRG', make: function (r) {
          var L = r.pick([['a', 'b'], ['m', 'n'], ['x', 'y'], ['p', 'q']]), u = function (c, i) { var o = {}; o[L[i]] = 1; return M(c, o); };
          var v = find(function () { return { p: r.int(2, 4), q: r.int(2, 5) }; }, function (v) { return v.p !== v.q; }, { p: 3, q: 2 });
          var A = u(v.p, 0), B = u(-v.q, 1), T = mul(add(A, B), add(A, B)), pr = '(' + tx(add(A, B)) + ')^{2}';
          return pp(t(pr), T, sqWrongs(A, B), sqSol(A, B), ['A square of a binomial: ' + t('(a-b)^{2}=a^{2}-2ab+b^{2}') + '.', 'Square the whole term, coefficient and all: ' + t('(' + tx(A) + ')^{2}=' + tx(mul(A, A))) + '.'], 'expand ' + pr);
        } }] },
      { num: '13', outcome: 'AN4', stem: 'Expand and simplify.', parts: [
        { id: '13', outcome: 'AN4', level: 'PRG', make: function (r) {
          var v = find(function () { return { a: nz(r, 1, 4), b: nz(r, 1, 4), c: r.int(2, 3), d: nz(r, 1, 5) }; }, function (v) {
            if (v.a === v.b || v.a + v.b === 0) return false; var T = mul(lin(1, v.a), lin(1, v.b), lin(v.c, v.d)); return PL.count(T) === 4; }, { a: 2, b: -3, c: 2, d: 1 });
          var B1 = lin(1, v.a), B2 = lin(1, v.b), B3 = lin(v.c, v.d), P12 = mul(B1, B2), T = mul(P12, B3), pr = bp(B1) + bp(B2) + bp(B3);
          return pp(t(pr), T, [{ is: mul(add(xm(1, 2), N(v.a * v.b)), B3), code: 'fl-only', hint: 'Check ' + t(bp(B1) + bp(B2)) + ' first: it has a middle term, ' + t(tx(xm(v.a + v.b))) + '.' },
            { is: add(mul(P12, xm(v.c)), N(v.d)), code: 'first-only', hint: 'Multiply ' + t(v.d) + ' by <b>every</b> term of ' + t(tx(P12)) + '.' }],
            'Multiply two of the factors first: ' + t(bp(B1) + bp(B2) + '=' + tx(P12)) + '.<br>Then the third: ' + t(bp(P12) + bp(B3) + '=' + distTex(P12, B3)),
            ['Multiply two binomials first, then multiply the result by the third.', 'Six products in the second step; collect like terms.'], 'expand ' + pr);
        } }] },
      { num: '14', outcome: 'AN4', stem: 'Expand and simplify.', parts: [
        { id: '14', outcome: 'AN4', level: 'PRG', make: function (r) {
          var v = find(function () { return { p: r.int(2, 3), q: nz(r, 1, 5), rr: nz(r, 1, 5), k: r.int(2, 3), s: nz(r, 2, 5), sw: r.chance(0.35) }; }, function (v) {
            var T = sub(mul(lin(v.p, v.q), lin(1, v.rr)), PL.scale(PL.pow(lin(1, v.s), 2), v.k)); return PL.count(T) === 3 && v.p !== v.k; }, { p: 2, q: 3, rr: -4, k: 3, s: -2, sw: false });
          var F1 = v.sw ? lin(1, v.rr) : lin(v.p, v.q), F2 = v.sw ? lin(v.p, v.q) : lin(1, v.rr), P1 = mul(F1, F2), S = lin(1, v.s), S2 = mul(S, S), K2 = PL.scale(S2, v.k), T = sub(P1, K2);
          var pr = bp(F1) + bp(F2) + '-' + v.k + '(' + tx(S) + ')^{2}';
          var ws = [{ is: sub(P1, PL.scale(sqNoMid(S), v.k)), code: 'no-middle', hint: t('(' + tx(S) + ')^{2}') + ' has a middle term: ' + t('(' + tx(S) + ')^{2}=' + tx(S2)) + '.' },
            { is: subFirstOnly(P1, K2), code: 'minus-first', hint: 'The ' + t('-' + v.k) + ' multiplies <b>every</b> term of ' + t(tx(S2)) + ', so every sign changes.' },
            { is: sub(P1, add(PL.scale(lead(S2), v.k), sub(S2, lead(S2)))), code: 'k-first', hint: 'Multiply <b>every</b> term of ' + t(tx(S2)) + ' by ' + t(v.k) + '.' },
            { is: sub(P1, PL.pow(PL.scale(S, v.k), 2)), code: 'k-in-square', hint: 'Square the bracket <b>first</b>, then multiply by ' + t(v.k) + ' (order of operations).' },
            { is: add(P1, K2), code: 'minus-ignored', hint: 'The squared term is <b>subtracted</b>.' },
            { is: sub(add(mul(lead(F1), lead(F2)), mul(sub(F1, lead(F1)), sub(F2, lead(F2)))), K2), code: 'fl-only', hint: t(bp(F1) + bp(F2)) + ' needs all four products: First, Outside, Inside, Last.' }];
          return pp(t(pr), T, ws,
            t(bp(F1) + bp(F2) + '=' + tx(P1)) + '<br>' + t(v.k + '(' + tx(S) + ')^{2}=' + v.k + bp(S2) + '=' + tx(K2)) + '<br>' + t(seq(termsOf(P1).concat(termsOf(neg(K2)))) + '=' + tx(T)),
            ['Expand the square first, then multiply it by ' + t(v.k) + ', then subtract every term.', 'Collect like terms.'], 'expand ' + pr);
        } }] },
      { num: '15', outcome: 'AN4', stem: 'Match the coefficients.', parts: [
        { id: '15', outcome: 'AN4', level: 'MAS', make: function (r) {
          var v = find(function () { return { a: nz(r, 2, 6), b: nz(r, 1, 9) }; }, function (v) { return v.a * v.a + v.b !== 0; }, { a: -5, b: 6 });
          var a = v.a, b = v.b, C = a * a + b, tri = 'x^{2}' + sg(2 * a) + 'x' + sg(C);
          var aAlts = altVals(a, [{ v: 2 * a, code: 'u3t-a-half', hint: t('(x+a)^{2}=x^{2}+2ax+a^{2}') + ': the ' + t('x') + '-coefficient is ' + t('2a') + ', so ' + t('2a=' + 2 * a) + '.' }, { v: -a, code: 'u3t-a-sign', hint: 'Check the sign: ' + t('2a=' + 2 * a) + '.' }]);
          var bAlts = altVals(b, [{ v: C - a, code: 'u3t-b-nosq', hint: 'The constant of ' + t('(x+a)^{2}') + ' is ' + t('a^{2}') + ': solve ' + t('a^{2}+b=' + C) + '.' }, { v: C + a * a, code: 'u3t-b-plus', hint: t('a^{2}+b=' + C) + ', so ' + t('b=' + C + '-a^{2}') + '.' }, { v: C - 4 * a * a, code: 'u3t-a-half', hint: 'Use ' + t('a') + ', not ' + t('2a') + ': ' + t('a^{2}+b=' + C) + '.' }, { v: C, code: 'u3t-b-nosq', hint: t('(x+a)^{2}') + ' has its own constant term, ' + t('a^{2}') + ': ' + t('a^{2}+b=' + C) + '.' }]);
          var p = KP.fields('The trinomial ' + t(tri) + ' can be written in the form ' + t('(x+a)^{2}+b') + ' for every value of ' + t('x') + '. Expand ' + t('(x+a)^{2}+b') + ' and match the coefficients to find ' + t('a') + ' and ' + t('b') + '.',
            [pbox(t('(x+a)^{2}+b='), ['x', 'a', 'b']), nbox(t('a=')), nbox(t('b='))], [polyChk(add(xm(1, 2), M(2, { a: 1, x: 1 }), M(1, { a: 2 }), M(1, { b: 1 })), [{ is: add(xm(1, 2), M(1, { a: 2 }), M(1, { b: 1 })), code: 'no-middle', hint: t('(x+a)^{2}') + ' has a middle term, ' + t('2ax') + '.' }]), numChk(a, aAlts), numChk(b, bAlts)],
            ['x^{2}+2ax+a^{2}+b', String(a), String(b)], t('a=' + a) + ', ' + t('b=' + b) + ': ' + t(tri + '=(x' + sg(a) + ')^{2}' + sg(b)),
            t('(x+a)^{2}+b=x^{2}+2ax+a^{2}+b') + '<br>Match the ' + t('x') + '-terms: ' + t('2a=' + 2 * a) + ', so ' + t('a=' + a) + '.<br>Match the constants: ' + t('a^{2}+b=' + C) + ', so ' + t(a * a + '+b=' + C) + ', ' + t('b=' + b) + '.<br>' + t(tri + '=(x' + sg(a) + ')^{2}' + sg(b)),
            ['Expand ' + t('(x+a)^{2}') + ' first.', 'The ' + t('x') + '-terms give ' + t('a') + '; the constant terms then give ' + t('b') + '.'], 'complete the square: ' + tri);
          p.good = [['x^2+2ax+a^2+b', String(a), String(b)]];
          p.bad = aAlts.map(function (x) { return ['x^{2}+2ax+a^{2}+b', String(x.v), String(b)]; }).concat(bAlts.map(function (x) { return ['x^{2}+2ax+a^{2}+b', String(a), String(x.v)]; }));
          return p;
        } }] },
      { num: '16', outcome: 'AN4', stem: 'Make a coefficient zero.', parts: [
        { id: '16', outcome: 'AN4', level: 'MAS', make: function (r) {
          var opts = []; [1, 2, 3, 4, 5, 6].forEach(function (m) { opts.push({ c: 1, m: m }, { c: 1, m: -m }); }); [1, 2, 3].forEach(function (m) { opts.push({ c: 2, m: m }, { c: 2, m: -m }); }); [1, 2].forEach(function (m) { opts.push({ c: 3, m: m }, { c: 3, m: -m }); });
          var o = r.pick(opts), c = o.c, m = o.m, k = -m, Q = add(xm(c * c, 2), xm(c * m), N(m * m)), Fk = lin(c, k), T = mul(Fk, Q), first = c === 1 ? 'x+k' : c + 'x+k';
          var kAlts = altVals(k, [{ v: m, code: 'u3t-k-sign', hint: 'The two ' + t('x^{2}') + '-terms, ' + t(tx(xm(c * c * m, 2))) + ' and ' + t((c * c === 1 ? '' : c * c) + 'kx^{2}') + ', cancel only when they are <b>opposites</b>.' }, { v: -c * c * m, code: 'u3t-b-coef', hint: 'The ' + t('k') + ' multiplies ' + t(tx(xm(c * c, 2))) + ', so that ' + t('x^{2}') + '-term is ' + t((c * c === 1 ? '' : c * c) + 'kx^{2}') + '.' }]);
          var p = KP.fields('For what value of ' + t('k') + ' does ' + t('(' + first + ')(' + tx(Q) + ')') + ' expand to have <b>no</b> ' + t('x^{2}') + '-term? Expand it for that ' + t('k') + '. What do you notice?',
            [nbox(t('k=')), pbox('Expansion:'), nbox('Number of terms in the expansion:')],
            [numChk(k, kAlts), polyChk(T, [{ is: add(mul(xm(c), Q), N(k)), code: 'first-only', hint: 'Multiply ' + t(k) + ' by every term of the trinomial too.' }, { is: sub(mul(xm(c), Q), mul(N(k), Q)), code: 'sign', hint: 'Check the signs of the products with ' + t(k) + '.' }]),
              numChk(2, [{ v: 4, code: 'u3t-notice', hint: 'Collect like terms first: the ' + t('x') + '-terms cancel too.' }, { v: 3, code: 'u3t-notice', hint: 'Collect like terms: look at the ' + t('x') + '-terms as well.' }])],
            [String(k), tx(T), '2'], t('k=' + k) + '; ' + t('(' + tx(Fk) + ')(' + tx(Q) + ')=' + tx(T)) + ': the ' + t('x') + '-terms cancel too, leaving only two terms',
            t('(' + first + ')(' + tx(Q) + ')=' + seq([xm(c * c * c, 3), xm(c * c * m, 2), xm(c * m * m)]) + '+k' + bp(Q)) + '<br>' + t('x^{2}') + '-terms: ' + t(c * c * m + '+' + (c * c === 1 ? '' : c * c) + 'k=0') + ', so ' + t('k=' + k) + '.<br>' + t('(' + tx(Fk) + ')(' + tx(Q) + ')=' + distTex(Fk, Q)) + '<br>The ' + t('x') + '-terms cancel too, so only two terms are left (a ' + (k < 0 ? 'difference' : 'sum') + ' of cubes).',
            ['Write the two products that give ' + t('x^{2}') + '-terms; their coefficients must add to ' + t('0') + '.', 'Then expand with that ' + t('k') + ' and collect like terms.'], 'no x^2 term: (' + first + ')(' + tx(Q) + ')');
          p.bad = kAlts.map(function (x) { return [String(x.v), tx(T), '2']; }).concat([[String(k), tx(T), '4'], [String(k), tx(add(T, xm(1))), '2']]);
          return p;
        } }] },
      { num: '17', outcome: 'AN4', stem: '<b>True or false?</b> Justify each answer.', parts: [
        { id: '17a', outcome: 'AN4', level: 'MAS', make: function (r) {
          var a = r.int(2, 12), kind = r.pick(['sq', 'sq', 'yx', 'sd']);
          if (kind === 'yx') {
            var L = r.pick([['x', 'y'], ['a', 'b'], ['m', 'n']]), X = M(1, (function () { var o = {}; o[L[0]] = 1; return o; })()), Y = M(1, (function () { var o = {}; o[L[1]] = 1; return o; })()), S = mul(sub(Y, X), sub(Y, X));
            return tfPart(t('(' + L[1] + '-' + L[0] + ')^{2}=(' + L[0] + '-' + L[1] + ')^{2}') + ' for all ' + t(L[0]) + ' and ' + t(L[1]) + '.', true, [pbox(t('(' + L[1] + '-' + L[0] + ')^{2}='), L), pbox(t('(' + L[0] + '-' + L[1] + ')^{2}='), L)],
              [polyChk(S, sqWrongs(Y, neg(X))), polyChk(S, sqWrongs(X, neg(Y)))], [tx(S), tx(S)], '<b>True</b>: both equal ' + t(tx(S)),
              '<b>True.</b> ' + t('(' + L[1] + '-' + L[0] + ')^{2}=' + tx(S)) + ' and ' + t('(' + L[0] + '-' + L[1] + ')^{2}=' + tx(S)) + '. (' + t(L[1] + '-' + L[0] + '=-(' + L[0] + '-' + L[1] + ')') + ', and squaring removes the sign.)',
              ['Expand both sides.'], 'T/F (y-x)^2=(x-y)^2');
          }
          if (kind === 'sd') {
            var Lh = add(xm(1, 2), N(-a * a)), Rh = add(N(a * a), xm(-1, 2)), pr1 = '(x+' + a + ')(x-' + a + ')', pr2 = '(' + a + '+x)(' + a + '-x)';
            return tfPart(t(pr1 + '=' + pr2) + ' for every value of ' + t('x') + '.', false, [pbox(t(pr1 + '=')), pbox(t(pr2 + '='))],
              [polyChk(Lh, [{ is: add(xm(1, 2), N(a * a)), code: 'sd-plus', hint: t('(+' + a + ')(-' + a + ')') + ' is negative.' }]), polyChk(Rh, [{ is: Lh, code: 'sign', hint: 'Here the ' + t('x^{2}') + '-term comes from ' + t('(x)(-x)') + ', so it is negative.' }])], [tx(Lh), tx(Rh)], '<b>False</b>: ' + t(tx(Lh)) + ' and ' + t(tx(Rh)),
              '<b>False.</b> ' + t(pr1 + '=' + tx(Lh)) + ' but ' + t(pr2 + '=' + tx(Rh)) + '. They are opposites (e.g. at ' + t('x=0') + ': ' + t(-a * a) + ' and ' + t(a * a) + ').',
              ['Expand both sides and compare.'], 'T/F sum-diff swapped');
          }
          var Sq = mul(lin(1, -a), lin(1, -a));
          return tfPart(t('(x-' + a + ')^{2}=(' + a + '-x)^{2}') + ' for every value of ' + t('x') + '.', true, [pbox(t('(x-' + a + ')^{2}=')), pbox(t('(' + a + '-x)^{2}='))],
            [polyChk(Sq, sqWrongs(xm(1), N(-a))), polyChk(Sq, sqWrongs(N(a), xm(-1)))], [tx(Sq), tx(Sq)], '<b>True</b>: both equal ' + t(tx(Sq)),
            '<b>True.</b> ' + t('(x-' + a + ')^{2}=' + tx(Sq)) + ' and ' + t('(' + a + '-x)^{2}=' + seq([N(a * a), xm(-2 * a), xm(1, 2)]) + '=' + tx(Sq)) + '. (' + t(a + '-x=-(x-' + a + ')') + ', and squaring removes the sign.)',
            ['Expand both sides.'], 'T/F (x-a)^2=(a-x)^2');
        } },
        { id: '17b', outcome: 'AN4', level: 'MAS', make: function (r) {
          var p = r.int(1, 3), q = r.int(1, 9), sgn = r.chance(0.5) ? 1 : -1, kind = r.pick(['nomid', 'nomid', 'once', 'sd']);
          if (p === 1 && q === 1) q = r.int(2, 9);
          if (kind === 'sd' && p === 1) p = r.int(2, 3); // (x+a)(x-a) alone is the Beginning question; keep the Mastery claim a step harder
          var A = xm(p), B = N(sgn * q), Sq = mul(add(A, B), add(A, B)), base = '(' + tx(add(A, B)) + ')';
          if (kind === 'sd') {
            var Dd = sub(mul(A, A), mul(B, B)), pr = '(' + tx(add(A, N(q))) + ')(' + tx(add(A, N(-q))) + ')';
            return tfPart(t(pr + '=' + tx(Dd)), true, [pbox('Expand: ' + t(pr + '='))], [polyChk(Dd, [{ is: add(mul(A, A), N(q * q)), code: 'sd-plus', hint: t('(+' + q + ')(-' + q + ')') + ' is negative.' }])], [tx(Dd)], '<b>True</b>: ' + t(pr + '=' + tx(Dd)),
              '<b>True.</b> ' + t(pr + '=' + seq([mul(A, A), mul(A, N(-q)), mul(A, N(q)), N(-q * q)]) + '=' + tx(Dd)) + ': the middle terms cancel.', ['Expand the left side.'], 'T/F sum-diff ' + pr);
          }
          var claimed = kind === 'nomid' ? add(mul(A, A), mul(B, B)) : add(mul(A, A), mul(A, B), mul(B, B));
          return tfPart(t(base + '^{2}=' + tx(claimed)), false, [pbox('Correct expansion: ' + t(base + '^{2}='))], [polyChk(Sq, sqWrongs(A, B))], [tx(Sq)], '<b>False</b>: ' + t(base + '^{2}=' + tx(Sq)),
            '<b>False.</b> ' + t(base + '^{2}=' + tx(Sq)) + (kind === 'nomid' ? '; the middle term ' + t('2(' + tx(A) + ')(' + cnum(sgn * q) + ')=' + tx(PL.scale(mul(A, B), 2))) + ' is missing.' : '; the middle term must be <b>doubled</b>: ' + t('2(' + tx(A) + ')(' + cnum(sgn * q) + ')=' + tx(PL.scale(mul(A, B), 2))) + '.'),
            ['Expand the left side correctly and compare.', t('(a\\pm b)^{2}=a^{2}\\pm 2ab+b^{2}') + '.'], 'T/F ' + base + '^2', [[ 'false', tx(claimed) ]]);
        } },
        { id: '17c', outcome: 'AN4', level: 'MAS', make: function (r) {
          var v = find(function () { return r.sample([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5], 3); }, function (v) { return Math.abs(v[0]) + Math.abs(v[1]) + Math.abs(v[2]) >= 5; }, [1, -2, 4]);
          var K0 = v[0] * v[1] * v[2], truth = r.chance(0.5), claim = truth ? K0 : r.chance(0.6) ? -K0 : v[0] + v[1] + v[2];
          if (claim === K0) truth = true;
          var pr = v.map(function (n) { return '(x' + sg(n) + ')'; }).join('');
          return tfPart('The constant term of ' + t(pr) + ' is ' + t(claim) + '.', truth, [nbox('Constant term of the product:')], [numChk(K0, [{ v: -K0, code: 'sign', hint: 'Multiply the three constants with their signs: ' + t(v.map(cnum).join('\\times ')) + '.' }, { v: v[0] + v[1] + v[2], code: 'add-coef', hint: 'The constant term is the <b>product</b> of the three constants, not their sum.' }])], [String(K0)],
            '<b>' + (truth ? 'True' : 'False') + '</b>: the constant term is ' + t(K0),
            '<b>' + (truth ? 'True' : 'False') + '.</b> The constant term comes only from multiplying the three constant terms: ' + t(v.map(cnum).join('') + '=' + K0) + '.',
            ['Which products give a term with no ' + t('x') + '?'], 'T/F constant term ' + pr);
        } }] },

      /* ======================= AN4 · Part 3: applications ======================= */
      { num: '18', outcome: 'AN4', stem: 'Write the area of the rectangle as a polynomial in expanded form.', parts: [
        { id: '18', outcome: 'AN4', level: 'BEG', make: function (r) {
          var a = r.int(2, 3), b = r.int(1, 6), c = r.int(2, 6), W = lin(a, b), H = lin(1, c), f = foil(xm(a), N(b), xm(1), N(c));
          return pp(rectSvg(W, H) + 'Area of the rectangle:', f.res, binWrongs(xm(a), N(b), xm(1), N(c)).concat([{ is: PL.scale(add(W, H), 2), code: 'perimeter', hint: 'That is the perimeter. The area is length × width.' }]),
            t('A=' + bp(W) + bp(H) + '=' + seq([f.F, f.O, f.I, f.L]) + '=' + tx(f.res)), ['Area = length × width: ' + t(bp(W) + bp(H)) + '.', 'Four products, then collect the ' + t('x') + '-terms.'], 'rectangle area ' + tx(W) + ' by ' + tx(H), { before: t('A=') });
        } }] },
      { num: '19', outcome: 'AN4',
        shared: function (r) { return { a: r.int(2, 7), b: r.int(2, 9), c: r.int(2, 7), d: r.int(2, 9) }; },
        stem: function (s) { return 'Use the area diagram to find ' + t((10 * s.a + s.b) + '\\times ' + (10 * s.c + s.d)) + ' without a calculator.'; },
        parts: [
          { id: '19a', outcome: 'AN4', level: 'BEG', make: function (r, s) {
            var n1 = 10 * s.a + s.b, n2 = 10 * s.c + s.d;
            return boxPart(t(n1 + '=' + 10 * s.a + '+' + s.b) + ' along the top and ' + t(n2 + '=' + 10 * s.c + '+' + s.d) + ' down the side. Fill in the four partial products.', [N(10 * s.a), N(s.b)], [N(10 * s.c), N(s.d)],
              { numeric: true, vars: [], text: n1 + ' x ' + n2 + ' area box', gridOpt: { widths: [2, 1], heights: [2, 1], max: 240 },
                hints: ['Each box is (number at the top of its column) × (number at the start of its row).', 'Tens times tens: ' + t(10 * s.a + '\\times ' + 10 * s.c) + ' is ' + t(s.a + '\\times ' + s.c) + ' with two zeros on the end.'] });
          } },
          { id: '19b', outcome: 'AN4', level: 'BEG', make: function (r, s) {
            var a = s.a, b = s.b, c = s.c, d = s.d, n1 = 10 * a + b, n2 = 10 * c + d, P4 = [100 * a * c, 10 * b * c, 10 * a * d, b * d], tot = n1 * n2;
            var p = KP.number('Add your four partial products to find ' + t(n1 + '\\times ' + n2) + '.', tot, function (v) {
              if (v === P4[0] + P4[3]) return { code: 'fl-total', hint: 'Add <b>all four</b> partial products, not just the two diagonal ones.' };
              if (v === a * c * 100 + (a * d + b * c) + b * d || v === a * c + (a * d + b * c) * 10 + b * d) return { code: 'partial', hint: 'Check the place values of your partial products: tens × tens gives hundreds, tens × ones gives tens.' };
              return null; },
              grid([N(10 * a), N(b)], [N(10 * c), N(d)], { widths: [2, 1], heights: [2, 1], max: 240, cells: [[F(100 * a * c), F(10 * b * c)], [F(10 * a * d), F(b * d)]] }) + t(F(P4[0]) + '+' + F(P4[1]) + '+' + F(P4[2]) + '+' + F(P4[3]) + '=' + F(tot)) + '. (This is ' + t('(' + 10 * a + '+' + b + ')(' + 10 * c + '+' + d + ')') + '.)',
              ['Add the four boxes of your area diagram. Line up the place values.'], n1 + ' x ' + n2 + ' by area model', { before: t(n1 + '\\times ' + n2 + '=') });
            p.bad = [String(P4[0] + P4[3]), String(a * c * 100 + (a * d + b * c) + b * d)].filter(function (x) { return Number(x) !== tot; });
            return p;
          } }] },
      { num: '20', outcome: 'AN4', stem: 'Write the volume of the rectangular prism as a polynomial in expanded form.', parts: [
        { id: '20', outcome: 'AN4', level: 'BEG', make: function (r) {
          var m = r.pick([1, 1, 2]), ab = find(function () { return [r.int(1, 6), r.int(1, 6)]; }, function (v) { return v[0] !== v[1]; }, [3, 4]), A = xm(m), E1 = lin(1, ab[0]), E2 = lin(1, ab[1]), Q = mul(E1, E2), T = mul(A, Q);
          return pp('A rectangular prism has edges ' + t(tx(A)) + ', ' + t(tx(E1)) + ' and ' + t(tx(E2)) + '.' + prismSvg(E2, A, E1) + 'Its volume:', T,
            [{ is: Q, code: 'u3t-two-edges', hint: 'The volume uses <b>all three</b> edges: multiply by ' + t(tx(A)) + ' too.' }, { is: mul(A, add(xm(1, 2), N(ab[0] * ab[1]))), code: 'fl-only', hint: t(bp(E1) + bp(E2)) + ' has a middle term: ' + t(tx(xm(ab[0] + ab[1]))) + '.' }, { is: add(mul(A, xm(1, 2)), xm(ab[0] + ab[1]), N(ab[0] * ab[1])), code: 'first-only', hint: 'Multiply <b>every</b> term of ' + t(tx(Q)) + ' by ' + t(tx(A)) + '.' }],
            t('V=' + tx(A) + bp(E1) + bp(E2) + '=' + tx(A) + bp(Q) + '=' + tx(T)), ['Volume = (length)(width)(height): multiply the two binomials first.', 'Then multiply every term by ' + t(tx(A)) + '.'], 'prism volume ' + tx(A) + bp(E1) + bp(E2), { before: t('V=') });
        } }] },
      { num: '21', outcome: 'AN4', stem: 'Write the shaded area as a polynomial in simplest form.', parts: [
        { id: '21', outcome: 'AN4', level: 'PRG', make: function (r) {
          var v = find(function () { return { a: r.int(2, 4), b: r.int(1, 6), c: r.int(1, 3), d: r.int(1, 6), h: r.int(1, 3) }; }, function (v) { return v.a * v.c >= 2 && v.b * v.d > v.h * v.h; }, { a: 3, b: 2, c: 2, d: 5, h: 1 });
          var ctx = r.pick([{ hole: 'A square hole', from: 'is cut from a rectangle', u: 'cm', what: 'the shaded area' }, { hole: 'A square window', from: 'is cut from a wall panel', u: 'dm', what: 'the shaded area' }, { hole: 'A square pool', from: 'sits in a yard', u: 'm', what: 'the area of the lawn (shaded)' }, { hole: 'A square photo', from: 'is glued onto a poster', u: 'cm', what: 'the area of the poster still showing (shaded)' }]);
          var Wd = lin(v.a, v.b), Hd = lin(v.c, v.d), S = lin(1, v.h), Big = mul(Wd, Hd), Sq = mul(S, S), T = sub(Big, Sq);
          var ws = [{ is: add(Big, Sq), code: 'not-subtracted', hint: 'The square is <b>removed</b>: subtract its area.' }, { is: Big, code: 'whole-only', hint: 'That is the whole rectangle. Subtract the square’s area.' },
            { is: subFirstOnly(Big, Sq), code: 'minus-first', hint: 'Subtract <b>every</b> term of ' + t(tx(Sq)) + ' — put it in brackets first.' }, { is: sub(Big, sqNoMid(S)), code: 'no-middle', hint: t('(' + tx(S) + ')^{2}') + ' has a middle term: ' + t(tx(Sq)) + '.' }];
          return pp(ctx.hole + ' with side ' + t(tx(S)) + ' ' + ctx.from + ' that measures ' + t(tx(Wd)) + ' by ' + t(tx(Hd)) + ' (all lengths in ' + ctx.u + '). Write ' + ctx.what + ' as a polynomial in simplest form.' + holeSvg(Wd, Hd, S), T, ws,
            t(bp(Wd) + bp(Hd) + '=' + tx(Big)) + ';&nbsp; ' + t('(' + tx(S) + ')^{2}=' + tx(Sq)) + '<br>Shaded ' + t('=' + tx(Big) + '-(' + tx(Sq) + ')=' + tx(T)) + ' ' + ctx.u + t('^{2}'),
            ['Shaded area = whole rectangle − square.', 'Put the square’s area in brackets before you subtract it.'], 'shaded area ' + tx(Wd) + ' by ' + tx(Hd) + ' minus (' + tx(S) + ')^2', { after: t('\\text{' + ctx.u + '}^{2}') });
        } }] },
      { num: '22', outcome: 'AN4', stem: 'Write the volume as a polynomial in expanded form.', parts: [
        { id: '22', outcome: 'AN4', level: 'PRG', make: function (r) {
          var L = r.pick([12, 14, 16, 18, 20, 22, 24]), W = r.pick([8, 10, 12, 14, 16].filter(function (w) { return w <= L - 2; })), what = r.pick([['card', 'box'], ['tin', 'tray'], ['cardboard', 'box'], ['metal', 'tray']]);
          var X = xm(1), Ls = lin(-2, L), Ws = lin(-2, W), base = mul(Ls, Ws), T = mul(X, base);
          return pp('Squares of side ' + t('x') + ' cm are cut from the corners of a ' + t(L) + ' cm by ' + t(W) + ' cm sheet of ' + what[0] + ', and the sides are folded up to make an open ' + what[1] + '. Write the volume of the ' + what[1] + ' as a polynomial in expanded form.' + netSvg(L, W), T,
            [{ is: mul(X, lin(-1, L), lin(-1, W)), code: 'u3t-box-x', hint: 'A square is cut from <b>both</b> ends of each side, so the length is ' + t(L + '-2x') + ', not ' + t(L + '-x') + '.' }, { is: base, code: 'u3t-box-height', hint: 'That is the area of the base. The ' + what[1] + ' is ' + t('x') + ' cm tall: multiply by ' + t('x') + '.' },
              { is: mul(X, add(xm(4, 2), N(L * W))), code: 'fl-only', hint: t('(' + L + '-2x)(' + W + '-2x)') + ' has a middle term: ' + t(tx(xm(-2 * (L + W)))) + '.' }],
            'Length ' + t(L + '-2x') + ', width ' + t(W + '-2x') + ', height ' + t('x') + '.<br>' + t('(' + L + '-2x)(' + W + '-2x)=' + seq([N(L * W), xm(-2 * W), xm(-2 * L), xm(4, 2)]) + '=' + tx(base)) + '<br>' + t('V=x(' + tx(base) + ')=' + tx(T)) + ' ' + t('\\text{cm}^{3}'),
            ['Each side loses ' + t('x') + ' at <b>both</b> ends. The height is ' + t('x') + '.', 'Multiply the two binomials first, then multiply by ' + t('x') + '.'], 'open box ' + L + ' by ' + W, { before: t('V='), after: t('\\text{cm}^{3}') });
        } }] },
      { num: '23', outcome: 'AN4', shared: q23Shared,
        stem: function (s) { var w1 = q23Work(s, s.e[0]), w2 = q23Work(s, s.e[1]); return s.names[0] + ' and ' + s.names[1] + ' each expanded ' + t(s.k + '(' + s.p + 'x-' + s.q + ')^{2}') + ', and each made one error.' + workTable(s.names[0], s.names[1], w1.lines, w2.lines); },
        parts: [
          { id: '23a', outcome: 'AN4', level: 'MAS', make: function (r, s) {
            var ids = ['pre', 'nomid', 'once', 'dos'], want = {}, cols = [{ id: 'a', html: s.names[0], label: s.names[0] }, { id: 'b', html: s.names[1], label: s.names[1] }, { id: 'none', html: 'Neither', label: 'Neither' }];
            ids.forEach(function (id) { want[id] = s.e[0] === id ? 'a' : s.e[1] === id ? 'b' : 'none'; });
            var who = function (id) { return want[id] === 'a' ? s.names[0] : want[id] === 'b' ? s.names[1] : 'neither student'; };
            var rows = ids.map(function (id) { return { id: id, html: '… ' + ERR[id], label: id }; });
            var why = { pre: 'Look for a line where the ' + t(s.k) + ' has gone <b>inside</b> the square.', nomid: 'Look for a line with only two terms inside the bracket, both positive.', once: 'Look at the middle term: is it ' + t('2ab') + ' or just ' + t('ab') + '?', dos: 'Look for a line where the last term inside the bracket is negative.' };
            var g = KP.grid('Each student made <b>one</b> error. For each statement, choose who made that error (or neither).', rows, cols, want,
              { why: function (id) { return { code: 'u3t-err-who', hint: why[id] }; }, rowHead: 'The student…' },
              ids.map(function (id) { return '… ' + ERR[id] + ': <b>' + who(id) + '</b>.'; }).join('<br>') + '<br>' + s.names[0] + ': ' + q23Expl(s, s.e[0]) + '<br>' + s.names[1] + ': ' + q23Expl(s, s.e[1]),
              ['Redo the first step yourself: ' + t('(' + s.p + 'x-' + s.q + ')^{2}') + ' first, then multiply by ' + t(s.k) + '. Compare each student’s first step with yours.'], 'who made which error: ' + s.e.join(','));
            var sw = {}, all = {}; ids.forEach(function (id) { sw[id] = want[id] === 'a' ? 'b' : want[id] === 'b' ? 'a' : 'none'; all[id] = want[id] === 'none' ? 'a' : want[id]; });
            /* one row wrong, or the two errors found but swapped between the students: 1/3; anything more: no credit */
            var gBase = g.check;
            g.check = function (resp) {
              var res = gBase(resp); if (res.v !== 'wrong') return res; resp = resp || {};
              var nBad = ids.filter(function (id) { return resp[id] !== want[id]; }).length, swapped = ids.every(function (id) { return resp[id] === sw[id]; });
              return nBad > 1 && !swapped ? wrong('u3t-err-who2', res.hint) : res;
            };
            g.bad = [sw, all];
            return g;
          } },
          { id: '23b', outcome: 'AN4', level: 'MAS', make: function (r, s) {
            var A = xm(s.p), B = N(-s.q), Sq = mul(add(A, B), add(A, B)), T = PL.scale(Sq, s.k), CODE = { pre: 'k-in-square', nomid: 'no-middle', once: 'middle-once', dos: 'sq-as-sd' };
            var ws = s.e.map(function (e, i) { return { is: q23Work(s, e).res, code: CODE[e], hint: 'That is ' + s.names[i] + '’s answer: ' + ERR[e] + '.' }; }).concat(sqWrongs(A, B).map(function (w) { return { is: PL.scale(w.is, s.k), code: w.code, hint: w.hint }; }), [{ is: Sq, code: 'k-forgot', hint: 'Multiply every term by the ' + t(s.k) + ' in front.' }]);
            return pp('Write the correct expansion of ' + t(s.k + '(' + s.p + 'x-' + s.q + ')^{2}') + '.', T, ws,
              'Square first, then multiply by ' + t(s.k) + ':<br>' + t(s.k + '(' + s.p + 'x-' + s.q + ')^{2}=' + s.k + bp(Sq) + '=' + tx(T)) + '<br>(Check with ' + t('x=1') + ': ' + t(s.k + '(' + (s.p - s.q) + ')^{2}=' + s.k * (s.p - s.q) * (s.p - s.q)) + ' and ' + t(PL.at(T, { x: 1 })) + '.)',
              ['Expand ' + t('(' + s.p + 'x-' + s.q + ')^{2}') + ' first — it has a middle term.', 'Then multiply every term by ' + t(s.k) + '.'], 'correct expansion ' + s.k + '(' + s.p + 'x-' + s.q + ')^2');
          } }] },
      { num: '24', outcome: 'AN4', stem: 'Use a special product to find each value <b>without a calculator</b>. Show the special product you used.', parts: [
        { id: '24a', outcome: 'AN4', level: 'MAS', make: function (r) {
          var tt = r.int(3, 9) * 10, e = r.int(1, 4), n1 = tt + e, n2 = tt - e, val = tt * tt - e * e;
          return spPart(n1 + '\\times ' + n2, val, 'sd', tt, e, [{ v: tt * tt + e * e, code: 'sd-plus', hint: t('(a+b)(a-b)=a^{2}-b^{2}') + ': subtract ' + t(e + '^{2}') + '.' }, { v: tt * tt - e, code: 'not-sq', hint: 'Square the ' + t(e) + ' too: ' + t(e + '^{2}=' + e * e) + '.' }]);
        } },
        { id: '24b', outcome: 'AN4', level: 'MAS', make: function (r) {
          var tt = r.int(2, 9) * 10, e = r.pick([-2, -1, 1, 2]), n = tt + e, val = n * n;
          return spPart(n + '^{2}', val, 'sq', tt, e, [{ v: tt * tt + e * e, code: 'no-middle', hint: t('(a\\pm b)^{2}=a^{2}\\pm 2ab+b^{2}') + ': don’t forget the middle term, ' + t('2(' + tt + ')(' + Math.abs(e) + ')') + '.' }, { v: tt * tt + tt * e + e * e, code: 'middle-once', hint: 'The middle term is <b>twice</b> ' + t(tt + '\\times ' + Math.abs(e)) + '.' }, { v: tt * tt - 2 * tt * e + e * e, code: 'sq-middle-sign', hint: 'Check the sign of the middle term.' }]);
        } }] },
      { num: '25', outcome: 'AN4', stem: 'Show your reasoning with a polynomial.', parts: [
        { id: '25', outcome: 'AN4', level: 'MAS', make: function (r) {
          var c = r.pick([['square garden', 'm'], ['square patio', 'm'], ['square poster', 'cm'], ['square tile', 'cm'], ['square sandbox', 'dm']]), d = r.int(2, 6), x = r.int(4, 12), A = 2 * d * x + d * d, X = xm(1), inc = add(xm(2 * d), N(d * d));
          var xAlts = altVals(x, [{ v: x + d, code: 'u3t-new-side', hint: 'That is the new side. The question asks for the side <b>at first</b>.' }, { v: (A - d * d) % d === 0 ? (A - d * d) / d : NaN, code: 'not-doubled', hint: 'The middle term of ' + t('(x+' + d + ')^{2}') + ' is ' + t(2 * d + 'x') + ': solve ' + t(2 * d + 'x+' + d * d + '=' + A) + '.' }, { v: A % (2 * d) === 0 ? A / (2 * d) : NaN, code: 'u3t-inc-nod2', hint: 'Don’t forget the ' + t(d * d) + ': solve ' + t(2 * d + 'x+' + d * d + '=' + A) + '.' }]);
          var p = KP.fields('Each side of a ' + c[0] + ' is made ' + t(d) + ' ' + c[1] + ' longer. The area increases by ' + t(A) + ' ' + c[1] + t('^{2}') + '. How long was each side at first? Let ' + t('x') + ' be the side at first.',
            [pbox('Increase in area: ' + t('(x+' + d + ')^{2}-x^{2}=')), nbox('Side at first: ' + t('x='), { after: c[1] })],
            [polyChk(inc, [{ is: N(d * d), code: 'no-middle', hint: t('(x+' + d + ')^{2}') + ' has a middle term.' }, { is: add(xm(d), N(d * d)), code: 'middle-once', hint: 'The middle term of ' + t('(x+' + d + ')^{2}') + ' is ' + t('2(' + d + ')x') + '.' }, { is: add(xm(1, 2), xm(2 * d), N(d * d)), code: 'new-area', hint: 'That is the new area. Subtract the old area, ' + t('x^{2}') + '.' }]), numChk(x, xAlts)],
            [tx(inc), String(x)], t('(x+' + d + ')^{2}-x^{2}=' + tx(inc)) + '; ' + t('x=' + x) + ' ' + c[1],
            t('(x+' + d + ')^{2}-x^{2}=x^{2}+' + 2 * d + 'x+' + d * d + '-x^{2}=' + tx(inc)) + '<br>' + t(tx(inc) + '=' + A) + ', so ' + t(2 * d + 'x=' + (A - d * d)) + ' and ' + t('x=' + x) + ' ' + c[1] + '.<br>(Check: ' + t((x + d) + '^{2}-' + x + '^{2}=' + (x + d) * (x + d) + '-' + x * x + '=' + A) + '.)',
            ['Write the new area minus the old area: ' + t('(x+' + d + ')^{2}-x^{2}') + '. The ' + t('x^{2}') + '-terms cancel.', 'Set it equal to ' + t(A) + ' and solve.'], 'square side increase ' + d + ', area +' + A);
          p.bad = xAlts.map(function (a) { return [tx(inc), String(a.v)]; }).concat([[tx(N(d * d)), String(x)]]);
          return p;
        } }] }
    ]
  });

  /* ---------- part makers used above (function declarations are hoisted) ---------- */
  function q23Expl(s, e) {
    var A = xm(s.p), B = N(-s.q);
    if (e === 'pre') return 'multiplied the ' + t(s.k) + ' into the bracket before squaring. The square must be done first (order of operations).';
    if (e === 'nomid') return 'squared each term separately and left out the middle term ' + t('2(' + s.p + 'x)(-' + s.q + ')=' + tx(PL.scale(mul(A, B), 2))) + '.';
    if (e === 'once') return 'did not double the middle term: it is ' + t('2(' + s.p + 'x)(-' + s.q + ')=' + tx(PL.scale(mul(A, B), 2))) + ', not ' + t(tx(mul(A, B))) + '.';
    return 'treated ' + t('(' + s.p + 'x-' + s.q + ')^{2}') + ' like a difference of squares: the middle term ' + t(tx(PL.scale(mul(A, B), 2))) + ' is missing, and ' + t('(-' + s.q + ')^{2}=+' + s.q * s.q) + ', not ' + t(-s.q * s.q) + '.';
  }
  /* special products with numbers: the product typed as (a+b)(a−b) or (a±b)², then the value */
  function spPart(exprTex, val, kind, tt, e, alts) {
    var spTex = kind === 'sd' ? '(' + tt + '+' + e + ')(' + tt + '-' + e + ')' : '(' + tt + (e < 0 ? '-' : '+') + Math.abs(e) + ')^{2}';
    var spChk = function (resp) {
      var a = K.read(resp); if (a.res) return a.res;
      var q = PL.read(a.ast); if (!q.ok || PL.vars(q.p).length) return wrong('u3t-sp-value', 'Write the special product with numbers, like ' + t(kind === 'sd' ? '(40+3)(40-3)' : '(60+1)^{2}') + '.');
      var v = PL.constant(q.p); if (v[1] !== 1 || v[0] !== val) return wrong('u3t-sp-value', 'That product equals ' + t(F(v[0] / v[1])) + ', not ' + t(exprTex) + '.');
      var top = a.ast; while (top.t === 'paren') top = top.a;
      var unp = function (x) { while (x && x.t === 'paren') x = x.a; return x; };
      /* signed terms of a sum (null if it isn't one) */
      var terms = function (x) { x = unp(x); if (!x || (x.t !== 'add' && x.t !== 'sub')) return null; var out = []; (function w(y, s) { y = unp(y); if (y.t === 'add') { w(y.a, s); w(y.b, s); } else if (y.t === 'sub') { w(y.a, s); w(y.b, -s); } else if (y.t === 'neg') w(y.a, -s); else out.push({ s: s, n: y }); })(x, 1); return out; };
      var tval = function (tm) { var r0 = ex.rat(tm.n); return r0 ? tm.s * r0[0] / r0[1] : NaN; };
      var bin = function (x) { var ts = terms(x); return ts && ts.length === 2 ? ts.map(tval) : null; };
      var sqr = function (tm) { var n = unp(tm.n); return n.t === 'pow' && ex.rat(n.b) && ex.rat(n.b)[0] === 2 && ex.rat(n.b)[1] === 1; };
      var B1 = top.t === 'mul' ? bin(top.a) : null, B2 = top.t === 'mul' ? bin(top.b) : null, ts = terms(top);
      if (kind === 'sq') {
        if (top.t === 'pow' && bin(top.a) && ex.rat(top.b) && ex.rat(top.b)[0] === 2) return ok();
        if (B1 && B2 && ((B1[0] === B2[0] && B1[1] === B2[1]) || (B1[0] === B2[1] && B1[1] === B2[0]))) return ok();
        if (ts && ts.length === 3 && ts.filter(sqr).length >= 1) return ok(); // a² ± 2ab + b² written out
      } else {
        if (B1 && B2 && [0, 1].some(function (i) { return [0, 1].some(function (j) { return B1[i] === B2[j] && B1[1 - i] === -B2[1 - j] && B1[1 - i] !== 0; }); })) return ok();
        if (ts && ts.length === 2 && ts[0].s > 0 && ts[1].s < 0 && ts.every(sqr)) return ok(); // a² − b² written out
      }
      return wrong('u3t-sp-form', 'Right value — but show the special product, written like ' + t(kind === 'sd' ? '(a+b)(a-b)' : '(a+b)^{2}') + ' with numbers.');
    };
    var al = altVals(val, alts);
    var steps = kind === 'sd' ? t(exprTex + '=' + spTex + '=' + tt + '^{2}-' + e + '^{2}=' + F(tt * tt) + '-' + e * e + '=' + F(val)) : t(exprTex + '=' + spTex + '=' + tt + '^{2}' + (e < 0 ? '-' : '+') + '2(' + tt + ')(' + Math.abs(e) + ')+' + Math.abs(e) + '^{2}=' + F(tt * tt) + (e < 0 ? '-' : '+') + 2 * tt * Math.abs(e) + '+' + e * e + '=' + F(val));
    var p = KP.fields(t(exprTex), [pbox('Special product:', ['x'], { placeholder: 'with numbers' }), nbox('Value:')], [spChk, numChk(val, al)], [spTex, String(val)], t(exprTex + '=' + spTex + '=' + F(val)),
      (kind === 'sd' ? 'Sum times difference, ' + t('(a+b)(a-b)=a^{2}-b^{2}') : 'Square of a binomial, ' + t('(a\\pm b)^{2}=a^{2}\\pm 2ab+b^{2}')) + ':<br>' + steps,
      [kind === 'sd' ? 'Both numbers are the same distance from a multiple of ten: write them as ' + t('(a+b)(a-b)') + '.' : 'Write the number as a multiple of ten plus or minus a small number, then square the binomial.', 'Multiples of ten are easy to square without a calculator.'], 'special product ' + exprTex);
    p.bad = al.map(function (x) { return [spTex, String(x.v)]; }).concat([[String(val), String(val)], [kind === 'sd' ? '(' + tt + '+' + e + ')(' + tt + '+' + e + ')' : '(' + tt + ')^{2}', String(val)]]);
    return p;
  }
})(window);
