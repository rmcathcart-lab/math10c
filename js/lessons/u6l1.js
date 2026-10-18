/* Math 10C · Unit 6 · Lesson 1 — Extension: Measuring the Length of a Line Segment (outcome EXT on every part)
 * Assignment questions 1–11 (u6_L01.tex) and the Lesson 1 Extra Practice (u6_EP01.tex, questions 1–17).
 * Every part is a generator that keeps the idea and difficulty of the booklet question (the booklet's numbers are one
 * of the possible versions where they fit a phone-sized grid). Horizontal/vertical lengths by subtraction, diagonal
 * lengths by the Pythagorean theorem (exact simplest radical + rounded decimal), areas/perimeters from coordinates,
 * and working backwards from a length. Levels: LIM BEG EMG PRG ADV MAS. */
(function (root) {
  'use strict';
  var HW = root.HW, K = HW.kit, ex = HW.ex, F = HW.fmt, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form;

  /* ---------- keypads (namespaced): radicals with + for sums, and a point keypad with a root key ---------- */
  var RADK = 'u6l1rad', PTK = 'u6l1pt', Wd = HW.widgets;
  if (Wd && Wd.KEYSETS) {
    var dk = function (n) { return { label: String(n), tex: String(n), plain: String(n) }; };
    var KY = { del: { label: '⌫', fn: 'del', title: 'Delete' }, clear: { label: 'clear', fn: 'clear' }, left: { label: '◀', fn: 'left', title: 'Move left' },
      right: { label: '▶', fn: 'right', title: 'Move right (out of a box)' }, enter: { label: 'Check ↵', fn: 'enter', wide: true },
      sqrt: { label: '√', tex: '\\sqrt{#0}', plain: 'sqrt(', title: 'Square root' }, plus: { label: '+', tex: '+', plain: '+' }, minus: { label: '−', tex: '-', plain: '-' },
      dot: { label: '.', tex: '.', plain: '.' }, frac: { label: '<sup>a</sup>⁄<sub>b</sub>', tex: '\\frac{#@}{#?}', plain: '/', title: 'Fraction' },
      par: { label: '( )', tex: '\\left(#0\\right)', plain: '(', title: 'Ordered pair: type x, y inside' }, comma: { label: ',', tex: ',', plain: ', ' } };
    if (!Wd.KEYSETS[RADK]) Wd.KEYSETS[RADK] = [[dk(7), dk(8), dk(9), KY.sqrt, KY.plus, KY.del], [dk(4), dk(5), dk(6), KY.frac, KY.minus, KY.clear], [dk(1), dk(2), dk(3), KY.dot, KY.left, KY.right], [dk(0), KY.enter]];
    if (!Wd.KEYSETS[PTK]) Wd.KEYSETS[PTK] = [[dk(7), dk(8), dk(9), KY.par, KY.del], [dk(4), dk(5), dk(6), KY.sqrt, KY.clear], [dk(1), dk(2), dk(3), KY.minus, KY.left, KY.right], [dk(0), KY.dot, KY.comma, KY.frac, KY.enter]];
    if (Wd.KEYHELP) {
      if (!Wd.KEYHELP[RADK]) Wd.KEYHELP[RADK] = ['Type the number in front first, then <b>√</b>, e.g. 2 then √ then 17 for ' + HW.k('2\\sqrt{17}') + '. Press <b>▶</b> to step out of the root. Decimals use <b>.</b>', 'Type roots as <code>2sqrt(17)</code>; a sum as <code>sqrt(5) + sqrt(218)</code>; a decimal as <code>8.25</code>.'];
      if (!Wd.KEYHELP[PTK]) Wd.KEYHELP[PTK] = ['Press <b>( )</b>, type the two coordinates with <b>,</b> between them. Use <b>√</b> for an exact root and <b>▶</b> to step out of it.', 'Type a point as <code>(3, -2)</code> or <code>(7sqrt(2), 7sqrt(2))</code>.'];
    }
  }
  HW.addCodes({
    'neg-length': 'Gave a negative length', 'same-coord': 'Subtracted the coordinates that are equal', 'neg-sub': 'Subtracting a negative (should add)', added: 'Added coordinates instead of subtracting',
    count: 'Run/rise off by one (counted lines, not spaces)', 'no-root': 'Forgot the square root (gave a² + b²)', 'add-legs': 'Added the legs instead of using the Pythagorean theorem',
    'no-square': 'Didn’t square the legs', 'sub-squares': 'Subtracted the squares', 'abs-bars': 'Left absolute-value bars that aren’t needed', 'no-half': 'Forgot the ½ in the triangle area',
    'height-sign': 'Height across the axis (subtracting a negative)', 'pt-form': 'Point not written as (x, y)', 'pt-x': 'Wrong x-coordinate', 'pt-y': 'Wrong y-coordinate', pt: 'Wrong point',
    'diff-order': 'Subtracted in the other order', scale: 'Ignored the grid scale', 'half-dist': 'Halved the distance instead of dividing by √2', 'full-diag': 'Used the whole diagonal',
    'side-not-diag': 'Used a side of the square instead of the diagonal', bases: 'Gave the wrong base', straight: 'Used the straight distance instead of the route', 'perim-side': 'Left a side out of the perimeter',
    'one-sol': 'Found only one of the two answers', 'shift-sign': 'Moved the wrong way from the known coordinate', 'no-sq-first': 'Rounded/compared before squaring', 'not-collected': 'Like radicals not collected',
    'add-whole': 'Whole numbers not added', 'round-first': 'Rounded before adding', 'mid-area': 'Used the wrong height', 'diag-side': 'Used the diagonal as the side'
  });

  /* ---------- number helpers ---------- */
  function near(a, b, e) { return Math.abs(a - b) < (e == null ? 1e-7 : e); }
  function isSq(n) { var q = Math.round(Math.sqrt(n)); return q * q === n; }
  function simp(N) { var k = 1, m = N; for (var f = 2; f * f <= m; f++) while (m % (f * f) === 0) { m /= f * f; k *= f; } return { k: k, m: m }; }
  function rt(N) { var s = simp(N); return s.m === 1 ? String(s.k) : (s.k === 1 ? '' : s.k) + '\\sqrt{' + s.m + '}'; }
  function rtSteps(N) { var s = simp(N); if (s.m === 1) return '\\sqrt{' + F(N) + '}=' + s.k; if (s.k === 1) return '\\sqrt{' + N + '}'; return '\\sqrt{' + N + '}=\\sqrt{' + (s.k * s.k) + '\\times ' + s.m + '}=' + s.k + '\\sqrt{' + s.m + '}'; }
  function dec(x, dp) { return K.roundTo(x, dp).toFixed(dp); }
  function P2(p) { return '(' + F(p[0]) + ',\\ ' + F(p[1]) + ')'; }
  function pr(v) { return v < 0 ? '(' + F(v) + ')' : F(v); }
  function sub(a, b) { return F(a) + '-' + pr(b); }
  function lin(v, k) { return k === 0 ? v : v + (k > 0 ? '+' + k : '-' + (-k)); }
  function mn(v, c) { return c === 0 ? v : c < 0 ? v + '+' + (-c) : v + '-' + c; }
  function sgn(r) { return r.chance(0.5) ? 1 : -1; }
  function legPairs(lo, hi, test) { var out = []; for (var a = lo; a <= hi; a++) for (var b = lo; b <= hi; b++) if (test(a * a + b * b, a, b)) out.push([a, b]); return out; }
  function hasSqF(N) { var s = simp(N); return s.m > 1 && s.k > 1; }
  function sqFree(N) { return simp(N).k === 1 && N > 1; }
  function d2(A, B) { return (B[0] - A[0]) * (B[0] - A[0]) + (B[1] - A[1]) * (B[1] - A[1]); }
  var TRIPLES = [[3, 4], [4, 3], [6, 8], [8, 6], [5, 12], [12, 5], [9, 12], [12, 9], [8, 15], [15, 8]];

  /* ---------- distance solutions ---------- */
  function runRise(A, B) { return [Math.abs(B[0] - A[0]), Math.abs(B[1] - A[1])]; }
  function distSol(name, A, B, dp) {
    var rr = runRise(A, B), N = rr[0] * rr[0] + rr[1] * rr[1];
    return 'Run ' + t('=|' + sub(B[0], A[0]) + '|=' + rr[0]) + ', rise ' + t('=|' + sub(B[1], A[1]) + '|=' + rr[1]) + '.<br>' +
      t(name + '=\\sqrt{' + rr[0] + '^{2}+' + rr[1] + '^{2}}=\\sqrt{' + rr[0] * rr[0] + '+' + rr[1] * rr[1] + '}=' + rtSteps(N) + (dp ? '\\approx ' + dec(Math.sqrt(N), dp) : '')) + ' units' +
      (simp(N).m === 1 ? ' (' + t(F(N)) + ' is a perfect square).' : simp(N).k === 1 ? ' (' + t(N) + ' has no perfect-square factor, so ' + t('\\sqrt{' + N + '}') + ' is already simplest).' : '.');
  }
  function legTex(name, A, B) { // one leg of a route: a subtraction when horizontal/vertical, else Pythagoras
    var rr = runRise(A, B), i = rr[0] === 0 ? 1 : rr[1] === 0 ? 0 : -1;
    if (i >= 0) return t(name + '=|' + sub(B[i], A[i]) + '|=' + rr[i]);
    return t(name + '=\\sqrt{' + rr[0] + '^{2}+' + rr[1] + '^{2}}=' + rtSteps(rr[0] * rr[0] + rr[1] * rr[1]));
  }
  function legSol(name, a, b, dp) {
    var N = a * a + b * b;
    return t(name + '=\\sqrt{' + a + '^{2}+' + b + '^{2}}=\\sqrt{' + a * a + '+' + b * b + '}=' + rtSteps(N) + (dp ? '\\approx ' + dec(Math.sqrt(N), dp) : '')) + ' units';
  }

  /* ---------- checkers ---------- */
  function legDiag(N, legs, extra, tol) {
    var a = Math.abs(legs[0]), b = Math.abs(legs[1]);
    return function (v) {
      if (!isFinite(v)) return null;
      if (extra) { var h0 = extra(v, tol); if (h0) return h0; }
      if (N > 1 && near(v, N, tol)) return { code: 'no-root', hint: t(a + '^{2}+' + b + '^{2}=' + N) + ' is the <b>square</b> of the length. Take its square root to finish.' };
      if (near(v, a + b, tol)) return { code: 'add-legs', hint: 'You added the run and the rise. The segment is the hypotenuse of a right triangle, so its length is ' + t('\\sqrt{a^{2}+b^{2}}') + ', which is less than ' + t('a+b') + '.' };
      if (near(v, Math.sqrt(a + b), tol)) return { code: 'no-square', hint: 'Square the run and the rise <b>before</b> you add them: ' + t('c=\\sqrt{a^{2}+b^{2}}') + '.' };
      if (a !== b && near(v, Math.sqrt(Math.abs(a * a - b * b)), tol)) return { code: 'sub-squares', hint: 'The segment is the hypotenuse, so <b>add</b> the two squares: ' + t('c^{2}=a^{2}+b^{2}') + '.' };
      var offs = [[a + 1, b], [a - 1, b], [a, b + 1], [a, b - 1]];
      for (var i = 0; i < offs.length; i++) if (offs[i][0] >= 0 && offs[i][1] >= 0 && near(v, Math.hypot(offs[i][0], offs[i][1]), tol)) return { code: 'count', hint: 'Check your run and rise: count the grid <b>spaces</b> between the endpoints (or subtract their coordinates), not the grid lines.' };
      return null;
    };
  }
  /* the exact length √N in simplest form (a whole number when N is a perfect square) */
  function exactLen(N, legs, extra) {
    var s = simp(N), dg = legs ? legDiag(N, legs, extra, 1e-6) : function (v) { return extra ? extra(v, 1e-6) : null; };
    if (s.m !== 1) return K.radical({ k: s.k, n: 2, m: s.m }, 'mixed', { diag: function (v) { return dg(v); } });
    return function (resp) {
      var a = K.read(resp); if (a.res) return a.res;
      var sh = ex.shape(a.ast);
      if (near(a.val, s.k, 1e-9)) return (sh.roots || sh.ops || sh.muls || sh.divs || sh.pow) ? form('simplify', 'Right value — ' + t(F(N)) + ' is a perfect square, so simplify it all the way to a whole number.') : ok();
      var h = dg(a.val); if (h) return wrong(h.code, h.hint);
      if (near(a.val, -s.k)) return wrong('neg-length', 'A length can’t be negative.');
      return wrong('value', null);
    };
  }
  function approxLen(N, dp, legs, extra) {
    var tol = dp === 1 ? 0.051 : 0.0051;
    return K.approx(Math.sqrt(N), dp, { diag: legs ? legDiag(N, legs, extra, tol) : (extra ? function (v) { return extra(v, tol); } : null) });
  }
  /* an exact total: a whole number or a sum of simplified radicals (like radicals collected, whole numbers added) */
  function topTerms(s) { var out = [], depth = 0, cur = ''; for (var i = 0; i < s.length; i++) { var c = s[i]; if (c === '{' || c === '(') depth++; if (c === '}' || c === ')') depth--; if (c === '+' && depth === 0) { out.push(cur); cur = ''; } else cur += c; } out.push(cur); return out.map(function (x) { return x.trim(); }).filter(Boolean); }
  function sumChk(val, diag) {
    return function (resp) {
      var a = K.read(resp); if (a.res) return a.res;
      var sh = ex.shape(a.ast), s = String(resp).replace(/\\left|\\right/g, '');
      if (near(a.val, val, 1e-7)) {
        if (sh.decimals) return form('decimal', 'Right value, but give the <b>exact</b> value — keep the radicals (use the √ key), no decimals.');
        var re = /\\sqrt\{(\d+)\}|sqrt\((\d+)\)/g, m, seen = {}, ints = 0;
        while ((m = re.exec(s))) { var R = +(m[1] || m[2]); if (simp(R).k > 1) return form('not-simplest', 'Right value — now simplify ' + t('\\sqrt{' + R + '}') + ': ' + t(R) + ' has a perfect-square factor.'); if (seen[R]) return form('not-collected', 'Right value — now collect the like radicals (the terms with the same ' + t('\\sqrt{' + R + '}') + ').'); seen[R] = 1; }
        topTerms(s).forEach(function (x) { if (/^\d+(\.\d+)?$/.test(x)) ints++; });
        if (ints > 1) return form('add-whole', 'Right value — now add the whole numbers together.');
        if (!sh.roots && (sh.muls || sh.divs || sh.pow)) return form('simplify', 'Right value — now simplify it to a single number.');
        return ok();
      }
      if (sh.decimals && !sh.roots && near(a.val, val, 0.06)) return form('decimal', 'That’s a decimal approximation. Give the <b>exact</b> value — keep the radicals (use the √ key).');
      var h = diag ? diag(a.val) : null; if (h) return wrong(h.code, h.hint);
      return wrong('value', null);
    };
  }
  /* one point "(x, y)" — each coordinate may be checked by its own checker */
  function splitPt(resp) {
    var s = String(resp == null ? '' : resp).replace(/\\left|\\right/g, '').replace(/\\[,;:! ]/g, ' ').replace(/\\lbrace|\\rbrace|\\\{|\\\}/g, '').trim();
    if (s.charAt(0) === '{' && s.charAt(s.length - 1) === '}') s = s.slice(1, -1).trim();
    if (!s) return { empty: true };
    var m = /^\((.*)\)$/.exec(s); if (!m) return { bad: true };
    var body = m[1], depth = 0, cut = -1;
    for (var i = 0; i < body.length; i++) { var c = body[i]; if (c === '{' || c === '(' || c === '[') depth++; else if (c === '}' || c === ')' || c === ']') depth--; else if (c === ',' && depth === 0) { if (cut >= 0) return { bad: true }; cut = i; } }
    if (cut < 0) return { bad: true };
    return { x: body.slice(0, cut).trim(), y: body.slice(cut + 1).trim() };
  }
  function valOf(s) { var p = ex.parse(s); return p.ok ? ex.value(p.ast) : NaN; }
  function ptChk(T, opt) {
    opt = opt || {};
    var cx = opt.chk ? opt.chk[0] : K.value(T[0]), cy = opt.chk ? opt.chk[1] : K.value(T[1]);
    return function (resp) {
      var S = splitPt(resp);
      if (S.empty) return form('empty', 'Type the point first.');
      if (S.bad || !S.x || !S.y) return form('pt-form', 'Write one ordered pair in brackets, ' + t('(x,\\ y)') + ': press <b>( )</b> and type the two coordinates with a comma between them.');
      var rx = cx(S.x), ry = cy(S.y);
      if (rx.v === 'correct' && ry.v === 'correct') return ok();
      if (rx.v !== 'wrong' && ry.v !== 'wrong') return rx.v === 'form' ? rx : ry;
      var vx = valOf(S.x), vy = valOf(S.y);
      if (opt.diag) { var h = opt.diag([vx, vy]); if (h) return wrong(h.code || 'pt', h.hint); }
      if (near(vx, T[1], 1e-6) && near(vy, T[0], 1e-6) && !near(T[0], T[1])) return wrong('pairs-flip', 'You swapped the coordinates: an ordered pair is ' + t('(x,\\ y)') + ' — the across value first, then the up/down value.');
      if (rx.v === 'wrong' && rx.hint && rx.code !== 'value') return wrong(rx.code, rx.hint);
      if (ry.v === 'wrong' && ry.hint && ry.code !== 'value') return wrong(ry.code, ry.hint);
      if (rx.v === 'correct') return wrong('pt-y', 'Your ' + t('x') + '-coordinate is right — check the ' + t('y') + '-coordinate.');
      if (ry.v === 'correct') return wrong('pt-x', 'Your ' + t('y') + '-coordinate is right — check the ' + t('x') + '-coordinate.');
      return wrong('pt', null);
    };
  }
  function ptField(name) { return { label: t(name) + ':', name: name, mode: 'math', keys: PTK, placeholder: 'e.g. (3, -2)' }; }
  function radField(label, name) { return { label: label, name: name, mode: 'math', keys: RADK, placeholder: 'e.g. 2sqrt(17) or 8.25' }; }
  function numField(label, name, after) { return { label: label, name: name, after: after }; }
  /* several ordered pairs in any order, with extra diagnoses for whole wrong sets */
  function pairsChk(target, alts) {
    var base = K.pairs(target);
    return function (resp) {
      var r = base(resp); if (r.v !== 'wrong') return r;
      for (var i = 0; i < (alts || []).length; i++) if (K.pairs(alts[i].is)(resp).v === 'correct') return wrong(alts[i].code, alts[i].hint);
      return r;
    };
  }
  function pairsPart(prompt, target, alts, sol, hints, text) {
    alts = (alts || []).filter(function (a) { return K.pairs(target)('\\{' + a.is.map(function (q) { return '(' + q[0] + ', ' + q[1] + ')'; }).join(', ') + '\\}').v !== 'correct'; });
    var p = K.P.pairs(prompt, target, {}, sol, hints, text); p.check = pairsChk(target, alts); p.bad = (alts || []).map(function (a) { return '\\{' + a.is.map(function (q) { return '(' + q[0] + ', ' + q[1] + ')'; }).join(', ') + '\\}'; }).concat(['(' + target[0][0] + ', ' + target[0][1] + ')']); return p;
  }

  /* ---------- figures ---------- */
  function fig(win, segs, pts, opt) {
    opt = opt || {};
    var g = { x: win.x, y: win.y, grid: win.grid || 1, labels: win.labels || 2, max: opt.max || 360, segs: [], points: [] };
    (segs || []).forEach(function (s) { g.segs.push({ pts: s, start: 'none', end: 'none' }); });
    (pts || []).forEach(function (p) { g.points.push({ x: p[0], y: p[1], label: p[2] }); });
    return '<div class="fig">' + HW.graph(g) + '</div>';
  }
  function segD(p, a, b) { var dx = b[0] - a[0], dy = b[1] - a[1], L = dx * dx + dy * dy, u = L ? ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L : 0; u = Math.max(0, Math.min(1, u)); return Math.hypot(p[0] - a[0] - u * dx, p[1] - a[1] - u * dy); }
  function crosses(a, b, c, d) { function o(p, q, s) { return Math.sign((q[0] - p[0]) * (s[1] - p[1]) - (q[1] - p[1]) * (s[0] - p[0])); } return o(a, b, c) * o(a, b, d) < 0 && o(c, d, a) * o(c, d, b) < 0; }
  function apart(a, b, c, d, gap) { return !crosses(a, b, c, d) && Math.min(segD(a, c, d), segD(b, c, d), segD(c, a, b), segD(d, a, b)) >= gap; }
  /* place segments with the given (run, rise) vectors inside win (1 unit from the edges), apart from each other */
  function place(r, vecs, win, avoid, gap, strictOnly) {
    avoid = avoid || [0, -1]; gap = gap || 1.4;
    function vals(lo, hi, d, strict) { var out = []; for (var a = lo; a <= hi; a++) if (a + d >= lo && a + d <= hi && (!strict || (avoid.indexOf(a) < 0 && avoid.indexOf(a + d) < 0))) out.push(a); return out; }
    for (var tr = 0; tr < (strictOnly ? 400 : 300); tr++) {
      var out = [], good = true, strict = !!strictOnly;
      for (var i = 0; i < vecs.length && good; i++) {
        var v = vecs[i], xs = vals(win.x[0] + 1, win.x[1] - 1, v[0], strict), ys = vals(win.y[0] + 1, win.y[1] - 1, v[1], strict);
        if (!xs.length || !ys.length) { good = false; break; }
        var A = [r.pick(xs), r.pick(ys)], B = [A[0] + v[0], A[1] + v[1]];
        for (var j = 0; j < out.length; j++) if (!apart(A, B, out[j][0], out[j][1], strict ? gap : 0.9)) { good = false; break; }
        out.push([A, B]);
      }
      if (good) return out;
    }
    return null;
  }
  function vecOf(r, ab, flip) { var v = flip && r.chance(0.5) ? [ab[1], ab[0]] : [ab[0], ab[1]]; return [sgn(r) * v[0], sgn(r) * v[1]]; }
  function padWin(pts, extra) { // a pad window around the points, including the origin, ≤ 14 steps each way
    var xs = pts.map(function (p) { return p[0]; }).concat([0]), ys = pts.map(function (p) { return p[1]; }).concat([0]), e = extra == null ? 1 : extra;
    return { x: [Math.min.apply(null, xs) - e, Math.max.apply(null, xs) + e], y: [Math.min.apply(null, ys) - e, Math.max.apply(null, ys) + e] };
  }

  /* ---------- part makers ---------- */
  /* length of a horizontal or vertical segment from its coordinates */
  function hvLen(la, A, lb, B) {
    var hor = A[1] === B[1], i = hor ? 0 : 1, c = hor ? 'x' : 'y', o = hor ? 'y' : 'x', L = Math.abs(B[i] - A[i]);
    var hi = Math.max(A[i], B[i]), lo = Math.min(A[i], B[i]), axis = hor ? t('y') : t('x');
    var diag = function (v) {
      if (v === -L) return { code: 'neg-length', hint: 'A length can’t be negative. Take the <b>positive</b> difference, ' + t('|' + c + '_2-' + c + '_1|') + '.' };
      if (v === 0) return { code: 'same-coord', hint: 'Both endpoints have ' + t(o + '=' + F(A[1 - i])) + ' — that’s what makes the segment ' + (hor ? 'horizontal' : 'vertical') + '. Subtract the coordinates that <b>change</b>.' };
      if (lo < 0 && hi > 0 && v === Math.abs(hi + lo)) return { code: 'neg-sub', hint: 'The endpoints are on opposite sides of the ' + axis + '-axis. Subtracting a negative <b>adds</b>: ' + t(F(hi) + '-' + pr(lo) + '=' + F(hi) + '+' + F(-lo)) + '.' };
      if (((lo > 0 && hi > 0) || (lo < 0 && hi < 0)) && v === Math.abs(hi) + Math.abs(lo)) return { code: 'added', hint: 'Both endpoints are on the same side of the ' + axis + '-axis, so the distance between them is a <b>difference</b> of the coordinates, not a sum.' };
      if (v === L + 1 || v === L - 1) return { code: 'count', hint: 'You’re off by one. The length is the number of <b>spaces</b> between the endpoints: ' + t('|' + c + '_2-' + c + '_1|') + '.' };
      return null;
    };
    var p = K.P.number(t(la + P2(A)) + ' to ' + t(lb + P2(B)), L, diag,
      'Both endpoints have the same ' + t(o) + '-coordinate, ' + t(F(A[1 - i])) + ', so the segment is <b>' + (hor ? 'horizontal' : 'vertical') + '</b>.<br>Length ' + t('=|' + sub(B[i], A[i]) + '|=|' + F(B[i] - A[i]) + '|=' + F(L)) + ' units.',
      ['Which coordinate is the same for both endpoints? Subtract the <b>other</b> coordinates.', 'A length is never negative: take the positive difference.'], 'length ' + la + lb + ' ' + P2(A) + ' ' + P2(B), { after: 'units' });
    p.bad = [String(-L), String(L + 1)];
    return p;
  }
  /* exact + decimal length of a segment from coordinates (shown or on a grid) */
  function lenPart(prompt, name, A, B, dp, extra, text) {
    var rr = runRise(A, B), N = rr[0] * rr[0] + rr[1] * rr[1];
    var fields = [radField('(i) Exact:', name + ' exact'), radField('(ii) ≈', name + ' to the nearest ' + (dp === 1 ? 'tenth' : 'hundredth'))];
    fields[0].after = 'units'; fields[1].after = 'units';
    var p = K.P.fields(prompt, fields, [exactLen(N, rr, extra), approxLen(N, dp, rr, extra)], [rt(N), dec(Math.sqrt(N), dp)],
      t(name + '=' + rt(N) + '\\approx ' + dec(Math.sqrt(N), dp)) + ' units', distSol(name, A, B, dp),
      ['Build a right triangle: the run (horizontal leg) and the rise (vertical leg) are the legs, and the segment is the hypotenuse.', 'Then ' + t('c=\\sqrt{a^{2}+b^{2}}') + '. Simplify the radical (look for a perfect-square factor), then round.'], text || 'length ' + name);
    p.bad = [[String(N), dec(N, dp)], [String(rr[0] + rr[1]), dec(rr[0] + rr[1], dp)]];
    return p;
  }
  function lenField(name, N) { return radField(t(name) + ':', name); }
  /* exact-only lengths of several sides: sides = [[name, A, B], …] */
  function sidesPart(prompt, sides, text) {
    var fields = [], chks = [], keys = [], sol = [];
    sides.forEach(function (s) { var rr = runRise(s[1], s[2]), N = rr[0] * rr[0] + rr[1] * rr[1]; fields.push(lenField(s[0], N)); chks.push(exactLen(N, rr)); keys.push(rt(N)); sol.push(distSol(s[0], s[1], s[2])); });
    var p = K.P.fields(prompt, fields, chks, keys, sides.map(function (s, i) { return t(s[0] + '=' + keys[i]); }).join(', '), sol.join('<br>'),
      ['For each side: run = difference of the ' + t('x') + '-coordinates, rise = difference of the ' + t('y') + '-coordinates, then ' + t('\\sqrt{\\text{run}^{2}+\\text{rise}^{2}}') + '.', 'Write each length in simplest radical form.'], text);
    p.bad = [sides.map(function (s) { var rr = runRise(s[1], s[2]); return String(rr[0] + rr[1]); })];
    return p;
  }
  function sideN(A, B) { return d2(A, B); }
  function mcP(r, prompt, opts, sol, hints, text, keepOrder) { return K.P.mc(r, prompt, opts, sol, hints, text, keepOrder); }

  /* ---------- question-specific generators ---------- */
  var K2 = legPairs(1, 12, function (N) { return simp(N).m > 1 && simp(N).k === 2; });
  var SF = legPairs(1, 12, function (N) { return sqFree(N); });
  var K3 = legPairs(1, 12, function (N) { return simp(N).m > 1 && simp(N).k >= 3; });
  var SQ = legPairs(3, 7, function (N) { return hasSqF(N); });
  function within(list, aLo, aHi, bLo, bHi) { return list.filter(function (p) { return p[0] >= aLo && p[0] <= aHi && p[1] >= bLo && p[1] <= bHi; }); }

  /* Q3: segments written with variables */
  function q3Shared(r) {
    var L1 = r.pick([['p', 'q'], ['a', 'b'], ['m', 'n'], ['h', 'k']]), L2 = r.pick([['m', 'n'], ['p', 'q'], ['u', 'v'], ['a', 'b']]);
    var L3 = r.pick([['a', 'b', 'c'], ['p', 'q', 'r'], ['u', 'v', 'w'], ['g', 'h', 'k']]), L4 = r.pick([['s', 't', 'z'], ['j', 'k', 'm'], ['b', 'd', 'f'], ['r', 'u', 'w']]);
    var segs = {};
    var a = { hor: r.chance(0.6), v: L1, k: r.int(2, 15), rev: r.chance(0.25) };
    a.P = a.hor ? ['A(' + a.v[0] + ',\\,' + a.v[1] + ')', 'B(' + lin(a.v[0], a.rev ? -a.k : a.k) + ',\\,' + a.v[1] + ')'] : ['A(' + a.v[0] + ',\\,' + a.v[1] + ')', 'B(' + a.v[0] + ',\\,' + lin(a.v[1], a.rev ? -a.k : a.k) + ')'];
    a.L = a.k; segs.a = a;
    var b = { hor: r.chance(0.4), v: L2, s: r.pick([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]), b: r.int(1, 9), c: r.int(2, 12) };
    b.P = b.hor ? ['C(' + lin(b.v[0], -b.b) + ',\\,' + lin(b.v[1], b.s) + ')', 'D(' + lin(b.v[0], b.c) + ',\\,' + lin(b.v[1], b.s) + ')'] : ['C(' + lin(b.v[0], b.s) + ',\\,' + lin(b.v[1], -b.b) + ')', 'D(' + lin(b.v[0], b.s) + ',\\,' + lin(b.v[1], b.c) + ')'];
    b.L = b.b + b.c; segs.b = b;
    var c = { hor: r.chance(0.6), v: L3, gt: r.chance(0.6) };
    c.P = c.hor ? ['J(' + c.v[0] + ',\\,' + c.v[1] + ')', 'K(' + c.v[2] + ',\\,' + c.v[1] + ')'] : ['J(' + c.v[1] + ',\\,' + c.v[0] + ')', 'K(' + c.v[1] + ',\\,' + c.v[2] + ')'];
    c.ch = c.v[0]; c.cond = c.gt ? c.v[0] + '>' + c.v[2] : c.v[0] + '<' + c.v[2]; c.big = c.gt ? c.v[0] : c.v[2]; c.small = c.gt ? c.v[2] : c.v[0]; segs.c = c;
    var d = { hor: r.chance(0.4), v: L4, gt: r.chance(0.6) };
    d.P = d.hor ? ['M(' + d.v[1] + ',\\,' + d.v[0] + ')', 'N(' + d.v[2] + ',\\,' + d.v[0] + ')'] : ['M(' + d.v[0] + ',\\,' + d.v[1] + ')', 'N(' + d.v[0] + ',\\,' + d.v[2] + ')'];
    d.ch = d.v[1]; d.cond = d.gt ? d.v[1] + '>' + d.v[2] : d.v[1] + '<' + d.v[2]; d.big = d.gt ? d.v[1] : d.v[2]; d.small = d.gt ? d.v[2] : d.v[1]; segs.d = d;
    return segs;
  }
  function segTex(s) { return t(s.P[0]) + ' to ' + t(s.P[1]) + (s.cond ? ', where ' + t(s.cond) : ''); }
  function varLenPart(s, letter) {
    var target = s.big + '-' + s.small, neg = s.small + '-' + s.big, c = s.hor ? 'x' : 'y', o = s.hor ? 'y' : 'x';
    var base = K.poly(target, { wrong: [{ is: neg, code: 'neg-length', hint: 'Since ' + t(s.cond) + ', ' + t(neg) + ' is <b>negative</b> — and a length can’t be negative. Subtract the other way.' }],
      diag: function (S) { if (HW.poly.isZero(S)) return { code: 'same-coord', hint: 'You subtracted the coordinates that are the same. Subtract the ' + t(c) + '-coordinates, the ones that change.' }; return null; } });
    var negChk = K.poly(neg);
    var chk = function (resp) {
      var s0 = String(resp == null ? '' : resp).replace(/\\left|\\right/g, '').trim();
      var m = /^(?:\||\\vert|\\lvert|\\mid)\s*(.*?)\s*(?:\||\\vert|\\rvert|\\mid)$/.exec(s0);
      if (m && (base(m[1]).v === 'correct' || negChk(m[1]).v === 'correct')) return form('abs-bars', 'Right — and because ' + t(s.cond) + ', you know the sign of the difference. Write the length <b>without</b> the absolute-value bars.');
      return base(resp);
    };
    var vs = s.v.slice().sort();
    return { prompt: 'Length of the segment from ' + segTex(s) + ':', input: { type: 'math', keys: 'poly', vars: vs, placeholder: 'e.g. a - c' }, check: chk, key: target, answer: t(target),
      solution: 'Both endpoints have the same ' + t(o) + '-coordinate, so the segment is ' + (s.hor ? 'horizontal' : 'vertical') + ' and its length is the difference of the ' + t(c) + '-coordinates: ' + t('|' + s.ch + '-' + s.v[2] + '|') + '.<br>Since ' + t(s.cond) + ', the difference ' + t(target) + ' is already positive, so the length is ' + t(target) + '.',
      hints: ['Subtract the coordinates that change. Which one is larger? The condition ' + t(s.cond) + ' tells you.', 'Larger minus smaller is positive — no bars needed.'], text: 'expression for length (' + letter + ')', bad: [neg, '0'], good: [s.big + '-' + s.small, '-' + s.small + '+' + s.big] };
  }

  /* Q4: triangle with a horizontal base */
  function q4Shared(r) {
    for (var i = 0; i < 200; i++) {
      var flip = r.chance(0.3), y0 = flip ? r.int(2, 5) : r.int(-5, -2), Ry = flip ? r.int(-5, -2) : r.int(3, 6);
      var Px = r.int(-5, -2), Qx = r.int(3, 7), Rx = r.int(Px + 1, Qx - 1), b = Qx - Px, h = Math.abs(Ry - y0);
      if ((b * h) % 2 || Rx === 0) continue;
      return { P: [Px, y0], Q: [Qx, y0], R: [Rx, Ry], b: b, h: h, A: b * h / 2 };
    }
    return { P: [-5, -4], Q: [7, -4], R: [2, 6], b: 12, h: 10, A: 60 };
  }
  /* Q5: three diagonal segments on a grid */
  var W5 = { x: [-7, 7], y: [-7, 9] };
  function q5Shared(r) {
    for (var i = 0; i < 50; i++) {
      var vs = [vecOf(r, r.pick(within(K2, 1, 4, 5, 10))), vecOf(r, r.pick(within(SF, 3, 6, 3, 7))), vecOf(r, r.pick([[3, 9], [3, 12], [4, 8], [4, 12], [5, 10]]))];
      var pl = place(r, vs, W5, null, null, i < 25); if (pl) return { segs: pl };
    }
    return { segs: [[[-6, -3], [-4, 5]], [[0, 4], [5, -2]], [[1, -5], [5, 7]]] };
  }
  function q5Stem(sh) {
    var L = [['A', 'B'], ['C', 'D'], ['E', 'F']], pts = [];
    sh.segs.forEach(function (s, i) { pts.push([s[0][0], s[0][1], L[i][0]], [s[1][0], s[1][1], L[i][1]]); });
    return 'Use the Pythagorean theorem to determine the length of each segment shown on the grid. Give each answer as <b>(i)</b> an exact value in simplest radical form, and <b>(ii)</b> a decimal to the nearest hundredth.' + fig(W5, sh.segs, pts);
  }
  /* Q6: segment AB on a grid */
  var W6 = { x: [-7, 7], y: [-7, 7] };
  function q6Shared(r) {
    for (var i = 0; i < 50; i++) {
      var ab = r.pick(within(K2.concat(SF), 1, 6, 2, 9).filter(function (p) { return p[0] !== p[1]; }));
      var v = [r.chance(0.7) ? ab[0] : -ab[0], r.chance(0.7) ? ab[1] : -ab[1]], pl = place(r, [v], W6, null, null, i < 25); if (pl) return { A: pl[0][0], B: pl[0][1] };
    }
    return { A: [-6, -3], B: [-4, 5] };
  }
  /* Q7: right triangle PQR with the right angle at Q */
  function q7Shared(r) {
    for (var i = 0; i < 300; i++) {
      var Qx = r.int(-5, -2), Qy = r.int(-12, -6), h = r.int(6, 12), v = r.int(5, 10), N = h * h + v * v;
      if (isSq(N) || !hasSqF(N)) continue;
      var P = [Qx, Qy + v], Q = [Qx, Qy], R = [Qx + h, Qy], w = padWin([P, Q, R]);
      if (w.x[1] - w.x[0] > 14 || w.y[1] - w.y[0] > 14 || P[1] > 0) continue;
      var per = h + v + Math.sqrt(N); if (Math.abs(per * 10 - Math.round(per * 10)) > 0.45) continue;
      return { P: P, Q: Q, R: R, h: h, v: v, N: N, win: w };
    }
    return { P: [-4, -2], Q: [-4, -12], R: [8, -12], h: 12, v: 10, N: 244, win: { x: [-5, 9], y: [-13, 1] } };
  }
  /* Q8: softball diamond */
  function q8Shared(r) {
    for (var i = 0; i < 100; i++) {
      var s = r.pick([16, 18, 20, 22, 24, 25]), D = s * Math.SQRT2, d = 2 * r.int(4, 10);
      if (d < 0.4 * D || d > 0.6 * D) continue;
      var th = D - d; if (Math.abs(th * 10 - Math.round(th * 10) - 0.5) < 0.05 || Math.abs(th * 10 - Math.round(th * 10)) > 0.45) continue;
      return { s: s, d: d };
    }
    return { s: 20, d: 14 };
  }
  function diamond(s, d) {
    var W = 210, H = 200, o = 30, sc = 130 / s, X = function (x) { return o + x * sc; }, Y = function (y) { return H - o - y * sc; }, k = d / Math.SQRT2;
    var g = '<rect width="' + W + '" height="' + H + '" fill="#fff"/>';
    g += '<line x1="' + X(0) + '" y1="' + Y(0) + '" x2="' + (X(s) + 34) + '" y2="' + Y(0) + '" stroke="#2b3340" stroke-width="1.4"/><line x1="' + X(0) + '" y1="' + Y(0) + '" x2="' + X(0) + '" y2="' + (Y(s) - 26) + '" stroke="#2b3340" stroke-width="1.4"/>';
    g += '<polygon points="' + [[0, 0], [s, 0], [s, s], [0, s]].map(function (p) { return X(p[0]) + ',' + Y(p[1]); }).join(' ') + '" fill="none" stroke="#13807a" stroke-width="2.2"/>';
    g += '<line x1="' + X(0) + '" y1="' + Y(0) + '" x2="' + X(s) + '" y2="' + Y(s) + '" stroke="#6a7182" stroke-width="1.4" stroke-dasharray="5 4"/>';
    [[0, 0], [s, 0], [s, s], [0, s], [k, k]].forEach(function (p) { g += '<circle cx="' + X(p[0]) + '" cy="' + Y(p[1]) + '" r="4" fill="#13807a"/>'; });
    var tx = function (x, y, s2, a) { return '<text x="' + x + '" y="' + y + '" font-size="12" fill="#2b3340" text-anchor="' + (a || 'start') + '">' + s2 + '</text>'; };
    g += tx(X(0) - 4, Y(0) + 15, 'home', 'middle') + tx(X(s), Y(0) + 15, '1st (' + s + ', 0)', 'middle') + tx(X(s), Y(s) - 8, '2nd', 'middle') + tx(X(0) + 5, Y(s) - 7, '3rd') + tx(X(k) + 7, Y(k) + 12, 'mound') + tx(X(s) + 5, Y(s / 2), s + ' m');
    g += '<text x="' + (X(s) + 36) + '" y="' + (Y(0) + 4) + '" font-size="13" font-style="italic" fill="#2b3340">x</text><text x="' + (X(0) - 4) + '" y="' + (Y(s) - 30) + '" font-size="13" font-style="italic" fill="#2b3340">y</text>';
    return '<div class="fig"><svg class="fig-svg" viewBox="0 0 ' + W + ' ' + H + '" width="100%" style="max-width:260px" role="img" aria-label="softball diamond">' + g + '</svg></div>';
  }
  /* Q11 / e17: right triangle with legs along the grid */
  function rightTri(r, legsList, intOnly) {
    for (var i = 0; i < 200; i++) {
      var lg = r.pick(legsList), v = lg[0], h = lg[1], px = r.int(-6, 8), py = r.int(-6, 10), qy = py + sgn(r) * v, rx = px + sgn(r) * h;
      var N = v * v + h * h, per = v + h + Math.sqrt(N);
      if (!intOnly && (isSq(N) || per >= 100 || Math.abs(per * 10 - Math.round(per * 10)) > 0.45)) continue;
      if (Math.max(Math.abs(qy), Math.abs(rx)) > 15) continue;
      return { P: [px, py], Q: [px, qy], R: [rx, py], v: v, h: h, N: N, per: per };
    }
    return { P: [5, 9], Q: [5, 1], R: [-2, 9], v: 8, h: 7, N: 113, per: 15 + Math.sqrt(113) };
  }

  /* ---------- extra-practice generators ---------- */
  var WE1 = { x: [-8, 8], y: [-6, 7] };
  function e1Shared(r) {
    for (var i = 0; i < 50; i++) {
      var sq = r.sample(SQ, 2), sf = r.pick(within(SF, 3, 6, 2, 6)), order = r.shuffle([0, 1, 2]), raw = [sq[0], sq[1], sf], vs = order.map(function (j) { return vecOf(r, raw[j], true); });
      if (raw[0][0] * raw[0][0] + raw[0][1] * raw[0][1] === raw[1][0] * raw[1][0] + raw[1][1] * raw[1][1]) continue;
      var pl = place(r, vs, WE1, null, null, i < 25); if (pl) return { segs: pl, sfIdx: order.indexOf(2) };
    }
    return { segs: [[[-7, -3], [-2, 2]], [[1, -5], [7, 1]], [[-4, 6], [1, 3]]], sfIdx: 2 };
  }
  var NAMES = [['A', 'B'], ['C', 'D'], ['E', 'F']];
  function e1Fig(sh) { var pts = []; sh.segs.forEach(function (s, i) { pts.push([s[0][0], s[0][1], NAMES[i][0]], [s[1][0], s[1][1], NAMES[i][1]]); }); return fig(WE1, sh.segs, pts); }
  var WE2 = { x: [-10, 10], y: [-8, 8], grid: 2, labels: 4 };
  function e2Shared(r) {
    var pool = legPairs(2, 6, function (N, a, b) { return sqFree(N) && a >= 3; });
    for (var i = 0; i < 50; i++) {
      var raw = r.sample(pool, 2); if (raw[0][0] * raw[0][0] + raw[0][1] * raw[0][1] === raw[1][0] * raw[1][0] + raw[1][1] * raw[1][1]) continue;
      var pl = place(r, raw.map(function (p) { return vecOf(r, p, false); }), { x: [-5, 5], y: [-4, 4] }, [0], 1, i < 25);
      if (pl) return { segs: pl.map(function (s) { return [[2 * s[0][0], 2 * s[0][1]], [2 * s[1][0], 2 * s[1][1]]]; }) };
    }
    return { segs: [[[-8, -2], [2, 4]], [[-6, 6], [6, -4]]] };
  }
  function e2Fig(sh) { return fig(WE2, sh.segs, [[sh.segs[0][0][0], sh.segs[0][0][1], 'P'], [sh.segs[0][1][0], sh.segs[0][1][1], 'Q'], [sh.segs[1][0][0], sh.segs[1][0][1], 'R'], [sh.segs[1][1][0], sh.segs[1][1][1], 'S']]); }
  function e3Shared(r) {
    var T = r.pick([[8, 6], [6, 8], [4, 3], [3, 4], [8, 6]]), h = T[0], v = T[1], c = Math.hypot(h, v);
    for (var i = 0; i < 100; i++) {
      var px = c === 10 ? r.int(-6, -3) : r.int(-5, -1), py = c === 10 ? r.int(-4, -2) : r.int(-4, -1);
      var P = [px, py], Q = [px + h, py], R = [px + h, py + v], S = [px, py + c];
      if (Q[0] === 0 || R[1] === 0) continue;
      var w = padWin([P, Q, R, S]); w.x[0] -= 1; if (w.x[1] - w.x[0] > 14 || w.y[1] - w.y[0] > 14) continue;
      return { P: P, Q: Q, R: R, S: S, h: h, v: v, c: c, win: w };
    }
    return { P: [-5, -3], Q: [3, -3], R: [3, 3], S: [-5, 7], h: 8, v: 6, c: 10, win: { x: [-7, 4], y: [-4, 8] } };
  }
  function e3Fig(sh, withS) {
    var g = { x: sh.win.x, y: sh.win.y, labels: 2, max: 330, segs: [{ pts: [sh.P, sh.Q, sh.R, sh.P], start: 'none', end: 'none' }], points: [{ x: sh.P[0], y: sh.P[1], label: 'P' }, { x: sh.Q[0], y: sh.Q[1], label: 'Q' }, { x: sh.R[0], y: sh.R[1], label: 'R' }] };
    if (withS) { g.points.push({ x: sh.S[0], y: sh.S[1], label: 'S' }); g.segs.push({ pts: [sh.P, sh.S, sh.R], start: 'none', end: 'none', dash: true }); }
    return '<div class="fig">' + HW.graph(g) + '</div>';
  }
  function randSeg(r, ab, lo, hi) {
    for (var i = 0; i < 100; i++) { var v = vecOf(r, ab, false), A = [r.int(lo, hi), r.int(lo, hi)], B = [A[0] + v[0], A[1] + v[1]]; if (B[0] >= lo && B[0] <= hi && B[1] >= lo && B[1] <= hi && A[0] !== B[0]) return [A, B]; }
    return [[0, 0], [ab[0], ab[1]]];
  }
  function e4Shared(r) {
    var k1 = r.int(4, 8), k2 = r.pick([3, 4, 5, 6, 7, 8].filter(function (k) { return k !== k1; }));
    var sqf = legPairs(2, 9, function (N, a, b) { return hasSqF(N) && a !== b; }), sfl = within(SF, 3, 8, 3, 8);
    var d = r.pick(sfl), f = r.pick(sfl.filter(function (p) { return p[0] * p[0] + p[1] * p[1] !== d[0] * d[0] + d[1] * d[1]; }));
    var types = [[k1, k1], r.pick(sqf), r.pick([[9, 12], [12, 9], [6, 8], [8, 6], [5, 12], [12, 5]]), d, [k2, k2], f];
    var L = [['A', 'B'], ['C', 'D'], ['E', 'F'], ['G', 'H'], ['J', 'K'], ['L', 'M']];
    return { segs: types.map(function (ab, i) { var s = randSeg(r, ab, -9, 9); return { A: s[0], B: s[1], n: L[i] }; }) };
  }
  function e5Seg(r, list) { var ab = r.pick(list); return randSeg(r, ab, -8, 12); }
  /* delivery robot: configurations whose two routes round to the same tenth (searched offline; relative to A) */
  var ROUTES = [[5, 12, 0, 12, -2, -1], [5, 12, 5, 0, -2, -1], [9, 12, 4, 0, 1, 8], [9, 12, 4, 0, 2, -1], [9, 12, 5, 12, 1, 8], [9, 12, 5, 12, 2, -1],
    [12, 5, 0, 5, -1, -2], [12, 5, 12, 0, -1, -2], [12, 9, 0, 4, -1, 2], [12, 9, 0, 4, 8, 1], [12, 9, 12, 5, -1, 2], [12, 9, 12, 5, 8, 1]];
  function e6Shared(r) {
    var c = r.pick(ROUTES), fx = sgn(r), fy = r.chance(0.25) ? -1 : 1;
    var rel = [[0, 0], [c[0], c[1]], [c[2], c[3]], [c[4], c[5]]].map(function (p) { return [fx * p[0], fy * p[1]]; });
    var xs = rel.map(function (p) { return p[0]; }), ys = rel.map(function (p) { return p[1]; });
    var ox = r.int(-8 - Math.min.apply(null, xs), 10 - Math.max.apply(null, xs)), oy = r.int(-8 - Math.min.apply(null, ys), 10 - Math.max.apply(null, ys));
    if (c[0] === 12 && c[1] === 9 && c[2] === 0 && c[3] === 4 && c[4] === -1 && c[5] === 2 && fx === 1 && fy === 1 && r.chance(0.4)) { ox = -4; oy = -3; }
    var A = [rel[0][0] + ox, rel[0][1] + oy], B = [rel[1][0] + ox, rel[1][1] + oy], P = [rel[2][0] + ox, rel[2][1] + oy], Q = [rel[3][0] + ox, rel[3][1] + oy];
    var ap = Math.sqrt(d2(A, P)), pb = Math.sqrt(d2(P, B)), m = d2(A, Q), n = d2(Q, B), R1 = ap + pb, R2 = Math.sqrt(m) + Math.sqrt(n);
    var swap = r.chance(0.35), hh = (R1 * R1 - m - n) / 2;
    return { A: A, B: B, P: P, Q: Q, ap: ap, pb: pb, m: m, n: n, R1: R1, R2: R2, h: hh, AB: Math.sqrt(d2(A, B)), intName: swap ? 'Route 2' : 'Route 1', radName: swap ? 'Route 1' : 'Route 2', swap: swap };
  }
  function e6Stem(sh) {
    var r1 = sh.swap ? 'A' + P2(sh.A) + '\\ \\to\\ Q' + P2(sh.Q) + '\\ \\to\\ B' + P2(sh.B) : 'A' + P2(sh.A) + '\\ \\to\\ P' + P2(sh.P) + '\\ \\to\\ B' + P2(sh.B);
    var r2 = sh.swap ? 'A' + P2(sh.A) + '\\ \\to\\ P' + P2(sh.P) + '\\ \\to\\ B' + P2(sh.B) : 'A' + P2(sh.A) + '\\ \\to\\ Q' + P2(sh.Q) + '\\ \\to\\ B' + P2(sh.B);
    return 'A delivery robot must travel from ' + t('A' + P2(sh.A)) + ' to ' + t('B' + P2(sh.B)) + ', but it cannot cut across the middle of the block, so it must stop at one waypoint on the way. Two routes are proposed.<br><b>Route 1:</b> ' + t(r1) + '<br><b>Route 2:</b> ' + t(r2);
  }
  function radSumTex(m, n) { return rt(m) + '+' + rt(n); }
  /* triangles and quadrilaterals with no horizontal or vertical side */
  function diagSide(A, B) { return A[0] !== B[0] && A[1] !== B[1]; }
  function e7Shared(r) {
    var iso = r.chance(0.35);
    for (var i = 0; i < 3000; i++) {
      var A, B, C;
      if (iso) {
        var u = [r.int(1, 7) * sgn(r), r.int(1, 7) * sgn(r)], vs = [[u[1], u[0]], [-u[1], u[0]], [u[1], -u[0]], [-u[1], -u[0]], [-u[0], u[1]], [u[0], -u[1]]];
        var vv = r.pick(vs); A = [r.int(-6, 6), r.int(-6, 6)]; B = [A[0] + u[0], A[1] + u[1]]; C = [A[0] + vv[0], A[1] + vv[1]];
        if (r.chance(0.5)) { var tmp = A; A = B; B = tmp; }
      } else { A = [r.int(-7, 7), r.int(-7, 7)]; B = [r.int(-7, 7), r.int(-7, 7)]; C = [r.int(-7, 7), r.int(-7, 7)]; }
      if ([A, B, C].some(function (p) { return Math.abs(p[0]) > 8 || Math.abs(p[1]) > 8; })) continue;
      if (!diagSide(A, B) || !diagSide(B, C) || !diagSide(C, A)) continue;
      var area = Math.abs((B[0] - A[0]) * (C[1] - A[1]) - (C[0] - A[0]) * (B[1] - A[1])); if (area < 20) continue;
      var s = [d2(A, B), d2(B, C), d2(C, A)], ls = s.map(Math.sqrt);
      if (s.some(function (x) { return x > 200; })) continue;
      var eq = (s[0] === s[1]) + (s[1] === s[2]) + (s[0] === s[2]);
      if (iso && eq !== 1) continue;
      if (!iso) { if (eq) continue; var srt = ls.slice().sort(function (a, b) { return a - b; }); if (!(srt[1] / srt[0] < 1.08 || srt[2] / srt[1] < 1.08)) continue; }
      if (s.filter(isSq).length > 1) continue;
      return { A: A, B: B, C: C, s: s, iso: iso };
    }
    return { A: [-4, -3], B: [2, 5], C: [6, -1], s: [100, 52, 104], iso: false };
  }
  function convex(Ps) { var sg = 0; for (var i = 0; i < Ps.length; i++) { var a = Ps[i], b = Ps[(i + 1) % Ps.length], c = Ps[(i + 2) % Ps.length], cr = (b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0]); if (!cr) return false; if (!sg) sg = Math.sign(cr); else if (Math.sign(cr) !== sg) return false; } return true; }
  function e8Shared(r) {
    for (var i = 0; i < 4000; i++) {
      var Ps = [[r.int(-6, -2), r.int(-2, 4)], [r.int(-2, 3), r.int(3, 6)], [r.int(2, 6), r.int(-3, 3)], [r.int(-4, 1), r.int(-5, -2)]];
      if (!convex(Ps)) continue;
      var ok2 = true, s = [], sr = 0, se = 0;
      for (var j = 0; j < 4; j++) { var A = Ps[j], B = Ps[(j + 1) % 4]; if (!diagSide(A, B)) { ok2 = false; break; } var N = d2(A, B); if (isSq(N)) { ok2 = false; break; } s.push(N); sr += K.roundTo(Math.sqrt(N), 1); se += Math.sqrt(N); }
      if (!ok2) continue;
      if (Math.abs(se * 10 - Math.round(se * 10)) > 0.45) continue;
      if (K.roundTo(sr, 1) === K.roundTo(se, 1)) continue;
      return { V: Ps, s: s, sumR: K.roundTo(sr, 1), sumE: se };
    }
    return { V: [[-5, 2], [1, 6], [5, -2], [-3, -4]], s: [52, 80, 68, 40], sumR: 30.6, sumE: Math.sqrt(52) + Math.sqrt(80) + Math.sqrt(68) + Math.sqrt(40) };
  }
  function e9Shared(r) {
    for (var i = 0; i < 300; i++) {
      var h = r.int(2, 5), top = r.int(2, 6), bot = r.int(top + 2, 10), yt = r.int(top - 2, 6), ym = yt - top, yb = ym - bot, c = r.pick([0, 0, 0, -1, 1]);
      if (yb < -8 || bot + top > 12 || yt < 1 || yb > -1 || ym === 0) continue;
      var n1 = h * h + top * top, n2 = h * h + bot * bot; if (isSq(n1) || isSq(n2)) continue;
      return { W: [c, yt], X: [c + h, ym], Y: [c, yb], Z: [c - h, ym], h: h, n1: n1, n2: n2, win: { x: [-6, 6], y: [yb - 1, Math.max(yt + 1, 1)] } };
    }
    return { W: [0, 5], X: [4, 1], Y: [0, -7], Z: [-4, 1], h: 4, n1: 32, n2: 80, win: { x: [-6, 6], y: [-8, 6] } };
  }
  /* exact perimeter of a polygon given its squared sides (like radicals collected) */
  function perimTex(sqs) {
    var by = {}, ints = 0, order = [];
    sqs.forEach(function (N) { var s = simp(N); if (s.m === 1) ints += s.k; else { if (!by[s.m]) { by[s.m] = 0; order.push(s.m); } by[s.m] += s.k; } });
    var parts = []; if (ints) parts.push(String(ints)); order.forEach(function (m) { parts.push((by[m] === 1 ? '' : by[m]) + '\\sqrt{' + m + '}'); });
    return parts.join('+');
  }
  function polyPad(Vs, win) { return { x: win.x, y: win.y, labels: 2, mode: 'lines', defaultEnd: 'closed' }; }
  function polyTarget(Vs) { return { pts: [], pieces: [{ v: Vs.concat([Vs[0]]), s: 'closed', e: 'closed' }] }; }
  function polyPart(prompt, Vs, win, names, text) {
    var inp = polyPad(Vs, win), key = polyTarget(Vs);
    var sw = { pts: [], pieces: [{ v: Vs.concat([Vs[0]]).map(function (p) { return [p[1], p[0]]; }), s: 'closed', e: 'closed' }] };
    var open = { pts: [], pieces: [{ v: Vs.slice(), s: 'closed', e: 'closed' }] };
    var chk = K.graphExact(key, { wrong: [{ is: open, code: 'graph-open', hint: 'Close the shape: join the last vertex back to ' + t(names[0]) + '.' }] });
    var p = K.P.graph(prompt, inp, chk, key, 'Plot ' + Vs.map(function (v, i) { return t(names[i] + P2(v)); }).join(', ') + ' (across to ' + t('x') + ', then up or down to ' + t('y') + '), then join them in order and back to ' + t(names[0]) + '.',
      ['Plot each vertex: start at the origin, go across to the ' + t('x') + '-coordinate, then up or down to the ' + t('y') + '-coordinate.', 'Join the vertices in order with the line tool, and close the shape.'], text);
    p.bad = [sw, open].filter(function (b) { return !HW.draw.same(b, key); });
    return p;
  }

  HW.defineLesson({
    id: 'u6l1', unit: 6, num: '1', title: 'Extension: Measuring the Length of a Line Segment', outcome: 'EXT',
    blurb: 'Lengths of horizontal and vertical segments by subtracting coordinates, and of diagonal segments with the Pythagorean theorem — exact and rounded.',
    questions: [
      { num: '1', section: 'Assignment — Horizontal, vertical and diagonal lengths', stem: 'Determine the length of each line segment.', parts: [
        { id: '1a', level: 'LIM', make: function (r) { var y = r.int(1, 9), x = r.int(1, 6), L = r.int(3, 9); return hvLen('A', [x, y], 'B', [x + L, y]); } },
        { id: '1b', level: 'BEG', make: function (r) { var x = r.int(-9, -1), y = r.int(1, 6), L = r.int(5, 14); return hvLen('C', [x, y], 'D', [x, y + L]); } },
        { id: '1c', level: 'BEG', make: function (r) { var x = r.int(1, 9); return hvLen('E', [x, r.int(-9, -2)], 'F', [x, r.int(1, 9)]); } },
        { id: '1d', level: 'EMG', make: function (r) { var y = r.int(-12, -1); return hvLen('G', [r.int(3, 12), y], 'H', [r.int(-9, -1), y]); } }] },
      { num: '2', stem: 'Determine the length of each line segment.', parts: [
        { id: '2a', level: 'BEG', make: function (r) { var x = r.int(-9, -1), y1 = r.int(-15, -6); return hvLen('I', [x, y1], 'J', [x, r.int(y1 + 3, -1)]); } },
        { id: '2b', level: 'EMG', make: function (r) { var y = r.int(-20, -5); return hvLen('K', [r.int(2, 15), y], 'L', [r.int(-45, -15), y]); } },
        { id: '2c', level: 'EMG', make: function (r) { var y = r.int(-999, -101); return hvLen('M', [r.int(-499, -101), y], 'N', [r.int(101, 499), y]); } },
        { id: '2d', level: 'EMG', make: function (r) { var x = r.int(1000, 9999); return hvLen('P', [x, r.int(-1999, -1001)], 'Q', [x, r.int(101, 999)]); } }] },
      { num: '3', stem: 'Determine whether each line segment is horizontal or vertical, and write an expression for its length.', shared: q3Shared, parts: [
        { id: '3hv', sub: 'a–d', level: 'LIM', make: function (r, sh) {
          var rows = ['a', 'b', 'c', 'd'].map(function (k) { return { id: k, html: '(' + k + ') ' + t(sh[k].P[0]) + ' to ' + t(sh[k].P[1]) }; }), want = {};
          ['a', 'b', 'c', 'd'].forEach(function (k) { want[k] = sh[k].hor ? 'h' : 'v'; });
          return K.P.grid('Is each segment horizontal or vertical?', rows, [{ id: 'h', html: 'Horizontal' }, { id: 'v', html: 'Vertical' }], want, { tries: 2, why: function () { return { code: 'row', hint: 'Look for the coordinate that is the same in both endpoints. Same ' + t('y') + ' (second coordinate) → horizontal; same ' + t('x') + ' (first coordinate) → vertical.' }; } },
            ['a', 'b', 'c', 'd'].map(function (k) { return '(' + k + ') The ' + (sh[k].hor ? 'second' : 'first') + ' coordinates match, so it is <b>' + (sh[k].hor ? 'horizontal' : 'vertical') + '</b>.'; }).join('<br>'),
            ['A horizontal segment keeps the same ' + t('y') + '-coordinate; a vertical one keeps the same ' + t('x') + '-coordinate.'], 'horizontal or vertical (variables)');
        } },
        { id: '3a', sub: 'a', level: 'BEG', make: function (r, sh) {
          var s = sh.a, c = s.hor ? 'x' : 'y', v = s.v[s.hor ? 0 : 1];
          var p = K.P.number('Length of the segment from ' + segTex(s) + ':', s.L, function (x) { if (x === -s.L) return { code: 'neg-length', hint: 'A length can’t be negative — take the positive difference.' }; if (x === 0) return { code: 'same-coord', hint: 'You subtracted the coordinates that are the same. Subtract the ' + t(c) + '-coordinates.' }; return null; },
            'The ' + t(c) + '-coordinates are ' + t(v) + ' and ' + t(lin(v, s.rev ? -s.k : s.k)) + '. Length ' + t('=|' + lin(v, s.rev ? -s.k : s.k) + '-' + v + '|=|' + (s.rev ? -s.k : s.k) + '|=' + s.L) + ' units.',
            ['Subtract the coordinates that change. The letter cancels out.'], 'variable length (a)', { after: 'units' });
          p.bad = [String(-s.L)]; return p;
        } },
        { id: '3b', sub: 'b', level: 'EMG', make: function (r, sh) {
          var s = sh.b, c = s.hor ? 'x' : 'y', v = s.v[s.hor ? 0 : 1];
          var p = K.P.number('Length of the segment from ' + segTex(s) + ':', s.L, function (x) {
            if (x === -s.L) return { code: 'neg-length', hint: 'A length can’t be negative — take the positive difference.' };
            if (x === Math.abs(s.c - s.b)) return { code: 'neg-sub', hint: 'Watch the sign: ' + t('(' + lin(v, s.c) + ')-(' + lin(v, -s.b) + ')=' + v + '+' + s.c + '-' + v + '+' + s.b) + '. Subtracting a negative adds.' };
            if (x === 0 || x === Math.abs(s.s)) return { code: 'same-coord', hint: 'Subtract the ' + t(c) + '-coordinates — the ones that change.' };
            return null;
          }, 'The ' + t(c) + '-coordinates are ' + t(lin(v, -s.b)) + ' and ' + t(lin(v, s.c)) + '.<br>Length ' + t('=|(' + lin(v, s.c) + ')-(' + lin(v, -s.b) + ')|=|' + s.c + '+' + s.b + '|=' + s.L) + ' units.',
          ['Subtract the coordinates that change, keeping the brackets: ' + t('(' + lin(v, s.c) + ')-(' + lin(v, -s.b) + ')') + '.'], 'variable length (b)', { after: 'units' });
          p.bad = [String(Math.abs(s.c - s.b)), String(-s.L)]; return p;
        } },
        { id: '3c', sub: 'c', level: 'EMG', make: function (r, sh) { return varLenPart(sh.c, 'c'); } },
        { id: '3d', sub: 'd', level: 'EMG', make: function (r, sh) { return varLenPart(sh.d, 'd'); } }] },
      { num: '4', stem: function (sh) { return 'A triangle has vertices ' + t('P' + P2(sh.P)) + ', ' + t('Q' + P2(sh.Q)) + ' and ' + t('R' + P2(sh.R)) + '.'; }, shared: q4Shared, parts: [
        { id: '4a', sub: 'sketch', level: 'BEG', make: function (r, sh) { return polyPart('Sketch the triangle on the grid: plot ' + t('P') + ', ' + t('Q') + ' and ' + t('R') + ' and join them.', [sh.P, sh.Q, sh.R], { x: [-6, 8], y: [-6, 7] }, ['P', 'Q', 'R'], 'sketch triangle PQR'); } },
        { id: '4b', sub: 'area', level: 'PRG', make: function (r, sh) {
          var y0 = sh.P[1], Ry = sh.R[1], wrongH = Math.abs(Math.abs(Ry) - Math.abs(y0));
          var p = K.P.number('Calculate the area of the triangle.', sh.A, function (v) {
            if (v === sh.b * sh.h) return { code: 'no-half', hint: 'That’s base × height — the area of a <b>rectangle</b>. A triangle is half of it: ' + t('A=\\tfrac12bh') + '.' };
            if (y0 * Ry < 0 && near(v, sh.b * wrongH / 2)) return { code: 'height-sign', hint: 'Check the height: ' + t('R') + ' and the base are on opposite sides of the ' + t('x') + '-axis, so the height is ' + t('|' + sub(Ry, y0) + '|') + ' — subtracting a negative adds.' };
            if (near(v, sh.b * (sh.h + 1) / 2) || near(v, (sh.b + 1) * sh.h / 2)) return { code: 'count', hint: 'Recount the base or the height: count the spaces between grid lines, or subtract coordinates.' };
            return null;
          }, t('P') + ' and ' + t('Q') + ' share ' + t('y=' + y0) + ', so ' + t('PQ') + ' is horizontal: base ' + t('=|' + sub(sh.Q[0], sh.P[0]) + '|=' + sh.b) + ' units.<br>The height is the vertical distance from ' + t('R' + P2(sh.R)) + ' to the line ' + t('y=' + y0) + ': ' + t('|' + sub(Ry, y0) + '|=' + sh.h) + ' units.<br>' + t('A=\\tfrac12bh=\\tfrac12(' + sh.b + ')(' + sh.h + ')=' + sh.A) + ' units².',
          ['Use the horizontal side ' + t('PQ') + ' as the base. The height is the vertical distance from ' + t('R') + ' to that base.', t('A=\\tfrac12\\times\\text{base}\\times\\text{height}') + '.'], 'area of triangle', { after: 'units²' });
          p.bad = [String(sh.b * sh.h)]; return p;
        } }] },
      { num: '5', stem: q5Stem, shared: q5Shared, parts: [
        { id: '5a', level: 'PRG', make: function (r, sh) { return lenPart('Segment ' + t('AB'), 'AB', sh.segs[0][0], sh.segs[0][1], 2); } },
        { id: '5b', level: 'EMG', make: function (r, sh) { return lenPart('Segment ' + t('CD'), 'CD', sh.segs[1][0], sh.segs[1][1], 2); } },
        { id: '5c', level: 'PRG', make: function (r, sh) { return lenPart('Segment ' + t('EF'), 'EF', sh.segs[2][0], sh.segs[2][1], 2); } }] },
      { num: '6', stem: function (sh) { return 'Here is a segment ' + t('AB') + ' like the ones in question 5.' + fig(W6, [[sh.A, sh.B]], [[sh.A[0], sh.A[1], 'A'], [sh.B[0], sh.B[1], 'B']], { max: 320 }); }, shared: q6Shared, parts: [
        { id: '6i', sub: 'i', level: 'BEG', make: function (r, sh) {
          var p = K.P.fields('List the coordinates of ' + t('A') + ' and ' + t('B') + '.', [ptField('A'), ptField('B')], [ptChk(sh.A), ptChk(sh.B)], [P2(sh.A).replace('\\ ', ' '), P2(sh.B).replace('\\ ', ' ')], t('A' + P2(sh.A)) + ', ' + t('B' + P2(sh.B)),
            'Read each endpoint: across to its ' + t('x') + '-coordinate, then up or down to its ' + t('y') + '-coordinate: ' + t('A' + P2(sh.A)) + ' and ' + t('B' + P2(sh.B)) + '.', ['Start at the origin: count across first (' + t('x') + '), then up or down (' + t('y') + ').'], 'coordinates of A and B');
          p.bad = [['(' + sh.A[1] + ', ' + sh.A[0] + ')', '(' + sh.B[1] + ', ' + sh.B[0] + ')']]; return p;
        } },
        { id: '6ii', sub: 'ii', level: 'BEG', make: function (r, sh) {
          var dx = sh.B[0] - sh.A[0], dy = sh.B[1] - sh.A[1];
          var od = function (want) { return function (v) { if (v === -want) return { code: 'diff-order', hint: 'Order matters here: ' + t('x_B-x_A') + ' means ' + t('B') + '’s coordinate <b>minus</b> ' + t('A') + '’s.' }; return null; }; };
          var p = K.P.fields('Subtract the coordinates (' + t('B') + ' minus ' + t('A') + '):', [numField(t('x_B-x_A='), 'x_B − x_A'), numField(t('y_B-y_A='), 'y_B − y_A')], [K.number(dx, od(dx)), K.number(dy, od(dy))], [String(dx), String(dy)],
            t('x_B-x_A=' + dx) + ', ' + t('y_B-y_A=' + dy),
            t('x_B-x_A=' + sub(sh.B[0], sh.A[0]) + '=' + dx) + ' and ' + t('y_B-y_A=' + sub(sh.B[1], sh.A[1]) + '=' + dy) + '.<br>These are the run and the rise of the right triangle under ' + t('AB') + ' (a negative just means left or down — it disappears when squared): ' + t('AB=\\sqrt{' + pr(dx) + '^{2}+' + pr(dy) + '^{2}}=' + rtSteps(dx * dx + dy * dy)) + '.',
            ['Use ' + t('B') + '’s coordinate first. Subtracting a negative adds.'], 'differences of coordinates');
          p.bad = [[String(-dx), String(-dy)]]; return p;
        } },
        { id: '6iii', sub: 'iii', level: 'EMG', make: function (r, sh) {
          var dx = Math.abs(sh.B[0] - sh.A[0]), dy = Math.abs(sh.B[1] - sh.A[1]);
          return mcP(r, 'Which statement explains how the coordinates of the endpoints, together with the Pythagorean theorem, give the length of a diagonal segment?', [
            { html: 'Subtract the ' + t('x') + '-coordinates to get the run and the ' + t('y') + '-coordinates to get the rise. They are the legs of a right triangle with the segment as hypotenuse, so the length is ' + t('\\sqrt{\\text{run}^{2}+\\text{rise}^{2}}') + '.', right: true },
            { html: 'Subtract the coordinates to get the run and the rise, then add them: length ' + t('=\\text{run}+\\text{rise}') + '.', why: 'The segment is the hypotenuse, which is shorter than the two legs together (' + t(rt(dx * dx + dy * dy) + '\\ne ' + (dx + dy)) + '). Square the legs, add, then take the square root.' },
            { html: 'Square every coordinate of both endpoints, add them all, and take the square root.', why: 'Use the <b>differences</b> of the coordinates — those are the legs. The coordinates themselves are distances from the axes, not from each other.' },
            { html: 'Multiply the run by the rise and take the square root.', why: 'The Pythagorean theorem <b>adds</b> the squares of the legs: ' + t('c^{2}=a^{2}+b^{2}') + '.' }],
            'The differences ' + t('x_B-x_A') + ' and ' + t('y_B-y_A') + ' are the run and the rise of the right triangle built under the segment, so they are the legs ' + t('a, b') + ' and the segment is ' + t('c=\\sqrt{a^{2}+b^{2}}') + '. Here ' + t('AB=\\sqrt{' + dx + '^{2}+' + dy + '^{2}}=' + rtSteps(dx * dx + dy * dy)) + ' units. (A negative difference does no harm: it is squared.)',
            ['Which part of the right triangle is the segment itself?'], 'explain distance from coordinates');
        } }] },
      { num: '7', stem: function (sh) { return 'Plot the points ' + t('P' + P2(sh.P)) + ', ' + t('Q' + P2(sh.Q)) + ' and ' + t('R' + P2(sh.R)) + '.'; }, shared: q7Shared, parts: [
        { id: '7plot', sub: 'plot', level: 'BEG', make: function (r, sh) {
          var inp = { x: sh.win.x, y: sh.win.y, labels: 2, mode: 'points' }, key = { pts: [sh.P, sh.Q, sh.R], pieces: [] };
          var p = K.P.graph('On the grid, plot ' + t('P') + ', ' + t('Q') + ' and ' + t('R') + '.', inp, K.graphExact(key), key, 'Each point: across to the ' + t('x') + '-coordinate, then down to the ' + t('y') + '-coordinate. ' + t('P') + ' is straight above ' + t('Q') + ', and ' + t('R') + ' is straight to the right of ' + t('Q') + '.',
            ['Start at the origin each time: across first (' + t('x') + '), then up or down (' + t('y') + ').'], 'plot P, Q, R');
          p.bad = [{ pts: [sh.P, sh.Q], pieces: [] }, { pts: [[sh.P[1], sh.P[0]], [sh.Q[1], sh.Q[0]], [sh.R[1], sh.R[0]]], pieces: [] }].filter(function (b) { return !HW.draw.same(b, key); }); return p;
        } },
        { id: '7a', sub: 'a', level: 'PRG', make: function (r, sh) {
          var p = K.P.math('Determine, as an exact value, the distance from ' + t('P') + ' to ' + t('R') + '.', exactLen(sh.N, [sh.h, sh.v]), rt(sh.N),
            t('PQ') + ' is vertical and ' + t('QR') + ' is horizontal, so the right angle is at ' + t('Q') + ': ' + t('PQ=|' + sub(sh.Q[1], sh.P[1]) + '|=' + sh.v) + ', ' + t('QR=|' + sub(sh.R[0], sh.Q[0]) + '|=' + sh.h) + '.<br>' + t('PR') + ' is the hypotenuse: ' + legSol('PR', sh.v, sh.h) + '.',
            ['Which two sides are horizontal and vertical? Their lengths are the legs, and ' + t('PR') + ' is the hypotenuse.'], 'exact PR', { keys: RADK, after: 'units', placeholder: 'e.g. 5sqrt(13)' });
          p.bad = [String(sh.N), String(sh.h + sh.v)]; return p;
        } },
        { id: '7b', sub: 'b', level: 'PRG', make: function (r, sh) {
          var A = sh.h * sh.v / 2, per = sh.h + sh.v + Math.sqrt(sh.N);
          var p = K.P.fields('Calculate the area of ' + t('\\triangle PQR') + ', and its perimeter to the nearest tenth.', [numField('Area:', 'Area', 'units²'), numField('Perimeter ≈', 'Perimeter', 'units')],
            [K.number(A, function (v) { if (v === 2 * A) return { code: 'no-half', hint: 'A triangle is half of the rectangle: ' + t('A=\\tfrac12bh') + '.' }; if (near(v, Math.sqrt(sh.N) * sh.v / 2) || near(v, Math.sqrt(sh.N) * sh.h / 2)) return { code: 'mid-area', hint: 'Use the two legs (they meet at a right angle) as base and height, not the hypotenuse.' }; return null; }),
              K.approx(per, 1, { diag: function (v) { if (near(v, sh.h + sh.v, 0.051)) return { code: 'perim-side', hint: 'The perimeter includes all three sides — add the hypotenuse ' + t('PR') + ' too.' }; if (near(v, sh.h + sh.v + sh.N, 0.051)) return { code: 'no-root', hint: 'Use the length ' + t('PR=' + rt(sh.N)) + ', not ' + t('PR^{2}') + '.' }; return null; } })],
            [String(A), dec(per, 1)], 'Area ' + t('=' + A) + ' units², perimeter ' + t('\\approx ' + dec(per, 1)) + ' units',
            'The legs ' + t('PQ=' + sh.v) + ' and ' + t('QR=' + sh.h) + ' meet at a right angle, so ' + t('A=\\tfrac12(' + sh.h + ')(' + sh.v + ')=' + A) + ' units².<br>Perimeter ' + t('=' + sh.v + '+' + sh.h + '+' + rt(sh.N) + '\\approx ' + dec(per, 3) + '\\approx ' + dec(per, 1)) + ' units (round only at the end).',
            ['The legs are the base and height.', 'Perimeter = all three sides; use the exact ' + t('PR') + ' and round at the end.'], 'area and perimeter of PQR');
          p.bad = [[String(2 * A), dec(sh.h + sh.v, 1)]]; return p;
        } }] },
      { num: '8', stem: function (sh) { return 'Amara uses quadrant I of a Cartesian plane to describe the location of the bases in a game of slow-pitch softball. The four bases form a square. The origin is at home plate, first base is at ' + t('(' + sh.s + ',\\ 0)') + ', and the distance between each base is ' + t(sh.s) + ' m. The pitcher’s mound lies between home plate and second base.' + diamond(sh.s, sh.d); }, shared: q8Shared, parts: [
        { id: '8a', level: 'BEG', make: function (r, sh) {
          var s = sh.s;
          var p = K.P.math('State the coordinates of second base.', ptChk([s, s], { diag: function (v) { if (near(v[0], s) && near(v[1], 0)) return { code: 'bases', hint: 'That’s first base. Second base is one side further, straight <b>up</b> from first base.' }; if (near(v[0], 0) && near(v[1], s)) return { code: 'bases', hint: 'That’s third base. Second base is diagonally across from home plate.' }; return null; } }), '(' + s + ',\\ ' + s + ')',
            'The bases form a square of side ' + t(s) + ' m with home at ' + t('(0,\\ 0)') + ' and first base at ' + t('(' + s + ',\\ 0)') + '. Second base is one side up from first base: ' + t('(' + s + ',\\ ' + s + ')') + '.', ['Go to first base, then move one side of the square straight up.'], 'second base', { keys: PTK, placeholder: 'e.g. (3, 4)' });
          p.bad = ['(' + s + ', 0)', '(0, ' + s + ')']; return p;
        } },
        { id: '8b', level: 'PRG', make: function (r, sh) {
          var s = sh.s, D = s * Math.SQRT2, th = D - sh.d;
          var p = K.P.approx('The pitcher stands on the mound ' + t(sh.d) + ' m from home plate. If she throws the ball to second base, what distance, to the nearest tenth of a metre, does she throw it?', th, 1, { after: 'm', diag: function (v) {
            if (near(v, D, 0.051)) return { code: 'full-diag', hint: 'That’s the whole distance from home plate to second base. The pitcher is already ' + t(sh.d) + ' m along it.' };
            if (near(v, s - sh.d, 0.051) || near(v, 2 * s - sh.d, 0.051)) return { code: 'side-not-diag', hint: 'The mound is on the <b>diagonal</b> from home to second base, not along the base paths. Find the diagonal with the Pythagorean theorem first.' };
            if (near(v, sh.d, 0.051)) return { code: 'full-diag', hint: 'That’s the distance from home plate to the mound. Find the whole diagonal first, then subtract.' };
            return null; } },
            'The mound is on the diagonal from home to second base. The diagonal is the hypotenuse of a right triangle with legs ' + t(s) + ' and ' + t(s) + ': ' + t('\\sqrt{' + s + '^{2}+' + s + '^{2}}=\\sqrt{' + 2 * s * s + '}=' + s + '\\sqrt{2}\\approx ' + dec(D, 3)) + ' m.<br>The throw is ' + t(dec(D, 3) + '-' + sh.d + '=' + dec(th, 3) + '\\approx ' + dec(th, 1)) + ' m.',
            ['Find the distance from home plate to second base first (the diagonal of the square).', 'Then subtract the distance the pitcher already is from home.'], 'pitcher to second base');
          p.bad = [dec(D, 1), dec(s - sh.d, 1)]; return p;
        } },
        { id: '8c', level: 'ADV', make: function (r, sh) {
          var k = sh.d / 2, kc = K.radical({ k: k, n: 2, m: 2 }, 'mixed', { diag: function (v) { if (near(v, sh.d / 2)) return { code: 'half-dist', hint: 'Halving the distance doesn’t work: ' + t('(' + k + ',\\ ' + k + ')') + ' is only ' + t(k + '\\sqrt{2}') + ' m from home. Use ' + t('\\sqrt{k^{2}+k^{2}}=' + sh.d) + '.' }; if (near(v, sh.s / 2)) return { code: 'half-dist', hint: 'That’s the centre of the square. The pitcher is ' + t(sh.d) + ' m from home: solve ' + t('\\sqrt{k^{2}+k^{2}}=' + sh.d) + '.' }; return null; } });
          var p = K.P.math('Calculate the <b>exact</b> coordinates of the pitcher.', ptChk([k * Math.SQRT2, k * Math.SQRT2], { chk: [kc, kc] }), '(' + k + '\\sqrt{2},\\ ' + k + '\\sqrt{2})',
            'The diagonal from ' + t('(0,\\ 0)') + ' to ' + t('(' + sh.s + ',\\ ' + sh.s + ')') + ' is the line ' + t('y=x') + ', so the pitcher is at ' + t('(k,\\ k)') + ' with ' + t('k>0') + '.<br>' + t('\\sqrt{k^{2}+k^{2}}=k\\sqrt{2}=' + sh.d) + ', so ' + t('k=\\dfrac{' + sh.d + '}{\\sqrt{2}}=\\dfrac{' + sh.d + '\\sqrt{2}}{2}=' + k + '\\sqrt{2}') + '.<br>Pitcher: ' + t('(' + k + '\\sqrt{2},\\ ' + k + '\\sqrt{2})') + '. (Check: ' + t('\\sqrt{' + 2 * k * k + '+' + 2 * k * k + '}=\\sqrt{' + sh.d * sh.d + '}=' + sh.d) + '.)',
            ['On the diagonal, both coordinates are equal: call the point ' + t('(k,\\ k)') + '.', 'Its distance from home is ' + t('\\sqrt{k^{2}+k^{2}}=k\\sqrt{2}') + '. Set that equal to ' + t(sh.d) + ' and solve.'], 'exact pitcher coordinates', { keys: PTK, placeholder: 'e.g. (3sqrt(2), 3sqrt(2))' });
          p.bad = ['(' + k + ', ' + k + ')', '(' + dec(k * Math.SQRT2, 1) + ', ' + dec(k * Math.SQRT2, 1) + ')']; p.good = ['(' + k + '\\sqrt{2}, ' + k + '\\sqrt{2})', '\\left(' + k + '\\sqrt{2},' + k + '\\sqrt{2}\\right)']; return p;
        } }] },
      { num: '9', section: 'Multiple choice and numerical response', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '9', level: 'PRG', make: function (r) {
          var b, L, s, a;
          for (var i = 0; i < 100; i++) { b = r.pick([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5]); L = r.int(3, 9); s = sgn(r); a = b + s * L; if (a !== 0 && a + L + b !== L && a - L + b !== L && Math.abs(a) <= 12) break; }
          var x1 = a + L, x2 = a - L, one = r.pick([x1, x2]);
          var good = s > 0 ? t('x=y') + ' or ' + t('x-y=' + 2 * L) : t('x=y') + ' or ' + t('y-x=' + 2 * L);
          return mcP(r, 'Horizontal line segment ' + t('CD') + ', with endpoints ' + t('C' + P2([a, b])) + ' and ' + t('D(x,\\ y)') + ', has a length of ' + t(L) + ' units. Which of the following must be true?', [
            { html: t('x=' + one), why: 'That’s one possibility — but ' + t('D') + ' could also be ' + t(L) + ' units to the other side of ' + t('C') + '. “Must be true” has to hold for both.' },
            { html: t('y=' + (b + L)) + ' or ' + t(b - L), why: t('CD') + ' is horizontal, so ' + t('D') + ' has the same ' + t('y') + '-coordinate as ' + t('C') + ': ' + t('y=' + b) + '.' },
            { html: t('x+y=' + L), why: 'Test both possible points ' + t(P2([x1, b])) + ' and ' + t(P2([x2, b])) + ': ' + t('x+y') + ' is ' + t(x1 + b) + ' or ' + t(x2 + b) + '.' },
            { html: good, right: true }],
            t('CD') + ' is horizontal, so ' + t('y=' + b) + '. The length gives ' + t('|' + mn('x', a) + '|=' + L) + ', so ' + t('x=' + x1) + ' or ' + t('x=' + x2) + ': ' + t('D' + P2([x1, b])) + ' or ' + t('D' + P2([x2, b])) + '.<br>' +
            (s > 0 ? 'For ' + t(P2([x1, b])) + ': ' + t('x-y=' + sub(x1, b) + '=' + 2 * L) + '; for ' + t(P2([x2, b])) + ': ' + t('x=y') + '.' : 'For ' + t(P2([x2, b])) + ': ' + t('y-x=' + sub(b, x2) + '=' + 2 * L) + '; for ' + t(P2([x1, b])) + ': ' + t('x=y') + '.') + ' Only the last statement is true in both cases.',
            ['Find <b>both</b> possible points ' + t('D') + ' first, then test each statement on both.'], 'must be true: horizontal CD');
        } }] },
      { num: '10', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '10', level: 'PRG', make: function (r) {
          var n = r.pick([3, 5, 6, 7, 8, 10, 11, 13]), v = '\\sqrt{' + n + '}';
          return mcP(r, t('ABCD') + ' is a square with vertices ' + t('(' + v + ',\\ 0)') + ', ' + t('(0,\\ ' + v + ')') + ', ' + t('(-' + v + ',\\ 0)') + ' and ' + t('(0,\\ -' + v + ')') + ', respectively. The area of the square, in units², is', [
            { html: t(n), why: 'That’s ' + t('(' + v + ')^{2}') + ', the square of the distance from the centre to a vertex — not of a side. A side joins two <b>adjacent</b> vertices.' },
            { html: t(2 * n), right: true },
            { html: t(4 * n), why: 'That uses the diagonal ' + t('2' + v) + ' as if it were a side. A side joins two adjacent vertices, like ' + t('(' + v + ',\\ 0)') + ' and ' + t('(0,\\ ' + v + ')') + '.' },
            { html: t(n * n), why: 'Find the side first: it joins ' + t('(' + v + ',\\ 0)') + ' and ' + t('(0,\\ ' + v + ')') + ', with run and rise both ' + t(v) + '.' }],
            'A side joins adjacent vertices, e.g. ' + t('(' + v + ',\\ 0)') + ' and ' + t('(0,\\ ' + v + ')') + ': run and rise are both ' + t(v) + ', so side ' + t('=\\sqrt{(' + v + ')^{2}+(' + v + ')^{2}}=\\sqrt{' + n + '+' + n + '}=\\sqrt{' + 2 * n + '}') + '.<br>Area ' + t('=(\\sqrt{' + 2 * n + '})^{2}=' + 2 * n) + ' units². (Using the diagonal ' + t('2' + v) + ' as the side gives ' + t(4 * n) + ', the classic mistake.)',
            ['Which two vertices are joined by a side? Find that length first.'], 'area of square with radical vertices');
        } }] },
      { num: '11', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '11', level: 'PRG', make: function (r) {
          var T = rightTri(r, legPairs(3, 12, function (N) { return !isSq(N); }), false);
          var p = K.P.approx('To the nearest tenth, the perimeter of ' + t('\\triangle PQR') + ' with vertices ' + t('P' + P2(T.P)) + ', ' + t('Q' + P2(T.Q)) + ' and ' + t('R' + P2(T.R)) + ' is ________.', T.per, 1, { nr: true, diag: function (v) {
            if (near(v, T.v + T.h, 0.051)) return { code: 'perim-side', hint: 'You have the two legs — add the third side ' + t('QR') + ' (the hypotenuse) too.' };
            if (near(v, 2 * (T.v + T.h), 0.051)) return { code: 'add-legs', hint: 'The hypotenuse isn’t the sum of the legs: ' + t('QR=\\sqrt{PQ^{2}+PR^{2}}') + '.' };
            if (near(v, T.v + T.h + T.N, 0.051)) return { code: 'no-root', hint: 'Take the square root for ' + t('QR') + ' before adding.' };
            return null; } },
            t('P') + ' and ' + t('Q') + ' share ' + t('x=' + T.P[0]) + ' (vertical) and ' + t('P') + ' and ' + t('R') + ' share ' + t('y=' + T.P[1]) + ' (horizontal), so the right angle is at ' + t('P') + '.<br>' + t('PQ=|' + sub(T.P[1], T.Q[1]) + '|=' + T.v) + ', ' + t('PR=|' + sub(T.P[0], T.R[0]) + '|=' + T.h) + ', ' + t('QR=\\sqrt{' + T.v + '^{2}+' + T.h + '^{2}}=\\sqrt{' + T.N + '}\\approx ' + dec(Math.sqrt(T.N), 4)) + '.<br>Perimeter ' + t('\\approx ' + T.v + '+' + T.h + '+' + dec(Math.sqrt(T.N), 4) + '=' + dec(T.per, 4) + '\\approx ' + dec(T.per, 1)) + '.',
            ['Two sides are vertical and horizontal — find them by subtracting. The third side is the hypotenuse.'], 'NR perimeter of right triangle');
          p.bad = [dec(T.v + T.h, 1)]; return p;
        } }] }
    ],
    extra: [
      { num: '1', section: 'Extra practice A — Read the grid before you count it', stem: function (sh) { return 'Segments ' + t('AB') + ', ' + t('CD') + ' and ' + t('EF') + ' are graphed below. Each grid square is ' + t('1') + ' unit. Give lengths as <b>(i)</b> the exact value in simplest radical form and <b>(ii)</b> a decimal to the nearest tenth.' + e1Fig(sh); }, shared: e1Shared, parts: [
        { id: 'e1a', level: 'BEG', make: function (r, sh) {
          var names = ['A', 'B', 'C', 'D', 'E', 'F'], pts = [sh.segs[0][0], sh.segs[0][1], sh.segs[1][0], sh.segs[1][1], sh.segs[2][0], sh.segs[2][1]];
          var p = K.P.fields('State the coordinates of all six endpoints.', names.map(ptField), pts.map(function (q) { return ptChk(q); }), pts.map(function (q) { return '(' + q[0] + ', ' + q[1] + ')'; }), names.map(function (n, i) { return t(n + P2(pts[i])); }).join(', '),
            names.map(function (n, i) { return t(n + P2(pts[i])); }).join(', ') + ' — across first, then up or down.', ['Count across from the origin for ' + t('x') + ', then up or down for ' + t('y') + '.'], 'coordinates of six endpoints');
          p.bad = [pts.map(function (q) { return '(' + q[1] + ', ' + q[0] + ')'; })]; return p;
        } },
        { id: 'e1b', level: 'PRG', make: function (r, sh) {
          var fields = [], chks = [], keys = [], sol = [], ans = [];
          sh.segs.forEach(function (s, i) {
            var nm = NAMES[i].join(''), rr = runRise(s[0], s[1]), N = rr[0] * rr[0] + rr[1] * rr[1];
            fields.push(radField(t(nm) + ' exact:', nm + ' exact'), radField(t(nm) + ' ≈', nm + ' to the nearest tenth'));
            chks.push(exactLen(N, rr), approxLen(N, 1, rr)); keys.push(rt(N), dec(Math.sqrt(N), 1)); sol.push('<b>' + t(nm) + ':</b> ' + distSol(nm, s[0], s[1], 1)); ans.push(t(nm + '=' + rt(N) + '\\approx ' + dec(Math.sqrt(N), 1)));
          });
          var p = K.P.fields('Determine the lengths of ' + t('AB') + ', ' + t('CD') + ' and ' + t('EF') + '.', fields, chks, keys, ans.join('<br>'), sol.join('<br>'),
            ['For each segment: count the run and the rise, then ' + t('\\sqrt{\\text{run}^{2}+\\text{rise}^{2}}') + '.', 'Do the exact value first, then round it.'], 'three lengths from grid');
          p.bad = [keys.map(function (k, j) { return j % 2 ? '1.0' : '1'; })]; return p;
        } },
        { id: 'e1c', level: 'EMG', make: function (r, sh) {
          var Ns = sh.segs.map(function (s) { var rr = runRise(s[0], s[1]); return rr[0] * rr[0] + rr[1] * rr[1]; }), f = sh.sfIdx, o = [0, 1, 2].filter(function (j) { return j !== f; });
          var nm = function (j) { return t(NAMES[j].join('')); }, Nf = Ns[f], s1 = simp(Ns[o[0]]), s2 = simp(Ns[o[1]]);
          return mcP(r, 'Two of the three lengths simplify and one does not. Which one does not, and why?', [
            { html: nm(f) + ': ' + t(Nf) + ' has no perfect-square factor greater than ' + t('1') + '.', right: true },
            { html: nm(o[0]) + ': ' + t(Ns[o[0]]) + ' is not a perfect square.', why: 'Not being a perfect square only means the radical doesn’t disappear completely. ' + t(Ns[o[0]] + '=' + s1.k * s1.k + '\\times ' + s1.m) + ' has the square factor ' + t(s1.k * s1.k) + ', so it does simplify.' },
            { html: nm(f) + ': ' + t(Nf) + ' is ' + (Nf % 2 ? 'odd' : 'even') + '.', why: 'Odd or even doesn’t decide it. What matters is whether the number has a perfect-square factor such as ' + t('4, 9, 16, 25') + '.' },
            { html: nm(o[1]) + ': ' + t(Ns[o[1]]) + ' has a prime factor.', why: 'Every number above 1 has prime factors. ' + t(Ns[o[1]] + '=' + s2.k * s2.k + '\\times ' + s2.m) + ' has a perfect-square factor, so it does simplify.' }],
            [0, 1, 2].map(function (j) { return nm(j) + ': ' + t(rtSteps(Ns[j])); }).join('<br>') + '<br>A radical simplifies exactly when the number under it has a perfect-square factor greater than ' + t('1') + '. ' + t(Nf) + ' has none.',
            ['Look for a perfect-square factor (4, 9, 16, 25, 36, …) under each radical.'], 'which length simplifies');
        } }] },
      { num: '2', stem: function (sh) { return 'On the grid below <b>each grid square is ' + t('2') + ' units</b>, not 1. Read the tick numbers carefully before you count anything.' + e2Fig(sh); }, shared: e2Shared, parts: [
        { id: 'e2a', level: 'EMG', make: function (r, sh) {
          var names = ['P', 'Q', 'R', 'S'], pts = [sh.segs[0][0], sh.segs[0][1], sh.segs[1][0], sh.segs[1][1]];
          var p = K.P.fields('State the coordinates of ' + t('P') + ', ' + t('Q') + ', ' + t('R') + ' and ' + t('S') + '.', names.map(ptField),
            pts.map(function (q) { return ptChk(q, { diag: function (v) { if (near(v[0] * 2, q[0]) && near(v[1] * 2, q[1])) return { code: 'scale', hint: 'You counted squares as 1 unit each. Each square is <b>2 units</b>, so double your counts (read the tick numbers).' }; return null; } }); }),
            pts.map(function (q) { return '(' + q[0] + ', ' + q[1] + ')'; }), names.map(function (n, i) { return t(n + P2(pts[i])); }).join(', '),
            'Each square is ' + t('2') + ' units, so every square count is doubled: ' + names.map(function (n, i) { return t(n + P2(pts[i])); }).join(', ') + '.', ['Use the tick labels: each grid line is 2 more than the one before.'], 'coordinates on a scale-2 grid');
          p.bad = [pts.map(function (q) { return '(' + q[0] / 2 + ', ' + q[1] / 2 + ')'; })]; return p;
        } },
        { id: 'e2b', level: 'PRG', make: function (r, sh) {
          var fields = [], chks = [], keys = [], sol = [], ans = [];
          [['PQ', sh.segs[0]], ['RS', sh.segs[1]]].forEach(function (z) {
            var nm = z[0], rr = runRise(z[1][0], z[1][1]), N = rr[0] * rr[0] + rr[1] * rr[1];
            var sc = function (v, tol) { if (near(v, Math.sqrt(N / 4), tol)) return { code: 'scale', hint: 'That’s the length in <b>squares</b>. Each square is 2 units, so the run and rise are double what you counted — the length doubles too.' }; return null; };
            fields.push(radField(t(nm) + ' exact:', nm + ' exact'), radField(t(nm) + ' ≈', nm + ' to the nearest tenth'));
            chks.push(exactLen(N, rr, sc), approxLen(N, 1, rr, sc)); keys.push(rt(N), dec(Math.sqrt(N), 1)); sol.push('<b>' + t(nm) + ':</b> ' + distSol(nm, z[1][0], z[1][1], 1)); ans.push(t(nm + '=' + rt(N) + '\\approx ' + dec(Math.sqrt(N), 1)));
          });
          var p = K.P.fields('Determine the length of ' + t('PQ') + ' and of ' + t('RS') + '.', fields, chks, keys, ans.join('<br>'), sol.join('<br>'),
            ['Use the coordinates (in units), not the number of squares.', 'Run = difference of the ' + t('x') + '-coordinates, rise = difference of the ' + t('y') + '-coordinates.'], 'lengths on a scale-2 grid');
          var rq = runRise(sh.segs[0][0], sh.segs[0][1]); p.bad = [[rt((rq[0] * rq[0] + rq[1] * rq[1]) / 4), '1', '1', '1']]; return p;
        } },
        { id: 'e2c', level: 'EMG', make: function (r, sh) {
          var rr = runRise(sh.segs[0][0], sh.segs[0][1]), a = rr[0] / 2, b = rr[1] / 2, n = a * a + b * b;
          return mcP(r, 'A student counts squares as though each were worth 1 and gets ' + t(rt(n)) + ' for ' + t('PQ') + '. Their arithmetic is perfect. How is their answer related to the correct one?', [
            { html: 'The correct length is exactly <b>twice</b> theirs: the run and rise both double, so the length doubles.', right: true },
            { html: 'The correct length is <b>4 times</b> theirs.', why: 'Areas scale by 4 when lengths double. Here ' + t('\\sqrt{(2a)^{2}+(2b)^{2}}=\\sqrt{4(a^{2}+b^{2})}=2\\sqrt{a^{2}+b^{2}}') + '.' },
            { html: 'The correct length is ' + t('\\sqrt{2}') + ' times theirs.', why: 'Both legs double, so the sum of squares is multiplied by 4, and ' + t('\\sqrt{4}=2') + '.' },
            { html: 'It is the same — the scale doesn’t change the length.', why: 'The scale changes the coordinates: a run of ' + t(a) + ' squares is ' + t(2 * a) + ' units.' }],
            'Counting squares gives run ' + t(a) + ' and rise ' + t(b) + '; at 2 units per square the true run and rise are ' + t(2 * a) + ' and ' + t(2 * b) + '. Then ' + t('\\sqrt{' + 2 * a + '^{2}+' + 2 * b + '^{2}}=\\sqrt{4(' + a + '^{2}+' + b + '^{2})}=2\\sqrt{' + n + '}') + ', exactly twice ' + t('\\sqrt{' + n + '}') + '.',
            ['What happens to the run and the rise when each square is 2 units?'], 'scale factor and length');
        } }] },
      { num: '3', stem: function (sh) { return t('\\triangle PQR') + ' is drawn below with a right angle at ' + t('Q') + '. Each grid square is ' + t('1') + ' unit.' + e3Fig(sh, false); }, shared: e3Shared, parts: [
        { id: 'e3a', sub: 'a', level: 'BEG', make: function (r, sh) {
          var p = K.P.fields('State the coordinates of ' + t('P') + ', ' + t('Q') + ' and ' + t('R') + ', and give the lengths of the legs ' + t('PQ') + ' and ' + t('QR') + ' by counting squares.', [ptField('P'), ptField('Q'), ptField('R'), numField(t('PQ='), 'PQ', 'units'), numField(t('QR='), 'QR', 'units')],
            [ptChk(sh.P), ptChk(sh.Q), ptChk(sh.R), K.number(sh.h, function (v) { return v === -sh.h ? { code: 'neg-length', hint: 'Lengths are positive.' } : null; }), K.number(sh.v, function (v) { return v === -sh.v ? { code: 'neg-length', hint: 'Lengths are positive.' } : null; })],
            ['(' + sh.P[0] + ', ' + sh.P[1] + ')', '(' + sh.Q[0] + ', ' + sh.Q[1] + ')', '(' + sh.R[0] + ', ' + sh.R[1] + ')', String(sh.h), String(sh.v)],
            t('P' + P2(sh.P)) + ', ' + t('Q' + P2(sh.Q)) + ', ' + t('R' + P2(sh.R)) + '; ' + t('PQ=' + sh.h) + ', ' + t('QR=' + sh.v),
            t('PQ') + ' is horizontal: ' + t('|' + sub(sh.Q[0], sh.P[0]) + '|=' + sh.h) + ' units. ' + t('QR') + ' is vertical: ' + t('|' + sub(sh.R[1], sh.Q[1]) + '|=' + sh.v) + ' units.', ['Read each vertex, then count the squares along the horizontal and vertical legs.'], 'triangle coordinates and legs');
          p.bad = [['(' + sh.P[0] + ', ' + sh.P[1] + ')', '(' + sh.Q[0] + ', ' + sh.Q[1] + ')', '(' + sh.R[0] + ', ' + sh.R[1] + ')', String(sh.h + 1), String(sh.v)]]; return p;
        } },
        { id: 'e3b', sub: 'b', level: 'EMG', make: function (r, sh) {
          var p = K.P.math('Determine the length of the hypotenuse ' + t('PR') + '.', exactLen(sh.c * sh.c, [sh.h, sh.v]), String(sh.c), legSol('PR', sh.h, sh.v) + ' exactly.', ['The legs are ' + t('PQ') + ' and ' + t('QR') + '. Use ' + t('c=\\sqrt{a^{2}+b^{2}}') + '.'], 'hypotenuse PR', { keys: RADK, after: 'units' });
          p.bad = [String(sh.h + sh.v), String(sh.c * sh.c)]; p.good = [String(sh.c) + '.0']; return p;
        } },
        { id: 'e3cS', sub: 'c i', level: 'BEG', make: function (r, sh) {
          var inp = { x: sh.win.x, y: sh.win.y, labels: 2, mode: 'points', bg: { segs: [{ pts: [sh.P, sh.Q, sh.R, sh.P], start: 'none', end: 'none' }], points: [{ x: sh.P[0], y: sh.P[1], label: 'P' }, { x: sh.Q[0], y: sh.Q[1], label: 'Q' }, { x: sh.R[0], y: sh.R[1], label: 'R' }] } }, key = { pts: [sh.S], pieces: [] };
          var p = K.P.graph('Plot ' + t('S' + P2(sh.S)) + ' on the same grid.', inp, K.graphExact(key), key, 'Across to ' + t('x=' + sh.S[0]) + ', then up to ' + t('y=' + sh.S[1]) + ': ' + t('S') + ' is straight above ' + t('P') + '.', ['Across first (' + t('x') + '), then up or down (' + t('y') + ').'], 'plot S');
          p.bad = [{ pts: [[sh.S[1], sh.S[0]]], pieces: [] }]; return p;
        } },
        { id: 'e3c', sub: 'c ii', level: 'PRG', make: function (r, sh) {
          var rs = d2(sh.R, sh.S);
          var p = K.P.fields('Determine ' + t('PS') + ' and ' + t('RS') + '.', [lenField('PS', sh.c * sh.c), lenField('RS', rs)], [exactLen(sh.c * sh.c, [0, sh.c]), exactLen(rs, runRise(sh.R, sh.S))], [String(sh.c), rt(rs)],
            t('PS=' + sh.c) + ', ' + t('RS=' + rt(rs)), t('PS') + ' is vertical: ' + t('|' + sub(sh.S[1], sh.P[1]) + '|=' + sh.c) + ' units.<br>' + distSol('RS', sh.R, sh.S), ['' + t('PS') + ' is vertical — subtract. ' + t('RS') + ' is diagonal — use the Pythagorean theorem.'], 'PS and RS');
          p.bad = [[String(sh.c + 1), String(sh.h + sh.c - sh.v)]]; return p;
        } },
        { id: 'e3c2', sub: 'c iii', level: 'EMG', make: function (r, sh) {
          var rs = rt(d2(sh.R, sh.S));
          return mcP(r, 'A student claims that ' + t('\\triangle PRS') + ' is isosceles. Using ' + t('PR') + ', ' + t('PS') + ' and ' + t('RS') + ', decide whether the claim is true.', [
            { html: 'True: ' + t('PR=PS=' + sh.c), right: true },
            { html: 'True: ' + t('PR=RS'), why: t('RS=' + rs) + ', which is not ' + t(sh.c) + '.' },
            { html: 'True: ' + t('PS=RS'), why: t('RS=' + rs) + ', but ' + t('PS=' + sh.c) + '.' },
            { html: 'False: all three sides are different.', why: 'Compare ' + t('PR') + ' from (b) with ' + t('PS') + ': both are ' + t(sh.c) + '.' }],
            t('PR=' + sh.c) + ', ' + t('PS=' + sh.c) + ', ' + t('RS=' + rs + '\\approx ' + dec(Math.sqrt(d2(sh.R, sh.S)), 1)) + '. Two sides are equal, so the claim is <b>true</b>: ' + t('PR=PS') + '.', ['Compare the three lengths: are any two equal?'], 'isosceles PRS');
        } },
        { id: 'e3d', sub: 'd', level: 'EMG', make: function (r, sh) {
          var a = sh.c * sh.c, b = sh.c * sh.c, c = d2(sh.R, sh.S);
          return mcP(r, 'Is ' + t('\\triangle PRS') + ' also a right triangle? Compare ' + t('PR^{2}+RS^{2}') + ', ' + t('PR^{2}+PS^{2}') + ' and ' + t('PS^{2}+RS^{2}') + ' with the square of the remaining side.', [
            { html: 'No — none of the three sums equals the square of the remaining side.', right: true },
            { html: 'Yes — the right angle is at ' + t('P') + '.', why: 'Check: ' + t('PR^{2}+PS^{2}=' + (a + b)) + ', but ' + t('RS^{2}=' + c) + '.' },
            { html: 'Yes — the right angle is at ' + t('R') + '.', why: 'Check: ' + t('PR^{2}+RS^{2}=' + (a + c)) + ', but ' + t('PS^{2}=' + b) + '.' },
            { html: 'Yes — every isosceles triangle on a grid is a right triangle.', why: 'Being isosceles doesn’t make a triangle right-angled. Test the Pythagorean theorem with the actual squares.' }],
            t('PR^{2}=' + a) + ', ' + t('PS^{2}=' + b) + ', ' + t('RS^{2}=' + c) + '.<br>' + t('PR^{2}+RS^{2}=' + (a + c) + '\\ne PS^{2}') + ', ' + t('PR^{2}+PS^{2}=' + (a + b) + '\\ne RS^{2}') + ', ' + t('PS^{2}+RS^{2}=' + (b + c) + '\\ne PR^{2}') + '. No pair works, so ' + t('\\triangle PRS') + ' is <b>not</b> a right triangle.',
            ['A triangle is right-angled exactly when the squares of two sides add to the square of the third.'], 'is PRS right?');
        } }] },
      { num: '4', section: 'Extra practice B — The exact value comes first', stem: 'Determine the length of each line segment. Give <b>(i)</b> the exact value in simplest radical form and <b>(ii)</b> a decimal to the nearest tenth.', shared: e4Shared, parts: [0, 1, 2, 3, 4, 5].map(function (i) {
        return { id: 'e4' + 'abcdef'[i], level: ['PRG', 'PRG', 'EMG', 'EMG', 'PRG', 'EMG'][i], make: function (r, sh) { var s = sh.segs[i]; return lenPart(t(s.n[0] + P2(s.A)) + ' to ' + t(s.n[1] + P2(s.B)), s.n.join(''), s.A, s.B, 1); } };
      }).concat([{ id: 'e4g', level: 'EMG', make: function (r, sh) {
        var Ns = sh.segs.map(function (s) { return d2(s.A, s.B); }), L = 'abcdef';
        return mcP(r, 'Exactly one of the six answers needed no radical sign at all in its final form. Which one, and what was special about the number under the radical?', [
          { html: '(c): ' + t(Ns[2]) + ' is a perfect square (' + t(Ns[2] + '=' + Math.sqrt(Ns[2]) + '^{2}') + ').', right: true },
          { html: '(a): ' + t(Ns[0]) + ' has a perfect-square factor.', why: 'A perfect-square <b>factor</b> only simplifies the radical: ' + t(rtSteps(Ns[0])) + ' still has a radical.' },
          { html: '(d): ' + t(Ns[3]) + ' has no perfect-square factor.', why: 'Then the radical can’t be simplified at all: ' + t('\\sqrt{' + Ns[3] + '}') + ' stays as it is.' },
          { html: '(e): the run and the rise are equal.', why: 'Equal legs give ' + t(rtSteps(Ns[4])) + ' — still a radical.' }],
          sh.segs.map(function (s, i) { return '(' + L[i] + ') ' + t(rtSteps(Ns[i])); }).join('<br>') + '<br>Only (c) has a radicand that is itself a perfect square, so the radical disappears.', ['Which radicand is a perfect square?'], 'which length is a whole number');
      } }]) },
      { num: '5', stem: 'For each pair of endpoints, determine ' + t('(x_2-x_1)^{2}+(y_2-y_1)^{2}') + ' first, then decide <b>without a calculator</b> whether the length is a whole number. Finish by giving the exact length and the decimal to the nearest tenth.', parts: [
        [[[3, 4], [4, 3], [6, 8], [8, 6]], 'BEG'], [[[5, 5], [2, 4], [3, 6], [4, 4], [3, 3], [2, 6], [6, 3]], 'EMG'], [[[8, 15], [15, 8], [5, 12], [12, 5]], 'EMG'],
        [[[6, 4], [4, 6], [2, 6], [6, 2], [4, 8], [8, 4], [3, 6]], 'EMG'], [[[7, 24], [24, 7], [10, 24], [12, 16]], 'EMG'], [[[6, 8], [8, 6], [9, 12], [12, 9]], 'BEG']].map(function (cfg, i) {
        return { id: 'e5' + 'abcdef'[i], level: cfg[1], make: function (r) {
          var s = e5Seg(r, cfg[0]), A = s[0], B = s[1], dx = B[0] - A[0], dy = B[1] - A[1], N = dx * dx + dy * dy, rr = [Math.abs(dx), Math.abs(dy)];
          var p = K.P.fields(t(P2(A)) + ' to ' + t(P2(B)), [numField(t('(x_2-x_1)^{2}+(y_2-y_1)^{2}='), 'Sum of squares'), radField('Exact:', 'Exact length'), radField('≈', 'Nearest tenth')],
            [K.number(N, function (v) { if (v === Math.abs(dx) + Math.abs(dy) || v === dx + dy) return { code: 'no-square', hint: 'Square each difference before adding.' }; if (v === (dx + dy) * (dx + dy)) return { code: 'no-square', hint: 'Square each difference separately, then add: ' + t('(x_2-x_1)^{2}+(y_2-y_1)^{2}') + '.' }; if (v === Math.abs(dx * dx - dy * dy)) return { code: 'sub-squares', hint: 'Add the two squares.' }; return null; }), exactLen(N, rr), approxLen(N, 1, rr)],
            [String(N), rt(N), dec(Math.sqrt(N), 1)], t(N) + '; ' + (isSq(N) ? 'whole number, ' : 'not a whole number, ') + t(rt(N) + '\\approx ' + dec(Math.sqrt(N), 1)),
            t('(' + sub(B[0], A[0]) + ')^{2}+(' + sub(B[1], A[1]) + ')^{2}=' + pr(dx) + '^{2}+' + pr(dy) + '^{2}=' + dx * dx + '+' + dy * dy + '=' + N) + '.<br>' +
            (isSq(N) ? t(N + '=' + Math.sqrt(N) + '^{2}') + ' is a perfect square, so the length is the whole number ' + t(Math.sqrt(N)) + ' (' + t(dec(Math.sqrt(N), 1)) + ').' : t(Math.floor(Math.sqrt(N)) + '^{2}\\lt ' + N + '\\lt ' + Math.ceil(Math.sqrt(N)) + '^{2}') + ', so it is not a whole number: ' + t(rtSteps(N) + '\\approx ' + dec(Math.sqrt(N), 1)) + '.'),
            ['Subtract, square, add. Is the sum a perfect square?'], 'sum of squares and length');
          p.bad = [[String(rr[0] + rr[1]), rt(N), dec(Math.sqrt(N), 1)]]; return p;
        } };
      }) },
      { num: '6', stem: e6Stem, shared: e6Shared, parts: [
        { id: 'e6a', sub: 'a', level: 'PRG', make: function (r, sh) {
          var iT = String(sh.R1), rT = radSumTex(sh.m, sh.n), I = sh.intName, R = sh.radName;
          var dg = function (v) { if (near(v, sh.AB, 1e-6)) return { code: 'straight', hint: 'That’s the straight distance from ' + t('A') + ' to ' + t('B') + '. Each route goes through its waypoint: add the two legs of the trip.' }; return null; };
          var fields = [radField(I + ' total:', I), radField(R + ' total:', R)], chks = [sumChk(sh.R1, dg), sumChk(sh.R2, dg)], keys = [iT, rT];
          if (sh.swap) { fields.reverse(); chks.reverse(); keys.reverse(); }
          var wp = 'P', wq = 'Q';
          var p = K.P.fields('Find the <b>exact</b> total length of each route. Leave the route with radicals as a sum of radicals.', fields, chks, keys,
            I + ': ' + t(iT) + '; ' + R + ': ' + t(rT),
            '<b>' + I + '</b> (through ' + t(wp) + '): ' + legTex('AP', sh.A, sh.P) + ', ' + legTex('PB', sh.P, sh.B) + '. Total ' + t('=' + sh.ap + '+' + sh.pb + '=' + sh.R1) + '.<br><b>' + R + '</b> (through ' + t(wq) + '): ' + legTex('AQ', sh.A, sh.Q) + ', ' + legTex('QB', sh.Q, sh.B) + '. Total ' + t('=' + rT) + '.',
            ['Each route has two legs: find each leg’s length (subtract coordinates, then Pythagoras), then add.'], 'exact route totals');
          p.bad = [sh.swap ? [rT.replace(/\+.*/, ''), iT] : [iT, rT.replace(/\+.*/, '')]]; return p;
        } },
        { id: 'e6b', sub: 'b i', level: 'EMG', make: function (r, sh) {
          var f = [numField(sh.intName + ' ≈', sh.intName, 'units'), numField(sh.radName + ' ≈', sh.radName, 'units')], c = [K.approx(sh.R1, 1), K.approx(sh.R2, 1)], k = [dec(sh.R1, 1), dec(sh.R2, 1)];
          if (sh.swap) { f.reverse(); c.reverse(); k.reverse(); }
          var p = K.P.fields('Round both totals to the nearest tenth.', f, c, k, sh.intName + ' ' + t('\\approx ' + dec(sh.R1, 1)) + ', ' + sh.radName + ' ' + t('\\approx ' + dec(sh.R2, 1)),
            sh.intName + ': ' + t(sh.R1 + '=' + dec(sh.R1, 1)) + '. ' + sh.radName + ': ' + t(rt(sh.m) + '+' + rt(sh.n) + '\\approx ' + dec(Math.sqrt(sh.m), 5) + '+' + dec(Math.sqrt(sh.n), 5) + '=' + dec(sh.R2, 5) + '\\approx ' + dec(sh.R2, 1)) + '.', ['Use a calculator on the exact totals from (a).'], 'route totals rounded');
          p.bad = [[dec(sh.R1 + 1, 1), dec(sh.R2, 1)]]; return p;
        } },
        { id: 'e6b2', sub: 'b ii', level: 'EMG', make: function (r, sh) {
          return mcP(r, 'Why can’t the rounded values settle which route is shorter?', [
            { html: 'The totals differ by much less than ' + t('0.05') + ', so both round to the same tenth — rounding hides the difference.', right: true },
            { html: 'The two routes are exactly the same length.', why: 'They aren’t — one total is a whole number and the other is a sum of irrational square roots. Part (c) shows which is longer.' },
            { html: 'You can’t round a sum of radicals.', why: 'You can (each radical has a decimal value). The problem is that both totals round to the same value.' },
            { html: 'Rounding always makes the route with radicals look shorter.', why: 'Rounding can go up or down. Here both totals round to ' + t(dec(sh.R1, 1)) + '.' }],
            'The totals are ' + t(dec(sh.R1, 5)) + ' and ' + t(dec(sh.R2, 5)) + ': they differ by about ' + t(dec(Math.abs(sh.R2 - sh.R1), 4)) + ', far less than the rounding step of ' + t('0.1') + ', so both round to ' + t(dec(sh.R1, 1)) + '.', ['How far apart are the two totals compared with 0.1?'], 'why rounding fails');
        } },
        { id: 'e6c', sub: 'c i', level: 'ADV', make: function (r, sh) {
          var h = sh.h, H = h * h, mn = sh.m * sh.n, S = sh.m + sh.n, L2 = sh.R1 * sh.R1;
          var p = K.P.number('Settle it exactly. Square both totals: ' + t('(' + sh.intName.replace('Route ', '\\text{Route }') + ')^{2}=' + sh.R1 + '^{2}=' + L2) + ' and ' + t('(\\sqrt{' + sh.m + '}+\\sqrt{' + sh.n + '})^{2}=' + S + '+2\\sqrt{' + mn + '}') + '. Subtract ' + t(S) + ' from both, divide by ' + t('2') + ', then square both sides. You end up comparing ' + t(F(mn)) + ' with which whole number?', H, function (v) {
            if (v === h) return { code: 'no-sq-first', hint: 'You’re comparing ' + t('\\sqrt{' + mn + '}') + ' with ' + t(h) + '. Square both sides to compare whole numbers.' };
            if (v === 2 * h || v === 4 * H) return { code: 'diag', hint: 'Divide by 2 before squaring: ' + t('2\\sqrt{' + mn + '}') + ' vs ' + t(2 * h) + ' becomes ' + t('\\sqrt{' + mn + '}') + ' vs ' + t(h) + '.' };
            if (v === L2 - S) return { code: 'diag', hint: 'Now divide by 2, then square.' };
            return null;
          }, t(S + '+2\\sqrt{' + mn + '}') + ' vs ' + t(L2) + '. Subtract ' + t(S) + ': ' + t('2\\sqrt{' + mn + '}') + ' vs ' + t(L2 - S) + '. Divide by 2: ' + t('\\sqrt{' + mn + '}') + ' vs ' + t(h) + '. Square (both positive): ' + t(F(mn)) + ' vs ' + t(h + '^{2}=' + F(H)) + '.',
          ['Work step by step: ' + t(L2 + '-' + S) + ', then ÷ 2, then square.'], 'reduce comparison to whole numbers');
          p.bad = [String(h)]; return p;
        } },
        { id: 'e6c2', sub: 'c ii', level: 'PRG', make: function (r, sh) {
          var shorter = sh.R1 < sh.R2 ? sh.intName : sh.radName, longer = shorter === sh.intName ? sh.radName : sh.intName;
          return mcP(r, 'Since ' + t(F(sh.m * sh.n) + (sh.m * sh.n > sh.h * sh.h ? '\\gt ' : '\\lt ') + F(sh.h * sh.h)) + ', which route is shorter?', [
            { html: shorter, right: true },
            { html: longer, why: 'Follow the comparison back: ' + t(F(sh.m * sh.n) + (sh.m * sh.n > sh.h * sh.h ? '\\gt ' : '\\lt ') + F(sh.h * sh.h)) + ' means the square of the route with radicals is ' + (sh.R2 > sh.R1 ? 'bigger' : 'smaller') + ' — and so is the route.' },
            { html: 'They are exactly the same length.', why: 'The two whole numbers are different, so the routes can’t be equal.' },
            { html: 'It can’t be decided without a calculator.', why: 'Squaring turned it into a comparison of two whole numbers — no calculator needed.' }],
            t(F(sh.m * sh.n) + (sh.m * sh.n > sh.h * sh.h ? '\\gt ' : '\\lt ') + F(sh.h * sh.h)) + ', so the square of the radical route is ' + (sh.R2 > sh.R1 ? 'larger' : 'smaller') + '. Both totals are positive, so the radical route is ' + (sh.R2 > sh.R1 ? 'longer' : 'shorter') + ' (by less than ' + t('0.01') + '). <b>' + shorter + ' is shorter.</b>',
            ['If one positive number has the larger square, it is the larger number.'], 'which route shorter');
        } },
        { id: 'e6d', sub: 'd', level: 'EMG', make: function (r, sh) {
          return mcP(r, 'The straight segment ' + t('AB') + ' has length ' + t(sh.AB) + '. Why must <i>every</i> route with a waypoint off segment ' + t('AB') + ' be longer than ' + t(sh.AB) + '?', [
            { html: t('A') + ', the waypoint and ' + t('B') + ' form a triangle, and two sides of a triangle together are always longer than the third side.', right: true },
            { html: 'Every waypoint adds exactly the same extra distance.', why: 'The extra distance depends on where the waypoint is — the two routes here differ slightly.' },
            { html: 'Routes with radicals in their lengths are always longer.', why: 'Radicals have nothing to do with it; a route with whole-number legs can be longer too.' },
            { html: 'Because ' + t(sh.AB) + ' is a whole number.', why: 'Being a whole number doesn’t matter. Think about the triangle the waypoint makes with ' + t('A') + ' and ' + t('B') + '.' }],
            'For any waypoint ' + t('C') + ' off ' + t('AB') + ', the points ' + t('A, C, B') + ' form a triangle, so ' + t('AC+CB\\gt AB=' + sh.AB) + ': a straight segment is the shortest path between two points.', ['Picture the waypoint and the two endpoints as the corners of a triangle.'], 'triangle inequality');
        } }] },
      { num: '7', section: 'Extra practice C — Perimeter from coordinates', stem: function (sh) { return t('\\triangle ABC') + ' has vertices ' + t('A' + P2(sh.A)) + ', ' + t('B' + P2(sh.B)) + ' and ' + t('C' + P2(sh.C)) + '. Leave every perimeter as an exact sum of radicals first, then round only at the very end.'; }, shared: e7Shared, parts: [
        { id: 'e7a', sub: 'a', level: 'PRG', make: function (r, sh) { return sidesPart('Determine the exact length of each of the three sides.', [['AB', sh.A, sh.B], ['BC', sh.B, sh.C], ['CA', sh.C, sh.A]], 'triangle sides'); } },
        { id: 'e7b', sub: 'b', level: 'PRG', make: function (r, sh) {
          var per = sh.s.reduce(function (m, N) { return m + Math.sqrt(N); }, 0), pt = perimTex(sh.s);
          var p = K.P.fields('State the exact perimeter as a sum of radicals, then give it to the nearest tenth.', [radField('Exact:', 'Exact perimeter'), radField('≈', 'Nearest tenth')],
            [sumChk(per), K.approx(per, 1, { diag: function (v) { var rf = sh.s.reduce(function (m, N) { return m + K.roundTo(Math.sqrt(N), 1); }, 0); if (near(v, K.roundTo(rf, 1), 0.001) && K.roundTo(rf, 1) !== K.roundTo(per, 1)) return { code: 'round-first', hint: 'You rounded each side first. Add the exact values (or unrounded decimals) and round only at the end.' }; return null; } })],
            [pt, dec(per, 1)], t('P=' + pt + '\\approx ' + dec(per, 1)) + ' units',
            'Perimeter ' + t('=AB+BC+CA=' + sh.s.map(rt).join('+') + (pt !== sh.s.map(rt).join('+') ? '=' + pt : '')) + '<br>' + t('\\approx ' + sh.s.map(function (N) { return dec(Math.sqrt(N), 4); }).join('+') + '=' + dec(per, 4) + '\\approx ' + dec(per, 1)) + ' units.', ['Add the three exact side lengths from (a); collect any like radicals.'], 'exact perimeter');
          p.bad = [[sh.s.map(String).join('+'), dec(per + 0.3, 1)]]; return p;
        } },
        { id: 'e7c', sub: 'c', level: 'EMG', make: function (r, sh) {
          var L = sh.s.map(rt), nm = ['AB', 'BC', 'CA'], eqi = sh.s[0] === sh.s[1] ? [0, 1] : sh.s[1] === sh.s[2] ? [1, 2] : [0, 2];
          var opts = sh.iso ? [
            { html: 'Isosceles — the distance calculation shows exactly two equal sides, ' + t(nm[eqi[0]] + '=' + nm[eqi[1]] + '=' + L[eqi[0]]) + '.', right: true },
            { html: 'Scalene — the three sides look different on the grid.', why: 'Looks can mislead. Compare the exact lengths: ' + L.map(function (x, i) { return t(nm[i] + '=' + x); }).join(', ') + '.' },
            { html: 'Isosceles — counting squares along the sides shows two are equal.', why: 'None of the sides is horizontal or vertical, so you can’t count squares along them. The <b>distance calculation</b> settles it.' },
            { html: 'Equilateral — all three sides are equal.', why: 'Compare: ' + L.map(function (x, i) { return t(nm[i] + '=' + x); }).join(', ') + '. Only two are equal.' }] : [
            { html: 'Scalene — the distance calculation shows all three lengths are different.', right: true },
            { html: 'Isosceles — two of the sides look the same length.', why: 'Two sides are close, but compare the exact values: ' + L.map(function (x, i) { return t(nm[i] + '=' + x); }).join(', ') + '. No two are equal.' },
            { html: 'Scalene — counting squares along each side shows they are different.', why: 'None of the sides is horizontal or vertical, so counting squares can’t measure them. The <b>distance calculation</b> settles it.' },
            { html: 'Equilateral — all three sides are equal.', why: 'The exact lengths are all different.' }];
          return mcP(r, 'Is the triangle scalene, isosceles or equilateral — and which tool settles it: counting squares or the distance calculation?', opts,
            L.map(function (x, i) { return t(nm[i] + '=' + x + '\\approx ' + dec(Math.sqrt(sh.s[i]), 1)); }).join(', ') + '. ' + (sh.iso ? 'Exactly two are equal, so it is <b>isosceles</b>.' : 'All three are different, so it is <b>scalene</b>.') + ' Only the distance calculation can settle it: no side is horizontal or vertical, and close lengths can’t be judged by eye.', ['Compare the exact lengths from (a).'], 'classify triangle');
        } }] },
      { num: '8', stem: function (sh) { return 'Quadrilateral ' + t('PQRS') + ' has vertices ' + ['P', 'Q', 'R', 'S'].map(function (n, i) { return t(n + P2(sh.V[i])); }).join(', ') + '.'; }, shared: e8Shared, parts: [
        { id: 'e8a', sub: 'a', level: 'BEG', make: function (r, sh) { return polyPart('Plot the four vertices and join them in order ' + t('P\\to Q\\to R\\to S\\to P') + '.', sh.V, { x: [-7, 7], y: [-6, 7] }, ['P', 'Q', 'R', 'S'], 'plot quadrilateral'); } },
        { id: 'e8b', sub: 'b', level: 'PRG', make: function (r, sh) { var V = sh.V; return sidesPart('Determine the exact length of each of the four sides.', [['PQ', V[0], V[1]], ['QR', V[1], V[2]], ['RS', V[2], V[3]], ['SP', V[3], V[0]]], 'quadrilateral sides'); } },
        { id: 'e8c', sub: 'c', level: 'PRG', make: function (r, sh) {
          var pt = perimTex(sh.s);
          var p = K.P.fields('State the exact perimeter as a sum of radicals, then give it to the nearest tenth.', [radField('Exact:', 'Exact perimeter'), radField('≈', 'Nearest tenth')],
            [sumChk(sh.sumE), K.approx(sh.sumE, 1, { diag: function (v) { if (near(v, sh.sumR, 0.001)) return { code: 'round-first', hint: 'You rounded each side first. Round only at the very end.' }; return null; } })], [pt, dec(sh.sumE, 1)], t(pt + '\\approx ' + dec(sh.sumE, 1)) + ' units',
            'Perimeter ' + t('=' + sh.s.map(rt).join('+') + (pt !== sh.s.map(rt).join('+') ? '=' + pt : '')) + '<br>' + t('\\approx ' + sh.s.map(function (N) { return dec(Math.sqrt(N), 4); }).join('+') + '=' + dec(sh.sumE, 4) + '\\approx ' + dec(sh.sumE, 1)) + ' units.', ['Add the four exact sides from (b), then use a calculator once.'], 'quadrilateral perimeter');
          p.bad = [[pt, dec(sh.sumR, 1)]]; return p;
        } },
        { id: 'e8d', sub: 'd', level: 'EMG', make: function (r, sh) {
          var diff = Math.abs(K.roundTo(sh.sumE, 1) - sh.sumR);
          var p = K.P.fields('A classmate rounds each side to the nearest tenth first and then adds. What total does the classmate get, and by how much does it differ from your answer to (c)?', [numField('Classmate’s total:', 'Classmate’s total', 'units'), numField('Difference:', 'Difference', 'units')],
            [K.approx(sh.sumR, 1, { diag: function (v) { if (near(v, K.roundTo(sh.sumE, 1), 0.001)) return { code: 'round-first', hint: 'That’s the correct perimeter. Round <b>each side</b> to the nearest tenth first, then add those rounded values.' }; return null; } }), K.approx(diff, 1)],
            [dec(sh.sumR, 1), dec(diff, 1)], 'Classmate: ' + t(dec(sh.sumR, 1)) + '; difference ' + t(dec(diff, 1)) + ' (the answer from (c), ' + t(dec(sh.sumE, 1)) + ', is correct)',
            'Rounded sides: ' + t(sh.s.map(function (N) { return dec(Math.sqrt(N), 1); }).join('+') + '=' + dec(sh.sumR, 1)) + '. The correct perimeter is ' + t(dec(sh.sumE, 1)) + ', so they differ by ' + t(dec(diff, 1)) + '. Each rounding error is small, but they add up — round once, at the end.', ['Round each side from (b) to one decimal, then add.'], 'rounding first');
          p.bad = [[dec(sh.sumE, 1), '0']]; return p;
        } }] },
      { num: '9', stem: function (sh) { return 'Quadrilateral ' + t('WXYZ') + ' has vertices ' + ['W', 'X', 'Y', 'Z'].map(function (n) { return t(n + P2(sh[n])); }).join(', ') + '.'; }, shared: e9Shared, parts: [
        { id: 'e9a', sub: 'a', level: 'BEG', make: function (r, sh) { return polyPart('Plot and join ' + t('W\\to X\\to Y\\to Z\\to W') + '.', [sh.W, sh.X, sh.Y, sh.Z], sh.win, ['W', 'X', 'Y', 'Z'], 'plot kite'); } },
        { id: 'e9b', sub: 'b', level: 'PRG', make: function (r, sh) { return sidesPart('Determine the exact length of all four sides.', [['WX', sh.W, sh.X], ['XY', sh.X, sh.Y], ['YZ', sh.Y, sh.Z], ['ZW', sh.Z, sh.W]], 'kite sides'); } },
        { id: 'e9c1', sub: 'c i', level: 'BEG', make: function (r, sh) {
          return mcP(r, 'Two pairs of adjacent sides are equal, so ' + t('WXYZ') + ' is a <b>kite</b>. Which two pairs?', [
            { html: t('WX=ZW') + ' and ' + t('XY=YZ'), right: true },
            { html: t('WX=XY') + ' and ' + t('YZ=ZW'), why: 'Compare: ' + t('WX=' + rt(sh.n1)) + ' but ' + t('XY=' + rt(sh.n2)) + '.' },
            { html: t('WX=YZ') + ' and ' + t('XY=ZW'), why: 'Those are <b>opposite</b> sides (that would be a parallelogram). Check your lengths from (b).' },
            { html: 'All four sides are equal.', why: 'Only if the kite were a rhombus: ' + t(rt(sh.n1) + '\\ne ' + rt(sh.n2)) + '.' }],
            t('WX=ZW=' + rt(sh.n1)) + ' (the pair meeting at ' + t('W') + ') and ' + t('XY=YZ=' + rt(sh.n2)) + ' (the pair meeting at ' + t('Y') + ').', ['Use your four lengths from (b).'], 'kite equal pairs');
        } },
        { id: 'e9c2', sub: 'c ii', level: 'PRG', make: function (r, sh) {
          var sq = [sh.n1, sh.n2, sh.n2, sh.n1], per = 2 * Math.sqrt(sh.n1) + 2 * Math.sqrt(sh.n2), pt = perimTex(sq);
          var p = K.P.fields('State the exact perimeter of the kite and the decimal to the nearest tenth.', [radField('Exact:', 'Exact perimeter'), radField('≈', 'Nearest tenth')], [sumChk(per), K.approx(per, 1)], [pt, dec(per, 1)], t(pt + '\\approx ' + dec(per, 1)) + ' units',
            'Perimeter ' + t('=2(' + rt(sh.n1) + ')+2(' + rt(sh.n2) + ')=' + pt + '\\approx ' + dec(per, 1)) + ' units.', ['Two sides of each length: double each and add. Collect like radicals.'], 'kite perimeter');
          p.bad = [[rt(sh.n1) + '+' + rt(sh.n2), dec(per / 2, 1)]]; return p;
        } },
        { id: 'e9d', sub: 'd i', level: 'BEG', make: function (r, sh) {
          var wy = Math.abs(sh.W[1] - sh.Y[1]), xz = Math.abs(sh.X[0] - sh.Z[0]);
          var p = K.P.fields('State the lengths of the diagonals ' + t('WY') + ' and ' + t('XZ') + '.', [numField(t('WY='), 'WY', 'units'), numField(t('XZ='), 'XZ', 'units')], [K.number(wy), K.number(xz)], [String(wy), String(xz)], t('WY=' + wy) + ', ' + t('XZ=' + xz),
            t('W') + ' and ' + t('Y') + ' share ' + t('x=' + sh.W[0]) + ', so ' + t('WY') + ' is vertical: ' + t('|' + sub(sh.W[1], sh.Y[1]) + '|=' + wy) + '. ' + t('X') + ' and ' + t('Z') + ' share ' + t('y=' + sh.X[1]) + ', so ' + t('XZ') + ' is horizontal: ' + t('|' + sub(sh.X[0], sh.Z[0]) + '|=' + xz) + '.', ['Look at which coordinate each diagonal’s endpoints share.'], 'kite diagonals');
          p.bad = [[String(wy + 1), String(xz)]]; return p;
        } },
        { id: 'e9d2', sub: 'd ii', level: 'EMG', make: function (r, sh) {
          return mcP(r, 'Why are the diagonals ' + t('WY') + ' and ' + t('XZ') + ' easy to find without any radical?', [
            { html: t('WY') + ' is vertical and ' + t('XZ') + ' is horizontal, so one difference is ' + t('0') + ' and each length is a single subtraction.', right: true },
            { html: 'Diagonals of a kite are always whole numbers.', why: 'Not in general — these are whole numbers because they are vertical and horizontal on the grid.' },
            { html: 'The diagonals are shorter than the sides.', why: 'Length has nothing to do with it (and ' + t('WY') + ' is longer than every side). Look at the direction of each diagonal.' },
            { html: 'The diagonals cross at a right angle.', why: 'They do, but that isn’t why no radical is needed. One coordinate stays the same along each diagonal.' }],
            'For a horizontal or vertical segment one of the differences is ' + t('0') + ', so ' + t('\\sqrt{d^{2}+0^{2}}=d') + ': the length is just a subtraction.', ['What direction does each diagonal run?'], 'why diagonals need no radical');
        } }] },
      { num: '10', section: 'Extra practice D — Running the formula backwards', stem: 'Find <b>all</b> possible coordinates of the second endpoint. (Squaring loses a sign, so undoing it usually gives <b>two</b> possibilities.)', parts: [
        { id: 'e10a', sub: 'a', level: 'ADV', make: function (r) {
          var T = r.pick([[5, 12], [12, 5], [3, 4], [4, 3], [6, 8], [8, 6], [9, 12]]), L = Math.hypot(T[0], T[1]), ax = r.int(-6, 6), ay = r.int(-6, 6), bx = ax + sgn(r) * T[0], y1 = ay + T[1], y2 = ay - T[1];
          return pairsPart(t('A' + P2([ax, ay])) + ', and ' + t('B') + ' lies on the vertical line ' + t('x=' + bx) + ', with ' + t('AB=' + L) + '.', [[bx, y1], [bx, y2]],
            [{ is: [[bx, y1]], code: 'one-sol', hint: 'There is a second point: ' + t('(y' + (ay < 0 ? '+' + (-ay) : '-' + ay) + ')^{2}=' + T[1] * T[1]) + ' has <b>two</b> solutions, ' + t('\\pm' + T[1]) + '.' }, { is: [[bx, y2]], code: 'one-sol', hint: 'There is a second point: the square root gives ' + t('\\pm' + T[1]) + '.' },
              { is: [[bx, -ay + T[1]], [bx, -ay - T[1]]], code: 'shift-sign', hint: 'Check the sign when you undo the bracket: ' + t('' + mn('y', ay) + '=\\pm' + T[1]) + ', so ' + t('y=' + ay + '\\pm' + T[1]) + '.' }],
            t('B=(' + bx + ',\\ y)') + ': ' + t('(' + sub(bx, ax) + ')^{2}+(' + mn('y', ay) + ')^{2}=' + L + '^{2}') + ', so ' + t(T[0] * T[0] + '+(' + mn('y', ay) + ')^{2}=' + L * L) + ' and ' + t('(' + mn('y', ay) + ')^{2}=' + T[1] * T[1]) + '.<br>' + t('' + mn('y', ay) + '=\\pm' + T[1]) + ', so ' + t('y=' + y1) + ' or ' + t('y=' + y2) + ': ' + t('B(' + bx + ',\\ ' + y1 + ')') + ' or ' + t('B(' + bx + ',\\ ' + y2 + ')') + '.',
            ['Write ' + t('B=(' + bx + ',\\ y)') + ' and substitute into ' + t('(x_2-x_1)^{2}+(y_2-y_1)^{2}=' + L + '^{2}') + '.', 'A square equal to a positive number has two roots, ' + t('\\pm') + '.'], 'endpoint on vertical line');
        } },
        { id: 'e10b', sub: 'b', level: 'ADV', make: function (r) { return backH(r, 'C', 'D', [[5, 4], [4, 5], [3, 5], [5, 2], [2, 5], [4, 7]]); } },
        { id: 'e10c', sub: 'c', level: 'ADV', make: function (r) { return backH(r, 'E', 'F', [[5, 7], [7, 5], [3, 7], [6, 5], [4, 9]]); } },
        { id: 'e10d', sub: 'd', level: 'PRG', make: function (r) {
          var gx = r.int(-5, 5), gy = r.int(-5, 5), dd = r.int(4, 8), hx = gx + sgn(r) * dd, L = r.int(2, dd - 1);
          return mcP(r, t('G' + P2([gx, gy])) + ', and ' + t('H') + ' lies on the vertical line ' + t('x=' + hx) + ', with ' + t('GH=' + L) + '. What are the possible points ' + t('H') + '?', [
            { html: 'No such point exists: every point of ' + t('x=' + hx) + ' is at least ' + t(dd) + ' from ' + t('G') + ', and ' + t(L + '\\lt ' + dd) + '.', right: true },
            { html: t('(' + hx + ',\\ ' + (gy + L) + ')') + ' or ' + t('(' + hx + ',\\ ' + (gy - L) + ')'), why: 'Check one: the distance from ' + t('G') + ' to ' + t('(' + hx + ',\\ ' + (gy + L) + ')') + ' is ' + t('\\sqrt{' + dd + '^{2}+' + L + '^{2}}') + ', not ' + t(L) + '.' },
            { html: t('(' + hx + ',\\ ' + gy + ')') + ' only', why: 'That point is ' + t(dd) + ' from ' + t('G') + ' — the shortest distance to the line, but not ' + t(L) + '.' },
            { html: t('(' + (gx + L) + ',\\ ' + gy + ')') + ' only', why: 'That point isn’t on the line ' + t('x=' + hx) + '.' }],
            t('H=(' + hx + ',\\ y)') + ': ' + t(dd + '^{2}+(' + mn('y', gy) + ')^{2}=' + L + '^{2}') + ' gives ' + t('(' + mn('y', gy) + ')^{2}=' + (L * L - dd * dd)) + ', which is impossible (a square is never negative).<br>The shortest distance from ' + t('G') + ' to the line ' + t('x=' + hx) + ' is straight across, ' + t(dd) + ' units, and ' + t(L + '\\lt ' + dd) + ', so <b>no such point exists</b>.', ['How far is ' + t('G') + ' from the line ' + t('x=' + hx) + ' at its closest?'], 'no endpoint possible');
        } }] },
      { num: '11', stem: 'Find <b>all</b> possible coordinates of the second endpoint.', parts: [
        { id: 'e11a', sub: 'a', level: 'ADV', make: function (r) {
          var T = r.pick([[6, 8], [8, 6], [3, 4], [4, 3], [5, 12], [12, 5]]), L = Math.hypot(T[0], T[1]), px = sgn(r) * T[0], py = r.int(-5, 5), y1 = py + T[1], y2 = py - T[1];
          return pairsPart(t('P' + P2([px, py])) + ', and the second endpoint is on the ' + t('y') + '-axis, a distance of ' + t(L) + ' from ' + t('P') + '.', [[0, y1], [0, y2]],
            [{ is: [[0, y1]], code: 'one-sol', hint: 'There is a second point — the square root gives ' + t('\\pm') + '.' }, { is: [[0, y2]], code: 'one-sol', hint: 'There is a second point — the square root gives ' + t('\\pm') + '.' }, { is: [[y1, 0], [y2, 0]], code: 'pairs-flip', hint: 'A point on the ' + t('y') + '-axis has ' + t('x=0') + ': ' + t('(0,\\ y)') + '.' }],
            'On the ' + t('y') + '-axis, ' + t('x=0') + ': ' + t('(0,\\ y)') + '. ' + t('(0-' + pr(px) + ')^{2}+(' + mn('y', py) + ')^{2}=' + L + '^{2}') + ', so ' + t(T[0] * T[0] + '+(' + mn('y', py) + ')^{2}=' + L * L) + ', ' + t('(' + mn('y', py) + ')^{2}=' + T[1] * T[1]) + ', ' + t('y=' + py + '\\pm' + T[1]) + ': ' + t('(0,\\ ' + y1 + ')') + ' or ' + t('(0,\\ ' + y2 + ')') + '.',
            ['A point on the ' + t('y') + '-axis is ' + t('(0,\\ y)') + '.', 'Use the distance formula, then take ' + t('\\pm') + ' the square root.'], 'endpoint on y-axis');
        } },
        { id: 'e11b', sub: 'b', level: 'ADV', make: function (r) {
          var T = r.pick([[12, 5], [5, 12], [4, 3], [3, 4], [8, 6], [6, 8]]), L = Math.hypot(T[0], T[1]), qy = sgn(r) * T[0], qx = r.int(-6, 6), x1 = qx + T[1], x2 = qx - T[1];
          return pairsPart(t('Q' + P2([qx, qy])) + ', and the second endpoint is on the ' + t('x') + '-axis, a distance of ' + t(L) + ' from ' + t('Q') + '.', [[x1, 0], [x2, 0]],
            [{ is: [[x1, 0]], code: 'one-sol', hint: 'There is a second point — the square root gives ' + t('\\pm') + '.' }, { is: [[x2, 0]], code: 'one-sol', hint: 'There is a second point — the square root gives ' + t('\\pm') + '.' }, { is: [[0, x1], [0, x2]], code: 'pairs-flip', hint: 'A point on the ' + t('x') + '-axis has ' + t('y=0') + ': ' + t('(x,\\ 0)') + '.' }],
            'On the ' + t('x') + '-axis, ' + t('y=0') + ': ' + t('(x,\\ 0)') + '. ' + t('(' + mn('x', qx) + ')^{2}+(0-' + pr(qy) + ')^{2}=' + L + '^{2}') + ', so ' + t('(' + mn('x', qx) + ')^{2}=' + (L * L - T[0] * T[0])) + ', ' + t('x=' + qx + '\\pm' + T[1]) + ': ' + t('(' + x1 + ',\\ 0)') + ' or ' + t('(' + x2 + ',\\ 0)') + '.',
            ['A point on the ' + t('x') + '-axis is ' + t('(x,\\ 0)') + '.'], 'endpoint on x-axis');
        } },
        { id: 'e11c', sub: 'c', level: 'ADV', make: function (r) {
          var rx = r.int(-6, 6), d = r.int(3, 8), ry = sgn(r) * d;
          var p = pairsPart(t('R' + P2([rx, ry])) + ', and the second endpoint is on the ' + t('x') + '-axis, a distance of ' + t(d) + ' from ' + t('R') + '. (Why is there only one answer here?)', [[rx, 0]],
            [{ is: [[rx + d, 0], [rx - d, 0]], code: 'diag', hint: 'Check those: ' + t('(' + (rx + d) + ',\\ 0)') + ' is ' + t('\\sqrt{' + d + '^{2}+' + d + '^{2}}') + ' from ' + t('R') + ', not ' + t(d) + '.' }, { is: [[0, rx]], code: 'pairs-flip', hint: 'A point on the ' + t('x') + '-axis is ' + t('(x,\\ 0)') + '.' }],
            '(x, 0): ' + t('(' + mn('x', rx) + ')^{2}+(0-' + pr(ry) + ')^{2}=' + d + '^{2}') + ' gives ' + t('(' + mn('x', rx) + ')^{2}=0') + ', so ' + t('x=' + rx) + ' only: ' + t('(' + rx + ',\\ 0)') + '.<br>' + t('R') + ' is exactly ' + t(d) + ' from the ' + t('x') + '-axis, so ' + t(d) + ' is the <b>shortest</b> distance to the axis: ' + t('\\pm 0') + ' gives just one point, straight ' + (ry < 0 ? 'above' : 'below') + ' ' + t('R') + '.',
            ['How far is ' + t('R') + ' from the ' + t('x') + '-axis at its closest?'], 'one endpoint only');
          p.bad = ['(' + (rx + d) + ', 0), (' + (rx - d) + ', 0)']; return p;
        } }] },
      { num: '12', section: 'Extra practice E — Solving for a parameter', stem: 'In each case the endpoints contain an unknown ' + t('k') + '. Determine <b>all</b> values of ' + t('k') + ' that give the stated length.', parts: [
        { id: 'e12a', sub: 'a', level: 'ADV', make: function (r) {
          var T = r.pick([[4, 3], [3, 4], [12, 5], [8, 6], [6, 8]]), L = Math.hypot(T[0], T[1]), ax = r.int(-5, 5), ay = r.int(-5, 5), by = ay + sgn(r) * T[0];
          return kPart(t('A' + P2([ax, ay])) + ' to ' + t('B(k,\\ ' + by + ')') + ' has length ' + t(L) + '.', [ax + T[1], ax - T[1]],
            t('(' + mn('k', ax) + ')^{2}+(' + sub(by, ay) + ')^{2}=' + L + '^{2}') + ', so ' + t('(' + mn('k', ax) + ')^{2}+' + T[0] * T[0] + '=' + L * L) + ', ' + t('(' + mn('k', ax) + ')^{2}=' + T[1] * T[1]) + ', ' + t('' + mn('k', ax) + '=\\pm' + T[1]) + ': ' + t('k=' + (ax + T[1])) + ' or ' + t('k=' + (ax - T[1])) + '.', 'k in an x-coordinate');
        } },
        { id: 'e12b', sub: 'b', level: 'ADV', make: function (r) {
          var T = r.pick([[8, 6], [6, 8], [3, 4], [12, 5], [5, 12]]), L = Math.hypot(T[0], T[1]), px = r.int(-6, 2), qx = px + T[0], qy = r.int(-4, 5);
          return kPart(t('P(' + px + ',\\ k)') + ' to ' + t('Q' + P2([qx, qy])) + ' has length ' + t(L) + '.', [qy + T[1], qy - T[1]],
            t('(' + sub(qx, px) + ')^{2}+(' + qy + '-k)^{2}=' + L + '^{2}') + ', so ' + t(T[0] * T[0] + '+(' + qy + '-k)^{2}=' + L * L) + ', ' + t('(' + qy + '-k)^{2}=' + T[1] * T[1]) + ', ' + t(qy + '-k=\\pm' + T[1]) + ': ' + t('k=' + (qy - T[1])) + ' or ' + t('k=' + (qy + T[1])) + '.', 'k in a y-coordinate');
        } },
        { id: 'e12c', sub: 'c', level: 'MAS', make: function (r) {
          var nx, ny, k1, k2, L2;
          for (var i = 0; i < 200; i++) { nx = r.int(-6, 7); ny = r.int(-6, 6); k1 = r.int(-6, 7); k2 = nx + ny - k1; L2 = nx * nx + ny * ny - 2 * k1 * k2; if (k1 !== k2 && L2 > 0 && !isSq(L2) && hasSqF(L2) && Math.abs(k2) <= 9 && nx !== ny) break; }
          if (!(k1 !== k2 && L2 > 0 && !isSq(L2) && hasSqF(L2))) { nx = 6; ny = -2; k1 = 5; k2 = -1; L2 = 50; }
          var S = nx + ny, Pc = (nx * nx + ny * ny - L2) / 2;
          return kPart(t('M(k,\\ k)') + ' to ' + t('N' + P2([nx, ny])) + ' has length ' + t(rt(L2)) + '.', [k1, k2],
            t('(' + nx + '-k)^{2}+(' + ny + '-k)^{2}=(' + rt(L2) + ')^{2}=' + L2) + '<br>' + t('2k^{2}' + (S ? (-2 * S > 0 ? '+' : '-') + Math.abs(2 * S) + 'k' : '') + '+' + (nx * nx + ny * ny) + '=' + L2) + ', so ' + t('k^{2}' + (S ? (-S > 0 ? '+' : '-') + (Math.abs(S) === 1 ? '' : Math.abs(S)) + 'k' : '') + (Pc ? (Pc > 0 ? '+' : '-') + Math.abs(Pc) : '') + '=0') + '.<br>' + t('(' + mn('k', k1) + ')(' + mn('k', k2) + ')=0') + ': ' + t('k=' + k1) + ' or ' + t('k=' + k2) + '.', 'k in both coordinates');
        } },
        { id: 'e12d', sub: 'd', level: 'PRG', make: function (r) {
          return mcP(r, 'In part (c) both coordinates of ' + t('M') + ' contained ' + t('k') + ', so squaring produced ' + t('k^{2}') + ' terms from <i>both</i> brackets. Why is the equation still only a quadratic — with at most two answers?', [
            { html: 'Each bracket squares to a single ' + t('k^{2}') + ' term and the two are <b>added</b> (giving ' + t('2k^{2}') + '); nothing multiplies ' + t('k^{2}') + ' by ' + t('k') + ', so the highest power is ' + t('2') + '.', right: true },
            { html: 'The two ' + t('k^{2}') + ' terms cancel, so it is really a linear equation.', why: 'They don’t cancel: ' + t('k^{2}+k^{2}=2k^{2}') + '. And a linear equation would have only one answer, but (c) has two.' },
            { html: 'Squaring twice gives ' + t('k^{4}') + ', which has at most two roots.', why: 'No ' + t('k^{4}') + ' appears: the squares are added, not multiplied.' },
            { html: 'Because the length is a radical.', why: 'Squaring the length gives a whole number either way. Look at the highest power of ' + t('k') + '.' }],
            'Each bracket gives one ' + t('k^{2}') + ' term; adding them gives ' + t('2k^{2}') + '. No ' + t('k^{3}') + ' or ' + t('k^{4}') + ' appears, so the equation is a quadratic, and a quadratic has at most two real solutions.', ['What is the highest power of ' + t('k') + ' after you expand?'], 'why quadratic');
        } }] },
      { num: '13', section: 'Extra practice F — Error analysis', stem: function (sh) { var dx = sh.B[0] - sh.A[0], dy = sh.B[1] - sh.A[1]; return 'Asked for the length of the segment from ' + t('A' + P2(sh.A)) + ' to ' + t('B' + P2(sh.B)) + ', a student writes:' + '\\[AB=(x_2-x_1)+(y_2-y_1)=(' + sub(sh.B[0], sh.A[0]) + ')+(' + sub(sh.B[1], sh.A[1]) + ')=' + dx + '+' + pr(dy) + '=' + (dx + dy) + '.\\]'; },
        shared: function (r) { var T = r.pick([[6, 8], [3, 4], [5, 12], [9, 12], [4, 7], [2, 5], [3, 6]]); for (var i = 0; i < 100; i++) { var A = [r.int(-6, 4), r.int(-2, 8)], B = [A[0] + T[0], A[1] - T[1]]; if (Math.abs(B[1]) <= 12) return { A: A, B: B }; } return { A: [-2, 5], B: [4, -3] }; }, parts: [
        { id: 'e13a', sub: 'a', level: 'EMG', make: function (r) {
          return mcP(r, 'The student’s subtraction is correct. Which two steps of the distance formula did they leave out?', [
            { html: '<b>Squaring</b> each difference, and taking the <b>square root</b> of the sum.', right: true },
            { html: 'Taking the absolute value of each difference.', why: 'That would give run + rise, still not the length. The formula is ' + t('\\sqrt{(x_2-x_1)^{2}+(y_2-y_1)^{2}}') + '.' },
            { html: 'Dividing the sum by ' + t('2') + '.', why: 'Dividing by 2 belongs to the midpoint formula, not the distance formula.' },
            { html: 'Subtracting the coordinates in the same order.', why: 'They did subtract in the same order (' + t('B') + ' minus ' + t('A') + '). That isn’t the problem.' }],
            'The distance formula is ' + t('\\sqrt{(x_2-x_1)^{2}+(y_2-y_1)^{2}}') + ': square each difference, add, then take the square root. The student skipped the squaring and the square root.', ['Write out the full distance formula and compare.'], 'missing steps');
        } },
        { id: 'e13b', sub: 'b', level: 'LIM', make: function (r, sh) {
          var v = (sh.B[0] - sh.A[0]) + (sh.B[1] - sh.A[1]);
          return mcP(r, 'Their answer is ' + t(v) + '. Why did it have to be wrong, from the meaning of the word <i>length</i>, before any checking?', [
            { html: 'A length is a distance, and a distance can never be negative.', right: true },
            { html: 'A length must be a whole number.', why: 'Lengths are often irrational, like ' + t('\\sqrt{2}') + '. The problem is the sign.' },
            { html: 'A length must be bigger than both coordinates.', why: 'There is no such rule. Think about the sign of a distance.' },
            { html: 'Because ' + t('B') + ' is below ' + t('A') + '.', why: 'Where the points are doesn’t make a length negative — a distance is never negative.' }],
            'A length measures how far apart two points are, so it is never negative. ' + t(v) + ' is impossible.', ['Can a distance be negative?'], 'length never negative');
        } },
        { id: 'e13c', sub: 'c', level: 'BEG', make: function (r, sh) { return lenPart('Determine the correct length of ' + t('AB') + ', exactly and to the nearest tenth.', 'AB', sh.A, sh.B, 1); } },
        { id: 'e13d', sub: 'd', level: 'EMG', make: function (r, sh) {
          var dx = sh.B[0] - sh.A[0], dy = sh.B[1] - sh.A[1];
          return mcP(r, 'What does squaring do to the two differences that makes the order of the endpoints — ' + t('A') + ' to ' + t('B') + ' or ' + t('B') + ' to ' + t('A') + ' — stop mattering?', [
            { html: 'Reversing the endpoints only changes the <b>sign</b> of each difference, and squaring removes the sign: ' + t(pr(dx) + '^{2}=' + pr(-dx) + '^{2}') + '.', right: true },
            { html: 'Squaring makes the numbers bigger, so small differences stop mattering.', why: 'Size isn’t the point. Compare ' + t(pr(dy) + '^{2}') + ' and ' + t(pr(-dy) + '^{2}') + '.' },
            { html: 'The square root of a negative number is positive.', why: 'The square root of a negative isn’t a real number at all. The squares are never negative in the first place.' },
            { html: 'Squaring adds the two differences together.', why: 'Each difference is squared separately; the squares are then added.' }],
            'From ' + t('B') + ' to ' + t('A') + ' the differences are ' + t(-dx) + ' and ' + t(-dy) + ' instead of ' + t(dx) + ' and ' + t(dy) + ' — only the signs change. Squaring removes the sign (' + t(pr(dx) + '^{2}=' + pr(-dx) + '^{2}=' + dx * dx) + '), so the sum under the radical, and the length, are the same either way.', ['What is ' + t('(-6)^{2}') + ' compared with ' + t('6^{2}') + '?'], 'order does not matter');
        } }] },
      { num: '14', stem: function (sh) { return 'A second student simplifies every distance the same way: ' + t('\\sqrt{a^{2}+b^{2}}=a+b') + ', so for legs ' + t(sh.a) + ' and ' + t(sh.b) + ', ' + t('\\sqrt{' + sh.a + '^{2}+' + sh.b + '^{2}}=' + sh.a + '+' + sh.b + '=' + (sh.a + sh.b)) + '.'; },
        shared: function (r) { var T = r.pick([[9, 12], [6, 8], [5, 12], [8, 15], [12, 16], [7, 24], [12, 9]]); return { a: T[0], b: T[1], c: Math.hypot(T[0], T[1]) }; }, parts: [
        { id: 'e14a', sub: 'a', level: 'BEG', make: function (r, sh) {
          var p = K.P.fields('Compute ' + t('\\sqrt{' + sh.a + '^{2}+' + sh.b + '^{2}}') + ' correctly, and state by how much the student is out.', [numField(t('\\sqrt{' + sh.a + '^{2}+' + sh.b + '^{2}}='), 'Correct value'), numField('The student is too large by', 'Difference')],
            [K.number(sh.c, function (v) { return v === sh.a * sh.a + sh.b * sh.b ? { code: 'no-root', hint: 'Take the square root of the sum.' } : v === sh.a + sh.b ? { code: 'add-legs', hint: 'That’s the student’s answer. Square, add, then take the square root.' } : null; }), K.number(sh.a + sh.b - sh.c)],
            [String(sh.c), String(sh.a + sh.b - sh.c)], t('\\sqrt{' + sh.a + '^{2}+' + sh.b + '^{2}}=' + sh.c) + '; too large by ' + t(sh.a + sh.b - sh.c),
            t('\\sqrt{' + sh.a + '^{2}+' + sh.b + '^{2}}=\\sqrt{' + sh.a * sh.a + '+' + sh.b * sh.b + '}=\\sqrt{' + sh.c * sh.c + '}=' + sh.c) + '. ' + t((sh.a + sh.b) + '-' + sh.c + '=' + (sh.a + sh.b - sh.c)) + ': the student is ' + t(sh.a + sh.b - sh.c) + ' too large.', ['Square each leg, add, then take the square root.'], 'correct the a+b error');
          p.bad = [[String(sh.a + sh.b), '0']]; return p;
        } },
        { id: 'e14b', sub: 'b', level: 'EMG', make: function (r, sh) {
          return mcP(r, 'The student’s answer is the sum of the two legs. Why can the hypotenuse never equal that sum?', [
            { html: 'The hypotenuse is the straight path between two corners; going along both legs is a detour, so it is always longer: ' + t('c\\lt a+b') + '.', right: true },
            { html: 'The hypotenuse is always exactly half the sum of the legs.', why: 'Test it: ' + t(sh.c) + ' is not half of ' + t(sh.a + sh.b) + '.' },
            { html: 'The sum is too big only because these legs are large numbers.', why: 'It happens for every right triangle, even legs ' + t('3') + ' and ' + t('4') + ' (' + t('5\\lt 7') + ').' },
            { html: 'It can — whenever the two legs are equal.', why: 'Legs ' + t('5') + ' and ' + t('5') + ' give ' + t('\\sqrt{50}\\approx 7.1') + ', not ' + t('10') + '.' }],
            'The hypotenuse joins two vertices directly; travelling along the two legs reaches the same point the long way round. A straight segment is the shortest path, so ' + t('c\\lt a+b') + ' (here ' + t(sh.c + '\\lt ' + (sh.a + sh.b)) + ').', ['Which is shorter: walking straight across, or along two sides?'], 'hypotenuse less than sum');
        } },
        { id: 'e14c', sub: 'c', level: 'PRG', make: function (r) {
          return mcP(r, 'There <i>is</i> a case where ' + t('\\sqrt{a^{2}+b^{2}}=a+b') + ' is true for ' + t('a,\\ b\\ge 0') + '. Which is it, and what segment does it describe?', [
            { html: t('a=0') + ' or ' + t('b=0') + ': a horizontal or vertical segment.', right: true },
            { html: t('a=b') + ': a segment at ' + t('45^{\\circ}') + '.', why: 'Then ' + t('\\sqrt{2a^{2}}=a\\sqrt{2}') + ', which is less than ' + t('2a') + ' (unless ' + t('a=0') + ').' },
            { html: t('a=b=1') + ': a one-square diagonal.', why: t('\\sqrt{1+1}=\\sqrt{2}\\approx 1.41') + ', not ' + t('2') + '.' },
            { html: 'It is never true.', why: 'Try ' + t('a=0') + ': ' + t('\\sqrt{0+b^{2}}=b=0+b') + '.' }],
            'Square both sides: ' + t('a^{2}+b^{2}=a^{2}+2ab+b^{2}') + ', so ' + t('2ab=0') + ': ' + t('a=0') + ' or ' + t('b=0') + '. E.g. ' + t('\\sqrt{0^{2}+7^{2}}=7=0+7') + '. One leg is 0, so the segment is horizontal or vertical (no triangle at all).', ['Square both sides and simplify.'], 'when sqrt(a²+b²)=a+b');
        } },
        { id: 'e14d', sub: 'd', level: 'EMG', make: function (r, sh) {
          return mcP(r, 'Which rule describes the student’s mistake?', [
            { html: 'A square root may not be distributed across <b>addition</b>: ' + t('\\sqrt{a^{2}+b^{2}}\\ne a+b') + ' (e.g. ' + t('\\sqrt{' + sh.a + '^{2}+' + sh.b + '^{2}}=' + sh.c) + ' but ' + t(sh.a + '+' + sh.b + '=' + (sh.a + sh.b)) + ').', right: true },
            { html: 'A square root may not be distributed across <b>multiplication</b>: ' + t('\\sqrt{ab}\\ne\\sqrt{a}\\sqrt{b}') + '.', why: 'That one actually <b>is</b> allowed for positive numbers: ' + t('\\sqrt{4\\times 9}=\\sqrt{4}\\sqrt{9}=6') + '. The problem is addition.' },
            { html: 'Squares can never be added.', why: 'They can — the Pythagorean theorem adds them. The error is taking the root of each term separately.' },
            { html: t('\\sqrt{a^{2}}\\ne a') + ' for positive ' + t('a') + '.', why: 'For positive ' + t('a') + ', ' + t('\\sqrt{a^{2}}=a') + '. The mistake is splitting the root across the +.' }],
            'A square root does not split over a sum: ' + t('\\sqrt{a^{2}+b^{2}}\\ne\\sqrt{a^{2}}+\\sqrt{b^{2}}') + '. Counterexample: ' + t('\\sqrt{' + sh.a + '^{2}+' + sh.b + '^{2}}=' + sh.c + '\\ne ' + (sh.a + sh.b)) + '.', ['Is ' + t('\\sqrt{9+16}') + ' equal to ' + t('\\sqrt{9}+\\sqrt{16}') + '?'], 'root over a sum');
        } }] },
      { num: '15', section: 'Extra practice G — Multiple choice and numerical response', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: 'e15', level: 'PRG', make: function (r) {
          var hv, ax, ay, by, h, v, N;
          for (var i = 0; i < 100; i++) { h = r.int(3, 9); v = r.int(2, 7); N = h * h + v * v; ax = r.int(-6, 4); ay = r.int(-3, 5); by = ay - sgn(r) * v; if (!isSq(N) && h !== v) break; }
          var x1 = ax + h, x2 = ax - h;
          return mcP(r, 'Segment ' + t('AB') + ' has endpoint ' + t('A' + P2([ax, ay])) + ' and length ' + t('\\sqrt{' + N + '}') + '. Point ' + t('B') + ' lies on the line ' + t('y=' + by) + '. The possible ' + t('x') + '-coordinates of ' + t('B') + ' are', [
            { html: t(x1) + ' only', why: 'Squaring loses the sign: ' + t('(' + mn('x', ax) + ')^{2}=' + h * h) + ' has <b>two</b> solutions.' },
            { html: t(x2) + ' only', why: 'Squaring loses the sign: ' + t('(' + mn('x', ax) + ')^{2}=' + h * h) + ' has <b>two</b> solutions.' },
            { html: t(x1) + ' or ' + t(x2), right: true },
            { html: 'no such point exists', why: 'The line is only ' + t(v) + ' units from ' + t('A') + ', and ' + t('\\sqrt{' + N + '}\\gt ' + v) + ', so the circle of that radius does reach it — twice.' }],
            t('B=(x,\\ ' + by + ')') + ': ' + t('(' + mn('x', ax) + ')^{2}+(' + sub(by, ay) + ')^{2}=' + N) + ', ' + t('(' + mn('x', ax) + ')^{2}+' + v * v + '=' + N) + ', ' + t('(' + mn('x', ax) + ')^{2}=' + h * h) + ', ' + t('x=' + ax + '\\pm' + h) + ': ' + t(x1) + ' or ' + t(x2) + '.', ['Substitute ' + t('B=(x,\\ ' + by + ')') + ' into the distance formula and solve.'], 'MC possible x of B');
        } }] },
      { num: '16', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: 'e16', level: 'PRG', make: function (r) {
          var g = r.pick([6, 10]), pq = r.pick([[2, 3], [3, 2], [1, 2], [2, 1], [1, 3], [3, 1]]), m = pq[0] * pq[0] + pq[1] * pq[1], A = [r.int(-9, -4), r.int(-9, -4)];
          var B = [A[0] + g * pq[0], A[1] + g * pq[1]], f = g === 6 ? [[2, 9], [3, 4]] : [[2, 25], [5, 4]], big = g * Math.max(pq[0], pq[1]);
          return mcP(r, 'The exact length of the segment from ' + t(P2(A)) + ' to ' + t(P2(B)) + ', written as a mixed radical <b>in simplest form</b>, is', [
            { html: t(f[0][0] + '\\sqrt{' + f[0][1] * m + '}'), why: 'That has the right value, but ' + t(f[0][1] * m + '=' + f[0][1] + '\\times ' + m) + ' still has a perfect-square factor — it isn’t simplest form.' },
            { html: t(g + '\\sqrt{' + m + '}'), right: true },
            { html: t(f[1][0] + '\\sqrt{' + f[1][1] * m + '}'), why: 'Right value, but ' + t(f[1][1] * m + '=' + f[1][1] + '\\times ' + m) + ' still contains a perfect square. Take out the <b>largest</b> square factor.' },
            { html: t(big + '\\sqrt{2}'), why: 'That is ' + t('\\sqrt{' + 2 * big * big + '}') + ', a different number. Compute ' + t('\\sqrt{' + g * pq[0] + '^{2}+' + g * pq[1] + '^{2}}') + '.' }],
            t('\\sqrt{' + g * pq[0] + '^{2}+' + g * pq[1] + '^{2}}=\\sqrt{' + g * g * pq[0] * pq[0] + '+' + g * g * pq[1] * pq[1] + '}=\\sqrt{' + g * g * m + '}=\\sqrt{' + g * g + '\\times ' + m + '}=' + g + '\\sqrt{' + m + '}') + '. ' + t(f[0][0] + '\\sqrt{' + f[0][1] * m + '}') + ' and ' + t(f[1][0] + '\\sqrt{' + f[1][1] * m + '}') + ' have the same value but aren’t in simplest form; ' + t(big + '\\sqrt{2}') + ' is a different number.', ['Find ' + t('\\sqrt{\\text{run}^{2}+\\text{rise}^{2}}') + ', then take out the <b>largest</b> perfect-square factor.'], 'MC simplest mixed radical length');
        } }] },
      { num: '17', stem: '<i>(Numerical Response)</i>', parts: [
        { id: 'e17', level: 'PRG', make: function (r) {
          var T = rightTri(r, [[9, 12], [12, 9], [6, 8], [8, 6], [5, 12], [12, 5], [8, 15]], true), A = T.Q, B = T.R, C = T.P, per = T.v + T.h + Math.sqrt(T.N);
          return K.P.nr(t('\\triangle ABC') + ' has vertices ' + t('A' + P2(A)) + ', ' + t('B' + P2(B)) + ' and ' + t('C' + P2(C)) + '. The perimeter of ' + t('\\triangle ABC') + ', in units, is ________.', per, function (v) {
            if (v === T.v + T.h) return { code: 'perim-side', hint: 'Add the third side ' + t('AB') + ' (the hypotenuse).' };
            if (v === 2 * (T.v + T.h)) return { code: 'add-legs', hint: 'The hypotenuse isn’t the sum of the legs: use ' + t('\\sqrt{a^{2}+b^{2}}') + '.' };
            if (v === T.v + T.h + T.N) return { code: 'no-root', hint: 'Take the square root for ' + t('AB') + ' before adding.' };
            return null;
          }, t('A') + ' and ' + t('C') + ' share ' + t('x=' + C[0]) + ': ' + t('CA=' + T.v) + ' (vertical). ' + t('C') + ' and ' + t('B') + ' share ' + t('y=' + C[1]) + ': ' + t('BC=' + T.h) + ' (horizontal). The right angle is at ' + t('C') + ', so ' + t('AB=\\sqrt{' + T.h + '^{2}+' + T.v + '^{2}}=\\sqrt{' + T.N + '}=' + Math.sqrt(T.N)) + '.<br>Perimeter ' + t('=' + T.v + '+' + T.h + '+' + Math.sqrt(T.N) + '=' + per) + ' units.',
          ['Two sides are horizontal and vertical. The third is the hypotenuse.'], 'NR perimeter (triple)');
        } }] }
    ]
  });

  /* ---------- makers that use the helpers above ---------- */
  function backH(r, n1, n2, legsList) { // endpoint on a horizontal line with a radical length
    var T = r.pick(legsList), N = T[0] * T[0] + T[1] * T[1], cx = r.int(-6, 4), cy = r.int(-4, 4), dy = cy + sgn(r) * T[0], x1 = cx + T[1], x2 = cx - T[1];
    if (isSq(N)) { T = [5, 4]; N = 41; }
    return pairsPart(t(n1 + P2([cx, cy])) + ', and ' + t(n2) + ' lies on the horizontal line ' + t('y=' + dy) + ', with ' + t(n1 + n2 + '=\\sqrt{' + N + '}') + '.', [[x1, dy], [x2, dy]],
      [{ is: [[x1, dy]], code: 'one-sol', hint: 'There is a second point: ' + t('(' + mn('x', cx) + ')^{2}=' + T[1] * T[1]) + ' has two solutions, ' + t('\\pm' + T[1]) + '.' }, { is: [[x2, dy]], code: 'one-sol', hint: 'There is a second point — the square root gives ' + t('\\pm' + T[1]) + '.' },
        { is: [[-cx + T[1], dy], [-cx - T[1], dy]], code: 'shift-sign', hint: 'Check the sign when you undo the bracket: ' + t('' + mn('x', cx) + '=\\pm' + T[1]) + ', so ' + t('x=' + cx + '\\pm' + T[1]) + '.' }],
      t(n2 + '=(x,\\ ' + dy + ')') + ': ' + t('(' + mn('x', cx) + ')^{2}+(' + sub(dy, cy) + ')^{2}=(\\sqrt{' + N + '})^{2}') + ', so ' + t('(' + mn('x', cx) + ')^{2}+' + T[0] * T[0] + '=' + N) + ', ' + t('(' + mn('x', cx) + ')^{2}=' + T[1] * T[1]) + ', ' + t('x=' + cx + '\\pm' + T[1]) + ': ' + t(n2 + '(' + x1 + ',\\ ' + dy + ')') + ' or ' + t(n2 + '(' + x2 + ',\\ ' + dy + ')') + '.',
      ['Write ' + t(n2 + '=(x,\\ ' + dy + ')') + ' and use ' + t('(x_2-x_1)^{2}+(y_2-y_1)^{2}=(\\text{length})^{2}') + '.', 'Squaring ' + t('\\sqrt{' + N + '}') + ' gives ' + t(N) + '. Then take ' + t('\\pm') + ' the square root.'], 'endpoint on horizontal line');
  }
  function kPart(prompt, ks, sol, text) {
    var p = K.P.valueSet(prompt, ks, { v: 'k' }, sol + '<br>Check each value by substituting it back into the distance formula.', ['Substitute into ' + t('(x_2-x_1)^{2}+(y_2-y_1)^{2}=(\\text{length})^{2}') + ' and solve for ' + t('k') + '.', 'Expect two values: a square equals a positive number in two ways.'], text);
    p.bad = ['k=' + ks[0]]; if (ks[0] !== -ks[1]) p.bad.push('k=' + (-ks[0]) + ', k=' + (-ks[1]));
    return p;
  }
})(window);
