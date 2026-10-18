/* Math 10C · Unit 5 · Lesson 10 — Relations and Functions Review: Domain, Range, and Function Notation
 * (cumulative review — each part is tagged with the outcome it tests: RF1 situations, graphs, intercepts, rates;
 * RF2 relations, functions, domain and range; RF8 function notation)
 * Assignment questions 1–20 (u5_L10.tex: multiple choice 1–7, numerical response 8–9, written response 10–16 and the
 * Extension 17–20) and the whole Lesson 10 Extra Practice (u5_EP10.tex, Q1–20).
 * Every part is a generator that keeps the booklet question's structure (signs, which endpoint is hollow, a value
 * reached twice, a flat piece, a stopping point in a context, a fraction answer) and changes the numbers; the booklet's
 * numbers are among the possible values. Plotting and sketching (11b, 13a, Extra 6a–c) use the graph pad (js/draw.js):
 * exact plots via K.graphExact, the cyclist's speed story via K.graphStory (stages and times checked, any steady-speed
 * height), the open "sketch a relation with this domain/range" tasks via K.graphRules plus a local intercept count;
 * "explain" items become multiple choice with misconception hints; calculator items ask for the values the calculator finds.
 * js/draw2.js: graphs whose domain and range are asked (15, Extra 1b, 2a, 4a, 4b, 8a, 12b) get a domrange part first (shade
 * them on number lines under the graph, same graph via shared numbers), then the typed set notation; intercepts read off a
 * given graph (Extra 1f, 4a–c iii, 8c, 12f) are tapped on the graph (K.P.points, see tapPart()).
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
    'in-domain': 'Number is in the domain', 'sol-interval': 'Missed the flat piece of solutions', 'sol-point-only': 'Missed the single solution', 'f-sum': 'Added the inputs’ outputs wrongly',
    'rule-xint': 'Sketch: wrong number of x-intercepts', 'rule-yint': 'Sketch: wrong number of y-intercepts'
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
  function fw(W, T) { return W.filter(function (w) { return w.is && !PL.eq(w.is, T); }); }
  /* a single number typed as a decimal, an integer or a plain fraction (not an unworked expression) */
  function valOf(s) { var v = num(s); if (v != null) return v; var q = ex.parse(String(s == null ? '' : s)); if (!q.ok) return null; var pf = ex.plainFraction(q.ast); return pf ? pf[0] / pf[1] : null; }
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
    if (o && o.shade) return shadeDR(prompt, o.shade, D, R, o, sol, hints, text);
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
    var s = String(resp || '').replace(/\\(left|right)\.?/g, '').replace(/\\lparen/g, '(').replace(/\\rparen/g, ')').replace(/\\lbrace|\\rbrace|\\\{|\\\}/g, ' ').replace(/\\[,;:! ]|~/g, ' ').trim();
    if (s.charAt(0) === '{' && s.charAt(s.length - 1) === '}') s = s.slice(1, -1);
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
      if (L.pairs.length === want.length && L.pairs.every(function (p) { return want.some(function (q) { return Math.abs(p[0] - q[0]) < 0.01 && Math.abs(p[1] - q[1]) < 0.01; }); })) return form('decimal', 'Very close — give the <b>exact</b> value (a fraction, not a rounded decimal).');
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
  function tf(r, prompt, truth, why, sol, hints, text) { return B.tf(r, prompt, truth, why, sol, hints, text); }

  /* ---------------- drawings ---------------- */
  function G(spec) { return HW.graph(Object.assign({ x: [-6, 6], y: [-6, 6], labels: 2, max: 300 }, spec)); }
  function fig(s) { return '<div class="fig">' + s + '</div>'; }
  /* ---------------- graph-pad drawings (js/draw.js) ---------------- */
  function seg(a, b, s, e) { return { v: [a, b], s: s || 'closed', e: e || 'closed' }; }
  function poly(vs, s, e) { return { v: vs, s: s || 'closed', e: e || 'closed' }; }
  function drawing(pieces, pts, join) { return { pieces: pieces || [], pts: pts || [], join: join || 'none' }; }
  /* where a drawing meets an axis: axis 'x' -> the x-values where y = 0; axis 'y' -> the y-values where x = 0.
   * Returns { vals: sorted distinct numbers, inf: true when a whole piece lies along that axis } */
  function axisHits(value, axis) {
    var g = HW.draw.geom(value), vals = [], inf = false;
    var add = function (u) { u = cl(u); if (!vals.some(function (w) { return Math.abs(w - u) < 1e-6; })) vals.push(u); };
    var inIv = function (iv, u) { return (u > iv.lo + 1e-9 && u < iv.hi - 1e-9) || (Math.abs(u - iv.lo) < 1e-9 && iv.lc) || (Math.abs(u - iv.hi) < 1e-9 && iv.hc); };
    Object.keys(g.lines).forEach(function (k) {
      var L = g.lines[k];   // A x + B y = C; position along the line is x (or y for a vertical line)
      L.iv.forEach(function (iv) {
        if (axis === 'x') {
          if (L.B === 0) { if (inIv(iv, 0)) add(L.C / L.A); return; }
          if (L.A === 0) { if (Math.abs(L.C) < 1e-9 && iv.hi - iv.lo > 1e-9) inf = true; else if (Math.abs(L.C) < 1e-9) add(iv.lo); return; }
          var x0 = L.C / L.A; if (inIv(iv, x0)) add(x0);
        } else {
          if (L.B === 0) { if (Math.abs(L.C) < 1e-9 && iv.hi - iv.lo > 1e-9) inf = true; else if (Math.abs(L.C) < 1e-9) add(iv.lo); return; }
          if (inIv(iv, 0)) add(L.C / L.B);
        }
      });
    });
    g.pts.forEach(function (p) { if (axis === 'x' && Math.abs(p[1]) < 1e-9) add(p[0]); if (axis === 'y' && Math.abs(p[0]) < 1e-9) add(p[1]); });
    vals.sort(function (a, b) { return a - b; });
    return { vals: vals, inf: inf };
  }
  function padHelp(ends) { return ' Use <b>╱ Line</b>: tap the start, then each corner (tap the last point again to finish).' + (ends ? ' <b>●○ Ends</b> changes an end: solid dot → open dot → arrow.' : ''); }
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

  /* ---------------- graphical answers (js/draw2.js) ----------------
   * shadeDR: shade the domain and range on two number lines under a given graph (domrange). It comes right before the
   * typed set-notation part and shows the same graph (shared numbers); the typed part's wrong sets (dW / rW) are reused as
   * targeted diagnoses, plus generic ones (shading between separate points, dots only for an unbroken graph, stopping at
   * the grid edge where there is an arrow, shading to the end where the graph stops).
   * tapPart: tap the intercepts of a given graph (graph pad in points mode with the graph underneath). */
  var DW = HW.draw;
  function shadowHint(dv, rv) { return 'Shine a light straight down onto the graph: its shadow on the ' + t(dv || 'x') + '-axis is the <b>domain</b>. Shine it from the side: its shadow on the ' + t(rv || 'y') + '-axis is the <b>range</b>.'; }
  var HINT_SH_DOTS = 'Copy the graph’s ends onto the number lines: solid end → solid dot, hollow end → open dot (tap the dot a second time), arrow → shade right to the end of the number line, with no dot.';
  var SH_PROMPT = 'Show the domain and the range on the two number lines: a dot at each end value (solid or open), shaded in between. Then write them in set notation in the next part.';
  function isPt(p) { return Math.abs(p.lo - p.hi) < 1e-9; }
  function shWord(h) { return String(h || '').replace(/use \\\(\\(le|ge) ?\\\)/g, 'show it with a <b>solid</b> dot').replace(/use \\\((<|>)\\\)/g, 'show it with an <b>open</b> dot').replace(/both use \\\(\\le ?\\\)/g, 'both get solid dots'); }
  function shadeHint(got, want, v, name) {
    var allPt = function (ps) { return ps.length > 0 && ps.every(isPt); };
    if (allPt(want) && !allPt(got)) return { code: 'dr-sh-list', hint: 'The graph is separate dots, so the ' + name + ' is only their ' + t(v) + '-values: put a solid dot at each one and shade nothing in between.' };
    if (!allPt(want) && allPt(got) && got.length > 1) return { code: 'dr-sh-fill', hint: 'The graph is unbroken, so every ' + t(v) + '-value between the ends belongs to the ' + name + ' too: shade between your dots.' };
    if (want.length === 1 && got.length === 1) {
      var q = want[0], g = got[0];
      if ((!isFinite(q.lo) && isFinite(g.lo)) || (!isFinite(q.hi) && isFinite(g.hi))) return { code: 'dr-sh-arrow', hint: 'The graph has an arrow, so it keeps going past the edge of the grid: the ' + name + ' has no end on that side. Shade right to the end of the number line.' };
      if ((isFinite(q.lo) && !isFinite(g.lo)) || (isFinite(q.hi) && !isFinite(g.hi))) return { code: 'dr-sh-stop', hint: 'The graph stops at an end dot (not an arrow), so the ' + name + ' stops too: put a dot at that end value and shade only up to it.' };
    }
    return null;
  }
  /* spec: an HW.graph spec of the given graph; o: dv, rv, dW, rW (as for drPart), dom / ran (number-line options) */
  function shadeDR(prompt, spec, D, R, o, sol, hints, text) {
    o = o || {}; var dv = o.dv || 'x', rv = o.rv || 'y';
    var g = Object.assign({ x: [-6, 6], y: [-6, 6], labels: 2 }, spec); g.max = 300;
    var inp = { graph: g, v: dv, w: rv, dom: Object.assign({ labels: 2 }, o.dom || {}), ran: Object.assign({ labels: 2 }, o.ran || {}) };
    if (o.hideGraph !== false) inp.hideGraph = true; // every shading part here repeats the graph its question stem already shows
    var HS = shadowHint(dv, rv), hm = function (h) { return h === HINT_DOTS ? HINT_SH_DOTS : h === HINT_DR ? HS : h; };
    var hs = (hints || []).map(hm); if (hs.indexOf(HINT_SH_DOTS) < 0) hs.push(HINT_SH_DOTS); if (hs.indexOf(HS) < 0) hs.unshift(HS);
    var p = B.domrange(prompt || SH_PROMPT, inp, D, R, sol, hs, (text || 'domain and range') + ' (shade)');
    var parts = function (tex) { return DW.setParts(S.parse(tex).set); }, TD = parts(D), TR = parts(R);
    var prep = function (W, T) { return (W || []).map(function (w) { var q = S.parse(w.is); return q.ok ? { parts: DW.setParts(q.set), code: w.code, hint: shWord(w.sh || w.hint) } : null; }).filter(function (w) { return w && !DW.partsSame(w.parts, T); }); };
    var WD = prep(o.dW, TD), WR = prep(o.rW, TR), base = p.check;
    if (DW.partsSame(TD, TR)) p.bad = p.bad.filter(function (b) { return !(DW.partsSame(DW.numlineParts(b.domain), TD) && DW.partsSame(DW.numlineParts(b.range), TR)); }); // the built-in "swapped" bad is the key when D = R
    p.check = function (resp) {
      var res = base(resp); if (res.v !== 'wrong' || res.code === 'dr-swap') return res;
      resp = resp || {};
      var one = function (val, T, W, v, name) {
        if (!val || (!(val.dots || []).length && !(val.shade || []).length)) return null;
        var G0 = DW.numlineParts(val); if (DW.partsSame(G0, T)) return null;
        for (var i = 0; i < W.length; i++) if (DW.partsSame(G0, W[i].parts)) return W[i];
        return shadeHint(G0, T, v, name) || { code: null };
      };
      var a = one(resp.domain, TD, WD, dv, 'domain');
      if (a) return a.code ? wrong(a.code, '<b>Domain:</b> ' + a.hint) : res;
      var b = one(resp.range, TR, WR, rv, 'range');
      return b && b.code ? wrong(b.code, '<b>Range:</b> ' + b.hint) : res;
    };
    WD.forEach(function (w) { p.bad.push({ domain: DW.numlineKey(w.parts), range: p.key.range }); });
    WR.forEach(function (w) { p.bad.push({ domain: p.key.domain, range: DW.numlineKey(w.parts) }); });
    if (!TD.every(isPt)) p.bad.push({ domain: { dots: p.key.domain.dots.map(function (d) { return { x: d.x, open: false }; }), shade: [] }, range: p.key.range });
    if (TR.every(isPt) && TR.length > 1) p.bad.push({ domain: p.key.domain, range: DW.numlineKey([{ lo: TR[0].lo, hi: TR[TR.length - 1].hi, lc: true, hc: true }]) });
    return p;
  }
  /* tap the intercepts of a given graph. inp: graph-pad window + bg (the graph); onGraph(p) -> true if p is a point of the graph */
  function tapPart(prompt, inp, xs, ys, o, sol, hints, text) {
    o = o || {};
    var key = function (p) { return cl(p[0]) + '|' + cl(p[1]); }, seen = {}, targets = [];
    xs.concat(ys).forEach(function (p) { if (!seen[key(p)]) { seen[key(p)] = 1; targets.push(p); } });
    var ax = o.xName || 'x', wr = [];
    if (ys.length && xs.length) {
      var onlyX = xs.filter(function (p) { return !ys.some(function (q) { return key(q) === key(p); }); }), onlyY = ys.filter(function (p) { return !xs.some(function (q) { return key(q) === key(p); }); });
      if (onlyY.length && onlyX.length === xs.length) wr.push({ pts: xs, code: 'pt-missing', hint: (xs.length > 1 ? 'Those are the ' + t(ax) + '-intercepts' : 'That is the ' + t(ax) + '-intercept') + ' — now also tap the ' + t('y') + '-intercept' + (ys.length > 1 ? 's' : '') + ', where the graph meets the ' + t('y') + '-axis.' });
      if (onlyX.length && onlyY.length === ys.length) wr.push({ pts: ys, code: 'pt-missing', hint: (ys.length > 1 ? 'Those are the ' + t('y') + '-intercepts' : 'That is the ' + t('y') + '-intercept') + ' — now also tap every ' + t(ax) + '-intercept, where the graph meets the ' + t(ax) + '-axis.' });
    }
    var pointHint = function (p) {
      if (targets.some(function (q) { return key(q) === key([p[1], p[0]]); })) return null; // coordinates swapped: the built-in hint says so
      var onAxis = Math.abs(p[0]) < 1e-9 || Math.abs(p[1]) < 1e-9, onG = o.onGraph ? o.onGraph(p) : true, off = typeof o.offHint === 'function' ? o.offHint(p) : o.offHint;
      if (onAxis && !onG) return { code: 'pt-extra', hint: t(ptT(p)) + ' is on an axis, but the graph doesn’t pass through it. ' + (off || 'An intercept is a point <b>of the graph</b> that lies on an axis.') };
      if (!onAxis && onG) return { code: 'pt-extra', hint: t(ptT(p)) + ' is on the graph but not on an axis. An ' + t(ax) + '-intercept has ' + t('y=0') + '; a ' + t('y') + '-intercept has ' + t(ax + '=0') + '.' };
      return null;
    };
    var bg = inp.bg || {}, ink = function (o) { return Object.assign({ color: '#5b6474' }, o); };   // the given graph in grey, so the student's taps (teal) stand out
    inp = Object.assign({}, inp, { bg: { points: (bg.points || []).map(ink), segs: (bg.segs || []).map(ink), fns: (bg.fns || []).map(ink) } });
    var p = B.points(prompt, inp, targets, sol, hints, text,
      { what: 'intercept', whats: 'intercepts', whatHint: 'An intercept is where the graph meets an axis.', wrong: wr.concat(o.wrong || []), pointHint: pointHint });
    p.bad = wr.map(function (w) { return drawing([], w.pts); }).concat([drawing([], targets.slice(1)), drawing([], targets.map(function (q) { return [q[1], q[0]]; }).filter(function (q) { return !seen[key(q)]; }))]).filter(function (b) { return b.pts.length; }).concat(o.bad || []);
    return p;
  }

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
      var shown = [0, 1, 2, 3].map(function (i) { return '<b>' + (i + 1) + '.</b> ' + t('p(x)=' + rules[perm[i]].tex); }).join('<br>');
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

  function q15Part(sh, shade) {
    var Hp = sh.pts[2], Sp = sh.pts[0], ex1 = sh.flip ? sh.yhi : sh.ylo, otherEnd = sh.flip ? sh.ylo : sh.yhi;
    var rW = [{ is: bld('y', Math.min(Hp[1], Sp[1]), Math.max(Hp[1], Sp[1])), code: 'set-values', hint: 'The range isn’t just between the endpoints’ heights: the ' + (sh.flip ? 'highest' : 'lowest') + ' point is the corner ' + t(ptT(sh.pts[1])) + '.' },
      { is: sh.flip ? bld('y', Hp[1], sh.yhi, false, true) : bld('y', sh.ylo, Hp[1], true, false), code: 'set-values', hint: 'The hollow point’s height, ' + t(Hp[1]) + ', is still reached elsewhere on the graph, and the graph goes beyond it to ' + t(otherEnd) + ' at the solid end.' },
      { is: sh.flip ? bld('y', sh.ylo, sh.yhi, false, true) : bld('y', sh.ylo, sh.yhi, true, false), code: 'set-endpoint', hint: 'The extreme height ' + t(otherEnd) + ' comes from the <b>solid</b> endpoint, so it is included. The hollow point’s height is reached elsewhere, so nothing is excluded from the range.' }];
    return drPart(shade ? null : 'State the domain and range of the relation.', sh.D, sh.R, { rW: rW, shade: shade ? { segs: [{ pts: sh.pts, start: 'closed', end: 'open' }] } : null },
      'The solid end ' + t(ptT(Sp)) + ' is included; the hollow end ' + t(ptT(Hp)) + ' is not, so ' + t('x=' + Hp[0]) + ' is excluded: ' + t('D=' + sh.D) + '.<br>The ' + (sh.flip ? 'highest' : 'lowest') + ' point is the corner ' + t(ptT(sh.pts[1])) + ' and the ' + (sh.flip ? 'lowest' : 'highest') + ' is the solid end at ' + t('y=' + Sp[1]) + ', which is included. The hollow point’s height, ' + t(Hp[1]) + ', is still reached elsewhere, so the range is ' + t('R=' + sh.R) + '.',
      [HINT_DOTS, 'For the range, look for the lowest and highest points of the whole graph — not just the endpoints.'], 'D and R with a hollow endpoint');
  }

  /* Q16: phone battery B(t) = 100 - rt */
  function q16Shared(r) {
    var rr = r.pick([12, 12, 6, 7, 9, 11, 14, 15, 16]), T = 100 / rr, top = Math.floor(T - 1e-9);
    var k = rr === 12 && r.chance(0.6) ? 3 : r.int(1, Math.min(top - 1, 6)), mm = rr === 12 && r.chance(0.6) ? 5 : r.int(2, top - 1);
    if (mm === k) mm = k + 1 <= top - 1 ? k + 1 : k - 1;
    return { r: rr, T: T, T2: K.roundTo(T, 2), k: k, m: mm, V: 100 - rr * mm };
  }

  /* =====================================================================================================
   * Extra practice generators
   * ===================================================================================================== */

  /* EP1/EP2: seven dots with two x-intercepts, a y-intercept, and two outputs that occur twice */
  function ep1Shared(r, joined) {
    for (var g = 0; g < 500; g++) {
      var x1 = r.pick([-5, -4, -4]), x2 = r.int(x1 + 1, -2), x3 = r.int(x2 + 1, -1), x5 = r.pick([1, 2, 2]), x6 = r.int(x5 + 1, 4), x7 = r.int(x6 + 1, 5);
      var y1 = r.pick([5, 6, 6]), y2 = r.pick([1, 2, 2, 3]), L = r.pick([2, 3, 3, 4]), y7 = r.pick([3, 4, 4, 5]);
      if (r.chance(0.3)) { x1 = -4; x2 = -3; x3 = -1; x5 = 2; x6 = 4; x7 = 5; y1 = 6; y2 = 2; L = 3; y7 = 4; }
      if (y7 === y1 || y7 === y2) continue;
      if (joined && (y7 <= y2 || Number.isInteger(y2 * (x7 - x6) / y7))) continue;
      var pts = [[x1, y1], [x2, y2], [x3, 0], [0, -L], [x5, -L], [x6, 0], [x7, y7]];
      var ys = pts.map(function (p) { return p[1]; }), top = Math.max(y1, y7);
      return { pts: pts, xs: pts.map(function (p) { return p[0]; }), ys: ys, L: L, top: top, x1: x1, x2: x2, x3: x3, x5: x5, x6: x6, x7: x7, y1: y1, y2: y2, y7: y7,
        D: lst(pts.map(function (p) { return p[0]; })), R: lst(ys) };
    }
    throw new Error('ep1');
  }
  function ep1Fig(sh, joined, nm) {
    return fig(G({ x: [-6, 6], y: [-sh.L - 2, sh.top + 1], labels: 2, max: 300, points: joined ? [{ x: sh.pts[0][0], y: sh.pts[0][1] }, { x: sh.pts[6][0], y: sh.pts[6][1] }] : sh.pts.map(function (p) { return { x: p[0], y: p[1] }; }),
      segs: joined ? [{ pts: sh.pts }] : [], aria: 'graph of ' + nm }));
  }

  function e2aPart(sh, shade) {
    var D = bld('x', sh.x1, sh.x7), R = bld('y', -sh.L, sh.top);
    return drPart(shade ? 'Show the domain and the range of ' + t('g') + ' on the two number lines. (Next you’ll write them in set notation.)' : '(a) State the domain and the range of ' + t('g') + '.', D, R, { shade: shade ? { x: [-6, 6], y: [-sh.L - 2, sh.top + 1], points: [{ x: sh.pts[0][0], y: sh.pts[0][1] }, { x: sh.pts[6][0], y: sh.pts[6][1] }], segs: [{ pts: sh.pts }] } : null, dW: [{ is: sh.D, code: 'set-continuous', hint: 'Joining the dots fills in every ' + t('x') + ' between them, so the domain is no longer a list.' }], rW: [{ is: sh.R, code: 'set-continuous', hint: 'The segments reach every height between the dots, so the range is no longer a list.' }, { is: bld('y', Math.min(sh.y1, sh.y7), Math.max(sh.y1, sh.y7)), code: 'set-values', hint: 'The lowest point isn’t an endpoint: the flat piece at ' + t('y=' + (-sh.L)) + ' is lower.' }] },
      'Joining the dots fills in every ' + t('x') + ' from ' + t(sh.x1) + ' to ' + t(sh.x7) + ', and every ' + t('y') + ' from ' + t(-sh.L) + ' (the flat segment) up to ' + t(sh.top) + ':<br>' + t('D=' + D) + '<br>' + t('R=' + R) + '<br>Both endpoints are solid, so both use ' + t('\\le') + '.',
      [HINT_DR, 'For the range, find the lowest and highest points of the whole graph.'], 'D and R of joined dots');
  }

  function e4aDR(sh, shade) {
    return drPart(shade ? null : '(i) State the domain and the range.', sh.D, sh.R, { shade: shade ? { x: [-6, 6], y: [-5, 5], segs: [{ pts: sh.pts, start: 'closed', end: 'closed' }] } : null, dW: [{ is: bld('x', -sh.m, sh.m), code: 'set-swap', hint: 'That is the spread of ' + t('y') + '-values. Read the domain left to right along the ' + t('x') + '-axis.' }], rW: [{ is: bld('y', -sh.k, sh.k), code: 'set-values', hint: 'The graph goes past the ' + t('y') + '-intercepts, up to its endpoints at ' + t('y=\\pm' + sh.m) + '.' }] },
      'Leftmost/rightmost: the ' + (sh.s > 0 ? 'turning point' : 'endpoints') + ' at ' + t('x=' + Math.min(sh.xe, sh.xv)) + ' and the ' + (sh.s > 0 ? 'endpoints' : 'turning point') + ' at ' + t('x=' + Math.max(sh.xe, sh.xv)) + ': ' + t('D=' + sh.D) + '.<br>Lowest/highest: the solid endpoints at ' + t('y=\\pm' + sh.m) + ': ' + t('R=' + sh.R) + '.', [HINT_DR, HINT_DOTS], 'D and R of sideways parabola');
  }

  function e4bDR(sh, shade) {
    return drPart(shade ? null : '(i) State the domain and the range.', sh.D, sh.R, { shade: shade ? { x: [-6, 6], y: [-5, 6], segs: [{ pts: sh.pts, start: sh.start, end: sh.end }] } : null, rW: [{ is: bld('y', Math.min(sh.yL, sh.yR), sh.yR), code: 'set-values', hint: 'The lowest point is the corner at ' + t('y=' + (-sh.d)) + ', not an endpoint.' }, { is: bld('y', -sh.d, sh.yR, true, false), code: 'set-endpoint', hint: 'The top of the range comes from the <b>solid</b> endpoint ' + t(ptT(sh.solid)) + ', so ' + t(sh.yR) + ' is included.' }] },
      'The hollow end ' + t(ptT(sh.hollow)) + ' is excluded, the solid end ' + t(ptT(sh.solid)) + ' included: ' + t('D=' + sh.D) + '.<br>Lowest point: the corner, ' + t('y=' + (-sh.d)) + '; highest: the solid end, ' + t('y=' + sh.yR) + ': ' + t('R=' + sh.R) + '.', [HINT_DOTS, 'For the range, the lowest point may be a corner, not an end.'], 'D and R of a V with a hollow end');
  }

  function e8aDR(sh, shade) {
    var D = bld('x', sh.xL, sh.X0), R = bld('y', 0, sh.yL);
    return drPart(shade ? 'Show the domain and the range of ' + t('h') + ' on the two number lines. (Next you’ll write them in set notation.)' : '(a) State the domain and range of ' + t('h') + '.', D, R, { shade: shade ? { x: [-7, 9], y: [-2, 8], segs: [{ pts: [[sh.xL, sh.yL], [sh.X0, 0]], start: 'closed', end: 'closed' }] } : null, rW: [{ is: bld('y', sh.b, sh.yL), code: 'set-values', hint: 'The graph goes all the way down to its right endpoint, ' + t(ptT([sh.X0, 0])) + '.' }, { is: bld('y', sh.yL, 0), code: 'set-values', hint: 'Write the smaller number first: ' + t('0\\le y\\le ' + sh.yL) + '.' }] },
      t('D=' + D) + ', ' + t('R=' + R) + '.<br>The line falls from left to right, so the left endpoint ' + t(ptT([sh.xL, sh.yL])) + ' gives the <b>upper</b> bound ' + t(sh.yL) + ' and the right endpoint ' + t(ptT([sh.X0, 0])) + ' gives the <b>lower</b> bound ' + t('0') + '. Both are solid, so both use ' + t('\\le') + '.', [HINT_DR, 'For a falling line, the left end is the highest point.'], 'D and R of a falling segment');
  }

  function e12bDR(sh, shade) {
    var D = bld('t', 0, sh.tot), R = bld('y', -sh.D, 0);
    return drPart(shade ? 'Show the domain (times) and the range (positions) on the two number lines. (Next you’ll write them in set notation.)' : '(b) State the domain and the range, with the correct variable letters.', D, R, { dv: 't', rv: 'y',
      shade: shade ? { x: [0, 24], y: [-sh.D - 2, 2], unitX: 12, unitY: 12, xName: 't', yName: 'y', xTitle: 'Time (min)', yTitle: 'Position (m)', segs: [{ pts: sh.V, start: 'closed', end: 'closed' }] } : null, dom: { step: 1, labels: 4 }, ran: { step: 1, labels: 2 }, rW: [{ is: bld('y', -sh.M, 0), code: 'set-values', hint: 'The lowest point is the flat bottom at ' + t('y=' + (-sh.D)) + '.' }] },
      t('D=' + D) + ', ' + t('R=' + R) + '. The input is ' + t('t') + ' and the output is ' + t('y') + '; both endpoints are solid.', [HINT_DR], 'D and R of diver');
  }

  /* EP3: y = a x^2 + c on {-2, -1, 0, 1, 2} */
  function ep3Shared(r) {
    var a = r.pick([1, 1, 1, -1]), c = a === 1 ? r.pick([-3, -3, -4, -2, -1, 1]) : r.pick([3, 2, 1, 4, -1]);
    var xs = [-2, -1, 0, 1, 2], ys = xs.map(function (x) { return a * x * x + c; });
    return { a: a, c: c, xs: xs, ys: ys, pts: xs.map(function (x, i) { return [x, ys[i]]; }), rule: lin([[a, 'x^{2}'], [c, '']]), D: lst(xs), R: lst(ys) };
  }

  /* EP4(a): sideways parabola x = s(y^2 - k^2), -m <= y <= m */
  function ep4aShared(r) {
    var km = r.pick([[2, 3], [2, 3], [1, 2]]), k = km[0], m = km[1], s = r.chance(0.7) ? 1 : -1, pts = [];
    for (var i = 0; i <= 60; i++) { var y = -m + 2 * m * i / 60; pts.push([cl(s * (y * y - k * k)), cl(y)]); }
    var xe = s * (m * m - k * k), xv = -s * k * k;
    return { k: k, m: m, s: s, pts: pts, D: bld('x', Math.min(xe, xv), Math.max(xe, xv)), R: bld('y', -m, m), xe: xe, xv: xv };
  }
  /* EP4(b): V with slopes -1 and 1, vertex (h, -d), hollow end on one side */
  function ep4bShared(r) {
    for (var g = 0; g < 400; g++) {
      var d = r.pick([1, 1, 2]), h = r.pick([-1, -1, 1, 0, -2, 2]), xL = r.int(-5, -3), xR = r.int(2, 4), mir = r.chance(0.3);
      if (r.chance(0.3)) { d = 1; h = -1; xL = -4; xR = 3; mir = false; }
      var f = function (x) { return Math.abs(x - h) - d; };
      if (!(xL < h - d && xR > h + d && xL < 0 && 0 <= xR)) continue;
      var yL = f(xL), yR = f(xR);
      if (!(yR > yL) || yR > 5 || yL > 5) continue;
      var T = function (p) { return mir ? [-p[0], p[1]] : p; };
      var pts = [[xL, yL], [h, -d], [xR, yR]].map(T), xi = uniq([h - d, h + d].map(function (x) { return mir ? -x : x; }));
      var hollow = T([xL, yL]), solid = T([xR, yR]), lo = Math.min(hollow[0], solid[0]), hi = Math.max(hollow[0], solid[0]);
      var D = mir ? bld('x', lo, hi, true, false) : bld('x', lo, hi, false, true);
      return { pts: mir ? pts.slice().reverse() : pts, start: mir ? 'closed' : 'open', end: mir ? 'open' : 'closed', hollow: hollow, solid: solid, D: D, R: bld('y', -d, yR), xi: xi, yi: Math.abs(h) - d, d: d, yR: yR, yL: yL };
    }
    throw new Error('ep4b');
  }
  /* EP4(c): six dots, two inputs used twice, no dot on the y-axis */
  function ep4cShared(r) {
    for (var g = 0; g < 400; g++) {
      var xs = r.sample(nz(-4, 4), 4).sort(function (a, b) { return a - b; }), dbl = r.sample([0, 1, 2, 3], 2), zi = [0, 1, 2, 3].filter(function (i) { return dbl.indexOf(i) < 0; })[r.int(0, 1)];
      if (r.chance(0.3)) { xs = [-3, -1, 2, 4]; dbl = [1, 3]; zi = 2; }
      var pts = [];
      xs.forEach(function (x, i) {
        if (i === zi) pts.push([x, 0]);
        else if (dbl.indexOf(i) >= 0) { var ab = r.sample(nz(-4, 4), 2); pts.push([x, ab[0]]); pts.push([x, ab[1]]); }
        else pts.push([x, r.pick(nz(-4, 4))]);
      });
      if (xs[0] === -3 && xs[1] === -1 && xs[2] === 2 && xs[3] === 4 && dbl.indexOf(1) >= 0 && dbl.indexOf(3) >= 0 && zi === 2 && r.chance(0.5)) pts = [[-3, 2], [-1, -2], [-1, 3], [2, 0], [4, -3], [4, 1]];
      if (pts.filter(function (p) { return p[1] === 0; }).length !== 1) continue;
      return { pts: pts, xs: xs, ys: uniq(pts.map(function (p) { return p[1]; })), dbl: dbl.map(function (i) { return xs[i]; }), z: xs[zi], D: lst(xs), R: lst(pts.map(function (p) { return p[1]; })) };
    }
    throw new Error('ep4c');
  }

  /* EP6: domain [a1, a2], range [r1, r2] */
  function ep6Shared(r) {
    var a1 = r.pick([-3, -3, -4, -2]), a2 = r.pick([5, 5, 3, 4]), r1 = r.pick([-2, -2, -3, -1]), r2 = r.pick([4, 4, 3, 2]), v = r.int(a1 + 2, a2 - 2), k = r.pick([4, 4, 3, -2, 2, -3]);
    if (v === 0) v = 1;
    return { a1: a1, a2: a2, r1: r1, r2: r2, v: v, k: k, Dt: bld('x', a1, a2), Rt: bld('y', r1, r2) };
  }

  /* EP7: f(x) = c - mx, g(x) = x^2 - kx */
  function ep7Shared(r) {
    var c = r.pick([5, 5, 3, 4, 6, 7]), m = r.pick([2, 2, 3, 4]), k = r.pick([3, 3, 2, 4, 5]), a1 = r.pick([-4, -4, -2, -3, -5]), a2 = r.pick([-3, -3, -2, -4]), rt = r.pick([4, 4, 5, 6].filter(function (x) { return x > k; }));
    if (!rt) rt = k + 1;
    var s = r.pick([2, 2, 1, 3]), n = r.pick([2, 2, 3]);
    return { c: c, m: m, k: k, a1: a1, a2: a2, rt: rt, q: rt * (rt - k), s: s, n: n, f: lin([[c, ''], [-m, 'x']]), g: lin([[1, 'x^{2}'], [-k, 'x']]) };
  }

  /* EP8: h(x) = -(p/q)x + b on [xL, X0], both ends solid, right end on the x-axis */
  function ep8Shared(r) {
    for (var g = 0; g < 400; g++) {
      var pq = r.pick([[1, 2], [1, 2], [1, 3], [2, 3], [3, 2]]), p = pq[0], q = pq[1], b = r.pick([3, 3, 2, 4]), X0 = b * q / p, j = r.int(1, 3), xL = -j * q, yL = b + p * j;
      if (r.chance(0.3)) { p = 1; q = 2; b = 3; X0 = 6; xL = -4; yL = 5; }
      if (!Number.isInteger(X0) || X0 > 8 || xL < -6 || yL > 7) continue;
      var xsIn = rng(1, X0 - 1).filter(function (x) { return x % q === 0; });
      if (!xsIn.length) continue;
      var h = function (x) { return cl(b - p * x / q); };
      var x1 = r.pick(xsIn), x2 = r.pick(rng(xL + 1, X0 - 1).filter(function (x) { return x % q === 0 && x !== 0; }));
      if (p === 1 && q === 2 && b === 3 && xL === -4 && r.chance(0.6)) { x1 = 4; x2 = 4; }
      return { p: p, q: q, b: b, X0: X0, xL: xL, yL: yL, h: h, x1: x1, x2: x2, rule: lin([[[-p, q], 'x'], [b, '']]) };
    }
    throw new Error('ep8');
  }

  /* EP12: a diver's depth, five straight pieces */
  function ep12Shared(r) {
    for (var g = 0; g < 400; g++) {
      var D = r.pick([12, 12, 8, 16]), M = D / 2, a = r.pick([4, 4, 2]), h1 = r.pick([6, 6, 4]), b = r.pick([4, 4, 2, 6]), h2 = r.pick([4, 4, 2]), c = r.pick([4, 4, 2, 6, 3]);
      if (r.chance(0.3)) { D = 12; M = 6; a = 4; h1 = 6; b = 4; h2 = 4; c = 4; }
      var tot = a + h1 + b + h2 + c;
      if (tot > 24 || !Number.isInteger(2 * M / b) || !Number.isInteger(2 * M / c)) continue;
      var V = [[0, 0], [a, -D], [a + h1, -D], [a + h1 + b, -M], [a + h1 + b + h2, -M], [tot, 0]];
      return { D: D, M: M, a: a, h1: h1, b: b, h2: h2, c: c, tot: tot, V: V, r1: M / b, r2: M / c };
    }
    throw new Error('ep12');
  }
  function ep12Fig(sh) {
    return fig(G({ x: [0, 24], y: [-sh.D - 2, 2], labels: 2, unitX: 13, unitY: 13, firstQuadrant: false, xName: 't', yName: 'y', xTitle: 'Time (min)', yTitle: 'Position (m)',
      segs: [{ pts: sh.V, start: 'closed', end: 'closed' }], max: 360, aria: 'diver position against time' }));
  }
  /* a solution set that is a union of points and intervals, e.g. "t = 2 or 14 <= t <= 18" */
  function splitTop(s) {
    var out = [], depth = 0, cur = '';
    for (var i = 0; i < s.length; i++) {
      var ch = s.charAt(i);
      if (ch === '{' || ch === '(' || ch === '[') depth++;
      if (ch === '}' || ch === ')' || ch === ']') depth--;
      if (depth === 0 && ch === ',') { out.push(cur); cur = ''; continue; }
      cur += ch;
    }
    out.push(cur);
    return out;
  }
  function unionChk(pts, ints, v) {
    var T = { kind: 'int', parts: pts.map(function (x) { return { lo: x, hi: x, lc: true, hc: true }; }).concat(ints.map(function (I) { return { lo: I[0], hi: I[1], lc: true, hc: true }; })).sort(function (a, b) { return a.lo - b.lo; }) };
    return function (resp) {
      var s = String(resp == null ? '' : resp).replace(/\\(left|right)\.?/g, '').replace(/\\lbrace|\\\{/g, '{').replace(/\\rbrace|\\\}/g, '}').replace(/\\cup|∪|\bU\b|\\text\{\s*(or|and)\s*\}|\bor\b|\band\b/g, ',').replace(/\\[,;:! ]|~/g, ' ').trim();
      if (!s) return form('empty', 'Type your answer first.');
      var pieces = splitTop(s).map(function (x) { return x.trim(); }).filter(Boolean), parts = [];
      for (var i = 0; i < pieces.length; i++) {
        var pc = pieces[i];
        if (/^[a-z]\s*(\\in|in)\s*(\\mathbb\{?R\}?|R)$/i.test(pc)) continue;
        if (/^-?\d+(\.\d+)?$/.test(pc)) pc = v + '=' + pc;
        var q = S.parse(pc);
        if (!q.ok) return form('unreadable', 'Write the solutions as single values and/or an interval, separated by “or”, e.g. ' + t(v + '=2\\ \\text{or}\\ 5\\le ' + v + '\\le 8') + '.');
        if (q.set.kind === 'list') q.set.vals.forEach(function (x) { parts.push({ lo: x, hi: x, lc: true, hc: true }); });
        else q.set.parts.forEach(function (p) { parts.push(p); });
      }
      parts.sort(function (a, b) { return a.lo - b.lo; });
      var eqp = function (A, Bp) { return A.length === Bp.length && A.every(function (p, j) { var q = Bp[j]; return same(p.lo, q.lo) && same(p.hi, q.hi) && p.lc === q.lc && p.hc === q.hc; }); };
      if (eqp(parts, T.parts)) return ok();
      var onlyPts = parts.every(function (p) { return p.lo === p.hi; });
      if (onlyPts && ints.length) return wrong('sol-interval', 'Look at the flat piece of the graph at that height: <b>every</b> time on it is a solution, so part of your answer is an interval, e.g. ' + t(nf(ints[0][0]) + '\\le ' + v + '\\le ' + nf(ints[0][1])) + '.');
      if (ints.length && parts.length === ints.length && pts.length) return wrong('sol-point-only', 'The interval is right — but the graph also reaches that height on another piece. Look for a single time as well.');
      return wrong('value', null);
    };
  }

  /* EP14: segment of slope -1 from hollow (x1, c - x1) to solid (x2, c - x2) */
  function ep14Shared(r) {
    for (var g = 0; g < 300; g++) {
      var c = r.pick([2, 2, 1, 3]), x1 = r.pick([-2, -2, -3, -1]), x2 = r.int(c + 1, 5);
      if (r.chance(0.3)) { c = 2; x1 = -2; x2 = 3; }
      var y1 = c - x1, y2 = c - x2;
      if (y1 > 6 || y2 < -4) continue;
      return { c: c, x1: x1, x2: x2, y1: y1, y2: y2 };
    }
    throw new Error('ep14');
  }

  /* EP11(d): a count domain {n | 0 <= n <= N, n in I} (too many values for HW.sets to list) */
  function countDomChk(lo, hi, v, o) {
    o = o || {};
    return function (resp) {
      var s = String(resp == null ? '' : resp).trim();
      if (!s) return form('empty', 'Type your answer first.');
      var dots = s.replace(/\\(left|right)\.?/g, '').replace(/\\lbrace|\\\{/g, '{').replace(/\\rbrace|\\\}/g, '}').replace(/\\[,;: ]/g, '').replace(/\s+/g, '');
      if (new RegExp('^\\{?' + lo + ',' + (lo + 1) + ',' + (lo + 2) + ',(\\\\ldots|\\\\dots|\\.\\.\\.|…),' + hi + '\\}?$').test(dots)) return ok();
      var m = /\\in\s*\\mathbb\s*\{?\s*([A-Z])\s*\}?|\\in\s*([A-Z])\b|∈\s*([A-Zℝ])|\bin\s+([A-Z])\b/.exec(s), ns = m ? (m[1] || m[2] || m[3] || m[4]) : null;
      if (ns === 'ℝ') ns = 'R';
      var s2 = m ? s.replace(m[0], '\\in\\mathbb{R}') : s;
      var q = S.parse(s2);
      if (!q.ok) return form('unreadable', 'Write it in set notation, e.g. ' + t('\\{' + v + '\\mid 0\\le ' + v + '\\le 10,\\ ' + v + '\\in I\\}') + '.');
      if (q.v && q.v !== v) return form('set-letter', 'Use the variable ' + t(v) + ' here.');
      var P0 = q.set.kind === 'int' && q.set.parts.length === 1 ? q.set.parts[0] : null;
      var right = P0 && same(P0.lo, lo) && same(P0.hi, hi) && P0.lc && P0.hc;
      if (right) {
        if (!ns) return form('set-tag', 'Right bounds — now say which numbers ' + t(v) + ' can be: finish with ' + t(',\\ ' + v + '\\in I') + '.');
        if (ns === 'R') return wrong('dom-real', t(v) + ' counts ' + (o.what || 'items') + ': it can only be a whole number (no one buys half a yearbook), so use ' + t(v + '\\in I') + ', not ' + t(v + '\\in\\mathbb{R}') + '.');
        if (ns === 'N') return wrong('dom-n', 'The natural numbers ' + t('N') + ' start at ' + t('1') + ', so they leave out ' + t(v + '=0') + '. Use ' + t('I') + ' (or ' + t('W') + ').');
        return ok();
      }
      if (P0 && same(P0.lo, lo) && same(P0.hi, hi)) return wrong('set-endpoint', 'The bounds are right — but ' + t(v + '=' + lo) + ' and ' + t(v + '=' + hi) + ' are both possible, so use ' + t('\\le') + ' at both ends.');
      var h = o.diag ? o.diag(P0) : null; if (h) return wrong(h.code, h.hint);
      return wrong('set-values', null);
    };
  }

  /* part labels: when a booklet part is split (a, a ii, b …) the letter comes from the part id, not its position */
  function subs(list) { list.forEach(function (q) { if (q.parts.length > 1) q.parts.forEach(function (p) { var m = /\d([a-z])$/.exec(p.id); if (!p.sub && m) p.sub = m[1]; }); }); return list; }

  HW.defineLesson({
    id: 'u5l10', unit: 5, num: '10', title: 'Relations and Functions Review: Domain, Range, and Function Notation', outcome: 'RF8',
    blurb: 'The whole unit in one place: discrete and continuous variables, domain and range, intercepts, function notation forwards and backwards, and the vertical line test — in pictures, tables and real situations.',
    questions: subs([
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
            ['On the ' + t('x') + '-axis the output is ' + t('0') + '. Solve ' + t(nm + '(x)=0') + '.'], 'x-intercept of ax-b');
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
            ['Replace ' + t('x') + ' with ' + t('-' + k) + '. What does a negative exponent mean?'], 'f(x)=b^x at a negative input');
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
            ['Put ' + t('(' + k + 'x-' + d + ')') + ' in brackets where the ' + t('x') + ' was, then distribute ' + t(dfr(frT(p, q))) + '.', 'Write ' + t(c) + ' with the same denominator before adding.'], 'g(kx-d) for linear g');
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
        { id: '11b', level: 'BEG', outcome: 'RF2', make: function (r, sh) {
          var ylo = Math.min(-2, Math.min.apply(null, sh.ys) - 1), yhi = Math.max(2, Math.max.apply(null, sh.ys) + 1);
          var I = { x: [-5, 5], y: [ylo, yhi], grid: 1, labels: 2, unitX: 28, unitY: Math.min(28, 330 / (yhi - ylo)), mode: 'points' };
          var target = drawing([], sh.pts);
          var j = r.int(0, 4); while (sh.xs[j] === 0) j = r.int(0, 4);
          var moved = drawing([], sh.pts.map(function (q, i) { return i === j ? [-q[0], q[1]] : q; }));
          var axisSwap = drawing([], sh.pts.map(function (q) { return q[0] === 0 ? [q[1], 0] : q; }));
          var W = [{ is: moved, code: 'graph-points', hint: 'Check ' + t(ptT(sh.pts[j])) + ': its ' + t('x') + '-coordinate is ' + t(sh.xs[j]) + ', so it is ' + (sh.xs[j] < 0 ? 'left' : 'right') + ' of the ' + t('y') + '-axis.' }];
          if (Math.abs(sh.b) <= 5) W.push({ is: axisSwap, code: 'graph-swap', hint: 'Check ' + t(ptT([0, sh.b])) + ': ' + t('x=0') + ', so this point is <b>on the ' + t('y') + '-axis</b>, not the ' + t('x') + '-axis. Go across first (here: not at all), then up or down.' });
          var p = B.graph('(b) Plot the relation on the grid. (Tap to place a point; tap it again to remove it.)', I, K.graphExact(target, { wrong: W }), target,
            'Plot each pair: go across to ' + t('x') + ', then up or down to ' + t('y') + '. Five separate points, not joined (the table alone doesn’t say whether in-between values make sense — see part (d)).',
            ['Go along the ' + t('x') + '-axis first, then up or down.'], 'plot a table');
          p.bad = [moved, drawing([], sh.pts.map(function (q) { return [q[1], q[0]]; }).filter(function (q) { return Math.abs(q[0]) <= 5; })), drawing([], sh.pts.slice(1))];
          if (Math.abs(sh.b) <= 5) p.bad.push(axisSwap);
          return p;
        } },
        { id: '11c', level: 'BEG', outcome: 'RF1', make: function (r, sh) {
          var cols = [{ id: 'Q1', html: 'QI' }, { id: 'Q2', html: 'QII' }, { id: 'Q3', html: 'QIII' }, { id: 'Q4', html: 'QIV' }, { id: 'axis', html: 'axis' }];
          var rows = sh.pts.map(function (q, i) { return { id: 'p' + i, html: t(ptT(q)) }; }), want = {};
          sh.pts.forEach(function (q, i) { want['p' + i] = quad(q); });
          return B.grid('(c) Name the quadrant each plotted point lies in. (One point lies on an axis — choose <b>axis</b> for it.)', rows, cols, want, { why: function (rid, got) {
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
          var p = K.P.poly('(f) The points lie on a straight line. Write its equation in function notation.', T, { before: 'f(x)=', wrong: (W = fw(W, T)) },
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
        { id: '13a', level: 'PRG', make: function (r, sh) {
          var X = sh.T + 10, A = sh.a, S2 = sh.a + sh.s, D2 = S2 + sh.d, T = sh.T;
          var I = { x: [0, X], y: [0, 5], grid: 10, gridY: 1, labels: 20, labelsX: 20, labelsY: 1000, unitX: 300 / X, unitY: 40, firstQuadrant: true, xName: 't', yName: 'v', xTitle: 'Time (s)', yTitle: 'Speed',
            tools: ['line'], defaultEnd: 'none', snapX: 10, snapY: 1 };
          var chk = K.graphStory({ phases: [{ dir: 'up', text: 'speeds up', x0: 0, x1: A }, { dir: 'flat', text: 'steady speed', x0: A, x1: S2 }, { dir: 'down', text: 'slows to a stop', x0: S2, x1: D2 }, { dir: 'flat', text: 'stopped', x0: D2, x1: T }],
            start: 0, end: 0, xUnit: 's', startHint: 'The cyclist starts <b>from rest</b>: the speed at ' + t('t=0') + ' is ' + t('0') + ', so start at the origin.',
            endHint: 'At the end the cyclist is <b>stopped</b>: speed ' + t('0') + '. The slowing piece must come down to the time axis at ' + t('t=' + D2) + ' s, and the last piece lies along the axis.' });
          var key = drawing([poly([[0, 0], [A, 3], [S2, 3], [D2, 0], [T, 0]], 'none', 'none')]);
          var p = B.graph('(a) Sketch a graph of the cyclist’s <b>speed</b> against time. (Speed has no scale here — any steady speed height is fine.) Use <b>╱ Line</b>: tap the start, then each corner, and tap the last point again to finish.', I, chk, key,
            'Speed rises steadily from ' + t('0') + ' (' + t('0') + '–' + t(A) + ' s), stays constant (' + t(A) + '–' + t(S2) + ' s), falls steadily to ' + t('0') + ' (' + t(S2) + '–' + t(D2) + ' s), then stays at ' + t('0') + ' (' + t(D2) + '–' + t(T) + ' s). Any height for the steady stage is right.',
            ['On a speed graph, constant speed is a horizontal line and “stopped” means speed ' + t('0') + '.', 'Work out when each stage starts and ends: ' + t('0') + ', ' + t(A) + ', ' + t(S2) + ', ' + t(D2) + ', ' + t(T) + ' s.'], 'sketch speed–time');
          p.good = [drawing([poly([[0, 0], [A, 5], [S2, 5], [D2, 0]], 'none', 'none'), poly([[D2, 0], [T, 0]], 'none', 'none')])];
          p.bad = [drawing([poly([[0, 0], [A, 2], [S2, 3], [D2, 0], [T, 0]], 'none', 'none')]), drawing([poly([[0, 0], [A, 3], [S2, 3], [D2, 1], [T, 1]], 'none', 'none')]),
            drawing([poly([[0, 0], [A, 3], [S2, 3], [S2, 0], [T, 0]], 'none', 'none')]), drawing([poly([[0, 0], [A, 3], [S2, 3], [D2, 0]], 'none', 'none')]),
            drawing([poly([[0, 0], [A + 10, 3], [S2, 3], [D2, 0], [T, 0]], 'none', 'none')]), drawing([poly([[0, 1], [A, 3], [S2, 3], [D2, 0], [T, 0]], 'none', 'none')])];
          return p;
        } },
        { id: '13b', level: 'BEG', make: function (r, sh) {
          var A = sh.a, S2 = sh.a + sh.s, D2 = S2 + sh.d;
          var rows = r.shuffle([{ id: 'up', html: 'rising' }, { id: 'flat', html: 'flat, raised' }, { id: 'down', html: 'falling' }, { id: 'zero', html: 'flat, on axis' }]);
          var cols = [{ id: 'up', html: 'speed up' }, { id: 'flat', html: 'steady' }, { id: 'down', html: 'slow' }, { id: 'zero', html: 'stop' }];
          return B.grid('(b) Label each of the four stages: match each piece of the speed–time graph to what the cyclist is doing (speeding up, steady speed, slowing down, stopped).', rows, cols, { up: 'up', flat: 'flat', down: 'down', zero: 'zero' }, { why: function (rid) {
            return { code: 'row', hint: { up: 'Rising speed means the cyclist is speeding up.', flat: 'A horizontal piece above the axis: the speed stays the same, but it isn’t zero.', down: 'Falling speed means slowing down.', zero: 'Along the axis the speed is ' + t('0') + ': the cyclist is stopped.' }[rid] };
          } }, 'Rising → speeding up; horizontal above the axis → steady speed; falling → slowing; along the axis → stopped.', ['On a <b>speed</b> graph, height is speed — not distance.'], 'label speed stages');
        } }] },
      /* ---------------- Q14 ---------------- */
      { num: '14', shared: q14Shared, outcome: 'RF1',
        stem: function (sh) { return 'The graph below shows Amira’s distance from home during a walk.' + q14Fig(sh); }, parts: [
        { id: '14a', level: 'BEG', make: function (r, sh) {
          var rows = [{ id: 's1', html: t('0') + '–' + t(sh.a) + ' h' }, { id: 's2', html: t(sh.a) + '–' + t(sh.a + sh.w) + ' h' }, { id: 's3', html: t(sh.a + sh.w) + '–' + t(sh.T) + ' h' }];
          var cols = [{ id: 'away', html: 'away' }, { id: 'stop', html: 'stopped' }, { id: 'back', html: 'back' }];
          return B.grid('(a) Describe what Amira is doing in each of the three segments: walking <b>away</b> from home, <b>stopped</b>, or walking <b>back</b> toward home.', rows, cols, { s1: 'away', s2: 'stop', s3: 'back' }, { why: function (rid) {
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
        { id: '15s', sub: 'shade', level: 'EMG', make: function (r, sh) { return q15Part(sh, true); } },
        { id: '15', sub: 'set notation', level: 'PRG', make: function (r, sh) { return q15Part(sh, false); } }] },
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
        { id: '16c', level: 'EMG', make: function (r, sh) {
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
            ['Write ' + t('\\dfrac{1}{' + P1 + '}') + ' as a power of ' + t(b) + '.'], 'solve 2^(-a)=1/32');
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
    ]),
    extra: subs([
      /* ================= EP Part A ================= */
      { num: '1', section: 'Extra practice A — One relation, every question', shared: function (r) { return ep1Shared(r, false); },
        stem: function (sh) { return 'The graph below shows every point of a relation ' + t('f') + '. The dots are separate and are not joined. Answer every part from the graph.' + (sh.onPad ? '' : ep1Fig(sh, false, 'the dots of f')); }, parts: [
        { id: 'e1a', level: 'BEG', outcome: 'RF2', make: function (r, sh) {
          var p = B.pairs('(a) Write the relation as a set of ordered pairs.', sh.pts, {}, 'List each dot as ' + t('(x,\\ y)') + ', from left to right:<br>' + t('\\{' + sh.pts.map(ptT).join(',\\ ') + '\\}'), ['Read across to the ' + t('x') + '-coordinate first, then up or down to the ' + t('y') + '-coordinate.'], 'graph to ordered pairs');
          p.bad = ['\\{' + sh.pts.map(function (q) { return ptK([q[1], q[0]]); }).join(', ') + '\\}', '\\{' + sh.pts.slice(0, 6).map(ptK).join(', ') + '\\}'];
          return p;
        } },
        { id: 'e1bs', sub: 'b, shade', level: 'BEG', outcome: 'RF2', make: function (r, sh) {
          return shadeDR('Show the domain and the range of ' + t('f') + ' on the two number lines. Then write them in set notation in the next part.', { x: [-6, 6], y: [-sh.L - 2, sh.top + 1], points: sh.pts.map(function (p) { return { x: p[0], y: p[1] }; }) }, sh.D, sh.R, {},
            'Each dot casts its own shadow. On the ' + t('x') + '-axis: ' + t(sh.xs.join(',\\ ')) + '. On the ' + t('y') + '-axis: ' + t(uniq(sh.ys).join(',\\ ')) + ' — the heights ' + t(-sh.L) + ' and ' + t('0') + ' each come from two dots but get one dot on the number line.',
            [HINT_DR, 'A height reached by two dots is still one value in the range.'], 'D and R of seven dots');
        } },
        { id: 'e1b', level: 'EMG', outcome: 'RF2', make: function (r, sh) {
          return drPart('(b) State the domain and the range. (Two outputs are each produced twice — think about how that shows up in the range.)', sh.D, sh.R, { bad: [[sh.D, '\\{' + sh.ys.slice().sort(function (a, b) { return a - b; }).join(', ') + '\\}'], [sh.D, bld('y', -sh.L, sh.top)]] },
            'Domain: the ' + t('x') + '-coordinates, each once, in increasing order: ' + t('D=' + sh.D) + '.<br>Range: the ' + t('y') + '-coordinates are ' + t(sh.ys.join(',\\ ')) + '. The outputs ' + t(-sh.L) + ' and ' + t('0') + ' each occur twice, but a set lists each value once: ' + t('R=' + sh.R) + ' — seven points, but only five range values.',
            [HINT_DR, HINT_LIST], 'D and R of seven dots');
        } },
        { id: 'e1c', level: 'EMG', outcome: 'RF2', make: function (r, sh) {
          return mc(r, '(c) Is ' + t('f') + ' a function? Which test settles it?', [
            { html: '<b>Yes</b> — vertical line test: no two dots share an ' + t('x') + '-coordinate, so every vertical line meets at most one dot.', right: true },
            { html: '<b>No</b> — two dots have the same ' + t('y') + '-value, ' + t(-sh.L) + '.', why: 'Two <b>inputs</b> may share an output. A function only fails when one input has two outputs (a vertical line through two dots).' },
            { html: '<b>No</b> — the dots are not joined, so it is not a function.', why: 'A function can be a set of separate dots. Being joined is about discrete vs continuous, not about being a function.' },
            { html: '<b>Yes</b> — the range has fewer values than the domain.', why: 'The conclusion is right but the reason isn’t: what matters is that no input has two outputs (the vertical line test).' }],
            '<b>Yes.</b> Vertical line test: a vertical line through any one of the seven dots meets only that dot, because no two dots share an ' + t('x') + '-coordinate. (In the list from (a), no input appears twice.)',
            ['Draw imaginary vertical lines through the dots. Does any line hit two dots?'], 'is the dot relation a function');
        } },
        { id: 'e1d', level: 'BEG', make: function (r, sh) {
          var a = sh.x2, b = sh.x5, fa = sh.y2, fb = -sh.L;
          var rev = function (x, y) { return function (u) { var back = sh.pts.filter(function (p) { return p[1] === x; }); if (back.length && back.some(function (p) { return same(p[0], u); }) && !same(u, y)) return { code: 'read-reverse', hint: t('f(' + x + ')') + ' asks for the output at the input ' + t(x) + ': start at ' + t('x=' + x) + ' on the horizontal axis and read up or down to the dot.' }; return null; }; };
          return fieldsOf('(d) State ' + t('f(' + a + ')') + ' and ' + t('f(' + b + ')') + '.', [numF(t('f(' + a + ')='), fa, rev(a, fa)), numF(t('f(' + b + ')='), fb, rev(b, fb))], t('f(' + a + ')=' + fa) + ', ' + t('f(' + b + ')=' + fb),
            'The dot above or below ' + t('x=' + a) + ' is at ' + t('y=' + fa) + ': ' + t('f(' + a + ')=' + fa) + '.<br>The dot at ' + t('x=' + b) + ' is at ' + t('y=' + fb) + ': ' + t('f(' + b + ')=' + fb) + '.',
            ['Find the input on the ' + t('x') + '-axis, then read the height of the dot there.'], 'read f(a) off dots');
        } },
        { id: 'e1e', level: 'EMG', make: function (r, sh) {
          var dg = function (A) { if (A.some(function (x) { return same(x, -sh.L); })) return { code: 'solve-instead', hint: 'In ' + t('f(x)=' + (-sh.L)) + ' the number ' + t(-sh.L) + ' is the <b>output</b>: find the inputs of the dots at height ' + t(-sh.L) + '.' }; return null; };
          return fieldsOf('(e) Solve each equation.', [solF(t('f(x)=' + (-sh.L)) + ':', [0, sh.x5], 'x', dg), solF(t('f(x)=' + sh.y1) + ':', [sh.x1], 'x')], t('f(x)=' + (-sh.L)) + ': ' + t('x=0') + ' or ' + t('x=' + sh.x5) + '; ' + t('f(x)=' + sh.y1) + ': ' + t('x=' + sh.x1),
            t('f(x)=' + (-sh.L)) + ': the dots at height ' + t(-sh.L) + ' are ' + t(ptT([0, -sh.L])) + ' and ' + t(ptT([sh.x5, -sh.L])) + ', so ' + t('x=0') + ' or ' + t('x=' + sh.x5) + '.<br>' + t('f(x)=' + sh.y1) + ': only ' + t(ptT([sh.x1, sh.y1])) + ', so ' + t('x=' + sh.x1) + '.',
            ['“Solve ' + t('f(x)=b') + '” means: which inputs give the output ' + t('b') + '? Look along the horizontal line at height ' + t('b') + '.', 'There may be more than one dot at that height.'], 'solve f(x)=b on dots');
        } },
        { id: 'e1e2', sub: 'e ii', level: 'EMG', make: function (r, sh) {
          return mc(r, '(e) Why does ' + t('f(x)=' + (-sh.L)) + ' have two answers while ' + t('f(x)=' + sh.y1) + ' has only one?', [
            { html: 'A function gives each input one output, but two inputs may share an output: two dots sit at height ' + t(-sh.L) + ', only one at height ' + t(sh.y1) + '.', right: true },
            { html: 'Because ' + t('f') + ' is not a function.', why: t('f') + ' is a function (no input has two outputs). Two <b>inputs</b> with the same output is allowed.' },
            { html: 'Because negative outputs always give two answers.', why: 'The sign of the output has nothing to do with it — count the dots at each height.' },
            { html: 'Because ' + t(-sh.L) + ' is in the domain twice.', why: t(-sh.L) + ' is an <b>output</b> (a range value), and a set lists each value once.' }],
            'Solving ' + t('f(x)=b') + ' asks for every input with output ' + t('b') + '. Two dots are at height ' + t(-sh.L) + ' and only one at height ' + t(sh.y1) + '. That is allowed: a function forbids one input with two outputs, not two inputs with one output.',
            ['Count the dots at each height.'], 'why two solutions');
        } },
        { id: 'e1f', level: 'BEG', outcome: 'RF1', make: function (r, sh) {
          sh.onPad = true; // the graph is drawn on the pad, not repeated in the stem
          var onG = function (p) { return sh.pts.some(function (q) { return same(q[0], p[0]) && same(q[1], p[1]); }); };
          return tapPart('(f) Tap every ' + t('x') + '-intercept and the ' + t('y') + '-intercept of ' + t('f') + ' on the graph.', { x: [-6, 6], y: [-sh.L - 2, sh.top + 1], labels: 2, bg: { points: sh.pts.map(function (p) { return { x: p[0], y: p[1] }; }) } }, [[sh.x3, 0], [sh.x6, 0]], [[0, -sh.L]], { onGraph: onG, offHint: 'The graph is only the dots: an intercept must be one of them.' },
            t('x') + '-intercepts: the dots on the ' + t('x') + '-axis (' + t('y=0') + '): ' + t(ptT([sh.x3, 0]) + ',\\ ' + ptT([sh.x6, 0])) + '.<br>' + t('y') + '-intercept: the dot on the ' + t('y') + '-axis (' + t('x=0') + '): ' + t(ptT([0, -sh.L])) + '.',
            ['An ' + t('x') + '-intercept is a point with ' + t('y=0') + '; a ' + t('y') + '-intercept is a point with ' + t('x=0') + '.'], 'intercepts of dots');
        } },
        { id: 'e1g', level: 'EMG', make: function (r, sh) {
          return mc(r, '(g) Why are “solve ' + t('f(x)=0') + '” and “find the ' + t('x') + '-intercepts” the same instruction, while “evaluate ' + t('f(0)') + '” is a different one?', [
            { html: t('f(x)=0') + ' sets the <b>output</b> to ' + t('0') + ' and asks for the inputs — points on the ' + t('x') + '-axis. ' + t('f(0)') + ' sets the <b>input</b> to ' + t('0') + ' and asks for the output — the point on the ' + t('y') + '-axis.', right: true },
            { html: 'They are all the same: each one puts a ' + t('0') + ' into the function.', why: 'Where the ' + t('0') + ' goes matters. In ' + t('f(0)') + ' it is the input; in ' + t('f(x)=0') + ' it is the output.' },
            { html: t('f(0)') + ' gives the ' + t('x') + '-intercepts and ' + t('f(x)=0') + ' gives the ' + t('y') + '-intercept.', why: 'That is reversed: ' + t('f(0)=' + (-sh.L)) + ' is the height where ' + t('x=0') + ' — the ' + t('y') + '-intercept.' },
            { html: t('f(0)') + ' means ' + t('f') + ' multiplied by ' + t('0') + ', so it is always ' + t('0') + '.', why: 'Function notation is not multiplication: ' + t('f(0)') + ' is the output when the input is ' + t('0') + ' (here ' + t(-sh.L) + ').' }],
            '“Solve ' + t('f(x)=0') + '” gives the inputs with output ' + t('0') + ' — ' + t('x=' + sh.x3) + ' and ' + t('x=' + sh.x6) + ', exactly the ' + t('x') + '-intercepts. “Evaluate ' + t('f(0)') + '” gives the output at input ' + t('0') + ': ' + t('f(0)=' + (-sh.L)) + ', the ' + t('y') + '-intercept ' + t(ptT([0, -sh.L])) + ' — a different point.',
            ['In ' + t('f(\\text{input})=\\text{output}') + ', where is the ' + t('0') + ' in each instruction?'], 'f(x)=0 vs f(0)');
        } },
        { id: 'e1h', level: 'BEG', outcome: 'RF1', make: function (r) {
          return mc(r, '(h) Is this relation discrete or continuous?', [
            { html: '<b>Discrete</b> — the graph is separate dots that are not joined, so only those seven ' + t('x') + '-values are inputs.', right: true },
            { html: '<b>Continuous</b> — the dots follow a smooth pattern.', why: 'A pattern doesn’t fill in the gaps. Only the seven plotted inputs belong to this relation.' },
            { html: '<b>Continuous</b> — it is a function.', why: 'Functions can be discrete. Look at whether the graph is separate dots or an unbroken line.' },
            { html: '<b>Discrete</b> — because some outputs repeat.', why: 'Repeated outputs don’t decide it. It is discrete because the graph is separate dots.' }],
            '<b>Discrete:</b> separate dots, not joined, so the inputs are only the seven listed values.', ['Separate dots → discrete; an unbroken line or curve → continuous.'], 'discrete or continuous dots');
        } },
        { id: 'e1h2', sub: 'h ii', level: 'EMG', outcome: 'RF2', make: function (r, sh) {
          var xs = sh.xs, lo = xs[0], hi = xs[6], gaps = rng(lo, hi).filter(function (x) { return xs.indexOf(x) < 0; }), keyV = gaps.length ? gaps[0] : cl((xs[0] + xs[1]) / 2);
          var chk = function (resp) {
            var u = valOf(resp); if (u == null) return form('notnumber', 'Enter a single number.');
            if (u <= lo || u >= hi) return wrong('not-between-d', 'Pick a number that lies <b>between</b> two domain values — between ' + t(lo) + ' and ' + t(hi) + '.');
            if (xs.some(function (x) { return same(x, u); })) return wrong('in-domain', t(nf(u)) + ' <b>is</b> in the domain — there is a dot at ' + t('x=' + nf(u)) + '. Choose a number with no dot above or below it.');
            return ok();
          };
          return { prompt: '(h) Name one number that is <b>not</b> in the domain even though it lies between two numbers that are.', input: { type: 'math', keys: 'fraction', before: t('x=') }, check: chk, key: String(keyV), answer: t(nf(keyV)) + ' (any number between ' + t(lo) + ' and ' + t(hi) + ' with no dot)',
            solution: 'The domain is only ' + t(sh.D) + '. For example ' + t(nf(keyV)) + ' lies between two domain values but has no dot above or below it, so it is not an input. (Any such number works' + (gaps.length > 1 ? ', e.g. ' + t(gaps.slice(1, 3).join(',\\ ')) : '') + ', and so does a decimal like ' + t(nf((xs[3] + xs[4]) / 2)) + '.)',
            hints: ['A discrete domain has gaps. Which numbers between ' + t(lo) + ' and ' + t(hi) + ' have no dot?'], text: 'number not in a discrete domain', good: [nf((xs[3] + xs[4]) / 2)], bad: [String(xs[2]), String(lo - 1)] };
        } }] },
      { num: '2', shared: function (r) { return ep1Shared(r, true); },
        stem: function (sh) { return 'The seven points of a relation ' + t('f') + ' (left) are now joined, in order from left to right, by straight segments to make a new relation ' + t('g') + ' (right). Everything about the relation has changed except the dots themselves.' + figs(['<b>' + t('f') + '</b> (dots)' + ep1Fig(sh, false, 'f'), '<b>' + t('g') + '</b> (joined)' + ep1Fig(sh, true, 'g')], 150); }, parts: [
        { id: 'e2as', sub: 'a, shade', level: 'EMG', outcome: 'RF2', make: function (r, sh) { return e2aPart(sh, true); } },
        { id: 'e2a', level: 'PRG', outcome: 'RF2', make: function (r, sh) { return e2aPart(sh, false); } },
        { id: 'e2a2', sub: 'a ii', level: 'BEG', outcome: 'RF2', make: function (r) {
          return mc(r, '(a) Why do the domain and range of ' + t('g') + ' now need set-builder notation instead of a list?', [
            { html: 'Each set now holds infinitely many real numbers (every value between the ends), so they can’t be listed.', right: true },
            { html: 'Because ' + t('g') + ' is a function.', why: t('f') + ' was a function too, and its domain was a list. What changed is that the gaps are filled in.' },
            { html: 'Because the numbers are now negative.', why: 'Negative numbers can be listed. The point is that there are infinitely many values.' },
            { html: 'Set-builder notation is always required for graphs.', why: 'A graph of separate dots uses a list. Set-builder is needed when the values fill an interval.' }],
            'The segments contain infinitely many points, so the inputs and outputs fill whole intervals — impossible to list, so set-builder notation is needed.', ['How many values does an interval contain?'], 'why set-builder');
        } },
        { id: 'e2b', level: 'ADV', make: function (r, sh) {
          var V = sh.pts, fR = uniq(sh.ys), cands = rng(-sh.L, sh.top).filter(function (y) { return fR.indexOf(y) < 0; }), v0 = cands.indexOf(5) >= 0 ? 5 : cands[cands.length - 1];
          var chk = function (resp) {
            resp = resp || [];
            var u = valOf(resp[0]), w = valOf(resp[1]);    // a fraction such as -11/3 is the exact input on a slope-3 segment
            if (u == null || w == null) return form('empty', 'Fill in both boxes with a number (a fraction like ' + t('-\\frac{11}{3}') + ' is fine).');
            if (u < -sh.L - 1e-9 || u > sh.top + 1e-9) return wrong('not-in-range', '<b>Value:</b> ' + t(nf(u)) + ' is not in the range of ' + t('g') + ' — the graph never goes ' + (u > sh.top ? 'above ' + t(sh.top) : 'below ' + t(-sh.L)) + '.');
            if (fR.some(function (y) { return same(y, u); })) return wrong('in-f-range', '<b>Value:</b> ' + t(nf(u)) + ' is already in the range of ' + t('f') + ' (a dot is at that height). Choose a height between the dots’ heights.');
            var gw = pwAt(V, w);
            if (!isFinite(gw)) return wrong('x-wrong', '<b>Input:</b> ' + t(nf(w)) + ' is not in the domain of ' + t('g') + '.');
            if (Math.abs(gw - u) > 0.011) return wrong('x-wrong', '<b>Input:</b> ' + t('g(' + nf(w) + ')=' + nf(gw)) + ', not ' + t(nf(u)) + '. Find where the horizontal line ' + t('y=' + nf(u)) + ' meets a segment, using that segment’s slope.');
            return ok();
          };
          var segA = V[0], segB = V[1], i0 = 0; for (var i = 0; i + 1 < V.length; i++) { var a = V[i], b = V[i + 1]; if ((v0 - a[1]) * (v0 - b[1]) <= 0 && a[1] !== b[1]) { segA = a; segB = b; i0 = i; break; } }
          var sl = ex.norm(segB[1] - segA[1], segB[0] - segA[0]);
          var xf = ex.norm((v0 - segA[1]) * (segB[0] - segA[0]) + segA[0] * (segB[1] - segA[1]), segB[1] - segA[1]), x0 = xf[0] / xf[1];
          var xT = frT(xf[0], xf[1]) + (xf[1] === 1 || String(cl(x0)).length > 6 ? '' : '=' + nf(x0)), xK = xf[1] === 1 ? String(xf[0]) : xf[0] + '/' + xf[1];
          return { prompt: '(b) Name a number that is in the range of ' + t('g') + ' but <b>not</b> in the range of ' + t('f') + ', and give an input ' + t('x') + ' where ' + t('g') + ' produces it.', input: { type: 'fields', fields: [{ label: 'value', name: 'value' }, { label: t('x='), name: 'x' }] },
            check: chk, key: [String(v0), xK], answer: 'e.g. ' + t(v0) + ', produced at ' + t('x=' + xT) + ' (many answers)',
            solution: 'Any number from ' + t(-sh.L) + ' to ' + t(sh.top) + ' other than ' + t(fR.join(',\\ ')) + ' works, e.g. ' + t(v0) + '.<br>It is produced on the segment from ' + t(ptT(segA)) + ' to ' + t(ptT(segB)) + ', slope ' + t(ex.texRat(sl)) + ':<br>' + t(segA[1] + (sl[0] < 0 ? '' : '+') + ex.texRat(sl) + '(x' + (segA[0] < 0 ? '+' + (-segA[0]) : segA[0] === 0 ? '' : '-' + segA[0]) + ')=' + v0) + ' gives ' + t('x=' + xT) + ', the point ' + t('\\left(' + dfr(frT(xf[0], xf[1])) + ',\\ ' + v0 + '\\right)') + '.',
            hints: ['The range of ' + t('f') + ' is ' + t(sh.R) + '. Pick a height in between, e.g. between two of those values.', 'Use the slope of the segment that crosses that height to find its ' + t('x') + '-value.'], text: 'value in range of g not f',
            good: [[String(v0), nf(x0)], [String(v0), frT(xf[0], xf[1])]], bad: [[String(fR[0]), String(sh.xs[sh.ys.indexOf(fR[0])])], [String(sh.top + 1), '0']] };
        } },
        { id: 'e2c', level: 'ADV', make: function (r, sh) {
          var num2 = sh.x6 * sh.y7 + sh.y2 * (sh.x7 - sh.x6), den = sh.y7, fx = ex.norm(num2, den);
          return B.valueSet('(c) Solve ' + t('g(x)=' + sh.y2) + '. (One answer is not a whole number — find it exactly, using the slope of the segment it lies on.)', [sh.x2, fx], { v: 'x', diag: function (A) {
            if (A.length === 1 && same(A[0], sh.x2)) return { code: 'sol-missing', hint: 'The dot ' + t(ptT([sh.x2, sh.y2])) + ' gives one answer. The last segment, from ' + t(ptT([sh.x6, 0])) + ' to ' + t(ptT([sh.x7, sh.y7])) + ', also passes height ' + t(sh.y2) + '.' };
            return null;
          } }, 'The dot ' + t(ptT([sh.x2, sh.y2])) + ' gives ' + t('g(' + sh.x2 + ')=' + sh.y2) + ', so ' + t('x=' + sh.x2) + '.<br>The other answer lies on the segment from ' + t(ptT([sh.x6, 0])) + ' to ' + t(ptT([sh.x7, sh.y7])) + ': slope ' + t('m=\\dfrac{' + sh.y7 + '-0}{' + sh.x7 + '-' + sh.x6 + '}=' + ex.texRat(ex.norm(sh.y7, sh.x7 - sh.x6))) + '.<br>Rise ' + t(sh.y2) + ' from ' + t(ptT([sh.x6, 0])) + ': ' + t(ex.texRat(ex.norm(sh.y7, sh.x7 - sh.x6)) + '(x-' + sh.x6 + ')=' + sh.y2) + ', so ' + t('x=' + ex.texRat(fx)) + ' (' + t(nf(fx[0] / fx[1])) + ').',
            ['Follow the horizontal line at height ' + t(sh.y2) + ' across the whole graph.', 'On a segment, use its slope: rise = slope × run.'], 'solve g(x)=b on segments');
        } },
        { id: 'e2d', level: 'PRG', make: function (r, sh) {
          var T = bld('x', 0, sh.x5);
          return setPart('(d) Solve ' + t('g(x)=' + (-sh.L)) + '. (Compare with ' + t('f(x)=' + (-sh.L)) + ', which had just two answers.)', T, { v: 'x', wrong: [{ is: lst([0, sh.x5]), code: 'sol-interval', hint: 'For ' + t('f') + ' there were only the two dots. For ' + t('g') + ' the segment between them is flat at height ' + t(-sh.L) + ', so <b>every</b> ' + t('x') + ' on it is a solution.' }], placeholder: 'e.g. 1 <= x <= 3' },
            'The segment from ' + t(ptT([0, -sh.L])) + ' to ' + t(ptT([sh.x5, -sh.L])) + ' is horizontal at ' + t('y=' + (-sh.L)) + ', so every input on it gives ' + t(-sh.L) + ':<br>' + t(cond('x', 0, sh.x5)) + '<br>For ' + t('f') + ' only the two dots existed; joining them added every ' + t('x') + ' in between.',
            ['Where is the graph at height ' + t(-sh.L) + '? Is it a point or a stretch?'], 'solve on a flat piece');
        } },
        { id: 'e2e', level: 'EMG', outcome: 'RF1', make: function (r, sh) {
          var I = t(ptT([sh.x3, 0]) + ',\\ ' + ptT([sh.x6, 0])), Y = t(ptT([0, -sh.L]));
          return mc(r, '(e) Is ' + t('g') + ' a function, and did joining the dots change the intercepts?', [
            { html: 'Yes, a function. The intercepts are unchanged: ' + t('x') + '-ints ' + I + ', ' + t('y') + '-int ' + Y + '.', right: true },
            { html: 'Yes, a function — but joining the dots added new ' + t('x') + '-intercepts.', why: 'The graph meets the axes only at plotted dots; no new segment crosses an axis anywhere else.' },
            { html: 'No — the flat segment fails the vertical line test.', why: 'A flat (horizontal) piece is fine: each vertical line still meets it once. Only a vertical piece would fail.' },
            { html: 'Yes, a function — but the ' + t('y') + '-intercept is now the whole flat segment.', why: 'The ' + t('y') + '-intercept is where the graph meets the ' + t('y') + '-axis (' + t('x=0') + '): just the point ' + Y + '.' }],
            '<b>Yes, a function:</b> no vertical line meets the graph more than once. The graph meets the axes only at the plotted dots, so the intercepts are unchanged: ' + I + ' and ' + Y + '.', ['Check each segment: does any new piece cross an axis?'], 'function and intercepts after joining');
        } }] },
      /* ================= EP Part B ================= */
      { num: '3', section: 'Extra practice B — Domain, range and notation', shared: ep3Shared,
        stem: function (sh) {
          var tab = HW.valueTable([['x'].concat(sh.xs), ['y'].concat(sh.ys)]), gr = G({ x: [-4, 4], y: [-6, 6], labels: 2, max: 220, points: sh.pts.map(function (p) { return { x: p[0], y: p[1] }; }), aria: 'graph of five dots' });
          var rv = uniq(sh.ys), ad = HW.arrowDiagram(sh.xs, rv, sh.pts, { leftTitle: 'X', rightTitle: 'Y' });
          return 'One relation is shown below in four ways.' + figs(['<b>I.</b> Table of values' + tab, '<b>II.</b> Graph' + gr, '<b>III.</b> Mapping diagram' + ad], 160) + '<b>IV.</b> Equation: ' + t('y=' + sh.rule) + ', with domain ' + t('\\{-2, -1, 0, 1, 2\\}') + '.';
        }, parts: [
        { id: 'e3a', level: 'BEG', outcome: 'RF2', make: function (r, sh) {
          return drPart('(a) State the domain and range (from the table or the graph — they agree).', sh.D, sh.R, { bad: [[sh.D, '\\{' + sh.ys.join(', ') + '\\}']] },
            'Inputs (top row / ' + t('x') + '-coordinates): ' + t('D=' + sh.D) + '.<br>Outputs (bottom row / ' + t('y') + '-coordinates), each once, in increasing order: ' + t('R=' + sh.R) + '. The table and the graph agree.', [HINT_DR, HINT_LIST], 'D and R from table/graph');
        } },
        { id: 'e3b', level: 'EMG', outcome: 'RF2', make: function (r, sh) {
          var rv = uniq(sh.ys);
          return mc(r, '(b) In the mapping diagram, the right-hand oval holds ' + t(rv.length) + ' numbers while the left holds ' + t('5') + '. Why is that not an error?', [
            { html: 'Each oval is a set, so each value is written once: ' + t(sh.a + sh.c) + ' and ' + t(4 * sh.a + sh.c) + ' each receive two arrows — five inputs share three outputs.', right: true },
            { html: 'It is an error: every input needs its own output.', why: 'A function needs one output <b>for</b> each input — two inputs can share an output.' },
            { html: 'Two of the outputs were left out by mistake.', why: 'Check the arrows: every output value appears; some just receive two arrows.' },
            { html: 'Because the relation is not a function.', why: 'It is a function: exactly one arrow leaves each input. Two arrows arriving at one output is fine.' }],
            'The range is a set, so repeated outputs are written once. ' + t(sh.a + sh.c) + ' receives arrows from ' + t('-1') + ' and ' + t('1') + '; ' + t(4 * sh.a + sh.c) + ' from ' + t('-2') + ' and ' + t('2') + '.', ['Count how many arrows arrive at each output.'], 'mapping ovals sizes');
        } },
        { id: 'e3c', level: 'BEG', make: function (r, sh) {
          var items = sh.xs.map(function (x, i) { return numF(t('x=' + x) + ': ' + t('y='), sh.ys[i], function (u) { if (x !== 0 && same(u, -sh.a * x * x + sh.c)) return { code: 'sq-neg', hint: 'Square first: ' + t(par(x) + '^{2}=' + x * x) + ' (positive).' }; return null; }); });
          return fieldsOf('(c) Use the equation to compute all five outputs (they should match the other three representations).', items, sh.xs.map(function (x, i) { return t(par(x) + '\\to ' + sh.ys[i]); }).join(', '),
            sh.xs.map(function (x, i) { return t((sh.a === -1 ? '-' : '') + par(x) + '^{2}' + (sh.c < 0 ? sh.c : '+' + sh.c) + '=' + sh.ys[i]); }).join('<br>') + '<br>The same pairs as in I, II and III.', [HINT_EVAL], 'evaluate y=ax^2+c');
        } },
        { id: 'e3d', level: 'EMG', outcome: 'RF2', make: function (r) {
          return mc(r, '(d) Is the relation a function? (Answer from the mapping diagram and from the graph.)', [
            { html: '<b>Yes</b> — exactly one arrow leaves each input, and a vertical line through any dot meets only that dot.', right: true },
            { html: '<b>No</b> — some outputs receive two arrows.', why: 'Two arrows <b>arriving</b> at one output is allowed. A function fails only when two arrows <b>leave</b> one input.' },
            { html: '<b>No</b> — the dots on the graph are not joined.', why: 'Separate dots can still be a function. Use the vertical line test.' },
            { html: '<b>Yes</b> — because every output is used.', why: 'That isn’t the test. The test is: does each input have exactly one output?' }],
            '<b>Yes, both ways.</b> Mapping diagram: one arrow leaves each element of ' + t('X') + '. Graph: vertical line test — each vertical line through a dot meets only that dot.', ['Mapping diagram: look at arrows leaving each input. Graph: vertical lines.'], 'function from mapping and graph');
        } },
        { id: 'e3e', level: 'PRG', outcome: 'RF2', make: function (r, sh) {
          var Dn = all('x'), Rn = sh.a > 0 ? bld('y', sh.c, null) : bld('y', null, sh.c);
          return drPart('(e) Now delete the stated domain and treat ' + t('y=' + sh.rule) + ' as an equation on its own. State the new domain and range.', Dn, Rn, { dW: [{ is: sh.D, code: 'dr-context', hint: 'Without the stated domain, any real ' + t('x') + ' can be squared.' }, { is: bld('x', -2, 2), code: 'dr-context', hint: 'The stated domain has been removed: nothing stops ' + t('x') + ' at ' + t('\\pm 2') + '.' }],
            rW: [{ is: sh.R, code: 'set-continuous', hint: 'With every real input, the outputs fill a whole interval.' }, { is: all('y'), code: 'set-values', hint: t('x^{2}\\ge 0') + ', so ' + t('y') + ' can never go ' + (sh.a > 0 ? 'below' : 'above') + ' ' + t(sh.c) + '.' }] },
            'Any real ' + t('x') + ' can be squared: ' + t('D=' + Dn) + '.<br>' + t('x^{2}\\ge 0') + ', so ' + t('y=' + sh.rule) + (sh.a > 0 ? '\\ge ' : '\\le ') + sh.c + ', with ' + t('y=' + sh.c) + ' at ' + t('x=0') + ': ' + t('R=' + Rn) + '.', ['What values can ' + t('x^{2}') + ' take?'], 'D and R of y=ax^2+c');
        } },
        { id: 'e3f', level: 'EMG', outcome: 'RF2', make: function (r) {
          return mc(r, '(f) Which of the four representations could <b>not</b> have told you the answer to (e)?', [
            { html: 'I, II and III — they show only the five given pairs, not what happens at any other input.', right: true },
            { html: 'Only IV, the equation.', why: 'The equation is the only one that gives an output for <b>every</b> real ' + t('x') + ' — it is exactly what you used in (e).' },
            { html: 'Only II, the graph.', why: 'The table and the mapping diagram show the same five pairs as the graph — none of them says anything about ' + t('x=0.5') + ' or ' + t('x=10') + '.' },
            { html: 'None — all four representations show the whole relation.', why: 'The table, graph and diagram show only five pairs; the equation alone covers every input.' }],
            'The table, graph and mapping diagram each show only the five given pairs, so none says what happens at any other input (e.g. ' + t('x=0.5') + '). Only the equation, IV, gives an output for every real ' + t('x') + '.', ['Which representations show only five pairs?'], 'which representation shows all');
        } }] },
      { num: '4a', stem: function (sh) { return 'For the graph below state (i) the domain and range, (ii) whether the relation is a function, and (iii) every ' + t('x') + '-intercept and every ' + t('y') + '-intercept.' + (sh.onPad ? '' : fig(G({ x: [-6, 6], y: [-5, 5], labels: 2, max: 260, segs: [{ pts: sh.pts, start: 'closed', end: 'closed' }], aria: 'sideways parabola' }))); }, shared: ep4aShared, parts: [
        { id: 'e4a0', sub: 'i, shade', level: 'EMG', outcome: 'RF2', make: function (r, sh) { return e4aDR(sh, true); } },
        { id: 'e4a1', sub: 'i', level: 'PRG', outcome: 'RF2', make: function (r, sh) { return e4aDR(sh, false); } },
        { id: 'e4a2', sub: 'ii', level: 'BEG', outcome: 'RF2', make: function (r, sh) {
          var neg = r.chance(0.5); // statement "is a function" (false) or "is not a function" (true)
          return tf(r, '(ii) True or false: this relation is ' + (neg ? '<b>not</b> ' : '') + 'a function.', neg, 'The vertical line ' + t('x=0') + ' meets the curve twice, at ' + t('y=-' + sh.k) + ' and ' + t('y=' + sh.k) + ': one input, two outputs.',
            (neg ? '<b>True</b> — ' : '<b>False</b> — ') + '<b>not a function:</b> the vertical line ' + t('x=0') + ' meets the curve at ' + t('(0,\\ -' + sh.k + ')') + ' and ' + t('(0,\\ ' + sh.k + ')') + '.', ['Try a vertical line near the middle of the curve.'], 'VLT sideways parabola' + (neg ? ' (not a function?)' : ''));
        } },
        { id: 'e4a3', sub: 'iii', level: 'EMG', outcome: 'RF1', make: function (r, sh) {
          sh.onPad = true; // the graph is drawn on the pad, not repeated in the stem
          var onG = function (p) { return same(p[0], sh.s * (p[1] * p[1] - sh.k * sh.k)) && Math.abs(p[1]) <= sh.m; };
          return tapPart('(iii) Tap every ' + t('x') + '-intercept and every ' + t('y') + '-intercept on the graph.', { x: [-6, 6], y: [-5, 5], labels: 2, bg: { segs: [{ pts: sh.pts, start: 'closed', end: 'closed' }] } }, [[sh.xv, 0]], [[0, -sh.k], [0, sh.k]], { onGraph: onG },
            t('x') + '-int: the turning point on the ' + t('x') + '-axis, ' + t(ptT([sh.xv, 0])) + '.<br>' + t('y') + '-ints: ' + t(ptT([0, -sh.k]) + ',\\ ' + ptT([0, sh.k])) + ' — a relation can meet the ' + t('y') + '-axis twice when it isn’t a function.', ['Look for every point where the curve meets each axis.'], 'intercepts of sideways parabola');
        } }] },
      { num: '4b', stem: function (sh) { return 'For the graph below state (i) the domain and range, (ii) whether the relation is a function, and (iii) every intercept.' + (sh.onPad ? '' : fig(G({ x: [-6, 6], y: [-5, 6], labels: 2, max: 260, segs: [{ pts: sh.pts, start: sh.start, end: sh.end }], aria: 'V-shaped relation with a hollow end' }))); }, shared: ep4bShared, parts: [
        { id: 'e4b0', sub: 'i, shade', level: 'EMG', outcome: 'RF2', make: function (r, sh) { return e4bDR(sh, true); } },
        { id: 'e4b1', sub: 'i', level: 'PRG', outcome: 'RF2', make: function (r, sh) { return e4bDR(sh, false); } },
        { id: 'e4b2', sub: 'ii', level: 'BEG', outcome: 'RF2', make: function (r) {
          var neg = r.chance(0.5); // statement "is a function" (true) or "is not a function" (false)
          return tf(r, '(ii) True or false: this relation is ' + (neg ? '<b>not</b> ' : '') + 'a function.', !neg, 'Every vertical line meets the graph at most once. (A hollow endpoint just removes one point.)',
            (neg ? '<b>False</b> — ' : '<b>True</b> — ') + 'it <b>is a function:</b> no vertical line meets the graph twice.', ['Imagine sliding a vertical line across the graph.'], 'VLT V-shape' + (neg ? ' (not a function?)' : ''));
        } },
        { id: 'e4b3', sub: 'iii', level: 'BEG', outcome: 'RF1', make: function (r, sh) {
          sh.onPad = true; // the graph is drawn on the pad, not repeated in the stem
          var xs = sh.xi.map(function (x) { return [x, 0]; }), ys = [[0, sh.yi]], lo = Math.min(sh.hollow[0], sh.solid[0]), hi = Math.max(sh.hollow[0], sh.solid[0]);
          var onG = function (p) { return p[0] >= lo - 1e-9 && p[0] <= hi + 1e-9 && !(same(p[0], sh.hollow[0]) && same(p[1], sh.hollow[1])) && same(p[1], pwAt(sh.pts.slice().sort(function (a, b) { return a[0] - b[0]; }), p[0])); };
          return tapPart('(iii) Tap every ' + t('x') + '-intercept and every ' + t('y') + '-intercept on the graph.', { x: [-6, 6], y: [-5, 6], labels: 2, bg: { segs: [{ pts: sh.pts, start: sh.start, end: sh.end }] } }, xs, ys, { onGraph: onG },
            t('x') + '-ints: ' + t(xs.map(ptT).join(',\\ ')) + '.<br>' + t('y') + '-int: ' + t(ptT([0, sh.yi])) + (sh.yi === 0 ? ' — the same point as one of the ' + t('x') + '-intercepts (the origin).' : '.'), ['Check where each straight piece crosses the axes.'], 'intercepts of a V');
        } }] },
      { num: '4c', stem: function (sh) { return 'For the graph below state (i) the domain and range, (ii) whether the relation is a function, and (iii) every intercept. Some intercepts may not exist.' + (sh.onPad ? '' : fig(G({ x: [-5, 5], y: [-5, 5], labels: 1, max: 260, points: sh.pts.map(function (p) { return { x: p[0], y: p[1] }; }), aria: 'six dots' }))); }, shared: ep4cShared, parts: [
        { id: 'e4c1', sub: 'i', level: 'BEG', outcome: 'RF2', make: function (r, sh) {
          var raw = '\\{' + sh.pts.map(function (p) { return p[1]; }).join(', ') + '\\}';
          return drPart('(i) State the domain and the range.', sh.D, sh.R, { bad: raw === sh.R ? [] : [[sh.D, raw]] },
            'Inputs, each once: ' + t('D=' + sh.D) + '.<br>Outputs, each once, in increasing order: ' + t('R=' + sh.R) + '.', [HINT_DR, HINT_LIST], 'D and R of six dots');
        } },
        { id: 'e4c2', sub: 'ii', level: 'BEG', outcome: 'RF2', make: function (r, sh) {
          var neg = r.chance(0.5); // statement "is a function" (false) or "is not a function" (true)
          return tf(r, '(ii) True or false: this relation is ' + (neg ? '<b>not</b> ' : '') + 'a function.', neg, 'Look at ' + t('x=' + sh.dbl[0]) + ': two dots lie on that vertical line, so that input has two outputs.',
            (neg ? '<b>True</b> — ' : '<b>False</b> — ') + '<b>not a function:</b> ' + t(sh.dbl[0]) + ' and ' + t(sh.dbl[1]) + ' are each paired with two outputs.', ['Is any vertical line through two dots?'], 'VLT six dots' + (neg ? ' (not a function?)' : ''));
        } },
        { id: 'e4c3', sub: 'iii', level: 'EMG', outcome: 'RF1', make: function (r, sh) {
          sh.onPad = true; // the graph is drawn on the pad, not repeated in the stem
          var onG = function (p) { return sh.pts.some(function (q) { return same(q[0], p[0]) && same(q[1], p[1]); }); };
          return tapPart('(iii) Tap every ' + t('x') + '-intercept and every ' + t('y') + '-intercept on the graph. If one kind does not exist, there is nothing to tap for it.', { x: [-5, 5], y: [-5, 5], labels: 1, bg: { points: sh.pts.map(function (p) { return { x: p[0], y: p[1] }; }) } }, [[sh.z, 0]], [], { onGraph: onG, offHint: function (p) { return Math.abs(p[0]) < 1e-9 ? 'The graph is only the dots, and no dot lies on the ' + t('y') + '-axis — so there is <b>no</b> ' + t('y') + '-intercept.' : 'The graph is only the dots: an intercept must be one of them.'; } },
            t('x') + '-int: the dot on the ' + t('x') + '-axis, ' + t(ptT([sh.z, 0])) + '.<br><b>No ' + t('y') + '-intercept:</b> no dot has ' + t('x=0') + ' (the graph is only the dots).', ['Is there a dot exactly on each axis?'], 'intercepts of dots, none');
        } }] },
      { num: '5', stem: '', parts: [
        { id: 'e5', level: 'PRG', outcome: 'RF2', make: function (r) {
          var k = r.pick([2, 2, 1, 3]);
          return mc(r, 'A relation has two ' + t('y') + '-intercepts, ' + t('(0,\\ -' + k + ')') + ' and ' + t('(0,\\ ' + k + ')') + '. Why does that fact alone settle whether the relation is a function, without drawing a vertical line?', [
            { html: 'Both points have input ' + t('0') + ', so the input ' + t('0') + ' has two outputs — it is not a function. (The ' + t('y') + '-axis is itself a vertical line meeting the graph twice.)', right: true },
            { html: 'It doesn’t: two ' + t('y') + '-intercepts are allowed, just like two ' + t('x') + '-intercepts.', why: 'Two ' + t('x') + '-intercepts are two inputs with output ' + t('0') + ' (fine). Two ' + t('y') + '-intercepts are one input with two outputs.' },
            { html: 'It is a function, because the two outputs are opposites.', why: 'Opposite or not, one input (' + t('0') + ') with two outputs is never a function.' },
            { html: 'It is not a function, because a function can’t have negative outputs.', why: 'Functions can have negative outputs. The problem is one input with two outputs.' }],
            'A ' + t('y') + '-intercept is a point with input ' + t('x=0') + '. Two of them mean the single input ' + t('0') + ' is paired with ' + t('-' + k) + ' and ' + t(k) + ': <b>not a function</b>. The ' + t('y') + '-axis is the vertical line ' + t('x=0') + ', and it already meets the graph twice.',
            ['What is the input of every ' + t('y') + '-intercept?'], 'two y-intercepts means not a function');
        } }] },
      { num: '6', shared: ep6Shared, stem: function (sh) { return 'Each part asks for a relation that meets some conditions. Choose the graph that meets <b>all</b> of them.'; }, parts: [
        { id: 'e6a', level: 'MAS', outcome: 'RF2', make: function (r, sh) {
          /* open sketch: any function meeting all the conditions (checked by rules) */
          var A = sh.a1, Bb = sh.a2, lo = sh.r1, hi = sh.r2, v = sh.v, I = { x: [-5, 5], y: [-5, 5], grid: 1, labels: 2, max: 340 };
          var cnt = function (n, w) { return n === 1 ? 'one ' + w : n + ' ' + w + 's'; };
          var chk = K.graphRules({ fn: true, domain: sh.Dt, range: sh.Rt, custom: function (val) {
            var xh = axisHits(val, 'x'), yh = axisHits(val, 'y');
            if (xh.inf) return { code: 'rule-xint', hint: 'Part of your graph lies along the ' + t('x') + '-axis — that is infinitely many ' + t('x') + '-intercepts. The graph should <b>cross</b> the ' + t('x') + '-axis exactly twice.' };
            if (xh.vals.length !== 2) return { code: 'rule-xint', hint: 'Your graph meets the ' + t('x') + '-axis ' + (xh.vals.length ? cnt(xh.vals.length, 'time') : 'nowhere') + '; it needs <b>exactly two</b> ' + t('x') + '-intercepts. Try going down below the axis and back up (a “V”).' };
            if (yh.vals.length !== 1) return { code: 'rule-yint', hint: 'Your graph needs exactly <b>one</b> ' + t('y') + '-intercept (it meets the ' + t('y') + '-axis ' + (yh.vals.length ? cnt(yh.vals.length, 'time') : 'nowhere') + ').' };
            return null;
          } });
          var key = drawing([poly([[A, hi], [v, lo], [Bb, hi]])]);
          var p = B.graph('(a) Sketch a <b>function</b> with ' + t('D=' + sh.Dt) + ', ' + t('R=' + sh.Rt) + ', exactly two ' + t('x') + '-intercepts and one ' + t('y') + '-intercept. Mark endpoints solid or hollow as required. Many answers are right.' + padHelp(true), I, chk, key,
            'Answers vary. E.g. a “V” from ' + t(ptT([A, hi])) + ' down to ' + t(ptT([v, lo])) + ' and up to ' + t(ptT([Bb, hi])) + ' with solid ends: it runs from ' + t('x=' + A) + ' to ' + t('x=' + Bb) + ', from ' + t('y=' + lo) + ' to ' + t('y=' + hi) + ', crosses the ' + t('x') + '-axis twice and the ' + t('y') + '-axis once, and every vertical line meets it at most once.',
            ['Start with the ends: the graph must begin at ' + t('x=' + A) + ' and end at ' + t('x=' + Bb) + ' with solid dots (≤ in the domain).', 'To cross the ' + t('x') + '-axis twice, go down below it and back up. Its lowest point is ' + t('y=' + lo) + ', its highest ' + t('y=' + hi) + '.'], 'sketch a function with given D, R and intercepts');
          p.good = [drawing([poly([[A, lo], [0, hi], [Bb, lo]])]), drawing([poly([[Bb, hi], [v, lo], [A, hi]])])];
          p.bad = [drawing([poly([[A, lo], [Bb, hi]])]), drawing([poly([[Bb, hi], [A, Math.round((lo + hi) / 2)], [Bb, lo]])]), drawing([poly([[A, hi], [v, lo], [Bb - 1, hi]])]),
            drawing([poly([[A, hi], [v, lo], [Bb, hi]], 'open', 'closed')]), drawing([poly([[A, hi], [v, lo + 1], [Bb, hi]])]), drawing([poly([[A, hi], [v, lo], [Bb, hi]], 'arrow', 'arrow')])];
          return p;
        } },
        { id: 'e6b', level: 'ADV', outcome: 'RF2', make: function (r, sh) {
          var A = sh.a1, Bb = sh.a2, lo = sh.r1, hi = sh.r2, mid = Math.round((lo + hi) / 2), I = { x: [-5, 5], y: [-5, 5], grid: 1, labels: 2, max: 340 };
          var chk = K.graphRules({ fn: false, domain: sh.Dt, range: sh.Rt });
          var key = drawing([poly([[Bb, hi], [A, mid], [Bb, lo]])]);
          var p = B.graph('(b) Sketch a relation that is <b>not</b> a function, with exactly the same domain and range as (a): ' + t('D=' + sh.Dt) + ', ' + t('R=' + sh.Rt) + '. Many answers are right.' + padHelp(true), I, chk, key,
            'Answers vary. E.g. the “V” turned on its side: ' + t(ptT([Bb, hi])) + ' to ' + t(ptT([A, mid])) + ' to ' + t(ptT([Bb, lo])) + '. It still covers ' + t(cond('x', A, Bb)) + ' and ' + t(cond('y', lo, hi)) + ', but a vertical line such as ' + t('x=0') + ' meets it twice.',
            ['Make some vertical line meet your graph twice — e.g. turn a “V” on its side.', 'Then check: does it still reach from ' + t('x=' + A) + ' to ' + t('x=' + Bb) + ' and from ' + t('y=' + lo) + ' to ' + t('y=' + hi) + '?'], 'sketch a non-function with given D and R');
          p.good = [drawing([seg([A, lo], [Bb, hi]), seg([A, hi], [Bb, lo])])];
          p.bad = [drawing([poly([[A, hi], [sh.v, lo], [Bb, hi]])]), drawing([poly([[Bb, hi], [A + 1, mid], [Bb, lo]])]), drawing([poly([[Bb, hi - 1], [A, mid], [Bb, lo]])]), drawing([poly([[Bb, hi], [A, mid], [Bb, lo]], 'open', 'closed')])];
          return p;
        } },
        { id: 'e6b2', sub: 'b ii', level: 'EMG', outcome: 'RF2', make: function (r) {
          return mc(r, '(b) What is the one feature that makes the difference between a graph for (a) and a graph for (b)?', [
            { html: 'In (b) some vertical line meets the graph twice — one input with two outputs.', right: true },
            { html: 'In (b) the graph has endpoints.', why: 'Both graphs have endpoints (both domains are restricted).' },
            { html: 'In (b) the graph has two ' + t('x') + '-intercepts.', why: 'Functions can have two ' + t('x') + '-intercepts — (a) does.' },
            { html: 'In (b) the range is different.', why: 'The question makes the domain and range the same in both.' }],
            'Same domain, same range — the only difference is the vertical line test: in (b) some input has two outputs.', ['What is the definition of a function?'], 'function vs not, same D and R');
        } },
        { id: 'e6c', level: 'PRG', outcome: 'RF2', make: function (r, sh) {
          var k = sh.k, I = { x: [-5, 5], y: [-5, 5], grid: 1, labels: 2, max: 340 };
          var target = drawing([seg([-4, k], [4, k], 'arrow', 'arrow')]);
          var W = [{ is: drawing([seg([k, -4], [k, 4], 'arrow', 'arrow')]), code: 'rule-fn', hint: 'That is the vertical line ' + t('x=' + k) + ': its domain is ' + t('\\{' + k + '\\}') + ', its range is all real numbers, and it is not a function. The <b>output</b> is always ' + t(k) + ': ' + t('y=' + k) + '.' },
            { is: drawing([seg([-4, -k], [4, -k], 'arrow', 'arrow')]), code: 'graph-points', hint: 'Check the height: the only output is ' + t(k) + ', so the line is ' + t('y=' + k) + '.' }];
          var exact = K.graphExact(target, { wrong: W }), rules = K.graphRules({ fn: true, domain: '\\mathbb{R}', range: '\\{' + k + '\\}' });
          var chk = function (resp) { var a = exact(resp); if (a.v === 'wrong' && (a.code === 'graph' || a.code === 'graph-length')) { var b = rules(resp); if (b.v === 'wrong') return b; } return a; };
          var p = B.graph('(c) Sketch a function with ' + t('D=\\{x\\mid x\\in\\mathbb{R}\\}') + ' and ' + t('R=\\{' + k + '\\}') + '.' + padHelp(true), I, chk, target,
            'The horizontal line ' + t('y=' + k) + ' with <b>arrows at both ends</b>: every real ' + t('x') + ' is an input, and ' + t(k) + ' is the only output.', ['Only one output value, for every possible input.', 'All real numbers as inputs: the graph never stops — arrows.'], 'horizontal line D=R, R={k}');
          p.good = [drawing([seg([5, k], [-5, k], 'arrow', 'arrow')]), drawing([seg([0, k], [1, k], 'arrow', 'arrow')])];
          p.bad = W.map(function (w) { return w.is; }).concat([drawing([seg([-3, k], [3, k])]), drawing([seg([-5, -4], [5, 4], 'arrow', 'arrow')]), drawing([seg([-4, k], [4, k], 'closed', 'arrow')])]);
          return p;
        } },
        { id: 'e6c2', sub: 'c ii', level: 'EMG', outcome: 'RF1', make: function (r, sh) {
          return intPart('(c) State both intercepts of the graph ' + t('y=' + sh.k) + ', or press <b>none</b> for one that does not exist.', [], [[0, sh.k]], { none: true },
            t('y') + '-int: ' + t(ptT([0, sh.k])) + '.<br><b>No ' + t('x') + '-intercept:</b> the graph never reaches ' + t('y=0') + '.', ['Does the line ' + t('y=' + sh.k) + ' ever meet the ' + t('x') + '-axis?'], 'intercepts of y=k');
        } }] },
      /* ================= EP Part C ================= */
      { num: '7', section: 'Extra practice C — Functions and function notation', shared: ep7Shared,
        stem: function (sh) { return 'Let ' + t('f(x)=' + sh.f) + ' and ' + t('g(x)=' + sh.g) + '. Work exactly.'; }, parts: [
        { id: 'e7a', level: 'EMG', make: function (r, sh) {
          var fa = sh.c - sh.m * sh.a1, ga = sh.a2 * sh.a2 - sh.k * sh.a2;
          return fieldsOf('(a) Evaluate ' + t('f(' + sh.a1 + ')') + ' and ' + t('g(' + sh.a2 + ')') + '.', [
            numF(t('f(' + sh.a1 + ')='), fa, function (u) { if (same(u, sh.c + sh.m * sh.a1)) return { code: 'ev-sign', hint: t('-' + sh.m + '(' + sh.a1 + ')=+' + (-sh.m * sh.a1)) + ': a negative times a negative is positive.' }; return null; }),
            numF(t('g(' + sh.a2 + ')='), ga, function (u) { if (same(u, -sh.a2 * sh.a2 - sh.k * sh.a2)) return { code: 'sq-neg', hint: t('(' + sh.a2 + ')^{2}=+' + sh.a2 * sh.a2) + ' — squaring a negative gives a positive.' }; if (same(u, sh.a2 * sh.a2 + sh.k * sh.a2)) return { code: 'ev-sign', hint: t('-' + sh.k + '(' + sh.a2 + ')=+' + (-sh.k * sh.a2)) + '.' }; return null; })],
            t('f(' + sh.a1 + ')=' + fa) + ', ' + t('g(' + sh.a2 + ')=' + ga),
            t('f(' + sh.a1 + ')=' + sh.c + '-' + sh.m + '(' + sh.a1 + ')=' + sh.c + '+' + (-sh.m * sh.a1) + '=' + fa) + '<br>' + t('g(' + sh.a2 + ')=(' + sh.a2 + ')^{2}-' + sh.k + '(' + sh.a2 + ')=' + sh.a2 * sh.a2 + '+' + (-sh.k * sh.a2) + '=' + ga), [HINT_EVAL], 'evaluate f and g at negatives');
        } },
        { id: 'e7b', level: 'EMG', make: function (r, sh) {
          var fa = sh.c - sh.m * sh.a1;
          return B.number('(b) Solve ' + t('f(x)=' + fa) + '.', sh.a1, function (u) {
            if (same(u, sh.c - sh.m * fa)) return { code: 'ev-instead', hint: 'You found ' + t('f(' + fa + ')') + '. Here ' + t(fa) + ' is the output: solve ' + t(sh.f + '=' + fa) + '.' };
            if (same(u, -sh.a1)) return { code: 'sign', hint: 'Check the sign when you divide by ' + t('-' + sh.m) + '.' };
            return null;
          }, t(sh.f + '=' + fa) + '<br>' + t('-' + sh.m + 'x=' + (fa - sh.c)) + '<br>' + t('x=' + sh.a1), [HINT_SOLVE], 'solve f(x)=b', { before: t('x=') });
        } },
        { id: 'e7b2', sub: 'b ii', level: 'EMG', make: function (r, sh) {
          var fa = sh.c - sh.m * sh.a1;
          return mc(r, '(b) What did part (a) already tell you about the solution of ' + t('f(x)=' + fa) + '?', [
            { html: 'Part (a) showed ' + t('f(' + sh.a1 + ')=' + fa) + ': the point ' + t(ptT([sh.a1, fa])) + ' is on the graph, so ' + t('x=' + sh.a1) + ' had to be a solution.', right: true },
            { html: 'Nothing — evaluating and solving are unrelated.', why: 'They are reverse questions: (a) went from input to output, (b) goes from that output back to the input.' },
            { html: 'It told us the solution is ' + t('x=' + fa) + '.', why: t(fa) + ' is the output. The input that produced it was ' + t(sh.a1) + '.' },
            { html: 'It told us ' + t('f') + ' has two solutions.', why: 'A slanted line reaches each height only once, so there is exactly one solution.' }],
            t('f(' + sh.a1 + ')=' + fa) + ' means input ' + t(sh.a1) + ' gives output ' + t(fa) + ', so solving ' + t('f(x)=' + fa) + ' had to give ' + t('x=' + sh.a1) + ' — and a non-horizontal line reaches ' + t(fa) + ' only once.', ['Compare the input and output in (a) with the equation in (b).'], 'evaluate vs solve link');
        } },
        { id: 'e7c', level: 'ADV', make: function (r, sh) {
          var o = sh.k - sh.rt;
          return B.valueSet('(c) Solve ' + t('g(x)=' + sh.q) + '.', [sh.rt, o], { v: 'x', diag: function (A) {
            if (A.length === 1 && same(A[0], sh.rt)) return { code: 'sol-missing', hint: 'Correct so far — a quadratic can have two solutions. Factor ' + t('x^{2}-' + sh.k + 'x-' + sh.q) + ' and set each factor to ' + t('0') + '.' };
            return null;
          } }, t(sh.g + '=' + sh.q) + '<br>' + t('x^{2}-' + sh.k + 'x-' + sh.q + '=0') + '<br>' + t('(x-' + sh.rt + ')(x+' + (-o) + ')=0') + '<br>' + t('x=' + sh.rt) + ' or ' + t('x=' + o),
            ['Move everything to one side so it equals ' + t('0') + ', then factor.'], 'solve g(x)=q quadratic');
        } },
        { id: 'e7c2', sub: 'c ii', level: 'EMG', make: function (r, sh) {
          return mc(r, '(c) Why does ' + t('g(x)=' + sh.q) + ' have two answers, while ' + t('f(x)=' + (sh.c - sh.m * sh.a1)) + ' in (b) has only one?', [
            { html: 'The graph of ' + t('g') + ' is a parabola: a horizontal line above its vertex crosses it twice. The graph of ' + t('f') + ' is a slanted line, which meets each height once.', right: true },
            { html: 'Because ' + t('g') + ' is not a function.', why: t('g') + ' is a function (each ' + t('x') + ' gives one output). Two <b>inputs</b> may share an output.' },
            { html: 'Because ' + t(sh.q) + ' is a positive number.', why: 'The sign of the output isn’t the reason — it’s the shape of the graph.' },
            { html: 'Because quadratics always have exactly two solutions.', why: 'Not always: an output below the vertex gives none, and the vertex height gives one.' }],
            t('g') + ' is quadratic; the line ' + t('y=' + sh.q) + ' is above its vertex, so it crosses the parabola twice. ' + t('f') + '’s graph is a non-horizontal line, which meets each horizontal line once.', ['Picture both graphs and a horizontal line at the given height.'], 'why two solutions for quadratic');
        } },
        { id: 'e7d1', sub: 'd i', level: 'PRG', make: function (r, sh) {
          var T = P(lin([[sh.c - sh.m * sh.s, ''], [-sh.m, 'a']]));
          var W = [{ is: P(lin([[sh.c + sh.s, ''], [-sh.m, 'a']])), code: 'brackets', hint: 'Multiply ' + t('-' + sh.m) + ' by <b>both</b> terms of ' + t('(a+' + sh.s + ')') + '.' }, { is: P(lin([[sh.c + sh.m * sh.s, ''], [-sh.m, 'a']])), code: 'sign', hint: t('-' + sh.m + '(a+' + sh.s + ')=-' + sh.m + 'a-' + sh.m * sh.s) + ' — check the sign of the constant.' }];
          var p = K.P.poly('(d) Simplify ' + t('f(a+' + sh.s + ')') + '.', T, { before: t('f(a+' + sh.s + ')='), wrong: (W = fw(W, T)), vars: ['a'] },
            t('f(a+' + sh.s + ')=' + sh.c + '-' + sh.m + '(a+' + sh.s + ')=' + sh.c + '-' + sh.m + 'a-' + sh.m * sh.s + '=' + PL.tex(T)), ['Replace every ' + t('x') + ' with ' + t('(a+' + sh.s + ')') + ', then expand and collect.'], 'f(a+s)');
          p.bad = W.map(function (w) { return PL.tex(w.is); });
          return p;
        } },
        { id: 'e7d2', sub: 'd ii', level: 'PRG', make: function (r, sh) {
          var n = sh.n, T = P(lin([[n * n, 't^{2}'], [-sh.k * n, 't']]));
          var W = [{ is: P(lin([[n, 't^{2}'], [-sh.k * n, 't']])), code: 'brackets', hint: t('(' + n + 't)^{2}=' + n + '^{2}t^{2}=' + n * n + 't^{2}') + ' — square the ' + t(n) + ' too.' }, { is: P(lin([[n, 't^{2}'], [-sh.k, 't']])), code: 'diag', hint: 'Replace every ' + t('x') + ' with the whole of ' + t('(' + n + 't)') + ', in both terms.' }];
          var p = K.P.poly('(d) Simplify ' + t('g(' + n + 't)') + '.', T, { before: t('g(' + n + 't)='), wrong: (W = fw(W, T)), vars: ['t'] },
            t('g(' + n + 't)=(' + n + 't)^{2}-' + sh.k + '(' + n + 't)=' + PL.tex(T)), ['Replace every ' + t('x') + ' with ' + t('(' + n + 't)') + '. Remember ' + t('(' + n + 't)^{2}=' + n + '^{2}t^{2}') + '.'], 'g(nt)');
          p.bad = W.map(function (w) { return PL.tex(w.is); });
          return p;
        } },
        { id: 'e7e', level: 'PRG', outcome: 'RF1', make: function (r, sh) {
          return intPart('(e) State the ' + t('x') + '-intercepts and the ' + t('y') + '-intercept of the graph of ' + t('g') + '.', [[0, 0], [sh.k, 0]], [[0, 0]], { plural: true },
            t('x') + '-ints: solve ' + t('g(x)=0') + ': ' + t(sh.g + '=0\\Rightarrow x(x-' + sh.k + ')=0') + ', so ' + t('x=0') + ' or ' + t('x=' + sh.k) + ': ' + t('(0,\\ 0),\\ (' + sh.k + ',\\ 0)') + '.<br>' + t('y') + '-int: evaluate ' + t('g(0)=0') + ': ' + t('(0,\\ 0)') + ' — the same point as one ' + t('x') + '-intercept.',
            ['For the ' + t('x') + '-intercepts solve ' + t('g(x)=0') + ' (factor out ' + t('x') + '); for the ' + t('y') + '-intercept evaluate ' + t('g(0)') + '.'], 'intercepts of x^2-kx');
        } },
        { id: 'e7f', level: 'EMG', outcome: 'RF2', make: function (r, sh) {
          var fl = [{ label: 'Domain of ' + t('f'), name: 'Domain of f', mode: 'math', keys: 'set', vars: ['x', 'y'], placeholder: ph('x') }, { label: 'Range of ' + t('f'), name: 'Range of f', mode: 'math', keys: 'set', vars: ['x', 'y'], placeholder: ph('y') }, { label: 'Domain of ' + t('g'), name: 'Domain of g', mode: 'math', keys: 'set', vars: ['x', 'y'], placeholder: ph('x') }];
          var p = B.fields('(f) State the domain and range of ' + t('f') + ', and the domain of ' + t('g') + ', with no restriction applied.', fl,
            [setChk(all('x'), { v: 'x' }), setChk(all('y'), { v: 'y', wrong: [{ is: bld('y', null, sh.c), code: 'set-values', hint: 'A slanted line keeps going up and down forever, so it reaches every height.' }] }), setChk(all('x'), { v: 'x', wrong: [{ is: bld('x', 0, null), code: 'set-values', hint: 'Any real number can be squared — negative inputs too.' }] })],
            [all('x'), all('y'), all('x')], t('f') + ': ' + t('D=' + all('x')) + ', ' + t('R=' + all('y')) + '; ' + t('g') + ': ' + t('D=' + all('x')),
            t('f') + ': ' + t('D=' + all('x')) + ', ' + t('R=' + all('y')) + ' (a slanted line reaches every height).<br>' + t('g') + ': ' + t('D=' + all('x')) + ' (any real ' + t('x') + ' can be squared).', ['With no restriction, can you substitute any real number?'], 'D and R with no restriction');
          p.good = [['x\\in\\mathbb{R}', 'y\\in\\mathbb{R}', '\\mathbb{R}']]; p.bad = [[all('x'), bld('y', 0, null), all('x')]];
          return p;
        } }] },
      { num: '8', shared: ep8Shared,
        stem: function (sh) { return 'The graph below is the whole graph of a function ' + t('h') + '. Its equation is ' + t('h(x)=' + dfr(sh.rule)) + '.' + (sh.onPad ? '' : fig(G({ x: [-7, 9], y: [-2, 8], labels: 2, max: 320, segs: [{ pts: [[sh.xL, sh.yL], [sh.X0, 0]], start: 'closed', end: 'closed' }], aria: 'segment of a line' }))); }, parts: [
        { id: 'e8as', sub: 'a, shade', level: 'BEG', outcome: 'RF2', make: function (r, sh) { return e8aDR(sh, true); } },
        { id: 'e8a', level: 'EMG', outcome: 'RF2', make: function (r, sh) { return e8aDR(sh, false); } },
        { id: 'e8b', level: 'BEG', make: function (r, sh) {
          var v1 = sh.h(sh.x1);
          return fieldsOf('(b) Read ' + t('h(0)') + ' and ' + t('h(' + sh.x1 + ')') + ' off the graph (then check by substituting).', [numF(t('h(0)='), sh.b), numF(t('h(' + sh.x1 + ')='), v1)], t('h(0)=' + sh.b) + ', ' + t('h(' + sh.x1 + ')=' + nf(v1)),
            'Graph: the line crosses ' + t('x=0') + ' at ' + t('y=' + sh.b) + ' and passes through ' + t(ptT([sh.x1, v1])) + '.<br>Check: ' + t('h(0)=' + dfr(frT(-sh.p, sh.q)) + '(0)+' + sh.b + '=' + sh.b) + ' ✓, ' + t('h(' + sh.x1 + ')=' + dfr(frT(-sh.p, sh.q)) + '(' + sh.x1 + ')+' + sh.b + '=' + nf(v1)) + ' ✓', ['Go to the input on the ' + t('x') + '-axis, then up or down to the line.'], 'read h(a) off a segment');
        } },
        { id: 'e8c', level: 'BEG', outcome: 'RF1', make: function (r, sh) {
          sh.onPad = true; // the graph is drawn on the pad, not repeated in the stem
          var onG = function (p) { return p[0] >= sh.xL - 1e-9 && p[0] <= sh.X0 + 1e-9 && same(p[1], sh.h(p[0])); };
          return tapPart('(c) Tap both intercepts of ' + t('h') + ' on the graph.', { x: [-7, 9], y: [-2, 8], labels: 2, bg: { segs: [{ pts: [[sh.xL, sh.yL], [sh.X0, 0]], start: 'closed', end: 'closed' }] } }, [[sh.X0, 0]], [[0, sh.b]], { onGraph: onG },
            t('x') + '-int: ' + t(dfr(sh.rule) + '=0\\Rightarrow x=' + sh.X0) + ': ' + t(ptT([sh.X0, 0])) + '.<br>' + t('y') + '-int: ' + t('h(0)=' + sh.b) + ': ' + t(ptT([0, sh.b])) + '.<br>' + t(ptT([sh.X0, 0])) + ' is also the right endpoint. It is solid, so it is on the graph and still counts. (If it were hollow, there would be no ' + t('x') + '-intercept.)',
            ['An intercept at an endpoint counts if the endpoint is solid.'], 'intercepts at an endpoint');
        } },
        { id: 'e8d', level: 'EMG', make: function (r, sh) {
          var y2 = sh.h(sh.x2);
          return B.number('(d) Solve ' + t('h(x)=' + nf(y2)) + '.', sh.x2, function (u) {
            if (same(u, sh.h(y2))) return { code: 'ev-instead', hint: 'You found ' + t('h(' + nf(y2) + ')') + '. Here ' + t(nf(y2)) + ' is the output: go across from ' + t('y=' + nf(y2)) + ' to the line, then down to the axis.' };
            return null;
          }, 'Graph: across from ' + t('y=' + nf(y2)) + ' to the line, then to the axis: ' + t('x=' + sh.x2) + '.<br>Equation: ' + t(dfr(sh.rule) + '=' + nf(y2)) + ' gives ' + t(dfr(frT(-sh.p, sh.q)) + 'x=' + nf(y2 - sh.b)) + ', so ' + t('x=' + sh.x2) + ' (in the domain ✓).', [HINT_SOLVE], 'solve h(x)=b', { before: t('x=') });
        } },
        { id: 'e8e', level: 'EMG', outcome: 'RF2', make: function (r, sh) {
          return mc(r, '(e) A line usually has range ' + t('\\{y\\mid y\\in\\mathbb{R}\\}') + '. Why doesn’t this one?', [
            { html: 'The graph is only the segment from ' + t('x=' + sh.xL) + ' to ' + t('x=' + sh.X0) + ', so its outputs stop at the endpoints’ heights, ' + t('0') + ' and ' + t(sh.yL) + '.', right: true },
            { html: 'Because its slope is negative.', why: 'A full line with a negative slope still reaches every height. The restriction is the endpoints.' },
            { html: 'Because ' + t('h') + ' is a function.', why: 'Functions can have range ' + t('\\mathbb{R}') + ' (e.g. ' + t('y=x') + '). Here the graph stops at two endpoints.' },
            { html: 'Because the slope is a fraction.', why: 'The slope doesn’t limit the range. The domain is restricted, so the outputs are too.' }],
            'The domain is restricted to ' + t(cond('x', sh.xL, sh.X0)) + ', so the outputs stop at the heights of the endpoints instead of continuing up and down forever.', ['Look at the ends of the graph: arrows or dots?'], 'why restricted range');
        } }] },
      { num: '9', stem: function (sh) { return 'Each function below is linear, but you are not given its equation.<br>(a) ' + t('f') + ' satisfies ' + t('f(' + sh.x1 + ')=' + sh.y1) + ' and ' + t('f(' + sh.x2 + ')=' + sh.y2) + '.<br>(b) The graph of ' + t('h') + ' has ' + t('x') + '-intercept ' + t(ptT([sh.x0, 0])) + ', and ' + t('h(' + sh.hx1 + ')=' + sh.hy1) + '.'; },
        shared: function (r) {
          var m, b, x1, x2, s;
          for (var g = 0; g < 200; g++) { m = r.pick([3, 3, 2, 4]); b = r.pick([-5, -5, -7, -4, -1, -3, 1]); x1 = r.pick([2, 2, 1, 3]); x2 = x1 + r.pick([3, 3, 2, 4]); if (r.chance(0.3)) { m = 3; b = -5; x1 = 2; x2 = 5; } if ((-b) % m !== 0) break; }
          var pq, x0, hb, hx1, hy1, hT, hx2;
          for (g = 0; g < 200; g++) {
            pq = r.pick([[3, 2], [3, 2], [1, 2], [2, 3], [4, 3], [5, 2]]); x0 = -pq[1] * r.int(1, 3); hb = -pq[0] * x0 / pq[1]; hx1 = x0 + pq[1] * r.int(2, 4); hy1 = pq[0] * (hx1 - x0) / pq[1]; hx2 = x0 + pq[1] * r.int(3, 6);
            if (r.chance(0.3)) { pq = [3, 2]; x0 = -4; hb = 6; hx1 = 2; hy1 = 9; hx2 = 6; }
            hT = pq[0] * (hx2 - x0) / pq[1];
            if (hx1 > 0 && hx2 !== hx1 && hx2 !== 0 && hb <= 12 && hT <= 30) break;
          }
          return { m: m, b: b, x1: x1, x2: x2, y1: m * x1 + b, y2: m * x2 + b, p: pq[0], q: pq[1], x0: x0, hb: hb, hx1: hx1, hy1: hy1, hx2: hx2, hT: hT };
        }, parts: [
        { id: 'e9a1', sub: 'a i', level: 'PRG', make: function (r, sh) {
          var T = P(lin([[sh.m, 'x'], [sh.b, '']]));
          var W = [{ is: P(lin([[[1, sh.m], 'x'], [sh.b, '']])), code: 'rate-flip', hint: 'Slope = change in output ÷ change in input: ' + t('\\dfrac{' + sh.y2 + '-' + par(sh.y1) + '}{' + sh.x2 + '-' + sh.x1 + '}') + '.' }, { is: P(lin([[sh.m, 'x'], [sh.y1 + sh.m * sh.x1, '']])), code: 'sign', hint: 'Check the constant: ' + t(sh.m + '(' + sh.x1 + ')+b=' + sh.y1) + ' gives ' + t('b=' + sh.y1 + '-' + sh.m * sh.x1) + '.' }];
          var p = K.P.poly('(a) ' + t('f') + ' satisfies ' + t('f(' + sh.x1 + ')=' + sh.y1) + ' and ' + t('f(' + sh.x2 + ')=' + sh.y2) + '. Determine ' + t('f(x)') + '.', T, { before: t('f(x)='), wrong: (W = fw(W, T)) },
            t('m=\\dfrac{' + sh.y2 + '-' + par(sh.y1) + '}{' + sh.x2 + '-' + sh.x1 + '}=\\dfrac{' + (sh.y2 - sh.y1) + '}{' + (sh.x2 - sh.x1) + '}=' + sh.m) + ', so ' + t('f(x)=' + sh.m + 'x+b') + '.<br>' + t('f(' + sh.x1 + ')=' + sh.y1 + ':\\ ' + sh.m + '(' + sh.x1 + ')+b=' + sh.y1 + ',\\ b=' + sh.b) + '<br>' + t('f(x)=' + PL.tex(T)),
            ['The two values are two points on the line: ' + t(ptT([sh.x1, sh.y1])) + ' and ' + t(ptT([sh.x2, sh.y2])) + '. Find the slope first.'], 'linear f from two values');
          p.answer = t('f(x)=' + PL.tex(T)); p.bad = W.map(function (w) { return PL.tex(w.is); });
          return p;
        } },
        { id: 'e9a2', sub: 'a ii', level: 'EMG', outcome: 'RF1', make: function (r, sh) {
          var xi = ex.norm(-sh.b, sh.m), fl = [{ label: t('f(0)='), name: 'f(0)', mode: 'math', keys: 'pairs' }, ptsF(t('y') + '-int'), ptsF(t('x') + '-int')];
          var p = B.fields('(a) For the same ' + t('f') + ', state ' + t('f(0)') + ', the ' + t('y') + '-intercept and the ' + t('x') + '-intercept of its graph.', fl,
            [K.value(sh.b), ptsChk([[0, sh.b]], { axis: 'y', other: [[xi[0] / xi[1], 0]] }), ptsChk([[xi[0] / xi[1], 0]], { axis: 'x', other: [[0, sh.b]], diag: function (A) { if (A.length === 1 && same(A[0][1], 0) && same(A[0][0], sh.b / sh.m)) return { code: 'sign', hint: 'Check the sign: ' + t(sh.m + 'x' + (sh.b < 0 ? sh.b : '+' + sh.b) + '=0') + ' gives ' + t(sh.m + 'x=' + (-sh.b)) + '.' }; return null; } })],
            [String(sh.b), ptK([0, sh.b]), '(' + ex.texRat(xi) + ', 0)'], t('f(0)=' + sh.b) + '; ' + t('y') + '-int ' + t(ptT([0, sh.b])) + '; ' + t('x') + '-int ' + t('\\left(' + ex.texRat(xi) + ',\\ 0\\right)'),
            t('f(0)=' + sh.b) + ', so the ' + t('y') + '-int is ' + t(ptT([0, sh.b])) + '.<br>' + t('x') + '-int: ' + t(sh.m + 'x' + (sh.b < 0 ? sh.b : '+' + sh.b) + '=0\\Rightarrow x=' + ex.texRat(xi)) + ', so ' + t('\\left(' + ex.texRat(xi) + ',\\ 0\\right)') + '.',
            ['The ' + t('y') + '-intercept is the point ' + t('(0,\\ f(0))') + '. For the ' + t('x') + '-intercept solve ' + t('f(x)=0') + ' — the answer can be a fraction.'], 'f(0), intercepts of f');
          p.good = [[String(sh.b), ptK([0, sh.b]), '(' + nf(xi[0] / xi[1]) + ', 0)']].filter(function () { return String(xi[0] / xi[1]).length < 8; });
          return p;
        } },
        { id: 'e9a3', sub: 'a iii', level: 'BEG', outcome: 'RF2', make: function (r) {
          return drPart('(a) State the domain and range of ' + t('f') + '.', all('x'), all('y'), {}, 'A non-horizontal line with no restriction: ' + t('D=\\{x\\mid x\\in\\mathbb{R}\\}') + ', ' + t('R=\\{y\\mid y\\in\\mathbb{R}\\}') + '.', ['Is there anything stopping the line on either side?'], 'D and R of a line');
        } },
        { id: 'e9b1', sub: 'b i', level: 'PRG', make: function (r, sh) {
          var m = [sh.p, sh.q], T = P(lin([[m, 'x'], [sh.hb, '']]));
          var W = [{ is: P(lin([[[sh.q, sh.p], 'x'], [sh.hb, '']])), code: 'rate-flip', hint: 'Slope = change in output ÷ change in input: ' + t('\\dfrac{' + sh.hy1 + '-0}{' + sh.hx1 + '-' + par(sh.x0) + '}') + '.' }, { is: P(lin([[m, 'x'], [-sh.hb, '']])), code: 'sign', hint: 'Check the constant: substitute ' + t(ptT([sh.x0, 0])) + ' and solve for ' + t('b') + ' carefully.' }];
          var p = K.P.poly('(b) The graph of ' + t('h') + ' has ' + t('x') + '-intercept ' + t(ptT([sh.x0, 0])) + ', and ' + t('h(' + sh.hx1 + ')=' + sh.hy1) + '. Determine ' + t('h(x)') + '.', T, { before: t('h(x)='), wrong: (W = fw(W, T)) },
            t(ptT([sh.x0, 0])) + ' and ' + t(ptT([sh.hx1, sh.hy1])) + ' are on the graph: ' + t('m=\\dfrac{' + sh.hy1 + '-0}{' + sh.hx1 + '-' + par(sh.x0) + '}=\\dfrac{' + sh.hy1 + '}{' + (sh.hx1 - sh.x0) + '}=' + frT(sh.p, sh.q)) + '.<br>' + t('h(' + sh.x0 + ')=0:\\ ' + frT(sh.p, sh.q) + '(' + sh.x0 + ')+b=0,\\ b=' + sh.hb) + '<br>' + t('h(x)=' + PL.tex(T)),
            ['An ' + t('x') + '-intercept is a point: ' + t(ptT([sh.x0, 0])) + '. With ' + t(ptT([sh.hx1, sh.hy1])) + ' you have two points on the line.'], 'linear h from intercept and value');
          p.answer = t('h(x)=' + PL.tex(T)); p.bad = W.map(function (w) { return PL.tex(w.is); });
          return p;
        } },
        { id: 'e9b2', sub: 'b ii', level: 'EMG', make: function (r, sh) {
          var fl = [{ label: 'Solution of ' + t('h(x)=' + sh.hT) + ': ' + t('x='), name: 'solution', mode: 'math', keys: 'pairs' }, ptsF(t('y') + '-int')];
          var p = B.fields('(b) For the same ' + t('h') + ', solve ' + t('h(x)=' + sh.hT) + ' and state the ' + t('y') + '-intercept.', fl,
            [K.value(sh.hx2, { diag: function (u) { if (same(u, sh.p * sh.hT / sh.q + sh.hb)) return { code: 'ev-instead', hint: 'You found ' + t('h(' + sh.hT + ')') + '. Solve ' + t(frT(sh.p, sh.q) + 'x+' + sh.hb + '=' + sh.hT) + ' instead.' }; return null; } }), ptsChk([[0, sh.hb]], { axis: 'y', other: [[sh.x0, 0]] })],
            [String(sh.hx2), ptK([0, sh.hb])], t('x=' + sh.hx2) + '; ' + t('y') + '-int ' + t(ptT([0, sh.hb])),
            t(frT(sh.p, sh.q) + 'x+' + sh.hb + '=' + sh.hT + '\\Rightarrow ' + frT(sh.p, sh.q) + 'x=' + (sh.hT - sh.hb) + '\\Rightarrow x=' + sh.hx2) + '.<br>' + t('y') + '-int: ' + t('h(0)=' + sh.hb) + ', so ' + t(ptT([0, sh.hb])) + '.', [HINT_SOLVE], 'solve h(x)=T and y-int');
          return p;
        } }] },
      /* ================= EP Part D ================= */
      { num: '10', section: 'Extra practice D — Graphs in context', outcome: 'RF1',
        shared: function (r) {
          var rr = r.pick([12.5, 12.5, 10, 20, 8, 25]), T = 100 / rr, k = r.int(1, Math.max(1, Math.floor(T) - 1)), V;
          if (rr === 12.5 && r.chance(0.6)) k = 3;
          for (var g = 0; g < 100; g++) { V = 5 * r.int(2, 18); var tt = (100 - V) / rr; if (Math.abs(tt * 100 - Math.round(tt * 100)) < 1e-9 && !Number.isInteger(tt) || g > 60 && Number.isInteger(tt)) break; }
          if (rr === 12.5 && r.chance(0.6)) V = 30;
          return { r: rr, T: T, k: k, Ck: cl(100 - rr * k), V: V, tV: cl((100 - V) / rr) };
        },
        stem: function (sh) { return 'A tablet plays video until its battery is flat. The charge remaining, ' + t('C') + ' percent, after ' + t('t') + ' hours of playback is modelled by ' + t('C(t)=100-' + nf(sh.r) + 't') + '.'; }, parts: [
        { id: 'e10a', level: 'BEG', outcome: 'RF8', make: function (r, sh) {
          return B.number('(a) Determine ' + t('C(' + sh.k + ')') + '.', sh.Ck, function (u) { if (same(u, sh.r * sh.k)) return { code: 'diag', hint: 'That is the charge used. ' + t('C(' + sh.k + ')') + ' is the charge remaining: ' + t('100-' + nf(sh.r * sh.k)) + '.' }; return null; },
            t('C(' + sh.k + ')=100-' + nf(sh.r) + '(' + sh.k + ')=100-' + nf(sh.r * sh.k) + '=' + nf(sh.Ck)), [HINT_EVAL.replace(t('x'), t('t'))], 'C(k)', { after: '%' });
        } },
        { id: 'e10a2', sub: 'a ii', level: 'EMG', outcome: 'RF8', make: function (r, sh) {
          return mc(r, '(a) What does ' + t('C(' + sh.k + ')=' + nf(sh.Ck)) + ' mean?', [
            { html: 'After ' + t(sh.k) + ' hour' + (sh.k === 1 ? '' : 's') + ' of playback, ' + t(nf(sh.Ck)) + '% of the charge remains.', right: true },
            { html: 'After ' + t(nf(sh.Ck)) + ' hours of playback, ' + t(sh.k) + '% of the charge remains.', why: 'The input (in brackets) is the time ' + t('t') + '; the output is the charge.' },
            { html: 'The tablet uses ' + t(nf(sh.Ck)) + '% of its charge every ' + t(sh.k) + ' hour' + (sh.k === 1 ? '' : 's') + '.', why: 'The rate of use is ' + t(nf(sh.r)) + '% per hour. ' + t('C(' + sh.k + ')') + ' is the charge left at one moment.' },
            { html: 'After ' + t(sh.k) + ' hour' + (sh.k === 1 ? '' : 's') + ', ' + t(nf(sh.Ck)) + '% of the charge has been used.', why: t('C') + ' is the charge <b>remaining</b>, not the charge used.' }],
            'Input ' + t(sh.k) + ' hours of playback → output ' + t(nf(sh.Ck)) + '% charge remaining.', ['Input in the brackets, output after the equals sign.'], 'meaning of C(k)');
        } },
        { id: 'e10b', level: 'EMG', make: function (r, sh) {
          return intPart('(b) State the ' + t('C') + '-intercept and the ' + t('t') + '-intercept of the model as ordered pairs ' + t('(t,\\ C)') + '.', [[sh.T, 0]], [[0, 100]], { xLabel: t('t') + '-int', yLabel: t('C') + '-int' },
            t('C') + '-int: ' + t('C(0)=100') + ', so ' + t('(0,\\ 100)') + '.<br>' + t('t') + '-int: ' + t('100-' + nf(sh.r) + 't=0\\Rightarrow t=\\dfrac{100}{' + nf(sh.r) + '}=' + nf(sh.T)) + ', so ' + t(ptT([sh.T, 0])) + '.', ['The ' + t('C') + '-intercept has ' + t('t=0') + '; the ' + t('t') + '-intercept has ' + t('C=0') + '.'], 'intercepts of C(t)');
        } },
        { id: 'e10b2', sub: 'b ii', level: 'EMG', make: function (r, sh) {
          return mc(r, '(b) What does the ' + t('t') + '-intercept ' + t(ptT([sh.T, 0])) + ' mean in this situation?', [
            { html: 'The battery is flat after ' + t(nf(sh.T)) + ' hours of playback.', right: true },
            { html: 'The battery is full after ' + t(nf(sh.T)) + ' hours.', why: 'At the ' + t('t') + '-intercept the charge is ' + t('0') + ': the battery is empty.' },
            { html: 'The tablet starts with ' + t(nf(sh.T)) + '% charge.', why: 'The starting charge is the ' + t('C') + '-intercept, ' + t('C(0)=100') + '.' },
            { html: 'The tablet uses ' + t(nf(sh.T)) + '% per hour.', why: 'The rate is ' + t(nf(sh.r)) + '% per hour (the coefficient of ' + t('t') + ').' }],
            'At the ' + t('t') + '-intercept, ' + t('C=0') + ': after ' + t(nf(sh.T)) + ' h the battery is flat. (The ' + t('C') + '-intercept ' + t('(0,\\ 100)') + ' means it is full when playback starts.)', ['What is ' + t('C') + ' at a ' + t('t') + '-intercept?'], 'meaning of t-intercept');
        } },
        { id: 'e10c', level: 'PRG', outcome: 'RF8', make: function (r, sh) {
          return B.number('(c) Solve ' + t('C(t)=' + sh.V) + '.', sh.tV, function (u) {
            if (same(u, cl(100 - sh.r * sh.V))) return { code: 'ev-instead', hint: 'You substituted ' + t(sh.V) + ' for ' + t('t') + '. Here ' + t(sh.V) + ' is the output: solve ' + t('100-' + nf(sh.r) + 't=' + sh.V) + '.' };
            if (same(u, 100 - sh.V)) return { code: 'no-divide', hint: 'Nearly: ' + t(nf(sh.r) + 't=' + (100 - sh.V)) + ' — now divide by ' + t(nf(sh.r)) + '.' };
            return null;
          }, t('100-' + nf(sh.r) + 't=' + sh.V) + '<br>' + t('-' + nf(sh.r) + 't=' + (sh.V - 100)) + '<br>' + t('t=' + nf(sh.tV)) + ' hours', [HINT_SOLVE], 'solve C(t)=V', { before: t('t='), after: 'h' });
        } },
        { id: 'e10c2', sub: 'c ii', level: 'EMG', make: function (r, sh) {
          return mc(r, '(c) Which question does solving ' + t('C(t)=' + sh.V) + ' answer?', [
            { html: '“After how many hours of playback is the battery down to ' + t(sh.V) + '%?”', right: true },
            { html: '“How much charge is left after ' + t(sh.V) + ' hours?”', why: 'That would be ' + t('C(' + sh.V + ')') + ' — evaluating, with ' + t(sh.V) + ' as the input.' },
            { html: '“How much charge is used each hour?”', why: 'That is the rate, ' + t(nf(sh.r)) + '% per hour.' },
            { html: '“How long does the battery last in total?”', why: 'That is ' + t('C(t)=0') + ', the ' + t('t') + '-intercept.' }],
            'In ' + t('C(t)=' + sh.V) + ' the output (charge) is ' + t(sh.V) + '% and the unknown is the time: “When is the battery down to ' + t(sh.V) + '%?”', ['Which quantity is given, and which is unknown?'], 'question behind C(t)=V');
        } },
        { id: 'e10d', level: 'PRG', outcome: 'RF2', make: function (r, sh) {
          var D = bld('t', 0, sh.T), R = bld('C', 0, 100);
          return drPart('(d) State the practical domain and the practical range, in set-builder notation.', D, R, { dv: 't', rv: 'C', dW: [{ is: all('t'), code: 'dr-context', hint: 'Playback time starts at ' + t('0') + ' and stops when the battery is flat.' }, { is: bld('t', 0, null), code: 'dr-context', hint: 'The battery is flat at ' + t('t=' + nf(sh.T)) + ', so the model stops there.' }], rW: [{ is: all('C'), code: 'dr-context', hint: 'The charge runs from ' + t('0') + '% to ' + t('100') + '%.' }] },
            'Playback runs from ' + t('t=0') + ' until the battery is flat at ' + t('t=' + nf(sh.T)) + ', and the charge falls from ' + t('100') + ' to ' + t('0') + ':<br>' + t('D=' + D) + '<br>' + t('R=' + R), ['When does the model start and stop making sense?'], 'practical D and R tablet');
        } },
        { id: 'e10e', level: 'PRG', outcome: 'RF2', make: function (r, sh) {
          return mc(r, '(e) A classmate says the domain is ' + t('\\{t\\mid t\\in\\mathbb{R}\\}') + ' “because the equation works for any ' + t('t') + '.” Which pair of reasons shows that both bounds are wrong?', [
            { html: '<b>Left:</b> ' + t('t') + ' counts hours since playback began, so a negative ' + t('t') + ' describes nothing. <b>Right:</b> after ' + t('t=' + nf(sh.T)) + ' the battery is flat, and the equation gives an impossible negative charge.', right: true },
            { html: '<b>Left:</b> time can’t be ' + t('0') + '. <b>Right:</b> the battery can’t go above ' + t('100') + '%.', why: t('t=0') + ' (the start) is fine, and the charge going above ' + t('100') + '% is about the range, not the domain.' },
            { html: '<b>Left:</b> the charge can’t be negative. <b>Right:</b> the charge can’t be more than ' + t('100') + '%.', why: 'Those are limits on the output (range). The domain is about which <b>times</b> make sense.' },
            { html: 'The classmate is right: the equation does work for any ' + t('t') + '.', why: 'The equation can be evaluated anywhere, but e.g. ' + t('C(' + nf(sh.T + 2) + ')=' + nf(100 - sh.r * (sh.T + 2))) + ' — a negative charge, which is impossible.' }],
            'Left bound: ' + t('t') + ' is time since playback began, so it starts at ' + t('0') + '. Right bound: after ' + t('t=' + nf(sh.T)) + ' the battery is flat and the model gives a negative charge (e.g. ' + t('C(' + nf(sh.T + 2) + ')=' + nf(100 - sh.r * (sh.T + 2))) + '). So ' + t(cond('t', 0, sh.T)) + '.', ['Think about what happens before ' + t('t=0') + ' and after the battery is flat.'], 'why the domain is restricted');
        } },
        { id: 'e10f', level: 'EMG', make: function (r) {
          return mc(r, '(f) The number of <i>videos</i> watched is a different variable. Which describes it?', [
            { html: '<b>Discrete</b> — videos are counted ' + t('0, 1, 2, \\ldots') + ', so its domain uses ' + t('\\in I') + '.', right: true },
            { html: '<b>Continuous</b> — you can stop a video partway, so it uses ' + t('\\in\\mathbb{R}') + '.', why: 'The <b>number</b> of videos watched is a count — 2.7 videos is not a count.' },
            { html: '<b>Discrete</b> — so its domain uses ' + t('\\in\\mathbb{R}') + '.', why: 'A discrete count of videos uses ' + t('\\in I') + ' (whole numbers), not every real number.' },
            { html: '<b>Continuous</b> — because time is continuous.', why: 'Time is continuous, but the number of videos is a separate, counted variable.' }],
            '<b>Discrete:</b> videos are counted ' + t('0, 1, 2, \\ldots') + ', so its domain uses ' + t('\\in I') + '.', ['Can the number of videos be ' + t('2.7') + '?'], 'videos discrete');
        } }] },
      { num: '11', outcome: 'RF1',
        shared: function (r) {
          for (var g = 0; g < 300; g++) {
            var p = r.pick([32, 32, 20, 24, 25, 40]), be = r.pick([150, 150, 120, 125, 200]), N = r.pick([400, 400, 300, 500]);
            if (r.chance(0.3)) { p = 32; be = 150; N = 400; }
            if (N < be + 100) continue;
            var n1 = r.pick([220, 220, 180, 240, 260]), n2 = r.pick([250, 250, 210, 230, 270, 280]);
            if (p === 32 && be === 150 && N === 400 && r.chance(0.6)) { n1 = 220; n2 = 250; }
            if (n1 >= N || n2 >= N || n1 === n2 || n1 <= be || n2 <= be) continue;
            return { p: p, be: be, N: N, F: p * be, n1: n1, n2: n2, P1: p * (n1 - be), T2: p * (n2 - be), Pmax: p * (N - be) };
          }
          throw new Error('ep11');
        },
        stem: function (sh) { return 'A school prints yearbooks. The profit, ' + t('P') + ' dollars, on ' + t('n') + ' yearbooks sold is ' + t('P(n)=' + sh.p + 'n-' + F(sh.F)) + ', and the print run is ' + t(sh.N) + ' books.'; }, parts: [
        { id: 'e11a', level: 'BEG', outcome: 'RF8', make: function (r, sh) {
          return B.number('(a) State ' + t('P(0)') + '.', -sh.F, function (u) { if (same(u, sh.F)) return { code: 'sign', hint: t('P(0)=' + sh.p + '(0)-' + F(sh.F)) + ' — keep the minus sign.' }; if (same(u, sh.be)) return { code: 'solve-instead', hint: 'That solves ' + t('P(n)=0') + '. ' + t('P(0)') + ' means the input is ' + t('0') + '.' }; return null; },
            t('P(0)=' + sh.p + '(0)-' + F(sh.F) + '=-' + F(sh.F)), [HINT_EVAL.replace(t('x'), t('n'))], 'P(0)', { after: 'dollars' });
        } },
        { id: 'e11a2', sub: 'a ii', level: 'EMG', make: function (r, sh) {
          return mc(r, '(a) What does the negative value of ' + t('P(0)') + ' mean here?', [
            { html: 'With no yearbooks sold the school is ' + t('\\$' + F(sh.F)) + ' out of pocket (the printing cost): a negative profit is a <b>loss</b>.', right: true },
            { html: 'The school sold ' + t(F(sh.F)) + ' yearbooks.', why: t('P(0)') + ' is a profit in dollars, at ' + t('n=0') + ' books sold.' },
            { html: 'It is an error — profit can’t be negative.', why: 'A negative profit is a loss; it makes sense before enough books are sold.' },
            { html: 'Each yearbook costs ' + t('\\$' + F(sh.F)) + '.', why: 'That is the total cost of the print run, not the cost of one book.' }],
            t('P(0)=-' + F(sh.F)) + ': before any sales the school has spent ' + t('\\$' + F(sh.F)) + ', so it is at a loss.', ['What does a negative profit mean?'], 'meaning of negative profit');
        } },
        { id: 'e11b', level: 'PRG', outcome: 'RF8', make: function (r, sh) {
          return B.number('(b) Solve ' + t('P(n)=0') + '.', sh.be, function (u) { if (same(u, -sh.F)) return { code: 'ev-instead', hint: 'That is ' + t('P(0)') + '. Solve ' + t(sh.p + 'n-' + F(sh.F) + '=0') + ' for ' + t('n') + '.' }; if (same(u, sh.F)) return { code: 'no-divide', hint: t(sh.p + 'n=' + F(sh.F)) + ' — now divide by ' + t(sh.p) + '.' }; return null; },
            t(sh.p + 'n-' + F(sh.F) + '=0') + '<br>' + t(sh.p + 'n=' + F(sh.F)) + '<br>' + t('n=' + sh.be), [HINT_SOLVE], 'solve P(n)=0', { before: t('n=') });
        } },
        { id: 'e11b2', sub: 'b ii', level: 'LIM', make: function (r, sh) {
          return mc(r, '(b) What is the usual name for the value of ' + t('n') + ' that makes ' + t('P(n)=0') + '?', [
            { html: 'the break-even point', right: true },
            { html: 'the maximum profit', why: 'Profit is ' + t('0') + ' here, not as large as possible.' },
            { html: 'the print run', why: 'The print run is ' + t(sh.N) + ' books.' },
            { html: 'the fixed cost', why: 'The fixed cost is ' + t('\\$' + F(sh.F)) + ', a dollar amount.' }],
            t('n=' + sh.be) + ' is the <b>break-even point</b>: ' + t(sh.be) + ' sales exactly cover the cost.', ['Profit ' + t('0') + ' means no gain and no loss.'], 'break-even name');
        } },
        { id: 'e11c', level: 'PRG', outcome: 'RF8', make: function (r, sh) {
          return fieldsOf('(c) Determine ' + t('P(' + sh.n1 + ')') + ', and solve ' + t('P(n)=' + F(sh.T2)) + '.', [numF(t('P(' + sh.n1 + ')='), sh.P1), numF('solution: ' + t('n='), sh.n2, function (u) { if (same(u, sh.p * sh.T2 - sh.F)) return { code: 'ev-instead', hint: 'You evaluated ' + t('P(' + sh.T2 + ')') + '. Solve ' + t(sh.p + 'n-' + F(sh.F) + '=' + F(sh.T2)) + '.' }; return null; })],
            t('P(' + sh.n1 + ')=' + F(sh.P1)) + '; ' + t('n=' + sh.n2),
            t('P(' + sh.n1 + ')=' + sh.p + '(' + sh.n1 + ')-' + F(sh.F) + '=' + F(sh.p * sh.n1) + '-' + F(sh.F) + '=' + F(sh.P1)) + '<br>' + t(sh.p + 'n-' + F(sh.F) + '=' + F(sh.T2) + '\\Rightarrow ' + sh.p + 'n=' + F(sh.T2 + sh.F) + '\\Rightarrow n=' + sh.n2), [HINT_EVAL.replace(t('x'), t('n')), HINT_SOLVE], 'P(n) forwards and backwards');
        } },
        { id: 'e11d', level: 'PRG', outcome: 'RF2', make: function (r, sh) {
          var key = '\\{n\\mid 0\\le n\\le ' + sh.N + ',\\ n\\in I\\}', chk = countDomChk(0, sh.N, 'n', { what: 'yearbooks sold', diag: function (P0) {
            if (P0 && same(P0.lo, sh.be) && same(P0.hi, sh.N)) return { code: 'dr-context', hint: 'Books can be sold below the break-even point too (at a loss). The domain starts at ' + t('n=0') + '.' };
            if (P0 && same(P0.lo, 0) && P0.hi === Infinity) return { code: 'dr-context', hint: 'Only ' + t(sh.N) + ' books were printed, so ' + t('n') + ' stops at ' + t(sh.N) + '.' };
            return null;
          } });
          return { prompt: '(d) State the practical domain.', input: { type: 'math', keys: 'set', vars: ['n', 'I'], placeholder: 'e.g. {n | 0 <= n <= 10, n in I}' }, check: chk, key: key, answer: t(key),
            solution: t('D=' + key) + '<br>' + t('n') + ' is a number of books sold: at least ' + t('0') + ', at most the ' + t(sh.N) + ' printed, and always a whole number — no one buys half a yearbook. So ' + t('\\in I') + ', not ' + t('\\in\\mathbb{R}') + '.',
            hints: ['What is the smallest and largest number of books that can be sold?', 'Can ' + t('n') + ' be a decimal?'], text: 'count domain with I',
            good: ['\\{n\\mid 0\\le n\\le ' + sh.N + ',\\ n\\in W\\}', '0\\le n\\le ' + sh.N + ',\\ n\\in I', '\\{0, 1, 2, \\ldots, ' + sh.N + '\\}'], bad: ['\\{n\\mid 0\\le n\\le ' + sh.N + ',\\ n\\in\\mathbb{R}\\}', '\\{n\\mid 0\\le n\\le ' + sh.N + '\\}', '\\{n\\mid ' + sh.be + '\\le n\\le ' + sh.N + ',\\ n\\in I\\}', '\\{n\\mid 0<n\\le ' + sh.N + ',\\ n\\in I\\}'] };
        } },
        { id: 'e11e', level: 'PRG', outcome: 'RF2', make: function (r, sh) {
          return mc(r, '(e) A student writes ' + t('R=\\{P\\mid -' + F(sh.F) + '\\le P\\le ' + F(sh.Pmax) + ',\\ P\\in\\mathbb{R}\\}') + '. Both bounds are correct. What is wrong?', [
            { html: t('n') + ' is a whole number, so ' + t('P') + ' rises in steps of ' + t(sh.p) + ': ' + t('-' + F(sh.F) + ',\\ -' + F(sh.F - sh.p) + ',\\ \\ldots,\\ ' + F(sh.Pmax)) + '. The range is that list, not every real number in between.', right: true },
            { html: 'It should say ' + t('P\\in I') + ' instead of ' + t('P\\in\\mathbb{R}') + '.', why: 'Most integers between the bounds are never produced either (e.g. ' + t('-' + F(sh.F - 1)) + '). Only the values ' + t(sh.p) + ' apart occur.' },
            { html: 'A profit can’t be negative, so the lower bound should be ' + t('0') + '.', why: 'Negative profit (a loss) is real: ' + t('P(0)=-' + F(sh.F)) + '.' },
            { html: 'Nothing is wrong.', why: 'Try ' + t('P=100') + ' or so: is there a whole number ' + t('n') + ' that gives it?' }],
            'The bounds are right (' + t('P(0)=-' + F(sh.F)) + ', ' + t('P(' + sh.N + ')=' + F(sh.Pmax)) + '), but ' + t('P\\in\\mathbb{R}') + ' claims every real value between them. Because ' + t('n') + ' is whole, ' + t('P') + ' changes in steps of ' + t(sh.p) + ', so the range is a list of ' + t(sh.N + 1) + ' values, not an interval.', ['Which values can ' + t('P') + ' actually take?'], 'discrete range error');
        } },
        { id: 'e11e2', sub: 'e ii', level: 'ADV', outcome: 'RF2', make: function (r, sh) {
          var lo = -sh.F, hi = sh.Pmax, cand = [100, 50, 10, 1, 7].filter(function (v) { return !Number.isInteger((v + sh.F) / sh.p); }), key = cand[0];
          var chk = function (resp) {
            var u = valOf(resp); if (u == null) return form('notnumber', 'Enter a single number.');
            if (u <= lo || u >= hi) return wrong('not-between', 'Choose a value strictly between ' + t('-' + F(sh.F)) + ' and ' + t(F(sh.Pmax)) + '.');
            var n = (u + sh.F) / sh.p;
            if (Math.abs(n - Math.round(n)) < 1e-9) return wrong('is-produced', t('P(' + Math.round(n) + ')=' + nf(u)) + ', so that value <b>is</b> produced. Choose one that needs a fractional number of books.');
            return ok();
          };
          return { prompt: '(e) Give one value strictly between ' + t('-' + F(sh.F)) + ' and ' + t(F(sh.Pmax)) + ' that the model never produces.', input: { type: 'math', keys: 'fraction', before: t('P=') }, check: chk, key: String(key), answer: 'e.g. ' + t(key),
            solution: t('P=' + key) + ' needs ' + t(sh.p + 'n=' + F(key + sh.F)) + ', ' + t('n=' + nf((key + sh.F) / sh.p)) + ' — not a whole number of books, so ' + t(key) + ' is never produced. (Any value not of the form ' + t('-' + F(sh.F) + '+' + sh.p + 'k') + ' works.)',
            hints: ['Pick a value and solve ' + t('P(n)=\\text{value}') + '. If ' + t('n') + ' isn’t a whole number, the value is never produced.'], text: 'value not produced',
            good: [String(key === 100 ? 1 : 100)].filter(function (v) { return chk(v).v === 'correct'; }), bad: [String(sh.P1), String(-sh.F - 1)] };
        } },
        { id: 'e11f', level: 'EMG', make: function (r) {
          return mc(r, '(f) Compare this question with Question 10 (the tablet). Which has a graph made of separate dots, and which is an unbroken line?', [
            { html: 'Question 11 is separate dots (' + t('n') + ' counts books — discrete); Question 10 is an unbroken line (' + t('t') + ' is measured time — continuous).', right: true },
            { html: 'Both are unbroken lines, because both rules are linear.', why: 'A linear rule doesn’t decide it — the variable does. You can’t sell 150.5 yearbooks.' },
            { html: 'Question 10 is dots and Question 11 is a line.', why: 'That is reversed: time is continuous, a count of books is discrete.' },
            { html: 'Both are separate dots, because both have restricted domains.', why: 'A restricted domain can still be an interval of real numbers (all times from ' + t('0') + ' to the end).' }],
            'Look at the variables: books sold (' + t('n') + ') are counted, so Question 11 is dots; playback time (' + t('t') + ') is measured, so Question 10 is an unbroken line.', ['Is the input counted or measured?'], 'dots vs line');
        } }] },
      { num: '12', shared: ep12Shared, outcome: 'RF1',
        stem: function (sh) { return 'A diver’s position relative to the surface of a lake, ' + t('y') + ' metres, is graphed against time ' + t('t') + ' minutes. Below the surface counts as negative.' + (sh.onPad ? '' : ep12Fig(sh)); }, parts: [
        { id: 'e12a', level: 'EMG', outcome: 'RF8', make: function (r, sh) {
          var ta = sh.a / 2, tb = sh.a + r.int(1, sh.h1 - 1), s3 = sh.a + sh.h1 + sh.b, tc = s3 + r.int(1, sh.h2 - 1);
          if (sh.D === 12 && sh.a === 4 && sh.h1 === 6 && sh.b === 4 && sh.h2 === 4 && r.chance(0.6)) { tb = 6; tc = 16; }
          var items = [ta, tb, tc].map(function (x) { var v = pwAt(sh.V, x); return numF(t('d(' + nf(x) + ')='), v, function (u) { if (same(u, -v)) return { code: 'sign', hint: 'Below the surface is negative.' }; return null; }); });
          return fieldsOf('(a) Writing the relation as ' + t('y=d(t)') + ', state ' + t('d(' + nf(ta) + ')') + ', ' + t('d(' + tb + ')') + ' and ' + t('d(' + tc + ')') + '.', items, [ta, tb, tc].map(function (x) { return t('d(' + nf(x) + ')=' + nf(pwAt(sh.V, x))); }).join(', '),
            'Read up or down from each time to the graph:<br>' + t('d(' + nf(ta) + ')=' + nf(-sh.M)) + ' (halfway down the first segment)<br>' + t('d(' + tb + ')=' + (-sh.D)) + ' (on the flat bottom)<br>' + t('d(' + tc + ')=' + (-sh.M)) + ' (on the flat piece at ' + t(-sh.M) + ')', ['Find the time on the horizontal axis, then read the height of the graph there.'], 'read d(t)');
        } },
        { id: 'e12bs', sub: 'b, shade', level: 'BEG', outcome: 'RF2', make: function (r, sh) { return e12bDR(sh, true); } },
        { id: 'e12b', level: 'EMG', outcome: 'RF2', make: function (r, sh) { return e12bDR(sh, false); } },
        { id: 'e12c', level: 'EMG', outcome: 'RF2', make: function (r) {
          return mc(r, '(c) Is ' + t('d') + ' a function?', [
            { html: '<b>Yes</b> — every vertical line ' + t('t=k') + ' meets the graph exactly once: at each time the diver has one position.', right: true },
            { html: '<b>No</b> — the flat pieces fail the vertical line test.', why: 'A flat piece meets each vertical line once. Only a <b>vertical</b> piece would fail.' },
            { html: '<b>No</b> — the diver is at the same depth at two different times.', why: 'Two inputs with the same output is allowed.' },
            { html: '<b>Yes</b> — because the graph starts and ends at ' + t('y=0') + '.', why: 'The right answer, the wrong reason: use the vertical line test.' }],
            '<b>Yes.</b> Vertical line test: each vertical line meets the graph once — one position at each time. (Flat pieces are fine.)', ['Would any vertical line meet the graph twice?'], 'diver is a function');
        } },
        { id: 'e12d', level: 'ADV', make: function (r, sh) {
          var y = -(sh.D + sh.M) / 2, so = pwSols(sh.V, y).pts;
          return B.valueSet('(d) Solve ' + t('d(t)=' + nf(y)) + '.', so, { v: 't', diag: function (A) { if (A.length === 1 && so.some(function (x) { return same(x, A[0]); })) return { code: 'sol-missing', hint: 'The diver passes depth ' + t(nf(-y)) + ' m twice — going down and coming up. Find both times.' }; return null; } },
            'Descent from ' + t('(0,\\ 0)') + ' to ' + t(ptT([sh.a, -sh.D])) + ': slope ' + t(nf(-sh.D / sh.a)) + ', so ' + t(nf(-sh.D / sh.a) + 't=' + nf(y)) + ', ' + t('t=' + nf(so[0])) + '.<br>Ascent from ' + t(ptT([sh.a + sh.h1, -sh.D])) + ' to ' + t(ptT([sh.a + sh.h1 + sh.b, -sh.M])) + ': slope ' + t(nf(sh.r1)) + ', so ' + t(-sh.D + '+' + nf(sh.r1) + '(t-' + (sh.a + sh.h1) + ')=' + nf(y)) + ', ' + t('t=' + nf(so[1])) + '.<br>No other piece reaches ' + t(nf(y)) + ': ' + t('t=' + nf(so[0])) + ' or ' + t('t=' + nf(so[1])) + '.',
            ['Draw a horizontal line at ' + t('y=' + nf(y)) + ' and find every crossing.', 'Use the slope of each piece it crosses.'], 'solve d(t)=y two pieces');
        } },
        { id: 'e12e', level: 'ADV', make: function (r, sh) {
          var s3 = sh.a + sh.h1 + sh.b, I = [s3, s3 + sh.h2], tp = sh.a / 2, key = 't=' + nf(tp) + '\\ \\text{or}\\ ' + cond('t', I[0], I[1]);
          var chk = unionChk([tp], [I], 't');
          return { prompt: '(e) Solve ' + t('d(t)=' + (-sh.M)) + '. (This answer is not a short list.)', input: { type: 'math', keys: 'set', vars: ['t'], placeholder: 'e.g. t = 2, 5 <= t <= 8' }, check: chk, key: key, answer: t(key),
            solution: 'Going down, ' + t('d(' + nf(tp) + ')=' + (-sh.M)) + ', so ' + t('t=' + nf(tp)) + '.<br>The piece from ' + t(ptT([I[0], -sh.M])) + ' to ' + t(ptT([I[1], -sh.M])) + ' is horizontal at ' + t('y=' + (-sh.M)) + ', so every time on it works: ' + t(cond('t', I[0], I[1])) + '.<br>So ' + t(key) + '. The flat segment (the diver pausing at ' + t(sh.M) + ' m deep) gives infinitely many solutions.',
            hints: ['Where is the graph at height ' + t(-sh.M) + '? Look for a single crossing and a whole flat stretch.', 'Write a single value and an interval, e.g. ' + t('t=2,\\ 5\\le t\\le 8') + '.'], text: 'solve d(t)=y with a flat piece',
            good: ['t=' + nf(tp) + ', ' + cond('t', I[0], I[1]), '\\{' + nf(tp) + '\\}\\cup[' + I[0] + ', ' + I[1] + ']', nf(tp) + '\\ \\text{or}\\ ' + cond('t', I[0], I[1])], bad: ['t=' + nf(tp) + ', t=' + I[0] + ', t=' + I[1], cond('t', I[0], I[1]), 't=' + nf(tp)] };
        } },
        { id: 'e12f', level: 'BEG', make: function (r, sh) {
          sh.onPad = true; // the graph is drawn on the pad, not repeated in the stem
          var onG = function (p) { var v = pwAt(sh.V, p[0]); return isFinite(v) && same(v, p[1]); };
          return tapPart('(f) Tap every ' + t('t') + '-intercept and the ' + t('y') + '-intercept on the graph.', { x: [0, 24], y: [-sh.D - 2, 2], labels: 2, unitX: 12, unitY: 12, xName: 't', yName: 'y', xTitle: 'Time (min)', yTitle: 'Position (m)', bg: { segs: [{ pts: sh.V, start: 'closed', end: 'closed' }] } }, [[0, 0], [sh.tot, 0]], [[0, 0]], { onGraph: onG, xName: 't' },
            t('t') + '-ints: ' + t('(0,\\ 0)') + ' and ' + t(ptT([sh.tot, 0])) + ' — the diver is at the surface at the start and again when she comes back up at ' + t(sh.tot) + ' min.<br>' + t('y') + '-int: ' + t('(0,\\ 0)') + ' — at time ' + t('0') + ' she is at the surface.', ['Where does the graph meet each axis?'], 'intercepts of diver');
        } },
        { id: 'e12g', level: 'PRG', make: function (r, sh) {
          var s1 = sh.a + sh.h1, s2 = s1 + sh.b, s3 = s2 + sh.h2, A = t(cond('t', s1, s2)), Bt = t(cond('t', s3, sh.tot)), tie = same(sh.r1, sh.r2), first = sh.r1 > sh.r2;
          var opts = [{ html: A + ' and ' + Bt + ' (equally fast)', right: tie, why: tie ? null : 'Compare the two rates: ' + t(nf(sh.r1)) + ' and ' + t(nf(sh.r2)) + ' m/min are not equal.' },
            { html: A + ' only', right: !tie && first, why: tie || !first ? 'Work out both rising rates: ' + t('\\dfrac{' + sh.M + '}{' + sh.b + '}') + ' and ' + t('\\dfrac{' + sh.M + '}{' + sh.c + '}') + ' m/min.' : null },
            { html: Bt + ' only', right: !tie && !first, why: tie || first ? 'Work out both rising rates: ' + t('\\dfrac{' + sh.M + '}{' + sh.b + '}') + ' and ' + t('\\dfrac{' + sh.M + '}{' + sh.c + '}') + ' m/min.' : null },
            { html: t(cond('t', 0, sh.a)), why: 'That piece is the steepest, but it is <b>decreasing</b> (going down). The question asks where ' + t('d') + ' increases fastest.' }];
          return mc(r, '(g) Over which interval(s) is ' + t('d') + ' increasing fastest?', opts,
            'Rising pieces: ' + A + ': ' + t('\\dfrac{' + (-sh.M) + '-(' + (-sh.D) + ')}{' + s2 + '-' + s1 + '}=' + nf(sh.r1)) + ' m/min; ' + Bt + ': ' + t('\\dfrac{0-(' + (-sh.M) + ')}{' + sh.tot + '-' + s3 + '}=' + nf(sh.r2)) + ' m/min. ' + (tie ? '<b>A tie.</b>' : 'The faster is ' + (first ? A : Bt) + '.'), ['Only rising pieces count. Compare their rates of change.'], 'fastest increase', true);
        } },
        { id: 'e12g2', sub: 'g ii', level: 'PRG', make: function (r, sh) {
          var best = Math.max(sh.r1, sh.r2);
          return B.number('(g) What is that fastest rate of change? (A positive rate means the diver is rising toward the surface.)', best, function (u) {
            if (same(u, -best)) return { code: 'sign', hint: 'The diver is rising, so the position increases: the rate is positive.' };
            if (same(u, sh.D / sh.a)) return { code: 'diag', hint: 'That is the rate of the descent (going down). Use a rising piece.' };
            if (same(u, 1 / best)) return { code: 'rate-flip', hint: 'Rate = change in position ÷ change in time.' };
            return null;
          }, 'The faster rising piece rises ' + t(sh.M) + ' m in ' + t(sh.r1 >= sh.r2 ? sh.b : sh.c) + ' min: ' + t('\\dfrac{' + sh.M + '}{' + (sh.r1 >= sh.r2 ? sh.b : sh.c) + '}=' + nf(best)) + ' m/min — the diver rises ' + t(nf(best)) + ' m each minute.', ['Rate of change = change in ' + t('y') + ' ÷ change in ' + t('t') + '.'], 'fastest rate', { after: 'm/min' });
        } },
        { id: 'e12h', level: 'EMG', make: function (r, sh) {
          var T = bld('t', sh.a, sh.a + sh.h1);
          return setPart('(h) The deepest point is reached over a whole interval, not at a single instant. State that interval of time.', T, { v: 't', placeholder: 'e.g. 2 <= t <= 5', wrong: [{ is: bld('y', -sh.D, 0), code: 'set-letter', hint: 'This asks for <b>times</b> (' + t('t') + '-values) when the diver is deepest.' }] },
            'The deepest point, ' + t('y=' + (-sh.D)) + ', is held for ' + t(cond('t', sh.a, sh.a + sh.h1)) + '. However long it lasts, ' + t(-sh.D) + ' is one number, so it appears once in the range, as the single lower bound.', ['Where is the graph lowest? Is it a point or a flat stretch?'], 'interval of deepest point');
        } }] },
      /* ================= EP Part E ================= */
      { num: '13', section: 'Extra practice E — Reasoning and error analysis', stem: 'Decide whether each statement is <b>true</b> or <b>false</b>. (For a false one, think of a specific counterexample.)', parts: [
        { id: 'e13a', level: 'LIM', outcome: 'RF2', make: function (r) {
          var v = r.pick([0, 0, 1]);
          return v === 0 ? tf(r, '(a) Every relation is a function.', false, 'A relation like ' + t('\\{(1,\\ 2),\\ (1,\\ 5)\\}') + ' pairs the input ' + t('1') + ' with two outputs, so it is not a function.', '<b>False.</b> Counterexample: ' + t('\\{(1,\\ 2),\\ (1,\\ 5)\\}') + ' is a relation, but the input ' + t('1') + ' has two outputs.', ['A function is a special kind of relation.'], 'every relation a function?')
            : tf(r, '(a) Every function is a relation.', true, 'A function <b>is</b> a set of ordered pairs (a relation) — one with the extra rule of one output per input.', '<b>True.</b> A function is a relation in which each input has exactly one output.', ['A function is a special kind of relation.'], 'every function a relation?');
        } },
        { id: 'e13b', level: 'EMG', outcome: 'RF2', make: function (r) {
          var k = r.pick([3, 3, -2, 4, 1, -5]), v = r.chance(0.6);
          return v ? tf(r, '(b) A vertical line, such as ' + t('x=' + k) + ', is a function.', false, 'Every point of ' + t('x=' + k) + ' has the input ' + t(k) + ': one input with infinitely many outputs. The vertical line test fails everywhere.', '<b>False.</b> Counterexample: ' + t('x=' + k) + ' has ' + t('D=\\{' + k + '\\}') + ' and ' + t('R=\\{y\\mid y\\in\\mathbb{R}\\}') + ' — the input ' + t(k) + ' has infinitely many outputs.', ['Apply the vertical line test to a vertical line.'], 'vertical line a function?')
            : tf(r, '(b) A horizontal line, such as ' + t('y=' + k) + ', is a function.', true, 'Each input has exactly one output, ' + t(k) + ' — repeated outputs are allowed.', '<b>True.</b> Every vertical line meets ' + t('y=' + k) + ' exactly once.', ['Apply the vertical line test.'], 'horizontal line a function?');
        } },
        { id: 'e13c', level: 'PRG', outcome: 'RF2', make: function (r) {
          var v = r.chance(0.6);
          return v ? tf(r, '(c) The domain of a real-world model is always ' + t('x\\ge 0') + '.', false, 'If the input is “years since 2010” and the data start in 2005, the input ' + t('-5') + ' is in the domain.', '<b>False.</b> Counterexample: temperature modelled against ' + t('t=') + ' years since 2010, for 2005 to 2020: ' + t('D=\\{t\\mid -5\\le t\\le 10,\\ t\\in\\mathbb{R}\\}') + ' includes negative inputs.', ['Can an input like “years since 2010” be negative?'], 'real-world domain always ≥ 0?')
            : tf(r, '(c) The domain of a real-world model can include negative input values.', true, 'E.g. “years since 2010” is negative for 2005; a temperature model can use those inputs.', '<b>True.</b> Example: years since 2010, from 2005 to 2020, gives ' + t('-5\\le t\\le 10') + '.', ['Think of an input measured from a reference point.'], 'real-world domain negative?');
        } },
        { id: 'e13d', level: 'EMG', outcome: 'RF2', make: function (r) {
          var v = r.chance(0.6);
          return v ? tf(r, '(d) A function has at most one ' + t('y') + '-intercept.', true, 'A ' + t('y') + '-intercept is a point with input ' + t('0') + ', and a function gives the input ' + t('0') + ' at most one output.', '<b>True.</b> A ' + t('y') + '-intercept has ' + t('x=0') + ' and height ' + t('f(0)') + '; a function has at most one value of ' + t('f(0)') + ' (none if ' + t('0') + ' isn’t in the domain).', ['What is the input of every ' + t('y') + '-intercept?'], 'function at most one y-int?')
            : tf(r, '(d) A function can have two ' + t('y') + '-intercepts.', false, 'Two ' + t('y') + '-intercepts would mean the input ' + t('0') + ' has two outputs — not allowed for a function.', '<b>False.</b> Both ' + t('y') + '-intercepts would have input ' + t('0') + ', giving one input two outputs.', ['What is the input of every ' + t('y') + '-intercept?'], 'function two y-ints?');
        } },
        { id: 'e13e', level: 'EMG', outcome: 'RF2', make: function (r) {
          var k = r.pick([3, 3, 2, 4, 5]), v = r.chance(0.6);
          return v ? tf(r, '(e) A function has at most one ' + t('x') + '-intercept.', false, t('g(x)=x^{2}-' + k + 'x') + ' is a function with two ' + t('x') + '-intercepts, ' + t('(0,\\ 0)') + ' and ' + t('(' + k + ',\\ 0)') + '.', '<b>False.</b> Counterexample: ' + t('g(x)=x^{2}-' + k + 'x') + ' has ' + t('x') + '-intercepts ' + t('(0,\\ 0)') + ' and ' + t('(' + k + ',\\ 0)') + '. Two inputs may share the output ' + t('0') + '.', ['Two different inputs can both give output ' + t('0') + '.'], 'function at most one x-int?')
            : tf(r, '(e) A function can have more than one ' + t('x') + '-intercept.', true, 'Two inputs may share the output ' + t('0') + ': e.g. ' + t('g(x)=x^{2}-' + k + 'x') + ' crosses at ' + t('0') + ' and ' + t(k) + '.', '<b>True.</b> E.g. ' + t('g(x)=x^{2}-' + k + 'x') + ' has ' + t('x') + '-intercepts ' + t('(0,\\ 0)') + ' and ' + t('(' + k + ',\\ 0)') + '.', ['Two different inputs can both give output ' + t('0') + '.'], 'function several x-ints?');
        } },
        { id: 'e13f', level: 'PRG', outcome: 'RF1', make: function (r) {
          var v = r.chance(0.6);
          return v ? tf(r, '(f) If a relation is discrete, its domain must be written with ' + t('\\in I') + '.', false, 'Discrete means separate values, not whole ones: ' + t('\\{(-1.5,\\ 2),\\ (0.5,\\ 4)\\}') + ' is discrete with domain ' + t('\\{-1.5,\\ 0.5\\}') + '.', '<b>False.</b> Counterexample: ' + t('\\{(-1.5,\\ 2),\\ (0.5,\\ 4),\\ (2.5,\\ 6)\\}') + ' is discrete; its domain is the list ' + t('\\{-1.5,\\ 0.5,\\ 2.5\\}') + ' — not integers, and a list needs no ' + t('\\in I') + ' at all.', ['Does “discrete” mean “whole numbers”?'], 'discrete means in I?')
            : tf(r, '(f) A discrete relation can have a domain made of non-integer values.', true, 'Discrete means separate values: ' + t('\\{(-1.5,\\ 2),\\ (0.5,\\ 4)\\}') + ' is discrete with domain ' + t('\\{-1.5,\\ 0.5\\}') + '.', '<b>True.</b> E.g. ' + t('\\{(-1.5,\\ 2),\\ (0.5,\\ 4)\\}') + ' is discrete, with domain ' + t('\\{-1.5,\\ 0.5\\}') + '.', ['Does “discrete” mean “whole numbers”?'], 'discrete non-integers?');
        } }] },
      { num: '14', shared: ep14Shared, outcome: 'RF2',
        stem: function (sh) { return 'A student is given the graph below and writes the four answers shown. Every one of them is wrong.' + fig(G({ x: [-5, 6], y: [-5, 7], labels: 2, max: 260, segs: [{ pts: [[sh.x1, sh.y1], [sh.x2, sh.y2]], start: 'open', end: 'closed' }], aria: 'segment with a hollow end' })); }, parts: [
        { id: 'e14a', level: 'ADV', make: function (r, sh) {
          var Dt = bld('x', sh.x1, sh.x2, false, true), stu = bld('y', sh.x1, sh.x2);
          return setPart('(a) The student wrote “' + t('D=' + stu) + '”. Write the corrected domain.', Dt, { v: 'x', wrong: [{ is: bld('x', sh.x1, sh.x2), code: 'set-endpoint', hint: 'The letter is fixed now — but the left endpoint ' + t(ptT([sh.x1, sh.y1])) + ' is <b>hollow</b>, so ' + t('x=' + sh.x1) + ' is not included: use ' + t('<') + '.' }, { is: bld('x', sh.y2, sh.y1, true, false), code: 'set-swap', hint: 'Those are ' + t('y') + '-values. The domain is read along the horizontal axis.' }] },
            'Two errors: the domain is read along the horizontal axis, so it uses ' + t('x') + ', not ' + t('y') + '; and the left endpoint ' + t('x=' + sh.x1) + ' is hollow, so it needs ' + t('<') + '.<br>Correct: ' + t('D=' + Dt), [HINT_DOTS, 'Which letter goes with the horizontal axis?'], 'correct a domain');
        } },
        { id: 'e14b', level: 'ADV', make: function (r, sh) {
          var Rt = bld('y', sh.y2, sh.y1, true, false), stu = bld('y', sh.y2, sh.y1);
          return setPart('(b) The student wrote “' + t('R=' + stu) + '”. Write the corrected range.', Rt, { v: 'y', wrong: [{ is: stu, code: 'student-ans', hint: 'That is the student’s answer. ' + t('y=' + sh.y1) + ' occurs only at the hollow endpoint ' + t(ptT([sh.x1, sh.y1])) + ', so ' + t(sh.y1) + ' is not in the range.' }, { is: bld('y', sh.y2, sh.y1, false, true), code: 'set-endpoint', hint: 'Which end is hollow? The height ' + t(sh.y1) + ' comes from the hollow point, ' + t(sh.y2) + ' from the solid one.' }] },
            'Error: ' + t('y=' + sh.y1) + ' occurs only at the hollow endpoint ' + t(ptT([sh.x1, sh.y1])) + ', so ' + t(sh.y1) + ' is <b>not</b> in the range.<br>Correct: ' + t('R=' + Rt), [HINT_DOTS], 'correct a range');
        } },
        { id: 'e14c', level: 'PRG', outcome: 'RF1', make: function (r, sh) {
          return intPart('(c) The student wrote “' + t('f(0)=' + sh.c) + ', so the ' + t('x') + '-intercept is ' + t(ptT([0, sh.c])) + '.” Write the correct intercepts.', [[sh.c, 0]], [[0, sh.c]], {},
            'Error: ' + t(ptT([0, sh.c])) + ' has ' + t('x=0') + ', so it is the <b>' + t('y') + '-intercept</b>. The line is ' + t('y=' + sh.c + '-x') + ' (slope ' + t('-1') + ' through ' + t(ptT([0, sh.c])) + '), and ' + t('f(x)=0') + ' gives ' + t('x=' + sh.c) + '.<br>Correct: ' + t('y') + '-int ' + t(ptT([0, sh.c])) + '; ' + t('x') + '-int ' + t(ptT([sh.c, 0])) + '.', ['A point on the ' + t('x') + '-axis has ' + t('y=0') + '.'], 'correct intercepts');
        } },
        { id: 'e14d', level: 'EMG', make: function (r, sh) {
          return mc(r, '(d) The student wrote “This is not a function, because the left endpoint is hollow.” Which correction is right?', [
            { html: 'It <b>is</b> a function: a hollow endpoint only removes one point, and every vertical line still meets the segment at most once.', right: true },
            { html: 'The student is right: a hollow endpoint means some input has no output, so it isn’t a function.', why: 'An input with no output is simply not in the domain. A function only fails when one input has two outputs.' },
            { html: 'It is not a function, but because the line slopes downward.', why: 'A slanted line passes the vertical line test, whichever way it slopes.' },
            { html: 'It is a function only if both endpoints are solid.', why: 'Endpoints change the domain and range, not whether the relation is a function.' }],
            'A hollow endpoint just leaves out one point; it never gives an input two outputs. Every vertical line meets this segment at most once, so it <b>is a function</b>.', ['Use the vertical line test — not the endpoints.'], 'hollow endpoint still a function');
        } }] },
      { num: '15', outcome: 'RF8',
        shared: function (r) {
          for (var g = 0; g < 200; g++) { var m = r.pick([3, 3, 2, 4, 5]), b = r.pick([-1, -1, -2, 1, 3]), a1 = r.pick([2, 2, 1, 3]), a2 = r.pick([3, 3, 2, 4]), V = r.pick([7, 7, 4, 5, 9, 10]); if (r.chance(0.3)) { m = 3; b = -1; a1 = 2; a2 = 3; V = 7; } if (a1 !== a2 && (V - b) % m !== 0) return { m: m, b: b, a1: a1, a2: a2, V: V, f: lin([[m, 'x'], [b, '']]) }; }
          return { m: 3, b: -1, a1: 2, a2: 3, V: 7, f: '3x-1' };
        },
        stem: function (sh) { return 'Three claims about function notation are all false. Back each one up using ' + t('f(x)=' + sh.f) + '.'; }, parts: [
        { id: 'e15a', level: 'EMG', make: function (r, sh) {
          var v = sh.m * sh.a1 + sh.b;
          return mc(r, '(a) “' + t('f(x)') + ' means ' + t('f') + ' multiplied by ' + t('x') + '.” Why is this false?', [
            { html: t('f') + ' is the name of a rule, not a number: ' + t('f(' + sh.a1 + ')') + ' means the output when the input is ' + t(sh.a1) + ', here ' + t(sh.m + '(' + sh.a1 + ')' + (sh.b < 0 ? sh.b : '+' + sh.b) + '=' + v) + '.', right: true },
            { html: 'It isn’t false: ' + t('f(' + sh.a1 + ')=' + sh.a1 + 'f') + '.', why: t('f') + ' has no value of its own to multiply. The brackets hold the input.' },
            { html: t('f(x)') + ' means ' + t('f+x') + '.', why: 'The brackets are not addition either — they hold the input to the rule.' },
            { html: t('f(x)') + ' means the input when the output is ' + t('x') + '.', why: 'That is reversed: ' + t('f(x)') + ' is the <b>output</b> for the input ' + t('x') + '.' }],
            t('f(x)') + ' names the output when the input is ' + t('x') + '; the brackets are not multiplication. With ' + t('f(x)=' + sh.f) + ': ' + t('f(' + sh.a1 + ')=' + v) + '. “' + t('f\\times ' + sh.a1) + '” would need ' + t('f') + ' to be a number, but ' + t('f') + ' is the rule.', ['What does the bracket in ' + t('f(2)') + ' contain?'], 'f(x) not multiplication');
        } },
        { id: 'e15b', level: 'EMG', make: function (r, sh) {
          var f1 = sh.m * sh.a1 + sh.b, f2 = sh.m * sh.a2 + sh.b, s = sh.a1 + sh.a2, f3 = sh.m * s + sh.b;
          return fieldsOf('(b) “' + t('f(' + sh.a1 + ')+f(' + sh.a2 + ')=f(' + s + ')') + '.” Work out both sides.', [numF(t('f(' + sh.a1 + ')+f(' + sh.a2 + ')='), f1 + f2), numF(t('f(' + s + ')='), f3)], t(f1 + f2) + ' and ' + t(f3) + ' — not equal',
            t('f(' + sh.a1 + ')=' + f1) + ', ' + t('f(' + sh.a2 + ')=' + f2) + ', so ' + t('f(' + sh.a1 + ')+f(' + sh.a2 + ')=' + (f1 + f2)) + '.<br>' + t('f(' + s + ')=' + sh.m + '(' + s + ')' + (sh.b < 0 ? sh.b : '+' + sh.b) + '=' + f3) + '.<br>' + t((f1 + f2) + '\\ne ' + f3) + ', so the claim is false: adding the inputs does not add the outputs (the ' + t(sh.b) + ' is counted twice on the left).', [HINT_EVAL], 'f(a)+f(b) vs f(a+b)');
        } },
        { id: 'e15c', level: 'PRG', make: function (r, sh) {
          return B.fraction('(c) “To solve ' + t('f(x)=' + sh.V) + ' you substitute ' + t(sh.V) + ' for ' + t('x') + '.” That is false — solve ' + t('f(x)=' + sh.V) + ' correctly.', [sh.V - sh.b, sh.m], { before: t('x='), diag: function (u) {
            if (same(u, sh.m * sh.V + sh.b)) return { code: 'ev-instead', hint: 'That is ' + t('f(' + sh.V + ')') + ' — exactly the student’s mistake. In ' + t('f(x)=' + sh.V) + ' the <b>output</b> is ' + t(sh.V) + ': solve ' + t(sh.f + '=' + sh.V) + '.' };
            if (same(u, (sh.V + sh.b) / sh.m)) return { code: 'sign', hint: 'Check the step that moves ' + t(sh.b) + ' across the equals sign.' };
            return null;
          } }, 'Substituting ' + t(sh.V) + ' for ' + t('x') + ' gives ' + t('f(' + sh.V + ')=' + (sh.m * sh.V + sh.b)) + ' — the output when the input is ' + t(sh.V) + ', a different question.<br>In ' + t('f(x)=' + sh.V) + ' the output is ' + t(sh.V) + ':<br>' + t(sh.f + '=' + sh.V) + '<br>' + t(sh.m + 'x=' + (sh.V - sh.b)) + '<br>' + t('x=' + frT(sh.V - sh.b, sh.m)), [HINT_SOLVE], 'solve f(x)=V fraction');
        } }] },
      /* ================= EP Part F ================= */
      { num: '16', section: 'Extra practice F — Challenge',
        shared: function (r) {
          for (var g = 0; g < 400; g++) {
            var pq = r.pick([[6, 4], [6, 4], [3, 2], [4, 2], [6, 2], [9, 3], [8, 4], [6, 3]]), p = pq[0], q = pq[1], U = r.int(1, 4), mode = r.pick(['both', 'both', 'x', 'y']), L = -q;
            if (r.chance(0.3)) { p = 6; q = 4; U = 2; mode = 'both'; }
            var X = function (y) { return p * (y + q) / q; };
            if (mode === 'x') L = r.int(-q + 1, -1);
            if (mode === 'y') { U = r.int(-q + 1, -1); }
            if (!Number.isInteger(X(U)) || !Number.isInteger(X(L)) || X(U) > 15 || L >= U) continue;
            return { p: p, q: q, L: L, U: U, xL: X(L), xU: X(U), mode: mode, m: ex.norm(q, p) };
          }
          return { p: 6, q: 4, L: -4, U: 2, xL: 0, xU: 9, mode: 'both', m: [2, 3] };
        },
        stem: function (sh) { return 'A line has ' + t('x') + '-intercept ' + t(ptT([sh.p, 0])) + ' and ' + t('y') + '-intercept ' + t(ptT([0, -sh.q])) + '.'; }, parts: [
        { id: 'e16a', level: 'PRG', make: function (r, sh) {
          var T = P(lin([[sh.m, 'x'], [-sh.q, '']]));
          var W = [{ is: P(lin([[[sh.p, sh.q], 'x'], [-sh.q, '']])), code: 'rate-flip', hint: 'Slope = rise ÷ run = ' + t('\\dfrac{0-(-' + sh.q + ')}{' + sh.p + '-0}') + '.' }, { is: P(lin([[[-sh.q, sh.p], 'x'], [-sh.q, '']])), code: 'sign', hint: 'From ' + t(ptT([0, -sh.q])) + ' up to ' + t(ptT([sh.p, 0])) + ' the line rises, so the slope is positive.' }, { is: P(lin([[sh.m, 'x'], [sh.q, '']])), code: 'sign', hint: 'The ' + t('y') + '-intercept is ' + t(-sh.q) + ', so the constant is ' + t(-sh.q) + '.' }];
          var p = K.P.poly('(a) Write its equation in function notation as ' + t('k(x)') + '.', T, { before: t('k(x)='), wrong: (W = fw(W, T)) },
            t('m=\\dfrac{0-(-' + sh.q + ')}{' + sh.p + '-0}=\\dfrac{' + sh.q + '}{' + sh.p + '}=' + ex.texRat(sh.m)) + ', ' + t('b=-' + sh.q) + ' (the ' + t('y') + '-intercept):<br>' + t('y=' + PL.tex(T)) + ', so ' + t('k(x)=' + PL.tex(T)),
            ['Find the slope from the two intercept points; the constant is the ' + t('y') + '-intercept.'], 'line from two intercepts');
          p.answer = t('k(x)=' + PL.tex(T)); p.bad = W.map(function (w) { return PL.tex(w.is); });
          return p;
        } },
        { id: 'e16b', level: 'ADV', outcome: 'RF2', make: function (r, sh) {
          var Dt = bld('x', sh.xL, sh.xU);
          return setPart('(b) The line is now restricted so that its range is ' + t(bld('y', sh.L, sh.U)) + '. Determine the restricted domain exactly.', Dt, { v: 'x', wrong: [{ is: bld('x', sh.L, sh.U), code: 'set-swap', hint: 'Those are the range values. Find the inputs: solve ' + t('k(x)=' + sh.L) + ' and ' + t('k(x)=' + sh.U) + '.' }, { is: bld('x', 0, sh.p), code: 'diag', hint: 'The intercepts don’t fix the ends: solve ' + t('k(x)=' + sh.L) + ' and ' + t('k(x)=' + sh.U) + '.' }] },
            'The line rises, so the lowest output is at the left end and the highest at the right end.<br>' + t('k(x)=' + sh.L + ':\\ ' + ex.texRat(sh.m) + 'x-' + sh.q + '=' + sh.L + ',\\ x=' + sh.xL) + '<br>' + t('k(x)=' + sh.U + ':\\ ' + ex.texRat(sh.m) + 'x-' + sh.q + '=' + sh.U + ',\\ x=' + sh.xU) + '<br>' + t('D=' + Dt),
            ['Solve ' + t('k(x)=') + ' each end of the range.'], 'domain from a restricted range');
        } },
        { id: 'e16c', level: 'PRG', outcome: 'RF1', make: function (r, sh) {
          var hasX = sh.xL <= sh.p && sh.p <= sh.xU, hasY = sh.xL <= 0 && 0 <= sh.xU;
          var xw = 'The ' + t('x') + '-intercept ' + t(ptT([sh.p, 0])) + ' needs ' + t('x=' + sh.p) + ' in the domain ' + t(cond('x', sh.xL, sh.xU)) + '. ', yw = 'The ' + t('y') + '-intercept ' + t(ptT([0, -sh.q])) + ' needs ' + t('x=0') + ' in the domain ' + t(cond('x', sh.xL, sh.xU)) + '. ';
          return mc(r, '(c) With that restriction in place, which intercepts does the graph still have?', [
            { html: 'both intercepts', right: hasX && hasY, why: hasX && hasY ? null : (hasX ? '' : xw) + (hasY ? '' : yw) },
            { html: 'only the ' + t('x') + '-intercept', right: hasX && !hasY, why: hasX && !hasY ? null : (hasY ? yw.replace('needs', 'is still there: it needs') : xw) },
            { html: 'only the ' + t('y') + '-intercept', right: !hasX && hasY, why: !hasX && hasY ? null : (hasX ? xw.replace('needs', 'is still there: it needs') : yw) },
            { html: 'neither intercept', right: !hasX && !hasY, why: 'Check each intercept’s ' + t('x') + '-value against the domain ' + t(cond('x', sh.xL, sh.xU)) + '.' }],
            t('x') + '-int ' + t(ptT([sh.p, 0])) + ': ' + (hasX ? t(sh.xL + '\\le ' + sh.p + '\\le ' + sh.xU) + ', so it is still on the graph.' : t(sh.p) + ' is outside the domain, so it is gone.') + '<br>' + t('y') + '-int ' + t(ptT([0, -sh.q])) + ': ' + (hasY ? t('x=0') + ' is in the domain' + (sh.xL === 0 ? ' (the included left endpoint)' : '') + ', so it is still on the graph.' : t('0') + ' is outside the domain, so it is gone.'),
            ['An intercept survives only if its ' + t('x') + '-value is still in the domain.'], 'intercepts after restriction', true);
        } }] },
      { num: '17', shared: function (r) {
          var r1 = r.pick([-1, -1, -3, -2, 1]), w = r.pick([3, 3, 2, 4]), r2 = r1 + 2 * w; if (r.chance(0.3)) { r1 = -1; w = 3; r2 = 5; }
          if (r1 === 0 || r2 === 0) { r1 = -1; r2 = r1 + 2 * w; }
          var h = r1 + w, k = -w * w, d2 = w + r.pick([1, 1, 2]);
          return { r1: r1, r2: r2, w: w, h: h, k: k, d2: d2, c2: d2 * d2 - w * w, T: P(lin([[1, 'x^{2}'], [-(r1 + r2), 'x'], [r1 * r2, '']])) };
        },
        stem: function (sh) { return 'A function ' + t('f') + ' has a parabola for its graph. The parabola opens upward, its ' + t('x') + '-intercepts are ' + t(ptT([sh.r1, 0])) + ' and ' + t(ptT([sh.r2, 0])) + ', and the smallest value ' + t('f') + ' ever takes is ' + t(sh.k) + '.'; }, parts: [
        { id: 'e17a', level: 'ADV', make: function (r, sh) {
          var W = [{ is: P(lin([[1, 'x^{2}'], [sh.r1 + sh.r2, 'x'], [sh.r1 * sh.r2, '']])), code: 'root-sign', hint: 'An ' + t('x') + '-intercept at ' + t('x=' + sh.r1) + ' gives the factor ' + t('(x' + (sh.r1 < 0 ? '+' + (-sh.r1) : '-' + sh.r1) + ')') + ' — the sign flips.' }, { is: P(lin([[-1, 'x^{2}'], [sh.r1 + sh.r2, 'x'], [-sh.r1 * sh.r2, '']])), code: 'sign', hint: 'The parabola opens upward, so ' + t('a>0') + '.' }];
          var p = K.P.poly('(a) Determine ' + t('f(x)') + ' in the form ' + t('ax^{2}+bx+c') + '.', sh.T, { before: t('f(x)='), wrong: (W = fw(W, sh.T)) },
            t('x') + '-ints give the factors: ' + t('f(x)=a(x' + (sh.r1 < 0 ? '+' + (-sh.r1) : '-' + sh.r1) + ')(x-' + sh.r2 + ')') + '.<br>The minimum is on the axis, halfway between: ' + t('x=\\dfrac{' + sh.r1 + '+' + sh.r2 + '}{2}=' + sh.h) + '.<br>' + t('f(' + sh.h + ')=' + sh.k + ':\\ a(' + (sh.h - sh.r1) + ')(' + (sh.h - sh.r2) + ')=' + sh.k) + ', so ' + t('a=1') + ' (' + t('a>0') + ': opens up ✓).<br>' + t('f(x)=' + PL.tex(sh.T)),
            ['Each ' + t('x') + '-intercept ' + t('r') + ' gives a factor ' + t('(x-r)') + '.', 'The vertex is halfway between the ' + t('x') + '-intercepts; use the minimum value there to find ' + t('a') + '.'], 'quadratic from intercepts and minimum');
          p.answer = t('f(x)=' + PL.tex(sh.T)); p.bad = W.map(function (w) { return PL.tex(w.is); });
          return p;
        } },
        { id: 'e17b', level: 'EMG', outcome: 'RF1', make: function (r, sh) {
          var c = sh.r1 * sh.r2;
          var p = B.math('(b) State the ' + t('y') + '-intercept as an ordered pair.', ptsChk([[0, c]], { axis: 'y', other: [[sh.r1, 0], [sh.r2, 0]], diag: function (A) { if (A.length === 1 && same(A[0][0], 0) && same(A[0][1], sh.k)) return { code: 'diag', hint: t(sh.k) + ' is the minimum value, at ' + t('x=' + sh.h) + '. The ' + t('y') + '-intercept is ' + t('f(0)') + '.' }; return null; } }), ptK([0, c]),
            t('f(0)=' + sh.r1 * sh.r2) + ', so the ' + t('y') + '-intercept is ' + t(ptT([0, c])) + '.', ['Evaluate ' + t('f(0)') + '.'], 'y-int of a parabola', { keys: 'pairs', placeholder: 'e.g. (0, 3)' });
          p.answer = t(ptT([0, c]));
          return p;
        } },
        { id: 'e17b2', sub: 'b ii', level: 'PRG', outcome: 'RF2', make: function (r, sh) {
          var Rt = bld('y', sh.k, null);
          return drPart('(b) State the domain and the range of ' + t('f') + '.', all('x'), Rt, { rW: [{ is: bld('y', sh.r1 * sh.r2, null), code: 'set-values', hint: 'The lowest point is the vertex, ' + t('y=' + sh.k) + ', not the ' + t('y') + '-intercept.' }, { is: bld('y', null, sh.k), code: 'set-values', hint: 'The parabola opens <b>up</b>, so the outputs go up from the minimum.' }, { is: all('y'), code: 'set-values', hint: 'The parabola never goes below its minimum value ' + t(sh.k) + '.' }] },
            t('D=' + all('x')) + ' (no restriction).<br>' + t(sh.k) + ' is the minimum and the parabola opens up: ' + t('R=' + Rt) + '.', ['Opens upward → the range starts at the minimum and goes up.'], 'D and R of parabola');
        } },
        { id: 'e17c', level: 'ADV', make: function (r, sh) {
          var lo = sh.h - sh.d2, hi = sh.h + sh.d2;
          return fieldsOf('(c) Solve ' + t('f(x)=' + sh.k) + ' and ' + t('f(x)=' + sh.c2) + '.', [solF(t('f(x)=' + sh.k) + ':', [sh.h], 'x'), solF(t('f(x)=' + sh.c2) + ':', [lo, hi], 'x')], t('x=' + sh.h) + '; ' + t('x=' + lo) + ' or ' + t('x=' + hi),
            t(PL.tex(sh.T) + '=' + sh.k + '\\Rightarrow ' + PL.tex(PL.add(sh.T, PL.num(-sh.k))) + '=0\\Rightarrow ' + (sh.h === 0 ? 'x' : '(x' + (sh.h < 0 ? '+' + (-sh.h) : '-' + sh.h) + ')') + '^{2}=0') + ', ' + t('x=' + sh.h) + '.<br>' + t(PL.tex(sh.T) + '=' + sh.c2 + '\\Rightarrow ' + PL.tex(PL.add(sh.T, PL.num(-sh.c2))) + '=0') + ', so ' + t('x=' + lo) + ' or ' + t('x=' + hi) + '.',
            ['Move the constant across so one side is ' + t('0') + ', then factor.', 'The vertex value is reached once; a value above it twice.'], 'solve at vertex and above');
        } },
        { id: 'e17c2', sub: 'c ii', level: 'EMG', make: function (r, sh) {
          return mc(r, '(c) Why does ' + t('f(x)=' + sh.k) + ' have a single solution while ' + t('f(x)=' + sh.c2) + ' has two?', [
            { html: t(sh.k) + ' is the minimum, reached only at the vertex; a value above the minimum is reached twice, once on each side of the axis ' + t('x=' + sh.h) + '.', right: true },
            { html: 'Because ' + t(sh.k) + ' is negative.', why: 'The sign isn’t the reason: the vertex height is reached once, whatever its sign.' },
            { html: 'Because ' + t('f') + ' is not a function at its vertex.', why: t('f') + ' is a function everywhere. The question is how many inputs share an output.' },
            { html: 'It’s a coincidence of the numbers.', why: 'It always happens: only the vertex has height ' + t(sh.k) + '; every higher value appears twice by symmetry.' }],
            'The minimum value ' + t(sh.k) + ' occurs only at the vertex ' + t(ptT([sh.h, sh.k])) + '. Any output above the minimum is reached twice, symmetric about ' + t('x=' + sh.h) + '.', ['Picture horizontal lines at both heights.'], 'one vs two solutions');
        } }] },
      { num: '18', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: 'e18', level: 'PRG', outcome: 'RF2', make: function (r) {
          var c, xL, xR;
          for (var g = 0; g < 200; g++) { c = r.pick([3, 3, 2, 1, 4]); xL = r.pick([-5, -5, -4, -6]); xR = r.pick([3, 3, 2, 4]); if (r.chance(0.3)) { c = 3; xL = -5; xR = 3; } if (xL < -c && xR + c <= 7 && xL + c >= -4) break; }
          var yL = xL + c, yR = xR + c, fi = r.chance(0.5) ? 3 : r.int(0, 3);
          var S0 = [{ T: t('D=' + bld('x', xL, xR, false, true)), F: t('D=' + bld('x', xL, xR)), w: 'The left end ' + t(ptT([xL, yL])) + ' is hollow, so ' + t('x=' + xL) + ' is excluded: ' + t(cond('x', xL, xR, false, true)) + '.' },
            { T: t('f(0)=' + c), F: t('f(0)=' + (-c)), w: 'The segment is ' + t('y=x+' + c) + ', so ' + t('f(0)=' + c) + '.' },
            { T: 'The ' + t('x') + '-intercept is ' + t(ptT([-c, 0])), F: 'The ' + t('x') + '-intercept is ' + t(ptT([c, 0])), w: t('x+' + c + '=0') + ' gives ' + t('x=' + (-c)) + ', which is in the domain.' },
            { T: t('R=' + bld('y', yL, yR, false, true)), F: t('R=' + bld('y', yL, yR)), w: t('y=' + yL) + ' occurs only at the hollow endpoint, so it is excluded from the range.' }];
          var opts = S0.map(function (s, i) { return { html: i === fi ? s.F : s.T, right: i === fi, why: i === fi ? null : 'That statement is true. ' + s.w }; });
          return mc(r, 'The whole graph of a function ' + t('f') + ' is the straight segment from ' + t(ptT([xL, yL])) + ' to ' + t(ptT([xR, yR])) + ', hollow at ' + t(ptT([xL, yL])) + ' and solid at ' + t(ptT([xR, yR])) + '. Exactly one statement below is <b>false</b>.', opts,
            'Slope ' + t('=\\dfrac{' + yR + '-' + par(yL) + '}{' + xR + '-' + par(xL) + '}=1') + ', so the segment is ' + t('y=x+' + c) + '.<br>' + S0.map(function (s, i) { return (i === fi ? '<b>False:</b> ' + s.F + '. ' : '<b>True:</b> ') + s.w; }).join('<br>'),
            ['Find the equation of the segment first; then check each statement, paying attention to the hollow end.'], 'which statement is false', true);
        } }] },
      { num: '19', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: 'e19', level: 'EMG', outcome: 'RF2', make: function (r) {
          var c = r.pick([5, 5, 3, 4, 7]), m = r.pick([3, 3, 2, 4]), xs = r.chance(0.4) ? [-2, 0, 1, 4] : r.sample([-3, -2, -1, 0, 1, 2, 3, 4], 4).sort(function (a, b) { return a - b; });
          var ys = xs.map(function (x) { return c - m * x; }), so = uniq(ys), lo = so[0], hi = so[so.length - 1];
          return mc(r, 'The function ' + t('h') + ' is defined by ' + t('h(x)=' + c + '-' + m + 'x') + ' on the domain ' + t('\\{' + xs.join(', ') + '\\}') + '. The range of ' + t('h') + ' is', [
            { html: t('\\{y\\mid ' + lo + '\\le y\\le ' + hi + ',\\ y\\in\\mathbb{R}\\}'), why: 'The domain is a finite list, so the range is a finite list too — not every real number in between.' },
            { html: t('\\{' + so.join(', ') + '\\}'), right: true },
            { html: t('\\{' + ys.join(', ') + '\\}'), why: 'Right values, but a list is written in <b>increasing</b> order.' },
            { html: t('\\{y\\mid ' + lo + '\\le y\\le ' + hi + ',\\ y\\in I\\}'), why: 'That includes every integer between, like ' + t(lo + 1) + ', which ' + t('h') + ' may never produce. List only the four outputs.' }],
            xs.map(function (x, i) { return t('h(' + x + ')=' + ys[i]); }).join(', ') + '. The domain is a finite list, so the range is the list of outputs, each once, in increasing order: ' + t('\\{' + so.join(', ') + '\\}') + '.',
            ['Evaluate ' + t('h') + ' at each domain value.'], 'range on a finite domain');
        } }] },
      { num: '20', stem: '<i>(Numerical Response)</i>', parts: [
        { id: 'e20', level: 'ADV', make: function (r) {
          var r1, r2, h, d, c, ans;
          for (var g = 0; g < 200; g++) { r1 = r.pick([-2, -2, -1, -3, -4]); r2 = r.pick([8, 8, 6, 4, 5, 7]); if (r.chance(0.3)) { r1 = -2; r2 = 8; } if ((r1 + r2) % 2) continue; h = (r1 + r2) / 2; d = (h - r1) * (h - r1); c = -r1 * r2; ans = r2 + c - r1 - d; if (ans >= 0 && ans < 10000) break; }
          var T = PL.tex(PL.neg(P(lin([[1, 'x^{2}'], [-(r1 + r2), 'x'], [r1 * r2, '']]))));
          return B.nr('The graph of ' + t('g(x)=' + T) + ' has ' + t('x') + '-intercepts ' + t('(a,\\ 0)') + ' and ' + t('(b,\\ 0)') + ' with ' + t('a<b') + ', and ' + t('y') + '-intercept ' + t('(0,\\ c)') + '. The greatest value ' + t('g') + ' ever takes is ' + t('d') + '. The value of ' + t('b+c-a-d') + ' is ________.', ans, function (u) {
            if (same(u, -r1 + c - r2 - d)) return { code: 'diag', hint: 'Check which intercept is ' + t('a') + ': ' + t('a<b') + ', so ' + t('a=' + r1) + ' and ' + t('b=' + r2) + '.' };
            if (same(u, r2 + c + r1 - d)) return { code: 'sign', hint: t('-a=-(' + r1 + ')=+' + (-r1)) + '.' };
            return null;
          }, t('x') + '-ints: ' + t(T + '=0\\Rightarrow (x-' + r2 + ')(x+' + (-r1) + ')=0') + ', so ' + t('a=' + r1) + ', ' + t('b=' + r2) + '.<br>' + t('y') + '-int: ' + t('c=g(0)=' + c) + '.<br>The maximum is on the axis halfway between the ' + t('x') + '-intercepts: ' + t('x=' + h) + ', ' + t('d=g(' + h + ')=' + d) + '.<br>' + t('b+c-a-d=' + r2 + '+' + c + '-(' + r1 + ')-' + d + '=' + ans),
            ['Factor to find the ' + t('x') + '-intercepts; evaluate ' + t('g(0)') + '; the maximum is halfway between the ' + t('x') + '-intercepts.'], 'combined intercepts and max NR');
        } }] }

    ])
  });
})(window);
