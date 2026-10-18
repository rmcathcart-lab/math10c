/* Math 10C · Unit 6 · Lesson 6 — Coordinate Geometry Review: Slope, Linear Graphs, Distance and Midpoint
 * (cumulative review: each part is tagged with what it tests — RF3 slope / parallel / perpendicular / collinear,
 * RF4 "is it linear?", RF5 intercepts and domain/range, EXT distance, midpoint and lengths)
 * Assignment questions 1–13, the Written Response (a)–(c) and the Extension/Foundation questions 14–22 (u6_L06.tex),
 * and the whole Extra Practice EP05 (u6_EP05.tex, Q1–20).
 * Every part is a generator that keeps the booklet question's structure (which slope is negative, a run that is
 * negative, a segment listed right-to-left, a perfect-square distance, a rectangle vs a trapezoid, halves in a
 * midpoint, a point beyond the end of a segment …) and changes the numbers; the booklet's own figure is one of the
 * possible versions. Multi-answer items use labelled boxes (one shared keypad with digits, fraction, root, brackets,
 * comma and "undefined"); words such as a vertex letter or a triangle type go in small text boxes. "Explain" items
 * become multiple choice with misconception hints. Drawing items (EP 15(d), 16(b)) use the graph pad.
 * Levels follow LEVEL_RUBRIC.md (recognition formats one level below the constructed task, capped at PRG). */
(function (root) {
  'use strict';
  var HW = root.HW, ex = HW.ex, K = HW.kit, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form, B = K.P;
  var FORCE = root.__U6L6_BOOKLET === true;   // test hook: always build the booklet's own version (only an explicit true turns it on)

  HW.addCodes({
    'no-root': 'Gave the squared distance (no square root)', 'dist-add': 'Added the differences instead of their squares', 'dist-sub': 'Subtracted the squares',
    'pt-swap': 'Coordinates swapped', 'mid-sum': 'Added the coordinates but didn’t halve', 'mid-diff': 'Halved the differences instead of the sums', 'mid-sign': 'Sign slip in a midpoint',
    'end-avg': 'Averaged the midpoint and the endpoint', 'end-diff': 'Used midpoint − endpoint', 'end-wrongway': 'Went the wrong way from the midpoint',
    'perp-noflip': 'Changed the sign but didn’t take the reciprocal', 'perp-nosign': 'Took the reciprocal but didn’t change the sign', 'par-used': 'Used the parallel slope instead of the perpendicular one',
    'nr-yint': 'Gave the y-intercept', 'nr-step': 'Used the change per column, not per unit', 'nr-slope': 'Gave the slope', 'k-sign': 'Sign slip solving for the unknown', 'k-flip': 'Run over rise when working backwards',
    'used-odd': 'Used the slope of the point that isn’t on the line', 'circ-radius': 'Used the diameter as the radius', 'circ-noSq': 'Didn’t square the radius', 'circ-circum': 'Found the circumference',
    'sum-form': 'Exact answer not simplified (like terms / radicals)', 'word': 'Wrong word', 'letter': 'Wrong vertex / point', 'scale-m': 'Answer in metres, not kilometres', 'scale-none': 'Forgot the map scale',
    'fourth-other': 'Fourth vertex for a different diagonal', 'step-multiple': 'Point on the line, but not one run and rise', 'step-slope': 'Stepped with the original slope', 'two-seg': 'Not two separate segments',
    'seg-arrow': 'Drew lines instead of segments', 'ex-parallel': 'Example segments are parallel', 'ex-len': 'Example segments have different lengths', 'ex-notpar': 'Example segments not parallel',
    'ex-sameline': 'Example segments on the same line', 'ex-eqlen': 'Example segments have equal lengths', 'sq-points': 'Plotted the vertices without the sides', 'sq-recip': 'Used the reciprocal slope (no sign change) for the other diagonal',
    'sq-full': 'Other diagonal twice too long', 'nearest-end': 'Gave the far endpoint', 'foot-wrong': 'Wrong foot of the perpendicular',
    'pt-x': 'Point: x-coordinate wrong', 'pt-y': 'Point: y-coordinate wrong', 'letter-form': 'Typed more than a letter'
  });

  /* ---------------- numbers, fractions, points ---------------- */
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var c = a % b; a = b; b = c; } return a; }
  function nrm(p, q) { if (q < 0) { p = -p; q = -q; } var g = gcd(p, q) || 1; return [p / g, q / g]; }
  function toFr(x) { for (var q = 1; q <= 1000; q++) { var p = Math.round(x * q); if (Math.abs(p / q - x) < 1e-9) return [p, q]; } return [x, 1]; }
  function frT(p, q) { var f = nrm(p, q); return f[1] === 1 ? String(f[0]) : (f[0] < 0 ? '-' : '') + '\\frac{' + Math.abs(f[0]) + '}{' + f[1] + '}'; }
  function dfr(s) { return String(s).replace(/\\frac/g, '\\dfrac'); }
  function nT(x) { var f = toFr(x); return frT(f[0], f[1]); }
  function par(x) { return x < 0 ? '(' + nT(x) + ')' : nT(x); }
  function near(a, b) { return Math.abs(a - b) < 1e-9; }
  function ptT(p) { return '(' + nT(p[0]) + ',\\ ' + nT(p[1]) + ')'; }
  function ptK(p) { return '(' + nT(p[0]) + ', ' + nT(p[1]) + ')'; }
  function samePt(p, q) { return near(p[0], q[0]) && near(p[1], q[1]); }
  function add(p, q) { return [p[0] + q[0], p[1] + q[1]]; }
  function sub(p, q) { return [p[0] - q[0], p[1] - q[1]]; }
  function scl(p, k) { return [p[0] * k, p[1] * k]; }
  function mid(p, q) { return [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]; }
  function rot(v) { return [-v[1], v[0]]; }            // 90° anticlockwise
  function rotc(v) { return [v[1], -v[0]]; }           // 90° clockwise
  function d2(p, q) { var d = sub(q, p); return d[0] * d[0] + d[1] * d[1]; }
  function dot(u, v) { return u[0] * v[0] + u[1] * v[1]; }
  function inBox(pts, lo, hi, lo2, hi2) { if (lo2 == null) { lo2 = lo; hi2 = hi; } return pts.every(function (p) { return p[0] >= lo && p[0] <= hi && p[1] >= lo2 && p[1] <= hi2; }); }
  function distinctPts(pts) { for (var i = 0; i < pts.length; i++) for (var j = i + 1; j < pts.length; j++) if (samePt(pts[i], pts[j])) return false; return true; }
  function signs(r, v) { return [r.pick([1, -1]) * v[0], r.pick([1, -1]) * v[1]]; }
  function swapMaybe(r, v) { return r.chance(0.5) ? [v[1], v[0]] : v.slice(); }
  function book(r) { return FORCE || r.chance(0.2); }
  function rep(r, fn) { for (var i = 0; i < 500; i++) { var v = fn(); if (v) return v; } throw new Error('u6l6: generator found no case'); }
  function rnd(x, dp) { return K.roundTo(x, dp); }
  function fx1(x) { return rnd(x, 1).toFixed(1); }

  /* slope as [p, q] (q > 0, lowest terms) or null for vertical */
  function slopeOf(P, Q) { var dx = Q[0] - P[0], dy = Q[1] - P[1]; if (near(dx, 0)) return null; var f = toFr(dy / dx); return nrm(f[0], f[1]); }
  function sT(m) { return m == null ? '\\text{undefined}' : frT(m[0], m[1]); }
  function sameSlope(a, b) { return (a == null && b == null) || (a != null && b != null && a[0] * b[1] === b[0] * a[1]); }
  function perpOf(m) { if (m == null) return [0, 1]; if (m[0] === 0) return null; return nrm(-m[1], m[0]); }
  function isPerp(a, b) { if (a == null) return b != null && b[0] === 0; if (b == null) return a[0] === 0; return a[0] * b[0] === -a[1] * b[1]; }
  function mval(m) { return m[0] / m[1]; }
  /* LaTeX working: m_{PQ} = (yQ − yP)/(xQ − xP) = rise/run = m */
  function slW(P, Q, nm) {
    var dy = Q[1] - P[1], dx = Q[0] - P[0], m = slopeOf(P, Q);
    var s = 'm_{' + nm + '}=\\dfrac{' + nT(Q[1]) + '-' + par(P[1]) + '}{' + nT(Q[0]) + '-' + par(P[0]) + '}=\\dfrac{' + nT(dy) + '}{' + nT(dx) + '}';
    if (m == null) return s + '\\ \\text{(undefined)}';
    var mt = frT(m[0], m[1]); return s + (mt === nT(dy) && near(dx, 1) ? '' : '=' + dfr(mt));
  }
  /* exact radical √(n)/den */
  function sqfree(n) { var k = 1, m = n; for (var f = 2; f * f <= m; f++) while (m % (f * f) === 0) { m /= f * f; k *= f; } return [k, m]; }
  function radSpec(n, den) { den = den || 1; var s = sqfree(n); return { k: nrm(s[0], den), n: 2, m: s[1] }; }
  function radT(n, den) { return K.radTex(radSpec(n, den)); }
  function radV(n, den) { return Math.sqrt(n) / (den || 1); }
  /* distance working for lattice (or half-lattice) points: den = 1, 2, 3 scales the differences */
  function dW(P, Q, nm, den) {
    den = den || 1;
    var dx = Q[0] - P[0], dy = Q[1] - P[1], n = Math.round(d2(P, Q) * den * den);
    var s = nm + '=\\sqrt{(' + nT(Q[0]) + '-' + par(P[0]) + ')^{2}+(' + nT(Q[1]) + '-' + par(P[1]) + ')^{2}}=\\sqrt{' + par(dx) + '^{2}+' + par(dy) + '^{2}}';
    var inside = den === 1 ? String(n) : '\\frac{' + n + '}{' + (den * den) + '}';
    s += '=\\sqrt{' + inside + '}';
    var R = radT(n, den); if (R !== inside && R !== String(n)) s += '=' + R; else if (den === 1 && sqfree(n)[1] === 1) s += '=' + R;
    return s;
  }
  function n2(P, Q, den) { den = den || 1; return Math.round(d2(P, Q) * den * den); }
  function mW(P, Q, nm) { var M = mid(P, Q); return (nm ? 'M_{' + nm + '}=' : '') + '\\left(\\dfrac{' + nT(P[0]) + '+' + par(Q[0]) + '}{2},\\ \\dfrac{' + nT(P[1]) + '+' + par(Q[1]) + '}{2}\\right)=' + ptT(M); }

  /* ---------------- checkers ---------------- */
  /* an exact length √n / den: simplest mixed radical, or the whole number when n is a perfect square */
  function lenChk(n, den, dx, dy) {
    den = den || 1;
    var sp = radSpec(n, den), V = radV(n, den);
    var base = K.radical(sp, 'mixed', { diag: function (v) {
      if (n > 1 && near(v, n / (den * den))) return { code: 'no-root', hint: 'That’s the <b>square</b> of the distance. Take the square root at the end.' };
      if (dx != null && near(v, (Math.abs(dx) + Math.abs(dy)) / den) && dx !== 0 && dy !== 0) return { code: 'dist-add', hint: 'Square each difference and add the squares, then take the square root: ' + t('\\sqrt{(\\Delta x)^{2}+(\\Delta y)^{2}}') + '.' };
      if (dx != null && dx * dx !== dy * dy && dx !== 0 && dy !== 0 && near(v, Math.sqrt(Math.abs(dx * dx - dy * dy)) / den)) return { code: 'dist-sub', hint: 'The distance formula <b>adds</b> the two squares — it never subtracts them.' };
      return null;
    } });
    return function (resp) {
      if (sp.m === 1) { var p = HW.parse.number(String(resp == null ? '' : resp)); if (p.ok && near(p.value, V)) return ok(); }
      return base(resp);
    };
  }
  function lenFix(V, dp) { return K.approx(V, dp == null ? 1 : dp); }
  function readPt(s) {
    s = String(s == null ? '' : s).replace(/\\left|\\right/g, '').replace(/\\\{|\\\}|\\lbrace|\\rbrace/g, ' ');
    var m = /\(([^()]*)\)/.exec(s); if (!m) return null;
    var xy = m[1].split(','); if (xy.length !== 2) return null;
    var a = ex.parse(xy[0].trim()), b = ex.parse(xy[1].trim()); if (!a.ok || !b.ok) return null;
    var p = [ex.value(a.ast), ex.value(b.ast)]; return isFinite(p[0]) && isFinite(p[1]) ? p : null;
  }
  /* one point; diags = [{ is: [x, y], code, hint }] */
  function ptChk(P, diags) {
    var base = K.pairs([P]);
    return function (resp) {
      var q = readPt(resp);
      if (q && samePt(q, P)) return base(resp);
      if (q) {
        for (var i = 0; i < (diags || []).length; i++) if (diags[i] && diags[i].is && !samePt(diags[i].is, P) && samePt(q, diags[i].is)) return wrong(diags[i].code, diags[i].hint);
        if (!near(P[0], P[1]) && samePt(q, [P[1], P[0]])) return wrong('pt-swap', 'Your coordinates are the right numbers in the wrong order: write ' + t('(x,\\ y)') + ' — the ' + t('x') + '-coordinate first.');
        if (near(q[0], P[0]) && !near(q[1], P[1])) return wrong('pt-y', 'The ' + t('x') + '-coordinate is right — check the ' + t('y') + '-coordinate.');
        if (near(q[1], P[1]) && !near(q[0], P[0])) return wrong('pt-x', 'The ' + t('y') + '-coordinate is right — check the ' + t('x') + '-coordinate.');
      }
      return base(resp);
    };
  }
  function midDiags(P, Q) {
    return [{ is: add(P, Q), code: 'mid-sum', hint: 'You added the coordinates — now divide each sum by ' + t('2') + ' (a midpoint is an <b>average</b>).' },
      { is: scl(sub(Q, P), 0.5), code: 'mid-diff', hint: 'Average the coordinates: <b>add</b> them, then halve. (Half the differences tells you how far to step, not where you land.)' },
      { is: scl(sub(P, Q), 0.5), code: 'mid-diff', hint: 'Average the coordinates: <b>add</b> them, then halve.' },
      { is: [-(P[0] + Q[0]) / 2, (P[1] + Q[1]) / 2], code: 'mid-sign', hint: 'Check the sign of the ' + t('x') + '-coordinate: watch the negatives when you add.' },
      { is: [(P[0] + Q[0]) / 2, -(P[1] + Q[1]) / 2], code: 'mid-sign', hint: 'Check the sign of the ' + t('y') + '-coordinate: watch the negatives when you add.' }];
  }
  function midChk(P, Q) { return ptChk(mid(P, Q), midDiags(P, Q)); }
  /* endpoint from a midpoint M and the other endpoint E: 2M − E */
  function endChk(M, E) {
    var T = sub(scl(M, 2), E);
    return ptChk(T, [{ is: mid(M, E), code: 'end-avg', hint: 'You averaged ' + t('M') + ' and the endpoint. ' + t('M') + ' is the average of the <b>two endpoints</b>: solve ' + t('\\frac{' + nT(E[0]) + '+x}{2}=' + nT(M[0])) + ' for ' + t('x') + '.' },
      { is: sub(M, E), code: 'end-diff', hint: 'Going from the endpoint to ' + t('M') + ' is one step; the other endpoint is one <b>more</b> equal step past ' + t('M') + '.' },
      { is: sub(scl(E, 2), M), code: 'end-wrongway', hint: 'You stepped the wrong way: the missing endpoint is on the far side of ' + t('M') + ', not behind the endpoint you know.' }]);
  }
  function sChk(m, diag) { return K.slope(m, diag ? { diag: diag } : {}); }
  function numChk(v, diag) { return K.value(v, { diag: diag }); }
  /* a single word in a text box */
  function wordChk(right, wrongs, label) {
    return function (resp) {
      var s = String(resp == null ? '' : resp).toLowerCase().replace(/\\text\{([^}]*)\}/g, '$1').replace(/[^a-z⊥∥ ]/g, ' ').replace(/\s+/g, ' ').trim();
      if (!s) return form('empty', 'Type the word in the box.');
      if (right.test(s)) return ok();
      for (var i = 0; i < (wrongs || []).length; i++) if (wrongs[i].re.test(s)) return wrong('word', wrongs[i].hint);
      return wrong('word', label || null);
    };
  }
  function letterChk(L, hintFor) {
    return function (resp) {
      var s = String(resp == null ? '' : resp).replace(/\\text\{([^}]*)\}/g, '$1').replace(/\\angle|∠|angle|at|vertex|point|\s/gi, '').toUpperCase();
      if (!s) return form('empty', 'Type the letter.');
      if (!/^[A-Z]$/.test(s)) return form('letter-form', 'Type just one capital letter, e.g. ' + t(L === 'A' ? 'B' : 'A') + '.');
      if (s === L) return ok();
      return wrong('letter', hintFor ? hintFor(s) : null);
    };
  }
  /* exact sum of terms a + b√m … in simplest form: terms = [{ k: [p, q], m }] (m = 1 for the whole-number part) */
  function sumTex(terms) {
    var out = '';
    terms.forEach(function (tm) { if (tm.k[0] === 0) return; var s = K.radTex({ k: tm.k, n: 2, m: tm.m }); out += (out && s.charAt(0) !== '-' ? '+' : '') + s; });
    return out || '0';
  }
  function sumChk(terms) {
    var V = terms.reduce(function (s, tm) { return s + tm.k[0] / tm.k[1] * Math.sqrt(tm.m); }, 0);
    return function (resp) {
      var a = K.read(resp); if (a.res) return a.res;
      if (!near(a.val, V)) {
        if (Math.abs(a.val - V) < 0.06 && ex.shape(a.ast).decimals) return form('decimal', 'That’s a decimal. Give the <b>exact</b> value, with radicals.');
        return wrong('value', null);
      }
      var sh = ex.shape(a.ast); if (sh.decimals && !sh.roots) return form('decimal', 'Right value — but give the <b>exact</b> answer with radicals, not a decimal.');
      var leaves = [];
      (function walk(x, sgn) { if (!x) return; if (x.t === 'paren') return walk(x.a, sgn); if (x.t === 'add') { walk(x.a, sgn); walk(x.b, sgn); return; } if (x.t === 'sub') { walk(x.a, sgn); walk(x.b, -sgn); return; } leaves.push(x); })(a.ast, 1);
      var seen = {};
      for (var i = 0; i < leaves.length; i++) {
        var rr = ex.radical(leaves[i]);
        if (!rr) return form('sum-form', 'Right value — simplify each term to a whole number or a mixed radical like ' + t('5\\sqrt{2}') + '.');
        var key = rr.n === 1 ? 1 : rr.m;
        if (rr.n === 2 && !ex.simplest(rr.m, 2)) return form('sum-form', 'Right value — but ' + t('\\sqrt{' + rr.m + '}') + ' isn’t in simplest form yet. Simplify it, then collect like terms.');
        if (seen[key]) return form('sum-form', 'Right value — now collect like terms: add the whole numbers together and the matching radicals together.');
        seen[key] = 1;
      }
      return ok();
    };
  }

  /* ---------------- input pieces ---------------- */
  var GEO = 'u6l6geo';
  if (HW.widgets && HW.widgets.KEYSETS && !HW.widgets.KEYSETS[GEO]) {
    var dk = function (n) { return { label: String(n), tex: String(n), plain: String(n) }; };
    HW.widgets.KEYSETS[GEO] = [
      [dk(7), dk(8), dk(9), { label: '<sup>a</sup>⁄<sub>b</sub>', tex: '\\frac{#@}{#?}', plain: '/', title: 'Fraction' }, { label: '√', tex: '\\sqrt{#0}', plain: 'sqrt(', title: 'Square root', fn2: 1 }, { label: '⌫', fn: 'del', title: 'Delete' }],
      [dk(4), dk(5), dk(6), { label: '( )', tex: '\\left(#0\\right)', plain: '(', title: 'Brackets — an ordered pair' }, { label: '−', tex: '-', plain: '-' }, { label: 'clear', fn: 'clear' }],
      [dk(1), dk(2), dk(3), { label: ',', tex: ',', plain: ', ' }, { label: '◀', fn: 'left', title: 'Move left' }, { label: '▶', fn: 'right', title: 'Move right (out of a box)' }],
      [dk(0), { label: '.', tex: '.', plain: '.' }, { label: '+', tex: '+', plain: '+' }, { label: 'undefined', tex: '\\text{undefined}', plain: 'undefined', title: 'Slope of a vertical line', wide: true }, { label: 'Check', fn: 'enter' }]];
    if (HW.widgets.KEYHELP) HW.widgets.KEYHELP[GEO] = ['Tap a box first. Use <b><sup>a</sup>⁄<sub>b</sub></b> for a fraction, <b>√</b> for a root, <b>( )</b> and <b>,</b> for a point, and <b>▶</b> to step out of a fraction, root or bracket.',
      'Tap a box first. Type fractions as <code>-2/3</code>, roots as <code>4sqrt(13)</code>, points as <code>(-2, 5)</code>, or <code>undefined</code>.'];
  }
  /* a labelled box: kind 'slope' | 'len' | 'pt' | 'num' | 'dec' | 'text' */
  function fb(label, chk, key, o) {
    o = o || {};
    var f = o.text ? { label: label, name: o.name || label, mode: 'text', placeholder: o.ph || '' } : { label: label, name: o.name || label, mode: 'math', keys: GEO, placeholder: o.ph };
    return { f: f, c: chk, k: key, a: o.ans != null ? o.ans : (o.text ? key : t(key)) };
  }
  function FP(prompt, list, sol, hints, text) {
    var p = B.fields(prompt, list.map(function (x) { return x.f; }), list.map(function (x) { return x.c; }), list.map(function (x) { return x.k; }),
      list.map(function (x) { return x.f.label + ' ' + x.a; }).join('<br>'), sol, hints, text);
    return p;
  }
  function L(s) { return t(s + '='); }
  function slopeBox(nm, P, Q, diag) { var m = slopeOf(P, Q); return fb(L('m_{' + nm + '}'), sChk(m, diag), sT(m), { name: t('m_{' + nm + '}'), ph: 'slope' }); }
  function lenBox(nm, P, Q, den) { den = den || 1; var n = n2(P, Q, den); return fb(L(nm), lenChk(n, den, (Q[0] - P[0]) * den, (Q[1] - P[1]) * den), radT(n, den), { name: t(nm), ph: 'exact' }); }
  function decBox(label, V, dp, o) { o = o || {}; return fb(label, o.chk || lenFix(V, dp), rnd(V, dp == null ? 1 : dp).toFixed(dp == null ? 1 : dp), { name: o.name || label, ph: o.ph || 'decimal', ans: o.ans }); }
  function ptBox(label, P, chk, name) { return fb(label, chk || ptChk(P), ptK(P), { name: name || label, ph: '(x, y)', ans: t(ptT(P)) }); }
  function midBox(nm, P, Q) { return ptBox(t('M_{' + nm + '}='), mid(P, Q), midChk(P, Q), t('M_{' + nm + '}')); }
  function mc(r, prompt, opts, sol, hints, text, keepOrder) {
    var seen = {}; opts.forEach(function (o) { if (seen[o.html]) throw new Error('duplicate MC option ' + o.html); seen[o.html] = 1; });
    return B.mc(r, prompt, opts, sol, hints, text, keepOrder);
  }
  function fig(spec) { return '<div class="fig">' + HW.graph(Object.assign({ grid: 1, labels: 2, max: 330 }, spec)) + '</div>'; }
  function lbl(nm, p) { return { x: p[0], y: p[1], label: nm }; }
  function poly(pts, s, e) { return { v: pts, s: s || 'closed', e: e || 'closed' }; }
  function drawing(pieces, pts) { return { pts: pts || [], pieces: pieces || [], join: 'none' }; }
  function nameList(names, pts) { return names.map(function (n, i) { return t(n + ptT(pts[i])); }).join(', '); }
  var SLOPE_HINT = 'Slope ' + t('m=\\dfrac{y_2-y_1}{x_2-x_1}') + ' — subtract the coordinates in the <b>same order</b> on the top and the bottom.';
  var LEN_HINT = 'Distance: ' + t('d=\\sqrt{(x_2-x_1)^{2}+(y_2-y_1)^{2}}') + '. Simplify the radical.';
  var MID_HINT = 'Midpoint: ' + t('\\left(\\frac{x_1+x_2}{2},\\ \\frac{y_1+y_2}{2}\\right)') + ' — the average of the coordinates.';

  /* ---------------- shared figure builders (Extra Practice) ---------------- */
  var EVEN = [[2, 4], [4, 2], [2, 6], [6, 2], [4, 6], [6, 4], [6, 8], [8, 6], [4, 8], [8, 4]];
  function rightIsoTri(r) {   // EP1: right angle at B, BA = u, BC = rot(u)
    if (book(r)) return { A: [-5, -3], B: [1, 5], C: [9, -1] };
    return rep(r, function () {
      var u = signs(r, r.pick(EVEN)), Bp = [r.int(-6, 6), r.int(-6, 6)], v = r.chance(0.5) ? rot(u) : rotc(u);
      var A = add(Bp, u), C = add(Bp, v);
      return inBox([A, Bp, C], -11, 11) ? { A: A, B: Bp, C: C } : null;
    });
  }
  function rightScaleneTri(r, bk) {   // EP7/EP14: right angle at H, HG = s·p, HJ = k·rot(p)
    if (bk) return { G: [-6, 0], H: [0, 8], J: [4, 5] };
    var PR = [[1, 2], [2, 1], [3, 4], [4, 3], [1, 3], [3, 1], [2, 3], [3, 2], [1, 1]];
    return rep(r, function () {
      var p = signs(r, r.pick(PR)), s = r.int(1, 3), k = r.int(1, 3); if (s === k) return null;
      var H = [r.int(-6, 6), r.int(-6, 8)], G = add(H, scl(p, s)), J = add(H, scl(r.chance(0.5) ? rot(p) : rotc(p), k));
      if (!inBox([G, H, J], -10, 10)) return null;
      if (d2(G, H) > 130 || d2(H, J) > 130) return null;
      return { G: G, H: H, J: J };
    });
  }
  function isoTrap(r, bk) {   // EP6/EP15: PQ horizontal (length 2a), RS parallel (2b), symmetric legs
    if (bk) return { P: [-5, -2], Q: [5, -2], R: [3, 4], S: [-3, 4] };
    return rep(r, function () {
      var a = r.int(2, 6), b = r.int(1, 5), h = r.pick([2, 4, 6, 8]) * r.pick([1, -1]); if (a === b || (a - b) % 2) return null;
      var c = r.int(-3, 3), y0 = r.int(-4, 2), P = [c - a, y0], Q = [c + a, y0], R = [c + b, y0 + h], S = [c - b, y0 + h];
      return inBox([P, Q, R, S], -8, 8) ? { P: P, Q: Q, R: R, S: S } : null;
    });
  }

  /* ===================== assignment makers ===================== */
  var FR_POS = [[3, 2], [2, 3], [4, 3], [3, 4], [5, 2], [2, 5], [5, 3], [3, 5], [5, 4], [4, 5], [1, 2], [1, 3]];
  function q1(r) {
    var segs, opts, bk = book(r);
    if (bk) { segs = [[[-3, -1], [1, 5]], [[-5, 3], [3, -3]], [[2, 4], [5, -4]]]; opts = [[-8, 3], [3, 2], [-3, 4], [4, 3], [-3, 2], [3, 8]]; }
    else {
      var gen = rep(r, function () {
        var a = r.pick(FR_POS), c = r.pick(FR_POS.filter(function (f) { return f[0] < f[1]; })), e = r.pick([[5, 2], [8, 3], [7, 2], [7, 3], [5, 3], [3, 1].slice(0, 2)].filter(function (f) { return f[0] > f[1]; }));
        var S = [a, [-c[0], c[1]], [-e[0], e[1]]], O = S.concat([[-a[0], a[1]], [c[1], c[0]], [e[1], e[0]]]);
        var vals = O.map(mval); if (vals.some(function (v, i) { return vals.indexOf(v) !== i || vals.some(function (w, j) { return j !== i && near(v, w); }); })) return null;
        var sg = [], used = [];
        for (var i = 0; i < 3; i++) {
          var m = S[i], k = Math.max(Math.abs(m[0]), m[1]) <= 4 && r.chance(0.5) ? 2 : 1, run = m[1] * k, rise = m[0] * k;
          if (Math.abs(rise) > 9 || run > 9) return null;
          var x0 = r.int(-6, 6 - run), y0 = rise > 0 ? r.int(-6, 6 - rise) : r.int(-6 - rise, 6), P0 = [x0, y0], P1 = [x0 + run, y0 + rise];
          sg.push([P0, P1]); used.push(P0, P1);
        }
        if (!distinctPts(used)) return null;
        return { segs: sg, opts: O };
      });
      segs = gen.segs; opts = r.shuffle(gen.opts);
    }
    var names = [['A', 'B'], ['C', 'D'], ['E', 'F']], right = segs.map(function (s) { return slopeOf(s[0], s[1]); });
    var cols = opts.map(function (o, i) { return { id: 'o' + (i + 1), html: '<span class="nowrap">' + (i + 1) + ': ' + t(dfr(frT(o[0], o[1]))) + '</span>', m: nrm(o[0], o[1]) }; });
    var want = {}, rows = [];
    segs.forEach(function (s, i) { var id = names[i].join(''); rows.push({ id: id, html: t(id) }); want[id] = cols.filter(function (c) { return sameSlope(c.m, right[i]); })[0].id; });
    var pts = []; segs.forEach(function (s, i) { pts.push(lbl(names[i][0], s[0]), lbl(names[i][1], s[1])); });
    var g = fig({ x: [-6, 6], y: [-6, 6], segs: segs.map(function (s) { return { pts: s, start: 'none', end: 'none' }; }), points: pts });
    var p = B.grid(g + 'Match each segment with its slope (each slope may be used once, more than once, or not at all).', rows, cols.map(function (c) { return { id: c.id, html: c.html }; }), want, {
      why: function (rid, got) {
        var i = ['AB', 'CD', 'EF'].indexOf(rid), m = right[i], gc = cols.filter(function (c) { return c.id === got; })[0]; if (!gc) return null;
        if (sameSlope(gc.m, [-m[0], m[1]])) return { code: 'slope-sign', hint: t(rid) + ': check the sign — does the segment rise or fall from left to right?' };
        if (sameSlope(gc.m, [m[1], m[0]]) || sameSlope(gc.m, [-m[1], -m[0]])) return { code: 'slope-flip', hint: t(rid) + ': slope is rise over run — you have run over rise.' };
        if (sameSlope(gc.m, [-m[1], m[0]])) return { code: 'slope-perp', hint: t(rid) + ': that is the negative reciprocal (a perpendicular slope). Count the rise and the run again.' };
        return { code: 'row', hint: t(rid) + ': read its endpoints off the grid and use rise over run.' };
      } }, segs.map(function (s, i) { return t(slW(s[0], s[1], names[i].join(''))); }).join('<br>'),
      ['Read each endpoint off the grid, then count the rise (up is +, down is −) and the run (left to right).', SLOPE_HINT], 'match segments to slopes');
    p.outcome = 'RF3';
    return p;
  }
  function q2(r) {
    var A, Bp, P, Q, bk = book(r);
    if (bk) { A = [-3, 6]; Bp = [3, -9]; P = [8, 2]; Q = [-4, -6]; }
    else rep(r, function () {
      var sc = r.pick(['A', 'B', 'C']), f1 = r.pick(FR_POS), f2 = r.pick(FR_POS);
      var m1 = sc === 'B' ? [-f1[0], f1[1]] : f1, m2 = sc === 'A' ? [-f2[0], f2[1]] : sc === 'C' ? m1.slice() : f2;
      if (sc !== 'C' && (isPerp(m1, m2) || sameSlope(m1, m2))) return null;
      var k1 = r.int(1, 3), k2 = r.int(1, 3); if (m1[1] * k1 > 12 || m2[1] * k2 > 12) return null;
      A = [r.int(-8, 0), r.int(-8, 8)]; Bp = [A[0] + m1[1] * k1, A[1] + m1[0] * k1];
      P = [r.int(1, 9), r.int(-8, 8)]; Q = [P[0] - m2[1] * k2, P[1] - m2[0] * k2];   // PQ listed right to left
      return inBox([A, Bp, P, Q], -10, 10) && !(sc === 'C' && sameSlope(slopeOf(A, P), m1)) ? true : null;
    });
    var m1 = slopeOf(A, Bp), m2 = slopeOf(P, Q), s1 = mval(m1) > 0, s2 = mval(m2) > 0, para = sameSlope(m1, m2), perp = isPerp(m1, m2);
    var opts = [
      { html: 'The slope of ' + t('AB') + ' is positive and the slope of ' + t('PQ') + ' is negative.', right: s1 && !s2, why: 'Find each slope: ' + t('AB') + ' ' + (s1 ? 'rises' : 'falls') + ' and ' + t('PQ') + ' ' + (s2 ? 'rises' : 'falls') + '. With ' + t('PQ') + ', both differences are negative when you go from ' + t('P') + ' to ' + t('Q') + '.' },
      { html: 'The slope of ' + t('AB') + ' is negative and the slope of ' + t('PQ') + ' is positive.', right: !s1 && s2, why: 'Compute both slopes carefully: ' + t('m_{AB}=' + sT(m1)) + '. Now ' + t('m_{PQ}') + ' — subtract in the same order top and bottom.' },
      { html: t('AB') + ' is parallel to ' + t('PQ') + '.', right: para, why: 'Parallel segments have <b>equal</b> slopes. Compare ' + t('m_{AB}') + ' and ' + t('m_{PQ}') + '.' },
      { html: t('AB') + ' is perpendicular to ' + t('PQ') + '.', right: false, why: 'Perpendicular slopes multiply to ' + t('-1') + '. Here ' + t('m_{AB}\\times m_{PQ}=' + frT(m1[0] * m2[0], m1[1] * m2[1])) + '.' }];
    if (perp) throw new Error('q2 perp');
    return mc(r, 'Line segment ' + t('AB') + ' joins ' + t('A' + ptT(A)) + ' and ' + t('B' + ptT(Bp)) + '; line segment ' + t('PQ') + ' joins ' + t('P' + ptT(P)) + ' and ' + t('Q' + ptT(Q)) + '. Which statement is correct?', opts,
      t(slW(A, Bp, 'AB')) + '<br>' + t(slW(P, Q, 'PQ')) + '<br>' + (para ? 'The slopes are equal, so the segments are parallel.' : 'One slope is ' + (s1 ? 'positive' : 'negative') + ' and the other ' + (s2 ? 'positive' : 'negative') + '; they are not equal, and their product ' + t(frT(m1[0] * m2[0], m1[1] * m2[1])) + ' is not ' + t('-1') + '.'),
      [SLOPE_HINT], 'slopes of AB and PQ compared');
  }
  function q3(r) {
    var Kp, Lp, bk = book(r);
    if (bk) { Kp = [6, 9]; Lp = [-2, -5]; }
    else rep(r, function () {
      var f = r.pick(FR_POS.filter(function (x) { return x[0] !== 1; })), m = r.chance(0.5) ? f : [-f[0], f[1]], k = r.int(1, 2);
      Kp = [r.int(-2, 8), r.int(-4, 10)]; Lp = [Kp[0] - m[1] * k, Kp[1] - m[0] * k];
      return inBox([Kp, Lp], -10, 10) ? true : null;
    });
    var m = slopeOf(Kp, Lp), pp = perpOf(m), p = Math.abs(m[0]), q = m[1], sg = m[0] < 0 ? -1 : 1;
    var opts = [{ html: t(dfr(frT(pp[0], pp[1]))), right: true },
      { html: t(dfr(frT(-pp[0], pp[1]))), why: 'Right numbers — but a perpendicular slope also has the <b>opposite sign</b>.' },
      { html: t(dfr(frT(m[0], m[1]))), why: 'That is the slope of ' + t('KL') + ' itself (a parallel line). Flip it and change its sign.' },
      { html: t(dfr(frT(-m[0], m[1]))), why: 'You changed the sign but didn’t take the <b>reciprocal</b> (flip the fraction).' }];
    return mc(r, t('K') + ' and ' + t('L') + ' are the points ' + t(ptT(Kp)) + ' and ' + t(ptT(Lp)) + ' respectively. The slope of a line perpendicular to ' + t('KL') + ' is', opts,
      t(slW(Kp, Lp, 'KL')) + '. The perpendicular slope is the negative reciprocal: ' + t(dfr(frT(pp[0], pp[1]))) + '.', ['Find ' + t('m_{KL}') + ' first. A perpendicular slope is its negative reciprocal.'], 'perpendicular slope to KL');
  }
  function quadTruth(P, Q, R, S) {
    var mPQ = slopeOf(P, Q), mSR = slopeOf(S, R), mQR = slopeOf(Q, R), mPS = slopeOf(P, S);
    return { I: sameSlope(mPQ, mSR), II: isPerp(mQR, mSR), III: sameSlope(mQR, mPS), mPQ: mPQ, mSR: mSR, mQR: mQR, mPS: mPS };
  }
  var SMALL = [[1, 3], [3, 1], [1, 2], [2, 1], [2, 3], [3, 2], [1, 4], [4, 1]];
  function q4(r) {
    var P, Q, R, S, bk = book(r);
    if (bk) { P = [-6, -9]; Q = [-4, -3]; R = [5, -6]; S = [3, -12]; }
    else rep(r, function () {
      var v4 = r.pick(['A', 'B', 'C', 'D']), u = signs(r, r.pick(SMALL)), lam = r.int(1, 3), v = scl(r.chance(0.5) ? rot(u) : rotc(u), r.int(1, 3));
      if (v4 === 'B') { v = signs(r, r.pick(SMALL)); if (dot(u, v) === 0 || sameSlope(slopeOf([0, 0], u), slopeOf([0, 0], v))) return null; }
      var S0 = [r.int(-10, 4), r.int(-10, 4)], R0 = add(S0, scl(u, lam)), Q0 = add(R0, v), P0;
      if (v4 === 'A') { var ka = r.pick([2, 3]); P0 = add(S0, scl(v, ka)); }
      else if (v4 === 'C') { var mu = r.int(1, lam + 2); if (mu === lam) return null; P0 = sub(Q0, scl(u, mu)); }
      else P0 = add(S0, v);
      if (!inBox([P0, Q0, R0, S0], -12, 12) || !distinctPts([P0, Q0, R0, S0])) return null;
      var tr = quadTruth(P0, Q0, R0, S0), f = [tr.I, tr.II, tr.III].filter(function (x) { return !x; }).length;
      if (f > 1) return null;
      P = P0; Q = Q0; R = R0; S = S0; return true;
    });
    var tr = quadTruth(P, Q, R, S), none = tr.I && tr.II && tr.III;
    var line = function (nm, m) { return t('m_{' + nm + '}=' + sT(m)); };
    var opts = [{ html: 'Statement I is false.', right: !tr.I, why: 'Check I: ' + line('PQ', tr.mPQ) + ' and ' + line('SR', tr.mSR) + '. Are they equal?' },
      { html: 'Statement II is false.', right: !tr.II, why: 'Check II: is ' + t('m_{QR}\\times m_{SR}=-1') + '? Work out both slopes.' },
      { html: 'Statement III is false.', right: !tr.III, why: 'Check III: compare ' + t('m_{QR}') + ' and ' + t('m_{PS}') + ' carefully.' },
      { html: 'None of the statements is false.', right: none, why: 'One of the three fails — test each statement with slopes.' }];
    var sol = t(slW(P, Q, 'PQ')) + ', ' + t(slW(S, R, 'SR')) + ': I is ' + (tr.I ? 'true' : '<b>false</b>') + '.<br>' + t(slW(Q, R, 'QR')) + '; ' + t('m_{QR}\\times m_{SR}') + (tr.II ? t('=-1') + ': II is true.' : t('\\neq -1') + ': II is <b>false</b>.') + '<br>' + t(slW(P, S, 'PS')) + ': III is ' + (tr.III ? 'true' : '<b>false</b>') + '.';
    return mc(r, 'Quadrilateral ' + t('PQRS') + ' has vertices ' + nameList(['P', 'Q', 'R', 'S'], [P, Q, R, S]) + '. Consider the statements<br>I. ' + t('PQ') + ' is parallel to ' + t('SR') + '.<br>II. ' + t('QR') + ' is perpendicular to ' + t('SR') + '.<br>III. ' + t('QR') + ' is parallel to ' + t('PS') + '.<br>Which of the following is correct?', opts, sol,
      ['Find the four slopes ' + t('m_{PQ}, m_{SR}, m_{QR}, m_{PS}') + ' first, then test each statement.', 'Parallel: equal slopes. Perpendicular: slopes multiply to ' + t('-1') + '.'], 'which statement about PQRS is false', true);
  }
  function q5(r) {
    var C = book(r) ? [25, 4] : r.pick([[25, 4], [40, 5], [32, 4], [20, 4], [50, 8], [24, 3], [48, 6], [40, 6], [40, 4]]);
    var T = C[0], Dk = C[1], s = Dk / T, inv = T / Dk;
    var f = function (x) { return String(rnd(x, 3)).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, ''); };
    var opts = [{ html: t(f(s) + '\\ \\text{km/min}'), right: true },
      { html: t((near(inv, rnd(inv, 2)) ? '' : '\\approx ') + f(rnd(inv, 2)) + '\\ \\text{km/min}'), why: 'That is run over rise: ' + t(T + '\\div ' + Dk) + '. Slope is rise (distance) over run (time).' },
      { html: t(Dk + '\\ \\text{km/min}'), why: 'That is just the distance at one point. The slope compares the change in distance with the change in time.' },
      { html: t(f(s) + '\\ \\text{min/km}'), why: 'Right number, but the units are upside down: the rise is in km and the run in min, so the slope is in <b>km/min</b>.' }];
    return mc(r, 'A jogger’s distance–time graph is a straight line through ' + t('(0,\\ 0)') + ' and ' + t('(' + T + ',\\ ' + Dk + ')') + ', where time is in minutes and distance is in kilometres. The slope of the graph is', opts,
      t('\\text{slope}=\\dfrac{' + Dk + '\\text{ km}}{' + T + '\\text{ min}}=' + f(s) + '\\ \\text{km/min}') + ' — the jogger’s speed.', ['Slope = rise ÷ run = change in distance ÷ change in time. The units come from the axes: km over min.'], 'jogger slope with units');
  }
  function q6(r) {
    var n = book(r) ? 3 : r.pick([3, 4, 5]), k = book(r) ? 4 : r.pick([3, 4, 5]);
    var opts = [{ html: t('m=-' + n), right: true },
      { html: t('m=\\dfrac{' + (2 * n - 1) + '}{2}'), why: t('\\frac{' + (2 * n - 1) + '}{2}=' + (n - 0.5)) + '. Compare the <b>sizes</b> of the slopes, ignoring the signs.' },
      { html: t('m=' + (n - 0.1).toFixed(1)), why: t((n - 0.1).toFixed(1)) + ' is the largest <b>number</b>, but steepness is the size of the slope, ' + t('|m|') + ' — a negative slope can be steeper.' },
      { html: t('m=-\\dfrac{1}{' + k + '}'), why: 'A slope close to ' + t('0') + ' is almost flat. Steepness is ' + t('|m|') + '.' }];
    return mc(r, 'Which slope gives the steepest line?', opts, 'Steepness is ' + t('|m|') + ': ' + t('|-' + n + '|=' + n) + ', ' + t('\\left|\\tfrac{' + (2 * n - 1) + '}{2}\\right|=' + (n - 0.5)) + ', ' + t('|' + (n - 0.1).toFixed(1) + '|=' + (n - 0.1).toFixed(1)) + ', ' + t('\\left|-\\tfrac{1}{' + k + '}\\right|=\\tfrac{1}{' + k + '}') + '. The largest is ' + t(n) + ', so ' + t('m=-' + n) + ' is the steepest.',
      ['Ignore the signs: the bigger ' + t('|m|') + ', the steeper the line.'], 'steepest slope');
  }
  function q7(r) {
    var xs, m, b0, bk = book(r);
    if (bk) { xs = [1, 3, 4, 7]; m = 2; b0 = 0; }
    else { var g = rep(r, function () { var gg = r.shuffle([1, 2, 3, 4]).slice(0, 3); return gg[0] >= 2 ? gg : null; }); var x0 = r.int(-3, 2); xs = [x0, x0 + g[0], x0 + g[0] + g[1], x0 + g[0] + g[1] + g[2]]; m = r.pick([2, 3, -2, -3]); b0 = r.int(-5, 6); }
    var ys = xs.map(function (x) { return m * x + b0; }), dys = [ys[1] - ys[0], ys[2] - ys[1], ys[3] - ys[2]], dxs = [xs[1] - xs[0], xs[2] - xs[1], xs[3] - xs[2]];
    var opts = [{ html: 'Not linear, because the ' + t('x') + '-values do not go up in equal steps.', why: 'Unequal ' + t('x') + '-steps don’t rule out a line: divide each change in ' + t('y') + ' by its change in ' + t('x') + '.' },
      { html: 'Not linear, because the changes in ' + t('y') + ' are ' + t(dys.join(',\\ ')) + '.', why: 'The changes in ' + t('y') + ' differ only because the ' + t('x') + '-steps differ. Compare ' + t('\\frac{\\Delta y}{\\Delta x}') + ' instead.' },
      { html: 'Linear, with slope ' + t(dys[0]) + '.', why: t(dys[0]) + ' is the change in ' + t('y') + ' for an ' + t('x') + '-step of ' + t(dxs[0]) + ', not of ' + t('1') + '. Slope = ' + t('\\frac{\\Delta y}{\\Delta x}') + '.' },
      { html: 'Linear, with slope ' + t(m) + '.', right: true }];
    var tab = HW.valueTable([['x'].concat(xs), ['y'].concat(ys)]);
    return mc(r, 'Which statement describes the relation in this table?' + tab, opts,
      'The ' + t('x') + '-steps are unequal, so divide: ' + dys.map(function (d, i) { return t('\\frac{' + d + '}{' + dxs[i] + '}=' + m); }).join(', ') + '. The rate is constant, so the relation is linear with slope ' + t(m) + '.',
      ['Work out ' + t('\\frac{\\text{change in }y}{\\text{change in }x}') + ' for each pair of columns.'], 'linear table, unequal steps');
  }
  function q8(r) {
    var bk = book(r), opts;
    if (bk) opts = [{ html: 'The line through ' + t('(0,\\ 3)') + ' and ' + t('(3,\\ 0)') + '.', why: 'That line crosses both axes, at ' + t('(0,\\ 3)') + ' and ' + t('(3,\\ 0)') + ': two intercepts.' },
      { html: 'The line through ' + t('(-2,\\ -4)') + ' and ' + t('(1,\\ 2)') + '.', right: true },
      { html: 'The ' + t('x') + '-axis.', why: 'Every point of the ' + t('x') + '-axis is an ' + t('x') + '-intercept — infinitely many.' },
      { html: 'The line through ' + t('(2,\\ 1)') + ' and ' + t('(4,\\ 5)') + '.', why: 'Slope ' + t('2') + '; stepping back from ' + t('(2,\\ 1)') + ' it crosses the ' + t('y') + '-axis at ' + t('-3') + ' and the ' + t('x') + '-axis at ' + t('1.5') + ': two intercepts.' }];
    else {
      var kind = r.pick(['origin', 'origin', 'horiz', 'vert']), right;
      if (kind === 'origin') { var k = r.pick([2, 3, -2, -3]), t1 = -r.int(1, 3), t2 = r.int(1, 3); right = { html: 'The line through ' + t(ptT([t1, k * t1])) + ' and ' + t(ptT([t2, k * t2])) + '.', right: true }; }
      else if (kind === 'horiz') { var c = r.pick([-4, -3, -2, 2, 3, 4, 5]), xa = r.int(-5, -1), xb = r.int(1, 6); right = { html: 'The line through ' + t(ptT([xa, c])) + ' and ' + t(ptT([xb, c])) + '.', right: true }; }
      else { var cx = r.pick([-4, -3, -2, 2, 3, 4, 5]), ya = r.int(-5, -1), yb = r.int(1, 6); right = { html: 'The line through ' + t(ptT([cx, ya])) + ' and ' + t(ptT([cx, yb])) + '.', right: true }; }
      var a = r.pick([2, 3, 4, 5, -3]), bb = r.pick([2, 3, 4, -4, 6]);
      var axis = r.pick([{ html: 'The ' + t('x') + '-axis.', why: 'Every point of the ' + t('x') + '-axis is an ' + t('x') + '-intercept — infinitely many.' }, { html: 'The ' + t('y') + '-axis.', why: 'Every point of the ' + t('y') + '-axis is a ' + t('y') + '-intercept — infinitely many.' },
        { html: 'The line through ' + t('(-3,\\ 0)') + ' and ' + t('(4,\\ 0)') + '.', why: 'Both points are on the ' + t('x') + '-axis, so this line <b>is</b> the ' + t('x') + '-axis: infinitely many intercepts.' }]);
      var d = rep(r, function () { var s = r.pick([1, 2, 3, -1, -2]), x1 = r.int(1, 4), y1 = r.int(1, 5), b2 = y1 - s * x1; if (b2 === 0 || s === 0) return null; return { s: s, p1: [x1, y1], p2: [x1 + r.int(1, 2), y1 + s * (r.int(1, 2))], b: b2 }; });
      d.p2 = [d.p1[0] + 2, d.p1[1] + 2 * d.s];
      opts = [right, { html: 'The line through ' + t(ptT([0, a])) + ' and ' + t(ptT([bb, 0])) + '.', why: 'That line crosses both axes, at ' + t(ptT([0, a])) + ' and ' + t(ptT([bb, 0])) + ': two intercepts.' }, axis,
        { html: 'The line through ' + t(ptT(d.p1)) + ' and ' + t(ptT(d.p2)) + '.', why: 'Its slope is ' + t(d.s) + '. Step along it to the axes: it crosses the ' + t('y') + '-axis at ' + t(d.b) + ' and the ' + t('x') + '-axis at ' + t(nT(-d.b / d.s)) + ' — two intercepts.' }];
    }
    var rt = opts.filter(function (o) { return o.right; })[0];
    return mc(r, 'Which line has exactly one intercept?', opts, 'A line has one intercept when it is horizontal (only a ' + t('y') + '-intercept), vertical (only an ' + t('x') + '-intercept) or passes through the origin (both intercepts are the same point). ' + rt.html + ' is that line; each of the others has two intercepts or infinitely many.',
      ['A slanted line not through the origin crosses both axes. Which line is horizontal, vertical, or goes through ' + t('(0,\\ 0)') + '?'], 'line with one intercept');
  }
  function q9(r) {
    var bk = book(r), a = bk ? -3 : r.pick([-5, -4, -3, -2, 2, 3, 4, 5]), b = bk ? 4 : r.pick([-5, -4, -3, -2, 2, 3, 4, 5]), vert = bk ? true : r.chance(0.6);
    var RX = '\\{x\\mid x\\in\\mathbb{R}\\}', RY = '\\{y\\mid y\\in\\mathbb{R}\\}';
    var opts = [{ html: 'domain ' + t(RX) + ', range ' + t('\\{' + b + '\\}'), right: !vert, why: 'That describes the <b>horizontal</b> line through the point. A vertical line has one ' + t('x') + '-value.' },
      { html: 'domain ' + t('\\{' + a + '\\}') + ', range ' + t('\\{' + b + '\\}'), why: 'That is a single point. A line keeps going forever.' },
      { html: 'domain ' + t('\\{' + a + '\\}') + ', range ' + t(RY), right: vert, why: 'That is the <b>vertical</b> line through the point. A horizontal line has one ' + t('y') + '-value.' },
      { html: 'domain ' + t(RX) + ', range ' + t(RY), why: 'That fits a slanted line. A ' + (vert ? 'vertical' : 'horizontal') + ' line has only one ' + (vert ? t('x') : t('y')) + '-value.' }];
    return mc(r, 'The domain and range of the <b>' + (vert ? 'vertical' : 'horizontal') + '</b> line through ' + t(ptT([a, b])) + ' are', opts,
      vert ? 'Every point of the vertical line has ' + t('x=' + a) + ', and the line runs up and down forever: domain ' + t('\\{' + a + '\\}') + ', range ' + t(RY) + '.' : 'Every point of the horizontal line has ' + t('y=' + b) + ', and the line runs left and right forever: domain ' + t(RX) + ', range ' + t('\\{' + b + '\\}') + '.',
      ['Picture the line: which coordinate never changes, and which takes every value?'], (vert ? 'vertical' : 'horizontal') + ' line domain and range', true);
  }
  function q10(r) {
    var p, q, j, bk = book(r);
    if (bk) { p = 3; q = 4; j = 5; } else { var f = r.pick([[3, 4], [2, 5], [4, 3], [5, 2], [3, 5], [2, 3], [5, 3], [3, 2], [4, 5], [5, 4]]); p = f[0]; q = f[1]; j = r.int(2, 7); }
    var N = q * j, T = p * j, alt = q * N / p;
    var sol = 'Perpendicular slopes multiply to ' + t('-1') + ': ' + t('\\left(-\\dfrac{' + p + '}{' + q + '}\\right)\\left(\\dfrac{' + N + '}{t}\\right)=-1') + ', so ' + t('\\dfrac{' + (p * N) + '}{' + q + 't}=1') + ', ' + t(q + 't=' + (p * N)) + ' and ' + t('t=' + T) + '. (Check: ' + t('\\frac{' + N + '}{' + T + '}=' + dfr(frT(N, T))) + ', the negative reciprocal of ' + t('-\\frac{' + p + '}{' + q + '}') + '.)';
    var p0 = B.nr('Two lines have slopes of ' + t('-\\dfrac{' + p + '}{' + q + '}') + ' and ' + t('\\dfrac{' + N + '}{t}') + ' respectively. If the lines are perpendicular, the value of ' + t('t') + ' must be ________.', T, function (v) {
      if (Number.isInteger(alt) && v === alt) return { code: 'perp-noflip', hint: 'With ' + t('t=' + alt) + ' the second slope is ' + t('\\frac{' + p + '}{' + q + '}') + ' — that only changes the sign. A perpendicular slope is the negative <b>reciprocal</b>: ' + t('\\frac{' + q + '}{' + p + '}') + '.' };
      if (v === N) return { code: 'value', hint: 'Set the product of the slopes equal to ' + t('-1') + ' and solve for ' + t('t') + '.' };
      return null;
    }, sol, ['The perpendicular slope is the negative reciprocal of ' + t('-\\frac{' + p + '}{' + q + '}') + ', which is ' + t('\\frac{' + q + '}{' + p + '}') + '. Solve ' + t('\\frac{' + N + '}{t}=\\frac{' + q + '}{' + p + '}') + '.'], 'perpendicular: find t');
    return p0;
  }
  function q11(r) {
    var Kx, Lp, M, N, bk = book(r);
    if (bk) { Kx = -3; Lp = [-5, 4]; M = [6, 2]; N = [1, 5]; }
    else rep(r, function () {
      var f = r.pick([[3, 5], [2, 5], [4, 5], [1, 4], [3, 4], [1, 5]]), m = r.chance(0.6) ? [-f[0], f[1]] : f;
      M = [r.int(1, 8), r.int(-3, 5)]; N = [M[0] - m[1], M[1] - m[0]];
      Kx = r.int(-6, 2); var d = r.pick([-3, -2, -1, 1, 2, 3]); Lp = [Kx + d, r.int(1, 7)];
      var y = Lp[1] - mval(m) * d;
      return y > 0 && y < 10 && !Number.isInteger(rnd(y, 6)) && inBox([M, N, Lp], -9, 9) ? true : null;
    });
    var m = slopeOf(M, N), d = Lp[0] - Kx, y = Lp[1] - mval(m) * d, pp = perpOf(m);
    var ySign = Lp[1] + mval(m) * d, yPerp = Lp[1] - mval(pp) * d;
    var p0 = B.approx('The segment joining ' + t('K(' + Kx + ',\\ y)') + ' and ' + t('L' + ptT(Lp)) + ' is parallel to the segment joining ' + t('M' + ptT(M)) + ' and ' + t('N' + ptT(N)) + '. The value of ' + t('y') + ', to the nearest hundredth, is ________.', y, 2, { nr: true, diag: function (v) {
      if (ySign > 0 && near(v, rnd(ySign, 2))) return { code: 'k-sign', hint: 'Check your subtraction order: in ' + t('\\frac{y_L-y}{x_L-x_K}') + ' both differences go <b>from K to L</b> (or both from L to K).' };
      if (yPerp > 0 && near(v, rnd(yPerp, 2))) return { code: 'par-used', hint: 'Parallel segments have <b>equal</b> slopes — you used the perpendicular slope.' };
      return null;
    } }, 'Parallel segments have equal slopes. ' + t(slW(M, N, 'MN')) + '.<br>' + t('m_{KL}=\\dfrac{' + Lp[1] + '-y}{' + Lp[0] + '-' + par(Kx) + '}=\\dfrac{' + Lp[1] + '-y}{' + d + '}') + '.<br>' + t('\\dfrac{' + Lp[1] + '-y}{' + d + '}=' + dfr(sT(m))) + ' ⟹ ' + t(Lp[1] + '-y=' + nT(mval(m) * d)) + ' ⟹ ' + t('y=' + nT(y) + '=' + rnd(y, 2).toFixed(2)) + '.',
      ['Set ' + t('m_{KL}=m_{MN}') + ' and solve for ' + t('y') + '.'], 'parallel: find y');
    return p0;
  }
  function q12(r) {
    var A, Bp, cx, bk = book(r);
    if (bk) { A = [-3, -7]; Bp = [1, -1]; cx = 9; }
    else rep(r, function () {
      var f = r.pick([[3, 2], [2, 3], [5, 2], [4, 3], [3, 4], [5, 3], [1, 2]]), k = r.int(1, 2);
      A = [r.int(-6, 0), r.int(-9, -2)]; Bp = [A[0] + f[1] * k, A[1] + f[0] * k]; cx = Bp[0] + f[1] * r.int(1, 4) * (r.chance(0.5) ? 1 : 1);
      var kk = Bp[1] + mval(f) * (cx - Bp[0]);
      return Number.isInteger(kk) && kk > 0 && kk < 100 && cx < 20 ? true : null;
    });
    var m = slopeOf(A, Bp), k = Bp[1] + mval(m) * (cx - Bp[0]);
    var kSign = Bp[1] - mval(m) * (cx - Bp[0]), kFlip = Bp[1] + (m[1] / m[0]) * (cx - Bp[0]);
    return B.nr('The points ' + t('A' + ptT(A)) + ', ' + t('B' + ptT(Bp)) + ' and ' + t('C(' + cx + ',\\ k)') + ' are collinear. The value of ' + t('k') + ' is ________.', k, function (v) {
      if (near(v, kSign)) return { code: 'k-sign', hint: 'Check the sign when you solve: ' + t('k-' + par(Bp[1])) + ' means ' + t('k' + (Bp[1] < 0 ? '+' + (-Bp[1]) : '-' + Bp[1])) + '.' };
      if (near(v, kFlip)) return { code: 'k-flip', hint: 'Slope is rise over run: ' + t('\\frac{k-' + par(Bp[1]) + '}{' + cx + '-' + par(Bp[0]) + '}') + ' must equal ' + t(sT(m)) + '.' };
      return null;
    }, 'Collinear points give equal slopes. ' + t(slW(A, Bp, 'AB')) + '.<br>' + t('\\dfrac{k-' + par(Bp[1]) + '}{' + cx + '-' + par(Bp[0]) + '}=' + dfr(sT(m))) + ' ⟹ ' + t('k-' + par(Bp[1]) + '=' + nT(mval(m) * (cx - Bp[0]))) + ' ⟹ ' + t('k=' + k) + '.',
      ['Find ' + t('m_{AB}') + ', then set ' + t('m_{BC}=m_{AB}') + '.'], 'collinear: find k');
  }
  function q13(r) {
    var b0, s, dd, bk = book(r);
    if (bk) { b0 = 20; s = 4; dd = -6; }
    else rep(r, function () { b0 = r.int(10, 40); s = r.pick([2, 3, 4, 5]); dd = -r.int(3, 9); var xi = -b0 * s / dd; return !Number.isInteger(rnd(xi, 6)) && xi < 99 && gcd(s, dd) < Math.abs(dd) && Math.abs(xi * 10 - Math.round(xi * 10)) > 0.02 ? true : null; });
    var m = dd / s, xi = -b0 / m;
    var tab = HW.valueTable([['x', 0, s, 2 * s], ['y', b0, b0 + dd, b0 + 2 * dd]]);
    return B.approx('The table represents a linear relation.' + tab + 'To the nearest tenth, the ' + t('x') + '-intercept of its graph is ________.', xi, 1, { nr: true, diag: function (v) {
      if (near(v, b0)) return { code: 'nr-yint', hint: t(b0) + ' is the ' + t('y') + '-intercept (where ' + t('x=0') + '). The ' + t('x') + '-intercept is where ' + t('y=0') + '.' };
      if (near(v, rnd(b0 / Math.abs(dd), 1))) return { code: 'nr-step', hint: t('y') + ' drops ' + t(-dd) + ' for every <b>' + t(s) + '</b> units of ' + t('x') + ', not every 1 unit. Find the slope first.' };
      if (near(v, rnd(Math.abs(m), 1))) return { code: 'nr-slope', hint: 'That is the size of the slope. Use it to find how far ' + t('x') + ' must go for ' + t('y') + ' to reach ' + t('0') + '.' };
      return null;
    } }, t('y') + ' changes by ' + t(dd) + ' for every ' + t(s) + ' in ' + t('x') + ': slope ' + t('\\frac{' + dd + '}{' + s + '}=' + nT(m)) + '. Starting at ' + t('(0,\\ ' + b0 + ')') + ', ' + t('y') + ' reaches ' + t('0') + ' after ' + t(b0 + '\\div ' + nT(-m) + '\\approx ' + rnd(xi, 3)) + ' units of ' + t('x') + '.<br>' + t('x') + '-intercept ' + t('\\approx ' + rnd(xi, 1).toFixed(1)) + '.',
      ['Find the slope from the table, then ask: how far must ' + t('x') + ' go for ' + t('y') + ' to fall from ' + t(b0) + ' to ' + t('0') + '?'], 'x-intercept from a table');
  }
  /* Written Response: four points, three collinear */
  function wrShared(r) {
    if (book(r)) return { pts: [[-8, 10], [1, 1], [4, 3], [10, -8]], odd: 2, E: [19, -17] };
    return rep(r, function () {
      var f = r.pick([[1, 1], [1, 2], [2, 1], [2, 3], [3, 2], [1, 3]]), sg = r.pick([1, -1]), dir = [f[1], sg * f[0]];
      var A = [r.int(-9, -5), r.int(-6, 6)], ts = r.shuffle([1, 2, 3, 4, 5, 6]).slice(0, 3).sort(function (a, b) { return a - b; });
      if (ts[2] * f[1] > 16) return null;
      var oddIdx = r.int(0, 2), pts = [A], odd = null;
      ts.forEach(function (tt, i) { var P = add(A, scl(dir, tt)); if (i === oddIdx) { P = add(P, [0, r.pick([-3, -2, 2, 3])]); } pts.push(P); });
      var tE = ts[2] + r.int(1, 3), E = add(A, scl(dir, tE));
      if (!inBox(pts, -10, 12) || Math.abs(E[1]) > 25 || Math.abs(E[0]) > 25) return null;
      if (!distinctPts(pts)) return null;
      var mo = slopeOf(A, pts[oddIdx + 1]); if (mo == null || sameSlope(mo, slopeOf(A, pts[1 + (oddIdx === 0 ? 1 : 0)]))) return null;
      return { pts: pts, odd: oddIdx + 1, E: E };
    });
  }
  function q14(r) {
    var P1, P2, bk = book(r);
    if (bk) { P1 = [1, 6]; P2 = [9, -9]; }
    else rep(r, function () { var tr = r.pick([[8, 15], [5, 12], [6, 8], [9, 12], [7, 24], [12, 16], [3, 4], [12, 5], [15, 8]]), v = signs(r, swapMaybe(r, tr)); P1 = [r.int(-6, 6), r.int(-8, 8)]; P2 = add(P1, v); return inBox([P2], -12, 12) && v[0] * v[0] !== v[1] * v[1] ? true : null; });
    var dx = P2[0] - P1[0], dy = P2[1] - P1[1], n = dx * dx + dy * dy, c = Math.sqrt(n), sb = Math.abs(dx * dx - dy * dy);
    var wrongDec = rnd(Math.sqrt(dx * dx + Math.pow(P2[1] + P1[1], 2)), 2);
    if (near(wrongDec, c)) wrongDec = rnd(Math.sqrt(n + 1), 2);
    var opts = [{ html: t(wrongDec.toFixed(2)), why: 'Check the ' + t('y') + '-difference: ' + t(nT(P2[1]) + '-' + par(P1[1]) + '=' + dy) + '. Also, the question asks for an <b>exact</b> distance.' },
      { html: t('\\sqrt{' + sb + '}'), why: 'The distance formula <b>adds</b> the squares: ' + t(par(dx) + '^{2}+' + par(dy) + '^{2}') + '.' },
      { html: t(c), right: true },
      { html: t(n), why: t(n) + ' is the square of the distance. Take its square root.' }];
    return mc(r, 'The exact distance between the points ' + t(ptT(P1)) + ' and ' + t(ptT(P2)) + ' is', opts, t(dW(P1, P2, 'd')) + '. The radicand is a perfect square, so the exact distance is the whole number ' + t(c) + '.', [LEN_HINT], 'exact distance (perfect square)');
  }
  function q15(r) {
    var A, Bp, bk = book(r);
    if (bk) { A = [6, 1]; Bp = [-4, 7]; }
    else rep(r, function () { A = [r.int(2, 9), r.int(-6, 4)]; Bp = [r.int(-8, 0), r.int(-2, 9)]; return (A[0] + Bp[0]) % 2 === 0 && (A[1] + Bp[1]) % 2 === 0 && A[0] + Bp[0] !== 0 && !samePt(A, Bp) ? true : null; });
    var M = mid(A, Bp), S = add(A, Bp), H = scl(sub(A, Bp), 0.5), wr = [-M[0], M[1]];
    var pool = [{ p: S, why: 'You added the coordinates but didn’t divide by ' + t('2') + '.' }, { p: wr, why: 'Check the sign of the ' + t('x') + '-coordinate: ' + t(nT(A[0]) + '+' + par(Bp[0]) + '=' + S[0]) + '.' },
      { p: H, why: 'You halved the <b>differences</b>. The centre is the midpoint: average the coordinates.' }, { p: [M[0], -M[1]], why: 'Check the sign of the ' + t('y') + '-coordinate.' },
      { p: scl(sub(Bp, A), 0.5), why: 'You halved the <b>differences</b>. The centre is the midpoint: average the coordinates.' }, { p: [M[1], M[0]], why: 'Write the ' + t('x') + '-coordinate first.' }, { p: [-M[0], -M[1]], why: 'Check both signs.' }];
    var cand = [{ html: t(ptT(M)), right: true }], used = [M];
    pool.forEach(function (c) { if (cand.length < 4 && !used.some(function (u) { return samePt(u, c.p); })) { used.push(c.p); cand.push({ html: t(ptT(c.p)), why: c.why }); } });
    return mc(r, 'The points ' + t('A' + ptT(A)) + ' and ' + t('B' + ptT(Bp)) + ' are on the circumference of a circle, and the line segment ' + t('AB') + ' passes through the centre of the circle. The centre of the circle is the point', cand,
      t('AB') + ' passes through the centre, so it is a diameter and the centre is its midpoint: ' + t(mW(A, Bp)) + '.', [MID_HINT], 'centre = midpoint of a diameter');
  }
  function q16(r) {
    var M = book(r) ? [2, -5] : [r.int(-4, 5), r.int(-6, 4)], h = book(r) ? 5 : r.int(3, 6);
    var flipA = r.chance(0.5), A = flipA ? [M[0] + h, M[1]] : [M[0] - h, M[1]], Bq = flipA ? [M[0] - h, M[1]] : [M[0] + h, M[1]], C = [M[0], M[1] - h], D = [M[0], M[1] + h];
    if (FORCE) { A = [7, -5]; Bq = [-3, -5]; C = [2, -10]; D = [2, 0]; }
    var L2 = 2 * h;
    var opts = [{ html: t('AB') + ' and ' + t('CD') + ' have the same slope and are equal in length.', why: t('AB') + ' is horizontal (slope ' + t('0') + ') and ' + t('CD') + ' is vertical (slope undefined) — not the same slope.' },
      { html: t('AB') + ' and ' + t('CD') + ' have the same slope and are unequal in length.', why: 'Horizontal and vertical segments never have the same slope. Find both lengths too.' },
      { html: t('CD') + ' has a length of ' + t(L2) + ' units and a slope of zero.', why: 'The length is right, but ' + t('CD') + ' is <b>vertical</b>: its run is ' + t('0') + ', so its slope is undefined, not zero.' },
      { html: t('AB') + ' and ' + t('CD') + ' have the same midpoint and are equal in length.', right: true }];
    return mc(r, 'Consider ' + t('AB') + ' joining ' + t('A' + ptT(A)) + ' and ' + t('B' + ptT(Bq)) + ', and ' + t('CD') + ' joining ' + t('C' + ptT(C)) + ' and ' + t('D' + ptT(D)) + '. Which one of the following statements about these line segments is true?', opts,
      t('AB') + ' is horizontal: ' + t('m_{AB}=0') + ', ' + t('AB=|' + nT(A[0]) + '-' + par(Bq[0]) + '|=' + L2) + '. ' + t('CD') + ' is vertical: slope undefined, ' + t('CD=|' + nT(D[1]) + '-' + par(C[1]) + '|=' + L2) + '.<br>' + t(mW(A, Bq, 'AB')) + ' and ' + t(mW(C, D, 'CD')) + ': the same midpoint, and equal lengths.',
      ['A horizontal segment has slope ' + t('0') + '; a vertical one has an undefined slope.', MID_HINT], 'horizontal and vertical segments compared');
  }
  function q17(r) {
    var A, Bp, P, Q, bk = book(r);
    if (bk) { A = [-3, 6]; Bp = [3, -9]; P = [8, 2]; Q = [-4, -6]; }
    else rep(r, function () {
      A = [r.int(-8, 0), r.int(-9, 9)]; Bp = [r.int(0, 8), r.int(-9, 9)]; P = [r.int(1, 9), r.int(-8, 8)]; Q = [r.int(-8, 4), r.int(-8, 8)];
      var M1 = mid(A, Bp), M2 = mid(P, Q); if (near(M1[0], M2[0]) || near(M1[1], M2[1])) return null;
      if ((M1[0] > M2[0]) === (M1[1] > M2[1])) return null;
      return (A[1] + Bp[1]) % 2 !== 0 || r.chance(0.3) ? true : null;
    });
    var M1 = mid(A, Bp), M2 = mid(P, Q);
    var opts = [{ html: 'The midpoint of ' + t('AB') + ' has an ' + t('x') + '-coordinate greater than the midpoint of ' + t('PQ') + '.', right: M1[0] > M2[0], why: 'Compare the ' + t('x') + '-coordinates: ' + t(nT(M1[0])) + ' and ' + t(nT(M2[0])) + '.' },
      { html: 'The midpoint of ' + t('AB') + ' has a ' + t('y') + '-coordinate greater than the midpoint of ' + t('PQ') + '.', right: M1[1] > M2[1], why: 'Compare the ' + t('y') + '-coordinates carefully: ' + t(nT(M1[1])) + ' and ' + t(nT(M2[1])) + ' (with negatives, closer to 0 is greater).' },
      { html: 'The midpoints of ' + t('AB') + ' and ' + t('PQ') + ' are the same point.', why: 'Work out both midpoints — they are different points.' },
      { html: 'The line segment joining the midpoints is horizontal.', why: 'A horizontal segment needs equal ' + t('y') + '-coordinates. Compare them.' }];
    return mc(r, 'Line segment ' + t('AB') + ' joins ' + t('A' + ptT(A)) + ' and ' + t('B' + ptT(Bp)) + '; line segment ' + t('PQ') + ' joins ' + t('P' + ptT(P)) + ' and ' + t('Q' + ptT(Q)) + '. Which of the following statements is correct?', opts,
      t(mW(A, Bp, 'AB')) + '<br>' + t(mW(P, Q, 'PQ')) + '<br>' + (M1[1] > M2[1] ? t(nT(M1[1]) + '>' + nT(M2[1])) + ', so the midpoint of ' + t('AB') + ' is higher.' : t(nT(M1[0]) + '>' + nT(M2[0])) + ', so the midpoint of ' + t('AB') + ' is further right.'),
      [MID_HINT], 'compare two midpoints');
  }
  /* quadrilateral of a given type: P, Q = P + u, R = Q + v, S = P + v */
  var EQLEN = [[[3, 4], [4, 3]], [[3, 4], [5, 0]], [[0, 5], [4, 3]], [[1, 3], [3, 1]], [[1, 2], [2, 1]], [[2, 3], [3, 2]], [[1, 7], [5, 5]], [[3, 4], [-3, 4]], [[2, 1], [-1, 2].map(function (x) { return x; })]];
  function quadOf(r, type) {
    return rep(r, function () {
      var u, v;
      if (type === 'square' || type === 'rectangle') { u = signs(r, r.pick(SMALL)); var w = r.chance(0.5) ? rot(u) : rotc(u); v = type === 'square' ? w : scl(w, r.int(2, 3)); }
      else if (type === 'rhombus') { var pr = r.pick(EQLEN.slice(0, 7)); u = signs(r, pr[0]); v = signs(r, pr[1]); if (dot(u, v) === 0 || sameSlope(slopeOf([0, 0], u), slopeOf([0, 0], v))) return null; if (r.chance(0.5)) { var tm = u; u = v; v = tm; } }
      else { u = signs(r, r.pick(SMALL.concat([[4, 2], [5, 1]]))); v = signs(r, r.pick(SMALL.concat([[5, 2], [4, 3]]))); if (dot(u, v) === 0 || dot(u, u) === dot(v, v) || sameSlope(slopeOf([0, 0], u), slopeOf([0, 0], v))) return null; }
      var P = [r.int(-8, 2), r.int(-8, 2)], Q = add(P, u), R = add(Q, v), S = add(P, v);
      return inBox([P, Q, R, S], -10, 10) ? { P: P, Q: Q, R: R, S: S } : null;
    });
  }
  function q18(r) {
    var bk = book(r), type = bk ? 'rectangle' : r.pick(['rectangle', 'square', 'rhombus', 'parallelogram']), V = bk ? { P: [-6, -9], Q: [-4, -3], R: [5, -6], S: [3, -12] } : quadOf(r, type);
    var P = V.P, Q = V.Q, R = V.R, S = V.S, mPQ = slopeOf(P, Q), mQR = slopeOf(Q, R), lPQ = n2(P, Q), lQR = n2(Q, R);
    var opts = [{ html: 'rectangle', right: type === 'rectangle', why: type === 'square' ? 'All four sides are equal too — there is a more complete name.' : 'A rectangle needs a right angle: is ' + t('m_{PQ}\\times m_{QR}=-1') + '?' },
      { html: 'square', right: type === 'square', why: type === 'rectangle' ? 'The angles are right angles, but compare ' + t('PQ') + ' and ' + t('QR') + ': they aren’t equal.' : 'A square needs a right angle: test ' + t('m_{PQ}\\times m_{QR}') + '.' },
      { html: 'rhombus', right: type === 'rhombus', why: 'A rhombus needs four equal sides: compare ' + t('PQ') + ' and ' + t('QR') + '.' + (type === 'square' ? ' (They are equal — but there is a right angle too.)' : '') },
      { html: 'parallelogram', right: type === 'parallelogram', why: 'It is a parallelogram — but check for a right angle and for equal sides: there is a more complete name.' }];
    var sol = t(slW(P, Q, 'PQ')) + ', ' + t(slW(Q, R, 'QR')) + ', and the opposite sides have the same slopes, so it is a parallelogram. ' + (isPerp(mPQ, mQR) ? t('m_{PQ}\\times m_{QR}=-1') + ': right angles. ' : t('m_{PQ}\\times m_{QR}\\neq -1') + ': no right angle. ') +
      t('PQ=' + radT(lPQ)) + ', ' + t('QR=' + radT(lQR)) + (lPQ === lQR ? ': all sides equal.' : ': unequal sides.') + ' Most complete name: <b>' + type + '</b>.';
    return mc(r, 'Quadrilateral ' + t('PQRS') + ' has vertices ' + nameList(['P', 'Q', 'R', 'S'], [P, Q, R, S]) + '. Which of the following most completely describes it?', opts, sol,
      ['Slopes tell you about parallel sides and right angles; lengths tell you about equal sides.'], 'name the quadrilateral (' + type + ')');
  }
  function q19(r) {
    var G, H, J, bk = book(r), type = bk ? 'iso' : r.pick(['iso', 'iso', 'isoRight', 'scal']);
    if (bk) { G = [-5, 2]; H = [1, -6]; J = [7, 2]; }
    else rep(r, function () {
      H = [r.int(-5, 5), r.int(-7, 1)];
      if (type === 'iso') { var a = r.int(2, 6), b = r.pick([3, 4, 5, 6, 7, 8]) * r.pick([1, -1]); if (a === Math.abs(b)) return null; G = add(H, [-a, b]); J = add(H, [a, b]); }
      else if (type === 'isoRight') { var u = signs(r, r.pick(SMALL.concat([[2, 4], [4, 2], [3, 3]]))); G = add(H, u); J = add(H, r.chance(0.5) ? rot(u) : rotc(u)); }
      else { G = add(H, [-r.int(2, 7), r.int(-3, 8)]); J = add(H, [r.int(2, 7), r.int(-3, 8)]); var a2 = d2(G, H), b2 = d2(H, J), c2 = d2(G, J); if (a2 === b2 || b2 === c2 || a2 === c2) return null; if (dot(sub(G, H), sub(J, H)) === 0 || dot(sub(H, G), sub(J, G)) === 0 || dot(sub(G, J), sub(H, J)) === 0) return null; if (sameSlope(slopeOf(G, H), slopeOf(H, J))) return null; }
      return inBox([G, H, J], -10, 10) ? true : null;
    });
    var s = [n2(G, H), n2(H, J), n2(G, J)].sort(function (a, b) { return a - b; }), isoq = s[0] === s[1] || s[1] === s[2], rightq = s[0] + s[1] === s[2];
    var opts = [{ html: 'scalene, with no right angle', right: !isoq && !rightq, why: 'Compare the three side lengths: two of them are equal.' },
      { html: 'isosceles, with no right angle', right: isoq && !rightq, why: isoq ? 'Test for a right angle with the converse of the Pythagorean theorem: is the sum of the two smaller squares equal to the largest?' : 'Find all three side lengths: are any two equal?' },
      { html: 'isosceles, with a right angle', right: isoq && rightq, why: isoq ? 'Two sides are equal — but check: ' + t(s[0] + '+' + s[1] + '=' + (s[0] + s[1])) + ', which is not ' + t(s[2]) + '. No right angle.' : 'Find all three side lengths: are any two equal?' },
      { html: 'equilateral', why: 'The three sides aren’t all equal. (In fact, no triangle with all its vertices on grid points can be equilateral.)' }];
    var sol = t(dW(G, H, 'GH')) + '<br>' + t(dW(H, J, 'HJ')) + '<br>' + t(dW(G, J, 'GJ')) + '<br>' + (isoq ? 'Two sides are equal: isosceles. ' : 'No two sides are equal: scalene. ') + 'Squares of the sides: ' + t(s.join(',\\ ')) + '; ' + t(s[0] + '+' + s[1] + (rightq ? '=' : '\\neq ') + s[2]) + (rightq ? ', so there is a right angle.' : ', so there is no right angle.');
    return mc(r, 'Triangle ' + t('GHJ') + ' has vertices ' + nameList(['G', 'H', 'J'], [G, H, J]) + '. Which of the following most completely describes ' + t('\\triangle GHJ') + '?', opts, sol,
      ['Find all three side lengths (squares are enough to compare).', 'Right angle: does (shorter)² + (shorter)² = (longest)²?'], 'classify triangle GHJ');
  }
  function q20(r) {
    var A, Bp, bk = book(r);
    if (bk) { A = [6, 1]; Bp = [-4, 7]; }
    else rep(r, function () { A = [r.int(1, 9), r.int(-6, 5)]; Bp = [r.int(-9, -1), r.int(-4, 9)]; var a = Math.PI * d2(A, Bp) / 4; return a < 9999 && Math.abs(a - Math.floor(a) - 0.5) > 0.06 ? true : null; });
    var n = d2(A, Bp), area = Math.PI * n / 4, ans = Math.round(area);
    return B.nr('The points ' + t('A' + ptT(A)) + ' and ' + t('B' + ptT(Bp)) + ' lie on a circle, with ' + t('AB') + ' passing through the centre. The area of the circle, to the nearest whole number, is ________.', ans, function (v) {
      if (v === Math.round(Math.PI * n)) return { code: 'circ-radius', hint: t('AB') + ' is the <b>diameter</b>. The radius is half of it.' };
      if (v === Math.round(Math.PI * Math.sqrt(n) / 2) || v === Math.round(Math.PI * Math.sqrt(n) / 2 * 10) / 10) return { code: 'circ-noSq', hint: 'Area is ' + t('\\pi r^{2}') + ' — square the radius.' };
      if (v === Math.round(Math.PI * Math.sqrt(n))) return { code: 'circ-circum', hint: 'That is the circumference. Area is ' + t('\\pi r^{2}') + '.' };
      return null;
    }, t(dW(A, Bp, 'AB')) + ' is the diameter, so ' + t('r=\\dfrac{AB}{2}') + ' and ' + t('r^{2}=\\dfrac{' + n + '}{4}=' + nT(n / 4)) + '.<br>Area ' + t('=\\pi r^{2}=' + nT(n / 4) + '\\pi\\approx ' + rnd(area, 2)) + ', so ' + t(ans) + '.',
      ['The centre is the midpoint, so the radius is half of ' + t('AB') + '.', 'Area ' + t('=\\pi r^{2}') + '. Keep ' + t('r^{2}=\\frac{AB^{2}}{4}') + ' exact until the end.'], 'circle area from a diameter');
  }
  function q21(r) {
    var Q, R, bk = book(r);
    if (bk) { Q = [5.4, 3.2]; R = [9.1, 7.9]; }
    else rep(r, function () { Q = [r.int(11, 79) / 10, r.int(11, 89) / 10]; R = [rnd(Q[0] + r.int(13, 49) / 10, 1), r.int(11, 99) / 10]; /* rnd: no float noise like 8.899999999999999 in the prompt */ var px = rnd(2 * R[0] - Q[0], 1); return px > 0 && px < 100 && Q[0] % 1 !== 0 && R[0] % 1 !== 0 ? true : null; });
    var px = rnd(2 * R[0] - Q[0], 1), avg = (Q[0] + R[0]) / 2, df = rnd(R[0] - Q[0], 1);
    return B.approx(t('PQ') + ' is the diameter of a circle whose centre is ' + t('R') + '. If ' + t('Q(' + Q[0] + ',\\ ' + Q[1] + ')') + ' and ' + t('R(' + R[0] + ',\\ ' + R[1] + ')') + ', then the ' + t('x') + '-coordinate of ' + t('P') + ' is ________.', px, 1, { nr: true, diag: function (v) {
      if (near(v, rnd(avg, 1)) || near(v, rnd(avg, 2))) return { code: 'end-avg', hint: 'You averaged ' + t('Q') + ' and ' + t('R') + '. ' + t('R') + ' is the midpoint of ' + t('P') + ' and ' + t('Q') + ': solve ' + t('\\frac{x+' + Q[0] + '}{2}=' + R[0]) + '.' };
      if (near(v, df)) return { code: 'end-diff', hint: 'That is the step from ' + t('Q') + ' to ' + t('R') + '. ' + t('P') + ' is one more equal step past ' + t('R') + '.' };
      return null;
    } }, t('R') + ' is the midpoint of ' + t('PQ') + ': ' + t('\\dfrac{x+' + Q[0] + '}{2}=' + R[0]) + ' ⟹ ' + t('x+' + Q[0] + '=' + rnd(2 * R[0], 1)) + ' ⟹ ' + t('x=' + px.toFixed(1)) + '.', ['The centre ' + t('R') + ' is the midpoint of the diameter ' + t('PQ') + '.'], 'endpoint of a diameter (decimals)');
  }

  /* ===================== the lesson ===================== */
  var QUESTIONS = [
      { num: '1', section: 'Assignment — Core review (Questions 1–13)', stem: '<i>(Matching)</i> Three line segments are drawn on the grid.', parts: [
        { id: '1', level: 'BEG', outcome: 'RF3', make: function (r) { return q1(r); } }] },
      { num: '2', stem: '<i>(Multiple Choice)</i>', parts: [{ id: '2', level: 'EMG', outcome: 'RF3', make: function (r) { return q2(r); } }] },
      { num: '3', stem: '<i>(Multiple Choice)</i>', parts: [{ id: '3', level: 'EMG', outcome: 'RF3', make: function (r) { return q3(r); } }] },
      { num: '4', stem: '<i>(Multiple Choice)</i>', parts: [{ id: '4', level: 'ADV', outcome: 'RF3', make: function (r) { return q4(r); } }] },
      { num: '5', stem: '<i>(Multiple Choice)</i>', parts: [{ id: '5', level: 'BEG', outcome: 'RF3', make: function (r) { return q5(r); } }] },
      { num: '6', stem: '<i>(Multiple Choice)</i>', parts: [{ id: '6', level: 'BEG', outcome: 'RF3', make: function (r) { return q6(r); } }] },
      { num: '7', stem: '<i>(Multiple Choice)</i>', parts: [{ id: '7', level: 'EMG', outcome: 'RF4', make: function (r) { return q7(r); } }] },
      { num: '8', stem: '<i>(Multiple Choice)</i>', parts: [{ id: '8', level: 'EMG', outcome: 'RF5', make: function (r) { return q8(r); } }] },
      { num: '9', stem: '<i>(Multiple Choice)</i>', parts: [{ id: '9', level: 'BEG', outcome: 'RF5', make: function (r) { return q9(r); } }] },
      { num: '10', stem: '<i>(Numerical Response)</i>', parts: [{ id: '10', level: 'PRG', outcome: 'RF3', make: function (r) { return q10(r); } }] },
      { num: '11', stem: '<i>(Numerical Response)</i>', parts: [{ id: '11', level: 'PRG', outcome: 'RF3', make: function (r) { return q11(r); } }] },
      { num: '12', stem: '<i>(Numerical Response)</i>', parts: [{ id: '12', level: 'PRG', outcome: 'RF3', make: function (r) { return q12(r); } }] },
      { num: '13', stem: '<i>(Numerical Response)</i>', parts: [{ id: '13', level: 'PRG', outcome: 'RF5', make: function (r) { return q13(r); } }] },
      { num: 'WR', section: 'Written Response', shared: wrShared,
        stem: function (sh) { return 'Consider the points ' + nameList(['A', 'B', 'C', 'D'], sh.pts) + '. Three of these points lie on the same straight line and one does not.'; },
        parts: [
          { id: 'wra', level: 'EMG', make: function (r) {
            return mc(r, '(a) Which is a correct <b>algebraic</b> way to determine which point is not collinear with the other three?', [
              { html: 'Pick one point, say ' + t('A') + ', and find the slope from it to each of the other three. Two slopes will match and the point giving the odd slope is off the line (if all three differ, ' + t('A') + ' itself is the odd one).', right: true },
              { html: 'Find the slopes of ' + t('AB') + ', ' + t('BC') + ' and ' + t('CD') + '. If any two are equal, all four points are collinear.', why: 'Two equal slopes only put the points of <b>those</b> segments on one line. You need slopes from one fixed point to each of the others.' },
              { html: 'Find the lengths ' + t('AB') + ', ' + t('AC') + ' and ' + t('AD') + '. The point that is furthest away is not on the line.', why: 'Distance can’t tell you about <b>direction</b>: points far away can still be on the line. Collinearity is a question about slope.' },
              { html: 'Find the midpoint of ' + t('AD') + '. Whichever of ' + t('B') + ' or ' + t('C') + ' is not the midpoint is off the line.', why: 'A point can be on the line without being its midpoint. Collinearity is a question about slope.' }],
              'Use slopes from one fixed point: collinear points all give the same slope from it, so the odd slope picks out the point that is off the line. (If the fixed point is the odd one, all three slopes differ — then repeat from another point.)', ['Collinear means “on one line” — which tool measures direction?'], 'collinearity strategy');
          } },
          { id: 'wrb', level: 'PRG', make: function (r, sh) {
            var P = sh.pts, n = ['A', 'B', 'C', 'D'], oddL = n[sh.odd];
            var p = FP('(b) Find the slopes from ' + t('A') + ' to the other three points, then name the point that is not collinear with the other three.', [
              slopeBox('AB', P[0], P[1]), slopeBox('AC', P[0], P[2]), slopeBox('AD', P[0], P[3]),
              fb('Not collinear:', letterChk(oddL, function (s) { return s === 'A' ? 'Two of the slopes from ' + t('A') + ' are equal, so ' + t('A') + ' is on the line with those two points.' : 'The point that is off the line is the one whose slope from ' + t('A') + ' is <b>different</b>.'; }), oddL, { text: true, name: 'Point', ph: 'letter' })],
              t(slW(P[0], P[1], 'AB')) + '<br>' + t(slW(P[0], P[2], 'AC')) + '<br>' + t(slW(P[0], P[3], 'AD')) + '<br>Two slopes match, so those points lie on one line through ' + t('A') + '; ' + t(oddL) + ' gives a different slope, so <b>' + oddL + '</b> is not collinear with the other three.',
              [SLOPE_HINT], 'odd point out (collinearity)');
            p.outcome = 'RF3'; return p;
          } },
          { id: 'wrc', level: 'PRG', make: function (r, sh) {
            var P = sh.pts, on = [0, 1, 2, 3].filter(function (i) { return i !== sh.odd; }), m = slopeOf(P[0], P[on[1]]), E = sh.E, k = E[0], mo = slopeOf(P[0], P[sh.odd]);
            var kOdd = mo && mo[0] !== 0 ? P[0][0] + (E[1] - P[0][1]) / mval(mo) : null;
            return B.number('(c) A fifth point, ' + t('E(k,\\ ' + E[1] + ')') + ', lies on the same line as the three collinear points. Determine the value of ' + t('k') + '.', k, function (v) {
              if (kOdd != null && near(v, rnd(kOdd, 2))) return { code: 'used-odd', hint: 'That uses the slope to the point that is <b>not</b> on the line. Use the slope of the line through the three collinear points.' };
              if (near(v, 2 * P[0][0] - k)) return { code: 'k-sign', hint: 'Check the sign when you solve: ' + t('k-' + par(P[0][0])) + ' in the run.' };
              return null;
            }, 'The collinear points lie on a line of slope ' + t(sT(m)) + ', so ' + t('m_{AE}') + ' must be ' + t(sT(m)) + ':<br>' + t('\\dfrac{' + E[1] + '-' + par(P[0][1]) + '}{k-' + par(P[0][0]) + '}=' + dfr(sT(m))) + ' ⟹ ' + t('k-' + par(P[0][0]) + '=' + nT((E[1] - P[0][1]) / mval(m))) + ' ⟹ ' + t('k=' + k) + '.',
              ['Use the slope of the line through the three collinear points. Set the slope from ' + t('A') + ' to ' + t('E') + ' equal to it.'], 'point on the line: find k');
          } }] },
      { num: '14', section: 'Extension/Foundation — Distance and Midpoint', stem: '<i>(Multiple Choice)</i>', parts: [{ id: '14', level: 'BEG', outcome: 'EXT', make: function (r) { return q14(r); } }] },
      { num: '15', stem: '<i>(Multiple Choice)</i>', parts: [{ id: '15', level: 'BEG', outcome: 'EXT', make: function (r) { return q15(r); } }] },
      { num: '16', stem: '<i>(Multiple Choice)</i>', parts: [{ id: '16', level: 'EMG', outcome: 'EXT', make: function (r) { return q16(r); } }] },
      { num: '17', stem: '<i>(Multiple Choice)</i>', parts: [{ id: '17', level: 'BEG', outcome: 'EXT', make: function (r) { return q17(r); } }] },
      { num: '18', stem: '<i>(Multiple Choice)</i>', parts: [{ id: '18', level: 'PRG', outcome: 'EXT', make: function (r) { return q18(r); } }] },
      { num: '19', stem: '<i>(Multiple Choice)</i>', parts: [{ id: '19', level: 'PRG', outcome: 'EXT', make: function (r) { return q19(r); } }] },
      { num: '20', stem: '<i>(Numerical Response)</i>', parts: [{ id: '20', level: 'PRG', outcome: 'EXT', make: function (r) { return q20(r); } }] },
      { num: '21', stem: '<i>(Numerical Response)</i>', parts: [{ id: '21', level: 'EMG', outcome: 'EXT', make: function (r) { return q21(r); } }] },
      { num: '22', outcome: 'EXT', shared: function (r) {
          if (book(r)) return { A: [-8, 10], B: [1, 1], D: [10, -8] };
          return rep(r, function () { var f = r.pick([[1, 1], [1, 2], [2, 1], [1, 3], [3, 1], [2, 3], [3, 2]]), k = r.int(1, 4), dir = [f[1] * k, -f[0] * k * r.pick([1, -1])], Bp = [r.int(-3, 3), r.int(-3, 3)], A = sub(Bp, dir), D = add(Bp, dir); return inBox([A, D], -12, 12) ? { A: A, B: Bp, D: D } : null; });
        },
        stem: function (sh) { return 'The points ' + nameList(['A', 'B', 'D'], [sh.A, sh.B, sh.D]) + ' lie on one straight line. Without using the midpoint formula, show that ' + t('B') + ' is the midpoint of segment ' + t('AD') + '.'; },
        parts: [
          { id: '22a', level: 'EMG', make: function (r, sh) {
            return FP('(a) Find the exact lengths ' + t('AB') + ' and ' + t('BD') + '.', [lenBox('AB', sh.A, sh.B), lenBox('BD', sh.B, sh.D)], t(dW(sh.A, sh.B, 'AB')) + '<br>' + t(dW(sh.B, sh.D, 'BD')) + '<br>' + t('AB=BD') + '.', [LEN_HINT], 'AB and BD exact');
          } },
          { id: '22b', level: 'PRG', make: function (r, sh) {
            var L2 = radT(n2(sh.A, sh.B));
            return mc(r, '(b) ' + t('AB=BD=' + L2) + '. Which argument completes the proof that ' + t('B') + ' is the midpoint of ' + t('AD') + '?', [
              { html: t('A') + ', ' + t('B') + ', ' + t('D') + ' are collinear (' + t('m_{AB}=m_{BD}') + '), so ' + t('B') + ' lies on segment ' + t('AD') + '; a point on the segment that is equally far from both ends is its midpoint.', right: true },
              { html: t('AB=BD') + ' on its own proves it: equal distances always mean a midpoint.', why: 'Every point on the perpendicular bisector of ' + t('AD') + ' is equally far from ' + t('A') + ' and ' + t('D') + '. You also need ' + t('B') + ' to be <b>on</b> ' + t('AD') + '.' },
              { html: 'The slopes ' + t('m_{AB}') + ' and ' + t('m_{BD}') + ' are negative reciprocals, so ' + t('B') + ' is halfway.', why: 'Negative reciprocal slopes would mean a right angle at ' + t('B') + ' — not a straight line. On one line the slopes are <b>equal</b>.' },
              { html: t('B') + ' has whole-number coordinates between those of ' + t('A') + ' and ' + t('D') + ', so it is halfway.', why: 'Lots of points lie between ' + t('A') + ' and ' + t('D') + '. You need equal distances <b>and</b> collinearity.' }],
              t(slW(sh.A, sh.B, 'AB')) + ' and ' + t(slW(sh.B, sh.D, 'BD')) + ': equal, and the segments share ' + t('B') + ', so the three points are collinear and ' + t('B') + ' lies on ' + t('AD') + '. With ' + t('AB=BD=' + L2) + ', ' + t('B') + ' is the midpoint.', ['Equal distances put ' + t('B') + ' on the perpendicular bisector of ' + t('AD') + '. What else must be true?'], 'why B is the midpoint');
          } }] }
  ];

  /* ===================== Extra Practice EP05 ===================== */
  function triFig(V, names, extra) { var pts = names.map(function (n) { return V[n]; }); return fig(Object.assign({ x: [-12, 12], y: [-12, 12], labels: 4, segs: [{ pts: pts.concat([pts[0]]), start: 'none', end: 'none' }], points: names.map(function (n) { return lbl(n, V[n]); }) }, extra || {})); }
  function boxFor(pts, pad) { var xs = pts.map(function (p) { return p[0]; }), ys = pts.map(function (p) { return p[1]; }); pad = pad == null ? 1 : pad; var lo = Math.min(0, Math.min.apply(null, xs.concat(ys))) - pad, hi = Math.max(0, Math.max.apply(null, xs.concat(ys))) + pad; return { x: [Math.min(0, Math.min.apply(null, xs)) - pad, Math.max(0, Math.max.apply(null, xs)) + pad], y: [Math.min(0, Math.min.apply(null, ys)) - pad, Math.max(0, Math.max.apply(null, ys)) + pad], lo: lo, hi: hi }; }
  function polyFig(V, names, o) { o = o || {}; var pts = names.map(function (n) { return V[n]; }), bx = boxFor(pts.concat(o.more || [])); var span = Math.max(bx.x[1] - bx.x[0], bx.y[1] - bx.y[0]); return fig({ x: bx.x, y: bx.y, labels: span > 16 ? 4 : 2, segs: [{ pts: o.open ? pts : pts.concat([pts[0]]), start: 'none', end: 'none' }].concat(o.segs || []), points: names.map(function (n) { return lbl(n, V[n]); }).concat(o.points || []) }); }

  var TOOLS = [{ id: 'dist', html: 'Distance' }, { id: 'mid', html: 'Midpoint' }, { id: 'slope', html: 'Slope' }];
  var CLAIMS = [
    { id: 'c1', html: 'A quadrilateral has exactly one pair of parallel sides.', w: 'slope', why: 'Parallel is a claim about <b>direction</b> — equal slopes (and unequal for the other pair).' },
    { id: 'c2', html: 'A triangle contains a right angle (without finding any side length).', w: 'slope', why: 'Perpendicular sides have slopes that multiply to ' + t('-1') + ' — no lengths needed.' },
    { id: 'c3', html: 'A parallelogram is in fact a rhombus.', w: 'dist', why: 'A rhombus has four <b>equal sides</b> — a claim about length.' },
    { id: 'c4', html: 'One segment bisects another.', w: 'mid', why: 'To bisect is to cut into two equal halves, so it must pass through the <b>midpoint</b>.' },
    { id: 'c5', html: 'A vertex of a figure is out of place, and you must say <b>how far</b> out it is.', w: 'dist', why: '“How far” asks for a <b>length</b>.' },
    { id: 'c6', html: 'A triangle is isosceles.', w: 'dist', why: 'Isosceles means two equal <b>sides</b> — lengths.' },
    { id: 'c7', html: 'Three points lie on one straight line.', w: 'slope', why: 'Collinear points give equal <b>slopes</b>.' },
    { id: 'c8', html: 'Two diagonals cut each other in half.', w: 'mid', why: 'Cutting each other in half means sharing a <b>midpoint</b>.' },
    { id: 'c9', html: 'A ramp is steeper than the building code allows.', w: 'slope', why: 'Steepness is measured by <b>slope</b>.' },
    { id: 'c10', html: 'A point is the centre of a circle that has a given diameter.', w: 'mid', why: 'The centre is halfway along the diameter: its <b>midpoint</b>.' }];
  var TOOLN = { dist: 'Distance', mid: 'Midpoint', slope: 'Slope' };

  var EXTRAS = [
    /* ---------- Part A — One figure, every tool ---------- */
    { num: '1', section: 'Extra practice A — One Figure, Every Tool', shared: rightIsoTri,
      stem: function (sh) { return t('\\triangle ABC') + ' has vertices ' + nameList(['A', 'B', 'C'], [sh.A, sh.B, sh.C]) + '.' + polyFig(sh, ['A', 'B', 'C']); },
      parts: [
        { id: 'e1a', level: 'EMG', outcome: 'EXT', make: function (r, sh) {
          var V = function (P, Q) { return Math.sqrt(d2(P, Q)); };
          return FP('(a) Determine the exact length of ' + t('AB') + ', ' + t('BC') + ' and ' + t('AC') + ', and give each to the nearest tenth.', [
            lenBox('AB', sh.A, sh.B), decBox(t('AB\\approx'), V(sh.A, sh.B), 1, { name: t('AB') + ' (tenth)' }), lenBox('BC', sh.B, sh.C), decBox(t('BC\\approx'), V(sh.B, sh.C), 1, { name: t('BC') + ' (tenth)' }),
            lenBox('AC', sh.A, sh.C), decBox(t('AC\\approx'), V(sh.A, sh.C), 1, { name: t('AC') + ' (tenth)' })],
            t(dW(sh.A, sh.B, 'AB')) + t('\\approx ' + fx1(V(sh.A, sh.B))) + '<br>' + t(dW(sh.B, sh.C, 'BC')) + t('\\approx ' + fx1(V(sh.B, sh.C))) + '<br>' + t(dW(sh.A, sh.C, 'AC')) + t('\\approx ' + fx1(V(sh.A, sh.C))), [LEN_HINT, 'Round only the decimal versions; keep the exact ones as simplified radicals.'], 'triangle side lengths');
        } },
        { id: 'e1b', level: 'EMG', outcome: 'EXT', make: function (r, sh) {
          var nAB = n2(sh.A, sh.B), nAC = n2(sh.A, sh.C), a = radSpec(nAB), c = radSpec(nAC), terms;
          if (a.m === c.m) terms = [{ k: [2 * a.k[0] + c.k[0], 1], m: a.m }]; else terms = [{ k: [2 * a.k[0], 1], m: a.m }, { k: c.k, m: c.m }];
          terms.sort(function (x, y) { return x.m - y.m; });
          var V = 2 * Math.sqrt(nAB) + Math.sqrt(nAC), ex1 = sumTex(terms);
          var p = FP('(b) State the exact perimeter as a simplified sum, then round it once, at the end, to the nearest tenth.', [
            fb(t('P='), sumChk(terms), ex1, { name: 'Exact perimeter', ph: 'exact' }),
            decBox(t('P\\approx'), V, 1, { name: 'Rounded perimeter', chk: K.approx(V, 1, { diag: function (v) { var early = 2 * rnd(Math.sqrt(nAB), 1) + rnd(Math.sqrt(nAC), 1); return near(v, rnd(early, 1)) ? { code: 'round', hint: 'You rounded the sides first. Add the <b>exact</b> values, and round only the final total.' } : null; } }) })],
            t('P=AB+BC+AC=' + radT(nAB) + '+' + radT(nAB) + '+' + radT(nAC) + '=' + ex1) + ' units (exact) ' + t('\\approx ' + fx1(V)) + ' units. Only the final total is rounded.', ['Add like terms: whole numbers with whole numbers, and matching radicals with matching radicals.'], 'exact perimeter');
          p.good = [ex1.replace(/^(\d+)\+(.*)$/, '$2+$1')].filter(function (g) { return g !== ex1; }).map(function (g) { return [g, rnd(V, 1).toFixed(1)]; });
          return p;
        } },
        { id: 'e1c', level: 'BEG', outcome: 'EXT', make: function (r, sh) {
          return FP('(c) Determine the midpoint of each of the three sides.', [midBox('AB', sh.A, sh.B), midBox('BC', sh.B, sh.C), midBox('AC', sh.A, sh.C)],
            t(mW(sh.A, sh.B, 'AB')) + '<br>' + t(mW(sh.B, sh.C, 'BC')) + '<br>' + t(mW(sh.A, sh.C, 'AC')), [MID_HINT], 'midpoints of the sides');
        } },
        { id: 'e1d', level: 'EMG', outcome: 'EXT', make: function (r, sh) {
          var L1 = radT(n2(sh.A, sh.B)), L3 = radT(n2(sh.A, sh.C));
          return mc(r, '(d) Classify ' + t('\\triangle ABC') + ' by its sides, and choose the tool that settles it.', [
            { html: '<b>Isosceles</b> — distance settles it, because “equal sides” is a claim about length.', right: true },
            { html: '<b>Isosceles</b> — slope settles it, because equal slopes mean equal sides.', why: 'Slope only tells you which way a side tilts. Equal <b>lengths</b> need the distance formula.' },
            { html: '<b>Scalene</b> — distance settles it, because all three lengths differ.', why: 'Look again at (a): ' + t('AB=BC=' + L1) + '.' },
            { html: '<b>Equilateral</b> — midpoint settles it, because each side has a midpoint.', why: t('AC=' + L3) + ' is longer than the other two. And a midpoint is only a location — it can’t compare lengths.' }],
            'From (a): ' + t('AB=BC=' + L1) + ' and ' + t('AC=' + L3) + '. Exactly two sides are equal: <b>isosceles</b>. Distance settles it because equal sides are a claim about length; slope gives direction and a midpoint only a location.', ['Compare the three lengths from (a).'], 'classify by sides + tool');
        } },
        { id: 'e1e', level: 'PRG', outcome: 'RF3', make: function (r, sh) {
          var a2 = n2(sh.A, sh.B), b2 = n2(sh.B, sh.C), c2 = n2(sh.A, sh.C);
          return FP('(e) Show <b>two different ways</b> that ' + t('\\triangle ABC') + ' has a right angle, and name the vertex: with slopes, and with the converse of the Pythagorean theorem.', [
            slopeBox('AB', sh.A, sh.B), slopeBox('BC', sh.B, sh.C),
            fb(t('AB^{2}+BC^{2}='), numChk(a2 + b2), String(a2 + b2), { name: t('AB^{2}+BC^{2}') }), fb(t('AC^{2}='), numChk(c2), String(c2), { name: t('AC^{2}') }),
            fb('Right angle at', letterChk('B', function () { return 'The right angle is where the two perpendicular sides meet — and it is opposite the longest side.'; }), 'B', { text: true, name: 'Vertex', ph: 'letter' })],
            '<i>Slopes.</i> ' + t(slW(sh.A, sh.B, 'AB')) + ', ' + t(slW(sh.B, sh.C, 'BC')) + '; their product is ' + t('-1') + ', so ' + t('AB\\perp BC') + '.<br><i>Converse of Pythagoras.</i> ' + t('AB^{2}+BC^{2}=' + a2 + '+' + b2 + '=' + (a2 + b2)) + ' and ' + t('AC^{2}=' + c2) + '. ✓<br>Both ways, the right angle is at ' + t('B') + '.',
            ['Perpendicular slopes multiply to ' + t('-1') + '.', 'Square the lengths from (a): no radicals are left.'], 'right angle two ways');
        } },
        { id: 'e1f', level: 'EMG', outcome: 'EXT', make: function (r, sh) {
          var a2 = n2(sh.A, sh.B), area = a2 / 2;
          return B.number('(f) Determine the area of ' + t('\\triangle ABC') + '. (Which two sides can serve as the base and the height?)', area, function (v) {
            if (near(v, a2)) return { code: 'value', hint: 'Area of a triangle is ' + t('\\tfrac12\\times\\text{base}\\times\\text{height}') + ' — don’t forget the ' + t('\\tfrac12') + '.' };
            if (near(v, Math.sqrt(a2) * Math.sqrt(n2(sh.A, sh.C)) / 2)) return { code: 'value', hint: 'The base and height must be <b>perpendicular</b>. The two legs that meet at the right angle work; the hypotenuse doesn’t.' };
            return null;
          }, 'By (e), ' + t('AB\\perp BC') + ', so they serve as base and height: ' + t('A=\\tfrac12(AB)(BC)=\\tfrac12(' + radT(a2) + ')(' + radT(a2) + ')=\\tfrac12(' + a2 + ')=' + nT(area)) + ' square units.', ['The two sides that meet at the right angle are perpendicular — use them as base and height.'], 'area of the right triangle', { after: 'square units' });
        } },
        { id: 'e1g', level: 'PRG', outcome: 'EXT', make: function (r, sh) {
          var M = mid(sh.A, sh.C);
          return FP('(g) A <b>median</b> joins a vertex to the midpoint of the opposite side. Determine the exact length <b>and</b> the slope of the median from ' + t('B') + '.', [lenBox('BM', sh.B, M), slopeBox('BM', sh.B, M)],
            'The opposite side is ' + t('AC') + ', with midpoint ' + t('M' + ptT(M)) + '.<br>' + t(dW(sh.B, M, 'BM')) + '<br>' + t(slW(sh.B, M, 'BM')), ['First find ' + t('M') + ', the midpoint of ' + t('AC') + ' (from (c)).', LEN_HINT], 'median length and slope');
        } },
        { id: 'e1h', level: 'PRG', outcome: 'RF3', make: function (r, sh) {
          var M = mid(sh.A, sh.C), mAC = slopeOf(sh.A, sh.C), mBM = slopeOf(sh.B, M), ac = radT(n2(sh.A, sh.C)), bm = radT(n2(sh.B, M)), area = n2(sh.A, sh.B) / 2;
          return mc(r, '(h) ' + t('m_{BM}=' + sT(mBM)) + ' and ' + t('m_{AC}=' + sT(mAC)) + '. What does comparing these slopes prove, and how does it give the area a second time?', [
            { html: 'The slopes are negative reciprocals, so the median is <b>perpendicular</b> to ' + t('AC') + ': it is the height on base ' + t('AC') + ', and ' + t('\\tfrac12(' + ac + ')(' + bm + ')=' + nT(area)) + '.', right: true },
            { html: 'The slopes are equal, so the median is <b>parallel</b> to ' + t('AC') + ' and the area is ' + t('(' + ac + ')(' + bm + ')') + '.', why: 'Multiply the slopes: ' + t(sT(mBM) + '\\times ' + sT(mAC) + '=-1') + '. That means perpendicular, not parallel.' },
            { html: 'The slopes are negative reciprocals, so the median is perpendicular to ' + t('AC') + ', and the area is ' + t('(' + ac + ')(' + bm + ')') + '.', why: 'Right idea — but a triangle’s area is <b>half</b> of base × height.' },
            { html: 'Nothing: a median never tells you anything about the height.', why: 'This median <i>is</i> perpendicular to ' + t('AC') + ' (product of slopes ' + t('-1') + '), so here it is also a height.' }],
            t(sT(mBM) + '\\times ' + sT(mAC) + '=-1') + ', so ' + t('BM\\perp AC') + ': the median is also the height on base ' + t('AC') + '. ' + t('A=\\tfrac12(AC)(BM)=\\tfrac12(' + ac + ')(' + bm + ')=' + nT(area)) + ' ✓ — the same as (f).', ['Multiply the two slopes.'], 'median is an altitude');
        } },
        { id: 'e1i', level: 'PRG', outcome: 'EXT', make: function (r, sh) {
          var M1 = mid(sh.A, sh.B), M2 = mid(sh.B, sh.C);
          return FP('(i) Join the midpoint of ' + t('AB') + ' to the midpoint of ' + t('BC') + '. Determine that segment’s exact length and its slope.', [lenBox('M_{1}M_{2}', M1, M2), slopeBox('M_{1}M_{2}', M1, M2)],
            'Midpoints from (c): ' + t('M_1' + ptT(M1)) + ', ' + t('M_2' + ptT(M2)) + '.<br>' + t(dW(M1, M2, 'M_1M_2')) + '<br>' + t(slW(M1, M2, 'M_1M_2')), [MID_HINT, LEN_HINT], 'midsegment length and slope');
        } },
        { id: 'e1i2', sub: 'i, cont.', level: 'EMG', outcome: 'EXT', make: function (r, sh) {
          var M1 = mid(sh.A, sh.B), M2 = mid(sh.B, sh.C), l = radT(n2(M1, M2)), ac = radT(n2(sh.A, sh.C)), mm = sT(slopeOf(M1, M2));
          return mc(r, '(i) continued. The segment joining the two midpoints has length ' + t(l) + ' and slope ' + t(mm) + '. State its two relationships to side ' + t('AC') + '.', [
            { html: 'It is <b>parallel</b> to ' + t('AC') + ' and <b>half as long</b>.', right: true },
            { html: 'It is <b>perpendicular</b> to ' + t('AC') + ' and half as long.', why: 'Compare the slopes: ' + t('m_{AC}=' + sT(slopeOf(sh.A, sh.C))) + ' — the same slope means parallel.' },
            { html: 'It is parallel to ' + t('AC') + ' and the <b>same length</b>.', why: 'Compare ' + t(l) + ' with ' + t('AC=' + ac) + '.' },
            { html: 'It is parallel to ' + t('AC') + ' and <b>twice as long</b>.', why: 'Compare ' + t(l) + ' with ' + t('AC=' + ac) + ': which is longer?' }],
            t('m_{AC}=' + sT(slopeOf(sh.A, sh.C))) + ' — the same slope, so the segments are parallel. ' + t(l + '=\\tfrac12(' + ac + ')') + ', so it is half as long as ' + t('AC') + '.', ['Compare with ' + t('m_{AC}') + ' and ' + t('AC') + ' from earlier parts.'], 'midsegment relationships');
        } }] },
    /* ---------- Part B — Choosing the right tool ---------- */
    { num: '2', section: 'Extra practice B — Choosing the Right Tool', stem: 'For each claim, decide which tool — <b>distance</b>, <b>midpoint</b> or <b>slope</b> — settles it. Calculate nothing.', parts: [
      { id: 'e2', sub: 'a–d, f', level: 'EMG', outcome: 'EXT', make: function (r) {
        var pick = book(r) ? CLAIMS.slice(0, 5) : r.sample(CLAIMS.slice(0, 5), 3).concat(r.sample(CLAIMS.slice(5), 2));
        pick = r.shuffle(pick); var want = {}; pick.forEach(function (c) { want[c.id] = c.w; });
        return B.grid('Which tool settles each claim?', pick.map(function (c) { return { id: c.id, html: c.html }; }), TOOLS, want, { why: function (rid) { var c = CLAIMS.filter(function (x) { return x.id === rid; })[0]; return { code: 'row', hint: '“' + c.html.replace(/<[^>]+>/g, '') + '” — ' + c.why }; } },
          pick.map(function (c) { return c.html + ' — <b>' + TOOLN[c.w] + '.</b> ' + c.why; }).join('<br>'), ['Slope → direction (parallel, perpendicular, collinear). Distance → length (equal sides, how far). Midpoint → halfway (bisects, centre).'], 'which tool settles it');
      } },
      { id: 'e2e', sub: 'e', level: 'EMG', outcome: 'EXT', make: function (r) {
        return mc(r, '(e) “A point lies on the perpendicular bisector of a segment.” Two different tools each settle this one. Which pair of methods is right?', [
          { html: '<b>Distance</b>: the point is equally far from both endpoints — <b>or</b> <b>midpoint and slope</b>: it is on the line through the midpoint with the negative reciprocal slope.', right: true },
          { html: 'Only <b>slope</b>: the point must give a slope of ' + t('-1') + ' to each endpoint.', why: 'Perpendicular means the slopes multiply to ' + t('-1') + ' — and you also need the line to go through the midpoint.' },
          { html: 'Only <b>midpoint</b>: the point must be the midpoint of the segment.', why: 'The midpoint is just one point of the perpendicular bisector; the bisector is a whole line.' },
          { html: '<b>Distance</b> only — midpoint and slope can never settle it.', why: 'The bisector is the line through the midpoint, perpendicular to the segment: midpoint + slope pins it down too.' }],
          '<b>Distance:</b> the point is the same distance from both endpoints. <b>Midpoint and slope:</b> the point is on the line through the segment’s midpoint with the negative reciprocal slope.', ['“Bisector” → midpoint; “perpendicular” → slope. And every point on it is equidistant from the endpoints.'], 'perpendicular bisector: two tools');
      } }] },
    { num: '3', stem: 'For each pair of segments, decide: parallel, perpendicular or neither; equal in length or not; sharing a midpoint or not.',
      shared: function (r) {
        var bk = book(r), o = {};
        if (bk) { o.a = [[-6, 1], [2, 7], [-1, -4], [7, 2]]; o.b = [[-3, 5], [5, -1], [-2, -2], [4, 6]]; o.c = [[-4, -6], [-4, 5], [-9, 3], [2, 3]]; return o; }
        o.a = rep(r, function () { var w = signs(r, r.pick([[8, 6], [6, 8], [4, 2], [2, 4], [3, 6], [6, 3], [4, 6], [6, 4]])), A = [r.int(-8, 0), r.int(-6, 2)], Bq = add(A, w), lam = r.pick([1, 1, 0.5]), C = [r.int(-6, 4), r.int(-6, 4)], D = add(C, scl(w, lam)); if (!inBox([Bq, D], -10, 10) || sameSlope(slopeOf(A, C), slopeOf(A, Bq)) || samePt(A, C)) return null; if (lam !== 1 && !Number.isInteger(D[0])) return null; return [A, Bq, C, D]; });
        o.b = rep(r, function () { var h = signs(r, r.pick([[4, 3], [3, 4], [4, 2], [2, 3], [3, 1], [5, 2]])), M = [r.int(-3, 3), r.int(-3, 3)], g = r.chance(0.5) ? rot(h) : rotc(h); var E = sub(M, h), Fp = add(M, h), G = sub(M, g), H = add(M, g); return inBox([E, Fp, G, H], -9, 9) ? [E, Fp, G, H] : null; });
        o.c = rep(r, function () { var x0 = r.int(-6, 4), y1 = r.int(-7, -1), L1 = r.int(5, 12), y0 = r.int(-3, 5), L2 = r.chance(0.6) ? L1 : r.int(5, 12), x1 = r.int(-10, -1); var J = [x0, y1], Kp = [x0, y1 + L1], Lp = [x1, y0], M = [x1 + L2, y0]; return inBox([J, Kp, Lp, M], -11, 11) && !samePt(mid(J, Kp), mid(Lp, M)) ? [J, Kp, Lp, M] : null; });
        return o;
      },
      parts: [
        { id: 'e3a', level: 'PRG', outcome: 'EXT', make: function (r, sh) { return pairPart(r, sh.a, ['A', 'B', 'C', 'D'], '(a)'); } },
        { id: 'e3b', level: 'PRG', outcome: 'EXT', make: function (r, sh) { return pairPart(r, sh.b, ['E', 'F', 'G', 'H'], '(b)'); } },
        { id: 'e3c', level: 'PRG', outcome: 'EXT', make: function (r, sh) { return pairPart(r, sh.c, ['J', 'K', 'L', 'M'], '(c)'); } },
        { id: 'e3d', level: 'EMG', outcome: 'EXT', make: function (r, sh) {
          var P = sh.b;
          return mc(r, '(d) In (b), the endpoints ' + nameList(['E', 'G', 'F', 'H'], [P[0], P[2], P[1], P[3]]) + ', joined in that order, form a well-known shape (' + t('EF') + ' and ' + t('GH') + ' are its diagonals). Which name, and which three facts about the diagonals ' + t('EF') + ' and ' + t('GH') + ', prove it?', [
            { html: 'A <b>square</b>: the diagonals share a midpoint (parallelogram), are equal (rectangle) and are perpendicular (rhombus).', right: true },
            { html: 'A <b>rhombus</b>: the diagonals are perpendicular and share a midpoint.', why: 'True, but the diagonals are also <b>equal</b>, which adds “rectangle”. There is a more complete name.' },
            { html: 'A <b>rectangle</b>: the diagonals are equal and share a midpoint.', why: 'True, but the diagonals are also <b>perpendicular</b>, which adds “rhombus”. There is a more complete name.' },
            { html: 'A <b>kite</b>: the diagonals are perpendicular.', why: 'The diagonals also bisect each other and are equal — that is much more than a kite.' }],
            'Shared midpoint ⟹ the diagonals bisect each other: a parallelogram. Equal diagonals ⟹ a rectangle. Perpendicular diagonals ⟹ a rhombus. Rectangle + rhombus = <b>square</b>.', ['Use all three answers from (b).'], 'diagonals prove a square');
        } },
        { id: 'e3e', level: 'BEG', outcome: 'RF3', make: function (r, sh) {
          var P = sh.c;
          return FP('(e) Part (c) — ' + t('JK') + ': ' + nameList(['J', 'K'], [P[0], P[1]]) + '; ' + t('LM') + ': ' + nameList(['L', 'M'], [P[2], P[3]]) + ' — is the one case where the product of the slopes can’t be used. State the two slopes.', [slopeBox('JK', P[0], P[1]), slopeBox('LM', P[2], P[3])],
            t('JK') + ' has equal ' + t('x') + '-coordinates: vertical, so ' + t('m_{JK}') + ' is <b>undefined</b> (run ' + t('0') + '). ' + t('LM') + ' has equal ' + t('y') + '-coordinates: horizontal, ' + t('m_{LM}=0') + '.', ['A vertical segment has run ' + t('0') + '; a horizontal one has rise ' + t('0') + '.'], 'vertical and horizontal slopes');
        } },
        { id: 'e3e2', sub: 'e, cont.', level: 'EMG', outcome: 'RF3', make: function (r, sh) {
          var P = sh.c;
          return mc(r, '(e) continued. ' + t('JK') + ' (' + nameList(['J', 'K'], [P[0], P[1]]) + ') has an undefined slope and ' + t('LM') + ' (' + nameList(['L', 'M'], [P[2], P[3]]) + ') has slope ' + t('0') + '. Why isn’t the product of these two slopes ' + t('-1') + ', and how do you know the segments are perpendicular anyway?', [
            { html: '“Undefined” isn’t a number, so the product can’t be calculated at all; they are perpendicular because a vertical and a horizontal segment always meet at ' + t('90^\\circ') + '.', right: true },
            { html: 'The product is ' + t('0') + ', so they are not perpendicular.', why: 'You can’t multiply by “undefined”. And a vertical segment always meets a horizontal one at a right angle.' },
            { html: 'The product is ' + t('-1') + ' after all, because ' + t('0\\times\\text{undefined}=-1') + '.', why: '“Undefined” is not a number, so no product can be calculated.' },
            { html: 'They aren’t perpendicular: perpendicular segments must have slopes that multiply to ' + t('-1') + '.', why: 'The ' + t('-1') + ' test only works when both slopes are numbers. Horizontal and vertical is the exception.' }],
            'A product needs two numbers, and an undefined slope isn’t a number, so ' + t('m_{JK}\\times m_{LM}') + ' can’t be calculated. They are perpendicular anyway: vertical meets horizontal at ' + t('90^\\circ') + ' — the exception to the negative-reciprocal test.', ['Can you multiply by “undefined”?'], 'horizontal/vertical exception');
        } }] },
    { num: '4', stem: function (sh) { return 'A city map is drawn on a coordinate grid on which <b>1 unit represents ' + sh.sc + ' m</b>. The bus depot is at ' + t('D' + ptT(sh.D)) + ', the school at ' + t('S' + ptT(sh.S)) + ', the library at ' + t('L' + ptT(sh.L)) + ' and the rink at ' + t('R' + ptT(sh.R)) + '.' + polyFig(sh, ['D', 'S'], { open: true, segs: [{ pts: [sh.L, sh.R], start: 'none', end: 'none' }], points: [lbl('L', sh.L), lbl('R', sh.R)], more: [sh.L, sh.R] }); },
      shared: function (r) {
        if (book(r)) return { D: [-8, 6], S: [4, -2], L: [-2, 12], R: [10, 4], sc: 250 };
        return rep(r, function () { var u = signs(r, r.pick([[12, -8], [8, -6], [10, -4], [6, -8], [8, -4], [12, -6], [10, -6]])), w = signs(r, r.pick([[6, 6], [4, 6], [6, 2], [2, 6], [4, 8], [6, 4]])), D = [r.int(-9, -2), r.int(-4, 6)];
          var S = add(D, u), L = add(D, w), R = add(L, u); if (!inBox([D, S, L, R], -11, 14) || dot(u, w) === 0 || dot(u, u) === dot(w, w) || sameSlope(slopeOf([0, 0], u), slopeOf([0, 0], w))) return null; return { D: D, S: S, L: L, R: R, sc: r.pick([250, 200, 500, 100]) }; });
      },
      parts: [
        { id: 'e4a', level: 'EMG', outcome: 'EXT', make: function (r, sh) {
          var n = n2(sh.D, sh.S), V = Math.sqrt(n), km = V * sh.sc / 1000;
          return FP('(a) Determine the straight-line distance from the depot to the school: exact in grid units, then to the nearest tenth of a unit, then in <b>kilometres</b> to the nearest tenth.', [
            lenBox('DS', sh.D, sh.S), decBox(t('DS\\approx'), V, 1, { name: 'Units (tenth)', ans: t(fx1(V) + '\\text{ units}') }),
            decBox('Distance ≈ (km)', km, 1, { name: 'Kilometres', ans: t(fx1(km) + '\\text{ km}'), chk: K.approx(km, 1, { diag: function (v) { if (near(v, rnd(V * sh.sc, 1)) || near(v, Math.round(V * sh.sc))) return { code: 'scale-m', hint: 'That is in <b>metres</b>. Divide by ' + t('1000') + ' for kilometres.' }; if (near(v, rnd(V, 1))) return { code: 'scale-none', hint: 'That is still in grid units: each unit is ' + t(sh.sc + '\\text{ m}') + '.' }; return null; } }) })],
            t(dW(sh.D, sh.S, 'DS')) + t('\\approx ' + fx1(V)) + ' units.<br>Scale: ' + t(radT(n) + '\\times ' + sh.sc + '\\approx ' + rnd(V * sh.sc, 2)) + ' m ' + t('\\approx ' + fx1(km)) + ' km.', [LEN_HINT, 'Multiply grid units by ' + t(sh.sc) + ' for metres; divide by ' + t('1000') + ' for km.'], 'map distance with a scale');
        } },
        { id: 'e4b', level: 'EMG', outcome: 'EXT', make: function (r, sh) {
          var km = Math.sqrt(n2(sh.D, sh.S)) / 2 * sh.sc / 1000;
          return FP('(b) A crossing guard is posted exactly midway along ' + t('DS') + '. State its coordinates, and how far it is from the depot in kilometres (nearest tenth).', [
            ptBox('Guard:', mid(sh.D, sh.S), midChk(sh.D, sh.S), 'Guard'), decBox('Distance ≈ (km)', km, 1, { name: 'Kilometres', ans: t(fx1(km) + '\\text{ km}'), chk: K.approx(km, 1, { diag: function (v) { if (near(v, rnd(2 * km, 1))) return { code: 'value', hint: 'That is the whole distance ' + t('DS') + '. The guard is <b>halfway</b>.' }; return null; } }) })],
            t(mW(sh.D, sh.S, 'DS')) + '. It is halfway, so it is ' + t('\\tfrac12 DS=' + radT(n2(sh.D, sh.S), 2)) + ' units ' + t('\\approx ' + fx1(km)) + ' km from ' + t('D') + '.', [MID_HINT, 'Halfway along means half of the distance from (a).'], 'midpoint on a map');
        } },
        { id: 'e4c', level: 'PRG', outcome: 'RF3', make: function (r, sh) {
          return FP('(c) The bus runs ' + t('D\\to S') + ' and a second bus runs ' + t('L\\to R') + '. Settle whether the routes are parallel with slopes, then test whether ' + t('L') + ' lies on route ' + t('DS') + ' (find ' + t('m_{DL}') + ').', [slopeBox('DS', sh.D, sh.S), slopeBox('LR', sh.L, sh.R), slopeBox('DL', sh.D, sh.L)],
            t(slW(sh.D, sh.S, 'DS')) + ', ' + t(slW(sh.L, sh.R, 'LR')) + ': equal, so the routes are <b>parallel</b>.<br>' + t(slW(sh.D, sh.L, 'DL')) + ' ' + t('\\neq ' + sT(slopeOf(sh.D, sh.S))) + ', so ' + t('L') + ' is not on line ' + t('DS') + ': parallel but <b>not the same road</b>.', [SLOPE_HINT], 'parallel routes, distinct');
        } },
        { id: 'e4d', level: 'EMG', outcome: 'EXT', make: function (r, sh) {
          var l = radT(n2(sh.D, sh.S));
          return mc(r, '(d) ' + t('LR=' + l) + ', the same as ' + t('DS') + '. What single word describes quadrilateral ' + t('DSRL') + ', and which two facts prove it?', [
            { html: '<b>Parallelogram</b>: opposite sides ' + t('DS') + ' and ' + t('RL') + ' are both parallel and equal.', right: true },
            { html: '<b>Rectangle</b>: opposite sides ' + t('DS') + ' and ' + t('RL') + ' are parallel and equal.', why: 'Parallel and equal opposite sides give a parallelogram. A rectangle also needs a right angle — nothing here shows one.' },
            { html: '<b>Rhombus</b>: ' + t('DS=RL') + '.', why: 'A rhombus needs all <b>four</b> sides equal; ' + t('DS') + ' and ' + t('RL') + ' are opposite sides.' },
            { html: '<b>Trapezoid</b>: only one pair of sides is parallel.', why: 'One pair is parallel <b>and equal</b>, which forces the other pair to be parallel too.' }],
            'Both routes have the same slope (c) and the same length ' + t(l) + ' (d). A quadrilateral with one pair of opposite sides both parallel and equal is a <b>parallelogram</b>.', ['One pair of opposite sides that is parallel <i>and</i> equal — what does that make?'], 'parallelogram from one pair');
        } },
        { id: 'e4e', level: 'PRG', outcome: 'EXT', make: function (r, sh) {
          return FP('(e) Confirm that ' + t('DSRL') + ' is a parallelogram a second way, using only the diagonals ' + t('DR') + ' and ' + t('SL') + ': find each midpoint and each exact length.', [midBox('DR', sh.D, sh.R), midBox('SL', sh.S, sh.L), lenBox('DR', sh.D, sh.R), lenBox('SL', sh.S, sh.L)],
            t(mW(sh.D, sh.R, 'DR')) + ', ' + t(mW(sh.S, sh.L, 'SL')) + ': shared, so the diagonals bisect each other — a parallelogram ✓.<br>' + t(dW(sh.D, sh.R, 'DR')) + '<br>' + t(dW(sh.S, sh.L, 'SL')), [MID_HINT, LEN_HINT], 'diagonals of DSRL');
        } },
        { id: 'e4e2', sub: 'e, cont.', level: 'EMG', outcome: 'EXT', make: function (r, sh) {
          var a = radT(n2(sh.D, sh.R)), b = radT(n2(sh.S, sh.L));
          return mc(r, '(e) continued. The diagonals are ' + t('DR=' + a) + ' and ' + t('SL=' + b) + '. What does that tell you ' + t('DSRL') + ' is <b>not</b>?', [
            { html: 'Not a rectangle (so not a square): a rectangle’s diagonals are equal.', right: true },
            { html: 'Not a parallelogram: the diagonals aren’t equal.', why: 'A parallelogram’s diagonals only need to <b>bisect each other</b> — they don’t have to be equal.' },
            { html: 'Not a quadrilateral.', why: 'It has four sides, so it is a quadrilateral.' },
            { html: 'Not a rhombus: a rhombus’s diagonals are equal.', why: 'A rhombus’s diagonals are perpendicular, not necessarily equal. Equal diagonals is the rectangle test.' }],
            'Unequal diagonals rule out a <b>rectangle</b> (and therefore a square). Shared midpoints already confirmed a parallelogram.', ['Which special parallelogram has equal diagonals?'], 'unequal diagonals rule out');
        } }] },
    /* ---------- Part C — Proving a shape is what it claims ---------- */
    { num: '5', section: 'Extra practice C — Proving a Shape Is What It Claims', shared: function (r) {
        if (book(r)) return { A: [-4, -2], B: [1, -2], C: [4, 2], D: [-1, 2] };
        return rep(r, function () { var pr = r.pick([[5, [3, 4]], [5, [-3, 4]], [10, [6, 8]], [10, [8, 6]], [10, [-6, 8]], [10, [-8, 6]], [5, [3, -4]]]), Lh = pr[0], v = pr[1], u = [Lh, 0], M = [r.int(-2, 2), r.int(-2, 2)];
          var A = sub(M, scl(add(u, v), 0.5)), Bq = add(A, u), C = add(Bq, v), D = add(A, v); return inBox([A, Bq, C, D], -10, 10) && A[1] !== 0 && C[1] !== 0 ? { A: A, B: Bq, C: C, D: D } : null; });
      },
      stem: function (sh) { return 'Quadrilateral ' + t('ABCD') + ' has vertices ' + nameList(['A', 'B', 'C', 'D'], [sh.A, sh.B, sh.C, sh.D]) + '. Its diagonals are drawn dashed.' + polyFig(sh, ['A', 'B', 'C', 'D'], { segs: [{ pts: [sh.A, sh.C], start: 'none', end: 'none', dash: true, color: '#c4532a' }, { pts: [sh.B, sh.D], start: 'none', end: 'none', dash: true, color: '#c4532a' }] }); },
      parts: [
        { id: 'e5a', level: 'EMG', outcome: 'RF3', make: function (r, sh) {
          return FP('(a) Determine the slope of all four sides.', [slopeBox('AB', sh.A, sh.B), slopeBox('BC', sh.B, sh.C), slopeBox('CD', sh.C, sh.D), slopeBox('DA', sh.D, sh.A)],
            [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A']].map(function (p) { return t(slW(sh[p[0]], sh[p[1]], p.join(''))); }).join('<br>') + '<br>' + t('AB\\parallel CD') + ' and ' + t('BC\\parallel DA') + ': both pairs of opposite sides are parallel, so ' + t('ABCD') + ' is a parallelogram.', [SLOPE_HINT], 'slopes of four sides');
        } },
        { id: 'e5b', level: 'EMG', outcome: 'EXT', make: function (r, sh) {
          return FP('(b) Determine the length of all four sides.', [lenBox('AB', sh.A, sh.B), lenBox('BC', sh.B, sh.C), lenBox('CD', sh.C, sh.D), lenBox('DA', sh.D, sh.A)],
            [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A']].map(function (p) { return t(dW(sh[p[0]], sh[p[1]], p.join(''))); }).join('<br>') + '<br>All four sides are equal, which upgrades the parallelogram of (a) to a <b>rhombus</b>.', [LEN_HINT, 'A horizontal side’s length is just the difference of the ' + t('x') + '-coordinates.'], 'lengths of four sides');
        } },
        { id: 'e5c', level: 'EMG', outcome: 'RF3', make: function (r, sh) {
          var mBC = slopeOf(sh.B, sh.C);
          return mc(r, '(c) Test the adjacent sides ' + t('AB') + ' and ' + t('BC') + ' for perpendicularity. What does the result rule out?', [
            { html: t('m_{AB}\\times m_{BC}=0\\times ' + sT(mBC) + '=0\\neq -1') + ' (and ' + t('BC') + ' isn’t vertical): no right angle, so it is <b>not a rectangle</b> — and not a square.', right: true },
            { html: t('m_{AB}\\times m_{BC}=0') + ', so the sides are perpendicular: it is a square.', why: 'Perpendicular needs a product of ' + t('-1') + ' (or a horizontal side meeting a <b>vertical</b> one). ' + t('BC') + ' isn’t vertical.' },
            { html: 'The product is ' + t('0') + ', which rules out a parallelogram.', why: 'Right angles have nothing to do with being a parallelogram — (a) already showed it is one.' },
            { html: t('AB') + ' is horizontal, so its slope is undefined and the test can’t be done.', why: 'A horizontal segment has slope ' + t('0') + '; it is a <b>vertical</b> one whose slope is undefined.' }],
            t('m_{AB}\\times m_{BC}=0\\times ' + sT(mBC) + '=0\\neq -1') + ', and ' + t('BC') + ' is not vertical, so ' + t('\\angle B') + ' is not a right angle. ' + t('ABCD') + ' is not a rectangle, so not a square.', ['Multiply the two slopes from (a).'], 'adjacent sides not perpendicular');
        } },
        { id: 'e5d', level: 'PRG', outcome: 'EXT', make: function (r, sh) {
          return FP('(d) Determine the midpoint and the exact length of each diagonal.', [midBox('AC', sh.A, sh.C), midBox('BD', sh.B, sh.D), lenBox('AC', sh.A, sh.C), lenBox('BD', sh.B, sh.D)],
            t(mW(sh.A, sh.C, 'AC')) + ', ' + t(mW(sh.B, sh.D, 'BD')) + ': the same point, so the diagonals bisect each other (parallelogram ✓).<br>' + t(dW(sh.A, sh.C, 'AC')) + '<br>' + t(dW(sh.B, sh.D, 'BD')) + '<br>Unequal diagonals: not a rectangle.', [MID_HINT, LEN_HINT], 'diagonals: midpoints and lengths');
        } },
        { id: 'e5e', level: 'EMG', outcome: 'RF3', make: function (r, sh) {
          return FP('(e) Determine whether the diagonals are perpendicular: find their slopes.', [slopeBox('AC', sh.A, sh.C), slopeBox('BD', sh.B, sh.D)],
            t(slW(sh.A, sh.C, 'AC')) + ', ' + t(slW(sh.B, sh.D, 'BD')) + '; the product is ' + t('-1') + ': the diagonals are <b>perpendicular</b>.', [SLOPE_HINT], 'diagonal slopes');
        } },
        { id: 'e5e2', sub: 'e, cont.', level: 'EMG', outcome: 'EXT', make: function (r, sh) {
          var facts = t('m_{AB}=m_{CD}=' + sT(slopeOf(sh.A, sh.B))) + ' and ' + t('m_{BC}=m_{DA}=' + sT(slopeOf(sh.B, sh.C))) + '; all four sides have length ' + t(radT(n2(sh.A, sh.B))) + '; ' + t('AB') + ' and ' + t('BC') + ' are not perpendicular; the diagonals share the midpoint ' + t(ptT(mid(sh.A, sh.C))) + ', have lengths ' + t('AC=' + radT(n2(sh.A, sh.C))) + ' and ' + t('BD=' + radT(n2(sh.B, sh.D))) + ', and slopes ' + t(sT(slopeOf(sh.A, sh.C))) + ' and ' + t(sT(slopeOf(sh.B, sh.D))) + '.';
          return mc(r, '(e) continued. The results so far: ' + facts + ' What is the most complete name for ' + t('ABCD') + '?', [
            { html: '<b>Rhombus</b> (not a square)', right: true },
            { html: '<b>Square</b>', why: 'All sides are equal, but there is no right angle (and the diagonals are unequal).' },
            { html: '<b>Parallelogram</b>', why: 'True — but all four sides are equal, which is more.' },
            { html: '<b>Rectangle</b>', why: 'No right angle and unequal diagonals rule out a rectangle.' }],
            '(a) parallelogram; (b) four equal sides ⟹ rhombus; (c), (d) no right angle and unequal diagonals ⟹ not a square; (e) perpendicular diagonals, as every rhombus has. Name: <b>rhombus</b>.', ['Combine every result: equal sides? right angle?'], 'most complete name (rhombus)');
        } }] },
    { num: '6', shared: function (r) { return isoTrap(r, book(r)); },
      stem: function (sh) { return 'Quadrilateral ' + t('PQRS') + ' has vertices ' + nameList(['P', 'Q', 'R', 'S'], [sh.P, sh.Q, sh.R, sh.S]) + '.'; },
      parts: [
        { id: 'e6a', level: 'EMG', outcome: 'RF3', make: function (r, sh) {
          return FP('(a) Determine the slope of all four sides. (Exactly one pair turns out parallel: that makes ' + t('PQRS') + ' a trapezoid.)', [slopeBox('PQ', sh.P, sh.Q), slopeBox('QR', sh.Q, sh.R), slopeBox('RS', sh.R, sh.S), slopeBox('SP', sh.S, sh.P)],
            [['P', 'Q'], ['Q', 'R'], ['R', 'S'], ['S', 'P']].map(function (p) { return t(slW(sh[p[0]], sh[p[1]], p.join(''))); }).join('<br>') + '<br>' + t('PQ\\parallel RS') + ', but ' + t('m_{QR}\\neq m_{SP}') + ': exactly one parallel pair — a <b>trapezoid</b>.', [SLOPE_HINT], 'trapezoid slopes');
        } },
        { id: 'e6b', level: 'EMG', outcome: 'EXT', make: function (r, sh) {
          return FP('(b) Determine the length of all four sides.', [lenBox('PQ', sh.P, sh.Q), lenBox('QR', sh.Q, sh.R), lenBox('RS', sh.R, sh.S), lenBox('SP', sh.S, sh.P)],
            [['P', 'Q'], ['Q', 'R'], ['R', 'S'], ['S', 'P']].map(function (p) { return t(dW(sh[p[0]], sh[p[1]], p.join(''))); }).join('<br>') + '<br>The legs ' + t('QR=SP') + ' are equal: an <b>isosceles</b> trapezoid.', [LEN_HINT], 'trapezoid side lengths');
        } },
        { id: 'e6c', level: 'EMG', outcome: 'EXT', make: function (r, sh) {
          return FP('(c) Determine the exact length of both diagonals ' + t('PR') + ' and ' + t('QS') + '.', [lenBox('PR', sh.P, sh.R), lenBox('QS', sh.Q, sh.S)], t(dW(sh.P, sh.R, 'PR')) + '<br>' + t(dW(sh.Q, sh.S, 'QS')) + '<br>The diagonals are equal.', [LEN_HINT], 'trapezoid diagonals');
        } },
        { id: 'e6d', level: 'EMG', outcome: 'EXT', make: function (r, sh) {
          return FP('(d) A classmate says “equal diagonals, so ' + t('PQRS') + ' is a rectangle.” Disprove it with one midpoint comparison: find the midpoints of both diagonals.', [midBox('PR', sh.P, sh.R), midBox('QS', sh.Q, sh.S)],
            t(mW(sh.P, sh.R, 'PR')) + ', ' + t(mW(sh.Q, sh.S, 'QS')) + ': different points, so the diagonals do <b>not</b> bisect each other — ' + t('PQRS') + ' isn’t even a parallelogram, let alone a rectangle.', [MID_HINT], 'diagonal midpoints differ');
        } },
        { id: 'e6d2', sub: 'd, cont.', level: 'PRG', outcome: 'EXT', make: function (r) {
          return mc(r, '(d) continued. What extra condition do equal diagonals need before “rectangle” is earned?', [
            { html: 'The diagonals must also <b>bisect each other</b> (share a midpoint).', right: true },
            { html: 'The diagonals must also be <b>perpendicular</b>.', why: 'Perpendicular diagonals point to a rhombus or kite, not a rectangle.' },
            { html: 'Nothing — equal diagonals always make a rectangle.', why: 'This trapezoid has equal diagonals and isn’t a rectangle. The diagonals must also bisect each other.' },
            { html: 'The diagonals must have <b>equal slopes</b>.', why: 'Two diagonals with equal slopes would be parallel — they could never cross.' }],
            'Equal diagonals earn “rectangle” only when the diagonals also bisect each other (that makes it a parallelogram first).', ['Every rectangle is a parallelogram first. What do a parallelogram’s diagonals do?'], 'equal diagonals need bisecting');
        } },
        { id: 'e6e', sub: 'e', level: 'EMG', outcome: 'RF3', make: function (r, sh) {
          var mQR = slopeOf(sh.Q, sh.R);
          return mc(r, '(e) Is any angle of ' + t('PQRS') + ' a right angle? Settle it with slopes.', [
            { html: '<b>No</b>: ' + t('m_{PQ}\\times m_{QR}=0\\times ' + par2(mQR) + '=0\\neq -1') + ', and since both parallel sides are horizontal, a right angle would need a vertical leg — neither leg is vertical.', right: true },
            { html: '<b>Yes</b>, at ' + t('Q') + ': the product of the slopes is ' + t('0') + '.', why: 'Perpendicular slopes multiply to ' + t('-1') + '. With a horizontal side, the other side would have to be vertical.' },
            { html: '<b>Yes</b>: the diagonals are equal, so the corners are right angles.', why: 'Equal diagonals alone don’t give right angles — (d) showed this isn’t even a parallelogram.' },
            { html: 'It can’t be decided without the lengths.', why: 'Right angles are about direction: slopes settle it.' }],
            t('m_{PQ}=0') + ' and ' + t('m_{QR}=' + sT(mQR)) + ': the product is ' + t('0\\neq -1') + ', and ' + t('QR') + ' isn’t vertical, so ' + t('\\angle Q') + ' isn’t right. Both parallel sides are horizontal, so a right angle anywhere would need a vertical leg; neither leg is vertical. <b>No right angle.</b>', ['A horizontal side is perpendicular only to a vertical one.'], 'no right angle in the trapezoid');
        } }] },
    { num: '7', shared: function (r) { return rightScaleneTri(r, book(r)); },
      stem: function (sh) { return t('\\triangle GHJ') + ' has vertices ' + nameList(['G', 'H', 'J'], [sh.G, sh.H, sh.J]) + '.'; },
      parts: [
        { id: 'e7a', level: 'EMG', outcome: 'EXT', make: function (r, sh) {
          var s = [n2(sh.G, sh.H), n2(sh.H, sh.J), n2(sh.G, sh.J)];
          return FP('(a) Determine the exact length of each side and classify the triangle by its sides.', [lenBox('GH', sh.G, sh.H), lenBox('HJ', sh.H, sh.J), lenBox('GJ', sh.G, sh.J),
            fb('Type:', wordChk(/^scal/, [{ re: /^isos|^isoc/, hint: 'Isosceles needs two equal sides — compare your three lengths.' }, { re: /^equi/, hint: 'Equilateral needs all three sides equal.' }, { re: /^right/, hint: 'That classifies by angle. By its <b>sides</b>, the triangle is equilateral, isosceles or scalene.' }], 'Choose scalene, isosceles or equilateral.'), 'scalene', { text: true, name: 'Type', ph: 'scalene / isosceles / …' })],
            t(dW(sh.G, sh.H, 'GH')) + '<br>' + t(dW(sh.H, sh.J, 'HJ')) + '<br>' + t(dW(sh.G, sh.J, 'GJ')) + '<br>All three differ: <b>scalene</b>.', [LEN_HINT], 'side lengths and type');
        } },
        { id: 'e7b', level: 'PRG', outcome: 'RF3', make: function (r, sh) {
          var a = n2(sh.G, sh.H), b = n2(sh.H, sh.J), c = n2(sh.G, sh.J);
          return FP('(b) Prove with slopes that there is a right angle, and name the vertex. (Confirm with the converse of the Pythagorean theorem.)', [slopeBox('GH', sh.G, sh.H), slopeBox('HJ', sh.H, sh.J),
            fb('Right angle at', letterChk('H', function () { return 'The right angle is where the two perpendicular sides meet.'; }), 'H', { text: true, name: 'Vertex', ph: 'letter' })],
            t(slW(sh.G, sh.H, 'GH')) + ', ' + t(slW(sh.H, sh.J, 'HJ')) + '; the product is ' + t('-1') + ', so ' + t('GH\\perp HJ') + ': the right angle is at ' + t('H') + '.<br>Check: ' + t('GH^{2}+HJ^{2}=' + a + '+' + b + '=' + (a + b) + '=GJ^{2}') + ' ✓', [SLOPE_HINT, 'Perpendicular slopes multiply to ' + t('-1') + '.'], 'right angle by slopes');
        } },
        { id: 'e7c', level: 'EMG', outcome: 'EXT', make: function (r, sh) {
          var a = n2(sh.G, sh.H), b = n2(sh.H, sh.J), area = Math.sqrt(a * b) / 2;
          return B.number('(c) Determine the area of ' + t('\\triangle GHJ') + '.', rnd(area, 6), function (v) {
            if (near(v, 2 * area)) return { code: 'value', hint: 'Area of a triangle is ' + t('\\tfrac12\\times\\text{base}\\times\\text{height}') + '.' };
            return null;
          }, 'The legs ' + t('GH') + ' and ' + t('HJ') + ' are perpendicular (b), so they are the base and height: ' + t('A=\\tfrac12(' + radT(a) + ')(' + radT(b) + ')=' + nT(rnd(area, 6))) + ' square units.', ['Use the two perpendicular sides as base and height.'], 'area of a right triangle', { after: 'square units' });
        } },
        { id: 'e7d', level: 'PRG', outcome: 'EXT', make: function (r, sh) {
          var M = mid(sh.G, sh.J), n = n2(M, sh.G, 2);
          return FP('(d) Determine the midpoint ' + t('M') + ' of the hypotenuse, then calculate ' + t('MG') + ', ' + t('MH') + ' and ' + t('MJ') + ' exactly.', [ptBox(t('M='), M, midChk(sh.G, sh.J), t('M')), lenBox('MG', M, sh.G, 2), lenBox('MH', M, sh.H, 2), lenBox('MJ', M, sh.J, 2)],
            'The hypotenuse is ' + t('GJ') + ' (opposite the right angle). ' + t(mW(sh.G, sh.J, 'GJ')) + '.<br>' + t(dW(M, sh.G, 'MG', 2)) + '<br>' + t(dW(M, sh.H, 'MH', 2)) + '<br>' + t(dW(M, sh.J, 'MJ', 2)) + '<br>All three are equal — each is half the hypotenuse, ' + t('\\tfrac12(' + radT(n2(sh.G, sh.J)) + ')') + '.',
            [MID_HINT, 'Fractions inside the distance formula: ' + t('\\left(\\tfrac{a}{2}\\right)^{2}=\\tfrac{a^{2}}{4}') + '. Then ' + t('\\sqrt{\\tfrac{n}{4}}=\\tfrac{\\sqrt{n}}{2}') + '.'], 'midpoint of hypotenuse distances');
        } },
        { id: 'e7e', level: 'EMG', outcome: 'EXT', make: function (r, sh) {
          var M = mid(sh.G, sh.J), V = Math.sqrt(d2(M, sh.G));
          return B.approx('(e) ' + t('M' + ptT(M)) + ' is the midpoint of the hypotenuse ' + t('GJ') + '. A circle drawn through all three vertices has ' + t('M') + ' as its centre (because ' + t('MG=MH=MJ') + '). State its radius to the nearest tenth.', V, 1, { after: 'units', diag: function (v) { return near(v, rnd(2 * V, 1)) ? { code: 'circ-radius', hint: 'That is the hypotenuse — the <b>diameter</b>. The radius is ' + t('MG') + '.' } : null; } },
            'Every point on a circle is the same distance from the centre. ' + t('MG=MH=MJ') + ', so the circle centred at ' + t('M') + ' with radius ' + t('MG=' + radT(n2(M, sh.G, 2), 2) + '\\approx ' + fx1(V)) + ' passes through all three vertices.', ['The radius is the distance from the centre ' + t('M') + ' to any vertex.'], 'circumradius');
        } }] },
    /* ---------- Part D — Working backwards ---------- */
    { num: '8', section: 'Extra practice D — Working Backwards', shared: function (r) {
        if (book(r)) return { A: [-5, -2], B: [3, -4], C: [7, 4] };
        return rep(r, function () { var u = signs(r, r.pick([[8, -2], [6, -2], [6, 2], [8, 2], [4, -2], [6, -4]])), v = signs(r, r.pick([[4, 8], [2, 6], [4, 6], [2, 4], [4, 2], [6, 4]])), A = [r.int(-7, 0), r.int(-6, 2)];
          if ((u[0] + v[0]) % 2 || (u[1] + v[1]) % 2 || dot(u, v) === 0 || sameSlope(slopeOf([0, 0], u), slopeOf([0, 0], v))) return null; var Bq = add(A, u), C = add(Bq, v), D = add(A, v); return inBox([A, Bq, C, D], -10, 10) ? { A: A, B: Bq, C: C, D: D } : null; });
      },
      stem: function (sh) { return 'Three vertices of parallelogram ' + t('ABCD') + ', named <b>in order</b>, are ' + nameList(['A', 'B', 'C'], [sh.A, sh.B, sh.C]) + '.'; },
      parts: [
        { id: 'e8a', level: 'PRG', outcome: 'EXT', make: function (r, sh) {
          var D = add(sh.A, sub(sh.C, sh.B)), Mac = mid(sh.A, sh.C);
          var p = B.pairs('(a) Use the fact that the diagonals of a parallelogram bisect each other to determine ' + t('D') + '.', [D], {}, 'In order, the diagonals are ' + t('AC') + ' and ' + t('BD') + '. ' + t(mW(sh.A, sh.C, 'AC')) + ', so ' + t(ptT(Mac)) + ' is also the midpoint of ' + t('BD') + '. With ' + t('D=(x,\\ y)') + ': ' + t('\\frac{' + nT(sh.B[0]) + '+x}{2}=' + nT(Mac[0])) + ' ⟹ ' + t('x=' + D[0]) + '; ' + t('\\frac{' + nT(sh.B[1]) + '+y}{2}=' + nT(Mac[1])) + ' ⟹ ' + t('y=' + D[1]) + '. So ' + t('D' + ptT(D)) + '.',
            ['Find the midpoint of diagonal ' + t('AC') + '. It is also the midpoint of ' + t('BD') + ' — work backwards for ' + t('D') + '.'], 'fourth vertex of a parallelogram');
          p.check = ptChk(D, [{ is: add(sh.A, sub(sh.B, sh.C)), code: 'fourth-other', hint: 'That point makes ' + t('AC') + ' a <b>side</b>. Named in order, ' + t('ABCD') + ' has diagonals ' + t('AC') + ' and ' + t('BD') + '.' }, { is: add(sh.C, sub(sh.B, sh.A)), code: 'fourth-other', hint: 'That point makes ' + t('B') + ' and ' + t('D') + ' neighbours of ' + t('C') + ' only. In order, the diagonals are ' + t('AC') + ' and ' + t('BD') + '.' }, { is: sub(scl(Mac, 2), sh.A), code: 'end-wrongway', hint: 'Work backwards from ' + t('B') + ', not ' + t('A') + ': ' + t('D') + ' is the other end of diagonal ' + t('BD') + '.' }]);
          p.answer = t('D' + ptT(D));
          return p;
        } },
        { id: 'e8b', level: 'PRG', outcome: 'EXT', make: function (r, sh) {
          var D = add(sh.A, sub(sh.C, sh.B));
          return FP('(b) Verify ' + t('D' + ptT(D)) + ' two further ways: ' + t('AB') + ' and ' + t('DC') + ' have equal slopes and equal lengths, and so do ' + t('BC') + ' and ' + t('AD') + '. Enter the common values.', [
            slopeBox('AB', sh.A, sh.B), lenBox('AB', sh.A, sh.B), slopeBox('BC', sh.B, sh.C), lenBox('BC', sh.B, sh.C)],
            t(slW(sh.A, sh.B, 'AB')) + ', ' + t(slW(D, sh.C, 'DC')) + ' ✓; ' + t('AB=DC=' + radT(n2(sh.A, sh.B))) + ' ✓<br>' + t(slW(sh.B, sh.C, 'BC')) + ', ' + t(slW(sh.A, D, 'AD')) + ' ✓; ' + t('BC=AD=' + radT(n2(sh.B, sh.C))) + ' ✓', [SLOPE_HINT, LEN_HINT], 'verify the parallelogram');
        } },
        { id: 'e8c', level: 'EMG', outcome: 'EXT', make: function (r, sh) {
          var D = add(sh.A, sub(sh.C, sh.B));
          return FP('(c) Determine the exact length of each diagonal.', [lenBox('AC', sh.A, sh.C), lenBox('BD', sh.B, D)], t(dW(sh.A, sh.C, 'AC')) + '<br>' + t(dW(sh.B, D, 'BD')), [LEN_HINT], 'parallelogram diagonals');
        } },
        { id: 'e8c2', sub: 'c, cont.', level: 'EMG', outcome: 'EXT', make: function (r, sh) {
          var D = add(sh.A, sub(sh.C, sh.B)), mAB = slopeOf(sh.A, sh.B), mBC = slopeOf(sh.B, sh.C);
          return mc(r, '(c) continued. Is ' + t('ABCD') + ' a rectangle?', [
            { html: '<b>No</b>: the diagonals are unequal, and ' + t('m_{AB}\\times m_{BC}=' + frT(mAB[0] * mBC[0], mAB[1] * mBC[1]) + '\\neq -1') + ', so ' + t('\\angle B') + ' is not right.', right: true },
            { html: '<b>Yes</b>: it is a parallelogram, and every parallelogram is a rectangle.', why: 'It’s the other way round: every rectangle is a parallelogram. A rectangle needs right angles too.' },
            { html: '<b>Yes</b>: opposite sides are equal.', why: 'Equal opposite sides only make a parallelogram. Check the diagonals or a corner.' },
            { html: '<b>No</b>: its diagonals don’t bisect each other.', why: 'They do bisect each other — that is how ' + t('D') + ' was found. The test for a rectangle is equal diagonals (or a right angle).' }],
            t('AC=' + radT(n2(sh.A, sh.C))) + ' and ' + t('BD=' + radT(n2(sh.B, D))) + ' are unequal, but a rectangle’s diagonals are equal. Slope test: ' + t('m_{AB}\\times m_{BC}=' + frT(mAB[0] * mBC[0], mAB[1] * mBC[1]) + '\\neq -1') + '. <b>Not a rectangle.</b>', ['A rectangle has equal diagonals and right angles.'], 'not a rectangle');
        } },
        { id: 'e8d', sub: 'd', level: 'EMG', outcome: 'EXT', make: function (r) {
          return mc(r, '(d) Three vertices of a parallelogram can give <b>three</b> possible fourth vertices. Here there is only one. What wording removed the other two?', [
            { html: 'The words “<b>in order</b>”: naming it ' + t('ABCD') + ' in order makes ' + t('AC') + ' and ' + t('BD') + ' the diagonals.', right: true },
            { html: 'The word “parallelogram”: a parallelogram has only one fourth vertex.', why: 'Without “in order”, any of ' + t('AB') + ', ' + t('AC') + ' or ' + t('BC') + ' could be a diagonal — three different parallelograms.' },
            { html: 'The fact that the diagonals bisect each other.', why: 'That is true for every choice of diagonal. It is the order of the letters that fixes which segments are diagonals.' },
            { html: 'The coordinates are whole numbers.', why: 'All three possible fourth vertices have whole-number coordinates here.' }],
            '“In order” makes ' + t('AC') + ' and ' + t('BD') + ' the diagonals. Without it, any of ' + t('AB') + ', ' + t('AC') + ' or ' + t('BC') + ' could be a diagonal, and each choice gives a different fourth vertex.', ['Which segments are the diagonals? What decides that?'], '“in order” wording');
        } }] },
    { num: '9', shared: function (r) {
        if (book(r)) return { A: [-2, -1], B: [6, 3], c: 0 };
        return rep(r, function () {
          var A = [-r.int(1, 5), r.int(-5, 3)], Bq = [r.int(2, 8), r.int(-3, 6)], c = 0, m = slopeOf(A, Bq); if (!m || m[0] === 0) return null;
          var ka = A[1] - (m[1] / m[0]) * (c - A[0]), kd = A[1] + mval(m) * (c - A[0]);
          var sb = A[1] + Bq[1], pr = A[1] * Bq[1] + (c - A[0]) * (c - Bq[0]), disc = sb * sb - 4 * pr; if (disc <= 0) return null;
          var sq = Math.round(Math.sqrt(disc)); if (sq * sq !== disc || (sb + sq) % 2) return null;
          var k1 = (sb + sq) / 2, k2 = (sb - sq) / 2;
          if (!Number.isInteger(ka) || !Number.isInteger(kd) || [ka, kd, k1, k2].some(function (k) { return Math.abs(k) > 14; })) return null;
          return { A: A, B: Bq, c: c };
        });
      },
      stem: function (sh) { return t('A') + ' is the point ' + t(ptT(sh.A)) + ', ' + t('B') + ' is the point ' + t(ptT(sh.B)) + ', and ' + t('C') + ' is the point ' + t('(' + sh.c + ',\\ k)') + '.'; },
      parts: [
        { id: 'e9a', level: 'ADV', outcome: 'RF3', make: function (r, sh) {
          var m = slopeOf(sh.A, sh.B), pp = perpOf(m), k = sh.A[1] + mval(pp) * (sh.c - sh.A[0]), kPar = sh.A[1] + mval(m) * (sh.c - sh.A[0]);
          return B.number('(a) Determine the value of ' + t('k') + ' for which ' + t('\\triangle ABC') + ' has a right angle <b>at ' + t('A') + '</b>.', k, function (v) {
            if (near(v, kPar)) return { code: 'par-used', hint: 'That makes ' + t('C') + ' collinear with ' + t('A') + ' and ' + t('B') + ' (equal slopes). A right angle at ' + t('A') + ' needs ' + t('m_{AC}') + ' to be the <b>negative reciprocal</b> of ' + t('m_{AB}') + '.' };
            var kn = sh.A[1] - mval(pp) * (sh.c - sh.A[0]); if (near(v, kn)) return { code: 'k-sign', hint: 'Check the run: from ' + t('A') + ' to ' + t('C') + ' it is ' + t(sh.c + '-' + par(sh.A[0])) + '.' };
            return null;
          }, t(slW(sh.A, sh.B, 'AB')) + '. A right angle at ' + t('A') + ' means ' + t('AC\\perp AB') + ', so ' + t('m_{AC}=' + sT(pp)) + '.<br>' + t('m_{AC}=\\dfrac{k-' + par(sh.A[1]) + '}{' + sh.c + '-' + par(sh.A[0]) + '}=' + dfr(sT(pp))) + ' ⟹ ' + t('k=' + k) + '.', ['The two arms of the right angle at ' + t('A') + ' are ' + t('AB') + ' and ' + t('AC') + '. Their slopes are negative reciprocals.'], 'right angle at A: find k');
        } },
        { id: 'e9b', level: 'MAS', outcome: 'RF3', make: function (r, sh) {
          var A = sh.A, Bq = sh.B, c = sh.c, sb = A[1] + Bq[1], pr = A[1] * Bq[1] + (c - A[0]) * (c - Bq[0]), sq = Math.sqrt(sb * sb - 4 * pr), k1 = (sb + sq) / 2, k2 = (sb - sq) / 2;
          var ra = c - A[0], rb = c - Bq[0];
          return B.valueSet('(b) Determine <b>all</b> values of ' + t('k') + ' for which ' + t('\\triangle ABC') + ' has a right angle <b>at ' + t('C') + '</b>.', [k1, k2], { v: 'k' },
            t('m_{CA}=\\dfrac{k-' + par(A[1]) + '}{' + c + '-' + par(A[0]) + '}') + ', ' + t('m_{CB}=\\dfrac{k-' + par(Bq[1]) + '}{' + c + '-' + par(Bq[0]) + '}') + '. Right angle at ' + t('C') + ': ' + t('m_{CA}\\times m_{CB}=-1') + ', so ' + t('(k-' + par(A[1]) + ')(k-' + par(Bq[1]) + ')=-(' + ra + ')(' + rb + ')=' + (-ra * rb)) + '.<br>' + t('k^{2}' + (sb ? (sb > 0 ? '-' : '+') + Math.abs(sb) + 'k' : '') + (pr ? (pr > 0 ? '+' : '-') + Math.abs(pr) : '') + '=0') + ' ⟹ ' + t('(k-' + par(k1) + ')(k-' + par(k2) + ')=0') + ', so ' + t('k=' + k1) + ' or ' + t('k=' + k2) + '.',
            ['Both arms of the right angle start at ' + t('C(' + c + ',\\ k)') + ', so ' + t('k') + ' appears in both slopes. Set their product equal to ' + t('-1') + '.', 'You will get a quadratic in ' + t('k') + ' — factor it.'], 'right angle at C: quadratic');
        } },
        { id: 'e9c', level: 'PRG', outcome: 'RF3', make: function (r) {
          return mc(r, '(c) Asking for the right angle at ' + t('A') + ' gives one value of ' + t('k') + ', but asking for it at ' + t('C') + ' gives two. Why does “the right angle is at ' + t('C') + '” produce a quadratic?', [
            { html: 'At ' + t('C') + ', <b>both</b> arms of the angle start at ' + t('C(0,\\ k)') + ', so ' + t('k') + ' appears in both slopes; multiplying them makes a ' + t('k^{2}') + ' term.', right: true },
            { html: 'Because ' + t('C') + ' is on the ' + t('y') + '-axis, its slope is squared.', why: 'Where ' + t('C') + ' sits doesn’t square anything. Count how many slopes contain ' + t('k') + '.' },
            { html: 'Because a right angle always gives two answers.', why: 'Part (a) was also a right angle and had one answer. What is different about the two arms at ' + t('C') + '?' },
            { html: 'Because the perpendicular test uses ' + t('-1') + ', and ' + t('(-1)^{2}=1') + '.', why: 'The ' + t('-1') + ' isn’t squared. The ' + t('k^{2}') + ' comes from multiplying two expressions that both contain ' + t('k') + '.' }],
            'At ' + t('A') + ', one arm (' + t('AB') + ') is fixed, so only ' + t('m_{AC}') + ' contains ' + t('k') + ': a linear equation. At ' + t('C') + ', both slopes contain ' + t('k') + ', and their product has a ' + t('k^{2}') + ' term: a quadratic, with up to two solutions.', ['How many of the two slopes contain ' + t('k') + ' in each case?'], 'why a quadratic');
        } },
        { id: 'e9d', level: 'PRG', outcome: 'RF3', make: function (r, sh) {
          var m = slopeOf(sh.A, sh.B), k = sh.A[1] + mval(m) * (sh.c - sh.A[0]), pp = perpOf(m), kPerp = sh.A[1] + mval(pp) * (sh.c - sh.A[0]);
          return B.number('(d) Determine the value of ' + t('k') + ' for which ' + t('A') + ', ' + t('B') + ' and ' + t('C') + ' are <b>collinear</b> (no triangle at all).', k, function (v) {
            if (near(v, kPerp)) return { code: 'perp-noflip', hint: 'That is the right-angle answer from (a). Collinear needs <b>equal</b> slopes: ' + t('m_{AC}=m_{AB}') + '.' };
            return null;
          }, 'Collinear means ' + t('m_{AC}=m_{AB}=' + sT(m)) + ': ' + t('\\dfrac{k-' + par(sh.A[1]) + '}{' + sh.c + '-' + par(sh.A[0]) + '}=' + dfr(sT(m))) + ' ⟹ ' + t('k=' + k) + '. Slope settles it — the same tool as (a), since collinear and perpendicular are both claims about direction.', ['Set ' + t('m_{AC}') + ' equal to ' + t('m_{AB}') + '.'], 'collinear: find k');
        } }] },
    { num: '10', shared: function (r) {
        if (book(r)) return { A: [-6, 2], B: [4, 8] };
        return rep(r, function () { var A = [r.int(-8, -2), r.int(-4, 4)], Bq = [r.int(1, 8), r.int(-2, 9)]; if ((A[0] + Bq[0]) % 2 || (A[1] + Bq[1]) % 2) return null; var m = slopeOf(A, Bq); if (!m || m[0] === 0) return null; var pp = perpOf(m), M = mid(A, Bq), Pp = add(M, [pp[1], pp[0]]); return Math.abs(pp[0]) <= 8 && pp[1] <= 8 && inBox([Pp], -11, 11) ? { A: A, B: Bq } : null; });
      },
      stem: function (sh) { return t('A') + ' is the point ' + t(ptT(sh.A)) + ' and ' + t('B') + ' is the point ' + t(ptT(sh.B)) + '.'; },
      parts: [
        { id: 'e10a', level: 'BEG', outcome: 'EXT', make: function (r, sh) {
          var p = B.pairs('(a) One point equidistant from ' + t('A') + ' and ' + t('B') + ' is obvious: the midpoint of ' + t('AB') + '. State it.', [mid(sh.A, sh.B)], {}, t(mW(sh.A, sh.B, 'AB')) + ' — halfway along ' + t('AB') + ', so it is equally far from ' + t('A') + ' and ' + t('B') + '.', [MID_HINT], 'midpoint of AB');
          p.check = midChk(sh.A, sh.B); p.answer = t(ptT(mid(sh.A, sh.B))); return p;
        } },
        { id: 'e10b', level: 'EMG', outcome: 'RF3', make: function (r, sh) {
          var m = slopeOf(sh.A, sh.B), pp = perpOf(m);
          return FP('(b) Determine the slope of ' + t('AB') + ', then the slope of any line perpendicular to ' + t('AB') + '.', [slopeBox('AB', sh.A, sh.B),
            fb(t('m_{\\perp}='), sChk(pp, function (v) { if (near(v, -mval(m))) return { code: 'perp-noflip', hint: 'You changed the sign — now also take the reciprocal (flip the fraction).' }; if (near(v, 1 / mval(m))) return { code: 'perp-nosign', hint: 'You flipped the fraction — now also change the sign.' }; return null; }), sT(pp), { name: t('m_{\\perp}') })],
            t(slW(sh.A, sh.B, 'AB')) + '. Perpendicular slope: the negative reciprocal, ' + t(dfr(sT(pp))) + '.', [SLOPE_HINT], 'slope and perpendicular slope');
        } },
        { id: 'e10c', level: 'PRG', outcome: 'RF3', make: function (r, sh) {
          var m = slopeOf(sh.A, sh.B), pp = perpOf(m), M = mid(sh.A, sh.B), st = [pp[1], pp[0]], P1 = add(M, st), P2 = sub(M, st);
          return { prompt: '(c) Starting from the midpoint ' + t(ptT(M)) + ', step off one run and one rise of the perpendicular slope ' + t(sT(pp)) + ' to reach a second point. State its coordinates.', input: { type: 'math', keys: 'pairs', placeholder: '(x, y)' },
            key: ptK(P1), answer: t(ptT(P1)) + ' (or ' + t(ptT(P2)) + ')', good: [ptK(P2)], text: 'step along the perpendicular slope',
            check: function (resp) {
              var q = readPt(resp); if (!q) return K.pairs([P1])(resp);
              if (samePt(q, P1) || samePt(q, P2)) return ok();
              var dq = sub(q, M);
              if (!samePt(q, M) && near(dq[0] * st[1], dq[1] * st[0])) return form('step-multiple', 'That point is on the perpendicular line — but take exactly <b>one</b> run and <b>one</b> rise: ' + t(dfr(sT(pp)) + '=\\dfrac{' + st[1] + '}{' + st[0] + '}') + '.');
              if (samePt(q, add(M, [m[1], m[0]])) || samePt(q, sub(M, [m[1], m[0]]))) return wrong('step-slope', 'You stepped with the slope of ' + t('AB') + ' — that stays on ' + t('AB') + '. Use the perpendicular slope ' + t(sT(pp)) + '.');
              if (samePt(q, add(M, [st[1], st[0]])) || samePt(q, sub(M, [st[1], st[0]]))) return wrong('slope-flip', 'Run goes across (' + t('x') + '), rise goes up or down (' + t('y') + '): ' + t(dfr(sT(pp))) + ' means run ' + t(st[0]) + ', rise ' + t(st[1]) + '.');
              return wrong('value', null);
            },
            solution: t(dfr(sT(pp)) + '=\\dfrac{' + st[1] + '}{' + st[0] + '}') + ': run ' + t(st[0]) + ', rise ' + t(st[1]) + '. ' + t('(' + nT(M[0]) + '+' + st[0] + ',\\ ' + nT(M[1]) + (st[1] < 0 ? '' : '+') + st[1] + ')=' + ptT(P1)) + '. (Stepping the other way gives ' + t(ptT(P2)) + ', which also works.)',
            hints: ['Write the perpendicular slope as rise over run, then add the run to ' + t('x') + ' and the rise to ' + t('y') + '.'] };
        } },
        { id: 'e10d', level: 'EMG', outcome: 'EXT', make: function (r, sh) {
          var m = slopeOf(sh.A, sh.B), pp = perpOf(m), M = mid(sh.A, sh.B), Pp = add(M, [pp[1], pp[0]]);
          return FP('(d) Verify with the distance formula that ' + t('P' + ptT(Pp)) + ' (from (c)) is equidistant from ' + t('A') + ' and ' + t('B') + '. Give both distances exactly.', [lenBox('PA', Pp, sh.A), lenBox('PB', Pp, sh.B)],
            t(dW(Pp, sh.A, 'PA')) + '<br>' + t(dW(Pp, sh.B, 'PB')) + '<br>Equal ✓', [LEN_HINT], 'equidistant check');
        } },
        { id: 'e10e', level: 'PRG', outcome: 'RF3', make: function (r, sh) {
          var m = slopeOf(sh.A, sh.B), pp = perpOf(m), M = mid(sh.A, sh.B);
          return mc(r, '(e) Describe <b>all</b> the points equidistant from ' + t('A') + ' and ' + t('B') + '.', [
            { html: 'The <b>perpendicular bisector</b> of ' + t('AB') + ': the whole line through ' + t(ptT(M)) + ' with slope ' + t(sT(pp)) + ' — the midpoint fixes where it passes, the slope fixes its direction.', right: true },
            { html: 'Just the two points ' + t(ptT(M)) + ' and the point from (c).', why: 'Keep stepping off the same run and rise — every point you reach is equidistant too. It is a whole line.' },
            { html: 'The line through ' + t(ptT(M)) + ' with slope ' + t(sT(m)) + '.', why: 'That is line ' + t('AB') + ' itself. Points on it (other than the midpoint) are closer to one end.' },
            { html: 'A circle centred at ' + t(ptT(M)) + '.', why: 'A circle is equidistant from its <b>centre</b>, not from two given points.' }],
            'They form the perpendicular bisector of ' + t('AB') + ': the line through the midpoint ' + t(ptT(M)) + ' with the negative reciprocal slope ' + t(sT(pp)) + '. One point and one direction pin down one line.', ['Which point did (a) give, and which direction did (b) give?'], 'perpendicular bisector');
        } }] },
    { num: '11', shared: function (r) {
        if (book(r)) return { M: [-2, 3], S: [4, -5] };
        return rep(r, function () { var M = [r.int(-5, 3), r.int(-3, 5)], S = [r.int(-2, 7), r.int(-8, 2)], T = sub(scl(M, 2), S); return !samePt(M, S) && inBox([T], -12, 12) && M[0] !== S[0] && M[1] !== S[1] ? { M: M, S: S } : null; });
      },
      stem: function (sh) { return t('M' + ptT(sh.M)) + ' is the midpoint of ' + t('\\overline{ST}') + ', and ' + t('S') + ' is the point ' + t(ptT(sh.S)) + '.'; },
      parts: [
        { id: 'e11a', level: 'EMG', outcome: 'EXT', make: function (r, sh) {
          var T = sub(scl(sh.M, 2), sh.S);
          var p = B.pairs('(a) Determine the coordinates of ' + t('T') + '.', [T], {}, t('M') + ' is the average of ' + t('S') + ' and ' + t('T=(x,\\ y)') + ': ' + t('\\frac{' + nT(sh.S[0]) + '+x}{2}=' + nT(sh.M[0])) + ' ⟹ ' + t('x=' + T[0]) + '; ' + t('\\frac{' + nT(sh.S[1]) + '+y}{2}=' + nT(sh.M[1])) + ' ⟹ ' + t('y=' + T[1]) + '. So ' + t('T' + ptT(T)) + '.', ['Set up one equation for each coordinate: ' + t('\\frac{x_S+x}{2}=x_M') + '.'], 'endpoint from a midpoint');
          p.check = endChk(sh.M, sh.S); p.answer = t('T' + ptT(T)); return p;
        } },
        { id: 'e11b', level: 'EMG', outcome: 'EXT', make: function (r, sh) {
          var T = sub(scl(sh.M, 2), sh.S);
          return FP('(b) The other endpoint is ' + t('T' + ptT(T)) + '. Check it with distances: calculate ' + t('SM') + ', ' + t('MT') + ' and ' + t('ST') + ' exactly.', [lenBox('SM', sh.S, sh.M), lenBox('MT', sh.M, T), lenBox('ST', sh.S, T)],
            t(dW(sh.S, sh.M, 'SM')) + '<br>' + t(dW(sh.M, T, 'MT')) + '<br>' + t(dW(sh.S, T, 'ST')) + '<br>' + t('SM=MT') + ' (equidistant) and ' + t('SM+MT=ST') + ' (' + t('M') + ' lies on the segment): ' + t('M') + ' is the midpoint ✓', [LEN_HINT], 'midpoint check by distances');
        } },
        { id: 'e11c', level: 'PRG', outcome: 'EXT', make: function (r, sh) {
          return mc(r, '(c) Equal distances alone (' + t('SM=MT') + ') would not prove ' + t('M') + ' is the midpoint. What is the second condition, and which tool checks it?', [
            { html: t('M') + ' must lie <b>on</b> ' + t('ST') + ' (collinear with ' + t('S') + ' and ' + t('T') + '); <b>slope</b> checks it: ' + t('m_{SM}=m_{MT}') + '.', right: true },
            { html: t('M') + ' must have whole-number coordinates; the midpoint formula checks it.', why: 'Midpoints can have fractional coordinates. The missing condition is about lying on the segment.' },
            { html: t('SM') + ' must be shorter than ' + t('ST') + '; distance checks it.', why: 'Every point of the perpendicular bisector near the segment satisfies that. It must lie <b>on</b> ' + t('ST') + '.' },
            { html: 'The slopes ' + t('m_{SM}') + ' and ' + t('m_{MT}') + ' must multiply to ' + t('-1') + '.', why: 'That would be a right angle at ' + t('M') + '. On a straight segment the slopes are <b>equal</b>.' }],
            'Every point of the perpendicular bisector of ' + t('ST') + ' is equidistant from ' + t('S') + ' and ' + t('T') + ', but only one of them is on the segment. ' + t('M') + ' must also be collinear with ' + t('S') + ' and ' + t('T') + ': ' + t(slW(sh.S, sh.M, 'SM')) + ', equal to ' + t('m_{MT}') + ' ✓.', ['Picture all the points equally far from ' + t('S') + ' and ' + t('T') + '. Which one is the midpoint?'], 'midpoint needs collinearity');
        } }] },
    /* ---------- Part E — Reasoning and error analysis ---------- */
    { num: '12', section: 'Extra practice E — Reasoning and Error Analysis', shared: function (r) {
        if (book(r)) return { A: [-4, -3], B: [2, 1], s: [3, 0] };
        return rep(r, function () { var f = r.pick([[2, 3], [1, 2], [3, 4], [1, 3], [3, 2], [-2, 3], [-1, 2]]), k = r.int(1, 2), A = [r.int(-6, -2), r.int(-5, 1)], Bq = add(A, [f[1] * k, f[0] * k]), s = r.pick([[r.int(2, 4), 0], [0, r.pick([-3, -2, 2, 3])], [r.int(1, 3), r.pick([-2, 2])]]);
          if (sameSlope(slopeOf([0, 0], s), slopeOf(A, Bq))) return null; return inBox([Bq, add(Bq, s), add(A, s)], -9, 9) ? { A: A, B: Bq, s: s } : null; });
      },
      stem: function (sh) { var C = add(sh.A, sh.s), D = add(sh.B, sh.s), m = slopeOf(sh.A, sh.B); return 'A student writes: “' + t('AB') + ' joins ' + t('A' + ptT(sh.A)) + ' to ' + t('B' + ptT(sh.B)) + ' and ' + t('CD') + ' joins ' + t('C' + ptT(C)) + ' to ' + t('D' + ptT(D)) + '. Both slopes are ' + t(sT(m)) + ', so ' + t('AB') + ' and ' + t('CD') + ' are the same line.”'; },
      parts: [
        { id: 'e12a', level: 'BEG', outcome: 'RF3', make: function (r, sh) {
          var C = add(sh.A, sh.s), D = add(sh.B, sh.s);
          return FP('(a) Confirm that the two slopes really are equal.', [slopeBox('AB', sh.A, sh.B), slopeBox('CD', C, D)], t(slW(sh.A, sh.B, 'AB')) + '<br>' + t(slW(C, D, 'CD')) + '<br>Equal ✓', [SLOPE_HINT], 'confirm equal slopes');
        } },
        { id: 'e12b', level: 'EMG', outcome: 'RF3', make: function (r, sh) {
          var C = add(sh.A, sh.s), m = slopeOf(sh.A, C);
          return B.slope('(b) The conclusion is still false. Test whether ' + t('C') + ' lies on line ' + t('AB') + ': find ' + t('m_{AC}') + ' and compare it with ' + t('m_{AB}') + '.', m, { before: 'm_{AC}=' }, t(slW(sh.A, C, 'AC')) + ' ' + t('\\neq ' + sT(slopeOf(sh.A, sh.B)) + '=m_{AB}') + ', so ' + t('C') + ' is <b>not</b> on line ' + t('AB') + ': the segments lie on two different lines.', [SLOPE_HINT], 'test C on line AB');
        } },
        { id: 'e12c', level: 'EMG', outcome: 'RF3', make: function (r) {
          return mc(r, '(c) Which rewrite of the student’s sentence is true?', [
            { html: '“Both slopes are equal, so ' + t('AB') + ' and ' + t('CD') + ' are <b>parallel</b>; since ' + t('C') + ' is not on line ' + t('AB') + ', they are <b>distinct</b> parallel segments.”', right: true },
            { html: '“Both slopes are equal, so ' + t('AB') + ' and ' + t('CD') + ' are perpendicular.”', why: 'Perpendicular slopes multiply to ' + t('-1') + '; equal slopes mean parallel.' },
            { html: '“Both slopes are equal, so ' + t('AB') + ' and ' + t('CD') + ' are the same length.”', why: 'Slope says nothing about length — that needs the distance formula.' },
            { html: '“Both slopes are equal, but ' + t('C') + ' is not on line ' + t('AB') + ', so the segments are not parallel.”', why: 'Equal slopes do make them parallel. Being off the line only makes them <b>distinct</b>.' }],
            'Equal slopes ⟹ parallel. ' + t('C') + ' is not on line ' + t('AB') + ' ⟹ distinct. So: two distinct parallel segments.', ['Equal slopes give one relationship; (b) gives the other.'], 'parallel and distinct');
        } },
        { id: 'e12d', level: 'EMG', outcome: 'RF3', make: function (r) {
          return mc(r, '(d) What one extra check upgrades “equal slopes” to “same line”?', [
            { html: 'Check that <b>one point</b> of ' + t('CD') + ' lies on line ' + t('AB') + ' (e.g. ' + t('m_{AC}=m_{AB}') + '): a line is fixed by a direction and one point.', right: true },
            { html: 'Check that the segments have equal lengths.', why: 'Equal lengths don’t put them on the same line — two parallel segments can be equal and far apart.' },
            { html: 'Check that both slopes are in lowest terms.', why: 'Lowest terms doesn’t change the value of a slope.' },
            { html: 'Check every point of ' + t('CD') + ' against line ' + t('AB') + '.', why: 'Equal slopes already give the same direction, so <b>one</b> shared point is enough.' }],
            'Equal slopes give the same direction. If the lines also share a single point, they must be the same line: a line is fixed by one point and a direction.', ['A line is determined by a point and a slope.'], 'one shared point');
        } }] },
    { num: '13', stem: 'Decide whether each statement is true or false.', parts: [
      /* each part has a true and a false version, so the right answer isn't always the same button */
      { id: 'e13a', level: 'EMG', outcome: 'EXT', make: function (r) {
        var s = book(r) ? 0 : r.int(0, 2), q5 = t('A(-4,\\ -2),\\ B(1,\\ -2),\\ C(4,\\ 2),\\ D(-1,\\ 2)');
        if (s === 2) return B.tf(r, '(a) “A rhombus is always a parallelogram.”', true, 'A rhombus has four equal sides, so both pairs of opposite sides are equal — that always makes a parallelogram (e.g. ' + q5 + ': ' + t('m_{AB}=m_{CD}=0') + ', ' + t('m_{BC}=m_{DA}=\\frac{4}{3}') + ').', '<b>True.</b> Four equal sides means both pairs of opposite sides are equal, and that makes a parallelogram. For example ' + q5 + ' (all sides ' + t('5') + ') has ' + t('m_{AB}=m_{CD}=0') + ' and ' + t('m_{BC}=m_{DA}=\\frac{4}{3}') + ': both pairs parallel.', ['What does a parallelogram need? Does every rhombus have it?'], 'rhombus always parallelogram?');
        return s === 0 ? B.tf(r, '(a) “A rhombus is always a square.”', false, 'A rhombus needs only four equal sides: e.g. ' + q5 + ' has four sides of length ' + t('5') + ' but ' + t('m_{AB}\\times m_{BC}=0\\times\\frac{4}{3}=0\\neq -1') + ': no right angle, so it isn’t a square.', '<b>False.</b> Counterexample: a rhombus with no right angle, e.g. ' + q5 + ' (the booklet’s Question 5): sides all ' + t('5') + ', ' + t('m_{AB}=0') + ', ' + t('m_{BC}=\\frac{4}{3}') + ', and ' + t('BC') + ' isn’t vertical.', ['Is there a rhombus without a right angle?'], 'rhombus always square?')
          : B.tf(r, '(a) “A rectangle is always a square.”', false, 'A rectangle needs right angles, not equal sides: e.g. ' + t('(0,\\ 0),\\ (6,\\ 0),\\ (6,\\ 2),\\ (0,\\ 2)') + ' has sides ' + t('6') + ' and ' + t('2') + '.', '<b>False.</b> Counterexample: ' + t('(0,\\ 0),\\ (6,\\ 0),\\ (6,\\ 2),\\ (0,\\ 2)') + ' — right angles, but sides ' + t('6\\neq 2') + '.', ['Is there a rectangle whose sides aren’t all equal?'], 'rectangle always square?');
      } },
      { id: 'e13b', level: 'EMG', outcome: 'EXT', make: function (r) {
        var s = book(r) ? 0 : r.int(0, 2), pg = t('(0,\\ 0),\\ (4,\\ 0),\\ (5,\\ 2),\\ (1,\\ 2)');
        if (s === 2) return B.tf(r, '(b) “A parallelogram is always a rectangle.”', false, 'A parallelogram needs only parallel opposite sides: e.g. ' + pg + ' has slopes ' + t('0') + ' and ' + t('2') + ' at each corner — product ' + t('0\\neq -1') + ', so no right angle.', '<b>False.</b> Counterexample: ' + pg + '. Opposite sides have slopes ' + t('0, 0') + ' and ' + t('2, 2') + ' (a parallelogram), but ' + t('0\\times 2=0\\neq -1') + ' and no side is vertical: no right angle, so it isn’t a rectangle.', ['Is there a parallelogram without a right angle?'], 'parallelogram always rectangle?');
        return s === 0 ? B.tf(r, '(b) “A square is always a rhombus.”', true, 'A square has four equal sides — that is all “rhombus” requires.', '<b>True.</b> A square has four equal sides, which is all a rhombus needs. A square is a rhombus that also has right angles.', ['What does a rhombus need? Does every square have it?'], 'square always rhombus?')
          : B.tf(r, '(b) “A square is always a rectangle.”', true, 'A square has four right angles — that is all “rectangle” requires.', '<b>True.</b> A square has four right angles, which is all a rectangle needs. A square is a rectangle that also has equal sides.', ['What does a rectangle need? Does every square have it?'], 'square always rectangle?');
      } },
      { id: 'e13c', level: 'PRG', outcome: 'EXT', make: function (r) {
        var s = book(r) ? 0 : r.int(0, 2);
        if (s === 2) return B.tf(r, '(c) “If the diagonals of a quadrilateral bisect each other <b>and</b> are perpendicular, it is a rhombus.”', true, 'Diagonals that bisect each other make a parallelogram; perpendicular diagonals then make all four sides equal — a rhombus.', '<b>True.</b> Diagonals that bisect each other make a parallelogram. If they are also perpendicular, the four triangles around the centre are congruent right triangles, so all four sides (their hypotenuses) are equal: a <b>rhombus</b>. (Perpendicular alone is not enough — a kite has perpendicular diagonals.)', ['Bisecting diagonals give which shape? What do perpendicular diagonals add?'], 'bisecting + perpendicular diagonals → rhombus?');
        return s === 0 ? B.tf(r, '(c) “If the diagonals of a quadrilateral are perpendicular, it is a rhombus.” (Try ' + t('K(0,\\ 6),\\ L(3,\\ 2),\\ M(0,\\ -4),\\ N(-3,\\ 2)') + '.)', false, 'Test the suggested points: ' + t('KM') + ' is vertical and ' + t('LN') + ' horizontal (perpendicular), but ' + t('KL=5') + ' while ' + t('LM=3\\sqrt{5}') + ' — not a rhombus.', '<b>False.</b> ' + t('KM') + ' is vertical and ' + t('LN') + ' is horizontal, so the diagonals are perpendicular. But ' + t('KL=\\sqrt{3^{2}+(-4)^{2}}=5') + ' and ' + t('LM=\\sqrt{(-3)^{2}+(-6)^{2}}=3\\sqrt{5}') + ': the sides aren’t all equal (it is a kite). The diagonals don’t bisect each other: midpoints ' + t('(0,\\ 1)') + ' and ' + t('(0,\\ 2)') + '.', ['Calculate two side lengths of the suggested figure.'], 'perpendicular diagonals → rhombus?')
          : B.tf(r, '(c) “If the diagonals of a quadrilateral are equal, it is a rectangle.” (Think of Question 6’s trapezoid.)', false, 'Question 6’s isosceles trapezoid has equal diagonals but isn’t a rectangle — its diagonals don’t bisect each other.', '<b>False.</b> An isosceles trapezoid (Question 6) has equal diagonals, but its diagonals have different midpoints, so it isn’t even a parallelogram. Equal diagonals give a rectangle only when they also bisect each other.', ['Do you know a shape with equal diagonals that isn’t a rectangle?'], 'equal diagonals → rectangle?');
      } },
      { id: 'e13d', level: 'PRG', outcome: 'EXT', make: function (r) {
        var s = book(r) ? 0 : r.int(0, 2);
        if (s === 2) return B.tf(r, '(d) “If two segments have equal lengths and are perpendicular, their four endpoints form a square.”', false, 'They must also share a midpoint: e.g. ' + t('(-2,\\ 1)') + ' to ' + t('(2,\\ 1)') + ' and ' + t('(0,\\ 0)') + ' to ' + t('(0,\\ 4)') + ' are equal and perpendicular, but their midpoints differ.', '<b>False.</b> Counterexample: ' + t('(-2,\\ 1)') + ' to ' + t('(2,\\ 1)') + ' and ' + t('(0,\\ 0)') + ' to ' + t('(0,\\ 4)') + ': both have length ' + t('4') + ', one is horizontal and one vertical (perpendicular), but their midpoints ' + t('(0,\\ 1)') + ' and ' + t('(0,\\ 2)') + ' differ, so they don’t bisect each other. The endpoints form a kite with sides ' + t('\\sqrt{5}') + ' and ' + t('\\sqrt{13}') + ' — not a square.', ['Equal and perpendicular diagonals — but do they bisect each other?'], 'equal + perpendicular → square?');
        return s === 0 ? B.tf(r, '(d) “If two segments have equal lengths and share a midpoint, their four endpoints form a rectangle.”', true, 'Sharing a midpoint makes them the diagonals of a parallelogram; equal diagonals make it a rectangle.', '<b>True.</b> Sharing a midpoint means the segments bisect each other, so the endpoints form a parallelogram with them as diagonals; equal diagonals make it a rectangle. (It is a square only if the segments are also perpendicular — e.g. ' + t('(-5,\\ 0)') + ' to ' + t('(5,\\ 0)') + ' and ' + t('(-3,\\ -4)') + ' to ' + t('(3,\\ 4)') + ' give a rectangle that isn’t a square.)', ['Diagonals that bisect each other make which shape? Equal diagonals add what?'], 'equal + shared midpoint → rectangle?')
          : B.tf(r, '(d) “If two segments that are not on the same line share a midpoint, their four endpoints form a parallelogram.”', true, 'Diagonals that bisect each other always make a parallelogram.', '<b>True.</b> Sharing a midpoint means the segments bisect each other, and a quadrilateral whose diagonals bisect each other is a parallelogram.', ['What do a parallelogram’s diagonals always do?'], 'shared midpoint → parallelogram?');
      } }] },
    { num: '14', shared: function (r) { return rightScaleneTri(r, book(r)); },
      stem: function (sh) { return 'A student claims: “The midpoint of the hypotenuse is the centre of the triangle.” Test it on ' + t('\\triangle GHJ') + ' with ' + nameList(['G', 'H', 'J'], [sh.G, sh.H, sh.J]) + ' (right angle at ' + t('H') + ').'; },
      parts: [
        { id: 'e14a', level: 'EMG', outcome: 'EXT', make: function (r, sh) {
          var M = mid(sh.G, sh.J);
          return mc(r, '(a) The claim is half right. Which “centre” is the midpoint of the hypotenuse, ' + t('M' + ptT(M)) + ', really?', [
            { html: 'The <b>circumcentre</b>: it is equally far from all three vertices (centre of the circle through them).', right: true },
            { html: 'The <b>centroid</b>: the balance point of the triangle.', why: 'The centroid is the average of the three vertices — part (b) shows it is a different point.' },
            { html: 'The midpoint of the <b>right angle</b>.', why: 'An angle has no midpoint. Think about the distances ' + t('MG') + ', ' + t('MH') + ', ' + t('MJ') + '.' },
            { html: 'It isn’t any kind of centre.', why: 'Question 7(d) showed ' + t('MG=MH=MJ') + ': it is the centre of the circle through all three vertices.' }],
            'In Question 7(d), ' + t('MG=MH=MJ') + ', so ' + t('M') + ' is equidistant from all three vertices: the <b>circumcentre</b>. It is not the balance point.', ['What did ' + t('MG=MH=MJ') + ' tell you in Question 7?'], 'circumcentre');
        } },
        { id: 'e14b', level: 'EMG', outcome: 'EXT', make: function (r, sh) {
          var G = sh.G, H = sh.H, J = sh.J, Cn = [(G[0] + H[0] + J[0]) / 3, (G[1] + H[1] + J[1]) / 3];
          var p = B.pairs('(b) The balance point — the <b>centroid</b> — is the average of all three vertices, ' + t('\\left(\\dfrac{x_1+x_2+x_3}{3},\\ \\dfrac{y_1+y_2+y_3}{3}\\right)') + '. Calculate it.', [Cn], {}, t('\\left(\\dfrac{' + G[0] + '+' + par(H[0]) + '+' + par(J[0]) + '}{3},\\ \\dfrac{' + G[1] + '+' + par(H[1]) + '+' + par(J[1]) + '}{3}\\right)=' + ptT(Cn)), ['Add the three ' + t('x') + '-coordinates and divide by ' + t('3') + '; the same for ' + t('y') + '.'], 'centroid');
          p.check = ptChk(Cn, [{ is: [(G[0] + H[0] + J[0]) / 2, (G[1] + H[1] + J[1]) / 2], code: 'mid-sum', hint: 'Divide each sum by ' + t('3') + ' — there are three vertices.' }, { is: [G[0] + H[0] + J[0], G[1] + H[1] + J[1]], code: 'mid-sum', hint: 'You added the coordinates — now divide each sum by ' + t('3') + '.' }]);
          p.answer = t(ptT(Cn)); return p;
        } },
        { id: 'e14c', level: 'PRG', outcome: 'EXT', make: function (r, sh) {
          var G = sh.G, H = sh.H, J = sh.J, Cn = [(G[0] + H[0] + J[0]) / 3, (G[1] + H[1] + J[1]) / 3];
          if (n2(Cn, H, 3) === n2(Cn, G, 3)) throw new Error('centroid equidistant');
          return FP('(c) Check that the centroid ' + t('Z' + ptT(Cn)) + ' is <b>not</b> equidistant from the vertices by comparing two distances exactly.', [lenBox('ZH', Cn, H, 3), lenBox('ZG', Cn, G, 3)],
            t(dW(Cn, H, 'ZH', 3)) + '<br>' + t(dW(Cn, G, 'ZG', 3)) + '<br>Unequal, so the centroid is not equidistant from the vertices — and ' + t(ptT(Cn) + '\\neq ' + ptT(mid(G, J))) + ', so it isn’t the midpoint of the hypotenuse either.',
            ['Fractions inside the distance formula: ' + t('\\left(\\tfrac{a}{3}\\right)^{2}=\\tfrac{a^{2}}{9}') + ', and ' + t('\\sqrt{\\tfrac{n}{9}}=\\tfrac{\\sqrt{n}}{3}') + '.'], 'centroid distances');
        } },
        { id: 'e14d', level: 'EMG', outcome: 'EXT', make: function (r) {
          return mc(r, '(d) Which pair of statements correctly replaces the student’s claim?', [
            { html: '“The midpoint of the hypotenuse is the <b>circumcentre</b> (equidistant from all three vertices).” and “The average of the three vertices is the <b>centroid</b> (the balance point).”', right: true },
            { html: '“The midpoint of the hypotenuse is the <b>centroid</b>.” and “The average of the vertices is the <b>circumcentre</b>.”', why: 'Those are swapped: (a) showed the midpoint of the hypotenuse is equidistant from the vertices.' },
            { html: '“Both points are the centre — they are the same point.”', why: 'Part (c) showed they are different points.' },
            { html: '“Neither point is a centre of the triangle.”', why: 'Each is a centre — just a different kind. A triangle has several centres, which is why the bare word “centre” is unsafe.' }],
            '1. The midpoint of the hypotenuse is the circumcentre: it is equidistant from all three vertices. 2. The average of the three vertices is the centroid: the balance point. A triangle has several different centres, so “centre” on its own doesn’t say which point is meant.', ['Which point did (a) describe, and which did (b)?'], 'two centres');
        } }] },
    { num: '15', shared: function (r) { return isoTrap(r, book(r)); },
      stem: function (sh) { return 'Asked whether ' + t('PQRS') + ' with ' + nameList(['P', 'Q', 'R', 'S'], [sh.P, sh.Q, sh.R, sh.S]) + ' is a parallelogram, a student writes: ' + t('m_{PQ}=0=m_{SR}\\Rightarrow PQ\\parallel SR') + '; ' + t('QR=PS=' + radT(n2(sh.Q, sh.R)) + '\\Rightarrow QR\\parallel PS') + '; so ' + t('PQRS') + ' is a parallelogram.'; },
      parts: [
        { id: 'e15a', level: 'EMG', outcome: 'RF3', make: function (r) {
          return mc(r, '(a) Both computed facts are correct. Which step does not follow?', [
            { html: '“' + t('QR=PS\\Rightarrow QR\\parallel PS') + '”: equal <b>lengths</b> say nothing about <b>direction</b>.', right: true },
            { html: '“' + t('m_{PQ}=m_{SR}\\Rightarrow PQ\\parallel SR') + '”: a slope of ' + t('0') + ' can’t show parallel.', why: 'Two horizontal segments (slope ' + t('0') + ') <b>are</b> parallel. That step is fine.' },
            { html: 'The final “so it is a parallelogram”: two pairs of parallel sides aren’t enough.', why: 'Two pairs of parallel opposite sides <b>is</b> the definition of a parallelogram. The faulty step is earlier.' },
            { html: 'Nothing — the argument is correct.', why: 'Equal lengths can point in different directions. Look at the second step.' }],
            'Equal lengths say nothing about direction, so “' + t('QR=PS\\Rightarrow QR\\parallel PS') + '” does not follow. Parallel must be settled with slopes.', ['Which tool settles “parallel”?'], 'find the faulty step');
        } },
        { id: 'e15b', level: 'EMG', outcome: 'RF3', make: function (r, sh) {
          return FP('(b) Give the calculations that show the conclusion is wrong: the slopes of the legs, and the lengths of the parallel sides.', [slopeBox('QR', sh.Q, sh.R), slopeBox('SP', sh.S, sh.P), lenBox('PQ', sh.P, sh.Q), lenBox('RS', sh.R, sh.S)],
            t(slW(sh.Q, sh.R, 'QR')) + ' but ' + t(slW(sh.S, sh.P, 'SP')) + ': ' + t('QR\\not\\parallel PS') + ', so only one pair of sides is parallel.<br>' + t('PQ=' + radT(n2(sh.P, sh.Q))) + ' but ' + t('RS=' + radT(n2(sh.R, sh.S))) + ': the parallel pair isn’t equal either. ' + t('PQRS') + ' is an isosceles <b>trapezoid</b>.', [SLOPE_HINT], 'disprove the parallelogram');
        } },
        { id: 'e15c', level: 'EMG', outcome: 'RF3', make: function (r) {
          return mc(r, '(c) Which is a correct pair of conditions for a parallelogram, using <b>both</b> pairs of opposite sides?', [
            { html: t('m_{PQ}=m_{SR}') + ' <b>and</b> ' + t('m_{QR}=m_{PS}') + ' (both pairs of opposite sides parallel).', right: true },
            { html: t('m_{PQ}=m_{SR}') + ' and ' + t('QR=PS') + '.', why: 'That is exactly this student’s mistake: one parallel pair and a different equal pair can make an isosceles trapezoid.' },
            { html: t('PQ=QR') + ' and ' + t('RS=SP') + '.', why: 'Those are <b>adjacent</b> sides (that describes a kite).' },
            { html: t('m_{PQ}\\times m_{QR}=-1') + ' and ' + t('m_{RS}\\times m_{SP}=-1') + '.', why: 'Perpendicular adjacent sides are about right angles, not about opposite sides being parallel.' }],
            'Both pairs of opposite sides parallel: ' + t('m_{PQ}=m_{SR}') + ' and ' + t('m_{QR}=m_{PS}') + '. (Equivalently: one pair both parallel <i>and</i> equal, or diagonals that bisect each other.)', ['A parallelogram is defined by its opposite sides being parallel.'], 'parallelogram conditions');
        } },
        { id: 'e15d', sub: 'd, i', level: 'PRG', outcome: 'EXT', make: function (r) {
          var v = signs(r, r.pick([[3, 4], [4, 3], [5, 0], [2, 3], [1, 2], [3, 1]])), w = rot(v), P0 = [r.int(-5, -1), r.int(-5, -1)], Q0 = [r.int(0, 2), r.int(0, 2)];
          if (!inBox([add(P0, v), add(Q0, w)], -6, 6)) { P0 = [-2, -2]; Q0 = [1, 1]; v = [3, 1]; w = rot(v); }
          var key = drawing([poly([P0, add(P0, v)]), poly([Q0, add(Q0, w)])]);
          var p = B.graph('(d) Equal lengths do not force parallel. Draw <b>two segments</b> that are equal in length but <b>not</b> parallel. (Use <b>╱ Line</b>: tap one end, then the other end twice to finish; then draw the second segment.)', { x: [-6, 6], y: [-6, 6], grid: 1, labels: 2, mode: 'lines', defaultEnd: 'closed', max: 340 }, twoSegChk('eq'), key,
            'Many answers work. For example a horizontal segment of length ' + t('5') + ' and a vertical segment of length ' + t('5') + ': equal lengths, slopes ' + t('0') + ' and undefined. Or turn a run–rise step a quarter turn: ' + t('(' + v[0] + ',\\ ' + v[1] + ')') + ' and ' + t('(' + w[0] + ',\\ ' + w[1] + ')') + ' have the same length but different slopes.',
            ['Equal length: the same ' + t('(\\Delta x)^{2}+(\\Delta y)^{2}') + '. Not parallel: different slopes.', 'Try one horizontal and one vertical segment of the same length.'], 'example: equal, not parallel');
          p.good = [drawing([poly([[0, 0], [5, 0]]), poly([[0, 1], [0, 6]])])];
          p.bad = [drawing([poly([[0, 0], [3, 1]]), poly([[0, 2], [3, 3]])]), drawing([poly([[0, 0], [4, 0]]), poly([[0, 1], [0, 6]])]), drawing([poly([[0, 0], [3, 0], [3, 3]])])];
          return p;
        } },
        { id: 'e15d2', sub: 'd, ii', level: 'PRG', outcome: 'EXT', make: function (r) {
          var f = r.pick([[1, 1], [1, 2], [2, 1], [1, 3], [-1, 1], [-1, 2], [0, 1]]), P0 = [r.int(-5, -3), r.int(-5, -3)], Q0 = [P0[0] + r.int(1, 3), P0[1] + r.int(3, 5) * (f[0] === 0 ? 0 : 1) + (f[0] === 0 ? 0 : 0)];
          var a = [f[1], f[0]]; if (a[0] === 0 && a[1] === 0) a = [1, 0];
          var P1 = add(P0, a), Q1 = add(Q0, scl(a, 2));
          if (sameSlope(slopeOf(P0, Q0), slopeOf(P0, P1)) || !inBox([P1, Q1], -6, 6)) { P0 = [-4, -4]; P1 = [-3, -2]; Q0 = [0, -3]; Q1 = [2, 1]; }
          var key = drawing([poly([P0, P1]), poly([Q0, Q1])]);
          var p = B.graph('(d) continued. Parallel does not force equal length. Draw <b>two segments</b> that are parallel but <b>not</b> equal in length (on different lines).', { x: [-6, 6], y: [-6, 6], grid: 1, labels: 2, mode: 'lines', defaultEnd: 'closed', max: 340 }, twoSegChk('par'), key,
            'Many answers work. For example ' + t('(0,\\ 0)') + ' to ' + t('(2,\\ 2)') + ' and ' + t('(0,\\ 5)') + ' to ' + t('(6,\\ 11)') + ': both slope ' + t('1') + ', but lengths ' + t('2\\sqrt{2}') + ' and ' + t('6\\sqrt{2}') + '. On this grid: use the same run–rise step once for one segment and twice for the other.',
            ['Parallel: the same slope. Use the same run and rise, but repeat it twice for the second segment.'], 'example: parallel, not equal');
          p.good = [drawing([poly([[0, 0], [2, 2]]), poly([[0, 3], [3, 6]])])];
          p.bad = [drawing([poly([[0, 0], [2, 2]]), poly([[0, 3], [2, 5]])]), drawing([poly([[0, 0], [2, 2]]), poly([[3, 3], [6, 6]])]), drawing([poly([[0, 0], [2, 1]]), poly([[0, 3], [3, 6]])])];
          return p;
        } }] },
    /* ---------- Part F — Challenge ---------- */
    { num: '16', section: 'Extra practice F — Challenge', shared: function (r) {
        if (book(r)) return { M: [4, 4], h: [3, 2] };
        return rep(r, function () { var h = signs(r, r.pick([[3, 2], [2, 3], [3, 1], [1, 3], [2, 1], [1, 2], [4, 1], [1, 4]])), M = [r.int(2, 6), r.int(2, 6)]; var A = sub(M, h), C = add(M, h), Bq = add(M, rot(h)), D = sub(M, rot(h)); return inBox([A, Bq, C, D], -1, 10) ? { M: M, h: h } : null; });
      },
      stem: function (sh) { var A = sub(sh.M, sh.h), C = add(sh.M, sh.h); return t('A' + ptT(A)) + ' and ' + t('C' + ptT(C)) + ' are the <b>opposite</b> vertices of a square ' + t('ABCD') + '.'; },
      parts: [
        { id: 'e16a', level: 'EMG', outcome: 'EXT', make: function (r, sh) {
          var A = sub(sh.M, sh.h), C = add(sh.M, sh.h);
          return FP('(a) Determine the centre of the square and the exact length of diagonal ' + t('AC') + '.', [ptBox('Centre:', sh.M, midChk(A, C), 'Centre'), lenBox('AC', A, C)], 'Centre = midpoint of ' + t('AC') + ': ' + t(mW(A, C)) + '.<br>' + t(dW(A, C, 'AC')), [MID_HINT, LEN_HINT], 'centre and diagonal');
        } },
        { id: 'e16b', level: 'ADV', outcome: 'EXT', make: function (r, sh) {
          var A = sub(sh.M, sh.h), C = add(sh.M, sh.h), Bq = add(sh.M, rot(sh.h)), D = sub(sh.M, rot(sh.h)), mAC = slopeOf(A, C), pp = perpOf(mAC);
          var key = drawing([poly([A, Bq, C, D, A])]);
          var hr = [sh.h[1], sh.h[0]], W1 = drawing([poly([A, add(sh.M, hr), C, sub(sh.M, hr), A])]), W2 = drawing([poly([A, add(sh.M, scl(rot(sh.h), 2)), C, sub(sh.M, scl(rot(sh.h), 2)), A])]);
          var inp = { x: [-2, 11], y: [-2, 11], grid: 1, labels: 2, mode: 'lines', defaultEnd: 'closed', max: 340, bg: { points: [lbl('A', A), lbl('C', C)] } };
          var base = K.graphExact(key, { wrong: [{ is: W1, code: 'sq-recip', hint: 'The other diagonal ' + t('BD') + ' must be <b>perpendicular</b> to ' + t('AC') + ': slope ' + t(sT(pp)) + ' (negative reciprocal) — you used the reciprocal without changing the sign.' }, { is: W2, code: 'sq-full', hint: 'Right direction, but ' + t('BD') + ' must be the same length as ' + t('AC') + ', so ' + t('B') + ' and ' + t('D') + ' are each only half a diagonal from the centre.' }] });
          var p = B.graph('(b) The diagonals of a square are equal, bisect each other, and are perpendicular. Use all three facts to locate ' + t('B') + ' and ' + t('D') + ', and draw the square ' + t('ABCD') + ' (all four sides) on the grid.', inp, function (resp) {
            var n = HW.draw.norm(resp); if (n.pts.length && !n.pieces.length) return form('sq-points', 'Now join the four vertices with the four sides of the square (use <b>╱ Line</b>).');
            return base(resp);
          }, key, '<i>Bisect:</i> ' + t('BD') + ' passes through the centre ' + t(ptT(sh.M)) + '. <i>Perpendicular:</i> ' + t('m_{AC}=' + sT(mAC)) + ', so ' + t('m_{BD}=' + sT(pp)) + '. <i>Equal:</i> each half of ' + t('BD') + ' is as long as each half of ' + t('AC') + ' — the step ' + t('(' + rot(sh.h)[0] + ',\\ ' + rot(sh.h)[1] + ')') + ' from the centre, the same length as ' + t('(' + sh.h[0] + ',\\ ' + sh.h[1] + ')') + '.<br>So ' + t('B' + ptT(Bq)) + ' and ' + t('D' + ptT(D)) + '.',
            ['From the centre, ' + t('C') + ' is the step ' + t('(' + sh.h[0] + ',\\ ' + sh.h[1] + ')') + '. Turn that step a quarter turn to reach ' + t('B') + ', and the opposite way to reach ' + t('D') + '.', 'Perpendicular slope: the negative reciprocal of ' + t(sT(mAC)) + '.'], 'construct the square');
          p.bad = [W1, W2, drawing([], [A, Bq, C, D])];
          p.good = [drawing([poly([A, Bq]), poly([Bq, C]), poly([C, D]), poly([D, A])], [A, C])];
          return p;
        } },
        { id: 'e16c', level: 'EMG', outcome: 'EXT', make: function (r, sh) {
          var A = sub(sh.M, sh.h), C = add(sh.M, sh.h), Bq = add(sh.M, rot(sh.h)), D = sub(sh.M, rot(sh.h));
          return FP('(c) With ' + t('B' + ptT(Bq)) + ' and ' + t('D' + ptT(D)) + ', verify the square: the side length (all four sides are equal) and a right angle at ' + t('B') + '.', [lenBox('AB', A, Bq), slopeBox('AB', A, Bq), slopeBox('BC', Bq, C)],
            [['A', A, 'B', Bq], ['B', Bq, 'C', C], ['C', C, 'D', D], ['D', D, 'A', A]].map(function (s) { return t(dW(s[1], s[3], s[0] + s[2])); }).join('<br>') + '<br>' + t(slW(A, Bq, 'AB')) + ', ' + t(slW(Bq, C, 'BC')) + '; product ' + t('-1') + ': right angle at ' + t('B') + ' ✓', [LEN_HINT, SLOPE_HINT], 'verify the square');
        } },
        { id: 'e16d', level: 'EMG', outcome: 'EXT', make: function (r, sh) {
          var A = sub(sh.M, sh.h), C = add(sh.M, sh.h), Bq = add(sh.M, rot(sh.h)), s2 = n2(A, Bq), d = n2(A, C);
          return B.number('(d) Determine the area of the square (it can be found from the side length, or from ' + t('\\tfrac12 d_1d_2') + ').', s2, function (v) {
            if (near(v, d)) return { code: 'value', hint: 'With the diagonals the area is <b>half</b> of ' + t('d_1d_2') + '.' };
            if (near(v, 2 * s2)) return { code: 'value', hint: 'Check: the area from the side is ' + t('s^{2}') + '.' };
            return null;
          }, 'From the side: ' + t('A=s^{2}=(' + radT(s2) + ')^{2}=' + s2) + '. From the diagonals: ' + t('A=\\tfrac12 d_1d_2=\\tfrac12(' + radT(d) + ')(' + radT(d) + ')=\\tfrac12(' + d + ')=' + s2) + '. They agree ✓', ['Square the side length from (c).'], 'area of the square', { after: 'square units' });
        } }] },
    { num: '17', shared: function (r) {
        if (book(r)) return { A: [-4, 3], B: [8, 3], P: [2, -4], Q: [12, -1] };
        return rep(r, function () { var c = r.int(-2, 4), x1 = r.int(-7, -2), x2 = x1 + 2 * r.int(4, 7), xm = (x1 + x2) / 2, P = [xm, c - r.int(4, 8)], right = r.chance(0.6), Q = right ? [x2 + r.int(2, 5), c - r.int(2, 6)] : [x1 - r.int(2, 5), c - r.int(2, 6)]; return inBox([[x2, c], P, Q], -12, 14, -9, 8) && inBox([[x1, c]], -12, 14, -9, 8) ? { A: [x1, c], B: [x2, c], P: P, Q: Q } : null; });
      },
      stem: function (sh) { var bx = boxFor([sh.A, sh.B, sh.P, sh.Q]); return 'Segment ' + t('AB') + ' joins ' + t('A' + ptT(sh.A)) + ' and ' + t('B' + ptT(sh.B)) + '. A drone must fly from a point to the <i>nearest point of the segment</i> — not the nearest endpoint, unless that happens to be the same thing. The points are ' + t('P' + ptT(sh.P)) + ' and ' + t('Q' + ptT(sh.Q)) + '.' + fig({ x: bx.x, y: bx.y, labels: 2, segs: [{ pts: [sh.A, sh.B], start: 'none', end: 'none' }], points: [lbl('A', sh.A), lbl('B', sh.B), lbl('P', sh.P), lbl('Q', sh.Q)] }); },
      parts: [
        { id: 'e17a', level: 'BEG', outcome: 'RF3', make: function (r, sh) {
          return FP('(a) State the slope of ' + t('AB') + ', and the slope of any segment perpendicular to it.', [slopeBox('AB', sh.A, sh.B), fb(t('m_{\\perp}='), sChk(null), '\\text{undefined}', { name: t('m_{\\perp}') })],
            t(slW(sh.A, sh.B, 'AB')) + ': horizontal. A perpendicular segment is <b>vertical</b>, with an <b>undefined</b> slope — the horizontal/vertical exception, where ' + t('m_1m_2=-1') + ' can’t be used.', ['A horizontal segment meets a vertical one at a right angle.'], 'horizontal: perpendicular is vertical');
        } },
        { id: 'e17b', level: 'EMG', outcome: 'EXT', make: function (r, sh) {
          var Fp = [sh.P[0], sh.A[1]], dist = sh.A[1] - sh.P[1];
          return FP('(b) For ' + t('P') + ': the perpendicular from ' + t('P') + ' to line ' + t('AB') + ' meets it at its <b>foot</b>. State the foot (it lies on the segment) and the shortest distance from ' + t('P') + ' to the segment.', [
            ptBox('Foot:', Fp, ptChk(Fp, [{ is: [sh.A[1], sh.P[0]], code: 'pt-swap', hint: 'Write ' + t('(x,\\ y)') + '.' }, { is: mid(sh.A, sh.B), code: 'foot-wrong', hint: 'The foot is directly above (or below) ' + t('P') + ': it has the same ' + t('x') + '-coordinate as ' + t('P') + '.' }]), 'Foot'),
            fb('Distance:', numChk(dist, function (v) { if (near(v, Math.sqrt(d2(sh.P, sh.A)))) return { code: 'nearest-end', hint: 'That is the distance to an endpoint. The shortest path to the segment is the perpendicular.' }; return null; }), String(dist), { name: 'Distance', ph: 'units', ans: t(dist + '\\text{ units}') })],
            'The perpendicular from ' + t('P') + ' is vertical, ' + t('x=' + sh.P[0]) + ', meeting ' + t('y=' + sh.A[1]) + ' at ' + t(ptT(Fp)) + '. Since ' + t(sh.A[0] + '\\le ' + sh.P[0] + '\\le ' + sh.B[0]) + ', it is on the segment. Shortest distance ' + t('=|' + sh.A[1] + '-' + par(sh.P[1]) + '|=' + dist) + ' units.', ['Go straight up (or down) from ' + t('P') + ' to the line ' + t('y=' + sh.A[1]) + '.'], 'foot of perpendicular, distance');
        } },
        { id: 'e17c', level: 'EMG', outcome: 'EXT', make: function (r, sh) {
          var Fq = [sh.Q[0], sh.A[1]];
          var p = B.pairs('(c) For ' + t('Q') + ': determine the foot of the perpendicular from ' + t('Q') + ' to line ' + t('AB') + '. (Notice that it is <b>not</b> on the segment.)', [Fq], {}, 'The vertical through ' + t('Q') + ' meets ' + t('y=' + sh.A[1]) + ' at ' + t(ptT(Fq)) + '. But ' + t(sh.Q[0] + (sh.Q[0] > sh.B[0] ? '>' + sh.B[0] : '<' + sh.A[0])) + ', so the foot is beyond the end of the segment: the perpendicular reaches the <i>line</i>, not the segment, so the drone can’t use it.', ['Go straight up (or down) from ' + t('Q') + ' to the line.'], 'foot beyond the segment');
          p.check = ptChk(Fq, [{ is: sh.B, code: 'foot-wrong', hint: 'That is an endpoint of the segment. The foot is straight up (or down) from ' + t('Q') + ', on the line ' + t('y=' + sh.A[1]) + '.' }, { is: sh.A, code: 'foot-wrong', hint: 'The foot is straight up (or down) from ' + t('Q') + ', on the line ' + t('y=' + sh.A[1]) + '.' }]); p.answer = t(ptT(Fq)); return p;
        } },
        { id: 'e17d', level: 'PRG', outcome: 'EXT', make: function (r, sh) {
          var end = sh.Q[0] > sh.B[0] ? 'B' : 'A', E = sh[end], far = end === 'B' ? sh.A : sh.B, V = Math.sqrt(d2(sh.Q, E));
          return FP('(d) Determine the shortest distance from ' + t('Q') + ' to the <b>segment</b>, exactly and to the nearest tenth, and name the point of the segment it reaches.', [
            lenBox('d', sh.Q, E), decBox(t('d\\approx'), V, 1, { name: 'Decimal' }), ptBox('Point reached:', E, ptChk(E, [{ is: far, code: 'nearest-end', hint: 'That is the <b>far</b> end of the segment.' }, { is: [sh.Q[0], sh.A[1]], code: 'foot-wrong', hint: 'That point is on the line ' + t('AB') + ', but not on the <b>segment</b>.' }]), 'Point')],
            'The foot is off the segment, so the nearest point of the segment is the endpoint ' + t(end + ptT(E)) + '.<br>' + t(dW(sh.Q, E, 'Q' + end)) + t('\\approx ' + fx1(V)) + '.<br>(Compare ' + t('Q' + (end === 'B' ? 'A' : 'B') + '=' + radT(n2(sh.Q, far))) + ', the far end.)', ['The nearest point of the segment is the endpoint closest to the foot.', LEN_HINT], 'distance to the nearest endpoint');
        } },
        { id: 'e17e', level: 'EMG', outcome: 'EXT', make: function (r, sh) {
          return FP('(e) Calculate ' + t('PA') + ' and ' + t('PB') + ' exactly.', [lenBox('PA', sh.P, sh.A), lenBox('PB', sh.P, sh.B)], t(dW(sh.P, sh.A, 'PA')) + '<br>' + t(dW(sh.P, sh.B, 'PB')) + '<br>They are equal.', [LEN_HINT], 'PA and PB');
        } },
        { id: 'e17e2', sub: 'e, cont.', level: 'EMG', outcome: 'EXT', make: function (r, sh) {
          var xm = (sh.A[0] + sh.B[0]) / 2;
          return mc(r, '(e) continued. ' + t('PA=PB') + ', yet neither is the shortest distance from ' + t('P') + ' to the segment. What does that equality tell you about ' + t('P') + '?', [
            { html: t('P') + ' lies on the <b>perpendicular bisector</b> of ' + t('AB') + ' (the line ' + t('x=' + nT(xm)) + ') — it tells you where ' + t('P') + ' sits sideways, not how far it is from the segment.', right: true },
            { html: t('PA') + ' is the shortest distance from ' + t('P') + ' to the segment.', why: 'The shortest path is the perpendicular from (b): ' + t(sh.A[1] - sh.P[1]) + ' units, shorter than ' + t('PA') + '.' },
            { html: t('P') + ' is the midpoint of ' + t('AB') + '.', why: t('P') + ' isn’t on ' + t('AB') + ' at all. Equal distances put it on the perpendicular bisector.' },
            { html: 'Nothing — it is a coincidence.', why: 'Points equidistant from ' + t('A') + ' and ' + t('B') + ' are never a coincidence: they all lie on one particular line.' }],
            t('PA=PB') + ' says ' + t('P') + ' lies on the perpendicular bisector of ' + t('AB') + ', the vertical line ' + t('x=' + nT(xm)) + '. That is where ' + t('P') + ' sits sideways — the shortest distance is still the perpendicular in (b).', ['Which points are equally far from ' + t('A') + ' and ' + t('B') + '?'], 'meaning of PA = PB');
        } }] },
    { num: '18', stem: '<i>(Multiple Choice)</i>', parts: [
      { id: 'e18', level: 'EMG', outcome: 'EXT', make: function (r) {
        var V = book(r) ? 0 : r.int(0, 3);
        var facts = ['four equal sides <b>and</b> equal diagonals', 'four equal sides', 'diagonals that bisect each other <b>and</b> are equal', 'diagonals that bisect each other <b>and</b> are perpendicular'][V];
        var ans = ['sq', 'rh', 're', 'rh'][V];
        var opts = [{ html: 'rhombus', right: ans === 'rh', why: ans === 'sq' ? 'True, but not the <b>most complete</b>: the equal diagonals add “rectangle”.' : 'A rhombus needs four equal sides. Do these facts give that?' },
          { html: 'rectangle', right: ans === 're', why: ans === 'sq' ? 'That leaves out the four equal sides.' : 'A rectangle needs equal diagonals (or a right angle).' },
          { html: 'square', right: ans === 'sq', why: 'A square needs four equal sides <b>and</b> a right angle (or equal diagonals). Check both.' },
          { html: 'not enough information', why: 'These facts are enough to name a special quadrilateral.' }];
        return mc(r, 'A quadrilateral has ' + facts + '. The most complete description of it is', opts, ['Four equal sides ⟹ rhombus (a parallelogram); with equal diagonals it is also a rectangle: rhombus + rectangle = <b>square</b>.', 'Four equal sides ⟹ <b>rhombus</b>. Nothing gives a right angle.', 'Diagonals that bisect each other ⟹ parallelogram; equal diagonals ⟹ <b>rectangle</b>.', 'Diagonals that bisect each other ⟹ parallelogram; perpendicular diagonals ⟹ <b>rhombus</b>.'][V],
          ['Which special shape does each fact give? Combine them.'], 'most complete name from facts', true);
      } }] },
    { num: '19', stem: '<i>(Numerical Response)</i>', parts: [
      { id: 'e19', level: 'EMG', outcome: 'EXT', make: function (r) {
        var A, Bq; if (book(r)) { A = [-5, 2]; Bq = [7, 10]; } else rep(r, function () { A = [r.int(-8, -1), r.int(-5, 4)]; Bq = [r.int(1, 9), r.int(2, 11)]; if ((A[0] + Bq[0]) % 2 || (A[1] + Bq[1]) % 2) return null; var v = Math.sqrt(d2(A, Bq)) / 2; return Math.abs(v - Math.floor(v) - 0.5) > 0.08 ? true : null; });
        var M = mid(A, Bq), V = Math.sqrt(d2(A, M)), ans = Math.round(V);
        return B.nr(t('M') + ' is the midpoint of the segment joining ' + t('A' + ptT(A)) + ' and ' + t('B' + ptT(Bq)) + '. The length of ' + t('\\overline{AM}') + ', to the nearest whole unit, is ________.', ans, function (v) {
          if (v === Math.round(2 * V)) return { code: 'value', hint: 'That is the whole length ' + t('AB') + '. ' + t('AM') + ' is half of it.' };
          if (v === Math.round(d2(A, M))) return { code: 'no-root', hint: 'Take the square root.' };
          return null;
        }, t(mW(A, Bq, 'AB')) + '<br>' + t(dW(A, M, 'AM')) + t('\\approx ' + rnd(V, 3)) + ', so ' + t(ans) + '.', [MID_HINT, LEN_HINT], 'length AM (NR)');
      } }] },
    /* ---------- Part G — Cumulative coverage ---------- */
    { num: '20', section: 'Extra practice G — Cumulative Coverage', shared: function (r) {
        if (book(r)) return { s: 5, A: [-4, 3], B: [2, -1], C: [-3, -3], D: [1, 3] };   // in squares
        return rep(r, function () { var u = signs(r, r.pick([[6, -4], [4, -2], [2, -4], [4, 2], [6, 2], [2, 6], [4, -6]])), s = r.pick([5, 2, 10]), A = [r.int(-5, 1), r.int(-4, 4)], Bq = add(A, u), C = [r.int(-5, 1), r.int(-4, 4)], D = add(C, rot(u));
          if (!inBox([A, Bq, C, D], -4, 4, -4, 4) || samePt(mid(A, Bq), mid(C, D)) || !distinctPts([A, Bq, C, D])) return null; return { s: s, A: A, B: Bq, C: C, D: D }; });
      },
      stem: function (sh) { var s = sh.s, sc = function (p) { return scl(p, s); }; return 'On the grid below, <b>each square is ' + s + ' units across and ' + s + ' units up</b>. Read the tick labels, not the squares.' + fig({ x: [-5 * s, 5 * s], y: [-4 * s, 4 * s], grid: s, labels: 2 * s, unit: 28 / s, segs: [{ pts: [sc(sh.A), sc(sh.B)], start: 'none', end: 'none' }, { pts: [sc(sh.C), sc(sh.D)], start: 'none', end: 'none', color: '#c4532a' }], points: [lbl('A', sc(sh.A)), lbl('B', sc(sh.B)), lbl('C', sc(sh.C)), lbl('D', sc(sh.D))] }); },
      parts: [
        { id: 'e20a', level: 'BEG', outcome: 'EXT', make: function (r, sh) {
          var s = sh.s, P = ['A', 'B', 'C', 'D'].map(function (n) { return scl(sh[n], s); });
          return FP('(a) State the coordinates of ' + t('A') + ', ' + t('B') + ', ' + t('C') + ' and ' + t('D') + '.', ['A', 'B', 'C', 'D'].map(function (n, i) { return ptBox(t(n + '='), P[i], ptChk(P[i], [{ is: sh[n], code: 'scale-none', hint: 'Each square is ' + t(s) + ' units — multiply the square count by ' + t(s) + ' (read the tick labels).' }]), t(n)); }),
            'Each square is ' + t(s) + ' units, so multiply each square count by ' + t(s) + ': ' + nameList(['A', 'B', 'C', 'D'], P) + '.', ['Read the tick labels: each grid square is ' + t(s) + ' units.'], 'read coordinates on a scaled grid');
        } },
        { id: 'e20b', level: 'EMG', outcome: 'EXT', make: function (r, sh) {
          var s = sh.s, A = scl(sh.A, s), Bq = scl(sh.B, s), C = scl(sh.C, s), D = scl(sh.D, s);
          return FP('(b) Determine the length of ' + t('AB') + ' and of ' + t('CD') + ', exactly and to the nearest tenth.', [lenBox('AB', A, Bq), decBox(t('AB\\approx'), Math.sqrt(d2(A, Bq)), 1, { name: t('AB') + ' (tenth)' }), lenBox('CD', C, D), decBox(t('CD\\approx'), Math.sqrt(d2(C, D)), 1, { name: t('CD') + ' (tenth)' })],
            t(dW(A, Bq, 'AB')) + t('\\approx ' + fx1(Math.sqrt(d2(A, Bq)))) + '<br>' + t(dW(C, D, 'CD')) + t('\\approx ' + fx1(Math.sqrt(d2(C, D)))), [LEN_HINT, 'Use the coordinates from (a), not the square counts.'], 'lengths on a scaled grid');
        } },
        { id: 'e20c', level: 'EMG', outcome: 'RF3', make: function (r, sh) {
          var s = sh.s, A = scl(sh.A, s), Bq = scl(sh.B, s), C = scl(sh.C, s), D = scl(sh.D, s);
          return FP('(c) Determine the slope of ' + t('AB') + ' and of ' + t('CD') + ', and say how the two segments are related (parallel, perpendicular or neither).', [slopeBox('AB', A, Bq), slopeBox('CD', C, D),
            fb('Related:', wordChk(/perp|⊥/, [{ re: /^par|∥/, hint: 'Parallel needs equal slopes. Multiply the two slopes.' }, { re: /neith|none/, hint: 'Multiply the two slopes — what do you get?' }], 'Type parallel, perpendicular or neither.'), 'perpendicular', { text: true, name: 'Relationship', ph: 'parallel / perpendicular / neither' })],
            t(slW(A, Bq, 'AB')) + '<br>' + t(slW(C, D, 'CD')) + '<br>The product is ' + t('-1') + ': the segments are <b>perpendicular</b>.', [SLOPE_HINT], 'slopes on a scaled grid');
        } },
        { id: 'e20d', level: 'PRG', outcome: 'EXT', make: function (r, sh) {
          var s = sh.s, A = scl(sh.A, s), Bq = scl(sh.B, s), C = scl(sh.C, s), D = scl(sh.D, s);
          return FP('(d) Locate the midpoint of ' + t('AB') + ' and of ' + t('CD') + ' (by counting squares or with the formula). Do the two segments share a midpoint?', [midBox('AB', A, Bq), midBox('CD', C, D),
            fb('Shared?', wordChk(/^no/, [{ re: /^y/, hint: 'Compare your two midpoints — are they the same point?' }], 'Type yes or no.'), 'no', { text: true, name: 'Shared', ph: 'yes / no' })],
            '<i>Counting:</i> ' + t('A') + ' to ' + t('B') + ' is ' + t(Math.abs(sh.B[0] - sh.A[0])) + ' squares across and ' + t(Math.abs(sh.B[1] - sh.A[1])) + ' up or down; half of that from ' + t('A') + ' lands on ' + t(ptT(mid(A, Bq))) + '. <i>Formula:</i> ' + t(mW(A, Bq, 'AB')) + ', ' + t(mW(C, D, 'CD')) + '.<br><b>Not shared</b>: ' + t('AB') + ' and ' + t('CD') + ' don’t bisect each other, so ' + t('ACBD') + ' is not a parallelogram (so not the square that equal, perpendicular diagonals might suggest).', [MID_HINT], 'midpoints on a scaled grid');
        } },
        { id: 'e20e', level: 'PRG', outcome: 'EXT', make: function (r, sh) {
          var s = sh.s, rows = [{ id: 'sl', html: 'the slopes of ' + t('AB') + ' and ' + t('CD') }, { id: 'len', html: 'the lengths ' + t('AB') + ' and ' + t('CD') }, { id: 'mc', html: 'the coordinates of the midpoints of ' + t('AB') + ' and ' + t('CD') }, { id: 'sh', html: 'the verdict “do ' + t('AB') + ' and ' + t('CD') + ' share a midpoint?”' }];
          var cols = [{ id: 'ok', html: 'right' }, { id: 'small', html: t(s) + ' times too small' }, { id: 'big', html: t(s) + ' times too large' }];
          var why = { sl: 'Slope: rise and run are <b>both</b> ' + t(s) + ' times too small, and the ' + t(s) + 's cancel in the fraction.', len: 'Length: every difference is ' + t(s) + ' times too small, and the common factor ' + t(s) + ' comes straight out of the square root.', mc: 'Midpoint: the same grid points, but each coordinate is ' + t(s) + ' times too small (an average scales with the values).', sh: 'Shared or not: the midpoints are the same grid points whatever the labels, so the verdict doesn’t change.' };
          return B.grid('(e) A classmate ignores the tick labels and treats every square as ' + t('1') + ' unit. For each result below, would the classmate get it right, or wrong — and by what factor?', rows, cols, { sl: 'ok', len: 'small', mc: 'small', sh: 'ok' }, { why: function (rid) { return { code: 'row', hint: why[rid] }; } },
            rows.map(function (rw) { return why[rw.id]; }).join('<br>'), ['Write each formula with every coordinate divided by ' + t(s) + '. Does the ' + t(s) + ' cancel, come out, or stay?'], 'scale effects on slope, length, midpoint');
        } },
        { id: 'e20f', level: 'PRG', outcome: 'EXT', make: function (r, sh) {
          var s = sh.s;
          return mc(r, '(f) Suppose instead the squares were ' + t(s) + ' units across but only ' + t('1') + ' unit up. Without recalculating, which statement is right?', [
            { html: '<b>Length and slope</b> would both change, but the <b>midpoint</b> still locates the same grid point.', right: true },
            { html: 'Only the length would change; slope and midpoint stay the same.', why: 'Rise and run would now be scaled by different numbers (' + t('1') + ' up, ' + t(s) + ' across), so they no longer cancel in the slope.' },
            { html: 'Nothing would change, because the picture is the same.', why: 'The coordinates change, so lengths and slopes change. Only the midpoint’s <b>grid point</b> stays put.' },
            { html: 'The slope stays the same because the ' + t(s) + 's still cancel.', why: 'Now only the run is multiplied by ' + t(s) + ' — there is nothing to cancel it in the rise.' }],
            'Length and slope both change: rise and run are scaled by different factors (' + t('1') + ' up, ' + t(s) + ' across), so the factors no longer cancel in the slope or come out of the root as one factor. The midpoint always locates the same grid point — only its label changes.', ['Which formulas mix ' + t('x') + ' and ' + t('y') + ' differences, and which treat each coordinate separately?'], 'unequal scales');
        } }] }
  ];

  /* the e3 pair part and the two-segment drawing check (used above) */
  function pairPart(r, P, n, lab) {
    var A = P[0], Bq = P[1], C = P[2], D = P[3], m1 = slopeOf(A, Bq), m2 = slopeOf(C, D), l1 = n2(A, Bq), l2 = n2(C, D), M1 = mid(A, Bq), M2 = mid(C, D);
    var nm1 = n[0] + n[1], nm2 = n[2] + n[3], want = [];
    if (sameSlope(m1, m2)) want.push('par'); if (isPerp(m1, m2)) want.push('perp'); if (l1 === l2) want.push('eq'); if (samePt(M1, M2)) want.push('mid');
    var opts = [{ value: 'par', html: 'parallel' }, { value: 'perp', html: 'perpendicular' }, { value: 'eq', html: 'equal in length' }, { value: 'mid', html: 'share a midpoint' }];
    return { prompt: lab + ' ' + t(nm1) + ': ' + t(n[0] + ptT(A)) + ', ' + t(n[1] + ptT(Bq)) + '; &nbsp;' + t(nm2) + ': ' + t(n[2] + ptT(C)) + ', ' + t(n[3] + ptT(D)) + '.<br>Tap <b>every</b> description that is true. (If they are neither parallel nor perpendicular, tap neither of those.)',
      input: { type: 'select', options: opts, help: 'Tap every one that is true. Tap again to unselect.' }, key: want, text: 'pair of segments ' + lab,
      answer: want.map(function (w) { return opts.filter(function (o) { return o.value === w; })[0].html; }).join(', '),
      check: K.selectSet(want, function (extra, missing) {
        var w = extra[0] || missing[0], has = extra.length ? 'aren’t' : 'are';
        var msg = { par: 'Compare the slopes: ' + t('m_{' + nm1 + '}=' + sT(m1)) + ', ' + t('m_{' + nm2 + '}=' + sT(m2)) + '.', perp: 'Perpendicular: slopes that multiply to ' + t('-1') + ', or one horizontal and one vertical. ' + t('m_{' + nm1 + '}=' + sT(m1)) + ', ' + t('m_{' + nm2 + '}=' + sT(m2)) + '.', eq: 'Compare the lengths: find ' + t(nm1) + ' and ' + t(nm2) + ' with the distance formula.', mid: 'Compare the midpoints: find both with the midpoint formula.' }[w];
        return { code: 'set', hint: (extra.length ? 'One of your choices isn’t true. ' : 'You missed one. ') + msg };
      }),
      solution: t(slW(A, Bq, nm1)) + ', ' + t(slW(C, D, nm2)) + ': ' + (sameSlope(m1, m2) ? '<b>parallel</b>.' : isPerp(m1, m2) ? '<b>perpendicular</b>.' : 'neither.') + '<br>' + t(dW(A, Bq, nm1)) + ', ' + t(dW(C, D, nm2)) + ': ' + (l1 === l2 ? '<b>equal</b>.' : 'not equal.') + '<br>' + t(mW(A, Bq, nm1)) + ', ' + t(mW(C, D, nm2)) + ': ' + (samePt(M1, M2) ? '<b>shared</b>.' : 'not shared.'),
      hints: ['Three calculations for each segment: slope, length, midpoint.'] };
  }
  function par2(m) { var s = sT(m); return s.charAt(0) === '-' ? '(' + s + ')' : s; }
  function twoSegChk(kind) {
    return function (resp) {
      if (HW.draw.empty(resp)) return form('empty', 'Draw your two segments on the grid first.');
      var n = HW.draw.norm(resp);
      if (n.pieces.some(function (pc) { return pc.v.length > 2; })) return form('two-seg', 'Draw two <b>separate</b> segments, each with just two endpoints (finish one before starting the next).');
      if (n.pieces.length !== 2) return form('two-seg', n.pieces.length < 2 ? 'Draw <b>two</b> segments (you have ' + n.pieces.length + ').' : 'Draw exactly two segments (you have ' + n.pieces.length + ').');
      if (n.pieces.some(function (pc) { return pc.s === 'arrow' || pc.e === 'arrow'; })) return form('seg-arrow', 'These should be <b>segments</b> with an end dot at each end, not lines with arrows.');
      var a = n.pieces[0].v, b = n.pieces[1].v, la = d2(a[0], a[1]), lb = d2(b[0], b[1]), ma = slopeOf(a[0], a[1]), mb = slopeOf(b[0], b[1]), para = sameSlope(ma, mb);
      var same = para && sameSlope(slopeOf(a[0], b[0]), ma) || para && samePt(a[0], b[0]);
      var tx = function (v, m, l) { return t('m=' + sT(m)) + ', length ' + t(radT(l)); };
      if (kind === 'eq') {
        if (para) return wrong('ex-parallel', 'Your segments are parallel (both ' + t('m=' + sT(ma)) + '). Draw two that point in <b>different</b> directions.');
        if (la !== lb) return wrong('ex-len', 'Not equal in length: ' + tx(a, ma, la) + ' and ' + tx(b, mb, lb) + '. Use the same ' + t('(\\Delta x)^{2}+(\\Delta y)^{2}') + ' for both.');
        return ok();
      }
      if (!para) return wrong('ex-notpar', 'Not parallel: the slopes are ' + t(sT(ma)) + ' and ' + t(sT(mb)) + '. Use the same rise and run (or a multiple of it) for both.');
      if (same) return wrong('ex-sameline', 'These two lie on the <b>same line</b>. Move one so they are on two different parallel lines.');
      if (la === lb) return wrong('ex-eqlen', 'Parallel — but equal in length too (' + t(radT(la)) + '). Make one of them longer.');
      return ok();
    };
  }

  HW.defineLesson({
    id: 'u6l6', unit: 6, num: '6', title: 'Coordinate Geometry Review: Slope, Linear Graphs, Distance and Midpoint', outcome: 'RF3',
    blurb: 'Choosing the right tool — slope, intercepts, domain and range, length and midpoint — and combining them to analyse lines, triangles, quadrilaterals and sets of points.',
    questions: QUESTIONS, extra: EXTRAS
  });
})(window);
