/* Math 10C · Unit 3 · Lesson 4 — Multiplying Polynomials II: Binomial × Trinomial and Three Binomials (AN4)
 * Assignment questions 1–10 (u3_L04.tex) and the whole Lesson 4 Extra Practice (u3_EP04.tex, Q1–17).
 * Every part is a generator: it keeps the structure of the booklet question (signs, which factor carries the
 * coefficient, number of letters, special pairs) and changes the numbers; the booklet's numbers are one of the
 * possible values. Keys are built with HW.poly from the generated numbers. Levels: LIM BEG EMG PRG ADV MAS. */
(function (root) {
  'use strict';
  var HW = root.HW, K = HW.kit, KP = K.P, t = K.t;
  /* HW.poly, but factors may also be given as arrays of terms (summed first) */
  var P = Object.create(HW.poly);
  function fx(a) { return Array.isArray(a) && a.length && typeof a[0] === 'object' ? HW.poly.add.apply(null, a) : a; }
  ['mul', 'add', 'sub', 'eq'].forEach(function (f) { P[f] = function () { return HW.poly[f].apply(null, Array.prototype.map.call(arguments, fx)); }; });
  P.pow = function (a, n) { return HW.poly.pow(fx(a), n); };

  HW.addCodes({
    'foil-only': 'Only 4 partial products (FOIL) — missed the trinomial’s middle term', 'second-partial': 'Second term of the binomial multiplied by only part of the trinomial',
    'minus-first': 'Subtracted a bracket but changed only its first sign', 'third-partial': 'Third bracket only partly distributed',
    'const-both': 'Multiplied the constant factor into both brackets', 'const-lost': 'Dropped the constant factor', 'cube-each': 'Cubed each term: (a+b)³ = a³+b³',
    'square-middle': 'Squared a binomial without the middle term', 'face-area': 'Gave the area of one face, not the volume', 'two-dims': 'Multiplied only two of the three dimensions',
    'not-cube': 'Treated a prism as a cube', 'dsq-sign': 'Sum × difference gave + between the squares', 'coef-in': 'Moved the coefficient into the bracket before squaring',
    'exp-mult': 'Multiplied exponents instead of adding', 'no-3': 'Left out the 3s of the cube pattern', 'reverse': 'Subtracted in the wrong order', 'added-prod': 'Added instead of subtracting',
    'one-cut': 'Took only one cut off a side', 'student-ans': 'Repeated the student’s error', 'no-x': 'Left out the height factor x', 'sqr-face': 'Squared only (face area)',
    'cube-sign': 'Sign of the cube root', 'pair-sum': 'Added instead of using pairwise products', 'only-last': 'Multiplied the monomial into only one term', 'tripled': 'Multiplied by 3 instead of cubing',
    'missed-1': 'Missed a value', 'height-neg': 'A dimension would be zero or negative', 'coef-sum': 'Added the coefficients instead of multiplying', 'count': 'Wrong count'
  });

  /* ---------------- polynomial helpers ---------------- */
  function M(c, v, e) { var o = {}; if (v) o[v] = e == null ? 1 : e; return P.mono(c, o); } // c·v^e
  function MM(c, vs) { return P.mono(c, vs); }                                              // c·x^a·y^b
  function N(c) { return P.num(c); }
  function sum(arr) { return P.add.apply(null, arr); }
  function seq(arr) { return P.seq(arr); }
  function br(arr) { return arr.length > 1 ? '\\left(' + seq(arr) + '\\right)' : seq(arr); }
  function tx(p, o) { return P.tex(p, o); }
  function termsOf(p, o) { return P.sorted(p, o || {}).map(function (T) { return P.mono(T.c, T.v); }); }
  function signedTex(m, first) { var s = P.tex(m); return first || s.charAt(0) === '-' ? s : '+' + s; }
  function pickWhere(gen, test) { for (var i = 0; i < 3000; i++) { var v = gen(); if (test(v)) return v; } throw new Error('pickWhere failed'); }
  function cnt(p) { return P.count(p); }
  function co(p, vs) { var c = P.coef(p, vs || {}); return c[0] / c[1]; }
  function plain(s) { return s.replace(/\\left|\\right/g, '').replace(/\\cdot/g, '·').replace(/[{}]/g, ''); }
  function lin(a, b, v) { return [M(a, v), N(b)]; }               // [a v, b]
  function lin2(a, u, b, w) { return [M(a, u), M(b, w)]; }         // [a u, b w]
  function quad(a, b, c, v) { return [M(a, v, 2), M(b, v), N(c)].filter(function (m) { return !P.isZero(m); }); }
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t2 = a % b; a = b; b = t2; } return a; }
  function pv(n) { return n < 0 ? '(' + n + ')' : String(n); }

  /* partial products, like-term notes, distribution and area-model solutions */
  function partials(A, B) { var out = []; A.forEach(function (a) { B.forEach(function (b) { out.push(P.mul(a, b)); }); }); return out; }
  function collectNote(parts) {
    var g = {}, order = [];
    parts.forEach(function (p) { var k = Object.keys(p)[0]; if (k == null) return; if (!g[k]) { g[k] = []; order.push(k); } g[k].push(p); });
    return order.filter(function (k) { return g[k].length > 1; }).map(function (k) { var s = sum(g[k]); return seq(g[k]) + '=' + (P.isZero(s) ? '0' : tx(s)); }).join(';\\ \\ ');
  }
  /* lead = LaTeX of the product being expanded; A's terms are distributed over B */
  function distSol(A, B, lead, o) {
    o = o || {};
    var l1 = A.map(function (a, i) { return signedTex(a, i === 0) + br(B); }).join('');
    var l2 = A.map(function (a) { return '\\left(' + seq(B.map(function (b) { return P.mul(a, b); })) + '\\right)'; }).join('+');
    var parts = partials(A, B), note = collectNote(parts), res = P.mul(sum(A), sum(B));
    var s = t((lead ? lead : '') + '=' + l1) + '<br>' + t('=' + l2);
    if (note) s += '<br>Collect like terms: ' + t(note);
    return s + '<br>' + t('=' + tx(res, o));
  }
  function pairLine(A, B) { var res = P.mul(sum(A), sum(B)); return t(br(A) + br(B) + '=' + seq(partials(A, B)) + '=' + tx(res)); }
  function grid(A, B, fill) {
    return HW.areaModel(B.map(function (b) { return tx(b); }), A.map(function (a) { return tx(a); }),
      A.map(function (a) { return B.map(function (b) { return fill ? tx(P.mul(a, b)) : ''; }); }), { max: 380 });
  }
  /* three binomials F3 = [A, B, C]: multiply factors i and j first, then distribute the third over the result */
  function threeSol(F3, i, j, why) {
    var k = [0, 1, 2].filter(function (x) { return x !== i && x !== j; })[0], first = P.mul(sum(F3[i]), sum(F3[j])), T = termsOf(first);
    var names = ['first', 'second', 'third'];
    var s = (why || 'Multiply the ' + names[i] + ' and ' + names[j] + ' binomials first:') + '<br>' + pairLine(F3[i], F3[j]) + '<br>Then multiply by ' + t(br(F3[k])) + ':<br>';
    return s + distSol(F3[k], T, br(T) + br(F3[k]));
  }

  /* ---------------- the poly part, with classic wrong answers ---------------- */
  function cleanW(T, ws) {
    var out = [];
    (ws || []).forEach(function (w) {
      if (!w || !w.is) return; var p = P.lift(w.is);
      if (P.eq(p, T) || out.some(function (o) { return P.eq(o.is, p); })) return;
      out.push({ is: p, code: w.code, hint: w.hint });
    });
    return out;
  }
  function polyPart(prompt, target, wrongs, sol, hints, text, o) {
    o = o || {}; var T = P.lift(target), ws = cleanW(T, wrongs);
    var p = KP.poly(prompt, T, { wrong: ws, order: o.order, var: o.var, keyTex: o.keyTex, before: o.before, vars: o.vars }, sol, hints, text);
    p.bad = ws.map(function (w) { return tx(w.is); }).concat(o.bad || []);
    p.good = (o.order ? [] : [tx(T, { order: 'asc' })]).concat(o.good || []);
    return p;
  }
  /* a box in a fields part */
  function box(label, vars, o) { o = o || {}; return { name: o.name || label.replace(/<[^>]*>|\\\(|\\\)/g, ''), label: label, mode: 'math', keys: 'poly', vars: vars || ['x'], wide: o.wide !== false, before: o.before }; }
  function intChk(n, diag) { return K.value(n, { only: 'integer', diag: diag ? function (v) { return diag(v); } : null }); }
  function polyChk(T, wrongs, o) { o = o || {}; T = P.lift(T); return K.poly(T, { wrong: cleanW(T, wrongs), order: o.order, var: o.var }); }

  /* classic wrong answers */
  function wFoil(A, B) { // binomial × trinomial with only FOIL's four products (the trinomial's middle term skipped)
    var bi = A.length === 2 ? A : B, tr = A.length === 2 ? B : A;
    if (bi.length !== 2 || tr.length !== 3) return null;
    return { is: sum([P.mul(bi[0], tr[0]), P.mul(bi[0], tr[2]), P.mul(bi[1], tr[0]), P.mul(bi[1], tr[2])]), code: 'foil-only',
      hint: 'You have only four partial products — that’s FOIL. A binomial × trinomial needs ' + t('2\\times 3=6') + ': both terms of ' + t(br(bi)) + ' must also multiply the middle term ' + t(tx(tr[1])) + '.' };
  }
  function wSecond(A, B) { // second term of the binomial multiplied only by the last term of the trinomial
    var bi = A.length === 2 ? A : B, tr = A.length === 2 ? B : A;
    if (bi.length !== 2 || tr.length !== 3) return null;
    return { is: P.add(P.mul(bi[0], sum(tr)), P.mul(bi[1], tr[2])), code: 'second-partial',
      hint: t(tx(bi[1])) + ' must multiply <b>every</b> term of ' + t(br(tr)) + ', not just the last one — that’s three more partial products.' };
  }
  function wMinusFirst(A, B) { // A = [lead, negative const]: "lead·B − (|c|·B)" with only the first sign changed
    var c = A[1], cv = co(c); if (!(cv < 0)) return null;
    var row = B.map(function (b) { return P.mul(P.neg(c), b); }), bad = P.mul(A[0], sum(B));
    row.forEach(function (m, i) { bad = i === 0 ? P.sub(bad, m) : P.add(bad, m); });
    return { is: bad, code: 'minus-first', hint: 'Check the ' + t(tx(c)) + ' row: ' + t(tx(c)) + ' times <b>every</b> term of ' + t(br(B)) + ' — a negative times a negative is positive, so every sign in that row changes.' };
  }
  function wThird(T, C) { // trinomial × binomial with the binomial's second term only times the last term
    return { is: P.add(P.mul(sum(T), C[0]), P.mul(T[T.length - 1], C[1])), code: 'third-partial',
      hint: 'In the second stage, ' + t(tx(C[1])) + ' must multiply <b>every</b> term of ' + t(br(T)) + ', not just the last one.' };
  }
  function wConst(k, AB) {
    return [{ is: P.scale(AB, k * k), code: 'const-both', hint: 'The ' + t(k) + ' multiplies the whole product <b>once</b>. Multiplying it into both brackets multiplies by ' + t(pv(k) + '\\times ' + pv(k) + '=' + k * k) + '.' },
      { is: AB, code: 'const-lost', hint: 'Don’t forget the factor ' + t(k) + ' in front: multiply every term of your expansion by ' + t(k) + '.' }];
  }

  var H_BT = ['Multiply each term of the first factor by every term of the second: a binomial × trinomial gives ' + t('2\\times 3=6') + ' partial products. Then collect like terms.',
    'When you multiply powers of the same letter, add the exponents (' + t('x\\cdot x^{2}=x^{3}') + '). Watch the signs: a negative times a negative is positive.'];
  var H_3 = ['Multiply two of the binomials first (FOIL), then multiply that trinomial by the third binomial.', 'The second stage is a trinomial × binomial: ' + t('3\\times 2=6') + ' partial products. Then collect like terms.'];
  var H_33 = ['Every term of the first trinomial multiplies every term of the second: ' + t('3\\times 3=9') + ' partial products.', 'Organize them in three rows (one for each term of the first factor), then collect like terms.'];

  /* expand A·B (arrays); o.k: constant in front; o.wrong extra wrongs; o.lead display */
  function expandPart(A, B, o) {
    o = o || {};
    var k = o.k || 1, AB = P.mul(sum(A), sum(B)), T = P.scale(AB, k);
    var lead = o.lead || ((k === 1 ? '' : k === -1 ? '-' : String(k)) + br(A) + br(B));
    var ws = [], kk = k === 1 ? 1 : k;
    function sc(w) { return w ? { is: P.scale(w.is, kk), code: w.code, hint: w.hint } : null; }
    if (o.foil !== false) { ws.push(sc(wFoil(A, B))); ws.push(sc(wSecond(A, B))); }
    if (A.length === 2 && B.length > 1) ws.push(sc(wMinusFirst(A, B)));
    if (k !== 1) ws = ws.concat(wConst(k, AB));
    ws = ws.concat(o.wrong || []);
    var sol = k === 1 ? distSol(A, B, lead, o.solOpt)
      : 'Expand the bracketed product first, then multiply every term by ' + t(k) + ':<br>' + distSol(A, B, br(A) + br(B)) + '<br>' + t('=' + (k < 0 ? '-' + (k === -1 ? '' : -k) : k) + '\\left(' + tx(AB) + '\\right)=' + tx(T));
    return polyPart(o.prompt || t(lead), T, ws, (o.solPre || '') + sol, o.hints || H_BT, o.text || 'expand ' + plain(lead), o);
  }
  function threePart(F3, i, j, o) {
    o = o || {};
    var T = P.mul(sum(F3[0]), sum(F3[1]), sum(F3[2])), lead = F3.map(br).join(''), k = [0, 1, 2].filter(function (x) { return x !== i && x !== j; })[0];
    var first = termsOf(P.mul(sum(F3[i]), sum(F3[j])));
    var ws = [first.length === 3 ? wThird(first, F3[k]) : null].concat(o.wrong || []);
    return polyPart(o.prompt || t(lead), T, ws, (o.solPre || '') + threeSol(F3, i, j, o.why), o.hints || H_3, o.text || 'expand ' + plain(lead), o);
  }

  /* ---------------- figures (inline SVG) ---------------- */
  function svgLab(s) { return String(s).replace(/\+/g, ' + ').replace(/(.)-/g, '$1 − ').replace(/^-/, '−').replace(/([a-z])/g, '<tspan font-style="italic">$1</tspan>'); }
  function linLab(arr) { return '(' + seq(arr) + ')'; }
  function boxSvg(o) {
    var S = o.S || 40, w = o.w * S, h = o.h * S, dx = o.d[0] * S, dy = o.d[1] * S, u0 = o.units ? 3 : 0, L = o.left ? 16 + 8.2 * (String(o.left).length + 2 + u0) : 16, R = o.right ? 8.2 * (String(o.right).length + 2 + u0) : 16, T = 10, B = o.bottom || o.right ? 30 : 10;
    var W = L + w + dx + R, H = T + dy + h + B, x0 = L, y0 = T + dy + h, u = o.units ? ' ' + o.units : '';
    function pt(p) { return (x0 + p[0]).toFixed(1) + ',' + (y0 - p[1]).toFixed(1); }
    function sh(p) { return [p[0] + dx, p[1] + dy]; }
    var A = [0, 0], Bp = [w, 0], C = [w, h], D = [0, h];
    var solid = 'M' + pt(A) + 'L' + pt(Bp) + 'L' + pt(C) + 'L' + pt(D) + 'Z M' + pt(D) + 'L' + pt(sh(D)) + 'L' + pt(sh(C)) + 'L' + pt(C) + ' M' + pt(Bp) + 'L' + pt(sh(Bp)) + 'L' + pt(sh(C));
    var dash = 'M' + pt(A) + 'L' + pt(sh(A)) + ' M' + pt(sh(A)) + 'L' + pt(sh(Bp)) + ' M' + pt(sh(A)) + 'L' + pt(sh(D));
    var s = '<svg class="fig-svg" viewBox="0 0 ' + Math.ceil(W) + ' ' + Math.ceil(H) + '" style="max-width:' + Math.min(440, Math.ceil(W * 1.05)) + 'px" role="img" aria-label="' + (o.aria || 'rectangular prism') + '" font-size="15" font-family="KaTeX_Main,\'Times New Roman\',serif">';
    s += '<path d="' + solid + '" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="' + dash + '" fill="none" stroke="currentColor" stroke-width="1.2" stroke-dasharray="5 4"/>';
    if (o.bottom) s += '<text x="' + (x0 + w / 2).toFixed(1) + '" y="' + (y0 + 21) + '" text-anchor="middle" fill="currentColor">' + svgLab(o.bottom) + u + '</text>';
    if (o.left) s += '<text x="' + (x0 - 8) + '" y="' + (y0 - h / 2 + 5).toFixed(1) + '" text-anchor="end" fill="currentColor">' + svgLab(o.left) + u + '</text>';
    if (o.right) s += '<text x="' + (x0 + w + dx / 2 + 6).toFixed(1) + '" y="' + (y0 - dy / 2 + 17).toFixed(1) + '" text-anchor="start" fill="currentColor">' + svgLab(o.right) + u + '</text>';
    return s + '</svg>';
  }
  function sheetSvg(Lc, Wc) {
    var S = 290 / Lc, w = Lc * S, h = Wc * S, c = Math.min(w, h) * 0.2, x0 = 64, y0 = 10, W = x0 + w + 16, H = y0 + h + 34;
    var s = '<svg class="fig-svg" viewBox="0 0 ' + W + ' ' + H + '" style="max-width:400px" role="img" aria-label="sheet of cardboard with a square cut from each corner" font-size="15" font-family="KaTeX_Main,\'Times New Roman\',serif">';
    s += '<rect x="' + x0 + '" y="' + y0 + '" width="' + w + '" height="' + h + '" fill="none" stroke="currentColor" stroke-width="2"/>';
    [[0, 0], [w - c, 0], [0, h - c], [w - c, h - c]].forEach(function (q) { s += '<rect x="' + (x0 + q[0]) + '" y="' + (y0 + q[1]) + '" width="' + c + '" height="' + c + '" fill="#9aa3ad" fill-opacity="0.35" stroke="currentColor" stroke-width="1.3"/>'; });
    s += '<path d="M' + (x0 + c) + ',' + y0 + 'V' + (y0 + h) + 'M' + (x0 + w - c) + ',' + y0 + 'V' + (y0 + h) + 'M' + x0 + ',' + (y0 + c) + 'H' + (x0 + w) + 'M' + x0 + ',' + (y0 + h - c) + 'H' + (x0 + w) + '" stroke="currentColor" stroke-width="1" stroke-dasharray="5 4" fill="none"/>';
    s += '<text x="' + (x0 + c / 2) + '" y="' + (y0 + h - c / 2 + 5) + '" text-anchor="middle" fill="currentColor" font-style="italic">x</text>';
    s += '<text x="' + (x0 + w / 2) + '" y="' + (y0 + h + 22) + '" text-anchor="middle" fill="currentColor">' + Lc + ' cm</text>';
    s += '<text x="' + (x0 - 8) + '" y="' + (y0 + h / 2 + 5) + '" text-anchor="end" fill="currentColor">' + Wc + ' cm</text>';
    return s + '</svg>';
  }
  /* vertical layout: trinomial Tri (complete, descending) over binomial Bin */
  function vertTex(Tri, Bin, full) {
    function row(cells) { var seen = false; return cells.map(function (m) { if (!m) return ''; var x = signedTex(m, !seen); seen = true; return x; }).join(' & '); }
    var r1 = Tri.map(function (a) { return P.mul(Bin[1], a); }), r2 = Tri.map(function (a) { return P.mul(Bin[0], a); }), tot = termsOf(P.mul(sum(Tri), sum(Bin)));
    var body = row([null].concat(Tri)) + ' \\\\ ' + row([null, null, Bin[0], Bin[1]]) + ' \\\\ \\hline ';
    if (full) body += row([null].concat(r1)) + ' \\\\ ' + row(r2.concat([null])) + ' \\\\ \\hline ' + row(tot);
    return '\\begin{array}{rrrr}' + body + '\\end{array}';
  }
  /* p evaluated at x = val, written term by term: 2(1)^{3}-5(1)+4 */
  function atTex(p, val, x) {
    return P.sorted(p).map(function (T, i) { var e = T.v[x] || 0, c = T.c[0], a = Math.abs(c); var cs = e === 0 ? String(a) : a === 1 ? '' : String(a); return (c < 0 ? '-' : i ? '+' : '') + cs + (e ? '(' + val + ')' + (e > 1 ? '^{' + e + '}' : '') : ''); }).join('');
  }

  /* ---------------- MC with fixed A–D and a 2×2 layout ---------------- */
  function mc(r, prompt, opts, sol, hints, text, keepOrder) { return KP.mc(r, prompt, opts, sol, hints, text, keepOrder); }

  /* ---------------- Q9: numerical response ---------------- */
  function nrForms() { return [['b-2c', function (a, b, c) { return b - 2 * c; }], ['b-2c', function (a, b, c) { return b - 2 * c; }], ['a+b-c', function (a, b, c) { return a + b - c; }], ['2b-c', function (a, b, c) { return 2 * b - c; }], ['b-c-a', function (a, b, c) { return b - c - a; }]]; }

  HW.defineLesson({
    id: 'u3l4', unit: 3, num: '4', title: 'Multiplying Polynomials II: Binomial × Trinomial and Three Binomials', outcome: 'AN4',
    blurb: 'Six partial products at a time — by grid and by distribution — then three binomials at once for the volume of a box.',
    questions: [
      /* ---------- Q1 area model ---------- */
      { num: '1', section: 'Part A — Binomial × Trinomial', stem: 'Use an area model (grid) to determine the expansion.', parts: [
        { id: '1a', level: 'BEG', make: function (r) {
          var g = pickWhere(function () { return { a: r.int(2, 6), b: r.int(1, 5), c: r.int(2, 7) }; }, function (g) { return g.b !== g.a && g.c !== g.a * g.b; });
          var A = lin(1, -g.a, 'p'), B = quad(1, g.b, g.c, 'p'), lead = br(A) + br(B), T = P.mul(sum(A), sum(B));
          return polyPart(t(lead) + grid(A, B, false), T, [wFoil(A, B), wSecond(A, B), { is: P.mul(lin(1, g.a, 'p'), sum(B)), code: 'sign', hint: 'Check the bottom row of your grid: it is ' + t('-' + g.a) + ', so every product in that row is negative.' }],
            'Fill each cell with (row label) × (column label):' + grid(A, B, true) + 'Add the six cells and collect like terms: ' + t(collectNote(partials(A, B))) + '<br>' + t(lead + '=' + tx(T)),
            ['Each cell is its row label times its column label — six cells in all.', 'Add the six cells, then collect the ' + t('p^{2}') + ' terms and the ' + t('p') + ' terms.'], 'area model ' + plain(lead));
        } },
        { id: '1b', level: 'EMG', make: function (r) {
          var g = pickWhere(function () { return { k: r.pick([2, 2, 3]), a: r.int(1, 6), b: r.int(2, 5), c: r.int(2, 6) }; }, function (g) { var T = P.mul(lin(g.k, g.a, 'n'), quad(1, -g.b, g.c, 'n')); return gcd(g.k, g.a) === 1 && cnt(T) === 4; });
          var A = lin(g.k, g.a, 'n'), B = quad(1, -g.b, g.c, 'n'), lead = br(A) + br(B), T = P.mul(sum(A), sum(B));
          return polyPart(t(lead) + grid(A, B, false), T, [wFoil(A, B), wSecond(A, B)],
            'Fill each cell with (row label) × (column label):' + grid(A, B, true) + 'Add the six cells and collect like terms: ' + t(collectNote(partials(A, B))) + '<br>' + t(lead + '=' + tx(T)),
            ['Each cell is its row label times its column label — six cells in all.', 'Watch the column ' + t('-' + g.b + 'n') + ': both cells in it are negative.'], 'area model ' + plain(lead));
        } }] },
      /* ---------- Q2 distributive property + check ---------- */
      { num: '2', stem: 'Use the distributive property to determine the expansion.',
        shared: function (r) {
          var a = pickWhere(function () { return { a: r.int(2, 7), b: r.int(1, 4), c: r.int(3, 9) }; }, function (g) { var T = P.mul(lin(1, -g.a, 'x'), quad(1, -g.b, g.c, 'x')); return cnt(T) === 4 && (1 - g.a) * (1 - g.b + g.c) !== 0; });
          return { a: a };
        },
        parts: [
          { id: '2a', level: 'EMG', make: function (r, sh) { var g = sh.a; return expandPart(lin(1, -g.a, 'x'), quad(1, -g.b, g.c, 'x')); } },
          { id: '2b', level: 'PRG', make: function (r) {
            var g = pickWhere(function () { return { k: r.pick([2, 3, 3, 4]), m: r.int(1, 5), b: r.int(2, 6), c: r.int(2, 7) }; }, function (g) { return gcd(g.k, g.m) === 1 && cnt(P.mul(lin(g.k, g.m, 'a'), quad(1, -g.b, -g.c, 'a'))) === 4; });
            return expandPart(lin(g.k, g.m, 'a'), quad(1, -g.b, -g.c, 'a'));
          } },
          { id: '2c', level: 'BEG', make: function (r, sh) {
            var g = sh.a, A = lin(1, -g.a, 'x'), B = quad(1, -g.b, g.c, 'x'), lead = br(A) + br(B), T = P.mul(sum(A), sum(B)), v = (1 - g.a) * (1 - g.b + g.c);
            var vb = (1 - g.a) * (1 + g.b + g.c);
            var diag = function (x) { return x === -v ? { code: 'sign', hint: 'Check the sign: ' + t(pv(1 - g.a)) + ' is negative.' } : x === vb && vb !== v ? { code: 'sub', hint: 'At ' + t('x=1') + ', ' + t('-' + g.b + 'x') + ' is ' + t('-' + g.b) + ', not ' + t('+' + g.b) + '.' } : null; };
            var p = KP.fields('Check your answer to (a) by substituting ' + t('x=1') + ' into both ' + t(lead) + ' and your expansion.',
              [box('Product ' + t(lead) + ' at ' + t('x=1') + ':', ['x'], { name: 'Product at x = 1' }), box('Your expansion at ' + t('x=1') + ':', ['x'], { name: 'Expansion at x = 1' })],
              [intChk(v, diag), intChk(v, diag)], [String(v), String(v)], 'Both sides equal ' + t(v) + '.',
              'Product: ' + t('(1-' + g.a + ')(1-' + g.b + '+' + g.c + ')=(' + (1 - g.a) + ')(' + (1 - g.b + g.c) + ')=' + v) + '<br>Expansion: ' + t(atTex(T, 1, 'x') + '=' + v) + '<br>Both sides are ' + t(v) + ', so the expansion checks. ✓',
              ['Replace every ' + t('x') + ' with ' + t('1') + ' and work out each side.', 'If the two values don’t match, there is a mistake in your expansion.'], 'check at x=1: ' + plain(lead));
            p.bad = [[String(-v), String(-v)]];
            return p;
          } }] },
      /* ---------- Q3 Marco's FOIL ---------- */
      { num: '3', stem: function (sh) { return 'Marco tries to expand ' + t(sh.lead) + ' with FOIL and gets ' + t(sh.marco) + '.'; },
        shared: function (r) {
          var k = r.int(2, 5), p = r.int(1, 3), q = r.int(1, 5);
          var A = lin(1, k, 'x'), B = quad(1, p, q, 'x');
          var marco = seq([M(1, 'x', 3), M(q, 'x'), M(k, 'x', 2), N(k * q)]);
          return { k: k, p: p, q: q, A: A, B: B, lead: br(A) + br(B), marco: marco };
        },
        parts: [
          { id: '3a', level: 'EMG', make: function (r, sh) {
            var px = tx(M(sh.p, 'x')), m1 = tx(M(sh.p, 'x', 2)), m2 = tx(M(sh.k * sh.p, 'x'));
            return mc(r, 'Why can’t FOIL alone expand this product, and which partial products did Marco miss?', [
              { html: 'FOIL makes only ' + t('4') + ' products, but ' + t('2\\times 3=6') + ' are needed. He missed ' + t('x\\cdot ' + px + '=' + m1) + ' and ' + t(sh.k + '\\cdot ' + px + '=' + m2) + '.', right: true },
              { html: 'FOIL makes only ' + t('4') + ' products, but ' + t('2\\times 3=6') + ' are needed. He missed ' + t('x\\cdot x^{2}=x^{3}') + ' and ' + t(sh.k + '\\cdot ' + sh.q + '=' + sh.k * sh.q) + '.', why: 'Look at Marco’s answer: ' + t('x^{3}') + ' and ' + t(sh.k * sh.q) + ' are already there — those are his “First” and “Last”. Which term of the trinomial did FOIL never touch?' },
              { html: 'FOIL works for any product; Marco just made an adding mistake.', why: 'FOIL is First, Outer, Inner, Last — exactly four products. A binomial × trinomial needs six, so FOIL can’t be the whole story.' },
              { html: 'FOIL makes only ' + t('4') + ' products, but ' + t('3+2=5') + ' are needed. He missed ' + t(m1) + '.', why: 'Count the handshakes: each of the ' + t('2') + ' terms of the binomial meets each of the ' + t('3') + ' terms of the trinomial — ' + t('2\\times 3') + ', not ' + t('2+3') + '.' }],
              'FOIL gives only four products (First, Outer, Inner, Last), but a binomial × trinomial has ' + t('2\\times 3=6') + '. Marco used ' + t('x\\cdot x^{2}') + ', ' + t('x\\cdot ' + sh.q) + ', ' + t(sh.k + '\\cdot x^{2}') + ' and ' + t(sh.k + '\\cdot ' + sh.q) + ' — he never multiplied by the trinomial’s middle term ' + t(px) + ': ' + t('x\\cdot ' + px + '=' + m1) + ' and ' + t(sh.k + '\\cdot ' + px + '=' + m2) + '.',
              ['Match each term of Marco’s answer to the two terms that made it. Which term of the trinomial was never used?'], 'why FOIL fails: ' + plain(sh.lead));
          } },
          { id: '3b', level: 'BEG', make: function (r, sh) {
            var p = expandPart(sh.A, sh.B, { prompt: 'Expand ' + t(sh.lead) + ' correctly.', wrong: [{ is: P.parse(sh.marco), code: 'student-ans', hint: 'That’s Marco’s answer — only four partial products. Both ' + t('x') + ' and ' + t(sh.k) + ' must also multiply the middle term ' + t(tx(M(sh.p, 'x'))) + '.' }] });
            return p;
          } }] },
      /* ---------- Q4 expand and simplify ---------- */
      { num: '4', stem: 'Expand and simplify.', parts: [
        { id: '4a', level: 'EMG', make: function (r) {
          var g = pickWhere(function () { return { c: r.int(2, 7), a: r.int(2, 5), b: r.int(2, 6), d: r.int(3, 9) }; }, function (g) { return g.b !== g.a * g.c; });
          var A = [M(1, 'x', 2), N(-g.c)], B = [M(g.a, 'x', 3), M(g.b, 'x'), N(-g.d)];
          var em = sum([M(g.a, 'x', 6), M(g.b, 'x', 2), N(-g.d), M(-g.c * g.a, 'x', 3), M(-g.c * g.b, 'x'), N(g.c * g.d)]);
          return expandPart(A, B, { wrong: [{ is: em, code: 'exp-mult', hint: 'Check the exponents: ' + t('x^{2}\\cdot ' + g.a + 'x^{3}=' + g.a + 'x^{5}') + ' — when you multiply powers you <b>add</b> the exponents, you don’t multiply them.' }] });
        } },
        { id: '4b', level: 'EMG', make: function (r) {
          var g = pickWhere(function () { return { b: -r.int(1, 3), c: r.int(1, 5), k: r.int(2, 5) }; }, function (g) { return g.c + g.b * g.k !== 0; });
          var A = [M(-1, 'n', 2), M(g.b, 'n'), N(g.c)], B = lin(1, g.k, 'n');
          return expandPart(A, B);
        } },
        { id: '4c', level: 'PRG', make: function (r) {
          var g = pickWhere(function () { return { k: r.int(2, 5), p: r.int(2, 4), q: r.int(1, 5), s: r.int(2, 6) }; }, function (g) { return g.k * g.q !== g.s; });
          var A = lin2(1, 'a', -g.k, 'b'), B = [MM(g.p, { a: 2 }), MM(-g.q, { a: 1, b: 1 }), MM(-g.s, { b: 2 })];
          return expandPart(A, B, { hints: ['Multiply ' + t('a') + ' by every term of the trinomial, then ' + t('-' + g.k + 'b') + ' by every term: six partial products.', 'Like terms have the same letters with the same exponents: ' + t('a^{2}b') + ' and ' + t('ab^{2}') + ' are <b>not</b> like terms.'] });
        } },
        { id: '4d', level: 'PRG', make: function (r) {
          var g = pickWhere(function () { return { m: r.int(2, 4), p: r.int(2, 4), q: r.int(1, 5), a: r.int(1, 3), b: r.int(1, 3), u: r.int(2, 6) }; }, function (g) { return gcd(g.p, g.q) === 1 && cnt(P.mul(lin(g.p, g.q, 'x'), quad(g.a, g.b, -g.u, 'x'))) === 4; });
          return expandPart(lin(g.p, g.q, 'x'), quad(g.a, g.b, -g.u, 'x'), { k: g.m });
        } }] },
      /* ---------- Q5 three binomials ---------- */
      { num: '5', section: 'Part B — Three Binomials and Volume', stem: 'Expand and simplify.', parts: [
        { id: '5a', level: 'PRG', make: function (r) {
          var g = pickWhere(function () { return { a: r.int(1, 6), b: r.int(2, 7), k: r.pick([2, 3]), c: r.int(1, 3) }; }, function (g) { return g.a !== g.b && gcd(g.k, g.c) === 1; });
          return threePart([lin(1, g.a, 'x'), lin(1, g.b, 'x'), lin(g.k, g.c, 'x')], 0, 1);
        } },
        { id: '5b', level: 'PRG', make: function (r) {
          var g = pickWhere(function () { return { a: r.int(2, 6), p: r.int(2, 3), b: r.int(1, 4), q: r.int(2, 3), c: r.int(1, 3) }; }, function (g) { return gcd(g.p, g.b) === 1 && gcd(g.q, g.c) === 1 && cnt(P.mul(lin(1, -g.a, 'h'), lin(g.p, -g.b, 'h'), lin(g.q, -g.c, 'h'))) === 4; });
          return threePart([lin(1, -g.a, 'h'), lin(g.p, -g.b, 'h'), lin(g.q, -g.c, 'h')], 0, 1);
        } },
        { id: '5c', level: 'PRG', make: function (r) {
          var g = pickWhere(function () { return { k: r.int(1, 4), p: r.int(2, 4), q: r.int(1, 5) }; }, function (g) { return g.p !== g.q; });
          var F3 = [lin2(1, 'a', g.k, 'b'), lin2(g.p, 'a', -g.q, 'b'), lin2(g.p, 'a', g.q, 'b')];
          return threePart(F3, 1, 2, { why: 'Take the <b>last two</b> first — they are a sum times a difference, so the middle terms cancel:',
            wrong: [{ is: P.mul(sum(F3[0]), sum([MM(g.p * g.p, { a: 2 }), MM(g.q * g.q, { b: 2 })])), code: 'dsq-sign', hint: t(br(F3[1]) + br(F3[2])) + ' is a difference times a sum: the result is a <b>difference</b> of squares, ' + t(tx(P.mul(sum(F3[1]), sum(F3[2]))) ) + '.' }],
            hints: ['Look for a pair that is a sum times a difference — multiply those first.', 'Then multiply the binomial ' + t(br(F3[0])) + ' by that result and collect like terms.'] });
        } },
        { id: '5d', level: 'PRG', make: function (r) {
          var g = pickWhere(function () { return { p: r.int(2, 3), q: r.int(2, 5), a: r.int(2, 4), b: r.int(1, 3), c: r.int(2, 5) }; }, function (g) { return gcd(g.p, g.q) === 1 && gcd(g.a, g.b) === 1 && cnt(P.mul(lin2(g.p, 'x', g.q, 'y'), lin2(g.a, 'x', -g.b, 'y'), lin2(1, 'x', -g.c, 'y'))) === 4; });
          return threePart([lin2(g.p, 'x', g.q, 'y'), lin2(g.a, 'x', -g.b, 'y'), lin2(1, 'x', -g.c, 'y')], 1, 2, { why: 'Multiply the last two first:' });
        } }] },
      /* ---------- Q6 cube ---------- */
      { num: '6', stem: 'Calculate the volume of the cube shown below.', parts: [
        { id: '6', level: 'PRG', make: function (r) {
          var pq = pickWhere(function () { return [r.int(2, 4), r.int(1, 5)]; }, function (v) { return gcd(v[0], v[1]) === 1; }), p = pq[0], q = pq[1], A = lin(p, q, 'z'), sq = P.pow(sum(A), 2), T = P.pow(sum(A), 3), Sq = termsOf(sq);
          var fig = boxSvg({ w: 2, h: 2, d: [1.25, 0.85], bottom: linLab(A), aria: 'cube with edge ' + plain(seq(A)) });
          return polyPart(fig + 'Write the volume ' + t('V') + ' as an expanded polynomial.', T, [
            { is: P.add(M(p * p * p, 'z', 3), N(q * q * q)), code: 'cube-each', hint: 'The cube doesn’t go onto each term: ' + t(br(A) + '^{3}=' + br(A) + br(A) + br(A)) + '. Square the binomial first, then multiply by ' + t(br(A)) + ' again.' },
            { is: P.mul(sum([M(p * p, 'z', 2), N(q * q)]), sum(A)), code: 'square-middle', hint: 'Check your square: ' + t(br(A) + '^{2}=' + tx(sq)) + ' — don’t forget the middle term ' + t(tx(M(2 * p * q, 'z'))) + '.' },
            { is: sq, code: 'face-area', hint: 'That is the area of one face, ' + t(br(A) + '^{2}') + '. A volume uses all three edges: ' + t('V=' + br(A) + '^{3}') + '.' },
            { is: P.scale(sum(A), 3), code: 'tripled', hint: 'Cubing means multiplying by itself three times, not multiplying by ' + t('3') + '.' }],
            'All three edges of a cube are equal, so ' + t('V=' + br(A) + '^{3}') + '.<br>' + t(br(A) + '^{2}=' + tx(sq)) + '<br>' + distSol(A, Sq, br(Sq) + br(A)),
            ['A cube has equal edges, so ' + t('V=' + br(A) + '^{3}') + '. Square the binomial first, then multiply by ' + t(br(A)) + ' once more.'], 'volume of cube edge ' + plain(seq(A)), { before: t('V=') });
        } }] },
      /* ---------- Q7 prism ---------- */
      { num: '7', stem: 'Calculate the volume of the rectangular prism illustrated.', parts: [
        { id: '7', level: 'PRG', make: function (r) {
          var g = pickWhere(function () { return { p: r.int(2, 4), q: r.int(1, 5), s: r.int(2, 6) }; }, function (g) { return gcd(g.p, g.q) === 1 && cnt(P.mul(P.pow(sum(lin(g.p, g.q, 'x')), 2), sum(lin(1, -g.s, 'x')))) === 4; });
          var A = lin(g.p, g.q, 'x'), H = lin(1, -g.s, 'x'), sq = P.pow(sum(A), 2), Sq = termsOf(sq), T = P.mul(sq, sum(H));
          var fig = boxSvg({ S: 38, w: 3, h: 1.1, d: [1.5, 1.2], left: linLab(H), bottom: linLab(A), right: linLab(A), aria: 'rectangular prism' });
          return polyPart(fig + 'Write the volume ' + t('V') + ' as an expanded polynomial.', T, [
            { is: P.mul(sum(A), sum(H)), code: 'two-dims', hint: 'A volume multiplies <b>three</b> dimensions: two edges are ' + t(br(A)) + ' and one is ' + t(br(H)) + '.' },
            { is: P.pow(sum(A), 3), code: 'not-cube', hint: 'It isn’t a cube — the height is ' + t(br(H)) + '. ' + t('V=' + br(A) + '^{2}' + br(H)) + '.' },
            { is: P.mul(sum([M(g.p * g.p, 'x', 2), N(g.q * g.q)]), sum(H)), code: 'square-middle', hint: 'Check your square: ' + t(br(A) + '^{2}=' + tx(sq)) + ' — don’t forget the middle term.' },
            wThird(Sq, H)],
            'The dimensions are ' + t(br(A)) + ', ' + t(br(A)) + ' and ' + t(br(H)) + ', so ' + t('V=' + br(A) + '^{2}' + br(H)) + '.<br>' + t(br(A) + '^{2}=' + tx(sq)) + '<br>' + distSol(H, Sq, br(Sq) + br(H)),
            ['Read all three edge lengths from the picture: two of them are the same.', t('V=' + br(A) + '^{2}' + br(H)) + ': square first, then multiply by the third dimension.'], 'volume of prism ' + plain(br(A) + '^2' + br(H)), { before: t('V=') });
        } }] },
      /* ---------- Q8 simplify ---------- */
      { num: '8', section: 'Part C — Longer Products', stem: 'Simplify.', parts: [
        { id: '8a', level: 'PRG', make: function (r) {
          var g = { m: r.int(2, 5), c: r.int(2, 5), p: r.int(2, 3), q: r.int(1, 2), d: r.int(1, 4) };
          return expandPart([M(1, 'b', 2), N(g.c)], quad(g.p, -g.q, -g.d, 'b'), { k: -g.m });
        } },
        { id: '8b', level: 'PRG', make: function (r) {
          var g = pickWhere(function () { return { a: r.int(2, 4), b: r.int(1, 3), q: r.int(1, 2), c: r.int(2, 5) }; }, function (g) { return cnt(P.mul(quad(-g.a, -g.b, 1, 'x'), quad(1, -g.q, -g.c, 'x'))) === 5; });
          return expandPart(quad(-g.a, -g.b, 1, 'x'), quad(1, -g.q, -g.c, 'x'), { hints: H_33 });
        } },
        { id: '8c', level: 'ADV', make: function (r) {
          var g = pickWhere(function () { return { m: r.int(2, 4), p: r.int(2, 3), q: r.int(1, 3), s: r.int(2, 4) }; }, function (g) { if (gcd(g.p, g.q) !== 1) return false; var T = P.sub(P.scale(P.pow(sum(lin(g.p, -g.q, 'x')), 2), g.m), P.pow(sum(lin(1, -g.s, 'x')), 3)); return cnt(T) === 4; });
          var A = lin(g.p, -g.q, 'x'), C = lin(1, -g.s, 'x'), sq = P.pow(sum(A), 2), m3 = P.scale(sq, g.m), cs = P.pow(sum(C), 2), cube = P.pow(sum(C), 3), T = P.sub(m3, cube);
          var lead = g.m + br(A) + '^{2}-' + br(C) + '^{3}';
          return polyPart(t(lead), T, [
            { is: P.sub(m3, P.sub(M(1, 'x', 3), N(g.s * g.s * g.s))), code: 'cube-each', hint: t(br(C) + '^{3}') + ' is not ' + t('x^{3}-' + g.s * g.s * g.s) + '. Multiply ' + t(br(C) + br(C) + br(C)) + ': square it first, then multiply by ' + t(br(C)) + '.' },
            { is: P.add(m3, cube, M(-2, 'x', 3)), code: 'minus-first', hint: 'The minus sign in front of ' + t(br(C) + '^{3}') + ' changes the sign of <b>every</b> term of the cube, not just the first.' },
            { is: P.sub(P.pow(sum(lin(g.m * g.p, -g.m * g.q, 'x')), 2), cube), code: 'coef-in', hint: 'The ' + t(g.m) + ' multiplies the square — square ' + t(br(A)) + ' first, <b>then</b> multiply by ' + t(g.m) + '.' },
            { is: P.sub(P.scale(sum([M(g.p * g.p, 'x', 2), N(g.q * g.q)]), g.m), cube), code: 'square-middle', hint: 'Check ' + t(br(A) + '^{2}=' + tx(sq)) + ' — don’t drop the middle term.' }],
            t(br(A) + '^{2}=' + tx(sq)) + ', so ' + t(g.m + br(A) + '^{2}=' + tx(m3)) + '.<br>' + t(br(C) + '^{2}=' + tx(cs)) + ', then ' + t(br(C) + '^{3}=' + br(C) + '\\left(' + tx(cs) + '\\right)=' + tx(cube)) + '.<br>Subtract (the minus sign changes every term of the cube):<br>' + t('\\left(' + tx(m3) + '\\right)-\\left(' + tx(cube) + '\\right)=' + tx(T)),
            ['Expand each part separately: ' + t(g.m + br(A) + '^{2}') + ' and ' + t(br(C) + '^{3}') + ' (square first, then one more factor).', 'Put the cube in brackets before subtracting, so the minus sign reaches every term.'], 'simplify ' + plain(lead));
        } }] },
      /* ---------- Q9 NR ---------- */
      { num: '9', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '9', level: 'ADV', make: function (r) {
          var fm = r.pick(nrForms());
          var g = pickWhere(function () {
            return { a1: r.int(2, 4), b1: -r.int(2, 5), d1: -r.int(3, 9), b2: r.int(1, 3), c2: r.int(2, 6), d2: -r.int(1, 5), p: r.int(2, 3), q: r.int(1, 3), rr: r.int(2, 4), s: r.int(2, 6), u: r.int(1, 4) };
          }, function (g) {
            var S = P.add(sum([M(g.a1, 'x', 3), M(g.b1, 'x', 2), N(g.d1)]), sum([M(g.b2, 'x', 2), M(g.c2, 'x'), N(g.d2)])), Pr = P.mul(sum(lin(g.p, -g.q, 'x')), sum(quad(g.rr, -g.s, g.u, 'x'))), D = P.sub(S, Pr);
            if (gcd(g.p, g.q) !== 1 || cnt(D) !== 4 || cnt(Pr) !== 4) return false;
            var v = fm[1](co(D, { x: 3 }), co(D, { x: 2 }), co(D, { x: 1 })); return v >= 1 && v <= 99;
          });
          var S1 = [M(g.a1, 'x', 3), M(g.b1, 'x', 2), N(g.d1)], S2 = [M(g.b2, 'x', 2), M(g.c2, 'x'), N(g.d2)], A = lin(g.p, -g.q, 'x'), B = quad(g.rr, -g.s, g.u, 'x');
          var S = P.add(sum(S1), sum(S2)), Pr = P.mul(sum(A), sum(B)), D = P.sub(S, Pr);
          function val(Q) { return fm[1](co(Q, { x: 3 }), co(Q, { x: 2 }), co(Q, { x: 1 })); }
          var ans = val(D), a = co(D, { x: 3 }), b = co(D, { x: 2 }), c = co(D, { x: 1 }), d = co(D);
          var foilP = sum([P.mul(A[0], B[0]), P.mul(A[0], B[2]), P.mul(A[1], B[0]), P.mul(A[1], B[2])]);
          var diags = [[val(P.sub(Pr, S)), 'reverse', '“Subtracting the product <b>from</b> the sum” means sum − product, not product − sum.'], [val(P.add(S, Pr)), 'added-prod', 'The product is <b>subtracted</b> from the sum: put it in brackets and change every sign.'],
            [val(P.sub(S, foilP)), 'foil-only', 'Check the product: ' + t(br(A) + br(B)) + ' has ' + t('2\\times 3=6') + ' partial products.']];
          var plainF = fm[0].replace(/(\d)([a-z])/g, '$1$2');
          return KP.nr('Subtracting the product of ' + t(br(A)) + ' and ' + t(br(B)) + ' from the sum of ' + t(br(S1)) + ' and ' + t(br(S2)) + ' results in a polynomial of the form ' + t('ax^{3}+bx^{2}+cx+d') + '. The value of ' + t(plainF) + ' is ________.', ans,
            function (v) { for (var i = 0; i < diags.length; i++) if (v === diags[i][0] && v !== ans) return { code: diags[i][1], hint: diags[i][2] }; return null; },
            'Sum: ' + t(br(S1) + '+' + br(S2) + '=' + tx(S)) + '<br>Product: ' + t(br(A) + br(B) + '=\\left(' + seq(B.map(function (m) { return P.mul(A[0], m); })) + '\\right)+\\left(' + seq(B.map(function (m) { return P.mul(A[1], m); })) + '\\right)=' + tx(Pr)) +
            '<br>Sum − product: ' + t('\\left(' + tx(S) + '\\right)-\\left(' + tx(Pr) + '\\right)=' + tx(D)) + '<br>So ' + t('a=' + a + ',\\ b=' + b + ',\\ c=' + c + ',\\ d=' + d) + ' and ' + t(plainF + '=' + ans) + '.',
            ['Find the sum first, then the product, then subtract the <b>whole</b> product (brackets!).', 'Read ' + t('a') + ', ' + t('b') + ', ' + t('c') + ' from your answer, including their signs.'], 'NR sum − product, ' + fm[0]);
        } }] },
      /* ---------- Q10 MC ---------- */
      { num: '10', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '10', level: 'EMG', make: function (r) {
          var k = r.int(2, 6), v = r.pick(['b', 'b', 'a', 'y', 'm']), kind = r.pick(['L2', 'L2', 'L2', 'L2', 'L3', 'L3', 'OK']);
          var A = lin(1, k, v), sq = P.pow(sum(A), 2), cube = P.pow(sum(A), 3), bad2 = sum([M(1, v, 2), N(k * k)]), bad3 = sum([M(1, v, 3), M(2 * k, v, 2), M(k * k, v), N(k * k * k)]);
          var l2 = kind === 'L2' ? bad2 : sq, l3 = kind === 'L2' ? P.mul(sum(A), bad2) : kind === 'L3' ? bad3 : cube;
          var work = '<table style="margin:6px 0 8px;border-collapse:collapse"><tr><td>' + t(br(A) + '^{3}') + '</td><td></td></tr><tr><td>' + t('=' + br(A) + br(A) + br(A)) + '</td><td style="padding-left:18px">Line 1</td></tr><tr><td>' + t('=' + br(A) + '\\left(' + tx(l2) + '\\right)') + '</td><td style="padding-left:18px">Line 2</td></tr><tr><td>' + t('=' + tx(l3)) + '</td><td style="padding-left:18px">Line 3</td></tr></table>';
          var right = kind === 'L2' ? 1 : kind === 'L3' ? 2 : 3;
          var whyL1 = 'Line 1 just writes the cube as three equal factors — that step is correct.';
          var whyL2 = 'Line 2 is correct: ' + t(br(A) + br(A) + '=' + tx(sq)) + '.';
          var whyL3 = kind === 'L2' ? 'Line 3 is a correct expansion of Line 2: ' + t(br(A) + '\\left(' + tx(bad2) + '\\right)=' + tx(l3)) + '. The mistake happened earlier.' : 'Line 3 is a correct expansion of Line 2.';
          var whyOK = 'Check it: ' + t(br(A) + '^{3}=' + tx(cube)) + '. Does Line 3 match?';
          var opts = [{ html: 'The student made an error in Line 1.', right: right === 0, why: whyL1 }, { html: 'The student made an error in Line 2.', right: right === 1, why: whyL2 },
            { html: 'The student made an error in Line 3.', right: right === 2, why: whyL3 }, { html: 'The student’s expansion is correct.', right: right === 3, why: whyOK }];
          var sol = 'The correct expansion: ' + t(br(A) + '^{2}=' + tx(sq)) + ', so ' + t(br(A) + '^{3}=' + br(A) + '\\left(' + tx(sq) + '\\right)=' + tx(cube)) + '.<br>' +
            (kind === 'L2' ? 'In Line 2 the student squared ' + t(br(A)) + ' as ' + t(tx(bad2)) + ' — the middle term ' + t(tx(M(2 * k, v))) + ' was dropped. Line 3 is computed correctly from that flawed line. The error is in <b>Line 2</b>.'
              : kind === 'L3' ? 'Lines 1 and 2 are correct. In Line 3 only some partial products were formed: ' + t(v) + ' multiplied every term, but ' + t(k) + ' multiplied only the last term. The error is in <b>Line 3</b>.'
                : 'Every line is correct, so the student’s expansion is <b>correct</b>.');
          return mc(r, 'A student attempts to expand ' + t(br(A) + '^{3}') + '. Her work is shown below.' + work + 'Which of the following statements is true?', opts, sol, ['Check each line on its own: is Line 2 really ' + t(br(A) + br(A)) + ' times ' + t(br(A)) + '? Expand ' + t(br(A) + '^{2}') + ' yourself.'], 'error line in (' + v + '+' + k + ')^3 [' + kind + ']', true);
        } }] }
    ],

    extra: [
      /* ---------- EP Part A ---------- */
      { num: '1', section: 'Extra practice A — Six partial products, every time', stem: 'The trinomial is <b>not</b> in descending order. Reorder it first, then multiply (' + t('2\\times 3=6') + ' partial products). Write your answer in <b>descending</b> order.', parts: [
        { id: 'e1a', level: 'PRG', make: function (r) {
          var g = pickWhere(function () { return { p: r.int(2, 3), q: r.int(2, 6), b: r.int(2, 5), c: r.int(1, 5) }; }, function (g) { return gcd(g.p, g.q) === 1 && cnt(P.mul(lin(g.p, -g.q, 'x'), quad(-1, g.b, g.c, 'x'))) === 4; });
          var A = lin(g.p, -g.q, 'x'), Bs = [M(g.b, 'x'), M(-1, 'x', 2), N(g.c)], B = quad(-1, g.b, g.c, 'x');
          return expandPart(A, B, { lead: br(A) + br(Bs), order: 'desc', var: 'x', solPre: 'Reorder: ' + t(seq(B)) + '.<br>' });
        } },
        { id: 'e1b', level: 'PRG', make: function (r) {
          var g = pickWhere(function () { return { p: r.int(2, 4), q: r.int(1, 3), a: r.int(2, 5), s: r.int(2, 5), u: r.int(1, 3) }; }, function (g) { return gcd(g.p, g.q) === 1 && cnt(P.mul(lin2(g.p, 'a', g.q, 'b'), sum([MM(g.a, { a: 2 }), MM(g.u, { a: 1, b: 1 }), MM(-g.s, { b: 2 })]))) === 4; });
          var A = lin2(g.p, 'a', g.q, 'b'), B = [MM(g.a, { a: 2 }), MM(g.u, { a: 1, b: 1 }), MM(-g.s, { b: 2 })], Bs = [B[0], B[2], B[1]];
          return expandPart(A, B, { lead: br(A) + br(Bs), order: 'desc', var: 'a', solPre: 'Reorder: ' + t(seq(B)) + '.<br>' });
        } },
        { id: 'e1c', level: 'PRG', make: function (r) {
          var g = pickWhere(function () { return { c: r.int(3, 9), p: r.int(2, 3), k: r.int(2, 7), m: r.int(2, 6) }; }, function (g) { return gcd(g.p, g.c) === 1 && cnt(P.mul(lin(-g.p, g.c, 'm'), quad(1, g.m, -g.k, 'm'))) === 4; });
          var A = [N(g.c), M(-g.p, 'm')], B = quad(1, g.m, -g.k, 'm'), Bs = [B[0], B[2], B[1]];
          return expandPart(A, B, { lead: br(A) + br(Bs), order: 'desc', var: 'm', solPre: 'Reorder: ' + t(seq(B)) + '.<br>' });
        } },
        { id: 'e1d', level: 'PRG', make: function (r) {
          var g = pickWhere(function () { return { a: r.int(2, 5), b: r.int(2, 4), c: r.int(5, 9), q: r.int(2, 5), s: r.int(1, 3) }; }, function (g) { return gcd(g.a, g.b) === 1 && cnt(P.mul(lin2(g.a, 'p', -g.b, 'q'), sum([MM(g.c, { p: 2 }), MM(-g.q, { p: 1, q: 1 }), MM(g.s, { q: 2 })]))) === 4; });
          var A = lin2(g.a, 'p', -g.b, 'q'), B = [MM(g.c, { p: 2 }), MM(-g.q, { p: 1, q: 1 }), MM(g.s, { q: 2 })], Bs = [B[2], B[0], B[1]];
          return expandPart(A, B, { lead: br(A) + br(Bs), order: 'desc', var: 'p', solPre: 'Reorder: ' + t(seq(B)) + '.<br>' });
        } },
        { id: 'e1e', level: 'PRG', make: function (r) {
          var g = pickWhere(function () { return { c: r.int(2, 5), a: r.int(2, 6), b: r.int(1, 4), d: r.int(3, 9) }; }, function (g) { return g.b !== g.a * g.c; });
          var A = [M(1, 'x', 2), N(g.c)], B = [M(-g.a, 'x', 3), M(g.b, 'x'), N(g.d)], Bs = [B[1], B[0], B[2]];
          return expandPart(A, B, { lead: br(A) + br(Bs), order: 'desc', var: 'x', solPre: 'Reorder: ' + t(seq(B)) + '.<br>' });
        } },
        { id: 'e1f', level: 'PRG', make: function (r) {
          var g = pickWhere(function () { return { p: r.int(2, 4), q: r.int(1, 5), c: r.int(3, 8), b: r.int(2, 5) }; }, function (g) { return gcd(g.p, g.q) === 1 && cnt(P.mul(lin(-g.p, g.q, 'y'), quad(-1, -g.b, g.c, 'y'))) === 4; });
          var A = lin(-g.p, g.q, 'y'), B = quad(-1, -g.b, g.c, 'y'), Bs = [B[2], B[0], B[1]];
          return expandPart(A, B, { lead: br(A) + br(Bs), order: 'desc', var: 'y', solPre: 'Reorder: ' + t(seq(B)) + '.<br>' });
        } }] },
      { num: '2', stem: 'Use the <b>vertical</b> layout: write the trinomial on top and the binomial beneath it, multiply the whole trinomial by each term of the binomial on its own row (like terms in the same column), then add down.', parts: [
        { id: 'e2a', level: 'EMG', make: function (r) {
          var g = pickWhere(function () { return { b: r.int(2, 5), c: r.int(2, 7), p: r.int(2, 3), q: r.int(3, 8) }; }, function (g) { return gcd(g.p, g.q) === 1 && cnt(P.mul(quad(1, -g.b, g.c, 'x'), lin(g.p, -g.q, 'x'))) === 4; });
          return vertPart(quad(1, -g.b, g.c, 'x'), lin(g.p, -g.q, 'x'));
        } },
        { id: 'e2b', level: 'EMG', make: function (r) {
          var g = pickWhere(function () { return { a: r.int(2, 3), b: r.int(1, 3), c: r.int(3, 7), p: r.int(2, 4), q: r.int(1, 5) }; }, function (g) { return gcd(g.p, g.q) === 1 && cnt(P.mul(quad(g.a, g.b, -g.c, 'a'), lin(g.p, g.q, 'a'))) === 4; });
          return vertPart(quad(g.a, g.b, -g.c, 'a'), lin(g.p, g.q, 'a'));
        } },
        { id: 'e2c', level: 'EMG', make: function (r) {
          var g = pickWhere(function () { return { b: r.int(2, 5), c: r.int(1, 3), k: r.int(2, 4) }; }, function (g) { return cnt(P.mul(sum([MM(1, { m: 2 }), MM(-g.b, { m: 1, n: 1 }), MM(g.c, { n: 2 })]), sum(lin2(1, 'm', g.k, 'n')))) === 4; });
          return vertPart([MM(1, { m: 2 }), MM(-g.b, { m: 1, n: 1 }), MM(g.c, { n: 2 })], lin2(1, 'm', g.k, 'n'));
        } },
        { id: 'e2d', level: 'EMG', make: function (r) {
          var g = pickWhere(function () { return { c: r.int(2, 7), b: r.int(1, 4), k: r.int(2, 5) }; }, function (g) { return cnt(P.mul(quad(1, -g.b, g.c, 'k'), lin(1, -g.k, 'k'))) === 4; });
          var Tri = quad(1, -g.b, g.c, 'k');
          return vertPart(Tri, lin(1, -g.k, 'k'), [Tri[2], Tri[1], Tri[0]]);
        } }] },
      { num: '3', stem: 'Expand every bracket <b>completely</b> before you collect anything.', parts: [
        { id: 'e3a', level: 'EMG', make: function (r) {
          var g = pickWhere(function () { return { m: r.int(2, 4), a: r.int(2, 6), b: r.int(1, 5), c: r.int(2, 7) }; }, function (g) { return g.a !== g.b && cnt(P.mul(lin(1, -g.a, 'x'), quad(1, g.b, -g.c, 'x'))) === 4; });
          return expandPart(lin(1, -g.a, 'x'), quad(1, g.b, -g.c, 'x'), { k: g.m });
        } },
        { id: 'e3b', level: 'PRG', make: function (r) {
          var g = pickWhere(function () { return { p: r.int(2, 3), q: r.int(1, 5), b: r.int(1, 3), c: r.int(2, 6), d: r.int(1, 4) }; }, function (g) { return gcd(g.p, g.q) === 1 && cnt(P.mul(lin(g.p, g.q, 'y'), quad(1, -g.b, g.c, 'y'))) === 4; });
          var A = lin(g.p, g.q, 'y'), B = quad(1, -g.b, g.c, 'y'), X = P.mul(sum(A), sum(B)), D = P.sub(M(1, 'y', 2), N(g.d * g.d)), T = P.sub(X, D);
          var lead = br(A) + br(B) + '-' + br(lin(1, -g.d, 'y')) + br(lin(1, g.d, 'y'));
          return polyPart(t(lead), T, [
            { is: P.sub(X, P.add(M(1, 'y', 2), N(g.d * g.d))), code: 'minus-first', hint: t(br(lin(1, -g.d, 'y')) + br(lin(1, g.d, 'y')) + '=' + tx(D)) + '. When you subtract it, <b>both</b> signs change: ' + t('-\\left(' + tx(D) + '\\right)=' + tx(P.neg(D))) + '.' },
            { is: P.add(X, D), code: 'added-prod', hint: 'There is a minus sign in front of the second product: subtract it.' },
            { is: P.sub(wFoil(A, B).is, D), code: 'foil-only', hint: wFoil(A, B).hint }],
            distSol(A, B, br(A) + br(B)) + '<br>Sum times a difference: ' + t(br(lin(1, -g.d, 'y')) + br(lin(1, g.d, 'y')) + '=' + tx(D)) + '<br>' + t('\\left(' + tx(X) + '\\right)-\\left(' + tx(D) + '\\right)=' + tx(T)),
            ['Expand each product on its own, then subtract the second one in brackets.', 'The minus sign changes the sign of every term of ' + t(tx(D)) + '.'], 'expand ' + plain(lead));
        } },
        { id: 'e3c', level: 'PRG', make: function (r) {
          var g = pickWhere(function () { return { b: r.int(1, 3), c: r.int(2, 5), d: r.int(1, 3), e: r.int(1, 3) }; }, function (g) { return cnt(P.mul(quad(1, -g.b, g.c, 'a'), quad(1, g.d, -g.e, 'a'))) >= 4; });
          return expandPart(quad(1, -g.b, g.c, 'a'), quad(1, g.d, -g.e, 'a'), { hints: H_33, prompt: t(br(quad(1, -g.b, g.c, 'a')) + br(quad(1, g.d, -g.e, 'a'))) + ' <span class="muted">(this one needs nine partial products)</span>' });
        } },
        { id: 'e3d', level: 'PRG', make: function (r) {
          var m = r.int(2, 6), k = r.pick([2, 2, 3]), s = r.pick([-1, -1, 1]), A = lin(1, s * k, 'x'), B = quad(1, -s * k, k * k, 'x'), X = P.mul(sum(A), sum(B)), T = P.scale(P.mul(X, M(1, 'x')), m);
          var lead = m + 'x' + br(A) + br(B);
          return polyPart(t(lead), T, [{ is: P.add(M(m, 'x', 4), N(s * k * k * k)), code: 'only-last', hint: 'The ' + t(m + 'x') + ' multiplies <b>every</b> term of ' + t(tx(X)) + ', not just the first.' },
            { is: P.scale(X, m), code: 'no-x', hint: 'Don’t forget the ' + t('x') + ' in the factor ' + t(m + 'x') + '.' }],
            'Multiply the binomial and trinomial first:<br>' + distSol(A, B, br(A) + br(B)) + ' (the middle terms all cancel)<br>Now multiply by ' + t(m + 'x') + ': ' + t(m + 'x\\left(' + tx(X) + '\\right)=' + tx(T)),
            ['Expand ' + t(br(A) + br(B)) + ' first — watch what happens to the middle terms.', 'Then multiply every term by ' + t(m + 'x') + '.'], 'expand ' + plain(lead));
        } }] },
      /* ---------- EP Part B ---------- */
      { num: '4', section: 'Extra practice B — Three binomials: choose your pairing', stem: 'Any two of the three brackets may be multiplied first — but look for the pair that is cheapest (a sum times a difference collapses to a binomial).',
        shared: function (r) { var a = r.int(1, 5), b; do { b = r.int(2, 7); } while (b === a); return { a: a, b: b }; },
        parts: [
          { id: 'e4a', level: 'EMG', make: function (r, sh) { return threePart([lin(1, sh.a, 'x'), lin(1, -sh.a, 'x'), lin(1, sh.b, 'x')], 0, 1, { why: 'Multiply the <b>first and second</b> first — a sum times a difference gives a binomial:' }); } },
          { id: 'e4b', level: 'PRG', make: function (r) {
            var g = pickWhere(function () { return { p: r.int(2, 4), q: r.int(1, 3), a: r.int(2, 3), s: r.int(3, 9) }; }, function (g) { return gcd(g.p, g.q) === 1 && g.s % g.a !== 0 && cnt(P.mul(lin(g.p, -g.q, 'x'), lin(g.a, g.s, 'x'), lin(g.a, -g.s, 'x'))) === 4; });
            return threePart([lin(g.p, -g.q, 'x'), lin(g.a, g.s, 'x'), lin(g.a, -g.s, 'x')], 1, 2, { why: 'Multiply the <b>second and third</b> first — a sum times a difference, so the middle terms vanish:' });
          } },
          { id: 'e4c', level: 'EMG', make: function (r) {
            var g = pickWhere(function () { return { c: r.int(2, 6), b: r.int(1, 5) }; }, function (g) { return g.b !== g.c && cnt(P.mul(lin(1, g.c, 'a'), lin(1, -g.b, 'a'), lin(1, -g.c, 'a'))) === 4; });
            return threePart([lin(1, g.c, 'a'), lin(1, -g.b, 'a'), lin(1, -g.c, 'a')], 0, 2, { why: 'Multiply the <b>first and third</b> first — a sum times a difference collapses to two terms:' });
          } },
          { id: 'e4d', level: 'EMG', make: function (r, sh) {
            var F3 = [lin(1, sh.a, 'x'), lin(1, -sh.a, 'x'), lin(1, sh.b, 'x')], Q = P.mul(sum(F3[1]), sum(F3[2])), T = P.mul(sum(F3[0]), Q), lead = F3.map(br).join('');
            var p = KP.fields('Expand ' + t(lead) + ' (part (a)) a second time, this time multiplying the <b>second</b> and <b>third</b> brackets first.',
              [box(t(br(F3[1]) + br(F3[2]) + '='), ['x'], { name: 'Second × third' }), box('Then ' + t(br(F3[0]) + '\\times') + ' that ' + t('='), ['x'], { name: 'The cubic' }),
                box('Terms carried through the middle step this way:', ['x'], { name: 'Terms (2nd × 3rd first)' }), box('Terms carried when the 1st and 2nd are paired first:', ['x'], { name: 'Terms (1st × 2nd first)' })],
              [polyChk(Q, [{ is: P.sub(M(1, 'x', 2), N(sh.a * sh.b)), code: 'foil-only', hint: 'Don’t forget the Outer and Inner products: ' + t(tx(M(sh.b, 'x')) + '+' + tx(M(-sh.a, 'x'))) + '.' }]), polyChk(T),
                intChk(3, function (v) { return v === 2 ? { code: 'count', hint: 'Count the terms of ' + t(tx(Q)) + '.' } : null; }), intChk(2, function (v) { return v === 3 ? { code: 'count', hint: 'Pairing the 1st and 2nd gives ' + t(tx(P.mul(sum(F3[0]), sum(F3[1])))) + ' — how many terms is that?' } : null; })],
              [tx(Q), tx(T), '3', '2'], t(br(F3[1]) + br(F3[2]) + '=' + tx(Q)) + '; ' + t(lead + '=' + tx(T)) + '; ' + t('3') + ' terms this way, ' + t('2') + ' the other way.',
              pairLine(F3[1], F3[2]) + '<br>' + distSol(F3[0], termsOf(Q), br(F3[0]) + '\\left(' + tx(Q) + '\\right)') + ' — the same cubic as in (a).<br>Pairing the 1st and 2nd carried the <b>two</b>-term ' + t(tx(P.mul(sum(F3[0]), sum(F3[1])))) + ' through the middle; pairing the 2nd and 3rd carried the <b>three</b>-term ' + t(tx(Q)) + '.',
              ['FOIL the second and third brackets, then multiply that trinomial by ' + t(br(F3[0])) + '.', 'Whichever pair you choose first, the final cubic is the same.'], 'second pairing ' + plain(lead));
            return p;
          } },
          { id: 'e4e', level: 'EMG', make: function (r) {
            var kind = r.int(0, 2), a = r.int(2, 6), b, F3, pair;
            do { b = r.int(1, 7); } while (b === a);
            if (kind === 0) { F3 = [lin(1, a, 'x'), lin(1, -a, 'x'), lin(1, b, 'x')]; pair = [0, 1]; }
            else if (kind === 1) { F3 = [lin(1, b, 'x'), lin(1, a, 'x'), lin(1, -a, 'x')]; pair = [1, 2]; }
            else { F3 = [lin(1, a, 'x'), lin(1, -b, 'x'), lin(1, -a, 'x')]; pair = [0, 2]; }
            var lead = F3.map(br).join(''), names = ['first', 'second', 'third'], ds = P.mul(sum(F3[pair[0]]), sum(F3[pair[1]]));
            var pairs = [[0, 1], [1, 2], [0, 2]], opts = pairs.map(function (pp) {
              var right = pp[0] === pair[0] && pp[1] === pair[1], pr = P.mul(sum(F3[pp[0]]), sum(F3[pp[1]]));
              return { html: 'The ' + names[pp[0]] + ' and ' + names[pp[1]] + ' brackets, ' + t(br(F3[pp[0]]) + br(F3[pp[1]])) + (right ? ': a sum times a difference, so the result is only a binomial.' : '.'), right: right,
                why: right ? null : 'That pair gives the trinomial ' + t(tx(pr)) + ', so the second stage needs ' + t('3\\times 2=6') + ' products. Look for a sum times a difference.' };
            });
            opts.push({ html: 'It makes no difference — every pairing is the same amount of work.', why: 'Every pairing gives the same answer, but not the same work: a sum times a difference gives a binomial, so the second stage has only ' + t('2\\times 2=4') + ' products.' });
            return mc(r, 'For ' + t(lead) + ', which pair is the cheapest to multiply first?', opts,
              'The ' + names[pair[0]] + ' and ' + names[pair[1]] + ' brackets are a sum times a difference: ' + t(br(F3[pair[0]]) + br(F3[pair[1]]) + '=' + tx(ds)) + ' (a binomial). Then only ' + t('2\\times 2=4') + ' partial products remain.',
              ['Which two brackets have the same terms with opposite signs between them?'], 'cheapest pairing ' + plain(lead));
          } }] },
      { num: '5', stem: 'Two of the three brackets must be FOILed, and the result multiplied by the third binomial. Watch for a first pair whose product is only a binomial.', parts: [
        { id: 'e5a', level: 'PRG', make: function (r) {
          var g = pickWhere(function () { return { p: r.int(2, 3), q: r.int(1, 5), a: r.int(1, 5), s: r.int(2, 4), c: r.int(1, 3) }; }, function (g) { return gcd(g.p, g.q) === 1 && gcd(g.s, g.c) === 1 && cnt(P.mul(lin(g.p, -g.q, 'x'), lin(1, g.a, 'x'), lin(g.s, -g.c, 'x'))) === 4 && cnt(P.mul(lin(g.p, -g.q, 'x'), lin(1, g.a, 'x'))) === 3; });
          return threePart([lin(g.p, -g.q, 'x'), lin(1, g.a, 'x'), lin(g.s, -g.c, 'x')], 0, 1);
        } },
        { id: 'e5b', level: 'PRG', make: function (r) {
          var k = r.int(1, 4), m; do { m = r.int(1, 5); } while (m === k);
          return threePart([lin2(1, 'a', -k, 'b'), lin2(1, 'a', k, 'b'), lin2(1, 'a', m, 'b')], 0, 1, { why: 'The first two are a sum times a difference, so the first stage gives a binomial:' });
        } },
        { id: 'e5c', level: 'PRG', make: function (r) {
          var g = pickWhere(function () { return { a: r.int(2, 6), b: r.int(1, 5), p: r.int(2, 3), c: r.int(1, 3) }; }, function (g) { return g.a !== g.b && gcd(g.p, g.c) === 1 && cnt(P.mul(lin(1, -g.a, 'y'), lin(1, -g.b, 'y'), lin(g.p, g.c, 'y'))) === 4; });
          return threePart([lin(1, -g.a, 'y'), lin(1, -g.b, 'y'), lin(g.p, g.c, 'y')], 0, 1);
        } }] },
      /* ---------- EP Part C ---------- */
      { num: '6', section: 'Extra practice C — Cubing a binomial', stem: 'A cube is a square times one more copy: square the binomial, then multiply that trinomial by the binomial again.', parts: [
        { id: 'e6a', level: 'EMG', make: function (r) {
          var k = r.int(2, 6), A = lin(1, k, 'x'), sq = P.pow(sum(A), 2), cube = P.pow(sum(A), 3);
          return KP.fields('Build ' + t(br(A) + '^{3}') + ' in two stages.', [box(t(br(A) + '^{2}='), ['x'], { name: 'Square' }), box(t(br(A) + '^{3}='), ['x'], { name: 'Cube' })],
            [polyChk(sq, [{ is: P.add(M(1, 'x', 2), N(k * k)), code: 'square-middle', hint: t(br(A) + '^{2}=' + br(A) + br(A)) + ' has a middle term: ' + t('2(x)(' + k + ')=' + 2 * k + 'x') + '.' }]),
              polyChk(cube, [{ is: P.add(M(1, 'x', 3), N(k * k * k)), code: 'cube-each', hint: 'The cube doesn’t go onto each term — multiply your square by ' + t(br(A)) + '.' }])],
            [tx(sq), tx(cube)], t(br(A) + '^{2}=' + tx(sq)) + ', ' + t(br(A) + '^{3}=' + tx(cube)),
            t(br(A) + '^{2}=' + tx(sq)) + '<br>' + distSol(A, termsOf(sq), br(A) + '\\left(' + tx(sq) + '\\right)'),
            ['Square first: ' + t(br(A) + br(A)) + ' (FOIL).', 'Then multiply that trinomial by ' + t(br(A)) + ': six partial products.'], 'cube in stages ' + plain(br(A)) + '^3');
        } },
        { id: 'e6b', level: 'EMG', make: function (r) { return cubePart(lin(1, -r.int(2, 5), 'x')); } },
        { id: 'e6c', level: 'PRG', make: function (r) { var v = pickWhere(function () { return [r.int(2, 3), r.int(1, 3)]; }, function (v) { return gcd(v[0], v[1]) === 1; }); return cubePart(lin(v[0], v[1], 'x')); } },
        { id: 'e6d', level: 'PRG', make: function (r) { var L = r.pick([['a', 'b'], ['a', 'b'], ['m', 'n'], ['p', 'q'], ['x', 'y']]); return cubePart(lin2(1, L[0], 1, L[1]), 'Keep ' + t(L[0]) + ' and ' + t(L[1]) + ' as letters.'); } }] },
      { num: '7', stem: 'Look back at your expansions of cubes in Question 6.', parts: [
        { id: 'e7a', level: 'EMG', make: function (r) {
          var L = r.pick([['a', 'b'], ['a', 'b'], ['m', 'n'], ['p', 'q']]), a = L[0], b = L[1];
          return mc(r, 'Every expansion of ' + t('(' + a + '+' + b + ')^{3}') + ' has four terms. Which describes the pattern?', [
            { html: 'Coefficients ' + t('1,\\ 3,\\ 3,\\ 1') + '; reading left to right, the exponent of ' + t(a) + ' goes down ' + t('3,2,1,0') + ' while the exponent of ' + t(b) + ' goes up ' + t('0,1,2,3') + '.', right: true },
            { html: 'Coefficients ' + t('1,\\ 2,\\ 2,\\ 1') + '; the exponent of ' + t(a) + ' goes down while the exponent of ' + t(b) + ' goes up.', why: 'That would be ' + t('1,2,1') + ' for a square, stretched. Expand ' + t('(' + a + '+' + b + ')(' + a + '^{2}+2' + a + b + '+' + b + '^{2})') + ': the middle coefficients are ' + t('2+1=3') + '.' },
            { html: 'Coefficients ' + t('1,\\ 3,\\ 3,\\ 1') + '; every term has ' + t(a) + ' and ' + t(b) + ' each to the power ' + t('3') + '.', why: 'Look at ' + t('3' + a + '^{2}' + b) + ': the exponents are ' + t('2') + ' and ' + t('1') + '. They always add to ' + t('3') + '.' },
            { html: 'Coefficients ' + t('1,\\ 3,\\ 9,\\ 27') + '; each coefficient is ' + t('3') + ' times the one before.', why: 'Check with ' + t('(x+1)^{3}=x^{3}+3x^{2}+3x+1') + ': the coefficients are symmetric, ' + t('1,3,3,1') + '.' }],
            t('(' + a + '+' + b + ')^{3}=1' + a + '^{3}+3' + a + '^{2}' + b + '+3' + a + b + '^{2}+1' + b + '^{3}') + '. The coefficients are ' + t('1,3,3,1') + '; the exponent of ' + t(a) + ' falls ' + t('3,2,1,0') + ' and the exponent of ' + t(b) + ' rises ' + t('0,1,2,3') + ', so every term has total degree ' + t('3') + '.',
            ['Write out ' + t('(' + a + '+' + b + ')^{3}') + ' from Question 6 and read the coefficients and exponents term by term.'], 'cube pattern');
        } },
        { id: 'e7b', level: 'EMG', make: function (r) {
          var L = r.pick([['a', 'b'], ['a', 'b'], ['m', 'n'], ['x', 'y']]), a = L[0], b = L[1];
          var full = a + '^{3}-3' + a + '^{2}' + b + '+3' + a + b + '^{2}-' + b + '^{3}';
          return mc(r, 'When the binomial is a difference, ' + t('(' + a + '-' + b + ')^{3}') + ', which terms turn negative, and why?', [
            { html: 'The 2nd and 4th terms, ' + t('-3' + a + '^{2}' + b) + ' and ' + t('-' + b + '^{3}') + ': they contain an <b>odd</b> power of ' + t('-' + b) + '.', right: true },
            { html: 'Every term after the first, because there is a minus sign in the bracket.', why: 'The third term contains ' + t('(-' + b + ')^{2}') + ', and a negative squared is positive.' },
            { html: 'Only the last term, ' + t('-' + b + '^{3}') + ': the minus sign belongs to ' + t(b) + ' alone.', why: 'The term ' + t('3' + a + '^{2}(-' + b + ')') + ' also contains ' + t('-' + b) + ' once, so it is negative too.' },
            { html: 'The 2nd and 3rd terms, the middle ones.', why: 'The 3rd term has ' + t('(-' + b + ')^{2}=' + b + '^{2}') + ' (positive), but the 4th has ' + t('(-' + b + ')^{3}=-' + b + '^{3}') + '.' }],
            'Think of it as ' + t('(' + a + '+(-' + b + '))^{3}') + ': ' + t('(' + a + '-' + b + ')^{3}=' + full) + '. The signs alternate: an odd power of ' + t('-' + b) + ' is negative, an even power is positive.',
            ['Write ' + t('(' + a + '-' + b + ')^{3}') + ' as ' + t('(' + a + '+(-' + b + '))^{3}') + ' and use the pattern ' + t('1,3,3,1') + '.'], 'signs of (a-b)^3');
        } },
        { id: 'e7c', level: 'EMG', make: function (r) {
          var k = r.int(2, 6), A = lin(1, k, 'x'), T = P.pow(sum(A), 3);
          return polyPart('Use the pattern (don’t multiply out in stages) to write ' + t(br(A) + '^{3}') + '.', T, [
            { is: P.add(M(1, 'x', 3), N(k * k * k)), code: 'cube-each', hint: 'The pattern has four terms: ' + t('a^{3}+3a^{2}b+3ab^{2}+b^{3}') + '.' },
            { is: sum([M(1, 'x', 3), M(k, 'x', 2), M(k * k, 'x'), N(k * k * k)]), code: 'no-3', hint: 'You forgot the coefficients ' + t('1,3,3,1') + ': the middle terms are ' + t('3x^{2}(' + k + ')') + ' and ' + t('3x(' + k + ')^{2}') + '.' }],
            t(br(A) + '^{3}=x^{3}+3x^{2}(' + k + ')+3x(' + k + ')^{2}+' + k + '^{3}=' + tx(T)),
            ['Use ' + t('(a+b)^{3}=a^{3}+3a^{2}b+3ab^{2}+b^{3}') + ' with ' + t('a=x') + ' and ' + t('b=' + k) + '.'], 'cube by pattern ' + plain(br(A)));
        } },
        { id: 'e7d', level: 'PRG', make: function (r) {
          var pq = pickWhere(function () { return [r.int(2, 3), r.int(1, 3)]; }, function (v) { return gcd(v[0], v[1]) === 1; }), p = pq[0], q = pq[1], A = lin2(p, 'm', -q, 'n'), T = P.pow(sum(A), 3), pm = p + 'm', qn = '(-' + q + 'n)';
          return polyPart('Use the pattern (don’t multiply out in stages) to write ' + t(br(A) + '^{3}') + '.', T, [
            { is: P.sub(MM(p * p * p, { m: 3 }), MM(q * q * q, { n: 3 })), code: 'cube-each', hint: 'The pattern has four terms: ' + t('a^{3}+3a^{2}b+3ab^{2}+b^{3}') + ' with ' + t('a=' + pm) + ', ' + t('b=-' + q + 'n') + '.' },
            { is: sum([MM(p, { m: 3 }), MM(-3 * p * q, { m: 2, n: 1 }), MM(3 * p * q * q, { m: 1, n: 2 }), MM(-q * q * q, { n: 3 })]), code: 'coef-in', hint: 'Raise the whole term to the power: ' + t('(' + pm + ')^{3}=' + p * p * p + 'm^{3}') + ' and ' + t('(' + pm + ')^{2}=' + p * p + 'm^{2}') + '.' }],
            t(br(A) + '^{3}=(' + pm + ')^{3}+3(' + pm + ')^{2}' + qn + '+3(' + pm + ')' + qn + '^{2}+' + qn + '^{3}') + '<br>' + t('=' + tx(T)),
            ['Use ' + t('(a+b)^{3}=a^{3}+3a^{2}b+3ab^{2}+b^{3}') + ' with ' + t('a=' + pm) + ' and ' + t('b=-' + q + 'n') + '.', 'Put each term in brackets before raising it to a power: ' + t('(' + pm + ')^{2}=' + p * p + 'm^{2}') + '.'], 'cube by pattern ' + plain(br(A)));
        } },
        { id: 'e7e', level: 'EMG', make: function (r) {
          var k = r.int(2, 6), A = lin(1, -k, 'x'), T = P.pow(sum(A), 3), v = Math.pow(1 - k, 3);
          var p = KP.fields('Write ' + t(br(A) + '^{3}') + ' from the pattern, then check by substituting ' + t('x=1') + ' into both.',
            [box(t(br(A) + '^{3}='), ['x'], { name: 'Expansion' }), box(t(br(A) + '^{3}') + ' at ' + t('x=1') + ':', ['x'], { name: 'Product at x = 1' }), box('Your four terms at ' + t('x=1') + ':', ['x'], { name: 'Expansion at x = 1' })],
            [polyChk(T, [{ is: P.sub(M(1, 'x', 3), N(k * k * k)), code: 'cube-each', hint: 'Four terms: ' + t('a^{3}-3a^{2}b+3ab^{2}-b^{3}') + '.' }]), intChk(v), intChk(v)], [tx(T), String(v), String(v)],
            t(br(A) + '^{3}=' + tx(T)) + '; both sides equal ' + t(v) + ' at ' + t('x=1') + '.',
            t(br(A) + '^{3}=x^{3}-3x^{2}(' + k + ')+3x(' + k + ')^{2}-' + k + '^{3}=' + tx(T)) + '<br>Check at ' + t('x=1') + ': ' + t('(1-' + k + ')^{3}=(' + (1 - k) + ')^{3}=' + v) + ' and ' + t(atTex(T, 1, 'x') + '=' + v) + ' ✓',
            ['Pattern with a minus: ' + t('(a-b)^{3}=a^{3}-3a^{2}b+3ab^{2}-b^{3}') + '.', 'At ' + t('x=1') + ', every power of ' + t('x') + ' is ' + t('1') + ', so just add the coefficients.'], 'pattern + check ' + plain(br(A)) + '^3');
          return p;
        } },
        { id: 'e7f', level: 'ADV', make: function (r) {
          var L = r.pick([['a', 'b'], ['a', 'b'], ['x', 'y']]), a = L[0], b = L[1], labs = [a + '^{4}', a + '^{3}' + b, a + '^{2}' + b + '^{2}', a + b + '^{3}', b + '^{4}'], want = [1, 4, 6, 4, 1];
          return KP.fields('The coefficients of ' + t('(' + a + '+' + b + ')^{2}') + ' are ' + t('1,2,1') + ' and those of ' + t('(' + a + '+' + b + ')^{3}') + ' are ' + t('1,3,3,1') + '. Predict the five coefficients of ' + t('(' + a + '+' + b + ')^{4}') + '.',
            labs.map(function (l) { return box('Coefficient of ' + t(l) + ':', [a, b], { name: l.replace(/[{}]/g, ''), wide: false }); }),
            want.map(function (w, i) { return intChk(w, function (v) { return i === 2 && v === 3 ? { code: 'value', hint: 'Each inside entry is the <b>sum of the two entries above it</b> in ' + t('1,3,3,1') + '.' } : (i === 1 || i === 3) && v === 3 ? { code: 'value', hint: 'Add the two entries above it: ' + t('1+3') + '.' } : null; }); }),
            want.map(String), t('1,\\ 4,\\ 6,\\ 4,\\ 1'),
            'Start and end with ' + t('1') + '; each entry in between is the sum of the two entries above it in ' + t('1,3,3,1') + ': ' + t('1,\\ 1+3=4,\\ 3+3=6,\\ 3+1=4,\\ 1') + '.<br>So ' + t('(' + a + '+' + b + ')^{4}=' + a + '^{4}+4' + a + '^{3}' + b + '+6' + a + '^{2}' + b + '^{2}+4' + a + b + '^{3}+' + b + '^{4}') + '.',
            ['Compare the rows ' + t('1,2,1') + ' and ' + t('1,3,3,1') + ': how is each inside number of the second row made from the row above it?'], 'predict (a+b)^4 coefficients');
        } }] },
      /* ---------- EP Part D ---------- */
      { num: '8', section: 'Extra practice D — Working backwards from a cubic', stem: 'One factor has been erased. Determine it (it has whole-number coefficients), and check by expanding.', parts: [
        { id: 'e8a', level: 'ADV', make: function (r) {
          var c = r.int(1, 5), b = r.int(1, 5), d = r.int(1, 6), A = lin(1, c, 'x'), Q = quad(1, b, d, 'x'), T = P.mul(sum(A), sum(Q));
          return polyPart(t(br(A) + '\\big(\\underline{\\qquad\\qquad}\\big)=' + tx(T)) + '<br>Missing factor:', sum(Q), [{ is: P.add(M(1, 'x', 2), N(co(T) / c)), code: 'missing-term', hint: 'The missing factor must be a trinomial ' + t('x^{2}+bx+c') + ': use the ' + t('x^{2}') + ' column to find ' + t('b') + '.' }],
            t('x\\times x^{2}=x^{3}') + ', so the missing factor is ' + t('x^{2}+bx+c') + '.<br>Constant: ' + t(c + 'c=' + co(T)) + ', so ' + t('c=' + d) + '.<br>' + t('x^{2}') + ' column: ' + t('b+' + c + '=' + co(T, { x: 2 })) + ', so ' + t('b=' + b) + '.<br>Missing factor: ' + t(seq(Q)) + '. Check: ' + t(br(A) + br(Q) + '=' + tx(T)) + ' ✓',
            ['The first term must be ' + t('x^{2}') + ' (to make ' + t('x^{3}') + '). Then match the constant term, then the ' + t('x^{2}') + ' term.'], 'missing trinomial for ' + plain(tx(T)));
        } },
        { id: 'e8b', level: 'ADV', make: function (r) {
          var g = pickWhere(function () { return { p: r.int(2, 3), q: r.int(1, 5), b: r.int(1, 4), c: r.int(2, 7) }; }, function (g) { return gcd(g.p, g.q) === 1 && cnt(P.mul(lin(g.p, -g.q, 'x'), quad(1, -g.b, g.c, 'x'))) === 4; });
          var A = lin(g.p, -g.q, 'x'), Q = quad(1, -g.b, g.c, 'x'), T = P.mul(sum(A), sum(Q));
          return polyPart(t('\\big(\\underline{\\qquad\\qquad}\\big)' + br(Q) + '=' + tx(T)) + '<br>Missing factor:', sum(A), [{ is: sum(lin(g.p, g.q, 'x')), code: 'sign', hint: 'Check the sign: ' + t('(\\ ?\\ )\\times ' + g.c + '=' + co(T)) + '.' }],
            t(g.p + 'x^{3}\\div x^{2}=' + g.p + 'x') + ', so the missing factor is ' + t(g.p + 'x+q') + '.<br>Constant: ' + t(g.c + 'q=' + co(T)) + ', so ' + t('q=' + (-g.q)) + '.<br>Missing factor: ' + t(seq(A)) + '. Check: ' + t(br(A) + br(Q) + '=' + tx(T)) + ' ✓',
            ['The first term times ' + t('x^{2}') + ' must give ' + t(g.p + 'x^{3}') + '. The constant times ' + t(g.c) + ' must give ' + t(co(T)) + '.'], 'missing binomial for ' + plain(tx(T)));
        } },
        { id: 'e8c', level: 'ADV', make: function (r) {
          var g = pickWhere(function () { return { a: r.int(1, 4), b: r.int(2, 6), c: r.int(1, 5) }; }, function (g) { return g.a !== g.b && g.c !== g.a && cnt(P.mul(lin(1, -g.a, 'x'), lin(1, g.b, 'x'), lin(1, g.c, 'x'))) === 4; });
          var A = lin(1, -g.a, 'x'), B = lin(1, g.b, 'x'), C = lin(1, g.c, 'x'), AB = P.mul(sum(A), sum(B)), T = P.mul(AB, sum(C));
          return polyPart(t(br(A) + br(B) + '\\big(\\underline{\\qquad\\qquad}\\big)=' + tx(T)) + '<br>Missing factor:', sum(C), [{ is: sum(lin(1, -g.c, 'x')), code: 'sign', hint: 'Check the sign: ' + t('(' + (-g.a * g.b) + ')\\times(\\ ?\\ )=' + co(T)) + '.' }],
            'Combine the known factors: ' + t(br(A) + br(B) + '=' + tx(AB)) + '.<br>The missing factor is ' + t('x+q') + ', and the constant gives ' + t(co(AB) + 'q=' + co(T)) + ', so ' + t('q=' + g.c) + '.<br>Missing factor: ' + t(seq(C)) + '. Check: ' + t('\\left(' + tx(AB) + '\\right)' + br(C) + '=' + tx(T)) + ' ✓',
            ['Multiply the two known binomials first.', 'Then the missing factor is ' + t('x+q') + ': match the constant term.'], 'missing third binomial for ' + plain(tx(T)));
        } },
        { id: 'e8d', level: 'PRG', make: function (r) {
          var k = r.int(2, 5), T = P.pow(sum(lin(1, k, 'x')), 3);
          return KP.number(t('(x+k)^{3}=' + tx(T)) + '. Determine ' + t('k') + '.', k, function (v) { return v === -k ? { code: 'cube-sign', hint: 'Check: ' + t('(' + (-k) + ')^{3}=' + (-k * k * k)) + ', not ' + t(k * k * k) + '.' } : v === 3 * k ? { code: 'value', hint: 'That’s the ' + t('x^{2}') + ' coefficient, ' + t('3k') + '. Solve ' + t('3k=' + 3 * k) + ' or ' + t('k^{3}=' + k * k * k) + '.' } : null; },
            t('(x+k)^{3}=x^{3}+3kx^{2}+3k^{2}x+k^{3}') + '. Constant: ' + t('k^{3}=' + k * k * k) + ', so ' + t('k=' + k) + '. Check: ' + t('3k=' + 3 * k) + ' ✓ and ' + t('3k^{2}=' + 3 * k * k) + ' ✓',
            ['Use the cube pattern: the constant term is ' + t('k^{3}') + ' and the ' + t('x^{2}') + ' coefficient is ' + t('3k') + '.'], '(x+k)^3 find k', { before: t('k=') });
        } },
        { id: 'e8e', level: 'PRG', make: function (r) {
          var k = r.int(2, 5), T = P.pow(sum(lin(1, k, 'x')), 3);
          return mc(r, 'For ' + t('(x+k)^{3}=' + tx(T)) + ', Yuki uses only the constant term: ' + t('k^{3}=' + k * k * k) + '. Ali uses only the ' + t('x') + ' term: ' + t('3k^{2}=' + 3 * k * k) + '. Which is true?', [
            { html: 'Only Yuki’s term settles ' + t('k') + ' on its own: Ali’s equation gives ' + t('k^{2}=' + k * k) + ', so ' + t('k=' + k) + ' <b>or</b> ' + t('k=-' + k) + '.', right: true },
            { html: 'Both terms settle ' + t('k') + ' on its own.', why: 'Solve Ali’s equation: ' + t('k^{2}=' + k * k) + ' has two solutions. Which one is right can’t be told from that term alone.' },
            { html: 'Only Ali’s term settles ' + t('k') + '; a cube root can be positive or negative.', why: 'A cube root has only one real value: ' + t('k^{3}=' + k * k * k) + ' gives just ' + t('k=' + k) + '. It’s the <b>square</b> root that has two.' },
            { html: 'Neither term settles ' + t('k') + '; you need the whole expansion.', why: 'One equation in one unknown can be enough. Try solving ' + t('k^{3}=' + k * k * k) + '.' }],
            'Constant: ' + t('k^{3}=' + k * k * k) + ' gives only ' + t('k=' + k) + '. The ' + t('x') + ' term gives ' + t('3k^{2}=' + 3 * k * k) + ', so ' + t('k^{2}=' + k * k) + ' and ' + t('k=\\pm' + k) + ' — two possibilities. (The ' + t('x^{2}') + ' term, ' + t('3k=' + 3 * k) + ', would also settle it.)',
            ['Solve each equation for ' + t('k') + '. How many solutions does each have?'], 'which term settles k');
        } }] },
      { num: '9', stem: 'Determine the value of each unknown coefficient. Every unknown stands for an integer. Match one column at a time.', parts: [
        { id: 'e9a', level: 'ADV', make: function (r) {
          var g = pickWhere(function () { return { c: r.int(2, 4), a: r.int(-3, 3), b: r.int(-8, 8) }; }, function (g) { return g.a !== 0 && g.b !== 0 && cnt(P.mul(lin(1, g.c, 'x'), quad(1, g.a, g.b, 'x'))) === 4; });
          var T = P.mul(sum(lin(1, g.c, 'x')), sum(quad(1, g.a, g.b, 'x')));
          return KP.fields(t(br(lin(1, g.c, 'x')) + '\\left(x^{2}+ax+b\\right)=' + tx(T)), [box(t('a='), ['x'], { name: 'a', wide: false }), box(t('b='), ['x'], { name: 'b', wide: false })],
            [intChk(g.a, function (v) { return v === co(T, { x: 2 }) ? { code: 'value', hint: 'The ' + t('x^{2}') + ' term comes from two products: ' + t('x\\cdot ax') + ' and ' + t(g.c + '\\cdot x^{2}') + '. So ' + t('a+' + g.c + '=' + co(T, { x: 2 })) + '.' } : null; }),
              intChk(g.b, function (v) { return v === co(T) ? { code: 'value', hint: 'The constant term is ' + t(g.c + 'b') + ', so ' + t(g.c + 'b=' + co(T)) + '.' } : null; })],
            [String(g.a), String(g.b)], t('a=' + g.a + ',\\ b=' + g.b),
            'Constant column: ' + t(g.c + 'b=' + co(T)) + ', so ' + t('b=' + g.b) + '.<br>' + t('x^{2}') + ' column: ' + t('a+' + g.c + '=' + co(T, { x: 2 })) + ', so ' + t('a=' + g.a) + '.<br>Check the ' + t('x') + ' column: ' + t('b+' + g.c + 'a=' + pv(g.b) + '+' + g.c + pv(g.a).replace(/^(\d)/, '($1)').replace(/^\(\(/, '(') + '=' + co(T, { x: 1 })) + ' ✓',
            ['Only one product makes the constant term: ' + t(g.c + '\\times b') + '.', 'Two products make the ' + t('x^{2}') + ' term: ' + t('x\\cdot ax') + ' and ' + t(g.c + '\\cdot x^{2}') + '.'], 'find a, b: ' + plain(tx(T)));
        } },
        { id: 'e9b', level: 'PRG', make: function (r) {
          var g = pickWhere(function () { return { p: r.int(2, 4), q: r.int(1, 3), rr: r.int(2, 6), k: r.int(2, 9) }; }, function (g) { return gcd(g.p, g.q) === 1 && cnt(P.mul(lin(g.p, -g.q, 'x'), quad(1, g.rr, g.k, 'x'))) === 4; });
          var A = lin(g.p, -g.q, 'x'), Q = quad(1, g.rr, g.k, 'x'), T = P.mul(sum(A), sum(Q)), c0 = -g.q * g.k;
          return KP.fields('In ' + t(br(A) + '\\left(x^{2}+' + g.rr + 'x+k\\right)') + ' the constant term is ' + t(c0) + '. Determine ' + t('k') + ', then the full expansion.',
            [box(t('k='), ['x'], { name: 'k', wide: false }), box('Expansion:', ['x'], { name: 'Expansion' })],
            [intChk(g.k, function (v) { return v === -g.k ? { code: 'sign', hint: t('(-' + g.q + ')\\times k=' + c0) + ': a negative times what gives ' + t(c0) + '?' } : null; }), polyChk(T, [wFoil(A, Q)])], [String(g.k), tx(T)], t('k=' + g.k) + '; ' + t(tx(T)),
            'Constant: ' + t('(-' + g.q + ')(k)=' + c0) + ', so ' + t('k=' + g.k) + '.<br>' + distSol(A, Q, br(A) + br(Q)),
            ['The constant term comes from one product only: ' + t('(-' + g.q + ')\\times k') + '.'], 'find k then expand ' + plain(br(A)));
        } },
        { id: 'e9c', level: 'ADV', make: function (r) {
          var g = pickWhere(function () { return { p: r.int(2, 3), a: r.int(1, 5), rr: r.int(2, 4), s: r.int(2, 6) }; }, function (g) { var c1 = g.p * g.s - g.a * g.rr; return gcd(g.p, g.a) === 1 && c1 !== 0 && cnt(P.mul(lin(g.p, g.a, 'x'), quad(1, -g.rr, g.s, 'x'))) === 4; });
          var A = lin(g.p, g.a, 'x'), Q = quad(1, -g.rr, g.s, 'x'), T = P.mul(sum(A), sum(Q)), c1 = g.p * g.s - g.a * g.rr;
          return KP.fields('In ' + t('(' + g.p + 'x+a)' + br(Q)) + ' the coefficient of ' + t('x') + ' is ' + t(c1) + '. Determine ' + t('a') + ', then the full expansion.',
            [box(t('a='), ['x'], { name: 'a', wide: false }), box('Expansion:', ['x'], { name: 'Expansion' })],
            [intChk(g.a), polyChk(T, [wFoil(A, Q)])], [String(g.a), tx(T)], t('a=' + g.a) + '; ' + t(tx(T)),
            t('x') + ' column: ' + t(g.p + 'x(' + g.s + ')+a(-' + g.rr + 'x)=(' + g.p * g.s + '-' + g.rr + 'a)x') + '.<br>' + t(g.p * g.s + '-' + g.rr + 'a=' + c1) + ', so ' + t('-' + g.rr + 'a=' + (c1 - g.p * g.s)) + ' and ' + t('a=' + g.a) + '.<br>' + distSol(A, Q, br(A) + br(Q)),
            ['Two products make the ' + t('x') + ' term: ' + t(g.p + 'x\\times ' + g.s) + ' and ' + t('a\\times(-' + g.rr + 'x)') + '. Set their sum equal to ' + t(c1 + 'x') + '.'], 'find a from x coefficient ' + plain(br(Q)));
        } },
        { id: 'e9d', level: 'ADV', make: function (r) {
          var g = pickWhere(function () { return { c: r.int(2, 6), b: r.int(-5, 5), d: r.int(-6, 6) }; }, function (g) { return g.b !== 0 && g.d !== 0 && cnt(P.mul(lin(1, g.c, 'x'), quad(1, g.b, g.d, 'x'))) === 4; });
          var T = P.mul(sum(lin(1, g.c, 'x')), sum(quad(1, g.b, g.d, 'x')));
          return KP.fields(t(br(lin(1, g.c, 'x')) + '\\left(x^{2}+bx+c\\right)=' + tx(T)), [box(t('b='), ['x'], { name: 'b', wide: false }), box(t('c='), ['x'], { name: 'c', wide: false })],
            [intChk(g.b, function (v) { return v === co(T, { x: 2 }) ? { code: 'value', hint: 'The ' + t('x^{2}') + ' term is ' + t('(b+' + g.c + ')x^{2}') + '.' } : null; }), intChk(g.d, function (v) { return v === co(T) ? { code: 'value', hint: 'The constant term is ' + t(g.c + 'c') + '.' } : null; })],
            [String(g.b), String(g.d)], t('b=' + g.b + ',\\ c=' + g.d),
            t('x^{2}') + ' column: ' + t('b+' + g.c + '=' + co(T, { x: 2 })) + ', so ' + t('b=' + g.b) + '.<br>Constant column: ' + t(g.c + 'c=' + co(T)) + ', so ' + t('c=' + g.d) + '.<br>Check the ' + t('x') + ' column: ' + t('c+' + g.c + 'b=' + co(T, { x: 1 })) + ' ✓',
            ['Two products make the ' + t('x^{2}') + ' term: ' + t('x\\cdot bx') + ' and ' + t(g.c + '\\cdot x^{2}') + '.', 'Only one product makes the constant term.'], 'find b, c: ' + plain(tx(T)));
        } }] },
      /* ---------- EP Part E ---------- */
      { num: '10', section: 'Extra practice E — Find and fix the error', stem: function (sh) { return 'Asked to expand ' + t(sh.lead) + ', a student wrote ' + t(sh.lead + '=' + sh.work + '=' + tx(sh.S)) + '.'; },
        shared: function (r) {
          var g = pickWhere(function () { return { a: r.pick([2, 3]), b: r.int(2, 5), p: r.int(2, 6) }; }, function (g) { return gcd(g.a, g.b) === 1 && g.a * g.p !== g.b; }); // a ≠ b: the binomial must not be 0 at x = 1 (Q10e)
          var A = lin(g.a, -g.b, 'x'), B = quad(1, g.p, -(1 + g.p), 'x'), lead = br(A) + br(B);
          var parts4 = [P.mul(A[0], B[0]), P.mul(A[0], B[1]), P.mul(A[1], B[0]), P.mul(A[1], B[2])], S = sum(parts4);
          return { g: g, A: A, B: B, lead: lead, parts4: parts4, work: seq(parts4), S: S, T: P.mul(sum(A), sum(B)), lost: [P.mul(A[0], B[2]), P.mul(A[1], B[1])] };
        },
        parts: [
          { id: 'e10a', level: 'EMG', make: function (r, sh) {
            return KP.fields('How many partial products should there have been, and how many did the student actually write?', [box('Should have been:', ['x'], { name: 'Should be', wide: false }), box('Student wrote:', ['x'], { name: 'Wrote', wide: false })],
              [intChk(6, function (v) { return v === 5 ? { code: 'value', hint: 'Multiply, don’t add: ' + t('2\\times 3') + '.' } : v === 4 ? { code: 'value', hint: 'That’s what FOIL gives. Each of the ' + t('2') + ' binomial terms meets each of the ' + t('3') + ' trinomial terms.' } : null; }), intChk(4)],
              ['6', '4'], t('6') + ' needed, ' + t('4') + ' written', 'A binomial × trinomial has ' + t('2\\times 3=6') + ' partial products. The student wrote only ' + t('4') + ': ' + sh.parts4.map(function (m) { return t(tx(m)); }).join(', ') + '.',
              ['Count the handshakes: every term of the binomial with every term of the trinomial.'], 'count partial products');
          } },
          { id: 'e10b', level: 'EMG', make: function (r, sh) {
            var A = sh.A, B = sh.B, l1 = sh.lost[0], l2 = sh.lost[1];
            return mc(r, 'Which two partial products were never formed?', [
              { html: t(tx(A[0]) + '\\times(' + tx(B[2]) + ')=' + tx(l1)) + ' and ' + t('(' + tx(A[1]) + ')\\times ' + tx(B[1]) + '=' + tx(l2)), right: true },
              { html: t(tx(A[0]) + '\\times ' + tx(B[0]) + '=' + tx(P.mul(A[0], B[0]))) + ' and ' + t('(' + tx(A[1]) + ')\\times(' + tx(B[2]) + ')=' + tx(P.mul(A[1], B[2]))), why: 'Those two are in the student’s work: ' + t(tx(P.mul(A[0], B[0]))) + ' and ' + t(tx(P.mul(A[1], B[2]))) + '.' },
              { html: t(tx(A[0]) + '\\times ' + tx(B[1]) + '=' + tx(P.mul(A[0], B[1]))) + ' and ' + t('(' + tx(A[1]) + ')\\times ' + tx(B[0]) + '=' + tx(P.mul(A[1], B[0]))), why: 'Those are the student’s ' + t('x^{2}') + ' terms — both were written. Look for products that would give ' + t('x') + ' terms.' },
              { html: t(tx(P.neg(l1))) + ' and ' + t(tx(P.neg(l2))), why: 'Right terms, wrong signs: ' + t(tx(A[0]) + '\\times(' + tx(B[2]) + ')') + ' is negative, and so is ' + t('(' + tx(A[1]) + ')\\times ' + tx(B[1])) + '.' }],
              'The ' + t('x') + ' terms are missing. ' + t(tx(A[0]) + '\\times(' + tx(B[2]) + ')=' + tx(l1)) + ': the <i>first</i> term of the binomial never met the <i>constant</i> of the trinomial. ' + t('(' + tx(A[1]) + ')\\times ' + tx(B[1]) + '=' + tx(l2)) + ': the <i>constant</i> of the binomial never met the <i>middle</i> term of the trinomial.',
              ['Make a 2 × 3 grid of all six products and tick off the four the student wrote.'], 'which products were lost');
          } },
          { id: 'e10c', level: 'PRG', make: function (r, sh) {
            var diff = P.sub(sh.T, sh.S);
            return KP.fields('Expand ' + t(sh.lead) + ' correctly, then find (correct answer) − (student’s answer).', [box('Correct expansion:', ['x'], { name: 'Correct' }), box('Correct − student’s:', ['x'], { name: 'Difference' })],
              [polyChk(sh.T, [{ is: sh.S, code: 'student-ans', hint: 'That’s the student’s answer — two partial products are still missing.' }]), polyChk(diff, [{ is: P.neg(diff), code: 'reverse', hint: 'Correct minus student’s, in that order.' }])],
              [tx(sh.T), tx(diff)], t(tx(sh.T)) + '; difference ' + t(tx(diff)),
              distSol(sh.A, sh.B, sh.lead) + '<br>Correct − student’s: ' + t('\\left(' + tx(sh.T) + '\\right)-\\left(' + tx(sh.S) + '\\right)=' + tx(diff)) + ', which is exactly the two lost products: ' + t(tx(sh.lost[0]) + '+(' + tx(sh.lost[1]) + ')=' + tx(diff)) + '.',
              ['Form all six partial products, then collect like terms.', 'Then subtract the student’s answer from yours.'], 'correct the expansion ' + plain(sh.lead));
          } },
          { id: 'e10d', level: 'BEG', make: function (r, sh) {
            var g = sh.g, v0 = 0, vs = P.at(sh.S, { x: 1 });
            return KP.fields('Substitute ' + t('x=1') + ' into the original product and into the student’s answer.', [box('Original product at ' + t('x=1') + ':', ['x'], { name: 'Original at x = 1' }), box('Student’s answer at ' + t('x=1') + ':', ['x'], { name: 'Student at x = 1' })],
              [intChk(v0), intChk(vs)], [String(v0), String(vs)], t('0') + ' and ' + t(vs),
              'Original: ' + t('(' + g.a + '-' + g.b + ')(1+' + g.p + '-' + (1 + g.p) + ')=(' + (g.a - g.b) + ')(0)=0') + '.<br>Student: ' + t(atTex(sh.S, 1, 'x') + '=' + vs) + ' ≠ ' + t('0') + ', so the student’s answer is wrong.',
              ['Replace every ' + t('x') + ' with ' + t('1') + '. Work out each bracket first.'], 'substitute x=1');
          } },
          { id: 'e10e', level: 'EMG', make: function (r, sh) {
            var g = sh.g;
            return mc(r, 'Why does ' + t('x=1') + ' make this error especially easy to catch?', [
              { html: 'At ' + t('x=1') + ' the trinomial is ' + t('1+' + g.p + '-' + (1 + g.p) + '=0') + ', so the true product is ' + t('0') + ': any non-zero answer is instantly wrong.', right: true },
              { html: 'Because ' + t('x=1') + ' makes every power of ' + t('x') + ' disappear, so the answers are always equal.', why: 'If they were always equal, the check could never catch an error. At ' + t('x=1') + ' the powers become ' + t('1') + ', but the student’s value still differs.' },
              { html: 'Because ' + t('1') + ' is the smallest positive whole number.', why: 'Size isn’t the point. Look at what the trinomial equals when ' + t('x=1') + '.' },
              { html: 'Because the binomial equals ' + t('0') + ' at ' + t('x=1') + '.', why: 'The binomial is ' + t('(' + g.a + '-' + g.b + ')=' + (g.a - g.b)) + ' at ' + t('x=1') + ' — not zero. Check the trinomial.' }],
              'At ' + t('x=1') + ' the trinomial ' + t(seq(sh.B)) + ' equals ' + t('1+' + g.p + '-' + (1 + g.p) + '=0') + ', so the correct product is ' + t('0') + '. The student’s answer gives ' + t(P.at(sh.S, { x: 1 })) + ', which can’t be right.',
              ['Work out the trinomial alone at ' + t('x=1') + '.'], 'why x=1 catches it');
          } }] },
      { num: '11', stem: function (sh) { return 'A second student wrote ' + t('(x+' + sh.k + ')^{3}=x^{3}+' + sh.k * sh.k * sh.k) + ', reasoning that “the cube goes on each term.”'; },
        shared: function (r) { return { k: r.int(2, 5) }; },
        parts: [
          { id: 'e11a', level: 'BEG', make: function (r, sh) {
            var k = sh.k, L = Math.pow(1 + k, 3), R = 1 + k * k * k;
            return KP.fields('Substitute ' + t('x=1') + ' into both sides. How far apart are the two values?', [box('Left side at ' + t('x=1') + ':', ['x'], { name: 'Left side', wide: false }), box('Right side at ' + t('x=1') + ':', ['x'], { name: 'Right side', wide: false }), box('Difference:', ['x'], { name: 'Difference', wide: false })],
              [intChk(L, function (v) { return v === 1 + k * k * k ? { code: 'cube-each', hint: 'Work out the bracket first: ' + t('(1+' + k + ')^{3}=' + (1 + k) + '^{3}') + '.' } : null; }), intChk(R), intChk(L - R, function (v) { return v === R - L ? { code: 'reverse', hint: 'Give the distance as a positive number: larger minus smaller.' } : null; })],
              [String(L), String(R), String(L - R)], t(L) + ', ' + t(R) + ', ' + t(L - R) + ' apart',
              'Left: ' + t('(1+' + k + ')^{3}=' + (1 + k) + '^{3}=' + L) + '. Right: ' + t('1^{3}+' + k * k * k + '=' + R) + '.<br>' + t(L + '\\ne ' + R) + ', so the statement is false. They are ' + t(L + '-' + R + '=' + (L - R)) + ' apart.',
              ['Left side: add inside the bracket first, then cube.'], 'test (x+k)^3 = x^3+k^3 at x=1');
          } },
          { id: 'e11b', level: 'EMG', make: function (r, sh) {
            var k = sh.k, A = lin(1, k, 'x'), sq = P.pow(sum(A), 2), T = P.pow(sum(A), 3);
            return polyPart('Expand ' + t(br(A) + '^{3}') + ' correctly.', T, [{ is: P.add(M(1, 'x', 3), N(k * k * k)), code: 'student-ans', hint: 'That’s the student’s claim. Multiply it out: ' + t(br(A) + br(A) + br(A)) + '.' },
              { is: P.mul(sum(A), P.add(M(1, 'x', 2), N(k * k))), code: 'square-middle', hint: 'Check your square: ' + t(br(A) + '^{2}=' + tx(sq)) + '.' }],
              t(br(A) + '^{2}=' + tx(sq)) + '<br>' + distSol(A, termsOf(sq), br(A) + '\\left(' + tx(sq) + '\\right)') + '<br>The student threw away the two middle terms, ' + t(tx(M(3 * k, 'x', 2))) + ' and ' + t(tx(M(3 * k * k, 'x'))) + '.',
              ['Square first, then multiply by ' + t(br(A)) + ' again.'], 'expand ' + plain(br(A)) + '^3');
          } },
          { id: 'e11c', level: 'EMG', make: function (r, sh) {
            var k = sh.k, A = lin(1, k, 'x'), B = quad(1, -k, k * k, 'x'), T = P.mul(sum(A), sum(B)), sq = P.pow(sum(A), 2);
            return polyPart('The student’s answer is the correct expansion of a <b>different</b> product. Expand ' + t(br(A) + br(B)) + '.', T, [wFoil(A, B)],
              distSol(A, B, br(A) + br(B)) + '<br>So ' + t('x^{3}+' + k * k * k) + ' really is ' + t(br(A) + br(B)) + '. The student needed ' + t(br(A) + '^{2}=' + tx(sq)) + ' as the second bracket: same first and last terms, but the middle term is ' + t(tx(M(-k, 'x'))) + ', not ' + t(tx(M(2 * k, 'x'))) + '.',
              H_BT, 'expand ' + plain(br(A) + br(B)));
          } },
          { id: 'e11d', level: 'ADV', make: function (r, sh) {
            var k = sh.k, a2 = 3 * k, a1 = 3 * k * k;
            return KP.fields('The student’s statement is true only when ' + t('x^{3}+' + a2 + 'x^{2}+' + a1 + 'x+' + k * k * k + '=x^{3}+' + k * k * k) + ', that is, when ' + t(a2 + 'x^{2}+' + a1 + 'x=0') + '. Solve this to find the only two values of ' + t('x') + ' for which the statement happens to be true.',
              [box('Smaller value: ' + t('x='), ['x'], { name: 'Smaller', wide: false }), box('Larger value: ' + t('x='), ['x'], { name: 'Larger', wide: false })],
              [intChk(-k, function (v) { return v === k ? { code: 'sign', hint: t(a2 + 'x(x+' + k + ')=0') + ': the bracket is zero when ' + t('x+' + k + '=0') + '.' } : v === 0 ? { code: 'order', hint: 'Put the smaller value first.' } : null; }), intChk(0, function (v) { return v === -k ? { code: 'order', hint: 'Put the larger value second.' } : null; })],
              [String(-k), '0'], t('x=-' + k) + ' or ' + t('x=0'),
              'Common factor: ' + t(a2 + 'x^{2}+' + a1 + 'x=' + a2 + 'x(x+' + k + ')=0') + ', so ' + t('x=0') + ' or ' + t('x=-' + k) + '.<br>Check ' + t('x=-' + k) + ': ' + t('(-' + k + '+' + k + ')^{3}=0') + ' and ' + t('(-' + k + ')^{3}+' + k * k * k + '=0') + ' ✓',
              ['Take out the common factor ' + t(a2 + 'x') + '. A product is ' + t('0') + ' when one of its factors is ' + t('0') + '.'], 'when is (x+k)^3 = x^3+k^3');
          } }] },
      /* ---------- EP Part F ---------- */
      { num: '12', section: 'Extra practice F — Volume', stem: function (sh) { return 'A rectangular box has the dimensions shown.' + boxSvg({ w: 2.4, h: 2.2, d: [0.95, 0.6], bottom: linLab(lin(1, sh.p, 'x')), right: linLab(lin(1, sh.q, 'x')), left: linLab(lin(2, -sh.s, 'x')), units: 'cm', aria: 'rectangular box' }); },
        shared: function (r) { var p = r.int(2, 5), q; do { q = r.int(1, 4); } while (q === p); return { p: p, q: q, s: r.pick([3, 3, 5, 7]), x0: r.pick([5, 5, 6]) }; },
        parts: [
          { id: 'e12a', level: 'PRG', make: function (r, sh) {
            var F3 = [lin(1, sh.p, 'x'), lin(1, sh.q, 'x'), lin(2, -sh.s, 'x')];
            var p = threePart(F3, 0, 1, { prompt: 'Write the volume as a product of three binomials, then expand it to the form ' + t('V=ax^{3}+bx^{2}+cx+d') + ' (in cm³).', before: t('V='),
              wrong: [{ is: P.mul(sum(F3[0]), sum(F3[1])), code: 'two-dims', hint: 'Volume = length × width × height: all three dimensions.' }] });
            p.solution = t('V=' + F3.map(br).join('')) + '<br>' + p.solution;
            return p;
          } },
          { id: 'e12b', level: 'BEG', make: function (r, sh) {
            var x = sh.x0, d = [x + sh.p, x + sh.q, 2 * x - sh.s], V = d[0] * d[1] * d[2], T = P.mul(sum(lin(1, sh.p, 'x')), sum(lin(1, sh.q, 'x')), sum(lin(2, -sh.s, 'x')));
            return KP.number('Find the volume when ' + t('x=' + x) + ', by multiplying the three dimensions at ' + t('x=' + x) + ' (your expansion from (a) must give the same value).', V, function (v) { return v === d[0] * d[1] ? { code: 'two-dims', hint: 'Use all three dimensions.' } : null; },
              'Dimensions at ' + t('x=' + x) + ': ' + t(d.join(',\\ ')) + ', so ' + t('V=' + d.join('\\times ') + '=' + V) + ' cm³.<br>From the expansion: ' + t(atTex(T, x, 'x') + '=' + V) + ' ✓',
              ['Substitute ' + t('x=' + x) + ' into each dimension, then multiply.'], 'box volume at x=' + x, { after: 'cm³' });
          } },
          { id: 'e12c', level: 'PRG', make: function (r, sh) {
            var m = Math.floor(sh.s / 2) + 1;
            return KP.number('The height is ' + t('(2x-' + sh.s + ')') + ' cm. What is the smallest whole number ' + t('x') + ' may be?', m, function (v) { return v < m && v >= 0 ? { code: 'height-neg', hint: 'At ' + t('x=' + v) + ' the height is ' + t('2(' + v + ')-' + sh.s + '=' + (2 * v - sh.s)) + ' cm. A length must be positive.' } : null; },
              'The height must be positive: ' + t('2x-' + sh.s + '>0') + ', so ' + t('x>' + sh.s / 2) + '. (At ' + t('x=1') + ' the height would be ' + t((2 - sh.s)) + ' cm.)<br>The smallest whole number is ' + t('x=' + m) + ', giving a ' + t((m + sh.p) + '\\times ' + (m + sh.q) + '\\times ' + (2 * m - sh.s)) + ' box.',
              ['Every dimension must be positive. Which dimension becomes zero or negative first?'], 'smallest x for box', { before: t('x=') });
          } },
          { id: 'e12d', level: 'EMG', make: function (r, sh) {
            var T = P.mul(sum(lin(1, sh.p, 'x')), sum(lin(1, sh.q, 'x')), sum(lin(2, -sh.s, 'x')));
            return mc(r, 'Your expansion is ' + t('V=' + tx(T)) + '. For very large ' + t('x') + ', the box is almost an ' + t('x') + ' by ' + t('x') + ' by ' + t('2x') + ' box. Which coefficient tells you that box’s volume, ' + t('2x^{3}') + '?', [
              { html: 'The leading coefficient, ' + t('2') + ': for large ' + t('x') + ' the ' + t('2x^{3}') + ' term is far bigger than the rest.', right: true },
              { html: 'The constant term, ' + t(co(T)) + '.', why: 'The constant term barely matters when ' + t('x') + ' is huge. Which term grows fastest?' },
              { html: 'The ' + t('x^{2}') + ' coefficient, ' + t(co(T, { x: 2 })) + '.', why: t(co(T, { x: 2 }) + 'x^{2}') + ' grows, but ' + t('2x^{3}') + ' grows much faster.' },
              { html: 'None of them — you need all four coefficients.', why: 'Try ' + t('x=1000') + ': ' + t('2x^{3}') + ' is two billion, and the other terms add only a few million.' }],
              'For very large ' + t('x') + ', the ' + t('2x^{3}') + ' term dwarfs the others, so ' + t('V\\approx 2x^{3}=x\\cdot x\\cdot 2x') + '. The <b>leading coefficient</b> ' + t('2') + ' is the product of the three leading coefficients, ' + t('1\\times 1\\times 2') + '.',
              ['Which term grows fastest as ' + t('x') + ' gets larger?'], 'leading coefficient meaning');
          } }] },
      { num: '13', stem: function (sh) { return 'An open-topped box is made from a ' + t(sh.L) + ' cm by ' + t(sh.W) + ' cm sheet of cardboard by cutting a square of side ' + t('x') + ' cm from each corner and folding up the flaps.' + sheetSvg(sh.L, sh.W); },
        shared: function (r) { var W = r.pick([12, 16, 20, 20, 24]), L = W + r.pick([4, 6, 8, 10, 10, 12]); var x1 = r.int(2, Math.min(4, W / 2 - 2)); return { L: L, W: W, x1: x1, x2: x1 + 1 }; },
        parts: [
          { id: 'e13a', level: 'EMG', make: function (r, sh) {
            var L = sh.L, W = sh.W, H = M(1, 'x'), Ld = lin(-2, L, 'x'), Wd = lin(-2, W, 'x');
            var oneCut = function (n) { return [{ is: sum(lin(-1, n, 'x')), code: 'one-cut', hint: 'A square is cut from <b>both</b> ends of each side, so each side loses ' + t('2x') + '.' }]; };
            return KP.fields('Write the three dimensions of the finished box in terms of ' + t('x') + '.', [box('Height (cm):', ['x'], { name: 'Height' }), box('Length, from the ' + L + ' cm side (cm):', ['x'], { name: 'Length' }), box('Width, from the ' + W + ' cm side (cm):', ['x'], { name: 'Width' })],
              [polyChk(H), polyChk(sum(Ld), oneCut(L)), polyChk(sum(Wd), oneCut(W))], ['x', L + '-2x', W + '-2x'], 'height ' + t('x') + ', length ' + t(L + '-2x') + ', width ' + t(W + '-2x'),
              'The flaps fold up to make the height: ' + t('x') + ' cm. A square is cut from both ends of each side, so each side loses ' + t('2x') + ': length ' + t(L + '-2x') + ' cm, width ' + t(W + '-2x') + ' cm.<br>So ' + t('V=x(' + L + '-2x)(' + W + '-2x)') + '.',
              ['Picture folding up the flaps: how tall are they? How much of each side is left for the base?'], 'open box dimensions');
          } },
          { id: 'e13b', level: 'PRG', make: function (r, sh) {
            var L = sh.L, W = sh.W, LW = P.mul(sum(lin(-2, L, 'x')), sum(lin(-2, W, 'x'))), T = P.mul(M(1, 'x'), LW);
            return polyPart('Expand ' + t('V=x(' + L + '-2x)(' + W + '-2x)') + ' and write it in descending order.', T, [
              { is: P.mul(M(1, 'x'), sum(lin(-1, L, 'x')), sum(lin(-1, W, 'x'))), code: 'one-cut', hint: 'Each side loses ' + t('2x') + ', not ' + t('x') + '.' },
              { is: LW, code: 'no-x', hint: 'That’s the area of the base. Multiply by the height ' + t('x') + ' too.' }],
              t('(' + L + '-2x)(' + W + '-2x)=' + L * W + '-' + 2 * L + 'x-' + 2 * W + 'x+4x^{2}=' + tx(LW)) + '<br>' + t('V=x\\left(' + tx(LW) + '\\right)=' + tx(T)),
              ['Multiply the two binomials first (FOIL), then multiply every term by ' + t('x') + '.'], 'expand open box volume', { order: 'desc', var: 'x', before: t('V=') });
          } },
          { id: 'e13c', level: 'BEG', make: function (r, sh) {
            var L = sh.L, W = sh.W, f = function (x) { return x * (L - 2 * x) * (W - 2 * x); };
            return KP.fields('Evaluate the volume when ' + t('x=' + sh.x1) + ' and when ' + t('x=' + sh.x2) + '.', [box(t('V(' + sh.x1 + ')=') , ['x'], { name: 'x = ' + sh.x1, wide: false }), box(t('V(' + sh.x2 + ')='), ['x'], { name: 'x = ' + sh.x2, wide: false })],
              [intChk(f(sh.x1), function (v) { return v === sh.x1 * (L - sh.x1) * (W - sh.x1) ? { code: 'one-cut', hint: 'Each side loses ' + t('2x') + '.' } : null; }), intChk(f(sh.x2), function (v) { return v === sh.x2 * (L - sh.x2) * (W - sh.x2) ? { code: 'one-cut', hint: 'Each side loses ' + t('2x') + '.' } : null; })],
              [String(f(sh.x1)), String(f(sh.x2))], t(F(f(sh.x1))) + ' cm³ and ' + t(F(f(sh.x2))) + ' cm³',
              [sh.x1, sh.x2].map(function (x) { return t('x=' + x) + ': ' + t(x + '\\times ' + (L - 2 * x) + '\\times ' + (W - 2 * x) + '=' + F(f(x))) + ' cm³'; }).join('<br>') + '<br>(The expansion ' + t('4x^{3}-' + 2 * (L + W) + 'x^{2}+' + L * W + 'x') + ' gives the same values.)',
              ['Work out the three dimensions first, then multiply.'], 'open box volume values');
          } },
          { id: 'e13d', level: 'PRG', make: function (r, sh) {
            var L = sh.L, W = sh.W, h = W / 2, H = L / 2;
            return mc(r, 'Which values of ' + t('x') + ' make sense for this box?', [
              { html: t('0<x<' + h), right: true },
              { html: t('0<x<' + H), why: 'At ' + t('x=' + h) + ' the width ' + t(W + '-2x') + ' is already ' + t('0') + ': the cuts meet across the ' + W + ' cm side.' },
              { html: t('0\\le x\\le ' + h), why: 'At ' + t('x=0') + ' nothing is cut (no height) and at ' + t('x=' + h) + ' the width is ' + t('0') + ': both give ' + t('V=0') + ', so no box.' },
              { html: t('x>0'), why: 'Try ' + t('x=' + (h + 1)) + ': the width ' + t(W + '-2x') + ' would be negative.' }],
              t('x') + ' must be positive (at ' + t('x=0') + ' there is no height), and the width ' + t(W + '-2x') + ' must be positive, so ' + t('x<' + h) + '. At ' + t('x=' + h) + ' the cuts meet across the ' + W + ' cm side and ' + t('V=0') + '. So ' + t('0<x<' + h) + '.',
              ['Every dimension — ' + t('x') + ', ' + t(L + '-2x') + ', ' + t(W + '-2x') + ' — must be positive. Which one runs out first?'], 'open box domain');
          } }] },
      /* ---------- EP Part G ---------- */
      { num: '14', section: 'Extra practice G — Stretch', stem: '<b>Four binomials.</b> Pair them off before you multiply anything.', parts: [
        { id: 'e14a', level: 'PRG', make: function (r) {
          var a = r.int(1, 3), b; do { b = r.int(2, 5); } while (b === a);
          return fourPart([lin(1, a, 'x'), lin(1, -a, 'x'), lin(1, b, 'x'), lin(1, -b, 'x')], [[0, 1], [2, 3]], 'Choose the pairing that makes two differences of squares, then multiply the two results.');
        } },
        { id: 'e14b', level: 'PRG', make: function (r) {
          var pq = pickWhere(function () { return [r.int(2, 3), r.int(1, 3)]; }, function (v) { return gcd(v[0], v[1]) === 1; }), p = pq[0], q = pq[1], c = r.int(2, 5);
          return fourPart([lin(p, -q, 'x'), lin(p, q, 'x'), lin(1, -c, 'x'), lin(1, c, 'x')], [[0, 1], [2, 3]]);
        } },
        { id: 'e14c', level: 'ADV', make: function (r) {
          var g = pickWhere(function () { var a = r.int(1, 3), b = a + r.int(1, 2), c = b + r.int(1, 2); return { a: a, b: b, c: c, d: b + c - a }; }, function (g) { return g.d > g.c && g.d <= 8; });
          return fourPart([lin(1, g.a, 'x'), lin(1, g.b, 'x'), lin(1, g.c, 'x'), lin(1, g.d, 'x')], [[0, 3], [1, 2]], 'No sum-times-difference pairs here — multiply in two pairs (pair them so the two trinomials share the same ' + t('x') + ' term), then multiply the two trinomials.');
        } },
        { id: 'e14d', level: 'PRG', make: function (r) {
          var ps = [r.pick([2, 3, -1]), r.pick([1, 2, 3]), r.pick([1, -2, 3]), r.pick([1, 2, -1])], qs = ps.map(function (p) { var v; do { v = r.int(-5, 5); } while (v === 0 || gcd(p, v) !== 1); return v; });
          var F4 = ps.map(function (p, i) { return lin(p, qs[i], 'x'); }), lead = F4.map(br).join(''), lc = ps.reduce(function (a, b) { return a * b; }, 1);
          return KP.fields('<b>Without expanding</b>, state the degree and the leading coefficient of ' + t(lead) + '.', [box('Degree:', ['x'], { name: 'Degree', wide: false }), box('Leading coefficient:', ['x'], { name: 'Leading coefficient', wide: false })],
            [intChk(4, function (v) { return v === 1 ? { code: 'value', hint: 'Degrees <b>add</b> when polynomials are multiplied: ' + t('1+1+1+1') + '.' } : null; }),
              intChk(lc, function (v) { var s = ps.reduce(function (a, b) { return a + b; }, 0); return v === s && s !== lc ? { code: 'coef-sum', hint: 'The ' + t('x^{4}') + ' term is ' + t(ps.map(function (p) { return '(' + p + 'x)'; }).join('')) + ': <b>multiply</b> the ' + t('x') + '-coefficients.' } : v === -lc ? { code: 'sign', hint: 'Count the negative ' + t('x') + '-coefficients to get the sign.' } : null; })],
            ['4', String(lc)], 'degree ' + t('4') + ', leading coefficient ' + t(lc),
            '<b>Degree ' + t('4') + '</b>: each bracket has degree ' + t('1') + ', and degrees add when polynomials are multiplied: ' + t('1+1+1+1=4') + '.<br><b>Leading coefficient</b>: the only way to make an ' + t('x^{4}') + ' term is to take the ' + t('x') + '-term from every bracket: ' + t(ps.map(function (p) { return '(' + tx(M(p, 'x')) + ')'; }).join('') + '=' + lc + 'x^{4}') + '. In general it is ' + t('p_{1}p_{2}p_{3}p_{4}') + '.',
            ['Which term of each bracket must you take to build the highest power of ' + t('x') + '?'], 'degree and leading coefficient of four binomials');
        } }] },
      { num: '15', stem: '<b>Reading a cubic off its factors.</b> In general, ' + t('(x+a)(x+b)(x+c)') + ' can be expanded with ' + t('a') + ', ' + t('b') + ', ' + t('c') + ' kept as letters.', parts: [
        { id: 'e15a', level: 'PRG', make: function (r) {
          return mc(r, 'Which is the full expansion of ' + t('(x+a)(x+b)(x+c)') + '?', [
            { html: t('x^{3}+(a+b+c)x^{2}+(ab+ac+bc)x+abc'), right: true },
            { html: t('x^{3}+(a+b+c)x^{2}+(a+b+c)x+abc'), why: 'Test it with ' + t('(x+1)(x+2)(x+3)=x^{3}+6x^{2}+11x+6') + ': the ' + t('x') + ' coefficient is ' + t('11') + ', not ' + t('1+2+3') + '.' },
            { html: t('x^{3}+abcx^{2}+(ab+ac+bc)x+(a+b+c)'), why: 'The constant term is the product of the three constants: ' + t('a\\cdot b\\cdot c') + '.' },
            { html: t('x^{3}+(ab+bc)x^{2}+(a+c)x+abc'), why: 'Each ' + t('x^{2}') + ' term takes ' + t('x') + ' from two brackets and a constant from one: that gives ' + t('a+b+c') + '.' }],
            t('(x+a)(x+b)=x^{2}+(a+b)x+ab') + '. Multiply by ' + t('(x+c)') + ': ' + t('x^{3}+(a+b)x^{2}+abx+cx^{2}+(a+b)cx+abc') + '<br>' + t('=x^{3}+(a+b+c)x^{2}+(ab+ac+bc)x+abc') + '.<br>The ' + t('x^{2}') + ' coefficient is the <b>sum</b> of the constants, the ' + t('x') + ' coefficient is the sum of their <b>pairwise products</b>, and the constant is their <b>product</b>.',
            ['Test each option with a simple case, like ' + t('a=1,\\ b=2,\\ c=3') + '.'], 'general cubic from factors');
        } },
        { id: 'e15b', level: 'PRG', make: function (r) {
          var g = pickWhere(function () { return { a: r.int(1, 5), b: -r.int(2, 7), c: r.int(3, 9) }; }, function (g) { return g.a !== g.c && g.a + g.b + g.c !== 0 && g.a * g.b + g.a * g.c + g.b * g.c !== 0; });
          return readCubic([g.a, g.b, g.c]);
        } },
        { id: 'e15c', level: 'PRG', make: function (r) {
          var vals = r.sample([1, 2, 3, 4, 5, 6, 7, 8], 3).sort(function (a, b) { return a - b; });
          return readCubic(vals.map(function (v) { return -v; }));
        } },
        { id: 'e15d', level: 'ADV', make: function (r) {
          var g = pickWhere(function () { return { a: r.int(1, 4), b: r.int(3, 9) }; }, function (g) { var c = g.b - g.a; return c > 0 && c !== g.a && c !== g.b && (g.a * -g.b + g.a * c - g.b * c) !== 0; });
          var c = g.b - g.a, F3 = [lin(1, g.a, 'x'), lin(1, -g.b, 'x'), lin(1, c, 'x')], T = P.mul(sum(F3[0]), sum(F3[1]), sum(F3[2])), x1 = g.a * -g.b + g.a * c + -g.b * c, c0 = g.a * -g.b * c;
          return KP.fields('Determine the value of ' + t('c') + ' for which ' + t(br(F3[0]) + br(F3[1]) + '(x+c)') + ' has <b>no</b> ' + t('x^{2}') + ' term, and state the resulting cubic.', [box(t('c='), ['x'], { name: 'c', wide: false }), box('Cubic:', ['x'], { name: 'Cubic' })],
            [intChk(c, function (v) { return v === -c ? { code: 'sign', hint: 'You need ' + t(g.a + '+(-' + g.b + ')+c=0') + '.' } : null; }), polyChk(T)], [String(c), tx(T)], t('c=' + c) + '; ' + t(tx(T)),
            'No ' + t('x^{2}') + ' term: the sum of the constants is ' + t('0') + ': ' + t(g.a + '+(-' + g.b + ')+c=0') + ', so ' + t('c=' + c) + '.<br>' + t('x') + ' coefficient: ' + t('(' + g.a + ')(-' + g.b + ')+(' + g.a + ')(' + c + ')+(-' + g.b + ')(' + c + ')=' + x1) + '; constant: ' + t('(' + g.a + ')(-' + g.b + ')(' + c + ')=' + c0) + '.<br>Cubic: ' + t(tx(T)),
            ['The ' + t('x^{2}') + ' coefficient of ' + t('(x+a)(x+b)(x+c)') + ' is ' + t('a+b+c') + '. Set it equal to ' + t('0') + '.'], 'c for no x^2 term');
        } }] },
      { num: '16', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: 'e16', level: 'EMG', make: function (r) {
          var g = pickWhere(function () { return { p: r.int(2, 3), q: r.int(1, 3), b: r.int(2, 5), c: r.int(2, 6) }; }, function (g) { return gcd(g.p, g.q) === 1 && g.q !== g.p * g.b && g.p * g.c !== g.q * g.b; });
          var A = lin(g.p, -g.q, 'x'), B = quad(1, -g.b, g.c, 'x'), T = P.mul(sum(A), sum(B));
          var oB = sum([M(g.p, 'x', 3), M(-g.p * g.b + g.q, 'x', 2), M(g.p * g.c + g.q * g.b, 'x'), N(-g.q * g.c)]), oC = sum([M(g.p, 'x', 3), M(-g.p * g.b - g.q, 'x', 2), M(g.p * g.c - g.q * g.b, 'x'), N(-g.q * g.c)]), oD = sum([M(g.p, 'x', 3), M(-g.p * g.b, 'x', 2), M(g.p * g.c, 'x'), N(-g.q * g.c)]);
          return mc(r, 'The expansion of ' + t(br(A) + br(B)) + ' is', [
            { html: t(tx(T)), right: true },
            { html: t(tx(oB)), why: 'Check the ' + t('x^{2}') + ' term: ' + t('(-' + g.q + ')\\times x^{2}=-' + (g.q === 1 ? '' : g.q) + 'x^{2}') + ', so it adds to ' + t(tx(M(-g.p * g.b, 'x', 2))) + ' with a minus.' },
            { html: t(tx(oC)), why: 'Check the ' + t('x') + ' term: ' + t('(-' + g.q + ')\\times(-' + g.b + 'x)=+' + g.q * g.b + 'x') + ' — a negative times a negative.' },
            { html: t(tx(oD)), why: 'That keeps only ' + t(tx(N(-g.q * g.c))) + ' from the ' + t('-' + g.q) + ' row. ' + t('-' + g.q) + ' must multiply <b>all three</b> terms of the trinomial.' }],
            distSol(A, B, br(A) + br(B)), ['Do the two rows separately: ' + t(tx(A[0])) + ' times the trinomial, then ' + t(tx(A[1])) + ' times the trinomial.'], 'MC expand ' + plain(br(A) + br(B)));
        } }] },
      { num: '17', stem: '<i>(Numerical Response)</i>', parts: [
        { id: 'e17', level: 'PRG', make: function (r) {
          var pq = pickWhere(function () { return [r.int(2, 3), r.int(1, 4)]; }, function (v) { return gcd(v[0], v[1]) === 1; }), p = pq[0], q = pq[1], ans = 3 * p * p * q, A = lin(p, q, 'x'), T = P.pow(sum(A), 3);
          return KP.nr('When ' + t(br(A) + '^{3}') + ' is expanded and simplified, the coefficient of the ' + t('x^{2}') + ' term is ________.', ans, function (v) {
            if (v === p * p * q) return { code: 'no-3', hint: 'The cube pattern has a ' + t('3') + ' in the second term: ' + t('3a^{2}b') + '.' };
            if (v === 3 * p * q) return { code: 'coef-in', hint: 'Square the whole term: ' + t('(' + p + 'x)^{2}=' + p * p + 'x^{2}') + '.' };
            if (v === 3 * p * q * q) return { code: 'value', hint: 'That’s the ' + t('x') + ' coefficient, ' + t('3ab^{2}') + '. You want ' + t('3a^{2}b') + '.' };
            if (v === 2 * p * q) return { code: 'square-middle', hint: 'That’s the middle coefficient of the <b>square</b>. Multiply by ' + t(br(A)) + ' once more.' };
            return null;
          }, 'By the cube pattern with ' + t('a=' + p + 'x') + ', ' + t('b=' + q) + ': ' + t('(' + p + 'x)^{3}+3(' + p + 'x)^{2}(' + q + ')+3(' + p + 'x)(' + q + ')^{2}+' + q + '^{3}=' + tx(T)) + '. The ' + t('x^{2}') + ' coefficient is ' + t(ans) + '.',
            ['Use ' + t('(a+b)^{3}=a^{3}+3a^{2}b+3ab^{2}+b^{3}') + ' with ' + t('a=' + p + 'x') + '.'], 'NR x^2 coefficient of ' + plain(br(A)) + '^3');
        } }] }
    ]
  });

  /* ---------------- builders used above (hoisted function declarations) ---------------- */
  function F(n) { return HW.fmt(n); }
  function vertPart(Tri, Bin, shownTri) {
    var T = P.mul(sum(Tri), sum(Bin)), lead = br(shownTri || Tri) + br(Bin);
    var pre = shownTri ? 'Reorder the trinomial first: ' + t(seq(Tri)) + '.<br>' : '';
    return polyPart(t(lead) + '<div style="margin:6px 0">' + t(vertTex(Tri, Bin, false)) + '</div>', T, [wFoil(Bin, Tri), wSecond(Bin, Tri), wMinusFirst(Bin, Tri)],
      pre + t(vertTex(Tri, Bin, true)) + '<br>Row 1: ' + t(tx(Bin[1]) + br(Tri)) + ' &nbsp; Row 2: ' + t(tx(Bin[0]) + br(Tri)) + ', shifted one column left. Add down:<br>' + t(lead + '=' + tx(T)),
      ['Row 1: multiply the trinomial by ' + t(tx(Bin[1])) + '. Row 2: multiply it by ' + t(tx(Bin[0])) + ', moving one column to the left.', 'Add each column: like terms are lined up.'], 'vertical ' + plain(lead));
  }
  function cubePart(A, note) {
    var sq = P.pow(sum(A), 2), T = P.pow(sum(A), 3), Sq = termsOf(sq), a0 = A[0], a1 = A[1];
    var ce = P.add(P.pow(a0, 3), P.pow(a1, 3));
    return polyPart('Expand ' + t(br(A) + '^{3}') + '.' + (note ? ' ' + note : ''), T, [
      { is: ce, code: 'cube-each', hint: 'The cube doesn’t go onto each term. Square ' + t(br(A)) + ' first, then multiply by ' + t(br(A)) + ' again.' },
      { is: P.mul(sum(A), P.add(P.pow(a0, 2), P.pow(a1, 2))), code: 'square-middle', hint: 'Check your square: ' + t(br(A) + '^{2}=' + tx(sq)) + ' — don’t drop the middle term.' },
      wThird(Sq, A)],
      t(br(A) + '^{2}=' + tx(sq)) + '<br>' + distSol(A, Sq, br(A) + '\\left(' + tx(sq) + '\\right)'),
      ['Square first (' + t(br(A) + br(A)) + '), then multiply that trinomial by ' + t(br(A)) + '.', 'The second stage has ' + t('2\\times 3=6') + ' partial products.'], 'cube ' + plain(br(A)));
  }
  function fourPart(F4, pairs, how) {
    var p1 = P.mul(sum(F4[pairs[0][0]]), sum(F4[pairs[0][1]])), p2 = P.mul(sum(F4[pairs[1][0]]), sum(F4[pairs[1][1]])), T = P.mul(p1, p2), lead = F4.map(br).join('');
    var ws = [];
    function flipC(p) { return P.sub(p, P.scale(N(co(p)), 2)); }
    if (cnt(p1) === 2 && cnt(p2) === 2) ws.push({ is: P.mul(flipC(p1), flipC(p2)), code: 'dsq-sign', hint: 'A sum times a difference gives a <b>difference</b> of squares: ' + t(tx(p1)) + ' and ' + t(tx(p2)) + '.' });
    var sol = 'Pair ' + t(br(F4[pairs[0][0]]) + br(F4[pairs[0][1]])) + ' and ' + t(br(F4[pairs[1][0]]) + br(F4[pairs[1][1]])) + ':<br>' + pairLine(F4[pairs[0][0]], F4[pairs[0][1]]) + '<br>' + pairLine(F4[pairs[1][0]], F4[pairs[1][1]]) + '<br>' + distSol(termsOf(p1), termsOf(p2), '\\left(' + tx(p1) + '\\right)\\left(' + tx(p2) + '\\right)');
    return polyPart((how ? how + '<br>' : '') + t(lead), T, ws, sol, ['Multiply the brackets in two pairs first, then multiply the two results.', cnt(p1) === 2 ? 'Pair each sum with its matching difference: the middle terms cancel.' : 'Pair them so both products share the same ' + t('x') + ' term (here ' + t(tx(M(co(p1, { x: 1 }), 'x'))) + ').'], 'four binomials ' + plain(lead));
  }
  function readCubic(cs) {
    var F3 = cs.map(function (c) { return lin(1, c, 'x'); }), T = P.mul(sum(F3[0]), sum(F3[1]), sum(F3[2])), lead = F3.map(br).join('');
    var s = cs[0] + cs[1] + cs[2], q = cs[0] * cs[1] + cs[0] * cs[2] + cs[1] * cs[2], pr = cs[0] * cs[1] * cs[2];
    var AB = P.mul(sum(F3[0]), sum(F3[1]));
    return KP.fields('<b>Without expanding</b>, write down the ' + t('x^{2}') + ' coefficient, the ' + t('x') + ' coefficient and the constant term of ' + t(lead) + '.',
      [box(t('x^{2}') + ' coefficient:', ['x'], { name: 'x² coefficient', wide: false }), box(t('x') + ' coefficient:', ['x'], { name: 'x coefficient', wide: false }), box('Constant term:', ['x'], { name: 'Constant', wide: false })],
      [intChk(s, function (v) { return v === -s ? { code: 'sign', hint: 'Use the constants with their signs: ' + t('a=' + cs[0] + ',\\ b=' + cs[1] + ',\\ c=' + cs[2]) + '.' } : null; }),
        intChk(q, function (v) { return v === s ? { code: 'pair-sum', hint: 'The ' + t('x') + ' coefficient is the sum of the <b>pairwise products</b>: ' + t('ab+ac+bc') + '.' } : null; }), intChk(pr)],
      [String(s), String(q), String(pr)], t(s) + ', ' + t(q) + ', ' + t(pr),
      t('a=' + cs[0] + ',\\ b=' + cs[1] + ',\\ c=' + cs[2]) + '<br>' + t('x^{2}') + ': ' + t('a+b+c=' + s) + '<br>' + t('x') + ': ' + t('ab+ac+bc=' + pv(cs[0] * cs[1]) + '+' + pv(cs[0] * cs[2]) + '+' + pv(cs[1] * cs[2]) + '=' + q) + '<br>constant: ' + t('abc=' + pr) +
        '<br>Check: ' + t(br(F3[0]) + br(F3[1]) + '=' + tx(AB)) + ', and ' + t('\\left(' + tx(AB) + '\\right)' + br(F3[2]) + '=' + tx(T)) + ' ✓',
      ['Use ' + t('(x+a)(x+b)(x+c)=x^{3}+(a+b+c)x^{2}+(ab+ac+bc)x+abc') + ', keeping the signs of the constants.'], 'read cubic ' + plain(lead));
  }
})(window);
