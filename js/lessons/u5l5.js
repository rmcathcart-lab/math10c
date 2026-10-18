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
        if (!a0.ok || !b0.ok) { // ± inside a bracket or fraction, e.g. \frac{-5\pm\sqrt{37}}{2}: read the + and − versions whole
          var pP = ex.parse(p.replace('±', '+')), pM = ex.parse(p.replace('±', '-'));
          if (!pP.ok || !pM.ok) return { bad: true };
          var vP = ex.value(pP.ast), vM = ex.value(pM.ast);
          if (!isFinite(vP) || !isFinite(vM)) return { bad: true };
          out.push({ v: vP, ast: pP.ast }); out.push({ v: vM, ast: pM.ast });
          continue;
        }
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
      if (same(a.val, T) && !termDec(T) && ex.shape(a.ast).decimals && !ex.shape(a.ast).rep) return form(o.closeCode || 'exact', o.close || CLOSE); // a long calculator decimal is still not exact
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
        for (var i = 0; i < L.items.length; i++) { var sh = ex.shape(L.items[i].ast); if (sh.decimals && !sh.rep && termDec(L.items[i].v) == null) return form('exact', o.close || CLOSE); } // a long calculator decimal is still not exact
        for (i = 0; i < L.items.length; i++) if (lowestIssue(L.items[i].ast)) return form('lowest', 'Right values — now write each fraction in lowest terms.');
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
  function niceStep(span) { var c = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000]; for (var i = 0; i < c.length; i++) if (span / c[i] <= 5) return c[i]; return 2000; }
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
  function mbox(label, keys) { return { label: label, mode: 'math', keys: keys || 'fraction', placeholder: keys === 'solutions' ? 'e.g. x = 3, x = -5' : 'e.g. 3/4' }; }
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
          return winPart(t('y=' + rel) + ' &nbsp;(keep the ' + t('x') + '-axis on the screen too)', feat, { win: w, sol: sol, fns: [function (x) { return Math.pow(a, x) + c; }], pts: [{ x: 0, y: y0, label: '(0, ' + y0 + ')' }], minY: 10, text: 'window for y=' + rel });
        } }] },

      /* ===== Q2 ===== */
      { num: '2', stem: function (sh) { return 'Consider the equation ' + t('y=' + linT(-sh.m, sh.b)) + '.'; },
        shared: function (r) {
          var o = pickWhere(function () { return { m: r.int(2, 6), X: r.int(6, 12) }; }, function (o) { return o.m * o.X > 10 && o.m * o.X <= 60; });
          var xs = range(1, o.X - 1).filter(function (v) { return v !== o.m * (o.X - v); }); // x ≠ y, so the "solved for x" / "substituted y" MC distractors can't land on the answer
          var x1 = r.pick(xs), x2 = r.pick(xs.filter(function (v) { return v !== x1; }));
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
            return mc(r, 'Which work <b>algebraically verifies</b> the value of ' + t('y') + ' when ' + t('x=' + s.x1) + '?', [
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
            return mc(r, 'Which work <b>algebraically verifies</b> the value of ' + t('x') + ' when ' + t('y=' + s.y2) + '?', [
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
            return mc(r, 'Using the shape of the graph, why does this relation give the same output for ' + t('x=-3') + ' and ' + t('x=3') + ', and for ' + t('x=-6') + ' and ' + t('x=6') + '?', [
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
            ['Find both intercepts first, then check each window: is the ' + t('x') + '-intercept between ' + WT.Xmin + ' and ' + WT.Xmax + ', and the ' + t('y') + '-intercept between ' + WT.Ymin + ' and ' + WT.Ymax + '?'], 'window MC ' + linT(o.m, -c));
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
    var bad = [[vt(-h), vt(f(-h))], [hT, nT(c)]].concat(same(h, k) ? [] : [[kT, hT]]).concat(same(rnd(k, 1), k) ? [] : [[hT, nT(rnd(k, 1))]]);
    return fieldsPart(t('y=' + rel), [mbox(t('x') + '-coordinate'), mbox(t('y') + '-coordinate')], [cx, cy], [hT, kT],
      (up ? 'Minimum' : 'Maximum') + ' point ' + t('\\left(' + hT + ',\\ ' + kT + '\\right)'),
      'The ' + t('x^{2}') + ' coefficient is ' + (up ? 'positive, so the parabola opens <b>up</b> and has a <b>minimum</b>: use ' + C.min : 'negative, so the parabola opens <b>down</b> and has a <b>maximum</b>: use ' + C.max) + ' in a window such as ' + winTex(w) + '. It shows about ' + t('X\\approx ' + nT(rnd(h, 4)) + ',\\ Y\\approx ' + nT(rnd(k, 4))) + (Number.isInteger(h) && Number.isInteger(k) ? '' : '; ▸Frac gives ' + t('\\left(' + hT + ',\\ ' + kT + '\\right)')) + '.<br>' +
      'Check: ' + t('x=-\\frac{b}{2a}=-\\frac{' + nT(b) + '}{2(' + nT(a) + ')}=' + hT) + ', and ' + sub + ' ✓. ' + (up ? 'Minimum' : 'Maximum') + ' point ' + t('\\left(' + hT + ',\\ ' + kT + '\\right)') + '.' + screen([f], w, [{ x: h, y: k, label: '(' + nT(rnd(h, 2)) + ', ' + nT(rnd(k, 2)) + ')' }]),
      ['Opens up → ' + code('3:minimum') + '; opens down → ' + code('4:maximum') + '. Then round the calculator’s coordinates to sensible exact values.', 'Check by substituting: the ' + t('x') + '-coordinate is ' + t('-\\frac{b}{2a}') + '.'], 'turning point ' + rel,
      { bad: bad, good: [[termDec(h) || hT, termDec(k) || kT]] });
  }

  /* ================= EXTRA PRACTICE ================= */
  function pq(v) { return Array.isArray(v) ? ex.norm(v[0], v[1]) : fracOf(v); }
  function PL(a2, a1, a0) { return P.add(P.mono(pq(a2), { x: 2 }), P.mono(pq(a1), { x: 1 }), P.num(pq(a0))); }
  function y1Part(prompt, target, wl, sol, hints, text, o) {
    o = o || {};
    wl = wl.filter(function (w) { return !P.eq(w.is, target); });
    var p = K.P.poly(prompt, target, { before: t('y='), expanded: false, wrong: wl, keyTex: o.keyTex }, sol, hints, text), base = p.check;
    p.check = function (resp) { // rounded decimal coefficients -> a nudge to stay exact
      var res = base(resp); if (res.v !== 'wrong') return res;
      var rd = P.read(resp); if (!rd || !rd.ok) return res;
      var mapOf = function (q) { var m = {}; P.terms(q).forEach(function (x) { m[P.monoTex(x.v) || '1'] = x.c[0] / x.c[1]; }); return m; }, A = mapOf(rd.p), Tm = mapOf(target), ks = Object.keys(Tm);
      if (Object.keys(A).length === ks.length && ks.every(function (k) { return A[k] != null && Math.abs(A[k] - Tm[k]) < 0.006; })) return form('exact', 'Close — but a coefficient has been rounded. Keep it exact: use a fraction like ' + t('\\frac{5}{3}') + '.');
      return res;
    };
    p.bad = wl.map(function (w) { return P.tex(w.is); }); if (o.good) p.good = o.good;
    return p;
  }
  var Y1H = ['Get ' + t('y') + ' by itself: move every other term to the other side, then divide by the coefficient of ' + t('y') + ' (every term!).', 'Check one point: substitute a value of ' + t('x') + ' into the original equation and into your answer — the ' + t('y') + '-values must match.'];
  function screenStd(fns, o) {
    o = o || {};
    return HW.graph({ x: [-10, 10], y: [-10, 10], unit: 15, grid: 0, labels: 5, fns: fns, points: o.pts || [], max: o.max || 300, aria: 'standard window screen' });
  }
  function EXTRA() {
    return [
      /* ---------- Part A ---------- */
      { num: '1', section: 'Extra practice A — Before you press GRAPH: solve for y', stem: 'The equation editor (' + code('Y=') + ') only accepts a right-hand side. Solve each relation for ' + t('y') + ' — that is the expression you would type into ' + code('Y1') + '.', parts: [
        { id: 'e1a', level: 'BEG', make: function (r) {
          var o = pickWhere(function () { return { A: r.int(2, 9), B: r.int(2, 5), k: r.int(2, 9) }; }, function (o) { return o.A % o.B !== 0; });
          var C = o.B * o.k, T = PL(0, [-o.A, o.B], o.k);
          return y1Part(t(o.A + 'x+' + o.B + 'y=' + C), T, [{ is: PL(0, -o.A, C), code: 'inv-no-div', hint: 'Nearly: after moving ' + t(o.A + 'x') + ', divide <b>both</b> terms by ' + t(o.B) + '.' }, { is: PL(0, [o.A, o.B], o.k), code: 'inv-sign', hint: 'Moving ' + t('+' + o.A + 'x') + ' to the other side makes it ' + t('-' + o.A + 'x') + '.' }, { is: PL(0, [-o.A, o.B], C), code: 'inv-no-div', hint: 'Divide the constant by ' + t(o.B) + ' too.' }],
            t(o.B + 'y=' + C + '-' + o.A + 'x') + ', so ' + t('y=\\frac{' + C + '-' + o.A + 'x}{' + o.B + '}=' + P.tex(T)) + '. Type ' + code('(' + C + '−' + o.A + 'X)/' + o.B) + ' into ' + code('Y1') + ' (the brackets matter).', Y1H, 'solve for y: ' + o.A + 'x+' + o.B + 'y=' + C, { good: ['\\frac{' + C + '-' + o.A + 'x}{' + o.B + '}'] });
        } },
        { id: 'e1b', level: 'EMG', make: function (r) {
          var o = pickWhere(function () { return { A: r.int(2, 9), B: r.int(2, 5), k: r.int(2, 9) }; }, function (o) { return o.A % o.B !== 0; });
          var C = o.B * o.k, T = PL(0, [o.A, o.B], -o.k);
          return y1Part(t(o.A + 'x-' + o.B + 'y=' + C), T, [{ is: PL(0, o.A, -C), code: 'inv-no-div', hint: 'After moving ' + t(o.A + 'x') + ', divide every term by ' + t('-' + o.B) + '.' }, { is: PL(0, [-o.A, o.B], o.k), code: 'inv-neg', hint: 'You divided by ' + t(o.B) + ', but the coefficient of ' + t('y') + ' is ' + t('-' + o.B) + '. Dividing by a negative changes every sign.' }],
            t('-' + o.B + 'y=' + C + '-' + o.A + 'x') + '. Divide every term by ' + t('-' + o.B) + ': ' + t('y=\\frac{' + C + '-' + o.A + 'x}{-' + o.B + '}=\\frac{' + o.A + 'x-' + C + '}{' + o.B + '}=' + P.tex(T)) + '. Type ' + code('(' + o.A + 'X−' + C + ')/' + o.B) + '.', Y1H, 'solve for y: ' + o.A + 'x-' + o.B + 'y=' + C, { good: ['\\frac{' + o.A + 'x-' + C + '}{' + o.B + '}'].concat(termDec(o.A / o.B) ? [termDec(o.A / o.B) + 'x-' + o.k] : []) });
        } },
        { id: 'e1c', level: 'BEG', make: function (r) {
          var k = r.int(2, 9), T = PL(1, k, 0);
          return y1Part(t('y-x^{2}=' + k + 'x'), T, [{ is: PL(1, -k, 0), code: 'inv-sign', hint: 'Add ' + t('x^{2}') + ' to both sides — the ' + t(k + 'x') + ' doesn’t change.' }, { is: PL(-1, k, 0), code: 'inv-sign', hint: 'To move ' + t('-x^{2}') + ', <b>add</b> ' + t('x^{2}') + ' to both sides.' }],
            'Add ' + t('x^{2}') + ' to both sides: ' + t('y=x^{2}+' + k + 'x') + '. Type ' + code('X^2+' + k + 'X') + '.', Y1H, 'solve for y: y-x^2=' + k + 'x');
        } },
        { id: 'e1d', level: 'EMG', make: function (r) {
          var o = pickWhere(function () { return { B: r.int(2, 5), k: r.int(2, 9) }; }, function () { return true; }), C = o.B * o.k, T = PL([-1, o.B], 0, o.k);
          return y1Part(t('x^{2}+' + o.B + 'y-' + C + '=0'), T, [{ is: PL(-1, 0, C), code: 'inv-no-div', hint: 'Divide both terms by ' + t(o.B) + '.' }, { is: PL([1, o.B], 0, -o.k), code: 'inv-sign', hint: 'Moving ' + t('+x^{2}') + ' and ' + t('-' + C) + ' to the other side changes both signs: ' + t(o.B + 'y=' + C + '-x^{2}') + '.' }, { is: PL([-1, o.B], 0, C), code: 'inv-no-div', hint: 'Divide the constant by ' + t(o.B) + ' too.' }],
            t(o.B + 'y=' + C + '-x^{2}') + ', so ' + t('y=\\frac{' + C + '-x^{2}}{' + o.B + '}=' + P.tex(T)) + '. Type ' + code('(' + C + '−X^2)/' + o.B) + '.', Y1H, 'solve for y: x^2+' + o.B + 'y-' + C + '=0', { good: ['\\frac{' + C + '-x^{2}}{' + o.B + '}'] });
        } },
        { id: 'e1e', level: 'EMG', make: function (r) {
          var p = r.int(1, 9), q = r.int(2, 5), s = r.int(1, 9), T = PL(0, q, -q * s - p);
          return y1Part(t('\\frac{y+' + p + '}{' + q + '}=x-' + s), T, [{ is: PL(0, q, -s - p), code: 'y1-dist', hint: 'Multiply <b>both</b> terms of ' + t('x-' + s) + ' by ' + t(q) + ': ' + t(q + '(x-' + s + ')=' + q + 'x-' + q * s) + '.' }, { is: PL(0, q, -q * s + p), code: 'inv-sign', hint: 'To move ' + t('+' + p) + ', subtract ' + t(p) + ' from both sides.' }, { is: PL(0, [1, q], [-s * 1, 1]).constructor === Object ? PL(0, [1, q], -s / q - p) : PL(0, [1, q], -p), code: 'inv-mult', hint: 'To undo “divided by ' + t(q) + '”, <b>multiply</b> both sides by ' + t(q) + '.' }],
            'Multiply both sides by ' + t(q) + ' first: ' + t('y+' + p + '=' + q + '(x-' + s + ')=' + q + 'x-' + q * s) + ', then subtract ' + t(p) + ': ' + t('y=' + P.tex(T)) + '. Type ' + code(q + 'X−' + (q * s + p)) + '.', Y1H, 'solve for y: (y+' + p + ')/' + q + '=x-' + s);
        } },
        { id: 'e1f', level: 'BEG', make: function (r) {
          var A = r.int(2, 9), C = r.int(2, 12), T = PL(0, A, C);
          return y1Part(t(A + 'x-y=-' + C), T, [{ is: PL(0, A, -C), code: 'inv-sign', hint: 'Divide every term by ' + t('-1') + ': ' + t('-y=-' + A + 'x-' + C) + ' becomes ' + t('y=' + A + 'x+' + C) + '.' }, { is: PL(0, -A, C), code: 'inv-sign', hint: 'Divide <b>every</b> term by ' + t('-1') + '.' }],
            t('-y=-' + A + 'x-' + C) + '. Divide by ' + t('-1') + ': ' + t('y=' + A + 'x+' + C) + '. Type ' + code(A + 'X+' + C) + '.', Y1H, 'solve for y: ' + A + 'x-y=-' + C);
        } }] },
      { num: '2', stem: function (s) { return 'Asked to graph ' + t('y=\\frac{' + s.p + 'x-' + s.q + '}{' + s.d + '}') + ', one student types ' + code('(' + s.p + 'X−' + s.q + ')/' + s.d) + ' into ' + code('Y1') + ' and a second student types ' + code(s.p + 'X−' + s.q + '/' + s.d) + '.'; },
        shared: function (r) { return pickWhere(function () { return { p: r.int(2, 7), q: r.int(3, 24), d: r.pick([2, 4, 5]) }; }, function (o) { return o.q % o.d !== 0 && o.p % o.d !== 0 && o.q % o.p !== 0 && (2 * o.p - o.q) % o.d === 0; }); },
        parts: [
          { id: 'e2a', level: 'EMG', make: function (r, s) {
            var T = PL(0, s.p, [-s.q, s.d]), dq = nT(s.q / s.d);
            return y1Part('Write the relation the <b>second</b> student actually graphed, in the form ' + t('y=mx+b') + '.', T, [{ is: PL(0, [s.p, s.d], [-s.q, s.d]), code: 'y1-order', hint: 'That is the relation they <i>meant</i>. Without brackets the calculator divides first: only the ' + t(s.q) + ' is divided by ' + t(s.d) + '.' }],
              'The calculator divides before it subtracts, so ' + code(s.p + 'X−' + s.q + '/' + s.d) + ' means ' + t(s.p + 'x-\\frac{' + s.q + '}{' + s.d + '}') + ': ' + t('y=' + s.p + 'x-' + dq) + '.', ['Order of operations: division comes before subtraction. Which numbers does the ' + code('/' + s.d) + ' act on?'], 'missing brackets graph', { keyTex: s.p + 'x-' + dq, good: [s.p + 'x-\\frac{' + s.q + '}{' + s.d + '}'] });
          } },
          { id: 'e2b', level: 'BEG', make: function (r, s) {
            var v = [-s.q, s.d];
            return mathPart('Both graphs are straight lines with the <b>same</b> ' + t('y') + '-intercept. State it.', exactChk(v, { dl: [[-s.q, 'int-no-div', 'At ' + t('x=0') + ' both give ' + t('\\frac{-' + s.q + '}{' + s.d + '}') + ' — divide by ' + t(s.d) + '.'], [s.q / s.p, 'int-swap', 'That is the correct graph’s ' + t('x') + '-intercept. The ' + t('y') + '-intercept is the output at ' + t('x=0') + '.']] }), nT(-s.q / s.d),
              'At ' + t('x=0') + ': correct ' + t('y=\\frac{' + s.p + '(0)-' + s.q + '}{' + s.d + '}=' + nT(-s.q / s.d)) + '; student ' + t('y=' + s.p + '(0)-' + nT(s.q / s.d) + '=' + nT(-s.q / s.d)) + '. Both are ' + t(nT(-s.q / s.d) + '=' + rT(-s.q, s.d)) + '.', ['Substitute ' + t('x=0') + ' into each relation.'], 'common y-intercept', 'fraction', { good: [rT(-s.q, s.d)] });
          } },
          { id: 'e2c', level: 'EMG', make: function (r, s) {
            return mc(r, 'Why can’t checking the ' + t('y') + '-intercept catch the missing brackets?', [
              { html: 'The missing brackets only change the ' + t('x') + '-term, and at ' + t('x=0') + ' the ' + t('x') + '-term is ' + t('0') + ' — so both relations give the same ' + t('y') + '-intercept.', right: true },
              { html: 'The two relations are really the same, so there is nothing to catch.', why: 'Try ' + t('x=2') + ' in both: the outputs are different, so the relations are different.' },
              { html: 'The calculator rounds the ' + t('y') + '-intercept.', why: 'Both ' + t('y') + '-intercepts are exactly ' + t(nT(-s.q / s.d)) + ' — no rounding is involved.' },
              { html: 'The ' + t('y') + '-intercept check only works for parabolas.', why: 'The ' + t('y') + '-intercept check works for any relation; the trouble is that this particular mistake doesn’t affect the output at ' + t('x=0') + '.' }],
              'Correct: ' + t('\\frac{' + s.p + 'x}{' + s.d + '}-\\frac{' + s.q + '}{' + s.d + '}') + '; student: ' + t(s.p + 'x-\\frac{' + s.q + '}{' + s.d + '}') + '. They differ only in the ' + t('x') + '-term, which is ' + t('0') + ' at ' + t('x=0') + '.', ['Write both relations as ' + t('mx+b') + ': which part is different?'], 'why y-int check fails');
          } },
          { id: 'e2d', level: 'EMG', make: function (r, s) {
            var a = ex.norm(s.q, s.p), b = ex.norm(s.q, s.d * s.p);
            return fieldsPart('Run ' + code('2:zero') + ' on each relation. Give both ' + t('x') + '-intercepts as exact fractions.', [mbox('correct relation'), mbox('student’s relation')],
              [exactChk(a, { dl: [[b[0] / b[1], 'int-swap', 'That is the student’s intercept.']] }), exactChk(b, { dl: [[a[0] / a[1], 'int-swap', 'That is the correct relation’s intercept. Solve ' + t(s.p + 'x-\\frac{' + s.q + '}{' + s.d + '}=0') + '.']] })], [ex.texRat(a), ex.texRat(b)],
              'correct ' + t(ex.texRat(a)) + ', student ' + t(ex.texRat(b)),
              'Correct: ' + t('\\frac{' + s.p + 'x-' + s.q + '}{' + s.d + '}=0\\Rightarrow ' + s.p + 'x=' + s.q + '\\Rightarrow x=' + ex.texRat(a)) + '. Student: ' + t(s.p + 'x-\\frac{' + s.q + '}{' + s.d + '}=0\\Rightarrow ' + s.p + 'x=\\frac{' + s.q + '}{' + s.d + '}\\Rightarrow x=' + ex.texRat(b)) + '. (On the calculator: ' + C.zero + ', then ▸Frac.)',
              ['Set each relation equal to ' + t('0') + ' and solve.'], 'two x-intercepts', { bad: [[ex.texRat(b), ex.texRat(a)]] });
          } },
          { id: 'e2e', level: 'BEG', make: function (r, s) {
            var y1 = (2 * s.p - s.q) / s.d, y2 = cl(2 * s.p - s.q / s.d);
            return fieldsPart('Evaluate both relations at ' + t('x=2') + '.', [nbox('correct relation: ' + t('y=')), nbox('student’s relation: ' + t('y='))],
              [K.number(y1, function (v) { return same(v, y2) ? { code: 'int-swap', hint: 'That is the student’s output.' } : null; }), K.number(y2, function (v) { return same(v, y1) ? { code: 'int-swap', hint: 'That is the correct output. The student’s relation is ' + t('y=' + s.p + 'x-' + nT(s.q / s.d)) + '.' } : null; })],
              [String(y1), String(y2)], 'correct ' + t(nT(y1)) + ', student ' + t(nT(y2)),
              'Correct: ' + t('\\frac{' + s.p + '(2)-' + s.q + '}{' + s.d + '}=\\frac{' + (2 * s.p - s.q) + '}{' + s.d + '}=' + nT(y1)) + '. Student: ' + t(s.p + '(2)-' + nT(s.q / s.d) + '=' + nT(y2)) + '. One trace value shows the two graphs are different.',
              ['Substitute ' + t('x=2') + ' into each relation (or trace to ' + t('x=2') + ' on each).'], 'outputs at x=2', { bad: [[String(y2), String(y1)]] });
          } },
          { id: 'e2f', level: 'BEG', make: function (r, s) {
            return mc(r, 'Which check is the <b>fastest</b> way to expose the missing brackets?', [
              { html: 'A single trace (or table) value at some ' + t('x\\ne 0') + ', compared with substituting by hand', right: true },
              { html: 'The ' + t('y') + '-intercept', why: 'Both relations have the same ' + t('y') + '-intercept, so this check can’t tell them apart.' },
              { html: 'Checking that the graph rises from left to right', why: 'Both lines rise from left to right (positive slopes), so this doesn’t expose anything.' },
              { html: 'Checking that the graph is a straight line', why: 'Both relations are straight lines.' }],
              'One substitution at, say, ' + t('x=2') + ' gives different outputs at once. (The ' + t('x') + '-intercept also exposes it, but takes longer; the ' + t('y') + '-intercept cannot.)', ['Which check gives different results for the two relations?'], 'fastest bracket check');
          } }] },
      { num: '3', stem: 'Choose the expression you would type into ' + code('Y1') + ' for each relation. Every bracket the calculator needs must be there.', parts: [
        { id: 'e3a', level: 'BEG', make: function (r) {
          var quad = r.chance(0.4), p = r.int(2, 9), q = r.pick([2, 3, 4, 5]), top = quad ? 'X^2' : 'X', sg = quad ? '−' : '+', texTop = quad ? 'x^{2}-' + p : 'x+' + p;
          return mc(r, t('y=\\frac{' + texTop + '}{' + q + '}'), [
            { html: code('(' + top + sg + p + ')/' + q), right: true },
            { html: code(top + sg + p + '/' + q), why: 'Without brackets the calculator divides first, so only the ' + t(p) + ' is divided by ' + t(q) + '.' },
            { html: code(top + '/' + q + sg + p), why: 'This divides only the ' + t(quad ? 'x^{2}' : 'x') + ' by ' + t(q) + '; the whole numerator has to be divided.' },
            { html: code(q + '/(' + top + sg + p + ')'), why: 'This is upside down: it divides ' + t(q) + ' by the expression.' }],
            'Brackets keep the whole numerator over ' + t(q) + ': ' + code('(' + top + sg + p + ')/' + q) + '.', ['Division happens before addition and subtraction unless brackets say otherwise.'], 'Y1 entry numerator');
        } },
        { id: 'e3b', level: 'BEG', make: function (r) {
          var k = r.int(2, 15), p = r.int(1, 9);
          return mc(r, t('y=\\frac{' + k + '}{x+' + p + '}'), [
            { html: code(k + '/(X+' + p + ')'), right: true },
            { html: code(k + '/X+' + p), why: 'Without brackets this is ' + t('\\frac{' + k + '}{x}+' + p) + ': only ' + t('x') + ' is in the denominator.' },
            { html: code('(X+' + p + ')/' + k), why: 'This is upside down.' },
            { html: code(k + '(X+' + p + ')'), why: 'This multiplies by ' + t('x+' + p) + ' instead of dividing.' }],
            'Brackets keep the whole denominator together: ' + code(k + '/(X+' + p + ')') + '.', ['What has to be under the fraction bar?'], 'Y1 entry denominator');
        } },
        { id: 'e3c', level: 'BEG', make: function (r) {
          var o = pickWhere(function () { return { a: r.int(1, 7), b: r.int(2, 9), c: r.int(1, 12) }; }, function (o) { return gcd(o.a, o.b) === 1 && o.a < o.b; }), aX = o.a === 1 ? 'X' : o.a + 'X';
          return mc(r, t('y=\\frac{' + o.a + '}{' + o.b + '}x-' + o.c), [
            { html: code('(' + o.a + '/' + o.b + ')X−' + o.c), right: true },
            { html: code(o.a + '/(' + o.b + 'X)−' + o.c), why: 'This puts ' + t('x') + ' in the denominator: ' + t('\\frac{' + o.a + '}{' + o.b + 'x}') + '.' },
            { html: code('(' + o.a + '/' + o.b + ')(X−' + o.c + ')'), why: 'This multiplies the ' + t(o.c) + ' by ' + t('\\frac{' + o.a + '}{' + o.b + '}') + ' as well.' },
            { html: code('(' + aX + '−' + o.c + ')/' + o.b), why: 'This divides the ' + t(o.c) + ' by ' + t(o.b) + ' too.' }],
            'The brackets make only ' + t('\\frac{' + o.a + '}{' + o.b + '}') + ' multiply ' + t('x') + ': ' + code('(' + o.a + '/' + o.b + ')X−' + o.c) + '.', ['Only the fraction multiplies ' + t('x') + '; the ' + t(o.c) + ' is subtracted afterwards.'], 'Y1 entry fraction coefficient');
        } },
        { id: 'e3d', level: 'BEG', make: function (r) {
          var h = r.int(1, 9), k = r.int(1, 9);
          return mc(r, t('y=(x-' + h + ')^{2}-' + k), [
            { html: code('(X−' + h + ')^2−' + k), right: true },
            { html: code('X−' + h + '^2−' + k), why: 'Without brackets only the ' + t(h) + ' is squared: that graphs ' + t('y=x-' + (h * h) + '-' + k) + '.' },
            { html: code('X^2−' + h + '−' + k), why: 'This squares only ' + t('x') + '; the whole bracket ' + t('x-' + h) + ' must be squared.' },
            { html: code('(X−' + h + ')^(2−' + k + ')'), why: 'The ' + t('-' + k) + ' has gone into the exponent. Close the exponent before typing ' + code('−' + k) + '.' }],
            'The brackets make all of ' + t('x-' + h) + ' get squared: ' + code('(X−' + h + ')^2−' + k) + '.', ['What exactly is being squared?'], 'Y1 entry square');
        } },
        { id: 'e3e', level: 'LIM', make: function (r) {
          var m = r.int(2, 9), b = r.int(1, 9);
          return mc(r, 'To enter ' + t('y=-' + m + 'x+' + b) + ', which key should the entry start with?', [
            { html: code('(−)') + ' — the negation key', right: true },
            { html: code('−') + ' — the subtraction key', why: 'Subtraction needs something before it to subtract from; at the start of an entry it gives ERR:SYNTAX.' },
            { html: 'Either one — they do the same thing', why: 'They don’t: ' + code('−') + ' subtracts, ' + code('(−)') + ' makes a number negative.' },
            { html: code('ALPHA') + ' then ' + code('−'), why: code('ALPHA') + ' types letters; it doesn’t make a number negative.' }],
            'A leading negative has nothing before it to subtract from, so it needs the negation key: ' + code('(−)' + m + 'X+' + b) + '.', ['Is the first minus sign “subtract” or “negative”?'], 'negation key');
        } },
        { id: 'e3f', level: 'EMG', make: function (r) {
          var p = r.int(1, 9), q = r.pick([2, 4, 5]); if (p % q === 0) p++;
          var T = PL(0, 1, [p, q]);
          return y1Part('A student types ' + code('X+' + p + '/' + q) + ' for ' + t('y=\\frac{x+' + p + '}{' + q + '}') + ' (no brackets). Write the relation the calculator actually graphs.', T, [{ is: PL(0, [1, q], [p, q]), code: 'y1-order', hint: 'That is the relation that was meant. Without brackets only the ' + t(p) + ' is divided by ' + t(q) + '.' }],
            'Division is done before addition, so only ' + t(p) + ' is divided: ' + t('y=x+\\frac{' + p + '}{' + q + '}=x+' + nT(p / q)) + '.', ['Order of operations: which number does ' + code('/' + q) + ' act on?'], 'no-bracket graph', { keyTex: 'x+' + nT(p / q), good: ['x+\\frac{' + p + '}{' + q + '}'] });
        } }] },

      /* ---------- Part B ---------- */
      { num: '4', section: 'Extra practice B — Choosing a window that shows everything', stem: 'Work out the intercepts algebraically — and the vertex, if it is a parabola — then record a window that shows every one of those features with room to spare.', parts: [
        { id: 'e4a', level: 'BEG', make: function (r) {
          var m = r.int(2, 4), X = r.int(11, 20), b = -m * X, feat = [featX(X, linT(m, b)), featY(b)], w = niceWin(feat);
          return winPart(t('y=' + linT(m, b)), feat, { sol: linWinSol(m, b, w) + ' ' + WT.Ymin + ' sits just below the lowest feature (the ' + t('y') + '-intercept ' + t(b) + ').', fns: [lf(m, b)], pts: [{ x: X, y: 0, label: '(' + X + ', 0)' }, { x: 0, y: b, label: '(0, ' + b + ')' }], text: 'window y=' + linT(m, b) });
        } },
        { id: 'e4b', level: 'EMG', make: function (r) {
          var r1 = r.int(2, 6), r2 = r1 + 2 * r.int(3, 5), h = (r1 + r2) / 2, k = -Math.pow((r2 - r1) / 2, 2), b = -(r1 + r2), c = r1 * r2, rel = quadT(1, b, c);
          var feat = [featX(r1, rel, 'the smaller ' + t('x') + '-intercept'), featX(r2, rel, 'the larger ' + t('x') + '-intercept'), featY(c), featV(h, k)], w = niceWin(feat);
          return winPart(t('y=' + rel), feat, { sol: t(rel + '=(x-' + r1 + ')(x-' + r2 + ')') + ': ' + t('x') + '-intercepts ' + t(r1) + ' and ' + t(r2) + '; ' + t('y') + '-intercept ' + t(c) + '. Vertex: ' + t('x=\\frac{' + (r1 + r2) + '}{2}=' + h) + ', ' + t('y=' + h + '^{2}-' + (r1 + r2) + '(' + h + ')+' + c + '=' + k) + ', so ' + t('(' + h + ',\\ ' + k + ')') + '.<br>' + WT.Ymin + ' must be below the vertex value ' + t(k) + ' and ' + WT.Ymax + ' above the ' + t('y') + '-intercept ' + t(c) + '. One window: ' + winTex(w) + '.',
            fns: [qf(1, b, c)], pts: [{ x: r1, y: 0 }, { x: r2, y: 0 }, { x: 0, y: c, label: '(0, ' + c + ')' }, { x: h, y: k, label: '(' + h + ', ' + k + ')' }], text: 'window ' + rel });
        } },
        { id: 'e4c', level: 'EMG', make: function (r) {
          var r1 = r.int(1, 4), r2 = r1 + r.int(6, 12), a = -0.5, b = cl(0.5 * (r1 + r2)), c = cl(-0.5 * r1 * r2), h = (r1 + r2) / 2, k = cl(qf(a, b, c)(h)), rel = quadT(a, b, c);
          var feat = [featX(r1, rel, 'the smaller ' + t('x') + '-intercept'), featX(r2, rel, 'the larger ' + t('x') + '-intercept'), featY(c), featV(h, k)], w = niceWin(feat);
          return winPart(t('y=' + rel), feat, { sol: t(rel + '=0\\Rightarrow x^{2}-' + (r1 + r2) + 'x+' + r1 * r2 + '=0\\Rightarrow (x-' + r1 + ')(x-' + r2 + ')=0') + ': ' + t('x') + '-intercepts ' + t(r1) + ' and ' + t(r2) + '; ' + t('y') + '-intercept ' + t(nT(c)) + '. Vertex: ' + t('x=\\frac{-' + nT(b) + '}{2(-0.5)}=' + nT(h)) + ', ' + t('y=' + nT(k)) + '.<br>' + WT.Ymin + ' must be below ' + t(nT(c)) + ' and ' + WT.Ymax + ' above the vertex value ' + t(nT(k)) + '. One window: ' + winTex(w) + '.',
            fns: [qf(a, b, c)], pts: [{ x: r1, y: 0 }, { x: r2, y: 0 }, { x: 0, y: c, label: '(0, ' + nT(c) + ')' }, { x: h, y: k, label: '(' + nT(h) + ', ' + nT(k) + ')' }], text: 'window ' + rel });
        } },
        { id: 'e4d', level: 'BEG', make: function (r) {
          var o = pickWhere(function () { return { p: r.pick([2, 3, 5]), X: -r.int(12, 24), d: r.pick([2, 3, 4, 5]) }; }, function (o) { var q = -o.p * o.X; return q % o.d === 0 && q / o.d >= 8 && q / o.d <= 30 && o.p % o.d !== 0; });
          var q = -o.p * o.X, Y = q / o.d, tex = '\\frac{' + o.p + 'x+' + q + '}{' + o.d + '}', feat = [featX(o.X, o.p + 'x+' + q), featY(Y)], w = niceWin(feat);
          return winPart(t('y=' + tex), feat, { sol: t('x') + '-intercept: ' + t(o.p + 'x+' + q + '=0\\Rightarrow x=' + o.X) + '; ' + t('y') + '-intercept: ' + t('y=\\frac{' + q + '}{' + o.d + '}=' + Y) + '.<br>' + WT.Ymin + ' can sit just below the ' + t('x') + '-axis (where the ' + t('x') + '-intercept is) and ' + WT.Ymax + ' above ' + t(Y) + '. One window: ' + winTex(w) + '.',
            fns: [lf(o.p / o.d, Y)], pts: [{ x: o.X, y: 0, label: '(' + o.X + ', 0)' }, { x: 0, y: Y, label: '(0, ' + Y + ')' }], text: 'window ' + tex });
        } }] },
      { num: '5', stem: function (s) { return 'A student enters ' + t('y=' + s.rel) + ', presses ' + code('ZOOM') + ' ' + code('6') + ' for ZStandard — the window ' + t('x:[-10,\\ 10,\\ 1],\\ y:[-10,\\ 10,\\ 1]') + ' — and gets the screen below. Nothing is drawn at all, so the student reports that the calculator is broken.' + screenStd([]); },
        shared: function (r) {
          var o = pickWhere(function () { var a = r.pick([0.4, 0.4, 0.5, 0.2, 0.25]); return { a: a, h: r.int(12, 16), k: r.int(2, 6) }; }, function (o) { var b = -2 * o.a * o.h, c = o.a * o.h * o.h + o.k; return same(b, Math.round(b)) && same(c, Math.round(c)) && o.a * Math.pow(10 - o.h, 2) + o.k > 10.5; });
          o.b = cl(-2 * o.a * o.h); o.c = cl(o.a * o.h * o.h + o.k); o.f = qf(o.a, o.b, o.c); o.rel = quadT(o.a, o.b, o.c); return o;
        },
        parts: [
          { id: 'e5a', level: 'BEG', make: function (r, s) {
            var xs = [-10, 0, 10], ys = xs.map(function (x) { return cl(s.f(x)); });
            return fieldsPart('Evaluate the relation at ' + t('x=-10') + ', ' + t('x=0') + ' and ' + t('x=10') + '.', xs.map(function (x) { return nbox(t('x=' + x) + ':&nbsp;' + t('y=')); }),
              xs.map(function (x, i) { return K.number(ys[i], function (v) { return x === -10 && same(v, cl(s.f(10))) ? { code: 'calc-sign', hint: 'Check ' + t(nT(s.b) + '(-10)') + ': a negative times a negative is positive.' } : null; }); }), ys.map(String), ys.map(function (y, i) { return t('y(' + xs[i] + ')=' + nT(y)); }).join(', '),
              xs.map(function (x, i) { return t('y(' + x + ')=' + nT(s.a) + '(' + x + ')^{2}' + term(s.b, '', false) + '(' + x + ')+' + nT(s.c) + '=' + nT(ys[i])); }).join('<br>'), ['Square first, then multiply, then add.'], 'blank screen values');
          } },
          { id: 'e5b', level: 'EMG', make: function (r, s) {
            var m = cl(s.f(10));
            return mc(r, 'Use the outputs at ' + t('x=-10') + ', ' + t('x=0') + ' and ' + t('x=10') + ' to explain why the screen really is blank.', [
              { html: 'The outputs fall all the way from ' + t('x=-10') + ' to ' + t('x=10') + ', so the smallest output on the screen is ' + t(nT(m)) + ' — still above ' + t('Y_{\\max}=10') + '. Every point is above the top edge.', right: true },
              { html: 'The parabola opens down, so all of it is below the screen.', why: 'The ' + t('x^{2}') + ' coefficient ' + t(nT(s.a)) + ' is positive, so it opens up — and the values you found are all <b>above</b> ' + t('10') + '.' },
              { html: 'The relation has no ' + t('x') + '-intercepts, so the calculator can’t draw it.', why: 'A graph doesn’t need ' + t('x') + '-intercepts to be drawn. Compare the outputs with ' + t('Y_{\\max}') + '.' },
              { html: 'The calculator really is broken.', why: 'Check the outputs you found against the window: are any of them between ' + t('-10') + ' and ' + t('10') + '?' }],
              t('y(-10)=' + nT(s.f(-10)) + ',\\ y(0)=' + nT(s.c) + ',\\ y(10)=' + nT(m)) + '. The vertex is further right (at ' + t('x=' + s.h) + '), so on the screen the outputs keep falling, and the lowest one, ' + t(nT(m)) + ', is above ' + t('Y_{\\max}=10') + '.', ['Compare each output with ' + t('Y_{\\max}=10') + '.'], 'why blank');
          } },
          { id: 'e5c', level: 'EMG', make: function (r, s) {
            var p = vertexPart(s.a, s.b, s.c, r); p.prompt = 'Find the vertex algebraically, using ' + t('x=-\\frac{b}{2a}') + '.'; return p;
          } },
          { id: 'e5d', level: 'EMG', make: function (r, s) {
            var feat = [featV(s.h, s.k), featY(s.c)], w = niceWin(feat);
            return winPart('Give a window that shows the vertex <b>and</b> the ' + t('y') + '-intercept.', feat, { sol: 'Vertex ' + t('(' + s.h + ',\\ ' + s.k + ')') + ', ' + t('y') + '-intercept ' + t(nT(s.c)) + '. The window needs ' + t('0\\le x\\le ' + s.h) + ' and ' + t(s.k + '\\le y\\le ' + nT(s.c)) + ' with room to spare, e.g. ' + winTex(w) + '.', fns: [s.f], pts: [{ x: s.h, y: s.k, label: '(' + s.h + ', ' + s.k + ')' }, { x: 0, y: s.c, label: '(0, ' + nT(s.c) + ')' }], text: 'window vertex+yint' });
          } },
          { id: 'e5e', level: 'EMG', make: function (r, s) {
            var D = cl(s.b * s.b - 4 * s.a * s.c);
            return mc(r, 'Does this relation have any ' + t('x') + '-intercepts, and what would ' + code('2:zero') + ' do?', [
              { html: 'No: ' + t('b^{2}-4ac=' + nT(D) + '<0') + ' and the vertex ' + t('(' + s.h + ',\\ ' + s.k + ')') + ' is above the ' + t('x') + '-axis, so ' + code('2:zero') + ' finds no crossing and returns an error.', right: true },
              { html: 'Yes, two: the graph is a parabola, and parabolas always cross the ' + t('x') + '-axis twice.', why: 'A parabola that opens up with its vertex above the axis never reaches it. Check the discriminant: ' + t(nT(D)) + '.' },
              { html: 'Yes, one: ' + code('2:zero') + ' returns the vertex.', why: code('2:zero') + ' looks for ' + t('y=0') + '; the vertex has ' + t('y=' + s.k) + '.' },
              { html: 'No, but ' + code('2:zero') + ' would return ' + t('x=0') + '.', why: code('2:zero') + ' can’t return a value where ' + t('y\\ne 0') + ' — with no crossing it gives an error.' }],
              t('b^{2}-4ac=' + sgp(s.b) + '^{2}-4(' + nT(s.a) + ')(' + nT(s.c) + ')=' + nT(s.b * s.b) + '-' + nT(4 * s.a * s.c) + '=' + nT(D) + '<0') + ': no real roots. The parabola opens up and its lowest point ' + t('(' + s.h + ',\\ ' + s.k + ')') + ' is above the axis. ' + code('2:zero') + ' needs a sign change between the bounds, so it gives an error.', ['Where is the lowest point of the graph?'], 'no x-intercepts');
          } },
          { id: 'e5f', level: 'BEG', make: function (r, s) {
            return mc(r, 'The blank screen hid the whole graph. Which important feature can ZStandard hide even when a graph <b>is</b> visible in it?', [
              { html: 'Any intercept or vertex beyond ' + t('\\pm 10') + ' — e.g. ' + t('y=0.75x-9') + ' shows up, but its ' + t('x') + '-intercept ' + t('x=12') + ' is off the right edge.', right: true },
              { html: 'Nothing — if part of a graph is visible, every feature is.', why: 'Try ' + t('y=0.75x-9') + ' in ZStandard: the line shows, but where is its ' + t('x') + '-intercept?' },
              { html: 'Only the ' + t('y') + '-intercept, never an ' + t('x') + '-intercept.', why: 'Either kind of intercept (or a vertex) can be beyond ' + t('\\pm 10') + '.' },
              { html: 'The slope of a line.', why: 'The slope shows as the steepness — it isn’t a point that can be off the screen.' }],
              'ZStandard shows only ' + t('-10\\le x\\le 10') + ' and ' + t('-10\\le y\\le 10') + '. Any intercept or turning point outside that box is hidden, even when part of the graph is on the screen.', ['What part of the plane does ZStandard show?'], 'what ZStandard hides');
          } }] },
      { num: '6', stem: function (s) { return code('ZoomFit') + ' (' + code('ZOOM') + ' ' + code('0') + ') keeps your ' + t('x') + '-bounds and chooses ' + WT.Ymin + ' and ' + WT.Ymax + ' so the curve exactly fills the screen over those bounds. Consider ' + t('y=' + s.rel) + '.'; },
        shared: function (r) {
          var o = pickWhere(function () { var a = r.pick([-0.25, -0.25, -0.5]); return { a: a, h: r.pick([6, 8, 10, 12]), k: r.int(10, 30), d: r.pick([10, 12]) }; }, function (o) { var b = -2 * o.a * o.h, c = o.a * o.h * o.h + o.k; return same(b, Math.round(b)) && same(c, Math.round(c)) && o.h - o.d < 0 && Math.abs(c) <= 15 && c !== 0; });
          o.b = cl(-2 * o.a * o.h); o.c = cl(o.a * o.h * o.h + o.k); o.f = qf(o.a, o.b, o.c); o.rel = quadT(o.a, o.b, o.c); o.lo = cl(o.k + o.a * o.d * o.d); return o;
        },
        parts: [
          { id: 'e6a', level: 'PRG', make: function (r, s) {
            var L = s.h - s.d, R = s.h + s.d;
            return fieldsPart('With ' + t('x:[' + L + ',\\ ' + R + ',\\ 2]') + ' set, predict the exact ' + WT.Ymin + ' and ' + WT.Ymax + ' that ZoomFit will produce.', [nbox(WT.Ymin), nbox(WT.Ymax)],
              [K.number(s.lo, function (v) { if (same(v, s.c)) return { code: 'zf-yint', hint: 'That is the ' + t('y') + '-intercept, but the lowest output on ' + t('[' + L + ',\\ ' + R + ']') + ' is at an <b>end</b> of the interval.' }; if (same(v, s.k)) return { code: 'int-swap', hint: 'That is the highest output.' }; return null; }),
                K.number(s.k, function (v) { if (same(v, s.c)) return { code: 'zf-yint', hint: 'That is the ' + t('y') + '-intercept. The highest point is the vertex — is it inside the interval?' }; if (same(v, s.lo)) return { code: 'int-swap', hint: 'That is the lowest output.' }; return null; })],
              [String(s.lo), String(s.k)], WT.Ymin + ' ' + t('=' + nT(s.lo)) + ', ' + WT.Ymax + ' ' + t('=' + s.k),
              t('a<0') + ', so the parabola opens down. Vertex: ' + t('x=\\frac{-' + nT(s.b) + '}{2(' + nT(s.a) + ')}=' + s.h) + ', inside ' + t('[' + L + ',\\ ' + R + ']') + '; ' + t('y(' + s.h + ')=' + s.k) + ', so ' + WT.Ymax + ' ' + t('=' + s.k) + '.<br>The lowest output is at an end, and both ends are ' + t(s.d) + ' from the axis ' + t('x=' + s.h) + ': ' + t('y(' + L + ')=y(' + R + ')=' + nT(s.lo)) + ', so ' + WT.Ymin + ' ' + t('=' + nT(s.lo)) + '.',
              ['The highest point is the vertex (if it is inside the interval). The lowest point of a downward parabola on an interval is at an end.', 'The two ends are the same distance from the axis of symmetry, so they have the same output.'], 'ZoomFit prediction');
          } },
          { id: 'e6b', level: 'EMG', make: function (r, s) {
            var lo = cl(s.f(-10));
            return fieldsPart('A student instead sets ' + t('x:[-10,\\ 0,\\ 1]') + ' and presses ' + code('ZOOM') + ' ' + code('0') + '. Predict ' + WT.Ymin + ' and ' + WT.Ymax + ' now.', [nbox(WT.Ymin), nbox(WT.Ymax)],
              [K.number(lo, null), K.number(s.c, function (v) { return same(v, s.k) ? { code: 'zf-vertex', hint: 'The vertex is at ' + t('x=' + s.h) + ', outside ' + t('[-10,\\ 0]') + ' — it isn’t on this screen.' } : null; })],
              [String(lo), String(s.c)], WT.Ymin + ' ' + t('=' + nT(lo)) + ', ' + WT.Ymax + ' ' + t('=' + nT(s.c)),
              'On ' + t('-10\\le x\\le 0') + ' the curve is left of the vertex, so it is still rising: the extremes are at the ends. ' + t('y(-10)=' + nT(lo)) + ', ' + t('y(0)=' + nT(s.c)) + '. The maximum (at ' + t('x=' + s.h) + ') is outside ' + t('[-10,\\ 0]') + ', and ZoomFit never changes ' + WT.Xmin + ' or ' + WT.Xmax + ', so it stays off the screen.',
              ['Is the vertex inside ' + t('[-10,\\ 0]') + '? If not, the highest and lowest outputs are at the ends.'], 'ZoomFit left side', { bad: [[String(lo), String(s.k)]] });
          } },
          { id: 'e6c', level: 'BEG', make: function (r) {
            return mc(r, 'Complete the sentence: ZoomFit fixes a bad ____ window but can never fix a bad ____ window.', [
              { html: '<b>vertical</b> … <b>horizontal</b>', right: true },
              { html: '<b>horizontal</b> … <b>vertical</b>', why: 'ZoomFit changes only ' + WT.Ymin + ' and ' + WT.Ymax + ' — the vertical bounds.' },
              { html: '<b>small</b> … <b>large</b>', why: 'Think about which bounds ZoomFit is allowed to change.' },
              { html: '<b>linear</b> … <b>quadratic</b>', why: 'ZoomFit works the same way for any relation; think about which bounds it changes.' }],
              'ZoomFit only chooses ' + WT.Ymin + ' and ' + WT.Ymax + ' to fit the part of the curve the ' + t('x') + '-bounds already contain. If the ' + t('x') + '-bounds leave out a feature, ZoomFit can never bring it back.', ['Which window values does ZoomFit change?'], 'ZoomFit sentence');
          } }] },

      /* ---------- Part C ---------- */
      { num: '7', section: 'Extra practice C — The CALC menu: value, zero, minimum, maximum, intersect', stem: 'Open ' + code('CALC') + ' (' + code('2ND') + ' ' + code('TRACE') + ') and use ' + code('1:value') + ' to find the output at the given input. Then verify each answer algebraically.',
        shared: function (r) { return { xa: r.int(2, 6), xb: -r.int(2, 7), xc: r.pick([2, 6, 10]), xd: -r.int(2, 7) }; },
        parts: [
          { id: 'e7a', level: 'BEG', make: function (r, s) {
            var o = pickWhere(function () { return { p: r.int(2, 9), q: r.int(1, 12), d: r.pick([3, 4, 6, 7]) }; }, function (o) { return (o.p * s.xa - o.q) % o.d === 0 && o.p % o.d !== 0; }), y = (o.p * s.xa - o.q) / o.d, tex = '\\frac{' + o.p + 'x-' + o.q + '}{' + o.d + '}';
            return numPart(t('y=' + tex) + ', ' + t('x=' + s.xa), y, [[o.p * s.xa - o.q, 'int-no-div', 'Divide the numerator by ' + t(o.d) + '.'], [o.p * s.xa - o.q / o.d, 'y1-order', 'The whole numerator is divided by ' + t(o.d) + ' — in ' + code('Y1') + ' that needs brackets.']],
              code('1:value') + ', ' + t('X=' + s.xa) + ': ' + t('Y=' + y) + '. Check: ' + t('y=\\frac{' + o.p + '(' + s.xa + ')-' + o.q + '}{' + o.d + '}=\\frac{' + (o.p * s.xa - o.q) + '}{' + o.d + '}=' + y) + ' ✓', ['Work out the numerator first, then divide.'], 'value ' + tex);
          } },
          { id: 'e7b', level: 'BEG', make: function (r, s) {
            var a = r.pick([-0.6, -0.4, -0.5, -0.2]), b = r.int(2, 6), c = r.int(1, 5), x = s.xb, f = qf(a, b, c), y = cl(f(x));
            return numPart(t('y=' + quadT(a, b, c)) + ', ' + t('x=' + x), y, [[cl(-a * x * x + b * x + c), 'calc-sq-neg', t('(' + x + ')^{2}=' + x * x) + ' is positive; then multiply by ' + t(nT(a)) + '.'], [cl(a * x * x - b * x + c), 'calc-sign', 'Check ' + t(b + '(' + x + ')=' + b * x) + '.']],
              code('1:value') + ', ' + t('X=' + x) + ': ' + t('Y=' + nT(y)) + '. Check: ' + t('y=' + nT(a) + '(' + x + ')^{2}+' + b + '(' + x + ')+' + c + '=' + nT(a * x * x) + nT(b * x) + '+' + c + '=' + nT(y)) + ' ✓', ['Square the input first (in brackets), then multiply by ' + t(nT(a)) + '.'], 'value ' + quadT(a, b, c));
          } },
          { id: 'e7c', level: 'BEG', make: function (r, s) {
            var o = pickWhere(function () { return { p: r.pick([1, 3, 5, 7]), q: r.pick([1, 3, 5, 7, 9, 11, 13]) }; }, function (o) { return Number.isInteger(o.p * s.xc / 4 - o.q / 2); }), x = s.xc, y = o.p * x / 4 - o.q / 2, tex = '\\frac{' + o.p + '}{4}x-\\frac{' + o.q + '}{2}';
            return numPart(t('y=' + tex) + ', ' + t('x=' + x), y, [[o.p * x / 4 + o.q / 2, 'calc-sign', 'Subtract ' + t('\\frac{' + o.q + '}{2}') + '.']],
              code('1:value') + ', ' + t('X=' + x) + ': ' + t('Y=' + y) + '. Check: ' + t('y=\\frac{' + o.p + '}{4}(' + x + ')-\\frac{' + o.q + '}{2}=\\frac{' + o.p * x / 2 + '}{2}-\\frac{' + o.q + '}{2}=' + y) + ' ✓', ['Use a common denominator of ' + t('2') + ' (or decimals).'], 'value ' + tex);
          } },
          { id: 'e7d', level: 'BEG', make: function (r, s) {
            var m = r.int(2, 4), n = r.int(1, 9), c = r.int(1, 9), x = s.xd, y = Math.abs(m * x - n) - c;
            return numPart(t('y=|' + m + 'x-' + n + '|-' + c) + ', ' + t('x=' + x), y, [[m * x - n - c, 'calc-abs', 'The absolute value makes ' + t(m + '(' + x + ')-' + n + '=' + (m * x - n)) + ' positive before you subtract ' + t(c) + '.'], [Math.abs(m * x - n) + c, 'calc-sign', 'Subtract ' + t(c) + ' after taking the absolute value.']],
              code('1:value') + ', ' + t('X=' + x) + ': ' + t('Y=' + y) + '. Check: ' + t('y=|' + m + '(' + x + ')-' + n + '|-' + c + '=|' + (m * x - n) + '|-' + c + '=' + Math.abs(m * x - n) + '-' + c + '=' + y) + ' ✓', ['Work out the inside of the bars, make it positive, then subtract.'], 'value abs');
          } },
          { id: 'e7e', level: 'EMG', make: function (r, s) {
            var xs = [s.xa, s.xb, s.xc, s.xd], lo = Math.min.apply(null, xs), hi = Math.max.apply(null, xs);
            return fieldsPart(code('1:value') + ' refuses any input outside the current window. The inputs used in (a)–(d) were ' + t(xs.join(',\\ ')) + '. State the <b>largest</b> ' + WT.Xmin + ' and the <b>smallest</b> ' + WT.Xmax + ' that would let you do all four without changing the window.', [nbox(WT.Xmin), nbox(WT.Xmax)],
              [K.number(lo, function (v) { return v < lo ? { code: 'win-not-tight', hint: 'That works, but it isn’t the <b>largest</b> possible ' + WT.Xmin + '. The window only needs to reach the smallest input.' } : v > lo ? { code: 'win-cut', hint: 'Then ' + t('x=' + lo) + ' would be outside the window.' } : null; }),
                K.number(hi, function (v) { return v > hi ? { code: 'win-not-tight', hint: 'That works, but it isn’t the <b>smallest</b> possible ' + WT.Xmax + '.' } : v < hi ? { code: 'win-cut', hint: 'Then ' + t('x=' + hi) + ' would be outside the window.' } : null; })],
              [String(lo), String(hi)], WT.Xmin + ' ' + t('=' + lo) + ', ' + WT.Xmax + ' ' + t('=' + hi),
              'The window needs ' + WT.Xmin + ' ' + t('\\le ' + lo) + ' and ' + WT.Xmax + ' ' + t('\\ge ' + hi) + ', so the tightest bounds are ' + t(lo) + ' and ' + t(hi) + '. The <b>table</b> (' + code('2ND') + ' ' + code('GRAPH') + ', with Indpnt: Ask) gives the same outputs and ignores the window completely.', ['The window has to reach the smallest and the largest input.'], 'tightest x-bounds', { bad: [[String(lo - 1), String(hi)], [String(lo), String(hi + 1)]] });
          } }] },
      { num: '8', stem: function (s) { return 'Use ' + code('2:zero') + ' to find every ' + t('x') + '-intercept, then press ' + code('2ND') + ' ' + code('QUIT') + ' and convert the decimal with ' + code('X,T,θ,n') + ' ' + code('MATH') + ' ' + code('ENTER') + ' ' + code('ENTER') + '. Record each ' + t('x') + '-intercept as an <b>exact value</b>.<br>(a) ' + t('y=' + s.A.tex) + '&emsp; (b) ' + t('y=' + s.Bq.tex) + '&emsp; (c) ' + t('y=' + s.Cq.tex) + '&emsp; (d) ' + t('y=' + s.D.tex) + '&emsp; (e) ' + t('y=' + s.E.tex); },
        shared: function (r) {
          var A = pickWhere(function () { return { p: r.int(3, 9), q: r.int(1, 11), d: r.int(2, 5) }; }, function (o) { return gcd(o.p, o.q) === 1 && o.q % o.p !== 0; });
          A.tex = '\\frac{' + A.p + 'x-' + A.q + '}{' + A.d + '}'; A.v = [[A.q, A.p]];
          var Bq = pickWhere(function () { return { m: r.int(2, 9), n: r.int(1, 11) }; }, function (o) { return gcd(o.m, o.n) === 1 && o.n % o.m !== 0; });
          Bq.tex = linT(Bq.m, Bq.n); Bq.v = [[-Bq.n, Bq.m]];
          var Cq = pickWhere(function () { return { u: r.int(2, 5), w: r.int(1, 9) }; }, function (o) { return gcd(o.u, o.w) === 1; });
          Cq.tex = (Cq.u * Cq.u) + 'x^{2}-' + (Cq.w * Cq.w); Cq.v = [[Cq.w, Cq.u], [-Cq.w, Cq.u]];
          var D = pickWhere(function () { return { a: r.pick([2, 3]), p: r.pick([1, 3, 5, 7]), q: r.int(2, 6) }; }, function (o) { return o.p % o.a !== 0 && o.a * o.q !== o.p; });
          D.b = D.p - D.a * D.q; D.c = -D.p * D.q; D.tex = quadT(D.a, D.b, D.c); D.v = [[-D.p, D.a], [D.q, 1]];
          var E = { n: r.pick([2, 3, 5, 6, 7, 10, 11, 13]) }; E.tex = 'x^{2}-' + E.n;
          return { A: A, Bq: Bq, Cq: Cq, D: D, E: E };
        },
        parts: [
          { id: 'e8a', level: 'BEG', make: function (r, s) { var A = s.A; return zeroPart('(a) ' + t('y=' + A.tex), A.v, t('\\frac{' + A.p + 'x-' + A.q + '}{' + A.d + '}=0\\Rightarrow ' + A.p + 'x-' + A.q + '=0\\Rightarrow x=' + rT(A.q, A.p)), [[[A.q, A.d * A.p]], 'int-no-div', 'The denominator ' + t(A.d) + ' doesn’t matter: a fraction is ' + t('0') + ' when its numerator is ' + t('0') + '.']); } },
          { id: 'e8b', level: 'BEG', make: function (r, s) { var o = s.Bq; return zeroPart('(b) ' + t('y=' + o.tex), o.v, t(o.tex + '=0\\Rightarrow ' + o.m + 'x=-' + o.n + '\\Rightarrow x=' + rT(-o.n, o.m))); } },
          { id: 'e8c', level: 'EMG', make: function (r, s) { var o = s.Cq; return zeroPart('(c) ' + t('y=' + o.tex), o.v, t(o.tex + '=0\\Rightarrow x^{2}=\\frac{' + o.w * o.w + '}{' + o.u * o.u + '}\\Rightarrow x=\\pm' + rT(o.w, o.u)), [[[o.w, o.u]], 'sol-missing', 'A square root has two answers: ' + t('\\pm') + '.']); } },
          { id: 'e8d', level: 'EMG', make: function (r, s) { var o = s.D; return zeroPart('(d) ' + t('y=' + o.tex), o.v, t(o.tex + '=(' + o.a + 'x+' + o.p + ')(x-' + o.q + ')=0') + ', so ' + t('x=' + rT(-o.p, o.a)) + ' or ' + t('x=' + o.q)); } },
          { id: 'e8e', level: 'EMG', make: function (r, s) {
            var n = s.E.n, v = Math.sqrt(n);
            return mathPart('(e) ' + t('y=' + s.E.tex), exactSet([v, -v], { close: 'That is a rounded decimal (▸Frac just hands it back — there is no fraction for it). Write the exact value with a square root: ' + t('\\pm\\sqrt{\\ }') + '.' }), 'x=\\pm\\sqrt{' + n + '}',
              C.zero + ' shows ' + t('X=\\pm' + nT(rnd(v, 7))) + '; ▸Frac hands the decimal back. Algebra: ' + t('x^{2}-' + n + '=0\\Rightarrow x^{2}=' + n + '\\Rightarrow x=\\pm\\sqrt{' + n + '}') + '.', ['Solve ' + t('x^{2}=' + n) + ': the exact answer needs a square root.'], 'zeros x^2-' + n, 'solutions', { good: ['\\sqrt{' + n + '}, -\\sqrt{' + n + '}'], bad: ['\\pm' + nT(rnd(v, 2)), '\\sqrt{' + n + '}'] });
          } },
          { id: 'e8f', level: 'LIM', make: function (r, s) {
            return mc(r, 'How many times must ' + code('2:zero') + ' be run in part (d), and what changes between the runs?', [
              { html: '<b>Twice</b> — once for each ' + t('x') + '-intercept; the Left Bound?, Right Bound? and Guess? are moved to the other crossing.', right: true },
              { html: '<b>Once</b> — it finds both intercepts at the same time.', why: code('2:zero') + ' returns one crossing each time: the one between the bounds.' },
              { html: '<b>Twice</b>, with exactly the same bounds both times.', why: 'The same bounds give the same crossing. Move them around the other one.' },
              { html: '<b>Four times</b> — twice for each intercept.', why: 'One run per crossing is enough.' }],
              'The parabola crosses the axis twice, and ' + code('2:zero') + ' finds the single crossing between the bounds, so run it twice with the bounds around each crossing in turn.', ['How many crossings are there, and how many does one run find?'], 'zero twice');
          } },
          { id: 'e8g', level: 'EMG', make: function (r, s) {
            var opts = [['a', s.A.tex, rT(s.A.q, s.A.p)], ['b', s.Bq.tex, rT(-s.Bq.n, s.Bq.m)], ['c', s.Cq.tex, '\\pm' + rT(s.Cq.w, s.Cq.u)], ['d', s.D.tex, rT(-s.D.p, s.D.a) + ',\\ ' + s.D.q]].map(function (o) { return { html: '(' + o[0] + ') ' + t('y=' + o[1]), why: 'Its intercept ' + t(o[2]) + ' is rational, so ▸Frac converts it.' }; });
            opts.push({ html: '(e) ' + t('y=' + s.E.tex), right: true });
            var keep = r.sample([0, 1, 2, 3], 3).sort(); opts = keep.map(function (i) { return opts[i]; }).concat([opts[4]]);
            return mc(r, 'In exactly one of (a)–(e) the ▸Frac conversion hands the decimal straight back instead of a fraction. Which one?', opts,
              'Part (e): its intercepts are ' + t('\\pm\\sqrt{' + s.E.n + '}') + ', which is <b>irrational</b> — no fraction equals it, so ▸Frac has nothing to convert. The others are rational.', ['Which intercept can’t be written as a fraction?'], 'which is irrational');
          } }] },
      { num: '9', stem: function (s) { return 'Decide first whether each parabola opens up or down, so you know to choose ' + code('3:minimum') + ' or ' + code('4:maximum') + '. Then give the turning point as an <b>exact</b> ordered pair.'; },
        shared: function (r) {
          var a = pickWhere(function () { return { b: r.pick([3, 5, 7, 9, 11]), c: r.int(1, 12) }; }, function () { return true; });
          var b = { b: r.pick([6, 10, 14]), c: r.int(1, 9) };
          var c = pickWhere(function () { return { b: r.pick([2, 6, 10]), c: r.int(1, 9) }; }, function () { return true; });
          var d = { b: r.int(1, 4), c: r.int(1, 9) };
          var Q = [{ id: 'a', a: 1, b: -a.b, c: a.c }, { id: 'b', a: -2, b: b.b, c: -b.c }, { id: 'c', a: 0.4, b: -c.b, c: c.c }, { id: 'd', a: -0.125, b: d.b, c: d.c }];
          Q.forEach(function (q) { q.tex = quadT(q.a, q.b, q.c); });
          return { Q: Q, order: r.shuffle([0, 1, 2, 3]) };
        },
        parts: [
          { id: 'e9a', level: 'BEG', make: function (r, s) {
            var rows = s.order.map(function (i) { return { id: s.Q[i].id, html: t('y=' + s.Q[i].tex) }; }), want = {}, sg = {};
            s.Q.forEach(function (q) { want[q.id] = q.a > 0 ? 'min' : 'max'; sg[q.id] = q.a; });
            return B.grid('Which feature finds the turning point of each parabola?', rows, [{ id: 'min', html: 'min ' + code('3') }, { id: 'max', html: 'max ' + code('4') }], want,
              { why: function (rid) { return { code: 'row', hint: 'Look at the ' + t('x^{2}') + ' coefficient of ' + t('y=' + s.Q.filter(function (q) { return q.id === rid; })[0].tex) + ': ' + (sg[rid] > 0 ? 'positive → opens up → a lowest point.' : 'negative → opens down → a highest point.') }; } },
              'Positive ' + t('x^{2}') + ' coefficient → opens up → ' + code('3:minimum') + '; negative → opens down → ' + code('4:maximum') + '.<br>' + s.Q.map(function (q) { return t('y=' + q.tex) + ': ' + t('a=' + nT(q.a)) + ' → ' + (q.a > 0 ? 'minimum' : 'maximum'); }).join('<br>'),
              ['The sign of the ' + t('x^{2}') + ' coefficient tells you which way the parabola opens.'], 'min or max');
          } },
          { id: 'e9b', level: 'EMG', make: function (r, s) { return vertexPart(s.Q[0].a, s.Q[0].b, s.Q[0].c, r); } },
          { id: 'e9c', level: 'EMG', make: function (r, s) { return vertexPart(s.Q[1].a, s.Q[1].b, s.Q[1].c, r); } },
          { id: 'e9d', level: 'EMG', make: function (r, s) { return vertexPart(s.Q[2].a, s.Q[2].b, s.Q[2].c, r); } },
          { id: 'e9e', level: 'EMG', make: function (r, s) { return vertexPart(s.Q[3].a, s.Q[3].b, s.Q[3].c, r); } },
          { id: 'e9f', level: 'BEG', make: function (r, s) {
            var q = s.Q[1], h = -q.b / (2 * q.a), k = qf(q.a, q.b, q.c)(h);
            return mc(r, 'For ' + t('y=' + q.tex) + ' one student’s calculator returns ' + t('X=' + nT(h - 0.0000002) + ',\\ Y=' + nT(k - 0.000001)) + '. What should the student hand in?', [
              { html: t('\\left(' + vt(h) + ',\\ ' + vt(k) + '\\right)') + ' — the trailing digits are the calculator’s approximation error.', right: true },
              { html: t('(' + nT(h - 0.0000002) + ',\\ ' + nT(k - 0.000001) + ')') + ' exactly as shown.', why: 'The calculator searches numerically and stops when it is “close enough”. Round to the sensible value and check it by substituting.' },
              { html: t('(' + Math.floor(h) + ',\\ ' + Math.floor(k) + ')') + ' — drop the decimals.', why: 'Chopping the decimals loses the exact value. Substitute ' + t('x=' + vt(h)) + ' to check.' },
              { html: 'Nothing — the calculator has made an error, so the maximum can’t be found.', why: 'It is only a tiny approximation error. Round, then check by substituting.' }],
              code('4:maximum') + ' searches numerically between the bounds and stops when it is close enough, so the trailing digits are not mathematics. Exactly, ' + t('x=-\\frac{b}{2a}=' + vt(h)) + ' and ' + t('y=' + vt(k)) + ': the maximum point is ' + t('\\left(' + vt(h) + ',\\ ' + vt(k) + '\\right)') + '.', ['Is ' + t(nT(h - 0.0000002)) + ' really different from ' + t(nT(h)) + '?'], 'calculator noise');
          } }] },
      { num: '10', stem: 'Use ' + code('5:intersect') + '. Give every intersection exactly.', parts: [
        { id: 'e10a', level: 'BEG', make: function (r) {
          var o = pickWhere(function () { return { p: r.int(2, 7), q: r.int(1, 9), d: r.int(2, 5), k: r.int(2, 10) }; }, function (o) { return (o.d * o.k + o.q) % o.p !== 0; });
          var X = ex.norm(o.d * o.k + o.q, o.p), tex = '\\frac{' + o.p + 'x-' + o.q + '}{' + o.d + '}';
          return mathPart(t('Y_1=' + tex) + ', ' + t('Y_2=' + o.k) + '. State the ' + t('x') + '-coordinate of the intersection point.', exactChk(X, { dl: [[(o.k + o.q) / o.p, 'int-no-div', 'Multiply both sides by ' + t(o.d) + ' first: ' + t(o.p + 'x-' + o.q + '=' + o.d * o.k) + '.'], [(o.d * o.k - o.q) / o.p, 'inv-sign', 'Add ' + t(o.q) + ' to both sides.']] }), ex.texRat(X),
            t(tex + '=' + o.k + '\\Rightarrow ' + o.p + 'x-' + o.q + '=' + o.d * o.k + '\\Rightarrow ' + o.p + 'x=' + (o.d * o.k + o.q) + '\\Rightarrow x=' + ex.texRat(X)) + ' ' + (termDec(X[0] / X[1]) ? t('=' + termDec(X[0] / X[1])) : '') + '. Intersection point ' + t('\\left(' + ex.texRat(X) + ',\\ ' + o.k + '\\right)') + '.', ['Set ' + t('Y_1=Y_2') + ' and solve: multiply by ' + t(o.d) + ', add ' + t(o.q) + ', divide by ' + t(o.p) + '.'], 'intersect with constant', 'fraction');
        } },
        { id: 'e10b', level: 'EMG', make: function (r) {
          var o = pickWhere(function () { return { r1: r.int(2, 7), r2: -r.int(1, 5), k: r.int(1, 6) }; }, function (o) { return o.r1 + o.r2 !== 0; });
          var B_ = -(o.r1 + o.r2), C0 = o.r1 * o.r2 + o.k, rel = quadT(1, B_, C0);
          return mathPart(t('Y_1=' + rel) + ', ' + t('Y_2=' + o.k) + '. State the ' + t('x') + '-coordinates of the intersection points.', exactSet([o.r1, o.r2], { diag: function (A) { var D = B_ * B_ - 4 * C0; if (D >= 0 && sameVals(A, [(-B_ + Math.sqrt(D)) / 2, (-B_ - Math.sqrt(D)) / 2])) return { code: 'used-zero', hint: 'Those are the zeros of ' + t('Y_1') + '. Set ' + t('Y_1=' + o.k) + ' first.' }; return null; } }), 'x=' + o.r1 + ',\\ x=' + o.r2,
            t(rel + '=' + o.k + '\\Rightarrow ' + quadT(1, B_, C0 - o.k) + '=0\\Rightarrow (x-' + o.r1 + ')(x' + term(-o.r2, '', false) + ')=0') + ', so ' + t('x=' + o.r1) + ' or ' + t('x=' + o.r2) + ': points ' + t('(' + o.r2 + ',\\ ' + o.k + ')') + ' and ' + t('(' + o.r1 + ',\\ ' + o.k + ')') + ' — run ' + code('5:intersect') + ' once near each.', ['Move ' + t(o.k) + ' to the left side so one side is ' + t('0') + ', then factor.'], 'parabola meets constant', 'solutions', { good: [o.r2 + ', ' + o.r1], bad: [String(o.r1)] });
        } },
        { id: 'e10c', level: 'EMG', make: function (r) {
          var o = pickWhere(function () { return { m1: r.pick([1.5, 2, 0.5, 1]), m2: r.pick([-0.5, -1, -1.5]), x: r.int(2, 8), y: r.int(1, 9) }; }, function (o) { var b1 = o.y - o.m1 * o.x, b2 = o.y - o.m2 * o.x; return same(b1, Math.round(b1)) && same(b2, Math.round(b2)) && b1 !== 0; });
          var b1 = cl(o.y - o.m1 * o.x), b2 = cl(o.y - o.m2 * o.x);
          return fieldsPart(t('Y_1=' + linT(o.m1, b1)) + ', ' + t('Y_2=' + linT(o.m2, b2)) + '. State the intersection point.', [nbox(t('x=')), nbox(t('y='))], [K.number(o.x, function (v) { return same(v, o.y) ? { code: 'int-swap', hint: 'That is the ' + t('y') + '-coordinate.' } : null; }), K.number(o.y, null)], [String(o.x), String(o.y)], t('(' + o.x + ',\\ ' + o.y + ')'),
            t(linT(o.m1, b1) + '=' + linT(o.m2, b2) + '\\Rightarrow ' + nT(o.m1 - o.m2) + 'x=' + nT(b2 - b1) + '\\Rightarrow x=' + o.x) + '; ' + t('y=' + nT(o.m1) + '(' + o.x + ')' + term(b1, '', false) + '=' + o.y) + ' (check: ' + t(nT(o.m2) + '(' + o.x + ')' + term(b2, '', false) + '=' + o.y) + ' ✓).', ['Set ' + t('Y_1=Y_2') + ', collect the ' + t('x') + '-terms on one side, solve, then substitute back.'], 'two lines meet');
        } },
        { id: 'e10d', level: 'EMG', make: function (r) {
          var o = pickWhere(function () { return { r1: r.int(2, 5), r2: -r.int(1, 4), c1: -r.int(1, 5) }; }, function (o) { return o.r1 + o.r2 !== 0; });
          var m = o.r1 + o.r2, b = o.c1 - o.r1 * o.r2, pts = [[o.r2, m * o.r2 + b], [o.r1, m * o.r1 + b]];
          var p = K.P.pairs(t('Y_1=x^{2}' + term(o.c1, '', false)) + ', ' + t('Y_2=' + linT(m, b)) + '. State both intersection points.', pts, {},
            t('x^{2}' + term(o.c1, '', false) + '=' + linT(m, b) + '\\Rightarrow ' + quadT(1, -m, o.c1 - b) + '=0\\Rightarrow (x-' + o.r1 + ')(x+' + (-o.r2) + ')=0') + ', so ' + t('x=' + o.r1) + ' or ' + t('x=' + o.r2) + '. Then ' + t('y=' + linT(m, b)) + ': ' + t('(' + pts[0][0] + ',\\ ' + pts[0][1] + ')') + ' and ' + t('(' + pts[1][0] + ',\\ ' + pts[1][1] + ')') + '. On the calculator, run ' + code('5:intersect') + ' twice, moving the Guess? to each crossing.',
            ['Set ' + t('Y_1=Y_2') + ', move everything to one side and factor; then find each ' + t('y') + ' from either relation.'], 'parabola meets line');
          p.bad = ['\\{(' + pts[0][0] + ', ' + pts[0][1] + ')\\}'].concat(pts.every(function (q) { return q[0] === q[1]; }) ? [] : ['\\{(' + pts[0][1] + ', ' + pts[0][0] + '), (' + pts[1][1] + ', ' + pts[1][0] + ')\\}']);
          return p;
        } },
        { id: 'e10e', level: 'BEG', make: function (r) {
          return mc(r, 'Two curves cross twice, but ' + code('5:intersect') + ' reports a single point. What must you do to get the other point, and why does the Guess? prompt exist?', [
            { html: 'Run ' + code('5:intersect') + ' again and, at Guess?, move the cursor near the <b>other</b> crossing — the calculator finds the crossing nearest the guess.', right: true },
            { html: 'Nothing — ' + code('5:intersect') + ' always finds every crossing at once.', why: 'It reports one point per run.' },
            { html: 'Change the window to ZStandard and run it again.', why: 'Changing the window doesn’t tell the calculator which crossing you want — the Guess? does.' },
            { html: 'Use ' + code('2:zero') + ' instead.', why: code('2:zero') + ' finds where one curve meets the ' + t('x') + '-axis, not where two curves meet.' }],
            'Two curves can meet more than once, so the calculator needs to know which crossing you want: it converges on the intersection nearest the Guess?.', ['What does the cursor position at Guess? decide?'], 'guess prompt');
        } }] },

      /* ---------- Part D ---------- */
      { num: '11', section: 'Extra practice D — Error analysis', stem: function (s) { return 'Asked to graph ' + t(s.A + 'x+' + s.B + 'y=' + s.C) + ', a student moves the ' + t(s.A + 'x') + ' across and types ' + code('Y1=' + s.C + '−' + s.A + 'X') + ' into the editor.'; },
        shared: function (r) { return pickWhere(function () { var A = r.int(2, 6), B = r.int(2, 5); return { A: A, B: B, C: A * B * r.int(1, 3), x3: r.int(1, 5) }; }, function (o) { return o.A !== o.B && ((o.C - o.A * o.x3) % o.B === 0) && o.C - o.A * o.x3 !== 0 && gcd(o.A, o.B) === 1; }); },
        parts: [
          { id: 'e11a', level: 'EMG', make: function (r, s) {
            return y1Part('Solve ' + t(s.A + 'x+' + s.B + 'y=' + s.C) + ' for ' + t('y') + ' properly.', PL(0, [-s.A, s.B], s.C / s.B), [{ is: PL(0, -s.A, s.C), code: 'inv-no-div', hint: 'That is the student’s mistake: after moving ' + t(s.A + 'x') + ', divide both terms by ' + t(s.B) + '.' }],
              t(s.B + 'y=' + s.C + '-' + s.A + 'x\\Rightarrow y=\\frac{' + s.C + '-' + s.A + 'x}{' + s.B + '}=' + P.tex(PL(0, [-s.A, s.B], s.C / s.B))) + '. Type ' + code('(' + s.C + '−' + s.A + 'X)/' + s.B) + '. The student never divided by ' + t(s.B) + '.', Y1H, 'solve properly', { good: ['\\frac{' + s.C + '-' + s.A + 'x}{' + s.B + '}'] });
          } },
          { id: 'e11b', level: 'BEG', make: function (r, s) {
            var X = s.C / s.A;
            return numPart('Use ' + code('2:zero') + ' on both relations. What ' + t('x') + '-intercept do they share?', X, [[s.C / s.B, 'int-swap', 'That is the correct ' + t('y') + '-intercept. The ' + t('x') + '-intercept is where ' + t('y=0') + '.']],
              'Correct: ' + t('\\frac{' + s.C + '-' + s.A + 'x}{' + s.B + '}=0\\Rightarrow ' + s.C + '-' + s.A + 'x=0\\Rightarrow x=' + X) + '. Student: ' + t(s.C + '-' + s.A + 'x=0\\Rightarrow x=' + X) + '. Both give ' + t('x=' + X) + ': dividing by ' + t(s.B) + ' can’t move a point where ' + t('y=0') + ', so an ' + t('x') + '-intercept check passes even though the graph is wrong.', ['Set each relation equal to ' + t('0') + '.'], 'shared x-intercept');
          } },
          { id: 'e11c', level: 'BEG', make: function (r, s) {
            var yc = s.C / s.B, ys = s.C, y3 = (s.C - s.A * s.x3) / s.B, y3s = s.C - s.A * s.x3;
            return fieldsPart('Compare the two graphs: give each ' + t('y') + '-intercept and each output at ' + t('x=' + s.x3) + '.', [nbox('correct ' + t('y') + '-intercept'), nbox('student’s ' + t('y') + '-intercept'), nbox('correct ' + t('y') + ' at ' + t('x=' + s.x3)), nbox('student’s ' + t('y') + ' at ' + t('x=' + s.x3))],
              [K.number(yc, function (v) { return same(v, ys) ? { code: 'int-swap', hint: 'That is the student’s.' } : null; }), K.number(ys, null), K.number(y3, function (v) { return same(v, y3s) ? { code: 'int-swap', hint: 'That is the student’s output.' } : null; }), K.number(y3s, null)],
              [yc, ys, y3, y3s].map(String), 'correct ' + t(yc) + ' and ' + t(y3) + '; student ' + t(ys) + ' and ' + t(y3s),
              t('y') + '-intercepts: correct ' + t('\\frac{' + s.C + '}{' + s.B + '}=' + yc) + ', student ' + t(ys) + '. At ' + t('x=' + s.x3) + ': correct ' + t('\\frac{' + s.C + '-' + s.A * s.x3 + '}{' + s.B + '}=' + y3) + ', student ' + t(s.C + '-' + s.A * s.x3 + '=' + y3s) + '.<br>Check ' + t('(' + s.x3 + ',\\ ' + y3 + ')') + ' in the original: ' + t(s.A + '(' + s.x3 + ')+' + s.B + '(' + y3 + ')=' + s.C) + ' ✓, so it is on the true graph and the student’s ' + t('(' + s.x3 + ',\\ ' + y3s + ')') + ' is not.', ['Substitute ' + t('x=0') + ' and ' + t('x=' + s.x3) + ' into each relation.'], 'compare outputs');
          } },
          { id: 'e11d', level: 'EMG', make: function (r, s) {
            return mc(r, 'Which rule checks, before you press ' + code('GRAPH') + ', that ' + code('Y1') + ' really is the relation you were given?', [
              { html: 'Pick a point that satisfies the original equation but is <b>not</b> on the ' + t('x') + '-axis (such as ' + t('(0,\\ ' + s.C / s.B + ')') + '), and check that ' + code('1:value') + ' or the table gives the same ' + t('y') + '.', right: true },
              { html: 'Check that the ' + t('x') + '-intercept is right.', why: 'This mistake keeps the ' + t('x') + '-intercept the same, so that check passes even though the graph is wrong.' },
              { html: 'Check that the graph is a straight line.', why: 'The wrong entry is also a straight line.' },
              { html: 'Check that the expression has no brackets.', why: 'Brackets are often needed (e.g. ' + code('(' + s.C + '−' + s.A + 'X)/' + s.B) + ').' }],
              'A point off the ' + t('x') + '-axis reacts to a missing division, so comparing one such output with the original equation catches the error.', ['Which kind of point would reveal a missing division?'], 'checking rule');
          } }] },
      { num: '12', stem: function (s) { return 'A student graphs ' + t('y=' + s.rel) + ' in ZStandard and sees the screen below. The curve crosses the ' + t('x') + '-axis once and then falls off the bottom edge, so the student writes: <i>“the graph has no minimum — it just keeps going down.”</i>' + screenStd([{ f: s.f }]); },
        shared: function (r) {
          var o = pickWhere(function () { return { r1: r.int(6, 9), r2: r.int(11, 20) }; }, function (o) { var h = (o.r1 + o.r2) / 2, k = -Math.pow((o.r2 - o.r1) / 2, 2); return Number.isInteger(h) && h > 10 && k < -10 && k >= -40 && (10 - o.r1) * (10 - o.r2) < -10.5; }); // the curve really leaves through the bottom edge
          o.h = (o.r1 + o.r2) / 2; o.k = -Math.pow((o.r2 - o.r1) / 2, 2); o.b = -(o.r1 + o.r2); o.c = o.r1 * o.r2; o.rel = quadT(1, o.b, o.c); o.f = qf(1, o.b, o.c); return o;
        },
        parts: [
          { id: 'e12a', level: 'EMG', make: function (r, s) {
            return fieldsPart('Find both ' + t('x') + '-intercepts and the ' + t('y') + '-intercept algebraically.', [mbox(t('x') + '-intercepts', 'solutions'), mbox(t('y') + '-intercept', 'solutions')], [exactSet([s.r1, s.r2]), exactChk(s.c, { dl: [[-s.c, 'sign', 'Check the sign of the constant term.']] })], ['x=' + s.r1 + ',\\ x=' + s.r2, String(s.c)],
              t('x') + '-intercepts ' + t(s.r1 + ',\\ ' + s.r2) + '; ' + t('y') + '-intercept ' + t(s.c), t(s.rel + '=(x-' + s.r1 + ')(x-' + s.r2 + ')') + ': ' + t('x') + '-intercepts ' + t(s.r1) + ' and ' + t(s.r2) + '; ' + t('y') + '-intercept ' + t(s.c) + '.', ['Factor: two numbers that multiply to ' + t(s.c) + ' and add to ' + t(s.b) + '.'], 'intercepts ' + s.rel, { bad: [[String(s.r1), String(s.c)]] });
          } },
          { id: 'e12b', level: 'BEG', make: function (r, s) {
            return mc(r, 'Which of those three intercepts is on the ZStandard screen?', [
              { html: 'Only the ' + t('x') + '-intercept ' + t(s.r1), right: true },
              { html: 'Both ' + t('x') + '-intercepts', why: t(s.r2) + ' is past ' + t('X_{\\max}=10') + '.' },
              { html: 'The ' + t('y') + '-intercept ' + t(s.c), why: t(s.c) + ' is far above ' + t('Y_{\\max}=10') + '.' },
              { html: 'None of them', why: 'The curve visibly crosses the ' + t('x') + '-axis once — at which intercept?' }],
              'Only ' + t('x=' + s.r1) + ' is on the screen: ' + t(s.r2) + ' is past ' + t('X_{\\max}=10') + ' and ' + t(s.c) + ' is far above ' + t('Y_{\\max}=10') + '.', ['Compare each intercept with the window ' + t('[-10,\\ 10]') + '.'], 'which intercept visible');
          } },
          { id: 'e12c', level: 'EMG', make: function (r, s) { var p = vertexPart(1, s.b, s.c, r); p.prompt = 'Find the vertex algebraically. (Its ' + t('y') + '-coordinate is the minimum value.)'; return p; } },
          { id: 'e12d', level: 'BEG', make: function (r, s) {
            return fieldsPart('How far outside the ZStandard window is the vertex ' + t('(' + s.h + ',\\ ' + s.k + ')') + ' in each direction?', [nbox('units right of ' + WT.Xmax), nbox('units below ' + WT.Ymin)], [K.number(s.h - 10, null), K.number(-10 - s.k, function (v) { return same(v, -s.k) ? { code: 'win-edge', hint: 'Measure from ' + t('Y_{\\min}=-10') + ', not from ' + t('0') + '.' } : null; })],
              [String(s.h - 10), String(-10 - s.k)], t(s.h - 10) + ' units right, ' + t(-10 - s.k) + ' units below', t(s.h + '-10=' + (s.h - 10)) + ' units right of ' + t('X_{\\max}=10') + '; ' + t('-10-(' + s.k + ')=' + (-10 - s.k)) + ' units below ' + t('Y_{\\min}=-10') + '.', ['Measure from the edges of the window, ' + t('x=10') + ' and ' + t('y=-10') + '.'], 'distance outside');
          } },
          { id: 'e12e', level: 'EMG', make: function (r, s) {
            var feat = [featX(s.r1, s.rel, 'the smaller ' + t('x') + '-intercept'), featX(s.r2, s.rel, 'the larger ' + t('x') + '-intercept'), featV(s.h, s.k), featY(s.c)], w = niceWin(feat);
            return winPart('Record a window that shows both ' + t('x') + '-intercepts, the vertex and the ' + t('y') + '-intercept at once.', feat, { sol: 'The window must cover ' + t('0\\le x\\le ' + s.r2) + ' and ' + t(s.k + '\\le y\\le ' + s.c) + ', e.g. ' + winTex(w) + '. In it, ' + C.min + ' reports ' + t('X=' + s.h + ',\\ Y=' + s.k) + ' (perhaps with a tiny rounding error).', fns: [s.f], pts: [{ x: s.h, y: s.k, label: '(' + s.h + ', ' + s.k + ')' }, { x: 0, y: s.c, label: '(0, ' + s.c + ')' }, { x: s.r1, y: 0 }, { x: s.r2, y: 0 }], text: 'window all features' });
          } },
          { id: 'e12f', level: 'EMG', make: function (r, s) {
            return mc(r, 'The student’s sentence is wrong, but the screen really does show a curve that only falls. What is the general lesson?', [
              { html: 'A graphing window is evidence about only the part of the relation inside it, and about nothing else.', right: true },
              { html: 'ZStandard always shows the whole graph of a parabola.', why: 'This parabola’s vertex ' + t('(' + s.h + ',\\ ' + s.k + ')') + ' is outside ZStandard.' },
              { html: 'Parabolas that cross the ' + t('x') + '-axis once have no minimum.', why: 'This one crosses twice — the second crossing is just off the screen — and its minimum is ' + t(s.k) + '.' },
              { html: 'The calculator draws curves inaccurately near the edge of the screen.', why: 'The drawing is accurate; it just stops at the edge of the window.' }],
              'The curve falls on the screen but turns at ' + t('x=' + s.h) + ', just past the edge. A window only tells you about what is inside it.', ['What does the screen tell you about the graph outside the window?'], 'window is evidence');
          } }] },
      { num: '13', stem: function (s) { return 'A third student enters ' + t('y=' + s.rel) + ', runs ' + code('2:zero') + ', and the calculator returns an error instead of a value. The student then tries ' + code('4:maximum') + ' and gets nothing useful either.'; },
        shared: function (r) { var o = { a: r.int(1, 3), h: r.int(1, 4), k: r.int(1, 6) }; o.b = -2 * o.a * o.h; o.c = o.a * o.h * o.h + o.k; o.rel = quadT(o.a, o.b, o.c); return o; },
        parts: [
          { id: 'e13a', level: 'EMG', make: function (r, s) {
            var D = s.b * s.b - 4 * s.a * s.c;
            return mc(r, 'Why can’t ' + code('2:zero') + ' succeed, whatever bounds are entered?', [
              { html: t('b^{2}-4ac=' + D + '<0') + ': there are no real roots. The parabola opens up, so the whole graph lies above the ' + t('x') + '-axis and there is no sign change to find.', right: true },
              { html: 'The bounds were entered in the wrong order.', why: 'Wrong bounds can fail once, but here no bounds can work. Check the discriminant: ' + t(D) + '.' },
              { html: 'The graph crosses the ' + t('x') + '-axis outside the window.', why: 'Compute the discriminant: ' + t(D) + '. Does the graph cross the axis anywhere?' },
              { html: code('2:zero') + ' only works for straight lines.', why: code('2:zero') + ' works for any relation that crosses the ' + t('x') + '-axis.' }],
              t('b^{2}-4ac=' + sgp(s.b) + '^{2}-4(' + s.a + ')(' + s.c + ')=' + s.b * s.b + '-' + 4 * s.a * s.c + '=' + D + '<0') + ', so there are no real roots, and with ' + t('a>0') + ' the graph lies entirely above the ' + t('x') + '-axis. ' + code('2:zero') + ' needs a sign change between the bounds, so no bounds can work.', ['Compute ' + t('b^{2}-4ac') + '.'], 'why zero fails');
          } },
          { id: 'e13b', level: 'BEG', make: function (r, s) {
            return mc(r, 'Why was ' + code('4:maximum') + ' the wrong choice?', [
              { html: t('a=' + s.a + '>0') + ', so the parabola opens <b>up</b>: it has a minimum and no maximum — use ' + code('3:minimum') + '.', right: true },
              { html: code('4:maximum') + ' only works in ZStandard.', why: 'It works in any window. Which way does this parabola open?' },
              { html: 'It wasn’t — the student just picked bad bounds.', why: 'An upward parabola has no highest point, so no bounds will give a turning point.' },
              { html: 'Because the relation has no ' + t('x') + '-intercepts.', why: 'Having no ' + t('x') + '-intercepts doesn’t stop a parabola from having a turning point. Look at the sign of ' + t('a') + '.' }],
              'The ' + t('x^{2}') + ' coefficient is positive, so the parabola opens up: its turning point is a <b>minimum</b>. ' + code('3:minimum') + ' is the right feature.', ['Which way does the parabola open?'], 'wrong tool');
          } },
          { id: 'e13c', level: 'EMG', make: function (r, s) { var p = vertexPart(s.a, s.b, s.c, r); p.prompt = 'Run the right feature and give the turning point exactly.'; return p; } },
          { id: 'e13d', level: 'BEG', make: function (r) {
            return mc(r, 'One student blamed the calculator for a blank ZStandard screen, another trusted a screen that hid a parabola’s vertex (“it just keeps going down”), and this one chose the wrong tool. Which advice would have saved all three?', [
              { html: 'Work out what the graph should look like first — its shape, intercepts and vertex — then use the calculator to confirm it; if the screen disagrees, suspect the window or the feature before the mathematics.', right: true },
              { html: 'Always use ZStandard.', why: 'ZStandard caused two of the three problems.' },
              { html: 'Trust the calculator: it is never wrong.', why: 'The calculator was right each time — the window or the chosen feature was the problem, and the students didn’t check.' },
              { html: 'Avoid the CALC menu and use the table only.', why: 'The CALC features are fine when you know what to expect.' }],
              'Each mistake came from not predicting the graph first. Knowing the shape, intercepts and vertex tells you which window and which feature to use, and lets you spot a screen that doesn’t make sense.', ['What did all three students skip?'], 'advice');
          } }] },

      /* ---------- Part E ---------- */
      { num: '14', section: 'Extra practice E — Stretch: two graphs that look identical', stem: function (s) { return 'Enter ' + t('Y_1=' + s.y1) + ' and ' + t('Y_2=' + s.y2) + ' and press ' + code('ZOOM') + ' ' + code('6') + '. Only one curve appears to be drawn — the second is hidden underneath it.' + screenStd([{ f: s.f1 }, { f: s.f2, dash: true, color: '#c4532a' }]); },
        shared: function (r) { var k = r.pick([0.005, 0.005, 0.004, 0.002]), c = r.int(1, 5); return { k: k, c: c, y1: quadT(k, 1, c), y2: linT(1, c), f1: qf(k, 1, c), f2: lf(1, c) }; },
        parts: [
          { id: 'e14a', level: 'BEG', make: function (r, s) {
            var xs = [-10, -5, 0, 5, 10], ys = xs.map(function (x) { return cl(s.f1(x)); });
            return fieldsPart('Complete the table of ' + t('Y_1') + ' values.' + HW.valueTable([[t('x')].concat(xs), [t('Y_1')].concat(xs.map(function () { return '?'; }))]), xs.map(function (x) { return nbox(t('x=' + x) + ':&nbsp;' + t('Y_1=')); }),
              xs.map(function (x, i) { return K.number(ys[i], function (v) { return same(v, x + s.c) && x !== 0 ? { code: 'calc-no-b', hint: 'That is ' + t('Y_2') + '. Add ' + t(nT(s.k) + 'x^{2}') + ' too.' } : null; }); }), ys.map(String), HW.valueTable([[t('x')].concat(xs), [t('Y_1')].concat(ys), [t('Y_2')].concat(xs.map(s.f2))]),
              'Use the table (' + code('TblStart = −10') + ', ' + code('ΔTbl = 5') + '). E.g. ' + t('Y_1(10)=' + nT(s.k) + '(100)+10+' + s.c + '=' + nT(ys[4])) + '.' + HW.valueTable([[t('x')].concat(xs), [t('Y_1')].concat(ys), [t('Y_2')].concat(xs.map(s.f2)), [t('Y_1-Y_2')].concat(xs.map(function (x) { return cl(s.k * x * x); }))]),
              ['Square, multiply by ' + t(nT(s.k)) + ', then add ' + t('x+' + s.c) + '.'], 'table Y1');
          } },
          { id: 'e14b', level: 'EMG', make: function (r, s) {
            var g = cl(100 * s.k);
            return numPart('What is the largest gap ' + t('Y_1-Y_2') + ' anywhere in this window?', g, [[cl(25 * s.k), 'gap-mid', 'That is the gap at ' + t('x=\\pm 5') + '. ' + t('Y_1-Y_2=' + nT(s.k) + 'x^{2}') + ' is largest at the edges of the window.'], [0, 'gap-mid', 'The gap is ' + t('0') + ' only at ' + t('x=0') + '.']],
              t('Y_1-Y_2=' + nT(s.k) + 'x^{2}') + ', which is largest at the edges, ' + t('x=\\pm 10') + ': ' + t(nT(s.k) + '(100)=' + nT(g)) + '.', ['Subtract the relations: what is ' + t('Y_1-Y_2') + '? Where in ' + t('-10\\le x\\le 10') + ' is it biggest?'], 'largest gap');
          } },
          { id: 'e14c', level: 'BEG', make: function (r, s) {
            var g = cl(100 * s.k), px = g / 0.3;
            var p = B.approx('In ZStandard one row of screen pixels is worth about ' + t('0.3') + ' of a ' + t('y') + '-unit. About how many pixels apart do the two curves ever get? (Round to the nearest whole number.)', px, 0, {}, t(nT(g) + '\\div 0.3\\approx ' + nT(rnd(px, 1))) + ', so the curves are never more than about ' + t(rnd(px, 0)) + ' pixel' + (rnd(px, 0) === 1 ? '' : 's') + ' apart — they share most of the same pixels and read as one graph.', ['Divide the largest gap by ' + t('0.3') + '.'], 'pixels apart');
            return p;
          } },
          { id: 'e14d', level: 'BEG', make: function (r, s) {
            var g1 = cl(s.k * 40000), g2 = cl(s.k * 10000);
            return fieldsPart('Evaluate both relations at ' + t('x=-200') + ' and at ' + t('x=100') + '. State the gap ' + t('Y_1-Y_2') + ' at each.', [nbox('gap at ' + t('x=-200')), nbox('gap at ' + t('x=100'))], [K.number(g1, null), K.number(g2, null)], [String(g1), String(g2)], t(nT(g1)) + ' and ' + t(nT(g2)),
              t('Y_1(-200)=' + nT(s.k) + '(40\\,000)-200+' + s.c + '=' + nT(s.f1(-200))) + ', ' + t('Y_2(-200)=' + nT(s.f2(-200))) + ': gap ' + t(nT(g1)) + '.<br>' + t('Y_1(100)=' + nT(s.k) + '(10\\,000)+100+' + s.c + '=' + nT(s.f1(100))) + ', ' + t('Y_2(100)=' + nT(s.f2(100))) + ': gap ' + t(nT(g2)) + '.', ['The gap is ' + t(nT(s.k) + 'x^{2}') + '.'], 'gaps far away', { bad: [[String(g2), String(g1)]] });
          } }] },
      { num: '15', stem: function (s) { return 'Take another pair like the one in Question 14: ' + t('Y_1=' + s.y1) + ' and ' + t('Y_2=' + s.y2) + '. In ZStandard they also look like one graph.'; },
        shared: function (r) { var k = r.pick([0.005, 0.005, 0.004, 0.002]), c = r.int(1, 5); return { k: k, c: c, y1: quadT(k, 1, c), y2: linT(1, c), f1: qf(k, 1, c), f2: lf(1, c) }; },
        parts: [
          { id: 'e15a', level: 'EMG', make: function (r, s) {
            var X = cl(1 / s.k), W = function (a, b, c, d) { return t('x:[' + nT(a) + ',\\ ' + nT(b) + '],\\ y:[' + nT(c) + ',\\ ' + nT(d) + ']'); };
            var good = W(-1.1 * X, 0.6 * X, -1.1 * X, 1.1 * X);
            return mc(r, 'In which window are the two graphs <b>obviously</b> different?', [
              { html: good, right: true },
              { html: W(-10, 10, -10, 10) + ' (ZStandard)', why: 'In ZStandard the gap is at most ' + t(nT(100 * s.k)) + ' — a pixel or two.' },
              { html: W(-20, 20, -20, 20), why: 'The gap is at most ' + t(nT(400 * s.k)) + ' here, still small next to a screen 40 units tall.' },
              { html: 'ZoomFit with ' + t('x:[-10,\\ 10]'), why: 'ZoomFit keeps ' + t('-10\\le x\\le 10') + ', where the curves almost coincide.' }],
              'The ' + t(nT(s.k) + 'x^{2}') + ' term only matters when ' + t('x') + ' is large (around ' + t(nT(X)) + '), so the window must be wide: in ' + good + ' the parabola ' + t('Y_1') + ' clearly turns at ' + t('x=' + nT(-X / 2)) + ' while ' + t('Y_2') + ' stays straight.', ['Where is the gap ' + t(nT(s.k) + 'x^{2}') + ' big?'], 'window shows difference');
          } },
          { id: 'e15b', level: 'EMG', make: function (r, s) {
            var p = K.P.pairs('Solve ' + t('Y_1=Y_2') + ' algebraically. State every intersection point.', [[0, s.c]], {}, t(s.y1 + '=' + s.y2 + '\\Rightarrow ' + nT(s.k) + 'x^{2}=0\\Rightarrow x=0') + ', so the only intersection is ' + t('(0,\\ ' + s.c + ')') + '. Every Guess? converges there because there is no other intersection to find.', ['Subtract ' + t(s.y2) + ' from both sides.'], 'only intersection');
            p.bad = ['(' + s.c + ', 0)', '(0, 0)']; return p;
          } },
          { id: 'e15c', level: 'EMG', make: function (r, s) {
            var D = 1 - 4 * s.k * s.c, r1 = (-1 + Math.sqrt(D)) / (2 * s.k), r2 = (-1 - Math.sqrt(D)) / (2 * s.k);
            return mathPart('Find the ' + t('x') + '-intercepts of ' + t('Y_1') + ' to the nearest hundredth.', approxSet([r1, r2], 2, { missHint: t('Y_1') + ' is a parabola — it crosses the ' + t('x') + '-axis twice, once far to the left. Widen the window and run ' + code('2:zero') + ' again.', diag: function (A) { return sameVals(A, [-s.c]) ? { code: 'zero-other', hint: 'That is ' + t('Y_2') + '’s intercept. ' + t('Y_1') + '’s is close to it, but not equal.' } : null; } }),
              'x=' + nT(rnd(r1, 2)) + ',\\ x=' + nT(rnd(r2, 2)),
              C.zero + ' (in a wide window) gives ' + t('x\\approx ' + nT(rnd(r1, 2))) + ' and ' + t('x\\approx ' + nT(rnd(r2, 2))) + '. Algebra: ' + t('x=\\frac{-1\\pm\\sqrt{1-4(' + nT(s.k) + ')(' + s.c + ')}}{2(' + nT(s.k) + ')}') + '. ' + t('Y_2') + '’s intercept is exactly ' + t(-s.c) + ', so near the origin the two crossings differ by only ' + t(nT(rnd(Math.abs(r1 + s.c), 2))) + '.', ['Use ' + code('2:zero') + ' twice, or the quadratic formula.'], 'Y1 zeros', 'solutions', { bad: [String(-s.c), nT(rnd(r1, 2))] });
          } },
          { id: 'e15d', level: 'EMG', make: function (r, s) { var p = vertexPart(s.k, 1, s.c, r); p.prompt = t('Y_1') + ' has a minimum point and ' + t('Y_2') + ' does not. Find the minimum point of ' + t('Y_1') + ' exactly.'; return p; } },
          { id: 'e15e', level: 'EMG', make: function (r, s) {
            return mc(r, 'Two relations agree on every pixel of one screen. What would make them the <b>same</b> relation?', [
              { html: 'The two expressions must be equal for <b>every</b> input — checked algebraically. A matching table only proves agreement at the listed inputs.', right: true },
              { html: 'They look identical in ZStandard.', why: 'These two look identical in ZStandard but differ by ' + t(nT(40000 * s.k)) + ' at ' + t('x=-200') + '.' },
              { html: 'Their tables match at ' + t('x=-10,-5,0,5,10') + '.', why: 'The tables don’t even match exactly at ' + t('x=10') + ' — and a table can never prove agreement everywhere.' },
              { html: 'They have the same ' + t('y') + '-intercept.', why: 'Many different relations share a ' + t('y') + '-intercept.' }],
              t('Y_1-Y_2=' + nT(s.k) + 'x^{2}') + ', which is ' + t('0') + ' only at ' + t('x=0') + ', so these are different relations. Same relation means equal for every input; a screen or a table checks only some inputs.', ['What is ' + t('Y_1-Y_2') + '?'], 'same relation');
          } }] },

      /* ---------- Part F ---------- */
      { num: '16', section: 'Extra practice F — Three for the test', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: 'e16', level: 'EMG', make: function (r) {
          var o = pickWhere(function () { return { A: r.int(2, 9), B: r.int(2, 5), C: r.int(2, 9) * 6 }; }, function (o) { return o.A % o.B !== 0 && o.C % o.B === 0; });
          return mc(r, 'To graph ' + t(o.A + 'x-' + o.B + 'y=' + o.C) + ' on a calculator, the expression that must be entered into ' + code('Y1') + ' is', [
            { html: code(o.A + 'X−' + o.C + '/' + o.B), why: 'Without brackets only the ' + t(o.C) + ' is divided by ' + t(o.B) + '.' },
            { html: code('(' + o.A + 'X−' + o.C + ')/' + o.B), right: true },
            { html: code('(' + o.C + '−' + o.A + 'X)/' + o.B), why: 'This divides by ' + t(o.B) + ' instead of ' + t('-' + o.B) + ', which reverses every sign.' },
            { html: code(o.A + 'X/' + o.B + '−' + o.C), why: 'This divides only the ' + t(o.A + 'x') + '; the ' + t(o.C) + ' must be divided too.' }],
            t(o.A + 'x-' + o.B + 'y=' + o.C + '\\Rightarrow -' + o.B + 'y=' + o.C + '-' + o.A + 'x\\Rightarrow y=\\frac{' + o.C + '-' + o.A + 'x}{-' + o.B + '}=\\frac{' + o.A + 'x-' + o.C + '}{' + o.B + '}') + '.', ['Solve for ' + t('y') + ' first — careful dividing by a negative.'], 'Y1 for ' + o.A + 'x-' + o.B + 'y=' + o.C);
        } }] },
      { num: '17', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: 'e17', level: 'EMG', make: function (r) {
          var o = pickWhere(function () { var g = r.pick([2, 4]); return { r1: r.int(7, 10), g: g }; }, function (o) { return o.r1 + o.g > 10 && o.r1 + o.g < 15; });
          var r1 = o.r1, r2 = o.r1 + o.g, h = (r1 + r2) / 2, k = -(o.g / 2) * (o.g / 2), rel = quadT(1, -(r1 + r2), r1 * r2), W = function (a, b, s1, c, d, s2) { return t('x:[' + a + ',\\ ' + b + ',\\ ' + s1 + '],\\ y:[' + c + ',\\ ' + d + ',\\ ' + s2 + ']'); };
          return mc(r, 'The relation ' + t('y=' + rel) + ' is entered into ' + code('Y1') + '. The only window below that shows <b>both</b> ' + t('x') + '-intercepts and the vertex is', [
            { html: W(-10, 10, 1, -10, 10, 1), why: t('X_{\\max}=10') + ' cuts off the ' + t('x') + '-intercept ' + t(r2) + '.' },
            { html: W(0, 15, 5, -5, 5, 1), right: true },
            { html: W(-5, 5, 1, -10, 100, 10), why: t('X_{\\max}=5') + ' cuts off both intercepts and the vertex.' },
            { html: W(5, 15, 1, 0, 10, 1), why: t('Y_{\\min}=0') + ' is above the vertex value ' + t(k) + '.' }],
            t(rel + '=(x-' + r1 + ')(x-' + r2 + ')') + ': ' + t('x') + '-intercepts ' + t(r1) + ' and ' + t(r2) + '. Vertex: ' + t('x=' + h) + ', ' + t('y=' + k) + '. Only ' + W(0, 15, 5, -5, 5, 1) + ' contains ' + t('x=' + r1 + ',\\ ' + h + ',\\ ' + r2) + ' and ' + t('y=' + k) + '.', ['Find the intercepts and the vertex first, then test each window.'], 'window MC parabola');
        } }] },
      { num: '18', stem: '<i>(Numerical Response)</i>', parts: [
        { id: 'e18', level: 'EMG', make: function (r) {
          var o = pickWhere(function () { var a = r.pick([-0.2, -0.2, -0.25, -0.5]); return { a: a, h: r.int(4, 30), k: r.int(20, 120) }; }, function (o) { var b = -2 * o.a * o.h, c = o.a * o.h * o.h + o.k; return same(b, Math.round(b)) && same(c, Math.round(c)) && c < 0 && c >= -40 && o.h + o.k <= 999; });
          var b = cl(-2 * o.a * o.h), c = cl(o.a * o.h * o.h + o.k), rel = quadT(o.a, b, c), s = o.h + o.k;
          var p = B.nr('The relation ' + t('y=' + rel) + ' is graphed and ' + code('4:maximum') + ' is used. If the maximum point is ' + t('(p,\\ q)') + ', the value of ' + t('p+q') + ' is ________.', s, function (v) {
            if (same(v, o.k)) return { code: 'nr-gave-x', hint: 'That is ' + t('q') + ' alone. Add ' + t('p') + ', the ' + t('x') + '-coordinate.' };
            if (same(v, o.h)) return { code: 'nr-gave-x', hint: 'That is ' + t('p') + ' alone. Add ' + t('q') + ', the maximum value.' };
            if (same(v, o.k - o.h)) return { code: 'nr-sign', hint: 'Check the sign of ' + t('p') + ': the maximum is to the right of the ' + t('y') + '-axis.' };
            return null;
          }, t('p=-\\frac{b}{2a}=-\\frac{' + nT(b) + '}{2(' + nT(o.a) + ')}=' + o.h) + ', ' + t('q=' + nT(o.a) + '(' + o.h + ')^{2}+' + nT(b) + '(' + o.h + ')' + term(c, '', false) + '=' + o.k) + '. ' + t('p+q=' + o.h + '+' + o.k + '=' + s) + '.' + (s < 100 ? ' Record ' + t((s < 10 ? '00' : '0') + s) + '.' : ''), ['Find the maximum point (calculator or ' + t('x=-\\frac{b}{2a}') + '), then add its coordinates.'], 'p+q for max of ' + rel);
          p.bad = [String(o.k), String(o.h)]; return p;
        } }] }
    ];
  }
  /* e8: a list of exact x-intercepts */
  function zeroPart(prompt, vals, alg, dl) {
    var T = vals.map(function (v) { return v[0] / v[1]; }), keyTex = vals.map(function (v) { return 'x=' + rT(v[0], v[1]); }).join(',\\ ');
    var chk = exactSet(vals, { diag: function (A) { if (dl && sameVals(A, dl[0].map(function (v) { return v[0] / v[1]; }))) return { code: dl[1], hint: dl[2] }; return null; } });
    var bad = [T.map(function (v) { return termDec(v) ? String(-v) : nT(rnd(v, 2)); }).join(', ')];
    if (T.length > 1 && !same(T[0], -T[1])) bad.push(rT(vals[0][0], vals[0][1]));
    return mathPart(prompt, chk, keyTex, C.zero + (T.length > 1 ? ' (once near each crossing)' : '') + ' shows ' + T.map(function (v) { return t('X=' + nT(rnd(v, 7))); }).join(' and ') + '; ' + C.frac + ' gives ' + t(vals.map(function (v) { return rT(v[0], v[1]); }).join(',\\ ')) + '.<br>Check algebraically: ' + alg + '.',
      ['An ' + t('x') + '-intercept is where ' + t('y=0') + '. Solve, or convert the calculator’s decimal with ▸Frac.'], 'exact zeros', 'solutions', { bad: bad.filter(function (b) { return chk(b).v !== 'correct'; }) });
  }
})(window);
