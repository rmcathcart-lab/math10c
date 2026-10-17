/* Math 10C · Unit 4 · Lesson 3 — Difference of Squares (AN5)
 * Assignment questions 1–13 (u4_L03.tex) and the whole Lesson 3 Extra Practice (u4_EP03.tex, Q1–18).
 * Every part is a generator: it keeps the structure of the booklet question (which term comes first, a coefficient,
 * one or two letters, a GCF to take out first, a sum of squares that stops, two or three rounds) and changes the
 * numbers; the booklet's numbers are one of the possible values. Factored keys are built from the generated square
 * roots, so the key always multiplies back to the question. Levels: LIM BEG EMG PRG ADV MAS. */
(function (root) {
  'use strict';
  var HW = root.HW, K = HW.kit, KP = K.P, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form;
  var P = HW.poly, FX = HW.factor, ex = HW.ex, F = HW.fmt;

  HW.addCodes({
    'dsq-square': 'Wrote a difference of squares as a perfect square (A − B)²', 'no-root': 'Used a square instead of its square root in a bracket',
    'rev-order': 'Brackets give B² − A² (squares taken in the wrong order)', 'lost-gcf': 'Dropped the common factor', 'gcf-one': 'Divided only one term by the common factor',
    'sum-sq': 'Tried to factor a sum of squares', 'sum-bracket': 'Wrong plus bracket in a repeated difference of squares', 'same-factor': 'Repeated the given factor',
    'dsq-sign': 'Sum × difference: wrong sign on the last term', 'square-middle': 'Squared a binomial without the middle term', 'middle-once': 'Middle term of a square not doubled',
    'lw-swap': 'Length and width swapped', 'perim-half': 'Used L + W for the perimeter instead of 2(L + W)', 'no-pi': 'Left out π', 'added-sq': 'Added the squares instead of subtracting',
    'circ': 'Used circumference instead of area', 'd-not-squared': 'Didn’t square the distance from the middle number', 'minus-bracket': 'Subtracted a bracket without changing every sign',
    'lost-half': 'Dropped the ½', 'ab-sum': 'Gave a + b instead of a² + b²', 'simplify-br': 'Brackets not simplified', 'squared-each': 'Squared the numbers instead of using the factored form',
    'abcd': 'Wrong values of a, b, c, d', 'sub-value': 'Substitution error', 'sum-pair': 'Wrong pair of squares', 'frac-in-bracket': 'Left fractions inside the brackets'
  });

  /* ---------------- small helpers ---------------- */
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t2 = a % b; a = b; b = t2; } return a; }
  function pickWhere(gen, test) { for (var i = 0; i < 4000; i++) { var v = gen(); if (test(v)) return v; } throw new Error('pickWhere failed'); }
  function N(c) { return P.num(c); }
  /* monomial c·(letters), e.g. L(4, 'x') = 4x, L(1, 'xy') = xy, L([1, 2], 'n') = ½n, L(1, 'x', 2) = x² */
  function L(c, s, e) { var o = {}; (s || '').split('').forEach(function (ch) { o[ch] = (o[ch] || 0) + (e || 1); }); return P.mono(c, o); }
  function tx(p) { return P.tex(p); }
  function sq(A) { return P.pow(A, 2); }
  function plain(s) { return String(s).replace(/\\left|\\right/g, '').replace(/\\frac\{(\d+)\}\{(\d+)\}/g, '$1/$2').replace(/\\,/g, '').replace(/\\pi/g, 'π').replace(/[{}]/g, ''); }
  function isNum(X) { return !P.vars(X).length; }
  /* how X² is written: x^{2}, 9^{2}, (4x)^{2}, (xy)^{2}, (x^{2})^{2}, (\frac{1}{2}n)^{2} */
  function sqTex(X) {
    var ts = P.terms(X);
    if (ts.length === 1) {
      var T = ts[0], vs = Object.keys(T.v), c = T.c;
      if (c[1] === 1 && ((c[0] === 1 && vs.length === 1 && T.v[vs[0]] === 1) || (!vs.length && c[0] > 0))) return tx(X) + '^{2}';
    }
    return '\\left(' + tx(X) + '\\right)^{2}';
  }
  function br(list) { return '(' + P.seq(list) + ')'; }
  function dosTex(A, B) { return br([A, P.neg(B)]) + br([A, B]); }
  function dosTexR(A, B) { return br([A, B]) + br([A, P.neg(B)]); }
  /* "A² − B² written as squares" line, or '' when the expression already shows them (x² − y²) */
  function asSquares(A, B, exprTex, plus) {
    var s = sqTex(A) + (plus ? '+' : '-') + sqTex(B);
    return s === exprTex ? '' : s;
  }
  function notes(list) {
    var out = list.map(function (X) { var a = tx(sq(X)), b = sqTex(X); return a === b ? null : t(a + '=' + b); }).filter(Boolean);
    return out.length ? 'Both terms are perfect squares: ' + out.join(' and ') + '.<br>' : '';
  }
  var IDENT = t('A^{2}-B^{2}=(A-B)(A+B)');
  var H_DOS = ['Check that both terms are perfect squares, then use ' + IDENT + '.', 'Write each term as a square first, e.g. ' + t('16x^{2}=(4x)^{2}') + ' and ' + t('81=9^{2}') + '. One bracket gets a minus sign, the other a plus sign.'];
  var H_GCF = ['Take out the greatest common factor first; what is left in the bracket should be a difference (or sum) of squares.', 'Then factor the bracket with ' + IDENT + ' and keep the common factor in front. A sum of squares does not factor.'];
  var H_MULTI = ['Use ' + IDENT + ', then look at every bracket: the minus bracket may be a difference of squares again.', 'The plus brackets are sums of squares — they never factor. Stop when no bracket is a difference of squares.'];

  /* ---------------- factored-answer parts ---------------- */
  function cleanW(T, ws) {
    var out = [];
    (ws || []).forEach(function (w) {
      if (!w || !w.is) return; var p = FX.product(w.is);
      if (P.eq(p, T) || out.some(function (o) { return P.eq(FX.product(o.is), p); })) return;
      out.push(w);
    });
    return out;
  }
  function wTex(is) { return typeof is === 'string' ? is : FX.tex(is); }
  function factPart(prompt, target, ws, sol, hints, text, o) {
    o = o || {};
    var T = FX.product(target), W = cleanW(T, ws);
    var p = KP.factored(prompt, target, { wrong: W, keyTex: o.keyTex, gcfOnly: o.gcfOnly, vars: o.vars }, sol, hints, text);
    if (o.wrap) p.check = o.wrap(p.check, T);
    p.bad = W.map(function (w) { return wTex(w.is); }).concat(o.bad || []);
    p.good = o.good || [];
    return p;
  }
  /* a fraction inside the brackets is fine too: (7m - ½n)(7m + ½n) as well as ¼(14m - n)(14m + n) */
  function fracOk(target) {
    var TF = FX.split(target).factors, TN = FX.normal(TF), T = FX.product(target);
    return function (check) {
      return function (resp) {
        var r = check(resp); if (r.v !== 'form' || r.code !== 'gcf-inside') return r;
        var a = K.read(resp); if (a.res) return r;
        var sp = FX.split(a.ast); if (!sp.ok) return r;
        var S = sp.factors.reduce(function (acc, f) { return P.mul(acc, P.pow(f.p, f.k)); }, P.num(1)); if (!P.eq(S, T)) return r;
        var SN = FX.normal(sp.factors), ka = Object.keys(SN.keys), kb = Object.keys(TN.keys);
        if (ka.length !== kb.length || !ka.every(function (k) { return SN.keys[k] === TN.keys[k]; })) return r;
        var fracOnly = SN.raw.every(function (f) { return !Object.keys(f.cn.v).length && Math.abs(f.cn.c[0]) === 1; });
        return fracOnly ? ok() : r;
      };
    };
  }
  /* the reverse (e12 b ii): the question asks for the fraction OUT in front, so a correct product whose brackets still
   * hold fractions, e.g. (⅓p − 5/2 q)(⅓p + 5/2 q), gets a nudge (K.factored itself accepts fraction-only brackets) */
  function fracOut(Lc2) {
    return function (check) {
      return function (resp) {
        var r = check(resp); if (r.v !== 'correct') return r;
        var a = K.read(resp), sp = a.res ? null : FX.split(a.ast);
        if (sp && sp.ok && sp.factors.some(function (f) { return P.count(f.p) > 1 && P.terms(f.p).some(function (T) { return T.c[1] !== 1; }); }))
          return form('frac-in-bracket', 'Right product — but this question asks for the other form: take the fractional common factor ' + t('\\frac{1}{' + Lc2 + '}') + ' out in front first, so the brackets have <b>whole-number</b> coefficients.');
        return r;
      };
    };
  }
  /* brackets must be simplified: (x+3-4)(x+3+4) → nudge */
  function simpBr(check) {
    return function (resp) {
      var r = check(resp); if (r.v !== 'correct') return r;
      var a = K.read(resp), sp = FX.split(a.ast);
      if (sp.ok && sp.factors.some(function (f) { return f.ast && P.formIssue(f.ast); })) return form('simplify-br', 'Right — now <b>simplify inside each bracket</b> (collect the like terms) so each bracket is as short as possible.');
      return r;
    };
  }

  /* A spec for the basic shapes of this lesson:
   *   s = { a, b, R, k }: k·(a^E − b^E) with E = 2^R (R = 1 one round, 2 two rounds, 3 three rounds), or k·(a² + b²) when R = 0.
   *   a = first square root as written, b = second; k = GCF (monomial) or null. */
  function E2(R) { return Math.pow(2, Math.max(R, 1)); }
  function innerOf(s) { var E = E2(s.R); return s.R === 0 ? P.add(sq(s.a), sq(s.b)) : P.sub(P.pow(s.a, E), P.pow(s.b, E)); }
  function innerTex(s) { var E = E2(s.R); return s.R === 0 ? P.seq([sq(s.a), sq(s.b)]) : P.seq([P.pow(s.a, E), P.neg(P.pow(s.b, E))]); }
  function exprTexOf(s) {
    if (!s.k) return innerTex(s);
    var E = E2(s.R);
    return s.R === 0 ? P.seq([P.mul(s.k, sq(s.a)), P.mul(s.k, sq(s.b))]) : P.seq([P.mul(s.k, P.pow(s.a, E)), P.neg(P.mul(s.k, P.pow(s.b, E)))]);
  }
  function plusBrackets(a, b, R, from) { var s = ''; for (var j = from; j < R; j++) { var e = Math.pow(2, j); s += br([P.pow(a, e), P.pow(b, e)]); } return s; }
  function targetOf(s) {
    var kt = s.k ? tx(s.k) : '';
    if (s.R === 0) return kt + '(' + innerTex(s) + ')';
    return kt + dosTex(s.a, s.b) + plusBrackets(s.a, s.b, s.R, 1);
  }
  function factorsOf(s, kOn) { // list form, for wrong answers
    var out = s.k && kOn !== false ? [s.k] : [];
    if (s.R === 0) return out.concat([innerOf(s)]);
    out.push(P.sub(s.a, s.b), P.add(s.a, s.b));
    for (var j = 1; j < s.R; j++) { var e = Math.pow(2, j); out.push(P.add(P.pow(s.a, e), P.pow(s.b, e))); }
    return out;
  }
  /* coefficient (or number) not square-rooted: 16x → stays 16x in the bracket; 9 → 81 */
  function unrooted(X) {
    var ts = P.terms(X); if (ts.length !== 1) return null;
    var T = ts[0], c = T.c;
    if (c[1] !== 1 || Math.abs(c[0]) === 1) return null;
    return P.mono(c[0] * c[0], T.v);
  }
  function wrongsOf(s) {
    var a = s.a, b = s.b, k = s.k, pre = k ? [k] : [], kt = k ? tx(k) : '', ws = [];
    var rest = factorsOf(s).slice(pre.length + 2);
    if (s.R === 0) {
      ws.push({ is: pre.concat([P.sub(a, b), P.add(a, b)]), code: 'sum-sq', hint: 'Those brackets multiply to ' + t((kt ? kt + '(' : '') + P.seq([sq(a), P.neg(sq(b))]) + (kt ? ')' : '')) + ' — a <b>difference</b>. The bracket ' + t(innerTex(s)) + ' is a <b>sum</b> of squares, and a sum of squares never factors: stop once the common factor is out.' });
      ws.push({ is: pre.concat([{ p: P.add(a, b), k: 2 }]), code: 'sum-sq', hint: t('(' + P.seq([a, b]) + ')^{2}=' + tx(sq(P.add(a, b)))) + ' has a middle term. ' + t(innerTex(s)) + ' is a sum of squares: it doesn’t factor, so stop once the common factor is out.' });
      return ws;
    }
    var D = P.sub(a, b), S = P.add(a, b);
    var sqHint = function (X, xt) { return 'A squared bracket has a middle term: ' + t('(' + xt + ')^{2}=' + tx(sq(X))) + '. A difference of squares needs one <b>minus</b> bracket and one <b>plus</b> bracket, so the middle terms cancel.'; };
    ws.push({ is: pre.concat([{ p: D, k: 2 }], rest), code: 'dsq-square', hint: sqHint(D, P.seq([a, P.neg(b)])) });
    ws.push({ is: pre.concat([{ p: S, k: 2 }], rest), code: 'dsq-square', hint: sqHint(S, P.seq([a, b])) });
    ws.push({ is: pre.concat([P.sub(b, a), P.add(b, a)], rest), code: 'rev-order', hint: 'Your factors multiply to the <b>opposite</b> of the question (the squares are subtracted the other way round). The first term of each bracket is the square root of the <b>first</b> term, ' + t(tx(P.pow(a, E2(s.R)))) + '.' });
    if (s.R === 1) {
      [[a, 0], [b, 1]].forEach(function (pr) {
        var X = pr[0], X2 = isNum(X) ? (P.eq(sq(X), X) ? null : sq(X)) : unrooted(X); if (!X2) return;
        var A2 = pr[1] ? a : X2, B2 = pr[1] ? X2 : b;
        ws.push({ is: pre.concat([P.sub(A2, B2), P.add(A2, B2)]), code: 'no-root', hint: 'Use the square <b>roots</b> in the brackets: ' + t(tx(sq(X)) + '=' + sqTex(X)) + ', so the bracket term is ' + t(tx(X)) + ', not ' + t(tx(X2)) + '.' });
      });
    }
    if (s.R >= 2) {
      var e = Math.pow(2, s.R - 1), lastTex = '(' + P.seq([P.pow(a, e), P.pow(b, e)]) + ')';
      var fs = factorsOf(s), wrongLast = fs.slice(0, fs.length - 1).concat([P.sub(P.pow(a, e / 2), P.pow(b, e / 2)), P.add(P.pow(a, e / 2), P.pow(b, e / 2))]);
      ws.push({ is: wrongLast, code: 'sum-sq', hint: t(lastTex) + ' is a <b>sum</b> of squares — it does not factor. (Brackets like ' + t(br([P.pow(a, e / 2), P.neg(P.pow(b, e / 2))]) + br([P.pow(a, e / 2), P.pow(b, e / 2)])) + ' multiply to a <b>difference</b>.)' });
      if (isNum(b) && !P.eq(sq(b), b) && s.R === 2) {
        ws.push({ is: pre.concat([D, S, P.add(sq(a), b)]), code: 'sum-bracket', hint: 'Check the plus bracket from the first round: ' + t(tx(P.pow(b, 4)) + '=' + sqTex(sq(b))) + ', so it is ' + t(lastTex) + '.' });
      }
    }
    if (k) {
      ws.push({ is: factorsOf(s, false), code: 'lost-gcf', hint: 'Your brackets are right, but the common factor ' + t(kt) + ' has gone missing. It stays in front of the brackets.' });
      if (isNum(k)) {
        var kv = P.constant(k)[0], E = E2(s.R);
        ws.push({ is: [k, P.sub(P.pow(a, E), P.scale(P.pow(b, E), kv))], code: 'gcf-one', hint: 'When you take out ' + t(kt) + ', divide <b>every</b> term by it: ' + t(tx(P.mul(k, P.pow(b, E))) + '\\div ' + kt + '=' + tx(P.pow(b, E))) + '.' });
      }
    }
    return ws;
  }
  /* worked solution of the rounds (inside the GCF), each line prefixed by pre */
  function roundsLines(s, pre, exprTex) {
    var a = s.a, b = s.b, R = s.R, lines = [], first = innerTex(s);
    var E = Math.pow(2, R - 1), lead = sqTex(P.pow(a, E)) + '-' + sqTex(P.pow(b, E));
    var open = pre ? '\\left[' : '', close = pre ? '\\right]' : '';
    if (lead !== first && lead !== exprTex) lines.push('=' + pre + open + lead + close);
    for (var j = R - 1; j >= 0; j--) {
      var e = Math.pow(2, j);
      lines.push('=' + pre + br([P.pow(a, e), P.neg(P.pow(b, e))]) + br([P.pow(a, e), P.pow(b, e)]) + plusBrackets(a, b, R, j + 1));
    }
    return lines;
  }
  function solOf(s, exprTex, noNotes) {
    var kt = s.k ? tx(s.k) : '', inner = innerTex(s), out = '';
    if (s.k) out += 'Take out the GCF ' + t(kt) + ' first:<br>' + t(exprTex + '=' + kt + '(' + inner + ')') + '<br>';
    if (s.R === 0) return out + t(inner) + ' is a <b>sum</b> of squares (' + t(sqTex(s.a) + '+' + sqTex(s.b)) + '), so it does not factor. Final answer: ' + t(targetOf(s)) + '.';
    if (!s.k && s.R === 1 && !noNotes) out += notes([s.a, s.b]);
    var lines = roundsLines(s, kt, exprTex);
    if (s.R === 1) return out + t((s.k ? '' : exprTex) + lines.join(''));
    out += t((s.k ? '' : exprTex) + lines[0]);
    for (var i = 1; i < lines.length; i++) out += '<br>' + t(lines[i]);
    return out + '<br>Each round the <b>minus</b> bracket is a difference of squares again; the <b>plus</b> brackets are sums of squares and stop.';
  }
  function fxPart(s, o) {
    o = o || {};
    var exprTex = o.exprTex || exprTexOf(s), target = targetOf(s);
    var good = [];
    if (s.R >= 1) { var kt = s.k ? tx(s.k) : ''; good.push(kt + dosTexR(s.a, s.b) + plusBrackets(s.a, s.b, s.R, 1)); }
    var hints = o.hints || (s.k ? H_GCF : s.R >= 2 ? H_MULTI : H_DOS);
    return factPart(o.prompt || t(exprTex), target, wrongsOf(s).concat(o.wrong || []), (o.solPre || '') + solOf(s, exprTex, o.noNotes) + (o.solPost || ''), hints, o.text || 'factor ' + plain(exprTex),
      { good: good.concat(o.good || []), bad: o.bad, wrap: o.wrap, keyTex: o.keyTex });
  }
  function S(a, b, R, k) { return { a: a, b: b, R: R == null ? 1 : R, k: k || null }; }

  /* ---------------- multiple choice ---------------- */
  function mc(r, prompt, opts, sol, hints, text, keepOrder) { return KP.mc(r, prompt, opts, sol, hints, text, keepOrder); }
  /* "factor where possible" for a sum of squares A² + B² */
  function sumSqMC(r, A, B, prompt) {
    var e = P.seq([sq(A), sq(B)]);
    return mc(r, prompt || ('Factor where possible: ' + t(e)), [
      { html: t(dosTex(A, B)), why: 'Expand it: ' + t(dosTex(A, B) + '=' + P.seq([sq(A), P.neg(sq(B))])) + '. That’s a <b>difference</b> of squares, but the question has a plus sign.' },
      { html: t('(' + P.seq([A, B]) + ')^{2}'), why: 'Expand it: ' + t('(' + P.seq([A, B]) + ')^{2}=' + tx(sq(P.add(A, B)))) + '. The middle term ' + t(tx(P.scale(P.mul(A, B), 2))) + ' isn’t in the question.' },
      { html: t('(' + P.seq([A, P.neg(B)]) + ')^{2}'), why: 'Expand it: ' + t('(' + P.seq([A, P.neg(B)]) + ')^{2}=' + tx(sq(P.sub(A, B)))) + '. There’s a middle term, and the question has none.' },
      { html: 'It cannot be factored over the integers.', right: true }],
      t(e + '=' + sqTex(A) + '+' + sqTex(B)) + ' is a <b>sum</b> of squares. To factor it we would need two terms with a positive product and a sum of zero, but a positive product forces the same sign, so no such pair exists. It <b>cannot be factored</b> over the integers.',
      ['Is it a <b>difference</b> or a <b>sum</b>? Try expanding each option.'], 'sum of squares? ' + plain(e));
  }

  /* ---------------- other part makers ---------------- */
  function missingPart(A, B, givenMinus) {
    var expr = P.seq([sq(A), P.neg(sq(B))]), D = P.sub(A, B), Sm = P.add(A, B), given = givenMinus ? D : Sm, want = givenMinus ? Sm : D;
    var ws = [{ is: given, code: 'same-factor', hint: 'That’s the factor you were given. The two factors of a difference of squares have <b>opposite</b> signs, so the middle terms cancel — ' + t('(' + tx(given) + ')(' + tx(given) + ')=' + tx(sq(given))) + '.' }];
    if (isNum(B) && !P.eq(sq(B), B)) { var B2 = sq(B); ws.push({ is: givenMinus ? P.add(A, B2) : P.sub(A, B2), code: 'no-root', hint: 'Use the square <b>root</b>: ' + t(tx(B2) + '=' + sqTex(B)) + ', so the number in the bracket is ' + t(tx(B)) + ', not ' + t(tx(B2)) + '.' }); }
    var sqs = asSquares(A, B, expr), AB = P.mul(A, B);
    var prods = givenMinus ? [sq(A), AB, P.neg(AB), P.neg(sq(B))] : [sq(A), P.neg(AB), AB, P.neg(sq(B))];
    var sol = t(expr + '=' + (sqs ? sqs + '=' : '') + '(' + tx(given) + ')(' + tx(want) + ')') + ', so the missing factor is ' + t('(' + tx(want) + ')') + '.<br>Check: ' + t('(' + tx(given) + ')(' + tx(want) + ')=' + P.seq(prods) + '=' + expr) + ' ✓';
    var p = KP.poly(t(expr + '=(' + tx(given) + ')\\left(\\underline{\\hspace{2.6em}}\\right)'), want, { wrong: ws }, sol,
      ['The two factors of ' + t('A^{2}-B^{2}') + ' are ' + t('A-B') + ' and ' + t('A+B') + ': the same two terms, opposite signs.', 'Check by multiplying: the middle terms must cancel.'], 'missing factor ' + plain(expr));
    p.good = ['(' + tx(want) + ')', P.seq([givenMinus ? B : P.neg(B), A])];
    p.bad = ws.map(function (w) { return tx(w.is); });
    return p;
  }
  /* several labelled boxes */
  function pbox(label, vars, name) { return { name: name || label.replace(/<[^>]*>|\\\(|\\\)/g, ''), label: label, mode: 'math', keys: 'poly', vars: vars, wide: true }; }
  function nbox(label, name) { return { name: name || label.replace(/<[^>]*>|\\\(|\\\)/g, ''), label: label }; }
  /* number answer with an exact π */
  function piChk(n, diag) {
    return function (resp) {
      var a = K.read(resp); if (a.res) return a.res;
      var sh = ex.shape(a.ast), v = a.val, want = n * Math.PI;
      if (Math.abs(v - want) < 1e-7 * Math.max(1, want)) {
        if (!sh.pi) return form('decimal', 'That’s a decimal approximation. Give the <b>exact</b> area as a multiple of ' + t('\\pi') + ' (use the ' + t('\\pi') + ' key).');
        if (sh.ops || sh.pow || sh.roots || sh.nums > 1 || sh.paren || sh.divs) return form('simplify', 'Right value — now simplify it to a single number times ' + t('\\pi') + '.');
        return ok();
      }
      if (!sh.pi && Math.abs(v - want) < 0.06 * Math.max(1, want / 100)) return form('decimal', 'That’s a decimal approximation. Give the <b>exact</b> area as a multiple of ' + t('\\pi') + ' (use the ' + t('\\pi') + ' key).');
      if (!sh.pi && Math.abs(v - n) < 1e-9) return form('no-pi', 'Right number — but the area is that number times ' + t('\\pi') + '. Include the ' + t('\\pi') + '.');
      var h = diag ? diag(sh.pi ? v / Math.PI : NaN) : null;
      if (h) return wrong(h.code, h.hint);
      return wrong('value', null);
    };
  }
  /* π typed with the π key is read as a letter w for the factor checker; hints get π back */
  function unW(h) { return h ? h.replace(/\\\((.*?)\\\)/g, function (m, inner) { return '\\(' + inner.replace(/w/g, '\\pi ') + '\\)'; }) : h; }
  function piWrap(check) {
    return function (resp) {
      var s = String(resp == null ? '' : resp);
      if (/w|W/.test(s.replace(/\\[a-zA-Z]+/g, ''))) return wrong('value', null);
      var r = check(s.replace(/\\pi|π/g, ' w '));
      return r.hint ? { v: r.v, code: r.code, hint: unW(r.hint) } : r;
    };
  }
  /* expression equal to a target with letters vs (R, r, π) */
  function exprChk(targetTex, vs, wrongs, opt) {
    opt = opt || {};
    var T = ex.parse(targetTex).ast, W = (wrongs || []).map(function (w) { return { ast: ex.parse(w.tex).ast, code: w.code, hint: w.hint }; });
    return function (resp) {
      var a = K.read(resp); if (a.res) return a.res;
      var sv = Object.keys(ex.shape(a.ast).vars), extra = sv.filter(function (v) { return vs.indexOf(v) < 0; });
      if (extra.length) return wrong('var', 'Use only ' + vs.map(t).join(' and ') + (opt.pi ? ' (and ' + t('\\pi') + ')' : '') + ' in your answer.');
      if (ex.equiv(a.ast, T, vs)) return ok();
      for (var i = 0; i < W.length; i++) if (ex.equiv(a.ast, W[i].ast, vs)) return wrong(W[i].code, W[i].hint);
      return wrong('value', null);
    };
  }
  /* two poly boxes: length (larger) and width */
  function lwCheck(Lp, Wp, area) {
    var cl = K.poly(Lp), cw = K.poly(Wp), both = K.fields([cl, cw], { labels: ['Length', 'Width'] });
    return function (resp) {
      resp = resp || []; var a = resp[0] == null ? '' : resp[0], b = resp[1] == null ? '' : resp[1];
      if (cl(a).v === 'correct' && cw(b).v === 'correct') return ok();
      if (cl(b).v === 'correct' && cw(a).v === 'correct') return form('lw-swap', 'Those are the two right factors, but the <b>length</b> is the longer side: ' + t(tx(Lp)) + ' is greater than ' + t(tx(Wp)) + '.');
      var ra = P.read(a), rb = P.read(b);
      if (a && b && ra.ok && rb.ok && !P.eq(P.mul(ra.p, rb.p), area)) return wrong('value', 'Length × width must equal the area: your two expressions multiply to ' + t(tx(P.mul(ra.p, rb.p))) + ', not ' + t(tx(area)) + '. Factor the area as a difference of squares.');
      return both(resp);
    };
  }

  /* ---------------- figures ---------------- */
  function ringSvg() {
    return '<svg class="fig-svg" viewBox="0 0 250 230" style="max-width:260px" role="img" aria-label="a circle of radius R with a smaller circle of radius r removed" font-size="17" font-family="KaTeX_Main,\'Times New Roman\',serif">' +
      '<circle cx="118" cy="115" r="100" fill="#9aa3ad" fill-opacity="0.45" stroke="currentColor" stroke-width="2"/>' +
      '<circle cx="160" cy="142" r="40" style="fill:var(--card,#fff)" stroke="currentColor" stroke-width="2"/>' +
      '<circle cx="118" cy="115" r="2.6" fill="currentColor"/><circle cx="160" cy="142" r="2.6" fill="currentColor"/>' +
      '<line x1="118" y1="115" x2="47.3" y2="44.3" stroke="currentColor" stroke-width="1.6"/><path d="M47.3,44.3 l9,2 l-7,7 z" fill="currentColor"/>' +
      '<line x1="160" y1="142" x2="200" y2="142" stroke="currentColor" stroke-width="1.6"/><path d="M200,142 l-8,-4 l0,8 z" fill="currentColor"/>' +
      '<text x="72" y="72" fill="currentColor" font-style="italic" style="paint-order:stroke;stroke:var(--card,#fff);stroke-width:4px">R</text>' +
      '<text x="176" y="135" fill="currentColor" font-style="italic">r</text></svg>';
  }

  HW.defineLesson({
    id: 'u4l3', unit: 4, num: '3', title: 'Difference of Squares', outcome: 'AN5',
    blurb: 'The middle coefficient is 0 — A² − B² = (A − B)(A + B): coefficients, two letters, a common factor first, a second round, and why a sum of squares never factors.',
    questions: [
      /* ---------- Q1 missing factor ---------- */
      { num: '1', section: 'Part A — The pattern A² − B²', stem: 'Complete the following by determining the missing factor.', parts: [
        { id: '1a', level: 'LIM', make: function (r) { return missingPart(L(1, r.pick(['y', 'y', 'x', 'm', 't', 'k'])), N(r.int(2, 12)), true); } },
        { id: '1b', level: 'LIM', make: function (r) { return missingPart(L(1, r.pick(['d', 'd', 'x', 'a', 'p', 'w'])), N(r.int(11, 15)), false); } },
        { id: '1c', level: 'BEG', make: function (r) { var v = r.pick([['r', 's'], ['r', 's'], ['a', 'b'], ['x', 'y'], ['m', 'n'], ['p', 'q'], ['c', 'd']]); return missingPart(L(1, v[0]), L(1, v[1]), r.chance(0.7)); } }] },
      /* ---------- Q2 factor + verify ---------- */
      { num: '2', stem: 'Factor the following polynomials using a difference of squares. Verify (a) by expanding.', shared: function (r) { return { n: r.int(4, 12) }; }, parts: [
        { id: '2a', level: 'BEG', make: function (r, sh) { return fxPart(S(L(1, 'x'), N(sh.n))); } },
        { id: '2v', sub: 'a check', level: 'LIM', make: function (r, sh) {
          var n = sh.n, A = L(1, 'x'), D = P.sub(A, N(n)), Sm = P.add(A, N(n)), T = P.mul(D, Sm);
          var p = KP.poly('Verify (a): expand ' + t('(x-' + n + ')(x+' + n + ')') + '.', T, { wrong: [
            { is: P.add(sq(A), N(n * n)), code: 'dsq-sign', hint: 'The last terms are ' + t('-' + n) + ' and ' + t('+' + n) + ': a negative times a positive is <b>negative</b>.' },
            { is: P.sub(P.sub(sq(A), L(2 * n, 'x')), N(n * n)), code: 'sign', hint: 'Check the middle terms: ' + t('x\\cdot ' + n + '=+' + n + 'x') + ' and ' + t('-' + n + '\\cdot x=-' + n + 'x') + '. What do they add to?' }] },
            t('(x-' + n + ')(x+' + n + ')=' + P.seq([sq(A), L(n, 'x'), L(-n, 'x'), N(-n * n)]) + '=x^{2}-' + n * n) + ' ✓<br>The middle terms cancel and we get back the original ' + t('x^{2}-' + n * n) + ', so the factoring is right.',
            ['Multiply each term of the first bracket by each term of the second (FOIL).', 'The outside and inside products are opposites, so they cancel.'], 'expand (x-' + n + ')(x+' + n + ')');
          p.bad = ['x^2+' + n * n, 'x^2-' + 2 * n + 'x-' + n * n];
          return p;
        } },
        { id: '2b', level: 'BEG', make: function (r) { return fxPart(S(L(1, r.pick(['x', 'x', 'y', 'a', 'm', 't'])), N(1))); } },
        { id: '2c', level: 'BEG', make: function (r) { var n = r.int(11, 19); return fxPart(S(L(1, 'x'), N(n)), { exprTex: 'x^{2}-' + n + '^{2}', noNotes: true }); } },
        { id: '2d', level: 'BEG', make: function (r) { var n = r.pick([20, 30, 40, 50, 60, 70, 80, 90]); return fxPart(S(L(1, 'x'), N(n)), { exprTex: 'x^{2}-' + F(n * n), noNotes: true, solPre: t(F(n * n) + '=' + n + '^{2}') + '.<br>' }); } }] },
      /* ---------- Q3 explain ---------- */
      { num: '3', stem: 'Explain how factoring a difference of squares in one variable can be regarded as a special case of factoring trinomials by inspection.', parts: [
        { id: '3', level: 'EMG', make: function (r) {
          var k = r.int(3, 9), k2 = k * k, v = r.pick(['x', 'x', 'y', 'a']);
          return mc(r, 'Which statement explains it? (Example: ' + t(v + '^{2}-' + k2) + '.)', [
            { html: 'Write ' + t(v + '^{2}-' + k2) + ' as ' + t(v + '^{2}+0' + v + '-' + k2) + '. Inspection needs two integers with <b>sum</b> ' + t('0') + ' and <b>product</b> ' + t('-' + k2) + ': always ' + t(k) + ' and ' + t('-' + k) + '. So ' + t(v + '^{2}-' + k2 + '=(' + v + '+' + k + ')(' + v + '-' + k + ')') + ' — the middle terms cancel.', right: true },
            { html: 'Write ' + t(v + '^{2}-' + k2) + ' as ' + t(v + '^{2}+' + k + v + '-' + k2) + '. Inspection needs two integers with sum ' + t(k) + ' and product ' + t('-' + k2) + '.', why: 'There is no ' + t(v) + ' term in ' + t(v + '^{2}-' + k2) + ', so ' + t('b=0') + ', not ' + t(k) + '. (No pair of integers has sum ' + t(k) + ' and product ' + t('-' + k2) + '.)' },
            { html: 'Any trinomial ' + t('x^{2}+bx+c') + ' with a negative ' + t('c') + ' is a difference of squares, so the methods are the same.', why: 'Try ' + t('x^{2}+2x-8=(x+4)(x-2)') + ': ' + t('c') + ' is negative, but it isn’t a difference of squares. You need ' + t('b=0') + ' <b>and</b> ' + t('c') + ' the negative of a perfect square.' },
            { html: 'It isn’t a special case: a difference of squares has only two terms, and inspection only works on three terms.', why: 'Think of the missing middle term as ' + t('0' + v) + '. Inspection still works: find two integers with sum ' + t('0') + ' and product ' + t('-' + k2) + '.' }],
            'A difference of squares is the trinomial ' + t('x^{2}+bx+c') + ' with ' + t('b=0') + ' and ' + t('c=-k^{2}') + '. Inspection looks for two integers with <b>sum</b> ' + t('b') + ' and <b>product</b> ' + t('c') + '; here they are always ' + t('k') + ' and ' + t('-k') + ', since ' + t('k+(-k)=0') + ' and ' + t('k(-k)=-k^{2}') + '. For example ' + t(v + '^{2}-' + k2 + '=' + v + '^{2}+' + k + v + '-' + k + v + '-' + k2 + '=(' + v + '+' + k + ')(' + v + '-' + k + ')') + '.',
            ['What are ' + t('b') + ' and ' + t('c') + ' for ' + t(v + '^{2}-' + k2) + '? Which two integers have that sum and product?'], 'explain: DoS as inspection with b = 0');
        } }] },
      /* ---------- Q4 factor where possible ---------- */
      { num: '4', stem: 'Factor where possible.', parts: [
        { id: '4a', level: 'BEG', make: function (r) { var v = r.pick([['p', 'q'], ['p', 'q'], ['a', 'b'], ['x', 'y'], ['m', 'n'], ['s', 't']]); return fxPart(S(L(1, v[0]), L(1, v[1]))); } },
        { id: '4b', level: 'BEG', make: function (r) { return fxPart(S(L(1, r.pick(['e', 'e', 'x', 'k', 'w', 'h'])), N(r.int(2, 12)))); } },
        { id: '4c', level: 'EMG', make: function (r) { return fxPart(S(N(r.pick([1, 1, 1, 2, 3, 4, 5, 6])), L(1, r.pick(['j', 'j', 'x', 'y', 'n'])))); } },
        { id: '4d', level: 'EMG', make: function (r) { var v = r.pick([['f', 'g'], ['f', 'g'], ['x', 'y'], ['a', 'b'], ['m', 'n']]); return fxPart(S(L(1, v[0]), L(r.int(2, 9), v[1]))); } },
        { id: '4e', level: 'BEG', make: function (r) {
          var g = pickWhere(function () { return { c: r.int(2, 9), d: r.int(2, 12) }; }, function (g) { return gcd(g.c, g.d) === 1; });
          return fxPart(S(L(g.c, r.pick(['x', 'x', 'a', 'y'])), N(g.d)));
        } },
        { id: '4f', level: 'PRG', make: function (r) {
          var g = pickWhere(function () { return { c: r.int(2, 9), d: r.int(2, 9) }; }, function (g) { return gcd(g.c, g.d) === 1; });
          var v = r.pick([['a', 'b'], ['a', 'b'], ['x', 'y'], ['m', 'n']]);
          return fxPart(S(L(g.c, v[0]), L(g.d, v[1])));
        } },
        { id: '4g', level: 'BEG', make: function (r) {
          var g = pickWhere(function () { return { c: r.int(2, 7), d: r.pick([1, 1, 2, 3, 4, 5]) }; }, function (g) { return gcd(g.c, g.d) === 1; });
          return sumSqMC(r, L(g.c, 'x'), L(g.d, 'y'));
        } },
        { id: '4h', level: 'PRG', make: function (r) {
          var g = pickWhere(function () { return { c: r.int(6, 12), d: r.int(7, 13) }; }, function (g) { return gcd(g.c, g.d) === 1; });
          var v = r.pick([['c', 'd'], ['c', 'd'], ['x', 'y'], ['p', 'q']]);
          return fxPart(S(L(g.c, v[0]), L(g.d, v[1])));
        } },
        { id: '4i', level: 'PRG', make: function (r) { return fxPart(S(L(1, r.pick(['x', 'x', 'a', 'y'])), N(r.pick([1, 1, 2, 3])), 2), { solPost: ' <i>(This is the Lesson 5 idea: always check whether a bracket factors again.)</i>' }); } }] },
      /* ---------- Q5 deck ---------- */
      { num: '5', section: 'Part B — An application, common factors and two variables',
        stem: function (sh) { return 'The surface of a rectangular deck has area ' + t(P.seq([L(sh.a * sh.a, 'p', 2), L(-sh.b * sh.b, 'q', 2)])) + ' square feet.'; },
        shared: function (r) {
          var g = pickWhere(function () { return { a: r.int(2, 9), b: r.int(1, 6), k: r.pick([1, 1, 2]) }; }, function (g) { var m = g.a * g.b * g.k; return gcd(g.a, g.b) === 1 && g.a !== g.b && m >= 6 && m <= 80; });
          g.p = 3 * g.b * g.k; g.q = g.a * g.k; g.per = 4 * g.a * g.p; g.Lv = g.a * g.p + g.b * g.q; g.Wv = g.a * g.p - g.b * g.q;
          g.Lp = P.add(L(g.a, 'p'), L(g.b, 'q')); g.Wp = P.sub(L(g.a, 'p'), L(g.b, 'q')); g.area = P.mul(g.Lp, g.Wp);
          return g;
        },
        parts: [
          { id: '5a', level: 'EMG', make: function (r, sh) {
            var A = L(sh.a, 'p'), B = L(sh.b, 'q'), at = tx(sh.area);
            var p = KP.fields('Write expressions for the length and width of the deck.', [pbox('Length (ft):', ['p', 'q'], 'Length'), pbox('Width (ft):', ['p', 'q'], 'Width')],
              [], [tx(sh.Lp), tx(sh.Wp)], 'Length ' + t('=(' + tx(sh.Lp) + ')') + ' ft, width ' + t('=(' + tx(sh.Wp) + ')') + ' ft',
              'Area = length × width, so factor the area: ' + t(at + '=' + sqTex(A) + '-' + sqTex(B) + '=' + dosTex(A, B)) + '.<br>The longer side is the length: ' + t('L=(' + tx(sh.Lp) + ')') + ' ft and ' + t('W=(' + tx(sh.Wp) + ')') + ' ft.',
              ['Area = length × width. Factor the area as a difference of squares.', 'The factor with the plus sign is the longer side (the length).'], 'deck dimensions from ' + plain(at));
            p.check = lwCheck(sh.Lp, sh.Wp, sh.area);
            p.bad = [[tx(sh.Wp), tx(sh.Lp)], [tx(P.add(L(sh.a * sh.a, 'p'), L(sh.b * sh.b, 'q'))), tx(P.sub(L(sh.a * sh.a, 'p'), L(sh.b * sh.b, 'q')))]];
            return p;
          } },
          { id: '5b', level: 'PRG', make: function (r, sh) {
            var a = sh.a, per = sh.per;
            return KP.number('If the perimeter of the deck is ' + t(per) + ' feet, form an equation in ' + t('p') + ' and ' + t('q') + ' and solve for ' + t('p') + '.', sh.p, function (v) {
              if (v === per / (2 * a)) return { code: 'perim-half', hint: 'The perimeter goes around <b>all four</b> sides: ' + t('P=2(L+W)') + ', not ' + t('L+W') + '.' };
              if (v === per / a) return { code: 'perim-half', hint: 'Add the length and width first — the ' + t('q') + ' terms cancel — then double: ' + t('2\\left[(' + tx(sh.Lp) + ')+(' + tx(sh.Wp) + ')\\right]') + '.' };
              return null;
            }, t('P=2(L+W)=2\\left[(' + tx(sh.Lp) + ')+(' + tx(sh.Wp) + ')\\right]=2(' + 2 * a + 'p)=' + 4 * a + 'p') + ' — the ' + t('q') + ' terms cancel.<br>' + t(4 * a + 'p=' + per) + ', so ' + t('p=' + per + '\\div ' + 4 * a + '=' + sh.p) + '.',
              ['Perimeter = ' + t('2(L+W)') + '. Use your expressions from (a).', 'When you add the length and width, the ' + t('q') + ' terms cancel.'], 'deck perimeter ' + per + ' → p', { before: t('p=') });
          } },
          { id: '5c', level: 'ADV', make: function (r, sh) {
            var a = sh.a, b = sh.b, p0 = sh.p;
            var nL = K.number(sh.Lv), nW = K.number(sh.Wv), both = K.fields([nL, nW], { labels: ['Length', 'Width'] });
            var part = KP.fields('Use your value of ' + t('p') + ' from (b). Determine the length and width of the deck if the length is twice the width.', [nbox('Length (ft):', 'Length'), nbox('Width (ft):', 'Width')],
              [], [String(sh.Lv), String(sh.Wv)], 'Length ' + t(sh.Lv) + ' ft, width ' + t(sh.Wv) + ' ft',
              '“Length is twice the width”: ' + t(tx(sh.Lp) + '=2(' + tx(sh.Wp) + ')=' + tx(P.scale(sh.Wp, 2))) + ', so ' + t(3 * b + 'q=' + a + 'p') + '.<br>With ' + t('p=' + p0) + ': ' + t(3 * b + 'q=' + a * p0) + ', so ' + t('q=' + sh.q) + '.<br>Length ' + t('=' + a + '(' + p0 + ')+' + b + '(' + sh.q + ')=' + sh.Lv) + ' ft, width ' + t('=' + a + '(' + p0 + ')-' + b + '(' + sh.q + ')=' + sh.Wv) + ' ft.<br>Check: ' + t(sh.Lv + '=2\\times ' + sh.Wv) + ' ✓ and ' + t('2(' + sh.Lv + '+' + sh.Wv + ')=' + sh.per) + ' ✓',
              ['Write “length = 2 × width” with your expressions from (a), and solve for ' + t('q') + ' using ' + t('p=' + p0) + '.', 'Then substitute ' + t('p') + ' and ' + t('q') + ' into the length and width.'], 'deck: length twice width');
            part.check = function (resp) {
              resp = resp || [];
              if (Number(resp[0]) === sh.Wv && Number(resp[1]) === sh.Lv) return form('lw-swap', 'Those are the right two numbers, but the length is the longer side.');
              if (Number(resp[0]) !== sh.Lv && Number(resp[0]) === 2 * Number(resp[1])) return wrong('value', 'Your length is twice your width, but check the perimeter: it must still be ' + t(sh.per) + ' ft. Set ' + t('(' + tx(sh.Lp) + ')=2(' + tx(sh.Wp) + ')') + ' and solve for ' + t('q') + ' using ' + t('p=' + p0) + '.');
              return both(resp);
            };
            part.bad = [[String(sh.Wv), String(sh.Lv)]];
            return part;
          } }] },
      /* ---------- Q6 GCF first ---------- */
      { num: '6', stem: 'Factor.', parts: [
        { id: '6a', level: 'BEG', make: function (r) { return fxPart(S(L(1, 'x'), N(r.int(2, 9)), 1, N(r.pick([2, 3, 5, 5, 6, 7])))); } },
        { id: '6b', level: 'EMG', make: function (r) { var v = r.pick([['a', 'y'], ['a', 'y'], ['x', 'y'], ['m', 'n']]); return fxPart(S(L(1, v[0]), L(r.int(2, 5), v[1]), 1, N(r.pick([2, 3, 5, 6, 6, 7])))); } },
        { id: '6c', level: 'EMG', make: function (r) { var v = r.pick([['t', 's'], ['t', 's'], ['x', 'y'], ['a', 'b']]); return fxPart(S(L(1, v[0]), L(r.int(2, 5), v[1]), 0, N(r.pick([2, 2, 3, 5, 6, 7])))); } },
        { id: '6d', level: 'BEG', make: function (r) { var v = r.pick([['x', 'y'], ['x', 'y'], ['a', 'b'], ['m', 'n']]); return fxPart(S(L(1, v[0]), L(1, v[1]), 1, N(r.pick([2, 3, 3, 5, 7, 10])))); } },
        { id: '6e', level: 'PRG', make: function (r) { var k = r.pick([4, 4, 2, 3, 5, 9]); return fxPart(S(L(1, 'ab'), N(r.int(2, 6)), 1, N(k)), { solPre: 'The GCF is ' + t(k) + ' (the coefficient of ' + t('a^{2}b^{2}') + ' divides the constant term).<br>' }); } },
        { id: '6f', level: 'PRG', make: function (r) { var v = r.pick(['pq', 'pq', 'xy', 'ab']); return fxPart(S(N(r.int(2, 5)), L(1, v), 1, N(r.pick([2, 3, 3, 5, 6]))), { solPost: '<br>Keep the squares in the question’s order (number first), so the signs come out right.' }); } }] },
      /* ---------- Q7 two variables ---------- */
      { num: '7', stem: 'Factor.', parts: [
        { id: '7a', level: 'EMG', make: function (r) { return fxPart(S(L(1, r.pick(['xy', 'xy', 'ab', 'mn'])), N(r.int(2, 9)))); } },
        { id: '7b', level: 'EMG', make: function (r) { var v = r.pick([['a', 'bc'], ['a', 'bc'], ['x', 'yz'], ['m', 'np'], ['p', 'qr']]); return fxPart(S(L(1, v[0]), L(1, v[1]))); } },
        { id: '7c', level: 'PRG', make: function (r) { var v = r.pick([['x', 'yz'], ['x', 'yz'], ['a', 'bc'], ['m', 'np']]); return fxPart(S(L(r.int(2, 12), v[0]), L(1, v[1]))); } },
        { id: '7d', level: 'EMG', make: function (r) { var v = r.pick([['mn', 'pq'], ['mn', 'pq'], ['ab', 'cd'], ['wx', 'yz'], ['pq', 'rs']]); return fxPart(S(L(1, v[0]), L(1, v[1]))); } },
        { id: '7e', level: 'EMG', make: function (r) { return fxPart(S(L(r.int(2, 9), r.pick(['xy', 'xy', 'ab', 'mn'])), N(1))); } },
        { id: '7f', level: 'PRG', make: function (r) { var v = r.pick([['ab', 'cd'], ['ab', 'cd'], ['xy', 'mn'], ['pq', 'st']]); return fxPart(S(L(1, v[0]), L(r.int(2, 9), v[1]))); } }] },
      /* ---------- Q8 ring ---------- */
      { num: '8', section: 'Part C — Applications', stem: function () { return 'The diagram shows a circle of radius ' + t('R') + ' with a circle of radius ' + t('r') + ' removed.' + ringSvg(); },
        shared: function (r) {
          var g = pickWhere(function () { return { d: r.int(2, 9), s: r.int(5, 20) }; }, function (g) { return g.s > g.d && (g.s + g.d) % 2 === 1 && g.s - g.d >= 3; });
          g.R = (g.s + g.d) / 2; g.r = (g.s - g.d) / 2; g.A = g.d * g.s; return g;
        },
        parts: [
          { id: '8a', level: 'BEG', make: function (r) {
            var p = KP.math('Write an expression for the shaded area.', exprChk('\\pi R^{2}-\\pi r^{2}', ['R', 'r'], [
              { tex: '\\pi R^{2}+\\pi r^{2}', code: 'added-sq', hint: 'The small circle is <b>removed</b>, so subtract its area.' },
              { tex: 'R^{2}-r^{2}', code: 'no-pi', hint: 'The area of a circle is ' + t('\\pi r^{2}') + ' — don’t forget the ' + t('\\pi') + '.' },
              { tex: '2\\pi R-2\\pi r', code: 'circ', hint: t('2\\pi r') + ' is the <b>circumference</b>. The area of a circle is ' + t('\\pi r^{2}') + '.' },
              { tex: '\\pi(R-r)^{2}', code: 'dsq-square', hint: 'Shaded area = big circle − small circle: ' + t('\\pi R^{2}-\\pi r^{2}') + '. That isn’t the same as ' + t('\\pi(R-r)^{2}') + '.' }], { pi: true }),
              '\\pi R^{2}-\\pi r^{2}', 'Shaded area = big circle − small circle:<br>' + t('A=\\pi R^{2}-\\pi r^{2}'),
              ['Area of a circle: ' + t('\\pi r^{2}') + '. The small circle is cut out of the big one.'], 'ring area expression', { keys: 'expo', vars: ['R', 'r'], pi: true });
            p.good = ['\\pi(R^{2}-r^{2})', '\\pi(R-r)(R+r)', 'R^{2}\\pi-r^{2}\\pi'];
            p.bad = ['\\pi R^{2}+\\pi r^{2}', 'R^{2}-r^{2}', '2\\pi R-2\\pi r'];
            return p;
          } },
          { id: '8b', level: 'PRG', make: function (r) {
            var chk = piWrap(K.factored('w(R-r)(R+r)', { wrong: [
              { is: 'w(R-r)^{2}', code: 'dsq-square', hint: 'A squared bracket has a middle term: ' + t('(R-r)^{2}=R^{2}-2Rr+r^{2}') + '. Use one minus bracket and one plus bracket.' },
              { is: '(R-r)(R+r)', code: 'no-pi', hint: 'Your brackets are right, but the common factor ' + t('\\pi') + ' has gone missing.' },
              { is: 'w(r-R)(r+R)', code: 'rev-order', hint: 'That multiplies to ' + t('\\pi r^{2}-\\pi R^{2}') + ', the opposite. Keep ' + t('R') + ' first.' }] }));
            var p = KP.math('Write the expression in (a) in factored form.', chk, '\\pi(R-r)(R+r)',
              'Common factor ' + t('\\pi') + ' first, then the pattern:<br>' + t('A=\\pi R^{2}-\\pi r^{2}=\\pi(R^{2}-r^{2})') + '<br>' + t('=\\pi(R-r)(R+r)'),
              ['Both terms have a factor ' + t('\\pi') + ': take it out first.', 'What is left, ' + t('R^{2}-r^{2}') + ', is a difference of squares.'], 'ring area factored', { keys: 'expo', vars: ['R', 'r'], pi: true });
            p.good = ['\\pi(R+r)(R-r)', '(R-r)(R+r)\\pi'];
            p.bad = ['\\pi(R-r)^{2}', '(R-r)(R+r)', '\\pi(R^{2}-r^{2})'];
            return p;
          } },
          { id: '8c', level: 'PRG', make: function (r, sh) {
            var Rt = String(sh.R), rt = String(sh.r), d = sh.d, s = sh.s;
            var p = KP.math('Determine the shaded area (as a multiple of ' + t('\\pi') + ') if ' + t('R=' + Rt) + ' and ' + t('r=' + rt) + '. Do not use a calculator.',
              piChk(sh.A, function (m) {
                if (Math.abs(m - (sh.R * sh.R + sh.r * sh.r)) < 1e-9) return { code: 'added-sq', hint: 'The small circle is removed: subtract, don’t add.' };
                if (Math.abs(m - d * d) < 1e-9) return { code: 'dsq-square', hint: 'Use the factored form ' + t('\\pi(R-r)(R+r)') + ': multiply ' + t('R-r') + ' by ' + t('R+r') + ', don’t square ' + t('R-r') + '.' };
                if (Math.abs(m - (d + s)) < 1e-9) return { code: 'value', hint: t('(R-r)') + ' and ' + t('(R+r)') + ' are <b>multiplied</b>, not added.' };
                return null;
              }), sh.A + '\\pi',
              'Use the factored form from (b): ' + t('R-r=' + Rt + '-' + rt + '=' + d) + ' and ' + t('R+r=' + Rt + '+' + rt + '=' + s) + ', so<br>' + t('A=\\pi(' + d + ')(' + s + ')=' + sh.A + '\\pi') + ' — no squaring of decimals needed.',
              ['Substitute into ' + t('\\pi(R-r)(R+r)') + ' instead of squaring the decimals.'], 'ring area R=' + Rt + ', r=' + rt, { keys: 'expr' });
            p.good = ['\\pi\\times ' + sh.A];
            p.bad = [String(sh.A), String(Math.round(sh.A * Math.PI * 100) / 100), d * d + '\\pi'];
            return p;
          } }] },
      /* ---------- Q9 physics ---------- */
      { num: '9', stem: 'The expression ' + t('\\dfrac{1}{2}mv^{2}-\\dfrac{1}{2}mu^{2}') + ' occurs in physics.',
        shared: function (r) {
          var g = pickWhere(function () { return { m: r.pick([2, 4, 6, 8, 8, 10]), v: 10 * r.int(3, 9), u: 10 * r.int(1, 8) }; }, function (g) { return g.v > g.u; });
          g.val = g.m / 2 * (g.v - g.u) * (g.v + g.u); return g;
        },
        parts: [
          { id: '9a', level: 'PRG', make: function () {
            return factPart('Write the expression in factored form.', '\\frac{1}{2}m(v-u)(v+u)', [
              { is: 'm(v-u)(v+u)', code: 'lost-half', hint: 'Your brackets are right, but the common factor is ' + t('\\frac{1}{2}m') + ' — the ' + t('\\frac{1}{2}') + ' has gone missing.' },
              { is: '\\frac{1}{2}(v-u)(v+u)', code: 'lost-gcf', hint: 'The common factor is ' + t('\\frac{1}{2}m') + ': both terms contain ' + t('m') + ', so it comes out in front too.' },
              { is: '\\frac{1}{2}m(v-u)^{2}', code: 'dsq-square', hint: 'A squared bracket has a middle term: ' + t('(v-u)^{2}=v^{2}-2uv+u^{2}') + '. Use one minus bracket and one plus bracket.' },
              { is: '\\frac{1}{2}m(u-v)(u+v)', code: 'rev-order', hint: 'That multiplies to ' + t('\\frac{1}{2}mu^{2}-\\frac{1}{2}mv^{2}') + ', the opposite. Keep ' + t('v') + ' first.' }],
              'Common factor ' + t('\\frac{1}{2}m') + ' first:<br>' + t('\\frac{1}{2}mv^{2}-\\frac{1}{2}mu^{2}=\\frac{1}{2}m(v^{2}-u^{2})') + '<br>' + t('=\\frac{1}{2}m(v-u)(v+u)'),
              ['Both terms contain ' + t('\\frac{1}{2}') + ' and ' + t('m') + ': take out ' + t('\\frac{1}{2}m') + ' first.', 'What is left is a difference of squares.'], 'factor ½mv² − ½mu²',
              { good: ['m(v-u)(v+u)/2', '\\frac{m}{2}(v+u)(v-u)', '0.5m(v-u)(v+u)'] });
          } },
          { id: '9b', level: 'PRG', make: function (r, sh) {
            var m = sh.m, v = sh.v, u = sh.u, h = m / 2, dif = v - u, sm = v + u;
            return KP.number('Determine the value of the expression when ' + t('m=' + m) + ', ' + t('v=' + v) + ' and ' + t('u=' + u) + '. Do not use a calculator.', sh.val, function (x) {
              if (x === m * dif * sm) return { code: 'lost-half', hint: 'Don’t forget the ' + t('\\frac{1}{2}') + ': ' + t('\\frac{1}{2}(' + m + ')=' + h) + '.' };
              if (x === h * dif * dif) return { code: 'dsq-square', hint: 'Use ' + t('\\frac{1}{2}m(v-u)(v+u)') + ': multiply ' + t('(v-u)') + ' by ' + t('(v+u)') + '.' };
              if (x === h * (v * v + u * u)) return { code: 'added-sq', hint: 'It’s ' + t('v^{2}-u^{2}') + ': subtract the squares.' };
              return null;
            }, 'Substitute into the <b>factored</b> form:<br>' + t('\\frac{1}{2}(' + m + ')(' + v + '-' + u + ')(' + v + '+' + u + ')=' + h + '(' + dif + ')(' + sm + ')') + '<br>' + t('=' + h + '(' + F(dif * sm) + ')=' + F(sh.val)),
              ['The factored form ' + t('\\frac{1}{2}m(v-u)(v+u)') + ' avoids squaring big numbers.'], '½mv² − ½mu² at m=' + m + ', v=' + v + ', u=' + u);
          } }] },
      /* ---------- Q10 Farid ---------- */
      { num: '10', stem: 'Farid was showing Amina how the difference of squares method can be used to multiply certain numbers without a calculator. He showed her: ' + t('29\\times 31=(30-1)(30+1)=30^{2}-1^{2}=900-1=899') + '.', parts: [
        { id: '10ai', sub: 'a i', level: 'EMG', make: function (r) { return productPart(10 * r.int(3, 9), r.int(1, 2)); } },
        { id: '10aii', sub: 'a ii', level: 'EMG', make: function (r) { return productPart(10 * r.int(4, 9), r.int(3, 6)); } },
        { id: '10b', sub: 'b', level: 'EMG', make: function (r) {
          var g = pickWhere(function () { return { a: r.int(41, 88), d: r.pick([3, 5, 7, 9]) }; }, function (g) { return g.a % 10 !== 0 && (g.a + g.d) % 10 !== 0 && g.a + g.d < 99; });
          var a = g.a, b = g.a + g.d, mid = (a + b) / 2, hd = g.d / 2;
          return mc(r, 'Why can’t this process be used <b>with whole numbers</b> to determine ' + t(a + '\\times ' + b) + '?', [
            { html: 'The number halfway between them is ' + t(String(mid)) + ', which is not a whole number, so they can’t be written as ' + t('(n-d)(n+d)') + ' with whole numbers ' + t('n') + ' and ' + t('d') + '.', right: true },
            { html: t(a) + ' and ' + t(b) + ' are not close enough to a multiple of ' + t('10') + '.', why: 'The middle number doesn’t have to be a multiple of ' + t('10') + ': ' + t('23\\times 27=25^{2}-2^{2}') + ' works. What matters is whether there is a <b>whole-number</b> middle.' },
            { html: 'The method only works for numbers less than ' + t('50') + '.', why: 'Size doesn’t matter: ' + t('98\\times 102=100^{2}-2^{2}') + ' works fine.' },
            { html: t(String(mid) + '^{2}-' + String(hd) + '^{2}') + ' is not equal to ' + t(a + '\\times ' + b) + '.', why: 'It <b>is</b> equal (' + t(String(mid) + '^{2}-' + String(hd) + '^{2}=' + F(a * b)) + '). The trouble is that these are decimals, not whole numbers — no longer a quick mental shortcut.' }],
            'The trick needs both numbers written as (middle number) ± (the same amount). The middle number is their average, ' + t('\\frac{' + a + '+' + b + '}{2}=' + mid) + ', which is not a whole number (their difference ' + t(g.d) + ' is odd). So ' + t(a + '\\times ' + b) + ' is not a difference of two whole-number squares. (It works with decimals, ' + t(String(mid) + '^{2}-' + String(hd) + '^{2}=' + F(a * b)) + ', but that is no longer a convenient shortcut.)',
            ['Find the number exactly halfway between ' + t(a) + ' and ' + t(b) + '.'], 'why ' + a + '×' + b + ' fails');
        } }] },
      /* ---------- Q11 MC ---------- */
      { num: '11', section: 'Part D — Multiple choice, numerical response and error analysis', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '11', level: 'BEG', make: function (r) {
          var g = pickWhere(function () { return { a: r.int(2, 5), b: r.int(2, 7) }; }, function (g) { return gcd(g.a, g.b) === 1 && g.a * g.a !== g.b && g.b * g.b !== g.a; });
          var a = g.a, b = g.b, A = L(a, 'x'), sgn = r.pick([1, 1, -1]), e = P.seq([L(a * a, 'x', 2), N(-b * b)]);
          var right = P.add(A, N(sgn * b)), other = P.add(A, N(-sgn * b));
          return mc(r, 'One factor of ' + t(e) + ' is', [
            { html: t(tx(P.add(A, N(sgn * b * b)))), why: 'The bracket uses the square <b>root</b> of ' + t(b * b) + ', which is ' + t(b) + ', not ' + t(b * b) + '.' },
            { html: t(tx(P.add(L(a * a, 'x'), N(sgn * b)))), why: 'Take the square root of ' + t(a * a + 'x^{2}') + ' too: it is ' + t(a + 'x') + '.' },
            { html: t(tx(right)), right: true },
            { html: t(tx(P.add(L(1, 'x'), N(sgn * b)))), why: t(a * a + 'x^{2}=(' + a + 'x)^{2}') + ', so each bracket starts with ' + t(a + 'x') + ', not ' + t('x') + '.' }],
            t(e + '=(' + a + 'x)^{2}-' + b + '^{2}=(' + a + 'x-' + b + ')(' + a + 'x+' + b + ')') + '. The only two factors are ' + t(tx(P.sub(A, N(b)))) + ' and ' + t(tx(P.add(A, N(b)))) + ', so the answer is ' + t(tx(right)) + '. (' + t(tx(other)) + ' is the other one.)',
            ['Write both terms as squares first.'], 'one factor of ' + plain(e));
        } }] },
      /* ---------- Q12 NR ---------- */
      { num: '12', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '12', level: 'PRG', make: function (r) {
          var g = pickWhere(function () { return { a: r.int(2, 9), b: r.int(2, 9) }; }, function (g) { return g.a !== g.b; });
          var a = g.a, b = g.b, plus = r.chance(0.75), f = P.seq([L(a, 'x'), L(plus ? b : -b, 'y')]), ans = a * a + b * b;
          return KP.nr(t(f) + ' is a factor of the binomial ' + t('a^{2}x^{2}-b^{2}y^{2}') + ', where ' + t('a') + ' and ' + t('b') + ' are positive. The value of ' + t('a^{2}+b^{2}') + ' is ____.', ans, function (v) {
            if (v === a + b) return { code: 'ab-sum', hint: 'You found ' + t('a') + ' and ' + t('b') + ' — now work out ' + t('a^{2}+b^{2}') + '.' };
            if (v === Math.abs(a * a - b * b)) return { code: 'ab-sum', hint: 'The question asks for ' + t('a^{2}+b^{2}') + ' — add the squares.' };
            if (v === (a + b) * (a + b)) return { code: 'ab-sum', hint: t('a^{2}+b^{2}') + ' is not ' + t('(a+b)^{2}') + ': square each one, then add.' };
            return null;
          }, t('a^{2}x^{2}-b^{2}y^{2}=(ax)^{2}-(by)^{2}=(ax-by)(ax+by)') + '. Matching ' + t(f) + ' with ' + t(plus ? 'ax+by' : 'ax-by') + ' gives ' + t('a=' + a) + ' and ' + t('b=' + b) + '.<br>' + t('a^{2}+b^{2}=' + a * a + '+' + b * b + '=' + ans) + '.',
            ['Factor ' + t('a^{2}x^{2}-b^{2}y^{2}') + ' as a difference of squares, then match it with the given factor.'], 'NR: ' + plain(f) + ' factor → a²+b²');
        } }] },
      /* ---------- Q13 error analysis ---------- */
      { num: '13', stem: 'Each student below claims to have factored completely. Identify and explain the error, then write the correct factored form (or state that it does not factor).',
        shared: function (r) {
          return { k: r.pick([2, 2, 3]), m: r.int(1, 5), b: pickWhere(function () { return { a: r.int(2, 5), b: r.int(1, 7) }; }, function (g) { return gcd(g.a, g.b) === 1; }), n: r.int(2, 9) };
        },
        parts: [
          { id: '13ai', sub: 'a i', level: 'EMG', make: function (r, sh) {
            var k = sh.k, m = sh.m, e = (k * k) + 'x^{2}-' + k * k * m * m, st = '(' + k + 'x-' + k * m + ')(' + k + 'x+' + k * m + ')';
            return mc(r, 'Student A: ' + t(e + '=' + st) + '. What is the error?', [
              { html: 'It isn’t factored completely: ' + t(k + 'x-' + k * m) + ' and ' + t(k + 'x+' + k * m) + ' each still contain a common factor of ' + t(k) + '.', right: true },
              { html: 'The product is wrong: ' + t(st) + ' does not equal ' + t(e) + '.', why: 'Expand it: ' + t(st + '=' + k * k + 'x^{2}+' + k * k * m + 'x-' + k * k * m + 'x-' + k * k * m * m + '=' + e) + '. The product is right.' },
              { html: 'A difference of squares should have the same sign in both brackets.', why: 'One minus and one plus bracket is right — that’s what makes the middle terms cancel.' },
              { html: t(e) + ' is not a difference of squares, so it can’t be factored.', why: t(k * k + 'x^{2}=(' + k + 'x)^{2}') + ' and ' + t(k * k * m * m + '=' + k * m + '^{2}') + ', so it is one.' }],
              'The student’s product is right, but it is not <b>complete</b>: each bracket still has a factor of ' + t(k) + '. Taking the GCF ' + t(k * k) + ' out first avoids this: ' + t(e + '=' + k * k + '(x^{2}-' + m * m + ')=' + k * k + '(x-' + m + ')(x+' + m + ')') + '.',
              ['Look inside each bracket: is there anything common to both terms?'], 'error: GCF left in brackets');
          } },
          { id: '13aii', sub: 'a ii', level: 'EMG', make: function (r, sh) {
            var k = sh.k, m = sh.m, kk = k * k;
            return fxPart(S(L(1, 'x'), N(m), 1, N(kk)), { prompt: 'Write the correct complete factorization of ' + t(kk + 'x^{2}-' + kk * m * m) + '.', bad: ['(' + k + 'x-' + k * m + ')(' + k + 'x+' + k * m + ')'] });
          } },
          { id: '13bi', sub: 'b i', level: 'BEG', make: function (r, sh) {
            var a = sh.b.a, b = sh.b.b, A = L(a, 'x'), T = sq(P.add(A, N(b)));
            var p = KP.poly('Student B: ' + t(P.seq([sq(A), N(b * b)]) + '=(' + tx(P.add(A, N(b))) + ')^{2}') + '. Expand ' + t('(' + tx(P.add(A, N(b))) + ')^{2}') + ' to check.', T, { wrong: [
              { is: P.add(sq(A), N(b * b)), code: 'square-middle', hint: t('(' + tx(P.add(A, N(b))) + ')^{2}') + ' means ' + t('(' + tx(P.add(A, N(b))) + ')(' + tx(P.add(A, N(b))) + ')') + ': four partial products, including two middle terms.' },
              { is: P.add(sq(A), L(a * b, 'x'), N(b * b)), code: 'middle-once', hint: 'There are <b>two</b> middle products, ' + t(a * b + 'x') + ' and ' + t(a * b + 'x') + ': add them.' }] },
              t('(' + tx(P.add(A, N(b))) + ')^{2}=' + P.seq([sq(A), L(a * b, 'x'), L(a * b, 'x'), N(b * b)]) + '=' + tx(T)) + '. It has a middle term ' + t(2 * a * b + 'x') + ', so it is <b>not</b> ' + t(P.seq([sq(A), N(b * b)])) + '.',
              ['Write the square as a product of two equal brackets and multiply.'], 'expand (' + plain(tx(P.add(A, N(b)))) + ')²');
            p.bad = [tx(P.add(sq(A), N(b * b)))];
            return p;
          } },
          { id: '13bii', sub: 'b ii', level: 'EMG', make: function (r, sh) {
            var a = sh.b.a, b = sh.b.b, A = L(a, 'x'), B = N(b), e = P.seq([sq(A), N(b * b)]);
            return mc(r, 'So what is the correct result for ' + t(e) + '?', [
              { html: 'It does not factor over the integers: it is a <b>sum</b> of squares.', right: true },
              { html: t(dosTex(A, B)), why: 'Expand it: you get ' + t(P.seq([sq(A), N(-b * b)])) + ', a <b>difference</b>.' },
              { html: t('(' + tx(P.sub(A, B)) + ')^{2}'), why: 'Expand it: ' + t(tx(sq(P.sub(A, B)))) + ' has a middle term.' },
              { html: t(dosTexR(A, B)) + ', written in the other order', why: 'Order doesn’t matter in a product — this still expands to ' + t(P.seq([sq(A), N(-b * b)])) + '.' }],
              t(e + '=' + sqTex(A) + '+' + sqTex(B)) + ' is a <b>sum</b> of squares. Two integers with a positive product have the same sign, so their sum can’t be ' + t('0') + ': it <b>does not factor</b>.',
              ['Is it a sum or a difference?'], 'sum of squares ' + plain(e) + ' doesn’t factor');
          } },
          { id: '13ci', sub: 'c i', level: 'EMG', make: function (r, sh) {
            var n = sh.n, e = 'x^{2}-' + n * n;
            return mc(r, 'Student C: ' + t(e + '=(x-' + n + ')^{2}') + '. What is the error?', [
              { html: t('(x-' + n + ')^{2}=x^{2}-' + 2 * n + 'x+' + n * n) + ': it has a middle term and ends in ' + t('+' + n * n) + '. A difference of squares needs one minus bracket and one plus bracket.', right: true },
              { html: 'The sign is wrong: it should be ' + t('(x+' + n + ')^{2}') + '.', why: 'Expand ' + t('(x+' + n + ')^{2}=x^{2}+' + 2 * n + 'x+' + n * n) + ': still a middle term, and ' + t('+' + n * n) + '.' },
              { html: t(e) + ' doesn’t factor, because it has no middle term.', why: 'A difference of squares has no middle term, and it <b>does</b> factor: try ' + t('(x-' + n + ')(x+' + n + ')') + '.' },
              { html: 'Nothing is wrong: ' + t('(x-' + n + ')^{2}') + ' is the same as ' + t('(x-' + n + ')(x+' + n + ')') + '.', why: t('(x-' + n + ')^{2}') + ' means ' + t('(x-' + n + ')(x-' + n + ')') + ' — both brackets have a minus sign.' }],
              t('(x-' + n + ')^{2}=(x-' + n + ')(x-' + n + ')=x^{2}-' + 2 * n + 'x+' + n * n) + ', which has a middle term. For ' + t(e) + ' the middle terms must cancel, so one bracket is minus and one is plus: ' + t('(x-' + n + ')(x+' + n + ')') + '.',
              ['Expand the student’s answer and compare.'], 'error: (x−n)² for x²−n²');
          } },
          { id: '13cii', sub: 'c ii', level: 'BEG', make: function (r, sh) { var n = sh.n; return fxPart(S(L(1, 'x'), N(n)), { prompt: 'Write the correct factored form of ' + t('x^{2}-' + n * n) + '.' }); } }] }
    ],
    extra: [
      /* ---------- Part A: more than one round ---------- */
      { num: '1', section: 'Extra practice A — Factoring completely: more than one round', stem: 'Each binomial is a difference of squares whose first bracket is itself a difference of squares. Factor completely.', parts: [
        { id: 'e1a', level: 'PRG', make: function (r) { return fxPart(S(L(1, r.pick(['x', 'x', 'y', 'n'])), N(r.pick([2, 3])), 2)); } },
        { id: 'e1b', level: 'EMG', make: function (r) { return fxPart(S(L(1, r.pick(['a', 'a', 'x', 'm', 't'])), N(1), 2)); } },
        { id: 'e1c', level: 'PRG', make: function (r) { return fxPart(S(N(r.pick([2, 3, 3])), L(1, r.pick(['y', 'y', 'x', 'k'])), 2)); } },
        { id: 'e1d', level: 'PRG', make: function (r) { return fxPart(S(L(1, r.pick(['m', 'm', 'x', 'p'])), N(r.pick([4, 5, 5, 6])), 2)); } }] },
      { num: '2', stem: 'These need <b>three</b> rounds. Keep going until no bracket is a difference of squares.', parts: [
        { id: 'e2a', level: 'PRG', make: function (r) { return fxPart(S(L(1, r.pick(['x', 'x', 'y', 'a'])), N(1), 3)); } },
        { id: 'e2b', level: 'ADV', make: function (r) { return fxPart(S(L(1, r.pick(['a', 'a', 'x', 'm'])), N(2), 3)); } },
        { id: 'e2c', level: 'ADV', make: function (r) { return fxPart(S(N(2), L(1, r.pick(['k', 'k', 'x', 'y'])), 3)); } }] },
      { num: '3', stem: function (sh) { return 'Factoring ' + t(sh.v + '^{8}-1') + ' completely gives four brackets: ' + t(targetOf(S(L(1, sh.v), N(1), 3))) + '.'; },
        shared: function (r) { return { v: r.pick(['x', 'x', 'a', 'y']) }; },
        parts: [
          { id: 'e3a', level: 'EMG', make: function (r, sh) {
            var v = sh.v;
            return mc(r, 'After each of the first two rounds, exactly one bracket could be factored again. Which one, and why is it always that one?', [
              { html: 'The <b>minus</b> bracket. Each round turns ' + t('A^{2}-B^{2}') + ' into ' + t('(A-B)(A+B)') + '; the plus bracket is a sum of squares, which never factors, while the minus bracket is a difference of squares again as long as both its terms are still perfect squares.', right: true },
              { html: 'The <b>plus</b> bracket, because a plus sign means the terms can be split up again.', why: t(v + '^{4}+1') + ' and ' + t(v + '^{2}+1') + ' are <b>sums</b> of squares — they never factor over the integers.' },
              { html: 'The <b>minus</b> bracket, because a bracket with a minus sign can always be factored.', why: t('(' + v + '-1)') + ' has a minus sign but can’t be factored. The minus bracket factors only while both its terms are perfect squares.' },
              { html: 'Either one — you can choose which bracket to factor next.', why: 'Try factoring ' + t(v + '^{4}+1') + ' as a difference of squares: it isn’t one. Only the minus bracket can be factored again.' }],
              'Each round gives a minus bracket and a plus bracket. The plus bracket ' + t('A+B') + ' is a sum of squares and stops. The minus bracket factors again while both terms are perfect squares: ' + t(v + '^{4}-1') + ', then ' + t(v + '^{2}-1') + '; once it reaches ' + t(v + '-1') + ' it stops.',
              ['Look at the brackets after each round: which ones are differences, which are sums?'], 'which bracket factors again');
          } },
          { id: 'e3b', level: 'PRG', make: function (r, sh) {
            var v = sh.v;
            return mc(r, 'Which is a correct test that you are finished, and the reason ' + t(v + '^{4}+1') + ' is the end of the line?', [
              { html: 'Check every bracket: none is a difference of squares and none has a common factor. ' + t(v + '^{4}+1=(' + v + '^{2})^{2}+1^{2}') + ' is a sum of squares, so it does not factor.', right: true },
              { html: 'Expand your answer: if it gives back ' + t(v + '^{8}-1') + ', you are finished. ' + t(v + '^{4}+1') + ' is the end because its exponent is even.', why: 'Expanding checks the answer is <b>correct</b>, not that it is <b>complete</b> — ' + t('(' + v + '^{4}-1)(' + v + '^{4}+1)') + ' also expands to ' + t(v + '^{8}-1') + '.' },
              { html: 'Stop when every bracket has degree ' + t('1') + '. ' + t(v + '^{4}+1') + ' is finished because it can’t be divided by ' + t(v) + '.', why: t(v + '^{4}+1') + ' has degree ' + t('4') + ' and is still finished: a sum of squares doesn’t factor.' },
              { html: 'Stop when there are four brackets. ' + t(v + '^{4}+1=(' + v + '^{2}+1)^{2}') + ', which is already a square.', why: t('(' + v + '^{2}+1)^{2}=' + v + '^{4}+2' + v + '^{2}+1') + ' — not the same. And the number of brackets isn’t the test.' }],
              '<b>Test:</b> look at every bracket — the answer is finished when no bracket is a difference of squares and no bracket has a common factor. (Expanding back to ' + t(v + '^{8}-1') + ' checks that it is <b>correct</b>.)<br>' + t(v + '^{4}+1=(' + v + '^{2})^{2}+1^{2}') + ' is a <b>sum</b> of squares: no two integers have product ' + t('1') + ' and sum ' + t('0') + ', so it does not factor.',
              ['“Correct” and “complete” are different checks.'], 'test for complete factoring');
          } }] },
      /* ---------- Part B: GCF first ---------- */
      { num: '4', section: 'Extra practice B — Take the common factor out first', stem: 'None of these is a difference of squares as written — each becomes one after the GCF is removed. Factor completely.', parts: [
        { id: 'e4a', level: 'BEG', make: function (r) { return fxPart(S(L(1, 'x'), N(r.int(2, 9)), 1, N(r.pick([2, 2, 3, 5, 7])))); } },
        { id: 'e4b', level: 'PRG', make: function (r) { var k = r.pick([2, 3, 3, 5]); return fxPart(S(L(1, 'x'), N(r.int(2, 6)), 1, L(k, 'x'))); } },
        { id: 'e4c', level: 'PRG', make: function (r) { var k = r.pick([2, 5, 5, 7]), v = r.pick(['a', 'a', 'm', 'y']); return fxPart(S(L(1, v), N(r.int(2, 6)), 1, L(k, v))); } },
        { id: 'e4d', level: 'PRG', make: function (r) { var v = r.pick([['p', 'q'], ['p', 'q'], ['x', 'y'], ['a', 'b']]); return fxPart(S(L(1, v[0]), L(r.int(2, 4), v[1]), 1, L(r.pick([2, 3, 5, 7, 7]), v[1]))); } },
        { id: 'e4e', level: 'PRG', make: function (r) { return fxPart(S(L(1, 'x'), N(r.pick([2, 2, 3])), 2, N(r.pick([2, 2, 3, 5])))); } },
        { id: 'e4f', level: 'PRG', make: function (r) { var v = r.pick(['a', 'a', 'x', 'm']); return fxPart(S(L(1, v), N(r.pick([2, 2, 3])), 2, L(1, v))); } }] },
      { num: '5', stem: 'Remove the GCF first. This time <b>some of them stop there</b> — what is left may be a sum of squares. Factor completely.', parts: [
        { id: 'e5a', level: 'EMG', make: function (r) { return fxPart(S(L(1, 'x'), N(r.int(2, 5)), 0, N(r.pick([4, 4, 2, 3, 5])))); } },
        { id: 'e5b', level: 'EMG', make: function (r) { var v = r.pick(['y', 'y', 'x', 'a']); return fxPart(S(L(1, v), N(r.int(2, 4)), 0, L(r.pick([3, 3, 2, 5]), v))); } },
        { id: 'e5c', level: 'BEG', make: function (r) { return fxPart(S(L(1, r.pick(['m', 'm', 'x'])), N(r.int(2, 6)), 1, N(r.pick([6, 6, 2, 3, 7])))); } },
        { id: 'e5d', level: 'PRG', make: function (r) { var v = r.pick(['t', 't', 'x', 'p']); return fxPart(S(L(1, v), N(r.int(2, 6)), 1, L(r.pick([2, 2, 3, 5]), v, 2))); } },
        { id: 'e5e', level: 'EMG', make: function (r) { return fxPart(S(L(1, 'x'), N(r.int(2, 5)), 0, N(r.pick([5, 5, 2, 3, 7])))); } },
        { id: 'e5f', level: 'ADV', make: function (r) { var v = r.pick(['m', 'm', 'x', 'y']); return fxPart(S(N(r.pick([2, 2, 3])), L(1, v), 2, L(r.pick([3, 3, 2, 5]), v))); } }] },
      { num: '6', stem: function (sh) { return 'A student writes ' + t(sh.k + 'x^{2}-' + sh.k * sh.n * sh.n + '=' + sh.k + '(x^{2}-' + sh.n * sh.n + ')') + ' and stops.'; },
        shared: function (r) { return { k: r.pick([2, 2, 3, 5, 6, 7]), n: r.int(2, 9) }; },
        parts: [
          { id: 'e6a', level: 'EMG', make: function (r, sh) {
            var k = sh.k, n = sh.n, n2 = n * n;
            return mc(r, 'Their line is true, but it is not an answer to “factor completely.” Which statement is right?', [
              { html: '“Factor completely” means no bracket may factor further, and ' + t('x^{2}-' + n2) + ' is still a difference of squares: ' + t(k + '(x-' + n + ')(x+' + n + ')') + '.', right: true },
              { html: 'The GCF is wrong: it should be ' + t(k * n2) + ', giving ' + t(k * n2 + '\\left(\\frac{x^{2}}{' + n2 + '}-1\\right)') + '.', why: t(k * n2) + ' doesn’t divide ' + t(k + 'x^{2}') + ' to give a polynomial term with an integer coefficient. The GCF ' + t(k) + ' is right; the bracket is the problem.' },
              { html: 'Nothing is wrong: the bracket ' + t('x^{2}-' + n2) + ' has no common factor, so it is complete.', why: 'No common factor is only half the test: ' + t('x^{2}-' + n2 + '=x^{2}-' + n + '^{2}') + ' is a difference of squares and still factors.' },
              { html: 'The bracket should be ' + t('(x-' + n + ')^{2}') + ', giving ' + t(k + '(x-' + n + ')^{2}') + '.', why: t('(x-' + n + ')^{2}=x^{2}-' + 2 * n + 'x+' + n2) + ' has a middle term. Use one minus and one plus bracket.' }],
              '“Factor completely” means no bracket may factor any further, and ' + t('x^{2}-' + n2 + '=x^{2}-' + n + '^{2}') + ' is still a difference of squares:<br>' + t(k + 'x^{2}-' + k * n2 + '=' + k + '(x^{2}-' + n2 + ')=' + k + '(x-' + n + ')(x+' + n + ')') + '.',
              ['Look at the bracket: is it a difference of squares?'], 'stopped after the GCF');
          } },
          { id: 'e6b', level: 'PRG', make: function (r, sh) {
            var k = sh.k, n = sh.n, e = k + 'x^{2}-' + k * n * n;
            return mc(r, 'A second student misses the common factor and writes ' + t(e + '=(' + k + 'x-\\ ?\\ )(' + k + 'x+\\ ?\\ )') + '. Why can no integer fill those blanks?', [
              { html: 'Whatever integer ' + t('c') + ' goes in, ' + t('(' + k + 'x-c)(' + k + 'x+c)=' + k * k + 'x^{2}-c^{2}') + ', whose first term is ' + t(k * k + 'x^{2}') + ', not ' + t(k + 'x^{2}') + ': ' + t(k + 'x^{2}') + ' isn’t a perfect square.', right: true },
              { html: 'Because ' + t(e) + ' is a sum of squares.', why: 'There is a minus sign: it is a difference. The trouble is the first term, ' + t(k + 'x^{2}') + '.' },
              { html: 'Because the two blanks need different numbers, one positive and one negative.', why: 'In a difference of squares the two brackets use the <b>same</b> number with opposite signs.' },
              { html: 'They can: ' + t('c=' + Math.round(Math.sqrt(k * n * n) * 100) / 100) + ' works if you round.', why: 'An integer is needed, and even then ' + t('(' + k + 'x)^{2}=' + k * k + 'x^{2}') + ', not ' + t(k + 'x^{2}') + '.' }],
              t('(' + k + 'x-c)(' + k + 'x+c)=' + k * k + 'x^{2}-c^{2}') + ' for any ' + t('c') + ', and its first term is ' + t(k * k + 'x^{2}') + ', not ' + t(k + 'x^{2}') + '. The first term of a difference of squares must be a perfect square, and ' + t(k + 'x^{2}') + ' isn’t. Take the common factor ' + t(k) + ' out first.',
              ['Multiply ' + t('(' + k + 'x-c)(' + k + 'x+c)') + ' for a general number ' + t('c') + '.'], 'why (kx−?)(kx+?) fails');
          } }] },
      /* ---------- Part C: difference or sum ---------- */
      { num: '7', section: 'Extra practice C — Difference or sum?', stem: 'Factor completely <b>where possible</b>.',
        shared: function (r) {
          var ab = pickWhere(function () { return { a: r.int(2, 6), b: r.int(2, 7) }; }, function (g) { return gcd(g.a, g.b) === 1; });
          return { a: ab.a, b: ab.b, k: r.pick([8, 8, 2, 3, 5, 7]), n: r.int(2, 5), c: r.int(2, 9) };
        },
        parts: [
          { id: 'e7a', level: 'PRG', make: function (r, sh) { return fxPart(S(L(sh.a, 'm'), L(sh.b, 'n'))); } },
          { id: 'e7b', level: 'BEG', make: function (r, sh) { return sumSqMC(r, L(sh.a, 'm'), L(sh.b, 'n')); } },
          { id: 'e7c', level: 'EMG', make: function (r, sh) { return fxPart(S(L(1, 'x'), N(sh.n), 0, N(sh.k))); } },
          { id: 'e7d', level: 'BEG', make: function (r, sh) { return fxPart(S(L(1, 'x'), N(sh.n), 1, N(sh.k))); } },
          { id: 'e7e', level: 'EMG', make: function (r, sh) { return sumSqMC(r, L(sh.c, 'uv'), N(1)); } },
          { id: 'e7f', level: 'EMG', make: function (r, sh) { return fxPart(S(L(sh.c, 'uv'), N(1))); } }] },
      { num: '8', stem: function (sh) { return '<i>(Error analysis)</i> A student writes ' + t('x^{2}+' + sh.n * sh.n + '=(x+' + sh.n + ')(x-' + sh.n + ')') + '.'; },
        shared: function (r) { return { n: r.int(2, 9) }; },
        parts: [
          { id: 'e8a', level: 'BEG', make: function (r, sh) {
            var n = sh.n, T = P.parse('x^2-' + n * n);
            var p = KP.poly('Expand ' + t('(x+' + n + ')(x-' + n + ')') + '. What does it actually equal?', T, { wrong: [{ is: P.parse('x^2+' + n * n), code: 'dsq-sign', hint: 'The last terms are ' + t('+' + n) + ' and ' + t('-' + n) + ': their product is <b>negative</b>.' }] },
              t('(x+' + n + ')(x-' + n + ')=x^{2}-' + n + 'x+' + n + 'x-' + n * n + '=x^{2}-' + n * n) + ', not ' + t('x^{2}+' + n * n) + '.', ['Use FOIL; the middle terms cancel.'], 'expand (x+' + n + ')(x-' + n + ')');
            p.bad = ['x^2+' + n * n];
            return p;
          } },
          { id: 'e8b', level: 'BEG', make: function (r, sh) {
            var n = sh.n, v1 = 1 + n * n, v2 = (1 + n) * (1 - n);
            var p = KP.fields('Substitute ' + t('x=1') + ' into both ' + t('x^{2}+' + n * n) + ' and the student’s answer.', [nbox(t('x^{2}+' + n * n) + ' at ' + t('x=1') + ':', 'Original at x = 1'), nbox('Student’s answer at ' + t('x=1') + ':', 'Student at x = 1')],
              [K.number(v1), K.number(v2, function (v) { return v === -v2 ? { code: 'sub-value', hint: t('(1+' + n + ')(1-' + n + ')=(' + (1 + n) + ')(' + (1 - n) + ')') + ': a positive times a negative.' } : null; })],
              [String(v1), String(v2)], t(v1) + ' and ' + t(v2),
              t('x^{2}+' + n * n + '\\to 1+' + n * n + '=' + v1) + '<br>Student: ' + t('(1+' + n + ')(1-' + n + ')=(' + (1 + n) + ')(' + (1 - n) + ')=' + v2) + '<br>' + t(v1 + '\\neq ' + v2) + ', so the two expressions are <b>not equal</b>. One counterexample proves the factoring is wrong.',
              ['Replace every ' + t('x') + ' with ' + t('1') + '.'], 'substitute x=1');
            p.bad = [[String(v1), String(v1)]];
            return p;
          } },
          { id: 'e8c', level: 'EMG', make: function (r, sh) {
            var n = sh.n, n2 = n * n;
            return mc(r, 'Using “two integers with product ' + t(n2) + ' and sum ' + t('0') + '”, why does ' + t('x^{2}+' + n2) + ' have no factoring over the integers?', [
              { html: 'There is no ' + t('x') + ' term, so the sum must be ' + t('0') + '. Two integers with a <b>positive</b> product have the same sign, so their sum can’t be ' + t('0') + '.', right: true },
              { html: 'Because ' + t(n2) + ' is not a perfect square.', why: t(n2 + '=' + n + '^{2}') + ' is a perfect square. The problem is the plus sign.' },
              { html: 'Because ' + t(n) + ' and ' + t('-' + n) + ' have sum ' + t('0') + ' but product ' + t(-n2) + ', and that is the only pair to check.', why: 'That pair fails, but you must rule out <b>every</b> pair with product ' + t(n2) + '. The key fact: a positive product means the same sign, so the sum is never ' + t('0') + '.' },
              { html: 'Because ' + t('x^{2}+' + n2) + ' has only two terms.', why: t('x^{2}-' + n2) + ' also has two terms and it factors.' }],
              'A factoring ' + t('(x+p)(x+q)') + ' would need ' + t('pq=' + n2) + ' and ' + t('p+q=0') + ' (there is no ' + t('x') + ' term). A positive product means ' + t('p') + ' and ' + t('q') + ' have the <b>same</b> sign, so ' + t('p+q\\neq 0') + '. No such pair exists: ' + t('x^{2}+' + n2) + ' does not factor.',
              ['What sign do two integers with a positive product have?'], 'why x²+' + n2 + ' does not factor');
          } }] },
      { num: '9', stem: function (sh) { var n = sh.n; return '<i>(Error analysis)</i> Asked to factor ' + t('x^{4}-' + n * n * n * n) + ' completely, a student writes ' + t('x^{4}-' + n * n * n * n + '=(x^{2}-' + n * n + ')(x^{2}+' + n * n + ')') + ' and stops.'; },
        shared: function (r) { return { n: r.pick([2, 3, 3, 4]) }; },
        parts: [
          { id: 'e9a', level: 'BEG', make: function (r, sh) {
            var n = sh.n, n2 = n * n, T = P.parse('x^4-' + n2 * n2);
            var p = KP.poly('Is the line they wrote correct? Expand ' + t('(x^{2}-' + n2 + ')(x^{2}+' + n2 + ')') + ' and check.', T, { wrong: [{ is: P.parse('x^4+' + n2 * n2), code: 'dsq-sign', hint: 'The last terms are ' + t('-' + n2) + ' and ' + t('+' + n2) + ': their product is negative.' }, { is: P.parse('x^4-' + 2 * n2 * n2), code: 'sub-value', hint: t(n2 + '\\times ' + n2 + '=' + n2 * n2) + '.' }] },
              t('(x^{2}-' + n2 + ')(x^{2}+' + n2 + ')=x^{4}+' + n2 + 'x^{2}-' + n2 + 'x^{2}-' + n2 * n2 + '=x^{4}-' + n2 * n2) + ' ✓<br><b>Correct</b> — but not complete.', ['Multiply each term of the first bracket by each term of the second.'], 'expand (x²−' + n2 + ')(x²+' + n2 + ')');
            p.bad = ['x^4+' + n2 * n2];
            return p;
          } },
          { id: 'e9b', level: 'PRG', make: function (r, sh) { return fxPart(S(L(1, 'x'), N(sh.n), 2), { prompt: 'Finish the question properly: factor ' + t('x^{4}-' + Math.pow(sh.n, 4)) + ' completely.' }); } },
          { id: 'e9c', level: 'EMG', make: function (r, sh) {
            var n = sh.n;
            return mc(r, 'Compare with the student in question 8, who wrote something like ' + t('x^{2}+25=(x+5)(x-5)') + '. They made opposite mistakes. Which describes them?', [
              { html: 'Question 8: factored something that <b>does not factor</b> (a sum of squares). Question 9: <b>stopped too soon</b>, leaving a difference of squares unfactored.', right: true },
              { html: 'Question 8: stopped too soon. Question 9: factored a sum of squares that doesn’t factor.', why: 'Swap them: ' + t('x^{2}+25') + ' is the sum of squares; ' + t('x^{2}-' + n * n) + ' is the bracket that was left unfactored.' },
              { html: 'Both students forgot to take out a common factor.', why: 'Neither expression has a common factor. Look at what kind of bracket each one is.' },
              { html: 'Both students made sign errors inside the brackets.', why: 'Question 9’s line is correct — it just isn’t finished. Question 8’s problem isn’t a sign slip: a sum of squares has no factoring at all.' }],
              'Student 8 factored something that <b>does not factor</b> (a sum of squares). Student 9 <b>stopped too soon</b>: ' + t('x^{2}-' + n * n) + ' is still a difference of squares, so ' + t('x^{4}-' + Math.pow(n, 4) + '=(x-' + n + ')(x+' + n + ')(x^{2}+' + n * n + ')') + '.',
              ['One factored too much, one too little.'], 'opposite mistakes');
          } }] },
      /* ---------- Part D: coefficients, two variables, fractions ---------- */
      { num: '10', section: 'Extra practice D — Coefficients, two variables and fractions', stem: 'Factor completely. Every term is a perfect square, but the square roots involve coefficients, two variables, or both.', parts: [
        { id: 'e10a', level: 'ADV', make: function (r) { var g = r.pick([[2, 3], [2, 3], [1, 2], [1, 3], [2, 5], [3, 5]]); return fxPart(S(L(g[0], 'x'), L(g[1], 'y'), 2)); } },
        { id: 'e10b', level: 'ADV', make: function (r) { var g = r.pick([[3, 2], [3, 2], [2, 1], [3, 1], [5, 2], [5, 3]]); return fxPart(S(L(g[0], 'a'), L(g[1], 'b'), 2)); } },
        { id: 'e10c', level: 'PRG', make: function (r) { return fxPart(S(L(1, r.pick(['xy', 'xy', 'ab', 'mn'])), N(r.pick([2, 2, 3])), 2)); } },
        { id: 'e10d', level: 'ADV', make: function (r) { var v = r.pick([['a', 'b'], ['a', 'b'], ['x', 'y'], ['m', 'n']]); return fxPart(S(L(1, v[0]), L(1, v[1]), 3)); } }] },
      { num: '11', stem: 'A fraction can be a perfect square too: ' + t('\\frac{1}{4}=\\left(\\frac{1}{2}\\right)^{2}') + '. Factor each of the following.', parts: [
        { id: 'e11a', level: 'EMG', make: function (r) { var a = r.int(2, 9), c = r.int(2, 5); return fracPart(L(a, 'm'), L([1, c], 'n')); } },
        { id: 'e11b', level: 'PRG', make: function (r) { var g = pickWhere(function () { return [r.int(2, 6), r.int(2, 6)]; }, function (g) { return g[0] !== g[1]; }); return fracPart(L([1, g[0]], 'a'), L([1, g[1]], 'b')); } },
        { id: 'e11c', level: 'PRG', make: function (r) { var g = pickWhere(function () { return [r.int(1, 3), r.int(2, 5), r.int(1, 5), r.int(2, 6)]; }, function (g) { return gcd(g[0], g[1]) === 1 && gcd(g[2], g[3]) === 1 && (g[0] > 1 || g[2] > 1) && g[1] !== g[3] && Math.abs(FX.content(P.sub(L([g[0], g[1]], 'p'), L([g[2], g[3]], 'q'))).c[0]) === 1; }); return fracPart(L([g[0], g[1]], 'p'), L([g[2], g[3]], 'q')); } }] },
      { num: '12', stem: function (sh) { var a = sh.a, c = sh.c; return 'A question like 11(a) can have two correct-looking answers, for example ' + t('\\left(' + a + 'm-\\frac{1}{' + c + '}n\\right)\\left(' + a + 'm+\\frac{1}{' + c + '}n\\right)') + ' and ' + t('\\frac{1}{' + c * c + '}(' + a * c + 'm-n)(' + a * c + 'm+n)') + '.'; },
        shared: function (r) { return { a: r.int(2, 9), c: r.int(2, 5) }; },
        parts: [
          { id: 'e12a', level: 'EMG', make: function (r, sh) {
            var a = sh.a, c = sh.c, T = P.sub(L(a * a, 'm', 2), L([1, c * c], 'n', 2));
            var p = KP.poly('Expand the second form, ' + t('\\frac{1}{' + c * c + '}(' + a * c + 'm-n)(' + a * c + 'm+n)') + '. (The first form expands to the same thing.)', T, { wrong: [
              { is: P.sub(L(a * a * c * c, 'm', 2), L(1, 'n', 2)), code: 'lost-half', hint: 'Don’t forget to multiply by ' + t('\\frac{1}{' + c * c + '}') + ' at the end.' },
              { is: P.sub(L(a * a * c, 'm', 2), L([1, c], 'n', 2)), code: 'sub-value', hint: t('\\frac{1}{' + c * c + '}\\times ' + a * a * c * c + '=' + a * a) + ' — divide by ' + t(c * c) + ', not ' + t(c) + '.' }] },
              t('\\frac{1}{' + c * c + '}(' + a * c + 'm-n)(' + a * c + 'm+n)=\\frac{1}{' + c * c + '}(' + a * a * c * c + 'm^{2}-n^{2})=' + tx(T)) + '<br>The first form: ' + t('\\left(' + a + 'm\\right)^{2}-\\left(\\frac{1}{' + c + '}n\\right)^{2}=' + tx(T)) + '. They agree.',
              ['Multiply the brackets first (sum × difference), then multiply by the fraction.'], 'expand 1/' + c * c + '(' + a * c + 'm−n)(' + a * c + 'm+n)');
            p.bad = [tx(P.sub(L(a * a * c * c, 'm', 2), L(1, 'n', 2)))];
            return p;
          } },
          { id: 'e12b', sub: 'b i', level: 'EMG', make: function (r, sh) {
            return mc(r, 'The second form was found by removing the fractional common factor first. Which reason for preferring it is best?', [
              { html: 'Taking the fractional common factor out first leaves whole-number brackets, which are easier to read and to check.', right: true },
              { html: 'The first form is wrong, because brackets can never contain fractions.', why: 'Both forms are correct — they expand to the same polynomial. The second is just tidier.' },
              { html: 'The second form has fewer terms when expanded.', why: 'Both expand to exactly the same polynomial.' },
              { html: 'The second form doesn’t need the difference of squares pattern.', why: 'It does: ' + t('(' + sh.a * sh.c + 'm-n)(' + sh.a * sh.c + 'm+n)') + ' is a difference of squares factored.' }],
              'Both forms are correct. The second is easier to hand in: taking the fractional common factor ' + t('\\frac{1}{' + sh.c * sh.c + '}') + ' out first leaves whole-number brackets that are easier to read and check.',
              ['Do both forms expand to the same thing?'], 'why take the fraction out');
          } },
          { id: 'e12c', sub: 'b ii', level: 'ADV', make: function (r) {
            var g = pickWhere(function () { return [r.int(1, 3), r.int(2, 4), r.int(1, 5), r.int(2, 4)]; }, function (g) { var Lc0 = g[1] * g[3] / gcd(g[1], g[3]); return gcd(g[0], g[1]) === 1 && gcd(g[2], g[3]) === 1 && (g[0] > 1 || g[2] > 1) && g[1] !== g[3] && g[0] * g[3] !== g[2] * g[1] && gcd(g[0] * Lc0 / g[1], g[2] * Lc0 / g[3]) === 1 && Lc0 <= 6; });
            var A = L([g[0], g[1]], 'p'), B = L([g[2], g[3]], 'q'), Lc = g[1] * g[3] / gcd(g[1], g[3]), Lc2 = Lc * Lc;
            var a2 = g[0] * Lc / g[1], b2 = g[2] * Lc / g[3], A2 = L(a2, 'p'), B2 = L(b2, 'q'), e = P.seq([sq(A), P.neg(sq(B))]);
            var target = '\\frac{1}{' + Lc2 + '}' + dosTex(A2, B2);
            return factPart('Write ' + t(e) + ' in that form: take the fractional common factor out first, then factor.', target, [
              { is: dosTex(A2, B2), code: 'lost-gcf', hint: 'Keep the common factor ' + t('\\frac{1}{' + Lc2 + '}') + ' in front of the brackets.' },
              { is: '\\frac{1}{' + Lc + '}' + dosTex(A2, B2), code: 'gcf-one', hint: 'Check the fraction in front: ' + t('\\frac{1}{' + Lc2 + '}\\times ' + a2 * a2 + 'p^{2}=' + tx(sq(A))) + '. The common factor is ' + t('\\frac{1}{' + Lc2 + '}') + ', the square of ' + t('\\frac{1}{' + Lc + '}') + '.' }],
              'Take out ' + t('\\frac{1}{' + Lc2 + '}') + ' (the lowest common denominator):<br>' + t(e + '=\\frac{1}{' + Lc2 + '}(' + P.seq([sq(A2), P.neg(sq(B2))]) + ')') + '<br>' + t('=\\frac{1}{' + Lc2 + '}\\left[' + sqTex(A2) + '-' + sqTex(B2) + '\\right]=' + target),
              ['Find the common denominator of the two fractions and take ' + t('\\frac{1}{\\text{LCD}}') + ' out first.', 'The bracket that is left has whole-number coefficients — factor it as a difference of squares.'], 'fraction out first: ' + plain(e),
              { good: ['\\frac{(' + P.seq([A2, P.neg(B2)]) + ')(' + P.seq([A2, B2]) + ')}{' + Lc2 + '}'], bad: [dosTex(A, B)], wrap: fracOut(Lc2) });
          } }] },
      /* ---------- Part E: expressions as squares ---------- */
      { num: '13', section: 'Extra practice E — When each “square” is an expression', stem: 'In ' + t('a^{2}-b^{2}=(a-b)(a+b)') + ' the letters may stand for whole brackets. Factor, then <b>simplify inside each bracket</b>.', parts: [
        { id: 'e13a', level: 'PRG', make: function (r) { var g = pickWhere(function () { return { p: r.int(1, 6), n: r.int(2, 8) }; }, function (g) { return g.p !== g.n; }); return bracketPart(P.add(L(1, 'x'), N(g.p)), N(g.n)); } },
        { id: 'e13b', level: 'PRG', make: function (r) { var g = pickWhere(function () { return { p: r.int(1, 7), n: r.int(2, 8) }; }, function (g) { return g.p !== g.n; }); return bracketPart(P.sub(L(1, 'y'), N(g.p)), N(g.n)); } },
        { id: 'e13c', level: 'PRG', make: function (r) { var g = pickWhere(function () { return { k: r.pick([2, 2, 3]), p: r.int(1, 5), n: r.int(2, 5) }; }, function (g) { return gcd(g.k, g.p) === 1; }); return bracketPart(P.add(L(g.k, 'a'), N(g.p)), L(g.n, 'b')); } },
        { id: 'e13d', level: 'ADV', make: function (r) {
          var k = r.pick([1, 1, 2, 3]), v = r.pick([['m', 'n'], ['m', 'n'], ['x', 'y'], ['a', 'b']]), A = P.add(L(1, v[0]), L(k, v[1])), B = P.sub(L(1, v[0]), L(k, v[1]));
          var e = '(' + tx(A) + ')^{2}-(' + tx(B) + ')^{2}', T = P.sub(sq(A), sq(B)), la = v[0] === 'a' ? 'A' : 'a', lb = v[0] === 'a' ? 'B' : 'b';
          var p = KP.poly(t(e), T, { wrong: [{ is: P.scale(T, -1), code: 'rev-order', hint: 'Your answer is the opposite: it comes from ' + t('(' + tx(B) + ')^{2}-(' + tx(A) + ')^{2}') + '. Keep ' + t(la + '=' + tx(A)) + ' (the first square) first.' }, { is: N(0), code: 'minus-bracket', hint: 'Check the first bracket: ' + t('(' + tx(A) + ')-(' + tx(B) + ')=' + tx(A) + '-' + tx(L(1, v[0])) + '+' + tx(L(k, v[1])) + '=' + tx(P.sub(A, B))) + '. Subtracting a bracket changes the sign of <b>every</b> term in it.' }] },
            t(e + '=\\left[(' + tx(A) + ')-(' + tx(B) + ')\\right]\\left[(' + tx(A) + ')+(' + tx(B) + ')\\right]') + '<br>' + t('=(' + tx(P.sub(A, B)) + ')(' + tx(P.add(A, B)) + ')=' + tx(T)),
            ['Let ' + t(la + '=' + tx(A)) + ' and ' + t(lb + '=' + tx(B)) + ' and use ' + t('(' + la + '-' + lb + ')(' + la + '+' + lb + ')') + '.', 'Simplify each bracket: subtracting a bracket changes the sign of every term in it.'], 'factor ' + plain(e));
          p.good = [tx(P.mul(L(2 * k, v[1]), L(2, v[0])))];
          p.bad = [tx(P.scale(T, -1)), '0', '(' + tx(P.sub(A, B)) + ')(' + tx(P.add(A, B)) + ')'];
          return p;
        } }] },
      { num: '14', stem: 'Same idea, but in most of these, once you simplify the brackets a <b>common factor appears inside one or both</b>. Take it out — they are not complete until you do.', parts: [
        { id: 'e14a', level: 'ADV', make: function (r) { var g = pickWhere(function () { return { a: r.int(2, 4), p: r.int(1, 8) }; }, function (g) { return bkK(L(g.a, 'x'), P.add(L(1, 'x'), N(g.p))) > 1; }); return bracketPart(L(g.a, 'x'), P.add(L(1, 'x'), N(g.p))); } },
        { id: 'e14b', level: 'PRG', make: function (r) { var g = pickWhere(function () { return { n: r.int(2, 7), p: r.int(1, 6) }; }, function (g) { return g.n !== g.p; }); return bracketPart(N(g.n), P.sub(L(1, 'y'), N(g.p))); } },
        { id: 'e14c', level: 'ADV', make: function (r) { var g = pickWhere(function () { return { a: r.pick([3, 5, 5, 7]), q: r.pick([2, 2, 4, 6]) }; }, function (g) { var A = L(g.a, 'p'), B = P.sub(L(1, 'p'), N(g.q)); return bkGs(A, B)[0] > 1 && bkGs(A, B)[1] > 1; }); return bracketPart(L(g.a, 'p'), P.sub(L(1, 'p'), N(g.q))); } },
        { id: 'e14d', level: 'ADV', make: function (r) { var g = pickWhere(function () { return { a: r.int(3, 6), b: r.int(1, 3), c: 2 * r.int(1, 4) }; }, function (g) { if (g.a <= g.b) return false; var A = L(g.a, 't'), B = P.add(L(g.b, 't'), N(g.c)), gs = bkGs(A, B); return gs[0] > 1 && gs[1] > 1 && gs[0] * gs[1] >= 4; }); return bracketPart(L(g.a, 't'), P.add(L(g.b, 't'), N(g.c))); } }] },
      { num: '15', stem: 'Evaluate each <b>without a calculator and without squaring either number</b> — write it as ' + t('a^{2}-b^{2}') + ', factor, then multiply.', parts: [
        { id: 'e15a', level: 'EMG', make: function (r) { var m = r.pick([100, 100, 50, 200]), d = r.int(1, 3); return squaresPart(m + d, m - d); } },
        { id: 'e15b', level: 'EMG', make: function (r) { var g = pickWhere(function () { return [50 * r.int(2, 8), 50 * r.int(1, 6)]; }, function (g) { return g[0] > g[1]; }); return squaresPart(g[0], g[1]); } },
        { id: 'e15c', level: 'EMG', make: function (r) { var a = r.pick([55, 65, 75, 85, 85, 95]); return squaresPart(a, 100 - a); } },
        { id: 'e15d', level: 'EMG', make: function (r) { var g = pickWhere(function () { var s = 10 * r.int(4, 9), a = r.int(Math.ceil(s / 2) + 3, s - 11); return [a, s - a]; }, function (g) { return g[0] % 5 !== 0 && g[1] % 5 !== 0 && g[1] >= 11; }); return squaresPart(g[0], g[1]); } },
        { id: 'e15e', sub: 'e', level: 'EMG', make: function (r) {
          var a = r.int(31, 59), b = r.int(11, 29);
          return mc(r, 'Why is the same shortcut useless for ' + t(a + '^{2}+' + b + '^{2}') + '?', [
            { html: 'The shortcut works only because ' + t('a^{2}-b^{2}') + ' factors into ' + t('(a-b)(a+b)') + '. A <b>sum</b> of squares has no factored form over the integers, so you are stuck squaring both numbers and adding.', right: true },
            { html: 'It works: ' + t(a + '^{2}+' + b + '^{2}=(' + a + '+' + b + ')(' + a + '+' + b + ')') + '.', why: t('(' + a + '+' + b + ')^{2}') + ' is ' + t(a + '^{2}+2(' + a + ')(' + b + ')+' + b + '^{2}') + ' — it has an extra middle part.' },
            { html: 'Because ' + t(a) + ' and ' + t(b) + ' are too far apart.', why: 'For a difference, ' + t(a + '^{2}-' + b + '^{2}=(' + (a - b) + ')(' + (a + b) + ')') + ' works no matter how far apart they are. It’s the plus sign that blocks it.' },
            { html: 'Because ' + t(a + b) + ' isn’t a multiple of ' + t('10') + '.', why: 'Round numbers make the multiplying easier, but they aren’t the reason. A sum of squares just doesn’t factor.' }],
            'The shortcut turns a subtraction of squares into one product because ' + t('a^{2}-b^{2}=(a-b)(a+b)') + '. A sum of squares does not factor, so there is nothing to turn ' + t(a + '^{2}+' + b + '^{2}') + ' into: you must square and add, ' + t(F(a * a) + '+' + F(b * b) + '=' + F(a * a + b * b)) + '.',
            ['Which pattern makes the shortcut work?'], 'why no shortcut for a sum of squares');
        } }] },
      { num: '16', section: 'Extra practice F — A stretch, and two for the test', stem: function (sh) { var c = 4 * Math.pow(sh.n, 4); return t('x^{4}+' + c) + ' is a <i>sum</i> of squares, so it is not a difference of squares as it stands — and yet it does factor into two trinomials. The trick is to add and subtract the same term.'; },
        shared: function (r) { return { n: r.pick([1, 1, 1, 2]), v: r.int(2, 4) }; },
        parts: [
          { id: 'e16a', level: 'BEG', make: function (r, sh) {
            var n = sh.n, c = 4 * Math.pow(n, 4), k = 2 * n * n;
            var p = KP.fields('Write ' + t('x^{4}+' + c) + ' in the form ' + t('(\\ \\ )^{2}+(\\ \\ )^{2}') + ': what goes inside each bracket?', [pbox('First bracket ' + t('(\\ \\ )^{2}') + ':', ['x'], 'First bracket'), pbox('Second bracket ' + t('(\\ \\ )^{2}') + ':', ['x'], 'Second bracket')],
              [], ['x^{2}', String(k)], t('(x^{2})^{2}+(' + k + ')^{2}'),
              t('x^{4}+' + c + '=(x^{2})^{2}+(' + k + ')^{2}') + '. Both terms are perfect squares joined by ' + t('+') + ', so it is a <b>sum</b> of squares — the pattern does not apply directly.',
              ['What squared gives ' + t('x^{4}') + '? What squared gives ' + t(c) + '?'], 'x^4+' + c + ' as a sum of squares');
            var X2 = P.parse('x^2'), Kp = N(k);
            p.check = function (resp) {
              resp = resp || []; var a = P.read(resp[0] || ''), b = P.read(resp[1] || '');
              if (!resp[0] || !resp[1]) return form('empty', 'Fill in both boxes.');
              if (!a.ok || !b.ok) return wrong('value', null);
              var good = (P.eq(a.p, X2) && P.eq(b.p, Kp)) || (P.eq(a.p, Kp) && P.eq(b.p, X2));
              if (good) return ok();
              if (P.eq(a.p, P.parse('x^4')) || P.eq(b.p, P.parse('x^4')) || P.eq(a.p, N(c)) || P.eq(b.p, N(c))) return wrong('no-root', 'Each box holds what gets <b>squared</b>: ' + t('(x^{2})^{2}=x^{4}') + ' and ' + t(k + '^{2}=' + c) + '. Put the square roots in the boxes.');
              if (P.eq(a.p, P.parse('x^2')) || P.eq(b.p, P.parse('x^2'))) return wrong('value', 'The ' + t('x^{2}') + ' is right. What number squared gives ' + t(c) + '?');
              return wrong('value', 'What squared gives ' + t('x^{4}') + '? What squared gives ' + t(c) + '?');
            };
            p.good = [[String(k), 'x^{2}']];
            p.bad = [['x^{4}', String(c)], ['x^{2}', String(c)]];
            return p;
          } },
          { id: 'e16b', level: 'BEG', make: function (r, sh) {
            var n = sh.n, k = 2 * n * n, B = P.parse('x^2+' + k), T = sq(B);
            var p = KP.poly('Expand ' + t('(x^{2}+' + k + ')^{2}') + '.', T, { wrong: [{ is: P.parse('x^4+' + k * k), code: 'square-middle', hint: 'Write it as ' + t('(x^{2}+' + k + ')(x^{2}+' + k + ')') + ': there are two middle products.' }, { is: P.parse('x^4+' + k + 'x^2+' + k * k), code: 'middle-once', hint: 'There are <b>two</b> middle products, ' + t(k + 'x^{2}') + ' and ' + t(k + 'x^{2}') + '.' }] },
              t('(x^{2}+' + k + ')^{2}=(x^{2}+' + k + ')(x^{2}+' + k + ')=x^{4}+' + k + 'x^{2}+' + k + 'x^{2}+' + k * k + '=' + tx(T)),
              ['Multiply ' + t('(x^{2}+' + k + ')(x^{2}+' + k + ')') + '. Powers: ' + t('x^{2}\\cdot x^{2}=x^{4}') + '.'], 'expand (x²+' + k + ')²');
            p.bad = ['x^4+' + k * k];
            return p;
          } },
          { id: 'e16c', level: 'ADV', make: function (r, sh) {
            var n = sh.n, k = 2 * n * n, m = 2 * n, c = k * k, mid = P.parse(m * m + 'x^2');
            var A = P.parse('x^2+' + k), Mx = L(m, 'x'), T1 = P.sub(A, Mx), T2 = P.add(A, Mx);
            return factPart('Since ' + t('x^{4}+' + c + '=\\left(x^{4}+' + 2 * k + 'x^{2}+' + c + '\\right)-' + tx(mid)) + ', rewrite ' + t('x^{4}+' + c) + ' as ' + t('(x^{2}+' + k + ')^{2}-(' + m + 'x)^{2}') + ' and factor it with the difference of squares.',
              '(' + tx(T1) + ')(' + tx(T2) + ')', [
                { is: [P.sub(A, L(m * m, 'x')), P.add(A, L(m * m, 'x'))], code: 'no-root', hint: 'The second square is ' + t('(' + m + 'x)^{2}') + ', so the brackets use ' + t(m + 'x') + ', not ' + t(m * m + 'x') + '.' },
                { is: [{ p: A, k: 2 }], code: 'dsq-square', hint: 'That’s ' + t('x^{4}+' + 2 * k + 'x^{2}+' + c) + ', the square you started from. Now subtract ' + t('(' + m + 'x)^{2}') + ' using ' + t('A^{2}-B^{2}=(A-B)(A+B)') + '.' }],
              t('x^{4}+' + c + '=(x^{4}+' + 2 * k + 'x^{2}+' + c + ')-' + tx(mid) + '=(x^{2}+' + k + ')^{2}-(' + m + 'x)^{2}') + '<br>' + t('=\\left[(x^{2}+' + k + ')-' + m + 'x\\right]\\left[(x^{2}+' + k + ')+' + m + 'x\\right]') + '<br>' + t('=(' + tx(T1) + ')(' + tx(T2) + ')'),
              ['Use ' + t('A=x^{2}+' + k) + ' and ' + t('B=' + m + 'x') + ' in ' + t('(A-B)(A+B)') + '.', 'Write each bracket in descending powers of ' + t('x') + '.'], 'factor x^4+' + c + ' (Sophie Germain)',
              { good: ['(x^{2}+' + m + 'x+' + k + ')(x^{2}-' + m + 'x+' + k + ')', '(x^{2}+' + k + '-' + m + 'x)(x^{2}+' + k + '+' + m + 'x)'] });
          } },
          { id: 'e16d', level: 'BEG', make: function (r, sh) {
            var n = sh.n, k = 2 * n * n, m = 2 * n, c = k * k, v = sh.v;
            var o = Math.pow(v, 4) + c, t1 = v * v - m * v + k, t2 = v * v + m * v + k;
            var p = KP.fields('Check the two trinomials by substituting ' + t('x=' + v) + ' into the original and into each trinomial.', [nbox(t('x^{4}+' + c) + ' at ' + t('x=' + v) + ':', 'Original'), nbox(t('x^{2}-' + m + 'x+' + k) + ' at ' + t('x=' + v) + ':', 'First trinomial'), nbox(t('x^{2}+' + m + 'x+' + k) + ' at ' + t('x=' + v) + ':', 'Second trinomial')],
              [K.number(o), K.number(t1, function (x) { return x === v * v + m * v + k ? { code: 'sub-value', hint: 'This one has ' + t('-' + m + 'x') + ': subtract ' + t(m * v) + '.' } : null; }), K.number(t2)],
              [String(o), String(t1), String(t2)], t(o) + ', ' + t(t1) + ', ' + t(t2) + ' (and ' + t(t1 + '\\times ' + t2 + '=' + o) + ' ✓)',
              'Original: ' + t(v + '^{4}+' + c + '=' + Math.pow(v, 4) + '+' + c + '=' + o) + '<br>Trinomials: ' + t(v * v + '-' + m * v + '+' + k + '=' + t1) + ' and ' + t(v * v + '+' + m * v + '+' + k + '=' + t2) + '<br>' + t(t1 + '\\times ' + t2 + '=' + o) + ' ✓ — the factoring checks.',
              ['Replace every ' + t('x') + ' with ' + t(v) + '.'], 'check x^4+' + c + ' at x=' + v);
            p.bad = [[String(o), String(t2), String(t1)]];
            return p;
          } }] },
      { num: '17', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: 'e17', level: 'PRG', make: function (r) {
          var k = r.pick([2, 2, 3, 5]), n = r.pick([2, 2, 3]), n2 = n * n, n4 = n2 * n2, e = k + 'x^{4}-' + k * n4;
          return mc(r, 'When ' + t(e) + ' is factored completely, one of the factors is', [
            { html: t('x^{4}-' + n4), why: t('x^{4}-' + n4) + ' appears on the way, but it still factors: it isn’t a factor of the <b>completed</b> answer.' },
            { html: t(k + 'x^{2}-' + k * n2), why: t(k + 'x^{2}-' + k * n2 + '=' + k + '(x^{2}-' + n2 + ')') + ', which still factors.' },
            { html: t('x^{2}+' + n2), right: true },
            { html: t('x^{2}-' + n2), why: t('x^{2}-' + n2) + ' still factors into ' + t('(x-' + n + ')(x+' + n + ')') + ', so it isn’t one of the factors when the factoring is complete.' }],
            t(e + '=' + k + '(x^{4}-' + n4 + ')=' + k + '(x^{2}-' + n2 + ')(x^{2}+' + n2 + ')=' + k + '(x-' + n + ')(x+' + n + ')(x^{2}+' + n2 + ')') + '. Only ' + t('x^{2}+' + n2) + ' is a factor of the <b>completed</b> answer.',
            ['Factor completely first, then look for the option among the final brackets.'], 'MC: factor of ' + plain(e), true);
        } }] },
      { num: '18', stem: '<i>(Numerical Response)</i>', parts: [
        { id: 'e18', level: 'ADV', make: function (r) {
          var g = r.pick([[2, 3], [2, 3], [3, 2], [2, 5], [3, 5], [5, 2], [5, 3]]), a = g[0], b = g[1], c = a * a, d = b * b, ans = a + b + c + d;
          var e = P.seq([L(Math.pow(a, 4), 'x', 4), L(-Math.pow(b, 4), 'y', 4)]);
          return KP.nr('When ' + t(e) + ' is factored completely the result is ' + t('(ax-by)(ax+by)(cx^{2}+dy^{2})') + ', where ' + t('a') + ', ' + t('b') + ', ' + t('c') + ' and ' + t('d') + ' are positive integers. The value of ' + t('a+b+c+d') + ' is ____.', ans, function (v) {
            if (v === c + d + c + d) return { code: 'abcd', hint: 'Check ' + t('a') + ' and ' + t('b') + ': they come from the <b>second</b> round, ' + t('(' + c + 'x^{2}-' + d + 'y^{2})=(' + a + 'x)^{2}-(' + b + 'y)^{2}') + '.' };
            if (v === a + b + a + b) return { code: 'abcd', hint: 'Check ' + t('c') + ' and ' + t('d') + ': the plus bracket from the first round is ' + t('(' + c + 'x^{2}+' + d + 'y^{2})') + '.' };
            return null;
          }, t(e + '=(' + c + 'x^{2}-' + d + 'y^{2})(' + c + 'x^{2}+' + d + 'y^{2})=(' + a + 'x-' + b + 'y)(' + a + 'x+' + b + 'y)(' + c + 'x^{2}+' + d + 'y^{2})') + '<br>So ' + t('a=' + a + ',\\ b=' + b + ',\\ c=' + c + ',\\ d=' + d) + ' and ' + t('a+b+c+d=' + ans) + '.',
            ['Factor completely (two rounds), then read off ' + t('a, b, c, d') + '.'], 'NR: a+b+c+d for ' + plain(e));
        } }] }
    ]
  });

  /* ---------------- makers used above (hoisted) ---------------- */
  function productPart(n, d) {
    var a = n - d, b = n + d, ans = n * n - d * d;
    return KP.number('Use the above process to evaluate ' + t(a + '\\times ' + b) + '.', ans, function (v) {
      if (v === n * n + d * d) return { code: 'added-sq', hint: t('(' + n + '-' + d + ')(' + n + '+' + d + ')=' + n + '^{2}-' + d + '^{2}') + ': <b>subtract</b> the square.' };
      if (v === n * n - d) return { code: 'd-not-squared', hint: 'Square the ' + t(d) + ' too: ' + t(d + '^{2}=' + d * d) + '.' };
      if (v === n * n) return { code: 'd-not-squared', hint: 'Don’t forget to subtract ' + t(d + '^{2}') + '.' };
      return null;
    }, t(a) + ' and ' + t(b) + ' are both ' + t(d) + ' away from ' + t(n) + ':<br>' + t(a + '\\times ' + b + '=(' + n + '-' + d + ')(' + n + '+' + d + ')=' + n + '^{2}-' + d + '^{2}') + '<br>' + t('=' + F(n * n) + '-' + d * d + '=' + F(ans)),
      ['Find the number halfway between ' + t(a) + ' and ' + t(b) + ', and how far each is from it.', 'Then use ' + t('(n-d)(n+d)=n^{2}-d^{2}') + '.'], a + '×' + b + ' by difference of squares');
  }
  function squaresPart(a, b) {
    var ans = (a - b) * (a + b);
    return KP.number(t(a + '^{2}-' + b + '^{2}'), ans, function (v) {
      if (v === (a - b) * (a - b)) return { code: 'dsq-square', hint: t('a^{2}-b^{2}=(a-b)(a+b)') + ': multiply the difference by the <b>sum</b>.' };
      if (v === (a - b) + (a + b)) return { code: 'value', hint: t('(a-b)') + ' and ' + t('(a+b)') + ' are <b>multiplied</b>.' };
      if (v === (a + b) * (a + b)) return { code: 'dsq-square', hint: t('a^{2}-b^{2}=(a-b)(a+b)') + ': multiply the <b>difference</b> by the sum.' };
      return null;
    }, t(a + '^{2}-' + b + '^{2}=(' + a + '-' + b + ')(' + a + '+' + b + ')=' + (a - b) + '\\times ' + (a + b) + '=' + F(ans)),
      ['Use ' + t('a^{2}-b^{2}=(a-b)(a+b)') + ': find the difference and the sum of the two numbers.'], plain(a + '^2-' + b + '^2'));
  }
  /* A² − B² with fractional coefficients: either form accepted */
  function fracPart(A, B) {
    var e = P.seq([sq(A), P.neg(sq(B))]), target = dosTex(A, B);
    var cA = P.terms(A)[0].c, cB = P.terms(B)[0].c, Lc = cA[1] * cB[1] / gcd(cA[1], cB[1]);
    var A2 = P.scale(A, Lc), B2 = P.scale(B, Lc), alt = '\\frac{1}{' + Lc * Lc + '}' + dosTex(A2, B2);
    return factPart(t(e), target, wrongsOf(S(A, B)),
      notes([A, B]) + t(e + '=' + sqTex(A) + '-' + sqTex(B) + '=' + target) + '<br>(Also correct: take out ' + t('\\frac{1}{' + Lc * Lc + '}') + ' first to get ' + t(alt) + '.)',
      ['A fraction is a perfect square when its top and bottom are: ' + t('\\frac{9}{16}=\\left(\\frac{3}{4}\\right)^{2}') + '.', 'Then use ' + IDENT + '.'], 'factor ' + plain(e),
      { wrap: fracOk(target), good: [alt, dosTexR(A, B)] });
  }
  /* A² − B² where A or B is a binomial: simplify each bracket, then take out any common factor */
  function bkGs(A, B) { return [Math.abs(FX.content(P.sub(A, B)).c[0]), Math.abs(FX.content(P.add(A, B)).c[0])]; }
  function bkK(A, B) { var g = bkGs(A, B); return g[0] * g[1]; }
  function bracketPart(A, B) {
    var D = P.sub(A, B), Sm = P.add(A, B), gs = bkGs(A, B), kAbs = gs[0] * gs[1];
    var aw = function (X) { return P.count(X) > 1 ? '(' + tx(X) + ')' : tx(X); };
    var e = sqLabel(A) + '-' + sqLabel(B);
    /* the pattern letters a, b become A, B when the question itself uses a or b, e.g. (3a+4)^2 - 16b^2 */
    var clash = P.vars(P.add(sq(A), sq(B))).some(function (v) { return v === 'a' || v === 'b'; });
    function pat(s) { return clash ? s.replace(/a/g, 'A').replace(/b/g, 'B') : s; }
    /* the booklet's order: the number first when the first square is a number, (2a+1-3b) when nothing combines */
    function ord(X, sign) {
      if (isNum(A)) { var c0 = P.constant(X); if (c0[0] > 0) return P.seq([N(c0), P.sub(X, N(c0))]); }
      if (P.count(X) === P.count(A) + P.count(B)) return P.seq([A, sign < 0 ? P.neg(B) : B]);
      return tx(X);
    }
    var fD = P.scale(D, [1, gs[0]]), fS = P.scale(Sm, [1, gs[1]]);
    var tD = gs[0] > 1 ? tx(fD) : ord(D, -1), tS = gs[1] > 1 ? tx(fS) : ord(Sm, 1);
    var target = (kAbs > 1 ? String(kAbs) : '') + '(' + tD + ')(' + tS + ')';
    var lines = t(e + '=\\left[' + aw(A) + '-' + aw(B) + '\\right]\\left[' + aw(A) + '+' + aw(B) + '\\right]');
    if (P.count(B) > 1) lines += '<br>' + t('=(' + P.seq([A, P.neg(B)]) + ')(' + P.seq([A, B]) + ')');
    lines += '<br>' + t('=(' + ord(D, -1) + ')(' + ord(Sm, 1) + ')');
    if (kAbs > 1) {
      var parts = [];
      if (gs[0] > 1) parts.push(t(tx(D) + '=' + gs[0] + '(' + tx(fD) + ')'));
      if (gs[1] > 1) parts.push(t(tx(Sm) + '=' + gs[1] + '(' + tx(fS) + ')'));
      lines += '<br>A common factor appears: ' + parts.join(' and ') + '.<br>' + t('=' + (gs[0] > 1 ? gs[0] + '(' + tx(fD) + ')' : '(' + tD + ')') + '\\cdot ' + (gs[1] > 1 ? gs[1] + '(' + tx(fS) + ')' : '(' + tS + ')') + '=' + target);
    } else if (P.count(B) > 1) lines += '<br>(No common factor appears here — this one is already complete.)';
    var ws = [];
    if (P.count(B) > 1) { // the minus sign given only to the first term of B
      var B1 = P.mono(P.sorted(B)[0].c, P.sorted(B)[0].v), Dbad = P.add(P.sub(A, B1), P.sub(B, B1));
      ws.push({ is: [Dbad, Sm], code: 'minus-bracket', hint: 'Check the first bracket: ' + t(aw(A) + '-' + aw(B)) + '. Subtracting a bracket changes the sign of <b>every</b> term in it.' });
    }
    if (kAbs > 1) ws.push({ is: [fD, fS], code: 'lost-gcf', hint: 'Your brackets are right, but the common factor ' + t(String(kAbs)) + ' you took out has gone missing — it stays in front.' });
    ws.push({ is: [{ p: D, k: 2 }], code: 'dsq-square', hint: 'Use ' + t(pat('(a-b)(a+b)')) + ' with ' + t(pat('a') + '=' + tx(A)) + ' and ' + t(pat('b') + '=' + tx(B)) + ': one minus bracket and one plus bracket.' });
    if (isNum(B) && !P.eq(sq(B), B)) { var B2 = sq(B); ws.push({ is: [P.sub(A, B2), P.add(A, B2)], code: 'no-root', hint: 'Use the square <b>root</b>: ' + t(tx(B2) + '=' + sqTex(B)) + ', so ' + t(pat('b') + '=' + tx(B)) + '.' }); }
    ws.push({ is: [P.sub(B, A), P.add(B, A)], code: 'rev-order', hint: 'Your factors multiply to the opposite. In ' + t(pat('a^{2}-b^{2}')) + ', ' + t(pat('a')) + ' is the root of the <b>first</b> square, ' + t(tx(A)) + '.' });
    var hints = ['Let ' + t(pat('a') + '=' + tx(A)) + ' and ' + t(pat('b') + '=' + tx(B)) + ', and use ' + t(pat('(a-b)(a+b)')) + ' with square brackets around each.', 'Simplify each bracket (subtracting a bracket changes every sign), then take out any common factor.'];
    var raw = '(' + P.seq([A, P.neg(B)]) + ')(' + P.seq([A, B]) + ')', bad = raw === '(' + tD + ')(' + tS + ')' ? [] : [raw];
    if (kAbs > 1) bad.push('(' + ord(D, -1) + ')(' + ord(Sm, 1) + ')');
    return factPart(t(e), target, ws, lines, hints, 'factor ' + plain(e), { wrap: function (c) { return simpBr(c); }, bad: bad, good: ['(' + tS + ')(' + tD + ')'].map(function (x) { return (kAbs > 1 ? String(kAbs) : '') + x; }) });
  }
  function sqLabel(X) { return P.count(X) > 1 ? '(' + tx(X) + ')^{2}' : tx(sq(X)); }
})(window);
