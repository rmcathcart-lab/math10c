/* Math 10C · Unit 3 (Polynomial Operations, AN4) — exit slips for Lessons 1–6 (u3l1x … u3l6x), written in test mode.
 * One HW.defineExit per lesson: 3 questions (3–5 parts), about 5–8 minutes at the end of class, checking that day's main
 * skills with content taught up to that lesson. Each slip has a Beginning question (the lesson's BEG assignment items),
 * a Progressing question (its PRG items) and a Mastery question (a step past the assignment: working backwards, reasoning
 * about a whole family, a two-step application), so "highest level right" separates students. The questions are new
 * (different wording, structure details and contexts from the assignment and the unit test) but test the same skills;
 * every part is generated from the seed, with a key, a worked solution, hints, and `bad` answers with u3x- codes.
 * Lesson 6 (the unit review) is a short mix across the unit. No calculator (as on the Unit 3 test). */
(function (root) {
  'use strict';
  var HW = root.HW, K = HW.kit, KP = K.P, PL = HW.poly, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form;

  HW.addCodes({
    'u3x-lc-first': 'Leading coefficient: took the first coefficient written', 'u3x-lc-sign': 'Leading coefficient: dropped its sign', 'u3x-lc-exp': 'Gave the degree as the leading coefficient',
    'u3x-deg-terms': 'Gave the number of terms as the degree', 'u3x-deg-sum': 'Added the exponents of every term (degree)', 'u3x-deg-coef': 'Gave a coefficient as the degree',
    'u3x-deg-max': 'Used the largest single exponent, not the highest term degree',
    'u3x-added-c': 'Added the polynomial that should be subtracted', 'u3x-first-sign': 'Subtracted a bracket but changed only its first sign', 'u3x-reversed': 'Subtracted in the wrong order',
    'u3x-sub-both': 'Subtracted a polynomial that should be added',
    'u3x-no-half': 'Width: subtracted both lengths but didn’t halve', 'u3x-one-length': 'Width: subtracted only one length', 'u3x-half-first': 'Width: subtracted one length, then halved',
    'u3x-half-only': 'Width: halved the perimeter without subtracting the lengths',
    'u3x-first-only': 'Multiplied only the first term in the bracket', 'u3x-num-only': 'Multiplied by the number only (forgot the variable)', 'u3x-var-first': 'Variable of the monomial on the first term only',
    'u3x-fl-only': 'FOIL: only First and Last (no middle term)', 'u3x-one-middle': 'FOIL: one of the two middle products missing', 'u3x-last-sign': 'Wrong sign on the product of the last terms',
    'u3x-c-one': 'Middle coefficient: used only one of the outside and inside products', 'u3x-c-sign': 'Middle coefficient: sign slip', 'u3x-b-sign': 'Unknown constant with the wrong sign',
    'u3x-a-sub': 'Subtracted instead of dividing to find a coefficient',
    'u3x-no-middle': 'Squared a binomial as a² + b² (no middle term)', 'u3x-middle-once': 'Square of a binomial: middle term not doubled', 'u3x-last-neg': 'Square of a binomial: last term made negative',
    'u3x-mid-sign': 'Square of a binomial: wrong sign on the middle term', 'u3x-dsq-plus': 'Sum × difference: + between the squares', 'u3x-dsq-middle': 'Sum × difference: kept a middle term',
    'u3x-k-inside': 'Multiplied the number in front into the bracket before squaring', 'u3x-k-first': 'Number in front multiplied into only one term', 'u3x-k-lost': 'Dropped the number in front',
    'u3x-diff-d': 'Difference of areas: didn’t square the change', 'u3x-diff-sign': 'Difference of areas: wrong sign', 'u3x-diff-2d': 'Difference of areas: doubled instead of squaring',
    'u3x-foil-only': 'Binomial × trinomial: only four of the six products', 'u3x-second-partial': 'Second term of the binomial multiplied into only part of the trinomial',
    'u3x-p-sign': 'Sign error on the products of the binomial’s second term', 'u3x-third-partial': 'Third bracket only partly multiplied', 'u3x-fl-first': 'First two brackets: middle term left out',
    'u3x-third-sign': 'Third bracket: sign error', 'u3x-cube-sum': 'Cubed a binomial as a³ + b³', 'u3x-vdiff-sign': 'Difference of volumes: wrong sign',
    'u3x-added': 'Added the inside area instead of subtracting it', 'u3x-sub-first': 'Subtracted an area but changed only its first sign', 'u3x-outer-only': 'Gave the outer area only',
    'u3x-perim': 'Gave the perimeter instead of the area', 'u3x-ab-lost': 'Equation: lost the constant term of the product', 'u3x-ab-sign': 'Equation: sign slip with the constant term',
    'u3x-gave-x': 'Gave x instead of the side length', 'u3x-lw-swap': 'Length and width swapped',
    'u3x-h-half': 'Matching (x + h)²: didn’t divide by 2', 'u3x-h-sign': 'Matching (x + h)²: wrong sign of h', 'u3x-h-no-k': 'Matching k(x + h)²: forgot the factor k',
    'u3x-q-no-k': 'Matching k(x + h)²: forgot to multiply h² by k', 'u3x-q-sign': 'Matching k(x + h)²: sign slip finding q'
  });
  HW.addPartial({
    'u3x-lc-first': 'n', 'u3x-lc-sign': 's', 'u3x-lc-exp': 'n', 'u3x-deg-terms': 'n', 'u3x-deg-sum': 'n', 'u3x-deg-coef': 'n', 'u3x-deg-max': 'b',
    'u3x-added-c': 'b', 'u3x-first-sign': 'b', 'u3x-reversed': 'n', 'u3x-sub-both': 'n',
    'u3x-no-half': 'b', 'u3x-one-length': 'n', 'u3x-half-first': 'n', 'u3x-half-only': 'n',
    'u3x-first-only': 'b', 'u3x-num-only': 'b', 'u3x-var-first': 'b', 'u3x-fl-only': 'b', 'u3x-one-middle': 'b', 'u3x-last-sign': 's',
    'u3x-c-one': 'b', 'u3x-c-sign': 's', 'u3x-b-sign': 's', 'u3x-a-sub': 'n',
    'u3x-no-middle': 'b', 'u3x-middle-once': 'b', 'u3x-last-neg': 'b', 'u3x-mid-sign': 's', 'u3x-dsq-plus': 'b', 'u3x-dsq-middle': 'b',
    'u3x-k-inside': 'b', 'u3x-k-first': 'b', 'u3x-k-lost': 's', 'u3x-diff-d': 'b', 'u3x-diff-sign': 's', 'u3x-diff-2d': 'b',
    'u3x-foil-only': 'b', 'u3x-second-partial': 'b', 'u3x-p-sign': 's', 'u3x-third-partial': 'b', 'u3x-fl-first': 'b', 'u3x-third-sign': 's', 'u3x-cube-sum': 'b', 'u3x-vdiff-sign': 's',
    'u3x-added': 'b', 'u3x-sub-first': 'b', 'u3x-outer-only': 'n', 'u3x-perim': 'n', 'u3x-ab-lost': 'b', 'u3x-ab-sign': 's', 'u3x-gave-x': 'n', 'u3x-lw-swap': 's',
    'u3x-h-half': 'b', 'u3x-h-sign': 's', 'u3x-h-no-k': 'b', 'u3x-q-no-k': 'b', 'u3x-q-sign': 's'
  });

  /* ---------- polynomial helpers ---------- */
  function V(v, e) { var o = {}; o[v || 'x'] = e == null ? 1 : e; return PL.mono(1, o); }
  function T(c, v, e) { if (!e) return PL.num(c); var o = {}; o[v] = e; return PL.mono(c, o); } // c·v^e
  function M(c, vars) { return PL.mono(c, vars || {}); }
  function N(c) { return PL.num(c); }
  function lin(a, b, v) { return PL.add(T(a, v || 'x', 1), N(b)); }
  var add = PL.add, mul = PL.mul, sub = PL.sub, neg = PL.neg, scale = PL.scale;
  function tx(p) { return PL.tex(p); }
  function seq(list) { return PL.seq(list); }
  function br(p) { return '(' + tx(p) + ')'; }
  function pf(p) { var s = tx(p); return PL.count(p) > 1 || s.charAt(0) === '-' ? '(' + s + ')' : s; }
  function sumOf(list) { return add.apply(null, list); }
  function lab(p, i) { var s = tx(p); return i > 0 && s.charAt(0) !== '-' ? '+' + s : s; }
  function nz(r, lo, hi) { return (r.chance(0.5) ? -1 : 1) * r.int(lo, hi); }
  function pickWhere(gen, test) { for (var i = 0; i < 3000; i++) { var v = gen(); if (v && test(v)) return v; } throw new Error('u3 exits: no instance found'); }
  function coefs(p, v, n) { var o = []; for (var e = n; e >= 0; e--) { var c = PL.coef(p, e ? (function () { var w = {}; w[v] = e; return w; })() : {}); o.push(c[0] / c[1]); } return o; }
  function allNz(p, v, n) { return coefs(p, v, n).every(function (c) { return c !== 0 && Math.abs(c) <= 99; }); }
  function sgn(n) { return n < 0 ? '-' + (-n) : '+' + n; }
  function cat(a, b) { return b.charAt(0) === '-' ? a + b : a + '+' + b; }
  function par(n) { return n < 0 ? '(' + n + ')' : String(n); }

  /* a polynomial part (or a box checker) with classic wrong answers; wrongs equal to the key (or to each other) are dropped */
  function wlist(target, ws) {
    var seen = [PL.lift(target)], W = [];
    (ws || []).forEach(function (w) { if (!w || !w.is) return; var p = PL.lift(w.is); if (seen.some(function (s) { return PL.eq(s, p); })) return; seen.push(p); W.push({ is: p, code: w.code, hint: w.hint }); });
    return W;
  }
  /* the given expression typed back unchanged would be "right value, wrong form" (2/3 in a test): mark it wrong, no credit */
  function givenGuard(prompt, chk) {
    var gs = (String(prompt).replace(/<svg[\s\S]*?<\/svg>/g, '').match(/\\\(([\s\S]*?)\\\)/g) || []).map(function (m) { var q = HW.ex.parse(m.slice(2, -2)); return q.ok ? JSON.stringify(q.ast) : null; }).filter(Boolean);
    return function (resp) {
      var res = chk(resp);
      if (res && res.v === 'form' && typeof resp === 'string') { var q = HW.ex.parse(resp); if (q.ok && gs.indexOf(JSON.stringify(q.ast)) >= 0) return wrong('unchanged', 'That is the expression you were given. <b>Expand</b> it: multiply out the brackets, then collect like terms.'); }
      return res;
    };
  }
  function pp(prompt, target, ws, sol, hints, text, opt) {
    opt = opt || {};
    var W = wlist(target, ws), part = KP.poly(prompt, target, Object.assign({}, opt, { wrong: W }), sol, hints, text);
    part.check = givenGuard(prompt, part.check);
    part.bad = W.map(function (w) { return tx(w.is); });
    return part;
  }
  function pchk(target, ws, opt) { var W = wlist(target, ws); return { check: K.poly(target, Object.assign({}, opt || {}, { wrong: W })), bad: W.map(function (w) { return tx(w.is); }) }; }
  function pbox(label, vars, extra) { return Object.assign({ label: label, name: label.replace(/\\\(|\\\)|<[^>]+>/g, '').replace(/:$/, ''), mode: 'math', keys: 'poly', vars: vars, wide: true }, extra || {}); }
  function nbox(label, extra) { return Object.assign({ label: label, name: label.replace(/\\\(|\\\)|<[^>]+>/g, '').replace(/:$/, '') }, extra || {}); }
  function numChk(ans, alts) { return K.number(ans, function (v) { for (var i = 0; i < alts.length; i++) if (alts[i] && v === alts[i].v && v !== ans) return { code: alts[i].code, hint: alts[i].hint }; return null; }); }
  /* bad answer rows for a fields part: the key with box i replaced by each value in vals */
  function badRows(key, i, vals) { var out = []; vals.forEach(function (v) { if (v == null || String(v) === String(key[i])) return; var row = key.slice(); row[i] = String(v); out.push(row); }); return out; }

  /* ---------- binomial products: FOIL and its classic wrong answers ---------- */
  function foil(A, B, C, D) { var Fp = mul(A, C), O = mul(A, D), I = mul(B, C), L = mul(B, D); return { F: Fp, O: O, I: I, L: L, res: add(Fp, O, I, L) }; }
  function binWrongs(A, B, C, D) {
    var f = foil(A, B, C, D);
    return [
      { is: add(f.F, f.L), code: 'u3x-fl-only', hint: 'Two binomials make <b>four</b> products. You have the First and Last ones — the Outside and Inside products give the middle term.' },
      { is: add(f.F, f.O, f.L), code: 'u3x-one-middle', hint: 'You have only one of the two middle products. Find both the Outside product and the Inside product, then collect them.' },
      { is: add(f.F, f.I, f.L), code: 'u3x-one-middle', hint: 'You have only one of the two middle products. Find both the Outside product and the Inside product, then collect them.' },
      { is: add(f.F, f.O, f.I, neg(f.L)), code: 'u3x-last-sign', hint: 'Check the sign of the last term: ' + t(pf(B) + '\\cdot ' + pf(D)) + '.' }];
  }
  function foilSol(A, B, C, D) {
    var f = foil(A, B, C, D), s4 = seq([f.F, f.O, f.I, f.L]);
    return 'FOIL: First ' + t(tx(f.F)) + ', Outside ' + t(tx(f.O)) + ', Inside ' + t(tx(f.I)) + ', Last ' + t(tx(f.L)) + '.<br>' + t('(' + seq([A, B]) + ')(' + seq([C, D]) + ')=' + s4 + (s4 !== tx(f.res) ? '=' + tx(f.res) : ''));
  }
  var FOIL_HINTS = ['Multiply each term of the first bracket by each term of the second: First, Outside, Inside, Last.', 'Then collect the two middle (like) terms. Watch the signs.'];

  /* ---------- figures (inline SVG; plain labels with italic letters) ---------- */
  var INK = '#1c2230', SH = '#d3d8df', SH2 = '#e9ecf0';
  function f1(n) { return Math.round(n * 10) / 10; }
  function svgLab(s) {
    var out = '';
    s = String(s).replace(/\\left|\\right|\\,/g, '');
    for (var i = 0; i < s.length; i++) {
      var c = s[i];
      if (c === '^') { var mm = /^\^\{([^}]*)\}/.exec(s.slice(i)) || /^\^(.)/.exec(s.slice(i)); out += '<tspan dy="-6" font-size="11">' + HW.esc(mm[1]) + '</tspan><tspan dy="6"> </tspan>'; i += mm[0].length - 1; continue; }
      if (/[a-z]/i.test(c)) { out += '<tspan font-style="italic">' + c + '</tspan>'; continue; }
      if ((c === '-' || c === '+') && i > 0 && s[i - 1] !== '(') { out += ' ' + (c === '-' ? '−' : '+') + ' '; continue; }
      if (c === '-') { out += '−'; continue; }
      out += HW.esc(c);
    }
    return out;
  }
  function textEl(x, y, s, o) {
    o = o || {};
    var px = o.rot ? x + 5 : x, py = o.rot ? y : y + 5;
    return '<text x="' + f1(px) + '" y="' + f1(py) + '" text-anchor="middle"' + (o.rot ? ' transform="rotate(-90 ' + f1(px) + ' ' + f1(py) + ')"' : '') + (o.size ? ' font-size="' + o.size + '"' : '') + '>' + svgLab(s) + (o.unit ? ' ' + HW.esc(o.unit) : '') + '</text>';
  }
  function rectEl(x, y, w, h, fill, o) { o = o || {}; return '<rect x="' + f1(x) + '" y="' + f1(y) + '" width="' + f1(w) + '" height="' + f1(h) + '" fill="' + fill + '" stroke="' + INK + '" stroke-width="' + (o.w || 2) + '"' + (o.dash ? ' stroke-dasharray="' + o.dash + '"' : '') + '/>'; }
  function svgWrap(w, h, body, label, maxw) {
    return '<svg class="fig-svg" viewBox="0 0 ' + f1(w) + ' ' + f1(h) + '" width="100%" style="max-width:' + (maxw || Math.round(w * 1.2)) + 'px" role="img" aria-label="' + HW.esc(label) + '" font-family="KaTeX_Main, \'Times New Roman\', Times, serif" font-size="16" fill="' + INK + '">' + body + '</svg>';
  }
  /* a rectangle W × H (pixels) labelled along the top and the left side; opt.inner = { w, h, top, left } for a rectangle inside it */
  function rectFig(top, left, opt) {
    opt = opt || {};
    var W = opt.W || 230, H = opt.H || 130, L = 40, Tp = 30, w = L + W + 14, h = Tp + H + 12, body = '';
    body += rectEl(L, Tp, W, H, opt.inner ? SH : SH2);
    body += textEl(L + W / 2, Tp - 14, top, { unit: opt.unit }) + textEl(L - 16, Tp + H / 2, left, { rot: true, unit: opt.unit });
    if (opt.inner) {
      var iw = opt.inner.w, ih = opt.inner.h, ix = L + (W - iw) / 2 + 8, iy = Tp + (H - ih) / 2 + 8;
      body += rectEl(ix, iy, iw, ih, '#ffffff', { w: 1.6 });
      body += textEl(ix + iw / 2 + 6, iy + 15, opt.inner.top, { size: 14 }) + textEl(ix + 19, iy + ih / 2 + 8, opt.inner.left, { rot: true, size: 14 });
    }
    return svgWrap(w, h, body, opt.label || 'rectangle', opt.maxw || 320);
  }

  /* ======================= Lesson 1: Polynomials — review and preview ======================= */
  var L1_VARS = ['x', 'y', 'm', 't', 'n', 'w', 'k'];
  function l1q1(r) {
    var v = r.pick(L1_VARS), n = r.int(3, 6), k = r.int(2, n - 1), a = r.pick([-1, 1]) * r.int(2, 9), b = nz(r, 1, 9), c = nz(r, 1, 9), d = nz(r, 1, 12);
    var terms = [T(a, v, n), T(b, v, k), T(c, v, 1), T(d, v, 0)], shown = pickWhere(function () { return r.shuffle([0, 1, 2, 3]); }, function (o) { return o[0] !== 0 && o.join() !== '0,1,2,3'; });
    var written = shown.map(function (i) { return terms[i]; }), P = sumOf(terms), firstC = [a, b, c, d][shown[0]];
    var desc = PL.tex(P, { order: 'desc', var: v }), wrote = seq(written);
    var lcC = numChk(a, [{ v: firstC, code: 'u3x-lc-first', hint: 'That is the coefficient of the term written first. The <b>leading</b> coefficient belongs to the term with the <b>highest</b> power of ' + t(v) + ', which comes first once the polynomial is in descending order.' },
      { v: -a, code: 'u3x-lc-sign', hint: 'The sign in front of a term belongs to its coefficient.' }, { v: n, code: 'u3x-lc-exp', hint: 'That is the exponent (the degree). The leading coefficient is the <b>number</b> in front of the highest power.' }]);
    var degC = numChk(n, [{ v: 4, code: 'u3x-deg-terms', hint: 'That is the number of terms. The degree of a one-variable polynomial is its <b>highest exponent</b>.' },
      { v: n + k + 1, code: 'u3x-deg-sum', hint: 'Don’t add the exponents of different terms. The degree is the highest exponent of any one term.' }, { v: Math.abs(a), code: 'u3x-deg-coef', hint: 'That is a coefficient. The degree is an <b>exponent</b>: the highest power of ' + t(v) + '.' }]);
    var key = [desc, String(a), String(n)];
    var p = KP.fields('Write ' + t(wrote) + ' in <b>descending</b> powers of ' + t(v) + '. Then state its leading coefficient and its degree.',
      [pbox('Descending order:', [v]), nbox('Leading coefficient:'), nbox('Degree:')],
      [K.poly(P, { order: 'desc', var: v }), lcC, degC], key,
      t(desc) + '; leading coefficient ' + t(a) + ', degree ' + t(n),
      'Descending order puts the highest power of ' + t(v) + ' first and the constant last: ' + t(desc) + '.<br>The leading coefficient is the coefficient of that first term: ' + t(a) + ' (not ' + t(firstC) + ', the number that happens to be written first).<br>The degree is the highest exponent: ' + t(n) + '.',
      ['Find the term with the highest power of ' + t(v) + ': it goes first, and its coefficient (with its sign) is the leading coefficient.', 'The degree of a one-variable polynomial is its highest exponent.'], 'descending order, leading coefficient, degree');
    p.bad = [[wrote, String(a), String(n)]].concat(badRows(key, 1, [firstC, -a]), badRows(key, 2, [4, n + k + 1]));
    return p;
  }
  function l1q2(r) {
    var v = r.pick(['x', 'a', 'm', 'y', 'p']);
    var s = pickWhere(function () {
      var A = [r.int(1, 6), nz(r, 1, 8), nz(r, 1, 9)], B = [nz(r, 1, 6), nz(r, 1, 8), nz(r, 1, 9)], C = [r.int(1, 7), nz(r, 1, 8), nz(r, 1, 9)];
      return { A: A, B: B, C: C };
    }, function (s) {
      for (var i = 0; i < 3; i++) { var w = s.A[i] + s.B[i] - s.C[i]; if (!w || Math.abs(w) > 15 || s.A[i] + s.B[i] === 0 || s.A[i] + s.B[i] + s.C[i] === 0) return false; }
      return s.B[0] > 0 || s.A[0] + s.B[0] !== 0;
    });
    function q(c) { return add(T(c[0], v, 2), T(c[1], v, 1), N(c[2])); }
    var A = q(s.A), B = q(s.B), C = q(s.C), S = add(A, B), R = sub(S, C);
    var Bw = r.chance(0.5) ? seq([N(s.B[2]), T(s.B[1], v, 1), T(s.B[0], v, 2)]) : tx(B);
    var firstSign = add(S, T(-s.C[0], v, 2), T(s.C[1], v, 1), N(s.C[2]));
    return pp('From the sum of ' + t('(' + tx(A) + ')') + ' and ' + t('(' + Bw + ')') + ', subtract ' + t('(' + tx(C) + ')') + '. Simplify.', R,
      [{ is: add(S, C), code: 'u3x-added-c', hint: 'The last polynomial is <b>subtracted</b>, not added: change the sign of every one of its terms.' },
        { is: firstSign, code: 'u3x-first-sign', hint: 'The minus sign in front of ' + t(br(C)) + ' reaches <b>every</b> term inside the bracket, not just the first one.' },
        { is: sub(C, S), code: 'u3x-reversed', hint: '“From the sum, subtract ' + t(br(C)) + '” means <b>sum</b> − ' + t(br(C)) + ', not the other way round.' },
        { is: sub(sub(A, B), C), code: 'u3x-sub-both', hint: t(br(A)) + ' and ' + t('(' + Bw + ')') + ' are <b>added</b> first; only ' + t(br(C)) + ' is subtracted.' }],
      'Sum first: ' + t(br(A) + '+(' + Bw + ')=' + tx(S)) + '.<br>Subtract by adding the opposite of every term: ' + t('(' + tx(S) + ')-' + br(C) + '=' + tx(S) + '+(' + tx(neg(C)) + ')') + '<br>' + t('=' + tx(R)),
      ['Add the first two polynomials, then subtract the third from that sum.', 'Subtracting a bracket changes the sign of <b>every</b> term in it. Then collect like terms.'], 'from a sum, subtract a polynomial');
  }
  function l1q3(r) {
    var v = r.pick(['x', 'x', 'a', 'n']);
    var s = pickWhere(function () { return { l: [r.int(2, 6), nz(r, 1, 7), nz(r, 1, 9)], w: [r.int(1, 4), nz(r, 1, 6), nz(r, 1, 9)] }; },
      function (s) { return s.l[0] !== s.w[0] && [0, 1, 2].every(function (i) { return s.l[i] + s.w[i] !== 0 && s.l[i] !== s.w[i]; }); });
    function q(c) { return add(T(c[0], v, 2), T(c[1], v, 1), N(c[2])); }
    var Lp = q(s.l), W = q(s.w), P = scale(add(Lp, W), 2);
    return pp('A rectangle has a perimeter of ' + t('(' + tx(P) + ')') + ' cm. Its length is ' + t('(' + tx(Lp) + ')') + ' cm. Write and simplify an expression for its <b>width</b>.', W,
      [{ is: sub(P, scale(Lp, 2)), code: 'u3x-no-half', hint: 'You took away both lengths ✓ — what is left is <b>two</b> widths. Divide by ' + t('2') + '.' },
        { is: sub(P, Lp), code: 'u3x-one-length', hint: 'A rectangle has <b>two</b> lengths and two widths: ' + t('P=2L+2W') + '.' },
        { is: scale(sub(P, Lp), [1, 2]), code: 'u3x-half-first', hint: 'Use ' + t('P=2L+2W') + ': subtract <b>both</b> lengths, then divide by ' + t('2') + '.' },
        { is: scale(P, [1, 2]), code: 'u3x-half-only', hint: 'Half the perimeter is one length plus one width. Now subtract the length.' }],
      t('P=2L+2W') + ', so ' + t('2W=P-2L') + '.<br>' + t('2W=(' + tx(P) + ')-2(' + tx(Lp) + ')=' + tx(P) + '+(' + tx(scale(Lp, -2)) + ')=' + tx(scale(W, 2))) + '<br>' + t('W=' + tx(W)) + ' cm',
      ['A rectangle has two lengths and two widths: ' + t('P=2L+2W') + '.', 'Subtract both lengths from the perimeter, then divide what is left by ' + t('2') + '.'], 'rectangle width from perimeter');
  }

  /* ======================= Lesson 2: monomials and binomials ======================= */
  function l2q1a(r) {
    var v = r.pick(['x', 'y', 'a', 'm']), c = r.int(2, 6), a = r.int(1, 5), b = nz(r, 1, 8), d = nz(r, 1, 9);
    var m = T(c, v, 1), terms = [T(a, v, 2), T(b, v, 1), N(d)], res = mul(m, sumOf(terms));
    var prods = terms.map(function (q) { return mul(m, q); });
    return pp(t(tx(m) + '(' + seq(terms) + ')'), res,
      [{ is: add(prods[0], terms[1], terms[2]), code: 'u3x-first-only', hint: 'Multiply <b>every</b> term in the bracket by ' + t(tx(m)) + ', not just the first one.' },
        { is: scale(sumOf(terms), c), code: 'u3x-num-only', hint: 'The monomial is ' + t(tx(m)) + ': the ' + t(v) + ' multiplies each term too, so every exponent goes up by ' + t('1') + '.' },
        { is: add(prods[0], scale(terms[1], c), scale(terms[2], c)), code: 'u3x-var-first', hint: 'The ' + t(v) + ' in ' + t(tx(m)) + ' multiplies <b>every</b> term in the bracket, not just the first.' }],
      'Multiply ' + t(tx(m)) + ' by each term (multiply the coefficients, add the exponents):<br>' + t(prods.map(function (q, i) { return (i ? '+' : '') + tx(m) + '(' + tx(terms[i]) + ')'; }).join('').replace(/\+\-/g, '-') + '=' + tx(res)),
      ['Multiply ' + t(tx(m)) + ' by <b>each</b> of the three terms.', t(v + '\\cdot ' + v + '^{2}=' + v + '^{3}') + ': add the exponents.'], 'monomial × trinomial');
  }
  function l2q1b(r) {
    var v = r.pick(['x', 'y', 'n', 'k', 'w']), pq = pickWhere(function () { return [nz(r, 2, 9), nz(r, 2, 9)]; }, function (pq) { return Math.abs(pq[0]) !== Math.abs(pq[1]); });
    var A = V(v), B = N(pq[0]), C = V(v), D = N(pq[1]);
    return pp(t('(' + seq([A, B]) + ')(' + seq([C, D]) + ')'), foil(A, B, C, D).res, binWrongs(A, B, C, D), foilSol(A, B, C, D), FOIL_HINTS, 'binomial × binomial (x + p)(x + q)');
  }
  function l2q2(r) {
    var vs = r.pick([['a', 'b'], ['m', 'n'], ['x', 'y'], ['p', 'q'], ['r', 's']]);
    var s = pickWhere(function () { return { a: r.int(2, 5), b: nz(r, 1, 7), c: r.int(2, 5), d: nz(r, 1, 7) }; }, function (s) { return s.a * s.d + s.b * s.c !== 0 && (s.b < 0 || s.d < 0) && !(s.a === s.c && s.b === s.d); });
    var A = T(s.a, vs[0], 1), B = M(s.b, (function () { var o = {}; o[vs[1]] = 1; return o; })()), C = T(s.c, vs[0], 1), D = M(s.d, (function () { var o = {}; o[vs[1]] = 1; return o; })());
    return pp(t('(' + seq([A, B]) + ')(' + seq([C, D]) + ')'), foil(A, B, C, D).res, binWrongs(A, B, C, D), foilSol(A, B, C, D), FOIL_HINTS.concat([]), 'binomial × binomial, two variables');
  }
  function l2q3Shared(r) {
    return pickWhere(function () { return { a: r.int(2, 5), p: nz(r, 2, 7), q: r.int(2, 4), b: nz(r, 1, 8), v: r.pick(['x', 'x', 'y', 'n']) }; },
      function (s) { var c = s.a * s.b + s.p * s.q; return c !== 0 && Math.abs(s.b) !== Math.abs(s.p) && s.a !== s.q && Math.abs(c) !== Math.abs(s.a * s.b) && Math.abs(c) !== Math.abs(s.p * s.q); });
  }
  function l2q3(r, s) {
    var a = s.a, p = s.p, q = s.q, b = s.b, v = s.v, L = a * q, Cn = p * b, c = a * b + p * q;
    var lhs = '(a' + v + sgn(p) + ')(' + q + v + '+b)', rhs = L + v + '^{2}+c' + v + sgn(Cn);
    var key = [String(a), String(b), String(c)];
    var pt = KP.fields('Find the values of ' + t('a') + ', ' + t('b') + ' and ' + t('c') + ' so that ' + t(lhs + '=' + rhs) + ' for every value of ' + t(v) + '.',
      [nbox(t('a=')), nbox(t('b=')), nbox(t('c='))],
      [numChk(a, [{ v: L - q, code: 'u3x-a-sub', hint: 'The first terms multiply: ' + t('a' + v + '\\cdot ' + q + v + '=' + L + v + '^{2}') + '. What times ' + t(q) + ' is ' + t(L) + '?' }]),
        numChk(b, [{ v: -b, code: 'u3x-b-sign', hint: 'The last terms multiply to the constant: ' + t(par(p) + '\\times b=' + Cn) + '. Check the sign.' }, { v: Cn - p, code: 'u3x-a-sub', hint: 'The last terms <b>multiply</b> to the constant: ' + t(par(p) + '\\times b=' + Cn) + '.' }]),
        numChk(c, [{ v: a * b, code: 'u3x-c-one', hint: 'The ' + t(v) + '-term has <b>two</b> parts: the Outside product ' + t('a' + v + '\\cdot b') + ' and the Inside product ' + t(par(p) + '\\cdot ' + q + v) + '.' },
          { v: p * q, code: 'u3x-c-one', hint: 'The ' + t(v) + '-term has <b>two</b> parts: the Outside product ' + t('a' + v + '\\cdot b') + ' and the Inside product ' + t(par(p) + '\\cdot ' + q + v) + '.' },
          { v: a * b - p * q, code: 'u3x-c-sign', hint: 'Add the Outside and Inside products, keeping each one’s sign.' }, { v: p * q - a * b, code: 'u3x-c-sign', hint: 'Add the Outside and Inside products, keeping each one’s sign.' }])],
      key, t('a=' + a) + ', ' + t('b=' + b) + ', ' + t('c=' + c),
      'First terms: ' + t('a' + v + '\\cdot ' + q + v + '=' + L + v + '^{2}') + ', so ' + t('a=' + L + '\\div ' + q + '=' + a) + '.<br>Last terms: ' + t(par(p) + '\\cdot b=' + Cn) + ', so ' + t('b=' + Cn + '\\div ' + par(p) + '=' + b) + '.<br>Middle term: Outside + Inside ' + t('=' + a + v + '\\cdot ' + par(b) + '+' + par(p) + '\\cdot ' + q + v + '=' + (a * b) + v + sgn(p * q) + v + '=' + c + v) + ', so ' + t('c=' + c) + '.<br>Check: ' + t('(' + a + v + sgn(p) + ')(' + q + v + sgn(b) + ')=' + tx(add(T(L, v, 2), T(c, v, 1), N(Cn)))),
      ['Match the parts of FOIL: the First terms give ' + t(L + v + '^{2}') + ' and the Last terms give ' + t(Cn) + '.', 'Once you know ' + t('a') + ' and ' + t('b') + ', the middle coefficient is Outside + Inside.'], 'working backwards: (ax + p)(qx + b)');
    pt.bad = badRows(key, 0, [L - q]).concat(badRows(key, 1, [-b]), badRows(key, 2, [a * b, p * q, a * b - p * q]));
    return pt;
  }

  /* ======================= Lesson 3: special products ======================= */
  function sqWrongs(A, B) { // (A + B)²
    var A2 = mul(A, A), B2 = mul(B, B), AB = mul(A, B);
    return [{ is: add(A2, B2), code: 'u3x-no-middle', hint: 'A square of a binomial is the binomial times <b>itself</b>. The Outside and Inside products give a middle term: ' + t('2\\cdot ' + pf(A) + '\\cdot ' + pf(B)) + '.' },
      { is: add(A2, AB, B2), code: 'u3x-middle-once', hint: 'The Outside and Inside products are equal, so the middle term is <b>doubled</b>: ' + t('2\\cdot ' + pf(A) + '\\cdot ' + pf(B)) + '.' },
      { is: add(A2, scale(AB, 2), neg(B2)), code: 'u3x-last-neg', hint: 'The last term is ' + t(pf(B) + '^{2}') + ': a square is never negative.' },
      { is: add(A2, scale(AB, -2), B2), code: 'u3x-mid-sign', hint: 'Check the sign of the middle term: ' + t('2\\cdot ' + pf(A) + '\\cdot ' + pf(B)) + '.' }];
  }
  function sqSol(A, B) {
    var A2 = mul(A, A), B2 = mul(B, B), AB2 = scale(mul(A, B), 2);
    return 'Square of a binomial: ' + t('(a+b)^{2}=a^{2}+2ab+b^{2}') + '.<br>' + t('(' + seq([A, B]) + ')^{2}=' + pf(A) + '^{2}+2' + pf(A) + pf(B) + '+' + pf(B) + '^{2}=' + seq([A2, AB2, B2]));
  }
  function l3q1a(r) {
    var v = r.pick(['x', 'y', 'n', 't']), a = nz(r, 3, 12), A = V(v), B = N(a);
    return pp(t('(' + seq([A, B]) + ')^{2}'), mul(add(A, B), add(A, B)), sqWrongs(A, B), sqSol(A, B), ['Write it as ' + t('(' + seq([A, B]) + ')(' + seq([A, B]) + ')') + ' — or use ' + t('(a+b)^{2}=a^{2}+2ab+b^{2}') + '.', 'The middle term is <b>twice</b> the product of the two terms.'], 'square of a binomial');
  }
  function l3q1b(r) {
    var v = r.pick(['x', 'm', 'p', 'z']), b = r.int(4, 15), A = V(v), plusFirst = r.chance(0.5);
    var res = sub(mul(A, A), N(b * b));
    return pp(t(plusFirst ? '(' + v + '+' + b + ')(' + v + '-' + b + ')' : '(' + v + '-' + b + ')(' + v + '+' + b + ')'), res,
      [{ is: add(mul(A, A), N(b * b)), code: 'u3x-dsq-plus', hint: 'The Last terms are ' + t('(+' + b + ')(-' + b + ')') + ': one positive and one negative, so the product is negative.' },
        { is: add(mul(A, A), T(2 * b, v, 1), N(-b * b)), code: 'u3x-dsq-middle', hint: 'The Outside and Inside products are ' + t('+' + b + v) + ' and ' + t('-' + b + v) + ': they cancel, so there is no middle term.' },
        { is: add(mul(A, A), T(-2 * b, v, 1), N(-b * b)), code: 'u3x-dsq-middle', hint: 'The Outside and Inside products are ' + t('+' + b + v) + ' and ' + t('-' + b + v) + ': they cancel, so there is no middle term.' }],
      'Sum × difference: ' + t('(a+b)(a-b)=a^{2}-b^{2}') + '. The middle products ' + t('+' + b + v) + ' and ' + t('-' + b + v) + ' cancel.<br>' + t(v + '^{2}-' + b + '^{2}=' + tx(res)),
      ['The two middle products are opposites — what happens when you add them?', 'Use ' + t('(a+b)(a-b)=a^{2}-b^{2}') + '.'], 'sum × difference');
  }
  function l3q2(r) {
    var v = r.pick(['x', 'y', 'a', 'n']), s = pickWhere(function () { return { k: r.int(2, 4), a: r.int(2, 5), b: nz(r, 1, 7) }; }, function (s) { return HW.ex.gcd(s.a, Math.abs(s.b)) === 1; });
    var A = T(s.a, v, 1), B = N(s.b), sq = mul(add(A, B), add(A, B)), res = scale(sq, s.k), A2 = mul(A, A), AB = mul(A, B), B2 = mul(B, B);
    return pp(t(s.k + '(' + seq([A, B]) + ')^{2}'), res,
      [{ is: mul(scale(add(A, B), s.k), scale(add(A, B), s.k)), code: 'u3x-k-inside', hint: 'Order of operations: the square comes <b>before</b> multiplying by ' + t(s.k) + '. Square the binomial first, then multiply every term by ' + t(s.k) + '.' },
        { is: scale(add(A2, B2), s.k), code: 'u3x-no-middle', hint: 'A square of a binomial has a middle term: ' + t('2\\cdot ' + pf(A) + '\\cdot ' + pf(B)) + '.' },
        { is: add(scale(A2, s.k), scale(AB, 2), B2), code: 'u3x-k-first', hint: 'The ' + t(s.k) + ' multiplies <b>every</b> term of the expanded square.' },
        { is: sq, code: 'u3x-k-lost', hint: 'Your square is right — now multiply it by the ' + t(s.k) + ' in front.' },
        { is: scale(add(A2, AB, B2), s.k), code: 'u3x-middle-once', hint: 'The middle term of a square is <b>doubled</b>: ' + t('2\\cdot ' + pf(A) + '\\cdot ' + pf(B)) + '.' }],
      'Square first, then multiply by ' + t(s.k) + ':<br>' + t('(' + seq([A, B]) + ')^{2}=' + tx(sq)) + '<br>' + t(s.k + '(' + tx(sq) + ')=' + tx(res)),
      ['Expand the square first (order of operations), then multiply every term by ' + t(s.k) + '.', t('(a+b)^{2}=a^{2}+2ab+b^{2}') + ' — don’t forget the middle term.'], 'k(ax + b)²');
  }
  function l3q3Shared(r) { var a = r.int(2, 7); return { a: a, d: r.int(1, a - 1), what: r.pick(['patio', 'garden', 'tile', 'deck', 'rug']), u: r.pick(['m', 'm', 'cm']) }; }
  function l3q3(r, s) {
    var a = s.a, d = s.d, x = V('x'), Sq = mul(lin(1, a), lin(1, a)), Rc = mul(lin(1, a + d), lin(1, a - d)), u = s.u;
    var c1 = pchk(Sq, sqWrongs(x, N(a))), c2 = pchk(Rc, [{ is: add(Sq, N(d * d)), code: 'u3x-dsq-plus', hint: 'Expand the rectangle’s area carefully: the Last terms are ' + t('(' + a + '+' + d + ')(' + a + '-' + d + ')') + '.' }].concat(binWrongs(x, N(a + d), x, N(a - d))));
    var key = [tx(Sq), tx(Rc), String(d * d)];
    var pt = KP.fields('A square ' + s.what + ' has sides of ' + t('(x+' + a + ')') + ' ' + u + '. A rectangular ' + s.what + ' is ' + t('(x+' + (a + d) + ')') + ' ' + u + ' long and ' + t('(x' + sgn(a - d) + ')') + ' ' + u + ' wide. Write each area as a polynomial, then find how much greater the square’s area is.',
      [pbox('Square’s area:', ['x'], { after: t('\\text{' + u + '}^{2}') }), pbox('Rectangle’s area:', ['x'], { after: t('\\text{' + u + '}^{2}') }), nbox('The square is greater by:', { after: t('\\text{' + u + '}^{2}') })],
      [c1.check, c2.check, numChk(d * d, [{ v: d, code: 'u3x-diff-d', hint: 'Subtract the two areas term by term: what is left is a <b>square</b>.' }, { v: -d * d, code: 'u3x-diff-sign', hint: 'Subtract the rectangle’s area <b>from</b> the square’s area.' }, { v: 2 * d, code: 'u3x-diff-2d', hint: 'Subtract the two expanded areas term by term: the ' + t('x^{2}') + ' and ' + t('x') + ' terms cancel, and what is left is a square.' }])],
      key, t(tx(Sq)) + ', ' + t(tx(Rc)) + '; greater by ' + t(d * d) + ' ' + t('\\text{' + u + '}^{2}'),
      'Square: ' + t('(x+' + a + ')^{2}=' + tx(Sq)) + '.<br>Rectangle: ' + t('(x+' + (a + d) + ')(x' + sgn(a - d) + ')=' + tx(Rc)) + '.<br>Difference: ' + t('(' + tx(Sq) + ')-(' + tx(Rc) + ')=' + (a * a) + '-' + par(a * a - d * d) + '=' + d * d) + '.<br>The ' + t('x^{2}') + ' and ' + t('x') + ' terms cancel, so the square is always ' + t(d * d) + ' ' + t('\\text{' + u + '}^{2}') + ' greater, whatever ' + t('x') + ' is. (The rectangle is ' + t('(N+' + d + ')(N-' + d + ')=N^{2}-' + d * d) + ' with ' + t('N=x+' + a) + '.)',
      ['Expand both areas. For the rectangle, multiply the two binomials with FOIL.', 'Subtract the rectangle’s area from the square’s, term by term.'], 'square vs rectangle areas');
    pt.bad = badRows(key, 0, c1.bad.slice(0, 2)).concat(badRows(key, 1, c2.bad.slice(0, 2)), badRows(key, 2, [d, -d * d]));
    return pt;
  }

  /* ======================= Lesson 4: binomial × trinomial, three binomials ======================= */
  function l4q1(r) {
    var v = r.pick(['x', 'x', 'a', 'p']), s = pickWhere(function () { return { p: nz(r, 1, 6), b: nz(r, 1, 7), c: nz(r, 1, 9) }; }, function (s) { return s.b + s.p !== 0 && s.c + s.p * s.b !== 0 && Math.abs(s.p) !== Math.abs(s.b); });
    var x = V(v), P = N(s.p), tri = [T(1, v, 2), T(s.b, v, 1), N(s.c)], res = mul(add(x, P), sumOf(tri));
    var xs = tri.map(function (q) { return mul(x, q); }), ps = tri.map(function (q) { return mul(P, q); });
    var grid = HW.areaModel(tri.map(lab), [v, lab(P, 1)], [['', '', ''], ['', '', '']], { widths: [1.3, 1.1, 0.8], max: 300 });
    return pp('Use the grid to help you expand and simplify ' + t('(' + seq([x, P]) + ')(' + seq(tri) + ')') + '.' + grid, res,
      [{ is: add(xs[0], xs[2], ps[0], ps[2]), code: 'u3x-foil-only', hint: 'FOIL gives only four products, but a binomial times a trinomial needs ' + t('2\\times 3=6') + '. Fill all six boxes of the grid.' },
        { is: add(xs[0], xs[1], xs[2], ps[0]), code: 'u3x-second-partial', hint: t(tx(P)) + ' must multiply <b>every</b> term of the trinomial, not just the first.' },
        { is: add(xs[0], xs[1], xs[2], neg(ps[0]), neg(ps[1]), neg(ps[2])), code: 'u3x-p-sign', hint: 'Check the signs of the bottom row of the grid: they are products with ' + t(tx(P)) + '.' }],
      'Six products (top row × ' + t(v) + ', bottom row × ' + t(tx(P)) + '):<br>' + t(cat(seq(xs), seq(ps))) + '<br>Collect like terms: ' + t('=' + tx(res)),
      ['Each box of the grid is (side term) × (top term): fill all six.', 'Then collect the like terms — the ' + t(v + '^{2}') + ' boxes and the ' + t(v) + ' boxes.'], 'binomial × trinomial with a grid');
  }
  function l4q2(r) {
    var v = r.pick(['x', 'y', 'n', 'h']), s = pickWhere(function () { return { a: nz(r, 1, 6), b: nz(r, 1, 6), c: r.int(2, 3), d: nz(r, 1, 5) }; },
      function (s) { var res = mul(lin(1, s.a, 'x'), lin(1, s.b, 'x'), lin(s.c, s.d, 'x')); return s.a !== s.b && s.a + s.b !== 0 && allNz(res, 'x', 3); });
    var A = lin(1, s.a, v), B = lin(1, s.b, v), C = lin(s.c, s.d, v), Q = mul(A, B), res = mul(Q, C);
    return pp(t(br(A) + br(B) + br(C)), res,
      [{ is: add(mul(Q, T(s.c, v, 1)), N(s.d)), code: 'u3x-third-partial', hint: 'Every term of ' + t(br(Q)) + ' must be multiplied by <b>both</b> terms of ' + t(br(C)) + '.' },
        { is: mul(add(T(1, v, 2), N(s.a * s.b)), C), code: 'u3x-fl-first', hint: 'Check ' + t(br(A) + br(B)) + ': it has a middle term, ' + t(tx(T(s.a + s.b, v, 1))) + '.' },
        { is: mul(Q, lin(s.c, -s.d, v)), code: 'u3x-third-sign', hint: 'Check the signs of the products with ' + t(sgn(s.d)) + '.' }],
      'Multiply two brackets first: ' + t(br(A) + br(B) + '=' + tx(Q)) + '.<br>Then multiply by ' + t(br(C)) + ': ' + t('(' + tx(Q) + ')' + br(C) + '=' + seq([mul(Q, T(s.c, v, 1)), mul(Q, N(s.d))].map(function (p) { return tx(p); }).join('+').replace(/\+-/g, '-').split(/(?=[+-])/).map(function (x) { return x; })) + '') + '<br>' + t('=' + tx(res)),
      ['Multiply the first two binomials, then multiply that trinomial by the third binomial.', 'The trinomial × binomial step has six products; collect like terms at the end.'], 'three binomials');
  }
  /* Mastery: a cube and a box whose middle edge equals the cube's edge — expand both volumes and compare them
   * (replaces a "find k so a term vanishes" item that duplicated the Unit 3 test's Mastery question) */
  function l4q3Shared(r) {
    return pickWhere(function () { return { m: r.int(1, 6), d: r.int(1, 4), v: r.pick(['x', 'x', 'y', 'n']), u: r.pick(['cm', 'cm', 'm']), what: r.pick(['storage box', 'shipping crate', 'planter', 'toy box']) }; },
      function (s) { return s.m !== s.d; });
  }
  function l4q3(r, s) {
    var v = s.v, m = s.m, d = s.d, u = s.u, X = V(v), E = lin(1, m, v), Lo = lin(1, m - d, v), Hi = lin(1, m + d, v);
    var Cube = mul(E, E, E), Sq = mul(E, E), LH = mul(Lo, Hi), Box = mul(LH, E), Diff = sub(Cube, Box);
    var U3 = t('\\text{' + u + '}^{3}');
    var cc = pchk(Cube, [{ is: add(mul(X, X, X), N(m * m * m)), code: 'u3x-cube-sum', hint: 'A cube of a binomial is the binomial times itself <b>three</b> times: ' + t(br(E) + br(E) + br(E)) + '. Square it first, then multiply by ' + t(br(E)) + ' again.' },
      { is: mul(E, add(mul(X, X), N(m * m))), code: 'u3x-no-middle', hint: 'Check ' + t(br(E) + '^{2}') + ' first: it has a middle term, ' + t(tx(T(2 * m, v, 1))) + '.' },
      { is: mul(E, add(mul(X, X), T(m, v, 1), N(m * m))), code: 'u3x-middle-once', hint: 'The middle term of ' + t(br(E) + '^{2}') + ' is <b>doubled</b>: ' + t(tx(T(2 * m, v, 1))) + '.' }]);
    var bc = pchk(Box, [{ is: mul(E, add(Sq, N(d * d))), code: 'u3x-dsq-plus', hint: 'Check ' + t(br(Lo) + br(Hi)) + ': the Last terms are ' + t(par(m - d) + '\\cdot ' + par(m + d) + '=' + (m * m - d * d)) + '.' },
      { is: mul(E, add(mul(X, X), N(m * m - d * d))), code: 'u3x-fl-only', hint: 'Check ' + t(br(Lo) + br(Hi)) + ': the Outside and Inside products give a middle term, ' + t(tx(T(2 * m, v, 1))) + '.' }]);
    var dc = pchk(Diff, [{ is: neg(Diff), code: 'u3x-vdiff-sign', hint: 'Subtract the ' + s.what + '’s volume <b>from</b> the cube’s volume.' }]);
    var key = [tx(Cube), tx(Box), tx(Diff)];
    var pt = KP.fields('A cube has edges of ' + t(br(E)) + ' ' + u + '. A ' + s.what + ' shaped like a rectangular prism measures ' + t(br(Lo)) + ' ' + u + ' by ' + t(br(E)) + ' ' + u + ' by ' + t(br(Hi)) + ' ' + u + '. Write each volume as an expanded polynomial, then write how much <b>greater</b> the cube’s volume is (also expanded and simplified).',
      [pbox('Cube’s volume:', [v], { after: U3 }), pbox('The ' + s.what + '’s volume:', [v], { after: U3 }), pbox('The cube’s volume is greater by:', [v], { after: U3 })],
      [cc.check, bc.check, dc.check], key, t(tx(Cube)) + '; ' + t(tx(Box)) + '; greater by ' + t(tx(Diff)) + ' ' + U3,
      'Cube: ' + t(br(E) + '^{2}=' + tx(Sq)) + ', so ' + t(br(E) + '^{3}=(' + tx(Sq) + ')' + br(E) + '=' + tx(Cube)) + '.<br>' + s.what.charAt(0).toUpperCase() + s.what.slice(1) + ': ' + t(br(Lo) + br(Hi) + '=' + tx(LH)) + ', so ' + t('V=(' + tx(LH) + ')' + br(E) + '=' + tx(Box)) + '.<br>Difference: ' + t('(' + tx(Cube) + ')-(' + tx(Box) + ')=' + tx(Diff)) + ' ' + U3 + '.<br>The ' + t(v + '^{3}') + ' and ' + t(v + '^{2}') + ' terms cancel. (Shortcut: both volumes have the factor ' + t(br(E)) + ', and ' + t(br(E) + '^{2}-' + br(Lo) + br(Hi) + '=' + d * d) + ', so the difference is ' + t(d * d + br(E)) + '.)',
      ['Volume = length × width × height. Multiply two of the brackets first, then multiply that trinomial by the third bracket.', 'Subtract the ' + s.what + '’s volume from the cube’s, changing the sign of every term you subtract.'], 'cube vs box volumes');
    pt.bad = badRows(key, 0, cc.bad.slice(0, 2)).concat(badRows(key, 1, bc.bad.slice(0, 2)), badRows(key, 2, dc.bad));
    return pt;
  }

  /* ======================= Lesson 5: area, volume and equations ======================= */
  function l5q1Shared(r) { return { a: r.int(2, 5), b: r.int(1, 9), c: r.int(1, 9), n: r.int(2, 10), what: r.pick(['garden', 'patio', 'playground', 'parking lot', 'pool deck']) }; }
  function l5q1a(r, s) {
    var A = lin(s.a, s.b), B = lin(1, s.c), res = mul(A, B);
    return pp('Write the area of the ' + s.what + ' as a polynomial in simplest form.', res,
      binWrongs(T(s.a, 'x', 1), N(s.b), V('x'), N(s.c)).concat([{ is: scale(add(A, B), 2), code: 'u3x-perim', hint: 'That is the perimeter. The area of a rectangle is length × width.' }]),
      'Area = length × width: ' + foilSol(T(s.a, 'x', 1), N(s.b), V('x'), N(s.c)) + ' ' + t('\\text{m}^{2}'),
      ['Area of a rectangle = length × width: multiply the two binomials.', 'Collect the two middle terms.'], 'area of a rectangle', { after: t('\\text{m}^{2}') });
  }
  function l5q1b(r, s) {
    var n = s.n, Lv = s.a * n + s.b, Wv = n + s.c, area = Lv * Wv;
    var pt = KP.number('Find the area of the ' + s.what + ' when ' + t('x=' + n) + '.', area, function (v) {
      if (v === 2 * (Lv + Wv)) return { code: 'u3x-perim', hint: 'That is the perimeter. Area = length × width.' };
      if (v === Lv + Wv) return { code: 'u3x-perim', hint: 'Multiply the length by the width; don’t add them.' };
      return null;
    }, 'When ' + t('x=' + n) + ': length ' + t(s.a + '(' + n + ')+' + s.b + '=' + Lv) + ' m, width ' + t(n + '+' + s.c + '=' + Wv) + ' m.<br>Area ' + t('=' + Lv + '\\times ' + Wv + '=' + area) + ' ' + t('\\text{m}^{2}') + '. (The polynomial from (a) gives the same value.)',
      ['Substitute ' + t('x=' + n) + ' into the length and the width, then multiply.'], 'area value at x', { after: t('\\text{m}^{2}') });
    pt.bad = [String(2 * (Lv + Wv)), String(Lv + Wv)];
    return pt;
  }
  function l5q2(r) {
    var s = pickWhere(function () { return { a: r.int(2, 4), b: r.int(1, 8), c: r.int(2, 4), d: r.int(1, 8), e: r.int(1, 6), f: r.int(1, 4), what: r.pick(['flower bed', 'pond', 'shed', 'sandbox']) }; },
      function (s) { var sh = sub(mul(lin(s.a, s.b), lin(s.c, s.d)), mul(lin(1, s.e), lin(1, -s.f))); return allNz(sh, 'x', 2) && s.e !== s.f; });
    var O = mul(lin(s.a, s.b), lin(s.c, s.d)), I = mul(lin(1, s.e), lin(1, -s.f)), res = sub(O, I);
    var it = PL.terms(I), firstOnly = add(O, neg(T(1, 'x', 2)), sumOf(it.filter(function (q) { return PL.monoTex(q.v) !== 'x^{2}'; }).map(function (q) { return PL.mono(q.c, q.v); })));
    var fig = rectFig('(' + s.a + 'x+' + s.b + ')', '(' + s.c + 'x+' + s.d + ')', { unit: 'm', W: 250, H: 150, inner: { w: 130, h: 80, top: 'x+' + s.e, left: 'x-' + s.f }, label: 'shaded lawn with a ' + s.what + ' inside it' });
    return pp('A rectangular lawn measures ' + t('(' + s.a + 'x+' + s.b + ')') + ' m by ' + t('(' + s.c + 'x+' + s.d + ')') + ' m. A ' + s.what + ' that measures ' + t('(x+' + s.e + ')') + ' m by ' + t('(x-' + s.f + ')') + ' m sits inside it.' + fig + 'Write the area of the shaded lawn (not covered by the ' + s.what + ') as a polynomial in simplest form.', res,
      [{ is: add(O, I), code: 'u3x-added', hint: 'The ' + s.what + '’s area is <b>removed</b> from the lawn: subtract it.' },
        { is: firstOnly, code: 'u3x-sub-first', hint: 'Put the ' + s.what + '’s area in brackets before subtracting: the minus sign changes the sign of <b>every</b> one of its terms.' },
        { is: O, code: 'u3x-outer-only', hint: 'That is the whole rectangle. Subtract the area of the ' + s.what + '.' }],
      'Whole rectangle: ' + t('(' + s.a + 'x+' + s.b + ')(' + s.c + 'x+' + s.d + ')=' + tx(O)) + '.<br>' + s.what.charAt(0).toUpperCase() + s.what.slice(1) + ': ' + t('(x+' + s.e + ')(x-' + s.f + ')=' + tx(I)) + '.<br>Shaded area ' + t('=(' + tx(O) + ')-(' + tx(I) + ')=' + tx(O) + '+(' + tx(neg(I)) + ')=' + tx(res)) + ' ' + t('\\text{m}^{2}'),
      ['Shaded area = area of the whole rectangle − area of the ' + s.what + '.', 'Expand both products, then subtract the second one in brackets (change every sign).'], 'shaded area: rectangle minus rectangle', { after: t('\\text{m}^{2}') });
  }
  function l5q3(r) {
    var s = pickWhere(function () { var a = r.int(3, 9), b = r.int(1, a - 1), x = r.int(b + 2, 14); return { a: a, b: b, x: x, N: (a - b) * x - a * b, u: r.pick(['cm', 'm']) }; }, function (s) { return s.N > 0 && s.N <= 90; });
    var a = s.a, b = s.b, x = s.x, Nn = s.N, d = a - b, u = s.u, L = x + a, W = x - b;
    var key = [String(x), String(L), String(W)];
    var xAlts = [];
    if (Nn % d === 0) xAlts.push({ v: Nn / d, code: 'u3x-ab-lost', hint: 'Expand ' + t('(x+' + a + ')(x-' + b + ')') + ' fully: there is a constant term, ' + t('-' + a * b) + '.' });
    if ((Nn - a * b) % d === 0) xAlts.push({ v: (Nn - a * b) / d, code: 'u3x-ab-sign', hint: 'Check the sign when you move the constant ' + t('-' + a * b) + ' to the other side.' });
    var pt = KP.fields('A square has sides of ' + t('x') + ' ' + u + '. A rectangle is ' + t(a) + ' ' + u + ' longer and ' + t(b) + ' ' + u + ' narrower than the square, so it measures ' + t('(x+' + a + ')') + ' by ' + t('(x-' + b + ')') + '. The rectangle’s area is ' + t(Nn) + ' ' + t('\\text{' + u + '}^{2}') + ' <b>greater</b> than the square’s. Write an equation, solve it for ' + t('x') + ', and give the rectangle’s dimensions.',
      [nbox(t('x=')), nbox('Rectangle’s length:', { after: u }), nbox('Rectangle’s width:', { after: u })],
      [numChk(x, xAlts), numChk(L, [{ v: x, code: 'u3x-gave-x', hint: 'That is ' + t('x') + '. The length is ' + t('x+' + a) + '.' }, { v: W, code: 'u3x-lw-swap', hint: 'That is the width; the length is the longer side.' }]),
        numChk(W, [{ v: x, code: 'u3x-gave-x', hint: 'That is ' + t('x') + '. The width is ' + t('x-' + b) + '.' }, { v: L, code: 'u3x-lw-swap', hint: 'That is the length; the width is the shorter side.' }])],
      key, t('x=' + x) + '; ' + t(L) + ' ' + u + ' by ' + t(W) + ' ' + u,
      t('(x+' + a + ')(x-' + b + ')=x^{2}+' + Nn) + '<br>' + t('x^{2}' + sgn(d) + 'x-' + a * b + '=x^{2}+' + Nn).replace(/\+1x/, '+x') + '<br>' + t((d === 1 ? '' : d) + 'x=' + (Nn + a * b)) + ', so ' + t('x=' + x) + '.<br>Rectangle: ' + t(x + '+' + a + '=' + L) + ' ' + u + ' by ' + t(x + '-' + b + '=' + W) + ' ' + u + '. Check: ' + t(L + '\\times ' + W + '=' + L * W) + ' and ' + t(x + '^{2}+' + Nn + '=' + (x * x + Nn)) + ' ✓',
      ['Rectangle’s area = square’s area + ' + t(Nn) + ': ' + t('(x+' + a + ')(x-' + b + ')=x^{2}+' + Nn) + '.', 'Expand the left side; the ' + t('x^{2}') + '-terms cancel, leaving a linear equation.'], 'equation from areas');
    pt.bad = badRows(key, 0, xAlts.map(function (q) { return q.v; })).concat(badRows(key, 1, [x]), [[String(x), String(W), String(L)]]);
    return pt;
  }

  /* ======================= Lesson 6: unit review ======================= */
  function l6q1a(r) {
    var vs = r.pick([['m', 'n'], ['x', 'y'], ['a', 'b'], ['p', 'q']]);
    var s = pickWhere(function () { var p = r.int(2, 5), q = r.int(2, 5), sx = r.int(Math.max(p, q) + 1, p + q - 1); return { p: p, q: q, s: sx, a: nz(r, 2, 9), b: nz(r, 2, 9), c: nz(r, 2, 9), k: r.int(1, 2) }; }, function (s) { return s.s > Math.max(s.p, s.q) && s.s < s.p + s.q; });
    var o1 = {}; o1[vs[0]] = s.p; o1[vs[1]] = s.q; var o2 = {}; o2[vs[0]] = 1; o2[vs[1]] = s.k; var o3 = {}; o3[vs[1]] = s.s;
    var terms = r.shuffle([M(s.a, o1), M(s.b, o2), M(s.c, o3)]), D = s.p + s.q, all = s.p + s.q + 1 + s.k + s.s;
    var pt = KP.number('State the degree of the polynomial ' + t(seq(terms)) + '.', D, function (v) {
      if (v === s.s) return { code: 'u3x-deg-max', hint: 'For a term with two variables, <b>add</b> its exponents: ' + t(tx(M(1, o1))) + ' has degree ' + t(s.p + '+' + s.q) + '.' };
      if (v === all) return { code: 'u3x-deg-sum', hint: 'Find the degree of <b>each term</b> (add the exponents within the term), then take the highest.' };
      if (v === 3) return { code: 'u3x-deg-terms', hint: 'That is the number of terms. The degree is the highest degree of any one term.' };
      return null;
    }, 'Degree of each term (add the exponents within the term): ' + t(tx(M(s.a, o1))) + ': ' + t(D) + '; ' + t(tx(M(s.b, o2))) + ': ' + t(1 + s.k) + '; ' + t(tx(M(s.c, o3))) + ': ' + t(s.s) + '.<br>The highest is ' + t(D) + ', so the polynomial has degree ' + t(D) + '.',
      ['The degree of a term is the <b>sum</b> of the exponents on its variables.', 'The degree of the polynomial is the highest degree of any one term.'], 'degree of a two-variable polynomial');
    pt.bad = [String(s.s), String(all), '3'];
    return pt;
  }
  function l6q1b(r) {
    var v = r.pick(['t', 'x', 'k', 'r']), s = pickWhere(function () { return { a: r.int(2, 4), p: nz(r, 1, 7), q: nz(r, 1, 7) }; }, function (s) { return s.a * s.q + s.p !== 0 && Math.abs(s.p) !== Math.abs(s.q); });
    var A = T(s.a, v, 1), B = N(s.p), C = V(v), D = N(s.q);
    return pp(t('(' + seq([A, B]) + ')(' + seq([C, D]) + ')'), foil(A, B, C, D).res, binWrongs(A, B, C, D), foilSol(A, B, C, D), FOIL_HINTS, 'binomial × binomial (ax + p)(x + q)');
  }
  function l6q2(r) {
    var v = r.pick(['x', 'y', 'a', 'm']), s = pickWhere(function () { return { c: nz(r, 1, 6), d: nz(r, 1, 9), a: r.int(2, 5), b: nz(r, 1, 6) }; },
      function (s) { var res = mul(add(T(1, 'x', 2), T(s.c, 'x', 1), N(s.d)), lin(s.a, s.b, 'x')); return allNz(res, 'x', 3) && Math.abs(s.b) !== Math.abs(s.c); });
    var tri = [T(1, v, 2), T(s.c, v, 1), N(s.d)], X = T(s.a, v, 1), B = N(s.b), Tr = sumOf(tri), res = mul(Tr, add(X, B));
    var xs = tri.map(function (q) { return mul(X, q); }), bs = tri.map(function (q) { return mul(B, q); });
    return pp(t('(' + seq(tri) + ')(' + seq([X, B]) + ')'), res,
      [{ is: add(xs[0], xs[2], bs[0], bs[2]), code: 'u3x-foil-only', hint: 'A trinomial times a binomial needs ' + t('3\\times 2=6') + ' products, not four.' },
        { is: add(xs[0], xs[1], xs[2], bs[0]), code: 'u3x-second-partial', hint: t(tx(B)) + ' must multiply <b>every</b> term of the trinomial.' },
        { is: add(xs[0], xs[1], xs[2], neg(bs[0]), neg(bs[1]), neg(bs[2])), code: 'u3x-p-sign', hint: 'Check the signs of the products with ' + t(tx(B)) + '.' }],
      'Multiply every term of the trinomial by ' + t(tx(X)) + ' and by ' + t(tx(B)) + ':<br>' + t(cat(seq(xs), seq(bs))) + '<br>' + t('=' + tx(res)),
      ['Each of the 3 terms of the trinomial multiplies each of the 2 terms of the binomial: 6 products.', 'Line up like terms before you collect them.'], 'trinomial × binomial');
  }
  function l6q3(r) {
    var v = r.pick(['x', 'x', 'n']), s = pickWhere(function () { return { k: r.int(2, 3), h: nz(r, 1, 5), q: nz(r, 1, 9) }; }, function (s) { return s.k * s.h * s.h + s.q !== 0; });
    var k = s.k, h = s.h, q = s.q, B = 2 * k * h, C = k * h * h + q, lhs = tx(add(T(k, v, 2), T(B, v, 1), N(C)));
    var key = [String(h), String(q)];
    var pt = KP.fields('Find ' + t('h') + ' and ' + t('q') + ' so that ' + t(lhs + '=' + k + '(' + v + '+h)^{2}+q') + ' for every value of ' + t(v) + '.',
      [nbox(t('h=')), nbox(t('q='))],
      [numChk(h, [{ v: -h, code: 'u3x-h-sign', hint: 'Expand ' + t(k + '(' + v + '+h)^{2}') + ': its ' + t(v) + '-term is ' + t(2 * k + 'h' + v) + '. Match it with ' + t(tx(T(B, v, 1))) + ', sign included.' }, { v: 2 * h, code: 'u3x-h-half', hint: t(k + '(' + v + '+h)^{2}=' + k + v + '^{2}+' + 2 * k + 'h' + v + '+' + k + 'h^{2}') + ': the middle coefficient is ' + t(2 * k + 'h') + ', not ' + t(k + 'h') + '.' }, { v: B / 2, code: 'u3x-h-no-k', hint: 'Remember the ' + t(k) + ' in front: the ' + t(v) + '-term of ' + t(k + '(' + v + '+h)^{2}') + ' is ' + t(2 * k + 'h' + v) + '.' }]),
        numChk(q, [{ v: C - h * h, code: 'u3x-q-no-k', hint: 'The constant of ' + t(k + '(' + v + '+h)^{2}') + ' is ' + t(k + 'h^{2}') + ', not ' + t('h^{2}') + '.' }, { v: C + k * h * h, code: 'u3x-q-sign', hint: t(k + 'h^{2}+q=' + C) + ': subtract ' + t(k + 'h^{2}') + ' from ' + t(C) + '.' }, { v: C - k * k * h * h, code: 'u3x-q-no-k', hint: 'Only ' + t('(' + v + '+h)') + ' is squared, not the ' + t(k) + ': the constant is ' + t(k + 'h^{2}') + '.' }])],
      key, t('h=' + h) + ', ' + t('q=' + q),
      'Expand the right side: ' + t(k + '(' + v + '+h)^{2}+q=' + k + v + '^{2}+' + 2 * k + 'h' + v + '+' + k + 'h^{2}+q') + '.<br>Match the ' + t(v) + '-terms: ' + t(2 * k + 'h=' + B) + ', so ' + t('h=' + h) + '.<br>Match the constants: ' + t(k + '(' + par(h) + ')^{2}+q=' + C) + ', so ' + t(k * h * h + '+q=' + C) + ' and ' + t('q=' + q) + '.<br>Check: ' + t(k + '(' + v + sgn(h) + ')^{2}' + sgn(q) + '=' + lhs) + ' ✓',
      ['Expand ' + t(k + '(' + v + '+h)^{2}+q') + ' and compare it term by term with ' + t(lhs) + '.', 'The ' + t(v) + '-terms give ' + t('h') + '; then the constants give ' + t('q') + '.'], 'match k(x + h)² + q');
    pt.bad = badRows(key, 0, [-h, 2 * h]).concat(badRows(key, 1, [C - h * h, C + k * h * h]));
    return pt;
  }

  /* ======================= the exit slips ======================= */
  HW.defineExit({ lesson: 'u3l1', calc: false, outcome: 'AN4',
    blurb: 'Descending order, leading coefficient and degree; adding and subtracting polynomials; a perimeter worked backwards.',
    questions: [
      { num: '1', outcome: 'AN4', stem: 'Single-variable polynomials.', parts: [{ id: '1', outcome: 'AN4', level: 'BEG', make: l1q1 }] },
      { num: '2', outcome: 'AN4', stem: 'Adding and subtracting polynomials.', parts: [{ id: '2', outcome: 'AN4', level: 'PRG', make: l1q2 }] },
      { num: '3', outcome: 'AN4', stem: 'Perimeter.', parts: [{ id: '3', outcome: 'AN4', level: 'ADV', make: l1q3 }] }] });

  HW.defineExit({ lesson: 'u3l2', calc: false, outcome: 'AN4',
    blurb: 'Monomial × trinomial, binomial × binomial (one and two variables), and a binomial product worked backwards.',
    questions: [
      { num: '1', outcome: 'AN4', stem: 'Expand and simplify.', parts: [{ id: '1a', outcome: 'AN4', level: 'BEG', make: l2q1a }, { id: '1b', outcome: 'AN4', level: 'BEG', make: l2q1b }] },
      { num: '2', outcome: 'AN4', stem: 'Expand and simplify.', parts: [{ id: '2', outcome: 'AN4', level: 'PRG', make: l2q2 }] },
      { num: '3', outcome: 'AN4', stem: 'Working backwards.', shared: l2q3Shared, parts: [{ id: '3', outcome: 'AN4', level: 'MAS', make: l2q3 }] }] });

  HW.defineExit({ lesson: 'u3l3', calc: false, outcome: 'AN4',
    blurb: 'Squares of binomials and sum × difference, k(ax + b)², and comparing a square with a rectangle.',
    questions: [
      { num: '1', outcome: 'AN4', stem: 'Expand and simplify. Use a special-product pattern.', parts: [{ id: '1a', outcome: 'AN4', level: 'BEG', make: l3q1a }, { id: '1b', outcome: 'AN4', level: 'BEG', make: l3q1b }] },
      { num: '2', outcome: 'AN4', stem: 'Expand and simplify.', parts: [{ id: '2', outcome: 'AN4', level: 'PRG', make: l3q2 }] },
      { num: '3', outcome: 'AN4', stem: 'Comparing areas.', shared: l3q3Shared, parts: [{ id: '3', outcome: 'AN4', level: 'MAS', make: l3q3 }] }] });

  HW.defineExit({ lesson: 'u3l4', calc: false, outcome: 'AN4',
    blurb: 'Binomial × trinomial with a grid, a product of three binomials, and comparing the volumes of a cube and a box.',
    questions: [
      { num: '1', outcome: 'AN4', stem: 'Binomial × trinomial.', parts: [{ id: '1', outcome: 'AN4', level: 'BEG', make: l4q1 }] },
      { num: '2', outcome: 'AN4', stem: 'Expand and simplify.', parts: [{ id: '2', outcome: 'AN4', level: 'PRG', make: l4q2 }] },
      { num: '3', outcome: 'AN4', stem: 'Comparing volumes.', shared: l4q3Shared, parts: [{ id: '3', outcome: 'AN4', level: 'MAS', make: l4q3 }] }] });

  HW.defineExit({ lesson: 'u3l5', calc: false, outcome: 'AN4',
    blurb: 'Area of a rectangle as a polynomial and its value, a shaded area, and an equation from comparing areas.',
    questions: [
      { num: '1', outcome: 'AN4', shared: l5q1Shared, stem: function (s) { return 'A rectangular ' + s.what + ' is ' + t('(' + s.a + 'x+' + s.b + ')') + ' m long and ' + t('(x+' + s.c + ')') + ' m wide.' + rectFig('(' + s.a + 'x+' + s.b + ')', '(x+' + s.c + ')', { unit: 'm', W: 230, H: 95, label: 'rectangle' }); },
        parts: [{ id: '1a', outcome: 'AN4', level: 'BEG', make: l5q1a }, { id: '1b', outcome: 'AN4', level: 'BEG', make: l5q1b }] },
      { num: '2', outcome: 'AN4', stem: 'Shaded area.', parts: [{ id: '2', outcome: 'AN4', level: 'PRG', make: l5q2 }] },
      { num: '3', outcome: 'AN4', stem: 'An equation from areas.', parts: [{ id: '3', outcome: 'AN4', level: 'ADV', make: l5q3 }] }] });

  HW.defineExit({ lesson: 'u3l6', calc: false, outcome: 'AN4',
    blurb: 'Unit review mix: degree of a polynomial, binomial and trinomial products, and matching k(x + h)² + q.',
    questions: [
      { num: '1', outcome: 'AN4', stem: 'Degree and a binomial product.', parts: [{ id: '1a', outcome: 'AN4', level: 'BEG', make: l6q1a }, { id: '1b', sub: 'b', outcome: 'AN4', level: 'BEG', make: function (r) { var p = l6q1b(r); p.prompt = 'Expand and simplify ' + p.prompt + '.'; return p; } }] },
      { num: '2', outcome: 'AN4', stem: 'Expand and simplify.', parts: [{ id: '2', outcome: 'AN4', level: 'PRG', make: l6q2 }] },
      { num: '3', outcome: 'AN4', stem: 'Matching coefficients.', parts: [{ id: '3', outcome: 'AN4', level: 'MAS', make: l6q3 }] }] });
  void form; void ok;
})(window);
