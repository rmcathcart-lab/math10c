/* Unit 4 (Factoring): checking factored answers. Needs js/expr.js, js/kit.js, js/kitx.js, js/poly.js.
 *
 *   var F = HW.factor;
 *   F.split(tex|ast)       -> { ok, factors: [{ p: polynomial, k: power, ast }], sign } — the student's top-level product
 *   F.normal(factors)      -> { c:[p,q], v:{x:2}, keys:{ 'x-3': 1, … }, prims:{ key: polynomial } } — constant, monomial part,
 *                             and the multiset of primitive (content 1, leading term positive) non-monomial factors
 *   F.tex(list)            -> LaTeX of a product of factors given as polynomials/LaTeX, e.g. F.tex(['3x', 'x-4', 'x+4'])
 *                             → '3x(x-4)(x+4)'; repeated factors may be passed as { p, k } → '(x+3)^{2}'
 *   F.product(list)        -> the expanded polynomial of such a list
 *
 *   K.factored(target, opt) -> checker for "factor (completely)". target: LaTeX of the fully factored answer, e.g.
 *     '3x(x-4)(x+4)', '(2x-3)^{2}', '-(x+2)(6x-7)', or a list of factors as for F.tex. Graded:
 *       - equal to the target polynomial AND the same factorization (up to order, signs and where constants sit) → correct
 *       - equal but expanded / only partly factored / a common factor left inside a bracket → a 'form' nudge (no try used)
 *       - not equal → wrong, with a hint that shows what the student's factors multiply to (and what is off), plus
 *         lesson-supplied classic errors.
 *     opt.wrong: [{ is: LaTeX|polynomial|list, code, hint }] — matched against the product of the student's factors.
 *     opt.gcfOnly: true — only the greatest common factor has to be removed (e.g. "remove the GCF"); further factoring of
 *       the bracket is accepted but not required.
 *     opt.diag(S, T, split) -> { code, hint } for anything else.
 *   K.P.factored(prompt, target, opt, sol, hints, text) -> part with the poly keypad.
 */
(function (root) {
  'use strict';
  var HW = root.HW, ex = HW.ex, K = HW.kit, P = HW.poly, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form;
  var gcd = ex.gcd, norm = ex.norm;
  var F = HW.factor = {};

  function lcm(a, b) { return a / gcd(a, b) * b; }
  /* content: rational c with prim = p / (c · x^v), integer coprime coefficients, first term (descending) positive */
  function content(p) {
    var ts = P.sorted(p), L = 1, G = 0, v = null;
    ts.forEach(function (T) { L = lcm(L, T.c[1]); });
    ts.forEach(function (T) { G = gcd(G, Math.abs(T.c[0] * (L / T.c[1]))); });
    ts.forEach(function (T) { if (!v) { v = {}; Object.keys(T.v).forEach(function (x) { v[x] = T.v[x]; }); } else { Object.keys(v).forEach(function (x) { v[x] = Math.min(v[x], T.v[x] || 0); if (!v[x]) delete v[x]; }); } });
    var sign = ts.length && ts[0].c[0] < 0 ? -1 : 1, c = norm(sign * G, L);
    var prim = P.scale(p, [c[1], c[0]]);
    if (v && Object.keys(v).length) { var o = {}; P.terms(prim).forEach(function (T) { var w = {}; Object.keys(T.v).forEach(function (x) { var e = T.v[x] - (v[x] || 0); if (e) w[x] = e; }); o = P.add(o, P.mono(T.c, w)); }); prim = o; }
    return { c: c, v: v || {}, prim: prim };
  }
  F.content = content;
  function keyOf(p) { return P.tex(p); }

  /* top-level product of the student's answer */
  function flat(a, out, sgn, inv) {
    if (a.t === 'neg') return flat(a.a, out, -sgn, inv);
    if (a.t === 'mul') { sgn = flat(a.a, out, sgn, inv); return flat(a.b, out, sgn, inv); }
    if (a.t === 'div') { sgn = flat(a.a, out, sgn, inv); return flat(a.b, out, sgn, !inv); }
    if (a.t === 'paren') { var inner = a.a; while (inner.t === 'paren') inner = inner.a; if (inner.t === 'mul' || inner.t === 'div' || (inner.t === 'neg' && inner.a.t !== 'add' && inner.a.t !== 'sub')) return flat(inner, out, sgn, inv); }
    out.push({ a: a, inv: inv }); return sgn;
  }
  F.split = function (x) {
    var ast = x;
    if (typeof x === 'string') { var pr = ex.parse(x); if (!pr.ok) return { ok: false, why: 'unreadable', code: pr.code }; ast = pr.ast; }
    var top = ast; while (top.t === 'paren') top = top.a;
    var raw = [], sign = flat(top, raw, 1, false), out = [];
    for (var i = 0; i < raw.length; i++) {
      var f = raw[i].a, k = 1;
      if (f.t === 'pow') { var e = ex.rat(f.b); if (e && e[1] === 1 && e[0] >= 1) { var b = f.a; while (b.t === 'paren') b = b.a; if (b.t === 'add' || b.t === 'sub') { k = e[0]; f = b; }
        else if (b.t === 'mul' && !raw[i].inv) { var sub = F.split(b); if (sub.ok) { sub.factors.forEach(function (g) { out.push({ p: g.p, k: g.k * e[0], ast: g.ast }); }); continue; } } } }
      var r = P.read(f); if (!r.ok) return { ok: false, why: r.why };
      if (raw[i].inv) { var ks = Object.keys(r.p); if (ks.length !== 1 || ks[0] !== '') return { ok: false, why: 'not-poly' }; var c = r.p[''].c; out.push({ p: P.num([c[1], c[0]]), k: 1, ast: f }); continue; }
      out.push({ p: r.p, k: k, ast: f });
    }
    if (sign < 0) out.unshift({ p: P.num(-1), k: 1, ast: null });
    return { ok: true, factors: out, ast: ast };
  };
  F.normal = function (factors) {
    var c = [1, 1], v = {}, keys = {}, prims = {}, raw = [];
    factors.forEach(function (f) {
      var n = P.count(f.p);
      if (n === 0) { c = [0, 1]; return; }
      if (n === 1) { var T = P.terms(f.p)[0]; for (var i = 0; i < f.k; i++) c = norm(c[0] * T.c[0], c[1] * T.c[1]); Object.keys(T.v).forEach(function (x) { v[x] = (v[x] || 0) + T.v[x] * f.k; }); return; }
      var cn = content(f.p), key = keyOf(cn.prim);
      for (var j = 0; j < f.k; j++) c = norm(c[0] * cn.c[0], c[1] * cn.c[1]);
      Object.keys(cn.v).forEach(function (x) { v[x] = (v[x] || 0) + cn.v[x] * f.k; });
      keys[key] = (keys[key] || 0) + f.k; prims[key] = cn.prim;
      raw.push({ p: f.p, k: f.k, cn: cn, key: key, ast: f.ast });
    });
    return { c: c, v: v, keys: keys, prims: prims, raw: raw };
  };
  function lift(x) { if (Array.isArray(x)) return x.map(function (f) { return f && f.p ? { p: P.lift(f.p), k: f.k || 1 } : { p: P.lift(f), k: 1 }; }); var s = F.split(x); if (!s.ok) throw new Error('bad factored target ' + x); return s.factors; }
  F.product = function (list) { var fs = lift(list); return fs.reduce(function (acc, f) { return P.mul(acc, P.pow(f.p, f.k)); }, P.num(1)); };
  F.tex = function (list) {
    var fs = lift(list), mono = [], br = [];
    fs.forEach(function (f) { if (P.count(f.p) <= 1) mono.push(f); else br.push(f); });
    var m = mono.reduce(function (acc, f) { return P.mul(acc, P.pow(f.p, f.k)); }, P.num(1));
    var mt = P.tex(m), s = mt === '1' ? '' : mt === '-1' ? '-' : mt;
    if (!br.length) return mt;
    return s + br.map(function (f) { return '(' + P.tex(f.p) + ')' + (f.k > 1 ? '^{' + f.k + '}' : ''); }).join('');
  };
  /* a factor's terms in the order the student typed them (falls back to descending order) */
  function writtenTex(f) {
    try {
      var order = f.ast ? P.writtenOrder(f.ast) : null, p = f.p, seen = {};
      if (!order || order.some(function (k) { return k == null || !p[k]; })) return P.tex(p);
      var out = '';
      order.forEach(function (k) { if (seen[k]) return; seen[k] = 1; var o = {}; o[k] = p[k]; var s = P.tex(o); out += out && s.charAt(0) !== '-' ? '+' + s : s; });
      return Object.keys(seen).length === P.count(p) ? out : P.tex(p);
    } catch (e) { return P.tex(f.p); }
  }
  function sameKeys(a, b) { var ka = Object.keys(a), kb = Object.keys(b); return ka.length === kb.length && ka.every(function (k) { return a[k] === b[k]; }); }
  function countKeys(a) { return Object.keys(a).reduce(function (s, k) { return s + a[k]; }, 0); }

  K.factored = function (target, opt) {
    opt = opt || {};
    var TF = lift(target), T = F.product(TF), TN = F.normal(TF);
    var TInt = P.terms(T).every(function (x) { return x.c[1] === 1; });
    var wrongs = (opt.wrong || []).map(function (w) { return { p: Array.isArray(w.is) ? F.product(w.is) : P.lift(w.is), code: w.code || 'diag', hint: w.hint }; });
    return function (resp) {
      var a = K.read(resp); if (a.res) return a.res;
      var sp = F.split(a.ast);
      if (!sp.ok) { if (sp.why === 'not-poly') return wrong('not-poly', 'That isn’t a polynomial — a variable has ended up in a denominator. Check your work.'); return wrong('value', null); }
      var S = sp.factors.reduce(function (acc, f) { return P.mul(acc, P.pow(f.p, f.k)); }, P.num(1));
      if (P.eq(S, T)) {
        var SN = F.normal(sp.factors), nBr = SN.raw.length;
        if (!nBr && countKeys(TN.keys)) return form('not-factored', 'That’s equal to the expression, but it isn’t factored — write it as a <b>product</b> of factors.');
        if (nBr === 1 && sp.factors.length === 1 && sp.factors[0].k === 1 && (countKeys(TN.keys) > 1 || Object.keys(TN.v).length || Math.abs(TN.c[0]) !== 1 || TN.c[1] !== 1))
          return form('not-factored', 'That’s equal to the expression, but it isn’t factored — write it as a <b>product</b> of factors.');
        for (var i = 0; i < SN.raw.length; i++) {
          var r = SN.raw[i], cv = r.cn;
          if (cv.c[1] !== 1 && TInt) return form('frac-bracket', 'Equal, but write each bracket with whole-number coefficients — take the fraction (or decimal) out in front.');
          if (Math.abs(cv.c[0]) !== 1 || Object.keys(cv.v).length) { // a fraction alone (½x + 2y) is fine when the expression itself has fractions
            var g = P.tex(P.mono([Math.abs(cv.c[0]), 1], cv.v));
            if (g !== '1') return form('gcf-inside', 'Equal, but not factored completely: ' + t('(' + writtenTex(r) + ')') + ' still has a common factor of ' + t(g) + '. Take it out in front.');
          }
        }
        for (var q = 0; q < sp.factors.length; q++) {
          var fq = sp.factors[q];
          if (!fq.ast || P.count(fq.p) < 2) continue;
          var fi = P.formIssue(fq.ast);
          if (fi && fi.code !== 'not-poly') return form('simplify-bracket', 'Equal, but simplify inside each bracket: expand any inner brackets and collect like terms.');
        }
        if (!opt.gcfOnly && !sameKeys(SN.keys, TN.keys)) {
          var more = Object.keys(SN.keys).filter(function (k) { return !TN.keys[k]; })[0];
          var mine = more && SN.raw.filter(function (r) { return r.key === more; })[0];
          return form('factor-more', 'Equal, but not factored completely: ' + (more ? t('(' + (mine ? writtenTex(mine) : more) + ')') + ' can still be factored.' : 'one of your factors can still be factored.'));
        }
        if (opt.gcfOnly) {
          var tm = P.tex(P.mono([Math.abs(TN.c[0]), TN.c[1]], TN.v)), sm = P.tex(P.mono([Math.abs(SN.c[0]), SN.c[1]], SN.v));
          if (tm !== sm) return form('gcf-inside', 'Equal, but take out the <b>greatest</b> common factor, ' + t(tm) + '.');
        }
        return ok();
      }
      for (var w = 0; w < wrongs.length; w++) if (P.eq(S, wrongs[w].p)) return wrong(wrongs[w].code, wrongs[w].hint);
      if (opt.diag) { var h = opt.diag(S, T, sp); if (h) return wrong(h.code || 'diag', h.hint); }
      var st = P.tex(S), multiply = sp.factors.length > 1 || P.count(S) !== P.count(T) ? 'Your factors multiply to ' + t(st) + ', not ' + t(P.tex(T)) + '. ' : '';
      if (sp.factors.length === 1 && P.count(sp.factors[0].p) === P.count(S) && P.count(S) > 1) multiply = 'Write the answer as a product of factors. ';
      var keys = Object.keys(S).concat(Object.keys(T)).filter(function (k, j, arr) { return arr.indexOf(k) === j; });
      var diff = keys.filter(function (k) { var x = S[k] ? S[k].c : [0, 1], y = T[k] ? T[k].c : [0, 1]; return x[0] * y[1] !== y[0] * x[1]; });
      if (P.eq(S, P.neg(T))) return wrong('sign-all', multiply + 'Every sign is opposite — check the sign of your common factor.');
      var signOnly = diff.length && diff.every(function (k) { return S[k] && T[k] && S[k].c[0] * T[k].c[1] === -T[k].c[0] * S[k].c[1]; });
      var deg = P.degree(T), vars = P.vars(T);
      var midKey = null, lastKey = '';
      if (vars.length === 1 && deg === 2) { var x = vars[0]; midKey = x + '1'; }
      if (signOnly) return wrong('sign', multiply + (midKey && P.count(T) === 3
        ? 'Check the <b>signs</b> in your factors: the last terms must multiply to the constant term, and the outside and inside products must add to the middle term.'
        : 'Check the <b>signs</b> in your factors — expand your answer and compare it with the original term by term.'));
      if (midKey && diff.length === 1 && diff[0] === midKey) return wrong('middle', multiply + 'The first and last terms are right — choose the pair so the outside and inside products <b>add</b> to the middle term.');
      if (midKey && diff.length === 1 && diff[0] === lastKey) return wrong('constant', multiply + 'Check the last terms of your factors: they must <b>multiply</b> to the constant term.');
      return wrong('value', multiply || null);
    };
  };
  HW.addCodes({ 'frac-bracket': 'Fraction or decimal left inside a bracket', 'simplify-bracket': 'Bracket not simplified', 'not-factored': 'Not written as a product', 'gcf-inside': 'Common factor left inside a bracket', 'factor-more': 'Not factored completely', middle: 'Factor pair gives the wrong middle term', constant: 'Last terms don’t multiply to the constant' });

  K.P.factored = function (prompt, target, opt, sol, hints, text) {
    opt = opt || {};
    var TF = lift(target), keyTex = opt.keyTex || (typeof target === 'string' ? target : F.tex(TF));
    var vs = P.vars(F.product(TF)).concat(opt.vars || []).filter(function (v, i, arr) { return arr.indexOf(v) === i; }).sort();
    if (!vs.length) vs = ['x'];
    return K.P.math(prompt, K.factored(target, opt), keyTex, sol, hints, text, { keys: 'poly', vars: vs, before: opt.before, after: opt.after, placeholder: 'e.g. 3x(x - 4)(x + 2)' });
  };
})(typeof window !== 'undefined' ? window : globalThis);
