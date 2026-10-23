/* Math 10C · Unit 4 · Lesson 2 — Common Factors: Binomial Common Factors and Grouping (AN5)
 * Assignment questions 1–9 (u4_L02.tex) and the binomial-common-factor / grouping half of the Lessons 1–2 Extra Practice
 * (u4_EP01.tex Questions 7, 8, 9, 10, 13, 16, 17; the GCF-of-monomials half goes with Lesson 1).
 * Every part is a generator that keeps the booklet question's structure (which bracket is common, the sign pattern,
 * hidden 1s, opposite brackets that need a sign flip, the booklet's term order, rearranging before grouping) and
 * changes the numbers; the booklet's own numbers are among the possible values.
 * Factored answers are built from their factors (so the key is always right) and graded by K.factored; the classic
 * wrong answers (sign slip in the second bracket, the hidden 1 dropped, opposite brackets treated as equal, the leftover
 * common factor dropped, the common bracket taken out twice) are computed from the generated numbers and given
 * targeted hints through opt.wrong. Levels: LIM BEG EMG PRG ADV MAS. */
(function (root) {
  'use strict';
  var HW = root.HW, K = HW.kit, t = K.t, B = K.P, P = HW.poly, FX = HW.factor, gcd = HW.ex.gcd;

  HW.addCodes({
    'bcf-sign': 'Wrong sign in the leftover bracket', 'lost-one': 'Dropped the hidden 1', 'lost-gcf': 'Dropped the common factor taken out of the bracket',
    'not-flipped': 'Treated opposite brackets as the same', 'bin-twice': 'Took the common bracket out twice', 'pair-sign': 'Wrong sign on the factor taken out of a pair',
    'kept-error': 'Repeated the student’s error', 'gave-given': 'Gave the factor that was already shown', 'gave-j': 'Gave the number in the second bracket instead of the constant',
    'gave-coef': 'Gave a coefficient instead of the constant', added: 'Added instead of multiplied', 'leftover-b': 'Lost a term of the leftover bracket',
    'leftover-dist': 'Leftover bracket not distributed correctly', 'leftover-sign': 'Sign error in the leftover bracket'
  });

  /* ---------------- building blocks ---------------- */
  function pickWhere(gen, okf) { for (var i = 0; i < 3000; i++) { var o = gen(); if (okf(o)) return o; } throw new Error('u4l2: no valid numbers'); }
  function cop(a, b) { return gcd(Math.abs(a), Math.abs(b)) === 1; }
  function isSq(n) { var s = Math.round(Math.sqrt(n)); return n > 0 && s * s === n; }
  function M(c, s) { return P.scale(s ? P.parse(s) : P.num(1), c); }
  function sum(list) { return P.add.apply(null, list); }
  function seq(list) { return P.seq(list); }
  function br(list) { return '(' + seq(list) + ')'; }
  function neg(m) { return P.neg(m); }
  function isNeg(m) { var ts = P.sorted(m); return ts.length && ts[0].c[0] < 0; }
  function isUnit(m) { return P.count(m) === 1 && !P.vars(m).length && Math.abs(P.constant(m)[0]) === 1 && P.constant(m)[1] === 1; }
  /* monomial times an already-bracketed factor, with the sign written when it is not the first term */
  function times(m, inner, first) { var s = P.tex(m); if (!first && s.charAt(0) !== '-') s = '+' + s; return s + inner; }
  function F1(p) { return { p: p, k: 1 }; }

  /* a factored part: drops wrong entries that coincide with the target (or each other), and tests them as `bad` */
  function fpart(prompt, target, keyTex, ws, sol, hints, text, good) {
    var T = FX.product(target), seen = [];
    ws = (ws || []).filter(function (w) {
      if (!w || P.eq(w.is, T)) return false;
      for (var i = 0; i < seen.length; i++) if (P.eq(seen[i], w.is)) return false;
      seen.push(w.is); return true;
    });
    var p = B.factored(prompt, target, { wrong: ws.map(function (w) { return { is: w.is, code: w.code, hint: w.hint }; }), keyTex: keyTex }, sol, hints, text);
    p.bad = ws.map(function (w) { return w.tex; }).filter(Boolean);
    p.good = (good || []).filter(Boolean);
    return p;
  }

  var BCF_HINTS = ['Find the bracket that multiplies <b>both</b> terms and take it out in front, exactly as you would a common monomial.',
    'What multiplies the bracket in each term (with its sign) goes in the second bracket. Then check that bracket for a common factor of its own.'];
  var GRP_HINTS = ['Group the first two terms and the last two terms, and take a common factor out of each pair.',
    'Choose the sign of what you take out of the second pair so that both brackets match, then take out the common bracket.'];

  /* ---- binomial common factor.
   *  o.shown: LaTeX of the question; o.A: [a1, a2] the common binomial (in the order written); o.c: [c1, c2] what
   *  multiplies it in each term (after any flip); o.g, o.inner: a common factor of c1, c2 and what is left;
   *  o.flip: { from: LaTeX of the opposite bracket as written, c: its coefficient as written, note } ---- */
  function bcf(o) {
    var A = sum(o.A), At = br(o.A), C = sum(o.c), Ct = br(o.c), g = o.g || null;
    var In = g ? sum(o.inner) : C, It = g ? br(o.inner) : Ct;
    if (g && !P.eq(P.mul(g, In), C)) throw new Error('u4l2: leftover bracket does not match');
    var key = (g ? P.tex(g) : '') + At + It, target = g ? [F1(g), F1(A), F1(In)] : [F1(A), F1(C)];
    var lines = [];
    if (o.flip) lines.push(o.flip.note || (t('(' + o.flip.from + ')') + ' and ' + t(At) + ' are opposites, so ' + t(times(o.flip.c, '(' + o.flip.from + ')', true) + '=' + times(neg(o.flip.c), At, true)) + '.'));
    if (o.hidden) lines.push(o.hidden);
    lines.push(t(At) + ' is common to both terms:<br>' + t(times(o.c[0], At, true) + times(o.c[1], At, false) + '=' + At + Ct));
    if (g) lines.push('The bracket ' + t(Ct) + ' still has a common factor of ' + t(P.tex(g)) + ':<br>' + t('=' + key));
    else lines.push(t(Ct) + ' has no common factor, so the answer is ' + t(key) + '.');
    var ws = [];
    if (o.flip) ws.push({ is: P.mul(A, sum([o.c[0], o.flip.c])), tex: At + br([o.c[0], o.flip.c]), code: 'not-flipped', hint: t('(' + o.flip.from + ')') + ' and ' + t(At) + ' are <b>opposites</b>, not the same bracket. Rewrite ' + t(o.flip.term || times(o.flip.c, '(' + o.flip.from + ')', true)) + ' using ' + t(At) + ' first — the sign in front changes.' });
    ws.push({ is: P.mul(A, sum([o.c[0], neg(o.c[1])])), tex: At + br([o.c[0], neg(o.c[1])]), code: 'bcf-sign', hint: 'Check the signs in your second bracket: each term keeps the sign of what multiplied ' + t(At) + ' in the question' + (o.flip ? ' (after the opposite bracket has been flipped)' : '') + '.' });
    if (isUnit(o.c[1])) ws.push({ is: P.mul(A, o.c[0]), tex: P.tex(o.c[0]) + At, code: 'lost-one', hint: 'Don’t lose the ' + t('1') + ': ' + t(times(o.c[1], At, true).replace(/^(-?)1\(/, '$1(')) + ' means ' + t(times(o.c[1], At, true)) + ', so when the bracket comes out a ' + t(P.tex(o.c[1])) + ' is left behind. Check by expanding.' });
    if (g) ws.push({ is: P.mul(A, In), tex: At + It, code: 'lost-gcf', hint: 'Your factors are missing the common factor ' + t(P.tex(g)) + '. If you take it out of the second bracket, write it in front of the answer.' });
    ws.push({ is: P.mul(A, A, C), tex: At + '^{2}' + Ct, code: 'bin-twice', hint: 'The bracket ' + t(At) + ' is a common factor of both terms: take it out <b>once</b>. What multiplies it in each term goes in the second bracket.' });
    return { key: key, target: target, sol: lines.join('<br>'), ws: ws, good: [(g ? P.tex(g) : '') + It + At] };
  }
  function bcfPart(o, text) { var b = bcf(o); return fpart(t(o.shown), b.target, b.key, b.ws, b.sol, BCF_HINTS, text, b.good); }

  /* ---- factoring by grouping. o.A: [a1, a2] the common binomial; o.B: [b1, b2] the other factor (b1 comes out of the
   *  first pair, b2 out of the second). Terms in grouping order: a1b1, a2b1, a1b2, a2b2. o.show: the order the
   *  question lists them in (rearranging questions). ---- */
  function grouping(o) {
    var T4 = [P.mul(o.A[0], o.B[0]), P.mul(o.A[1], o.B[0]), P.mul(o.A[0], o.B[1]), P.mul(o.A[1], o.B[1])];
    var show = o.show || [0, 1, 2, 3], shown = seq(show.map(function (i) { return T4[i]; }));
    var A = sum(o.A), Bp = sum(o.B), At = br(o.A), Bt = br(o.B), same = P.eq(A, Bp);
    var key = same ? At + '^{2}' : At + Bt, target = same ? [{ p: A, k: 2 }] : [F1(A), F1(Bp)];
    var lines = [], negs = [];
    if (o.show) lines.push('Rearrange first, so that each pair has a common factor:<br>' + t(shown + '=' + seq(T4)));
    lines.push('Group the terms in pairs: ' + t('(' + seq(T4.slice(0, 2)) + ')+(' + seq(T4.slice(2)) + ')'));
    if (isNeg(o.B[0])) negs.push('take out ' + t(P.tex(o.B[0])) + ' from the first pair');
    if (isNeg(o.B[1])) negs.push('take out ' + t(P.tex(o.B[1])) + ' (negative) from the second pair');
    lines.push('Take a common factor out of each pair' + (negs.length ? ' — ' + negs.join(' and ') + ' so the brackets match' : '') + ':<br>' + t('=' + times(o.B[0], At, true) + times(o.B[1], At, false)));
    lines.push('Take out the common binomial ' + t(At) + ':<br>' + t('=' + (same ? At + At + '=' + key : key)));
    var ws = [{ is: P.mul(A, sum([o.B[0], neg(o.B[1])])), tex: At + br([o.B[0], neg(o.B[1])]), code: 'pair-sign', hint: 'Check the sign of the factor you took out of the second pair: multiply it back into ' + t(At) + ' — do you get ' + t(seq(T4.slice(2))) + '?' }];
    if (!same) ws.push({ is: P.mul(A, A), tex: At + '^{2}', code: 'bin-twice', hint: 'The bracket ' + t(At) + ' appears in both groups, but it is <b>one</b> factor: take it out once. The other factor is made of the two monomials you took out of the pairs.' });
    if (isUnit(o.B[1])) ws.push({ is: P.mul(A, o.B[0]), tex: P.tex(o.B[0]) + At, code: 'lost-one', hint: 'Don’t lose the ' + t('1') + ': the second pair is ' + t(times(o.B[1], At, true)) + ', so a ' + t(P.tex(o.B[1])) + ' belongs in the second factor.' });
    if (isUnit(o.B[0])) ws.push({ is: P.mul(A, o.B[1]), tex: P.tex(o.B[1]) + At, code: 'lost-one', hint: 'Don’t lose the ' + t('1') + ': the first pair is ' + t(times(o.B[0], At, true)) + ', so a ' + t(P.tex(o.B[0])) + ' belongs in the second factor.' });
    return { shown: shown, key: key, target: target, T4: T4, A: A, Bp: Bp, At: At, Bt: Bt, sol: lines.join('<br>'), ws: ws, good: [same ? At + At : Bt + At] };
  }
  function groupPart(o, text, hints) { var g = grouping(o); return fpart(t(g.shown), g.target, g.key, g.ws, g.sol, hints || GRP_HINTS, text, g.good); }
  var REARR_HINTS = ['Pairing the terms as they stand doesn’t give matching brackets. Move the terms so that each pair shares a factor (for example, put the two terms that contain the same letter together).',
    'Then take a common factor out of each pair — negative if needed — and take out the common bracket.'];

  /* letter sets for the all-letter questions */
  var LET4 = [['m', 'n', 'x', 'y'], ['a', 'b', 'x', 'y'], ['p', 'q', 'r', 's'], ['a', 'b', 'c', 'd'], ['m', 'n', 'p', 'q']];

  /* ---------------- Q5: find the error (shared numbers for the error and the fix) ---------------- */
  function q5Shared(r) {
    var a5 = pickWhere(function () { return { a: r.int(2, 9), c: r.int(2, 9) }; }, function (o) { return o.a !== o.c; });
    var b5 = pickWhere(function () { return { p: r.int(2, 5), q: r.int(2, 7), r: r.int(2, 9) }; }, function (o) { return cop(o.p, o.r) && o.r !== o.p * o.q && o.q !== o.r; });
    var c5 = { k: r.int(2, 7), b: r.int(2, 9) };
    return { a: a5, b: b5, c: c5 };
  }
  function q5Err(r, sh, w) {
    var o = sh[w], shown, opts, sol;
    if (w === 'a') {
      var a = o.a, c = o.c;
      shown = 'm^{2}-' + a + 'm-' + a * c + '+' + c + 'm=m(m-' + a + ')-' + c + '(' + a + '-m)=(m-' + a + ')(m-' + c + ')';
      opts = [{ html: t('(' + a + '-m)') + ' and ' + t('(m-' + a + ')') + ' are opposites, so ' + t('-' + c + '(' + a + '-m)=+' + c + '(m-' + a + ')') + '. A sign was dropped in the last step: the second factor should be ' + t('(m+' + c + ')') + '.', right: true },
        { html: 'The first step is wrong: ' + t('-' + a * c + '+' + c + 'm') + ' should be ' + t('-' + c + '(' + a + '+m)') + '.', why: 'Expand the student’s ' + t('-' + c + '(' + a + '-m)') + ': you get ' + t('-' + a * c + '+' + c + 'm') + ', exactly the last two terms. The first step is correct.' },
        { html: 'The terms must be rearranged first; this polynomial can’t be grouped in the order given.', why: 'Grouping in the order given works: the two brackets ' + t('(m-' + a + ')') + ' and ' + t('(' + a + '-m)') + ' differ only by a sign.' },
        { html: 'There is no error.', why: 'Expand ' + t('(m-' + a + ')(m-' + c + ')') + ': the constant term is ' + t('+' + a * c) + ', but the original has ' + t('-' + a * c) + '.' }];
      sol = 'The first line is right: ' + t('m(m-' + a + ')-' + c + '(' + a + '-m)') + ' expands to the original. But ' + t('(' + a + '-m)=-(m-' + a + ')') + ', so ' + t('-' + c + '(' + a + '-m)=+' + c + '(m-' + a + ')') + '. The student flipped the bracket without changing the sign in front.';
    } else if (w === 'b') {
      var p = o.p, q = o.q, rr = o.r;
      shown = p + 'x^{2}+' + p * q + 'x-' + rr + 'x-' + rr * q + '=' + p + 'x(x+' + q + ')-' + rr + '(x-' + q + ')';
      opts = [{ html: 'Sign error in the second pair: ' + t('-' + rr + 'x-' + rr * q + '=-' + rr + '(x+' + q + ')') + ', not ' + t('-' + rr + '(x-' + q + ')') + '. The brackets do match.', right: true },
        { html: 'The first pair is wrong: ' + t(p + 'x^{2}+' + p * q + 'x=' + p + 'x(x-' + q + ')') + '.', why: 'Expand ' + t(p + 'x(x+' + q + ')') + ': you get ' + t(p + 'x^{2}+' + p * q + 'x') + '. The first pair is right.' },
        { html: 'There is no error: the brackets are different, so it cannot be factored by grouping.', why: 'Expand ' + t('-' + rr + '(x-' + q + ')') + ': you get ' + t('-' + rr + 'x+' + rr * q) + ', but the last two terms are ' + t('-' + rr + 'x-' + rr * q) + '. Redo the second pair.' },
        { html: 'The student should have taken ' + t('+' + rr) + ' out of the second pair instead of ' + t('-' + rr) + '.', why: 'Taking out ' + t('+' + rr) + ' leaves ' + t('(-x-' + q + ')') + ', which still doesn’t match ' + t('(x+' + q + ')') + '. Taking out ' + t('-' + rr) + ' is right — the mistake is inside the bracket.' }];
      sol = t('-' + rr + '(x-' + q + ')=-' + rr + 'x+' + rr * q) + ', which is not the second pair. Taking ' + t('-' + rr) + ' out of ' + t('-' + rr + 'x-' + rr * q) + ' gives ' + t('-' + rr + '(x+' + q + ')') + ', so the brackets <b>do</b> match and the polynomial factors.';
    } else {
      var k = o.k, b = o.b;
      shown = k + 'a(a-' + b + ')+(a-' + b + ')=(a-' + b + ')(' + k + 'a)';
      opts = [{ html: 'The second term is ' + t('1(a-' + b + ')') + ', so a ' + t('1') + ' must be left behind: the second factor is ' + t('(' + k + 'a+1)') + '.', right: true },
        { html: 'The common factor should be ' + t('(a-' + b + ')^{2}') + ', because ' + t('(a-' + b + ')') + ' appears twice.', why: 'A common factor appears in <b>each</b> term; here each term has ' + t('(a-' + b + ')') + ' once, so it comes out once.' },
        { html: 'The second factor should be ' + t('(' + k + 'a-1)') + '.', why: 'The second term is ' + t('+(a-' + b + ')=+1(a-' + b + ')') + ', so what is left is ' + t('+1') + ', not ' + t('-1') + '.' },
        { html: 'There is no error.', why: 'Expand ' + t('(a-' + b + ')(' + k + 'a)') + ': you get only ' + t(k + 'a^{2}-' + k * b + 'a') + ' — the ' + t('a-' + b) + ' from the second term is missing.' }];
      sol = 'The second term is ' + t('1\\cdot(a-' + b + ')') + '. Taking out ' + t('(a-' + b + ')') + ' leaves ' + t(k + 'a') + ' from the first term and ' + t('1') + ' from the second. Expanding the student’s ' + t('(a-' + b + ')(' + k + 'a)') + ' gives only ' + t(k + 'a^{2}-' + k * b + 'a') + '.';
    }
    return B.mc(r, 'A student wrote ' + t(shown) + (w === 'b' ? ', so it cannot be factored by grouping.' : '.') + '<br>Which statement identifies the error?', opts, sol, ['Expand each step of the student’s work and compare it with the line before.'], 'find the error (' + w + ')');
  }
  function q5Fix(sh, w) {
    var o = sh[w], target, key, ws, sol, prompt;
    if (w === 'a') {
      var a = o.a, c = o.c, A = P.parse('m-' + a);
      target = [F1(A), F1(P.parse('m+' + c))]; key = '(m-' + a + ')(m+' + c + ')';
      ws = [{ is: P.mul(A, P.parse('m-' + c)), tex: '(m-' + a + ')(m-' + c + ')', code: 'kept-error', hint: 'That’s the student’s answer. ' + t('-' + c + '(' + a + '-m)') + ' becomes ' + t('+' + c + '(m-' + a + ')') + ' when you flip the bracket.' }];
      prompt = 'Write the correct factored form of ' + t('m^{2}-' + a + 'm-' + a * c + '+' + c + 'm') + '.';
      sol = t('m^{2}-' + a + 'm-' + a * c + '+' + c + 'm=m(m-' + a + ')+' + c + '(m-' + a + ')') + '<br>' + t('=' + key) + '<br>Check: ' + t(key + '=m^{2}+' + c + 'm-' + a + 'm-' + a * c) + ' ✓';
    } else if (w === 'b') {
      var p = o.p, q = o.q, rr = o.r, A2 = P.parse('x+' + q);
      target = [F1(A2), F1(P.parse(p + 'x-' + rr))]; key = '(x+' + q + ')(' + p + 'x-' + rr + ')';
      ws = [{ is: P.mul(A2, P.parse(p + 'x+' + rr)), tex: '(x+' + q + ')(' + p + 'x+' + rr + ')', code: 'pair-sign', hint: 'You took ' + t('-' + rr) + ' out of the second pair, so that is the sign it carries in the second factor.' },
        { is: P.mul(P.parse('x-' + q), P.parse(p + 'x-' + rr)), tex: '(x-' + q + ')(' + p + 'x-' + rr + ')', code: 'kept-error', hint: 'That keeps the student’s sign error: ' + t('-' + rr + 'x-' + rr * q + '=-' + rr + '(x+' + q + ')') + '.' }];
      prompt = 'Write the correct factored form of ' + t(p + 'x^{2}+' + p * q + 'x-' + rr + 'x-' + rr * q) + '.';
      sol = t(p + 'x^{2}+' + p * q + 'x-' + rr + 'x-' + rr * q + '=' + p + 'x(x+' + q + ')-' + rr + '(x+' + q + ')') + '<br>' + t('=' + key);
    } else {
      var k = o.k, b = o.b, A3 = P.parse('a-' + b);
      target = [F1(A3), F1(P.parse(k + 'a+1'))]; key = '(a-' + b + ')(' + k + 'a+1)';
      ws = [{ is: P.mul(A3, P.parse(k + 'a')), tex: '(a-' + b + ')(' + k + 'a)', code: 'kept-error', hint: 'That’s the student’s answer. The second term is ' + t('1(a-' + b + ')') + ': a ' + t('1') + ' is left behind.' },
        { is: P.mul(A3, P.parse(k + 'a-1')), tex: '(a-' + b + ')(' + k + 'a-1)', code: 'bcf-sign', hint: 'The second term is <b>plus</b> ' + t('(a-' + b + ')') + ', so the ' + t('1') + ' left behind is ' + t('+1') + '.' }];
      prompt = 'Write the correct factored form of ' + t(k + 'a(a-' + b + ')+(a-' + b + ')') + '.';
      sol = t(k + 'a(a-' + b + ')+1(a-' + b + ')=' + key) + '<br>Check: ' + t(key + '=' + k + 'a^{2}+a-' + k * b + 'a-' + b) + ' ✓';
    }
    return fpart(prompt, target, key, ws, sol, BCF_HINTS, 'correct factorization (' + w + ')');
  }

  /* ---------------- Q8 / Q9 / Extra 13(c): working backwards with a known factor ---------------- */
  function q13cShared(r) { return pickWhere(function () { return { g: r.int(1, 4), p: r.int(2, 5), q: r.int(1, 7), s: r.int(2, 9) }; }, function (o) { return cop(o.p, o.q) && cop(o.g, o.s) && o.g * o.q !== o.s * o.p && o.g !== o.s; }); }
  function q13cShown(o) { return seq([M(o.g * o.p, 'x^{2}'), M(o.g * o.q, 'x'), M(o.s * o.p, 'x')]) + '+k'; }

  /* ---------------- Extra 16: shared ---------------- */
  function e16Shared(r) { return pickWhere(function () { return { c: r.int(2, 5), d: r.int(1, 7), s: r.int(2, 5), r: r.int(1, 7) }; }, function (o) { return cop(o.c, o.d) && cop(o.s, o.r) && !(o.c === o.s && o.d === o.r) && o.s * o.d !== o.r * o.c; }); }
  function e16Line(o) { return o.s + 'a(' + o.c + 'a-' + o.d + ')+' + o.r + '(' + o.d + '-' + o.c + 'a)'; }
  function e16Poly(o) { return seq([M(o.s * o.c, 'a^{2}'), M(-o.s * o.d, 'a'), M(-o.r * o.c, 'a'), M(o.r * o.d)]); }

  HW.defineLesson({
    id: 'u4l2', unit: 4, num: '2', title: 'Common Factors: Binomial Common Factors and Grouping', outcome: 'AN5',
    blurb: 'The common factor can be a whole bracket — and pairing up the four terms of a polynomial can create one.',
    questions: [
      /* ---------- Q1 binomial common factors ---------- */
      { num: '1', section: 'Part A — Binomial Common Factors and Grouping', stem: 'Factor the following polynomials by removing the greatest common factor.', parts: [
        { id: '1a', level: 'BEG', make: function (r) {
          var o = pickWhere(function () { return { a: r.int(2, 9), b: r.int(1, 9), c: r.int(1, 9) }; }, function (o) { return cop(o.a, o.c) && o.a !== o.c && o.b !== o.c; });
          return bcfPart({ shown: '(' + o.a + 'x)(x+' + o.b + ')-(' + o.c + ')(x+' + o.b + ')', A: [M(1, 'x'), M(o.b)], c: [M(o.a, 'x'), M(-o.c)] }, '(ax)(x+b)-(c)(x+b)');
        } },
        { id: '1b', level: 'EMG', make: function (r) {
          var o = pickWhere(function () { return { a: r.int(2, 9), b: r.int(1, 9), c: r.int(1, 9) }; }, function (o) { return cop(o.a, o.c) && o.a !== o.c && o.b !== o.c; });
          return bcfPart({ shown: o.a + 'y(x+' + o.b + ')+' + o.c + '(x+' + o.b + ')', A: [M(1, 'x'), M(o.b)], c: [M(o.a, 'y'), M(o.c)] }, 'ay(x+b)+c(x+b)');
        } },
        { id: '1c', level: 'EMG', make: function (r) {
          var v = r.pick(['x', 'x', 'a', 'm', 'y']), b = r.int(1, 9);
          return bcfPart({ shown: v + '(' + v + '+' + b + ')-(' + v + '+' + b + ')', A: [M(1, v), M(b)], c: [M(1, v), M(-1)],
            hidden: 'Read the second term as ' + t('-1(' + v + '+' + b + ')') + '.' }, 'x(x+b)-(x+b)');
        } },
        { id: '1d', level: 'EMG', make: function (r) {
          var L = r.pick(LET4), sA = r.pick([1, 1, -1]), op = r.pick([-1, -1, 1]);
          var A = [M(1, L[0]), M(sA, L[1])], At = br(A);
          return bcfPart({ shown: At + '(' + L[2] + ')' + (op < 0 ? '-' : '+') + At + '(' + L[3] + ')', A: A, c: [M(1, L[2]), M(op, L[3])] }, '(m+n)(x)-(m+n)(y)');
        } },
        { id: '1e', level: 'PRG', make: function (r) {
          var o = pickWhere(function () { return { g: r.int(2, 8), p: r.pick([1, 1, 2, 3]), q: r.int(1, 5) }; }, function (o) { return cop(o.p, o.q) && o.p !== o.q && o.g * o.q <= 40 && o.g * o.p <= 24; });
          var A = [M(1, 'a'), M(1, 'b')];
          return bcfPart({ shown: o.g * o.p + 'x(a+b)-' + o.g * o.q + 'y(a+b)', A: A, c: [M(o.g * o.p, 'x'), M(-o.g * o.q, 'y')], g: M(o.g), inner: [M(o.p, 'x'), M(-o.q, 'y')] }, 'gpx(a+b)-gqy(a+b)');
        } },
        { id: '1f', level: 'PRG', make: function (r) {
          var o = pickWhere(function () { return { g: r.int(2, 6), q: r.int(1, 9), b: r.int(1, 9) }; }, function (o) { return o.q !== o.b && o.g * o.q <= 45; });
          return bcfPart({ shown: o.g + 'a(a+' + o.b + ')-' + o.g * o.q + '(a+' + o.b + ')', A: [M(1, 'a'), M(o.b)], c: [M(o.g, 'a'), M(-o.g * o.q)], g: M(o.g), inner: [M(1, 'a'), M(-o.q)] }, 'ga(a+b)-gq(a+b)');
        } },
        { id: '1g', level: 'PRG', make: function (r) {
          var o = pickWhere(function () { return { g: r.int(2, 7), p: r.int(2, 5), q: r.pick([1, 1, 2, 3]) }; }, function (o) { return cop(o.p, o.q) && o.g * o.p <= 35; });
          return bcfPart({ shown: o.g * o.p + 'a(b+c)+' + (o.g * o.q) + 'd(b+c)', A: [M(1, 'b'), M(1, 'c')], c: [M(o.g * o.p, 'a'), M(o.g * o.q, 'd')], g: M(o.g), inner: [M(o.p, 'a'), M(o.q, 'd')] }, 'gpa(b+c)+gqd(b+c)');
        } },
        { id: '1h', level: 'PRG', make: function (r) {
          var o = pickWhere(function () { return { a: r.int(2, 9), b: r.int(1, 9), c: r.int(1, 9) }; }, function (o) { return cop(o.a, o.b) && o.b !== o.c; });
          var from = o.b + '-' + o.a + 'x';
          return bcfPart({ shown: 'x(' + o.a + 'x-' + o.b + ')-' + o.c + '(' + from + ')', A: [M(o.a, 'x'), M(-o.b)], c: [M(1, 'x'), M(o.c)], flip: { from: from, c: M(-o.c) } }, 'x(ax-b)-c(b-ax)');
        } },
        { id: '1i', level: 'PRG', make: function (r) {
          var o = pickWhere(function () { return { a: r.int(2, 9), b: r.int(2, 9), c: r.int(2, 9), d: r.int(2, 9) }; }, function (o) { return cop(o.b, o.c) && cop(o.a, o.d) && o.a !== o.b; });
          var from = '-' + o.b + '+' + o.c + 'p';
          return bcfPart({ shown: o.a + '(' + o.b + '-' + o.c + 'p)+' + o.d + 'p(' + from + ')', A: [M(o.b), M(-o.c, 'p')], c: [M(o.a), M(-o.d, 'p')], flip: { from: from, c: M(o.d, 'p') } }, 'a(b-cp)+dp(-b+cp)');
        } }] },

      /* ---------- Q2 grouping, leading coefficient 1 ---------- */
      { num: '2', stem: 'Factor the following polynomials by grouping.', parts: [
        { id: '2a', level: 'EMG', make: function (r) { var b = r.int(2, 9), c = pickWhere(function () { return r.int(2, 9); }, function (c) { return c !== b; }); return groupPart({ A: [M(1, 'x'), M(b)], B: [M(1, 'x'), M(c)] }, 'x^2+bx+cx+bc'); } },
        { id: '2b', level: 'EMG', make: function (r) { var b = r.int(2, 6), c = r.int(10, 15); return groupPart({ A: [M(1, 'x'), M(b)], B: [M(1, 'x'), M(c)] }, 'x^2+bx+cx+bc (larger c)'); } },
        { id: '2c', level: 'EMG', make: function (r) { var b = r.int(2, 9), c = pickWhere(function () { return r.int(1, 9); }, function (c) { return c !== b; }); return groupPart({ A: [M(1, 'm'), M(-b)], B: [M(1, 'm'), M(c)] }, 'm^2-bm+cm-bc'); } },
        { id: '2d', level: 'PRG', make: function (r) { var b = r.int(2, 9), c = pickWhere(function () { return r.int(2, 9); }, function (c) { return c !== b; }); return groupPart({ A: [M(1, 'a'), M(-b)], B: [M(1, 'a'), M(-c)] }, 'a^2-ba-ca+bc'); } },
        { id: '2e', level: 'PRG', make: function (r) { var b = r.int(10, 13), c = r.int(2, 7); return groupPart({ A: [M(1, 'x'), M(-b)], B: [M(1, 'x'), M(-c)] }, 'x^2-bx-cx+bc (larger b)'); } },
        { id: '2f', level: 'PRG', make: function (r) { var b = r.int(2, 9), c = pickWhere(function () { return r.int(2, 9); }, function (c) { return c !== b; }); return groupPart({ A: [M(1, 't'), M(b)], B: [M(1, 't'), M(-c)] }, 't^2+bt-ct-bc'); } }] },

      /* ---------- Q3 grouping, leading coefficient not 1 / other orders ---------- */
      { num: '3', stem: 'Factor the following polynomials by grouping.', parts: [
        { id: '3a', level: 'EMG', make: function (r) {
          var o = pickWhere(function () { return { b: r.pick([1, 1, 2, 3, 4, 5]), k: r.int(2, 5), c: r.int(1, 9) }; }, function (o) { return cop(o.k, o.c) && o.c !== o.k * o.b; });
          return groupPart({ A: [M(1, 'x'), M(o.b)], B: [M(o.k, 'x'), M(o.c)] }, 'kx^2+kbx+cx+bc');
        } },
        { id: '3b', level: 'EMG', make: function (r) {
          var o = pickWhere(function () { return { k: r.int(2, 7), c: r.int(2, 9) }; }, function (o) { return o.c * o.k !== 1; });
          return groupPart({ A: [M(o.k, 'x'), M(1)], B: [M(1, 'x'), M(o.c)] }, 'kx^2+x+ckx+c');
        } },
        { id: '3c', level: 'EMG', make: function (r) {
          var o = pickWhere(function () { return { b: r.int(2, 7), k: r.int(2, 5), c: r.int(1, 9) }; }, function (o) { return cop(o.k, o.c) && o.c !== o.k * o.b && o.k * o.b <= 24; });
          return groupPart({ A: [M(1, 'm'), M(o.b)], B: [M(o.k, 'm'), M(o.c)] }, 'km^2+kbm+cm+bc');
        } },
        { id: '3d', level: 'PRG', make: function (r) {
          var o = pickWhere(function () { return { p: r.int(2, 4), q: r.int(1, 7), k: r.int(2, 5), c: r.int(1, 7) }; }, function (o) { return cop(o.p, o.q) && cop(o.k, o.c) && o.k * o.q !== o.c * o.p && o.k * o.p <= 20; });
          return groupPart({ A: [M(o.p, 'b'), M(-o.q)], B: [M(o.k, 'b'), M(-o.c)] }, 'kpb^2-kqb-cpb+cq');
        } },
        { id: '3e', level: 'PRG', make: function (r) {
          var o = pickWhere(function () { return { q: r.int(2, 7), k: r.int(2, 5), c: r.int(1, 7) }; }, function (o) { return cop(o.k, o.c) && o.k * o.q !== o.c; });
          return groupPart({ A: [M(1, 'a'), M(-o.q)], B: [M(o.k, 'a'), M(-o.c)] }, 'ka^2-kqa-ca+cq');
        } },
        { id: '3f', level: 'PRG', make: function (r) {
          var o = pickWhere(function () { return { p: r.int(2, 9), q: r.int(1, 7), c: r.int(2, 7) }; }, function (o) { return cop(o.p, o.q) && o.q !== o.c * o.p && o.p * o.c <= 45; });
          return groupPart({ A: [M(o.p, 'x'), M(o.q)], B: [M(1, 'x'), M(-o.c)] }, 'px^2+qx-cpx-cq');
        } },
        { id: '3g', level: 'PRG', make: function (r) {
          var b = r.int(2, 9), v = r.pick(['p', 'p', 'y', 'k']);
          return groupPart({ A: [M(b), M(1, v)], B: [M(b), M(1, v)] }, 'b^2+bp+bp+p^2');
        } },
        { id: '3h', level: 'PRG', make: function (r) {
          var o = pickWhere(function () { return { b: r.int(2, 9), c: r.int(2, 9) }; }, function (o) { return o.b !== o.c; });
          return groupPart({ A: [M(o.c), M(-1, 'y')], B: [M(o.b), M(-1, 'y')] }, 'bc-by-cy+y^2');
        } },
        { id: '3i', level: 'EMG', make: function (r) {
          var L = r.pick([['b', 'x', 'y'], ['a', 'm', 'n'], ['p', 'q', 'r'], ['m', 'x', 'y'], ['k', 's', 't']]);
          return groupPart({ A: [M(1, L[0]), M(1, L[1])], B: [M(1, L[0]), M(1, L[2])] }, 'b^2+bx+by+xy');
        } }] },

      /* ---------- Q4 rearrange first ---------- */
      { num: '4', stem: 'Factor the following polynomials by grouping. <i>(Rearrange the terms first.)</i>', parts: [
        { id: '4a', level: 'PRG', make: function (r) {
          var L = r.pick([['p', 'q', 'x'], ['a', 'b', 'x'], ['m', 'n', 'y'], ['r', 's', 't']]);
          var s1 = r.pick([-1, -1, 1]), s2 = r.pick([-1, -1, 1]);
          return groupPart({ A: [M(1, L[2]), M(s1, L[0])], B: [M(1, L[2]), M(s2, L[1])], show: [3, 0, 1, 2] }, 'pq+x^2-px-qx', REARR_HINTS);
        } },
        { id: '4b', level: 'PRG', make: function (r) {
          var o = pickWhere(function () { return { k: r.int(2, 7), q: r.int(2, 5) }; }, function (o) { return o.k !== o.q; });
          return groupPart({ A: [M(1, 'b'), M(-o.q)], B: [M(o.k, 'b'), M(-1, 'a')], show: [0, 3, 1, 2] }, 'kb^2+qa-kqb-ab', REARR_HINTS);
        } },
        { id: '4c', level: 'ADV', make: function (r) {
          var o = pickWhere(function () { return { p: r.int(2, 7), q: r.int(2, 9), r: r.int(2, 5) }; }, function (o) { return cop(o.p, o.q) && o.p !== o.q && o.q * o.r <= 40; });
          return groupPart({ A: [M(o.p, 'x'), M(-o.q)], B: [M(1, 'x'), M(-o.r, 'y^{2}')], show: [0, 3, 2, 1] }, 'px^2+qry^2-prxy^2-qx', REARR_HINTS);
        } }] },

      /* ---------- Q5 find the error ---------- */
      { num: '5', stem: 'Identify the error in each factorization. Then write the correct factored form.', shared: function (r) { return q5Shared(r); }, parts: [
        { id: '5aerr', sub: 'a error', level: 'PRG', make: function (r, sh) { return q5Err(r, sh, 'a'); } },
        { id: '5a', sub: 'a fix', level: 'PRG', make: function (r, sh) { return q5Fix(sh, 'a'); } },
        { id: '5berr', sub: 'b error', level: 'EMG', make: function (r, sh) { return q5Err(r, sh, 'b'); } },
        { id: '5b', sub: 'b fix', level: 'PRG', make: function (r, sh) { return q5Fix(sh, 'b'); } },
        { id: '5cerr', sub: 'c error', level: 'EMG', make: function (r, sh) { return q5Err(r, sh, 'c'); } },
        { id: '5c', sub: 'c fix', level: 'EMG', make: function (r, sh) { return q5Fix(sh, 'c'); } }] },

      /* ---------- Part B: multiple choice and numerical response ---------- */
      { num: '6', section: 'Part B — Multiple Choice and Numerical Response', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '6', level: 'PRG', make: function (r) {
          var a = r.int(2, 5), b = pickWhere(function () { return r.int(2, 7); }, function (b) { return b !== a; });
          var shown = 'pq-' + a + 'ps-' + a * b + 'rs+' + b + 'rq';
          return B.mc(r, 'One factor of ' + t(shown) + ' is', [
            { html: t('(p-' + b + 'r)'), why: 'Check the second pair: ' + t('-' + a * b + 'rs+' + b + 'rq=' + b + 'r(q-' + a + 's)') + ', so the other factor is ' + t('p+' + b + 'r') + ', with a plus sign.' },
            { html: t('(' + a + 's-p)'), why: 'Factor it fully and compare: no factor mixes ' + t('s') + ' and ' + t('p') + ' like this. Group ' + t('pq-' + a + 'ps') + ' and ' + t('-' + a * b + 'rs+' + b + 'rq') + '.' },
            { html: t('(q-' + a + 's)'), right: true },
            { html: t('(q+' + a + 's)'), why: 'Taking ' + t('p') + ' out of ' + t('pq-' + a + 'ps') + ' leaves ' + t('(q-' + a + 's)') + ': the sign is minus.' }],
            'Group the terms as they stand: ' + t('(pq-' + a + 'ps)+(-' + a * b + 'rs+' + b + 'rq)') + '<br>' + t('=p(q-' + a + 's)+' + b + 'r(q-' + a + 's)=(q-' + a + 's)(p+' + b + 'r)') + '<br>(Pairing ' + t('pq') + ' with ' + t(b + 'rq') + ' gives the same factors.) One factor is ' + t('(q-' + a + 's)') + '.',
            ['Group the first two terms and the last two terms, and take a common factor out of each pair.'], 'one factor of pq-aps-abrs+brq');
        } }] },
      { num: '7', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '7', level: 'EMG', make: function (r) {
          var a = r.int(2, 9), L = r.pick([['p', 'q'], ['p', 'q'], ['x', 'y'], ['m', 'n'], ['a', 'b']]), p = L[0], q = L[1];
          var P1 = '(' + p + '-' + a + ')', P2 = '(' + a + '-' + p + ')';
          return B.mc(r, t(p + P1 + '+' + q + P2) + ' is equivalent to', [
            { html: t(P1 + '(' + p + '+' + q + ')'), why: t(P2) + ' is the opposite of ' + t(P1) + ', so ' + t(q + P2 + '=-' + q + P1) + ': the ' + t(q) + ' gets a minus sign.' },
            { html: t(P1 + '(' + p + '-' + q + ')'), right: true },
            { html: t(P2 + '(' + p + '-' + q + ')'), why: 'Expand it: the ' + t(p + '^{2}') + ' term comes out <b>negative</b>, but the original starts with ' + t('+' + p + '^{2}') + '. One bracket has the wrong sign.' },
            { html: t(P2 + '(' + p + '+' + q + ')'), why: 'Expand it: the ' + t(p + '^{2}') + ' term comes out <b>negative</b>, but the original starts with ' + t('+' + p + '^{2}') + '.' }],
            t(q + P2 + '=-' + q + P1) + ', so<br>' + t(p + P1 + '+' + q + P2 + '=' + p + P1 + '-' + q + P1 + '=' + P1 + '(' + p + '-' + q + ')') + '.',
            ['Write ' + t(P2) + ' as ' + t('-' + P1) + ' so that both terms have the same bracket.'], 'p(p-a)+q(a-p)');
        } }] },
      { num: '8', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '8', level: 'PRG', make: function (r) {
          var o = pickWhere(function () { return { k: r.int(2, 6), n: r.int(2, 7), m: r.int(1, 9) }; }, function (o) { return cop(o.k, o.m) && o.m !== o.k * o.n && o.m !== o.n; });
          var k = o.k, n = o.n, m = o.m, mn = m * n;
          var shown = seq([M(k, 'a^{2}'), M(m, 'a'), M(k * n, 'a')]) + '+c';
          return B.mc(r, 'Consider ' + t(shown) + ', where ' + t('c') + ' is a constant. If ' + t('a+' + n) + ' is a factor, then the other factor must be', [
            { html: t(seq([M(k, 'a'), M(m)])), right: true },
            { html: t(seq([M(1, 'a'), M(m)])), why: 'Multiply the first terms: ' + t('(a+' + n + ')(a+' + m + ')') + ' starts with ' + t('a^{2}') + ', but the polynomial starts with ' + t(k + 'a^{2}') + '.' },
            { html: t(seq([M(k, 'a'), M(mn)])), why: 'Check the ' + t('a') + '-terms: ' + t('(a+' + n + ')(' + k + 'a+' + mn + ')') + ' gives ' + t(seq([M(mn, 'a'), M(k * n, 'a')])) + ', not ' + t(seq([M(m, 'a'), M(k * n, 'a')])) + '.' },
            { html: t(seq([M(1, 'a'), M(mn)])), why: 'Multiply the first terms: ' + t('(a+' + n + ')(a+' + mn + ')') + ' starts with ' + t('a^{2}') + ', but the polynomial starts with ' + t(k + 'a^{2}') + '.' }],
            'Write ' + t(shown + '=(a+' + n + ')(' + k + 'a+j)') + '.<br>Expanding: ' + t(k + 'a^{2}+ja+' + k * n + 'a+' + n + 'j') + '. Matching the ' + t(P.tex(M(m, 'a'))) + ' term gives ' + t('j=' + m) + ' (and then ' + t('c=' + n + 'j=' + mn) + ').<br>Check by grouping: ' + t(k + 'a(a+' + n + ')+' + m + '(a+' + n + ')') + '. The other factor is ' + t(seq([M(k, 'a'), M(m)])) + '.',
            ['Pair ' + t(k + 'a^{2}') + ' with ' + t(k * n + 'a') + ': what is their common factor? The other pair must give the same bracket.'], 'other factor given a+n');
        } }] },
      { num: '9', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '9', level: 'ADV', make: function (r) {
          var o = pickWhere(function () { return { a: r.int(2, 6), b: r.int(1, 9), j: r.int(2, 9) }; }, function (o) { return cop(o.a, o.b) && o.b !== o.j && o.a * o.j !== o.b * o.j && o.b * o.j !== o.a * o.j; });
          var a = o.a, b = o.b, j = o.j, ans = b * j, F = seq([M(a, 'x'), M(b)]);
          var shown = seq([M(a, 'x^{2}'), M(b, 'x'), M(a * j, 'x')]) + '+p';
          return B.nr('The polynomial ' + t(shown) + ' has a factor of ' + t('(' + F + ')') + '. The value of ' + t('p') + ' is ________.', ans, function (v) {
            if (v === j) return { code: 'gave-j', hint: 'That’s the number in the other bracket, ' + t('(x+' + j + ')') + '. The constant ' + t('p') + ' is the product of the two last terms.' };
            if (v === a * j) return { code: 'gave-coef', hint: t(a * j) + ' is the coefficient of the third term. ' + t('p') + ' is the constant term: what do the last terms of the two factors multiply to?' };
            if (v === b + j) return { code: 'added', hint: 'The constant term comes from <b>multiplying</b> the last terms of the factors, not adding them.' };
            return null;
          }, 'Write ' + t(shown + '=(' + F + ')(x+k)') + '.<br>Expanding: ' + t(a + 'x^{2}+' + a + 'kx+' + (b === 1 ? '' : b) + 'x+' + (b === 1 ? '' : b) + 'k') + '. Matching the ' + t(a * j + 'x') + ' term gives ' + t(a + 'k=' + a * j) + ', so ' + t('k=' + j) + ' and ' + t('p=' + (b === 1 ? '' : b) + 'k=' + ans) + '.<br>Check: ' + t('x(' + F + ')+' + j + '(' + F + ')') + ' ✓',
          ['Pair the first two terms: ' + t(seq([M(a, 'x^{2}'), M(b, 'x')]) + '=x(' + F + ')') + '. The last two terms must also be a multiple of ' + t('(' + F + ')') + '.'], 'p so that ax+b is a factor');
        } }] }
    ],

    extra: [
      /* ---------- EP Part D: a binomial as the common factor ---------- */
      { num: '7', section: 'Extra practice D — A binomial as the common factor', stem: 'Factor completely. After you remove the common binomial, check whether the bracket left behind has a common factor of its own.', parts: [
        { id: 'e7a', level: 'EMG', make: function (r) {
          var o = pickWhere(function () { return { a: r.int(2, 9), b: r.int(1, 9), c: r.int(1, 9) }; }, function (o) { return cop(o.a, o.c) && o.a !== o.c; });
          return bcfPart({ shown: o.a + 'x(y+' + o.b + ')-' + o.c + '(y+' + o.b + ')', A: [M(1, 'y'), M(o.b)], c: [M(o.a, 'x'), M(-o.c)] }, 'ax(y+b)-c(y+b)');
        } },
        { id: 'e7b', level: 'PRG', make: function (r) {
          var o = { g: r.int(2, 6), b: r.int(1, 9), c: r.int(1, 6) };
          return bcfPart({ shown: o.g + 'a(a-' + o.b + ')+' + o.g * o.c + '(a-' + o.b + ')', A: [M(1, 'a'), M(-o.b)], c: [M(o.g, 'a'), M(o.g * o.c)], g: M(o.g), inner: [M(1, 'a'), M(o.c)] }, 'ga(a-b)+gc(a-b)');
        } },
        { id: 'e7c', level: 'PRG', make: function (r) {
          var o = pickWhere(function () { return { g: r.int(2, 5), p: r.int(1, 4), rr: r.int(1, 5), q: r.int(2, 5), s: r.int(1, 7) }; }, function (o) { return cop(o.p, o.rr) && cop(o.q, o.s) && !(o.p === o.q && o.rr === o.s) && o.g * o.p <= 15; });
          var A = [M(o.q, 'm'), M(o.s)], At = br(A);
          return bcfPart({ shown: o.g * o.p + 'm' + At + '-' + o.g * o.rr + At, A: A, c: [M(o.g * o.p, 'm'), M(-o.g * o.rr)], g: M(o.g), inner: [M(o.p, 'm'), M(-o.rr)] }, 'gpm(qm+s)-gr(qm+s)');
        } },
        { id: 'e7d', level: 'PRG', make: function (r) {
          var a = r.int(2, 9), b = r.int(2, 9);
          return bcfPart({ shown: a + 'x(x-' + b + ')+' + b + '-x', A: [M(1, 'x'), M(-b)], c: [M(a, 'x'), M(-1)],
            flip: { from: b + '-x', c: M(1), term: '+' + b + '-x', note: t(b + '-x=-(x-' + b + ')=-1(x-' + b + ')') + ': there is no bracket, but the last two terms are the opposite of the common binomial.' } }, 'ax(x-b)+b-x');
        } },
        { id: 'e7e', level: 'ADV', make: function (r) {
          var o = { g: r.int(2, 6), k: r.int(2, 4), b: r.int(2, 9) }, from = 'q-' + o.b;
          return bcfPart({ shown: o.g + 'p(' + o.b + '-q)+' + o.g * o.k + 'p^{2}(' + from + ')', A: [M(o.b), M(-1, 'q')], c: [M(o.g, 'p'), M(-o.g * o.k, 'p^{2}')], g: M(o.g, 'p'), inner: [M(1), M(-o.k, 'p')], flip: { from: from, c: M(o.g * o.k, 'p^{2}') } }, 'gp(b-q)+gkp^2(q-b)');
        } },
        { id: 'e7f', level: 'PRG', make: function (r) {
          var b = r.int(1, 6), c = r.int(2, 7), A = P.parse('x+' + b), At = '(x+' + b + ')', L = P.parse('x+' + (b + c));
          var key = At + '(x+' + (b + c) + ')';
          return fpart(t(At + '^{2}+' + c + At), [F1(A), F1(L)], key,
            [{ is: P.mul(A, P.parse('x+' + c)), tex: At + '(x+' + c + ')', code: 'leftover-b', hint: 'After you take one ' + t(At) + ' out of ' + t(At + '^{2}') + ', a whole ' + t(At) + ' is left — not just ' + t('x') + '. The second bracket is ' + t('[' + At + '+' + c + ']') + '; simplify it.' },
              { is: P.mul(A, A, P.num(c)), tex: c + At + '^{2}', code: 'diag', hint: 'The two terms are <b>added</b>, not multiplied. Take out one ' + t(At) + ' and write what is left of each term in the second bracket.' },
              { is: P.mul(A, P.num(c + 1)), tex: (c + 1) + At, code: 'leftover-b', hint: t(At + '^{2}') + ' is ' + t(At + At) + ', so taking out one ' + t(At) + ' leaves ' + t(At) + ', not ' + t('1') + '.' }],
            t(At + '^{2}=' + At + At) + '; remove one ' + t(At) + ':<br>' + t(At + '\\big[' + At + '+' + c + '\\big]') + '<br>' + t('=' + key),
            ['Write ' + t(At + '^{2}') + ' as ' + t(At + At) + '. Which bracket is common to both terms?', 'Take one ' + t(At) + ' out, then simplify what is left in the second bracket.'], '(x+b)^2+c(x+b)', ['(x+' + (b + c) + ')' + At]);
        } }] },

      /* ---------- EP Part E: factoring by grouping ---------- */
      { num: '8', section: 'Extra practice E — Factoring by grouping', stem: 'Factor by grouping. In every part the second pair (once the terms are in a workable order) needs a <b>negative</b> monomial removed before the two binomials match.', parts: [
        { id: 'e8a', level: 'PRG', make: function (r) {
          var o = pickWhere(function () { return { p: r.int(2, 5), q: r.int(1, 7), k: r.int(2, 5), c: r.int(1, 7) }; }, function (o) { return cop(o.p, o.q) && cop(o.k, o.c) && o.k * o.q !== o.c * o.p && o.k * o.p <= 24 && !(o.p === o.k && o.q === o.c); });
          return groupPart({ A: [M(o.p, 'x'), M(-o.q)], B: [M(o.k, 'x'), M(-o.c)] }, 'kpx^2-kqx-cpx+cq');
        } },
        { id: 'e8b', level: 'PRG', make: function (r) {
          var o = pickWhere(function () { return { p: r.int(2, 5), q: r.int(1, 5), k: r.int(1, 4), c: r.int(1, 5) }; }, function (o) { return cop(o.p, o.q) && cop(o.k, o.c) && o.k * o.q !== o.c * o.p && !(o.p === o.k && o.q === o.c); });
          return groupPart({ A: [M(o.p, 'a'), M(o.q, 'b')], B: [M(o.k, 'a'), M(-o.c, 'b')] }, 'kpa^2+kqab-cpab-cqb^2');
        } },
        { id: 'e8c', level: 'PRG', make: function (r) {
          var b = r.int(2, 9), c = r.pick([2, 3, 5, 6, 7, 8, 10, 11]);
          return groupPart({ A: [M(1, 'x'), M(b)], B: [M(1, 'x^{2}'), M(-c)] }, 'x^3+bx^2-cx-bc');
        } },
        { id: 'e8d', level: 'PRG', make: function (r) {
          var o = pickWhere(function () { return { p: r.int(2, 5), q: r.int(1, 5), k: r.int(1, 4), c: r.int(2, 9) }; }, function (o) { return cop(o.p, o.q) && cop(o.k, o.c) && !(isSq(o.k) && isSq(o.c)) && o.k * o.p <= 15; });
          return groupPart({ A: [M(o.p, 'y'), M(-o.q)], B: [M(o.k, 'y^{2}'), M(-o.c)] }, 'kpy^3-kqy^2-cpy+cq');
        } },
        { id: 'e8e', level: 'PRG', make: function (r) {
          var o = pickWhere(function () { return { p: r.int(2, 5), q: r.int(1, 5), k: r.int(2, 5), c: r.int(1, 7) }; }, function (o) { return cop(o.p, o.q) && cop(o.k, o.c) && o.k * o.q !== o.c * o.p && !(o.p === o.k && o.q === o.c); });
          return groupPart({ A: [M(o.p, 'm'), M(-o.q, 'n')], B: [M(o.k, 'm'), M(-o.c, 'n')] }, 'kpm^2-kqmn-cpmn+cqn^2');
        } },
        { id: 'e8f', level: 'PRG', make: function (r) {
          var L = r.pick([['a', 'b', 'c', 'd'], ['a', 'b', 'c', 'd'], ['p', 'q', 'r', 's'], ['w', 'x', 'y', 'z'], ['m', 'n', 'u', 'v']]);
          return groupPart({ A: [M(1, L[2]), M(r.pick([1, 1, -1]), L[3])], B: [M(1, L[0]), M(-1, L[1])], show: [0, 3, 1, 2] }, 'ac-bd+ad-bc', REARR_HINTS);
        } }] },
      { num: '9', stem: 'The four terms are <b>out of order</b>: pairing them as they stand may give two binomials that do not match. Reorder the terms first, then group.', parts: [
        { id: 'e9a', level: 'PRG', make: function (r) {
          var o = pickWhere(function () { return { k: r.int(2, 7), q: r.int(2, 5), c: r.int(1, 5) }; }, function (o) { return cop(o.k, o.c) && o.k !== o.q; });
          return groupPart({ A: [M(1, 'x'), M(-o.q)], B: [M(o.k, 'x'), M(-o.c, 'y')], show: [0, 3, 1, 2] }, 'kx^2+cqy-kqx-cxy', REARR_HINTS);
        } },
        { id: 'e9b', level: 'PRG', make: function (r) {
          var o = pickWhere(function () { return { k: r.int(1, 5), q: r.int(2, 5), c: r.int(2, 9) }; }, function (o) { return cop(o.k, o.c) && !(isSq(o.k) && isSq(o.c)); });
          return groupPart({ A: [M(1, 'p'), M(-o.q)], B: [M(o.k, 'p^{2}'), M(-o.c)], show: [0, 3, 1, 2] }, 'kp^3+cq-kqp^2-cp', REARR_HINTS);
        } },
        { id: 'e9c', level: 'PRG', make: function (r) {
          var o = pickWhere(function () { return { p: r.int(1, 4), q: r.int(1, 5), k: r.int(2, 5), c: r.int(1, 5) }; }, function (o) { return cop(o.p, o.q) && cop(o.k, o.c) && o.k * o.q * o.c > 0 && !(o.p === 1 && o.q === 1); });
          var g = grouping({ A: [M(o.p, 'a'), M(o.q, 'b')], B: [M(o.k, 'a'), M(-o.c)], show: [1, 3, 0, 2] });
          var sol = g.sol + '<br>(Pairing the terms as they stand also works here: ' + t('(' + seq([g.T4[1], g.T4[3]]) + ')+(' + seq([g.T4[0], g.T4[2]]) + ')=' + times(M(o.q, 'b'), br([M(o.k, 'a'), M(-o.c)]), true) + times(M(o.p, 'a'), br([M(o.k, 'a'), M(-o.c)]), false)) + ', the same factors.)';
          return fpart(t(g.shown), g.target, g.key, g.ws, sol, REARR_HINTS, 'kqab-cqb+kpa^2-cpa', g.good);
        } }] },
      { num: '10', stem: 'Factor completely.', parts: [
        { id: 'e10a', level: 'PRG', make: function (r) {
          var g = r.int(2, 5), b = r.int(1, 5), c = r.int(2, 9);
          var poly = seq([M(g, 'x^{3}'), M(g * b, 'x^{2}'), M(g * c, 'x'), M(g * b * c)]), inner = seq([M(1, 'x^{3}'), M(b, 'x^{2}'), M(c, 'x'), M(b * c)]);
          var A = P.parse('x+' + b), Q = P.parse('x^{2}+' + c), key = g + '(x+' + b + ')(x^{2}+' + c + ')';
          return fpart(t(poly), [F1(P.num(g)), F1(A), F1(Q)], key,
            [{ is: P.mul(A, Q), tex: '(x+' + b + ')(x^{2}+' + c + ')', code: 'lost-gcf', hint: 'Your factors are missing the common factor ' + t(g) + ' that you took out of all four terms. Write it in front.' },
              { is: P.mul(P.num(g), A, P.parse('x^{2}-' + c)), tex: g + '(x+' + b + ')(x^{2}-' + c + ')', code: 'pair-sign', hint: 'Check the sign of the factor you took out of the second pair: ' + t(c + 'x+' + b * c + '=' + c + '(x+' + b + ')') + '.' }],
            'Every term has a factor of ' + t(g) + ': ' + t('=' + g + '(' + inner + ')') + '<br>Group inside the bracket: ' + t('=' + g + '\\big[x^{2}(x+' + b + ')+' + c + '(x+' + b + ')\\big]') + '<br>' + t('=' + key),
            ['First take out the common factor of all four terms.', 'Then group the four terms left in the bracket.'], 'g(x^3+bx^2+cx+bc)', [g + '(x^{2}+' + c + ')(x+' + b + ')']);
        } },
        { id: 'e10b', level: 'PRG', make: function (r) {
          var o = pickWhere(function () { return { k: r.int(2, 6), c: r.int(2, 9) }; }, function (o) { return cop(o.k, o.c) && !(isSq(o.k) && isSq(o.c)); });
          return groupPart({ A: [M(1, 'a'), M(-1, 'b')], B: [M(o.k, 'a^{2}'), M(-o.c)] }, 'ka^3-ka^2b-ca+cb');
        } },
        { id: 'e10c', level: 'PRG', make: function (r) {
          var o = pickWhere(function () { return { k: r.int(2, 5), b: r.int(1, 6), c: r.int(1, 7) }; }, function (o) { return cop(o.k, o.c) && !(isSq(o.k) && isSq(o.c)); });
          var p = groupPart({ A: [M(1, 'x'), M(o.b)], B: [M(-o.k, 'x^{2}'), M(o.c)] }, '-kx^3-kbx^2+cx+bc');
          p.solution += '<br>(Following the lesson, the negative stays inside the bracket; ' + t('(x+' + o.b + ')(' + o.c + '-' + o.k + 'x^{2})') + ' and ' + t('-(x+' + o.b + ')(' + o.k + 'x^{2}-' + o.c + ')') + ' are the same answer.)';
          p.good.push('(x+' + o.b + ')(' + o.c + '-' + o.k + 'x^{2})', '-(x+' + o.b + ')(' + o.k + 'x^{2}-' + o.c + ')');
          return p;
        } }] },

      /* ---------- EP Part F: working backwards ---------- */
      { num: '13', section: 'Extra practice F — Working backwards', stem: 'Determine each missing factor or coefficient.', shared: function (r) { return q13cShared(r); }, parts: [
        { id: 'e13a', level: 'PRG', make: function (r) {
          var o = pickWhere(function () { return { p: r.int(2, 6), q: r.int(1, 9), c: r.int(2, 6) }; }, function (o) { return cop(o.p, o.q) && o.q !== o.c * o.p; });
          var g = grouping({ A: [M(o.p, 'm'), M(o.q)], B: [M(1, 'm'), M(-o.c)] }), Bt = '(m-' + o.c + ')';
          return B.poly('Determine the missing factor: ' + t(Bt + '(\\quad?\\quad)=' + g.shown), g.A,
            { wrong: [{ is: P.parse('m-' + o.c), code: 'gave-given', hint: 'That factor is already shown. Factor the right side by grouping and find the <b>other</b> bracket.' }] },
            'Factor the right side by grouping:<br>' + t(g.shown + '=m' + g.At + '-' + o.c + g.At + '=' + Bt + g.At) + '<br>The missing factor is ' + t(P.tex(g.A)) + '.',
            ['Factor the right side by grouping: take a common factor out of each pair.', 'One of the brackets will be ' + t(Bt) + '; the other one is the answer.'], '(m-c)(?) by grouping');
        } },
        { id: 'e13b', level: 'PRG', make: function (r) {
          var o = pickWhere(function () { return { p: r.int(2, 7), q: r.int(1, 7), k: r.int(2, 5) }; }, function (o) { return cop(o.p, o.q) && o.k * o.q !== o.p && o.p !== o.k; });
          var g = grouping({ A: [M(o.p, 'y'), M(-o.q)], B: [M(o.k, 'y'), M(1)] }), Bt = '(' + o.k + 'y+1)';
          return B.poly('Determine the missing factor: ' + t('(\\quad?\\quad)' + Bt + '=' + g.shown), g.A,
            { wrong: [{ is: P.parse(o.k + 'y+1'), code: 'gave-given', hint: 'That factor is already shown. Factor the right side by grouping and find the <b>other</b> bracket.' },
              { is: P.parse(o.k + 'y'), code: 'diag', hint: 'Factor the right side by grouping: the first pair gives ' + t(o.k + 'y' + g.At) + ' and the second pair ' + t('1' + g.At) + '. Which bracket is in both?' }] },
            'Factor the right side by grouping:<br>' + t(g.shown + '=' + o.k + 'y' + g.At + '+1' + g.At + '=' + g.At + Bt) + '<br>The missing factor is ' + t(P.tex(g.A)) + '.',
            ['Factor the right side by grouping. The second pair has a common factor of ' + t('1') + '.', 'One of the brackets will be ' + t(Bt) + '; the other one is the answer.'], '(?)(ky+1) by grouping');
        } },
        { id: 'e13c', sub: 'c: k', level: 'ADV', make: function (r, o) {
          var shown = q13cShown(o), A = seq([M(o.p, 'x'), M(o.q)]), k = o.s * o.q, first = (o.g === 1 ? '' : o.g) + 'x(' + A + ')';
          return B.number(t(shown) + ' factors by grouping. Determine ' + t('k') + '.', k, function (v) {
            if (v === o.s) return { code: 'gave-j', hint: 'That’s the factor you take out of the second pair. ' + t('k') + ' is the constant term of ' + t(o.s + '(' + A + ')') + '.' };
            if (v === o.s * o.p) return { code: 'gave-coef', hint: t(o.s * o.p) + ' is the coefficient of the third term. ' + t('k') + ' is the constant term.' };
            if (v === o.s + o.q) return { code: 'added', hint: 'Multiply, don’t add: the second pair is ' + t(o.s + '(' + A + ')') + '.' };
            return null;
          }, 'First pair: ' + t(seq([M(o.g * o.p, 'x^{2}'), M(o.g * o.q, 'x')]) + '=' + first) + '.<br>The second pair must also give ' + t('(' + A + ')') + ': ' + t(o.s * o.p + 'x+k=' + o.s + '(' + A + ')') + ', so ' + t('k=' + o.s + '\\times ' + o.q + '=' + k) + '.',
          ['Take the common factor out of the first pair. The second pair must leave the <b>same</b> bracket.'], 'k so that it groups');
        } },
        { id: 'e13c2', sub: 'c: factors', level: 'PRG', make: function (r, o) {
          var g = grouping({ A: [M(o.p, 'x'), M(o.q)], B: [M(o.g, 'x'), M(o.s)] });
          return fpart('With the value of ' + t('k') + ' that lets it factor by grouping, ' + t(q13cShown(o)) + ' becomes ' + t(g.shown) + '. Write it in factored form.', g.target, g.key, g.ws, g.sol, GRP_HINTS, 'factors of the completed polynomial', g.good);
        } }] },

      /* ---------- EP Part G: find the error ---------- */
      { num: '16', section: 'Extra practice G — Find the error', shared: function (r) { return e16Shared(r); },
        stem: function (o) { return 'Asked to factor ' + t(e16Poly(o)) + ' by grouping, a student wrote ' + t(e16Poly(o) + '=' + e16Line(o)) + ', then stopped, saying “the brackets are different, so this polynomial cannot be factored.”'; }, parts: [
        { id: 'e16a', level: 'BEG', make: function (r, o) {
          var T = P.add(M(o.s * o.c, 'a^{2}'), M(-(o.s * o.d + o.r * o.c), 'a'), M(o.r * o.d));
          return B.poly('Show that the student’s line is correct: expand and simplify ' + t(e16Line(o)) + '.', T,
            { wrong: [{ is: P.add(M(o.s * o.c, 'a^{2}'), M(-o.s * o.d, 'a'), M(o.r * o.d), M(o.r * o.c, 'a')), code: 'sign', hint: 'Check ' + t(o.r + '(' + o.d + '-' + o.c + 'a)') + ': the ' + t(o.c + 'a') + ' is subtracted, so its product is ' + t('-' + o.r * o.c + 'a') + '.' }] },
            t(o.s + 'a(' + o.c + 'a-' + o.d + ')=' + seq([M(o.s * o.c, 'a^{2}'), M(-o.s * o.d, 'a')])) + ' and ' + t(o.r + '(' + o.d + '-' + o.c + 'a)=' + seq([M(o.r * o.d), M(-o.r * o.c, 'a')])) + '.<br>Sum: ' + t(P.tex(T)) + ', which is ' + t(e16Poly(o)) + ' with the like terms collected ✓',
            ['Multiply each term of each bracket by the factor in front, then collect like terms.'], 'expand the student line');
        } },
        { id: 'e16b', level: 'EMG', make: function (r, o) {
          var X = '(' + o.c + 'a-' + o.d + ')', Y = '(' + o.d + '-' + o.c + 'a)';
          return B.mc(r, 'The conclusion is wrong even though the line is right. Which statement explains why?', [
            { html: t(Y) + ' and ' + t(X) + ' are opposites, so ' + t('+' + o.r + Y + '=-' + o.r + X) + ' and the brackets can be made to match.', right: true },
            { html: t(Y) + ' and ' + t(X) + ' are opposites, so ' + t('+' + o.r + Y + '=+' + o.r + X) + '.', why: 'Flipping the bracket multiplies it by ' + t('-1') + ', so the sign in front must change too. Expand both to check.' },
            { html: t(Y) + ' and ' + t(X) + ' are equal, because they contain the same numbers.', why: 'Try ' + t('a=0') + ': ' + t(Y) + ' is ' + t(o.d) + ' but ' + t(X) + ' is ' + t('-' + o.d) + '. They are opposites, not equal.' },
            { html: 'The brackets can never match this way; the student must regroup the terms in a different order.', why: 'No regrouping is needed: ' + t(Y + '=-' + X) + ', so taking out ' + t('-' + o.r) + ' instead of ' + t(o.r) + ' makes the brackets match.' }],
            t(Y + '=-' + X) + ': the two brackets are opposites. So ' + t('+' + o.r + Y + '=-' + o.r + X) + ', and the line becomes ' + t(o.s + 'a' + X + '-' + o.r + X) + ' — the brackets now match.',
            ['Substitute a number for ' + t('a') + ' into both brackets. How are the two values related?'], 'opposite brackets');
        } },
        { id: 'e16c', level: 'PRG', make: function (r, o) {
          var A = [M(o.c, 'a'), M(-o.d)], Bm = [M(o.s, 'a'), M(-o.r)], Ap = sum(A), Bp = sum(Bm), At = br(A), key = At + br(Bm);
          return fpart('Finish the factoring.', [F1(Ap), F1(Bp)], key,
            [{ is: P.mul(Ap, sum([M(o.s, 'a'), M(o.r)])), tex: At + br([M(o.s, 'a'), M(o.r)]), code: 'not-flipped', hint: 'When ' + t('(' + o.d + '-' + o.c + 'a)') + ' is flipped to ' + t(At) + ', the ' + t('+' + o.r) + ' in front becomes ' + t('-' + o.r) + '.' },
              { is: P.mul(Ap, Ap), tex: At + '^{2}', code: 'bin-twice', hint: 'The bracket ' + t(At) + ' is one factor; the other is made of what you took out of each pair.' }],
            t(e16Line(o) + '=' + o.s + 'a' + At + '-' + o.r + At) + '<br>' + t('=' + key) + '<br>Check: ' + t(key + '=' + e16Poly(o)) + ' ✓',
            GRP_HINTS, 'finish the grouping', [br(Bm) + At]);
        } }] },

      /* ---------- EP Part H: powers of a binomial ---------- */
      { num: '17', section: 'Extra practice H — Stretch', stem: 'In each of these the common factor is a <b>power of a binomial</b>. Take the <i>lowest</i> power of the repeated bracket, exactly as you take the lowest exponent of a repeated variable, then simplify what is left.', parts: [
        { id: 'e17a', level: 'ADV', make: function (r) {
          var o = pickWhere(function () { return { b: r.int(1, 6), c: r.int(2, 9) }; }, function (o) { return o.b !== o.c; });
          var A = P.parse('x+' + o.b), At = '(x+' + o.b + ')', d = o.b - o.c, L = d ? seq([M(1, 'x'), M(d)]) : 'x', Lp = d ? P.parse(L) : P.parse('x'), key = At + '^{2}(' + L + ')';
          return fpart(t(At + '^{3}-' + o.c + At + '^{2}'), [{ p: A, k: 2 }, F1(Lp)], key,
            [{ is: P.mul(P.pow(A, 2), P.parse('x-' + o.c)), tex: At + '^{2}(x-' + o.c + ')', code: 'leftover-b', hint: 'Taking ' + t(At + '^{2}') + ' out of ' + t(At + '^{3}') + ' leaves a whole ' + t(At) + ', so the second bracket is ' + t('[' + At + '-' + o.c + ']') + '. Simplify it.' },
              { is: P.mul(P.pow(A, 2), P.parse('x+' + (o.b + o.c))), tex: At + '^{2}(x+' + (o.b + o.c) + ')', code: 'leftover-sign', hint: 'The second term is <b>subtracted</b>: what is left is ' + t(At + '-' + o.c) + '.' },
              { is: P.mul(P.pow(A, 3), P.num(1 - o.c)), tex: (1 - o.c) + At + '^{3}', code: 'diag', hint: 'The two powers are different, so they can’t be combined like like terms. Take out the <b>lowest</b> power, ' + t(At + '^{2}') + '.' }],
            'Lowest power of ' + t(At) + ' is ' + t(At + '^{2}') + ':<br>' + t(At + '^{2}\\big[' + At + '-' + o.c + '\\big]') + '<br>' + t('=' + key),
            ['Write ' + t(At + '^{3}') + ' as ' + t(At + '^{2}' + At) + '. What do both terms have in common?', 'Take out ' + t(At + '^{2}') + ' and simplify what is left.'], '(x+b)^3-c(x+b)^2', ['(' + L + ')' + At + '^{2}', At + At + '(' + L + ')']);
        } },
        { id: 'e17b', level: 'ADV', make: function (r) {
          var o = pickWhere(function () { return { g: r.int(2, 5), p: r.int(1, 3), rr: r.int(1, 5), q: r.int(2, 3), s: r.int(1, 5) }; },
            function (o) { var lc = o.p * o.q, lk = o.rr - o.p * o.s; return cop(o.q, o.s) && cop(o.p, o.rr) && lk !== 0 && cop(lc, lk) && o.g * o.p <= 10 && o.g * o.rr <= 15 && o.p * o.q > 1; });
          var A = P.parse(o.q + 'y-' + o.s), At = '(' + o.q + 'y-' + o.s + ')', lc = o.p * o.q, lk = o.rr - o.p * o.s, L = seq([M(lc, 'y'), M(lk)]), Lp = P.parse(L);
          var key = o.g + At + '^{2}(' + L + ')', badL = seq([M(lc, 'y'), M(o.rr - o.s)]);
          var ws = [{ is: P.mul(P.pow(A, 2), Lp), tex: At + '^{2}(' + L + ')', code: 'lost-gcf', hint: 'Your factors are missing the common factor ' + t(o.g) + ' of the coefficients ' + t(o.g * o.p) + ' and ' + t(o.g * o.rr) + '. Write it in front.' }];
          if (o.p > 1 && o.rr - o.s !== 0) ws.push({ is: P.mul(P.num(o.g), P.pow(A, 2), P.parse(badL)), tex: o.g + At + '^{2}(' + badL + ')', code: 'leftover-dist', hint: 'In the bracket left behind, ' + t(o.p + At) + ' means ' + t(o.p) + ' times <b>both</b> terms: ' + t(o.p + At + '=' + seq([M(lc, 'y'), M(-o.p * o.s)])) + '.' });
          return fpart(t(o.g * o.p + At + '^{3}+' + o.g * o.rr + At + '^{2}'), [F1(P.num(o.g)), { p: A, k: 2 }, F1(Lp)], key, ws,
            t('\\gcd(' + o.g * o.p + ',' + o.g * o.rr + ')=' + o.g) + '; lowest power ' + t(At + '^{2}') + ':<br>' + t(o.g + At + '^{2}\\big[' + (o.p === 1 ? '' : o.p) + At + '+' + o.rr + '\\big]') + '<br>' + t('=' + o.g + At + '^{2}(' + seq([M(lc, 'y'), M(-o.p * o.s), M(o.rr)]) + ')') + '<br>' + t('=' + key),
            ['Take out the GCF of the coefficients and the lowest power of ' + t(At) + ' together.', 'Then simplify the bracket that is left: distribute and collect like terms.'], 'gp(qy-s)^3+gr(qy-s)^2', [o.g + '(' + L + ')' + At + '^{2}']);
        } },
        { id: 'e17c', level: 'ADV', make: function (r) {
          var o = pickWhere(function () { return { g: r.int(2, 6), k: r.int(2, 4) }; }, function (o) { return o.g * o.k <= 20; });
          var A = P.parse('a-b'), L = seq([M(o.k - 1, 'a'), M(1, 'b')]), Lp = P.parse(L), key = o.g + 'a(a-b)(' + L + ')', badL = seq([M(o.k - 1, 'a'), M(-1, 'b')]);
          return fpart(t(o.g * o.k + 'a^{2}(a-b)-' + o.g + 'a(a-b)^{2}'), [F1(M(o.g, 'a')), F1(A), F1(Lp)], key,
            [{ is: P.mul(M(o.g, 'a'), A, P.parse(badL)), tex: o.g + 'a(a-b)(' + badL + ')', code: 'leftover-sign', hint: 'In the bracket left behind you subtract the <b>whole</b> ' + t('(a-b)') + ': ' + t('-(a-b)=-a+b') + '.' },
              { is: P.mul(M(o.g, 'a'), A, P.parse(o.k + 'a-1')), tex: o.g + 'a(a-b)(' + o.k + 'a-1)', code: 'diag', hint: 'Only one ' + t('(a-b)') + ' comes out of ' + t('(a-b)^{2}') + ', so a whole ' + t('(a-b)') + ' is left behind in the second term.' }],
            t('\\gcd(' + o.g * o.k + ',' + o.g + ')=' + o.g) + '; lowest ' + t('a^{1}') + ' and ' + t('(a-b)^{1}') + ':<br>' + t(o.g + 'a(a-b)\\big[' + o.k + 'a-(a-b)\\big]') + '<br>' + t('=' + o.g + 'a(a-b)(' + o.k + 'a-a+b)') + '<br>' + t('=' + key),
            ['The common factor is a number, a power of ' + t('a') + ' and a power of ' + t('(a-b)') + ' — take the lowest power of each.', 'Then simplify the bracket that is left; watch the sign when you subtract ' + t('(a-b)') + '.'], 'gka^2(a-b)-ga(a-b)^2', [o.g + 'a(' + L + ')(a-b)']);
        } }] }
    ]
  });
})(window);
