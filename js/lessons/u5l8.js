/* Math 10C · Unit 5 · Lesson 8 — Function Notation: Graphs, Conversions, and Real-World Models (RF8; D/R parts RF2,
 * sketches and situation reasoning RF1)
 * Assignment questions 1–16 (u5_L08.tex) and the Lesson 8 Extra Practice (u5_EP08.tex, all 21 questions).
 * Every part is a generator: it keeps the booklet question's structure (the letter of the input variable, a rule
 * that must be rearranged first, a zigzag graph whose heights repeat, a scaled grid, a model with a fixed start value
 * and a natural stopping point) and changes the numbers; the booklet's own numbers are among the possible values.
 * Conversions are typed as whole equations on a small keypad with = and ( ) (namespaced 'u5l8eq'): the left side is
 * checked (y vs f(x), the function's name, the letter in the brackets) and the right side by K.poly.
 * "Solve f(x) = b" answers are solution lists (K.valueSet) with a "none" key for no solution; statements such as
 * q(−8) = 4 are typed and read back (name, input, output). Domain/range answers use the set keypad; a range may be
 * written with q(x) (as the booklet does) or with y.
 * Sketches of the models (13a, 14a, 15a, 16a, Extra 13a) are drawn on the graph pad (js/draw.js) on the context's own
 * axes: a linear model is one segment over its realistic domain with solid end dots; the falling case (16a) is plotted
 * from a table of values and joined. True end values are often off the tappable grid, so each point must be on the grid
 * point nearest the true one (half a snap step) — exact whenever the true point is on the grid. Explain / interpret
 * questions become multiple choice with misconception hints. Levels: LIM BEG EMG PRG ADV MAS. */
(function (root) {
  'use strict';
  var HW = root.HW, ex = HW.ex, F = HW.fmt, K = HW.kit, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form, B = K.P, S = HW.sets, PL = HW.poly;

  HW.addCodes({
    'conv-no-eq': 'Wrote an expression, not an equation', 'conv-lhs': 'Left side not y or f(x)', 'conv-still-fn': 'Kept function notation (asked for y = …)',
    'conv-still-y': 'Kept y (asked for function notation)', 'conv-name': 'Wrong function name', 'conv-arg': 'Wrong variable in the brackets', 'conv-var': 'Changed the input variable',
    'conv-out': 'Used another letter for y', 'conv-no-divide': 'Did not divide every term by the coefficient of y', 'conv-move-sign': 'Sign error moving terms across', 'conv-part-divide': 'Divided only some terms',
    'stmt-unreadable': 'Statement not in function notation', 'stmt-pair': 'Wrote an ordered pair instead of function notation', 'stmt-name': 'Wrong function name in statement',
    'stmt-swap': 'Input and output swapped', 'stmt-scale': 'Counted grid squares instead of using the scale', 'read-reverse': 'Read the graph in the wrong direction',
    'read-scale': 'Ignored the axis scale', 'sol-said-none': 'Said no solution (there is one)', 'sol-not-none': 'Gave solutions when there are none', 'sol-graph-missing': 'Stopped at the first crossing',
    'sq-neg': 'Squared a negative as negative', 'ev-sign': 'Sign error with a negative input', 'ev-instead': 'Evaluated instead of solving', 'solve-instead': 'Solved instead of evaluating',
    'ft-sign': 'Sign error substituting −t', 'ft-zero': 'Cancelled everything', 'xint-yint': 'Gave the y-intercept for the x-intercept', 'two-b': 'Wrong b for exactly two solutions',
    'ext-half': 'Stopped at a^(1/2)', 'ext-quarter': 'Gave a^(1/4)', 'ext-sign': 'Sign error solving for a', 'no-fixed': 'Left out the fixed cost', 'extra-costs': 'Left out extra costs',
    'profit-one': 'Left out one of the extra costs', 'revenue': 'Gave the revenue, not the profit', 'no-square': 'Did not square t', 'sq-coef': 'Squared the coefficient too',
    'neg-time': 'Kept the negative root for time', 'root-missing': 'Did not take the square root', 'dr-context': 'Domain/range does not fit the situation', 'dr-range-match': 'Range does not match the domain',
    'nr-yint': 'Gave the y-intercept', 'nr-flip': 'Divided the wrong way', 'nr-const': 'Gave the constant', 'stretch-b': 'Wrong set of heights',
    'sk-points': 'Sketch: plotted points only, no graph', 'sk-straight': 'Sketch: not one straight segment (linear) / straight instead of a curve', 'sk-vertical': 'Sketch: vertical line', 'sk-gap': 'Sketch: gap in the graph',
    'sk-extra': 'Sketch: extra point off the graph', 'sk-arrow': 'Sketch: arrow where the model stops', 'sk-dir': 'Sketch: rises/falls the wrong way', 'sk-startx': 'Sketch: domain starts at the wrong value',
    'sk-endx': 'Sketch: domain ends at the wrong value', 'sk-starty': 'Sketch: wrong starting value', 'sk-endy': 'Sketch: wrong end value (rate)', 'sk-lines': 'Sketch: straight pieces instead of a joined curve',
    'sk-after': 'Sketch: continued after landing', 'sk-up': 'Sketch: graphed 4.9t² (rising)', 'sk-shape': 'Sketch: curve falls fastest at the start', 'sk-point': 'Sketch: a plotted point is off the curve',
    'sk-start': 'Sketch: release point missing', 'sk-land': 'Sketch: landing point missing', 'sk-few': 'Sketch: too few points for a curve'
  });

  /* ---------------- keypads (namespaced, registered once) ---------------- */
  var EQK = 'u5l8eq', SOLK = 'u5l8sol', Wd = HW.widgets;
  if (Wd && Wd.KEYSETS) {
    var dk = function (n) { return { label: String(n), tex: String(n), plain: String(n) }; };
    if (!Wd.KEYSETS[EQK]) Wd.KEYSETS[EQK] = function (opt) {
      var vs = (opt && opt.vars && opt.vars.length ? opt.vars : ['x', 'y']).slice(0, 6).map(function (v) { return { label: '<i>' + v + '</i>', tex: v, plain: v }; });
      return [[dk(7), dk(8), dk(9), { label: '+', tex: '+', plain: '+' }, { label: '−', tex: '-', plain: '-' }, { label: '⌫', fn: 'del', title: 'Delete' }],
        [dk(4), dk(5), dk(6), { label: 'x<sup>2</sup>', tex: '^{2}', plain: '^2', title: 'Squared' }, { label: '<sup>a</sup>⁄<sub>b</sub>', tex: '\\frac{#@}{#?}', plain: '/', title: 'Fraction' }, { label: 'clear', fn: 'clear' }],
        [dk(1), dk(2), dk(3), { label: '( )', tex: '\\left(#0\\right)', plain: '(', title: 'Brackets' }, { label: '◀', fn: 'left', title: 'Move left' }, { label: '▶', fn: 'right', title: 'Move right (out of a box)' }],
        [dk(0), { label: '.', tex: '.', plain: '.' }, { label: '=', tex: '=', plain: ' = ' }, { label: 'Check ↵', fn: 'enter', wide: true }], vs];
    };
    if (Wd.KEYHELP && !Wd.KEYHELP[EQK]) Wd.KEYHELP[EQK] = ['Type the whole equation with the <b>=</b> key. For function notation tap the letter, then <b>( )</b>, the input letter, and <b>▶</b> to step out, e.g. ' + HW.k('f(x)=2x-3') + '.',
      'Type the whole equation, e.g. <code>f(x) = 2x - 3</code> or <code>y = 2x - 3</code>.'];
    if (!Wd.KEYSETS[SOLK] && Wd.KEYSETS.solutions) Wd.KEYSETS[SOLK] = function (opt) {
      var rows = Wd.KEYSETS.solutions(opt).map(function (rw) { return rw.slice(); }), last = rows[rows.length - 1];
      last.splice(last.length - 1, 0, { label: 'none', tex: '\\text{none}', plain: 'none', title: 'There is no solution' });
      return rows;
    };
    if (Wd.KEYHELP && !Wd.KEYHELP[SOLK]) Wd.KEYHELP[SOLK] = ['Separate solutions with a comma, e.g. ' + HW.k('x=3,\\ x=-5') + '. Press <b>none</b> if there is no solution.', 'Type e.g. <code>x = 3, x = -5</code>, or <code>none</code>.'];
  }

  /* ---------------- numbers and LaTeX ---------------- */
  function cl(x) { return Math.round(x * 1e6) / 1e6; }
  function rng(a, b, st) { var o = []; for (var i = a; i <= b + 1e-9; i += (st || 1)) o.push(cl(i)); return o; }
  function uniq(a) { var s = a.slice().sort(function (x, y) { return x - y; }); return s.filter(function (x, i) { return i === 0 || Math.abs(x - s[i - 1]) > 1e-9; }); }
  function gcd(a, b) { return ex.gcd(a, b); }
  function nf(x) { return String(cl(x)); }
  function money(x) { x = cl(x); return Math.abs(x - Math.round(x)) < 1e-9 ? F(Math.round(x)) : x.toFixed(2); }
  function ptT(p) { return '(' + nf(p[0]) + ',\\ ' + nf(p[1]) + ')'; }
  function term(c, v, first) {
    var neg, mag;
    if (Array.isArray(c)) { neg = c[0] * c[1] < 0; var p = Math.abs(c[0]), q = Math.abs(c[1]); mag = q === 1 ? (p === 1 && v ? '' : String(p)) : '\\frac{' + p + '}{' + q + '}'; }
    else { neg = c < 0; var a = Math.abs(c); mag = a === 1 && v ? '' : String(cl(a)); }
    return (neg ? '-' : first ? '' : '+') + mag + v;
  }
  /* linear/quadratic expression in the order given: [[coef, 'x'], [coef, '']]; coef a number or [p, q] */
  function lin(ts) { var out = ''; ts.forEach(function (x) { var z = Array.isArray(x[0]) ? x[0][0] === 0 : x[0] === 0; if (!z) out += term(x[0], x[1], out === ''); }); return out || '0'; }
  function P(tex) { return PL.parse(tex); }
  function frT(p, q) { var r = ex.norm(p, q); return ex.texRat(r); }

  /* ---------------- reading typed answers ---------------- */
  function clean(s) { return String(s == null ? '' : s).replace(/\\left|\\right/g, '').replace(/\\lparen/g, '(').replace(/\\rparen/g, ')').replace(/\\[,;:! ]|~/g, ' ').replace(/\\cdot/g, '\\times ').trim(); }
  function lhsInfo(L) {
    L = L.replace(/\s+/g, '');
    var m = /^([A-Za-z])\(([^()]*)\)$/.exec(L); if (m) return { kind: 'fn', name: m[1], arg: m[2] };
    if (/^[A-Za-z]$/.test(L)) return { kind: 'var', name: L };
    return { kind: 'other' };
  }
  function lettersOf(s) { var o = {}; String(s).replace(/(\\[a-zA-Z]+)|([a-zA-Z])/g, function (m, cmd, ch) { if (ch) o[ch] = 1; return m; }); return Object.keys(o); }
  function relabel(s, from, to) { return String(s).replace(/(\\[a-zA-Z]+)|(?<![a-zA-Z])([a-zA-Z])(?![a-zA-Z])/g, function (m, cmd, ch) { return cmd ? cmd : ch === from ? to : ch; }); }
  function numVal(s) { var p = ex.parse(String(s).trim()); if (!p.ok) return null; var v = ex.value(p.ast); return isFinite(v) ? v : null; }
  function same(a, b) { return Math.abs(a - b) < 1e-9; }

  /* ---- conversions: mode 'xy' (answer y = …) or 'fn' (answer f(v) = …). o: T (polynomial), v (input letter),
   * name (function name for the key), reqName (the question fixes the name), out (output letter, default y),
   * wrong [{is, code, hint}], expanded ---- */
  function convChk(mode, o) {
    var v = o.v || 'x', out = o.out || 'y';
    var ws = (o.wrong || []).filter(function (w) { return w && !PL.eq(w.is, o.T); });
    var base = K.poly(o.T, { wrong: ws, expanded: o.expanded });
    return function (resp) {
      var s = clean(resp);
      if (!s) return form('empty', 'Type the whole equation first.');
      var parts = s.split('=');
      var want = mode === 'xy' ? t(out + '=\\ldots') : t((o.name || 'f') + '(' + v + ')=\\ldots');
      if (parts.length === 1) return form('conv-no-eq', 'Write the whole <b>equation</b>, starting with ' + want + '.');
      if (parts.length > 2 || !parts[0].trim() || !parts[1].trim()) return form('unreadable', 'Write one equation, starting with ' + want + '.');
      var L = parts[0], R = parts[1], li = lhsInfo(L);
      if (li.kind === 'other') { var ri = lhsInfo(R); if (ri.kind !== 'other') { li = ri; R = L; } }
      if (li.kind === 'other') return form('conv-lhs', 'Start your equation with ' + want + '.');
      // right side: letters
      var rl = lettersOf(R).filter(function (c) { return c !== v; });
      var rr = base(R);
      if (rr.v !== 'correct' && rl.length === 1 && lettersOf(R).indexOf(v) < 0) {
        var alt = base(relabel(R, rl[0], v));
        if (alt.v === 'correct') return wrong('conv-var', 'The input variable never changes when you convert: keep ' + t(v) + ' on the right side (you wrote ' + t(rl[0]) + ').');
      }
      if (mode === 'xy') {
        if (li.kind === 'fn') return wrong('conv-still-fn', t(li.name + '(' + li.arg + ')') + ' is function notation. To write an equation in two variables, replace ' + t(li.name + '(' + li.arg + ')') + ' with ' + t(out) + '.');
        if (li.name !== out) return form('conv-out', 'Use ' + t(out) + ' for the output: start with ' + t(out + '=') + '.');
      } else {
        if (li.kind === 'var') return wrong('conv-still-y', t(li.name) + ' is an output variable, so this is still ' + t('x') + '-' + t('y') + ' notation. Replace ' + t(li.name) + ' with function notation: ' + want + '.');
        if (li.name === v) return form('conv-name', 'The function needs a name that isn’t the input letter, e.g. ' + t('f(' + v + ')') + '.');
        if (o.reqName && li.name !== o.name) return wrong('conv-name', 'The question names the function ' + t(o.name) + ', so write ' + t(o.name + '(' + v + ')') + ', not ' + t(li.name + '(' + li.arg + ')') + '.');
        if (!o.reqName && (li.name === 'y' || li.name === out)) return form('conv-name', 'Name the function with a letter such as ' + t('f') + ': ' + t('f(' + v + ')') + '. (' + t(out) + ' is the output it replaces.)');
        if (li.arg !== v) return wrong('conv-arg', 'The brackets hold the <b>input</b> variable, ' + t(v) + ' — it is the letter in the rule. Write ' + t((o.reqName ? o.name : li.name) + '(' + v + ')') + ', not ' + t(li.name + '(' + li.arg + ')') + '.');
      }
      return rr;
    };
  }
  function convPart(mode, prompt, o, sol, hints, text) {
    var v = o.v || 'x', name = o.name || 'f', out = o.out || 'y';
    var lhs = mode === 'xy' ? out : name + '(' + v + ')', key = lhs + '=' + o.keyRhs;
    var vars = [v].concat(mode === 'xy' ? [out] : [name]).concat(o.vars || []).filter(function (c, i, a) { return a.indexOf(c) === i; });
    var p = { prompt: prompt, input: { type: 'math', keys: EQK, vars: vars, placeholder: mode === 'xy' ? 'e.g. y = 2x - 3' : 'e.g. f(x) = 2x - 3' }, check: convChk(mode, o), key: key, answer: t(key),
      solution: sol, hints: hints || [], text: text };
    p.good = [o.keyRhs + '=' + lhs].concat(o.good || []);
    p.bad = (o.wrong || []).filter(function (w) { return !PL.eq(w.is, o.T); }).map(function (w) { return lhs + '=' + PL.tex(w.is); }).concat(o.bad || []);
    return p;
  }

  /* ---- a function-notation statement such as q(-8) = 4 ---- */
  function stmtRead(s) {
    s = clean(s).replace(/\s+/g, '');
    if (/^\([^()]*,[^()]*\)$/.test(s)) return { pair: true };
    var parts = s.split('='); if (parts.length !== 2) return null;
    var L = parts[0], R = parts[1], m = /^([A-Za-z])\((.+)\)$/.exec(L);
    if (!m) { m = /^([A-Za-z])\((.+)\)$/.exec(R); if (!m) return null; R = L; }
    var a = numVal(m[2]), b = numVal(R); if (a == null || b == null) return null;
    return { name: m[1], a: a, b: b };
  }
  function stmtChk(name, a, b, o) {
    o = o || {};
    return function (resp) {
      if (!clean(resp)) return form('empty', 'Type the statement first, e.g. ' + t(name + '(2)=5') + '.');
      var r = stmtRead(resp);
      if (r && r.pair) return form('stmt-pair', 'That’s an ordered pair. Write it in <b>function notation</b>: ' + t(name + '(\\text{input})=\\text{output}') + '.');
      if (!r) return form('stmt-unreadable', 'Write a statement in function notation: the function’s name, the input in brackets, then ' + t('=') + ' and the output, e.g. ' + t(name + '(2)=5') + '.');
      if (r.name !== name) return wrong('stmt-name', 'The function is named ' + t(name) + ', so the statement starts with ' + t(name + '(\\ldots)') + '.');
      if (same(r.a, a) && same(r.b, b)) return ok();
      if (same(r.a, b) && same(r.b, a)) return wrong('stmt-swap', 'Input and output are swapped. In ' + t(name + '(a)=b') + ', the input ' + t('a') + ' (the ' + t('x') + '-coordinate) goes in the brackets and the output ' + t('b') + ' comes after the equals sign.');
      if (o.grid && same(r.a, o.grid[0]) && same(r.b, o.grid[1])) return wrong('stmt-scale', 'You counted grid squares. Each grid line stands for ' + t(o.scale) + ' units — multiply each count by ' + t(o.scale) + '.');
      var h = o.diag ? o.diag(r) : null; if (h) return wrong(h.code, h.hint);
      return wrong('value', null);
    };
  }

  /* ---- "solve" answers read off a graph: values (may be empty = no solution) ---- */
  function isNone(s) { var x = String(s == null ? '' : s).replace(/\s+/g, ' ').trim(); return /^(\\text\{\s*(none|no solutions?)\s*\}|none|no solutions?|\\emptyset|\\varnothing|∅|\\\{\s*\\\}|\{\s*\})$/i.test(x) || /^(x|[a-z])\s*=\s*(\\text\{\s*none\s*\}|none)$/i.test(x); }
  function solsChk(values, o) {
    o = o || {}; var v = o.v || 'x';
    var base = values.length ? K.valueSet(values, { v: v, diag: function (A, T) {
      if (o.scale && o.scale !== 1 && A.length === T.length && A.every(function (x) { return T.some(function (y) { return same(x * o.scale, y); }); })) return { code: 'read-scale', hint: 'Check the scale: each grid line on the horizontal axis is ' + t(o.scale) + ' units, not ' + t('1') + '.' };
      if (o.graph && A.length < T.length && A.every(function (x) { return T.some(function (y) { return same(x, y); }); })) return { code: 'sol-graph-missing', hint: 'Correct so far — but keep following the horizontal line at height ' + t(nf(o.b)) + ' across the <b>whole</b> graph and count every point where it meets the graph.' };
      return o.diag ? o.diag(A, T) : null;
    } }) : null;
    return function (resp) {
      var s = String(resp == null ? '' : resp).trim();
      if (!s) return form('empty', 'Type your answer first (or press <b>none</b>).');
      if (isNone(s)) return values.length ? wrong('sol-said-none', o.saidNone || 'There is at least one solution: draw a horizontal line at height ' + t(nf(o.b)) + ' and look for where it meets the graph.') : ok();
      if (!values.length) {
        var vb = K.valueSet([1e9])(s);
        if (vb.v === 'form') return vb;
        return wrong('sol-not-none', o.noneHint || 'Check those values — does the graph ever reach height ' + t(nf(o.b)) + '?');
      }
      return base(s);
    };
  }
  function solsKey(values, v) { return values.length ? values.map(function (x) { return (v || 'x') + '=' + nf(x); }).join(',\\ ') : '\\text{none}'; }
  function solsPart(prompt, values, o, sol, hints, text) {
    o = o || {}; var v = o.v || 'x';
    var p = B.math(prompt, solsChk(values, o), solsKey(values, v), sol, hints, text, { keys: SOLK, vars: [v], placeholder: 'e.g. ' + v + ' = 3, ' + v + ' = -5   (or none)' });
    p.answer = values.length ? t(solsKey(values, v)) : 'no solution';
    return p;
  }
  function solField(label, v) { return { label: label, name: String(label).replace(/:\s*$/, ''), mode: 'math', keys: 'solutions', vars: [v || 'x'], none: true, placeholder: 'e.g. ' + (v || 'x') + ' = 3, ' + (v || 'x') + ' = -5' }; }

  /* ---------------- piecewise-linear graphs ---------------- */
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
  function pwMin(V) { return Math.min.apply(null, V.map(function (p) { return p[1]; })); }
  function pwMax(V) { return Math.max.apply(null, V.map(function (p) { return p[1]; })); }
  function mirror(V) { return V.map(function (p) { return [-p[0], p[1]]; }).reverse(); }
  function flipV(V) { return V.map(function (p) { return [p[0], -p[1]]; }); }
  function scaleV(V, kx, ky) { return V.map(function (p) { return [p[0] * kx, p[1] * ky]; }); }
  function pwGraph(V, o) {
    o = o || {};
    var g = { x: o.x, y: o.y, grid: o.grid || 1, gridY: o.gridY, labels: o.labels || 2, labelsX: o.labelsX, labelsY: o.labelsY, unit: o.unit, unitX: o.unitX, unitY: o.unitY,
      xName: 'x', yName: o.yName || 'y', max: o.max || 360, segs: [{ pts: V, start: o.start || 'closed', end: o.end || 'closed' }], points: o.points || [], aria: o.aria || 'graph of a function' };
    return '<div class="fig">' + HW.graph(g) + '</div>';
  }

  /* ---------------- set answers ---------------- */
  function cond(v, lo, hi) { return nf(lo) + '\\le ' + v + '\\le ' + nf(hi); }
  function bld(v, lo, hi) { return '\\{' + v + '\\mid ' + cond(v, lo, hi) + ',\\ ' + v + '\\in\\mathbb{R}\\}'; }
  function lst(a) { return '\\{' + uniq(a).map(nf).join(', ') + '\\}'; }
  /* map a range written with q(x) (or the bare function letter) onto y */
  function toY(resp, fname, dv) {
    var s = String(resp == null ? '' : resp).replace(/\\left|\\right/g, '').replace(/\\lparen/g, '(').replace(/\\rparen/g, ')');
    s = s.replace(/([A-Za-z])\s*\(\s*([A-Za-z])\s*\)/g, function (m, f, a) { return a === dv ? 'y' : m; });
    if (fname && fname !== dv && fname !== 'R') s = relabel(s, fname, 'y');
    return s;
  }
  function rangeChk(Ry, fname, dv, o) {
    o = o || {};
    var T = S.parse(Ry).set;
    var wr = (o.wrong || []).filter(function (w) { var q = S.parse(w.is); return q.ok && !S.eq(q.set, T); });
    var base = K.set(Ry, { v: 'y', other: o.other, otherName: 'domain', wrong: wr, tag: o.tag });
    var fx = fname + '(' + dv + ')';
    return function (resp) {
      var r = base(toY(resp, fname, dv));
      if (r.v === 'form' && r.code === 'set-letter') return form('set-letter', 'Right set — but the range is a set of <b>outputs</b>: write it with ' + t(fx) + ' (or ' + t('y') + '), e.g. ' + t('\\{' + fx + '\\mid \\ldots\\}') + '.');
      if (r.v === 'form' && r.code === 'set-tag') return form('set-tag', 'Right — now finish the set notation with ' + t(',\\ ' + fx + '\\in\\mathbb{R}') + '.');
      if (r.v === 'wrong' && o.ctx && o.ctx[r.code]) return wrong(r.code, o.ctx[r.code]);
      return r;
    };
  }
  function domChk(D, dv, other, o) {
    o = o || {};
    var T = S.parse(D).set;
    var wr = (o.wrong || []).filter(function (w) { var q = S.parse(w.is); return q.ok && !S.eq(q.set, T); });
    var base = K.set(D, { v: dv, other: other, otherName: 'range', wrong: wr, tag: o.tag });
    return function (resp) { var r = base(resp); if (r.v === 'wrong' && o.ctx && o.ctx[r.code]) return wrong(r.code, o.ctx[r.code]); return r; };
  }
  function ivAlt(tex) {
    var p = S.parse(tex); if (!p.ok || p.set.kind !== 'int' || p.set.parts.length !== 1) return tex;
    var q = p.set.parts[0]; return (q.lc ? '[' : '(') + nf(q.lo) + ', ' + nf(q.hi) + (q.hc ? ']' : ')');
  }
  /* Domain and Range in one part (two boxes). o: dv, fname, D:[lo,hi] or list, R likewise, disc (lists), dW, rW, dC, rC */
  function drPart(prompt, o, sol, hints, text) {
    var dv = o.dv || 'x', fname = o.fname, fx = fname + '(' + dv + ')';
    var Dt = o.disc ? lst(o.D) : bld(dv, o.D[0], o.D[1]), Ry = o.disc ? lst(o.R) : bld('y', o.R[0], o.R[1]);
    var Rshow = o.disc ? lst(o.R) : '\\{' + fx + '\\mid ' + cond(fx, o.R[0], o.R[1]) + ',\\ ' + fx + '\\in\\mathbb{R}\\}';
    var cD = domChk(Dt, dv, Ry, { wrong: o.dW, ctx: o.dC }), cR = rangeChk(Ry, fname, dv, { other: Dt, wrong: o.rW, ctx: o.rC });
    var fl = [{ label: 'Domain', name: 'Domain', mode: 'math', keys: 'set', vars: [dv, fname], placeholder: 'e.g. {' + dv + ' | -2 <= ' + dv + ' <= 5, ' + dv + ' in R}' },
      { label: 'Range', name: 'Range', mode: 'math', keys: 'set', vars: [dv, fname], placeholder: 'e.g. {' + fx + ' | 1 <= ' + fx + ' <= 4, ' + fx + ' in R}' }];
    var p = BF(prompt, fl, [cD, cR], [Dt, Rshow], t('D=' + Dt) + '<br>' + t('R=' + Rshow), sol, hints, text);
    p.good = o.disc ? [] : [[ivAlt(Dt), ivAlt(Ry)], [cond(dv, o.D[0], o.D[1]), cond(fx, o.R[0], o.R[1])], [Dt, Ry]];
    p.bad = [[Ry, Dt]].concat((o.dW || []).map(function (w) { return [w.is, Rshow]; })).concat((o.rW || []).map(function (w) { return [Dt, w.is]; })).filter(function (b) { return !(S.eq(S.parse(b[0]).set, S.parse(Dt).set) && S.eq(S.parse(toY(b[1], fname, dv)).set, S.parse(Ry).set)); });
    return p;
  }

  /* ---------------- small builders ---------------- */
  /* fields with a sensible placeholder in every math box (the widget's default is a product of primes) */
  function phFix(fl) {
    fl.forEach(function (f) { if (f.mode === 'math' && !f.placeholder) f.placeholder = f.keys === EQK ? 'e.g. f(2) = 5' : f.keys === 'fraction' ? 'e.g. 7 or 3/4' : f.keys === 'solutions' ? 'e.g. 5' : f.keys === 'set' ? 'e.g. {x | 0 <= x <= 5, x in R}' : ''; });
    return fl;
  }
  function BF(prompt, fl, ch, keys, answer, sol, hints, text) { return B.fields(prompt, phFix(fl), ch, keys, answer, sol, hints, text); }
  function mc(r, prompt, opts, sol, hints, text, keepOrder) { return B.mc(r, prompt, opts, sol, hints, text, keepOrder); }
  function numF(label, v, diag) { return { f: { label: label, name: label, mode: 'math', keys: 'fraction' }, c: K.value(v, { diag: diag }), k: nf(v) }; }
  function fieldsOf(prompt, items, answer, sol, hints, text) {
    return BF(prompt, items.map(function (x) { return x.f; }), items.map(function (x) { return x.c; }), items.map(function (x) { return x.k; }), answer, sol, hints, text);
  }
  /* ---------------- sketching a model on its context axes (graph pad) ----------------
   * The model's true end values are often not on a tappable grid (H(24) = 47 on a 5 cm snap), so a sketch is checked
   * like a careful paper sketch: each end must be on the grid point NEAREST the true point (within half a snap step),
   * which is exact whenever the true point is on the grid. */
  function padIn(o) {
    var I = { x: o.x, y: o.y, grid: o.sx, gridY: o.gy || o.sy, labelsX: o.lx, labelsY: o.ly, unitX: 290 / (o.x[1] - o.x[0]), unitY: 230 / (o.y[1] - o.y[0]),
      firstQuadrant: o.fq !== false, xName: o.v, yName: o.w, xTitle: o.xTitle, yTitle: o.yTitle, snapX: o.sx, snapY: o.sy, max: 340 };
    Object.keys(o.extra || {}).forEach(function (k) { I[k] = o.extra[k]; });
    return I;
  }
  function snapTo(x, s) { return cl(Math.round(cl(x / s)) * s); }
  /* a linear model drawn as ONE segment over [X0, X1] with solid ends. o: f, X0, X1, sx, sy, name, v, unitY (text),
   * hint texts: start0 (started at 0 instead of the fixed value), startX, endX, arrow, dir */
  function segSketch(o) {
    var tx = o.sx / 2 + 1e-6, ty = o.sy / 2 + 1e-6, Y0 = o.f(o.X0), Y1 = o.f(o.X1), nm = o.name, v = o.v;
    var A = [snapTo(o.X0, o.sx), snapTo(Y0, o.sy)], Bp = [snapTo(o.X1, o.sx), snapTo(Y1, o.sy)];
    var key = { pts: [], pieces: [{ v: [A, Bp], s: 'closed', e: 'closed' }], join: 'none' };
    var near = function (P0) { return 'the grid point nearest ' + t(ptT(P0)); };
    var check = function (resp) {
      if (HW.draw.empty(resp)) return form('empty', 'Draw your graph first: choose <b>╱ Line</b>, tap the start point, then the end point (tap it again to finish).');
      var g = HW.draw.geom(resp), ks = Object.keys(g.lines);
      if (!ks.length) return wrong('sk-points', 'Good start — now draw the graph itself: every value in between makes sense too, so connect the start to the end with <b>╱ Line</b>.');
      if (ks.length > 1) return wrong('sk-straight', 'This model is linear, so its graph is <b>one straight segment</b>. Use <b>╱ Line</b> and tap only the two end points.');
      var L = g.lines[ks[0]];
      if (L.B === 0) return wrong('sk-vertical', 'A vertical line would give many outputs for one input. Draw the segment from the start of the domain to its end.');
      if (L.iv.length > 1) return wrong('sk-gap', 'Your graph has a gap. The model works for every value of ' + t(v) + ' in its domain — draw one unbroken segment.');
      if (g.pts.length) return wrong('sk-extra', 'The point ' + t(ptT(g.pts[0])) + ' is not on your segment. A sketch of a linear model is just the segment — remove separate points.');
      var iv = L.iv[0];
      if (!isFinite(iv.lo) || !isFinite(iv.hi)) return wrong('sk-arrow', o.arrow || 'The model has a start and an end: finish the segment with solid dots, not arrows.');
      var f = function (x) { return (L.C - L.A * x) / L.B; }, yl = f(iv.lo), yh = f(iv.hi);
      if ((yh - yl) * (Y1 - Y0) <= 0) return wrong('sk-dir', o.dir || ('Check the direction: ' + t(nm + '(' + nf(o.X0) + ')=' + nf(Y0)) + ' and ' + t(nm + '(' + nf(o.X1) + ')=' + nf(Y1)) + '.'));
      if (Math.abs(iv.lo - o.X0) > tx) return wrong('sk-startx', o.startX || ('Check where the graph starts: the domain begins at ' + t(v + '=' + nf(o.X0)) + '.'));
      if (Math.abs(iv.hi - o.X1) > tx) return wrong('sk-endx', o.endX || ('Check where the graph ends: the domain stops at ' + t(v + '=' + nf(o.X1)) + '.'));
      if (Math.abs(yl - Y0) > ty) {
        if (o.start0 && Math.abs(yl) < ty) return wrong('no-fixed', o.start0);
        return wrong('sk-starty', 'Check the start: ' + t(nm + '(' + nf(o.X0) + ')=' + nf(Y0)) + ', so the segment starts at ' + near([o.X0, Y0]) + '.');
      }
      if (Math.abs(yh - Y1) > ty) return wrong('sk-endy', 'Check the end: ' + t(nm + '(' + nf(o.X1) + ')=' + nf(Y1)) + ', so the segment ends at ' + near([o.X1, Y1]) + '.');
      if (!iv.lc || !iv.hc) return wrong('graph-ends', 'Both end values belong to the model: use <b>solid</b> dots at both ends (●○ Ends).');
      return ok();
    };
    return { check: check, key: key, A: A, B: Bp };
  }
  function seg(a, b, s, e) { return { v: [a, b], s: s || 'closed', e: e || 'closed' }; }
  function drawing(pieces, pts, join) { return { pieces: pieces || [], pts: pts || [], join: join || 'none' }; }
  var LINE_HELP = ' Use <b>╱ Line</b>: tap the start, then the end (tap it again to finish). Put each end on the grid point nearest the true point.';

  /* ================= Question 4: zigzag graph ================= */
  function zigShared(r) {
    var fam = r.pick([[4, 4], [4, 4], [4, 2], [3, 3]]), w = fam[0], A = fam[1], s = r.pick([1, 1, -1]);
    var V = [-2, -1, 0, 1, 2].map(function (k, i) { return [k * w, s * A * (i % 2 ? -1 : 1)]; });
    var name = r.pick(['q', 'q', 'g', 'k', 'p']), ends = r.pick([['R', 'S'], ['R', 'S'], ['A', 'B'], ['M', 'N']]);
    var ints = rng(-2 * w + 1, 2 * w - 1).filter(function (x) { return x % w !== 0; });
    var zeros = ints.filter(function (x) { return pwAt(V, x) === 0 && x < 0; }), nonz = ints.filter(function (x) { return pwAt(V, x) !== 0; });
    var x1 = zeros.length ? r.pick(zeros) : r.pick(nonz.filter(function (x) { return x < -w; }));
    var x2 = r.pick(nonz.filter(function (x) { return x !== x1 && Math.abs(x) < w; }));
    var c3 = nonz.filter(function (x) { return x > w && pwAt(V, x) !== pwAt(V, x2); });
    var x3 = r.pick(c3.length ? c3 : nonz.filter(function (x) { return x > w; }));
    var xs = [x1, x2, x3];
    var top = s * A, bot = -s * A, none = s * (A + 2);
    return { V: V, w: w, A: A, s: s, n: name, ends: ends, xs: xs, top: top, bot: bot, none: none,
      fig: pwGraph(V, { x: [-2 * w - 1, 2 * w + 1], y: [-A - 1, A + 1], labels: 2, yName: name + '(x)', points: [{ x: V[0][0], y: V[0][1], label: ends[0] }, { x: V[4][0], y: V[4][1], label: ends[1] }], aria: 'zigzag graph of ' + name }) };
  }

  /* ================= Question 8: scaled zigzag ================= */
  function scaledShared(r) {
    var k = r.pick([5, 5, 2, 10]), m = r.chance(0.3);
    var G = [[-6, -2], [-2, 6], [2, -2], [6, 6]]; if (m) G = mirror(G);
    var cands = []; for (var x = -5; x <= 5; x++) { if (x === 0 || G.some(function (p) { return p[0] === x; })) continue; var y = pwAt(G, x); if (y !== 0 && y > 0) cands.push([x, y]); }
    var mk = r.pick(cands.filter(function (p) { return p[1] >= 2; })), name = r.pick(['s', 's', 'g', 'h']), other = r.pick(['t', 'f', 'k'].filter(function (c) { return c !== name; }));
    var V = scaleV(G, k, k);
    return { k: k, G: G, V: V, mk: mk, n: name, bad: other, lo: -2 * k, hi: 6 * k,
      fig: pwGraph(V, { x: [-7 * k, 7 * k], y: [-3 * k, 7 * k], grid: k, labels: 2 * k, unit: 300 / (14 * k), yName: name + '(x)', points: [{ x: mk[0] * k, y: mk[1] * k }], aria: 'scaled zigzag graph of ' + name }) };
  }

  /* ================= Question 6: a rising line ================= */
  function lineShared(r) {
    var m = r.pick([2, 2, 1, 3]), x0 = r.pick([3, 3, 2, 4, -2]), b = -m * x0, f = function (x) { return m * x + b; };
    var used = [x0, 0];
    function pk(arr) { var c = arr.filter(function (x) { return used.indexOf(x) < 0; }); var v = r.pick(c); used.push(v); return v; }
    var X1 = pk([9, 9, 8]), X2 = pk([-6, -6, -5, -4]), X3 = pk([6, 6, 5, 7]), Xk = pk([-3, -3, -2, -1, 1].filter(function (x) { return Math.abs(f(x)) > 0; }));
    var Xs = pk([8, 7, 5, 4].filter(function (x) { return f(x) > 0; }));
    var yr = [Math.floor(f(-7) / (2 * m)) * 2 * m, Math.ceil(f(10) / (2 * m)) * 2 * m];
    var fig = '<div class="fig">' + HW.graph({ x: [-7, 10], y: yr, grid: 1, gridY: m, labels: 2, labelsX: 2, labelsY: 2 * m, unitX: 18, unitY: 300 / (yr[1] - yr[0]), xName: 'x', yName: 'r(x)', max: 340,
      segs: [{ pts: [[-6.8, f(-6.8)], [9.8, f(9.8)]], start: 'arrow', end: 'arrow' }], aria: 'graph of the line r' }) + '</div>';
    return { m: m, b: b, f: f, x0: x0, rows: [['x', X1], ['r', 0], ['x', X2], ['x', X3], ['r', f(Xk)], ['x', 0]], Xk: Xk, Xs: Xs, fig: fig };
  }

  /* ================= context models ================= */
  function seedShared(r) {
    var q = r.pick([4, 4, 2, 3]), p = r.pick({ 2: [3, 5, 7], 3: [4, 5, 7, 8], 4: [5, 7, 7, 9] }[q]), c = r.pick([5, 5, 6, 7, 8, 10]);
    var H = function (x) { return cl(p * x / q + c); };
    return { p: p, q: q, c: c, T: 6 * q, H: H, rule: 'H(t)=\\dfrac{' + p + '}{' + q + '}t+' + c };
  }
  function shirtShared(r) {
    var Fc = r.pick([2150, 2150, 1850, 1900, 2000, 2250, 2400, 2500]), rate = r.pick([6.75, 6.75, 5.25, 5.75, 6.25, 7.25]);
    var n1 = r.pick([60, 60, 40, 80, 120]), n2 = r.pick([600, 600, 400, 480, 640, 720]);
    var N, design, other, price, C = function (n) { return cl(Fc + rate * n); }, profit;
    for (var g = 0; g < 50; g++) {
      N = r.pick([500, 500, 400, 600]); design = r.pick([850, 850, 650, 700, 750, 900, 950]); other = r.pick([1200, 1200, 1000, 1100, 1300, 1400]); price = r.pick([18.5, 18.5, 16.5, 17.5, 19.5]);
      profit = cl(N * price - C(N) - design - other); if (profit > 300) break;
    }
    return { Fc: Fc, rate: rate, n1: n1, n2: n2, N: N, design: design, other: other, price: price, C: C, profit: profit, max: 800 };
  }
  function cocoaShared(r) {
    var A, Bc;
    do { A = r.pick([180, 180, 150, 160, 200, 210, 240]); Bc = r.pick([8, 8, 5, 6, 10]); } while ((10 * A) % Bc !== 0 || A / Bc > 30 || A / Bc < 15);
    var t1 = r.pick([-10, -10, -5, -15]), t2 = r.pick([5, 5, 2, 4, 10].filter(function (x) { return A - Bc * x > 0 && x * Bc !== A; }));
    return { A: A, Bc: Bc, t1: t1, t2: t2, z: cl(A / Bc), P: function (x) { return cl(A - Bc * x); } };
  }
  function dropShared(r) {
    var T = r.pick([20, 20, 10, 12, 14, 15, 16, 18]), H0 = cl(4.9 * T * T), t1 = T === 20 && r.chance(0.5) ? 15 : r.int(Math.ceil(T / 3), Math.floor(0.8 * T));
    return { T: T, H0: H0, t1: t1, t2: T + 5, h: function (x) { return cl(H0 - 4.9 * x * x); } };
  }

  /* ================= Extra practice helpers ================= */
  /* a line y = mx + b drawn across a ±5 grid (clipped to the window) */
  function lineFig(m, b, nm) {
    var lo = -5.3, hi = 5.3, xa = -5.3, xb = 5.3;
    if (m !== 0) { var x1 = (lo - b) / m, x2 = (hi - b) / m; xa = Math.max(-5.3, Math.min(x1, x2)); xb = Math.min(5.3, Math.max(x1, x2)); }
    return '<div class="fig">' + HW.graph({ x: [-5.5, 5.5], y: [-5.5, 5.5], grid: 1, labels: 2, xName: 'x', yName: 'y', max: 260, segs: [{ pts: [[xa, cl(m * xa + b)], [xb, cl(m * xb + b)]], start: 'none', end: 'none' }], aria: 'graph of a line' + (nm ? ' ' + nm : '') }) + '</div>';
  }
  /* two boxes: x-y notation and function notation */
  function bothPart(prompt, o, sol, hints, text) {
    var v = o.v || 'x', out = o.out || 'y', name = o.name || 'f';
    var fl = [{ label: t(v) + '-' + t(out) + ' notation:', name: 'x-y notation', mode: 'math', keys: EQK, vars: [v, out, name], placeholder: 'e.g. ' + out + ' = 2' + v + ' - 3' }, { label: 'Function notation:', name: 'Function notation', mode: 'math', keys: EQK, vars: [v, out, name], placeholder: 'e.g. ' + name + '(' + v + ') = 2' + v + ' - 3' }];
    var c1 = convChk('xy', { T: o.T, v: v, out: out, wrong: o.wrong }), c2 = convChk('fn', { T: o.T, v: v, name: name, reqName: true, wrong: o.wrong });
    var k1 = out + '=' + o.keyRhs, k2 = name + '(' + v + ')=' + o.keyRhs;
    var p = BF(prompt, fl, [c1, c2], [k1, k2], t(k1) + '<br>' + t(k2), sol, hints, text);
    p.bad = [[k2, k1]].concat(o.bad || []);
    return p;
  }
  /* the Extra 6 / 20 graph: pieces with a flat part; mirror (x -> -x) and flip (y -> -y) variants */
  function flatShared(r) {
    var mi = r.chance(0.35), fl = r.chance(0.25), sx = mi ? -1 : 1, sy = fl ? -1 : 1;
    var V = [[-6, 4], [-2, -4], [1, 2], [4, 2], [6, -2]]; if (mi) V = mirror(V); if (fl) V = flipV(V);
    return { V: V, sx: sx, sy: sy, fig: pwGraph(V, { x: [-7, 7], y: [-5, 5], labels: 2, yName: 'f(x)', max: 320, aria: 'graph of f with a flat piece' }) };
  }
  /* the Extra 7 graph: scaled axes */
  function scaled2Shared(r) {
    var sc = r.pick([[10, 4], [10, 4], [5, 2], [10, 5], [2, 4]]), mi = r.chance(0.3);
    var G = [[-6, -2], [-3, 4], [1, -4], [5, 4]]; if (mi) G = mirror(G);
    var V = scaleV(G, sc[0], sc[1]);
    var fig = '<div class="fig">' + HW.graph({ x: [-7 * sc[0], 7 * sc[0]], y: [-5 * sc[1], 5 * sc[1]], grid: sc[0], gridY: sc[1], labels: 2 * sc[0], labelsX: 2 * sc[0], labelsY: 2 * sc[1], unitX: 300 / (14 * sc[0]), unitY: 220 / (10 * sc[1]),
      xName: 'x', yName: 'g(x)', max: 340, segs: [{ pts: V, start: 'closed', end: 'closed' }], aria: 'graph of g on scaled axes' }) + '</div>';
    return { sx: sc[0], sy: sc[1], G: G, V: V, mi: mi, fig: fig };
  }
  /* the Extra 12 tank */
  function tankShared(r) {
    var T = r.pick([[2, 10, 4, 7, 5], [2, 10, 4, 7, 5], [2, 8, 3, 8, 4], [4, 10, 3, 8, 6], [1, 9, 4, 8, 5]]);
    var V = [[0, 50 * T[0]], [T[2], 50 * T[1]], [T[3], 50 * T[1]], [12, 50 * T[4]]];
    var fig = '<div class="fig">' + HW.graph({ x: [0, 13], y: [0, 600], grid: 1, gridY: 50, labels: 2, labelsX: 2, labelsY: 100, unitX: 22, unitY: 0.4, firstQuadrant: true, xName: 't', yName: 'W(t)', xTitle: 't (min)', yTitle: 'W(t) (L)', max: 340,
      segs: [{ pts: V, start: 'closed', end: 'closed' }], aria: 'graph of the water in the tank' }) + '</div>';
    return { V: V, S: 50 * T[0], F: 50 * T[1], a: T[2], b: T[3], E: 50 * T[4], fig: fig };
  }
  /* the Extra 18 stretch graph */
  function stretchShared(r) {
    var mi = r.chance(0.4), fl = r.chance(0.3);
    var V = [[-6, 5], [-2, -3], [2, 5], [5, -1]]; if (mi) V = mirror(V); if (fl) V = flipV(V);
    /* piece names follow the drawing (mirroring swaps which piece is the short one; flipping swaps peak and low point) */
    var nm = { long: mi ? 'pieces 2 and 3' : 'pieces 1 and 2', Long: mi ? 'Pieces 2 and 3' : 'Pieces 1 and 2', short: mi ? 'piece 1' : 'piece 3', shortThe: mi ? 'the first piece' : 'the third piece',
      meetLow: mi ? 'pieces 2 and 3' : 'pieces 1 and 2', shareTop: mi ? 'pieces 1 and 2' : 'pieces 2 and 3', end: mi ? 'right end' : 'left end', top: fl ? 'low point' : 'peak', near: fl ? 'high point' : 'low point' };
    return { V: V, mi: mi, fl: fl, nm: nm, sy: fl ? -1 : 1, sx: mi ? -1 : 1, fig: pwGraph(V, { x: [-7, 7], y: fl ? [-6, 5] : [-5, 6], labels: 2, yName: 'f(x)', max: 320, aria: 'graph of f made of three pieces' }) };
  }
  /* 'a squares left/right and b squares up' for a grid count g = [a, b] */
  function sqT(g) { var a = Math.abs(g[0]); return t(a) + (a === 1 ? ' square ' : ' squares ') + (g[0] < 0 ? 'left' : 'right') + ' and ' + t(Math.abs(g[1])) + (Math.abs(g[1]) === 1 ? ' square ' : ' squares ') + (g[1] < 0 ? 'down' : 'up'); }
  function meaningMC(r, prompt, right, wrongs, sol, hints, text) { return mc(r, prompt, [{ html: right, right: true }].concat(wrongs), sol, hints, text); }

  HW.defineLesson({
    id: 'u5l8', unit: 5, num: '8', title: 'Function Notation: Graphs, Conversions, and Real-World Models', outcome: 'RF8',
    blurb: 'Switching between y = … and f(x) = …, reading f(a) and solving f(x) = b off a graph, and using function notation to describe a real-world model and its limits.',
    questions: [
      /* ---------------- Q1 ---------------- */
      { num: '1', section: 'Part A — Converting between the two notations', stem: 'In each case express the relation given in function notation as an equation in two variables.', parts: [
        { id: '1a', level: 'EMG', make: function (r) {
          var a = r.pick([12, 12, 5, 7, 8, 9, 10, 14, 15, 18, 20]), b = r.int(2, 9), rhs = lin([[a, ''], [-b, 'x']]);
          return convPart('xy', t('f(x)=' + rhs), { T: P(rhs), v: 'x', keyRhs: rhs, bad: ['f(x)=' + rhs] },
            'Replace ' + t('f(x)') + ' with ' + t('y') + '. The rule on the right does not change:<br>' + t('y=' + rhs),
            [t('f(x)') + ' plays exactly the role of ' + t('y') + ': swap one for the other and leave the right side alone.'], 'f(x)=' + rhs + ' to y=');
        } },
        { id: '1b', level: 'EMG', make: function (r) {
          var a = r.int(2, 6), c = r.pick([7, 7, 2, 3, 4, 5, 8, 9, 11]), rhs = lin([[a, 'x^{2}'], [c, '']]);
          return convPart('xy', t('g(x)=' + rhs), { T: P(rhs), v: 'x', keyRhs: rhs, bad: ['g(x)=' + rhs, 'y=' + a + 'x+' + c] },
            'Replace ' + t('g(x)') + ' with ' + t('y') + ':<br>' + t('y=' + rhs),
            ['The name of the function (' + t('g') + ') disappears; ' + t('g(x)') + ' becomes ' + t('y') + '.'], 'g(x)=' + rhs + ' to y=');
        } },
        { id: '1c', level: 'PRG', make: function (r) {
          var nm = r.pick(['Q', 'Q', 'P', 'H', 'A']), v = r.pick(['t', 't', 'n', 'w']), a = r.int(2, 9), c = r.pick([15, 15, 6, 8, 9, 11, 13, 17, 20]), rhs = lin([[a, v], [-c, '']]);
          return convPart('xy', t(nm + '(' + v + ')=' + rhs), { T: P(rhs), v: v, keyRhs: rhs, vars: ['x'], bad: ['y=' + lin([[a, 'x'], [-c, '']]), nm + '(' + v + ')=' + rhs] },
            'Replace ' + t(nm + '(' + v + ')') + ' with ' + t('y') + '. The input variable stays ' + t(v) + ':<br>' + t('y=' + rhs),
            ['Only the output changes its name. Which letter is the input here?', 'The input letter is ' + t(v) + ' — it stays ' + t(v) + ' in the equation.'], nm + '(' + v + ') to y=');
        } }] },
      /* ---------------- Q2 ---------------- */
      { num: '2', stem: 'Express the following relations in function notation.', parts: [
        { id: '2a', level: 'EMG', make: function (r) {
          var a = r.int(2, 9), b = r.pick([13, 13, 3, 4, 5, 7, 9, 11, 15, 17]), rhs = lin([[a, 'x'], [b, '']]);
          return convPart('fn', t('y=' + rhs), { T: P(rhs), v: 'x', name: 'f', keyRhs: rhs, good: ['g(x)=' + rhs], bad: ['y=' + rhs, 'f(y)=' + rhs] },
            'Replace ' + t('y') + ' with a function name and the input in brackets, ' + t('f(x)') + ':<br>' + t('f(x)=' + rhs),
            ['Swap ' + t('y') + ' for ' + t('f(x)') + '. The right side stays the same.'], 'y=' + rhs + ' to f(x)');
        } },
        { id: '2b', level: 'PRG', make: function (r) {
          var v = r.pick(['w', 'w', 't', 'n', 'k']), a = r.int(3, 9), b = r.pick([21, 21, 5, 7, 9, 12, 16, 25]), rhs = lin([[a, v], [-b, '']]);
          return convPart('fn', t('y=' + rhs), { T: P(rhs), v: v, name: 'f', keyRhs: rhs, vars: ['x'], bad: ['f(x)=' + rhs, 'f(x)=' + lin([[a, 'x'], [-b, '']]), 'f(y)=' + rhs] },
            'The input variable is ' + t(v) + ', so it goes in the brackets:<br>' + t('f(' + v + ')=' + rhs) + '<br>(' + t('f(x)') + ' would be wrong — there is no ' + t('x') + ' in the rule.)',
            ['Which letter is the input in this rule? That letter goes in the brackets.'], 'y=' + rhs + ' to f(' + v + ')');
        } },
        { id: '2c', level: 'PRG', make: function (r) {
          var Bq = r.pick([4, 4, 2, 3, 5]), A = r.pick([1, 2, 3, 3, 4, 5, 6, 7].filter(function (x) { return x % Bq !== 0 && gcd(x, Bq) === 1; })), k = r.int(2, 6), C = Bq * k;
          var rhs = lin([[k, ''], [[-A, Bq], 'x']]), eq = lin([[A, 'x'], [Bq, 'y'], [-C, '']]) + '=0', Ax = (A === 1 ? '' : A) + 'x';
          var W = [{ is: P(lin([[C, ''], [-A, 'x']])), code: 'conv-no-divide', hint: 'You solved for ' + t(Bq + 'y') + ', not ' + t('y') + '. Divide <b>every</b> term by ' + t(Bq) + '.' },
            { is: P(lin([[k, ''], [[A, Bq], 'x']])), code: 'conv-move-sign', hint: 'Check the sign of the ' + t('x') + ' term: moving ' + t(Ax) + ' to the other side makes it ' + t('-' + Ax) + '.' },
            { is: P(lin([[[A, Bq], 'x'], [-k, '']])), code: 'conv-move-sign', hint: 'Check your signs: ' + t(Bq + 'y=' + C + '-' + Ax) + '. Every term that moves across the equals sign changes sign.' },
            { is: P(lin([[k, ''], [-A, 'x']])), code: 'conv-part-divide', hint: 'Divide <b>both</b> terms on the right by ' + t(Bq) + ', not just the constant.' }];
          return convPart('fn', t(eq), { T: P(rhs), v: 'x', name: 'f', keyRhs: rhs, wrong: W, good: ['f(x)=' + lin([[[-A, Bq], 'x'], [k, '']])].concat(Bq !== 3 ? ['f(x)=' + k + '-' + cl(A / Bq) + 'x'] : []), bad: ['y=' + rhs] },
            'Solve for ' + t('y') + ' first:<br>' + t(Bq + 'y=' + C + '-' + Ax) + '<br>' + t('y=' + rhs) + '<br>Then replace ' + t('y') + ' with ' + t('f(x)') + ': ' + t('f(x)=' + rhs),
            ['Get ' + t('y') + ' by itself first: move the other terms across, then divide by ' + t(Bq) + '.'], eq + ' to f(x)');
        } }] },
      /* ---------------- Q3 ---------------- */
      { num: '3', stem: 'Express each equation in function notation.', parts: [
        { id: '3a', level: 'EMG', make: function (r) {
          var a = r.pick([0.25, 0.25, 0.5, 0.75, 1.25, 1.5]), b = r.pick([1.75, 1.75, 0.5, 0.75, 1.25, 2.25, 2.5, 2.75].filter(function (x) { return x !== a; })), rhs = lin([[a, 'x'], [b, '']]);
          return convPart('fn', 'The graph of the function defined by ' + t('y=f(x)') + ' has equation ' + t('y=' + rhs) + '.', { T: P(rhs), v: 'x', name: 'f', reqName: true, keyRhs: rhs, bad: ['g(x)=' + rhs, 'y=' + rhs] },
            'The question says ' + t('y=f(x)') + ', so replace ' + t('y') + ' with ' + t('f(x)') + ':<br>' + t('f(x)=' + rhs),
            [t('y=f(x)') + ' tells you the function is called ' + t('f') + ' and its input is ' + t('x') + '.'], 'y=' + rhs + ' with y=f(x)');
        } },
        { id: '3b', level: 'PRG', make: function (r) {
          var ctx = r.pick([{ out: 'd', v: 't', what: 'distance', unit: '(in kilometres, for travel at a constant speed)', k: r.pick([55, 55, 40, 45, 60, 65, 70, 80, 90, 100]) },
            { out: 'C', v: 'n', what: 'cost', unit: '(in dollars, for ' + t('n') + ' tickets at a fixed price)', k: r.pick([8, 12, 15, 18, 24]) }]);
          var rhs = ctx.k + ctx.v;
          return convPart('fn', 'The graph of the ' + ctx.what + ' function defined by ' + t(ctx.out + '=f(' + ctx.v + ')') + ' has equation ' + t(ctx.out + '=' + rhs) + ' ' + ctx.unit + '.',
            { T: P(rhs), v: ctx.v, name: 'f', reqName: true, keyRhs: rhs, vars: [ctx.out, 'x'], bad: [ctx.out + '(' + ctx.v + ')=' + rhs, 'f(x)=' + rhs, 'f(' + ctx.out + ')=' + rhs] },
            t(ctx.out + '=f(' + ctx.v + ')') + ' says the output ' + t(ctx.out) + ' is written ' + t('f(' + ctx.v + ')') + ':<br>' + t('f(' + ctx.v + ')=' + rhs),
            ['The function is named ' + t('f') + ' and its input is ' + t(ctx.v) + '. Replace ' + t(ctx.out) + ' with ' + t('f(' + ctx.v + ')') + '.'], ctx.out + '=' + rhs + ' to f(' + ctx.v + ')');
        } }] },
      /* ---------------- Q4 ---------------- */
      { num: '4', section: 'Part B — Reading a graph in both directions', shared: zigShared, stem: function (sh) { return 'The graph of a function ' + t(sh.n) + ' is shown below.' + sh.fig; }, parts: [
        { id: '4a', level: 'BEG', make: function (r, sh) {
          var n = sh.n, items = sh.xs.map(function (x, i) {
            var val = pwAt(sh.V, x);
            return { f: { label: ['i)', 'ii)', 'iii)'][i] + ' ' + t(n + '(' + x + ')='), name: n + '(' + x + ')' }, k: nf(val), c: K.number(val, function (u) {
              var rev = pwSols(sh.V, x).pts; if (rev.some(function (z) { return same(z, u); })) return { code: 'read-reverse', hint: t(n + '(' + x + ')') + ' gives you the <b>input</b> ' + t(x) + ': start at ' + t(x) + ' on the horizontal axis and read up or down to the graph.' };
              if (same(u, -val) && val !== 0) return { code: 'sign', hint: 'Check the sign: is the graph above or below the ' + t('x') + '-axis at ' + t('x=' + x) + '?' };
              return null;
            }) };
          });
          return fieldsOf('(a) Complete:', items, sh.xs.map(function (x) { return t(n + '(' + x + ')=' + pwAt(sh.V, x)); }).join(',\\ '),
            'Start on the horizontal axis at each input and read up or down to the graph:<br>' + sh.xs.map(function (x) { return t(n + '(' + x + ')=' + pwAt(sh.V, x)); }).join(', ') + '.',
            ['Each segment changes by ' + t(2 * sh.A / sh.w) + ' vertically for every ' + t('1') + ' across, so you can count from the nearest corner.'], 'read ' + n + '(a) from zigzag');
        } },
        { id: '4b', level: 'LIM', make: function (r, sh) {
          var pr = sh.xs.map(function (x) { return [x, pwAt(sh.V, x)]; });
          return B.pairs('(b) Write the ordered pairs associated with i), ii) and iii) in (a).', pr, {},
            'In ' + t(sh.n + '(a)=b') + ' the input comes first: ' + pr.map(function (p) { return t(ptT(p)); }).join(', ') + '.', ['An ordered pair is (input, output).'], 'pairs from ' + sh.n + '(a)');
        } },
        { id: '4c', level: 'EMG', make: function (r, sh) {
          var bs = [sh.top, sh.bot, sh.none], lab = ['i)', 'ii)', 'iii)'];
          var fl = bs.map(function (b, i) { return solField(lab[i] + ' ' + t(sh.n + '(x)=' + b) + ':', 'x'); });
          var ch = bs.map(function (b) { var s0 = pwSols(sh.V, b).pts; return solsChk(s0, { b: b, graph: true, noneHint: 'Read across at height ' + t(b) + ': the graph only goes from ' + t(-sh.A) + ' to ' + t(sh.A) + '.' }); });
          var keys = bs.map(function (b) { var s0 = pwSols(sh.V, b).pts; return s0.length ? solsKey(s0) : 'none'; });
          var p = BF('(c) State the value(s) of ' + t('x') + ' if', fl, ch, keys, bs.map(function (b, i) { var s0 = pwSols(sh.V, b).pts; return lab[i] + ' ' + (s0.length ? t(solsKey(s0)) : 'no solution'); }).join('<br>'),
            'Start on the vertical axis at each height and read <b>across</b>, counting every point of the graph at that height:<br>' + bs.map(function (b, i) { var s0 = pwSols(sh.V, b).pts; return lab[i] + ' ' + t(sh.n + '(x)=' + b) + ': ' + (s0.length ? t(solsKey(s0)) + ' (' + s0.length + ' points)' : 'the graph never reaches ' + t(b) + ', so <b>no solution</b>'); }).join('<br>'),
            [t(sh.n + '(x)=b') + ' gives the <b>output</b>: start on the vertical axis and read across. There can be several answers, or none.'], 'solve ' + sh.n + '(x)=b on zigzag');
          p.good = [keys.map(function (k) { return k === 'none' ? '\\text{none}' : k; })];
          return p;
        } },
        { id: '4d', level: 'EMG', make: function (r, sh) {
          var P0 = sh.V[0], P4 = sh.V[4], n = sh.n;
          var fl = [{ label: 'Point ' + sh.ends[0] + ':', name: 'Point ' + sh.ends[0], mode: 'math', keys: EQK, vars: [n] }, { label: 'Point ' + sh.ends[1] + ':', name: 'Point ' + sh.ends[1], mode: 'math', keys: EQK, vars: [n] }];
          var p = BF('(d) Use the notation in (a) to make a statement about the points ' + sh.ends[0] + ' and ' + sh.ends[1] + ' on the graph.', fl,
            [stmtChk(n, P0[0], P0[1]), stmtChk(n, P4[0], P4[1])], [n + '(' + P0[0] + ')=' + P0[1], n + '(' + P4[0] + ')=' + P4[1]], t(n + '(' + P0[0] + ')=' + P0[1]) + ', ' + t(n + '(' + P4[0] + ')=' + P4[1]),
            sh.ends[0] + ' is ' + t(ptT(P0)) + ', so ' + t(n + '(' + P0[0] + ')=' + P0[1]) + '.<br>' + sh.ends[1] + ' is ' + t(ptT(P4)) + ', so ' + t(n + '(' + P4[0] + ')=' + P4[1]) + '.',
            ['A point ' + t('(a,\\ b)') + ' on the graph means ' + t(n + '(a)=b') + '.'], 'statements for endpoints of ' + n);
          p.bad = [['(' + P0[0] + ',' + P0[1] + ')', n + '(' + P4[0] + ')=' + P4[1]], [n + '(' + P0[1] + ')=' + P0[0], n + '(' + P4[0] + ')=' + P4[1]]];
          return p;
        } },
        { id: '4e', level: 'EMG', make: function (r, sh) {
          var z = pwSols(sh.V, 0).pts, n = sh.n, y0 = pwAt(sh.V, 0);
          var fl = [solField(t('x') + '-intercepts: ' + t(n + '(x)=0') + ' when', 'x'), { label: t('y') + '-intercept: ' + t(n + '(0)='), name: n + '(0)', mode: 'math', keys: 'solutions', vars: ['x'] }];
          var p = BF('(e) Write the ' + t('x') + '- and ' + t('y') + '-intercepts of the graph using function notation.', fl,
            [solsChk(z, { b: 0, graph: true }), K.value(y0, { diag: function (u) { return z.some(function (x) { return same(x, u); }) ? { code: 'xint-yint', hint: 'That is an ' + t('x') + '-intercept. The ' + t('y') + '-intercept is the output at ' + t('x=0') + '.' } : null; } })],
            [solsKey(z), nf(y0)], z.map(function (x) { return t(n + '(' + x + ')'); }).join('=') + t('=0') + '; ' + t(n + '(0)=' + y0),
            'An ' + t('x') + '-intercept has output ' + t('0') + ': ' + z.map(function (x) { return t(n + '(' + x + ')=0'); }).join(', ') + '.<br>The ' + t('y') + '-intercept is the output at ' + t('x=0') + ': ' + t(n + '(0)=' + y0) + '.',
            ['For the ' + t('x') + '-intercepts, solve ' + t(n + '(x)=0') + ': read along the ' + t('x') + '-axis.', 'For the ' + t('y') + '-intercept, find ' + t(n + '(0)') + '.'], 'intercepts of ' + n);
          return p;
        } },
        { id: '4f', level: 'EMG', outcome: 'RF2', make: function (r, sh) {
          var n = sh.n, L = sh.V[0][0], Rr = sh.V[4][0];
          return drPart('(f) State the domain and range of ' + t(n) + '.', { dv: 'x', fname: n, D: [L, Rr], R: [-sh.A, sh.A],
            rW: [{ is: bld('y', Math.min(sh.V[0][1], sh.V[4][1]), Math.max(sh.V[0][1], sh.V[4][1])), code: 'dr-peak', hint: 'Use the highest and lowest points of the whole graph, not just the endpoints.' }] },
            'The graph runs from ' + t('x=' + L) + ' to ' + t('x=' + Rr) + ', and its heights go from ' + t(-sh.A) + ' up to ' + t(sh.A) + ':<br>' + t(bld('x', L, Rr)) + '<br>' + t('\\{' + n + '(x)\\mid ' + cond(n + '(x)', -sh.A, sh.A) + ',\\ ' + n + '(x)\\in\\mathbb{R}\\}'),
            ['Domain: how far the graph spreads left to right. Range: how far it spreads up and down.'], 'domain/range of zigzag ' + n);
        } }] },
      /* ---------------- Q5 ---------------- */
      { num: '5', shared: function (r) {
          var a = r.pick([2, 2, 3]), c = r.pick([-7, -7, -9, -8, -5, -4, 3, 5]), D = r.pick([[-2, -1, 0, 1, 2], [-2, -1, 0, 1, 2], [-3, -1, 0, 1, 3], [-3, -2, 0, 2, 3]]);
          return { a: a, c: c, D: D, g: function (x) { return a * x * x + c; }, m: r.pick(D.filter(function (x) { return x > 0; })) };
        }, stem: function (sh) { return 'The function ' + t('g(x)=' + lin([[sh.a, 'x^{2}'], [sh.c, '']])) + ' has domain ' + t(lst(sh.D)) + '.'; }, parts: [
        { id: '5a', level: 'EMG', outcome: 'RF2', make: function (r, sh) {
          var Rv = uniq(sh.D.map(sh.g)), bad = uniq(sh.D.map(function (x) { return x < 0 ? -sh.a * x * x + sh.c : sh.g(x); }));
          var base = K.set(lst(Rv), { other: lst(sh.D), otherName: 'domain', wrong: [{ is: lst(bad), code: 'sq-neg', hint: 'Check the negative inputs: ' + t('(' + sh.D[0] + ')^{2}=' + sh.D[0] * sh.D[0]) + ', which is positive.' }] });
          var chk = function (resp) {
            var r0 = base(resp);
            if (r0.v === 'correct') { var raw = String(resp).replace(/\\left|\\right|\\lbrace|\\rbrace|\\\{|\\\}|[{}]/g, '').split(',').map(numVal).filter(function (v) { return v != null; }); if (raw.length > Rv.length) return form('set-repeat', 'Right values — but list each output only <b>once</b>, even when two inputs give it.'); }
            return r0;
          };
          var p = B.math('(a) State the range of ' + t('g') + '.', chk, lst(Rv), sh.D.map(function (x) { return t('g(' + x + ')=' + sh.a + '(' + x + ')^{2}' + (sh.c < 0 ? '' : '+') + sh.c + '=' + sh.g(x)); }).join('<br>') + '<br>Listing each output once: ' + t('R=' + lst(Rv)),
            ['Substitute each value in the domain into the rule.', 'Two different inputs can give the same output — write that output only once.'], 'range of g(x)=ax^2+c on a set', { keys: 'set', vars: ['x'], placeholder: 'e.g. {1, 3, 5}' });
          p.bad = [lst(bad), lst(sh.D)];
          return p;
        } },
        { id: '5b', level: 'PRG', make: function (r, sh) {
          var b = sh.g(sh.m);
          return B.valueSet('(b) Solve the equation ' + t('g(x)=' + b) + '.', [-sh.m, sh.m], { v: 'x' },
            t(lin([[sh.a, 'x^{2}'], [sh.c, '']]) + '=' + b) + '<br>' + t(sh.a + 'x^{2}=' + (b - sh.c)) + '<br>' + t('x^{2}=' + sh.m * sh.m) + '<br>' + t('x=\\pm ' + sh.m) + '. Both are in the domain, so ' + t('x=-' + sh.m) + ' or ' + t('x=' + sh.m) + '.',
            ['Set the rule equal to ' + t(b) + ' and solve for ' + t('x') + '.', 'A square has two square roots.'], 'solve g(x)=b, two roots');
        } }] },
      /* ---------------- Q6 ---------------- */
      { num: '6', shared: lineShared, stem: function (sh) { return 'Consider the graph of the linear function ' + t('r') + ' shown below. (Each grid line on the vertical axis is ' + t(sh.m) + (sh.m === 1 ? ' unit' : ' units') + '.)' + sh.fig; }, parts: [
        { id: '6a', sub: 'a i', level: 'EMG', make: function (r, sh) {
          var items = sh.rows.map(function (row) {
            if (row[0] === 'x') { var x = row[1], v = sh.f(x); return { f: { label: t('x=' + x) + ':', name: 'r(' + x + ')', before: t('r(' + x + ')=') }, k: nf(v), c: K.number(v, function (u) { if (same(u, cl((x - sh.b) / sh.m)) && sh.m !== 1) return { code: 'read-reverse', hint: 'For ' + t('r(' + x + ')') + ', start at ' + t(x) + ' on the <b>horizontal</b> axis and read up or down.' }; if (sh.m > 1 && same(u * sh.m, v)) return { code: 'read-scale', hint: 'Each grid line on the vertical axis is ' + t(sh.m) + ' units.' }; return null; }) }; }
            var y = row[1], xv = cl((y - sh.b) / sh.m);
            return { f: { label: t('r(x)=' + y) + ':', name: 'x for r(x)=' + y, before: t('x=') }, k: nf(xv), c: K.number(xv, function (u) { if (same(u, sh.f(y))) return { code: 'read-reverse', hint: t('r(x)=' + y) + ' gives the <b>output</b> ' + t(y) + ': start at ' + t(y) + ' on the vertical axis and read across.' }; return null; }) };
          });
          return fieldsOf('(a) Complete the table: fill in the missing ' + t('x') + ' or ' + t('r(x)') + ' value in each row.', items, sh.rows.map(function (row) { return row[0] === 'x' ? t('r(' + row[1] + ')=' + sh.f(row[1])) : t('r(' + nf((row[1] - sh.b) / sh.m) + ')=' + row[1]); }).join(', '),
            'The line passes through ' + t(ptT([0, sh.b])) + ' and rises ' + t(sh.m) + ' for every ' + t('1') + ' to the right, so ' + t('r(x)=' + lin([[sh.m, 'x'], [sh.b, '']])) + ' (check: ' + t('r(' + sh.x0 + ')=0') + ').<br>' + sh.rows.map(function (row) { return row[0] === 'x' ? t('r(' + row[1] + ')=' + sh.f(row[1])) : t('r(x)=' + row[1]) + ' at ' + t('x=' + nf((row[1] - sh.b) / sh.m)); }).join('<br>'),
            ['When ' + t('x') + ' is given, read up or down to the line. When ' + t('r(x)') + ' is given, read across from the vertical axis.'], 'table from graph of r');
        } },
        { id: '6b', sub: 'a ii', level: 'LIM', make: function (r, sh) {
          var pr = sh.rows.map(function (row) { return row[0] === 'x' ? [row[1], sh.f(row[1])] : [cl((row[1] - sh.b) / sh.m), row[1]]; });
          return B.pairs('(a) Write the ordered pair for each row of the table.', pr, {}, pr.map(function (p) { return t(ptT(p)); }).join(', '), ['Each row gives one point (' + t('x') + ', ' + t('r(x)') + ').'], 'pairs from table of r');
        } },
        { id: '6c', sub: 'b', level: 'EMG', make: function (r, sh) {
          var y = sh.f(sh.Xs);
          return B.number('(b) Use the graph to solve ' + t('r(x)=' + y) + '.', sh.Xs, function (u) { if (same(u, sh.f(y))) return { code: 'ev-instead', hint: 'You found ' + t('r(' + y + ')') + '. Here ' + t(y) + ' is the <b>output</b>: start at ' + t(y) + ' on the vertical axis and read across to the line.' }; return null; },
            'Read across at height ' + t(y) + ': the line reaches it once, at ' + t('x=' + sh.Xs) + ' (check: ' + t(sh.m + '(' + sh.Xs + ')' + (sh.b < 0 ? '' : '+') + sh.b + '=' + y) + ').', ['Start on the vertical axis at ' + t(y) + '.'], 'solve r(x)=b', { before: t('x=') });
        } },
        { id: '6d', sub: 'b ii', level: 'EMG', make: function (r, sh) {
          return mc(r, '(b) Why does this equation have exactly one solution, unlike the zigzag graph in Question 4?', [
            { html: 'The graph of ' + t('r') + ' is a straight line that keeps rising, so each height is reached by exactly one input.', right: true },
            { html: 'Because ' + t('r') + ' is a function, and a function can only have one input for each output.', why: 'The zigzag in Question 4 is also a function, yet one height was reached three times. A function allows one <b>output</b> per input — not one input per output.' },
            { html: 'Because the arrows show the line goes on forever.', why: 'The arrows tell you about the domain. What matters is whether the graph ever doubles back to the same height.' },
            { html: 'Because the line crosses the ' + t('x') + '-axis only once.', why: 'That only counts heights of ' + t('0') + '. Think about why <b>every</b> height is reached only once.' }],
            'A line that always rises never comes back to a height it has already passed, so a horizontal line meets it exactly once. The zigzag doubles back, so one height can be reached two or three times.', ['Draw horizontal lines across both graphs. How many times does each one cross?'], 'why linear has one solution');
        } }] },
      /* ---------------- Q7 ---------------- */
      { num: '7', shared: function (r) { var a, b; do { a = r.pick([11, 11, 7, 10, 13, 14, 17]); b = r.int(2, 7); } while (a % b === 0); return { a: a, b: b, k: r.pick([4, 4, 2, 3, 5, 6]) }; },
        stem: function (sh) { return 'Given that ' + t('f(x)=' + lin([[sh.a, ''], [-sh.b, 'x']])) + ','; }, parts: [
        { id: '7a', level: 'BEG', make: function (r, sh) {
          var v = sh.a + sh.b * sh.k;
          return B.number('(a) evaluate ' + t('f(-' + sh.k + ')') + '.', v, function (u) { if (same(u, sh.a - sh.b * sh.k)) return { code: 'ev-sign', hint: t('-' + sh.b + '(-' + sh.k + ')=+' + sh.b * sh.k) + ': a negative times a negative is positive.' }; return null; },
            t('f(-' + sh.k + ')=' + sh.a + '-' + sh.b + '(-' + sh.k + ')') + '<br>' + t('=' + sh.a + '+' + sh.b * sh.k + '=' + v), ['Replace every ' + t('x') + ' with ' + t('(-' + sh.k + ')') + ', brackets and all.'], 'evaluate f(-k)');
        } },
        { id: '7b', level: 'ADV', make: function (r, sh) {
          var a = sh.a, b = sh.b;
          var p = PL && K.P.poly('(b) find the value of ' + t('f(t)+f(-t)') + '.', PL.num(2 * a), { vars: ['t'], wrong: [
            { is: P(lin([[2 * a, ''], [-2 * b, 't']])), code: 'ft-sign', hint: t('f(-t)=' + a + '-' + b + '(-t)=' + a + '+' + b + 't') + '. The two minus signs multiply.' },
            { is: P(lin([[2 * a, ''], [2 * b, 't']])), code: 'ft-sign', hint: 'Check ' + t('f(t)') + ': it is ' + t(a + '-' + b + 't') + '. Then ' + t('f(-t)=' + a + '+' + b + 't') + '.' },
            { is: PL.num(0), code: 'ft-zero', hint: 'Only the ' + t('t') + '-terms cancel. What is left from the two constant terms?' }] },
            t('f(t)=' + a + '-' + b + 't') + ' and ' + t('f(-t)=' + a + '-' + b + '(-t)=' + a + '+' + b + 't') + '.<br>' + t('f(t)+f(-t)=(' + a + '-' + b + 't)+(' + a + '+' + b + 't)=' + 2 * a) + ' — the ' + t('\\pm ' + b + 't') + ' terms cancel for every ' + t('t') + '.',
            ['Write ' + t('f(t)') + ' by replacing ' + t('x') + ' with ' + t('t') + ', and ' + t('f(-t)') + ' by replacing ' + t('x') + ' with ' + t('(-t)') + '. Then add.'], 'f(t)+f(-t)');
          p.bad = [String(2 * a) + '-' + 2 * b + 't', '0'];
          return p;
        } },
        { id: '7c', level: 'PRG', make: function (r, sh) {
          var a = sh.a, b = sh.b;
          var fl = [{ label: t('x') + '-intercept: ' + t('x='), name: 'x-intercept', mode: 'math', keys: 'fraction' }, { label: t('y') + '-intercept: ' + t('y='), name: 'y-intercept', mode: 'math', keys: 'fraction' }];
          var p = BF('(c) calculate the ' + t('x') + '-intercept and the ' + t('y') + '-intercept on the graph of ' + t('f') + '.', fl,
            [K.fraction([a, b], { decimalOk: true, diag: function (u) { if (same(u, a)) return { code: 'xint-yint', hint: 'That is the ' + t('y') + '-intercept. For the ' + t('x') + '-intercept, solve ' + t('f(x)=0') + '.' }; return null; } }),
              K.value(a, { diag: function (u) { if (same(u, a / b)) return { code: 'xint-yint', hint: 'That is the ' + t('x') + '-intercept. The ' + t('y') + '-intercept is ' + t('f(0)') + '.' }; return null; } })],
            [frT(a, b), String(a)], t('x') + '-int ' + t(frT(a, b)) + ', ' + t('y') + '-int ' + t(a),
            t('x') + '-intercept: ' + t(a + '-' + b + 'x=0\\Rightarrow ' + b + 'x=' + a + '\\Rightarrow x=' + frT(a, b)) + '.<br>' + t('y') + '-intercept: ' + t('f(0)=' + a) + '.',
            ['The ' + t('x') + '-intercept is where the output is ' + t('0') + ': solve ' + t('f(x)=0') + '.', 'The ' + t('y') + '-intercept is ' + t('f(0)') + '.'], 'intercepts of f(x)=a-bx');
          return p;
        } }] },
      /* ---------------- Q8 ---------------- */
      { num: '8', shared: scaledShared, stem: function (sh) { return 'The graph of a function ' + t(sh.n) + ' is shown below. <i>Each grid line represents ' + t(sh.k) + ' units on both axes.</i>' + sh.fig; }, parts: [
        { id: '8a', sub: 'a i', level: 'PRG', make: function (r, sh) {
          var n = sh.n, g = sh.mk, k = sh.k, real = [g[0] * k, g[1] * k];
          return mc(r, 'A student is asked to make a statement about the marked point on the graph. The student states that ' + t(sh.bad + '(' + g[0] + ')=' + g[1]) + '. Which describes the <b>two</b> errors?', [
            { html: 'The function is named ' + t(n) + ', not ' + t(sh.bad) + '; and the point was read by counting grid squares instead of using the scale of ' + t(k) + ' units per square.', right: true },
            { html: 'The function is named ' + t(n) + ', not ' + t(sh.bad) + '; and the input and output are in the wrong order.', why: 'The order is right — the ' + t('x') + '-coordinate is in the brackets. Look at the numbers on the axes instead.' },
            { html: 'The point was read by counting grid squares; and the input and output are in the wrong order.', why: 'The order is right. Look at the letter the student used for the function.' },
            { html: 'There is only one error: the statement should be ' + t(n + '(' + g[1] + ')=' + g[0]) + '.', why: 'In ' + t(n + '(a)=b') + ' the input goes in the brackets, so the order was right. Check the name and the scale.' }],
            'The graph is of ' + t(n) + ', so the statement must use ' + t(n) + '. And each grid square is ' + t(k) + ' units, so the point ' + sqT(g) + ' is ' + t(ptT(real)) + '.', ['Check two things: the letter, and the numbers on the axes.'], 'two errors in a statement');
        } },
        { id: '8b', sub: 'a ii', level: 'PRG', make: function (r, sh) {
          var n = sh.n, g = sh.mk, k = sh.k, real = [g[0] * k, g[1] * k];
          var p = B.math('Write a correct statement using function notation about the marked point.', stmtChk(n, real[0], real[1], { grid: g, scale: k }), n + '(' + real[0] + ')=' + real[1],
            'The marked point is ' + sqT(g) + '. With ' + t(k) + ' units per square it is ' + t(ptT(real)) + ', so ' + t(n + '(' + real[0] + ')=' + real[1]) + '.',
            ['Multiply each grid count by ' + t(k) + '.'], 'correct statement on scaled graph', { keys: EQK, vars: [n], placeholder: 'e.g. ' + n + '(2) = 5' });
          p.bad = [n + '(' + g[0] + ')=' + g[1], sh.bad + '(' + real[0] + ')=' + real[1], n + '(' + real[1] + ')=' + real[0]];
          return p;
        } },
        { id: '8c', sub: 'b', level: 'EMG', make: function (r, sh) {
          var bs = [sh.lo, sh.hi], n = sh.n;
          var fl = bs.map(function (b, i) { return solField(['i)', 'ii)'][i] + ' ' + t(n + '(x)=' + b) + ':', 'x'); });
          return BF('(b) Give the solution to the following equations.', fl, bs.map(function (b) { return solsChk(pwSols(sh.V, b).pts, { b: b, graph: true, scale: sh.k }); }), bs.map(function (b) { return solsKey(pwSols(sh.V, b).pts); }),
            bs.map(function (b, i) { return ['i)', 'ii)'][i] + ' ' + t(solsKey(pwSols(sh.V, b).pts)); }).join('<br>'),
            'Read across at each height (remember each grid line is ' + t(sh.k) + '):<br>' + bs.map(function (b) { return t(n + '(x)=' + b) + ' at ' + t(solsKey(pwSols(sh.V, b).pts)) + (b === sh.lo ? ' (the two low points)' : ' (the two high points)'); }).join('<br>'),
            ['Start on the vertical axis and read across; count every point at that height.'], 'solve on scaled zigzag');
        } },
        { id: '8d', sub: 'c', level: 'EMG', make: function (r, sh) {
          var n = sh.n, xs = [-6 * sh.k, 6 * sh.k];
          var items = xs.map(function (x, i) { var v = pwAt(sh.V, x); return { f: { label: ['i)', 'ii)'][i] + ' ' + t(n + '(' + x + ')='), name: n + '(' + x + ')', mode: 'math', keys: 'fraction' }, k: nf(v), c: K.value(v, { diag: function (u) { if (same(u * sh.k, v) && sh.k !== 1) return { code: 'read-scale', hint: 'Each grid line is ' + t(sh.k) + ' units on the vertical axis too.' }; return null; } }) }; });
          return fieldsOf('(c) State the value of', items, xs.map(function (x) { return t(n + '(' + x + ')=' + pwAt(sh.V, x)); }).join(', '),
            'These are the two endpoints: ' + xs.map(function (x) { return t(n + '(' + x + ')=' + pwAt(sh.V, x)); }).join(' and ') + '.', ['Start on the horizontal axis at each input and read up or down.'], 'endpoint values on scaled graph');
        } },
        { id: '8e', sub: 'd', level: 'EMG', outcome: 'RF2', make: function (r, sh) {
          var n = sh.n, k = sh.k;
          return drPart('(d) State the domain and range of the function.', { dv: 'x', fname: n, D: [-6 * k, 6 * k], R: [sh.lo, sh.hi],
            dW: [{ is: bld('x', -6, 6), code: 'read-scale', hint: 'Use the scale: each grid line is ' + t(k) + ' units.' }], rW: [{ is: bld('y', -2, 6), code: 'read-scale', hint: 'Use the scale: each grid line is ' + t(k) + ' units.' }] },
            t(bld('x', -6 * k, 6 * k)) + '<br>' + t('\\{' + n + '(x)\\mid ' + cond(n + '(x)', sh.lo, sh.hi) + ',\\ ' + n + '(x)\\in\\mathbb{R}\\}'), ['Find the leftmost and rightmost points, then the lowest and highest — and use the scale.'], 'domain/range scaled zigzag');
        } },
        { id: '8f', sub: 'e i', level: 'PRG', make: function (r, sh) {
          return mc(r, '(e) The equation ' + t(sh.n + '(a)=b') + ' has <b>exactly two</b> solutions. How can you use the graph to find suitable values of ' + t('a') + ' and ' + t('b') + '?', [
            { html: 'Draw horizontal lines at different heights ' + t('b') + ': any height strictly between the lowest and highest values meets the graph three times, so only the highest and the lowest heights give exactly two.', right: true },
            { html: 'Draw vertical lines at different values of ' + t('a') + ' and look for one that meets the graph twice.', why: 'A vertical line meets the graph of a function only once. Solving ' + t(sh.n + '(a)=b') + ' for ' + t('a') + ' means reading <b>across</b> at height ' + t('b') + '.' },
            { html: 'Any height between the lowest and highest values works, because the graph goes up and down.', why: 'Try one: a horizontal line through the middle crosses all three segments — that is three solutions.' },
            { html: 'Use ' + t('b=0') + ', because the ' + t('x') + '-intercepts always come in pairs.', why: 'Count the ' + t('x') + '-intercepts on this graph: there are three.' }],
            'Draw a horizontal line at height ' + t('b') + ' and count where it meets the graph. Every height strictly between ' + t(sh.lo) + ' and ' + t(sh.hi) + ' crosses all three segments (three solutions); only ' + t('b=' + sh.hi) + ' and ' + t('b=' + sh.lo) + ' give exactly two.',
            ['Solving ' + t(sh.n + '(a)=b') + ' means reading across at height ' + t('b') + '. Try a few heights.'], 'exactly two solutions method');
        } },
        { id: '8g', sub: 'e ii', level: 'ADV', make: function (r, sh) {
          var n = sh.n, hiS = pwSols(sh.V, sh.hi).pts, loS = pwSols(sh.V, sh.lo).pts;
          var fl = [{ label: 'First answer: ' + t('b='), name: 'first b', mode: 'math', keys: 'solutions', vars: ['a'] }, { label: t('a='), name: 'first a values', mode: 'math', keys: 'solutions', vars: ['a'], placeholder: 'e.g. a = 3, a = -5' },
            { label: 'Second answer: ' + t('b='), name: 'second b', mode: 'math', keys: 'solutions', vars: ['a'] }, { label: t('a='), name: 'second a values', mode: 'math', keys: 'solutions', vars: ['a'], placeholder: 'e.g. a = 3, a = -5' }];
          var check = function (resp) {
            resp = resp || [];
            if (resp.some(function (x) { return !String(x || '').trim(); })) return form('incomplete', 'Fill in all four boxes: two values of ' + t('b') + ', each with its two values of ' + t('a') + '.');
            var b1 = numVal(clean(resp[0]).replace(/^b\s*=/, '')), b2 = numVal(clean(resp[2]).replace(/^b\s*=/, ''));
            if (b1 == null || b2 == null) return form('unreadable', 'Each ' + t('b') + ' box needs a single number.');
            if (same(b1, b2)) return wrong('two-b', 'Give two <b>different</b> values of ' + t('b') + '.');
            var res = [[b1, resp[1]], [b2, resp[3]]];
            for (var i = 0; i < 2; i++) {
              var b = res[i][0];
              if (!same(b, sh.hi) && !same(b, sh.lo)) { var c = pwSols(sh.V, b).pts.length; return wrong('two-b', t(n + '(a)=' + nf(b)) + ' has ' + (c === 0 ? 'no solutions' : c === 1 ? 'only one solution' : c + ' solutions') + ': draw the horizontal line at height ' + t(nf(b)) + ' and count.'); }
              var rr = K.valueSet(same(b, sh.hi) ? hiS : loS, { v: 'a' })(res[i][1]);
              if (rr.v !== 'correct') return { v: rr.v, code: rr.code, hint: '<b>' + t('b=' + nf(b)) + ':</b> ' + (rr.hint || 'Check the values of ' + t('a') + ' where the graph is at height ' + t(nf(b)) + '.') };
            }
            return ok();
          };
          var p = { prompt: 'Now give two sets of answers: two values of ' + t('b') + ' for which ' + t(n + '(a)=b') + ' has exactly two solutions, and the two values of ' + t('a') + ' for each.', input: { type: 'fields', fields: phFix(fl) }, check: check,
            key: [String(sh.hi), solsKey(hiS, 'a'), String(sh.lo), solsKey(loS, 'a')], answer: t('b=' + sh.hi) + ': ' + t(solsKey(hiS, 'a')) + '<br>' + t('b=' + sh.lo) + ': ' + t(solsKey(loS, 'a')),
            solution: 'Only the highest and lowest heights are reached exactly twice:<br>' + t('b=' + sh.hi) + ' with ' + t(solsKey(hiS, 'a')) + '<br>' + t('b=' + sh.lo) + ' with ' + t(solsKey(loS, 'a')),
            hints: ['Look at the highest and the lowest points of the graph.'], text: 'two sets s(a)=b' };
          p.good = [[String(sh.lo), solsKey(loS, 'a'), String(sh.hi), solsKey(hiS, 'a')]];
          p.bad = [[String(sh.hi), solsKey(hiS, 'a'), String(cl((sh.hi + sh.lo) / 2)), '0'], [String(sh.hi / sh.k), solsKey(hiS, 'a'), String(sh.lo), solsKey(loS, 'a')]];
          return p;
        } }] },
      /* ---------------- Q9 ---------------- */
      { num: '9', section: 'Part C — Extension, multiple choice and numerical response', stem: '<i>(Extension)</i>', parts: [
        { id: '9', level: 'MAS', make: function (r) {
          var sq = r.pick([25, 25, 9, 16, 36]), c = r.pick([2, 2, 3, 4, 5, 6, 7]), d = c - sq, a = sq * sq, q = Math.sqrt(sq);
          return B.number('Consider the function ' + t('k(x)=' + c + '-x^{2}') + '. Given that ' + t('k\\!\\left(a^{1/4}\\right)=' + d) + ', calculate the value of ' + t('a') + '.', a, function (u) {
            if (same(u, sq)) return { code: 'ext-half', hint: 'You found ' + t('a^{1/2}=' + sq) + '. Square it to get ' + t('a') + '.' };
            if (same(u, q)) return { code: 'ext-quarter', hint: 'That is ' + t('a^{1/4}') + ', the input. The question asks for ' + t('a') + ' itself.' };
            if (same(u, (c + d) * (c + d))) return { code: 'ext-sign', hint: 'Check your signs: ' + t(c + '-a^{1/2}=' + d) + ' gives ' + t('a^{1/2}=' + c + '-(' + d + ')') + '.' };
            return null;
          }, t('k\\!\\left(a^{1/4}\\right)=' + c + '-\\left(a^{1/4}\\right)^{2}=' + c + '-a^{1/2}') + '<br>' + t(c + '-a^{1/2}=' + d + '\\Rightarrow a^{1/2}=' + sq + '\\Rightarrow a=' + a) + '<br><i>Check:</i> ' + t(a + '^{1/4}=' + q) + ' and ' + t('k(' + q + ')=' + c + '-' + sq + '=' + d) + ' ✓',
          ['Replace ' + t('x') + ' with ' + t('a^{1/4}') + ' in the rule. What is ' + t('\\left(a^{1/4}\\right)^{2}') + '?', 'Solve for ' + t('a^{1/2}') + ' first, then square.'], 'k(a^(1/4)) = d');
        } }] },
      { num: '10', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '10', level: 'BEG', make: function (r) {
          var m = r.pick([5, 5, 2, 3, 4, 6, 7]), b = r.pick([1, 1, 2, 3, 4, 6, 8].filter(function (x) { return x !== m; })), nm = r.pick(['w', 'w', 'g', 'h']);
          return mc(r, 'The graph of the function ' + t(nm + '(x)=' + lin([[m, 'x'], [b, '']]) + ',\\ x\\in\\mathbb{R}') + ', intersects the ' + t('y') + '-axis at', [
            { html: t('(0,\\ 0)'), why: 'Substitute ' + t('x=0') + ': ' + t(nm + '(0)=' + b) + ', not ' + t('0') + '.' },
            { html: t('(0,\\ ' + b + ')'), right: true },
            { html: t('(0,\\ ' + m + ')'), why: t(m) + ' is the rate of change (slope). The ' + t('y') + '-intercept is the output when ' + t('x=0') + '.' },
            { html: t('\\left(' + frT(-b, m) + ',\\ 0\\right)'), why: 'That is where the graph crosses the ' + t('x') + '-axis (the ' + t('x') + '-intercept).' }],
            'The ' + t('y') + '-axis is where ' + t('x=0') + ': ' + t(nm + '(0)=' + m + '(0)+' + b + '=' + b) + ', so the graph crosses at ' + t('(0,\\ ' + b + ')') + '.', ['On the ' + t('y') + '-axis, ' + t('x=0') + '.'], 'y-intercept of mx+b');
        } }] },
      { num: '11', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '11', level: 'EMG', make: function (r) {
          var nm = r.pick(['T', 'T', 'G', 'M']), a = r.pick([8, 8, 2, 5, 6, 9]), b = r.pick([-3, -3, -1, -4, 7, 4].filter(function (x) { return x !== a; }));
          var dOk = r.chance(0.5), pOk = r.chance(0.4);
          var dev = dOk ? 'When the domain value is ' + t(a) + ', the related range value is ' + t(b) + '.' : 'When the domain value is ' + t(b) + ', the related range value is ' + t(a) + '.';
          var pri = 'The point ' + t(pOk ? ptT([a, b]) : ptT([b, a])) + ' is on the graph of ' + t('y=' + nm + '(x)') + '.';
          var opts = [{ html: 'Both statements are correct.', right: dOk && pOk }, { html: 'Both statements are incorrect.', right: !dOk && !pOk }, { html: 'Devon is correct and Priya is incorrect.', right: dOk && !pOk }, { html: 'Priya is correct and Devon is incorrect.', right: !dOk && pOk }];
          var dWhy = dOk ? 'Devon is right: the input ' + t(a) + ' is a domain value and the output ' + t(b) + ' is a range value.' : 'Check Devon: in ' + t(nm + '(' + a + ')=' + b) + ' the domain value (input) is ' + t(a) + ', not ' + t(b) + '.';
          var pWhy = pOk ? 'Priya is right: input first, so ' + t(ptT([a, b])) + ' is on the graph.' : 'Check Priya: an ordered pair is (input, output), so the point is ' + t(ptT([a, b])) + ', not ' + t(ptT([b, a])) + '.';
          opts.forEach(function (o) { if (!o.right) o.why = (/Devon is correct|Both statements are correct/.test(o.html) !== dOk ? dWhy : pWhy); });
          return mc(r, 'Function ' + t(nm) + ' is such that ' + t(nm + '(' + a + ')=' + b) + '. Devon states: “' + dev + '” Priya states: “' + pri + '” Which of the following is true?', opts,
            t(nm + '(' + a + ')=' + b) + ' means the input ' + t(a) + ' gives the output ' + t(b) + ', so ' + t(ptT([a, b])) + ' lies on the graph. ' + (dOk ? 'Devon restates this correctly' : 'Devon reverses domain and range') + '; ' + (pOk ? 'Priya’s point is correct.' : 'Priya reverses the coordinates.'),
            ['In ' + t(nm + '(a)=b') + ': ' + t('a') + ' is the input (domain value), ' + t('b') + ' is the output (range value).'], 'Devon and Priya T(a)=b', true);
        } }] },
      { num: '12', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '12', level: 'PRG', make: function (r) {
          var m, j, a;
          for (var g = 0; g < 100; g++) { m = r.pick([8, 8, 2, 4, 5]); j = r.int(m + 1, 9 * m); a = cl(j / m); if (j % m !== 0 && String(a).length <= 4) break; }
          if (r.chance(0.3)) { m = 8; j = 20; a = 2.5; }
          return B.nr('Consider the graph of the function ' + t('k(x)=' + m + 'x-' + j) + '. The ' + t('x') + '-intercept of the graph of ' + t('k') + ' is located at ' + t('(a,\\ 0)') + '. The value of ' + t('a') + ' is ________.', a, function (u) {
            if (same(u, -a)) return { code: 'sign', hint: 'Check the sign: ' + t(m + 'a-' + j + '=0') + ' gives ' + t(m + 'a=+' + j) + '.' };
            if (same(u, cl(m / j))) return { code: 'nr-flip', hint: 'Divide the other way: ' + t('a=' + j + '\\div ' + m) + '.' };
            if (same(u, j)) return { code: 'nr-const', hint: 'Set ' + t('k(a)=0') + ' and solve for ' + t('a') + '.' };
            return null;
          }, t(m + 'a-' + j + '=0\\Rightarrow ' + m + 'a=' + j + '\\Rightarrow a=' + a), ['At the ' + t('x') + '-intercept the output is ' + t('0') + ': solve ' + t('k(a)=0') + '.'], 'x-intercept NR');
        } }] },
      /* ---------------- Q13 seedling ---------------- */
      { num: '13', section: 'Part D — Models in function notation', shared: seedShared,
        stem: function (sh) { return 'A greenhouse seedling is treated with a special nutrient solution. The seedling’s height is modelled by ' + t(sh.rule) + ', where ' + t('H(t)') + ' is the height of the seedling, in cm, ' + t('t') + ' days after treatment begins.'; }, parts: [
        { id: '13a', level: 'PRG', outcome: 'RF1', make: function (r, sh) {
          var T = sh.T, top = sh.H(T), alt = cl(sh.c + T * sh.q / sh.p), ym = Math.ceil((top + 5) / 10) * 10;
          var I = padIn({ x: [0, T + sh.q], y: [0, ym], sx: sh.q, sy: 5, lx: 2 * sh.q, ly: 10, v: 't', w: 'H(t)', xTitle: 't (days)', yTitle: 'H(t) (cm)' });
          var S = segSketch({ f: sh.H, X0: 0, X1: T, sx: sh.q, sy: 5, name: 'H', v: 't',
            start0: 'At ' + t('t=0') + ' the seedling is already ' + t(sh.c) + ' cm tall: ' + t('H(0)=' + sh.c) + ', so the graph starts on the vertical axis at ' + t(sh.c) + ', not at the origin.',
            endX: 'The model stops at maturity, ' + t('t=' + T) + ' days: end the segment there.', arrow: 'The model stops at maturity, ' + t('t=' + T) + ': end the graph with a solid dot there, not an arrow.',
            dir: 'The seedling grows, so the graph rises from ' + t('H(0)=' + sh.c) + ' to ' + t('H(' + T + ')=' + top) + '.' });
          var p = B.graph('(a) The seedling reaches maturity ' + t(T) + ' days after treatment begins (see part (f)). Sketch the graph of the function from treatment to maturity.' + LINE_HELP, I, S.check, S.key,
            t('H(0)=' + sh.c) + ' and ' + t('H(' + T + ')=\\frac{' + sh.p + '}{' + sh.q + '}(' + T + ')+' + sh.c + '=' + top) + '. The graph is a segment that starts at ' + t('(0,\\ ' + sh.c + ')') + ' and rises ' + t(sh.p) + ' cm every ' + t(sh.q) + ' days, ending with a solid dot at ' + t(ptT([T, top])) + ' (maturity).',
            ['Find ' + t('H(0)') + ' and ' + t('H(' + T + ')') + ' first: those are the two ends.', 'The domain runs from ' + t('t=0') + ' to maturity, ' + t('t=' + T) + '.'], 'sketch seedling');
          p.bad = [drawing([seg([0, 0], [T, snapTo(top - sh.c, 5)])]), drawing([seg(S.A, [T + sh.q, snapTo(sh.H(T + sh.q), 5)], 'closed', 'arrow')]), drawing([seg([0, snapTo(top, 5)], [T, snapTo(sh.c, 5)])]),
            drawing([seg(S.A, [T + sh.q, snapTo(sh.H(T + sh.q), 5)])]), drawing([seg(S.A, S.B, 'closed', 'open')])];
          if (Math.abs(snapTo(alt, 5) - S.B[1]) > 1e-9 && alt <= ym) p.bad.push(drawing([seg(S.A, [T, snapTo(alt, 5)])]));
          return p;
        } },
        { id: '13b', level: 'BEG', make: function (r, sh) {
          var x = 2 * sh.q, v = sh.H(x);
          return B.number('(b) Determine the value of ' + t('H(' + x + ')') + '.', v, function (u) { if (same(u, cl((x - sh.c) * sh.q / sh.p))) return { code: 'solve-instead', hint: 'You solved ' + t('H(t)=' + x) + '. ' + t('H(' + x + ')') + ' means substitute ' + t('t=' + x) + '.' }; return null; },
            t('H(' + x + ')=\\frac{' + sh.p + '}{' + sh.q + '}(' + x + ')+' + sh.c + '=' + 2 * sh.p + '+' + sh.c + '=' + v) + ' cm', ['Substitute ' + t('t=' + x) + ' into the rule.'], 'H(2q)', { after: 'cm' });
        } },
        { id: '13c', level: 'EMG', make: function (r, sh) {
          var x = 2 * sh.q, v = sh.H(x);
          return mc(r, '(c) What is the meaning of ' + t('H(' + x + ')=' + v) + '?', [
            { html: t(x) + ' days after treatment begins, the seedling is ' + t(v) + ' cm tall.', right: true },
            { html: t(v) + ' days after treatment begins, the seedling is ' + t(x) + ' cm tall.', why: 'Input and output are swapped: the input ' + t(x) + ' is the number of days, the output ' + t(v) + ' is the height.' },
            { html: 'The seedling grows ' + t(v) + ' cm every ' + t(x) + ' days.', why: t('H(' + x + ')') + ' is the height at one moment, not a rate of growth.' },
            { html: 'The seedling grows ' + t(v) + ' cm in ' + t(x) + ' days after treatment.', why: 'It started at ' + t(sh.c) + ' cm, so ' + t(v) + ' cm is its total height, not how much it grew.' }],
            t('H(t)') + ' is the height (cm) after ' + t('t') + ' days, so ' + t('H(' + x + ')=' + v) + ' means: ' + t(x) + ' days after treatment begins, the seedling is ' + t(v) + ' cm tall.', ['Which number is the input (days) and which is the output (height)?'], 'meaning of H(a)=b');
        } },
        { id: '13d', level: 'BEG', make: function (r, sh) {
          var xs = [0, 4 * sh.q, 6 * sh.q];
          var items = xs.map(function (x, i) { var v = sh.H(x); return { f: { label: ['i)', 'ii)', 'iii)'][i] + ' ' + t('H(' + x + ')='), name: 'H(' + x + ')', after: 'cm' }, k: nf(v), c: K.number(v, function (u) { if (x && same(u, cl(sh.p * x / sh.q))) return { code: 'no-fixed', hint: 'Don’t forget to add the starting height ' + t(sh.c) + '.' }; return null; }) }; });
          return fieldsOf('(d) Evaluate the following.', items, xs.map(function (x) { return t('H(' + x + ')=' + sh.H(x)); }).join(', '),
            xs.map(function (x) { return t('H(' + x + ')=\\frac{' + sh.p + '}{' + sh.q + '}(' + x + ')+' + sh.c + '=' + sh.H(x)) + ' cm'; }).join('<br>'), ['Substitute each value of ' + t('t') + '.'], 'evaluate H at three values');
        } },
        { id: '13e', level: 'PRG', make: function (r, sh) {
          var y = 3 * sh.p + sh.c, ans = 3 * sh.q;
          return B.number('(e) How many days will it take for the seedling to reach a height of ' + t(y) + ' cm?', ans, function (u) {
            if (same(u, sh.H(y))) return { code: 'ev-instead', hint: 'You found ' + t('H(' + y + ')') + '. Here ' + t(y) + ' cm is the <b>output</b>: solve ' + t('H(t)=' + y) + '.' };
            if (same(u, cl(y * sh.q / sh.p))) return { code: 'no-fixed', hint: 'Subtract the starting height ' + t(sh.c) + ' before dividing by the rate.' };
            if (same(u, cl((y - sh.c) * sh.p / sh.q))) return { code: 'nr-flip', hint: 'To undo multiplying by ' + t('\\frac{' + sh.p + '}{' + sh.q + '}') + ', multiply by ' + t('\\frac{' + sh.q + '}{' + sh.p + '}') + '.' };
            return null;
          }, t('\\frac{' + sh.p + '}{' + sh.q + '}t+' + sh.c + '=' + y) + '<br>' + t('\\frac{' + sh.p + '}{' + sh.q + '}t=' + (y - sh.c)) + '<br>' + t('t=' + (y - sh.c) + '\\cdot\\frac{' + sh.q + '}{' + sh.p + '}=' + ans) + ' days',
          ['The height is the output: solve ' + t('H(t)=' + y) + '.'], 'solve H(t)=b', { after: 'days' });
        } },
        { id: '13f', level: 'PRG', outcome: 'RF2', make: function (r, sh) {
          var T = sh.T;
          return drPart('(f) The seedling reaches maturity ' + t(T) + ' days after treatment begins. State the domain and range of the function ' + t('H(t)') + '.', { dv: 't', fname: 'H', D: [0, T], R: [sh.c, sh.H(T)],
            rW: [{ is: bld('y', 0, sh.H(T)), code: 'dr-from-zero', hint: 'At ' + t('t=0') + ' the seedling is already ' + t(sh.c) + ' cm tall: the range starts at ' + t('H(0)') + '.' }],
            dW: [{ is: bld('t', sh.c, sh.H(T)), code: 'set-swap', hint: 'Those are heights. The domain is the set of times, ' + t('t') + '.' }] },
            'Growth is tracked from ' + t('t=0') + ' to maturity at ' + t('t=' + T) + ', so ' + t('H') + ' rises from ' + t('H(0)=' + sh.c) + ' to ' + t('H(' + T + ')=' + sh.H(T)) + '.<br>' + t(bld('t', 0, T)) + '<br>' + t('\\{H(t)\\mid ' + cond('H(t)', sh.c, sh.H(T)) + ',\\ H(t)\\in\\mathbb{R}\\}'),
            ['The domain runs from the start of treatment to maturity. For the range, find ' + t('H') + ' at both ends.'], 'domain/range seedling');
        } }] },
      /* ---------------- Q14 t-shirts ---------------- */
      { num: '14', shared: shirtShared,
        stem: function (sh) { return 'Fresh Print Co. produces custom t-shirts for local sports teams. The cost of production is modelled by ' + t('C(n)=' + F(sh.Fc) + '+' + sh.rate + 'n') + ', where ' + t('C(n)') + ' is the cost, in dollars, of printing ' + t('n') + ' t-shirts.'; }, parts: [
        { id: '14a', level: 'PRG', outcome: 'RF1', make: function (r, sh) {
          var N = sh.max, top = sh.C(N), SY = 1000, ym = Math.ceil((top + 500) / 1000) * 1000;
          var I = padIn({ x: [0, 900], y: [0, ym], sx: 100, sy: SY, lx: 200, ly: 2000, v: 'n', w: 'C(n)', xTitle: 'n (t-shirts)', yTitle: 'C(n) (dollars)' });
          var S = segSketch({ f: sh.C, X0: 0, X1: N, sx: 100, sy: SY, name: 'C', v: 'n',
            start0: 'Before any shirt is printed the cost is already ' + t('C(0)=' + F(sh.Fc)) + ' dollars (the fixed cost), so the graph starts up the vertical axis, not at the origin.',
            endX: 'The question asks for a maximum of ' + t(N) + ' t-shirts: end the segment at ' + t('n=' + N) + '.', arrow: 'The graph stops at the maximum of ' + t(N) + ' t-shirts: end it with a solid dot, not an arrow.',
            dir: 'Printing more shirts costs more, so the graph rises from ' + t('C(0)=' + F(sh.Fc)) + ' to ' + t('C(' + N + ')=' + F(top)) + '.' });
          var half = snapTo(sh.Fc + sh.rate * N / 2, SY);
          var p = B.graph('(a) Sketch the graph of the function for a maximum of ' + t(N) + ' t-shirts.' + LINE_HELP, I, S.check, S.key,
            t('C(0)=' + F(sh.Fc)) + ' and ' + t('C(' + N + ')=' + F(sh.Fc) + '+' + sh.rate + '(' + N + ')=' + F(top)) + '. The graph is a segment that starts at ' + t('(0,\\ ' + F(sh.Fc) + ')') + ' and rises ' + t('\\$' + sh.rate) + ' per shirt, ending with a solid dot at ' + t('(' + N + ',\\ ' + F(top) + ')') + '. On this grid each end goes on the nearest grid point: ' + t(ptT(S.A)) + ' and ' + t(ptT(S.B)) + '.',
            ['Find ' + t('C(0)') + ' and ' + t('C(' + N + ')') + ': those are the two ends.', 'Read the scales: each grid square is ' + t('100') + ' shirts across and ' + t('\\$1000') + ' up.'], 'sketch t-shirt cost');
          p.bad = [drawing([seg([0, 0], [N, snapTo(sh.rate * N, SY)])]), drawing([seg([0, S.B[1]], [N, S.A[1]])]), drawing([seg(S.A, [900, snapTo(sh.C(900), SY)], 'closed', 'arrow')]), drawing([seg(S.A, [900, snapTo(sh.C(900), SY)])])];
          if (Math.abs(half - S.B[1]) > 1e-9) p.bad.push(drawing([seg(S.A, [N, half])]));
          return p;
        } },
        { id: '14b', level: 'BEG', make: function (r, sh) {
          var v = sh.C(sh.n1);
          return B.number('(b) Determine the value of ' + t('C(' + sh.n1 + ')') + '.', v, function (u) { if (same(u, cl(sh.rate * sh.n1))) return { code: 'no-fixed', hint: 'Add the fixed cost ' + t(F(sh.Fc)) + ' too.' }; return null; },
            t('C(' + sh.n1 + ')=' + F(sh.Fc) + '+' + sh.rate + '(' + sh.n1 + ')=' + F(sh.Fc) + '+' + cl(sh.rate * sh.n1) + '=' + F(v)), ['Substitute ' + t('n=' + sh.n1) + '.'], 'C(n1)', { before: t('\\$') });
        } },
        { id: '14c', level: 'EMG', make: function (r, sh) {
          var v = sh.C(sh.n1);
          return mc(r, '(c) What is the meaning of ' + t('C(' + sh.n1 + ')=' + F(v)) + '?', [
            { html: 'It costs ' + t('\\$' + F(v)) + ' to print ' + t(sh.n1) + ' t-shirts.', right: true },
            { html: 'Each of the ' + t(sh.n1) + ' t-shirts costs ' + t('\\$' + F(v)) + ' to print.', why: t(F(v)) + ' is the cost of the whole order, not of one shirt.' },
            { html: 'For ' + t('\\$' + sh.n1) + ' the company can print ' + t(F(v)) + ' t-shirts.', why: 'Input and output are swapped: the input ' + t(sh.n1) + ' is the number of shirts.' },
            { html: 'Printing ' + t(sh.n1) + ' more t-shirts adds ' + t('\\$' + F(v)) + ' to the cost.', why: 'It includes the fixed cost — it is the total cost of ' + t(sh.n1) + ' shirts.' }],
            t('C(n)') + ' is the cost of ' + t('n') + ' shirts: printing ' + t(sh.n1) + ' t-shirts costs ' + t('\\$' + F(v)) + '.', ['Input: number of shirts. Output: total cost in dollars.'], 'meaning of C(n)=b');
        } },
        { id: '14d', level: 'PRG', make: function (r, sh) {
          return mc(r, '(d) Evaluate ' + t('C(0)') + ' and explain its significance.', [
            { html: t('C(0)=' + F(sh.Fc)) + ': the fixed set-up cost paid before any t-shirt is printed.', right: true },
            { html: t('C(0)=0') + ': printing no t-shirts costs nothing.', why: 'Substitute ' + t('n=0') + ': ' + t(F(sh.Fc) + '+' + sh.rate + '(0)=' + F(sh.Fc)) + '.' },
            { html: t('C(0)=' + F(sh.Fc)) + ': the cost of printing the first t-shirt.', why: 'With ' + t('n=0') + ' no shirts are printed. The first shirt would be ' + t('C(1)') + '.' },
            { html: t('C(0)=' + sh.rate) + ': the cost of each t-shirt.', why: t(sh.rate) + ' is the cost per shirt (the rate). ' + t('C(0)') + ' is the output when ' + t('n=0') + '.' }],
            t('C(0)=' + F(sh.Fc) + '+' + sh.rate + '(0)=' + F(sh.Fc)) + '. It is the fixed cost (screens, artwork) that has to be paid before a single shirt is printed.', ['Substitute ' + t('n=0') + ', then think about what ' + t('n=0') + ' means.'], 'meaning of C(0)');
        } },
        { id: '14e', level: 'PRG', make: function (r, sh) {
          var y = sh.C(sh.n2);
          return B.number('(e) How many t-shirts can be printed for ' + t('\\$' + F(y)) + '?', sh.n2, function (u) {
            if (Math.abs(u - y / sh.rate) < 1) return { code: 'no-fixed', hint: 'Subtract the fixed cost ' + t(F(sh.Fc)) + ' before dividing by ' + t(sh.rate) + '.' };
            if (Math.abs(u - (y + sh.Fc) / sh.rate) < 1) return { code: 'conv-move-sign', hint: 'Subtract ' + t(F(sh.Fc)) + ' from both sides — don’t add it.' };
            if (same(u, sh.C(y))) return { code: 'ev-instead', hint: 'You found ' + t('C(' + F(y) + ')') + '. Here ' + t(F(y)) + ' is the cost (the output): solve ' + t('C(n)=' + F(y)) + '.' };
            return null;
          }, t(F(sh.Fc) + '+' + sh.rate + 'n=' + F(y)) + '<br>' + t(sh.rate + 'n=' + F(y - sh.Fc)) + '<br>' + t('n=' + sh.n2) + ' t-shirts', ['The cost is the output: solve ' + t('C(n)=' + F(y)) + '.'], 'solve C(n)=b', { after: 't-shirts' });
        } },
        { id: '14f', level: 'ADV', make: function (r, sh) {
          var N = sh.N, cN = sh.C(N), rev = cl(N * sh.price), tot = cl(cN + sh.design + sh.other);
          return B.number('(f) Last month the company printed ' + t(N) + ' t-shirts. <b>In addition to the costs in ' + t('C(n)') + '</b>, the company paid ' + t('\\$' + sh.design) + ' for design work and ' + t('\\$' + F(sh.other)) + ' in other monthly costs. If each t-shirt sells for ' + t('\\$' + sh.price.toFixed(2)) + ', how much profit would be made if all the t-shirts are sold?', sh.profit, function (u) {
            if (same(u, rev - cN)) return { code: 'extra-costs', hint: 'Subtract the design work and the other monthly costs too — they are <b>in addition</b> to ' + t('C(' + N + ')') + '.' };
            if (same(u, rev - cN - sh.design) || same(u, rev - cN - sh.other)) return { code: 'profit-one', hint: 'There are two extra costs on top of ' + t('C(' + N + ')') + '. Did you subtract both?' };
            if (same(u, rev)) return { code: 'revenue', hint: 'That is the revenue (money taken in). Profit = revenue − total cost.' };
            if (same(u, -sh.profit)) return { code: 'sign', hint: 'Profit = revenue − cost, not cost − revenue.' };
            return null;
          }, 'Printing cost: ' + t('C(' + N + ')=' + F(sh.Fc) + '+' + sh.rate + '(' + N + ')=' + F(cN)) + '.<br>Total cost: ' + t(F(cN) + '+' + sh.design + '+' + F(sh.other) + '=' + F(tot)) + '. Revenue: ' + t(N + '(' + sh.price.toFixed(2) + ')=' + F(rev)) + '.<br>Profit ' + t('=' + F(rev) + '-' + F(tot) + '=\\$' + F(sh.profit)),
          ['Profit = revenue − total cost. The total cost is ' + t('C(' + N + ')') + ' plus the two extra costs.'], 'profit with extra costs', { before: t('\\$') });
        } }] },
      /* ---------------- Q15 cocoa ---------------- */
      { num: '15', shared: cocoaShared,
        stem: function (sh) { return 'A ski resort tracks how the number of hot cocoa packets sold in its lodge depends on the average daily temperature. The relationship is modelled by ' + t('P(t)=' + sh.A + '-' + sh.Bc + 't') + ', where ' + t('P(t)') + ' is the number of packets sold when the average daily temperature is ' + t('t\\,^{\\circ}\\text{C}') + '.'; }, parts: [
        { id: '15a', level: 'PRG', outcome: 'RF1', make: function (r, sh) {
          var L = -20, top = sh.P(L), z = sh.z, SY = 50, ym = Math.ceil((top + 50) / 100) * 100, xm = Math.ceil(z / 5) * 5 + 5;
          var I = padIn({ x: [-25, xm], y: [0, ym], sx: 5, sy: SY, lx: 10, ly: 100, v: 't', w: 'P(t)', xTitle: 't (°C)', yTitle: 'P(t) (packets)', fq: false });
          var S = segSketch({ f: sh.P, X0: L, X1: z, sx: 5, sy: SY, name: 'P', v: 't',
            startX: 'Start on a cold day, ' + t('t=-20') + ': below-zero temperatures are common at a ski resort, so the graph continues to the <b>left</b> of the vertical axis.',
            endX: 'Stop where sales drop to zero: ' + t('P(t)=0') + ' when ' + t(sh.A + '-' + sh.Bc + 't=0') + ', i.e. ' + t('t=' + nf(z)) + '. End the segment on the ' + t('t') + '-axis at the grid point nearest ' + t('t=' + nf(z)) + '.',
            arrow: 'The graph stops where sales reach zero (' + t('t=' + nf(z)) + ') — a negative number of packets is impossible. End it with a solid dot on the ' + t('t') + '-axis.',
            dir: 'The rule subtracts ' + t(sh.Bc + 't') + ': as it gets warmer, fewer packets are sold, so the graph <b>falls</b> from left to right.' });
          var half = cl(sh.A / (2 * sh.Bc));
          var p = B.graph('(a) Sketch the graph of the function from a cold day of ' + t('-20\\,^{\\circ}\\text{C}') + ' until sales drop to zero.' + LINE_HELP, I, S.check, S.key,
            t('P(-20)=' + sh.A + '-' + sh.Bc + '(-20)=' + top) + ', and ' + t('P(t)=0') + ' when ' + t('t=' + nf(sh.A) + '\\div ' + sh.Bc + '=' + nf(z)) + '. Each degree warmer means ' + t(sh.Bc) + ' fewer packets, so the segment falls from ' + t(ptT([L, top])) + ' to ' + t(ptT([z, 0])) + ' (on this grid: ' + t(ptT(S.A)) + ' to ' + t(ptT(S.B)) + ').',
            ['Find ' + t('P(-20)') + ' and the temperature where ' + t('P(t)=0') + ': those are the two ends.'], 'sketch cocoa');
          p.bad = [drawing([seg([L, 0], [S.B[0], S.A[1]])]), drawing([seg([0, snapTo(sh.A, SY)], S.B)]), drawing([seg(S.A, [S.B[0] - 5, snapTo(sh.P(S.B[0] - 5), SY)], 'closed', 'arrow')]), drawing([seg(S.A, S.B, 'open', 'closed')])];
          if (Math.abs(snapTo(half, 5) - S.B[0]) > 1e-9) p.bad.push(drawing([seg([L, snapTo(sh.A + 20 * 2 * sh.Bc, SY)], [snapTo(half, 5), 0])]));
          return p;
        } },
        { id: '15b', level: 'BEG', make: function (r, sh) {
          var v = sh.P(sh.t1);
          return B.number('(b) Determine the value of ' + t('P(' + sh.t1 + ')') + '.', v, function (u) { if (same(u, sh.A + sh.Bc * sh.t1)) return { code: 'ev-sign', hint: t('-' + sh.Bc + '(' + sh.t1 + ')=+' + (-sh.Bc * sh.t1)) + ': a negative times a negative is positive.' }; return null; },
            t('P(' + sh.t1 + ')=' + sh.A + '-' + sh.Bc + '(' + sh.t1 + ')=' + sh.A + '+' + (-sh.Bc * sh.t1) + '=' + v), ['Substitute ' + t('t=' + sh.t1) + ', in brackets.'], 'P(negative)', { after: 'packets' });
        } },
        { id: '15c', level: 'EMG', make: function (r, sh) {
          var v = sh.P(sh.t1);
          return mc(r, '(c) What is the meaning of ' + t('P(' + sh.t1 + ')=' + v) + '?', [
            { html: 'When the average daily temperature is ' + t(sh.t1 + '\\,^{\\circ}\\text{C}') + ', ' + t(v) + ' packets of hot cocoa are sold.', right: true },
            { html: 'When ' + t(v) + ' packets are sold, the temperature drops by ' + t(-sh.t1 + '\\,^{\\circ}\\text{C}') + '.', why: 'The temperature is the input: it causes the sales, not the other way round.' },
            { html: 'When the temperature drops ' + t(-sh.t1) + ' degrees, ' + t(v) + ' more packets are sold.', why: t('P(' + sh.t1 + ')') + ' is the number sold on a day at ' + t(sh.t1 + '\\,^{\\circ}\\text{C}') + ' — a total, not an increase.' },
            { html: 'When the temperature is ' + t(v + '\\,^{\\circ}\\text{C}') + ', ' + t(sh.t1) + ' packets are sold.', why: 'Input and output are swapped (and a negative number of packets is impossible).' }],
            'Input ' + t(sh.t1 + '\\,^{\\circ}\\text{C}') + ', output ' + t(v) + ' packets: on a day averaging ' + t(sh.t1 + '\\,^{\\circ}\\text{C}') + ', the lodge sells ' + t(v) + ' packets.', ['Which number is the temperature and which is the number of packets?'], 'meaning of P(a)=b');
        } },
        { id: '15d', level: 'PRG', make: function (r, sh) {
          var y = sh.P(sh.t2);
          return B.number('(d) What was the average temperature if ' + t(y) + ' packets were sold?', sh.t2, function (u) {
            if (same(u, -sh.t2)) return { code: 'sign', hint: 'Check the sign: ' + t('-' + sh.Bc + 't=' + (y - sh.A)) + ', and dividing by ' + t('-' + sh.Bc) + ' gives a positive answer.' };
            if (same(u, sh.P(y))) return { code: 'ev-instead', hint: 'You found ' + t('P(' + y + ')') + '. Here ' + t(y) + ' is the number of packets (the output): solve ' + t('P(t)=' + y) + '.' };
            return null;
          }, t(sh.A + '-' + sh.Bc + 't=' + y) + '<br>' + t('-' + sh.Bc + 't=' + (y - sh.A)) + '<br>' + t('t=' + sh.t2) + ', so the average temperature was ' + t(sh.t2 + '\\,^{\\circ}\\text{C}') + '.', ['The number of packets is the output: solve ' + t('P(t)=' + y) + '.'], 'solve P(t)=b', { after: '°C' });
        } },
        { id: '15e', level: 'PRG', outcome: 'RF1', make: function (r, sh) {
          return mc(r, '(e) How could you estimate the lower limit of the domain of this relation?', [
            { html: 'Use the coldest average daily temperature the resort really experiences (from local climate records) — not the equation.', right: true },
            { html: 'Solve ' + t('P(t)=0') + '.', why: t('P(t)=0') + ' gives the warm end, where sales drop to zero. That is the <b>upper</b> limit.' },
            { html: 'There is no lower limit: the rule works for every temperature.', why: 'The rule makes sales climb forever as it gets colder, which cannot be true. A real resort has a coldest temperature.' },
            { html: 'Use ' + t('t=0') + ', since temperature cannot be negative.', why: 'Temperatures in °C are often negative at a ski resort.' }],
            'The equation lets sales climb without limit as ' + t('t') + ' falls, which cannot be true forever. The lower limit is the coldest average daily temperature the resort actually gets — take it from climate records; a linear model should not be trusted far outside the data it was built from.', ['What limits the temperature at a real ski resort?'], 'lower limit of domain');
        } },
        { id: '15f', level: 'MAS', outcome: 'RF2', make: function (r, sh) {
          var z = sh.z, P0 = sh.P;
          var check = function (resp) {
            resp = resp || [];
            if (!String(resp[0] || '').trim() || !String(resp[1] || '').trim()) return form('incomplete', 'Fill in both the domain and the range.');
            var d = S.parse(resp[0]); if (!d.ok) return form('set-' + d.why, 'I can’t read the domain. Write it like ' + t('\\{t\\mid -20\\le t\\le ' + nf(z) + ',\\ t\\in\\mathbb{R}\\}') + '.');
            var rr = S.parse(toY(resp[1], 'P', 't')); if (!rr.ok) return form('set-' + rr.why, 'I can’t read the range. Write it like ' + t('\\{P(t)\\mid 0\\le P(t)\\le 340,\\ P(t)\\in\\mathbb{R}\\}') + '.');
            if (d.set.kind !== 'int' || d.set.parts.length !== 1 || !isFinite(d.set.parts[0].lo) || !isFinite(d.set.parts[0].hi)) return wrong('dr-context', '<b>Domain:</b> the temperatures should run from a coldest value to a warmest value — one interval with two ends.');
            var L = d.set.parts[0].lo, U = d.set.parts[0].hi;
            if (d.v && d.v !== 't') return form('set-letter', '<b>Domain:</b> use the variable ' + t('t') + '.');
            if (d.form === 'builder' && !d.tagged) return form('set-tag', '<b>Domain:</b> finish the set notation with ' + t(',\\ t\\in\\mathbb{R}') + '.');
            if (L >= 0) return wrong('dr-context', '<b>Domain:</b> a ski resort in the Rockies has many days below ' + t('0\\,^{\\circ}\\text{C}') + ' — the domain should start at a negative temperature.');
            if (L > -10) return wrong('dr-context', '<b>Domain:</b> ' + t(nf(L) + '\\,^{\\circ}\\text{C}') + ' is a mild winter day in the Rockies — the coldest average daily temperatures there are much lower. Start the domain at a realistic coldest temperature (about ' + t('-20') + ' to ' + t('-30\\,^{\\circ}\\text{C}') + ').');
            if (L < -50) return wrong('dr-context', '<b>Domain:</b> ' + t(nf(L) + '\\,^{\\circ}\\text{C}') + ' is colder than any average daily temperature in the Rockies. Choose a realistic coldest temperature (about ' + t('-20') + ' to ' + t('-30\\,^{\\circ}\\text{C}') + ').');
            if (U > z + 1e-9) return wrong('dr-context', '<b>Domain:</b> above ' + t(nf(z) + '\\,^{\\circ}\\text{C}') + ' the model gives a negative number of packets. ' + t('P(t)=0') + ' at ' + t('t=' + nf(z)) + ', so the domain should stop there (or sooner).');
            if (U < 0) return wrong('dr-context', '<b>Domain:</b> the resort also has days above ' + t('0\\,^{\\circ}\\text{C}') + '. Let the domain run up to a warm day.');
            if (rr.set.kind !== 'int' || rr.set.parts.length !== 1) return wrong('dr-range-match', '<b>Range:</b> the number of packets runs from ' + t('P(' + nf(U) + ')') + ' to ' + t('P(' + nf(L) + ')') + ' — one interval.');
            var q = rr.set.parts[0];
            if (!same(q.lo, P0(U)) || !same(q.hi, P0(L))) return wrong('dr-range-match', '<b>Range:</b> it must match your domain. The fewest packets are sold on the warmest day, ' + t('P(' + nf(U) + ')=' + nf(P0(U))) + ', and the most on the coldest, ' + t('P(' + nf(L) + ')=' + nf(P0(L))) + '.');
            if (!d.set.parts[0].lc || !d.set.parts[0].hc || !q.lc || !q.hc) return wrong('set-endpoint', 'Include the end values (use ' + t('\\le') + ').');
            if (rr.v && rr.v !== 'y') return form('set-letter', '<b>Range:</b> write it with ' + t('P(t)') + ' (or ' + t('y') + ').');
            return ok();
          };
          var Dk = bld('t', -20, z), Rk = '\\{P(t)\\mid ' + cond('P(t)', 0, P0(-20)) + ',\\ P(t)\\in\\mathbb{R}\\}';
          var fl = [{ label: 'Domain', name: 'Domain', mode: 'math', keys: 'set', vars: ['t', 'P'], placeholder: 'e.g. {t | -20 <= t <= 10, t in R}' }, { label: 'Range', name: 'Range', mode: 'math', keys: 'set', vars: ['t', 'P'], placeholder: 'e.g. {P(t) | 0 <= P(t) <= 300, P(t) in R}' }];
          var p = { prompt: '(f) Suggest an appropriate domain and range for the function ' + t('P(t)') + ' if the resort is located in the Canadian Rockies.', input: { type: 'fields', fields: phFix(fl) }, check: check,
            key: [Dk, Rk], answer: 'Answers may vary, for example ' + t('D=' + Dk) + ', ' + t('R=' + Rk),
            solution: 'Answers may vary. Using a coldest average of about ' + t('-20\\,^{\\circ}\\text{C}') + ', and the temperature at which sales reach zero, ' + t('P(t)=0') + ' when ' + t('t=' + nf(z)) + ':<br>' + t(Dk) + '<br>' + t(Rk) + '<br>The range must match the domain: ' + t('P(' + nf(z) + ')=0') + ' and ' + t('P(-20)=' + P0(-20)) + '.',
            hints: ['Choose a realistic coldest temperature, and stop the domain where sales reach zero.', 'Then find ' + t('P') + ' at both ends of your domain for the range.'], text: 'domain/range cocoa (answers vary)' };
          p.good = [[bld('t', -30, z), '\\{P(t)\\mid ' + cond('P(t)', 0, P0(-30)) + ',\\ P(t)\\in\\mathbb{R}\\}'], ['[-25, 15]', '[' + nf(P0(15)) + ', ' + nf(P0(-25)) + ']']];
          p.bad = [[bld('t', -20, z + 10), '\\{P(t)\\mid ' + cond('P(t)', P0(z + 10), P0(-20)) + ',\\ P(t)\\in\\mathbb{R}\\}'], [Dk, '\\{P(t)\\mid ' + cond('P(t)', 0, sh.A) + ',\\ P(t)\\in\\mathbb{R}\\}'], [bld('t', 0, z), '[0, ' + sh.A + ']']];
          return p;
        } }] },
      /* ---------------- Q16 drop ---------------- */
      { num: '16', shared: dropShared,
        stem: function (sh) { return 'As part of a design test, a ' + t('12') + ' kg equipment case is dropped from a hovering helicopter. The height of the case above the ground is described by part of the graph of ' + t('h(t)=' + F(sh.H0) + '-4.9t^{2}') + ', where ' + t('h(t)') + ' is the height, in metres, of the case ' + t('t') + ' seconds after it is released.'; }, parts: [
        { id: '16a', level: 'PRG', outcome: 'RF1', make: function (r, sh) {
          /* a curve can't be drawn exactly on a tappable grid: students plot points from a table of values (each on the grid
           * point nearest the true value) and press Join; checked point by point against h(t) within half a snap step */
          var T = sh.T, H0 = sh.H0, h = sh.h, sx = { 10: 1, 12: 2, 14: 2, 15: 3, 16: 2, 18: 2, 20: 2 }[T] || 2;
          var sy = [50, 100, 200, 250, 500].filter(function (s) { return Math.ceil(H0 * 1.1 / s) <= 14; })[0], ym = Math.ceil(H0 * 1.1 / sy) * sy, xm = Math.ceil(T * 1.2 / sx) * sx;
          var tx = 1e-6, ty = sy / 2 + 1e-6, n = Math.round(T / sx), stp = sx * Math.ceil(n / 4), xs = [];
          for (var x = 0; x < T - 1e-9; x += stp) xs.push(cl(x)); xs.push(T);
          var I = padIn({ x: [0, xm], y: [0, ym], sx: sx, sy: sy, lx: 2 * sx, ly: 2 * sy, v: 't', w: 'h(t)', xTitle: 't (s)', yTitle: 'h(t) (m)', extra: { mode: 'points', join: true } });
          var keyPts = xs.map(function (x) { return [x, snapTo(h(x), sy)]; }), key = drawing([], keyPts, 'curve');
          var lineF = function (x) { return H0 * (1 - x / T); }, fastF = function (x) { return H0 * (1 - x / T) * (1 - x / T); }, upF = function (x) { return 4.9 * x * x; };
          var onF = function (f, ps) { return ps.every(function (q) { return Math.abs(q[1] - f(q[0])) <= ty; }); };
          var check = function (resp) {
            if (HW.draw.empty(resp)) return form('empty', 'Plot points from a table of values first (tap the grid), then press <b>Join</b>.');
            var v = HW.draw.norm(resp), ps = v.pts.slice().sort(function (a, b) { return a[0] - b[0]; });
            if (v.pieces.length) return wrong('sk-lines', 'Plot points and press <b>Join</b> — the graph is a curve, not straight pieces.');
            var after = ps.filter(function (q) { return q[0] > T + tx; });
            if (after.length) return wrong('sk-after', 'The case reaches the ground at ' + t('t=' + T) + ' s. After that the rule gives a negative height, so the graph stops at ' + t(ptT([T, 0])) + ' — remove ' + t(ptT(after[0])) + '.');
            var off = ps.filter(function (q) { return Math.abs(q[1] - h(q[0])) > ty; });
            if (off.length) {
              var mid = ps.filter(function (q) { return q[0] > tx && q[0] < T - tx; });
              if (Math.abs(ps[0][1]) <= ty && onF(upF, ps)) return wrong('sk-up', 'At ' + t('t=0') + ' the case is at the release height, ' + t('h(0)=' + F(H0)) + ' m, and then it <b>falls</b>. You graphed ' + t('4.9t^{2}') + ' instead of ' + t(F(H0) + '-4.9t^{2}') + '.');
              if (mid.length && onF(lineF, mid) && !onF(h, mid)) return wrong('sk-straight', 'Those points lie on a straight line. The rule has ' + t('t^{2}') + ': the case falls slowly at first and faster and faster, so the curve stays high longer — check e.g. ' + t('h(' + nf(mid[0][0]) + ')=' + nf(h(mid[0][0]))) + '.');
              if (mid.length && onF(fastF, mid) && !onF(h, mid)) return wrong('sk-shape', 'Your curve falls fastest at the start. A dropped case starts slowly and speeds up: the curve is flat at the top and steepest at the ground. Recompute your table of values.');
              var q0 = off[0];
              return wrong('sk-point', 'Check ' + t(ptT(q0)) + ': ' + t('h(' + nf(q0[0]) + ')=' + F(H0) + '-4.9(' + nf(q0[0]) + ')^{2}=' + nf(h(q0[0]))) + ', so plot it at the grid point nearest ' + t(ptT([q0[0], h(q0[0])])) + '.');
            }
            if (!ps.some(function (q) { return Math.abs(q[0]) <= tx; })) return wrong('sk-start', 'Start with the release point: ' + t('h(0)=' + F(H0)) + ', so plot the grid point nearest ' + t(ptT([0, H0])) + '.');
            if (!ps.some(function (q) { return Math.abs(q[0] - T) <= tx; })) return wrong('sk-land', 'Include the landing point: the case reaches the ground when ' + t('h(t)=0') + ', at ' + t('t=' + T) + ' s. Plot ' + t(ptT([T, 0])) + '.');
            if (ps.length < 4) return wrong('sk-few', 'Plot more points between release and landing (at least two, e.g. every ' + t(nf(stp)) + ' s) so the shape of the curve shows.');
            if (v.join === 'none') return wrong('graph-not-joined', 'Your points are right — now press <b>Join</b>: time is continuous, so the case has a height at every moment in between.');
            return ok();
          };
          var p = B.graph('(a) Sketch the graph of the function from release until the case reaches the ground. Make a table of values (e.g. every ' + t(nf(stp)) + ' s), plot each point on the grid point nearest its true value, then press <b>Join</b>.', I, check, key,
            'Table of values: ' + xs.map(function (x) { return t('h(' + nf(x) + ')=' + nf(h(x))); }).join(', ') + '. The graph is part of a downward parabola: it starts at its peak ' + t('(0,\\ ' + F(H0) + ')') + ' on the vertical axis, falls slowly at first and faster and faster, and reaches ' + t('h=0') + ' at ' + t('t=' + T) + ' s. The points are joined because time is continuous.',
            ['Find ' + t('h(0)') + ' and the time when ' + t('h(t)=0') + ' (part (e)) — those are the two ends.', 'Fill in a table for a few times in between, e.g. ' + t('t=' + nf(xs[1])) + ': ' + t('h(' + nf(xs[1]) + ')=' + F(H0) + '-4.9(' + nf(xs[1]) + ')^{2}') + '.'], 'sketch drop', { fns: [{ f: h, from: 0, to: T, dash: true }] });
          var snapAll = function (f) { return xs.map(function (x) { return [x, Math.max(0, snapTo(f(x), sy))]; }); };
          p.bad = [drawing([], keyPts, 'none'), drawing([], snapAll(lineF), 'curve'), drawing([], snapAll(fastF), 'curve'), drawing([], snapAll(upF).filter(function (q) { return q[1] <= ym; }), 'curve'),
            drawing([], keyPts.concat([[cl(T + sx), 0]]), 'curve'), drawing([], [keyPts[0], keyPts[2], keyPts[keyPts.length - 1]], 'curve'), drawing([], keyPts.slice(0, -1), 'curve')];
          return p;
        } },
        { id: '16b', level: 'EMG', make: function (r, sh) {
          var v = sh.h(sh.t1);
          return B.number('(b) Determine the value of ' + t('h(' + sh.t1 + ')') + '.', v, function (u) {
            if (same(u, cl(sh.H0 - 4.9 * sh.t1))) return { code: 'no-square', hint: 'Square ' + t(sh.t1) + ' first: ' + t('4.9(' + sh.t1 + ')^{2}=4.9(' + sh.t1 * sh.t1 + ')') + '.' };
            if (same(u, cl(sh.H0 - 4.9 * 4.9 * sh.t1 * sh.t1))) return { code: 'sq-coef', hint: 'Only ' + t('t') + ' is squared, not ' + t('4.9') + '.' };
            return null;
          }, t('h(' + sh.t1 + ')=' + F(sh.H0) + '-4.9(' + sh.t1 + ')^{2}=' + F(sh.H0) + '-' + cl(4.9 * sh.t1 * sh.t1) + '=' + v) + ' m', ['Square first, then multiply by ' + t('4.9') + ', then subtract.'], 'h(t1)', { after: 'm' });
        } },
        { id: '16c', level: 'PRG', make: function (r, sh) {
          var v = sh.h(sh.t2);
          return mc(r, '(c) Why does ' + t('h(' + sh.t2 + ')') + ' not represent the height of the case ' + t(sh.t2) + ' seconds after release?', [
            { html: 'The case lands at ' + t('t=' + sh.T) + ' s; after that the rule gives a negative height (' + t('h(' + sh.t2 + ')=' + F(v)) + '), which is impossible.', right: true },
            { html: 'Because ' + t(sh.t2) + ' is not a whole number of seconds.', why: t(sh.t2) + ' is a whole number. The problem is what the rule gives after the case lands.' },
            { html: 'Because the case is still falling at ' + t(sh.t2) + ' s, so the height keeps changing.', why: 'Work out when ' + t('h(t)=0') + ': the case is already on the ground before ' + t(sh.t2) + ' s.' },
            { html: 'Because ' + t('h(' + sh.t2 + ')') + ' is the time when the case is ' + t(sh.t2) + ' m high.', why: 'In ' + t('h(' + sh.t2 + ')') + ' the input ' + t(sh.t2) + ' is a time. The issue is what the output would be.' }],
            'The case reaches the ground when ' + t(F(sh.H0) + '-4.9t^{2}=0') + ', i.e. ' + t('t^{2}=' + sh.T * sh.T) + ', ' + t('t=' + sh.T) + ' s. By ' + t('t=' + sh.t2) + ' s it is already on the ground, and ' + t('h(' + sh.t2 + ')=' + F(v)) + ' — a negative, impossible height. The rule stops describing the case once it lands.',
            ['When does the case reach the ground? What does the rule give after that?'], 'why h(t) meaningless');
        } },
        { id: '16d', level: 'BEG', make: function (r, sh) {
          return B.number('(d) At what height above the ground was the case released?', sh.H0, function (u) { if (same(u, sh.T)) return { code: 'solve-instead', hint: 'That is the time to reach the ground. The release height is the height at ' + t('t=0') + '.' }; return null; },
            'The release height is the height at ' + t('t=0') + ': ' + t('h(0)=' + F(sh.H0)) + ' m.', ['Release happens at ' + t('t=0') + '.'], 'release height', { after: 'm' });
        } },
        { id: '16e', level: 'PRG', make: function (r, sh) {
          return B.number('(e) How long (to the nearest second) will it take the case to reach the ground?', sh.T, function (u) {
            if (same(u, -sh.T)) return { code: 'neg-time', hint: 'Time after release can’t be negative — use the positive root.' };
            if (same(u, sh.T * sh.T)) return { code: 'root-missing', hint: 'That is ' + t('t^{2}') + '. Take the square root.' };
            return null;
          }, t(F(sh.H0) + '-4.9t^{2}=0') + '<br>' + t('4.9t^{2}=' + F(sh.H0)) + '<br>' + t('t^{2}=' + sh.T * sh.T + '\\Rightarrow t=' + sh.T) + ' s (the negative root makes no sense for time).', ['The case is on the ground when ' + t('h(t)=0') + '.'], 'time to ground', { after: 's' });
        } },
        { id: '16f', level: 'PRG', outcome: 'RF2', make: function (r, sh) {
          return drPart('(f) Suggest an appropriate domain and range for the function ' + t('h(t)') + '.', { dv: 't', fname: 'h', D: [0, sh.T], R: [0, sh.H0],
            dW: [{ is: bld('t', -sh.T, sh.T), code: 'dr-context', hint: 'Time starts at release, ' + t('t=0') + ' — negative times are before the drop.' }],
            dC: { 'set-arrow': 'The case stops when it hits the ground, at ' + t('t=' + sh.T) + ' s: the domain has an end.' } },
            'From release (' + t('t=0') + ') to landing (' + t('t=' + sh.T) + '), the height falls from ' + t(F(sh.H0)) + ' m to ' + t('0') + ':<br>' + t(bld('t', 0, sh.T)) + '<br>' + t('\\{h(t)\\mid ' + cond('h(t)', 0, sh.H0) + ',\\ h(t)\\in\\mathbb{R}\\}'),
            ['The model describes the case only from release until it lands.'], 'domain/range drop');
        } }] }
    ],
    extra: [
      /* ---------------- Extra Part A ---------------- */
      { num: '1', section: 'Extra practice A — Two notations, one rule', stem: 'Express each relation given in function notation as an equation in two variables. Watch the letter: the independent variable never changes when you convert.', parts: [
        { id: 'e1a', level: 'EMG', make: function (r) {
          var a = r.pick([9, 9, 4, 6, 8, 11, 13]), b = r.int(2, 8), rhs = lin([[a, ''], [-b, 'x']]);
          return convPart('xy', t('f(x)=' + rhs), { T: P(rhs), v: 'x', keyRhs: rhs, bad: ['f(x)=' + rhs] }, 'Replace ' + t('f(x)') + ' with ' + t('y') + ': ' + t('y=' + rhs), ['Swap ' + t('f(x)') + ' for ' + t('y') + '.'], 'EP f(x) to y');
        } },
        { id: 'e1b', level: 'PRG', make: function (r) {
          var b = r.pick([5, 5, 2, 3, 4, 6, 7]), rhs = lin([[1, 't^{2}'], [-b, 't']]);
          return convPart('xy', t('g(t)=' + rhs), { T: P(rhs), v: 't', keyRhs: rhs, vars: ['x'], bad: ['y=' + lin([[1, 'x^{2}'], [-b, 'x']])] }, 'Replace ' + t('g(t)') + ' with ' + t('y') + '; the input stays ' + t('t') + ': ' + t('y=' + rhs), ['The input letter is ' + t('t') + '. Keep it.'], 'EP g(t) to y');
        } },
        { id: 'e1c', level: 'PRG', make: function (r) {
          var a = r.pick([0.5, 0.5, 0.25, 0.75, 1.5]), b = r.pick([3.25, 3.25, 1.75, 2.5, 4.75]), rhs = lin([[a, 'n'], [b, '']]);
          return convPart('xy', t('P(n)=' + rhs), { T: P(rhs), v: 'n', keyRhs: rhs, vars: ['x'], bad: ['y=' + lin([[a, 'x'], [b, '']]), 'P=' + rhs + '+1'] }, 'Replace ' + t('P(n)') + ' with ' + t('y') + '; the input stays ' + t('n') + ': ' + t('y=' + rhs), ['Only the output’s name changes.'], 'EP P(n) to y');
        } },
        { id: 'e1d', level: 'PRG', make: function (r) {
          var a = r.pick([2, 2, 3, 4, 5]), c = r.pick([7, 7, 1, 5, 8, 11]), d = r.pick([3, 3, 2, 5].filter(function (x) { return gcd(x, a) === 1 || gcd(x, c) === 1; })), rhs = '\\frac{' + lin([[a, 'a'], [-c, '']]) + '}{' + d + '}';
          return convPart('xy', t('h(a)=' + rhs.replace('\\frac', '\\dfrac')), { T: P(rhs), v: 'a', keyRhs: rhs, expanded: false, vars: ['x'], bad: ['y=\\frac{' + lin([[a, 'x'], [-c, '']]) + '}{' + d + '}'] },
            'Replace ' + t('h(a)') + ' with ' + t('y') + '; the input stays ' + t('a') + ': ' + t('y=' + rhs.replace('\\frac', '\\dfrac')), ['The input letter is ' + t('a') + ' here.'], 'EP h(a) to y');
        } }] },
      { num: '2', stem: 'Express each relation in function notation. Some of these must be rearranged first, and one of them cannot be done at all.', parts: [
        { id: 'e2a', level: 'PRG', make: function (r) {
          var c = r.pick([7, 7, 3, 5, 9]), d = r.pick([2, 2, 3, 4]), v = r.pick(['w', 'w', 't', 'n']), rhs = c + '-\\frac{' + v + '}{' + d + '}';
          return convPart('fn', t('y=' + rhs), { T: P(c + '-\\frac{1}{' + d + '}' + v), v: v, keyRhs: rhs, vars: ['x'], bad: ['f(x)=' + rhs] }, 'Already solved for ' + t('y') + '. The input is ' + t(v) + ', so replace ' + t('y') + ' with ' + t('f(' + v + ')') + ': ' + t('f(' + v + ')=' + rhs), ['Which letter is the input? It goes in the brackets.'], 'EP y to f(w)');
        } },
        { id: 'e2b', level: 'EMG', make: function (r) {
          var a = r.pick([6, 6, 2, 3, 4, 5]), rhs = lin([[a, 'x^{2}'], [-1, 'x']]);
          return convPart('fn', t('y=' + rhs), { T: P(rhs), v: 'x', keyRhs: rhs, bad: ['y=' + rhs] }, 'Replace ' + t('y') + ' with ' + t('f(x)') + ': ' + t('f(x)=' + rhs), ['Swap ' + t('y') + ' for ' + t('f(x)') + '.'], 'EP y to f(x) quadratic');
        } },
        { id: 'e2c', level: 'PRG', make: function (r) {
          var A = r.pick([5, 5, 3, 7]), k = r.pick([7, 7, 3, 4, 5, 6]), C = 2 * k, rhs = lin([[[A, 2], 'x'], [-k, '']]), eq = A + 'x-2y=' + C;
          var W = [{ is: P(lin([[[-A, 2], 'x'], [k, '']])), code: 'conv-move-sign', hint: 'Dividing by ' + t('-2') + ' changes the sign of <b>every</b> term: ' + t('-2y=' + C + '-' + A + 'x') + ' gives ' + t('y=' + rhs) + '.' },
            { is: P(lin([[A, 'x'], [-C, '']])), code: 'conv-no-divide', hint: 'Divide every term by ' + t('-2') + ', the coefficient of ' + t('y') + '.' }];
          return convPart('fn', t(eq), { T: P(rhs), v: 'x', keyRhs: rhs, wrong: W, bad: ['y=' + rhs] }, 'Solve for ' + t('y') + ' first:<br>' + t('-2y=' + C + '-' + A + 'x') + '<br>' + t('y=' + rhs) + '<br>' + t('f(x)=' + rhs), ['Move ' + t(A + 'x') + ' across, then divide by ' + t('-2') + '.'], 'EP rearrange Ax-2y=C');
        } },
        { id: 'e2d', level: 'PRG', make: function (r) {
          var Bq = r.pick([3, 3, 2, 5]), A = r.pick([4, 4, 1, 2, 7].filter(function (x) { return gcd(x, Bq) === 1; })), k = r.pick([6, 6, 2, 3, 4, 5]), C = Bq * k, rhs = lin([[[-A, Bq], 'x'], [-k, '']]), eq = lin([[A, 'x'], [Bq, 'y'], [C, '']]) + '=0', Ax = (A === 1 ? '' : A) + 'x';
          var W = [{ is: P(lin([[[A, Bq], 'x'], [k, '']])), code: 'conv-move-sign', hint: 'Both terms change sign when they move across: ' + t(Bq + 'y=-' + Ax + '-' + C) + '.' }, { is: P(lin([[-A, 'x'], [-C, '']])), code: 'conv-no-divide', hint: 'Divide every term by ' + t(Bq) + '.' }];
          return convPart('fn', t(eq), { T: P(rhs), v: 'x', keyRhs: rhs, wrong: W, bad: ['y=' + rhs] }, 'Solve for ' + t('y') + ':<br>' + t(Bq + 'y=-' + Ax + '-' + C) + '<br>' + t('y=' + rhs) + '<br>' + t('f(x)=' + rhs), ['Get the ' + t('y') + '-term by itself, then divide by ' + t(Bq) + '.'], 'EP rearrange Ax+By+C=0');
        } },
        { id: 'e2e', level: 'PRG', make: function (r) {
          var a = r.pick([2, 2, 4, 5]), b = r.pick([9, 9, 3, 7, 11].filter(function (x) { return x % a !== 0; }));
          return convPart('fn', t(a + 'y-' + b + '=0'), { T: PL.num([b, a]), v: 'x', keyRhs: frT(b, a), vars: [], good: ['f(x)=' + cl(b / a)], bad: ['f(x)=' + b, 'y=' + frT(b, a)] },
            t(a + 'y=' + b) + ', so ' + t('y=' + frT(b, a)) + '.<br>' + t('f(x)=' + frT(b, a)) + ' — a <b>constant function</b>. The rule uses no ' + t('x') + ', which is allowed: every input still gives exactly one output.', ['Solve for ' + t('y') + '. The answer has no ' + t('x') + ' in it — that’s fine.'], 'EP constant function');
        } },
        { id: 'e2f', level: 'PRG', outcome: 'RF2', make: function (r) {
          var h = r.pick([5, 5, -3, 2, 4]);
          return mc(r, 'Can ' + t('x=' + h) + ' be written in function notation?', [
            { html: 'No: ' + t('x=' + h) + ' is a vertical line. The one input ' + t(h) + ' is paired with every ' + t('y') + ', so it is not a function.', right: true },
            { html: 'Yes: ' + t('f(x)=' + h) + '.', why: t('f(x)=' + h) + ' means ' + t('y=' + h) + ', a <b>horizontal</b> line. That is a different relation.' },
            { html: 'Yes: ' + t('f(' + h + ')=x') + '.', why: 'Function notation needs one output for each input. Here the input ' + t(h) + ' has infinitely many outputs.' },
            { html: 'Yes: ' + t('f(y)=' + h) + '.', why: 'The brackets hold the input. And ' + t('x=' + h) + ' fails the vertical line test, so no rule ' + t('f(x)=\\ldots') + ' can describe it.' }],
            t('x=' + h) + ' is a vertical line: the single input ' + t(h) + ' goes with every real ' + t('y') + '. It is not a function, so it cannot be written as ' + t('f(x)=\\ldots') + '.', ['Sketch ' + t('x=' + h) + '. Does it pass the vertical line test?'], 'EP x=h not a function');
        } }] },
      { num: '3', stem: 'Each table gives every ordered pair of a function. Write the rule first in ' + t('x') + '-' + t('y') + ' notation and then in function notation (use the name ' + t('f') + '), keeping the letters used in the table.', parts: [
        { id: 'e3a', level: 'PRG', make: function (r) {
          var m = r.pick([-3, -3, -2, 2, 3, 4]), b = r.pick([5, 5, 1, 2, 3, -1, 4]), xs = [-2, -1, 0, 1, 2], rhs = m < 0 ? lin([[b, ''], [m, 'x']]) : lin([[m, 'x'], [b, '']]);
          return bothPart(HW.valueTable([[t('x')].concat(xs), [t('y')].concat(xs.map(function (x) { return m * x + b; }))]), { T: P(rhs), v: 'x', keyRhs: rhs },
            t('x') + ' up ' + t('1') + ' ' + t('\\Rightarrow') + ' ' + t('y') + (m < 0 ? ' down ' + t(-m) : ' up ' + t(m)) + '; at ' + t('x=0') + ', ' + t('y=' + b) + '.<br>' + t('y=' + rhs) + '<br>' + t('f(x)=' + rhs),
            ['How much does ' + t('y') + ' change when ' + t('x') + ' goes up by ' + t('1') + '? What is ' + t('y') + ' when ' + t('x=0') + '?'], 'EP rule from table');
        } },
        { id: 'e3b', level: 'ADV', make: function (r) {
          var m = r.pick([4.5, 4.5, 1.5, 2.5, 3.5]), b = r.pick([7, 7, 2, 3, 5]), ts = [0, 2, 4, 6], rhs = lin([[m, 't'], [b, '']]);
          return bothPart(HW.valueTable([[t('t')].concat(ts), [t('d')].concat(ts.map(function (x) { return cl(m * x + b); }))]), { T: P(rhs), v: 't', out: 'd', keyRhs: rhs },
            t('t') + ' up ' + t('2') + ' ' + t('\\Rightarrow') + ' ' + t('d') + ' up ' + t(2 * m) + ', so ' + t('d') + ' rises ' + t(m) + ' per unit of ' + t('t') + '; at ' + t('t=0') + ', ' + t('d=' + b) + '.<br>' + t('d=' + rhs) + '<br>' + t('f(t)=' + rhs) + ' (the input stays ' + t('t') + ')',
            ['The ' + t('t') + '-values go up by ' + t('2') + ', not ' + t('1') + '. Find the change in ' + t('d') + ' for one unit of ' + t('t') + '.'], 'EP rule from table t,d');
        } },
        { id: 'e3c', level: 'EMG', make: function (r) {
          var k = r.pick([1, 1, 2, 3]), ns = [1, 2, 3, 4], rhs = lin([[k, 'n^{2}']]);
          return bothPart(HW.valueTable([[t('n')].concat(ns), [t('A')].concat(ns.map(function (x) { return k * x * x; }))]), { T: P(rhs), v: 'n', out: 'A', keyRhs: rhs, wrong: [{ is: P(lin([[2 * k, 'n']])), code: 'diag', hint: 'Check ' + t('n=3') + ': ' + t(2 * k + '(3)=' + 6 * k) + ', but the table says ' + t(9 * k) + '. Look for squares.' }] },
            'Each ' + t('A') + ' is ' + (k === 1 ? 'the square of ' + t('n') : t(k) + ' times the square of ' + t('n')) + ': ' + ns.map(function (x) { return t((k === 1 ? '' : k + '\\cdot ') + x + '^{2}'); }).join(', ') + '.<br>' + t('A=' + rhs) + '<br>' + t('f(n)=' + rhs),
            ['The differences are not constant, so it isn’t linear. Compare each ' + t('A') + ' with ' + t('n^{2}') + '.'], 'EP rule from table squares');
        } }] },
      { num: '4', stem: 'Each graph below is the graph of a function ' + t('f') + '. Write its equation in ' + t('x') + '-' + t('y') + ' notation and then in function notation. Read two lattice points off the graph first.', parts: [
        { id: 'e4a', level: 'PRG', make: function (r) {
          var m = r.pick([[1, 2], [1, 2], [-1, 2], [1, 3], [-1, 3]]), b = r.pick([2, 2, 1, -1, -2]), mv = m[0] / m[1], rhs = lin([[m, 'x'], [b, '']]);
          return bothPart('(a)' + lineFig(mv, b), { T: P(rhs), v: 'x', keyRhs: rhs, wrong: [{ is: P(lin([[[m[1] * m[0], 1], 'x'], [b, '']])), code: 'diag', hint: 'Slope is rise over run: the line rises ' + t(m[0]) + ' for every ' + t(m[1]) + ' across, so the slope is ' + t(frT(m[0], m[1])) + '.' }] },
            'Lattice points ' + t(ptT([0, b])) + ' and ' + t(ptT([m[1], b + m[0]])) + '. Slope ' + t('=' + frT(m[0], m[1])) + '; ' + t('y') + '-intercept ' + t(b) + '.<br>' + t('y=' + rhs) + '<br>' + t('f(x)=' + rhs),
            ['Find the ' + t('y') + '-intercept, then count the rise and the run between two lattice points.'], 'EP line from graph, fraction slope');
        } },
        { id: 'e4b', level: 'EMG', make: function (r) {
          var m = r.pick([-1, -1, 1, -2, 2]), b = r.pick([1, 1, -1, 2, -2, 3]), rhs = m < 0 ? lin([[b, ''], [m, 'x']]) : lin([[m, 'x'], [b, '']]);
          return bothPart('(b)' + lineFig(m, b), { T: P(rhs), v: 'x', keyRhs: rhs, wrong: [{ is: P(lin([[-m, 'x'], [b, '']])), code: 'sign', hint: 'Is the line going up or down from left to right? That decides the sign of the slope.' }] },
            'Lattice points ' + t(ptT([0, b])) + ' and ' + t(ptT([1, b + m])) + '. Slope ' + t(m) + '; ' + t('y') + '-intercept ' + t(b) + '.<br>' + t('y=' + rhs) + '<br>' + t('f(x)=' + rhs), ['Start at the ' + t('y') + '-intercept; go ' + t('1') + ' to the right and count the change.'], 'EP line from graph');
        } },
        { id: 'e4c', level: 'EMG', make: function (r) {
          var c = r.pick([-3, -3, -2, 2, 4]);
          return bothPart('(c)' + lineFig(0, c), { T: PL.num(c), v: 'x', keyRhs: String(c), bad: [['x=' + c, 'f(x)=' + c]] },
            'Lattice points ' + t(ptT([0, c])) + ' and ' + t(ptT([2, c])) + ': a horizontal line, so every input gives ' + t(c) + '.<br>' + t('y=' + c) + '<br>' + t('f(x)=' + c), ['Every point on a horizontal line has the same ' + t('y') + '-value.'], 'EP horizontal line');
        } }] },
      { num: '5', stem: 'Each conversion below is wrong. Write the correct version.', parts: [
        { id: 'e5a', level: 'EMG', make: function (r) {
          var b = r.pick([3, 3, 2, 4, 5]), c = r.pick([8, 8, 1, 5, 6]), rhs = lin([[1, 't^{2}'], [b, 't'], [-c, '']]);
          return convPart('xy', 'A student wrote: “' + t('h(t)=' + rhs) + ' becomes ' + t('y=' + lin([[1, 'x^{2}'], [b, 'x'], [-c, '']])) + '.” Write the correct equation in two variables.', { T: P(rhs), v: 't', keyRhs: rhs, vars: ['x'], bad: ['y=' + lin([[1, 'x^{2}'], [b, 'x'], [-c, '']])] },
            'The student changed the input variable from ' + t('t') + ' to ' + t('x') + ' — only the name of the output may change.<br>Correct: ' + t('y=' + rhs), ['What may change in a conversion, and what may not?'], 'EP fix changed variable');
        } },
        { id: 'e5b', level: 'EMG', make: function (r) {
          var a = r.pick([9, 9, 3, 5, 7]), b = r.pick([4, 4, 2, 6, 8]), rhs = lin([[a, 'x'], [-b, '']]);
          return convPart('fn', 'A student wrote: “' + t('y=' + rhs) + ' becomes ' + t('f(y)=' + rhs) + '.” Write the correct function notation.', { T: P(rhs), v: 'x', keyRhs: rhs, bad: ['f(y)=' + rhs] },
            'The brackets must hold the <b>input</b>, ' + t('x') + '; ' + t('y') + ' is the output being replaced.<br>Correct: ' + t('f(x)=' + rhs), ['What goes inside the brackets of ' + t('f(\\ )') + '?'], 'EP fix f(y)');
        } },
        { id: 'e5c', level: 'PRG', make: function (r) {
          var Bq = r.pick([4, 4, 2, 3]), A = r.pick([3, 3, 1, 5].filter(function (x) { return gcd(x, Bq) === 1; })), k = r.pick([6, 6, 2, 3, 5]), C = Bq * k, rhs = lin([[k, ''], [[-A, Bq], 'x']]), Ax = (A === 1 ? '' : A) + 'x';
          return convPart('fn', 'A student wrote: “' + t(Ax + '+' + Bq + 'y=' + C) + ' becomes ' + t('f(x)=' + C + '-' + Ax + '-' + Bq) + '.” Write the correct function notation.', { T: P(rhs), v: 'x', keyRhs: rhs, bad: ['f(x)=' + C + '-' + Ax + '-' + Bq], wrong: [{ is: P(C - Bq + '-' + Ax), code: 'conv-no-divide', hint: t(Bq + 'y') + ' means ' + t(Bq + '\\times y') + ': you can’t just drop the letter ' + t('y') + ' and subtract ' + t(Bq) + '. Divide by ' + t(Bq) + ' instead.' }, { is: P(lin([[C, ''], [-A, 'x']])), code: 'conv-no-divide', hint: 'Divide every term by ' + t(Bq) + '.' }] },
            'Only the letter ' + t('y') + ' was dropped; the whole term ' + t(Bq + 'y') + ' must be isolated and then divided by ' + t(Bq) + ':<br>' + t(Bq + 'y=' + C + '-' + Ax) + '<br>' + t('y=' + rhs) + '<br>Correct: ' + t('f(x)=' + rhs), ['Solve for ' + t('y') + ' properly first.'], 'EP fix dropped y');
        } },
        { id: 'e5d', level: 'EMG', make: function (r) {
          var a = r.pick([2, 2, 3, 4, 5]), b = r.pick([3, 3, 1, 5, 7]), rhs = lin([[a, 'x'], [-b, '']]);
          return convPart('xy', 'A student wrote: “' + t('f(x)=' + rhs) + ' becomes ' + t('y=' + lin([[a, 'y'], [-b, '']])) + '.” Write the correct equation in two variables.', { T: P(rhs), v: 'x', keyRhs: rhs, bad: ['y=' + lin([[a, 'y'], [-b, '']])] },
            t('y') + ' was written on both sides. ' + t('f(x)') + ' is replaced by ' + t('y') + ' on the <b>left</b> only; the right side keeps its ' + t('x') + '.<br>Correct: ' + t('y=' + rhs), ['Which part of ' + t('f(x)=' + rhs) + ' becomes ' + t('y') + '?'], 'EP fix y on both sides');
        } },
        { id: 'e5e', level: 'EMG', make: function (r) {
          return mc(r, 'Which sentence correctly states what changes and what does <b>not</b> change when a rule is rewritten in function notation?', [
            { html: 'Only the name of the output changes (' + t('y') + ' becomes ' + t('f(x)') + '); the rule, the input variable and every ordered pair stay the same.', right: true },
            { html: 'The input variable always becomes ' + t('x') + ', and the rule stays the same.', why: 'The input letter never changes: ' + t('h(t)=t^{2}+3t-8') + ' becomes ' + t('y=t^{2}+3t-8') + '.' },
            { html: 'Every ' + t('y') + ' in the equation, on both sides, becomes ' + t('f(x)') + '.', why: 'First solve for ' + t('y') + '; then only the single ' + t('y') + ' on the left is renamed.' },
            { html: 'The ordered pairs change, because ' + t('f(x)') + ' is a new output.', why: t('f(x)') + ' is just another name for the same output, so every ordered pair is unchanged.' }],
            'Only the name of the output changes (' + t('y') + ' becomes ' + t('f(x)') + '); the rule, the independent variable and every ordered pair stay exactly the same.', ['Think about Example 1: ' + t('h(t)=t^{2}+3t-8') + ' becomes ' + t('y=t^{2}+3t-8') + '.'], 'EP what changes');
        } }] },
      /* ---------------- Extra Part B ---------------- */
      { num: '6', section: 'Extra practice B — Reading a graph in both directions', shared: flatShared, stem: function (sh) { return 'The graph of a function ' + t('f') + ' is shown. Read every answer off the graph, and count <i>every</i> point at the height you are given.' + sh.fig; }, parts: [
        { id: 'e6a', level: 'BEG', make: function (r, sh) {
          var xs = [-5, -3, 0, 3, 6].map(function (x) { return x * sh.sx; }).sort(function (a, b) { return a - b; });
          var items = xs.map(function (x) { var v = pwAt(sh.V, x); return { f: { label: t('f(' + x + ')='), name: 'f(' + x + ')' }, k: nf(v), c: K.number(v, function (u) { if (pwSols(sh.V, x).pts.some(function (z) { return same(z, u); })) return { code: 'read-reverse', hint: t('f(' + x + ')') + ': start at ' + t(x) + ' on the <b>horizontal</b> axis and read up or down.' }; return null; }) }; });
          return fieldsOf('(a) State each value.', items, xs.map(function (x) { return t('f(' + x + ')=' + pwAt(sh.V, x)); }).join(', '), 'Start on the ' + t('x') + '-axis and read up or down to the graph:<br>' + xs.map(function (x) { return t('f(' + x + ')=' + pwAt(sh.V, x)); }).join(', '), ['Each input gives exactly one output.'], 'EP read f(a)');
        } },
        { id: 'e6b', level: 'EMG', make: function (r, sh) {
          var bs = [0, 4 * sh.sy, -5 * sh.sy], lab = ['(b)', '(c)', '(d)'];
          return BF('Solve each equation. (Press <b>none</b> if there is no solution.)', bs.map(function (b, i) { return solField(lab[i] + ' ' + t('f(x)=' + b), 'x'); }),
            bs.map(function (b) { return solsChk(pwSols(sh.V, b).pts, { b: b, graph: true, noneHint: 'The graph only reaches from ' + t(pwMin(sh.V)) + ' to ' + t(pwMax(sh.V)) + '. Does it ever reach height ' + t(b) + '?' }); }),
            bs.map(function (b) { var s0 = pwSols(sh.V, b).pts; return s0.length ? solsKey(s0) : 'none'; }), bs.map(function (b, i) { var s0 = pwSols(sh.V, b).pts; return lab[i] + ' ' + (s0.length ? t(solsKey(s0)) : 'no solution'); }).join('<br>'),
            bs.map(function (b, i) { var s0 = pwSols(sh.V, b).pts; return lab[i] + ' Read across at height ' + t(b) + ': ' + (s0.length ? t(solsKey(s0)) + (s0.length === 1 ? ' only' : '') : '<b>no solution</b> — the line ' + t('y=' + b) + ' passes entirely ' + (b < 0 ? 'below' : 'above') + ' the graph'); }).join('<br>'),
            ['Start on the vertical axis and read across. Count every crossing.'], 'EP solve f(x)=b');
        } },
        { id: 'e6c', level: 'PRG', make: function (r, sh) {
          var b = 2 * sh.sy, s0 = pwSols(sh.V, b), p0 = s0.pts[0], I = s0.ints[0];
          return mc(r, '(e) Solve ' + t('f(x)=' + b) + '. Which answer describes the solution exactly?', [
            { html: t('x=' + p0) + ' or ' + t(I[0] + '\\le x\\le ' + I[1]), right: true },
            { html: t('x=' + p0) + ', ' + t('x=' + I[0]) + ' and ' + t('x=' + I[1]), why: 'The graph lies <b>along</b> the line ' + t('y=' + b) + ' for every ' + t('x') + ' from ' + t(I[0]) + ' to ' + t(I[1]) + ', not just at the ends.' },
            { html: t(I[0] + '\\le x\\le ' + I[1]), why: 'Look further: the line ' + t('y=' + b) + ' also crosses another piece of the graph.' },
            { html: t('x=' + p0) + ' only', why: 'The flat piece is at height ' + t(b) + ' too — every point on it is a solution.' }],
            'The line ' + t('y=' + b) + ' crosses one piece at ' + t('x=' + p0) + ', then lies <b>along</b> the flat piece from ' + t('x=' + I[0]) + ' to ' + t('x=' + I[1]) + ': ' + t('x=' + p0) + ' or ' + t(I[0] + '\\le x\\le ' + I[1]) + ' — infinitely many solutions.', ['Draw the horizontal line at height ' + t(b) + ' and look along the whole graph.'], 'EP flat-piece solution');
        } },
        { id: 'e6d', level: 'EMG', make: function (r, sh) {
          var z = pwSols(sh.V, 0).pts, y0 = pwAt(sh.V, 0);
          return BF('(f) Write the ' + t('x') + '-intercepts and the ' + t('y') + '-intercept of the graph using function notation.', [solField(t('x') + '-intercepts: ' + t('f(x)=0') + ' when', 'x'), { label: t('y') + '-intercept: ' + t('f(0)='), name: 'f(0)', mode: 'math', keys: 'solutions', vars: ['x'] }],
            [solsChk(z, { b: 0, graph: true }), K.value(y0)], [solsKey(z), nf(y0)], z.map(function (x) { return t('f(' + x + ')=0'); }).join(', ') + '; ' + t('f(0)=' + y0),
            t('x') + '-intercepts (output ' + t('0') + '): ' + z.map(function (x) { return t('f(' + x + ')=0'); }).join(', ') + '.<br>' + t('y') + '-intercept (input ' + t('0') + '): ' + t('f(0)=' + y0) + ' — the graph passes through the origin, so one point is both.', ['Solve ' + t('f(x)=0') + ', then find ' + t('f(0)') + '.'], 'EP intercepts fn notation');
        } },
        { id: 'e6e', level: 'EMG', outcome: 'RF2', make: function (r, sh) {
          return drPart('(g) State the domain and the range of ' + t('f') + '.', { dv: 'x', fname: 'f', D: [-6, 6], R: [pwMin(sh.V), pwMax(sh.V)] },
            'The graph runs from ' + t('x=-6') + ' to ' + t('x=6') + '; its lowest point is at ' + t(pwMin(sh.V)) + ' and its highest at ' + t(pwMax(sh.V)) + '.<br>' + t(bld('x', -6, 6)) + '<br>' + t('\\{f(x)\\mid ' + cond('f(x)', pwMin(sh.V), pwMax(sh.V)) + ',\\ f(x)\\in\\mathbb{R}\\}'), ['Left to right for the domain; bottom to top for the range.'], 'EP domain/range');
        } },
        { id: 'e6f', level: 'PRG', make: function (r, sh) {
          return mc(r, '(h) Your answers to (a) each contained one number, while the “solve” answers contained different amounts. Why did that have to happen?', [
            { html: 'A function pairs each input with exactly one output, so asking for an output gives one number. Nothing limits how many inputs share an output, so “solve” can give none, one, several or infinitely many.', right: true },
            { html: 'Because the graph is made of straight pieces.', why: 'A curved graph behaves the same way. Think about the definition of a function.' },
            { html: 'Because ' + t('f(a)') + ' is read on the vertical axis and ' + t('f(x)=b') + ' on the horizontal axis.', why: 'It is the other way round: ' + t('f(a)') + ' starts on the horizontal axis. And the axis alone does not explain the number of answers.' },
            { html: 'A function pairs each output with exactly one input, so ' + t('f(a)') + ' can only have one answer.', why: 'A function restricts <b>inputs</b> (one output each), not outputs.' }],
            'A function pairs each input with <b>exactly one</b> output, so asking for an output, as in (a), can only return one number. Nothing limits how many inputs share an output, so “solve” questions can return one, several, a whole interval — or none.', ['What does the definition of a function say about inputs and outputs?'], 'EP why one vs many');
        } }] },
      { num: '7', shared: scaled2Shared, stem: function (sh) { return 'The graph of a function ' + t('g') + ' is shown below. <i>Each grid line represents ' + t(sh.sx) + ' units on the horizontal axis and ' + t(sh.sy) + ' units on the vertical axis.</i> Check the scale before every read.' + sh.fig; }, parts: [
        { id: 'e7a', level: 'EMG', make: function (r, sh) {
          var xs = [-6, -4, 0, 2].map(function (x) { return (sh.mi ? -x : x) * sh.sx; }).sort(function (a, b) { return a - b; });
          var items = xs.map(function (x) { var v = pwAt(sh.V, x); return { f: { label: t('g(' + x + ')='), name: 'g(' + x + ')' }, k: nf(v), c: K.number(v, function (u) { if (same(u * sh.sy, v) && sh.sy !== 1) return { code: 'read-scale', hint: 'Each grid line on the vertical axis is ' + t(sh.sy) + ' units.' }; if (same(u, cl(v * sh.sx / sh.sy))) return { code: 'read-scale', hint: 'The two axes have different scales: vertical grid lines are ' + t(sh.sy) + ' each.' }; return null; }) }; });
          return fieldsOf('(a) State each value.', items, xs.map(function (x) { return t('g(' + x + ')=' + pwAt(sh.V, x)); }).join(', '),
            'Horizontal: ' + t('1') + ' square ' + t('=' + sh.sx) + '; vertical: ' + t('1') + ' square ' + t('=' + sh.sy) + '.<br>' + xs.map(function (x) { return t('g(' + x + ')=' + pwAt(sh.V, x)); }).join(', '), ['Count squares, then multiply by the scale on that axis.'], 'EP scaled read');
        } },
        { id: 'e7b', level: 'LIM', make: function (r, sh) {
          var xs = [-6, -4, 0, 2].map(function (x) { return (sh.mi ? -x : x) * sh.sx; }).sort(function (a, b) { return a - b; }), pr = xs.map(function (x) { return [x, pwAt(sh.V, x)]; });
          return B.pairs('(b) Write the ordered pairs belonging to the four values in (a).', pr, {}, pr.map(function (p) { return t(ptT(p)); }).join(', '), ['(input, output)'], 'EP pairs scaled');
        } },
        { id: 'e7c', level: 'PRG', make: function (r, sh) {
          var bs = [2 * sh.sy, 4 * sh.sy, -5 * sh.sy], lab = ['(c)', '(d)', '(e)'];
          return BF('Solve each equation. (Press <b>none</b> if there is no solution.)', bs.map(function (b, i) { return solField(lab[i] + ' ' + t('g(x)=' + b), 'x'); }),
            bs.map(function (b) { return solsChk(pwSols(sh.V, b).pts, { b: b, graph: true, scale: sh.sx, noneHint: 'The lowest point of the graph is at ' + t(pwMin(sh.V)) + '. Is ' + t(b) + ' ever reached?' }); }),
            bs.map(function (b) { var s0 = pwSols(sh.V, b).pts; return s0.length ? solsKey(s0) : 'none'; }), bs.map(function (b, i) { var s0 = pwSols(sh.V, b).pts; return lab[i] + ' ' + (s0.length ? t(solsKey(s0)) : 'no solution'); }).join('<br>'),
            bs.map(function (b, i) { var s0 = pwSols(sh.V, b).pts; return lab[i] + ' ' + t(b) + ' is ' + t(Math.abs(b / sh.sy)) + ' squares ' + (b < 0 ? 'down' : 'up') + ': ' + (s0.length ? t(solsKey(s0)) : '<b>no solution</b> — it lies below the lowest point'); }).join('<br>'),
            ['Convert the height to squares first, read across, then convert each crossing back with the horizontal scale.'], 'EP solve on scaled graph');
        } },
        { id: 'e7d', level: 'EMG', make: function (r, sh) {
          var z = pwSols(sh.V, 0).pts;
          return BF('(f) Write the ' + t('x') + '-intercepts of the graph in function notation.', [solField(t('g(x)=0') + ' when', 'x')], [solsChk(z, { b: 0, graph: true, scale: sh.sx })], [solsKey(z)],
            z.map(function (x) { return t('g(' + x + ')=0'); }).join(', '), t('x') + '-intercepts: ' + z.map(function (x) { return t('g(' + x + ')=0'); }).join(', ') + '.', ['Where does the graph cross the ' + t('x') + '-axis? Use the horizontal scale.'], 'EP x-ints scaled');
        } },
        { id: 'e7e', level: 'EMG', outcome: 'RF2', make: function (r, sh) {
          var L = sh.V[0][0], Rr = sh.V[sh.V.length - 1][0];
          return drPart('(f) State the domain and range of ' + t('g') + '.', { dv: 'x', fname: 'g', D: [L, Rr], R: [pwMin(sh.V), pwMax(sh.V)], dW: [{ is: bld('x', L / sh.sx, Rr / sh.sx), code: 'read-scale', hint: 'Use the horizontal scale: each grid line is ' + t(sh.sx) + '.' }] },
            t(bld('x', L, Rr)) + '<br>' + t('\\{g(x)\\mid ' + cond('g(x)', pwMin(sh.V), pwMax(sh.V)) + ',\\ g(x)\\in\\mathbb{R}\\}'), ['Use each axis’s own scale.'], 'EP D/R scaled');
        } },
        { id: 'e7f', level: 'PRG', make: function (r, sh) {
          var pk = sh.G[sh.mi ? 2 : 1], real = [pk[0] * sh.sx, pk[1] * sh.sy];
          var p = B.math('(g) A student read ' + t('g(' + pk[0] + ')=' + pk[1]) + ' for the peak straight off the grid squares. Write the correct statement in function notation.', stmtChk('g', real[0], real[1], { grid: pk, scale: sh.sx + '\\text{ (across) and }' + sh.sy + '\\text{ (up)}' }), 'g(' + real[0] + ')=' + real[1],
            'The student counted grid squares instead of applying the scales. The peak is ' + t(Math.abs(pk[0])) + ' squares ' + (pk[0] < 0 ? 'left' : 'right') + ' and ' + t(pk[1]) + ' squares up: ' + t(Math.abs(pk[0]) + '\\times ' + sh.sx + '=' + Math.abs(real[0])) + ' and ' + t(pk[1] + '\\times ' + sh.sy + '=' + real[1]) + '.<br>Correct: ' + t('g(' + real[0] + ')=' + real[1]) + ', and the point ' + t(ptT(real)) + ' lies on the graph.',
            ['Multiply the horizontal count by ' + t(sh.sx) + ' and the vertical count by ' + t(sh.sy) + '.'], 'EP correct scaled statement', { keys: EQK, vars: ['g'] });
          p.bad = ['g(' + pk[0] + ')=' + pk[1], 'g(' + real[1] + ')=' + real[0]];
          return p;
        } }] },
      { num: '8', stem: 'No graph is given. For each item, decide whether you have been given an <b>input</b> or an <b>output</b>.', parts: [
        { id: 'e8a', level: 'PRG', make: function (r) {
          var a = r.pick([6, 6, 3, 4, 7]), c = r.pick([-2, -2, -1, -3, -5]);
          var rows = [{ id: 'r1', html: 'Find ' + t('f(' + a + ')') }, { id: 'r2', html: 'Solve ' + t('f(x)=' + a) }, { id: 'r3', html: 'Find ' + t('f(0)') }, { id: 'r4', html: 'Solve ' + t('f(x)=0') }, { id: 'r5', html: 'Given ' + t('f(k)=' + c) + ', find ' + t('k') }, { id: 'r6', html: 'Given ' + t('f(' + c + ')=k') + ', find ' + t('k') }];
          var cols = [{ id: 'in', html: 'Input given' }, { id: 'out', html: 'Output given' }];
          var want = { r1: 'in', r2: 'out', r3: 'in', r4: 'out', r5: 'out', r6: 'in' };
          return B.grid('Classify each item. (<b>Input given</b>: start on the horizontal axis — exactly one answer. <b>Output given</b>: start on the vertical axis — none, one or many answers.)', rows, cols, want, { why: function (row, got) {
            if (row === 'r5') return { code: 'row', hint: 'In ' + t('f(k)=' + c) + ' the number ' + t(c) + ' is after the equals sign — it is an <b>output</b>; the input ' + t('k') + ' is unknown.' };
            if (row === 'r6') return { code: 'row', hint: 'In ' + t('f(' + c + ')=k') + ' the number ' + t(c) + ' is in the brackets — it is an <b>input</b>; the output ' + t('k') + ' is unknown.' };
            return { code: 'row', hint: 'The number inside the brackets is the input; a number after ' + t('f(x)=') + ' is an output.' };
          } }, t('f(' + a + ')') + ', ' + t('f(0)') + ', ' + t('f(' + c + ')=k') + ': the input is given — start on the horizontal axis; exactly one answer.<br>' + t('f(x)=' + a) + ', ' + t('f(x)=0') + ', ' + t('f(k)=' + c) + ': the output is given — start on the vertical axis; none, one or many answers.',
            ['Look at where the known number sits: inside the brackets (input) or after the equals sign (output).'], 'EP input or output');
        } },
        { id: 'e8b', level: 'PRG', make: function (r) {
          var a = r.pick([6, 6, 2, 5, 9]);
          return mc(r, '(g) Why can “find ' + t('f(' + a + ')') + '” never produce two answers, while “solve ' + t('f(x)=' + a) + '” often does?', [
            { html: t('f(' + a + ')') + ' asks for the output at the single input ' + t(a) + ', and a function allows each input only one output. ' + t('f(x)=' + a) + ' asks which inputs share the output ' + t(a) + ' — any number may.', right: true },
            { html: 'Because ' + t(a) + ' is positive.', why: 'The sign of ' + t(a) + ' has nothing to do with it.' },
            { html: 'Because ' + t('f(x)=' + a) + ' is a quadratic equation and ' + t('f(' + a + ')') + ' is not.', why: 'The rule for ' + t('f') + ' is the same in both. What is given — an input or an output?' },
            { html: 'Because a function allows each output only one input.', why: 'That is backwards: a function allows each <b>input</b> only one output.' }],
            t('f(' + a + ')') + ' asks for the output at one input, and the definition of a function allows each input <b>only one</b> output. ' + t('f(x)=' + a) + ' asks which inputs share the output ' + t(a) + '; sharing an output is allowed, so any number of inputs may qualify.', ['Recall the definition of a function.'], 'EP why f(a) one answer');
        } }] },
      /* ---------------- Extra Part C ---------------- */
      { num: '9', section: 'Extra practice C — Models in function notation', shared: function (r) {
          var rate = r.pick([8.5, 8.5, 6.5, 7.5, 9.5]), fix = r.pick([22, 22, 15, 18, 25]), m1 = r.pick([12, 12, 6, 8, 10]), m2 = r.pick([8, 8, 4, 6, 10].filter(function (x) { return x !== m1; })), low = r.pick([15, 15, 10, 12].filter(function (x) { return x < fix; }));
          return { rate: rate, fix: fix, m1: m1, m2: m2, low: low, C: function (m) { return cl(rate * m + fix); } };
        }, stem: function (sh) { return 'A courier charges by mass. The cost of shipping a parcel is modelled by ' + t('C(m)=' + sh.rate + 'm+' + sh.fix) + ', where ' + t('C(m)') + ' is the cost, in dollars, of shipping a parcel of mass ' + t('m') + ' kilograms.'; }, parts: [
        { id: 'e9a', level: 'BEG', make: function (r, sh) {
          var v = sh.C(sh.m1);
          return B.number('(a) Determine ' + t('C(' + sh.m1 + ')') + '.', v, function (u) { if (same(u, cl(sh.rate * sh.m1))) return { code: 'no-fixed', hint: 'Add the fixed charge ' + t(sh.fix) + '.' }; return null; },
            t('C(' + sh.m1 + ')=' + sh.rate + '(' + sh.m1 + ')+' + sh.fix + '=' + cl(sh.rate * sh.m1) + '+' + sh.fix + '=' + v), ['Substitute ' + t('m=' + sh.m1) + '.'], 'EP C(m1)', { before: t('\\$') });
        } },
        { id: 'e9b', level: 'EMG', make: function (r, sh) {
          var v = sh.C(sh.m1);
          return meaningMC(r, '(b) Which sentence gives the meaning of your answer to (a)?', 'Shipping a ' + t(sh.m1) + ' kg parcel costs ' + t('\\$' + v) + '.', [
            { html: 'A parcel that costs ' + t('\\$' + sh.m1) + ' has a mass of ' + t(v) + ' kg.', why: 'Input and output are swapped: the input ' + t(sh.m1) + ' is a mass in kilograms.' },
            { html: 'Each kilogram costs ' + t('\\$' + v) + ' to ship.', why: t(v) + ' is the cost of the whole ' + t(sh.m1) + ' kg parcel.' },
            { html: t(v) + ' parcels of ' + t(sh.m1) + ' kg can be shipped.', why: 'The output of ' + t('C') + ' is a cost in dollars.' }],
            'Input ' + t(sh.m1) + ' kg, output ' + t('\\$' + v) + ': shipping a ' + t(sh.m1) + ' kg parcel costs ' + t('\\$' + v) + '.', ['Input: mass (kg). Output: cost ($).'], 'EP meaning C(m1)');
        } },
        { id: 'e9c', level: 'PRG', make: function (r, sh) {
          return meaningMC(r, '(c) Determine ' + t('C(0)') + ' and say what it represents.', t('C(0)=' + sh.fix) + ': the fixed charge paid before any mass is added (the ' + t('C') + '-intercept of the graph).', [
            { html: t('C(0)=0') + ': a parcel with no mass costs nothing.', why: 'Substitute ' + t('m=0') + ': ' + t(sh.rate + '(0)+' + sh.fix + '=' + sh.fix) + '.' },
            { html: t('C(0)=' + sh.rate) + ': the charge per kilogram.', why: t(sh.rate) + ' is the rate. ' + t('C(0)') + ' is the output when ' + t('m=0') + '.' },
            { html: t('C(0)=' + sh.fix) + ': the cost of a 1 kg parcel.', why: 'A 1 kg parcel costs ' + t('C(1)=' + sh.C(1)) + '. ' + t('C(0)') + ' is what is charged before any mass counts.' }],
            t('C(0)=' + sh.rate + '(0)+' + sh.fix + '=' + sh.fix) + ': the ' + t('\\$' + sh.fix) + ' fixed charge paid before any mass is added — the ' + t('C') + '-intercept.', ['Substitute ' + t('m=0') + '.'], 'EP meaning C(0)');
        } },
        { id: 'e9d', level: 'PRG', make: function (r, sh) {
          var y = sh.C(sh.m2);
          return B.number('(d) Solve ' + t('C(m)=' + y) + '. (A parcel that costs ' + t('\\$' + y) + ' to ship has what mass?)', sh.m2, function (u) {
            if (same(u, sh.C(y))) return { code: 'ev-instead', hint: 'You found ' + t('C(' + y + ')') + '. ' + t(y) + ' is the cost (the output): solve ' + t(sh.rate + 'm+' + sh.fix + '=' + y) + '.' };
            if (Math.abs(u - y / sh.rate) < 0.01) return { code: 'no-fixed', hint: 'Subtract the fixed charge ' + t(sh.fix) + ' first.' };
            return null;
          }, t(sh.rate + 'm+' + sh.fix + '=' + y) + '<br>' + t(sh.rate + 'm=' + cl(y - sh.fix)) + '<br>' + t('m=' + sh.m2) + '<br>A parcel that costs ' + t('\\$' + y) + ' to ship has a mass of ' + t(sh.m2) + ' kg.', ['The cost is the output.'], 'EP solve C(m)=b', { after: 'kg' });
        } },
        { id: 'e9e', level: 'PRG', make: function (r, sh) {
          var mv = cl((sh.low - sh.fix) / sh.rate);
          return mc(r, '(e) Solving ' + t('C(m)=' + sh.low) + ' gives ' + t('m=' + frT((sh.low - sh.fix) * 10, sh.rate * 10) + '\\approx ' + mv.toFixed(2)) + '. What does this tell you?', [
            { html: 'No parcel ships for ' + t('\\$' + sh.low) + ': a negative mass is impossible, because the fixed charge alone is ' + t('\\$' + sh.fix) + '.', right: true },
            { html: 'A very light parcel of about ' + t(Math.abs(mv).toFixed(2)) + ' kg ships for ' + t('\\$' + sh.low) + '.', why: 'The answer is <b>negative</b>. Even a parcel with no mass costs ' + t('C(0)=' + sh.fix) + '.' },
            { html: 'The courier gives a refund of ' + t('\\$' + Math.abs(mv).toFixed(2)) + '.', why: 'The solution is a mass, not money — and a negative mass makes no sense.' },
            { html: 'I made an error: every equation in a model must have a sensible answer.', why: 'The algebra is right. A model can give answers outside the situation; you have to check them.' }],
            t(sh.rate + 'm+' + sh.fix + '=' + sh.low) + ' gives ' + t('m\\approx ' + mv.toFixed(2)) + '. A negative mass is impossible: <b>no parcel</b> ships for ' + t('\\$' + sh.low) + ', since the fixed charge alone is ' + t('\\$' + sh.fix) + '.', ['Is the answer a possible mass?'], 'EP impossible solution');
        } },
        { id: 'e9f', level: 'PRG', make: function (r, sh) {
          var n = r.pick([90, 90, 60, 75]);
          return mc(r, '(f) “' + t('C(' + n + ')') + '” and “' + t('C(m)=' + n) + '” are different questions. Which describes them correctly?', [
            { html: t('C(' + n + ')') + ': what does it cost to ship a ' + t(n) + ' kg parcel? ' + t('C(m)=' + n) + ': what mass of parcel costs ' + t('\\$' + n) + ' to ship?', right: true },
            { html: t('C(' + n + ')') + ': what mass costs ' + t('\\$' + n) + '? ' + t('C(m)=' + n) + ': what does a ' + t(n) + ' kg parcel cost?', why: 'Swapped: in ' + t('C(' + n + ')') + ' the ' + t(n) + ' is in the brackets, so it is the input (a mass).' },
            { html: 'They ask the same thing, written two ways.', why: 'One gives the input and asks for the output; the other gives the output and asks for the input.' },
            { html: t('C(' + n + ')') + ' means ' + t('C\\times ' + n) + '; ' + t('C(m)=' + n) + ' means ' + t('C\\times m=' + n) + '.', why: t('C') + ' is the name of the function, not a number. The brackets hold the input.' }],
            '“' + t('C(' + n + ')') + '” gives the <b>input</b>: the cost of a ' + t(n) + ' kg parcel. “' + t('C(m)=' + n) + '” gives the <b>output</b>: the mass of a parcel that costs ' + t('\\$' + n) + '.', ['Where does ' + t(n) + ' sit in each one?'], 'EP C(a) vs C(m)=a');
        } }] },
      { num: '10', shared: function (r) {
          var c = r.pick([[21, 0.4, 40], [21, 0.4, 40], [18, 0.5, 30], [20, 0.25, 48], [22, 0.5, 36]]), T0 = c[0], k = c[1], Dp = c[2];
          var f = function (d) { return cl(T0 - k * d); }, d1 = r.pick([25, 25, 10, 20].filter(function (x) { return x < Dp; })), y3 = f(Dp);
          return { T0: T0, k: k, Dp: Dp, f: f, d1: d1, y3: y3 };
        }, stem: function (sh) { return 'In a deep mountain lake the water temperature drops steadily with depth. It is modelled by ' + t('T(d)=' + sh.T0 + '-' + sh.k + 'd') + ', where ' + t('T(d)') + ' is the temperature, in degrees Celsius, at a depth of ' + t('d') + ' metres. The lake is ' + t(sh.Dp) + ' m deep at its deepest point.'; }, parts: [
        { id: 'e10a', level: 'BEG', make: function (r, sh) {
          var items = [{ f: { label: '(a) ' + t('T(' + sh.d1 + ')='), name: 'T(' + sh.d1 + ')', after: '°C' }, k: nf(sh.f(sh.d1)), c: K.number(sh.f(sh.d1)) }, { f: { label: '(b) ' + t('T(0)='), name: 'T(0)', after: '°C' }, k: nf(sh.T0), c: K.number(sh.T0) }];
          return fieldsOf('Determine each value.', items, t('T(' + sh.d1 + ')=' + sh.f(sh.d1)) + ', ' + t('T(0)=' + sh.T0),
            t('T(' + sh.d1 + ')=' + sh.T0 + '-' + sh.k + '(' + sh.d1 + ')=' + sh.f(sh.d1)) + ': at a depth of ' + t(sh.d1) + ' m the water is ' + t(sh.f(sh.d1) + '\\,^{\\circ}\\text{C}') + '.<br>' + t('T(0)=' + sh.T0) + ': the surface temperature — the ' + t('T') + '-intercept of the graph.', ['Substitute each depth.'], 'EP lake values');
        } },
        { id: 'e10b', level: 'PRG', make: function (r, sh) {
          var y = sh.y3;
          return B.number('(c) Solve ' + t('T(d)=' + y) + '. At what depth is the water ' + t(y + '\\,^{\\circ}\\text{C}') + '?', sh.Dp, function (u) {
            if (same(u, sh.f(y))) return { code: 'ev-instead', hint: 'You found ' + t('T(' + y + ')') + '. ' + t(y) + ' is a temperature (the output): solve ' + t(sh.T0 + '-' + sh.k + 'd=' + y) + '.' };
            if (same(u, -sh.Dp)) return { code: 'sign', hint: 'Dividing a negative by a negative gives a positive depth.' };
            return null;
          }, t(sh.T0 + '-' + sh.k + 'd=' + y) + '<br>' + t('-' + sh.k + 'd=' + cl(y - sh.T0)) + '<br>' + t('d=' + sh.Dp) + ': the water is ' + t(y + '\\,^{\\circ}\\text{C}') + ' at a depth of ' + t(sh.Dp) + ' m, the deepest point of the lake.', ['The temperature is the output.'], 'EP solve T(d)=b', { after: 'm' });
        } },
        { id: 'e10c', level: 'PRG', make: function (r, sh) {
          var y = cl(sh.T0 + sh.k * 10);
          return mc(r, '(d) Solving ' + t('T(d)=' + y) + ' gives ' + t('d=-10') + '. Why is this not an answer to “at what depth is the water ' + t(y + '\\,^{\\circ}\\text{C}') + '?”', [
            { html: 'A depth of ' + t('-10') + ' m is not in the lake: the water is ' + t(sh.T0 + '\\,^{\\circ}\\text{C}') + ' at the surface and only gets colder going down, so it is never ' + t(y + '\\,^{\\circ}\\text{C}') + '.', right: true },
            { html: 'It means the water is ' + t(y + '\\,^{\\circ}\\text{C}') + ' at a depth of ' + t('10') + ' m.', why: 'Check: ' + t('T(10)=' + sh.f(10)) + ', not ' + t(y) + '.' },
            { html: 'It means 10 m above the lake the air is ' + t(y + '\\,^{\\circ}\\text{C}') + '.', why: 'The model is only about water in the lake; it says nothing about the air.' },
            { html: 'The equation was solved incorrectly.', why: 'Check by substituting: ' + t('T(-10)=' + y) + '. The algebra is right — the answer is outside the domain.' }],
            t(sh.T0 + '-' + sh.k + 'd=' + y) + ' gives ' + t('d=-10') + ', but depths in the lake run from ' + t('0') + ' to ' + t(sh.Dp) + ' m. The water is warmest at the surface, so it is <b>never</b> ' + t(y + '\\,^{\\circ}\\text{C}') + '.', ['Is ' + t('-10') + ' m a depth in the lake?'], 'EP outside domain (negative)');
        } },
        { id: 'e10d', level: 'PRG', make: function (r, sh) {
          var dd = sh.Dp + 5, y = sh.f(dd);
          return mc(r, '(e) Solving ' + t('T(d)=' + y) + ' gives ' + t('d=' + dd) + '. Why is there no answer in this lake?', [
            { html: 'The lake is only ' + t(sh.Dp) + ' m deep, so ' + t(dd) + ' m is outside the domain: the equation has a solution, but the situation has none.', right: true },
            { html: 'Because ' + t(y + '\\,^{\\circ}\\text{C}') + ' water would freeze.', why: 'Water at ' + t(y + '\\,^{\\circ}\\text{C}') + ' is not frozen. Compare ' + t(dd) + ' m with the depth of the lake.' },
            { html: 'There is an answer: ' + t(dd) + ' m.', why: 'How deep is the lake?' },
            { html: 'Because the answer should have been negative.', why: 'The answer ' + t(dd) + ' is correct algebra. The problem is the size of the lake.' }],
            t('d=' + dd) + ', but the lake is only ' + t(sh.Dp) + ' m deep, so ' + t(dd) + ' is outside the domain. The <i>equation</i> has a solution; the <i>situation</i> has <b>none</b>.', ['Compare the answer with the depth of the lake.'], 'EP outside domain (too deep)');
        } },
        { id: 'e10e', level: 'PRG', outcome: 'RF2', make: function (r, sh) {
          return drPart('(f) State a domain and a range for ' + t('T') + ' that fit the lake.', { dv: 'd', fname: 'T', D: [0, sh.Dp], R: [sh.y3, sh.T0], rW: [{ is: bld('y', 0, sh.T0), code: 'dr-from-zero', hint: 'The coldest water is at the bottom: ' + t('T(' + sh.Dp + ')=' + sh.y3) + '.' }] },
            t(bld('d', 0, sh.Dp)) + '<br>' + t('T(0)=' + sh.T0) + ' and ' + t('T(' + sh.Dp + ')=' + sh.y3) + ', so ' + t('\\{T(d)\\mid ' + cond('T(d)', sh.y3, sh.T0) + ',\\ T(d)\\in\\mathbb{R}\\}'), ['Depth runs from the surface to the bottom. Find ' + t('T') + ' at both.'], 'EP D/R lake');
        } }] },
      { num: '11', shared: function (r) {
          var a = r.pick([240, 240, 150, 200, 320]), s = r.pick([70, 70, 40, 50, 60]), top = a + 2 * s + r.pick([70, 30, 50]);
          return { V: [a, a + s, a + 2 * s, a + s, a, top], a: a, s: s };
        }, stem: function (sh) { return 'A ski hill records ' + t('V(t)') + ', the number of visitors on day ' + t('t') + ' of a six-day festival. The function is given entirely by the table below — there is no formula.' + HW.valueTable([[t('t') + ' (day)', 1, 2, 3, 4, 5, 6], [t('V(t)')].concat(sh.V)]); }, parts: [
        { id: 'e11a', level: 'BEG', make: function (r, sh) {
          return B.number('(a) State ' + t('V(3)') + '.', sh.V[2], function (u) { if (sh.V.indexOf(u) >= 0) return { code: 'diag', hint: 'Find ' + t('t=3') + ' in the top row and read the number below it.' }; return null; }, t('V(3)=' + sh.V[2]) + ': on day 3 of the festival, the hill had ' + t(sh.V[2]) + ' visitors.', ['Day 3 is in the top row.'], 'EP V(3) table', { after: 'visitors' });
        } },
        { id: 'e11b', level: 'EMG', make: function (r, sh) {
          var b1 = sh.a + sh.s, b2 = sh.a + sh.s - 10;
          return BF('Solve each equation. (Press <b>none</b> if there is no solution.)', [solField('(b) ' + t('V(t)=' + b1), 't'), solField('(c) ' + t('V(t)=' + b2), 't')],
            [solsChk([2, 4], { v: 't', b: b1, diag: function (A) { return A.length === 1 ? { code: 'sol-graph-missing', hint: t(b1) + ' appears more than once in the bottom row.' } : null; } }), solsChk([], { v: 't', b: b2, noneHint: t(b2) + ' never appears in the ' + t('V(t)') + ' row.' })],
            ['t=2,\\ t=4', 'none'], t('t=2,\\ t=4') + '; no solution',
            '(b) ' + t(b1) + ' sits under ' + t('t=2') + ' and ' + t('t=4') + ': the hill had ' + t(b1) + ' visitors on two separate days.<br>(c) ' + t(b2) + ' never appears in the ' + t('V(t)') + ' row: <b>no solution</b> — no day had exactly ' + t(b2) + ' visitors.', ['Look for the number in the bottom row; read the day above it.'], 'EP solve V(t)=b from table');
        } },
        { id: 'e11c', level: 'PRG', outcome: 'RF2', make: function (r, sh) {
          return mc(r, '(d) Why does the repeated output ' + t(sh.a) + ' not stop ' + t('V') + ' from being a function?', [
            { html: 'A function restricts <b>inputs</b>: each day appears once in the top row and has one visitor count. Two days sharing an output is allowed.', right: true },
            { html: 'It does stop it: ' + t('V') + ' is not a function.', why: 'Check the definition: is any <b>day</b> paired with two different visitor counts?' },
            { html: 'Because the table has no formula.', why: 'A function does not need a formula. What matters is one output for each input.' },
            { html: 'Because ' + t(sh.a) + ' is the smallest value.', why: 'Its size doesn’t matter. Look at the inputs: each day has exactly one count.' }],
            'A function restricts <i>inputs</i>: each day 1 to 6 appears exactly once in the top row, so each day has one visitor count. Two days sharing the output ' + t(sh.a) + ' is permitted.', ['Which row has to have no repeats for a function?'], 'EP repeated output ok');
        } },
        { id: 'e11d', level: 'EMG', outcome: 'RF2', make: function (r, sh) {
          return drPart('(e) State the domain and range of ' + t('V') + '. (Days are counted.)', { dv: 't', fname: 'V', disc: true, D: [1, 2, 3, 4, 5, 6], R: sh.V },
            'Days are counted, so ' + t('D=\\{1,2,3,4,5,6\\}') + ' (or ' + t('\\{t\\mid 1\\le t\\le 6,\\ t\\in I\\}') + ').<br>List each output once, increasing: ' + t('R=' + lst(sh.V)), ['List the values; each one once.'], 'EP D/R discrete table');
        } },
        { id: 'e11e', level: 'EMG', outcome: 'RF1', make: function (r, sh) {
          return mc(r, '(f) Would it be reasonable to join the six points on a graph with a line?', [
            { html: 'No: the data are discrete — there is no day 2.5, and visitors are counted per day.', right: true },
            { html: 'Yes: joining the points shows the trend between days.', why: 'A line would claim values for times like day 2.5, which the table does not have.' },
            { html: 'Yes: time is always continuous.', why: 'Here the input is a day number, and each day has one total.' },
            { html: 'No: because some outputs repeat.', why: 'Repeats have nothing to do with it. Think about which inputs are possible.' }],
            '<b>No.</b> The data are discrete — there is no day 2.5, and visitors are counted per day — so the six points are left unjoined.', ['Can ' + t('t') + ' be 2.5 here?'], 'EP discrete, do not join');
        } }] },
      { num: '12', shared: tankShared, stem: function (sh) { return 'A holding tank is filled, held, then drained. The graph shows ' + t('W(t)') + ', the volume of water in the tank, in litres, ' + t('t') + ' minutes after filling begins.' + sh.fig; }, parts: [
        { id: 'e12a', level: 'EMG', make: function (r, sh) {
          var xs = [0, sh.a - 1, sh.b - 1, 10].filter(function (x, i, a) { return a.indexOf(x) === i; });
          var items = xs.map(function (x) { var v = pwAt(sh.V, x); return { f: { label: t('W(' + x + ')='), name: 'W(' + x + ')', after: 'L' }, k: nf(v), c: K.number(v, function (u) { if (same(u * 50, v)) return { code: 'read-scale', hint: 'Each grid line on the vertical axis is ' + t('50') + ' L.' }; return null; }) }; });
          return fieldsOf('(a) State each value.', items, xs.map(function (x) { return t('W(' + x + ')=' + pwAt(sh.V, x)); }).join(', '), 'Vertical scale: 1 square ' + t('=50') + ' L.<br>' + xs.map(function (x) { return t('W(' + x + ')=' + pwAt(sh.V, x)) + ' L'; }).join(', '), ['Read up from each time to the graph.'], 'EP tank values');
        } },
        { id: 'e12b', level: 'EMG', make: function (r, sh) {
          var x = 9, v = pwAt(sh.V, x);
          return meaningMC(r, '(b) What is the meaning of ' + t('W(' + x + ')=' + v) + '?', t(x) + ' minutes after filling begins, the tank holds ' + t(v) + ' L of water.', [
            { html: 'After ' + t(v) + ' minutes the tank holds ' + t(x) + ' L of water.', why: 'Input and output are swapped: ' + t(x) + ' is the time.' },
            { html: 'The tank drains ' + t(v) + ' L in ' + t(x) + ' minutes.', why: t('W(' + x + ')') + ' is the amount in the tank at one moment, not an amount drained.' },
            { html: 'It takes ' + t(x) + ' minutes to fill the tank with ' + t(v) + ' L.', why: 'At ' + t('t=' + x) + ' the tank is draining, not filling. ' + t('W(' + x + ')') + ' is just how much is in it then.' }],
            t(x) + ' minutes after filling begins, the tank holds ' + t(v) + ' L of water.', ['Input: time (min). Output: volume (L).'], 'EP meaning W(9)');
        } },
        { id: 'e12c', level: 'PRG', make: function (r, sh) {
          var b = pwAt(sh.V, 9), s0 = pwSols(sh.V, b).pts;
          return solsPart('(c) Solve ' + t('W(t)=' + b) + '.', s0, { v: 't', b: b, graph: true },
            'Read across at ' + t(b) + ' L — one crossing while filling, one while draining: ' + t(solsKey(s0, 't')) + '. The tank holds ' + t(b) + ' L twice.', ['Read across from ' + t(b) + ' on the vertical axis.'], 'EP solve W(t)=b');
        } },
        { id: 'e12d', level: 'PRG', make: function (r, sh) {
          var Tg = bld('t', sh.a, sh.b);
          var p = B.math('(d) Solve ' + t('W(t)=' + sh.F) + '. Describe the answer exactly (as an inequality or a set).', K.set(Tg, { v: 't', wrong: [{ is: '\\{' + sh.a + ', ' + sh.b + '\\}', code: 'sol-graph-missing', hint: 'The graph is flat at ' + t(sh.F) + ' L for <b>every</b> ' + t('t') + ' from ' + t(sh.a) + ' to ' + t(sh.b) + ', not just at the ends.' }] }), cond('t', sh.a, sh.b),
            'The graph is flat at ' + t(sh.F) + ' L from ' + t('t=' + sh.a) + ' to ' + t('t=' + sh.b) + ': ' + t(cond('t', sh.a, sh.b)) + ' (every ' + t('t') + ' in the interval). The tank is full and being held.', ['Where is the graph at height ' + t(sh.F) + '? Is it a point or a stretch?'], 'EP interval solution', { keys: 'set', vars: ['t'], placeholder: 'e.g. 2 <= t <= 5' });
          p.good = ['[' + sh.a + ', ' + sh.b + ']', Tg]; p.bad = ['\\{' + sh.a + ', ' + sh.b + '\\}', '(' + sh.a + ', ' + sh.b + ')'];
          return p;
        } },
        { id: 'e12e', level: 'EMG', make: function (r, sh) {
          var hi = sh.F + 100, lo = sh.S;
          return BF('(e) Solve each equation.', [solField(t('W(t)=' + hi), 't'), solField(t('W(t)=' + lo), 't')],
            [solsChk([], { v: 't', b: hi, noneHint: 'The tank never holds more than ' + t(sh.F) + ' L.' }), solsChk([0], { v: 't', b: lo, diag: function (A) { return null; } })], ['none', 't=0'], 'no solution; ' + t('t=0'),
            t('W(t)=' + hi) + ': <b>no solution</b> — the tank never rises above ' + t(sh.F) + ' L.<br>' + t('W(t)=' + lo) + ': <b>one</b>, ' + t('t=0') + ' — the starting volume; draining stops at ' + t(sh.E) + ' L, so ' + t(lo) + ' L is never reached again.', ['Read across at each height; count every crossing.'], 'EP none and one');
        } },
        { id: 'e12f', level: 'EMG', outcome: 'RF2', make: function (r, sh) {
          return drPart('(f) State the domain and range of ' + t('W') + '.', { dv: 't', fname: 'W', D: [0, 12], R: [sh.S, sh.F], rW: [{ is: bld('y', sh.E, sh.F), code: 'dr-peak', hint: 'Use the lowest point of the whole graph: the tank starts at ' + t(sh.S) + ' L.' }] },
            t(bld('t', 0, 12)) + '<br>' + t('\\{W(t)\\mid ' + cond('W(t)', sh.S, sh.F) + ',\\ W(t)\\in\\mathbb{R}\\}'), ['Left to right, then lowest to highest.'], 'EP D/R tank');
        } },
        { id: 'e12g', level: 'PRG', outcome: 'RF1', make: function (r, sh) {
          var fr = cl((sh.F - sh.S) / sh.a), dr = cl((sh.F - sh.E) / (12 - sh.b));
          return mc(r, '(g) Is the tank filling faster than it drains, or the other way round?', [
            { html: 'Filling is faster: ' + t(sh.F - sh.S) + ' L in ' + t(sh.a) + ' min (' + t(fr) + ' L/min) versus draining ' + t(sh.F - sh.E) + ' L in ' + t(12 - sh.b) + ' min (' + t(dr) + ' L/min).', right: true },
            { html: 'Draining is faster: the draining piece of the graph is longer.', why: 'A longer piece means it takes <b>more</b> time. Compare litres per minute.' },
            { html: 'They are the same, because the tank ends up partly full.', why: 'Work out the litres per minute for each piece.' },
            { html: 'Draining is faster, because ' + t('W') + ' goes down.', why: 'Going down shows draining, not speed. Compare the steepness (L per minute).' }],
            'Filling: ' + t('W(0)=' + sh.S) + ' to ' + t('W(' + sh.a + ')=' + sh.F) + ' is ' + t(sh.F - sh.S) + ' L in ' + t(sh.a) + ' min, or ' + t(fr) + ' L/min. Draining: ' + t('W(' + sh.b + ')=' + sh.F) + ' to ' + t('W(12)=' + sh.E) + ' is ' + t(sh.F - sh.E) + ' L in ' + t(12 - sh.b) + ' min, or ' + t(dr) + ' L/min.', ['Compare litres per minute for the two pieces.'], 'EP compare rates');
        } }] },
      { num: '13', shared: function (r) { var rate = r.pick([15, 15, 10, 12, 20]), fix = r.pick([40, 40, 20, 25, 30]), mx = r.pick([8, 8, 6]); return { rate: rate, fix: fix, mx: mx, C: function (h) { return cl(rate * h + fix); }, h1: r.pick([3, 3, 2, 4]), h2: r.pick([5, 5, 4]) }; },
        stem: function (sh) { return 'A guide service rents sea kayaks. The charge is modelled by ' + t('C(h)=' + sh.rate + 'h+' + sh.fix) + ', where ' + t('C(h)') + ' is the cost, in dollars, of a rental lasting ' + t('h') + ' hours. Rentals are limited to ' + t(sh.mx) + ' hours.'; }, parts: [
        { id: 'e13a', level: 'EMG', outcome: 'RF1', make: function (r, sh) {
          var top = sh.C(sh.mx), SY = 20, ym = Math.ceil((top + 20) / 20) * 20;
          var I = padIn({ x: [0, 10], y: [0, ym], sx: 1, sy: SY, lx: 2, ly: 40, v: 'h', w: 'C(h)', xTitle: 'h (hours)', yTitle: 'C(h) (dollars)' });
          var S = segSketch({ f: sh.C, X0: 0, X1: sh.mx, sx: 1, sy: SY, name: 'C', v: 'h',
            start0: 'There is a base charge: ' + t('C(0)=' + sh.fix) + ', so the graph starts up the vertical axis, not at the origin.',
            endX: 'Rentals are limited to ' + t(sh.mx) + ' hours, so the graph ends at ' + t('h=' + sh.mx) + '.', arrow: 'Rentals stop at ' + t(sh.mx) + ' hours: end the graph with a solid dot there, not an arrow.',
            dir: 'A longer rental costs more, so the graph rises.' });
          var half = snapTo(sh.fix + sh.rate * sh.mx / 2, SY);
          var p = B.graph('(a) Sketch the graph of the rental cost.' + LINE_HELP, I, S.check, S.key,
            t('C(0)=' + sh.fix) + ' and ' + t('C(' + sh.mx + ')=' + sh.rate + '(' + sh.mx + ')+' + sh.fix + '=' + top) + ': a segment from ' + t(ptT([0, sh.fix])) + ' to ' + t(ptT([sh.mx, top])) + ' with solid dots at both ends' + (S.A[1] !== sh.fix || S.B[1] !== top ? ' (on this grid: ' + t(ptT(S.A)) + ' to ' + t(ptT(S.B)) + ')' : '') + '.',
            ['Find the cost at ' + t('0') + ' and at ' + t(sh.mx) + ' hours: those are the two ends.'], 'EP sketch kayak');
          p.bad = [drawing([seg([0, 0], [sh.mx, snapTo(sh.rate * sh.mx, SY)])]), drawing([seg(S.A, [10, snapTo(sh.C(10), SY)], 'closed', 'arrow')]), drawing([seg(S.A, [10, snapTo(sh.C(10), SY)])])];
          if (Math.abs(half - S.B[1]) > 1e-9) p.bad.push(drawing([seg(S.A, [sh.mx, half])]));
          return p;
        } },
        { id: 'e13b', level: 'BEG', make: function (r, sh) {
          var v = sh.C(sh.h1);
          return B.number('(b) Determine ' + t('C(' + sh.h1 + ')') + '.', v, null, t('C(' + sh.h1 + ')=' + sh.rate + '(' + sh.h1 + ')+' + sh.fix + '=' + v) + ': a ' + t(sh.h1) + '-hour rental costs ' + t('\\$' + v) + '.', ['Substitute ' + t('h=' + sh.h1) + '.'], 'EP C(h1)', { before: t('\\$') });
        } },
        { id: 'e13c', level: 'PRG', make: function (r, sh) {
          var y = sh.C(sh.h2);
          return B.number('(d) Solve ' + t('C(h)=' + y) + '. How long is a rental that costs ' + t('\\$' + y) + '?', sh.h2, function (u) { if (same(u, sh.C(y))) return { code: 'ev-instead', hint: t(y) + ' is the cost (the output): solve ' + t(sh.rate + 'h+' + sh.fix + '=' + y) + '.' }; if (Math.abs(u - y / sh.rate) < 0.01) return { code: 'no-fixed', hint: 'Subtract the base charge first.' }; return null; },
            t(sh.rate + 'h+' + sh.fix + '=' + y) + '<br>' + t(sh.rate + 'h=' + (y - sh.fix)) + '<br>' + t('h=' + sh.h2) + ': a rental that costs ' + t('\\$' + y) + ' lasts ' + t(sh.h2) + ' hours.', ['The cost is the output.'], 'EP solve C(h)=b', { after: 'hours' });
        } },
        { id: 'e13d', level: 'PRG', make: function (r, sh) {
          var y = sh.C(sh.mx) + 40, hv = cl((y - sh.fix) / sh.rate);
          return mc(r, '(e) Solving ' + t('C(h)=' + y) + ' gives ' + t('h\\approx ' + hv.toFixed(1)) + '. Why can’t the guide service fill an order for a ' + t('\\$' + y) + ' rental?', [
            { html: 'That is beyond the ' + t(sh.mx) + '-hour limit: the most a rental can cost is ' + t('C(' + sh.mx + ')=\\$' + sh.C(sh.mx)) + '.', right: true },
            { html: 'Because ' + t(hv.toFixed(1)) + ' is not a whole number of hours.', why: 'Part hours would be fine. Compare ' + t(hv.toFixed(1)) + ' with the limit.' },
            { html: 'Because ' + t('\\$' + y) + ' is less than the base charge.', why: 'It is more. Look at the time limit.' },
            { html: 'It can: the rental lasts about ' + t(hv.toFixed(1)) + ' hours.', why: 'Rentals are limited to ' + t(sh.mx) + ' hours.' }],
            t('h\\approx ' + hv.toFixed(1)) + ' is beyond the ' + t(sh.mx) + '-hour limit: the most a rental can cost is ' + t('C(' + sh.mx + ')=\\$' + sh.C(sh.mx)) + ', so <b>no rental</b> costs ' + t('\\$' + y) + '.', ['Compare the answer with the time limit.'], 'EP beyond limit');
        } },
        { id: 'e13e', level: 'PRG', outcome: 'RF2', make: function (r, sh) {
          return drPart('(f) State the domain and range of ' + t('C') + ' for this rental.', { dv: 'h', fname: 'C', D: [0, sh.mx], R: [sh.fix, sh.C(sh.mx)], rW: [{ is: bld('y', 0, sh.C(sh.mx)), code: 'dr-from-zero', hint: 'The cost starts at the base charge, ' + t('C(0)=' + sh.fix) + '.' }] },
            t(bld('h', 0, sh.mx)) + '<br>' + t('C(0)=' + sh.fix) + ' and ' + t('C(' + sh.mx + ')=' + sh.C(sh.mx)) + ', so ' + t('\\{C(h)\\mid ' + cond('C(h)', sh.fix, sh.C(sh.mx)) + ',\\ C(h)\\in\\mathbb{R}\\}'), ['Domain: 0 to the limit. Range: cost at both ends.'], 'EP D/R kayak');
        } }] },
      { num: '14', stem: 'Which sentence gives the meaning of each statement? (A number on its own is not an answer to any part of this question.)', parts: [
        { id: 'e14a', level: 'EMG', make: function (r) {
          var n = r.pick([140, 140, 120, 200]), v = r.pick([95, 95, 60, 150]);
          return meaningMC(r, '(a) ' + t('P(n)') + ' is a bakery’s profit, in dollars, from selling ' + t('n') + ' loaves, and ' + t('P(' + n + ')=' + v) + '.', 'Selling ' + t(n) + ' loaves gives the bakery a profit of ' + t('\\$' + v) + '.', [
            { html: 'Selling ' + t(v) + ' loaves gives a profit of ' + t('\\$' + n) + '.', why: 'Input and output are swapped: the input ' + t(n) + ' is the number of loaves.' },
            { html: 'Each loaf gives a profit of ' + t('\\$' + v) + '.', why: t('\\$' + v) + ' is the total profit from ' + t(n) + ' loaves.' },
            { html: 'The bakery needs ' + t(v) + ' loaves to make a profit.', why: t(v) + ' is the profit in dollars, not a number of loaves.' }],
            'Input ' + t(n) + ' loaves, output ' + t('\\$' + v) + ' profit: selling ' + t(n) + ' loaves gives a profit of ' + t('\\$' + v) + '.', ['Which is the input?'], 'EP meaning P(n)=b');
        } },
        { id: 'e14b', level: 'PRG', make: function (r) {
          var n = r.pick([60, 60, 45, 80]);
          return meaningMC(r, '(b) For the same bakery, the equation ' + t('P(n)=0') + ' has the solution ' + t('n=' + n) + '.', 'Selling ' + t(n) + ' loaves gives a profit of ' + t('\\$0') + ' — the bakery breaks even at ' + t(n) + ' loaves.', [
            { html: 'The bakery sells no loaves on ' + t(n) + ' days.', why: 'The input is a number of loaves; the output ' + t('0') + ' is the profit.' },
            { html: 'Selling no loaves gives a profit of ' + t('\\$' + n) + '.', why: 'Swapped: ' + t('n=' + n) + ' is the input that makes the profit ' + t('0') + '.' },
            { html: 'The bakery loses ' + t('\\$' + n) + '.', why: 'A profit of ' + t('0') + ' is neither a loss nor a gain.' }],
            t('P(' + n + ')=0') + ': selling ' + t(n) + ' loaves gives a profit of ' + t('\\$0') + ' — the bakery <b>breaks even</b>.', ['What does a profit of 0 mean?'], 'EP meaning P(n)=0');
        } },
        { id: 'e14c', level: 'PRG', make: function (r) {
          var a = r.pick([2, 2, 1, 3]), b = r.pick([5, 5, 4, 6]);
          return meaningMC(r, '(c) ' + t('D(t)') + ' is a driver’s distance from home, in kilometres, ' + t('t') + ' hours into a trip, and ' + t('D(' + a + ')=D(' + b + ')') + '.', 'The driver is the same distance from home ' + t(a) + ' hours into the trip as ' + t(b) + ' hours into the trip.', [
            { html: 'The driver travels the same distance in hour ' + t(a) + ' as in hour ' + t(b) + '.', why: t('D') + ' is the distance from home at a moment, not the distance travelled in an hour.' },
            { html: 'The driver is ' + t(a) + ' km from home after ' + t(b) + ' hours.', why: 'Both ' + t(a) + ' and ' + t(b) + ' are times (inputs). The statement compares two outputs.' },
            { html: 'The driver stopped between hour ' + t(a) + ' and hour ' + t(b) + '.', why: 'Not necessarily — the driver could have gone away and come back. The statement only compares two moments.' }],
            'Two inputs, ' + t(a) + ' h and ' + t(b) + ' h, have the same output: the driver is the <b>same distance</b> from home at both times.', ['Both numbers are times. What is equal?'], 'EP meaning D(a)=D(b)');
        } },
        { id: 'e14d', level: 'EMG', make: function (r) {
          var c = r.pick([3, 3, 2, 4]), y = r.pick([12, 12, 9, 10]);
          return meaningMC(r, '(d) ' + t('F(c)') + ' is the cost, in dollars, of ' + t('c') + ' cups of coffee, and solving ' + t('F(c)=' + y) + ' gives ' + t('c=' + c) + '.', t(c) + ' cups of coffee cost ' + t('\\$' + y) + '.', [
            { html: t(y) + ' cups of coffee cost ' + t('\\$' + c) + '.', why: 'Swapped: ' + t(y) + ' is the output (cost).' },
            { html: 'Each cup costs ' + t('\\$' + y) + '.', why: t('\\$' + y) + ' is the cost of all ' + t(c) + ' cups.' },
            { html: 'You can buy ' + t(y) + ' cups for ' + t('\\$' + c) + ' each.', why: 'Read it again: the output ' + t(y) + ' is in dollars.' }],
            t('F(' + c + ')=' + y) + ': ' + t(c) + ' cups of coffee cost ' + t('\\$' + y) + '.', ['Rewrite it as ' + t('F(\\ldots)=\\ldots') + '.'], 'EP meaning F(c)=b');
        } },
        { id: 'e14e', level: 'PRG', make: function (r) {
          var a = r.pick([4, 4, 3, 5]), b = r.pick([11, 11, 9, 12]), h = r.pick([20, 20, 15, 30]);
          return meaningMC(r, '(e) ' + t('H(t)') + ' is a drone’s height, in metres, ' + t('t') + ' seconds after launch, and ' + t('H(t)=' + h) + ' has the two solutions ' + t('t=' + a) + ' and ' + t('t=' + b) + '.', 'The drone is ' + t(h) + ' m above the ground twice: ' + t(a) + ' s after launch and again ' + t(b) + ' s after launch.', [
            { html: 'The drone climbs ' + t(h) + ' m between ' + t(a) + ' s and ' + t(b) + ' s.', why: 'At both times it is at the <b>same</b> height, ' + t(h) + ' m.' },
            { html: 'The drone stays at ' + t(h) + ' m from ' + t(a) + ' s to ' + t(b) + ' s.', why: 'Only those two times are solutions — in between it is at other heights.' },
            { html: 'The drone is ' + t(a) + ' m high after ' + t(h) + ' s and ' + t(b) + ' m high after ' + t(h) + ' s.', why: t(h) + ' is the height (output); ' + t(a) + ' and ' + t(b) + ' are times.' }],
            'The drone is ' + t(h) + ' m above the ground <b>twice</b>: ' + t(a) + ' s after launch (going up) and again ' + t(b) + ' s after launch (coming down).', ['Two times, one height.'], 'EP meaning two solutions');
        } },
        { id: 'e14f', level: 'PRG', make: function (r) {
          var h = r.pick([65, 65, 50, 80]);
          return meaningMC(r, '(f) For the same drone, ' + t('H(t)=' + h) + ' has no solution.', 'The drone never reaches a height of ' + t(h) + ' m.', [
            { html: 'The drone reaches ' + t(h) + ' m but we don’t know when.', why: 'No solution means no time at all gives that height.' },
            { html: 'The drone is ' + t(h) + ' m high at ' + t('t=0') + '.', why: 'That would be a solution, ' + t('t=0') + '.' },
            { html: 'The drone flies for ' + t(h) + ' seconds.', why: t(h) + ' is a height in metres (the output).' }],
            'No input gives the output ' + t(h) + ': the drone <b>never</b> reaches ' + t(h) + ' m.', ['What does “no solution” mean for a height?'], 'EP meaning no solution');
        } }] },
      /* ---------------- Extra Part D ---------------- */
      { num: '15', section: 'Extra practice D — Find the mistake', shared: function (r) { var a = r.pick([3, 3, 2, 4, 5]), b = r.pick([4, 4, 1, 3, 7]), k; do { k = r.int(2, 6); } while ((k + b) % a !== 0 || (k + b) / a === k); return { a: a, b: b, k: k }; },
        stem: function (sh) { return '<i>(Error analysis)</i> A function is defined by ' + t('f(x)=' + sh.a + 'x-' + sh.b) + '. Asked to <b>solve ' + t('f(x)=' + sh.k) + '</b>, a student writes: “' + t('f(' + sh.k + ')=' + sh.a + '(' + sh.k + ')-' + sh.b + '=' + (sh.a * sh.k - sh.b)) + ', so the answer is ' + t(sh.a * sh.k - sh.b) + '.”'; }, parts: [
        { id: 'e15a', level: 'EMG', make: function (r, sh) {
          return mc(r, '(a) What is the student’s error?', [
            { html: 'The student used ' + t(sh.k) + ' as the <b>input</b>. In ' + t('f(x)=' + sh.k) + ' the ' + t(sh.k) + ' is the <b>output</b>; the input ' + t('x') + ' is the unknown.', right: true },
            { html: 'An arithmetic slip: ' + t(sh.a + '(' + sh.k + ')-' + sh.b) + ' is not ' + t(sh.a * sh.k - sh.b) + '.', why: 'Check it: the arithmetic is right. The problem is which number was substituted.' },
            { html: 'The student should have substituted ' + t('x=0') + ' first.', why: 'That would give ' + t('f(0)') + ', which has nothing to do with this question.' },
            { html: 'There is no error.', why: 'Check the answer: is ' + t('f(' + (sh.a * sh.k - sh.b) + ')') + ' equal to ' + t(sh.k) + '?' }],
            'The student treated ' + t(sh.k) + ' as the input. In ' + t('f(x)=' + sh.k) + ', ' + t(sh.k) + ' is the output, and ' + t('x') + ' is what we must find.', ['Where is the ' + t(sh.k) + ' in ' + t('f(x)=' + sh.k) + '?'], 'EP solve vs evaluate error');
        } },
        { id: 'e15b', level: 'PRG', make: function (r, sh) {
          var x = (sh.k + sh.b) / sh.a;
          return B.number('(b) Solve ' + t('f(x)=' + sh.k) + ' correctly.', x, function (u) { if (same(u, sh.a * sh.k - sh.b)) return { code: 'ev-instead', hint: 'That is ' + t('f(' + sh.k + ')') + ' again. Set ' + t(sh.a + 'x-' + sh.b + '=' + sh.k) + ' and solve for ' + t('x') + '.' }; if (same(u, (sh.k - sh.b) / sh.a)) return { code: 'conv-move-sign', hint: 'Add ' + t(sh.b) + ' to both sides, don’t subtract.' }; return null; },
            t(sh.a + 'x-' + sh.b + '=' + sh.k) + '<br>' + t(sh.a + 'x=' + (sh.k + sh.b)) + '<br>' + t('x=' + x) + '<br>Check: ' + t('f(' + x + ')=' + sh.a * x + '-' + sh.b + '=' + sh.k) + ' ✓', ['Set the rule equal to ' + t(sh.k) + '.'], 'EP solve f(x)=k', { before: t('x=') });
        } },
        { id: 'e15c', level: 'EMG', make: function (r, sh) {
          var v = sh.a * sh.k - sh.b;
          var p = B.math('(c) The student’s ' + t(v) + ' is the correct answer to a different question. Write that question’s answer as a statement in function notation.', stmtChk('f', sh.k, v), 'f(' + sh.k + ')=' + v,
            '“What is the output when the input is ' + t(sh.k) + '?” — ' + t('f(' + sh.k + ')=' + v) + '.', ['The student substituted ' + t(sh.k) + ' as the input.'], 'EP statement f(k)=v', { keys: EQK, vars: ['f', 'x'] });
          p.bad = ['f(' + v + ')=' + sh.k, 'f(x)=' + sh.k];
          return p;
        } },
        { id: 'e15d', level: 'PRG', make: function (r, sh) {
          return mc(r, '(d) For the function ' + t('f(x)=x') + ', the student’s method gives the right answer to “solve ' + t('f(x)=' + sh.k) + '”. Does that rescue the method?', [
            { html: 'No: they agree only because ' + t('f(x)=x') + ' sends every input to itself. As soon as the rule changes its input, the method fails, as in (b).', right: true },
            { html: 'Yes: if it works once, it is a valid method.', why: 'One example can’t prove a method. Part (b) shows it fails for ' + t('f(x)=' + sh.a + 'x-' + sh.b) + '.' },
            { html: 'Yes: for linear functions the input and output are always equal.', why: 'Check ' + t('f(x)=' + sh.a + 'x-' + sh.b) + ': ' + t('f(' + sh.k + ')') + ' is not ' + t(sh.k) + '.' },
            { html: 'No: the method never gives a right answer.', why: 'It does here, by coincidence. The point is that a coincidence doesn’t make it a method.' }],
            'For ' + t('f(x)=x') + ': the student’s method gives ' + t('f(' + sh.k + ')=' + sh.k) + ', and the correct method gives ' + t('x=' + sh.k) + '. They agree only because this rule sends every input to itself. The method is still wrong, as (b) shows.', ['Try the method on the function in (b).'], 'EP coincidence');
        } }] },
      { num: '16', shared: function (r) {
          var h = r.pick([-1, -1, 1, -2, 2, 0]), k = r.pick([-4, -4, -1]), w = 3, g = function (x) { return (x - h) * (x - h) + k; };
          var fig = '<div class="fig">' + HW.graph({ x: [h - 4, h + 4], y: [k - 1, k + 11], grid: 1, labels: 2, xName: 'x', yName: 'g(x)', max: 300, fns: [{ f: g, from: h - w, to: h + w, start: 'closed', end: 'closed' }], aria: 'graph of the parabola g' }) + '</div>';
          return { h: h, k: k, w: w, g: g, top: k + 9, z: [h - Math.sqrt(-k), h + Math.sqrt(-k)], fig: fig };
        }, stem: function (sh) { return '<i>(Error analysis)</i> The graph of a function ' + t('g') + ' is shown. Asked to solve ' + t('g(x)=0') + ', a student answers “' + t('x=' + sh.z[1]) + '”. Asked to solve ' + t('g(x)=' + sh.top) + ', the same student answers “' + t('x=' + (sh.h + sh.w)) + '”.' + sh.fig; }, parts: [
        { id: 'e16a', level: 'EMG', make: function (r, sh) {
          var s1 = sh.z, s2 = [sh.h - sh.w, sh.h + sh.w];
          return BF('(a) Give the complete solution to each equation.', [solField(t('g(x)=0'), 'x'), solField(t('g(x)=' + sh.top), 'x')], [solsChk(s1, { b: 0, graph: true }), solsChk(s2, { b: sh.top, graph: true })], [solsKey(s1), solsKey(s2)],
            t(solsKey(s1)) + '; ' + t(solsKey(s2)), t('g(x)=0') + ': read along the ' + t('x') + '-axis — two crossings, ' + t(solsKey(s1)) + '.<br>' + t('g(x)=' + sh.top) + ': that height is reached at both endpoints, ' + t(solsKey(s2)) + '.', ['Keep reading across the whole graph.'], 'EP complete solutions parabola');
        } },
        { id: 'e16b', level: 'EMG', make: function (r, sh) {
          return mc(r, '(b) Which rule should the student follow after finding the first crossing?', [
            { html: 'Keep following the horizontal line across the <b>whole</b> graph and mark every further crossing — never stop at the first one.', right: true },
            { html: 'Stop: a function has only one answer.', why: 'A function has one output per <b>input</b>. Here you are given an output, and several inputs can share it.' },
            { html: 'Check the vertical line through the first crossing.', why: 'A vertical line finds outputs. To solve ' + t('g(x)=b') + ' you read across.' },
            { html: 'Use only the positive answer.', why: 'Negative inputs are just as valid if the graph is there.' }],
            'After the first crossing, keep following the horizontal line across the whole graph and mark every further crossing.', ['How many times can a horizontal line meet this curve?'], 'EP keep reading');
        } },
        { id: 'e16c', level: 'PRG', outcome: 'RF2', make: function (r, sh) {
          return mc(r, '(c) A second student says: “two different ' + t('x') + '-values give the same ' + t('y') + '-value, so ' + t('g') + ' is not a function.” Which correction is right?', [
            { html: 'A function restricts inputs, not outputs: two inputs may share an output. Every <b>vertical</b> line meets this graph at most once, so ' + t('g') + ' is a function.', right: true },
            { html: 'The student is right: ' + t('g') + ' fails the horizontal line test, so it is not a function.', why: 'The test for a function is the <b>vertical</b> line test.' },
            { html: 'The student is right, but only because the graph is curved.', why: 'Curves can be functions. Use the vertical line test.' },
            { html: t('g') + ' is a function because it has two ' + t('x') + '-intercepts.', why: 'Intercepts have nothing to do with it. Check vertical lines.' }],
            'A function restricts <i>inputs</i>: two different inputs may share an output. Every vertical line meets this graph at most once, so ' + t('g') + ' <b>is</b> a function. The two crossings lie on a <i>horizontal</i> line.', ['What does the vertical line test check?'], 'EP horizontal vs vertical');
        } },
        { id: 'e16d', level: 'ADV', make: function (r, sh) {
          var fl = [{ label: 'A value of ' + t('b') + ' with exactly <b>one</b> solution: ' + t('b='), name: 'one solution', mode: 'math', keys: 'fraction' }, { label: 'A value of ' + t('b') + ' with <b>no</b> solution: ' + t('b='), name: 'no solution', mode: 'math', keys: 'fraction' }];
          var cnt = function (b) { if (b < sh.k - 1e-9 || b > sh.top + 1e-9) return 0; if (same(b, sh.k)) return 1; return 2; };
          var mk = function (want) { return function (resp) { var a = K.read(resp); if (a.res) return a.res; var c = cnt(a.val); if (c === want) return ok(); return wrong('two-b', t('g(x)=' + nf(a.val)) + ' has ' + (c === 0 ? 'no solution' : c === 1 ? 'exactly one solution' : 'two solutions') + '. Draw the horizontal line at height ' + t(nf(a.val)) + ' and count.' + (want === 1 ? ' Look at the lowest point.' : '')); }; };
          var p = BF('(d) ' + t('g(x)=b') + ' for different values of ' + t('b') + ':', fl, [mk(1), mk(0)], [String(sh.k), String(sh.k - 2)], t('b=' + sh.k) + ' (only); for no solution any ' + t('b<' + sh.k) + ' or ' + t('b>' + sh.top) + ', e.g. ' + t('b=' + (sh.k - 2)),
            'The lowest point is ' + t(ptT([sh.h, sh.k])) + '.<br>' + t('b=' + sh.k) + ': exactly one solution, ' + t('x=' + sh.h) + '.<br>Any ' + t('b<' + sh.k) + ' (e.g. ' + t(sh.k - 2) + '), or any ' + t('b>' + sh.top) + ' (above both endpoints): no solution.', ['Look at the lowest point, and at the highest points of the graph.'], 'EP b for one / none');
          p.good = [[String(sh.k), String(sh.top + 3)]]; p.bad = [[String(sh.k + 1), String(sh.k - 2)], [String(sh.k), '0']];
          return p;
        } },
        { id: 'e16e', level: 'BEG', make: function (r, sh) {
          var xs = [0, sh.h === 0 ? 1 : sh.h].filter(function (x, i, a) { return a.indexOf(x) === i; });
          if (xs.length < 2) xs = [0, -1];
          var items = xs.map(function (x) { return { f: { label: t('g(' + x + ')='), name: 'g(' + x + ')', mode: 'math', keys: 'fraction' }, k: nf(sh.g(x)), c: K.value(sh.g(x)) }; });
          return fieldsOf('(e) State each value. (Each one gives an input, so there is only one answer.)', items, xs.map(function (x) { return t('g(' + x + ')=' + sh.g(x)); }).join(', '),
            xs.map(function (x) { return t('g(' + x + ')=' + sh.g(x)); }).join(', ') + '. Each gives an <i>input</i> and asks for the output; a function pairs each input with exactly one output.', ['Start on the horizontal axis.'], 'EP g at inputs');
        } }] },
      { num: '17', shared: function (r) { var k = r.pick([12, 12, 5, 8, 10]), c = r.pick([47, 47, 23, 31, 39]); return { k: k, c: c, k2: r.pick([8, 8, 3, 4, 6].filter(function (x) { return x !== k; })), c2: r.pick([32, 32, 15, 18, 24]) }; },
        stem: function (sh) { return '<i>(Error analysis)</i> A market sells apples by mass, and ' + t('C(k)') + ' is the cost, in dollars, of ' + t('k') + ' kilograms. It is known that ' + t('C(' + sh.k + ')=' + sh.c) + '. Three students interpret this.'; }, parts: [
        { id: 'e17a', level: 'EMG', make: function (r, sh) {
          return mc(r, '(a) Ava writes: “' + t('\\$' + sh.k) + ' buys ' + t(sh.c) + ' kg of apples.” What is the correct sentence?', [
            { html: t(sh.k) + ' kg of apples cost ' + t('\\$' + sh.c) + '.', right: true },
            { html: 'Ava is right.', why: 'In ' + t('C(' + sh.k + ')') + ' the ' + t(sh.k) + ' is in the brackets: it is the input, a mass.' },
            { html: t(sh.c) + ' kg of apples cost ' + t('\\$' + sh.k) + ' each.', why: 'The input ' + t(sh.k) + ' is the mass, and ' + t(sh.c) + ' is the total cost.' },
            { html: 'Each kilogram costs ' + t('\\$' + sh.c) + '.', why: t('\\$' + sh.c) + ' is the cost of all ' + t(sh.k) + ' kg.' }],
            'Ava swapped input and output. The input ' + t(sh.k) + ' is a mass in kilograms; the output ' + t(sh.c) + ' is a cost in dollars: ' + t(sh.k) + ' kg of apples cost ' + t('\\$' + sh.c) + '.', ['Which number is in the brackets?'], 'EP Ava swap');
        } },
        { id: 'e17b', level: 'BEG', make: function (r, sh) {
          return B.pairs('(b) Ben writes: “the point ' + t(ptT([sh.c, sh.k])) + ' lies on the graph of ' + t('y=C(k)') + '.” Write the correct point.', [[sh.k, sh.c]], {}, 'In ' + t('C(' + sh.k + ')=' + sh.c) + ' the input is ' + t(sh.k) + ', and an ordered pair lists the input first: ' + t(ptT([sh.k, sh.c])) + '.', ['(input, output)'], 'EP Ben point');
        } },
        { id: 'e17c', level: 'EMG', make: function (r, sh) {
          return mc(r, '(c) Cam writes: “' + t('C') + ' multiplied by ' + t(sh.k) + ' is ' + t(sh.c) + '.” What is his error?', [
            { html: t('C') + ' is the <b>name</b> of the function, not a number; the brackets in ' + t('C(' + sh.k + ')') + ' mark the input (“' + t('C') + ' of ' + t(sh.k) + '”), not multiplication.', right: true },
            { html: 'He should have divided: ' + t('C=' + sh.c + '\\div ' + sh.k) + '.', why: t('C') + ' is not an unknown number to solve for; it names the function.' },
            { html: 'He swapped ' + t(sh.k) + ' and ' + t(sh.c) + '.', why: 'The order is right. The problem is reading the brackets as multiplication.' },
            { html: 'There is no error: ' + t('C(' + sh.k + ')') + ' means ' + t('C\\times ' + sh.k) + '.', why: 'In function notation, brackets after a function name hold the input.' }],
            t('C') + ' is the name of the function, so it cannot be multiplied. ' + t('C(' + sh.k + ')') + ' is read “' + t('C') + ' of ' + t(sh.k) + '”: the output when the input is ' + t(sh.k) + '.', ['How is ' + t('C(' + sh.k + ')') + ' read aloud?'], 'EP Cam multiply');
        } },
        { id: 'e17d', level: 'PRG', make: function (r, sh) {
          var c2 = sh.c2, k2 = sh.k2;
          var eqChk = function (resp) {
            var s = clean(resp).replace(/\s+/g, ''); if (!s) return form('empty', 'Type the equation.');
            var parts = s.split('='); if (parts.length !== 2) return form('unreadable', 'Write an equation such as ' + t('C(k)=10') + '.');
            var m = /^([A-Za-z])\(([A-Za-z])\)$/.exec(parts[0]), R = parts[1];
            if (!m) { m = /^([A-Za-z])\(([A-Za-z])\)$/.exec(parts[1]); R = parts[0]; }
            if (!m) { var st = stmtRead(resp); if (st && same(st.b, c2)) return wrong('stmt-swap', 'The mass is unknown, so the brackets hold the variable ' + t('k') + ': ' + t('C(k)=' + c2) + '.'); if (st && same(st.a, c2)) return wrong('stmt-swap', t(c2) + ' is a cost — the output. It goes after the equals sign, and the unknown mass ' + t('k') + ' goes in the brackets.'); return form('unreadable', 'Write the equation to solve, with the unknown mass in the brackets: ' + t('C(\\ldots)=\\ldots') + '.'); }
            if (m[1] !== 'C') return wrong('stmt-name', 'The function is named ' + t('C') + '.');
            var v = numVal(R); if (v == null) return form('unreadable', 'The right side should be a number.');
            if (same(v, c2)) return ok();
            return wrong('value', null);
          };
          var fl = [{ label: 'Statement: “' + t(k2) + ' kg of apples cost ' + t('\\$' + c2) + '”', name: 'statement', mode: 'math', keys: EQK, vars: ['C', 'k'] }, { label: 'Question: “how many kilograms can be bought for ' + t('\\$' + c2) + '?” Solve', name: 'question', mode: 'math', keys: EQK, vars: ['C', 'k'] }];
          var p = BF('(d) Write each in function notation.', fl, [stmtChk('C', k2, c2), eqChk], ['C(' + k2 + ')=' + c2, 'C(k)=' + c2], t('C(' + k2 + ')=' + c2) + '; solve ' + t('C(k)=' + c2),
            'Input ' + t(k2) + ' kg, output ' + t('\\$' + c2) + ': ' + t('C(' + k2 + ')=' + c2) + '.<br>The question gives the output ' + t('\\$' + c2) + ' and asks for the input: solve ' + t('C(k)=' + c2) + '.', ['Mass goes in the brackets; cost goes after the equals sign.'], 'EP write statement and equation');
          p.bad = [['C(' + c2 + ')=' + k2, 'C(k)=' + c2], ['C(' + k2 + ')=' + c2, 'C(' + c2 + ')=k']];
          return p;
        } },
        { id: 'e17e', level: 'PRG', make: function (r, sh) {
          var s = sh.k + sh.c;
          return mc(r, '(e) Which statement about ' + t('C(' + sh.k + ')=' + sh.c) + ' and ' + t('C(' + sh.c + ')=' + sh.k) + ' is true?', [
            { html: 'They are different claims, about the points ' + t(ptT([sh.k, sh.c])) + ' and ' + t(ptT([sh.c, sh.k])) + '; both hold for ' + t('f(x)=' + s + '-x') + ' (though that is not a sensible price list).', right: true },
            { html: 'They say the same thing, written two ways.', why: 'In one, ' + t(sh.k) + ' kg cost ' + t('\\$' + sh.c) + '; in the other ' + t(sh.c) + ' kg cost ' + t('\\$' + sh.k) + '. Different points.' },
            { html: 'They can never both be true for a function.', why: 'Try ' + t('f(x)=' + s + '-x') + ': ' + t('f(' + sh.k + ')=' + sh.c) + ' and ' + t('f(' + sh.c + ')=' + sh.k) + '.' },
            { html: 'Both hold for ' + t('f(x)=x+' + (sh.c - sh.k)) + '.', why: 'Check: ' + t('f(' + sh.c + ')=' + (2 * sh.c - sh.k)) + ', not ' + t(sh.k) + '.' }],
            t('C(' + sh.k + ')=' + sh.c) + ': ' + t(sh.k) + ' kg cost ' + t('\\$' + sh.c) + '. ' + t('C(' + sh.c + ')=' + sh.k) + ': ' + t(sh.c) + ' kg cost ' + t('\\$' + sh.k) + '. They are about two different points. Both hold for any function through both points, e.g. ' + t('f(x)=' + s + '-x') + ' — not sensible for apples, since more apples should cost more.', ['Write each claim as an ordered pair.'], 'EP C(a)=b vs C(b)=a');
        } }] },
      /* ---------------- Extra Part E ---------------- */
      { num: '18', section: 'Extra practice E — A stretch, and three for the test', shared: stretchShared, stem: function (sh) { return '<i>(Stretch)</i> The graph of a function ' + t('f') + ' is made of three straight pieces joined end to end, through ' + sh.V.map(ptT).map(t).join(', ') + '.' + sh.fig; }, parts: [
        { id: 'e18a', level: 'EMG', make: function (r, sh) {
          var xs = [-4, 0, 4], items = xs.map(function (x) { return { f: { label: t('f(' + x + ')='), name: 'f(' + x + ')' }, k: nf(pwAt(sh.V, x)), c: K.number(pwAt(sh.V, x)) }; });
          return fieldsOf('(a) State each value.', items, xs.map(function (x) { return t('f(' + x + ')=' + pwAt(sh.V, x)); }).join(', '), xs.map(function (x) { return t('f(' + x + ')=' + pwAt(sh.V, x)); }).join(', ') + ': three different inputs share one output, which a function is allowed to do.', ['Read up or down from each input.'], 'EP stretch values');
        } },
        { id: 'e18b', level: 'EMG', make: function (r, sh) {
          var bs = [sh.sy, 5 * sh.sy];
          return BF('(b) Solve each equation.', bs.map(function (b) { return solField(t('f(x)=' + b), 'x'); }), bs.map(function (b) { return solsChk(pwSols(sh.V, b).pts, { b: b, graph: true }); }), bs.map(function (b) { return solsKey(pwSols(sh.V, b).pts); }),
            bs.map(function (b) { return t(solsKey(pwSols(sh.V, b).pts)); }).join('; '), bs.map(function (b) { return t('f(x)=' + b) + ': ' + t(solsKey(pwSols(sh.V, b).pts)); }).join('<br>'), ['Read across; count every crossing.'], 'EP stretch solve');
        } },
        { id: 'e18c', level: 'PRG', make: function (r, sh) {
          var b = -2 * sh.sy, s0 = pwSols(sh.V, b).pts;
          return solsPart('(c) Solve ' + t('f(x)=' + b) + '. There are two answers and neither lands on a grid line.', s0, { b: b, graph: true },
            'From the ' + (sh.fl ? 'high' : 'low') + ' point, height ' + t(b) + ' is ' + t('1') + ' unit ' + (sh.fl ? 'down' : 'up') + '. Each piece there changes ' + t('2') + ' per ' + t('1') + ' across, so that is ' + t('\\tfrac{1}{2}') + ' unit sideways: ' + t(solsKey(s0)) + '. The short piece (' + sh.nm.short + ') never reaches ' + t(b) + '.', ['Use the slope of each piece near the ' + sh.nm.near + '.'], 'EP stretch half-unit');
        } },
        { id: 'e18d', level: 'EMG', make: function (r, sh) {
          var bs = [6 * sh.sy, -3 * sh.sy];
          return BF('(d) Solve each equation. (Press <b>none</b> if there is no solution.)', bs.map(function (b) { return solField(t('f(x)=' + b), 'x'); }), bs.map(function (b) { return solsChk(pwSols(sh.V, b).pts, { b: b, graph: true }); }),
            bs.map(function (b) { var s0 = pwSols(sh.V, b).pts; return s0.length ? solsKey(s0) : 'none'; }), bs.map(function (b) { var s0 = pwSols(sh.V, b).pts; return s0.length ? t(solsKey(s0)) : 'no solution'; }).join('; '),
            t('f(x)=' + bs[0]) + ': <b>no solution</b> — the graph never goes beyond ' + t(5 * sh.sy) + '.<br>' + t('f(x)=' + bs[1]) + ': <b>exactly one</b>, ' + t(solsKey(pwSols(sh.V, bs[1]).pts)) + ', where ' + sh.nm.meetLow + ' meet.', ['Find the highest and lowest points.'], 'EP stretch none / one');
        } },
        { id: 'e18e', level: 'MAS', make: function (r, sh) {
          var tg = sh.fl ? '\\{b\\mid -5<b\\le 1,\\ b\\in\\mathbb{R}\\}' : '\\{b\\mid -1\\le b<5,\\ b\\in\\mathbb{R}\\}';
          var p = B.math('(e) For which values of ' + t('b') + ' does ' + t('f(x)=b') + ' have exactly <b>three</b> solutions? (Write an inequality or a set.)', K.set(tg, { v: 'b', wrong: [
            { is: sh.fl ? '\\{b\\mid -5\\le b\\le 1,\\ b\\in\\mathbb{R}\\}' : '\\{b\\mid -1\\le b\\le 5,\\ b\\in\\mathbb{R}\\}', code: 'stretch-b', hint: 'Check ' + t('b=' + 5 * sh.sy) + ': the ' + sh.nm.top + ' is a single point shared by two pieces, so that height gives only two solutions.' },
            { is: sh.fl ? '\\{b\\mid -5<b<1,\\ b\\in\\mathbb{R}\\}' : '\\{b\\mid -1<b<5,\\ b\\in\\mathbb{R}\\}', code: 'stretch-b', hint: 'Check ' + t('b=' + -sh.sy) + ': the endpoint of ' + sh.nm.shortThe + ' counts — that height gives three solutions.' },
            { is: sh.fl ? '\\{b\\mid -5<b<3,\\ b\\in\\mathbb{R}\\}' : '\\{b\\mid -3<b<5,\\ b\\in\\mathbb{R}\\}', code: 'stretch-b', hint: 'The short piece (' + sh.nm.short + ') only reaches ' + t(-sh.sy) + '. Beyond that, only two pieces are crossed.' }] }), sh.fl ? '-5<b\\le 1' : '-1\\le b<5',
            sh.nm.Long + ' cover heights from ' + t(Math.min(-3 * sh.sy, 5 * sh.sy)) + ' to ' + t(Math.max(-3 * sh.sy, 5 * sh.sy)) + '; ' + sh.nm.short + ' only covers ' + t(Math.min(-sh.sy, 5 * sh.sy)) + ' to ' + t(Math.max(-sh.sy, 5 * sh.sy)) + '. Each piece is crossed once for heights strictly between the extremes it covers, and at ' + t('b=' + -sh.sy) + ' the endpoint of ' + sh.nm.short + ' counts too (three solutions). At ' + t('b=' + 5 * sh.sy) + ' ' + sh.nm.shareTop + ' share the ' + sh.nm.top + ' — only two.<br>' + t(sh.fl ? '-5<b\\le 1' : '-1\\le b<5'),
            ['For each piece, write the range of heights it covers. Then check the edges one at a time.'], 'EP stretch three solutions', { keys: 'set', vars: ['b'], placeholder: 'e.g. -2 < b <= 3' });
          p.good = [tg, sh.fl ? '(-5, 1]' : '[-1, 5)'];
          return p;
        } },
        { id: 'e18f', level: 'PRG', make: function (r, sh) {
          var s = sh.sy, lo = -3 * s, mid = -s, hi = 5 * s;
          var iv = s > 0 ? t(lo + '<b<' + mid) : t(mid + '<b<' + lo);
          return mc(r, '(f) Which describes every value of ' + t('b') + ' for which ' + t('f(x)=b') + ' has exactly <b>two</b> solutions?', [
            { html: iv + ' or ' + t('b=' + hi), right: true },
            { html: iv + ' only', why: 'Check ' + t('b=' + hi) + ': the ' + sh.nm.end + ' and the ' + sh.nm.top + ' are both at that height — two solutions.' },
            { html: s > 0 ? t(lo + '\\le b\\le ' + mid) : t(mid + '\\le b\\le ' + lo), why: 'Check the edges: ' + t('b=' + lo) + ' gives one solution and ' + t('b=' + mid) + ' gives three.' },
            { html: t('b=' + hi) + ' only', why: 'Heights between ' + t(lo) + ' and ' + t(mid) + ' are reached by only two pieces — ' + sh.nm.shortThe + ' stops at ' + t(mid) + '.' }],
            iv + ': only ' + sh.nm.long + ' reach these heights, one crossing each. <b>And</b> ' + t('b=' + hi) + ': the ' + sh.nm.end + ' and the ' + sh.nm.top + '. Edges: ' + t('b=' + lo) + ' gives one solution and ' + t('b=' + mid) + ' gives three, so both are excluded.', ['Check the top and the bottom of every piece.'], 'EP stretch two solutions');
        } },
        { id: 'e18g', level: 'PRG', make: function (r, sh) {
          var s = sh.sy;
          return mc(r, '(g) If the end point ' + t(ptT([5 * sh.sx, -s])) + ' were moved to ' + t(ptT([5 * sh.sx, -3 * s])) + ', when would ' + t('f(x)=b') + ' have exactly two solutions?', [
            { html: 'Only at ' + t('b=' + 5 * s) + ' and ' + t('b=' + -3 * s) + ': all three pieces would reach every height in between.', right: true },
            { html: 'The same values as in (f).', why: 'The interval in (f) came from ' + sh.nm.shortThe + ' stopping short. If it reaches ' + t(-3 * s) + ', that gap closes.' },
            { html: 'Never.', why: 'Check ' + t('b=' + 5 * s) + ': the ' + sh.nm.end + ' and the ' + sh.nm.top + ' share that height.' },
            { html: 'For every ' + t('b') + ' between ' + t(-3 * s) + ' and ' + t(5 * s) + '.', why: 'In between, all three pieces are crossed — three solutions.' }],
            sh.nm.Long + ' reach ' + t(-3 * s) + ' but ' + sh.nm.short + ' stopped at ' + t(-s) + ': that gap is exactly the interval in (f). If ' + sh.nm.short + ' reached ' + t(-3 * s) + ' too, every height strictly between the extremes would give three solutions, and exactly two would occur only at ' + t('b=' + 5 * s) + ' and ' + t('b=' + -3 * s) + '.', ['Which pieces reach which heights?'], 'EP stretch what-if');
        } }] },
      { num: '19', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: 'e19', level: 'EMG', make: function (r) {
          var a = r.pick([4, 4, 2, 3, 6]), b = r.pick([31, 31, 18, 22, 40]);
          return mc(r, 'A courier’s cost function satisfies ' + t('C(' + a + ')=' + b) + ', where ' + t('C(m)') + ' is the cost, in dollars, of shipping a parcel of mass ' + t('m') + ' kilograms. Which statement must be true?', [
            { html: 'A parcel costing ' + t('\\$' + a) + ' has a mass of ' + t(b) + ' kg.', why: 'That swaps input and output.' },
            { html: 'Shipping a ' + t(a) + ' kg parcel costs ' + t('\\$' + b) + '.', right: true },
            { html: t('C') + ' multiplied by ' + t(a) + ' equals ' + t(b) + '.', why: t('C') + ' names the function; the brackets hold the input.' },
            { html: t('C(' + b + ')=' + a) + '.', why: 'That is a different claim, which need not be true.' }],
            t('C(' + a + ')=' + b) + ': input ' + t(a) + ' kg, output ' + t('\\$' + b) + '. Only “Shipping a ' + t(a) + ' kg parcel costs ' + t('\\$' + b) + '” reads ' + t(a) + ' as the mass and ' + t(b) + ' as the cost.', ['Input in the brackets; output after the equals sign.'], 'EP MC C(a)=b');
        } }] },
      { num: '20', shared: flatShared, stem: function (sh) { return '<i>(Multiple Choice)</i> For the function ' + t('f') + ' graphed below (the graph from Extra 6),' + sh.fig; }, parts: [
        { id: 'e20', level: 'PRG', make: function (r, sh) {
          var b = 2 * sh.sy;
          return mc(r, 'the equation ' + t('f(x)=' + b) + ' has', [
            { html: 'one solution', why: 'Look again at the flat piece.' }, { html: 'two solutions', why: 'The flat piece is at that height for a whole interval of ' + t('x') + '-values.' },
            { html: 'three solutions', why: 'The ends of the flat piece aren’t the only points there — every point on it counts.' }, { html: 'infinitely many solutions', right: true }],
            'The line ' + t('y=' + b) + ' crosses one piece, then lies <b>along</b> the flat piece for every ' + t('x') + ' in an interval — infinitely many points.', ['Draw the horizontal line at height ' + t(b) + '.'], 'EP MC flat piece');
        } }] },
      { num: '21', stem: '<i>(Numerical Response)</i>', parts: [
        { id: 'e21', level: 'ADV', make: function (r) {
          var p = r.pick([9, 9, 5, 6, 7, 8, 10]), q = r.pick([-3, -3, -1, -2, -4, -5].filter(function (x) { return p + x > 0; })), b = p + q, c = -p * q;
          return B.nr('A function is defined by ' + t('f(x)=x^{2}-' + (b === 1 ? '' : b) + 'x') + '. The equation ' + t('f(x)=' + c) + ' has two solutions, ' + t('p') + ' and ' + t('q') + ', with ' + t('p>q') + '. The value of ' + t('p-q') + ' is ________.', p - q, function (u) {
            if (same(u, b)) return { code: 'diag', hint: 'That is ' + t('p+q') + '. The question asks for ' + t('p-q') + '.' };
            if (same(u, p + Math.abs(q) - 2 * Math.abs(q)) || same(u, q - p)) return { code: 'sign', hint: t('q') + ' is negative: ' + t('p-q=' + p + '-(' + q + ')') + '.' };
            return null;
          }, t('x^{2}-' + (b === 1 ? '' : b) + 'x=' + c) + '<br>' + t('x^{2}-' + (b === 1 ? '' : b) + 'x-' + c + '=0') + '<br>' + t('(x-' + p + ')(x+' + (-q) + ')=0') + '<br>' + t('x=' + p) + ' or ' + t('x=' + q) + ', so ' + t('p=' + p) + ', ' + t('q=' + q) + '<br>' + t('p-q=' + p + '-(' + q + ')=' + (p - q)),
            ['Move ' + t(c) + ' to the left side and factor.'], 'EP NR p-q');
        } }] }
    ]
  });
})(window);
