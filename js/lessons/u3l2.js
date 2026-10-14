/* Math 10C · Unit 3 · Lesson 2 — Multiplying Monomials and Binomials (AN4)
 * Assignment questions 1–21 (u3_L02.tex, Parts A–B) and the whole Lesson 2 Extra Practice (u3_EP02.tex, Q1–18).
 * Every part is a generator: it keeps the structure of the booklet question (signs, which factor has the coefficient,
 * number of letters, degree) and changes the numbers; the booklet's own numbers are one of the possible values.
 * Keys are built with HW.poly from the generated numbers. Levels: LIM BEG EMG PRG ADV MAS.
 * Conversions: "sketch an area model" → the model is shown (or drawn in the solution) and the product is typed;
 * "verify when x = 6" → the value as a number; "explain" → multiple choice with a hint for each wrong option;
 * "identify the error and correct it" → an MC (which error?) plus the corrected expansion; several-answer items → fields. */
(function (root) {
  'use strict';
  var HW = root.HW, F = HW.fmt, K = HW.kit, KP = K.P, PL = HW.poly, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form;

  HW.addCodes({
    'first-only': 'Multiplied only the first term in the bracket', 'neg-first': 'Negative monomial: sign applied to the first term only', 'var-first': 'Variable of the monomial only on the first term',
    'drop-x': 'Dropped a variable from a product', 'fl-only': 'FOIL: only First and Last (no middle term)', 'one-middle': 'FOIL: one of the two middle products missing',
    'last-sign': 'Wrong sign on the product of the last terms', 'no-middle': 'Squared a binomial as a² + b²', 'middle-once': 'Square of a binomial: middle term not doubled',
    'sub-first': 'Subtracted a bracket but changed only its first sign', 'subtract-first': 'Subtracted before multiplying (order of operations)', 'outside-in': 'Multiplied a term that is outside the bracket',
    'not-subtracted': 'Didn’t subtract the missing piece', overlap: 'Composite area: pieces overlap', 'add-coef': 'Added coefficients instead of multiplying', 'mult-exp': 'Multiplied exponents (should add)',
    'kept-error': 'Repeated the error being corrected', swap: 'Top and side factors swapped', 'not-binomial': 'A factor that isn’t a binomial', 'check-product': 'Factor doesn’t give the product when expanded',
    'fl-total': 'Added only two of the four partial products', 'partial': 'A partial product wrong', 'asked-other': 'Combined the coefficients the wrong way', 'one-root': 'Gave only one of two answers',
    'k-twice': 'Multiplied the number into both brackets', 'all-cancel': 'Thought everything cancels', 'whole-only': 'Used the whole rectangle (no piece removed)', 'tile-sign': 'Shading rule (sign) error'
  });

  /* ---------- polynomial helpers ---------- */
  function xm(c, e, v) { var o = {}; o[v || 'x'] = e == null ? 1 : e; return PL.mono(c, o); } // c·x^e
  function M(c, vars) { return PL.mono(c, vars || {}); }
  function N(c) { return PL.num(c); }
  function lin(a, b, v) { return PL.add(xm(a, 1, v), N(b)); }
  var add = PL.add, mul = PL.mul, sub = PL.sub, neg = PL.neg;
  function tx(p) { return PL.tex(p); }
  function seq(list) { return PL.seq(list); }
  function br(list) { return '(' + seq(list) + ')'; }
  function sumOf(list) { return add.apply(null, list); }
  /* a factor written inside a product line: (−3), (3x), (x+2) — brackets when it is negative or has several terms */
  function pf(p) { var s = tx(p); return PL.count(p) > 1 || s.charAt(0) === '-' ? '(' + s + ')' : s; }
  function dot(a, b) { return pf(a) + '\\cdot ' + pf(b); }
  function coefOf(m) { var ts = PL.terms(m); return ts.length ? ts[0].c[0] / ts[0].c[1] : 0; }
  function pickWhere(gen, test) { for (var i = 0; i < 2000; i++) { var v = gen(); if (test(v)) return v; } throw new Error('pickWhere failed'); }
  function lab(p, i) { var s = tx(p); return i > 0 && s.charAt(0) !== '-' ? '+' + s : s; }

  /* ---------- drawings ---------- */
  /* four-cell (or two-cell) area model: top / side are lists of term polynomials */
  function grid(top, side, opt) {
    opt = opt || {};
    var L = function (p, i) { return opt.plus ? lab(p, i) : tx(p); };
    var wd = function (p) { return PL.degree(p) > 0 ? 2 : 1.2; };
    var cells = side.map(function (s, j) { return top.map(function (q, i) { if (opt.cells) return opt.cells[j][i]; return opt.blank ? '' : tx(mul(q, s)); }); });
    return HW.areaModel(opt.topLabels || top.map(L), opt.sideLabels || side.map(L), cells, { widths: opt.widths || top.map(wd), heights: opt.heights || side.map(wd), max: opt.max || 300 });
  }
  function tilesOf(a, b) { return HW.tiles.count({ x: a, one: b }); }
  /* plain SVG label: italic letters, superscript digits, real minus signs */
  function svgLab(p) {
    var s = typeof p === 'string' ? p : PL.tex(p), out = '';
    s = s.replace(/\^\{(\d+)\}/g, function (m, d) { return d.split('').map(function (c) { return '⁰¹²³⁴⁵⁶⁷⁸⁹'.charAt(+c); }).join(''); });
    for (var i = 0; i < s.length; i++) {
      var ch = s.charAt(i);
      if (/[a-z]/.test(ch)) out += '<tspan font-style="italic">' + ch + '</tspan>';
      else if (ch === '+') out += ' + ';
      else if (ch === '-') out += i === 0 ? '−' : ' − ';
      else out += ch;
    }
    return out;
  }
  /* composite shape: pts in units (y up); labels [x, y, html, dxPx, dyPx, anchor]; opt.dash [[x1,y1,x2,y2]]; opt.cut the same, drawn red */
  function shapeSvg(pts, labels, opt) {
    opt = opt || {};
    var maxX = Math.max.apply(null, pts.map(function (p) { return p[0]; })), maxY = Math.max.apply(null, pts.map(function (p) { return p[1]; }));
    var S = opt.S || Math.min(30, 240 / maxX, 220 / maxY), L = 70, R = 78, T = 30, B = 32;
    function X(x) { return L + x * S; } function Y(y) { return T + (maxY - y) * S; }
    var w = L + maxX * S + R, h = T + maxY * S + B;
    var s = '<polygon points="' + pts.map(function (p) { return X(p[0]).toFixed(1) + ',' + Y(p[1]).toFixed(1); }).join(' ') + '" fill="rgba(110,150,200,0.18)" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>';
    (opt.dash || []).forEach(function (d) { s += '<line x1="' + X(d[0]).toFixed(1) + '" y1="' + Y(d[1]).toFixed(1) + '" x2="' + X(d[2]).toFixed(1) + '" y2="' + Y(d[3]).toFixed(1) + '" stroke="currentColor" stroke-width="1.5" stroke-dasharray="6 4"/>'; });
    (opt.cut || []).forEach(function (d) { s += '<line x1="' + X(d[0]).toFixed(1) + '" y1="' + Y(d[1]).toFixed(1) + '" x2="' + X(d[2]).toFixed(1) + '" y2="' + Y(d[3]).toFixed(1) + '" stroke="#c0392b" stroke-width="2" stroke-dasharray="7 4"/>'; });
    labels.forEach(function (l) { s += '<text x="' + (X(l[0]) + (l[3] || 0)).toFixed(1) + '" y="' + (Y(l[1]) + (l[4] || 0)).toFixed(1) + '" text-anchor="' + (l[5] || 'middle') + '" dominant-baseline="middle" font-size="' + (l[6] || 16) + '" fill="currentColor">' + l[2] + '</text>'; });
    return '<svg class="fig-svg" viewBox="0 0 ' + Math.ceil(w) + ' ' + Math.ceil(h) + '" style="max-width:' + Math.round(Math.min(420, w * 1.15)) + 'px" role="img" aria-label="' + (opt.aria || 'composite shape') + '">' + s + '</svg>';
  }

  /* ---------- part builders ---------- */
  /* polynomial answer: drops classic wrong answers that coincide with the key (or with each other), tests them as bad answers */
  function pp(prompt, target, ws, sol, hints, text, opt) {
    opt = opt || {};
    var seen = [target], W = [];
    (ws || []).forEach(function (w) { if (!w || !w.is) return; var p = PL.lift(w.is); if (seen.some(function (s) { return PL.eq(s, p); })) return; seen.push(p); W.push({ is: p, code: w.code, hint: w.hint }); });
    var o = Object.assign({}, opt, { wrong: W });
    var part = KP.poly(prompt, target, o, sol, hints, text);
    part.bad = W.map(function (w) { return tx(w.is); });
    if (PL.count(target) > 1 && !opt.order) part.good = [PL.tex(target, { order: 'asc' })];
    return part;
  }
  function chk(target, ws) {
    var seen = [PL.lift(target)], W = [];
    (ws || []).forEach(function (w) { var p = PL.lift(w.is); if (seen.some(function (s) { return PL.eq(s, p); })) return; seen.push(p); W.push({ is: p, code: w.code, hint: w.hint }); });
    return K.poly(target, { wrong: W });
  }
  function pbox(label, vars, extra) { return Object.assign({ label: label, name: label.replace(/\\\(|\\\)/g, ''), mode: 'math', keys: 'poly', vars: vars, wide: true }, extra || {}); }
  function nbox(label) { return { label: label, name: label.replace(/\\\(|\\\)/g, '') }; }

  /* classic wrong answers for a monomial times a bracket */
  function monoWrongs(m, terms) {
    var out = [], prods = terms.map(function (q) { return mul(m, q); }), c = coefOf(m);
    if (terms.length > 1) {
      out.push({ is: sumOf([prods[0]].concat(terms.slice(1))), code: 'first-only', hint: 'Multiply <b>every</b> term in the bracket by ' + t(tx(m)) + ', not just the first one.' });
      if (c < 0) out.push({ is: sumOf([prods[0]].concat(terms.slice(1).map(function (q) { return mul(neg(m), q); }))), code: 'neg-first', hint: 'The negative sign is part of ' + t(tx(m)) + ', so it multiplies <b>every</b> term in the bracket. Check the signs after the first term.' });
      if (PL.vars(m).length) out.push({ is: sumOf([prods[0]].concat(terms.slice(1).map(function (q) { return mul(N(c), q); }))), code: 'var-first', hint: 'The variable part of ' + t(tx(m)) + ' multiplies every term in the bracket too, not just the first one.' });
    }
    return out;
  }
  /* m(t1+t2+…) written out term by term */
  function distSol(m, terms, mSecond) {
    var prods = terms.map(function (q) { return mul(m, q); }), res = sumOf(prods);
    var l1 = terms.map(function (q, i) { var s = pf(m) + '(' + tx(q) + ')'; return i ? '+' + s : s; }).join(''), l2 = seq(prods), s = l1 + '=' + l2;
    if (tx(res) !== l2) s += '=' + tx(res);
    return (mSecond ? 'The monomial is written second, but it still multiplies each term: ' : 'Multiply ' + t(tx(m)) + ' by each term: ') + '<br>' + t(s);
  }
  function expandMono(prodTex, m, terms, opt) {
    opt = opt || {};
    var T = mul(m, sumOf(terms));
    return pp(t(prodTex), T, monoWrongs(m, terms).concat(opt.wrong || []), distSol(m, terms, opt.mSecond),
      ['Multiply ' + t(tx(m)) + ' by <b>each</b> term in the bracket: multiply the coefficients and add the exponents of matching letters.', 'Watch the signs: a negative times a negative is positive.'], 'expand ' + prodTex);
  }

  /* binomial × binomial */
  function foil(A, B, C, D) { var Fp = mul(A, C), O = mul(A, D), I = mul(B, C), L = mul(B, D); return { F: Fp, O: O, I: I, L: L, res: add(Fp, O, I, L) }; }
  function binWrongs(A, B, C, D, square) {
    var f = foil(A, B, C, D), out = [], bothNeg = coefOf(B) < 0 && coefOf(D) < 0;
    out.push({ is: add(f.F, f.L), code: square ? 'no-middle' : 'fl-only', hint: square ? 'A square of a binomial is the binomial times <b>itself</b>: ' + t(pf(add(A, B)) + pf(add(A, B))) + '. Expand all four products — the Outside and Inside products give a middle term.' : 'You multiplied only the <b>First</b> terms and the <b>Last</b> terms. Two binomials give <b>four</b> products — the Outside and Inside products make the middle term.' });
    if (square) out.push({ is: add(f.F, f.O, f.L), code: 'middle-once', hint: 'The Outside and Inside products are the <b>same</b> here, so that term appears <b>twice</b> — the middle term is doubled.' });
    else {
      out.push({ is: add(f.F, f.O, f.L), code: 'one-middle', hint: 'You have only one of the two middle products. Find both the Outside product ' + t(dot(A, D)) + ' and the Inside product ' + t(dot(B, C)) + '.' });
      out.push({ is: add(f.F, f.I, f.L), code: 'one-middle', hint: 'You have only one of the two middle products. Find both the Outside product ' + t(dot(A, D)) + ' and the Inside product ' + t(dot(B, C)) + '.' });
    }
    out.push({ is: add(f.F, f.O, f.I, neg(f.L)), code: 'last-sign', hint: 'Check the sign of the last term: ' + t(dot(B, D)) + '.' + (bothNeg ? ' A negative times a negative is <b>positive</b>.' : '') });
    return out;
  }
  function foilSol(A, B, C, D) {
    var f = foil(A, B, C, D), s4 = seq([f.F, f.O, f.I, f.L]);
    return 'F: ' + t(dot(A, C) + '=' + tx(f.F)) + ', &nbsp;O: ' + t(dot(A, D) + '=' + tx(f.O)) + ', &nbsp;I: ' + t(dot(B, C) + '=' + tx(f.I)) + ', &nbsp;L: ' + t(dot(B, D) + '=' + tx(f.L)) + '<br>' + t(s4 + (s4 !== tx(f.res) ? '=' + tx(f.res) : '')) + (s4 === tx(f.res) ? ' (no like terms to collect)' : '');
  }
  function distBinSol(A, B, C, D) {
    var f = foil(A, B, C, D), c = tx(add(C, D)), s4 = seq([f.F, f.O, f.I, f.L]), bs = tx(B);
    return t(pf(add(A, B)) + '(' + c + ')=' + pf(A) + '(' + c + ')' + (bs.charAt(0) === '-' ? '' : '+') + (PL.count(B) > 1 ? '(' + bs + ')' : bs) + '(' + c + ')') + '<br>' + t('=' + s4 + (s4 !== tx(f.res) ? '=' + tx(f.res) : '')) + (s4 === tx(f.res) ? ' (no like terms to collect)' : '');
  }
  function gridSol(A, B, C, D) {
    var f = foil(A, B, C, D), s4 = seq([f.F, f.I, f.O, f.L]);
    return grid([A, B], [C, D]) + 'Add the four cells: ' + t(s4 + (s4 !== tx(f.res) ? '=' + tx(f.res) : '')) + '.';
  }
  var HB = ['Two binomials give <b>four</b> products — First, Outside, Inside, Last — then collect the like terms.', 'Check by substituting a small number for the variable into both the product and your answer: they must match.'];
  function expandBin(prodTex, A, B, C, D, how, opt) {
    opt = opt || {};
    var f = foil(A, B, C, D), sol = how === 'grid' ? gridSol(A, B, C, D) : how === 'dist' ? distBinSol(A, B, C, D) : foilSol(A, B, C, D);
    return pp((opt.pre || '') + t(prodTex), f.res, (opt.wrong || []).concat(binWrongs(A, B, C, D, opt.square)), (opt.solPre || '') + sol, opt.hints || HB, 'expand ' + prodTex);
  }
  /* (A)−(B): changing only the first sign of B */
  function subFirst(Apoly, Bterms) { return sumOf([Apoly, neg(Bterms[0])].concat(Bterms.slice(1))); }
  var SUBHINT = 'A minus sign in front of a bracket (or a negative number multiplying it) changes the sign of <b>every</b> term inside — not just the first one.';
  var HS = ['Expand each bracket first, then collect like terms.', SUBHINT];

  /* ---------- question-specific makers ---------- */
  function q1(r, negc) {
    var k = r.int(2, 5), c = r.int(2, 9) * (negc ? -1 : 1), m = xm(k), terms = [xm(1), N(c)], T = mul(m, add(terms[0], terms[1]));
    return pp(grid(terms, [m], { blank: true, widths: [2.4, 1.4], heights: [1], max: 260 }) + 'Write the product as a <b>sum</b> of terms.', T,
      monoWrongs(m, terms).concat([{ is: add(xm(k, 2), N(k * c)), code: 'drop-x', hint: 'Each piece is (side) × (top). The second piece is ' + t(dot(m, N(c))) + ' — the ' + t('x') + ' from the side stays in that term.' }]),
      'Sub-areas: ' + t(dot(m, xm(1)) + '=' + tx(mul(m, xm(1)))) + ' and ' + t(dot(m, N(c)) + '=' + tx(mul(m, N(c)))) + '.' + grid(terms, [m], { widths: [2.4, 1.4], heights: [1], max: 260 }) + 'The model shows ' + t(tx(m) + br(terms) + '=' + tx(T)) + '.',
      ['The rectangle is ' + t(tx(m)) + ' high and split into widths ' + t('x') + ' and ' + t(c) + '. Find the area of each piece.', 'Area of a piece = (height) × (width). Add the two areas.'], 'area model ' + tx(m) + br(terms));
  }
  function q7a(r) {
    var o = pickWhere(function () { var p = r.int(6, 9), s = r.int(Math.max(2, p - 4), p - 2), m = r.int(2, 4); return { p: p, s: s, q: r.int(1, 5), m: m, n: r.int(m + 2, Math.min(9, m + 5)) }; }, function () { return true; });
    if (r.chance(0.15)) o = { p: 8, s: 5, q: 2, m: 3, n: 7 };
    var top = lin(o.p, o.q, 'a'), bot = lin(o.s, o.q, 'a'), left = xm(o.m, 1, 'a'), right = xm(o.n, 1, 'a'), nw = xm(o.p - o.s, 1, 'a'), nh = xm(o.n - o.m, 1, 'a');
    var T = sub(mul(top, right), mul(nw, nh));
    var W = o.p + 0.4 * o.q, H = o.n, nwu = o.p - o.s, pts = [[0, H], [0, H - o.m], [nwu, H - o.m], [nwu, 0], [W, 0], [W, H]];
    var labels = function () { return [[W / 2, H, svgLab(top), 0, -14], [0, H - o.m / 2, svgLab(left), -8, 0, 'end'], [W, H / 2, svgLab(right), 8, 0, 'start'], [(nwu + W) / 2, 0, svgLab(bot), 0, 16]]; };
    var fig = shapeSvg(pts, labels()), figSol = shapeSvg(pts, labels(), { cut: [[nwu, H - o.m, W, H - o.m]] });
    var upper = mul(top, left), lower = mul(bot, nh);
    return pp(fig + 'Area of the shape, simplified:', T, [
      { is: mul(top, right), code: 'whole-only', hint: t(tx(top)) + ' by ' + t(tx(right)) + ' is the area of the <b>whole</b> rectangle. A corner is missing — subtract it (or split the shape into two rectangles).' },
      { is: add(upper, mul(bot, right)), code: 'overlap', hint: 'Your two rectangles overlap. If the top strip is ' + t(tx(left)) + ' high, the lower piece is only ' + t(tx(right) + '-' + tx(left) + '=' + tx(nh)) + ' high.' },
      { is: add(mul(top, right), mul(nw, nh)), code: 'not-subtracted', hint: 'The missing corner must be <b>subtracted</b> from the big rectangle, not added.' }],
      figSol + '<b>Sum of two rectangles:</b> top ' + t(tx(top) + '\\text{ by }' + tx(left)) + ', bottom ' + t(tx(bot) + '\\text{ by }' + tx(right) + '-' + tx(left) + '=' + tx(nh)) + ':<br>' + t(pf(top) + '(' + tx(left) + ')+' + pf(bot) + '(' + tx(nh) + ')=' + seq([upper]) + '+' + seq([lower]) + '=' + tx(T)) +
      '<br><b>Big rectangle minus corner:</b> the corner is ' + t(pf(top) + '-' + pf(bot) + '=' + tx(nw)) + ' wide and ' + t(tx(nh)) + ' high:<br>' + t(pf(top) + '(' + tx(right) + ')-' + pf(nw) + '(' + tx(nh) + ')=' + tx(mul(top, right)) + '-' + pf(mul(nw, nh)) + '=' + tx(T)) + ' ✓',
      ['Either split the shape into two rectangles and add their areas, or take the big rectangle and subtract the missing corner.', 'Work out the missing lengths first: the corner’s width is the difference of the two horizontal sides.'], 'composite area (notch bottom-left)');
  }
  function q7b(r) {
    var o = { p: r.int(2, 4), q: r.int(3, 7), m: r.int(4, 6) }; o.s = r.int(1, o.p - 1); o.r = r.int(1, o.q - 1); o.n = r.int(2, o.m - 2);
    if (r.chance(0.15)) o = { p: 3, q: 4, m: 5, n: 2, s: 1, r: 1 };
    var top = lin(o.p, o.q), left = xm(o.m), right = xm(o.n), bot = lin(o.s, o.r), nh = xm(o.m - o.n), nw = sub(top, bot);
    var upper = mul(top, right), lower = mul(bot, nh), T = add(upper, lower);
    var W = o.p + 0.4 * o.q, bw = o.s + 0.4 * o.r, H = o.m, pts = [[0, 0], [0, H], [W, H], [W, H - o.n], [bw, H - o.n], [bw, 0]];
    var labels = function () { return [[W / 2, H, svgLab(top), 0, -14], [0, H / 2, svgLab(left), -8, 0, 'end'], [W, H - o.n / 2, svgLab(right), 8, 0, 'start'], [bw / 2, 0, svgLab(bot), 0, 16]]; };
    var fig = shapeSvg(pts, labels()), figSol = shapeSvg(pts, labels(), { cut: [[bw, H - o.n, W, H - o.n]] });
    return pp(fig + 'Area of the shape, simplified:', T, [
      { is: mul(top, left), code: 'whole-only', hint: t(tx(top)) + ' by ' + t(tx(left)) + ' is the area of the <b>whole</b> rectangle. The bottom-right corner is missing — subtract it (or split the shape into two rectangles).' },
      { is: add(upper, mul(bot, left)), code: 'overlap', hint: 'Your two rectangles overlap. Below the top strip (height ' + t(tx(right)) + '), the narrow piece is only ' + t(tx(left) + '-' + tx(right) + '=' + tx(nh)) + ' high.' },
      { is: add(mul(top, left), mul(nw, nh)), code: 'not-subtracted', hint: 'The missing corner must be <b>subtracted</b> from the big rectangle, not added.' }],
      figSol + '<b>Sum of two rectangles:</b> top ' + t(tx(top) + '\\text{ by }' + tx(right)) + ', lower-left ' + t(tx(bot) + '\\text{ by }' + tx(left) + '-' + tx(right) + '=' + tx(nh)) + ':<br>' + t(pf(top) + '(' + tx(right) + ')+' + pf(bot) + '(' + tx(nh) + ')=' + tx(upper) + '+' + pf(lower) + '=' + tx(T)) +
      '<br><b>Big rectangle minus corner:</b> the corner is ' + t(pf(top) + '-' + pf(bot) + '=' + tx(nw)) + ' wide and ' + t(tx(nh)) + ' high:<br>' + t(pf(top) + '(' + tx(left) + ')-' + pf(nw) + '(' + tx(nh) + ')=' + pf(mul(top, left)) + '-' + pf(mul(nw, nh)) + '=' + tx(T)) + ' ✓',
      ['Either split the shape into two rectangles and add their areas, or take the big rectangle and subtract the missing corner.', 'The left side is the full height; the right side is shorter, so the missing corner is at the bottom right.'], 'composite area (notch bottom-right)');
  }
  /* tile models */
  function tileProduct(r, A, B, C, D, text, sideFirst) { // top = A x + B (a·x and b·1 as counts), side = C x + D
    var top = tilesOf(A, B), side = tilesOf(C, D), x = xm(1), T = mul(lin(A, B), lin(C, D)), f = foil(xm(A), N(B), xm(C), N(D));
    var x2 = A * C, xs = [A * D, B * C], ones = B * D;
    var xTiles = (Math.abs(xs[0]) + Math.abs(xs[1])), zp = xs[0] * xs[1] < 0 ? Math.min(Math.abs(xs[0]), Math.abs(xs[1])) : 0;
    var desc = 'Inside: ' + x2 + ' ' + t('x^{2}') + '-tile' + (x2 > 1 ? 's' : '') + '; ' + xTiles + ' ' + t('x') + '-tiles (' + (xs[0] > 0 && xs[1] > 0 ? 'all shaded' : [xs[0], xs[1]].map(function (v) { return Math.abs(v) + (v > 0 ? ' shaded' : ' white'); }).join(' and ')) + ')' + (zp ? ', so ' + zp + ' zero pair' + (zp > 1 ? 's' : '') + ' come' + (zp > 1 ? '' : 's') + ' out' : '') + '; ' + Math.abs(ones) + ' ' + (ones > 0 ? 'shaded' : 'white') + ' unit tiles.';
    var prod = sideFirst ? pf(lin(C, D)) + pf(lin(A, B)) : pf(lin(A, B)) + pf(lin(C, D));
    var p = pp(HW.tiles.legend() + HW.tiles.frame(top, side) + 'The factor tiles for ' + t(prod) + ' are in place: ' + t(tx(lin(A, B))) + ' across the top and ' + t(tx(lin(C, D))) + ' down the side. Fill the rectangle using the shading rule (same shading → shaded, different shading → white), then state the product.', T,
      binWrongs(xm(A), N(B), xm(C), N(D)).map(function (w) { if (w.code === 'last-sign') { w.code = 'tile-sign'; w.hint = 'Check the shading of the unit tiles: a unit tile is shaded only when the two factor tiles beside it have the <b>same</b> shading.'; } return w; }),
      HW.tiles.frame(top, side, { fill: true }) + desc + '<br>' + t(prod + '=' + seq([f.F, f.O, f.I, f.L]) + '=' + tx(T)),
      ['Each tile inside is (tile above it) × (tile beside it): ' + t('x\\cdot x') + ' is an ' + t('x^{2}') + '-tile, ' + t('x\\cdot 1') + ' an ' + t('x') + '-tile, ' + t('1\\cdot 1') + ' a unit tile.', 'Same shading → positive (shaded); different shading → negative (white). Remove zero pairs before you write the answer.'], text);
    return p;
  }
  /* two-digit products with the four-cell grid: fields for the partial products and the product */
  function numGrid(r, a, b, c, d) {
    var n1 = 10 * a + b, n2 = 10 * c + d, P4 = [100 * a * c, 10 * a * d, 10 * b * c, b * d], tot = n1 * n2;
    var g = grid([N(10 * a), N(b)], [N(10 * c), N(d)], { blank: true, widths: [2, 1], heights: [2, 1], max: 240 });
    var labs = [t(10 * a + '\\times ' + 10 * c), t(b + '\\times ' + 10 * c), t(10 * a + '\\times ' + d), t(b + '\\times ' + d)];
    var fields = labs.map(nbox).concat([nbox('Product')]);
    var checkers = [K.number(P4[0], function (v) { return v === a * c ? { code: 'partial', hint: 'These are tens: ' + t(10 * a + '\\times ' + 10 * c) + ' has two zeros on the end.' } : null; }), K.number(P4[2]), K.number(P4[1]), K.number(P4[3]),
      K.number(tot, function (v) { if (v === P4[0] + P4[3]) return { code: 'fl-total', hint: 'Add <b>all four</b> partial products, not just the two diagonal ones.' }; return null; })];
    var p = KP.fields(g + 'Use the area model (no calculator): fill in the four partial products, then the product ' + t(n1 + '\\times ' + n2) + '.', fields, checkers, [String(P4[0]), String(P4[2]), String(P4[1]), String(P4[3]), String(tot)],
      t(n1 + '\\times ' + n2 + '=' + F(tot)),
      grid([N(10 * a), N(b)], [N(10 * c), N(d)], { widths: [2, 1], heights: [2, 1], max: 240, cells: [[F(P4[0]), F(P4[2])], [F(P4[1]), F(P4[3])]] }) + t(F(P4[0]) + '+' + F(P4[2]) + '+' + F(P4[1]) + '+' + F(P4[3]) + '=' + F(tot)) + '. (This is ' + t('(' + a + 't+' + b + ')(' + c + 't+' + d + ')') + ' with ' + t('t=10') + '.)',
      ['Split each number into tens and ones: ' + t(n1 + '=' + 10 * a + '+' + b) + ' and ' + t(n2 + '=' + 10 * c + '+' + d) + '.', 'Each cell is (top) × (side). Add all four cells.'], n1 + ' x ' + n2 + ' by area model');
    p.bad = [[String(P4[0]), String(P4[2]), String(P4[1]), String(P4[3]), String(P4[0] + P4[3])]];
    return p;
  }
  /* "find the missing factor": fT = terms of the missing factor, gT = terms of the given one (display order) */
  function missingFactor(prompt, fT, gT, alt) {
    var Fp = sumOf(fT), G = sumOf(gT), T = mul(Fp, G);
    var c1 = K.poly(Fp, { diag: function (S) { if (PL.count(S) !== 2) return { code: 'not-binomial', hint: 'The missing factor is a binomial (two terms).' }; return { code: 'check-product', hint: 'Check by expanding: ' + t(pf(G) + pf(S) + '=' + tx(mul(G, S))) + ', not ' + t(tx(T)) + '.' }; } });
    var c2 = alt ? K.poly(alt) : null;
    var f = foil(gT[0], gT[1], fT[0], fT[1]);
    return { prompt: prompt, input: { type: 'math', keys: 'poly', vars: PL.vars(T) }, key: tx(Fp), answer: t(tx(Fp)) + (alt ? ' (or ' + t(tx(alt)) + ')' : ''), text: 'missing factor: ' + tx(T),
      check: function (resp) { if (c2) { var a2 = c2(resp); if (a2.v !== 'wrong') return a2; } return c1(resp); },
      good: alt ? [tx(alt)] : [], bad: [tx(sub(fT[0], fT[1])) === tx(Fp) ? tx(add(fT[0], fT[1], fT[1])) : tx(sub(fT[0], fT[1]))],
      solution: 'First terms: ' + t(dot(gT[0], fT[0]) + '=' + tx(f.F)) + '. Last terms: ' + t(dot(gT[1], fT[1]) + '=' + tx(f.L)) + '. So the missing factor is ' + t(tx(Fp)) + '.<br>Check: ' + t(pf(G) + pf(Fp) + '=' + seq([f.F, f.O, f.I, f.L]) + '=' + tx(T)) + ' ✓',
      hints: ['First terms: what times the first term of the given factor makes the first term of the product?', 'Last terms: what times the last term of the given factor makes the constant (last) term? Then check the middle term by expanding.'] };
  }

  /* Q2 iii: verify at x = 6 */
  function at6(s) { return s.replace(/x/g, '(6)'); }
  function v6(o) {
    var v = o.v, lhs = at6(o.tex), rhs = at6(tx(o.T));
    return KP.number('iii) Verify when ' + t('x=6') + ': evaluate ' + t(o.tex) + ' at ' + t('x=6') + '. (Your expansion must give the same value.)', v,
      function (x) { return x === -v ? { code: 'sign', hint: 'Check the signs: a negative times a negative is positive.' } : null; },
      'LS: ' + t(lhs + '=' + F(v)) + '<br>RS: ' + t(rhs + '=' + F(v)) + ' ✓ Both sides agree.', ['Replace every ' + t('x') + ' with ' + t('(6)') + ' and follow the order of operations.', 'Work out the bracket first.'], 'check at x=6: ' + o.tex);
  }
  /* Q5: find the error */
  function q5Shared(r) {
    var k = r.int(2, 6), m = r.int(2, 6), pq = r.pick([[3, 2], [2, 3], [2, 4], [4, 2], [3, 3], [3, 4], [4, 3]]), A = r.int(2, 7), B = r.int(2, 9), c = r.int(2, 6), b1 = r.int(1, 9), b2 = pickWhere(function () { return r.int(1, 9); }, function (v) { return v !== b1; });
    if (r.chance(0.15)) { k = 4; m = 3; pq = [3, 2]; A = 3; B = 5; c = 3; b1 = 4; b2 = 2; }
    var y = M(1, { y: 1 }), p = pq[0], q = pq[1];
    var a = { lhs: tx(xm(k)) + br([xm(m), y]), T: add(xm(k * m, 2), M(k, { x: 1, y: 1 })), given: add(xm(k * m), M(k, { x: 1, y: 1 })), k: k, m: m };
    var b = { lhs: 'x^{' + p + '}' + br([xm(1, q), xm(-A), N(B)]), T: add(xm(1, p + q), xm(-A, p + 1), xm(B, p)), given: add(xm(1, p * q), xm(-A, p + 1), xm(B, p)), p: p, q: q, A: A, B: B };
    var cc = { lhs: c + br([xm(1), N(-b1)]) + '-' + c + br([xm(1), N(-b2)]), T: N(c * (b2 - b1)), given: N(-c * (b1 + b2)), c: c, b1: b1, b2: b2 };
    a.shown = a.lhs + '=' + seq([xm(k * m), M(k, { x: 1, y: 1 })]); b.shown = b.lhs + '=' + seq([xm(1, p * q), xm(-A, p + 1), xm(B, p)]);
    cc.shown = cc.lhs + '=' + seq([xm(c), N(-c * b1), xm(-c), N(-c * b2)]) + '=' + (-c * (b1 + b2));
    return { a: a, b: b, c: cc };
  }
  function q5Err(r, sh, w) {
    var o = sh[w], pre = 'A student wrote ' + t(o.shown) + '.<br>Which statement describes the error?', opts, sol;
    if (w === 'a') {
      opts = [{ html: t(o.k + 'x\\cdot ' + o.m + 'x') + ' is ' + t(o.k * o.m + 'x^{2}') + ', not ' + t(o.k * o.m + 'x') + ': when the ' + t('x') + '’s multiply, the exponents add.', right: true },
        { html: t(o.k + 'x\\cdot y') + ' should be ' + t(o.k + 'y') + '.', why: 'No — ' + t(o.k + 'x\\cdot y=' + o.k + 'xy') + ' is right: the ' + t('x') + ' stays in the term.' },
        { html: 'The first term should be ' + t((o.k + o.m) + 'x^{2}') + ': add the coefficients.', why: 'Coefficients <b>multiply</b> in a product: ' + t(o.k + '\\times ' + o.m + '=' + o.k * o.m) + '. That part was right.' },
        { html: 'There is no error.', why: 'Look at the first term again: what is ' + t('x\\cdot x') + '?' }];
      sol = t(o.k + 'x\\cdot ' + o.m + 'x=' + o.k * o.m + 'x^{2}') + ': coefficients multiply (' + t(o.k + '\\times ' + o.m + '=' + o.k * o.m) + ') and exponents add (' + t('x^{1}\\cdot x^{1}=x^{2}') + '). The student lost the exponent.';
    } else if (w === 'b') {
      opts = [{ html: t('x^{' + o.p + '}\\cdot x^{' + o.q + '}') + ' is ' + t('x^{' + (o.p + o.q) + '}') + ', not ' + t('x^{' + o.p * o.q + '}') + ': exponents <b>add</b> when you multiply powers.', right: true },
        { html: 'The second term should be ' + t('-' + o.A + 'x^{' + o.p + '}') + '.', why: t('x^{' + o.p + '}\\cdot(-' + o.A + 'x)=-' + o.A + 'x^{' + (o.p + 1) + '}') + ' — that term is right (' + t('x') + ' means ' + t('x^{1}') + ').' },
        { html: 'The last term should be ' + t(o.B + 'x') + '.', why: t('x^{' + o.p + '}\\cdot ' + o.B + '=' + o.B + 'x^{' + o.p + '}') + ' — that term is right.' },
        { html: 'There is no error.', why: 'Check the first term: what is ' + t('x^{' + o.p + '}\\cdot x^{' + o.q + '}') + '?' }];
      sol = t('x^{' + o.p + '}\\cdot x^{' + o.q + '}=x^{' + o.p + '+' + o.q + '}=x^{' + (o.p + o.q) + '}') + '. The student multiplied the exponents instead of adding them.';
    } else {
      opts = [{ html: 'Sign error: ' + t('-' + o.c + '(x-' + o.b2 + ')') + ' is ' + t('-' + o.c + 'x+' + o.c * o.b2) + ', not ' + t('-' + o.c + 'x-' + o.c * o.b2) + '.', right: true },
        { html: 'The ' + t('x') + '-terms should not cancel; they should add to ' + t(2 * o.c + 'x') + '.', why: t(o.c + 'x') + ' and ' + t('-' + o.c + 'x') + ' really do cancel. Look at the constant terms.' },
        { html: t(o.c + '(x-' + o.b1 + ')') + ' should be ' + t(o.c + 'x-' + o.b1) + '.', why: 'No — the ' + t(o.c) + ' multiplies both terms, so ' + t(o.c + 'x-' + o.c * o.b1) + ' is right.' },
        { html: 'There is no error.', why: 'Check the second bracket: what is ' + t('(-' + o.c + ')(-' + o.b2 + ')') + '?' }];
      sol = 'Distributing ' + t('-' + o.c) + ' over ' + t('(x-' + o.b2 + ')') + ' gives ' + t('-' + o.c + 'x+' + o.c * o.b2) + ', because ' + t('(-' + o.c + ')(-' + o.b2 + ')=+' + o.c * o.b2) + '. The student wrote ' + t('-' + o.c * o.b2) + '.';
    }
    return KP.mc(r, pre, opts, sol, ['Redo each product yourself and compare with the student’s line.'], 'find the error (' + w + ')');
  }
  function q5Fix(sh, w) {
    var o = sh[w], ws;
    if (w === 'a') ws = [{ is: o.given, code: 'kept-error', hint: 'That’s the student’s answer. Fix the first term: ' + t('x\\cdot x=x^{2}') + '.' }, { is: add(xm(o.k + o.m, 2), M(o.k, { x: 1, y: 1 })), code: 'add-coef', hint: 'Coefficients multiply: ' + t(o.k + '\\times ' + o.m) + '.' }];
    else if (w === 'b') ws = [{ is: o.given, code: 'mult-exp', hint: 'That’s the student’s answer. When you multiply powers, <b>add</b> the exponents.' }];
    else ws = [{ is: o.given, code: 'kept-error', hint: 'That’s the student’s answer. Check the sign of ' + t('(-' + o.c + ')(-' + o.b2 + ')') + '.' }];
    var sol = w === 'a' ? t(o.lhs + '=' + o.k * o.m + 'x^{2}+' + o.k + 'xy') : w === 'b' ? t(o.lhs + '=' + tx(o.T)) : t(o.lhs + '=' + seq([xm(o.c), N(-o.c * o.b1), xm(-o.c), N(o.c * o.b2)]) + '=' + tx(o.T));
    return pp('Give the correct simplification of ' + t(o.lhs) + '.', o.T, ws, sol, ['Multiply the monomial by each term: coefficients multiply, exponents add.', 'A negative times a negative is positive.'], 'correct: ' + o.lhs);
  }
  /* Q9: which expansion is incorrect */
  function q9(r) {
    var a = r.int(2, 5), b = r.int(2, 5), c = r.int(2, 9), d = r.int(2, 6), e = r.int(2, 9), f = r.int(2, 6), g = r.int(2, 9), h = r.int(2, 7), i = r.int(2, 9), err = r.int(0, 3);
    if (r.chance(0.15)) { a = 3; b = 2; c = 5; d = 5; e = 3; f = 4; g = 6; h = 6; i = 4; err = 2; }
    var S = [{ m: xm(-a, 2), ts: [xm(b), N(c)] }, { m: xm(-d), ts: [N(e), xm(-1)] }, { m: xm(-f), ts: [xm(1, 2), N(-g)] }, { m: xm(h, 2), ts: [xm(1, 2), N(i)] }];
    S.forEach(function (s, j) {
      s.prods = s.ts.map(function (q) { return mul(s.m, q); });
      s.okTex = seq(s.prods);
      s.badTex = j === 3 ? seq([s.prods[0], xm(i, 2)]) : seq([s.prods[0], neg(s.prods[1])]);
      s.lhs = tx(s.m) + br(s.ts);
      s.check = s.ts.map(function (q) { return t(pf(s.m) + '(' + tx(q) + ')=' + tx(mul(s.m, q))); }).join(' and ');
    });
    var opts = S.map(function (s, j) { return { html: t(s.lhs + '=' + (j === err ? s.badTex : s.okTex)), right: j === err, why: j === err ? null : 'Check it: ' + s.check + ' — this expansion is correct.' }; });
    var bad = S[err], why = err === 3 ? 'the ' + t(h + 'x^{2}') + ' was not multiplied into the second term' : 'a <b>sign error</b> in the second term';
    return KP.mc(r, 'Which of the following expansions is <b>incorrect</b>?', opts, 'Check each one by distributing. In the incorrect one, ' + bad.check + ', so it should be ' + t(bad.lhs + '=' + bad.okTex) + ' — ' + why + '.', ['Distribute each monomial yourself, sign included, and compare.'], 'which expansion is wrong (MC)', true);
  }
  /* Q10: NR c − a − b */
  function q10(r) {
    function calc(o) {
      var A = mul(xm(o.p), add(N(o.q), xm(-o.rr))), B = mul(xm(o.s), lin(1, -o.u)), C = mul(N(-o.v), lin(o.w, o.z)), T = add(A, B, C);
      var a = PL.coef(T, { x: 2 })[0], b = PL.coef(T, { x: 1 })[0], c = PL.constant(T)[0];
      return { A: A, B: B, C: C, T: T, a: a, b: b, c: c, ans: c - a - b };
    }
    var o = pickWhere(function () { return { p: r.int(2, 4), q: r.int(2, 6), rr: r.int(2, 3), s: r.int(2, 5), u: r.int(2, 5), v: r.int(2, 3), w: r.int(2, 4), z: r.int(1, 3) }; }, function (o) { var k = calc(o); return k.a && k.b && k.c && k.ans >= 1 && k.ans <= 99; });
    if (r.chance(0.15)) o = { p: 3, q: 5, rr: 2, s: 4, u: 3, v: 2, w: 3, z: 1 };
    var k = calc(o), ex = o.p + 'x' + br([N(o.q), xm(-o.rr)]) + '+' + o.s + 'x' + br([xm(1), N(-o.u)]) + '-' + o.v + br([xm(o.w), N(o.z)]);
    var signSlip = (-k.c) - k.a - k.b;
    return KP.nr('The expression ' + t(ex) + ' can be written in the form ' + t('ax^{2}+bx+c') + '. The value of ' + t('c-a-b') + ' is ____.', k.ans,
      function (v) {
        if (v === k.a + k.b + k.c) return { code: 'asked-other', hint: 'That is ' + t('a+b+c') + '. The question asks for ' + t('c-a-b') + '.' };
        if (v === signSlip) return { code: 'neg-first', hint: 'Check the constant term: ' + t('-' + o.v + '(' + o.z + ')=-' + o.v * o.z) + '.' };
        if (v === k.c - k.a + k.b || v === k.c + k.a - k.b) return { code: 'sign', hint: 'Careful subtracting negatives: ' + t('a=' + k.a) + ' and ' + t('b=' + k.b) + ', so ' + t('-a=' + (-k.a)) + ' and ' + t('-b=' + (-k.b)) + '.' };
        return null;
      },
      'Expand each product: ' + t(tx(k.A)) + ', ' + t(tx(k.B)) + ', ' + t(tx(k.C)) + '.<br>Collect: ' + t(tx(k.T)) + ', so ' + t('a=' + k.a + ',\\ b=' + k.b + ',\\ c=' + k.c) + '.<br>' + t('c-a-b=' + k.c + '-(' + k.a + ')-(' + k.b + ')=' + k.ans) + '.',
      ['Expand all three products, then collect the ' + t('x^{2}') + '-terms, the ' + t('x') + '-terms and the constants.', 'Keep the signs of ' + t('a') + ', ' + t('b') + ' and ' + t('c') + ' — subtracting a negative adds.'], 'NR c-a-b');
  }
  function gridBin(A, B, C, D) { return expandBin(br([A, B]) + br([C, D]), A, B, C, D, 'grid', { pre: grid([A, B], [C, D], { blank: true }) }); }
  /* Q20: p, q, r */
  function q20(r) {
    var o = pickWhere(function () { return { a: r.int(2, 4), b: r.int(1, 5), c: r.int(1, 4) }; }, function (o) { return o.a * o.c + o.b <= 9 && o.b * o.c <= 9 && o.b !== o.c; });
    if (r.chance(0.15)) o = { a: 3, b: 1, c: 2 };
    var p = o.a, q = o.a * o.c + o.b, rr = o.b * o.c, A = xm(o.a), B = N(o.b), C = xm(1), D = N(o.c);
    var fields = [nbox(t('p')), nbox(t('q')), nbox(t('r'))];
    var part = KP.fields('The area of a rectangle with length ' + t(br([A, B])) + ' cm and width ' + t(br([C, D])) + ' cm can be written in the form ' + t('px^{2}+qx+r') + ', where ' + t('p,q,r') + ' are natural numbers. Enter ' + t('p') + ', ' + t('q') + ' and ' + t('r') + '.', fields,
      [K.number(p), K.number(q, function (v) { if (v === o.a * o.c || v === o.b) return { code: 'one-middle', hint: 'The ' + t('x') + '-term comes from <b>two</b> products: ' + t(dot(A, D)) + ' and ' + t(dot(B, C)) + '.' }; return null; }), K.number(rr)],
      [String(p), String(q), String(rr)], t('p=' + p + ',\\ q=' + q + ',\\ r=' + rr) + ' (recorded as ' + p + q + rr + ')',
      'Area ' + t('=' + br([A, B]) + br([C, D]) + '=' + seq([xm(o.a, 2), xm(o.a * o.c), xm(o.b), N(rr)]) + '=' + tx(mul(add(A, B), add(C, D)))) + ', so ' + t('p=' + p) + ', ' + t('q=' + q) + ', ' + t('r=' + rr) + '.', HB, 'NR area pqr');
    part.bad = [[String(p), String(o.a * o.c), String(rr)]];
    return part;
  }
  /* Q21: find c */
  function q21(r) {
    var a = r.int(2, 6), c = r.int(2, 9), d = r.int(2, 7);
    if (r.chance(0.15)) { a = 4; c = 4; d = 5; }
    var cl = M(-1, { c: 1 });
    return KP.nr('The expansion of ' + t(br([xm(a), cl]) + br([xm(1), N(-d)])) + ', where ' + t('c') + ' is a whole number, results in a polynomial in ' + t('x') + ' with a leading coefficient of ' + t(a) + ' and a constant term of ' + t(c * d) + '. The value of ' + t('c') + ' is ____.', c,
      function (v) { if (v === c * d) return { code: 'asked-other', hint: t(c * d) + ' is the constant term. The constant term is the product of the last terms, ' + t('(-c)(-' + d + ')=' + d + 'c') + '. Solve for ' + t('c') + '.' }; if (v === c * d - d || v === c * d + d) return { code: 'value', hint: 'The last terms <b>multiply</b>: ' + t('(-c)(-' + d + ')=' + d + 'c') + '.' }; return null; },
      t(br([xm(a), cl]) + br([xm(1), N(-d)]) + '=' + a + 'x^{2}-' + a * d + 'x-cx+' + d + 'c') + '. The leading coefficient is already ' + t(a) + '. The constant term is ' + t(d + 'c') + ', so ' + t(d + 'c=' + c * d) + ' and ' + t('c=' + c) + '.',
      ['Which two terms multiply to give the constant term?', 'The constant term is ' + t('(-c)(-' + d + ')') + '.'], 'NR find c');
  }

  /* ---------- extra-practice makers ---------- */
  function termsOf(p) { return PL.sorted(p).map(function (q) { return M(q.c, q.v); }); }
  var CELL = ['\\textbf{A}', '\\textbf{B}', '\\textbf{C}', '\\textbf{D}'];
  /* EP1: fill the four cells, then the product */
  function gridFill(A, B, C, D) {
    var f = foil(A, B, C, D), vs = PL.vars(f.res), prod = br([A, B]) + br([C, D]), vals = [f.F, f.I, f.O, f.L];
    var g = grid([A, B], [C, D], { plus: true, cells: [[CELL[0], CELL[1]], [CELL[2], CELL[3]]] });
    var fields = ['A', 'B', 'C', 'D'].map(function (n) { return pbox('Cell ' + n, vs); }).concat([pbox('Product', vs)]);
    var p = KP.fields(g + 'Fill in the four cells of the grid for ' + t(prod) + ', then add the cells and collect like terms to state the product.', fields,
      vals.map(function (v) { return K.poly(v); }).concat([chk(f.res, binWrongs(A, B, C, D))]), vals.map(tx).concat([tx(f.res)]),
      'A ' + t(tx(f.F)) + ', B ' + t(tx(f.I)) + ', C ' + t(tx(f.O)) + ', D ' + t(tx(f.L)) + '; product ' + t(tx(f.res)),
      grid([A, B], [C, D], { plus: true }) + 'Each cell is (top) × (side). ' + t(seq([f.F, f.I, f.O, f.L]) + '=' + tx(f.res)), ['Each cell is the term above it times the term beside it — sign included.', 'Then add all four cells and collect the like terms.'], 'fill grid ' + prod);
    p.bad = [vals.map(tx).concat([tx(add(f.F, f.L))])].concat(PL.eq(f.O, f.I) ? [] : [[tx(f.F), tx(f.O), tx(f.I), tx(f.L), tx(f.res)]]);
    return p;
  }
  /* EP2: grid filled, sides erased */
  function backGrid(A, B, C, D) {
    var f = foil(A, B, C, D), vs = PL.vars(f.res), labs = ['Across the top', 'Down the side', 'Product'];
    var g = grid([A, B], [C, D], { cells: [[tx(f.F), tx(f.I)], [tx(f.O), tx(f.L)]], topLabels: ['?', '?'], sideLabels: ['?', '?'] });
    var cP = chk(f.res, []);
    function rd(s) { var a = K.read(s || ''); if (a.res) return { res: a.res }; var q = PL.read(a.ast); if (!q.ok) return { res: wrong('not-binomial', 'Each side of the grid is a binomial, like ' + t('3x+2') + '.') }; if (PL.formIssue(a.ast)) return { res: form('simplify', 'Write each side as a simplified binomial (two terms, no brackets).') }; return { p: q.p }; }
    var p = { prompt: g + 'The grid has been filled in, but the side lengths have been erased. Write the two binomials that were multiplied, then state the product in expanded form.', input: { type: 'fields', fields: labs.map(function (l) { return pbox(l, vs); }) },
      key: [tx(add(A, B)), tx(add(C, D)), tx(f.res)], answer: t(pf(add(A, B)) + pf(add(C, D)) + '=' + tx(f.res)), text: 'grid backwards ' + tx(f.res),
      check: function (resp) {
        resp = resp || [];
        var a = rd(resp[0]), b = rd(resp[1]);
        if (a.res) return { v: a.res.v, code: a.res.code, hint: '<b>' + labs[0] + ':</b> ' + (a.res.hint || 'Check this one again.') };
        if (b.res) return { v: b.res.v, code: b.res.code, hint: '<b>' + labs[1] + ':</b> ' + (b.res.hint || 'Check this one again.') };
        if (PL.count(a.p) !== 2 || PL.count(b.p) !== 2) return wrong('not-binomial', 'Each side is a <b>binomial</b>: one term for each column across the top, and one for each row down the side.');
        var pr = mul(a.p, b.p);
        if (!PL.eq(pr, f.res)) {
          if (PL.eq(pr, neg(f.res))) return wrong('sign', 'Close — check the signs. The cell ' + t(tx(f.L)) + ' is (top term) × (side term), so the two constant-type terms must have ' + (coefOf(f.L) < 0 ? 'opposite' : 'the same') + ' signs.');
          return wrong('check-product', 'Check: ' + t(pf(a.p) + pf(b.p) + '=' + tx(pr)) + ', which doesn’t match the four cells. Every cell must be (top term) × (side term).');
        }
        var r3 = cP(resp[2] || ''); if (r3.v !== 'correct') return { v: r3.v, code: r3.code, hint: '<b>Product:</b> ' + (r3.hint || 'Add the four cells and collect like terms.') };
        return ok();
      },
      good: [[tx(add(C, D)), tx(add(A, B)), tx(f.res)], [tx(neg(add(A, B))), tx(neg(add(C, D))), tx(f.res)]], bad: [[tx(add(A, neg(B))), tx(add(C, D)), tx(f.res)], [tx(add(A, B)), tx(add(C, D)), tx(add(f.F, f.L))]],
      solution: 'The first row is ' + t(tx(f.F)) + ' and ' + t(tx(f.I)) + '. Their greatest common factor is the first side term, ' + t(tx(C)) + ', so the top terms are ' + t(tx(f.F) + '\\div ' + pf(C) + '=' + tx(A)) + ' and ' + t(tx(f.I) + '\\div ' + pf(C) + '=' + tx(B)) + '.<br>Then the second side term is ' + t(tx(f.O) + '\\div ' + pf(A) + '=' + tx(D)) + ' (check: ' + t(dot(B, D) + '=' + tx(f.L)) + ' ✓).<br>' + t(pf(add(A, B)) + pf(add(C, D)) + '=' + seq([f.F, f.I, f.O, f.L]) + '=' + tx(f.res)),
      hints: ['Look at one row: the side term is a common factor of both cells in that row.', 'Divide a cell by a known side term to get the other side term. Check every cell at the end.'] };
    return p;
  }
  /* EP11 missing factor with the product in the prompt */
  function missF(fT, gT, fmt, alt, square) {
    var T = mul(sumOf(fT), sumOf(gT)), p = missingFactor(fmt(t(tx(T))), fT, gT, alt);
    if (square) {
      var c1 = K.poly(sumOf(fT), { diag: function (S) { return { code: 'check-product', hint: 'Check by squaring: ' + t(pf(S) + '^{2}=' + tx(mul(S, S))) + ', not ' + t(tx(T)) + '.' }; } }), c2 = K.poly(alt);
      p.check = function (resp) { var a2 = c2(resp); if (a2.v !== 'wrong') return a2; return c1(resp); };
      var f = foil(fT[0], fT[1], fT[0], fT[1]);
      p.solution = t(tx(f.F) + '=(' + tx(fT[0]) + ')^{2}') + ' and ' + t(tx(f.L) + '=(' + tx(fT[1]) + ')^{2}') + '; the middle term ' + t(tx(add(f.O, f.I))) + ' is negative, so the base is ' + t(tx(sumOf(fT))) + ' (or ' + t(tx(alt)) + ').<br>Check: ' + t(seq([f.F, f.O, f.I, f.L]) + '=' + tx(T)) + ' ✓';
      p.hints = ['The first term and the last term of the trinomial are perfect squares. What are their square roots?', 'The middle term must be twice the product of those two terms. Its sign tells you the sign inside the bracket.'];
    }
    return p;
  }
  function shapeE(o, shed, sol) { // EP9 / EP10: rectangle with the top-left corner removed
    var W = o.wa + 0.35 * o.wb, H = o.ha + 0.35 * o.hb, cw = o.ca + (o.cb ? 0.35 * o.cb : 0), ch = 1 + 0.35 * o.e, v = o.v;
    var pts = [[0, 0], [W, 0], [W, H], [cw, H], [cw, H - ch], [0, H - ch]];
    var labels = [[W / 2, 0, svgLab(lin(o.wa, o.wb, v)), 0, 16], [W, H / 2, svgLab(lin(o.ha, o.hb, v)), 8, 0, 'start'], [cw / 2, H - ch, svgLab(xm(o.ca, 1, v)), 0, -12], [cw, H - ch / 2, svgLab(lin(1, o.e, v)), 6, 0, 'start']];
    if (shed) labels.push([cw / 2, H - ch / 2 + 0.1, 'shed', 0, -6, 'middle', 13]);
    return shapeSvg(pts, labels, { dash: [[0, H - ch, 0, H], [0, H, cw, H]], cut: sol === 'h' ? [[cw, H - ch, W, H - ch]] : sol === 'v' ? [[cw, 0, cw, H - ch]] : [], S: Math.min(44, 230 / W, 200 / H) });
  }
  /* EP5: m1(…) ± m2(…) */
  function twoProducts(m1, t1, m2, t2) {
    var P1 = mul(m1, sumOf(t1)), P2 = mul(m2, sumOf(t2)), T = add(P1, P2), s2 = tx(m2);
    var m2Tex = s2 === '-1' ? '-' : s2 === '1' ? '+' : (s2.charAt(0) === '-' ? s2 : '+' + s2);
    var prodTex = tx(m1) + br(t1) + m2Tex + br(t2);
    var ws = monoWrongs(m2, t2).map(function (w) { return { is: add(P1, w.is), code: w.code, hint: w.hint }; }).concat(monoWrongs(m1, t1).slice(0, 1).map(function (w) { return { is: add(w.is, P2), code: w.code, hint: w.hint }; }));
    var p1 = t1.map(function (q) { return mul(m1, q); }), p2 = t2.map(function (q) { return mul(m2, q); });
    return pp(t(prodTex), T, ws, t(tx(m1) + br(t1) + '=' + seq(p1)) + '<br>' + t((s2 === '-1' ? '-' : tx(m2)) + br(t2) + '=' + seq(p2)) + '<br>' + t(seq(p1.concat(p2)) + '=' + tx(T)),
      ['Expand each product separately — the sign in front belongs to the monomial and multiplies every term in its bracket.', 'Then collect like terms: same letters with the same exponents.'], 'expand ' + prodTex);
  }
  /* EP15: three binomials */
  function threeBin(facs) {
    var Q = mul(facs[0], facs[1]), T = mul(Q, facs[2]), prod = facs.map(pf).join(''), qt = termsOf(Q), pieces = qt.map(function (q) { return mul(q, facs[2]); });
    var fF = foil(termsOf(facs[0])[0], termsOf(facs[0])[1], termsOf(facs[1])[0], termsOf(facs[1])[1]);
    return pp(t(prod), T, [{ is: mul(add(fF.F, fF.L), facs[2]), code: 'fl-only', hint: 'Check your first product: ' + t(pf(facs[0]) + pf(facs[1])) + ' needs all four FOIL products, including the middle term.' }],
      'First pair: ' + t(pf(facs[0]) + pf(facs[1]) + '=' + tx(Q)) + '.<br>Distribute ' + t(pf(facs[2])) + ' over each term: ' + t(qt.map(function (q, i) { var s = tx(q); return (i && s.charAt(0) !== '-' ? '+' : '') + s + pf(facs[2]); }).join('')) + '<br>' + t('=' + seq(pieces.reduce(function (acc, pc) { return acc.concat(termsOf(pc)); }, [])) + '=' + tx(T)),
      ['Multiply two of the binomials first to get a trinomial.', 'Then multiply each term of the trinomial by the third binomial and collect like terms.'], 'three binomials ' + prod);
  }

  HW.defineLesson({
    id: 'u3l2', unit: 3, num: '2', title: 'Multiplying Monomials and Binomials', outcome: 'AN4',
    blurb: 'Area models and the distributive property — from a(b + c) all the way to FOIL.',
    questions: [
      { num: '1', section: 'Part A — Area Models and the Distributive Property', stem: 'State the polynomial product represented in each area model.', parts: [
        { id: '1a', level: 'BEG', make: function (r) { return q1(r, false); } },
        { id: '1b', level: 'BEG', make: function (r) { return q1(r, true); } }] },
      { num: '2', stem: function (sh) { return 'For each product: i) sketch an area model (on paper), ii) express the product as a sum or difference of terms, and iii) verify the result when ' + t('x=6') + '.<br>(a) ' + t(sh.a.tex) + ' &nbsp;&nbsp; (b) ' + t(sh.b.tex); },
        shared: function (r) {
          var k = r.int(2, 5), m = r.int(2, 4), c = r.int(1, 7), k2 = r.int(2, 5), c2 = r.pick([2, 3, 4, 5, 7, 8, 9]);
          if (r.chance(0.15)) { k = 3; m = 2; c = 3; k2 = 2; c2 = 5; }
          var A = { m: xm(k), terms: [xm(m), N(c)] }, B = { m: xm(-k2), terms: [N(c2), xm(-1)] };
          [A, B].forEach(function (o) { o.tex = tx(o.m) + br(o.terms); o.T = mul(o.m, sumOf(o.terms)); o.v = PL.at(o.T, { x: 6 }); });
          return { a: A, b: B };
        },
        parts: [
          { id: '2aii', sub: 'a ii', level: 'BEG', make: function (r, sh) { var o = sh.a; var p = expandMono(o.tex, o.m, o.terms); p.prompt = '(a) ii) Express ' + t(o.tex) + ' as a sum of terms.'; p.solution = grid(o.terms, [o.m], { max: 260 }) + p.solution; return p; } },
          { id: '2aiii', sub: 'a iii', level: 'BEG', make: function (r, sh) { return v6(sh.a); } },
          { id: '2bii', sub: 'b ii', level: 'EMG', make: function (r, sh) { var o = sh.b; var p = expandMono(o.tex, o.m, o.terms); p.prompt = '(b) ii) Express ' + t(o.tex) + ' as a sum or difference of terms.'; p.solution = grid(o.terms, [o.m], { max: 260 }) + p.solution; return p; } },
          { id: '2biii', sub: 'b iii', level: 'EMG', make: function (r, sh) { return v6(sh.b); } }] },
      { num: '3', stem: 'Expand.', parts: [
        { id: '3a', level: 'BEG', make: function (r) { var a = r.int(2, 9), b = r.int(2, 9), c = r.int(1, 9); return expandMono(a + br([xm(b), N(-c)]), N(a), [xm(b), N(-c)]); } },
        { id: '3b', level: 'BEG', make: function (r) { var a = r.int(2, 9), b = r.int(2, 9), c = r.int(2, 9); return expandMono('-' + a + br([xm(b), N(c)]), N(-a), [xm(b), N(c)]); } },
        { id: '3c', level: 'BEG', make: function (r) { var a = r.int(2, 9), b = r.int(2, 9), c = r.int(2, 9), ts = [M(b, { y: 1 }), M(c, { z: 1 })]; return expandMono(a + 'x' + br(ts), xm(a), ts); } },
        { id: '3d', level: 'EMG', make: function (r) { var c = r.int(2, 9), ts = [xm(1), M(-c, { y: 1 })]; return expandMono('-x' + br(ts), xm(-1), ts); } },
        { id: '3e', level: 'BEG', make: function (r) { var a = r.int(2, 9), b = r.int(2, 9), c = r.int(2, 9), ts = [xm(1), M(-b, { y: 1 }), M(c, { z: 1 })]; return expandMono(a + br(ts), N(a), ts); } },
        { id: '3f', level: 'EMG', make: function (r) { var k = r.int(2, 6), p = r.int(2, 6), q = r.int(2, 6), ts = [M(p, { b: 1 }), M(-1, { c: 1 }), M(q, { d: 1 })]; return expandMono('-' + k + 'a' + br(ts), M(-k, { a: 1 }), ts); } },
        { id: '3g', level: 'BEG', make: function (r) { var a = r.int(2, 9), c = r.int(2, 9), ts = [xm(1), N(c)]; var p = expandMono(br(ts) + a + 'x', xm(a), ts, { mSecond: true }); return p; } },
        { id: '3h', level: 'EMG', make: function (r) { var a = r.int(2, 6), b = r.int(2, 9), c = r.int(2, 9), ts = [xm(1), M(-b, { y: 1 }), M(c, { z: 1 })]; return expandMono(a + 'x' + br(ts), xm(a), ts); } }] },
      { num: '4', stem: 'Expand and simplify.', parts: [
        { id: '4a', level: 'BEG', make: function (r) {
          var o = pickWhere(function () { return { a: r.int(2, 9), b: r.int(2, 9), c: r.int(2, 20) }; }, function (o) { return o.a * o.b !== o.c; });
          var A = mul(N(o.a), lin(1, o.b)), T = add(A, N(-o.c));
          return pp(t(o.a + br([xm(1), N(o.b)]) + '-' + o.c), T, [{ is: lin(o.a, o.b - o.c), code: 'first-only', hint: 'Multiply <b>both</b> terms in the bracket by ' + t(o.a) + ': ' + t(o.a + '(' + o.b + ')=' + o.a * o.b) + '.' }, { is: mul(N(o.a), lin(1, o.b - o.c)), code: 'outside-in', hint: 'The ' + t('-' + o.c) + ' is <b>outside</b> the bracket, so it isn’t multiplied by ' + t(o.a) + '.' }],
            t(o.a + br([xm(1), N(o.b)]) + '-' + o.c + '=' + tx(A) + '-' + o.c + '=' + tx(T)), HS, 'a(x+b)-c');
        } },
        { id: '4b', level: 'EMG', make: function (r) {
          var c = r.int(5, 15), a = r.int(2, 5), b = r.int(2, 6), d = r.int(2, 9);
          if (c === a) c++;
          var B = mul(N(-a), lin(b, d)), T = add(N(c), B);
          return pp(t(c + '-' + a + br([xm(b), N(d)])), T, [
            { is: mul(N(c - a), lin(b, d)), code: 'subtract-first', hint: 'Multiplication comes before subtraction: expand ' + t('-' + a + br([xm(b), N(d)])) + ' first, then combine with ' + t(c) + '. You can’t do ' + t(c + '-' + a) + ' first.' },
            { is: add(N(c), xm(-a * b), N(a * d)), code: 'neg-first', hint: 'The ' + t('-' + a) + ' multiplies <b>both</b> terms: ' + t('(-' + a + ')(' + d + ')=-' + a * d) + '.' }],
            t(c + '-' + a + br([xm(b), N(d)]) + '=' + c + tx(B) + '=' + tx(T)), HS, 'c-a(bx+d)');
        } },
        { id: '4c', level: 'BEG', make: function (r) { var a = r.int(2, 9), b = r.int(2, 9), c = r.int(2, 9), A = mul(N(a), lin(1, -b)), T = add(A, xm(c));
          return pp(t(a + br([xm(1), N(-b)]) + '+' + c + 'x'), T, [{ is: add(lin(a, -b), xm(c)), code: 'first-only', hint: 'Multiply <b>both</b> terms in the bracket by ' + t(a) + '.' }], t(a + br([xm(1), N(-b)]) + '+' + c + 'x=' + seq([A, xm(c)]) + '=' + tx(T)), HS, 'a(x-b)+cx'); } },
        { id: '4d', level: 'EMG', make: function (r) {
          var o = pickWhere(function () { return { a: r.int(2, 6), b: r.int(2, 9), c: r.int(2, 6), d: r.int(2, 5), e: r.int(2, 9) }; }, function (o) { return o.a * o.b !== o.c * o.e; });
          var A = mul(N(o.a), lin(1, o.b)), B = mul(N(o.c), lin(o.d, -o.e)), T = add(A, B);
          return pp(t(o.a + br([xm(1), N(o.b)]) + '+' + o.c + br([xm(o.d), N(-o.e)])), T, monoWrongs(N(o.c), [xm(o.d), N(-o.e)]).map(function (w) { w.is = add(A, w.is); return w; }),
            t(o.a + br([xm(1), N(o.b)]) + '+' + o.c + br([xm(o.d), N(-o.e)]) + '=' + seq([xm(o.a), N(o.a * o.b), xm(o.c * o.d), N(-o.c * o.e)]) + '=' + tx(T)), HS, 'a(x+b)+c(dx-e)');
        } },
        { id: '4e', level: 'EMG', make: function (r) {
          var o = pickWhere(function () { return { a: r.int(2, 6), b: r.int(2, 9), c: r.int(2, 6), d: r.int(2, 5), e: r.int(2, 9) }; }, function (o) { return o.a !== o.c * o.d; });
          var A = mul(N(o.a), lin(1, o.b)), Bt = [xm(o.c * o.d), N(-o.c * o.e)], T = sub(A, sumOf(Bt));
          return pp(t(o.a + br([xm(1), N(o.b)]) + '-' + o.c + br([xm(o.d), N(-o.e)])), T, [{ is: subFirst(A, Bt), code: 'sub-first', hint: 'The ' + t('-' + o.c) + ' multiplies <b>both</b> terms: ' + t('(-' + o.c + ')(-' + o.e + ')=+' + o.c * o.e) + '.' }],
            'The ' + t('-' + o.c) + ' hits both terms: ' + t(seq([xm(o.a), N(o.a * o.b), xm(-o.c * o.d), N(o.c * o.e)]) + '=' + tx(T)), HS, 'a(x+b)-c(dx-e)');
        } },
        { id: '4f', level: 'EMG', make: function (r) {
          var o = pickWhere(function () { return { a: r.int(2, 6), b: r.int(2, 9), c: r.int(2, 6), d: r.int(2, 4), e: r.int(1, 9) }; }, function (o) { return o.a !== o.c * o.d; });
          var A = [xm(-o.a), N(-o.a * o.b)], B = [xm(o.c * o.d), N(-o.c * o.e)], T = sumOf(A.concat(B));
          return pp(t('-' + o.a + br([xm(1), N(o.b)]) + '+' + o.c + br([xm(o.d), N(-o.e)])), T, [{ is: add(xm(-o.a), N(o.a * o.b), B[0], B[1]), code: 'neg-first', hint: 'The ' + t('-' + o.a) + ' multiplies <b>both</b> terms in its bracket: ' + t('(-' + o.a + ')(' + o.b + ')=-' + o.a * o.b) + '.' }],
            t(seq(A.concat(B)) + '=' + tx(T)), HS, '-a(x+b)+c(dx-e)');
        } },
        { id: '4g', level: 'EMG', make: function (r) {
          var a = r.int(2, 9), b = r.int(2, 12), c = pickWhere(function () { return r.int(2, 12); }, function (v) { return v !== b; }), T = N(a * (b - c));
          return pp(t(a + br([xm(-1), N(b)]) + '+' + a + br([xm(1), N(-c)])), T, [{ is: add(xm(-2 * a), N(a * (b - c))), code: 'sign', hint: 'Check the ' + t('x') + '-terms: ' + t(a + '(-x)=-' + a + 'x') + ' and ' + t(a + '(x)=+' + a + 'x') + '. What do they add to?' }],
            t(seq([xm(-a), N(a * b), xm(a), N(-a * c)]) + '=' + tx(T)) + ' — the ' + t('x') + '-terms cancel.', HS, 'x terms cancel');
        } }] },
      { num: '5', stem: 'Identify the error in each simplification below and give the correct simplification.', shared: function (r) { return q5Shared(r); }, parts: [
        { id: '5aerr', sub: 'a error', level: 'EMG', make: function (r, sh) { return q5Err(r, sh, 'a'); } },
        { id: '5a', sub: 'a fix', level: 'BEG', make: function (r, sh) { return q5Fix(sh, 'a'); } },
        { id: '5berr', sub: 'b error', level: 'EMG', make: function (r, sh) { return q5Err(r, sh, 'b'); } },
        { id: '5b', sub: 'b fix', level: 'EMG', make: function (r, sh) { return q5Fix(sh, 'b'); } },
        { id: '5cerr', sub: 'c error', level: 'EMG', make: function (r, sh) { return q5Err(r, sh, 'c'); } },
        { id: '5c', sub: 'c fix', level: 'EMG', make: function (r, sh) { return q5Fix(sh, 'c'); } }] },
      { num: '6', stem: 'Expand and simplify.', parts: [
        { id: '6a', level: 'PRG', make: function (r) {
          var o = pickWhere(function () { return { k: r.int(2, 4), b: r.int(2, 6), m: r.int(2, 4), n: r.int(2, 5), c: r.int(1, 4) }; }, function (o) { return o.k !== o.m * o.n; });
          var a = function (c, e) { return xm(c, e, 'a'); }, A = mul(a(o.k), lin(1, o.b, 'a')), Bt = [a(o.m * o.n, 2), a(-o.m * o.c)], T = sub(A, sumOf(Bt));
          return pp(t(o.k + 'a' + br([a(1), N(o.b)]) + '-' + o.m + 'a' + br([a(o.n), N(-o.c)])), T, [{ is: subFirst(A, Bt), code: 'sub-first', hint: 'The ' + t('-' + o.m + 'a') + ' multiplies <b>both</b> terms: ' + t('(-' + o.m + 'a)(-' + o.c + ')=+' + o.m * o.c + 'a') + '.' }],
            t(seq([a(o.k, 2), a(o.k * o.b), a(-o.m * o.n, 2), a(o.m * o.c)]) + '=' + tx(T)), HS, 'ka(a+b)-ma(na-c)');
        } },
        { id: '6b', level: 'EMG', make: function (r) {
          var o = pickWhere(function () { return { k: r.int(2, 6), b: r.int(2, 9), m: r.int(1, 5), c: r.int(1, 9) }; }, function (o) { return o.k !== o.m; });
          var A = mul(N(o.k), add(xm(1, 2), N(o.b))), Bt = [xm(o.m, 2), N(-o.c)], T = sub(A, sumOf(Bt));
          return pp(t(o.k + br([xm(1, 2), N(o.b)]) + '-' + br(Bt)), T, [{ is: subFirst(A, Bt), code: 'sub-first', hint: SUBHINT + ' ' + t('-(-' + o.c + ')=+' + o.c) + '.' }],
            t(seq([xm(o.k, 2), N(o.k * o.b), xm(-o.m, 2), N(o.c)]) + '=' + tx(T)), HS, 'k(x^2+b)-(mx^2-c)');
        } },
        { id: '6c', level: 'BEG', make: function (r) {
          var o = pickWhere(function () { return { a: r.int(2, 5), b: r.int(2, 9), c: r.int(1, 9) }; }, function (o) { return o.a * o.b !== o.c; });
          var A = mul(N(o.a), lin(1, o.b)), T = add(A, xm(-1), N(-o.c));
          return pp(t(o.a + br([xm(1), N(o.b)]) + '-x-' + o.c), T, [{ is: add(A, xm(-1), N(o.c)), code: 'sign', hint: 'There is no bracket after the minus sign: ' + t('-x-' + o.c) + ' are two separate terms, both subtracted.' }, { is: add(lin(o.a, o.b), xm(-1), N(-o.c)), code: 'first-only', hint: 'Multiply <b>both</b> terms in the bracket by ' + t(o.a) + '.' }],
            t(seq([xm(o.a), N(o.a * o.b), xm(-1), N(-o.c)]) + '=' + tx(T)), HS, 'a(x+b)-x-c');
        } },
        { id: '6d', level: 'EMG', make: function (r) {
          var o = pickWhere(function () { return { b: r.int(2, 9), c: r.int(1, 9), d: r.int(1, 9) }; }, function (o) { return o.b !== o.c; });
          var w = function (c, e) { return xm(c, e, 'w'); }, A = mul(w(1), add(w(1, 2), N(o.b))), Bt = [w(o.c), N(o.d)], T = sub(A, sumOf(Bt));
          return pp(t('w' + br([w(1, 2), N(o.b)]) + '-' + br(Bt)), T, [{ is: subFirst(A, Bt), code: 'sub-first', hint: SUBHINT }, { is: sub(add(w(1, 2), N(o.b)), sumOf(Bt)), code: 'first-only', hint: 'Multiply <b>both</b> terms of ' + t(br([w(1, 2), N(o.b)])) + ' by ' + t('w') + ': ' + t('w\\cdot w^{2}=w^{3}') + '.' }],
            t(seq([w(1, 3), w(o.b), w(-o.c), N(-o.d)]) + '=' + tx(T)), HS, 'w(w^2+b)-(cw+d)');
        } },
        { id: '6e', level: 'EMG', make: function (r) {
          var o = pickWhere(function () { return { a: r.int(2, 5), b: r.int(2, 9), c: r.int(2, 5), d: r.int(2, 5), e: r.int(2, 5) }; }, function (o) { return o.a * o.c !== o.d * o.e; });
          var y = function (c) { return M(c, { y: 1 }); }, A = mul(N(o.a), add(xm(o.b), y(-o.c))), B = mul(N(o.d), add(y(o.e), xm(1))), T = add(A, B);
          return pp(t(o.a + br([xm(o.b), y(-o.c)]) + '+' + o.d + br([y(o.e), xm(1)])), T, [{ is: add(A, y(o.d * o.e), xm(1)), code: 'first-only', hint: 'Multiply <b>both</b> terms of the second bracket by ' + t(o.d) + ' — including the ' + t('x') + ' written last.' }],
            t(seq([xm(o.a * o.b), y(-o.a * o.c), y(o.d * o.e), xm(o.d)]) + '=' + tx(T)), ['Expand each bracket, then collect the ' + t('x') + '-terms and the ' + t('y') + '-terms separately.', 'Terms with different letters can’t be combined.'], 'a(bx-cy)+d(ey+x)');
        } },
        { id: '6f', level: 'PRG', make: function (r) {
          var o = pickWhere(function () { return { a: r.int(2, 4), b: r.int(2, 3), c: r.int(2, 6), d: r.int(2, 4) }; }, function (o) { return o.c !== o.a * o.b; });
          var A = mul(xm(-o.a), add(xm(1, 3), xm(o.b, 2))), Bt = mul(xm(-o.c), add(xm(o.d, 3), xm(-1, 2))), T = add(A, Bt);
          return pp(t('-' + o.a + 'x' + br([xm(1, 3), xm(o.b, 2)]) + '-' + o.c + 'x' + br([xm(o.d, 3), xm(-1, 2)])), T, [{ is: add(A, xm(-o.c * o.d, 4), xm(-o.c, 3)), code: 'neg-first', hint: 'The ' + t('-' + o.c + 'x') + ' multiplies both terms: ' + t('(-' + o.c + 'x)(-x^{2})=+' + o.c + 'x^{3}') + '.' }],
            t('(' + seq([xm(-o.a, 4), xm(-o.a * o.b, 3)]) + ')+(' + seq([xm(-o.c * o.d, 4), xm(o.c, 3)]) + ')=' + tx(T)), ['Expand each product: multiply coefficients and add exponents (' + t('x\\cdot x^{3}=x^{4}') + ').', 'Then collect the ' + t('x^{4}') + '-terms and the ' + t('x^{3}') + '-terms.'], '-ax(x^3+bx^2)-cx(dx^3-x^2)');
        } }] },
      { num: '7', stem: 'Determine a simplified expression for the area of each shape.', parts: [
        { id: '7a', level: 'PRG', make: function (r) { return q7a(r); } },
        { id: '7b', level: 'PRG', make: function (r) { return q7b(r); } }] },
      { num: '8', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '8', level: 'LIM', make: function (r) {
          var k = r.int(2, 5), c = r.int(2, 6), sm = r.chance(0.5) ? 1 : -1, sc = r.chance(0.6) ? -1 : 1;
          if (r.chance(0.15)) { k = 3; c = 2; sm = 1; sc = -1; }
          var m = xm(sm * k), cc = N(sc * c), T = mul(m, add(xm(1), cc));
          var cell = function (p) { var s = tx(p); return s.charAt(0) === '-' ? s : '+' + s; };
          var fig = grid([xm(1), cc], [m], { cells: [[cell(mul(m, xm(1))), cell(mul(m, cc))]], widths: [1, 1], heights: [1], max: 260 });
          var opts = [[1, 1], [-1, 1], [1, -1], [-1, -1]].map(function (s) {
            var mm = xm(s[0] * k), c2 = N(s[1] * c), e = mul(mm, add(xm(1), c2)), right = s[0] === sm && s[1] === sc;
            return { html: t(tx(mm) + br([xm(1), c2])), right: right, why: right ? null : 'That expands to ' + t(tx(e)) + '. Compare the <b>signs</b> of both areas with the model: ' + t(cell(mul(m, xm(1)))) + ' and ' + t(cell(mul(m, cc))) + '.' };
          });
          return KP.mc(r, fig + 'The area model above represents the expansion of', opts, 'The model shows ' + t(tx(m)) + ' times ' + t(tx(xm(1))) + ' and ' + t(tx(cc)) + ': areas ' + t(cell(mul(m, xm(1)))) + ' and ' + t(cell(mul(m, cc))) + '. So it is ' + t(tx(m) + br([xm(1), cc]) + '=' + tx(T)) + '.', ['Read the side label and the two top labels, then check that each piece’s area matches.'], 'read area model (MC)', true);
        } }] },
      { num: '9', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '9', level: 'EMG', make: function (r) { return q9(r); } }] },
      { num: '10', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '10', level: 'PRG', make: function (r) { return q10(r); } }] },
      { num: '11', section: 'Part B — Multiplying Two Binomials', stem: 'Use an area model to determine each product.', parts: [
        { id: '11a', level: 'BEG', make: function (r) { var a = r.int(2, 9), b = pickWhere(function () { return r.int(2, 9); }, function (v) { return v !== a; }); return gridBin(xm(1), N(a), xm(1), N(b)); } },
        { id: '11b', level: 'EMG', make: function (r) { return gridBin(xm(r.int(2, 4)), N(r.int(1, 5)), xm(r.int(2, 4)), N(r.int(1, 7))); } },
        { id: '11c', level: 'EMG', make: function (r) { var o = pickWhere(function () { return { a: r.int(2, 9), b: r.int(2, 6), c: r.int(1, 9) }; }, function (o) { return o.c !== o.a * o.b; }); return gridBin(xm(1, 1, 'y'), N(-o.a), xm(o.b, 1, 'y'), N(o.c)); } },
        { id: '11d', level: 'EMG', make: function (r) { var b = r.int(2, 9), c = pickWhere(function () { return r.int(2, 9); }, function (v) { return v !== b; }); return gridBin(xm(1, 2, 'a'), N(b), xm(1, 2, 'a'), N(-c)); } }] },
      { num: '12', stem: 'Use algebra tiles to model each product.', parts: [
        { id: '12a', level: 'BEG', make: function (r) { return tileProduct(r, 2, r.int(1, 3), 1, r.int(1, 2), 'tiles (x+a)(2x+b)', true); } },
        { id: '12b', level: 'EMG', make: function (r) { var a = r.int(2, 4), b = pickWhere(function () { return r.int(1, 3); }, function (v) { return v !== a; }); return tileProduct(r, 1, a, 1, -b, 'tiles (x+a)(x-b)'); } }] },
      { num: '13', stem: function (sh) { return HW.tiles.legend() + HW.tiles.frame(tilesOf(sh.m, sh.q), tilesOf(1, sh.s), { fill: true }) + 'The algebra-tile model shows a product of two binomials.'; },
        shared: function (r) { var m = r.pick([2, 2, 3]), q = r.int(1, 3), s = r.int(1, 3); if (r.chance(0.35)) { q = -q; } else { s = -s; } return { m: m, q: q, s: s, top: lin(m, q), side: lin(1, s) }; },
        parts: [
          { id: '13a', level: 'EMG', make: function (r, sh) {
            var c1 = K.poly(sh.top), c2 = K.poly(sh.side), fields = [pbox('Along the top', ['x']), pbox('Down the side', ['x'])];
            return { prompt: 'What two factors are shown along the top and down the side?', input: { type: 'fields', fields: fields }, key: [tx(sh.top), tx(sh.side)], answer: 'Top: ' + t(tx(sh.top)) + ', side: ' + t(tx(sh.side)),
              check: function (resp) {
                resp = resp || [];
                if (c1(resp[1] || '').v === 'correct' && c2(resp[0] || '').v === 'correct' && !PL.eq(sh.top, sh.side)) return wrong('swap', 'Those are the right two factors, but in the wrong boxes: the top row has ' + sh.m + ' ' + t('x') + '-tiles.');
                return K.fields([c1, c2], { labels: ['Along the top', 'Down the side'] })(resp);
              },
              bad: [[tx(sh.side), tx(sh.top)], [tx(lin(sh.m, -sh.q)), tx(sh.side)]],
              solution: 'Top: ' + sh.m + ' shaded ' + t('x') + '-tiles and ' + Math.abs(sh.q) + ' ' + (sh.q > 0 ? 'shaded' : 'white') + ' unit tile' + (Math.abs(sh.q) > 1 ? 's' : '') + ', so ' + t(tx(sh.top)) + '.<br>Side: one shaded ' + t('x') + '-tile and ' + Math.abs(sh.s) + ' ' + (sh.s > 0 ? 'shaded' : 'white') + ' unit tile' + (Math.abs(sh.s) > 1 ? 's' : '') + ', so ' + t(tx(sh.side)) + '.',
              hints: ['Read only the tiles <b>outside</b> the frame: the row above it and the column to its left.', 'White tiles are negative.'], text: 'read tile factors' };
          } },
          { id: '13b', level: 'PRG', make: function (r, sh) {
            var A = xm(sh.m), B = N(sh.q), C = xm(1), D = N(sh.s), f = foil(A, B, C, D);
            var p = pp('State the product, simplified.', f.res, binWrongs(A, B, C, D), 'Inside: ' + sh.m + ' ' + t('x^{2}') + '-tiles; ' + t('x') + '-tiles ' + t(tx(f.O)) + ' and ' + t(tx(f.I)) + ' (remove the zero pairs); ' + t(tx(f.L)) + ' in unit tiles.<br>' + t(pf(add(A, B)) + pf(add(C, D)) + '=' + seq([f.F, f.O, f.I, f.L]) + '=' + tx(f.res)), ['Count the tiles inside the frame: ' + t('x^{2}') + '-tiles, ' + t('x') + '-tiles (shaded minus white), unit tiles.', 'Or multiply the two factors you found in part (a).'], 'tile product');
            return p;
          } }] },
      { num: '14', stem: 'Use an area model and no calculator to determine each product.', parts: [
        { id: '14a', level: 'BEG', make: function (r) { return numGrid(r, r.int(2, 4), r.int(1, 5), r.int(2, 3), r.int(1, 4)); } },
        { id: '14b', level: 'BEG', make: function (r) { var a = r.int(3, 5), b = r.int(1, 2), c = r.int(5, 7), d = r.int(2, 4); if (a === c && b === d) d++; return numGrid(r, a, b, c, d); } },
        { id: '14c', level: 'BEG', make: function (r) { return numGrid(r, r.int(4, 6), r.int(6, 9), r.int(2, 3), r.int(6, 9)); } },
        { id: '14d', level: 'BEG', make: function (r) { var a = r.int(5, 9), b = r.int(4, 9); return numGrid(r, a, b, a, b); } }] },
      { num: '15', stem: function (sh) { return 'Multiplying two-digit numbers <i>is</i> multiplying binomials. Use ' + t(sh.tex) + ' to work out ' + t(sh.n1 + '\\times ' + sh.n2) + '.'; },
        shared: function (r) { var a = r.int(1, 9), b = pickWhere(function () { return r.int(1, 9); }, function (v) { return v !== a; }); if (r.chance(0.15)) { a = 3; b = 4; } return { a: a, b: b, n1: 10 + a, n2: 10 + b, tex: br([xm(1), N(a)]) + br([xm(1), N(b)]), T: mul(lin(1, a), lin(1, b)) }; },
        parts: [
          { id: '15a', level: 'BEG', make: function (r, sh) { var p = expandBin(sh.tex, xm(1), N(sh.a), xm(1), N(sh.b), 'foil', { pre: 'Expand ' }); return p; } },
          { id: '15b', level: 'BEG', make: function (r, sh) {
            var v = sh.n1 * sh.n2;
            return KP.number('Substitute ' + t('x=10') + ' into both ' + t(sh.tex) + ' and your expansion to calculate ' + t(sh.n1 + '\\times ' + sh.n2) + ' without a calculator.', v,
              function (x) { return x === 100 + sh.a * sh.b ? { code: 'fl-total', hint: 'You need the middle term too: ' + t((sh.a + sh.b) + 'x') + ' becomes ' + t((sh.a + sh.b) * 10) + '.' } : null; },
              t('(10+' + sh.a + ')(10+' + sh.b + ')=' + sh.n1 + '\\times ' + sh.n2) + ' and ' + t('10^{2}+' + (sh.a + sh.b) + '(10)+' + sh.a * sh.b + '=100+' + (sh.a + sh.b) * 10 + '+' + sh.a * sh.b + '=' + v) + '.', ['With ' + t('x=10') + ': ' + t('x^{2}=100') + ', and each ' + t('x') + ' is ' + t('10') + '.'], 'x=10 gives ' + sh.n1 + 'x' + sh.n2);
          } },
          { id: '15c', level: 'EMG', make: function (r, sh) {
            var s = sh.a + sh.b, c = sh.a * sh.b;
            return KP.mc(r, 'Why does this work?', [
              { html: t(sh.n1 + '=10+' + sh.a) + ' and ' + t(sh.n2 + '=10+' + sh.b) + ', so ' + t(sh.n1 + '\\times ' + sh.n2) + ' <i>is</i> ' + t(sh.tex) + ' with ' + t('x=10') + '; the terms become ' + t('100') + ', ' + t(s * 10) + ' and ' + t(c) + '.', right: true },
              { html: 'Any expansion gives the right answer when ' + t('x=10') + ', even if it is wrong.', why: 'A wrong expansion gives a wrong value — that is exactly why substituting is a good check.' },
              { html: 'Because ' + t(sh.n1 + '\\times ' + sh.n2) + ' is always ' + t('10\\times 10') + ' plus ' + t(sh.a + '\\times ' + sh.b) + '.', why: 'That leaves out the middle term: ' + t('100+' + c + '=' + (100 + c)) + ', not ' + t(sh.n1 * sh.n2) + '. The cross products ' + t('10\\times ' + sh.b) + ' and ' + t(sh.a + '\\times 10') + ' are missing.' },
              { html: 'Because ' + t('x=10') + ' makes ' + t('x^{2}') + ' and ' + t(s + 'x') + ' equal.', why: 'At ' + t('x=10') + ', ' + t('x^{2}=100') + ' and ' + t(s + 'x=' + s * 10) + ' — not equal, and it wouldn’t matter anyway.' }],
              'Splitting each number into tens and ones turns the product into a binomial product: ' + t(sh.n1 + '\\times ' + sh.n2 + '=(10+' + sh.a + ')(10+' + sh.b + ')') + '. The expansion ' + t(tx(sh.T)) + ' at ' + t('x=10') + ' lists the same partial products as the area-model grid: ' + t('100+' + s * 10 + '+' + c + '=' + sh.n1 * sh.n2) + '.', ['Write each number as ' + t('10+\\text{something}') + '.'], 'why x=10 works');
          } }] },
      { num: '16', stem: 'Use the distributive property to determine each product.', parts: [
        { id: '16a', level: 'BEG', make: function (r) { var a = r.int(2, 9), b = pickWhere(function () { return r.int(2, 9); }, function (v) { return v !== a; }); return expandBin(br([xm(1), N(a)]) + br([xm(1), N(b)]), xm(1), N(a), xm(1), N(b), 'dist'); } },
        { id: '16b', level: 'EMG', make: function (r) { var o = pickWhere(function () { return { p: r.int(2, 9), q: r.int(2, 5), s: r.int(1, 9) }; }, function (o) { return o.p * o.q !== o.s; }); var a = function (c) { return xm(c, 1, 'a'); }; return expandBin(br([a(1), N(o.p)]) + br([a(o.q), N(-o.s)]), a(1), N(o.p), a(o.q), N(-o.s), 'dist'); } },
        { id: '16c', level: 'EMG', make: function (r) { var a = r.int(2, 9), b = r.int(2, 9), p = xm(1, 1, 'p'), q = xm(1, 1, 'q'); return expandBin(br([p, N(-a)]) + br([q, N(-b)]), p, N(-a), q, N(-b), 'dist', { wrong: [] }); } },
        { id: '16d', level: 'EMG', make: function (r) { var a = r.int(2, 9), b = pickWhere(function () { return r.int(2, 9); }, function (v) { return v !== a; }), y = function (c) { return M(c, { y: 1 }); }; return expandBin(br([xm(1), y(a)]) + br([xm(1), y(-b)]), xm(1), y(a), xm(1), y(-b), 'dist'); } }] },
      { num: '17', stem: 'Use FOIL to determine each product.', parts: [
        { id: '17a', level: 'BEG', make: function (r) { var a = r.int(2, 9), b = pickWhere(function () { return r.int(2, 9); }, function (v) { return v !== a; }); return expandBin(br([xm(1), N(a)]) + br([xm(1), N(b)]), xm(1), N(a), xm(1), N(b), 'foil'); } },
        { id: '17b', level: 'BEG', make: function (r) { var a = r.int(2, 9), b = pickWhere(function () { return r.int(2, 9); }, function (v) { return v !== a; }), y = function (c) { return xm(c, 1, 'y'); }; return expandBin(br([y(1), N(a)]) + br([y(1), N(-b)]), y(1), N(a), y(1), N(-b), 'foil'); } },
        { id: '17c', level: 'BEG', make: function (r) { var a = r.int(2, 9), b = pickWhere(function () { return r.int(2, 12); }, function (v) { return v !== a; }), m = function (c) { return xm(c, 1, 'm'); }; return expandBin(br([m(1), N(-a)]) + br([m(1), N(-b)]), m(1), N(-a), m(1), N(-b), 'foil'); } },
        { id: '17d', level: 'PRG', make: function (r) { var o = pickWhere(function () { return { a: r.int(2, 4), b: r.int(2, 9), c: r.int(2, 4), d: r.int(2, 9) }; }, function (o) { return o.a * o.d !== o.b * o.c; }); return expandBin(br([xm(o.a), N(-o.b)]) + br([xm(o.c), N(o.d)]), xm(o.a), N(-o.b), xm(o.c), N(o.d), 'foil'); } },
        { id: '17e', level: 'PRG', make: function (r) { var o = pickWhere(function () { return { p: r.int(2, 6), q: r.int(2, 5), s: r.int(2, 7) }; }, function (o) { return o.p * o.s !== o.q; }), a = function (c) { return M(c, { a: 1 }); }, b = function (c) { return M(c, { b: 1 }); }; return expandBin(br([a(o.p), b(-o.q)]) + br([a(1), b(o.s)]), a(o.p), b(-o.q), a(1), b(o.s), 'foil'); } },
        { id: '17f', level: 'PRG', make: function (r) {
          var c = r.int(2, 9), k = r.int(2, 5), y = function (v) { return xm(v, 1, 'y'); }; if (c === k) c++; var A = N(c), B = y(-k);
          var p = expandBin(br([A, B]) + '^{2}', A, B, A, B, 'foil', { square: true, wrong: [{ is: add(N(c * c), xm(-k * k, 2, 'y')), code: 'last-sign', hint: t(dot(B, B) + '=' + tx(mul(B, B))) + ' — a negative times a negative is positive. And don’t forget the middle term.' }], solPre: 'Write it out: ' + t(br([A, B]) + br([A, B])) + '.<br>' });
          return p;
        } }] },
      { num: '18', stem: function (sh) { return 'A rectangle has length ' + t(br([xm(sh.p, 1, 'a'), N(sh.q)])) + ' cm and width ' + t(br([xm(1, 1, 'a'), N(sh.s)])) + ' cm. Determine the area of the rectangle, in ' + t('\\text{cm}^{2}') + ', by each method.'; },
        shared: function (r) { var p = r.int(2, 5), q = r.int(1, 9), s = r.int(2, 9); if (r.chance(0.15)) { p = 4; q = 3; s = 6; } return { p: p, q: q, s: s, A: xm(p, 1, 'a'), B: N(q), C: xm(1, 1, 'a'), D: N(s) }; },
        parts: [
          { id: '18i', sub: 'i', level: 'BEG', make: function (r, sh) {
            var f = foil(sh.A, sh.B, sh.C, sh.D), p = pp(grid([sh.A, sh.B], [sh.C, sh.D], { blank: true }) + '(i) Use the area model.', f.res, binWrongs(sh.A, sh.B, sh.C, sh.D), gridSol(sh.A, sh.B, sh.C, sh.D) + ' The area is ' + t(tx(f.res)) + ' cm².', HB, 'area by area model', { before: t('A='), after: t('\\text{ cm}^{2}') });
            return p;
          } },
          { id: '18ii', sub: 'ii', level: 'BEG', make: function (r, sh) {
            var L = add(sh.C, sh.D), P1 = mul(sh.A, L), P2 = mul(sh.B, L), f = foil(sh.A, sh.B, sh.C, sh.D), Lt = br([sh.C, sh.D]);
            var fields = [pbox(t(tx(sh.A) + Lt + '='), ['a']), pbox(t(tx(sh.B) + Lt + '='), ['a']), pbox('Area', ['a'], { after: t('\\text{ cm}^{2}') })];
            var p = KP.fields('(ii) Use the distributive property: ' + t(br([sh.A, sh.B]) + Lt + '=' + tx(sh.A) + Lt + '+' + tx(sh.B) + Lt) + '.', fields,
              [chk(P1, monoWrongs(sh.A, [sh.C, sh.D])), chk(P2, monoWrongs(sh.B, [sh.C, sh.D])), chk(f.res, binWrongs(sh.A, sh.B, sh.C, sh.D))], [tx(P1), tx(P2), tx(f.res)],
              t(tx(sh.A) + Lt + '=' + tx(P1)) + ', ' + t(tx(sh.B) + Lt + '=' + tx(P2)) + ', area ' + t(tx(f.res)) + ' cm²',
              distBinSol(sh.A, sh.B, sh.C, sh.D) + ' cm²', ['Multiply ' + t(tx(sh.A)) + ' by both terms of ' + t(Lt) + ', then ' + t(tx(sh.B)) + ' by both terms.', 'Add the two results and collect the ' + t('a') + '-terms.'], 'area by distributing');
            p.bad = [[tx(P1), tx(P2), tx(add(f.F, f.L))]];
            return p;
          } },
          { id: '18iii', sub: 'iii', level: 'BEG', make: function (r, sh) {
            var f = foil(sh.A, sh.B, sh.C, sh.D), fields = ['First', 'Outside', 'Inside', 'Last'].map(function (n) { return pbox(n, ['a']); }).concat([pbox('Area', ['a'], { after: t('\\text{ cm}^{2}') })]);
            var p = KP.fields('(iii) Use FOIL on ' + t(br([sh.A, sh.B]) + br([sh.C, sh.D])) + '.', fields, [K.poly(f.F), K.poly(f.O), K.poly(f.I), K.poly(f.L), chk(f.res, binWrongs(sh.A, sh.B, sh.C, sh.D))],
              [tx(f.F), tx(f.O), tx(f.I), tx(f.L), tx(f.res)], 'F ' + t(tx(f.F)) + ', O ' + t(tx(f.O)) + ', I ' + t(tx(f.I)) + ', L ' + t(tx(f.L)) + '; area ' + t(tx(f.res)) + ' cm²',
              foilSol(sh.A, sh.B, sh.C, sh.D) + ' cm². All three methods agree.', ['First: first × first. Outside: first × last. Inside: last × first. Last: last × last.'], 'area by FOIL');
            p.bad = PL.eq(f.O, f.I) ? [[tx(f.F), tx(f.O), tx(f.I), tx(f.L), tx(add(f.F, f.L))]] : [[tx(f.F), tx(f.I), tx(f.O), tx(f.L), tx(f.res)]];
            return p;
          } }] },
      { num: '19', stem: 'Expand and simplify where possible.', parts: [
        { id: '19a', level: 'PRG', make: function (r) { var o = pickWhere(function () { return { a: r.int(2, 6), b: r.int(2, 9), c: r.int(2, 4), d: r.int(2, 9) }; }, function (o) { return o.a * o.d !== o.b * o.c; }); return expandBin(br([xm(o.a), N(-o.b)]) + br([xm(o.c), N(o.d)]), xm(o.a), N(-o.b), xm(o.c), N(o.d), 'foil'); } },
        { id: '19b', level: 'PRG', make: function (r) { var a = r.int(2, 4), b = r.int(2, 6), c = pickWhere(function () { return r.int(1, 5); }, function (v) { return v !== b; }), h = function (v) { return xm(v, 1, 'h'); }; return expandBin(br([h(a), N(-b)]) + br([h(a), N(c)]), h(a), N(-b), h(a), N(c), 'foil'); } },
        { id: '19c', level: 'EMG', make: function (r) { var a = r.int(2, 5), b = pickWhere(function () { return r.int(2, 9); }, function (v) { return v !== a; }), z = function (v) { return xm(v, 1, 'z'); }; return expandBin(br([z(a), N(b)]) + br([z(a), N(-b)]), z(a), N(b), z(a), N(-b), 'foil'); } },
        { id: '19d', level: 'PRG', make: function (r) { var o = pickWhere(function () { return { a: r.int(2, 5), b: r.int(2, 4), c: r.int(2, 6) }; }, function (o) { return o.a * o.b !== o.c; }), X2 = xm(1, 2), Y = function (c) { return M(c, { y: 2 }); }; return expandBin(br([X2, Y(o.a)]) + br([xm(o.b, 2), Y(-o.c)]), X2, Y(o.a), xm(o.b, 2), Y(-o.c), 'foil'); } }] },
      { num: '20', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '20', level: 'BEG', make: function (r) { return q20(r); } }] },
      { num: '21', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '21', level: 'PRG', make: function (r) { return q21(r); } }] }
    ],
    extra: [
      { num: '1', section: 'Extra practice A — Four-cell grids, forwards and backwards', stem: 'Fill in the four cells of each grid, then state the product in expanded form.', parts: [
        { id: 'e1a', level: 'EMG', make: function (r) { var o = pickWhere(function () { return { a: r.int(2, 4), b: r.int(1, 6), c: r.int(2, 4), d: r.int(1, 7) }; }, function (o) { return o.a * o.d !== o.b * o.c; }); return gridFill(xm(o.a), N(o.b), xm(o.c), N(-o.d)); } },
        { id: 'e1b', level: 'EMG', make: function (r) { var o = pickWhere(function () { return { a: r.int(2, 5), b: r.int(2, 5), c: r.int(2, 3), d: r.int(2, 6) }; }, function (o) { return o.a * o.d !== o.b * o.c; }); return gridFill(xm(o.a, 1, 'm'), M(-o.b, { n: 1 }), xm(o.c, 1, 'm'), M(o.d, { n: 1 })); } },
        { id: 'e1c', level: 'EMG', make: function (r) { var o = pickWhere(function () { return { b: r.int(2, 9), c: r.int(2, 3), d: r.int(2, 9) }; }, function (o) { return o.b * o.c !== o.d; }); return gridFill(xm(1, 2), N(o.b), xm(o.c, 2), N(-o.d)); } }] },
      { num: '2', stem: 'Each grid below has already been filled in, but the side lengths have been erased.', parts: [
        { id: 'e2a', level: 'ADV', make: function (r) { var o = pickWhere(function () { return { a: r.int(2, 4), b: r.int(1, 5), c: r.int(2, 3), d: r.int(1, 7) }; }, function (o) { return o.a * o.d !== o.b * o.c && HW.ex.gcd(o.a, o.b) === 1 && HW.ex.gcd(o.c, o.d) === 1; }); return backGrid(xm(o.a), N(o.b), xm(o.c), N(-o.d)); } },
        { id: 'e2b', level: 'ADV', make: function (r) { var o = pickWhere(function () { return { p: r.int(2, 5), q: r.int(2, 5), s: r.int(2, 3), u: r.int(2, 7) }; }, function (o) { return o.p * o.u !== o.q * o.s && HW.ex.gcd(o.p, o.q) === 1 && HW.ex.gcd(o.s, o.u) === 1; }); return backGrid(xm(o.p, 1, 'a'), M(-o.q, { b: 1 }), xm(o.s, 1, 'a'), M(o.u, { b: 1 })); } },
        { id: 'e2c', level: 'ADV', make: function (r) { var o = pickWhere(function () { return { p: r.int(2, 6), q: r.int(2, 4), s: r.int(2, 9) }; }, function (o) { return o.s !== o.p * o.q; }); return backGrid(xm(1, 2), N(-o.p), xm(o.q, 2), N(o.s)); } }] },
      { num: '3', stem: 'These grids are part-filled. Recover every missing entry (the bold letters), then state the product.', parts: [
        { id: 'e3a', level: 'ADV', make: function (r) {
          var a = r.int(2, 3), b = r.int(2, 9), c = r.int(2, 5), d = r.int(2, 7);
          if (r.chance(0.15)) { a = 2; b = 7; c = 4; d = 3; }
          var A = xm(a), B = N(b), C = xm(c), D = N(-d), f = foil(A, B, C, D);
          var g = grid([A, B], [C, D], { topLabels: [tx(A), CELL[0]], sideLabels: [CELL[1], tx(D)], cells: [[tx(f.F), tx(f.I)], [CELL[2], tx(f.L)]] });
          var p = KP.fields(g + 'Find the missing entries A, B and C, then state the product.', [pbox('A', ['x']), pbox('B', ['x']), pbox('C', ['x']), pbox('Product', ['x'])],
            [K.poly(B), K.poly(C, { wrong: [{ is: xm(c * a), code: 'value', hint: 'B is a side length: ' + t(tx(f.F) + '\\div ' + tx(A)) + '. Divide the coefficients and subtract the exponents.' }] }), K.poly(f.O), chk(f.res, binWrongs(A, B, C, D))], [tx(B), tx(C), tx(f.O), tx(f.res)],
            'A ' + t(tx(B)) + ', B ' + t(tx(C)) + ', C ' + t(tx(f.O)) + '; product ' + t(pf(add(A, B)) + pf(add(C, D)) + '=' + tx(f.res)),
            'Row 1 side: ' + t(tx(f.F) + '\\div ' + tx(A) + '=' + tx(C)) + ' (B).<br>Column 2 top: ' + t(tx(f.I) + '\\div ' + tx(C) + '=' + tx(B)) + ' (A); check ' + t(dot(B, D) + '=' + tx(f.L)) + ' ✓.<br>Missing cell: ' + t(dot(A, D) + '=' + tx(f.O)) + ' (C).<br>' + t(pf(add(A, B)) + pf(add(C, D)) + '=' + seq([f.F, f.I, f.O, f.L]) + '=' + tx(f.res)),
            ['Start where a cell and one of its sides are both known: ' + t(tx(f.F)) + ' and ' + t(tx(A)) + '.', 'A missing side = (cell) ÷ (the known side). A missing cell = (top) × (side).'], 'part-filled grid (a)');
          p.bad = [[tx(B), tx(C), tx(neg(f.O)), tx(f.res)]];
          return p;
        } },
        { id: 'e3b', level: 'ADV', make: function (r) {
          var a = r.int(2, 4), b = r.int(2, 5), c = r.int(2, 5), d = r.int(2, 5);
          if (r.chance(0.15)) { a = 3; b = 2; c = 5; d = 4; }
          var A = xm(a, 1, 'p'), B = M(-b, { q: 1 }), C = xm(c, 1, 'p'), D = M(d, { q: 1 }), f = foil(A, B, C, D), vs = ['p', 'q'];
          var g = grid([A, B], [C, D], { topLabels: [CELL[0], tx(B)], sideLabels: [tx(C), CELL[1]], cells: [[tx(f.F), CELL[2]], [tx(f.O), tx(f.L)]] });
          var p = KP.fields(g + 'Find the missing entries A, B and C, then state the product.', [pbox('A', vs), pbox('B', vs), pbox('C', vs), pbox('Product', vs)],
            [K.poly(A), K.poly(D), K.poly(f.I), chk(f.res, binWrongs(A, B, C, D))], [tx(A), tx(D), tx(f.I), tx(f.res)],
            'A ' + t(tx(A)) + ', B ' + t(tx(D)) + ', C ' + t(tx(f.I)) + '; product ' + t(pf(add(A, B)) + pf(add(C, D)) + '=' + tx(f.res)),
            'Column 1 top: ' + t(tx(f.F) + '\\div ' + tx(C) + '=' + tx(A)) + ' (A).<br>Row 2 side: ' + t(tx(f.O) + '\\div ' + tx(A) + '=' + tx(D)) + ' (B); check ' + t(dot(B, D) + '=' + tx(f.L)) + ' ✓.<br>Missing cell: ' + t(dot(B, C) + '=' + tx(f.I)) + ' (C).<br>' + t(pf(add(A, B)) + pf(add(C, D)) + '=' + seq([f.F, f.I, f.O, f.L]) + '=' + tx(f.res)),
            ['Start with column 1: you know the cell ' + t(tx(f.F)) + ' and the side ' + t(tx(C)) + '.', 'A missing side = (cell) ÷ (the known side). A missing cell = (top) × (side).'], 'part-filled grid (b)');
          p.bad = [[tx(A), tx(D), tx(neg(f.I)), tx(f.res)]];
          return p;
        } },
        { id: 'e3c', level: 'PRG', make: function (r) {
          return KP.mc(r, 'In part (a) you found a missing cell from two side lengths, and a missing side length from a cell. Which job is harder, and why can a grid with several entries missing still be solvable?', [
            { html: 'A missing <b>side length</b> is harder: it is a division, and you first need a cell whose other side is known. A grid is solvable as long as each missing side borders a known cell whose other side is known.', right: true },
            { html: 'A missing <b>cell</b> is harder, because you have to divide; a grid is solvable only when at most one entry is missing.', why: 'A missing cell is just (top) × (side) — one multiplication. And part (a) had three entries missing and was still solvable.' },
            { html: 'They are equally hard; a grid can only be solved when all four cells are given.', why: 'In part (a) a cell was missing and you still recovered everything, one division or multiplication at a time.' },
            { html: 'A missing side length is harder because you must guess and check; any grid with two or more blanks has many answers.', why: 'No guessing is needed: divide a known cell by the known side next to it. Part (a) had one answer.' }],
            'Finding a cell is one multiplication. Finding a side is a division, and it only works from a cell whose other side you already know — so the order matters. Once every side is back, each missing cell is one more multiplication.', ['Which operation finds a cell? Which finds a side? What do you need to know first?'], 'grid: which job is harder (MC)');
        } }] },
      { num: '4', section: 'Extra practice B — Monomials over several variables', stem: 'Expand. Distribute the whole monomial, sign included, to each term inside the bracket.', parts: [
        { id: 'e4a', level: 'EMG', make: function (r) { var k = r.int(2, 5), a = r.int(2, 6), b = r.int(2, 6), c = r.int(2, 4), m = M(-k, { x: 2, y: 1 }), ts = [xm(a), M(-b, { y: 1 }), M(c, { x: 1, y: 1 })]; return expandMono(tx(m) + br(ts), m, ts); } },
        { id: 'e4b', level: 'EMG', make: function (r) { var k = r.int(2, 4), p = r.int(2, 5), q = r.int(2, 6), m = M(-k, { a: 1, b: 2 }), ts = [M(p, { a: 2 }), M(-1, { a: 1, b: 1 }), M(q, { b: 1 })]; return expandMono(tx(m) + br(ts), m, ts); } },
        { id: 'e4c', level: 'EMG', make: function (r) { var k = r.int(2, 6), p = r.int(2, 4), q = r.int(2, 5), m = M(k, { m: 2, n: 1 }), ts = [M(-p, { m: 1 }), M(q, { n: 1 }), M(-1, { m: 1, n: 1 })]; return expandMono(tx(m) + br(ts), m, ts); } },
        { id: 'e4d', level: 'EMG', make: function (r) { var a = r.int(2, 6), b = r.int(2, 9), m = M(-1, { p: 1, q: 1 }), ts = [M(1, { p: 2 }), M(-a, { p: 1, q: 1 }), M(-b, { q: 2 })]; return expandMono(tx(m) + br(ts), m, ts); } },
        { id: 'e4e', level: 'EMG', make: function (r) { var k = r.int(2, 5), p = r.int(2, 4), q = r.int(2, 5), m = M(-k, { c: 2, d: 3 }), ts = [M(p, { c: 1, d: 1 }), M(-q, { c: 2 }), M(1, { d: 1 })]; return expandMono(tx(m) + br(ts), m, ts); } },
        { id: 'e4f', level: 'EMG', make: function (r) { var a = r.int(2, 5), b = r.int(2, 5), c = r.int(2, 6), k = r.int(2, 7), m = M(-k, { x: 1, y: 1 }), ts = [xm(a), M(-b, { y: 1 }), M(-c, { z: 1 })]; return expandMono(br(ts) + '(' + tx(m) + ')', m, ts, { mSecond: true }); } }] },
      { num: '5', stem: 'Expand and simplify. Watch the two signs in each product.', parts: [
        { id: 'e5a', level: 'PRG', make: function (r) {
          var o = pickWhere(function () { return { p: r.int(2, 3), q: r.int(2, 4), rr: r.int(2, 5), s: r.int(2, 6), u: r.int(2, 3) }; }, function (o) { return o.p * o.rr !== o.s * o.u; });
          var m1 = M(-o.p, { a: 1 }), t1 = [M(o.q, { a: 1 }), M(-o.rr, { b: 1 })], m2 = M(-o.s, { b: 1 }), t2 = [M(o.u, { a: 1 }), M(1, { b: 1 })];
          return twoProducts(m1, t1, m2, t2, '+');
        } },
        { id: 'e5b', level: 'PRG', make: function (r) {
          var o = pickWhere(function () { return { p: r.int(2, 5), q: r.int(2, 3), rr: r.int(2, 4), s: r.int(2, 4), u: r.int(2, 3) }; }, function (o) { return o.p * o.q !== o.s * o.u && o.p * o.rr !== o.s; });
          return twoProducts(M(o.p, { x: 1, y: 1 }), [xm(o.q), M(-o.rr, { y: 1 })], M(-o.s, { x: 1 }), [M(o.u, { x: 1, y: 1 }), M(-1, { y: 2 })], '-');
        } },
        { id: 'e5c', level: 'PRG', make: function (r) { var p = r.int(2, 5), q = r.int(2, 5); return twoProducts(xm(-1, 2), [xm(1), M(-p, { y: 1 })], N(-1), [xm(q, 3), M(-1, { x: 2, y: 1 })], '-'); } },
        { id: 'e5d', level: 'PRG', make: function (r) {
          var o = pickWhere(function () { return { p: r.int(2, 6), q: r.int(2, 3), rr: r.int(2, 3), s: r.int(2, 4) }; }, function (o) { return o.p !== o.rr * o.s && o.p * o.q !== o.rr; });
          return twoProducts(M(o.p, { m: 1, n: 1 }), [M(1, { m: 1 }), M(-o.q, { n: 1 })], M(-o.rr, { m: 1 }), [M(o.s, { m: 1, n: 1 }), M(-1, { n: 2 })], '-');
        } },
        { id: 'e5e', level: 'PRG', make: function (r) {
          var o = pickWhere(function () { return { p: r.int(2, 3), q: r.int(2, 4), rr: r.int(2, 5), s: r.int(2, 3) }; }, function (o) { return o.p * o.q !== o.rr * o.s && o.p !== o.rr; });
          return twoProducts(M(-o.p, { u: 1, v: 1 }), [M(o.q, { u: 1 }), M(-1, { v: 1 })], M(-o.rr, { u: 1 }), [M(1, { v: 2 }), M(-o.s, { u: 1, v: 1 })], '-');
        } },
        { id: 'e5f', level: 'PRG', make: function (r, sh) { return twoProducts(M(-sh.k, { r: 1, s: 2 }), [M(sh.a, { r: 1 }), M(-1, { s: 1 })], M(-1, { r: 1, s: 1 }), [M(1, { s: 2 }), M(-sh.a * sh.k, { r: 1, s: 1 })], '-'); } },
        { id: 'e5g', level: 'EMG', make: function (r, sh) {
          var k = sh.k, a = sh.a, big = a * k;
          return KP.mc(r, 'Part (f) collapses to a single term. Which two terms cancelled, and why?', [
            { html: 'The two ' + t('r^{2}s^{2}') + ' terms: ' + t('(-' + k + 'rs^{2})(' + a + 'r)=-' + big + 'r^{2}s^{2}') + ' and ' + t('(-rs)(-' + big + 'rs)=+' + big + 'r^{2}s^{2}') + ' — the same size with opposite signs.', right: true },
            { html: 'The two ' + t('rs^{3}') + ' terms, because they have the same variables.', why: 'Like terms combine, but these two are ' + t(k + 'rs^{3}') + ' and ' + t('-rs^{3}') + ' — they add to ' + t(tx(M(k - 1, { r: 1, s: 3 }))) + ', which is the answer, not zero.' },
            { html: 'The two monomials in front cancel because both are negative.', why: 'Monomials in front don’t cancel each other — each one multiplies its own bracket. Look for two equal-and-opposite terms after expanding.' },
            { html: 'Nothing cancelled; the answer has one term because the brackets had two terms each.', why: 'Expanding gives four terms. Two of them must have cancelled to leave one term (after the other two combined).' }],
            t('-' + k + 'rs^{2}(' + a + 'r-s)=-' + big + 'r^{2}s^{2}+' + k + 'rs^{3}') + ' and ' + t('-rs(s^{2}-' + big + 'rs)=-rs^{3}+' + big + 'r^{2}s^{2}') + '. The ' + t('r^{2}s^{2}') + ' terms are equal and opposite, so they cancel; the ' + t('rs^{3}') + ' terms combine to ' + t(tx(M(k - 1, { r: 1, s: 3 }))) + '.', ['Write out all four terms of part (f) and look for an equal-and-opposite pair.'], 'which terms cancelled (MC)');
        } }],
        shared: function (r) { var k = r.int(2, 5), a = r.int(2, 4); if (r.chance(0.15)) { k = 3; a = 2; } return { k: k, a: a }; } },
      { num: '6', section: 'Extra practice C — Binomial times binomial', stem: 'Expand and simplify.', parts: [
        { id: 'e6a', level: 'BEG', make: function (r) { var a = r.int(2, 9), b = pickWhere(function () { return r.int(2, 9); }, function (v) { return v !== a; }); return expandBin(br([xm(1), N(-a)]) + br([xm(1), N(-b)]), xm(1), N(-a), xm(1), N(-b), 'foil'); } },
        { id: 'e6b', level: 'EMG', make: function (r) { var a = r.int(2, 4), b = pickWhere(function () { return r.int(2, 9); }, function (v) { return v !== a; }); return expandBin(br([xm(a), N(b)]) + br([xm(a), N(-b)]), xm(a), N(b), xm(a), N(-b), 'foil'); } },
        { id: 'e6c', level: 'PRG', make: function (r) { var o = { a: r.int(2, 5), b: r.int(2, 5), c: r.int(2, 4), d: r.int(2, 6) }, A = xm(o.a, 1, 'p'), B = M(-o.b, { q: 1 }), C = xm(o.c, 1, 'p'), D = M(-o.d, { q: 1 }); return expandBin(br([A, B]) + br([C, D]), A, B, C, D, 'foil'); } },
        { id: 'e6d', level: 'PRG', make: function (r) { var a = r.int(2, 9), b = pickWhere(function () { return r.int(2, 9); }, function (v) { return v !== a; }), X2 = xm(1, 2); return expandBin(br([X2, M(a, { y: 1 })]) + br([X2, M(-b, { y: 1 })]), X2, M(a, { y: 1 }), X2, M(-b, { y: 1 }), 'foil'); } },
        { id: 'e6e', level: 'EMG', make: function (r) { var a = r.int(2, 9), b = pickWhere(function () { return r.int(2, 6); }, function (v) { return v !== a; }), T1 = xm(-b, 1, 't'), T2 = xm(b, 1, 't'); return expandBin(br([N(a), T1]) + br([N(a), T2]), N(a), T1, N(a), T2, 'foil'); } },
        { id: 'e6f', level: 'PRG', make: function (r) {
          var p = r.int(2, 5), q = pickWhere(function () { return r.int(2, 5); }, function (v) { return v !== p; }), A = M(p, { a: 1 }), B = M(-q, { b: 1 });
          return expandBin(br([A, B]) + '^{2}', A, B, A, B, 'foil', { square: true, solPre: 'Write it out: ' + t(br([A, B]) + br([A, B])) + '.<br>', wrong: [{ is: add(mul(A, A), neg(mul(B, B))), code: 'no-middle', hint: 'A square is not a difference of squares: ' + t(br([A, B]) + '^{2}=' + br([A, B]) + br([A, B])) + '. Expand all four products — the last one is ' + t(dot(B, B) + '=' + tx(mul(B, B))) + '.' }] });
        } }] },
      { num: '7', stem: 'Each product below is a sum times a difference of the <i>same</i> two terms.', parts: [
        { id: 'e7a', level: 'BEG', make: function (r) { var a = r.int(2, 5), b = pickWhere(function () { return r.int(2, 9); }, function (v) { return v !== a; }); return expandBin(br([xm(a), N(b)]) + br([xm(a), N(-b)]), xm(a), N(b), xm(a), N(-b), 'foil'); } },
        { id: 'e7b', level: 'BEG', make: function (r) { var a = r.int(2, 6), b = pickWhere(function () { return r.int(2, 9); }, function (v) { return v !== a; }), y = function (c) { return xm(c, 1, 'y'); }; return expandBin(br([y(a), N(-b)]) + br([y(a), N(b)]), y(a), N(-b), y(a), N(b), 'foil'); } },
        { id: 'e7c', level: 'EMG', make: function (r) { var k = r.int(2, 9), A = M(1, { a: 1 }), B = M(k, { b: 1 }); return expandBin(br([A, B]) + br([A, neg(B)]), A, B, A, neg(B), 'foil'); } },
        { id: 'e7d', level: 'EMG', make: function (r) { var a = r.int(2, 4), b = r.int(2, 9), A = xm(a, 2, 'm'); return expandBin(br([A, N(-b)]) + br([A, N(b)]), A, N(-b), A, N(b), 'foil'); } },
        { id: 'e7e', level: 'EMG', make: function (r) {
          var a = r.int(2, 5), b = pickWhere(function () { return r.int(2, 9); }, function (v) { return v !== a; }), f = foil(xm(a), N(b), xm(a), N(-b));
          return KP.mc(r, 'For example, ' + t(br([xm(a), N(b)]) + br([xm(a), N(-b)]) + '=' + seq([f.F, f.O, f.I, f.L]) + '=' + tx(f.res)) + ' is a binomial, not a trinomial. Using FOIL, which two of the four products disappear, and why must they always cancel?', [
              { html: 'The <b>Outside</b> and <b>Inside</b> products. For ' + t('(A+B)(A-B)') + ' they are ' + t('-AB') + ' and ' + t('+AB') + ': the same two terms multiplied, equal in size, with exactly one minus sign — so they always add to zero.', right: true },
              { html: 'The <b>First</b> and <b>Last</b> products, because they are both squares.', why: 'First is ' + t('A^{2}') + ' and Last is ' + t('-B^{2}') + ' — they are what is left: ' + t('A^{2}-B^{2}') + '.' },
              { html: 'The Outside and Inside products, but only when the numbers happen to match.', why: 'They match every time: both are ' + t('A') + ' times ' + t('B') + ', one with a plus and one with a minus.' },
              { html: 'The <b>Inside</b> and <b>Last</b> products, because the second bracket has a minus sign.', why: 'Inside is ' + t('+AB') + ' and Last is ' + t('-B^{2}') + ' — they aren’t like terms, so they can’t cancel.' }],
            'Write the pair as ' + t('(A+B)(A-B)') + '. O ' + t('=A(-B)=-AB') + ' and I ' + t('=B(A)=+AB') + ', so O + I ' + t('=0') + ', leaving ' + t('A^{2}-B^{2}') + '. Here: ' + t(tx(f.O) + '+' + tx(f.I).replace(/^/, '') + '=0') + '.', ['Write out all four FOIL products for the example and see which pair adds to zero.'], 'why O and I cancel (MC)');
        } },
        { id: 'e7f', level: 'EMG', make: function (r) {
          var Nn = r.pick([20, 30, 40, 50, 60, 70, 80, 90, 100]), k = r.int(1, 4);
          if (r.chance(0.15)) { Nn = 100; k = 2; }
          var v = Nn * Nn - k * k, fields = [nbox('First term ' + t('a')), nbox('Second term ' + t('b')), nbox('Product')];
          var p = KP.fields('Use the pattern — not a calculator — to evaluate ' + t((Nn - k) + '\\times ' + (Nn + k)) + '. Write it as ' + t('(a-b)(a+b)') + ': state the two terms you square, then the answer.', fields,
            [K.number(Nn), K.number(k), K.number(v, function (x) { if (x === Nn * Nn + k * k) return { code: 'last-sign', hint: 'It is ' + t('a^{2}-b^{2}') + ': subtract ' + t('b^{2}') + '.' }; if (x === Nn * Nn - k) return { code: 'value', hint: 'Square the second term too: ' + t('b^{2}=' + k * k) + '.' }; return null; })],
            [String(Nn), String(k), String(v)], t('a=' + Nn + ',\\ b=' + k) + '; ' + t((Nn - k) + '\\times ' + (Nn + k) + '=' + F(v)),
            t((Nn - k) + '\\times ' + (Nn + k) + '=(' + Nn + '-' + k + ')(' + Nn + '+' + k + ')=' + Nn + '^{2}-' + k + '^{2}=' + F(Nn * Nn) + '-' + k * k + '=' + F(v)), ['Both numbers are the same distance from a round number in the middle.', 'Then the product is (middle)² − (distance)².'], 'sum x difference: ' + (Nn - k) + 'x' + (Nn + k));
          p.bad = [[String(Nn), String(k), String(Nn * Nn + k * k)]];
          return p;
        } }] },
      { num: '8', stem: 'Expand and simplify. Expand <b>every</b> bracket before you collect anything.', parts: [
        { id: 'e8a', level: 'PRG', make: function (r) {
          var o = pickWhere(function () { return { a: r.int(2, 6), b: r.int(2, 6), c: r.int(2, 6), d: r.int(2, 6) }; }, function (o) { return (o.a - o.b) !== (o.c - o.d) && o.a * o.b !== o.c * o.d; });
          var P1 = mul(lin(1, o.a), lin(1, -o.b)), P2 = mul(lin(1, o.c), lin(1, -o.d)), T = sub(P1, P2);
          return pp(t(br([xm(1), N(o.a)]) + br([xm(1), N(-o.b)]) + '-' + br([xm(1), N(o.c)]) + br([xm(1), N(-o.d)])), T, [{ is: subFirst(P1, termsOf(P2)), code: 'sub-first', hint: 'Put the second product in brackets before subtracting: ' + t('-(' + tx(P2) + ')') + ' changes the sign of <b>every</b> term.' }, { is: add(P1, P2), code: 'sub-first', hint: 'The second product is <b>subtracted</b>.' }],
            t(pf(P1) + '-' + pf(P2)) + '<br>' + t('=' + seq(termsOf(P1).concat(termsOf(P2).map(neg))) + '=' + tx(T)), HS, 'difference of two products');
        } },
        { id: 'e8b', level: 'PRG', make: function (r) {
          var o = pickWhere(function () { return { k: r.int(2, 4), a: r.int(2, 3), b: r.int(1, 5), c: r.int(2, 6) }; }, function (o) { return o.a * o.c !== o.b; });
          var P = mul(lin(o.a, -o.b), lin(1, o.c)), T = PL.scale(P, o.k);
          return pp(t(o.k + br([xm(o.a), N(-o.b)]) + br([xm(1), N(o.c)])), T, [{ is: PL.scale(P, o.k * o.k), code: 'k-twice', hint: 'Multiply ' + t(o.k) + ' into the answer only <b>once</b>. It multiplies the whole product, not each bracket.' }, { is: add(P, PL.scale(PL.mono(1, { x: 2 }), (o.k - 1) * o.a)), code: 'first-only', hint: 'Multiply <b>every</b> term of ' + t(tx(P)) + ' by ' + t(o.k) + '.' }],
            'Multiply the brackets first: ' + t(br([xm(o.a), N(-o.b)]) + br([xm(1), N(o.c)]) + '=' + tx(P)) + '.<br>Then ' + t(o.k + '(' + tx(P) + ')=' + tx(T)) + '.', ['Expand the two binomials first, then multiply every term by the number in front.', 'The number multiplies the product once — don’t put it into both brackets.'], 'k(ax-b)(x+c)');
        } },
        { id: 'e8c', level: 'PRG', make: function (r) {
          var a = r.int(2, 9), P1 = PL.pow(lin(1, a), 2), P2 = PL.pow(lin(1, -a), 2), T = sub(P1, P2);
          return pp(t(br([xm(1), N(a)]) + '^{2}-' + br([xm(1), N(-a)]) + '^{2}'), T, [{ is: N(0), code: 'all-cancel', hint: 'The squared terms cancel, but the middle terms ' + t(2 * a + 'x') + ' and ' + t('-' + 2 * a + 'x') + ' don’t: subtracting ' + t('-' + 2 * a + 'x') + ' <b>adds</b> ' + t(2 * a + 'x') + '.' }, { is: subFirst(P1, termsOf(P2)), code: 'sub-first', hint: SUBHINT }],
            t(br([xm(1), N(a)]) + '^{2}=' + tx(P1)) + ' and ' + t(br([xm(1), N(-a)]) + '^{2}=' + tx(P2)) + '<br>' + t('(' + tx(P1) + ')-(' + tx(P2) + ')=' + seq(termsOf(P1).concat(termsOf(P2).map(neg))) + '=' + tx(T)), HS, 'difference of two squares of binomials');
        } },
        { id: 'e8d', level: 'PRG', make: function (r) {
          var o = { p: r.int(2, 3), q: r.int(2, 4), rr: r.int(2, 3), s: r.int(2, 4) };
          if (r.chance(0.15)) o = { p: 2, q: 3, rr: 2, s: 3 };
          var a = function (c) { return M(c, { a: 1 }); }, b = function (c) { return M(c, { b: 1 }); };
          var P1 = mul(add(a(o.p), b(1)), add(a(1), b(-o.q))), P2 = mul(add(a(1), b(o.rr)), add(a(o.s), b(-1))), T = add(P1, P2);
          return pp(t(br([a(o.p), b(1)]) + br([a(1), b(-o.q)]) + '+' + br([a(1), b(o.rr)]) + br([a(o.s), b(-1)])), T, binWrongs(a(o.p), b(1), a(1), b(-o.q)).slice(0, 1).map(function (w) { w.is = add(w.is, P2); return w; }),
            t(br([a(o.p), b(1)]) + br([a(1), b(-o.q)]) + '=' + tx(P1)) + '<br>' + t(br([a(1), b(o.rr)]) + br([a(o.s), b(-1)]) + '=' + tx(P2)) + '<br>Add and collect: ' + t(tx(T)) + '.', HS, 'sum of two products, two variables');
        } },
        { id: 'e8e', level: 'PRG', make: function (r) {
          var a = r.int(2, 9), b = pickWhere(function () { return r.int(2, 9); }, function (v) { return v !== a; }), P1 = mul(lin(1, -a), lin(1, -b)), P2 = mul(lin(1, -a), lin(1, b)), T = sub(P1, P2);
          return pp(t(br([xm(1), N(-a)]) + br([xm(1), N(-b)]) + '-' + br([xm(1), N(-a)]) + br([xm(1), N(b)])), T, [{ is: subFirst(P1, termsOf(P2)), code: 'sub-first', hint: 'Put the second product in brackets before subtracting: ' + t('-(' + tx(P2) + ')') + ' changes the sign of <b>every</b> term.' }],
            t(pf(P1) + '-' + pf(P2)) + '<br>' + t('=' + seq(termsOf(P1).concat(termsOf(P2).map(neg))) + '=' + tx(T)), HS, 'difference of products, common factor');
        } },
        { id: 'e8f', level: 'PRG', make: function (r) {
          var o = pickWhere(function () { return { k: r.int(2, 4), a: r.int(2, 4), b: r.int(2, 6), c: r.int(1, 4) }; }, function (o) { return o.a * o.c !== o.b; });
          var P = mul(lin(o.a, -o.b), lin(1, o.c)), T = PL.scale(P, -o.k), ts = termsOf(P);
          return pp(t('-' + o.k + br([xm(o.a, 1, 'y'), N(-o.b)]).replace(/x/g, 'y') + br([xm(1, 1, 'y'), N(o.c)])), PL.parse(tx(T).replace(/x/g, 'y')), [
            { is: PL.parse(tx(PL.scale(P, o.k)).replace(/x/g, 'y')), code: 'sign-all', hint: 'Don’t lose the negative: multiply every term by ' + t('-' + o.k) + '.' },
            { is: PL.parse(tx(add(PL.scale(ts[0], -o.k), ts[1], ts[2] || N(0))).replace(/x/g, 'y')), code: 'neg-first', hint: 'Multiply <b>every</b> term of the expanded product by ' + t('-' + o.k) + ', not just the first.' }],
            ('Multiply the brackets first: ' + t(br([xm(o.a), N(-o.b)]) + br([xm(1), N(o.c)]) + '=' + tx(P)) + '.<br>Then ' + t('-' + o.k + '(' + tx(P) + ')=' + tx(T)) + '.').replace(/x/g, 'y'), ['Expand the two binomials first, then multiply every term by the negative number in front.'], '-k(ay-b)(y+c)');
        } }] },
      { num: '9', section: 'Extra practice D — Composite areas, two ways', stem: function (sh) { return shapeE(sh, false) + 'The shape is a rectangle ' + t(br([xm(sh.wa), N(sh.wb)])) + ' wide and ' + t(br([xm(sh.ha), N(sh.hb)])) + ' tall with a corner piece ' + t(tx(xm(sh.ca))) + ' by ' + t(br([xm(1), N(sh.e)])) + ' removed (dashed).'; },
        shared: function (r) {
          var o = { wa: r.int(2, 4), wb: r.int(2, 7), ha: r.int(2, 3), hb: r.int(2, 6), v: 'x' }; o.ca = o.wa > 2 && r.chance(0.3) ? 2 : 1; o.e = r.int(1, o.hb - 1);
          if (r.chance(0.15)) o = { wa: 3, wb: 5, ha: 2, hb: 4, ca: 1, e: 1, v: 'x' };
          o.W = lin(o.wa, o.wb); o.H = lin(o.ha, o.hb); o.cw = xm(o.ca); o.chh = lin(1, o.e); o.T = sub(mul(o.W, o.H), mul(o.cw, o.chh)); o.bh = sub(o.H, o.chh); o.tw = sub(o.W, o.cw);
          return o;
        },
        parts: [
          { id: 'e9a', level: 'PRG', make: function (r, sh) {
            var big = mul(sh.W, sh.H), cut = mul(sh.cw, sh.chh);
            return pp('<b>Whole minus piece.</b> Write the area as the big rectangle less the corner, then expand and simplify.', sh.T, [{ is: big, code: 'whole-only', hint: 'That is the whole rectangle. Subtract the corner, ' + t(tx(sh.cw) + br([xm(1), N(sh.e)])) + '.' }, { is: add(big, cut), code: 'not-subtracted', hint: 'The corner is <b>removed</b>, so subtract its area.' }, { is: subFirst(big, termsOf(cut)), code: 'sub-first', hint: 'Subtract the <b>whole</b> corner: ' + t('-(' + tx(cut) + ')') + ' changes both signs.' }],
              t('A=' + br([xm(sh.wa), N(sh.wb)]) + br([xm(sh.ha), N(sh.hb)]) + '-' + tx(sh.cw) + br([xm(1), N(sh.e)])) + '<br>' + t('=(' + tx(big) + ')-(' + tx(cut) + ')=' + tx(sh.T)), ['Big rectangle: (width) × (height). Corner: (its width) × (its height).', 'Expand both, then subtract every term of the corner’s area.'], 'composite: whole minus piece');
          } },
          { id: 'e9b', level: 'PRG', make: function (r, sh) {
            var fields = [pbox('Height of the bottom piece', ['x']), pbox('Width of the top piece', ['x']), pbox('Area', ['x'])];
            var bot = mul(sh.W, sh.bh), top = mul(sh.tw, sh.chh);
            var p = KP.fields(shapeE(sh, false, 'h') + '<b>Sum of parts.</b> Cut the shape along the red line into two rectangles. Work out the two missing side lengths, then write the area as a sum of two products, expanded and simplified.', fields,
              [chk(sh.bh, [{ is: add(sh.H, sh.chh), code: 'value', hint: 'Subtract the corner’s height from the full height.' }]), chk(sh.tw, [{ is: add(sh.W, sh.cw), code: 'value', hint: 'Subtract the corner’s width from the full width.' }]), chk(sh.T, [{ is: add(mul(sh.W, sh.bh), mul(sh.W, sh.chh)), code: 'overlap', hint: 'The top piece is only ' + t(tx(sh.tw)) + ' wide — the corner is missing.' }])],
              [tx(sh.bh), tx(sh.tw), tx(sh.T)], 'Bottom piece ' + t(tx(sh.W)) + ' by ' + t(tx(sh.bh)) + '; top piece ' + t(tx(sh.tw)) + ' by ' + t(tx(sh.chh)) + '; area ' + t(tx(sh.T)),
              'Bottom: ' + t(tx(sh.W)) + ' wide, ' + t(pf(sh.H) + '-' + pf(sh.chh) + '=' + tx(sh.bh)) + ' tall. Top: ' + t(pf(sh.W) + '-' + pf(sh.cw) + '=' + tx(sh.tw)) + ' wide, ' + t(tx(sh.chh)) + ' tall.<br>' + t('A=' + pf(sh.W) + pf(sh.bh) + '+' + pf(sh.tw) + pf(sh.chh) + '=(' + tx(bot) + ')+(' + tx(top) + ')=' + tx(sh.T)) + ' — the same as part (a).', ['The bottom piece is the full width. Its height is the full height minus the corner’s height.', 'The top piece’s width is the full width minus the corner’s width.'], 'composite: sum of parts');
            p.bad = [[tx(sh.bh), tx(sh.tw), tx(mul(sh.W, sh.H))]];
            return p;
          } },
          { id: 'e9c', level: 'BEG', make: function (r, sh) {
            var x = 2, W = sh.wa * x + sh.wb, H = sh.ha * x + sh.hb, cw = sh.ca * x, ch = x + sh.e, v = W * H - cw * ch;
            return KP.number('Check a third way by substituting ' + t('x=2') + ': find the real dimensions of the shape and work out its area arithmetically.', v,
              function (y) { return y === W * H ? { code: 'whole-only', hint: 'That is the whole rectangle — subtract the ' + t(cw + '\\times ' + ch) + ' corner.' } : null; },
              'At ' + t('x=2') + ': the rectangle is ' + t(W + '\\times ' + H) + ' and the corner is ' + t(cw + '\\times ' + ch) + ', so the area is ' + t(W + '\\times ' + H + '-' + cw + '\\times ' + ch + '=' + v) + '.<br>Check: ' + t(at6(tx(sh.T)).replace(/6/g, '6').replace(/\(6\)/g, '(2)') + '=' + v) + ' ✓', ['Replace ' + t('x') + ' by ' + t('2') + ' in every side length first.', 'Area = big rectangle − corner.'], 'composite at x=2');
          } },
          { id: 'e9d', level: 'EMG', make: function (r) {
            return KP.mc(r, 'If the cut-out were in the <b>middle</b> of the rectangle instead of at a corner, which method would you choose, and why?', [
              { html: '<b>Whole minus piece:</b> it still needs only two products (big rectangle minus the hole), while cutting a frame around a hole into rectangles takes four pieces.', right: true },
              { html: '<b>Sum of parts:</b> one cut always gives two rectangles.', why: 'A hole in the middle leaves a frame: one cut can’t split it into rectangles — it takes four pieces.' },
              { html: '<b>Sum of parts:</b> subtracting is always harder than adding.', why: 'Count the products: whole minus piece needs 2; a frame around a hole needs 4.' },
              { html: 'Neither method works when the hole is in the middle.', why: 'Whole minus piece works wherever the hole is: big rectangle − hole.' }],
              'Whole minus piece: ' + t('A=(\\text{big rectangle})-(\\text{hole})') + ' — two products no matter where the hole is. Sum of parts would need four rectangles around the hole.', ['Sketch a rectangle with a hole in the middle. How many rectangles does it take to cover what is left?'], 'choose a method (MC)');
          } }] },
      { num: '10', stem: function (sh) { return shapeE(sh, true) + 'A rectangular lot is ' + t(br([xm(sh.wa, 1, 'a'), N(sh.wb)])) + ' m by ' + t(br([xm(sh.ha, 1, 'a'), N(sh.hb)])) + ' m. A shed ' + t(tx(xm(sh.ca, 1, 'a'))) + ' m by ' + t(br([xm(1, 1, 'a'), N(sh.e)])) + ' m sits in one corner. The lawn is everything outside the shed.'; },
        shared: function (r) {
          var o = { wa: r.int(3, 5), wb: r.int(1, 6), ha: r.int(2, 4), hb: r.int(3, 9), v: 'a' }; o.ca = r.int(2, o.wa - 1); o.e = r.int(1, o.hb - 1);
          if (r.chance(0.15)) o = { wa: 4, wb: 3, ha: 3, hb: 7, ca: 2, e: 2, v: 'a' };
          var a = function (c, k) { return lin(c, k, 'a'); };
          o.W = a(o.wa, o.wb); o.H = a(o.ha, o.hb); o.cw = xm(o.ca, 1, 'a'); o.chh = a(1, o.e); o.T = sub(mul(o.W, o.H), mul(o.cw, o.chh)); o.bh = sub(o.H, o.chh); o.tw = sub(o.W, o.cw);
          return o;
        },
        parts: [
          { id: 'e10a', level: 'PRG', make: function (r, sh) {
            var big = mul(sh.W, sh.H), cut = mul(sh.cw, sh.chh);
            return pp('Find the lawn area as the whole lot minus the shed.', sh.T, [{ is: big, code: 'whole-only', hint: 'That is the whole lot. Subtract the shed.' }, { is: subFirst(big, termsOf(cut)), code: 'sub-first', hint: 'Subtract the <b>whole</b> shed area: ' + t('-(' + tx(cut) + ')') + ' changes both signs.' }],
              t('A=' + pf(sh.W) + pf(sh.H) + '-' + tx(sh.cw) + pf(sh.chh) + '=(' + tx(big) + ')-(' + tx(cut) + ')=' + tx(sh.T)) + ' m²', ['Lot: (length) × (width). Shed: (its length) × (its width).', 'Expand both, then subtract every term of the shed’s area.'], 'lawn: whole minus shed', { before: t('A='), after: t('\\text{ m}^{2}') });
          } },
          { id: 'e10b', level: 'PRG', make: function (r, sh) {
            var bot = mul(sh.W, sh.bh), top = mul(sh.tw, sh.chh), fields = [pbox('Bottom piece', ['a']), pbox('Top piece', ['a']), pbox('Lawn area', ['a'], { after: t('\\text{ m}^{2}') })];
            var p = KP.fields(shapeE(sh, true, 'h') + 'Find the lawn area again by cutting the lawn with one <b>horizontal</b> line (red) into two rectangles. Give each piece’s area, expanded, then the lawn area.', fields,
              [chk(bot, binWrongs(PL.sorted(sh.W).map(function (q) { return M(q.c, q.v); })[0], N(sh.wb), xm(sh.ha - 1, 1, 'a'), N(sh.hb - sh.e))), chk(top, []), chk(sh.T, [])], [tx(bot), tx(top), tx(sh.T)],
              'Bottom ' + t(tx(bot)) + ', top ' + t(tx(top)) + ', lawn ' + t(tx(sh.T)) + ' m²',
              'Bottom: ' + t(tx(sh.W)) + ' by ' + t(pf(sh.H) + '-' + pf(sh.chh) + '=' + tx(sh.bh)) + ': ' + t(pf(sh.W) + pf(sh.bh) + '=' + tx(bot)) + '.<br>Top: ' + t(pf(sh.W) + '-' + tx(sh.cw) + '=' + tx(sh.tw)) + ' by ' + t(tx(sh.chh)) + ': ' + t(pf(sh.tw) + pf(sh.chh) + '=' + tx(top)) + '.<br>Lawn: ' + t(tx(sh.T)) + ' m² — the same as part (a).', ['The bottom piece is the full length of the lot; its width is the lot’s width minus the shed’s.', 'The top piece sits beside the shed: the lot’s length minus the shed’s, by the shed’s other side.'], 'lawn: horizontal cut');
            p.bad = [[tx(bot), tx(top), tx(mul(sh.W, sh.H))]];
            return p;
          } },
          { id: 'e10c', level: 'PRG', make: function (r, sh) {
            var left = mul(sh.cw, sh.bh), right = mul(sh.tw, sh.H), fields = [pbox('Left piece', ['a']), pbox('Right piece', ['a']), pbox('Lawn area', ['a'], { after: t('\\text{ m}^{2}') })];
            var p = KP.fields(shapeE(sh, true, 'v') + 'Find it a third time by cutting the lawn with one <b>vertical</b> line (red) into two rectangles. Give each piece’s area, expanded, then the lawn area.', fields,
              [chk(left, monoWrongs(sh.cw, termsOf(sh.bh))), chk(right, []), chk(sh.T, [])], [tx(left), tx(right), tx(sh.T)],
              'Left ' + t(tx(left)) + ', right ' + t(tx(right)) + ', lawn ' + t(tx(sh.T)) + ' m²',
              'Left (under the shed): ' + t(tx(sh.cw)) + ' by ' + t(tx(sh.bh)) + ': ' + t(tx(sh.cw) + pf(sh.bh) + '=' + tx(left)) + '.<br>Right: ' + t(tx(sh.tw)) + ' by ' + t(tx(sh.H)) + ': ' + t(pf(sh.tw) + pf(sh.H) + '=' + tx(right)) + '.<br>Lawn: ' + t(tx(sh.T)) + ' m² ✓', ['The left piece is directly under the shed: same width as the shed.', 'The right piece runs the full width of the lot.'], 'lawn: vertical cut');
            p.bad = [[tx(left), tx(right), tx(add(left, mul(sh.W, sh.H)))]];
            return p;
          } },
          { id: 'e10d', level: 'EMG', make: function (r, sh) {
            var L = tx(sh.cw) + '\\text{ by }' + tx(sh.bh);
            return KP.mc(r, 'All three answers agree. One of the pieces in (b) or (c) has a monomial side, so its area takes a single distribution instead of a binomial-times-binomial expansion. Which piece, and what does that tell you about where to cut?', [
              { html: 'The left piece in (c), ' + t(L) + ': cut along an edge that leaves a piece with a monomial side when you can — it saves a full four-product expansion.', right: true },
              { html: 'The top piece in (b): it is beside the shed, so it is always the smallest.', why: 'Its sides are ' + t(tx(sh.tw)) + ' and ' + t(tx(sh.chh)) + ' — both binomials, so it needs four products.' },
              { html: 'The bottom piece in (b), because it is the full length of the lot.', why: 'Its sides are ' + t(tx(sh.W)) + ' and ' + t(tx(sh.bh)) + ' — both binomials.' },
              { html: 'None of them: every piece needs a binomial-times-binomial expansion.', why: 'Look at the piece directly under the shed in (c): one side is ' + t(tx(sh.cw)) + ', a monomial.' }],
              'The left piece in (c) is ' + t(L) + '; one side is the monomial ' + t(tx(sh.cw)) + ', so ' + t(tx(sh.cw) + pf(sh.bh)) + ' is one distribution. Cutting along the shed’s edge produced that monomial side, so choose cuts like that when you can.', ['Look at the side lengths of each piece. Which piece has a side with just one term?'], 'choosing the cut (MC)');
          } }] },
      { num: '11', section: 'Extra practice E — Working backwards', stem: 'One factor is missing. Determine it. (Check by expanding.)', parts: [
        { id: 'e11a', level: 'PRG', make: function (r) { var a = r.int(2, 9), b = pickWhere(function () { return r.int(2, 9); }, function (v) { return v !== a; }); return missF([xm(1), N(b)], [xm(1), N(a)], function (T) { return t(br([xm(1), N(a)]) + '(\\underline{\\qquad})=') + T; }); } },
        { id: 'e11b', level: 'ADV', make: function (r) { var o = pickWhere(function () { return { p: r.int(2, 3), s: r.int(1, 3), q: r.int(2, 4), rr: r.int(1, 5) }; }, function (o) { return o.p * o.rr !== o.s * o.q; }); return missF([xm(o.q), N(o.rr)], [xm(o.p), N(-o.s)], function (T) { return t(br([xm(o.p), N(-o.s)]) + '(\\underline{\\qquad})=') + T; }); } },
        { id: 'e11c', level: 'PRG', make: function (r) { var a = r.int(2, 9); return missF([xm(1), N(-a)], [xm(1), N(a)], function (T) { return t('(\\underline{\\qquad})' + br([xm(1), N(a)]) + '=') + T; }); } },
        { id: 'e11d', level: 'ADV', make: function (r) { var o = pickWhere(function () { return { p: r.int(2, 5), q: r.int(2, 6), rr: r.int(2, 4) }; }, function (o) { return o.p * o.rr !== o.q; }), a = function (c) { return M(c, { a: 1 }); }, b = function (c) { return M(c, { b: 1 }); }; return missF([a(1), b(-o.rr)], [a(o.p), b(o.q)], function (T) { return t(br([a(o.p), b(o.q)]) + '(\\underline{\\qquad})=') + T; }); } },
        { id: 'e11e', level: 'ADV', make: function (r) { var p = r.int(2, 5), q = pickWhere(function () { return r.int(1, 7); }, function (v) { return v !== p; }), m = function (c) { return xm(c, 1, 'm'); }; return missF([m(p), N(-q)], [m(p), N(-q)], function (T) { return t('(\\underline{\\qquad})^{2}=') + T; }, add(m(-p), N(q)), true); } },
        { id: 'e11f', level: 'ADV', make: function (r) { var o = pickWhere(function () { return { p: r.int(2, 6), q: r.int(1, 5), rr: r.int(2, 9) }; }, function (o) { return o.p * o.rr !== o.q; }); return missF([xm(1), N(-o.rr)], [xm(o.p), N(o.q)], function (T) { return t(br([xm(o.p), N(o.q)]) + '(\\underline{\\qquad})=') + T; }); } }] },
      { num: '12', stem: 'Determine the value of each unknown. Every unknown stands for a whole number unless stated otherwise.', parts: [
        { id: 'e12a', level: 'PRG', make: function (r) {
          var o = pickWhere(function () { return { a: r.int(2, 4), d: r.int(2, 6), k: r.int(2, 9) }; }, function (o) { return o.k !== o.a * o.d; });
          var T = mul(lin(o.a, o.k), lin(1, -o.d));
          return KP.number(t(br([xm(o.a), M(1, { k: 1 })]) + br([xm(1), N(-o.d)]) + '=' + tx(T)) + '. Find ' + t('k') + '.', o.k,
            function (v) { if (v === o.k * o.d) return { code: 'asked-other', hint: 'The constant term is ' + t('k(-' + o.d + ')=-' + o.d + 'k') + '. Solve ' + t('-' + o.d + 'k=-' + o.k * o.d) + '.' }; if (v === -o.k) return { code: 'sign', hint: 'Check the sign: ' + t('k(-' + o.d + ')') + ' must equal ' + t('-' + o.k * o.d) + '.' }; return null; },
            'Last terms: ' + t('k(-' + o.d + ')=-' + o.k * o.d) + ', so ' + t('k=' + o.k) + '.<br>Check: ' + t(br([xm(o.a), N(o.k)]) + br([xm(1), N(-o.d)]) + '=' + seq([xm(o.a, 2), xm(-o.a * o.d), xm(o.k), N(-o.k * o.d)]) + '=' + tx(T)) + ' ✓', ['Which two terms multiply to give the constant term?'], 'find k from constant');
        } },
        { id: 'e12b', level: 'PRG', make: function (r) {
          var o = pickWhere(function () { return { k: r.int(2, 5), b: r.int(1, 5), c: r.int(2, 3), d: r.int(2, 7) }; }, function (o) { return o.k * o.d !== o.b * o.c; });
          var T = mul(lin(o.k, o.b), lin(o.c, -o.d));
          return KP.number(t(br([M(1, { k: 1, x: 1 }), N(o.b)]) + br([xm(o.c), N(-o.d)]) + '=' + tx(T)) + '. Find ' + t('k') + '.', o.k,
            function (v) { if (v === o.k * o.c) return { code: 'asked-other', hint: t(o.k * o.c) + ' is the leading coefficient. First terms: ' + t('kx\\cdot ' + o.c + 'x=' + o.c + 'kx^{2}') + ', so ' + t(o.c + 'k=' + o.k * o.c) + '.' }; return null; },
            'First terms: ' + t('kx\\cdot ' + o.c + 'x=' + o.c + 'kx^{2}') + ', so ' + t(o.c + 'k=' + o.k * o.c) + ' and ' + t('k=' + o.k) + '.<br>Check: ' + t(br([xm(o.k), N(o.b)]) + br([xm(o.c), N(-o.d)]) + '=' + tx(T)) + ' ✓', ['Which two terms multiply to give the ' + t('x^{2}') + '-term?'], 'find k from leading term');
        } },
        { id: 'e12c', level: 'ADV', make: function (r) {
          var k = r.int(2, 9), fields = [nbox(t('k=')), nbox('or ' + t('k='))];
          return { prompt: t('(x+k)(x-k)=x^{2}-' + k * k) + '. Find <b>both</b> possible values of ' + t('k') + '.', input: { type: 'fields', fields: fields }, key: [String(k), String(-k)], answer: t('k=' + k) + ' or ' + t('k=-' + k),
            check: function (resp) {
              resp = resp || []; var v = [0, 1].map(function (i) { var p = HW.parse.number(resp[i] || ''); return p.ok ? p.value : null; });
              if (v[0] == null || v[1] == null) return form('incomplete', 'Fill in both boxes with a number.');
              var good = function (x) { return Math.abs(x) === k; };
              if (good(v[0]) && good(v[1]) && v[0] !== v[1]) return ok();
              if (good(v[0]) && good(v[1])) return wrong('one-root', 'One value is right. There is another: what else squares to ' + t(k * k) + '?');
              if (v.some(function (x) { return x === k * k || x === -k * k; })) return wrong('asked-other', t('(x+k)(x-k)=x^{2}-k^{2}') + ', so ' + t('k^{2}=' + k * k) + '. Find ' + t('k') + ', not ' + t('k^{2}') + '.');
              return wrong('value', t('(x+k)(x-k)=x^{2}-k^{2}') + '. Which numbers squared give ' + t(k * k) + '?');
            },
            good: [[String(-k), String(k)]], bad: [[String(k), String(k)], [String(k * k), String(-k * k)]],
            solution: t('(x+k)(x-k)=x^{2}-kx+kx-k^{2}=x^{2}-k^{2}') + ', so ' + t('k^{2}=' + k * k) + ' and ' + t('k=' + k) + ' or ' + t('k=-' + k) + ' (the same two factors, in the other order).', hints: ['Expand ' + t('(x+k)(x-k)') + ' first: the middle terms cancel.', 'Two different numbers have the same square.'], text: 'k^2 = ' + k * k };
        } },
        { id: 'e12d', level: 'PRG', make: function (r) {
          var m = r.int(2, 3), k = pickWhere(function () { return r.int(2, 9); }, function (v) { return v !== m; }), a = M(m, { a: 1 }), kb = M(-1, { b: 1, k: 1 });
          return KP.number(t('(' + m + 'a-kb)(' + m + 'a+kb)=' + m * m + 'a^{2}-' + k * k + 'b^{2}') + ', with ' + t('k>0') + '. Find ' + t('k') + '.', k,
            function (v) { return v === k * k ? { code: 'asked-other', hint: 'That is ' + t('k^{2}') + '. Take the square root.' } : v === -k ? { code: 'sign', hint: 'The question says ' + t('k>0') + '.' } : null; },
            t('(' + m + 'a-kb)(' + m + 'a+kb)=' + m * m + 'a^{2}+' + m + 'akb-' + m + 'akb-k^{2}b^{2}=' + m * m + 'a^{2}-k^{2}b^{2}') + ', so ' + t('k^{2}=' + k * k) + ' and, since ' + t('k>0') + ', ' + t('k=' + k) + '.', ['The middle terms cancel. Compare the ' + t('b^{2}') + '-terms.'], 'difference of squares: find k');
        } },
        { id: 'e12e', level: 'ADV', make: function (r) {
          var a = r.int(2, 7), c = pickWhere(function () { return r.int(2, 8); }, function (v) { return v !== a; });
          if (r.chance(0.15)) { a = 4; c = 5; }
          var p = KP.fields('In ' + t('(x+' + a + ')(x+c)') + ' the coefficient of ' + t('x') + ' is ' + t(a + c) + '. Find ' + t('c') + ' and the constant term.', [nbox(t('c')), nbox('Constant term')],
            [K.number(c, function (v) { return v === a + c ? { code: 'asked-other', hint: t(a + c) + ' is the coefficient of ' + t('x') + ', which is ' + t('c+' + a) + '.' } : null; }), K.number(a * c, function (v) { return v === a + c ? { code: 'asked-other', hint: 'The constant term is the product of the last terms, ' + t(a + '\\times c') + '.' } : null; })],
            [String(c), String(a * c)], t('c=' + c) + ', constant term ' + t(a * c),
            t('(x+' + a + ')(x+c)=x^{2}+cx+' + a + 'x+' + a + 'c=x^{2}+(c+' + a + ')x+' + a + 'c') + '.<br>' + t('c+' + a + '=' + (a + c)) + ', so ' + t('c=' + c) + '; the constant term is ' + t(a + '(' + c + ')=' + a * c) + '.', ['Expand with ' + t('c') + ' as a letter, then compare the ' + t('x') + '-terms.'], 'find c and constant');
          p.bad = [[String(c), String(a + c)]];
          return p;
        } },
        { id: 'e12f', level: 'MAS', make: function (r) {
          var o = pickWhere(function () { var ab = r.pick([[2, 3], [2, 3], [3, 2], [2, 5], [3, 4]]); return { a: ab[0], b: ab[1], p: r.int(1, 9), q: r.int(1, 9) }; }, function (o) {
            var n = o.p * o.q, mid = o.a * o.q + o.b * o.p, cnt = 0;
            for (var d = 1; d <= n; d++) if (n % d === 0 && o.a * (n / d) + o.b * d === mid) cnt++;
            return cnt === 1 && n > 1 && n <= 40 && o.p !== o.q;
          });
          if (r.chance(0.15)) o = { a: 2, b: 3, p: 3, q: 5 };
          var n = o.p * o.q, mid = o.a * o.q + o.b * o.p, pairs = [];
          for (var d = 1; d <= n; d++) if (n % d === 0) pairs.push([d, n / d]);
          var diag = function (pv, qv) { return pv * qv === n ? 'Those give the right constant (' + t(pv + '\\times ' + qv + '=' + n) + '), but the ' + t('x') + '-term would be ' + t(o.a + '(' + qv + ')+' + o.b + '(' + pv + ')=' + (o.a * qv + o.b * pv)) + ', not ' + t(mid) + '. Try another factor pair of ' + t(n) + '.' : null; };
          return { prompt: t(br([xm(o.a), M(1, { p: 1 })]) + br([xm(o.b), M(1, { q: 1 })]) + '=' + tx(mul(lin(o.a, o.p), lin(o.b, o.q)))) + ', where ' + t('p') + ' and ' + t('q') + ' are natural numbers. Find ' + t('p') + ' and ' + t('q') + '.',
            input: { type: 'fields', fields: [nbox(t('p')), nbox(t('q'))] }, key: [String(o.p), String(o.q)], answer: t('p=' + o.p + ',\\ q=' + o.q), text: 'find p and q',
            check: function (resp) {
              resp = resp || []; var a = HW.parse.number(resp[0] || ''), b = HW.parse.number(resp[1] || '');
              if (!a.ok || !b.ok) return form('incomplete', 'Fill in both boxes with a number.');
              if (a.value === o.p && b.value === o.q) return ok();
              var h = diag(a.value, b.value); if (h) return wrong('check-product', h);
              return wrong('value', 'The last terms multiply to the constant term: ' + t('pq=' + n) + '. Which factor pair of ' + t(n) + ' also gives the right ' + t('x') + '-term?');
            },
            bad: [[String(o.q), String(o.p)]],
            solution: t(br([xm(o.a), M(1, { p: 1 })]) + br([xm(o.b), M(1, { q: 1 })]) + '=' + (o.a * o.b) + 'x^{2}+(' + o.a + 'q+' + o.b + 'p)x+pq') + '.<br>' + t('pq=' + n) + ': try each pair ' + pairs.map(function (pq) { return t('(p,q)=(' + pq[0] + ',' + pq[1] + ')\\to ' + (o.a * pq[1] + o.b * pq[0])); }).join(', ') + '.<br>Only ' + t('p=' + o.p) + ', ' + t('q=' + o.q) + ' gives ' + t(mid) + '.',
            hints: ['Expand with ' + t('p') + ' and ' + t('q') + ' as letters. The constant term tells you ' + t('pq') + '.', 'List the factor pairs of the constant and test each one in the ' + t('x') + '-term.'] };
        } }] },
      { num: '13', section: 'Extra practice F — Find the error', stem: function (sh) { return 'Asked to expand ' + t(sh.prod) + ', a student wrote ' + t(sh.prod + '=' + tx(sh.studentP)) + '.'; },
        shared: function (r) {
          var o = pickWhere(function () { return { a: r.int(2, 3), b: r.int(2, 7), c: r.int(2, 4), d: r.int(2, 7) }; }, function (o) { return o.a * o.d !== o.b * o.c && o.c !== o.d; });
          if (r.chance(0.15)) o = { a: 2, b: 5, c: 3, d: 4 };
          o.A = xm(o.a); o.B = N(o.b); o.C = xm(o.c); o.D = N(-o.d); o.f = foil(o.A, o.B, o.C, o.D); o.studentP = add(o.f.F, o.f.L); o.prod = br([o.A, o.B]) + br([o.C, o.D]);
          return o;
        },
        parts: [
          { id: 'e13a', level: 'BEG', make: function (r, sh) {
            var v1 = (sh.a + sh.b) * (sh.c - sh.d), v2 = sh.a * sh.c - sh.b * sh.d;
            var p = KP.fields('Substitute ' + t('x=1') + ' into the original product and into the student’s answer to show the answer is wrong.', [nbox('Original product at ' + t('x=1')), nbox('Student’s answer at ' + t('x=1'))],
              [K.number(v1), K.number(v2)], [String(v1), String(v2)], t(v1) + ' and ' + t(v2) + ' — not equal, so the answer is wrong.',
              'Original: ' + t('(' + sh.a + '+' + sh.b + ')(' + sh.c + '-' + sh.d + ')=' + (sh.a + sh.b) + '(' + (sh.c - sh.d) + ')=' + v1) + '.<br>Student: ' + t(sh.a * sh.c + '(1)^{2}-' + sh.b * sh.d + '=' + v2) + '.<br>' + t(v1 + '\\neq ' + v2) + ', so the expansion is wrong.', ['Replace every ' + t('x') + ' with ' + t('1') + '. Work out each bracket first.'], 'x=1 check');
            p.bad = [[String(v2), String(v1)]];
            return p;
          } },
          { id: 'e13b', level: 'BEG', make: function (r, sh) {
            var opts = [{ value: 'F', html: '<b>First</b>' }, { value: 'O', html: '<b>Outside</b>' }, { value: 'I', html: '<b>Inside</b>' }, { value: 'L', html: '<b>Last</b>' }];
            return { prompt: 'Which <b>two</b> FOIL products did the student never write down? Tap both.', input: { type: 'select', options: opts }, key: ['O', 'I'], answer: '<b>Outside</b> ' + t(dot(sh.A, sh.D) + '=' + tx(sh.f.O)) + ' and <b>Inside</b> ' + t(dot(sh.B, sh.C) + '=' + tx(sh.f.I)),
              check: K.selectSet(['O', 'I'], function (extra, missing) {
                if (extra.indexOf('F') >= 0) return { code: 'value', hint: 'The student did write the First product: ' + t(dot(sh.A, sh.C) + '=' + tx(sh.f.F)) + '.' };
                if (extra.indexOf('L') >= 0) return { code: 'value', hint: 'The student did write the Last product: ' + t(dot(sh.B, sh.D) + '=' + tx(sh.f.L)) + '.' };
                return { code: 'value', hint: 'Two products are missing — the two that make the middle term.' };
              }),
              bad: [['F', 'L'], ['O']], solution: 'The student found <b>First</b> ' + t(dot(sh.A, sh.C) + '=' + tx(sh.f.F)) + ' and <b>Last</b> ' + t(dot(sh.B, sh.D) + '=' + tx(sh.f.L)) + ', but never wrote <b>Outside</b> ' + t(dot(sh.A, sh.D) + '=' + tx(sh.f.O)) + ' or <b>Inside</b> ' + t(dot(sh.B, sh.C) + '=' + tx(sh.f.I)) + ' — the two that make the middle term.',
              hints: ['Match each term in the student’s answer to a FOIL product. Which products are left over?'], text: 'which FOIL products missing' };
          } },
          { id: 'e13c', level: 'PRG', make: function (r, sh) {
            var p = expandBin(sh.prod, sh.A, sh.B, sh.C, sh.D, 'foil', { pre: 'Expand correctly: ' });
            p.solution += grid([sh.A, sh.B], [sh.C, sh.D], { plus: true, cells: [[tx(sh.f.F), '\\boxed{' + tx(sh.f.I) + '}'], ['\\boxed{' + tx(sh.f.O) + '}', tx(sh.f.L)]] }) + 'Boxed: the two cells the student left empty.';
            return p;
          } }] },
      { num: '14', stem: function (sh) { return 'Asked to expand ' + t(sh.prod) + ', a second student wrote ' + t(sh.prod + '=x^{2}-' + sh.b + 'x-' + sh.a + 'x-' + sh.a * sh.b + '=x^{2}-' + (sh.a + sh.b) + 'x-' + sh.a * sh.b) + '.'; },
        shared: function (r) { var a = r.int(2, 9), b = pickWhere(function () { return r.int(2, 9); }, function (v) { return v !== a; }); if (r.chance(0.15)) { a = 5; b = 3; } return { a: a, b: b, prod: br([xm(1), N(-a)]) + br([xm(1), N(-b)]), T: mul(lin(1, -a), lin(1, -b)) }; },
        parts: [
          { id: 'e14a', level: 'EMG', make: function (r, sh) {
            var ab = sh.a * sh.b;
            return KP.mc(r, 'The middle term ' + t('-' + (sh.a + sh.b) + 'x') + ' is correct. Which single product did the student get wrong, and what should it be?', [
              { html: 'The <b>Last</b> product: ' + t('(-' + sh.a + ')(-' + sh.b + ')=+' + ab) + ', not ' + t('-' + ab) + '.', right: true },
              { html: 'The <b>First</b> product: ' + t('x\\cdot x') + ' should be ' + t('2x') + '.', why: t('x\\cdot x=x^{2}') + ' — that one is right.' },
              { html: 'The <b>Outside</b> product: ' + t('x(-' + sh.b + ')') + ' should be ' + t('+' + sh.b + 'x') + '.', why: 'A positive times a negative is negative: ' + t('-' + sh.b + 'x') + ' is right (and the middle term is correct).' },
              { html: 'The <b>Inside</b> product: ' + t('(-' + sh.a + ')x') + ' should be ' + t('+' + sh.a + 'x') + '.', why: t('(-' + sh.a + ')x=-' + sh.a + 'x') + ' is right (and the middle term is correct).' }],
              'The Last product is ' + t('(-' + sh.a + ')(-' + sh.b + ')=+' + ab) + ': a negative times a negative is positive. The student wrote ' + t('-' + ab) + '.', ['Check each FOIL product, paying attention to the signs.'], 'which product is wrong (MC)');
          } },
          { id: 'e14b', level: 'BEG', make: function (r, sh) {
            var ab = sh.a * sh.b;
            var p = KP.fields('Substitute ' + t('x=0') + ' into the original product and into the student’s answer.', [nbox('Original product at ' + t('x=0')), nbox('Student’s answer at ' + t('x=0'))],
              [K.number(ab, function (v) { return v === -ab ? { code: 'sign', hint: t('(0-' + sh.a + ')(0-' + sh.b + ')=(-' + sh.a + ')(-' + sh.b + ')') + ' — a negative times a negative.' } : null; }), K.number(-ab)], [String(ab), String(-ab)], t(ab) + ' and ' + t(-ab),
              'Original: ' + t('(0-' + sh.a + ')(0-' + sh.b + ')=' + ab) + '. Student: ' + t('0-0-' + ab + '=-' + ab) + '. They don’t match.', ['Replace every ' + t('x') + ' with ' + t('0') + '.'], 'x=0 check');
            p.bad = [[String(-ab), String(-ab)]];
            return p;
          } },
          { id: 'e14c', level: 'BEG', make: function (r, sh) {
            var p = expandBin(sh.prod, xm(1), N(-sh.a), xm(1), N(-sh.b), 'foil', { pre: 'Expand correctly: ', wrong: [{ is: add(xm(1, 2), xm(-(sh.a + sh.b)), N(-sh.a * sh.b)), code: 'kept-error', hint: 'That is the student’s answer. Check the sign of ' + t('(-' + sh.a + ')(-' + sh.b + ')') + '.' }] });
            p.solution += '<br>Rule: the product of the two last terms takes the product of their signs, so two negative constants give a <b>positive</b> constant term.';
            return p;
          } },
          { id: 'e14d', level: 'EMG', make: function (r) {
            return KP.mc(r, 'Why is ' + t('x=0') + ' an especially good value for catching this particular slip?', [
              { html: 'At ' + t('x=0') + ' every term containing ' + t('x') + ' vanishes, so the check tests the constant term <b>alone</b> — exactly where the slip is.', right: true },
              { html: 'Because ' + t('0') + ' is the smallest number, so the arithmetic is the most accurate.', why: 'Accuracy isn’t the point. What happens to every term with an ' + t('x') + ' when ' + t('x=0') + '?' },
              { html: 'Because substituting ' + t('x=0') + ' always shows whether an expansion is right.', why: 'Not always: ' + t('x=0') + ' only checks the constant term. A wrong middle term would slip through.' },
              { html: 'Because the middle term becomes larger than the constant term.', why: 'At ' + t('x=0') + ' the middle term becomes ' + t('0') + '.' }],
              'At ' + t('x=0') + ', ' + t('x^{2}') + ' and the ' + t('x') + '-term are both ' + t('0') + ', so only the constant term is tested — and the constant term is where this student went wrong. (It would not catch a wrong middle term.)', ['What is left of the expansion when ' + t('x=0') + '?'], 'why x=0 (MC)');
          } }] },
      { num: '15', section: 'Extra practice G — Stretch', stem: 'A product of three binomials: multiply two of them first, then distribute the third over the trinomial you get, one term at a time.', parts: [
        { id: 'e15a', level: 'PRG', make: function (r) { var v = r.sample([1, 2, 3, 4, 5, 6], 3).sort(); return threeBin([lin(1, v[0]), lin(1, v[1]), lin(1, v[2])]); } },
        { id: 'e15b', level: 'PRG', make: function (r) { var p = r.int(2, 3), a = r.int(1, 4), b = r.int(1, 5), c = pickWhere(function () { return r.int(1, 5); }, function (v) { return v !== b; }); return threeBin([lin(p, -a), lin(1, b), lin(1, -c)]); } },
        { id: 'e15c', level: 'PRG', make: function (r) { var a = r.int(2, 5); var p = threeBin([lin(1, -a), lin(1, a), add(xm(1, 2), N(a * a))], true); return p; } },
        { id: 'e15cw', sub: 'c pairing', level: 'EMG', make: function (r) {
          var a = r.int(2, 5), s = a * a;
          return KP.mc(r, 'For ' + t('(x-' + a + ')(x+' + a + ')(x^{2}+' + s + ')') + ', which pairing makes the work shortest, and why?', [
            { html: 'Multiply ' + t('(x-' + a + ')(x+' + a + ')') + ' first: a sum times a difference collapses to ' + t('x^{2}-' + s) + ' with no middle term, and then ' + t('(x^{2}-' + s + ')(x^{2}+' + s + ')') + ' collapses again.', right: true },
            { html: 'Multiply ' + t('(x+' + a + ')(x^{2}+' + s + ')') + ' first, because it has the largest terms.', why: 'That gives four terms, ' + t(tx(mul(lin(1, a), add(xm(1, 2), N(s))))) + ', to distribute — longer.' },
            { html: 'Every pairing is equally short — multiplication can be done in any order.', why: 'Every order gives the same answer, but not the same amount of work. Which pair loses its middle term?' },
            { html: 'Multiply ' + t('(x-' + a + ')(x^{2}+' + s + ')') + ' first, because it removes the ' + t('x^{2}') + '-term.', why: 'It doesn’t: it gives ' + t(tx(mul(lin(1, -a), add(xm(1, 2), N(s))))) + ', four terms.' }],
            t('(x-' + a + ')(x+' + a + ')=x^{2}-' + s) + ' (the middle terms cancel), then ' + t('(x^{2}-' + s + ')(x^{2}+' + s + ')=x^{4}-' + s * s) + ' (they cancel again). Any other pairing leaves four terms to distribute.', ['Look for a sum times a difference of the same two terms.'], 'choose the pairing (MC)');
        } },
        { id: 'e15d', sub: 'd', level: 'EMG', make: function (r) {
          var n = r.pick([4, 4, 5]), leads = [], cs = r.sample([1, 2, 3, 4, 5, 6, 7], n), facs = [];
          for (var i = 0; i < n; i++) { var l = r.chance(0.7) ? 1 : r.pick([2, 3]); leads.push(l); facs.push(lin(l, (r.chance(0.7) ? 1 : -1) * cs[i])); }
          if (r.chance(0.2)) { n = 4; leads = [1, 1, 1, 1]; facs = [lin(1, 1), lin(1, 2), lin(1, 3), lin(1, 4)]; }
          var L = leads.reduce(function (m, x) { return m * x; }, 1), S = leads.reduce(function (m, x) { return m + x; }, 0), prod = facs.map(pf).join('');
          var p = KP.fields('Without expanding, state the degree and the leading coefficient of ' + t(prod) + '.', [nbox('Degree'), nbox('Leading coefficient')],
            [K.number(n, function (v) { return v === 2 ? { code: 'value', hint: 'Each factor has degree ' + t('1') + ', but the degrees <b>add</b> when you multiply: ' + t('x\\cdot x\\cdots') + '.' } : null; }), K.number(L, function (v) { return v === S && S !== L ? { code: 'add-coef', hint: 'The leading coefficients <b>multiply</b>.' } : null; })],
            [String(n), String(L)], 'Degree ' + t(n) + ', leading coefficient ' + t(L),
            'The highest power comes only from multiplying the ' + t('x') + '-term of every bracket: ' + t(facs.map(function (f) { return tx(xm(PL.lead(f, 'x')[0])); }).join('\\cdot ') + '=' + tx(xm(L, n))) + '. So the degree is ' + t(n) + ' (the degrees add) and the leading coefficient is ' + t(L) + ' (the leading coefficients multiply).', ['Which product of terms gives the highest power of ' + t('x') + '?'], 'predict degree and leading coefficient');
          if (S !== L) p.bad = [[String(n), String(S)]];
          return p;
        } }] },
      { num: '16', stem: function (sh) { return 'A difference of two squared binomials: ' + t(sh.lhs + '=' + tx(sh.T)) + '.'; },
        shared: function (r) {
          var p = r.pick([1, 1, 1, 2, 3]), q = r.pick([1, 1, 1, 2, 3]), A = M(p, { a: 1 }), B = M(q, { b: 1 }), P1 = PL.pow(add(A, B), 2), P2 = PL.pow(sub(A, B), 2);
          return { A: A, B: B, P1: P1, P2: P2, T: sub(P1, P2), lhs: br([A, B]) + '^{2}-' + br([A, neg(B)]) + '^{2}' };
        },
        parts: [
          { id: 'e16a', level: 'PRG', make: function (r, sh) {
            var s1 = br([sh.A, sh.B]), s2 = br([sh.A, neg(sh.B)]), fields = [pbox(t(s1 + '^{2}='), ['a', 'b']), pbox(t(s2 + '^{2}='), ['a', 'b']), pbox('Difference', ['a', 'b'])];
            var p = KP.fields('Expand ' + t(s1 + '^{2}') + ' and ' + t(s2 + '^{2}') + ' separately, then subtract to prove the identity.', fields,
              [chk(sh.P1, binWrongs(sh.A, sh.B, sh.A, sh.B, true)), chk(sh.P2, binWrongs(sh.A, neg(sh.B), sh.A, neg(sh.B), true)), chk(sh.T, [{ is: N(0), code: 'all-cancel', hint: 'The squared terms cancel, but subtracting the negative middle term <b>adds</b> it.' }, { is: subFirst(sh.P1, termsOf(sh.P2)), code: 'sub-first', hint: SUBHINT }])],
              [tx(sh.P1), tx(sh.P2), tx(sh.T)], t(s1 + '^{2}=' + tx(sh.P1)) + ', ' + t(s2 + '^{2}=' + tx(sh.P2)) + ', difference ' + t(tx(sh.T)),
              t(s1 + '^{2}=' + tx(sh.P1)) + '<br>' + t(s2 + '^{2}=' + tx(sh.P2)) + '<br>' + t('(' + tx(sh.P1) + ')-(' + tx(sh.P2) + ')=' + seq(termsOf(sh.P1).concat(termsOf(sh.P2).map(neg))) + '=' + tx(sh.T)) + ' ✓', ['Write each square as a product of two equal binomials and use FOIL.', 'When you subtract, change the sign of every term of the second expansion.'], 'prove identity by expanding');
            p.bad = [[tx(add(mul(sh.A, sh.A), mul(sh.B, sh.B))), tx(sh.P2), tx(sh.T)]];
            return p;
          } },
          { id: 'e16b', level: 'PRG', make: function (r, sh) {
            var S = add(add(sh.A, sh.B), sub(sh.A, sh.B)), D = sub(add(sh.A, sh.B), sub(sh.A, sh.B)), fields = [pbox('Sum of the two binomials', ['a', 'b']), pbox('Difference of the two binomials', ['a', 'b']), pbox('Product', ['a', 'b'])];
            var p = KP.fields('Prove it a second way: treat the left side as a difference of squares, ' + t('P^{2}-Q^{2}=(P+Q)(P-Q)') + ' with ' + t('P=' + tx(add(sh.A, sh.B))) + ' and ' + t('Q=' + tx(sub(sh.A, sh.B))) + '. Simplify each bracket, then multiply.', fields,
              [chk(S, []), chk(D, [{ is: N(0), code: 'sub-first', hint: SUBHINT + ' ' + t('-(' + tx(sub(sh.A, sh.B)) + ')=' + tx(neg(sub(sh.A, sh.B)))) + '.' }]), chk(sh.T, [])], [tx(S), tx(D), tx(sh.T)],
              t('P+Q=' + tx(S)) + ', ' + t('P-Q=' + tx(D)) + ', product ' + t(tx(sh.T)),
              t('P+Q=(' + tx(add(sh.A, sh.B)) + ')+(' + tx(sub(sh.A, sh.B)) + ')=' + tx(S)) + '<br>' + t('P-Q=(' + tx(add(sh.A, sh.B)) + ')-(' + tx(sub(sh.A, sh.B)) + ')=' + tx(D)) + '<br>' + t('(' + tx(S) + ')(' + tx(D) + ')=' + tx(sh.T)) + ' ✓', ['Add the two binomials and collect like terms. Then subtract them — the minus sign changes both signs of the second binomial.'], 'prove identity as difference of squares');
            p.bad = [[tx(S), '0', '0']];
            return p;
          } },
          { id: 'e16c', level: 'EMG', make: function (r) {
            var A0 = r.pick([20, 30, 40, 50, 60, 70, 80, 90]), B0 = r.int(1, 9);
            if (r.chance(0.15)) { A0 = 50; B0 = 3; }
            var n1 = A0 + B0, n2 = A0 - B0, v = 4 * A0 * B0;
            var p = KP.fields('Use the identity ' + t('(a+b)^{2}-(a-b)^{2}=4ab') + ' to evaluate ' + t(n1 + '^{2}-' + n2 + '^{2}') + ' mentally. State your ' + t('a') + ' and ' + t('b') + ', then the answer.', [nbox(t('a')), nbox(t('b')), nbox('Value')],
              [K.number(A0, function (x) { return x === n1 ? { code: 'value', hint: t('a+b=' + n1) + ' and ' + t('a-b=' + n2) + ': ' + t('a') + ' is halfway between them.' } : null; }), K.number(B0), K.number(v, function (x) { return x === 4 * n1 * n2 ? { code: 'value', hint: 'Use ' + t('a') + ' and ' + t('b') + ', not ' + t(n1) + ' and ' + t(n2) + ': ' + t('4ab=4(' + A0 + ')(' + B0 + ')') + '.' } : null; })],
              [String(A0), String(B0), String(v)], t('a=' + A0 + ',\\ b=' + B0) + '; ' + t(n1 + '^{2}-' + n2 + '^{2}=' + F(v)),
              t('a+b=' + n1) + ' and ' + t('a-b=' + n2) + '. Adding: ' + t('2a=' + (n1 + n2)) + ', so ' + t('a=' + A0) + ', ' + t('b=' + B0) + '.<br>' + t(n1 + '^{2}-' + n2 + '^{2}=4ab=4(' + A0 + ')(' + B0 + ')=' + F(v)), ['Find ' + t('a') + ' and ' + t('b') + ' with ' + t('a+b=' + n1) + ' and ' + t('a-b=' + n2) + '.'], 'identity: ' + n1 + '^2-' + n2 + '^2');
            p.bad = [[String(n1), String(n2), String(4 * n1 * n2)]];
            return p;
          } },
          { id: 'e16d', level: 'PRG', make: function (r) {
            return KP.mc(r, 'The identity says ' + t('(a+b)^{2}-(a-b)^{2}') + ' never contains an ' + t('a^{2}') + ' or a ' + t('b^{2}') + ' term. Why are the squared terms guaranteed to cancel while the middle terms are guaranteed not to?', [
              { html: 'Both expansions start with ' + t('a^{2}') + ' and end with ' + t('+b^{2}') + ' (squaring removes the sign of ' + t('b') + '), so subtracting cancels them. The middle terms ' + t('+2ab') + ' and ' + t('-2ab') + ' are already opposite, so subtracting turns ' + t('-2ab') + ' into ' + t('+2ab') + ' and they add to ' + t('4ab') + '.', right: true },
              { html: 'The squared terms cancel because ' + t('a^{2}-b^{2}') + ' is always zero.', why: t('a^{2}-b^{2}') + ' is not zero in general. The cancelling pairs are ' + t('a^{2}') + ' with ' + t('a^{2}') + ', and ' + t('b^{2}') + ' with ' + t('b^{2}') + '.' },
              { html: 'Every term cancels, so the identity really equals ' + t('0') + '.', why: 'Then it would say ' + t('0=4ab') + '. Subtracting ' + t('-2ab') + ' gives ' + t('+2ab') + ', which adds to the other ' + t('+2ab') + '.' },
              { html: 'The squared terms cancel only when ' + t('a=b') + '.', why: 'They cancel for every ' + t('a') + ' and ' + t('b') + ': both expansions contain exactly ' + t('a^{2}') + ' and ' + t('+b^{2}') + '.' }],
              t('(a+b)^{2}=a^{2}+2ab+b^{2}') + ' and ' + t('(a-b)^{2}=a^{2}-2ab+b^{2}') + '. The squared terms are identical, so they cancel; the middle terms are opposite, so subtracting doubles them: ' + t('2ab-(-2ab)=4ab') + '.', ['Write out both expansions one above the other and compare term by term.'], 'why the squares cancel (MC)');
          } }] },
      { num: '17', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: 'e17', level: 'EMG', make: function (r) {
          var a = r.int(2, 4), b = r.int(2, 5), c = r.int(2, 3), d = pickWhere(function () { return r.int(2, 6); }, function (v) { return a * v !== b * c; });
          if (r.chance(0.15)) { a = 3; b = 4; c = 2; d = 5; }
          var A = xm(a), B = M(-b, { y: 1 }), C = xm(c), D = M(d, { y: 1 }), f = foil(A, B, C, D), m = a * d - b * c;
          var mk = function (mid) { return t(tx(add(f.F, M(mid, { x: 1, y: 1 }), f.L))); };
          return KP.mc(r, 'Expand ' + t(br([A, B]) + br([C, D])) + '.', [
            { html: mk(m), right: true },
            { html: mk(-m), why: 'The middle term has the wrong sign: O ' + t('=' + tx(f.O)) + ', I ' + t('=' + tx(f.I)) + '.' },
            { html: mk(a * d + b * c), why: 'The Inside product is negative: ' + t(dot(B, C) + '=' + tx(f.I)) + '. Combine ' + t(tx(f.O)) + ' and ' + t(tx(f.I)) + '.' },
            { html: t(tx(add(f.F, f.L))), why: 'That is only First and Last — the Outside and Inside products are missing.' }],
            foilSol(A, B, C, D), HB, 'FOIL two variables (MC)');
        } }] },
      { num: '18', stem: '<i>(Numerical Response)</i>', parts: [
        { id: 'e18', level: 'PRG', make: function (r) {
          var calc = function (o) { var P1 = mul(lin(o.a, o.b), lin(o.c, -o.d)), P2 = mul(lin(1, o.e), lin(1, -o.f)); return { P1: P1, P2: P2, T: sub(P1, P2), v: PL.at(sub(P1, P2), { x: 1 }) }; };
          var o = pickWhere(function () { return { a: r.int(2, 3), b: r.int(1, 6), c: r.int(2, 4), d: r.int(1, 3), e: r.int(1, 6), f: r.int(2, 8) }; }, function (o) { var k = calc(o); return k.v >= 10 && k.v <= 999 && o.e !== o.f && PL.coef(k.T, { x: 1 })[0] !== 0; });
          if (r.chance(0.15)) o = { a: 2, b: 5, c: 3, d: 1, e: 4, f: 6 };
          var k = calc(o), A = PL.coef(k.T, { x: 2 })[0], B = PL.coef(k.T, { x: 1 })[0], C = PL.constant(k.T)[0];
          var vAdd = PL.at(add(k.P1, k.P2), { x: 1 }), vFirst = PL.at(subFirst(k.P1, termsOf(k.P2)), { x: 1 });
          return KP.nr('The expression ' + t(br([xm(o.a), N(o.b)]) + br([xm(o.c), N(-o.d)]) + '-' + br([xm(1), N(o.e)]) + br([xm(1), N(-o.f)])) + ' can be written in the form ' + t('ax^{2}+bx+c') + '. The value of ' + t('a+b+c') + ' is ____. (Record your answer as a three-digit number.)', k.v,
            function (v) { if (v === vAdd) return { code: 'sub-first', hint: 'The second product is <b>subtracted</b>: put it in brackets first.' }; if (v === vFirst) return { code: 'sub-first', hint: SUBHINT }; return null; },
            t(tx(k.P1)) + ' and ' + t(tx(k.P2)) + '.<br>' + t('(' + tx(k.P1) + ')-(' + tx(k.P2) + ')=' + tx(k.T)) + ', so ' + t('a+b+c=' + A + (B < 0 ? '' : '+') + B + (C < 0 ? '' : '+') + C + '=' + k.v) + '. Record ' + t(k.v < 100 ? '0' + k.v : String(k.v)) + '.<br>(Shortcut: ' + t('a+b+c') + ' is the value at ' + t('x=1') + '.)',
            ['Expand both products, put the second in brackets, subtract, then collect.', 'Add the three coefficients, signs included.'], 'NR a+b+c');
        } }] }
    ]
  });
})(window);
