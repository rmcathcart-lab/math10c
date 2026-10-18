/* Math 10C · Unit 4 · Lesson 5 — Further Factoring (AN5)
 * Assignment questions 1–16 (u4_L05.tex) and the whole Lesson 5 Extra Practice (u4_EP05.tex, Q1–18).
 * Every part is a generator: it keeps the structure of the booklet question (perfect squares with the booklet's sign
 * pattern and coefficients, the block x², ab, xy, x³, z⁵ or a⁴, which brackets split again, a GCF first, two
 * variables) and changes the numbers; the booklet's numbers are one of the possible values. Every question is built
 * from its factors, so the keys come straight from the generated numbers. Levels: LIM BEG EMG PRG ADV MAS. */
(function (root) {
  'use strict';
  var HW = root.HW, K = HW.kit, KP = K.P, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form, P = HW.poly, FA = HW.factor, ex = HW.ex;

  HW.addCodes({
    'pst-sign': 'Perfect square with the wrong sign in the bracket', 'pst-dos': 'Wrote a perfect square trinomial as a difference of squares',
    'no-root': 'Used a term instead of its square root', 'block-back': 'Put the wrong block back after substituting', 'no-back-sub': 'Left the substitution letter in the answer',
    'not-square': 'Split a bracket whose constant is not a perfect square', 'sum-split': 'Factored a sum of squares', 'gcf-lost': 'Lost the common factor taken out first',
    'swap-const': 'Constants in the wrong brackets', 'not-doubled': 'Middle term not doubled', 'no-var': 'Left the variable off the term', 'not-squared': 'Didn’t square the root',
    'not-halved': 'Didn’t halve the middle coefficient', 'half-root': 'Ignored the coefficient of the other square', 'has-var': 'Put a variable on a constant term', 'neg-square': 'Gave a negative perfect square',
    'sign-given': 'Typed the sign that was already printed', inner: 'Like terms not collected inside a bracket', 'dos-square': 'Squared instead of using a sum and a difference',
    'minus-bracket': 'Minus sign not applied to every term of the block', 'student-ans': 'Repeated the student’s error', 'ab-sum': 'Added A and B instead of multiplying',
    'mid-coef': 'Gave the middle coefficient 2AB', 'ab-sq': 'Used the squares instead of the roots', 'leg': 'Gave a leg instead of the hypotenuse', 'subtracted': 'Subtracted the squares of the legs',
    'leg-sum': 'Added the legs', 'swap-ab': 'Computed b to the power a', 'pst-half': 'Middle term is half of what a perfect square needs'
  });

  /* ---------------- small helpers ---------------- */
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var r = a % b; a = b; b = r; } return a; }
  function isq(n) { if (n < 0) return null; var r = Math.round(Math.sqrt(n)); return r * r === n ? r : null; }
  function isSq(n) { return isq(n) != null; }
  function pickWhere(gen, test) { for (var i = 0; i < 5000; i++) { var v = gen(); if (test(v)) return v; } throw new Error('pickWhere failed'); }
  function V(x, e) { var o = {}; o[x] = e == null ? 1 : e; return o; }
  function M(c, v, e) { if (typeof v === 'string') v = V(v, e); return P.mono(c, v || {}); }   // c·v^e  or  c·{x:2,y:1}
  function N(c) { return P.num(c); }
  function S() { return P.add.apply(null, arguments); }
  function tx(p) { return P.tex(p); }
  function seq(a) { return P.seq(a); }
  function br(p) { return '(' + tx(p) + ')'; }
  function pv(n) { return n < 0 ? '(' + n + ')' : String(n); }
  function sc1(n) { return n < 0 ? '-' + (-n) : '+' + n; }           // +1(…) / -4(…) in a grouping line
  function plain(s) { return String(s).replace(/\\left|\\right/g, '').replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '$1/$2').replace(/\\underline\{\\hspace\{[^}]*\}\}/g, '__').replace(/\\[a-z]+/g, '').replace(/[{}]/g, ''); }
  var BL = '\\underline{\\hspace{1.6em}}';
  function lead(p) { return P.sorted(p)[0]; }
  function sgnOf(p) { var T = lead(p); return T && T.c[0] < 0 ? -1 : 1; }
  function absM(p) { return sgnOf(p) < 0 ? P.neg(p) : p; }
  function coefOf(m) { var T = lead(m); return T.c; }
  function varsOf(m) { var T = lead(m); return T.v; }
  function plus(a, b) { return S(a, b); }

  /* factor objects { p, k, tex } and the product LaTeX */
  function fo(p, k, tex) { p = P.lift(p); return { p: p, k: k || 1, tex: tex || tx(p) }; }
  function isMono(f) { return P.count(f.p) <= 1; }
  function fprod(list) { return list.reduce(function (acc, f) { return P.mul(acc, P.pow(f.p, f.k)); }, N(1)); }
  function ftex(list) {
    var mono = list.filter(isMono), brs = list.filter(function (f) { return !isMono(f); });
    var m = fprod(mono), mt = tx(m), s = mt === '1' ? '' : mt === '-1' ? '-' : mt;
    if (!brs.length) return mt;
    return s + brs.map(function (f) { return '(' + f.tex + ')' + (f.k > 1 ? '^{' + f.k + '}' : ''); }).join('');
  }
  function merge(list) {
    var out = [];
    list.forEach(function (f) { var g = isMono(f) ? null : out.filter(function (h) { return !isMono(h) && P.eq(h.p, f.p); })[0]; if (g) g.k += f.k; else out.push({ p: f.p, k: f.k, tex: f.tex }); });
    return out;
  }
  function wr(list, code, hint) { return { is: fprod(list), tex: ftex(list), code: code, hint: hint }; }
  function cleanW(T, ws) {
    var out = [];
    (ws || []).forEach(function (w) { if (!w || !w.is) return; var p = P.lift(w.is); if (P.eq(p, T) || out.some(function (o) { return P.eq(o.is, p); })) return; out.push({ is: p, tex: w.tex, code: w.code, hint: w.hint }); });
    return out;
  }

  /* ---------------- the factored-answer checker ----------------
   * K.factored plus three things this lesson needs: a bracket with a fraction coefficient such as (½x+2y)² is complete
   * (only a whole-number or variable common factor counts as "left inside"); [(x−1)(x+1)]² counts as (x−1)²(x+1)²; and
   * like terms must be collected inside every bracket ((x−2)−2 → x−4). A substitution letter left in the answer gets a
   * targeted hint. */
  function distPow(a) {
    if (!a || typeof a !== 'object') return a;
    if (a.t === 'pow') { var b = a.a; while (b && b.t === 'paren') b = b.a; if (b && b.t === 'mul') return { t: 'mul', a: distPow({ t: 'pow', a: b.a, b: a.b }), b: distPow({ t: 'pow', a: b.b, b: a.b }) }; }
    var o = {}; Object.keys(a).forEach(function (k) { o[k] = (k === 'a' || k === 'b') ? distPow(a[k]) : a[k]; }); return o;
  }
  function sameKeys(a, b) { var ka = Object.keys(a), kb = Object.keys(b); return ka.length === kb.length && ka.every(function (k) { return a[k] === b[k]; }); }
  function innerIssue(sp) {
    for (var i = 0; i < sp.factors.length; i++) {
      var f = sp.factors[i]; if (!f.ast) continue;
      var fi = P.formIssue(f.ast);
      if (fi && fi.code !== 'not-poly') return form('inner', 'Right factors — now simplify <b>inside each bracket</b>: collect the like terms (for example ' + t('(x-2)-2=x-4') + ').');
    }
    return null;
  }
  function facChk(TF, o) {
    o = o || {};
    var tl = TF.map(function (f) { return { p: f.p, k: f.k }; }), T = fprod(TF), TN = FA.normal(tl), Tv = P.vars(T);
    var base = K.factored(tl, { wrong: cleanW(T, o.wrong), gcfOnly: o.gcfOnly, diag: function (Sp, T2, sp) {
      var extra = P.vars(Sp).filter(function (v) { return Tv.indexOf(v) < 0; });
      if (extra.length) return { code: 'no-back-sub', hint: 'Your answer uses ' + t(extra[0]) + ', which isn’t in the question. Replace ' + t(extra[0]) + ' by the block it stands for, then simplify inside the brackets.' };
      return o.diag ? o.diag(Sp, T2, sp) : null;
    } });
    function alt(resp) {
      var pr = ex.parse(resp); if (!pr.ok) return null;
      var sp = FA.split(distPow(pr.ast)); if (!sp.ok) return null;
      if (!P.eq(sp.factors.reduce(function (acc, f) { return P.mul(acc, P.pow(f.p, f.k)); }, N(1)), T)) return null;
      var SN = FA.normal(sp.factors); if (!sameKeys(SN.keys, TN.keys)) return null;
      for (var i = 0; i < SN.raw.length; i++) { var cn = SN.raw[i].cn; if (Math.abs(cn.c[0]) !== 1 || Object.keys(cn.v).length) return null; }
      return sp;
    }
    return function (resp) {
      var r = base(resp);
      if (r.v === 'form' && (r.code === 'gcf-inside' || r.code === 'not-factored')) { var sp = alt(resp); if (sp) return innerIssue(sp) || ok(); }
      if (r.v === 'correct') { var pr = ex.parse(resp), sp2 = pr.ok ? FA.split(pr.ast) : null; if (sp2 && sp2.ok) { var f = innerIssue(sp2); if (f) return f; } }
      return r;
    };
  }
  function facPart(prompt, TF, o) {
    o = o || {};
    var T = fprod(TF), ws = cleanW(T, o.wrong), keyTex = o.keyTex || ftex(TF);
    var p = KP.math(prompt, facChk(TF, { wrong: ws, gcfOnly: o.gcfOnly, diag: o.diag }), keyTex, o.sol, o.hints || H.fac, o.text, { keys: 'poly', vars: P.vars(T), placeholder: 'e.g. (x - 2)(x + 2)(x² + 4)' });
    p.bad = ws.map(function (w) { return w.tex; }).filter(Boolean).concat(o.bad || []);
    p.good = o.good || [];
    return p;
  }
  /* one missing term: K.poly, but a negative of the answer typed after a printed sign is a nudge */
  function termChk(T, ws, o) {
    o = o || {}; T = P.lift(T);
    var base = K.poly(T, { wrong: cleanW(T, ws) });
    return function (resp) {
      var r = typeof resp === 'string' && resp.trim() ? P.read(resp) : { ok: false };
      if (r.ok && P.eq(r.p, P.neg(T))) return o.signGiven ? form('sign-given', 'The ' + t(o.signGiven) + ' sign in front of the blank is already printed — type just the term that goes in the blank, without a sign.')
        : wrong('neg-square', 'A perfect square term is never negative — the missing term must be positive.');
      return base(resp);
    };
  }
  function blankPart(prompt, T, ws, o, sol, hints, text) {
    o = o || {}; T = P.lift(T);
    var p = KP.math(prompt, termChk(T, ws, o), tx(T), sol, hints, text, { keys: 'poly', vars: o.vars || P.vars(T).concat(['x']).filter(function (v, i, a) { return a.indexOf(v) === i; }) });
    p.bad = cleanW(T, ws).map(function (w) { return tx(w.is); });
    return p;
  }
  /* a box in a fields part */
  function box(label, vars, name) { return { name: name || label.replace(/<[^>]*>|\\\(|\\\)/g, ''), label: label, mode: 'math', keys: 'poly', vars: vars, wide: true }; }

  var H = {
    pst: ['Run the three-part test: is the first term a perfect square? Is the last term a perfect square (and positive)? Is the middle term twice the product of the two square roots?', 'If all three hold, the trinomial is ' + t('(\\sqrt{\\text{first}}\\pm\\sqrt{\\text{last}})^{2}') + ', with the sign of the middle term.'],
    block: ['Treat the squared monomial as one block: if the first term is ' + t('(x^{2})^{2}') + ', let ' + t('u=x^{2}') + '. Factor the trinomial in ' + t('u') + ', then put the block back.', 'Then check every bracket: a difference of two perfect squares factors again; a sum of squares does not.'],
    dec: ['Let ' + t('u') + ' be the block, then decompose: find two numbers that multiply to ' + t('ac') + ' and add to ' + t('b') + '. Split the middle term and group in pairs.', 'Put the block back in for ' + t('u') + ', then check whether any bracket factors again.'],
    dos: ['Take out any common factor first. Then write the binomial as ' + t('A^{2}-B^{2}') + ' and use ' + t('A^{2}-B^{2}=(A-B)(A+B)') + '.', 'Look at the new brackets: a difference of squares factors again; a sum of squares stops.'],
    fac: ['Take out any common factor first, then look for a perfect square trinomial, a trinomial in a block, or a difference of squares.', '“Factor completely”: check every bracket before you stop.']
  };

  /* ---------------- perfect square trinomials (A + B)², B carrying the sign ---------------- */
  function pst(A, B, order) {
    A = P.lift(A); B = P.lift(B);
    var A2 = P.mul(A, A), B2 = P.mul(B, B), mid = P.scale(P.mul(A, B), 2), neg = sgnOf(B) < 0, Bp = absM(B);
    var terms = order === 'asc' ? [B2, mid, A2] : [A2, mid, B2], baseTex = tx(A) + (neg ? '-' : '+') + tx(Bp);
    return { A: A, B: B, Bp: Bp, A2: A2, B2: B2, mid: mid, neg: neg, T: S(A2, mid, B2), expr: seq(terms), base: S(A, B), baseTex: baseTex, TF: [fo(S(A, B), 2, baseTex)], key: '(' + baseTex + ')^{2}' };
  }
  function pstLine(o) {
    return t('\\sqrt{' + tx(o.A2) + '}=' + tx(o.A)) + ', ' + t('\\sqrt{' + tx(o.B2) + '}=' + tx(o.Bp)) + ', ' + t('2(' + tx(o.A) + ')(' + tx(o.Bp) + ')=' + tx(P.scale(P.mul(o.A, o.Bp), 2))) + ' ✓' + (o.neg ? ' (the middle term is negative, so the bracket has a minus sign)' : '');
  }
  function pstSol(o, extra) { return pstLine(o) + '<br>' + t(o.expr + '=' + o.key) + (extra || ''); }
  function sqCoefMono(m) { var c = coefOf(m), v = varsOf(m); return P.mono([c[0] * c[0] * (c[0] < 0 ? -1 : 1), c[1] * c[1]], v); }   // 5x → 25x, -3 → -9
  function pstWrongs(o) {
    var out = [
      wr([fo(S(o.A, P.neg(o.B)), 2)], 'pst-sign', 'Expand your answer: its middle term is ' + t(tx(P.neg(o.mid))) + '. The sign inside the bracket must match the sign of the middle term, ' + t(tx(o.mid)) + '.'),
      wr([fo(S(o.A, o.B)), fo(S(o.A, P.neg(o.B)))], 'pst-dos', 'That’s a sum times a difference — it multiplies to ' + t(tx(P.sub(o.A2, o.B2))) + ', with no middle term. A perfect square trinomial is a bracket times <b>itself</b>.')];
    var ca = coefOf(o.A); if (Math.abs(ca[0]) !== 1 || ca[1] !== 1) out.push(wr([fo(S(sqCoefMono(o.A), o.B), 2)], 'no-root', 'Use the square <b>root</b> of the first term: ' + t('\\sqrt{' + tx(o.A2) + '}=' + tx(o.A)) + '.'));
    var cb = coefOf(o.Bp); if (Math.abs(cb[0]) !== 1 || cb[1] !== 1) out.push(wr([fo(S(o.A, sqCoefMono(o.B)), 2)], 'no-root', 'Use the square <b>root</b> of the last term: ' + t('\\sqrt{' + tx(o.B2) + '}=' + tx(o.Bp)) + '.'));
    return out;
  }
  function pstPart(prompt, o, x) {
    x = x || {};
    return facPart(prompt, o.TF, { keyTex: x.keyTex || o.key, wrong: pstWrongs(o).concat(x.wrong || []), sol: x.sol || pstSol(o, x.solExtra), hints: x.hints || H.pst, text: x.text || 'factor PST ' + plain(o.expr), good: x.good });
  }

  /* ---------------- differences of squares, split as far as they go ---------------- */
  function sqrtMono(T) {
    var a = isq(T.c[0]), b = isq(T.c[1]); if (a == null || b == null) return null;
    var v = {}; for (var x in T.v) { if (T.v[x] % 2) return null; v[x] = T.v[x] / 2; }
    return P.mono([a, b], v);
  }
  function dosSplit(p) {
    if (P.count(p) !== 2) return null;
    var ts = P.sorted(p), pi = ts[0].c[0] > 0 ? 0 : 1, ni = 1 - pi;
    if (!(ts[pi].c[0] > 0 && ts[ni].c[0] < 0)) return null;
    var a = sqrtMono(ts[pi]), b = sqrtMono({ c: [-ts[ni].c[0], ts[ni].c[1]], v: ts[ni].v }); if (!a || !b) return null;
    return { a: a, b: b, minus: fo(P.sub(a, b), 1, pi === 0 ? tx(a) + '-' + tx(b) : seq([a, P.neg(b)])), plus: fo(P.add(a, b), 1, pi === 0 ? tx(a) + '+' + tx(b) : seq([b, a])) };
  }
  function fullSplit(f, steps) {
    var d = dosSplit(f.p);
    if (!d) return [f];
    steps.push(t(f.tex) + ' is a difference of squares: ' + t(f.tex + '=(' + tx(d.a) + ')^{2}-(' + tx(d.b) + ')^{2}=(' + d.minus.tex + ')(' + d.plus.tex + ')'));
    return fullSplit(d.minus, steps).concat([d.plus]);
  }
  function stopNote(f) {
    if (P.count(f.p) !== 2 || P.degree(f.p) < 2) return null;
    var ts = P.sorted(f.p);
    if (ts[0].c[0] > 0 && ts[1].c[0] > 0) return t(f.tex) + ' is a sum — it stops';
    return t(f.tex) + ' is not a difference of two perfect squares — it stops';
  }
  /* classic errors on a finished factor list: splitting x²−3 as (x−3)(x+3), "factoring" a sum of squares, losing the GCF */
  function autoWrongs(TF, g) {
    var out = [];
    TF.forEach(function (f, i) {
      if (f.k !== 1 || P.count(f.p) !== 2 || P.degree(f.p) < 2) return;
      var ts = P.sorted(f.p), others = TF.filter(function (x, j) { return j !== i; });
      var A = ts[0].c[0] > 0 ? sqrtMono(ts[0]) : null;
      if (A && ts[1].c[0] < 0 && !Object.keys(ts[1].v).length && ts[1].c[1] === 1 && !isSq(-ts[1].c[0])) {
        var n = -ts[1].c[0];
        out.push(wr(others.concat([fo(S(A, N(-n))), fo(S(A, N(n)))]), 'not-square', t(n) + ' is not a perfect square, so ' + t(f.tex) + ' does not factor: ' + t('(' + tx(S(A, N(-n))) + ')(' + tx(S(A, N(n))) + ')=' + tx(P.mul(S(A, N(-n)), S(A, N(n))))) + ', not ' + t(f.tex) + '.'));
      }
      if (ts[0].c[0] > 0 && ts[1].c[0] > 0) {
        var a = sqrtMono(ts[0]), b = sqrtMono(ts[1]);
        if (a && b) out.push(wr(others.concat([fo(S(a, b), 2)]), 'sum-split', t(f.tex) + ' is a <b>sum</b> of squares — it does not factor. ' + t('(' + tx(S(a, b)) + ')^{2}=' + tx(P.pow(S(a, b), 2))) + ' has a middle term.'));
      }
    });
    if (g && tx(g) !== '1' && tx(g) !== '-1') out.push(wr(TF.filter(function (f) { return !isMono(f); }), 'gcf-lost', 'Don’t lose the common factor ' + t(tx(g)) + ' that you took out first — it is part of the answer.'));
    return out;
  }
  function dosFull(core, g, expr, o) {
    o = o || {}; g = g || N(1);
    var steps = [], T = P.mul(g, core), gt = tx(g), gs = gt === '1' ? '' : gt === '-1' ? '-' : gt;
    var pieces = fullSplit(fo(core, 1, o.coreTex), steps), TF = (gs ? [fo(g)] : []).concat(pieces), key = ftex(TF);
    expr = expr || tx(T);
    var L = [];
    if (gs) L.push('Take out the GCF, ' + t(gt) + ': ' + t(expr + '=' + gs + '(' + (o.coreTex || tx(core)) + ')'));
    L = L.concat(steps);
    var notes = pieces.map(stopNote).filter(Boolean); if (notes.length) L.push(notes.join('; ') + '.');
    L.push(t(expr + '=' + key));
    var ws = autoWrongs(TF, gs ? g : null);
    var d = dosSplit(core);
    if (d) ws.push(wr((gs ? [fo(g)] : []).concat([fo(d.minus.p, 2)]), 'dos-square', 'Your factors multiply to a square, ' + t('(' + d.minus.tex + ')^{2}') + ', which has a middle term. A difference of squares is a <b>difference times a sum</b>: ' + t('(' + d.minus.tex + ')(' + d.plus.tex + ')') + '.'));
    return { T: T, TF: TF, key: key, expr: expr, sol: L.join('<br>'), wrongs: ws };
  }

  /* ---------------- trinomials in a block u: (p u + q)(r u + s) ---------------- */
  function triSteps(p, q, r, s, Lt) {
    var X = M(1, Lt), X2 = P.mul(X, X), a = p * r, b = p * s + q * r, c = q * s;
    var tri = S(P.scale(X2, a), P.scale(X, b), N(c)), f0 = S(P.scale(X, p), N(q)), f1 = S(P.scale(X, r), N(s)), out = [];
    if (a === 1) out.push('Product ' + t(c) + ', sum ' + t(b) + ': ' + t(q) + ' and ' + t(s) + '.<br>' + t(tx(tri) + '=' + br(f0) + br(f1)));
    else {
      var m1 = p * s, m2 = q * r;
      out.push(t('ac=' + a + '(' + c + ')=' + a * c) + '; product ' + t(a * c) + ', sum ' + t(b) + ': ' + t(m1) + ' and ' + t(m2) + '.');
      out.push(t(tx(tri) + '=' + seq([P.scale(X2, a), P.scale(X, m1), P.scale(X, m2), N(c)])) + '<br>' + t('=' + tx(P.scale(X, p)) + br(f1) + sc1(q) + br(f1)) + '<br>' + t('=' + br(f1) + br(f0)));
    }
    return { lines: out, tri: tri, f0: f0, f1: f1, a: a, b: b, c: c };
  }
  /* o: { B: block monomial, Bt: its LaTeX, f: [[p,q],[r,s]], g: GCF (poly), expr, why, Bw: wrong block (e.g. x for x²), notes } */
  function blockTri(o) {
    var f = o.f, p = f[0][0], q = f[0][1], r = f[1][0], s = f[1][1], st = triSteps(p, q, r, s, 'u');
    var real = f.map(function (pq) { return fo(S(P.scale(o.B, pq[0]), N(pq[1]))); });
    var inner = P.mul(real[0].p, real[1].p), g = o.g || N(1), T = P.mul(g, inner), gt = tx(g), gs = gt === '1' ? '' : gt === '-1' ? '-' : gt;
    var steps = [], pieces = [];
    real.forEach(function (rf) { pieces = pieces.concat(fullSplit(rf, steps)); });
    var TF = merge((gs ? [fo(g)] : []).concat(pieces)), expr = o.expr || tx(T), key = ftex(TF);
    var L = [];
    if (gs) L.push('Take out the GCF, ' + t(gt) + ': ' + t(expr + '=' + gs + '(' + tx(inner) + ')'));
    else if (o.expr && o.expr !== tx(T)) L.push('In descending order: ' + t(tx(T)) + '.');
    L.push((o.why ? o.why + ' ' : '') + 'Let ' + t('u=' + o.Bt) + ': ' + t(tx(st.tri)) + '.');
    L = L.concat(st.lines);
    L.push('Replace ' + t('u') + ' by ' + t(o.Bt) + ': ' + t(gs + br(real[0].p) + br(real[1].p)));
    L = L.concat(steps);
    var notes = o.notes === false ? [] : pieces.map(stopNote).filter(Boolean); if (notes.length) L.push(notes.join('; ') + '.');
    L.push(t(expr + '=' + key));
    var ws = autoWrongs(TF, gs ? g : null);
    if (o.Bw) { var w0 = S(P.scale(o.Bw, p), N(q)), w1 = S(P.scale(o.Bw, r), N(s)); ws.push(wr((gs ? [fo(g)] : []).concat([fo(w0), fo(w1)]), 'block-back', 'Your brackets hold ' + t(tx(o.Bw)) + ' where they should hold the block ' + t(o.Bt) + '. When you replace ' + t('u') + ', put the whole block back.')); }
    if (q !== s || p !== r) { var x0 = S(P.scale(o.B, p), N(s)), x1 = S(P.scale(o.B, r), N(q)); if (!P.eq(P.mul(x0, x1), inner)) ws.push(wr((gs ? [fo(g)] : []).concat([fo(x0), fo(x1)]), 'swap-const', 'The constants are in the wrong brackets: your factors give a middle term of ' + t(tx(P.mul(g, S(P.scale(o.B, p * q + r * s))))) + '. Expand to check the middle term.')); }
    return { T: T, TF: TF, expr: expr, key: key, sol: L.join('<br>'), wrongs: ws, real: real, inner: inner, st: st };
  }
  function blockPart(prompt, o, x) {
    x = x || {}; var b = blockTri(o);
    return facPart(prompt || t(b.expr), b.TF, { wrong: b.wrongs.concat(x.wrong || []), sol: b.sol, hints: x.hints || (b.st.a === 1 ? H.block : H.dec), text: x.text || 'factor ' + plain(b.expr), good: x.good, bad: x.bad });
  }
  var X2 = M(1, 'x', 2);
  function B(v, e) { return M(1, v, e); }

  /* coefficient in front of a bracketed block: 2(a+b)², -(m+n), +5(a+b) */
  function cA(c, At, pw, first) { var s = c === 1 ? '' : c === -1 ? '-' : String(c); return (first || c < 0 ? '' : '+') + s + '(' + At + ')' + (pw ? '^{2}' : ''); }
  function cK(c) { return c === 0 ? '' : (c < 0 ? String(c) : '+' + c); }

  /* ---------------- multiple choice helpers ---------------- */
  function mcTex(r, prompt, opts, sol, hints, text, keepOrder) { return KP.mc(r, prompt, opts, sol, hints, text, keepOrder); }

  /* Q1 rows: (a) monic PST (b) non-square constant (c) (ax−1)² (d) both ends square, middle half (e) negative last (f) (ax−1)² */
  function q1Rows(r) {
    var k = r.int(4, 10), A = pst(B('a'), N(k));
    var mn = pickWhere(function () { return [r.int(2, 6), r.int(7, 12)]; }, function (v) { return !isSq(v[0] * v[1]); });
    var Bt = P.mul(S(B('x'), N(-mn[0])), S(B('x'), N(-mn[1])));
    var c1 = r.int(3, 7), C = pst(M(c1, 'x'), N(-1));
    var d = pickWhere(function () { return [r.int(2, 7), r.int(3, 10)]; }, function (v) { return v[0] !== v[1] && gcd(v[0], v[1]) === 1; });
    var D = S(M(d[0] * d[0], 'y', 2), M(d[0] * d[1], 'y'), N(d[1] * d[1]));
    var e = r.int(3, 8), em = r.pick([2, 4]) * e, E = S(B('a', 2), M(em, 'a'), N(-e * e));
    var f1 = r.pick([2, 3, 4, 5, 6, 7].filter(function (x) { return x !== c1; })), Fz = pst(M(f1, 'x'), N(-1));
    return [
      { tex: A.expr, yes: true, note: pstLine(A) + ' — <b>yes</b>, ' + t(A.key) + '.' },
      { tex: tx(Bt), yes: false, note: t(mn[0] * mn[1]) + ' is not a perfect square, so condition (2) fails — <b>no</b>.' },
      { tex: C.expr, yes: true, note: pstLine(C) + ' — <b>yes</b>, ' + t(C.key) + '.' },
      { tex: tx(D), yes: false, note: t('\\sqrt{' + d[0] * d[0] + 'y^{2}}=' + d[0] + 'y') + ', ' + t('\\sqrt{' + d[1] * d[1] + '}=' + d[1]) + ', but ' + t('2(' + d[0] + 'y)(' + d[1] + ')=' + 2 * d[0] * d[1] + 'y\\neq ' + d[0] * d[1] + 'y') + ' — <b>no</b>.' },
      { tex: tx(E), yes: false, note: 'The last term ' + t(-e * e) + ' is negative, so condition (2) fails — <b>no</b>.' },
      { tex: Fz.expr, yes: true, note: pstLine(Fz) + ' — <b>yes</b>, ' + t(Fz.key) + '.' }];
  }

  /* Q14 figure: right angle at P; PQ (vertical) drawn longer than PR, as in the question */
  var TRI_SVG = '<svg class="fig-svg" viewBox="0 0 220 170" width="100%" style="max-width:240px" role="img" aria-label="Right triangle PQR with the right angle at P">' +
    '<polygon points="40,150 130,150 40,20" fill="none" stroke="currentColor" stroke-width="2"/><polyline points="40,136 54,136 54,150" fill="none" stroke="currentColor" stroke-width="1.5"/>' +
    '<text x="26" y="162" font-size="15" font-style="italic" fill="currentColor">P</text><text x="136" y="162" font-size="15" font-style="italic" fill="currentColor">R</text><text x="34" y="14" font-size="15" font-style="italic" fill="currentColor">Q</text></svg>';

  /* EP14 four-term polynomials */
  function e14Shared(r) {
    var k = r.int(2, 9), cy = r.pick([1, 1, 2]);
    var a = { k: k, cy: cy, T: S(B('x', 2), M(2 * k, 'x'), N(k * k), M(-cy * cy, 'y', 2)) };
    a.TF = [fo(S(B('x'), N(k), M(-cy, 'y')), 1, 'x+' + k + '-' + tx(M(cy, 'y'))), fo(S(B('x'), N(k), M(cy, 'y')), 1, 'x+' + k + '+' + tx(M(cy, 'y')))];
    a.expr = seq([B('x', 2), M(2 * k, 'x'), N(k * k), M(-cy * cy, 'y', 2)]);
    var s1 = r.pick([1, 1, 2, 3]), t1 = r.pick([1, 1, 2, 3]);
    var b = { s: s1, tt: t1, terms: [M(1, { a: 1, x: 1 }), M(s1, { a: 1, y: 1 }), M(t1, { b: 1, x: 1 }), M(s1 * t1, { b: 1, y: 1 })] };
    b.T = S.apply(null, b.terms); b.expr = seq(b.terms); b.TF = [fo(S(B('x'), M(s1, 'y'))), fo(S(B('a'), M(t1, 'b')))];
    var cc = pickWhere(function () { return { m: r.int(2, 5), p: r.int(1, 5), n: r.int(1, 9) }; }, function (v) { return gcd(v.m, v.n) === 1 && v.n !== v.m; });
    var c = { m: cc.m, p: cc.p, n: cc.n, terms: [M(cc.m, 'x', 3), M(-cc.m * cc.p, 'x', 2), M(cc.n, 'x'), N(-cc.n * cc.p)] };
    c.T = S.apply(null, c.terms); c.expr = seq(c.terms); c.TF = [fo(S(B('x'), N(-cc.p))), fo(S(M(cc.m, 'x', 2), N(cc.n)))];
    var dk = r.int(2, 9), d = { k: dk, terms: [B('m', 2), M(-1, 'n', 2), M(2 * dk, 'n'), N(-dk * dk)] };
    d.T = S.apply(null, d.terms); d.expr = seq(d.terms);
    d.TF = [fo(S(B('m'), M(-1, 'n'), N(dk)), 1, 'm-n+' + dk), fo(S(B('m'), B('n'), N(-dk)), 1, 'm+n-' + dk)];
    var ee = pickWhere(function () { return { p: r.int(2, 5), q: r.int(1, 5), r: r.int(2, 7) }; }, function (v) { return gcd(v.p, v.q) === 1 && v.p !== v.q; });
    var base = S(M(ee.p, 'a'), M(-ee.q, 'b')), sq = P.mul(base, base), e = { p: ee.p, q: ee.q, rr: ee.r, base: base };
    e.terms = P.sorted(sq).map(function (T) { return P.mono(T.c, T.v); }).concat([N(-ee.r * ee.r)]); e.T = S.apply(null, e.terms); e.expr = seq(e.terms);
    e.bt = tx(base); e.TF = [fo(S(base, N(-ee.r)), 1, e.bt + '-' + ee.r), fo(S(base, N(ee.r)), 1, e.bt + '+' + ee.r)];
    var ff = pickWhere(function () { return { s: r.int(2, 7), m: r.int(2, 5), n: r.int(1, 9) }; }, function (v) { return gcd(v.m, v.n) === 1 && v.n !== v.m; });
    var f = { s: ff.s, m: ff.m, n: ff.n, terms: [M(ff.m, { p: 1, q: 1 }), M(-ff.m * ff.s, 'p'), M(ff.n, 'q'), N(-ff.n * ff.s)] };
    f.T = S.apply(null, f.terms); f.expr = seq(f.terms); f.TF = [fo(S(B('q'), N(-ff.s))), fo(S(M(ff.m, 'p'), N(ff.n)))];
    return { a: a, b: b, c: c, d: d, e: e, f: f };
  }

  /* EP16: (x² + bx)² + …, each bracket x² + bx − r = (x − u)(x − v) */
  function e16Gen(r, wantSquare) {
    return pickWhere(function () {
      var b = r.pick([-6, -4, -2, 2, 4, 6]), S0 = -b, pairs = [];
      for (var u = -7; u <= 7; u++) { var v = S0 - u; if (u > v || !u || !v || Math.abs(v) > 7) continue; pairs.push([u, v]); }
      var sqp = pairs.filter(function (pq) { return pq[0] === pq[1]; }), nsp = pairs.filter(function (pq) { return pq[0] !== pq[1]; });
      var A = wantSquare ? r.pick(sqp.length ? sqp : [[0, 0]]) : r.pick(nsp), Bq = r.pick(nsp);
      return { b: b, P1: A, P2: Bq };
    }, function (g) {
      if (!g.P1[0] && !g.P1[1]) return false;
      var r1 = -g.P1[0] * g.P1[1], r2 = -g.P2[0] * g.P2[1];
      if (g.P1[0] === g.P2[0] && g.P1[1] === g.P2[1]) return false;
      if (r1 === r2 || r1 + r2 === 0 || Math.abs(r1 * r2) > 60) return false;
      g.r1 = r1; g.r2 = r2; return true;
    });
  }

  HW.defineLesson({
    id: 'u4l5', unit: 4, num: '5', title: 'Further Factoring', outcome: 'AN5',
    blurb: 'Perfect square trinomials, trinomials hiding a monomial block (x², ab, x³ …), and differences of squares that keep on splitting.',
    questions: [
      /* ---------- Q1 three-part test ---------- */
      { num: '1', section: 'Part A — Perfect Squares, Disguised Trinomials and Differences of Squares', stem: 'Which of the following are perfect square trinomials?', parts: [
        { id: '1', level: 'BEG', make: function (r) {
          var rows = r.shuffle(q1Rows(r)), L = 'abcdef';
          var gr = rows.map(function (x, i) { return { id: 'r' + i, html: '(' + L[i] + ')&nbsp; ' + t(x.tex) }; }), want = {};
          rows.forEach(function (x, i) { want['r' + i] = x.yes ? 'y' : 'n'; });
          var p = KP.grid('For each trinomial, decide whether it is a perfect square trinomial.', gr, [{ id: 'y', html: 'Perfect square' }, { id: 'n', html: 'Not' }], want,
            { why: function (id) { var i = Number(id.slice(1)), x = rows[i]; return '(' + L[i] + ') ' + (x.yes ? 'passes all three conditions — check the middle term again.' : 'fails one of the three conditions: check the last term, then the middle term.'); } },
            rows.map(function (x, i) { return '(' + L[i] + ') ' + x.note; }).join('<br>'), H.pst, 'which are perfect square trinomials');
          return p;
        } }] },
      /* ---------- Q2 fill the blank ---------- */
      { num: '2', stem: 'Fill in each blank so that the trinomial is a perfect square trinomial.', parts: [
        { id: '2a', level: 'BEG', make: function (r) {
          var k = r.int(5, 12), T = M(2 * k, 'x');
          return blankPart(t('x^{2}+' + BL + '+' + k * k), T, [{ is: M(k, 'x'), code: 'not-doubled', hint: 'The middle term is <b>twice</b> the product of the square roots: ' + t('2(x)(' + k + ')') + '.' }, { is: N(2 * k), code: 'no-var', hint: 'The middle term needs the variable: ' + t('2(x)(' + k + ')') + ' has an ' + t('x') + ' in it.' }, { is: M(2 * k * k, 'x'), code: 'no-root', hint: 'Use the square <b>root</b> of the last term: ' + t('\\sqrt{' + k * k + '}=' + k) + '.' }],
            { signGiven: '+' }, t('\\sqrt{' + k * k + '}=' + k) + ', so the middle term is ' + t('2(x)(' + k + ')=' + 2 * k + 'x') + '.<br>' + t('x^{2}+' + 2 * k + 'x+' + k * k + '=(x+' + k + ')^{2}'), ['The middle term of a perfect square trinomial is twice the product of the square roots of the first and last terms.'], 'blank: x^2 + __ + ' + k * k);
        } },
        { id: '2b', level: 'BEG', make: function (r) {
          var k = r.int(6, 13), T = M(2 * k, 'x');
          return blankPart(t('x^{2}-' + BL + '+' + k * k), T, [{ is: M(k, 'x'), code: 'not-doubled', hint: 'The middle term is <b>twice</b> the product of the square roots: ' + t('2(x)(' + k + ')') + '.' }, { is: N(2 * k), code: 'no-var', hint: 'The middle term needs the variable: ' + t('2(x)(' + k + ')') + ' has an ' + t('x') + ' in it.' }, { is: M(2 * k * k, 'x'), code: 'no-root', hint: 'Use the square <b>root</b> of the last term: ' + t('\\sqrt{' + k * k + '}=' + k) + '.' }],
            { signGiven: '-' }, t('\\sqrt{' + k * k + '}=' + k) + ', so the middle term is ' + t('2(x)(' + k + ')=' + 2 * k + 'x') + ' (the minus sign is already printed).<br>' + t('x^{2}-' + 2 * k + 'x+' + k * k + '=(x-' + k + ')^{2}'), ['The middle term of a perfect square trinomial is twice the product of the square roots of the first and last terms.'], 'blank: x^2 - __ + ' + k * k);
        } },
        { id: '2c', level: 'EMG', make: function (r) {
          var g = pickWhere(function () { return { a: r.int(2, 5), b: r.int(3, 7) }; }, function (g) { return g.a !== g.b && gcd(g.a, g.b) === 1; }), a = g.a, b = g.b, T = M(2 * a * b, 'x');
          return blankPart(t(a * a + 'x^{2}+' + BL + '+' + b * b), T, [{ is: M(a * b, 'x'), code: 'not-doubled', hint: 'The middle term is <b>twice</b> the product of the square roots.' }, { is: N(2 * a * b), code: 'no-var', hint: 'The middle term needs the variable: the square root of ' + t(a * a + 'x^{2}') + ' is ' + t(a + 'x') + '.' },
            { is: M(2 * a * a * b, 'x'), code: 'no-root', hint: 'Use the square <b>root</b> of the first term: ' + t('\\sqrt{' + a * a + 'x^{2}}=' + a + 'x') + '.' }, { is: M(2 * a * b * b, 'x'), code: 'no-root', hint: 'Use the square <b>root</b> of the last term: ' + t('\\sqrt{' + b * b + '}=' + b) + '.' }, { is: M(2 * b, 'x'), code: 'no-root', hint: 'Don’t forget the coefficient: ' + t('\\sqrt{' + a * a + 'x^{2}}=' + a + 'x') + ', not ' + t('x') + '.' }],
            { signGiven: '+' }, t('\\sqrt{' + a * a + 'x^{2}}=' + a + 'x') + ', ' + t('\\sqrt{' + b * b + '}=' + b) + ', so the middle term is ' + t('2(' + a + 'x)(' + b + ')=' + 2 * a * b + 'x') + '.<br>' + t(a * a + 'x^{2}+' + 2 * a * b + 'x+' + b * b + '=(' + a + 'x+' + b + ')^{2}'), ['Take the square root of the first term (coefficient and variable) and of the last term, multiply them, then double.'], 'blank: ' + a * a + 'x^2 + __ + ' + b * b);
        } },
        { id: '2d', level: 'PRG', make: function (r) {
          var g = pickWhere(function () { return { a: r.int(2, 5), b: r.int(3, 9) }; }, function (g) { return g.a !== g.b && gcd(g.a, g.b) === 1; }), a = g.a, b = g.b, T = N(b * b);
          return blankPart(t(a * a + 'm^{2}+' + 2 * a * b + 'm+' + BL), T, [{ is: N(b), code: 'not-squared', hint: t(b) + ' is the square <b>root</b> of the last term. The last term itself is its square.' }, { is: N(a * a * b * b), code: 'half-root', hint: 'The middle term is ' + t('2(' + a + 'm)(k)') + ', not ' + t('2(m)(k)') + ': divide ' + t(2 * a * b + 'm') + ' by ' + t('2(' + a + 'm)') + ' to find ' + t('k') + '.' },
            { is: N(4 * b * b), code: 'not-halved', hint: 'Remember the <b>2</b> in “twice the product”: ' + t(2 * a * b + 'm=2(' + a + 'm)k') + '.' }, { is: M(b * b, 'm', 2), code: 'has-var', hint: 'The last term here is a constant — the ' + t('m^{2}') + ' is already in the first term.' }],
            {}, t('\\sqrt{' + a * a + 'm^{2}}=' + a + 'm') + '; we need ' + t(2 * a * b + 'm=2(' + a + 'm)k=' + 2 * a + 'mk') + ', so ' + t('k=' + b) + ' and the last term is ' + t('k^{2}=' + b * b) + '.<br>' + t(a * a + 'm^{2}+' + 2 * a * b + 'm+' + b * b + '=(' + a + 'm+' + b + ')^{2}'),
            ['Call the square root of the last term ' + t('k') + '. The middle term must be ' + t('2(' + a + 'm)(k)') + ' — solve for ' + t('k') + ', then square it.'], 'blank: ' + a * a + 'm^2 + ' + 2 * a * b + 'm + __');
        } },
        { id: '2e', level: 'EMG', make: function (r) {
          var g = pickWhere(function () { return { p: r.pick([3, 5, 7]), q: r.pick([1, 1, 2]) }; }, function (g) { return gcd(g.p, g.q) === 1; }), p = g.p, q = g.q, T = M([2 * q, p], 'a');
          var first = M([1, p * p], 'a', 2), ws = [{ is: M([q, p], 'a'), code: 'not-doubled', hint: 'The middle term is <b>twice</b> the product of the square roots.' }, { is: M([2 * q, p * p], 'a'), code: 'no-root', hint: 'Use the square <b>root</b> of the first term: ' + t('\\sqrt{\\frac{1}{' + p * p + '}a^{2}}=\\frac{1}{' + p + '}a') + '.' }, { is: N([2 * q, p]), code: 'no-var', hint: 'The middle term needs the variable ' + t('a') + '.' }];
          if (q > 1) ws.push({ is: M([2 * q * q, p], 'a'), code: 'no-root', hint: 'Use the square <b>root</b> of the last term: ' + t('\\sqrt{' + q * q + '}=' + q) + '.' });
          var o = pst(M([1, p], 'a'), N(q));
          return blankPart(t(tx(first) + '+' + BL + '+' + q * q), T, ws, { signGiven: '+' },
            t('\\sqrt{\\tfrac{1}{' + p * p + '}a^{2}}=\\tfrac{1}{' + p + '}a') + ', ' + t('\\sqrt{' + q * q + '}=' + q) + ', so the middle term is ' + t('2\\left(\\tfrac{1}{' + p + '}a\\right)(' + q + ')=' + tx(T)) + '.<br>' + t(o.expr + '=' + o.key), ['The square root of ' + t('\\frac{1}{' + p * p + '}a^{2}') + ' is ' + t('\\frac{1}{' + p + '}a') + ' (square root of the top and of the bottom). Then multiply by the other root and double.'], 'blank: (1/' + p * p + ')a^2 + __ + ' + q * q);
        } },
        { id: '2f', level: 'PRG', make: function (r) {
          var g = pickWhere(function () { return { b: r.int(2, 5), k: r.int(5, 12) }; }, function (g) { return gcd(g.b, g.k) === 1; }), b = g.b, k = g.k, T = N(k * k);
          return blankPart(t(BL + '-' + 2 * k * b + 'y+' + b * b + 'y^{2}'), T, [{ is: N(k), code: 'not-squared', hint: t(k) + ' is the square <b>root</b> of the missing term. The term itself is its square.' }, { is: N(k * k * b * b), code: 'half-root', hint: 'The middle term is ' + t('2(k)(' + b + 'y)') + ': divide ' + t(2 * k * b + 'y') + ' by ' + t('2(' + b + 'y)') + ' to find ' + t('k') + '.' },
            { is: N(4 * k * k), code: 'not-halved', hint: 'Remember the <b>2</b> in “twice the product”: ' + t(2 * k * b + 'y=2(k)(' + b + 'y)') + '.' }, { is: M(k * k, 'y', 2), code: 'has-var', hint: 'The ' + t('y^{2}') + ' term is already there (' + t(b * b + 'y^{2}') + '). The missing term is the constant.' }],
            {}, t('\\sqrt{' + b * b + 'y^{2}}=' + b + 'y') + '; we need ' + t(2 * k * b + 'y=2(' + b + 'y)k=' + 2 * b + 'yk') + ', so ' + t('k=' + k) + ' and the missing term is ' + t('k^{2}=' + k * k) + '.<br>' + t(k * k + '-' + 2 * k * b + 'y+' + b * b + 'y^{2}=(' + b + 'y-' + k + ')^{2}'),
            ['Here the blank is the constant term. Call its square root ' + t('k') + ': the middle term must be ' + t('2(k)(' + b + 'y)') + '.'], 'blank: __ - ' + 2 * k * b + 'y + ' + b * b + 'y^2');
        } }] },
      /* ---------- Q3 factor PSTs ---------- */
      { num: '3', stem: 'Factor each perfect square trinomial.', parts: [
        { id: '3a', level: 'EMG', make: function (r) {
          var a = r.int(2, 9), o = pst(M(a, 'x'), N(-1)), m = P.mul(o.base, o.base);
          return pstPart(t(o.expr), o, { solExtra: '<br>Verify by expanding: ' + t('(' + o.baseTex + ')(' + o.baseTex + ')=' + a * a + 'x^{2}-' + a + 'x-' + a + 'x+1=' + tx(m)) + ' ✓', hints: [H.pst[0], 'Then verify: expand your answer — you should get back ' + t(o.expr) + '.'] });
        } },
        { id: '3b', level: 'PRG', make: function (r) {
          var g = pickWhere(function () { return { a: r.int(2, 7), b: r.int(2, 7) }; }, function (g) { return g.a !== g.b && gcd(g.a, g.b) === 1; }), o = pst(M(g.a, 'x'), N(g.b), 'asc');
          return pstPart(t(o.expr), o, { solExtra: '', good: ['(' + g.b + '+' + g.a + 'x)^2'] });
        } },
        { id: '3c', level: 'PRG', make: function (r) {
          var g = pickWhere(function () { return { a: r.int(2, 7), b: r.int(2, 7) }; }, function (g) { return g.a !== g.b && gcd(g.a, g.b) === 1; }), o = pst(M(g.a, 'a'), M(-g.b, 'b'));
          return pstPart(t(o.expr), o);
        } },
        { id: '3d', level: 'PRG', make: function (r) {
          var g = pickWhere(function () { return { a: r.int(2, 5), b: r.pick([7, 9, 11, 13]) }; }, function (g) { return gcd(g.a, g.b) === 1; }), o = pst(M(g.a, 'x'), N(-g.b));
          return pstPart(t(o.expr), o);
        } }] },
      /* ---------- Q4 x⁴ trinomials ---------- */
      { num: '4', stem: 'Factor completely.', parts: [
        { id: '4a', level: 'EMG', make: function (r) {
          var g = pickWhere(function () { return { p: r.int(1, 7), q: r.int(2, 9) }; }, function (g) { return g.p < g.q && g.p * g.q <= 45; });
          return blockPart(null, { B: X2, Bt: 'x^{2}', Bw: B('x'), f: [[1, g.p], [1, g.q]], why: 'The degrees are ' + t('4,2,0') + ', so the block is ' + t('x^{2}') + '.' });
        } },
        { id: '4b', level: 'PRG', make: function (r) {
          var sq = r.pick([1, 4, 9]), ns = r.pick([2, 3, 5, 6, 7].filter(function (x) { return x !== sq; })), pq = r.shuffle([sq, ns]);
          return blockPart(null, { B: X2, Bt: 'x^{2}', Bw: B('x'), f: [[1, -pq[0]], [1, -pq[1]]], why: 'The degrees are ' + t('4,2,0') + ', so the block is ' + t('x^{2}') + '.' });
        } },
        { id: '4c', level: 'PRG', make: function (r) {
          var g = pickWhere(function () { return { p: r.int(1, 4), q: r.int(2, 5) }; }, function (g) { return g.p < g.q && g.p * g.q <= 15; });
          return blockPart(null, { B: B('a', 2), Bt: 'a^{2}', Bw: B('a'), f: [[1, -g.p * g.p], [1, -g.q * g.q]], why: 'The degrees are ' + t('4,2,0') + ', so the block is ' + t('a^{2}') + '.' });
        } }] },
      /* ---------- Q5 decomposition in a block ---------- */
      { num: '5', stem: 'Factor completely.', parts: [
        { id: '5a', level: 'PRG', make: function (r) {
          var g = pickWhere(function () { return { r: r.pick([2, 3, 5, 7]), q: r.int(1, 6), s: r.int(1, 6) }; }, function (g) { var b = g.r * g.q - g.s; return b !== 0 && gcd(g.r, g.s) === 1 && gcd(gcd(g.r, b), g.q * g.s) === 1 && Math.abs(b) <= 25; });
          return blockPart(null, { B: X2, Bt: 'x^{2}', Bw: B('x'), f: [[1, g.q], [g.r, -g.s]], why: 'The degrees are ' + t('4,2,0') + ', so the block is ' + t('x^{2}') + '.' });
        } },
        { id: '5b', level: 'PRG', make: function (r) {
          var g = pickWhere(function () { return { r: r.pick([2, 3, 5, 7]), p: r.int(1, 6), q: r.int(1, 7) }; }, function (g) { return gcd(g.r, g.q) === 1 && gcd(g.r, g.p * g.q) === 1 && g.q + g.r * g.p <= 40; });
          return blockPart(null, { B: M(1, { a: 1, b: 1 }), Bt: 'ab', f: [[1, -g.p], [g.r, -g.q]], why: 'The block is ' + t('ab') + ', since ' + t(g.r + 'a^{2}b^{2}=' + g.r + '(ab)^{2}') + '.', notes: false });
        } },
        { id: '5c', level: 'PRG', make: function (r) {
          var g = pickWhere(function () { return { m: r.pick([2, 3, 3, 4]), n: r.pick([2, 3, 3, 4]), p: r.int(1, 7), q: r.int(1, 7) }; }, function (g) { var b = g.n * g.p - g.m * g.q; return b !== 0 && gcd(g.m, g.p) === 1 && gcd(g.n, g.q) === 1 && gcd(gcd(g.m * g.n, b), g.p * g.q) === 1 && g.m * g.n * g.p * g.q <= 240; });
          var mn = g.m * g.n;
          return blockPart(null, { B: M(1, { x: 1, y: 1 }), Bt: 'xy', f: [[g.m, g.p], [g.n, -g.q]], why: 'The block is ' + t('xy') + ', since ' + t(mn + 'x^{2}y^{2}=' + mn + '(xy)^{2}') + '.', notes: false });
        } }] },
      /* ---------- Q6 differences of squares ---------- */
      { num: '6', stem: 'Factor completely.', parts: [
        { id: '6a', level: 'PRG', make: function (r) {
          var k = r.int(2, 5), d = dosFull(S(B('x', 4), N(-Math.pow(k, 4))));
          return facPart(t(d.expr), d.TF, { wrong: d.wrongs, sol: d.sol, hints: H.dos, text: 'factor ' + plain(d.expr) });
        } },
        { id: '6b', level: 'PRG', make: function (r) {
          var k = r.int(2, 5), d = dosFull(S(B('a', 4), M(-Math.pow(k, 4), 'b', 4)));
          return facPart(t(d.expr), d.TF, { wrong: d.wrongs, sol: d.sol, hints: H.dos, text: 'factor ' + plain(d.expr) });
        } },
        { id: '6c', level: 'PRG', make: function (r) {
          var g = r.pick([2, 3, 5, 6, 7]), k = r.pick([2, 3]), d = dosFull(S(B('z', 4), N(-Math.pow(k, 4))), N(g));
          return facPart(t(d.expr), d.TF, { wrong: d.wrongs, sol: d.sol, hints: H.dos, text: 'factor ' + plain(d.expr) });
        } },
        { id: '6d', level: 'ADV', make: function (r) {
          var g = r.pick([2, 3, 5]), m = r.pick([2, 3]), d = dosFull(S(M(Math.pow(m, 4), 'x', 4), M(-1, 'y', 4)), N(g));
          return facPart(t(d.expr), d.TF, { wrong: d.wrongs, sol: d.sol, hints: H.dos, text: 'factor ' + plain(d.expr) });
        } }] },
      /* ---------- Q7 GCF then PST ---------- */
      { num: '7', stem: 'In Lesson 1A you took the GCF out of an expression like this one. Now factor it <b>completely</b>.', parts: [
        { id: '7', level: 'PRG', make: function (r) {
          var g = r.pick([2, 3, 4, 5, 6, 8, 10, 12]), q = r.pick([1, 1, 2, 3]), G = M(-g, 'p'), inner = P.pow(S(B('p'), N(q)), 2), T = P.mul(G, inner), expr = tx(T);
          var TF = [fo(G), fo(S(B('p'), N(q)), 2)];
          return facPart(t(expr), TF, { wrong: [wr([fo(G), fo(S(B('p'), N(-q)), 2)], 'pst-sign', 'Check the sign inside the square: after taking out ' + t(-g + 'p') + ' the bracket is ' + t(tx(inner)) + ', with a <b>positive</b> middle term.'),
            wr([fo(G), fo(S(B('p'), N(q))), fo(S(B('p'), N(-q)))], 'pst-dos', t(tx(inner)) + ' is a perfect square trinomial, not a difference of squares: ' + t('(p+' + q + ')(p-' + q + ')=p^{2}-' + q * q) + '.'), wr([fo(G), fo(S(B('p'), N(q)))], 'pst-half', 'Your factors multiply to ' + t('-' + g + 'p(p+' + q + ')') + ' — the bracket is ' + t('(p+' + q + ')^{2}') + ', squared.')],
            sol: 'Take out ' + t(-g + 'p') + ' (negative, so the first term inside is positive): ' + t(expr + '=-' + g + 'p(' + tx(inner) + ')') + '<br>The bracket is a perfect square trinomial: ' + t('\\sqrt{p^{2}}=p') + ', ' + t('\\sqrt{' + q * q + '}=' + q) + ', ' + t('2(p)(' + q + ')=' + (2 * q === 1 ? '' : 2 * q) + 'p') + ' ✓<br>' + t(expr + '=-' + g + 'p(p+' + q + ')^{2}'),
            hints: ['Take out the GCF first — use a negative GCF so the bracket starts with a positive term.', 'Then test the trinomial in the bracket: is it a perfect square?'], text: 'factor completely ' + plain(expr) });
        } }] },
      /* ---------- Q8 find the error ---------- */
      { num: '8', stem: 'Identify and explain the error in each factorization. Then write the correct factored form (or state that it does not factor).',
        shared: function (r) {
          var a = pickWhere(function () { return { a: r.int(2, 5), b: r.int(1, 7) }; }, function (g) { return g.a !== g.b && gcd(g.a, g.b) === 1; });
          return { a: a, k8: r.int(2, 4), kc: r.int(4, 9) };
        },
        parts: [
          { id: '8a1', sub: 'a i', level: 'EMG', make: function (r, sh) {
            var a = sh.a.a, b = sh.a.b, o = pst(M(a, 'x'), N(-b));
            return mcTex(r, t(o.expr + '=(' + a + 'x+' + b + ')^{2}') + '<br>What is the error?', [
              { html: 'The middle term is negative, but ' + t('(' + a + 'x+' + b + ')^{2}') + ' has a positive middle term, ' + t('+' + 2 * a * b + 'x') + '. The bracket must have a minus sign.', right: true },
              { html: 'It should be a difference of squares, ' + t('(' + a + 'x-' + b + ')(' + a + 'x+' + b + ')') + '.', why: 'Expand it: ' + t('(' + a + 'x-' + b + ')(' + a + 'x+' + b + ')=' + a * a + 'x^{2}-' + b * b) + ' has no middle term. The trinomial is a perfect square — just check its sign.' },
              { html: 'The first term inside the bracket should be ' + t(a * a + 'x') + '.', why: t('\\sqrt{' + a * a + 'x^{2}}=' + a + 'x') + ', so ' + t(a + 'x') + ' is right. Look at the sign of the middle term.' },
              { html: 'There is no error.', why: 'Expand ' + t('(' + a + 'x+' + b + ')^{2}') + ': you get ' + t(a * a + 'x^{2}+' + 2 * a * b + 'x+' + b * b) + '. Compare the middle term with ' + t(tx(o.mid)) + '.' }],
              'Expanding the student’s answer gives ' + t('(' + a + 'x+' + b + ')^{2}=' + a * a + 'x^{2}+' + 2 * a * b + 'x+' + b * b) + ' — the wrong sign on the middle term. Because the middle term ' + t(tx(o.mid)) + ' is negative, the bracket must be ' + t(o.baseTex) + '.', ['Expand the student’s answer and compare it with the trinomial, term by term.'], 'error: PST sign');
          } },
          { id: '8a2', sub: 'a ii', level: 'BEG', make: function (r, sh) {
            var a = sh.a.a, b = sh.a.b, o = pst(M(a, 'x'), N(-b));
            return pstPart('Write the correct factored form of ' + t(o.expr) + '.', o, { wrong: [wr([fo(S(M(a, 'x'), N(b)), 2)], 'student-ans', 'That’s the student’s answer — it expands to a <b>positive</b> middle term.')], text: 'correct PST ' + plain(o.expr) });
          } },
          { id: '8b1', sub: 'b i', level: 'EMG', make: function (r, sh) {
            var k = sh.k8, k2 = k * k, k4 = k2 * k2;
            return mcTex(r, t('x^{4}-' + k4 + '=(x^{2}-' + k2 + ')(x^{2}+' + k2 + ')') + ', fully factored.<br>What is the error?', [
              { html: 'It is not finished: ' + t('x^{2}-' + k2) + ' is itself a difference of squares.', right: true },
              { html: t('x^{2}+' + k2) + ' should also be factored, as ' + t('(x+' + k + ')^{2}') + '.', why: t('(x+' + k + ')^{2}=x^{2}+' + 2 * k + 'x+' + k2) + ' — a sum of squares does not factor.' },
              { html: 'The signs are wrong: it should be ' + t('(x^{2}-' + k2 + ')^{2}') + '.', why: t('(x^{2}-' + k2 + ')^{2}=x^{4}-' + 2 * k2 + 'x^{2}+' + k4) + ', which has a middle term.' },
              { html: 'There is no error — it is fully factored.', why: 'Check each bracket: is ' + t('x^{2}-' + k2) + ' a difference of two perfect squares?' }],
              'The first step is right, but ' + t('x^{2}-' + k2 + '=(x-' + k + ')(x+' + k + ')') + ' factors again. ' + t('x^{2}+' + k2) + ' is a sum of squares and stops.', ['Look at each bracket in the answer. Can either one be factored again?'], 'error: not complete x^4-' + k4);
          } },
          { id: '8b2', sub: 'b ii', level: 'EMG', make: function (r, sh) {
            var k = sh.k8, d = dosFull(S(B('x', 4), N(-Math.pow(k, 4))));
            return facPart('Write the correct, complete factorization of ' + t(d.expr) + '.', d.TF, { wrong: d.wrongs, sol: d.sol, hints: H.dos, text: 'complete ' + plain(d.expr) });
          } },
          { id: '8c1', sub: 'c i', level: 'EMG', make: function (r, sh) {
            var k = sh.kc;
            return mcTex(r, t('x^{2}+' + k + 'x+' + k * k + '=(x+' + k + ')^{2}') + '<br>What is the error?', [
              { html: t('(x+' + k + ')^{2}=x^{2}+' + 2 * k + 'x+' + k * k) + ': the middle term would have to be ' + t(2 * k + 'x') + '. ' + t('x^{2}+' + k + 'x+' + k * k) + ' is not a perfect square trinomial.', right: true },
              { html: 'The sign is wrong: it should be ' + t('(x-' + k + ')^{2}') + '.', why: t('(x-' + k + ')^{2}=x^{2}-' + 2 * k + 'x+' + k * k) + ' — that has a negative middle term.' },
              { html: 'It is a difference of squares: ' + t('(x+' + k + ')(x-' + k + ')') + '.', why: t('(x+' + k + ')(x-' + k + ')=x^{2}-' + k * k) + ': two terms and a minus sign. The trinomial has three terms.' },
              { html: 'The number in the bracket should be halved: ' + t('(x+' + k / 2 + ')^{2}') + '.', why: t('(x+' + k / 2 + ')^{2}=x^{2}+' + k + 'x+' + k * k / 4) + ' — the last term would be ' + t(k * k / 4) + ', not ' + t(k * k) + '.' }],
              'Expand the student’s answer: ' + t('(x+' + k + ')^{2}=x^{2}+' + 2 * k + 'x+' + k * k) + '. For a perfect square the middle term must be twice ' + t(k + 'x') + ', so condition (3) fails.', ['Expand the student’s answer and compare the middle terms.'], 'error: not a PST x^2+' + k + 'x+' + k * k);
          } },
          { id: '8c2', sub: 'c ii', level: 'EMG', make: function (r, sh) {
            var k = sh.kc;
            return mcTex(r, 'What is the correct factored form of ' + t('x^{2}+' + k + 'x+' + k * k) + '?', [
              { html: 'It does not factor.', right: true },
              { html: t('(x+1)(x+' + k * k + ')'), why: t('1') + ' and ' + t(k * k) + ' multiply to ' + t(k * k) + ' but add to ' + t(k * k + 1) + ', not ' + t(k) + '.' },
              { html: t('(x+1)(x+' + (k - 1) + ')'), why: t('1') + ' and ' + t(k - 1) + ' add to ' + t(k) + ' but multiply to ' + t(k - 1) + ', not ' + t(k * k) + '.' },
              { html: t('(x+' + k + ')^{2}'), why: 'That’s the student’s answer: ' + t('(x+' + k + ')^{2}=x^{2}+' + 2 * k + 'x+' + k * k) + '.' }],
              'We need two integers with product ' + t(k * k) + ' and sum ' + t(k) + '. Every factor pair of ' + t(k * k) + ' with both numbers positive adds to more than ' + t(k) + ' (the smallest sum is ' + t(k + '+' + k + '=' + 2 * k) + '), so ' + t('x^{2}+' + k + 'x+' + k * k) + ' <b>does not factor</b>.', ['List the factor pairs of ' + t(k * k) + '. Does any pair add to ' + t(k) + '?'], 'does it factor: x^2+' + k + 'x+' + k * k);
          } }] },
      /* ---------- Part B ---------- */
      { num: '9', section: 'Part B — Multiple Choice and Numerical Response', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '9', level: 'EMG', make: function (r) {
          var k1 = r.int(6, 10), k2 = pickWhere(function () { return r.int(9, 12); }, function (v) { return v !== k1; });
          var c = pickWhere(function () { return { a: r.int(2, 4), b: r.pick([5, 7, 8]) }; }, function (g) { return gcd(g.a, g.b) === 1; });
          var dd = r.pick([[4, 5], [3, 5], [2, 5], [4, 3], [3, 4], [5, 2]]);
          var A = pst(B('x'), N(-k1)), Bq = pst(B('x'), N(k2), 'asc'), D = pst(M(dd[0], 'x', 2), N(dd[1]));
          var Ct = S(M(c.a * c.a, 'x', 2), M(-c.a * c.b, 'x'), N(c.b * c.b));
          var yes = function (o) { return 'It <i>is</i> a perfect square: ' + pstLine(o) + '.'; };
          return mcTex(r, 'From the expressions below, the one which does <b>not</b> represent a perfect square trinomial is', [
            { html: t(A.expr), why: yes(A) }, { html: t(Bq.expr), why: yes(Bq) }, { html: t(tx(Ct)), right: true }, { html: t(D.expr), why: yes(D) }],
            t(A.expr) + ': ' + pstLine(A) + '<br>' + t(Bq.expr) + ': ' + pstLine(Bq) + '<br>' + t(D.expr) + ': ' + pstLine(D) + '<br>' + t(tx(Ct)) + ': ' + t('\\sqrt{' + c.a * c.a + 'x^{2}}=' + c.a + 'x') + ', ' + t('\\sqrt{' + c.b * c.b + '}=' + c.b) + ', but ' + t('2(' + c.a + 'x)(' + c.b + ')=' + 2 * c.a * c.b + 'x\\neq ' + c.a * c.b + 'x') + ' — <b>not</b> a perfect square.',
            ['Run the three-part test on each option. Watch the middle term.'], 'which is not a PST');
        } }] },
      { num: '10', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '10', level: 'EMG', make: function (r) {
          var g = pickWhere(function () { return { p: r.int(1, 4), q: r.int(2, 5) }; }, function (g) { return g.p < g.q; }), p2 = g.p * g.p, q2 = g.q * g.q;
          var expr = seq([B('n', 4), N(p2 * q2), M(-(p2 + q2), 'n', 2)]);
          var bt = blockTri({ B: B('n', 2), Bt: 'n^{2}', f: [[1, -q2], [1, -p2]], expr: expr });
          return mcTex(r, 'The complete factorization of ' + t(expr) + ' is', [
            { html: t('(n^{2}-' + p2 + ')(n^{2}-' + q2 + ')'), why: 'Those brackets multiply back correctly, but each one is a difference of squares — it isn’t factored <b>completely</b>.' },
            { html: t('(n^{2}+' + p2 + ')(n^{2}+' + q2 + ')'), why: 'Expand: the middle term would be ' + t('+' + (p2 + q2) + 'n^{2}') + '. The signs are wrong.' },
            { html: t('n^{2}(n+' + p2 + ')(n+' + q2 + ')'), why: 'There is no common factor of ' + t('n^{2}') + ' (the constant term ' + t(p2 * q2) + ' has no ' + t('n') + '), and the brackets don’t multiply back.' },
            { html: t('(n+' + g.p + ')(n-' + g.p + ')(n+' + g.q + ')(n-' + g.q + ')'), right: true }],
            bt.sol + '<br>' + t('(n^{2}-' + p2 + ')(n^{2}-' + q2 + ')') + ' is only partly factored, ' + t('(n^{2}+' + p2 + ')(n^{2}+' + q2 + ')') + ' has the wrong signs and ' + t('n^{2}(n+' + p2 + ')(n+' + q2 + ')') + ' is not a factorization.', ['Rewrite in descending order first, then let ' + t('u=n^{2}') + '.', 'Check whether the brackets factor again.'], 'complete factorization of ' + plain(expr));
        } }] },
      { num: '11', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '11', level: 'EMG', make: function (r) {
          var k = r.int(2, 5), k2 = k * k, k4 = k2 * k2, full = t('z^{4}-' + k4 + '=(z^{2}-' + k2 + ')(z^{2}+' + k2 + ')=(z-' + k + ')(z+' + k + ')(z^{2}+' + k2 + ')');
          var right = r.pick(['z+' + k, 'z-' + k, 'z^{2}+' + k2]);
          var pool = r.sample(['z+' + k2, 'z-' + k2, 'z^{2}-' + k, 'z^{2}+' + k], 3);
          return mcTex(r, 'One factor of ' + t('z^{4}-' + k4) + ' is', [{ html: t(right), right: true }].concat(pool.map(function (x) { return { html: t(x), why: 'Factor completely first: ' + full + '. ' + t(x) + ' is not one of the factors.' }; })),
            full + '<br>The factors are ' + t('z-' + k) + ', ' + t('z+' + k) + ' and ' + t('z^{2}+' + k2) + ' (and products of these), so the answer is ' + t(right) + '.', ['Factor ' + t('z^{4}-' + k4) + ' completely, then compare with the options.'], 'one factor of z^4-' + k4);
        } }] },
      { num: '12', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '12', level: 'EMG', make: function (r) {
          var g = pickWhere(function () { return { p: r.int(1, 3), q: r.int(2, 5) }; }, function (g) { return g.p < g.q; }), p = g.p, q = g.q, p2 = p * p, q2 = q * q;
          var expr = tx(S(B('x', 4), M(-(p2 + q2), 'x', 2), N(p2 * q2))), lin = [S(B('x'), N(p)), S(B('x'), N(-p)), S(B('x'), N(q)), S(B('x'), N(-q))];
          var trueF = lin.concat([S(B('x', 2), N(-p2)), S(B('x', 2), N(-q2))]);
          var right = r.pick(lin), cands = [S(B('x', 2), N(q2)), S(B('x'), N(q2)), S(B('x'), N(-q2)), S(B('x', 2), N(p2)), S(B('x'), N(p2 + q2)), S(B('x'), N(-p2 * q2))];
          cands = cands.filter(function (c, i) { return !trueF.some(function (f) { return P.eq(f, c); }) && cands.slice(0, i).every(function (d) { return !P.eq(d, c); }); });
          var full = t(expr + '=(x^{2}-' + p2 + ')(x^{2}-' + q2 + ')=(x-' + p + ')(x+' + p + ')(x-' + q + ')(x+' + q + ')');
          return mcTex(r, 'One factor of ' + t(expr) + ' is', [{ html: t(tx(right)), right: true }].concat(r.sample(cands.slice(0, 4), 3).map(function (c) { return { html: t(tx(c)), why: 'Factor completely first: ' + full + '. ' + t(tx(c)) + ' is not among the factors.' }; })),
            'Let ' + t('u=x^{2}') + ': ' + t('u^{2}-' + (p2 + q2) + 'u+' + p2 * q2 + '=(u-' + p2 + ')(u-' + q2 + ')') + '.<br>' + full + '<br>So ' + t(tx(right)) + ' is a factor.', ['Let ' + t('u=x^{2}') + ' and factor, then factor each bracket again.'], 'one factor of ' + plain(expr));
        } }] },
      { num: '13', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '13', level: 'PRG', make: function (r) {
          var g = pickWhere(function () { return { A: r.pick([[2, 3], [3, 4], [2, 5], [3, 5], [4, 5], [5, 6], [4, 3], [3, 2], [5, 3], [1, 3], [2, 7]]), B: r.pick([[1, 2], [1, 3], [1, 4], [2, 3], [3, 4], [3, 2], [1, 5], [2, 5]]) }; },
            function (g) { var ab = g.A[0] * g.B[0] / (g.A[1] * g.B[1]); return !(g.A[0] === g.B[0] && g.A[1] === g.B[1]) && ab < 10 && Math.abs(ab * 100 - Math.round(ab * 100)) > 1e-6 && g.A[1] * g.B[1] <= 30; });
          var Am = M(g.A, 'x'), Bn = N(g.B), o = pst(Am, Bn), ab = g.A[0] * g.B[0] / (g.A[1] * g.B[1]), Af = ex.texRat(g.A), Bf = ex.texRat(g.B), abf = ex.texRat(ex.norm(g.A[0] * g.B[0], g.A[1] * g.B[1]));
          var near = function (v, x) { return Math.abs(v - K.roundTo(x, 2)) < 1e-9; };
          return KP.approx('The polynomial expression ' + t(o.expr) + ' can be written in the form ' + t('(Ax+B)^{2}') + '. The value of the product ' + t('AB') + ', to the nearest hundredth, is ________.', ab, 2,
            { nr: true, diag: function (v) {
              if (near(v, 2 * ab)) return { code: 'mid-coef', hint: 'That’s ' + t('2AB') + ', the middle coefficient. The question asks for ' + t('AB') + '.' };
              if (near(v, g.A[0] / g.A[1] + g.B[0] / g.B[1])) return { code: 'ab-sum', hint: 'That’s ' + t('A+B') + '. Multiply ' + t('A') + ' and ' + t('B') + '.' };
              if (near(v, ab * ab)) return { code: 'ab-sq', hint: 'Use the square <b>roots</b>: ' + t('A') + ' is the square root of the ' + t('x^{2}') + ' coefficient and ' + t('B') + ' is the square root of the constant.' };
              return null; } },
            'Expand: ' + t('(Ax+B)^{2}=A^{2}x^{2}+2ABx+B^{2}') + '.<br>Match the first and last terms: ' + t('A^{2}=' + ex.texRat(ex.norm(g.A[0] * g.A[0], g.A[1] * g.A[1])) + '\\Rightarrow A=' + Af) + ', ' + t('B^{2}=' + ex.texRat(ex.norm(g.B[0] * g.B[0], g.B[1] * g.B[1])) + '\\Rightarrow B=' + Bf) + '.<br>Check the middle term: ' + t('2AB=2\\left(' + Af + '\\right)\\left(' + Bf + '\\right)=' + tx(P.scale(N(g.A), [2 * g.B[0], g.B[1]]))) + ' ✓<br>' + t('AB=' + abf + '\\approx ' + K.roundTo(ab, 2).toFixed(2)),
            ['Expand ' + t('(Ax+B)^{2}') + ' and match it term by term with the trinomial.', t('A') + ' is the square root of the ' + t('x^{2}') + ' coefficient; ' + t('B') + ' is the square root of the constant.'], 'NR: AB for ' + plain(o.expr));
        } }] },
      { num: '14', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '14', level: 'ADV', make: function (r) {
          var g = pickWhere(function () { return { m: r.pick([3, 5, 7]), p: r.int(1, 4), q: r.int(1, 9), x: r.int(2, 5) }; }, function (g) {
            if (g.q % g.m === 0) return false;
            var L1 = g.x + g.p, L2 = g.m * g.x + g.q, D = L2 - L1, hyp = Math.sqrt(L1 * L1 + L2 * L2);
            return D > 0 && D + g.q - g.p > 0 && hyp < 99 && Math.abs(hyp - Math.round(hyp)) > 0.05;
          });
          var m = g.m, p = g.p, q = g.q, x0 = g.x, L1 = x0 + p, L2 = m * x0 + q, D = L2 - L1, hyp = Math.sqrt(L1 * L1 + L2 * L2);
          var prod = S(M(m, 'x', 2), M(q + m * p, 'x'), N(p * q)), area = P.scale(prod, [1, 2]), b = q + m * p;
          var near = function (v, x) { return Math.abs(v - K.roundTo(x, 1)) < 1e-9; };
          return KP.approx(TRI_SVG + '<br>Triangle ' + t('PQR') + ' is right-angled at ' + t('P') + '. The area of the triangle is ' + t(tx(area)) + ' cm' + t('^{2}') + ', where ' + t('x') + ' is a positive integer, and the lengths of ' + t('PR') + ' and ' + t('PQ') + ' are binomials in ' + t('x') + ' with integer coefficients. Given that the length of ' + t('PQ') + ' is ' + t(D) + ' cm more than the length of ' + t('PR') + ', the length of ' + t('QR') + ', to the nearest tenth of a cm, is ________.', hyp, 1,
            { nr: true, diag: function (v) {
              if (near(v, L2) || near(v, L1)) return { code: 'leg', hint: 'That’s the length of a <b>leg</b>. ' + t('QR') + ' is the hypotenuse: use the Pythagorean theorem.' };
              if (near(v, L1 + L2)) return { code: 'leg-sum', hint: 'The hypotenuse isn’t the sum of the legs — use ' + t('QR^{2}=PR^{2}+PQ^{2}') + '.' };
              if (near(v, Math.sqrt(L2 * L2 - L1 * L1))) return { code: 'subtracted', hint: t('QR') + ' is the hypotenuse, so <b>add</b> the squares of the legs.' };
              return null; } },
            'The legs are ' + t('PR') + ' and ' + t('PQ') + ', so ' + t('\\tfrac{1}{2}(PR)(PQ)=' + tx(area)) + ' and ' + t('(PR)(PQ)=' + tx(prod)) + '.<br>Factor by decomposition: ' + t('ac=' + m + '(' + p * q + ')=' + m * p * q) + '; product ' + t(m * p * q) + ', sum ' + t(b) + ': ' + t(m * p) + ' and ' + t(q) + '.<br>' + t(tx(prod) + '=' + m + 'x(x+' + p + ')+' + q + '(x+' + p + ')=(x+' + p + ')(' + m + 'x+' + q + ')') +
              '<br>The longer leg is ' + t('PQ=' + m + 'x+' + q) + ' and ' + t('PR=x+' + p) + ': ' + t('(' + m + 'x+' + q + ')-(x+' + p + ')=' + D + '\\Rightarrow ' + (m - 1) + 'x' + cK(q - p) + '=' + D + '\\Rightarrow x=' + x0) + '.<br>' + t('PR=' + L1) + ' cm, ' + t('PQ=' + L2) + ' cm, so ' + t('QR=\\sqrt{' + L1 + '^{2}+' + L2 + '^{2}}=\\sqrt{' + (L1 * L1 + L2 * L2) + '}\\approx ' + K.roundTo(hyp, 1).toFixed(1)) + ' cm.',
            ['Double the area to get the product of the legs, then factor that trinomial: the two binomials are the legs.', 'Use “' + t('PQ') + ' is ' + t(D) + ' more than ' + t('PR') + '” to find ' + t('x') + ', then the Pythagorean theorem.'], 'NR: hypotenuse from area ' + plain(tx(area)));
        } }] },
      /* ---------- Part C extension ---------- */
      { num: '15', section: 'Part C — Extension: Higher-Degree Disguises', stem: '<i>(Extension)</i> Factor completely.', parts: [
        { id: '15a', level: 'PRG', make: function (r) {
          var g = pickWhere(function () { return { p: r.pick([2, 3, 4, 5, 6, 7, 9]), q: r.pick([2, 3, 4, 5, 6, 7]) }; }, function (g) { return g.p > g.q && g.p * g.q <= 42; });
          return blockPart(null, { B: B('t', 3), Bt: 't^{3}', Bw: B('t'), f: [[1, -g.p], [1, g.q]], why: 'The degrees are ' + t('6,3,0') + ', so the block is ' + t('t^{3}') + '.', notes: false }, { hints: H.block });
        } },
        { id: '15b', level: 'PRG', make: function (r) {
          var g = pickWhere(function () { return { p: r.int(3, 9), q: r.int(2, 7) }; }, function (g) { return g.p > g.q && g.p * g.q <= 42; });
          return blockPart(null, { B: B('z', 5), Bt: 'z^{5}', Bw: B('z'), f: [[1, g.p], [1, -g.q]], why: 'The degrees are ' + t('10,5,0') + ', so the block is ' + t('z^{5}') + '.', notes: false });
        } }] },
      { num: '16', stem: '<i>(Extension)</i> Factor the polynomial expression completely.', parts: [
        { id: '16', level: 'ADV', make: function (r) {
          var g = pickWhere(function () { return { m: r.pick([2, 3, 5]), rr: r.pick([1, 1, 2, 3]), s: r.pick([2, 3, 5]) }; }, function (g) { return gcd(g.m, g.rr) === 1 && g.m * g.m * g.s * g.s + g.rr * g.rr <= 110; });
          return blockPart(null, { B: B('a', 4), Bt: 'a^{4}', Bw: B('a', 2), f: [[1, -g.s * g.s], [g.m * g.m, -g.rr * g.rr]], why: 'The degrees are ' + t('8,4,0') + ', so the block is ' + t('a^{4}') + '.' });
        } }] }
    ],

    extra: [
      /* ---------- EP A: the three-part test ---------- */
      { num: '1', section: 'Extra practice A — Running the Three-Part Test', stem: 'Do not factor yet. For each trinomial, run the three-part test: (1) the first term is a perfect square, (2) the last term is a perfect square and positive, (3) the middle term is twice the product of the square roots.', parts: [
        { id: 'e1', level: 'EMG', make: function (r) {
          var a = pickWhere(function () { return [r.int(2, 7), r.int(2, 7)]; }, function (v) { return v[0] !== v[1] && gcd(v[0], v[1]) === 1; }), A = pst(M(a[0], 'x'), M(a[1], 'y'));
          var b = pickWhere(function () { return [r.int(2, 8), r.int(1, 7)]; }, function (v) { return v[0] !== v[1] && gcd(v[0], v[1]) === 1; }), Bo = pst(M(b[0], 'a'), N(-b[1]));
          var c = pickWhere(function () { return [r.int(2, 6), r.int(2, 7)]; }, function (v) { return v[0] !== v[1] && gcd(v[0], v[1]) === 1; }), Ct = S(M(c[0] * c[0], 'm', 2), M(3 * c[0] * c[1], 'm'), N(c[1] * c[1]));
          var d = pickWhere(function () { return [r.int(2, 6), r.int(1, 7)]; }, function (v) { return v[0] !== v[1] && gcd(v[0], v[1]) === 1; }), D = pst(M(d[0], 'x', 2), N(d[1]));
          var e = pickWhere(function () { return [r.int(2, 5), r.int(1, 5)]; }, function (v) { return v[0] !== v[1] && gcd(v[0], v[1]) === 1; }), Et = S(M(e[0] * e[0], 'p', 2), M(-2 * e[0] * e[1], { p: 1, q: 1 }), M(-e[1] * e[1], 'q', 2));
          var f = pickWhere(function () { return [r.int(2, 5), r.int(1, 2)]; }, function (v) { return gcd(v[0], v[1]) === 1; }), Fo = pst(M([1, f[0]], 'x'), N(f[1]));
          var rows = [{ tex: A.expr, w: 'y', note: pstLine(A) }, { tex: Bo.expr, w: 'y', note: pstLine(Bo) },
            { tex: tx(Ct), w: 'c3', note: t('\\sqrt{' + c[0] * c[0] + 'm^{2}}=' + c[0] + 'm') + ', ' + t('\\sqrt{' + c[1] * c[1] + '}=' + c[1]) + ', but ' + t('2(' + c[0] + 'm)(' + c[1] + ')=' + 2 * c[0] * c[1] + 'm\\neq ' + 3 * c[0] * c[1] + 'm') + ' — condition (3) fails' },
            { tex: D.expr, w: 'y', note: pstLine(D) }, { tex: tx(Et), w: 'c2', note: 'the last term ' + t(tx(M(-e[1] * e[1], 'q', 2))) + ' is negative — condition (2) fails' }, { tex: Fo.expr, w: 'y', note: pstLine(Fo) }];
          rows = r.shuffle(rows);
          var L = 'abcdef', want = {};
          var gr = rows.map(function (x, i) { want['r' + i] = x.w; return { id: 'r' + i, html: '(' + L[i] + ')' }; });
          return KP.grid(rows.map(function (x, i) { return '(' + L[i] + ')&nbsp; ' + t(x.tex); }).join('<br>') + '<br>Choose the result of the test for each trinomial.', gr, [{ id: 'y', html: 'All hold' }, { id: 'c1', html: '(1) fails' }, { id: 'c2', html: '(2) fails' }, { id: 'c3', html: '(3) fails' }], want,
            { why: function (id, got) { var i = Number(id.slice(1)), x = rows[i]; if (x.w === 'y') return '(' + L[i] + '): check each condition again — all three hold.'; if (got === 'y') return '(' + L[i] + '): one condition fails — check the sign of the last term and the middle term.'; return '(' + L[i] + '): a different condition fails.'; } },
            rows.map(function (x, i) { return '(' + L[i] + ') ' + x.note + (x.w === 'y' ? ' — <b>a perfect square trinomial</b>.' : '.'); }).join('<br>'), H.pst, 'three-part test table');
        } }] },
      { num: '2', stem: 'Each of these fails <b>exactly one</b> of the three conditions.',
        shared: function (r) {
          var a = pickWhere(function () { return { a: r.pick([2, 3]), c: r.int(1, 2), b: r.int(3, 7) }; }, function (g) { return gcd(g.a, g.b) === 1 && g.c < g.a && gcd(g.c, g.b) === 1; });
          var b = pickWhere(function () { return { a: r.int(2, 5), b: r.int(6, 10), d: r.int(2, 5) }; }, function (g) { return g.d < g.b && gcd(g.a, g.b) === 1 && gcd(g.a, g.d) === 1; });
          var c = { k: r.int(3, 9) };
          var d = pickWhere(function () { return { p: r.int(3, 7), q: r.int(3, 6), d: r.int(1, 4) }; }, function (g) { return g.d < g.q && gcd(g.p, g.q) === 1 && gcd(g.p, g.d) === 1 && g.p !== g.q; });
          return { a: a, b: b, c: c, d: d,
            ta: S(M(a.a * a.a, 'x', 2), M(2 * a.c * a.b, 'x'), N(a.b * a.b)), tb: S(M(b.a * b.a, 'y', 2), M(-2 * b.a * b.d, 'y'), N(b.b * b.b)),
            tc: S(B('x', 2), M(2 * c.k, 'x'), N(-c.k * c.k)), td: S(M(d.p * d.p, 'a', 2), M(2 * d.p * d.d, { a: 1, b: 1 }), M(d.q * d.q, 'b', 2)) };
        },
        parts: [
          { id: 'e2', sub: 'name', level: 'EMG', make: function (r, sh) {
            var rows = [{ tex: tx(sh.ta), w: 'c3' }, { tex: tx(sh.tb), w: 'c3' }, { tex: tx(sh.tc), w: 'c2' }, { tex: tx(sh.td), w: 'c3' }], L = 'abcd', want = {};
            var gr = rows.map(function (x, i) { want['r' + i] = x.w; return { id: 'r' + i, html: '(' + L[i] + ')' }; });
            var a = sh.a, b = sh.b, d = sh.d;
            return KP.grid(rows.map(function (x, i) { return '(' + L[i] + ')&nbsp; ' + t(x.tex); }).join('<br>') + '<br>Name the condition that fails for each trinomial.', gr, [{ id: 'c1', html: '(1) first term' }, { id: 'c2', html: '(2) last term' }, { id: 'c3', html: '(3) middle term' }], want,
              { why: function (id) { var i = Number(id.slice(1)); return '(' + L[i] + '): ' + (rows[i].w === 'c2' ? 'look at the sign of the last term.' : 'both end terms are perfect squares — compare the middle term with twice the product of the roots.'); } },
              '(a) ' + t('2(' + a.a + 'x)(' + a.b + ')=' + 2 * a.a * a.b + 'x') + ', not ' + t(2 * a.c * a.b + 'x') + ' — (3) fails.<br>(b) ' + t('2(' + b.a + 'y)(' + b.b + ')=' + 2 * b.a * b.b + 'y') + ', not ' + t(2 * b.a * b.d + 'y') + ' — (3) fails.<br>(c) the last term ' + t(-sh.c.k * sh.c.k) + ' is negative — (2) fails.<br>(d) ' + t('2(' + d.p + 'a)(' + d.q + 'b)=' + 2 * d.p * d.q + 'ab') + ', not ' + t(2 * d.p * d.d + 'ab') + ' — (3) fails.', H.pst, 'which condition fails');
          } },
          { id: 'e2a', sub: 'a', level: 'PRG', make: function (r, sh) {
            var a = sh.a, R1 = pst(M(a.a, 'x'), N(a.b)), R2 = pst(M(a.c, 'x'), N(a.b));
            var p = KP.fields('Repair ' + t(tx(sh.ta)) + ' two ways. Write the factored form of each repaired trinomial.', [box('Change the middle term:', ['x'], 'Middle term changed'), box('Change the first term:', ['x'], 'First term changed')],
              [facChk(R1.TF, { wrong: pstWrongs(R1).concat([wr(R2.TF, 'swap', 'That keeps the middle term — this box changes the <b>middle</b> term and keeps the first term ' + t(a.a * a.a + 'x^{2}') + '.')]) }), facChk(R2.TF, { wrong: pstWrongs(R2).concat([wr(R1.TF, 'swap', 'That repair changes the middle term. Here keep ' + t(2 * a.c * a.b + 'x') + ' and change the <b>first</b> term.')]) })],
              [R1.key, R2.key], t(R1.expr + '=' + R1.key) + ' and ' + t(R2.expr + '=' + R2.key),
              'Condition (3) fails: ' + t('2(' + a.a + 'x)(' + a.b + ')=' + 2 * a.a * a.b + 'x') + ', not ' + t(2 * a.c * a.b + 'x') + '.<br><i>Repair 1:</i> middle term ' + t('\\to ' + 2 * a.a * a.b + 'x') + ': ' + t(R1.expr + '=' + R1.key) + '<br><i>Repair 2:</i> first term ' + t('\\to ' + tx(M(a.c * a.c, 'x', 2))) + ', since ' + t('2(' + tx(M(a.c, 'x')) + ')(' + a.b + ')=' + 2 * a.c * a.b + 'x') + ': ' + t(R2.expr + '=' + R2.key),
              ['Repair 1: keep the first and last terms; the middle must be twice the product of their roots.', 'Repair 2: keep the middle and last terms. Which first term ' + t('(kx)^{2}') + ' makes ' + t('2(kx)(' + a.b + ')=' + 2 * a.c * a.b + 'x') + '?'], 'repair ' + plain(tx(sh.ta)));
            return p;
          } },
          { id: 'e2b', sub: 'b', level: 'PRG', make: function (r, sh) {
            var b = sh.b, R1 = pst(M(b.a, 'y'), N(-b.b)), R2 = pst(M(b.a, 'y'), N(-b.d));
            return KP.fields('Repair ' + t(tx(sh.tb)) + ' two ways. Write the factored form of each repaired trinomial.', [box('Change the middle term:', ['y'], 'Middle term changed'), box('Change the last term:', ['y'], 'Last term changed')],
              [facChk(R1.TF, { wrong: pstWrongs(R1).concat([wr(R2.TF, 'swap', 'That repair changes the last term. In this box keep ' + t(b.b * b.b) + ' and change the <b>middle</b> term.')]) }), facChk(R2.TF, { wrong: pstWrongs(R2).concat([wr(R1.TF, 'swap', 'That repair changes the middle term. Here keep ' + t(-2 * b.a * b.d + 'y') + ' and change the <b>last</b> term.')]) })],
              [R1.key, R2.key], t(R1.expr + '=' + R1.key) + ' and ' + t(R2.expr + '=' + R2.key),
              'Condition (3) fails: ' + t('2(' + b.a + 'y)(' + b.b + ')=' + 2 * b.a * b.b + 'y') + ', not ' + t(2 * b.a * b.d + 'y') + '.<br><i>Repair 1:</i> middle term ' + t('\\to -' + 2 * b.a * b.b + 'y') + ': ' + t(R1.expr + '=' + R1.key) + '<br><i>Repair 2:</i> last term ' + t('\\to ' + b.d * b.d) + ', since ' + t('2(' + b.a + 'y)(' + b.d + ')=' + 2 * b.a * b.d + 'y') + ': ' + t(R2.expr + '=' + R2.key),
              ['Repair 1: keep the first and last terms; the middle must be twice the product of their roots.', 'Repair 2: keep the first and middle terms. Which number ' + t('k') + ' makes ' + t('2(' + b.a + 'y)(k)=' + 2 * b.a * b.d + 'y') + '? The last term is ' + t('k^{2}') + '.'], 'repair ' + plain(tx(sh.tb)));
          } },
          { id: 'e2c', sub: 'c', level: 'EMG', make: function (r, sh) {
            var k = sh.c.k, R = pst(B('x'), N(k));
            return pstPart('Repair ' + t(tx(sh.tc)) + ' by changing one term, and write the factored form of the repaired trinomial. (This one has only one repair.)', R,
              { sol: 'Condition (2) fails: the last term ' + t(-k * k) + ' is negative. The middle term is fine: ' + t('2(x)(' + k + ')=' + 2 * k + 'x') + '.<br>Repair: last term ' + t('\\to +' + k * k) + ': ' + t(R.expr + '=' + R.key), hints: ['Which condition fails? Change that term so it passes.'], text: 'repair ' + plain(tx(sh.tc)) });
          } },
          { id: 'e2d', sub: 'd', level: 'PRG', make: function (r, sh) {
            var d = sh.d, R1 = pst(M(d.p, 'a'), M(d.q, 'b')), R2 = pst(M(d.p, 'a'), M(d.d, 'b'));
            return KP.fields('Repair ' + t(tx(sh.td)) + ' two ways. Write the factored form of each repaired trinomial.', [box('Change the middle term:', ['a', 'b'], 'Middle term changed'), box('Change the last term:', ['a', 'b'], 'Last term changed')],
              [facChk(R1.TF, { wrong: pstWrongs(R1).concat([wr(R2.TF, 'swap', 'That repair changes the last term. In this box keep ' + t(d.q * d.q + 'b^{2}') + ' and change the <b>middle</b> term.')]) }), facChk(R2.TF, { wrong: pstWrongs(R2).concat([wr(R1.TF, 'swap', 'That repair changes the middle term. Here keep ' + t(2 * d.p * d.d + 'ab') + ' and change the <b>last</b> term.')]) })],
              [R1.key, R2.key], t(R1.expr + '=' + R1.key) + ' and ' + t(R2.expr + '=' + R2.key),
              'Condition (3) fails: ' + t('2(' + d.p + 'a)(' + d.q + 'b)=' + 2 * d.p * d.q + 'ab') + ', not ' + t(2 * d.p * d.d + 'ab') + '.<br><i>Repair 1:</i> middle term ' + t('\\to ' + 2 * d.p * d.q + 'ab') + ': ' + t(R1.expr + '=' + R1.key) + '<br><i>Repair 2:</i> last term ' + t('\\to ' + tx(M(d.d * d.d, 'b', 2))) + ', since ' + t('2(' + d.p + 'a)(' + tx(M(d.d, 'b')) + ')=' + 2 * d.p * d.d + 'ab') + ': ' + t(R2.expr + '=' + R2.key),
              ['Repair 1: keep the first and last terms; the middle must be twice the product of their roots.', 'Repair 2: keep the first and middle terms. Which ' + t('kb') + ' makes ' + t('2(' + d.p + 'a)(kb)=' + 2 * d.p * d.d + 'ab') + '?'], 'repair ' + plain(tx(sh.td)));
          } }] },
      { num: '3', stem: 'Read the pattern backwards. Fill in the blank so that the result is a perfect square trinomial, then state the factored form.', parts: [
        { id: 'e3a', level: 'EMG', make: function (r) {
          var g = pickWhere(function () { return [r.int(2, 7), r.int(2, 7)]; }, function (v) { return v[0] !== v[1] && gcd(v[0], v[1]) === 1; }), o = pst(M(g[0], 'x'), M(g[1], 'y'));
          return e3Part(t(g[0] * g[0] + 'x^{2}+' + BL + '+' + tx(o.B2)), o, o.mid, [{ is: P.mul(o.A, o.B), code: 'not-doubled', hint: 'The middle term is <b>twice</b> the product of the square roots.' }, { is: M(2 * g[0] * g[1], 'x'), code: 'no-var', hint: 'The middle term is ' + t('2(' + g[0] + 'x)(' + g[1] + 'y)') + ' — it has both letters.' }], { signGiven: '+' },
            t('\\sqrt{' + tx(o.A2) + '}=' + tx(o.A)) + ', ' + t('\\sqrt{' + tx(o.B2) + '}=' + tx(o.B)) + '; middle ' + t('=2(' + tx(o.A) + ')(' + tx(o.B) + ')=' + tx(o.mid)) + '.<br>' + t(o.expr + '=' + o.key), 'middle term');
        } },
        { id: 'e3b', level: 'PRG', make: function (r) {
          var g = pickWhere(function () { return [r.int(2, 5), r.int(2, 7)]; }, function (v) { return v[0] !== v[1] && gcd(v[0], v[1]) === 1; }), o = pst(M(g[0], 'a'), M(-g[1], 'b'));
          return e3Part(t(BL + tx(o.mid) + '+' + tx(o.B2)), o, o.A2, [{ is: o.A, code: 'not-squared', hint: t(tx(o.A)) + ' is the square <b>root</b> of the first term. The first term is its square.' }, { is: M(g[0] * g[0], 'a'), code: 'not-squared', hint: 'The first term must be a square: ' + t('(' + tx(o.A) + ')^{2}') + ' includes ' + t('a^{2}') + '.' }], {},
            t('\\sqrt{' + tx(o.B2) + '}=' + tx(o.Bp)) + '. Need ' + t('2(k)(' + tx(o.Bp) + ')=' + tx(absM(o.mid))) + ', so ' + t('k=' + tx(o.A)) + '.<br>First term ' + t('=(' + tx(o.A) + ')^{2}=' + tx(o.A2)) + '<br>' + t(o.expr + '=' + o.key), 'first term');
        } },
        { id: 'e3c', level: 'EMG', make: function (r) {
          var g = pickWhere(function () { return [r.int(2, 6), r.int(1, 7)]; }, function (v) { return v[0] !== v[1] && gcd(v[0], v[1]) === 1; }), o = pst(M(g[0], 'm', 2), N(g[1]));
          return e3Part(t(tx(o.A2) + '+' + BL + '+' + tx(o.B2)), o, o.mid, [{ is: P.mul(o.A, o.B), code: 'not-doubled', hint: 'The middle term is <b>twice</b> the product of the square roots.' }, { is: M(2 * g[0] * g[1], 'm'), code: 'no-root', hint: t('\\sqrt{' + tx(o.A2) + '}=' + tx(o.A)) + ' — the square root of ' + t('m^{4}') + ' is ' + t('m^{2}') + '.' }, { is: M(2 * g[0] * g[1], 'm', 4), code: 'no-root', hint: 'Use the square <b>root</b> of the first term, ' + t(tx(o.A)) + ', not the first term itself.' }], { signGiven: '+' },
            t('\\sqrt{' + tx(o.A2) + '}=' + tx(o.A)) + ', ' + t('\\sqrt{' + tx(o.B2) + '}=' + tx(o.B)) + '; middle ' + t('=2(' + tx(o.A) + ')(' + tx(o.B) + ')=' + tx(o.mid)) + '.<br>' + t(o.expr + '=' + o.key), 'middle term');
        } },
        { id: 'e3d', level: 'PRG', make: function (r) {
          var g = pickWhere(function () { return [r.int(2, 4), r.pick([3, 5, 7])]; }, function (v) { return v[0] < v[1] && gcd(v[0], v[1]) === 1; }), o = pst(M([g[0], g[1]], 'x'), N(1));
          return e3Part(t(tx(o.A2) + '+' + BL + '+1'), o, o.mid, [{ is: o.A, code: 'not-doubled', hint: 'The middle term is <b>twice</b> the product of the square roots.' }, { is: M([2 * g[0] * g[0], g[1] * g[1]], 'x'), code: 'no-root', hint: 'Use the square <b>root</b> of the first term: ' + t('\\sqrt{' + tx(o.A2) + '}=' + tx(o.A)) + '.' }, { is: N([2 * g[0], g[1]]), code: 'no-var', hint: 'The middle term needs the variable ' + t('x') + '.' }], { signGiven: '+' },
            t('\\sqrt{' + tx(o.A2) + '}=' + tx(o.A)) + ', ' + t('\\sqrt{1}=1') + '; middle ' + t('=2\\left(' + tx(o.A) + '\\right)(1)=' + tx(o.mid)) + '.<br>' + t(o.expr + '=' + o.key), 'middle term', { good: [ex.texRat([1, g[1] * g[1]]) + '(' + g[0] + 'x+' + g[1] + ')^2'] });
        } },
        { id: 'e3e', level: 'PRG', make: function (r) {
          var g = pickWhere(function () { return [r.int(2, 7), r.int(5, 11)]; }, function (v) { return v[0] !== v[1] && gcd(v[0], v[1]) === 1; }), a = g[0], b = g[1], o = pst(N(b), M(-a, 't'));
          o.key = '(' + b + '-' + a + 't)^{2}';
          return e3Part(t(b * b + '-' + 2 * a * b + 't+' + BL), o, o.B2, [{ is: M(a, 't'), code: 'not-squared', hint: t(a + 't') + ' is the square <b>root</b> of the missing term. The term itself is its square.' }, { is: M(a, 't', 2), code: 'not-squared', hint: 'Square the whole root, coefficient too: ' + t('(' + a + 't)^{2}') + '.' }, { is: N(a * a), code: 'has-var', hint: 'The missing term must contain ' + t('t^{2}') + ': it is ' + t('(kt)^{2}') + '.' }], {},
            t('\\sqrt{' + b * b + '}=' + b) + '. Need ' + t('2(' + b + ')(k)=' + 2 * a * b + 't') + ', so ' + t('k=' + a + 't') + '.<br>Last term ' + t('=(' + a + 't)^{2}=' + a * a + 't^{2}') + '<br>' + t(b * b + '-' + 2 * a * b + 't+' + a * a + 't^{2}=(' + b + '-' + a + 't)^{2}') + ', or ' + t('(' + a + 't-' + b + ')^{2}'), 'last term', { good: ['(' + a + 't-' + b + ')^2'] });
        } },
        { id: 'e3f', level: 'EMG', make: function (r) {
          var g = r.pick([[1, 1], [1, 1], [1, 2], [2, 1], [1, 3], [3, 1], [2, 3], [3, 2]]), o = pst(M(g[0], 'x', 2), M(g[1], 'y', 2));
          return e3Part(t(tx(o.A2) + '+' + BL + '+' + tx(o.B2)), o, o.mid, [{ is: P.mul(o.A, o.B), code: 'not-doubled', hint: 'The middle term is <b>twice</b> the product of the square roots.' }, { is: M(2 * g[0] * g[1], { x: 1, y: 1 }), code: 'no-root', hint: t('\\sqrt{' + tx(o.A2) + '}=' + tx(o.A)) + ' and ' + t('\\sqrt{' + tx(o.B2) + '}=' + tx(o.B)) + ': the roots have squares in them.' }, { is: M(2 * g[0] * g[1], { x: 4, y: 4 }), code: 'no-root', hint: 'Multiply the square <b>roots</b> (' + t(tx(o.A)) + ' and ' + t(tx(o.B)) + '), not the terms themselves.' }], { signGiven: '+' },
            t('\\sqrt{' + tx(o.A2) + '}=' + tx(o.A)) + ', ' + t('\\sqrt{' + tx(o.B2) + '}=' + tx(o.B)) + '; middle ' + t('=2(' + tx(o.A) + ')(' + tx(o.B) + ')=' + tx(o.mid)) + '.<br>' + t(o.expr + '=' + o.key), 'middle term');
        } }] },
      { num: '4', stem: 'Now factor. Every one of these is a perfect square trinomial — confirm the middle term as you go.', parts: [
        { id: 'e4a', level: 'PRG', make: function (r) { var g = pickWhere(function () { return [r.int(3, 9), r.int(2, 8)]; }, function (v) { return v[0] !== v[1] && gcd(v[0], v[1]) === 1; }); var o = pst(M(g[0], 'x'), M(g[1], 'y')); return pstPart(t(o.expr), o); } },
        { id: 'e4b', level: 'PRG', make: function (r) { var g = pickWhere(function () { return [r.int(4, 9), r.int(3, 9)]; }, function (v) { return v[0] !== v[1] && gcd(v[0], v[1]) === 1; }); var o = pst(M(g[0], 'a'), N(-g[1])); return pstPart(t(o.expr), o); } },
        { id: 'e4c', level: 'PRG', make: function (r) {
          var g = pickWhere(function () { return [r.int(2, 5), r.pick([2, 3, 5, 6, 7])]; }, function (v) { return gcd(v[0], v[1]) === 1; }), o = pst(M(g[0], 'm', 2), N(-g[1]));
          return pstPart(t(o.expr), o, { solExtra: '<br>' + t(g[1]) + ' is not a perfect square, so ' + t(o.baseTex) + ' stops.', wrong: [wr([fo(S(M(g[0], 'm'), N(-g[1])), 2), fo(S(M(g[0], 'm'), N(g[1])), 2)], 'not-square', t(o.baseTex) + ' is not a difference of two perfect squares (' + t(g[1]) + ' isn’t a perfect square), so it doesn’t factor again.')] });
        } },
        { id: 'e4d', level: 'PRG', make: function (r) {
          var g = pickWhere(function () { return [r.pick([2, 3]), r.int(1, 3)]; }, function (v) { return true; }), o = pst(M([1, g[0]], 'x'), M(g[1], 'y'));
          var c = g[0] * g[1];
          return pstPart(t(o.expr), o, { good: [ex.texRat([1, g[0] * g[0]]) + '(x+' + (c === 1 ? '' : c) + 'y)^2'], solExtra: '<br>(This can also be written ' + t(ex.texRat([1, g[0] * g[0]]) + '(x+' + (c === 1 ? '' : c) + 'y)^{2}') + '.)' });
        } },
        { id: 'e4e', level: 'PRG', make: function (r) { var g = pickWhere(function () { return [r.int(5, 12), r.int(2, 7)]; }, function (v) { return v[0] !== v[1] && gcd(v[0], v[1]) === 1; }); var o = pst(M(g[0], 'p'), M(g[1], 'q')); return pstPart(t(o.expr), o); } },
        { id: 'e4f', level: 'PRG', make: function (r) {
          var g = pickWhere(function () { return [r.int(3, 9), r.int(5, 12)]; }, function (v) { return v[0] !== v[1] && gcd(v[0], v[1]) === 1; }), o = pst(M(g[0], 't'), N(-g[1]), 'asc');
          return pstPart(t(o.expr), o, { sol: 'Reorder: ' + t(tx(o.T)) + '<br>' + pstSol(o), good: ['(' + g[1] + '-' + g[0] + 't)^2'] });
        } }] },
      /* ---------- EP B: substitution ---------- */
      { num: '5', section: 'Extra practice B — Substitution: Give the Block a Name', stem: 'In ' + t('a^{2}-b^{2}=(a-b)(a+b)') + ' the letter ' + t('a') + ' may stand for a whole expression. Let ' + t('A') + ' be the bracket, factor in terms of ' + t('A') + ', then replace ' + t('A') + ' and simplify inside each bracket.', parts: [
        { id: 'e5a', level: 'PRG', make: function (r) {
          var k = r.int(2, 9), A = S(B('x'), B('y'));
          return binDos(t('(x+y)^{2}-' + k * k), A, 'x+y', N(k), String(k), false);
        } },
        { id: 'e5b', level: 'PRG', make: function (r) {
          var c = r.pick([2, 3]), k = r.int(2, 7), A = S(M(c, 'm'), M(-1, 'n'));
          return binDos(t('(' + c + 'm-n)^{2}-' + k * k), A, c + 'm-n', N(k), String(k), false);
        } },
        { id: 'e5c', level: 'ADV', make: function (r) {
          var k = r.int(4, 9), c = r.int(2, 5), A = S(B('a'), M(c, 'b'));
          return binDos(t(k * k + '-(a+' + c + 'b)^{2}'), A, 'a+' + c + 'b', N(k), String(k), true);
        } },
        { id: 'e5d', level: 'PRG', make: function (r) {
          var c = r.int(2, 5), k = r.int(2, 6), A = S(M(c, 'p'), B('q'));
          return binDos(t('(' + c + 'p+q)^{2}-' + k * k + 'r^{2}'), A, c + 'p+q', M(k, 'r'), k + 'r', false);
        } }] },
      { num: '6', stem: 'Same idea, but now the block sits inside a trinomial. Let ' + t('A') + ' be the repeated bracket, factor the trinomial in ' + t('A') + ' (by decomposition where ' + t('a\\neq 1') + '), then substitute back and collect like terms inside every bracket.', parts: [
        { id: 'e6a', level: 'PRG', make: function (r) {
          var g = pickWhere(function () { return { r: r.pick([2, 3]), q: r.int(1, 4), s: r.int(1, 7) }; }, function (g) { return gcd(g.r, g.s) === 1 && g.s !== g.r * g.q; });
          return binTri(S(B('a'), B('b')), 'a+b', [[1, g.q], [g.r, g.s]]);
        } },
        { id: 'e6b', level: 'ADV', make: function (r) {
          var g = pickWhere(function () { return { r: r.pick([2, 3]), s: r.int(1, 7), q: r.int(1, 4), h: r.int(1, 5) }; }, function (g) { return gcd(g.r, g.s) === 1 && g.s !== g.r * g.q; });
          return binTri(S(B('x'), N(-g.h)), 'x-' + g.h, [[g.r, -g.s], [1, -g.q]]);
        } },
        { id: 'e6c', level: 'PRG', make: function (r) {
          var g = pickWhere(function () { return { m: r.int(1, 6), n: r.int(2, 8) }; }, function (g) { return g.m < g.n; });
          return binTri(S(B('p'), B('q')), 'p+q', [[1, -g.m], [1, -g.n]]);
        } },
        { id: 'e6d', level: 'ADV', make: function (r) {
          var g = pickWhere(function () { return { c: r.pick([2, 3]), e: r.pick([2, 3]), d: r.int(1, 5), f: r.int(1, 7) }; }, function (g) { var b = g.d * g.e - g.c * g.f; return b !== 0 && Math.abs(b) <= 9 && gcd(g.c, g.d) === 1 && gcd(g.e, g.f) === 1 && gcd(gcd(g.c * g.e, b), g.d * g.f) === 1; });
          return binTri(S(B('m'), B('n')), 'm+n', [[g.c, g.d], [g.e, -g.f]]);
        } }] },
      { num: '7', stem: 'Here the block is a monomial: let ' + t('A=x^{2}') + ' (or ' + t('y^{2}') + ', or ' + t('a^{2}') + '). Factor completely — in every one of these, <b>both</b> brackets factor again.', parts: [
        { id: 'e7a', level: 'PRG', make: function (r) { var q = r.int(2, 3); return e7Part('x', 1, q); } },
        { id: 'e7b', level: 'PRG', make: function (r) { var g = pickWhere(function () { return [r.int(2, 4), r.int(3, 6)]; }, function (v) { return v[0] < v[1] && v[0] * v[1] <= 20; }); return e7Part('y', g[0], g[1]); } },
        { id: 'e7c', level: 'PRG', make: function (r) { var q = r.int(4, 6); return e7Part('x', 1, q); } },
        { id: 'e7d', level: 'PRG', make: function (r) { var g = pickWhere(function () { return [r.int(2, 3), r.int(3, 5)]; }, function (v) { return v[0] < v[1]; }); return e7Part('a', g[0], g[1]); } }] },
      { num: '8', stem: 'Three questions about the substitution itself.',
        shared: function (r) {
          var a = pickWhere(function () { return { r: r.pick([2, 3]), q: r.int(1, 4), s: r.int(1, 7) }; }, function (g) { return gcd(g.r, g.s) === 1 && g.s !== g.r * g.q; });
          var b = pickWhere(function () { return { h: r.int(1, 5), q: r.int(1, 4) }; }, function (g) { return true; });
          var c = pickWhere(function () { return [r.pick([2, 3, 5, 6, 7]), r.pick([2, 3, 5, 6, 7])]; }, function (v) { return v[0] < v[1]; });
          return { a: a, b: b, c: c };
        },
        parts: [
          { id: 'e8a1', sub: 'a i', level: 'EMG', make: function (r, sh) {
            var g = sh.a, a = g.r, b = g.s + g.r * g.q, c = g.q * g.s, expr = cA(a, 'a+b', true, true) + cA(b, 'a+b') + cK(c);
            var ans = '(A+' + g.q + ')(' + g.r + 'A+' + g.s + ')';
            return mcTex(r, 'A student factors ' + t(expr) + ' and writes the final answer as ' + t(ans) + '. The factoring itself is right. What is missing?', [
              { html: 'The back-substitution: ' + t('A') + ' is a letter the student invented, so it must be replaced by ' + t('a+b') + ' and the brackets simplified.', right: true },
              { html: 'Nothing — ' + t(ans) + ' is fully factored.', why: 'The question is written in ' + t('a') + ' and ' + t('b') + '. An answer in ' + t('A') + ' isn’t an answer to it yet.' },
              { html: 'The brackets should be multiplied out.', why: 'Multiplying out would undo the factoring. The problem is the letter ' + t('A') + '.' },
              { html: t(g.r + 'A+' + g.s) + ' should be factored further.', why: t(g.r + 'A+' + g.s) + ' has no common factor and isn’t a difference of squares. Look at which letters the answer uses.' }],
              t('A') + ' is not in the question, so replace ' + t('A=a+b') + ':<br>' + t(ans + '=\\big((a+b)+' + g.q + '\\big)\\big(' + g.r + '(a+b)+' + g.s + '\\big)=(a+b+' + g.q + ')(' + g.r + 'a+' + g.r + 'b+' + g.s + ')'), ['Which letters appear in the question? Which appear in the answer?'], 'what is missing: back-substitution');
          } },
          { id: 'e8a2', sub: 'a ii', level: 'EMG', make: function (r, sh) {
            var g = sh.a, ans = '(A+' + g.q + ')(' + g.r + 'A+' + g.s + ')', TF = [fo(S(B('a'), B('b'), N(g.q)), 1, 'a+b+' + g.q), fo(S(M(g.r, 'a'), M(g.r, 'b'), N(g.s)), 1, g.r + 'a+' + g.r + 'b+' + g.s)];
            return facPart('Write the student’s answer ' + t(ans) + ' properly, with ' + t('A=a+b') + '.', TF, { sol: t(ans + '=\\big((a+b)+' + g.q + '\\big)\\big(' + g.r + '(a+b)+' + g.s + '\\big)') + '<br>' + t('=' + ftex(TF)), hints: ['Replace each ' + t('A') + ' by ' + t('(a+b)') + ', then expand the ' + t(g.r + '(a+b)') + ' inside the bracket.'], text: 'back-substitute A=a+b',
              wrong: [wr([fo(S(B('a'), B('b'), N(g.q))), fo(S(M(g.r, 'a'), B('b'), N(g.s)))], 'minus-bracket', 'In the second bracket, ' + t(g.r + '(a+b)=' + g.r + 'a+' + g.r + 'b') + ' — the ' + t(g.r) + ' multiplies <b>both</b> letters.')] });
          } },
          { id: 'e8b', sub: 'b', level: 'EMG', make: function (r, sh) {
            var h = sh.b.h, q = sh.b.q;
            return mcTex(r, 'After substituting ' + t('A=x-' + h) + ', a bracket ' + t('A-' + q) + ' becomes ' + t('x-' + h + '-' + q) + '. Why must you collect like terms inside every bracket before you stop?', [
              { html: t('x-' + h + '-' + q) + ' is not simplified: it is ' + t('x-' + (h + q)) + '. Unsimplified brackets hide the real factors, make checking harder, and can hide a common factor.', right: true },
              { html: 'Collecting like terms changes the value of the bracket, so it shows a different factor.', why: t('x-' + h + '-' + q) + ' and ' + t('x-' + (h + q)) + ' are equal for every ' + t('x') + ' — collecting doesn’t change the value.' },
              { html: 'You don’t have to: ' + t('(x-' + h + '-' + q + ')') + ' is a perfectly good final bracket.', why: 'A final answer should be simplified, just like any other expression.' },
              { html: 'Because every bracket must be expanded completely before you stop.', why: 'Expanding would undo the factoring. Collecting like terms <i>inside</i> a bracket is different.' }],
              t('x-' + h + '-' + q + '=x-' + (h + q)) + '. Writing brackets in simplest form shows the real factor, makes the check by expanding easier, and can reveal a common factor inside a bracket.', ['Is ' + t('x-' + h + '-' + q) + ' in simplest form?'], 'why collect like terms in brackets');
          } },
          { id: 'e8c1', sub: 'c i', level: 'EMG', make: function (r) {
            var q = r.int(2, 3), q2 = q * q;
            return mcTex(r, 'Factoring ' + t('x^{4}-' + (1 + q2) + 'x^{2}+' + q2) + ' with ' + t('A=x^{2}') + ' ends at ' + t('(A-1)(A-' + q2 + ')') + '. Why is that not the end of the question?', [
              { html: 'After replacing ' + t('A=x^{2}') + ', both ' + t('x^{2}-1') + ' and ' + t('x^{2}-' + q2) + ' are differences of squares, so they factor again.', right: true },
              { html: 'It is the end — the trinomial in ' + t('A') + ' is factored.', why: 'The answer must be in ' + t('x') + ', and then each bracket must be checked.' },
              { html: 'Because ' + t('(A-1)(A-' + q2 + ')') + ' must be expanded to check it.', why: 'Checking is a good idea, but it doesn’t finish the factoring.' },
              { html: 'Because ' + t('A-1') + ' and ' + t('A-' + q2) + ' have a common factor.', why: 'They don’t — but after replacing ' + t('A') + ', look at each bracket again.' }],
              'Replace ' + t('A=x^{2}') + ': ' + t('(x^{2}-1)(x^{2}-' + q2 + ')') + '. Both are differences of squares: ' + t('=(x-1)(x+1)(x-' + q + ')(x+' + q + ')') + '.', ['What do the brackets look like once ' + t('A') + ' is replaced by ' + t('x^{2}') + '?'], 'why not finished at (A-1)(A-q)');
          } },
          { id: 'e8c2', sub: 'c ii', level: 'EMG', make: function (r, sh) {
            var p = sh.c[0], q = sh.c[1];
            return blockPart('How would the answer change if the expression were ' + t(tx(S(B('x', 4), M(-(p + q), 'x', 2), N(p * q)))) + ' instead? Factor it completely.', { B: X2, Bt: 'x^{2}', Bw: B('x'), f: [[1, -p], [1, -q]] });
          } }] },
      /* ---------- EP C: several methods ---------- */
      { num: '9', section: 'Extra practice C — One Expression, Several Methods', stem: '<b>Common factor, then the disguised trinomial.</b> Remove the greatest common factor first, then factor what is left — and then look at <i>those</i> brackets.', parts: [
        { id: 'e9a', level: 'PRG', make: function (r) {
          var g = r.pick([2, 3, 5]), pq = pickWhere(function () { return [r.int(1, 4), r.int(2, 5)]; }, function (v) { return v[0] < v[1] && v[0] * v[1] <= 15; });
          return blockPart(null, { B: X2, Bt: 'x^{2}', Bw: B('x'), g: N(g), f: [[1, -pq[0] * pq[0]], [1, -pq[1] * pq[1]]] });
        } },
        { id: 'e9b', level: 'ADV', make: function (r) {
          var g = r.pick([2, 3, 5]), p = r.int(1, 3), s = r.pick([2, 3, 5, 6, 7]);
          return blockPart(null, { B: B('a', 2), Bt: 'a^{2}', Bw: B('a'), g: M(g, 'a'), f: [[1, -p * p], [1, -s]] });
        } },
        { id: 'e9c', level: 'PRG', make: function (r) {
          var gg = pickWhere(function () { return { g: r.pick([2, 3]), m: r.pick([2, 3, 5]), rr: r.int(1, 7), s: r.pick([2, 3, 5, 6, 7]) }; }, function (v) { return gcd(v.m, v.rr) === 1; });
          return blockPart(null, { B: X2, Bt: 'x^{2}', Bw: B('x'), g: N(gg.g), f: [[1, -gg.s], [gg.m, -gg.rr]] });
        } }] },
      { num: '10', stem: '<b>Common factor, then the difference of squares — twice.</b>', parts: [
        { id: 'e10a', level: 'PRG', make: function (r) {
          var g = r.pick([2, 3, 5]), k = r.pick([2, 3]), G = M(g, { m: 1, n: 1 }), d = dosFull(S(B('m', 4), N(-Math.pow(k, 4))), G);
          return facPart(t(d.expr), d.TF, { wrong: d.wrongs, sol: d.sol, hints: H.dos, text: 'factor ' + plain(d.expr) });
        } },
        { id: 'e10b', level: 'PRG', make: function (r) {
          var g = r.pick([1, 1, 2, 3]), G = M(g, { x: 1, y: 1 }), d = dosFull(S(B('x', 4), M(-1, 'y', 4)), G);
          return facPart(t(d.expr), d.TF, { wrong: d.wrongs, sol: d.sol, hints: H.dos, text: 'factor ' + plain(d.expr) });
        } },
        { id: 'e10c', level: 'ADV', make: function (r) {
          var g = r.pick([2, 3, 5]), m = r.pick([2, 3]), G = M(g, 'q'), d = dosFull(S(M(Math.pow(m, 4), 'p', 4), M(-1, 'q', 4)), G);
          return facPart(t(d.expr), d.TF, { wrong: d.wrongs, sol: d.sol, hints: H.dos, text: 'factor ' + plain(d.expr) });
        } }] },
      { num: '11', stem: '<b>A perfect square trinomial in disguise, and then the bracket again.</b> Each of these is a perfect square trinomial in ' + t('x^{2}') + ', ' + t('a^{2}') + ' or ' + t('m^{2}') + '. Factor it as a square — then decide whether the bracket inside the square factors further.',
        parts: [
          { id: 'e11a', level: 'PRG', make: function (r) { return e11Split(r.int(1, 2), 'x'); } },
          { id: 'e11b', level: 'PRG', make: function (r) { return e11Split(r.int(3, 5), 'a'); } },
          { id: 'e11c', level: 'EMG', make: function (r) {
            var g = pickWhere(function () { return [r.int(2, 5), r.pick([1, 1, 2, 3])]; }, function (v) { return gcd(v[0], v[1]) === 1; }), o = pst(M(g[0], 'x', 2), N(g[1]));
            return pstPart(t(o.expr), o, { solExtra: '<br>' + t(o.baseTex) + ' is a sum — it stops.', wrong: autoWrongs([fo(o.base)], null).map(function (w) { return { is: P.pow(w.is, 2), code: w.code, hint: w.hint }; }) });
          } },
          { id: 'e11d', level: 'EMG', make: function (r) {
            var g = pickWhere(function () { return [r.int(2, 5), r.pick([2, 3, 5, 6, 7])]; }, function (v) { return gcd(v[0], v[1]) === 1; }), o = pst(M(g[0], 'm', 2), N(-g[1]));
            return pstPart(t(o.expr), o, { solExtra: '<br>' + t(g[1]) + ' is not a perfect square — ' + t(o.baseTex) + ' stops.', wrong: [wr([fo(S(M(g[0], 'm'), N(-g[1])), 2), fo(S(M(g[0], 'm'), N(g[1])), 2)], 'not-square', t(o.baseTex) + ' is not a difference of two perfect squares (' + t(g[1]) + ' isn’t a perfect square), so it doesn’t factor again.')] });
          } },
          { id: 'e11e', level: 'EMG', make: function (r) {
            return mcTex(r, 'When a perfect square trinomial in ' + t('x^{2}') + ' is factored as a square, some answers go further and some stop. For example, ' + t('x^{4}-2x^{2}+1=(x^{2}-1)^{2}=(x-1)^{2}(x+1)^{2}') + ', but ' + t('16x^{4}+8x^{2}+1=(4x^{2}+1)^{2}') + ' stops. Which property of the bracket inside the square decides it?', [
              { html: 'The bracket factors again only when it is a <b>difference of two perfect squares</b>, like ' + t('x^{2}-1') + ' or ' + t('a^{2}-9') + '.', right: true },
              { html: 'The bracket factors again whenever its first term is a perfect square.', why: t('4x^{2}+1') + ' and ' + t('4m^{2}-3') + ' both start with a perfect square, but neither factors.' },
              { html: 'The bracket factors again whenever it has a minus sign.', why: t('4m^{2}-3') + ' has a minus sign but ' + t('3') + ' isn’t a perfect square, so it stops.' },
              { html: 'The bracket factors again whenever both of its terms are perfect squares.', why: t('4x^{2}+1') + ': both terms are perfect squares, but it’s a <b>sum</b> — it stops.' }],
              'The bracket factors again only when it is a difference of two perfect squares.<br>' + t('x^{2}-1') + ', ' + t('a^{2}-9') + ': differences of perfect squares — they factor.<br>' + t('4x^{2}+1') + ': a sum of squares — it stops.<br>' + t('4m^{2}-3') + ': a difference, but ' + t('3') + ' isn’t a perfect square — it stops.', ['Compare a bracket that split with one that didn’t: what does the one that split have?'], 'when does the bracket factor again', false);
          } }] },
      /* ---------- EP D: find the error ---------- */
      { num: '12', section: 'Extra practice D — Find the Error', stem: function (sh) { return 'Asked to factor ' + t('x^{2}+' + 2 * sh.k + 'x+' + sh.k * sh.k) + ', a student wrote ' + t('x^{2}+' + 2 * sh.k + 'x+' + sh.k * sh.k + '=(x+' + sh.k + ')(x-' + sh.k + ')') + ', saying “both ' + t('x^{2}') + ' and ' + t(sh.k * sh.k) + ' are perfect squares, so it is a difference of squares.”'; },
        shared: function (r) { return { k: r.int(3, 9) }; },
        parts: [
          { id: 'e12a', sub: 'a', level: 'BEG', make: function (r, sh) {
            var k = sh.k;
            return mcTex(r, 'Run the three-part test on ' + t('x^{2}+' + 2 * k + 'x+' + k * k) + '. What kind of expression is it?', [
              { html: 'A perfect square trinomial', right: true },
              { html: 'A difference of squares', why: 'A difference of squares has exactly <b>two</b> terms joined by a <b>minus</b> sign. This has three terms.' },
              { html: 'A trinomial that does not factor', why: 'Run the test: ' + t('x^{2}=(x)^{2}') + ', ' + t(k * k + '=' + k + '^{2}') + ', and ' + t('2(x)(' + k + ')=' + 2 * k + 'x') + ' — all three conditions hold.' },
              { html: 'A sum of squares', why: 'It has a middle term, so it isn’t just a sum of two squares. Check the three conditions.' }],
              '(1) ' + t('x^{2}=(x)^{2}') + ' ✓ (2) ' + t(k * k + '=' + k + '^{2}') + ', positive ✓ (3) ' + t('2(x)(' + k + ')=' + 2 * k + 'x') + ' ✓ — a <b>perfect square trinomial</b>, not a difference of squares.', H.pst, 'what kind of expression');
          } },
          { id: 'e12b', sub: 'b', level: 'BEG', make: function (r, sh) {
            var k = sh.k, o1 = (1 + k) * (1 + k), s1 = 1 - k * k;
            var p = KP.fields('Expand the student’s answer ' + t('(x+' + k + ')(x-' + k + ')') + ', then substitute ' + t('x=1') + ' into the original and into the student’s answer.',
              [box('Expansion of ' + t('(x+' + k + ')(x-' + k + ')') + ':', ['x'], 'Expansion'), { name: 'Original at x = 1', label: 'Original at ' + t('x=1') + ':' }, { name: 'Student’s answer at x = 1', label: 'Student’s answer at ' + t('x=1') + ':' }],
              [K.poly(S(B('x', 2), N(-k * k)), { wrong: [{ is: S(B('x', 2), M(2 * k, 'x'), N(-k * k)), code: 'sign', hint: 'The middle terms ' + t('-' + k + 'x') + ' and ' + t('+' + k + 'x') + ' cancel.' }, { is: S(B('x', 2), N(k * k)), code: 'sign', hint: t(k + '\\times(-' + k + ')=-' + k * k) + '.' }] }),
                K.number(o1, function (v) { return v === s1 ? { code: 'student-ans', hint: 'That’s the student’s answer at ' + t('x=1') + '. Use the original trinomial here.' } : null; }),
                K.number(s1, function (v) { return v === o1 ? { code: 'student-ans', hint: 'That’s the original at ' + t('x=1') + '. Use the student’s answer here.' } : v === -s1 ? { code: 'sign', hint: t('1-' + k * k + '=' + s1) + '.' } : null; })],
              ['x^{2}-' + k * k, String(o1), String(s1)], t('x^{2}-' + k * k) + ', ' + t(o1) + ', ' + t(s1),
              t('(x+' + k + ')(x-' + k + ')=x^{2}-' + k + 'x+' + k + 'x-' + k * k + '=x^{2}-' + k * k) + '<br>At ' + t('x=1') + ': original ' + t('1+' + 2 * k + '+' + k * k + '=' + o1) + '; student ' + t('1-' + k * k + '=' + s1) + '.<br>' + t(o1 + '\\neq ' + s1) + ', so the factoring is <b>wrong</b>.',
              ['Expand with FOIL — the middle terms cancel.', 'Replace every ' + t('x') + ' with ' + t('1') + ' and evaluate each side.'], 'expand and test x=1');
            p.bad = [['x^2+' + k * k, String(s1), String(o1)]];
            return p;
          } },
          { id: 'e12c', sub: 'c', level: 'BEG', make: function (r, sh) {
            var o = pst(B('x'), N(sh.k));
            return pstPart('Factor ' + t(o.expr) + ' correctly.', o, { wrong: [wr([fo(S(B('x'), N(sh.k))), fo(S(B('x'), N(-sh.k)))], 'student-ans', 'That’s the student’s answer — it multiplies to ' + t('x^{2}-' + sh.k * sh.k) + '.')], text: 'correct factoring of ' + plain(o.expr) });
          } },
          { id: 'e12d', sub: 'd', level: 'EMG', make: function (r, sh) {
            return mcTex(r, 'Which sentence about <i>how many terms</i> and <i>which sign</i> would have stopped the student?', [
              { html: 'A difference of squares has exactly <b>two</b> terms joined by a <b>minus</b> sign, so a trinomial can never be one.', right: true },
              { html: 'A difference of squares must start with a negative term.', why: t('x^{2}-9') + ' starts with a positive term and is a difference of squares. Count the terms instead.' },
              { html: 'Whenever the first and last terms are perfect squares, the expression is a difference of squares.', why: 'That’s exactly the student’s mistake: ' + t('x^{2}+' + 2 * sh.k + 'x+' + sh.k * sh.k) + ' has perfect-square ends but three terms.' },
              { html: 'A trinomial with only plus signs can never be factored.', why: 'This one can: it is ' + t('(x+' + sh.k + ')^{2}') + '.' }],
              'A difference of squares ' + t('a^{2}-b^{2}') + ' has exactly two terms and a minus sign between them. A three-term expression is never one, however many of its terms are perfect squares.', ['Look at the form ' + t('a^{2}-b^{2}') + ': how many terms? Which sign?'], 'the sentence that stops the error');
          } }] },
      { num: '13', stem: function (sh) { return 'Asked to factor ' + t('k^{4}-' + (sh.p * sh.p + sh.q * sh.q) + 'k^{2}+' + sh.p * sh.p * sh.q * sh.q) + ' completely, a student let ' + t('A=k^{2}') + ', factored ' + t('A^{2}-' + (sh.p * sh.p + sh.q * sh.q) + 'A+' + sh.p * sh.p * sh.q * sh.q + '=(A-' + sh.p * sh.p + ')(A-' + sh.q * sh.q + ')') + ', substituted back and wrote ' + t('k^{4}-' + (sh.p * sh.p + sh.q * sh.q) + 'k^{2}+' + sh.p * sh.p * sh.q * sh.q + '=(k^{2}-' + sh.p * sh.p + ')(k^{2}-' + sh.q * sh.q + ')') + '.'; },
        shared: function (r) { var g = pickWhere(function () { return { p: r.int(1, 4), q: r.int(2, 6) }; }, function (g) { return g.p < g.q && g.p * g.q <= 15; }); return g; },
        parts: [
          { id: 'e13a', sub: 'a', level: 'BEG', make: function (r, sh) {
            var p2 = sh.p * sh.p, q2 = sh.q * sh.q, T = S(B('k', 4), M(-(p2 + q2), 'k', 2), N(p2 * q2));
            var pt = KP.poly('Is the line the student wrote true? Expand ' + t('(k^{2}-' + p2 + ')(k^{2}-' + q2 + ')') + '.', T, { wrong: [{ is: S(B('k', 4), M(p2 + q2, 'k', 2), N(p2 * q2)), code: 'sign', hint: 'Both middle products are negative: ' + t('-' + q2 + 'k^{2}') + ' and ' + t('-' + p2 + 'k^{2}') + '.' }, { is: S(B('k', 4), N(p2 * q2)), code: 'foil', hint: 'Don’t skip the Outside and Inside products.' }] },
              t('(k^{2}-' + p2 + ')(k^{2}-' + q2 + ')=k^{4}-' + q2 + 'k^{2}-' + p2 + 'k^{2}+' + p2 * q2 + '=' + tx(T)) + ' ✓<br><b>Yes</b>, the line is true — but it is not factored completely.', ['Multiply with FOIL and collect the ' + t('k^{2}') + ' terms.'], 'expand student line');
            return pt;
          } },
          { id: 'e13b', sub: 'b', level: 'PRG', make: function (r, sh) {
            return blockPart('The instruction was “factor completely.” Finish the question: factor ' + t(tx(S(B('k', 4), M(-(sh.p * sh.p + sh.q * sh.q), 'k', 2), N(sh.p * sh.p * sh.q * sh.q)))) + ' completely.', { B: B('k', 2), Bt: 'k^{2}', Bw: B('k'), f: [[1, -sh.p * sh.p], [1, -sh.q * sh.q]] });
          } },
          { id: 'e13c', sub: 'c', level: 'EMG', make: function (r) {
            var k = r.int(3, 9), ot = 'x^{2}+' + 2 * k + 'x+' + k * k;
            return mcTex(r, 'Another student, asked to factor ' + t(ot) + ', wrote ' + t(ot + '=(x+' + k + ')(x-' + k + ')') + ', calling it a difference of squares. That student and the one above made opposite mistakes. Which description, and which final check, is right?', [
              { html: 'The other student used a difference of squares on something that isn’t one; this student stopped before factoring brackets that <i>are</i> differences of squares. Check: for every bracket, is there a common factor, a difference of squares, or a trinomial that factors?', right: true },
              { html: 'Both students forgot to take out a common factor. Check: always take out the GCF.', why: 'Neither expression has a common factor. The mistakes are about differences of squares.' },
              { html: 'The other student stopped too early and this student went too far. Check: never factor a bracket twice.', why: 'It’s the other way round, and “factor completely” often needs a second round on a bracket.' },
              { html: 'Both students made sign errors. Check: expand the answer.', why: 'This student’s line was true. Expanding catches wrong answers like the other student’s, but not unfinished ones like this student’s.' }],
              'The other student called a perfect square trinomial a difference of squares; this student stopped while two brackets were still differences of squares. Before writing a final answer, ask of <b>each</b> bracket: a common factor? a difference of two perfect squares? a trinomial that factors? Stop only when every answer is no.', ['One student did too much with the wrong pattern; the other did too little.'], 'opposite mistakes');
          } }] },
      /* ---------- EP E: four terms ---------- */
      { num: '14', section: 'Extra practice E — Four Terms: Grouping, or Something Else?', stem: 'Every polynomial in this question has four terms, but they do not all want the same treatment.',
        shared: e14Shared,
        parts: [
          { id: 'e14', sub: 'decide', level: 'EMG', make: function (r, sh) {
            /* rows shown in a shuffled order (labelled by the polynomial itself) so the answer pattern is not always the same */
            var want = { a: '31', b: '22', c: '22', d: '31', e: '31', f: '22' }, order = r.shuffle(['a', 'b', 'c', 'd', 'e', 'f']);
            var note = { a: t('x^{2}+' + 2 * sh.a.k + 'x+' + sh.a.k * sh.a.k) + ' is a perfect square trinomial.', b: 'no squares; the pairs share ' + t('a') + ' and ' + t('b') + '.', c: 'no square pattern.',
              d: t('-(n^{2}-' + 2 * sh.d.k + 'n+' + sh.d.k * sh.d.k + ')') + ' is a perfect square, with the lone square ' + t('m^{2}') + '.', e: 'the first three terms are ' + t('(' + sh.e.bt + ')^{2}') + '.', f: 'no squares.' };
            var rows = order.map(function (k) { return { id: k, html: t(sh[k].expr) }; });
            return KP.grid('For each polynomial, would you split it ' + t('2+2') + ' (factoring by grouping) or ' + t('3+1') + ' (three terms forming a perfect square trinomial, leaving a difference of squares)?', rows, [{ id: '22', html: t('2+2') }, { id: '31', html: t('3+1') }], want,
              { why: function (id) { return t(sh[id].expr) + ': ' + (want[id] === '31' ? 'count the perfect-square terms: three of them, with a lone square subtracted.' : 'there is no perfect square trinomial here — the terms fall into two pairs with common factors.'); } },
              order.map(function (k) { return t(sh[k].expr) + ' — ' + t(want[k] === '31' ? '3+1' : '2+2') + ': ' + note[k]; }).join('<br>'),
              ['A ' + t('3+1') + ' problem has three perfect-square terms, and a lone square with a minus sign in front of it.'], 'grouping or 3+1');
          } },
          { id: 'e14a', sub: 'a', level: 'PRG', make: function (r, sh) {
            var a = sh.a, yt = tx(M(a.cy, 'y'));
            return facPart('Factor (a) completely: ' + t(a.expr), a.TF, { sol: t('3+1') + ': ' + t('(x^{2}+' + 2 * a.k + 'x+' + a.k * a.k + ')-' + tx(M(a.cy * a.cy, 'y', 2))) + '<br>' + t('=(x+' + a.k + ')^{2}-(' + yt + ')^{2}') + '<br>' + t('=' + ftex(a.TF)), hints: ['Group the three terms that make a perfect square trinomial, then use the difference of squares.'], text: 'factor ' + plain(a.expr),
              wrong: [wr([fo(S(B('x'), N(a.k), M(-a.cy, 'y')), 2)], 'dos-square', 'A difference of squares ' + t('A^{2}-B^{2}') + ' is ' + t('(A-B)(A+B)') + ', not ' + t('(A-B)^{2}') + '.')] });
          } },
          { id: 'e14b', sub: 'b', level: 'EMG', make: function (r, sh) {
            var b = sh.b;
            return facPart('Factor (b) completely: ' + t(b.expr), b.TF, { sol: t('2+2') + ': ' + t('a(' + tx(S(B('x'), M(b.s, 'y'))) + ')+' + (b.tt === 1 ? '' : b.tt) + 'b(' + tx(S(B('x'), M(b.s, 'y'))) + ')') + '<br>' + t('=' + ftex(b.TF)), hints: ['Group the first two terms and the last two terms; take a common factor out of each pair.'], text: 'factor ' + plain(b.expr) });
          } },
          { id: 'e14c', sub: 'c', level: 'PRG', make: function (r, sh) {
            var c = sh.c;
            return facPart('Factor (c) completely: ' + t(c.expr), c.TF, { sol: t('2+2') + ': ' + t(c.m + 'x^{2}(x-' + c.p + ')+' + c.n + '(x-' + c.p + ')') + '<br>' + t('=' + ftex(c.TF)) + '<br>' + t(c.m + 'x^{2}+' + c.n) + ' is a sum — it stops.', hints: ['Group in pairs: take ' + t(c.m + 'x^{2}') + ' out of the first pair and ' + t(c.n) + ' out of the second.'], text: 'factor ' + plain(c.expr),
              wrong: autoWrongs(c.TF, null) });
          } },
          { id: 'e14d', sub: 'd', level: 'ADV', make: function (r, sh) {
            var d = sh.d, k = d.k;
            return facPart('Factor (d) completely: ' + t(d.expr), d.TF, { sol: t('3+1') + ', with the lone square ' + t('m^{2}') + ' first: ' + t('m^{2}-(n^{2}-' + 2 * k + 'n+' + k * k + ')') + '<br>' + t('=m^{2}-(n-' + k + ')^{2}') + '<br>' + t('=\\big[m-(n-' + k + ')\\big]\\big[m+(n-' + k + ')\\big]') + '<br>' + t('=' + ftex(d.TF)), hints: ['Take ' + t('-1') + ' out of the last three terms: ' + t('-n^{2}+' + 2 * k + 'n-' + k * k + '=-(n^{2}-' + 2 * k + 'n+' + k * k + ')') + '.', 'Then it is ' + t('m^{2}-(\\ldots)^{2}') + ': a difference of squares. Distribute the minus sign carefully.'], text: 'factor ' + plain(d.expr),
              wrong: [wr([fo(S(B('m'), M(-1, 'n'), N(-k))), fo(S(B('m'), B('n'), N(-k)))], 'minus-bracket', 'Check the first bracket: ' + t('m-(n-' + k + ')=m-n+' + k) + ' — the minus sign changes <b>both</b> signs in the bracket.')] });
          } },
          { id: 'e14e', sub: 'e', level: 'ADV', make: function (r, sh) {
            var e = sh.e;
            return facPart('Factor (e) completely: ' + t(e.expr), e.TF, { sol: t('3+1') + ': ' + t('2(' + e.p + 'a)(' + e.q + 'b)=' + 2 * e.p * e.q + 'ab') + ' ✓<br>' + t('(' + tx(P.mul(e.base, e.base)) + ')-' + e.rr * e.rr + '=(' + e.bt + ')^{2}-' + e.rr + '^{2}') + '<br>' + t('=' + ftex(e.TF)), hints: ['The first three terms are a perfect square trinomial. Write them as a square, then use the difference of squares.'], text: 'factor ' + plain(e.expr),
              wrong: [wr([fo(S(e.base, N(-e.rr * e.rr))), fo(S(e.base, N(e.rr * e.rr)))], 'no-root', 'Use the square <b>root</b> of ' + t(e.rr * e.rr) + ', which is ' + t(e.rr) + '.')] });
          } },
          { id: 'e14f', sub: 'f', level: 'PRG', make: function (r, sh) {
            var f = sh.f;
            return facPart('Factor (f) completely: ' + t(f.expr), f.TF, { sol: t('2+2') + ': ' + t(f.m + 'p(q-' + f.s + ')+' + f.n + '(q-' + f.s + ')') + '<br>' + t('=' + ftex(f.TF)), hints: ['Group in pairs: take ' + t(f.m + 'p') + ' out of the first pair and ' + t(f.n) + ' out of the second.'], text: 'factor ' + plain(f.expr) });
          } }] },
      { num: '15', stem: 'The decision itself.', parts: [
        { id: 'e15a', sub: 'a', level: 'EMG', make: function (r) {
          return mcTex(r, 'What do you look for <i>at a glance</i> to tell a ' + t('2+2') + ' grouping problem from a ' + t('3+1') + ' problem?', [
            { html: 'A ' + t('3+1') + ' problem has three perfect-square terms: two of them and the middle term make a perfect square trinomial, and the fourth is a lone perfect square with a minus sign in front of it. A ' + t('2+2') + ' problem splits into two pairs that each have a common factor.', right: true },
            { html: 'A ' + t('3+1') + ' problem always has its perfect square trinomial in the first three terms.', why: 'Not always: in ' + t('m^{2}-n^{2}+10n-25') + ' the lone square comes first.' },
            { html: 'Any four-term polynomial with a perfect square in it is a ' + t('3+1') + ' problem.', why: t('ax+ay+bx+by') + ' style problems can contain squares too (e.g. ' + t('x^{2}+3x+2x+6') + '); you need <b>three</b> squares, one standing alone with a minus sign.' },
            { html: 'Count the minus signs: one minus sign means ' + t('3+1') + ', two means ' + t('2+2') + '.', why: 'The number of minus signs doesn’t decide it. Look for squared terms.' }],
            'Look for squares. A ' + t('3+1') + ' problem has three perfect-square terms — a perfect square trinomial plus a lone square with a minus sign in front (or, as in ' + t('m^{2}-n^{2}+10n-25') + ', a lone positive square with the other three subtracted). A ' + t('2+2') + ' problem has no such pattern; its terms fall into two pairs with common factors.', ['How many of the four terms are perfect squares?'], 'how to tell 2+2 from 3+1');
        } },
        { id: 'e15b1', sub: 'b i', level: 'EMG', make: function (r) {
          var k = r.int(2, 9);
          return mcTex(r, 'In ' + t('m^{2}-n^{2}+' + 2 * k + 'n-' + k * k) + ' the last three terms are ' + t('-n^{2}+' + 2 * k + 'n-' + k * k) + '. Why must you remove a factor of ' + t('-1') + ' before you can see the perfect square?', [
              { html: 'A perfect square trinomial needs a positive first and last term, but ' + t('-n^{2}') + ' and ' + t('-' + k * k) + ' are negative. Removing ' + t('-1') + ' flips every sign.', right: true },
              { html: 'Because the GCF of the three terms is ' + t('-1') + ', and the GCF must always come out first.', why: 'Taking out ' + t('-1') + ' is a choice to make the square visible, not a GCF rule.' },
              { html: 'Because ' + t('-n^{2}') + ' is a perfect square, so it needs a minus sign.', why: t('-n^{2}') + ' is not a perfect square — a square is never negative.' },
              { html: 'You don’t have to; ' + t('-n^{2}+' + 2 * k + 'n-' + k * k + '=(-n+' + k + ')^{2}') + '.', why: 'Expand ' + t('(-n+' + k + ')^{2}') + ': you get ' + t('n^{2}-' + 2 * k + 'n+' + k * k) + ', with positive ends.' }],
            'A perfect square trinomial has positive first and last terms. Taking out ' + t('-1') + ' flips every sign: ' + t('m^{2}-(n^{2}-' + 2 * k + 'n+' + k * k + ')=m^{2}-(n-' + k + ')^{2}') + '.', ['Can a perfect square be negative?'], 'why remove -1');
        } },
        { id: 'e15b2', sub: 'b ii', level: 'BEG', make: function (r) {
          var k = r.int(2, 9), T = S(B('n', 2), M(-2 * k, 'n'), N(k * k));
          var p = KP.poly('Write the three terms of ' + t('-n^{2}+' + 2 * k + 'n-' + k * k) + ' after you remove a factor of ' + t('-1') + ':', T, { wrong: [{ is: S(B('n', 2), M(2 * k, 'n'), N(k * k)), code: 'sign', hint: 'Taking out ' + t('-1') + ' flips <b>every</b> sign, including the middle one: ' + t('+' + 2 * k + 'n\\to -' + 2 * k + 'n') + '.' }, { is: S(B('n', 2), M(2 * k, 'n'), N(-k * k)), code: 'sign', hint: 'Every sign flips: ' + t('-n^{2}\\to n^{2}') + ', ' + t('+' + 2 * k + 'n\\to -' + 2 * k + 'n') + ', ' + t('-' + k * k + '\\to +' + k * k) + '.' }], before: t('-n^{2}+' + 2 * k + 'n-' + k * k + '=-\\Big(') , after: t('\\Big)') },
            t('-n^{2}+' + 2 * k + 'n-' + k * k + '=-(n^{2}-' + 2 * k + 'n+' + k * k + ')') + ', and ' + t('n^{2}-' + 2 * k + 'n+' + k * k + '=(n-' + k + ')^{2}') + ' since ' + t('2(n)(' + k + ')=' + 2 * k + 'n') + ' ✓', ['Change the sign of every term.'], 'remove -1');
          return p;
        } },
        { id: 'e15c', sub: 'c', level: 'EMG', make: function (r) {
          var k = r.int(2, 6);
          return mcTex(r, 'A classmate tries ' + t('2+2') + ' on ' + t('x^{2}+' + 2 * k + 'x+' + k * k + '-y^{2}') + ': ' + t('x(x+' + 2 * k + ')+(' + k + '-y)(' + k + '+y)') + '. Both halves are factored, yet the method failed. Why?', [
            { html: 'After the halves are factored, the <b>same</b> bracket must appear in both so it can be taken out. ' + t('x(x+' + 2 * k + ')') + ' and ' + t('(' + k + '-y)(' + k + '+y)') + ' share no bracket.', right: true },
            { html: 'The classmate factored the second half wrong.', why: t('(' + k + '-y)(' + k + '+y)=' + k * k + '-y^{2}') + ' — that half is right.' },
            { html: 'Grouping only works when all four terms are positive.', why: 'Grouping works with any signs, as long as a common bracket appears.' },
            { html: 'The halves still need to be multiplied together.', why: 'They are <b>added</b>, not multiplied — that’s why a common bracket is needed.' }],
            'Grouping only finishes when both halves contain the same bracket. Here there is none, so the split was wrong. The ' + t('3+1') + ' split works: ' + t('(x+' + k + ')^{2}-y^{2}=(x+' + k + '-y)(x+' + k + '+y)') + '.', ['What has to happen after both pairs are factored, in a grouping problem?'], 'why 2+2 fails');
        } }] },
      /* ---------- EP F: stretch ---------- */
      { num: '16', section: 'Extra practice F — Stretch', stem: '<b>Substitution twice over.</b> The repeated block is itself a binomial. Let ' + t('A') + ' be that block, factor the trinomial in ' + t('A') + ', substitute back — and then factor each of the two trinomials you get.', parts: [
        { id: 'e16a', sub: 'a', level: 'ADV', make: function (r) { return e16Part(e16Gen(r, false), 'x'); } },
        { id: 'e16b', sub: 'b', level: 'ADV', make: function (r) { return e16Part(e16Gen(r, true), 'y'); } },
        { id: 'e16c', sub: 'c', level: 'EMG', make: function (r) {
          return mcTex(r, 'Factoring ' + t('(y^{2}+2y)^{2}-2(y^{2}+2y)-3') + ', four students stop at different places. Which statement is correct?', [
            { html: t('(y+3)(y-1)(y+1)(y+1)') + ' is complete and correct: every bracket is linear. Writing ' + t('(y+1)^{2}') + ' just combines the two equal brackets.', right: true },
            { html: t('(A-3)(A+1)') + ' is a complete answer.', why: t('A') + ' is not in the question — the block must be substituted back.' },
            { html: t('(y^{2}+2y-3)(y^{2}+2y+1)') + ' is a complete answer.', why: 'Both trinomials still factor: ' + t('(y+3)(y-1)') + ' and ' + t('(y+1)^{2}') + '.' },
            { html: t('(y+3)(y-1)(y+1)(y+1)') + ' is wrong because the repeated bracket must be written as a square.', why: 'It equals ' + t('(y+3)(y-1)(y+1)^{2}') + ' exactly, and every bracket is linear — it is complete.' }],
            'The repeated bracket comes from the perfect square trinomial ' + t('y^{2}+2y+1=(y+1)^{2}') + '. Stopping at ' + t('(A-3)(A+1)') + ' leaves a letter that isn’t in the question; stopping at ' + t('(y^{2}+2y-3)(y^{2}+2y+1)') + ' leaves trinomials that factor. ' + t('(y+3)(y-1)(y+1)(y+1)') + ' is complete — ' + t('(y+1)^{2}') + ' is just a shorter way to write it.', ['Which answers still have a bracket (or a letter) that needs work?'], 'where to stop');
        } }] },
      { num: '17', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: 'e17', level: 'EMG', make: function (r) {
          var k = r.int(1, 5), k2 = k * k, expr = tx(S(B('x', 4), M(-2 * k2, 'x', 2), N(k2 * k2)));
          return mcTex(r, 'When ' + t(expr) + ' is factored completely, the result is', [
            { html: t('(x^{2}-' + k2 + ')^{2}'), why: 'That’s the first step, but ' + t('x^{2}-' + k2) + ' is a difference of squares — it factors again.' },
            { html: t('(x-' + k + ')^{2}(x+' + k + ')^{2}'), right: true },
            { html: t('(x-' + k + ')^{4}'), why: t('(x-' + k + ')^{4}=\\big((x-' + k + ')^{2}\\big)^{2}=(x^{2}-' + 2 * k + 'x+' + k2 + ')^{2}') + ', which has odd powers of ' + t('x') + '.' },
            { html: t('(x^{2}-' + k2 + ')(x^{2}+' + k2 + ')'), why: 'That multiplies to ' + t('x^{4}-' + k2 * k2) + ' — no middle term.' }],
            t('\\sqrt{x^{4}}=x^{2}') + ', ' + t('\\sqrt{' + k2 * k2 + '}=' + k2) + ', ' + t('2(x^{2})(' + k2 + ')=' + 2 * k2 + 'x^{2}') + ' ✓, so ' + t(expr + '=(x^{2}-' + k2 + ')^{2}') + '.<br>' + t('x^{2}-' + k2 + '=(x-' + k + ')(x+' + k + ')') + ', so ' + t('=\\big[(x-' + k + ')(x+' + k + ')\\big]^{2}=(x-' + k + ')^{2}(x+' + k + ')^{2}') + '.', ['It is a perfect square trinomial in ' + t('x^{2}') + '. Then check the bracket inside the square.'], 'complete factorization of ' + plain(expr));
        } }] },
      { num: '18', stem: '<i>(Numerical Response)</i>', parts: [
        { id: 'e18', level: 'PRG', make: function (r) {
          var g = r.pick([[2, 3], [3, 2], [2, 5], [3, 4], [4, 3], [5, 2], [3, 5], [5, 3], [5, 4]]), a = g[0], b = g[1], a2 = a * a, b2 = b * b, expr = tx(S(M(a2 * a2, 'x', 4), M(-2 * a2 * b2, 'x', 2), N(b2 * b2))), ans = Math.pow(a, b);
          var A = Math.pow(a, b), Bv = Math.pow(b, a);
          return KP.nr('When ' + t(expr) + ' is factored completely it can be written ' + t('(ax-b)^{2}(ax+b)^{2}') + ', where ' + t('a') + ' and ' + t('b') + ' are positive integers. The value of ' + t('a^{b}') + ' is ________. (Record your answer as a three-digit number.)', A,
            function (v) { if (v === Bv && Bv !== A) return { code: 'swap-ab', hint: 'That’s ' + t('b^{a}') + '. The question asks for ' + t('a^{b}') + '.' }; if (v === Math.pow(a2, b2) || v === a2 * b2 || v === Math.pow(a2, b)) return { code: 'ab-sq', hint: t('a') + ' and ' + t('b') + ' come from the <b>second</b> round of factoring: ' + t('(' + a2 + 'x^{2}-' + b2 + ')=(' + a + 'x-' + b + ')(' + a + 'x+' + b + ')') + '.' }; if (v === a * b) return { code: 'ab-sum', hint: 'Raise ' + t('a') + ' to the power ' + t('b') + ', don’t multiply.' }; return null; },
            t('\\sqrt{' + a2 * a2 + 'x^{4}}=' + a2 + 'x^{2}') + ', ' + t('\\sqrt{' + b2 * b2 + '}=' + b2) + ', ' + t('2(' + a2 + 'x^{2})(' + b2 + ')=' + 2 * a2 * b2 + 'x^{2}') + ' ✓<br>' + t(expr + '=(' + a2 + 'x^{2}-' + b2 + ')^{2}') + '<br>' + t(a2 + 'x^{2}-' + b2 + '=(' + a + 'x-' + b + ')(' + a + 'x+' + b + ')') + ', so ' + t('=(' + a + 'x-' + b + ')^{2}(' + a + 'x+' + b + ')^{2}') + '<br>' + t('a=' + a + ',\\ b=' + b + ':\\ a^{b}=' + a + '^{' + b + '}=' + A) + ' (recorded ' + ('000' + A).slice(-3) + ').',
            ['Factor it as a perfect square trinomial in ' + t('x^{2}') + ' first, then factor the bracket inside the square.'], 'NR a^b for ' + plain(expr));
        } }] }
    ]
  });

  /* ---------------- extra-practice makers (hoisted) ---------------- */
  /* EP3: missing term + factored form */
  function e3Part(prompt, o, T, ws, bo, sol, what, x) {
    x = x || {}; var vs = P.vars(o.T);
    var p = KP.fields(prompt, [box('Missing ' + what + ':', vs, 'Missing ' + what), box('Factored form:', vs, 'Factored form')],
      [termChk(T, ws, bo), facChk(o.TF, { wrong: pstWrongs(o) })], [tx(T), o.key], t(tx(T)) + ' and ' + t(o.key), sol, H.pst, 'fill in ' + what + ' and factor: ' + plain(prompt.replace(/\\\(|\\\)/g, '')));
    p.bad = cleanW(P.lift(T), ws).map(function (w) { return [tx(w.is), o.key]; });
    if (x.good) p.good = x.good.map(function (g) { return [tx(T), g]; });
    return p;
  }
  /* EP5: A² − b² or b² − A² with a binomial block A */
  function binDos(prompt, A, At, b, bt, rev) {
    var TF = rev ? [fo(P.sub(b, A), 1, bt + '-' + At.replace(/\+/g, '#').replace(/-/g, '+').replace(/#/g, '-')), fo(S(b, A), 1, bt + '+' + At)]
      : [fo(P.sub(A, b), 1, At + '-' + bt), fo(S(A, b), 1, At + '+' + bt)];
    var b2 = P.mul(b, b), b2t = tx(b2);
    var sol = rev ? 'Let ' + t('A=' + At) + '.<br>' + t(b2t + '-A^{2}=' + bt + '^{2}-A^{2}=(' + bt + '-A)(' + bt + '+A)') + '<br>Replace ' + t('A') + ': ' + t('\\big(' + bt + '-(' + At + ')\\big)\\big(' + bt + '+(' + At + ')\\big)') + '<br>' + t('=' + ftex(TF))
      : 'Let ' + t('A=' + At) + '.<br>' + t('A^{2}-' + b2t + '=A^{2}-(' + bt + ')^{2}=(A-' + bt + ')(A+' + bt + ')') + '<br>Replace ' + t('A') + ': ' + t('=' + ftex(TF));
    var ws = [wr([fo(P.sub(A, b2)), fo(S(A, b2))], 'no-root', 'Use the square <b>root</b> of ' + t(b2t) + ', which is ' + t(bt) + '.'), wr([fo(P.sub(A, b), 2)], 'dos-square', 'A difference of squares is ' + t('(A-B)(A+B)') + ', not ' + t('(A-B)^{2}') + '.')];
    if (rev) { var ts = P.sorted(A), w1 = S(b, P.neg(P.mono(ts[0].c, ts[0].v)), P.mono(ts[1].c, ts[1].v)); ws.push(wr([fo(w1), fo(S(b, A))], 'minus-bracket', 'In the first bracket, ' + t(bt + '-(' + At + ')') + ': the minus sign changes the sign of <b>every</b> term of the block.')); }
    return facPart(prompt, TF, { wrong: ws, sol: sol, hints: ['Let ' + t('A') + ' be the bracket, so the expression is a difference of squares in ' + t('A') + '.', 'Replace ' + t('A') + ', then simplify inside each bracket.'], text: 'factor ' + plain(prompt.replace(/\\\(|\\\)/g, '')) });
  }
  /* EP6: (pA+q)(rA+s) with a binomial block A */
  function binTri(Ap, At, f) {
    var p = f[0][0], q = f[0][1], r = f[1][0], s = f[1][1], st = triSteps(p, q, r, s, 'A'), a = st.a, b = st.b, c = st.c;
    var expr = cA(a, At, true, true) + cA(b, At) + cK(c);
    var real = [S(P.scale(Ap, p), N(q)), S(P.scale(Ap, r), N(s))], TF = real.map(function (x) { return fo(x); });
    var back = function (pp, qq) { return (pp === 1 ? '(' + At + ')' : pp + '(' + At + ')') + sc1(qq).replace(/^\+/, '+'); };
    var sol = ['Let ' + t('A=' + At) + ': ' + t(tx(st.tri)) + '.'].concat(st.lines).concat(['Replace ' + t('A') + ': ' + t('\\big(' + back(r, s) + '\\big)\\big(' + back(p, q) + '\\big)'), t('=' + br(real[1]) + br(real[0]))]).join('<br>');
    var ts = P.sorted(Ap), part = function (k, c) { return S(P.scale(P.mono(ts[0].c, ts[0].v), k), P.mono(ts[1].c, ts[1].v), N(c)); }, w = [];
    if (r !== 1) w.push(wr([fo(real[0]), fo(part(r, s))], 'minus-bracket', 'In the bracket ' + t(r + '(' + At + ')' + sc1(s)) + ', the ' + t(r) + ' multiplies <b>both</b> terms of the block.'));
    if (p !== 1) w.push(wr([fo(part(p, q)), fo(real[1])], 'minus-bracket', 'In the bracket ' + t(p + '(' + At + ')' + sc1(q)) + ', the ' + t(p) + ' multiplies <b>both</b> terms of the block.'));
    return facPart(t(expr), TF, { wrong: w, sol: sol, hints: ['Let ' + t('A=' + At) + '. Then the expression is an ordinary trinomial in ' + t('A') + '.', 'Factor it, replace ' + t('A') + ', and collect like terms inside each bracket.'], text: 'factor ' + plain(expr) });
  }
  /* EP7: x⁴ − (p²+q²)x² + p²q², both brackets split */
  function e7Part(v, p, q) { return blockPart(null, { B: B(v, 2), Bt: v + '^{2}', Bw: B(v), f: [[1, -p * p], [1, -q * q]] }); }
  /* EP11: (x² − k²)² = (x−k)²(x+k)² */
  function e11Split(k, v) {
    var o = pst(B(v, 2), N(-k * k)), TF = [fo(S(B(v), N(-k)), 2), fo(S(B(v), N(k)), 2)], key = ftex(TF);
    return facPart(t(o.expr), TF, { sol: pstLine(o) + '<br>' + t(o.expr + '=' + o.key) + '<br>' + t(v + '^{2}-' + k * k + '=(' + v + '-' + k + ')(' + v + '+' + k + ')') + ', so ' + t('=\\big[(' + v + '-' + k + ')(' + v + '+' + k + ')\\big]^{2}=' + key),
      wrong: [wr([fo(S(B(v, 2), N(-k * k))), fo(S(B(v, 2), N(k * k)))], 'pst-dos', 'That multiplies to ' + t(v + '^{4}-' + k * k * k * k) + ', with no middle term. It is a perfect square: ' + t(o.key) + '.'), wr([fo(S(B(v), N(-k)), 4)], 'dos-square', t('(' + v + '-' + k + ')^{4}') + ' has odd powers of ' + t(v) + '. Factor the bracket ' + t(v + '^{2}-' + k * k) + ' as a difference times a sum.'), wr([fo(S(B(v, 2), N(k * k)), 2)], 'pst-sign', 'Check the sign: the middle term is negative.')],
      hints: H.pst.concat(['Then check the bracket inside the square: is it a difference of squares?']), text: 'factor ' + plain(o.expr), keyTex: key });
  }
  /* EP16: (x² + bx)² − (r1 + r2)(x² + bx) + r1 r2 */
  function e16Part(g, v) {
    var b = g.b, Bk = S(B(v, 2), M(b, v)), At = tx(Bk), mid = -(g.r1 + g.r2), cst = g.r1 * g.r2;
    var expr = '(' + At + ')^{2}' + cA(mid, At) + cK(cst);
    var lin = [g.P1, g.P2].map(function (pq) { return [fo(S(B(v), N(-pq[0]))), fo(S(B(v), N(-pq[1])))]; });
    var TF = merge(lin[0].concat(lin[1])), key = ftex(TF);
    var tri = [S(Bk, N(-g.r1)), S(Bk, N(-g.r2))];
    function triLine(T, pq) {
      if (pq[0] === pq[1]) return t(tx(T)) + ': ' + t('2(' + v + ')(' + Math.abs(pq[0]) + ')=' + Math.abs(2 * pq[0]) + v) + ' ✓, a perfect square ' + t('\\Rightarrow (' + tx(S(B(v), N(-pq[0]))) + ')^{2}');
      return t(tx(T)) + ': product ' + t(pq[0] * pq[1]) + ', sum ' + t(b) + ': ' + t(-pq[0]) + ', ' + t(-pq[1]) + ' ' + t('\\Rightarrow ' + br(S(B(v), N(-pq[0]))) + br(S(B(v), N(-pq[1]))));
    }
    var sol = ['Let ' + t('A=' + At) + ': ' + t('A^{2}' + (mid === 1 ? '+A' : mid === -1 ? '-A' : (mid > 0 ? '+' : '') + mid + 'A') + cK(cst)) + '.', 'Product ' + t(cst) + ', sum ' + t(mid) + ': ' + t(-g.r1) + ' and ' + t(-g.r2) + '.<br>' + t('=(A' + cK(-g.r1) + ')(A' + cK(-g.r2) + ')'),
      'Replace ' + t('A') + ': ' + t(br(tri[0]) + br(tri[1])), triLine(tri[0], g.P1), triLine(tri[1], g.P2), t(expr + '=' + key)].join('<br>');
    return facPart(t(expr), TF, { sol: sol, hints: ['Let ' + t('A=' + At) + ' and factor the trinomial in ' + t('A') + '.', 'Replace ' + t('A') + ' — you get two trinomials in ' + t(v) + '. Factor each of them.'], text: 'factor ' + plain(expr) });
  }
})(window);
