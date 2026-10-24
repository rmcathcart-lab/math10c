/* Math 10C · Unit 2 Test (AN3) — the paper outcomes-based unit test (u2_test_A/B/C.tex) as generators.
 * The paper has three pages for AN3 (Part 1 exponent laws with integer exponents, Part 2 zero and negative exponents,
 * Part 3 rational exponents and radicals), each in BEG / PRG / MAS boxes; every question keeps its box (level), outcome
 * and paper number, and HW.defineTest puts them Beginning → Progressing → Mastery. Each part takes its numbers from the
 * seed, inside the range that Versions A, B and C show (their numbers are possible values), and the part types that the
 * versions shuffle (Q1, Q12, Q17, Q18, Q21) are shuffled the same way.
 * Conversions from paper: "find each error, explain it" → select every real error (decoys explain why they are fine),
 * then type the correct answer; "true or false, justify" → type the exact value of the left side (the justification),
 * then true/false; "create an expression using two laws" → typed expression, checked for value and for two different
 * laws; "explain why … is not real" → select the correct reasons, then the value (or none) of each power. */
(function (root) {
  'use strict';
  var HW = root.HW, ex = HW.ex, F = HW.fmt, K = HW.kit, P = K.P, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form;

  HW.addCodes({
    'u2t-opposite': 'Treated a negative exponent as a negative sign', 'u2t-times-exp': 'Multiplied the base by the exponent',
    'u2t-square-root': 'Used a square root instead of the index in the exponent', 'u2t-coef-inside': 'Moved the coefficient under the radical',
    'u2t-no-root': 'Forgot the root (used only the numerator of the exponent)', 'u2t-zero-neg': 'Gave (−a)⁰ = −1 (the bracket makes −a the base)',
    'u2t-zero-base': 'Took a⁰ to be a', 'u2t-repeat': 'Repeated the error in the worked example', 'u2t-err-decoy': 'Picked a correct step as an error',
    'u2t-err-missed': 'Missed one of the errors', 'u2t-err-missed2': 'Missed most of the errors', 'u2t-one-law': 'Used only one exponent law',
    'u2t-no-law': 'Gave the simplified answer itself (no laws used)', 'u2t-sum': 'Used a sum instead of exponent laws', 'u2t-tf-verdict': 'Right value, wrong true/false',
    'u2t-multiplied': 'Multiplied the amounts instead of dividing', 'u2t-base-power': 'Didn’t rewrite the base as a power of the common base',
    'u2t-none-real': 'Said “not real” for a power that has a value', 'u2t-has-value': 'Gave a value for a power that is not real',
    'u2t-reason-decoy': 'Picked a wrong reason', 'u2t-reason-missed': 'Missed one of the reasons', 'u2t-inside': 'Inside of the bracket simplified wrongly'
  });
  HW.addPartial({
    'u2t-opposite': 'n', 'u2t-times-exp': 'n', 'u2t-square-root': 'b', 'u2t-coef-inside': 'b', 'u2t-no-root': 'b', 'u2t-zero-neg': 'b', 'u2t-zero-base': 'n',
    'u2t-repeat': 'n', 'u2t-err-decoy': 'n', 'u2t-err-missed': 's', 'u2t-err-missed2': 'b', 'u2t-one-law': 'b', 'u2t-no-law': 'n', 'u2t-sum': 'n',
    'u2t-tf-verdict': 's', 'u2t-multiplied': 'n', 'u2t-base-power': 'b', 'u2t-none-real': 'n', 'u2t-has-value': 'n', 'u2t-reason-decoy': 'n',
    'u2t-reason-missed': 's', 'u2t-inside': 'b'
  });

  /* ---------- rationals [p, q] ---------- */
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var x = a % b; a = b; b = x; } return a; }
  function Q(p, q) { if (Array.isArray(p)) { q = p[1]; p = p[0]; } q = q == null ? 1 : q; if (q < 0) { p = -p; q = -q; } var g = gcd(p, q) || 1; return [p / g, q / g]; }
  function qadd(a, b) { a = Q(a); b = Q(b); return Q(a[0] * b[1] + b[0] * a[1], a[1] * b[1]); }
  function qsub(a, b) { b = Q(b); return qadd(a, [-b[0], b[1]]); }
  function qmul(a, b) { a = Q(a); b = Q(b); return Q(a[0] * b[0], a[1] * b[1]); }
  function qdiv(a, b) { a = Q(a); b = Q(b); return Q(a[0] * b[1], a[1] * b[0]); }
  function qeq(a, b) { a = Q(a); b = Q(b); return a[0] === b[0] && a[1] === b[1]; }
  function qv(a) { a = Q(a); return a[0] / a[1]; }
  function iroot(x, n) {
    if (x < 0) { if (n % 2 === 0) return null; var r0 = iroot(-x, n); return r0 == null ? null : -r0; }
    var r = Math.round(Math.pow(x, 1 / n)); for (var d = -1; d <= 1; d++) if (r + d >= 0 && Math.pow(r + d, n) === x) return r + d; return null;
  }
  function qpow(c, e) { // exact c^e
    c = Q(c); e = Q(e); var a = iroot(c[0], e[1]), b = iroot(c[1], e[1]);
    if (a == null || b == null) throw new Error('u2test: no exact root ' + c + '^' + e);
    var m = Math.abs(e[0]), res = Q(Math.pow(a, m), Math.pow(b, m)); return e[0] < 0 ? Q(res[1], res[0]) : res;
  }
  function near(a, b) { return isFinite(a) && isFinite(b) && Math.abs(a - b) <= 1e-7 * Math.max(1, Math.abs(a), Math.abs(b)); }
  function find(gen, test, fallback) { for (var i = 0; i < 800; i++) { var v = gen(); if (v != null && test(v)) return v; } if (fallback === undefined) throw new Error('u2test: no values found'); return fallback; }
  function cop(a, b) { return gcd(a, b) === 1; }

  /* ---------- TeX ---------- */
  function nT(fr) { fr = Q(fr); return fr[1] === 1 ? F(fr[0]) : (fr[0] < 0 ? '-' : '') + '\\frac{' + F(Math.abs(fr[0])) + '}{' + F(fr[1]) + '}'; }  // a value
  function eT(e) { e = Q(e); return e[1] === 1 ? String(e[0]) : (e[0] < 0 ? '-' : '') + '\\frac{' + Math.abs(e[0]) + '}{' + e[1] + '}'; }      // an exponent
  function pT(e) { e = Q(e); return e[0] < 0 ? '\\left(' + eT(e) + '\\right)' : eT(e); }                                                   // exponent in a working sum
  function pw(v, e) { e = Q(e); if (e[0] === 0) return ''; if (e[0] === 1 && e[1] === 1) return v; return v + '^{' + eT(e) + '}'; }
  function pwx(v, e) { return v + '^{' + eT(e) + '}'; } // always shows the exponent
  function rootT(n, inner) { return n === 2 ? '\\sqrt{' + inner + '}' : '\\sqrt[' + n + ']{' + inner + '}'; }
  function br(s) { return '\\left(' + s + '\\right)'; }
  function rootName(n) { return K.rootName(n); }
  var LET = 'abcdhkmnpqrstuvwxyz'.split('');
  var PAIRS = [['a', 'b'], ['x', 'y'], ['c', 'd'], ['m', 'n'], ['p', 'q'], ['r', 's'], ['u', 'v'], ['h', 'k']];

  /* ---------- monomials: { c: [p,q], v: [[letter, [p,q]], …] } (display order kept) ---------- */
  function M(c, pairs) { return { c: Q(c), v: (pairs || []).map(function (p) { return [p[0], Q(p[1])]; }) }; }
  function mmul(A, B) {
    var v = A.v.map(function (p) { return [p[0], p[1]]; });
    B.v.forEach(function (p) { var f = null; v.forEach(function (q) { if (q[0] === p[0]) f = q; }); if (f) f[1] = qadd(f[1], p[1]); else v.push([p[0], p[1]]); });
    return { c: qmul(A.c, B.c), v: v };
  }
  function minv(A) { return { c: qdiv(1, A.c), v: A.v.map(function (p) { return [p[0], qmul(p[1], -1)]; }) }; }
  function mdiv(A, B) { return mmul(A, minv(B)); }
  function mpow(A, r) { return { c: qpow(A.c, r), v: A.v.map(function (p) { return [p[0], qmul(p[1], r)]; }) }; }
  function cK(c, hasVars) { c = Q(c); if (c[1] === 1) return hasVars && c[0] === 1 ? '' : hasVars && c[0] === -1 ? '-' : F(c[0]); return (c[0] < 0 ? '-' : '') + '\\frac{' + Math.abs(c[0]) + '}{' + c[1] + '}'; }
  /* as written in a working line (any exponents) */
  function rawTex(A) { var vs = A.v.filter(function (p) { return p[1][0] !== 0; }).map(function (p) { return pw(p[0], p[1]); }).join(''); return cK(A.c, !!vs) + vs; }
  /* final answer: positive exponents, one fraction bar */
  function posTex(A) {
    var c = Q(A.c), neg = c[0] < 0, cn = Math.abs(c[0]), cd = c[1];
    var nv = A.v.filter(function (p) { return p[1][0] > 0; }).map(function (p) { return pw(p[0], p[1]); }).join('');
    var dv = A.v.filter(function (p) { return p[1][0] < 0; }).map(function (p) { return pw(p[0], qmul(p[1], -1)); }).join('');
    var num = (cn !== 1 || !nv ? F(cn) : '') + nv, den = (cd !== 1 ? String(cd) : '') + dv;
    return (neg ? '-' : '') + (den ? '\\frac{' + num + '}{' + den + '}' : num);
  }
  function radSide(list) {
    var ints = '', g = {}, order = [];
    list.forEach(function (f) { var e = Q(f[1]); if (e[1] === 1) ints += pw(f[0], e); else { if (g[e[1]] == null) { g[e[1]] = ''; order.push(e[1]); } g[e[1]] += pw(f[0], [e[0], 1]); } });
    return ints + order.map(function (q) { return rootT(q, g[q]); }).join('');
  }
  /* radical form of a monomial (fractional exponents → roots, negative exponents → denominator) */
  function radTex(A) {
    var c = Q(A.c), num = A.v.filter(function (p) { return p[1][0] > 0; }), den = A.v.filter(function (p) { return p[1][0] < 0; }).map(function (p) { return [p[0], qmul(p[1], -1)]; });
    var s = c[0] < 0 ? '-' : '', cp = Math.abs(c[0]), N = radSide(num), D = radSide(den);
    N = (cp === 1 && N ? '' : F(cp)) + N; D = (c[1] === 1 ? '' : String(c[1])) + D;
    return s + (D ? '\\frac{' + N + '}{' + D + '}' : N);
  }
  function hasFracExp(A) { return A.v.some(function (p) { return p[1][1] !== 1 && p[1][0] !== 0; }); }
  function lettersOf(A) { return A.v.map(function (p) { return p[0]; }); }

  /* ---------- reading typed answers ---------- */
  function strip(x) { while (x && x.t === 'paren') x = x.a; return x; }
  function kids(x) { return ['a', 'b', 'n'].filter(function (k) { return x[k] && typeof x[k] === 'object'; }).map(function (k) { return x[k]; }); }
  function walk(x, fn) { if (!x || typeof x !== 'object') return; fn(x); kids(x).forEach(function (c) { walk(c, fn); }); }
  function varsOf(ast) { var acc = {}; walk(ast, function (x) { if (x.t === 'var') acc[x.n] = 1; }); return Object.keys(acc); }
  function union(a, b) { return a.concat(b.filter(function (v) { return a.indexOf(v) < 0; })); }
  function same(a, b, vs) { return vs.length ? ex.equiv(a, b, vs, 6) : ex.eq(ex.value(a), ex.value(b)); }
  function hasDiv(x) { var f = false; walk(x, function (y) { if (y.t === 'div' || (y.t === 'num' && y.dec)) f = true; }); return f; }
  function hasNum(x) { x = strip(x); if (!x) return false; if (x.t === 'num') return true; if (x.t === 'mul' || x.t === 'neg') return kids(x).some(hasNum); return false; }
  function shapeOf(ast) {
    var f = { roots: 0, ratExp: false, negExp: false, powOfRoot: false, unexpanded: false, idx: [] };
    (function w(x, inRoot) {
      if (!x || typeof x !== 'object') return;
      if (x.t === 'root') { f.roots++; var ir = ex.rat(x.n); f.idx.push(ir && ir[1] === 1 ? ir[0] : null); }
      if (x.t === 'pow') {
        if (hasDiv(x.b)) f.ratExp = true;
        var e = strip(x.b), er = ex.rat(x.b);
        if (e.t === 'neg' || (er && er[0] < 0)) f.negExp = true;
        if (strip(x.a).t === 'root') f.powOfRoot = true;
        var bs = strip(x.a); if (inRoot && (bs.t === 'num' || (bs.t === 'mul' && hasNum(bs)))) f.unexpanded = true;
      }
      kids(x).forEach(function (c) { w(c, inRoot || x.t === 'root'); });
    })(ast, false);
    return f;
  }
  function sampleEnv(vars, i) { var env = {}; vars.forEach(function (v, j) { env[v] = 0.37 + 1.13 * ((i * 7 + j * 3) % 11) / 5 + j * 0.21; }); return env; }
  function equivAt(a, b, vars) { for (var i = 0; i < 5; i++) { var env = sampleEnv(vars, i); if (!near(ex.value(a, env), ex.value(b, env))) return false; } return true; }

  /* an exponent written as a single integer or a fraction in lowest terms (from Lesson 5) */
  function expIssue(e) {
    e = strip(e); if (e.t === 'neg') e = strip(e.a);
    if (e.t === 'num') return e.dec ? form('exp-form', 'Right value — write the exponent as a fraction (for example ' + t('x^{\\frac{3}{2}}') + ' rather than ' + t('x^{1.5}') + ').') : null;
    if (e.t === 'div') {
      var n = strip(e.a), d = strip(e.b); if (n.t === 'neg') n = strip(n.a); if (d.t === 'neg') d = strip(d.a);
      if (n.t === 'num' && d.t === 'num' && !n.dec && !d.dec) {
        if (d.v === 1 || gcd(n.v, d.v) > 1) return form('exp-form', 'Right value — now reduce the exponent ' + t('\\frac{' + n.v + '}{' + d.v + '}') + ' to lowest terms.');
        return null;
      }
    }
    return form('exp-form', 'Right value — now work each exponent out to a single number or fraction.');
  }
  var POS = 'Right value — now write it with <b>positive exponents</b> only (a power with a negative exponent moves to the other side of the fraction bar).';
  function fmtIssue(ast, opt) {
    opt = opt || {}; var res = null, rad = opt.form === 'radical';
    walk(ast, function (x) {
      if (res) return;
      if (x.t === 'pow') { res = expIssue(x.b); if (!res && rad) { var e = ex.rat(x.b); if (e && e[0] < 0) res = form('neg-exp', POS); } }
      else if (x.t === 'root' && rad) {
        var nested = false; walk(x.a, function (y) { if (y.t === 'root') nested = true; });
        if (nested) { res = form('not-simplest', 'Right value — now write it with a <b>single</b> radical: a root of a root is one root (multiply the indices).'); return; }
        var n = ex.rat(x.n), an = ex.analyze(x.a); if (!n || n[1] !== 1 || !an.coef || an.flags.complex || an.flags.nested) return;
        var vs = Object.keys(an.vars), g = n[0];
        if (!vs.length || vs.some(function (v) { return an.vars[v][1] !== 1; })) return;
        vs.forEach(function (v) { g = gcd(g, an.vars[v][0]); });
        if (g > 1 && Math.abs(an.coef[0]) === 1 && an.coef[1] === 1) res = form('not-simplest', 'Right value — but the index and the exponent share a factor of ' + t(g) + ', so the radical simplifies (for example ' + t('\\sqrt[6]{x^{4}}=\\sqrt[3]{x^{2}}') + ').');
      }
    });
    return res;
  }
  /* K.expo plus: exponents in lowest terms, radical form simplified */
  function EX(target, opt) {
    opt = opt || {}; var c = K.expo(target, opt);
    return function (resp) { var r = c(resp); if (r.v !== 'correct') return r; var p = ex.parse(resp); return (p.ok && fmtIssue(p.ast, opt)) || r; };
  }
  /* diagnoses by equivalence with known wrong answers: [[tex, code, hint]] (entries equal to the target are dropped) */
  function known(list, target) {
    var tp = target ? ex.parse(target).ast : null, tv = tp ? varsOf(tp) : [], L = [];
    list.forEach(function (k) {
      if (!k) return; var p = ex.parse(k[0]); if (!p.ok) throw new Error('u2test: bad known tex ' + k[0]);
      var vs = union(varsOf(p.ast), tv); if (tp && same(p.ast, tp, vs)) return;
      if (L.some(function (y) { return same(p.ast, y.ast, union(vs, y.vars)); })) return;
      L.push({ tex: k[0], ast: p.ast, vars: vs, code: k[1], hint: k[2] });
    });
    var f = function (an, ast) { var sv = varsOf(ast); for (var i = 0; i < L.length; i++) if (same(ast, L[i].ast, union(L[i].vars, sv))) return { code: L[i].code, hint: L[i].hint }; return null; };
    f.texs = L.map(function (x) { return x.tex; });
    return f;
  }
  /* one exponent-law answer box */
  function XP(prompt, target, opt, sol, hints, text, kn) {
    opt = opt || {}; if (kn) opt.diag = kn;
    var p = P.expo(prompt, target, opt, sol, hints, text); p.check = EX(target, opt);
    p.bad = kn ? kn.texs.slice() : [];
    return p;
  }
  /* known wrong answers given as monomials: [[A, code, hint]] → known() list */
  function kmono(list, target) { return known(list.filter(Boolean).map(function (k) { return [posTex(k[0]), k[1], k[2]]; }), target); }
  /* value answers (a fraction in lowest terms) with known wrong values [[v, code, hint]] */
  function numKnown(list, T) {
    var L = []; (list || []).forEach(function (c) { if (c && isFinite(c[0]) && !near(c[0], T) && !L.some(function (y) { return near(y[0], c[0]); })) L.push(c); });
    var f = function (v) { for (var i = 0; i < L.length; i++) if (near(v, L[i][0])) return { code: L[i][1], hint: L[i][2] }; return null; };
    f.list = L; return f;
  }
  function valTex(v) { var fr = toFrac(v); return fr ? nT(fr) : String(v); }
  function toFrac(v) { for (var q = 1; q <= 5000; q++) { var p = Math.round(v * q); if (Math.abs(p / q - v) < 1e-9 * Math.max(1, Math.abs(v))) return Q(p, q); } return null; }
  function VAL(prompt, fr, cands, sol, hints, text, inp) {
    fr = Q(fr); var T = qv(fr), kn = numKnown(cands, T);
    var p = P.math(prompt, K.fraction(fr, { diag: kn }), nT(fr).replace(/\\,/g, ''), sol, hints, text, Object.assign({ keys: 'fraction' }, inp || {}));
    p.answer = t(nT(fr)); p.bad = kn.list.map(function (c) { return valTex(c[0]).replace(/\\,/g, ''); });
    return p;
  }
  function T(s) { return HW.tex(s); }
  /* select every real error / reason: items [{ value, html, right, why }] */
  function selectPart(r, prompt, items, sol, hints, text, codes) {
    codes = codes || { decoy: 'u2t-err-decoy', one: 'u2t-err-missed', more: 'u2t-err-missed2' };
    var want = items.filter(function (o) { return o.right; }).map(function (o) { return o.value; }), by = {};
    items.forEach(function (o) { by[o.value] = o; });
    var shown = r.shuffle(items);
    var p = { prompt: prompt, input: { type: 'select', options: shown.map(function (o) { return { value: o.value, html: T(o.html) }; }) }, key: want,
      answer: items.filter(function (o) { return o.right; }).map(function (o) { return T(o.html); }).join('<br>'), solution: sol, hints: hints || [], text: text,
      check: K.selectSet(want, function (extra, missing) {
        if (extra.length) return { code: codes.decoy, hint: by[extra[0]].why };
        return { code: missing.length === 1 ? codes.one : codes.more, hint: 'You found ' + (want.length - missing.length) + ' of the ' + want.length + '. Look again at every step.' };
      }) };
    var dec = items.filter(function (o) { return !o.right; });
    p.bad = [want.slice(0, want.length - 1), want.concat([dec[0].value])];
    return p;
  }

  /* ---------- evaluating b^(m/n) exactly (from Lesson 4) ---------- */
  function ratRoot(fr, n) { var a = iroot(fr[0], n), b = iroot(fr[1], n); return a == null || b == null ? null : [a, b]; }
  function ratPow(fr, k) { var pp = Math.pow(fr[0], Math.abs(k)), qq = Math.pow(fr[1], Math.abs(k)); return k < 0 ? Q(qq, pp) : Q(pp, qq); }
  function rpow(b, m, n) { var g = gcd(m, n) || 1; m /= g; n /= g; if (n < 0) { m = -m; n = -n; } if (b < 0) { if (n % 2 === 0) return NaN; return Math.pow(-Math.pow(-b, 1 / n), m); } return Math.pow(b, m / n); }
  function sgn(x) { return x < 0 ? -1 : 1; }
  function expS(m, n) { var g = gcd(m, n) || 1; m /= g; n /= g; if (n < 0) { m = -m; n = -n; } return n === 1 ? String(m) : (m < 0 ? '-' : '') + '\\frac{' + Math.abs(m) + '}{' + n + '}'; }
  function baseTex(fr) { var s = nT(fr); return fr[0] < 0 || fr[1] !== 1 ? br(s) : s; }
  function dedupe(arr) { return arr.filter(function (x, i) { return i === 0 || x !== arr[i - 1]; }); }
  /* o: { base:[p,q], m, n, btex (base TeX in the prompt), sbtex (base TeX in the solution), pre (first solution line), text } */
  function EV(o) {
    var n = o.n, m = o.m, rt = ratRoot(o.base, n);
    if (!rt) throw new Error('u2test: no exact root ' + o.base + ' index ' + n);
    var val = ratPow(rt, m), bt = o.btex || baseTex(o.base), expr = bt + '^{' + expS(m, n) + '}';
    var cands = evalCands(o, rt, qv(val));
    var hints = ['The denominator ' + t(n) + ' is the index of the root and the numerator ' + t(Math.abs(m)) + ' is the power. Take the root first to keep the numbers small.'];
    if (m < 0) hints.push('A negative exponent means <b>reciprocal</b>: ' + t('a^{-k}=\\frac{1}{a^{k}}') + '. It doesn’t make the answer negative.');
    else if (o.base[0] < 0) hints.push('An odd root of a negative number is negative, e.g. ' + t('\\sqrt[3]{-8}=-2') + '.');
    var p = VAL(t(expr), val, cands, evalSol(o, rt, val), hints, o.text || 'evaluate ' + expr.replace(/\\left|\\right/g, ''));
    p.expr = expr;
    return p;
  }
  function evalSol(o, rt, val) {
    var n = o.n, k = Math.abs(o.m), B = o.sbtex || o.btex || baseTex(o.base), E = expS(o.m, n);
    var inner = nT(o.base), rad = rootT(n, inner), radk = k === 1 ? rad : br(rad) + '^{' + k + '}';
    var Rk = k === 1 ? nT(rt) : baseTex(rt) + '^{' + k + '}', PK = nT(ratPow(rt, k));
    var chain = [B + '^{' + E + '}'];
    if (o.m > 0) chain.push(radk, Rk, PK); else chain.push('\\frac{1}{' + radk + '}', '\\frac{1}{' + Rk + '}', '\\frac{1}{' + PK + '}', nT(val));
    var lines = [];
    if (o.pre) lines.push(o.pre);
    lines.push('The denominator ' + t(n) + ' is the index: take the ' + rootName(n) + ' root' + (k > 1 ? ', then raise it to the power ' + t(k) : '') + (o.m < 0 ? '. The negative exponent means reciprocal.' : '.')
      + (o.base[0] < 0 ? ' The index ' + t(n) + ' is odd, so the root of the negative base exists' + (k > 1 ? (k % 2 ? ' (and an odd power keeps it negative)' : ' (and the even power makes it positive)') : '') + '.' : ''));
    lines.push(t(dedupe(chain).join('=')));
    return lines.join('<br>');
  }
  function evalCands(o, rt, Tv) {
    var b = qv(o.base), m = o.m, n = o.n, k = Math.abs(m), out = [], B = o.sbtex || o.btex || baseTex(o.base), inner = nT(o.base);
    function add(v, code, hint) { out.push([v, code, hint]); }
    if (m < 0) add(-rpow(b, k, n), 'u2t-opposite', 'A negative exponent means <b>reciprocal</b>, not a negative answer: ' + t('a^{-k}=\\frac{1}{a^{k}}') + '.');
    if (m < 0) add(rpow(b, k, n), 'no-recip', 'You found ' + t(B + '^{' + expS(k, n) + '}') + '. The exponent is negative, so take the <b>reciprocal</b>' + (o.base[1] !== 1 ? ' (flip the fraction)' : '') + '.');
    if (b < 0) add(-Tv, 'sign', k % 2 === 0 ? 'The ' + rootName(n) + ' root of a negative number is negative, but the even power ' + t(k) + ' makes the result positive.' : 'The ' + rootName(n) + ' root of ' + t(inner) + ' is negative, and an odd power keeps it negative.');
    if (k > 1) add(rpow(b, sgn(m) * n, k), 'index-power', 'It looks like the root and the power are swapped. The <b>denominator</b> ' + t(n) + ' is the index of the root; the <b>numerator</b> ' + t(k) + ' is the power.');
    if (k > 1) add(rpow(b, sgn(m), n), 'root-only', 'You took the ' + rootName(n) + ' root. Now raise it to the power ' + t(k) + ' — that’s what the numerator says.');
    add(Math.pow(b, m), 'u2t-no-root', 'Don’t forget the root: the denominator ' + t(n) + ' means take the ' + rootName(n) + ' root.');
    if (n !== 2) add(rpow(b, m, 2), 'u2t-square-root', 'The denominator is ' + t(n) + ', so this is a <b>' + rootName(n) + '</b> root, not a square root.');
    add(b * m / n, 'u2t-times-exp', 'The exponent isn’t a multiplier: denominator = index of the root, numerator = power.');
    return out;
  }

  /* ---------- converting between powers and radicals (from Lesson 4) ---------- */
  function convCheck(target, opt) {
    opt = opt || {};
    var tp = ex.parse(target); if (!tp.ok) throw new Error('u2test: bad target ' + target);
    var tv = varsOf(tp.ast), cands = (opt.cands || []).map(function (c) { var q = ex.parse(c[0]); if (!q.ok) throw new Error('u2test: bad cand ' + c[0]); return { ast: q.ast, code: c[1], hint: c[2] }; });
    return function (resp) {
      var a = K.read(resp); if (a.res) return a.res;
      var sv = varsOf(a.ast), extra = sv.filter(function (v) { return tv.indexOf(v) < 0; });
      if (extra.length) return wrong('var', 'Your answer has a letter ' + t(extra[0]) + ' that isn’t in the question.');
      var f = shapeOf(a.ast);
      if (equivAt(a.ast, tp.ast, tv)) {
        if (opt.form === 'radical') {
          if (f.ratExp) return form('not-radical', 'Right value — now write it in <b>radical form</b> (use the root key; no fractional exponents).');
          if (!f.roots) return form('not-radical', 'Right value — but write it with a radical sign, as the question asks.');
          if (opt.index && f.idx.some(function (i) { return i !== opt.index; })) return form('index', 'Right value, but use a ' + rootName(opt.index) + ' root (index ' + t(opt.index) + '), as the exponent says.');
          if (f.negExp) return form('neg-exp', 'Right value — now write it without a negative exponent: a negative exponent puts the radical in the <b>denominator</b>.');
          return ok();
        }
        if (opt.form === 'power') {
          if (f.roots) return form('not-power', 'Right value — now write it as a <b>power</b> with a rational exponent (no radical sign).');
          if (opt.single && strip(a.ast).t !== 'pow') return form('single-power', 'Right value — now write it as a <b>single power</b> ' + t(opt.single) + ' (one base, one exponent).');
          var bad = null; walk(a.ast, function (x) { if (!bad && x.t === 'pow') bad = expIssue(x.b); }); if (bad) return bad;
          return ok();
        }
        return ok();
      }
      for (var i = 0; i < cands.length; i++) if (equivAt(a.ast, cands[i].ast, tv)) return wrong(cands[i].code, cands[i].hint);
      return wrong('value', null);
    };
  }
  function convPart(promptHtml, target, opt, sol, hints, text) {
    var vs = varsOf(ex.parse(target).ast).sort(), tp = ex.parse(target).ast;
    opt.cands = (opt.cands || []).filter(function (c, i, arr) { var q = ex.parse(c[0]).ast; return !equivAt(q, tp, vs) && !arr.slice(0, i).some(function (d) { return equivAt(ex.parse(d[0]).ast, q, vs); }); });
    var p = P.math(promptHtml, convCheck(target, opt), target, sol, hints, text, { keys: 'expo', vars: vs.length ? vs : ['x'] });
    p.bad = opt.cands.map(function (c) { return c[0]; });
    return p;
  }
  function radOf(v, m, n, c) { var k = Math.abs(m), r = rootT(n, k === 1 ? v : v + '^{' + k + '}'), cc = c && c !== 1 ? String(c) : ''; return m < 0 ? '\\frac{' + (cc || '1') + '}{' + r + '}' : cc + r; }
  function radCands(v, m, n, c) {
    var k = Math.abs(m), s = sgn(m), out = [];
    if (k > 1) out.push([radOf(v, s * n, k, c), 'index-power', 'The <b>denominator</b> ' + t(n) + ' is the index of the root and the <b>numerator</b> ' + t(k) + ' is the power — you have them the other way round.']);
    if (m < 0) out.push(['-' + radOf(v, k, n, c), 'u2t-opposite', 'A negative exponent doesn’t make the expression negative — it means <b>reciprocal</b>: the radical goes in the denominator.']);
    if (m < 0) out.push([radOf(v, k, n, c), 'no-recip', 'The exponent is negative, so the radical belongs in the <b>denominator</b>: ' + t('x^{-a}=\\frac{1}{x^{a}}') + '.']);
    if (k > 1) out.push([radOf(v, s, n, c), 'root-only', 'You have the root, but the numerator ' + t(k) + ' is a power that still has to appear.']);
    if (n !== 2) out.push([radOf(v, m, 2, c), 'u2t-square-root', 'The denominator is ' + t(n) + ', so use a <b>' + rootName(n) + '</b> root (index ' + t(n) + '), not a square root.']);
    return out;
  }
  var CONV_HINTS = ['The denominator of the exponent is the index of the root; the numerator is the power: ' + t('x^{\\frac{m}{n}}=\\sqrt[n]{x^{m}}=\\left(\\sqrt[n]{x}\\right)^{m}') + '.',
    'A negative exponent puts the power in the denominator: ' + t('x^{-\\frac{m}{n}}=\\frac{1}{\\sqrt[n]{x^{m}}}') + '.'];
  /* power box + radical box (from Lesson 5) */
  function twoForms(prompt, A, o) {
    var powT = posTex(A), rT = radTex(A), vars = lettersOf(A);
    var pd = o.pd || known([], powT), rd = o.rd || known([], rT);
    var fields = [{ name: 'Power', label: 'Power:', mode: 'math', keys: 'expo', vars: vars }, { name: 'Radical form', label: 'Radical form:', mode: 'math', keys: 'expo', vars: vars }];
    var p = P.fields(prompt, fields, [EX(powT, { form: 'power', diag: pd }), EX(rT, { form: 'radical', diag: rd })], [powT, rT],
      t(powT) + ' ' + '\\(=\\)' + ' ' + t(rT), o.sol, o.hints || HINT_TWO, o.text);
    p.bad = pd.texs.map(function (x) { return [x, rT]; }).concat(rd.texs.map(function (x) { return [powT, x]; }));
    return p;
  }
  var HINT_TWO = ['Use the exponent law first, working with the fractions exactly. Then convert: in ' + t('x^{\\frac{m}{n}}') + ' the denominator ' + t('n') + ' is the index and ' + t('m') + ' is the power.',
    'If the exponent comes out negative, write the power in the denominator: ' + t('x^{-\\frac{m}{n}}=\\frac{1}{x^{\\frac{m}{n}}}') + '.'];
  var LAWS = 'Product law: add the exponents. Quotient law: subtract. Power of a power: multiply.';

  /* a single power of base B (a number) with an integer exponent equal to B^e; cands [[e, code, hint]] */
  function powOfChk(B, e, cands) {
    return function (resp) {
      var a = K.read(resp); if (a.res) return a.res;
      if (varsOf(a.ast).length) return wrong('var', 'Use numbers only.');
      var top = strip(a.ast), base = top && top.t === 'pow' ? ex.rat(strip(top.a)) : null, er = top && top.t === 'pow' ? ex.rat(top.b) : null;
      var val = Math.pow(B, e);
      if (base && er && base[1] === 1 && base[0] === B && er[1] === 1) {
        if (er[0] === e) return ok();
        for (var i = 0; i < cands.length; i++) if (cands[i][0] === er[0]) return wrong(cands[i][1], cands[i][2]);
        return wrong('exp', 'Check the exponent on ' + t(B) + '.');
      }
      if (near(a.val, val)) return form('single-power', 'Right value — now write it as a single power of ' + t(B) + ', like ' + t(B + '^{n}') + '.');
      for (var j = 0; j < cands.length; j++) if (near(a.val, Math.pow(B, cands[j][0]))) return wrong(cands[j][1], cands[j][2]);
      return wrong('value', null);
    };
  }

  /* ====================================================================================
   * Part 1 — exponent laws with integer exponents
   * ==================================================================================== */
  /* Q1: one law per part; the versions shuffle which law is in which part */
  function q1Part(r, kind, v) {
    var A, Bm, tg, prompt, sol, kn;
    if (kind === 'prod') {
      var m = r.int(3, 8), n = r.int(2, 8); if (n === m) n = m === 8 ? 7 : m + 1;
      tg = pw(v, m + n); prompt = pw(v, m) + '\\cdot ' + pw(v, n);
      kn = known([[pw(v, m * n), 'mult-exp', 'Multiplying powers of the same base: <b>add</b> the exponents (product law), don’t multiply them.']], tg);
      sol = 'Product law (same base, add the exponents): ' + t(prompt + '=' + v + '^{' + m + '+' + n + '}=' + tg);
      return XP(t(prompt), tg, {}, sol, ['Same base, multiplying: keep the base and <b>add</b> the exponents.'], 'product law ' + prompt, kn);
    }
    if (kind === 'quot') {
      var a = r.int(9, 15), b = r.int(3, 7); if (a - b < 3) a = b + 3 + r.int(0, 4);
      tg = pw(v, a - b); prompt = '\\dfrac{' + pw(v, a) + '}{' + pw(v, b) + '}';
      kn = known([[pw(v, a + b), 'law-added', 'Dividing powers of the same base: <b>subtract</b> the exponents (quotient law).'], a % b === 0 ? [pw(v, a / b), 'div-exp', 'Subtract the exponents — don’t divide them.'] : null], tg);
      sol = 'Quotient law (same base, subtract the exponents): ' + t(prompt + '=' + v + '^{' + a + '-' + b + '}=' + tg);
      return XP(t(prompt), tg, {}, sol, ['Same base, dividing: keep the base and <b>subtract</b> the exponents.'], 'quotient law ' + prompt, kn);
    }
    if (kind === 'pow') {
      var p = r.int(3, 6), q = r.int(2, 4);
      tg = pw(v, p * q); prompt = br(pw(v, p)) + '^{' + q + '}';
      kn = known([[pw(v, p + q), 'add-exp', 'A power of a power: <b>multiply</b> the exponents. ' + t(br(pw(v, p)) + '^{' + q + '}') + ' means ' + q + ' factors of ' + t(pw(v, p)) + '.']], tg);
      sol = 'Power of a power (multiply the exponents): ' + t(prompt + '=' + v + '^{' + p + '\\times ' + q + '}=' + tg);
      return XP(t(prompt), tg, {}, sol, ['A power raised to a power: keep the base and <b>multiply</b> the exponents.'], 'power of a power ' + prompt, kn);
    }
    var kn2 = r.pick([[2, 3], [2, 4], [2, 5], [3, 2], [3, 3], [3, 4], [4, 2], [4, 3], [5, 2], [5, 3], [6, 2], [10, 3]]), k = kn2[0], e = kn2[1], K2 = Math.pow(k, e);
    tg = K2 + pw(v, e); prompt = '(' + k + v + ')^{' + e + '}';
    kn = known([[k + pw(v, e), 'coef-not-raised', 'The power of a product applies to <b>every</b> factor in the bracket: the ' + t(k) + ' is raised to the power ' + t(e) + ' too.'], [k * e + pw(v, e), 'coef-times', t(k + '^{' + e + '}') + ' means ' + e + ' factors of ' + t(k) + ', not ' + t(k + '\\times ' + e) + '.']], tg);
    sol = 'Power of a product (every factor gets the exponent): ' + t(prompt + '=' + k + '^{' + e + '}' + pw(v, e) + '=' + tg);
    return XP(t(prompt), tg, {}, sol, ['Raise <b>each</b> factor inside the bracket to the power ' + t(e) + ', the number too.'], 'power of a product ' + prompt, kn);
  }

  /* integer value answers with known wrong values */
  function INT(prompt, T0, cands, sol, hints, text) {
    var kn = numKnown(cands, T0);
    var p = P.math(prompt, K.value(T0, { only: 'integer', diag: kn }), String(T0), sol, hints, text, { keys: 'fraction' });
    p.answer = t(F(T0)); p.bad = kn.list.map(function (c) { return String(c[0]); });
    return p;
  }
  var Q2PAIRS = [[2, 2], [2, 4], [2, 6], [2, 8], [3, 2], [3, 4], [3, 6], [4, 2], [4, 4], [5, 2], [5, 4], [6, 2], [7, 2], [8, 2], [9, 2], [10, 2], [10, 4]];
  function q2Pair(s, which) {
    var b = s.b, n = s.n, V = Math.pow(b, n);
    if (which === 'minus') {
      var pr = '-' + b + '^{' + n + '}';
      return INT(t(pr), -V, [[V, 'neg-base', 'Without brackets the exponent applies only to ' + t(b) + ': ' + t(pr + '=-\\left(' + b + '^{' + n + '}\\right)') + '. The minus sign is not part of the base.'], [-b * n, 'u2t-times-exp', t(b + '^{' + n + '}') + ' means ' + n + ' factors of ' + t(b) + ', not ' + t(b + '\\times ' + n) + '.'], [b * n, 'u2t-times-exp', t(b + '^{' + n + '}') + ' means ' + n + ' factors of ' + t(b) + '.']],
        'The exponent belongs to ' + t(b) + ' only; the minus sign is applied after: ' + t(pr + '=-\\left(' + b + '^{' + n + '}\\right)=-' + F(V)) + '.', ['Is the minus sign inside the base? Without brackets, it isn’t.'], 'evaluate ' + pr);
    }
    var pb = '(-' + b + ')^{' + n + '}';
    return INT(t(pb), V, [[-V, 'even-neg', 'The brackets make ' + t('-' + b) + ' the base: ' + n + ' negative factors multiply to a <b>positive</b>.'], [-b * n, 'u2t-times-exp', 'The exponent says how many factors of ' + t('-' + b) + ' to multiply.']],
      'The brackets make ' + t('-' + b) + ' the base. ' + t(n) + ' is even, so the product is positive: ' + t(pb + '=' + b + '^{' + n + '}=' + F(V)) + '.', ['With brackets, the base is ' + t('-' + b) + '. An even number of negative factors is positive.'], 'evaluate ' + pb);
  }
  var Q2D = [[2, 2, 2], [2, 2, 3], [2, 3, 2], [2, 4, 2], [2, 2, 4], [2, 3, 3], [2, 5, 2], [2, 2, 5], [3, 2, 2], [3, 3, 2], [3, 2, 3], [4, 2, 2], [5, 2, 2], [10, 2, 2], [10, 2, 3], [10, 3, 2], [10, 2, 4], [10, 4, 2], [10, 3, 3], [10, 5, 2], [6, 1, 2], [7, 1, 2]];
  /* monomial helpers for prompts */
  function term(c, list) { return (c === 1 ? '' : c === -1 ? '-' : String(c)) + list.map(function (p) { return pw(p[0], p[1]); }).join(''); }

  /* Q4a: (−k u^p v^q)^3 (m u^r v^s) */
  function q4a(r) {
    var L = r.pick(PAIRS), u = L[0], v = L[1], k = r.pick([2, 3]), n = 3, m = r.int(2, 5), p = r.int(2, 4), q = r.int(1, 2), ru = r.int(1, 2), s = r.int(1, 4);
    var inner = M(-k, [[u, p], [v, q]]), out = M(m, [[u, ru], [v, s]]), Pw = mpow(inner, n), A = mmul(Pw, out), tg = posTex(A);
    var prompt = br(term(-k, [[u, p], [v, q]])) + '^{' + n + '}' + br(term(m, [[u, ru], [v, s]]));
    var cc = Q(A.c)[0];
    var kn = kmono([[M(-cc, A.v), 'sign', 'Check the sign: three negative factors of ' + t('-' + k) + ' multiply to a <b>negative</b>.'],
      [M(-k * m, A.v), 'coef-not-raised', 'The power applies to the number in the bracket too: ' + t('(-' + k + ')^{3}=' + (-Math.pow(k, 3))) + '.'],
      [M(-3 * k * m, A.v), 'coef-times', t('(-' + k + ')^{3}') + ' means ' + t('(-' + k + ')(-' + k + ')(-' + k + ')') + ', not ' + t('-' + k + '\\times 3') + '.'],
      [M(cc, [[u, p + n + ru], [v, q + n + s]]), 'add-exp', 'A power of a power: <b>multiply</b> the exponents inside the bracket by ' + t(n) + '.'],
      [M(cc, [[u, p * n * ru], [v, q * n * s]]), 'mult-exp', 'Multiplying the two terms: <b>add</b> the exponents of each base, don’t multiply them.'],
      [M(cc, [[u, p * n + ru], [v, q + s]]), 'missed-factor', 'The outside exponent applies to <b>every</b> factor in the bracket, ' + t(v) + ' too.']], tg);
    var sol = 'Power of a product first: ' + t(br(term(-k, [[u, p], [v, q]])) + '^{3}=' + rawTex(Pw)) + '.<br>Then the product law (multiply the numbers, add the exponents):<br>' + t(br(rawTex(Pw)) + br(term(m, [[u, ru], [v, s]])) + '=' + tg);
    return XP(t(prompt), tg, {}, sol, ['Do the power first: raise every factor in the bracket to the power ' + t(3) + ', the ' + t('-' + k) + ' too.', 'Then multiply the numbers and add the exponents of each letter.'], 'simplify ' + prompt, kn);
  }
  /* Q4b: (k u^p v^q)^n / (m u^a v^b) */
  function q4b(r) {
    var L = r.pick(PAIRS), u = L[0], v = L[1];
    var g = find(function () {
      var kk = r.pick([[2, 2], [2, 3], [2, 4], [3, 2], [3, 3], [4, 2], [5, 2], [6, 2]]), k = kk[0], n = kk[1], KN = Math.pow(k, n), c = r.pick([2, 3, 4]);
      var p = r.int(1, 4), q = r.int(1, 3), a = r.int(1, p * n - 1), b = r.int(1, q * n - 1);
      return { k: k, n: n, KN: KN, c: c, m: KN / c, p: p, q: q, a: a, b: b };
    }, function (g) { return g.m % 1 === 0 && g.m > 1 && g.p * g.n > 1 && g.q * g.n > 1 && g.p * g.n - g.a >= 1 && g.q * g.n - g.b >= 1 && !(g.p === 1 && g.q === 1); });
    var inner = M(g.k, [[u, g.p], [v, g.q]]), Pw = mpow(inner, g.n), den = M(g.m, [[u, g.a], [v, g.b]]), A = mdiv(Pw, den), tg = posTex(A);
    var prompt = '\\dfrac{' + br(term(g.k, [[u, g.p], [v, g.q]])) + '^{' + g.n + '}}{' + term(g.m, [[u, g.a], [v, g.b]]) + '}';
    var kn = kmono([[M(qdiv(g.k, g.m), A.v), 'coef-not-raised', 'Raise the ' + t(g.k) + ' to the power ' + t(g.n) + ' too: ' + t(g.k + '^{' + g.n + '}=' + g.KN) + '.'],
      [M(qdiv(g.k * g.n, g.m), A.v), 'coef-times', t(g.k + '^{' + g.n + '}') + ' is ' + t(g.KN) + ', not ' + t(g.k + '\\times ' + g.n) + '.'],
      [M(g.c, [[u, g.p + g.n - g.a], [v, g.q + g.n - g.b]]), 'add-exp', 'A power of a power: <b>multiply</b> the exponents by ' + t(g.n) + ', don’t add.'],
      [M(g.c, [[u, g.p * g.n + g.a], [v, g.q * g.n + g.b]]), 'law-added', 'Dividing: <b>subtract</b> the exponents of the denominator.'],
      [M(g.KN - g.m, A.v), 'sub-coef', 'Divide the numbers, don’t subtract them: ' + t(g.KN + '\\div ' + g.m) + '.']], tg);
    var sol = 'Power of a product first: ' + t(br(term(g.k, [[u, g.p], [v, g.q]])) + '^{' + g.n + '}=' + rawTex(Pw)) + '.<br>Then the quotient law (divide the numbers, subtract the exponents):<br>' + t('\\dfrac{' + rawTex(Pw) + '}{' + term(g.m, [[u, g.a], [v, g.b]]) + '}=' + tg);
    return XP(t(prompt), tg, {}, sol, ['Simplify the power in the numerator first: every factor gets the exponent ' + t(g.n) + '.', 'Then divide the numbers and subtract the exponents.'], 'simplify ' + prompt, kn);
  }
  /* Q4c: ((k1 w^p · k2 w^q)/(k3 w^s))^2 */
  function q4c(r) {
    var w = r.pick(LET);
    var g = find(function () { var c = r.int(2, 6), k3 = r.int(2, 6), k1 = r.int(2, 10), p = r.int(2, 7), q = r.int(2, 6); return { c: c, k3: k3, k1: k1, k2: c * k3 / k1, p: p, q: q, s: r.int(1, p + q - 2) }; },
      function (g) { return g.k2 % 1 === 0 && g.k2 >= 2 && g.k2 <= 10 && g.k1 !== g.k3 && g.p + g.q - g.s >= 2; });
    var e = g.p + g.q - g.s, Ain = M(g.c, [[w, e]]), A = mpow(Ain, 2), tg = posTex(A);
    var prompt = br('\\dfrac{' + g.k1 + pw(w, g.p) + '\\cdot ' + g.k2 + pw(w, g.q) + '}{' + g.k3 + pw(w, g.s) + '}') + '^{2}';
    var kn = kmono([[M(g.c * g.c, [[w, e + 2]]), 'add-exp', 'A power of a power: <b>multiply</b> the exponent by ' + t(2) + '.'], [M(2 * g.c, [[w, 2 * e]]), 'coef-times', t(g.c + '^{2}') + ' is ' + t(g.c * g.c) + ', not ' + t(g.c + '\\times 2') + '.'],
      [M(g.c, [[w, 2 * e]]), 'coef-not-raised', 'Square the number too: ' + t(br(g.c + pw(w, e)) + '^{2}=' + g.c + '^{2}' + pw(w, 2 * e)) + '.'], g.p * g.q - g.s > 0 ? [M(g.c * g.c, [[w, 2 * (g.p * g.q - g.s)]]), 'mult-exp', 'Inside the bracket, multiplying: <b>add</b> the exponents.'] : null], tg);
    var sol = 'Simplify inside the bracket first: ' + t('\\dfrac{' + g.k1 + pw(w, g.p) + '\\cdot ' + g.k2 + pw(w, g.q) + '}{' + g.k3 + pw(w, g.s) + '}=\\dfrac{' + g.k1 * g.k2 + pw(w, g.p + g.q) + '}{' + g.k3 + pw(w, g.s) + '}=' + rawTex(Ain)) + '.<br>Then square it: ' + t(br(rawTex(Ain)) + '^{2}=' + tg) + '.';
    return XP(t(prompt), tg, {}, sol, ['Work inside the bracket first: multiply, then divide.', 'Then raise every factor of the result to the power ' + t(2) + '.'], 'simplify ' + prompt, kn);
  }
  /* Q5: simplify, then evaluate */
  function q5Minus(r) {
    var g = find(function () { var b = r.int(2, 5), e = r.int(1, 2), m = r.int(3, 7), n = r.int(2, 4); return { b: b, e: e, m: m, n: n, k: m + n - e }; }, function (g) { return Math.pow(g.b, g.e) <= 25 && g.k >= 2 && g.k !== g.m; });
    var b = g.b, V = -Math.pow(b, g.e), prompt = '\\dfrac{-' + b + '^{' + g.m + '}\\times ' + b + '^{' + g.n + '}}{' + b + '^{' + g.k + '}}';
    return INT(t(prompt), V, [[-V, 'neg-base', 'The minus sign is not part of the base: ' + t('-' + b + '^{' + g.m + '}=-\\left(' + b + '^{' + g.m + '}\\right)') + ', so it stays in the answer.'],
      [-Math.pow(b, g.m * g.n - g.k), 'mult-exp', 'Multiplying powers: <b>add</b> the exponents.'], [-Math.pow(b, g.m + g.n + g.k) > -1e9 ? -Math.pow(b, g.m + g.n + g.k) : NaN, 'law-added', 'Dividing: <b>subtract</b> the exponent of the denominator.'], [-b * g.e, 'u2t-times-exp', t(b + '^{' + g.e + '}') + ' is not ' + t(b + '\\times ' + g.e) + '.']],
      'The minus sign is not part of the base; it stays in front:<br>' + t(prompt + '=-\\dfrac{' + b + '^{' + (g.m + g.n) + '}}{' + b + '^{' + g.k + '}}=-' + b + '^{' + (g.m + g.n) + '-' + g.k + '}=' + (g.e === 1 ? '-' + b : '-' + b + '^{' + g.e + '}=' + V)) + '.',
      ['Treat the minus sign separately: the base is ' + t(b) + ', not ' + t('-' + b) + '.', 'Add the exponents on top, then subtract the exponent below.'], 'simplify and evaluate ' + prompt);
  }
  function q5Brk(r) {
    var g = find(function () { var c = r.pick([2, 3]), e = r.int(2, 5), n = r.int(2, 4), k = r.int(2, 4); return { c: c, e: e, n: n, k: k, m: e + n + k }; }, function (g) { return Math.pow(g.c, g.e) <= 81 && g.m <= 12; });
    var c = g.c, B = '(-' + c + ')', V = Math.pow(-c, g.e), prompt = '\\dfrac{' + B + '^{' + g.m + '}}{' + B + '^{' + g.n + '}\\cdot ' + B + '^{' + g.k + '}}';
    return INT(t(prompt), V, [[-V, g.e % 2 ? 'odd-neg' : 'even-neg', 'The base is ' + t('-' + c) + ': ' + (g.e % 2 ? 'an odd' : 'an even') + ' number of negative factors is ' + (g.e % 2 ? '<b>negative</b>' : '<b>positive</b>') + '.'],
      [Math.pow(-c, g.m - g.n + g.k), 'minus-dist', 'Subtract the <b>whole</b> exponent of the denominator: ' + t(g.n + '+' + g.k + '=' + (g.n + g.k)) + '.'], [Math.pow(-c, g.m - g.n * g.k), 'mult-exp', 'In the denominator the powers multiply, so <b>add</b> their exponents.']],
      'Same base ' + t('-' + c) + ': add the exponents in the denominator, then subtract.<br>' + t(prompt + '=\\dfrac{' + B + '^{' + g.m + '}}{' + B + '^{' + (g.n + g.k) + '}}=' + B + '^{' + g.e + '}=' + V) + '.',
      ['The base is ' + t('-' + c) + ' (in brackets). Add the exponents in the denominator first.', 'Then decide the sign: is the final exponent even or odd?'], 'simplify and evaluate ' + prompt);
  }
  /* Q6: Alex's errors */
  function q6Shared(r) {
    var L = r.pick([['x', 'y'], ['m', 'n'], ['p', 'q'], ['a', 'b'], ['c', 'd']]), who = r.pick(['Alex', 'Jordan', 'Priya', 'Sam', 'Kai', 'Noah']);
    return find(function () { var kn = r.pick([[2, 3], [2, 4], [3, 2], [3, 3], [4, 2], [5, 2]]); return { who: who, u: L[0], v: L[1], k: kn[0], n: kn[1], p: r.int(2, 4), q: r.int(1, 3), m: r.int(2, 5), s: r.int(2, 4) }; },
      function (g) { return g.q * g.n * g.s !== g.q * g.n + g.s && g.m !== g.k; });
  }
  function q6Lines(g) {
    var u = g.u, v = g.v, a = br(g.k + pw(u, g.p) + pw(v, g.q)) + '^{' + g.n + '}\\cdot ' + g.m + u + pw(v, g.s);
    return { orig: a, l1: g.k + pw(u, g.p * g.n) + pw(v, g.q * g.n) + '\\cdot ' + g.m + u + pw(v, g.s), l2: g.k * g.m + pw(u, g.p * g.n) + pw(v, g.q * g.n * g.s),
      right: M(Math.pow(g.k, g.n) * g.m, [[u, g.p * g.n + 1], [v, g.q * g.n + g.s]]) };
  }
  /* Q8: two contexts */
  var Q8CTX = [
    { b: 2, sec: [4, 8], a: function (T, E) { return 'A hard drive holds ' + t('2^{' + T + '}') + ' bytes. Each video is ' + t('2^{' + E + '}') + ' bytes.'; }, qa: 'How many videos fit on the drive?', ua: 'videos',
      b2: function (B2, k) { return 'A second drive holds ' + t(B2 + '^{' + k + '}') + ' bytes. How many times as much as the first drive is that?'; } },
    { b: 3, sec: [9], a: function (T, E) { return 'A lab sample holds ' + t('3^{' + T + '}') + ' bacteria. It is split equally into ' + t('3^{' + E + '}') + ' dishes.'; }, qa: 'How many bacteria go in each dish?', ua: 'bacteria',
      b2: function (B2, k) { return 'A second sample holds ' + t(B2 + '^{' + k + '}') + ' bacteria. How many times as many as the first sample is that?'; } },
    { b: 5, sec: [25], a: function (T, E) { return 'A seed company has ' + t('5^{' + T + '}') + ' seeds. It packs them in bags of ' + t('5^{' + E + '}') + ' seeds.'; }, qa: 'How many bags does it fill?', ua: 'bags',
      b2: function (B2, k) { return 'A second company has ' + t(B2 + '^{' + k + '}') + ' seeds. How many times as many as the first company is that?'; } }];
  function q8Shared(r) {
    var c = r.pick(Q8CTX), b = c.b;
    return find(function () {
      var T = b === 2 ? r.int(28, 40) : b === 3 ? r.int(10, 14) : r.int(8, 12), d = b === 2 ? r.int(5, 8) : b === 3 ? r.int(3, 7) : r.int(2, 4);
      var B2 = r.pick(c.sec), j = Math.round(Math.log(B2) / Math.log(b)), f = b === 2 ? r.int(2, 5) : b === 3 ? r.int(2, 4) : r.int(1, 3);
      return { c: c, b: b, T: T, E: T - d, d: d, B2: B2, j: j, f: f, k: (T + f) / j };
    }, function (g) { return g.k % 1 === 0; });
  }

  /* ====================================================================================
   * Part 2 — zero and negative exponents
   * ==================================================================================== */
  function q10d(r) {
    var L = r.pick(PAIRS), a = L[0], b = L[1], p = r.int(2, 6), q = r.int(2, 6), kind = r.pick(['nd', 'nn', 'dd']), prompt, A;
    if (kind === 'nd') { prompt = '\\dfrac{' + pwx(a, -p) + '}{' + pw(b, q) + '}'; A = M(1, [[a, -p], [b, -q]]); }
    else if (kind === 'nn') { prompt = '\\dfrac{' + pw(a, p) + '}{' + pwx(b, -q) + '}'; A = M(1, [[a, p], [b, q]]); }
    else { prompt = '\\dfrac{' + pwx(a, -p) + '}{' + pwx(b, -q) + '}'; A = M(1, [[b, q], [a, -p]]); }
    var tg = posTex(A);
    var kn = known([kind === 'nd' ? ['\\frac{' + pw(a, p) + '}{' + pw(b, q) + '}', 'no-recip', 'A negative exponent means <b>reciprocal</b>: ' + t(pwx(a, -p) + '=\\frac{1}{' + pw(a, p) + '}') + ', so ' + t(pw(a, p)) + ' moves to the denominator.'] : null,
      kind === 'nn' ? ['\\frac{' + pw(a, p) + '}{' + pw(b, q) + '}', 'no-recip', 'A power with a negative exponent in the denominator moves up to the numerator: ' + t('\\frac{1}{' + pwx(b, -q) + '}=' + pw(b, q)) + '.'] : null,
      kind === 'dd' ? ['\\frac{' + pw(a, p) + '}{' + pw(b, q) + '}', 'no-recip', 'Both powers have negative exponents, so <b>both</b> move across the fraction bar.'] : null], tg);
    return XP(t(prompt), tg, {}, 'Each power with a negative exponent moves to the other side of the fraction bar and its exponent becomes positive:<br>' + t(prompt + '=' + tg),
      ['A power with a negative exponent changes sides of the fraction bar (and its exponent becomes positive).', 'A power with a positive exponent stays where it is.'], 'positive exponents ' + prompt, kn);
  }
  /* Q12: four types, shuffled across a–d */
  function q12Part(r, kind, L) {
    var u = L[0], v = L[1], A, tg, prompt, sol, kn, hints;
    if (kind === 'quot') {
      var g = find(function () { var B = r.int(2, 6), c = r.int(2, 4); return { B: B, c: c, A: B * c, p1: -r.int(1, 5), p2: r.int(1, 4), q1: r.int(2, 5), q2: -r.int(1, 3), sw: r.chance(0.5) }; }, function () { return true; });
      var e1 = g.sw ? [[u, g.q1], [v, g.p1]] : [[u, g.p1], [v, g.q1]], e2 = g.sw ? [[u, g.q2], [v, g.p2]] : [[u, g.p2], [v, g.q2]];
      var N = M(g.A, e1), D = M(g.B, e2); A = mdiv(N, D); tg = posTex(A);
      prompt = '\\dfrac{' + g.A + e1.map(function (p) { return pw(p[0], p[1]); }).join('') + '}{' + g.B + e2.map(function (p) { return pw(p[0], p[1]); }).join('') + '}';
      var bad1 = M(g.c, e1.map(function (p, i) { return [p[0], p[1] + e2[i][1]]; })), bad2 = M(g.c, e1.map(function (p, i) { return [p[0], p[1] - Math.abs(e2[i][1])]; }));
      kn = kmono([[bad1, 'law-added', 'Dividing: <b>subtract</b> the exponents of the denominator.'], [bad2, 'sign-exp', 'Careful with signs: subtracting a negative exponent <b>adds</b> it, e.g. ' + t('4-(-1)=5') + '.'], [M(g.A - g.B, A.v), 'sub-coef', 'Divide the numbers, don’t subtract them.']], tg);
      sol = 'Quotient law (divide the numbers, subtract the exponents):<br>' + t(prompt + '=' + g.c + e1.map(function (p, i) { return p[0] + '^{' + p[1] + '-' + pT(e2[i][1]) + '}'; }).join('') + '=' + rawTex(A) + '=' + tg);
      hints = ['Divide the numbers, then subtract each exponent: top minus bottom.', 'Subtracting a negative exponent adds it. Finish with positive exponents.'];
    } else if (kind === 'powneg') {
      var k = r.int(2, 5), p = r.int(1, 4), q = r.int(1, 4), sw = r.chance(0.5), ex1 = sw ? [[u, p], [v, -q]] : [[u, -p], [v, q]];
      var inner = M(-k, ex1); A = mpow(inner, -2); tg = posTex(A);
      prompt = br('-' + k + ex1.map(function (pp) { return pp[1] < 0 ? pwx(pp[0], pp[1]) : pw(pp[0], pp[1]); }).join('')) + '^{-2}';
      kn = kmono([[M(k * k, A.v), 'coef-pos-power', t('(-' + k + ')^{-2}=\\frac{1}{(-' + k + ')^{2}}=\\frac{1}{' + k * k + '}') + ': the ' + t(k * k) + ' goes in the <b>denominator</b>.'],
        [M([-1, k * k], A.v), 'even-neg', t('(-' + k + ')^{-2}=\\frac{1}{(-' + k + ')^{2}}') + ', and an even power of a negative is <b>positive</b>.'],
        [M([1, 2 * k], A.v), 'coef-times', t('(-' + k + ')^{-2}') + ' is ' + t('\\frac{1}{' + k * k + '}') + ', not ' + t('-' + k + '\\times(-2)') + '.'],
        [M(1, A.v), 'coef-not-raised', 'The exponent applies to the number in the bracket too.']], tg);
      sol = 'Power of a product: every factor gets the exponent ' + t(-2) + ':<br>' + t(prompt + '=(-' + k + ')^{-2}' + ex1.map(function (pp) { return pp[0] + '^{' + pp[1] + '\\times(-2)}'; }).join('') + '=\\frac{1}{' + k * k + '}' + A.v.map(function (pp) { return pw(pp[0], pp[1]); }).join('') + '=' + tg);
      hints = ['Raise every factor in the bracket to the power ' + t(-2) + ': multiply each exponent by ' + t(-2) + '.', t('(-' + k + ')^{-2}=\\frac{1}{(-' + k + ')^{2}}') + '. Finish with positive exponents.'];
    } else if (kind === 'powprod') {
      var g2 = find(function () { var kk = r.pick([[2, 2], [2, 3], [3, 2], [3, 3], [4, 2], [5, 2]]); var pp = -r.int(1, 3), qq = r.int(1, 2), e1v = -r.int(1, 5), e2v = -r.int(1, 3); return { k: kk[0], n: kk[1], p: pp, q: qq, ru: e1v - kk[1] * pp, rv: e2v - kk[1] * qq }; },
        function (g) { return g.ru !== 0 && g.rv !== 0 && Math.abs(g.ru) <= 7 && Math.abs(g.rv) <= 7 && g.ru !== g.p; });
      var inner2 = M(g2.k, [[u, g2.p], [v, g2.q]]), P2 = mpow(inner2, g2.n), other = M(1, [[u, g2.ru], [v, g2.rv]]); A = mmul(P2, other); tg = posTex(A);
      var ot = [[u, g2.ru], [v, g2.rv]].map(function (pp) { return pp[1] < 0 ? pwx(pp[0], pp[1]) : pw(pp[0], pp[1]); }).join('');
      prompt = br(g2.k + pwx(u, g2.p) + pw(v, g2.q)) + '^{' + g2.n + '}' + br(ot);
      kn = kmono([[M(g2.k, A.v), 'coef-not-raised', 'Raise the number in the bracket to the power too: ' + t(g2.k + '^{' + g2.n + '}=' + Math.pow(g2.k, g2.n)) + '.'],
        [M(Math.pow(g2.k, g2.n), [[u, g2.p + g2.n + g2.ru], [v, g2.q + g2.n + g2.rv]]), 'add-exp', 'Power of a power: <b>multiply</b> the exponents in the bracket by ' + t(g2.n) + '.'],
        [M(Math.pow(g2.k, g2.n), [[u, g2.p * g2.n * g2.ru], [v, g2.q * g2.n * g2.rv]]), 'mult-exp', 'Multiplying the two factors: <b>add</b> the exponents.']], tg);
      sol = 'Power first: ' + t(br(g2.k + pwx(u, g2.p) + pw(v, g2.q)) + '^{' + g2.n + '}=' + rawTex(P2)) + '.<br>Then the product law: ' + t(rawTex(P2) + '\\cdot ' + ot + '=' + rawTex(A) + '=' + tg);
      hints = ['Do the power first: multiply each exponent in the bracket by ' + t(g2.n) + ' and raise the number too.', 'Then add the exponents of each letter, and finish with positive exponents.'];
    } else {
      var g3 = find(function () { var kk = r.pick([[2, 2], [2, 3], [2, 4], [3, 2], [3, 3], [4, 2], [5, 2]]); return { k: kk[0], n: kk[1], a: r.int(1, 3), b: r.int(2, 4) }; }, function () { return true; });
      var inner3 = mdiv(M(g3.k, [[u, -g3.a]]), M(1, [[v, g3.b]])); A = mpow(inner3, -g3.n); tg = posTex(A);
      prompt = br('\\dfrac{' + g3.k + pwx(u, -g3.a) + '}{' + pw(v, g3.b) + '}') + '^{-' + g3.n + '}';
      var KN = Math.pow(g3.k, g3.n);
      kn = kmono([[M(KN, A.v), 'coef-pos-power', 'The number ' + t(g3.k) + ' is raised to ' + t(-g3.n) + ' too: ' + t(g3.k + '^{-' + g3.n + '}=\\frac{1}{' + KN + '}') + '.'],
        [minv(A), 'no-flip', 'A negative exponent on a fraction <b>flips</b> it: ' + t('\\left(\\frac{a}{b}\\right)^{-n}=\\left(\\frac{b}{a}\\right)^{n}') + '.'],
        [M([1, g3.k], A.v), 'coef-not-raised', 'Raise the number to the power too: ' + t(g3.k + '^{' + g3.n + '}=' + KN) + '.']], tg);
      sol = 'Flip the fraction to make the outside exponent positive, then raise every factor:<br>' + t(prompt + '=' + br('\\dfrac{' + pw(v, g3.b) + '}{' + g3.k + pwx(u, -g3.a) + '}') + '^{' + g3.n + '}=' + br('\\dfrac{' + pw(u, g3.a) + pw(v, g3.b) + '}{' + g3.k + '}') + '^{' + g3.n + '}=' + tg);
      hints = ['A negative exponent on a fraction flips it: ' + t('\\left(\\frac{a}{b}\\right)^{-n}=\\left(\\frac{b}{a}\\right)^{n}') + '.', 'Then raise every factor to the power, the number too.'];
    }
    return XP(t(prompt), tg, {}, sol, hints, 'simplify ' + prompt, kn);
  }
  /* Q14: true or false — type the left side, then decide */
  function q14Claim(r, kind, truth) {
    var c = {};
    if (kind === 'coef') {
      var x = r.pick(['x', 'a', 'k', 'm', 'y', 'n']), k = r.int(2, 7), n = r.int(2, 3);
      c.lhs = k + pwx(x, -n); c.val = M(k, [[x, -n]]); c.vars = [x];
      c.rhs = truth ? '\\dfrac{' + k + '}{' + pw(x, n) + '}' : '\\dfrac{1}{' + Math.pow(k, n) + pw(x, n) + '}';
      c.why = 'Only ' + t(x) + ' is raised to ' + t(-n) + '; the ' + t(k) + ' stays in the numerator: ' + t(c.lhs + '=\\dfrac{' + k + '}{' + pw(x, n) + '}') + '.';
      c.cands = [[M([1, Math.pow(k, n)], [[x, -n]]), 'coef-side', 'The exponent ' + t(-n) + ' belongs to ' + t(x) + ' only: the ' + t(k) + ' is not raised to it and stays in the numerator.'], [M([1, k], [[x, -n]]), 'coef-side', 'The ' + t(k) + ' has no negative exponent, so it stays in the numerator.'], [M(k, [[x, n]]), 'no-recip', 'A negative exponent means reciprocal: ' + t(pwx(x, -n) + '=\\frac{1}{' + pw(x, n) + '}') + '.']];
    } else if (kind === 'even') {
      var b = r.int(2, 9); c.lhs = '(-' + b + ')^{-2}'; c.val = Q(1, b * b);
      c.rhs = truth ? '\\dfrac{1}{' + b * b + '}' : '-\\dfrac{1}{' + b * b + '}';
      c.why = t(c.lhs + '=\\dfrac{1}{(-' + b + ')^{2}}=\\dfrac{1}{' + b * b + '}') + '. A negative exponent means reciprocal, not negative, and the even power makes it positive.';
      c.cands = [[-1 / (b * b), 'even-neg', 'An even power of a negative is positive: ' + t('(-' + b + ')^{2}=' + b * b) + '.'], [b * b, 'no-recip', 'A negative exponent means <b>reciprocal</b>.'], [-b * b, 'u2t-opposite', 'A negative exponent means reciprocal, not negative.']];
    } else if (kind === 'odd') {
      var b2 = r.int(2, 5); c.lhs = '(-' + b2 + ')^{-3}'; c.val = Q(-1, b2 * b2 * b2);
      c.rhs = truth ? '-\\dfrac{1}{' + b2 * b2 * b2 + '}' : '\\dfrac{1}{' + b2 * b2 * b2 + '}';
      c.why = t(c.lhs + '=\\dfrac{1}{(-' + b2 + ')^{3}}=\\dfrac{1}{-' + b2 * b2 * b2 + '}=-\\dfrac{1}{' + b2 * b2 * b2 + '}') + '. The negative base with an odd power gives the sign.';
      c.cands = [[1 / Math.pow(b2, 3), 'odd-neg', 'An odd power of a negative is negative: ' + t('(-' + b2 + ')^{3}=-' + Math.pow(b2, 3)) + '.'], [-Math.pow(b2, 3), 'no-recip', 'A negative exponent means <b>reciprocal</b>.']];
    } else {
      var bm = r.pick([[2, 2], [2, 3], [2, 4], [2, 5], [3, 2], [3, 3], [3, 4], [4, 2], [4, 3], [5, 2], [5, 3], [6, 2], [10, 2], [10, 3]]), b3 = bm[0], n3 = bm[1], V = Math.pow(b3, n3);
      c.lhs = '-' + b3 + '^{-' + n3 + '}'; c.val = Q(-1, V);
      c.rhs = truth ? '-\\dfrac{1}{' + V + '}' : '\\dfrac{1}{' + V + '}';
      c.why = 'Only ' + t(b3) + ' is the base: ' + t(c.lhs + '=-\\left(\\dfrac{1}{' + b3 + '^{' + n3 + '}}\\right)=-\\dfrac{1}{' + V + '}') + '.';
      c.cands = [[1 / V, 'neg-base', 'The minus sign is not part of the base: ' + t(c.lhs + '=-\\left(' + b3 + '^{-' + n3 + '}\\right)') + '.'], [-V, 'no-recip', 'A negative exponent means <b>reciprocal</b>.'], [V, 'no-recip', 'A negative exponent means reciprocal, and the minus sign in front stays.']];
    }
    c.truth = truth; c.kind = kind;
    return c;
  }
  function q14Part(c) {
    var leftChk, leftKey, bad = [];
    if (c.kind === 'coef') {
      var tg = posTex(c.val), kn = kmono(c.cands, tg);
      leftChk = EX(tg, { diag: kn }); leftKey = tg; bad = kn.texs;
    } else {
      var fr = c.val, kn2 = numKnown(c.cands, qv(fr));
      leftChk = K.fraction(fr, { diag: kn2 }); leftKey = nT(fr); bad = kn2.list.map(function (x) { return valTex(x[0]); });
    }
    var truthChk = function (resp) {
      var s = String(resp == null ? '' : resp).trim().toLowerCase().replace(/[.!]$/, '');
      if (!s) return form('empty', 'Type <b>true</b> or <b>false</b>.');
      var isT = /^(t|true|yes|y)$/.test(s), isF = /^(f|false|no|n)$/.test(s);
      if (!isT && !isF) return form('u2t-tf-word', 'Type <b>true</b> or <b>false</b>.');
      if (isT === c.truth) return ok();
      return wrong('u2t-tf-verdict', 'Compare your exact value of the left side with the right side of the statement.');
    };
    var claim = t(c.lhs + '=' + c.rhs);
    var p = P.fields('“' + claim + '”<br>Work out the left side exactly (this is your justification), then decide whether the statement is true or false.',
      [{ name: 'Left side', label: t(c.lhs) + ' =', mode: 'math', keys: c.kind === 'coef' ? 'expo' : 'fraction', vars: c.vars }, { name: 'True or false', label: 'The statement is', mode: 'text', placeholder: 'true or false', wide: true }],
      [leftChk, truthChk], [leftKey, c.truth ? 'true' : 'false'], t(c.lhs + '=' + leftKey) + ', so the statement is <b>' + (c.truth ? 'true' : 'false') + '</b>.',
      '<b>' + (c.truth ? 'True.' : 'False.') + '</b> ' + c.why,
      ['A negative exponent means reciprocal: ' + t('a^{-n}=\\frac{1}{a^{n}}') + '. It does not make a number negative.', 'Check what the base is: brackets make the minus sign part of the base; without brackets it isn’t.'], 'true/false ' + c.lhs + '=' + c.rhs);
    p.bad = bad.map(function (b) { return [b, c.truth ? 'true' : 'false']; }).concat([[leftKey, c.truth ? 'false' : 'true']]);
    return p;
  }
  function q14Shared(r) {
    var kinds = r.shuffle(['coef', 'even', r.pick(['odd', 'minus'])]), truths;
    do { truths = kinds.map(function (k) { return k === 'coef' ? r.chance(0.2) : r.chance(0.5); }); } while (truths.every(Boolean) || !truths.some(Boolean));
    return { kinds: kinds, truths: truths };
  }
  /* Q15: Sam's errors */
  function q15Shared(r) {
    var who = r.pick(['Sam', 'Kai', 'Noah', 'Maya', 'Leo', 'Ava']), u = r.pick(['a', 'm', 'x', 'k', 'y', 'n']);
    return find(function () { var kn = r.pick([[2, 2], [2, 3], [3, 2], [4, 2], [5, 2], [2, 4]]); return { who: who, u: u, k: kn[0], n: kn[1], p: r.int(2, 4), q: r.int(2, 5), m: r.int(2, 9) }; },
      function (g) { var pn = g.p * g.n; return pn * g.q !== pn + g.q && g.m % Math.pow(g.k, g.n) !== 0 && g.k * g.n * g.m <= 120; });
  }
  function q15Lines(g) {
    var u = g.u, pn = g.p * g.n, kn = g.k * g.n;
    return { orig: br(g.k + pwx(u, -g.p)) + '^{-' + g.n + '}\\cdot ' + g.m + pw(u, g.q), l1: '-' + kn + pw(u, pn) + '\\cdot ' + g.m + pw(u, g.q), l2: '-' + kn * g.m + pw(u, pn * g.q),
      right: M(Q(g.m, Math.pow(g.k, g.n)), [[u, pn + g.q]]) };
  }
  /* Q16: write every factor as a power of b */
  function q16Shared(r) {
    return find(function () {
      var b = r.pick([2, 3, 5]), ij = r.shuffle([2, 3]), a1 = r.pick([1, 2]), a2 = r.pick([1, 2]), e = r.int(2, b === 2 ? 6 : b === 3 ? 4 : 3);
      return { b: b, i: ij[0], j: ij[1], a1: a1, a2: a2, e: e, v: e + a1 * ij[0] - a2 * ij[1] };
    }, function (g) { return g.v >= 1 && g.v <= 9 && !(g.a1 === 1 && g.a2 === 1); });
  }

  /* ====================================================================================
   * Part 3 — rational exponents and radicals
   * ==================================================================================== */
  function q17Part(r, kind, v) {
    var tg, prompt, cands;
    if (kind === 'mn') {
      var g = find(function () { var n = r.pick([3, 4, 5, 6]); return [r.int(2, n + 3), n]; }, function (g) { return cop(g[0], g[1]) && g[0] !== g[1]; });
      prompt = v + '^{\\frac{' + g[0] + '}{' + g[1] + '}}'; tg = radOf(v, g[0], g[1]); cands = radCands(v, g[0], g[1]);
    } else if (kind === 'neg') {
      var n2 = r.pick([2, 3, 4, 5, 6]); prompt = v + '^{-\\frac{1}{' + n2 + '}}'; tg = radOf(v, -1, n2); cands = radCands(v, -1, n2);
    } else {
      var k = r.int(2, 9), n3 = r.pick([2, 3, 4, 5]); prompt = k + v + '^{\\frac{1}{' + n3 + '}}'; tg = radOf(v, 1, n3, k);
      cands = radCands(v, 1, n3, k).concat([[rootT(n3, k + v), 'u2t-coef-inside', 'Only ' + t(v) + ' has the exponent ' + t('\\frac{1}{' + n3 + '}') + ', so only ' + t(v) + ' goes under the root; the ' + t(k) + ' stays outside.']]);
    }
    return convPart(t(prompt), tg, { form: 'radical', cands: cands }, 'Denominator of the exponent → index of the root; numerator → the power' + (kind === 'neg' ? '; the negative sign → reciprocal (the radical goes in the denominator)' : '') + (kind === 'coef' ? '; the coefficient has no exponent, so it stays outside' : '') + '.<br>' + t(prompt + '=' + tg),
      CONV_HINTS, 'power to radical ' + prompt);
  }
  function q18Part(r, kind, v) {
    var m, n, prompt;
    if (kind === 'pos') { var g = find(function () { var nn = r.pick([3, 4, 5, 6]); return [r.int(2, nn + 3), nn]; }, function (g) { return cop(g[0], g[1]) && g[0] !== g[1]; }); m = g[0]; n = g[1]; prompt = rootT(n, pw(v, m)); }
    else if (kind === 'sqrt') { m = r.pick([3, 5, 7, 9]); n = 2; prompt = rootT(2, pw(v, m)); }
    else { var g2 = find(function () { var nn = r.pick([3, 4, 5, 6]); return [r.int(1, nn - 1), nn]; }, function (g) { return cop(g[0], g[1]) && !(g[0] === 1 && g[1] === 2); }); m = -g2[0]; n = g2[1]; prompt = '\\dfrac{1}{' + rootT(n, pw(v, -m)) + '}'; }
    var tg = v + '^{' + expS(m, n) + '}', k = Math.abs(m), s = sgn(m), cands = [];
    cands.push([v + '^{' + expS(s * n, k) + '}', 'index-power', 'The <b>index</b> of the root becomes the <b>denominator</b> of the exponent, and the power inside becomes the numerator.']);
    cands.push([v + '^{' + expS(-m, n) + '}', m < 0 ? 'no-recip' : 'flip-exp', m < 0 ? 'The radical is in the <b>denominator</b>, so the exponent is <b>negative</b>.' : 'Check the sign of the exponent: the radical is in the numerator, so the exponent is positive.']);
    cands.push([v + '^{' + m * n + '}', 'u2t-times-exp', 'A root divides the exponent: the index ' + t(n) + ' goes in the <b>denominator</b>.']);
    return convPart(t(prompt), tg, { form: 'power', single: v + '^{n}', cands: cands }, 'Index ' + t(n) + ' → denominator; power ' + t(k) + ' → numerator' + (m < 0 ? '; in the denominator → negative exponent' : '') + '.<br>' + t(prompt + '=' + tg), CONV_HINTS, 'radical to power ' + prompt);
  }
  var Q19NEG = [[-8, 1, 3], [-27, 1, 3], [-64, 1, 3], [-125, 1, 3], [-216, 1, 3], [-343, 1, 3], [-512, 1, 3], [-729, 1, 3], [-1000, 1, 3], [-32, 1, 5], [-243, 1, 5], [-1, 8, 3], [-1, 27, 3], [-8, 27, 3], [-27, 64, 3], [-8, 125, 3], [-1, 64, 3], [-64, 125, 3], [-27, 125, 3], [-1331, 1, 3], [-1728, 1, 3]];
  var Q19ROOT = [[16, 4], [81, 4], [256, 4], [625, 4], [1296, 4], [10000, 4], [32, 5], [243, 5], [1024, 5], [100000, 5], [64, 6], [729, 6], [125, 3], [216, 3], [343, 3], [512, 3], [729, 3], [1000, 3], [128, 7], [27, 3], [64, 3]];
  function q21Part(r, kind, v) {
    var A, prompt, sol, o = {};
    if (kind === 'prod') {
      var g = find(function () { var b = r.pick([2, 3, 4, 5, 6]), d = r.pick([2, 3, 4, 5, 6]); return { a: r.int(1, b - 1), b: b, c: r.int(1, d - 1), d: d }; },
        function (g) { var s = qadd([g.a, g.b], [g.c, g.d]); return g.b !== g.d && cop(g.a, g.b) && cop(g.c, g.d) && s[1] > 1 && s[1] <= 12; });
      var e = qadd([g.a, g.b], [g.c, g.d]), L = e[1] * 1; A = M(1, [[v, e]]);
      prompt = v + '^{\\frac{' + g.a + '}{' + g.b + '}}\\cdot ' + v + '^{\\frac{' + g.c + '}{' + g.d + '}}';
      var den = g.b * g.d / gcd(g.b, g.d);
      o.pd = known([[pw(v, qmul([g.a, g.b], [g.c, g.d])), 'mult-exp', 'Multiplying powers of the same base: <b>add</b> the exponents.'], [pw(v, Q(g.a + g.c, g.b + g.d)), 'add-den', 'To add fractions, use a common denominator: ' + t('\\frac{' + g.a + '}{' + g.b + '}=\\frac{' + g.a * den / g.b + '}{' + den + '}') + '.']], posTex(A));
      sol = 'Product law (add the exponents, with a common denominator ' + t(den) + '):<br>' + t(prompt + '=' + v + '^{\\frac{' + g.a * den / g.b + '}{' + den + '}+\\frac{' + g.c * den / g.d + '}{' + den + '}}=' + posTex(A)) + '.<br>Radical form: ' + t(posTex(A) + '=' + radTex(A)) + '.';
      void L;
    } else if (kind === 'quot') {
      var g2 = find(function () { var B = r.pick([2, 3, 5, 6]), c = r.int(2, 4), q = r.pick([2, 3, 4, 5]), s = r.pick([2, 3, 4, 6]); return { B: B, c: c, Aa: B * c, p: r.int(1, q - 1), q: q, rr: r.int(1, s - 1), s: s }; },
        function (g) { var e = qadd([g.p, g.q], [g.rr, g.s]); return g.q !== g.s && cop(g.p, g.q) && cop(g.rr, g.s) && e[1] > 1 && e[0] < e[1] && e[1] <= 12; });
      var e2 = qadd([g2.p, g2.q], [g2.rr, g2.s]); A = M(g2.c, [[v, e2]]);
      prompt = '\\dfrac{' + g2.Aa + v + '^{\\frac{' + g2.p + '}{' + g2.q + '}}}{' + g2.B + v + '^{-\\frac{' + g2.rr + '}{' + g2.s + '}}}';
      o.pd = known([[posTex(M(g2.c, [[v, qsub([g2.p, g2.q], [g2.rr, g2.s])]])), 'sign-exp', 'Subtracting a negative exponent <b>adds</b> it: ' + t('\\frac{' + g2.p + '}{' + g2.q + '}-\\left(-\\frac{' + g2.rr + '}{' + g2.s + '}\\right)=\\frac{' + g2.p + '}{' + g2.q + '}+\\frac{' + g2.rr + '}{' + g2.s + '}') + '.'],
        [posTex(M(g2.Aa - g2.B, [[v, e2]])), 'sub-coef', 'Divide the numbers, don’t subtract them.']], posTex(A));
      sol = 'Quotient law (divide the numbers, subtract the exponents):<br>' + t(prompt + '=' + g2.c + v + '^{\\frac{' + g2.p + '}{' + g2.q + '}-\\left(-\\frac{' + g2.rr + '}{' + g2.s + '}\\right)}=' + g2.c + v + '^{\\frac{' + g2.p + '}{' + g2.q + '}+\\frac{' + g2.rr + '}{' + g2.s + '}}=' + posTex(A)) + '.<br>Radical form: ' + t(posTex(A) + '=' + radTex(A)) + '.';
    } else if (kind === 'powcoef') {
      var g3 = find(function () { var kn = r.pick([[2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2], [9, 2], [2, 3], [3, 3], [4, 3], [2, 4], [3, 4]]); var n = kn[1]; return { k: kn[0], n: n, j: r.int(1, n + 1), tt: r.int(1, 3) }; },
        function (g) { return cop(g.j, g.n) && g.j !== g.n && !(g.j === 1) && Math.pow(g.k, g.j) <= 125; });
      var KN = Math.pow(g3.k, g3.n), ej = [g3.j, g3.n]; A = M(Math.pow(g3.k, g3.j), [[v, g3.tt * g3.j]]);
      prompt = br(KN + pw(v, g3.n * g3.tt)) + '^{\\frac{' + g3.j + '}{' + g3.n + '}}';
      var kn3 = known([[posTex(M(KN, [[v, g3.tt * g3.j]])), 'coef-raise', 'Raise the ' + t(KN) + ' to the power ' + t('\\frac{' + g3.j + '}{' + g3.n + '}') + ' too: ' + t(KN + '^{\\frac{' + g3.j + '}{' + g3.n + '}}=\\left(' + rootT(g3.n, KN) + '\\right)^{' + g3.j + '}=' + Math.pow(g3.k, g3.j)) + '.'],
        [posTex(M(g3.k, [[v, g3.tt * g3.j]])), 'root-only', 'You took the ' + rootName(g3.n) + ' root of ' + t(KN) + '; now raise it to the power ' + t(g3.j) + '.'],
        [posTex(M(Math.pow(g3.k, g3.j), [[v, g3.n * g3.tt + g3.j]])), 'law-added', 'Power of a power: <b>multiply</b> the exponents, ' + t(g3.n * g3.tt + '\\times\\frac{' + g3.j + '}{' + g3.n + '}') + '.']], posTex(A));
      sol = 'Power of a product (each factor gets the exponent ' + t('\\frac{' + g3.j + '}{' + g3.n + '}') + '):<br>' + t(prompt + '=' + br(rootT(g3.n, KN)) + '^{' + g3.j + '}\\cdot ' + v + '^{' + g3.n * g3.tt + '\\times\\frac{' + g3.j + '}{' + g3.n + '}}=' + g3.k + '^{' + g3.j + '}' + pw(v, g3.tt * g3.j) + '=' + posTex(A)) + '.<br>The exponent is a whole number, so no radical form is needed.';
      void ej;
      return XP(t(prompt), posTex(A), {}, sol, ['Apply the exponent to every factor. For the number, take the ' + rootName(g3.n) + ' root first, then the power.', 'For the letter, multiply the exponents.'], 'simplify ' + prompt, kn3);
    } else {
      var g4 = find(function () { var b = r.pick([2, 3, 4]), d = r.pick([2, 3, 4, 6, 8, 9]); return { a: (r.chance(0.5) ? -1 : 1) * r.int(1, 2 * b), b: b, c: r.int(1, d), d: d, sgn2: r.chance(0.5) ? -1 : 1 }; },
        function (g) { var e = qmul([g.a, g.b], [g.sgn2 * g.c, g.d]); return cop(Math.abs(g.a), g.b) && cop(g.c, g.d) && g.b !== 1 && g.d !== 1 && e[0] < 0 && e[0] >= -2 && e[1] > 1 && e[1] <= 4 && (Math.abs(g.a) * g.c) !== Math.abs(e[0]); });
      var e4 = qmul([g4.a, g4.b], [g4.sgn2 * g4.c, g4.d]); A = M(1, [[v, e4]]);
      prompt = br(v + '^{' + eT([g4.a, g4.b]) + '}') + '^{' + eT([g4.sgn2 * g4.c, g4.d]) + '}';
      o.pd = known([[posTex(M(1, [[v, qadd([g4.a, g4.b], [g4.sgn2 * g4.c, g4.d])]])), 'law-added', 'Power of a power: <b>multiply</b> the exponents, don’t add them.']], posTex(A));
      sol = 'Power of a power (multiply the exponents, then reduce):<br>' + t(prompt + '=' + v + '^{' + eT([g4.a, g4.b]) + '\\times ' + pT([g4.sgn2 * g4.c, g4.d]) + '}=' + v + '^{' + eT(e4) + '}=' + posTex(A)) + '.<br>Radical form: ' + t(posTex(A) + '=' + radTex(A)) + '.';
    }
    o.sol = sol; o.text = 'simplify ' + prompt;
    return twoForms(t(prompt), A, o);
  }
  /* Q24: one bracket with a negative rational exponent */
  function q24Shared(r) {
    var L = r.pick(PAIRS), u = L[0], w = L[1];
    return find(function () {
      var kd = r.pick([[2, 3], [2, 4], [2, 5], [3, 3], [3, 4]]), k = kd[0], d = kd[1], j = r.pick(d === 4 ? [1, 3] : [1, 2]);
      var tU = r.pick([-2, -1, 1, 2]), U = d * tU, Ru = Q(-j * tU, 1);
      var Rw = r.pick([[1, 2], [-1, 2], [1, 3], [-1, 3], [2, 3], [-2, 3], [1, 1]]), W = qmul(Rw, [-d, j]);
      var a1 = r.int(-4, 5), a2 = a1 - U, half = qmul(W, [1, 2]), split = r.chance(0.5) && half[1] <= 4;
      var b1 = split ? half : qadd(W, [-r.pick([-2, -1, 1, 2]), 1]), b2 = qsub(b1, W);
      return { u: u, w: w, k: k, d: d, j: j, C: Math.pow(k, d), U: U, W: W, a1: a1, a2: a2, b1: b1, b2: b2, e: Q(-j, d) };
    }, function (g) { return g.a1 !== 0 && g.a2 !== 0 && Math.abs(g.a2) <= 6 && g.W[1] !== 1 && g.W[1] <= 4 && g.b1[0] !== 0 && g.b2[0] !== 0 && g.b1[1] <= 4 && g.b2[1] <= 4 && Math.abs(qv(g.b1)) <= 2 && Math.abs(qv(g.b2)) <= 2 && Math.pow(g.k, g.j) <= 27 && (g.j === 1 || g.k === 2); });
  }
  /* Q25: not real vs real */
  function q25Shared(r) {
    var n1 = r.pick([2, 4, 6]), c1 = n1 === 2 ? r.int(2, 10) : n1 === 4 ? r.int(2, 3) : 2, m1 = r.pick(n1 === 6 ? [5] : [3, 5]);
    var g = find(function () { var n2 = r.pick([3, 3, 5]), c2 = n2 === 3 ? r.int(2, 5) : r.int(2, 3), m2 = r.pick([1, 2, 4, 5].filter(function (x) { return x % n2; })); return { n2: n2, c2: c2, m2: m2 }; },
      function (g) { return Math.pow(g.c2, g.m2) <= 256 && g.m2 !== 1; });
    return { n1: n1, b1: Math.pow(c1, n1), m1: m1, n2: g.n2, c2: g.c2, b2: Math.pow(g.c2, g.n2), m2: g.m2, v2: Math.pow(-g.c2, g.m2) };
  }
  function noneOr(spec) {
    return function (resp) {
      var s = String(resp == null ? '' : resp).trim();
      var isNone = /^(none|no|not real|notreal|undefined|dne|no real value)$/i.test(s.replace(/\s+/g, ' ')) || /^\\text\{\s*none\s*\}$/.test(s);
      if (!s) return form('empty', 'Type your answer first, or press <b>none</b>.');
      if (spec.defined) { if (isNone) return wrong('u2t-none-real', spec.noneWhy); return spec.check(s); }
      if (isNone) return ok();
      return wrong('u2t-has-value', spec.valWhy);
    };
  }

  HW.defineTest({
    id: 'u2test', unit: 2, title: 'Unit 2 Test', outcome: 'AN3', calc: false,
    blurb: 'The Unit 2 outcomes-based test on AN3: exponent laws with integer exponents, zero and negative exponents, and rational exponents and radicals, each at the BEG, PRG and MAS levels. No calculator.',
    questions: [
      /* ======================= AN3 · Part 1: exponent laws with integer exponents ======================= */
      { num: '1', outcome: 'AN3', stem: 'Use the exponent laws to simplify.',
        shared: function (r) { return { kinds: r.shuffle(['prod', 'quot', 'pow', 'prodpow']), vs: r.sample(LET, 4) }; },
        parts: [0, 1, 2, 3].map(function (i) { return { id: '1' + 'abcd'[i], outcome: 'AN3', level: 'BEG', make: function (r, s) { return q1Part(r, s.kinds[i], s.vs[i]); } }; }) },
      { num: '2', outcome: 'AN3', stem: 'Evaluate without a calculator.',
        shared: function (r) { var bn = r.pick(Q2PAIRS); return { b: bn[0], n: bn[1], minusFirst: r.chance(0.5) }; },
        parts: [
          { id: '2a', outcome: 'AN3', level: 'BEG', make: function (r, s) { return q2Pair(s, s.minusFirst ? 'minus' : 'brk'); } },
          { id: '2b', outcome: 'AN3', level: 'BEG', make: function (r, s) { return q2Pair(s, s.minusFirst ? 'brk' : 'minus'); } },
          { id: '2c', outcome: 'AN3', level: 'BEG', make: function (r) {
            var g = find(function () { var b = r.pick([2, 3, 5, 7, 10]), d = r.int(2, b === 2 ? 6 : b === 3 ? 4 : 3), n = r.int(3, 9); return { b: b, d: d, n: n, m: n + d }; }, function (g) { return Math.pow(g.b, g.d) <= 1000; });
            var b = g.b, V = Math.pow(b, g.d), pr = '\\dfrac{' + b + '^{' + g.m + '}}{' + b + '^{' + g.n + '}}';
            return INT(t(pr), V, [[b * g.d, 'u2t-times-exp', t(b + '^{' + g.d + '}') + ' means ' + g.d + ' factors of ' + t(b) + ', not ' + t(b + '\\times ' + g.d) + '.'], g.m % g.n === 0 ? [Math.pow(b, g.m / g.n), 'div-exp', 'Dividing powers: <b>subtract</b> the exponents.'] : null, [g.d, 'u2t-times-exp', 'That’s the exponent. Now evaluate the power: ' + t(b + '^{' + g.d + '}') + '.']].filter(Boolean),
              'Quotient law first, then evaluate: ' + t(pr + '=' + b + '^{' + g.m + '-' + g.n + '}=' + b + '^{' + g.d + '}=' + F(V)) + '.', ['Use the quotient law first: subtract the exponents. Then evaluate the smaller power.'], 'evaluate ' + pr);
          } },
          { id: '2d', outcome: 'AN3', level: 'BEG', make: function (r) {
            var g = r.pick(Q2D), b = g[0], i = g[1], j = g[2], V = Math.pow(b, i * j), pr = br(b + '^{' + i + '}') + '^{' + j + '}';
            if (i === 1) pr = br(b + '^{' + (i * j) + '}') + '^{1}';
            return INT(t(pr), V, [[Math.pow(b, i + j), 'add-exp', 'A power of a power: <b>multiply</b> the exponents.'], [b * i * j, 'u2t-times-exp', t(b + '^{' + i * j + '}') + ' means ' + i * j + ' factors of ' + t(b) + '.']],
              'Power of a power (multiply the exponents), then evaluate: ' + t(pr + '=' + b + '^{' + (i === 1 ? i * j + '\\times 1' : i + '\\times ' + j) + '}=' + b + '^{' + i * j + '}=' + F(V)) + '.', ['Multiply the exponents first, then evaluate.'], 'evaluate ' + pr);
          } }] },
      { num: '3', outcome: 'AN3', stem: 'Simplify.', parts: [
        { id: '3a', outcome: 'AN3', level: 'BEG', make: function (r) {
          var x = r.pick(LET), a = r.int(2, 7), b = r.int(3, 7), m = r.int(2, 7), n = r.int(2, 7), tg = (a * b) + pw(x, m + n), pr = a + pw(x, m) + '\\cdot ' + b + pw(x, n);
          return XP(t(pr), tg, {}, 'Multiply the numbers, add the exponents: ' + t(pr + '=(' + a + '\\times ' + b + ')' + x + '^{' + m + '+' + n + '}=' + tg), ['Multiply the coefficients. Same base: add the exponents.'], 'simplify ' + pr,
            known([[(a + b) + pw(x, m + n), 'coef-added', 'Multiply the numbers, don’t add them: ' + t(a + '\\times ' + b) + '.'], [(a * b) + pw(x, m * n), 'mult-exp', 'Same base, multiplying: <b>add</b> the exponents.']], tg));
        } },
        { id: '3b', outcome: 'AN3', level: 'BEG', make: function (r) {
          var y = r.pick(LET), k = r.int(2, 9), q = r.int(2, 5), m = r.int(6, 11), n = r.int(2, 5); if (m - n < 2) m = n + 2 + r.int(0, 3);
          var tg = q + pw(y, m - n), pr = '\\dfrac{' + q * k + pw(y, m) + '}{' + k + pw(y, n) + '}';
          return XP(t(pr), tg, {}, 'Divide the numbers, subtract the exponents: ' + t(pr + '=\\tfrac{' + q * k + '}{' + k + '}\\,' + y + '^{' + m + '-' + n + '}=' + tg), ['Divide the coefficients. Same base: subtract the exponents.'], 'simplify ' + pr,
            known([[(q * k - k) + pw(y, m - n), 'sub-coef', 'Divide the numbers, don’t subtract them.'], m % n === 0 ? [q + pw(y, m / n), 'div-exp', 'Subtract the exponents, don’t divide them.'] : null, [q + pw(y, m + n), 'law-added', 'Dividing: <b>subtract</b> the exponents.']], tg));
        } }] },
      { num: '4', outcome: 'AN3', stem: 'Simplify fully.', parts: [
        { id: '4a', outcome: 'AN3', level: 'PRG', make: function (r) { return q4a(r); } },
        { id: '4b', outcome: 'AN3', level: 'PRG', make: function (r) { return q4b(r); } },
        { id: '4c', outcome: 'AN3', level: 'PRG', make: function (r) { return q4c(r); } }] },
      { num: '5', outcome: 'AN3', stem: 'Simplify, then evaluate.', shared: function (r) { return { minusFirst: r.chance(0.5) }; }, parts: [
        { id: '5a', outcome: 'AN3', level: 'PRG', make: function (r, s) { return s.minusFirst ? q5Minus(r) : q5Brk(r); } },
        { id: '5b', outcome: 'AN3', level: 'PRG', make: function (r, s) { return s.minusFirst ? q5Brk(r) : q5Minus(r); } }] },
      { num: '6', outcome: 'AN3', shared: q6Shared,
        stem: function (g) { var L = q6Lines(g); return g.who + ' simplified ' + t(L.orig) + ' like this:\\[' + L.orig + '\\ \\overset{\\text{Step 1}}{=}\\ ' + L.l1 + '\\ \\overset{\\text{Step 2}}{=}\\ ' + L.l2 + '\\]'; },
        parts: [
          { id: '6a', outcome: 'AN3', level: 'MAS', make: function (r, g) {
            var u = g.u, v = g.v, L = q6Lines(g), KN = Math.pow(g.k, g.n), pn = g.p * g.n, qn = g.q * g.n;
            return selectPart(r, 'There are <b>three</b> errors in ' + g.who + '’s work. Select each one.', [
              { value: 'e1', right: true, html: 'Step 1: the ' + t(g.k) + ' in the bracket was not raised to the power ' + t(g.n) + '. The power of a product applies to <b>every</b> factor.' },
              { value: 'e2', right: true, html: 'Step 2: the factor ' + t(u) + ' in ' + t(g.m + u + pw(v, g.s)) + ' was dropped (it has the exponent ' + t(1) + ').' },
              { value: 'e3', right: true, html: 'Step 2: the exponents of ' + t(v) + ' were <b>multiplied</b>; when multiplying powers, add the exponents.' },
              { value: 'd1', html: 'Step 1: the exponents of ' + t(u) + ' should have been <b>added</b>, ' + t(g.p + '+' + g.n) + '.', why: 'A power of a power <b>multiplies</b> the exponents: ' + t(br(pw(u, g.p)) + '^{' + g.n + '}=' + pw(u, pn)) + ' is right.' },
              { value: 'd2', html: 'Step 2: the coefficients ' + t(g.k) + ' and ' + t(g.m) + ' should have been <b>added</b>.', why: 'Coefficients are <b>multiplied</b>, not added: ' + t(g.k + '\\cdot ' + g.m + '=' + g.k * g.m) + ' is right (the error with the ' + t(g.k) + ' is in Step 1).' },
              { value: 'd3', html: 'Step 1: ' + t(pw(v, g.q)) + ' should not change, because the exponent ' + t(g.n) + ' belongs only to ' + t(pw(u, g.p)) + '.', why: 'The exponent ' + t(g.n) + ' is outside the bracket, so it applies to every factor inside, ' + t(pw(v, g.q)) + ' too.' }],
              '1. Step 1: the power of a product applies to every factor, so ' + t(g.k) + ' is raised to the power ' + t(g.n) + ': ' + t(g.k + '^{' + g.n + '}=' + KN) + '.<br>2. Step 2: ' + t(pw(u, pn) + '\\cdot ' + u + '=' + pw(u, pn + 1)) + ' (the ' + t(u) + ' was dropped).<br>3. Step 2: ' + t(pw(v, qn) + '\\cdot ' + pw(v, g.s) + '=' + pw(v, qn + g.s)) + ': add exponents when multiplying, don’t multiply them.<br>Correct: ' + t(KN + pw(u, pn) + pw(v, qn) + '\\cdot ' + g.m + u + pw(v, g.s) + '=' + posTex(L.right)),
              ['Redo each step yourself and compare.', 'Check: every factor in the bracket raised to the power? Every factor kept? Exponents added when multiplying?'], 'errors in ' + L.orig);
          } },
          { id: '6b', outcome: 'AN3', level: 'MAS', make: function (r, g) {
            var u = g.u, v = g.v, L = q6Lines(g), tg = posTex(L.right), KN = Math.pow(g.k, g.n), pn = g.p * g.n, qn = g.q * g.n;
            var kn = kmono([[M(g.k * g.m, [[u, pn], [v, qn * g.s]]), 'u2t-repeat', 'That is ' + g.who + '’s answer. Fix the three errors.'],
              [M(g.k * g.m, [[u, pn + 1], [v, qn + g.s]]), 'coef-not-raised', 'The ' + t(g.k) + ' in the bracket is raised to the power ' + t(g.n) + ' too.'],
              [M(KN * g.m, [[u, pn], [v, qn + g.s]]), 'hidden-one', 'Don’t drop the ' + t(u) + ': ' + t(u + '=' + u + '^{1}') + '.'],
              [M(KN * g.m, [[u, pn + 1], [v, qn * g.s]]), 'mult-exp', 'Multiplying powers: <b>add</b> the exponents.']], tg);
            return XP('Write the correct simplified answer for ' + t(L.orig) + '.', tg, {}, t(L.orig + '=' + KN + pw(u, pn) + pw(v, qn) + '\\cdot ' + g.m + u + pw(v, g.s) + '=' + tg),
              ['Raise every factor in the bracket to the power ' + t(g.n) + ', then multiply the numbers and add the exponents.'], 'correct ' + L.orig, kn);
          } }] },
      { num: '7', outcome: 'AN3', parts: [
        { id: '7', outcome: 'AN3', level: 'MAS', make: function (r) {
          var x = r.pick(['x', 'y', 'm', 'a', 'k', 'n']), kn = r.pick([[2, 3], [3, 3], [2, 4], [3, 2], [5, 2], [4, 2], [2, 5], [3, 4], [6, 2], [7, 2]]), C = Math.pow(kn[0], kn[1]), E = r.int(6, 12);
          var tg = C + pw(x, E), tp = ex.parse(tg).ast;
          var j = find(function () { return r.int(1, Math.floor((E + 4) / kn[1]) + 1); }, function (j) { return j * kn[1] - E >= 1 && j * kn[1] - E <= 4; }, null);
          var keyT = j != null ? '\\frac{' + br(kn[0] + pw(x, j)) + '^{' + kn[1] + '}}{' + pw(x, j * kn[1] - E) + '}' : br(kn[0] + x) + '^{' + kn[1] + '}\\cdot ' + pw(x, E - kn[1]);
          function laws(ast) {
            var Lw = {};
            function scan(node) {
              var num = [], den = [], fz = ex.factors(node); num = fz.num; den = fz.den;
              var vn = num.map(function (f) { return varsOf(f); }), vd = den.map(function (f) { return varsOf(f); });
              [vn, vd].forEach(function (list) { var cnt = {}; list.forEach(function (vs) { vs.forEach(function (v) { cnt[v] = (cnt[v] || 0) + 1; }); }); if (Object.keys(cnt).some(function (v) { return cnt[v] > 1; })) Lw.product = 1; });
              vn.forEach(function (a) { vd.forEach(function (b) { if (a.some(function (v) { return b.indexOf(v) >= 0; })) Lw.quotient = 1; }); });
              num.concat(den).forEach(function (f) {
                f = strip(f);
                if (f.t === 'pow') {
                  var b = strip(f.a), e = ex.rat(f.b);
                  if (varsOf(b).length && e && e[0] <= 0) Lw.negzero = 1;
                  if (b.t !== 'var' && b.t !== 'num' && varsOf(b).length) {
                    /* power of a product (or quotient) and power of a power are different laws (Lesson 1/2: (2x³)³ uses both) */
                    var one = e && e[0] === e[1];
                    if (b.t === 'pow') { if (!one) Lw.powpow = 1; }
                    else {
                      var fb = ex.factors(b), all = fb.num.concat(fb.den);
                      if (!one && (all.length > 1 || fb.sign < 0)) Lw.powprod = 1;
                      all.forEach(function (g) { g = strip(g); var ge = g.t === 'pow' ? ex.rat(g.b) : null; if (!one && g.t === 'pow' && varsOf(g.a).length && !(ge && ge[0] === ge[1])) Lw.powpow = 1; });
                    }
                    scan(b);
                  }
                }
              });
            }
            scan(ast); return Object.keys(Lw);
          }
          var check = function (resp) {
            var a = K.read(resp); if (a.res) return a.res;
            var sh = ex.shape(a.ast), vs = union(varsOf(a.ast), [x]);
            if (!same(a.ast, tp, vs)) return wrong('value', 'Simplify your expression: it doesn’t come out to ' + t(tg) + '.');
            if (sh.ops) return wrong('u2t-sum', 'Use products, quotients and powers (exponent laws), not addition or subtraction.');
            var L = laws(a.ast);
            if (!L.length) return wrong('u2t-no-law', 'That’s the simplified answer itself. Write an expression that <b>needs</b> two different exponent laws to simplify to ' + t(tg) + '.');
            if (L.length < 2) return wrong('u2t-one-law', 'It simplifies to ' + t(tg) + ', but it uses only ' + (L[0] === 'powprod' ? 'the power of a product law' : L[0] === 'powpow' ? 'the power of a power law' : L[0] === 'product' ? 'the product law' : L[0] === 'quotient' ? 'the quotient law' : 'the zero/negative exponent law') + '. Combine two different laws, e.g. a power of a product <b>and</b> a quotient.');
            return ok();
          };
          var p = P.math('Create an expression that uses <b>two different</b> exponent laws (for example a power of a product and the quotient law) and simplifies to ' + t(tg) + '.', check, keyT,
            'Many answers work. For example ' + t(keyT + '=' + (j != null ? '\\frac{' + C + pw(x, j * kn[1]) + '}{' + pw(x, j * kn[1] - E) + '}' : C + pw(x, kn[1]) + '\\cdot ' + pw(x, E - kn[1])) + '=' + tg) + ' uses the power of a product and power of a power laws, then the ' + (j != null ? 'quotient' : 'product') + ' law.<br>Any expression that equals ' + t(tg) + ' and needs two different laws (product, quotient, power of a product or quotient, power of a power, zero or negative exponent) counts. (A bracket like ' + t(br('2' + pw(x, 3)) + '^{3}=8' + pw(x, 9)) + ' already uses two: the power of a product and the power of a power.) One law on its own, such as ' + t(C + pw(x, E - 2) + '\\cdot ' + pw(x, 2)) + ', is not enough.',
            ['Start from the answer and work backwards: ' + t(C + '=' + kn[0] + '^{' + kn[1] + '}') + ', so a bracket raised to the power ' + t(kn[1]) + ' gives the ' + t(C) + '.', 'Then make the exponent of ' + t(x) + ' too big and divide by a power of ' + t(x) + ' to fix it.'], 'create expression for ' + tg, { keys: 'expo', vars: [x] });
          p.answer = 'e.g. ' + t(keyT);
          p.bad = [tg, tg + '+' + tg + '-' + tg, C + pw(x, E - 2) + '\\cdot ' + pw(x, 2), '\\frac{' + C + pw(x, E + 3) + '}{' + pw(x, 3) + '}'];
          if (E % 2 === 0) p.bad.push(C + br(pw(x, E / 2)) + '^{2}');
          return p;
        } }] },
      { num: '8', outcome: 'AN3', shared: q8Shared, stem: function (g) { return g.c.a(g.T, g.E); }, parts: [
        { id: '8a', outcome: 'AN3', level: 'MAS', make: function (r, g) {
          var b = g.b, V = Math.pow(b, g.d);
          var p = P.fields(g.c.qa + ' Give a power, then evaluate.', [{ name: 'Power', label: 'As a power:', mode: 'math', keys: 'expr' }, { name: 'Number', label: 'Number of ' + g.c.ua + ':', after: g.c.ua }],
            [powOfChk(b, g.d, [[g.T + g.E, 'u2t-multiplied', 'Sharing out (how many fit) means <b>dividing</b>: subtract the exponents.'], [g.T / g.E % 1 === 0 ? g.T / g.E : 0.5, 'div-exp', 'Dividing powers: <b>subtract</b> the exponents.']]),
              K.value(V, { only: 'integer', diag: numKnown([[b * g.d, 'u2t-times-exp', t(b + '^{' + g.d + '}') + ' means ' + g.d + ' factors of ' + t(b) + '.']], V) })],
            [b + '^{' + g.d + '}', String(V)], t(b + '^{' + g.d + '}=' + F(V)) + ' ' + g.c.ua,
            'Divide the total by the size of one: ' + t(b + '^{' + g.T + '}\\div ' + b + '^{' + g.E + '}=' + b + '^{' + g.T + '-' + g.E + '}=' + b + '^{' + g.d + '}=' + F(V)) + ' ' + g.c.ua + '.',
            ['How many groups: divide. Same base: subtract the exponents.', 'Then evaluate the power.'], g.c.ua + ': ' + b + '^' + g.T + '÷' + b + '^' + g.E);
          p.bad = [[b + '^{' + (g.T + g.E) + '}', String(V)]]; if (b * g.d !== V) p.bad.push([b + '^{' + g.d + '}', String(b * g.d)]);
          return p;
        } },
        { id: '8b', outcome: 'AN3', level: 'MAS', make: function (r, g) {
          var b = g.b, R2 = Math.pow(b, g.f), jk = g.j * g.k;
          var p = P.fields(g.c.b2(g.B2, g.k), [{ name: 'Power of ' + b, label: t(g.B2 + '^{' + g.k + '}') + ' as a power of ' + t(b) + ':', mode: 'math', keys: 'expr' }, { name: 'Times as many', label: 'Times as many:', after: 'times' }],
            [powOfChk(b, jk, [[g.j + g.k, 'add-exp', t(g.B2 + '=' + b + '^{' + g.j + '}') + ', so ' + t(g.B2 + '^{' + g.k + '}=\\left(' + b + '^{' + g.j + '}\\right)^{' + g.k + '}') + ': a power of a power, <b>multiply</b> the exponents.'], [g.k, 'u2t-base-power', 'Write ' + t(g.B2) + ' as a power of ' + t(b) + ' first: ' + t(g.B2 + '=' + b + '^{' + g.j + '}') + '.']]),
              K.value(R2, { only: 'integer', diag: numKnown([[g.j + g.k - g.T > 0 ? Math.pow(b, g.j + g.k - g.T) : NaN, 'add-exp', 'Check the power of ' + t(b) + ' first.'], [b * g.f, 'u2t-times-exp', t(b + '^{' + g.f + '}') + ' means ' + g.f + ' factors of ' + t(b) + '.']], R2) })],
            [b + '^{' + jk + '}', String(R2)], t(g.B2 + '^{' + g.k + '}=' + b + '^{' + jk + '}') + '; ' + t(F(R2)) + ' times as many',
            t(g.B2 + '^{' + g.k + '}=\\left(' + b + '^{' + g.j + '}\\right)^{' + g.k + '}=' + b + '^{' + jk + '}') + '.<br>Compare by dividing: ' + t(b + '^{' + jk + '}\\div ' + b + '^{' + g.T + '}=' + b + '^{' + g.f + '}=' + F(R2)) + ' times as many.',
            ['Write ' + t(g.B2) + ' as a power of ' + t(b) + ', then use the power of a power law.', '“How many times as many” means divide the two amounts.'], 'compare ' + g.B2 + '^' + g.k + ' with ' + b + '^' + g.T);
          p.bad = [[b + '^{' + (g.j + g.k) + '}', String(R2)]]; if (b * g.f !== R2) p.bad.push([b + '^{' + jk + '}', String(b * g.f)]);
          return p;
        } }] },

      /* ======================= AN3 · Part 2: zero and negative exponents ======================= */
      { num: '9', outcome: 'AN3', stem: 'Evaluate without a calculator.', shared: function (r) { return { c: r.int(2, 12), brFirst: r.chance(0.5) }; }, parts: [
        { id: '9a', outcome: 'AN3', level: 'BEG', make: function (r) {
          var bn = r.pick([[2, 2], [2, 3], [2, 4], [2, 5], [2, 6], [2, 7], [3, 2], [3, 3], [3, 4], [3, 5], [4, 2], [4, 3], [4, 4], [5, 2], [5, 3], [6, 2], [6, 3], [7, 2], [8, 2], [9, 2], [10, 2], [10, 3], [11, 2], [12, 2]]), b = bn[0], n = bn[1], V = Math.pow(b, n), pr = b + '^{-' + n + '}';
          return VAL(t(pr), [1, V], [[-V, 'u2t-opposite', 'A negative exponent means <b>reciprocal</b>, not negative: ' + t(pr + '=\\frac{1}{' + b + '^{' + n + '}}') + '.'], [-1 / V, 'u2t-opposite', 'A negative exponent doesn’t make the value negative.'], [V, 'no-recip', 'A negative exponent means take the <b>reciprocal</b>: ' + t('\\frac{1}{' + b + '^{' + n + '}}') + '.'], [-b * n, 'u2t-times-exp', 'The exponent isn’t a multiplier.']],
            t(pr + '=\\dfrac{1}{' + b + '^{' + n + '}}=\\dfrac{1}{' + V + '}'), ['A negative exponent means reciprocal: ' + t('a^{-n}=\\frac{1}{a^{n}}') + '.'], 'evaluate ' + pr);
        } },
        { id: '9b', outcome: 'AN3', level: 'BEG', make: function (r, s) { return q9Zero(s.c, s.brFirst); } },
        { id: '9c', outcome: 'AN3', level: 'BEG', make: function (r, s) { return q9Zero(s.c, !s.brFirst); } },
        { id: '9d', outcome: 'AN3', level: 'BEG', make: function (r) {
          var g = find(function () { return [r.int(2, 6), r.int(2, 6), r.pick([2, 3, 3])]; }, function (g) { return g[0] !== g[1] && cop(g[0], g[1]) && Math.pow(Math.max(g[0], g[1]), g[2]) <= 216; }), p = g[0], q = g[1], n = g[2];
          var pr = '\\left(\\dfrac{' + p + '}{' + q + '}\\right)^{-' + n + '}', V = Q(Math.pow(q, n), Math.pow(p, n));
          return VAL(t(pr), V, [[Math.pow(p, n) / Math.pow(q, n), 'no-flip', 'A negative exponent on a fraction <b>flips</b> it: ' + t(pr + '=\\left(\\dfrac{' + q + '}{' + p + '}\\right)^{' + n + '}') + '.'], [q / p, 'no-power', 'You flipped the fraction — now raise it to the power ' + t(n) + '.'], [-qv(V), 'u2t-opposite', 'A negative exponent flips the fraction; it doesn’t make it negative.'], [Math.pow(q, n) / p, 'top-only', 'Raise the top <b>and</b> the bottom to the power.']],
            'Flip the fraction to make the exponent positive: ' + t(pr + '=\\left(\\dfrac{' + q + '}{' + p + '}\\right)^{' + n + '}=\\dfrac{' + q + '^{' + n + '}}{' + p + '^{' + n + '}}=' + nT(V)), ['A negative exponent on a fraction flips it: ' + t('\\left(\\frac{a}{b}\\right)^{-n}=\\left(\\frac{b}{a}\\right)^{n}') + '.'], 'evaluate ' + pr);
        } },
        { id: '9e', outcome: 'AN3', level: 'BEG', make: function (r) {
          var bn = r.pick([[2, 2], [2, 3], [2, 4], [2, 5], [2, 6], [2, 7], [3, 2], [3, 3], [3, 4], [3, 5], [4, 2], [4, 3], [4, 4], [5, 2], [5, 3], [6, 2], [6, 3], [7, 2], [8, 2], [9, 2], [10, 2], [10, 3], [11, 2], [12, 2]]), b = bn[0], n = bn[1], V = Math.pow(b, n), pr = '\\dfrac{1}{' + b + '^{-' + n + '}}';
          return VAL(t(pr), [V, 1], [[1 / V, 'flip-back', 'A power with a negative exponent in the denominator moves <b>up</b> to the numerator: ' + t(pr + '=' + b + '^{' + n + '}') + '.'], [-V, 'u2t-opposite', 'A negative exponent means reciprocal, not negative.'], [-1 / V, 'u2t-opposite', 'A negative exponent doesn’t make the value negative.']],
            'Dividing by a reciprocal is multiplying: ' + t(pr + '=' + b + '^{' + n + '}=' + F(V)), ['A power with a negative exponent in the denominator moves up to the numerator, with a positive exponent.'], 'evaluate ' + pr);
        } }] },
      { num: '10', outcome: 'AN3', stem: 'Write each expression with positive exponents only.', parts: [
        { id: '10a', outcome: 'AN3', level: 'BEG', make: function (r) {
          var x = r.pick(LET), n = r.int(2, 9), pr = pwx(x, -n), tg = '\\frac{1}{' + pw(x, n) + '}';
          return XP(t(pr), tg, {}, t(pr + '=' + tg) + ': a negative exponent means reciprocal.', ['A negative exponent means reciprocal: ' + t('a^{-n}=\\frac{1}{a^{n}}') + '.'], 'positive exponents ' + pr,
            known([[pw(x, n), 'no-recip', 'Changing the sign of the exponent also moves the power to the <b>denominator</b>.'], ['-' + pw(x, n), 'u2t-opposite', 'A negative exponent means reciprocal, not negative.'], ['-\\frac{1}{' + pw(x, n) + '}', 'u2t-opposite', 'A negative exponent doesn’t make the expression negative.']], tg));
        } },
        { id: '10b', outcome: 'AN3', level: 'BEG', make: function (r) {
          var y = r.pick(LET), k = r.int(2, 9), n = r.int(2, 6), pr = k + pwx(y, -n), tg = '\\frac{' + k + '}{' + pw(y, n) + '}';
          return XP(t(pr), tg, {}, 'Only ' + t(y) + ' has the negative exponent, so only ' + t(pw(y, n)) + ' moves to the denominator: ' + t(pr + '=' + tg), ['Which part has the negative exponent? Only that part moves.'], 'positive exponents ' + pr,
            known([['\\frac{1}{' + k + pw(y, n) + '}', 'coef-side', 'The ' + t(k) + ' has no negative exponent, so it stays in the numerator: only ' + t(y) + ' is the base.'], [k + pw(y, n), 'no-recip', 'The power moves to the <b>denominator</b> when its exponent becomes positive.'], ['\\frac{1}{' + Math.pow(k, n) + pw(y, n) + '}', 'coef-side', 'Only ' + t(y) + ' is raised to ' + t(-n) + '; the ' + t(k) + ' stays as it is, in the numerator.']], tg));
        } },
        { id: '10c', outcome: 'AN3', level: 'BEG', make: function (r) {
          var m = r.pick(LET), n = r.int(2, 9), pr = '\\dfrac{1}{' + pwx(m, -n) + '}', tg = pw(m, n);
          return XP(t(pr), tg, {}, 'A power with a negative exponent in the denominator moves up to the numerator: ' + t(pr + '=' + tg), ['Move the power to the other side of the fraction bar and make its exponent positive.'], 'positive exponents ' + pr,
            known([['\\frac{1}{' + pw(m, n) + '}', 'flip-back', 'Making the exponent positive moves the power <b>up</b> to the numerator.'], ['-' + pw(m, n), 'u2t-opposite', 'A negative exponent means reciprocal, not negative.']], tg));
        } },
        { id: '10d', outcome: 'AN3', level: 'BEG', make: function (r) { return q10d(r); } }] },
      { num: '11', outcome: 'AN3', stem: 'Simplify. Write the answer with a positive exponent.', parts: [
        { id: '11a', outcome: 'AN3', level: 'BEG', make: function (r) {
          var k = r.pick(LET), m = r.int(2, 6), n = r.int(m + 2, 10), pr = pw(k, m) + '\\cdot ' + pwx(k, -n), tg = '\\frac{1}{' + pw(k, n - m) + '}';
          return XP(t(pr), tg, {}, 'Product law: ' + t(pr + '=' + k + '^{' + m + '+(-' + n + ')}=' + pwx(k, m - n) + '=' + tg), ['Add the exponents (one is negative), then write the result with a positive exponent.'], 'simplify ' + pr,
            known([['\\frac{1}{' + pw(k, m * n) + '}', 'mult-exp', 'Multiplying powers: <b>add</b> the exponents.'], [pw(k, m + n), 'sign-exp', 'Watch the sign: ' + t(m + '+(-' + n + ')=' + (m - n)) + '.']], tg));
        } },
        { id: '11b', outcome: 'AN3', level: 'BEG', make: function (r) {
          var z = r.pick(LET), kind = r.pick(['np', 'pp']), a = r.int(2, 5), b = r.int(3, 10), pr, e;
          if (kind === 'np') { pr = '\\dfrac{' + pwx(z, -a) + '}{' + pw(z, b) + '}'; e = -a - b; } else { a = r.int(2, 6); b = r.int(a + 2, 12); pr = '\\dfrac{' + pw(z, a) + '}{' + pw(z, b) + '}'; e = a - b; }
          var tg = '\\frac{1}{' + pw(z, -e) + '}', top = kind === 'np' ? -a : a;
          return XP(t(pr), tg, {}, 'Quotient law: ' + t(pr + '=' + z + '^{' + top + '-' + b + '}=' + pwx(z, e) + '=' + tg), ['Subtract the exponents: top minus bottom.', 'A negative result means the power goes in the denominator.'], 'simplify ' + pr,
            known([top + b !== 0 ? [pw(z, top + b), 'law-added', 'Dividing: <b>subtract</b> the exponents.'] : null, kind === 'np' && b !== a ? [pw(z, b - a), 'sign-exp', 'Watch the signs: ' + t('-' + a + '-' + b + '=' + (-a - b)) + '.'] : null], tg));
        } }] },
      { num: '12', outcome: 'AN3', stem: 'Simplify. Write each answer with positive exponents.', shared: function (r) { return { kinds: r.shuffle(['quot', 'powneg', 'powprod', 'powquot']), ls: r.sample(PAIRS, 4) }; },
        parts: [0, 1, 2, 3].map(function (i) { return { id: '12' + 'abcd'[i], outcome: 'AN3', level: 'PRG', make: function (r, s) { return q12Part(r, s.kinds[i], s.ls[i]); } }; }) },
      { num: '13', outcome: 'AN3', parts: [
        { id: '13', outcome: 'AN3', level: 'PRG', make: function (r) {
          var g = find(function () { var b = r.int(2, 6), e1 = r.pick([1, 1, 2]), c = r.int(2, 5), e2 = r.pick([2, 2, 1]); return { b: b, e1: e1, c: c, e2: e2, flip: r.chance(0.3) }; },
            function (g) { var B = Math.pow(g.b, g.e1), Cc = Math.pow(g.c, g.e2); return g.b !== g.c && B <= 25 && ((B + 1) * Cc) % B !== 0; });
          var B = Math.pow(g.b, g.e1), C = Math.pow(g.c, g.e2), V = Q((B + 1) * C, B);
          var numT = g.flip ? g.b + '^{0}+' + g.b + '^{-' + g.e1 + '}' : g.b + '^{-' + g.e1 + '}+' + g.b + '^{0}', pr = '\\dfrac{' + numT + '}{' + g.c + '^{-' + g.e2 + '}}';
          return VAL('Evaluate without a calculator: ' + t(pr), V, [[C / B, 'zero-power', 'Anything (except 0) to the power ' + t(0) + ' is ' + t(1) + ', not ' + t(0) + ': ' + t(g.b + '^{0}=1') + '.'], [(B + 1) / B / C, 'div-neg', 'Dividing by ' + t(g.c + '^{-' + g.e2 + '}=\\frac{1}{' + C + '}') + ' is the same as <b>multiplying</b> by ' + t(C) + '.'], [B / (B + 1) / C, 'flip', 'Your answer is upside down: dividing by ' + t('\\frac{1}{' + C + '}') + ' multiplies by ' + t(C) + '.'], [(1 + B) * C, 'u2t-opposite', 'Check ' + t(g.b + '^{-' + g.e1 + '}') + ': it is ' + t('\\frac{1}{' + B + '}') + '.']],
            'Numerator: ' + t(numT + '=' + (g.flip ? '1+\\frac{1}{' + B + '}' : '\\frac{1}{' + B + '}+1') + '=\\frac{' + (B + 1) + '}{' + B + '}') + '. Denominator: ' + t(g.c + '^{-' + g.e2 + '}=\\frac{1}{' + C + '}') + '.<br>' + t('\\frac{' + (B + 1) + '}{' + B + '}\\div\\frac{1}{' + C + '}=\\frac{' + (B + 1) + '}{' + B + '}\\times ' + C + '=' + nT(V)),
            ['Work out the numerator and the denominator separately: ' + t('a^{-n}=\\frac{1}{a^{n}}') + ' and ' + t('a^{0}=1') + '.', 'Dividing by a fraction is multiplying by its reciprocal.'], 'evaluate ' + pr);
        } }] },
      { num: '14', outcome: 'AN3', stem: '<b>True or false?</b> Justify each answer.', shared: q14Shared,
        parts: [0, 1, 2].map(function (i) { return { id: '14' + 'abc'[i], outcome: 'AN3', level: 'MAS', make: function (r, s) { return q14Part(q14Claim(r, s.kinds[i], s.truths[i])); } }; }) },
      { num: '15', outcome: 'AN3', shared: q15Shared,
        stem: function (g) { var L = q15Lines(g); return g.who + ' simplified ' + t(L.orig) + ' like this:\\[' + L.orig + '\\ \\overset{\\text{Step 1}}{=}\\ ' + L.l1 + '\\ \\overset{\\text{Step 2}}{=}\\ ' + L.l2 + '\\]'; },
        parts: [
          { id: '15a', outcome: 'AN3', level: 'MAS', make: function (r, g) {
            var u = g.u, L = q15Lines(g), KN = Math.pow(g.k, g.n), pn = g.p * g.n;
            return selectPart(r, 'There are <b>two</b> errors in ' + g.who + '’s work. Select each one.', [
              { value: 'e1', right: true, html: 'Step 1: ' + t(g.k + '^{-' + g.n + '}') + ' was worked out as ' + t(g.k + '\\times(-' + g.n + ')') + '. A negative exponent means <b>reciprocal</b>, not multiply.' },
              { value: 'e2', right: true, html: 'Step 2: the exponents of ' + t(u) + ' were <b>multiplied</b>; when multiplying powers, add the exponents.' },
              { value: 'd1', html: 'Step 1: the exponent of ' + t(u) + ' should still be <b>negative</b>.', why: t('(-' + g.p + ')\\times(-' + g.n + ')=+' + pn) + ', so ' + t(pw(u, pn)) + ' is right.' },
              { value: 'd2', html: 'Step 2: the coefficients should have been <b>added</b>.', why: 'Coefficients are <b>multiplied</b>. The real problem with the coefficient is in Step 1.' },
              { value: 'd3', html: 'Step 1: the exponent ' + t(-g.n) + ' applies only to ' + t(pwx(u, -g.p)) + ', so the ' + t(g.k) + ' should stay ' + t(g.k) + '.', why: 'The exponent is outside the bracket, so it applies to the ' + t(g.k) + ' too.' }],
              '1. Step 1: ' + t(g.k + '^{-' + g.n + '}=\\frac{1}{' + KN + '}') + ', not ' + t('-' + g.k * g.n) + ': a negative exponent means reciprocal, not multiply.<br>2. Step 2: ' + t(pw(u, pn) + '\\cdot ' + pw(u, g.q) + '=' + pw(u, pn + g.q)) + ': add the exponents when multiplying.<br>Correct: ' + t('\\frac{1}{' + KN + '}' + pw(u, pn) + '\\cdot ' + g.m + pw(u, g.q) + '=' + posTex(L.right)),
              ['Redo each step yourself and compare.', 'What does a negative exponent on a number mean? How do exponents combine when you multiply?'], 'errors in ' + L.orig);
          } },
          { id: '15b', outcome: 'AN3', level: 'MAS', make: function (r, g) {
            var u = g.u, L = q15Lines(g), tg = posTex(L.right), KN = Math.pow(g.k, g.n), pn = g.p * g.n;
            var kn = kmono([[M(-g.k * g.n * g.m, [[u, pn * g.q]]), 'u2t-repeat', 'That is ' + g.who + '’s answer. Fix the two errors.'],
              [M(-g.k * g.n * g.m, [[u, pn + g.q]]), 'u2t-times-exp', t(g.k + '^{-' + g.n + '}') + ' is ' + t('\\frac{1}{' + KN + '}') + ', not ' + t('-' + g.k * g.n) + '.'],
              [M(g.m * KN, [[u, pn + g.q]]), 'coef-pos-power', t(g.k + '^{-' + g.n + '}=\\frac{1}{' + KN + '}') + ': the ' + t(KN) + ' goes in the <b>denominator</b>.'],
              [M(Q(g.m, KN), [[u, pn * g.q]]), 'mult-exp', 'Multiplying powers: <b>add</b> the exponents.']], tg);
            return XP('Write the correct simplified answer for ' + t(L.orig) + ', with positive exponents.', tg, {}, t(L.orig + '=\\frac{1}{' + KN + '}' + pw(u, pn) + '\\cdot ' + g.m + pw(u, g.q) + '=\\frac{' + g.m + pw(u, pn + g.q) + '}{' + KN + '}' + (gcd(g.m, KN) > 1 ? '=' + tg : '')),
              ['Raise each factor in the bracket to the power ' + t(-g.n) + ': ' + t(g.k + '^{-' + g.n + '}=\\frac{1}{' + KN + '}') + '.', 'Then multiply the numbers, add the exponents, and reduce the fraction.'], 'correct ' + L.orig, kn);
          } }] },
      { num: '16', outcome: 'AN3', shared: q16Shared, parts: [
        { id: '16', outcome: 'AN3', level: 'MAS', make: function (r, g) {
          var b = g.b, X = Math.pow(b, g.i), Y = Math.pow(b, g.j), V = Math.pow(b, g.e);
          var pr = '\\dfrac{' + X + '^{-' + g.a1 + '}\\cdot ' + b + '^{' + g.v + '}}{' + Y + '^{-' + g.a2 + '}}';
          var e1 = -g.a1 * g.i + g.v - g.a2 * g.j, e2 = -g.a1 + g.v + g.a2;
          var p = P.fields('Evaluate without a calculator by first writing every factor as a power of ' + t(b) + ': ' + t(pr), [{ name: 'Single power', label: 'As a single power of ' + t(b) + ':', mode: 'math', keys: 'expr' }, { name: 'Value', label: 'Value:', mode: 'math', keys: 'fraction' }],
            [powOfChk(b, g.e, [[e1, 'sign-exp', 'Dividing by ' + t(b + '^{' + (-g.a2 * g.j) + '}') + ' <b>subtracts</b> a negative exponent, which adds it: ' + t('-(' + (-g.a2 * g.j) + ')=+' + g.a2 * g.j) + '.'], [e2, 'u2t-base-power', 'First write ' + t(X + '=' + b + '^{' + g.i + '}') + ' and ' + t(Y + '=' + b + '^{' + g.j + '}') + ', then use the power of a power law.']]),
              K.fraction(V, { diag: numKnown([[Math.pow(b, e1), 'sign-exp', 'Check the exponent: subtracting a negative exponent adds it.'], [Math.pow(b, e2), 'u2t-base-power', 'Write every factor as a power of ' + t(b) + ' first.'], [b * g.e, 'u2t-times-exp', t(b + '^{' + g.e + '}') + ' means ' + g.e + ' factors of ' + t(b) + '.']], V) })],
            [b + '^{' + g.e + '}', String(V)], t(pr + '=' + b + '^{' + g.e + '}=' + V),
            t(X + '=' + b + '^{' + g.i + '}') + ' and ' + t(Y + '=' + b + '^{' + g.j + '}') + ', so<br>' + t(pr + '=\\dfrac{' + b + '^{' + (-g.a1 * g.i) + '}\\cdot ' + b + '^{' + g.v + '}}{' + b + '^{' + (-g.a2 * g.j) + '}}=' + b + '^{' + (-g.a1 * g.i) + '+' + g.v + '-(' + (-g.a2 * g.j) + ')}=' + b + '^{' + g.e + '}=' + V),
            ['Write ' + t(X) + ' and ' + t(Y) + ' as powers of ' + t(b) + ', then use the power of a power law.', 'Add the exponents on top, subtract the one below (careful: it is negative).'], 'common base ' + pr);
          p.bad = [[b + '^{' + e1 + '}', nT(Q(Math.pow(b, e1) < 1 ? [1, Math.pow(b, -e1)] : [Math.pow(b, e1), 1]))]]; if (b * g.e !== V) p.bad.push([b + '^{' + g.e + '}', String(b * g.e)]);
          return p;
        } }] },

      /* ======================= AN3 · Part 3: rational exponents and radicals ======================= */
      { num: '17', outcome: 'AN3', stem: 'Write each power in radical form.', shared: function (r) { return { kinds: r.shuffle(['mn', 'neg', 'coef']), vs: r.sample(['x', 'y', 'm', 'k', 'a', 'b', 'p', 't', 'n', 'w'], 3) }; },
        parts: [0, 1, 2].map(function (i) { return { id: '17' + 'abc'[i], outcome: 'AN3', level: 'BEG', make: function (r, s) { return q17Part(r, s.kinds[i], s.vs[i]); } }; }) },
      { num: '18', outcome: 'AN3', stem: 'Write each radical as a power with a rational exponent.', shared: function (r) { return { kinds: r.shuffle(['pos', 'sqrt', 'recip']), vs: r.sample(['x', 'y', 'k', 'w', 'z', 'h', 'p', 'q', 'a', 'b'], 3) }; },
        parts: [0, 1, 2].map(function (i) { return { id: '18' + 'abc'[i], outcome: 'AN3', level: 'BEG', make: function (r, s) { return q18Part(r, s.kinds[i], s.vs[i]); } }; }) },
      { num: '19', outcome: 'AN3', stem: 'Evaluate without a calculator.', parts: [
        { id: '19a', outcome: 'AN3', level: 'BEG', make: function (r) { var s = r.int(4, 25); return EV({ base: [s * s, 1], m: 1, n: 2 }); } },
        { id: '19b', outcome: 'AN3', level: 'BEG', make: function (r) { var g = r.pick(Q19NEG); return EV({ base: [g[0], g[1]], m: 1, n: g[2] }); } },
        { id: '19c', outcome: 'AN3', level: 'BEG', make: function (r) { var g = r.pick(Q19ROOT); return EV({ base: [g[0], 1], m: 1, n: g[1] }); } }] },
      { num: '20', outcome: 'AN3', stem: 'Evaluate without a calculator.', parts: [
        { id: '20a', outcome: 'AN3', level: 'PRG', make: function (r) {
          var g = find(function () { var n = r.pick([2, 3, 4, 5]), c = r.int(2, n === 2 ? 10 : n === 3 ? 5 : 3), m = r.int(2, n + 2); return { n: n, c: c, m: m }; }, function (g) { return cop(g.m, g.n) && Math.pow(g.c, g.m) <= 1000 && Math.pow(g.c, g.n) <= 1000 && !(g.n === 2 && g.m > 3); });
          return EV({ base: [Math.pow(g.c, g.n), 1], m: g.m, n: g.n });
        } },
        { id: '20b', outcome: 'AN3', level: 'PRG', make: function (r) {
          var g = find(function () { var n = r.pick([3, 3, 3, 5]), c = r.int(2, n === 3 ? 10 : 3), m = r.pick([2, 2, 4, 5, 7, 8]); return { n: n, c: c, m: m }; }, function (g) { return cop(g.m, g.n) && Math.pow(g.c, g.m) <= 256; });
          return EV({ base: [-Math.pow(g.c, g.n), 1], m: g.m, n: g.n });
        } },
        { id: '20c', outcome: 'AN3', level: 'PRG', make: function (r) {
          var g = find(function () { var n = r.pick([2, 2, 3, 4]), c = r.int(2, n === 2 ? 10 : n === 3 ? 5 : 3), m = r.int(1, 3); return { n: n, c: c, m: m }; }, function (g) { return cop(g.m, g.n) && Math.pow(g.c, g.m) <= 125 && !(g.m === 1 && g.n === 2 && g.c < 4); });
          return EV({ base: [Math.pow(g.c, g.n), 1], m: -g.m, n: g.n });
        } }] },
      { num: '21', outcome: 'AN3', stem: 'Simplify, using positive exponents. If an exponent is a fraction, also give the answer in radical form.', shared: function (r) { return { kinds: r.shuffle(['prod', 'quot', 'powcoef', 'powpow']), vs: r.sample(['x', 'y', 'w', 'a', 'b', 'c', 'm', 'z', 'r', 's', 'g'], 4) }; },
        parts: [0, 1, 2, 3].map(function (i) { return { id: '21' + 'abcd'[i], outcome: 'AN3', level: 'PRG', make: function (r, s) { return q21Part(r, s.kinds[i], s.vs[i]); } }; }) },
      { num: '22', outcome: 'AN3', parts: [
        { id: '22', outcome: 'AN3', level: 'PRG', make: function (r) {
          var g = find(function () { var n = r.pick([2, 3, 3, 4]), a = r.int(2, n === 2 ? 9 : n === 3 ? 5 : 3); return { n: n, a: a, m: r.int(n + 1, 2 * n + 3) }; }, function (g) { return cop(g.m, g.n); });
          var x = r.pick(['x', 'y', 'm', 'w', 'k', 'z']), C = Math.pow(g.a, g.n), pr = rootT(g.n, C + pw(x, g.m)), tg = g.a + x + '^{\\frac{' + g.m + '}{' + g.n + '}}';
          var kn = known([[C + x + '^{\\frac{' + g.m + '}{' + g.n + '}}', 'coef-root', 'Take the ' + rootName(g.n) + ' root of ' + t(C) + ' too: ' + t(rootT(g.n, C) + '=' + g.a) + '.'], [g.a + x + '^{\\frac{' + g.n + '}{' + g.m + '}}', 'index-power', 'The index ' + t(g.n) + ' is the <b>denominator</b> of the exponent; the power ' + t(g.m) + ' is the numerator.'], [g.a + pw(x, g.m * g.n), 'u2t-times-exp', 'A root divides the exponent by the index.']], tg);
          return XP('Write ' + t(pr) + ' in the form ' + t('a' + x + '^{n}') + ', where ' + t('a\\in I') + ' and ' + t('n\\in Q') + '.', tg, { form: 'power' }, t(pr + '=' + C + '^{\\frac{1}{' + g.n + '}}' + x + '^{\\frac{' + g.m + '}{' + g.n + '}}=' + tg) + ' (because ' + t(g.a + '^{' + g.n + '}=' + C) + ').',
            ['The ' + rootName(g.n) + ' root applies to every factor: ' + t(rootT(g.n, 'ab') + '=' + rootT(g.n, 'a') + '\\cdot ' + rootT(g.n, 'b')) + '.', 'For the letter, the index becomes the denominator of the exponent.'], 'write ' + pr + ' as ax^n', kn);
        } }] },
      { num: '23', outcome: 'AN3', stem: 'Evaluate. Show your steps.', parts: [
        { id: '23a', outcome: 'AN3', level: 'MAS', make: function (r) {
          var g = find(function () { var n = r.pick([2, 3, 3, 4]), a = r.int(2, n === 2 ? 9 : n === 3 ? 5 : 3), b = r.int(2, n === 2 ? 9 : n === 3 ? 5 : 3), m = r.int(1, 3); return { n: n, a: a, b: b, m: m }; },
            function (g) { return g.a !== g.b && cop(g.a, g.b) && cop(g.m, g.n) && g.m > 1 && Math.pow(Math.max(g.a, g.b), g.m) <= 216; });
          return EV({ base: [Math.pow(g.a, g.n), Math.pow(g.b, g.n)], m: -g.m, n: g.n, btex: '\\left(\\dfrac{' + Math.pow(g.a, g.n) + '}{' + Math.pow(g.b, g.n) + '}\\right)', pre: 'A negative exponent flips the fraction: ' + t('\\left(\\dfrac{' + Math.pow(g.a, g.n) + '}{' + Math.pow(g.b, g.n) + '}\\right)^{' + expS(-g.m, g.n) + '}=\\left(\\dfrac{' + Math.pow(g.b, g.n) + '}{' + Math.pow(g.a, g.n) + '}\\right)^{' + expS(g.m, g.n) + '}=\\left(\\dfrac{' + rootT(g.n, Math.pow(g.b, g.n)) + '}{' + rootT(g.n, Math.pow(g.a, g.n)) + '}\\right)^{' + g.m + '}=\\left(\\dfrac{' + g.b + '}{' + g.a + '}\\right)^{' + g.m + '}=' + nT(Q(Math.pow(g.b, g.m), Math.pow(g.a, g.m)))) + '.' });
        } },
        { id: '23b', outcome: 'AN3', level: 'MAS', make: function (r) {
          var g = find(function () { var n = r.pick([2, 2, 3, 4]), a = r.int(1, 3), d = r.pick([2, 4, 5, 10]); return { n: n, a: a, d: d, m: r.int(1, 3) }; },
            function (g) { var den = Math.pow(g.d, g.n), dec = Math.pow(g.a, g.n) / den; return g.a < g.d && cop(g.a, g.d) && cop(g.m, g.n) && den <= 10000 && String(dec).length <= 7 && Math.pow(g.d, g.m) <= 1000 && !(g.m === 1 && g.n === 2 && g.a === 1) && Math.pow(g.a, g.m) <= 27; });
          var num = Math.pow(g.a, g.n), den = Math.pow(g.d, g.n), dec = String(num / den);
          return EV({ base: [num, den], m: -g.m, n: g.n, btex: '(' + dec + ')', sbtex: '\\left(\\dfrac{' + num + '}{' + F(den) + '}\\right)', pre: 'Write the decimal as a fraction: ' + t(dec + '=\\dfrac{' + num + '}{' + F(den) + '}') + '. Then flip it for the negative exponent: ' + t('\\left(\\dfrac{' + num + '}{' + F(den) + '}\\right)^{' + expS(-g.m, g.n) + '}=\\left(\\dfrac{' + F(den) + '}{' + num + '}\\right)^{' + expS(g.m, g.n) + '}') + '.' });
        } }] },
      { num: '24', outcome: 'AN3', shared: q24Shared, stem: function (g) { return 'Simplify. Write the answer with positive exponents.\\[' + q24Prompt(g) + '\\]'; }, parts: [
        { id: '24', outcome: 'AN3', level: 'MAS', make: function (r, g) {
          var u = g.u, w = g.w, In = M(g.C, [[u, g.U], [w, g.W]]), A = mpow(In, g.e), tg = posTex(A), inT = rawTex(In), inPos = posTex(In);
          var kin = kmono([[M(g.C, [[u, g.a1 + g.a2], [w, qadd(g.b1, g.b2)]]), 'law-added', 'Dividing: <b>subtract</b> the exponents of the denominator.']], inPos);
          var kfin = kmono([[minv(A), 'recip', 'The outside exponent is <b>negative</b>, so the result is the reciprocal of ' + t(br(inPos) + '^{' + expS(g.j, g.d) + '}') + '.'],
            [M(Math.pow(g.k, g.j), A.v), 'coef-recip', t(g.C + '^{' + expS(-g.j, g.d) + '}=\\frac{1}{' + Math.pow(g.k, g.j) + '}') + ': the coefficient goes in the denominator.'],
            [M(qpow(g.C, [g.j, g.d]), A.v.map(function (p) { return [p[0], qmul(p[1], -1)]; })), 'recip', 'Apply the <b>negative</b> exponent: multiply each exponent by ' + t(expS(-g.j, g.d)) + '.']], tg);
          var finChk = EX(tg, { diag: kfin }), radAlt = EX(radTex(A), { form: 'radical' });
          var fin = function (resp) { var res = finChk(resp); if (res.v === 'form' && res.code === 'not-power') { var r2 = radAlt(resp); if (r2.v === 'correct') return r2; } return res; };
          var vs = [u, w];
          var p = P.fields('Simplify inside the brackets first, then apply the outside exponent ' + t(expS(-g.j, g.d)) + '.',
            [{ name: 'Inside', label: 'Inside the brackets:', mode: 'math', keys: 'expo', vars: vs }, { name: 'Answer', label: 'Answer:', mode: 'math', keys: 'expo', vars: vs }],
            [EX(inPos, { positive: false, diag: kin }), fin], [inT, tg], 'Inside: ' + t(inT) + '; answer ' + t(tg) + (hasFracExp(A) ? ' ' + t('=' + radTex(A)) : ''),
            'Inside first (divide the numbers, subtract the exponents): ' + t(g.C + u + '^{' + g.a1 + '-' + pT(g.a2) + '}' + w + '^{' + eT(g.b1) + '-' + pT(g.b2) + '}=' + inT) + '.<br>Then every factor gets the exponent ' + t(expS(-g.j, g.d)) + ': ' + t(br(inT) + '^{' + expS(-g.j, g.d) + '}=' + g.C + '^{' + expS(-g.j, g.d) + '}' + A.v.map(function (p) { return pwx(p[0], p[1]); }).join('') + '=' + rawTex(A) + '=' + tg) + ' (' + t(g.C + '^{' + expS(g.j, g.d) + '}=' + br(rootT(g.d, g.C)) + (g.j > 1 ? '^{' + g.j + '}' : '') + '=' + Math.pow(g.k, g.j)) + ').' + (hasFracExp(A) ? '<br>In radical form: ' + t(tg + '=' + radTex(A)) + '.' : ''),
            ['Simplify inside the brackets: subtract the exponents of the denominator (work with the fractions exactly).', 'Then multiply every exponent by ' + t(expS(-g.j, g.d)) + ', and use ' + t(g.C + '=' + g.k + '^{' + g.d + '}') + '.'], 'simplify ' + q24Prompt(g));
          p.bad = kin.texs.map(function (x) { return [x, tg]; }).concat(kfin.texs.map(function (x) { return [inT, x]; }));
          return p;
        } }] },
      { num: '25', outcome: 'AN3', shared: q25Shared, stem: function (g) { return 'Explain why ' + t('(-' + g.b1 + ')^{' + expS(g.m1, g.n1) + '}') + ' is <b>not</b> a real number but ' + t('(-' + g.b2 + ')^{' + expS(g.m2, g.n2) + '}') + ' <b>is</b>. Evaluate the real one.'; }, parts: [
        { id: '25a', outcome: 'AN3', level: 'MAS', make: function (r, g) {
          var A1 = '(-' + g.b1 + ')^{' + expS(g.m1, g.n1) + '}', A2 = '(-' + g.b2 + ')^{' + expS(g.m2, g.n2) + '}', R1 = br(rootT(g.n1, '-' + g.b1)) + (g.m1 > 1 ? '^{' + g.m1 + '}' : ''), R2 = br(rootT(g.n2, '-' + g.b2)) + '^{' + g.m2 + '}';
          var items = [
            { value: 't1', right: true, html: t(A1 + '=' + R1) + ' is an <b>even</b> root of a negative number. No real number to the power ' + t(g.n1) + ' is negative, so it is not real.' },
            { value: 't2', right: true, html: t(A2 + '=' + R2) + ': an <b>odd</b> root of a negative number exists, so it is real.' },
            { value: 'd1', html: 'A negative base with a fractional exponent is never a real number.', why: 'Odd roots of negatives exist: ' + t(rootT(g.n2, '-' + g.b2) + '=-' + g.c2) + '. It is the <b>index</b> (the denominator) that decides.' },
            { value: 'd2', html: t(A1) + ' is not real because its numerator ' + t(g.m1) + ' is odd.', why: 'The numerator is just a power. What matters is the <b>denominator</b> ' + t(g.n1) + ': an even root of a negative.' },
            { value: 'd3', html: t(A2) + ' is real because its numerator ' + t(g.m2) + ' is ' + (g.m2 % 2 ? 'odd' : 'even') + '.', why: 'The numerator doesn’t decide whether it is real; the <b>denominator</b> ' + t(g.n2) + ' (the index) does: an odd root of a negative exists.' },
            { value: 'd4', html: t(A1 + '=-\\left(' + g.b1 + '^{' + expS(g.m1, g.n1) + '}\\right)') + ', so it is real.', why: 'The brackets make ' + t('-' + g.b1) + ' the base; the minus sign can’t be taken outside.' }];
          return selectPart(r, 'Select <b>every</b> correct reason.', items,
            t(A1 + '=' + R1) + ': an even root of a negative number. No real number to an even power is negative, so it is <b>not real</b>.<br>' + t(A2 + '=' + R2) + ': an odd root of a negative exists, ' + t(rootT(g.n2, '-' + g.b2) + '=-' + g.c2) + ', so it is real.',
            ['Look at the denominator of each exponent: it is the index of the root.', 'Can an even power of a real number be negative? Can an odd power?'], 'why not real: ' + A1 + ' vs ' + A2, { decoy: 'u2t-reason-decoy', one: 'u2t-reason-missed', more: 'u2t-reason-missed' });
        } },
        { id: '25b', outcome: 'AN3', level: 'MAS', make: function (r, g) {
          var A1 = '(-' + g.b1 + ')^{' + expS(g.m1, g.n1) + '}', A2 = '(-' + g.b2 + ')^{' + expS(g.m2, g.n2) + '}', V = g.v2;
          var kn = numKnown([[-V, 'sign', 'Check the sign: ' + t(rootT(g.n2, '-' + g.b2) + '=-' + g.c2) + ', and ' + (g.m2 % 2 ? 'an odd power keeps it negative.' : 'an even power makes it positive.')], [Math.pow(g.b2, g.m2) <= 1e6 ? Math.pow(-g.b2, g.m2) : NaN, 'u2t-no-root', 'The denominator ' + t(g.n2) + ' means take the ' + rootName(g.n2) + ' root first.'], [rpow(-g.b2, g.n2, g.m2), 'index-power', 'The denominator is the index of the root, the numerator the power.']], V);
          var p = P.fields('Give the value of each power, or <b>none</b> if it is not a real number.', [{ name: 'First', label: t(A1) + ' =', mode: 'math', keys: 'fraction', none: true }, { name: 'Second', label: t(A2) + ' =', mode: 'math', keys: 'fraction', none: true }],
            [noneOr({ defined: false, valWhy: t(A1) + ' needs the ' + rootName(g.n1) + ' root of ' + t('-' + g.b1) + ', and no real number to an even power is negative. Press <b>none</b>.' }),
              noneOr({ defined: true, check: K.fraction(V, { diag: kn }), noneWhy: 'The index ' + t(g.n2) + ' is odd, so the root of a negative exists: ' + t(rootT(g.n2, '-' + g.b2) + '=-' + g.c2) + '.' })],
            ['none', String(V)], t(A1) + ': <b>not real</b>; ' + t(A2 + '=' + V),
            t(A1 + '=' + br(rootT(g.n1, '-' + g.b1)) + (g.m1 > 1 ? '^{' + g.m1 + '}' : '')) + ': not real (even root of a negative).<br>' + t(A2 + '=' + br(rootT(g.n2, '-' + g.b2)) + '^{' + g.m2 + '}=(-' + g.c2 + ')^{' + g.m2 + '}=' + V),
            ['Take the root first (the denominator is the index), then the power.'], 'values ' + A1 + ', ' + A2);
          p.bad = [[String(-Math.pow(iroot(g.b1, g.n1), g.m1)), String(V)], ['none', 'none'], ['none', String(-V)]];
          return p;
        } }] }
    ]
  });

  /* ---------- part makers used above (function declarations are hoisted) ---------- */
  function q9Zero(c, brk) {
    if (brk) {
      var pb = '(-' + c + ')^{0}';
      return INT(t(pb), 1, [[-1, 'u2t-zero-neg', 'With brackets, the base is ' + t('-' + c) + ', and any nonzero base to the power ' + t(0) + ' is ' + t(1) + '.'], [0, 'zero-power', 'A power with exponent ' + t(0) + ' is ' + t(1) + ', not ' + t(0) + '.'], [-c, 'u2t-zero-base', 'The exponent ' + t(0) + ' doesn’t leave the base unchanged: ' + t('a^{0}=1') + '.']],
        'The brackets make ' + t('-' + c) + ' the base, and any nonzero base to the power ' + t(0) + ' is ' + t(1) + ': ' + t(pb + '=1') + '.', ['Any nonzero base to the power ' + t(0) + ' is ' + t(1) + '. What is the base here?'], 'evaluate ' + pb);
    }
    var pm = '-' + c + '^{0}';
    return INT(t(pm), -1, [[1, 'neg-zero', 'Without brackets the exponent applies only to ' + t(c) + ': ' + t(pm + '=-\\left(' + c + '^{0}\\right)=-1') + '.'], [0, 'zero-power', 'A power with exponent ' + t(0) + ' is ' + t(1) + ', not ' + t(0) + '.'], [-c, 'u2t-zero-base', t(c + '^{0}=1') + ', not ' + t(c) + '.']],
      'The exponent belongs to ' + t(c) + ' only, and the minus sign stays: ' + t(pm + '=-\\left(' + c + '^{0}\\right)=-1') + '.', ['Is the minus sign part of the base? Without brackets, it isn’t.'], 'evaluate ' + pm);
  }
  function q24Prompt(g) {
    var u = g.u, w = g.w;
    return '\\left(\\dfrac{' + g.C + pw(u, g.a1) + pw(w, g.b1) + '}{' + pw(u, g.a2) + pw(w, g.b2) + '}\\right)^{' + expS(-g.j, g.d) + '}';
  }
})(window);
