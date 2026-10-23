/* Math 10C · Unit 6 · Lesson 1 — Length, Distance, and Midpoint of a Line Segment (outcome RF3 on every part)
 * Assignment questions 1–12 (u6_L01.tex) and the Lesson 1 Extra Practice (u6_EP01.tex, questions 1–15).
 * This lesson merges the old Lesson 1 (lengths of segments) and Lesson 2 (distance and midpoint formulas). Their question
 * generators are kept unchanged in two private scopes below (LEN: horizontal/vertical/diagonal lengths and the old Extra
 * Practice 1; DM: the distance and midpoint formulas and the old Extra Practice 2), and the lesson is assembled from them
 * at the end with new question numbers and part ids that match the merged booklet.
 * Every part is a generator that keeps the idea and difficulty of a booklet question (the booklet's numbers are among the
 * possible versions). Levels: LIM BEG EMG PRG ADV MAS. */
(function (root) {
  'use strict';
  var HW = root.HW;

  /* ======================================================================================
   * LEN — lengths of horizontal, vertical and diagonal segments (old Lesson 1)
   * ====================================================================================== */
  var LEN = (function () {
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
        return { W: [c, yt], X: [c + h, ym], Y: [c, yb], Z: [c - h, ym], h: h, n1: n1, n2: n2, win: { x: [-7, 7], y: [yb - 1, Math.max(yt + 1, 1)] } };
      }
      return { W: [0, 5], X: [4, 1], Y: [0, -7], Z: [-4, 1], h: 4, n1: 32, n2: 80, win: { x: [-7, 7], y: [-8, 6] } };
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

    return ({
      src: 'old Lesson 1 (lengths of segments)',
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
            var p = K.P.math('The pitcher stands on the mound ' + t(sh.d) + ' m from home plate. Calculate the <b>exact</b> coordinates of the pitcher.', ptChk([k * Math.SQRT2, k * Math.SQRT2], { chk: [kc, kc] }), '(' + k + '\\sqrt{2},\\ ' + k + '\\sqrt{2})',
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
            var p = K.P.fields('With ' + t('S' + P2(sh.S)) + ', determine ' + t('PS') + ' and ' + t('RS') + '.', [lenField('PS', sh.c * sh.c), lenField('RS', rs)], [exactLen(sh.c * sh.c, [0, sh.c]), exactLen(rs, runRise(sh.R, sh.S))], [String(sh.c), rt(rs)],
              t('PS=' + sh.c) + ', ' + t('RS=' + rt(rs)), t('PS') + ' is vertical: ' + t('|' + sub(sh.S[1], sh.P[1]) + '|=' + sh.c) + ' units.<br>' + distSol('RS', sh.R, sh.S), ['' + t('PS') + ' is vertical — subtract. ' + t('RS') + ' is diagonal — use the Pythagorean theorem.'], 'PS and RS');
            p.bad = [[String(sh.c + 1), String(sh.h + sh.c - sh.v)]]; return p;
          } },
          { id: 'e3c2', sub: 'c iii', level: 'EMG', make: function (r, sh) {
            var rs = rt(d2(sh.R, sh.S));
            return mcP(r, 'A student claims that ' + t('\\triangle PRS') + ', with ' + t('S' + P2(sh.S)) + ', is isosceles. Using ' + t('PR') + ', ' + t('PS') + ' and ' + t('RS') + ', decide whether the claim is true.', [
              { html: 'True: ' + t('PR=PS=' + sh.c), right: true },
              { html: 'True: ' + t('PR=RS'), why: t('RS=' + rs) + ', which is not ' + t(sh.c) + '.' },
              { html: 'True: ' + t('PS=RS'), why: t('RS=' + rs) + ', but ' + t('PS=' + sh.c) + '.' },
              { html: 'False: all three sides are different.', why: 'Compare ' + t('PR') + ' from (b) with ' + t('PS') + ': both are ' + t(sh.c) + '.' }],
              t('PR=' + sh.c) + ', ' + t('PS=' + sh.c) + ', ' + t('RS=' + rs + '\\approx ' + dec(Math.sqrt(d2(sh.R, sh.S)), 1)) + '. Two sides are equal, so the claim is <b>true</b>: ' + t('PR=PS') + '.', ['Compare the three lengths: are any two equal?'], 'isosceles PRS');
          } },
          { id: 'e3d', sub: 'd', level: 'EMG', make: function (r, sh) {
            var a = sh.c * sh.c, b = sh.c * sh.c, c = d2(sh.R, sh.S);
            return mcP(r, 'Is ' + t('\\triangle PRS') + ' (with ' + t('S' + P2(sh.S)) + ') also a right triangle? Compare ' + t('PR^{2}+RS^{2}') + ', ' + t('PR^{2}+PS^{2}') + ' and ' + t('PS^{2}+RS^{2}') + ' with the square of the remaining side.', [
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
          return mcP(r, 'The six segments were ' + sh.segs.map(function (s, i) { return '(' + L[i] + ') ' + t(s.n[0] + P2(s.A)) + ' to ' + t(s.n[1] + P2(s.B)); }).join(', ') + '. Exactly one of the six lengths needs no radical sign at all in its final form. Which one, and what was special about the number under the radical?', [
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
            var p = K.P.fields('Round the total length of each route to the nearest tenth.', f, c, k, sh.intName + ' ' + t('\\approx ' + dec(sh.R1, 1)) + ', ' + sh.radName + ' ' + t('\\approx ' + dec(sh.R2, 1)),
              sh.intName + ': ' + t(sh.R1 + '=' + dec(sh.R1, 1)) + '. ' + sh.radName + ': ' + t(rt(sh.m) + '+' + rt(sh.n) + '\\approx ' + dec(Math.sqrt(sh.m), 5) + '+' + dec(Math.sqrt(sh.n), 5) + '=' + dec(sh.R2, 5) + '\\approx ' + dec(sh.R2, 1)) + '.', ['Find each route’s exact total (add its two legs), then use a calculator.'], 'route totals rounded');
            p.bad = [[dec(sh.R1 + 1, 1), dec(sh.R2, 1)]]; return p;
          } },
          { id: 'e6b2', sub: 'b ii', level: 'EMG', make: function (r, sh) {
            return mcP(r, 'Rounded to the nearest tenth, both route totals come out as ' + t(dec(sh.R1, 1)) + ' (' + sh.intName + ' is exactly ' + t(sh.R1) + ', ' + sh.radName + ' is ' + t(radSumTex(sh.m, sh.n)) + '). Why can’t these rounded values settle which route is shorter?', [
              { html: 'The totals differ by much less than ' + t('0.05') + ', so both round to the same tenth — rounding hides the difference.', right: true },
              { html: 'The two routes are exactly the same length.', why: 'They aren’t — one total is a whole number and the other is a sum of irrational square roots. Part (c) shows which is longer.' },
              { html: 'You can’t round a sum of radicals.', why: 'You can (each radical has a decimal value). The problem is that both totals round to the same value.' },
              { html: 'Rounding always makes the route with radicals look shorter.', why: 'Rounding can go up or down. Here both totals round to ' + t(dec(sh.R1, 1)) + '.' }],
              'The totals are ' + t(dec(sh.R1, 5)) + ' and ' + t(dec(sh.R2, 5)) + ': they differ by about ' + t(dec(Math.abs(sh.R2 - sh.R1), 4)) + ', far less than the rounding step of ' + t('0.1') + ', so both round to ' + t(dec(sh.R1, 1)) + '.', ['How far apart are the two totals compared with 0.1?'], 'why rounding fails');
          } },
          { id: 'e6c', sub: 'c i', level: 'PRG', make: function (r, sh) {
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
          { id: 'e6c2', sub: 'c ii', level: 'EMG', make: function (r, sh) {
            var shorter = sh.R1 < sh.R2 ? sh.intName : sh.radName, longer = shorter === sh.intName ? sh.radName : sh.intName;
            return mcP(r, 'To compare ' + sh.intName + ' (' + t(sh.R1) + ') with ' + sh.radName + ' (' + t(radSumTex(sh.m, sh.n)) + ') exactly, both totals are squared, ' + t(sh.m + sh.n) + ' is subtracted, both sides are divided by ' + t('2') + ' and squared again. That leaves ' + t(F(sh.m * sh.n)) + ' on the side of ' + sh.radName + ' and ' + t(F(sh.h * sh.h)) + ' on the side of ' + sh.intName + '. Since ' + t(F(sh.m * sh.n) + (sh.m * sh.n > sh.h * sh.h ? '\\gt ' : '\\lt ') + F(sh.h * sh.h)) + ', which route is shorter?', [
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
            var p = K.P.fields('The exact sides are ' + ['PQ', 'QR', 'RS', 'SP'].map(function (n, i) { return t(n + '=' + rt(sh.s[i])); }).join(', ') + ', and the exact perimeter, rounded only at the end, is ' + t('\\approx ' + dec(sh.sumE, 1)) + '. A classmate rounds each side to the nearest tenth first and then adds. What total does the classmate get, and by how much does it differ from ' + t(dec(sh.sumE, 1)) + '?', [numField('Classmate’s total:', 'Classmate’s total', 'units'), numField('Difference:', 'Difference', 'units')],
              [K.approx(sh.sumR, 1, { diag: function (v) { if (near(v, K.roundTo(sh.sumE, 1), 0.001)) return { code: 'round-first', hint: 'That’s the correct perimeter. Round <b>each side</b> to the nearest tenth first, then add those rounded values.' }; return null; } }), K.approx(diff, 1)],
              [dec(sh.sumR, 1), dec(diff, 1)], 'Classmate: ' + t(dec(sh.sumR, 1)) + '; difference ' + t(dec(diff, 1)) + ' (the answer from (c), ' + t(dec(sh.sumE, 1)) + ', is correct)',
              'Rounded sides: ' + t(sh.s.map(function (N) { return dec(Math.sqrt(N), 1); }).join('+') + '=' + dec(sh.sumR, 1)) + '. The correct perimeter is ' + t(dec(sh.sumE, 1)) + ', so they differ by ' + t(dec(diff, 1)) + '. Each rounding error is small, but they add up — round once, at the end.', ['Round each side to one decimal, then add.'], 'rounding first');
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
              { html: 'The diagonals are shorter than the sides.', why: 'Length has nothing to do with it. Look at the direction of each diagonal.' },
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
            return mcP(r, 'For a segment from ' + t('M(k,\\ k)') + ' to a fixed point ' + t('N(a,\\ b)') + ', both coordinates of ' + t('M') + ' contain ' + t('k') + ', so squaring produces ' + t('k^{2}') + ' terms from <i>both</i> brackets: ' + t('(a-k)^{2}+(b-k)^{2}') + '. Why is the equation still only a quadratic — with at most two answers?', [
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
          { id: 'e13c', sub: 'c', level: 'EMG', make: function (r, sh) { return lenPart('Determine the correct length of ' + t('AB') + ', exactly and to the nearest tenth.', 'AB', sh.A, sh.B, 1); } },
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
          { id: 'e16', level: 'EMG', make: function (r) {
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
  })();

  /* ======================================================================================
   * DM — the distance and midpoint formulas (old Lesson 2)
   * ====================================================================================== */
  var DM = (function () {
    var HW = root.HW, ex = HW.ex, F = HW.fmt, K = HW.kit, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form, B = K.P, P = HW.poly;

    HW.addCodes({
      'd-no-root': 'Distance: forgot the square root (gave d²)', 'd-legs': 'Distance: added the run and rise', 'd-no-square': 'Distance: didn’t square the differences',
      'd-added': 'Distance: added the coordinates instead of subtracting', 'd-sign': 'Distance: sign slip subtracting a negative coordinate',
      'd-units': 'Distance in grid units, not converted with the scale', 'd-metres': 'Gave metres instead of kilometres', 'd-scale-div': 'Divided by the scale instead of multiplying',
      'd-walk': 'Gave the distance walked along the streets', 'd-half': 'Gave half the distance', 'd-straight': 'Gave the straight-line distance instead of the route',
      'd-round-early': 'Rounded each segment before adding', 'd-no-neg': 'Treated west/south as positive', 'd-diff-blocks': 'Subtracted the blocks instead of combining them',
      'mid-subtract': 'Midpoint: subtracted the coordinates', 'mid-no-halve': 'Midpoint: didn’t divide by 2', 'mid-wrong-seg': 'Midpoint of the wrong segment',
      'end-average': 'Missing endpoint: averaged instead of doubling and subtracting', 'end-step': 'Missing endpoint: gave the step from A to M', 'end-sign': 'Missing endpoint: added instead of subtracting',
      'end-sum': 'Missing endpoint: added the midpoint and the endpoint', 'end-double': 'Missing endpoint: doubled the midpoint but didn’t subtract', 'end-used-x': 'Used the wrong coordinate equation',
      'end-gave-y': 'Gave the y-value instead of x', 'pt-swap': 'Coordinates swapped', 'pt-x': 'Wrong x-coordinate', 'pt-y': 'Wrong y-coordinate', pt: 'Wrong point',
      'pt-not-pair': 'Gave one number for a point', 'pt-brackets': 'Point without brackets', 'pt-many': 'Gave several points for one', 'pt-dir': 'West/south not written as negative',
      'pts-missing': 'Missed a point', 'pts-extra': 'A point that doesn’t work', pts: 'Wrong points', 'ax-no-leg': 'Left out the other coordinate’s difference',
      'ax-no-root': 'Didn’t take the square root', 'ax-sign': 'Sign slip solving (x − h)² = …', 'ax-one': 'Gave only one of two points',
      'eq-gave-mid': 'Gave the midpoint of AB', 'eq-mid-y': 'Used the average of the y-coordinates', 'par-one-d': 'Found only one fourth vertex',
      'road-half': 'Gave the road to one town only', 'per-side': 'Perimeter missing a side', 'ctx-swap': 'Mixed up which distance is x and which is y'
    });

    /* ---------------- numbers and LaTeX ---------------- */
    function cl(x) { return Math.round(x * 1e6) / 1e6; }
    function same(a, b) { return Math.abs(a - b) < 1e-7; }
    function nT(x) { return F(cl(x)); }
    function sgp(x) { x = cl(x); return x < 0 ? '(' + nT(x) + ')' : nT(x); }
    function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var r = a % b; a = b; b = r; } return a; }
    function range(a, b) { var o = []; for (var i = a; i <= b; i++) o.push(i); return o; }
    function pm(a, b) { return range(a, b).concat(range(a, b).map(function (x) { return -x; })); }
    function pickWhere(gen, okf) { for (var i = 0; i < 4000; i++) { var o = gen(); if (okf(o)) return o; } throw new Error('u6l2: no valid numbers'); }
    function isSq(n) { var q = Math.round(Math.sqrt(n)); return q * q === n; }
    function radParts(n) { var k = 1, m = n; for (var f = 2; f * f <= m; f++) while (m % (f * f) === 0) { m /= f * f; k *= f; } return { k: k, m: m }; }
    function ptT(p) { return '(' + nT(p[0]) + ',\\ ' + nT(p[1]) + ')'; }
    function nm(name, p) { return name + ptT(p); }
    function ptKey(p) { return '(' + cl(p[0]) + ', ' + cl(p[1]) + ')'; }
    function samePt(a, b) { return same(a[0], b[0]) && same(a[1], b[1]); }
    function mid(a, b) { return [cl((a[0] + b[0]) / 2), cl((a[1] + b[1]) / 2)]; }
    function add(a, b) { return [cl(a[0] + b[0]), cl(a[1] + b[1])]; }
    function sub(a, b) { return [cl(a[0] - b[0]), cl(a[1] - b[1])]; }
    function scl(a, k) { return [cl(a[0] * k), cl(a[1] * k)]; }
    function d2(a, b) { return cl((b[0] - a[0]) * (b[0] - a[0]) + (b[1] - a[1]) * (b[1] - a[1])); }
    function dist(a, b) { return Math.sqrt(d2(a, b)); }
    function rd(x, dp) { return K.roundTo(x, dp); }
    function fx(x, dp) { return rd(x, dp).toFixed(dp); }
    /* exact length √n / den in simplest form */
    function lenSpec(n, den) { den = den || 1; var r = radParts(n), g = gcd(r.k, den); return { k: [r.k / g, den / g], m: r.m }; }
    function lenTex(n, den) {
      var s = lenSpec(n, den), p = s.k[0], q = s.k[1], core = s.m === 1 ? String(p) : (p === 1 ? '' : p) + '\\sqrt{' + s.m + '}';
      return q === 1 ? core : '\\dfrac{' + core + '}{' + q + '}';
    }
    function lenKey(n, den) {
      var s = lenSpec(n, den), p = s.k[0], q = s.k[1], core = s.m === 1 ? String(p) : (p === 1 ? '' : p) + '\\sqrt{' + s.m + '}';
      return q === 1 ? core : '\\frac{' + core + '}{' + q + '}';
    }
    /* "= √40 = √(4 × 10) = 2√10" (the steps after √n) */
    function simpTail(n) {
      if (isSq(n)) return '=' + Math.round(Math.sqrt(n));
      var r = radParts(n); return r.k === 1 ? '' : '=\\sqrt{' + (r.k * r.k) + '\\times ' + r.m + '}=' + r.k + '\\sqrt{' + r.m + '}';
    }
    /* LaTeX of the distance computation from p to q: "AB = √((x2−x1)² + (y2−y1)²) = √(dx² + dy²) = √(a + b) = √n" */
    function dLine(p, q, name) {
      var dx = cl(q[0] - p[0]), dy = cl(q[1] - p[1]);
      return (name ? name + '=' : '') + '\\sqrt{(' + nT(q[0]) + '-' + sgp(p[0]) + ')^{2}+(' + nT(q[1]) + '-' + sgp(p[1]) + ')^{2}}=\\sqrt{' + sgp(dx) + '^{2}+' + sgp(dy) + '^{2}}=\\sqrt{' + nT(dx * dx) + '+' + nT(dy * dy) + '}=\\sqrt{' + nT(dx * dx + dy * dy) + '}';
    }
    function dSteps(p, q) {
      var dx = cl(q[0] - p[0]), dy = cl(q[1] - p[1]);
      return t('x_2-x_1=' + nT(q[0]) + '-' + sgp(p[0]) + '=' + nT(dx)) + ', &nbsp;' + t('y_2-y_1=' + nT(q[1]) + '-' + sgp(p[1]) + '=' + nT(dy)) + '.';
    }
    function mLine(p, q, name) {
      return (name ? name + '=' : '') + '\\left(\\dfrac{' + nT(p[0]) + '+' + sgp(q[0]) + '}{2},\\ \\dfrac{' + nT(p[1]) + '+' + sgp(q[1]) + '}{2}\\right)=\\left(\\dfrac{' + nT(p[0] + q[0]) + '}{2},\\ \\dfrac{' + nT(p[1] + q[1]) + '}{2}\\right)=' + ptT(mid(p, q));
    }

    var HD = ['Distance formula: ' + t('d=\\sqrt{(x_2-x_1)^{2}+(y_2-y_1)^{2}}') + '. Find the run and the rise, square each, add, then take the square root.',
      'Watch the signs: subtracting a negative coordinate means adding, e.g. ' + t('3-(-3)=6') + '.'];
    var HM = ['Midpoint formula: ' + t('M\\left(\\dfrac{x_1+x_2}{2},\\ \\dfrac{y_1+y_2}{2}\\right)') + ' — average the ' + t('x') + '-coordinates and average the ' + t('y') + '-coordinates.',
      'Add the coordinates (don’t subtract), then divide each sum by ' + t('2') + '.'];
    var HE = ['If ' + t('M') + ' is the midpoint of ' + t('\\overline{AB}') + ', then ' + t('x_M=\\dfrac{x_A+x_B}{2}') + ', so ' + t('x_B=2x_M-x_A') + ': <b>double the midpoint, then subtract the endpoint you have</b>.',
      'Do the same with the ' + t('y') + '-coordinates. Averaging again is the classic wrong move — the missing endpoint lies <i>beyond</i> the midpoint.'];

    /* ---------------- typical wrong distances ---------------- */
    function dCands(p, q, scale) {
      scale = scale || 1;
      var dx = cl(q[0] - p[0]), dy = cl(q[1] - p[1]), D = Math.sqrt(dx * dx + dy * dy) * scale, out = [];
      function put(v, code, hint) { if (!isFinite(v) || v <= 0 || Math.abs(v - D) < 1e-6 || out.some(function (o) { return Math.abs(o[0] - v) < 1e-6; })) return; out.push([v, code, hint]); }
      if (scale === 1) put(dx * dx + dy * dy, 'd-no-root', 'That is ' + t('d^{2}') + ' — the last step of the distance formula is to take the <b>square root</b>.');
      put((Math.abs(dx) + Math.abs(dy)) * scale, 'd-legs', 'You added the run and the rise. The segment is the <b>hypotenuse</b> of a right triangle: square the run and the rise, add, then take the square root.');
      put(Math.sqrt(Math.abs(dx) + Math.abs(dy)) * scale, 'd-no-square', 'Square each difference before you add them: ' + t('\\sqrt{(\\Delta x)^{2}+(\\Delta y)^{2}}') + '.');
      var sx = cl(q[0] + p[0]), sy = cl(q[1] + p[1]);
      put(Math.sqrt(sx * sx + sy * sy) * scale, 'd-added', 'The distance formula <b>subtracts</b> the coordinates (' + t('x_2-x_1') + ' and ' + t('y_2-y_1') + ') — it doesn’t add them.');
      var ex1 = p[0] < 0 ? t(nT(q[0]) + '-' + sgp(p[0]) + '=' + nT(dx)) : p[1] < 0 ? t(nT(q[1]) + '-' + sgp(p[1]) + '=' + nT(dy)) : q[0] < 0 ? t(nT(p[0]) + '-' + sgp(q[0]) + '=' + nT(-dx)) : t(nT(p[1]) + '-' + sgp(q[1]) + '=' + nT(-dy));
      var sh = 'Check your subtraction — subtracting a negative coordinate means adding: ' + ex1 + '.';
      put(Math.sqrt(sx * sx + dy * dy) * scale, 'd-sign', sh);
      put(Math.sqrt(dx * dx + sy * sy) * scale, 'd-sign', sh);
      return out;
    }
    function matchDiag(cands, dp) {
      return function (v) {
        for (var i = 0; i < cands.length; i++) {
          var c = cands[i][0];
          if (dp == null ? Math.abs(v - c) < 1e-6 : Math.abs(v - rd(c, dp)) < 1e-9 || Math.abs(v - c) < 1e-6) return { code: cands[i][1], hint: cands[i][2] };
        }
        return null;
      };
    }
    /* an exact length √n/den: integer, fraction or simplest mixed radical. o.cands (wrong values), o.dec (also accept a
     * correctly rounded decimal, 1 or 2 decimal places) */
    function lenCheck(n, den, o) {
      o = o || {}; den = den || 1;
      var s = lenSpec(n, den), L = Math.sqrt(n) / den, dg = matchDiag(o.cands || []);
      var base = s.m === 1 ? (s.k[1] === 1 ? K.value(s.k[0], { only: 'integer', diag: dg }) : K.fraction(s.k, { decimalOk: true, diag: dg })) : K.radical({ k: s.k, n: 2, m: s.m }, 'mixed', { diag: dg });
      return function (resp) {
        if (o.dec) {
          var pn = HW.parse.number(String(resp == null ? '' : resp));
          if (pn.ok) { var str = HW.parse.plain(String(resp)).replace(/\s/g, ''), dp = (str.split('.')[1] || '').length; if (dp >= 1 && dp <= 3 && Math.abs(pn.value - rd(L, dp)) < 1e-9) return ok(); }
        }
        return base(resp);
      };
    }
    function lenField(label) { return { label: t(label + '='), name: label, mode: 'math', keys: 'radical' }; }

    /* ---------------- points ---------------- */
    function stripP(s) {
      return String(s == null ? '' : s).replace(/\\(left|right)\b\.?/g, '').replace(/\\lparen/g, '(').replace(/\\rparen/g, ')').replace(/\\[,;!: ]/g, '')
        .replace(/\\\{|\\\}|\\lbrace|\\rbrace/g, ' ').replace(/\\text\{\s*and\s*\}/g, ',').trim();
    }
    function simpleNum(ast) { var sh = ex.shape(ast); if (sh.bare) return true; var pf = ex.plainFraction(ast); return !!(pf && pf[1] > 1 && gcd(pf[0], pf[1]) === 1 && !sh.decimals); }
    function coordPair(str) {
      var xy = str.split(','); if (xy.length !== 2 || !xy[0].trim() || !xy[1].trim()) return null;
      var a = ex.parse(xy[0].trim()), b = ex.parse(xy[1].trim()); if (!a.ok || !b.ok) return null;
      var va = ex.value(a.ast), vb = ex.value(b.ast); if (!isFinite(va) || !isFinite(vb)) return null;
      return { x: va, y: vb, simple: simpleNum(a.ast) && simpleNum(b.ast) };
    }
    function readPts(resp) {
      var s = stripP(resp);
      if (/^\{[\s\S]*\}$/.test(s) && !/^\{[^{}]*\}\{/.test(s)) s = s.slice(1, -1).trim();
      if (!s) return { empty: true };
      var re = /\(([^()]*)\)/g, m, out = [];
      while ((m = re.exec(s))) { var c = coordPair(m[1]); if (!c) return { bad: true }; out.push(c); }
      if (!out.length) {
        var c2 = coordPair(s); if (c2) return { pts: [c2], noParen: true };
        var one = ex.parse(s); if (one.ok && isFinite(ex.value(one.ast))) return { single: true };
        return { bad: true };
      }
      if (s.replace(re, '').replace(/[,;\s]|and/g, '').length) return { bad: true };
      return { pts: out };
    }
    function readRes(L) {
      if (L.empty) return form('empty', 'Type your answer first.');
      if (L.single) return form('pt-not-pair', 'A point needs two coordinates: write it as an ordered pair ' + t('(x,\\ y)') + '.');
      if (L.bad) return form('unreadable', 'Write the point as an ordered pair in brackets, e.g. ' + t('(3,\\ -2)') + ' (press <b>( )</b>, type x, comma, y).');
      return null;
    }
    /* one point. o.cands: [[pt, code, hint]], o.swapHint, o.xHint, o.yHint */
    function ptCheck(W, o) {
      o = o || {};
      return function (resp) {
        var L = readPts(resp), rr = readRes(L); if (rr) return rr;
        if (L.pts.length !== 1) return form('pt-many', 'Give just one point.');
        var p = L.pts[0], Q = [p.x, p.y];
        if (samePt(Q, W)) {
          if (!p.simple) return form('simplify', 'Right point — now simplify each coordinate to a single number (for example ' + t('\\frac{12}{2}=6') + ').');
          if (L.noParen) return form('pt-brackets', 'Right coordinates — write the point in brackets: ' + t('(x,\\ y)') + '.');
          return ok();
        }
        var c = o.cands || [];
        for (var i = 0; i < c.length; i++) if (c[i][0] && samePt(Q, c[i][0])) return wrong(c[i][1], c[i][2]);
        if (same(Q[0], W[1]) && same(Q[1], W[0])) return wrong('pt-swap', o.swapHint || 'Your coordinates are in the wrong order: the ' + t('x') + '-coordinate comes first, then the ' + t('y') + '-coordinate.');
        if (same(Q[0], W[0])) return wrong('pt-y', 'Your ' + t('x') + '-coordinate is right — check the ' + (same(Q[1], -W[1]) ? '<b>sign</b> of the ' : '') + t('y') + '-coordinate.' + (o.yHint ? ' ' + o.yHint : ''));
        if (same(Q[1], W[1])) return wrong('pt-x', 'Your ' + t('y') + '-coordinate is right — check the ' + (same(Q[0], -W[0]) ? '<b>sign</b> of the ' : '') + t('x') + '-coordinate.' + (o.xHint ? ' ' + o.xHint : ''));
        return wrong('pt', null);
      };
    }
    /* several points in one box (any order). o.diag(list) -> {code, hint}, o.missHint */
    function ptsCheck(want, o) {
      o = o || {};
      return function (resp) {
        var L = readPts(resp), rr = readRes(L); if (rr) return rr;
        var A = []; L.pts.forEach(function (p) { if (!A.some(function (q) { return samePt([q.x, q.y], [p.x, p.y]); })) A.push(p); });
        var miss = want.filter(function (w) { return !A.some(function (p) { return samePt([p.x, p.y], w); }); });
        var extra = A.filter(function (p) { return !want.some(function (w) { return samePt([p.x, p.y], w); }); });
        if (!miss.length && !extra.length) {
          if (A.some(function (p) { return !p.simple; })) return form('simplify', 'Right points — now simplify each coordinate to a single number.');
          if (L.noParen) return form('pt-brackets', 'Right coordinates — write each point in brackets: ' + t('(x,\\ y)') + '.');
          return ok();
        }
        if (o.diag) { var h = o.diag(A.map(function (p) { return [p.x, p.y]; })); if (h) return wrong(h.code, h.hint); }
        if (miss.length && !extra.length) return wrong(o.missCode || 'pts-missing', o.missHint || 'Correct so far — but ' + (miss.length === 1 ? 'there is another point' : 'there are more points') + ' that works.');
        if (extra.length && !miss.length) return wrong('pts-extra', 'One of your points doesn’t satisfy the conditions — check each one.');
        return wrong('pts', null);
      };
    }
    function ptPart(prompt, W, o, sol, hints, text) {
      o = o || {};
      var good = ['\\left(' + cl(W[0]) + ',' + cl(W[1]) + '\\right)'], bad = [];
      [[W[1], W[0]]].concat((o.cands || []).map(function (c) { return c[0]; })).forEach(function (q) { if (q && !samePt(q, W)) bad.push(ptKey(q)); });
      return { prompt: prompt, input: { type: 'math', keys: 'pairs', before: o.before, placeholder: 'e.g. (3, -2)' }, check: ptCheck(W, o), key: ptKey(W), answer: t((o.name || '') + ptT(W)),
        solution: sol, hints: hints || HM, text: text, good: good, bad: bad };
    }
    function ptField(label) { return { label: label, name: label.replace(/\\\(|\\\)/g, ''), mode: 'math', keys: 'pairs', placeholder: 'e.g. (3, -2)' }; }
    function midCands(a, b) {
      var h = [cl((b[0] - a[0]) / 2), cl((b[1] - a[1]) / 2)], hs = 'You subtracted the coordinates. The midpoint formula <b>adds</b> them and divides by ' + t('2') + ' — it averages each coordinate.';
      return [[h, 'mid-subtract', hs], [scl(h, -1), 'mid-subtract', hs], [add(a, b), 'mid-no-halve', 'You added the coordinates — now divide each sum by ' + t('2') + '.']];
    }
    function endCands(a, m) {
      return [[mid(a, m), 'end-average', 'You averaged the endpoint and the midpoint — that gives the point halfway between them. The missing endpoint is <i>beyond</i> the midpoint: double the midpoint, then subtract the endpoint you have.'],
        [sub(m, a), 'end-step', 'That is the step from the known endpoint to the midpoint. The missing endpoint is one more such step past the midpoint: ' + t('B=2M-A') + '.'],
        [add(scl(m, 2), a), 'end-sign', 'Double the midpoint, then <b>subtract</b> the endpoint you have — watch the signs.'],
        [add(m, a), 'end-sum', 'Double the midpoint first, then subtract the known endpoint: ' + t('x_B=2x_M-x_A') + '.'],
        [scl(m, 2), 'end-double', 'You doubled the midpoint — now subtract the known endpoint.']];
    }
    function endNum(xA, xM) {
      return [[(xA + xM) / 2, 'end-average', 'You averaged again. The midpoint’s coordinate is the average of the endpoints, so solve ' + t('\\dfrac{' + nT(xA) + '+x}{2}=' + nT(xM)) + ': multiply by ' + t('2') + ', then subtract ' + t(sgp(xA)) + '.'],
        [xM - xA, 'end-step', 'Multiply both sides by ' + t('2') + ' first: ' + t(nT(xA) + '+x=' + nT(2 * xM)) + ', then subtract.'],
        [2 * xM + xA, 'end-sign', 'After doubling, <b>subtract</b> ' + t(sgp(xA)) + ' (it moves to the other side): ' + t('x=' + nT(2 * xM) + '-' + sgp(xA)) + '.'],
        [xM + xA, 'end-sum', 'Double the midpoint coordinate first: ' + t('x=2(' + nT(xM) + ')-' + sgp(xA)) + '.'],
        [2 * xM, 'end-double', 'You doubled the midpoint coordinate — now subtract ' + t(sgp(xA)) + '.']];
    }
    function numDiag(list) { return function (v) { for (var i = 0; i < list.length; i++) if (isFinite(list[i][0]) && same(v, list[i][0])) return { code: list[i][1], hint: list[i][2] }; return null; }; }
    function ptsOpt(r, A, B2, n) { // n random points with |PA| ≠ |PB|, distinct
      var out = [];
      for (var g = 0; out.length < n && g < 4000; g++) {
        var q = [r.int(-12, 12), r.int(-12, 12)];
        if (Math.abs(d2(q, A) - d2(q, B2)) < 4 || out.some(function (o) { return samePt(o, q); })) continue;
        out.push(q);
      }
      return out;
    }
    function eqWhy(q, A, an, B2, bn) { return 'Squared distances from ' + t(ptT(q)) + ': to ' + t(an) + ' it is ' + t(nT(d2(q, A))) + ', to ' + t(bn) + ' it is ' + t(nT(d2(q, B2))) + ' — not equal.'; }
    /* a coordinate grid around some points (even bounds) */
    function win(pts, padv) {
      padv = padv == null ? 1 : padv;
      var xs = pts.map(function (p) { return p[0]; }).concat([0]), ys = pts.map(function (p) { return p[1]; }).concat([0]);
      var lo = function (v) { return Math.floor((Math.min.apply(null, v) - padv) / 2) * 2; }, hi = function (v) { return Math.ceil((Math.max.apply(null, v) + padv) / 2) * 2; };
      return { x: [lo(xs), hi(xs)], y: [lo(ys), hi(ys)] };
    }
    function figPoly(pts, names, o) {
      o = o || {};
      var w = win(pts, 1.5), segs = [];
      if (o.closed) segs.push({ pts: pts.concat([pts[0]]), start: 'none', end: 'none' });
      else if (o.segs) o.segs.forEach(function (s) { segs.push({ pts: s, start: 'none', end: 'none', dash: s.dash }); });
      (o.dash || []).forEach(function (s) { segs.push({ pts: s, start: 'none', end: 'none', dash: true, color: '#c4532a' }); });
      var span = Math.max(w.x[1] - w.x[0], w.y[1] - w.y[0]);
      return '<div class="fig">' + HW.graph({ x: w.x, y: w.y, grid: 1, labels: span > 16 ? 4 : 2, points: pts.map(function (p, i) { return { x: p[0], y: p[1], label: names[i] }; }), segs: segs, max: 340 }) + '</div>';
    }

    /* ---------------- shared generators ---------------- */
    var FIELD = '<div class="fig"><svg class="fig-svg" viewBox="0 0 220 130" width="100%" style="max-width:240px" role="img" aria-label="corner of the field">' +
      '<defs><marker id="u6l2A" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#2b3340"/></marker></defs>' +
      '<line x1="50" y1="100" x2="50" y2="22" stroke="#2b3340" stroke-width="1.8" marker-end="url(#u6l2A)"/><line x1="50" y1="100" x2="170" y2="100" stroke="#2b3340" stroke-width="1.8" marker-end="url(#u6l2A)"/>' +
      '<circle cx="50" cy="100" r="3.5" fill="#2b3340"/><text x="50" y="15" font-size="13" text-anchor="middle" fill="#2b3340">Left sideline</text>' +
      '<text x="176" y="104" font-size="13" fill="#2b3340">Back</text><text x="176" y="119" font-size="13" fill="#2b3340">line</text><text x="44" y="118" font-size="13" text-anchor="end" fill="#2b3340">Corner</text></svg></div>';
    var TRI = [[3, 4], [4, 3], [6, 8], [8, 6], [5, 12], [12, 5], [9, 12], [12, 9], [8, 15], [15, 8]];
    function triple(r, maxLeg) { var c = TRI.filter(function (p) { return p[0] <= maxLeg && p[1] <= maxLeg; }); return r.pick(c).slice(); }
    function sgn(r, p) { return [p[0] * (r.chance(0.5) ? 1 : -1), p[1] * (r.chance(0.5) ? 1 : -1)]; }
    function rot(v, dir) { return dir > 0 ? [-v[1], v[0]] : [v[1], -v[0]]; }
    function mcPart(r, prompt, opts, sol, hints, text, keepOrder) { return B.mc(r, prompt, opts, sol, hints, text, keepOrder); }

    /* Q4: collinear X, Y, Z (Y between) */
    function q4shared(r) {
      if (r.chance(0.15)) return { X: [-3, -4], v: [2, 3], a: 2, b: 4 };
      return pickWhere(function () {
        var v = [r.int(1, 3), r.int(1, 4)]; if (r.chance(0.3)) v[1] = -v[1];
        var a = r.pick([1, 2, 2, 3]), b = r.pick([2, 3, 4]);
        return { X: [r.int(-6, -1), v[1] > 0 ? r.int(-6, -1) : r.int(1, 8)], v: v, a: a, b: b };
      }, function (o) { var n = o.v[0] * o.v[0] + o.v[1] * o.v[1]; if (gcd(o.v[0], o.v[1]) !== 1 || isSq(n) || radParts(n).k !== 1 || o.a === o.b || o.a + o.b > 6) return false; var Z = add(o.X, scl(o.v, o.a + o.b)); return Math.abs(Z[0]) <= 20 && Math.abs(Z[1]) <= 20; });
    }
    /* right angle at a vertex: V, legs u and s·rot(u) */
    function rightTri(r, uList, sList, lim) {
      return pickWhere(function () {
        var u = sgn(r, r.pick(uList)), s = r.pick(sList), w = scl(rot(u, r.chance(0.5) ? 1 : -1), s), V = [r.int(-6, 6), r.int(-6, 6)];
        return { V: V, U: add(V, u), W: add(V, w) };
      }, function (o) { return [o.V, o.U, o.W].every(function (p) { return Math.abs(p[0]) <= lim && Math.abs(p[1]) <= lim; }); });
    }

    /* ======================================================================================== */
    return ({
      src: 'old Lesson 2 (distance and midpoint formulas)',
      blurb: 'The distance formula (the Pythagorean theorem on a coordinate grid) and the midpoint formula (average the coordinates): exact and rounded lengths, collinear points and right angles, midpoints, missing endpoints, and both formulas in context.',
      questions: [
        /* ---------------- Question 1: distance (whole-number answers) ---------------- */
        { num: '1', section: 'Distance between two points', stem: 'Determine the distance between each pair of points.', parts: [
          { id: '1a', level: 'BEG', make: function (r) {
            var A, L;
            if (r.chance(0.15)) { A = [1, -3]; L = [8, 6]; } else { L = triple(r, 12); A = [r.int(-3, 5), r.int(-6, -1)]; }
            var Bp = add(A, L), D = Math.sqrt(d2(A, Bp));
            return B.number(t(nm('A', A)) + ' and ' + t(nm('B', Bp)), D, matchDiag(dCands(A, Bp)), dSteps(A, Bp) + '<br>' + t(dLine(A, Bp, 'AB') + simpTail(d2(A, Bp))) + '.', HD, 'distance ' + ptT(A) + ' to ' + ptT(Bp));
          } },
          { id: '1b', level: 'BEG', make: function (r) {
            var C, L;
            if (r.chance(0.15)) { C = [-1, 4]; L = [12, 5]; } else { L = triple(r, 15); C = [r.int(-6, -1), r.int(1, 6)]; }
            var D2 = add(C, L), D = Math.sqrt(d2(C, D2));
            var p = B.number(t(nm('C', C)) + ' and ' + t(nm('D', D2)), D, matchDiag(dCands(C, D2)), dSteps(C, D2) + '<br>' + t(dLine(C, D2, 'CD') + simpTail(d2(C, D2))) + '.', HD, 'distance ' + ptT(C) + ' to ' + ptT(D2));
            return p;
          } }] },
        /* ---------------- Question 2: distance to the nearest hundredth ---------------- */
        { num: '2', stem: 'Determine the distance, to the nearest hundredth, between each pair of points.', parts: [
          { id: '2a', level: 'BEG', make: function (r) {
            var o = r.chance(0.15) ? { P: [5, -1], Q: [-3, 6] } : pickWhere(function () { return { P: [r.int(2, 7), r.int(-5, -1)], Q: [r.int(-6, -1), r.int(2, 8)] }; }, function (z) { return !isSq(d2(z.P, z.Q)); });
            var D = dist(o.P, o.Q);
            return B.approx(t(nm('P', o.P)) + ' and ' + t(nm('Q', o.Q)), D, 2, { diag: matchDiag(dCands(o.P, o.Q), 2) }, dSteps(o.P, o.Q) + '<br>' + t(dLine(o.P, o.Q, 'PQ') + '\\approx ' + fx(D, 2)) + '.', HD, 'distance ' + ptT(o.P) + ' to ' + ptT(o.Q) + ' (2 dp)');
          } },
          { id: '2b', level: 'EMG', make: function (r) {
            var o = r.chance(0.15) ? { R: [-4.5, 7.2], S: [-6.1, -3.6] } : pickWhere(function () { return { R: [-r.int(10, 80) / 10, r.int(20, 90) / 10], S: [-r.int(10, 80) / 10, -r.int(10, 60) / 10] }; },
              function (z) { return Math.abs(z.R[0] - z.S[0]) >= 0.5 && z.R[0] % 1 !== 0 && z.S[0] % 1 !== 0 && z.R[1] % 1 !== 0 && z.S[1] % 1 !== 0; });
            var D = dist(o.R, o.S);
            return B.approx(t(nm('R', o.R)) + ' and ' + t(nm('S', o.S)), D, 2, { diag: matchDiag(dCands(o.R, o.S), 2) }, dSteps(o.R, o.S) + '<br>' + t(dLine(o.R, o.S, 'RS') + '\\approx ' + fx(D, 2)) + '.', HD, 'distance ' + ptT(o.R) + ' to ' + ptT(o.S) + ' (decimals)');
          } }] },
        /* ---------------- Question 3: exact distance, simplest radical form ---------------- */
        { num: '3', stem: 'Determine the exact distance between each pair of points. Answer in simplest radical form.', parts: [
          { id: '3a', level: 'PRG', make: function (r) {
            var o = r.chance(0.15) ? { E: [1, -1], L: [6, 2] } : pickWhere(function () { return { E: [r.int(-2, 4), r.int(-5, -1)], L: [r.int(2, 8), r.int(1, 6)] }; }, function (z) { var n = z.L[0] * z.L[0] + z.L[1] * z.L[1], q = radParts(n); return q.k >= 2 && q.m > 1; });
            var E = o.E, Fp = add(E, o.L), n = d2(E, Fp), s = lenSpec(n);
            return B.radical(t(nm('E', E)) + ' and ' + t(nm('F', Fp)), { k: s.k, n: 2, m: s.m }, 'mixed', dSteps(E, Fp) + '<br>' + t(dLine(E, Fp, 'EF') + simpTail(n)) + '.', HD.concat(['To simplify ' + t('\\sqrt{' + n + '}') + ', look for the largest perfect-square factor of ' + t(n) + '.']), 'exact distance ' + ptT(E) + ' to ' + ptT(Fp), { diag: matchDiag(dCands(E, Fp)) });
          } },
          { id: '3b', level: 'PRG', make: function (r) {
            var PQ = [[5, 5], [1, 7], [7, 1], [3, 3], [3, 9], [9, 3], [7, 7], [5, 1]], o = r.chance(0.2) ? { a: 1, b: 1, p: 5, q: 5 } : pickWhere(function () { var pq = r.pick(PQ); return { a: r.pick([1, 3, 5]), b: r.pick([1, 3, 5]), p: pq[0], q: pq[1] }; }, function (z) { return z.p !== z.a && radParts(z.p * z.p + z.q * z.q).k >= 2; });
            var Kp = [-o.a / 2, o.b / 2], Lp = [(o.p - o.a) / 2, (o.q + o.b) / 2], n = o.p * o.p + o.q * o.q, s = lenSpec(n, 2);
            var kT = function (v) { return Number.isInteger(v) ? String(v) : (v < 0 ? '-' : '') + '\\dfrac{' + Math.abs(v * 2) + '}{2}'; };
            var pr = t('K\\!\\left(' + kT(Kp[0]) + ',\\ ' + kT(Kp[1]) + '\\right)') + ' and ' + t('L(' + kT(Lp[0]) + ',\\ ' + kT(Lp[1]) + ')');
            var sol = t('x_2-x_1=' + kT(Lp[0]) + '-\\left(' + kT(Kp[0]) + '\\right)=\\tfrac{' + o.p + '}{2}') + ', &nbsp;' + t('y_2-y_1=' + kT(Lp[1]) + '-' + kT(Kp[1]) + '=\\tfrac{' + o.q + '}{2}') + '.<br>' +
              t('KL=\\sqrt{\\left(\\tfrac{' + o.p + '}{2}\\right)^{2}+\\left(\\tfrac{' + o.q + '}{2}\\right)^{2}}=\\sqrt{\\tfrac{' + o.p * o.p + '}{4}+\\tfrac{' + o.q * o.q + '}{4}}=\\sqrt{\\tfrac{' + n + '}{4}}=\\dfrac{\\sqrt{' + n + '}}{2}=' + lenTex(n, 2)) + '.';
            var wrongs = [[n / 4, 'd-no-root', 'That is ' + t('d^{2}') + ' — take the square root.'], [Math.sqrt(n), 'd-half', 'Remember the ' + t('\\tfrac{1}{2}') + 's: ' + t('\\sqrt{\\tfrac{' + n + '}{4}}=\\dfrac{\\sqrt{' + n + '}}{\\sqrt{4}}=\\dfrac{\\sqrt{' + n + '}}{2}') + '.'], [Math.sqrt(n) / 4, 'd-half', t('\\sqrt{4}=2') + ', so ' + t('\\sqrt{\\tfrac{' + n + '}{4}}=\\dfrac{\\sqrt{' + n + '}}{2}') + ' (not ' + t('\\div 4') + ').']];
            var p = B.radical(pr, { k: s.k, n: 2, m: s.m }, 'mixed', sol, HD.concat(['Square each fraction: ' + t('\\left(\\tfrac{5}{2}\\right)^{2}=\\tfrac{25}{4}') + '. Then ' + t('\\sqrt{\\tfrac{a}{4}}=\\tfrac{\\sqrt{a}}{2}') + '.']), 'exact distance with halves', { diag: matchDiag(wrongs) });
            p.good = ['\\frac{' + s.k[0] + '}{' + s.k[1] + '}\\sqrt{' + s.m + '}']; p.bad = ['\\sqrt{' + n + '}', '\\frac{\\sqrt{' + n + '}}{4}'];
            return p;
          } }] },
        /* ---------------- Question 4: collinear points ---------------- */
        { num: '4', shared: q4shared,
          stem: function (o) { var Y = add(o.X, scl(o.v, o.a)), Z = add(Y, scl(o.v, o.b)); return 'Consider the points ' + t(nm('X', o.X)) + ', ' + t(nm('Y', Y)) + ', and ' + t(nm('Z', Z)) + '.'; },
          parts: [
            { id: '4a', sub: 'a', level: 'PRG', make: function (r, o) {
              var X = o.X, Y = add(X, scl(o.v, o.a)), Z = add(Y, scl(o.v, o.b)), n = [d2(X, Y), d2(Y, Z), d2(X, Z)];
              var sol = [['XY', X, Y], ['YZ', Y, Z], ['XZ', X, Z]].map(function (s, i) { return t(dLine(s[1], s[2], s[0]) + simpTail(n[i])); }).join('<br>');
              return B.fields('Calculate the exact lengths of ' + t('XY') + ', ' + t('YZ') + ', and ' + t('XZ') + ' (simplest radical form).', [lenField('XY'), lenField('YZ'), lenField('XZ')],
                [lenCheck(n[0], 1, { cands: dCands(X, Y) }), lenCheck(n[1], 1, { cands: dCands(Y, Z) }), lenCheck(n[2], 1, { cands: dCands(X, Z) })], n.map(function (x) { return lenKey(x); }),
                t('XY=' + lenTex(n[0]) + ',\\ YZ=' + lenTex(n[1]) + ',\\ XZ=' + lenTex(n[2])), sol, HD.concat(['Simplify each radical — then the three lengths are easy to compare.']), 'collinear lengths');
            } },
            { id: '4a2', sub: 'a, notice', level: 'EMG', make: function (r, o) {
              var c = o.v[0] * o.v[0] + o.v[1] * o.v[1], a = o.a, b = o.b, rt = '\\sqrt{' + c + '}', L = function (k) { return (k === 1 ? '' : k) + rt; };
              return mcPart(r, 'You found ' + t('XY=' + L(a) + ',\\ YZ=' + L(b) + ',\\ XZ=' + L(a + b)) + '. What do you notice?', [
                { html: t('XY+YZ=XZ') + ': ' + t(L(a) + '+' + L(b) + '=' + L(a + b)) + '.', right: true },
                { html: t('XY=YZ') + '.', why: 'Compare them: ' + t('XY=' + L(a)) + ' but ' + t('YZ=' + L(b)) + '.' },
                { html: t('XY^{2}+YZ^{2}=XZ^{2}') + '.', why: 'Check: ' + t(a * a * c + '+' + b * b * c + '=' + (a * a + b * b) * c) + ', but ' + t('XZ^{2}=' + (a + b) * (a + b) * c) + '.' },
                { html: t('XY\\times YZ=XZ') + '.', why: 'Check: ' + t(L(a) + '\\times ' + L(b) + '=' + a * b * c) + ', not ' + t(L(a + b)) + '.' }],
                'Like radicals add: ' + t(L(a) + '+' + L(b) + '=' + L(a + b)) + ', so ' + t('XY+YZ=XZ') + '.', ['Try adding two of the lengths.'], 'XY + YZ = XZ');
            } },
            { id: '4b', sub: 'b', level: 'EMG', make: function (r, o) {
              return mcPart(r, 'What does ' + t('XY+YZ=XZ') + ' mean with regard to the points ' + t('X') + ', ' + t('Y') + ', and ' + t('Z') + '?', [
                { html: 'The points are <b>collinear</b>: ' + t('Y') + ' lies on segment ' + t('XZ') + ', between ' + t('X') + ' and ' + t('Z') + '.', right: true },
                { html: t('XYZ') + ' is a right triangle with the right angle at ' + t('Y') + '.', why: 'A right angle at ' + t('Y') + ' would need ' + t('XY^{2}+YZ^{2}=XZ^{2}') + '. Here the trip ' + t('X\\to Y\\to Z') + ' is exactly as long as going straight from ' + t('X') + ' to ' + t('Z') + ', so there is no bend at ' + t('Y') + ' at all.' },
                { html: t('Y') + ' is the midpoint of ' + t('\\overline{XZ}') + '.', why: 'The midpoint would need ' + t('XY=YZ') + ' — here they are different.' },
                { html: 'The three points form an isosceles triangle.', why: 'There is no triangle: going via ' + t('Y') + ' adds no extra distance, so ' + t('Y') + ' is on the straight path from ' + t('X') + ' to ' + t('Z') + '.' }],
                'Travelling ' + t('X\\to Y\\to Z') + ' covers exactly the same distance as going straight from ' + t('X') + ' to ' + t('Z') + ', so there is no bend at ' + t('Y') + ': the points are <b>collinear</b>, with ' + t('Y') + ' on segment ' + t('XZ') + '.',
                ['If going through ' + t('Y') + ' is no longer than the straight path, where must ' + t('Y') + ' be?'], 'XY+YZ=XZ means collinear');
            } }] },
        /* ---------------- Question 5: prove a right angle ---------------- */
        { num: '5', shared: function (r) {
            if (r.chance(0.15)) return { A: [5, -1], B: [3, 5], C: [9, 7] };
            var o = pickWhere(function () { return rightTri(r, [[2, 6], [6, 2], [2, 4], [4, 2], [3, 3], [2, 2], [4, 4], [3, 6], [6, 3], [4, 6], [6, 4]], [1, 1, 2], 12); },
              function (z) { var n = d2(z.V, z.U), m = d2(z.V, z.W), h = d2(z.U, z.W); return !isSq(h) && radParts(h).k >= 2 && !isSq(m); });
            return { A: o.U, B: o.V, C: o.W };
          },
          stem: function (o) { return t('A') + ' is the point ' + t(ptT(o.A)) + ', ' + t('B') + ' is ' + t(ptT(o.B)) + ', and ' + t('C') + ' is ' + t(ptT(o.C)) + '.'; },
          parts: [
            { id: '5a', sub: 'a', level: 'PRG', make: function (r, o) {
              var n = [d2(o.A, o.B), d2(o.B, o.C), d2(o.A, o.C)];
              var sol = [['AB', o.A, o.B], ['BC', o.B, o.C], ['AC', o.A, o.C]].map(function (s, i) { return t(dLine(s[1], s[2], s[0]) + simpTail(n[i])); }).join('<br>');
              return B.fields('Calculate the exact lengths of ' + t('AB') + ', ' + t('BC') + ', and ' + t('AC') + ', in simplest radical form.', [lenField('AB'), lenField('BC'), lenField('AC')],
                [lenCheck(n[0], 1, { cands: dCands(o.A, o.B) }), lenCheck(n[1], 1, { cands: dCands(o.B, o.C) }), lenCheck(n[2], 1, { cands: dCands(o.A, o.C) })], n.map(function (x) { return lenKey(x); }),
                t('AB=' + lenTex(n[0]) + ',\\ BC=' + lenTex(n[1]) + ',\\ AC=' + lenTex(n[2])), sol, HD, 'right-angle lengths');
            } },
            { id: '5b', sub: 'b', level: 'EMG', make: function (r, o) {
              var n = [d2(o.A, o.B), d2(o.B, o.C), d2(o.A, o.C)], L = n.map(function (x) { return lenTex(x); });
              var opts = [
                { html: t('AB^{2}+BC^{2}=' + n[0] + '+' + n[1] + '=' + (n[0] + n[1]) + '=AC^{2}') + ', so by the converse of the Pythagorean theorem the right angle is opposite ' + t('AC') + ', at ' + t('B') + '.', right: true },
                { html: t('AB+BC>AC') + ', so ' + t('\\angle ABC') + ' is a right angle.', why: 'Two sides of <i>every</i> triangle add to more than the third side — that says nothing about a right angle. Compare the <b>squares</b> of the sides.' },
                { html: t('AC') + ' is the longest side, so the angle opposite it must be ' + t('90^{\\circ}') + '.', why: 'Every triangle has a longest side, but most have no right angle. You have to show ' + t('AB^{2}+BC^{2}=AC^{2}') + '.' },
                n[0] === n[1] ? { html: t('AB=BC') + ', so ' + t('\\angle ABC=90^{\\circ}') + '.', why: 'Two equal sides make the triangle isosceles, not necessarily right-angled. Test ' + t('AB^{2}+BC^{2}=AC^{2}') + '.' }
                  : { html: t('AB^{2}+AC^{2}=BC^{2}') + ', so ' + t('\\angle ABC') + ' is a right angle.', why: 'Check: ' + t('AB^{2}+AC^{2}=' + n[0] + '+' + n[2] + '=' + (n[0] + n[2])) + ', but ' + t('BC^{2}=' + n[1]) + '. The hypotenuse is the longest side, ' + t('AC') + '.' }];
              return mcPart(r, 'The side lengths are ' + t('AB=' + L[0]) + ', ' + t('BC=' + L[1]) + ' and ' + t('AC=' + L[2]) + '. Which argument uses these lengths to prove that ' + t('\\angle ABC') + ' is a right angle?', opts,
                t('AC') + ' is the longest side, so it is the candidate hypotenuse. ' + t('AB^{2}+BC^{2}=(' + L[0] + ')^{2}+(' + L[1] + ')^{2}=' + n[0] + '+' + n[1] + '=' + (n[0] + n[1])) + ' and ' + t('AC^{2}=(' + L[2] + ')^{2}=' + n[2]) + '. They are equal, so by the converse of the Pythagorean theorem the right angle is opposite ' + t('AC') + ', at vertex ' + t('B') + '.',
                ['The converse of the Pythagorean theorem: if ' + t('a^{2}+b^{2}=c^{2}') + ' for the sides of a triangle, the angle opposite ' + t('c') + ' is ' + t('90^{\\circ}') + '.'], 'prove angle ABC is right');
            } }] },
        /* ---------------- Question 6: ultimate frisbee ---------------- */
        { num: '6', section: 'Distance in context', shared: function (r) {
            if (r.chance(0.15)) return { T: [12, 20], C: [33, 40] };
            return pickWhere(function () { var T = [r.int(5, 20), r.int(10, 40)]; return { T: T, C: [r.int(T[0] + 6, 36), T[1] + r.int(8, 40)] }; }, function (z) { return z.T[0] !== z.T[1] && z.C[0] !== z.C[1]; });
          },
          stem: function (o) {
            return 'In an ultimate frisbee game, a player releases a throw from a spot ' + t(o.T[1]) + '&nbsp;m from the back line and ' + t(o.T[0]) + '&nbsp;m from the left sideline. A teammate catches the disc at a spot ' + t(o.C[0]) + '&nbsp;m from the left sideline and ' + t(o.C[1]) + '&nbsp;m from the back line. The first quadrant of a coordinate grid is superimposed on the field, with the origin at the corner where the back line meets the left sideline.' +
              FIELD;
          },
          parts: [
            { id: '6a', sub: 'a', level: 'EMG', make: function (r, o) {
              var sw = 'Careful: the ' + t('x') + '-axis runs along the back line, so an ' + t('x') + '-coordinate is the distance from the <b>left sideline</b>; a ' + t('y') + '-coordinate is the distance from the <b>back line</b>.';
              return B.fields('State the coordinates of the thrower and of the receiver with respect to this origin.', [ptField('Thrower'), ptField('Receiver')],
                [ptCheck(o.T, { swapHint: sw }), ptCheck(o.C, { swapHint: sw })], [ptKey(o.T), ptKey(o.C)], 'Thrower ' + t(ptT(o.T)) + ', receiver ' + t(ptT(o.C)),
                'The ' + t('x') + '-axis runs along the back line, so ' + t('x') + ' measures the distance from the left sideline; the ' + t('y') + '-axis runs along the sideline, so ' + t('y') + ' measures the distance from the back line.<br>Thrower: ' + t(o.T[0]) + '&nbsp;m from the sideline, ' + t(o.T[1]) + '&nbsp;m from the back line ' + t('\\Rightarrow ' + ptT(o.T)) + '.<br>Receiver: ' + t(o.C[0]) + '&nbsp;m from the sideline, ' + t(o.C[1]) + '&nbsp;m from the back line ' + t('\\Rightarrow ' + ptT(o.C)) + '.',
                ['Which line does the ' + t('x') + '-axis run along? A point’s ' + t('x') + '-coordinate is how far it is from the ' + t('y') + '-axis.'], 'frisbee coordinates');
            } },
            { id: '6b', sub: 'b', level: 'EMG', make: function (r, o) {
              var D = dist(o.T, o.C), dx = o.C[0] - o.T[0], dy = o.C[1] - o.T[1];
              return B.approx('Determine the length of the throw, to the nearest metre.', D, 0, { after: 'm', diag: matchDiag(dCands(o.T, o.C).concat([[dist([o.T[1], o.T[0]], o.C), 'ctx-swap', 'Check the thrower’s coordinates: ' + t('x') + ' is the distance from the sideline, so the thrower is at ' + t(ptT(o.T)) + '.']]), 0) },
                t('x_2-x_1=' + o.C[0] + '-' + o.T[0] + '=' + dx) + ', ' + t('y_2-y_1=' + o.C[1] + '-' + o.T[1] + '=' + dy) + '.<br>' + t('d=\\sqrt{' + dx + '^{2}+' + dy + '^{2}}=\\sqrt{' + (dx * dx) + '+' + (dy * dy) + '}=\\sqrt{' + (dx * dx + dy * dy) + '}' + (isSq(dx * dx + dy * dy) ? '=' + D : '\\approx ' + fx(D, 2))) + '. The throw is about ' + t(fx(D, 0)) + '&nbsp;m long.',
                HD, 'frisbee throw length');
            } }] },
        /* ---------------- Question 7: Maria and Nathan ---------------- */
        { num: '7', shared: function (r) {
            if (r.chance(0.15)) return { m: [5, 8], n: [7, 4], L: 110 };
            return pickWhere(function () { return { m: [r.int(2, 9), r.int(2, 9)], n: [r.int(2, 9), r.int(2, 9)], L: r.pick([110, 110, 80, 90, 100, 120, 150]) }; }, function (z) { return z.m[0] !== z.m[1] && z.n[0] !== z.n[1] && (z.m[0] !== z.n[0] || z.m[1] !== z.n[1]); });
          },
          stem: function (o) { return 'After school, Maria walks ' + t(o.m[0]) + ' blocks east and ' + t(o.m[1]) + ' blocks north to reach her house from the school. Nathan walks ' + t(o.n[0]) + ' blocks west and ' + t(o.n[1]) + ' blocks south to reach his house from the same school.'; },
          parts: [
            { id: '7a', sub: 'a', level: 'BEG', make: function (r, o) {
              var M = o.m, N = [-o.n[0], -o.n[1]];
              return B.fields('Taking the school as the origin, list the coordinates of each house.', [ptField('Maria'), ptField('Nathan')],
                [ptCheck(M, { swapHint: 'East–west distances are ' + t('x') + '-coordinates and north–south distances are ' + t('y') + '-coordinates: write (east, north).' }),
                  ptCheck(N, { cands: [[o.n, 'pt-dir', 'West is the <b>negative</b> ' + t('x') + '-direction and south is the <b>negative</b> ' + t('y') + '-direction.'], [[-o.n[0], o.n[1]], 'pt-dir', 'South is the negative ' + t('y') + '-direction.'], [[o.n[0], -o.n[1]], 'pt-dir', 'West is the negative ' + t('x') + '-direction.'], [[-o.n[1], -o.n[0]], 'pt-swap', 'Write (east–west, north–south): the blocks west give the ' + t('x') + '-coordinate.']] })],
                [ptKey(M), ptKey(N)], 'Maria ' + t(ptT(M)) + ', Nathan ' + t(ptT(N)),
                'East is ' + t('+x') + ' and north is ' + t('+y') + ', with the school at the origin; west and south are negative.<br>Maria: ' + t(o.m[0]) + ' east, ' + t(o.m[1]) + ' north ' + t('\\Rightarrow ' + ptT(M)) + '. Nathan: ' + t(o.n[0]) + ' west, ' + t(o.n[1]) + ' south ' + t('\\Rightarrow ' + ptT(N)) + '.',
                ['East and north are positive; west and south are negative.'], 'house coordinates');
            } },
            { id: '7b', sub: 'b', level: 'PRG', make: function (r, o) {
              var M = o.m, N = [-o.n[0], -o.n[1]], nb = d2(M, N), Db = Math.sqrt(nb), D = Db * o.L, dx = M[0] - N[0], dy = M[1] - N[1];
              var c = [[Db, 'd-units', 'That is the distance in <b>blocks</b>. Multiply by ' + t(o.L) + ' to get metres.'], [(o.m[0] + o.m[1] + o.n[0] + o.n[1]) * o.L, 'd-walk', 'That is how far the two walk along the streets. The <b>direct</b> distance is a straight line between the houses — use the distance formula.'],
                [Math.sqrt(sq(o.m[0] - o.n[0]) + sq(o.m[1] - o.n[1])) * o.L, 'd-no-neg', 'Nathan’s house has negative coordinates, ' + t(ptT(N)) + '. Then ' + t('x_2-x_1=' + M[0] + '-(' + N[0] + ')=' + dx) + '.'], [nb * o.L, 'd-no-root', 'Take the square root before converting to metres.']].concat(dCands(N, M, o.L));
              return B.approx('If a block represents ' + t(o.L) + '&nbsp;metres, determine the direct distance, to the nearest metre, between the two houses.', D, 0, { after: 'm', diag: matchDiag(c, 0) },
                t('x_2-x_1=' + M[0] + '-(' + N[0] + ')=' + dx) + ', ' + t('y_2-y_1=' + M[1] + '-(' + N[1] + ')=' + dy) + '.<br>' + t('d=\\sqrt{' + dx + '^{2}+' + dy + '^{2}}=\\sqrt{' + nb + '}' + simpTail(nb) + (isSq(nb) ? '' : '\\approx ' + fx(Db, 4))) + ' blocks.<br>Each block is ' + t(o.L) + '&nbsp;m: ' + t((isSq(nb) ? nT(Db) + '\\times ' + o.L + '=' : fx(Db, 4) + '\\times ' + o.L + '\\approx ') + fx(D, 0)) + '&nbsp;m.',
                ['Find the distance in blocks with the distance formula, then multiply by the length of one block.', 'Round only at the very end.'], 'direct distance between houses');
            } }] },
        /* ---------------- Question 8: bush plane ---------------- */
        { num: '8', shared: function (r) {
            if (r.chance(0.15)) return { pts: [[0, 140], [255, 195], [300, 160], [410, 205], [495, 165]] };
            return pickWhere(function () {
              var y0 = 5 * r.int(20, 36), xs = [0, 5 * r.int(40, 54), 5 * r.int(6, 12), 5 * r.int(16, 24), 5 * r.int(12, 20)], dy = [5 * r.int(5, 12), -5 * r.int(5, 10), 5 * r.int(5, 12), -5 * r.int(5, 10)];
              var pts = [[0, y0]]; for (var i = 1; i < 5; i++) pts.push([pts[i - 1][0] + xs[i], pts[i - 1][1] + dy[i - 1]]);
              return { pts: pts };
            }, function (z) { return z.pts.every(function (p) { return p[1] >= 60 && p[1] <= 240 && p[0] <= 520; }); });
          },
          stem: function (o) {
            var N = ['A', 'B', 'C', 'D', 'E'];
            return 'A bush plane on a survey flight records GPS checkpoints along its route. The graph shows part of the route (distances in km east and north of the airstrip it took off from): ' + o.pts.map(function (p, i) { return t(nm(N[i], p)); }).join(', ') + '.' +
              '<div class="fig">' + HW.graph({ x: [0, 550], y: [0, 250], grid: 50, labelsX: 100, labelsY: 50, unit: 0.6, firstQuadrant: true, xTitle: 'Distance (km) east of airstrip', yTitle: 'km north', max: 380,
                segs: [{ pts: o.pts, start: 'closed', end: 'closed' }], points: o.pts.map(function (p, i) { return { x: p[0], y: p[1], label: N[i] }; }) }) + '</div>';
          },
          parts: [
            { id: '8a', sub: 'a', level: 'LIM', make: function (r, o) {
              var y = o.pts[0][1];
              return mcPart(r, 'Describe the position of checkpoint ' + t('A') + ' relative to the airstrip.', [
                { html: t(y) + '&nbsp;km due north of the airstrip.', right: true },
                { html: t(y) + '&nbsp;km due east of the airstrip.', why: 'The first coordinate is the distance east. ' + t('A') + '’s first coordinate is ' + t('0') + ', so it is not east of the airstrip at all.' },
                { html: t(y) + '&nbsp;km north-east of the airstrip.', why: 'North-east would need a positive east coordinate too. ' + t('A') + ' is ' + t('0') + '&nbsp;km east.' },
                { html: 'At the airstrip.', why: 'The airstrip is the origin ' + t('(0,\\ 0)') + '. ' + t('A') + ' is ' + t(y) + '&nbsp;km north of it.' }],
                t(nm('A', o.pts[0])) + ': its east-coordinate is ' + t('0') + ' and its north-coordinate is ' + t(y) + ', so checkpoint ' + t('A') + ' is ' + t(y) + '&nbsp;km <b>due north</b> of the airstrip.', ['The first coordinate is km east, the second is km north.'], 'position of checkpoint A');
            } },
            { id: '8b', sub: 'b', level: 'PRG', make: function (r, o) {
              var N = ['A', 'B', 'C', 'D', 'E'], segs = [], tot = 0, totR = 0;
              for (var i = 0; i < 4; i++) { var dd = dist(o.pts[i], o.pts[i + 1]); segs.push(dd); tot += dd; totR += rd(dd, 0); }
              var straight = dist(o.pts[0], o.pts[4]), hv = 0; for (var j = 0; j < 4; j++) hv += Math.abs(o.pts[j + 1][0] - o.pts[j][0]) + Math.abs(o.pts[j + 1][1] - o.pts[j][1]);
              var c = [[straight, 'd-straight', 'That is the straight-line distance from ' + t('A') + ' to ' + t('E') + '. The plane flew along four segments: find each length and add them.'], [hv, 'd-legs', 'You added the east and north changes. Each segment is a hypotenuse: use the distance formula for each one.']];
              if (Math.abs(rd(totR, 0) - rd(tot, 0)) > 0.5) c.push([totR, 'd-round-early', 'Close — you rounded each segment before adding. Keep the decimals and round only the total.']);
              c.push([segs[0], 'd-straight', 'That is only ' + t('AB') + '. Add all four segments.']);
              var sol = 'Add the four segment lengths.<br>' + segs.map(function (s, k) { var a = o.pts[k], b2 = o.pts[k + 1], dx = b2[0] - a[0], dy = b2[1] - a[1]; return t(N[k] + N[k + 1] + '=\\sqrt{' + sgp(dx) + '^{2}+' + sgp(dy) + '^{2}}=\\sqrt{' + F(dx * dx + dy * dy) + '}\\approx ' + fx(s, 2)); }).join('<br>') + '<br>Total ' + t('\\approx ' + segs.map(function (s) { return fx(s, 2); }).join('+') + '\\approx ' + fx(tot, 0)) + '&nbsp;km.';
              return B.approx('Calculate the total distance flown by the plane from ' + t('A') + ' to ' + t('E') + ', to the nearest kilometre.', tot, 0, { after: 'km', diag: matchDiag(c, 0) }, sol,
                ['The route is made of four straight segments: ' + t('AB') + ', ' + t('BC') + ', ' + t('CD') + ' and ' + t('DE') + '. Use the distance formula for each.', 'Keep the decimals until you have added all four, then round.'], 'total distance flown');
            } }] },
        /* ---------------- Question 9: MC distance ---------------- */
        { num: '9', section: 'Multiple choice', parts: [
          { id: '9', level: 'LIM', make: function (r) {
            var P0, L;
            if (r.chance(0.2)) { P0 = [3, -2]; L = [4, 3]; } else { L = triple(r, 8); P0 = [r.int(1, 6), r.int(-5, -1)]; }
            var Q = add(P0, L), dx = L[0], dy = L[1], D = Math.sqrt(dx * dx + dy * dy);
            return mcPart(r, '<i>(Multiple Choice)</i> The distance between the points ' + t(ptT(P0)) + ' and ' + t(ptT(Q)) + ' is', [
              { html: t(D), right: true },
              { html: t('\\sqrt{' + dx * dy + '}'), why: 'That multiplies the run by the rise. Square each one and add: ' + t('\\sqrt{' + dx + '^{2}+' + dy + '^{2}}') + '.' },
              { html: t(dx + dy), why: 'That adds the run and the rise. The distance is the hypotenuse: ' + t('\\sqrt{' + dx + '^{2}+' + dy + '^{2}}') + '.' },
              { html: t(dx * dx + dy * dy), why: 'That is ' + t('d^{2}') + '. Take the square root.' }],
              dSteps(P0, Q) + '<br>' + t('d=\\sqrt{' + dx + '^{2}+' + dy + '^{2}}=\\sqrt{' + dx * dx + '+' + dy * dy + '}=\\sqrt{' + (dx * dx + dy * dy) + '}=' + D) + '.', HD, 'MC distance');
          } }] },
        /* ---------------- Question 10: MC equidistant point ---------------- */
        { num: '10', parts: [
          { id: '10', level: 'PRG', make: function (r) {
            var o = r.chance(0.2) ? { A: [-3, 8], B: [-7, -4], tt: -1, dis: [[0, 0], [6, 6], [-10, -10]] } : pickWhere(function () {
              var A = [r.int(-6, 0), r.int(3, 9)], h = [r.pick(pm(1, 3)), r.pick(pm(2, 6))];
              return { A: A, B: add(A, scl(h, 2)), tt: r.pick([1, -1, 2]) };
            }, function (z) { return Math.abs(z.B[1]) <= 12 && Math.abs(z.B[0]) <= 12; });
            var M = mid(o.A, o.B), h = sub(o.B, M), g = gcd(h[0], h[1]), pp = [h[1] / g, -h[0] / g], X = add(M, scl(pp, o.tt));
            var dis = o.dis || ([[0, 0]].filter(function (q) { return Math.abs(d2(q, o.A) - d2(q, o.B)) >= 4; }).concat(ptsOpt(r, o.A, o.B, 4))).filter(function (q, i, arr) { return !samePt(q, X) && !arr.slice(0, i).some(function (p) { return samePt(p, q); }); }).slice(0, 3);
            var opts = [{ html: t(ptT(X)), right: true }].concat(dis.map(function (q) { return { html: t(ptT(q)), why: eqWhy(q, o.A, 'A', o.B, 'B') + ' Equidistant means the two distances are equal.' }; }));
            return mcPart(r, '<i>(Multiple Choice)</i> Which of the following points is equidistant from ' + t(nm('A', o.A)) + ' and ' + t(nm('B', o.B)) + '?', opts,
              'Compare <b>squared</b> distances to ' + t('A') + ' and ' + t('B') + ' (equal squares mean equal distances).<br>' + t(ptT(X)) + ': ' + t('(' + nT(X[0]) + '-' + sgp(o.A[0]) + ')^{2}+(' + nT(X[1]) + '-' + sgp(o.A[1]) + ')^{2}=' + d2(X, o.A)) + ' and ' + t('(' + nT(X[0]) + '-' + sgp(o.B[0]) + ')^{2}+(' + nT(X[1]) + '-' + sgp(o.B[1]) + ')^{2}=' + d2(X, o.B)) + '. Equal ✓<br>' + dis.map(function (q) { return t(ptT(q)) + ': ' + t(d2(q, o.A)) + ' vs ' + t(d2(q, o.B)) + '.'; }).join(' &nbsp;'),
              ['Use the distance formula from each option to ' + t('A') + ' and to ' + t('B') + '. You can compare the squared distances — no square roots needed.'], 'MC equidistant point');
          } }] },
        /* ---------------- Question 11: midpoints ---------------- */
        { num: '11', section: 'Midpoints', stem: 'Determine the coordinates of the midpoint of the line segment with the given pair of endpoints.', parts: [
          { id: '11a', level: 'BEG', make: function (r) {
            var o = r.chance(0.15) ? { A: [3, 5], C: [9, 13] } : pickWhere(function () { var A = [r.int(1, 8), r.int(1, 8)]; return { A: A, C: [A[0] + 2 * r.int(1, 5), A[1] + 2 * r.int(1, 6)] }; }, function () { return true; });
            return ptPart(t(nm('A', o.A) + ',\\ ' + nm('C', o.C)), mid(o.A, o.C), { cands: midCands(o.A, o.C) }, t(mLine(o.A, o.C)) + '.', HM, 'midpoint ' + ptT(o.A) + ', ' + ptT(o.C));
          } },
          { id: '11b', level: 'EMG', make: function (r) {
            var o = r.chance(0.15) ? { X: [-4, -9], Y: [-12, 3] } : pickWhere(function () { var X = [-r.int(1, 8), -r.int(2, 10)]; return { X: X, Y: [-r.int(5, 14), r.int(1, 9)] }; }, function (z) { return (z.X[0] + z.Y[0]) % 2 === 0 && (z.X[1] + z.Y[1]) % 2 === 0 && z.X[0] !== z.Y[0] && z.X[1] + z.Y[1] !== 0; });
            return ptPart(t(nm('X', o.X) + ',\\ ' + nm('Y', o.Y)), mid(o.X, o.Y), { cands: midCands(o.X, o.Y) }, t(mLine(o.X, o.Y)) + '.', HM, 'midpoint ' + ptT(o.X) + ', ' + ptT(o.Y));
          } },
          { id: '11c', level: 'EMG', make: function (r) {
            var o = r.chance(0.15) ? { K: [11, -15], L: [-9, 7] } : pickWhere(function () { return { K: [r.int(5, 14), -r.int(5, 16)], L: [-r.int(3, 12), r.int(2, 10)] }; }, function (z) { var m = mid(z.K, z.L); return Number.isInteger(m[0]) && Number.isInteger(m[1]) && m[0] !== 0 && m[1] !== 0; });
            return ptPart(t(nm('K', o.K) + ',\\ ' + nm('L', o.L)), mid(o.K, o.L), { cands: midCands(o.K, o.L) }, t(mLine(o.K, o.L)) + '.', HM, 'midpoint ' + ptT(o.K) + ', ' + ptT(o.L));
          } },
          { id: '11d', level: 'BEG', make: function (r) {
            var A = r.chance(0.15) ? [-30, 42] : [-2 * r.int(6, 25), 2 * r.int(6, 25)], O = [0, 0];
            return ptPart(t(nm('A', A) + ',\\ ' + nm('O', O)), mid(A, O), { cands: midCands(A, O).filter(function (c) { return c[1] !== 'mid-subtract'; }) }, t(mLine(A, O)) + '.', HM, 'midpoint with the origin');
          } },
          { id: '11e', level: 'EMG', make: function (r) {
            var o = r.chance(0.15) ? { P: [-3.5, 4.2], Q: [2.5, -7.8] } : pickWhere(function () { return { P: [-r.int(1, 6) - 0.5, r.int(11, 89) / 10], Q: [r.int(0, 5) + 0.5, -r.int(11, 89) / 10] }; },
              function (z) { var sy = Math.round((z.P[1] + z.Q[1]) * 10); return sy % 2 === 0 && sy !== 0 && z.P[1] % 1 !== 0 && z.Q[1] % 1 !== 0 && Math.round(z.P[0] + z.Q[0]) % 2 !== 0; });
            var W = mid(o.P, o.Q), p = ptPart(t(nm('P', o.P) + ',\\ ' + nm('Q', o.Q)), W, { cands: midCands(o.P, o.Q) }, t(mLine(o.P, o.Q)) + '.', HM, 'midpoint with decimals');
            return p;
          } },
          { id: '11f', level: 'BEG', make: function (r) {
            var o = r.chance(0.15) ? { E: [-4, 9], F: [8, 3] } : pickWhere(function () { return { E: [-r.int(1, 8), r.int(3, 12)], F: [r.int(2, 12), r.int(1, 10)] }; }, function (z) { return (z.E[0] + z.F[0]) % 2 === 0 && (z.E[1] + z.F[1]) % 2 === 0 && z.E[1] !== z.F[1] && z.E[0] + z.F[0] !== 0; });
            return ptPart(t(nm('E', o.E) + ',\\ ' + nm('F', o.F)), mid(o.E, o.F), { cands: midCands(o.E, o.F) }, t(mLine(o.E, o.F)) + '.', HM, 'midpoint ' + ptT(o.E) + ', ' + ptT(o.F));
          } }] },
        /* ---------------- Question 12: find x ---------------- */
        { num: '12', stem: 'In each case, ' + t('M') + ' is the midpoint of ' + t('\\overline{AB}') + '. Determine the value of ' + t('x') + '.', parts: [
          { id: '12a', level: 'PRG', make: function (r) {
            var o = r.chance(0.15) ? { A: [3, 7], bx: 9, my: 2 } : pickWhere(function () { var A = [r.int(1, 6), r.int(4, 10)]; return { A: A, bx: A[0] + 2 * r.int(1, 4), my: r.int(-2, A[1] - 2) }; }, function (z) { var x = 2 * z.my - z.A[1]; return x !== 0 && x !== z.my && x !== z.A[1] && z.my !== 0; });
            var A = o.A, mx = (A[0] + o.bx) / 2, x = 2 * o.my - A[1];
            var c = endNum(A[1], o.my).concat([[o.bx, 'end-used-x', 'Here ' + t('x') + ' is the <b>' + t('y') + '-coordinate</b> of ' + t('B') + '. The ' + t('x') + '-coordinates already check out; use the ' + t('y') + '-coordinates: ' + t('\\dfrac{' + A[1] + '+x}{2}=' + o.my) + '.'], [2 * mx - A[0], 'end-used-x', 'Use the ' + t('y') + '-coordinates — the unknown ' + t('x') + ' sits in the ' + t('y') + '-position of ' + t('B') + '.']]);
            return B.number(t(nm('A', A) + ',\\ B(' + o.bx + ',\\ x),\\ ' + nm('M', [mx, o.my])), x, numDiag(c),
              'The ' + t('x') + '-coordinates already check out: ' + t('\\dfrac{' + A[0] + '+' + o.bx + '}{2}=' + nT(mx)) + ' ✓. Use the ' + t('y') + '-equation:<br>' + t('\\dfrac{' + A[1] + '+x}{2}=' + o.my + '\\ \\Rightarrow\\ ' + A[1] + '+x=' + 2 * o.my + '\\ \\Rightarrow\\ x=' + x) + '.', HE, 'missing coordinate (y-position)');
          } },
          { id: '12b', level: 'PRG', make: function (r) {
            var o = r.chance(0.15) ? { A: [5, 8], by: 0, mx: 0 } : pickWhere(function () { var A = [r.int(2, 9), 2 * r.int(1, 5)]; return { A: A, by: 2 * r.int(-2, 2), mx: r.pick([0, 0, -1, 1, 2, -2]) }; }, function (z) { var x = 2 * z.mx - z.A[0]; return x !== 0 && z.by !== z.A[1] && x !== z.A[0]; });
            var A = o.A, my = (A[1] + o.by) / 2, x = 2 * o.mx - A[0];
            var c = endNum(A[0], o.mx).concat([[2 * my - A[1], 'end-used-x', 'Use the ' + t('x') + '-coordinates here — the unknown is the ' + t('x') + '-coordinate of ' + t('B') + '.']]);
            return B.number(t(nm('A', A) + ',\\ B(x,\\ ' + o.by + '),\\ ' + nm('M', [o.mx, my])), x, numDiag(c),
              'The ' + t('y') + '-coordinates already check out: ' + t('\\dfrac{' + A[1] + '+' + sgp(o.by) + '}{2}=' + nT(my)) + ' ✓. Use the ' + t('x') + '-equation:<br>' + t('\\dfrac{' + A[0] + '+x}{2}=' + o.mx + '\\ \\Rightarrow\\ ' + A[0] + '+x=' + 2 * o.mx + '\\ \\Rightarrow\\ x=' + x) + '.', HE, 'missing coordinate (x-position)');
          } }] },
        /* ---------------- Question 13: cell tower ---------------- */
        { num: '13', section: 'Midpoint in context', shared: function (r) {
            if (r.chance(0.15)) return { A: [2148, 1876], B: [3562, 2394], s: 50 };
            return pickWhere(function () { var A = [r.int(1500, 3000), r.int(1200, 2500)]; return { A: A, B: [A[0] + r.int(800, 1800), A[1] + r.int(200, 900)], s: r.pick([50, 50, 25, 40, 20]) }; }, function (z) { return (z.A[0] + z.B[0]) % 2 === 0 && (z.A[1] + z.B[1]) % 2 === 0; });
          },
          stem: function (o) { return 'A cell tower is to be built halfway between the rural towns of Ashford and Birchwood, with a service road connecting both towns to the tower. On a Cartesian plane, Ashford is located at ' + t(ptT(o.A)) + ' and Birchwood is located at ' + t(ptT(o.B)) + '.'; },
          parts: [
            { id: '13a', sub: 'a', level: 'EMG', make: function (r, o) {
              return ptPart('What are the coordinates of the tower?', mid(o.A, o.B), { cands: midCands(o.A, o.B) }, 'The tower is the midpoint of Ashford and Birchwood:<br>' + t(mLine(o.A, o.B)) + '.', HM, 'tower midpoint');
            } },
            { id: '13b', sub: 'b', level: 'PRG', make: function (r, o) {
              var u = dist(o.A, o.B), km = u * o.s / 1000, dx = o.B[0] - o.A[0], dy = o.B[1] - o.A[1];
              var c = [[km / 2, 'road-half', 'The road connects <b>both</b> towns to the tower, so it runs the whole way from Ashford to Birchwood — not just to the halfway point.'], [u, 'd-units', 'That is the length in grid units. Multiply by ' + t(o.s) + '&nbsp;m per unit, then change metres to kilometres.'],
                [u * o.s, 'd-metres', 'That is in metres. Divide by ' + t('1000') + ' to get kilometres.'], [u / o.s, 'd-scale-div', 'Each unit is ' + t(o.s) + '&nbsp;m, so <b>multiply</b> the number of units by ' + t(o.s) + '.'], [u * o.s / 2000, 'road-half', 'The road runs from Ashford to the tower <i>and</i> on to Birchwood: that is the full distance.']];
              return B.approx('Determine the length of the service road, to the nearest kilometre, if the grid scale is 1 unit represents ' + t(o.s) + '&nbsp;metres.', km, 0, { after: 'km', diag: matchDiag(c, 0) },
                'The tower sits on the straight line between the towns, so the road’s total length is the distance from Ashford to Birchwood.<br>' + t('d=\\sqrt{' + F(dx) + '^{2}+' + F(dy) + '^{2}}=\\sqrt{' + F(dx * dx) + '+' + F(dy * dy) + '}=\\sqrt{' + F(dx * dx + dy * dy) + '}\\approx ' + fx(u, 1)) + ' units.<br>' + t(fx(u, 1) + '\\times ' + o.s + '\\approx ' + F(rd(u * o.s, 0))) + '&nbsp;m ' + t('\\approx ' + fx(km, 0)) + '&nbsp;km.',
                ['The road goes from one town to the tower and on to the other town — what total length is that?', 'Convert: units → metres (× the scale) → kilometres (÷ 1000).'], 'service road length');
            } }] },
        /* ---------------- Question 14: right triangle and the midpoint of its hypotenuse ---------------- */
        { num: '14', section: 'Distance and midpoint together', shared: function (r) {
            var o;
            if (r.chance(0.15)) o = { V: [-2, 3], U: [1, 7], W: [-10, 9], at: 'D' };
            else {
              var z = pickWhere(function () { return rightTri(r, [[3, 4], [4, 3], [4, 2], [2, 4], [3, 1], [1, 3], [2, 3], [3, 2], [6, 8], [8, 6]], [2, 2, 1, 3], 13); }, function (q) { return !isSq(d2(q.U, q.W)); });
              o = { V: z.V, U: z.U, W: z.W, at: r.pick(['D', 'D', 'E', 'F']) };
            }
            var pts = {}; // the right angle is at vertex o.at; the other two names in order
            var others = ['D', 'E', 'F'].filter(function (n) { return n !== o.at; });
            pts[o.at] = o.V; pts[others[0]] = o.U; pts[others[1]] = o.W;
            return { P: pts, R: o.at, H: others };
          },
          stem: function (o) { return 'Consider ' + t('\\triangle DEF') + ' with vertices ' + t(nm('D', o.P.D)) + ', ' + t(nm('E', o.P.E)) + ', ' + t(nm('F', o.P.F)) + '.'; },
          parts: [
            { id: '14a', sub: 'a', level: 'PRG', make: function (r, o) {
              var S = [['D', 'E'], ['D', 'F'], ['E', 'F']], n = S.map(function (s) { return d2(o.P[s[0]], o.P[s[1]]); });
              return B.fields('Calculate the length of each side of the triangle (exact, or to the nearest tenth).', S.map(function (s) { return lenField(s[0] + s[1]); }),
                S.map(function (s, i) { return lenCheck(n[i], 1, { dec: true, cands: dCands(o.P[s[0]], o.P[s[1]]) }); }), n.map(function (x) { return lenKey(x); }),
                S.map(function (s, i) { return t(s[0] + s[1] + '=' + lenTex(n[i]) + (isSq(n[i]) ? '' : '\\approx ' + fx(Math.sqrt(n[i]), 1))); }).join(', '),
                S.map(function (s, i) { return t(dLine(o.P[s[0]], o.P[s[1]], s[0] + s[1]) + simpTail(n[i])); }).join('<br>'), HD, 'side lengths of DEF');
            } },
            { id: '14a2', sub: 'a, why', level: 'EMG', make: function (r, o) {
              var R = o.R, h = o.H, hy = h[0] + h[1], l1 = (R < h[0] ? R + h[0] : h[0] + R), l2 = (R < h[1] ? R + h[1] : h[1] + R);
              var n1 = d2(o.P[R], o.P[h[0]]), n2 = d2(o.P[R], o.P[h[1]]), nh = d2(o.P[h[0]], o.P[h[1]]);
              var wrongV = h[0];
              return mcPart(r, 'Explain why the triangle is right angled.', [
                { html: t(l1 + '^{2}+' + l2 + '^{2}=' + n1 + '+' + n2 + '=' + nh + '=' + hy + '^{2}') + ', so by the converse of the Pythagorean theorem the triangle has a right angle at ' + t(R) + '.', right: true },
                { html: t(l1 + '^{2}+' + l2 + '^{2}=' + hy + '^{2}') + ', so the right angle is at ' + t(wrongV) + '.', why: 'The relationship is right, but the right angle is <b>opposite</b> the hypotenuse ' + t(hy) + ' — at the vertex the two shorter sides share, ' + t(R) + '.' },
                { html: 'The three sides have different lengths, so one angle must be ' + t('90^{\\circ}') + '.', why: 'Most triangles with three different sides have no right angle. Test whether the squares of the two shorter sides add to the square of the longest.' },
                { html: t(l1 + '+' + l2 + '>' + hy) + ', so the triangle is right angled.', why: 'That is true for every triangle. A right angle needs the <b>squares</b>: ' + t(l1 + '^{2}+' + l2 + '^{2}=' + hy + '^{2}') + '.' }],
                t(hy) + ' is the longest side. ' + t(l1 + '^{2}+' + l2 + '^{2}=' + n1 + '+' + n2 + '=' + nh) + ' and ' + t(hy + '^{2}=' + nh) + '. They match, so ' + t('\\triangle DEF') + ' is right angled at ' + t(R) + ' — the vertex opposite the longest side.',
                ['Use the converse of the Pythagorean theorem on your three lengths.'], 'why DEF is right angled');
            } },
            { id: '14b', sub: 'b', level: 'EMG', make: function (r, o) {
              var h = o.H, Pa = o.P[h[0]], Pb = o.P[h[1]], R = o.P[o.R], N = mid(Pa, Pb);
              var hs = 'That is the midpoint of a <b>leg</b>. The hypotenuse is the longest side, ' + t(h[0] + h[1]) + ', opposite the right angle.';
              var c = midCands(Pa, Pb).concat([[mid(R, Pa), 'mid-wrong-seg', hs], [mid(R, Pb), 'mid-wrong-seg', hs]]);
              var p = ptPart('Calculate the coordinates of the midpoint, ' + t('N') + ', of the hypotenuse.', N, { cands: c, before: 'N =' }, t(h[0] + h[1]) + ' is the hypotenuse, so ' + t('N') + ' is the midpoint of ' + t(nm(h[0], Pa)) + ' and ' + t(nm(h[1], Pb)) + ':<br>' + t(mLine(Pa, Pb, 'N')) + '.', HM, 'midpoint of the hypotenuse');
              if (!Number.isInteger(N[0]) || !Number.isInteger(N[1])) p.good.push('\\left(' + (Number.isInteger(N[0]) ? N[0] : '\\frac{' + N[0] * 2 + '}{2}') + ',' + (Number.isInteger(N[1]) ? N[1] : '\\frac{' + N[1] * 2 + '}{2}') + '\\right)');
              return p;
            } },
            { id: '14c', sub: 'c', level: 'PRG', make: function (r, o) {
              var h = o.H, N = mid(o.P[h[0]], o.P[h[1]]), nh = d2(o.P[h[0]], o.P[h[1]]), V = ['D', 'E', 'F'];
              var cands = [[nh / 4, 'd-no-root', 'That is the squared distance — take the square root.'], [Math.sqrt(nh), 'd-half', 'That is the whole hypotenuse. ' + t('N') + ' is its midpoint, so the distance from ' + t('N') + ' to an end is half of it.']];
              return B.fields(t(nm('N', N)) + ' is the midpoint of the hypotenuse ' + t(h[0] + h[1]) + '. Calculate the distance from ' + t('N') + ' to each of the three vertices of the triangle (exact, or to the nearest tenth).', V.map(function (v) { return lenField('N' + v); }),
                V.map(function () { return lenCheck(nh, 2, { dec: true, cands: cands }); }), V.map(function () { return lenKey(nh, 2); }),
                t('ND=NE=NF=' + lenTex(nh, 2) + '\\approx ' + fx(Math.sqrt(nh) / 2, 1)),
                V.map(function (v) { var P2 = o.P[v], dx = cl(P2[0] - N[0]), dy = cl(P2[1] - N[1]); return t('N' + v + '=\\sqrt{' + sgp(dx) + '^{2}+' + sgp(dy) + '^{2}}=\\sqrt{' + nT(dx * dx) + '+' + nT(dy * dy) + '}=\\sqrt{' + nT(nh / 4) + '}'); }).join('<br>') + '<br>All three equal ' + t('\\sqrt{' + nT(nh / 4) + '}=\\sqrt{\\tfrac{' + nh + '}{4}}=' + lenTex(nh, 2) + '\\approx ' + fx(Math.sqrt(nh) / 2, 1)) + '.',
                HD.concat(['Use ' + t(nm('N', N)) + ' as one endpoint each time. With decimals, ' + t('2.5^{2}=6.25') + '.']), 'N to each vertex');
            } },
            { id: '14c2', sub: 'c, notice', level: 'EMG', make: function (r, o) {
              var Nn = mid(o.P[o.H[0]], o.P[o.H[1]]);
              return mcPart(r, t(nm('N', Nn)) + ' is the midpoint of the hypotenuse ' + t(o.H[0] + o.H[1]) + '. What do you notice about the three distances ' + t('ND') + ', ' + t('NE') + ' and ' + t('NF') + '?', [
                { html: 'They are equal: the midpoint of the hypotenuse is the same distance from all three vertices (half the hypotenuse).', right: true },
                { html: t('N') + ' is closest to the right-angle vertex ' + t(o.R) + '.', why: 'Compare your three answers — they are all the same.' },
                { html: 'They add up to the perimeter of the triangle.', why: 'Compare your three answers with each other: what do they have in common?' },
                { html: t('N') + ' is the same distance from only the two ends of the hypotenuse.', why: 'Check ' + t('N' + o.R) + ' as well — it matches the other two.' }],
                t('ND=NE=NF') + ': the midpoint of the hypotenuse is equidistant from all three vertices. (It is the centre of the circle through ' + t('D') + ', ' + t('E') + ' and ' + t('F') + ', and each distance is half the hypotenuse.)', ['Find ' + t('ND') + ', ' + t('NE') + ' and ' + t('NF') + ' with the distance formula and compare them.'], 'midpoint of hypotenuse equidistant');
            } }] },
        /* ---------------- Question 15: diagonals of a quadrilateral ---------------- */
        { num: '15', shared: function (r) {
            if (r.chance(0.15)) return { P: [1, 2], Q: [9, 4], R: [11, 10], S: [3, 8], para: true };
            return pickWhere(function () {
              var P0 = [r.int(0, 3), r.int(0, 3)], u = [r.int(5, 9), r.int(0, 3)], w = [r.int(1, 3), r.int(4, 7)], para = r.chance(0.75), sh = para ? [0, 0] : r.pick([[2, 0], [-2, 0], [0, 2], [0, -2]]);
              return { P: P0, Q: add(P0, u), S: add(P0, w), R: add(add(add(P0, u), w), sh), para: para };
            }, function (z) { return (z.Q[0] + z.S[0]) % 2 === 0 && (z.Q[1] + z.S[1]) % 2 === 0 && z.R[0] <= 12 && z.R[1] <= 12; });
          },
          stem: function (o) { return 'Quadrilateral ' + t('PQRS') + ' has vertices ' + t(nm('P', o.P)) + ', ' + t(nm('Q', o.Q)) + ', ' + t(nm('R', o.R)) + ', ' + t(nm('S', o.S)) + '.'; },
          parts: [
            { id: '15a', sub: 'a', level: 'BEG', make: function (r, o) {
              var hs = 'That is the midpoint of a side. A diagonal joins <b>opposite</b> vertices: ' + t('P') + ' and ' + t('R') + '.';
              return ptPart('Calculate the midpoint of diagonal ' + t('\\overline{PR}') + '.', mid(o.P, o.R), { cands: midCands(o.P, o.R).concat([[mid(o.P, o.Q), 'mid-wrong-seg', hs], [mid(o.P, o.S), 'mid-wrong-seg', hs]]) }, t(mLine(o.P, o.R)) + '.', HM, 'midpoint of PR');
            } },
            { id: '15b', sub: 'b', level: 'BEG', make: function (r, o) {
              var hs = 'That is the midpoint of a side. A diagonal joins <b>opposite</b> vertices: ' + t('Q') + ' and ' + t('S') + '.';
              return ptPart('Calculate the midpoint of diagonal ' + t('\\overline{QS}') + '.', mid(o.Q, o.S), { cands: midCands(o.Q, o.S).concat([[mid(o.Q, o.R), 'mid-wrong-seg', hs], [mid(o.P, o.Q), 'mid-wrong-seg', hs]]) }, t(mLine(o.Q, o.S)) + '.', HM, 'midpoint of QS');
            } },
            { id: '15c', sub: 'c', level: 'EMG', make: function (r, o) {
              var m1 = mid(o.P, o.R), m2 = mid(o.Q, o.S), eq = samePt(m1, m2);
              return mcPart(r, 'The midpoint of diagonal ' + t('\\overline{PR}') + ' is ' + t(ptT(m1)) + ' and the midpoint of diagonal ' + t('\\overline{QS}') + ' is ' + t(ptT(m2)) + '. What does this tell you about quadrilateral ' + t('PQRS') + '? (Recall: if the diagonals of a quadrilateral bisect each other, the quadrilateral is a parallelogram.)', [
                { html: 'The diagonals have the same midpoint, so they bisect each other: ' + t('PQRS') + ' is a parallelogram.', right: eq, why: eq ? null : 'Compare your answers: ' + t(ptT(m1)) + ' and ' + t(ptT(m2)) + ' are different points.' },
                { html: 'The diagonals have different midpoints, so they don’t bisect each other: ' + t('PQRS') + ' is not a parallelogram.', right: !eq, why: eq ? 'Look again: both diagonals have the midpoint ' + t(ptT(m1)) + '.' : null },
                { html: 'The diagonals are equal in length, so ' + t('PQRS') + ' is a rectangle.', why: 'Midpoints tell you where the diagonals cross, not how long they are. Lengths would need the distance formula.' },
                { html: 'Nothing — midpoints only describe a single segment.', why: 'If both diagonals have the same midpoint, each one cuts the other exactly in half. That is a property of parallelograms.' }],
                eq ? 'Both diagonals have the midpoint ' + t(ptT(m1)) + ', so each diagonal cuts the other in half — the diagonals <b>bisect each other</b>, and ' + t('PQRS') + ' is a <b>parallelogram</b>.' : 'The midpoints ' + t(ptT(m1)) + ' and ' + t(ptT(m2)) + ' are different, so the diagonals do not bisect each other: ' + t('PQRS') + ' is <b>not</b> a parallelogram.',
                ['Compare the two midpoints you found.'], 'diagonals bisect → parallelogram');
            } }] },
        /* ---------------- Question 16: MC equidistant from S and a midpoint ---------------- */
        { num: '16', section: 'Multiple choice and numerical response', parts: [
          { id: '16', level: 'PRG', make: function (r) {
            var o = r.chance(0.2) ? { P: [2, 11], Q: [10, 3], S: [-2, -5], tt: 2, bk: true } : pickWhere(function () {
              var P0 = [r.int(-2, 4), r.int(6, 12)], Q0 = [r.int(6, 12), r.int(0, 5)], S0 = [r.int(-6, 0), r.int(-8, -2)];
              return { P: P0, Q: Q0, S: S0, tt: r.pick([1, -1, 2, -2]) };
            }, function (z) { var M = mid(z.P, z.Q), h = sub(M, z.S); return Number.isInteger(M[0]) && Number.isInteger(M[1]) && h[0] % 2 === 0 && h[1] % 2 === 0; });
            var M = mid(o.P, o.Q), c = mid(o.S, M), h = sub(M, c), g = gcd(h[0], h[1]), pp = [h[1] / g, -h[0] / g], X = add(c, scl(pp, o.tt));
            if (Math.abs(X[0]) > 15 || Math.abs(X[1]) > 15) X = add(c, scl(pp, o.tt > 0 ? 1 : -1));
            var dis = [];
            var hP = sub(o.P, o.S); if (hP[0] % 2 === 0 && hP[1] % 2 === 0) { var cP = mid(o.S, o.P), gP = gcd(hP[0], hP[1]) / 2, pP = [hP[1] / 2 / gP, -hP[0] / 2 / gP], XP = add(cP, pP); if (Math.abs(d2(XP, o.S) - d2(XP, M)) >= 4) dis.push({ q: XP, why: 'That point is equidistant from ' + t('S') + ' and ' + t('P') + ' — but the question uses ' + t('M') + ', the midpoint of ' + t('\\overline{PQ}') + ', which is ' + t(ptT(M)) + '. ' + eqWhy(XP, o.S, 'S', M, 'M') }); }
            if (o.bk) dis = [[1, 5], [10, 0], [-4, 1]].map(function (q) { return { q: q, why: eqWhy(q, o.S, 'S', M, 'M') }; });
            ptsOpt(r, o.S, M, 4).forEach(function (q) { if (dis.length < 3 && !samePt(q, X) && !dis.some(function (d) { return samePt(d.q, q); })) dis.push({ q: q, why: eqWhy(q, o.S, 'S', M, 'M') }); });
            var opts = [{ html: t(ptT(X)), right: true }].concat(dis.slice(0, 3).map(function (d) { return { html: t(ptT(d.q)), why: d.why }; }));
            return mcPart(r, '<i>(Multiple Choice)</i> ' + t('\\overline{PQ}') + ' has endpoints ' + t(nm('P', o.P)) + ' and ' + t(nm('Q', o.Q)) + '. Which of the following points is equidistant from ' + t(nm('S', o.S)) + ' and ' + t('M') + ', the midpoint of ' + t('\\overline{PQ}') + '?', opts,
              'First, ' + t(mLine(o.P, o.Q, 'M')) + '. Now compare squared distances to ' + t('S') + ' and to ' + t('M') + ':<br>' + t(ptT(X)) + ': ' + t(d2(X, o.S)) + ' and ' + t(d2(X, M)) + '. Equal ✓<br>' + dis.slice(0, 3).map(function (d) { return t(ptT(d.q)) + ': ' + t(d2(d.q, o.S)) + ' vs ' + t(d2(d.q, M)) + '.'; }).join(' &nbsp;'),
              ['Find ' + t('M') + ' first. Then, for each option, compare the squared distances to ' + t('S') + ' and to ' + t('M') + '.'], 'MC equidistant from S and M');
          } }] },
        /* ---------------- Question 17: MC always true ---------------- */
        { num: '17', parts: [
          { id: '17', level: 'PRG', make: function (r) {
            var FAL = [
              { html: 'Two segments of equal length always share the same midpoint.', why: 'Two segments of length ' + t('4') + ' in different places have equal lengths but different midpoints.' },
              { html: 'Two segments that share the same midpoint are always equal in length.', why: 'The segments from ' + t('(-1,\\ 0)') + ' to ' + t('(1,\\ 0)') + ' and from ' + t('(0,\\ -5)') + ' to ' + t('(0,\\ 5)') + ' share the midpoint ' + t('(0,\\ 0)') + ', but their lengths are ' + t('2') + ' and ' + t('10') + '.' },
              { html: 'Any point equidistant from the endpoints of a segment must be that segment’s midpoint.', why: 'Every point on the perpendicular bisector is equidistant from the endpoints — only one of those points is the midpoint.' },
              { html: 'The midpoint of a segment always has whole-number coordinates when both endpoints do.', why: 'The midpoint of ' + t('(0,\\ 0)') + ' and ' + t('(3,\\ 0)') + ' is ' + t('(1.5,\\ 0)') + '.' },
              { html: 'The distance from ' + t('A') + ' to ' + t('B') + ' can be different from the distance from ' + t('B') + ' to ' + t('A') + '.', why: 'Swapping the points changes the sign of each difference, and squaring erases the sign — the distance is the same.' },
              { html: 'If ' + t('M') + ' is the midpoint of ' + t('\\overline{AB}') + ', then ' + t('AM+MB') + ' is greater than ' + t('AB') + '.', why: t('M') + ' lies on the segment, so ' + t('AM+MB=AB') + ' exactly.' }];
            var TRU = [
              { html: 'The midpoint of a segment is the same distance from both endpoints.' },
              { html: 'If ' + t('M') + ' is the midpoint of ' + t('\\overline{PQ}') + ', then ' + t('PM') + ' is half of ' + t('PQ') + '.' },
              { html: 'Swapping which endpoint is called ' + t('(x_1,\\ y_1)') + ' does not change the distance between two points.' }];
            var three, oneTrue = !r.chance(0.6);
            if (!oneTrue) three = r.chance(0.5) ? FAL.slice(0, 3) : r.sample(FAL, 3);
            else { var tr = r.pick(TRU); three = r.sample(FAL, 2).concat([{ html: tr.html, right: true }]); }
            three = r.shuffle(three);
            var none = { html: 'None of the above statements is always true.', right: !oneTrue, why: oneTrue ? 'One of the statements is always true — look for the one about a single segment and its own midpoint or length.' : null };
            var opts = three.map(function (s) { return s.right ? s : { html: s.html, why: 'Not always: ' + s.why }; }).concat([none]);
            return mcPart(r, '<i>(Multiple Choice)</i> Which statement is always true?', opts,
              three.map(function (s, i) { return '<b>' + 'ABC'[i] + '.</b> ' + (s.right ? 'Always true.' : 'False — ' + s.why); }).join('<br>') + '<br>' + (oneTrue ? 'So the answer is the true statement, not D.' : 'All three fail, so the answer is <b>D</b>.'),
              ['For each statement, try to find one example where it fails (a counterexample).'], 'MC always true (midpoint/distance)', true);
          } }] },
        /* ---------------- Question 18: NR missing endpoint ---------------- */
        { num: '18', parts: [
          { id: '18', level: 'PRG', make: function (r) {
            var o = r.chance(0.2) ? { M: [2, -4], T: [-5, 3] } : pickWhere(function () { return { M: [r.int(1, 6), r.int(-8, 4)], T: [r.int(-8, -1), r.int(-6, 8)] }; }, function (z) { var x = 2 * z.M[0] - z.T[0]; return x > 0 && x < 100 && z.M[1] !== z.T[1]; });
            var x = 2 * o.M[0] - o.T[0], y = 2 * o.M[1] - o.T[1];
            var c = endNum(o.T[0], o.M[0]).concat([[y, 'end-gave-y', 'That is the ' + t('y') + '-coordinate of ' + t('S') + '. The question asks for ' + t('x') + '.']]);
            return B.nr('<i>(Numerical Response)</i> The midpoint of line segment ' + t('ST') + ' is ' + t(nm('M', o.M)) + '. If the coordinates of ' + t('T') + ' are ' + t(ptT(o.T)) + ', and the coordinates of ' + t('S') + ' are ' + t('(x,\\ y)') + ', the value of ' + t('x') + ' is ______.', x, numDiag(c),
              t('M') + ' is the midpoint of ' + t('\\overline{ST}') + ', so work backward: ' + t('S=2M-T') + '.<br>' + t('x=2(' + o.M[0] + ')-' + sgp(o.T[0]) + '=' + 2 * o.M[0] + (o.T[0] < 0 ? '+' + (-o.T[0]) : '-' + o.T[0]) + '=' + x) + ' (and ' + t('y=2(' + o.M[1] + ')-' + sgp(o.T[1]) + '=' + y) + ').', HE, 'NR missing endpoint x');
          } }] }
      ],
      extra: EXTRA()
    });
    function sq(x) { return x * x; }

    /* =============================== Extra practice (u6_EP02) =============================== */
    function EXTRA() {
      return [
        /* ---- EP 1: triangle PQR ---- */
        { num: '1', section: 'Extra practice A — One figure, two formulas', shared: function (r) {
            if (r.chance(0.2)) return { P: [-4, -1], Q: [2, 7], R: [8, -1] };
            var L = triple(r, 12), a = [r.int(-6, 0), r.int(-4, 3)], up = r.chance(0.75) ? 1 : -1;
            return { P: a, Q: [a[0] + L[0], a[1] + up * L[1]], R: [a[0] + 2 * L[0], a[1]] };
          },
          stem: function (o) { return t('\\triangle PQR') + ' has vertices ' + t(nm('P', o.P)) + ', ' + t(nm('Q', o.Q)) + ', and ' + t(nm('R', o.R)) + ', as shown.' + figPoly([o.P, o.Q, o.R], ['P', 'Q', 'R'], { closed: true }); },
          parts: [
            { id: 'e1a', sub: 'a', level: 'EMG', make: function (r, o) {
              var a = dist(o.P, o.Q), b = dist(o.Q, o.R), c = dist(o.P, o.R), per = a + b + c;
              return B.number('Determine the perimeter of ' + t('\\triangle PQR') + '.', per, numDiag([[a + c, 'per-side', 'A perimeter adds <b>all three</b> sides.'], [2 * a, 'per-side', 'Add the third side, ' + t('PR') + ', too.'], [a * a + b * b + c * c, 'd-no-root', 'Take the square root of each squared length before adding.']]),
                t(dLine(o.P, o.Q, 'PQ') + simpTail(d2(o.P, o.Q))) + '<br>' + t(dLine(o.Q, o.R, 'QR') + simpTail(d2(o.Q, o.R))) + '<br>' + t(dLine(o.P, o.R, 'PR') + simpTail(d2(o.P, o.R))) + '<br>Perimeter ' + t('=' + a + '+' + b + '+' + c + '=' + per) + ' units.', HD, 'perimeter of PQR', { after: 'units' });
            } },
            { id: 'e1b', sub: 'b', level: 'BEG', make: function (r, o) {
              var S = [['P', 'Q'], ['Q', 'R'], ['P', 'R']], W = S.map(function (s) { return mid(o[s[0]], o[s[1]]); });
              return B.fields('Determine the coordinates of the midpoint of each of the three sides.', S.map(function (s) { return ptField(t('\\overline{' + s[0] + s[1] + '}')); }),
                S.map(function (s, i) { return ptCheck(W[i], { cands: midCands(o[s[0]], o[s[1]]) }); }), W.map(ptKey), S.map(function (s, i) { return t('\\overline{' + s[0] + s[1] + '}') + ': ' + t(ptT(W[i])); }).join('<br>'),
                'Average each coordinate.<br>' + S.map(function (s) { return t(mLine(o[s[0]], o[s[1]])); }).join('<br>'), HM, 'midpoints of PQR');
            } },
            { id: 'e1c', sub: 'c', level: 'BEG', make: function (r, o) {
              var m1 = mid(o.P, o.Q), m2 = mid(o.Q, o.R), L = dist(m1, m2);
              return B.number('Determine the length of the segment joining the midpoint of ' + t('\\overline{PQ}') + ' to the midpoint of ' + t('\\overline{QR}') + '.', L, numDiag([[dist(o.P, o.R), 'd-half', 'That is the length of ' + t('PR') + '. Use the two midpoints ' + t(ptT(m1)) + ' and ' + t(ptT(m2)) + ' as the endpoints.']]),
                'From ' + t(ptT(m1)) + ' to ' + t(ptT(m2)) + ': ' + t(dLine(m1, m2, 'd') + '=' + nT(L)) + '.', ['Find the two midpoints first (part b), then use the distance formula between them.'], 'midsegment length', { after: 'units' });
            } },
            { id: 'e1c2', sub: 'c, compare', level: 'EMG', make: function (r, o) {
              var L = dist(mid(o.P, o.Q), mid(o.Q, o.R)), PR = dist(o.P, o.R);
              return mcPart(r, 'The segment joining the midpoint of ' + t('\\overline{PQ}') + ' to the midpoint of ' + t('\\overline{QR}') + ' has length ' + t(nT(L)) + '. Compare that length to the length of ' + t('\\overline{PR}') + '.', [
                { html: 'It is exactly half as long as ' + t('\\overline{PR}') + ' (and parallel to it).', right: true },
                { html: 'It is the same length as ' + t('\\overline{PR}') + '.', why: t('PR=' + nT(PR)) + ' — compare it with ' + t(nT(L)) + '.' },
                { html: 'It is twice as long as ' + t('\\overline{PR}') + '.', why: t('PR=' + nT(PR)) + ' is the longer one.' },
                { html: 'There is no simple relationship.', why: 'Divide: ' + t(nT(PR) + '\\div ' + nT(L) + '=2') + '.' }],
                t('PR=' + nT(PR)) + ' and the segment joining the midpoints is ' + t(nT(L)) + ', so it is exactly <b>half</b> as long as ' + t('\\overline{PR}') + ' (both are horizontal, so they are also parallel).', ['Find ' + t('PR') + ' and compare.'], 'midsegment is half');
            } }] },
        /* ---- EP 2: AB and its midpoint ---- */
        { num: '2', shared: function (r) {
            if (r.chance(0.2)) return { A: [-7, 4], h: [6, -8] };
            var L = triple(r, 8), h = [L[0], -L[1]]; if (r.chance(0.3)) h = [L[0], L[1]];
            return { A: [r.int(-8, -2), h[1] < 0 ? r.int(2, 8) : r.int(-8, -2)], h: h };
          },
          stem: function (o) { return t('\\overline{AB}') + ' has endpoints ' + t(nm('A', o.A)) + ' and ' + t(nm('B', add(o.A, scl(o.h, 2)))) + ', and ' + t('M') + ' is its midpoint.'; },
          parts: [
            { id: 'e2a', sub: 'a', level: 'BEG', make: function (r, o) {
              var Bp = add(o.A, scl(o.h, 2)), D = dist(o.A, Bp);
              return B.number('Determine the length of ' + t('\\overline{AB}') + '.', D, matchDiag(dCands(o.A, Bp)), dSteps(o.A, Bp) + '<br>' + t(dLine(o.A, Bp, 'AB') + simpTail(d2(o.A, Bp))) + '.', HD, 'length of AB');
            } },
            { id: 'e2b', sub: 'b', level: 'BEG', make: function (r, o) {
              var Bp = add(o.A, scl(o.h, 2));
              return ptPart('Determine the coordinates of ' + t('M') + '.', mid(o.A, Bp), { cands: midCands(o.A, Bp), before: 'M =' }, t(mLine(o.A, Bp, 'M')) + '.', HM, 'midpoint of AB');
            } },
            { id: 'e2c', sub: 'c', level: 'EMG', make: function (r, o) {
              var Bp = add(o.A, scl(o.h, 2)), M = mid(o.A, Bp), D = dist(o.A, M);
              return B.fields('Calculate ' + t('AM') + ' and ' + t('MB') + '.', [{ label: t('AM='), name: 'AM' }, { label: t('MB='), name: 'MB' }],
                [K.number(D, matchDiag(dCands(o.A, M))), K.number(D, matchDiag(dCands(M, Bp)))], [String(D), String(D)], t('AM=MB=' + D),
                t(dLine(o.A, M, 'AM') + simpTail(d2(o.A, M))) + '<br>' + t(dLine(M, Bp, 'MB') + simpTail(d2(M, Bp))), HD, 'AM and MB');
            } },
            { id: 'e2c2', sub: 'c, explain', level: 'EMG', make: function (r, o) {
              var Bp = add(o.A, scl(o.h, 2)), D = dist(o.A, Bp);
              return mcPart(r, 'You found ' + t('AM=MB=' + D / 2) + ' and ' + t('AB=' + D) + '. What do these answers confirm?', [
                { html: t('M') + ' is the same distance from both ends and each half is exactly half of ' + t('AB') + ', so ' + t('M') + ' really is the midpoint.', right: true },
                { html: 'Only that ' + t('M') + ' is equidistant from ' + t('A') + ' and ' + t('B') + ' — it could be off the segment.', why: 'An equidistant point off the segment would make ' + t('AM+MB') + ' longer than ' + t('AB') + '. Here ' + t('AM+MB=AB') + ', so ' + t('M') + ' is on the segment, halfway along.' },
                { html: 'That the segment ' + t('\\overline{AB}') + ' is horizontal.', why: 'Equal halves happen for any segment and its midpoint — the direction doesn’t matter.' },
                { html: 'That the distance formula and the midpoint formula give the same answer.', why: 'One formula gives a length, the other a point. The lengths ' + t('AM') + ' and ' + t('MB') + ' check the point ' + t('M') + '.' }],
                t('AM=MB=' + D / 2) + ', each half of ' + t('AB=' + D) + '. ' + t('M') + ' is the same distance from both ends, and the two halves add up to the whole segment, so ' + t('M') + ' is the midpoint.', ['What would be true of the real midpoint?'], 'AM = MB confirms midpoint');
            } }] },
        /* ---- EP 3: which formula ---- */
        { num: '3', parts: [
          { id: 'e3', level: 'EMG', make: function (r) {
            var POOL = [
              { id: 'a', html: 'Locating the centre of a circle when the endpoints of a diameter are known.', w: 'm', why: 'The centre is a <b>location</b> — the point halfway along the diameter.' },
              { id: 'b', html: 'Deciding whether a triangle is isosceles.', w: 'd', why: 'Isosceles means two equal side <b>lengths</b>.' },
              { id: 'c', html: 'Deciding whether the diagonals of a quadrilateral bisect each other.', w: 'm', why: '“Bisect each other” means the two diagonals have the same <b>midpoint</b>.' },
              { id: 'd', html: 'Finding the radius of a circle when its centre and a point on it are known.', w: 'd', why: 'A radius is a <b>length</b>: the distance from the centre to a point on the circle.' },
              { id: 'e', html: 'Deciding whether a given point is the same distance from two other points.', w: 'd', why: '“Same distance” compares two <b>lengths</b>.' },
              { id: 'f', html: 'Finding a fourth vertex that completes a parallelogram.', w: 'm', why: 'The fourth vertex is the <b>point</b> that makes the diagonals share a midpoint.' },
              { id: 'g', html: 'Finding the perimeter of a triangle from its vertices.', w: 'd', why: 'A perimeter adds side <b>lengths</b>.' },
              { id: 'h', html: 'Finding where to put a water station halfway along a straight trail.', w: 'm', why: 'Halfway along is a <b>location</b>.' },
              { id: 'i', html: 'Finding the length of a median of a triangle (from a vertex to the midpoint of the opposite side).', w: 'b', why: 'You need the <b>midpoint</b> of the opposite side first, then the <b>distance</b> to it.' },
              { id: 'j', html: 'Finding how far a given point is from the centre of a circle when only the endpoints of a diameter are known.', w: 'b', why: 'First locate the centre (the <b>midpoint</b> of the diameter), then find the <b>distance</b> from the centre to the point.' }];
            var rows = r.chance(0.3) ? POOL.slice(0, 6) : r.shuffle(r.sample(POOL.slice(0, 8), 5).concat([r.pick(POOL.slice(8))]));
            var cols = [{ id: 'd', html: 'Distance' }, { id: 'm', html: 'Midpoint' }, { id: 'b', html: 'Both' }], want = {}, by = {};
            rows.forEach(function (x) { want[x.id] = x.w; by[x.id] = x; });
            var nmC = { d: 'distance', m: 'midpoint', b: 'both' };
            var p = B.grid('For each task, decide which formula settles it — <b>distance</b>, <b>midpoint</b>, or <b>both</b>. (Do not calculate anything.)', rows.map(function (x) { return { id: x.id, html: x.html }; }), cols, want,
              { why: function (rid) { return { code: 'row', hint: '“' + by[rid].html + '” — ' + by[rid].why }; } },
              rows.map(function (x) { return '<b>' + nmC[x.w].charAt(0).toUpperCase() + nmC[x.w].slice(1) + '.</b> ' + x.html + ' ' + x.why; }).join('<br>'),
              ['Ask: is the question asking for a <b>length</b> (distance formula) or a <b>location</b> (midpoint formula)?'], 'which formula');
            p.tries = 3;
            return p;
          } }] },
        /* ---- EP 4: find B ---- */
        { num: '4', section: 'Extra practice B — Backwards: the midpoint is known', stem: 'In each case ' + t('M') + ' is the midpoint of ' + t('\\overline{AB}') + '. Determine the coordinates of ' + t('B') + '.', parts: [
          { id: 'e4a', level: 'EMG', make: function (r) {
            var o = r.chance(0.2) ? { A: [-5, 4], M: [3, -2] } : pickWhere(function () { return { A: [r.int(-8, -1), r.int(1, 8)], M: [r.int(1, 6), r.int(-6, -1)] }; }, function () { return true; });
            var Bp = sub(scl(o.M, 2), o.A);
            return ptPart(t(nm('A', o.A) + ',\\ ' + nm('M', o.M)), Bp, { cands: endCands(o.A, o.M), before: 'B =' }, t('x_B=2x_M-x_A=2(' + o.M[0] + ')-' + sgp(o.A[0]) + '=' + Bp[0]) + '<br>' + t('y_B=2y_M-y_A=2(' + o.M[1] + ')-' + sgp(o.A[1]) + '=' + Bp[1]) + '<br>' + t(nm('B', Bp)), HE, 'missing endpoint B');
          } },
          { id: 'e4b', level: 'EMG', make: function (r) {
            var o = r.chance(0.2) ? { A: [-9, 3], M: [0, -6] } : pickWhere(function () { return { A: [r.int(-10, -2), r.int(1, 8)], M: [r.pick([0, 0, 1, -1]), r.int(-8, -2)] }; }, function () { return true; });
            var Bp = sub(scl(o.M, 2), o.A);
            return ptPart(t(nm('A', o.A) + ',\\ ' + nm('M', o.M)), Bp, { cands: endCands(o.A, o.M), before: 'B =' }, t('x_B=2(' + o.M[0] + ')-' + sgp(o.A[0]) + '=' + Bp[0]) + '<br>' + t('y_B=2(' + o.M[1] + ')-' + sgp(o.A[1]) + '=' + Bp[1]) + '<br>' + t(nm('B', Bp)), HE, 'missing endpoint B (zero)');
          } },
          { id: 'e4c', level: 'PRG', make: function (r) {
            var o = r.chance(0.2) ? { A: [1.5, -3], M: [-4.5, 2] } : pickWhere(function () { return { A: [r.int(0, 4) + 0.5, -r.int(1, 6)], M: [-r.int(1, 6) - 0.5, r.int(1, 5)] }; }, function () { return true; });
            var Bp = sub(scl(o.M, 2), o.A);
            return ptPart(t(nm('A', o.A) + ',\\ ' + nm('M', o.M)), Bp, { cands: endCands(o.A, o.M), before: 'B =' }, t('x_B=2(' + nT(o.M[0]) + ')-' + sgp(o.A[0]) + '=' + nT(2 * o.M[0]) + '-' + sgp(o.A[0]) + '=' + nT(Bp[0])) + '<br>' + t('y_B=2(' + o.M[1] + ')-' + sgp(o.A[1]) + '=' + Bp[1]) + '<br>' + t(nm('B', Bp)), HE, 'missing endpoint with decimals');
          } },
          { id: 'e4d', level: 'ADV', make: function (r) {
            var o = r.chance(0.25) ? { a: [5, 1], m: [2, -3] } : pickWhere(function () { return { a: [r.int(2, 6), r.pick(pm(1, 3))], m: [r.pick(pm(1, 4)), r.pick(pm(1, 4))] }; }, function (z) { var b = [2 * z.m[0] - z.a[0], 2 * z.m[1] - z.a[1]]; return b[0] !== 0 && b[1] !== 0 && z.a[0] !== z.m[0] && z.a[1] !== z.m[1]; });
            var bx = 2 * o.m[0] - o.a[0], by = 2 * o.m[1] - o.a[1], tt = function (c) { return c === 1 ? 't' : c === -1 ? '-t' : c + 't'; };
            var Pt = function (c) { return P.parse(tt(c)); };
            var wr = function (c, ca, cm) { return [{ is: P.parse(tt(cm - ca === 0 ? 1 : cm - ca)), code: 'end-step', hint: 'That is the step from ' + t('A') + ' to ' + t('M') + '. Double the midpoint, then subtract: ' + t('2(' + tt(cm) + ')-' + (ca < 0 ? '(' + tt(ca) + ')' : tt(ca))) + '.' }, { is: P.parse(tt(2 * cm + ca === 0 ? 1 : 2 * cm + ca)), code: 'end-sign', hint: '<b>Subtract</b> the endpoint after doubling: ' + t('2(' + tt(cm) + ')-' + (ca < 0 ? '(' + tt(ca) + ')' : tt(ca))) + '.' }].filter(function (w) { return !P.eq(w.is, Pt(c)); }); };
            var fl = [{ label: t('x_B='), name: 'x_B', mode: 'math', keys: 'poly', vars: ['t'] }, { label: t('y_B='), name: 'y_B', mode: 'math', keys: 'poly', vars: ['t'] }];
            return B.fields(t('A(' + tt(o.a[0]) + ',\\ ' + tt(o.a[1]) + '),\\ M(' + tt(o.m[0]) + ',\\ ' + tt(o.m[1]) + ')') + ' — give each coordinate of ' + t('B') + ' in terms of ' + t('t') + '.', fl,
              [K.poly(Pt(bx), { wrong: wr(bx, o.a[0], o.m[0]) }), K.poly(Pt(by), { wrong: wr(by, o.a[1], o.m[1]) })], [tt(bx), tt(by)], t('B(' + tt(bx) + ',\\ ' + tt(by) + ')'),
              t('x_B=2x_M-x_A=2(' + tt(o.m[0]) + ')-' + (o.a[0] < 0 ? '(' + tt(o.a[0]) + ')' : tt(o.a[0])) + '=' + tt(2 * o.m[0]) + (o.a[0] > 0 ? '-' + tt(o.a[0]) : '+' + tt(-o.a[0])) + '=' + tt(bx)) + '<br>' + t('y_B=2y_M-y_A=2(' + tt(o.m[1]) + ')-' + (o.a[1] < 0 ? '(' + tt(o.a[1]) + ')' : tt(o.a[1])) + '=' + tt(2 * o.m[1]) + (o.a[1] > 0 ? '-' + tt(o.a[1]) : '+' + tt(-o.a[1])) + '=' + tt(by)) + '<br>' + t('B(' + tt(bx) + ',\\ ' + tt(by) + ')'),
              HE.concat(['Treat ' + t('t') + ' like a unit: ' + t('2(2t)-5t=4t-5t=-t') + '.']), 'missing endpoint with variables');
          } }] },
        /* ---- EP 5: helicopter ---- */
        { num: '5', parts: [
          { id: 'e5', level: 'PRG', make: function (r) {
            var o = r.chance(0.2) ? { H: [14, -6], C: [-3, 11] } : pickWhere(function () { return { H: [r.int(6, 18), -r.int(2, 10)], C: [-r.int(1, 8), r.int(4, 14)] }; }, function () { return true; });
            var X = sub(scl(o.H, 2), o.C);
            return ptPart('A search helicopter hovers at ' + t(nm('H', o.H)) + ', exactly halfway along the straight line from base camp ' + t(nm('C', o.C)) + ' to a stranded hiker. Determine the hiker’s coordinates.', X, { cands: endCands(o.C, o.H) },
              t('H') + ' is the midpoint, so double ' + t('H') + ' and subtract ' + t('C') + ':<br>' + t('x=2(' + o.H[0] + ')-' + sgp(o.C[0]) + '=' + X[0]) + ', &nbsp;' + t('y=2(' + o.H[1] + ')-' + sgp(o.C[1]) + '=' + X[1]) + '. The hiker is at ' + t(ptT(X)) + '.<br>Check: ' + t(mLine(o.C, X)) + ' ' + t('=H') + ' ✓',
              HE, 'hiker coordinates');
          } }] },
        /* ---- EP 6: A, P midpoint of AB, Q midpoint of PB ---- */
        { num: '6', shared: function (r) {
            if (r.chance(0.2)) return { A: [-10, 6], h: [6, -4] };
            var v = pickWhere(function () { return [r.pick([1, 2, 3]), r.pick([1, 2, 3, 4, 5])]; }, function (z) { var n = z[0] * z[0] + z[1] * z[1]; return gcd(z[0], z[1]) === 1 && !isSq(n) && radParts(n).k === 1; });
            var h = r.chance(0.5) ? [2 * v[0], -2 * v[1]] : [2 * v[1], -2 * v[0]];
            return { A: [r.int(-10, -4), r.int(2, 8)], h: h };
          },
          stem: function (o) { var Pp = add(o.A, o.h); return t('\\overline{AB}') + ' has endpoint ' + t(nm('A', o.A)) + '. The point ' + t(nm('P', Pp)) + ' is the midpoint of ' + t('\\overline{AB}') + ', and ' + t('Q') + ' is the midpoint of ' + t('\\overline{PB}') + '.'; },
          parts: [
            { id: 'e6a', sub: 'a', level: 'PRG', make: function (r, o) {
              var Pp = add(o.A, o.h), Bp = add(Pp, o.h);
              return ptPart('Determine the coordinates of ' + t('B') + '.', Bp, { cands: endCands(o.A, Pp), before: 'B =' }, t('P') + ' is the midpoint of ' + t('\\overline{AB}') + ':<br>' + t('x_B=2(' + Pp[0] + ')-' + sgp(o.A[0]) + '=' + Bp[0]) + ', &nbsp;' + t('y_B=2(' + Pp[1] + ')-' + sgp(o.A[1]) + '=' + Bp[1]) + ', so ' + t(nm('B', Bp)) + '.', HE, 'B from A and midpoint P');
            } },
            { id: 'e6b', sub: 'b', level: 'EMG', make: function (r, o) {
              var Pp = add(o.A, o.h), Bp = add(Pp, o.h), Q = mid(Pp, Bp);
              return ptPart('Determine the coordinates of ' + t('Q') + '.', Q, { cands: midCands(Pp, Bp).concat([[mid(o.A, Pp), 'mid-wrong-seg', t('Q') + ' is the midpoint of ' + t('\\overline{PB}') + ', not of ' + t('\\overline{AP}') + '.'], [mid(o.A, Bp), 'mid-wrong-seg', 'That is ' + t('P') + ', the midpoint of ' + t('\\overline{AB}') + '. ' + t('Q') + ' is the midpoint of ' + t('\\overline{PB}') + '.']]), before: 'Q =' },
                t('Q') + ' is the midpoint of ' + t(nm('P', Pp)) + ' and ' + t(nm('B', Bp)) + ':<br>' + t(mLine(Pp, Bp, 'Q')) + '.', ['You need ' + t('B') + ' from part (a). Then average ' + t('P') + ' and ' + t('B') + '.'].concat(HM.slice(0, 1)), 'Q midpoint of PB');
            } },
            { id: 'e6c', sub: 'c', level: 'ADV', make: function (r, o) {
              var Pp = add(o.A, o.h), Bp = add(Pp, o.h), Q = mid(Pp, Bp), nQ = d2(o.A, Q), nB = d2(o.A, Bp);
              var fl = [lenField('AQ'), lenField('AB'), { label: 'fraction of the way', name: 'fraction', mode: 'math', keys: 'radical' }];
              return B.fields('Calculate ' + t('AQ') + ' and ' + t('AB') + ' exactly, and state what fraction of the way from ' + t('A') + ' to ' + t('B') + ' the point ' + t('Q') + ' sits.', fl,
                [lenCheck(nQ, 1, { cands: dCands(o.A, Q) }), lenCheck(nB, 1, { cands: dCands(o.A, Bp) }), K.fraction([3, 4], { decimalOk: true, diag: function (v) { if (same(v, 4 / 3)) return { code: 'flip', hint: 'Fraction of the way = ' + t('AQ\\div AB') + ' (the part over the whole).' }; if (same(v, 0.5)) return { code: 'value', hint: t('P') + ' is halfway; ' + t('Q') + ' is halfway between ' + t('P') + ' and ' + t('B') + ' — further along.' }; return null; } })],
                [lenKey(nQ), lenKey(nB), '\\frac{3}{4}'], t('AQ=' + lenTex(nQ) + ',\\ AB=' + lenTex(nB)) + ', ' + t('Q') + ' sits ' + t('\\tfrac{3}{4}') + ' of the way.',
                t(dLine(o.A, Q, 'AQ') + simpTail(nQ)) + '<br>' + t(dLine(o.A, Bp, 'AB') + simpTail(nB)) + '<br>' + t('AQ\\div AB=\\dfrac{' + lenTex(nQ) + '}{' + lenTex(nB) + '}=\\dfrac{3}{4}') + ', so ' + t('Q') + ' sits ' + t('\\tfrac{3}{4}') + ' of the way from ' + t('A') + ' to ' + t('B') + '.',
                HD.concat(['The fraction of the way is ' + t('AQ\\div AB') + '; the radicals cancel.']), 'AQ, AB and the fraction');
            } }] },
        /* ---- EP 7: variables ---- */
        { num: '7', parts: [
          { id: 'e7', level: 'ADV', make: function (r) {
            var o = r.chance(0.25) ? { mk: 3, mc: -2, ac: 1, ay: 4 } : pickWhere(function () { return { mk: r.pick([2, 3, 4]), mc: r.pick(pm(1, 5)), ac: r.pick(pm(1, 4)), ay: r.pick(pm(1, 6)) }; }, function (z) { return 2 * z.mc - z.ay !== 0 && z.ac !== 0; });
            var lin = function (a, b) { return P.tex(P.add(P.parse(a === 1 ? 'k' : a === -1 ? '-k' : a + 'k'), P.num(b))); };
            var Mx = lin(o.mk, 0), My = lin(1, o.mc), Ax = lin(1, o.ac), Bx = P.add(P.parse((2 * o.mk - 1) + 'k'), P.num(-o.ac)), By = P.add(P.parse('2k'), P.num(2 * o.mc - o.ay));
            var fl = [{ label: t('x_B='), name: 'x_B', mode: 'math', keys: 'poly', vars: ['k'] }, { label: t('y_B='), name: 'y_B', mode: 'math', keys: 'poly', vars: ['k'] }];
            var wx = [{ is: P.add(P.parse((2 * o.mk - 1) + 'k'), P.num(o.ac)), code: 'end-sign', hint: 'Subtracting ' + t('(' + Ax + ')') + ' changes the sign of <b>both</b> terms: ' + t('-(' + Ax + ')=' + P.tex(P.neg(P.parse(Ax)))) + '.' }, { is: P.scale(P.add(P.parse(Ax), P.parse(Mx)), [1, 2]), code: 'end-average', hint: 'You averaged ' + t('A') + ' and ' + t('M') + '. Double the midpoint, then subtract ' + t('A') + '.' }].filter(function (w) { return !P.eq(w.is, Bx); });
            var wy = [{ is: P.add(P.parse('2k'), P.num(2 * o.mc + o.ay)), code: 'end-sign', hint: 'After doubling, <b>subtract</b> ' + t(sgp(o.ay)) + '.' }, { is: P.add(P.parse('k'), P.num(o.mc - o.ay)), code: 'end-double', hint: 'Double the <b>whole</b> midpoint coordinate: ' + t('2(' + My + ')=' + P.tex(P.scale(P.parse(My), 2))) + '.' }].filter(function (w) { return !P.eq(w.is, By); });
            return B.fields('The point ' + t('M(' + Mx + ',\\ ' + My + ')') + ' is the midpoint of ' + t('\\overline{AB}') + ', where ' + t('A') + ' is the point ' + t('(' + Ax + ',\\ ' + o.ay + ')') + '. Determine the coordinates of ' + t('B') + ' in terms of ' + t('k') + '.', fl,
              [K.poly(Bx, { wrong: wx }), K.poly(By, { wrong: wy })], [P.tex(Bx), P.tex(By)], t('B(' + P.tex(Bx) + ',\\ ' + P.tex(By) + ')'),
              'Double the midpoint, then subtract ' + t('A') + ':<br>' + t('x_B=2(' + Mx + ')-(' + Ax + ')=' + P.tex(P.parse(2 * o.mk + 'k')) + '-' + P.btex(P.parse(Ax)) + '=' + P.tex(Bx)) + '<br>' + t('y_B=2(' + My + ')-' + sgp(o.ay) + '=' + P.tex(P.scale(P.parse(My), 2)) + (o.ay > 0 ? '-' + o.ay : '+' + (-o.ay)) + '=' + P.tex(By)) + '<br>Check by averaging: ' + t('\\dfrac{(' + Ax + ')+(' + P.tex(Bx) + ')}{2}=' + Mx) + ' ✓',
              HE.concat(['Use brackets: ' + t('2(k-2)=2k-4') + ' and ' + t('-(k+1)=-k-1') + '.']), 'missing endpoint in terms of k');
          } }] },
        /* ---- EP 8: points at a given distance on a line ---- */
        { num: '8', section: 'Extra practice C — Backwards: the distance is known', stem: 'In each case, determine <b>all</b> points that satisfy the conditions. (Separate two points with a comma.)', parts: [
          { id: 'e8a', level: 'ADV', make: function (r) {
            var o = r.chance(0.2) ? { A: [2, -3], tr: [3, 4, 5] } : (function () { var tr = r.pick([[3, 4, 5], [4, 3, 5], [6, 8, 10], [8, 6, 10], [5, 12, 13], [12, 5, 13]]); return { A: [r.pick(pm(1, 5)), tr[0] * (r.chance(0.6) ? -1 : 1)], tr: tr }; })();
            var A = o.A, k = A[1], s = o.tr[1], rr = o.tr[2], W = [[A[0] + s, 0], [A[0] - s, 0]];
            return { prompt: t('B') + ' lies on the ' + t('x') + '-axis and ' + t('AB=' + rr) + ', where ' + t('A') + ' is ' + t(ptT(A)) + '.', input: { type: 'math', keys: 'pairs', placeholder: 'e.g. (3, 0), (-1, 0)' },
              check: ptsCheck(W, { missCode: 'ax-one', missHint: 'Correct so far — but ' + t('x-' + sgp(A[0]) + '=\\pm ' + s) + ' gives <b>two</b> values. Find the other point.', diag: function (L) {
                if (L.some(function (p) { return same(p[1], 0); }) && L.every(function (p) { return same(p[1], 0); })) {
                  var xs = L.map(function (p) { return p[0]; });
                  if (xs.some(function (x) { return same(x, A[0] + rr) || same(x, A[0] - rr); })) return { code: 'ax-no-leg', hint: 'Include the vertical difference: ' + t('(x-' + sgp(A[0]) + ')^{2}+(0-' + sgp(k) + ')^{2}=' + rr + '^{2}') + '.' };
                  if (xs.some(function (x) { return same(x, -A[0] + s) || same(x, -A[0] - s); })) return { code: 'ax-sign', hint: 'Check the signs: ' + t('x-' + sgp(A[0]) + '=\\pm ' + s) + ', so ' + t('x=' + A[0] + '\\pm ' + s) + '.' };
                  if (xs.some(function (x) { return same(x, A[0] + s * s) || same(x, A[0] - s * s); })) return { code: 'ax-no-root', hint: 'Take the square root: ' + t('(x-' + sgp(A[0]) + ')^{2}=' + s * s) + ' means ' + t('x-' + sgp(A[0]) + '=\\pm ' + s) + '.' };
                }
                if (L.some(function (p) { return !same(p[1], 0); })) return { code: 'pts', hint: 'A point on the ' + t('x') + '-axis has ' + t('y=0') + ': write it as ' + t('(x,\\ 0)') + '.' };
                return null; } }),
              key: ptKey(W[0]) + ', ' + ptKey(W[1]), answer: t('B' + ptT(W[0]) + '\\text{ or }B' + ptT(W[1])), text: 'points on x-axis at distance', hints: ['A point on the ' + t('x') + '-axis is ' + t('(x,\\ 0)') + '. Substitute it into the distance formula and set it equal to ' + t(rr) + '.', 'A squared equation usually has <b>two</b> solutions.'],
              solution: 'On the ' + t('x') + '-axis: ' + t('B(x,\\ 0)') + '.<br>' + t('(x-' + sgp(A[0]) + ')^{2}+(0-' + sgp(k) + ')^{2}=' + rr + '^{2}') + '<br>' + t('(x-' + sgp(A[0]) + ')^{2}+' + k * k + '=' + rr * rr) + ', so ' + t('(x-' + sgp(A[0]) + ')^{2}=' + s * s) + '<br>' + t('x-' + sgp(A[0]) + '=\\pm ' + s) + ', so ' + t('x=' + W[0][0]) + ' or ' + t('x=' + W[1][0]) + ': ' + t('B' + ptT(W[0])) + ' or ' + t('B' + ptT(W[1])) + '.',
              good: ['\\left(' + W[1][0] + ',0\\right),\\left(' + W[0][0] + ',0\\right)'], bad: [ptKey(W[0]), ptKey([A[0] + rr, 0]) + ', ' + ptKey([A[0] - rr, 0])] };
          } },
          { id: 'e8b', level: 'ADV', make: function (r) {
            var o = r.chance(0.2) ? { C: [-1, 4], s: 4 } : pickWhere(function () { return { C: [r.pick(pm(1, 3)), r.pick(pm(1, 6))], s: r.int(2, 6) }; }, function (z) { return !isSq(z.C[0] * z.C[0] + z.s * z.s) && z.C[1] !== z.s && z.C[1] !== -z.s; });
            var C = o.C, h = C[0], s = o.s, R = h * h + s * s, W = [[0, C[1] + s], [0, C[1] - s]];
            return { prompt: t('D') + ' lies on the ' + t('y') + '-axis and ' + t('CD=' + lenTex(R)) + ', where ' + t('C') + ' is ' + t(ptT(C)) + '.', input: { type: 'math', keys: 'pairs', placeholder: 'e.g. (0, 3), (0, -1)' },
              check: ptsCheck(W, { missCode: 'ax-one', missHint: 'Correct so far — ' + t('y-' + sgp(C[1]) + '=\\pm ' + s) + ' gives <b>two</b> values. Find the other point.', diag: function (L) {
                if (L.some(function (p) { return !same(p[0], 0); })) return { code: 'pts', hint: 'A point on the ' + t('y') + '-axis has ' + t('x=0') + ': write it as ' + t('(0,\\ y)') + '.' };
                var ys = L.map(function (p) { return p[1]; });
                if (ys.some(function (y) { return same(y, C[1] + Math.sqrt(R)) || same(y, C[1] - Math.sqrt(R)); })) return { code: 'ax-no-leg', hint: 'Include the horizontal difference: ' + t('(0-' + sgp(h) + ')^{2}+(y-' + sgp(C[1]) + ')^{2}=' + R) + '.' };
                if (ys.some(function (y) { return same(y, -C[1] + s) || same(y, -C[1] - s); })) return { code: 'ax-sign', hint: 'Check the signs: ' + t('y=' + C[1] + '\\pm ' + s) + '.' };
                return null; } }),
              key: ptKey(W[0]) + ', ' + ptKey(W[1]), answer: t('D' + ptT(W[0]) + '\\text{ or }D' + ptT(W[1])), text: 'points on y-axis at distance', hints: ['A point on the ' + t('y') + '-axis is ' + t('(0,\\ y)') + '. Square both sides of the distance: ' + t('(' + lenTex(R) + ')^{2}=' + R) + '.', 'Expect two answers.'],
              solution: 'On the ' + t('y') + '-axis: ' + t('D(0,\\ y)') + '.<br>' + t('(0-' + sgp(h) + ')^{2}+(y-' + sgp(C[1]) + ')^{2}=(' + lenTex(R) + ')^{2}') + '<br>' + t(h * h + '+(y-' + sgp(C[1]) + ')^{2}=' + R) + ', so ' + t('(y-' + sgp(C[1]) + ')^{2}=' + s * s) + '<br>' + t('y=' + C[1] + '\\pm ' + s) + ': ' + t('D' + ptT(W[0])) + ' or ' + t('D' + ptT(W[1])) + '.',
              good: [ptKey(W[1]) + ', ' + ptKey(W[0])], bad: [ptKey(W[1])] };
          } },
          { id: 'e8c', level: 'ADV', make: function (r) {
            var o = r.chance(0.2) ? { E: [3, -2], rr: 4, dir: 1 } : { E: [r.pick(pm(1, 5)), r.pick(pm(1, 5))], rr: r.int(2, 6), dir: r.pick([1, -1]) };
            var E = o.E, c = E[0] + o.dir * o.rr, W = [[c, E[1]]];
            return { prompt: t('F') + ' lies on the vertical line ' + t('x=' + c) + ' and ' + t('EF=' + o.rr) + ', where ' + t('E') + ' is ' + t(ptT(E)) + '.', input: { type: 'math', keys: 'pairs', placeholder: 'e.g. (3, 0)' },
              check: ptsCheck(W, { diag: function (L) { if (L.length === 2 && L.some(function (p) { return samePt(p, W[0]); })) return { code: 'pts-extra', hint: 'Check: ' + t('(y-' + sgp(E[1]) + ')^{2}=0') + ' has only <b>one</b> solution — the two “±” answers are the same point.' }; if (L.some(function (p) { return !same(p[0], c); })) return { code: 'pts', hint: 'Every point on the line ' + t('x=' + c) + ' has ' + t('x') + '-coordinate ' + t(c) + '.' }; return null; } }),
              key: ptKey(W[0]), answer: t('F' + ptT(W[0])) + ' — only one point', text: 'one point at distance (tangent)', hints: ['A point on ' + t('x=' + c) + ' is ' + t('(' + c + ',\\ y)') + '. Set up the distance equation and solve.'],
              solution: 'On ' + t('x=' + c) + ': ' + t('F(' + c + ',\\ y)') + '.<br>' + t('(' + c + '-' + sgp(E[0]) + ')^{2}+(y-' + sgp(E[1]) + ')^{2}=' + o.rr + '^{2}') + '<br>' + t(o.rr * o.rr + '+(y-' + sgp(E[1]) + ')^{2}=' + o.rr * o.rr) + ', so ' + t('(y-' + sgp(E[1]) + ')^{2}=0') + ' and ' + t('y=' + E[1]) + ' only: ' + t('F' + ptT(W[0])) + ' — one point.',
              good: ['\\left(' + c + ',' + E[1] + '\\right)'], bad: [ptKey([c, E[1] + o.rr]) + ', ' + ptKey([c, E[1] - o.rr])] };
          } },
          { id: 'e8d', sub: 'd', level: 'PRG', make: function (r) {
            var E = [r.pick(pm(1, 5)), r.pick(pm(1, 5))], d = r.int(2, 6), c = E[0] + r.pick([1, -1]) * d;
            return mcPart(r, 'Finding all points on a line at a fixed distance from a given point usually gives <b>two</b> points. But when ' + t('F') + ' lies on the vertical line ' + t('x=' + c) + ' and ' + t('EF=' + d) + ', where ' + t('E') + ' is ' + t(ptT(E)) + ', there is only <b>one</b> point, ' + t('F' + ptT([c, E[1]])) + '. Which explanation is correct?', [
              { html: 'The points at a fixed distance from a given point form a circle. Here ' + t('E') + ' is exactly that distance from the line, so the circle only <b>touches</b> the line once; in the two-point cases the circle crosses the line twice.', right: true },
              { html: 'The line is vertical, and vertical lines can only contain one point at a given distance.', why: 'The direction of the line isn’t the reason — a vertical line closer to ' + t('E') + ' would cross the circle twice. What matters is how far the line is from the given point compared with the distance.' },
              { html: 'One of the two answers was negative, so it had to be rejected.', why: 'Negative coordinates are perfectly good points. Here the equation becomes ' + t('(y-k)^{2}=0') + ', which has only one solution.' },
              { html: 'The question has a mistake: there should be two points.', why: 'The algebra gives ' + t('(y-k)^{2}=0') + ' — only one solution. Think about the circle around ' + t('E') + ' and the line.' }],
              'The points at a fixed distance from a given point form a <b>circle</b> around it. When the line’s distance from the point equals the radius, the circle just touches the line (one point). When the radius is greater than the gap, the circle cuts the line at two points; when it is smaller, there are none.',
              ['Picture all the points at that distance from the given point. What shape do they make?'], 'why only one point');
          } }] },
        /* ---- EP 9: values of k ---- */
        { num: '9', stem: 'Determine all values of ' + t('k') + ' for which the stated distance is correct.', shared: function (r) {
            if (r.chance(0.2)) return { y0: 3, Q: [1, 7], rr: 3 };
            return pickWhere(function () { var y0 = r.pick(pm(1, 5)); return { y0: y0, Q: [r.pick(pm(1, 5)), y0 + r.pick(pm(3, 6))], rr: r.int(2, 5) }; }, function (z) { return Math.abs(z.Q[1] - z.y0) > z.rr && !isSq(Math.abs(sq(z.Q[1] - z.y0) - z.rr * z.rr)); });
          }, parts: [
          { id: 'e9a', level: 'ADV', make: function (r) {
            var o = r.chance(0.2) ? { y0: 3, Q: [-2, -1], tr: [4, 3, 5] } : (function () { var tr = r.pick([[4, 3, 5], [3, 4, 5], [8, 6, 10], [6, 8, 10], [5, 12, 13], [12, 5, 13]]), y0 = r.pick(pm(1, 5)); return { y0: y0, Q: [r.pick(pm(1, 5)), y0 - tr[0] * r.pick([1, -1])], tr: tr }; })();
            var dy = o.y0 - o.Q[1], s = o.tr[1], rr = o.tr[2], ks = [o.Q[0] + s, o.Q[0] - s];
            var p = B.valueSet('The distance from ' + t('(k,\\ ' + o.y0 + ')') + ' to ' + t(ptT(o.Q)) + ' is ' + t(rr) + '.', ks, { v: 'k', diag: function (A) {
                if (A.some(function (x) { return same(x, o.Q[0] + rr) || same(x, o.Q[0] - rr); })) return { code: 'ax-no-leg', hint: 'Include the vertical difference: ' + t('(' + o.y0 + '-' + sgp(o.Q[1]) + ')^{2}=' + dy * dy) + '.' };
                if (A.some(function (x) { return same(x, -o.Q[0] + s) || same(x, -o.Q[0] - s); })) return { code: 'ax-sign', hint: 'Check the signs: ' + t('k-' + sgp(o.Q[0]) + '=\\pm ' + s) + '.' };
                return null; } },
              t('(k-' + sgp(o.Q[0]) + ')^{2}+(' + o.y0 + '-' + sgp(o.Q[1]) + ')^{2}=' + rr + '^{2}') + '<br>' + t('(k-' + sgp(o.Q[0]) + ')^{2}+' + dy * dy + '=' + rr * rr) + ', so ' + t('(k-' + sgp(o.Q[0]) + ')^{2}=' + s * s) + '<br>' + t('k-' + sgp(o.Q[0]) + '=\\pm ' + s) + ': ' + t('k=' + ks[0]) + ' or ' + t('k=' + ks[1]) + '.',
              ['Substitute into the distance formula, square both sides, and solve for ' + t('k') + '.', 'A squared equation usually has two solutions.'], 'values of k for a distance');
            p.good = ['k=' + ks[1] + ', k=' + ks[0]]; p.bad = ['k=' + ks[0]];
            return p;
          } },
          { id: 'e9b', level: 'ADV', make: function (r) {
            var o = r.chance(0.2) ? { y0: 3, Q: [4, -2], s: 5 } : pickWhere(function () { var y0 = r.pick(pm(1, 5)); return { y0: y0, Q: [r.pick(pm(1, 6)), y0 - r.pick(pm(2, 6))], s: r.int(2, 7) }; }, function (z) { var dy = z.y0 - z.Q[1], R = dy * dy + z.s * z.s; return !isSq(R) && radParts(R).k >= 2; });
            var dy = o.y0 - o.Q[1], s = o.s, R = dy * dy + s * s, ks = [o.Q[0] + s, o.Q[0] - s];
            var p = B.valueSet('The distance from ' + t('(k,\\ ' + o.y0 + ')') + ' to ' + t(ptT(o.Q)) + ' is ' + t(lenTex(R)) + '.', ks, { v: 'k', diag: function (A) {
                if (A.some(function (x) { return same(x, -o.Q[0] + s) || same(x, -o.Q[0] - s); })) return { code: 'ax-sign', hint: 'Check the signs: ' + t('k-' + sgp(o.Q[0]) + '=\\pm ' + s) + '.' };
                if (A.some(function (x) { return same(x, ks[0]) || same(x, ks[1]); })) return null; return { code: 'value', hint: 'Square the radical distance carefully: ' + t('(' + lenTex(R) + ')^{2}=' + R) + '.' }; } },
              t('(k-' + sgp(o.Q[0]) + ')^{2}+(' + o.y0 + '-' + sgp(o.Q[1]) + ')^{2}=(' + lenTex(R) + ')^{2}') + '<br>' + t('(k-' + sgp(o.Q[0]) + ')^{2}+' + dy * dy + '=' + R) + ', so ' + t('(k-' + sgp(o.Q[0]) + ')^{2}=' + s * s) + '<br>' + t('k=' + o.Q[0] + '\\pm ' + s) + ': ' + t('k=' + ks[0]) + ' or ' + t('k=' + ks[1]) + '.',
              ['Square the given distance: ' + t('(a\\sqrt{b})^{2}=a^{2}b') + '.', 'Expect two values of ' + t('k') + '.'], 'values of k for a radical distance');
            p.bad = ['k=' + ks[1]];
            return p;
          } },
          { id: 'e9c', level: 'PRG', make: function (r, o) {
            var dy = o.y0 - o.Q[1], neg = o.rr * o.rr - dy * dy;
            return mcPart(r, 'The distance from ' + t('(k,\\ ' + o.y0 + ')') + ' to ' + t(ptT(o.Q)) + ' is ' + t(o.rr) + '. Which describes the values of ' + t('k') + '?', [
              { html: 'There is no real value of ' + t('k') + '.', right: true },
              { html: t('k=' + o.Q[0] + '\\pm\\sqrt{' + (-neg) + '}'), why: 'Check: ' + t('(k-' + sgp(o.Q[0]) + ')^{2}=' + o.rr * o.rr + '-' + dy * dy + '=' + neg) + ' — a <b>negative</b> number. You can’t take the square root of ' + t(neg) + '.' },
              { html: t('k=' + (o.Q[0] + o.rr)) + ' or ' + t('k=' + (o.Q[0] - o.rr)), why: 'That ignores the vertical difference ' + t('(' + o.y0 + '-' + sgp(o.Q[1]) + ')^{2}=' + dy * dy) + '.' },
              { html: t('k=' + o.Q[0]) + ' only', why: 'At ' + t('k=' + o.Q[0]) + ' the distance is ' + t(Math.abs(dy)) + ', not ' + t(o.rr) + '.' }],
              t('(k-' + sgp(o.Q[0]) + ')^{2}+(' + o.y0 + '-' + sgp(o.Q[1]) + ')^{2}=' + o.rr + '^{2}') + '<br>' + t('(k-' + sgp(o.Q[0]) + ')^{2}+' + dy * dy + '=' + o.rr * o.rr) + ', so ' + t('(k-' + sgp(o.Q[0]) + ')^{2}=' + neg) + '.<br>A square is never negative, so there is <b>no real value</b> of ' + t('k') + '.',
              ['Set up the equation and see what ' + t('(k-' + sgp(o.Q[0]) + ')^{2}') + ' has to equal.'], 'no value of k');
          } },
          { id: 'e9d', sub: 'd', level: 'PRG', make: function (r, o) {
            var g = Math.abs(o.Q[1] - o.y0), Pq = t(ptT(o.Q)), side = o.Q[1] > o.y0 ? 'above' : 'below', foot = t(ptT([o.Q[0], o.y0]));
            return mcPart(r, 'Solving for ' + t('k') + ' shows that no real value works. Explain, without algebra, why no point of the form ' + t('(k,\\ ' + o.y0 + ')') + ' can be ' + t(o.rr) + ' units from ' + Pq + '.', [
              { html: 'Every point ' + t('(k,\\ ' + o.y0 + ')') + ' is on the horizontal line ' + t('y=' + o.y0) + ', and ' + Pq + ' is ' + t(g) + ' units ' + side + ' that line. No point of the line is closer than ' + t(g) + ', so none can be only ' + t(o.rr) + ' away.', right: true },
              { html: 'Because ' + Pq + ' is not on the line ' + t('y=' + o.y0) + ', so no distance from it to the line can be calculated.', why: 'Distances from ' + Pq + ' to points on the line can be calculated — the smallest of them is ' + t(g) + '. Compare that gap with ' + t(o.rr) + '.' },
              { html: 'Because ' + t('k') + ' would have to be negative.', why: 'Negative values of ' + t('k') + ' are allowed. The problem is that every point on ' + t('y=' + o.y0) + ' is at least ' + t(g) + ' units from ' + Pq + '.' },
              { html: 'Because a distance can never be a whole number.', why: 'Distances can be whole numbers (' + t('3') + ', ' + t('4') + ', ' + t('5') + ' …). Think about how close the line ' + t('y=' + o.y0) + ' gets to the point.' }],
              'The closest point of the line ' + t('y=' + o.y0) + ' to ' + Pq + ' is ' + foot + ', straight ' + (side === 'above' ? 'below' : 'above') + ' it, at a distance of ' + t(g) + '. A circle of radius ' + t(o.rr) + ' around ' + Pq + ' never reaches the line.', ['How close can a point on the line ' + t('y=' + o.y0) + ' get to ' + Pq + '?'], 'why no solution');
          } }] },
        /* ---- EP 10: point on the y-axis equidistant from A and B ---- */
        { num: '10', parts: [
          { id: 'e10', level: 'MAS', make: function (r) {
            var o = r.chance(0.2) ? { Pp: [0, -1], u: [-4, 2], w: [2, -4] } : pickWhere(function () {
              var u = [r.pick(pm(1, 5)), r.pick(pm(1, 5))], tf = r.pick([function (v) { return [v[1], v[0]]; }, function (v) { return [-v[1], -v[0]]; }, function (v) { return [v[1], -v[0]]; }, function (v) { return [-v[1], v[0]]; }]);
              return { Pp: [0, r.int(-5, 5)], u: u, w: tf(u) };
            }, function (z) { var A = add(z.Pp, z.u), Bq = add(z.Pp, z.w); return A[0] !== 0 && Bq[0] !== 0 && A[1] !== Bq[1] && A[0] !== Bq[0] && !samePt(A, Bq) && Math.abs(A[1]) <= 9 && Math.abs(Bq[1]) <= 9; });
            var Pp = o.Pp, A = add(Pp, o.u), Bq = add(Pp, o.w), y = Pp[1], Mab = mid(A, Bq);
            var lhs = A[0] * A[0] + A[1] * A[1], rhs = Bq[0] * Bq[0] + Bq[1] * Bq[1], ca = -2 * A[1], cb = -2 * Bq[1];
            var c = [[Mab, 'eq-gave-mid', 'That is the midpoint of ' + t('\\overline{AB}') + ' — it is equidistant, but it isn’t on the ' + t('y') + '-axis. Use a point ' + t('(0,\\ y)') + ' and set its distances to ' + t('A') + ' and ' + t('B') + ' equal.'], [[0, Mab[1]], 'eq-mid-y', 'Averaging the ' + t('y') + '-coordinates doesn’t work here. Set ' + t('(0-' + sgp(A[0]) + ')^{2}+(y-' + sgp(A[1]) + ')^{2}=(0-' + sgp(Bq[0]) + ')^{2}+(y-' + sgp(Bq[1]) + ')^{2}') + ' and solve.']];
            var tl = function (c0, c1) { return 'y^{2}' + (c0 === 0 ? '' : c0 > 0 ? '+' + c0 + 'y' : c0 + 'y') + '+' + c1; };
            return ptPart('Determine the coordinates of the point on the ' + t('y') + '-axis that is equidistant from ' + t(nm('A', A)) + ' and ' + t(nm('B', Bq)) + '.', Pp, { cands: c },
              'A point on the ' + t('y') + '-axis is ' + t('(0,\\ y)') + '. Set the squared distances to ' + t('A') + ' and ' + t('B') + ' equal:<br>' + t('(0-' + sgp(A[0]) + ')^{2}+(y-' + sgp(A[1]) + ')^{2}=(0-' + sgp(Bq[0]) + ')^{2}+(y-' + sgp(Bq[1]) + ')^{2}') + '<br>' + t(tl(ca, lhs) + '=' + tl(cb, rhs)) + '<br>' + t((ca - cb) + 'y=' + (rhs - lhs)) + ', so ' + t('y=' + y) + '. The point is ' + t(ptT(Pp)) + '.<br>Check: ' + t(dLine(Pp, A) + simpTail(d2(Pp, A))) + ' and ' + t(dLine(Pp, Bq) + simpTail(d2(Pp, Bq))) + ' ✓',
              ['A point on the ' + t('y') + '-axis is ' + t('(0,\\ y)') + '. Write its squared distance to ' + t('A') + ' and to ' + t('B') + ', and set them equal.', 'Expand the brackets — the ' + t('y^{2}') + ' terms cancel, leaving a linear equation.'], 'equidistant point on the y-axis');
          } }] },
        /* ---- EP 11: parallelogram ABCD ---- */
        { num: '11', section: 'Extra practice D — Diagonals, midpoints, and parallelograms', shared: function (r) {
            if (r.chance(0.2)) return { A: [-6, -2], u: [8, -2], w: [4, 8] };
            return pickWhere(function () {
              var u = [r.int(5, 9), -r.int(0, 3)], rect = r.chance(0.25), w = rect ? scl([-u[1], u[0]], r.pick([1, 1])) : [r.int(-2, 5), r.int(5, 9)];
                          return { A: [r.int(-7, -4), r.int(-4, 0)], u: u, w: w };
            }, function (z) { var C = add(add(z.A, z.u), z.w), D = add(z.A, z.w), Bq = add(z.A, z.u), ac = d2(z.A, C), bd = d2(Bq, D); return (z.u[0] + z.w[0]) % 2 === 0 && (z.u[1] + z.w[1]) % 2 === 0 && [C, D, Bq].every(function (p) { return Math.abs(p[0]) <= 9 && Math.abs(p[1]) <= 9; }) && !isSq(ac) && !isSq(bd) && (radParts(ac).k > 1 || radParts(bd).k > 1); });
          },
          stem: function (o) { var A = o.A, Bq = add(A, o.u), C = add(Bq, o.w), D = add(A, o.w); return 'Quadrilateral ' + t('ABCD') + ' has vertices ' + t(nm('A', A)) + ', ' + t(nm('B', Bq)) + ', ' + t(nm('C', C)) + ', and ' + t(nm('D', D)) + '.' + figPoly([A, Bq, C, D], ['A', 'B', 'C', 'D'], { closed: true, dash: [[A, C], [Bq, D]] }); },
          parts: [
            { id: 'e11a', sub: 'a', level: 'BEG', make: function (r, o) {
              var A = o.A, Bq = add(A, o.u), C = add(Bq, o.w), D = add(A, o.w);
              return B.fields('Determine the midpoint of diagonal ' + t('\\overline{AC}') + ' and the midpoint of diagonal ' + t('\\overline{BD}') + '.', [ptField(t('\\overline{AC}')), ptField(t('\\overline{BD}'))],
                [ptCheck(mid(A, C), { cands: midCands(A, C) }), ptCheck(mid(Bq, D), { cands: midCands(Bq, D) })], [ptKey(mid(A, C)), ptKey(mid(Bq, D))], t('\\overline{AC}') + ': ' + t(ptT(mid(A, C))) + ', ' + t('\\overline{BD}') + ': ' + t(ptT(mid(Bq, D))),
                t(mLine(A, C)) + '<br>' + t(mLine(Bq, D)), HM, 'midpoints of the diagonals');
            } },
            { id: 'e11b', sub: 'b', level: 'EMG', make: function (r, o) {
              var M = mid(o.A, add(add(o.A, o.u), o.w));
              return mcPart(r, 'Both diagonals have the midpoint ' + t(ptT(M)) + '. What does this prove about ' + t('ABCD') + '?', [
                { html: 'The diagonals bisect each other, and a quadrilateral whose diagonals bisect each other is a <b>parallelogram</b>.', right: true },
                { html: 'It proves the diagonals are equal, so ' + t('ABCD') + ' is a rectangle.', why: 'A shared midpoint says where the diagonals cross, not how long they are.' },
                { html: 'It proves the diagonals are perpendicular, so ' + t('ABCD') + ' is a rhombus.', why: 'Midpoints say nothing about the angle between the diagonals.' },
                { html: 'It proves ' + t('ABCD') + ' is a square.', why: 'A square needs equal and perpendicular diagonals too — midpoints alone can’t show that.' }],
                'The two diagonals have the same midpoint, so they bisect each other. Property: <i>a quadrilateral whose diagonals bisect each other is a parallelogram</i>. So ' + t('ABCD') + ' is a parallelogram.', ['What does it mean when two diagonals share a midpoint?'], 'shared midpoint → parallelogram');
            } },
            { id: 'e11c', sub: 'c', level: 'PRG', make: function (r, o) {
              var A = o.A, Bq = add(A, o.u), C = add(Bq, o.w), D = add(A, o.w), n1 = d2(A, C), n2 = d2(Bq, D);
              return B.fields('Calculate the exact lengths of both diagonals.', [lenField('AC'), lenField('BD')], [lenCheck(n1, 1, { cands: dCands(A, C) }), lenCheck(n2, 1, { cands: dCands(Bq, D) })], [lenKey(n1), lenKey(n2)],
                t('AC=' + lenTex(n1) + ',\\ BD=' + lenTex(n2)), t(dLine(A, C, 'AC') + simpTail(n1)) + '<br>' + t(dLine(Bq, D, 'BD') + simpTail(n2)), HD, 'diagonal lengths');
            } },
            { id: 'e11c2', sub: 'c, rectangle?', level: 'EMG', make: function (r, o) {
              var A = o.A, Bq = add(A, o.u), C = add(Bq, o.w), D = add(A, o.w), n1 = d2(A, C), n2 = d2(Bq, D), eq = n1 === n2;
              return mcPart(r, 'Use the diagonal lengths ' + t('AC=' + lenTex(n1)) + ' and ' + t('BD=' + lenTex(n2)) + ' to decide whether ' + t('ABCD') + ' is a rectangle.', [
                { html: 'Yes — it is a parallelogram with <b>equal</b> diagonals, so it is a rectangle.', right: eq, why: eq ? null : 'The diagonals are not equal: ' + t(lenTex(n1) + '\\ne ' + lenTex(n2)) + '.' },
                { html: 'No — a rectangle’s diagonals are equal, and these are not.', right: !eq, why: eq ? 'Look again: ' + t('AC=BD=' + lenTex(n1)) + '.' : null },
                { html: 'Yes — every parallelogram is a rectangle.', why: 'Most parallelograms are slanted. A rectangle is the special parallelogram whose diagonals are equal.' },
                { html: 'You can’t tell from the diagonals.', why: 'You can: a parallelogram is a rectangle exactly when its diagonals are equal.' }],
                'A rectangle is a parallelogram whose diagonals are equal. ' + (eq ? t('AC=BD=' + lenTex(n1)) + ', so ' + t('ABCD') + ' <b>is a rectangle</b>.' : t(lenTex(n1) + '\\ne ' + lenTex(n2)) + ', so ' + t('ABCD') + ' is <b>not a rectangle</b> — it is a parallelogram only.'), ['Which special parallelogram has equal diagonals?'], 'rectangle from diagonals');
            } }] },
        /* ---- EP 12: is PQRS a parallelogram? ---- */
        { num: '12', shared: function (r) {
            if (r.chance(0.2)) return { P: [-5, -3], Q: [3, -5], R: [7, 3], S: [-3, 5] };
            return pickWhere(function () {
              var P0 = [r.int(-6, -3), r.int(-4, -1)], u = [r.int(6, 9), -r.int(0, 3)], w = [r.int(1, 4), r.int(6, 9)], sh = r.chance(0.7) ? r.pick([[2, 0], [-2, 0], [0, 2], [0, -2], [2, 2]]) : [0, 0];
              return { P: P0, Q: add(P0, u), R: add(add(P0, u), w), S: add(add(P0, w), sh) };
            }, function (z) { return (z.P[0] + z.R[0]) % 2 === 0 && (z.P[1] + z.R[1]) % 2 === 0 && (z.Q[0] + z.S[0]) % 2 === 0 && (z.Q[1] + z.S[1]) % 2 === 0 && [z.Q, z.R, z.S].every(function (p) { return Math.abs(p[0]) <= 10 && Math.abs(p[1]) <= 10; }); });
          },
          stem: function (o) { return 'Quadrilateral ' + t('PQRS') + ' has vertices ' + t(nm('P', o.P)) + ', ' + t(nm('Q', o.Q)) + ', ' + t(nm('R', o.R)) + ', and ' + t(nm('S', o.S)) + '. Use the diagonals to decide whether ' + t('PQRS') + ' is a parallelogram.'; },
          parts: [
            { id: 'e12', sub: 'midpoints', level: 'BEG', make: function (r, o) {
              return B.fields('Determine the midpoint of each diagonal.', [ptField(t('\\overline{PR}')), ptField(t('\\overline{QS}'))],
                [ptCheck(mid(o.P, o.R), { cands: midCands(o.P, o.R) }), ptCheck(mid(o.Q, o.S), { cands: midCands(o.Q, o.S) })], [ptKey(mid(o.P, o.R)), ptKey(mid(o.Q, o.S))],
                t('\\overline{PR}') + ': ' + t(ptT(mid(o.P, o.R))) + ', ' + t('\\overline{QS}') + ': ' + t(ptT(mid(o.Q, o.S))), t(mLine(o.P, o.R)) + '<br>' + t(mLine(o.Q, o.S)), ['The diagonals join opposite vertices: ' + t('P') + ' with ' + t('R') + ', and ' + t('Q') + ' with ' + t('S') + '.'].concat(HM.slice(0, 1)), 'midpoints of PR and QS');
            } },
            { id: 'e12b', sub: 'conclusion', level: 'EMG', make: function (r, o) {
              var m1 = mid(o.P, o.R), m2 = mid(o.Q, o.S), eq = samePt(m1, m2);
              return mcPart(r, 'The diagonals’ midpoints are ' + t(ptT(m1)) + ' and ' + t(ptT(m2)) + '. What is your conclusion?', [
                { html: t('PQRS') + ' is a parallelogram: the diagonals bisect each other.', right: eq, why: eq ? null : 'The midpoints are different points, so the diagonals don’t bisect each other.' },
                { html: t('PQRS') + ' is not a parallelogram: the diagonals do not bisect each other.', right: !eq, why: eq ? 'The two midpoints are the same point — the diagonals bisect each other.' : null },
                { html: t('PQRS') + ' is a parallelogram because its midpoints are close together.', why: 'Close isn’t enough: the diagonals bisect each other only if the midpoints are <b>exactly</b> the same point.' },
                { html: 'You need the side lengths before you can decide.', why: 'The diagonal test settles it: a quadrilateral is a parallelogram exactly when its diagonals bisect each other.' }],
                eq ? 'The midpoints are the same, so the diagonals bisect each other: ' + t('PQRS') + ' <b>is a parallelogram</b>.' : 'The midpoints ' + t(ptT(m1)) + ' and ' + t(ptT(m2)) + ' are different, so the diagonals do not bisect each other: ' + t('PQRS') + ' is <b>not a parallelogram</b>.', ['Are the two midpoints the same point?'], 'parallelogram conclusion');
            } }] },
        /* ---- EP 13: the three fourth vertices ---- */
        { num: '13', shared: function (r) {
            if (r.chance(0.2)) return { A: [-3, 1], B: [5, 3], C: [1, -5] };
            return pickWhere(function () { return { A: [r.int(-6, -1), r.int(-2, 4)], B: [r.int(2, 7), r.int(0, 6)], C: [r.int(-2, 4), r.int(-7, -2)] }; }, function (z) {
              var cr = (z.B[0] - z.A[0]) * (z.C[1] - z.A[1]) - (z.B[1] - z.A[1]) * (z.C[0] - z.A[0]); var Ds = [add(z.A, sub(z.C, z.B)), add(z.A, sub(z.B, z.C)), add(z.B, sub(z.C, z.A))];
              return Math.abs(cr) >= 10 && Ds.every(function (p) { return Math.abs(p[0]) <= 12 && Math.abs(p[1]) <= 12; }); });
          },
          stem: function (o) { return '<i>(Stretch)</i> Three vertices of a parallelogram are ' + t(nm('A', o.A)) + ', ' + t(nm('B', o.B)) + ', and ' + t(nm('C', o.C)) + '. There is more than one point ' + t('D') + ' that completes a parallelogram.'; },
          parts: [
            { id: 'e13a', sub: 'a', level: 'MAS', make: function (r, o) {
              var D1 = sub(add(o.A, o.C), o.B), D2 = sub(add(o.A, o.B), o.C), D3 = sub(add(o.B, o.C), o.A), W = [D1, D2, D3];
              var line = function (d1, d2, other, nmD, nmO, nm1, nm2) { var M = mid(d1, d2); return '<b>Diagonals ' + t('\\overline{' + nm1 + nm2 + '}') + ' and ' + t('\\overline{' + nmO + 'D}') + ':</b> midpoint of ' + t('\\overline{' + nm1 + nm2 + '}') + ' ' + t('=' + ptT(M)) + ', so ' + t('D=(2(' + nT(M[0]) + ')-' + sgp(other[0]) + ',\\ 2(' + nT(M[1]) + ')-' + sgp(other[1]) + ')=' + ptT(nmD)) + '.'; };
              return { prompt: 'Determine <b>all three</b> possible positions of ' + t('D') + '. (Type the three points separated by commas.)', input: { type: 'math', keys: 'pairs', placeholder: 'e.g. (1, 2), (3, -4), (5, 0)' },
                check: ptsCheck(W, { missCode: 'par-one-d', missHint: 'Correct so far — there are <b>three</b> positions. Each of the pairs ' + t('AB') + ', ' + t('AC') + ', ' + t('BC') + ' can be a diagonal; the fourth vertex is the far end of the diagonal through the remaining point.', diag: function (L) {
                  var avg = [mid(o.A, o.B), mid(o.A, o.C), mid(o.B, o.C)]; if (L.some(function (p) { return avg.some(function (q) { return samePt(p, q); }); })) return { code: 'end-average', hint: 'One of your points is the midpoint of two vertices — that is where the diagonals cross, not the fourth vertex. Double that midpoint and subtract the third vertex.' }; return null; } }),
                key: W.map(ptKey).join(', '), answer: t(W.map(function (p) { return 'D' + ptT(p); }).join(',\\ ')),
                solution: 'Choose which given pair is a diagonal; ' + t('D') + ' is then the other end of the diagonal through the remaining point (double the midpoint, subtract).<br>' + line(o.A, o.C, o.B, D1, 'B', 'A', 'C') + '<br>' + line(o.A, o.B, o.C, D2, 'C', 'A', 'B') + '<br>' + line(o.B, o.C, o.A, D3, 'A', 'B', 'C'),
                hints: ['In a parallelogram the diagonals share a midpoint. Pick a pair of the given points to be a diagonal, find its midpoint, then ' + t('D=2M-') + '(the third point).', 'Do this for each of the three pairs.'], text: 'three fourth vertices', good: [ptKey(D3) + ', ' + ptKey(D1) + ', ' + ptKey(D2)], bad: [ptKey(D1), ptKey(D1) + ', ' + ptKey(D2)] };
            } },
            { id: 'e13b', sub: 'b', level: 'PRG', make: function (r) {
              return mcPart(r, 'Why do exactly three points work, and not four or more?', [
                { html: t('D') + ' must share a diagonal with one of ' + t('A') + ', ' + t('B') + ', ' + t('C') + ', and the other two then form the second diagonal. There are only three ways to choose that pair, and each choice forces one ' + t('D') + '.', right: true },
                { html: 'A parallelogram has four vertices, and one is already used, so three are left.', why: 'Counting vertices isn’t the reason. Count the ways to choose which pair of the given points is a diagonal.' },
                { html: 'Because three points always make a triangle, and a triangle has three sides.', why: 'Close, but the real reason is the diagonal: each choice of which given pair is a diagonal fixes exactly one ' + t('D') + '.' },
                { html: 'There could be more — we just found three of them.', why: 'Every parallelogram through ' + t('A') + ', ' + t('B') + ', ' + t('C') + ' has one of the three pairs as a diagonal, and each pair gives exactly one ' + t('D') + '.' }],
                t('D') + ' is the far end of a diagonal whose other end is one of ' + t('A') + ', ' + t('B') + ', ' + t('C') + '; the other two given points form the second diagonal. There are only three ways to choose which pair (' + t('AB') + ', ' + t('AC') + ' or ' + t('BC') + ') is the other diagonal, and each choice forces a single ' + t('D') + '.', ['How many ways can you pick which two given points form a diagonal?'], 'why exactly three');
            } }] },
        /* ---- EP 14: park map ---- */
        { num: '14', section: 'Extra practice E — A map with a scale', shared: function (r) {
            if (r.chance(0.2)) return { L: [-5, 8], S: [7, -1], W: [10, 8], k: 2 };
            return pickWhere(function () {
              var tr = r.pick([[12, 9], [8, 6], [9, 12], [6, 8], [12, 5], [4, 3]]), L0 = [r.int(-6, -3), r.int(5, 9)];
              return { L: L0, S: [L0[0] + tr[0], L0[1] - tr[1]], W: r.chance(0.45) ? [L0[0] + r.int(-3, 5), L0[1] + r.int(1, 5)] : [r.int(4, 11), r.int(4, 9)], k: r.pick([2, 2, 3, 5]) };
            }, function (z) { var a = dist(z.L, z.W), b = dist(z.S, z.W); return Math.abs(a - b) > 1 && !samePt(z.W, z.S) && !samePt(z.W, z.L) && z.S[1] >= -4; });
          },
          stem: function (o) { return 'A provincial park prints a map with a coordinate grid laid over it. A fire lookout is at ' + t(nm('L', o.L)) + ', a ranger station is at ' + t(nm('S', o.S)) + ', and a warden’s cabin is at ' + t(nm('W', o.W)) + '. On this map ' + t('1') + ' grid unit represents ' + t(o.k) + '&nbsp;km.' + figPoly([o.L, o.S, o.W], ['L', 'S', 'W'], { segs: [[o.L, o.S]] }); },
          parts: [
            { id: 'e14a', sub: 'a', level: 'EMG', make: function (r, o) {
              var D = dist(o.L, o.S);
              return B.fields('Determine the distance from ' + t('L') + ' to ' + t('S') + ' in grid units, then convert it to kilometres.', [{ label: t('LS='), name: 'units', after: 'units' }, { label: t('LS='), name: 'km', after: 'km' }],
                [K.number(D, matchDiag(dCands(o.L, o.S))), K.number(D * o.k, numDiag([[D, 'd-units', 'Multiply the grid units by ' + t(o.k) + '&nbsp;km per unit.'], [D / o.k, 'd-scale-div', 'Each unit is ' + t(o.k) + '&nbsp;km, so <b>multiply</b> by ' + t(o.k) + '.']]))], [String(D), String(D * o.k)], t('LS=' + D) + ' units ' + t('=' + D * o.k) + '&nbsp;km',
                dSteps(o.L, o.S) + '<br>' + t(dLine(o.L, o.S, 'LS') + '=' + D) + ' units; ' + t(D + '\\times ' + o.k + '=' + D * o.k) + '&nbsp;km.', HD, 'LS in units and km');
            } },
            { id: 'e14b', sub: 'b', level: 'BEG', make: function (r, o) {
              return ptPart('A supply drop is to be made at the point exactly halfway between ' + t('L') + ' and ' + t('S') + '. State its coordinates.', mid(o.L, o.S), { cands: midCands(o.L, o.S) }, 'A location, so use the midpoint formula:<br>' + t(mLine(o.L, o.S)) + '.', HM, 'supply drop midpoint');
            } },
            { id: 'e14c', sub: 'c', level: 'EMG', make: function (r, o) {
              var D = dist(o.L, o.S);
              return B.number('A supply drop is made at the point exactly halfway between ' + t('L') + ' and ' + t('S') + '. How far, in kilometres, must a crew travel from the lookout to reach the supply drop?', D / 2 * o.k, numDiag([[D / 2, 'd-units', 'That is in grid units. Multiply by ' + t(o.k) + '&nbsp;km per unit.'], [D * o.k, 'd-half', 'That is the whole distance from ' + t('L') + ' to ' + t('S') + '. The drop is halfway.'], [D, 'd-units', 'The drop is halfway, and the answer must be in km.']]),
                'The drop is halfway, so the distance is half of ' + t('LS') + ': ' + t('\\tfrac{1}{2}(' + D + ')=' + nT(D / 2)) + ' units ' + t('=' + nT(D / 2) + '\\times ' + o.k + '=' + nT(D / 2 * o.k)) + '&nbsp;km.', ['The drop is at the midpoint, so the trip is half of ' + t('LS') + '.', 'Then convert grid units to km.'], 'lookout to supply drop', { after: 'km' });
            } },
            { id: 'e14d', sub: 'd', level: 'PRG', make: function (r, o) {
              var a = dist(o.L, o.W) * o.k, b = dist(o.S, o.W) * o.k;
              return B.fields('Find the distance from the cabin ' + t('W') + ' to ' + t('L') + ' and to ' + t('S') + ', in kilometres to the nearest tenth.', [{ label: t('LW='), name: 'LW', after: 'km' }, { label: t('SW='), name: 'SW', after: 'km' }],
                [K.approx(a, 1, { diag: matchDiag([[a / o.k, 'd-units', 'Convert to km: multiply the grid units by ' + t(o.k) + '.']], 1) }), K.approx(b, 1, { diag: matchDiag([[b / o.k, 'd-units', 'Convert to km: multiply the grid units by ' + t(o.k) + '.']], 1) })], [fx(a, 1), fx(b, 1)], t('LW\\approx ' + fx(a, 1)) + '&nbsp;km, ' + t('SW\\approx ' + fx(b, 1)) + '&nbsp;km',
                t(dLine(o.L, o.W, 'LW') + simpTail(d2(o.L, o.W))) + ' units, ' + t('\\times ' + o.k + '\\approx ' + fx(a, 1)) + '&nbsp;km<br>' + t(dLine(o.S, o.W, 'SW') + simpTail(d2(o.S, o.W))) + ' units, ' + t('\\times ' + o.k + '\\approx ' + fx(b, 1)) + '&nbsp;km', HD.concat(['Multiply each length by ' + t(o.k) + ' before rounding.']), 'cabin distances in km');
            } },
            { id: 'e14d2', sub: 'd, closer', level: 'LIM', make: function (r, o) {
              var a = rd(dist(o.L, o.W) * o.k, 1), b = rd(dist(o.S, o.W) * o.k, 1), toS = b < a;
              return mcPart(r, 'With ' + t('LW\\approx ' + fx(a, 1)) + '&nbsp;km and ' + t('SW\\approx ' + fx(b, 1)) + '&nbsp;km, is the cabin closer to ' + t('L') + ' or to ' + t('S') + '?', [
                { html: 'Closer to the lookout ' + t('L') + '.', right: !toS, why: toS ? t(fx(b, 1) + '<' + fx(a, 1)) + ', so the ranger station is closer.' : null },
                { html: 'Closer to the ranger station ' + t('S') + '.', right: toS, why: toS ? null : t(fx(a, 1) + '<' + fx(b, 1)) + ', so the lookout is closer.' },
                { html: 'The same distance from both.', why: 'The two distances are different.' }],
                (toS ? t(fx(b, 1) + '<' + fx(a, 1)) + ', so the cabin is <b>closer to the ranger station ' + t('S') + '</b>.' : t(fx(a, 1) + '<' + fx(b, 1)) + ', so the cabin is <b>closer to the lookout ' + t('L') + '</b>.'), ['The smaller distance wins.'], 'which is closer');
            } }] },
        /* ---- EP 15: Rowan subtracted ---- */
        { num: '15', section: 'Extra practice F — Error analysis', shared: function (r) {
            if (r.chance(0.2)) return { A: [-6, 2], B: [4, 10] };
            return pickWhere(function () { return { A: [r.int(-8, -2), r.int(-3, 4)], B: [r.int(1, 8), r.int(5, 12)] }; }, function (z) { return (z.A[0] + z.B[0]) % 2 === 0 && (z.A[1] + z.B[1]) % 2 === 0 && z.A[1] !== 0; });
          },
          stem: function (o) { var h = [(o.B[0] - o.A[0]) / 2, (o.B[1] - o.A[1]) / 2]; return 'Asked for the midpoint of ' + t('\\overline{AB}') + ' with ' + t(nm('A', o.A)) + ' and ' + t(nm('B', o.B)) + ', Rowan wrote ' + t('M=\\left(\\dfrac{x_2-x_1}{2},\\ \\dfrac{y_2-y_1}{2}\\right)=\\left(\\dfrac{' + o.B[0] + '-' + sgp(o.A[0]) + '}{2},\\ \\dfrac{' + o.B[1] + '-' + sgp(o.A[1]) + '}{2}\\right)=' + ptT(h)) + '.'; },
          parts: [
            { id: 'e15a', sub: 'a, error', level: 'EMG', make: function (r) {
              return mcPart(r, 'What is Rowan’s error?', [
                { html: 'He <b>subtracted</b> the coordinates; the midpoint formula <b>adds</b> them (it averages).', right: true },
                { html: 'He divided by ' + t('2') + ' — the midpoint formula doesn’t divide.', why: 'The midpoint formula does divide by ' + t('2') + ': it averages. The problem is the minus signs.' },
                { html: 'He put the ' + t('x') + '- and ' + t('y') + '-coordinates in the wrong order.', why: 'His ' + t('x') + ' comes first and his ' + t('y') + ' second — that part is fine. Look at the operation inside each bracket.' },
                { html: 'He subtracted in the wrong order: it should be ' + t('x_1-x_2') + '.', why: 'Neither order of subtraction gives the midpoint. The midpoint formula adds: ' + t('\\dfrac{x_1+x_2}{2}') + '.' }],
                'Rowan subtracted; the midpoint formula adds the coordinates and divides by ' + t('2') + ' — it averages.', ['Compare his work with ' + t('M\\left(\\dfrac{x_1+x_2}{2},\\ \\dfrac{y_1+y_2}{2}\\right)') + '.'], 'Rowan’s error');
            } },
            { id: 'e15a2', sub: 'a, correct', level: 'BEG', make: function (r, o) {
              return ptPart('Give the correct midpoint.', mid(o.A, o.B), { cands: midCands(o.A, o.B), before: 'M =' }, t(mLine(o.A, o.B, 'M')) + '.', HM, 'correct Rowan’s midpoint');
            } },
            { id: 'e15b', sub: 'b', level: 'PRG', make: function (r, o) {
              var h = [(o.B[0] - o.A[0]) / 2, (o.B[1] - o.A[1]) / 2], M = mid(o.A, o.B);
              return mcPart(r, 'Rowan’s expression is not meaningless — it computes something. What is ' + t(ptT(h)) + '?', [
                { html: 'Half the run and half the rise: the <b>step</b> from ' + t('A') + ' to the midpoint. Adding it to ' + t('A') + ' gives ' + t('M') + ': ' + t(ptT(o.A) + '+' + ptT(h) + '=' + ptT(M)) + '.', right: true },
                { html: 'Half the distance from ' + t('A') + ' to ' + t('B') + '.', why: 'A distance is a single number (here ' + t('\\tfrac{1}{2}AB') + ' would need a square root). ' + t(ptT(h)) + ' is a pair: a horizontal and a vertical step.' },
                { html: 'The slope of ' + t('\\overline{AB}') + '.', why: 'A slope is one number, rise divided by run. Rowan halved the run and the rise separately.' },
                { html: 'The midpoint of ' + t('\\overline{AB}') + ' measured from ' + t('B') + '.', why: 'Try it: start at ' + t('A') + ' and move ' + t(nT(h[0])) + ' across and ' + t(nT(h[1])) + ' up — where do you land?' }],
                t(ptT(h)) + ' is half the run and half the rise — the <b>step</b> (displacement) from ' + t('A') + ' to the midpoint, a movement rather than a location. Adding it to ' + t('A') + ': ' + t(ptT(o.A) + '+' + ptT(h) + '=' + ptT(M)) + ' ' + t('=M') + '.', ['Start at ' + t('A') + ' and move by Rowan’s numbers. Where do you end up?'], 'what Rowan computed');
            } },
            { id: 'e15c', sub: 'c', level: 'PRG', make: function (r) {
              return mcPart(r, 'For which endpoints would Rowan’s method accidentally give the right answer?', [
                { html: 'Only when the first endpoint ' + t('(x_1,\\ y_1)') + ' is the origin ' + t('(0,\\ 0)') + '.', right: true },
                { html: 'When the second endpoint ' + t('(x_2,\\ y_2)') + ' is the origin.', why: 'Then Rowan gets ' + t('\\left(-\\tfrac{x_1}{2},\\ -\\tfrac{y_1}{2}\\right)') + ' but the midpoint is ' + t('\\left(\\tfrac{x_1}{2},\\ \\tfrac{y_1}{2}\\right)') + ' — the signs are wrong.' },
                { html: 'When the segment is horizontal or vertical.', why: 'Try ' + t('(2,\\ 0)') + ' and ' + t('(6,\\ 0)') + ': Rowan gets ' + t('(2,\\ 0)') + ' but the midpoint is ' + t('(4,\\ 0)') + '.' },
                { html: 'Never.', why: 'Solve ' + t('\\tfrac{x_2-x_1}{2}=\\tfrac{x_1+x_2}{2}') + ': it works when ' + t('x_1=0') + '.' }],
                'Rowan’s method is right when ' + t('\\dfrac{x_2-x_1}{2}=\\dfrac{x_1+x_2}{2}') + ', i.e. ' + t('-x_1=x_1') + ', so ' + t('x_1=0') + '; likewise ' + t('y_1=0') + '. Only when the first endpoint is the <b>origin</b>.', ['Set Rowan’s expression equal to the real one and solve.'], 'when Rowan is right');
            } }] },
        /* ---- EP 16: Simone wrote a point for a distance ---- */
        { num: '16', shared: function (r) {
            if (r.chance(0.2)) return { P: [-2, 5], Q: [6, -1] };
            var L = triple(r, 8); if (L[0] % 2 || L[1] % 2) L = [2 * L[0], 2 * L[1]];
            var P0 = [r.int(-6, -1), r.int(2, 8)]; return { P: P0, Q: [P0[0] + L[0], P0[1] - L[1]] };
          },
          stem: function (o) { return 'Asked for the <b>distance</b> between ' + t(nm('P', o.P)) + ' and ' + t(nm('Q', o.Q)) + ', Simone wrote ' + t(ptT(mid(o.P, o.Q))) + ' and circled it.'; },
          parts: [
            { id: 'e16a', sub: 'a', level: 'EMG', make: function (r, o) {
              return mcPart(r, 'Simone’s answer is correct arithmetic for a different question. Which one?', [
                { html: 'The <b>midpoint</b> of ' + t('\\overline{PQ}') + '.', right: true },
                { html: 'The slope of ' + t('\\overline{PQ}') + '.', why: 'A slope is a single number. ' + t(ptT(mid(o.P, o.Q))) + ' is an ordered pair — average the coordinates and see what you get.' },
                { html: 'The run and the rise from ' + t('P') + ' to ' + t('Q') + '.', why: 'The run and rise are ' + t(nT(o.Q[0] - o.P[0])) + ' and ' + t(nT(o.Q[1] - o.P[1])) + '.' },
                { html: 'Half the distance from ' + t('P') + ' to ' + t('Q') + '.', why: 'Half a distance is still one number, not an ordered pair.' }],
                t(mLine(o.P, o.Q)) + ' — Simone found the <b>midpoint</b>.', ['Try averaging the coordinates of ' + t('P') + ' and ' + t('Q') + '.'], 'Simone answered the midpoint');
            } },
            { id: 'e16b', sub: 'b', level: 'BEG', make: function (r, o) {
              var D = dist(o.P, o.Q);
              return B.number('Give the correct answer to the question that was asked.', D, matchDiag(dCands(o.P, o.Q)), dSteps(o.P, o.Q) + '<br>' + t(dLine(o.P, o.Q, 'PQ') + simpTail(d2(o.P, o.Q))) + '.', HD, 'distance PQ');
            } },
            { id: 'e16c', sub: 'c', level: 'EMG', make: function (r) {
              return mcPart(r, 'Which one-glance check on the <b>form</b> of an answer would have caught this?', [
                { html: 'A distance is a single non-negative <b>number</b>; a midpoint is an <b>ordered pair</b>. A bracketed pair as the answer to “how far?” means the wrong formula was used.', right: true },
                { html: 'A distance is always a whole number.', why: 'Distances are often radicals or decimals, e.g. ' + t('\\sqrt{113}\\approx 10.63') + '.' },
                { html: 'A distance must be larger than both coordinates of each point.', why: 'That isn’t true in general — and it doesn’t check the <b>form</b> of the answer.' },
                { html: 'The answer must contain a square root sign.', why: 'Many distances come out as whole numbers (e.g. ' + t('\\sqrt{100}=10') + ').' }],
                'A distance is one non-negative number; a midpoint is an ordered pair ' + t('(x,\\ y)') + '. An answer with brackets and a comma for a “how far” question signals the wrong formula.', ['What kind of answer does a “how far” question need?'], 'form check: number vs pair');
            } }] },
        /* ---- EP 17: Theo averaged ---- */
        { num: '17', shared: function (r) {
            if (r.chance(0.2)) return { A: [-5, 4], M: [3, -2] };
            return pickWhere(function () { return { A: [r.int(-8, -1), r.int(1, 8)], M: [r.int(1, 7), r.int(-7, -1)] }; }, function (z) { return (z.A[0] + z.M[0]) % 2 === 0 && (z.A[1] + z.M[1]) % 2 === 0; });
          },
          stem: function (o) { var th = mid(o.A, o.M); return 'Asked to find ' + t('B') + ' given ' + t(nm('A', o.A)) + ' and midpoint ' + t(nm('M', o.M)) + ', Theo averaged ' + t('A') + ' and ' + t('M') + ': ' + t('B=\\left(\\dfrac{' + o.M[0] + '+' + sgp(o.A[0]) + '}{2},\\ \\dfrac{' + o.M[1] + '+' + sgp(o.A[1]) + '}{2}\\right)=' + ptT(th)) + '.'; },
          parts: [
            { id: 'e17a', sub: 'a', level: 'PRG', make: function (r, o) {
              return mcPart(r, 'Why is averaging the wrong operation here, and what is Theo’s point ' + t(ptT(mid(o.A, o.M))) + ' actually?', [
                { html: 'Averaging finds the point <i>between</i> the two points used. ' + t('B') + ' lies <i>beyond</i> ' + t('M') + ', so Theo found the midpoint of ' + t('\\overline{AM}') + ' — only a quarter of the way from ' + t('A') + ' to ' + t('B') + '.', right: true },
                { html: 'Averaging is right, but Theo should have averaged ' + t('M') + ' with ' + t('B') + '.', why: t('B') + ' is the unknown — you can’t average with it. Solve ' + t('\\dfrac{x_A+x_B}{2}=x_M') + ' for ' + t('x_B') + ' instead.' },
                { html: 'Theo’s point is ' + t('B') + '; he just forgot to round.', why: 'Test it: the midpoint of ' + t('A') + ' and Theo’s point is not ' + t('M') + ' (see part b).' },
                { html: 'Theo’s point is the midpoint of ' + t('\\overline{AB}') + '.', why: 'The midpoint of ' + t('\\overline{AB}') + ' is ' + t('M') + ' itself. Theo’s point sits halfway between ' + t('A') + ' and ' + t('M') + '.' }],
                'Averaging finds the point halfway between the two points used. ' + t('B') + ' is not between ' + t('A') + ' and ' + t('M') + ' — it lies beyond ' + t('M') + ', twice as far from ' + t('A') + ' as ' + t('M') + ' is. Theo’s ' + t(ptT(mid(o.A, o.M))) + ' is the <b>midpoint of ' + t('\\overline{AM}') + '</b>, a quarter of the way from ' + t('A') + ' to ' + t('B') + '.', ['Where is ' + t('B') + ' compared with ' + t('A') + ' and ' + t('M') + '?'], 'why averaging is wrong');
            } },
            { id: 'e17b', sub: 'b', level: 'EMG', make: function (r, o) {
              var th = mid(o.A, o.M), W = mid(o.A, th);
              var p = ptPart('Test Theo’s answer: find the midpoint of ' + t(nm('A', o.A)) + ' and Theo’s point ' + t(ptT(th)) + '. (Is it ' + t('M') + '?)', W, { cands: midCands(o.A, th).concat([[o.M, 'pt', 'Calculate it: average ' + t('A') + ' and Theo’s point. (It is not ' + t('M') + ' — that is why Theo’s answer fails.)']]) },
                t(mLine(o.A, th)) + '.<br>' + t(ptT(W) + '\\ne ' + ptT(o.M)) + ', so Theo’s answer fails. Correct: ' + t('B=2M-A=' + ptT(sub(scl(o.M, 2), o.A))) + '.', HM, 'test Theo’s point');
              if (!Number.isInteger(W[0]) || !Number.isInteger(W[1])) p.good.push('\\left(' + (Number.isInteger(W[0]) ? W[0] : '\\frac{' + W[0] * 2 + '}{2}') + ',' + (Number.isInteger(W[1]) ? W[1] : '\\frac{' + W[1] * 2 + '}{2}') + '\\right)');
              return p;
            } },
            { id: 'e17c', sub: 'c', level: 'EMG', make: function (r) {
              return mcPart(r, 'Which rule recovers a missing endpoint, and why is it the opposite of averaging?', [
                { html: 'Double the midpoint, then subtract the known endpoint: ' + t('x_B=2x_M-x_A') + '. Averaging adds then divides by ' + t('2') + '; the rule undoes those steps in reverse — multiply by ' + t('2') + ', then subtract.', right: true },
                { html: 'Subtract the known endpoint from the midpoint: ' + t('x_B=x_M-x_A') + '.', why: 'That gives the step from ' + t('A') + ' to ' + t('M') + ', not the endpoint. You have to double the midpoint first.' },
                { html: 'Add the midpoint and the known endpoint, then divide by ' + t('2') + '.', why: 'That is averaging again — Theo’s mistake.' },
                { html: 'Double the known endpoint, then subtract the midpoint: ' + t('x_B=2x_A-x_M') + '.', why: 'That goes the wrong way, past ' + t('A') + '. Solve ' + t('x_M=\\dfrac{x_A+x_B}{2}') + ' for ' + t('x_B') + '.' }],
                '<b>Rule:</b> ' + t('x_B=2x_M-x_A') + ', ' + t('y_B=2y_M-y_A') + '. Averaging adds the endpoints and then divides by ' + t('2') + '; solving ' + t('x_M=\\dfrac{x_A+x_B}{2}') + ' for ' + t('x_B') + ' undoes those steps in reverse order: multiply by ' + t('2') + ', then subtract.', ['Solve ' + t('x_M=\\dfrac{x_A+x_B}{2}') + ' for ' + t('x_B') + '.'], 'rule for a missing endpoint');
            } }] }
      ];
    }
  })();

  /* ======================================================================================
   * The merged lesson
   * ====================================================================================== */
  var t = HW.kit.t;
  function find(list, num) { for (var i = 0; i < list.length; i++) if (list[i].num === num) return list[i]; throw new Error('u6l1: no question ' + num); }
  function parts(q, ids) { return ids.map(function (id) { for (var i = 0; i < q.parts.length; i++) if (q.parts[i].id === id) return q.parts[i]; throw new Error('u6l1: no part ' + id); }); }
  function copy(o) { var c = {}; for (var k in o) c[k] = o[k]; return c; }
  /* a source question renumbered: o.parts (default: all), o.ids (new id suffixes), o.section, o.stem, o.extra */
  function Q(src, num, o) {
    o = o || {};
    var q = copy(src), ps = o.parts || src.parts, pre = (o.extra ? 'e' : '') + num;
    q.num = num;
    if (o.section) q.section = o.section; else delete q.section;
    if (o.stem !== undefined) q.stem = o.stem;
    q.parts = ps.map(function (p, i) {
      var c = copy(p);
      c.id = pre + (o.ids ? o.ids[i] : p.id.replace(/^e?\d+/, ''));
      delete c.outcome;
      return c;
    });
    delete q.outcome;
    return q;
  }
  /* a part whose prompt gets an extra instruction (when parts from different booklet questions share one stem) */
  function withNote(p, note) { var c = copy(p); c.make = function (r, sh) { var inst = p.make(r, sh); inst.prompt += note; return inst; }; return c; }

  var Aq = LEN.questions, Ax = LEN.extra, Bq = DM.questions, Bx = DM.extra;
  HW.defineLesson({
    id: 'u6l1', unit: 6, num: '1', title: 'Length, Distance, and Midpoint of a Line Segment', outcome: 'RF3',
    blurb: 'Lengths of horizontal and vertical segments by subtracting coordinates, diagonal lengths with the Pythagorean theorem and the distance formula (exact and rounded), midpoints by averaging, and working backwards from a midpoint.',
    questions: [
      Q(find(Aq, '1'), '1', { section: 'Horizontal and vertical lengths', parts: parts(find(Aq, '1'), ['1a', '1b']).concat(parts(find(Aq, '2'), ['2b', '2d'])), ids: ['a', 'b', 'c', 'd'] }),
      Q(find(Aq, '4'), '2'),
      Q(find(Aq, '5'), '3', { section: 'Diagonal lengths and the distance formula' }),
      Q(find(Bq, '1'), '4', { stem: 'Determine the distance between each pair of points.', ids: ['a', 'b', 'c', 'd'],
        parts: parts(find(Bq, '1'), ['1a', '1b']).concat([withNote(parts(find(Bq, '3'), ['3a'])[0], ', as an exact value in simplest radical form'), withNote(parts(find(Bq, '2'), ['2a'])[0], ', to the nearest hundredth')]) }),
      Q(find(Bq, '7'), '5'),
      Q(find(Bq, '11'), '6', { section: 'Midpoints', parts: parts(find(Bq, '11'), ['11a', '11b', '11c', '11e']), ids: ['a', 'b', 'c', 'd'] }),
      Q(find(Bq, '12'), '7'),
      Q(find(Bq, '13'), '8'),
      Q(find(Aq, '9'), '9', { section: 'Multiple choice and numerical response' }),
      Q(find(Bq, '9'), '10', { stem: '<i>(Multiple Choice)</i>' }),
      Q(find(Aq, '11'), '11'),
      Q(find(Bq, '18'), '12')
    ],
    extra: [
      Q(find(Ax, '1'), '1', { extra: true, section: 'Extra practice A — Read the grid before you count it' }),
      Q(find(Ax, '2'), '2', { extra: true }),
      Q(find(Ax, '4'), '3', { extra: true, section: 'Extra practice B — The exact value comes first' }),
      Q(find(Ax, '7'), '4', { extra: true, section: 'Extra practice C — Perimeter from coordinates' }),
      Q(find(Bx, '1'), '5', { extra: true, section: 'Extra practice D — One figure, two formulas' }),
      Q(find(Bx, '3'), '6', { extra: true }),
      Q(find(Bx, '4'), '7', { extra: true, section: 'Extra practice E — Backwards: the midpoint is known', parts: parts(find(Bx, '4'), ['e4a', 'e4b', 'e4c']) }),
      Q(find(Bx, '5'), '8', { extra: true }),
      Q(find(Ax, '10'), '9', { extra: true, section: 'Extra practice F — Backwards: the distance is known' }),
      Q(find(Bx, '14'), '10', { extra: true, section: 'Extra practice G — A map with a scale' }),
      Q(find(Ax, '13'), '11', { extra: true, section: 'Extra practice H — Error analysis' }),
      Q(find(Bx, '17'), '12', { extra: true }),
      Q(find(Ax, '15'), '13', { extra: true, section: 'Extra practice I — Multiple choice and numerical response' }),
      Q(find(Ax, '16'), '14', { extra: true }),
      Q(find(Ax, '17'), '15', { extra: true })
    ]
  });
})(window);
