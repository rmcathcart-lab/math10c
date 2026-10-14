/* Unit 3 (Polynomial Operations): exact polynomial algebra, the polynomial answer checker, the poly keypad, and
 * drawings (algebra tiles, area models). Needs js/expr.js, js/kit.js, js/kitx.js (and js/widgets2.js for the keypad).
 *
 *   var P = HW.poly;
 *   P.parse(tex)            -> polynomial (throws if tex isn't a polynomial) — for building generators and keys
 *   P.read(tex|ast)         -> { ok:true, p } | { ok:false, why: 'unreadable'|'not-poly'|'irrational' }
 *   P.num(n), P.mono(c, {x:2,y:1}), P.add(a,b,…), P.sub(a,b), P.mul(a,b,…), P.pow(a,n), P.scale(a,c), P.neg(a)
 *   P.eq(a,b), P.isZero(a), P.terms(a) -> [{ c:[p,q], v:{x:2} }], P.coef(a, {x:2}) -> [p,q], P.constant(a)
 *   P.degree(a), P.degreeIn(a, 'x'), P.vars(a), P.count(a) (number of terms), P.lead(a, 'x') -> [p,q]
 *   P.at(a, {x:2}) -> number, P.tex(a, opt) -> LaTeX (opt.order 'desc'|'asc', opt.var for that order, opt.dec decimals)
 *   P.monoTex({x:2,y:1}) -> 'x^{2}y';  P.btex(a) -> '(2x-3)' (brackets only if 2+ terms);  P.seq([...]) terms in a given order
 *
 *   K.poly(target, opt) -> checker; target is a polynomial or LaTeX. Graded by exact algebraic equality, then form:
 *     opt.expanded (default true) — the answer must be fully expanded and simplified (no brackets, like terms collected,
 *       one number per term, fractions in lowest terms). Not simplified = a 'form' nudge that doesn't use a try.
 *     opt.order: 'desc' | 'asc' (+ opt.var) — terms must be in that order (a wrong order is a real mistake).
 *     opt.wrong: [{ is: polynomial|LaTeX, code, hint }] — classic wrong answers recognised exactly (e.g. the missing
 *       middle term of a square, the second bracket's signs not changed).
 *     opt.diag(studentPoly, targetPoly, ast) -> { code, hint } | null — anything else lesson-specific.
 *     Built-in diagnoses: all signs flipped, some terms with the wrong sign, a wrong exponent, a single like-term group
 *     wrong or missing ("check your x terms"), an answer that isn't a polynomial.
 *   K.P.poly(prompt, target, opt, sol, hints, text) -> part (math input, poly keypad with the target's letters).
 *
 *   HW.tiles.row(tokens, opt) -> SVG of loose algebra tiles. tokens like ['x2','x2','-x','1','-1'] (x2 = x²-tile,
 *     x = x-tile, 1 = unit tile; '-' = negative). Shaded = positive, white = negative (the booklet's legend).
 *   HW.tiles.count({ x2: 2, x: -1, one: 3 }) -> the tokens for those counts (negative count = negative tiles).
 *   HW.tiles.frame(top, side, opt) -> SVG of a multiplication frame: factor tiles across the top and down the side;
 *     opt.fill: true draws the product tiles (shading rule), otherwise a dashed outline; opt.blanks: [[row,col], …] to
 *     leave some product cells empty.
 *   HW.tiles.legend() -> small HTML legend.
 *   HW.areaModel(cols, rows, cells, opt) -> SVG rectangle split into boxes: cols = labels across the top (LaTeX),
 *     rows = labels down the side, cells[r][c] = LaTeX inside each box ('' = blank, '?' shows a question mark).
 *     opt.widths / opt.heights: relative sizes.
 */
(function (root) {
  'use strict';
  var HW = root.HW, ex = HW.ex, K = HW.kit, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form;
  var norm = ex.norm, gcd = ex.gcd, safe = Number.isSafeInteger;

  /* ---------------- exact rationals ---------------- */
  function rq(r) { return r && safe(r[0]) && safe(r[1]) ? r : null; }
  function radd(a, b) { return rq(norm(a[0] * b[1] + b[0] * a[1], a[1] * b[1])); }
  function rmul(a, b) { return rq(norm(a[0] * b[0], a[1] * b[1])); }
  function rinv(a) { return a[0] === 0 ? null : norm(a[1], a[0]); }
  function req(a, b) { return a[0] * b[1] === b[0] * a[1]; }
  function R(c) { return typeof c === 'number' ? [c, 1] : c; }

  /* ---------------- polynomials: { key: { c:[p,q], v:{x:2} } } ---------------- */
  var P = HW.poly = {};
  function keyOf(v) { return Object.keys(v).filter(function (x) { return v[x]; }).sort().map(function (x) { return x + v[x]; }).join(','); }
  function clean(p) { var o = {}; Object.keys(p).forEach(function (k) { if (p[k].c[0] !== 0) o[k] = p[k]; }); return o; }
  P.num = function (n) { var c = R(n); var o = {}; if (c[0]) o[''] = { c: norm(c[0], c[1]), v: {} }; return o; };
  P.mono = function (c, v) { c = R(c); v = v || {}; var vv = {}; Object.keys(v).forEach(function (x) { if (v[x]) vv[x] = v[x]; }); var o = {}; if (c[0]) o[keyOf(vv)] = { c: norm(c[0], c[1]), v: vv }; return o; };
  P.v = function (name, e) { var v = {}; v[name] = e == null ? 1 : e; return P.mono(1, v); };
  function add2(a, b) {
    var o = {};
    Object.keys(a).forEach(function (k) { o[k] = { c: a[k].c, v: a[k].v }; });
    Object.keys(b).forEach(function (k) { if (o[k]) { var s = radd(o[k].c, b[k].c); if (!s) throw new Error('overflow'); o[k] = { c: s, v: o[k].v }; } else o[k] = { c: b[k].c, v: b[k].v }; });
    return clean(o);
  }
  P.add = function () { var s = {}; for (var i = 0; i < arguments.length; i++) s = add2(s, lift(arguments[i])); return s; };
  P.scale = function (a, c) { c = R(c); var o = {}; a = lift(a); Object.keys(a).forEach(function (k) { var m = rmul(a[k].c, c); if (!m) throw new Error('overflow'); o[k] = { c: m, v: a[k].v }; }); return clean(o); };
  P.neg = function (a) { return P.scale(a, -1); };
  P.sub = function (a, b) { return P.add(a, P.neg(b)); };
  function mul2(a, b) {
    var o = {};
    Object.keys(a).forEach(function (i) {
      Object.keys(b).forEach(function (j) {
        var v = {}; Object.keys(a[i].v).forEach(function (x) { v[x] = (v[x] || 0) + a[i].v[x]; }); Object.keys(b[j].v).forEach(function (x) { v[x] = (v[x] || 0) + b[j].v[x]; });
        var c = rmul(a[i].c, b[j].c); if (!c) throw new Error('overflow');
        o = add2(o, (function () { var t1 = {}; t1[keyOf(v)] = { c: c, v: v }; return t1; })());
      });
    });
    return clean(o);
  }
  P.mul = function () { var s = P.num(1); for (var i = 0; i < arguments.length; i++) s = mul2(s, lift(arguments[i])); return s; };
  P.pow = function (a, n) { var s = P.num(1); a = lift(a); for (var i = 0; i < n; i++) s = mul2(s, a); return s; };
  function lift(a) { if (typeof a === 'number' || Array.isArray(a)) return P.num(a); if (typeof a === 'string') return P.parse(a); return a; }
  P.lift = lift;
  P.eq = function (a, b) { var d = P.sub(a, b); return Object.keys(d).length === 0; };
  P.isZero = function (a) { return Object.keys(a).length === 0; };
  P.terms = function (a) { return Object.keys(a).map(function (k) { return { c: a[k].c, v: a[k].v, key: k }; }); };
  P.coef = function (a, v) { var k = keyOf(v || {}); return a[k] ? a[k].c : [0, 1]; };
  P.constant = function (a) { return P.coef(a, {}); };
  function mdeg(v) { return Object.keys(v).reduce(function (s, x) { return s + v[x]; }, 0); }
  P.degree = function (a) { var ks = Object.keys(a); return ks.length ? Math.max.apply(null, ks.map(function (k) { return mdeg(a[k].v); })) : -Infinity; };
  P.degreeIn = function (a, x) { var ks = Object.keys(a); return ks.length ? Math.max.apply(null, ks.map(function (k) { return a[k].v[x] || 0; })) : -Infinity; };
  P.vars = function (a) { var s = {}; Object.keys(a).forEach(function (k) { Object.keys(a[k].v).forEach(function (x) { s[x] = 1; }); }); return Object.keys(s).sort(); };
  P.count = function (a) { return Object.keys(a).length; };
  P.lead = function (a, x) { var ts = sorted(a, { order: 'desc', var: x }); return ts.length ? ts[0].c : [0, 1]; };
  P.at = function (a, env) { return Object.keys(a).reduce(function (s, k) { var m = a[k].c[0] / a[k].c[1]; Object.keys(a[k].v).forEach(function (x) { m *= Math.pow(env[x], a[k].v[x]); }); return s + m; }, 0); };
  /* exact value at integer/rational points: env values numbers or [p,q] */
  P.atExact = function (a, env) {
    var s = [0, 1];
    Object.keys(a).forEach(function (k) { var m = a[k].c; Object.keys(a[k].v).forEach(function (x) { var e = R(env[x]); for (var i = 0; i < a[k].v[x]; i++) m = rmul(m, e); }); s = radd(s, m); });
    return s;
  };

  /* ---- order of terms: total degree, then powers of the earlier letter first (x² > xy > y² > x > y > 1) ---- */
  function cmpDesc(A, B, vs) {
    var da = mdeg(A.v), db = mdeg(B.v); if (da !== db) return db - da;
    for (var i = 0; i < vs.length; i++) { var ea = A.v[vs[i]] || 0, eb = B.v[vs[i]] || 0; if (ea !== eb) return eb - ea; }
    return 0;
  }
  function sorted(a, opt) {
    opt = opt || {}; var vs = opt.vars || P.vars(a), ts = P.terms(a);
    if (opt.var) { var x = opt.var; vs = [x].concat(vs.filter(function (y) { return y !== x; })); ts.sort(function (A, B) { var d = (B.v[x] || 0) - (A.v[x] || 0); return d || cmpDesc(A, B, vs); }); }
    else ts.sort(function (A, B) { return cmpDesc(A, B, vs); });
    if (opt.order === 'asc') ts.reverse();
    return ts;
  }
  P.sorted = sorted;
  P.monoTex = function (v) { return Object.keys(v).filter(function (x) { return v[x]; }).sort().map(function (x) { return v[x] === 1 ? x : x + '^{' + v[x] + '}'; }).join(''); };
  function decOf(c) { var q = c[1], k = 0; while (q % 10 === 0) { q /= 10; k++; } while (q % 2 === 0) { q /= 2; k++; } while (q % 5 === 0) { q /= 5; k++; } return q === 1 ? String(c[0] / c[1]) : null; }
  function coefTex(c, hasVars, first, opt) {
    var neg = c[0] < 0, a = [Math.abs(c[0]), c[1]], s;
    if (a[1] === 1) s = hasVars && a[0] === 1 ? '' : String(a[0]);
    else if (opt && opt.dec && decOf(a)) s = decOf(a);
    else s = '\\frac{' + a[0] + '}{' + a[1] + '}';
    return (neg ? '-' : first ? '' : '+') + s;
  }
  P.tex = function (a, opt) {
    a = lift(a); opt = opt || {};
    var ts = sorted(a, opt);
    if (!ts.length) return '0';
    return ts.map(function (T, i) { var m = P.monoTex(T.v); return coefTex(T.c, !!m, i === 0, opt) + m; }).join('');
  };
  /* terms written in exactly the order given (for prompts that copy the booklet's order): P.seq(['5', '-2x', '-x^2']) or polys */
  P.seq = function (list) {
    var out = '';
    list.forEach(function (x) { var tx = P.tex(lift(x)); if (tx === '0') return; out += out && tx.charAt(0) !== '-' ? '+' + tx : tx; });
    return out || '0';
  };
  /* LaTeX of a factor in brackets when it needs them: (2x-3), 5, x, -3x */
  P.btex = function (a) { a = lift(a); return P.count(a) > 1 ? '(' + P.tex(a) + ')' : P.tex(a); };

  /* ---------------- reading an answer ---------------- */
  function fromAst(a) {
    switch (a.t) {
      case 'num': var r = ex.rat(a); if (!r) throw { why: 'unreadable' }; return P.num(r);
      case 'var': return P.v(a.n);
      case 'pi': case 'root': case 'abs': throw { why: 'irrational' };
      case 'paren': return fromAst(a.a);
      case 'neg': return P.neg(fromAst(a.a));
      case 'add': return P.add(fromAst(a.a), fromAst(a.b));
      case 'sub': return P.sub(fromAst(a.a), fromAst(a.b));
      case 'mul': return P.mul(fromAst(a.a), fromAst(a.b));
      case 'div':
        var d = fromAst(a.b), ks = Object.keys(d);
        if (!ks.length) throw { why: 'undefined' };
        if (ks.length !== 1 || ks[0] !== '') throw { why: 'not-poly' };
        return P.scale(fromAst(a.a), rinv(d[''].c));
      case 'pow':
        var e = ex.rat(a.b); if (!e) throw { why: 'not-poly' };
        var base = fromAst(a.a);
        if (e[1] !== 1 || e[0] < 0) { var bk = Object.keys(base); if (bk.length === 1 && bk[0] === '') { var rv = ex.rat(a); if (rv) return P.num(rv); throw { why: 'irrational' }; } throw { why: 'not-poly' }; }
        if (e[0] > 24) throw { why: 'unreadable' };
        return P.pow(base, e[0]);
    }
    throw { why: 'unreadable' };
  }
  P.read = function (x) {
    var ast = x;
    if (typeof x === 'string') { var pr = ex.parse(x); if (!pr.ok) return { ok: false, why: 'unreadable', code: pr.code }; ast = pr.ast; }
    try { return { ok: true, p: fromAst(ast), ast: ast }; } catch (e) { if (e && e.why) return { ok: false, why: e.why }; if (e && e.message === 'overflow') return { ok: false, why: 'unreadable' }; throw e; }
  };
  P.parse = function (tex) { var r = P.read(tex); if (!r.ok) throw new Error('not a polynomial: ' + tex + ' (' + r.why + ')'); return r.p; };

  /* ---- is the answer written expanded and simplified? returns null or { code, msg } ---- */
  function signedTerms(a, s, out) {
    if (a.t === 'add') { signedTerms(a.a, s, out); signedTerms(a.b, s, out); return out; }
    if (a.t === 'sub') { signedTerms(a.a, s, out); signedTerms(a.b, -s, out); return out; }
    if (a.t === 'neg' && (a.a.t === 'add' || a.a.t === 'sub' || a.a.t === 'neg')) return signedTerms(a.a, -s, out);
    out.push({ s: s, a: a }); return out;
  }
  function factorsOf(a, out, inv) { // product/quotient factors, not entering brackets
    if (a.t === 'neg') return factorsOf(a.a, out, inv);
    if (a.t === 'mul') { factorsOf(a.a, out, inv); factorsOf(a.b, out, inv); return out; }
    if (a.t === 'div') { factorsOf(a.a, out, inv); factorsOf(a.b, out, !inv); return out; }
    out.push({ a: a, inv: inv }); return out;
  }
  P.formIssue = function (ast) {
    var top = ast; while (top.t === 'paren') top = top.a;
    if (top.t === 'num' && top.v === 0) return null; // the zero polynomial written as 0
    var terms = signedTerms(top, 1, []), seen = {}, i;
    for (i = 0; i < terms.length; i++) {
      var fs = factorsOf(terms[i].a, [], false), nums = 0, numsDen = 0, nv = [1, 1], dv = [1, 1], vars = {};
      for (var j = 0; j < fs.length; j++) {
        var f = fs[j].a;
        if (f.t === 'paren') {
          var inner = f.a; while (inner.t === 'paren') inner = inner.a;
          if (inner.t === 'add' || inner.t === 'sub') return { code: 'brackets', msg: 'Right answer — now <b>expand</b> it: multiply out the brackets and collect like terms.' };
          return { code: 'simplify', msg: 'Right answer — now multiply the factors together so each term is a single number times its variables.' };
        }
        if (f.t === 'pow') {
          var b = f.a; while (b.t === 'paren') b = b.a;
          if (b.t === 'add' || b.t === 'sub') return { code: 'brackets', msg: 'Right answer — now <b>expand</b> the power of the bracket and collect like terms.' };
          var e = ex.rat(f.b);
          if (b.t === 'num' || b.t === 'neg' || b.t === 'mul') return { code: 'evaluate', msg: 'Right answer — now work out the power, e.g. ' + t('(3x)^{2}=9x^{2}') + '.' };
          if (b.t === 'var') {
            if (e && e[0] === 0) return { code: 'zero-exp', msg: 'Right answer — but anything to the power ' + t('0') + ' is ' + t('1') + ', so simplify that term.' };
            if (vars[b.n]) return { code: 'combine', msg: 'Right answer — now combine the powers of ' + t(b.n) + ' in each term into one power.' };
            vars[b.n] = 1; if (fs[j].inv) return { code: 'not-poly', msg: '' };
            continue;
          }
          return { code: 'simplify', msg: 'Right answer — now simplify it fully.' };
        }
        if (f.t === 'var') { if (vars[f.n]) return { code: 'combine', msg: 'Right answer — now write repeated letters as a power, e.g. ' + t('x\\cdot x=x^{2}') + '.' }; vars[f.n] = 1; if (fs[j].inv) return { code: 'not-poly', msg: '' }; continue; }
        if (f.t === 'num') { var r = ex.rat(f); if (!r) return { code: 'simplify', msg: '' }; if (fs[j].inv) { numsDen++; dv = norm(dv[0] * r[0], dv[1] * r[1]); } else { nums++; nv = norm(nv[0] * r[0], nv[1] * r[1]); } continue; }
        return { code: 'simplify', msg: 'Right answer — now simplify it fully.' };
      }
      if (nums > 1 || numsDen > 1) return { code: 'coef', msg: 'Right answer — now multiply the numbers in each term into a single coefficient.' };
      if (numsDen && (nv[1] !== 1 || dv[1] !== 1 || gcd(nv[0], dv[0]) > 1)) return { code: 'lowest', msg: 'Right answer — now write each fraction coefficient in lowest terms.' };
      var rr = P.read(terms[i].a); if (!rr.ok) return { code: 'simplify', msg: 'Right answer — now simplify it fully.' };
      var ks = Object.keys(rr.p);
      if (ks.length === 0) return { code: 'zero-term', msg: 'Right answer — but a term with coefficient ' + t('0') + ' is just ' + t('0') + ': leave it out.' };
      if (ks.length > 1) return { code: 'brackets', msg: 'Right answer — now expand it fully and collect like terms.' };
      if (seen[ks[0]] && terms.length > 1) return { code: 'like-terms', msg: 'Right answer — now <b>collect the like terms</b>: you have more than one ' + (ks[0] ? t(P.monoTex(rr.p[ks[0]].v)) + ' term' : 'constant term') + '.' };
      seen[ks[0]] = 1;
    }
    return null;
  };
  /* the order the student wrote the terms in (monomial keys) */
  P.writtenOrder = function (ast) {
    var top = ast; while (top.t === 'paren') top = top.a;
    return signedTerms(top, 1, []).map(function (T) { var r = P.read(T.a); return r.ok ? Object.keys(r.p)[0] : null; });
  };

  /* a term typed into an exponent box by mistake: x^{2+3x}, x^{2x} */
  function spilled(ast) {
    var bad = false;
    (function w(x) { if (!x || typeof x !== 'object' || bad) return; if (x.t === 'pow') { var e = x.b; while (e.t === 'paren') e = e.a; if (hasVar(e) || ((e.t === 'add' || e.t === 'sub') && !ex.rat(e))) { bad = true; return; } } ['a', 'b'].forEach(function (k) { if (x[k]) w(x[k]); }); })(ast);
    return bad;
  }
  function hasVar(x) { if (!x || typeof x !== 'object') return false; if (x.t === 'var') return true; return hasVar(x.a) || hasVar(x.b); }
  /* ---------------- the checker ---------------- */
  function groupName(key, p) { if (!key) return 'constant term'; var v = p[key] ? p[key].v : null; return t(P.monoTex(v)) + ' term'; }
  K.poly = function (target, opt) {
    opt = opt || {};
    var T = lift(target), wrongs = (opt.wrong || []).map(function (w) { return { p: lift(w.is), code: w.code || 'diag', hint: w.hint }; });
    return function (resp) {
      var a = K.read(resp); if (a.res) return a.res;
      if (spilled(a.ast)) return form('exp-box', 'Part of your answer seems to have gone <b>into an exponent</b>. After typing a power, press <b>▶</b> (or the right arrow) to step out of the exponent before typing the next term.');
      var r = P.read(a.ast);
      if (!r.ok) {
        if (r.why === 'not-poly') return wrong('not-poly', 'That isn’t a polynomial: a variable has ended up in a denominator, or with a negative or fractional exponent. Check your work.');
        return wrong('value', null);
      }
      var S = r.p;
      if (P.eq(S, T)) {
        if (opt.expanded !== false) { var fi = P.formIssue(a.ast); if (fi && fi.code === 'not-poly') return wrong('not-poly', 'That isn’t a polynomial.'); if (fi) return form(fi.code, fi.msg || 'Right answer — now simplify it fully.'); }
        if (opt.order) {
          var want = sorted(T, { order: opt.order, var: opt.var }).map(function (x) { return x.key; }), got = P.writtenOrder(a.ast);
          if (got.join('|') !== want.join('|')) return wrong('order', 'All the right terms are there, but they aren’t in <b>' + (opt.order === 'asc' ? 'ascending' : 'descending') + '</b> order. ' + (opt.order === 'asc' ? 'Start with the constant term, then the smallest power of ' : 'Start with the highest power of ') + t(opt.var || P.vars(T)[0] || 'x') + '.');
        }
        return ok();
      }
      for (var i = 0; i < wrongs.length; i++) if (P.eq(S, wrongs[i].p)) return wrong(wrongs[i].code, wrongs[i].hint);
      if (opt.diag) { var h = opt.diag(S, T, a.ast); if (h) return wrong(h.code || 'diag', h.hint); }
      if (P.eq(S, P.neg(T))) return wrong('sign-all', 'Every sign in your answer is the opposite of what it should be. Check the sign of what you multiplied or subtracted by.');
      var keys = Object.keys(S).concat(Object.keys(T)).filter(function (k, j, arr) { return arr.indexOf(k) === j; });
      var diff = keys.filter(function (k) { return !req(P.coef(S, (S[k] || T[k]).v), P.coef(T, (S[k] || T[k]).v)); });
      if (diff.length && diff.every(function (k) { return S[k] && T[k] && S[k].c[0] * T[k].c[1] === -T[k].c[0] * S[k].c[1]; }))
        return wrong('sign', 'Check the <b>signs</b> of your ' + diff.map(function (k) { return groupName(k, T); }).join(' and ') + (diff.length > 1 ? 's' : '') + '. A minus sign in front of a bracket changes the sign of every term inside it, and a negative times a negative is positive.');
      var onlyS = Object.keys(S).filter(function (k) { return !T[k]; }), onlyT = Object.keys(T).filter(function (k) { return !S[k]; });
      if (onlyS.length && onlyT.length && onlyS.some(function (k) { return onlyT.some(function (j) { return req(S[k].c, T[j].c) && P.vars({ a: S[k] }).join() === P.vars({ a: T[j] }).join(); }); }))
        return wrong('exponent', 'Check the <b>exponents</b>. When you multiply powers of the same letter, add the exponents (' + t('x\\cdot x=x^{2}') + ', ' + t('x^{2}\\cdot x=x^{3}') + '); when you add or subtract like terms, the exponents stay the same.');
      if (diff.length === 1) {
        var k1 = diff[0];
        if (!S[k1]) return wrong('missing-term', 'Nearly there — your answer is missing the ' + groupName(k1, T) + '. Look again for every product that gives that kind of term.');
        if (!T[k1]) return wrong('extra-term', 'Nearly there — check your ' + groupName(k1, S) + ': it shouldn’t be in the final answer (do some terms cancel?).');
        return wrong('term', 'Most of your answer is right — check your ' + groupName(k1, T) + ' again.');
      }
      return wrong('value', null);
    };
  };
  HW.addCodes({
    'not-poly': 'Answer isn’t a polynomial', 'sign-all': 'Every sign flipped', exponent: 'Wrong exponent (multiplying vs adding)', 'missing-term': 'Left out one group of terms',
    'extra-term': 'Extra term that should cancel', 'exp-box': 'Typed a term into the exponent box', term: 'One group of like terms wrong', 'like-terms': 'Like terms not collected', 'zero-term': 'Left a 0 term', order: 'Terms in the wrong order'
  });

  K.P.poly = function (prompt, target, opt, sol, hints, text) {
    opt = opt || {}; var T = lift(target);
    var keyTex = opt.keyTex || P.tex(T, { order: opt.order, var: opt.var, dec: opt.dec });
    var vs = P.vars(T).concat(opt.vars || []).filter(function (v, i, arr) { return arr.indexOf(v) === i; }).sort();
    if (!vs.length) vs = ['x'];
    return K.P.math(prompt, K.poly(T, opt), keyTex, sol, hints, text, { keys: 'poly', vars: vs, before: opt.before, after: opt.after });
  };

  /* ---------------- keypad ---------------- */
  var W = HW.widgets;
  if (W && W.KEYSETS) {
    var d = function (n) { return { label: String(n), tex: String(n), plain: String(n) }; };
    var KY = {
      del: { label: '⌫', fn: 'del', title: 'Delete' }, clear: { label: 'clear', fn: 'clear' },
      left: { label: '◀', fn: 'left', title: 'Move left' }, right: { label: '▶', fn: 'right', title: 'Move right (out of a box)' },
      enter: { label: 'Check ↵', fn: 'enter', wide: true },
      plus: { label: '+', tex: '+', plain: '+' }, minus: { label: '−', tex: '-', plain: '-' },
      sq: { label: 'x<sup>2</sup>', tex: '^{2}', plain: '^2', title: 'Squared' },
      pow: { label: 'x<sup>n</sup>', tex: '#@^{#?}', plain: '^', title: 'Exponent' },
      frac: { label: '<sup>a</sup>⁄<sub>b</sub>', tex: '\\frac{#@}{#?}', plain: '/', title: 'Fraction' },
      par: { label: '( )', tex: '\\left(#0\\right)', plain: '(', title: 'Brackets' },
      dot: { label: '.', tex: '.', plain: '.' }
    };
    W.KEYSETS.poly = function (opt) {
      var vs = (opt && opt.vars && opt.vars.length ? opt.vars : ['x']).slice(0, 6).map(function (v) { return { label: '<i>' + v + '</i>', tex: v, plain: v }; });
      return [[d(7), d(8), d(9), KY.plus, KY.minus, KY.del], [d(4), d(5), d(6), KY.sq, KY.pow, KY.clear], [d(1), d(2), d(3), KY.frac, KY.left, KY.right], [d(0), KY.dot, KY.par, KY.enter], vs];
    };
    W.KEYHELP.poly = ['Tap a letter, then <b>x<sup>2</sup></b> or <b>x<sup>n</sup></b> for its power. Press <b>▶</b> to step out of an exponent before typing the next term.',
      'Type powers with <code>^</code>, e.g. <code>3x^2 - 5x + 4</code>.'];
  }

  /* ---------------- algebra tiles ---------------- */
  var U = 12, X = 44, GAP = 6; // unit side, x length (px in the SVG's own units)
  var POS = '#9aa3ad', NEG = '#ffffff', STROKE = '#2b3340';
  function tileDims(kind) { return kind === 'x2' ? [X, X] : kind === 'x' ? [U, X] : kind === 'xh' ? [X, U] : [U, U]; }
  function parseTok(tok) { var neg = tok.charAt(0) === '-', k = tok.replace(/^[-+]/, ''); return { neg: neg, kind: k === 'x2' ? 'x2' : k === 'x' ? 'x' : k === 'xh' ? 'xh' : '1' }; }
  function rect(x, y, w, h, neg) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="1.5" fill="' + (neg ? NEG : POS) + '" stroke="' + STROKE + '" stroke-width="1.3"/>'; }
  var tiles = HW.tiles = {};
  tiles.count = function (c) {
    var out = [], add = function (k, n) { for (var i = 0; i < Math.abs(n || 0); i++) out.push((n < 0 ? '-' : '') + k); };
    add('x2', c.x2); add('x', c.x); add('1', c.one != null ? c.one : c['1']); return out;
  };
  tiles.row = function (tokens, opt) {
    opt = opt || {};
    var x = 2, h = 0, parts = [], prev = null;
    tokens.forEach(function (tok) {
      var p = parseTok(tok), dm = tileDims(p.kind);
      if (prev && prev !== p.kind) x += GAP * 1.6;
      parts.push({ p: p, x: x, w: dm[0], h: dm[1] }); x += dm[0] + GAP; h = Math.max(h, dm[1]); prev = p.kind;
    });
    var W2 = Math.max(x - GAP + 2, 20), H2 = h + 4;
    var body = parts.map(function (q) { return rect(q.x, H2 - 2 - q.h, q.w, q.h, q.p.neg); }).join('');
    return '<svg class="tiles-svg" viewBox="0 0 ' + W2 + ' ' + H2 + '" width="100%" style="max-width:' + Math.min(520, W2 * (opt.scale || 1.6)) + 'px" role="img" aria-label="' + (opt.label || 'algebra tiles') + '">' + body + '</svg>';
  };
  /* top / side: tokens 'x' or '1' (with '-' for negative). Product cell sign = sign(top) × sign(side). */
  tiles.frame = function (top, side, opt) {
    opt = opt || {};
    var tp = top.map(parseTok), sp = side.map(parseTok), pad = 4, off = U + 6;
    var colW = tp.map(function (q) { return q.kind === 'x' || q.kind === 'xh' ? X : U; }), rowH = sp.map(function (q) { return q.kind === 'x' || q.kind === 'xh' ? X : U; });
    var cx = [], cy = [], x = off + pad, y = off + pad;
    colW.forEach(function (w) { cx.push(x); x += w + 2; }); rowH.forEach(function (h) { cy.push(y); y += h + 2; });
    var Wd = x + pad, Ht = y + pad, s = '';
    s += '<line x1="' + (pad) + '" y1="' + off + '" x2="' + (Wd - 2) + '" y2="' + off + '" stroke="' + STROKE + '" stroke-width="2.4"/>';
    s += '<line x1="' + off + '" y1="' + pad + '" x2="' + off + '" y2="' + (Ht - 2) + '" stroke="' + STROKE + '" stroke-width="2.4"/>';
    tp.forEach(function (q, i) { s += rect(cx[i], 2, colW[i], U, q.neg); });
    sp.forEach(function (q, j) { s += rect(2, cy[j], U, rowH[j], q.neg); });
    var blank = {}; (opt.blanks || []).forEach(function (b) { blank[b[0] + ',' + b[1]] = 1; });
    if (opt.fill) {
      sp.forEach(function (qs, j) { tp.forEach(function (qt, i) { if (blank[j + ',' + i]) { s += '<rect x="' + cx[i] + '" y="' + cy[j] + '" width="' + colW[i] + '" height="' + rowH[j] + '" fill="none" stroke="#9aa3ad" stroke-dasharray="3 2"/>'; return; } s += rect(cx[i], cy[j], colW[i], rowH[j], qs.neg !== qt.neg); }); });
    } else s += '<rect x="' + (off + pad) + '" y="' + (off + pad) + '" width="' + (x - off - pad - 2) + '" height="' + (y - off - pad - 2) + '" fill="none" stroke="#9aa3ad" stroke-dasharray="4 3"/>';
    return '<svg class="tiles-svg" viewBox="0 0 ' + Wd + ' ' + Ht + '" width="100%" style="max-width:' + Math.min(420, Wd * (opt.scale || 1.6)) + 'px" role="img" aria-label="algebra tile multiplication frame">' + s + '</svg>';
  };
  tiles.legend = function () {
    function sw(neg, w, h) { return '<svg viewBox="0 0 ' + (w + 2) + ' ' + (h + 2) + '" width="' + (w + 2) + '" height="' + (h + 2) + '" style="vertical-align:middle">' + rect(1, 1, w, h, neg) + '</svg>'; }
    return '<div class="tiles-legend"><span>' + sw(false, 18, 18) + ' ' + t('x^{2}') + '</span><span>' + sw(false, 6, 18) + ' ' + t('x') + '</span><span>' + sw(false, 6, 6) + ' ' + t('1') + '</span><span class="muted">shaded = positive, white = negative</span></div>';
  };

  /* ---------------- area model ---------------- */
  function texSvg(latex) { return HW.k ? HW.k(latex) : latex; }
  HW.areaModel = function (cols, rows, cells, opt) {
    opt = opt || {};
    var ws = opt.widths || cols.map(function () { return 1; }), hs = opt.heights || rows.map(function () { return 1; });
    var tw = ws.reduce(function (a, b) { return a + b; }, 0), th = hs.reduce(function (a, b) { return a + b; }, 0);
    var html = '<div class="area-model" style="max-width:' + (opt.max || 460) + 'px"><div class="am-grid" style="grid-template-columns:auto ' + ws.map(function (w) { return 'minmax(0,' + (w / tw * 100).toFixed(3) + 'fr)'; }).join(' ') + '">';
    html += '<div class="am-corner"></div>' + cols.map(function (c) { return '<div class="am-top">' + texSvg(c) + '</div>'; }).join('');
    rows.forEach(function (r, j) {
      html += '<div class="am-side" style="min-height:' + Math.max(42, 110 * hs[j] / th) + 'px">' + texSvg(r) + '</div>';
      cols.forEach(function (c, i) { var v = cells && cells[j] ? cells[j][i] : ''; html += '<div class="am-cell">' + (v === '?' ? '<b>?</b>' : v ? texSvg(v) : '') + '</div>'; });
    });
    return html + '</div></div>';
  };
})(typeof window !== 'undefined' ? window : globalThis);
