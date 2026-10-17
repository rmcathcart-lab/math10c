/* Math 10C · Unit 5 · Lesson 5 — Graphing Calculator Techniques for Relations (RF1)
 * Assignment questions 1–11 (u5_L05.tex) and the Lesson 5 Extra Practice (u5_EP05.tex).
 * Every part is a generator: it keeps the booklet question's structure (a decimal slope whose x-intercept is off the
 * standard screen, a y-intercept beyond ±10, a negative input, a fraction coefficient, two crossings, an exact fraction
 * from MATH ▸Frac, a turning point with fractions …) and changes the numbers; the booklet's own numbers are among the
 * possible values.
 * Calculator work is made gradeable by asking for what the calculator finds: windows → four boxes (Xmin, Xmax, Ymin,
 * Ymax) checked by a local window checker that accepts ANY window showing the stated features (strictly inside, and
 * not more than about 10× the span the features need); values from trace / table / intersect → numbers (to the
 * nearest hundredth where the booklet asks); zero / Frac → exact values; maximum / minimum → exact coordinates.
 * Sketches are not collected — the solutions draw the graph in the suggested window. "Algebraically verify" and
 * "explain" become multiple choice with misconception hints. Keypress questions ("which menu finds the zero?") → MC.
 * Calculator work drops a level (LEVEL_RUBRIC.md). Levels: LIM BEG EMG PRG ADV MAS. */
(function (root) {
  'use strict';
  var HW = root.HW, ex = HW.ex, F = HW.fmt, K = HW.kit, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form, B = K.P, P = HW.poly;

  HW.addCodes({
    'win-cut': 'Window cuts off a feature that must show', 'win-edge': 'Feature exactly on the edge of the window', 'win-huge': 'Window far bigger than needed',
    'win-order': 'Min not smaller than max in the window', 'win-nan': 'Window value not a number',
    'calc-sign': 'Sign slip with a negative', 'calc-no-b': 'Left out the constant term', 'calc-sq-neg': 'Squared a negative input as a negative', 'calc-abs': 'Ignored the absolute value',
    'calc-solved': 'Solved for x instead of evaluating', 'calc-coef-sq': 'Squared the coefficient as well', 'calc-dec': 'Decimal slip',
    'inv-sign': 'Moved the constant with the wrong sign', 'inv-no-div': 'Didn’t divide by the coefficient', 'inv-mult': 'Multiplied instead of dividing',
    'inv-eval': 'Substituted the output as an input', 'inv-neg': 'Lost the negative coefficient', 'used-zero': 'Found the x-intercepts instead of using the given output', 'abs-sub': 'Subtracted the constant instead of adding it',
    exact: 'Rounded decimal instead of the exact value', 'int-point': 'Gave a point where a value was asked', 'int-swap': 'Swapped the x- and y-intercepts', 'int-no-div': 'Didn’t divide by the coefficient',
    'calc-noise': 'Copied the calculator’s approximation error', 'vx-sign': 'Turning point x with the wrong sign', 'vy-wrong-x': 'Turning point y from the wrong x', 'vy-yint': 'Gave the y-intercept for the turning point',
    'nr-gave-x': 'Gave the x-coordinate of the maximum', 'nr-gave-c': 'Gave the y-intercept', 'nr-sign': 'Sign slip in the maximum value',
    'zero-other': 'Gave the other intercept'
  });

  /* ---------------- numbers and LaTeX ---------------- */
  function cl(x) { return Math.round(x * 1e9) / 1e9; }
  function same(a, b) { return Math.abs(a - b) < 1e-9; }
  function nT(x) { return F(cl(x)); }
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var r = a % b; a = b; b = r; } return a; }
  function range(a, b) { var o = []; for (var i = a; i <= b; i++) o.push(i); return o; }
  function rT(p, q) { return ex.texRat(ex.norm(p, q)); }
  function fracOf(x) { for (var q = 1; q <= 400; q++) if (Math.abs(x * q - Math.round(x * q)) < 1e-7) return ex.norm(Math.round(x * q), q); return null; }
  function vt(x) { var f = fracOf(x); return f ? ex.texRat(f) : nT(x); }       // exact value as a fraction when it is rational
  function termDec(x) { var f = fracOf(x); if (!f) return null; var q = f[1]; while (q % 2 === 0) q /= 2; while (q % 5 === 0) q /= 5; return q === 1 ? String(cl(x)) : null; } // a terminating decimal, or null
  function sgp(c) { c = cl(c); return c < 0 ? '(' + nT(c) + ')' : nT(c); }    // bracket a negative number
  function term(c, v, first) {
    var neg, mag;
    if (Array.isArray(c)) { var q = ex.norm(c[0], c[1]); if (!q[0]) return ''; neg = q[0] < 0; mag = q[1] === 1 ? String(Math.abs(q[0])) : '\\frac{' + Math.abs(q[0]) + '}{' + q[1] + '}'; }
    else { c = cl(c); if (!c) return ''; neg = c < 0; mag = nT(Math.abs(c)); }
    if (v && mag === '1') mag = '';
    return (neg ? '-' : first ? '' : '+') + mag + v;
  }
  function lin(list) { var s = ''; list.forEach(function (p) { s += term(p[0], p[1], s === ''); }); return s || '0'; }
  function quadT(a, b, c) { return lin([[a, 'x^{2}'], [b, 'x'], [c, '']]); }
  function linT(m, b) { return lin([[m, 'x'], [b, '']]); }
  function qf(a, b, c) { return function (x) { return a * x * x + b * x + c; }; }
  function lf(m, b) { return function (x) { return m * x + b; }; }
  function pickWhere(gen, okf) { for (var i = 0; i < 3000; i++) { var o = gen(); if (okf(o)) return o; } throw new Error('u5l5: no valid numbers'); }
  function sqrtTex(n) { var k = 1; for (var f = 2; f * f <= n; f++) if (n % (f * f) === 0) k = f; return (k > 1 ? k : '') + (n / (k * k) === 1 ? '' : '\\sqrt{' + n / (k * k) + '}'); }
  function isSq(n) { var s = Math.round(Math.sqrt(n)); return s * s === n; }
  function rnd(x, dp) { return K.roundTo(x, dp); }
  function code(s) { return '<code>' + s + '</code>'; }
  function calcT(tex) { // a relation as it is typed into Y1 (plain text)
    return String(tex).replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, '($1)/($2)').replace(/\^\{([^{}]*)\}/g, '^$1').replace(/\\left|\\right/g, '').replace(/\|([^|]*)\|/g, 'abs($1)').replace(/x/g, 'X').replace(/-/g, '−').replace(/\\,/g, '');
  }
  /* calculator procedures (HTML) */
  var C = {
    y1: function (tex) { return 'press ' + code('Y=') + ' and type ' + code(calcT(tex)) + ' into ' + code('Y1'); },
    trace: function (x) { return code('TRACE') + ', type ' + code(nT(x)) + ', ' + code('ENTER') + ' (or ' + code('2ND') + ' ' + code('TRACE') + ' → ' + code('1:value') + ')'; },
    table: function (x) { return 'the table in Ask mode (' + code('2ND') + ' ' + code('WINDOW') + ': ' + code('Indpnt: Ask') + ', then ' + code('2ND') + ' ' + code('GRAPH') + ' and type ' + code(nT(x)) + ')'; },
    inter: function (y) { return 'type ' + code(nT(y)) + ' into ' + code('Y2') + ', then ' + code('2ND') + ' ' + code('TRACE') + ' → ' + code('5:intersect') + ' (' + code('ENTER') + ' at First curve?, Second curve? and Guess? near the crossing)'; },
    zero: code('2ND') + ' ' + code('TRACE') + ' → ' + code('2:zero') + ' (Left Bound? and Right Bound? on either side of the crossing, then Guess?)',
    value0: code('2ND') + ' ' + code('TRACE') + ' → ' + code('1:value') + ', type ' + code('0') + ', ' + code('ENTER'),
    frac: code('2ND') + ' ' + code('QUIT') + ', then ' + code('X,T,θ,n') + ' ' + code('MATH') + ' ' + code('ENTER') + ' ' + code('ENTER') + ' (▸Frac)',
    max: code('2ND') + ' ' + code('TRACE') + ' → ' + code('4:maximum'), min: code('2ND') + ' ' + code('TRACE') + ' → ' + code('3:minimum')
  };

  /* ---------------- answer readers ---------------- */
  function strip(s) { return String(s == null ? '' : s).replace(/\\(left|right)/g, '').replace(/\\lparen/g, '(').replace(/\\rparen/g, ')').replace(/\\\{|\\\}|\\lbrace|\\rbrace/g, ' ').trim(); }
  function looksPoint(s) { return /\([^()]*,[^()]*\)/.test(strip(s)); }
  function num(s) { var p = HW.parse.number(String(s == null ? '' : s)); return p.ok ? p.value : null; }
  /* a list of values: "x = 5, x = -2", "±\sqrt{7}", "-2\pm2\sqrt{2}", "5 or -2" -> { items: [{ v, ast }] } | { empty } | { bad } */
  function valueItems(resp) {
    var s = strip(resp).replace(/\\[,;:! ]/g, ' ').replace(/\\text\{\s*(or|and)\s*\}/gi, ',').replace(/\b(or|and)\b/gi, ',').replace(/[a-zA-Z]\s*=\s*/g, '').replace(/\\pm|±/g, '±').replace(/;/g, ',');
    if (!s.trim()) return { empty: true };
    var out = [], ps = s.split(',');
    for (var i = 0; i < ps.length; i++) {
      var p = ps[i].trim(); if (!p) continue;
      var bits = p.split('±');
      if (bits.length > 2) return { bad: true };
      if (bits.length === 2) {
        var a0 = bits[0].trim() ? ex.parse(bits[0].trim()) : { ok: true, ast: null }, b0 = ex.parse(bits[1].trim());
        if (!a0.ok || !b0.ok) return { bad: true };
        var av = a0.ast ? ex.value(a0.ast) : 0, bv = ex.value(b0.ast);
        if (!isFinite(av) || !isFinite(bv)) return { bad: true };
        out.push({ v: av + bv, ast: b0.ast }); out.push({ v: av - bv, ast: b0.ast });
        continue;
      }
      var r = ex.parse(p); if (!r.ok) return { bad: true };
      var v = ex.value(r.ast); if (!isFinite(v)) return { bad: true };
      out.push({ v: v, ast: r.ast });
    }
    return out.length ? { items: out } : { empty: true };
  }
  function uniqV(a) { var o = []; a.forEach(function (x) { if (!o.some(function (y) { return same(x, y); })) o.push(x); }); return o.sort(function (x, y) { return x - y; }); }
  function sameVals(A, T) { A = uniqV(A); T = uniqV(T); return A.length === T.length && A.every(function (x, i) { return same(x, T[i]); }); }
  function lowestIssue(ast) { var pf = ex.plainFraction(ast); return pf && pf[1] !== 1 && gcd(pf[0], pf[1]) > 1; }
  function dlFind(dl, v) { for (var i = 0; i < dl.length; i++) if (same(v, dl[i][0])) return { code: dl[i][1], hint: dl[i][2] }; return null; }

  /* ---- one exact value (fraction, integer or terminating decimal). o.dl: [[value, code, hint]], o.close: nudge text ---- */
  var CLOSE = 'Close — but that is a rounded decimal. Give the <b>exact</b> value: on the calculator, ' + C.frac + ' turns the decimal into a fraction (or solve the equation).';
  function exactChk(target, o) {
    o = o || {};
    var T = Array.isArray(target) ? target[0] / target[1] : target, dl = (o.dl || []).filter(function (d) { return isFinite(d[0]) && !same(d[0], T); });
    var base = K.value(Array.isArray(target) ? target : (fracOf(target) || target), { only: 'fraction', diag: function (v) { return dlFind(dl, v); } });
    return function (resp) {
      var s = String(resp == null ? '' : resp);
      if (looksPoint(s)) return form('int-point', 'Just give the <b>value</b> (one number), not an ordered pair.');
      var a = K.read(s); if (a.res) return a.res;
      if (!same(a.val, T) && ex.shape(a.ast).decimals && Math.abs(a.val - T) < 0.006 * Math.max(1, Math.abs(T)) && !dlFind(dl, a.val)) return form(o.closeCode || 'exact', o.close || CLOSE);
      return base(s);
    };
  }
  /* ---- several exact values in any order ---- */
  function exactSet(vals, o) {
    o = o || {};
    var T = uniqV(vals.map(function (x) { return Array.isArray(x) ? x[0] / x[1] : x; }));
    return function (resp) {
      if (looksPoint(resp)) return form('int-point', 'Just give the <b>values</b> of ' + t('x') + ', separated by commas — not ordered pairs.');
      var L = valueItems(resp);
      if (L.empty) return form('empty', 'Type your answer first.');
      if (L.bad) return form('unreadable', 'Write each value separated by a comma, e.g. ' + t('x=5,\\ x=-\\frac{1}{3}') + ', or use ' + t('\\pm') + '.');
      var A = uniqV(L.items.map(function (x) { return x.v; }));
      var miss = T.filter(function (x) { return !A.some(function (y) { return same(x, y); }); }), extra = A.filter(function (x) { return !T.some(function (y) { return same(x, y); }); });
      if (!miss.length && !extra.length) {
        for (var i = 0; i < L.items.length; i++) if (lowestIssue(L.items[i].ast)) return form('lowest', 'Right values — now write each fraction in lowest terms.');
        return ok();
      }
      if (A.length === T.length && extra.every(function (y) { return T.some(function (x) { return Math.abs(x - y) < 0.006 * Math.max(1, Math.abs(x)); }); })) return form('exact', o.close || CLOSE);
      if (o.diag) { var h = o.diag(A, T); if (h) return wrong(h.code || 'diag', h.hint); }
      if (miss.length && !extra.length) return wrong('sol-missing', o.missHint || 'Correct so far — but the graph crosses there more than once. Run the feature again near the other crossing.');
      if (extra.length && !miss.length) return wrong('sol-extra', 'You have a value that doesn’t belong — substitute each one to check.');
      if (A.length === T.length && A.every(function (x) { return T.some(function (y) { return same(-x, y); }); })) return wrong('sol-sign', 'Check the signs: a factor ' + t('(x-5)') + ' gives ' + t('x=5') + ', not ' + t('-5') + '.');
      if (A.length === T.length && A.every(function (x) { return T.some(function (y) { return x !== 0 && same(1 / x, y); }); })) return wrong('flip', 'A fraction is upside down: from ' + t('3x+1=0') + ' you get ' + t('x=-\\frac{1}{3}') + '.');
      return wrong('value', null);
    };
  }
  /* ---- several values rounded to dp places (an exact form is accepted too) ---- */
  function approxSet(vals, dp, o) {
    o = o || {};
    var T = uniqV(vals), place = dp === 1 ? 'tenth' : dp === 2 ? 'hundredth' : dp + ' decimal places';
    var hit = function (v, x) { return same(v, rnd(x, dp)) || same(v, x); };
    return function (resp) {
      if (looksPoint(resp)) return form('int-point', 'Just give the values of ' + t('x') + ', separated by commas — not ordered pairs.');
      var L = valueItems(resp);
      if (L.empty) return form('empty', 'Type your answer first.');
      if (L.bad) return form('unreadable', 'Write each value separated by a comma, e.g. ' + t('x=1.25,\\ x=-3.75') + '.');
      var A = uniqV(L.items.map(function (x) { return x.v; }));
      var miss = T.filter(function (x) { return !A.some(function (y) { return hit(y, x); }); }), extra = A.filter(function (y) { return !T.some(function (x) { return hit(y, x); }); });
      if (!miss.length && !extra.length) return ok();
      if (A.length === T.length && extra.every(function (y) { return T.some(function (x) { return Math.abs(y - x) < 0.5 * Math.pow(10, -dp) + 1e-9; }); })) return form('round', 'Right — now round each value to the nearest ' + place + '.');
      if (A.length === T.length && extra.every(function (y) { return T.some(function (x) { return Math.abs(y - x) < 0.051; }); })) return form('places', 'Round to the nearest ' + place + ' (' + dp + ' decimal places).');
      if (o.diag) { var h = o.diag(A, T); if (h) return wrong(h.code || 'diag', h.hint); }
      if (miss.length && !extra.length) return wrong('sol-missing', o.missHint || 'Correct so far — but the horizontal line ' + t('Y_2') + ' crosses the graph twice. Run ' + code('5:intersect') + ' again with the Guess? near the other crossing.');
      if (A.length === T.length && A.every(function (y) { return T.some(function (x) { return hit(-y, x); }); })) return wrong('sol-sign', 'Check the signs of your values against the graph.');
      return wrong('value', null);
    };
  }

  /* ---------------- windows ---------------- */
  var WL = ['Xmin', 'Xmax', 'Ymin', 'Ymax'], WT = { Xmin: t('X_{\\min}'), Xmax: t('X_{\\max}'), Ymin: t('Y_{\\min}'), Ymax: t('Y_{\\max}') };
  function niceStep(span) { var c = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000]; for (var i = 0; i < c.length; i++) if (span / c[i] <= 8) return c[i]; return 2000; }
  /* a tidy window around the features (and the origin, so both axes show) */
  function niceWin(feat) {
    var xs = feat.map(function (p) { return p.x; }).concat([0]), ys = feat.map(function (p) { return p.y; }).concat([0]);
    var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
    var sx = niceStep(x1 - x0 || 1), sy = niceStep(y1 - y0 || 1);
    return { x: [cl(Math.floor(x0 / sx + 1e-9) * sx - sx), cl(Math.ceil(x1 / sx - 1e-9) * sx + sx)], y: [cl(Math.floor(y0 / sy + 1e-9) * sy - sy), cl(Math.ceil(y1 / sy - 1e-9) * sy + sy)], sx: sx, sy: sy };
  }
  function winTex(w) { return t('x:[' + nT(w.x[0]) + ',\\ ' + nT(w.x[1]) + ',\\ ' + nT(w.sx) + '],\\quad y:[' + nT(w.y[0]) + ',\\ ' + nT(w.y[1]) + ',\\ ' + nT(w.sy) + ']'); }
  /* feat: [{ x, y, name, how }] — every feature must be strictly inside; o.minX / o.minY: smallest span counted as needed */
  function winCheck(feat, o) {
    o = o || {};
    var fx = feat.map(function (p) { return p.x; }), fy = feat.map(function (p) { return p.y; });
    var needX = Math.max(o.minX || 4, Math.max.apply(null, fx) - Math.min.apply(null, fx)), needY = Math.max(o.minY || 4, Math.max.apply(null, fy) - Math.min.apply(null, fy));
    return function (resp) {
      resp = resp || [];
      var v = [];
      for (var i = 0; i < 4; i++) {
        var s = String(resp[i] == null ? '' : resp[i]).trim();
        if (!s) return form('empty', 'Fill in all four window values: ' + WL.map(function (n) { return WT[n]; }).join(', ') + '.');
        var n = num(s); if (n == null) return form('win-nan', '<b>' + WT[WL[i]] + ':</b> type a single number, like ' + t('-5') + ' or ' + t('20') + '.');
        v.push(n);
      }
      if (v[0] >= v[1]) return form('win-order', WT.Xmin + ' has to be smaller than ' + WT.Xmax + ' (otherwise the calculator shows ERR:WINDOW RANGE).');
      if (v[2] >= v[3]) return form('win-order', WT.Ymin + ' has to be smaller than ' + WT.Ymax + ' (otherwise the calculator shows ERR:WINDOW RANGE).');
      for (var j = 0; j < feat.length; j++) {
        var p = feat[j], ox = p.x < v[0] - 1e-9 ? 'to the left of ' + WT.Xmin : p.x > v[1] + 1e-9 ? 'to the right of ' + WT.Xmax : '', oy = p.y < v[2] - 1e-9 ? 'below ' + WT.Ymin : p.y > v[3] + 1e-9 ? 'above ' + WT.Ymax : '';
        if (ox || oy) return wrong('win-cut', 'Your window cuts off ' + p.name + ': it is ' + ox + (ox && oy ? ' and ' : '') + oy + '. ' + (p.how || ''));
      }
      for (j = 0; j < feat.length; j++) {
        p = feat[j];
        if (same(p.x, v[0]) || same(p.x, v[1]) || same(p.y, v[2]) || same(p.y, v[3])) return form('win-edge', 'Almost: ' + p.name + ' sits exactly on the edge of your screen, where you can’t really see it. Move that edge out a little.');
      }
      if (v[1] - v[0] > 10 * needX + 1e-9) return form('win-huge', 'Everything is on the screen, but your window is about ' + Math.round((v[1] - v[0]) / needX) + ' times wider than the features need, so the graph is squashed. Bring ' + WT.Xmin + ' and ' + WT.Xmax + ' closer in.');
      if (v[3] - v[2] > 10 * needY + 1e-9) return form('win-huge', 'Everything is on the screen, but your window is about ' + Math.round((v[3] - v[2]) / needY) + ' times taller than the features need, so the graph is squashed flat. Bring ' + WT.Ymin + ' and ' + WT.Ymax + ' closer in.');
      return ok();
    };
  }
  var WHINTS = ['Find the features first: for an ' + t('x') + '-intercept set ' + t('y=0') + '; for the ' + t('y') + '-intercept set ' + t('x=0') + '.',
    'Make ' + WT.Xmin + ' a little below the smallest ' + t('x') + '-value you need and ' + WT.Xmax + ' a little above the largest — the same for ' + t('y') + '. Any window that shows everything clearly is fine.'];
  function winPart(prompt, feat, o) {
    o = o || {};
    var w = o.win || niceWin(feat), chk = winCheck(feat, o), key = [w.x[0], w.x[1], w.y[0], w.y[1]].map(function (x) { return String(cl(x)); });
    var wide = [w.x[0] - w.sx, w.x[1] + w.sx, w.y[0] - w.sy, w.y[1] + w.sy].map(function (x) { return String(cl(x)); });
    var bad = [['-10', '10', '-10', '10'], ['0', key[1], '0', key[3]], [key[0], key[1], key[2], key[2]], [key[1], key[0], key[2], key[3]]].filter(function (b) { return chk(b).v !== 'correct'; });
    return { prompt: prompt, input: { type: 'fields', fields: WL.map(function (n) { return { label: WT[n], name: WT[n] }; }) }, check: chk, key: key,
      answer: 'One good window: ' + winTex(w) + ' (many others work too).', solution: o.sol + (o.fig !== false ? '<br>' + screen(o.fns || [], w, o.pts || []) : ''),
      hints: o.hints || WHINTS, text: o.text, good: chk(wide).v === 'correct' ? [wide] : [], bad: bad };
  }
  /* a picture of the graph in window w (fns: functions; pts: [{x, y, label}]) */
  function screen(fns, w, pts, o) {
    o = o || {};
    return HW.graph({ x: w.x, y: w.y, unitX: 280 / (w.x[1] - w.x[0]), unitY: 190 / (w.y[1] - w.y[0]), grid: w.sx, gridY: w.sy, labels: w.sx, labelsX: w.sx, labelsY: w.sy,
      fns: fns.map(function (f) { return typeof f === 'function' ? { f: f } : f; }), points: pts, max: o.max || 340, aria: o.aria || 'graph of the relation' });
  }
  function featX(x, eqTex, nm) { return { x: x, y: 0, name: nm || 'the ' + t('x') + '-intercept', how: 'To find it, set ' + t('y=0') + ' and solve ' + t(eqTex + '=0') + ' (or use ' + code('2:zero') + ').' }; }
  function featY(y, nm) { return { x: 0, y: y, name: nm || 'the ' + t('y') + '-intercept', how: 'It is the output when ' + t('x=0') + '.' }; }
  function featV(h, k, nm) { return { x: h, y: k, name: nm || 'the vertex (turning point)', how: 'Find it with ' + code('3:minimum') + ' / ' + code('4:maximum') + ', or with ' + t('x=-\\frac{b}{2a}') + '.' }; }

  /* ---- linear-relation solution pieces ---- */
  function linXint(m, b) { // y = mx + b: steps for the x-intercept
    return t(linT(m, b) + '=0\\Rightarrow ' + lin([[m, 'x']]) + '=' + nT(-b) + '\\Rightarrow x=' + vt(-b / m));
  }
  function linWinSol(m, b, w) {
    var X = -b / m;
    return 'Algebra first: ' + t('x') + '-intercept ' + linXint(m, b) + '; ' + t('y') + '-intercept ' + t('y=' + lin([[m, '(0)']]).replace('(0)', '(0)') + term(b, '', false) + '=' + nT(b)) + '.<br>' +
      'So the screen must reach from below ' + t(nT(Math.min(0, X))) + ' to above ' + t(nT(Math.max(0, X))) + ' across, and from below ' + t(nT(Math.min(0, b))) + ' to above ' + t(nT(Math.max(0, b))) + ' up and down.<br>' +
      'Calculator: ' + C.y1(linT(m, b)) + ', press ' + code('WINDOW') + ' and type the values, then ' + code('GRAPH') + '. One window that works: ' + winTex(w) + '.';
  }

  /* ---- one number with targeted diagnoses. dl: [[wrongValue, code, hint], …] (entries equal to the answer are dropped) ---- */
  function numPart(prompt, ans, dl, sol, hints, text, inp) {
    ans = cl(ans);
    dl = (dl || []).filter(function (d) { return isFinite(d[0]) && !same(d[0], ans); });
    var p = B.number(prompt, ans, function (v) { return dlFind(dl, v); }, sol, hints, text, inp);
    var c = p.check;
    p.check = function (resp) { if (looksPoint(resp)) return form('int-point', 'Just give the <b>value</b> — a single number — not an ordered pair.'); return c(resp); };
    p.key = String(ans); p.answer = t(nT(ans));
    p.bad = dl.map(function (d) { return String(cl(d[0])); });
    return p;
  }
  function mathPart(prompt, check, keyTex, sol, hints, text, keys, extra) {
    var p = B.math(prompt, check, keyTex, sol, hints, text, { keys: keys || 'fraction', vars: ['x'] });
    if (extra) { if (extra.good) p.good = extra.good; if (extra.bad) p.bad = extra.bad; if (extra.key != null) p.key = extra.key; if (extra.answer) p.answer = extra.answer; }
    return p;
  }
  /* several boxes; fl: [{ label, mode, keys }], checks, keys, answer */
  function fieldsPart(prompt, fl, checks, keys, answer, sol, hints, text, extra) {
    var p = B.fields(prompt, fl.map(function (f) { return Object.assign({ name: f.label }, f); }), checks, keys, answer, sol, hints, text);
    if (extra) { if (extra.good) p.good = extra.good; if (extra.bad) p.bad = extra.bad; }
    return p;
  }
  function mbox(label, keys) { return { label: label, mode: 'math', keys: keys || 'fraction' }; }
  function nbox(label) { return { label: label }; }
  function mc(r, prompt, opts, sol, hints, text, keepOrder) { return B.mc(r, prompt, opts, sol, hints, text, keepOrder); }

  /* ---- evaluating a relation: diagnoses ---- */
  function linEvalDl(m, b, x) {
    return [[-m * x + b, 'calc-sign', 'Watch the sign when you multiply: ' + t(nT(m) + '\\times' + sgp(x) + '=' + nT(m * x)) + '.'],
      [m * x, 'calc-no-b', 'Don’t forget the constant term ' + t(nT(b)) + '.'],
      [m * x - b, 'calc-sign', 'Check the sign of the constant term: it is ' + t(term(b, '', false)) + '.'],
      [(x - b) / m, 'calc-solved', 'You were given ' + t('x') + ', so substitute it for ' + t('x') + ' — you don’t solve anything here.']];
  }
  /* ---- x for a given y on a line y = mx + b ---- */
  function linInvDl(m, b, y) {
    return [[(y + b) / m, 'inv-sign', 'Undo the constant first: subtract ' + t(nT(b)) + ' from both sides (' + t(nT(y) + '-' + sgp(b)) + '), then divide.'],
      [y - b, 'inv-no-div', 'Nearly: after moving the constant, divide by the coefficient ' + t(nT(m)) + '.'],
      [(y - b) * m, 'inv-mult', 'To undo “times ' + t(nT(m)) + '”, <b>divide</b> by ' + t(nT(m)) + '.'],
      [m * y + b, 'inv-eval', 'You substituted ' + t(nT(y)) + ' for ' + t('x') + '. Here ' + t(nT(y)) + ' is the <b>output</b> ' + t('y') + ' — find the input that gives it.'],
      [-(y - b) / m, 'inv-neg', 'Check the sign when you divide by ' + t(nT(m)) + '.']];
  }

  HW.defineLesson({
    id: 'u5l5', unit: 5, num: '5', title: 'Graphing Calculator Techniques for Relations', outcome: 'RF1',
    blurb: 'Use a graphing calculator’s window, table, trace, intersect, zero, value and maximum/minimum features — and check every answer algebraically.',
    questions: [
      /* ===== Q1 windows ===== */
      { num: '1', section: 'Part A — Windows, tables, trace and intersect', stem: 'For each relation: graph it on a calculator and adjust the window until the ' + t('x') + '- and ' + t('y') + '-intercepts (where they exist) are visible. Record the window you used. (' + t('X_{\\text{scl}}') + ' and ' + t('Y_{\\text{scl}}') + ' are up to you — they only space the tick marks.)', parts: [
        { id: '1a', level: 'BEG', make: function (r) {
          var o = pickWhere(function () { var m = r.pick([0.2, 0.25, 0.4, 0.5, 0.75]); return { m: m, X: r.int(11, 30) }; }, function (o) { var b = -o.m * o.X; return same(b, Math.round(b)) && b <= -3 && b >= -10; });
          var m = o.m, b = cl(-m * o.X), feat = [featX(o.X, linT(m, b)), featY(b)], w = niceWin(feat);
          return winPart(t('y=' + linT(m, b)), feat, { sol: linWinSol(m, b, w), fns: [lf(m, b)], pts: [{ x: o.X, y: 0, label: '(' + o.X + ', 0)' }, { x: 0, y: b, label: '(0, ' + nT(b) + ')' }], text: 'window for y=' + linT(m, b) });
        } },
        { id: '1b', level: 'BEG', make: function (r) {
          var o = pickWhere(function () { return { m: r.int(2, 5), X: r.int(4, 9) }; }, function (o) { return o.m * o.X > 10 && o.m * o.X <= 45; });
          var m = o.m, b = -m * o.X, feat = [featX(o.X, linT(m, b)), featY(b)], w = niceWin(feat);
          return winPart(t('y=' + linT(m, b)), feat, { sol: linWinSol(m, b, w), fns: [lf(m, b)], pts: [{ x: o.X, y: 0, label: '(' + o.X + ', 0)' }, { x: 0, y: b, label: '(0, ' + b + ')' }], text: 'window for y=' + linT(m, b) });
        } },
        { id: '1c', level: 'BEG', make: function (r) {
          var b = r.int(12, 25), feat = [featX(b, linT(-1, b)), featY(b)], w = niceWin(feat);
          return winPart(t('y=' + linT(-1, b)), feat, { sol: linWinSol(-1, b, w), fns: [lf(-1, b)], pts: [{ x: b, y: 0, label: '(' + b + ', 0)' }, { x: 0, y: b, label: '(0, ' + b + ')' }], text: 'window for y=-x+' + b });
        } },
        { id: '1d', level: 'BEG', make: function (r) {
          var o = pickWhere(function () { return { m: -r.int(2, 5), X: -r.int(6, 12) }; }, function (o) { return -o.m * o.X <= -11 && -o.m * o.X >= -50; });
          var m = o.m, b = -m * o.X, feat = [featX(o.X, linT(m, b)), featY(b)], w = niceWin(feat);
          return winPart(t('y=' + linT(m, b)), feat, { sol: linWinSol(m, b, w), fns: [lf(m, b)], pts: [{ x: o.X, y: 0, label: '(' + o.X + ', 0)' }, { x: 0, y: b, label: '(0, ' + b + ')' }], text: 'window for y=' + linT(m, b) });
        } },
        { id: '1e', level: 'EMG', make: function (r) {
          var c = r.pick(range(11, 30).filter(function (n) { return !isSq(n); })), s = Math.sqrt(c);
          var feat = [featX(s, 'x^{2}-' + c, 'the right-hand ' + t('x') + '-intercept'), featX(-s, 'x^{2}-' + c, 'the left-hand ' + t('x') + '-intercept'), featY(-c, 'the ' + t('y') + '-intercept (also the vertex)')], w = niceWin(feat);
          var sol = 'Algebra first: ' + t('x') + '-intercepts ' + t('x^{2}-' + c + '=0\\Rightarrow x^{2}=' + c + '\\Rightarrow x=\\pm' + sqrtTex(c) + '\\approx\\pm' + rnd(s, 2)) + '; ' + t('y') + '-intercept ' + t('y=0^{2}-' + c + '=-' + c) + ' (the vertex, ' + t('(0,-' + c + ')') + ').<br>' +
            'The standard window ' + t('y:[-10,\\ 10]') + ' cuts off the bottom of the parabola. Calculator: ' + C.y1('x^{2}-' + c) + ' (use ' + code('x²') + '), then ' + code('WINDOW') + '. One window that works: ' + winTex(w) + '.';
          return winPart(t('y=x^{2}-' + c), feat, { sol: sol, fns: [qf(1, 0, -c)], pts: [{ x: s, y: 0, label: nT(rnd(s, 2)) }, { x: -s, y: 0 }, { x: 0, y: -c, label: '(0, −' + c + ')' }], text: 'window for y=x^2-' + c });
        } },
        { id: '1f', level: 'BEG', make: function (r) {
          var a = r.pick([2, 2, 3]), c = r.pick([0, 0, 1, 2]), y0 = 1 + c, rel = a + '^{x}' + (c ? '+' + c : '');
          var feat = [featY(y0), { x: 0, y: 0, name: 'the ' + t('x') + '-axis (you need it on the screen to see that the curve never reaches it)', how: 'Make ' + WT.Ymin + ' negative.' }], w = { x: [-3, 5], y: [-2, Math.max(10, Math.ceil((Math.pow(a, 3) + c) / 5) * 5 + 5)], sx: 1, sy: 5 };
          var sol = 'Algebra first: ' + t('y') + '-intercept ' + t('y=' + a + '^{0}' + (c ? '+' + c : '') + '=' + (c ? '1+' + c + '=' : '') + y0) + '. There is <b>no</b> ' + t('x') + '-intercept: ' + t(a + '^{x}') + ' is always positive, so ' + t('y') + ' is always more than ' + t(c ? String(c) : '0') + ' — ' + (c ? 'the graph stays above the line ' + t('y=' + c) + '.' : 'the curve gets closer and closer to the ' + t('x') + '-axis on the left but never touches it.') + '<br>' +
            'Calculator: ' + C.y1(rel) + ' (use the ' + code('^') + ' key). The standard window already shows the ' + t('y') + '-intercept; a window such as ' + winTex(w) + ' shows the curve rising more clearly.';
          return winPart(t('y=' + rel), feat, { win: w, sol: sol, fns: [function (x) { return Math.pow(a, x) + c; }], pts: [{ x: 0, y: y0, label: '(0, ' + y0 + ')' }], minY: 10, text: 'window for y=' + rel });
        } }] },

      /* ===== Q2 ===== */
      { num: '2', stem: function (sh) { return 'Consider the equation ' + t('y=' + linT(-sh.m, sh.b)) + '.'; },
        shared: function (r) {
          var o = pickWhere(function () { return { m: r.int(2, 6), X: r.int(6, 12) }; }, function (o) { return o.m * o.X > 10 && o.m * o.X <= 60; });
          var x1 = r.int(1, o.X - 1), x2 = r.pick(range(1, o.X - 1).filter(function (v) { return v !== x1; }));
          return { m: o.m, X: o.X, b: o.m * o.X, x1: x1, y1: o.m * (o.X - x1), x2: x2, y2: o.m * (o.X - x2) };
        },
        parts: [
          { id: '2a', level: 'BEG', make: function (r, s) {
            var feat = [featX(s.X, linT(-s.m, s.b)), featY(s.b)], w = niceWin(feat);
            return winPart('Use a graphing calculator to graph the relation, and write a suitable window that shows both intercepts.', feat, { sol: linWinSol(-s.m, s.b, w), fns: [lf(-s.m, s.b)], pts: [{ x: s.X, y: 0, label: '(' + s.X + ', 0)' }, { x: 0, y: s.b, label: '(0, ' + s.b + ')' }], text: 'window y=-' + s.m + 'x+' + s.b });
          } },
          { id: '2b', level: 'LIM', make: function (r, s) {
            return numPart('Use a graphing calculator to determine the value of ' + t('y') + ' when ' + t('x=' + s.x1) + '.', s.y1, linEvalDl(-s.m, s.b, s.x1),
              'Calculator: graph ' + code('Y1') + ', then ' + C.trace(s.x1) + '. The screen shows ' + t('Y=' + s.y1) + '.<br>Check: ' + t('y=-' + s.m + '(' + s.x1 + ')+' + s.b + '=' + (-s.m * s.x1) + '+' + s.b + '=' + s.y1) + ' ✓',
              ['Press ' + code('TRACE') + ', type the ' + t('x') + '-value and press ' + code('ENTER') + ': the output appears at the bottom of the screen.', 'Or substitute: multiply first, then add.'], 'y at x=' + s.x1);
          } },
          { id: '2c', level: 'BEG', make: function (r, s) {
            var y = s.y1;
            return mc(r, 'Which work <b>algebraically verifies</b> the answer to (b)?', [
              { html: t('y=-' + s.m + '(' + s.x1 + ')+' + s.b + '=' + (-s.m * s.x1) + '+' + s.b + '=' + y), right: true },
              { html: t('y=-' + s.m + '(' + s.x1 + '+' + s.b + ')=' + (-s.m * (s.x1 + s.b))), why: 'The ' + t(s.b) + ' is added <i>after</i> multiplying — it is not inside the bracket. Multiply ' + t('-' + s.m + '\\times ' + s.x1) + ' first.' },
              { html: t('y=' + s.m + '(' + s.x1 + ')+' + s.b + '=' + (s.m * s.x1 + s.b)), why: 'The coefficient is ' + t('-' + s.m) + ', so ' + t('-' + s.m + '(' + s.x1 + ')') + ' is negative.' },
              { html: t(s.x1 + '=-' + s.m + 'x+' + s.b + '\\Rightarrow x=' + vt((s.b - s.x1) / s.m)), why: t(s.x1) + ' is the <b>input</b> ' + t('x') + ', not the output ' + t('y') + '. Substitute it for ' + t('x') + '.' }],
              'Substitute ' + t('x=' + s.x1) + ' and follow the order of operations: ' + t('y=-' + s.m + '(' + s.x1 + ')+' + s.b + '=' + (-s.m * s.x1) + '+' + s.b + '=' + y) + ', which matches the calculator.', ['Replace ' + t('x') + ' with the given input, multiply, then add.'], 'verify y at x=' + s.x1);
          } },
          { id: '2d', level: 'BEG', make: function (r, s) {
            return numPart('Use a graphing calculator to determine the value of ' + t('x') + ' when ' + t('y=' + s.y2) + '.', s.x2, linInvDl(-s.m, s.b, s.y2),
              'Calculator: ' + C.inter(s.y2) + '. The intersection point is ' + t('(' + s.x2 + ',\\ ' + s.y2 + ')') + ', so ' + t('x=' + s.x2) + '.<br>Check: ' + t(s.y2 + '=-' + s.m + 'x+' + s.b + '\\Rightarrow -' + s.m + 'x=' + (s.y2 - s.b) + '\\Rightarrow x=' + s.x2) + ' ✓',
              ['Put the given output in ' + code('Y2') + ' and use ' + code('5:intersect') + ': the crossing point’s ' + t('x') + '-coordinate is the answer.', 'Or solve ' + t(s.y2 + '=-' + s.m + 'x+' + s.b) + ': subtract ' + t(s.b) + ', then divide by ' + t('-' + s.m) + '.'], 'x when y=' + s.y2);
          } },
          { id: '2e', level: 'BEG', make: function (r, s) {
            var d = s.y2 - s.b;
            return mc(r, 'Which work <b>algebraically verifies</b> the answer to (d)?', [
              { html: t(s.y2 + '=-' + s.m + 'x+' + s.b + '\\Rightarrow -' + s.m + 'x=' + d + '\\Rightarrow x=' + s.x2), right: true },
              { html: t(s.y2 + '=-' + s.m + 'x+' + s.b + '\\Rightarrow -' + s.m + 'x=' + (s.y2 + s.b) + '\\Rightarrow x=' + vt(-(s.y2 + s.b) / s.m)), why: 'To move ' + t('+' + s.b) + ' to the other side, <b>subtract</b> it: ' + t(s.y2 + '-' + s.b + '=' + d) + '.' },
              { html: t('y=-' + s.m + '(' + s.y2 + ')+' + s.b + '=' + (-s.m * s.y2 + s.b)), why: t(s.y2) + ' is the <b>output</b> ' + t('y') + '. Substituting it for ' + t('x') + ' answers a different question.' },
              { html: t(s.y2 + '=-' + s.m + 'x+' + s.b + '\\Rightarrow -' + s.m + 'x=' + d + '\\Rightarrow x=-' + s.x2), why: 'A negative divided by a negative is positive: ' + t(d + '\\div(-' + s.m + ')=' + s.x2) + '.' }],
              'Set ' + t('y=' + s.y2) + ' and solve: ' + t(s.y2 + '=-' + s.m + 'x+' + s.b + '\\Rightarrow -' + s.m + 'x=' + d + '\\Rightarrow x=' + s.x2) + ', which matches the intersection point.', ['Replace ' + t('y') + ' with the given output, then solve for ' + t('x') + '.'], 'verify x when y=' + s.y2);
          } }] },

      /* ===== Q3 y from x ===== */
      { num: '3', stem: 'Given the ' + t('x') + '-coordinate, determine the corresponding ' + t('y') + '-coordinate using the graphing features of a calculator (trace, ' + code('1:value') + ' or the table). Then check it by substituting.', parts: [
        { id: '3a', level: 'LIM', make: function (r) {
          var m = r.int(2, 9), b = -r.int(1, 9), x = r.int(5, 12), y = m * x + b;
          return numPart(t('y=' + linT(m, b)) + ', ' + t('x=' + x) + ', ' + t('y=?'), y, linEvalDl(m, b, x), 'Calculator: ' + C.trace(x) + ' gives ' + t('Y=' + y) + '. Check: ' + t('y=' + m + '(' + x + ')' + term(b, '', false) + '=' + (m * x) + term(b, '', false) + '=' + y) + ' ✓',
            ['Trace to ' + t('x=' + x) + ', or substitute: multiply first, then subtract.'], 'y=' + linT(m, b) + ' at ' + x);
        } },
        { id: '3b', level: 'BEG', make: function (r) {
          var o = pickWhere(function () { var d = r.pick([0.5, 0.25, 0.2, 1.5]); return { d: d, x: r.int(11, 40), b: r.int(5, 15) }; }, function (o) { return same(o.d * o.x, Math.round(o.d * o.x)) && o.x > 10; });
          var y = cl(o.d * o.x + o.b), dl = linEvalDl(o.d, o.b, o.x).concat([[cl(o.d * 10 * o.x + o.b), 'calc-dec', 'Check the decimal: ' + t(nT(o.d) + '\\times ' + o.x + '=' + nT(o.d * o.x)) + '.']]);
          return numPart(t('y=' + linT(o.d, o.b)) + ', ' + t('x=' + o.x) + ', ' + t('y=?'), y, dl,
            t('x=' + o.x) + ' is outside the standard window (' + t('X_{\\max}=10') + '), so trace can’t reach it: use ' + C.table(o.x) + ', or widen the window first. The output is ' + t(nT(y)) + '.<br>Check: ' + t('y=' + nT(o.d) + '(' + o.x + ')+' + o.b + '=' + nT(o.d * o.x) + '+' + o.b + '=' + nT(y)) + ' ✓',
            ['Trace only works between ' + WT.Xmin + ' and ' + WT.Xmax + '. Use the table in Ask mode, or widen the window.', 'Or substitute: ' + t(nT(o.d) + '\\times ' + o.x) + ', then add.'], 'y=' + linT(o.d, o.b) + ' at ' + o.x);
        } },
        { id: '3c', level: 'BEG', make: function (r) {
          var m = -r.int(2, 6), b = r.int(5, 20), x = -r.int(11, 15), y = m * x + b;
          return numPart(t('y=' + linT(m, b)) + ', ' + t('x=' + x) + ', ' + t('y=?'), y, linEvalDl(m, b, x),
            t('x=' + x) + ' is outside the standard window, so use ' + C.table(x) + ' or widen the window: ' + t('y=' + y) + '.<br>Check: ' + t('y=' + m + '(' + x + ')+' + b + '=' + (m * x) + '+' + b + '=' + y) + ' ✓',
            ['A negative times a negative is positive.', 'Trace can’t reach an input outside the window — use the table in Ask mode.'], 'y=' + linT(m, b) + ' at ' + x);
        } },
        { id: '3d', level: 'LIM', make: function (r) {
          var q = r.pick([2, 3, 4, 5, 6]), p = r.pick(range(1, 9).filter(function (v) { return gcd(v, q) === 1 && v !== q; })), b = -r.int(1, 9);
          var rel = lin([[[p, q], 'x'], [b, '']]);
          return numPart(t('y=' + rel) + ', ' + t('x=0') + ', ' + t('y=?'), b, [[p / q, 'calc-no-b', 'At ' + t('x=0') + ' the ' + t('x') + '-term is ' + t('0') + ' — only the constant is left.'], [-b, 'calc-sign', 'Check the sign of the constant term.'], [p / q + b, 'calc-solved', 'Substitute ' + t('x=0') + ': ' + t('\\frac{' + p + '}{' + q + '}(0)=0') + '.']],
            'Calculator: ' + C.value0 + ' gives ' + t('Y=' + b) + '. (Type the fraction coefficient in brackets: ' + code('(' + p + '/' + q + ')X' + (b < 0 ? '−' : '+') + Math.abs(b)) + '.)<br>Check: ' + t('y=\\frac{' + p + '}{' + q + '}(0)' + term(b, '', false) + '=' + b) + ' ✓',
            ['At ' + t('x=0') + ' the ' + t('x') + '-term disappears.'], 'y=' + rel + ' at 0');
        } },
        { id: '3e', level: 'BEG', make: function (r) {
          var b = r.int(2, 6), c = -r.int(3, 12), x = -r.int(3, 8), f = qf(1, b, c), y = f(x);
          return numPart(t('y=' + quadT(1, b, c)) + ', ' + t('x=' + x) + ', ' + t('y=?'), y, [[-x * x + b * x + c, 'calc-sq-neg', 'Square the whole input: ' + t('(' + x + ')^{2}=' + (x * x)) + ', which is positive. (On the calculator, put a negative input in brackets before squaring.)'],
            [x * x - b * x + c, 'calc-sign', 'Check ' + t(b + '(' + x + ')=' + (b * x)) + ' — it’s negative.'], [x * x + b * x - c, 'calc-sign', 'Check the sign of the constant term.']],
            'Calculator: ' + C.trace(x) + ' gives ' + t('Y=' + y) + '.<br>Check: ' + t('y=(' + x + ')^{2}+' + b + '(' + x + ')' + term(c, '', false) + '=' + (x * x) + (b * x < 0 ? '' : '+') + (b * x) + term(c, '', false) + '=' + y) + ' ✓',
            ['Square the input first (a negative squared is positive), then multiply, then add.'], 'y=' + quadT(1, b, c) + ' at ' + x);
        } },
        { id: '3f', level: 'BEG', make: function (r) {
          var c = r.int(5, 15), x = -r.int(12, 25), y = -x - c;
          return numPart(t('y=|x|-' + c) + ' (enter ' + t('|x|') + ' as ' + code('MATH') + ' ▸' + code('NUM') + ' ' + code('1:abs(') + '), ' + t('x=' + x) + ', ' + t('y=?'), y,
            [[x - c, 'calc-abs', 'The absolute value makes the input positive first: ' + t('|' + x + '|=' + (-x)) + '.'], [-x + c, 'calc-sign', 'Then subtract ' + t(c) + '.'], [x + c, 'calc-abs', t('|' + x + '|=' + (-x)) + ', then subtract ' + t(c) + '.']],
            t('x=' + x) + ' is outside the standard window, so use the table in Ask mode (or widen the window): ' + t('y=' + y) + '.<br>Check: ' + t('y=|' + x + '|-' + c + '=' + (-x) + '-' + c + '=' + y) + ' ✓',
            ['The absolute value of a negative number is its distance from 0 — a positive number.'], 'y=|x|-' + c + ' at ' + x);
        } }] },

      /* ===== Q4 x from y ===== */
      { num: '4', stem: 'Given the ' + t('y') + '-coordinate, determine the corresponding ' + t('x') + '-coordinate(s) using the graphing features of a calculator (the given output in ' + code('Y2') + ', then ' + code('5:intersect') + '). Write your answer to the nearest hundredth where necessary.', parts: [
        { id: '4a', level: 'BEG', make: function (r) {
          var m = r.int(2, 9), b = -r.int(1, 9), x = r.int(2, 10), y = m * x + b;
          return numPart(t('y=' + linT(m, b)) + ', ' + t('y=' + y) + ', ' + t('x=?'), x, linInvDl(m, b, y),
            'Calculator: ' + C.inter(y) + ' → crossing point ' + t('(' + x + ',\\ ' + y + ')') + '.<br>Check: ' + t(y + '=' + linT(m, b) + '\\Rightarrow ' + m + 'x=' + (y - b) + '\\Rightarrow x=' + x) + ' ✓',
            ['Undo the constant first, then divide by the coefficient of ' + t('x') + '.'], 'x when ' + linT(m, b) + '=' + y);
        } },
        { id: '4b', level: 'BEG', make: function (r) {
          var o = pickWhere(function () { return { d: r.pick([0.5, 0.25, 0.2]), x: -r.int(2, 12), b: r.int(5, 15) }; }, function (o) { return same(o.d * o.x, Math.round(o.d * o.x)); });
          var y = cl(o.d * o.x + o.b);
          return numPart(t('y=' + linT(o.d, o.b)) + ', ' + t('y=' + nT(y)) + ', ' + t('x=?'), o.x, linInvDl(o.d, o.b, y),
            'Calculator: ' + C.inter(y) + ' → crossing point ' + t('(' + o.x + ',\\ ' + nT(y) + ')') + '.<br>Check: ' + t(nT(y) + '=' + linT(o.d, o.b) + '\\Rightarrow ' + nT(o.d) + 'x=' + nT(y - o.b) + '\\Rightarrow x=\\frac{' + nT(y - o.b) + '}{' + nT(o.d) + '}=' + o.x) + ' ✓',
            ['The output ' + t(nT(y)) + ' is less than the ' + t('y') + '-intercept ' + t(o.b) + ' on a rising line, so the input must be negative.', 'Subtract ' + t(o.b) + ', then divide by ' + t(nT(o.d)) + '.'], 'x when ' + linT(o.d, o.b) + '=' + y);
        } },
        { id: '4c', level: 'BEG', make: function (r) {
          var m = -r.int(2, 6), b = r.int(5, 20), x = -r.int(2, 8), y = m * x + b;
          return numPart(t('y=' + linT(m, b)) + ', ' + t('y=' + y) + ', ' + t('x=?'), x, linInvDl(m, b, y),
            'Calculator: ' + C.inter(y) + ' → crossing point ' + t('(' + x + ',\\ ' + y + ')') + '.<br>Check: ' + t(y + '=' + linT(m, b) + '\\Rightarrow ' + m + 'x=' + (y - b) + '\\Rightarrow x=' + x) + ' ✓',
            ['Subtract ' + t(b) + ' from both sides, then divide by ' + t(m) + ' (a negative).'], 'x when ' + linT(m, b) + '=' + y);
        } },
        { id: '4d', level: 'BEG', make: function (r) {
          var o = pickWhere(function () { var q = r.pick([2, 3, 4, 5]); return { q: q, p: r.int(3, 9), k: r.int(1, 4), b: -r.int(1, 9) }; }, function (o) { return gcd(o.p, o.q) === 1 && o.p !== o.q; });
          var x = o.q * o.k, y = o.p * o.k + o.b, rel = lin([[[o.p, o.q], 'x'], [o.b, '']]);
          return numPart(t('y=' + rel) + ', ' + t('y=' + y) + ', ' + t('x=?'), x, [[(y - o.b) * o.p / o.q, 'inv-mult', 'To undo “times ' + t('\\frac{' + o.p + '}{' + o.q + '}') + '”, multiply by its reciprocal ' + t('\\frac{' + o.q + '}{' + o.p + '}') + '.'], [(y + o.b) * o.q / o.p, 'inv-sign', 'Add ' + t(-o.b) + ' to both sides first.'], [y - o.b, 'inv-no-div', 'Then multiply by ' + t('\\frac{' + o.q + '}{' + o.p + '}') + '.'], [o.p / o.q * y + o.b, 'inv-eval', t(y) + ' is the output ' + t('y') + ' — find the input.']],
            'Calculator: ' + C.inter(y) + ' → crossing point ' + t('(' + x + ',\\ ' + y + ')') + '.<br>Check: ' + t('\\frac{' + o.p + '}{' + o.q + '}x' + term(o.b, '', false) + '=' + y + '\\Rightarrow \\frac{' + o.p + '}{' + o.q + '}x=' + (y - o.b) + '\\Rightarrow x=' + (y - o.b) + '\\times\\frac{' + o.q + '}{' + o.p + '}=' + x) + ' ✓',
            ['Add ' + t(-o.b) + ' to both sides, then multiply by the reciprocal ' + t('\\frac{' + o.q + '}{' + o.p + '}') + '.'], 'x when ' + rel + '=' + y);
        } },
        { id: '4e', level: 'EMG', make: function (r) {
          var o = pickWhere(function () { return { b: r.int(2, 6), c: -r.int(3, 12), k: r.int(-8, 8) }; }, function (o) {
            var D = o.b * o.b - 4 * (o.c - o.k); if (D <= 0 || isSq(D)) return false;
            var r1 = (-o.b + Math.sqrt(D)) / 2, r2 = (-o.b - Math.sqrt(D)) / 2;
            return [r1, r2].every(function (z) { var f = Math.abs(z * 100 - Math.floor(z * 100) - 0.5); return f > 0.05; }) && o.k !== 0;
          });
          var D = o.b * o.b - 4 * (o.c - o.k), r1 = (-o.b + Math.sqrt(D)) / 2, r2 = (-o.b - Math.sqrt(D)) / 2, rel = quadT(1, o.b, o.c);
          var Dz = o.b * o.b - 4 * o.c, zs = Dz >= 0 ? [(-o.b + Math.sqrt(Dz)) / 2, (-o.b - Math.sqrt(Dz)) / 2] : null;
          var p = mathPart(t('y=' + rel) + ', ' + t('y=' + o.k) + ', ' + t('x=?') + ' (two values)', approxSet([r1, r2], 2, { diag: function (A) {
            if (zs && sameVals(A.map(function (v) { return rnd(v, 2); }), zs.map(function (v) { return rnd(v, 2); }))) return { code: 'used-zero', hint: 'Those are the ' + t('x') + '-intercepts, where ' + t('y=0') + '. Put ' + t(o.k) + ' (the given output) into ' + code('Y2') + ' and use ' + code('5:intersect') + '.' };
            return null;
          } }), 'x=' + nT(rnd(r1, 2)) + ',\\ x=' + nT(rnd(r2, 2)),
            'Calculator: ' + C.y1(rel) + ', ' + C.inter(o.k) + '. The horizontal line crosses the parabola <b>twice</b>, so run ' + code('5:intersect') + ' twice, with the Guess? near each crossing: ' + t('x\\approx ' + nT(rnd(r1, 2))) + ' and ' + t('x\\approx ' + nT(rnd(r2, 2))) + '.<br>' +
            'Check: ' + t(nT(rnd(r1, 2)) + '^{2}+' + o.b + '(' + nT(rnd(r1, 2)) + ')' + term(o.c, '', false) + '\\approx ' + nT(rnd(qf(1, o.b, o.c)(rnd(r1, 2)), 2)) + '\\approx ' + o.k) + ' ✓ (exactly, ' + t('x^{2}+' + o.b + 'x' + term(o.c - o.k, '', false) + '=0') + ' gives ' + t('x=\\frac{-' + o.b + '\\pm\\sqrt{' + D + '}}{2}') + ').',
            ['A horizontal line ' + t('Y_2=' + o.k) + ' can cross a parabola twice — look for both crossings.', 'Use ' + code('5:intersect') + ' once for each crossing, moving the Guess? near the one you want.'], 'x when ' + rel + '=' + o.k, 'solutions',
            { bad: zs ? [zs.map(function (v) { return nT(rnd(v, 2)); }).join(', ')] : [], good: ['x=' + nT(rnd(r2, 2)) + ', x=' + nT(rnd(r1, 2)), vt(-o.b / 2) + '\\pm\\frac{\\sqrt{' + D + '}}{2}'] });
          return p;
        } },
        { id: '4f', level: 'EMG', make: function (r) {
          var c = r.int(5, 15), k = r.int(5, 20), v = k + c;
          return mathPart(t('y=|x|-' + c) + ', ' + t('y=' + k) + ', ' + t('x=?') + ' (two values)', exactSet([v, -v], { missHint: 'The V-shaped graph has two arms, and the line ' + t('Y_2=' + k) + ' crosses both. What negative input gives the same output?', diag: function (A) {
            if (sameVals(A, [k - c, c - k]) || sameVals(A, [k - c])) return { code: 'abs-sub', hint: 'Add ' + t(c) + ' to both sides: ' + t('|x|=' + k + '+' + c) + '.' };
            return null;
          } }), 'x=' + v + ',\\ x=-' + v,
            'Calculator: ' + C.y1('|x|-' + c) + ', ' + C.inter(k) + ' (widen the window, e.g. ' + t('x:[-' + (Math.ceil(v / 10) * 10 + 10) + ',\\ ' + (Math.ceil(v / 10) * 10 + 10) + ',\\ 5]') + ', ' + t('y:[-' + (c + 5) + ',\\ ' + (k + 10) + ',\\ 5]') + '). It crosses each arm of the V once: ' + t('x=' + v) + ' and ' + t('x=-' + v) + '.<br>Check: ' + t('|\\pm' + v + '|-' + c + '=' + v + '-' + c + '=' + k) + ' ✓',
            ['Two inputs have the same absolute value: a number and its opposite.'], 'x when |x|-' + c + '=' + k, 'solutions', { bad: [String(v), String(k - c)], good: ['\\pm ' + v, '-' + v + ', ' + v] });
        } }] },

      /* ===== Q5 ===== */
      { num: '5', stem: function (sh) { return 'Consider the relation given by the equation ' + t('y=' + quadT(sh.a, 0, sh.c)) + '.'; },
        shared: function (r) {
          return pickWhere(function () {
            var a = r.pick([-0.4, -0.4, -0.2, -0.5, -0.6]), c = r.int(12, 24), s = r.pick([8, 12, 18, 20, 27, 28, 32, 45, 50]);
            return { a: a, c: c, s: s, T: cl(c + a * s), X2: c / -a };
          }, function (o) { var R = Math.sqrt(o.X2); return R > 4.5 && R < 11 && !isSq(Math.round(o.X2 * 1e6) / 1e6) && o.s < o.X2 - 1 && o.T > 0 && same(o.T * 100, Math.round(o.T * 100)) && Math.abs(Math.sqrt(o.s) * 100 % 1 - 0.5) > 0.05; });
        },
        parts: [
          { id: '5a', level: 'BEG', make: function (r, s) {
            var xs = [-9, -6, -3, 0, 3, 6], f = qf(s.a, 0, s.c), ys = xs.map(function (x) { return cl(f(x)); });
            var checks = xs.map(function (x, i) {
              var dl = [[cl(s.c - s.a * x * x), 'calc-sq-neg', 'Square ' + t(x) + ' first (' + t('(' + x + ')^{2}=' + x * x) + '), then multiply by ' + t(nT(s.a)) + ' — the result is negative.'], [cl(Math.pow(s.a * x, 2) + s.c), 'calc-coef-sq', 'Only ' + t('x') + ' is squared, not ' + t(nT(s.a)) + ': ' + t(nT(s.a) + '\\times ' + x * x) + '.'], [cl(s.a * x * x), 'calc-no-b', 'Don’t forget to add ' + t(s.c) + '.']];
              return K.number(ys[i], function (v) { return dlFind(dl.filter(function (d) { return !same(d[0], ys[i]); }), v); });
            });
            return fieldsPart('Use the table set and table features of the calculator to complete the table of values.' + HW.valueTable([[t('x') + ' (input)'].concat(xs), [t('y') + ' (output)'].concat(xs.map(function () { return '?'; }))]),
              xs.map(function (x) { return nbox(t('x=' + x) + ':&nbsp;' + t('y=')); }), checks, ys.map(String), HW.valueTable([[t('x')].concat(xs), [t('y')].concat(ys)]),
              'Calculator: ' + C.y1(quadT(s.a, 0, s.c)) + ', then ' + code('2ND') + ' ' + code('WINDOW') + ' (TBLSET): ' + code('TblStart = −9') + ', ' + code('ΔTbl = 3') + '; ' + code('2ND') + ' ' + code('GRAPH') + ' shows the table.<br>Check one: ' + t('y=' + nT(s.a) + '(-9)^{2}+' + s.c + '=' + nT(s.a) + '(81)+' + s.c + '=' + nT(s.a * 81) + '+' + s.c + '=' + nT(ys[0])) + ' ✓' + HW.valueTable([[t('x')].concat(xs), [t('y')].concat(ys)]),
              ['Square the input first, multiply by ' + t(nT(s.a)) + ', then add ' + t(s.c) + '.', 'The table should start at ' + t('-9') + ' and go up by ' + t('3') + '.'], 'table for ' + quadT(s.a, 0, s.c));
          } },
          { id: '5b', sub: 'b–c', level: 'BEG', make: function (r, s) {
            var R = Math.sqrt(s.X2), rel = quadT(s.a, 0, s.c);
            var feat = [featX(R, rel, 'the right-hand ' + t('x') + '-intercept'), featX(-R, rel, 'the left-hand ' + t('x') + '-intercept'), featV(0, s.c, 'the vertex (the highest point)')], w = niceWin(feat);
            return winPart('Sketch the graph on your own paper using an appropriate window, and state the window you used. It must show the vertex and both ' + t('x') + '-intercepts.', feat, {
              sol: 'Features: the vertex is ' + t('(0,\\ ' + s.c + ')') + ' (the ' + t('y') + '-intercept); ' + t('x') + '-intercepts: ' + t(rel + '=0\\Rightarrow x^{2}=\\frac{' + s.c + '}{' + nT(-s.a) + '}=' + nT(s.X2) + '\\Rightarrow x\\approx\\pm' + rnd(R, 2)) + '.<br>Calculator: graph ' + code('Y1') + ', ' + code('WINDOW') + ', ' + code('GRAPH') + '. One window that works: ' + winTex(w) + '.',
              fns: [qf(s.a, 0, s.c)], pts: [{ x: R, y: 0, label: nT(rnd(R, 2)) }, { x: -R, y: 0 }, { x: 0, y: s.c, label: '(0, ' + s.c + ')' }], text: 'window for ' + rel });
          } },
          { id: '5c', sub: 'd i', level: 'BEG', make: function (r, s) {
            var y = cl(s.a * 225 + s.c);
            return numPart('Use the appropriate features of a calculator to determine the value of ' + t('y') + ' when ' + t('x=15') + '.', y, [[cl(-s.a * 225 + s.c), 'calc-sign', 'Square first, then multiply by ' + t(nT(s.a)) + ': the product is negative.'], [cl(Math.pow(s.a * 15, 2) + s.c), 'calc-coef-sq', 'Only ' + t('x') + ' is squared: ' + t(nT(s.a) + '(15)^{2}=' + nT(s.a) + '(225)') + '.'], [cl(s.a * 30 + s.c), 'calc-dec', t('15^{2}=225') + ', not ' + t('30') + '.']],
              t('x=15') + ' is outside a window like ' + t('x:[-11,\\ 11]') + ', so trace and ' + code('1:value') + ' give ERR:INVALID. Use ' + C.table(15) + ' (or widen the window): ' + t('y=' + nT(y)) + '.<br>Check: ' + t(nT(s.a) + '(15)^{2}+' + s.c + '=' + nT(s.a * 225) + '+' + s.c + '=' + nT(y)) + ' ✓',
              ['Trace and value only accept inputs inside the window. The table in Ask mode works for any input.'], 'y at x=15');
          } },
          { id: '5d', sub: 'd ii', level: 'EMG', make: function (r, s) {
            var v = Math.sqrt(s.s), rel = quadT(s.a, 0, s.c);
            return mathPart('Use the appropriate features of a calculator to determine the values of ' + t('x') + ' when ' + t('y=' + nT(s.T)) + '. Round to the nearest hundredth.', approxSet([v, -v], 2, { missHint: 'The line ' + t('Y_2=' + nT(s.T)) + ' crosses the parabola on <b>both</b> sides of the ' + t('y') + '-axis.' }), 'x=\\pm ' + nT(rnd(v, 2)),
              'Calculator: ' + C.inter(s.T) + ' — twice, once on each side: ' + t('x\\approx\\pm ' + nT(rnd(v, 2))) + '.<br>Check algebraically: ' + t(rel + '=' + nT(s.T) + '\\Rightarrow ' + nT(s.a) + 'x^{2}=' + nT(s.T - s.c) + '\\Rightarrow x^{2}=' + s.s + '\\Rightarrow x=\\pm' + sqrtTex(s.s) + '\\approx\\pm ' + nT(rnd(v, 2))) + ' ✓',
              ['Put ' + t(nT(s.T)) + ' in ' + code('Y2') + ' and find both intersection points.', 'A parabola symmetric about the ' + t('y') + '-axis gives two answers, ' + t('x') + ' and ' + t('-x') + '.'], 'x when y=' + s.T, 'solutions',
              { good: ['\\pm' + sqrtTex(s.s), '-' + nT(rnd(v, 2)) + ', ' + nT(rnd(v, 2))], bad: [nT(rnd(v, 2)), '\\pm' + nT(s.s)] });
          } },
          { id: '5e', level: 'EMG', make: function (r, s) {
            return mc(r, 'Using the shape of the graph, why does the table in (a) give the same output for ' + t('x=-3') + ' and ' + t('x=3') + ', and for ' + t('x=-6') + ' and ' + t('x=6') + '?', [
              { html: 'The parabola is symmetric about the ' + t('y') + '-axis ' + t('(x=0)') + ', so inputs the same distance from ' + t('0') + ' are mirror images and have the same output.', right: true },
              { html: 'The calculator rounds the outputs, so they only look equal.', why: 'Check by substituting: ' + t('(-3)^{2}') + ' and ' + t('3^{2}') + ' are both exactly ' + t('9') + ', so the outputs are exactly equal.' },
              { html: 'Every relation gives the same output for ' + t('x') + ' and ' + t('-x') + '.', why: 'Try ' + t('y=x+1') + ': ' + t('x=3') + ' gives ' + t('4') + ' but ' + t('x=-3') + ' gives ' + t('-2') + '. It works here because of this graph’s shape.' },
              { html: 'The graph is a straight line through the vertex.', why: 'The graph is a parabola (the ' + t('x^{2}') + ' term), not a line.' }],
              'The graph is a parabola with its vertex ' + t('(0,\\ ' + s.c + ')') + ' on the ' + t('y') + '-axis, and the ' + t('y') + '-axis is its axis of symmetry. ' + t('-3') + ' and ' + t('3') + ' are each ' + t('3') + ' units from the axis, so their points reflect onto each other and have the same output (algebraically, ' + t('(-3)^{2}=3^{2}') + ').', ['Picture the graph: where is its line of symmetry?'], 'why symmetric outputs');
          } }] },

      /* ===== Q6 exact intercepts of lines ===== */
      { num: '6', section: 'Part B — Intercepts and turning points', stem: 'For each equation, use a graphing calculator (' + code('2:zero') + ' for the ' + t('x') + '-intercept, ' + code('1:value') + ' at ' + t('x=0') + ' for the ' + t('y') + '-intercept, then ' + code('MATH') + ' ▸Frac) to list the intercepts as <b>exact values</b>.', parts: [
        { id: '6a', level: 'BEG', make: function (r) { var k = r.int(3, 12); return lineInts(-1, -k, t('y=-' + k + '-x'), '-' + k + '-x'); } },
        { id: '6b', level: 'EMG', make: function (r) { var o = pickWhere(function () { return { m: r.int(2, 9), c: r.int(1, 9) }; }, function (o) { return o.c % o.m !== 0; }); return lineInts(-o.m, -o.c, t('y=' + linT(-o.m, -o.c)), linT(-o.m, -o.c)); } },
        { id: '6c', level: 'EMG', make: function (r) { var o = pickWhere(function () { return { m: r.int(2, 9), c: r.int(2, 11) }; }, function (o) { return o.c % o.m !== 0; }); return lineInts(o.m, -o.c, t('y=' + linT(o.m, -o.c)), linT(o.m, -o.c)); } },
        { id: '6d', level: 'EMG', make: function (r) {
          var o = pickWhere(function () { return { p: r.int(2, 9), q: r.int(2, 15), d: r.pick([2, 3, 4, 5, 6]) }; }, function (o) { return o.q % o.p !== 0 && gcd(o.q, o.p) > 1 && o.q % o.d !== 0 && gcd(o.p, o.d) < o.d; });
          var tex = '\\frac{-' + o.p + 'x+' + o.q + '}{' + o.d + '}';
          return lineInts([-o.p, o.d], [o.q, o.d], t('y=' + tex), tex, true);
        } }] },

      /* ===== Q7 exact intercepts of parabolas ===== */
      { num: '7', stem: 'For each equation, use a graphing calculator to list the ' + t('x') + '- and ' + t('y') + '-intercepts as <b>exact values</b>. (Run ' + code('2:zero') + ' once for each crossing.)', parts: [
        { id: '7a', level: 'BEG', make: function (r) { var o = pickWhere(function () { return { p: r.int(2, 7), q: -r.int(1, 6) }; }, function (o) { return o.p !== -o.q; }); return quadInts(1, [[o.p, 1], [o.q, 1]], r); } },
        { id: '7b', level: 'BEG', make: function (r) { var n = r.int(3, 9); return quadInts(1, [[n, 1], [-n, 1]], r); } },
        { id: '7c', level: 'EMG', make: function (r) {
          var o = pickWhere(function () { return { a: r.int(2, 5), p: r.pick([1, 2, 3, 4, 5, -1, -2, -3]), q: r.pick([1, 2, 3, 4, -1, -2, -3]) }; }, function (o) { return gcd(o.p, o.a) === 1 && Math.abs(o.p) < 6 && (o.a * o.q + o.p) !== 0 && Math.abs(o.p) % o.a !== 0; });
          return quadInts(o.a, [[-o.p, o.a], [o.q, 1]], r); // a(x + p/a)(x - q) = (ax + p)(x - q)
        } },
        { id: '7d', level: 'BEG', make: function (r) { var o = pickWhere(function () { return { p: r.int(3, 9), q: -r.int(1, 6) }; }, function (o) { return o.p !== -o.q; }); return quadInts(-1, [[o.p, 1], [o.q, 1]], r); } }] },

      /* ===== Q8 turning points ===== */
      { num: '8', stem: 'Determine the coordinates of the maximum or minimum point of each graph, as appropriate. Answer using exact values.', parts: [
        { id: '8a', level: 'BEG', make: function (r) {
          var o = pickWhere(function () { return { h: r.pick([5, 10, 15, 20]), c: -r.int(3, 15) }; }, function (o) { var k = o.c + 0.2 * o.h * o.h; return k > 5 && k < 99; });
          return vertexPart(-0.2, cl(0.4 * o.h), o.c, r);
        } },
        { id: '8b', level: 'EMG', make: function (r) {
          var o = pickWhere(function () { return { h: r.pick([10, 20, 30, 40]), c: r.int(-10, 10) }; }, function (o) { return o.c !== 0 && o.c + 0.05 * o.h * o.h > 3; });
          return vertexPart(-0.05, cl(0.1 * o.h), o.c, r);
        } },
        { id: '8c', level: 'EMG', make: function (r) {
          var o = pickWhere(function () { return { b: r.pick([3, 5, 7, 9, -3, -5, -7]), c: r.int(10, 50) }; }, function (o) { return o.c - o.b * o.b / 4 > 0; });
          return vertexPart(1, o.b, o.c, r);
        } },
        { id: '8d', level: 'EMG', make: function (r) {
          var o = pickWhere(function () { return { h: r.pick([4, 6, 8, 10, 12]), k: -r.int(5, 25) }; }, function (o) { var c = 0.25 * o.h * o.h + o.k; return c !== 0 && Math.abs(c) <= 20; });
          return vertexPart(0.25, cl(-0.5 * o.h), cl(0.25 * o.h * o.h + o.k), r);
        } }] },

      /* ===== Q9–11 ===== */
      { num: '9', section: 'Part C — Multiple choice and numerical response', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '9', level: 'EMG', make: function (r) {
          var o = pickWhere(function () { return { m: r.pick([0.5, 0.25, 0.2, 0.4]), X: r.int(12, 38) }; }, function (o) { var c = o.m * o.X; return same(c, Math.round(c)) && c >= 11 && c <= 19; });
          var c = cl(o.m * o.X), Xhi = Math.ceil((o.X + 1) / 5) * 5, Ylo = -(Math.ceil((c + 1) / 5) * 5 + 5), W = function (a, b, s1, cc, d, s2) { return t('x:[' + a + ',\\ ' + b + ',\\ ' + s1 + '],\\ y:[' + cc + ',\\ ' + d + ',\\ ' + s2 + ']'); };
          return mc(r, 'A student graphs ' + t('y=' + linT(o.m, -c)) + ' and cannot see the ' + t('x') + '-intercept in the standard window. Which window shows <b>both</b> intercepts?', [
            { html: W(-10, 10, 1, Ylo, 5, 5), why: t(WT.Xmax.replace(/\\\(|\\\)/g, '') + '=10') + ' stops before the ' + t('x') + '-intercept. Solve ' + t(linT(o.m, -c) + '=0') + ' to see where it is.' },
            { html: W(-5, Xhi, 5, Ylo, 5, 5), right: true },
            { html: W(-5, Xhi, 5, -10, 10, 1), why: 'The ' + t('y') + '-intercept is ' + t('-' + c) + ', below ' + t('Y_{\\min}=-10') + '.' },
            { html: W(0, 20, 2, 0, 20, 2), why: 'This window shows no negative ' + t('y') + '-values, so the ' + t('y') + '-intercept ' + t('-' + c) + ' is off the screen.' }],
            t('x') + '-intercept: ' + linXint(o.m, -c) + '; ' + t('y') + '-intercept: ' + t('-' + c) + '. The window must include ' + t('x=' + o.X) + ' and ' + t('y=-' + c) + ': only ' + W(-5, Xhi, 5, Ylo, 5, 5) + ' does.',
            ['Find both intercepts first, then check each window: is the ' + t('x') + '-intercept between ' + WT.Xmin + ' and ' + WT.Xmax + ', and the ' + t('y') + '-intercept between ' + WT.Ymin + ' and ' + WT.Ymax + '?'], 'window MC ' + linT(o.m, -c), true);
        } }] },
      { num: '10', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '10', level: 'LIM', make: function (r) {
          var kind = r.pick(['x', 'x', 'y', 'min', 'max']), p = r.int(2, 6), q = r.int(1, 5), up = kind !== 'max';
          var b = up ? q - p : p - q, c = up ? -p * q : p * q, rel = quadT(up ? 1 : -1, b, c); // ±(x - p)(x + q)
          var ask = { x: 'the ' + t('x') + '-intercepts', y: 'the ' + t('y') + '-intercept', min: 'the lowest point (vertex)', max: 'the highest point (vertex)' }[kind];
          var right = { x: 'Z', y: 'V', min: 'N', max: 'M' }[kind];
          var why = {
            Z: code('2:zero') + ' finds where ' + t('y=0') + ' — the ' + t('x') + '-intercepts — not ' + ask + '.',
            N: code('3:minimum') + ' finds the lowest point of the graph (the vertex of an upward parabola).',
            V: code('1:value') + ' with ' + t('x=0') + ' gives the output at ' + t('x=0') + ', which is the ' + t('y') + '-intercept.',
            M: code('4:maximum') + ' finds the highest point of the graph' + (up ? ' — and this parabola opens up, so it has no highest point.' : '.')
          };
          var opts = [{ id: 'Z', html: code('2:zero') }, { id: 'N', html: code('3:minimum') }, { id: 'V', html: code('1:value') + ' with ' + t('x=0') }, { id: 'M', html: code('4:maximum') }].map(function (x) { return { html: x.html, right: x.id === right, why: x.id === right ? null : why[x.id] }; });
          return mc(r, 'To find ' + ask + ' of ' + t('y=' + rel) + ' on a graphing calculator, a student should use', opts,
            { x: 'An ' + t('x') + '-intercept is where ' + t('y=0') + ', which is exactly what ' + code('2:zero') + ' finds (here ' + t('x=' + p) + ' and ' + t('x=-' + q) + ').', y: 'The ' + t('y') + '-intercept is the output at ' + t('x=0') + ': ' + code('1:value') + ' with ' + t('x=0') + ' gives ' + t('y=' + c) + '.', min: 'The parabola opens up (positive ' + t('x^{2}') + ' term), so its vertex is the lowest point: use ' + code('3:minimum') + '.', max: 'The parabola opens down (negative ' + t('x^{2}') + ' term), so its vertex is the highest point: use ' + code('4:maximum') + '.' }[kind] + ' (' + code('2:zero') + ' → ' + t('x') + '-intercepts; ' + code('1:value') + ' at ' + t('x=0') + ' → ' + t('y') + '-intercept; ' + code('3:minimum') + ' / ' + code('4:maximum') + ' → the vertex.)',
            ['Which feature matches “where ' + t('y=0') + '”, “the output at ' + t('x=0') + '”, “lowest point”, “highest point”?'], 'CALC feature for ' + kind, true);
        } }] },
      { num: '11', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '11', level: 'EMG', make: function (r) {
          var o = pickWhere(function () { var a = r.pick([-0.25, -0.25, -0.5, -0.2, -0.1]); return { a: a, h: r.int(2, 20), k: r.int(10, 99) }; }, function (o) { var b = -2 * o.a * o.h, c = o.a * o.h * o.h + o.k; return same(b, Math.round(b)) && same(c, Math.round(c)) && Math.abs(c) <= 20 && c !== 0 && b !== 0; });
          var a = o.a, b = cl(-2 * a * o.h), c = cl(a * o.h * o.h + o.k), f = qf(a, b, c), rel = quadT(a, b, c);
          var p = B.nr('Using the maximum feature of a graphing calculator, the maximum value of ' + t('y') + ' for the relation ' + t('y=' + rel) + ' is ________.', o.k, function (v) {
            if (same(v, o.h)) return { code: 'nr-gave-x', hint: t(o.h) + ' is the <b>' + t('x') + '-coordinate</b> of the maximum point. The maximum <b>value</b> is the ' + t('y') + '-coordinate.' };
            if (same(v, c)) return { code: 'nr-gave-c', hint: 'That is the ' + t('y') + '-intercept (the output at ' + t('x=0') + '). The maximum is the vertex, higher up.' };
            if (same(v, cl(f(-o.h)))) return { code: 'nr-sign', hint: 'Check the ' + t('x') + '-coordinate of the maximum: it is positive here.' };
            return null;
          }, 'Calculator: ' + C.y1(rel) + ', choose a window that shows the top of the parabola (e.g. ' + winTex(niceWin([featV(o.h, o.k), featY(c)])) + '), then ' + C.max + ' with Left Bound? and Right Bound? on either side of the top: ' + t('X\\approx ' + o.h) + ', ' + t('Y=' + o.k) + '.<br>Check: ' + t(nT(a) + '(' + o.h + ')^{2}' + term(b, '', false) + '(' + o.h + ')' + term(c, '', false) + '=' + nT(a * o.h * o.h) + '+' + nT(b * o.h) + term(c, '', false) + '=' + o.k) + ' ✓',
          ['Use ' + code('4:maximum') + ' (the parabola opens down).', 'The maximum <b>value</b> is the ' + t('y') + '-coordinate of the highest point.'], 'max value of ' + rel);
          p.bad = [String(o.h), String(c)].filter(function (x) { return Number(x) !== o.k; });
          return p;
        } }] }
    ],
    extra: EXTRA()
  });

  /* ---- Q6: intercepts of a line y = mx + b as exact values (m, b numbers or [p,q]) ---- */
  function lineInts(m, b, relHtml, relTex, frac) {
    var mv = Array.isArray(m) ? m[0] / m[1] : m, bv = Array.isArray(b) ? b[0] / b[1] : b, X = -bv / mv, Xf = fracOf(X), Yf = fracOf(bv);
    var cx = exactChk(Xf, { dl: [[-X, 'sign', 'Check the sign: solve ' + t(relTex + '=0') + ' carefully.'], [bv, 'int-swap', 'That is the ' + t('y') + '-intercept. The ' + t('x') + '-intercept is where ' + t('y=0') + '.'], [cl(-1 / X), 'flip', 'Your fraction is upside down.'], [frac ? -b[0] : -bv, 'int-no-div', 'Divide by the coefficient of ' + t('x') + ' to finish.']] });
    var cy = exactChk(Yf, { dl: [[X, 'int-swap', 'That is the ' + t('x') + '-intercept. The ' + t('y') + '-intercept is the output when ' + t('x=0') + '.'], [frac ? b[0] : NaN, 'int-no-div', 'At ' + t('x=0') + ' the numerator is ' + t(frac ? b[0] : 0) + ', but it is still divided by ' + t(frac ? b[1] : 1) + '.']] });
    var xT = ex.texRat(Xf), yT = ex.texRat(Yf);
    var steps = frac ? t(relTex + '=0\\Rightarrow -' + (-m[0]) + 'x+' + b[0] + '=0\\Rightarrow x=\\frac{' + b[0] + '}{' + (-m[0]) + '}=' + xT) : t(relTex + '=0\\Rightarrow ' + lin([[m, 'x']]) + '=' + vt(-bv) + '\\Rightarrow x=' + xT);
    var ysteps = frac ? t('y=\\frac{-' + (-m[0]) + '(0)+' + b[0] + '}{' + b[1] + '}=\\frac{' + b[0] + '}{' + b[1] + '}' + (yT !== '\\frac{' + b[0] + '}{' + b[1] + '}' ? '=' + yT : '')) : t('y=' + yT);
    var bad = [[vt(-X), yT]]; if (!same(X, bv)) bad.push([yT, xT]); if (!termDec(X)) bad.push([nT(rnd(X, 2)), yT]);
    return fieldsPart(relHtml, [mbox(t('x') + '-intercept'), mbox(t('y') + '-intercept')], [cx, cy], [xT, yT], t('x') + '-intercept ' + t(xT) + ', ' + t('y') + '-intercept ' + t(yT),
      'Calculator: ' + C.y1(relTex) + '. ' + C.zero + ' shows ' + t('X=' + nT(rnd(X, 7))) + (Number.isInteger(X) ? '' : '; ' + C.frac + ' gives ' + t(xT)) + '. ' + C.value0 + ' gives ' + t('Y=' + nT(bv)) + (Number.isInteger(bv) ? '' : ' (▸Frac: ' + t(yT) + ')') + '.<br>Check algebraically: ' + t('x') + '-intercept ' + steps + '; ' + t('y') + '-intercept ' + ysteps + '.' + screen([lf(mv, bv)], niceWin([{ x: X, y: 0 }, { x: 0, y: bv }]), [{ x: X, y: 0, label: '(' + nT(rnd(X, 2)) + ', 0)' }, { x: 0, y: bv, label: '(0, ' + nT(rnd(bv, 2)) + ')' }]),
      ['For the ' + t('x') + '-intercept set ' + t('y=0') + ' and solve; for the ' + t('y') + '-intercept set ' + t('x=0') + '.', 'A decimal like ' + t('2.666\\ldots') + ' isn’t exact — write it as a fraction.'], 'exact intercepts ' + relTex,
      { bad: bad, good: [[termDec(X) || xT, termDec(bv) || yT]] });
  }
  /* ---- Q7: intercepts of y = a(x - r1)(x - r2) with exact roots (roots as [p, q]) ---- */
  function quadInts(a, roots, r) {
    var r1 = roots[0][0] / roots[0][1], r2 = roots[1][0] / roots[1][1], b = cl(-a * (r1 + r2)), c = cl(a * r1 * r2), rel = quadT(a, b, c);
    var cx = exactSet([roots[0], roots[1]], { missHint: 'The parabola crosses the ' + t('x') + '-axis <b>twice</b>. Run ' + code('2:zero') + ' again with the bounds around the other crossing.', diag: function (A) {
      if (sameVals(A, [c])) return { code: 'int-swap', hint: 'That is the ' + t('y') + '-intercept. The ' + t('x') + '-intercepts are where ' + t('y=0') + '.' };
      return null;
    } });
    var cy = exactChk(c, { dl: [[-c, 'sign', 'Check the sign: the ' + t('y') + '-intercept is the constant term, ' + t(nT(c)) + '.'], [r1, 'int-swap', 'That is an ' + t('x') + '-intercept. The ' + t('y') + '-intercept is the output when ' + t('x=0') + '.'], [r2, 'int-swap', 'That is an ' + t('x') + '-intercept. The ' + t('y') + '-intercept is the output when ' + t('x=0') + '.']] });
    var xs = [r1, r2].sort(function (u, v) { return v - u; }), xT = xs.map(vt).join(',\\ '), keyX = xs.map(function (v) { return 'x=' + vt(v); }).join(',\\ ');
    var fac = function () { // factored form
      var f = roots.map(function (q) { var nq = ex.norm(q[0], q[1]); return nq[1] === 1 ? '(x' + term(-nq[0], '', false) + ')' : '(' + nq[1] + 'x' + term(-nq[0], '', false) + ')'; });
      var lead = a / roots.reduce(function (m, q) { return m * ex.norm(q[0], q[1])[1]; }, 1);
      return (lead === -1 ? '-' : lead === 1 ? '' : nT(lead)) + f.join('');
    };
    var feat = [{ x: r1, y: 0 }, { x: r2, y: 0 }, { x: 0, y: c }, { x: -b / (2 * a), y: qf(a, b, c)(-b / (2 * a)) }], w = niceWin(feat);
    var dec = xs.some(function (v) { return !Number.isInteger(v); });
    return fieldsPart(t('y=' + rel), [mbox(t('x') + '-intercepts', 'solutions'), mbox(t('y') + '-intercept', 'solutions')], [cx, cy], [keyX, nT(c)], t('x') + '-intercepts ' + t(xT) + ', ' + t('y') + '-intercept ' + t(nT(c)),
      'Calculator: ' + C.y1(rel) + ', a window such as ' + winTex(w) + ', then ' + C.zero + ' — once near each crossing: ' + t('X=' + xs.map(function (v) { return nT(rnd(v, 7)); }).join('\\text{ and }X=')) + (dec ? '; ▸Frac turns the decimal into ' + t(xs.filter(function (v) { return !Number.isInteger(v); }).map(vt).join(',\\ ')) : '') + '. ' + C.value0 + ' gives ' + t('Y=' + nT(c)) + '.<br>' +
      'Check algebraically: ' + t('y=' + rel + '=' + fac()) + ', so ' + t('y=0') + ' when ' + t('x=' + xs.map(vt).join('\\text{ or }x=')) + '; at ' + t('x=0') + ', ' + t('y=' + nT(c)) + '.' + screen([qf(a, b, c)], w, xs.map(function (v) { return { x: v, y: 0, label: vt(v).indexOf('frac') >= 0 ? nT(rnd(v, 2)) : nT(v) }; }).concat([{ x: 0, y: c, label: '(0, ' + nT(c) + ')' }])),
      ['The ' + t('x') + '-intercepts are where ' + t('y=0') + ' — there are two here.', 'The ' + t('y') + '-intercept is the output at ' + t('x=0') + ' (the constant term).'], 'intercepts ' + rel,
      { good: [[xs.slice().reverse().map(vt).join(', '), String(c)]], bad: [[vt(xs[0]), nT(c)], [keyX, nT(-c)]].concat(same(r1, -r2) ? [] : [[xs.map(function (v) { return vt(-v); }).join(', '), nT(c)]]).concat(xs.some(function (v) { return !termDec(v); }) ? [[xs.map(function (v) { return nT(rnd(v, 2)); }).join(', '), nT(c)]] : []) });
  }
  /* ---- Q8: exact turning point of y = ax² + bx + c ---- */
  function vertexPart(a, b, c, r) {
    var h = cl(-b / (2 * a)), f = qf(a, b, c), k = cl(f(h)), rel = quadT(a, b, c), up = a > 0, hT = vt(h), kT = vt(k);
    var cx = exactChk(h, { close: 'That is the calculator’s approximate value (its search stops when it is “close enough”). Round to the sensible exact value, check by substituting, and give it exactly.', closeCode: 'calc-noise',
      dl: [[-h, 'vx-sign', 'Check the sign: the turning point is at ' + t('x=-\\frac{b}{2a}') + '. Look at where the graph turns.'], [k, 'int-swap', 'That is the ' + t('y') + '-coordinate. Put the ' + t('x') + '-coordinate in this box.']] });
    var cy = exactChk(k, { close: 'That is the calculator’s approximate value. Round it to the sensible exact value, check by substituting the ' + t('x') + '-coordinate, and give it exactly (▸Frac if it’s a fraction).', closeCode: 'calc-noise',
      dl: [[cl(f(-h)), 'vy-wrong-x', 'That is the output at ' + t('x=' + vt(-h)) + '. Substitute the ' + t('x') + '-coordinate of the turning point.'], [c, 'vy-yint', 'That is the ' + t('y') + '-intercept (the output at ' + t('x=0') + '), not the turning point.'], [cl(-a * h * h + b * h + c), 'calc-sign', 'Square first, then multiply by ' + t(nT(a)) + ' — watch the sign.']] });
    var w = niceWin([featV(h, k), featY(c)]);
    var sub = t((a === 1 ? '' : a === -1 ? '-' : nT(a)) + '\\left(' + hT + '\\right)^{2}' + term(b, '', false) + '\\left(' + hT + '\\right)' + term(c, '', false) + '=' + kT);
    var bad = [[vt(-h), vt(f(-h))], [hT, nT(c)]].concat(same(h, k) ? [] : [[kT, hT]]).concat(Number.isInteger(k) ? [] : [[hT, nT(rnd(k, 1))]]);
    return fieldsPart(t('y=' + rel), [mbox(t('x') + '-coordinate'), mbox(t('y') + '-coordinate')], [cx, cy], [hT, kT],
      (up ? 'Minimum' : 'Maximum') + ' point ' + t('\\left(' + hT + ',\\ ' + kT + '\\right)'),
      'The ' + t('x^{2}') + ' coefficient is ' + (up ? 'positive, so the parabola opens <b>up</b> and has a <b>minimum</b>: use ' + C.min : 'negative, so the parabola opens <b>down</b> and has a <b>maximum</b>: use ' + C.max) + ' in a window such as ' + winTex(w) + '. It shows about ' + t('X\\approx ' + nT(rnd(h, 4)) + ',\\ Y\\approx ' + nT(rnd(k, 4))) + (Number.isInteger(h) && Number.isInteger(k) ? '' : '; ▸Frac gives ' + t('\\left(' + hT + ',\\ ' + kT + '\\right)')) + '.<br>' +
      'Check: ' + t('x=-\\frac{b}{2a}=-\\frac{' + nT(b) + '}{2' + sgp(a) + '}=' + hT) + ', and ' + sub + ' ✓. ' + (up ? 'Minimum' : 'Maximum') + ' point ' + t('\\left(' + hT + ',\\ ' + kT + '\\right)') + '.' + screen([f], w, [{ x: h, y: k, label: '(' + nT(rnd(h, 2)) + ', ' + nT(rnd(k, 2)) + ')' }]),
      ['Opens up → ' + code('3:minimum') + '; opens down → ' + code('4:maximum') + '. Then round the calculator’s coordinates to sensible exact values.', 'Check by substituting: the ' + t('x') + '-coordinate is ' + t('-\\frac{b}{2a}') + '.'], 'turning point ' + rel,
      { bad: bad, good: [[termDec(h) || hT, termDec(k) || kT]] });
  }

  /* ================= EXTRA PRACTICE ================= */
  function EXTRA() { return []; }
})(window);
