/* Math 10C · Unit 2 (Exponents) — exit slips, one per lesson (u2l1x … u2l6x), written in test mode at the end of class.
 * Each slip has 2–4 short questions (about 5–8 minutes, no calculator, like the Unit 2 Test) on that day's main skills,
 * spread over the Beginning / Progressing / Mastery boxes so "highest level right per outcome" can tell students apart.
 * The questions are new (wording, contexts, structure) but test the same skills at the same difficulty as the lesson's
 * assignment; every part is a generator (each student gets their own numbers) with a key, a worked solution, hints and
 * typical wrong answers (codes u2x-…, labelled below, each with a partial-credit decision). Answers with variables are
 * checked with K.expo (equivalent value + the form asked for); typical wrong answers are recognized by equivalence.
 * Lesson 6 (the review) mixes the unit: integer, negative and rational exponents. */
(function (root) {
  'use strict';
  var HW = root.HW, F = HW.fmt, K = HW.kit, ex = HW.ex, P = K.P, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form;

  HW.addCodes({
    'u2x-mult-exp': 'Multiplied exponents instead of adding (product law)', 'u2x-add-exp': 'Added exponents instead of multiplying (power of a power)',
    'u2x-div-exp': 'Divided exponents instead of subtracting (quotient law)', 'u2x-base-times-exp': 'Multiplied the base by the exponent',
    'u2x-coef-not-raised': 'Didn’t raise the number in front to the power', 'u2x-coef-times-exp': 'Multiplied the number in front by the exponent',
    'u2x-coef-added': 'Added the numbers in front instead of multiplying', 'u2x-neg-base': 'Minus sign outside the power treated as part of the base (or the reverse)',
    'u2x-even-neg': 'Kept a minus sign under an even power', 'u2x-odd-neg': 'Dropped the minus sign under an odd power', 'u2x-zero-pow': 'Took a zero exponent to give 0',
    'u2x-base-same': 'Combined powers of different bases as if the bases were the same', 'u2x-opposite': 'Treated a negative exponent as a negative sign',
    'u2x-coef-side': 'Moved a number across the fraction bar wrongly', 'u2x-no-flip': 'Didn’t take the reciprocal for a negative exponent',
    'u2x-sub-neg': 'Sign slip subtracting a negative exponent', 'u2x-coef-pos-power': 'Raised the number in front to the positive power',
    'u2x-root-div': 'Divided by the root’s index instead of taking the root', 'u2x-coef-in': 'Put the number in front under the radical',
    'u2x-neg-value': 'Made the value negative for a negative exponent', 'u2x-index-power': 'Swapped the index and the power',
    'u2x-not-given-exp': 'Didn’t use the exponent asked for', 'u2x-one-num': 'Added 1 to the numerator of the exponent only',
    'u2x-add-den': 'Added the tops and the bottoms of fractional exponents', 'u2x-eval-part': 'One of the two powers evaluated wrongly',
    'u2x-power-only': 'Took the root but forgot the power (or the reverse)', 'u2x-missed-factor': 'Didn’t apply the outside exponent to every factor',
    'u2x-sign-final': 'Sign of the answer wrong', 'u2x-sci-mult': 'Multiplied the powers of 10 instead of adding their exponents', 'u2x-base-is-number': 'Used the number itself as the base'
  });
  HW.addPartial({
    'u2x-mult-exp': 'b', 'u2x-add-exp': 'b', 'u2x-div-exp': 'b', 'u2x-base-times-exp': 'n', 'u2x-coef-not-raised': 'b', 'u2x-coef-times-exp': 'b', 'u2x-coef-added': 'b',
    'u2x-neg-base': 'b', 'u2x-even-neg': 's', 'u2x-odd-neg': 's', 'u2x-zero-pow': 'n', 'u2x-base-same': 'n', 'u2x-opposite': 'n', 'u2x-coef-side': 'b', 'u2x-no-flip': 'b',
    'u2x-sub-neg': 's', 'u2x-coef-pos-power': 'b', 'u2x-root-div': 'n', 'u2x-coef-in': 'b', 'u2x-neg-value': 'n', 'u2x-index-power': 'b', 'u2x-not-given-exp': 'n',
    'u2x-one-num': 'b', 'u2x-add-den': 'b', 'u2x-eval-part': 's', 'u2x-power-only': 'b', 'u2x-missed-factor': 'b', 'u2x-sign-final': 's', 'u2x-sci-mult': 'b', 'u2x-base-is-number': 'n'
  });

  /* ---------- rationals and LaTeX ---------- */
  function R(x, q) { return typeof x === 'number' ? ex.norm(x, q == null ? 1 : q) : x; }
  function add(a, b) { a = R(a); b = R(b); return ex.norm(a[0] * b[1] + b[0] * a[1], a[1] * b[1]); }
  function mul(a, b) { a = R(a); b = R(b); return ex.norm(a[0] * b[0], a[1] * b[1]); }
  function neg(a) { a = R(a); return [-a[0], a[1]]; }
  function inv(a) { a = R(a); return ex.norm(a[1], a[0]); }
  function rpow(a, n) { a = R(a); if (n < 0) { a = inv(a); n = -n; } return ex.norm(Math.pow(a[0], n), Math.pow(a[1], n)); }
  function rv(a) { a = R(a); return a[0] / a[1]; }
  function gcd(a, b) { return ex.gcd(a, b); }
  function find(gen, test, fallback) { for (var i = 0; i < 1500; i++) { var v = gen(); if (v != null && test(v)) return v; } if (fallback === undefined) throw new Error('u2 exit: no values found'); return fallback; }
  function eT(e) { e = R(e); return e[1] === 1 ? String(e[0]) : (e[0] < 0 ? '-' : '') + '\\frac{' + Math.abs(e[0]) + '}{' + e[1] + '}'; }
  function pw(v, e) { e = R(e); if (e[0] === 0) return ''; if (e[0] === 1 && e[1] === 1) return v; return v + '^{' + eT(e) + '}'; }
  function cT(c) { c = R(c); return c[1] === 1 ? String(c[0]) : (c[0] < 0 ? '-' : '') + '\\frac{' + Math.abs(c[0]) + '}{' + c[1] + '}'; }
  function rootT(n, inner) { return n === 2 ? '\\sqrt{' + inner + '}' : '\\sqrt[' + n + ']{' + inner + '}'; }
  function frT(a) { a = R(a); return a[1] === 1 ? F(a[0]) : (a[0] < 0 ? '-' : '') + '\\frac{' + F(Math.abs(a[0])) + '}{' + F(a[1]) + '}'; }
  /* monomials: { c: [p, q], v: [[letter, [p, q]], …] } */
  function M(c, fs) { return { c: R(c), v: (fs || []).map(function (f) { return [f[0], R(f[1])]; }) }; }
  function mm(a, b) { var v = a.v.map(function (f) { return [f[0], f[1]]; }); b.v.forEach(function (f) { var g = v.filter(function (x) { return x[0] === f[0]; })[0]; if (g) g[1] = add(g[1], f[1]); else v.push([f[0], f[1]]); }); return { c: mul(a.c, b.c), v: v }; }
  function mpow(a, e) { e = R(e); var c; if (e[1] === 1) c = rpow(a.c, e[0]); else { var rtn = function (x) { var y = Math.round(Math.pow(Math.abs(x), 1 / e[1])); if (Math.pow(y, e[1]) !== Math.abs(x)) throw new Error('no exact root'); return y; }; c = rpow([rtn(a.c[0]) * (a.c[0] < 0 ? -1 : 1), rtn(a.c[1])], e[0]); } return { c: c, v: a.v.map(function (f) { return [f[0], mul(f[1], e)]; }) }; }
  function mdiv(a, b) { return mm(a, { c: inv(b.c), v: b.v.map(function (f) { return [f[0], neg(f[1])]; }) }); }
  /* positive-exponent form (the answer key), and the any-sign form for working lines */
  function ptex(m) {
    var c = m.c, num = '', den = '';
    m.v.forEach(function (f) { if (f[1][0] > 0) num += pw(f[0], f[1]); else if (f[1][0] < 0) den += pw(f[0], neg(f[1])); });
    var N = (Math.abs(c[0]) === 1 && num ? '' : String(Math.abs(c[0]))) + num, D = (c[1] === 1 ? '' : String(c[1])) + den;
    return (c[0] < 0 ? '-' : '') + (D ? '\\frac{' + N + '}{' + D + '}' : N);
  }
  function rtex(m) { var vs = m.v.map(function (f) { return pw(f[0], f[1]); }).join(''); var c = m.c; var ct = c[1] === 1 ? (vs && Math.abs(c[0]) === 1 ? (c[0] < 0 ? '-' : '') : String(c[0])) : cT(c); return ct + vs; }
  function fin(m) { var a = rtex(m), b = ptex(m); return a === b ? b : a + '=' + b; }

  /* ---------- checking helpers ---------- */
  function walk(x, fn) { if (!x || typeof x !== 'object') return; fn(x); ['a', 'b', 'n'].forEach(function (k) { if (x[k] && typeof x[k] === 'object') walk(x[k], fn); }); }
  function strip(x) { while (x && x.t === 'paren') x = x.a; return x; }
  function varsOf(ast) { return Object.keys(ex.shape(ast).vars); }
  function union(a, b) { return a.concat(b.filter(function (v) { return a.indexOf(v) < 0; })); }
  function same(a, b, vs) { return vs.length ? ex.equiv(a, b, vs, 6) : ex.eq(ex.value(a), ex.value(b)); }
  function expIssue(e) {
    e = strip(e); if (e.t === 'neg') e = strip(e.a);
    if (e.t === 'num') return e.dec ? form('exp-decimal', 'Right value — write the exponent as a fraction (for example ' + t('x^{\\frac{3}{2}}') + ' rather than ' + t('x^{1.5}') + ').') : null;
    if (e.t === 'var') return null;
    if (e.t === 'div') {
      var n = strip(e.a), d = strip(e.b); if (n.t === 'neg') n = strip(n.a); if (d.t === 'neg') d = strip(d.a);
      if (n.t === 'num' && d.t === 'num' && !n.dec && !d.dec) { if (d.v === 1 || gcd(n.v, d.v) > 1) return form('exp-lowest', 'Right value — now reduce the exponent ' + t('\\frac{' + n.v + '}{' + d.v + '}') + ' to lowest terms.'); return null; }
    }
    return form('exp-simplify', 'Right value — now work each exponent out to a single number or fraction.');
  }
  function fmtIssue(ast, opt) {
    opt = opt || {}; var res = null, rad = opt.form === 'radical';
    walk(ast, function (x) {
      if (res) return;
      if (x.t === 'pow') { res = expIssue(x.b); if (!res && rad) { var e = ex.rat(x.b); if (e && e[0] < 0) res = form('neg-exp', 'Right value — now write it with positive exponents only.'); } }
      else if (x.t === 'root' && rad) { var nested = false; walk(x.a, function (y) { if (y.t === 'root') nested = true; }); if (nested) res = form('nested-root', 'Right value — now write it with a <b>single</b> radical.'); }
    });
    return res;
  }
  /* K.expo plus exponents in lowest terms */
  function EX(target, opt) {
    opt = opt || {}; var c = K.expo(target, opt);
    return function (resp) { var r = c(resp); if (r.v !== 'correct') return r; var p = ex.parse(resp); return (p.ok && fmtIssue(p.ast, opt)) || r; };
  }
  /* typical wrong answers recognized by equivalence: list [[tex, code, hint]]; entries equal to the target are dropped */
  function known(list, target) {
    var tp = target ? ex.parse(target).ast : null, tv = tp ? varsOf(tp) : [], L = [];
    list.forEach(function (k) {
      if (!k) return; var p = ex.parse(k[0]); if (!p.ok) throw new Error('bad known tex ' + k[0]);
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
  /* an exact number (integer or fraction in lowest terms; o.dec: a terminating decimal is fine too); kn = known(…) */
  function exactChk(fr, kn, o) {
    o = o || {}; fr = R(fr); var T = rv(fr);
    var base = K.fraction(fr, { decimalOk: !!o.dec, diag: function (val, ast) { return kn ? kn(null, ast) : null; } });
    return function (resp) {
      var a = K.read(resp); if (a.res) return a.res;
      if (ex.eq(a.val, T)) {
        var an = ex.analyze(a.ast);
        if (an.flags.negExp) return form('neg-exp', 'Right value — now evaluate it: rewrite the negative exponent as a reciprocal and work out the power.');
        if (ex.shape(a.ast).pow || ex.shape(a.ast).roots) return form('evaluate', 'Right value — now work out the power(s) and give a single number' + (fr[1] !== 1 ? ' or fraction' : '') + '.');
      }
      return base(resp);
    };
  }

  /* ===== Lesson 1 — Powers and the Exponent Laws ===== */
  HW.defineExit({
    lesson: 'u2l1', calc: false, outcome: 'AN3',
    blurb: 'Powers with a negative base or a minus sign, the zero exponent, and the product, quotient and power laws.',
    questions: [
      { num: '1', outcome: 'AN3', stem: '', parts: [
        { id: '1a', outcome: 'AN3', level: 'BEG', make: function (r) {
          var b = r.pick([2, 3, 10]), lim = b === 2 ? 7 : b === 3 ? 5 : 6, kind = r.pick(['prod', 'quot', 'pow']), e, tx, wrongs;
          var v = find(function () {
            if (kind === 'prod') { var m = r.int(2, 6), n = r.int(1, 5); return { m: m, n: n, E: m + n }; }
            if (kind === 'quot') { var n2 = r.int(4, 15), d = r.int(2, lim); return { m: n2 + d, n: n2, E: d }; }
            var a = r.int(2, 3), c = r.int(2, 3); return { m: a, n: c, E: a * c };
          }, function (v) { return v.E >= 2 && v.E <= lim && v.m !== v.n; }, { m: 3, n: 2, E: 5 });
          if (kind === 'prod') { tx = b + '^{' + v.m + '}\\times ' + b + '^{' + v.n + '}'; wrongs = [[b + '^{' + v.m * v.n + '}', 'u2x-mult-exp', 'Same base, multiplying: <b>add</b> the exponents (product law).']]; }
          else if (kind === 'quot') { tx = '\\dfrac{' + b + '^{' + v.m + '}}{' + b + '^{' + v.n + '}}'; wrongs = [[b + '^{' + (v.m / v.n % 1 ? v.m + v.n : v.m / v.n) + '}', v.m / v.n % 1 ? 'u2x-add-exp' : 'u2x-div-exp', 'Same base, dividing: <b>subtract</b> the exponents (quotient law).']]; }
          else { tx = '\\left(' + b + '^{' + v.m + '}\\right)^{' + v.n + '}'; wrongs = [[b + '^{' + (v.m + v.n) + '}', 'u2x-add-exp', 'A power of a power: <b>multiply</b> the exponents.']]; }
          e = v.E; var val = Math.pow(b, e), law = kind === 'prod' ? 'Product law: ' + t(tx + '=' + b + '^{' + v.m + '+' + v.n + '}=' + b + '^{' + e + '}') : kind === 'quot' ? 'Quotient law: ' + t(tx + '=' + b + '^{' + v.m + '-' + v.n + '}=' + b + '^{' + e + '}') : 'Power of a power: ' + t(tx + '=' + b + '^{' + v.m + '\\times ' + v.n + '}=' + b + '^{' + e + '}');
          var kn = known(wrongs, b + '^{' + e + '}');
          var p = P.fields('Write ' + t(tx) + ' as a single power, then evaluate it.',
            [{ name: 'Single power', label: 'Single power:', mode: 'math', keys: 'expo', vars: [] }, { name: 'Value', label: 'Value:' }],
            [EX(b + '^{' + e + '}', { form: 'single-power', diag: kn }), K.number(val, function (x) { if (x === b * e) return { code: 'u2x-base-times-exp', hint: t(b + '^{' + e + '}') + ' means ' + t(b) + ' used as a factor ' + t(e) + ' times, not ' + t(b + '\\times ' + e) + '.' }; return null; })],
            [b + '^{' + e + '}', String(val)], t(tx + '=' + b + '^{' + e + '}=' + F(val)), law + ', and ' + t(b + '^{' + e + '}=' + F(val)) + '.',
            ['Same base: product law adds exponents, quotient law subtracts, power of a power multiplies.', 'Then multiply ' + t(b) + ' by itself ' + t(e) + ' times.'], 'single power ' + tx);
          p.bad = kn.texs.map(function (w) { return [w, String(val)]; }).concat(b * e !== val ? [[b + '^{' + e + '}', String(b * e)]] : []);
          return p;
        } },
        { id: '1b', outcome: 'AN3', level: 'BEG', make: function (r) {
          var k = r.int(2, 5), n = k === 5 ? r.int(2, 3) : r.int(2, 4), z = r.pick(['a', 'm', 'w', 'y', 'z']), target = Math.pow(k, n) + pw(z, n);
          var kn = known([[k + pw(z, n), 'u2x-coef-not-raised', 'The exponent applies to <b>every</b> factor inside the brackets, including the ' + t(k) + ': ' + t('(' + k + z + ')^{' + n + '}=' + k + '^{' + n + '}' + z + '^{' + n + '}') + '.'],
            [k * n + pw(z, n), 'u2x-coef-times-exp', t(k + '^{' + n + '}') + ' means ' + t(k) + ' multiplied by itself ' + t(n) + ' times, not ' + t(k + '\\times ' + n) + '.']], target);
          return XP('Use the power of a product law to simplify ' + t('\\left(' + k + z + '\\right)^{' + n + '}') + '.', target, { vars: [z] },
            t('\\left(' + k + z + '\\right)^{' + n + '}=' + k + '^{' + n + '}' + z + '^{' + n + '}=' + target) + '.',
            ['Raise <b>each</b> factor inside the brackets to the power ' + t(n) + '.'], 'power of a product (' + k + z + ')^' + n, kn);
        } }] },
      { num: '2', outcome: 'AN3', stem: '<b>Without a calculator</b>, evaluate each power. Watch whether the minus sign is part of the base.', parts: [
        { id: '2', outcome: 'AN3', level: 'EMG', make: function (r) {
          function item(kind) {
            var a = r.int(2, 5), ev = a === 5 ? 2 : r.pick([2, 4]), od = a >= 4 ? 3 : r.pick([3, 5]);
            if (kind === 'negEven') return { tex: '-' + a + '^{' + ev + '}', v: -Math.pow(a, ev), alt: [Math.pow(a, ev), 'u2x-neg-base', 'Without brackets the exponent belongs only to ' + t(a) + ': ' + t('-' + a + '^{' + ev + '}=-(' + a + '^{' + ev + '})') + '.'], sol: 'only ' + t(a) + ' is the base: ' + t('-(' + a + '^{' + ev + '})=' + (-Math.pow(a, ev))) };
            if (kind === 'parEven') return { tex: '(-' + a + ')^{' + ev + '}', v: Math.pow(a, ev), alt: [-Math.pow(a, ev), 'u2x-even-neg', 'The base is ' + t('-' + a) + ' and the exponent is even, so the negatives pair up: the answer is positive.'], sol: 'the base ' + t('-' + a) + ' is used an even number of times: ' + t('+' + Math.pow(a, ev)) };
            if (kind === 'parOdd') return { tex: '(-' + a + ')^{' + od + '}', v: -Math.pow(a, od), alt: [Math.pow(a, od), 'u2x-odd-neg', 'The base ' + t('-' + a) + ' is used an odd number of times, so one negative is left over: the answer is negative.'], sol: 'the base ' + t('-' + a) + ' is used an odd number of times: ' + t(-Math.pow(a, od)) };
            if (kind === 'negZero') { var c = r.int(3, 12); return { tex: '-' + c + '^{0}', v: -1, alt: [1, 'u2x-neg-base', 'Only ' + t(c) + ' is raised to the power ' + t('0') + ': ' + t('-' + c + '^{0}=-(1)') + '.'], zero: true, sol: t('-(' + c + '^{0})=-(1)=-1') }; }
            var d = r.int(3, 12); return { tex: '(-' + d + ')^{0}', v: 1, alt: [-1, 'u2x-neg-base', 'Here the whole bracket ' + t('(-' + d + ')') + ' is the base, and any non-zero base to the power ' + t('0') + ' is ' + t('1') + '.'], zero: true, sol: 'any non-zero base to the power ' + t('0') + ' is ' + t('1') };
          }
          var kinds = [r.pick(['negEven', 'parEven']), r.pick(['parOdd', r.pick(['negEven', 'parEven'])]), r.pick(['negZero', 'parZero'])];
          if (kinds[0] === kinds[1]) kinds[1] = kinds[0] === 'negEven' ? 'parEven' : 'negEven';
          var its = r.shuffle(kinds).map(item);
          var p = P.fields('Evaluate ' + its.map(function (x) { return t(x.tex); }).join(', ') + '.',
            its.map(function (x) { return { name: x.tex, before: t(x.tex + '=') }; }),
            its.map(function (x) { return K.number(x.v, function (v) { if (v === x.alt[0]) return { code: x.alt[1], hint: x.alt[2] }; if (x.zero && v === 0) return { code: 'u2x-zero-pow', hint: 'A power with exponent ' + t('0') + ' is ' + t('1') + ', not ' + t('0') + '.' }; return null; }); }),
            its.map(function (x) { return String(x.v); }), its.map(function (x) { return t(x.tex + '=' + x.v); }).join(', '),
            its.map(function (x) { return t(x.tex + '=' + x.v) + ': ' + x.sol + '.'; }).join('<br>'),
            ['Brackets decide the base: in ' + t('(-3)^{2}') + ' the base is ' + t('-3') + '; in ' + t('-3^{2}') + ' the base is ' + t('3') + ' and the minus sign waits outside.', 'Any non-zero base to the power ' + t('0') + ' is ' + t('1') + '.'], 'signs of powers: ' + its.map(function (x) { return x.tex; }).join(', '));
          p.bad = [its.map(function (x, i) { return String(i === 0 ? x.alt[0] : x.v); }), its.map(function (x, i) { return String(i === 1 ? x.alt[0] : x.v); }), its.map(function (x) { return String(x.zero ? 0 : x.v); })];
          return p;
        } }] },
      { num: '3', outcome: 'AN3', stem: 'Write every number as a power of the same prime first.', parts: [
        { id: '3', outcome: 'AN3', level: 'MAS', make: function (r) {
          var v = find(function () {
            var p = r.pick([2, 2, 3]), k = p === 2 ? r.int(2, 5) : r.int(2, 3), B = Math.pow(p, k), e = r.int(2, 9), f = r.int(3, 20);
            return { p: p, k: k, B: B, e: e, f: f, E: k * e - f };
          }, function (v) { return v.E >= (v.p === 2 ? 3 : 2) && v.E <= (v.p === 2 ? 7 : 4) && v.f !== v.e && v.f > v.e; }, { p: 2, k: 2, B: 4, e: 9, f: 11, E: 7 });
          var ctx = r.pick([
            { s: 'A water tank holds ' + t(v.B + '^{' + v.e + '}') + ' litres of water. Each bottle holds ' + t(v.p + '^{' + v.f + '}') + ' litres. How many bottles can be filled from the tank?', u: 'bottles' },
            { s: 'A server stores ' + t(v.B + '^{' + v.e + '}') + ' bytes of data. A backup drive holds ' + t(v.p + '^{' + v.f + '}') + ' bytes. How many of these drives does the backup need?', u: 'drives' },
            { s: 'A farm harvested ' + t(v.B + '^{' + v.e + '}') + ' kernels of corn and packs them in bags of ' + t(v.p + '^{' + v.f + '}') + ' kernels. How many bags does it fill?', u: 'bags' }]);
          var T = v.p + '^{' + v.E + '}', val = Math.pow(v.p, v.E);
          var kn = known([[v.p + '^{' + (v.e - v.f) + '}', 'u2x-base-same', t(v.B) + ' isn’t ' + t(v.p) + ': rewrite it first, ' + t(v.B + '=' + v.p + '^{' + v.k + '}') + ', so ' + t(v.B + '^{' + v.e + '}=' + v.p + '^{' + v.k * v.e + '}') + '.'],
            [v.p + '^{' + (v.k + v.e - v.f) + '}', 'u2x-add-exp', t('(' + v.p + '^{' + v.k + '})^{' + v.e + '}') + ' is a power of a power: <b>multiply</b> the exponents.'],
            [v.p + '^{' + (v.k * v.e + v.f) + '}', 'u2x-mult-exp', 'Dividing powers with the same base: <b>subtract</b> the exponents.']], T);
          var p = P.fields(ctx.s + ' Write the answer as a single power of ' + t(v.p) + ', then evaluate it.',
            [{ name: 'Single power', label: 'Single power of ' + t(v.p) + ':', mode: 'math', keys: 'expo', vars: [] }, { name: 'Value', label: 'Number of ' + ctx.u + ':' }],
            [EX(T, { form: 'single-power', diag: kn }), K.number(val, function (x) { if (v.e - v.f > -12 && x === Math.pow(v.p, v.e - v.f)) return { code: 'u2x-base-same', hint: 'Rewrite ' + t(v.B) + ' as a power of ' + t(v.p) + ' before using the quotient law.' }; if (x === v.p * v.E) return { code: 'u2x-base-times-exp', hint: t(T) + ' means ' + t(v.p) + ' used as a factor ' + t(v.E) + ' times.' }; return null; })],
            [T, String(val)], t(v.B + '^{' + v.e + '}\\div ' + v.p + '^{' + v.f + '}=' + T + '=' + val) + ' ' + ctx.u,
            t(v.B + '=' + v.p + '^{' + v.k + '}') + ', so ' + t(v.B + '^{' + v.e + '}=\\left(' + v.p + '^{' + v.k + '}\\right)^{' + v.e + '}=' + v.p + '^{' + v.k * v.e + '}') + ' (power of a power).<br>' + t(v.p + '^{' + v.k * v.e + '}\\div ' + v.p + '^{' + v.f + '}=' + v.p + '^{' + v.k * v.e + '-' + v.f + '}=' + T + '=' + val) + ' (quotient law), so ' + t(val) + ' ' + ctx.u + '.',
            ['Write ' + t(v.B) + ' as a power of ' + t(v.p) + '. Then use the power of a power law.', 'Now both powers have base ' + t(v.p) + ': divide by subtracting the exponents.'], 'base change ' + v.B + '^' + v.e + ' / ' + v.p + '^' + v.f);
          p.bad = kn.texs.map(function (w) { return [w, String(val)]; }).concat([[T, String(v.p * v.E)]]);
          return p;
        } }] }
    ]
  });

  /* ===== Lesson 2 — Several Exponent Laws ===== */
  var LET2 = [['p', 'q'], ['a', 'b'], ['x', 'y'], ['m', 'n'], ['c', 'd'], ['r', 's']];
  HW.defineExit({
    lesson: 'u2l2', calc: false, outcome: 'AN3',
    blurb: 'Multiplying and dividing monomials, a power of a product, and simplifying with several exponent laws.',
    questions: [
      { num: '1', outcome: 'AN3', stem: 'Simplify.', parts: [
        { id: '1a', outcome: 'AN3', level: 'BEG', make: function (r) {
          var L = r.pick(LET2), c1 = r.int(2, 9), c2 = r.int(2, 9) * (r.chance(0.3) ? -1 : 1), e = [r.int(2, 8), r.int(1, 7), r.int(1, 7), r.int(2, 8)];
          var A = M(c1, [[L[0], e[0]], [L[1], e[1]]]), B = M(c2, [[L[0], e[2]], [L[1], e[3]]]), T = mm(A, B), tgt = ptex(T);
          var kn = known([[c1 * c2 + pw(L[0], e[0] * e[2]) + pw(L[1], e[1] * e[3]), 'u2x-mult-exp', 'Multiplying powers with the same base: <b>add</b> the exponents.'],
            [(c1 + c2) + pw(L[0], e[0] + e[2]) + pw(L[1], e[1] + e[3]), 'u2x-coef-added', 'The numbers in front are <b>multiplied</b>: ' + t(c1 + '\\times ' + (c2 < 0 ? '(' + c2 + ')' : c2)) + '.']], tgt);
          return XP('Simplify ' + t('\\left(' + rtex(A) + '\\right)\\left(' + rtex(B) + '\\right)') + '.', tgt, { vars: L },
            t('(' + c1 + '\\times ' + (c2 < 0 ? '(' + c2 + ')' : c2) + ')' + L[0] + '^{' + e[0] + '+' + e[2] + '}' + L[1] + '^{' + e[1] + '+' + e[3] + '}=' + tgt) + '.',
            ['Multiply the numbers in front. For each letter, add the exponents.'], 'product of monomials', kn);
        } },
        { id: '1b', outcome: 'AN3', level: 'BEG', make: function (r) {
          var L = r.pick(LET2), c2 = r.int(2, 8), q = r.int(2, 6), c1 = c2 * q, d = [r.int(1, 5), r.int(1, 5)], e = [d[0] + r.int(1, 6), d[1] + r.int(1, 6)];
          var A = M(c1, [[L[0], e[0]], [L[1], e[1]]]), B = M(c2, [[L[0], d[0]], [L[1], d[1]]]), T = mdiv(A, B), tgt = ptex(T);
          var wr = [[(c1 - c2) + pw(L[0], e[0] - d[0]) + pw(L[1], e[1] - d[1]), 'u2x-coef-added', 'The numbers in front are <b>divided</b>: ' + t(c1 + '\\div ' + c2 + '=' + q) + '.']];
          if (e[0] % d[0] === 0 && e[1] % d[1] === 0) wr.push([q + pw(L[0], e[0] / d[0]) + pw(L[1], e[1] / d[1]), 'u2x-div-exp', 'Dividing powers with the same base: <b>subtract</b> the exponents, don’t divide them.']);
          else wr.push([q + pw(L[0], e[0] + d[0]) + pw(L[1], e[1] + d[1]), 'u2x-add-exp', 'Dividing powers with the same base: <b>subtract</b> the exponents.']);
          var kn = known(wr, tgt);
          return XP('Simplify ' + t('\\dfrac{' + rtex(A) + '}{' + rtex(B) + '}') + '.', tgt, { vars: L },
            t('\\frac{' + c1 + '}{' + c2 + '}' + L[0] + '^{' + e[0] + '-' + d[0] + '}' + L[1] + '^{' + e[1] + '-' + d[1] + '}=' + tgt) + '.',
            ['Divide the numbers in front. For each letter, subtract the exponents (top minus bottom).'], 'quotient of monomials', kn);
        } }] },
      { num: '2', outcome: 'AN3', stem: 'Simplify fully.', parts: [
        { id: '2', outcome: 'AN3', level: 'PRG', make: function (r) {
          var L = r.pick(LET2), k = r.pick([-2, -3, 2, 3, -2]), n = Math.abs(k) === 3 ? r.int(2, 3) : r.int(2, 4), a = r.int(2, 5), b = r.int(1, 5), c = r.int(1, 4), d = r.int(1, 6), m = r.int(2, 6) * (r.chance(0.3) ? -1 : 1);
          var A = M(k, [[L[0], a], [L[1], b]]), B = M(m, [[L[0], c], [L[1], d]]), T = mm(mpow(A, n), B), tgt = ptex(T);
          var kn = known([[k * m + pw(L[0], a * n + c) + pw(L[1], b * n + d), 'u2x-coef-not-raised', 'The outside exponent ' + t(n) + ' applies to the ' + t(k) + ' too: ' + t('(' + k + ')^{' + n + '}=' + Math.pow(k, n)) + '.'],
            [Math.pow(k, n) * m + pw(L[0], a + n + c) + pw(L[1], b + n + d), 'u2x-add-exp', 'A power of a power: <b>multiply</b> the exponents inside the brackets by ' + t(n) + '.'],
            [-Math.pow(k, n) * m + pw(L[0], a * n + c) + pw(L[1], b * n + d), 'u2x-sign-final', 'Check the sign: ' + t('(' + k + ')^{' + n + '}=' + Math.pow(k, n)) + '.'],
            [Math.pow(k, n) * m + pw(L[0], a * n * c) + pw(L[1], b * n * d), 'u2x-mult-exp', 'When you multiply the two parts, <b>add</b> the exponents of each letter.']], tgt);
          var sq = mpow(A, n);
          return XP('Simplify ' + t('\\left(' + rtex(A) + '\\right)^{' + n + '}\\left(' + rtex(B) + '\\right)') + '.', tgt, { vars: L },
            'Power of a product, then power of a power: ' + t('\\left(' + rtex(A) + '\\right)^{' + n + '}=' + (k < 0 ? '(' + k + ')' : k) + '^{' + n + '}' + L[0] + '^{' + a + '\\times ' + n + '}' + L[1] + '^{' + b + '\\times ' + n + '}=' + rtex(sq)) + '.<br>Product law: ' + t('\\left(' + rtex(sq) + '\\right)\\left(' + rtex(B) + '\\right)=' + tgt) + '.',
            ['First raise every factor in the brackets to the power ' + t(n) + ' (the number too, with its sign).', 'Then multiply: numbers times numbers, add the exponents of each letter.'], 'power of a product times monomial', kn);
        } }] },
      { num: '3', outcome: 'AN3', stem: 'Write in simplest form without brackets.', parts: [
        { id: '3', outcome: 'AN3', level: 'ADV', make: function (r) {
          var v = find(function () {
            var x = r.pick(['t', 'x', 'k', 'w']), k = r.int(2, 6), a = r.int(2, 5), b = r.int(1, 5), c = r.int(1, 4), p = r.pick([3, 4]), d = r.int(1, 6), e = r.int(2, 8);
            return { x: x, k: k, a: a, b: b, c: c, p: p, d: d, e: e, E: 2 * (a + b - c) + p + d - e };
          }, function (v) { return v.a + v.b - v.c >= 1 && v.E >= 2 && v.p + v.d - v.e !== 0; }, { x: 't', k: 5, a: 2, b: 4, c: 1, p: 4, d: 3, e: 4, E: 13 });
          var x = v.x, sgn = v.p % 2 ? -1 : 1, T = M(sgn * v.k, [[x, v.E]]), tgt = ptex(T);
          var f1 = '\\left(\\dfrac{-' + v.k + pw(x, v.a) + '\\cdot ' + pw(x, v.b) + '}{' + pw(x, v.c) + '}\\right)^{2}', f2 = '\\left(\\dfrac{(-' + x + ')^{' + v.p + '}\\cdot ' + pw(x, v.d) + '}{' + v.k + pw(x, v.e) + '}\\right)';
          var in1 = v.a + v.b - v.c, in2 = v.p + v.d - v.e;
          var kn = known([[String(sgn) + '\\cdot ' + pw(x, v.E), 'u2x-coef-not-raised', 'Square the whole first bracket, including the ' + t('-' + v.k) + ': ' + t('(-' + v.k + ')^{2}=' + v.k * v.k) + '.'],
            [String(-sgn * v.k) + pw(x, v.E), 'u2x-sign-final', 'Check the sign: ' + t('(-' + v.k + ')^{2}') + ' is positive, and ' + t('(-' + x + ')^{' + v.p + '}=' + (sgn < 0 ? '-' : '') + x + '^{' + v.p + '}') + '.'],
            [String(sgn * v.k) + pw(x, in1 + 2 + in2), 'u2x-add-exp', 'Squaring the first bracket <b>doubles</b> its exponent: ' + t('(' + x + '^{' + in1 + '})^{2}=' + x + '^{' + 2 * in1 + '}') + '.']], tgt);
          return XP('Simplify ' + t(f1 + f2) + '.', tgt, { vars: [x] },
            'Simplify inside each bracket first:<br>' + t('\\frac{-' + v.k + pw(x, v.a) + '\\cdot ' + pw(x, v.b) + '}{' + pw(x, v.c) + '}=-' + v.k + pw(x, in1)) + ', and squaring gives ' + t(v.k * v.k + pw(x, 2 * in1)) + '.<br>' +
              t('(-' + x + ')^{' + v.p + '}=' + (sgn < 0 ? '-' : '') + pw(x, v.p)) + ', so ' + t('\\frac{' + (sgn < 0 ? '-' : '') + pw(x, v.p) + '\\cdot ' + pw(x, v.d) + '}{' + v.k + pw(x, v.e) + '}=' + ptex(M(sgn, [[x, in2]]).c[0] < 0 ? M([-1, v.k], [[x, in2]]) : M([1, v.k], [[x, in2]]))) + '.<br>' +
              'Multiply: ' + t(v.k * v.k + '\\times\\frac{' + (sgn < 0 ? '-' : '') + '1}{' + v.k + '}=' + sgn * v.k) + ' and ' + t(x + '^{' + 2 * in1 + '+(' + in2 + ')}=' + pw(x, v.E)) + ', so the answer is ' + t(tgt) + '.',
            ['Simplify inside each bracket first (product and quotient laws), then square the first one — every factor, including the number and its sign.', 'A negative base to an even power is positive; to an odd power it stays negative.'], 'several laws with brackets', kn);
        } }] }
    ]
  });

  /* ===== Lesson 3 — Negative Exponents and Scientific Notation ===== */
  var SCI_A = [12, 15, 16, 18, 20, 22, 24, 25, 30, 32, 35, 40, 44, 45, 48, 50, 60, 64, 75, 80, 90];
  HW.defineExit({
    lesson: 'u2l3', calc: false, outcome: 'AN3',
    blurb: 'Negative exponents: evaluating, rewriting with positive exponents, simplifying, and scientific notation.',
    questions: [
      { num: '1', outcome: 'AN3', stem: '', parts: [
        { id: '1a', outcome: 'AN3', level: 'BEG', make: function (r) {
          var kind = r.pick(['fracNeg', 'recip', 'zeroNeg']), k, tx, ans, sol, wr;
          if (kind === 'fracNeg') { k = r.int(2, 9); tx = '\\left(\\dfrac{1}{' + k + '}\\right)^{-2}'; ans = R(k * k); sol = t(tx + '=\\left(\\frac{' + k + '}{1}\\right)^{2}=' + k * k) + ': flip the fraction and make the exponent positive.'; wr = [['\\frac{1}{' + k * k + '}', 'u2x-no-flip', 'A negative exponent means flip the fraction: ' + t('\\left(\\frac{1}{' + k + '}\\right)^{-2}=' + k + '^{2}') + '.'], ['-' + k * k, 'u2x-opposite', 'A negative exponent doesn’t make the answer negative — it means <b>reciprocal</b>.']]; }
          else if (kind === 'recip') { k = r.int(2, 5); var n = k <= 3 ? r.int(3, 4) : 3; tx = '\\dfrac{1}{' + k + '^{-' + n + '}}'; ans = R(Math.pow(k, n)); sol = t(tx + '=' + k + '^{' + n + '}=' + Math.pow(k, n)) + ': a power with a negative exponent in the denominator moves up with a positive exponent.'; wr = [['\\frac{1}{' + Math.pow(k, n) + '}', 'u2x-no-flip', t('\\frac{1}{' + k + '^{-' + n + '}}=' + k + '^{' + n + '}') + ': the negative power in the denominator moves up to the numerator.'], ['-' + Math.pow(k, n), 'u2x-opposite', 'A negative exponent means reciprocal, not negative.']]; }
          else { k = r.int(3, 9); tx = k + '^{0}\\times ' + k + '^{-2}'; ans = R(1, k * k); sol = t(tx + '=1\\times\\frac{1}{' + k + '^{2}}=\\frac{1}{' + k * k + '}') + '.'; wr = [['0', 'u2x-zero-pow', t(k + '^{0}=1') + ', not ' + t('0') + '.'], ['-' + k * k, 'u2x-opposite', 'A negative exponent means reciprocal: ' + t(k + '^{-2}=\\frac{1}{' + k + '^{2}}') + '.'], [String(k * k), 'u2x-no-flip', t(k + '^{-2}') + ' is the <b>reciprocal</b> of ' + t(k + '^{2}') + '.']]; }
          var kn = known(wr, frT(ans));
          var p = P.math('<b>Without a calculator</b>, evaluate ' + t(tx) + '.', exactChk(ans, kn), frT(ans), sol, ['A negative exponent means reciprocal: ' + t('a^{-n}=\\frac{1}{a^{n}}') + ' and ' + t('\\frac{1}{a^{-n}}=a^{n}') + '.'], 'evaluate ' + tx, { keys: 'fraction' });
          p.bad = kn.texs.slice();
          return p;
        } },
        { id: '1b', outcome: 'AN3', level: 'BEG', make: function (r) {
          var L = r.pick(LET2), a = r.int(2, 9), b = r.int(2, 9), c = r.int(2, 12), kind = r.pick(['xy', 'cOver', 'over']), tx, T, wr;
          if (kind === 'xy') { tx = pw(L[0], a) + pw(L[1], -b); T = '\\frac{' + pw(L[0], a) + '}{' + pw(L[1], b) + '}'; wr = [[pw(L[0], a) + '\\cdot(-' + pw(L[1], b) + ')', 'u2x-opposite', 'A negative exponent means reciprocal: ' + t(pw(L[1], -b) + '=\\frac{1}{' + pw(L[1], b) + '}') + ', not ' + t('-' + pw(L[1], b)) + '.'], ['\\frac{1}{' + pw(L[0], a) + pw(L[1], b) + '}', 'u2x-coef-side', 'Only ' + t(L[1]) + ' has a negative exponent, so only it moves below the fraction bar.']]; }
          else if (kind === 'cOver') { tx = '\\dfrac{' + c + '}{' + pw(L[0], -a) + '}'; T = c + pw(L[0], a); wr = [['\\frac{' + pw(L[0], a) + '}{' + c + '}', 'u2x-coef-side', 'Only ' + t(pw(L[0], -a)) + ' has a negative exponent, so only it moves; the ' + t(c) + ' stays on top.'], ['\\frac{' + c + '}{' + pw(L[0], a) + '}', 'u2x-no-flip', 'A power with a negative exponent in the denominator moves <b>up</b> with a positive exponent.']]; }
          else { tx = '\\dfrac{' + pw(L[0], -a) + '}{' + pw(L[1], b) + '}'; T = '\\frac{1}{' + pw(L[0], a) + pw(L[1], b) + '}'; wr = [['\\frac{' + pw(L[0], a) + '}{' + pw(L[1], b) + '}', 'u2x-no-flip', t(pw(L[0], -a)) + ' moves to the <b>denominator</b> with a positive exponent.'], ['-\\frac{' + pw(L[0], a) + '}{' + pw(L[1], b) + '}', 'u2x-opposite', 'A negative exponent means reciprocal, not negative.']]; }
          var kn = known(wr, T);
          return XP('Write ' + t(tx) + ' with positive exponents only.', T, { vars: L },
            t(tx + '=' + T) + ': each factor with a negative exponent moves to the other side of the fraction bar and its exponent becomes positive; everything else stays where it is.',
            ['Move <b>only</b> the factors with negative exponents across the fraction bar.'], 'positive exponents ' + tx, kn);
        } }] },
      { num: '2', outcome: 'AN3', stem: 'Simplify. Write the answer with positive exponents.', parts: [
        { id: '2', outcome: 'AN3', level: 'PRG', make: function (r) {
          var v = find(function () { var L = r.pick(LET2), c = r.pick([2, 3, -2, -3, 4, 5]), a = r.int(1, 4), b = r.int(1, 3), d = r.int(1, 9), e = r.int(-5, 4), f = r.int(1, 4); return { L: L, c: c, a: a, b: b, d: d, e: e, f: f }; },
            function (v) { return v.e !== 0 && 2 * v.a + v.e !== 0 && v.c * v.c !== v.d && gcd(v.d, v.c * v.c) < v.c * v.c; }, { L: ['x', 'y'], c: -2, a: 3, b: 2, d: 3, e: -1, f: 1 });
          var L = v.L, A = M(v.c, [[L[0], -v.a], [L[1], v.b]]), B = M(v.d, [[L[0], v.e], [L[1], -v.f]]), sq = mpow(A, -2), T = mm(sq, B), tgt = ptex(T);
          var kn = known([[ptex(mm(mpow(M(v.c, [[L[0], -v.a], [L[1], v.b]]), 2), B)), 'u2x-no-flip', 'The outside exponent is ' + t('-2') + ': every exponent inside is multiplied by ' + t('-2') + ', and the number becomes ' + t('(' + v.c + ')^{-2}=\\frac{1}{' + v.c * v.c + '}') + '.'],
            [ptex(mm(M(v.c * v.c * (v.c < 0 ? 1 : 1), sq.v), B)), 'u2x-coef-pos-power', t('(' + v.c + ')^{-2}=\\frac{1}{(' + v.c + ')^{2}}=\\frac{1}{' + v.c * v.c + '}') + ', not ' + t(v.c * v.c) + '.'],
            [ptex(mm(M(v.c * -2, sq.v), B)), 'u2x-coef-times-exp', t('(' + v.c + ')^{-2}') + ' means ' + t('\\frac{1}{(' + v.c + ')^{2}}') + ', not ' + t(v.c + '\\times(-2)') + '.']], tgt);
          return XP('Simplify ' + t('\\left(' + rtex(A) + '\\right)^{-2}\\left(' + rtex(B) + '\\right)') + '.', tgt, { vars: L },
            'Raise every factor to the power ' + t('-2') + ': ' + t('\\left(' + rtex(A) + '\\right)^{-2}=(' + v.c + ')^{-2}' + L[0] + '^{(-' + v.a + ')(-2)}' + L[1] + '^{' + v.b + '(-2)}=' + rtex(sq)) + '.<br>Multiply: ' + t(fin(T)) + '.',
            ['Multiply every exponent in the brackets by ' + t('-2') + ' — the number too: ' + t('(' + v.c + ')^{-2}=\\frac{1}{' + v.c * v.c + '}') + '.', 'Then multiply by the second factor (add the exponents) and move negative powers below the fraction bar.'], 'negative power of a product', kn);
        } }] },
      { num: '3', outcome: 'AN3', stem: '<b>Without a calculator</b>: write every number as a power of the same prime first.', parts: [
        { id: '3', outcome: 'AN3', level: 'MAS', make: function (r) {
          var v = find(function () {
            var p = r.pick([2, 2, 3, 5]), ks = p === 2 ? [2, 3, 4, 5] : p === 3 ? [2, 3, 4] : [2, 3], k1 = r.pick(ks), k2 = r.pick(ks.filter(function (x) { return x !== k1; })), e1 = r.pick([-3, -2, -1, 2, 3]), e2 = r.int(2, 7), e3 = r.pick([-3, -2, -1, 1, 2]);
            return { p: p, k1: k1, k2: k2, e1: e1, e2: e2, e3: e3, E: k1 * e1 + e2 - k2 * e3 };
          }, function (v) { var lo = v.p === 2 ? -5 : v.p === 3 ? -3 : -2, hi = v.p === 2 ? 7 : v.p === 3 ? 4 : 3; return v.E !== 0 && v.E !== 1 && v.E >= lo && v.E <= hi && (v.e1 < 0 || v.e3 < 0) && v.e1 + v.e2 - v.e3 !== v.E; }, { p: 2, k1: 2, k2: 3, e1: -2, e2: 7, e3: -1, E: 6 });
          var B1 = Math.pow(v.p, v.k1), B2 = Math.pow(v.p, v.k2), tx = '\\dfrac{' + B1 + '^{' + v.e1 + '}\\cdot ' + v.p + '^{' + v.e2 + '}}{' + B2 + '^{' + v.e3 + '}}', T = v.p + '^{' + v.E + '}', val = rpow([v.p, 1], v.E);
          var Ebad = v.k1 * v.e1 + v.e2 + v.k2 * v.e3;
          var kn = known([[v.p + '^{' + (v.e1 + v.e2 - v.e3) + '}', 'u2x-base-same', t(B1) + ' and ' + t(B2) + ' aren’t ' + t(v.p) + ': write ' + t(B1 + '=' + v.p + '^{' + v.k1 + '}') + ' and ' + t(B2 + '=' + v.p + '^{' + v.k2 + '}') + ' first.'],
            Ebad !== v.E ? [v.p + '^{' + Ebad + '}', 'u2x-sub-neg', 'Dividing by ' + t(v.p + '^{' + v.k2 * v.e3 + '}') + ' means <b>subtracting</b> its exponent: ' + t('-(' + v.k2 * v.e3 + ')') + '.'] : null,
            [v.p + '^{' + (v.k1 + v.e1 + v.e2 - (v.k2 + v.e3)) + '}', 'u2x-add-exp', 'A power of a power multiplies the exponents: ' + t(B1 + '^{' + v.e1 + '}=\\left(' + v.p + '^{' + v.k1 + '}\\right)^{' + v.e1 + '}=' + v.p + '^{' + v.k1 * v.e1 + '}') + '.']], T);
          var vk = known([[v.p + '^{' + (v.e1 + v.e2 - v.e3) + '}', 'u2x-base-same', 'Rewrite ' + t(B1) + ' and ' + t(B2) + ' as powers of ' + t(v.p) + ' first.'], ['-' + frT(val), 'u2x-opposite', 'A negative exponent means reciprocal, not negative.'], [frT(inv(val)), 'u2x-no-flip', 'Check the sign of the exponent: ' + t(T) + (v.E < 0 ? ' is a reciprocal.' : ' is a whole number.')]], frT(val));
          var p = P.fields('Evaluate ' + t(tx) + '. Give it as a single power of ' + t(v.p) + ', then as a number.',
            [{ name: 'Single power', label: 'Single power of ' + t(v.p) + ':', mode: 'math', keys: 'expo', vars: [] }, { name: 'Value', label: 'Value:', mode: 'math', keys: 'fraction' }],
            [EX(T, { form: 'single-power', positive: false, diag: kn }), exactChk(val, vk)], [T, frT(val)], t(tx + '=' + T + '=' + frT(val)),
            t(B1 + '=' + v.p + '^{' + v.k1 + '}') + ' and ' + t(B2 + '=' + v.p + '^{' + v.k2 + '}') + ', so the expression is ' + t('\\frac{' + v.p + '^{' + v.k1 * v.e1 + '}\\cdot ' + v.p + '^{' + v.e2 + '}}{' + v.p + '^{' + v.k2 * v.e3 + '}}') + ' (power of a power).<br>' +
              t(v.p + '^{' + v.k1 * v.e1 + '+' + v.e2 + '-(' + v.k2 * v.e3 + ')}=' + T + '=' + frT(val)) + (v.E < 0 ? ' (a negative exponent means reciprocal).' : '.'),
            ['Write ' + t(B1) + ' and ' + t(B2) + ' as powers of ' + t(v.p) + ', then use the power of a power law.', 'Product law: add exponents; quotient law: subtract (watch the signs). Then evaluate.'], 'powers of ' + v.p + ': ' + tx);
          p.bad = kn.texs.map(function (w) { return [w, frT(val)]; }).concat(vk.texs.map(function (w) { return [T, w]; }));
          return p;
        } }] },
      { num: '4', outcome: 'AN3', stem: '', parts: [
        { id: '4', outcome: 'AN3', level: 'EMG', make: function (r) {
          var v = find(function () {
            var A = r.pick(SCI_A), B = r.pick(SCI_A), m = r.int(-9, 9), n = r.int(-9, 9), div = r.chance(0.4);
            return { A: A, B: B, m: m, n: n, div: div };
          }, function (v) { if (v.m >= 0 && v.n >= 0) return false; if (!v.m || !v.n) return false; if (v.div) return (v.A * 100) % v.B === 0 && v.A !== v.B && String(v.A / v.B).length <= 4; return String(v.A * v.B / 100).replace('.', '').replace(/^0+/, '').length <= 3; }, { A: 44, B: 20, m: 4, n: -2, div: false });
          var a = v.A / 10, b = v.B / 10, x = v.div ? a / b * Math.pow(10, v.m - v.n) : a * b * Math.pow(10, v.m + v.n), xs = Number(x.toPrecision(10));
          var tx = v.div ? '\\left(' + a + '\\times 10^{' + v.m + '}\\right)\\div\\left(' + b + '\\times 10^{' + v.n + '}\\right)' : '\\left(' + a + '\\times 10^{' + v.m + '}\\right)\\left(' + b + '\\times 10^{' + v.n + '}\\right)';
          var co = v.div ? Number((a / b).toPrecision(10)) : Number((a * b).toPrecision(10)), ex10 = v.div ? v.m - v.n : v.m + v.n;
          var key = K.sciTex(xs), parts = K.sciParts(xs);
          var p = P.sci('Evaluate ' + t(tx) + '. Write the result in scientific notation.', xs, { diag: function (val) { var mult = co * Math.pow(10, v.div ? Math.round(v.m / v.n) : v.m * v.n); if (Math.abs(val - mult) <= 1e-9 * Math.abs(mult)) return { code: 'u2x-sci-mult', hint: (v.div ? 'Dividing powers of 10: <b>subtract</b> the exponents.' : 'Multiplying powers of 10: <b>add</b> the exponents.') }; return null; } },
            (v.div ? 'Divide the numbers and subtract the exponents: ' + t(a + '\\div ' + b + '=' + co) + ' and ' + t('10^{' + v.m + '-(' + v.n + ')}=10^{' + ex10 + '}') : 'Multiply the numbers and add the exponents: ' + t(a + '\\times ' + b + '=' + co) + ' and ' + t('10^{' + v.m + '+(' + v.n + ')}=10^{' + ex10 + '}')) + '.<br>' +
              (co >= 10 || co < 1 ? t(co + '\\times 10^{' + ex10 + '}=' + key) + ' (move the decimal point so the number in front is between ' + t('1') + ' and ' + t('10') + ').' : 'So the answer is ' + t(key) + '.'),
            ['Work with the numbers and the powers of 10 separately.', 'The number in front must be at least ' + t('1') + ' and less than ' + t('10') + ': adjust the power of 10 if it isn’t.'], 'scientific notation ' + (v.div ? 'quotient' : 'product'));
          var off = parts.a + '\\times 10^{' + (parts.n + (co >= 10 ? -1 : 1)) + '}', mult = co + '\\times 10^{' + (v.div ? (v.m % v.n === 0 ? v.m / v.n : v.m + v.n) : v.m * v.n) + '}';
          p.bad = [off, mult].filter(function (b0) { return b0 !== key; });
          return p;
        } }] }
    ]
  });

  /* ===== Lesson 4 — Rational Exponents and Radicals ===== */
  function powTable(q, maxV) { var o = []; for (var b = 2; Math.pow(b, q) <= maxV; b++) o.push(b); return o; }
  /* the base^{e} the student wrote, where e must be the given exponent */
  function givenExpChk(val, e, keyTex) {
    e = R(e);
    return function (resp) {
      var a = K.read(resp); if (a.res) return a.res;
      var top = strip(a.ast);
      if (top.t !== 'pow') { if (ex.eq(a.val, rv(val))) return wrong('u2x-not-given-exp', 'That’s the number itself. Write it as a power whose exponent is ' + t(eT(e)) + ', like ' + t(keyTex.replace(/^\\left\(|\\right\)/g, '')) + '’s form: (base)' + t('^{' + eT(e) + '}') + '.'); return wrong('value', null); }
      var ge = ex.rat(top.b);
      if (!ge || ge[0] * e[1] !== e[0] * ge[1]) return ex.eq(a.val, rv(val)) ? wrong('u2x-not-given-exp', 'Right value, but the exponent must be ' + t(eT(e)) + '.') : wrong('value', null);
      if (!ex.eq(a.val, rv(val))) {
        var bv = ex.value(top.a);
        if (isFinite(bv) && ex.eq(bv, rv(val))) return wrong('u2x-base-is-number', 'The base can’t be the number itself: ' + t(frT(val) + '^{' + eT(e) + '}') + ' isn’t ' + t(frT(val)) + '. Find the base whose power ' + t(eT(e)) + ' gives ' + t(frT(val)) + '.');
        if (isFinite(bv) && ex.eq(a.val, 1 / rv(val))) return wrong('u2x-no-flip', 'Your power equals ' + t(frT(inv(val))) + ', the reciprocal. With a negative exponent, the base has to be flipped.');
        if (isFinite(bv) && ex.eq(Math.pow(bv, rv(inv(e))), rv(val))) return wrong('u2x-index-power', 'Check the base: undo the exponent ' + t(eT(e)) + ' by raising the number to the power ' + t(eT(inv(e))) + '.');
        return wrong('value', null);
      }
      var b = strip(top.a); if (b.t === 'neg') b = strip(b.a);
      if (!(b.t === 'num' || (b.t === 'div' && strip(b.a).t === 'num' && strip(b.b).t === 'num'))) return form('evaluate', 'Right value — now work the base out to a single number.');
      return ok();
    };
  }
  HW.defineExit({
    lesson: 'u2l4', calc: false, outcome: 'AN3',
    blurb: 'Evaluating powers with rational exponents, converting between powers and radicals, and writing a number as a power with a given exponent.',
    questions: [
      { num: '1', outcome: 'AN3', stem: '', parts: [
        { id: '1a', outcome: 'AN3', level: 'BEG', make: function (r) {
          var n = r.pick([2, 2, 3, 3, 4, 5]), base = n === 2 ? r.pick([4, 6, 7, 8, 9, 11, 12, 15, 20, 30, 40, 50, 60]) : r.pick(powTable(n, n === 3 ? 1000 : n === 4 ? 625 : 243)), N = Math.pow(base, n);
          var kn = known([[String(N / n % 1 ? N * n : N / n), 'u2x-root-div', 'An exponent of ' + t('\\frac{1}{' + n + '}') + ' means the ' + K.rootName(n) + ' root, not dividing by ' + t(n) + '.']], String(base));
          var p = P.math('<b>Without a calculator</b>, evaluate ' + t(F(N) + '^{\\frac{1}{' + n + '}}') + '.', exactChk(base, kn), String(base),
            t(F(N) + '^{\\frac{1}{' + n + '}}=' + rootT(n, F(N)) + '=' + base) + ' because ' + t(base + '^{' + n + '}=' + F(N)) + '.',
            ['An exponent of ' + t('\\frac{1}{n}') + ' means the ' + t('n') + 'th root: ' + t('a^{\\frac{1}{n}}=\\sqrt[n]{a}') + '.'], 'evaluate ' + N + '^(1/' + n + ')', { keys: 'fraction' });
          p.bad = kn.texs.slice();
          return p;
        } },
        { id: '1b', outcome: 'AN3', level: 'BEG', make: function (r) {
          var k = r.int(2, 9), n = r.int(2, 7), x = r.pick(['x', 'm', 'p', 'w', 'y']), T = k + rootT(n, x);
          var kn = known([[rootT(n, k + x), 'u2x-coef-in', 'The exponent ' + t('\\frac{1}{' + n + '}') + ' belongs only to ' + t(x) + ', so the ' + t(k) + ' stays outside the radical.'], [k + rootT(n, pw(x, n)), 'u2x-index-power', t(x + '^{\\frac{1}{' + n + '}}') + ' is the ' + K.rootName(n) + ' root of ' + t(x) + ' itself.']], T);
          return XP('Write ' + t(k + x + '^{\\frac{1}{' + n + '}}') + ' in radical form.', T, { form: 'radical', vars: [x] },
            'Only ' + t(x) + ' has the exponent ' + t('\\frac{1}{' + n + '}') + ': ' + t(k + x + '^{\\frac{1}{' + n + '}}=' + T) + '.',
            ['The denominator of the exponent is the index of the root.', 'An exponent belongs only to the base it touches.'], 'radical form ' + k + x + '^(1/' + n + ')', kn);
        } }] },
      { num: '2', outcome: 'AN3', stem: '<b>Without a calculator</b>, determine the exact value.', parts: [
        { id: '2', outcome: 'AN3', level: 'PRG', make: function (r) {
          var v = find(function () {
            var q = r.pick([2, 2, 3, 3, 4]), p = r.int(1, 3), frac = r.chance(0.35), a = frac ? r.int(1, 4) : 1, b = r.int(2, q === 2 ? 9 : q === 3 ? 5 : 3);
            return { q: q, p: p, frac: frac, a: a, b: b };
          }, function (v) { return gcd(v.p, v.q) === 1 && v.p !== v.q && (!v.frac || (v.a < v.b && gcd(v.a, v.b) === 1 && v.a > 1)) && Math.pow(v.b, v.p) <= 1000 && Math.pow(v.b, v.q) <= 625 && !(v.p === 1 && !v.frac && v.q === 2 && v.b < 4); }, { q: 3, p: 2, frac: false, a: 1, b: 2 });
          var baseR = v.frac ? R(Math.pow(v.a, v.q), Math.pow(v.b, v.q)) : R(Math.pow(v.b, v.q)), root = v.frac ? R(v.a, v.b) : R(v.b), ans = rpow(root, -v.p), e = '-\\frac{' + v.p + '}{' + v.q + '}';
          var bT = v.frac ? '\\left(\\dfrac{' + baseR[0] + '}{' + baseR[1] + '}\\right)' : F(baseR[0]);
          var wr = [[frT(rpow(root, v.p)), 'u2x-no-flip', 'The negative exponent means <b>reciprocal</b>: ' + t('a^{-\\frac{m}{n}}=\\frac{1}{a^{\\frac{m}{n}}}') + '.'], ['-' + frT(ans), 'u2x-neg-value', 'A negative exponent never makes the value negative.']];
          if (v.p > 1) wr.push([frT(inv(root)), 'u2x-power-only', 'You took the ' + K.rootName(v.q) + ' root and the reciprocal — now raise it to the power ' + t(v.p) + '.']);
          var kn = known(wr, frT(ans));
          var p = P.math('Evaluate ' + t(bT + '^{' + e + '}') + '.', exactChk(ans, kn), frT(ans),
            t(bT + '^{' + e + '}=' + (v.frac ? '\\left(\\frac{' + baseR[1] + '}{' + baseR[0] + '}\\right)^{\\frac{' + v.p + '}{' + v.q + '}}' : '\\frac{1}{' + F(baseR[0]) + '^{\\frac{' + v.p + '}{' + v.q + '}}}')) + ' (negative exponent: reciprocal).<br>' +
              t(rootT(v.q, v.frac ? '\\frac{' + baseR[1] + '}{' + baseR[0] + '}' : F(baseR[0])) + '=' + frT(v.frac ? inv(root) : root)) + ', then to the power ' + t(v.p) + ': ' + t(v.frac ? '\\left(' + frT(inv(root)) + '\\right)^{' + v.p + '}=' + frT(ans) : '\\frac{1}{' + v.b + (v.p > 1 ? '^{' + v.p + '}' : '') + '}=' + frT(ans)) + '.',
            ['Negative exponent: take the reciprocal. Denominator of the exponent: the root. Numerator: the power.', 'Take the root first so the numbers stay small.'], 'evaluate ' + baseR.join('/') + '^(' + e + ')', { keys: 'fraction' });
          p.bad = kn.texs.slice();
          return p;
        } }] },
      { num: '3', outcome: 'AN3', stem: 'Write each number as a power with the exponent given. (The base will be a whole number or a fraction.)', parts: [
        { id: '3', outcome: 'AN3', level: 'ADV', make: function (r) {
          var A = find(function () { var e = r.pick([[1, 2], [1, 3], [2, 3], [3, 2], [1, 4], [3, 4], [2, 5]]), b = r.int(2, 10); return { e: e, b: b, N: Math.pow(b, e[0]), B: Math.pow(b, e[1]) }; }, function (s) { return s.B <= 10000 && s.N >= 4 && s.N <= 1000; }, { e: [2, 3], b: 10, N: 100, B: 1000 });
          var Bv = find(function () { var q = r.pick([2, 3]), m = r.int(2, q === 2 ? 12 : 6), recip = r.chance(0.5); return { q: q, m: m, recip: recip }; }, function () { return true; }, { q: 2, m: 10, recip: true });
          var eB = [-1, Bv.q], valB = Bv.recip ? R(1, Bv.m) : R(Bv.m), baseB = Bv.recip ? R(Math.pow(Bv.m, Bv.q)) : R(1, Math.pow(Bv.m, Bv.q));
          var keyA = F(A.B).replace(/\\,/g, '') + '^{' + eT(A.e) + '}', keyB = (baseB[1] === 1 ? String(baseB[0]) : '\\left(\\frac{1}{' + baseB[1] + '}\\right)') + '^{' + eT(eB) + '}';
          var p = P.fields('(i) Write ' + t(F(A.N)) + ' as a power with an exponent of ' + t(eT(A.e)) + '.<br>(ii) Write ' + t(frT(valB)) + ' as a power with an exponent of ' + t(eT(eB)) + '.',
            [{ name: '(i)', label: '(i)', before: t(F(A.N) + '='), mode: 'math', keys: 'expo', vars: [] }, { name: '(ii)', label: '(ii)', before: t(frT(valB) + '='), mode: 'math', keys: 'expo', vars: [] }],
            [givenExpChk([A.N, 1], A.e, keyA), givenExpChk(valB, eB, keyB)], [keyA, keyB], t(F(A.N) + '=' + keyA) + ', ' + t(frT(valB) + '=' + keyB),
            '(i) The base ' + t('B') + ' must satisfy ' + t('B^{' + eT(A.e) + '}=' + A.N) + ', so ' + t('B=' + A.N + '^{' + eT(inv(A.e)) + '}') + ': ' + t(A.N + '=' + A.b + (A.e[0] > 1 ? '^{' + A.e[0] + '}' : '')) + ', so ' + t('B=' + A.b + '^{' + A.e[1] + '}=' + F(A.B)) + '. Check: ' + t(F(A.B) + '^{' + eT(A.e) + '}=\\left(' + rootT(A.e[1], F(A.B)) + '\\right)^{' + A.e[0] + '}=' + A.b + (A.e[0] > 1 ? '^{' + A.e[0] + '}' : '') + '=' + A.N) + '.<br>' +
              '(ii) The exponent ' + t(eT(eB)) + ' takes a ' + K.rootName(Bv.q) + ' root and a reciprocal, so start from ' + t(frT(inv(valB))) + ' and raise it to the power ' + t(Bv.q) + ': base ' + t(frT(baseB)) + '. Check: ' + t(keyB + '=' + frT(inv(baseB)) + '^{\\frac{1}{' + Bv.q + '}}=' + frT(valB)) + '.',
            ['To find the base, undo the exponent: raise the number to the <b>reciprocal</b> of the given exponent.', 'A negative exponent flips the base: the base of (ii) is the reciprocal of a power.'], 'power with given exponent: ' + A.N + ', ' + valB.join('/'));
          p.bad = [[String(A.N), keyB], [keyA, frT(valB)], [String(A.N) + '^{' + eT(A.e) + '}', keyB], [keyA, frT(inv(baseB)) + '^{' + eT(eB) + '}']];
          return p;
        } }] }
    ]
  });

  /* ===== Lesson 5 — Simplifying with Rational Exponents ===== */
  var IDX = 'The <b>denominator</b> of the exponent is the index of the root and the numerator is the power: ' + t('x^{\\frac{m}{n}}=\\sqrt[n]{x^{m}}') + '.';
  HW.defineExit({
    lesson: 'u2l5', calc: false, outcome: 'AN3',
    blurb: 'The exponent laws with rational exponents, and moving between powers and radicals.',
    questions: [
      { num: '1', outcome: 'AN3', stem: 'Simplify. Write the answer as a power with a positive exponent, and then in radical form.', parts: [
        { id: '1', outcome: 'AN3', level: 'BEG', make: function (r) {
          var x = r.pick(['x', 'a', 'y', 'm']), kind = r.pick(['times', 'pow']), tx, e, kn;
          if (kind === 'times') {
            var v = find(function () { var b = r.pick([3, 4, 5, 7]), a = r.int(1, 2 * b), n = r.int(1, 2); return { a: a, b: b, n: n }; }, function (v) { return gcd(v.a, v.b) === 1 && v.a !== v.b && v.a + v.n * v.b <= 18; }, { a: 6, b: 5, n: 1 });
            e = R(v.a + v.n * v.b, v.b); tx = pw(x, [v.a, v.b]) + '\\times ' + pw(x, v.n);
            kn = known([[pw(x, R(v.a + v.n, v.b)), 'u2x-one-num', 'To add ' + t(v.n) + ' to ' + t(eT([v.a, v.b])) + ', write it as ' + t('\\frac{' + v.n * v.b + '}{' + v.b + '}') + '.'], [pw(x, mul([v.a, v.b], v.n)), 'u2x-mult-exp', 'Multiplying powers with the same base: <b>add</b> the exponents.']], pw(x, e));
          } else {
            var w = find(function () { var a = r.int(1, 7), b = r.int(2, 7), c = r.int(2, 7); return { a: a, b: b, c: c }; }, function (w) { var f = R(w.a, w.c); return gcd(w.a, w.b) === 1 && w.b !== w.c && f[1] > 1 && w.a !== w.b && f[0] <= 11 && R(w.b, w.c)[1] > 1; }, { a: 4, b: 5, c: 3 });
            e = R(w.a, w.c); tx = '\\left(' + pw(x, [w.a, w.b]) + '\\right)^{' + eT([w.b, w.c]) + '}';
            kn = known([[pw(x, add([w.a, w.b], [w.b, w.c])), 'u2x-add-exp', 'A power of a power: <b>multiply</b> the exponents.']], pw(x, e));
          }
          var powT = pw(x, e), rT = rootT(e[1], pw(x, e[0]));
          var rk = known([[rootT(e[0], pw(x, e[1])), 'u2x-index-power', IDX]], rT);
          var p = P.fields('Simplify ' + t(tx) + '.',
            [{ name: 'Power', label: 'Power:', mode: 'math', keys: 'expo', vars: [x] }, { name: 'Radical form', label: 'Radical form:', mode: 'math', keys: 'expo', vars: [x] }],
            [EX(powT, { form: 'power', diag: kn }), EX(rT, { form: 'radical', diag: rk })], [powT, rT], 'Power: ' + t(powT) + '; radical form: ' + t(rT),
            (kind === 'times' ? 'Product law (add the exponents, with a common denominator): ' + t(tx + '=' + x + '^{' + eT([v.a, v.b]) + '+\\frac{' + v.n * v.b + '}{' + v.b + '}}=' + powT) : 'Power of a power (multiply the exponents): ' + t(tx + '=' + x + '^{' + eT([w.a, w.b]) + '\\times ' + eT([w.b, w.c]) + '}=' + powT)) + '.<br>Radical form — the denominator is the index: ' + t(powT + '=' + rT) + '.',
            ['Use the exponent law with the fractions exactly (common denominators to add).', IDX], 'rational exponent law ' + tx);
          p.bad = kn.texs.map(function (k0) { return [k0, rT]; }).concat(rk.texs.map(function (k0) { return [powT, k0]; }));
          return p;
        } }] },
      { num: '2', outcome: 'AN3', stem: 'Write the expression in the form ' + t('ax^{n}') + ', where ' + t('a\\in I') + ' and ' + t('n\\in Q') + '.', parts: [
        { id: '2', outcome: 'AN3', level: 'PRG', make: function (r) {
          var v = find(function () { var n1 = r.pick([2, 3, 4, 5]), n2 = r.pick([2, 3, 4, 5, 6]), m1 = r.int(1, 4), m2 = r.int(1, 5), k1 = r.int(2, 5), k2 = r.int(2, 6); return { n1: n1, n2: n2, m1: m1, m2: m2, k1: k1, k2: k2 }; },
            function (v) { var s = add([v.m1, v.n1], [v.m2, v.n2]); return v.n1 !== v.n2 && gcd(v.m1, v.n1) === 1 && gcd(v.m2, v.n2) === 1 && s[1] > 1 && v.m1 < 2 * v.n1 && v.m2 < 2 * v.n2; }, { n1: 4, n2: 3, m1: 1, m2: 1, k1: 2, k2: 3 });
          var s = add([v.m1, v.n1], [v.m2, v.n2]), tgt = (v.k1 * v.k2) + pw('x', s);
          var r1 = v.k1 + rootT(v.n1, pw('x', v.m1)), r2 = v.k2 + rootT(v.n2, pw('x', v.m2));
          var kn = known([[(v.k1 * v.k2) + pw('x', R(v.m1 + v.m2, v.n1 + v.n2)), 'u2x-add-den', 'To add ' + t(eT([v.m1, v.n1]) + '+' + eT([v.m2, v.n2])) + ', use a common denominator — don’t add the tops and the bottoms.'],
            [(v.k1 * v.k2) + pw('x', mul([v.m1, v.n1], [v.m2, v.n2])), 'u2x-mult-exp', 'Multiplying powers with the same base: <b>add</b> the exponents.'],
            [(v.k1 + v.k2) + pw('x', s), 'u2x-coef-added', 'The numbers in front are <b>multiplied</b>: ' + t(v.k1 + '\\times ' + v.k2) + '.'],
            [(v.k1 * v.k2) + pw('x', add([v.n1, v.m1], [v.n2, v.m2])), 'u2x-index-power', IDX]], tgt);
          return XP('Write ' + t(r1 + '\\times ' + r2) + ' in the form ' + t('ax^{n}') + '.', tgt, { form: 'power', vars: ['x'] },
            'Change each radical to a power: ' + t(r1 + '=' + v.k1 + pw('x', [v.m1, v.n1])) + ' and ' + t(r2 + '=' + v.k2 + pw('x', [v.m2, v.n2])) + '.<br>Multiply: ' + t((v.k1 * v.k2) + 'x^{' + eT([v.m1, v.n1]) + '+' + eT([v.m2, v.n2]) + '}=' + tgt) + ' (common denominator ' + t(s[1]) + ').',
            [IDX, 'Multiply the numbers in front; add the exponents with a common denominator.'], 'radicals to ax^n', kn);
        } }] },
      { num: '3', outcome: 'AN3', stem: 'Simplify. Write the answer with positive exponents.', parts: [
        { id: '3', outcome: 'AN3', level: 'ADV', make: function (r) {
          var v = find(function () {
            var B = r.pick([8, 27, 64, 125]), al = r.pick([[-6, 1], [-3, 1], [3, 1], [6, 1], [9, 1], [3, 2], [9, 2], [-3, 2]]), be = r.pick([[-6, 1], [-3, 1], [3, 1], [6, 1], [3, 2], [-9, 2]]), d = r.pick([2, 3, 4, 6, 8, 9, 12]), ga = r.pick([[1, 2], [1, 3], [2, 3], [3, 2], [-1, 2], [5, 3], [4, 3]]);
            return { B: B, al: al, be: be, d: d, ga: ga };
          }, function (v) { var ex1 = add(mul(v.al, [-2, 3]), v.ga); return ex1[0] !== 0 && !(v.al[0] === v.be[0] && v.al[1] === v.be[1]) && Math.abs(ex1[0]) <= 15; }, { B: 8, al: [-3, 1], be: [3, 2], d: 6, ga: [1, 2] });
          var A = M(v.B, [['x', v.al], ['y', v.be]]), first = mpow(A, [-2, 3]), T = mm(first, M(v.d, [['x', v.ga]])), tgt = ptex(T);
          var cb = Math.round(Math.cbrt(v.B));
          var given = '\\left(' + v.B + pw('x', v.al) + pw('y', v.be) + '\\right)^{-\\frac{2}{3}}\\cdot ' + v.d + pw('x', v.ga);
          var kn = known([[ptex(mm({ c: R(cb * cb), v: first.v }, M(v.d, [['x', v.ga]]))), 'u2x-no-flip', t(v.B + '^{-\\frac{2}{3}}=\\frac{1}{\\left(\\sqrt[3]{' + v.B + '}\\right)^{2}}=\\frac{1}{' + cb * cb + '}') + ' — the negative exponent makes it a reciprocal.'],
            [ptex(mm({ c: R(v.B), v: first.v }, M(v.d, [['x', v.ga]]))), 'u2x-coef-not-raised', 'The exponent ' + t('-\\frac{2}{3}') + ' applies to the ' + t(v.B) + ' too.'],
            [ptex(mm(M([1, cb * cb], [['x', add(v.al, [-2, 3])], ['y', add(v.be, [-2, 3])]]), M(v.d, [['x', v.ga]]))), 'u2x-add-exp', 'A power of a power: <b>multiply</b> each exponent inside by ' + t('-\\frac{2}{3}') + '.']], tgt);
          return XP('Simplify ' + t(given) + '.', tgt, { vars: ['x', 'y'] },
            'Apply ' + t('-\\frac{2}{3}') + ' to every factor: ' + t(v.B + '^{-\\frac{2}{3}}=\\frac{1}{(\\sqrt[3]{' + v.B + '})^{2}}=\\frac{1}{' + cb * cb + '}') + ', ' + t('x^{' + eT(v.al) + '\\cdot(-\\frac{2}{3})}=' + pw('x', mul(v.al, [-2, 3]))) + ', ' + t('y^{' + eT(v.be) + '\\cdot(-\\frac{2}{3})}=' + pw('y', mul(v.be, [-2, 3]))) + '.<br>' +
              'Multiply by ' + t(v.d + pw('x', v.ga)) + ': ' + t('\\frac{' + v.d + '}{' + cb * cb + '}') + ' and ' + t('x^{' + eT(mul(v.al, [-2, 3])) + '+' + (v.ga[0] < 0 ? '(' + eT(v.ga) + ')' : eT(v.ga)) + '}=' + pw('x', add(mul(v.al, [-2, 3]), v.ga))) + '.<br>Positive exponents: ' + t(fin(T)) + '.',
            ['Multiply every exponent inside the brackets by ' + t('-\\frac{2}{3}') + ', and evaluate ' + t(v.B + '^{-\\frac{2}{3}}') + ' (cube root, square, reciprocal).', 'Then use the product law on ' + t('x') + ' (common denominators) and move negative powers below the fraction bar.'], 'rational exponent simplification', kn);
        } }] }
    ]
  });

  /* ===== Lesson 6 — Exponents Unit Review ===== */
  HW.defineExit({
    lesson: 'u2l6', calc: false, outcome: 'AN3',
    blurb: 'A short mix of the unit: exponent laws, negative and rational exponents, radical form, and evaluating without a calculator.',
    questions: [
      { num: '1', outcome: 'AN3', stem: 'Simplify. Write the answer with positive exponents.', parts: [
        { id: '1', outcome: 'AN3', level: 'BEG', make: function (r) {
          var x = r.pick(['x', 'a', 'n', 'p']), c2 = r.int(2, 8), q = r.int(2, 6), c1 = c2 * q, a = r.int(2, 9), b = r.int(1, 6), tgt = q + pw(x, a + b);
          var kn = known([[q + pw(x, a - b === 0 ? 1 : a - b), 'u2x-sub-neg', 'Subtracting a negative exponent: ' + t(a + '-(-' + b + ')=' + a + '+' + b) + '.'], [(c1 - c2) + pw(x, a + b), 'u2x-coef-added', 'Divide the numbers in front: ' + t(c1 + '\\div ' + c2 + '=' + q) + '.']], tgt);
          return XP('Simplify ' + t('\\dfrac{' + c1 + pw(x, a) + '}{' + c2 + pw(x, -b) + '}') + '.', tgt, { vars: [x] },
            t('\\frac{' + c1 + '}{' + c2 + '}' + x + '^{' + a + '-(-' + b + ')}=' + tgt) + '.', ['Divide the numbers; subtract the exponents (top minus bottom) — careful with the negative.'], 'quotient with negative exponent', kn);
        } }] },
      { num: '2', outcome: 'AN3', stem: '', parts: [
        { id: '2', outcome: 'AN3', level: 'BEG', make: function (r) {
          var x = r.pick(['x', 'y', 'k', 'w']), e = find(function () { return R(r.int(1, 7), r.int(2, 6)); }, function (e) { return e[1] > 1 && e[0] !== 1; }, [2, 3]), T = rootT(e[1], pw(x, e[0]));
          var kn = known([[rootT(e[0], pw(x, e[1])), 'u2x-index-power', IDX]], T);
          return XP('Write ' + t(pw(x, e)) + ' in radical form.', T, { form: 'radical', vars: [x] }, t(pw(x, e) + '=' + T) + ': the denominator ' + t(e[1]) + ' is the index, the numerator ' + t(e[0]) + ' is the power.', [IDX], 'radical form ' + x + '^' + e.join('/'), kn);
        } }] },
      { num: '3', outcome: 'AN3', stem: '<b>Without a calculator</b>, find the exact value. (A fraction or a terminating decimal is fine.)', parts: [
        { id: '3', outcome: 'AN3', level: 'PRG', make: function (r) {
          var v = find(function () { var p = r.pick([4, 9, 16, 25, 36]), e1 = r.pick([[3, 2], [3, 2], [5, 2]]), q = r.pick([8, 27, 64, 125, -8, -27, -64, -125]), e2 = r.pick([[-2, 3], [-2, 3], [-1, 3]]); return { p: p, e1: e1, q: q, e2: e2 }; }, function (v) { return Math.pow(v.p, v.e1[0] / v.e1[1]) <= 250; }, { p: 9, e1: [3, 2], q: -64, e2: [-2, 3] });
          var sp = Math.round(Math.sqrt(v.p)), A = Math.pow(sp, v.e1[0]), cq = Math.round(Math.cbrt(v.q)), Bv = rpow(R(cq), v.e2[0]), ans = add(R(A), neg(Bv));
          var tx = v.p + '^{' + eT(v.e1) + '}-(' + v.q + ')^{' + eT(v.e2) + '}', tx0 = 'p^{' + eT(v.e1) + '}-q^{' + eT(v.e2) + '}';
          var kn = known([[frT(add(R(A), neg(rpow(R(cq), -v.e2[0])))), 'u2x-no-flip', t('q^{' + eT(v.e2) + '}') + ' has a negative exponent, so it is a reciprocal: ' + t('(' + v.q + ')^{' + eT(v.e2) + '}=\\frac{1}{(' + cq + ')^{' + (-v.e2[0]) + '}}') + '.'],
            [frT(add(R(A), Bv)), 'u2x-sign-final', 'Check the subtraction: ' + t('(' + v.q + ')^{' + eT(v.e2) + '}=' + frT(Bv)) + ', and you subtract it.'],
            [frT(add(R(v.p * v.e1[0] / v.e1[1]), neg(Bv))), 'u2x-coef-times-exp', t(v.p + '^{' + eT(v.e1) + '}') + ' means ' + t('\\left(\\sqrt{' + v.p + '}\\right)^{' + v.e1[0] + '}') + ', not ' + t(v.p + '\\times ' + eT(v.e1)) + '.'],
            [frT(add(R(Math.pow(v.p, v.e1[0]) / sp), neg(Bv)).map(Math.round)), 'u2x-eval-part', 'Check ' + t(v.p + '^{' + eT(v.e1) + '}=\\left(\\sqrt{' + v.p + '}\\right)^{' + v.e1[0] + '}=' + sp + '^{' + v.e1[0] + '}=' + A) + '.']], frT(ans));
          var p = P.math('If ' + t('p=' + v.p) + ' and ' + t('q=' + v.q) + ', what is the exact value of ' + t(tx0) + '?', exactChk(ans, kn, { dec: true }), frT(ans),
            t(v.p + '^{' + eT(v.e1) + '}=\\left(\\sqrt{' + v.p + '}\\right)^{' + v.e1[0] + '}=' + sp + '^{' + v.e1[0] + '}=' + A) + '.<br>' + t('(' + v.q + ')^{' + eT(v.e2) + '}=\\frac{1}{\\left(\\sqrt[3]{' + v.q + '}\\right)^{' + (-v.e2[0]) + '}}=\\frac{1}{(' + cq + ')^{' + (-v.e2[0]) + '}}=' + frT(Bv)) + '.<br>' + t(A + '-\\left(' + frT(Bv) + '\\right)=' + frT(ans)) + '.',
            ['Denominator of the exponent: the root; numerator: the power; negative: the reciprocal.', 'The cube root of a negative number is negative.'], 'evaluate ' + tx, { keys: 'fraction' });
          p.bad = kn.texs.slice();
          return p;
        } }] },
      { num: '4', outcome: 'AN3', stem: 'Simplify. Write the answer with positive exponents.', parts: [
        { id: '4', outcome: 'AN3', level: 'ADV', make: function (r) {
          var v = find(function () { return { k: r.int(2, 6), u: r.int(1, 4), w: r.int(1, 5), vv: r.int(1, 3), L: r.pick([['a', 'b'], ['x', 'y'], ['m', 'n']]) }; }, function (v) { return v.w !== v.u; }, { k: 6, u: 2, w: 3, vv: 2, L: ['a', 'b'] });
          var a = v.L[0], b = v.L[1], k3 = Math.pow(v.k, 3), A = M(k3, [[a, 3 * v.u], [b, -3 * v.vv]]), first = mpow(A, [-1, 3]), second = M(1, [[a, v.w]]), T = mm(first, second), tgt = ptex(T);
          var given = '\\left(' + k3 + pw(a, 3 * v.u) + pw(b, -3 * v.vv) + '\\right)^{-\\frac{1}{3}}\\cdot\\left(' + pw(a, [1, 2]) + '\\right)^{' + 2 * v.w + '}';
          var kn = known([[ptex(mm({ c: R(v.k), v: first.v }, second)), 'u2x-no-flip', t(k3 + '^{-\\frac{1}{3}}=\\frac{1}{\\sqrt[3]{' + k3 + '}}=\\frac{1}{' + v.k + '}') + ' — a negative exponent means reciprocal.'],
            [ptex(mm({ c: R(-k3, 3), v: first.v }, second)), 'u2x-coef-times-exp', t(k3 + '^{-\\frac{1}{3}}') + ' is a cube root and a reciprocal, not ' + t(k3 + '\\times\\left(-\\frac{1}{3}\\right)') + '.'],
            [ptex(mm(first, M(1, [[a, add([1, 2], 2 * v.w)]]))), 'u2x-add-exp', t('\\left(' + pw(a, [1, 2]) + '\\right)^{' + 2 * v.w + '}') + ' is a power of a power: multiply, ' + t('\\frac{1}{2}\\times ' + 2 * v.w + '=' + v.w) + '.'],
            [ptex(mm(M([1, v.k], [[a, v.u], [b, -v.vv]]), second)), 'u2x-sign-final', 'Multiply each exponent by ' + t('-\\frac{1}{3}') + ': the signs of the exponents change too.']], tgt);
          return XP('Simplify ' + t(given) + '.', tgt, { vars: [a, b] },
            'Power of a product with ' + t('-\\frac{1}{3}') + ': ' + t(k3 + '^{-\\frac{1}{3}}=\\frac{1}{' + v.k + '}') + ', ' + t(a + '^{' + 3 * v.u + '\\cdot(-\\frac{1}{3})}=' + pw(a, -v.u)) + ', ' + t(b + '^{-' + 3 * v.vv + '\\cdot(-\\frac{1}{3})}=' + pw(b, v.vv)) + '.<br>' +
              'Power of a power: ' + t('\\left(' + pw(a, [1, 2]) + '\\right)^{' + 2 * v.w + '}=' + pw(a, v.w)) + '.<br>Product law: ' + t('\\frac{1}{' + v.k + '}' + a + '^{-' + v.u + '+' + v.w + '}' + pw(b, v.vv) + '=' + tgt) + '.',
            ['Apply the outside exponent to every factor: the number (cube root, then reciprocal) and each letter (multiply exponents).', 'Then combine the powers of ' + t(a) + ' with the product law and write positive exponents.'], 'review: rational and negative exponents', kn);
        } }] }
    ]
  });
})(window);
