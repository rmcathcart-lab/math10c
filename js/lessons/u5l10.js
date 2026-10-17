/* Math 10C · Unit 5 · Lesson 10 — Relations and Functions Review: Domain, Range, and Function Notation
 * (cumulative review — each part is tagged with the outcome it tests: RF1 situations, graphs, intercepts, rates;
 * RF2 relations, functions, domain and range; RF8 function notation)
 * Assignment questions 1–20 (u5_L10.tex: multiple choice 1–7, numerical response 8–9, written response 10–16 and the
 * Extension 17–20) and the whole Lesson 10 Extra Practice (u5_EP10.tex, Q1–20).
 * Every part is a generator that keeps the booklet question's structure (signs, which endpoint is hollow, a value
 * reached twice, a flat piece, a stopping point in a context, a fraction answer) and changes the numbers; the booklet's
 * numbers are among the possible values. Sketches become multiple choice between small graphs; "explain" items become
 * multiple choice with misconception hints; calculator items ask for the values the calculator finds.
 * Levels follow LEVEL_RUBRIC.md (recognition formats one level below the constructed task, capped at PRG). */
(function (root) {
  'use strict';
  var HW = root.HW, ex = HW.ex, F = HW.fmt, K = HW.kit, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form, B = K.P, S = HW.sets, PL = HW.poly;

  HW.addCodes({
    'xint-yint': 'Gave the y-intercept for the x-intercept', 'int-swap': 'x- and y-intercepts mixed up', 'pt-said-none': 'Said “none” (there is one)', 'pt-not-none': 'Gave a point that doesn’t exist',
    'pt-missing': 'Missed an intercept', 'pt-extra': 'Extra point', 'no-divide': 'Didn’t divide by the coefficient', 'ev-instead': 'Evaluated instead of solving', 'solve-instead': 'Solved instead of evaluating',
    'sq-neg': 'Squared a negative as negative', 'ev-sign': 'Sign error with a negative input', 'mn-swap': 'm and n swapped', 'mn-sign': 'Sign error solving for m',
    'win-cut': 'Window cuts off part of the graph', 'win-huge': 'Window far too large', 'win-order': 'Min not less than max', 'win-scl': 'Unusable scale', 'win-nan': 'Window value not a number',
    'max-swap': 'Height and time swapped', 'neg-root': 'Kept the root before the throw', 'no-platform': 'Ignored the starting height', 'rate-flip': 'Rate as time ÷ distance',
    'rate-sign': 'Rate of a return trip with the wrong sign', 'rate-point': 'Divided a coordinate instead of a change', 'same-time': 'Gave the same time again', 'end-time': 'Gave the end of the dive',
    'start-h': 'Gave the starting height', 'nr-unsimp': 'Fraction not simplified before reading p', 'nr-denom': 'Gave the denominator', 'shift-add': 'Added the shift instead of substituting',
    'sq-split': 'Squared a binomial without the middle term', 'abc-sum': 'Added instead of a − b − c', 'used-y': 'Solved for the y-intercept', 'no-root': 'Didn’t take the square root',
    'dom-real': 'Used ∈ R for a count', 'dom-n': 'Natural numbers leave out 0', 'not-between': 'Value outside the range of the bounds', 'is-produced': 'That value is produced',
    'not-in-range': 'Value outside the range', 'in-f-range': 'Value already in the first range', 'x-wrong': 'Input does not give that output', 'not-between-d': 'Number outside the domain’s span',
    'in-domain': 'Number is in the domain', 'sol-interval': 'Missed the flat piece of solutions', 'sol-point-only': 'Missed the single solution', 'f-sum': 'Added the inputs’ outputs wrongly'
  });

  /* ---------------- numbers and LaTeX ---------------- */
  function cl(x) { return Math.round(x * 1e6) / 1e6; }
  function same(a, b) { return Math.abs(a - b) < 1e-9; }
  function nf(x) { return String(cl(x)); }
  function uniq(a) { var s = a.slice().sort(function (x, y) { return x - y; }); return s.filter(function (x, i) { return i === 0 || Math.abs(x - s[i - 1]) > 1e-9; }); }
  function sorted(a) { for (var i = 1; i < a.length; i++) if (a[i] < a[i - 1]) return false; return true; }
  function rng(a, b) { var o = []; for (var i = a; i <= b; i++) o.push(i); return o; }
  function nz(a, b) { return rng(a, b).filter(function (x) { return x !== 0; }); }
  function gcd(a, b) { return ex.gcd(Math.abs(a), Math.abs(b)); }
  function frT(p, q) { return ex.texRat(ex.norm(p, q)); }
  function dfr(s) { return String(s).replace(/\\frac/g, '\\dfrac'); }
  function ptT(p) { return '(' + nf(p[0]) + ',\\ ' + nf(p[1]) + ')'; }
  function ptK(p) { return '(' + nf(p[0]) + ', ' + nf(p[1]) + ')'; }
  function par(x) { return x < 0 ? '(' + nf(x) + ')' : nf(x); }
  function num(s) { var p = HW.parse.number(String(s == null ? '' : s)); return p.ok ? p.value : null; }
  function term(c, v, first) {
    var neg, mag;
    if (Array.isArray(c)) { var n = ex.norm(c[0], c[1]); neg = n[0] < 0; var p = Math.abs(n[0]), q = n[1]; mag = q === 1 ? (p === 1 && v ? '' : String(p)) : '\\frac{' + p + '}{' + q + '}'; }
    else { neg = c < 0; var a = Math.abs(c); mag = a === 1 && v ? '' : String(cl(a)); }
    return (neg ? '-' : first ? '' : '+') + mag + v;
  }
  /* expression in the order given: [[coef, 'x'], [coef, '']]; coef a number or [p, q]; zero terms dropped */
  function lin(ts) { var out = ''; ts.forEach(function (x) { var z = Array.isArray(x[0]) ? x[0][0] === 0 : x[0] === 0; if (!z) out += term(x[0], x[1], out === ''); }); return out || '0'; }
  function P(tex) { return PL.parse(tex); }
  /* one MC option list must not show the same thing twice (a generator bug the tests then catch) */
  function distinct(opts) { var seen = {}; opts.forEach(function (o) { if (seen[o.html]) throw new Error('duplicate MC option ' + o.html); seen[o.html] = 1; }); return opts; }
  function pick2(r, a) { return r.sample(a, 2); }

  /* ---------------- sets (domain and range) ---------------- */
  function lst(a) { return '\\{' + uniq(a).map(nf).join(', ') + '\\}'; }
  function cond(v, lo, hi, lc, hc) {
    lc = lc !== false; hc = hc !== false;
    if (lo == null && hi == null) return '';
    if (lo == null) return v + (hc ? '\\le ' : '<') + nf(hi);
    if (hi == null) return v + (lc ? '\\ge ' : '>') + nf(lo);
    return nf(lo) + (lc ? '\\le ' : '<') + v + (hc ? '\\le ' : '<') + nf(hi);
  }
  function bld(v, lo, hi, lc, hc) { var c = cond(v, lo, hi, lc, hc); return '\\{' + v + '\\mid ' + (c ? c + ',\\ ' : '') + v + '\\in\\mathbb{R}\\}'; }
  function all(v) { return bld(v, null, null); }
  function ivAlt(tex) {
    var p = S.parse(tex); if (!p.ok || p.set.kind !== 'int' || p.set.parts.length !== 1) return tex;
    var q = p.set.parts[0], n = function (x) { return x === Infinity ? '\\infty' : x === -Infinity ? '-\\infty' : nf(x); };
    return (q.lc ? '[' : '(') + n(q.lo) + ', ' + n(q.hi) + (q.hc ? ']' : ')');
  }
  function ineqAlt(tex, v) {
    var p = S.parse(tex); if (!p.ok || p.set.kind !== 'int' || p.set.parts.length !== 1) return tex;
    var q = p.set.parts[0];
    if (q.lo === -Infinity && q.hi === Infinity) return v + '\\in\\mathbb{R}';
    return cond(v, q.lo === -Infinity ? null : q.lo, q.hi === Infinity ? null : q.hi, q.lc, q.hc);
  }
  /* the raw values of a typed list {a, b, c} (repeats kept), or null if it isn't a plain list */
  function listRaw(resp) {
    var s = String(resp || '').replace(/\\(left|right)\.?/g, '').replace(/\\lbrace|\\\{/g, '{').replace(/\\rbrace|\\\}/g, '}');
    s = s.replace(/^\s*(\\text\{)?\s*(domain|range)\s*\}?\s*[:=]?\s*/i, '').replace(/^\s*[DR]\s*[:=]\s*/, '');
    var m = /^\s*\{([^{}]*)\}\s*$/.exec(s); if (!m || /\\mid|\||:|\\vert/.test(m[1])) return null;
    var out = [], ps = m[1].split(/[,;]/);
    for (var i = 0; i < ps.length; i++) {
      var p = ps[i].replace(/\\[,;: ]/g, '').trim(); if (!p) return null;
      var q = ex.parse(p); if (!q.ok) return null; var v = ex.value(q.ast); if (!isFinite(v)) return null; out.push(v);
    }
    return out;
  }
  /* K.set plus the booklet's list rules (each value once, increasing order); o.wrong entries equal to the target dropped */
  function setChk(target, o) {
    o = o || {};
    var T = S.parse(target).set;
    var wr = (o.wrong || []).filter(function (w) { var p = S.parse(w.is); return p.ok && !S.eq(p.set, T); });
    var base = K.set(target, { v: o.v, other: o.other, otherName: o.otherName, wrong: wr, tag: o.tag, forms: o.forms });
    return function (resp) {
      var r = base(resp);
      if (r.v === 'correct') {
        var L = listRaw(resp);
        if (L && L.length > 1) {
          var dup = L.some(function (x, i) { return L.some(function (y, j) { return j < i && Math.abs(x - y) < 1e-9; }); });
          if (dup) return form('set-repeat', 'Right values — but write each value <b>only once</b> in a list, even when it comes from several points.');
          if (!sorted(L)) return form('set-order', 'Right values — now write the list in <b>increasing order</b> (smallest first).');
        }
      }
      return r;
    };
  }
  function ph(v) { return 'e.g. {' + v + ' | -2 <= ' + v + ' < 5, ' + v + ' in R}'; }
  function setPart(prompt, target, o, sol, hints, text) {
    o = o || {}; var v = o.v || 'x';
    var p = B.math(prompt, setChk(target, o), target, sol, hints, text, { keys: 'set', vars: [v].concat(o.vars || []), before: o.before, placeholder: o.placeholder || ph(v) });
    var tp = S.parse(target).set;
    p.good = [ivAlt(target), ineqAlt(target, v)].concat(o.good || []);
    p.bad = (o.wrong || []).map(function (w) { return w.is; }).filter(function (b) { var q = S.parse(b); return q.ok && !S.eq(q.set, tp); }).concat(o.bad || []);
    return p;
  }
  /* one part, two boxes: Domain and Range. o: dv, rv (letters), dW / rW (opt.wrong lists), good, bad */
  function drPart(prompt, D, R, o, sol, hints, text) {
    o = o || {}; var dv = o.dv || 'x', rv = o.rv || 'y';
    var cD = setChk(D, { v: dv, other: R, otherName: 'range', wrong: o.dW }), cR = setChk(R, { v: rv, other: D, otherName: 'domain', wrong: o.rW });
    var vars = [dv, rv].filter(function (v, i, a) { return a.indexOf(v) === i; });
    var fl = [{ label: o.dLabel || 'Domain', name: 'Domain', mode: 'math', keys: 'set', vars: vars, placeholder: ph(dv) }, { label: o.rLabel || 'Range', name: 'Range', mode: 'math', keys: 'set', vars: vars, placeholder: ph(rv) }];
    var p = B.fields(prompt, fl, [cD, cR], [D, R], t('D=' + D) + '<br>' + t('R=' + R), sol, hints, text);
    p.good = [[ivAlt(D), ivAlt(R)], [ineqAlt(D, dv), ineqAlt(R, rv)]].concat(o.good || []);
    var Dp = S.parse(D).set, Rp = S.parse(R).set, bad = [];
    if (!S.eq(Dp, Rp)) bad.push([R, D]);
    (o.dW || []).forEach(function (w) { var q = S.parse(w.is); if (q.ok && !S.eq(q.set, Dp)) bad.push([w.is, R]); });
    (o.rW || []).forEach(function (w) { var q = S.parse(w.is); if (q.ok && !S.eq(q.set, Rp)) bad.push([D, w.is]); });
    p.bad = bad.concat(o.bad || []);
    return p;
  }

  /* ---------------- ordered pairs / intercepts ---------------- */
  function readPairs(resp) {
    var s = String(resp || '').replace(/\\(left|right)\.?/g, '').replace(/\\lparen/g, '(').replace(/\\rparen/g, ')').replace(/\\lbrace|\\rbrace|\\\{|\\\}|[{}]/g, ' ').replace(/\\[,;:! ]|~/g, ' ');
    if (!s.trim()) return { empty: true };
    var re = /\(([^()]*)\)/g, m, out = [];
    while ((m = re.exec(s))) {
      var xy = m[1].split(','); if (xy.length !== 2) return { bad: true };
      var a = ex.parse(xy[0].trim()), b = ex.parse(xy[1].trim()); if (!a.ok || !b.ok) return { bad: true };
      out.push([ex.value(a.ast), ex.value(b.ast)]);
    }
    if (s.replace(re, '').replace(/[,\s]|\b(and|or)\b/g, '').length || !out.length) return { bad: true };
    return { pairs: out };
  }
  function isNone(s) { var x = String(s == null ? '' : s).replace(/\s+/g, ' ').trim(); return /^(\\text\{\s*none\s*\}|none|no\s*\w*\s*intercepts?|\\emptyset|\\varnothing|∅|\\\{\s*\\\}|\{\s*\})$/i.test(x); }
  /* want: [[x, y], …] (may be empty = "none"); o.axis 'x' | 'y'; o.other: the other axis's intercept points */
  function ptsChk(want, o) {
    o = o || {};
    var key = function (p) { return cl(p[0]) + '|' + cl(p[1]); }, T = {}, OT = {};
    want.forEach(function (p) { T[key(p)] = 1; }); (o.other || []).forEach(function (p) { OT[key(p)] = 1; });
    var ax = o.axis === 'y' ? 'y' : 'x';
    return function (resp) {
      var s = String(resp == null ? '' : resp).trim();
      if (!s) return form('empty', 'Type your answer first' + (o.none ? ' (or press <b>none</b>).' : '.'));
      if (isNone(s)) return want.length ? wrong('pt-said-none', o.saidNone || 'There is at least one: look for where the graph meets the ' + t(ax) + '-axis.') : ok();
      var L = readPairs(s);
      if (L.bad || L.empty) return form('unreadable', 'Write each point as an ordered pair in brackets, e.g. ' + t(ax === 'x' ? '(3,\\ 0)' : '(0,\\ 3)') + ', with commas between points.');
      if (!want.length) return wrong('pt-not-none', o.noneHint || 'Check again: does the graph really meet the ' + t(ax) + '-axis? If it never does, press <b>none</b>.');
      var A = {}; L.pairs.forEach(function (p) { A[key(p)] = 1; });
      var miss = Object.keys(T).filter(function (k) { return !A[k]; }), extra = Object.keys(A).filter(function (k) { return !T[k]; });
      if (!miss.length && !extra.length) return ok();
      if (L.pairs.every(function (p) { return T[key([p[1], p[0]])]; })) return wrong('pairs-flip', 'The coordinates are the wrong way round: an ordered pair is ' + t('(x,\\ y)') + '. ' + (ax === 'x' ? 'A point on the ' + t('x') + '-axis has ' + t('y=0') + ', so it looks like ' + t('(a,\\ 0)') + '.' : 'A point on the ' + t('y') + '-axis has ' + t('x=0') + ', so it looks like ' + t('(0,\\ b)') + '.'));
      if (extra.length && extra.every(function (k) { return OT[k]; })) return wrong('int-swap', ax === 'x' ? 'That point is on the ' + t('y') + '-axis (its ' + t('x') + '-coordinate is ' + t('0') + '). An ' + t('x') + '-intercept is where the graph meets the ' + t('x') + '-axis, where ' + t('y=0') + '.' : 'That point is on the ' + t('x') + '-axis. A ' + t('y') + '-intercept is where the graph meets the ' + t('y') + '-axis, where ' + t('x=0') + '.');
      var h = o.diag ? o.diag(L.pairs) : null; if (h) return wrong(h.code, h.hint);
      if (miss.length && !extra.length) return wrong('pt-missing', o.missHint || 'Correct so far — but there ' + (miss.length === 1 ? 'is another one' : 'are more') + '. Check the whole graph.');
      if (extra.length && !miss.length) return wrong('pt-extra', 'You have ' + (extra.length === 1 ? 'a point that isn’t' : 'points that aren’t') + ' an intercept. Check each one is on the graph and on the ' + t(ax) + '-axis.');
      return wrong('value', null);
    };
  }
  function ptsKey(want) { return want.length ? want.map(ptK).join(', ') : '\\text{none}'; }
  function ptsAns(want) { return want.length ? t(want.map(ptT).join(',\\ ')) : 'none'; }
  function ptsF(label, none) { return { label: label, name: label.replace(/\\\(|\\\)/g, ''), mode: 'math', keys: 'pairs', none: !!none, placeholder: 'e.g. (3, 0)' + (none ? ' or none' : '') }; }
  /* one part with two boxes: x-intercept point(s) and y-intercept point(s) */
  function intPart(prompt, xs, ys, o, sol, hints, text) {
    o = o || {};
    var lx = o.xLabel || t('x') + '-int' + (o.plural ? '(s)' : ''), ly = o.yLabel || t('y') + '-int';
    var p = B.fields(prompt, [ptsF(lx, o.none), ptsF(ly, o.none)], [ptsChk(xs, { axis: 'x', other: ys, none: o.none, diag: o.xDiag }), ptsChk(ys, { axis: 'y', other: xs, none: o.none, diag: o.yDiag })],
      [ptsKey(xs), ptsKey(ys)], t('x') + '-intercept' + (xs.length > 1 ? 's' : '') + ': ' + ptsAns(xs) + '<br>' + t('y') + '-intercept: ' + ptsAns(ys), sol, hints, text);
    var same2 = ptsKey(xs) === ptsKey(ys);
    p.bad = (same2 ? [] : [[ptsKey(ys), ptsKey(xs)]]).concat(o.bad || []);
    p.good = o.good || [];
    return p;
  }

  /* ---------------- fields of numbers / solutions ---------------- */
  function numF(label, v, diag, after) { return { f: { label: label, name: label.replace(/\\\(|\\\)/g, ''), after: after }, c: K.number(v, diag), k: nf(v) }; }
  function valF(label, v, diag, keys) { return { f: { label: label, name: label.replace(/\\\(|\\\)/g, ''), mode: 'math', keys: keys || 'fraction' }, c: K.value(v, { diag: diag }), k: typeof v === 'number' ? nf(v) : ex.texRat(ex.norm(v[0], v[1])) }; }
  function solKey(vals, v) { return vals.map(function (x) { return (v || 'x') + '=' + (Array.isArray(x) ? ex.texRat(ex.norm(x[0], x[1])) : nf(x)); }).join(',\\ '); }
  function solF(label, vals, v, diag) { return { f: { label: label, name: label.replace(/\\\(|\\\)/g, ''), mode: 'math', keys: 'solutions', vars: [v || 'x'], placeholder: 'e.g. ' + (v || 'x') + ' = 3, ' + (v || 'x') + ' = -5' }, c: K.valueSet(vals, { v: v || 'x', diag: diag }), k: solKey(vals, v) }; }
  function fieldsOf(prompt, items, answer, sol, hints, text) {
    return B.fields(prompt, items.map(function (x) { return x.f; }), items.map(function (x) { return x.c; }), items.map(function (x) { return x.k; }), answer, sol, hints, text);
  }

  /* ---------------- multiple choice ---------------- */
  function mc(r, prompt, opts, sol, hints, text, keepOrder) { return B.mc(r, prompt, distinct(opts), sol, hints, text, keepOrder); }
  function graphMC(r, prompt, opts, sol, hints, text) { var p = B.mc(r, prompt, distinct(opts), sol, hints, text); p.input.columns = 2; return p; }
  function tf(r, prompt, truth, why, sol, hints, text) { return B.tf(r, prompt, truth, why, sol, hints, text); }

  /* ---------------- drawings ---------------- */
  function G(spec) { return HW.graph(Object.assign({ x: [-6, 6], y: [-6, 6], labels: 2, max: 300 }, spec)); }
  /* a small graph for a multiple-choice option: fixed width so it doesn't shrink beside the option letter */
  function Gm(spec) { var w = spec.w || 170; return HW.graph(Object.assign({ x: [-6, 6], y: [-6, 6], labels: 2 }, spec, { max: w })).replace('style="max-width:', 'style="width:' + w + 'px;max-width:'); }
  function fig(s) { return '<div class="fig">' + s + '</div>'; }
  function figs(list, w) { w = w || 150; return '<div style="display:flex;flex-wrap:wrap;gap:6px 14px;align-items:flex-start">' + list.map(function (f) { return '<div style="flex:1 1 ' + w + 'px;max-width:300px">' + f + '</div>'; }).join('') + '</div>'; }
  /* piecewise-linear helpers: V = [[x, y], …] */
  function pwAt(V, x) { for (var i = 0; i + 1 < V.length; i++) { var a = V[i], b = V[i + 1]; if (x >= a[0] - 1e-9 && x <= b[0] + 1e-9) return cl(a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0])); } return NaN; }
  function pwSols(V, y) {
    var pts = [], ints = [];
    for (var i = 0; i + 1 < V.length; i++) {
      var a = V[i], b = V[i + 1];
      if (same(a[1], y) && same(b[1], y)) ints.push([a[0], b[0]]);
      else if ((y - a[1]) * (y - b[1]) <= 1e-12) pts.push(cl(a[0] + (y - a[1]) * (b[0] - a[0]) / (b[1] - a[1])));
    }
    pts = uniq(pts).filter(function (x) { return !ints.some(function (I) { return x >= I[0] - 1e-9 && x <= I[1] + 1e-9; }); });
    return { pts: pts, ints: ints };
  }

  /* ---------------- graphing-calculator window (six boxes, as in the booklet) ---------------- */
  var WL = ['Xmin', 'Xmax', 'Xscl', 'Ymin', 'Ymax', 'Yscl'];
  function wT(n) { return t(n.charAt(0) + '_{\\text{' + n.slice(1) + '}}'); }
  /* feat: [{ x, y, name }] — every feature must be on the screen (an edge counts) */
  function winChk(feat) {
    var fx = feat.map(function (p) { return p.x; }), fy = feat.map(function (p) { return p.y; });
    var needX = Math.max(1, Math.max.apply(null, fx) - Math.min.apply(null, fx)), needY = Math.max(1, Math.max.apply(null, fy) - Math.min.apply(null, fy));
    return function (resp) {
      resp = resp || []; var v = [];
      for (var i = 0; i < 6; i++) {
        var s = String(resp[i] == null ? '' : resp[i]).trim();
        if (!s) return form('empty', 'Fill in all six window values.');
        var n = num(s); if (n == null) return form('win-nan', '<b>' + wT(WL[i]) + ':</b> type a single number, like ' + t('0') + ' or ' + t('25') + '.');
        v.push(n);
      }
      if (v[0] >= v[1]) return form('win-order', wT('Xmin') + ' has to be smaller than ' + wT('Xmax') + ' (otherwise the calculator shows ERR:WINDOW RANGE).');
      if (v[3] >= v[4]) return form('win-order', wT('Ymin') + ' has to be smaller than ' + wT('Ymax') + ' (otherwise the calculator shows ERR:WINDOW RANGE).');
      if (v[2] <= 0 || v[5] <= 0) return form('win-scl', wT('Xscl') + ' and ' + wT('Yscl') + ' are the distances between tick marks, so they must be positive.');
      for (var j = 0; j < feat.length; j++) {
        var p = feat[j], ox = p.x < v[0] - 1e-9 ? 'to the left of ' + wT('Xmin') : p.x > v[1] + 1e-9 ? 'to the right of ' + wT('Xmax') : '', oy = p.y < v[3] - 1e-9 ? 'below ' + wT('Ymin') : p.y > v[4] + 1e-9 ? 'above ' + wT('Ymax') : '';
        if (ox || oy) return wrong('win-cut', 'Your window cuts off ' + p.name + ' (at about ' + t(ptT([K.roundTo(p.x, 2), K.roundTo(p.y, 2)])) + '): it is ' + ox + (ox && oy ? ' and ' : '') + oy + '.');
      }
      if (v[1] - v[0] > 10 * needX + 1e-9) return form('win-huge', 'Everything is on the screen, but your window is far wider than the flight needs, so the graph is squashed. Bring ' + wT('Xmin') + ' and ' + wT('Xmax') + ' closer in.');
      if (v[4] - v[3] > 10 * needY + 1e-9) return form('win-huge', 'Everything is on the screen, but your window is far taller than the flight needs, so the graph is squashed flat. Bring ' + wT('Ymin') + ' and ' + wT('Ymax') + ' closer in.');
      if ((v[1] - v[0]) / v[2] > 60 || (v[4] - v[3]) / v[5] > 60) return form('win-scl', 'That scale draws more than 60 tick marks on an axis, so they blur together. Choose a bigger ' + wT('Xscl') + ' or ' + wT('Yscl') + '.');
      return ok();
    };
  }

  /* ---------------- shared hints ---------------- */
  var HINT_DR = 'The <b>domain</b> is every input (' + t('x') + '-value, read left to right); the <b>range</b> is every output (' + t('y') + '-value, read bottom to top).';
  var HINT_DOTS = 'Solid dot → that value is included (' + t('\\le') + '). Hollow dot → excluded (' + t('<') + '). Arrow → no end on that side.';
  var HINT_LIST = 'Separate points give a <b>list</b> in braces, each value once, smallest first, e.g. ' + t('\\{-2, 1, 5\\}') + '.';
  var HINT_EVAL = 'Replace every ' + t('x') + ' in the rule with the input (in brackets), then follow the order of operations.';
  var HINT_SOLVE = 'Set the rule equal to the given output and solve the equation for the input.';

  /* =====================================================================================================
   * Assignment
   * ===================================================================================================== */

  /* Q5: four rules evaluated at one input, ordered greatest → least */
  function q5(r) {
    for (var g = 0; g < 300; g++) {
      var x0 = r.pick([-2, -2, -2, -4]), b = r.pick([3, 3, 2, 4]), c = r.pick([-1, -1, -2, -3]), c2 = r.pick([9, 9, 6, 7, 8, 10]), a = r.pick([2, 2, 1, 3]), d = r.pick([5, 5, 3, 4, 6, 7]), e = r.pick([4, 4, 2, 3, 5]);
      var rules = [
        { tex: lin([[1, 'x^{2}'], [b, 'x'], [c, '']]), v: x0 * x0 + b * x0 + c, vbad: -x0 * x0 + b * x0 + c, work: par(x0) + '^{2}+' + b + par(x0) + (c < 0 ? c : '+' + c) },
        { tex: '\\frac{1}{2}x+' + c2, v: x0 / 2 + c2, vbad: x0 / 2 + c2, work: '\\tfrac{1}{2}' + par(x0) + '+' + c2 },
        { tex: lin([[a, 'x^{2}'], [-1, 'x']]), v: a * x0 * x0 - x0, vbad: -a * x0 * x0 - x0, work: (a === 1 ? '' : a) + par(x0) + '^{2}-' + par(x0) },
        { tex: d + '-' + (e === 1 ? '' : e) + 'x', v: d - e * x0, vbad: d - e * x0, work: d + '-' + e + par(x0) }];
      var vs = rules.map(function (q) { return q.v; });
      if (uniq(vs).length < 4) continue;
      var perm = r.chance(0.5) ? [0, 1, 2, 3] : r.shuffle([0, 1, 2, 3]);    // perm[i] = which rule is labelled i+1
      var lab = function (vals) { var idx = [0, 1, 2, 3].sort(function (i, j) { return vals[perm[j]] - vals[perm[i]]; }); return idx.map(function (i) { return i + 1; }).join(''); };
      var right = lab(vs), badVals = rules.map(function (q) { return q.vbad; });
      if (uniq(badVals).length < 4) continue;
      var sq = lab(badVals), rev = right.split('').reverse().join(''), sw = right.charAt(1) + right.charAt(0) + right.slice(2), sw2 = right.slice(0, 2) + right.charAt(3) + right.charAt(2);
      var cands = [{ s: sq, why: 'Square the negative input first: ' + t(par(x0) + '^{2}=' + x0 * x0) + ' (positive), then multiply by any coefficient.' },
        { s: rev, why: 'That is the order from <b>least</b> to greatest. The question asks for greatest to least.' },
        { s: sw2, why: 'Check the two smallest values again — evaluate each rule carefully at ' + t('x=' + x0) + '.' },
        { s: sw, why: 'Check the two largest values again — evaluate each rule carefully at ' + t('x=' + x0) + '.' }].filter(function (o) { return o.s !== right; });
      var seen = {}; seen[right] = 1; cands = cands.filter(function (o) { if (seen[o.s]) return false; seen[o.s] = 1; return true; });
      if (cands.length < 3) continue;
      var noneRight = r.chance(0.2);
      var listed = noneRight ? cands.slice(0, 3) : [{ s: right, right: true }].concat(cands.slice(0, 2));
      var opts = r.shuffle(listed).map(function (o) { return { html: t(o.s), right: !!o.right, why: o.why }; });
      opts.push({ html: 'none of the above', right: noneRight, why: noneRight ? null : 'One of the listed orders is correct. Evaluate all four rules at ' + t('x=' + x0) + ' and order the results from greatest to least.' });
      var shown = [0, 1, 2, 3].map(function (i) { return '<b>' + (i + 1) + '.</b> ' + t('p(x)=' + rules[perm[i]].tex); }).join(' &nbsp; ');
      var work = [0, 1, 2, 3].map(function (i) { var q = rules[perm[i]]; return '<b>' + (i + 1) + '.</b> ' + t('p(' + x0 + ')=' + q.work + '=' + nf(q.v)); }).join('<br>');
      return { x0: x0, shown: shown, opts: opts, work: work, right: right, noneRight: noneRight };
    }
    throw new Error('q5 generator');
  }

  /* Q11: a table of a linear relation y = mx + b with one point on the y-axis */
  function q11Shared(r) {
    for (var g = 0; g < 400; g++) {
      var m = r.pick([-2, -2, -3, -1, 1, 2, 3]), k = r.pick([1, 1, -1, 2, -2]), b = -m * k;
      var negs = r.sample([-4, -3, -2, -1], 2).sort(function (u, v) { return u - v; }), poss = r.sample([1, 2, 3, 4], 2).sort(function (u, v) { return u - v; });
      if (r.chance(0.35)) { m = -2; k = 1; b = 2; negs = [-3, -1]; poss = [2, 4]; }
      var xs = negs.concat([0], poss);
      if (xs.indexOf(k) >= 0) continue;
      var ys = xs.map(function (x) { return m * x + b; });
      if (ys.some(function (y) { return Math.abs(y) > 9 || y === 0; })) continue;
      return { m: m, b: b, k: k, xs: xs, ys: ys, pts: xs.map(function (x, i) { return [x, ys[i]]; }) };
    }
    throw new Error('q11');
  }
  function quad(p) { if (p[0] === 0 || p[1] === 0) return 'axis'; return p[0] > 0 ? (p[1] > 0 ? 'Q1' : 'Q4') : (p[1] > 0 ? 'Q2' : 'Q3'); }

  /* Q12: ball h(t) = -5t^2 + vt + h0 */
  function q12Shared(r) {
    var p = r.pick([2, 2, 2, 1, 3]), h0 = r.pick([1, 1, 2, 3, 5]);
    if (p === 1 && h0 < 2) h0 = 2;
    var v = 10 * p, M = 5 * p * p + h0, T = (v + Math.sqrt(v * v + 20 * h0)) / 10, Tn = (v - Math.sqrt(v * v + 20 * h0)) / 10;
    return { p: p, h0: h0, v: v, M: M, T: T, T2: K.roundTo(T, 2), Tn: K.roundTo(Tn, 2), rule: lin([[-5, 't^{2}'], [v, 't'], [h0, '']]), f: function (x) { return -5 * x * x + v * x + h0; } };
  }

  /* Q14: Amira's walk */
  function q14Shared(r) {
    for (var g = 0; g < 300; g++) {
      var a = r.pick([2, 2, 1, 3]), r1 = r.pick([5, 5, 3, 4, 6]), w = r.pick([1, 1, 2]), b = r.pick([3, 3, 2, 4]), r3 = r.int(1, r1 - 1);
      if (r.chance(0.3)) { a = 2; r1 = 5; w = 1; b = 3; r3 = 2; }
      var D = a * r1, E = D - b * r3;
      if (D > 12 || E < 1 || a + w + b > 7) continue;
      return { a: a, r1: r1, w: w, b: b, r3: r3, D: D, E: E, T: a + w + b, V: [[0, 0], [a, D], [a + w, D], [a + w + b, E]] };
    }
    throw new Error('q14');
  }
  function q14Fig(sh) {
    var ym = sh.D + 2 - (sh.D % 2);
    return fig(G({ x: [0, 7], y: [0, ym], labels: 1, labelsY: 2, unitX: 36, unitY: 230 / ym, firstQuadrant: true, xName: 't', yName: 'd', xTitle: 'Time (h)', yTitle: 'Distance from home (km)',
      segs: [{ pts: sh.V, start: 'closed', end: 'closed' }], points: [{ x: sh.a, y: sh.D }, { x: sh.a + sh.w, y: sh.D }], max: 320, aria: 'distance from home against time' }));
  }

  /* Q15: a V-shaped relation with one solid and one hollow endpoint */
  function q15Shared(r) {
    for (var g = 0; g < 400; g++) {
      var L = [r.int(-5, -3), r.int(1, 4)], Vx = r.int(-1, 1), Vy = r.int(-3, -1), Rr = [r.int(2, 4), r.int(0, 3)];
      if (r.chance(0.3)) { L = [-4, 3]; Vx = 0; Vy = -2; Rr = [3, 2]; }
      if (!(Rr[1] < L[1] && Rr[1] > Vy && Rr[0] > Vx && L[0] < Vx)) continue;
      var mir = r.chance(0.3), flip = r.chance(0.25);
      var tr = function (p) { return [mir ? -p[0] : p[0], flip ? -p[1] : p[1]]; };
      var pts = [L, [Vx, Vy], Rr].map(tr);       // pts[0] solid, pts[2] hollow
      var lo = Math.min(pts[0][0], pts[2][0]), hi = Math.max(pts[0][0], pts[2][0]);
      var solidLeft = pts[0][0] < pts[2][0];
      var ys = pts.map(function (p) { return p[1]; }), ylo = Math.min.apply(null, ys), yhi = Math.max.apply(null, ys);
      return { pts: pts, lo: lo, hi: hi, solidLeft: solidLeft, ylo: ylo, yhi: yhi, flip: flip,
        D: solidLeft ? bld('x', lo, hi, true, false) : bld('x', lo, hi, false, true), R: bld('y', ylo, yhi) };
    }
    throw new Error('q15');
  }

  /* Q16: phone battery B(t) = 100 - rt */
  function q16Shared(r) {
    var rr = r.pick([12, 12, 6, 7, 9, 11, 14, 15, 16]), T = 100 / rr, top = Math.floor(T - 1e-9);
    var k = rr === 12 && r.chance(0.6) ? 3 : r.int(1, Math.min(top - 1, 6)), mm = rr === 12 && r.chance(0.6) ? 5 : r.int(2, top - 1);
    if (mm === k) mm = k + 1 <= top - 1 ? k + 1 : k - 1;
    return { r: rr, T: T, T2: K.roundTo(T, 2), k: k, m: mm, V: 100 - rr * mm };
  }

  HW.defineLesson({
    id: 'u5l10', unit: 5, num: '10', title: 'Relations and Functions Review: Domain, Range, and Function Notation', outcome: 'RF8',
    blurb: 'The whole unit in one place: discrete and continuous variables, domain and range, intercepts, function notation forwards and backwards, and the vertical line test — in pictures, tables and real situations.',
    questions: [
      /* ---------------- Q1 ---------------- */
      { num: '1', section: 'Part A — Multiple choice', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '1', level: 'BEG', make: function (r) {
          var a = r.pick([7, 7, 3, 4, 5, 6, 8, 9]), k = r.pick([3, 3, 2, 4, 5, 6]), b = a * k, nm = r.pick(['h', 'h', 'g', 'f']);
          return mc(r, 'Consider the function ' + t(nm + '(x)=' + a + 'x-' + b) + '. The ' + t('x') + '-intercept of the graph of ' + t(nm) + ' is', [
            { html: t('-' + b), why: t('-' + b) + ' is ' + t(nm + '(0)') + ', the output when ' + t('x=0') + ' — that is the ' + t('y') + '-intercept. For the ' + t('x') + '-intercept set ' + t(nm + '(x)=0') + '.' },
            { html: t('-' + k), why: 'Check the sign: ' + t(a + 'x-' + b + '=0') + ' gives ' + t(a + 'x=+' + b) + '.' },
            { html: t(k), right: true },
            { html: t(b), why: 'You stopped at ' + t(a + 'x=' + b) + ' — now divide both sides by ' + t(a) + '.' }],
            'An ' + t('x') + '-intercept has ' + t('y=0') + ', so set ' + t(nm + '(x)=0') + ':<br>' + t(a + 'x-' + b + '=0') + '<br>' + t(a + 'x=' + b) + '<br>' + t('x=' + k),
            ['On the ' + t('x') + '-axis the output is ' + t('0') + '. Solve ' + t(nm + '(x)=0') + '.'], 'x-intercept of ax-b', true);
        } }] },
      /* ---------------- Q2 ---------------- */
      { num: '2', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '2', level: 'EMG', make: function (r) {
          var n, x2, m, y2, me;
          for (var g = 0; g < 200; g++) {
            n = r.pick([-3, -3, -2, -4, -5, -6, 2, 3]); x2 = r.pick([2, 2, 3]); m = r.pick([4, 4, 2, 3, 5]);
            y2 = m * x2 + n; me = (y2 + n) / x2;
            if (Number.isInteger(me) && me !== m && m !== n && y2 !== 0) break;
          }
          var o = function (a, c) { return t('m=' + a + ',\\ n=' + c); };
          return mc(r, 'Given a function ' + t('h') + ' defined by ' + t('h(x)=mx+n') + ', with ' + t('h(0)=' + n) + ' and ' + t('h(' + x2 + ')=' + y2) + ', then', [
            { html: o(m, n), right: true },
            { html: o(n, m), why: 'Those are swapped. ' + t('h(0)=m(0)+n=n') + ', so ' + t('n') + ' is the output at ' + t('x=0') + ': ' + t('n=' + n) + '.' },
            { html: o(me, n), why: 'Check the step for ' + t('m') + ': ' + t(x2 + 'm' + (n < 0 ? n : '+' + n) + '=' + y2) + ' gives ' + t(x2 + 'm=' + y2 + (n < 0 ? '+' + (-n) : '-' + n)) + '. Moving ' + t(n) + ' across changes its sign.' },
            { html: o(m, 0), why: t('h(0)=m(0)+n=n') + ', so ' + t('n') + ' equals ' + t('h(0)=' + n) + ', not ' + t('0') + '.' }],
            t('h(0)=m(0)+n=n') + ', and ' + t('h(0)=' + n) + ', so ' + t('n=' + n) + '.<br>' + t('h(' + x2 + ')=' + x2 + 'm+n=' + y2 + '\\Rightarrow ' + x2 + 'm' + (n < 0 ? n : '+' + n) + '=' + y2 + '\\Rightarrow ' + x2 + 'm=' + (y2 - n) + '\\Rightarrow m=' + m) + '.',
            ['Start with ' + t('h(0)') + ': substitute ' + t('x=0') + ' into ' + t('mx+n') + '. What is left?', 'Then substitute ' + t('x=' + x2) + ' and solve for ' + t('m') + '.'], 'h(x)=mx+n from two values');
        } }] },
      /* ---------------- Q3 ---------------- */
      { num: '3', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '3', level: 'BEG', make: function (r) {
          var b = r.pick([2, 2, 2, 3]), k = b === 2 ? r.pick([5, 5, 3, 4, 6]) : r.pick([2, 3, 4]), P1 = Math.pow(b, k);
          return mc(r, 'If ' + t('f(x)=' + b + '^{x}') + ', then ' + t('f(-' + k + ')=') , [
            { html: t('-' + P1), why: 'A negative exponent doesn’t make the answer negative: ' + t(b + '^{-' + k + '}=\\dfrac{1}{' + b + '^{' + k + '}}') + '.' },
            { html: t('-' + b * k), why: t(b + '^{-' + k + '}') + ' is not ' + t(b + '\\times(-' + k + ')') + '. An exponent means repeated multiplication, and a negative exponent means the reciprocal.' },
            { html: t('\\dfrac{1}{' + P1 + '}'), right: true },
            { html: t('\\dfrac{1}{' + b * k + '}'), why: 'Reciprocal is right, but ' + t(b + '^{' + k + '}=' + P1) + ', not ' + t(b + '\\times ' + k) + '.' }],
            t('f(-' + k + ')=' + b + '^{-' + k + '}=\\dfrac{1}{' + b + '^{' + k + '}}=\\dfrac{1}{' + P1 + '}'),
            ['Replace ' + t('x') + ' with ' + t('-' + k) + '. What does a negative exponent mean?'], 'f(x)=b^x at a negative input', true);
        } }] },
      /* ---------------- Q4 ---------------- */
      { num: '4', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '4', level: 'PRG', make: function (r) {
          var p, q, c, k, d, A, Cr;
          for (var g = 0; g < 300; g++) {
            var pq = r.pick([[3, 4], [3, 4], [2, 3], [1, 2], [2, 5], [3, 5], [1, 4], [5, 4]]); p = pq[0]; q = pq[1];
            c = r.pick([8, 8, 3, 5, 6, 7, 9]); k = r.pick([3, 3, 2, 4]); d = r.pick([2, 2, 1, 3, 5]);
            if ((p * d) % q === 0 || (p * k) % q === 0 && r.chance(0.5)) continue;
            A = ex.norm(p * k, q); Cr = ex.norm(c * q - p * d, q);
            var vals = [[Cr[0], Cr[1]], [c - d, 1], [c, 1], ex.norm(-p * d, q)].map(function (z) { return z[0] / z[1]; });
            if (uniq(vals).length === 4) break;
          }
          var lx = function (cc) { return dfr(lin([[A, 'x'], [cc, '']])); };
          return mc(r, 'If ' + t('g(x)=' + dfr(frT(p, q)) + 'x+' + c) + ', an expression for ' + t('g(' + k + 'x-' + d + ')') + ' is', [
            { html: t(lx([c - d, 1])), why: 'The whole expression ' + t(k + 'x-' + d) + ' is multiplied by ' + t(dfr(frT(p, q))) + ', so the ' + t('-' + d) + ' becomes ' + t(dfr(frT(-p * d, q))) + ', not ' + t('-' + d) + '.' },
            { html: t(lx(Cr)), right: true },
            { html: t(lx([c, 1])), why: 'You dropped the ' + t('-' + d) + ' part of the input. Multiply ' + t(dfr(frT(p, q))) + ' by <b>both</b> terms of ' + t(k + 'x-' + d) + '.' },
            { html: t(lx(ex.norm(-p * d, q))), why: 'Don’t forget the ' + t('+' + c) + ' at the end of the rule.' }],
            'Replace every ' + t('x') + ' with the whole expression ' + t(k + 'x-' + d) + ':<br>' + t('g(' + k + 'x-' + d + ')=' + dfr(frT(p, q)) + '(' + k + 'x-' + d + ')+' + c) + '<br>' + t('=' + dfr(lin([[A, 'x'], [ex.norm(-p * d, q), '']])) + '+' + c) + '<br>' + t('=' + lx(Cr)),
            ['Put ' + t('(' + k + 'x-' + d + ')') + ' in brackets where the ' + t('x') + ' was, then distribute ' + t(dfr(frT(p, q))) + '.', 'Write ' + t(c) + ' with the same denominator before adding.'], 'g(kx-d) for linear g', true);
        } }] },
      /* ---------------- Q5 ---------------- */
      { num: '5', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '5', level: 'EMG', make: function (r) {
          var Q = q5(r);
          return mc(r, 'Consider the following four functions.<br>' + Q.shown + '<br>Evaluate ' + t('p(' + Q.x0 + ')') + ' for each function and put the four results in order from greatest to least. The order is', Q.opts,
            'Evaluate each at ' + t('x=' + Q.x0) + ':<br>' + Q.work + '<br>Greatest to least gives ' + t(Q.right) + (Q.noneRight ? ', which is not listed — so the answer is <b>none of the above</b>.' : '.'),
            ['Substitute ' + t(Q.x0) + ' in brackets. Square the negative first: ' + t(par(Q.x0) + '^{2}=' + Q.x0 * Q.x0) + '.', 'Write the four values down, then list the function numbers from the largest value to the smallest.'], 'order four p(-2) values', true);
        } }] },
      /* ---------------- Q6 ---------------- */
      { num: '6', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '6', level: 'EMG', outcome: 'RF2', make: function (r) {
          var ctx = r.pick([
            { s: 'The cost of a pizza, ' + t('C') + ', depends on the number of toppings, ' + t('t') + '.', dep: 'the cost, ' + t('C'), ind: 'the number of toppings, ' + t('t'), o1: 'the price of one topping', o2: 'the size of the pizza' },
            { s: 'The cost of a pizza, ' + t('C') + ', depends on the number of toppings, ' + t('t') + '.', dep: 'the cost, ' + t('C'), ind: 'the number of toppings, ' + t('t'), o1: 'the price of one topping', o2: 'the size of the pizza' },
            { s: 'The time, ' + t('T') + ', needed to fill a pool depends on the number of hoses, ' + t('h') + ', that are used.', dep: 'the time, ' + t('T'), ind: 'the number of hoses, ' + t('h'), o1: 'the size of the pool', o2: 'the flow rate of one hose' },
            { s: 'A plumber’s charge, ' + t('P') + ', depends on the number of hours worked, ' + t('h') + '.', dep: 'the charge, ' + t('P'), ind: 'the number of hours, ' + t('h'), o1: 'the hourly rate', o2: 'the plumber’s travel time' },
            { s: 'The height of a burning candle, ' + t('H') + ', depends on the time, ' + t('t') + ', it has been burning.', dep: 'the height, ' + t('H'), ind: 'the time, ' + t('t'), o1: 'the width of the candle', o2: 'the rate at which it burns' }]);
          var askInd = r.chance(0.7);
          return mc(r, '“' + ctx.s + '” The ' + (askInd ? 'independent' : 'dependent') + ' variable is', [
            { html: ctx.dep, right: !askInd, why: askInd ? 'That is the quantity that <i>depends on</i> the other one — the dependent variable (the output).' : null },
            { html: ctx.ind, right: askInd, why: askInd ? null : 'That is the quantity the other one depends on — the independent variable (the input).' },
            { html: ctx.o1, why: 'That isn’t one of the two variables named in the sentence. Look for “___ depends on ___”.' },
            { html: ctx.o2, why: 'That isn’t one of the two variables named in the sentence. Look for “___ depends on ___”.' }],
            'In “A depends on B”, A is the dependent variable (output) and B is the independent variable (input). Here the ' + (askInd ? 'independent variable is ' + ctx.ind : 'dependent variable is ' + ctx.dep) + '.',
            ['Read the sentence as “output depends on input”.'], 'independent/dependent from a sentence', true);
        } }] },
      /* ---------------- Q7 ---------------- */
      { num: '7', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '7', level: 'EMG', outcome: 'RF2', make: function (r) {
          var fail = r.pick(['A set of ordered pairs in which the first coordinate is repeated, paired with two different second coordinates.', 'A set of ordered pairs in which the first coordinate is repeated, paired with two different second coordinates.',
            'An arrow diagram in which one input has two arrows leaving it, to two different outputs.', 'A table of values in which one input appears twice, with two different outputs.']);
          var safe = r.sample([
            { html: 'A table of values listing each input exactly once.', why: 'If each input is listed once, each input has exactly one output — that is always a function.' },
            { html: 'An arrow diagram in which each input has exactly one arrow leaving it.', why: 'One arrow out of each input means one output for each input — always a function.' },
            { html: 'An equation solved explicitly for ' + t('y') + ' in terms of ' + t('x') + ', such as ' + t('y=3x-2') + '.', why: 'An equation like this gives exactly one ' + t('y') + ' for each ' + t('x') + '.' },
            { html: 'A set of ordered pairs in which a second coordinate is repeated, such as ' + t('(1,\\ 4)') + ' and ' + t('(3,\\ 4)') + '.', why: 'Two inputs may share an output. A function only forbids one <b>input</b> with two outputs.' },
            { html: 'An arrow diagram in which two inputs point to the same output.', why: 'Two arrows <b>arriving</b> at one output is allowed. A function only forbids two arrows <b>leaving</b> one input.' }], 3);
          return mc(r, 'Which of the following representations of a relation might <b>fail</b> to describe a function — that is, it cannot guarantee that each input produces exactly one output?', [{ html: fail, right: true }].concat(safe),
            'A function needs exactly one output for every input. “' + fail + '” describes one input with two outputs, so it fails. Each of the others gives one output per input (repeated <i>outputs</i> are allowed).',
            ['Look for the description where <b>one input</b> could have <b>two outputs</b>.'], 'which representation fails to be a function');
        } }] },
      /* ---------------- Q8 ---------------- */
      { num: '8', section: 'Part B — Numerical response', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '8', level: 'PRG', make: function (r) {
          var m = r.pick([4, 4, 3, 5, 6, 7]), b = r.pick([7, 7, 3, 5, 9, 11]), a = r.int(3, 12); if (r.chance(0.3)) { m = 4; b = 7; a = 8; }
          var out = m * a - b;
          return B.nr('For the function ' + t('f(x)=' + m + 'x-' + b) + ', ' + t('f(a)=' + out) + '. The value of ' + t('a') + ' is ________.', a, function (u) {
            if (same(u, m * out - b)) return { code: 'ev-instead', hint: 'You found ' + t('f(' + out + ')') + '. Here ' + t(out) + ' is the <b>output</b>: solve ' + t(m + 'a-' + b + '=' + out) + '.' };
            if (same(u, out + b)) return { code: 'no-divide', hint: 'Nearly: ' + t(m + 'a=' + (out + b)) + ' — now divide by ' + t(m) + '.' };
            if (same(u, (out - b) / m)) return { code: 'sign', hint: 'Check the step that moves ' + t('-' + b) + ': add ' + t(b) + ' to both sides.' };
            return null;
          }, t(m + 'a-' + b + '=' + out + '\\Rightarrow ' + m + 'a=' + (out + b) + '\\Rightarrow a=' + a), [HINT_SOLVE], 'solve f(a)=b NR');
        } }] },
      /* ---------------- Q9 ---------------- */
      { num: '9', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '9', level: 'EMG', outcome: 'RF1', make: function (r) {
          var m = r.pick([3, 3, 2, 4, 5, 6]), k = r.pick([4, 4, 2, 3, 5, 6]), c = m * k;
          return B.nr('The line ' + t('y=-' + m + 'x+' + c) + ' has ' + t('x') + '-intercept ' + t('a') + ' and ' + t('y') + '-intercept ' + t('b') + '. The value of ' + t('a+b') + ' is ________.', k + c, function (u) {
            if (same(u, c - k)) return { code: 'sign', hint: 'Check the sign of the ' + t('x') + '-intercept: ' + t('0=-' + m + 'x+' + c) + ' gives ' + t(m + 'x=' + c) + ', so ' + t('x') + ' is positive.' };
            if (same(u, c - m) || same(u, -m + c)) return { code: 'xint-yint', hint: t('-' + m) + ' is the slope, not an intercept. For ' + t('a') + ', set ' + t('y=0') + ' and solve.' };
            if (same(u, 2 * c)) return { code: 'xint-yint', hint: 'Both of your intercepts are ' + t(c) + '. The ' + t('x') + '-intercept comes from ' + t('y=0') + ': solve ' + t('0=-' + m + 'x+' + c) + '.' };
            return null;
          }, t('y=0:\\ 0=-' + m + 'x+' + c + '\\Rightarrow x=' + k) + ', so ' + t('a=' + k) + '.<br>' + t('x=0:\\ y=' + c) + ', so ' + t('b=' + c) + '.<br>' + t('a+b=' + k + '+' + c + '=' + (k + c)),
            ['For the ' + t('x') + '-intercept set ' + t('y=0') + '; for the ' + t('y') + '-intercept set ' + t('x=0') + '.'], 'a+b intercepts of a line NR');
        } }] },
      /* ---------------- Q10 ---------------- */
      { num: '10', section: 'Part C — Written response', outcome: 'RF1',
        shared: function (r) {
          var p = r.pick([4, 4, 3, 5, 6]), c = r.pick([84, 84, 60, 70, 90, 96, 100]); if (c - p * p < 30) c = 84;
          if (r.chance(0.3)) { p = 4; c = 84; }
          var q = r.int(1, p - 1); if (p === 4 && r.chance(0.5)) q = 2;
          return { p: p, c: c, q: q, min: c - p * p, hq: q * q - 2 * p * q + c, rule: lin([[1, 't^{2}'], [-2 * p, 't'], [c, '']]) };
        },
        stem: function (sh) { return 'During an air show, the flight path of a stunt dive by a small plane can be modelled by ' + t('h=' + sh.rule) + ', where ' + t('h') + ' is the height in metres after ' + t('t') + ' seconds. The dive ends when the plane returns to its starting height. (You may use a graphing calculator.)'; }, parts: [
        { id: '10a', level: 'BEG', make: function (r, sh) {
          return B.number('(a) What is the plane’s height at the start of the dive?', sh.c, function (u) {
            if (same(u, sh.min)) return { code: 'diag', hint: 'That is the lowest height. The <b>start</b> of the dive is at ' + t('t=0') + '.' };
            return null;
          }, 'The dive starts at ' + t('t=0') + ':<br>' + t('h=(0)^{2}-' + 2 * sh.p + '(0)+' + sh.c + '=' + sh.c) + ' m', ['What is ' + t('t') + ' at the start?'], 'height at t=0', { after: 'm' });
        } },
        { id: '10b', level: 'EMG', make: function (r, sh) {
          return B.number('(b) What is the lowest height the plane reaches during the dive?', sh.min, function (u) {
            if (same(u, sh.p)) return { code: 'max-swap', hint: t(sh.p) + ' is the <b>time</b> of the lowest point. The question asks for the height there.' };
            if (same(u, sh.c)) return { code: 'start-h', hint: 'That is the starting height. The plane dives below it — find the minimum of the graph.' };
            return null;
          }, 'Graph ' + t('Y_1=X^{2}-' + 2 * sh.p + 'X+' + sh.c) + ' and use <b>3:minimum</b>: ' + t('t=' + sh.p) + ', ' + t('h=' + sh.min) + '.<br>Check: ' + t('h(' + sh.p + ')=' + sh.p * sh.p + '-' + 2 * sh.p * sh.p + '+' + sh.c + '=' + sh.min) + ' m.',
            ['Graph the model and use <b>CALC 3:minimum</b>.', 'The lowest point of a parabola that opens up is its vertex.'], 'minimum height', { after: 'm' });
        } },
        { id: '10c', level: 'BEG', make: function (r, sh) {
          return B.number('(c) At what time does the plane reach this lowest point?', sh.p, function (u) {
            if (same(u, sh.min)) return { code: 'max-swap', hint: 'That is the lowest <b>height</b>. The question asks for the time (the ' + t('t') + '-value).' };
            if (same(u, 2 * sh.p)) return { code: 'end-time', hint: t(2 * sh.p) + ' s is when the dive ends (back at ' + t(sh.c) + ' m). The lowest point is halfway through.' };
            return null;
          }, 'From the minimum screen in (b): ' + t('t=' + sh.p) + ' s. (Check: ' + t('h(' + (sh.p - 1) + ')=h(' + (sh.p + 1) + ')=' + (sh.min + 1)) + ', both higher.)', ['Read the ' + t('x') + '-value (time) of the minimum.'], 'time of minimum', { after: 's' });
        } },
        { id: '10d', level: 'BEG', make: function (r, sh) {
          return B.number('(d) What is the plane’s height ' + t(sh.q) + ' second' + (sh.q === 1 ? '' : 's') + ' into the dive?', sh.hq, function (u) {
            if (same(u, sh.q * sh.q + 2 * sh.p * sh.q + sh.c)) return { code: 'sign', hint: 'Check the middle term: ' + t('-' + 2 * sh.p + '(' + sh.q + ')=-' + 2 * sh.p * sh.q) + '.' };
            return null;
          }, 'Substitute ' + t('t=' + sh.q) + ':<br>' + t('h=(' + sh.q + ')^{2}-' + 2 * sh.p + '(' + sh.q + ')+' + sh.c + '=' + sh.q * sh.q + '-' + 2 * sh.p * sh.q + '+' + sh.c + '=' + sh.hq) + ' m', [HINT_EVAL.replace(t('x'), t('t'))], 'h at t=q', { after: 'm' });
        } },
        { id: '10e', level: 'PRG', make: function (r, sh) {
          var o = 2 * sh.p - sh.q;
          return B.number('(e) At what other time during the dive does the plane reach this same height?', o, function (u) {
            if (same(u, sh.q)) return { code: 'same-time', hint: 'That is the time in (d). Find the <b>other</b> time the height is ' + t(sh.hq) + ' m.' };
            if (same(u, 2 * sh.p)) return { code: 'end-time', hint: 'At ' + t('t=' + 2 * sh.p) + ' the plane is back at ' + t(sh.c) + ' m. Use the symmetry of the parabola about ' + t('t=' + sh.p) + '.' };
            if (same(u, sh.p + sh.q) && sh.p + sh.q !== o) return { code: 'diag', hint: 'Count from the vertex: ' + t('t=' + sh.q) + ' is ' + t(sh.p - sh.q) + ' s <b>before</b> ' + t('t=' + sh.p) + ', so the same height comes ' + t(sh.p - sh.q) + ' s after it.' };
            return null;
          }, 'The parabola is symmetric about ' + t('t=' + sh.p) + '. ' + t('t=' + sh.q) + ' is ' + t(sh.p - sh.q) + ' s before the vertex, so the same height occurs ' + t(sh.p - sh.q) + ' s after it: ' + t('t=' + sh.p + '+' + (sh.p - sh.q) + '=' + o) + ' s.<br>Check: ' + t('h(' + o + ')=' + o * o + '-' + 2 * sh.p * o + '+' + sh.c + '=' + sh.hq) + ' m ✓',
            ['The graph is symmetric about the time of the lowest point.', 'Or solve ' + t(sh.rule + '=' + sh.hq) + ' (graph ' + t('Y_2=' + sh.hq) + ' and use <b>intersect</b>).'], 'symmetric time', { after: 's' });
        } }] },
      /* ---------------- Q11 ---------------- */
      { num: '11', shared: q11Shared,
        stem: function (sh) { return 'A relation is given by the table of values below.' + HW.valueTable([['x'].concat(sh.xs), ['y'].concat(sh.ys)]); }, parts: [
        { id: '11a', level: 'BEG', outcome: 'RF2', make: function (r, sh) {
          var p = B.pairs('(a) Write the relation as a set of ordered pairs.', sh.pts, {}, 'Each column of the table gives one pair ' + t('(x,\\ y)') + ':<br>' + t('\\{' + sh.pts.map(ptT).join(',\\ ') + '\\}'), ['Pair each ' + t('x') + ' with the ' + t('y') + ' below it: ' + t('(x,\\ y)') + '.'], 'table to ordered pairs');
          p.bad = ['\\{' + sh.pts.map(function (q) { return ptK([q[1], q[0]]); }).join(', ') + '\\}', '\\{' + sh.pts.slice(1).map(ptK).join(', ') + '\\}'];
          return p;
        } },
        { id: '11b', level: 'LIM', outcome: 'RF2', make: function (r, sh) {
          var ylo = Math.min(-2, Math.min.apply(null, sh.ys) - 1), yhi = Math.max(2, Math.max.apply(null, sh.ys) + 1), base = { x: [-5, 5], y: [ylo, yhi], labels: 2, labelsY: 4, unitX: 16, unitY: Math.min(16, 200 / (yhi - ylo)) };
          var P0 = function (ps) { return Gm(Object.assign({ points: ps.map(function (q) { return { x: q[0], y: q[1] }; }) }, base)); };
          var j = r.int(0, 4); while (sh.xs[j] === 0) j = r.int(0, 4);
          var moved = sh.pts.map(function (q, i) { return i === j ? [-q[0], q[1]] : q; });
          var axisSwap = sh.pts.map(function (q) { return q[0] === 0 ? [q[1], 0] : q; });
          return graphMC(r, '(b) Which graph shows the relation plotted correctly?', [
            { html: P0(sh.pts), right: true },
            { html: Gm(Object.assign({ segs: [{ pts: sh.pts, start: 'closed', end: 'closed' }] }, base)), why: 'The table alone doesn’t say the points should be joined (see part (d)). Plot the five points only.' },
            { html: P0(moved), why: 'Check ' + t(ptT(sh.pts[j])) + ': its ' + t('x') + '-coordinate is ' + t(sh.xs[j]) + ', so it is ' + (sh.xs[j] < 0 ? 'left' : 'right') + ' of the ' + t('y') + '-axis.' },
            { html: P0(axisSwap), why: 'Check ' + t(ptT([0, sh.b])) + ': ' + t('x=0') + ', so this point is on the ' + t('y') + '-axis, not the ' + t('x') + '-axis.' }],
            'Plot each pair: go across to ' + t('x') + ', then up or down to ' + t('y') + '. Five separate points, not joined.', ['Go along the ' + t('x') + '-axis first, then up or down.'], 'plot a table');
        } },
        { id: '11c', level: 'BEG', outcome: 'RF1', make: function (r, sh) {
          var cols = [{ id: 'Q1', html: 'QI' }, { id: 'Q2', html: 'QII' }, { id: 'Q3', html: 'QIII' }, { id: 'Q4', html: 'QIV' }, { id: 'axis', html: 'on an axis' }];
          var rows = sh.pts.map(function (q, i) { return { id: 'p' + i, html: t(ptT(q)) }; }), want = {};
          sh.pts.forEach(function (q, i) { want['p' + i] = quad(q); });
          return B.grid('(c) Name the quadrant each plotted point lies in. (One point lies on an axis.)', rows, cols, want, { why: function (rid, got) {
            var q = sh.pts[Number(rid.slice(1))];
            if (q[0] === 0) return { code: 'row', hint: t(ptT(q)) + ' has ' + t('x=0') + ': it lies <b>on the ' + t('y') + '-axis</b>, which is not in any quadrant.' };
            return { code: 'row', hint: 'Check ' + t(ptT(q)) + ': ' + t('x') + ' is ' + (q[0] > 0 ? 'positive' : 'negative') + ' and ' + t('y') + ' is ' + (q[1] > 0 ? 'positive' : 'negative') + '. QI ' + t('(+,+)') + ', QII ' + t('(-,+)') + ', QIII ' + t('(-,-)') + ', QIV ' + t('(+,-)') + '.' };
          } }, sh.pts.map(function (q) { var z = quad(q); return t(ptT(q)) + ': ' + (z === 'axis' ? 'on the ' + t('y') + '-axis (no quadrant)' : 'Q' + { Q1: 'I', Q2: 'II', Q3: 'III', Q4: 'IV' }[z]); }).join('<br>'),
            ['QI is top right, then QII, QIII, QIV going counterclockwise.', 'A point with a coordinate of ' + t('0') + ' is on an axis.'], 'quadrants of points');
        } },
        { id: '11d', level: 'EMG', outcome: 'RF1', make: function (r) {
          return mc(r, '(d) Should the points be joined? What would you need to know to decide?', [
            { html: 'You can’t tell from the table alone: you need to know what ' + t('x') + ' and ' + t('y') + ' represent. Join them only if ' + t('x') + ' is a continuous quantity (such as time).', right: true },
            { html: 'Yes — the points lie on a straight line, so they should be joined.', why: 'Lying on a line doesn’t make the inputs continuous. If ' + t('x') + ' counted people, values between the points would mean nothing.' },
            { html: 'No — points from a table of values are never joined.', why: 'Some tables come from continuous quantities (time, length). Then the points <b>are</b> joined.' },
            { html: 'Yes — the relation is a function, so its graph must be connected.', why: 'A function can be discrete (separate dots). Being a function is about one output per input, not about joining.' }],
            'Joining depends on the variables, not on the numbers: if ' + t('x') + ' is continuous (time, length, volume) the points are joined; if ' + t('x') + ' can only take separate values (a count), they are not. With no context, plot the points only.',
            ['Think about discrete vs continuous variables.'], 'join the points?');
        } },
        { id: '11e', level: 'BEG', outcome: 'RF2', make: function (r, sh) {
          var D = lst(sh.xs), R = lst(sh.ys);
          return drPart('(e) State the domain and the range.', D, R, { bad: [[bld('x', sh.xs[0], sh.xs[4]), R], [D, '\\{' + sh.ys.join(', ') + '\\}' === R ? bld('y', Math.min.apply(null, sh.ys), Math.max.apply(null, sh.ys)) : '\\{' + sh.ys.map(nf).join(', ') + '\\}']] },
            'Finitely many values, so each is a list, smallest first:<br>' + t('D=' + D) + '<br>' + t('R=' + R), [HINT_DR, HINT_LIST], 'D and R of a table');
        } },
        { id: '11f', level: 'PRG', make: function (r, sh) {
          var m = sh.m, b = sh.b, T = P(lin([[m, 'x'], [b, '']])), x1 = sh.xs[1], x2 = sh.xs[2];
          var W = [{ is: P(lin([[-m, 'x'], [b, '']])), code: 'sign', hint: 'Check the sign of the slope: as ' + t('x') + ' goes up by ' + t('1') + ', does ' + t('y') + ' go up or down?' },
            { is: P(lin([[b, 'x'], [m, '']])), code: 'diag', hint: 'The slope and the ' + t('y') + '-intercept are swapped. The ' + t('y') + '-intercept is the output when ' + t('x=0') + ': ' + t(b) + '.' },
            { is: P(lin([[m, 'x'], [-b, '']])), code: 'diag', hint: 'Check the constant: when ' + t('x=0') + ', ' + t('y=' + b) + '.' }];
          if (Math.abs(m) !== 1) W.push({ is: P(lin([[[1, m], 'x'], [b, '']])), code: 'rate-flip', hint: 'Slope is change in ' + t('y') + ' divided by change in ' + t('x') + ', not the other way round.' });
          var p = K.P.poly('(f) The points lie on a straight line. Write its equation in function notation.', T, { before: 'f(x)=', wrong: W },
            'Pattern: from ' + t('x=' + x1) + ' to ' + t('x=' + x2) + ', ' + t('y') + ' changes by ' + t(sh.ys[2] - sh.ys[1]) + ' in ' + t(x2 - x1) + ' step' + (x2 - x1 === 1 ? '' : 's') + ', so ' + t('y') + ' changes by ' + t(m) + ' for each unit of ' + t('x') + '. When ' + t('x=0') + ', ' + t('y=' + b) + '.<br>' + t('f(x)=' + lin([[m, 'x'], [b, '']])) + '<br><i>Check</i> ' + t(ptT(sh.pts[4])) + ': ' + t(m + '(' + sh.xs[4] + ')' + (b < 0 ? b : '+' + b) + '=' + sh.ys[4]) + ' ✓',
            ['How much does ' + t('y') + ' change for each step of ' + t('1') + ' in ' + t('x') + '? That is the coefficient of ' + t('x') + '.', 'The constant is the output when ' + t('x=0') + ' — it’s in the table.'], 'equation from a table');
          p.bad = W.map(function (w) { return PL.tex(w.is); }); p.answer = t('f(x)=' + p.key);
          return p;
        } },
        { id: '11g', level: 'EMG', outcome: 'RF1', make: function (r, sh) {
          return intPart('(g) State the ' + t('x') + '-intercept and the ' + t('y') + '-intercept of that line as ordered pairs.', [[sh.k, 0]], [[0, sh.b]], {},
            t('x') + '-int: set ' + t('y=0') + ': ' + t('0=' + lin([[sh.m, 'x'], [sh.b, '']]) + '\\Rightarrow x=' + sh.k) + ', so ' + t(ptT([sh.k, 0])) + '.<br>' + t('y') + '-int: ' + t('f(0)=' + sh.b) + ', so ' + t(ptT([0, sh.b])) + '.',
            ['For the ' + t('x') + '-intercept set ' + t('f(x)=0') + '; for the ' + t('y') + '-intercept evaluate ' + t('f(0)') + '.'], 'intercepts of the line');
        } }] },
      /* ---------------- Q12 ---------------- */
      { num: '12', shared: q12Shared, outcome: 'RF1',
        stem: function (sh) { return 'A ball is thrown upward from a ' + t(sh.h0) + ' m platform. Its height is ' + t('h(t)=' + sh.rule) + ', where ' + t('h') + ' is in metres and ' + t('t') + ' is in seconds. You will use a graphing calculator.'; }, parts: [
        { id: '12a', level: 'EMG', make: function (r, sh) {
          var feat = [{ x: 0, y: sh.h0, name: 'the throw' }, { x: sh.p, y: sh.M, name: 'the highest point' }, { x: sh.T, y: 0, name: 'the landing' }], chk = winChk(feat);
          var xmax = Math.ceil(sh.T + 0.5), ymax = Math.ceil((sh.M + 3) / 5) * 5, key = ['0', String(xmax), '1', '0', String(ymax), '5'];
          var good = [['-1', String(xmax + 1), '1', '-5', String(ymax + 5), '5']];
          return { prompt: '(a) State window settings that show the whole flight, from the throw until the ball lands.', input: { type: 'fields', fields: WL.map(function (n) { return { label: wT(n), name: n }; }) }, check: chk, key: key,
            answer: 'One good window: ' + t('X_{\\text{min}}=0,\\ X_{\\text{max}}=' + xmax + ',\\ X_{\\text{scl}}=1,\\ Y_{\\text{min}}=0,\\ Y_{\\text{max}}=' + ymax + ',\\ Y_{\\text{scl}}=5') + ' (many others work).',
            solution: 'The ball starts at ' + t(ptT([0, sh.h0])) + ', peaks at ' + t(ptT([sh.p, sh.M])) + ' and lands a little after ' + t('t=' + Math.floor(sh.T)) + ' (about ' + t(sh.T2) + ' s), so e.g. ' + t('x:[0,\\ ' + xmax + ',\\ 1],\\ y:[0,\\ ' + ymax + ',\\ 5]') + '. Any window that shows ' + t('0\\le t\\le ' + sh.T2) + ' and the highest point works.' +
              fig(G({ x: [0, xmax], y: [0, ymax], unitX: 260 / xmax, unitY: 180 / ymax, grid: 1, gridY: 5, labels: 1, labelsY: 5, firstQuadrant: true, xName: 't', yName: 'h', fns: [{ f: sh.f, from: 0, to: sh.T }], max: 300, aria: 'calculator screen' })),
            hints: ['Estimate the features first: the start ' + t('(0,\\ ' + sh.h0 + ')') + ', the highest point, and where ' + t('h=0') + '.', 'Make ' + wT('Xmax') + ' a little past the landing time and ' + wT('Ymax') + ' a little above the greatest height.'],
            text: 'window for the ball', good: good, bad: [['-10', '10', '1', '-10', '10', '1'], ['0', '2', '1', '0', String(ymax), '5'], ['0', String(xmax), '1', '0', '10', '1'], ['0', String(xmax), '0', '0', String(ymax), '5']].filter(function (b) { return chk(b).v !== 'correct'; }) };
        } },
        { id: '12b', level: 'EMG', make: function (r, sh) {
          var items = [numF('greatest height ' + t('='), sh.M, function (u) {
            if (same(u, sh.p)) return { code: 'max-swap', hint: 'That is the time. The height is the ' + t('y') + '-value of the maximum.' };
            if (same(u, sh.M - sh.h0)) return { code: 'no-platform', hint: 'Include the platform: the rule has ' + t('+' + sh.h0) + '.' };
            return null;
          }, 'm'), numF('at time ' + t('t='), sh.p, function (u) { if (same(u, sh.M)) return { code: 'max-swap', hint: 'That is the height. The time is the ' + t('x') + '-value of the maximum.' }; return null; }, 's')];
          var p = fieldsOf('(b) Use <b>CALC 4:maximum</b> to find the greatest height reached and the time it occurs.', items, t(sh.M) + ' m at ' + t('t=' + sh.p) + ' s',
            'The maximum screen shows ' + t('X=' + sh.p) + ', ' + t('Y=' + sh.M) + ': the greatest height is ' + t(sh.M) + ' m at ' + t('t=' + sh.p) + ' s.<br><i>Check:</i> ' + t('h(' + sh.p + ')=-5(' + sh.p * sh.p + ')+' + sh.v * sh.p + '+' + sh.h0 + '=' + sh.M) + '.',
            ['Use <b>CALC 4:maximum</b>: set a left bound, a right bound and a guess around the top of the graph.'], 'maximum of the ball');
          p.bad = [[String(sh.p), String(sh.M)]];
          return p;
        } },
        { id: '12c', level: 'EMG', make: function (r, sh) {
          return B.approx('(c) Use <b>CALC 2:zero</b> to find when the ball lands, to the nearest hundredth of a second.', sh.T, 2, { after: 's', diag: function (u) {
            if (same(u, sh.Tn)) return { code: 'neg-root', hint: 'That zero is at a negative time, before the throw. The ball lands at the <b>positive</b> zero.' };
            if (same(u, 2 * sh.p)) return { code: 'no-platform', hint: 'At ' + t('t=' + 2 * sh.p) + ' the ball is back at platform height (' + t(sh.h0) + ' m), not on the ground. Find where ' + t('h=0') + '.' };
            return null;
          } }, 'Use <b>2:zero</b> with bounds around the right-hand crossing: ' + t('t\\doteq ' + sh.T2) + ' s. (The other zero, ' + t('t\\doteq ' + sh.Tn) + ', is before the throw and is rejected.)',
            ['The ball lands when ' + t('h=0') + ': that is an ' + t('x') + '-intercept of the graph.'], 'landing time');
        } },
        { id: '12d', level: 'PRG', outcome: 'RF2', make: function (r, sh) {
          var D = bld('t', 0, sh.T2);
          return setPart('(d) State the domain of the function in this context.', D, { v: 't', wrong: [
            { is: all('t'), code: 'dr-context', hint: 'The equation works for any ' + t('t') + ', but the flight only lasts from the throw (' + t('t=0') + ') until the ball lands.' },
            { is: bld('t', 0, null), code: 'dr-context', hint: 'Time starts at ' + t('0') + ', but the flight also ends — when the ball lands.' },
            { is: bld('t', 0, sh.p), code: 'dr-context', hint: 'The ball keeps moving after the highest point — the flight ends when it lands.' },
            { is: bld('t', sh.Tn, sh.T2), code: 'neg-root', hint: 'A negative time is before the throw. Start the domain at ' + t('t=0') + '.' }] },
            'Time runs from the throw until the ball lands:<br>' + t('D=' + D) + '<br>Time is continuous, so this is set-builder form, not a list.',
            ['When does the flight start? When does it end (part (c))?'], 'domain of the flight');
        } }] },
      /* ---------------- Q13 ---------------- */
      { num: '13', outcome: 'RF1',
        shared: function (r) {
          var a = r.pick([20, 20, 10, 30]), s = r.pick([40, 40, 30, 50, 20]), d = r.pick([20, 20, 10, 30]), w = r.pick([30, 30, 20, 40]);
          if (a + s + d + w > 130) s = 30;
          return { a: a, s: s, d: d, w: w, T: a + s + d + w };
        },
        stem: function (sh) { return 'A cyclist starts from rest, speeds up steadily for ' + t(sh.a) + ' s, holds a steady speed for ' + t(sh.s) + ' s, slows steadily to a stop over the next ' + t(sh.d) + ' s, then stays stopped for ' + t(sh.w) + ' s.'; }, parts: [
        { id: '13a', level: 'EMG', make: function (r, sh) {
          var X = sh.T + 10, V = 3.5, A = sh.a, S2 = sh.a + sh.s, D2 = S2 + sh.d;
          var g = function (pts) { return Gm({ x: [0, X], y: [0, 5], grid: 10, gridY: 1, labels: 20, labelsX: 20, labelsY: 1000, unitX: 170 / X, unitY: 22, firstQuadrant: true, xName: 't', yName: 'v', segs: [{ pts: pts }], aria: 'speed–time option' }); };
          return graphMC(r, '(a) Which graph shows the cyclist’s <b>speed</b> against time (seconds)?', [
            { html: g([[0, 0], [A, V], [S2, V], [D2, 0], [sh.T, 0]]), right: true },
            { html: g([[0, 0], [A, 2], [S2, V], [D2, 0], [sh.T, 0]]), why: 'During the steady stage the speed doesn’t change, so that piece must be <b>horizontal</b>.' },
            { html: g([[0, 0], [A, V], [S2, V], [D2, 1.5], [sh.T, 1.5]]), why: 'At the end the cyclist is <b>stopped</b>: speed ' + t('0') + ', so the last piece lies along the time axis.' },
            { html: g([[0, 0], [A, V], [S2, V], [S2, 0], [sh.T, 0]]), why: 'The cyclist slows <b>steadily</b> over ' + t(sh.d) + ' s, so the speed falls along a slanted line, not straight down.' }],
            'Speed rises steadily from ' + t('0') + ' (' + t('0') + '–' + t(A) + ' s), stays constant (' + t(A) + '–' + t(S2) + ' s), falls steadily to ' + t('0') + ' (' + t(S2) + '–' + t(D2) + ' s), then stays at ' + t('0') + ' (' + t(D2) + '–' + t(sh.T) + ' s).',
            ['On a speed graph, constant speed is a horizontal line and “stopped” means speed ' + t('0') + '.'], 'sketch speed–time');
        } },
        { id: '13b', level: 'BEG', make: function (r, sh) {
          var A = sh.a, S2 = sh.a + sh.s, D2 = S2 + sh.d;
          var rows = r.shuffle([{ id: 'up', html: 'rising segment (' + t('0') + '–' + t(A) + ' s)' }, { id: 'flat', html: 'horizontal segment above the axis (' + t(A) + '–' + t(S2) + ' s)' }, { id: 'down', html: 'falling segment (' + t(S2) + '–' + t(D2) + ' s)' }, { id: 'zero', html: 'horizontal segment along the axis (' + t(D2) + '–' + t(sh.T) + ' s)' }]);
          var cols = [{ id: 'up', html: 'speeding up' }, { id: 'flat', html: 'steady speed' }, { id: 'down', html: 'slowing down' }, { id: 'zero', html: 'stopped' }];
          return B.grid('(b) Label each of the four stages: match each piece of the speed–time graph to what the cyclist is doing.', rows, cols, { up: 'up', flat: 'flat', down: 'down', zero: 'zero' }, { why: function (rid) {
            return { code: 'row', hint: { up: 'Rising speed means the cyclist is speeding up.', flat: 'A horizontal piece above the axis: the speed stays the same, but it isn’t zero.', down: 'Falling speed means slowing down.', zero: 'Along the axis the speed is ' + t('0') + ': the cyclist is stopped.' }[rid] };
          } }, 'Rising → speeding up; horizontal above the axis → steady speed; falling → slowing; along the axis → stopped.', ['On a <b>speed</b> graph, height is speed — not distance.'], 'label speed stages');
        } }] },
      /* ---------------- Q14 ---------------- */
      { num: '14', shared: q14Shared, outcome: 'RF1',
        stem: function (sh) { return 'The graph below shows Amira’s distance from home during a walk.' + q14Fig(sh); }, parts: [
        { id: '14a', level: 'BEG', make: function (r, sh) {
          var rows = [{ id: 's1', html: 'Segment 1 (' + t('0') + '–' + t(sh.a) + ' h)' }, { id: 's2', html: 'Segment 2 (' + t(sh.a) + '–' + t(sh.a + sh.w) + ' h)' }, { id: 's3', html: 'Segment 3 (' + t(sh.a + sh.w) + '–' + t(sh.T) + ' h)' }];
          var cols = [{ id: 'away', html: 'walking away from home' }, { id: 'stop', html: 'stopped' }, { id: 'back', html: 'walking back toward home' }];
          return B.grid('(a) Describe what Amira is doing in each of the three segments.', rows, cols, { s1: 'away', s2: 'stop', s3: 'back' }, { why: function (rid) {
            return { code: 'row', hint: { s1: 'In segment 1 her distance from home <b>increases</b>: she is moving away from home.', s2: 'In segment 2 the graph is flat: her distance doesn’t change, so she has stopped.', s3: 'In segment 3 her distance from home <b>decreases</b>: she is heading back toward home (the graph shows distance from home, not height).' }[rid] };
          } }, 'Segment 1: distance increases at a steady rate — walking away from home, reaching ' + t(sh.D) + ' km.<br>Segment 2: distance unchanged — stopped.<br>Segment 3: distance decreases steadily — walking back toward home (more slowly), ending ' + t(sh.E) + ' km from home.',
            ['Rising graph = distance from home growing; flat = not moving; falling = getting closer to home.'], 'describe distance segments');
        } },
        { id: '14b', level: 'PRG', make: function (r, sh) {
          var d1 = function (u) { if (same(u, 1 / sh.r1)) return { code: 'rate-flip', hint: 'Rate of change is change in distance ÷ change in time (km per hour).' }; return null; };
          var d3 = function (u) {
            if (same(u, sh.r3)) return { code: 'rate-sign', hint: 'Her distance from home is going <b>down</b> in segment 3, so the rate of change is negative.' };
            if (same(u, cl(sh.E / sh.T)) || same(u, cl(sh.E / sh.b))) return { code: 'rate-point', hint: 'Use the <b>change</b> in distance (' + t(sh.E + '-' + sh.D) + ') over the <b>change</b> in time (' + t(sh.T + '-' + (sh.a + sh.w)) + ').' };
            if (same(u, -1 / sh.r3)) return { code: 'rate-flip', hint: 'Divide the change in distance by the change in time, not the other way round.' };
            return null;
          };
          var items = [numF('Segment 1:', sh.r1, d1, 'km/h'), numF('Segment 2:', 0, null, 'km/h'), numF('Segment 3:', -sh.r3, d3, 'km/h')];
          return fieldsOf('(b) Determine her rate of change for each segment.', items, t(sh.r1) + ' km/h, ' + t('0') + ' km/h, ' + t(-sh.r3) + ' km/h',
            t('\\dfrac{' + sh.D + '-0}{' + sh.a + '-0}=' + sh.r1) + ' km/h<br>' + t('\\dfrac{' + sh.D + '-' + sh.D + '}{' + (sh.a + sh.w) + '-' + sh.a + '}=0') + ' km/h<br>' + t('\\dfrac{' + sh.E + '-' + sh.D + '}{' + sh.T + '-' + (sh.a + sh.w) + '}=\\dfrac{' + (sh.E - sh.D) + '}{' + sh.b + '}=' + (-sh.r3)) + ' km/h',
            ['Rate of change = ' + t('\\dfrac{\\text{change in distance}}{\\text{change in time}}') + ' between the ends of each segment.', 'A segment that falls has a negative rate.'], 'rates of change of a walk');
        } },
        { id: '14c', level: 'EMG', make: function (r, sh) {
          return mc(r, '(c) What does the <b>sign</b> of the rate of change in the third segment tell you?', [
            { html: 'It is negative: her distance from home is decreasing, so she is walking back toward home.', right: true },
            { html: 'It is negative: she is walking downhill.', why: 'The graph shows distance from home, not height. A negative rate means that distance is shrinking.' },
            { html: 'It is negative: she is walking more slowly than before.', why: 'The <b>size</b> (' + t(sh.r3) + ' vs ' + t(sh.r1) + ') tells you how fast. The <b>sign</b> tells you the direction: toward or away from home.' },
            { html: 'It is negative: she is now behind her starting point.', why: 'Her distance from home is still positive (' + t(sh.E) + ' km at the end). The sign of the rate describes the change, not her position.' }],
            'A negative rate of change means the dependent variable (distance from home) decreases as time passes — she is heading back toward home. Its size, ' + t(sh.r3) + ' km/h, says she returns more slowly than she set out (' + t(sh.r1) + ' km/h).',
            ['The sign of a rate says whether the output is increasing (+) or decreasing (−).'], 'meaning of a negative rate');
        } }] },
      /* ---------------- Q15 ---------------- */
      { num: '15', shared: q15Shared, outcome: 'RF2',
        stem: function (sh) { return 'The relation graphed below has one solid and one hollow endpoint.' + fig(G({ x: [-6, 6], y: [-6, 6], labels: 2, max: 280, segs: [{ pts: sh.pts, start: 'closed', end: 'open' }], aria: 'relation with one hollow endpoint' })); }, parts: [
        { id: '15', level: 'PRG', make: function (r, sh) {
          var Hp = sh.pts[2], Sp = sh.pts[0], ex1 = sh.flip ? sh.yhi : sh.ylo, otherEnd = sh.flip ? sh.ylo : sh.yhi;
          var rW = [{ is: bld('y', Math.min(Hp[1], Sp[1]), Math.max(Hp[1], Sp[1])), code: 'set-values', hint: 'The range isn’t just between the endpoints’ heights: the ' + (sh.flip ? 'highest' : 'lowest') + ' point is the corner ' + t(ptT(sh.pts[1])) + '.' },
            { is: sh.flip ? bld('y', Hp[1], sh.yhi, false, true) : bld('y', sh.ylo, Hp[1], true, false), code: 'set-values', hint: 'The hollow point’s height, ' + t(Hp[1]) + ', is still reached elsewhere on the graph, and the graph goes beyond it to ' + t(otherEnd) + ' at the solid end.' },
            { is: sh.flip ? bld('y', sh.ylo, sh.yhi, false, true) : bld('y', sh.ylo, sh.yhi, true, false), code: 'set-endpoint', hint: 'The extreme height ' + t(otherEnd) + ' comes from the <b>solid</b> endpoint, so it is included. The hollow point’s height is reached elsewhere, so nothing is excluded from the range.' }];
          return drPart('State the domain and range of the relation.', sh.D, sh.R, { rW: rW },
            'The solid end ' + t(ptT(Sp)) + ' is included; the hollow end ' + t(ptT(Hp)) + ' is not, so ' + t('x=' + Hp[0]) + ' is excluded: ' + t('D=' + sh.D) + '.<br>The ' + (sh.flip ? 'highest' : 'lowest') + ' point is the corner ' + t(ptT(sh.pts[1])) + ' and the ' + (sh.flip ? 'lowest' : 'highest') + ' is the solid end at ' + t('y=' + Sp[1]) + ', which is included. The hollow point’s height, ' + t(Hp[1]) + ', is still reached elsewhere, so the range is ' + t('R=' + sh.R) + '.',
            [HINT_DOTS, 'For the range, look for the lowest and highest points of the whole graph — not just the endpoints.'], 'D and R with a hollow endpoint');
        } }] },
      /* ---------------- Q16 ---------------- */
      { num: '16', shared: q16Shared,
        stem: function (sh) { return 'A phone’s battery charge, in percent, after ' + t('t') + ' hours of video streaming is modelled by the linear function ' + t('B(t)=100-' + sh.r + 't') + '.'; }, parts: [
        { id: '16a', level: 'BEG', make: function (r, sh) {
          var v = 100 - sh.r * sh.k;
          return B.number('(a) Evaluate ' + t('B(' + sh.k + ')') + '.', v, function (u) {
            if (same(u, sh.r * sh.k)) return { code: 'diag', hint: t(sh.r * sh.k) + '% is how much charge has been <b>used</b>. ' + t('B(' + sh.k + ')') + ' is the charge left: ' + t('100-' + sh.r * sh.k) + '.' };
            if (same(u, 100 - sh.r + sh.k)) return { code: 'diag', hint: t(sh.r + 't') + ' means ' + t(sh.r + '\\times t') + '.' };
            return null;
          }, t('B(' + sh.k + ')=100-' + sh.r + '(' + sh.k + ')=100-' + sh.r * sh.k + '=' + v), [HINT_EVAL.replace(t('x'), t('t'))], 'B(k)', { after: '%' });
        } },
        { id: '16a2', sub: 'a ii', level: 'EMG', make: function (r, sh) {
          var v = 100 - sh.r * sh.k;
          return mc(r, '(a) What does ' + t('B(' + sh.k + ')=' + v) + ' mean?', [
            { html: 'After ' + t(sh.k) + ' hour' + (sh.k === 1 ? '' : 's') + ' of streaming, the battery is at ' + t(v) + '%.', right: true },
            { html: 'After ' + t(v) + ' hours of streaming, the battery is at ' + t(sh.k) + '%.', why: 'In ' + t('B(t)') + ' the number in the brackets is the input, ' + t('t') + ' (hours). The output ' + t(v) + ' is the charge.' },
            { html: 'After ' + t(sh.k) + ' hour' + (sh.k === 1 ? '' : 's') + ', ' + t(v) + '% of the charge has been used.', why: t('B(t)') + ' is the charge <b>remaining</b>. Only ' + t(100 - v) + '% has been used.' },
            { html: 'The battery loses ' + t(v) + '% every ' + t(sh.k) + ' hour' + (sh.k === 1 ? '' : 's') + '.', why: 'The rate of loss is the ' + t(sh.r) + '% per hour in the rule. ' + t('B(' + sh.k + ')') + ' is the charge at one moment.' }],
            t('B(' + sh.k + ')=' + v) + ': input ' + t(sh.k) + ' hours of streaming, output ' + t(v) + '% charge left.', ['Input in the brackets, output after the equals sign.'], 'meaning of B(k)');
        } },
        { id: '16b', level: 'PRG', make: function (r, sh) {
          return B.number('(b) Solve ' + t('B(t)=' + sh.V) + '.', sh.m, function (u) {
            if (same(u, 100 - sh.r * sh.V)) return { code: 'ev-instead', hint: 'You substituted ' + t(sh.V) + ' for ' + t('t') + '. Here ' + t(sh.V) + ' is the <b>output</b>: solve ' + t('100-' + sh.r + 't=' + sh.V) + '.' };
            if (same(u, -sh.m)) return { code: 'sign', hint: 'Check the sign when you divide by ' + t('-' + sh.r) + '.' };
            if (same(u, 100 - sh.V)) return { code: 'no-divide', hint: 'Nearly: ' + t(sh.r + 't=' + (100 - sh.V)) + ' — now divide by ' + t(sh.r) + '.' };
            return null;
          }, t('100-' + sh.r + 't=' + sh.V) + '<br>' + t(sh.r + 't=' + (100 - sh.V)) + '<br>' + t('t=' + sh.m) + ' hours', [HINT_SOLVE], 'solve B(t)=V', { before: t('t='), after: 'h' });
        } },
        { id: '16c', level: 'PRG', make: function (r, sh) {
          return B.approx('(c) After how many hours is the battery empty? (nearest hundredth)', sh.T, 2, { after: 'h', diag: function (u) { if (same(u, K.roundTo(sh.r / 100, 2))) return { code: 'rate-flip', hint: 'Divide ' + t('100') + ' by ' + t(sh.r) + ', not the other way round.' }; return null; } },
            'Empty means ' + t('B(t)=0') + ':<br>' + t('100-' + sh.r + 't=0') + '<br>' + t('t=\\dfrac{100}{' + sh.r + '}\\approx ' + sh.T2) + ' hours', ['“Empty” means the output is ' + t('0') + ': solve ' + t('B(t)=0') + '.'], 'battery empty time');
        } },
        { id: '16d', level: 'PRG', outcome: 'RF2', make: function (r, sh) {
          var D = bld('t', 0, sh.T2), R = bld('B', 0, 100);
          return drPart('(d) State a realistic domain and range.', D, R, { dv: 't', rv: 'B',
            dW: [{ is: all('t'), code: 'dr-context', hint: 'Streaming time can’t be negative, and the model stops when the battery is empty.' }, { is: bld('t', 0, null), code: 'dr-context', hint: 'The battery is empty at ' + t('t\\approx ' + sh.T2) + ' h, so the model stops there.' }, { is: bld('t', 0, 100), code: 'dr-context', hint: t('100') + ' is the starting charge, not a time. The time runs out when ' + t('B(t)=0') + '.' }],
            rW: [{ is: all('B'), code: 'dr-context', hint: 'A battery charge runs from empty (' + t('0') + '%) to full (' + t('100') + '%).' }, { is: bld('B', 0, sh.T2), code: 'set-swap', hint: 'The range is the charge (' + t('B') + '), from ' + t('0') + ' to ' + t('100') + '.' }] },
            'Streaming runs from ' + t('t=0') + ' until the battery is empty at ' + t('t\\approx ' + sh.T2) + ': ' + t('D=' + D) + '.<br>The charge falls from ' + t('100') + ' to ' + t('0') + ': ' + t('R=' + R) + '.',
            ['When does the model start and stop making sense?', 'Use ' + t('t') + ' for the domain and ' + t('B') + ' for the range.'], 'realistic D and R of battery');
        } }] },
      /* ---------------- Extension ---------------- */
      { num: '17', section: 'Extension — beyond the Math 10C outcomes', stem: '<i>(Extension, Multiple Choice)</i>', parts: [
        { id: '17', level: 'PRG', make: function (r) {
          var b = r.pick([2, 2, 2, 3]), k = b === 2 ? r.pick([5, 5, 3, 4, 6]) : r.pick([2, 3, 4]), P1 = Math.pow(b, k);
          return mc(r, 'If ' + t('f(x)=' + b + '^{x}') + ' and ' + t('f(-a)=\\dfrac{1}{' + P1 + '}') + ', then ' + t('a='), [
            { html: t(k), right: true },
            { html: t('-' + k), why: t('f(-a)=' + b + '^{-a}') + ' and ' + t('\\dfrac{1}{' + P1 + '}=' + b + '^{-' + k + '}') + ', so ' + t('-a=-' + k) + ' — that makes ' + t('a') + ' positive.' },
            { html: t('-\\dfrac{1}{' + k + '}'), why: 'Write ' + t(P1) + ' as a power of ' + t(b) + ' and compare exponents.' },
            { html: t('\\dfrac{1}{' + k + '}'), why: 'Write ' + t(P1) + ' as a power of ' + t(b) + ' and compare exponents.' }],
            t('f(-a)=' + b + '^{-a}') + ', and ' + t('\\dfrac{1}{' + P1 + '}=\\dfrac{1}{' + b + '^{' + k + '}}=' + b + '^{-' + k + '}') + '.<br>Equal bases give equal exponents: ' + t('-a=-' + k) + ', so ' + t('a=' + k) + '.',
            ['Write ' + t('\\dfrac{1}{' + P1 + '}') + ' as a power of ' + t(b) + '.'], 'solve 2^(-a)=1/32', true);
        } }] },
      { num: '18', stem: '<i>(Extension, Numerical Response)</i>', parts: [
        { id: '18', level: 'ADV', make: function (r) {
          var a0, b0, c0, s, A, Bc, C, ans;
          for (var g = 0; g < 300; g++) {
            a0 = r.pick([-4, -4, -2, -3]); b0 = r.pick([-3, -3, -2, -5, 4]); c0 = r.pick([2, 2, 1, 5, -1]); s = r.pick([3, 3, 2, 1, 4]);
            if (r.chance(0.3)) { a0 = -4; b0 = -3; c0 = 2; s = 3; }
            A = a0; Bc = 2 * a0 * s + b0; C = a0 * s * s + b0 * s + c0; ans = A - Bc - C;
            if (ans > 0 && ans < 10000) break;
          }
          var rule = lin([[c0, ''], [b0, 'x'], [a0, 'x^{2}']]);
          var w1 = a0 - b0 - (a0 * s * s + b0 * s + c0), w2 = A + Bc + C, w3 = a0 - b0 - (c0 + s);
          return B.nr('If ' + t('f(x)=' + rule) + ', and if ' + t('f(x+' + s + ')') + ' is written in the form ' + t('ax^{2}+bx+c') + ', the value of ' + t('a-b-c') + ' is ________.', ans, function (u) {
            if (same(u, w1) && w1 !== ans) return { code: 'sq-split', hint: t('(x+' + s + ')^{2}=x^{2}+' + 2 * s + 'x+' + s * s) + ' — don’t forget the middle term.' };
            if (same(u, -w2) || same(u, w2)) return { code: 'abc-sum', hint: 'Check the final step: ' + t('a-b-c') + ' with ' + t('a=' + A) + ', ' + t('b=' + Bc) + ', ' + t('c=' + C) + '. Subtracting a negative adds.' };
            if (same(u, w3) && w3 !== ans) return { code: 'shift-add', hint: t('f(x+' + s + ')') + ' means replace every ' + t('x') + ' with ' + t('(x+' + s + ')') + ' — not add ' + t(s) + ' to the output.' };
            return null;
          }, 'Replace every ' + t('x') + ' with ' + t('(x+' + s + ')') + ':<br>' + t('f(x+' + s + ')=' + c0 + (b0 < 0 ? '-' + (-b0) : '+' + b0) + '(x+' + s + ')' + (a0 < 0 ? '-' + (-a0) : '+' + a0) + '(x+' + s + ')^{2}') + '<br>' + t('(x+' + s + ')^{2}=x^{2}+' + 2 * s + 'x+' + s * s) + '<br>' + t('f(x+' + s + ')=' + lin([[A, 'x^{2}'], [Bc, 'x'], [C, '']])) + '<br>So ' + t('a=' + A + ',\\ b=' + Bc + ',\\ c=' + C) + ' and ' + t('a-b-c=' + A + '-(' + Bc + ')-(' + C + ')=' + ans) + '.',
            ['Substitute ' + t('(x+' + s + ')') + ' for ' + t('x') + ' everywhere, expand, and collect like terms.', 'Keep the signs of ' + t('a') + ', ' + t('b') + ' and ' + t('c') + ' when you work out ' + t('a-b-c') + '.'], 'f(x+s) coefficients NR');
        } }] },
      { num: '19', stem: '<i>(Extension, Numerical Response)</i>', parts: [
        { id: '19', level: 'ADV', make: function (r) {
          var c, m, pn, qd, g0;
          for (var g = 0; g < 100; g++) {
            c = r.pick([3, 3, 2, 4, 5]); m = r.pick([4, 4, 2, 3, 5]);
            pn = c * (m * m - 1); qd = (m + c) * (1 + c * m); g0 = gcd(pn, qd);
            if (pn / g0 < 10000) break;
          }
          var p = pn / g0, q = qd / g0;
          return B.nr(t('f(a)=\\dfrac{a}{a+' + c + '}') + '. The exact value of ' + t('f(' + m + ')-f\\!\\left(\\dfrac{1}{' + m + '}\\right)') + ', written as a rational number in simplest form, is ' + t('\\dfrac{p}{q}') + '. The value of ' + t('p') + ' is ________.', p, function (u) {
            if (same(u, q)) return { code: 'nr-denom', hint: 'That is the denominator ' + t('q') + '. The question asks for the numerator ' + t('p') + '.' };
            if (g0 > 1 && same(u, pn)) return { code: 'nr-unsimp', hint: 'Simplify the fraction first: ' + t('\\dfrac{' + pn + '}{' + qd + '}') + ' has a common factor of ' + t(g0) + '.' };
            return null;
          }, t('f(' + m + ')=\\dfrac{' + m + '}{' + m + '+' + c + '}=\\dfrac{' + m + '}{' + (m + c) + '}') + '<br>' + t('f\\!\\left(\\dfrac{1}{' + m + '}\\right)=\\dfrac{\\frac{1}{' + m + '}}{\\frac{1}{' + m + '}+' + c + '}=\\dfrac{\\frac{1}{' + m + '}}{\\frac{' + (1 + c * m) + '}{' + m + '}}=\\dfrac{1}{' + (1 + c * m) + '}') + '<br>' + t('\\dfrac{' + m + '}{' + (m + c) + '}-\\dfrac{1}{' + (1 + c * m) + '}=\\dfrac{' + m * (1 + c * m) + '-' + (m + c) + '}{' + qd + '}=\\dfrac{' + pn + '}{' + qd + '}' + (g0 > 1 ? '=\\dfrac{' + p + '}{' + q + '}' : '')) + '<br>In simplest form, ' + t('p=' + p) + '.',
            ['Work out each value separately; for ' + t('f\\!\\left(\\frac{1}{' + m + '}\\right)') + ' multiply the top and bottom by ' + t(m) + '.', 'Use a common denominator, then simplify.'], 'f(m)-f(1/m) numerator NR');
        } }] },
      { num: '20', stem: '<i>(Extension)</i>', parts: [
        { id: '20', level: 'EMG', outcome: 'RF1', make: function (r) {
          var A, Bq, C, v;
          for (var g = 0; g < 200; g++) {
            A = r.pick([3, 3, 2, 5, 7]); Bq = r.pick([5, 5, 2, 3, 4]); C = r.pick([9, 9, 6, 10, 12, 15, 20]);
            if (r.chance(0.3)) { A = 3; Bq = 5; C = 9; }
            v = C / A; var sv = Math.sqrt(v);
            if (A !== Bq && Math.abs(sv - Math.round(sv)) > 1e-9 && Math.abs(Math.sqrt(C / Bq) - sv) > 0.02) break;
          }
          var x = Math.sqrt(C / A);
          return B.approx('To the nearest hundredth, determine the positive ' + t('x') + '-intercept of the graph of ' + t(A + 'x^{2}+' + Bq + 'y^{2}=' + C) + '.', x, 2, { diag: function (u) {
            if (same(u, K.roundTo(Math.sqrt(C / Bq), 2))) return { code: 'used-y', hint: 'That is the ' + t('y') + '-intercept. For the ' + t('x') + '-intercept set ' + t('y=0') + '.' };
            if (same(u, K.roundTo(C / A, 2))) return { code: 'no-root', hint: 'That is ' + t('x^{2}') + '. Take the square root.' };
            return null;
          } }, 'Substitute ' + t('y=0') + ': ' + t(A + 'x^{2}=' + C) + ', so ' + t('x^{2}=' + frT(C, A)) + ' and ' + t('x=\\pm\\sqrt{' + frT(C, A) + '}') + '. The positive ' + t('x') + '-intercept is ' + t('\\approx ' + K.roundTo(x, 2).toFixed(2)) + '.',
            ['On the ' + t('x') + '-axis, ' + t('y=0') + '.'], 'x-intercept of an ellipse');
        } }] }
    ],
    extra: [/*@@EXTRA@@*/]
  });
})(window);
