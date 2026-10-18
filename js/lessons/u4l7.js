/* Math 10C · Unit 4 · Lesson 7 — Extension: Solving Polynomial Equations by Factoring (AN5; Math 20-1 preview)
 * Assignment questions 1–10 (u4_L07.tex) and the whole Lesson 7 Extra Practice (u4_EP07.tex, Parts A–H, Q1–21).
 * Every part is a generator built from its ROOTS (or from the factors of the final equation), so the key is always
 * right: the equation shown is the expanded / rearranged product, in the booklet's layout (terms on both sides, odd
 * term orders, a constant factor, a negative leading term …). The booklet's numbers are among the possible values.
 * Solutions are typed as a list ("x = 5, x = -8", "±13") and graded with K.valueSet (js/relfn.js); a local diagnosis
 * adds: lost x = 0 (divided by x), one sign wrong, ax + b = 0 solved upside down, rounded decimals (a form nudge),
 * "set each factor equal to the right side", a constant factor treated as a solution, only the positive square root,
 * and each question's classic errors. Word problems ask for the valid answer with K.P.number and diagnose the
 * rejected root. "Explain" questions are multiple choice with a hint for each wrong option.
 * Levels: Lesson 7 is enrichment — "solve an already-factored equation" is BEG, solving after factoring a trinomial
 * EMG (monic) / PRG (decomposition, rearranging first), modelling problems ADV, the perfect-square k question MAS. */
(function (root) {
  'use strict';
  var HW = root.HW, F = HW.fmt, K = HW.kit, ex = HW.ex, B = K.P, P = HW.poly, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form;

  HW.addCodes({
    'lost-zero': 'Lost the solution 0 (divided by the variable)', 'sol-sign-one': 'One solution has the wrong sign', 'sol-flip': 'Solved ax + b = 0 upside down',
    'not-zero': 'Set each factor equal to a right side that isn’t 0', 'const-zero': 'Treated a constant factor as giving a solution', 'no-divide': 'Didn’t divide by the coefficient of x',
    'no-root': 'Forgot to take the square root', 'half-root': 'Square-rooted only part of the fraction', 'one-root-dos': 'Only one root of a difference of squares',
    'neg-lead': 'Sign slip when multiplying through by −1', 'move-sign': 'Moved a term across without changing its sign', divided: 'Divided by a bracket and lost a root',
    'pos-root-only': 'Took only the positive square root', 'neg-root': 'Kept a root that must be rejected', 'corner-missing': 'Left out the corner square',
    'corner-twice': 'Counted the corner square twice', 'bounding-box': 'Used the bounding rectangle', formula: 'Substituted into the formula incorrectly',
    'gave-base': 'Gave the base instead of the height', half: 'Left out the ½ of the triangle area formula', 'half-wrong': 'Halved instead of doubling to clear the ½',
    'height-minus': 'Wrote the height as base minus the difference', 'gave-a': 'Gave the other solution', rhs: 'Gave the right side instead of the left side’s value',
    'given-x': 'Gave a different quantity than the one asked', 'one-end-border': 'Added the border at one end only', pm: 'Gave ± for a repeated root',
    repeated: 'Counted a repeated solution twice', 'no-double': 'Middle term not doubled', 'pm-k': 'Found only one value of k', 'no-square': 'Didn’t square half the middle coefficient',
    'full-square': 'Squared the whole middle coefficient', 'wrong-side': 'Used the longer side as the limit', letter: 'Used a different letter', 'eq-zero': 'Typed a whole equation',
    'sign-k': 'Wrong sign in the model equation', 'sum-sq': 'Squared the sum instead of adding squares'
  });

  /* ---------- small helpers ---------- */
  function gen(f) { for (var i = 0; i < 5000; i++) { var v = f(); if (v) return v; } throw new Error('u4l7: generator failed'); }
  function gcd(a, b) { return ex.gcd(Math.abs(a), Math.abs(b)); }
  function cop(a, b) { return gcd(a, b) === 1; }
  function lin(a, b, v) { var o = {}; o[v || 'x'] = 1; return P.add(P.mono(a, o), P.num(b)); }
  function mono(c, v, e) { var o = {}; o[v || 'x'] = e == null ? 1 : e; return P.mono(c, o); }
  function tx(p) { return P.tex(p); }
  function rq(r) { return Array.isArray(r) ? ex.norm(r[0], r[1]) : [r, 1]; }
  function rv(r) { r = rq(r); return r[0] / r[1]; }
  function rt(r) { return ex.texRat(rq(r)); }
  function N(n) { return F(n); }
  function sg(n) { return n < 0 ? '(' + N(n) + ')' : N(n); }
  function steps(lines) { return lines.map(function (l) { return /^</.test(l) ? l : t(l); }).join('<br>'); }
  var IMP = '\\ \\Rightarrow\\ ';
  /* linear factor a·v + b (a > 0) */
  function L(a, b) { return { a: a, b: b }; }
  function fp(f, v) { return lin(f.a, f.b, v); }
  function ft(f, v) { return tx(fp(f, v)); }
  function bk(f, v) { return f.b === 0 ? ft(f, v) : '(' + ft(f, v) + ')'; }
  function froot(f) { return ex.norm(-f.b, f.a); }
  function prod(fs, v, g) { var p = P.num(g == null ? 1 : g); fs.forEach(function (f) { p = P.mul(p, fp(f, v)); }); return p; }
  function prodTex(fs, v, gTex) { return (gTex || '') + fs.map(function (f) { return bk(f, v); }).join(''); }
  function monoT(a, v) { return (a === 1 ? '' : a === -1 ? '-' : String(a)) + v; }
  function ans(v, roots) { return roots.map(function (r) { return v + '=' + rt(r); }).join(',\\ '); }
  /* "set each factor equal to 0" lines */
  function zl(fs, v) {
    v = v || 'x';
    return fs.map(function (f) {
      if (f.b === 0) return f.a === 1 ? v + '=0' : monoT(f.a, v) + '=0' + IMP + v + '=0';
      if (f.a === 1) return ft(f, v) + '=0' + IMP + v + '=' + N(-f.b);
      return ft(f, v) + '=0' + IMP + monoT(f.a, v) + '=' + N(-f.b) + IMP + v + '=' + rt(froot(f));
    });
  }
  /* factoring a trinomial that equals (f1)(f2): inspection when monic, otherwise decomposition and grouping */
  function trin(f1, f2, v) {
    v = v || 'x';
    var A = f1.a * f2.a, Bm = f1.a * f2.b + f2.a * f1.b, C = f1.b * f2.b;
    if (A === 1) return ['\\text{Product } ' + N(C) + ',\\ \\text{sum } ' + N(Bm) + ':\\ \\ ' + N(f1.b) + '\\text{ and }' + N(f2.b), bk(f1, v) + bk(f2, v) + '=0'];
    var m = f1.a * f2.b, n = f2.a * f1.b;
    return ['ac=' + A + '(' + N(C) + ')=' + N(A * C) + ';\\ \\text{sum } ' + N(Bm) + ':\\ \\ ' + N(m) + '\\text{ and }' + N(n),
      P.seq([mono(A, v, 2), mono(m, v), mono(n, v), P.num(C)]) + '=0',
      monoT(f1.a, v) + bk(f2, v) + (f1.b < 0 ? '-' : '+') + Math.abs(f1.b) + bk(f2, v) + '=0',
      bk(f2, v) + bk(f1, v) + '=0'];
  }
  function polyEq(p, rhs) { return tx(p) + '=' + (rhs == null ? '0' : typeof rhs === 'string' ? rhs : tx(rhs)); }

  /* ---------- the "solve" part: K.P.valueSet + local diagnoses ---------- */
  function close(a, b) { return Math.abs(a - b) < 1e-9; }
  function uniqV(a) { var o = []; a.forEach(function (x) { if (!o.some(function (y) { return close(x, y); })) o.push(x); }); return o; }
  function sameSet(A, V) { V = uniqV(V); return A.length === V.length && A.every(function (x) { return V.some(function (y) { return close(x, y); }); }); }
  function exFactor(fs, kind) { // an example factor for a hint
    var f = (fs || []).filter(function (g) { return g.b !== 0 && (kind !== 'coef' || g.a !== 1); })[0];
    return f || (kind === 'coef' ? L(2, -3) : L(1, 8));
  }
  function solvePart(prompt, roots, o) {
    o = o || {};
    var v = o.v || 'x', T = roots.map(rq), TV = uniqV(T.map(rv)), keyTex = o.keyTex || ans(v, T);
    var wr = (o.wrong || []).filter(function (w) { return w && !sameSet(uniqV(w[0].map(rv)), TV); }).map(function (w) { return { vals: uniqV(w[0].map(rv)), raw: w[0], code: w[1], hint: w[2] }; });
    var fs = o.fs, fS = exFactor(fs), fC = exFactor(fs, 'coef');
    var signHint = 'Check the sign of each solution. If ' + t(ft(fS, v) + '=0') + ', then ' + t(v + '=' + rt(froot(fS))) + ': solve each small equation carefully.';
    var flipHint = 'Check how you solved the equations with a coefficient: ' + t(ft(fC, v) + '=0') + ' gives ' + t(monoT(fC.a, v) + '=' + N(-fC.b)) + ', so ' + t(v + '=' + rt(froot(fC))) + ' (divide by the coefficient ' + t(fC.a) + ').';
    var diag = function (A) {
      for (var i = 0; i < wr.length; i++) if (sameSet(A, wr[i].vals)) return { code: wr[i].code, hint: wr[i].hint };
      var inT = function (x) { return TV.some(function (y) { return close(x, y); }); };
      if (TV.some(function (y) { return close(y, 0); }) && A.length && !A.some(function (x) { return close(x, 0); }) && A.every(inT))
        return { code: 'lost-zero', hint: 'You have lost ' + t(v + '=0') + '. A factor like ' + t(v) + ' (or ' + t('3' + v) + ' or ' + t(v + '^{2}') + ') is a factor too, and it equals 0 when ' + t(v + '=0') + '. Never divide both sides by ' + t(v) + ' — factor it out.' };
      if (A.length === TV.length) {
        var exact = A.filter(inT).length;
        if (exact >= 1 && exact < A.length && A.every(function (x) { return inT(x) || inT(-x); })) return { code: 'sol-sign-one', hint: signHint };
        if (!exact && A.every(function (x) { return inT(-x); })) return { code: 'sol-sign', hint: 'Every sign is the opposite of what it should be. If ' + t(ft(fS, v) + '=0') + ', then ' + t(v + '=' + rt(froot(fS))) + ': a solution has the opposite sign to the number in its bracket.' };
        var recip = function (x) { return TV.some(function (y) { return !close(y, 0) && (close(x, 1 / y) || close(x, -1 / y)); }); };
        if (A.some(function (x) { return !inT(x) && !inT(-x) && recip(x); }) && A.every(function (x) { return inT(x) || inT(-x) || recip(x); })) return { code: 'sol-flip', hint: flipHint };
        var used = [], near = A.every(function (x) { for (var j = 0; j < TV.length; j++) if (used.indexOf(j) < 0 && Math.abs(x - TV[j]) < 0.006) { used.push(j); return true; } return false; });
        if (near && exact < A.length) return { code: 'u-rounded', hint: '' };
      }
      return null;
    };
    var part = B.valueSet(prompt, T, { v: v, diag: diag, keyTex: keyTex }, o.sol, o.hints, o.text);
    var base = part.check;
    part.check = function (resp) {
      if (/\\times|\\cdot|\*|×/.test(String(resp || ''))) return form('simplify', 'Work each solution out to a single number (no ' + t('\\times') + ').');
      var r = base(resp);
      if (r.v === 'wrong' && r.code === 'u-rounded') return form('decimal-rounded', 'Those look like rounded decimals. Give <b>exact</b> solutions: write a value like ' + t('\\frac{4}{3}') + ' as a fraction, not ' + t('1.33') + '.');
      return r;
    };
    var str = function (vals) { return vals.map(function (x) { return v + '=' + rt(x); }).join(', '); };
    var bad = wr.map(function (w) { return str(w.raw.map(rq)); });
    var flipped = T.map(function (r) { return [-r[0], r[1]]; });
    if (!sameSet(uniqV(flipped.map(rv)), TV)) bad.push(str(flipped));
    if (TV.length > 1) bad.push(str([T[0]]));
    part.bad = bad.filter(function (b, i) { return bad.indexOf(b) === i; });
    var good = [T.slice().reverse().map(function (r) { return v + '=' + rt(r); }).join('\\text{ or }'), T.map(function (r) { return rt(r); }).join(', ')];
    if (TV.length === 2 && close(TV[0], -TV[1])) { var pos = T[0][0] > 0 ? T[0] : T[1]; good.push(v + '=\\pm ' + rt(pos)); }
    part.good = good.concat(o.good || []);
    return part;
  }

  /* ---------- number answers with diagnoses (word problems: the rejected root) ---------- */
  function diagFn(ans0, diags) {
    var ds = (diags || []).filter(function (d) { return d && isFinite(d[0]) && Math.abs(d[0] - ans0) > 1e-9; });
    var seen = [];
    ds = ds.filter(function (d) { if (seen.some(function (s) { return close(s, d[0]); })) return false; seen.push(d[0]); return true; });
    var f = function (x) { for (var i = 0; i < ds.length; i++) if (Math.abs(x - ds[i][0]) < 1e-9) return { code: ds[i][1], hint: ds[i][2] }; return null; };
    f.list = ds; return f;
  }
  function numPart(prompt, a, diags, sol, hints, text, unit) {
    var d = diagFn(a, diags);
    var p = B.number(prompt, a, d, sol, hints, text, unit ? { after: t('\\text{' + unit + '}') } : null);
    if (unit) p.answer = t(N(a) + '\\text{ ' + unit + '}');
    p.bad = d.list.map(function (x) { return String(x[0]); });
    return p;
  }
  function nrPart(prompt, a, diags, sol, hints, text) {
    var d = diagFn(a, diags);
    var p = B.nr(prompt, a, d, sol, hints, text);
    p.bad = d.list.filter(function (x) { return x[0] >= 0 && String(x[0]).length <= 4; }).map(function (x) { return String(x[0]); });
    return p;
  }
  function numF(label, unit) { return { name: label.replace(/\\\(|\\\)/g, ''), label: label, after: unit ? t('\\text{' + unit + '}') : undefined }; }
  function mcPart(r, prompt, opts, sol, hints, text, keepOrder) { return B.mc(r, prompt, opts, sol, hints, text, keepOrder); }

  /* ---------- "write the equation in the form … = 0": any nonzero multiple of the target is accepted ---------- */
  function multipleOf(S, T, v) {
    var a = P.lead(S, v), b = P.lead(T, v); if (!a[0] || !b[0]) return false;
    return P.eq(S, P.scale(T, ex.norm(a[0] * b[1], a[1] * b[0])));
  }
  function eqZeroPart(prompt, T, v, wr, sol, hints, text) {
    var ws = (wr || []).filter(function (w) { return w && w.is && !multipleOf(w.is, T, v); });
    var check = function (resp) {
      var s = String(resp == null ? '' : resp).trim();
      if (!s) return form('empty', 'Type your answer first.');
      if (/=/.test(s)) { var m = /^(.*)=\s*0\s*$/.exec(s); if (m && m[1].trim()) s = m[1]; else return form('eq-zero', 'Collect every term on the left side so the right side is ' + t('0') + ', e.g. ' + t(v + '^{2}+\\ldots=0') + '.'); }
      var a = K.read(s); if (a.res) return a.res;
      var rr = P.read(a.ast); if (!rr.ok) return wrong('not-poly', 'That isn’t a polynomial in ' + t(v) + '. Check your work.');
      var S = rr.p;
      if (P.vars(S).some(function (x) { return x !== v; })) return form('letter', 'Use ' + t(v) + ' for the unknown, as the question says.');
      if (multipleOf(S, T, v)) { var fi = P.formIssue(a.ast); if (fi && fi.code !== 'not-poly') return form(fi.code, fi.msg || 'Right — now expand and simplify it fully.'); return ok(); }
      for (var i = 0; i < ws.length; i++) if (multipleOf(S, ws[i].is, v)) return wrong(ws[i].code, ws[i].hint);
      return wrong('value', null);
    };
    var part = B.math(prompt, check, tx(T) + '=0', sol, hints, text, { keys: 'poly', vars: [v] });
    part.answer = t(tx(T) + '=0');
    part.bad = ws.map(function (w) { return tx(w.is); });
    part.good = [tx(P.neg(T)), tx(T)];
    return part;
  }

  /* ---------- figure: the L-shaped piece of wood (Q5) ---------- */
  var INK = '#1c2230', SH2 = '#e9ecf0', GR = '#8a93a3';
  function figWood(p, q) {
    var s = 12, T = 30, ox = 34, oy = 26, ps = p * s, qs = q * s, W = ox + T + qs + 34, H = oy + ps + T + 18;
    var pts = [[ox, oy], [ox + T, oy], [ox + T, oy + ps], [ox + T + qs, oy + ps], [ox + T + qs, oy + ps + T], [ox, oy + ps + T]];
    var txt = function (x, y, s0, o) { o = o || {}; return '<text x="' + x + '" y="' + y + '" text-anchor="' + (o.a || 'middle') + '"' + (o.it ? ' font-style="italic"' : '') + '>' + s0 + '</text>'; };
    var dot = function (x, y) { return '<circle cx="' + x + '" cy="' + y + '" r="2.6" fill="' + INK + '"/>'; };
    var g = '<polygon points="' + pts.map(function (z) { return z.join(','); }).join(' ') + '" fill="' + SH2 + '" stroke="' + INK + '" stroke-width="2"/>';
    g += dot(ox + T, oy) + dot(ox + T, oy + ps) + dot(ox + T + qs, oy + ps);
    g += txt(ox + T + 6, oy - 4, 'R', { a: 'start' }) + txt(ox + T + 7, oy + ps - 6, 'S', { a: 'start' }) + txt(ox + T + qs + 2, oy + ps - 7, 'T', { a: 'end' });
    g += txt(ox + T / 2, oy - 8, 'x', { it: true }) + txt(ox + T + qs + 14, oy + ps + T / 2 + 5, 'x', { it: true });
    g += txt(ox + T + 9, oy + ps / 2 + 5, p + ' cm', { a: 'start' }) + txt(ox + T + qs / 2, oy + ps - 8, q + ' cm');
    return '<svg class="fig-svg" viewBox="0 0 ' + W + ' ' + H + '" width="100%" style="max-width:' + Math.min(360, W) + 'px" role="img" aria-label="L-shaped piece of wood" font-family="KaTeX_Main, \'Times New Roman\', Times, serif" font-size="15" fill="' + INK + '">' + g + '</svg>';
  }

  /* ---------- reusable generators ---------- */
  /* (ax − b) with a ≥ 2, b coprime to a, so the root b/a is a fraction */
  function fracPair(r, as, bmax) { return gen(function () { var a = r.pick(as), b = r.int(1, bmax); return cop(a, b) && b % a !== 0 ? { a: a, b: b } : null; }); }
  /* (ax ± b)² = c²: steps after expanding (common factor, then factoring) */
  function squareSteps(a, b, c, v) {
    v = v || 'x';
    var lhs = P.pow(lin(a, -b, v), 2), Z = P.sub(lhs, P.num(c * c)), g = gcd(gcd(a * a, 2 * a * b), b * b - c * c);
    var r1 = ex.norm(b + c, a), r2 = ex.norm(b - c, a), f1 = L(r1[1], -r1[0]), f2 = L(r2[1], -r2[0]);
    var lines = ['\\text{Expand: }' + tx(lhs) + '=' + c * c, tx(Z) + '=0'];
    if (g > 1) lines.push('\\text{Divide by the common factor } ' + g + ':\\ ' + tx(P.scale(Z, [1, g])) + '=0');
    return { lines: lines.concat(trin(f1, f2, v)).concat(zl([f2, f1], v)), roots: [r1, r2], f: [f1, f2] };
  }
  var H_ZPL = ['The right side is already 0, so set <b>each</b> factor equal to 0 and solve each small equation.'];
  var H_TRI = ['Factor the left side first: find two numbers with the right product and sum (use decomposition when the leading coefficient isn’t 1).', 'Then set each bracket equal to 0.'];
  var H_RE = ['Step i) is not optional: move every term to one side so the other side is exactly 0.', 'Then factor completely and set each factor equal to 0.'];
  var notZeroHint = 'The Zero Product Law only works when the product equals <b>0</b>. Expand, move everything to one side, and factor again before setting factors equal to anything.';

  HW.defineLesson({
    id: 'u4l7', unit: 4, num: '7', title: 'Extension: Solving Polynomial Equations by Factoring', outcome: 'AN5',
    blurb: 'Math 20-1 preview: the Zero Product Law — rearrange so one side is 0, factor, set each factor to 0 — then area, number and geometry problems where a root must be rejected.',
    questions: [
      /* ================= Q1: the Zero Product Law ================= */
      { num: '1', section: 'Part A — The Zero Product Law', stem: 'Solve the equation.', parts: [
        { id: '1a', level: 'BEG', make: function (r) {
          var s = gen(function () { var p = r.int(2, 9), q = r.int(2, 12); return p !== q ? { p: p, q: q } : null; });
          var fs = [L(1, -s.p), L(1, s.q)];
          return solvePart(t(prodTex(fs) + '=0'), [s.p, -s.q], { fs: fs, hints: H_ZPL, text: 'solve (x-p)(x+q)=0',
            sol: steps(['<span>Already factored, and the right side is ' + t('0') + '.</span>'].concat(zl(fs))) + '<br>So ' + t(ans('x', [s.p, -s.q])) + '.' });
        } },
        { id: '1b', level: 'EMG', make: function (r) {
          var u = fracPair(r, [2, 3, 4, 5], 9), w = fracPair(r, [2, 3, 4, 5], 9);
          var fs = [L(u.a, -u.b), L(w.a, w.b)], roots = [froot(fs[0]), froot(fs[1])];
          return solvePart(t(prodTex(fs) + '=0'), roots, { fs: fs, hints: H_ZPL.concat(['Solve ' + t(ft(fs[0]) + '=0') + ' by adding ' + t(u.b) + ' and then dividing by ' + t(u.a) + '.']), text: 'solve (ax-b)(cx+d)=0',
            wrong: [[[u.b, -w.b], 'no-divide', 'You still need to divide by the coefficient of ' + t('x') + ': ' + t(monoT(u.a, 'x') + '=' + u.b) + ' gives ' + t('x=' + rt([u.b, u.a])) + '.']],
            sol: steps(zl(fs)) + '<br>So ' + t(ans('x', roots)) + '.' });
        } },
        { id: '1c', level: 'BEG', make: function (r) {
          var k = r.int(2, 9), n = r.int(3, 15);
          return solvePart(t(k + 'x(' + n + '-x)=0'), [0, n], { fs: [L(1, -n)], hints: H_ZPL, text: 'solve kx(n-x)=0',
            wrong: [[[k, n], 'const-zero', t(k + 'x=0') + ' means ' + t('x=0') + ' (divide 0 by ' + k + '), not ' + t('x=' + k) + '.']],
            sol: steps([k + 'x=0' + IMP + 'x=0', n + '-x=0' + IMP + 'x=' + n]) + '<br>So ' + t(ans('x', [0, n])) + '.' });
        } },
        { id: '1d', level: 'BEG', make: function (r) {
          var n = r.int(2, 15), fs = [L(1, 0), L(1, n)];
          return solvePart(t('x^{2}+' + n + 'x=0'), [0, -n], { fs: fs, hints: ['Take out the common factor ' + t('x') + ' first.', 'Then set each factor equal to 0 — the factor ' + t('x') + ' gives a solution too.'], text: 'solve x^2+nx=0',
            sol: steps(['\\text{Common factor } x:\\ ' + prodTex(fs) + '=0'].concat(zl(fs))) + '<br>So ' + t(ans('x', [0, -n])) + '.' });
        } },
        { id: '1e', level: 'BEG', make: function (r) {
          var n = r.int(4, 15), fs = [L(1, -n), L(1, n)];
          return solvePart(t('x^{2}-' + n * n + '=0'), [n, -n], { fs: fs, hints: ['The left side is a difference of squares: ' + t('a^{2}-b^{2}=(a-b)(a+b)') + '.', 'Each of the two factors gives a solution.'], text: 'solve x^2-n^2=0',
            wrong: [[[n * n, -n * n], 'no-root', 'Those are the squares. The solutions are the numbers that <b>square</b> to ' + t(n * n) + '.'], [[n * n], 'no-root', 'The solutions are the numbers that <b>square</b> to ' + t(n * n) + ' — and there are two of them.']],
            sol: steps(['\\text{Difference of squares: }' + prodTex(fs) + '=0'].concat(zl(fs))) + '<br>So ' + t('x=\\pm ' + n) + '.' });
        } },
        { id: '1f', level: 'EMG', make: function (r) {
          var s = fracPair(r, [2, 3, 4, 5, 6, 7], 13), a = s.a, b = s.b, fs = [L(a, -b), L(a, b)], R0 = [b, a];
          return solvePart(t(a * a + 'x^{2}-' + b * b + '=0'), [R0, [-b, a]], { fs: fs, hints: ['Write both terms as squares: ' + t(a * a + 'x^{2}=(' + a + 'x)^{2}') + ' and ' + t(b * b + '=' + b + '^{2}') + '.', 'Factor as a difference of squares, then set each factor equal to 0.'], text: 'solve a^2x^2-b^2=0',
            wrong: [[[[b * b, a * a], [-b * b, a * a]], 'no-root', 'You found ' + t('x^{2}=' + rt([b * b, a * a])) + ' — now take the square root (of the top <b>and</b> the bottom).'], [[[b, a * a], [-b, a * a]], 'half-root', 'Take the square root of the denominator too: ' + t('\\sqrt{' + a * a + '}=' + a) + '.'], [[[b * b, a], [-b * b, a]], 'half-root', 'Check the factors: ' + t(a * a + 'x^{2}-' + b * b + '=(' + a + 'x-' + b + ')(' + a + 'x+' + b + ')') + '.']],
            sol: steps(['\\text{Difference of squares: }' + prodTex(fs) + '=0'].concat(zl(fs))) + '<br>So ' + t('x=\\pm' + rt(R0)) + '.' });
        } },
        { id: '1g', level: 'EMG', make: function (r) {
          var s = fracPair(r, [2, 3, 4, 5, 6, 7, 8, 9], 12), a = s.a, b = s.b, fs = [L(a, -b), L(a, b)], R0 = [b, a];
          return solvePart(t(a * a + 'x^{2}=' + b * b), [R0, [-b, a]], { fs: fs, hints: H_RE.slice(0, 1).concat(['Then factor ' + t(a * a + 'x^{2}-' + b * b) + ' as a difference of squares.']), text: 'solve a^2x^2=b^2',
            wrong: [[[[b * b, a * a], [-b * b, a * a]], 'no-root', 'You found ' + t('x^{2}=' + rt([b * b, a * a])) + ' — now take the square root (of the top <b>and</b> the bottom).'], [[[b, a * a], [-b, a * a]], 'half-root', 'Take the square root of the denominator too: ' + t('\\sqrt{' + a * a + '}=' + a) + '.']],
            sol: steps(['\\text{Rearrange: }' + a * a + 'x^{2}-' + b * b + '=0', prodTex(fs) + '=0'].concat(zl(fs))) + '<br>So ' + t('x=\\pm' + rt(R0)) + '.' });
        } },
        { id: '1h', level: 'EMG', make: function (r) {
          var s = gen(function () { var g = r.int(2, 4), q = r.int(2, 5), p = r.int(1, 11); return cop(p, q) && p % q !== 0 && g * p <= 40 ? { g: g, q: q, p: p } : null; });
          var b = s.g * s.p, a = s.g * s.q, R0 = [s.p, s.q];
          return solvePart(t(P.seq([mono(b), mono(-a, 'x', 2)]) + '=0'), [0, R0], { fs: [L(s.q, -s.p)], hints: ['Both terms share the factor ' + t(s.g + 'x') + ': take it out.', 'Then set each factor equal to 0.'], text: 'solve bx-ax^2=0',
            sol: steps(['\\text{Common factor } ' + s.g + 'x:\\ ' + s.g + 'x(' + s.p + '-' + monoT(s.q, 'x') + ')=0', s.g + 'x=0' + IMP + 'x=0', s.p + '-' + monoT(s.q, 'x') + '=0' + IMP + 'x=' + rt(R0)]) + '<br>So ' + t(ans('x', [0, R0])) + '.' });
        } },
        { id: '1i', level: 'EMG', make: function (r) {
          var s = gen(function () { var k = r.int(2, 9), n = r.int(3, 12); return k !== n ? { k: k, n: n } : null; });
          return solvePart(t(s.k + '(' + s.n * s.n + '-x^{2})=0'), [s.n, -s.n], { fs: [L(1, -s.n)], hints: ['The ' + t(s.k) + ' in front can never be 0, so only the bracket matters.', 'Factor the bracket as a difference of squares.'], text: 'solve k(n^2-x^2)=0',
            wrong: [[[s.k, s.n, -s.n], 'const-zero', 'The constant ' + t(s.k) + ' is never 0, so it gives no solution.'], [[s.n * s.n, -s.n * s.n], 'no-root', 'Take the square root: which numbers square to ' + t(s.n * s.n) + '?']],
            sol: steps([s.k + '\\neq 0,\\ \\text{so } ' + s.n * s.n + '-x^{2}=0', '(' + s.n + '-x)(' + s.n + '+x)=0', s.n + '-x=0' + IMP + 'x=' + s.n, s.n + '+x=0' + IMP + 'x=-' + s.n]) + '<br>So ' + t('x=\\pm ' + s.n) + '.' });
        } }] },
      /* ================= Q2: trinomials already equal to 0 ================= */
      { num: '2', section: 'Part B — Solving equations by factoring', stem: 'Solve the equation.', parts: [
        { id: '2a', level: 'EMG', make: function (r) {
          var s = gen(function () { var p = r.int(2, 8), q = r.int(3, 9); return p < q ? { p: p, q: q } : null; });
          var fs = [L(1, -s.p), L(1, -s.q)], E = prod(fs);
          return solvePart(t(polyEq(E)), [s.p, s.q], { fs: fs, hints: H_TRI, text: 'solve x^2-bx+c=0',
            sol: steps(trin(fs[0], fs[1]).concat(zl(fs))) + '<br>So ' + t(ans('x', [s.p, s.q])) + '.' });
        } },
        { id: '2b', level: 'EMG', make: function (r) {
          var s = gen(function () { var p = r.int(2, 8), q = r.int(3, 9); return p < q ? { p: p, q: q } : null; });
          var fs = [L(1, s.p), L(1, s.q)], E = prod(fs);
          return solvePart(t(polyEq(E)), [-s.p, -s.q], { fs: fs, hints: H_TRI, text: 'solve x^2+bx+c=0',
            sol: steps(trin(fs[0], fs[1]).concat(zl(fs))) + '<br>So ' + t(ans('x', [-s.p, -s.q])) + '.' });
        } },
        { id: '2c', level: 'EMG', make: function (r) {
          var s = gen(function () { var p = r.int(4, 12), q = r.int(2, 9); return p > q ? { p: p, q: q } : null; });
          var fs = [L(1, s.p), L(1, -s.q)], E = prod(fs);
          return solvePart(t(polyEq(E)), [-s.p, s.q], { fs: fs, hints: H_TRI, text: 'solve x^2+bx-c=0',
            sol: steps(trin(fs[0], fs[1]).concat(zl(fs))) + '<br>So ' + t(ans('x', [-s.p, s.q])) + '.' });
        } },
        { id: '2d', level: 'PRG', make: function (r) {
          var u = gen(function () { var a = r.pick([2, 3, 5]), b = r.int(1, 4); return cop(a, b) && b % a !== 0 ? { a: a, b: b } : null; }), q = r.int(2, 7);
          var f1 = L(u.a, -u.b), f2 = L(1, -q), E = prod([f1, f2]), roots = [froot(f1), q];
          return solvePart(t(polyEq(E)), roots, { fs: [f1, f2], hints: H_TRI, text: 'solve ax^2-bx+c=0 (decomposition)',
            wrong: [[[u.b, q], 'no-divide', 'Divide by the coefficient: ' + t(ft(f1) + '=0') + ' gives ' + t('x=' + rt(froot(f1))) + '.']],
            sol: steps(trin(f1, f2).concat(zl([f2, f1]))) + '<br>So ' + t(ans('x', roots)) + '.' });
        } },
        { id: '2e', level: 'PRG', make: function (r) {
          var s = gen(function () { var a = r.pick([2, 3, 4, 5]), b = r.int(1, 9), p = r.int(1, 6); return cop(a, b) && b % a !== 0 && a * p - b > 0 ? { a: a, b: b, p: p } : null; });
          var f1 = L(s.a, -s.b), f2 = L(1, s.p), E = prod([f1, f2]), roots = [-s.p, froot(f1)];
          return solvePart(t(polyEq(E)), roots, { fs: [f1, f2], hints: H_TRI, text: 'solve ax^2+bx-c=0 (decomposition)',
            wrong: [[[-s.p, s.b], 'no-divide', 'Divide by the coefficient: ' + t(ft(f1) + '=0') + ' gives ' + t('x=' + rt(froot(f1))) + '.']],
            sol: steps(trin(f1, f2).concat(zl([f2, f1]))) + '<br>So ' + t(ans('x', roots)) + '.' });
        } },
        { id: '2f', level: 'PRG', make: function (r) {
          var s = gen(function () { var p = r.int(3, 10), q = r.int(2, 8); return p > q ? { p: p, q: q } : null; });
          var fs = [L(1, s.p), L(1, -s.q)], E = prod(fs);
          return solvePart(t(P.seq([P.num(s.p * s.q), mono(-(s.p - s.q)), mono(-1, 'x', 2)]) + '=0'), [-s.p, s.q], { fs: fs, text: 'solve c-bx-x^2=0',
            hints: ['Multiply every term by ' + t('-1') + ' and write it in descending order, so the ' + t('x^{2}') + ' term is positive.', 'Then factor the trinomial and set each factor equal to 0.'],
            wrong: [[[s.p, -s.q], 'neg-lead', 'Multiplying by ' + t('-1') + ' changes the sign of <b>every</b> term: the equation becomes ' + t(polyEq(E)) + '.']],
            sol: steps(['\\text{Multiply by } -1:\\ ' + polyEq(E)].concat(trin(fs[0], fs[1])).concat(zl(fs))) + '<br>So ' + t(ans('x', [-s.p, s.q])) + '.' });
        } }] },
      /* ================= Q3: rearrange first ================= */
      { num: '3', stem: 'Solve the equation.', parts: [
        { id: '3a', level: 'PRG', make: function (r) {
          var s = gen(function () { var a = r.pick([2, 3, 5]), q = r.int(1, 9), p = r.int(1, 5); return cop(a, q) && q % a !== 0 && a * p - q > 0 ? { a: a, q: q, p: p } : null; });
          var f1 = L(s.a, -s.q), f2 = L(1, s.p), E = prod([f1, f2]), c = s.p * s.q, b = s.a * s.p - s.q, roots = [froot(f1), -s.p];
          return solvePart(t(P.seq([mono(s.a, 'x', 2), mono(b)]) + '=' + c), roots, { fs: [f1, f2], hints: H_RE, text: 'solve ax^2+bx=c',
            wrong: [[[c, [c - b, s.a]], 'not-zero', notZeroHint]],
            sol: steps(['\\text{One side must be 0: }' + polyEq(E)].concat(trin(f1, f2)).concat(zl([f2, f1]))) + '<br>So ' + t(ans('x', roots)) + '.' });
        } },
        { id: '3b', level: 'PRG', make: function (r) {
          var s = gen(function () { var a = r.pick([2, 3, 4, 5]), q = r.int(1, 9), p = r.int(1, 5); return cop(a, q) && q % a !== 0 && a * p - q > 0 ? { a: a, q: q, p: p } : null; });
          var f1 = L(s.a, s.q), f2 = L(1, -s.p), E = prod([f1, f2]), b = s.a * s.p - s.q, c = s.p * s.q, roots = [froot(f1), s.p];
          return solvePart(t(monoT(s.a, 'x') + '^{2}=' + P.seq([mono(b), P.num(c)])), roots, { fs: [f1, f2], hints: H_RE, text: 'solve ax^2=bx+c',
            wrong: [[[-s.p, [s.q, s.a]], 'move-sign', 'When a term moves to the other side its sign changes: the equation becomes ' + t(polyEq(E)) + '.']],
            sol: steps(['\\text{One side must be 0: }' + polyEq(E)].concat(trin(f1, f2)).concat(zl([f2, f1]))) + '<br>So ' + t(ans('x', roots)) + '.' });
        } },
        { id: '3c', level: 'PRG', make: function (r) {
          var s = gen(function () { var p = r.int(4, 12), q = r.int(2, 10); return p > q && p * q <= 99 ? { p: p, q: q } : null; });
          var b = s.p - s.q, c = s.p * s.q, fs = [L(1, s.p), L(1, -s.q)], E = prod(fs);
          return solvePart(t('x(' + tx(lin(1, b)) + ')=' + c), [-s.p, s.q], { fs: fs, hints: H_RE, text: 'solve x(x+b)=c',
            wrong: [[[c, c - b], 'not-zero', 'Setting ' + t('x=' + c) + ' and ' + t(tx(lin(1, b)) + '=' + c) + ' isn’t allowed: the right side is ' + t(c) + ', not 0. Expand and rearrange first.']],
            sol: '<span>The right side is not 0, so expand and rearrange first.</span><br>' + steps([polyEq(E)].concat(trin(fs[0], fs[1])).concat(zl(fs))) + '<br>So ' + t(ans('x', [-s.p, s.q])) + '.' });
        } },
        { id: '3d', level: 'PRG', make: function (r) {
          var s = gen(function () {
            var a = r.pick([2, 3, 4, 5]), u = r.int(1, 11), v = r.int(1, 5), m = r.int(1, 5); if (!cop(a, u) || u % a === 0) return null;
            var n = a * (m + v) - u, k = u * v - m * n; return n > 0 && k > 0 && k <= 40 && cop(a, n) ? { a: a, u: u, v: v, m: m, n: n, k: k } : null;
          });
          var o1 = L(1, -s.m), o2 = L(s.a, s.n), O = prod([o1, o2]), f1 = L(1, s.v), f2 = L(s.a, -s.u), E = prod([f1, f2]), roots = [froot(f2), -s.v];
          return solvePart(t(prodTex([o1, o2]) + '=' + s.k), roots, { fs: [f1, f2], hints: H_RE, text: 'solve (x-m)(ax+n)=k',
            wrong: [[[s.m + s.k, [s.k - s.n, s.a]], 'not-zero', notZeroHint]],
            sol: steps(['\\text{Expand: }' + tx(O) + '=' + s.k, polyEq(E)].concat(trin(f1, f2)).concat(zl([f2, f1]))) + '<br>So ' + t(ans('x', roots)) + '.' });
        } },
        { id: '3e', level: 'PRG', make: function (r) {
          var s = gen(function () { var a = r.int(2, 5), b = r.int(1, 6), c = r.int(1, 7); var g = gcd(gcd(a * a, 2 * a * b), b * b - c * c); return cop(a, b) && c !== b && ((b + c) % a !== 0 || (b - c) % a !== 0) && a * a * Math.abs(b * b - c * c) <= 240 * g * g ? { a: a, b: b, c: c } : null; }); // reduced |ac| ≤ 240 (booklet: 3)
          var st = squareSteps(s.a, s.b, s.c), rp = st.roots[0], rm = st.roots[1];
          return solvePart(t('(' + tx(lin(s.a, -s.b)) + ')^{2}=' + s.c * s.c), [rp, rm], { fs: st.f, hints: ['Expand the square (it has a middle term), then move ' + t(s.c * s.c) + ' to the left.', 'Take out any common factor, then factor and solve.'], text: 'solve (ax-b)^2=c^2',
            wrong: [[[rp], 'pos-root-only', 'There is a second solution. Two numbers square to ' + t(s.c * s.c) + ': ' + t(s.c) + ' <b>and</b> ' + t(-s.c) + '. Expanding and factoring keeps both.']],
            sol: steps(st.lines) + '<br>So ' + t(ans('x', [rm, rp])) + '.' });
        } },
        { id: '3f', level: 'PRG', make: function (r) {
          var p = r.int(1, 6), k = r.int(3, 9), fs = [L(1, -(k + p)), L(1, p)], E = prod(fs);
          return solvePart(t('(x+' + p + ')(x-' + p + ')=' + k + '(x+' + p + ')'), [k + p, -p], { fs: fs, hints: ['Don’t divide both sides by ' + t('(x+' + p + ')') + ' — that throws away a root.', 'Expand both sides, move everything to the left, and factor.'], text: 'solve (x+p)(x-p)=k(x+p)',
            wrong: [[[k + p], 'divided', 'Dividing both sides by ' + t('(x+' + p + ')') + ' threw away a root: ' + t('x+' + p) + ' can be 0. Expand and collect on one side instead.']],
            sol: '<span>Do <b>not</b> divide by ' + t('(x+' + p + ')') + '. Expand instead:</span><br>' + steps(['x^{2}-' + p * p + '=' + k + 'x+' + k * p, polyEq(E)].concat(trin(fs[0], fs[1])).concat(zl(fs))) + '<br>So ' + t(ans('x', [k + p, -p])) + '.' });
        } }] },
      /* ================= Q4: other letters, unusual order ================= */
      { num: '4', stem: 'Solve the equation.', parts: [
        { id: '4a', level: 'PRG', make: function (r) {
          var s = gen(function () { var A = r.pick([6, 8, 10, 12]), p = r.int(2, 5), q = r.int(1, 5); return cop(A, q) && q - A * p < 0 ? { A: A, p: p, q: q } : null; });
          var f1 = L(s.A, s.q), f2 = L(1, -s.p), E = prod([f1, f2], 'a'), roots = [s.p, froot(f1)];
          return solvePart(t(P.seq([mono(s.A, 'a', 2), P.num(-s.p * s.q), mono(s.q - s.A * s.p, 'a')]) + '=0'), roots, { v: 'a', fs: [f1, f2], text: 'solve Aa^2-c-ba=0 (order)',
            hints: ['Write the terms in descending order first: ' + t('a^{2}') + ' term, then the ' + t('a') + ' term, then the constant.', 'Then factor by decomposition and set each factor equal to 0.'],
            sol: steps(['\\text{Descending order: }' + polyEq(E)].concat(trin(f1, f2, 'a')).concat(zl([f2, f1], 'a'))) + '<br>So ' + t(ans('a', roots)) + '.' });
        } },
        { id: '4b', level: 'PRG', make: function (r) {
          var s = gen(function () {
            var a = r.pick([2, 3, 4]), b = r.pick([2, 3, 5]), u = r.int(1, 7), w = r.int(1, 7); if (a === b || !cop(a, u) || u % a === 0 || !cop(b, w) || w % b === 0) return null;
            var M = b * u - a * w, A = a * b; if (M <= 0 || A > 15) return null; var m = r.int(1, A - 1); return { a: a, b: b, u: u, w: w, M: M, A: A, m: m, n: A - m };
          });
          var f1 = L(s.b, -s.w), f2 = L(s.a, s.u), E = prod([f1, f2], 'k'), roots = [froot(f1), froot(f2)];
          var lhs = P.seq([P.num(s.u * s.w), mono(-s.M, 'k'), mono(-s.m, 'k', 2)]);
          return solvePart(t(lhs + '=' + monoT(s.n, 'k') + '^{2}'), roots, { v: 'k', fs: [f1, f2], text: 'solve c-Mk-mk^2=nk^2',
            hints: ['Subtract ' + t(monoT(s.n, 'k') + '^{2}') + ' from both sides so the right side is 0, then multiply through by ' + t('-1') + '.', 'Factor by decomposition and set each factor equal to 0.'],
            sol: steps(['\\text{Collect on one side: }' + P.seq([P.num(s.u * s.w), mono(-s.M, 'k'), mono(-s.A, 'k', 2)]) + '=0', '\\text{Multiply by } -1:\\ ' + polyEq(E)].concat(trin(f1, f2, 'k')).concat(zl([f2, f1], 'k'))) + '<br>So ' + t(ans('k', roots)) + '.' });
        } }] },
      /* ================= Q5: L-shaped wood ================= */
      { num: '5', section: 'Part C — Problem solving with polynomial equations', stem: function (sh) { return 'The diagram shows a piece of L-shaped wood of uniform width ' + t('x') + ' cm, with inner edge lengths ' + t('RS=' + sh.p) + ' cm and ' + t('ST=' + sh.q) + ' cm.' + figWood(sh.p, sh.q); },
        shared: function (r) { return gen(function () { var p = r.int(5, 14), q = r.int(5, 15), w = r.int(2, 6); return p !== q ? { p: p, q: q, w: w, s: w + p + q, A: w * (w + p + q) } : null; }); },
        parts: [
          { id: '5a', level: 'PRG', make: function (r, sh) {
            var X = P.v('x'), T = P.add(P.pow(X, 2), mono(sh.p + sh.q));
            var p = B.poly('Find the area of the piece of wood, in ' + t('\\text{cm}^{2}') + ', in terms of ' + t('x') + '.', T, { wrong: [
              { is: mono(sh.p + sh.q), code: 'corner-missing', hint: 'You have the two long strips along the inner edges, but not the ' + t('x') + ' by ' + t('x') + ' square in the outer corner.' },
              { is: P.add(mono(2, 'x', 2), mono(sh.p + sh.q)), code: 'corner-twice', hint: 'Strips of ' + t('x+' + sh.p) + ' and ' + t('x+' + sh.q) + ' overlap in the corner square: subtract ' + t('x^{2}') + ' once.' },
              { is: P.mul(lin(1, sh.p), lin(1, sh.q)), code: 'bounding-box', hint: 'That is a rectangle measuring ' + t('(x+' + sh.p + ')') + ' by ' + t('(x+' + sh.q + ')') + ' — most of it is empty space, not wood.' }] },
              'Split the L into a vertical strip ' + t('x') + ' by ' + t('(x+' + sh.p + ')') + ' and a horizontal strip ' + t(sh.q) + ' by ' + t('x') + ':<br>' + steps(['x(x+' + sh.p + ')+' + sh.q + 'x=x^{2}+' + sh.p + 'x+' + sh.q + 'x', '=' + tx(T)]) + '<br>Area ' + t('=' + tx(T) + '\\text{ cm}^{2}') + '.',
              ['Cut the L into two rectangles (or use two overlapping strips and subtract the corner square).', 'Each strip is ' + t('x') + ' wide.'], 'L-shape area');
            p.bad = [tx(mono(sh.p + sh.q)), tx(P.mul(lin(1, sh.p), lin(1, sh.q)))];
            return p;
          } },
          { id: '5b', level: 'ADV', make: function (r, sh) {
            var b = sh.p + sh.q;
            return numPart('Find the value of ' + t('x') + ' if the area is ' + t(sh.A + '\\text{ cm}^{2}') + '.', sh.w, [
              [-sh.s, 'neg-root', t('x=' + (-sh.s)) + ' does satisfy the equation, but ' + t('x') + ' is a width — it can’t be negative. Reject it and use the other root.'],
              [sh.s, 'sign', 'Check the signs in your factors: ' + t('(x+' + sh.s + ')(x-' + sh.w + ')') + ' — which bracket gives a positive root?'],
              [-sh.w, 'sign', 'Check the sign: the width is positive.']],
              steps(['x^{2}+' + b + 'x=' + sh.A + IMP + 'x^{2}+' + b + 'x-' + sh.A + '=0', '\\text{Product } -' + sh.A + ',\\ \\text{sum } ' + b + ':\\ \\ ' + sh.s + '\\text{ and }-' + sh.w, '(x+' + sh.s + ')(x-' + sh.w + ')=0' + IMP + 'x=-' + sh.s + '\\text{ or }x=' + sh.w]) +
              '<br><b>Reject ' + t('x=-' + sh.s) + ':</b> a width cannot be negative. So ' + t('x=' + sh.w) + ' cm.<br>Check: ' + t(sh.w + '^{2}+' + b + '(' + sh.w + ')=' + sh.w * sh.w + '+' + b * sh.w + '=' + sh.A) + ' ✓',
              ['Set your area expression equal to ' + t(sh.A) + ' and move ' + t(sh.A) + ' to the left.', 'Factor, solve, and reject any root that can’t be a width.'], 'L-shape solve for x', 'cm');
          } }] },
      /* ================= Q6: S = n(n − 1) ================= */
      { num: '6', stem: 'The sum of the first ' + t('n') + ' even numbers, starting with ' + t('0') + ', is given by the formula ' + t('S=n(n-1)') + '.',
        shared: function (r) { return gen(function () { var a = r.int(15, 30), m = r.int(20, 40); return a !== m ? { a: a, m: m, S: m * (m - 1) } : null; }); },
        parts: [
          { id: '6a', level: 'BEG', make: function (r, sh) {
            var a = sh.a, S = a * (a - 1);
            return numPart('Determine the sum of the first ' + t(a) + ' even numbers, starting with ' + t('0') + '.', S, [[a * (a + 1), 'formula', 'The formula is ' + t('n(n-1)') + ': multiply ' + t(a) + ' by ' + t(a - 1) + '.'], [a * a - 1, 'formula', 'Work out the bracket first: ' + t(a + '(' + a + '-1)=' + a + '\\times' + (a - 1)) + '.'], [2 * a, 'formula', 'Substitute ' + t('n=' + a) + ' into ' + t('S=n(n-1)') + '.']],
              'Substitute ' + t('n=' + a) + ': ' + t('S=' + a + '(' + a + '-1)=' + a + '(' + (a - 1) + ')=' + N(S)) + '.<br>(Check: ' + t('0+2+4+\\cdots+' + 2 * (a - 1) + '=' + N(S)) + ' ✓)', ['Substitute ' + t('n=' + a) + ' into the formula.'], 'S=n(n-1) evaluate');
          } },
          { id: '6b', level: 'PRG', make: function (r, sh) {
            var m = sh.m, S = sh.S;
            return numPart('How many consecutive even numbers, starting with ' + t('0') + ', add up to ' + t(N(S)) + '?', m, [
              [-(m - 1), 'neg-root', t('n=-' + (m - 1)) + ' satisfies the equation, but ' + t('n') + ' counts numbers, so it must be positive. Reject it.'],
              [m - 1, 'sign', 'Check by substituting: ' + t((m - 1) + '(' + (m - 2) + ')=' + N((m - 1) * (m - 2))) + ', not ' + t(N(S)) + '. Look at the signs in your factors.'],
              [-m, 'sign', 'A count of numbers can’t be negative — check the signs in your factors.']],
              steps(['n(n-1)=' + N(S) + IMP + 'n^{2}-n-' + N(S) + '=0', '\\text{Product } -' + N(S) + ',\\ \\text{sum } -1:\\ \\ -' + m + '\\text{ and }' + (m - 1), '(n-' + m + ')(n+' + (m - 1) + ')=0' + IMP + 'n=' + m + '\\text{ or }n=-' + (m - 1)]) +
              '<br><b>Reject ' + t('n=-' + (m - 1)) + ':</b> ' + t('n') + ' counts numbers. So there are ' + t(m) + ' even numbers.<br>Check: ' + t(m + '\\times' + (m - 1) + '=' + N(S)) + ' ✓',
              ['Set ' + t('n(n-1)=' + N(S)) + ', expand, and move ' + t(N(S)) + ' to the left.', 'You need two numbers that multiply to ' + t('-' + N(S)) + ' and differ by 1: start near ' + t('\\sqrt{' + N(S) + '}') + '.'], 'S=n(n-1) solve for n');
          } }] },
      /* ================= Q7: triangle ================= */
      { num: '7', stem: function (sh) { return 'The height of a triangle is ' + t(sh.d) + ' mm more than its base. The area is ' + t(sh.A + '\\text{ mm}^{2}') + '.'; },
        shared: function (r) { return gen(function () { var b = r.int(6, 20), d = r.int(2, 9); return (b * (b + d)) % 2 === 0 && b !== d ? { b: b, d: d, A: b * (b + d) / 2 } : null; }); },
        parts: [
          { id: '7a', level: 'PRG', make: function (r, sh) {
            var T = P.add(mono(1, 'b', 2), mono(sh.d, 'b'), P.num(-2 * sh.A));
            var wr = [{ is: P.add(mono(1, 'b', 2), mono(sh.d, 'b'), P.num(-sh.A)), code: 'half', hint: 'The area of a triangle is ' + t('\\tfrac{1}{2}\\times\\text{base}\\times\\text{height}') + '. Don’t forget the ' + t('\\tfrac{1}{2}') + '.' },
              { is: P.add(mono(1, 'b', 2), mono(-sh.d, 'b'), P.num(-2 * sh.A)), code: 'height-minus', hint: 'The height is ' + t(sh.d) + ' mm <b>more</b> than the base: ' + t('b+' + sh.d) + '.' },
              { is: P.add(mono(1, 'b', 2), mono(sh.d, 'b'), P.num(2 * sh.A)), code: 'sign-k', hint: 'When ' + t(2 * sh.A) + ' moves to the left side, it becomes ' + t(-2 * sh.A) + '.' }];
            if (sh.A % 2 === 0) wr.push({ is: P.add(mono(1, 'b', 2), mono(sh.d, 'b'), P.num(-sh.A / 2)), code: 'half-wrong', hint: 'To clear the ' + t('\\tfrac{1}{2}') + ', <b>multiply</b> both sides by 2.' });
            return eqZeroPart('Let ' + t('b') + ' be the base, in mm. Write a polynomial equation that models this information, in the form ' + t('\\ldots=0') + ' (type the left side).', T, 'b', wr,
              'Base ' + t('=b') + ', height ' + t('=b+' + sh.d) + '.<br>' + steps(['\\tfrac{1}{2}b(b+' + sh.d + ')=' + sh.A, 'b(b+' + sh.d + ')=' + 2 * sh.A, tx(T) + '=0']) + '<br>(Any equivalent equation, such as ' + t('\\tfrac{1}{2}b^{2}+' + (sh.d % 2 ? '\\tfrac{' + sh.d + '}{2}' : sh.d === 2 ? '' : sh.d / 2) + 'b-' + sh.A + '=0') + ', is also correct.)',
              ['Write the height in terms of ' + t('b') + ', then use Area ' + t('=\\tfrac{1}{2}\\times\\text{base}\\times\\text{height}') + '.', 'Multiply both sides by 2, expand, and move the constant to the left.'], 'triangle model equation');
          } },
          { id: '7b', level: 'ADV', make: function (r, sh) {
            var b = sh.b, d = sh.d, h = b + d, A2 = 2 * sh.A;
            return numPart('Determine the height of the triangle.', h, [
              [b, 'gave-base', 'That is the base. The height is ' + t(d) + ' mm more than the base.'],
              [-h, 'neg-root', t('b=-' + h) + ' is a root of the equation, but a base can’t be negative — reject it and use the other root.'],
              [-b, 'neg-root', 'That comes from the root you should reject: a base can’t be negative.'], [h + d, 'given-x', 'Check: the base is ' + t('b') + ' (a root of your equation), and the height is ' + t('b+' + d) + '.']],
              steps(['b^{2}+' + d + 'b-' + A2 + '=0', '\\text{Product } -' + A2 + ',\\ \\text{sum } ' + d + ':\\ \\ ' + h + '\\text{ and }-' + b, '(b+' + h + ')(b-' + b + ')=0' + IMP + 'b=-' + h + '\\text{ or }b=' + b]) +
              '<br><b>Reject ' + t('b=-' + h) + ':</b> a base is a length and cannot be negative.<br>Base ' + t('=' + b) + ' mm, so the height is ' + t(b + '+' + d + '=' + h) + ' mm.<br>Check: ' + t('\\tfrac{1}{2}(' + b + ')(' + h + ')=' + sh.A) + ' ✓',
              ['Solve your equation from (a) by factoring.', 'Reject the root that can’t be a length, then add ' + t(d) + ' to the base.'], 'triangle height', 'mm');
          } }] },
      /* ================= Q8: multiple choice ================= */
      { num: '8', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '8', level: 'EMG', make: function (r) {
          var s = gen(function () { var p = r.int(3, 9), q = r.int(2, 8); return p > q ? { p: p, q: q } : null; }), b = s.p - s.q, c = s.p * s.q;
          return mcPart(r, 'The complete solution to the equation ' + t('x(' + tx(lin(1, b)) + ')=' + c) + ' is', [
            { html: t('x=' + s.q + '\\text{ and }x=' + s.p), why: 'Substitute ' + t('x=' + s.p) + ': ' + t(s.p + '(' + (s.p + b) + ')=' + s.p * (s.p + b)) + ', not ' + t(c) + '. Rearrange to ' + t(tx(P.mul(lin(1, s.p), lin(1, -s.q))) + '=0') + ' and factor.', code: 'pos' },
            { html: t('x=-' + s.q + '\\text{ and }x=' + s.p), why: 'The signs are swapped. From ' + t('(x+' + s.p + ')(x-' + s.q + ')=0') + ', the solutions have the opposite signs to the numbers in the brackets.', code: 'swap' },
            { html: t('x=-' + s.p + '\\text{ and }x=' + s.q), right: true },
            { html: t('x=-' + s.p + '\\text{ and }x=-' + s.q), why: 'Substitute ' + t('x=-' + s.q) + ': ' + t('-' + s.q + '(' + (b - s.q) + ')=' + (-s.q * (b - s.q))) + ', not ' + t(c) + '. Check the signs.', code: 'neg' }],
            steps(['\\text{Rearrange: }x^{2}+' + (b === 1 ? '' : b) + 'x-' + c + '=0', '\\text{Product } -' + c + ',\\ \\text{sum } ' + b + ':\\ \\ ' + s.p + '\\text{ and }-' + s.q, '(x+' + s.p + ')(x-' + s.q + ')=0' + IMP + 'x=-' + s.p + ',\\ ' + s.q]) + '<br>Both roots are wanted, since the question asks for the <b>complete</b> solution.',
            ['Rearrange so one side is 0, then factor.'], 'MC x(x+b)=c');
        } }] },
      /* ================= Q9: numerical response ================= */
      { num: '9', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '9', level: 'PRG', make: function (r) {
          var s = gen(function () {
            var A = r.pick([3, 6, 7]), Bn = r.int(1, 2 * A - 1), C = r.pick([2, 4, 5]), D = r.int(1, 2 * C - 1);
            if (!cop(A, Bn) || !cop(C, D) || Bn % A === 0 || D % C === 0 || Bn * C - A * D === 0 || A === C || A * C * Bn * D > 240) return null; // |ac| ≤ 240 (booklet: 60)
            return { A: A, B: Bn, C: C, D: D, M: Bn * C - A * D };
          });
          var f1 = L(s.A, s.B), f2 = L(s.C, -s.D), E = prod([f1, f2]), bv = s.B / s.A, rb = K.roundTo(bv, 2), ra = K.roundTo(s.D / s.C, 2);
          var p = B.approx('The equation ' + t(P.seq([mono(s.A * s.C, 'x', 2), mono(s.M)]) + '=' + s.B * s.D) + ' has solutions ' + t('x=a') + ' and ' + t('x=-b') + ', where ' + t('a') + ' and ' + t('b') + ' are positive rational numbers. The value of ' + t('b') + ', to the nearest hundredth, is ________.', bv, 2, {
            nr: true, diag: function (v) { return Math.abs(v - ra) < 1e-9 ? { code: 'gave-a', hint: 'That is ' + t('a') + ', the positive solution. ' + t('b') + ' comes from the <b>negative</b> solution ' + t('x=-b') + '.' } : null; } },
            steps(['\\text{Rearrange: }' + polyEq(E)].concat(trin(f2, f1)).concat(zl([f1, f2]))) + '<br>Matching ' + t('x=a') + ' and ' + t('x=-b') + ': ' + t('a=' + rt(froot(f2)) + ',\\ b=' + rt([s.B, s.A]) + '\\approx ' + rb.toFixed(2)) + '. Record ' + t(rb < 1 ? rb.toFixed(2).slice(1) : rb.toFixed(2)) + '.',
            H_RE, 'NR solve then round b');
          if (Math.abs(ra - rb) > 1e-9) p.bad = [ra.toFixed(2)];
          return p;
        } }] },
      /* ================= Q10: numerical response ================= */
      { num: '10', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '10', level: 'PRG', make: function (r) {
          var k = r.int(20, 45), S = k * (k + 1) / 2, S2 = 2 * S;
          return nrPart('The sum of the first ' + t('k') + ' natural numbers is given by the formula ' + t('S=\\frac{1}{2}k(k+1)') + '. If the first ' + t('k') + ' natural numbers have a sum of ' + t(N(S)) + ', the value of ' + t('k') + ' is ________.', k,
            [[k + 1, 'sign', 'Check by substituting: ' + t('\\tfrac{1}{2}(' + (k + 1) + ')(' + (k + 2) + ')=' + N((k + 1) * (k + 2) / 2)) + '. Look at the signs in your factors.'], [k - 1, 'sign', 'Check by substituting: ' + t('\\tfrac{1}{2}(' + (k - 1) + ')(' + k + ')=' + N((k - 1) * k / 2)) + '.']],
            steps(['\\tfrac{1}{2}k(k+1)=' + N(S) + IMP + 'k^{2}+k-' + N(S2) + '=0', '\\text{Product } -' + N(S2) + ',\\ \\text{sum } 1:\\ \\ ' + (k + 1) + '\\text{ and }-' + k, '(k+' + (k + 1) + ')(k-' + k + ')=0' + IMP + 'k=-' + (k + 1) + '\\text{ or }k=' + k]) +
            '<br><b>Reject ' + t('k=-' + (k + 1)) + ':</b> ' + t('k') + ' counts natural numbers. So ' + t('k=' + k) + '.<br>Check: ' + t('\\tfrac{1}{2}(' + k + ')(' + (k + 1) + ')=' + N(S)) + ' ✓',
            ['Multiply both sides by 2 first, then rearrange so one side is 0.', 'You need two numbers that multiply to ' + t('-' + N(S2)) + ' and differ by 1.'], 'NR S=k(k+1)/2');
        } }] }
    ],

    extra: [
      /* ================= EP Part A ================= */
      { num: '1', section: 'Extra practice A — The Zero Product Law only works against zero', stem: 'Each equation already has ' + t('0') + ' on one side and a factored expression on the other. Solve. Watch for a constant factor that can never be zero, a repeated factor, and a bracket that factors again.', parts: [
        { id: 'e1a', level: 'BEG', make: function (r) {
          var c = -r.int(2, 9), u = fracPair(r, [2, 3, 4, 5], 13), d = r.int(2, 9), fs = [L(u.a, -u.b), L(1, d)], roots = [froot(fs[0]), -d];
          return solvePart(t(c + prodTex(fs) + '=0'), roots, { fs: fs, hints: H_ZPL, text: 'solve c(ax-b)(x+d)=0',
            wrong: [[[c].concat(roots), 'const-zero', 'The factor ' + t(c) + ' is a constant: it can never be 0, so it gives no solution.'], [[0].concat(roots), 'const-zero', 'The constant ' + t(c) + ' is never 0, so it gives no solution — ' + t('x=0') + ' isn’t a solution here.']],
            sol: '<span>The factor ' + t(c) + ' is a constant and can never be 0, so only the brackets matter.</span><br>' + steps(zl(fs)) + '<br>So ' + t(ans('x', roots)) + '.' });
        } },
        { id: 'e1b', level: 'EMG', make: function (r) {
          var k = r.int(2, 5), u = fracPair(r, [2, 3, 4, 5, 6], 13), d = r.int(2, 9), fs = [L(k, 0), L(u.a, -u.b), L(1, d)], roots = [0, froot(fs[1]), -d];
          return solvePart(t(prodTex(fs) + '=0'), roots, { fs: fs, hints: ['There are three factors, so there are three small equations.'], text: 'solve kx(ax-b)(x+d)=0',
            sol: '<span>Three factors, three equations:</span><br>' + steps(zl(fs)) + '<br>So ' + t(ans('x', roots)) + '.' });
        } },
        { id: 'e1c', level: 'EMG', make: function (r) {
          var n = r.int(2, 9), u = fracPair(r, [2, 3, 4, 5], 9), lf = L(u.a, u.b), fs = [L(1, -n), L(1, n), lf], roots = [n, -n, froot(lf)];
          return solvePart(t('(x^{2}-' + n * n + ')' + bk(lf) + '=0'), roots, { fs: fs, hints: ['The first bracket factors again: it is a difference of squares.'], text: 'solve (x^2-n^2)(ax+b)=0',
            wrong: [[[n, froot(lf)], 'one-root-dos', t('x^{2}-' + n * n + '=0') + ' has <b>two</b> solutions: ' + t('(x-' + n + ')(x+' + n + ')=0') + '.'], [[n * n, froot(lf)], 'no-root', t('x^{2}=' + n * n) + ' means ' + t('x=\\pm' + n) + '.']],
            sol: '<span>The first bracket factors again:</span><br>' + steps([prodTex(fs) + '=0'].concat(zl(fs))) + '<br>So ' + t(ans('x', roots)) + '.' });
        } },
        { id: 'e1d', level: 'EMG', make: function (r) {
          var u = fracPair(r, [2, 3, 4, 5], 9), d = r.int(2, 9), fs = [L(u.a, -u.b), L(u.a, u.b), L(1, -d)], roots = [froot(fs[0]), froot(fs[1]), d];
          return solvePart(t(prodTex(fs) + '=0'), roots, { fs: fs, hints: H_ZPL, text: 'solve (ax-b)(ax+b)(x-d)=0',
            sol: steps(zl(fs)) + '<br>So ' + t(ans('x', roots)) + '.' });
        } },
        { id: 'e1e', level: 'BEG', make: function (r) {
          var k = r.int(2, 4), u = fracPair(r, [2, 3, 4, 5, 6, 7], 11), w = fracPair(r, [2, 3, 4, 5, 6, 7], 11), fs = [L(u.a, -u.b), L(w.a, w.b)], roots = [froot(fs[0]), froot(fs[1])];
          return solvePart(t('\\tfrac{1}{' + k + '}' + prodTex(fs) + '=0'), roots, { fs: fs, hints: ['The factor ' + t('\\tfrac{1}{' + k + '}') + ' can never be 0, so only the brackets matter.'], text: 'solve (1/k)(ax-b)(cx+d)=0',
            wrong: [[[[1, k]].concat(roots), 'const-zero', 'The constant ' + t('\\tfrac{1}{' + k + '}') + ' is never 0, so it gives no solution.']],
            sol: '<span>The factor ' + t('\\tfrac{1}{' + k + '}') + ' can never be 0.</span><br>' + steps(zl(fs)) + '<br>So ' + t(ans('x', roots)) + '.' });
        } },
        { id: 'e1f', level: 'BEG', make: function (r) {
          var s = gen(function () { var p = r.int(2, 9), q = r.int(1, 9); return p !== q ? { p: p, q: q } : null; }), fs = [L(1, -s.p), L(1, -s.p), L(1, s.q)];
          var part = solvePart(t(prodTex(fs) + '=0'), [s.p, -s.q], { fs: fs, hints: ['The factor ' + t('x-' + s.p) + ' appears twice — it gives the same number both times.'], text: 'solve (x-p)(x-p)(x+q)=0',
            sol: steps(['x-' + s.p + '=0' + IMP + 'x=' + s.p + '\\quad(\\text{twice})', 'x+' + s.q + '=0' + IMP + 'x=-' + s.q]) + '<br>So ' + t(ans('x', [s.p, -s.q])) + ' (two distinct solutions).' });
          part.good.push('x=' + s.p + ', x=' + s.p + ', x=-' + s.q);
          return part;
        } }] },
      { num: '2', stem: 'Every left side below is <b>already factored</b>, but the right side is <b>not</b> ' + t('0') + '. The Zero Product Law does not apply yet. Expand, collect everything on one side, factor again, and solve.', parts: [
        { id: 'e2a', level: 'PRG', make: function (r) { return refactorMonic(r, 1); } },
        { id: 'e2b', level: 'PRG', make: function (r) { return refactorMonic(r, -1); } },
        { id: 'e2c', level: 'PRG', make: function (r) { return refactorNonMonic(r, [2, 3]); } },
        { id: 'e2d', level: 'EMG', make: function (r) {
          var n = r.int(2, 8), m = r.int(n + 1, 12), k = m * m - n * n;
          return solvePart(t('(x+' + n + ')(x-' + n + ')=' + k), [m, -m], { fs: [L(1, -m)], hints: H_RE, text: 'solve (x+n)(x-n)=k',
            wrong: [[[k - n, k + n], 'not-zero', notZeroHint], [[n, -n], 'not-zero', 'Those make the left side 0, but the right side is ' + t(k) + '. Expand and rearrange first.'], [[m * m, -m * m], 'no-root', 'Take the square root: which numbers square to ' + t(m * m) + '?']],
            sol: steps(['\\text{Expand: }x^{2}-' + n * n + '=' + k, 'x^{2}-' + m * m + '=0', '(x-' + m + ')(x+' + m + ')=0']) + '<br>So ' + t('x=\\pm' + m) + '.' });
        } },
        { id: 'e2e', level: 'PRG', make: function (r) { return refactorNonMonic(r, [3, 4, 5]); } },
        { id: 'e2f', level: 'PRG', make: function (r) {
          var opts = [];
          [2, 3].forEach(function (a) { [1, 2, 3].forEach(function (e) { if (!cop(a, e)) return;
            [[1, a * a], [a * a, 1], [a, a]].forEach(function (cc) { [[1, -e * e], [-1, e * e], [e, -e], [e * e, -1], [-e * e, 1], [-e, e]].forEach(function (dd) {
              var c1 = cc[0], c2 = cc[1], d1 = dd[0], d2 = dd[1]; if (!cop(c1, d1) || !cop(c2, d2)) return;
              var b = -(c1 * d2 + c2 * d1); if (b === 0 || Math.abs(b) > 30) return; opts.push({ a: a, e: e, f1: L(c1, d1), f2: L(c2, d2), b: b });
            }); }); }); });
          var s = r.pick(opts), E = prod([s.f1, s.f2]), roots = [froot(s.f1), froot(s.f2)];
          return solvePart(t('(' + monoT(s.a, 'x') + '-' + s.e + ')(' + monoT(s.a, 'x') + '+' + s.e + ')=' + tx(mono(s.b))), roots, { fs: [s.f1, s.f2], hints: H_RE, text: 'solve (ax-e)(ax+e)=bx',
            sol: steps(['\\text{Expand: }' + s.a * s.a + 'x^{2}-' + s.e * s.e + '=' + tx(mono(s.b)), '\\text{Rearrange: }' + polyEq(E)].concat(trin(s.f1, s.f2)).concat(zl([s.f2, s.f1]))) + '<br>So ' + t(ans('x', roots)) + '.' });
        } }] },
      { num: '3', stem: function (sh) { return 'A student looked at ' + t('(x+' + sh.p + ')(x-' + sh.q + ')=' + sh.k) + ' and wrote ' + t('x+' + sh.p + '=' + sh.k) + ' and ' + t('x-' + sh.q + '=' + sh.k) + ', giving ' + t('x=' + (sh.k - sh.p)) + ' and ' + t('x=' + (sh.k + sh.q)) + '.'; },
        shared: function (r) { return gen(function () { var p = r.int(1, 6), q = r.int(2, 7); return p !== q ? { p: p, q: q, k: p + q + 1 } : null; }); },
        parts: [
          { id: 'e3a', level: 'BEG', make: function (r, sh) {
            var x = sh.k + sh.q, v = (x + sh.p) * (x - sh.q);
            return numPart('Substitute ' + t('x=' + x) + ' into the original equation. What does the left side actually equal?', v, [[sh.k, 'rhs', 'That is the right side. Work out ' + t('(' + x + '+' + sh.p + ')(' + x + '-' + sh.q + ')') + '.'], [x + sh.p + x - sh.q, 'formula', 'Multiply the two brackets, don’t add them.']],
              t('(' + x + '+' + sh.p + ')(' + x + '-' + sh.q + ')=(' + (x + sh.p) + ')(' + (x - sh.q) + ')=' + v) + '.<br>The left side is ' + t(v) + ', not ' + t(sh.k) + ', so ' + t('x=' + x) + ' is <b>not</b> a solution.', ['Replace each ' + t('x') + ' with ' + t(x) + ' and multiply the brackets.'], 'substitute student root');
          } },
          { id: 'e3b', level: 'EMG', make: function (r, sh) {
            var x = sh.k - sh.p;
            return mcPart(r, 'The student’s method did produce ' + t('x=' + x) + ', which <b>is</b> a solution. Why is that a coincidence and not evidence the method works?', [
              { html: 'At ' + t('x=' + x) + ' the factors are ' + t(x + '+' + sh.p + '=' + sh.k) + ' and ' + t(x + '-' + sh.q + '=1') + ', and ' + t(sh.k + '\\times 1=' + sh.k) + '. It only works because the other factor happens to be ' + t('1') + '.', right: true },
              { html: 'Setting each factor equal to ' + t(sh.k) + ' is valid; ' + t('x=' + (sh.k + sh.q)) + ' only failed because of an arithmetic slip.', why: 'Substitute ' + t('x=' + (sh.k + sh.q)) + ': the left side is far from ' + t(sh.k) + '. The method itself is unreliable.', code: 'valid' },
              { html: 'Both factors equal ' + t(sh.k) + ' when ' + t('x=' + x) + ', so their product is ' + t(sh.k) + '.', why: 'Check: ' + t(x + '-' + sh.q + '=1') + ', not ' + t(sh.k) + '. And if both were ' + t(sh.k) + ', the product would be ' + t(sh.k * sh.k) + '.', code: 'both' },
              { html: 'The method works whenever the right side is positive, so ' + t('x=' + x) + ' was bound to be right.', why: 'The right side is positive for ' + t('x=' + (sh.k + sh.q)) + ' too, and that answer fails. Work out both brackets at ' + t('x=' + x) + '.', code: 'positive' }],
              'At ' + t('x=' + x) + ': ' + t('(' + sh.k + ')(1)=' + sh.k) + '. It works only because the <b>other</b> factor is ' + t('1') + '. The same method gave ' + t('x=' + (sh.k + sh.q)) + ', which fails, so the method is not reliable.', ['Work out each bracket at ' + t('x=' + x) + '.'], 'why the student method fails');
          } },
          { id: 'e3c', level: 'EMG', make: function (r, sh) {
            return mcPart(r, 'There are infinitely many pairs of numbers whose product is ' + t(sh.k) + '. Why is a product of ' + t('0') + ' special?', [
              { html: 'If ' + t('AB=0') + ', at least one factor <b>must</b> be ' + t('0') + '. If ' + t('AB=' + sh.k) + ', ' + t('A') + ' could be any nonzero number, so neither factor is known.', right: true },
              { html: 'Because ' + t('0') + ' is the smallest number, so each factor has to be small.', why: 'Size isn’t the point (and negative numbers are smaller than 0). Think about what ' + t('AB=0') + ' forces.', code: 'small' },
              { html: 'If ' + t('AB=' + sh.k) + ', then ' + t('A=' + sh.k) + ' and ' + t('B=' + sh.k) + ' are forced, just like with ' + t('0') + '.', why: 'Then ' + t('AB') + ' would be ' + t(sh.k * sh.k) + '. Many pairs multiply to ' + t(sh.k) + ', for example ' + t('2\\times\\frac{' + sh.k + '}{2}') + '.', code: 'forced' },
              { html: 'It isn’t special: any right side works as long as you check your answers.', why: 'Only 0 forces a factor to take a known value. With ' + t(sh.k) + ' on the right, the factors could be anything.', code: 'any' }],
              'If ' + t('AB=' + sh.k) + ', ' + t('A') + ' can be any nonzero number and ' + t('B=' + sh.k + '\\div A') + ', so neither factor is known. If ' + t('AB=0') + ', one factor <b>must</b> be ' + t('0') + ' — that is why 0 is the only value we can set each factor equal to.', ['What does ' + t('A\\times B=0') + ' tell you about ' + t('A') + ' or ' + t('B') + '?'], 'why zero is special');
          } }] },
      /* ================= EP Part B ================= */
      { num: '4', section: 'Extra practice B — Rearrange first, then choose a method', stem: 'Solve. Move everything to one side first. Between them these use a common factor, a difference of squares, factoring by inspection, and the method of decomposition.', parts: [
        { id: 'e4a', level: 'EMG', make: function (r) {
          var k = r.int(2, 7), n = r.int(2, 9);
          return solvePart(t(k + 'x^{2}=' + k * n * n), [n, -n], { fs: [L(1, -n)], hints: H_RE.slice(0, 1).concat(['Take out the common factor ' + t(k) + ', then factor the difference of squares.']), text: 'solve kx^2=kn^2',
            wrong: [[[n * n, -n * n], 'no-root', 'Take the square root: which numbers square to ' + t(n * n) + '?']],
            sol: steps([k + 'x^{2}-' + k * n * n + '=0', k + '(x^{2}-' + n * n + ')=0', k + '(x-' + n + ')(x+' + n + ')=0']) + '<br>So ' + t('x=\\pm' + n) + '.' });
        } },
        { id: 'e4b', level: 'EMG', make: function (r) {
          var s = gen(function () { var p = r.int(2, 8), q = r.int(3, 9); return p < q ? { p: p, q: q } : null; }), fs = [L(1, s.p), L(1, s.q)], E = prod(fs);
          return solvePart(t('x^{2}+' + (s.p + s.q) + 'x=-' + s.p * s.q), [-s.p, -s.q], { fs: fs, hints: H_RE, text: 'solve x^2+bx=-c',
            sol: steps([polyEq(E)].concat(trin(fs[0], fs[1])).concat(zl(fs))) + '<br>So ' + t(ans('x', [-s.p, -s.q])) + '.' });
        } },
        { id: 'e4c', level: 'PRG', make: function (r) { return twoFrac(r, [[2, 3], [3, 2], [2, 5], [3, 4], [4, 3]], 5, 'solve ax^2+bx=c'); } },
        { id: 'e4d', level: 'PRG', make: function (r) {
          var k = r.pick([2, 3, 5, 6, 7]), u = fracPair(r, [2, 3, 4], 7), a = u.a, b = u.b, fs = [L(a, -b), L(a, b)];
          return solvePart(t(k * a * a + 'x^{2}=' + k * b * b), [[b, a], [-b, a]], { fs: fs, hints: H_RE.slice(0, 1).concat(['Take out the common factor ' + t(k) + ' first, then factor the difference of squares.']), text: 'solve k(a^2x^2)=kb^2',
            wrong: [[[[b * b, a * a], [-b * b, a * a]], 'no-root', 'You found ' + t('x^{2}=' + rt([b * b, a * a])) + ' — now take the square root of the top and the bottom.']],
            sol: steps([k * a * a + 'x^{2}-' + k * b * b + '=0', '\\text{Common factor } ' + k + ':\\ ' + k + '(' + a * a + 'x^{2}-' + b * b + ')=0', k + prodTex(fs) + '=0']) + '<br>So ' + t('x=\\pm' + rt([b, a])) + '.' });
        } },
        { id: 'e4e', level: 'PRG', make: function (r) { return twoFrac(r, [[2, 4], [4, 2]], 9, 'solve 8x^2+bx=c (big ac)'); } },
        { id: 'e4f', level: 'PRG', make: function (r) {
          var k = r.int(2, 5), s = gen(function () { var p = r.int(2, 8), q = r.int(3, 9); return p < q ? { p: p, q: q } : null; }), fs = [L(1, s.p), L(1, s.q)], E = prod(fs, 'x', k);
          return solvePart(t(P.seq([mono(k, 'x', 2), mono(k * (s.p + s.q))]) + '=-' + k * s.p * s.q), [-s.p, -s.q], { fs: fs, hints: H_RE.slice(0, 1).concat(['Every term has the common factor ' + t(k) + ': take it out before factoring the trinomial.']), text: 'solve kx^2+kbx=-kc',
            sol: steps([polyEq(E), '\\text{Common factor } ' + k + ':\\ ' + k + '(' + tx(prod(fs)) + ')=0', k + prodTex(fs) + '=0'].concat(zl(fs))) + '<br>So ' + t(ans('x', [-s.p, -s.q])) + '.' });
        } }] },
      { num: '5', stem: 'Solve. These have ' + t('x') + ' terms on both sides, a bracket to square, or a fraction to clear.',
        shared: function (r) { return gen(function () { var p = r.int(1, 7), q = r.int(2, 9); return q > p ? { p: p, q: q } : null; }); },
        parts: [
          { id: 'e5a', level: 'PRG', make: function (r) {
            var s = gen(function () { var p = r.int(2, 9), q = r.int(2, 9), be = r.int(1, 6), ga = r.int(-9, 9); if (p === q || !ga) return null; var F0 = prod([L(1, p), L(1, -q)]), R0 = P.add(mono(1, 'x', 2), mono(be), P.num(ga)), L0 = P.add(F0, R0); return P.count(L0) === 3 ? { p: p, q: q, F0: F0, R0: R0, L0: L0 } : null; });
            var fs = [L(1, s.p), L(1, -s.q)];
            return solvePart(t(tx(s.L0) + '=' + tx(s.R0)), [-s.p, s.q], { fs: fs, hints: ['Subtract every term of the right side from the left side, collecting like terms.', 'Then factor and solve.'], text: 'solve quadratic = quadratic',
              sol: steps(['\\text{Collect on the left: }' + polyEq(s.F0)].concat(trin(fs[0], fs[1])).concat(zl(fs))) + '<br>So ' + t(ans('x', [-s.p, s.q])) + '.' });
          } },
          { id: 'e5b', level: 'PRG', make: function (r) {
            var s = gen(function () { var g = r.int(2, 4), p = r.int(1, 6), q = r.int(2, 8), al = r.int(1, 3), be = r.int(-8, 8), ga = r.int(-9, 9); if (p >= q || !be || !ga) return null; var F0 = prod([L(1, -p), L(1, -q)], 'x', g), R0 = P.add(mono(al, 'x', 2), mono(be), P.num(ga)), L0 = P.add(F0, R0); return P.count(L0) === 3 ? { g: g, p: p, q: q, F0: F0, R0: R0, L0: L0 } : null; });
            var fs = [L(1, -s.p), L(1, -s.q)];
            return solvePart(t(tx(s.L0) + '=' + tx(s.R0)), [s.p, s.q], { fs: fs, hints: ['Collect every term on the left side.', 'Take out the common factor before factoring.'], text: 'solve quadratic = quadratic with GCF',
              sol: steps(['\\text{Collect on the left: }' + polyEq(s.F0), '\\text{Common factor } ' + s.g + ':\\ ' + s.g + '(' + tx(prod(fs)) + ')=0', s.g + prodTex(fs) + '=0'].concat(zl(fs))) + '<br>So ' + t(ans('x', [s.p, s.q])) + '.' });
          } },
          { id: 'e5c', level: 'PRG', make: function (r, sh) {
            var p = sh.p, q = sh.q, fs = [L(1, p + q), L(1, -(q - p))], E = prod(fs);
            return solvePart(t('(x+' + p + ')^{2}=' + q * q), [-(p + q), q - p], { fs: fs, hints: ['Expand ' + t('(x+' + p + ')^{2}') + ' — remember the middle term — then move ' + t(q * q) + ' to the left.', 'Factor and solve.'], text: 'solve (x+p)^2=q^2',
              wrong: [[[q - p], 'pos-root-only', 'There is a second solution: two numbers square to ' + t(q * q) + ', ' + t(q) + ' and ' + t(-q) + '. Expanding and factoring finds both.']],
              sol: steps(['\\text{Expand: }x^{2}+' + 2 * p + 'x+' + p * p + '=' + q * q, polyEq(E)].concat(trin(fs[0], fs[1])).concat(zl(fs))) + '<br>So ' + t(ans('x', [-(p + q), q - p])) + '.' });
          } },
          { id: 'e5d', level: 'PRG', make: function (r) {
            var s = gen(function () { var b = 2 * r.int(0, 4) + 1, c = 2 * r.int(0, 5) + 1; return b !== c ? { b: b, c: c } : null; });
            var st = squareSteps(2, s.b, s.c);
            return solvePart(t('(2x-' + s.b + ')^{2}=' + s.c * s.c), st.roots, { fs: st.f, hints: ['Expand the square (it has a middle term), then move ' + t(s.c * s.c) + ' to the left.', 'Take out the common factor, then factor and solve.'], text: 'solve (2x-b)^2=c^2',
              wrong: [[[st.roots[0]], 'pos-root-only', 'There is a second solution: two numbers square to ' + t(s.c * s.c) + '. Expanding and factoring finds both.']],
              sol: steps(st.lines) + '<br>So ' + t(ans('x', st.roots)) + '.' });
          } },
          { id: 'e5e', level: 'PRG', make: function (r) {
            var opts = []; [2, 3, 4, 5, 6].forEach(function (n) { for (var u = 1; u <= n * n; u++) if ((n * n) % u === 0 && u > n) opts.push({ n: n, u: u, w: n * n / u }); });
            var s = r.pick(opts), b = s.u - s.w, fs = [L(1, -s.u), L(1, s.w)], E = prod(fs);
            return solvePart(t('(x+' + s.n + ')(x-' + s.n + ')=' + tx(mono(b))), [s.u, -s.w], { fs: fs, hints: H_RE, text: 'solve (x+n)(x-n)=bx',
              wrong: [[[s.n, -s.n], 'not-zero', 'Those make the left side 0, but the right side is ' + t(tx(mono(b))) + ', not 0. Expand and rearrange first.']],
              sol: steps(['\\text{Expand: }x^{2}-' + s.n * s.n + '=' + tx(mono(b)), polyEq(E)].concat(trin(fs[0], fs[1])).concat(zl(fs))) + '<br>So ' + t(ans('x', [s.u, -s.w])) + '.' });
          } },
          { id: 'e5f', level: 'PRG', make: function (r) {
            var s = gen(function () { var k = r.pick([2, 3]), u = r.int(2, 12), w = r.int(1, 9); return u !== w && (u - w) % k === 0 && (u * w) % k === 0 ? { k: k, u: u, w: w, b: (u - w) / k, c: u * w / k } : null; });
            var fs = [L(1, -s.u), L(1, s.w)], E = prod(fs);
            return solvePart(t(P.seq([P.mono([1, s.k], { x: 2 }), mono(-s.b)]) + '=' + s.c), [s.u, -s.w], { fs: fs, hints: ['Multiply <b>every</b> term (on both sides) by ' + t(s.k) + ' to clear the fraction.', 'Then rearrange, factor and solve.'], text: 'solve x^2/k - bx = c',
              sol: steps(['\\text{Multiply every term by } ' + s.k + ':\\ ' + P.seq([mono(1, 'x', 2), mono(-s.k * s.b)]) + '=' + s.k * s.c, polyEq(E)].concat(trin(fs[0], fs[1])).concat(zl(fs))) + '<br>So ' + t(ans('x', [s.u, -s.w])) + '.' });
          } },
          { id: 'e5g', level: 'EMG', make: function (r, sh) {
            var p = sh.p, q = sh.q;
            return numPart('To solve ' + t('(x+' + p + ')^{2}=' + q * q) + ', a student took the square root of both sides and wrote ' + t('x+' + p + '=' + q) + ', so ' + t('x=' + (q - p)) + '. Which solution did that lose?', -(q + p), [[q - p, 'given-x', 'That is the one the student found. Two numbers square to ' + t(q * q) + ': what if ' + t('x+' + p + '=-' + q) + '?'], [q + p, 'sign', 'Solve ' + t('x+' + p + '=-' + q) + ' carefully.'], [p - q, 'sign', 'Solve ' + t('x+' + p + '=-' + q) + ': subtract ' + t(p) + ' from both sides.']],
              'Two numbers square to ' + t(q * q) + ': ' + t(q) + ' <b>and</b> ' + t(-q) + '. Taking only ' + t('+' + q) + ' threw away ' + t('x+' + p + '=-' + q) + ', which gives ' + t('x=' + (-(q + p))) + '.<br>Check: ' + t('(' + (-(q + p)) + '+' + p + ')^{2}=(-' + q + ')^{2}=' + q * q) + ' ✓', ['Which other number squares to ' + t(q * q) + '?'], 'lost root from square root');
          } }] },
      /* ================= EP Part C ================= */
      { num: '6', section: 'Extra practice C — Never divide both sides by a variable', stem: 'Every equation below has a common factor containing the variable. <b>Factor it out — do not divide it away.</b> Solve, and list <b>all</b> the solutions.', parts: [
        { id: 'e6a', level: 'EMG', make: function (r) {
          var n = r.int(2, 12);
          return solvePart(t('x^{2}=' + n + 'x'), [0, n], { fs: [L(1, -n)], hints: ['Subtract ' + t(n + 'x') + ' from both sides, then take out the common factor ' + t('x') + '.'], text: 'solve x^2=nx',
            sol: steps(['x^{2}-' + n + 'x=0', 'x(x-' + n + ')=0', 'x=0\\text{ or }x=' + n]) + '<br>So ' + t(ans('x', [0, n])) + '.' });
        } },
        { id: 'e6b', level: 'EMG', make: function (r) {
          var a = r.int(2, 7), n = r.int(2, 9);
          return solvePart(t(a + 'x^{2}=-' + a * n + 'x'), [0, -n], { fs: [L(1, n)], hints: ['Add ' + t(a * n + 'x') + ' to both sides, then take out the common factor ' + t(a + 'x') + '.'], text: 'solve ax^2=-anx',
            sol: steps([a + 'x^{2}+' + a * n + 'x=0', a + 'x(x+' + n + ')=0', a + 'x=0' + IMP + 'x=0', 'x+' + n + '=0' + IMP + 'x=-' + n]) + '<br>So ' + t(ans('x', [0, -n])) + '.' });
        } },
        { id: 'e6c', level: 'EMG', make: function (r) {
          var n = r.int(2, 9);
          return solvePart(t('x^{3}=' + n * n + 'x'), [0, n, -n], { fs: [L(1, -n)], hints: ['Move everything to the left, take out ' + t('x') + ', and factor the difference of squares that is left.'], text: 'solve x^3=n^2x',
            sol: steps(['x^{3}-' + n * n + 'x=0', 'x(x^{2}-' + n * n + ')=0', 'x(x-' + n + ')(x+' + n + ')=0']) + '<br>So ' + t('x=0,\\ x=\\pm' + n) + '.' });
        } },
        { id: 'e6d', level: 'EMG', make: function (r) {
          var s = gen(function () { var p = r.int(2, 9), q = r.int(1, 9); return p !== q ? { p: p, q: q } : null; }), d = s.p - s.q;
          return solvePart(t('x(x+' + s.p + ')=' + monoT(s.q, 'x')), [0, -d], { fs: [L(1, d)], hints: ['Expand the left side, then move ' + t(monoT(s.q, 'x')) + ' to the left.', 'Take out the common factor ' + t('x') + '.'], text: 'solve x(x+p)=qx',
            sol: steps(['\\text{Expand: }x^{2}+' + s.p + 'x=' + monoT(s.q, 'x'), tx(P.add(mono(1, 'x', 2), mono(d))) + '=0', 'x(' + tx(lin(1, d)) + ')=0']) + '<br>So ' + t(ans('x', [0, -d])) + '.' });
        } },
        { id: 'e6e', level: 'EMG', make: function (r) {
          var g = r.int(2, 5), u = fracPair(r, [2, 3, 4, 5], 11), a = g * u.a, b = g * u.b, R0 = [u.b, u.a];
          return solvePart(t(a + 'x^{3}=' + b + 'x^{2}'), [0, R0], { fs: [L(u.a, -u.b)], hints: ['Move everything to the left and take out the common factor ' + t(g + 'x^{2}') + '.'], text: 'solve ax^3=bx^2',
            sol: steps([a + 'x^{3}-' + b + 'x^{2}=0', '\\text{Common factor } ' + g + 'x^{2}:\\ ' + g + 'x^{2}(' + monoT(u.a, 'x') + '-' + u.b + ')=0', g + 'x^{2}=0' + IMP + 'x=0', monoT(u.a, 'x') + '-' + u.b + '=0' + IMP + 'x=' + rt(R0)]) + '<br>So ' + t(ans('x', [0, R0])) + '.' });
        } },
        { id: 'e6f', level: 'PRG', make: function (r) {
          var u = gen(function () { var w = fracPair(r, [2, 3, 4, 5], 11); return w.b > 1 ? w : null; }), p = r.int(1, 7), R0 = [u.b, u.a]; // b > 1: no "1(x−p)" on the right
          return solvePart(t(u.a + 'x(x-' + p + ')=' + u.b + '(x-' + p + ')'), [p, R0], { fs: [L(u.a, -u.b)], hints: ['Don’t divide by ' + t('(x-' + p + ')') + '. Subtract ' + t(u.b + '(x-' + p + ')') + ' from both sides instead.', 'Then take out the common factor ' + t('(x-' + p + ')') + '.'], text: 'solve ax(x-p)=b(x-p)',
            wrong: [[[R0], 'divided', 'Dividing by ' + t('(x-' + p + ')') + ' threw away a root: ' + t('x-' + p) + ' can be 0. Move everything to one side and factor out ' + t('(x-' + p + ')') + ' instead.']],
            sol: '<span>Do <b>not</b> divide by ' + t('(x-' + p + ')') + '.</span><br>' + steps([u.a + 'x(x-' + p + ')-' + u.b + '(x-' + p + ')=0', '(x-' + p + ')(' + monoT(u.a, 'x') + '-' + u.b + ')=0']) + '<br>So ' + t(ans('x', [p, R0])) + '.' });
        } }] },
      { num: '7', stem: function (sh) { return 'Two students solve ' + t('x^{2}=' + sh.n + 'x') + '. <b>Ravi</b> divides both sides by ' + t('x') + ' to get ' + t('x=' + sh.n) + '. <b>Sasha</b> subtracts to get ' + t('x^{2}-' + sh.n + 'x=0') + ', factors to ' + t('x(x-' + sh.n + ')=0') + ', and gets ' + t('x=0') + ' or ' + t('x=' + sh.n) + '.'; },
        shared: function (r) { return { n: r.int(3, 9) }; },
        parts: [
          { id: 'e7a', level: 'BEG', make: function (r, sh) {
            var n = sh.n;
            return mcPart(r, 'Substitute ' + t('x=0') + ' into the <b>original</b> equation. Is it a solution?', [
              { html: 'Yes: the left side is ' + t('0^{2}=0') + ' and the right side is ' + t(n + '(0)=0') + '.', right: true },
              { html: 'No: the left side is ' + t('0') + ' but the right side is ' + t(n) + '.', why: 'Substitute carefully: the right side is ' + t(n + 'x') + ', so at ' + t('x=0') + ' it is ' + t(n + '\\times 0=0') + '.', code: 'rhs-n' },
              { html: 'No: ' + t('0') + ' can never be a solution of an equation.', why: 'Zero is a number like any other — substitute it and compare the two sides.', code: 'never' },
              { html: 'It can’t be checked, because you can’t divide by ' + t('0') + '.', why: 'Checking means substituting into the original equation — there is no division in ' + t('x^{2}=' + n + 'x') + '.', code: 'cant' }],
              'Left side: ' + t('0^{2}=0') + '. Right side: ' + t(n + '(0)=0') + '. Both sides equal 0, so <b>yes</b>, ' + t('x=0') + ' is a solution — the one Ravi lost.', ['Work out each side with ' + t('x=0') + '.'], 'is x=0 a solution');
          } },
          { id: 'e7b', level: 'EMG', make: function (r, sh) {
            var n = sh.n;
            return mcPart(r, 'Ravi’s division is legal for every value of ' + t('x') + ' except one. Which value, and why does dividing by ' + t('x') + ' lose a solution?', [
              { html: t('x=0') + ': division by 0 is undefined, so dividing by ' + t('x') + ' quietly assumes ' + t('x\\neq 0') + ' — and the solution ' + t('x=0') + ' is never found.', right: true },
              { html: t('x=' + n) + ': dividing by ' + t('x') + ' changes the equation so that ' + t(n) + ' is no longer a solution.', why: 'Ravi still found ' + t('x=' + n) + '. The problem value is the one you can’t divide by.', code: 'n' },
              { html: t('x=1') + ': dividing by 1 does nothing, so that step is wasted.', why: 'Dividing by 1 is harmless. Which number can you never divide by?', code: 'one' },
              { html: t('x=-' + n) + ': negative values are lost when you divide.', why: 'Division doesn’t lose negative values. Which single number makes division undefined?', code: 'neg' }],
              'The value is ' + t('x=0') + '. Division by 0 is undefined, so dividing by ' + t('x') + ' is only allowed if ' + t('x\\neq 0') + '. The step assumes ' + t('x') + ' is not 0, so the solution ' + t('x=0') + ' disappears.', ['Which number can you never divide by?'], 'why dividing by x loses a root');
          } },
          { id: 'e7c', level: 'EMG', make: function (r) {
            return mcPart(r, 'Which rule should you follow instead?', [
              { html: '<b>Never divide by a variable:</b> move every term to one side so it equals 0, factor out the common factor, and set <b>every</b> factor (including a bare ' + t('x') + ') equal to 0.', right: true },
              { html: 'Divide by the variable, then check your answer by substituting it back.', why: 'Checking confirms the solutions you found, but it can’t bring back the one the division threw away.', code: 'check' },
              { html: 'Always divide both sides by the highest power of ' + t('x') + ' first, to make the equation simpler.', why: 'That is exactly the step that loses ' + t('x=0') + '.', code: 'divide' },
              { html: 'Take the square root of both sides instead of factoring.', why: 'Square-rooting ' + t('x^{2}') + ' and ' + t('x') + ' terms doesn’t work here and can lose solutions too.', code: 'root' }],
              '<b>Never divide by a variable:</b> move every term to one side so it equals 0, factor out the common factor, and set every factor (including a bare ' + t('x') + ') equal to 0.', ['Think about what Sasha did differently.'], 'rule: never divide by x');
          } }] },
      /* ================= EP Part D ================= */
      { num: '8', section: 'Extra practice D — Repeated factors', stem: 'Solve each equation. (A repeated factor gives the same solution twice — list each distinct solution once.)',
        shared: function (r) { return { p: r.int(2, 9) }; },
        parts: [
          { id: 'e8a', level: 'EMG', make: function (r) {
            var p = r.int(2, 9);
            return solvePart(t('x^{2}-' + 2 * p + 'x+' + p * p + '=0'), [p], { fs: [L(1, -p)], hints: ['Is the trinomial a perfect square? Check ' + t(p * p + '=' + p + '^{2}') + ' and the middle term.'], text: 'solve perfect square = 0',
              wrong: [[[p, -p], 'pm', 'Only one value works: ' + t('(x-' + p + ')^{2}=0') + ' needs ' + t('x-' + p + '=0') + '. Check ' + t('x=-' + p) + ': ' + t('(-' + 2 * p + ')^{2}=' + 4 * p * p) + ', not 0.']],
              sol: steps(['\\text{Perfect square: }(x-' + p + ')^{2}=0', 'x-' + p + '=0' + IMP + 'x=' + p]) + '<br>So ' + t('x=' + p) + ' — <b>one</b> distinct solution.' });
          } },
          { id: 'e8b', level: 'PRG', make: function (r) {
            var u = fracPair(r, [2, 3, 4, 5], 9), a = u.a, b = u.b, R0 = [-b, a];
            return solvePart(t(a * a + 'x^{2}+' + 2 * a * b + 'x+' + b * b + '=0'), [R0], { fs: [L(a, b)], hints: ['Check for a perfect square: ' + t(a * a + 'x^{2}=(' + a + 'x)^{2}') + ', ' + t(b * b + '=' + b + '^{2}') + '. Is the middle term ' + t('2(' + a + 'x)(' + b + ')') + '?'], text: 'solve (ax+b)^2=0',
              sol: steps(['\\text{Perfect square: } 2(' + a + 'x)(' + b + ')=' + 2 * a * b + 'x', '(' + a + 'x+' + b + ')^{2}=0', a + 'x+' + b + '=0' + IMP + 'x=' + rt(R0)]) + '<br>So ' + t('x=' + rt(R0)) + ' — <b>one</b> distinct solution.' });
          } },
          { id: 'e8c', level: 'PRG', make: function (r) {
            var u = fracPair(r, [2, 3, 4, 5], 9), a = u.a, b = u.b, R0 = [b, a];
            return solvePart(t(a * a + 'x^{2}=' + 2 * a * b + 'x-' + b * b), [R0], { fs: [L(a, -b)], hints: H_RE.slice(0, 1).concat(['The result is a perfect square trinomial.']), text: 'solve a^2x^2=2abx-b^2',
              sol: steps([a * a + 'x^{2}-' + 2 * a * b + 'x+' + b * b + '=0', '(' + a + 'x-' + b + ')^{2}=0', a + 'x-' + b + '=0' + IMP + 'x=' + rt(R0)]) + '<br>So ' + t('x=' + rt(R0)) + ' — <b>one</b> distinct solution.' });
          } },
          { id: 'e8d', level: 'EMG', make: function (r) {
            var p = r.int(2, 9);
            return solvePart(t('x^{2}+' + p * p + '=' + 2 * p + 'x'), [p], { fs: [L(1, -p)], hints: H_RE.slice(0, 1).concat(['Write it in descending order — it is a perfect square.']), text: 'solve x^2+p^2=2px',
              wrong: [[[p, -p], 'pm', 'Only one value works: ' + t('(x-' + p + ')^{2}=0') + ' needs ' + t('x-' + p + '=0') + '.']],
              sol: steps(['x^{2}-' + 2 * p + 'x+' + p * p + '=0', '(x-' + p + ')^{2}=0']) + '<br>So ' + t('x=' + p) + ' — <b>one</b> distinct solution.' });
          } },
          { id: 'e8e', level: 'EMG', make: function (r) {
            var g = r.int(2, 5), p = r.int(2, 7);
            return solvePart(t(g + 'x^{2}+' + 2 * g * p + 'x+' + g * p * p + '=0'), [-p], { fs: [L(1, p)], hints: ['Take out the common factor ' + t(g) + ' first.', 'The trinomial left is a perfect square.'], text: 'solve g(x+p)^2=0',
              wrong: [[[-p, p], 'pm', 'Only one value works: ' + t('(x+' + p + ')^{2}=0') + ' needs ' + t('x+' + p + '=0') + '.']],
              sol: steps(['\\text{Common factor } ' + g + ':\\ ' + g + '(x^{2}+' + 2 * p + 'x+' + p * p + ')=0', g + '(x+' + p + ')^{2}=0']) + '<br>So ' + t('x=-' + p) + ' — <b>one</b> distinct solution.' });
          } },
          { id: 'e8f1', sub: 'f i', level: 'PRG', make: function (r, sh) {
            var p = sh.p;
            return solvePart(t('x^{3}-' + 2 * p + 'x^{2}+' + p * p + 'x=0'), [0, p], { fs: [L(1, -p)], hints: ['Take out the common factor ' + t('x') + ' first.', 'The trinomial left is a perfect square.'], text: 'solve x(x-p)^2=0',
              sol: steps(['\\text{Common factor } x:\\ x(x^{2}-' + 2 * p + 'x+' + p * p + ')=0', 'x(x-' + p + ')^{2}=0']) + '<br>So ' + t(ans('x', [0, p])) + ' (' + t('x=' + p) + ' is repeated).' });
          } },
          { id: 'e8f2', sub: 'f ii', level: 'BEG', make: function (r, sh) {
            var p = sh.p;
            return numPart('How many <b>distinct</b> solutions does ' + t('x^{3}-' + 2 * p + 'x^{2}+' + p * p + 'x=0') + ' have?', 2, [[3, 'repeated', 'It has three factors, ' + t('x(x-' + p + ')(x-' + p + ')') + ', but two of them are the same and give the same number.'], [1, 'lost-zero', 'Don’t forget the factor ' + t('x') + ': it gives ' + t('x=0') + '.']],
              t('x(x-' + p + ')^{2}=0') + ' gives ' + t('x=0') + ' and ' + t('x=' + p) + ' (twice). So there are <b>two</b> distinct solutions.', ['List the solutions from (f i), counting a repeated one once.'], 'count distinct solutions');
          } }] },
      { num: '9', stem: function (sh) { return 'The equation ' + t('x^{2}-' + 2 * sh.p + 'x+' + sh.p * sh.p + '=0') + ' factors as ' + t('(x-' + sh.p + ')(x-' + sh.p + ')=0') + '.'; },
        shared: function (r) { return { p: r.int(2, 9) }; },
        parts: [
          { id: 'e9a', level: 'EMG', make: function (r, sh) {
            var p = sh.p;
            return mcPart(r, 'The Zero Product Law gives two equations here. Why do they produce only one number?', [
              { html: 'Both equations are ' + t('x-' + p + '=0') + ' — the <b>same</b> equation written twice — so both give ' + t('x=' + p) + '. The solution is repeated, not a second number.', right: true },
              { html: 'One equation gives ' + t('x=' + p) + ' and the other gives ' + t('x=-' + p) + ', but ' + t('x=-' + p) + ' doesn’t check.', why: 'Both brackets are ' + t('x-' + p) + '; neither gives ' + t(-p) + '.', code: 'neg' },
              { html: 'The second equation has no solution.', why: 'It is the same as the first one, so it has the same solution.', code: 'none' },
              { html: 'The Zero Product Law ignores repeated factors.', why: 'The law applies to every factor — here the two factors just happen to be identical.', code: 'ignore' }],
              t('x-' + p + '=0') + ' or ' + t('x-' + p + '=0') + ': the same equation twice, so both give ' + t('x=' + p) + '. There is only one distinct solution, ' + t('x=' + p) + '.', ['Write the two equations side by side.'], 'repeated factor, one solution');
          } },
          { id: 'e9b', level: 'EMG', make: function (r, sh) {
            var p = sh.p;
            return mcPart(r, 'A classmate writes “' + t('x^{2}-' + 2 * p + 'x+' + p * p + '=0') + ' has no solution, because a perfect square is never zero.” Which is the correct statement?', [
              { html: 'A perfect square <b>can</b> be zero (' + t('0^{2}=0') + '); it can never be <b>negative</b>. ' + t('(x-' + p + ')^{2}=0') + ' exactly when ' + t('x=' + p) + ', so there is one solution.', right: true },
              { html: 'The classmate is right: a perfect square is always positive.', why: 'Try ' + t('x=' + p) + ': ' + t('(' + p + '-' + p + ')^{2}=0^{2}=0') + '.', code: 'right' },
              { html: 'There are two solutions, ' + t('x=' + p) + ' and ' + t('x=-' + p) + '.', why: 'Check ' + t('x=-' + p) + ': ' + t('(-' + p + '-' + p + ')^{2}=' + 4 * p * p) + ', not 0.', code: 'two' },
              { html: 'There is no solution because the constant term ' + t(p * p) + ' is positive.', why: 'The sign of the constant term doesn’t decide this. Substitute ' + t('x=' + p) + '.', code: 'const' }],
              'A perfect square can be 0 — what it can never be is negative. Since ' + t('x^{2}-' + 2 * p + 'x+' + p * p + '=(x-' + p + ')^{2}') + ', the equation holds exactly when ' + t('x-' + p + '=0') + ': one solution, ' + t('x=' + p) + '.', ['What is ' + t('0^{2}') + '?'], 'perfect square can be zero');
          } }] },
      /* ================= EP Part E ================= */
      { num: '10', section: 'Extra practice E — Degree three and higher', stem: 'Solve completely. Each of these has <b>more than two</b> solutions — stopping at two loses one.', parts: [
        { id: 'e10a', level: 'EMG', make: function (r) {
          var n = r.int(2, 9);
          return solvePart(t('x^{3}-' + n * n + 'x=0'), [0, n, -n], { fs: [L(1, -n)], hints: ['Take out the common factor ' + t('x') + ', then factor the difference of squares.'], text: 'solve x^3-n^2x=0',
            sol: steps(['x(x^{2}-' + n * n + ')=0', 'x(x-' + n + ')(x+' + n + ')=0']) + '<br>So ' + t('x=0,\\ x=\\pm' + n) + '.' });
        } },
        { id: 'e10b', level: 'PRG', make: function (r) {
          var k = r.int(2, 5), n = r.int(2, 9);
          return solvePart(t(k + 'x^{3}-' + k * n * n + 'x=0'), [0, n, -n], { fs: [L(1, -n)], hints: ['Take out the common factor ' + t(k + 'x') + ', then factor what is left.'], text: 'solve kx^3-kn^2x=0',
            wrong: [[[n, -n], 'lost-zero', 'You lost ' + t('x=0') + ': the factor ' + t(k + 'x') + ' is 0 when ' + t('x=0') + '.']],
            sol: steps(['\\text{Common factor } ' + k + 'x:\\ ' + k + 'x(x^{2}-' + n * n + ')=0', k + 'x(x-' + n + ')(x+' + n + ')=0']) + '<br>So ' + t('x=0,\\ x=\\pm' + n) + '.' });
        } },
        { id: 'e10c', level: 'PRG', make: function (r) {
          var s = gen(function () { var p = r.int(2, 9), q = r.int(2, 9); return p !== q ? { p: p, q: q } : null; }), fs = [L(1, s.p), L(1, -s.q)], E = prod([L(1, 0)].concat(fs));
          return solvePart(t(polyEq(E)), [0, -s.p, s.q], { fs: fs, hints: ['Take out the common factor ' + t('x') + ', then factor the trinomial.'], text: 'solve x^3+bx^2+cx=0',
            sol: steps(['x(' + tx(prod(fs)) + ')=0'].concat(trin(fs[0], fs[1]).slice(0, 1)).concat(['x' + prodTex(fs) + '=0'])) + '<br>So ' + t(ans('x', [0, -s.p, s.q])) + '.' });
        } },
        { id: 'e10d', level: 'PRG', make: function (r) {
          var k = r.int(2, 5), s = gen(function () { var p = r.int(2, 8), q = r.int(1, 8); return p !== q ? { p: p, q: q } : null; }), fs = [L(1, -s.p), L(1, s.q)], E = prod([L(1, 0)].concat(fs), 'x', k);
          return solvePart(t(polyEq(E)), [0, s.p, -s.q], { fs: fs, hints: ['Take out the common factor ' + t(k + 'x') + ', then factor the trinomial.'], text: 'solve kx^3+bx^2+cx=0',
            sol: steps(['\\text{Common factor } ' + k + 'x:\\ ' + k + 'x(' + tx(prod(fs)) + ')=0'].concat(trin(fs[0], fs[1]).slice(0, 1)).concat([k + 'x' + prodTex(fs) + '=0'])) + '<br>So ' + t(ans('x', [0, s.p, -s.q])) + '.' });
        } },
        { id: 'e10e', level: 'PRG', make: function (r) {
          var n = r.int(2, 9);
          return solvePart(t('x^{4}-' + n * n + 'x^{2}=0'), [0, n, -n], { fs: [L(1, -n)], hints: ['Take out the common factor ' + t('x^{2}') + ', then factor the difference of squares.'], text: 'solve x^4-n^2x^2=0',
            sol: steps(['x^{2}(x^{2}-' + n * n + ')=0', 'x^{2}(x-' + n + ')(x+' + n + ')=0']) + '<br>So ' + t('x=0,\\ x=\\pm' + n) + ' (' + t('x=0') + ' is repeated).' });
        } },
        { id: 'e10f', level: 'PRG', make: function (r) {
          var s = gen(function () { var p = r.int(1, 7), n = r.int(2, 6); return p !== n ? { p: p, n: n } : null; }), E = P.mul(lin(1, s.p), P.add(mono(1, 'x', 2), P.num(-s.n * s.n)));
          return solvePart(t(polyEq(E)), [-s.p, s.n, -s.n], { fs: [L(1, s.p), L(1, -s.n)], hints: ['Four terms: group them in pairs and take a common factor from each pair.', 'Then the bracket ' + t('x^{2}-' + s.n * s.n) + ' factors again.'], text: 'solve cubic by grouping',
            sol: steps(['x^{2}(x+' + s.p + ')-' + s.n * s.n + '(x+' + s.p + ')=0', '(x+' + s.p + ')(x^{2}-' + s.n * s.n + ')=0', '(x+' + s.p + ')(x-' + s.n + ')(x+' + s.n + ')=0']) + '<br>So ' + t('x=-' + s.p + ',\\ x=\\pm' + s.n) + '.' });
        } }] },
      { num: '11', stem: 'Two questions about counting solutions.', parts: [
        { id: 'e11a', level: 'EMG', make: function (r) {
          var n = r.int(2, 9);
          return mcPart(r, 'A student solving ' + t('x^{3}-' + n * n + 'x=0') + ' divides both sides by ' + t('x') + ', gets ' + t('x^{2}-' + n * n + '=0') + ', and answers ' + t('x=\\pm' + n) + '. Which solution is missing, and why?', [
              { html: t('x=0') + ': dividing by ' + t('x') + ' assumes ' + t('x\\neq 0') + ', but ' + t('0^{3}-' + n * n + '(0)=0') + ', so 0 is a solution.', right: true },
              { html: 'None — ' + t('x=\\pm' + n) + ' is the complete solution.', why: 'Substitute ' + t('x=0') + ' into the original equation.', code: 'none' },
              { html: t('x=' + n * n) + ': the constant was lost when dividing.', why: 'Check: ' + t('(' + n * n + ')^{3}-' + n * n + '(' + n * n + ')') + ' is not 0.', code: 'nsq' },
              { html: t('x=1') + ': dividing by ' + t('x') + ' is the same as dividing by 1.', why: 'Substitute ' + t('x=1') + ': ' + t('1-' + n * n) + ' is not 0.', code: 'one' }],
              t('x=0') + ' is missing. Dividing by ' + t('x') + ' assumes ' + t('x\\neq 0') + ', but ' + t('0^{3}-' + n * n + '(0)=0') + ' ✓. Factoring ' + t('x(x-' + n + ')(x+' + n + ')=0') + ' keeps all three solutions.', ['Substitute ' + t('x=0') + ' into the original equation.'], 'missing root after dividing by x');
        } },
        { id: 'e11b', level: 'EMG', make: function (r) {
          var n = r.int(2, 6), p = r.int(2, 6);
          return mcPart(r, t('x^{3}-' + n * n + 'x=0') + ' factors into three brackets and has three solutions. ' + t('x^{3}-' + 2 * p + 'x^{2}+' + p * p + 'x=0') + ' also factors into three brackets but has only two. Why?', [
              { html: 'In ' + t('x(x-' + p + ')(x-' + p + ')=0') + ' the factor ' + t('x-' + p) + ' is <b>repeated</b>, so two brackets give the same number; ' + t('x(x-' + n + ')(x+' + n + ')') + ' has three different factors.', right: true },
              { html: 'The second equation has a third solution that was lost by dividing.', why: 'Nothing was divided. List the solution from each bracket of ' + t('x(x-' + p + ')^{2}') + '.', code: 'lost' },
              { html: t('x=0') + ' doesn’t count as a solution of the second equation.', why: t('x=0') + ' counts — substitute it. The difference is elsewhere.', code: 'zero' },
              { html: 'Every cubic has three solutions, so the second one must have a negative solution too.', why: 'Check ' + t('x=-' + p) + ': the left side isn’t 0. A repeated factor gives one number twice.', code: 'three' }],
              'In ' + t('x(x-' + n + ')(x+' + n + ')=0') + ' the three factors are all different, giving ' + t('0,\\ ' + n + ',\\ -' + n) + '. In ' + t('x(x-' + p + ')(x-' + p + ')=0') + ' the factor ' + t('x-' + p) + ' is <b>repeated</b>, so only two distinct solutions, ' + t('0') + ' and ' + t(p) + ', remain.', ['Factor both completely and compare the brackets.'], 'repeated factor explanation');
        } }] },
      /* ================= EP Part F ================= */
      { num: '12', section: 'Extra practice F — Word problems: solve, then interpret', stem: function (sh) { return 'A small lecture hall is built with ' + t('n') + ' rows of seats, and each row holds ' + t('(2n-' + sh.b + ')') + ' seats. The hall seats ' + t(sh.T) + ' people in total.'; },
        shared: function (r) { return gen(function () { var N0 = r.int(5, 12), b = 2 * r.int(1, 6) + 1, c = 2 * N0 - b; return c >= 3 && c <= 15 ? { N: N0, b: b, c: c, T: N0 * c } : null; }); },
        parts: [
          { id: 'e12a', level: 'PRG', make: function (r, sh) {
            var f1 = L(1, -sh.N), f2 = L(2, sh.c), E = prod([f1, f2], 'n'), roots = [sh.N, [-sh.c, 2]];
            return solvePart('Write a polynomial equation in ' + t('n') + ' and solve it by factoring. Give <b>both</b> roots.', roots, { v: 'n', fs: [f1, f2], hints: ['Rows × seats per row = total seats: ' + t('n(2n-' + sh.b + ')=' + sh.T) + '.', 'Expand, move ' + t(sh.T) + ' to the left, and factor by decomposition.'], text: 'lecture hall equation roots',
              sol: steps(['n(2n-' + sh.b + ')=' + sh.T, polyEq(E)].concat(trin(f1, f2, 'n')).concat(zl([f2, f1], 'n'))) + '<br>So ' + t(ans('n', [sh.N, [-sh.c, 2]])) + '.' });
          } },
          { id: 'e12b', level: 'ADV', make: function (r, sh) {
            return numPart('Reject the root that cannot be a number of rows. How many seats are in each row?', sh.c, [[sh.N, 'given-x', 'That is the number of rows. Each row holds ' + t('2n-' + sh.b) + ' seats.'], [-sh.c - sh.b, 'neg-root', 'That comes from ' + t('n=-\\tfrac{' + sh.c + '}{2}') + ', which must be rejected: a number of rows can’t be negative or a fraction.'], [2 * sh.N + sh.b, 'sign', 'Each row holds ' + t('2n-' + sh.b) + ' seats: subtract ' + t(sh.b) + '.']],
              '<b>Reject ' + t('n=-\\tfrac{' + sh.c + '}{2}') + ':</b> (1) a number of rows can’t be negative; (2) it can’t be a fraction — there is no half row.<br>So ' + t('n=' + sh.N) + ' rows, and each row holds ' + t('2(' + sh.N + ')-' + sh.b + '=' + sh.c) + ' seats.<br>Check: ' + t(sh.N + '\\times' + sh.c + '=' + sh.T) + ' ✓',
              ['Use the root that is a sensible number of rows, then substitute it into ' + t('2n-' + sh.b) + '.'], 'lecture hall seats per row', 'seats');
          } }] },
      { num: '13', stem: function (sh) { return 'A photograph measuring ' + t(sh.W) + ' cm by ' + t(sh.L) + ' cm is mounted on a rectangular card so that a border of uniform width ' + t('x') + ' cm shows all the way around it. The whole card has an area of ' + t(sh.A + '\\text{ cm}^{2}') + '.'; },
        shared: function (r) { return gen(function () { var W = r.int(8, 14), L0 = W + 2 * r.int(1, 4), X = r.int(2, 5); return { W: W, L: L0, X: X, A: (W + 2 * X) * (L0 + 2 * X), o: (W + L0) / 2 + X }; }); },
        parts: [
          { id: 'e13a', level: 'PRG', make: function (r, sh) {
            var E = P.sub(P.mul(lin(2, sh.W), lin(2, sh.L)), P.num(sh.A)), g = gcd(gcd(4, 2 * (sh.W + sh.L)), sh.W * sh.L - sh.A), fs = [L(1, sh.o), L(1, -sh.X)];
            return solvePart('Write expressions for the length and width of the card in terms of ' + t('x') + ', then form and solve a polynomial equation. Give <b>both</b> roots.', [sh.X, -sh.o], { fs: fs, text: 'photo border equation roots',
              hints: ['The border adds ' + t('x') + ' at <b>each</b> end: the card is ' + t('(' + sh.W + '+2x)') + ' by ' + t('(' + sh.L + '+2x)') + '.', 'Set the product equal to ' + t(sh.A) + ', expand, rearrange, take out the common factor, and factor.'],
              sol: steps(['\\text{width }=' + sh.W + '+2x,\\ \\text{length }=' + sh.L + '+2x', '(' + sh.W + '+2x)(' + sh.L + '+2x)=' + sh.A, polyEq(E), g + '(' + tx(P.scale(E, [1, g])) + ')=0'].concat(trin(fs[0], fs[1]).slice(0, 1)).concat([g + prodTex(fs) + '=0'])) + '<br>So ' + t(ans('x', [sh.X, -sh.o])) + '.' });
          } },
          { id: 'e13b', level: 'ADV', make: function (r, sh) {
            var cw = sh.W + 2 * sh.X, cl = sh.L + 2 * sh.X;
            var d1 = diagFn(sh.X, [[-sh.o, 'neg-root', 'That root must be rejected: a border width can’t be negative.']]);
            var d2 = diagFn(cw, [[sh.W + sh.X, 'one-end-border', 'The border shows on <b>both</b> sides: add ' + t('2x') + '.'], [sh.W, 'given-x', 'That is the photograph. Add the border on both sides.']]);
            var d3 = diagFn(cl, [[sh.L + sh.X, 'one-end-border', 'The border shows on <b>both</b> ends: add ' + t('2x') + '.'], [sh.L, 'given-x', 'That is the photograph. Add the border on both ends.']]);
            var p = B.fields('Reject the root that doesn’t make sense. State the width of the border and the dimensions of the card.', [numF('Border width', 'cm'), numF('Card: shorter side', 'cm'), numF('Card: longer side', 'cm')],
              [K.number(sh.X, d1), K.number(cw, d2), K.number(cl, d3)], [String(sh.X), String(cw), String(cl)], 'Border ' + t(sh.X) + ' cm; card ' + t(cw) + ' cm by ' + t(cl) + ' cm',
              '<b>Reject ' + t('x=-' + sh.o) + ':</b> a border is a width and cannot be negative.<br>Border width: ' + t(sh.X) + ' cm.<br>Card: ' + t(sh.W + '+2(' + sh.X + ')=' + cw) + ' cm by ' + t(sh.L + '+2(' + sh.X + ')=' + cl) + ' cm.<br>Check: ' + t(cw + '\\times' + cl + '=' + sh.A) + ' ✓',
              ['Use the positive root for the border.', 'Each side of the card is the photo side plus ' + t('2x') + '.'], 'photo border and card size');
            p.bad = [[String(-sh.o), String(cw), String(cl)], [String(sh.X), String(sh.W + sh.X), String(sh.L + sh.X)]];
            return p;
          } }] },
      { num: '14', stem: function (sh) { return 'The sum of the squares of two consecutive integers is ' + t(sh.S) + '.'; },
        shared: function (r) { var n = r.int(4, 12); return { n: n, S: n * n + (n + 1) * (n + 1) }; },
        parts: [
          { id: 'e14a', level: 'PRG', make: function (r, sh) {
            var n = sh.n, h = (sh.S - 1) / 2, fs = [L(1, n + 1), L(1, -n)];
            return solvePart('Let the smaller integer be ' + t('n') + '. Form a polynomial equation and solve it by factoring.', [n, -(n + 1)], { v: 'n', fs: fs, text: 'consecutive squares roots',
              hints: ['The next integer is ' + t('n+1') + ': ' + t('n^{2}+(n+1)^{2}=' + sh.S) + '.', 'Expand ' + t('(n+1)^{2}') + ' with its middle term, collect, and take out the common factor 2.'],
              sol: steps(['n^{2}+(n+1)^{2}=' + sh.S, '2n^{2}+2n+1=' + sh.S, '2n^{2}+2n-' + (sh.S - 1) + '=0', '2(n^{2}+n-' + h + ')=0', '\\text{Product } -' + h + ',\\ \\text{sum } 1:\\ \\ ' + (n + 1) + '\\text{ and }-' + n, '2(n+' + (n + 1) + ')(n-' + n + ')=0']) + '<br>So ' + t('n=' + n + ',\\ n=-' + (n + 1)) + '.' });
          } },
          { id: 'e14b', level: 'PRG', make: function (r, sh) {
            var n = sh.n;
            var p = B.fields('This time <b>neither</b> root is rejected. State both pairs of consecutive integers (smaller one first).', [numF('Positive pair: smaller'), numF('Positive pair: larger'), numF('Negative pair: smaller'), numF('Negative pair: larger')],
              [K.number(n), K.number(n + 1), K.number(-(n + 1), function (v) { return v === -n ? { code: 'order', hint: 'The smaller of two negative integers is the one further from 0.' } : v === -(n - 1) ? { code: 'sign', hint: 'The pair starts at ' + t('n=-' + (n + 1)) + '.' } : null; }), K.number(-n, function (v) { return v === -(n + 1) ? { code: 'order', hint: 'The larger of two negative integers is the one closer to 0: ' + t('n+1') + '.' } : v === -(n + 2) ? { code: 'sign', hint: 'The next integer after ' + t(-(n + 1)) + ' is ' + t('-' + (n + 1) + '+1') + '.' } : null; })],
              [String(n), String(n + 1), String(-(n + 1)), String(-n)], t(n) + ' and ' + t(n + 1) + '; ' + t(-(n + 1)) + ' and ' + t(-n),
              t('n=' + n) + ': the integers are ' + t(n) + ' and ' + t(n + 1) + '; ' + t(n * n + '+' + (n + 1) * (n + 1) + '=' + sh.S) + ' ✓<br>' + t('n=-' + (n + 1)) + ': the integers are ' + t(-(n + 1)) + ' and ' + t(-n) + '; ' + t('(' + (-(n + 1)) + ')^{2}+(' + (-n) + ')^{2}=' + sh.S) + ' ✓',
              ['Each root is the smaller integer ' + t('n') + '; the other is ' + t('n+1') + '.'], 'both consecutive pairs');
            p.bad = [[String(n), String(n + 1), String(-n), String(-(n + 1))]];
            return p;
          } },
          { id: 'e14c', level: 'EMG', make: function (r) {
            return mcPart(r, 'What is it about the wording of the problem that lets the negative root survive?', [
              { html: 'It says <b>integers</b>, not positive integers, and nothing is a length or a count — squaring removes the sign, so the negative pair works too.', right: true },
              { html: 'Negative roots are always kept in number problems.', why: 'Not always — in Question 6 a count of numbers had to be positive. It depends on the wording.', code: 'always' },
              { html: 'The equation has a common factor of 2.', why: 'The common factor doesn’t affect which roots are allowed. Look at what the problem calls the numbers.', code: 'gcf' },
              { html: 'Because the sum is odd.', why: 'The sum being odd isn’t the reason. Is there anything in the wording that forbids negative numbers?', code: 'odd' }],
              'The problem says <b>integers</b>, not <i>positive</i> integers, and nothing here is a length or a count. Squaring removes the sign, so the negative pair works just as well.', ['Is there anything in the problem that must be positive?'], 'why the negative root survives');
          } }] },
      { num: '15', stem: function (sh) { return 'An open-topped box is made from a rectangular sheet of card ' + t(sh.L) + ' cm by ' + t(sh.W) + ' cm by cutting a square of side ' + t('x') + ' cm from each corner and folding up the four flaps. The base of the finished box has an area of ' + t(sh.A + '\\text{ cm}^{2}') + '.'; },
        shared: function (r) { return gen(function () { var W = 2 * r.int(6, 11), L0 = W + 2 * r.int(1, 5), X = r.int(2, W / 2 - 2); var o = (L0 + W) / 2 - X; return o !== X ? { L: L0, W: W, X: X, A: (L0 - 2 * X) * (W - 2 * X), o: o } : null; }); },
        parts: [
          { id: 'e15a', level: 'PRG', make: function (r, sh) {
            var E = P.sub(P.mul(lin(-2, sh.L), lin(-2, sh.W)), P.num(sh.A)), fs = [L(1, -sh.X), L(1, -sh.o)], g = gcd(gcd(4, 2 * (sh.L + sh.W)), sh.L * sh.W - sh.A);
            return solvePart('Write expressions for the length and width of the base in terms of ' + t('x') + ', then form and solve a polynomial equation. Give <b>both</b> roots.', [sh.X, sh.o], { fs: fs, text: 'open box equation roots',
              hints: ['A square of side ' + t('x') + ' is cut from <b>both</b> ends of each side: the base is ' + t('(' + sh.L + '-2x)') + ' by ' + t('(' + sh.W + '-2x)') + '.', 'Set the product equal to ' + t(sh.A) + ', expand, rearrange, take out the common factor, and factor.'],
              sol: steps(['\\text{length }=' + sh.L + '-2x,\\ \\text{width }=' + sh.W + '-2x', '(' + sh.L + '-2x)(' + sh.W + '-2x)=' + sh.A, polyEq(E), g + '(' + tx(P.scale(E, [1, g])) + ')=0'].concat(trin(fs[0], fs[1]).slice(0, 1)).concat([g + prodTex(fs) + '=0'])) + '<br>So ' + t(ans('x', [sh.X, sh.o])) + '.' });
          } },
          { id: 'e15b', level: 'ADV', make: function (r, sh) {
            var l2 = sh.L - 2 * sh.o, w2 = sh.W - 2 * sh.o;
            return numPart('Both roots are positive and both satisfy the equation, but one must still be rejected. What is the side of the square cut from each corner?', sh.X, [[sh.o, 'neg-root', 'Substitute it into the base: ' + t(sh.L + '-2(' + sh.o + ')=' + l2) + ' and ' + t(sh.W + '-2(' + sh.o + ')=' + w2) + '. A side of a box can’t be negative — reject this root.']],
              t('x=' + sh.o) + ': length ' + t(sh.L + '-2(' + sh.o + ')=' + l2) + ', width ' + t(sh.W + '-2(' + sh.o + ')=' + w2) + '. The product ' + t('(' + l2 + ')(' + w2 + ')=' + sh.A) + ' satisfies the equation, but a side can’t be negative: there isn’t enough card. <b>Reject ' + t('x=' + sh.o) + '.</b><br>' + t('x=' + sh.X) + ': base ' + t((sh.L - 2 * sh.X) + '\\text{ cm by }' + (sh.W - 2 * sh.X) + '\\text{ cm}') + '; ' + t((sh.L - 2 * sh.X) + '\\times' + (sh.W - 2 * sh.X) + '=' + sh.A) + ' ✓',
              ['Substitute each root into ' + t(sh.L + '-2x') + ' and ' + t(sh.W + '-2x') + '. Which one gives real lengths?'], 'open box valid x', 'cm');
          } },
          { id: 'e15c', level: 'PRG', make: function (r, sh) {
            return numPart(t('x') + ' must be less than what value? (The base must still have a positive width.)', sh.W / 2, [[sh.L / 2, 'wrong-side', 'The <b>shorter</b> side runs out first: ' + t(sh.W + '-2x') + ' must stay positive.'], [sh.W, 'given-x', 'Two squares are cut from each side: ' + t(sh.W + '-2x>0') + '.'], [sh.X, 'given-x', 'That is the actual cut. The question asks for the largest value ' + t('x') + ' must stay below.']],
              'The width ' + t(sh.W + '-2x') + ' must stay positive: ' + t(sh.W + '-2x>0\\ \\Rightarrow\\ x<' + sh.W / 2) + '. So ' + t('x') + ' must be less than ' + t(sh.W / 2) + ' cm (' + t('x=' + sh.W / 2) + ' itself leaves no base at all).', ['Which side of the sheet runs out of card first?'], 'open box upper limit', 'cm');
          } }] },
      /* ================= EP Part G ================= */
      { num: '16', section: 'Extra practice G — Find the error', stem: function (sh) { return 'Asked to solve ' + t('(x-' + sh.p + ')(x+' + sh.q + ')=' + sh.k) + ', a student wrote ' + t('x-' + sh.p + '=' + sh.k) + ' or ' + t('x+' + sh.q + '=' + sh.k) + ', so ' + t('x=' + (sh.k + sh.p)) + ' or ' + t('x=' + (sh.k - sh.q)) + '.'; },
        shared: function (r) { return gen(function () { var p = r.int(2, 7), q = r.int(1, 6), u = r.int(3, 9), v = u + q - p, k = u * v - p * q; return v > 0 && k > 6 && k <= 20 && p !== q && u !== p && [k + p, k - q].every(function (z) { return z !== u && z !== -v; }) ? { p: p, q: q, u: u, v: v, k: k } : null; }); },
        parts: [
          { id: 'e16a', level: 'BEG', make: function (r, sh) {
            var x1 = sh.k + sh.p, x2 = sh.k - sh.q, v1 = (x1 - sh.p) * (x1 + sh.q), v2 = (x2 - sh.p) * (x2 + sh.q);
            var p = B.fields('Substitute both of the student’s answers into the left side of the original equation. What does each come to?', [numF('Left side at \\(x=' + x1 + '\\)'), numF('Left side at \\(x=' + x2 + '\\)')],
              [K.number(v1, function (v) { return v === sh.k ? { code: 'rhs', hint: 'That is the right side. Work out the left side.' } : null; }), K.number(v2, function (v) { return v === sh.k ? { code: 'rhs', hint: 'That is the right side. Work out the left side.' } : null; })],
              [String(v1), String(v2)], t(v1) + ' and ' + t(v2),
              t('x=' + x1) + ': ' + t('(' + x1 + '-' + sh.p + ')(' + x1 + '+' + sh.q + ')=(' + (x1 - sh.p) + ')(' + (x1 + sh.q) + ')=' + N(v1)) + '<br>' + t('x=' + x2) + ': ' + t('(' + x2 + '-' + sh.p + ')(' + x2 + '+' + sh.q + ')=(' + (x2 - sh.p) + ')(' + (x2 + sh.q) + ')=' + N(v2)) + '<br>Neither equals ' + t(sh.k) + ', so <b>neither</b> answer works.',
              ['Replace ' + t('x') + ' in both brackets, then multiply.'], 'substitute both student answers');
            p.bad = [[String(sh.k), String(sh.k)]];
            return p;
          } },
          { id: 'e16b', level: 'EMG', make: function (r, sh) {
            return mcPart(r, 'Which single step is missing?', [
              { html: '<b>Rearrange so one side is 0</b> (expand and collect first). The Zero Product Law only applies when a product equals 0.', right: true },
              { html: 'Divide both sides by ' + t(sh.k) + ' first.', why: 'Then the product would equal 1 — still not 0, so the law still doesn’t apply.', code: 'divide' },
              { html: 'Check the answers by substituting them.', why: 'Checking shows the answers are wrong, but it isn’t the missing step that makes the method work.', code: 'check' },
              { html: 'Take the square root of both sides first.', why: 'The left side isn’t a perfect square. You need 0 on one side.', code: 'root' }],
              'Missing step: <b>rearrange so one side is 0</b> (expand and collect first). The Zero Product Law only applies when a product equals 0; it says nothing about a product of ' + t(sh.k) + '.', ['What does the Zero Product Law need on the right side?'], 'missing step: make one side 0');
          } },
          { id: 'e16c', level: 'PRG', make: function (r, sh) {
            var fs = [L(1, -sh.u), L(1, sh.v)], E = prod(fs), O = prod([L(1, -sh.p), L(1, sh.q)]);
            return solvePart('Solve the equation correctly.', [sh.u, -sh.v], { fs: fs, hints: H_RE, text: 'solve (x-p)(x+q)=k correctly',
              wrong: [[[sh.k + sh.p, sh.k - sh.q], 'not-zero', 'Those are the student’s answers, and they don’t work. ' + notZeroHint]],
              sol: steps(['\\text{Expand: }' + tx(O) + '=' + sh.k, polyEq(E)].concat(trin(fs[0], fs[1])).concat(zl(fs))) + '<br>So ' + t(ans('x', [sh.u, -sh.v])) + '.<br>Check: ' + t('(' + sh.u + '-' + sh.p + ')(' + sh.u + '+' + sh.q + ')=(' + (sh.u - sh.p) + ')(' + (sh.u + sh.q) + ')=' + sh.k) + ' ✓' });
          } }] },
      { num: '17', stem: function (sh) { return 'Asked to solve ' + t(sh.a + 'x^{2}=' + sh.a * sh.n + 'x') + ', a student wrote ' + t('\\dfrac{' + sh.a + 'x^{2}}{' + sh.a + 'x}=\\dfrac{' + sh.a * sh.n + 'x}{' + sh.a + 'x}\\ \\Rightarrow\\ x=' + sh.n) + '.'; },
        shared: function (r) { return { a: r.int(2, 6), n: r.int(2, 9) }; },
        parts: [
          { id: 'e17a', level: 'BEG', make: function (r, sh) {
            return numPart('The answer ' + t('x=' + sh.n) + ' is correct, but the solution is incomplete. What other value of ' + t('x') + ' satisfies the equation?', 0, [[-sh.n, 'sign', 'Substitute ' + t('x=-' + sh.n) + ': the left side is positive and the right side is negative. Try a simpler number.'], [sh.a, 'given-x', 'Substitute it: ' + t(sh.a + '(' + sh.a + ')^{2}') + ' vs ' + t(sh.a * sh.n + '(' + sh.a + ')') + '. Think about which number the student divided by.']],
              'Try ' + t('x=0') + ': left ' + t(sh.a + '(0)^{2}=0') + ', right ' + t(sh.a * sh.n + '(0)=0') + '. Both sides are 0, so ' + t('x=0') + ' is also a solution.', ['The student divided by ' + t(sh.a + 'x') + '. For which value of ' + t('x') + ' is that not allowed?'], 'find the lost root');
          } },
          { id: 'e17b', level: 'EMG', make: function (r, sh) {
            return mcPart(r, 'Dividing by ' + t(sh.a) + ' is safe, but dividing by ' + t('x') + ' is not. Why?', [
              { html: t(sh.a) + ' is a fixed number that is never 0, so dividing by it is always allowed. ' + t('x') + ' is a variable: when ' + t('x=0') + ' the division is undefined, and ' + t('x=0') + ' happens to be a solution.', right: true },
              { html: 'Dividing by ' + t('x') + ' is fine as long as you do the same to both sides.', why: 'Doing it to both sides doesn’t help when ' + t('x') + ' could be 0.', code: 'both' },
              { html: 'Both divisions are fine; the student made an arithmetic slip.', why: 'The arithmetic is right — ' + t('x=' + sh.n) + ' checks. A solution was lost, not miscalculated.', code: 'slip' },
              { html: 'Dividing by ' + t(sh.a) + ' is the unsafe step, because it changes the coefficients.', why: 'Dividing by a nonzero constant gives an equivalent equation. The danger is dividing by something that could be 0.', code: 'const' }],
              t(sh.a) + ' is a fixed number that is never 0, so dividing by it is always allowed. ' + t('x') + ' is a variable: when ' + t('x=0') + ' the division is undefined, and ' + t('x=0') + ' is a solution. Dividing by the variable throws that root away.', ['Which of the two can be 0?'], 'divide by constant vs variable');
          } },
          { id: 'e17c', level: 'EMG', make: function (r, sh) {
            return solvePart('Redo the question by factoring, and state the complete solution.', [0, sh.n], { fs: [L(1, -sh.n)], hints: ['Subtract ' + t(sh.a * sh.n + 'x') + ' from both sides, then take out the common factor ' + t(sh.a + 'x') + '.'], text: 'solve ax^2=anx by factoring',
              sol: steps([sh.a + 'x^{2}-' + sh.a * sh.n + 'x=0', '\\text{Common factor } ' + sh.a + 'x:\\ ' + sh.a + 'x(x-' + sh.n + ')=0', sh.a + 'x=0' + IMP + 'x=0', 'x-' + sh.n + '=0' + IMP + 'x=' + sh.n]) + '<br>So ' + t(ans('x', [0, sh.n])) + '.' });
          } }] },
      /* ================= EP Part H ================= */
      { num: '18', section: 'Extra practice H — Stretch', stem: function (sh) { return 'A student claims that two consecutive even integers have a product of ' + t(sh.P) + '.'; },
        shared: function (r) { var m = r.pick([3, 5, 7, 9, 11, 13]); return { m: m, P: m * (m + 2) }; },
        parts: [
          { id: 'e18a', level: 'PRG', make: function (r, sh) {
            var m = sh.m, fs = [L(1, m + 2), L(1, -m)];
            return solvePart('Let the smaller integer be ' + t('n') + '. Form a polynomial equation and solve it by factoring.', [m, -(m + 2)], { v: 'n', fs: fs, hints: ['The next consecutive even integer is ' + t('n+2') + ': ' + t('n(n+2)=' + sh.P) + '.', 'Expand, move ' + t(sh.P) + ' to the left, and factor.'], text: 'consecutive even product roots',
              sol: steps(['n(n+2)=' + sh.P, 'n^{2}+2n-' + sh.P + '=0'].concat(trin(fs[0], fs[1], 'n')).concat(zl(fs, 'n'))) + '<br>So ' + t('n=' + m + ',\\ n=-' + (m + 2)) + '.' });
          } },
          { id: 'e18b', level: 'EMG', make: function (r, sh) {
            var m = sh.m;
            return mcPart(r, 'Test each root against the conditions in the problem. What do you conclude about the student’s claim?', [
              { html: 'Both roots give <b>odd</b> integers (' + t(m) + ' and ' + t(m + 2) + ', or ' + t(-(m + 2)) + ' and ' + t(-m) + '), so both are rejected: the claim is false.', right: true },
              { html: 'Keep ' + t('n=' + m) + ': ' + t(m + '\\times' + (m + 2) + '=' + sh.P) + ', so the claim is true.', why: 'The product is right, but ' + t(m) + ' and ' + t(m + 2) + ' are odd, not even.', code: 'pos' },
              { html: 'Keep ' + t('n=-' + (m + 2)) + ': negative numbers can be even.', why: 'Negative numbers can be even, but ' + t(-(m + 2)) + ' isn’t. Check divisibility by 2.', code: 'neg' },
              { html: 'Both roots are valid, because both satisfy the equation.', why: 'Satisfying the equation isn’t enough — the problem says the integers are <b>even</b>.', code: 'both' }],
              t('n=' + m) + ' gives ' + t(m) + ' and ' + t(m + 2) + ': both odd. <b>Reject.</b><br>' + t('n=-' + (m + 2)) + ' gives ' + t(-(m + 2)) + ' and ' + t(-m) + ': both odd. <b>Reject.</b><br>Both roots fail, so the claim is false. (Also, a product of two even numbers is always even, and ' + t(sh.P) + ' is odd.)', ['Are the integers each root gives even?'], 'consecutive even claim conclusion');
          } },
          { id: 'e18c', level: 'EMG', make: function (r, sh) {
            return mcPart(r, 'How can the equation have solutions while the problem it came from has none?', [
              { html: 'The equation only records “a number times two more than it is ' + t(sh.P) + '”. The condition that the numbers be <b>even</b> never made it into the equation, so every root must still be tested against the wording.', right: true },
              { html: 'The equation was set up wrong: it should be ' + t('n(n+1)=' + sh.P) + '.', why: 'Consecutive <b>even</b> integers differ by 2, so ' + t('n(n+2)') + ' is right.', code: 'setup' },
              { html: 'Factoring always produces at least one false root.', why: 'Factoring gives the roots of the equation exactly. The problem is what the equation leaves out.', code: 'factoring' },
              { html: 'Quadratic equations from word problems never have valid roots.', why: 'Many do (Questions 12–15). This one fails because of a condition the equation can’t see.', code: 'never' }],
              'The equation only records the arithmetic. The condition that the numbers be <b>even</b> never made it into the equation, so each root must be tested against the wording — and here every root fails.', ['What information from the problem is not in the equation?'], 'equation vs problem conditions');
          } }] },
      { num: '19', stem: 'An equation has <b>exactly one</b> distinct solution when the polynomial factors as a perfect square. Find every integer value of the unknown constant that makes each equation have exactly one solution.', parts: [
        { id: 'e19a', level: 'ADV', make: function (r) {
          var n = r.int(2, 12);
          return solvePart(t('x^{2}+kx+' + n * n + '=0'), [2 * n, -2 * n], { v: 'k', fs: [L(1, -2 * n)], hints: ['The square must be ' + t('(x+' + n + ')^{2}') + ' or ' + t('(x-' + n + ')^{2}') + ', since ' + t(n * n + '=' + n + '^{2}') + '.', 'The middle term of ' + t('(x\\pm' + n + ')^{2}') + ' is ' + t('2(x)(\\pm' + n + ')') + '.'], text: 'k for perfect square x^2+kx+n^2',
            wrong: [[[2 * n], 'pm-k', t('(x-' + n + ')^{2}') + ' is also a perfect square. What value of ' + t('k') + ' gives it?'], [[-2 * n], 'pm-k', t('(x+' + n + ')^{2}') + ' is also a perfect square. What value of ' + t('k') + ' gives it?'], [[n, -n], 'no-double', 'The middle term of ' + t('(x+' + n + ')^{2}') + ' is ' + t('2(' + n + ')x') + ' — don’t forget the 2.'], [[n * n, -n * n], 'no-double', 'Expand ' + t('(x+' + n + ')^{2}') + ' and read off the ' + t('x') + ' coefficient.']],
            sol: steps([n * n + '=' + n + '^{2},\\ \\text{so the square is }(x\\pm' + n + ')^{2}', '\\text{Middle term } =2(x)(\\pm' + n + ')=\\pm' + 2 * n + 'x', 'k=' + 2 * n + ':\\ (x+' + n + ')^{2}=0,\\ x=-' + n, 'k=-' + 2 * n + ':\\ (x-' + n + ')^{2}=0,\\ x=' + n]) + '<br>So ' + t('k=\\pm' + 2 * n) + '.' });
        } },
        { id: 'e19b', level: 'PRG', make: function (r) {
          var p = r.int(3, 12);
          var part = numPart(t('x^{2}-' + 2 * p + 'x+k=0'), p * p, [[p, 'no-square', 'Halve the middle coefficient, then <b>square</b> it: the square is ' + t('(x-' + p + ')^{2}') + '.'], [4 * p * p, 'full-square', 'Square <b>half</b> of the middle coefficient, not the whole ' + t(2 * p) + '.'], [-p * p, 'sign', t('(x-' + p + ')^{2}') + ' has constant term ' + t('(-' + p + ')^{2}=' + p * p) + ' — positive.'], [2 * p, 'no-square', 'Halve ' + t(2 * p) + ' and square the result.']],
            steps(['-' + 2 * p + 'x=2(x)(-' + p + '),\\ \\text{so the square is }(x-' + p + ')^{2}', 'k=(-' + p + ')^{2}=' + p * p]) + '<br>' + t('(x-' + p + ')^{2}=0') + ' gives the single solution ' + t('x=' + p) + '.', ['The middle term fixes the square: ' + t('-' + 2 * p + 'x=2(x)(-' + p + ')') + '.'], 'k for perfect square x^2-bx+k');
          part.input.before = t('k='); return part;
        } },
        { id: 'e19c', level: 'ADV', make: function (r) {
          var u = gen(function () { var a = r.int(2, 5), b = r.int(1, 9); return cop(a, b) ? { a: a, b: b } : null; }), a = u.a, b = u.b, k = 2 * a * b;
          return solvePart(t(a * a + 'x^{2}+kx+' + b * b + '=0'), [k, -k], { v: 'k', fs: [L(1, -k)], hints: ['Write the first and last terms as squares: ' + t(a * a + 'x^{2}=(' + a + 'x)^{2}') + ' and ' + t(b * b + '=' + b + '^{2}') + '.', 'The middle term of ' + t('(' + a + 'x\\pm' + b + ')^{2}') + ' is ' + t('2(' + a + 'x)(\\pm' + b + ')') + '.'], text: 'k for perfect square a^2x^2+kx+b^2',
            wrong: [[[k], 'pm-k', t('(' + a + 'x-' + b + ')^{2}') + ' is also a perfect square. What value of ' + t('k') + ' gives it?'], [[-k], 'pm-k', t('(' + a + 'x+' + b + ')^{2}') + ' is also a perfect square.'], [[a * b, -a * b], 'no-double', 'The middle term is ' + t('2(' + a + 'x)(' + b + ')') + ' — don’t forget the 2.'], [[2 * b, -2 * b], 'no-double', 'Use the square root of ' + t(a * a + 'x^{2}') + ', which is ' + t(a + 'x') + ', in ' + t('2(' + a + 'x)(' + b + ')') + '.']],
            sol: steps([a * a + 'x^{2}=(' + a + 'x)^{2},\\ ' + b * b + '=' + b + '^{2}', '\\text{Middle term } =2(' + a + 'x)(\\pm' + b + ')=\\pm' + k + 'x', 'k=' + k + ':\\ (' + a + 'x+' + b + ')^{2}=0,\\ x=' + rt([-b, a]), 'k=-' + k + ':\\ (' + a + 'x-' + b + ')^{2}=0,\\ x=' + rt([b, a])]) + '<br>So ' + t('k=\\pm' + k) + '.' });
        } }] },
      { num: '20', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: 'e20', level: 'EMG', make: function (r) {
          var a = r.int(2, 5), n = r.int(2, 7);
          return mcPart(r, 'The complete solution to ' + t(a + 'x^{3}=' + a * n * n + 'x') + ' is', [
            { html: t('x=' + n), why: 'That divides by ' + t(a + 'x') + ' (losing ' + t('x=0') + ') and keeps only the positive square root.', code: 'one' },
            { html: t('x=\\pm' + n), why: 'Dividing by ' + t(a + 'x') + ' lost ' + t('x=0') + '. Factor it out instead.', code: 'pm' },
            { html: t('x=0,\\ ' + n), why: t('x^{2}-' + n * n) + ' factors again and gives two solutions.', code: 'stop' },
            { html: t('x=0,\\ \\pm' + n), right: true }],
            steps([a + 'x^{3}-' + a * n * n + 'x=0', a + 'x(x^{2}-' + n * n + ')=0', a + 'x(x-' + n + ')(x+' + n + ')=0']) + '<br>So ' + t('x=0,\\ \\pm' + n) + '. The answers ' + t('x=' + n) + ' and ' + t('x=\\pm' + n) + ' come from dividing by ' + t(a + 'x') + '; ' + t('x=0,\\ ' + n) + ' stops before factoring ' + t('x^{2}-' + n * n) + '.',
            ['Move everything to one side and factor completely.'], 'MC ax^3=bx');
        } }] },
      { num: '21', stem: '<i>(Numerical Response)</i>', parts: [
        { id: 'e21', level: 'PRG', make: function (r) {
          var s = gen(function () { var b = 2 * r.int(0, 4) + 1, a = r.int(1, 10); return a % 3 !== 0 && 3 * b - 2 * a !== 0 ? { a: a, b: b } : null; });
          var f1 = L(2, s.b), f2 = L(3, -s.a), E = prod([f1, f2]);
          return nrPart('The equation ' + t(polyEq(E)) + ' has solutions ' + t('x=\\tfrac{a}{3}') + ' and ' + t('x=-\\tfrac{b}{2}') + ', where ' + t('a') + ' and ' + t('b') + ' are positive integers. The value of ' + t('a+b') + ' is ________.', s.a + s.b,
            [[Math.abs(s.a - s.b), 'sign', 'Add ' + t('a') + ' and ' + t('b') + ' — both are positive.'], [s.a * s.b, 'formula', 'The question asks for ' + t('a+b') + ', not the product.']],
            steps(trin(f2, f1).concat(zl([f1, f2]))) + '<br>Matching ' + t('x=\\tfrac{a}{3}') + ' and ' + t('x=-\\tfrac{b}{2}') + ' gives ' + t('a=' + s.a + ',\\ b=' + s.b) + ', so ' + t('a+b=' + (s.a + s.b)) + '.',
            ['Factor by decomposition and solve.', 'Write each solution with the denominator the question uses.'], 'NR a+b from roots');
        } }] }
    ]
  });

  /* ---------- generators used by Extra practice Q2 and Q4 (hoisted function declarations) ---------- */
  /* (x + b1)(x + b2) = k whose rearranged form factors as (x − u)(x + v); sgn: +1 → b1 > 0 > b2, −1 → b1 < 0 < b2 */
  function refactorMonic(r, sgn) {
    var s = gen(function () {
      var u = r.int(2, 9), v = r.int(2, 9); if (u === v) return null;
      var M = v - u, b1 = sgn * r.int(1, 6), b2 = M - b1; if (sgn * b2 >= 0 || b2 === 0) return null;
      var k = b1 * b2 + u * v; return k > 0 && k <= 40 ? { u: u, v: v, b1: b1, b2: b2, k: k } : null;
    });
    var o1 = L(1, s.b1), o2 = L(1, s.b2), fs = [L(1, -s.u), L(1, s.v)], E = prod(fs);
    return solvePart(t(prodTex([o1, o2]) + '=' + s.k), [s.u, -s.v], { fs: fs, hints: H_RE, text: 'solve (x+a)(x+b)=k',
      wrong: [[[s.k - s.b1, s.k - s.b2], 'not-zero', notZeroHint]],
      sol: steps(['\\text{Expand: }' + tx(prod([o1, o2])) + '=' + s.k, '\\text{Rearrange: }' + polyEq(E)].concat(trin(fs[0], fs[1])).concat(zl(fs))) + '<br>So ' + t(ans('x', [s.u, -s.v])) + '.' });
  }
  /* (a x + b1)(x + b2) = k whose rearranged form factors as (a x + e1)(x + e2) */
  function refactorNonMonic(r, as) {
    var s = gen(function () {
      var a = r.pick(as), e1 = r.int(-9, 9), e2 = r.int(-6, 6); if (!e1 || !e2 || !cop(a, e1) || e1 % a === 0) return null;
      var b2 = r.pick([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]), b1 = a * (e2 - b2) + e1, k = b1 * b2 - e1 * e2;
      return b1 && k && Math.abs(k) <= 40 && b2 !== e2 && a * e2 + e1 !== 0 ? { a: a, e1: e1, e2: e2, b1: b1, b2: b2, k: k } : null;
    });
    var o1 = L(s.a, s.b1), o2 = L(1, s.b2), f1 = L(s.a, s.e1), f2 = L(1, s.e2), E = prod([f1, f2]), roots = [froot(f1), froot(f2)];
    return solvePart(t(prodTex([o1, o2]) + '=' + s.k), roots, { fs: [f1, f2], hints: H_RE, text: 'solve (ax+b)(x+c)=k',
      wrong: [[[[s.k - s.b1, s.a], s.k - s.b2], 'not-zero', notZeroHint]],
      sol: steps(['\\text{Expand: }' + tx(prod([o1, o2])) + '=' + s.k, '\\text{Rearrange: }' + polyEq(E)].concat(trin(f2, f1)).concat(zl([f1, f2]))) + '<br>So ' + t(ans('x', roots)) + '.' });
  }
  /* (a1 x + b1)(a2 x − b2): a x² + b x = c with two fractional roots */
  function twoFrac(r, pairs, bmax, text) {
    var s = gen(function () {
      var pr = r.pick(pairs), a1 = pr[0], a2 = pr[1], b1 = r.int(1, bmax), b2 = r.int(1, bmax);
      if (!cop(a1, b1) || b1 % a1 === 0 || !cop(a2, b2) || b2 % a2 === 0 || a2 * b1 - a1 * b2 === 0) return null;
      return { a1: a1, a2: a2, b1: b1, b2: b2 };
    });
    var f1 = L(s.a1, s.b1), f2 = L(s.a2, -s.b2), E = prod([f1, f2]), M = s.a2 * s.b1 - s.a1 * s.b2, c = s.b1 * s.b2, roots = [froot(f1), froot(f2)];
    return solvePart(t(P.seq([mono(s.a1 * s.a2, 'x', 2), mono(M)]) + '=' + c), roots, { fs: [f1, f2], hints: H_RE, text: text,
      sol: steps(['\\text{Rearrange: }' + polyEq(E)].concat(trin(f2, f1)).concat(zl([f1, f2]))) + '<br>So ' + t(ans('x', roots)) + '.' });
  }
})(window);
