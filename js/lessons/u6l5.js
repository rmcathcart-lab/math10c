/* Math 10C · Unit 6 · Lesson 5 — Characteristics of Linear Graphs (RF5; RF4 for "is it linear?")
 * Assignment questions 1–14 (u6_L05.tex). This lesson has no Extra Practice sheet: the extras (11 questions) are new,
 * in the style of the assignment, with fresh contexts (Jordan's uneven table, a candle / battery / tank draining,
 * sign conditions on intercepts, number of intercepts, slope from intercepts, segments with an open end).
 * Every part is a generator that keeps the booklet question's structure (equal / unequal x-steps, a fractional slope,
 * an intercept that is not in the table, an origin line, a vertical line, a decreasing segment, a context that runs
 * past the table) and changes the numbers; the booklet's numbers are among the possible values.
 * "Is it linear?" parts take the slope or the key "none" (not linear). Sketches (Q6, Extra 7a) use the graph pad
 * (js/draw.js) with a full line (arrows) checked by its intercepts and slope. Matching (Q8) is a grid; "show / explain"
 * items in context are multiple choice with misconception hints. Levels follow LEVEL_RUBRIC.md and the RF4 / RF5
 * anchors of the Unit 7 test (read slope and intercepts off a graph BEG; domain/range of a segment, rates with
 * unequal steps PRG; intercepts and domain/range in context, sign conditions MAS). */
(function (root) {
  'use strict';
  var HW = root.HW, ex = HW.ex, K = HW.kit, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form, B = K.P, D = HW.draw, LN = HW.lines;

  HW.addCodes({
    'ic-und': 'Wrote “undefined” for an intercept', 'ic-said-none': 'Said “none” (there is an intercept)', 'ic-not-none': 'Gave an intercept that does not exist', 'ic-pt': 'Intercept point not on the axis',
    'int-swap': 'x- and y-intercepts swapped', 'slope-none': 'Wrote “none” for a slope', 'slope-none0': 'Said a horizontal line has no slope', 'slope-und0': 'Called slope 0 undefined',
    'lin-said-not': 'Called a linear table not linear', 'nonlin-slope': 'Gave a slope for a non-linear table', 'nonlin-und': 'Called a non-linear table vertical', 'dy-only': 'Used the change in y only (ignored the x-step)',
    'tb-sign': 'Table completed in the wrong direction', 'tb-gap': 'Did not split a gap of several steps', 'tb-step': 'Treated a step of 2 in x as a step of 1',
    'sk-noline': 'Sketch: no line drawn', 'sk-lines': 'Sketch: more than one line / bent line', 'sk-points': 'Sketch: stray points', 'sk-segment': 'Sketch: segment instead of a line (no arrows)',
    'sk-axis': 'Sketch: line along an axis', 'sk-origin': 'Sketch: through the origin (one intercept)', 'sk-one': 'Sketch: horizontal/vertical line (one intercept)', 'sk-sign': 'Sketch: intercept with the wrong sign',
    'sk-wrongaxis': 'Sketch: intercept on the wrong axis', 'sk-two': 'Sketch: two intercepts (one wanted)', 'sk-flat': 'Sketch: horizontal/vertical line (slanted wanted)', 'sk-slope-sign': 'Sketch: slope with the wrong sign',
    'sk-vh': 'Sketch: horizontal and vertical mixed up', 'sk-k': 'Sketch: wrong intercept value', 'sk-slant': 'Sketch: slanted line (horizontal/vertical wanted)',
    'ctx-table-end': 'Stopped at the end of the table', 'ctx-steps': 'Counted table steps instead of minutes', 'ctx-rate-step': 'Gave the change per table step, not per unit', 'ctx-dom-table': 'Domain/range cut off at the table',
    'stepback': 'Stepped back a whole column instead of to x = 0', 'nr-first-y': 'Gave the first y-value', 'nr-forgot-start': 'Forgot the hours already run', 'nr-start-sign': 'Subtracted instead of added to find the start',
    'set-segment': 'Gave a segment’s domain for a whole line', 'row-zero': 'Said a line has no intercepts', 'set-point': 'Gave a single value instead of all real numbers', 'set-xy': 'Used x-values for the range (or y for the domain)'
  });

  /* ---------------- numbers and LaTeX ---------------- */
  function cl(x) { return Math.round(x * 1e6) / 1e6; }
  function near(a, b) { return Math.abs(a - b) < 1e-7; }
  function gcd(a, b) { return ex.gcd(Math.abs(a), Math.abs(b)); }
  function rv(s) { return Array.isArray(s) ? s[0] / s[1] : s; }
  function nT(x) {
    if (Array.isArray(x)) return ex.texRat(ex.norm(x[0], x[1]));
    x = cl(x); if (Number.isInteger(x)) return String(x);
    var f = LN.toFr(x); return f[1] <= 12 ? ex.texRat(ex.norm(f[0], f[1])) : String(x);
  }
  function dT(x) { return String(cl(x)); }
  function ptT(p) { return '(' + nT(p[0]) + ',\\ ' + nT(p[1]) + ')'; }
  function sgT(x) { return (x > 0 ? '+' : '') + nT(x); }
  function qT(a, b) { return '\\dfrac{' + nT(a) + '}{' + nT(b) + '}'; }
  function rng(a, b) { var o = []; for (var i = a; i <= b; i++) o.push(i); return o; }
  function nz(a, b) { return rng(a, b).filter(function (x) { return x !== 0; }); }
  function diffs(a) { var o = []; for (var i = 1; i < a.length; i++) o.push(cl(a[i] - a[i - 1])); return o; }
  function allSame(a) { return a.every(function (v) { return near(v, a[0]); }); }
  function signW(x) { return x > 0 ? 'positive' : 'negative'; }
  function distinct(opts) { var seen = {}; opts.forEach(function (o) { if (seen[o.html]) throw new Error('duplicate MC option ' + o.html); seen[o.html] = 1; }); return opts; }
  function mc(r, prompt, opts, sol, hints, text, keepOrder) { return B.mc(r, prompt, distinct(opts), sol, hints, text, keepOrder); }

  /* ---------------- tables and graphs ---------------- */
  function cell(v) { return v == null ? '?' : typeof v === 'string' ? v : t(nT(v)); }
  function tbl(xs, ys, xn, yn) { return HW.valueTable([[xn || t('x')].concat(xs.map(cell)), [yn || t('y')].concat(ys.map(cell))]); }
  function G(spec) { return HW.graph(Object.assign({ x: [-6, 6], y: [-6, 6], labels: 2, max: 280 }, spec)); }
  function fig(s) { return '<div class="fig">' + s + '</div>'; }
  function figs(list, w) { w = w || 140; return '<div style="display:flex;flex-wrap:wrap;gap:6px 12px;align-items:flex-start">' + list.map(function (f) { return '<div style="flex:1 1 ' + w + 'px;max-width:260px">' + f + '</div>'; }).join('') + '</div>'; }
  /* the whole line through p and q, clipped just inside the window, with arrows */
  function fullLine(p, q, w) {
    w = w || 6; var xr = [-w + 0.35, w - 0.35], yr = [-w + 0.35, w - 0.35];
    return { pts: [D.toEdge(p, q, xr, yr), D.toEdge(q, p, xr, yr)], start: 'arrow', end: 'arrow' };
  }
  /* line descriptions: { kind: 's', a, b } (x-int a, y-int b) | { kind: 'o', m: [p, q] } | { kind: 'v', k } | { kind: 'h', k } */
  function lineSeg(L, w) {
    if (L.kind === 's') return fullLine([L.a, 0], [0, L.b], w);
    if (L.kind === 'o') return fullLine([0, 0], [L.m[1], L.m[0]], w);
    if (L.kind === 'v') return fullLine([L.k, 0], [L.k, 1], w);
    return fullLine([0, L.k], [1, L.k], w);
  }

  /* ---------------- reading a typed answer (number, fraction, point, none, undefined) ---------------- */
  function readAns(resp) {
    var s = String(resp == null ? '' : resp).replace(/\\left|\\right/g, '').trim();
    if (!s) return { empty: true };
    var low = s.replace(/\\text\{([^}]*)\}|\\mathrm\{([^}]*)\}/g, function (m, a, b) { return a || b; }).replace(/\s+/g, ' ').trim().toLowerCase();
    if (/^(none|no|no intercepts?|no [xy]-?intercepts?|there is none|\\emptyset|\\varnothing|∅)$/.test(low)) return { none: true };
    if (/^(undefined|undef|no slope|infinite|infinity|\\infty|∞)$/.test(low)) return { und: true };
    var m = /^\(\s*([^,()]+?)\s*,\s*([^,()]+?)\s*\)$/.exec(s);
    if (m) { var a = ex.parse(m[1]), b = ex.parse(m[2]); if (a.ok && b.ok && isFinite(ex.value(a.ast)) && isFinite(ex.value(b.ast))) return { pt: [ex.value(a.ast), ex.value(b.ast)] }; return { bad: true }; }
    var r = K.read(s); if (r.res) return { res: r.res };
    if (!isFinite(r.val)) return { bad: true };
    var pf = ex.plainFraction(r.ast), sh = ex.shape(r.ast);
    return { v: r.val, simple: !!(sh.bare || pf), lowest: !pf || pf[1] === 1 || gcd(pf[0], pf[1]) === 1, dec: sh.decimals > 0 };
  }
  /* an intercept (or any value) box. want = number or null ("none").
   * o: { v: axis letter, w: the other letter, other: the other intercept (swap), saidNone, notNone, diag(v) -> {code, hint}, point: true to accept (a, 0) form } */
  function valChk(want, o) {
    o = o || {};
    var v0 = o.v || 'x', w0 = o.w || (v0 === 'x' ? 'y' : 'x'), isX = o.axisX != null ? o.axisX : v0 === 'x';
    return function (resp) {
      var a = readAns(resp);
      if (a.empty) return form('empty', 'Fill in this box' + (o.none ? ' (or press <b>none</b>)' : '') + '.');
      if (a.res) return a.res;
      if (a.bad) return form('unreadable', 'Write a single number' + (o.none ? ', or <b>none</b>' : '') + '.');
      if (a.und) return wrong('ic-und', '“Undefined” describes a slope, not an intercept. An intercept is the number where the line crosses the axis' + (o.none ? ' — or <b>none</b> if it never crosses it.' : '.'));
      if (a.none) return want == null ? ok() : wrong('ic-said-none', o.saidNone || 'This line does cross the ' + t(v0) + '-axis — find where.');
      var v;
      if (a.pt) {
        var onAxis = isX ? near(a.pt[1], 0) : near(a.pt[0], 0);
        if (!onAxis) {
          var sw = isX ? near(a.pt[0], 0) : near(a.pt[1], 0);
          return wrong('ic-pt', sw ? 'Check the order of the coordinates: a point on the ' + t(v0) + '-axis has ' + t(w0 + '=0') + ', so it looks like ' + t(isX ? '(a,\\ 0)' : '(0,\\ b)') + '.' : 'That point isn’t on the ' + t(v0) + '-axis. An ' + v0 + '-intercept is where ' + t(w0 + '=0') + '.');
        }
        v = isX ? a.pt[0] : a.pt[1];
      } else v = a.v;
      if (want == null) return wrong('ic-not-none', o.notNone || 'Check again: does the line ever meet the ' + t(v0) + '-axis? If it never does, press <b>none</b>.');
      if (near(v, want)) {
        if (!a.pt && !a.lowest) return form('lowest', 'Right — now reduce the fraction to lowest terms.');
        if (!a.pt && !a.simple) return form('simplify', 'Right value — now simplify it to a single number.');
        return ok();
      }
      if (a.dec && Math.abs(v - want) < 0.01) return form('decimal', 'Very close — give the <b>exact</b> value (a fraction, not a rounded decimal).');
      if (o.other != null && near(v, o.other)) return wrong('int-swap', 'That’s the ' + w0 + '-intercept. The ' + t(v0) + '-intercept is where the graph crosses the ' + t(v0) + '-axis, where ' + t(w0 + '=0') + '.');
      var h = o.diag ? o.diag(v) : null; if (h) return wrong(h.code, h.hint);
      if (want !== 0 && near(v, -want)) return wrong('sign', 'Check the sign of your answer.');
      return wrong('value', null);
    };
  }
  /* a slope box that also understands "none" */
  function slopeChk(sl, o) {
    o = o || {};
    var base = K.slope(sl, { diag: o.diag }), zero = sl != null && rv(sl) === 0;
    return function (resp) {
      var a = readAns(resp);
      if (a.empty) return form('empty', 'Fill in the slope.');
      if (a.none) {
        if (sl == null) return form('slope-none', 'For a vertical line we say the slope is <b>undefined</b> (the run is ' + t('0') + ') — use the <b>undefined</b> key.');
        if (zero) return wrong('slope-none0', 'A horizontal line does have a slope: the rise is ' + t('0') + ', so the slope is ' + t('0') + '.');
        return wrong('slope-none', 'Every slanted line has a slope: rise ÷ run.');
      }
      if (a.pt) return form('unreadable', 'Give the slope as a number or a fraction.');
      if (a.und && zero) return wrong('slope-und0', '“Undefined” is the slope of a <b>vertical</b> line. This one is horizontal: the rise is ' + t('0') + ', so the slope is ' + t('0') + '.');
      return base(resp);
    };
  }
  function slopeKey(sl) { return sl == null ? '\\text{undefined}' : nT(sl); }
  function fMath(label, ph, keys, none) { return { label: label, name: label.replace(/\\\(|\\\)/g, '').replace(/:\s*$/, ''), mode: 'math', keys: keys || 'slope', none: none !== false, placeholder: ph || 'e.g. -2, 1/2 or none' }; }
  function fNum(label, before, after) { return { label: label, name: label.replace(/\\\(|\\\)/g, '').replace(/:\s*$/, ''), before: before, after: after }; }
  function fSet(label, v) { return { label: label, name: label, mode: 'math', keys: 'set', vars: [v], placeholder: 'e.g. {' + v + ' | -2 <= ' + v + ' <= 5, ' + v + ' in R}' }; }

  /* ================= Q1: is it linear? ================= */
  function linPart(tab) {
    var xs = tab.xs, ys = tab.ys, dx = diffs(xs), dy = diffs(ys), eq = allSame(dx), q = dy.map(function (v, i) { return v / dx[i]; });
    var key = tab.lin ? nT(tab.m) : 'none';
    var chk = function (resp) {
      var a = readAns(resp);
      if (a.empty) return form('empty', 'Type the slope, or press <b>none</b> if the relation is not linear.');
      if (a.res) return a.res;
      if (a.none) {
        if (!tab.lin) return ok();
        return wrong('lin-said-not', eq ? 'Look again: find the change in ' + t('y') + ' for each step of ' + t(dx[0]) + ' in ' + t('x') + '. Are the changes all the same?' : 'The ' + t('x') + '-steps are not equal here, so compare ' + t('\\frac{\\text{change in }y}{\\text{change in }x}') + ' for each pair of neighbouring columns. Is it always the same?');
      }
      if (a.pt || a.bad) return form('unreadable', 'Type the slope as a number or fraction, or press <b>none</b>.');
      if (!tab.lin) {
        if (a.und) return wrong('nonlin-und', '“Undefined” is the slope of a vertical line. First check whether this relation is linear at all: are the changes in ' + t('y') + ' constant?');
        return wrong('nonlin-slope', allSame(dy) && !eq ? 'The ' + t('y') + '-values change by the same amount each time, but the ' + t('x') + '-steps are not equal (' + t(dx.join(',\\ ')) + '). Divide each change in ' + t('y') + ' by its change in ' + t('x') + ' — are the results the same?'
          : 'Check <b>every</b> step, not just the first: find the change in ' + t('y') + ' from each column to the next. Are the changes all the same?');
      }
      if (a.und && rv(tab.m) === 0) return wrong('slope-und0', '“Undefined” is the slope of a <b>vertical</b> line. Here ' + t('y') + ' never changes — the rise is ' + t('0') + ' — so the slope is ' + t('0') + '.');
      return K.slope(tab.m, { diag: function (v) {
        if (!eq || dx[0] !== 1) {
          var hit = dy.some(function (d, i) { return near(d, v) && !near(q[i], v); });
          if (hit) return { code: 'dy-only', hint: t(nT(v)) + ' is a change in ' + t('y') + ' only. Slope = change in ' + t('y') + ' ÷ change in ' + t('x') + (eq ? ', and here ' + t('x') + ' goes up by ' + t(dx[0]) + ' each time.' : ' — divide each change in ' + t('y') + ' by its own change in ' + t('x') + '.') };
        }
        return null;
      } })(resp);
    };
    var dyT = t(dy.map(sgT).join(',\\ ')), sol;
    if (eq && tab.lin) sol = t('x') + ' goes up in equal steps of ' + t(dx[0]) + ', and ' + t('y') + ' changes by ' + t(sgT(dy[0])) + ' every time. <b>Linear</b>, slope ' + t((dx[0] === 1 ? '' : qT(dy[0], dx[0]) + '=') + nT(tab.m)) + '.' + (rv(tab.m) === 0 ? ' (The ' + t('y') + '-value never changes: a horizontal line.)' : '');
    else if (eq) sol = 'Equal ' + t('x') + '-steps of ' + t(dx[0]) + ', but ' + t('y') + ' changes by ' + dyT + ' — not the same each time. <b>Not linear.</b>';
    else if (tab.lin) sol = 'The ' + t('x') + '-steps are ' + t(dx.join(',\\ ')) + ' (not equal), so divide: ' + t(dy.map(function (d, i) { return qT(d, dx[i]); }).join('=') + '=' + nT(tab.m)) + '. <b>Linear</b>, slope ' + t(nT(tab.m)) + '.';
    else sol = t('y') + ' changes by ' + dyT + ', but the ' + t('x') + '-steps are ' + t(dx.join(',\\ ')) + '. ' + t('\\frac{\\Delta y}{\\Delta x}') + ': ' + t(dy.map(function (d, i) { return qT(d, dx[i]); }).join(',\\ ')) + ' — not constant. <b>Not linear.</b>';
    var p = B.fields(tbl(xs, ys) + 'Linear? If so, type its slope; if not, press <b>none</b>.', [fMath('Slope', 'e.g. 3, -1/2, or none')], [chk], [key],
      tab.lin ? 'Linear, slope ' + t(nT(tab.m)) : 'Not linear', sol,
      [eq ? 'Find the change in ' + t('y') + ' from each column to the next. Linear means they are all the same.' : 'The ' + t('x') + '-steps are not equal, so work out ' + t('\\frac{\\text{change in }y}{\\text{change in }x}') + ' for each step.', 'If the relation is linear, that constant value is the slope.'],
      'is it linear? ' + xs.join(',') + ' / ' + ys.join(','));
    p.bad = tab.lin ? ['none'].concat(dy.filter(function (d) { return !near(d, rv(tab.m)); }).slice(0, 1).map(nT)) : [nT(q[0])];
    if (tab.lin && Array.isArray(tab.m)) p.good = [[dT(rv(tab.m))]];
    p.bad = p.bad.map(function (b) { return [b]; });
    return p;
  }
  function tabA(r) { var m = r.pick([-5, -4, -3, -2, 2, 3, 4, 5]), x0 = r.pick([-2, -1, 0, 1, 1]), b = r.int(-6, 6), xs = rng(0, 4).map(function (i) { return x0 + i; }); return { xs: xs, ys: xs.map(function (x) { return m * x + b; }), lin: true, m: m }; }
  function tabB(r) {
    var x0 = r.pick([-4, -2, 0, 0]), xs = rng(0, 4).map(function (i) { return x0 + 2 * i; }), ys, i;
    if (r.chance(0.7)) { var s = r.pick([-1, 1]), c = r.pick([1, 1, 2]), inc = r.pick([1, 1, 2]), y0 = s < 0 ? r.int(8, 14) : r.int(-6, 2); ys = [y0]; for (i = 0; i < 4; i++) ys.push(ys[i] + s * (c + inc * i)); return { xs: xs, ys: ys, lin: false }; }
    var d = r.pick([-3, -1, 1, 3]), y1 = r.int(-4, 8); ys = xs.map(function (x, j) { return y1 + d * j; });
    return { xs: xs, ys: ys, lin: true, m: [d, 2] };
  }
  function tabC(r) { var k = r.pick(nz(-6, 6)), st = r.pick([2, 2, 1, 3]), x0 = r.pick([-3, -4, -2]), xs = rng(0, 4).map(function (i) { return x0 + st * i; }); return { xs: xs, ys: xs.map(function () { return k; }), lin: true, m: 0 }; }
  function tabD(r) {
    var x0 = r.pick([0, 0, -2, -1]), xs = [0, 1, 3, 6, 10].map(function (d) { return x0 + d; });
    if (r.chance(0.75)) { var m = r.pick([-3, -2, 2, 3]), b = r.int(-6, 6); return { xs: xs, ys: xs.map(function (x) { return m * x + b; }), lin: true, m: m }; }
    var dd = r.pick([-3, -2, 2, 3]), y0 = r.int(-5, 5); return { xs: xs, ys: xs.map(function (x, j) { return y0 + dd * j; }), lin: false };
  }

  /* ================= Q2: complete the table ================= */
  function fillPart(prompt, xs, ys, blanks, diagFor, sol, hints, text) {
    var shown = ys.map(function (y, i) { return blanks.indexOf(i) >= 0 ? null : y; });
    var p = B.fields(prompt + tbl(xs, shown), blanks.map(function (i) { return fNum(t('x=' + xs[i]) + ':', t('y=')); }), blanks.map(function (i) { return K.number(ys[i], diagFor(i)); }),
      blanks.map(function (i) { return String(ys[i]); }), tbl(xs, ys), sol, hints, text);
    p.bad = [blanks.map(function (i) { return String(ys[i] + 1); })];
    return p;
  }

  /* ================= Q3: read a graph ================= */
  function readGraphPart(L) {
    var xi, yi, sl;
    if (L.kind === 's') { xi = L.a; yi = L.b; sl = ex.norm(-L.b, L.a); }
    else if (L.kind === 'o') { xi = 0; yi = 0; sl = ex.norm(L.m[0], L.m[1]); }
    else if (L.kind === 'v') { xi = L.k; yi = null; sl = null; }
    else { xi = null; yi = L.k; sl = [0, 1]; }
    var vert = L.kind === 'v', hor = L.kind === 'h';
    var chks = [
      valChk(xi, { v: 'x', other: yi, none: true, notNone: 'This line is horizontal and never meets the ' + t('x') + '-axis, so there is no ' + t('x') + '-intercept — press <b>none</b>.', saidNone: L.kind === 'o' ? 'The line passes through the origin ' + t('(0,\\ 0)') + ', which is on the ' + t('x') + '-axis.' : null }),
      valChk(yi, { v: 'y', other: xi, none: true, notNone: 'This line is vertical and never meets the ' + t('y') + '-axis, so there is no ' + t('y') + '-intercept — press <b>none</b>.', saidNone: L.kind === 'o' ? 'The line passes through the origin ' + t('(0,\\ 0)') + ', which is on the ' + t('y') + '-axis too.' : null }),
      slopeChk(sl)];
    var keys = [xi == null ? 'none' : nT(xi), yi == null ? 'none' : nT(yi), slopeKey(sl)];
    var sol;
    if (L.kind === 's') sol = 'The line crosses the ' + t('x') + '-axis at ' + t(ptT([xi, 0])) + ' and the ' + t('y') + '-axis at ' + t(ptT([0, yi])) + ': ' + t('x') + '-intercept ' + t(nT(xi)) + ', ' + t('y') + '-intercept ' + t(nT(yi)) + '.<br>Slope from ' + t(ptT([xi, 0])) + ' to ' + t(ptT([0, yi])) + ': ' + t('\\dfrac{\\text{rise}}{\\text{run}}=' + qT(yi, -xi) + '=' + nT(sl)) + '.';
    else if (L.kind === 'o') sol = 'The line passes through the origin, so both intercepts are ' + t('0') + ' (one intercept point, ' + t('(0,\\ 0)') + ').<br>Slope: from ' + t('(0,\\ 0)') + ' to ' + t(ptT([L.m[1], L.m[0]])) + ', ' + t(qT(L.m[0], L.m[1]) + '=' + nT(sl)) + '.';
    else if (vert) sol = 'The vertical line ' + t('x=' + L.k) + ': ' + t('x') + '-intercept ' + t(L.k) + ', <b>no</b> ' + t('y') + '-intercept (it never meets the ' + t('y') + '-axis), slope <b>undefined</b> (the run is ' + t('0') + ').';
    else sol = 'The horizontal line ' + t('y=' + L.k) + ': <b>no</b> ' + t('x') + '-intercept (it never meets the ' + t('x') + '-axis), ' + t('y') + '-intercept ' + t(L.k) + ', slope ' + t('0') + ' (the rise is ' + t('0') + ').';
    var p = B.fields(fig(G({ segs: [lineSeg(L)] })) + 'Press <b>none</b> for an intercept that doesn’t exist.',
      [fMath(t('x') + '-intercept:', 'e.g. -4 or none'), fMath(t('y') + '-intercept:', 'e.g. 3 or none'), fMath('slope:', 'e.g. -1/2 or undefined')], chks, keys,
      t('x') + '-intercept: ' + (xi == null ? 'none' : t(nT(xi))) + '<br>' + t('y') + '-intercept: ' + (yi == null ? 'none' : t(nT(yi))) + '<br>slope: ' + (sl == null ? 'undefined' : t(nT(sl))), sol,
      ['The ' + t('x') + '-intercept is where the line crosses the ' + t('x') + '-axis (there ' + t('y=0') + '); the ' + t('y') + '-intercept is where it crosses the ' + t('y') + '-axis (there ' + t('x=0') + ').', vert || hor ? 'A ' + (vert ? 'vertical' : 'horizontal') + ' line meets only one axis. Its slope is ' + (vert ? 'undefined' : t('0')) + '.' : 'For the slope, count the rise and the run between the two intercept points. Falling left to right means a negative slope.'],
      'read intercepts and slope: ' + L.kind + ' ' + [xi, yi].join(','));
    p.bad = xi != null && yi != null && !near(xi, yi) ? [[keys[1], keys[0], keys[2]]] : [];
    if (sl != null && rv(sl) !== 0) p.bad.push([keys[0], keys[1], nT(-rv(sl))]);
    if (vert) p.bad.push([keys[0], 'none', '0']);
    if (hor) p.bad.push(['none', keys[1], '\\text{undefined}']);
    return p;
  }

  /* ================= Q5: domain and range ================= */
  function drPart(prompt, Dt, Rt, o, sol, hints, text) {
    o = o || {};
    var p = B.fields(prompt, [fSet('Domain', o.v || 'x'), fSet('Range', o.w || 'y')],
      [K.set(Dt, { v: o.v || 'x', other: Rt, otherName: 'range', wrong: o.dWrong }), K.set(Rt, { v: o.w || 'y', other: Dt, otherName: 'domain', wrong: o.rWrong })], [Dt, Rt],
      'Domain: ' + t(Dt) + '<br>Range: ' + t(Rt), sol, hints, text);
    p.bad = (o.bad || []).concat(Dt !== Rt ? [[Rt, Dt]] : []).filter(function (x) { return !(x[0] === Dt && x[1] === Rt); });
    p.good = o.good || [];
    return p;
  }
  var ALLX = '\\{x\\mid x\\in\\mathbb{R}\\}', ALLY = '\\{y\\mid y\\in\\mathbb{R}\\}';
  function between(v, lo, hi, opLo, opHi) { return '\\{' + v + '\\mid ' + nT(lo) + (opLo || '\\le ') + v + (opHi || '\\le ') + nT(hi) + ',\\ ' + v + '\\in\\mathbb{R}\\}'; }

  /* ================= Q6 / sketches: what a drawn line is ================= */
  var PAD = { x: [-5, 5], y: [-5, 5], grid: 1, labels: 2, mode: 'lines', defaultEnd: 'arrow', max: 340 };
  var PAD_HELP = '<br><small>Tap two points on your line, then the second one again to finish — the ends are already arrows.</small>';
  function pad() { return Object.assign({}, PAD); }
  function lineDr(p, q, s, e) { return { pts: [], pieces: [{ v: [p, q], s: s || 'arrow', e: e || 'arrow' }], join: 'none' }; }
  function lineInfo(value) {
    var g = D.geom(value), keys = Object.keys(g.lines);
    if (!keys.length) return { err: { code: 'sk-noline', hint: 'Draw a <b>line</b>: choose ╱ Line, tap two points, then tap the second one again.' } };
    if (keys.length > 1) return { err: { code: 'sk-lines', hint: 'Draw just <b>one</b> straight line (yours bends or has more than one piece).' } };
    if (g.pts.length) return { err: { code: 'sk-points', hint: 'Remove the separate points (tap them again with ● Point) — draw only the line.' } };
    var L = g.lines[keys[0]];
    if (L.iv.length !== 1 || isFinite(L.iv[0].lo) || isFinite(L.iv[0].hi)) return { err: { code: 'sk-segment', hint: 'A line goes on forever in both directions: put an <b>arrow</b> on each end (use ●○ Ends).' } };
    var A = L.A, Bc = L.B, C = L.C, i = { vertical: Bc === 0, horizontal: A === 0 };
    i.xint = A !== 0 ? cl(C / A) : (Math.abs(C) < 1e-9 ? 'inf' : null);
    i.yint = Bc !== 0 ? cl(C / Bc) : (Math.abs(C) < 1e-9 ? 'inf' : null);
    i.slope = Bc === 0 ? null : cl(-A / Bc);
    i.count = i.xint === 'inf' || i.yint === 'inf' ? Infinity : i.xint != null && i.yint != null ? (near(i.xint, 0) && near(i.yint, 0) ? 1 : 2) : 1;
    i.origin = i.count === 1 && i.xint != null && i.yint != null;
    return i;
  }
  function sketchChk(rule) { return function (resp) { if (D.empty(resp)) return form('empty', 'Draw your line on the grid first.'); var i = lineInfo(resp); if (i.err) return wrong(i.err.code, i.err.hint); var h = rule(i); return h ? wrong(h.code, h.hint) : ok(); }; }
  function axisHint(i) { return { code: 'sk-axis', hint: 'Your line lies along the ' + (i.xint === 'inf' ? t('x') : t('y')) + '-axis, so every point on it is an intercept — infinitely many.' }; }
  /* two intercepts with given signs (sx, sy = ±1); optional slope sign ss */
  function twoIntRule(sx, sy, ss) {
    return function (i) {
      if (i.count === Infinity) return axisHint(i);
      if (i.origin) return { code: 'sk-origin', hint: 'Your line passes through the origin, so it has only <b>one</b> intercept, ' + t('(0,\\ 0)') + '. Move it so it crosses the two axes at different points.' };
      if (i.count === 1) return { code: 'sk-one', hint: 'A ' + (i.vertical ? 'vertical' : 'horizontal') + ' line crosses only one axis. Tilt it so it crosses both.' };
      if (sx && Math.sign(i.xint) !== sx) return { code: 'sk-sign', hint: 'Your ' + t('x') + '-intercept is ' + t(nT(i.xint)) + ' — it should be ' + signW(sx) + '.' };
      if (sy && Math.sign(i.yint) !== sy) return { code: 'sk-sign', hint: 'Your ' + t('y') + '-intercept is ' + t(nT(i.yint)) + ' — it should be ' + signW(sy) + '.' };
      if (ss && Math.sign(i.slope) !== ss) return { code: 'sk-slope-sign', hint: 'Your line ' + (i.slope > 0 ? 'rises' : 'falls') + ' from left to right; its slope should be ' + signW(ss) + '.' };
      return null;
    };
  }
  function intDesc(i) { return t('x') + '-intercept ' + (i.xint == null ? 'none' : i.xint === 'inf' ? '∞' : t(nT(i.xint))) + ', ' + t('y') + '-intercept ' + (i.yint == null ? 'none' : i.yint === 'inf' ? '∞' : t(nT(i.yint))); }

  /* ================= Q7 / Extra 6: contexts ================= */
  var RIDERS = [['Priya', 'she', 'her'], ['Mateo', 'he', 'his'], ['Aiyana', 'she', 'her'], ['Liam', 'he', 'his'], ['Noor', 'she', 'her']];
  function q7Shared(r) {
    var o, R = r.pick(RIDERS);
    for (var g = 0; g < 200; g++) {
      var s = r.pick([10, 10, 5]), c = s === 10 ? r.pick([2, 3, 3, 4]) : r.pick([1, 2]), N = r.pick([4, 5, 6]);
      o = { s: s, c: c, N: N, D0: c * N, T: s * N, rate: cl(c / s), nm: R[0], he: R[1], his: R[2] };
      if (o.D0 >= 8 && o.D0 <= 18) break;
    }
    o.ts = [0, 1, 2, 3].map(function (i) { return i * o.s; }); o.ds = o.ts.map(function (x, i) { return o.D0 - i * o.c; });
    return o;
  }
  var CTX = [
    { what: 'A candle', start: function (S) { return 'is ' + t(S) + ' cm tall when it is lit'; }, act: 'burns down', v: 'h', vq: 'height', vu: 'cm', tu: 'h', tw: 'hour', tq: 'hours', rates: [2, 3, 4], Ns: [6, 8, 9, 10, 12], max: 40, zero: 'the candle has burned away completely', startM: 'the candle is ' },
    { what: 'A phone battery', start: function (S) { return 'is at ' + t(S + '\\%') + ' when the phone is unplugged'; }, act: 'drains', v: 'C', vq: 'charge', vu: '%', tu: 'h', tw: 'hour', tq: 'hours', rates: [4, 5, 8], Ns: [10, 12, 15, 18, 20], max: 100, zero: 'the battery is empty', startM: 'the battery is at ' },
    { what: 'A water tank', start: function (S) { return 'holds ' + t(S) + ' L when its valve is opened'; }, act: 'drains', v: 'V', vq: 'volume', vu: 'L', tu: 'min', tw: 'minute', tq: 'minutes', rates: [15, 20, 25], Ns: [8, 10, 12, 16], max: 400, zero: 'the tank is empty', startM: 'the tank holds ' }];
  function U(c) { return c.vu === '%' ? '' : ' ' + c.vu; }
  function e6Shared(r) {
    var c = r.pick(CTX), rate, N, S;
    for (var g = 0; g < 200; g++) { rate = r.pick(c.rates); N = r.pick(c.Ns); S = rate * N; if (S <= c.max) break; }
    return { c: c, rate: rate, N: N, S: S };
  }

  /* ================= Q8 / Q12 helpers ================= */
  function lineText(L) {
    if (L.kind === 'v') return 'undefined slope; ' + t('x') + '-intercept ' + t(L.k);
    if (L.kind === 'h') return 'slope ' + t('0') + '; ' + t('y') + '-intercept ' + t(L.k) + '; no ' + t('x') + '-intercept';
    if (L.kind === 'o') return signW(L.m[0] / L.m[1]) + ' slope; only one intercept, ' + t('(0,\\ 0)');
    return signW(-L.b / L.a) + ' slope; ' + t('x') + '-intercept ' + t(L.a) + ', ' + t('y') + '-intercept ' + t(L.b);
  }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  HW.defineLesson({
    id: 'u6l5', unit: 6, num: '5', title: 'Characteristics of Linear Graphs', outcome: 'RF5',
    blurb: 'Is it linear? — testing tables of values, then reading intercepts, slope, domain and range, how many intercepts a line can have, and matching lines to their characteristics.',
    questions: [
      { num: '1', section: 'Assignment — Linear relations and their characteristics', outcome: 'RF4', stem: 'Decide whether each table represents a linear relation. If it does, state the slope. (Press <b>none</b> if it is not linear.)', parts: [
        { id: '1a', level: 'BEG', make: function (r) { return linPart(tabA(r)); } },
        { id: '1b', level: 'EMG', make: function (r) { return linPart(tabB(r)); } },
        { id: '1c', level: 'BEG', make: function (r) { return linPart(tabC(r)); } },
        { id: '1d', level: 'PRG', make: function (r) { return linPart(tabD(r)); } }] },

      { num: '2', outcome: 'RF4', stem: 'Complete each table so that it represents a linear relation.', parts: [
        { id: '2a', level: 'EMG', make: function (r) {
          var m = r.pick([-4, -3, -2, 2, 3, 4]), b = m < 0 ? r.int(4, 9) : r.int(-6, 1), xs = rng(0, 5), ys = xs.map(function (x) { return b + m * x; });
          return fillPart('', xs, ys, [2, 3, 5], function (i) { return function (v) {
            if (v === b - m * xs[i]) return { code: 'tb-sign', hint: 'Check the direction: from ' + t('x=0') + ' to ' + t('x=1') + ', ' + t('y') + ' goes ' + (m < 0 ? 'down' : 'up') + ' by ' + t(Math.abs(m)) + '.' };
            if (i === 5 && v === ys[4] + (ys[4] - ys[1])) return { code: 'tb-gap', hint: 'From ' + t('x=1') + ' to ' + t('x=4') + ' is <b>three</b> steps, so one step changes ' + t('y') + ' by a third of that.' };
            return null; }; },
            'From ' + t('x=0') + ' to ' + t('x=1') + ', ' + t('y') + ' changes by ' + t(sgT(m)) + '. Check with the gap from ' + t('x=1') + ' to ' + t('x=4') + ': ' + t(ys[4] + '-(' + ys[1] + ')=' + (ys[4] - ys[1]) + '=3\\times(' + m + ')') + ' ✓.<br>So the missing values are ' + t(ys[2] + ',\\ ' + ys[3] + ',\\ ' + ys[5]) + '.',
            ['Equal steps of ' + t('1') + ' in ' + t('x') + ' must give equal changes in ' + t('y') + '. What is the change from ' + t('x=0') + ' to ' + t('x=1') + '?'], 'complete linear table, step ' + m);
        } },
        { id: '2b', level: 'PRG', make: function (r) {
          var d = r.pick([-3, -1, 1, 3]), b = r.int(-3, 4), xs = [-4, -2, 0, 2, 4, 6], ys = xs.map(function (x) { return b + d * x / 2; });
          return fillPart('', xs, ys, [0, 3, 5], function (i) { return function (v) {
            var known = i === 0 ? 1 : i === 3 ? 2 : 4;
            if (v === ys[known] + d * (xs[i] - xs[known]) && d !== 0) return { code: 'tb-step', hint: 'Each column is a step of ' + t('2') + ' in ' + t('x') + '. ' + t('y') + ' changes by ' + t(sgT(d)) + ' per <b>column</b> (per step of 2), not per unit of ' + t('x') + '.' };
            if (v === ys[known] - d * (xs[i] - xs[known]) / 2) return { code: 'tb-sign', hint: 'Check the direction: as ' + t('x') + ' increases, ' + t('y') + ' goes ' + (d < 0 ? 'down' : 'up') + '.' };
            return null; }; },
            'From ' + t('x=-2') + ' to ' + t('x=0') + ', ' + t('y') + ' changes by ' + t(sgT(d)) + ' (check: from ' + t('x=0') + ' to ' + t('x=4') + ' is two steps, ' + t(sgT(2 * d)) + ' ✓). So each step of ' + t('2') + ' in ' + t('x') + ' adds ' + t(sgT(d)) + ' (slope ' + t(nT([d, 2])) + ').<br>Missing values: ' + t(ys[0] + ',\\ ' + ys[3] + ',\\ ' + ys[5]) + '.',
            ['The ' + t('x') + '-values go up by ' + t('2') + ' each time. How much does ' + t('y') + ' change from ' + t('x=-2') + ' to ' + t('x=0') + '?', 'Check your step against the gap from ' + t('x=0') + ' to ' + t('x=4') + ' (two steps).'], 'complete linear table, x-step 2, change ' + d);
        } }] },

      { num: '3', stem: 'For each line, state the ' + t('x') + '-intercept, the ' + t('y') + '-intercept and the slope.', parts: [
        { id: '3a', level: 'BEG', make: function (r) {
          var a, b;
          for (var g = 0; g < 200; g++) { a = r.pick([-4, -4, -3, -2, 2, 3, 4, 4]); b = r.pick([-3, -2, -1, 1, 2, 3]); if (Math.abs(b) < Math.abs(a) && gcd(a, b) === 1) break; }
          return readGraphPart({ kind: 's', a: a, b: b });
        } },
        { id: '3b', level: 'BEG', make: function (r) {
          var a, m, b;
          for (var g = 0; g < 200; g++) { a = r.pick([-2, -1, -1, 1, 1, 2]); m = r.pick([-4, -3, -2, 2, 3, 4]); b = -m * a; if (Math.abs(b) <= 5) break; }
          return readGraphPart({ kind: 's', a: a, b: b });
        } },
        { id: '3c', level: 'BEG', make: function (r) { return readGraphPart({ kind: r.chance(0.65) ? 'v' : 'h', k: r.pick(nz(-5, 5)) }); } }] },

      { num: '4', stem: 'Each table represents a linear relation. State the ' + t('x') + '-intercept and the ' + t('y') + '-intercept.', parts: [
        { id: '4a', level: 'BEG', make: function (r) {
          var q = r.pick([2, 3, 3]), p = r.pick([-5, -4, -2, -1, 1, 2, 4, 5].filter(function (z) { return gcd(z, q) === 1; })), xs = [-2, -1, 0, 1, 2].map(function (k) { return k * q; }), ys = [-2, -1, 0, 1, 2].map(function (k) { return k * p; });
          var sn = 'The row ' + t('(0,\\ 0)') + ' has ' + t('y=0') + ' <b>and</b> ' + t('x=0') + ', so the origin is on both axes.';
          var p2 = B.fields(tbl(xs, ys), [fNum(t('x') + '-intercept:'), fNum(t('y') + '-intercept:')], [valChk(0, { v: 'x', saidNone: sn }), valChk(0, { v: 'y', saidNone: sn })], ['0', '0'],
            t('x') + '-intercept ' + t('0') + ', ' + t('y') + '-intercept ' + t('0'),
            'The row ' + t('(0,\\ 0)') + ' has ' + t('x=0') + ' <b>and</b> ' + t('y=0') + ': ' + t('x') + '-intercept ' + t('0') + ' and ' + t('y') + '-intercept ' + t('0') + ' — one intercept point, the origin.',
            ['The ' + t('x') + '-intercept is in the row where ' + t('y=0') + '; the ' + t('y') + '-intercept is in the row where ' + t('x=0') + '.'], 'intercepts from a table through the origin');
          p2.bad = [['none', '0'], [String(q), String(p)]];
          return p2;
        } },
        { id: '4b', level: 'EMG', make: function (r) {
          var x0 = r.pick([-2, -2, -4]), xs = rng(0, 4).map(function (i) { return x0 + 2 * i; }), m = r.pick([-3, -2, -2, 2, 3]);
          var odds = rng(xs[0] + 1, xs[4] - 1).filter(function (x) { return Math.abs(x % 2) === 1; }), X = r.pick(odds), b = -m * X, ys = xs.map(function (x) { return m * x + b; });
          var i0 = xs.filter(function (x) { return x < X; }).pop();
          var p = B.fields(tbl(xs, ys), [fNum(t('x') + '-intercept:'), fNum(t('y') + '-intercept:')],
            [valChk(X, { v: 'x', other: b, diag: function (v) { if (xs.indexOf(v) >= 0) return { code: 'value', hint: 'At ' + t('x=' + v) + ', ' + t('y=' + (m * v + b)) + ', not ' + t('0') + '. No row has ' + t('y=0') + ': use the rate of change to find where ' + t('y') + ' reaches ' + t('0') + '.' }; return null; } }), valChk(b, { v: 'y', other: X })],
            [String(X), String(b)], t('x') + '-intercept ' + t(X) + ', ' + t('y') + '-intercept ' + t(b),
            'Row ' + t('x=0') + ': ' + t('y') + '-intercept ' + t(b) + '.<br>No row has ' + t('y=0') + '. ' + t('y') + ' changes by ' + t(sgT(2 * m)) + ' for each ' + t('2') + ' in ' + t('x') + ', i.e. ' + t(sgT(m)) + ' per unit. From ' + t(ptT([i0, m * i0 + b])) + ', one more unit right gives ' + t(ptT([X, 0])) + ': ' + t('x') + '-intercept ' + t(X) + '.',
            ['The ' + t('y') + '-intercept is the ' + t('y') + '-value in the row where ' + t('x=0') + '.', 'No row has ' + t('y=0') + '. Find the change in ' + t('y') + ' for each unit of ' + t('x') + ', then go from the row nearest to ' + t('y=0') + '.'], 'intercepts from a table, x-int between rows');
          p.bad = [[String(b), String(X)], [String(i0), String(b)]];
          return p;
        } }] },

      { num: '5', stem: 'State the domain and range of each linear relation.', parts: [
        { id: '5a', level: 'BEG', make: function (r) {
          var x1 = r.int(1, 3), x2 = x1 + r.int(1, 3), y1 = r.int(-2, 4), y2 = y1 + r.pick([-4, -3, -2, 2, 3, 4]);
          return drPart('The line through ' + t(ptT([x1, y1])) + ' and ' + t(ptT([x2, y2])) + ', extending forever in both directions.', ALLX, ALLY,
            { dWrong: [{ is: between('x', x1, x2), code: 'set-segment', hint: 'That would be the segment between the two points. The line keeps going forever left and right, so every ' + t('x') + ' is used.' }],
              rWrong: [{ is: between('y', Math.min(y1, y2), Math.max(y1, y2)), code: 'set-segment', hint: 'The line keeps going forever up and down too, so every ' + t('y') + ' is used.' }],
              bad: [[between('x', x1, x2), between('y', Math.min(y1, y2), Math.max(y1, y2))]], good: [['\\mathbb{R}', '\\mathbb{R}']] },
            'A slanted line that continues forever in both directions uses every real number: Domain ' + t(ALLX) + ', Range ' + t(ALLY) + '.',
            ['The points only tell you where the line is. It is not a segment — it never stops.'], 'D and R of a slanted line');
        } },
        { id: '5b', level: 'BEG', make: function (r) {
          var h = r.pick(nz(-5, 5)), k = r.pick(nz(-6, 6).filter(function (z) { return Math.abs(z) !== Math.abs(h); })), R = '\\{' + k + '\\}';
          return drPart('The horizontal line through ' + t(ptT([h, k])) + '.', ALLX, R,
            { dWrong: [{ is: '\\{' + h + '\\}', code: 'set-point', hint: 'A horizontal line runs left and right forever, so every ' + t('x') + '-value is used — that’s the vertical line through the point.' }],
              rWrong: [{ is: '\\{' + h + '\\}', code: 'set-xy', hint: 'The range is the set of ' + t('y') + '-values. Every point on this line has ' + t('y=' + k) + '.' }, { is: ALLY, code: 'set-arrow', hint: 'A horizontal line never goes up or down: it has only one ' + t('y') + '-value.' }],
              bad: [['\\{' + h + '\\}', ALLY], [ALLX, '\\{' + h + '\\}']] },
            'Every point on the line has ' + t('y=' + k) + ', and the line runs left and right forever: Domain ' + t(ALLX) + ', Range ' + t(R) + '.',
            ['Which coordinate stays the same on a horizontal line?'], 'D and R of a horizontal line');
        } },
        { id: '5c', level: 'BEG', make: function (r) {
          var h = r.pick(nz(-5, 5)), k = r.pick(nz(-6, 6).filter(function (z) { return Math.abs(z) !== Math.abs(h); })), Dd = '\\{' + h + '\\}';
          return drPart('The vertical line through ' + t(ptT([h, k])) + '.', Dd, ALLY,
            { dWrong: [{ is: '\\{' + k + '\\}', code: 'set-xy', hint: 'The domain is the set of ' + t('x') + '-values. Every point on this line has ' + t('x=' + h) + '.' }, { is: ALLX, code: 'set-arrow', hint: 'A vertical line never moves left or right: it has only one ' + t('x') + '-value.' }],
              rWrong: [{ is: '\\{' + k + '\\}', code: 'set-point', hint: 'A vertical line runs up and down forever, so every ' + t('y') + '-value is used.' }],
              bad: [[ALLX, '\\{' + k + '\\}'], ['\\{' + k + '\\}', ALLY]] },
            'Every point on the line has ' + t('x=' + h) + ', and the line runs up and down forever: Domain ' + t(Dd) + ', Range ' + t(ALLY) + '.',
            ['Which coordinate stays the same on a vertical line?'], 'D and R of a vertical line');
        } },
        { id: '5d', level: 'EMG', make: function (r) {
          var x1 = r.int(-4, -1), x2 = r.int(1, 5), y1 = r.int(3, 8), y2 = r.int(-5, -1), Dd = between('x', x1, x2), R = between('y', y2, y1);
          return drPart('The line segment from ' + t(ptT([x1, y1])) + ' to ' + t(ptT([x2, y2])) + '.', Dd, R,
            { dWrong: [{ is: ALLX, code: 'set-arrow', hint: 'A segment stops at its endpoints, so ' + t('x') + ' only runs from ' + t(x1) + ' to ' + t(x2) + '.' }],
              rWrong: [{ is: between('y', x1, x2), code: 'set-xy', hint: 'The range uses the <b>' + t('y') + '-coordinates</b> of the endpoints, ' + t(y1) + ' and ' + t(y2) + '.' }, { is: ALLY, code: 'set-arrow', hint: 'A segment stops at its endpoints, so ' + t('y') + ' only runs between ' + t(y2) + ' and ' + t(y1) + '.' }],
              bad: [[ALLX, ALLY], [Dd, between('y', x1, x2)]] },
            t('x') + ' runs from ' + t(x1) + ' to ' + t(x2) + ' and ' + t('y') + ' from ' + t(y2) + ' up to ' + t(y1) + ' (smaller number first):<br>Domain ' + t(Dd) + ', Range ' + t(R) + '.',
            ['Read the domain from the ' + t('x') + '-coordinates of the endpoints and the range from the ' + t('y') + '-coordinates.', 'Write the smaller number first, and include the endpoints (' + t('\\le') + ').'], 'D and R of a segment');
        } }] },

      { num: '6', stem: 'On each grid, sketch a line with the given characteristics. (Many answers are right.)', parts: [
        { id: '6a', level: 'PRG', make: function (r) {
          var sx = r.pick([1, 1, -1]), sy = r.pick([1, 1, -1]), xa = 3 * sx, yb = 2 * sy;
          var desc = sx > 0 && sy > 0 ? 'both positive' : sx < 0 && sy < 0 ? 'both negative' : 'a ' + signW(sx) + ' ' + t('x') + '-intercept and a ' + signW(sy) + ' ' + t('y') + '-intercept';
          var p = B.graph('Exactly two intercepts, ' + desc + '.' + PAD_HELP, pad(), sketchChk(twoIntRule(sx, sy)), lineDr([xa, 0], [0, yb]),
            'Answers vary. Any slanted line that does <b>not</b> pass through the origin and crosses the ' + t('x') + '-axis on the ' + signW(sx) + ' side and the ' + t('y') + '-axis on the ' + signW(sy) + ' side, e.g. through ' + t(ptT([xa, 0])) + ' and ' + t(ptT([0, yb])) + '.' + (sx === sy ? ' (Such a line always falls: its slope is negative.)' : ' (Such a line always rises: its slope is positive.)'),
            ['Pick the two intercept points first — one on each axis, on the right sides — then draw the line through them.', 'A line through the origin has only one intercept; a horizontal or vertical line meets only one axis.'], 'sketch two intercepts ' + sx + ',' + sy);
          p.good = [lineDr([sx, 0], [0, 4 * sy]), lineDr([4 * sx, 0], [0, sy])];
          p.bad = [lineDr([0, 0], [2, 2]), lineDr([-xa, 0], [0, yb]), lineDr([xa, 0], [0, -yb]), lineDr([xa, 0], [0, yb], 'closed', 'closed'), lineDr([xa, -1], [xa, 1])];
          return p;
        } },
        { id: '6b', level: 'EMG', make: function (r) {
          var ax = r.chance(0.7) ? 'x' : 'y', k = r.pick([-4, -3, -2, 2, 3, 4]), key = ax === 'x' ? lineDr([k, 0], [k, 1]) : lineDr([0, k], [1, k]);
          var rule = function (i) {
            if (i.count === Infinity) return axisHint(i);
            if (i.count === 2) return { code: 'sk-two', hint: 'Your line crosses both axes — that’s two intercepts. A line that meets only one axis must be ' + (ax === 'x' ? 'vertical' : 'horizontal') + '.' };
            if (i.origin) return { code: 'sk-origin', hint: 'Through the origin, the one intercept ' + t('(0,\\ 0)') + ' is on <b>both</b> axes. You need a line that never meets the ' + t(ax === 'x' ? 'y' : 'x') + '-axis at all.' };
            if (ax === 'x' && i.horizontal) return { code: 'sk-wrongaxis', hint: 'A horizontal line crosses the ' + t('y') + '-axis, so its one intercept is a ' + t('y') + '-intercept. You need a line that meets only the ' + t('x') + '-axis.' };
            if (ax === 'y' && i.vertical) return { code: 'sk-wrongaxis', hint: 'A vertical line crosses the ' + t('x') + '-axis, so its one intercept is an ' + t('x') + '-intercept. You need a line that meets only the ' + t('y') + '-axis.' };
            return null;
          };
          var p = B.graph('Exactly one intercept, which is ' + (ax === 'x' ? 'an ' + t('x') : 'a ' + t('y')) + '-intercept.' + PAD_HELP, pad(), sketchChk(rule), key,
            'Answers vary. A ' + (ax === 'x' ? 'vertical line other than the ' + t('y') + '-axis, e.g. ' + t('x=' + k) + ': it crosses the ' + t('x') + '-axis once and never meets the ' + t('y') + '-axis.' : 'horizontal line other than the ' + t('x') + '-axis, e.g. ' + t('y=' + k) + ': it crosses the ' + t('y') + '-axis once and never meets the ' + t('x') + '-axis.'),
            ['Which kind of line never meets the ' + t(ax === 'x' ? 'y' : 'x') + '-axis?', 'Don’t use an axis itself — that would be infinitely many intercepts.'], 'sketch exactly one ' + ax + '-intercept');
          p.good = [ax === 'x' ? lineDr([-k, 2], [-k, -2]) : lineDr([2, -k], [-2, -k])];
          p.bad = [ax === 'x' ? lineDr([0, k], [1, k]) : lineDr([k, 0], [k, 1]), ax === 'x' ? lineDr([0, 1], [0, -1]) : lineDr([1, 0], [-1, 0]), lineDr([0, 0], [1, 2]), lineDr([2, 0], [0, 2])];
          return p;
        } },
        { id: '6c', level: 'PRG', make: function (r) {
          var s = r.pick([1, 1, -1]), m = r.pick([1, 2, 1]);
          var rule = function (i) {
            if (i.count === Infinity) return axisHint(i);
            if (i.vertical || i.horizontal) return { code: 'sk-flat', hint: 'A ' + (i.vertical ? 'vertical line’s slope is undefined' : 'horizontal line’s slope is ' + t('0')) + ', not ' + signW(s) + '. Your line has to slant.' };
            if (i.count === 2) return { code: 'sk-two', hint: 'Your line has two intercepts. A slanted line has only one when it crosses both axes at the <b>same</b> point.' };
            if (Math.sign(i.slope) !== s) return { code: 'sk-slope-sign', hint: 'Right idea — through the origin — but your line ' + (i.slope > 0 ? 'rises' : 'falls') + ' from left to right. The slope must be ' + signW(s) + '.' };
            return null;
          };
          var p = B.graph('Exactly one intercept, and a ' + signW(s) + ' slope.' + PAD_HELP, pad(), sketchChk(rule), lineDr([0, 0], [1, s * m]),
            'Answers vary. A slanted line has two intercepts unless they are the same point, so the line must pass through the <b>origin</b>, ' + (s > 0 ? 'rising' : 'falling') + ' from left to right — e.g. through ' + t('(0,\\ 0)') + ' and ' + t(ptT([1, s * m])) + '.',
            ['A horizontal or vertical line doesn’t have a ' + signW(s) + ' slope, so the line slants — and a slanted line crosses both axes. When is that only one point?'], 'sketch one intercept, slope ' + signW(s));
          p.good = [lineDr([0, 0], [2, s]), lineDr([-1, -3 * s], [1, 3 * s])];
          p.bad = [lineDr([0, 0], [1, -s]), lineDr([1, 0], [0, -s]), lineDr([0, 2], [1, 2]), lineDr([0, 0], [1, s * m], 'closed', 'closed')];
          return p;
        } },
        { id: '6d', level: 'BEG', make: function (r) {
          var vert = r.chance(0.3), k = r.pick([-4, -3, -2, -1, 1, 2, 3, 4]), key = vert ? lineDr([k, 0], [k, 1]) : lineDr([0, k], [1, k]);
          var rule = function (i) {
            if (!vert) {
              if (i.vertical) return { code: 'sk-vh', hint: 'That’s a vertical line (undefined slope). A slope of ' + t('0') + ' means no rise at all: a <b>horizontal</b> line.' };
              if (!i.horizontal) return { code: 'sk-slant', hint: 'Your line slants, so its slope isn’t ' + t('0') + '. A slope of ' + t('0') + ' is a horizontal line.' };
              if (i.yint === 'inf' || i.xint === 'inf' || !near(i.yint, k)) return { code: near(rv(i.yint === 'inf' ? 0 : i.yint), -k) ? 'sk-sign' : 'sk-k', hint: 'Right kind of line — but it must cross the ' + t('y') + '-axis at ' + t(k) + '.' };
            } else {
              if (i.horizontal) return { code: 'sk-vh', hint: 'That’s a horizontal line (slope ' + t('0') + '). An undefined slope means the run is ' + t('0') + ': a <b>vertical</b> line.' };
              if (!i.vertical) return { code: 'sk-slant', hint: 'Your line slants, so its slope is a number. An undefined slope is a vertical line.' };
              if (i.xint === 'inf' || !near(i.xint, k)) return { code: 'sk-k', hint: 'Right kind of line — but it must cross the ' + t('x') + '-axis at ' + t(k) + '.' };
            }
            return null;
          };
          var p = B.graph((vert ? 'An ' + t('x') + '-intercept of ' + t(k) + ' and an undefined slope.' : 'A ' + t('y') + '-intercept of ' + t(k) + ' and a slope of ' + t('0') + '.') + PAD_HELP, pad(), sketchChk(rule), key,
            vert ? 'An undefined slope is a vertical line; through ' + t(ptT([k, 0])) + ' it is ' + t('x=' + k) + '. (It has only this one intercept.)' : 'A slope of ' + t('0') + ' is a horizontal line; through ' + t(ptT([0, k])) + ' it is ' + t('y=' + k) + '. (It has only this one intercept.)',
            [vert ? 'Undefined slope: the run is ' + t('0') + ' — the line goes straight up and down.' : 'Slope ' + t('0') + ': the rise is ' + t('0') + ' — the line is flat.'], vert ? 'sketch x=' + k : 'sketch y=' + k);
          p.good = [vert ? lineDr([k, -3], [k, 4]) : lineDr([-3, k], [4, k])];
          p.bad = [vert ? lineDr([0, k], [1, k]) : lineDr([k, 0], [k, 1]), vert ? lineDr([-k, 0], [-k, 1]) : lineDr([0, -k], [1, -k]), vert ? lineDr([k, 0], [0, 2]) : lineDr([0, k], [1, k + 1]), vert ? lineDr([k, 0], [k, 1], 'closed', 'closed') : lineDr([0, k], [1, k], 'closed', 'closed')];
          return p;
        } }] },

      { num: '7', shared: q7Shared, stem: function (o) { return o.nm + ' cycles home from school at a steady speed. The table shows ' + o.his + ' distance from home, ' + t('d') + ' (km), ' + t('t') + ' minutes after ' + o.he + ' leaves.' + tbl(o.ts, o.ds, t('t') + ' (min)', t('d') + ' (km)'); }, parts: [
        { id: '7a', sub: 'a', level: 'EMG', outcome: 'RF4', make: function (r, o) {
          return mc(r, 'Which statement shows that the relation is linear?', [
            { html: t('t') + ' goes up in equal steps of ' + t(o.s) + ' min, and ' + t('d') + ' goes down by ' + t(o.c) + ' km every time — a constant rate of change.', right: true },
            { html: t('d') + ' goes down every time ' + t('t') + ' goes up.', why: 'Going down isn’t enough: a curve can go down too. It has to go down by the <b>same amount</b> for each equal step in ' + t('t') + '.' },
            { html: t('t') + ' goes up by ' + t(o.s) + ' minutes each time.', why: 'Equal steps in ' + t('t') + ' only set up the test. You also need equal changes in ' + t('d') + '.' },
            { html: 'The table starts at ' + t('t=0') + '.', why: 'Where the table starts doesn’t matter. Linear means a constant rate of change.' }],
            'Equal steps in ' + t('t') + ' (' + t(o.s) + ' min each) always give the same change in ' + t('d') + ' (' + t('-' + o.c) + ' km), so the rate of change is constant: the relation is <b>linear</b>.',
            ['A relation is linear when equal steps in the input always give equal changes in the output.'], 'show a context table is linear');
        } },
        { id: '7b', sub: 'b', level: 'EMG', make: function (r, o) {
          var p = B.slope('Determine the slope (the rate of change).', [-o.c, o.s], { before: 'm=', diag: function (v) {
            if (near(v, -o.c)) return { code: 'ctx-rate-step', hint: t('-' + o.c) + ' km is the change for each step of ' + t(o.s) + ' minutes. The slope is the change <b>per minute</b>: divide by ' + t(o.s) + '.' };
            return null; } },
            t('m=\\dfrac{\\Delta d}{\\Delta t}=\\dfrac{-' + o.c + '\\text{ km}}{' + o.s + '\\text{ min}}=-' + dT(o.rate)) + ' km/min.', ['Slope = change in ' + t('d') + ' ÷ change in ' + t('t') + '. Distance from home is going <b>down</b>.'], 'context slope -' + o.rate);
          p.input.after = '\\text{ km/min}'; p.input.placeholder = 'e.g. -0.5'; p.key = '-' + dT(o.rate); p.answer = t('-' + dT(o.rate) + '\\text{ km/min}');
          p.good = [nT([-o.c, o.s])]; p.bad = ['-' + o.c, dT(o.rate), nT([-o.s, o.c])];
          return p;
        } },
        { id: '7b2', sub: 'b ii', level: 'PRG', make: function (r, o) {
          var R = dT(o.rate);
          return mc(r, 'What does the slope ' + t('-' + R) + ' mean?', [
            { html: o.nm + '’s distance from home goes <b>down</b> by ' + t(R) + ' km every minute.', right: true },
            { html: o.nm + ' needs ' + t(R) + ' minutes for every kilometre.', why: 'Check the units: slope = change in ' + t('d') + ' (km) ÷ change in ' + t('t') + ' (min), so it is in <b>km per minute</b>, not minutes per km.' },
            { html: o.nm + '’s distance from home goes <b>up</b> by ' + t(R) + ' km every minute.', why: 'The slope is negative: ' + o.he + ' is getting <b>closer</b> to home.' },
            { html: o.nm + ' is ' + t(R) + ' km from home after one minute.', why: 'After one minute ' + o.he + ' is still ' + t(dT(o.D0 - o.rate)) + ' km from home. The slope is how much the distance <b>changes</b> each minute.' }],
            'The slope is in km per minute: ' + t('-' + R) + ' km/min means the distance from home shrinks by ' + t(R) + ' km each minute (' + t(o.c) + ' km every ' + t(o.s) + ' minutes).',
            ['Units of a slope: (units of ' + t('d') + ') per (unit of ' + t('t') + ').'], 'meaning of a context slope');
        } },
        { id: '7c', sub: 'c', level: 'PRG', make: function (r, o) {
          var p = B.fields('Determine both intercepts.', [fNum(t('t') + '-intercept:', '', 'min'), fNum(t('d') + '-intercept:', '', 'km')],
            [valChk(o.T, { v: 't', w: 'd', axisX: true, other: o.D0, diag: function (v) {
              if (v === o.ts[3]) return { code: 'ctx-table-end', hint: 'At ' + t('t=' + o.ts[3]) + ' ' + o.he + ' is still ' + t(o.ds[3]) + ' km from home. The ' + t('t') + '-intercept is where ' + t('d=0') + ' — keep going past the table.' };
              if (v === o.N) return { code: 'ctx-steps', hint: t(o.N) + ' is the number of ' + t(o.s) + '-minute steps. How many <b>minutes</b> is that?' };
              return null; } }), valChk(o.D0, { v: 'd', w: 't', axisX: false, other: o.T })],
            [String(o.T), String(o.D0)], t('t') + '-intercept ' + t(o.T) + ' min, ' + t('d') + '-intercept ' + t(o.D0) + ' km',
            t('d') + '-intercept (where ' + t('t=0') + '): ' + t(o.D0) + ' km.<br>' + t('t') + '-intercept (where ' + t('d=0') + '): ' + o.he + ' covers ' + t(dT(o.rate)) + ' km per minute, so ' + t(o.D0 + '\\div ' + dT(o.rate) + '=' + o.T) + ' min (or: ' + t(o.c) + ' km every ' + t(o.s) + ' min, ' + t(o.N) + ' steps of ' + t(o.s) + ' min).',
            ['The ' + t('d') + '-intercept is the value of ' + t('d') + ' when ' + t('t=0') + '.', 'The ' + t('t') + '-intercept is the time when ' + t('d=0') + ' — it is past the end of the table.'], 'context intercepts');
          p.bad = [[String(o.ts[3]), String(o.D0)], [String(o.D0), String(o.T)], [String(o.N), String(o.D0)]];
          return p;
        } },
        { id: '7c2', sub: 'c ii', level: 'PRG', make: function (r, o) {
          return mc(r, 'What do the intercepts mean?', [
            { html: t('d') + '-intercept: ' + o.he + ' starts ' + t(o.D0) + ' km from home. ' + t('t') + '-intercept: ' + o.he + ' gets home after ' + t(o.T) + ' minutes.', right: true },
            { html: t('d') + '-intercept: ' + o.he + ' rides ' + t(o.D0) + ' km per minute. ' + t('t') + '-intercept: ' + o.he + ' rides for ' + t(o.T) + ' km.', why: 'An intercept is a single value, not a rate: the ' + t('d') + '-intercept is the distance when ' + t('t=0') + '. And ' + t(o.T) + ' is a time (minutes).' },
            { html: t('d') + '-intercept: ' + o.he + ' gets home after ' + t(o.D0) + ' minutes. ' + t('t') + '-intercept: ' + o.he + ' starts ' + t(o.T) + ' km from home.', why: 'Those are swapped: the ' + t('d') + '-intercept is on the distance axis (km), the ' + t('t') + '-intercept on the time axis (min).' },
            { html: t('d') + '-intercept: ' + o.he + ' is ' + t(o.D0) + ' km from school. ' + t('t') + '-intercept: ' + o.he + ' is ' + t(o.T) + ' km from home.', why: t('d') + ' is the distance from <b>home</b>, and the ' + t('t') + '-intercept is the time when that distance is ' + t('0') + '.' }],
            'At ' + t('t=0') + ', ' + t('d=' + o.D0) + ': the starting distance from home. At ' + t('d=0') + ', ' + t('t=' + o.T) + ': the moment ' + o.he + ' arrives home.',
            ['The vertical intercept is often the starting value; the horizontal intercept is often when the quantity reaches zero.'], 'meaning of context intercepts');
        } },
        { id: '7d', sub: 'd', level: 'ADV', make: function (r, o) {
          var Dd = between('t', 0, o.T), R = between('d', 0, o.D0);
          return drPart('State the domain and range for ' + o.his + ' trip home.', Dd, R,
            { v: 't', w: 'd', dWrong: [{ is: between('t', 0, o.ts[3]), code: 'ctx-dom-table', hint: 'The table stops at ' + t('t=' + o.ts[3]) + ', but the trip doesn’t: ' + o.he + ' is still ' + t(o.ds[3]) + ' km from home. It ends at the ' + t('t') + '-intercept.' }, { is: '\\{t\\mid t\\in\\mathbb{R}\\}', code: 'set-arrow', hint: 'The trip has a start (' + t('t=0') + ') and an end (when ' + o.he + ' gets home). Times outside that make no sense here.' }],
              rWrong: [{ is: between('d', o.ds[3], o.D0), code: 'ctx-dom-table', hint: 'The distance keeps shrinking past the table, all the way to ' + t('0') + ' when ' + o.he + ' gets home.' }, { is: '\\{d\\mid d\\in\\mathbb{R}\\}', code: 'set-arrow', hint: 'The distance only runs from the start value down to ' + t('0') + '.' }],
              bad: [[between('t', 0, o.ts[3]), between('d', o.ds[3], o.D0)], ['\\{t\\mid t\\in\\mathbb{R}\\}', '\\{d\\mid d\\in\\mathbb{R}\\}']] },
            o.nm + ' rides from ' + t('t=0') + ' to ' + t('t=' + o.T) + ' (the ' + t('t') + '-intercept), and ' + t('d') + ' goes from ' + t(o.D0) + ' down to ' + t('0') + ':<br>Domain ' + t(Dd) + ', Range ' + t(R) + '.',
            ['The trip starts at ' + t('t=0') + ' and ends when ' + o.he + ' gets home — use the intercepts from (c).'], 'context domain and range');
        } }] },

      { num: '8', stem: 'Match each description with its graph.', parts: [
        { id: '8', level: 'EMG', make: function (r) {
          var V = { kind: r.chance(0.6) ? 'v' : 'h', k: r.pick([-3, -2, 2, 3]) };
          var O = { kind: 'o', m: r.pick([[2, 1], [1, 2], [3, 1], [-2, 1], [-1, 2], [2, 1]]) };
          var a, b, c, d;
          for (var g = 0; g < 200; g++) { a = r.pick(nz(-4, 4)); b = Math.sign(a) * r.int(1, 4); if (!(a === b && Math.abs(a) === 1)) break; }
          for (g = 0; g < 200; g++) { c = r.pick(nz(-4, 4)); d = -Math.sign(c) * r.int(1, 4); if (c !== a || d !== b) break; }
          var lines = [V, O, { kind: 's', a: a, b: b }, { kind: 's', a: c, b: d }], subs = ['i', 'ii', 'iii', 'iv'], labels = r.shuffle(['P', 'Q', 'R', 'S']);
          var byLab = {}; lines.forEach(function (L, i) { byLab[labels[i]] = L; });
          var pics = ['P', 'Q', 'R', 'S'].map(function (lab) { return '<div style="text-align:center;font-weight:600">Graph ' + lab + '</div>' + G({ x: [-5, 5], y: [-5, 5], max: 170, segs: [lineSeg(byLab[lab], 5)] }); });
          var rows = lines.map(function (L, i) { return { id: subs[i], html: '(' + subs[i] + ') ' + cap(lineText(L)) + '.' }; });
          var want = {}; lines.forEach(function (L, i) { want[subs[i]] = labels[i]; });
          return B.grid(figs(pics) + 'Choose the graph for each description.', rows, ['P', 'Q', 'R', 'S'].map(function (l) { return { id: l, html: l }; }), want,
            { why: function (id, got) { var L = byLab[got]; return { code: 'row', hint: 'Row (' + id + '): Graph ' + got + ' has ' + (L ? lineText(L) : 'other characteristics') + '. Check the slope sign first, then the intercepts.' }; }, colHead: 'Graph' },
            lines.map(function (L, i) { return '(' + subs[i] + ') Graph ' + labels[i] + ': ' + lineText(L) + '.'; }).join('<br>'),
            ['Check one characteristic at a time: rising / falling / flat / vertical first, then where it crosses each axis.'], 'match lines to descriptions');
        } }] },

      { num: '9', section: 'Multiple choice and numerical response', outcome: 'RF4', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '9', level: 'EMG', make: function (r) {
          var x4 = [0, 1, 2, 3], m = r.pick([-3, -2, 2, 3, 4]), b0 = m < 0 ? r.int(4, 8) : r.int(-3, 3), c = r.pick([1, 2, 3]), k = r.int(0, 3), d = r.pick([2, 3]), y0 = r.int(1, 4), xd = r.pick([[0, 2, 3, 5], [0, 1, 3, 4]]);
          var lin = x4.map(function (x) { return b0 + m * x; }), exy = x4.map(function (x) { return c * Math.pow(2, x); }), sq = x4.map(function (x) { return x * x + k; }), tr = xd.map(function (x, i) { return y0 + d * i; });
          var dd = diffs(xd);
          return mc(r, 'Which table of values represents a linear relation?', [
            { html: tbl(x4, lin), right: true },
            { html: tbl(x4, exy), why: t('y') + ' changes by ' + t(diffs(exy).join(',\\ ')) + ' — not constant (it doubles each time).' },
            { html: tbl(x4, sq), why: t('y') + ' changes by ' + t(diffs(sq).join(',\\ ')) + ' — not constant.' },
            { html: tbl(xd, tr), why: t('y') + ' changes by ' + t(d) + ' each time, but the ' + t('x') + '-steps are ' + t(dd.join(',\\ ')) + ', so the slopes are ' + t(dd.map(function (z) { return nT([d, z]); }).join(',\\ ')) + ' — not constant.' }],
            'Doubling table: changes ' + t(diffs(exy).join(',\\ ')) + ' — no. Squares table: changes ' + t(diffs(sq).join(',\\ ')) + ' — no. Uneven table: ' + t('\\frac{\\Delta y}{\\Delta x}=' + dd.map(function (z) { return nT([d, z]); }).join(',\\ ')) + ' — no.<br>The linear one: ' + t('x') + ' steps by ' + t('1') + ' and ' + t('y') + ' changes by ' + t(sgT(m)) + ' every time.',
            ['For each table, compare ' + t('\\frac{\\text{change in }y}{\\text{change in }x}') + ' — watch for unequal ' + t('x') + '-steps.'], 'which table is linear');
        } }] },
      { num: '10', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '10', level: 'EMG', make: function (r) {
          var s = r.pick(['negative', 'negative', 'positive']);
          return mc(r, 'A line has exactly one intercept, and its slope is ' + s + '. Which statement must be true?', [
            { html: 'The line passes through the origin.', right: true },
            { html: 'The line is horizontal.', why: 'A horizontal line has slope ' + t('0') + ', which is not ' + s + '.' },
            { html: 'The line is vertical.', why: 'A vertical line has an undefined slope, which is not ' + s + '.' },
            { html: 'The line is one of the axes.', why: 'An axis has infinitely many intercepts — every point on it is one.' }],
            'A ' + s + ' slope rules out horizontal (slope ' + t('0') + ') and vertical (undefined) lines, and an axis has infinitely many intercepts. A slanted line crosses both axes, so to have only one intercept it must cross them at the same point — the origin.',
            ['A slanted line always crosses both axes. When are those crossings the same point?'], 'one intercept + ' + s + ' slope');
        } }] },
      { num: '11', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '11', level: 'LIM', make: function (r) {
          var h = r.pick(nz(-5, 5)), k = r.pick(nz(-6, 6).filter(function (z) { return Math.abs(z) !== Math.abs(h); })), hor = r.chance(0.7);
          var oH = { html: 'domain ' + t(ALLX) + ', range ' + t('\\{' + k + '\\}') }, oV = { html: 'domain ' + t('\\{' + h + '\\}') + ', range ' + t(ALLY) }, oA = { html: 'domain ' + t(ALLX) + ', range ' + t(ALLY) }, oP = { html: 'domain ' + t('\\{' + h + '\\}') + ', range ' + t('\\{' + k + '\\}') };
          if (hor) { oH.right = true; oV.why = 'That describes the <b>vertical</b> line through the point.'; } else { oV.right = true; oH.why = 'That describes the <b>horizontal</b> line through the point.'; }
          oA.why = 'A ' + (hor ? 'horizontal' : 'vertical') + ' line uses only one ' + t(hor ? 'y' : 'x') + '-value.'; oP.why = 'That is just the single point ' + t(ptT([h, k])) + ', not a whole line.';
          return mc(r, 'The domain and range of the ' + (hor ? 'horizontal' : 'vertical') + ' line through ' + t(ptT([h, k])) + ' are', [oV, oH, oA, oP],
            hor ? 'Every point on the horizontal line has ' + t('y=' + k) + ', and the line runs left and right forever, so every ' + t('x') + ' is used: domain ' + t(ALLX) + ', range ' + t('\\{' + k + '\\}') + '.' : 'Every point on the vertical line has ' + t('x=' + h) + ', and the line runs up and down forever: domain ' + t('\\{' + h + '\\}') + ', range ' + t(ALLY) + '.',
            ['Which coordinate stays the same along the line?'], 'D and R of ' + (hor ? 'horizontal' : 'vertical') + ' line', true);
        } }] },
      { num: '12', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '12', level: 'EMG', make: function (r) {
          var s = r.pick([-1, -1, 1]), q = r.pick([1, 1, -1]), mg = function () { return r.pick([1, 1, 0.5]); };
          var Lc = { a: 2 * q, m: s * mg() }, L1 = { a: -2 * q, m: s * mg() }, L2 = { a: 0, m: s * r.pick([1, 2]) }, L3 = { a: 2 * q, m: -s * mg() };
          var pic = function (L) { return G({ x: [-4, 4], y: [-4, 4], max: 170, segs: [fullLine([L.a, 0], [L.a + 1, L.m], 4)] }); };
          var cond = 'a ' + signW(s) + ' slope and a ' + signW(q) + ' ' + t('x') + '-intercept';
          return mc(r, 'Which graph shows a line with ' + cond + '?', [
            { html: pic(Lc), right: true },
            { html: pic(L1), why: 'This one ' + (s < 0 ? 'falls' : 'rises') + ', but it crosses the ' + t('x') + '-axis at ' + t(-2 * q) + ', which is ' + signW(-q) + '.' },
            { html: pic(L2), why: 'This one ' + (s < 0 ? 'falls' : 'rises') + ', but its ' + t('x') + '-intercept is ' + t('0') + ', which is neither positive nor negative.' },
            { html: pic(L3), why: 'This one crosses the ' + t('x') + '-axis at ' + t(2 * q) + ', but it ' + (s < 0 ? 'rises' : 'falls') + ' from left to right.' }],
            'Check the slope sign (' + (s < 0 ? 'falls' : 'rises') + ' from left to right) and where the line crosses the ' + t('x') + '-axis (' + signW(q) + ' side). Only one graph does both: it crosses the ' + t('x') + '-axis at ' + t(2 * q) + '.',
            ['Check one characteristic at a time: first the slope sign, then the ' + t('x') + '-intercept.'], 'graph with ' + signW(s) + ' slope, ' + signW(q) + ' x-int');
        } }] },
      { num: '13', stem: '<i>(Numerical Response)</i> The table represents a linear relation.', parts: [
        { id: '13', level: 'PRG', make: function (r) {
          var x0 = r.pick([1, 2, 2, 3]), k = r.pick([2, 3, 3, 4]), m = r.pick([2, 3, 4, 5]), b = r.int(1, 9), xs = [x0, x0 + k, x0 + 2 * k], ys = xs.map(function (x) { return m * x + b; });
          return B.nr(tbl(xs, ys) + 'The ' + t('y') + '-intercept of its graph is ________.', b, function (v) {
            if (v === ys[0]) return { code: 'nr-first-y', hint: t(ys[0]) + ' is ' + t('y') + ' at ' + t('x=' + x0) + '. The ' + t('y') + '-intercept is ' + t('y') + ' at ' + t('x=0') + ' — step back.' };
            if (v === m) return { code: 'slope', hint: t(m) + ' is the slope. Use it to step back from ' + t(ptT([x0, ys[0]])) + ' to ' + t('x=0') + '.' };
            if (v === ys[0] - m * k) return { code: 'stepback', hint: 'You stepped back a whole column (' + t(k) + ' units of ' + t('x') + '). From ' + t('x=' + x0) + ' to ' + t('x=0') + ' is only ' + t(x0) + ' unit' + (x0 > 1 ? 's' : '') + '.' };
            if (v === ys[0] - m * k * x0) return { code: 'dy-only', hint: t('y') + ' rises ' + t(m * k) + ' for each ' + t(k) + ' in ' + t('x') + ' — that’s ' + t(m) + ' per unit. Step back ' + t(x0) + ' unit' + (x0 > 1 ? 's' : '') + ' from ' + t('x=' + x0) + '.' };
            return null;
          }, t('y') + ' rises ' + t(m * k) + ' for each ' + t(k) + ' in ' + t('x') + ': slope ' + t(qT(m * k, k) + '=' + m) + '. Step back from ' + t(ptT([x0, ys[0]])) + ' by ' + t(x0) + ' unit' + (x0 > 1 ? 's' : '') + ' of ' + t('x') + ': ' + t('y=' + ys[0] + '-' + x0 + '(' + m + ')=' + b) + ' at ' + t('x=0') + '.',
          ['Find the slope (change in ' + t('y') + ' ÷ change in ' + t('x') + '), then work back to ' + t('x=0') + '.'], 'y-int from table ' + xs.join(','));
        } }] },
      { num: '14', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '14', level: 'ADV', make: function (r) {
          var rt, t1, t2, V0, V1, V2, T;
          for (var g = 0; g < 400; g++) {
            rt = r.int(3, 9); t1 = r.int(1, 3); t2 = t1 + r.int(2, 4); V0 = r.int(rt * t2 + 6, 99); T = V0 / rt;
            var f = (T * 10) % 1; if (V0 % rt !== 0 && f > 0.08 && f < 0.92 && Math.abs(f - 0.5) > 0.08) break;
          }
          if (r.chance(0.2)) { rt = 7; t1 = 2; t2 = 5; V0 = 66; T = V0 / rt; }
          V1 = V0 - rt * t1; V2 = V0 - rt * t2;
          return B.approx('A generator burns fuel at a constant rate. After ' + t(t1) + ' h its tank holds ' + t(V1) + ' L, and after ' + t(t2) + ' h it holds ' + t(V2) + ' L. To the nearest tenth, the number of hours after starting until the tank is empty (the horizontal intercept of the graph) is ________.', T, 1,
            { nr: true, diag: function (v) {
              if (Math.abs(v - K.roundTo(V1 / rt, 1)) < 1e-9) return { code: 'nr-forgot-start', hint: 'That’s how long the fuel lasts <b>after</b> the ' + t(t1) + '-hour mark. Add the ' + t(t1) + ' h already run (or find the full tank at ' + t('t=0') + ').' };
              if (Math.abs(v - K.roundTo(V2 / rt, 1)) < 1e-9) return { code: 'nr-forgot-start', hint: 'That’s how long the fuel lasts after the ' + t(t2) + '-hour mark. Measure from the start, ' + t('t=0') + '.' };
              if (Math.abs(v - K.roundTo((V1 - rt * t1) / rt, 1)) < 1e-9) return { code: 'nr-start-sign', hint: 'Going back in time the tank held <b>more</b> fuel: at ' + t('t=0') + ' it had ' + t(V1 + '+' + t1 + '(' + rt + ')') + ' L.' };
              return null; } },
            'Slope ' + t('=\\dfrac{' + V2 + '-' + V1 + '}{' + t2 + '-' + t1 + '}=\\dfrac{' + (V2 - V1) + '}{' + (t2 - t1) + '}=-' + rt) + ' L/h. At ' + t('t=0') + ' the tank held ' + t(V1 + '+' + t1 + '(' + rt + ')=' + V0) + ' L.<br>Time to empty: ' + t(V0 + '\\div ' + rt + '\\approx ' + (Math.round(T * 1000) / 1000)) + ', so ' + t(K.roundTo(T, 1).toFixed(1)) + ' h.',
            ['Find the rate (slope) from the two readings, then the amount at ' + t('t=0') + '.', 'The tank is empty when the amount reaches ' + t('0') + ': divide the starting amount by the rate.'], 'generator empty time');
        } }] }
    ],

    extra: [
      { num: '1', section: 'Extra practice A — Is it linear?', outcome: 'RF4', shared: function (r) {
          var x0 = r.pick([1, 1, 2]), xs = [0, 2, 3, 7].map(function (d) { return x0 + d; }), m = r.pick([2, 3, 3, 4, -2, -3]), b = r.pick(nz(-5, 5));
          return { xs: xs, ys: xs.map(function (x) { return m * x + b; }), m: m, b: b, x0: x0 };
        },
        stem: function (o) { var dy = diffs(o.ys); return 'Jordan says the relation in this table is <b>not</b> linear, because the ' + t('y') + '-values go ' + (o.m > 0 ? 'up' : 'down') + ' by different amounts (' + t(dy.map(function (v) { return Math.abs(v); }).join(',\\ ')) + ').' + tbl(o.xs, o.ys); }, parts: [
        { id: 'e1a', level: 'PRG', make: function (r, o) {
          var dx = diffs(o.xs), dy = diffs(o.ys);
          return mc(r, 'Is Jordan correct? Choose the answer with the correct reasoning.', [
            { html: 'No. The ' + t('x') + '-steps are not equal, so compare rates: ' + t('\\frac{\\Delta y}{\\Delta x}') + ' is ' + t(o.m) + ' every time, so the relation <b>is</b> linear.', right: true },
            { html: 'Yes. In a linear relation the ' + t('y') + '-values always change by the same amount.', why: 'Only when the ' + t('x') + '-steps are equal. Here they are ' + t(dx.join(',\\ ')) + ', so divide each change in ' + t('y') + ' by its change in ' + t('x') + '.' },
            { html: 'Yes. A table can only be linear if its ' + t('x') + '-values go up in equal steps.', why: 'Uneven steps are fine — you just compare ' + t('\\frac{\\Delta y}{\\Delta x}') + ' instead of the changes in ' + t('y') + '.' },
            { html: 'No. The ' + t('y') + '-values always go ' + (o.m > 0 ? 'up' : 'down') + ', so the relation is linear.', why: 'Always going ' + (o.m > 0 ? 'up' : 'down') + ' isn’t enough — curves do that too. The rate of change has to be constant.' }],
            'The ' + t('x') + '-steps are ' + t(dx.join(',\\ ')) + ', so compare rates: ' + t(dy.map(function (d, i) { return qT(d, dx[i]); }).join('=') + '=' + o.m) + '. The rate is constant, so Jordan is wrong: the relation is linear.',
            ['Look at the ' + t('x') + '-values. Are the steps equal?'], 'Jordan uneven table');
        } },
        { id: 'e1b', level: 'PRG', make: function (r, o) {
          var y0 = o.ys[0], dy0 = o.ys[1] - o.ys[0];
          return B.number('State the ' + t('y') + '-intercept of its graph.', o.b, function (v) {
            if (v === y0) return { code: 'nr-first-y', hint: t(y0) + ' is ' + t('y') + ' at ' + t('x=' + o.x0) + ', not at ' + t('x=0') + '.' };
            if (v === y0 - dy0) return { code: 'stepback', hint: 'You stepped back a whole column (' + t('2') + ' units). From ' + t('x=' + o.x0) + ' to ' + t('x=0') + ' is ' + t(o.x0) + ' unit' + (o.x0 > 1 ? 's' : '') + '.' };
            if (v === o.m) return { code: 'slope', hint: t(o.m) + ' is the slope. Use it to step back to ' + t('x=0') + '.' };
            return null;
          }, 'Slope ' + t(o.m) + ' (from (a)). From ' + t(ptT([o.x0, y0])) + ' step back ' + t(o.x0) + ' unit' + (o.x0 > 1 ? 's' : '') + ' in ' + t('x') + ': ' + t('y=' + y0 + '-' + o.x0 + '(' + o.m + ')=' + o.b) + '.',
          ['Use the slope from (a): moving ' + t('1') + ' to the left changes ' + t('y') + ' by ' + t(sgT(-o.m)) + '.'], 'y-int, uneven table');
        } }] },
      { num: '2', outcome: 'RF4', stem: 'Complete the table so that it represents a linear relation. (Careful: the ' + t('x') + '-steps are not equal.)', parts: [
        { id: 'e2', level: 'ADV', make: function (r) {
          var p = r.pick([-5, -4, -2, -1, 1, 2, 4, 5]), b = r.int(-4, 6), xs = [-6, 0, 3, 9, 12], ys = xs.map(function (x) { return b + p * x / 3; });
          return fillPart('', xs, ys, [0, 2, 4], function (i) { return function (v) {
            var col = (ys[3] - ys[1]) / 2, colV = i === 0 ? b - col : i === 2 ? b + col : ys[3] + col;
            if (near(v, colV) && !near(colV, ys[i])) return { code: 'tb-step', hint: 'The columns are not equal steps: from ' + t('x=9') + ' to ' + t('x=12') + ' is ' + t('3') + ', but from ' + t('x=-6') + ' to ' + t('x=0') + ' is ' + t('6') + '. Use the change in ' + t('y') + ' <b>per unit</b> of ' + t('x') + '.' };
            if (v === b - p * xs[i] / 3) return { code: 'tb-sign', hint: 'Check the direction: as ' + t('x') + ' increases, ' + t('y') + ' goes ' + (p < 0 ? 'down' : 'up') + '.' };
            return null; }; },
            'From ' + t('x=0') + ' to ' + t('x=9') + ', ' + t('y') + ' changes by ' + t(sgT(ys[3] - ys[1])) + ', so the slope is ' + t(qT(ys[3] - ys[1], 9) + '=' + nT([p, 3])) + ': ' + t(sgT(p)) + ' for every ' + t('3') + ' in ' + t('x') + '.<br>' + t('x=-6') + ' is two such steps left of ' + t('0') + ': ' + t(ys[0]) + '. ' + t('x=3') + ': ' + t(ys[2]) + '. ' + t('x=12') + ': ' + t(ys[4]) + '.',
            ['Use the two known values to find the slope: change in ' + t('y') + ' ÷ change in ' + t('x') + '.', 'Then for each missing value, multiply the slope by how far ' + t('x') + ' moves.'], 'complete uneven linear table');
        } }] },
      { num: '3', section: 'Extra practice B — Intercepts, slope, domain and range', stem: 'Use the graph.', parts: [
        { id: 'e3', level: 'EMG', make: function (r) { var q = r.pick([1, 2, 3]), pp = r.pick([-3, -2, -1, 1, 2, 3].filter(function (z) { return gcd(z, q) === 1 && !(q === 1 && Math.abs(z) === 1); })); return readGraphPart({ kind: 'o', m: [pp, q] }); } }] },
      { num: '4', stem: 'The table represents a linear relation. Neither intercept is in the table.', parts: [
        { id: 'e4', level: 'ADV', make: function (r) {
          var xs = [1, 3, 5, 7], m, b, X;
          for (var g = 0; g < 300; g++) { m = r.pick([-3, -2, 2, 3]); b = r.pick(nz(-9, 9)); X = -b / m; if (Math.abs(b) >= 3 && xs.indexOf(X) < 0 && X !== 0 && Math.abs(X) <= 12 && xs.map(function (x) { return m * x + b; }).indexOf(0) < 0) break; }
          var ys = xs.map(function (x) { return m * x + b; }), Xf = ex.norm(-b, m);
          var p = B.fields(tbl(xs, ys) + 'State both intercepts (exact values).', [fMath(t('x') + '-intercept:', 'e.g. 9/2', 'fraction', false), fMath(t('y') + '-intercept:', 'e.g. -4', 'fraction', false)],
            [valChk(X, { v: 'x', other: b }), valChk(b, { v: 'y', other: X, diag: function (v) { if (v === ys[0] - 2 * m) return { code: 'stepback', hint: 'You stepped back a whole column (' + t('2') + ' units). From ' + t('x=1') + ' to ' + t('x=0') + ' is just ' + t('1') + ' unit.' }; if (v === ys[0]) return { code: 'nr-first-y', hint: t(ys[0]) + ' is ' + t('y') + ' at ' + t('x=1') + '.' }; return null; } })],
            [nT(Xf), String(b)], t('x') + '-intercept ' + t(nT(Xf)) + ', ' + t('y') + '-intercept ' + t(b),
            'Slope: ' + t(qT(2 * m, 2) + '=' + m) + '. ' + t('y') + '-intercept: from ' + t(ptT([1, ys[0]])) + ' step back ' + t('1') + ': ' + t(ys[0] + '-(' + m + ')=' + b) + '.<br>' + t('x') + '-intercept: ' + t('y') + ' must change by ' + t(sgT(-b)) + ' from ' + t(ptT([0, b])) + ', so ' + t('x') + ' must change by ' + t(qT(-b, m) + '=' + nT(Xf)) + '. So the ' + t('x') + '-intercept is ' + t(nT(Xf)) + '.',
            ['Find the slope first (per unit of ' + t('x') + ').', 'From the ' + t('y') + '-intercept, how far must ' + t('x') + ' move for ' + t('y') + ' to reach ' + t('0') + '?'], 'intercepts, neither in table');
          p.bad = [[String(b), nT(Xf)]];
          if (Math.abs(rv(Xf) * 10 % 1) < 1e-9 && rv(Xf) % 1 !== 0) p.good = [[dT(rv(Xf)), String(b)]];
          return p;
        } }] },
      { num: '5', stem: 'The graph shows a line segment. One endpoint is closed and one is open.', parts: [
        { id: 'e5', level: 'PRG', make: function (r) {
          var x1 = r.int(-5, -2), x2 = r.int(2, 5), y1, y2;
          for (var g = 0; g < 100; g++) { y1 = r.int(-4, 5); y2 = r.int(-4, 5); if (Math.abs(y1 - y2) >= 3) break; }
          var openRight = r.chance(0.6), sL = openRight ? 'closed' : 'open', sR = openRight ? 'open' : 'closed';
          var Dd = between('x', x1, x2, openRight ? '\\le ' : '<', openRight ? '<' : '\\le ');
          var lo = Math.min(y1, y2), hi = Math.max(y1, y2), loOpen = (lo === y2) === openRight, R = between('y', lo, hi, loOpen ? '<' : '\\le ', loOpen ? '\\le ' : '<');
          var figS = fig(G({ segs: [{ pts: [[x1, y1], [x2, y2]], start: sL, end: sR }] }));
          return drPart(figS + 'State the domain and the range.', Dd, R,
            { rWrong: x1 === lo && x2 === hi ? [] : [{ is: between('y', x1, x2), code: 'set-xy', hint: 'The range uses the ' + t('y') + '-coordinates of the endpoints.' }],
              bad: [[between('x', x1, x2), between('y', lo, hi)], [Dd, between('y', lo, hi)]] },
            'The segment runs from ' + t(ptT([x1, y1])) + ' (' + sL + ' dot) to ' + t(ptT([x2, y2])) + ' (' + sR + ' dot). An open dot means that value is <b>not</b> included (' + t('<') + ').<br>Domain ' + t(Dd) + ', Range ' + t(R) + '.',
            ['Read the endpoints. A solid dot is included (' + t('\\le') + '), an open dot is not (' + t('<') + ').', 'For the range, the smaller ' + t('y') + '-value goes first — keep track of which endpoint it belongs to.'], 'D and R of segment with open end');
        } }] },
      { num: '6', section: 'Extra practice C — Linear relations in context', shared: e6Shared,
        stem: function (o) { var c = o.c; return c.what + ' ' + c.start(o.S) + '. It ' + c.act + ' at a steady ' + t(o.rate + (c.vu === '%' ? '\\%' : '')) + U(c) + ' per ' + c.tw + ' until ' + c.zero.replace(/^the \w+ (is|has)/, 'it $1') + '. Let ' + t(c.v) + ' be its ' + c.vq + ' (' + c.vu + ') after ' + t('t') + ' ' + c.tq + '.'; }, parts: [
        { id: 'e6a', level: 'PRG', make: function (r, o) {
          var c = o.c;
          var p = B.fields('Determine both intercepts of the graph of ' + t(c.v) + ' against ' + t('t') + '.', [fNum(t(c.v) + '-intercept:', '', c.vu), fNum(t('t') + '-intercept:', '', c.tu)],
            [valChk(o.S, { v: c.v, w: 't', axisX: false, other: o.N }), valChk(o.N, { v: 't', w: c.v, axisX: true, other: o.S, diag: function (v) { if (near(v, o.S * o.rate)) return { code: 'value', hint: 'Divide, don’t multiply: how many ' + c.tq + ' does it take to lose ' + t(o.S) + ' ' + c.vu + ' at ' + t(o.rate) + ' per ' + c.tw + '?' }; return null; } })],
            [String(o.S), String(o.N)], t(c.v) + '-intercept ' + t(o.S) + ' ' + c.vu + ', ' + t('t') + '-intercept ' + t(o.N) + ' ' + c.tu,
            t(c.v) + '-intercept (at ' + t('t=0') + '): ' + t(o.S) + ' ' + c.vu + ', the starting ' + c.vq + '.<br>' + t('t') + '-intercept (where ' + t(c.v + '=0') + '): ' + t(o.S + '\\div ' + o.rate + '=' + o.N) + ' ' + c.tq + ' — when ' + c.zero + '.',
            ['The vertical intercept is the starting value.', 'The horizontal intercept is when the ' + c.vq + ' reaches ' + t('0') + ': starting amount ÷ rate.'], 'context intercepts ' + c.what);
          p.bad = [[String(o.N), String(o.S)]];
          return p;
        } },
        { id: 'e6b', level: 'PRG', make: function (r, o) {
          var c = o.c;
          return mc(r, 'What is the slope of the graph, and what does it mean?', [
            { html: t('-' + o.rate) + ' ' + c.vu + '/' + c.tu + ': the ' + c.vq + ' goes down by ' + t(o.rate) + ' ' + c.vu + ' every ' + c.tw + '.', right: true },
            { html: t(o.rate) + ' ' + c.vu + '/' + c.tu + ': the ' + c.vq + ' goes up by ' + t(o.rate) + ' ' + c.vu + ' every ' + c.tw + '.', why: 'The ' + c.vq + ' is decreasing, so the graph falls: the slope is negative.' },
            { html: t('-' + o.rate) + ' ' + c.tu + '/' + c.vu + ': it takes ' + t(o.rate) + ' ' + c.tq + ' to lose each ' + c.vu + '.', why: 'Units upside down: slope = change in ' + t(c.v) + ' (' + c.vu + ') ÷ change in ' + t('t') + ' (' + c.tu + '), so it is ' + c.vu + ' per ' + c.tw + '.' },
            { html: t('-' + o.N) + ' ' + c.vu + '/' + c.tu + ': it lasts ' + t(o.N) + ' ' + c.tq + '.', why: t(o.N) + ' ' + c.tq + ' is the ' + t('t') + '-intercept (how long it lasts), not the rate of change.' }],
            'Slope = change in ' + t(c.v) + ' ÷ change in ' + t('t') + ' = ' + t('-' + o.rate) + ' ' + c.vu + ' per ' + c.tw + ': the ' + c.vq + ' drops ' + t(o.rate) + ' ' + c.vu + ' each ' + c.tw + '.',
            ['A slope’s units are (units of the vertical variable) per (unit of the horizontal variable).'], 'context slope meaning ' + c.what);
        } },
        { id: 'e6c', level: 'ADV', make: function (r, o) {
          var c = o.c, Dd = between('t', 0, o.N), R = between(c.v, 0, o.S);
          return drPart('State the domain and range for this situation.', Dd, R,
            { v: 't', w: c.v, dWrong: [{ is: '\\{t\\mid t\\ge 0,\\ t\\in\\mathbb{R}\\}', code: 'set-arrow', hint: 'It stops when ' + c.zero + ' — the domain ends at the ' + t('t') + '-intercept.' }, { is: '\\{t\\mid t\\in\\mathbb{R}\\}', code: 'set-arrow', hint: 'Negative times and times after ' + c.zero + ' make no sense here.' }],
              rWrong: [{ is: '\\{' + c.v + '\\mid ' + c.v + '\\in\\mathbb{R}\\}', code: 'set-arrow', hint: 'The ' + c.vq + ' only runs from the starting value down to ' + t('0') + '.' }],
              bad: [['\\{t\\mid t\\in\\mathbb{R}\\}', '\\{' + c.v + '\\mid ' + c.v + '\\in\\mathbb{R}\\}'], [R, Dd]] },
            'Time runs from ' + t('0') + ' until ' + c.zero + ' (' + t('t=' + o.N) + '); the ' + c.vq + ' runs from ' + t(o.S) + ' down to ' + t('0') + ':<br>Domain ' + t(Dd) + ', Range ' + t(R) + '.',
            ['The situation starts at ' + t('t=0') + ' and ends at the ' + t('t') + '-intercept from (a).'], 'context D and R ' + c.what);
        } }] },
      { num: '7', section: 'Extra practice D — Which lines are possible?', parts: [
        { id: 'e7a', level: 'ADV', make: function (r) {
          var ss = r.pick([-1, 1]), qx = r.pick([-1, 1]), qy = ss < 0 ? qx : -qx;
          var sw = function (s) { return s < 0 ? '<0' : '>0'; };
          var p = B.graph('Sketch a line with slope ' + t(sw(ss)) + ', ' + t('x') + '-intercept ' + t(sw(qx)) + ' and ' + t('y') + '-intercept ' + t(sw(qy)) + '.' + PAD_HELP, pad(), sketchChk(twoIntRule(qx, qy, ss)), lineDr([3 * qx, 0], [0, 2 * qy]),
            'Answers vary. Put the ' + t('x') + '-intercept on the ' + signW(qx) + ' side and the ' + t('y') + '-intercept on the ' + signW(qy) + ' side, e.g. through ' + t(ptT([3 * qx, 0])) + ' and ' + t(ptT([0, 2 * qy])) + '. The slope is then ' + t(qT(2 * qy, -3 * qx) + '=' + nT([-2 * qy, 3 * qx])) + ', which is ' + signW(ss) + ' ✓.',
            ['Choose the two intercept points first, then check that the line through them ' + (ss < 0 ? 'falls' : 'rises') + '.'], 'sketch with sign conditions');
          p.good = [lineDr([qx, 0], [0, 4 * qy])];
          p.bad = [lineDr([3 * qx, 0], [0, -2 * qy]), lineDr([-3 * qx, 0], [0, 2 * qy]), lineDr([0, 0], [1, ss]), lineDr([3 * qx, 0], [0, 2 * qy], 'closed', 'closed')];
          return p;
        } },
        { id: 'e7b', level: 'PRG', make: function (r) {
          var ss = r.pick([-1, 1]), qx = r.pick([-1, 1]), qy = ss < 0 ? -qx : qx;   // an impossible combination
          var sw = function (s) { return s < 0 ? '<0' : '>0'; }, ex1 = [2 * qx, 0], ex2 = [0, 3 * qy], exS = nT([-3 * qy, 2 * qx]);
          var okY = ss < 0 ? qx : -qx;
          return mc(r, 'Is a line with slope ' + t(sw(ss)) + ', ' + t('x') + '-intercept ' + t(sw(qx)) + ' and ' + t('y') + '-intercept ' + t(sw(qy)) + ' possible? Choose the answer with the correct reasoning.', [
            { html: 'No. Through ' + t('(a,\\ 0)') + ' and ' + t('(0,\\ b)') + ' the slope is ' + t('-\\frac{b}{a}') + '; with ' + t('a' + sw(qx)) + ' and ' + t('b' + sw(qy)) + ' that is always ' + signW(-ss) + '.', right: true },
            { html: 'Yes — for example the line through ' + t(ptT(ex1)) + ' and ' + t(ptT(ex2)) + '.', why: 'Work out that line’s slope: ' + t(qT(3 * qy, -2 * qx) + '=' + exS) + ', which is ' + signW(-ss) + ', not ' + signW(ss) + '.' },
            { html: 'Yes — the slope and the intercepts don’t depend on each other.', why: 'They do: from ' + t('(a,\\ 0)') + ' to ' + t('(0,\\ b)') + ' the slope is ' + t('\\frac{b-0}{0-a}=-\\frac{b}{a}') + ', so the signs of the intercepts decide the sign of the slope.' },
            { html: 'No — no line can have a ' + signW(ss) + ' slope and a ' + signW(qx) + ' ' + t('x') + '-intercept.', why: 'That part is possible: the line through ' + t(ptT([2 * qx, 0])) + ' and ' + t(ptT([0, 3 * okY])) + ' has both. It is the third condition that can’t also be met.' }],
            'From ' + t('(a,\\ 0)') + ' to ' + t('(0,\\ b)') + ': slope ' + t('=\\frac{b-0}{0-a}=-\\frac{b}{a}') + '. A ' + signW(ss) + ' slope needs ' + (ss < 0 ? t('a') + ' and ' + t('b') + ' with the <b>same</b> sign' : t('a') + ' and ' + t('b') + ' with <b>opposite</b> signs') + ', but here they are ' + (qx === qy ? 'the same' : 'opposite') + '. So it is <b>not possible</b>.',
            ['Try to sketch it: put the intercepts on the given sides and look at which way the line slants.'], 'impossible sign combination');
        } }] },
      { num: '8', section: 'Extra practice E — Recognizing linear relations', outcome: 'RF4', parts: [
        { id: 'e8', level: 'EMG', make: function (r) {
          var m = r.pick([2, 3, -2, -3]), a = r.int(-3, 4), lp = [-2, 1, 3, 4].map(function (x) { return [x, a + m * (x + 2)]; });
          var npk = r.pick(['sq', 'dbl']), np = npk === 'sq' ? [0, 1, 2, 3].map(function (x) { return [x, x * x + 1]; }) : [0, 1, 2, 3].map(function (x) { return [x, 3 * Math.pow(2, x)]; });
          var pairsT = function (ps) { return ps.map(function (p, i) { return t((i === 0 ? '\\{' : '') + ptT(p) + (i === ps.length - 1 ? '\\}' : '')); }).join(', '); };
          var wl = r.pick([['A taxi charges $' + r.int(3, 5) + ' plus $2 for every kilometre.', 'Each extra kilometre always adds the same $2: a constant rate.'], ['A pool fills with water at ' + r.pick([20, 30, 40]) + ' L every minute.', 'The same amount is added every minute: a constant rate.'], ['A seedling ' + r.int(3, 8) + ' cm tall grows 2 cm every week.', 'It grows the same 2 cm each week: a constant rate.']]);
          var wn = r.pick([['A population of bacteria doubles every hour.', 'Doubling adds more each hour (2, 4, 8, …) — the rate isn’t constant.'], ['The area of a square, as its side length increases.', 'Area = side²: going from side 1 to 2 to 3 adds 3, then 5 — not constant.'], ['The height of a ball that is thrown up and falls back down.', 'It goes up and then down — a straight line can’t do that.']]);
          var items = r.shuffle([{ html: pairsT(lp), w: 'lin', why: 'The ' + t('x') + '-steps are ' + t('3,\\ 2,\\ 1') + ', and ' + t('\\frac{\\Delta y}{\\Delta x}=' + m) + ' every time: linear.' }, { html: pairsT(np), w: 'non', why: t('y') + ' changes by ' + t(diffs(np.map(function (p) { return p[1]; })).join(',\\ ')) + ' for equal steps of ' + t('1') + ': not linear.' }, { html: wl[0], w: 'lin', why: wl[1] }, { html: wn[0], w: 'non', why: wn[1] }]);
          var rows = items.map(function (it, i) { return { id: 'r' + i, html: it.html }; }), want = {}; items.forEach(function (it, i) { want['r' + i] = it.w; });
          return B.grid('Is each relation linear?', rows, [{ id: 'lin', html: 'Linear' }, { id: 'non', html: 'Not linear' }], want,
            { why: function (id) { var it = items[Number(id.slice(1))]; return { code: 'row', hint: it.why }; } },
            items.map(function (it) { return it.html.replace(/\.$/, '') + ': ' + (it.w === 'lin' ? '<b>linear</b>' : '<b>not linear</b>') + ' — ' + it.why; }).join('<br>'),
            ['Linear means a constant rate of change: equal steps in the input always give equal changes in the output.'], 'linear or not: pairs and words');
        } }] },
      { num: '9', section: 'Extra practice F — Intercepts from a table', stem: '<i>(Numerical Response)</i> The table represents a linear relation.', parts: [
        { id: 'e9', level: 'PRG', make: function (r) {
          var xs = [0, 2, 4, 6], m = r.pick([-3, -2, 2, 3]), X = r.pick([7, 8, 9, 10, 11, 5].filter(function (z) { return xs.indexOf(z) < 0; })), b = -m * X, ys = xs.map(function (x) { return m * x + b; });
          return B.nr(tbl(xs, ys) + 'The ' + t('x') + '-intercept of its graph is ________.', X, function (v) {
            if (v === Math.abs(b)) return { code: 'int-swap', hint: t(b) + ' is the ' + t('y') + '-intercept (the value at ' + t('x=0') + '). The ' + t('x') + '-intercept is where ' + t('y=0') + '.' };
            if (v === 6) return { code: 'ctx-table-end', hint: 'At ' + t('x=6') + ', ' + t('y=' + ys[3]) + ', not ' + t('0') + '. Keep going past the table.' };
            if (v === Math.abs(b) / (2 * Math.abs(m))) return { code: 'dy-only', hint: t('y') + ' changes by ' + t(sgT(2 * m)) + ' for each ' + t('2') + ' in ' + t('x') + ' — that’s ' + t(sgT(m)) + ' per unit.' };
            return null;
          }, 'Slope: ' + t(qT(2 * m, 2) + '=' + m) + '. From ' + t(ptT([0, b])) + ', ' + t('y') + ' must change by ' + t(sgT(-b)) + ' to reach ' + t('0') + ': that takes ' + t(qT(-b, m) + '=' + X) + ' units. The ' + t('x') + '-intercept is ' + t(X) + '.',
          ['Find the change in ' + t('y') + ' per unit of ' + t('x') + ', then count how many units it takes to reach ' + t('y=0') + '.'], 'x-int beyond the table');
        } }] },
      { num: '10', stem: 'Slope from the intercepts.', parts: [
        { id: 'e10', level: 'EMG', make: function (r) {
          var a, b;
          for (var g = 0; g < 100; g++) { a = r.pick([-6, -5, -4, -3, -2, 2, 3, 4, 5, 6]); b = r.pick([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]); if (Math.abs(a) !== Math.abs(b)) break; }
          var sl = ex.norm(-b, a);
          var p = B.slope('The ' + t('x') + '-intercept is ' + t(a) + ' and the ' + t('y') + '-intercept is ' + t(b) + '. What is the slope of the line?', sl, { diag: function (v) { if (near(v, b)) return { code: 'slope', hint: t(b) + ' is the ' + t('y') + '-intercept. The slope is rise ÷ run between ' + t(ptT([a, 0])) + ' and ' + t(ptT([0, b])) + '.' }; return null; } },
            'The line passes through ' + t(ptT([a, 0])) + ' and ' + t(ptT([0, b])) + '. ' + t('m=\\dfrac{' + b + '-0}{0-' + (a < 0 ? '(' + a + ')' : a) + '}=' + nT(sl)) + '.',
            ['Write the intercepts as points: ' + t('(a,\\ 0)') + ' and ' + t('(0,\\ b)') + '. Then slope = rise ÷ run.', 'Sketch it: does the line rise or fall?'], 'slope from intercepts');
          p.bad = [nT([b, a]), nT([a, b]), String(b)].filter(function (x) { return x !== nT(sl); });
          return p;
        } }] },
      { num: '11', stem: 'How many intercepts does each line have?', parts: [
        { id: 'e11', level: 'PRG', make: function (r) {
          var h = r.pick(nz(-5, 5)), k = r.pick(nz(-5, 5)), p0 = r.pick([[2, 3], [1, -2], [-3, 1], [3, -1]]), a = r.pick(nz(-4, 4)), b = r.pick(nz(-4, 4));
          var infs = [{ html: 'The vertical line through ' + t(ptT([0, k])), w: 'inf', why: 'The vertical line through a point with ' + t('x=0') + ' is the ' + t('y') + '-axis itself: every point on it is a ' + t('y') + '-intercept.' },
            { html: 'The horizontal line through ' + t(ptT([h, 0])), w: 'inf', why: 'The horizontal line through a point with ' + t('y=0') + ' is the ' + t('x') + '-axis itself: infinitely many intercepts.' }];
          var ones = [{ html: 'The horizontal line through ' + t(ptT([h, k])), w: '1', why: 'A horizontal line other than the ' + t('x') + '-axis meets only the ' + t('y') + '-axis, once.' },
            { html: 'The vertical line through ' + t(ptT([h, k])), w: '1', why: 'A vertical line other than the ' + t('y') + '-axis meets only the ' + t('x') + '-axis, once.' }];
          var items = r.shuffle([r.pick(infs), r.pick(ones), { html: 'The line through ' + t('(0,\\ 0)') + ' and ' + t(ptT(p0)), w: '1', why: 'It crosses both axes at the same point, the origin: one intercept.' },
            { html: 'The line through ' + t(ptT([a, 0])) + ' and ' + t(ptT([0, b])), w: '2', why: 'It crosses the ' + t('x') + '-axis at ' + t(a) + ' and the ' + t('y') + '-axis at ' + t(b) + ': two intercepts.' }]);
          var rows = items.map(function (it, i) { return { id: 'r' + i, html: it.html }; }), want = {}; items.forEach(function (it, i) { want['r' + i] = it.w; });
          return B.grid('Choose the number of intercepts for each line.', rows, [{ id: '0', html: t('0') }, { id: '1', html: t('1') }, { id: '2', html: t('2') }, { id: 'inf', html: 'infinitely many' }], want,
            { why: function (id, got) { var it = items[Number(id.slice(1))]; return { code: got === '0' ? 'row-zero' : 'row', hint: (got === '0' ? 'Every line crosses at least one axis, so no line has 0 intercepts. ' : '') + it.why }; } },
            items.map(function (it) { return it.html + ': ' + (it.w === 'inf' ? 'infinitely many' : it.w) + ' — ' + it.why; }).join('<br>'),
            ['Sketch each line quickly. Watch out for lines that are one of the axes.'], 'number of intercepts');
        } }] }
    ]
  });
})(window);
