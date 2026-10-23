/* Math 10C · Unit 4 · Lesson 1 — Common Factors: The GCF of Monomials and Polynomials (AN5)
 * Assignment questions 1–23 (u4_L01.tex: Part A 1–13, Part B 14–18, Part C Extension 19–23) and the Extra Practice
 * questions of u4_EP01.tex that belong to Lesson 1 (GCFs of monomials and polynomials, negative and fractional/decimal
 * common factors): EP 1–6, 11, 12, 14, 15, 18, 19, 20. (EP 7–10, 13, 16, 17 — binomial common factors and grouping —
 * belong to Lesson 2.)
 * Every part is a generator: it keeps the structure of the booklet question (number of terms and letters, a letter
 * missing from a term, signs, a term equal to the GCF, fractional or decimal coefficients) and changes the numbers;
 * the booklet's own numbers are one of the possible values. Keys are built from the generated factors, so the
 * factored key always expands to the question. Levels: LIM BEG EMG PRG ADV MAS.
 * Conversions: "write the prime factorization" → typed products of primes and letters; "fill in the blank" → a box
 * between the given parts; "explain" / "identify the error" → multiple choice (a hint for each wrong option) plus the
 * corrected factorization; "expand to verify" → shown in the solution; table of heights → several boxes.
 * π is carried as the letter Q inside polynomials (the keypad has a π key; π, \pi and pi typed by the student are read). */
(function (root) {
  'use strict';
  var HW = root.HW, F = HW.fmt, K = HW.kit, KP = K.P, PL = HW.poly, FA = HW.factor, ex = HW.ex, nt = HW.nt,
    t = K.t, ok = K.ok, wrong = K.wrong, form = K.form;

  HW.addCodes({
    'max-exp': 'GCF: used the highest power instead of the lowest', 'missing-var': 'GCF: included a letter missing from a term',
    'neg-rule': 'GCF: positive although every term is negative', 'neg-mixed': 'GCF: negative although the signs are mixed',
    'not-mono': 'GCF given as more than one term', 'not-greatest': 'A common factor, but not the greatest', 'gcf-coef': 'GCF coefficient doesn’t divide every coefficient',
    'drop-var': 'GCF: left out a common letter', 'drop-one': 'Dropped the 1 left by a term equal to the GCF', 'neg-signs': 'Negative factor: signs inside the bracket not all changed',
    'neg-factor': 'Didn’t take out a negative common factor', 'pos-factor': 'Took out a negative factor when a positive one was asked',
    'not-product': 'Prime factorization not written as a product', composite: 'Composite number left in a prime factorization', 'pf-coef': 'Prime factors multiply to the wrong number',
    'pf-vars': 'Wrong letters in a prime factorization', 'kept-error': 'Repeated the error being corrected', diam: 'Used the diameter as the radius',
    'one-base': 'Cylinder: only one circular base', 'frac-div': 'Divided by a fraction incorrectly', half: 'Lost the ½ in the formula', same: 'Gave the same answer twice',
    'not-factor': 'Factor doesn’t give the polynomial when expanded', 'kept-var': 'Kept a letter that divides out', 'no-divide': 'Didn’t divide by the common factor',
    'gcf-high': 'GCF exponent too high', 'pi-inside': 'π left inside the bracket', 'first-only': 'Multiplied only the first term in the bracket',
    'neg-first': 'Negative monomial: sign applied to the first term only', 'nr-sum': 'Added the wrong quantities', 'c-sign': 'Ignored the sign of c',
    'frac-bracket': 'Fraction or decimal left inside the bracket'
  });

  /* ---------- small helpers ---------- */
  function M(c, v) { return PL.mono(c, v || {}); }
  function N(c) { return PL.num(c); }
  function tx(p, o) { return PL.tex(p, o); }
  function sum(list) { return PL.add.apply(null, list); }
  function seq(list, dec) { var out = ''; list.forEach(function (x) { var s = PL.tex(x, dec ? { dec: true } : undefined); if (s === '0') return; out += out && s.charAt(0) !== '-' ? '+' + s : s; }); return out || '0'; }
  function cOf(m) { var T = PL.terms(m)[0]; return T ? T.c : [0, 1]; }
  function vOf(m) { var T = PL.terms(m)[0]; return T ? T.v : {}; }
  function cv(m) { var c = cOf(m); return c[0] / c[1]; }
  function isNeg(m) { return cOf(m)[0] < 0; }
  function gcd(a, b) { return ex.gcd(Math.abs(a), Math.abs(b)); }
  function gcdA(arr) { return arr.reduce(function (g, x) { return gcd(g, x); }, 0); }
  function lcm(a, b) { return a / gcd(a, b) * b; }
  function pickWhere(gen, test) { for (var i = 0; i < 4000; i++) { var v = gen(); if (test(v)) return v; } throw new Error('pickWhere failed'); }
  function piT(s) { return String(s).replace(/Qh(r(\^\{\d+\})?)/g, 'Q$1h').replace(/Q/g, '\\pi '); } // π first, then r before h (πr²h)
  function piIn(s) { return String(s == null ? '' : s).replace(/\\pi/g, 'Q ').replace(/π/g, 'Q').replace(/pi/g, 'Q'); }
  function plain(s) { return piT(s).replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '($1)/($2)').replace(/\\pi\s*/g, 'π').replace(/\\(quad|qquad|,|;)/g, ' ').replace(/\\underline\{[^}]*\}/g, '__').replace(/\\[a-z]+/g, ' ').replace(/[{}]/g, '').replace(/\s+/g, ' ').trim(); }
  /* a monomial as a factor in a product line: brackets when negative or a fraction */
  function pg(m) { var s = tx(m); return s.charAt(0) === '-' || /frac/.test(s) ? '\\left(' + s + '\\right)' : s; }
  function gTex(g, dec) { var s = tx(g, dec ? { dec: true } : undefined); return s === '1' ? '' : s === '-1' ? '-' : s; }
  function divM(m, g) {
    var a = PL.terms(m)[0], b = PL.terms(g)[0], v = {};
    Object.keys(a.v).forEach(function (x) { var e = a.v[x] - (b.v[x] || 0); if (e) v[x] = e; });
    return M(ex.norm(a.c[0] * b.c[1], a.c[1] * b.c[0]), v);
  }
  /* letters of a list of polynomials, for the keypad (π shown as its own key) */
  function lettersOf(list) {
    var s = {}; list.forEach(function (p) { PL.vars(PL.lift(p)).forEach(function (x) { s[x] = 1; }); });
    var out = Object.keys(s).filter(function (x) { return x !== 'Q'; }).sort();
    if (s.Q) out.push('π');
    return out.length ? out : ['x'];
  }
  function dedupW(target, ws) {
    var seen = [PL.lift(target)], out = [];
    (ws || []).forEach(function (w) { if (!w || !w.is) return; var p = Array.isArray(w.is) ? FA.product(w.is) : PL.lift(w.is); if (seen.some(function (q) { return PL.eq(q, p); })) return; seen.push(p); out.push({ is: w.is, p: p, code: w.code, hint: w.hint, tex: w.tex }); });
    return out;
  }
  function lead(p) { var T = PL.sorted(PL.lift(p))[0]; return M(T.c, T.v); }
  function decStr(x) { return String(Math.round(x * 1e6) / 1e6); }

  /* ---------- the GCF of a set of monomials (integer or fractional coefficients) ---------- */
  function gcfOf(list) {
    var cs = list.map(cOf), L = cs.reduce(function (l, c) { return lcm(l, c[1]); }, 1);
    var G = gcdA(cs.map(function (c) { return c[0] * (L / c[1]); })), v = null;
    list.forEach(function (m) { var w = vOf(m); if (!v) { v = {}; Object.keys(w).forEach(function (x) { v[x] = w[x]; }); } else Object.keys(v).forEach(function (x) { v[x] = Math.min(v[x], w[x] || 0); if (!v[x]) delete v[x]; }); });
    var allNeg = cs.every(function (c) { return c[0] < 0; });
    return M(ex.norm(allNeg ? -G : G, L), v || {});
  }
  function powTex(x, e) { return (x === 'Q' ? '\\pi' : x) + (e > 1 ? '^{' + e + '}' : ''); }
  /* the reasoning lines for a GCF */
  function gcfLines(list, opt) {
    opt = opt || {};
    var cs = list.map(cOf), allV = {}, lines = [], frac = cs.some(function (c) { return c[1] !== 1; });
    list.forEach(function (m) { Object.keys(vOf(m)).forEach(function (x) { allV[x] = 1; }); });
    if (frac) {
      var L = cs.reduce(function (l, c) { return lcm(l, c[1]); }, 1), nums = cs.map(function (c) { return Math.abs(c[0] * (L / c[1])); }), G = gcdA(nums);
      lines.push('Over a common denominator of ' + t(L) + ' the coefficients are ' + t(nums.map(function (n) { return '\\tfrac{' + n + '}{' + L + '}'; }).join(',\\ ')) + '. The numerators have greatest common factor ' + t(G) + ', so the number part of the common factor is ' + t(ex.texRat(ex.norm(G, L))) + '.');
    } else {
      var ns = cs.map(function (c) { return Math.abs(c[0]); }), g = gcdA(ns);
      lines.push('Coefficients: ' + t('\\gcd(' + ns.join(',') + ')=' + g) + (g === 1 ? ' — no common number factor.' : '.'));
    }
    Object.keys(allV).sort().forEach(function (x) {
      var miss = list.filter(function (m) { return !vOf(m)[x]; });
      if (miss.length) lines.push(t(powTex(x, 1)) + ' is missing from ' + t(piT(tx(miss[0]))) + ', so it is not common.');
      else if (x === 'Q') lines.push(t('\\pi') + ' is in every term.');
      else { var e = Math.min.apply(null, list.map(function (m) { return vOf(m)[x]; })); lines.push(t(x) + ': the lowest power is ' + t(powTex(x, e)) + '.'); }
    });
    var neg = list.filter(isNeg).length;
    if (opt.signNote) lines.push(opt.signNote);
    else if (opt.noSign) { /* no sign line */ }
    else if (opt.forceNeg) lines.push('The question asks for a negative common factor (the first term is negative), so take it negative.');
    else if (neg === list.length) lines.push('Every term is negative, so the GCF is negative.');
    else if (neg) lines.push('The signs are mixed, so the GCF is positive.');
    return lines.join('<br>');
  }
  function gcfDiag(list, g) {
    var gc = Math.abs(cOf(g)[0]), gv = vOf(g), coefs = list.map(function (m) { return Math.abs(cOf(m)[0]); });
    return function (S) {
      if (PL.count(S) !== 1) return { code: 'not-mono', hint: 'The GCF is a <b>single term</b> (a monomial), not a sum or difference.' };
      var sc = cOf(S), sv = vOf(S), letters = {};
      Object.keys(sv).concat(Object.keys(gv)).forEach(function (x) { letters[x] = 1; });
      var badV = Object.keys(letters).filter(function (x) { return (sv[x] || 0) !== (gv[x] || 0); });
      if (!badV.length && sc[1] === 1 && Math.abs(sc[0]) !== gc) {
        if (coefs.every(function (c) { return c % Math.abs(sc[0]) === 0; })) return { code: 'not-greatest', hint: t(Math.abs(sc[0])) + ' divides every coefficient, but it isn’t the <b>greatest</b> number that does. Try a bigger one.' };
        return { code: 'gcf-coef', hint: t(Math.abs(sc[0])) + ' doesn’t divide every coefficient (' + t(coefs.join(',\\ ')) + '). The GCF’s number must divide all of them.' };
      }
      if (badV.length && Math.abs(sc[0]) === gc && sc[1] === 1) {
        var x = badV[0], mn = list.filter(function (m) { return !vOf(m)[x]; })[0];
        if (mn && sv[x]) return { code: 'missing-var', hint: t(powTex(x, 1)) + ' is missing from ' + t(piT(tx(mn))) + ', so it can’t be part of the GCF.' };
        if ((sv[x] || 0) > (gv[x] || 0)) return { code: 'gcf-high', hint: 'Check ' + t(powTex(x, 1)) + ': use the <b>lowest</b> power that appears in every term.' };
        if ((sv[x] || 0) < (gv[x] || 0)) return { code: 'drop-var', hint: t(powTex(x, 1)) + ' appears in every term, so it belongs in the GCF (to its lowest power).' };
      }
      return null;
    };
  }
  function gcfWrongs(list, g) {
    var gc = cOf(g)[0], gv = vOf(g), W = [], hi = {}, all = {};
    Object.keys(gv).forEach(function (x) { hi[x] = Math.max.apply(null, list.map(function (m) { return vOf(m)[x]; })); });
    W.push({ is: M(gc, hi), code: 'max-exp', hint: 'For the GCF use the <b>lowest</b> power of each common letter — a higher power doesn’t divide every term.' });
    list.forEach(function (m) { var w = vOf(m); Object.keys(w).forEach(function (x) { all[x] = all[x] == null ? w[x] : Math.min(all[x], w[x]); }); });
    W.push({ is: M(gc, all), code: 'missing-var', hint: 'A letter that is missing from even one term is not common to all of them, so it can’t be in the GCF.' });
    if (list.every(isNeg)) W.push({ is: M(-gc, gv), code: 'neg-rule', hint: 'Every monomial is negative, so take the GCF <b>negative</b> too.' });
    else if (list.some(isNeg)) W.push({ is: M(-gc, gv), code: 'neg-mixed', hint: 'The signs are mixed, so the GCF is positive. (Take it negative only when <b>every</b> monomial is negative.)' });
    return W;
  }
  /* "state the GCF" part */
  function gcfPart(list, opt) {
    opt = opt || {};
    var g = gcfOf(list), W = dedupW(g, gcfWrongs(list, g)), shown = list.map(function (m) { return piT(tx(m)); }).join(',\\quad ');
    var p = KP.poly(opt.prompt || t(shown), g, { wrong: W.map(function (w) { return { is: w.p, code: w.code, hint: w.hint }; }), diag: gcfDiag(list, g), vars: lettersOf(list) },
      gcfLines(list) + '<br>GCF ' + t('=\\mathbf{' + piT(tx(g)) + '}'),
      ['Find the greatest number that divides every coefficient. Then take each letter that is in <b>every</b> term, to its <b>lowest</b> power.', 'If every term is negative, make the GCF negative.'],
      opt.text || 'GCF of ' + plain(shown));
    p.bad = W.map(function (w) { return tx(w.p); });
    return p;
  }

  /* ---------- prime factorizations of monomials (Questions 1–2) ---------- */
  function primeTex(c, v) {
    var out = nt.primeList(c).map(String);
    Object.keys(v).sort().forEach(function (x) { for (var i = 0; i < v[x]; i++) out.push(x); });
    return out.join('\\times ');
  }
  function primeCheck(c, v) {
    var want = PL.monoTex(v);
    return function (resp) {
      var a = K.read(resp); if (a.res) return a.res;
      var fs = [], other = false, nums = [], vars = {};
      (function w(x) { while (x.t === 'paren') x = x.a; if (x.t === 'mul') { w(x.a); w(x.b); return; } fs.push(x); })(a.ast);
      fs.forEach(function (f) {
        var e = 1, b = f;
        if (f.t === 'pow') { var r = ex.rat(f.b); if (!r || r[1] !== 1 || r[0] < 1) { other = true; return; } e = r[0]; b = f.a; while (b.t === 'paren') b = b.a; }
        if (b.t === 'num') { var nv = ex.rat(b); if (!nv || nv[1] !== 1) { other = true; return; } for (var i = 0; i < e; i++) nums.push(nv[0]); }
        else if (b.t === 'var') vars[b.n] = (vars[b.n] || 0) + e;
        else other = true;
      });
      if (other) return form('not-product', 'Write it as a <b>product</b>: prime numbers and single letters joined by ' + t('\\times') + ', for example ' + t('2\\times 2\\times 5\\times a\\times a\\times a') + '.');
      var prod = nums.reduce(function (m, x) { return m * x; }, 1), vs = PL.monoTex(vars), vOk = vs === want;
      if (prod === c && vOk) {
        if (nums.indexOf(1) >= 0) return form('one', 'Leave ' + t('1') + ' out: it isn’t prime, and multiplying by ' + t('1') + ' changes nothing.');
        var comp = nums.filter(function (x) { return !nt.isPrime(x); })[0];
        if (comp) return wrong('composite', 'Your factors multiply to the right monomial, but ' + t(comp) + ' isn’t prime. Break it down: ' + t(comp + '=' + nt.primeList(comp).join('\\times ')) + '.');
        return ok();
      }
      if (vOk) return wrong('pf-coef', 'The letters are right, but your numbers multiply to ' + t(F(prod)) + ', not ' + t(c) + '.');
      if (prod === c) return wrong('pf-vars', 'The numbers are right — now check the letters: ' + t(c + want) + ' has ' + Object.keys(v).sort().map(function (x) { return v[x] + ' factor' + (v[x] > 1 ? 's' : '') + ' of ' + t(x); }).join(' and ') + '.');
      return wrong('value', 'Your factors multiply to ' + t(F(prod) + vs) + ', not ' + t(c + want) + '.');
    };
  }
  function primeFields(monos) {
    var fields = monos.map(function (m) { var s = tx(m); return { label: t(s + '='), name: s, mode: 'math', keys: 'expo', vars: lettersOf(monos), wide: true }; });
    var keys = monos.map(function (m) { return primeTex(cOf(m)[0], vOf(m)); });
    return KP.fields('Write each monomial as a product of prime factors (write the letters out too, e.g. ' + t('a\\times a') + ').', fields, monos.map(function (m) { return primeCheck(cOf(m)[0], vOf(m)); }), keys,
      monos.map(function (m, i) { return t(tx(m) + '=' + keys[i]); }).join('<br>'),
      monos.map(function (m, i) { return t(tx(m) + '=' + keys[i]); }).join('<br>') + '<br>Break the number into primes (a factor tree or division ladder), then write each letter as many times as its exponent says.',
      ['Factor each coefficient into primes, e.g. ' + t('12=2\\times 2\\times 3') + '.', 'A power such as ' + t('a^{3}') + ' is ' + t('a\\times a\\times a') + '.'], 'prime factorizations of ' + monos.map(tx).join(', '));
  }
  function commonPrimeSol(monos, g) {
    var a = nt.primeList(cOf(monos[0])[0]), b = nt.primeList(cOf(monos[1])[0]), com = [], bb = b.slice();
    a.forEach(function (p) { var i = bb.indexOf(p); if (i >= 0) { com.push(String(p)); bb.splice(i, 1); } });
    var gv = vOf(g); Object.keys(gv).sort().forEach(function (x) { for (var i = 0; i < gv[x]; i++) com.push(x); });
    return monos.map(function (m) { return t(tx(m) + '=' + primeTex(cOf(m)[0], vOf(m))); }).join('<br>') + '<br>Prime factors common to both: ' + t(com.join(',\\ ')) + '.<br>GCF ' + t('=' + com.join('\\times ') + '=\\mathbf{' + tx(g) + '}');
  }

  /* ---------- factoring by removing a common factor ---------- */
  /* the sign of the monomial part and of the first written term of each bracket */
  function firstNeg(ast) { var a = ast; for (var i = 0; i < 40; i++) { if (a.t === 'paren' || a.t === 'add' || a.t === 'sub' || a.t === 'mul') a = a.a; else break; } return a.t === 'neg'; }
  function signInfo(resp) {
    var a = K.read(resp); if (a.res) return null;
    var sp = FA.split(a.ast); if (!sp.ok) return null;
    var sign = 1, brNeg = false;
    sp.factors.forEach(function (f) { if (PL.count(f.p) === 1) { if (cOf(f.p)[0] < 0 && f.k % 2) sign = -sign; } else if (f.ast && firstNeg(f.ast)) brNeg = true; });
    return { sign: sign, brNeg: brNeg };
  }
  function factorCheck(target, opt) {
    opt = opt || {};
    var base = K.factored(target, { gcfOnly: true, wrong: (opt.wrong || []).map(function (w) { return { is: w.p, code: w.code, hint: w.hint }; }) });
    return function (resp) {
      var s = opt.pi ? piIn(resp) : resp, res = base(s);
      if (opt.pi && res.hint) res = { v: res.v, code: res.code, hint: piT(res.hint) };
      if (opt.integral && (res.v === 'correct' || res.code === 'gcf-inside')) { // equal: every bracket must have whole-number coefficients
        var rd = K.read(s), spl = !rd.res && FA.split(rd.ast);
        if (spl && spl.ok && spl.factors.some(function (f) { return PL.count(f.p) > 1 && PL.terms(f.p).some(function (T) { return T.c[1] !== 1; }); }))
          return form('frac-bracket', 'Equal — but every coefficient inside the bracket must be a <b>whole number</b>. Take the fraction (or decimal) out in front as part of the common factor.');
      }
      if (res.v !== 'correct' || !(opt.mustNeg || opt.mustPos)) return res;
      var si = signInfo(s); if (!si) return res;
      if (opt.mustNeg && (si.sign > 0 || si.brNeg)) return form('neg-factor', opt.negMsg || 'Equal — but every term is negative, so take out a <b>negative</b> common factor. Then every term in the bracket is positive.');
      if (opt.mustPos && si.sign < 0) return form('pos-factor', 'Equal — but this part asks you to remove a <b>positive</b> common factor (the bracket may start with a negative term).');
      return res;
    };
  }
  /* terms: monomials in the written order. opt.g: the factor to remove (default: the GCF); opt.pi; opt.mustNeg; opt.mustPos;
   * opt.wrong: extra [{ is: [factor, bracket], code, hint }]; opt.prompt, opt.before, opt.sol, opt.hints, opt.dec (decimals) */
  function factorPart(terms, opt) {
    opt = opt || {};
    var g = opt.g || gcfOf(terms), br = terms.map(function (m) { return divM(m, g); }), B = sum(br), target = [g, B];
    var gT = opt.gTex || gTex(g, opt.dec), brT = opt.dec ? seq(br, true) : seq(br), keyTex = opt.keyTex || gT + '(' + brT + ')';
    var W = [];
    br.forEach(function (b, i) {
      if (br.length > 1 && PL.count(b) === 1 && !PL.vars(b).length && Math.abs(cv(b)) === 1) W.push({ is: [g, sum(br.filter(function (x, j) { return j !== i; }))], code: 'drop-one', hint: t(piT(pg(terms[i]) + '\\div ' + pg(g) + '=' + tx(b))) + ': that ' + t(tx(b)) + ' must stay in the bracket. A term that matches the common factor leaves ' + t('1') + ' or ' + t('-1') + ', not ' + t('0') + '.' });
    });
    if (isNeg(g) && br.length > 1) W.push({ is: [g, sum(br.map(function (b, i) { return i ? PL.neg(b) : b; }))], code: 'neg-signs', hint: 'You took out a <b>negative</b> factor, so <b>every</b> sign inside the bracket changes. Expand your answer and compare the signs with the question.' });
    W = W.concat(opt.wrong || []);
    W = dedupW(PL.mul(g, B), W).map(function (w) { if (!w.tex && Array.isArray(w.is)) w.tex = gTex(w.is[0]) + '(' + tx(w.is[1]) + ')'; return w; });
    var allNeg = terms.every(isNeg), mustNeg = opt.mustNeg != null ? opt.mustNeg : allNeg && isNeg(g);
    var check = factorCheck(target, { wrong: W, mustNeg: mustNeg, mustPos: opt.mustPos, pi: opt.pi, negMsg: opt.negMsg, integral: opt.integral !== false }); // brackets must be integral (factor.js accepts ½x + 2y)
    var shown = opt.prompt || t((opt.before || '') + (opt.dec ? seq(terms, true) : seq(terms)));
    var divs = terms.map(function (m, i) { return t((opt.dec ? tx(m, { dec: true }) : pg(m)) + '\\div ' + (opt.dec ? '\\left(' + gT + '\\right)' : pg(g)) + '=' + (opt.dec ? tx(br[i], { dec: true }) : tx(br[i]))); }).join(', &nbsp;');
    var sol = opt.sol || (opt.gcfSol || gcfLines(terms, { forceNeg: opt.forceNeg, noSign: opt.noSign, signNote: opt.signNote }) + '<br>So remove ' + t(gT || '1') + '.') + '<br>Divide every term by it: ' + divs + '.<br>' + t((opt.before || '') + (opt.dec ? seq(terms, true) : seq(terms)) + '=\\mathbf{' + keyTex + '}');
    var hints = opt.hints || ['Find the GCF of the terms first: the greatest number that divides every coefficient, and each letter that is in every term to its lowest power.', 'Divide <b>each</b> term by the GCF to get the bracket. Check by expanding.'];
    var vs = lettersOf(terms);
    var p = KP.math(opt.pi ? piT(shown) : shown, check, opt.pi ? piT(keyTex) : keyTex, opt.pi ? piT(sol) : sol, opt.pi ? hints.map(piT) : hints, opt.text || 'factor ' + plain(seq(terms)), { keys: 'poly', vars: vs, before: opt.inBefore, placeholder: 'e.g. 4x(2x - 3)' });
    p.bad = W.map(function (w) { return opt.pi ? piT(w.tex) : w.tex; });
    var altB = tx(B, { order: 'asc' });
    if (PL.count(B) > 1 && !(mustNeg && altB.charAt(0) === '-')) { var alt = gT + '(' + altB + ')'; p.good = [opt.pi ? piT(alt) : alt]; }
    return p;
  }
  /* "fill in the blank" parts: one box between the given pieces */
  function boxPart(prompt, target, opt, sol, hints, text) {
    opt = opt || {};
    var W = dedupW(target, opt.wrong), key = opt.keyTex || tx(target);
    var chk = K.poly(target, { wrong: W.map(function (w) { return { is: w.p, code: w.code, hint: w.hint }; }), diag: opt.diag });
    var p = KP.fields(prompt, [{ label: '', name: '', before: opt.before ? t(opt.before) : undefined, after: opt.after ? t(opt.after) : undefined, mode: 'math', keys: 'poly', vars: opt.vars || ['x'], wide: true }], [chk], [key],
      t(opt.answerTex), sol, hints, text);
    p.bad = W.map(function (w) { return [tx(w.p)]; });
    if (opt.good) p.good = opt.good.map(function (g) { return [g]; });
    return p;
  }
  /* blank = the common factor in front of a given bracket */
  function frontPart(poly, g, bracket, opt) {
    opt = opt || {};
    var dopt = opt.dec ? { dec: true } : undefined, polyT = opt.polyTex || tx(poly), brT = '(' + (opt.brTex || tx(bracket)) + ')', gT = opt.keyTex || tx(g, opt.dec ? { dec: true } : undefined);
    var diag = function (S) {
      var E = PL.mul(S, bracket);
      if (PL.eq(E, poly)) return null;
      return { code: 'not-factor', hint: 'Check by expanding: ' + t(pg(S) + brT + '=' + tx(E)) + ', not ' + t(polyT) + '.' };
    };
    var ws = (opt.wrong || []).slice();
    var cg = cOf(g); if (Object.keys(vOf(g)).length) ws.push({ is: M(cg, {}), code: 'drop-var', hint: 'The number is right — but the terms also share a letter. Check by expanding: ' + t(tx(M(cg, {})) + brT + '=' + tx(PL.mul(M(cg, {}), bracket))) + '.' });
    return boxPart(t(polyT + '=\\underline{\\qquad}\\,' + brT), g, { wrong: ws, diag: diag, after: brT, vars: lettersOf([poly]), keyTex: gT, answerTex: polyT + '=' + (gT === '1' ? '' : gT) + brT, good: opt.good },
      'The missing factor times each term of the bracket must give a term of the polynomial. Divide the first terms: ' + t(tx(lead(poly), dopt) + '\\div ' + pg(lead(bracket)) + '=' + gT) + '.<br>Check: ' + t((opt.dec ? gT : pg(g)) + brT + '=' + polyT) + ' ✓<br>Missing factor: ' + t('\\mathbf{' + gT + '}'),
      ['Divide the first term of the polynomial by the first term in the bracket.', 'Check by expanding your factor times the bracket.'], opt.text || 'missing factor: ' + plain(polyT + '=__' + brT));
  }
  /* blank = the bracket (or a missing part of it) after a given common factor */
  function backPart(terms, g, opt) {
    opt = opt || {};
    var br = terms.map(function (m) { return divM(m, g); }), B = sum(br), known = opt.known || [], miss = br.filter(function (b) { return !known.some(function (k) { return PL.eq(k, b); }); });
    var target = sum(miss), gT = opt.gTex || gTex(g, opt.dec), polyT = opt.polyTex || seq(terms, opt.dec);
    var pre = gT + '(' + (opt.pre || ''), post = (opt.post || '') + ')';
    var diag = function (S) {
      var full = PL.add(S, sum(known)), E = PL.mul(g, full);
      return PL.eq(E, PL.mul(g, B)) ? null : { code: 'not-factor', hint: 'Check by expanding: ' + t(pg(g) + '(' + tx(full) + ')=' + tx(E)) + ', not ' + t(polyT) + '.' };
    };
    var ws = (opt.wrong || []).slice();
    if (miss.length > 1) {
      br.forEach(function (b, i) { if (Math.abs(cv(b)) === 1 && !PL.vars(b).length) ws.push({ is: sum(miss.filter(function (x) { return !PL.eq(x, b); })), code: 'drop-one', hint: t(pg(terms[i]) + '\\div ' + pg(g) + '=' + tx(b)) + ': that ' + t(tx(b)) + ' must stay in the bracket (it doesn’t just disappear).' }); });
      if (isNeg(g)) ws.push({ is: sum(miss.map(function (b) { return PL.neg(b); })), code: 'neg-signs', hint: 'The common factor is <b>negative</b>, so every sign inside the bracket is the <b>opposite</b> of the sign in the question.' });
    }
    var divs = terms.map(function (m, i) { return t(pg(m) + '\\div ' + pg(g) + '=' + tx(br[i])); }).join(', &nbsp;');
    return boxPart(opt.prompt || t(polyT + '=' + pre + '\\underline{\\qquad\\quad}' + post), target, { wrong: ws, diag: diag, before: pre, after: post, vars: lettersOf(terms), answerTex: polyT + '=' + gT + '(' + seq(br) + ')', keyTex: opt.keyTex || (miss.length > 1 ? seq(miss) : tx(target)), good: miss.length > 1 ? [tx(target, { order: 'asc' })] : null },
      (opt.solPre || '') + 'Divide each term by ' + t(gT) + ': ' + divs + '.<br>' + t(polyT + '=' + gT + '(' + seq(br) + ')') + (isNeg(g) ? ' — the factor is negative, so every sign changed.' : ''),
      opt.hints || ['Divide each term of the polynomial by the common factor in front of the bracket.', isNeg(g) ? 'Dividing by a negative changes the sign of every term.' : 'Check by expanding: the factor times your bracket must give the polynomial back.'],
      opt.text || 'complete the bracket: ' + plain(polyT + '=' + pre + '__' + post));
  }
  function mcPart(r, prompt, opts, sol, hints, text, keepOrder) { return KP.mc(r, prompt, opts, sol, hints, text, keepOrder); }

  /* ---------- generators ---------- */
  var L1 = ['a', 'x', 'm', 'y', 'p', 't'];
  var PAIRS = [['a', 'b'], ['x', 'y'], ['m', 'n'], ['p', 'q']];
  var COP2 = [[2, 3], [3, 4], [2, 5], [3, 5], [4, 5], [3, 2], [5, 4], [5, 3], [5, 2], [4, 3], [2, 7], [3, 7]];
  function cop2(r, lo, hi) { return pickWhere(function () { return [r.int(lo, hi), r.int(lo, hi)]; }, function (p) { return p[0] !== p[1] && gcd(p[0], p[1]) === 1; }); }
  function cop3(r, lo, hi, distinct) { return pickWhere(function () { return [r.int(lo, hi), r.int(lo, hi), r.int(lo, hi)]; }, function (p) { return gcdA(p) === 1 && (!distinct || (p[0] !== p[1] && p[1] !== p[2] && p[0] !== p[2])); }); }
  /* a set of monomials: o.g (choices), o.mu (multiplier tuple), o.L (letters), o.pres[letter][monomial] = 0 | exponent | [lo, hi], o.signs */
  function setOf(r, o) {
    var g = r.pick(o.g), mu = typeof o.mu === 'function' ? o.mu() : o.mu, Ls = o.L, list = [];
    for (var i = 0; i < mu.length; i++) {
      var v = {};
      o.pres.forEach(function (row, j) { var rg = row[i]; if (rg) v[Ls[j]] = Array.isArray(rg) ? r.int(rg[0], rg[1]) : rg; });
      list.push(M((o.signs ? o.signs[i] : 1) * g * mu[i], v));
    }
    return list;
  }
  function setWhere(r, o, test) { return pickWhere(function () { return setOf(r, o); }, function (list) { return (!test || test(list)) && distinctExps(list); }); }
  function distinctExps(list) { // some common letter has different exponents, and no two monomials identical
    for (var i = 0; i < list.length; i++) for (var j = i + 1; j < list.length; j++) if (PL.eq(list[i], list[j])) return false;
    return true;
  }
  function eV(list, x) { return list.map(function (m) { return vOf(m)[x] || 0; }); }
  function spread(list, x) { var e = eV(list, x); return Math.max.apply(null, e) !== Math.min.apply(null, e); }

  /* Q16 statements */
  function q16(r) {
    var k = r.pick([1, 1, 2, 3]), n = r.pick([2, 3, 4]), a = r.pick([2, 3]), b = a + r.pick([1, 2]), c = b + r.pick([2, 3]);
    var kk = k === 1 ? '' : String(k), truth = r.shuffle([true, false, r.chance(0.5), r.chance(0.5)]).slice(0, 3);
    var s = [
      { lhs: kk + 'x^{2}+' + kk + 'xy+' + kk + 'x', yes: kk + 'x(x+y+1)', no: kk + 'x(x+y)', why: 'expanding ' + t(kk + 'x(x+y)') + ' gives only ' + t(kk + 'x^{2}+' + kk + 'xy') + ' — the ' + t('+' + kk + 'x') + ' term needs a ' + t('1') + ' in the bracket' },
      { lhs: '\\tfrac{1}{' + n + '}\\pi r^{3}+\\pi r^{2}h', yes: '\\tfrac{1}{' + n + '}\\pi r^{2}(r+' + n + 'h)', no: '\\tfrac{1}{' + n + '}\\pi r^{2}(r+h)', why: 'expanding ' + t('\\tfrac{1}{' + n + '}\\pi r^{2}(r+h)') + ' gives ' + t('\\tfrac{1}{' + n + '}\\pi r^{2}h') + ', not ' + t('\\pi r^{2}h') + ' — the bracket needs ' + t(n + 'h') },
      { lhs: 'x^{' + a + '}+x^{' + b + '}+x^{' + c + '}', yes: 'x^{' + a + '}(1+x^{' + (b - a) + '}+x^{' + (c - a) + '})', no: 'x^{' + a + '}(1+x^{' + (b - a) + '}+x^{' + (c - a - 1) + '})', why: t('x^{' + a + '}\\cdot x^{' + (c - a - 1) + '}=x^{' + (c - 1) + '}') + ', not ' + t('x^{' + c + '}') + ' — subtract the exponents: ' + t(c + '-' + a + '=' + (c - a)) }];
    var rows = s.map(function (q, i) { return { tex: q.lhs + '=' + (truth[i] ? q.yes : q.no), truth: truth[i], q: q }; });
    rows.forEach(function (row) { row.tex = row.tex.replace(/x\^\{1\}/g, 'x'); row.q.why = row.q.why.replace(/x\^\{1\}/g, 'x'); });
    return { rows: rows, count: truth.filter(Boolean).length };
  }

  /* SVG: a square with semicircles on two opposite sides (Question 12) */
  function semiSvg(label) {
    var s = '<path d="M80,30 A50,50 0 0,0 80,130" fill="rgba(110,150,200,0.18)" stroke="currentColor" stroke-width="2.2"/>' +
      '<path d="M180,130 A50,50 0 0,0 180,30" fill="rgba(110,150,200,0.18)" stroke="currentColor" stroke-width="2.2"/>' +
      '<rect x="80" y="30" width="100" height="100" fill="rgba(110,150,200,0.18)" stroke="none"/>' +
      '<line x1="80" y1="30" x2="180" y2="30" stroke="currentColor" stroke-width="2.2"/><line x1="80" y1="130" x2="180" y2="130" stroke="currentColor" stroke-width="2.2"/>' +
      '<line x1="80" y1="30" x2="80" y2="130" stroke="currentColor" stroke-width="1.4" stroke-dasharray="6 4"/><line x1="180" y1="30" x2="180" y2="130" stroke="currentColor" stroke-width="1.4" stroke-dasharray="6 4"/>' +
      '<text x="130" y="152" text-anchor="middle" font-size="16" fill="currentColor">' + label + ' cm</text>' +
      '<text x="172" y="85" text-anchor="end" font-size="15" fill="currentColor">' + label + '</text>';
    return '<svg class="fig-svg" viewBox="0 0 260 162" width="100%" style="max-width:300px" role="img" aria-label="square with a semicircle on each of two opposite sides">' + s + '</svg>';
  }
  function svgVar(k, v) { return (k === 1 ? '' : String(k)) + '<tspan font-style="italic">' + v + '</tspan>'; }

  /* Q13 / EP14 error-analysis MC options */
  var ERR = {
    notg: 'The factor removed is not the <b>greatest</b> common factor: the bracket still has a common factor.',
    sign: 'Sign error: removing a negative factor must change the sign of <b>every</b> term in the bracket.',
    drop: 'A term is missing: a term divided by itself leaves ' + t('1') + ', which must stay in the bracket.',
    none: 'There is no error — it is factored correctly.'
  };
  function errOpts(right, whys) { return ['notg', 'sign', 'drop', 'none'].map(function (k) { return { html: ERR[k], right: k === right, why: k === right ? null : whys[k] }; }); }

  HW.defineLesson({
    id: 'u4l1', unit: 4, num: '1', title: 'Common Factors: The GCF of Monomials and Polynomials', outcome: 'AN5',
    blurb: 'Factoring is expanding run backwards: find the greatest common factor of the terms and remove it. (Extension: fractional common factors.)',
    questions: [
      /* ---------------- Part A ---------------- */
      { num: '1', section: 'Part A — Monomial Common Factors', stem: function (sh) { return 'Consider the monomials ' + t(tx(sh.m[0])) + ' and ' + t(tx(sh.m[1])) + '.'; },
        shared: function (r) {
          return pickWhere(function () { var g = r.int(2, 8), m = r.pick([[5, 8], [8, 5], [3, 4], [4, 3], [2, 3], [3, 5], [5, 3], [4, 5], [5, 6], [2, 5], [3, 8], [4, 7]]), e = r.sample([1, 2, 3, 4], 2), v = r.pick(['a', 'x', 'm', 'y']);
            var o1 = {}, o2 = {}; o1[v] = e[0]; o2[v] = e[1]; return { m: [M(g * m[0], o1), M(g * m[1], o2)] }; },
          function (s) { return cv(s.m[0]) <= 60 && cv(s.m[1]) <= 60; });
        },
        parts: [
          { id: '1a', level: 'BEG', make: function (r, sh) { return primeFields(sh.m); } },
          { id: '1b', level: 'BEG', make: function (r, sh) { var p = gcfPart(sh.m, { prompt: 'Use the prime factorizations to determine the greatest common factor of ' + t(tx(sh.m[0])) + ' and ' + t(tx(sh.m[1])) + '.' }); p.solution = commonPrimeSol(sh.m, gcfOf(sh.m)); return p; } }] },
      { num: '2', stem: function (sh) { return 'Consider the monomials ' + t(tx(sh.m[0])) + ' and ' + t(tx(sh.m[1])) + '.'; },
        shared: function (r) {
          return pickWhere(function () {
            var g = r.int(2, 6), m = r.pick([[2, 3], [3, 2], [3, 4], [2, 5], [4, 5], [5, 3], [3, 5]]), L = r.pick(PAIRS), a = r.int(1, 2), c = a + r.int(1, 2), d = r.int(1, 3), b = d + r.int(1, 2);
            var o1 = {}, o2 = {}; o1[L[0]] = a; o1[L[1]] = b; o2[L[0]] = c; o2[L[1]] = d; return { m: [M(g * m[0], o1), M(g * m[1], o2)] };
          }, function (s) { return cv(s.m[0]) <= 40 && cv(s.m[1]) <= 40; });
        },
        parts: [
          { id: '2a', level: 'BEG', make: function (r, sh) { return primeFields(sh.m); } },
          { id: '2b', level: 'EMG', make: function (r, sh) { var p = gcfPart(sh.m, { prompt: 'Use the prime factorizations to determine the greatest common factor of ' + t(tx(sh.m[0])) + ' and ' + t(tx(sh.m[1])) + '.' }); p.solution = commonPrimeSol(sh.m, gcfOf(sh.m)); return p; } }] },
      { num: '3', stem: 'State the greatest common factor of each set of monomials.', parts: [
        { id: '3a', level: 'LIM', make: function (r) { var v = r.pick(L1), o = {}; o[v] = 1; return gcfPart(setWhere(r, { g: [2, 3, 4, 5, 6], mu: r.pick([[3, 5], [2, 3], [3, 4], [2, 5], [4, 5], [5, 7]]), L: [v], pres: [[1, 1]] }, function (l) { return cv(l[1]) <= 42; })); } },
        { id: '3b', level: 'BEG', make: function (r) { var e = r.pick([[2, 1], [3, 1], [1, 2], [3, 2]]); return gcfPart(setWhere(r, { g: [2, 3, 4], mu: r.pick([[4, 5], [3, 5], [2, 3], [3, 4], [5, 6], [5, 2]]), L: [r.pick(L1)], pres: [e] })); } },
        { id: '3c', level: 'LIM', make: function (r) { var L = r.pick(PAIRS), e = r.int(1, 2), q = r.sample([1, 2, 3, 4, 5], 2); return gcfPart(setWhere(r, { g: [1], mu: [1, 1], L: L, pres: [[e, e], q] })); } },
        { id: '3d', level: 'LIM', make: function (r) { var L = r.pick(PAIRS), a = r.int(1, 2), b = r.int(1, 2); return gcfPart(setWhere(r, { g: [1], mu: [1, 1], L: L, pres: [[a, a + r.int(1, 2)], [b, b + r.int(1, 2)]] })); } },
        { id: '3e', level: 'BEG', make: function (r) { var e = r.sample([2, 3, 4, 5], 2); return gcfPart(setWhere(r, { g: [2, 3, 4, 5], mu: r.pick([[2, 3], [3, 4], [2, 5], [4, 5], [3, 5]]), L: [r.pick(L1)], pres: [e] }, function (l) { return Math.abs(cv(l[1])) <= 30 && Math.abs(cv(l[0])) <= 30; })); } },
        { id: '3f', level: 'EMG', make: function (r) {
          var LS = r.sample([['x', 'y', 'z'], ['r', 's', 't'], ['d', 'e', 'f'], ['a', 'b', 'c'], ['u', 'v', 'w'], ['k', 'm', 'n']], 3);
          var g = r.pick([2, 3, 4, 5, 6, 7]), mu = r.pick([[1, 3, 5], [1, 2, 3], [2, 3, 5], [1, 3, 4], [1, 2, 5]]);
          return gcfPart(mu.map(function (k, i) { var v = {}; LS[i].forEach(function (x) { v[x] = 1; }); return M(g * k, v); }));
        } },
        { id: '3g', level: 'EMG', make: function (r) { var L = r.pick(PAIRS); return gcfPart(setWhere(r, { g: [3, 4, 5, 6, 7, 8], mu: r.pick([[1, 2], [1, 3], [2, 3]]), L: L, signs: [-1, 1], pres: [[1, 2], [2, 1]] })); } },
        { id: '3h', level: 'EMG', make: function (r) { var L = r.pick([['x', 'z'], ['a', 'c'], ['m', 'p'], ['x', 'y']]); return gcfPart(setWhere(r, { g: [4, 5, 6, 7], mu: r.pick([[2, 3], [3, 4], [2, 5]]), L: L, signs: [-1, -1], pres: [[[2, 4], [2, 4]], [[2, 5], [2, 5]]] }, function (l) { return spread(l, L[0]) && spread(l, L[1]); })); } },
        { id: '3i', level: 'EMG', make: function (r) { var L = r.pick(PAIRS); return gcfPart(setWhere(r, { g: [2, 3], mu: r.pick([[3, 5, 2], [2, 3, 5], [3, 4, 2], [5, 3, 4]]), L: L, pres: [[[1, 3], [1, 3], [1, 3]], [[1, 2], [1, 2], 0]] }, function (l) { return spread(l, L[0]); })); } },
        { id: '3j', level: 'EMG', make: function (r) { var L = r.pick([['m', 'n', 'p'], ['a', 'b', 'c'], ['x', 'y', 'z']]); return gcfPart(setWhere(r, { g: [2, 3, 4, 5, 6], mu: r.pick([[2, 3, 4], [2, 3, 5], [3, 4, 2], [4, 3, 5]]), L: L, pres: [[1, 0, 1], [[1, 2], [1, 2], [1, 2]], [0, 1, 1]] }, function (l) { return cv(l[2]) <= 40; })); } },
        { id: '3k', level: 'EMG', make: function (r) { var L = r.pick(PAIRS); return gcfPart(setWhere(r, { g: [2, 3, 4, 5], mu: r.pick([[1, 2, 3], [1, 3, 2], [2, 1, 3], [1, 2, 5]]), L: L, signs: [-1, -1, -1], pres: [[[1, 3], [1, 3], [1, 3]], [[1, 3], [1, 3], [1, 3]]] }, function (l) { return spread(l, L[0]) && spread(l, L[1]); })); } },
        { id: '3l', level: 'EMG', make: function (r) { var L = r.pick([['p', 'q', 'r'], ['a', 'b', 'c'], ['x', 'y', 'z']]); return gcfPart(setWhere(r, { g: [3, 4, 5, 6, 7], mu: r.pick([[2, 3, 5], [3, 2, 5], [2, 5, 3]]), L: L, signs: [-1, -1, -1], pres: [[1, [1, 2], 0], [1, 1, [1, 2]], [[1, 2], 0, 1]] }, function (l) { return Math.abs(cv(l[2])) <= 40; })); } }] },
      { num: '4', stem: 'Complete the factoring in each case.', parts: [
        { id: '4a', level: 'LIM', make: function (r) { var g = r.int(2, 9), c = cop2(r, 2, 6), L = r.pick(PAIRS), B = sum([M(c[0], { [L[0]]: 1 }), M(c[1], { [L[1]]: 1 })]); return frontPart(PL.mul(N(g), B), N(g), B); } },
        { id: '4b', level: 'BEG', make: function (r) { var g = r.int(2, 5), c = pickWhere(function () { return [r.int(2, 5), r.int(1, 5)]; }, function (c) { return c[0] !== c[1] && gcd(c[0], c[1]) === 1; }), v = r.pick(L1), B = sum([M(c[0], { [v]: 1 }), N(-c[1])]); var G = M(g, { [v]: 1 }); return frontPart(PL.mul(G, B), G, B); } },
        { id: '4c', level: 'BEG', make: function (r) { var g = r.int(2, 5), c = cop2(r, 2, 5), L = r.pick([['x', 'y', 'z'], ['a', 'b', 'c'], ['m', 'n', 'p']]), G = M(g, { [L[0]]: 1 }), B = sum([M(c[0], { [L[1]]: 1 }), M(c[1], { [L[2]]: 1 })]); return frontPart(PL.mul(G, B), G, B); } },
        { id: '4d', level: 'LIM', make: function (r) { var g = r.int(2, 9), v = r.pick(L1), B = sum([M(1, { [v]: 2 }), M(r.int(2, 5), { [v]: 1 }), N(r.int(2, 5))]); return frontPart(PL.mul(N(g), B), N(g), B); } },
        { id: '4e', level: 'BEG', make: function (r) { var g = r.int(2, 5), c = cop2(r, 2, 7), L = r.pick([['c', 'd', 'e'], ['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]), G = M(g, { [L[0]]: 1, [L[1]]: 1 }), B = sum([M(Math.max(c[0], c[1]), { [L[2]]: 1 }), N(-Math.min(c[0], c[1]))]); return frontPart(PL.mul(G, B), G, B); } },
        { id: '4f', level: 'BEG', make: function (r) { var g = r.int(2, 8), v = r.pick(L1), G = M(g, { [v]: 1 }), B = sum([M(1, { [v]: 2 }), N(-r.int(2, 5))]); return frontPart(PL.mul(G, B), G, B); } }] },
      { num: '5', stem: 'In each case, the greatest common factor has been removed. Complete the factoring.', parts: [
        { id: '5a', level: 'BEG', make: function (r) { var g = r.int(2, 6), k = r.int(2, 6), v = r.pick(L1), G = M(g, { [v]: 1 }), terms = [M(g, { [v]: 2 }), M(g * k, { [v]: 1 })];
          return backPart(terms, G, { known: [M(1, { [v]: 1 })], pre: v + '+', wrong: [{ is: M(k, { [v]: 1 }), code: 'kept-var', hint: t(tx(terms[1]) + '\\div ' + tx(G) + '=' + k) + ' — the ' + t(v) + ' divides out too.' }, { is: N(g * k), code: 'no-divide', hint: 'Divide ' + t(tx(terms[1])) + ' by the common factor ' + t(tx(G)) + '.' }] }); } },
        { id: '5b', level: 'BEG', make: function (r) { var g = r.int(2, 6), c = cop2(r, 2, 8), L = r.pick(PAIRS), a = Math.max(c[0], c[1]), b = Math.min(c[0], c[1]), terms = [M(g * a, { [L[0]]: 1 }), M(-g * b, { [L[1]]: 1 })];
          return backPart(terms, N(g), { known: [M(-b, { [L[1]]: 1 })], post: '-' + b + L[1], wrong: [{ is: N(a), code: 'drop-var', hint: 'Keep the letter: ' + t(tx(terms[0]) + '\\div ' + g + '=' + a + L[0]) + '.' }, { is: M(g * a, { [L[0]]: 1 }), code: 'no-divide', hint: 'Divide ' + t(tx(terms[0])) + ' by ' + t(g) + '.' }] }); } },
        { id: '5c', level: 'BEG', make: function (r) { var g = r.int(2, 6), c = cop2(r, 2, 5), v = r.pick(L1), G = M(g, { [v]: 2 }), terms = [M(g * c[0], { [v]: 3 }), M(-g * c[1], { [v]: 2 })];
          return backPart(terms, G, { wrong: [{ is: sum([M(c[0], { [v]: 1 }), M(-c[1], { [v]: 1 })]), code: 'kept-var', hint: t(tx(terms[1]) + '\\div ' + tx(G) + '=' + (-c[1])) + ': the ' + t(v + '^{2}') + ' divides out completely.' }] }); } },
        { id: '5d', level: 'EMG', make: function (r) { var g = r.int(2, 5), c = cop2(r, 2, 5), L = r.pick(PAIRS), G = M(g, { [L[0]]: 2, [L[1]]: 1 }), terms = [M(g * c[0], { [L[0]]: 2, [L[1]]: 1 }), M(g * c[1], { [L[0]]: 3, [L[1]]: 2 })];
          return backPart(terms, G, { keyTex: c[0] + '+' + c[1] + L[0] + L[1] }); } },
        { id: '5e', level: 'EMG', make: function (r) { var g = r.int(2, 7), c = cop2(r, 2, 5), L = r.pick(PAIRS), G = M(-g, { [L[0]]: 2, [L[1]]: 1 }), terms = [M(-g * c[0], { [L[0]]: 2, [L[1]]: 1 }), M(-g * c[1], { [L[0]]: 2, [L[1]]: 2 })];
          return backPart(terms, G, { keyTex: c[0] + '+' + c[1] + L[1] }); } },
        { id: '5f', level: 'EMG', make: function (r) { var g = r.int(2, 6), a = r.int(2, 5), b = r.int(2, 4), L = r.pick([['x', 'm', 'n'], ['a', 'b', 'c'], ['p', 'q', 'r']]), G = M(g, { [L[1]]: 1, [L[2]]: 1 });
          var terms = [M(g * a, { [L[0]]: 1, [L[1]]: 2, [L[2]]: 3 }), M(-g * b, { [L[1]]: 1, [L[2]]: 2 }), M(-g, { [L[1]]: 1, [L[2]]: 1 })];
          return backPart(terms, G); } }] },
      { num: '6', stem: 'Factor the following polynomials by removing the greatest common factor.', parts: [
        { id: '6a', level: 'LIM', make: function (r) { var g = r.int(2, 9), L = r.pick(PAIRS); return factorPart([M(g, { [L[0]]: 1 }), M(g, { [L[1]]: 1 })]); } },
        { id: '6b', level: 'BEG', make: function (r) { var g = r.int(3, 9), p = r.pick([1, 1, 2]), q = pickWhere(function () { return r.int(2, 9); }, function (q) { return gcd(p, q) === 1; }), L = r.pick(PAIRS); return factorPart([M(g * p, { [L[0]]: 1, [L[1]]: 2 }), N(g * q)]); } },
        { id: '6c', level: 'BEG', make: function (r) { var g = r.int(2, 9), p = r.int(2, 5), L = r.pick(PAIRS); return factorPart([M(g * p, { [L[0]]: 1, [L[1]]: 1 }), N(-g)]); } },
        { id: '6d', level: 'BEG', make: function (r) { var g = r.int(2, 7), c = cop2(r, 2, 5), L = r.pick([['c', 'd'], ['x', 'y'], ['a', 'b'], ['m', 'n']]); return factorPart([M(g * c[0], { [L[0]]: 1 }), M(g * c[1], { [L[1]]: 1 })]); } },
        { id: '6e', level: 'LIM', make: function (r) { var L = r.pick([['x', 'z'], ['a', 'b'], ['m', 'n'], ['p', 'q']]); return factorPart([M(1, { [L[0]]: r.pick([1, 1, 2]), [L[1]]: 1 }), M(1, { [L[1]]: 1 })]); } },
        { id: '6f', level: 'BEG', make: function (r) { var g = r.int(2, 6), c = cop2(r, 2, 5), v = r.pick(L1); return factorPart([M(g * c[0], { [v]: 2 }), M(-g * c[1], { [v]: 1 })]); } },
        { id: '6g', level: 'BEG', make: function (r) { var g = r.int(2, 6), c = cop2(r, 2, 5), L = r.pick([['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]); return factorPart([M(g * c[0], { [L[0]]: 1, [L[1]]: 1 }), M(-g * c[1], { [L[0]]: 1, [L[2]]: 1 })]); } },
        { id: '6h', level: 'EMG', make: function (r) { var o = pickWhere(function () { return { g: r.pick([9, 12, 14, 15, 16, 18, 25, 27]), c: cop2(r, 2, 5), e: r.int(1, 3), d: r.int(2, 3) }; }, function (o) { return o.c[0] < o.c[1] && o.g * o.c[1] <= 100; }), v = r.pick(L1);
          return factorPart([M(o.g * o.c[0], { [v]: o.e + 1 }), M(-o.g * o.c[1], { [v]: o.e + 1 + o.d })]); } }] },
      { num: '7', stem: 'Factor the following polynomials.', parts: [
        { id: '7a', level: 'BEG', make: function (r) { var g = r.int(2, 7), c = cop3(r, 2, 5, true), L = r.pick([['x', 'y', 'z'], ['a', 'b', 'c'], ['p', 'q', 'r']]); return factorPart([M(g * c[0], { [L[0]]: 1 }), M(-g * c[1], { [L[1]]: 1 }), M(g * c[2], { [L[2]]: 1 })]); } },
        { id: '7b', level: 'BEG', make: function (r) { var g = r.int(2, 5), c = cop3(r, 2, 5, true), L = r.pick([['p', 'q', 'r'], ['a', 'b', 'c'], ['x', 'y', 'z']]); return factorPart([M(g * c[0], { [L[0]]: 1, [L[1]]: 1 }), M(g * c[1], { [L[0]]: 1, [L[2]]: 1 }), M(-g * c[2], { [L[0]]: 1 })]); } },
        { id: '7c', level: 'BEG', make: function (r) { var v = r.pick(['t', 'x', 'y', 'm']), e = r.int(1, 3), d1 = r.pick([1, 1, 2]), d2 = r.pick([1, 1, 2]); return factorPart([M(1, { [v]: e + d1 + d2 }), M(1, { [v]: e + d1 }), M(1, { [v]: e })]); } },
        { id: '7d', level: 'BEG', make: function (r) { var g = r.int(2, 9), q = r.sample([2, 3, 4, 5], 2), L = r.pick([['x', 'y', 'z'], ['a', 'b', 'c'], ['m', 'n', 'p']]); return factorPart([M(g, { [L[0]]: 2 }), M(-g * q[0], { [L[0]]: 1, [L[1]]: 1 }), M(-g * q[1], { [L[0]]: 1, [L[2]]: 1 })]); } },
        { id: '7e', level: 'BEG', make: function (r) { var g = r.int(2, 5), q = cop2(r, 2, 5), L = r.pick([['a', 'b', 'c', 'd', 'e'], ['p', 'q', 'r', 's', 't'], ['x', 'y', 'u', 'v', 'w']]);
          return factorPart([M(g * q[0], { [L[0]]: 1, [L[1]]: 1, [L[2]]: 1 }), M(-g, { [L[0]]: 1, [L[1]]: 1, [L[3]]: 1 }), M(g * q[1], { [L[0]]: 1, [L[1]]: 1, [L[4]]: 1 })]); } },
        { id: '7f', level: 'EMG', make: function (r) { var g = r.int(3, 7), c = r.pick([[3, 4, 6], [2, 3, 6], [4, 5, 6], [3, 5, 6], [2, 5, 6]]), L = r.pick(PAIRS), a = r.int(1, 2), b = r.int(1, 2);
          return factorPart([M(g * c[0], { [L[0]]: a, [L[1]]: b }), M(g * c[1], { [L[0]]: a + 1, [L[1]]: b }), M(-g * c[2], { [L[0]]: a, [L[1]]: b + 1 })]); } }] },
      { num: '8', stem: function (sh) { return '(a) &nbsp;' + t(sh.tex) + '<br>(i) Simplify the expression by combining like terms; (ii) factor the resulting polynomial.'; },
        shared: function (r) {
          var o = pickWhere(function () { return { a: r.int(2, 7), b: r.int(2, 9) }; }, function (o) { return gcd(o.a, o.b) === 1; }), v = r.pick(['x', 'y', 'a', 'm']);
          var a1 = o.a + r.int(2, 4), a2 = a1 - o.a, b1 = r.int(2, 5), b2 = o.b + b1, k = r.int(2, 9);
          var terms = [M(a1, { [v]: 2 }), M(-b1, { [v]: 1 }), N(k), M(-a2, { [v]: 2 }), M(b2, { [v]: 1 }), N(-k)];
          return { terms: terms, tex: seq(terms), S: sum(terms), res: [M(o.a, { [v]: 2 }), M(o.b, { [v]: 1 })] };
        },
        parts: [
          { id: '8a1', sub: 'a i', level: 'BEG', make: function (r, sh) { return simplifyPart(sh); } },
          { id: '8a2', sub: 'a ii', level: 'BEG', make: function (r, sh) { return factorPart(sh.res, { prompt: 'Factor the simplified polynomial ' + t(seq(sh.res)) + '.' }); } }] },
      { num: '8', stem: function (sh) { return '(b) &nbsp;' + t(sh.tex) + '<br>(i) Simplify the expression by combining like terms; (ii) factor the resulting polynomial.'; },
        shared: function (r) {
          var g = r.int(2, 5), c = cop2(r, 2, 5), v = r.pick(['y', 'x', 'p', 'n']), A = g * c[0], Bc = g * c[1];
          var c1 = r.int(1, A - 1), d1 = r.int(1, Bc - 1), k = r.int(2, 9);
          var terms = [N(k), M(-d1, { [v]: 1 }), M(c1, { [v]: 2 }), M(-(Bc - d1), { [v]: 1 }), M(A - c1, { [v]: 2 }), N(-k)];
          return { terms: terms, tex: seq(terms), S: sum(terms), res: [M(A, { [v]: 2 }), M(-Bc, { [v]: 1 })] };
        },
        parts: [
          { id: '8b1', sub: 'b i', level: 'BEG', make: function (r, sh) { return simplifyPart(sh); } },
          { id: '8b2', sub: 'b ii', level: 'BEG', make: function (r, sh) { return factorPart(sh.res, { prompt: 'Factor the simplified polynomial ' + t(seq(sh.res)) + '.' }); } }] },
      { num: '8', stem: function (sh) { return '(c) &nbsp;' + t(sh.tex) + '<br>(i) Simplify the expression by combining like terms; (ii) factor the resulting polynomial.'; },
        shared: function (r) {
          var L = r.pick(PAIRS), o = pickWhere(function () { return { A: r.int(2, 5), B: r.int(2, 7), C: -r.int(1, 3) }; }, function (o) { return gcdA([o.A, o.B, o.C]) === 1; }), A = o.A, Bv = o.B, C = o.C;
          var c1 = r.int(1, 3), c2 = c1 - C, a1 = r.int(2, 4), a2 = a1 + A, x = L[0], y = L[1];
          var terms = [M(c1, { [x]: 1, [y]: 3 }), M(-a1, { [x]: 3, [y]: 1 }), M(Bv, { [x]: 2, [y]: 2 }), M(-c2, { [x]: 1, [y]: 3 }), M(a2, { [x]: 3, [y]: 1 })];
          return { terms: terms, tex: seq(terms), S: sum(terms), res: [M(A, { [x]: 3, [y]: 1 }), M(Bv, { [x]: 2, [y]: 2 }), M(C, { [x]: 1, [y]: 3 })] };
        },
        parts: [
          { id: '8c1', sub: 'c i', level: 'EMG', make: function (r, sh) { return simplifyPart(sh); } },
          { id: '8c2', sub: 'c ii', level: 'EMG', make: function (r, sh) { return factorPart(sh.res, { prompt: 'Factor the simplified polynomial ' + t(seq(sh.res)) + '.' }); } }] },
      { num: '8', stem: function (sh) { return '(d) &nbsp;' + t(sh.tex) + '<br>(i) Simplify the expression by combining like terms; (ii) factor the resulting polynomial.'; },
        shared: function (r) {
          var v = r.pick(['x', 'y', 'a', 'n']);
          var o = pickWhere(function () { return { p: r.int(2, 4), q: r.int(2, 4), s: r.int(2, 6), u: r.int(2, 4), w: r.int(2, 5), z: r.int(1, 3) }; }, function (o) {
            var c2 = o.p - o.s - o.w, c1 = -o.p * o.q + o.s * o.u - o.z; return c2 !== 0 && c1 !== 0 && gcdA([o.w, c2, c1]) === 1 && o.p !== o.s; });
          var X = function (c, e) { return M(c, { [v]: e }); };
          var tex = o.p + '(' + v + '^{2}-' + o.q + v + ')-' + o.s + v + '(' + v + '-' + o.u + ')+' + o.w + v + '^{2}(' + v + '-1)-' + (o.z === 1 ? '' : o.z) + v;
          var S = sum([PL.mul(N(o.p), sum([X(1, 2), X(-o.q, 1)])), PL.mul(X(-o.s, 1), sum([X(1, 1), N(-o.u)])), PL.mul(X(o.w, 2), sum([X(1, 1), N(-1)])), X(-o.z, 1)]);
          var exp7 = [X(o.p, 2), X(-o.p * o.q, 1), X(-o.s, 2), X(o.s * o.u, 1), X(o.w, 3), X(-o.w, 2), X(-o.z, 1)];
          return { tex: tex, S: S, res: PL.sorted(S).map(function (T) { return M(T.c, T.v); }), expand: seq(exp7), v: v, o: o, bracketed: true };
        },
        parts: [
          { id: '8d1', sub: 'd i', level: 'PRG', make: function (r, sh) { return simplifyPart(sh); } },
          { id: '8d2', sub: 'd ii', level: 'EMG', make: function (r, sh) { return factorPart(sh.res, { prompt: 'Factor the simplified polynomial ' + t(seq(sh.res)) + '.' }); } }] },
      { num: '9', stem: 'Factor the following polynomials. (Expand your answer to verify the factoring.)', parts: [
        { id: '9a', level: 'BEG', make: function (r) { var g = r.pick([6, 8, 9, 10, 12, 14, 15]), c = cop2(r, 2, 5), e = r.int(1, 3), v = r.pick(L1); var p = factorPart([M(g * c[0], { [v]: e + 1 }), M(-g * c[1], { [v]: e })]); return verifyNote(p, [M(g * c[0], { [v]: e + 1 }), M(-g * c[1], { [v]: e })]); } },
        { id: '9b', level: 'EMG', make: function (r) { var g = r.pick([2, 3, 4, 5, 6, 8, 12]), b = r.int(2, 5), c = r.int(1, 4), v = r.pick(['p', 'x', 'y', 'm']); var terms = [M(-g, { [v]: 3 }), M(-g * b, { [v]: 2 }), M(-g * c, { [v]: 1 })]; return verifyNote(factorPart(terms), terms); } }] },
      { num: '10', stem: function (sh) { return 'The surface area of a cylinder is given by the formula ' + t('A=2\\pi r^{2}+2\\pi rh') + ', where ' + t('r') + ' is the radius of the base and ' + t('h') + ' is the height. A cylinder has height ' + t(sh.h.toFixed(1) + '\\text{ cm}') + ' and base diameter ' + t(sh.d + '\\text{ cm}') + '.'; },
        shared: function (r) { return { d: r.pick([6, 8, 10, 12, 14, 16, 18, 20]), h: r.int(50, 200) / 10 }; },
        parts: [
          { id: '10a', level: 'BEG', make: function (r, sh) { return cylPart(sh, false); } },
          { id: '10b', level: 'EMG', make: function (r) {
            var terms = [M(2, { Q: 1, r: 2 }), M(2, { Q: 1, r: 1, h: 1 })];
            return factorPart(terms, { pi: true, before: 'A=', inBefore: t('A='), prompt: 'Write the formula ' + t('A=2Qr^{2}+2Qrh') + ' in factored form.', text: 'factor A = 2πr² + 2πrh' });
          } },
          { id: '10c', level: 'BEG', make: function (r, sh) { return cylPart(sh, true); } },
          { id: '10d', level: 'BEG', make: function (r, sh) {
            return mcPart(r, 'To calculate the surface area, which is simpler to use: the original formula ' + t('A=2\\pi r^{2}+2\\pi rh') + ' or the factored form ' + t('A=2\\pi r(r+h)') + '?', [
              { html: 'The factored form: one addition inside the bracket, then a single product.', right: true },
              { html: 'The original formula: it has fewer operations.', why: 'Count them: the original formula needs two separate products (each with ' + t('\\pi') + ') and then an addition. The factored form adds ' + t('r+h') + ' once and multiplies once.' },
              { html: 'Neither — they give different answers, so only one can be used.', why: 'Both forms are equal for every ' + t('r') + ' and ' + t('h') + ', so they give the same area.' },
              { html: 'The factored form, because it gives a more accurate answer.', why: 'Both give exactly the same value; the factored form is just <b>quicker</b>, not more accurate.' }],
              'Both give ' + t(K.roundTo(cylA(sh), 2).toFixed(2) + '\\text{ cm}^{2}') + '. The factored form ' + t('2\\pi r(r+h)') + ' needs one addition and one multiplication, instead of two separate products and an addition — the <b>factored form</b> is simpler.', [], 'cylinder: simpler method');
          } }] },
      { num: '11', stem: function (sh) { return 'A rocket is launched straight upward from the ground with an initial speed of ' + t(sh.v + '\\text{ m/s}') + '. Its height (' + t('h') + ' metres) after ' + t('t') + ' seconds can be approximated by ' + t('h=' + sh.v + 't-5t^{2}') + '.'; },
        shared: function (r) { var v = r.pick([30, 35, 40, 45]); return { v: v, T: v / 5 }; },
        parts: [
          { id: '11a', level: 'BEG', make: function (r, sh) { return factorPart([M(sh.v, { t: 1 }), M(-5, { t: 2 })], { prompt: 'Write ' + t('h') + ' in factored form.', inBefore: t('h='), before: 'h=', text: 'factor h = ' + sh.v + 't − 5t²' }); } },
          { id: '11b', level: 'EMG', make: function (r, sh) { return rocketTable(sh); } },
          { id: '11c', level: 'EMG', make: function (r, sh) {
            var T = sh.T, a = T % 2 ? (T - 1) / 2 : T / 2 - 1, b = T - a, ha = 5 * a * (T - a);
            return mcPart(r, 'Explain why the height after ' + t(a) + ' seconds is the same as the height after ' + t(b) + ' seconds.', [
              { html: 'The flight is symmetric about its highest point at ' + t('t=' + (T / 2)) + ': ' + t(a) + ' s is the same time before the peak as ' + t(b) + ' s is after it.', right: true },
              { html: 'The rocket hovers at that height between ' + t(a) + ' s and ' + t(b) + ' s.', why: 'Check a time in between: at ' + t('t=' + (T / 2)) + ' the height is ' + t(5 * T * T / 4) + ' m, not ' + t(ha) + ' m. It goes up, then comes back down.' },
              { html: 'The formula only works for whole-number times, so it repeats.', why: 'The formula works for any time from ' + t('0') + ' to ' + t(T) + '. Think about the shape of the flight.' },
              { html: 'The rocket travels at a constant speed, so it covers equal distances in equal times.', why: 'The speed is not constant: the rocket slows down on the way up, stops at the peak and speeds up on the way down. Look at the factored form: ' + t('5t(' + T + '-t)') + ' — swapping ' + t('t') + ' and ' + t(T + '-t') + ' gives the same product.' }],
              'In factored form ' + t('h=5t(' + T + '-t)') + ': at ' + t('t=' + a) + ', ' + t('h=5(' + a + ')(' + b + ')=' + ha) + '; at ' + t('t=' + b) + ', ' + t('h=5(' + b + ')(' + a + ')=' + ha) + '. The rocket rises to its peak at ' + t('t=' + (T / 2)) + ' and falls back the same way, so the path is symmetric about the peak.', ['Work out ' + t('h') + ' at both times. When is the rocket highest?'], 'rocket symmetry');
          } },
          { id: '11d1', sub: 'd i', level: 'BEG', make: function (r, sh) { var t9 = sh.T + 1, h = 5 * t9 * (sh.T - t9);
            return KP.number('Calculate ' + t('h') + ' when ' + t('t=' + t9) + '.', h, function (v) { if (v === -h) return { code: 'sign', hint: 'Check the sign: ' + t(sh.T + '-' + t9 + '=-1') + '.' }; return null; },
              t('h=5(' + t9 + ')(' + sh.T + '-' + t9 + ')=' + (5 * t9) + '(-1)=\\mathbf{' + h + '}'), ['Use ' + t('h=5t(' + sh.T + '-t)') + '.'], 'rocket h at t=' + t9, { after: t('\\text{m}') }); } },
          { id: '11d2', sub: 'd ii', level: 'BEG', make: function (r, sh) { var t9 = sh.T + 1, h = 5 * t9 * (sh.T - t9);
            return mcPart(r, 'Why does ' + t('h=' + h) + ' at ' + t('t=' + t9) + ' have no meaning in this context?', [
              { html: 'The rocket hit the ground at ' + t('t=' + sh.T) + ' (where ' + t('h=0') + '); it can’t be ' + t(-h) + ' m below the ground.', right: true },
              { html: 'Time can’t be more than ' + t(sh.T) + ' seconds.', why: 'Time keeps going — but the <b>rocket</b> has stopped: it landed when ' + t('h') + ' returned to ' + t('0') + '.' },
              { html: 'The rocket is falling at ' + t(-h) + ' m/s.', why: t('h') + ' is a <b>height</b> in metres, not a speed.' },
              { html: 'The answer should be positive, so the calculation is wrong.', why: 'The calculation is right: ' + t('5(' + t9 + ')(-1)=' + h) + '. It is the <b>model</b> that stops applying.' }],
              'At ' + t('t=' + sh.T) + ' the height is ' + t('5(' + sh.T + ')(0)=0') + ': the rocket has landed. A negative height would mean ' + t(-h) + ' m underground, so the formula only models the flight for ' + t('0\\le t\\le ' + sh.T) + '.', [], 'rocket t after landing');
          } }] },
      { num: '12', stem: function (sh) { return 'A square of side ' + t(sh.side + '\\text{ cm}') + ' has semicircles drawn externally on each of two opposite sides, as shown. Find expressions in factored form.' + semiSvg(svgVar(2 * sh.k, sh.v)); },
        shared: function (r) { var k = r.pick([1, 1, 2, 3]), v = r.pick(['m', 'm', 'x', 'a', 'n']); return { k: k, v: v, side: (2 * k) + v }; },
        parts: [
          { id: '12a', level: 'EMG', make: function (r, sh) {
            var k = sh.k, v = sh.v, terms = [M(4 * k, { [v]: 1 }), M(2 * k, { Q: 1, [v]: 1 })];
            var p = factorPart(terms, { pi: true, prompt: 'The external perimeter of the shape (in cm).', text: 'semicircle shape perimeter, side ' + sh.side,
              wrong: [{ is: [M(2 * k, { [v]: 1 }), sum([N(4), M(1, { Q: 1 })])], code: 'dashed', hint: 'The two dashed sides are <b>inside</b> the shape — they are not part of the outside edge. Only two straight sides are on the boundary.', tex: (2 * k === 1 ? '' : 2 * k) + v + '(4+Q)' },
                { is: [M(4 * k, { [v]: 1 }), sum([N(1), M(1, { Q: 1 })])], code: 'two-circles', hint: 'Two <b>semi</b>circles of diameter ' + t(sh.side) + ' make <b>one</b> full circle, with circumference ' + t('\\pi d') + '.', tex: 4 * k + v + '(1+Q)' }],
              hints: ['The boundary is the two straight sides of the square plus the two semicircles. Two semicircles of the same diameter make one circle.', 'Circumference of a circle: ' + t('C=\\pi d') + '. Then factor out the GCF.'],
              sol: 'The two dashed sides are inside the shape. The boundary is two straight sides, ' + t('2(' + sh.side + ')=' + (4 * k) + v) + ', plus two semicircles of diameter ' + t(sh.side) + ', which together make one circle: ' + t('C=\\pi(' + sh.side + ')=' + (2 * k) + 'Q' + v) + '.<br>' + t('P=' + seq(terms)) + '. The GCF is ' + t(tx(M(2 * k, { [v]: 1 }))) + ', so ' + t('P=\\mathbf{' + gTex(M(2 * k, { [v]: 1 })) + '(2+Q)}\\text{ cm}') + '.' });
            return p;
          } },
          { id: '12b', level: 'PRG', make: function (r, sh) {
            var k = sh.k, v = sh.v, k2 = k * k, terms = [M(4 * k2, { [v]: 2 }), M(k2, { Q: 1, [v]: 2 })], G = M(k2, { [v]: 2 });
            var p = factorPart(terms, { pi: true, prompt: 'The area of the shape (in cm²).', text: 'semicircle shape area, side ' + sh.side,
              wrong: [{ is: [M(4 * k2, { [v]: 2 }), sum([N(1), M(1, { Q: 1 })])], code: 'diam', hint: 'The radius of each semicircle is <b>half</b> the side: ' + t('r=' + (k === 1 ? '' : k) + v) + '.', tex: 4 * k2 + v + '^{2}(1+Q)' },
                { is: [M(2 * k2, { [v]: 2 }), sum([N(2), M(1, { Q: 1 })])], code: 'two-circles', hint: 'Two <b>semi</b>circles make <b>one</b> full circle — use ' + t('\\pi r^{2}') + ' once.', tex: 2 * k2 + v + '^{2}(2+Q)' }],
              hints: ['Area = square + two semicircles. The two semicircles together make one circle of radius ' + t((k === 1 ? '' : k) + v) + '.', 'Then factor out the GCF of the two terms.'],
              sol: 'Square: ' + t('(' + sh.side + ')^{2}=' + tx(terms[0])) + '. The two semicircles make one circle of radius ' + t((k === 1 ? '' : k) + v) + ': ' + t('Q(' + (k === 1 ? '' : k) + v + ')^{2}=' + tx(terms[1])) + '.<br>' + t('A=' + seq(terms)) + '. The GCF is ' + t(tx(G)) + ', so ' + t('A=\\mathbf{' + gTex(G) + '(4+Q)}\\text{ cm}^{2}') + '.' });
            return p;
          } }] },
      /* Q13 is split into three questions so each pair of parts shares its numbers */
      { num: '13', stem: function (sh) { return 'Identify the error in each factorization, then write the correct factored form.<br>(a) &nbsp;A student wrote ' + t(sh.poly + '=' + sh.shown) + '.'; },
        shared: function (r) { var g = r.int(2, 6), c = cop2(r, 2, 5), v = r.pick(['x', 'y', 'a', 'm']); var terms = [M(g * c[0], { [v]: 3 }), M(-g * c[1], { [v]: 2 })];
          return { terms: terms, poly: seq(terms), shown: g + v + '(' + c[0] + v + '^{2}-' + c[1] + v + ')', g: g, c: c, v: v }; },
        parts: [
          { id: '13a1', sub: 'a i', level: 'EMG', make: function (r, sh) { return mcPart(r, 'What is the error?', errOpts('notg', { sign: 'Check the signs: ' + t(sh.g + sh.v + '\\cdot(-' + sh.c[1] + sh.v + ')=-' + sh.g * sh.c[1] + sh.v + '^{2}') + ' — they are right.', drop: 'Both terms are there: expand it and you get back ' + t(sh.poly) + '.', none: 'It expands back correctly, but look inside the bracket: ' + t(sh.c[0] + sh.v + '^{2}-' + sh.c[1] + sh.v) + ' still has the common factor ' + t(sh.v) + '.' }),
            'Expanding gives back ' + t(sh.poly) + ', but ' + t(sh.g + sh.v) + ' is not the <b>greatest</b> common factor: the bracket ' + t(sh.c[0] + sh.v + '^{2}-' + sh.c[1] + sh.v) + ' still has a common factor of ' + t(sh.v) + '. The GCF is ' + t(sh.g + sh.v + '^{2}') + '.', ['Expand the student’s answer, then look inside the bracket.'], 'error: not the greatest factor'); } },
          { id: '13a2', sub: 'a ii', level: 'BEG', make: function (r, sh) { return factorPart(sh.terms, { prompt: 'Write the correct factored form of ' + t(sh.poly) + '.' }); } }] },
      { num: '13', stem: function (sh) { return 'Identify the error, then write the correct factored form.<br>(b) &nbsp;A student wrote ' + t(sh.poly + '=' + sh.shown) + '.'; },
        shared: function (r) { var g = r.int(2, 5), c = cop2(r, 2, 5), v = r.pick(['m', 'x', 'y', 'n']); var terms = [M(-g * c[0], { [v]: 2 }), M(-g * c[1], { [v]: 1 })];
          return { terms: terms, poly: seq(terms), shown: '-' + g + v + '(' + c[0] + v + '-' + c[1] + ')', wrongP: seq([M(-g * c[0], { [v]: 2 }), M(g * c[1], { [v]: 1 })]), g: g, c: c, v: v }; },
        parts: [
          { id: '13b1', sub: 'b i', level: 'EMG', make: function (r, sh) { return mcPart(r, 'What is the error?', errOpts('sign', { notg: 'The factor ' + t('-' + sh.g + sh.v) + ' is the greatest one — ' + t(sh.c[0] + sh.v + '-' + sh.c[1]) + ' has no common factor. Expand the answer and compare the <b>signs</b>.', drop: 'Both terms are there. Expand it: what sign does the second term get?', none: 'Expand it: ' + t('-' + sh.g + sh.v + '(' + sh.c[0] + sh.v + '-' + sh.c[1] + ')=' + sh.wrongP) + ', which is not ' + t(sh.poly) + '.' }),
            'Expanding the student’s answer gives ' + t(sh.wrongP) + '. Removing ' + t('-' + sh.g + sh.v) + ' changes <b>every</b> sign: ' + t('-' + (sh.g * sh.c[1]) + sh.v + '\\div(-' + sh.g + sh.v + ')=+' + sh.c[1]) + '. So it is a sign error.', ['Expand the student’s answer and compare it with the original.'], 'error: sign'); } },
          { id: '13b2', sub: 'b ii', level: 'BEG', make: function (r, sh) { return factorPart(sh.terms, { prompt: 'Write the correct factored form of ' + t(sh.poly) + '.', wrong: [{ is: [M(-sh.g, { [sh.v]: 1 }), sum([M(sh.c[0], { [sh.v]: 1 }), N(-sh.c[1])])], code: 'kept-error', hint: 'That’s the student’s answer. Expand it — the second sign is wrong.', tex: '-' + sh.g + sh.v + '(' + sh.c[0] + sh.v + '-' + sh.c[1] + ')' }] }); } }] },
      { num: '13', stem: function (sh) { return 'Identify the error, then write the correct factored form.<br>(c) &nbsp;A student wrote ' + t(sh.poly + '=' + sh.shown) + '.'; },
        shared: function (r) { var g = r.int(2, 6), p = r.int(2, 5), L = r.pick(PAIRS); var terms = [M(g * p, { [L[0]]: 1, [L[1]]: 1 }), M(g, { [L[0]]: 1 })];
          return { terms: terms, poly: seq(terms), shown: g + L[0] + '(' + p + L[1] + ')', g: g, p: p, L: L }; },
        parts: [
          { id: '13c1', sub: 'c i', level: 'EMG', make: function (r, sh) { var x = sh.L[0], y = sh.L[1]; return mcPart(r, 'What is the error?', errOpts('drop', { notg: t(sh.g + x) + ' is the greatest common factor here. Expand the answer: is anything missing?', sign: 'The signs are fine. Expand the answer: is anything missing?', none: 'Expand it: ' + t(sh.g + x + '(' + sh.p + y + ')=' + (sh.g * sh.p) + x + y) + ' — the second term has disappeared.' }),
            'Expanding ' + t(sh.shown) + ' gives only ' + t((sh.g * sh.p) + x + y) + '. The second term ' + t(sh.g + x) + ' divided by the GCF ' + t(sh.g + x) + ' is ' + t('1') + ', and that ' + t('1') + ' must stay in the bracket.', ['Expand the student’s answer: do you get both terms back?'], 'error: dropped 1'); } },
          { id: '13c2', sub: 'c ii', level: 'BEG', make: function (r, sh) { return factorPart(sh.terms, { prompt: 'Write the correct factored form of ' + t(sh.poly) + '.' }); } }] },
      /* ---------------- Part B ---------------- */
      { num: '14', section: 'Part B — Multiple Choice and Numerical Response', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '14', level: 'BEG', make: function (r) {
          var g = r.int(2, 6), q = r.int(2, 5), n = r.pick([3, 3, 4]), rn = 'r^{' + n + '}', rm = n - 1 === 1 ? 'r' : 'r^{' + (n - 1) + '}', poly = g + '\\pi ' + rn + '+' + (g * q) + '\\pi r';
          return mcPart(r, t(poly) + ' is equivalent to', [
            { html: t(g + '\\pi^{2}r^{' + (n + 1) + '}'), why: 'The two terms are not like terms, so they can’t be combined into a single term. Factoring writes the sum as a <b>product</b>: GCF × bracket.' },
            { html: t(g + '\\pi(' + rm + '+' + q + 'r)'), why: 'Expand it: ' + t(g + '\\pi ' + rm + '+' + (g * q) + '\\pi r') + ' — the first term should have ' + t(rn) + '. Also ' + t('r') + ' is common to both terms, so it belongs in the GCF.' },
            { html: t(g + '\\pi r(' + rm + '+' + q + ')'), right: true },
            { html: t(g + '\\pi r(' + rm + '+' + q + 'r)'), why: 'Expand it: the second term becomes ' + t((g * q) + '\\pi r^{2}') + '. Once ' + t(g + '\\pi r') + ' is removed, ' + t((g * q) + '\\pi r\\div ' + g + '\\pi r=' + q) + '.' }],
            'The GCF of ' + t(g + '\\pi ' + rn) + ' and ' + t((g * q) + '\\pi r') + ' is ' + t(g + '\\pi r') + ': ' + t(poly + '=' + g + '\\pi r(' + rm + '+' + q + ')') + '.', ['Find the GCF of the two terms (' + t('\\pi') + ' is common too), then divide each term by it.'], 'MC equivalent of ' + plain(poly));
        } }] },
      { num: '15', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '15', level: 'BEG', make: function (r) {
          var g = r.int(2, 6), a = r.int(2, 5), b = pickWhere(function () { return r.int(2, 5); }, function (b) { return b !== a && b !== g && b * b * (g - a) !== g * g; }), v = r.pick(['x', 'x', 'y', 'm']); // last test: the option gx²−bx must not divide the polynomial (g=6, a=2, b=3 made it a second factor)
          var terms = [M(g * a, { [v]: 4 }), M(-g * b, { [v]: 3 }), M(g, { [v]: 2 })], poly = seq(terms), br = seq([M(a, { [v]: 2 }), M(-b, { [v]: 1 }), N(1)]);
          return mcPart(r, 'One factor of ' + t(poly) + ' is', [
            { html: t(tx(terms[0])), why: t(tx(terms[0])) + ' is one <b>term</b> of the polynomial, not a factor of the whole thing: it doesn’t divide ' + t(tx(terms[2])) + '.' },
            { html: t(seq([M(g, { [v]: 2 }), M(-b, { [v]: 1 })])), why: 'Multiply it by anything simple — you can’t get back three terms like these. Factor the polynomial: GCF ' + t(tx(M(g, { [v]: 2 }))) + ' times a bracket.' },
            { html: t(seq([M(g, { [v]: 2 }), M(-g * b, { [v]: 1 }), N(g)])), why: 'This is ' + t(g + '(' + v + '^{2}-' + b + v + '+1)') + ', not a factor of the polynomial. Divide each term by the GCF ' + t(tx(M(g, { [v]: 2 }))) + '.' },
            { html: t(br), right: true }],
            t(poly + '=' + tx(M(g, { [v]: 2 })) + '(' + br + ')') + ', so the two factors are ' + t(tx(M(g, { [v]: 2 }))) + ' and ' + t(br) + '.', ['Factor out the GCF first. What are the two factors?'], 'MC factor of ' + plain(poly));
        } }] },
      { num: '16', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '16', level: 'PRG', make: function (r) {
          var s = q16(r), k = s.count;
          var prompt = 'How many of the following three statements are true?<br>' + s.rows.map(function (row, i) { return ['i', 'ii', 'iii'][i] + ') &nbsp;' + t(row.tex); }).join('<br>');
          var opts = [0, 1, 2, 3].map(function (n) { return { html: t(n), right: n === k, why: n === k ? null : n > k ? 'At least one statement you counted as true is false. Expand the right side of each statement and compare it with the left side.' : 'At least one statement you counted as false is true. Expand the right side of each one carefully.' }; });
          return mcPart(r, prompt, opts, s.rows.map(function (row, i) { return ['i', 'ii', 'iii'][i] + ') ' + (row.truth ? '<b>True</b> — expanding the right side gives the left side.' : '<b>False</b> — ' + row.q.why + '.'); }).join('<br>') + '<br>So ' + t(k) + ' statement' + (k === 1 ? ' is' : 's are') + ' true.', ['Expand the right side of each statement and compare it with the left side.'], 'how many factorizations true', true);
        } }] },
      { num: '17', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '17', level: 'PRG', make: function (r) {
          var o = pickWhere(function () { var a = r.sample([3, 4, 5, 6, 7], 3), b = [r.int(1, 4), r.int(1, 4), r.int(1, 4)]; return { a: a, b: b }; }, function (o) {
            var am = Math.min.apply(null, o.a), bm = Math.min.apply(null, o.b), d = o.a.map(function (x, i) { return x - am + o.b[i] - bm; }); return Math.max.apply(null, d) >= 3 && Math.max.apply(null, o.b) !== bm; });
          var am = Math.min.apply(null, o.a), bm = Math.min.apply(null, o.b), sg = [1, -1, 1];
          var terms = o.a.map(function (x, i) { return M(sg[i], { x: x, y: o.b[i] }); }), G = M(1, { x: am, y: bm }), br = terms.map(function (m) { return divM(m, G); });
          var A = am + bm, degs = br.map(function (m) { var v = vOf(m); return (v.x || 0) + (v.y || 0); }), B = Math.max.apply(null, degs), ans = A + 2 * B, origDeg = Math.max.apply(null, o.a.map(function (x, i) { return x + o.b[i]; }));
          return KP.nr('When ' + t(seq(terms)) + ' is factored, the greatest common factor has degree ' + t('A') + ' and the remaining polynomial factor has degree ' + t('B') + '. The value of ' + t('A+2B') + ' is ________.', ans, function (v) {
            if (v === A + B) return { code: 'nr-sum', hint: 'You found ' + t('A+B') + '. The question asks for ' + t('A+2B') + '.' };
            if (v === 2 * A + B) return { code: 'nr-sum', hint: 'Check which one is doubled: ' + t('A+2B') + ' doubles the degree of the <b>bracket</b>.' };
            if (v === A + 2 * origDeg) return { code: 'nr-sum', hint: t('B') + ' is the degree of the bracket left <b>after</b> removing the GCF, not of the original polynomial.' };
            return null;
          }, 'GCF ' + t('=' + tx(G)) + ', degree ' + t(am + '+' + bm + '=' + A + '=A') + '.<br>Divide: ' + terms.map(function (m, i) { return t(tx(m) + '\\div ' + tx(G) + '=' + tx(br[i])); }).join(', ') + '.<br>The bracket ' + t(seq(br)) + ' has term degrees ' + t(degs.join(',\\ ')) + ', so ' + t('B=' + B) + '.<br>' + t('A+2B=' + A + '+2(' + B + ')=\\mathbf{' + ans + '}'),
          ['The degree of a monomial is the sum of its exponents. The degree of a polynomial is the highest degree of its terms.', 'Find the GCF (lowest power of each letter), then divide each term by it to get the bracket.'], 'NR degrees A+2B');
        } }] },
      { num: '18', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '18', level: 'EMG', make: function (r) {
          var o = pickWhere(function () { return { g: r.int(6, 25), c: cop2(r, 2, 7) }; }, function (o) { return o.g * Math.max(o.c[0], o.c[1]) <= 150; }), v = r.pick(['x', 'x', 'y', 'a']);
          var g = o.g, p = o.c[0], q = o.c[1], ans = g + p - q, terms = [M(g * p, { [v]: 2 }), M(-g * q, { [v]: 1 })];
          return KP.nr('When the greatest common factor is removed from the binomial ' + t(seq(terms)) + ', it can be written in the form ' + t('a' + v + '(b' + v + '+c)') + '. The value of ' + t('a+b+c') + ' is ________.', ans, function (val) {
            if (val === g + p + q) return { code: 'c-sign', hint: 'Check the sign of ' + t('c') + ': the bracket is ' + t(p + v + '-' + q) + ', so ' + t('c=-' + q) + '.' };
            if (g % 2 === 0 && val === g / 2 + 2 * p - 2 * q) return { code: 'not-greatest', hint: t(g / 2 + v) + ' is a common factor, but not the <b>greatest</b>.' };
            return null;
          }, 'GCF: ' + t('\\gcd(' + (g * p) + ',' + (g * q) + ')=' + g) + ', lowest power ' + t(v) + ', so the GCF is ' + t(g + v) + '.<br>' + t(seq(terms) + '=' + g + v + '(' + p + v + '-' + q + ')') + ', so ' + t('a=' + g + ',\\ b=' + p + ',\\ c=-' + q) + ' and ' + t('a+b+c=\\mathbf{' + ans + '}') + '.', ['Factor out the GCF, then read off ' + t('a') + ', ' + t('b') + ' and ' + t('c') + ' — including the sign of ' + t('c') + '.'], 'NR a+b+c for ' + plain(seq(terms)));
        } }] },
      /* ---------------- Part C (Extension) ---------------- */
      { num: '19', section: 'Part C — Extension: Fractional Common Factors', stem: 'In each case, a common factor has been removed so that the remaining factor is an integral binomial. Complete the factoring.', parts: [
        { id: '19a', level: 'EMG', make: function (r) { var n = r.int(2, 6), k = r.pick([1, 1, 2]), v = r.pick(['x', 'y', 'a']), G = M([1, n], { [v]: 1 }), terms = [M([1, n], { [v]: 1 }), M(-k, { [v]: 2 })];
          return backPart(terms, G, { wrong: [{ is: sum([N(1), M(-k, { [v]: 1 })]), code: 'frac-div', hint: 'Dividing by ' + t('\\tfrac{1}{' + n + '}') + ' is the same as <b>multiplying</b> by ' + t(n) + ': ' + t(tx(terms[1]) + '\\div\\tfrac{1}{' + n + '}' + v + '=' + tx(M(-k * n, { [v]: 1 }))) + '.' }], hints: ['Divide each term by ' + t('\\tfrac{1}{' + n + '}' + v) + ' — dividing by ' + t('\\tfrac{1}{' + n + '}') + ' means multiplying by ' + t(n) + '.', 'Check by expanding.'] }); } },
        { id: '19b', level: 'EMG', make: function (r) { var n = r.pick([3, 4, 5]), pq = pickWhere(function () { return [r.int(2, 7), r.int(1, n - 1)]; }, function (x) { return gcd(x[1], n) === 1 && gcd(x[0] * n, x[1]) === 1; }), v = r.pick(['a', 'x', 'm']), G = M([1, n], { [v]: 1 }), terms = [M(pq[0], { [v]: 2 }), M([pq[1], n], { [v]: 1 })];
          return backPart(terms, G, { wrong: [{ is: sum([M(pq[0], { [v]: 1 }), N(pq[1])]), code: 'frac-div', hint: 'Dividing by ' + t('\\tfrac{1}{' + n + '}' + v) + ' means multiplying by ' + t(n) + ' (and dividing by ' + t(v) + '): ' + t(tx(terms[0]) + '\\div\\tfrac{1}{' + n + '}' + v + '=' + (pq[0] * n) + v) + '.' }], hints: ['Divide each term by ' + t('\\tfrac{1}{' + n + '}' + v) + ': multiply the coefficient by ' + t(n) + ' and divide by ' + t(v) + '.', 'Check by expanding.'] }); } },
        { id: '19c', level: 'EMG', make: function (r) { var n = r.int(2, 6), k = r.pick([1, 1, 2]), v = r.pick(['y', 'x', 'n']), G = M([-1, n], { [v]: 1 }), terms = [M([-1, n], { [v]: 2 }), M(-k, { [v]: 1 })];
          return backPart(terms, G, { hints: ['Dividing by a negative changes every sign. Dividing by ' + t('\\tfrac{1}{' + n + '}') + ' means multiplying by ' + t(n) + '.', 'Check by expanding.'] }); } }] },
      { num: '20', stem: 'Complete the factoring and check mentally by expanding the factored form.', parts: [
        { id: '20a', level: 'BEG', make: function (r) { var n = r.int(3, 9), k = pickWhere(function () { return r.int(2, n - 1); }, function (k) { return gcd(k, n) === 1; }), v = r.pick(['n', 'x', 'a', 'm']), B = sum([M(1, { [v]: 1 }), N(-k)]), G = N([1, n]);
          return frontPart(PL.mul(G, B), G, B); } },
        { id: '20b', level: 'EMG', make: function (r) { var o = r.pick([[2, 6], [2, 4], [3, 6], [2, 8], [3, 9], [2, 10], [3, 12], [4, 12], [5, 10]]), v = r.pick(['x', 'y', 'a']), B = sum([M(o[0], { [v]: 2 }), N(1)]), G = M([1, o[1]], { [v]: 1 });
          return frontPart(PL.mul(G, B), G, B); } },
        { id: '20c', level: 'EMG', make: function (r) { var o = r.pick([[0.2, 2, 5], [0.2, 3, 5], [0.5, 2, 3], [0.5, 3, 4], [0.25, 2, 3], [0.2, 4, 5], [0.5, 4, 3]]), v = r.pick(['a', 'x', 't']), d = o[0], G = M(ex.norm(Math.round(d * 100), 100), { [v]: 1 }), B = sum([M(o[1], { [v]: 2 }), N(-o[2])]), P = PL.mul(G, B);
          return frontPart(P, G, B, { dec: true, polyTex: tx(P, { dec: true }), keyTex: decStr(d) + v, good: [tx(G)] }); } }] },
      { num: '21', stem: 'In each case, remove a common factor so that the remaining factor is an <b>integral</b> polynomial (whole-number coefficients).', parts: [
        { id: '21a', level: 'BEG', make: function (r) { var n = r.int(2, 9), v = r.pick(['x', 'y', 'a']); return factorPart([N([1, n]), M([1, n], { [v]: 1 })], fracOpt()); } },
        { id: '21b', level: 'BEG', make: function (r) { var n = r.int(3, 9), k = pickWhere(function () { return r.int(2, 9); }, function (k) { return gcd(k, n) === 1; }), v = r.pick(['m', 'x', 'p']); return factorPart([M([1, n], { [v]: 1 }), N([-k, n])], fracOpt()); } },
        { id: '21c', level: 'PRG', make: function (r) {
          var o = pickWhere(function () { var q = r.sample([2, 3, 4, 5, 6], 2); return { q: q, p: [r.int(1, q[0] - 1), r.int(1, q[1] - 1)] }; }, function (o) { return gcd(o.p[0], o.q[0]) === 1 && gcd(o.p[1], o.q[1]) === 1 && lcm(o.q[0], o.q[1]) > Math.max(o.q[0], o.q[1]); });
          var L = r.pick([['a', 'b', 'h'], ['x', 'y', 'k'], ['m', 'n', 't']]);
          return factorPart([M([o.p[0], o.q[0]], { [L[0]]: 1, [L[2]]: 1 }), M([-o.p[1], o.q[1]], { [L[1]]: 1, [L[2]]: 1 })], fracOpt()); } },
        { id: '21d', level: 'EMG', make: function (r) { var o = pickWhere(function () { return { p: r.int(2, 5), q: r.int(3, 8), k: r.int(2, 5) }; }, function (o) { return gcd(o.p, o.q) === 1 && o.p < o.q; }), v = r.pick(['x', 'y', 'a']);
          return factorPart([M([o.p, o.q], { [v]: 1 }), N(o.p * o.k)], fracOpt()); } },
        { id: '21e', level: 'EMG', make: function (r) { var d = r.pick([2, 2, 3]), o = pickWhere(function () { return { p: r.int(2, 9), k: r.pick([1, 1, 2]) }; }, function (o) { return gcd(o.p, d) === 1 && gcd(o.p, d * o.k) === 1; }), v = r.pick(['x', 'y', 'm']);
          return factorPart([M([o.p, d], { [v]: 2 }), N(-o.k)], fracOpt()); } },
        { id: '21f', level: 'EMG', make: function (r) { var d = r.pick([3, 3, 4, 5]), o = pickWhere(function () { return { b: r.int(1, d - 1), c: r.int(1, d + 3) }; }, function (o) { return gcd(o.b, d) === 1 && gcd(o.c, d) === 1 && o.b !== o.c; }), v = r.pick(['z', 'x', 'y']);
          return factorPart([M(1, { [v]: 2 }), M([-o.b, d], { [v]: 1 }), N([o.c, d])], fracOpt()); } },
        { id: '21g', level: 'PRG', make: function (r) { var o = pickWhere(function () { return { p: r.int(2, 7), q: r.int(2, 5) }; }, function (o) { return gcd(o.p, o.q) === 1; });
          return factorPart([M([o.p, o.q], { Q: 1, r: 3 }), M(-o.p, { Q: 1, r: 2 })], fracOpt({ pi: true })); } },
        { id: '21h', level: 'PRG', make: function (r) { var n = r.int(2, 5); return factorPart([M([1, n], { A: 1, h: 1 }), M(1, { Q: 1, r: 2, h: 1 })], fracOpt({ pi: true })); } }] },
      { num: '22', stem: 'An object is thrown down from a high building. The distance, ' + t('s') + ' metres, travelled by the object in ' + t('t') + ' seconds is given by ' + t('s=vt+\\tfrac{1}{2}at^{2}') + '.', parts: [
        { id: '22a', level: 'PRG', make: function (r) {
          return factorPart([M(1, { v: 1, t: 1 }), M([1, 2], { a: 1, t: 2 })], fracOpt({ prompt: 'Express ' + t('s') + ' in factored form (so the bracket has whole-number coefficients).', inBefore: t('s='), before: 's=', text: 'factor s = vt + ½at²' }));
        } },
        { id: '22b', level: 'BEG', make: function (r) {
          var tt = r.pick([0.5, 1.5, 2, 2.5, 3]), v = r.int(2, 9), a = 10, s = 0.5 * tt * (2 * v + a * tt), sR = Math.round(s * 1000) / 1000;
          return KP.number('Use the factored form ' + t('s=\\tfrac{1}{2}t(2v+at)') + ' to calculate the distance travelled in ' + t(tt + '\\text{ s}') + ' if ' + t('v=' + v) + ' and ' + t('a=' + a) + '.', sR, function (x) {
            var noHalf = tt * (2 * v + a * tt); if (Math.abs(x - noHalf) < 1e-9) return { code: 'half', hint: 'Don’t forget the ' + t('\\tfrac{1}{2}') + ' in front: ' + t('s=\\tfrac{1}{2}t(2v+at)') + '.' };
            if (Math.abs(x - 0.5 * tt * (v + a * tt)) < 1e-9) return { code: 'value', hint: 'Inside the bracket it is ' + t('2v') + ', not ' + t('v') + '.' };
            return null;
          }, t('s=\\tfrac{1}{2}t(2v+at)=\\tfrac{1}{2}(' + tt + ')\\big(2(' + v + ')+' + a + '(' + tt + ')\\big)=' + (tt / 2) + '(' + (2 * v + a * tt) + ')=\\mathbf{' + sR + '}\\text{ m}'), ['Substitute into ' + t('s=\\tfrac{1}{2}t(2v+at)') + ': work out the bracket first.'], 'distance s at t=' + tt, { after: t('\\text{m}') });
        } }] },
      { num: '23', stem: function (sh) { return 'Identify and explain the error in each polynomial factorization.<br>(a) &nbsp;' + t(sh.a.shown); },
        shared: function (r) { var n = r.pick([2, 3, 4, 5]), k = r.pick([2, 2, 3]), m = n * k, v = r.pick(['x', 'y', 'a']);
          return { a: { n: n, k: k, m: m, v: v, shown: '\\tfrac{1}{' + n + '}' + v + '^{2}-\\tfrac{1}{' + m + '}' + v + '=\\tfrac{1}{' + n + '}' + v + '(' + v + '-' + k + ')', terms: [M([1, n], { [v]: 2 }), M([-1, m], { [v]: 1 })] } }; },
        parts: [
          { id: '23a1', sub: 'a i', level: 'EMG', make: function (r, sh) { var a = sh.a, v = a.v;
            return mcPart(r, 'What is the error in (a)?', [
              { html: 'The factor ' + t('\\tfrac{1}{' + a.n + '}' + v) + ' is too large: expanding gives ' + t('\\tfrac{1}{' + a.n + '}' + v + '^{2}-\\tfrac{' + a.k + '}{' + a.n + '}' + v) + '. The common factor should be ' + t('\\tfrac{1}{' + a.m + '}' + v) + '.', right: true },
              { html: 'The bracket should not contain ' + t(v) + '.', why: 'Check the first term: ' + t('\\tfrac{1}{' + a.n + '}' + v + '\\cdot ' + v + '=\\tfrac{1}{' + a.n + '}' + v + '^{2}') + ' — that part is right. Expand the second term.' },
              { html: 'A sign is wrong inside the bracket.', why: 'Both signs match the question. Expand the second term and compare its <b>size</b>.' },
              { html: 'There is no error.', why: 'Expand it: ' + t('\\tfrac{1}{' + a.n + '}' + v + '(-' + a.k + ')=-\\tfrac{' + a.k + '}{' + a.n + '}' + v) + ', not ' + t('-\\tfrac{1}{' + a.m + '}' + v) + '.' }],
              'Expanding: ' + t('\\tfrac{1}{' + a.n + '}' + v + '(' + v + '-' + a.k + ')=\\tfrac{1}{' + a.n + '}' + v + '^{2}-\\tfrac{' + a.k + '}{' + a.n + '}' + v) + ', which is not the original. Over a common denominator the coefficients are ' + t('\\tfrac{' + a.k + '}{' + a.m + '}') + ' and ' + t('\\tfrac{1}{' + a.m + '}') + ', so the common factor is ' + t('\\tfrac{1}{' + a.m + '}' + v) + '.', ['Expand the student’s answer and compare it with the original.'], 'fraction GCF error (too large)'); } },
          { id: '23a2', sub: 'a ii', level: 'PRG', make: function (r, sh) { var a = sh.a; return factorPart(a.terms, fracOpt({ prompt: 'Write the correct factorization of ' + t(seq(a.terms)) + ' (integral bracket).', wrong: [{ is: [M([1, a.n], { [a.v]: 1 }), sum([M(1, { [a.v]: 1 }), N(-a.k)])], code: 'kept-error', hint: 'That’s the student’s answer — expand it and compare the second term.', tex: '\\frac{1}{' + a.n + '}' + a.v + '(' + a.v + '-' + a.k + ')' }] })); } }] },
      { num: '23', stem: function (sh) { return '(b) &nbsp;' + t(sh.shown); },
        shared: function (r) { var n = r.pick([2, 3, 4, 5]), k = r.pick([2, 3]); return { n: n, k: k, shown: '\\tfrac{1}{' + n + '}\\pi r^{2}-' + k + '\\pi r=\\tfrac{1}{' + n + '}\\pi r(r-' + (n * k) + '\\pi)', terms: [M([1, n], { Q: 1, r: 2 }), M(-k, { Q: 1, r: 1 })] }; },
        parts: [
          { id: '23b1', sub: 'b i', level: 'EMG', make: function (r, sh) { var n = sh.n, nk = n * sh.k;
            return mcPart(r, 'What is the error in (b)?', [
              { html: t('\\pi') + ' was already taken out as part of the common factor ' + t('\\tfrac{1}{' + n + '}\\pi r') + ', so it must not appear again inside the bracket.', right: true },
              { html: 'The common factor should be ' + t('\\tfrac{1}{' + n + '}r') + ', without ' + t('\\pi') + '.', why: t('\\pi') + ' is in <b>both</b> terms, so it does belong in the common factor. The problem is inside the bracket.' },
              { html: 'The number inside the bracket should be ' + t(sh.k) + ', not ' + t(nk) + '.', why: 'Dividing by ' + t('\\tfrac{1}{' + n + '}') + ' multiplies by ' + t(n) + ': ' + t(sh.k + '\\times ' + n + '=' + nk) + ' is right. Look at what else is in that term.' },
              { html: 'There is no error.', why: 'Expand it: ' + t('\\tfrac{1}{' + n + '}\\pi r(-' + nk + '\\pi)=-' + sh.k + '\\pi^{2}r') + ', not ' + t('-' + sh.k + '\\pi r') + '.' }],
              'Expanding the second term gives ' + t('\\tfrac{1}{' + n + '}\\pi r(-' + nk + '\\pi)=-' + sh.k + '\\pi^{2}r') + '. Dividing correctly, ' + t('-' + sh.k + '\\pi r\\div\\tfrac{1}{' + n + '}\\pi r=-' + nk) + ', so the correct form is ' + t('\\tfrac{1}{' + n + '}\\pi r(r-' + nk + ')') + '.', ['Expand the second term of the student’s answer.'], 'fraction GCF error (π inside)'); } },
          { id: '23b2', sub: 'b ii', level: 'EMG', make: function (r, sh) { return factorPart(sh.terms, fracOpt({ pi: true, prompt: 'Write the correct factorization of ' + t(seq(sh.terms)) + ' (integral bracket).', wrong: [{ is: [M([1, sh.n], { Q: 1, r: 1 }), sum([M(1, { r: 1 }), M(-sh.n * sh.k, { Q: 1 })])], code: 'pi-inside', hint: t('\\pi') + ' is already in the common factor — leave it out of the bracket.', tex: '\\frac{1}{' + sh.n + '}Qr(r-' + (sh.n * sh.k) + 'Q)' }] })); } }] }
    ],
    extra: [
      { num: '1', section: 'Extra practice A — The GCF when a letter is missing', stem: 'State the greatest common factor of each set of monomials. In most sets at least one letter is missing from at least one monomial.', parts: [
        { id: 'e1a', level: 'BEG', make: function (r) { var L = r.pick([['a', 'b', 'c'], ['x', 'y', 'z'], ['m', 'n', 'p']]); return gcfPart(setWhere(r, { g: [6, 8, 10, 12], mu: r.pick([[2, 3], [3, 2], [3, 4], [2, 5]]), L: L, pres: [[[2, 4], [1, 3]], [[1, 3], [1, 3]], [0, 1]] }, function (l) { return spread(l, L[0]) && cv(l[1]) <= 60 && cv(l[0]) <= 60; })); } },
        { id: 'e1b', level: 'EMG', make: function (r) { var L = r.pick([['x', 'y', 'z'], ['a', 'b', 'c'], ['p', 'q', 'r']]); return gcfPart(setWhere(r, { g: [5, 10, 12, 15], mu: r.pick([[3, 4], [4, 3], [2, 3], [4, 5]]), L: L, pres: [[[2, 5], [2, 5]], [[1, 3], 0], [[1, 2], [2, 4]]] }, function (l) { return spread(l, L[0]) && cv(l[0]) <= 60 && cv(l[1]) <= 75; })); } },
        { id: 'e1c', level: 'EMG', make: function (r) { var L = r.pick([['m', 'n'], ['a', 'b'], ['x', 'y']]); return gcfPart(setWhere(r, { g: [7, 9, 12, 14], mu: r.pick([[3, 5, 4], [2, 3, 5], [4, 5, 3]]), L: L, pres: [[[2, 5], [2, 5], [2, 5]], [[1, 4], [1, 4], 0]] }, function (l) { return spread(l, L[0]) && Math.max(cv(l[0]), cv(l[1]), cv(l[2])) <= 75; })); } },
        { id: 'e1d', level: 'EMG', make: function (r) { var L = r.pick([['p', 'q', 'r'], ['a', 'b', 'c'], ['x', 'y', 'z']]); return gcfPart(setWhere(r, { g: [3, 6, 9], mu: r.pick([[2, 3, 5], [3, 2, 5], [2, 5, 3]]), L: L, pres: [[[1, 3], [1, 3], [1, 3]], [[2, 4], [2, 4], [2, 4]], [[1, 2], 0, [1, 2]]] }, function (l) { return spread(l, L[0]) && spread(l, L[1]); })); } },
        { id: 'e1e', level: 'EMG', make: function (r) { var L = r.pick([['u', 'v', 'w'], ['a', 'b', 'c'], ['x', 'y', 'z']]); return gcfPart(setWhere(r, { g: [8, 12, 16, 24], mu: r.pick([[2, 3], [3, 2], [3, 4]]), L: L, signs: [-1, -1], pres: [[[2, 5], [2, 5]], [[2, 4], [2, 4]], [0, 1]] }, function (l) { return spread(l, L[0]) && spread(l, L[1]) && Math.abs(cv(l[0])) <= 96 && Math.abs(cv(l[1])) <= 96; })); } },
        { id: 'e1f', level: 'EMG', make: function (r) { var L = r.pick([['c', 'd'], ['a', 'b'], ['x', 'y']]); return gcfPart(setWhere(r, { g: [4, 8, 16], mu: r.pick([[2, 5, 3], [3, 5, 2], [2, 3, 5]]), L: L, signs: [1, -1, 1], pres: [[[1, 4], [1, 4], [1, 4]], [[1, 3], [1, 3], [1, 3]]] }, function (l) { return spread(l, L[0]) && spread(l, L[1]); })); } }] },
      { num: '2', stem: function (sh) { return 'Two monomials have a greatest common factor of ' + t(tx(sh.G)) + '. One of the two monomials is ' + t(tx(sh.A)) + '.'; },
        shared: function (r) { var g = r.pick([6, 8, 10, 12, 15]), k = r.pick([3, 2, 5]), L = r.pick([['x', 'y'], ['a', 'b'], ['m', 'n']]), a = r.int(1, 2), b = r.int(1, 2);
          var G = M(g, { [L[0]]: a + 1, [L[1]]: b }), A = M(g * k, { [L[0]]: a + 2, [L[1]]: b + 1 }), k2 = r.pick([2, 3, 4, 5, 7].filter(function (x) { return gcd(x, k) === 1; }));
          return { g: g, k: k, L: L, a: a + 1, b: b, G: G, A: A, B: M(g * k2, { [L[0]]: a + 1, [L[1]]: b + 2 }) }; },
        parts: [
          { id: 'e2a', level: 'ADV', make: function (r, sh) { return secondMonoPart(sh); } },
          { id: 'e2b', level: 'EMG', make: function (r, sh) { var p = gcfPart([sh.A, sh.B], { prompt: 'Find the GCF of ' + t(tx(sh.A)) + ' and ' + t(tx(sh.B)) + ' to show that ' + t(tx(sh.B)) + ' cannot be the second monomial.' }); p.solution += '<br>That is not ' + t(tx(sh.G)) + ', so ' + t(tx(sh.B)) + ' cannot be the second monomial.'; return p; } },
          { id: 'e2c', level: 'EMG', make: function (r, sh) {
            return mcPart(r, 'Why can a letter that is missing from even one monomial of a set never appear in that set’s GCF?', [
              { html: 'The GCF must divide <b>every</b> monomial. A monomial without the letter has it to the power ' + t('0') + ', so the lowest power is ' + t('0') + ' and the letter contributes ' + t('1') + '.', right: true },
              { html: 'Letters are never part of a GCF; only numbers are.', why: 'Letters can be common factors: the GCF of ' + t('6x^{2}') + ' and ' + t('9x') + ' is ' + t('3x') + '.' },
              { html: 'Because you always take the highest power of each letter, and a missing letter has no power.', why: 'You take the <b>lowest</b> power, not the highest. A missing letter has power ' + t('0') + ' in that monomial.' },
              { html: 'It can appear, as long as it is in most of the monomials.', why: 'A common factor has to divide <b>every</b> monomial in the set, not most of them.' }],
              'A common factor must divide every monomial. If one monomial has no factor ' + t(sh.L[1]) + ', then ' + t(sh.L[1]) + ' does not divide it, so the lowest power of ' + t(sh.L[1]) + ' in the set is ' + t(sh.L[1] + '^{0}=1') + '.', [], 'why a missing letter is not in the GCF');
          } }] },
      { num: '3', section: 'Extra practice B — Factoring out a negative common factor', stem: 'Factor each polynomial by removing a <b>negative</b> common factor, so that the first term inside the bracket is positive. Every sign inside the bracket changes — check each one by expanding.', parts: [
        { id: 'e3a', level: 'EMG', make: function (r) { var g = r.int(2, 7), c = r.pick([[2, 3, 5], [2, 5, 3], [3, 2, 4], [4, 3, 5]]), v = r.pick(['x', 'y', 'a']), e = r.int(1, 2); return negPart([M(-g * c[0], { [v]: e + 2 }), M(g * c[1], { [v]: e + 1 }), M(-g * c[2], { [v]: e })]); } },
        { id: 'e3b', level: 'EMG', make: function (r) { var g = r.int(2, 6), c = r.pick([[2, 5, 3], [3, 2, 5], [2, 3, 5], [5, 2, 3]]), L = r.pick(PAIRS); return negPart([M(-g * c[0], { [L[0]]: 2, [L[1]]: 1 }), M(-g * c[1], { [L[0]]: 1, [L[1]]: 2 }), M(g * c[2], { [L[0]]: 1, [L[1]]: 1 })]); } },
        { id: 'e3c', level: 'EMG', make: function (r) { var g = r.int(2, 5), c = r.pick([[3, 5, 4], [2, 5, 3], [4, 3, 5], [3, 4, 2]]), v = r.pick(['m', 'x', 'y']), e = r.int(1, 2); return negPart([M(-g * c[0], { [v]: e + 2 }), M(g * c[1], { [v]: e + 1 }), M(g * c[2], { [v]: e })]); } },
        { id: 'e3d', level: 'BEG', make: function (r) { var g = r.pick([4, 6, 8, 10, 12]), c = r.pick([[2, 3], [3, 2], [3, 4], [2, 5]]), L = r.pick(PAIRS), a = r.int(1, 2), b = r.int(1, 2); return negPart([M(-g * c[0], { [L[0]]: a + 1, [L[1]]: b }), M(-g * c[1], { [L[0]]: a, [L[1]]: b + 1 })]); } },
        { id: 'e3e', level: 'EMG', make: function (r) { var L = r.pick(PAIRS), x = L[0], y = L[1]; return negPart([M(-1, { [x]: 2, [y]: 1 }), M(1, { [x]: 1, [y]: 2 }), M(-1, { [x]: 1, [y]: 1 })]); } },
        { id: 'e3f', level: 'EMG', make: function (r) { var g = r.int(3, 9), c = r.pick([[5, 3, 2], [4, 3, 2], [5, 2, 3], [2, 5, 3]]), L = r.pick([['u', 'v'], ['x', 'y'], ['a', 'b']]), a = r.int(1, 2), b = r.int(1, 2);
          return negPart([M(-g * c[0], { [L[0]]: a + 3, [L[1]]: b }), M(g * c[1], { [L[0]]: a + 1, [L[1]]: b + 2 }), M(-g * c[2], { [L[0]]: a, [L[1]]: b + 1 })]); } }] },
      { num: '4', stem: function (sh) { return 'The lesson’s rule is: <i>if every monomial is negative, take the GCF negative too</i>. Consider (a) ' + t(seq(sh.A)) + ' and (b) ' + t(seq(sh.B)) + '.'; },
        shared: function (r) { var g = r.int(3, 9), c = r.pick([[2, 3, 1], [3, 2, 1], [2, 5, 1], [3, 4, 1]]), v = r.pick(['y', 'x', 'm']), h = r.int(2, 7), d = r.pick([[2, 3], [3, 2], [3, 4], [2, 5]]), L = r.pick(PAIRS);
          return { A: [M(-g * c[0], { [v]: 3 }), M(-g * c[1], { [v]: 2 }), M(-g * c[2], { [v]: 1 })], B: [M(-h * d[0], { [L[0]]: 1, [L[1]]: 1 }), M(h * d[1], { [L[1]]: 2 })] }; },
        parts: [
          { id: 'e4a1', sub: 'a i', level: 'BEG', make: function (r, sh) { var G = gcfOf(sh.A); return factorPart(sh.A, { g: PL.neg(G), mustNeg: false, mustPos: true, signNote: 'This part asks for the <b>positive</b> common factor, so the bracket keeps the negative signs.', prompt: '(a)(i) Factor ' + t(seq(sh.A)) + ' removing a <b>positive</b> common factor.', text: 'positive factor of ' + plain(seq(sh.A)) }); } },
          { id: 'e4a2', sub: 'a ii', level: 'BEG', make: function (r, sh) { return factorPart(sh.A, { prompt: '(a)(ii) Factor ' + t(seq(sh.A)) + ' removing a <b>negative</b> common factor.', text: 'negative factor of ' + plain(seq(sh.A)) }); } },
          { id: 'e4b1', sub: 'b i', level: 'EMG', make: function (r, sh) { return factorPart(sh.B, { mustPos: true, signNote: 'This part asks for the <b>positive</b> common factor.', prompt: '(b)(i) Factor ' + t(seq(sh.B)) + ' removing a <b>positive</b> common factor.', text: 'positive factor of ' + plain(seq(sh.B)) }); } },
          { id: 'e4b2', sub: 'b ii', level: 'EMG', make: function (r, sh) { var G = gcfOf(sh.B); return factorPart(sh.B, { g: PL.neg(G), forceNeg: true, mustNeg: true, negMsg: 'Equal — but this part asks for a <b>negative</b> common factor (then the bracket starts with a positive term).', prompt: '(b)(ii) Factor ' + t(seq(sh.B)) + ' removing a <b>negative</b> common factor.', text: 'negative factor of ' + plain(seq(sh.B)) }); } },
          { id: 'e4c', sub: 'iii', level: 'EMG', make: function (r, sh) {
            return KP.grid('(iii) For each polynomial, which common factor does the rule select?', [{ id: 'a', html: '(a) ' + t(seq(sh.A)) }, { id: 'b', html: '(b) ' + t(seq(sh.B)) }], [{ id: 'pos', html: 'positive' }, { id: 'neg', html: 'negative' }], { a: 'neg', b: 'pos' },
              { why: function (row) { return row === 'a' ? 'Every term of (a) is negative, so the rule takes the GCF negative.' : 'Not every term of (b) is negative (one is positive), so the GCF stays positive.'; }, tries: 2 },
              '(a) every term is negative → the rule selects the <b>negative</b> factor ' + t(tx(gcfOf(sh.A))) + '.<br>(b) one term is positive → the rule selects the <b>positive</b> factor ' + t(tx(gcfOf(sh.B))) + '.', ['Look at the sign of every term.'], 'which sign the rule selects');
          } },
          { id: 'e4d', sub: 'c', level: 'PRG', make: function (r, sh) {
            return mcPart(r, '(c) Why does “every term negative” decide the sign of the common factor?', [
              { html: 'Removing a negative factor flips <b>every</b> sign in the bracket. Only when every term is negative does the flip leave all the bracket’s terms positive; otherwise it just trades one negative sign for another.', right: true },
              { html: 'A negative factor is always greater than a positive one.', why: 'The size of the factor doesn’t change — ' + t('7y') + ' and ' + t('-7y') + ' have the same size. Think about what the sign does to the terms in the bracket.' },
              { html: 'Taking out a negative factor changes the value of the polynomial.', why: 'Both factorizations are equal to the original (expand them). The rule is about which form is <b>neater</b>.' },
              { html: 'You can only factor out a negative when the first term is positive.', why: 'You can factor out a negative from any polynomial. The question is when it helps.' }],
              'In (a), the positive factor leaves a bracket with all negative terms and the negative factor flips them all positive — a real gain. In (b), either choice leaves one negative term in the bracket, so nothing is gained and the GCF stays positive.', [], 'why every term negative decides the sign');
          } }] },
      { num: '5', section: 'Extra practice C — Fractional and decimal common factors', stem: 'Remove a common factor from each polynomial so that the remaining factor is an <b>integral</b> polynomial — every coefficient inside the bracket must be a whole number.', parts: [
        { id: 'e5a', level: 'PRG', make: function (r) { var o = pickWhere(function () { return { p: r.pick([1, 3, 5]), q: r.pick([4, 6, 8]), k: r.int(2, 7) }; }, function (o) { return gcd(o.p, o.q) === 1 && gcd(o.p * o.k, o.q) > 1; }), v = r.pick(['x', 'y', 'a']);
          return factorPart([M([o.p, o.q], { [v]: 2 }), M([-o.p * o.k, o.q], { [v]: 1 })], fracOpt()); } },
        { id: 'e5b', level: 'PRG', make: function (r) { var d = r.pick([6, 6, 4, 8, 10]), o = pickWhere(function () { return [r.int(1, d - 1), r.int(1, d - 1), r.int(1, d - 1)]; }, function (c) { return gcdA(c.concat([d])) === 1 && c.filter(function (x) { return gcd(x, d) > 1; }).length >= 1 && c[0] !== c[1]; }), v = r.pick(['a', 'x', 'm']);
          return factorPart([M([o[0], d], { [v]: 3 }), M([o[1], d], { [v]: 2 }), M([-o[2], d], { [v]: 1 })], fracOpt()); } },
        { id: 'e5c', level: 'PRG', make: function (r) { var o = pickWhere(function () { return { p: r.int(1, 4), q: r.pick([9, 15, 21, 10, 14]), a: r.int(2, 5), b: r.int(2, 5) }; }, function (o) { return gcd(o.p, o.q) === 1 && gcd(o.a, o.b) === 1 && o.p * o.a !== o.p * o.b && gcd(o.p * o.a, o.q) > 1; }), L = r.pick([['m', 'n'], ['a', 'b'], ['x', 'y']]);
          return factorPart([M([o.p * o.a, o.q], { [L[0]]: 2, [L[1]]: 1 }), M([-o.p * o.b, o.q], { [L[0]]: 1, [L[1]]: 2 })], fracOpt()); } },
        { id: 'e5d', level: 'EMG', make: function (r) { var o = pickWhere(function () { return { d: r.pick([1, 2, 3, 4]), c: r.pick([[2, 3, 1], [3, 2, 1], [2, 5, 1], [4, 3, 1]]) }; }, function (o) { return o.c.every(function (k) { return (o.d * k) % 10 !== 0; }); }), d = o.d, c = o.c, v = r.pick(['x', 'y', 'a']);
          return factorPart([M([d * c[0], 10], { [v]: 3 }), M([d * c[1], 10], { [v]: 2 }), M([-d * c[2], 10], { [v]: 1 })], fracOpt({ dec: true })); } },
        { id: 'e5e', level: 'EMG', make: function (r) { var o = pickWhere(function () { return { d: r.pick([2, 3, 4, 6]), c: cop2(r, 2, 5) }; }, function (o) { return o.c.every(function (k) { return (o.d * k) % 10 !== 0; }); }), d = o.d, c = o.c, L = r.pick(PAIRS);
          return factorPart([M([d * c[0], 10], { [L[0]]: 1, [L[1]]: 2 }), M([d * c[1], 10], { [L[0]]: 2, [L[1]]: 1 })], fracOpt({ dec: true })); } },
        { id: 'e5f', level: 'PRG', make: function (r) { var q = r.pick([6, 8, 10, 12]), o = pickWhere(function () { return [r.int(1, 5), r.int(1, 5)]; }, function (c) { return gcd(c[0], c[1]) === 1 && c[0] !== c[1] && (gcd(c[0], q) > 1 || gcd(c[1], q) > 1) && gcdA([c[0], c[1], q]) === 1; });
          return factorPart([M([-o[0], q], { Q: 1, r: 3 }), M([-o[1], q], { Q: 1, r: 2, h: 1 })], fracOpt({ pi: true })); } }] },
      { num: '6', stem: 'Complete the factoring. Check each answer by expanding.', parts: [
        { id: 'e6a', level: 'EMG', make: function (r) { var o = pickWhere(function () { return { p: r.int(1, 4), q: r.pick([3, 5, 7, 9]), c: cop2(r, 2, 5) }; }, function (o) { return gcd(o.p, o.q) === 1 && o.p < o.q; }), v = r.pick(['x', 'y', 'a']), G = M([o.p, o.q], { [v]: 1 }), B = sum([M(o.c[0], { [v]: 1 }), N(-o.c[1])]);
          return frontPart(PL.mul(G, B), G, B); } },
        { id: 'e6b', level: 'EMG', make: function (r) { var d = r.pick([0.25, 0.2, 0.5, 0.4]), k = r.int(2, 5), v = r.pick(['t', 'x', 'a']), G = M(ex.norm(Math.round(d * 100), 100), { [v]: 1 }), B = sum([M(1, { [v]: 1 }), N(k)]), P = PL.mul(G, B);
          return frontPart(P, G, B, { dec: true, polyTex: tx(P, { dec: true }), keyTex: decStr(d) + v, good: [tx(G)] }); } },
        { id: 'e6c', level: 'EMG', make: function (r) { var q = r.pick([4, 6, 8, 10]), a = pickWhere(function () { return r.int(2, q - 1); }, function (a) { return gcd(a, q) > 1; }), L = r.pick([['b', 'h'], ['x', 'y'], ['m', 'n']]), G = M([1, q], { [L[0]]: 1 }), B = sum([M(a, { [L[1]]: 1 }), M(1, { [L[0]]: 1 })]);
          return frontPart(PL.mul(G, B), G, B, { polyTex: seq([M([a, q], { [L[0]]: 1, [L[1]]: 1 }), M([1, q], { [L[0]]: 2 })]), brTex: a + L[1] + '+' + L[0] }); } }] },
      { num: '11', section: 'Extra practice D — Working backwards', stem: 'Each line gives a polynomial already in factored form. Recover the original polynomial by expanding.', parts: [
        { id: 'e11a', level: 'BEG', make: function (r) { var g = r.int(2, 8), c = r.pick([[2, 3, 4], [3, 2, 5], [2, 5, 3], [4, 3, 2]]), L = r.pick(PAIRS), G = M(g, { [L[0]]: 2, [L[1]]: 1 }), br = [M(c[0], { [L[0]]: 1 }), M(-c[1], { [L[1]]: 1 }), N(c[2])];
          return expandPart('The GCF is ' + t(tx(G)) + ' and the other factor is ' + t(seq(br)) + '.', G, br); } },
        { id: 'e11b', level: 'BEG', make: function (r) { var g = r.int(2, 7), c = r.pick([[3, 2], [2, 3], [4, 3], [5, 2]]), L = r.pick(PAIRS), G = M(-g, { [L[0]]: 1, [L[1]]: 1 }), br = [M(c[0], { [L[0]]: 1 }), M(-c[1], { [L[1]]: 1 }), N(1)];
          return expandPart(t(tx(G) + '(' + seq(br) + ')'), G, br); } },
        { id: 'e11c', level: 'EMG', make: function (r) { var n = r.pick([3, 4, 5, 6]), o = pickWhere(function () { return [r.int(1, 4) * n, r.int(1, 3) * n, r.int(1, n - 1)]; }, function (c) { return gcd(c[2], n) === 1 && c[0] !== c[1]; }), v = r.pick(['m', 'x', 'y']), G = M([1, n], { [v]: 1 }), br = [M(o[0], { [v]: 2 }), M(-o[1], { [v]: 1 }), N(o[2])];
          return expandPart(t(tx(G) + '(' + seq(br) + ')'), G, br); } }] },
      { num: '12', stem: 'In each case the greatest common factor is given. Determine the factor that goes inside the bracket.', parts: [
        { id: 'e12a', level: 'BEG', make: function (r) { var g = r.int(3, 15), c = r.pick([[2, 3, 4], [3, 2, 5], [2, 5, 3], [4, 3, 2]]), L = r.pick(PAIRS), G = M(g, { [L[0]]: 2, [L[1]]: 2 });
          var terms = [M(g * c[0], { [L[0]]: 4, [L[1]]: 2 }), M(-g * c[1], { [L[0]]: 3, [L[1]]: 3 }), M(g * c[2], { [L[0]]: 2, [L[1]]: 2 })];
          return backPart(terms, G, { prompt: t(seq(terms)) + ', GCF ' + t(tx(G)) + '. Write the polynomial in factored form by completing the bracket.' }); } },
        { id: 'e12b', level: 'EMG', make: function (r) { var g = r.int(2, 9), k = r.int(2, 5), L = r.pick(PAIRS), G = M(-g, { [L[0]]: 2, [L[1]]: 1 }), T = M(g * k, { [L[0]]: 3, [L[1]]: 2 }), want = divM(T, G);
          return KP.poly('A polynomial has GCF ' + t(tx(G)) + ', and one of its terms is ' + t(tx(T)) + '. State the matching term inside the bracket.', want, { wrong: [{ is: PL.neg(want), code: 'neg-signs', hint: 'The GCF is negative, so the sign flips: ' + t(tx(T) + '\\div(' + tx(G) + ')') + ' is negative.' }] },
            'The GCF is negative, so the sign flips: ' + t(tx(T) + '\\div(' + tx(G) + ')=\\mathbf{' + tx(want) + '}') + '.<br>Check: ' + t(pg(G) + pg(want) + '=' + tx(T)) + ' ✓', ['Divide the term by the GCF. Watch the sign.'], 'matching term for ' + tx(T)); } },
        { id: 'e12c', level: 'BEG', make: function (r) { var g = r.int(3, 9), c = r.pick([[3, 2, 5], [2, 3, 5], [4, 3, 2], [5, 2, 3]]), L = r.pick(PAIRS), G = M(g, { [L[0]]: 2, [L[1]]: 1 });
          return backPart([M(g * c[0], { [L[0]]: 3, [L[1]]: 1 }), M(-g * c[1], { [L[0]]: 2, [L[1]]: 2 }), M(g * c[2], { [L[0]]: 2, [L[1]]: 1 })], G); } }] },
      { num: '14', section: 'Extra practice E — Find the error', stem: function (sh) { return 'Asked to factor ' + t(sh.poly) + ' completely, a student wrote ' + t(sh.poly + '=' + sh.shown) + '.'; },
        shared: function (r) { var s = r.pick([6, 4, 5, 3]), k = r.pick([2, 2, 3]), c = r.pick([[3, 2, 4], [2, 3, 5], [3, 4, 2], [5, 2, 3]]), L = r.pick(PAIRS), x = L[0], y = L[1];
          var br = [M(c[0], { [x]: 2 }), M(-c[1], { [x]: 1, [y]: 1 }), N(c[2])], G = M(s * k, { [x]: 2, [y]: 2 }), terms = br.map(function (b) { return PL.mul(G, b); }), sG = M(s, { [x]: 2, [y]: 2 });
          return { terms: terms, poly: seq(terms), G: G, sG: sG, k: k, shown: tx(sG) + '(' + seq(br.map(function (b) { return PL.scale(b, k); })) + ')', sbr: seq(br.map(function (b) { return PL.scale(b, k); })) }; },
        parts: [
          { id: 'e14a', level: 'BEG', make: function (r, sh) { return KP.poly('(a) Expand the student’s answer ' + t(sh.shown) + '.', sum(sh.terms), {}, 'Multiply ' + t(tx(sh.sG)) + ' by each term: ' + t(sh.shown + '=' + sh.poly) + ' — it does equal the original polynomial.', ['Multiply the monomial by every term in the bracket.'], 'expand ' + plain(sh.shown)); } },
          { id: 'e14b', level: 'EMG', make: function (r, sh) { return mcPart(r, '(b) The answer is still not finished. What is wrong with it?', errOpts('notg', { sign: 'The signs all check out (expand it). Look at the numbers inside the bracket.', drop: 'All three terms are there. Look at the numbers inside the bracket.', none: 'It is equal, but look at the bracket ' + t(sh.sbr) + ': its coefficients have a common factor of ' + t(sh.k) + '.' }),
            'The bracket ' + t(sh.sbr) + ' still has a common factor of ' + t(sh.k) + ' (all its coefficients are multiples of ' + t(sh.k) + '). So ' + t(tx(sh.sG)) + ' is a common factor, but not the <b>greatest</b> one.', ['Look only at the bracket: do its terms have a common factor?'], 'error: bracket still has a common factor'); } },
          { id: 'e14c', level: 'BEG', make: function (r, sh) { var p = gcfPart(sh.terms, { prompt: '(c) State the greatest common factor the student should have removed.' }); return p; } },
          { id: 'e14d', level: 'BEG', make: function (r, sh) { return factorPart(sh.terms, { prompt: '(c) Write the complete factorization of ' + t(sh.poly) + '.', wrong: [] }); } }] },
      { num: '15', stem: function (sh) { return 'Three students factor ' + t(sh.poly) + '.<br>' + sh.names.map(function (n, i) { return n + ': ' + t(sh.ans[i]); }).join(', &nbsp; '); },
        shared: function (r) { var g = r.pick([3, 4, 5, 6, 8, 12]), b = 2, v = r.pick(['p', 'x', 'y']), names = ['Amira', 'Ben', 'Cass'], roles = r.shuffle(['right', 'sign', 'drop']); // b = 2 as in the booklet: the bracket is then (v+1)², which is what (c) is about
          var terms = [M(-g, { [v]: 3 }), M(-g * b, { [v]: 2 }), M(-g, { [v]: 1 })], G = '-' + g + v, A = { right: G + '(' + v + '^{2}+' + b + v + '+1)', sign: G + '(' + v + '^{2}+' + b + v + '-1)', drop: G + '(' + v + '^{2}+' + b + v + ')' };
          return { g: g, b: b, v: v, names: names, roles: roles, ans: roles.map(function (k) { return A[k]; }), terms: terms, poly: seq(terms), who: function (k) { return names[roles.indexOf(k)]; } }; },
        parts: [
          { id: 'e15a', level: 'BEG', make: function (r, sh) { var R = sh.who('right'), S = sh.who('sign'), D = sh.who('drop'), v = sh.v, g = sh.g;
            return mcPart(r, '(a) Expand all three answers. Which one is correct?', sh.names.map(function (n) { return { html: n, right: n === R, why: n === S ? 'Expand ' + n + '’s answer: the last term comes out as ' + t('+' + g + v) + ', not ' + t('-' + g + v) + '.' : n === D ? 'Expand ' + n + '’s answer: there is no third term at all.' : null }; }).concat([{ html: 'None of them', why: 'Expand each answer — one of them gives back ' + t(sh.poly) + ' exactly.' }]),
              R + ': ' + t(sh.ans[sh.roles.indexOf('right')] + '=' + sh.poly) + ' ✓<br>' + S + ': gives ' + t(seq([sh.terms[0], sh.terms[1], PL.neg(sh.terms[2])])) + ' (last term wrong).<br>' + D + ': gives ' + t(seq([sh.terms[0], sh.terms[1]])) + ' (last term missing).<br>Only <b>' + R + '</b> is correct.', ['Expand each student’s answer and compare it with the original.'], 'which student is right', true); } },
          { id: 'e15b', level: 'EMG', make: function (r, sh) { var S = sh.who('sign'), v = sh.v, g = sh.g;
            return mcPart(r, '(b) What mistake did ' + S + ' make?', [
              { html: 'The third term: ' + t('-' + g + v + '\\div(-' + g + v + ')=+1') + ', but ' + S + ' kept the original sign and wrote ' + t('-1') + '.', right: true },
              { html: 'The first term: ' + t(v + '^{2}') + ' should be ' + t('-' + v + '^{2}') + '.', why: t('-' + g + v + '^{3}\\div(-' + g + v + ')=+' + v + '^{2}') + ' — the first term is right.' },
              { html: 'The common factor should be ' + t(g + v) + ', not ' + t('-' + g + v) + '.', why: 'Every term is negative, so the negative factor is the right choice. Check each term in the bracket.' },
              { html: 'The second term: it should be ' + t('-' + sh.b + v) + '.', why: t('-' + (g * sh.b) + v + '^{2}\\div(-' + g + v + ')=+' + sh.b + v) + ' — that one is right.' }],
              S + ' mishandled the <b>third</b> term: ' + t('-' + g + v + '\\div(-' + g + v + ')=+1') + '. Dividing by a negative flips the sign, but ' + S + ' kept the original minus sign.', ['Divide each term of the original by ' + t('-' + g + v) + ' and compare with ' + S + '’s bracket.'], 'Ben-type sign mistake'); } },
          { id: 'e15c', level: 'EMG', make: function (r, sh) { var D = sh.who('drop'), v = sh.v, g = sh.g;
            return mcPart(r, '(b) What mistake did ' + D + ' make?', [
              { html: 'The third term: ' + t('-' + g + v + '\\div(-' + g + v + ')=1') + ', and a quotient of ' + t('1') + ' must still be written in the bracket. ' + D + ' dropped it.', right: true },
              { html: 'The third term should be ' + t('0') + ', so leaving it out is fine — the error is in the first term.', why: 'A term divided by itself is ' + t('1') + ', not ' + t('0') + '. Expanding ' + D + '’s answer gives only two terms.' },
              { html: D + ' should have taken out ' + t('-' + g) + ' only.', why: t(v) + ' is in every term, so it belongs in the GCF. The problem is a missing term.' },
              { html: 'The second term has the wrong sign.', why: 'Check: ' + t('-' + (g * sh.b) + v + '^{2}\\div(-' + g + v + ')=+' + sh.b + v) + ' — that one is right.' }],
              D + ' mishandled the <b>third</b> term: ' + t('-' + g + v + '\\div(-' + g + v + ')=1') + ', and that ' + t('1') + ' must stay in the bracket. Without it the answer expands to only two terms.', ['Expand ' + D + '’s answer: how many terms do you get?'], 'Cass-type dropped term'); } },
          { id: 'e15d', level: 'EMG', make: function (r, sh) { var v = sh.v;
            return mcPart(r, '(c) Someone says the correct answer is not <i>complete</i>. Why is it complete at this stage of the unit?', [
              { html: 'At this stage “complete” means no common factor is left in the bracket, and ' + t(v + '^{2}+' + sh.b + v + '+1') + ' has none. Saying more needs <b>trinomial factoring</b>, later in the unit.', right: true },
              { html: 'It can’t be factored any further in any way.', why: 'Later in the unit you will learn to factor trinomials, which may say more about this bracket. Right now, the point is that the bracket has <b>no common factor</b>.' },
              { html: 'Because the GCF is negative.', why: 'The sign of the GCF has nothing to do with whether the factoring is complete.' },
              { html: 'Because the bracket has three terms.', why: 'The number of terms doesn’t decide it. What matters is whether the bracket still has a <b>common factor</b>.' }],
              'The bracket’s coefficients ' + t('1,\\ ' + sh.b + ',\\ 1') + ' share only ' + t('1') + ', and ' + t(v) + ' is missing from the constant term, so no common factor is left. To go further you need trinomial factoring (Lesson 3' + (sh.b === 2 ? '; here ' + t(v + '^{2}+2' + v + '+1=(' + v + '+1)^{2}') : '') + ').', [], 'why complete at this stage'); } }] },
      { num: '18', section: 'Extra practice F — Stretch', stem: function (sh) { return 'A rectangular prism has volume ' + t('V=' + seq(sh.terms)) + ' cubic centimetres, and its height, in centimetres, is the greatest common factor of the three terms.'; },
        shared: function (r) { var g = r.int(2, 8), c = r.pick([[3, 4, 5], [2, 3, 4], [3, 2, 4], [4, 3, 5], [5, 2, 3]]), e = r.int(1, 2);
          var terms = [M(g * c[0], { x: e + 1, y: 1 }), M(g * c[1], { x: e, y: 2 }), M(-g * c[2], { x: e, y: 1 })], G = gcfOf(terms), B = sum(terms.map(function (m) { return divM(m, G); }));
          var xy = pickWhere(function () { return { x: r.int(2, 4), y: r.int(1, 3) }; }, function (p) { return PL.at(B, p) > 0; });
          return { terms: terms, G: G, B: B, x: xy.x, y: xy.y, c: c, g: g, e: e }; },
        parts: [
          { id: 'e18a', level: 'EMG', make: function (r, sh) { return factorPart(sh.terms, { prompt: '(a) Write ' + t('V') + ' in factored form.', inBefore: t('V='), before: 'V=' }); } },
          { id: 'e18b', level: 'BEG', make: function (r, sh) { var p = gcfPart(sh.terms, { prompt: '(a) State the height of the prism (in cm).' }); return p; } },
          { id: 'e18c', level: 'EMG', make: function (r, sh) { return KP.poly('(b) Write an expression for the area of the base of the prism (in cm²).', sh.B, {}, t('V=(\\text{height})(\\text{base area})') + ', so base area ' + t('=V\\div ' + tx(sh.G) + '=\\mathbf{' + tx(sh.B) + '}') + '.', ['Volume = height × base area. The base area is the bracket left after removing the height.'], 'prism base area'); } },
          { id: 'e18d', level: 'EMG', make: function (r, sh) {
            var env = { x: sh.x, y: sh.y }, h = PL.at(sh.G, env), b = PL.at(sh.B, env), V = PL.at(sum(sh.terms), env);
            return KP.fields('(c) Evaluate the height, the base area and the volume when ' + t('x=' + sh.x) + ' and ' + t('y=' + sh.y) + '.', [{ label: 'height', name: 'height', after: t('\\text{cm}') }, { label: 'base area', name: 'base area', after: t('\\text{cm}^{2}') }, { label: 'volume', name: 'volume', after: t('\\text{cm}^{3}') }],
              [K.number(h), K.number(b), K.number(V, function (v) { return v === h + b ? { code: 'value', hint: 'Volume = height <b>×</b> base area.' } : null; })], [String(h), String(b), String(V)], 'height ' + t(F(h)) + ' cm, base area ' + t(F(b)) + ' cm², volume ' + t(F(V)) + ' cm³',
              'Height: ' + t(tx(sh.G) + '=' + F(h)) + ' cm. Base area: ' + t(tx(sh.B) + '=' + F(b)) + ' cm². Volume: ' + t(F(h) + '\\times ' + F(b) + '=' + F(V)) + ' cm³, which matches ' + t('V') + ' from the original expression ✓.', ['Substitute into the height and base-area expressions, then multiply.'], 'prism values');
          } }] },
      { num: '19', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: 'e19', level: 'EMG', make: function (r) {
          var g = r.pick([6, 8, 10, 12, 14]), c = r.pick([[2, 3, 4], [3, 2, 4], [2, 5, 3], [3, 4, 2]]), L = r.pick(PAIRS), x = L[0], y = L[1];
          var terms = [M(-g * c[0], { [x]: 4, [y]: 2 }), M(g * c[1], { [x]: 3, [y]: 3 }), M(-g * c[2], { [x]: 2, [y]: 2 })], G = M(-g, { [x]: 2, [y]: 2 }), half = M(-g / 2, { [x]: 2, [y]: 2 }), hiY = M(-g, { [x]: 2, [y]: 3 });
          var br = seq(terms.map(function (m) { return divM(m, G); }));
          return mcPart(r, 'When ' + t(seq(terms)) + ' is factored completely, with the greatest common factor removed so that the first term inside the bracket is positive, the common factor removed is', [
            { html: t(tx(PL.neg(G))), why: 'With a positive factor the bracket would start with a negative term. The first term is negative, so remove a <b>negative</b> factor.' },
            { html: t(tx(G)), right: true },
            { html: t(tx(half)), why: t(tx(half)) + ' is a common factor, but not the <b>greatest</b>: the coefficients still share ' + t('2') + '.' },
            { html: t(tx(hiY)), why: t(y + '^{3}') + ' doesn’t divide ' + t(y + '^{2}') + ': use the <b>lowest</b> power of ' + t(y) + '.' }],
            'The first term is negative, so remove a negative factor. ' + t('\\gcd(' + c.map(function (k) { return g * k; }).join(',') + ')=' + g) + '; lowest powers ' + t(x + '^{2}') + ', ' + t(y + '^{2}') + ', so the factor is ' + t(tx(G)) + ':<br>' + t(seq(terms) + '=' + tx(G) + '(' + br + ')') + '.', ['Find the GCF of the coefficients and the lowest power of each letter. Then decide the sign.'], 'MC negative GCF');
        } }] },
      { num: '20', stem: '<i>(Numerical Response)</i>', parts: [
        { id: 'e20', level: 'EMG', make: function (r) {
          var g = r.pick([10, 12, 15, 20, 25, 30]), c = r.pick([[2, 3, 5], [3, 2, 5], [2, 5, 3], [4, 3, 5]]), a = r.int(2, 4), b = r.int(2, 4);
          var terms = [M(g * c[0], { x: a + 2, y: b }), M(-g * c[1], { x: a, y: b + 1 }), M(g * c[2], { x: a, y: b })], ans = g + a + b;
          return KP.nr('When ' + t(seq(terms)) + ' is factored completely, the greatest common factor is ' + t('ax^{b}y^{c}') + '. The value of ' + t('a+b+c') + ' is ________.', ans, function (v) {
            if (v === g + (a + 2) + (b + 1)) return { code: 'max-exp', hint: 'Use the <b>lowest</b> power of each letter, not the highest.' };
            if (v === gcdA(c) + a + b || v === g / 5 + a + b || v === g / 2 + a + b) return { code: 'not-greatest', hint: 'Check ' + t('a') + ': it is the <b>greatest</b> number dividing every coefficient.' };
            return null;
          }, t('\\gcd(' + c.map(function (k) { return g * k; }).join(',') + ')=' + g) + '; lowest powers ' + t('x^{' + a + '}') + ' and ' + t('y^{' + b + '}') + '. GCF ' + t('=' + g + 'x^{' + a + '}y^{' + b + '}') + ', so ' + t('a+b+c=' + g + '+' + a + '+' + b + '=\\mathbf{' + ans + '}') + '.', ['Find the GCF: the greatest number dividing every coefficient, and the lowest power of each letter.'], 'NR GCF a+b+c');
        } }] }
    ]
  });

  /* ---------- part makers that need the lesson helpers ---------- */
  function fracOpt(o) {
    o = o || {};
    return Object.assign({ integral: true, hints: ['Write the coefficients over a common denominator. The common factor is (GCF of the numerators) ÷ (common denominator), times the letters common to every term.', 'Divide each term by your common factor; every coefficient in the bracket must be a whole number. Check by expanding.'] }, o);
  }
  function negPart(terms) {
    var G = gcfOf(terms), g = isNeg(G) ? G : PL.neg(G);
    return factorPart(terms, { g: g, forceNeg: true, mustNeg: true, negMsg: 'Equal — but the question asks you to remove a <b>negative</b> common factor, so that the first term inside the bracket is positive.' });
  }
  function simplifyPart(sh) {
    var S = sh.S, terms = sh.terms;
    var sol = sh.bracketed ? 'Expand each bracket: ' + t(sh.expand) + '.<br>Collect like terms: ' + t('\\mathbf{' + tx(S) + '}') : 'Collect like terms: ' + groupLine(terms) + '<br>' + t('\\mathbf{' + tx(S) + '}');
    var ws = [];
    if (terms) { var ks = terms.filter(function (m) { return !PL.vars(m).length; }); if (ks.length) ws.push({ is: PL.add(S, ks[0]), code: 'extra-term', hint: 'The constants cancel: ' + t(seq([ks[0], PL.neg(ks[0])]) + '=0') + '.' }); }
    if (sh.bracketed) { var o = sh.o, v = sh.v; ws.push({ is: sum([PL.mul(N(o.p), sum([M(1, { [v]: 2 }), M(-o.q, { [v]: 1 })])), PL.mul(M(-o.s, { [v]: 1 }), sum([M(1, { [v]: 1 }), M(o.u, {})])), PL.mul(M(o.w, { [v]: 2 }), sum([M(1, { [v]: 1 }), N(-1)])), M(-o.z, { [v]: 1 })]), code: 'neg-first', hint: 'A negative in front of a bracket multiplies <b>every</b> term inside: ' + t('-' + o.s + v + '(' + v + '-' + o.u + ')=-' + o.s + v + '^{2}+' + (o.s * o.u) + v) + '.' }); }
    var p = KP.poly('(i) Simplify by combining like terms.', S, { wrong: dedupW(S, ws).map(function (w) { return { is: w.p, code: w.code, hint: w.hint }; }) }, sol,
      [sh.bracketed ? 'Expand every bracket first (watch the signs in front of each one), then collect like terms.' : 'Group the terms with the same letters and exponents and add their coefficients.', 'Terms like ' + t('5') + ' and ' + t('-5') + ' cancel.'], 'simplify ' + plain(sh.tex));
    p.bad = dedupW(S, ws).map(function (w) { return tx(w.p); });
    return p;
  }
  function groupLine(terms) {
    var groups = {}, order = [];
    terms.forEach(function (m) { var k = PL.monoTex(vOf(m)); if (!groups[k]) { groups[k] = []; order.push(k); } groups[k].push(m); });
    return order.map(function (k) { var g = groups[k], s = sum(g); return t(seq(g) + '=' + tx(s)); }).join('; &nbsp;');
  }
  function verifyNote(p, terms) { p.solution += '<br>Check by expanding: ' + t(p.key + '=' + seq(terms)) + ' ✓'; return p; }
  function cylA(sh) { var r = sh.d / 2; return 2 * Math.PI * r * (r + sh.h); }
  function cylPart(sh, factored) {
    var r = sh.d / 2, h = sh.h, A = cylA(sh), hs = h.toFixed(1);
    var sol = factored ? 'Radius ' + t('r=' + sh.d + '\\div 2=' + r) + ' cm.<br>' + t('A=2\\pi r(r+h)=2\\pi(' + r + ')(' + r + '+' + hs + ')=2\\pi(' + r + ')(' + decStr(r + h) + ')=' + decStr(2 * r * (r + h)) + '\\pi') + '<br>' + t('A\\approx\\mathbf{' + K.roundTo(A, 2).toFixed(2) + '}\\text{ cm}^{2}') + ' — the same as (a).'
      : 'Radius ' + t('r=' + sh.d + '\\div 2=' + r) + ' cm, ' + t('h=' + hs) + ' cm.<br>' + t('2\\pi r^{2}=2\\pi(' + r + ')^{2}=' + (2 * r * r) + '\\pi\\approx ' + (2 * Math.PI * r * r).toFixed(4)) + '<br>' + t('2\\pi rh=2\\pi(' + r + ')(' + hs + ')=' + decStr(2 * r * h) + '\\pi\\approx ' + (2 * Math.PI * r * h).toFixed(4)) + '<br>' + t('A\\approx\\mathbf{' + K.roundTo(A, 2).toFixed(2) + '}\\text{ cm}^{2}');
    return KP.approx(factored ? 'Calculate the surface area, to the nearest ' + t('0.01\\text{ cm}^{2}') + ', using the factored form ' + t('A=2\\pi r(r+h)') + '.' : 'Calculate the surface area, to the nearest ' + t('0.01\\text{ cm}^{2}') + '.', A, 2, {
      after: t('\\text{cm}^{2}'), diag: function (v) {
        var d = sh.d, R2 = function (x) { return K.roundTo(x, 2); };
        if (Math.abs(v - R2(2 * Math.PI * d * (d + h))) < 0.006) return { code: 'diam', hint: 'The formula uses the <b>radius</b>: ' + t('r=' + d + '\\div 2=' + r) + '.' };
        if (Math.abs(v - R2(Math.PI * r * r + 2 * Math.PI * r * h)) < 0.006) return { code: 'one-base', hint: 'A cylinder has <b>two</b> circular bases: ' + t('2\\pi r^{2}') + '.' };
        if (Math.abs(v - R2(Math.PI * r * (r + h))) < 0.006) return { code: 'value', hint: 'Check the ' + t('2') + ' in front: ' + t('A=2\\pi r(r+h)') + '.' };
        return null;
      } }, sol, ['Use the radius: half the diameter.', factored ? 'Work out the bracket ' + t('(r+h)') + ' first, then multiply by ' + t('2\\pi r') + '.' : 'Work out ' + t('2\\pi r^{2}') + ' and ' + t('2\\pi rh') + ', then add.'], 'cylinder area d=' + sh.d + ' h=' + hs + (factored ? ' (factored)' : ''));
  }
  function rocketTable(sh) {
    var T = sh.T, v = sh.v, ts = []; for (var i = 0; i <= T; i++) ts.push(i);
    var hs = ts.map(function (x) { return 5 * x * (T - x); });
    var checks = ts.map(function (x, i) { return K.number(hs[i], function (val) {
      if (val === v * x + 5 * x * x) return { code: 'sign', hint: 'At ' + t('t=' + x) + ': ' + t('h=5(' + x + ')(' + T + '-' + x + ')') + ' — check the subtraction in the bracket.' };
      return { code: 'value', hint: 'At ' + t('t=' + x) + ': ' + t('h=5(' + x + ')(' + T + '-' + x + ')') + '.' };
    }); });
    return KP.fields('Use the factored form ' + t('h=5t(' + T + '-t)') + ' to calculate the height at each time.', ts.map(function (x) { return { label: t('t=' + x), name: 't = ' + x, after: t('\\text{m}') }; }), checks, hs.map(String),
      ts.map(function (x, i) { return t('t=' + x) + ': ' + t(hs[i]) + ' m'; }).join(', &nbsp;'),
      'Each height is ' + t('5t(' + T + '-t)') + ', e.g. ' + t('t=3:\\ 5(3)(' + (T - 3) + ')=' + 5 * 3 * (T - 3)) + '.<br>' + ts.map(function (x, i) { return t('t=' + x) + ': ' + t(hs[i]); }).join(', ') + ' (metres).', ['The factored form is ' + t('h=5t(' + T + '-t)') + '. Substitute each time: multiply ' + t('5') + ', ' + t('t') + ' and ' + t('(' + T + '-t)') + '.'], 'rocket table v=' + v);
  }
  function expandPart(prompt, G, br) {
    var res = PL.mul(G, sum(br)), c = cOf(G)[0], ws = [];
    if (br.length > 1) {
      ws.push({ is: sum([PL.mul(G, br[0])].concat(br.slice(1))), code: 'first-only', hint: 'Multiply <b>every</b> term in the bracket by ' + t(tx(G)) + ', not just the first one.' });
      if (c < 0) ws.push({ is: sum([PL.mul(G, br[0])].concat(br.slice(1).map(function (b) { return PL.mul(PL.neg(G), b); }))), code: 'neg-first', hint: 'The negative sign is part of ' + t(tx(G)) + ', so it multiplies every term in the bracket.' });
    }
    var W = dedupW(res, ws);
    var p = KP.poly(prompt, res, { wrong: W.map(function (w) { return { is: w.p, code: w.code, hint: w.hint }; }) },
      'Multiply ' + t(tx(G)) + ' by each term: ' + br.map(function (b) { return t(pg(G) + pg(b) + '=' + tx(PL.mul(G, b))); }).join(', ') + '.<br>' + t('\\mathbf{' + seq(br.map(function (b) { return PL.mul(G, b); })) + '}'),
      ['Multiply the monomial by <b>each</b> term in the bracket: multiply the coefficients and add the exponents.'], 'expand ' + plain(tx(G) + '(' + seq(br) + ')'));
    p.bad = W.map(function (w) { return tx(w.p); });
    p.key = seq(br.map(function (b) { return PL.mul(G, b); })); p.answer = t(p.key);
    return p;
  }
  function secondMonoPart(sh) {
    var G = sh.G, A = sh.A, x = sh.L[0], y = sh.L[1], gc = sh.g;
    function one(resp) {
      var a = K.read(resp); if (a.res) return a.res;
      var rd = PL.read(a.ast); if (!rd.ok) return wrong('value', null);
      var S = rd.p;
      if (PL.count(S) !== 1) return wrong('not-mono', 'Give a single monomial (one term).');
      var c = cOf(S); if (c[1] !== 1) return wrong('value', 'Use a whole-number coefficient.');
      var fi = PL.formIssue(a.ast); if (fi && fi.code !== 'not-poly') return form(fi.code, fi.msg || 'Simplify your monomial.');
      var Gs = gcfOf([A, M(Math.abs(c[0]), vOf(S))]);
      if (PL.eq(Gs, G)) return ok();
      var gv = vOf(Gs), want = vOf(G), sv = vOf(S);
      if ((gv[x] || 0) !== want[x]) return wrong('gcf-high', 'Then the GCF would have ' + t(x + '^{' + (gv[x] || 0) + '}') + ' — your monomial needs exactly ' + t(powTex(x, want[x])) + ' (the first one has ' + t(powTex(x, vOf(A)[x])) + ').');
      if ((gv[y] || 0) !== want[y]) return wrong('gcf-high', 'Then the GCF would have ' + t(y + '^{' + (gv[y] || 0) + '}') + ' — your monomial needs exactly ' + t(powTex(y, want[y])) + ' (the first one has ' + t(powTex(y, vOf(A)[y])) + ').');
      return wrong('gcf-coef', 'With ' + t(tx(S)) + ' the GCF is ' + t(tx(Gs)) + '. The coefficient must share exactly ' + t(gc) + ' with ' + t(cOf(A)[0]) + ', but ' + t('\\gcd(' + cOf(A)[0] + ',' + Math.abs(c[0]) + ')=' + gcd(cOf(A)[0], c[0])) + '.');
    }
    var mults = [1].concat([2, 3, 4, 5, 7, 11].filter(function (m) { return gcd(m, sh.k) === 1; })), k1 = M(gc * mults[1], vOf(G)), k0 = G;
    var fields = [{ label: 'monomial 1', name: 'monomial 1', mode: 'math', keys: 'poly', vars: [x, y], wide: true }, { label: 'monomial 2', name: 'monomial 2', mode: 'math', keys: 'poly', vars: [x, y], wide: true }];
    var p = KP.fields('(a) Give two different monomials that could be the second one.', fields, [one, one], [tx(k1), tx(k0)], t(tx(k1)) + ' and ' + t(tx(k0)) + ' (many others work)',
      'The GCF of the pair must be ' + t(tx(G)) + '. The first monomial has ' + t(powTex(x, vOf(A)[x])) + ' and ' + t(powTex(y, vOf(A)[y])) + ', so the second must have <b>exactly</b> ' + t(powTex(x, sh.a)) + ' and ' + t(powTex(y, sh.b)) + ' (otherwise the lowest powers change). Its coefficient must have greatest common factor ' + t(gc) + ' with ' + t(cOf(A)[0]) + ': ' + t(gc) + ' times a number that shares no factor with ' + t(sh.k) + '.<br>For example ' + t(tx(k1)) + ' and ' + t(tx(k0)) + '; also ' + t(tx(M(gc * mults[2], vOf(G))))  + ', …',
      ['Which powers of ' + t(x) + ' and ' + t(y) + ' must the second monomial have so that the lowest powers are those in the GCF?', 'The coefficient must share exactly ' + t(gc) + ' with ' + t(cOf(A)[0]) + '.'], 'second monomial with GCF ' + tx(G));
    p.check = function (resp) {
      resp = resp || [];
      var r0 = one(resp[0] == null ? '' : resp[0]); if (r0.v !== 'correct') return { v: r0.v, code: r0.code, hint: '<b>monomial 1:</b> ' + (r0.hint || 'Check this one again.') };
      var r1 = one(resp[1] == null ? '' : resp[1]); if (r1.v !== 'correct') return { v: r1.v, code: r1.code, hint: '<b>monomial 2:</b> ' + (r1.hint || 'Check this one again.') };
      if (PL.eq(PL.read(resp[0]).p, PL.read(resp[1]).p)) return wrong('same', 'Both boxes have the same monomial — give two <b>different</b> ones.');
      return ok();
    };
    p.good = [[tx(M(gc * mults[2], vOf(G))), tx(G)]];
    p.bad = [[tx(G), tx(G)], [tx(M(gc, { [x]: sh.a + 1, [y]: sh.b })), tx(G)], [tx(M(gc * sh.k, vOf(G))), tx(G)]];
    return p;
  }
})(window);
