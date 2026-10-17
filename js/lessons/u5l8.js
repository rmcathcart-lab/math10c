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
 * Sketches become multiple choice between four small graphs; explain / interpret questions become multiple choice with
 * misconception hints. Levels: LIM BEG EMG PRG ADV MAS. */
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
    'nr-yint': 'Gave the y-intercept', 'nr-flip': 'Divided the wrong way', 'nr-const': 'Gave the constant', 'stretch-b': 'Wrong set of heights'
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
  function solField(label, v) { return { label: label, name: label, mode: 'math', keys: 'solutions', vars: [v || 'x'], none: true, placeholder: 'e.g. ' + (v || 'x') + ' = 3, ' + (v || 'x') + ' = -5' }; }

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
    var p = B.fields(prompt, fl, [cD, cR], [Dt, Rshow], t('D=' + Dt) + '<br>' + t('R=' + Rshow), sol, hints, text);
    p.good = o.disc ? [] : [[ivAlt(Dt), ivAlt(Ry)], [cond(dv, o.D[0], o.D[1]), cond(fx, o.R[0], o.R[1])], [Dt, Ry]];
    p.bad = [[Ry, Dt]].concat((o.dW || []).map(function (w) { return [w.is, Rshow]; })).concat((o.rW || []).map(function (w) { return [Dt, w.is]; })).filter(function (b) { return !(S.eq(S.parse(b[0]).set, S.parse(Dt).set) && S.eq(S.parse(toY(b[1], fname, dv)).set, S.parse(Ry).set)); });
    return p;
  }

  /* ---------------- small builders ---------------- */
  function mc(r, prompt, opts, sol, hints, text, keepOrder) { return B.mc(r, prompt, opts, sol, hints, text, keepOrder); }
  function graphMC(r, prompt, opts, sol, hints, text) { var p = B.mc(r, prompt, opts, sol, hints, text); p.input.columns = 2; return p; }
  function numF(label, v, diag) { return { f: { label: label, name: label, mode: 'math', keys: 'fraction' }, c: K.value(v, { diag: diag }), k: nf(v) }; }
  function fieldsOf(prompt, items, answer, sol, hints, text) {
    return B.fields(prompt, items.map(function (x) { return x.f; }), items.map(function (x) { return x.c; }), items.map(function (x) { return x.k; }), answer, sol, hints, text);
  }
  /* a small context graph for the sketch multiple choice */
  function ctxGraph(o, segs, fns) {
    var sx = o.x[1] - o.x[0], sy = o.y[1] - o.y[0];
    return HW.graph({ x: o.x, y: o.y, grid: o.gx, gridY: o.gy, labels: o.lx, labelsX: o.lx, labelsY: o.ly, unitX: 170 / sx, unitY: 140 / sy, firstQuadrant: o.fq !== false,
      xName: o.xName, yName: o.yName, max: 210, segs: segs || [], fns: fns || [], aria: 'sketch option' });
  }

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
    var q = r.pick([4, 4, 2, 3]), p = r.pick({ 2: [3, 5, 7], 3: [4, 5, 7, 8], 4: [5, 7, 7, 9] }[q]), c = r.pick([5, 5, 2, 3, 4, 6, 8]);
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
    var fl = [{ label: t(v) + '-' + t(out) + ' notation:', name: 'x-y notation', mode: 'math', keys: EQK, vars: [v, out, name] }, { label: 'Function notation:', name: 'Function notation', mode: 'math', keys: EQK, vars: [v, out, name] }];
    var c1 = convChk('xy', { T: o.T, v: v, out: out, wrong: o.wrong }), c2 = convChk('fn', { T: o.T, v: v, name: name, reqName: true, wrong: o.wrong });
    var k1 = out + '=' + o.keyRhs, k2 = name + '(' + v + ')=' + o.keyRhs;
    var p = B.fields(prompt, fl, [c1, c2], [k1, k2], t(k1) + '<br>' + t(k2), sol, hints, text);
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
    return { V: V, mi: mi, fl: fl, sy: fl ? -1 : 1, sx: mi ? -1 : 1, fig: pwGraph(V, { x: [-7, 7], y: [-5, 6], labels: 2, yName: 'f(x)', max: 320, aria: 'graph of f made of three pieces' }) };
  }
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
          var rhs = lin([[k, ''], [[-A, Bq], 'x']]), eq = lin([[A, 'x'], [Bq, 'y'], [-C, '']]) + '=0';
          var W = [{ is: P(lin([[C, ''], [-A, 'x']])), code: 'conv-no-divide', hint: 'You solved for ' + t(Bq + 'y') + ', not ' + t('y') + '. Divide <b>every</b> term by ' + t(Bq) + '.' },
            { is: P(lin([[k, ''], [[A, Bq], 'x']])), code: 'conv-move-sign', hint: 'Check the sign of the ' + t('x') + ' term: moving ' + t(A + 'x') + ' to the other side makes it ' + t('-' + A + 'x') + '.' },
            { is: P(lin([[[A, Bq], 'x'], [-k, '']])), code: 'conv-move-sign', hint: 'Check your signs: ' + t(Bq + 'y=' + C + '-' + A + 'x') + '. Every term that moves across the equals sign changes sign.' },
            { is: P(lin([[k, ''], [-A, 'x']])), code: 'conv-part-divide', hint: 'Divide <b>both</b> terms on the right by ' + t(Bq) + ', not just the constant.' }];
          return convPart('fn', t(eq), { T: P(rhs), v: 'x', name: 'f', keyRhs: rhs, wrong: W, good: ['f(x)=' + lin([[[-A, Bq], 'x'], [k, '']])].concat(Bq !== 3 ? ['f(x)=' + k + '-' + cl(A / Bq) + 'x'] : []), bad: ['y=' + rhs] },
            'Solve for ' + t('y') + ' first:<br>' + t(Bq + 'y=' + C + '-' + A + 'x') + '<br>' + t('y=' + rhs) + '<br>Then replace ' + t('y') + ' with ' + t('f(x)') + ': ' + t('f(x)=' + rhs),
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
          var p = B.fields('(c) State the value(s) of ' + t('x') + ' if', fl, ch, keys, bs.map(function (b, i) { var s0 = pwSols(sh.V, b).pts; return lab[i] + ' ' + (s0.length ? t(solsKey(s0)) : 'no solution'); }).join('<br>'),
            'Start on the vertical axis at each height and read <b>across</b>, counting every point of the graph at that height:<br>' + bs.map(function (b, i) { var s0 = pwSols(sh.V, b).pts; return lab[i] + ' ' + t(sh.n + '(x)=' + b) + ': ' + (s0.length ? t(solsKey(s0)) + ' (' + s0.length + ' points)' : 'the graph never reaches ' + t(b) + ', so <b>no solution</b>'); }).join('<br>'),
            [t(sh.n + '(x)=b') + ' gives the <b>output</b>: start on the vertical axis and read across. There can be several answers, or none.'], 'solve ' + sh.n + '(x)=b on zigzag');
          p.good = [keys.map(function (k) { return k === 'none' ? '\\text{none}' : k; })];
          return p;
        } },
        { id: '4d', level: 'EMG', make: function (r, sh) {
          var P0 = sh.V[0], P4 = sh.V[4], n = sh.n;
          var fl = [{ label: 'Point ' + sh.ends[0] + ':', name: 'Point ' + sh.ends[0], mode: 'math', keys: EQK, vars: [n] }, { label: 'Point ' + sh.ends[1] + ':', name: 'Point ' + sh.ends[1], mode: 'math', keys: EQK, vars: [n] }];
          var p = B.fields('(d) Use the notation in (a) to make a statement about the points ' + sh.ends[0] + ' and ' + sh.ends[1] + ' on the graph.', fl,
            [stmtChk(n, P0[0], P0[1]), stmtChk(n, P4[0], P4[1])], [n + '(' + P0[0] + ')=' + P0[1], n + '(' + P4[0] + ')=' + P4[1]], t(n + '(' + P0[0] + ')=' + P0[1]) + ', ' + t(n + '(' + P4[0] + ')=' + P4[1]),
            sh.ends[0] + ' is ' + t(ptT(P0)) + ', so ' + t(n + '(' + P0[0] + ')=' + P0[1]) + '.<br>' + sh.ends[1] + ' is ' + t(ptT(P4)) + ', so ' + t(n + '(' + P4[0] + ')=' + P4[1]) + '.',
            ['A point ' + t('(a,\\ b)') + ' on the graph means ' + t(n + '(a)=b') + '.'], 'statements for endpoints of ' + n);
          p.bad = [['(' + P0[0] + ',' + P0[1] + ')', n + '(' + P4[0] + ')=' + P4[1]], [n + '(' + P0[1] + ')=' + P0[0], n + '(' + P4[0] + ')=' + P4[1]]];
          return p;
        } },
        { id: '4e', level: 'EMG', make: function (r, sh) {
          var z = pwSols(sh.V, 0).pts, n = sh.n, y0 = pwAt(sh.V, 0);
          var fl = [solField(t('x') + '-intercepts: ' + t(n + '(x)=0') + ' when', 'x'), { label: t('y') + '-intercept: ' + t(n + '(0)='), name: n + '(0)', mode: 'math', keys: 'solutions', vars: ['x'] }];
          var p = B.fields('(e) Write the ' + t('x') + '- and ' + t('y') + '-intercepts of the graph using function notation.', fl,
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
          var p = B.fields('(c) calculate the ' + t('x') + '-intercept and the ' + t('y') + '-intercept on the graph of ' + t('f') + '.', fl,
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
            'The graph is of ' + t(n) + ', so the statement must use ' + t(n) + '. And each grid square is ' + t(k) + ' units, so the point ' + t(g[0]) + ' squares across and ' + t(g[1]) + ' up is ' + t(ptT(real)) + '.', ['Check two things: the letter, and the numbers on the axes.'], 'two errors in a statement');
        } },
        { id: '8b', sub: 'a ii', level: 'PRG', make: function (r, sh) {
          var n = sh.n, g = sh.mk, k = sh.k, real = [g[0] * k, g[1] * k];
          var p = B.math('Write a correct statement using function notation about the marked point.', stmtChk(n, real[0], real[1], { grid: g, scale: k }), n + '(' + real[0] + ')=' + real[1],
            'The marked point is ' + t(g[0]) + ' squares across and ' + t(g[1]) + ' up. With ' + t(k) + ' units per square it is ' + t(ptT(real)) + ', so ' + t(n + '(' + real[0] + ')=' + real[1]) + '.',
            ['Multiply each grid count by ' + t(k) + '.'], 'correct statement on scaled graph', { keys: EQK, vars: [n], placeholder: 'e.g. ' + n + '(2) = 5' });
          p.bad = [n + '(' + g[0] + ')=' + g[1], sh.bad + '(' + real[0] + ')=' + real[1], n + '(' + real[1] + ')=' + real[0]];
          return p;
        } },
        { id: '8c', sub: 'b', level: 'EMG', make: function (r, sh) {
          var bs = [sh.lo, sh.hi], n = sh.n;
          var fl = bs.map(function (b, i) { return solField(['i)', 'ii)'][i] + ' ' + t(n + '(x)=' + b) + ':', 'x'); });
          return B.fields('(b) Give the solution to the following equations.', fl, bs.map(function (b) { return solsChk(pwSols(sh.V, b).pts, { b: b, graph: true, scale: sh.k }); }), bs.map(function (b) { return solsKey(pwSols(sh.V, b).pts); }),
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
          var fl = [{ label: 'First answer: ' + t('b='), name: 'first b', mode: 'math', keys: 'solutions', vars: ['a'] }, { label: t('a='), name: 'first a values', mode: 'math', keys: 'solutions', vars: ['a'] },
            { label: 'Second answer: ' + t('b='), name: 'second b', mode: 'math', keys: 'solutions', vars: ['a'] }, { label: t('a='), name: 'second a values', mode: 'math', keys: 'solutions', vars: ['a'] }];
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
          var p = { prompt: 'Now give two sets of answers: two values of ' + t('b') + ' for which ' + t(n + '(a)=b') + ' has exactly two solutions, and the two values of ' + t('a') + ' for each.', input: { type: 'fields', fields: fl }, check: check,
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
            'The ' + t('y') + '-axis is where ' + t('x=0') + ': ' + t(nm + '(0)=' + m + '(0)+' + b + '=' + b) + ', so the graph crosses at ' + t('(0,\\ ' + b + ')') + '.', ['On the ' + t('y') + '-axis, ' + t('x=0') + '.'], 'y-intercept of mx+b', true);
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
        { id: '13a', level: 'EMG', outcome: 'RF1', make: function (r, sh) {
          var T = sh.T, top = sh.H(T), alt = cl(sh.c + T * sh.q / sh.p), ym = Math.ceil(Math.max(top, alt) / 10) * 10 + 10;
          var o = { x: [0, T + sh.q], y: [0, ym], gx: sh.q, gy: 10, lx: 2 * sh.q, ly: 20, xName: 't', yName: 'H' };
          var G = function (segs) { return ctxGraph(o, segs); };
          return graphMC(r, '(a) The seedling reaches maturity ' + t(T) + ' days after treatment begins (see part (f)). Which graph shows the function from treatment to maturity?', [
            { html: G([{ pts: [[0, sh.c], [T, top]], start: 'closed', end: 'closed' }]), right: true },
            { html: G([{ pts: [[0, sh.c], [T, alt]], start: 'closed', end: 'closed' }]), why: 'Check the rate: the height rises ' + t(sh.p) + ' cm every ' + t(sh.q) + ' days, so ' + t('H(' + T + ')=' + top) + '.' },
            { html: G([{ pts: [[0, 0], [T, top - sh.c]], start: 'closed', end: 'closed' }]), why: 'At ' + t('t=0') + ' the seedling is already ' + t(sh.c) + ' cm tall: ' + t('H(0)=' + sh.c) + '.' },
            { html: G([{ pts: [[0, sh.c], [T + sh.q, sh.H(T + sh.q)]], start: 'closed', end: 'arrow' }]), why: 'The model stops at maturity, ' + t('t=' + T) + ': the graph should end with a dot there, not an arrow.' }],
            'The graph starts at ' + t('(0,\\ ' + sh.c + ')') + ' and rises ' + t(sh.p) + ' cm every ' + t(sh.q) + ' days, ending at ' + t(ptT([T, top])) + '.', ['Find ' + t('H(0)') + ' and ' + t('H(' + T + ')') + ' first.'], 'sketch seedling');
        } },
        { id: '13b', level: 'BEG', make: function (r, sh) {
          var x = 2 * sh.q, v = sh.H(x);
          return B.number('(b) Determine the value of ' + t('H(' + x + ')') + '.', v, function (u) { if (same(u, cl((x - sh.c) * sh.q / sh.p))) return { code: 'solve-instead', hint: 'You solved ' + t('H(t)=' + x) + '. ' + t('H(' + x + ')') + ' means substitute ' + t('t=' + x) + '.' }; return null; },
            t('H(' + x + ')=\\frac{' + sh.p + '}{' + sh.q + '}(' + x + ')+' + sh.c + '=' + 2 * sh.p + '+' + sh.c + '=' + v) + ' cm', ['Substitute ' + t('t=' + x) + ' into the rule.'], 'H(2q)', { after: 'cm' });
        } },
        { id: '13c', level: 'PRG', make: function (r, sh) {
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
        { id: '13e', level: 'ADV', make: function (r, sh) {
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
        { id: '14a', level: 'EMG', outcome: 'RF1', make: function (r, sh) {
          var N = sh.max, top = sh.C(N), o = { x: [0, 900], y: [0, 9000], gx: 100, gy: 1000, lx: 200, ly: 2000, xName: 'n', yName: 'C' };
          var G = function (segs) { return ctxGraph(o, segs); };
          return graphMC(r, '(a) Which graph shows the function for a maximum of ' + t(N) + ' t-shirts?', [
            { html: G([{ pts: [[0, sh.Fc], [N, top]], start: 'closed', end: 'closed' }]), right: true },
            { html: G([{ pts: [[0, 0], [N, sh.rate * N]], start: 'closed', end: 'closed' }]), why: 'Before any shirt is printed the cost is already ' + t('C(0)=' + F(sh.Fc)) + ' dollars.' },
            { html: G([{ pts: [[0, top], [N, sh.Fc]], start: 'closed', end: 'closed' }]), why: 'Printing more shirts costs more, so the graph rises.' },
            { html: G([{ pts: [[0, sh.Fc], [N, cl(sh.Fc + sh.rate * N / 2)]], start: 'closed', end: 'closed' }]), why: 'Check the end point: ' + t('C(' + N + ')=' + F(sh.Fc) + '+' + sh.rate + '(' + N + ')=' + F(top)) + '.' }],
            'The graph starts at ' + t('(0,\\ ' + F(sh.Fc) + ')') + ' and rises ' + t('\\$' + sh.rate) + ' per shirt, ending at ' + t('(' + N + ',\\ ' + F(top) + ')') + '.', ['Find ' + t('C(0)') + ' and ' + t('C(' + N + ')') + '.'], 'sketch t-shirt cost');
        } },
        { id: '14b', level: 'BEG', make: function (r, sh) {
          var v = sh.C(sh.n1);
          return B.number('(b) Determine the value of ' + t('C(' + sh.n1 + ')') + '.', v, function (u) { if (same(u, cl(sh.rate * sh.n1))) return { code: 'no-fixed', hint: 'Add the fixed cost ' + t(F(sh.Fc)) + ' too.' }; return null; },
            t('C(' + sh.n1 + ')=' + F(sh.Fc) + '+' + sh.rate + '(' + sh.n1 + ')=' + F(sh.Fc) + '+' + cl(sh.rate * sh.n1) + '=' + F(v)), ['Substitute ' + t('n=' + sh.n1) + '.'], 'C(n1)', { before: t('\\$') });
        } },
        { id: '14c', level: 'PRG', make: function (r, sh) {
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
        { id: '14e', level: 'ADV', make: function (r, sh) {
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
        { id: '15a', level: 'EMG', outcome: 'RF1', make: function (r, sh) {
          var L = -20, top = sh.P(L), z = sh.z, ym = Math.ceil((top + 2 * sh.Bc * 20) / 100) * 100;
          var o = { x: [-25, 30], y: [0, Math.max(ym, 400)], gx: 5, gy: 50, lx: 10, ly: 100, xName: 't', yName: 'P', fq: false };
          var G = function (segs) { return ctxGraph(o, segs); };
          return graphMC(r, '(a) Which graph shows the function, from a cold day of ' + t('-20\\,^{\\circ}\\text{C}') + ' until sales drop to zero?', [
            { html: G([{ pts: [[L, top], [z, 0]], start: 'closed', end: 'closed' }]), right: true },
            { html: G([{ pts: [[L, 0], [z, top]], start: 'closed', end: 'closed' }]), why: 'The rule subtracts ' + t(sh.Bc + 't') + ': as it gets warmer, fewer packets are sold, so the graph falls.' },
            { html: G([{ pts: [[0, sh.A], [z, 0]], start: 'closed', end: 'closed' }]), why: 'Below-zero temperatures are common at a ski resort, and ' + t('t') + ' can be negative: the graph should continue to the left of the vertical axis.' },
            { html: G([{ pts: [[L, sh.A - 2 * sh.Bc * L], [cl(sh.A / (2 * sh.Bc)), 0]], start: 'closed', end: 'closed' }]), why: 'Check where it crosses the ' + t('t') + '-axis: ' + t('P(t)=0') + ' when ' + t('t=' + nf(z)) + '.' }],
            t('P(0)=' + sh.A) + ' and ' + t('P(t)=0') + ' at ' + t('t=' + nf(z)) + '. Each degree warmer means ' + t(sh.Bc) + ' fewer packets, so the line falls from ' + t(ptT([L, top])) + ' to ' + t(ptT([z, 0])) + '.', ['Find ' + t('P(0)') + ' and where ' + t('P(t)=0') + '.'], 'sketch cocoa');
        } },
        { id: '15b', level: 'BEG', make: function (r, sh) {
          var v = sh.P(sh.t1);
          return B.number('(b) Determine the value of ' + t('P(' + sh.t1 + ')') + '.', v, function (u) { if (same(u, sh.A + sh.Bc * sh.t1)) return { code: 'ev-sign', hint: t('-' + sh.Bc + '(' + sh.t1 + ')=+' + (-sh.Bc * sh.t1)) + ': a negative times a negative is positive.' }; return null; },
            t('P(' + sh.t1 + ')=' + sh.A + '-' + sh.Bc + '(' + sh.t1 + ')=' + sh.A + '+' + (-sh.Bc * sh.t1) + '=' + v), ['Substitute ' + t('t=' + sh.t1) + ', in brackets.'], 'P(negative)', { after: 'packets' });
        } },
        { id: '15c', level: 'PRG', make: function (r, sh) {
          var v = sh.P(sh.t1);
          return mc(r, '(c) What is the meaning of ' + t('P(' + sh.t1 + ')=' + v) + '?', [
            { html: 'When the average daily temperature is ' + t(sh.t1 + '\\,^{\\circ}\\text{C}') + ', ' + t(v) + ' packets of hot cocoa are sold.', right: true },
            { html: 'When ' + t(v) + ' packets are sold, the temperature drops by ' + t(-sh.t1 + '\\,^{\\circ}\\text{C}') + '.', why: 'The temperature is the input: it causes the sales, not the other way round.' },
            { html: 'When the temperature drops ' + t(-sh.t1) + ' degrees, ' + t(v) + ' more packets are sold.', why: t('P(' + sh.t1 + ')') + ' is the number sold on a day at ' + t(sh.t1 + '\\,^{\\circ}\\text{C}') + ' — a total, not an increase.' },
            { html: 'When the temperature is ' + t(v + '\\,^{\\circ}\\text{C}') + ', ' + t(sh.t1) + ' packets are sold.', why: 'Input and output are swapped (and a negative number of packets is impossible).' }],
            'Input ' + t(sh.t1 + '\\,^{\\circ}\\text{C}') + ', output ' + t(v) + ' packets: on a day averaging ' + t(sh.t1 + '\\,^{\\circ}\\text{C}') + ', the lodge sells ' + t(v) + ' packets.', ['Which number is the temperature and which is the number of packets?'], 'meaning of P(a)=b');
        } },
        { id: '15d', level: 'ADV', make: function (r, sh) {
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
          var p = { prompt: '(f) Suggest an appropriate domain and range for the function ' + t('P(t)') + ' if the resort is located in the Canadian Rockies.', input: { type: 'fields', fields: fl }, check: check,
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
        { id: '16a', level: 'EMG', outcome: 'RF1', make: function (r, sh) {
          var T = sh.T, H0 = sh.H0, ym = Math.ceil(H0 * 1.1 / 100) * 100, gy = ym > 1500 ? 200 : 100;
          var o = { x: [0, T * 1.25], y: [0, ym], gx: T / 10, gy: gy, lx: T / 5, ly: 2 * gy, xName: 't', yName: 'h' };
          var G = function (segs, fns) { return ctxGraph(o, segs, fns); };
          return graphMC(r, '(a) Which graph shows the height of the case from its release until it reaches the ground?', [
            { html: G([], [{ f: sh.h, from: 0, to: T, start: 'closed', end: 'closed' }]), right: true },
            { html: G([{ pts: [[0, H0], [T, 0]], start: 'closed', end: 'closed' }]), why: 'The rule has ' + t('t^{2}') + ', so the graph is a curve: the case falls slowly at first and faster and faster.' },
            { html: G([], [{ f: function (x) { return H0 * (1 - x / T) * (1 - x / T); }, from: 0, to: T, start: 'closed', end: 'closed' }]), why: 'This one falls fastest at the start. A dropped case starts slowly and speeds up, so the curve is flat at the top and steepest at the ground.' },
            { html: G([], [{ f: function (x) { return 4.9 * x * x; }, from: 0, to: T, start: 'closed', end: 'closed' }]), why: 'At ' + t('t=0') + ' the case is at the release height, ' + t('h(0)=' + F(H0)) + ' m, and it falls.' }],
            'The graph is part of a downward parabola: it starts at its peak ' + t('(0,\\ ' + F(H0) + ')') + ' on the vertical axis and reaches ' + t('h=0') + ' at ' + t('t=' + T) + ' s.', ['Find ' + t('h(0)') + ' and the time when ' + t('h(t)=0') + '.'], 'sketch drop');
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
    extra: []
  });
})(window);
