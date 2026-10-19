/* Math 10C · Unit 1 Test (AN1, AN2) — the paper outcomes-based unit test (u1_test_A/B/C.tex) as generators.
 * The paper is organized by outcome (AN1 parts 1–2, AN2 parts 1–2), each part in BEG / PRG / MAS boxes; every question
 * keeps its box (section, outcome, level) and its number. Each part takes its numbers from the seed, inside the range that
 * Versions A, B and C show (their numbers are possible values), with a key and a worked solution for every version.
 * Conversions from paper: written explanations → checkable steps (labelled boxes) or multiple choice with a reason for each
 * wrong option; factor-tree blanks → labelled boxes; circle the primes → select; tick tables → grid; number-line mark →
 * numplace; "order and explain" → the comparison step in boxes, then an ordering. The division ladder / factor tree widgets
 * cannot be used in a test (HW.TestCore.NO_TEST), so Q2 is a typed product of primes. */
(function (root) {
  'use strict';
  var HW = root.HW, nt = HW.nt, ex = HW.ex, F = HW.fmt, K = HW.kit, P = K.P, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form;

  HW.addCodes({
    'tree-box': 'Factor tree: a box doesn’t multiply out',
    'k-once': 'Multiplied by each missing prime only once', 'edge-third': 'Divided the volume by 3 instead of taking the cube root',
    'face-surface': 'Gave the total surface area, not one face', 'face-perimeter': 'Gave the perimeter of a face, not its area', 'face-double': 'Doubled the edge instead of squaring it',
    'kits-total': 'Gave a total instead of the amount in each group', 'lcm-units': 'Converted seconds to minutes wrongly', 'other-ratio': 'Divided the LCM by the given number (forgot the GCF)',
    'other-gcf': 'Other number has the wrong GCF', 'other-lcm': 'Other number has the wrong LCM', 'rsq-coef': 'Squared only the radicand, not the coefficient',
    'rsq-double': 'Doubled instead of squaring', 'sq-decimal': 'Squared a decimal wrongly', 'six-power': 'Raised a root to the 6th power wrongly',
    'diag-square': 'Used the diagonal as the side (forgot s²+s²)', 'diag-times': 'Multiplied by √2 instead of dividing', 'diag-perim': 'Perimeter: not 4 sides'
  });

  /* ---------- number helpers ---------- */
  function gcd(a, b) { return ex.gcd(a, b); }
  function lcm(a, b) { return a / gcd(a, b) * b; }
  function gcfA(a) { return a.reduce(gcd); }
  function lcmA(a) { return a.reduce(lcm); }
  function prodOf(a) { return a.reduce(function (m, x) { return m * x; }, 1); }
  function sortN(a) { return a.slice().sort(function (x, y) { return x - y; }); }
  function fVal(f) { return f.reduce(function (m, pe) { return m * Math.pow(pe[0], pe[1]); }, 1); }
  function fTex(f) { var g = f.filter(function (pe) { return pe[1] > 0; }); return g.length ? HW.texFactors(g) : '1'; }
  function fSort(f) { return f.slice().sort(function (a, b) { return a[0] - b[0]; }); }
  function plainFac(n) { return nt.factor(n).map(function (pe) { return pe[1] > 1 ? pe[0] + '^' + pe[1] : String(pe[0]); }).join(' × '); }
  function plainF(f) { return f.filter(function (pe) { return pe[1] > 0; }).map(function (pe) { return pe[1] > 1 ? pe[0] + '^' + pe[1] : String(pe[0]); }).join(' × '); }
  function facEq(n) { return nt.isPrime(n) ? t(F(n)) + ' (prime)' : t(F(n) + '=' + K.fac(n)); }
  function find(gen, test, fallback) { for (var i = 0; i < 800; i++) { var v = gen(); if (v != null && test(v)) return v; } return fallback; }
  function isPow(v, n) { if (v < 0) return false; var c = Math.round(Math.pow(v, 1 / n)); for (var d = Math.max(0, c - 1); d <= c + 1; d++) if (Math.pow(d, n) === v) return true; return false; }
  function intRoot(v, n) { var c = Math.round(Math.pow(v, 1 / n)); for (var d = Math.max(0, c - 1); d <= c + 1; d++) if (Math.pow(d, n) === v) return d; return null; }
  function nlist(nums) { var s = nums.map(function (n) { return t(F(n)); }); return s.length === 2 ? s[0] + ' and ' + s[1] : s.slice(0, -1).join(', ') + ' and ' + s[s.length - 1]; }
  function rad(k, n, m) { return ex.texRadical([k, 1], n, m); }
  function rt(n, inner) { return ex.texRoot(n, inner); }
  function rootWord(n) { return n === 2 ? 'square' : n === 3 ? 'cube' : n === 4 ? 'fourth' : n === 5 ? 'fifth' : n + 'th'; }
  function powWord(n) { return n === 2 ? 'square' : n === 3 ? 'cube' : n === 4 ? 'fourth power' : n + 'th power'; }
  function normX(s) { return String(s == null ? '' : s).replace(/(\d)\s*[xX]\s*(?=\d)/g, '$1*'); }
  function dec2(v) { return String(Math.round(v * 100) / 100); }

  /* ---------- checkers ---------- */
  /* n as a product of primes (exp: 'either' or 'required'); a bare number equal to n is a format slip; alts = [{v, code, hint}] */
  function prodChk(n, exp, alts) {
    var c = K.product(n, exp || 'either');
    return function (resp) {
      var s = normX(resp), pn = HW.parse.number(s), pp = HW.parse.product(s), v = pn.ok ? pn.value : pp.ok ? pp.value : null;
      if (pn.ok && pn.value === n && !nt.isPrime(n)) return form('as-number', 'Right value — now write it as a product of prime factors' + (exp === 'required' ? ' in exponent form' : '') + ', like ' + t('2^{3}\\times 3') + '.');
      if (v != null && v !== n) for (var i = 0; i < (alts || []).length; i++) if (v === alts[i].v) return wrong(alts[i].code, alts[i].hint);
      return c(s);
    };
  }
  function numChk(n, alts, extra) {
    return K.number(n, function (v) {
      for (var i = 0; i < (alts || []).length; i++) if (v === alts[i].v && v !== n) return { code: alts[i].code, hint: alts[i].hint };
      return extra ? extra(v) : null;
    });
  }
  function gcfDiag(nums) {
    var g = gcfA(nums), L = lcmA(nums), pr = prodOf(nums), mn = Math.min.apply(null, nums);
    return function (v) {
      if (v === L && L !== g) return { code: 'gcf-lcm', hint: 'That’s the <b>least common multiple</b>. The GCF is the largest number that divides <b>into</b> every one of them, so it can’t be bigger than ' + t(F(mn)) + '.' };
      if (v === pr && pr !== g) return { code: 'gcf-product', hint: 'Multiplying the numbers gives a common <b>multiple</b>, not a common factor. The GCF has to divide into each number.' };
      if (!(v > 0) || v % 1) return null;
      var miss = nums.filter(function (n) { return n % v; });
      if (!miss.length) return { code: 'gcf-not-greatest', hint: t(F(v)) + ' divides into every number, but it isn’t the <b>greatest</b> common factor. Compare the prime factorizations again: use every shared prime, to its lowest power.' };
      return { code: 'gcf-not-common', hint: t(F(v)) + ' doesn’t divide evenly into ' + t(F(miss[0])) + ', so it isn’t a common factor.' };
    };
  }
  function lcmDiag(nums) {
    var g = gcfA(nums), L = lcmA(nums), pr = prodOf(nums), mx = Math.max.apply(null, nums);
    return function (v) {
      if (v === g && g !== L) return { code: 'lcm-gcf', hint: 'That’s the <b>greatest common factor</b>. The LCM is a common <b>multiple</b>: every number divides into it, so it is at least ' + t(F(mx)) + '.' };
      if (v === pr && pr !== L) return { code: 'lcm-product', hint: 'Multiplying the numbers gives <i>a</i> common multiple, but not the <b>least</b> one: shared prime factors got counted twice. Use each prime once, at its highest power.' };
      if (!(v > 0) || v % 1) return null;
      var miss = nums.filter(function (n) { return v % n; });
      if (!miss.length) return { code: 'lcm-not-least', hint: t(F(v)) + ' is a common multiple, but not the <b>least</b> one. Use each prime only once, at its highest power.' };
      return { code: 'lcm-not-multiple', hint: t(F(miss[0])) + ' doesn’t divide evenly into ' + t(F(v)) + ', so it isn’t a common multiple.' };
    };
  }
  /* the k-th root as a whole number (or a product), or "none" when the number isn't a perfect k-th power */
  function isNo(s) { return /^(no|none|nope|not|neither|n\/a|-+|—)(\s.*|\.)?$/.test(s); }
  function isYes(s) { return /^(yes|y|yep)\b/.test(s); }
  function valChk(target, diag) {
    return function (resp) {
      var s = normX(resp), pn = HW.parse.number(s), v = null;
      if (pn.ok) v = pn.value; else { var p = HW.parse.product(s); if (p.ok) v = p.value; else return form(pn.code === 'empty' ? 'empty' : 'notnumber', pn.code === 'empty' ? 'Type your answer first.' : 'Type a whole number (or a product such as ' + t('2^{2}\\times 3') + ').'); }
      if (v === target) return ok();
      var h = diag ? diag(v) : null;
      return h ? wrong(h.code, h.hint) : wrong('value', null);
    };
  }
  function rootOrNone(root, k, nTex, diag) {
    var word = rootWord(k), vc = root != null ? valChk(root, diag) : null, test = k === 2 ? 'even' : 'a multiple of ' + t('3');
    return function (resp) {
      var s = String(resp == null ? '' : resp).trim().toLowerCase();
      if (!s) return form('empty', 'Type the ' + word + ' root, or <b>none</b> if it is not a perfect ' + word + '.');
      if (isNo(s)) return root == null ? ok() : wrong('said-not-perfect', 'Look at the exponents in the prime factorization: are they all ' + test + '? Then ' + t(nTex) + ' <b>is</b> a perfect ' + word + '.');
      if (isYes(s)) return root != null ? form('yes-root', 'Right, it is a perfect ' + word + ' — now type the ' + word + ' root itself.') : wrong('said-perfect', 'Check the exponents in the prime factorization: are they <b>all</b> ' + test + '?');
      if (root == null) {
        var s2 = normX(s), pn = HW.parse.number(s2), pp = HW.parse.product(s2);
        if (!pn.ok && !pp.ok) return form('notnumber', 'Type a number, or <b>none</b>.');
        var v = pn.ok ? pn.value : pp.value, big = Math.pow(v, k);
        return wrong('said-perfect', (v % 1 ? '' : (big < 1e12 ? t(F(v) + '^{' + k + '}=' + F(big)) + ', not ' + t(nTex) + '. ' : '')) + 'Look at the exponents in the prime factorization: are they all ' + test + '? If not, there is no whole-number ' + word + ' root — type <b>none</b>.');
      }
      return vc(s);
    };
  }
  /* clock times ("9:06 p.m.", "21:06", "noon") — the same reading rules as Lesson 2 */
  function fmtTime(min) { var h = Math.floor(min / 60) % 24, m = min % 60; return (h % 12 || 12) + ':' + (m < 10 ? '0' : '') + m + (h < 12 ? ' a.m.' : ' p.m.'); }
  function parseTime(s) {
    s = String(s == null ? '' : s).trim().toLowerCase().replace(/\s+/g, ' ');
    if (/^(12 ?)?noon$|^12:00 ?noon$/.test(s)) return { h: 12, m: 0, ap: 'p' };
    var m = /^(\d{1,2}) ?[:.h] ?(\d{1,3}) ?(a\.? ?m\.?|p\.? ?m\.?|noon)?$/.exec(s) || /^(\d{1,2})() ?(a\.? ?m\.?|p\.? ?m\.?|o'?clock)$/.exec(s);
    if (!m) return null;
    return { h: Number(m[1]), m: Number(m[2] || 0), ap: m[3] ? (m[3][0] === 'a' ? 'a' : m[3][0] === 'p' || m[3] === 'noon' ? 'p' : null) : null };
  }
  function timeChk(E, start, addMin, wrongs) {
    return function (resp) {
      var raw = String(resp == null ? '' : resp).trim();
      if (!raw) return form('empty', 'Type the time, like ' + fmtTime(start) + '.');
      var p = parseTime(raw);
      if (!p || p.h > 23) return form('time-format', 'Write a clock time, like ' + fmtTime(start) + ' (hours, a colon, then minutes).');
      if (p.m >= 60) return form('time-minutes', 'There are only ' + t('60') + ' minutes in an hour — turn the extra minutes into hours.');
      var T = (p.h % 12) * 60 + p.m;
      if (T === E % 720) {
        if (p.h > 12) return (p.h * 60 + p.m) % 1440 === E % 1440 ? ok() : wrong('time-ampm', 'Right clock time — but check a.m. or p.m.');
        if (p.ap && (p.ap === 'p') !== (E % 1440 >= 720)) return wrong('time-ampm', 'Right clock time — but check a.m. or p.m.');
        return ok();
      }
      for (var i = 0; i < (wrongs || []).length; i++) if (wrongs[i].add !== addMin && T === (start + wrongs[i].add) % 720) return wrong(wrongs[i].code, wrongs[i].hint);
      return wrong('value', null);
    };
  }

  /* ---------- figures (inline SVG) ---------- */
  function svgBox(w, h, body, label) {
    return '<div style="margin:.4em 0 .2em"><svg viewBox="0 0 ' + w + ' ' + h + '" width="100%" style="max-width:' + w + 'px;display:block" role="img" aria-label="' + HW.esc(label) + '" fill="none" stroke="currentColor" stroke-width="1.5" font-size="16" font-family="KaTeX_Main,\'Times New Roman\',serif">' + body + '</svg></div>';
  }
  function txt(x, y, s, o) { o = o || {}; return '<text x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" fill="' + (o.fill || 'currentColor') + '" stroke="none" text-anchor="middle" dominant-baseline="central"' + (o.size ? ' font-size="' + o.size + '"' : '') + (o.it ? ' font-style="italic"' : '') + (o.rot ? ' transform="rotate(' + o.rot + ' ' + x.toFixed(1) + ' ' + y.toFixed(1) + ')"' : '') + '>' + s + '</text>'; }
  /* the paper's factor-tree layout: lab[node] = { v: number } or { box: 'A' } */
  var TREE_POS = { r: [0, 0], a: [-1.9, -1.25], b: [1.6, -1.25], a1: [-2.75, -2.6], a2: [-1.05, -2.6], b1: [0.75, -2.6], b2: [2.45, -2.6], c1: [0, -3.95], c2: [1.25, -3.95], e1: [2.1, -3.95], e2: [2.95, -3.95] };
  var TREE_EDGES = [['r', 'a'], ['r', 'b'], ['a', 'a1'], ['a', 'a2'], ['b', 'b1'], ['b', 'b2'], ['b1', 'c1'], ['b1', 'c2'], ['b2', 'e1'], ['b2', 'e2']];
  function treeSvg(lab) {
    var S = 62, X = function (x) { return (x + 3.35) * S; }, Y = function (y) { return 20 - y * S; }, body = '';
    TREE_EDGES.forEach(function (e) { var p = TREE_POS[e[0]], q = TREE_POS[e[1]]; body += '<line x1="' + X(p[0]).toFixed(1) + '" y1="' + (Y(p[1]) + 13).toFixed(1) + '" x2="' + X(q[0]).toFixed(1) + '" y2="' + (Y(q[1]) - 15).toFixed(1) + '"/>'; });
    Object.keys(TREE_POS).forEach(function (id) {
      var p = TREE_POS[id], L = lab[id], x = X(p[0]), y = Y(p[1]);
      if (L.box) body += '<rect x="' + (x - 21).toFixed(1) + '" y="' + (y - 14).toFixed(1) + '" width="42" height="28" rx="3" stroke-width="1.4"/>' + txt(x, y, L.box, { size: 13, fill: '#8a91a0', it: true });
      else body += txt(x, y, F(L.v, true));
    });
    return svgBox(Math.round(6.7 * S), Math.round(3.95 * S + 40), body, 'factor tree with four blank boxes A, B, C and D');
  }
  function squareSvg(d) {
    var body = '<rect x="40" y="20" width="130" height="130"/><line x1="40" y1="150" x2="170" y2="20" stroke-dasharray="6 4"/>' +
      '<path stroke-width="1.1" d="M40 138 H52 V150"/>' + txt(183, 85, 's', { it: true }) + txt(105, 166, 's', { it: true }) + txt(84, 64, d + ' cm', { rot: -45, size: 15 });
    return svgBox(200, 178, body, 'a square with a dashed diagonal of ' + d + ' cm and sides s');
  }

  /* ---------- Q1: factor tree ---------- */
  function q1Shared(r) {
    return find(function () {
      var ap = sortN(r.sample([2, 3, 5, 7], 2)), cp = sortN(r.sample([2, 3, 5, 7], 2)), p = r.pick([2, 3, 5]);
      var A = ap[0] * ap[1], C = cp[0] * cp[1], D = p * p, B = C * D;
      return { ap: ap, cp: cp, p: p, A: A, B: B, C: C, D: D, N: A * B };
    }, function (s) { return s.N >= 400 && s.N <= 2000 && s.C !== s.D && s.A !== s.B && s.A !== s.C; }, { ap: [2, 5], cp: [2, 3], p: 3, A: 10, B: 54, C: 6, D: 9, N: 540 });
  }
  function q1Tree(s) { return treeSvg({ r: { v: s.N }, a: { box: 'A' }, b: { v: s.B }, a1: { v: s.ap[0] }, a2: { box: 'B' }, b1: { v: s.C }, b2: { box: 'C' }, c1: { box: 'D' }, c2: { v: s.cp[1] }, e1: { v: s.p }, e2: { v: s.p } }); }

  /* ---------- Q4: perfect square / cube / both / neither ---------- */
  function q4Shared(r) {
    var s = r.pick([33, 35, 36, 39, 40, 42, 44, 45, 48, 50, 52, 54, 55, 56, 60, 63, 65, 66]), c = r.pick([10, 12, 14, 15, 18, 20, 21]), b = Math.pow(r.pick([3, 4, 5]), 6);
    var nei = find(function () { var ps = sortN(r.sample([2, 3, 5, 7], r.pick([2, 2, 3]))); return fSort(ps.map(function (p) { return [p, r.int(1, 6)]; })); }, function (f) {
      var e = f.map(function (pe) { return pe[1]; }), n = fVal(f);
      return n >= 1000 && n <= 6000 && !e.every(function (x) { return x % 2 === 0; }) && !e.every(function (x) { return x % 3 === 0; }) && e.filter(function (x) { return x >= 2; }).length >= 2;
    }, [[2, 3], [3, 2], [5, 2]]);
    return { nums: r.shuffle([s * s, c * c * c, b, fVal(nei)]) };
  }
  function q4Part(n) {
    var f = nt.factor(n), e = f.map(function (pe) { return pe[1]; }), sq = e.every(function (x) { return x % 2 === 0; }), cu = e.every(function (x) { return x % 3 === 0; });
    var sr = sq ? intRoot(n, 2) : null, cr = cu ? intRoot(n, 3) : null, srF = f.map(function (pe) { return [pe[0], pe[1] / 2]; }), crF = f.map(function (pe) { return [pe[0], pe[1] / 3]; });
    var label = sq && cu ? 'both' : sq ? 'a perfect square (not a cube)' : cu ? 'a perfect cube (not a square)' : 'neither';
    var odd = e.filter(function (x) { return x % 2; })[0], non3 = e.filter(function (x) { return x % 3; })[0];
    var d2 = function (v) {
      if (cr != null && v === cr) return { code: 'used-cube-root', hint: 'That’s the <b>cube</b> root. For the square root, divide each exponent by ' + t('2') + '.' };
      if (v === n / 2) return { code: 'root-value', hint: 'A square root isn’t half the number. Halve each <b>exponent</b> in the prime factorization.' };
      if (v > 0 && v % 1 === 0 && v * v < 1e12) return { code: 'root-value', hint: t(F(v) + '^{2}=' + F(v * v)) + ', not ' + t(F(n)) + '. Halve each exponent in the prime factorization.' };
      return null;
    };
    var d3 = function (v) {
      if (sr != null && v === sr) return { code: 'used-square-root', hint: 'That’s the <b>square</b> root. For the cube root, divide each exponent by ' + t('3') + '.' };
      if (v === n / 3) return { code: 'root-value', hint: 'A cube root isn’t a third of the number. Divide each <b>exponent</b> by ' + t('3') + '.' };
      if (v > 0 && v % 1 === 0 && v * v * v < 1e12) return { code: 'root-value', hint: t(F(v) + '^{3}=' + F(v * v * v)) + ', not ' + t(F(n)) + '. Divide each exponent in the prime factorization by ' + t('3') + '.' };
      return null;
    };
    var sol = t(F(n) + '=' + K.fac(n)) + '.<br><b>Square?</b> ' + (sq ? 'Every exponent is even, so it <b>is</b> a perfect square: ' + t('\\sqrt{' + F(n) + '}=' + fTex(srF) + '=' + F(sr)) + '.' : 'The exponent ' + t(odd) + ' is odd, so it is <b>not</b> a perfect square.') +
      '<br><b>Cube?</b> ' + (cu ? 'Every exponent is a multiple of ' + t('3') + ', so it <b>is</b> a perfect cube: ' + t('\\sqrt[3]{' + F(n) + '}=' + fTex(crF) + '=' + F(cr)) + '.' : 'The exponent ' + t(non3) + ' is not a multiple of ' + t('3') + ', so it is <b>not</b> a perfect cube.') +
      '<br>So ' + t(F(n)) + ' is <b>' + label + '</b>.';
    var p = P.fields('Is ' + t(F(n)) + ' a perfect square, a perfect cube, both, or neither? Write its prime factorization, then give each root that is a whole number. Type <b>none</b> for a root that is not a whole number.',
      [{ name: 'Prime factorization', before: t(F(n) + '='), mode: 'math', wide: true }, { name: 'Square root', before: t('\\sqrt{' + F(n) + '}='), mode: 'math', none: true }, { name: 'Cube root', before: t('\\sqrt[3]{' + F(n) + '}='), mode: 'math', none: true }],
      [prodChk(n, 'either'), rootOrNone(sr, 2, F(n), d2), rootOrNone(cr, 3, F(n), d3)], [plainFac(n), sq ? String(sr) : 'none', cu ? String(cr) : 'none'],
      t(F(n) + '=' + K.fac(n)) + ' — ' + label + (sq ? '; ' + t('\\sqrt{' + F(n) + '}=' + F(sr)) : '') + (cu ? '; ' + t('\\sqrt[3]{' + F(n) + '}=' + F(cr)) : ''), sol,
      ['Factor ' + t(F(n)) + ' into primes and look at the exponents.', 'A perfect square has every exponent even; a perfect cube has every exponent a multiple of ' + t('3') + '. Divide the exponents by ' + t('2') + ' or ' + t('3') + ' to get the root.'],
      'square/cube/both/neither: ' + n);
    p.bad = [[plainFac(n), sq ? 'none' : '2', cu ? 'none' : '2'], [plainFac(n), sq ? String(sr + 1) : 'none', cu ? String(cr + 1) : 'none'], [plainFac(n), cu ? String(cr) : 'none', sq ? String(sr) : 'none']].filter(function (b) { return b.join('|') !== p.key.join('|'); });
    return p;
  }

  /* ---------- Q5: smallest n that makes Mn a perfect cube ---------- */
  function powerUp(f, k) {
    var kf = f.map(function (pe) { return [pe[0], (k - pe[1] % k) % k]; }), up = f.map(function (pe) { return [pe[0], pe[1] + (k - pe[1] % k) % k]; });
    return { kf: kf, k: fVal(kf), up: up, rootF: up.map(function (pe) { return [pe[0], pe[1] / k]; }), root: fVal(up.map(function (pe) { return [pe[0], pe[1] / k]; })) };
  }

  /* ---------- Q11: choose GCF or LCM ---------- */
  var GCF_CTX = [
    { who: 'A coach packs identical kits', unit: 'kits', each: 'kit', items: ['basketballs', 'pylons', 'skipping ropes'] },
    { who: 'A florist makes identical bouquets', unit: 'bouquets', each: 'bouquet', items: ['roses', 'tulips', 'daisies'] },
    { who: 'A teacher makes identical supply packs', unit: 'packs', each: 'pack', items: ['pencils', 'erasers', 'sticky notes'] },
    { who: 'A baker fills identical gift boxes', unit: 'gift boxes', each: 'box', items: ['cookies', 'muffins', 'brownies'] }];
  var LCM_CTX = [
    { kind: 'lights', unit: 's', starts: [1260, 1230, 1290, 1200] },
    { kind: 'buses', unit: 'min', starts: [420, 450, 480, 390] },
    { kind: 'runners', unit: 's' }];
  function gcfScenario(r) {
    var c = r.pick(GCF_CTX);
    var v = find(function () { var g = r.pick([12, 14, 15, 16, 18, 21, 24]), m = r.pick([[2, 3, 5], [3, 5, 7], [2, 3, 7], [3, 4, 5], [2, 5, 7], [2, 5, 9]]); return { g: g, m: m }; }, function (v) { return v.g * v.m[2] <= 150; }, { g: 24, m: [2, 3, 5] });
    return { c: c, g: v.g, m: v.m, nums: v.m.map(function (x) { return x * v.g; }) };
  }
  function lcmScenario(r) {
    var c = r.pick(LCM_CTX), pool = c.unit === 'min' ? [8, 10, 12, 15, 18, 20, 24, 25, 30, 36, 40, 45] : [12, 15, 16, 18, 20, 24, 25, 30, 36, 40, 45, 48, 50, 60, 75, 80, 90];
    var v = find(function () { return sortN(r.sample(pool, 3)); }, function (v) {
      var L = lcmA(v);
      for (var i = 0; i < 3; i++) for (var j = 0; j < 3; j++) if (i !== j && v[j] % v[i] === 0) return false;
      if (L === prodOf(v) || L < 2 * v[2]) return false;
      return c.unit === 'min' ? L >= 60 && L <= 180 && L % 5 === 0 : L % 60 === 0 && L >= 120 && L <= 900;
    }, c.unit === 'min' ? [12, 15, 20] : [18, 24, 30]);
    return { c: c, v: v, L: lcmA(v), g: gcfA(v), start: c.starts ? r.pick(c.starts) : null };
  }
  function gcfText(s) { return s.c.who + ' from ' + t(s.nums[0]) + ' ' + s.c.items[0] + ', ' + t(s.nums[1]) + ' ' + s.c.items[1] + ' and ' + t(s.nums[2]) + ' ' + s.c.items[2] + ', with nothing left over. What is the greatest number of ' + s.c.unit + ', and what is in each ' + s.c.each + '?'; }
  function lcmText(s) {
    var v = s.v;
    if (s.c.kind === 'lights') return 'Three lights flash every ' + t(v[0]) + ' s, ' + t(v[1]) + ' s and ' + t(v[2]) + ' s. They flash together at ' + fmtTime(s.start) + ' When will they next all flash together?';
    if (s.c.kind === 'buses') return 'Three buses leave the same stop every ' + t(v[0]) + ' min, ' + t(v[1]) + ' min and ' + t(v[2]) + ' min. They all leave together at ' + fmtTime(s.start) + ' When will they next all leave together?';
    return 'Three runners start together and take ' + t(v[0]) + ' s, ' + t(v[1]) + ' s and ' + t(v[2]) + ' s to run one lap. After how long are all three back at the start line together?';
  }
  function chooseGcfPart(r, s) {
    var mn = s.nums[0], items = s.c.items, L = lcmA(s.nums);
    return P.mc(r, gcfText(s) + '<br><b>Does this problem need the GCF or the LCM, and why?</b>', [
      { html: '<b>GCF</b>: the totals are shared out equally, so the number of ' + s.c.unit + ' must divide evenly <b>into</b> every total. The greatest such number is the GCF.', right: true },
      { html: '<b>LCM</b>: it is the least number that ' + t(s.nums[0]) + ', ' + t(s.nums[1]) + ' and ' + t(s.nums[2]) + ' all divide into.', why: 'The LCM is ' + t(F(L)) + ' — more ' + s.c.unit + ' than there are ' + items[0] + '! The number of ' + s.c.unit + ' must divide <b>into</b> each total, so it is a common factor.' },
      { html: '<b>GCF</b>: the GCF is the greatest number, and we want as many items as possible in each ' + s.c.each + '.', why: 'Right tool, wrong reason. The GCF is the greatest number that <b>divides into</b> all three totals — the greatest number of ' + s.c.unit + ', not the most items per ' + s.c.each + '.' },
      { html: '<b>LCM</b>: three different items are being combined into each ' + s.c.each + '.', why: 'Combining items doesn’t decide it. Ask: must the answer divide <b>into</b> the totals (a factor) or be divisible <b>by</b> them (a multiple)?' }],
      'Every ' + s.c.each + ' gets the same share of each item with nothing left over, so the number of ' + s.c.unit + ' divides evenly into ' + nlist(s.nums) + ': it is a common <b>factor</b>, and the greatest one is the <b>GCF</b>. (The LCM, ' + t(F(L)) + ', is a common multiple — far more ' + s.c.unit + ' than there are items.)',
      ['Must the number of ' + s.c.unit + ' divide <b>into</b> the totals, or must the totals divide into it?'], 'choose GCF: ' + s.nums.join(','));
  }
  function chooseLcmPart(r, s) {
    var v = s.v, what = s.c.kind === 'lights' ? 'flash' : s.c.kind === 'buses' ? 'leave' : 'reach the line';
    var g = s.g;
    return P.mc(r, lcmText(s) + '<br><b>Does this problem need the GCF or the LCM, and why?</b>', [
      { html: '<b>LCM</b>: each one ' + (s.c.kind === 'runners' ? 'is back at the line' : s.c.kind === 'lights' ? 'flashes' : 'leaves') + ' only at multiples of its own time, so they ' + what + ' together at a common <b>multiple</b>. The first one is the LCM.', right: true },
      { html: '<b>GCF</b>: we want the largest time that divides into ' + t(v[0]) + ', ' + t(v[1]) + ' and ' + t(v[2]) + '.', why: 'That is the GCF, ' + t(g) + ' ' + s.c.unit + ' — but after ' + t(g) + ' ' + s.c.unit + ' the ' + t(v[2]) + '-' + s.c.unit + ' one hasn’t come around even once. The shared time must be a <b>multiple</b> of each time.' },
      { html: '<b>LCM</b>: the LCM is used whenever a question is about time.', why: 'Right tool, wrong reason: it isn’t about time. What matters is that the answer must be a <b>multiple</b> of every interval.' },
      { html: '<b>GCF</b>: they happen at the same moment, so we need a common factor of the times.', why: 'A common factor of the times (like ' + t(g) + ') comes too soon for any of them to repeat. They line up again at a common <b>multiple</b>.' }],
      'Each one repeats at multiples of its own time (' + nlist(v) + ' ' + s.c.unit + '), so they ' + what + ' together at a common <b>multiple</b>, and the first one is the <b>LCM</b>. (The GCF, ' + t(g) + ' ' + s.c.unit + ', is a common factor: too soon for any of them to repeat.)',
      ['Is the shared moment a multiple of the times, or a factor of them?'], 'choose LCM: ' + v.join(','));
  }
  function solveGcfPart(s) {
    var c = s.c, g = s.g, nums = s.nums;
    var fields = [{ name: c.unit, label: 'Number of ' + c.unit + ':' }].concat(c.items.map(function (it) { return { name: it, label: 'Each ' + c.each + ':', after: it }; }));
    var per = nums.map(function (x) { return x / g; });
    var checks = [K.number(g, gcfDiag(nums))].concat(per.map(function (q, i) { return numChk(q, [{ v: nums[i], code: 'kits-total', hint: 'That’s the total number of ' + c.items[i] + '. Share it equally among the ' + c.unit + ': divide by the number of ' + c.unit + '.' }, { v: g, code: 'kits-total', hint: 'That’s the number of ' + c.unit + '. How many ' + c.items[i] + ' go into each one?' }]); }));
    var p = P.fields(gcfText(s), fields, checks, [String(g)].concat(per.map(String)),
      t(g) + ' ' + c.unit + ', each with ' + per.map(function (q, i) { return t(q) + ' ' + c.items[i]; }).join(', '),
      '<b>GCF</b>: the totals are split into the greatest number of equal groups.<br>' + nums.map(facEq).join(', ') + '.<br>Shared primes, lowest powers: ' + t('\\text{GCF}=' + K.fac(g) + '=' + g) + ' ' + c.unit + '.<br>Each ' + c.each + ': ' + nums.map(function (x, i) { return t(x + '\\div ' + g + '=' + x / g) + ' ' + c.items[i]; }).join(', ') + '.',
      ['Find the GCF of the three totals: that is the number of ' + c.unit + '.', 'Then divide each total by it.'], 'GCF word problem ' + nums.join(','));
    p.bad = [[String(lcmA(nums))].concat(per.map(String)), [String(g)].concat(nums.map(String))];
    return p;
  }
  function solveLcmPart(s) {
    var v = s.v, L = s.L, c = s.c, u = c.unit, sol0 = '<b>LCM</b>: the first time that is a multiple of all three.<br>' + v.map(facEq).join(', ') + '.<br>Every prime, highest power: ' + t('\\text{LCM}=' + K.fac(L) + '=' + F(L)) + ' ' + u + '.';
    var lc = K.number(L, lcmDiag(v)), p;
    if (c.kind === 'runners') {
      p = P.fields(lcmText(s), [{ name: 'Seconds', label: 'Together again after', after: 's' }, { name: 'Minutes', label: 'That is', after: 'min' }],
        [lc, numChk(L / 60, [{ v: L / 100, code: 'lcm-units', hint: 'There are ' + t('60') + ' seconds in a minute, not ' + t('100') + '.' }])], [String(L), String(L / 60)],
        t(F(L)) + ' s = ' + t(L / 60) + ' min', sol0 + '<br>' + t(F(L) + '\\text{ s}\\div 60=' + L / 60) + ' min.',
        ['Find the LCM of the three lap times.', 'Divide by ' + t('60') + ' to change seconds to minutes.'], 'runners LCM ' + v.join(','));
    } else {
      var addMin = u === 's' ? L / 60 : L, E = s.start + addMin;
      var tw = [{ add: u === 's' ? s.g / 60 : s.g, code: 'lcm-gcf', hint: 'That adds the GCF. They line up again at a common <b>multiple</b> of the times.' }, { add: L / 100, code: 'lcm-units', hint: 'There are ' + t('60') + ' seconds in a minute, not ' + t('100') + '.' }, { add: prodOf(v) / (u === 's' ? 60 : 1), code: 'lcm-product', hint: 'Multiplying the three times gives <i>a</i> common multiple, but not the first one. Find the LCM.' }];
      var tc = timeChk(E, s.start, addMin, tw.filter(function (w) { return Number.isInteger(w.add) && (u === 's' || w.code !== 'lcm-units'); }));
      p = P.fields(lcmText(s), [{ name: 'Wait', label: 'Together again after', after: u }, { name: 'Time', label: 'Clock time:', mode: 'text', placeholder: 'e.g. ' + fmtTime(s.start) }],
        [lc, tc], [String(L), fmtTime(E)], t(F(L)) + ' ' + u + ', at ' + fmtTime(E),
        sol0 + (u === 's' ? '<br>' + t(F(L) + '\\text{ s}=' + L / 60 + '\\text{ min}') + ', so ' : '<br>') + fmtTime(s.start) + ' + ' + t(addMin) + ' min = <b>' + fmtTime(E) + '</b>',
        ['Find the LCM of the three times.', 'Then add it to ' + fmtTime(s.start)], (c.kind) + ' LCM ' + v.join(','));
    }
    p.bad = [[String(s.g), p.key[1]], [String(prodOf(v)), p.key[1]]].filter(function (b) { return b[0] !== String(L); });
    return p;
  }

  /* ---------- Q13 / Q15: real-number sets ---------- */
  var SET_COLS = [{ id: 'N', html: t('N'), label: 'N' }, { id: 'W', html: t('W'), label: 'W' }, { id: 'I', html: t('I'), label: 'I' }, { id: 'Q', html: t('Q'), label: 'Q' }, { id: 'Qb', html: t('\\overline{Q}'), label: 'Q-bar' }];
  var SETS = { nat: ['N', 'W', 'I', 'Q'], zero: ['W', 'I', 'Q'], negint: ['I', 'Q'], frac: ['Q'], irr: ['Qb'] };
  var SET_TEX = { N: 'N', W: 'W', I: 'I', Q: 'Q', Qb: '\\overline{Q}' };
  function setHint(c, got) {
    got = got || []; var has = function (x) { return got.indexOf(x) >= 0; }, X = t(c.tex), why = c.note ? ' (' + t(c.note) + ')' : '';
    if (has('Q') && has('Qb')) return { code: 'sets-both', hint: 'A number is rational <b>or</b> irrational, never both. Decide which one ' + X + ' is.' };
    if (c.cls === 'irr' && !has('Qb')) return { code: 'sets-irr', hint: X + ' is irrational' + why + ': its decimal never ends and never repeats.' };
    if (c.cls !== 'irr' && has('Qb')) return { code: 'sets-rat', hint: X + ' is rational' + why + ': it can be written as a fraction of integers.' };
    if (c.cls === 'irr' && (has('N') || has('W') || has('I') || has('Q'))) return { code: 'sets-irr-int', hint: 'An irrational number belongs only to ' + t('\\overline{Q}') + ' here: ' + t('N') + ', ' + t('W') + ', ' + t('I') + ' and ' + t('Q') + ' hold only rational numbers.' };
    if (c.cls === 'zero' && has('N')) return { code: 'sets-zero-N', hint: t('0') + ' is a whole number, but the natural numbers start at ' + t('1') + '.' };
    if (c.cls === 'negint' && (has('N') || has('W'))) return { code: 'sets-neg', hint: X + why + ' is negative. Natural and whole numbers are never negative.' };
    if (c.cls === 'frac' && (has('N') || has('W') || has('I'))) return { code: 'sets-frac', hint: X + why + ' is not an integer, so it isn’t in ' + t('N') + ', ' + t('W') + ' or ' + t('I') + '.' };
    if (c.cls !== 'irr' && !has('Q')) return { code: 'sets-Q', hint: X + why + ' can be written as a fraction of integers' + (c.cls !== 'frac' ? ' (every integer can: ' + t('n=\\frac{n}{1}') + ')' : '') + ', so it is rational.' };
    if (c.cls === 'nat' && !(has('N') && has('W') && has('I'))) return { code: 'sets-nat', hint: X + why + ' is a natural (counting) number, so it is also a whole number and an integer.' };
    if (c.cls === 'zero' && !(has('W') && has('I'))) return { code: 'sets-zero', hint: t('0') + ' is a whole number and an integer.' };
    if (c.cls === 'negint' && !has('I')) return { code: 'sets-negint', hint: X + why + ' is a negative integer.' };
    return null;
  }
  function setList(s) { return t(s.map(function (x) { return SET_TEX[x]; }).join(',\\ ')); }

  /* ---------- Q17: true / false with a justification ---------- */
  var NONSQ = [2, 3, 5, 6, 7, 10, 11];
  function tfSlotA(r) {
    var k = r.pick(NONSQ), j = r.pick(NONSQ.filter(function (x) { return x !== k; })), s = r.int(4, 12), m = r.pick([20, 8, 12, 18, 27, 28, 45, 50]), mm = ex.nthFactor(m, 2);
    return r.pick([
      { claim: 'The sum of two irrational numbers is always irrational.', opts: [
        { html: '<b>False.</b> ' + t('\\sqrt{' + k + '}+\\left(-\\sqrt{' + k + '}\\right)=0') + ', which is rational.', right: true },
        { html: '<b>True.</b> Adding two decimals that never end and never repeat always gives another decimal that never ends and never repeats.', why: 'One counterexample is enough to make “always” false. Try ' + t('\\sqrt{' + k + '}+\\left(-\\sqrt{' + k + '}\\right)') + '.' },
        { html: '<b>True.</b> An irrational number can’t be written as a fraction, so a sum of two of them can’t either.', why: 'The reason sounds right, but test it: ' + t('\\sqrt{' + k + '}+\\left(-\\sqrt{' + k + '}\\right)=0=\\frac{0}{1}') + '.' },
        { html: '<b>False.</b> ' + t('\\sqrt{' + k + '}+\\sqrt{' + j + '}=\\sqrt{' + (k + j) + '}') + ', which is rational.', why: t('\\sqrt{' + k + '}+\\sqrt{' + j + '}') + ' is not ' + t('\\sqrt{' + (k + j) + '}') + ' (roots don’t add like that), and an irrational sum isn’t a counterexample anyway.' }],
        sol: '<b>False.</b> One counterexample is enough: ' + t('\\sqrt{' + k + '}') + ' and ' + t('-\\sqrt{' + k + '}') + ' are both irrational, but ' + t('\\sqrt{' + k + '}+\\left(-\\sqrt{' + k + '}\\right)=0') + ', which is rational. (Or ' + t('(3+\\sqrt{' + k + '})+(3-\\sqrt{' + k + '})=6') + '.)' },
      { claim: 'The product of two irrational numbers is always irrational.', opts: [
        { html: '<b>False.</b> ' + t('\\sqrt{' + k + '}\\times\\sqrt{' + k + '}=' + k) + ', which is rational.', right: true },
        { html: '<b>True.</b> ' + t('\\sqrt{' + k + '}\\times\\sqrt{' + j + '}=\\sqrt{' + k * j + '}') + ' is irrational.', why: 'One example where the product is irrational doesn’t show it is <b>always</b> irrational. Try ' + t('\\sqrt{' + k + '}\\times\\sqrt{' + k + '}') + '.' },
        { html: '<b>False.</b> ' + t('\\sqrt{' + k + '}\\times\\sqrt{' + j + '}=\\sqrt{' + k * j + '}') + ', which is rational.', why: t(k * j) + ' is not a perfect square, so ' + t('\\sqrt{' + k * j + '}') + ' is irrational — not a counterexample.' },
        { html: '<b>True.</b> Multiplying two decimals that never repeat always gives a decimal that never repeats.', why: 'Test it: ' + t('\\sqrt{' + k + '}\\times\\sqrt{' + k + '}=' + k) + '.' }],
        sol: '<b>False.</b> ' + t('\\sqrt{' + k + '}') + ' is irrational, but ' + t('\\sqrt{' + k + '}\\times\\sqrt{' + k + '}=' + k) + ', which is rational. One counterexample is enough to show “always” is false.' },
      { claim: 'Every square root is an irrational number.', opts: [
        { html: '<b>False.</b> ' + t('\\sqrt{' + s * s + '}=' + s) + ', which is rational.', right: true },
        { html: '<b>True.</b> A square root sign always gives a decimal that never ends.', why: 'Only the square roots of non-perfect squares are irrational: ' + t('\\sqrt{' + s * s + '}=' + s) + '.' },
        { html: '<b>True.</b> ' + t('\\sqrt{' + k + '}\\approx ' + Math.sqrt(k).toFixed(4) + '\\ldots') + ' never ends and never repeats.', why: 'One irrational example doesn’t prove “every”. Look for a square root that is a whole number.' },
        { html: '<b>False.</b> ' + t('\\sqrt{' + k + '}') + ' is rational.', why: t(k) + ' is not a perfect square, so ' + t('\\sqrt{' + k + '}') + ' is irrational — not a counterexample.' }],
        sol: '<b>False.</b> ' + t('\\sqrt{' + s * s + '}=' + s) + ', which is rational. Only the square roots of numbers that are <b>not</b> perfect squares are irrational.' },
      { claim: 'The square root of a natural number is either a whole number or irrational.', opts: [
        { html: '<b>True.</b> If the number is a perfect square its root is a whole number (' + t('\\sqrt{' + s * s + '}=' + s) + '); if not, the root never ends and never repeats (' + t('\\sqrt{' + k + '}') + ').', right: true },
        { html: '<b>False.</b> ' + t('\\sqrt{' + m + '}=' + rad(mm, 2, m / (mm * mm))) + ' is a mixed radical, which is neither.', why: 'A mixed radical is still a number: ' + t(rad(mm, 2, m / (mm * mm))) + ' is irrational, because ' + t(m) + ' is not a perfect square.' },
        { html: '<b>False.</b> ' + t('\\sqrt{2.25}=1.5') + ' is rational but not whole.', why: t('2.25') + ' is not a natural number. The claim is only about square roots of natural numbers.' },
        { html: '<b>True.</b> Every square root is a whole number.', why: 'Right answer, wrong reason: ' + t('\\sqrt{' + k + '}') + ' is not a whole number. A square root is whole only when the number is a perfect square; otherwise it is irrational.' }],
        sol: '<b>True.</b> If a natural number is a perfect square, its square root is a whole number (' + t('\\sqrt{' + s * s + '}=' + s) + '). If it is not, its square root never ends and never repeats, so it is irrational (' + t('\\sqrt{' + k + '}') + ').' }]);
  }
  function tfSlotB(r) {
    var a = r.int(1, 9), b = r.pick([1, 2, 3, 4, 5, 6, 7, 8, 9].filter(function (x) { return x !== a; })), ab = 10 * a + b, red = ex.norm(ab, 99), rep = '0.' + a + b + a + b + a + b + '\\ldots';
    var fr = t('0.\\overline{' + a + b + '}=\\frac{' + ab + '}{99}' + (red[1] !== 99 ? '=' + ex.texRat(red) : ''));
    return r.pick([
      { claim: t(rep) + ' is irrational because its decimal never ends.', opts: [
        { html: '<b>False.</b> It repeats, so it is rational: ' + fr + '.', right: true },
        { html: '<b>True.</b> Any decimal that never ends is irrational.', why: 'A decimal is irrational only if it never ends <b>and</b> never repeats. This one repeats.' },
        { html: '<b>True.</b> It can’t be written as a fraction because its digits go on forever.', why: 'It can: ' + fr + '. Repeating decimals are fractions.' },
        { html: '<b>False.</b> It ends after the digits ' + t(a + '' + b) + '.', why: 'Right answer, wrong reason: the dots mean the digits ' + t(a + '' + b) + ' keep repeating forever. It is rational <b>because</b> it repeats.' }],
        sol: '<b>False.</b> The block ' + t(a + '' + b) + ' repeats, so it is rational: ' + fr + '. Irrational decimals never end <b>and</b> never repeat.' },
      { claim: 'Every repeating decimal can be written as a fraction.', opts: [
        { html: '<b>True.</b> A repeating decimal is rational, for example ' + fr + '.', right: true },
        { html: '<b>False.</b> A repeating decimal never ends, so it can’t be a fraction.', why: 'Never ending isn’t the test — never <b>repeating</b> is. ' + fr + '.' },
        { html: '<b>False.</b> Only decimals that terminate can be written as fractions.', why: 'Repeating decimals are fractions too: ' + fr + '.' },
        { html: '<b>True.</b> Every decimal can be written as a fraction.', why: 'Right answer, wrong reason: a decimal that never ends and never repeats, like ' + t('\\pi') + ', can’t be written as a fraction.' }],
        sol: '<b>True.</b> Every repeating decimal is rational, so it equals a fraction of integers, for example ' + fr + '. Only decimals that never end <b>and</b> never repeat are irrational.' },
      { claim: t(rep) + ' is a rational number.', opts: [
        { html: '<b>True.</b> It repeats, so it can be written as a fraction: ' + fr + '.', right: true },
        { html: '<b>False.</b> Its decimal never ends.', why: 'A decimal that never ends is irrational only if it also never repeats. This one repeats: ' + fr + '.' },
        { html: '<b>False.</b> A rational number’s decimal must terminate.', why: 'Rational numbers can terminate <b>or</b> repeat: ' + fr + '.' },
        { html: '<b>True.</b> Every decimal is rational.', why: 'Right answer, wrong reason: ' + t('\\pi=3.14159\\ldots') + ' is a decimal that is not rational. This one is rational because it <b>repeats</b>.' }],
        sol: '<b>True.</b> The block ' + t(a + '' + b) + ' repeats, so it can be written as a fraction: ' + fr + '.' }]);
  }
  function tfSlotC(r) {
    var c = r.int(2, 5), q = r.int(2, 3), f = r.int(2, 4), sq = r.int(3, 9);
    var c3 = c * c * c, q4 = Math.pow(q, 4), f5 = Math.pow(2, 5);
    return r.pick([
      { claim: t('\\sqrt[3]{-' + c3 + '}') + ' is not a real number.', opts: [
        { html: '<b>False.</b> ' + t('(-' + c + ')^{3}=-' + c3) + ', so ' + t('\\sqrt[3]{-' + c3 + '}=-' + c) + '. An odd index allows a negative radicand.', right: true },
        { html: '<b>True.</b> You can’t take a root of a negative number.', why: 'That is only true for <b>even</b> roots. ' + t('(-' + c + ')^{3}=-' + c3) + ', so ' + t('\\sqrt[3]{-' + c3 + '}=-' + c) + '.' },
        { html: '<b>True.</b> No real number cubed is negative.', why: 'Cube a negative: ' + t('(-' + c + ')^{3}=(-' + c + ')(-' + c + ')(-' + c + ')=-' + c3) + '.' },
        { html: '<b>False.</b> ' + t('\\sqrt[3]{-' + c3 + '}=' + c) + '.', why: 'Check: ' + t(c + '^{3}=' + c3) + ', not ' + t('-' + c3) + '. The cube root of a negative is negative.' }],
        sol: '<b>False.</b> ' + t('(-' + c + ')^{3}=-' + c3) + ', so ' + t('\\sqrt[3]{-' + c3 + '}=-' + c) + '. An odd index allows a negative radicand; it is an <b>even</b> root of a negative, like ' + t('\\sqrt{-' + c3 + '}') + ', that is not real.' },
      { claim: t('\\sqrt[4]{-' + q4 + '}=-' + q) + '.', opts: [
        { html: '<b>False.</b> ' + t('(-' + q + ')^{4}=+' + q4) + ', not ' + t('-' + q4) + '. No real number to an even power is negative, so ' + t('\\sqrt[4]{-' + q4 + '}') + ' is not a real number.', right: true },
        { html: '<b>True.</b> ' + t('(-' + q + ')^{4}=-' + q4) + '.', why: 'Four negative factors multiply to a <b>positive</b>: ' + t('(-' + q + ')^{4}=+' + q4) + '.' },
        { html: '<b>True.</b> The root of a negative number is negative.', why: 'That works for odd roots only. Check ' + t('(-' + q + ')^{4}') + ': an even power is never negative.' },
        { html: '<b>False.</b> ' + t('\\sqrt[4]{-' + q4 + '}=' + q) + '.', why: t(q + '^{4}=' + q4) + ', not ' + t('-' + q4) + '. No real number works here.' }],
        sol: '<b>False.</b> ' + t('(-' + q + ')^{4}=+' + q4) + ', not ' + t('-' + q4) + '. No real number raised to an even power is negative, so ' + t('\\sqrt[4]{-' + q4 + '}') + ' is not a real number.' },
      { claim: t('\\sqrt[5]{-' + f5 + '}') + ' is not a real number.', opts: [
        { html: '<b>False.</b> ' + t('(-2)^{5}=-' + f5) + ', so ' + t('\\sqrt[5]{-' + f5 + '}=-2') + '. An odd index allows a negative radicand.', right: true },
        { html: '<b>True.</b> You can’t take a root of a negative number.', why: 'Only <b>even</b> roots of negatives are not real. ' + t('(-2)^{5}=-' + f5) + '.' },
        { html: '<b>True.</b> ' + t('(-2)^{5}=+' + f5) + '.', why: 'Five negative factors multiply to a <b>negative</b>: ' + t('(-2)^{5}=-' + f5) + '.' },
        { html: '<b>False.</b> ' + t('\\sqrt[5]{-' + f5 + '}=2') + '.', why: t('2^{5}=' + f5) + ', not ' + t('-' + f5) + '. The fifth root of a negative is negative.' }],
        sol: '<b>False.</b> ' + t('(-2)^{5}=-' + f5) + ', so ' + t('\\sqrt[5]{-' + f5 + '}=-2') + '. An odd index allows a negative radicand.' },
      { claim: t('\\sqrt{-' + sq * sq + '}') + ' is not a real number.', opts: [
        { html: '<b>True.</b> No real number squared is negative: ' + t('(' + sq + ')^{2}') + ' and ' + t('(-' + sq + ')^{2}') + ' are both ' + t('+' + sq * sq) + '.', right: true },
        { html: '<b>False.</b> ' + t('\\sqrt{-' + sq * sq + '}=-' + sq) + '.', why: 'Check: ' + t('(-' + sq + ')^{2}=+' + sq * sq) + ', not ' + t('-' + sq * sq) + '.' },
        { html: '<b>True.</b> You can never take a root of a negative number.', why: 'Right answer, wrong reason: odd roots of negatives are fine (' + t('\\sqrt[3]{-8}=-2') + '). It is the <b>even</b> index that makes this one not real.' },
        { html: '<b>False.</b> ' + t('\\sqrt{-' + sq * sq + '}=' + sq) + '.', why: t(sq + '^{2}=' + sq * sq) + ', not ' + t('-' + sq * sq) + '.' }],
        sol: '<b>True.</b> A square root of ' + t('-' + sq * sq) + ' would be a number whose square is negative, but ' + t(sq + '^{2}') + ' and ' + t('(-' + sq + ')^{2}') + ' are both ' + t(sq * sq) + '. So ' + t('\\sqrt{-' + sq * sq + '}') + ' is not a real number.' }]);
  }
  function tfPart(r, slot, lab) {
    return P.mc(r, '<b>True or false?</b> Choose the answer with a correct reason.<br>“' + slot.claim + '”', slot.opts, slot.sol,
      ['Look for a counterexample: one example where the statement fails is enough to make it false.'], 'true/false ' + lab + ': ' + slot.claim.replace(/\\\(|\\\)/g, '').slice(0, 80));
  }

  /* ---------- radicals ---------- */
  /* [k, m] for k·ⁿ√m with k in kr, m from 2–15 with no perfect n-th power factor, and kⁿ·m between lo and hi */
  function radPool(n, kr, lo, hi) { var o = []; for (var k = kr[0]; k <= kr[1]; k++) for (var m = 2; m <= 15; m++) { var N = Math.pow(k, n) * m; if (ex.simplest(m, n) && N >= lo && N <= hi) o.push([k, m]); } return o; }
  var BEG_RAD = radPool(2, [2, 7], 8, 100); // √12 … √98: the Beginning-box radicals (25 of them)
  function pick3(r, pool) { return r.sample(pool, 3).sort(function (a, b) { return a[0] * a[0] * a[1] - b[0] * b[0] * b[1]; }); }
  function mixedSol(k, n, m) { var big = Math.pow(k, n); return t(rt(n, F(big * m)) + '=' + rt(n, big + '\\times ' + m) + '=' + rt(n, big) + '\\times ' + rt(n, m) + '=' + rad(k, n, m)) + (n > 2 ? ' (' + t(k + '^{' + n + '}=' + big) + ')' : '') + '. ' + t(m) + ' has no perfect ' + powWord(n) + ' factor left, so this is simplest form.'; }
  function mixedPart(k, n, m) {
    return P.radical(t(rt(n, F(Math.pow(k, n) * m))), { k: k, n: n, m: m }, 'mixed', mixedSol(k, n, m),
      ['Find the <b>largest</b> perfect ' + powWord(n) + ' that divides ' + t(F(Math.pow(k, n) * m)) + (n === 2 ? ' (4, 9, 16, 25, 36, …)' : n === 3 ? ' (8, 27, 64, 125, …)' : ' (16, 81, …)') + '.', 'Its ' + rootWord(n) + ' root comes out in front of the radical.'], 'mixed radical of ' + rootWord(n) + ' root ' + Math.pow(k, n) * m);
  }
  function entireSol(k, n, m) { var a = Math.abs(k), neg = k < 0; return t(rad(k, n, m) + '=' + rt(n, (neg ? '(-' + a + ')' : a) + '^{' + n + '}\\times ' + m) + '=' + rt(n, (neg ? '-' : '') + Math.pow(a, n) + '\\times ' + m) + '=' + rt(n, (neg ? '-' : '') + F(Math.pow(a, n) * m))) + '.' + (n === 3 ? ' With index ' + t('3') + ', the coefficient is <b>cubed</b>' + (neg ? ', and a negative cubed stays negative.' : '.') : ''); }
  function entirePart(k, n, m) {
    return P.radical(t(rad(k, n, m)), { k: k, n: n, m: m }, 'entire', entireSol(k, n, m),
      ['Write the coefficient as a ' + rootWord(n) + ' root: ' + t(Math.abs(k) + '=' + rt(n, Math.pow(Math.abs(k), n))) + '.', 'Then multiply the numbers under one radical.'], 'entire radical of ' + k + ' root' + n + ' ' + m);
  }

  HW.defineLesson({
    id: 'u1test', unit: 1, num: 'Test', title: 'Unit 1 Test', outcome: 'AN1', test: true,
    blurb: 'The Unit 1 outcomes-based test: AN1 (prime factors, GCF and LCM, square and cube roots) and AN2 (irrational numbers, ordering, entire and mixed radicals), each at the BEG, PRG and MAS levels.',
    questions: [
      /* ======================= AN1 · Part 1 ======================= */
      { num: '1', section: 'AN1 · Part 1 — Beginning', outcome: 'AN1', shared: q1Shared,
        stem: function (s) { return 'Here is a factor tree for ' + t(F(s.N)) + ' with four blank boxes.' + q1Tree(s); },
        parts: [
          { id: '1a', outcome: 'AN1', level: 'BEG', make: function (r, s) {
            var box = function (val, sib, parent, parentName) {
              return K.number(val, function (v) { if (!(v > 0) || v % 1) return null; return { code: 'tree-box', hint: 'Check: ' + t(F(v) + '\\times ' + F(sib) + '=' + F(v * sib)) + ', but the two branches must multiply to ' + parentName + '.' }; });
            };
            return P.fields('Fill in the four blank boxes to complete the factor tree for ' + t(F(s.N)) + '.',
              [{ name: 'Box A', label: 'Box A:' }, { name: 'Box B', label: 'Box B:' }, { name: 'Box C', label: 'Box C:' }, { name: 'Box D', label: 'Box D:' }],
              [box(s.A, s.B, s.N, t(F(s.N))), box(s.ap[1], s.ap[0], s.A, 'the number in Box A'), box(s.D, s.C, s.B, t(F(s.B))), box(s.cp[0], s.cp[1], s.C, t(s.C))],
              [String(s.A), String(s.ap[1]), String(s.D), String(s.cp[0])], 'A ' + t('=' + s.A) + ', B ' + t('=' + s.ap[1]) + ', C ' + t('=' + s.D) + ', D ' + t('=' + s.cp[0]),
              'The two branches under a number multiply to give that number.<br>Box A: ' + t(F(s.N) + '\\div ' + s.B + '=' + s.A) + '.<br>Box B: ' + t(s.A + '\\div ' + s.ap[0] + '=' + s.ap[1]) + '.<br>Box C: ' + t(s.B + '\\div ' + s.C + '=' + s.D) + ' (and ' + t(s.p + '\\times ' + s.p + '=' + s.D) + ' ✓).<br>Box D: ' + t(s.C + '\\div ' + s.cp[1] + '=' + s.cp[0]) + '.',
              ['The two numbers under a branch multiply to give the number above them.', 'So each blank is the number above it divided by its partner.'], 'factor tree boxes for ' + s.N);
          } },
          { id: '1b', outcome: 'AN1', level: 'BEG', make: function (r, s) {
            var N = s.N;
            return { prompt: 'Write ' + t(F(N)) + ' as a product of prime factors, using exponents.', input: { type: 'math', before: t(F(N) + '=') }, check: prodChk(N, 'required'), key: K.fac(N), answer: t(F(N) + '=' + K.fac(N)), text: 'tree: exponent form of ' + N,
              solution: 'The primes at the ends of the branches are ' + t([s.ap[0], s.ap[1], s.cp[0], s.cp[1], s.p, s.p].sort(function (a, b) { return a - b; }).join(',\\ ')) + '.<br>' + t(F(N) + '=' + K.exp(N) + '=' + K.fac(N)),
              hints: ['Collect every prime at the end of a branch (fill in the boxes first).', 'Write a repeated prime with an exponent, e.g. ' + t('3\\times 3\\times 3=3^{3}') + '.'] };
          } }] },
      { num: '2', outcome: 'AN1', stem: 'Use a division ladder or a factor tree on paper.', parts: [
        { id: '2', outcome: 'AN1', level: 'BEG', make: function (r) {
          var N = find(function () { var q = r.sample([3, 5, 7, 11, 13, 17, 19], 3), sq = r.pick([2].concat(q)); return 2 * prodOf(q) * sq; }, function (n) { return n >= 800 && n <= 3000; }, 1050);
          return { prompt: 'Write ' + t(F(N)) + ' as a product of prime factors.', input: { type: 'math', before: t(F(N) + '=') }, check: prodChk(N, 'either'), key: K.fac(N), answer: t(F(N) + '=' + K.fac(N)), text: 'product of primes: ' + N,
            solution: 'Divide by the smallest prime each time:' + K.ladderSolution(N) + t(F(N) + '=' + K.exp(N) + '=' + K.fac(N)),
            hints: ['Start with the smallest prime that divides ' + t(F(N)) + ' and keep dividing until you reach ' + t('1') + '.', 'Check: multiply your primes back together.'] };
        } }] },
      { num: '3', outcome: 'AN1', stem: 'Circle (select) every <b>prime</b> number.', parts: [
        { id: '3', outcome: 'AN1', level: 'BEG', make: function (r) {
          var nums = sortN([1, r.pick([2, 3, 5, 7]), r.pick([11, 13, 17, 19]), r.pick([23, 29, 31, 37, 41, 43, 47])].concat(r.sample([9, 15, 21, 25, 27, 33, 35], 2), r.sample([39, 49, 51, 57, 87, 91, 69, 77], 2)));
          var want = nums.filter(function (x) { return nt.isPrime(x); });
          return { prompt: 'Select every prime number: ' + t(nums.join(',\\ ')) + '.', input: { type: 'select', options: nums }, key: want, answer: t(K.listTex(want)), text: 'primes among ' + nums.join(','),
            check: K.selectSet(want, function (extra, missing) {
              if (extra.indexOf(1) >= 0) return { code: 'picked-one', hint: t('1') + ' is neither prime nor composite: it has only one factor.' };
              if (extra.length) { var x = extra[0], sp = nt.smallestPrimeFactor(x); return { code: 'picked-composite', hint: t(x) + ' isn’t prime: ' + t(x + '=' + sp + '\\times ' + x / sp) + '.' }; }
              return { code: 'missed', hint: 'You missed ' + (missing.length === 1 ? 'a prime' : missing.length + ' primes') + '. A prime has exactly two factors: ' + t('1') + ' and itself.' };
            }),
            solution: 'Primes: ' + t(K.listTex(want)) + '.<br>' + nums.filter(function (x) { return !nt.isPrime(x); }).map(function (x) { if (x === 1) return t('1') + ' is neither prime nor composite (only one factor)'; var sp = nt.smallestPrimeFactor(x); return t(x + '=' + sp + '\\times ' + x / sp); }).join('; ') + '.',
            hints: ['A prime has exactly two factors. Test each number for divisibility by ' + t('2, 3, 5, 7') + '.'] };
        } }] },
      { num: '4', section: 'AN1 · Part 1 — Progressing', outcome: 'AN1', shared: q4Shared,
        stem: 'Use prime factorization to decide whether each number is a <b>perfect square</b>, a <b>perfect cube</b>, <b>both</b>, or <b>neither</b>. If it is a perfect square or cube, use the prime factors to find the root.',
        parts: [0, 1, 2, 3].map(function (i) { return { id: '4' + 'abcd'[i], outcome: 'AN1', level: 'PRG', make: function (r, s) { return q4Part(s.nums[i]); } }; }) },
      { num: '5', section: 'AN1 · Part 1 — Mastering', outcome: 'AN1', stem: 'Show your reasoning with prime factors.', parts: [
        { id: '5', outcome: 'AN1', level: 'MAS', make: function (r) {
          var f = find(function () { var ps = r.pick([[2, 3, 5], [2, 3, 7], [2, 5, 7], [2, 3, 11], [2, 5, 11], [2, 7, 11], [3, 5, 7]]), es = r.shuffle([1, 2, 3]); return ps.map(function (p, i) { return [p, es[i]]; }); }, function (f) { var M = fVal(f); return M >= 300 && M <= 6000; }, [[2, 3], [3, 1], [5, 2]]);
          var M = fVal(f), u = powerUp(f, 3), n = u.k, MN = M * n, root = u.root;
          var sqK = powerUp(f, 2).k, once = prodOf(f.filter(function (pe) { return pe[1] % 3; }).map(function (pe) { return pe[0]; })), extra = fVal(f.map(function (pe) { return [pe[0], pe[1] % 3]; })), all = prodOf(f.map(function (pe) { return pe[0]; }));
          var nAlts = [{ v: sqK, code: 'k-square', hint: 'That makes ' + t(F(M) + 'n') + ' a perfect <b>square</b>. A perfect cube needs every exponent to be a multiple of ' + t('3') + '.' },
            { v: once, code: 'k-once', hint: 'Multiplying by each missing prime once isn’t enough: an exponent of ' + t('1') + ' needs <b>two</b> more copies to reach ' + t('3') + '.' },
            { v: extra, code: 'k-extra', hint: 'Those are the factors left <i>over</i>. ' + t('n') + ' must supply what each exponent is <i>missing</i> to reach a multiple of ' + t('3') + '.' },
            { v: all, code: 'k-all', hint: 'You don’t need one more of every prime — only of the primes whose exponents aren’t multiples of ' + t('3') + ' yet, and one of them needs two more.' }];
          var need = f.filter(function (pe) { return pe[1] % 3; });
          return P.fields('What is the <b>smallest</b> whole number ' + t('n') + ' that makes ' + t(F(M) + 'n') + ' a perfect cube? Write ' + t(F(M)) + ' as a product of primes, then find ' + t('n') + ' and ' + t('\\sqrt[3]{' + F(M) + 'n}') + '.',
            [{ name: 'Prime factorization', before: t(F(M) + '='), mode: 'math', wide: true }, { name: 'n', before: t('n=') }, { name: 'Cube root', before: t('\\sqrt[3]{' + F(M) + 'n}=') }],
            [prodChk(M, 'either'), numChk(n, nAlts), numChk(root, [{ v: MN, code: 'root-of-k', hint: 'That’s ' + t(F(M) + 'n') + ' itself. Now take its cube root: divide each exponent by ' + t('3') + '.' }, { v: n, code: 'root-of-k', hint: 'That’s ' + t('n') + '. The question asks for the cube root of ' + t(F(M) + 'n') + '.' }])],
            [plainF(f), String(n), String(root)], t(F(M) + '=' + fTex(f)) + ', ' + t('n=' + F(n)) + ', ' + t('\\sqrt[3]{' + F(MN) + '}=' + root),
            t(F(M) + '=' + fTex(f)) + '.<br>For a perfect cube, every exponent must be a multiple of ' + t('3') + '. ' + f.filter(function (pe) { return pe[1] === 3; }).map(function (pe) { return t(pe[0] + '^{3}'); }).join('') + ' is already fine; ' +
              need.map(function (pe) { return t(pe[0] + (pe[1] > 1 ? '^{' + pe[1] + '}' : '')) + ' needs ' + (3 - pe[1] === 1 ? 'one more ' + t(pe[0]) : 'two more ' + t(pe[0]) + 's'); }).join('; ') + '.<br>' +
              t('n=' + fTex(u.kf) + '=' + F(n)) + '<br>' + t(F(M) + '\\times ' + F(n) + '=' + F(MN) + '=' + fTex(u.up)) + '<br>' + t('\\sqrt[3]{' + F(MN) + '}=' + fTex(u.rootF) + '=' + root),
            ['Write ' + t(F(M)) + ' as a product of primes and look at each exponent.', 'Raise each exponent to the next multiple of ' + t('3') + ' — and no further.'], 'smallest n: ' + M + 'n a perfect cube');
        } }] },
      { num: '6', outcome: 'AN1', stem: 'Use prime factorization.', parts: [
        { id: '6', outcome: 'AN1', level: 'MAS', make: function (r) {
          var e = r.pick([18, 20, 21, 22, 24, 26, 28]), V = e * e * e, what = r.pick(['storage box', 'water tank', 'planter', 'gift box', 'toy chest']), ef = nt.factor(e), Vf = nt.factor(V);
          return P.fields('A cube-shaped ' + what + ' has a volume of ' + t(F(V) + '\\ \\text{cm}^{3}') + '. Use prime factorization to find the <b>edge length</b> of the ' + what + ' and the <b>area of one face</b>.',
            [{ name: 'Prime factorization', before: t(F(V) + '='), mode: 'math', wide: true }, { name: 'Edge', label: 'Edge length:', after: 'cm' }, { name: 'Face', label: 'Area of one face:', after: t('\\text{cm}^{2}') }],
            [prodChk(V, 'either'), numChk(e, [{ v: V / 3, code: 'edge-third', hint: 'A cube root isn’t a third of the volume. Divide each <b>exponent</b> by ' + t('3') + '.' }]),
              numChk(e * e, [{ v: 6 * e * e, code: 'face-surface', hint: 'That’s the area of all six faces. The question asks for <b>one</b> face.' }, { v: 4 * e, code: 'face-perimeter', hint: 'That’s the perimeter of a face. The area of a square face is edge × edge.' }, { v: 2 * e, code: 'face-double', hint: 'Square the edge length (edge × edge), don’t double it.' }])],
            [plainFac(V), String(e), String(e * e)], t(F(V) + '=' + K.fac(V)) + '; edge ' + t(e) + ' cm; face ' + t(e * e + '\\ \\text{cm}^{2}'),
            t(F(V) + '=' + K.fac(V)) + '<br>Edge ' + t('=\\sqrt[3]{' + K.fac(V) + '}=' + fTex(ef) + '=' + e) + ' cm (divide each exponent by ' + t('3') + ').<br>Face area ' + t('=' + e + '^{2}' + (ef.length > 1 || ef[0][1] > 1 ? '=(' + fTex(ef) + ')^{2}=' + fTex(ef.map(function (pe) { return [pe[0], 2 * pe[1]]; })) : '') + '=' + F(e * e)) + ' ' + t('\\text{cm}^{2}') + '.',
            ['The edge is the cube root of the volume: divide each exponent in the prime factorization by ' + t('3') + '.', 'A face is a square: area = edge × edge.'], 'cube volume ' + V + ': edge and face');
        } }] },

      /* ======================= AN1 · Part 2 ======================= */
      { num: '7', section: 'AN1 · Part 2 — Beginning', outcome: 'AN1', stem: 'Find the <b>greatest common factor</b>. Use any method.', parts: [
        { id: '7a', outcome: 'AN1', level: 'BEG', make: function (r) {
          var v = find(function () { var g = r.pick([12, 14, 15, 16, 18, 20, 21, 24]), xy = r.pick([[3, 5], [3, 4], [4, 5], [2, 5], [2, 3]]); return [g * xy[0], g * xy[1]]; }, function (v) { return v[1] <= 120; }, [36, 60]);
          return gcfPart(v);
        } },
        { id: '7b', outcome: 'AN1', level: 'BEG', make: function (r) {
          var v = find(function () { var g = r.pick([7, 9, 10, 11, 13, 14, 15, 17, 19]), xy = r.pick([[2, 3], [2, 5], [3, 4], [3, 5], [2, 7]]); return [g * xy[0], g * xy[1]]; }, function (v) { return v[1] <= 80; }, [28, 42]);
          return gcfPart(v);
        } }] },
      { num: '8', outcome: 'AN1', stem: 'Find the <b>least common multiple</b>. Use any method.', parts: [
        { id: '8a', outcome: 'AN1', level: 'BEG', make: function (r) {
          return lcmPart(find(function () { return sortN(r.sample([4, 6, 8, 9, 10, 12, 14, 15], 2)); }, function (v) { return gcd(v[0], v[1]) > 1 && v[1] % v[0] !== 0 && lcm(v[0], v[1]) <= 60; }, [8, 12]));
        } },
        { id: '8b', outcome: 'AN1', level: 'BEG', make: function (r) {
          return lcmPart(find(function () { return [r.int(4, 10), r.int(10, 24)]; }, function (v) { return v[0] < v[1] && gcd(v[0], v[1]) > 1 && v[1] % v[0] !== 0 && lcm(v[0], v[1]) <= 72; }, [6, 15]));
        } }] },
      { num: '9', section: 'AN1 · Part 2 — Progressing', outcome: 'AN1', stem: 'Use prime factorization.', parts: [
        { id: '9', outcome: 'AN1', level: 'PRG', make: function (r) {
          var nums = find(function () { var g = r.pick([12, 14, 15, 18, 20, 21, 24, 28, 30, 36, 42]), m = r.pick([[2, 3, 5], [2, 3, 7], [3, 4, 5]]); return m.map(function (x) { return g * x; }); }, function (v) { return v[2] <= 260; }, [84, 126, 210]);
          var G = gcfA(nums), L = lcmA(nums);
          var p = P.fields('Use prime factorization to determine the GCF and the LCM of ' + nlist(nums) + '.',
            nums.map(function (n) { return { name: String(n), before: t(F(n) + '='), mode: 'math', wide: true }; }).concat([{ name: 'GCF', before: t('\\text{GCF}=') }, { name: 'LCM', before: t('\\text{LCM}=') }]),
            nums.map(function (n) { return prodChk(n, 'either'); }).concat([K.number(G, gcfDiag(nums)), K.number(L, lcmDiag(nums))]),
            nums.map(plainFac).concat([String(G), String(L)]),
            nums.map(function (n) { return t(F(n) + '=' + K.fac(n)); }).join('<br>') + '<br>' + t('\\text{GCF}=' + F(G)) + ', ' + t('\\text{LCM}=' + F(L)),
            nums.map(function (n) { return t(F(n) + '=' + K.fac(n)); }).join('<br>') + '<br>GCF: the primes common to all three, lowest power: ' + t(K.fac(G) + '=' + F(G)) + '.<br>LCM: every prime, highest power: ' + t(K.fac(L) + '=' + F(L)) + '.',
            ['Write each number as a product of primes.', 'GCF: shared primes, lowest power. LCM: every prime, highest power.'], 'GCF & LCM of ' + nums.join(', '));
          p.bad = [nums.map(plainFac).concat([String(L), String(G)])];
          return p;
        } }] },
      { num: '10', outcome: 'AN1',
        shared: function (r) {
          return find(function () {
            var S = r.pick([[2, 3], [3, 5], [2, 5]]), rest = [2, 3, 5, 7].filter(function (p) { return S.indexOf(p) < 0; }), U = r.shuffle(rest);
            var hiA = r.chance(0.5), e1 = r.int(2, 4), e2 = r.int(2, 3);
            var lo1 = r.int(1, e1 - 1), lo2 = r.int(1, e2 - 1);
            var af = [[S[0], hiA ? e1 : lo1], [S[1], hiA ? lo2 : e2], [U[0], r.int(1, 2)]], bf = [[S[0], hiA ? lo1 : e1], [S[1], hiA ? e2 : lo2], [U[1], 1]];
            return { af: fSort(af), bf: fSort(bf) };
          }, function (s) { return fVal(s.af) <= 5000 && fVal(s.bf) <= 5000; }, { af: [[2, 3], [3, 1], [5, 2]], bf: [[2, 1], [3, 2], [7, 1]] });
        },
        stem: function (s) { return t('A=' + fTex(s.af)) + ' and ' + t('B=' + fTex(s.bf)) + '.'; },
        parts: [
          { id: '10', outcome: 'AN1', level: 'PRG', make: function (r, s) {
            var A = fVal(s.af), B = fVal(s.bf), G = gcd(A, B), L = lcm(A, B), gF = nt.factor(G), lF = nt.factor(L);
            var hiShared = fVal(gF.map(function (pe) { return [pe[0], Math.max.apply(null, [s.af, s.bf].map(function (f) { var q = f.filter(function (x) { return x[0] === pe[0]; })[0]; return q ? q[1] : 0; }))]; }));
            var lowAll = fVal(lF.map(function (pe) { var es = [s.af, s.bf].map(function (f) { var q = f.filter(function (x) { return x[0] === pe[0]; })[0]; return q ? q[1] : 0; }).filter(function (x) { return x > 0; }); return [pe[0], Math.min.apply(null, es)]; }));
            var gAlts = [{ v: L, code: 'gcf-lcm', hint: 'That’s the LCM. The GCF uses only the primes in <b>both</b> numbers, each to the <b>lower</b> power.' }, { v: hiShared, code: 'gcf-high-power', hint: 'Right primes, but the GCF takes each shared prime to its <b>lower</b> power.' }];
            var lAlts = [{ v: G, code: 'lcm-gcf', hint: 'That’s the GCF. The LCM uses <b>every</b> prime in either number, each to the <b>higher</b> power.' }, { v: A * B, code: 'lcm-product', hint: t('A\\times B') + ' is a common multiple, but not the least one: use each prime once, at its higher power.' }, { v: hiShared, code: 'lcm-missing-prime', hint: 'The LCM needs every prime that appears in <b>either</b> number — including the ones only one of them has.' }, { v: lowAll, code: 'lcm-low-power', hint: 'Right primes, but the LCM takes each prime to its <b>higher</b> power.' }];
            var p = P.fields('Write the GCF and the LCM of ' + t('A') + ' and ' + t('B') + ' as products of prime factors. You do not need to multiply them out.',
              [{ name: 'GCF', before: t('\\text{GCF}='), mode: 'math', wide: true }, { name: 'LCM', before: t('\\text{LCM}='), mode: 'math', wide: true }],
              [prodChk(G, 'either', gAlts), prodChk(L, 'either', lAlts)], [plainFac(G), plainFac(L)],
              t('\\text{GCF}=' + K.fac(G) + '\\ (=' + F(G) + ')') + ', ' + t('\\text{LCM}=' + K.fac(L)),
              t('A=' + fTex(s.af)) + ', ' + t('B=' + fTex(s.bf)) + '.<br>GCF: lowest power of each shared prime (' + t(gF.map(function (pe) { return pe[0]; }).join('\\text{ and }')) + '): ' + t(K.fac(G) + '=' + F(G)) + '.<br>LCM: highest power of every prime that appears: ' + t(K.fac(L)) + ' ' + t('(=' + F(L) + ')') + '.',
              ['GCF: only the primes in both, each to the lower power.', 'LCM: every prime in either, each to the higher power.'], 'GCF & LCM in exponent form');
            p.bad = [[plainFac(L), plainFac(G)], [plainFac(hiShared), plainFac(L)]].filter(function (b) { return b.join('|') !== p.key.join('|'); });
            return p;
          } }] },
      { num: '11', section: 'AN1 · Part 2 — Mastering', outcome: 'AN1',
        shared: function (r) { return { gcfFirst: r.chance(0.5), g: gcfScenario(r), l: lcmScenario(r) }; },
        stem: 'Decide whether each problem needs the <b>GCF</b> or the <b>LCM</b>, and why. Then solve it.',
        parts: [
          { id: '11ai', sub: 'a i', outcome: 'AN1', level: 'MAS', make: function (r, s) { return s.gcfFirst ? chooseGcfPart(r, s.g) : chooseLcmPart(r, s.l); } },
          { id: '11aii', sub: 'a ii', outcome: 'AN1', level: 'MAS', make: function (r, s) { return s.gcfFirst ? solveGcfPart(s.g) : solveLcmPart(s.l); } },
          { id: '11bi', sub: 'b i', outcome: 'AN1', level: 'MAS', make: function (r, s) { return s.gcfFirst ? chooseLcmPart(r, s.l) : chooseGcfPart(r, s.g); } },
          { id: '11bii', sub: 'b ii', outcome: 'AN1', level: 'MAS', make: function (r, s) { return s.gcfFirst ? solveLcmPart(s.l) : solveGcfPart(s.g); } }] },
      { num: '12', outcome: 'AN1', stem: 'Use prime factors to explain your answer.', parts: [
        { id: '12', outcome: 'AN1', level: 'MAS', make: function (r) {
          var v = find(function () { var g = r.pick([6, 10, 12, 14, 15, 18, 20]), x = r.int(2, 7), y = r.int(2, 7); return { g: g, x: x, y: y }; }, function (v) { return v.x !== v.y && gcd(v.x, v.y) === 1 && gcd(v.x, v.g) > 1 && v.g * v.x <= 120 && v.g * v.y <= 120 && v.g * v.x * v.y <= 600; }, { g: 12, x: 6, y: 5 });
          var g = v.g, a = g * v.x, b = g * v.y, L = g * v.x * v.y;
          var other = function (u) {
            if (u === L / a) return { code: 'other-ratio', hint: t(F(L) + '\\div ' + a + '=' + u) + ' is missing the shared factors. Use ' + t('\\text{GCF}\\times\\text{LCM}=') + ' the product of the two numbers.' };
            if (!(u > 0) || u % 1) return null;
            var gg = gcd(a, u), ll = lcm(a, u);
            if (gg !== g) return { code: 'other-gcf', hint: 'Check: the GCF of ' + t(a) + ' and ' + t(F(u)) + ' is ' + t(F(gg)) + ', not ' + t(g) + '.' };
            if (ll !== L) return { code: 'other-lcm', hint: 'Check: the LCM of ' + t(a) + ' and ' + t(F(u)) + ' is ' + t(F(ll)) + ', not ' + t(F(L)) + '.' };
            return null;
          };
          var bF = nt.factor(b), aF = nt.factor(a), gF = nt.factor(g), LF = nt.factor(L), ex_ = function (f, p) { var q = f.filter(function (x) { return x[0] === p; })[0]; return q ? q[1] : 0; };
          var why = LF.map(function (pe) {
            var p0 = pe[0], ea = ex_(aF, p0), eg = ex_(gF, p0), el = pe[1], eb = ex_(bF, p0);
            return t(p0) + ': ' + t(a) + ' has ' + t(p0 + '^{' + ea + '}') + ', the GCF has ' + t(p0 + '^{' + eg + '}') + ', the LCM has ' + t(p0 + '^{' + el + '}') + ', so the other number has ' + t(p0 + '^{' + eb + '}') + (eb === 0 ? ' (none)' : '');
          }).join('<br>');
          return P.fields('The GCF of two numbers is ' + t(g) + ' and their LCM is ' + t(F(L)) + '. One of the numbers is ' + t(a) + '. Write ' + t(a) + ', the GCF and the LCM as products of primes, then find the other number.',
            [{ name: String(a), before: t(a + '='), mode: 'math', wide: true }, { name: 'GCF', before: t(g + '='), mode: 'math', wide: true }, { name: 'LCM', before: t(F(L) + '='), mode: 'math', wide: true }, { name: 'Other number', label: 'Other number:' }],
            [prodChk(a, 'either'), prodChk(g, 'either'), prodChk(L, 'either'), numChk(b, [], other)], [plainFac(a), plainFac(g), plainFac(L), String(b)],
            t(a + '=' + K.fac(a)) + ', ' + t(g + '=' + K.fac(g)) + ', ' + t(F(L) + '=' + K.fac(L)) + '; other number ' + t(b),
            t(a + '=' + K.fac(a)) + ', GCF ' + t(g + '=' + K.fac(g)) + ', LCM ' + t(F(L) + '=' + K.fac(L)) + '.<br>For each prime, one number has the GCF’s power and the other has the LCM’s power:<br>' + why + '.<br>Other number ' + t('=' + K.fac(b) + '=' + b) + '. (Check: ' + t(g + '\\times ' + F(L) + '=' + F(g * L) + '=' + a + '\\times ' + b) + '.)',
            ['Compare the power of each prime in ' + t(a) + ', the GCF and the LCM.', 'Check your answer: ' + t('\\text{GCF}\\times\\text{LCM}') + ' equals the product of the two numbers.'], 'other number: GCF ' + g + ', LCM ' + L + ', one is ' + a);
        } }] },

      /* ======================= AN2 · Part 1 ======================= */
      { num: '13', section: 'AN2 · Part 1 — Beginning', outcome: 'AN2', stem: 'Decide whether each number is <b>rational</b> ' + t('(Q)') + ' or <b>irrational</b> ' + t('(\\overline{Q})') + '.', parts: [
        { id: '13', outcome: 'AN2', level: 'BEG', make: function (r) {
          var k = r.int(6, 12), n = r.pick([20, 24, 27, 30, 32, 40, 45, 50, 60]), d = r.int(1, 8), ip = r.pick([0, 0, 1]), p = r.int(2, 13), q = r.pick([7, 9, 11, 3, 13].filter(function (x) { return x !== p && gcd(x, p) === 1; }));
          var pi = r.pick([['\\pi', 0, 'it is ' + t('\\pi') + ', whose decimal never ends and never repeats'], ['3.14', 1, 'it is a terminating decimal, ' + t('\\frac{314}{100}') + ' (only an approximation of ' + t('\\pi') + ')'], ['2\\pi', 0, t('2\\pi') + ' is a multiple of ' + t('\\pi') + ', which is irrational'], ['\\frac{22}{7}', 1, 'it is a fraction of integers (only an approximation of ' + t('\\pi') + ')']]);
          var cr = r.chance(0.5) ? [r.pick([8, 27, 64, 125]), 1] : [r.pick([16, 9, 25, 50, 100]), 0];
          var dd = r.int(1, 9), ip2 = r.int(0, 5), pat = r.chance(0.5) ? ip2 + '.' + dd + '0' + dd + '00' + dd + '000' + dd + '\\ldots' : ip2 + '.' + dd + (dd + 1) % 10 + '0' + dd + (dd + 1) % 10 + '00' + dd + (dd + 1) % 10 + '\\ldots';
          var a2 = r.int(1, 6), b2 = r.pick([5, 7, 8, 9, 10, 11].filter(function (x) { return x > a2 && gcd(x, a2) === 1; }));
          var rows = [
            { id: 's', tex: '\\sqrt{' + k * k + '}', rat: 1, why: t('\\sqrt{' + k * k + '}=' + k) + ', an integer' },
            { id: 'n', tex: '\\sqrt{' + n + '}', rat: 0, why: t(n) + ' is not a perfect square, so the decimal never ends and never repeats' },
            { id: 'r', tex: ip + '.\\overline{' + d + '}', rat: 1, why: 'it repeats: ' + t(ip + '.\\overline{' + d + '}=' + ex.texRat(ex.norm(9 * ip + d, 9))) },
            { id: 'p', tex: pi[0], rat: pi[1], why: pi[2] },
            { id: 'f', tex: '-\\dfrac{' + p + '}{' + q + '}', rat: 1, why: 'it is a fraction of integers' },
            { id: 'c', tex: '\\sqrt[3]{' + cr[0] + '}', rat: cr[1], why: cr[1] ? t('\\sqrt[3]{' + cr[0] + '}=' + intRoot(cr[0], 3)) + ', an integer' : t(cr[0]) + ' is not a perfect cube, so the cube root never ends and never repeats' },
            { id: 'd', tex: pat, rat: 0, why: 'the pattern keeps changing, so the decimal never ends and never repeats' },
            { id: 'q', tex: '\\sqrt{\\dfrac{' + a2 * a2 + '}{' + b2 * b2 + '}}', rat: 1, why: t('\\sqrt{\\frac{' + a2 * a2 + '}{' + b2 * b2 + '}}=\\frac{' + a2 + '}{' + b2 + '}') }];
          rows = r.shuffle(rows);
          var want = {}, by = {}; rows.forEach(function (x) { want[x.id] = x.rat ? 'Q' : 'Qb'; by[x.id] = x; });
          return P.grid('Choose ' + t('Q') + ' or ' + t('\\overline{Q}') + ' for each number.', rows.map(function (x) { return { id: x.id, html: t(x.tex), label: x.id }; }),
            [{ id: 'Q', html: t('Q') + ' rational', label: 'Q' }, { id: 'Qb', html: t('\\overline{Q}') + ' irrational', label: 'Q-bar' }], want,
            { why: function (id) { var x = by[id]; return { code: x.rat ? 'sets-rat' : 'sets-irr', hint: t(x.tex) + ' is ' + (x.rat ? 'rational' : 'irrational') + ': ' + x.why + '.' }; }, rowHead: 'Number' },
            rows.map(function (x) { return t(x.tex) + ': ' + (x.rat ? t('Q') : t('\\overline{Q}')) + ' — ' + x.why + '.'; }).join('<br>'),
            ['A rational number can be written as a fraction of integers: its decimal ends or repeats.', 'Simplify each root first: is the radicand a perfect square (or cube)?'], 'rational or irrational: 8 numbers');
        } }] },
      { num: '14', outcome: 'AN2', shared: function (r) { return { n: find(function () { return r.int(20, 99); }, function (n) { var x = Math.sqrt(n), f = x - Math.floor(x); return f >= 0.2 && f <= 0.8; }, 53) }; },
        stem: function (s) { return 'Consider ' + t('\\sqrt{' + s.n + '}') + '.'; },
        parts: [
          { id: '14a', outcome: 'AN2', level: 'BEG', make: function (r, s) {
            var n = s.n, lo = Math.floor(Math.sqrt(n)), hi = lo + 1, e = '\\sqrt{' + n + '}';
            function side(isLo) {
              var want = isLo ? lo : hi;
              return K.number(want, function (v) {
                if (!Number.isInteger(v)) return { code: 'bracket', hint: 'Give a whole number.' };
                if (v === want * want) return { code: 'power-not-root', hint: t(want * want) + ' is the perfect square. Give the whole number it comes from: ' + t('\\sqrt{' + want * want + '}') + '.' };
                if (isLo && v === hi) return { code: 'swapped-bounds', hint: 'That’s the larger whole number. The first box is the smaller one.' };
                if (!isLo && v === lo) return { code: 'swapped-bounds', hint: 'That’s the smaller whole number. The second box is the larger one.' };
                if (isLo) return v * v > n ? { code: 'bracket', hint: 'Check: ' + t(v + '^{2}=' + v * v) + ', which is more than ' + t(n) + '.' } : { code: 'bracket', hint: 'Get closer: ' + t((v + 1) + '^{2}=' + (v + 1) * (v + 1)) + ' is still less than ' + t(n) + '.' };
                return v * v < n ? { code: 'bracket', hint: 'Check: ' + t(v + '^{2}=' + v * v) + ', which is less than ' + t(n) + '.' } : { code: 'bracket', hint: 'Get closer: ' + t((v - 1) + '^{2}=' + (v - 1) * (v - 1)) + ' is still more than ' + t(n) + '.' };
              });
            }
            return P.fields('Between which two consecutive whole numbers is ' + t(e) + '?', [{ name: 'Smaller', label: '', after: t('<' + e) }, { name: 'Larger', label: '', before: t(e + '<') }], [side(true), side(false)], [String(lo), String(hi)], t(lo + '<' + e + '<' + hi),
              t(lo + '^{2}=' + lo * lo) + ' and ' + t(hi + '^{2}=' + hi * hi) + ', and ' + t(lo * lo + '<' + n + '<' + hi * hi) + ', so ' + t(lo + '<' + e + '<' + hi) + '.',
              ['List the perfect squares near ' + t(n) + '.', 'Which two consecutive whole numbers have squares on either side of ' + t(n) + '?'], 'bracket sqrt ' + n);
          } },
          { id: '14b', outcome: 'AN2', level: 'BEG', make: function (r, s) {
            var n = s.n, x = Math.sqrt(n), lo = Math.floor(x), hi = lo + 1, close = n - lo * lo < hi * hi - n;
            return P.numplace('Mark ' + t('\\sqrt{' + n + '}') + ' on the number line.', { min: lo - 1, max: hi + 1, step: 0.5, labels: 1, items: [{ id: 's', tex: '\\sqrt{' + n + '}' }] }, { s: x },
              t(lo * lo + '<' + n + '<' + hi * hi) + ', so ' + t('\\sqrt{' + n + '}') + ' is between ' + t(lo) + ' and ' + t(hi) + '. ' + t(n) + ' is ' + t(n - lo * lo) + ' above ' + t(lo * lo) + ' and ' + t(hi * hi - n) + ' below ' + t(hi * hi) + ', so it is closer to ' + t(close ? lo : hi) + ': about ' + t(x.toFixed(1)) + '.',
              ['First find the two whole numbers it is between.', 'Is ' + t(n) + ' closer to ' + t(lo * lo) + ' or to ' + t(hi * hi) + '?'], 'mark sqrt ' + n + ' on a number line',
              { tol: 0.2, hints: { s: t('\\sqrt{' + n + '}') + ' is between ' + t(lo) + ' and ' + t(hi) + ', closer to ' + t(close ? lo : hi) + '.' } });
          } }] },
      { num: '15', section: 'AN2 · Part 1 — Progressing', outcome: 'AN2', stem: 'Tick <b>every</b> set each number belongs to.', parts: [
        { id: '15', outcome: 'AN2', level: 'PRG', make: function (r) {
          var k1 = r.int(3, 7), n1 = r.pick([['-\\sqrt{' + k1 * k1 + '}', '-' + k1], ['-\\dfrac{' + 5 * k1 + '}{5}', '-' + k1], ['-\\dfrac{' + 4 * k1 + '}{4}', '-' + k1]]);
          var z = r.pick([['0', null], ['\\sqrt{0}', '\\sqrt{0}=0'], ['\\dfrac{0}{7}', '\\frac{0}{7}=0']]);
          var k3 = r.int(2, 8), n3 = r.pick([['\\dfrac{' + 3 * k3 + '}{3}', '\\frac{' + 3 * k3 + '}{3}=' + k3], ['\\sqrt{' + k3 * k3 + '}', '\\sqrt{' + k3 * k3 + '}=' + k3], ['\\dfrac{' + 5 * k3 + '}{5}', '\\frac{' + 5 * k3 + '}{5}=' + k3]]);
          var ir = r.pick([['\\sqrt{18}', '18\\text{ is not a perfect square}'], ['\\sqrt{12}', '12\\text{ is not a perfect square}'], ['\\sqrt[3]{10}', '10\\text{ is not a perfect cube}'], ['\\sqrt{20}', '20\\text{ is not a perfect square}'], ['\\sqrt[3]{25}', '25\\text{ is not a perfect cube}']]);
          var fr = r.pick([[r.int(1, 9) + '.' + r.pick([25, 75, 5]), null], ['-' + r.int(1, 9) + '.' + r.int(1, 9), null], ['0.\\overline{' + r.int(1, 8) + '}', null]]);
          var c = r.int(2, 5), ng = ['\\sqrt[3]{-' + c * c * c + '}', '\\sqrt[3]{-' + c * c * c + '}=-' + c];
          var items = r.shuffle([{ id: 'ni', tex: n1[0], cls: 'negint', note: n1[0].replace('\\dfrac', '\\frac') + '=' + n1[1] }, { id: 'z', tex: z[0], cls: 'zero', note: z[1] }, { id: 'na', tex: n3[0], cls: 'nat', note: n3[1] },
            { id: 'ir', tex: ir[0], cls: 'irr', note: ir[1] }, { id: 'fr', tex: fr[0], cls: 'frac', note: null }, { id: 'cb', tex: ng[0], cls: 'negint', note: ng[1] }]);
          var want = {}, by = {}; items.forEach(function (x) { want[x.id] = SETS[x.cls].slice(); by[x.id] = x; });
          return P.grid('Tick every set each number belongs to.', items.map(function (x) { return { id: x.id, html: t(x.tex), label: x.id }; }), SET_COLS, want,
            { why: function (id, got) { return setHint(by[id], got); }, rowHead: 'Number' },
            items.map(function (x) { return t(x.tex) + (x.note ? ': ' + t(x.note) : '') + ' → ' + setList(want[x.id]); }).join('<br>'),
            ['Simplify each number first. Then work up the chain ' + t('N\\subset W\\subset I\\subset Q') + '; an irrational number is in ' + t('\\overline{Q}') + ' only.'], 'number sets: 6 numbers');
        } }] },
      { num: '16', outcome: 'AN2', stem: function (s) { return '<b>Without a calculator</b>, compare ' + s.items.map(function (x) { return t(x.tex); }).join(', ') + '.'; },
        shared: function (r) {
          var fb = { items: [{ id: 'm1', tex: '2\\sqrt{7}', v: 28, kind: 'm', a: 2, b: 7 }, { id: 'm2', tex: '3\\sqrt{3}', v: 27, kind: 'm', a: 3, b: 3 }, { id: 'e', tex: '\\sqrt{26}', v: 26, kind: 'e' }, { id: 'd', tex: '5.2', v: 27.04, kind: 'd', D: 52 }] };
          return find(function () {
            var N0 = r.int(16, 60), lo = N0 - 3, hi = N0 + 3, mixed = [];
            [2, 3, 4].forEach(function (a) { [2, 3, 5, 6, 7, 10, 11, 13, 14, 15].forEach(function (b) { var v = a * a * b; if (v >= lo && v <= hi) mixed.push({ a: a, b: b, v: v }); }); });
            if (mixed.length < 2) return null;
            var two = r.sample(mixed, 2); if (two[0].v === two[1].v) return null;
            var ents = []; for (var N = lo; N <= hi; N++) if (!isPow(N, 2) && N !== two[0].v && N !== two[1].v) ents.push(N);
            var decs = []; for (var D = Math.floor(Math.sqrt(lo) * 10); D <= Math.ceil(Math.sqrt(hi) * 10); D++) if (D % 10 && D * D > lo * 100 && D * D < hi * 100) decs.push(D);
            if (!ents.length || !decs.length) return null;
            var e = r.pick(ents), D0 = r.pick(decs);
            return { items: r.shuffle([{ id: 'm1', tex: two[0].a + '\\sqrt{' + two[0].b + '}', v: two[0].v, kind: 'm', a: two[0].a, b: two[0].b }, { id: 'm2', tex: two[1].a + '\\sqrt{' + two[1].b + '}', v: two[1].v, kind: 'm', a: two[1].a, b: two[1].b },
              { id: 'e', tex: '\\sqrt{' + e + '}', v: e, kind: 'e' }, { id: 'd', tex: (D0 / 10).toFixed(1), v: D0 * D0 / 100, kind: 'd', D: D0 }]) };
          }, function () { return true; }, fb);
        },
        parts: [
          { id: '16a', outcome: 'AN2', level: 'PRG', make: function (r, s) {
            var its = s.items.filter(function (x) { return x.kind !== 'e'; });
            var chks = its.map(function (x) {
              if (x.kind === 'm') return numChk(x.v, [{ v: x.a * x.b, code: 'rsq-coef', hint: 'Square the coefficient too: ' + t('\\left(' + x.tex + '\\right)^{2}=' + x.a + '^{2}\\times ' + x.b) + '.' }, { v: 2 * x.a * x.b, code: 'rsq-double', hint: 'Squaring means multiplying by itself, not doubling: ' + t('\\left(' + x.tex + '\\right)^{2}=' + x.a + '^{2}\\times(\\sqrt{' + x.b + '})^{2}') + '.' }]);
              var dd = x.D / 10, ip = Math.floor(dd), fp = x.D % 10;
              return numChk(x.v, [{ v: (ip * ip * 100 + fp * fp) / 100, code: 'sq-decimal', hint: 'Not quite: ' + t(dd.toFixed(1) + '^{2}') + ' isn’t ' + t(ip + '^{2}') + ' and ' + t('0.' + fp + '^{2}') + ' put together. Multiply ' + t(dd.toFixed(1) + '\\times ' + dd.toFixed(1)) + ' in full.' }, { v: 2 * dd, code: 'rsq-double', hint: 'Squaring means ' + t(dd.toFixed(1) + '\\times ' + dd.toFixed(1)) + ', not doubling.' }]);
            });
            return P.fields('<b>Without a calculator</b>, square each number. (This writes each one as the square root of a number you can compare.)',
              its.map(function (x) { return { name: t('\\left(' + x.tex + '\\right)^{2}'), before: t('\\left(' + x.tex + '\\right)^{2}=') }; }), chks, its.map(function (x) { return dec2(x.v); }),
              its.map(function (x) { return t('\\left(' + x.tex + '\\right)^{2}=' + dec2(x.v)); }).join(', '),
              its.map(function (x) { return x.kind === 'm' ? t('\\left(' + x.tex + '\\right)^{2}=' + x.a + '^{2}\\times ' + x.b + '=' + x.v) + ', so ' + t(x.tex + '=\\sqrt{' + x.v + '}') : t((x.D / 10).toFixed(1) + '^{2}=' + (x.D / 10).toFixed(1) + '\\times ' + (x.D / 10).toFixed(1) + '=' + dec2(x.v)) + ', so ' + t(x.tex + '=\\sqrt{' + dec2(x.v) + '}'); }).join('<br>'),
              ['A mixed radical squared: ' + t('(a\\sqrt{b})^{2}=a^{2}\\times b') + '.'], 'square to compare');
          } },
          { id: '16b', outcome: 'AN2', level: 'PRG', make: function (r, s) {
            var sorted = s.items.slice().sort(function (a, b) { return a.v - b.v; }), by = {}; s.items.forEach(function (x) { by[x.id] = x; });
            var sq = function (x) { return x.kind === 'e' ? x.tex : '\\sqrt{' + dec2(x.v) + '}'; };
            return P.order(r, '<b>Without a calculator</b>, order these numbers from least to greatest: ' + s.items.map(function (x) { return t(x.tex); }).join(', ') + '.', sorted,
              { why: function (a, b) { return t(by[a].tex) + ' and ' + t(by[b].tex) + ' are in the wrong order. Write each as a square root and compare: ' + t(by[a].tex + '=' + sq(by[a])) + ', ' + t(by[b].tex + '=' + sq(by[b])) + '.'; } },
              'Write each one as the square root of a number:<br>' + s.items.map(function (x) { return x.kind === 'e' ? t(x.tex) : t(x.tex + '=' + sq(x)); }).join(', ') + '<br>' + t(sorted.map(function (x) { return dec2(x.v); }).join('<')) + ', so<br>' + t(sorted.map(function (x) { return x.tex; }).join('\\ <\\ ')),
              ['Write each number as a square root: ' + t('a\\sqrt{b}=\\sqrt{a^{2}b}') + ' and ' + t('d=\\sqrt{d^{2}}') + '. Then compare what is under the roots.'], 'order 2 mixed, 1 entire, 1 decimal');
          } }] },
      { num: '17', section: 'AN2 · Part 1 — Mastering', outcome: 'AN2', stem: '<b>True or false?</b> Each answer must have a correct reason or counterexample.', parts: [
        { id: '17a', outcome: 'AN2', level: 'MAS', make: function (r) { return tfPart(r, tfSlotA(r), 'a'); } },
        { id: '17b', outcome: 'AN2', level: 'MAS', make: function (r) { return tfPart(r, tfSlotB(r), 'b'); } },
        { id: '17c', outcome: 'AN2', level: 'MAS', make: function (r) { return tfPart(r, tfSlotC(r), 'c'); } }] },
      { num: '18', outcome: 'AN2',
        shared: function (r) {
          var k = r.pick([2, 3, 4]), R = { 2: { d4: [1, 3], x: [9, 20], y: [5, 8] }, 3: { d4: [1, 10], x: [28, 50], y: [10, 15] }, 4: { d4: [1, 16], x: [65, 90], y: [17, 20] } }[k];
          return find(function () { return { k: k, z: Math.pow(k, 4) - r.int(R.d4[0], R.d4[1]), x: r.int(R.x[0], R.x[1]), y: r.int(R.y[0], R.y[1]) }; }, function (s) { return s.x * s.x !== s.y * s.y * s.y && !isPow(s.x, 3) && !isPow(s.y, 2); }, { k: 3, z: 80, x: 30, y: 10 });
        },
        stem: function (s) { return '<b>Without a calculator</b>, compare ' + t('\\sqrt[3]{' + s.x + '}') + ', ' + t('\\sqrt{' + s.y + '}') + ' and ' + t('\\sqrt[4]{' + s.z + '}') + '.'; },
        parts: [
          { id: '18a', outcome: 'AN2', level: 'MAS', make: function (r, s) {
            var x = s.x, y = s.y, cx = '\\sqrt[3]{' + x + '}', sy = '\\sqrt{' + y + '}';
            return P.fields('Compare ' + t(cx) + ' and ' + t(sy) + ' by raising both to the 6th power. Give each result as a whole number.',
              [{ name: 'cube root', before: t('\\left(' + cx + '\\right)^{6}=') }, { name: 'square root', before: t('\\left(' + sy + '\\right)^{6}=') }],
              [numChk(x * x, [{ v: x * x * x, code: 'six-power', hint: 'A cube root to the 6th power: ' + t('\\left(' + cx + '\\right)^{6}=\\left(\\left(' + cx + '\\right)^{3}\\right)^{2}=' + x + '^{2}') + ' — divide ' + t('6') + ' by the index ' + t('3') + '.' }, { v: 2 * x, code: 'six-power', hint: t(x + '^{2}') + ' means ' + t(x + '\\times ' + x) + '.' }]),
                numChk(y * y * y, [{ v: y * y, code: 'six-power', hint: 'A square root to the 6th power: ' + t('\\left(' + sy + '\\right)^{6}=\\left(\\left(' + sy + '\\right)^{2}\\right)^{3}=' + y + '^{3}') + ' — divide ' + t('6') + ' by the index ' + t('2') + '.' }, { v: 3 * y, code: 'six-power', hint: t(y + '^{3}') + ' means ' + t(y + '\\times ' + y + '\\times ' + y) + '.' }])],
              [String(x * x), String(y * y * y)], t('\\left(' + cx + '\\right)^{6}=' + F(x * x)) + ', ' + t('\\left(' + sy + '\\right)^{6}=' + F(y * y * y)),
              t('\\left(' + cx + '\\right)^{6}=' + x + '^{2}=' + F(x * x)) + ' and ' + t('\\left(' + sy + '\\right)^{6}=' + y + '^{3}=' + F(y * y * y)) + '.<br>' + (x * x < y * y * y ? t(F(x * x) + '<' + F(y * y * y)) + ', so ' + t(cx + '<' + sy) : t(F(x * x) + '>' + F(y * y * y)) + ', so ' + t(cx + '>' + sy)) + '.',
              ['6 is a multiple of both indexes: ' + t('\\left(\\sqrt[3]{a}\\right)^{6}=a^{2}') + ' and ' + t('\\left(\\sqrt{b}\\right)^{6}=b^{3}') + '.'], '6th powers of cbrt ' + x + ', sqrt ' + y);
          } },
          { id: '18b', outcome: 'AN2', level: 'MAS', make: function (r, s) {
            var k = s.k, items = [{ id: 'c', tex: '\\sqrt[3]{' + s.x + '}', v: Math.cbrt(s.x) }, { id: 's', tex: '\\sqrt{' + s.y + '}', v: Math.sqrt(s.y) }, { id: 'f', tex: '\\sqrt[4]{' + s.z + '}', v: Math.pow(s.z, 0.25) }];
            var sorted = items.slice().sort(function (a, b) { return a.v - b.v; }), cLess = s.x * s.x < s.y * s.y * s.y;
            return P.order(r, '<b>Without a calculator</b>, order from least to greatest: ' + items.map(function (x) { return t(x.tex); }).join(', ') + '.', sorted,
              { why: function (a, b) { return (a === 'f' || b === 'f') ? 'Compare each number with ' + t(k) + ': ' + t(k + '^{4}=' + Math.pow(k, 4)) + ', ' + t(k + '^{3}=' + Math.pow(k, 3)) + ', ' + t(k + '^{2}=' + k * k) + '.' : 'Raise both to the 6th power: ' + t('\\left(\\sqrt[3]{' + s.x + '}\\right)^{6}=' + s.x * s.x) + ' and ' + t('\\left(\\sqrt{' + s.y + '}\\right)^{6}=' + s.y * s.y * s.y) + '.'; } },
              'Compare each with ' + t(k) + ': ' + t(k + '^{4}=' + Math.pow(k, 4) + '>' + s.z) + ', so ' + t('\\sqrt[4]{' + s.z + '}<' + k) + '; ' + t(k + '^{3}=' + Math.pow(k, 3) + '<' + s.x) + ', so ' + t('\\sqrt[3]{' + s.x + '}>' + k) + '; ' + t(k + '^{2}=' + k * k + '<' + s.y) + ', so ' + t('\\sqrt{' + s.y + '}>' + k) + '.<br>' +
                t('\\sqrt[3]{' + s.x + '}') + ' vs ' + t('\\sqrt{' + s.y + '}') + ': 6th powers ' + t(s.x + '^{2}=' + F(s.x * s.x)) + ' and ' + t(s.y + '^{3}=' + F(s.y * s.y * s.y)) + ', so ' + (cLess ? t('\\sqrt[3]{' + s.x + '}<\\sqrt{' + s.y + '}') : t('\\sqrt{' + s.y + '}<\\sqrt[3]{' + s.x + '}')) + '.<br>' + t(sorted.map(function (x) { return x.tex; }).join('\\ <\\ ')),
              ['Compare each number with ' + t(k) + ' first.', 'To compare a cube root with a square root, raise both to the 6th power.'], 'order cbrt, sqrt, 4th root');
          } }] },

      /* ======================= AN2 · Part 2 ======================= */
      { num: '19', section: 'AN2 · Part 2 — Beginning', outcome: 'AN2', stem: 'Write each as a <b>mixed radical</b> in simplest form.', shared: function (r) { return { km: pick3(r, BEG_RAD) }; }, parts: [0, 1, 2].map(function (j) {
        return { id: '19' + 'abc'[j], outcome: 'AN2', level: 'BEG', make: function (r, s) { return mixedPart(s.km[j][0], 2, s.km[j][1]); } }; }) },
      { num: '20', outcome: 'AN2', stem: 'Write each as an <b>entire radical</b>.', shared: function (r) { return { km: pick3(r, BEG_RAD) }; }, parts: [0, 1, 2].map(function (j) {
        return { id: '20' + 'abc'[j], outcome: 'AN2', level: 'BEG', make: function (r, s) { return entirePart(s.km[j][0], 2, s.km[j][1]); } }; }) },
      { num: '21', section: 'AN2 · Part 2 — Progressing', outcome: 'AN2', stem: 'Write each as a <b>mixed radical</b> in simplest form.', parts: [
        { id: '21a', outcome: 'AN2', level: 'PRG', make: function (r) { var km = r.pick(radPool(2, [4, 12], 100, 500)); return mixedPart(km[0], 2, km[1]); } },
        { id: '21b', outcome: 'AN2', level: 'PRG', make: function (r) {
          var sm = r.pick(radPool(2, [2, 5], 8, 75)), v = { c: r.pick([2, 3, 4, 5]), s: sm[0], m: sm[1] };
          var inner = v.s * v.s * v.m, k = v.c * v.s;
          return P.radical(t(v.c + '\\sqrt{' + inner + '}'), { k: k, n: 2, m: v.m }, 'mixed', t(v.c + '\\sqrt{' + inner + '}=' + v.c + '\\sqrt{' + v.s * v.s + '\\times ' + v.m + '}=' + v.c + '\\times ' + v.s + '\\sqrt{' + v.m + '}=' + rad(k, 2, v.m)) + '.',
            ['Simplify ' + t('\\sqrt{' + inner + '}') + ' first, then multiply by the ' + t(v.c) + ' in front.'], 'mixed radical of ' + v.c + 'sqrt' + inner,
            { diag: function (val, rr) { if (rr && rr.n === 2 && rr.m === v.m && rr.k[1] === 1 && rr.k[0] === v.s) return { code: 'coef-forgot', hint: 'You simplified the root, but the ' + t(v.c) + ' in front still multiplies it: ' + t(v.c + '\\times ' + v.s + '\\sqrt{' + v.m + '}') + '.' }; if (rr && rr.n === 2 && rr.m === v.m && rr.k[1] === 1 && rr.k[0] === v.c + v.s) return { code: 'coef-added', hint: 'Multiply the numbers in front, don’t add them: ' + t(v.c + '\\times ' + v.s) + '.' }; return null; } });
        } },
        { id: '21c', outcome: 'AN2', level: 'PRG', make: function (r) { var km = r.pick(radPool(3, [2, 5], 16, 300)); return mixedPart(km[0], 3, km[1]); } },
        { id: '21d', outcome: 'AN2', level: 'PRG', make: function (r) { var km = r.pick(radPool(4, [2, 3], 32, 600)); return mixedPart(km[0], 4, km[1]); } }] },
      { num: '22', outcome: 'AN2', stem: 'Write each as an <b>entire radical</b>.', parts: [
        { id: '22a', outcome: 'AN2', level: 'PRG', make: function (r) { var km = r.pick(radPool(3, [2, 5], 16, 400)); return entirePart(km[0], 3, km[1]); } },
        { id: '22b', outcome: 'AN2', level: 'PRG', make: function (r) { var km = r.pick(radPool(3, [2, 4], 16, 200)); return entirePart(-km[0], 3, km[1]); } }] },
      { num: '23', section: 'AN2 · Part 2 — Mastering', outcome: 'AN2',
        shared: function (r) { return { d: r.pick([6, 8, 10, 12, 14, 16, 18, 20]), what: r.pick(['photo', 'tile', 'window', 'coaster', 'napkin']) }; },
        stem: function (s) { return 'A square ' + s.what + ' has a diagonal of ' + t(s.d) + ' cm.' + squareSvg(s.d); },
        parts: [
          { id: '23', outcome: 'AN2', level: 'MAS', make: function (r, s) {
            var d = s.d, h = d / 2, s2 = d * d / 2;
            var side = K.radical({ k: h, n: 2, m: 2 }, 'mixed', { diag: function (val, rr) { if (rr && rr.n === 2 && rr.m === 2 && rr.k[0] === d && rr.k[1] === 1) return { code: 'diag-times', hint: 'The side is <b>shorter</b> than the diagonal. Use ' + t('s^{2}+s^{2}=' + d + '^{2}') + '.' }; if (Math.abs(val - d) < 1e-9) return { code: 'diag-square', hint: 'The diagonal isn’t a side. Use the Pythagorean theorem: ' + t('s^{2}+s^{2}=' + d + '^{2}') + '.' }; return null; } });
            var per = K.radical({ k: 2 * d, n: 2, m: 2 }, 'mixed', { diag: function (val, rr) { if (rr && rr.n === 2 && rr.m === 2 && rr.k[1] === 1 && rr.k[0] === d) return { code: 'diag-perim', hint: 'A square has <b>four</b> sides: perimeter ' + t('=4s') + '.' }; return null; } });
            return P.fields('Find ' + t('s^{2}') + ', then the <b>exact</b> side length ' + t('s') + ' in simplest mixed radical form, and the exact perimeter.',
              [{ name: 's²', before: t('s^{2}='), mode: 'math', keys: 'radical', after: t('\\text{cm}^{2}') }, { name: 'Side', before: t('s='), mode: 'math', keys: 'radical', after: 'cm' }, { name: 'Perimeter', label: 'Perimeter:', mode: 'math', keys: 'radical', after: 'cm' }],
              [numChk(s2, [{ v: d * d, code: 'diag-square', hint: 'There are two sides in the Pythagorean theorem: ' + t('s^{2}+s^{2}=2s^{2}=' + d * d) + '.' }, { v: d / 2, code: 'diag-square', hint: t('s^{2}') + ' is the area of the square: solve ' + t('2s^{2}=' + d + '^{2}') + '.' }]), side, per],
              [String(s2), h + '\\sqrt{2}', 2 * d + '\\sqrt{2}'], t('s^{2}=' + s2) + ', ' + t('s=' + h + '\\sqrt{2}') + ' cm, perimeter ' + t(2 * d + '\\sqrt{2}') + ' cm',
              'Pythagorean theorem: ' + t('s^{2}+s^{2}=' + d + '^{2}') + '<br>' + t('2s^{2}=' + d * d) + ', ' + t('s^{2}=' + s2) + '<br>' + t('s=\\sqrt{' + s2 + '}=\\sqrt{' + h * h + '\\times 2}=' + h + '\\sqrt{2}') + ' cm<br>Perimeter ' + t('=4\\times ' + h + '\\sqrt{2}=' + 2 * d + '\\sqrt{2}') + ' cm',
              ['The diagonal is the hypotenuse of a right triangle whose legs are two sides: ' + t('s^{2}+s^{2}=d^{2}') + '.', 'Simplify ' + t('\\sqrt{s^{2}}') + ' using its largest perfect square factor.'], 'square diagonal ' + d);
          } }] },
      { num: '24', outcome: 'AN2',
        shared: function (r) {
          var a = find(function () { var sq = r.pick([4, 6]), m = r.pick([2, 3, 5, 7]), q = r.pick(sq === 4 ? [2] : [2, 3]); return { s: sq, m: m, q: q, N: sq * sq * m }; }, function (v) { return v.N <= 120; }, { s: 4, m: 3, q: 2, N: 48 });
          var c2 = r.pick([2, 3]), b = { c: c2, m: r.pick([2, 3, 4, 5, 7].filter(function (x) { return x !== c2; })) }; // c ≠ m, so Jordan's c²·m is never a perfect cube
          return { i: a, ii: b };
        },
        stem: function (s) { var a = s.i, b = s.ii, rest = a.N / (a.q * a.q); return 'Jordan simplified two radicals. Each answer has an error.<br>(i) ' + t('\\sqrt{' + a.N + '}=\\sqrt{' + a.q * a.q + '\\times ' + rest + '}=' + a.q + '\\sqrt{' + rest + '}') + '<br>(ii) ' + t(b.c + '\\sqrt[3]{' + b.m + '}=\\sqrt[3]{' + b.c + '^{2}\\times ' + b.m + '}=\\sqrt[3]{' + b.c * b.c * b.m + '}'); },
        parts: [
          { id: '24ia', sub: 'i a', outcome: 'AN2', level: 'MAS', make: function (r, s) {
            var a = s.i, rest = a.N / (a.q * a.q), f = ex.nthFactor(rest, 2), big = a.s * a.s;
            return P.mc(r, 'What is Jordan’s error in (i) ' + t('\\sqrt{' + a.N + '}=\\sqrt{' + a.q * a.q + '\\times ' + rest + '}=' + a.q + '\\sqrt{' + rest + '}') + '?', [
              { html: t(rest) + ' still has a perfect-square factor, ' + t(f * f) + ', so ' + t(a.q + '\\sqrt{' + rest + '}') + ' is not in simplest form. Jordan should use the <b>largest</b> perfect square, ' + t(big) + '.', right: true },
              { html: t(a.q * a.q + '\\times ' + rest) + ' does not equal ' + t(a.N) + '.', why: 'Check: ' + t(a.q * a.q + '\\times ' + rest + '=' + a.N) + '. The arithmetic is fine.' },
              { html: t('\\sqrt{' + a.q * a.q + '}') + ' should come out as ' + t(a.q * a.q) + ', not ' + t(a.q) + '.', why: t('\\sqrt{' + a.q * a.q + '}=' + a.q) + ', so taking out ' + t(a.q) + ' is right.' },
              { html: 'There is no error: ' + t(a.q + '\\sqrt{' + rest + '}') + ' is in simplest form.', why: t(rest + '=' + f * f + '\\times ' + rest / (f * f)) + ' still has a perfect-square factor.' }],
              'Every step is equal, but the answer is not in simplest form: ' + t(rest + '=' + f * f + '\\times ' + rest / (f * f)) + ' still has the perfect-square factor ' + t(f * f) + '. Use the largest perfect square, ' + t(big) + ': ' + t('\\sqrt{' + a.N + '}=\\sqrt{' + big + '\\times ' + a.m + '}=' + a.s + '\\sqrt{' + a.m + '}') + '.',
              ['Is there a perfect square left under the root in Jordan’s answer?'], 'Jordan error (i) sqrt ' + a.N);
          } },
          { id: '24ib', sub: 'i b', outcome: 'AN2', level: 'MAS', make: function (r, s) {
            var a = s.i, p = mixedPart(a.s, 2, a.m);
            p.prompt = 'Write the correct simplest form of ' + t('\\sqrt{' + a.N + '}') + ' for (i).';
            return p;
          } },
          { id: '24iia', sub: 'ii a', outcome: 'AN2', level: 'MAS', make: function (r, s) {
            var b = s.ii, c = b.c, m = b.m;
            return P.mc(r, 'What is Jordan’s error in (ii) ' + t(c + '\\sqrt[3]{' + m + '}=\\sqrt[3]{' + c + '^{2}\\times ' + m + '}=\\sqrt[3]{' + c * c * m + '}') + '?', [
              { html: 'With index ' + t('3') + ', the coefficient must be <b>cubed</b> before it moves inside, not squared: ' + t(c + '=\\sqrt[3]{' + c * c * c + '}') + '.', right: true },
              { html: 'The ' + t(c) + ' should be multiplied by ' + t(m) + ' inside the root, giving ' + t('\\sqrt[3]{' + c * m + '}') + '.', why: 'That ignores the index completely: ' + t('\\sqrt[3]{' + c * m + '}') + ' is much smaller than ' + t(c + '\\sqrt[3]{' + m + '}') + '. A number outside a cube root is the cube root of its <b>cube</b>.' },
              { html: 'There is no error: a coefficient is always squared when it moves inside a radical.', why: 'Squaring is only for square roots (index ' + t('2') + '). The index here is ' + t('3') + '.' },
              { html: 'A cube root can’t be written as an entire radical.', why: 'It can: ' + t(c + '\\sqrt[3]{' + m + '}=\\sqrt[3]{' + c + '^{3}\\times ' + m + '}') + '.' }],
              'The index is ' + t('3') + ', so the coefficient goes inside as its <b>cube</b>: ' + t(c + '=\\sqrt[3]{' + c + '^{3}}=\\sqrt[3]{' + c * c * c + '}') + '. So ' + t(c + '\\sqrt[3]{' + m + '}=\\sqrt[3]{' + c + '^{3}\\times ' + m + '}=\\sqrt[3]{' + c * c * c * m + '}') + '.',
              ['What power matches the index of a cube root?'], 'Jordan error (ii) ' + c + 'cbrt' + m);
          } },
          { id: '24iib', sub: 'ii b', outcome: 'AN2', level: 'MAS', make: function (r, s) {
            var b = s.ii, p = entirePart(b.c, 3, b.m);
            p.prompt = 'Write the correct entire radical for ' + t(b.c + '\\sqrt[3]{' + b.m + '}') + ' in (ii).';
            return p;
          } }] }
    ]
  });

  /* ---------- part makers used above (function declarations are hoisted) ---------- */
  function gcfPart(nums) {
    var g = gcfA(nums), L = lcmA(nums), s = sortN(nums), m = s[0], ds = nt.divisors(m).reverse(), shown = [];
    for (var i = 0; i < ds.length; i++) { shown.push(ds[i]); if (ds[i] === g) break; }
    var p = P.number('GCF of ' + nlist(nums), g, gcfDiag(nums),
      nums.map(facEq).join(', ') + '.<br>Shared primes, lowest power: ' + t('\\text{GCF}=' + K.fac(g) + (nt.isPrime(g) ? '' : '=' + g)) + '.<br>(Or: the factors of ' + t(m) + ', largest first, are ' + t(shown.join(',\\ ')) + '; the first that also divides ' + t(s[1]) + ' is ' + t(g) + '.)',
      ['List the factors of ' + t(m) + ', largest first, and find the first one that divides ' + t(s[1]) + '.', 'Or use prime factors: shared primes, lowest power.'], 'GCF of ' + nums.join(', '), { before: t('\\text{GCF}=') });
    p.bad = [L, prodOf(nums)].filter(function (x) { return x !== g; }).map(String);
    return p;
  }
  function lcmPart(nums) {
    var g = gcfA(nums), L = lcmA(nums), M = Math.max.apply(null, nums), ms = [];
    for (var i = 1; i <= L / M; i++) ms.push(M * i);
    var p = P.number('LCM of ' + nlist(nums), L, lcmDiag(nums),
      'Multiples of ' + t(M) + ': ' + t(ms.join(',\\ ')) + '. The first one that ' + t(Math.min.apply(null, nums)) + ' also divides is ' + t(L) + '.<br>(With primes: ' + nums.map(facEq).join(', ') + '; every prime, highest power: ' + t(K.fac(L) + '=' + L) + '.)',
      ['List the multiples of ' + t(M) + ' until you reach one that ' + t(Math.min.apply(null, nums)) + ' divides into.'], 'LCM of ' + nums.join(', '), { before: t('\\text{LCM}=') });
    p.bad = [g, prodOf(nums)].filter(function (x) { return x !== L; }).map(String);
    return p;
  }
})(window);
