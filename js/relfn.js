/* Unit 5 (Relations and Functions): domain/range answers, solution lists, ordered pairs, and drawings (graphs, arrow
 * diagrams, tables of values). Needs js/expr.js, js/kit.js, js/kitx.js (and js/widgets2.js for the keypads).
 *
 *   HW.sets.parse(tex)  -> { ok, set, form, v, tagged } | { ok:false, why }
 *        set = { kind:'list', vals:[sorted numbers] } or { kind:'int', parts:[{ lo, hi, lc, hc }] } (lo/hi may be ±Infinity,
 *        lc/hc = endpoint included). form: 'list' | 'builder' | 'ineq' | 'interval' | 'all'. v: the variable used (or '').
 *        tagged: the set-builder includes "x ∈ ℝ" (or W, N, I). Discrete sets ({n | 0 ≤ n ≤ 5, n ∈ W}) become lists.
 *        Accepts: {-1, 1, 3}; {x | -2 ≤ x < 5, x ∈ ℝ}; -2 ≤ x < 5; x ≥ -2; [-2, 5); (-∞, 3] ∪ (4, ∞); ℝ; x ∈ ℝ;
 *        "all real numbers"; {y | y ∈ ℝ}; {3}; x ≠ 2 … typed with LaTeX (\le, \ge, \in, \mathbb{R}, \infty, \mid, \cup)
 *        or plain text (<=, >=, in R, inf, U, |).
 *   HW.sets.eq(a, b), HW.sets.tex(set, v) -> set-builder / list LaTeX
 *
 *   K.set(targetTex, opt) -> checker for a domain or range. opt.v: the variable expected ('x', 'y', 't', …; default the
 *     target's); opt.forms: allowed forms (default all: list, builder, ineq, interval, all); opt.tag (default true): a
 *     set-builder answer without "x ∈ ℝ" gets a nudge; opt.other: the range when asking for the domain (or vice versa) —
 *     recognised as a swap; opt.wrong: [{ is: setTex, code, hint }].
 *   K.P.set(prompt, targetTex, opt, sol, hints, text) -> part with the 'set' keypad (≤ < ≥ > { } | ∈ ℝ [ ( ) ] ∞ and letters).
 *
 *   K.valueSet(values, opt) -> checker for "solve" answers with several solutions in any order: "x = 5, x = -5", "±5",
 *     "-5, 5", "x = -5 or x = 5". values: numbers or [p,q]. opt.v: variable. K.P.valueSet(prompt, values, opt, sol, hints, text).
 *   K.pairs(pairs, opt) -> checker for a set of ordered pairs "{(1, 2), (3, 4)}" in any order. K.P.pairs(...).
 *
 *   HW.graph(spec) -> SVG of a coordinate grid with points, segments and curves:
 *     { x:[-6,6], y:[-6,6], grid:1, labels:2 (number every 2; 0 = none), xName:'x', yName:'y', max:340 (px),
 *       firstQuadrant: false, xTitle/yTitle (axis titles for contexts, e.g. 'Time (h)'),
 *       points: [{ x, y, open, label }], segs: [{ pts:[[x,y],…], start:'closed'|'open'|'arrow'|'none', end: … , dash }],
 *       fns: [{ f: function (x) {…}, from, to, start, end, dash }], vline: [x…], hline: [y…] }
 *   HW.arrowDiagram(left, right, pairs, opt) -> SVG of an arrow (mapping) diagram; pairs = [[l, r], …] (values as text).
 *     opt.leftTitle, opt.rightTitle.
 *   HW.valueTable(rows, opt) -> HTML table; rows = [[header, v1, v2, …], [header, …]] (horizontal, like the booklet).
 */
(function (root) {
  'use strict';
  var HW = root.HW, ex = HW.ex, K = HW.kit, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form;
  var INF = Infinity;

  /* ---------------- set notation ---------------- */
  function normalize(s) {
    s = String(s == null ? '' : s);
    s = s.replace(/\\(left|right|middle|bigl|bigr|Bigl|Bigr|big|Big)\b\.?/g, '').replace(/\\displaystyle|\\textstyle/g, '');
    s = s.replace(/^\s*(\\text\{)?\s*(domain|range)\s*\}?\s*[:=]?\s*/i, '').replace(/^\s*[DR]\s*[:=]\s*/, '');
    s = s.replace(/\\text\{\s*all real numbers\s*\}|all\s+real\s+numbers/ig, '\\mathbb{R}');
    s = s.replace(/\\text\{([^}]*)\}/g, ' $1 ').replace(/\\mathrm\{([^}]*)\}/g, '$1').replace(/\\operatorname\{([^}]*)\}/g, '$1');
    s = s.replace(/\\lbrace|\\\{/g, '{').replace(/\\rbrace|\\\}/g, '}').replace(/\\lbrack/g, '[').replace(/\\rbrack/g, ']').replace(/\\lparen/g, '(').replace(/\\rparen/g, ')');
    s = s.replace(/\\mathbb\{([RWNIZQ])\}|\\mathbb([RWNIZQ])|ℝ/g, function (m, a, b) { return ' @' + (a || b || 'R') + ' '; });
    s = s.replace(/\\R(?![a-zA-Z])/g, ' @R ');
    s = s.replace(/\\leqslant|\\leq|\\le(?![a-zA-Z])|≤|<=/g, ' #le ').replace(/\\geqslant|\\geq|\\ge(?![a-zA-Z])|≥|>=/g, ' #ge ').replace(/\\neq|\\ne(?![a-zA-Z])|≠|!=/g, ' #ne ');
    s = s.replace(/\\lt(?![a-zA-Z])|</g, ' #lt ').replace(/\\gt(?![a-zA-Z])|>/g, ' #gt ');
    s = s.replace(/\\(ldots|dots|cdots)|…|\.\.\./g, ' #dots ');
    s = s.replace(/\\infty|∞|\binfinity\b|\binf\b/gi, ' #inf ');
    s = s.replace(/\\in(?![a-zA-Z])|∈|\bis an element of\b/g, ' #in ').replace(/\\mid|\\vert|\\lvert|\\rvert|\|/g, ' #mid ').replace(/\\cup|∪/g, ' #cup ');
    s = s.replace(/\\pm|±/g, ' #pm ').replace(/\\cdot|\\times/g, '*').replace(/\\[,;:! ]|~/g, ' ').replace(/\\quad|\\qquad/g, ' ');
    return s;
  }
  function tokens(s) {
    var out = [], i = 0, m;
    while (i < s.length) {
      var c = s.charAt(i);
      if (/\s/.test(c)) { i++; continue; }
      if ((m = /^#(le|ge|lt|gt|ne|inf|in|mid|cup|pm|dots)/.exec(s.slice(i)))) { out.push({ t: m[1] }); i += m[0].length; continue; }
      if ((m = /^@([RWNIZQ])/.exec(s.slice(i)))) { out.push({ t: 'numset', v: m[1] }); i += m[0].length; continue; }
      if ('{}[](),;'.indexOf(c) >= 0) { out.push({ t: c === ';' ? ',' : c }); i++; continue; }
      if (c === ':') { out.push({ t: 'mid' }); i++; continue; }
      if (/[a-zA-Z]/.test(c)) {
        if ((m = /^(in)\b/i.exec(s.slice(i))) && out.length && out[out.length - 1].t === 'var') { out.push({ t: 'in' }); i += 2; continue; }
        if ((m = /^(or|and)\b/i.exec(s.slice(i)))) { out.push({ t: ',' }); i += m[0].length; continue; }
        if (c === 'U' && !/[a-zA-Z]/.test(s.charAt(i + 1))) { out.push({ t: 'cup' }); i++; continue; }
        if (/[RWNIZ]/.test(c) && out.length && out[out.length - 1].t === 'in') { out.push({ t: 'numset', v: c === 'Z' ? 'I' : c }); i++; continue; }
        if (c === 'R' && !out.length && !/[a-zA-Z]/.test(s.charAt(i + 1))) { out.push({ t: 'numset', v: 'R' }); i++; continue; }
        out.push({ t: 'var', v: c }); i++; continue;
      }
      // a number expression: digits, -, ., \frac{}{}, ^, spaces inside
      if ((m = /^(-\s*)?(\\frac\{[^{}]*\}\{[^{}]*\}|\\frac\d\d|\d+(\.\d+)?|\.\d+)(\s*\/\s*\d+)?/.exec(s.slice(i)))) {
        var p = ex.parse(m[0].replace(/\s+/g, '')); if (!p.ok) return null;
        var v = ex.value(p.ast); if (!isFinite(v)) return null;
        out.push({ t: 'num', v: v }); i += m[0].length; continue;
      }
      if (c === '-') {
        if (s.slice(i + 1).trim().indexOf('#inf') === 0) { var j = s.indexOf('#inf', i); out.push({ t: 'num', v: -INF }); i = j + 4; continue; }
        out.push({ t: '-' }); i++; continue;
      }
      if (c === '+') { if (s.slice(i + 1).trim().indexOf('#inf') === 0) { var j2 = s.indexOf('#inf', i); out.push({ t: 'num', v: INF }); i = j2 + 4; continue; } i++; continue; }
      if (c === '=') { out.push({ t: 'eq' }); i++; continue; }
      if (c === '\\') return null;
      i++;
    }
    return out.map(function (x) { return x.t === 'inf' ? { t: 'num', v: INF } : x; });
  }
  function interval(lo, hi, lc, hc) { return { lo: lo, hi: hi, lc: lo === -INF ? false : lc, hc: hi === INF ? false : hc }; }
  var ALL = function () { return [interval(-INF, INF, false, false)]; };
  function intersect(A, B) {
    var out = [];
    A.forEach(function (a) { B.forEach(function (b) {
      var lo = Math.max(a.lo, b.lo), hi = Math.min(a.hi, b.hi);
      var lc = lo === a.lo && lo === b.lo ? a.lc && b.lc : lo === a.lo ? a.lc : b.lc, hc = hi === a.hi && hi === b.hi ? a.hc && b.hc : hi === a.hi ? a.hc : b.hc;
      if (lo < hi || (lo === hi && lc && hc)) out.push(interval(lo, hi, lc, hc));
    }); });
    return out;
  }
  function merge(parts) {
    parts = parts.slice().sort(function (a, b) { return a.lo - b.lo || (b.lc - a.lc); });
    var out = [];
    parts.forEach(function (p) {
      var last = out[out.length - 1];
      if (last && (p.lo < last.hi || (p.lo === last.hi && (p.lc || last.hc)))) { if (p.hi > last.hi || (p.hi === last.hi && p.hc)) { last.hi = p.hi; last.hc = p.hc || (p.hi === last.hi && last.hc); } }
      else out.push({ lo: p.lo, hi: p.hi, lc: p.lc, hc: p.hc });
    });
    return out;
  }
  var REL = { lt: 1, le: 1, gt: 1, ge: 1, ne: 1, eq: 1 };
  /* a chain like  a ≤ x < b,  x ≥ a,  a > x,  x ≠ a  -> parts, or null */
  function chain(toks) {
    var items = [], ops = [];
    for (var i = 0; i < toks.length; i++) { var k = toks[i]; if (i % 2 === 0) { if (k.t !== 'num' && k.t !== 'var') return null; items.push(k); } else { if (!REL[k.t]) return null; ops.push(k.t); } }
    if (items.length < 2 || items.length !== ops.length + 1) return null;
    var vi = items.findIndex(function (x) { return x.t === 'var'; }); if (vi < 0 || items.filter(function (x) { return x.t === 'var'; }).length > 1) return null;
    var v = items[vi].v, res = ALL(), bad = false;
    for (var j = 0; j < ops.length; j++) {
      var L = items[j], R = items[j + 1], op = ops[j];
      if (L.t === 'var') res = intersect(res, side(op, R.v, true));
      else if (R.t === 'var') res = intersect(res, side(op, L.v, false));
      else { var a = L.v, b = R.v; if (!((op === 'lt' && a < b) || (op === 'le' && a <= b) || (op === 'gt' && a > b) || (op === 'ge' && a >= b))) bad = true; }
    }
    return { parts: res, v: v, backwards: bad };
  }
  function side(op, n, varLeft) { // x op n  (varLeft) or n op x
    if (!varLeft) op = { lt: 'gt', le: 'ge', gt: 'lt', ge: 'le', ne: 'ne', eq: 'eq' }[op];
    if (op === 'lt') return [interval(-INF, n, false, false)];
    if (op === 'le') return [interval(-INF, n, false, true)];
    if (op === 'gt') return [interval(n, INF, false, false)];
    if (op === 'ge') return [interval(n, INF, true, false)];
    if (op === 'eq') return [interval(n, n, true, true)];
    return [interval(-INF, n, false, false), interval(n, INF, false, false)];
  }
  function splitCommas(toks) { var out = [[]]; toks.forEach(function (k) { if (k.t === ',') out.push([]); else out[out.length - 1].push(k); }); return out; }
  function discretize(parts, ns) {
    var vals = [], lim = 400;
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i], lo = p.lo === -INF ? (ns === 'I' ? -INF : 0) : p.lo, hi = p.hi;
      if (!isFinite(lo) || !isFinite(hi)) return null;
      var a = Math.ceil(lo - 1e-9); if (a === lo && !p.lc && p.lo !== -INF) a++; if (ns === 'N' && a < 1) a = 1; if (ns === 'W' && a < 0) a = 0;
      var b = Math.floor(hi + 1e-9); if (b === hi && !p.hc) b--;
      for (var x = a; x <= b; x++) { vals.push(x); if (vals.length > lim) return null; }
    }
    return vals;
  }
  function parseSet(tex) {
    var s = normalize(tex).trim();
    if (!s) return { ok: false, why: 'empty' };
    var toks = tokens(s); if (!toks) return { ok: false, why: 'unreadable' };
    // strip "D =" / "R =" / "Domain:" style prefixes
    if (toks.length > 2 && toks[0].t === 'var' && (toks[1].t === 'eq' || toks[1].t === 'mid') && toks[2].t !== 'num') toks = toks.slice(2);
    if (toks.length > 1 && toks[0].t === 'var' && toks[1].t === 'eq' && toks.length > 2 && toks[2].t === '{') toks = toks.slice(2);
    if (!toks.length) return { ok: false, why: 'empty' };
    if (toks.length === 1 && toks[0].t === 'numset') return toks[0].v === 'R' ? { ok: true, set: { kind: 'int', parts: ALL() }, form: 'all', v: '' } : { ok: false, why: 'unreadable' };
    if (toks.length === 3 && toks[0].t === 'var' && toks[1].t === 'in' && toks[2].t === 'numset') return toks[2].v === 'R' ? { ok: true, set: { kind: 'int', parts: ALL() }, form: 'ineq', v: toks[0].v, tagged: true } : { ok: false, why: 'unbounded-discrete' };
    // braces
    if (toks[0].t === '{') {
      if (toks[toks.length - 1].t !== '}') return { ok: false, why: 'unbalanced' };
      var inner = toks.slice(1, -1), mi = inner.findIndex(function (k) { return k.t === 'mid'; });
      if (mi === 3 && inner[0].t === 'var' && inner[1].t === 'in' && inner[2].t === 'numset') { // {x ∈ ℝ | -2 < x ≤ 4}
        inner = [inner[0], inner[3]].concat(inner.slice(4), [{ t: ',' }, inner[0], inner[1], inner[2]]); mi = 1;
      }
      if (mi < 0 && inner.some(function (k) { return k.t === 'dots'; })) { // {0, 5, 10, …, 50}
        var nums = [], di = -1;
        for (var z = 0; z < inner.length; z++) { var kz = inner[z]; if (kz.t === 'num') nums.push({ v: kz.v, at: z }); else if (kz.t === 'dots') { if (di >= 0) return { ok: false, why: 'unreadable' }; di = nums.length; } else if (kz.t !== ',') return { ok: false, why: 'unreadable' }; }
        if (di < 2 || di !== nums.length - 1) return { ok: false, why: 'unreadable' };
        var st = nums[1].v - nums[0].v, last = nums[nums.length - 1].v; if (!(st > 0)) return { ok: false, why: 'unreadable' };
        for (var y = 2; y < di; y++) if (Math.abs(nums[y].v - nums[y - 1].v - st) > 1e-9) return { ok: false, why: 'unreadable' };
        var cnt = (last - nums[0].v) / st; if (Math.abs(cnt - Math.round(cnt)) > 1e-9 || cnt > 5000) return { ok: false, why: 'unreadable' };
        var ex2 = []; for (var w2 = 0; w2 <= Math.round(cnt); w2++) ex2.push(+(nums[0].v + w2 * st).toFixed(10));
        return { ok: true, set: { kind: 'list', vals: uniq(ex2) }, form: 'list', v: '' };
      }
      if (mi < 0) { // a list
        if (!inner.length) return { ok: true, set: { kind: 'list', vals: [] }, form: 'list', v: '' };
        var vals = [];
        for (var q = 0; q < inner.length; q++) { if (q % 2 === 0) { if (inner[q].t !== 'num' || !isFinite(inner[q].v)) return { ok: false, why: inner[q].t === 'var' ? 'list-var' : 'unreadable' }; vals.push(inner[q].v); } else if (inner[q].t !== ',') return { ok: false, why: 'unreadable' }; }
        return { ok: true, set: { kind: 'list', vals: uniq(vals) }, form: 'list', v: '' };
      }
      if (mi !== 1 || inner[0].t !== 'var') return { ok: false, why: 'unreadable' };
      var v = inner[0].v, conds = splitCommas(inner.slice(2)), parts = ALL(), ns = null, tagged = false, backwards = false;
      for (var c = 0; c < conds.length; c++) {
        var cd = conds[c]; if (!cd.length) continue;
        if (cd.length === 3 && cd[0].t === 'var' && cd[1].t === 'in' && cd[2].t === 'numset') { if (cd[0].v !== v) return { ok: false, why: 'var-mix' }; ns = cd[2].v; tagged = true; continue; }
        var ch = chain(cd); if (!ch) return { ok: false, why: 'unreadable' };
        if (ch.v !== v) return { ok: false, why: 'var-mix' };
        if (ch.backwards) backwards = true;
        parts = intersect(parts, ch.parts);
      }
      if (backwards) return { ok: false, why: 'backwards' };
      parts = merge(parts);
      if (ns && ns !== 'R') { var dv = discretize(parts, ns); if (!dv) return { ok: false, why: 'unbounded-discrete', v: v }; return { ok: true, set: { kind: 'list', vals: dv }, form: 'builder', v: v, tagged: true, ns: ns }; }
      return { ok: true, set: { kind: 'int', parts: parts }, form: 'builder', v: v, tagged: tagged };
    }
    // intervals
    if (toks[0].t === '(' || toks[0].t === '[') {
      var pieces = [], cur = [];
      toks.forEach(function (k) { if (k.t === 'cup') { pieces.push(cur); cur = []; } else cur.push(k); }); pieces.push(cur);
      var ps = [];
      for (var pi = 0; pi < pieces.length; pi++) {
        var pc = pieces[pi];
        if (pc.length !== 5 || (pc[0].t !== '(' && pc[0].t !== '[') || pc[1].t !== 'num' || pc[2].t !== ',' || pc[3].t !== 'num' || (pc[4].t !== ')' && pc[4].t !== ']')) return { ok: false, why: 'unreadable' };
        var lo = pc[1].v, hi = pc[3].v;
        if (lo > hi) return { ok: false, why: 'backwards' };
        if ((lo === -INF && pc[0].t === '[') || (hi === INF && pc[4].t === ']')) return { ok: false, why: 'inf-bracket' };
        ps.push(interval(lo, hi, pc[0].t === '[', pc[4].t === ']'));
      }
      return { ok: true, set: { kind: 'int', parts: merge(ps) }, form: 'interval', v: '' };
    }
    // a bare chain, possibly with ", x ∈ R"
    var conds2 = splitCommas(toks), parts2 = ALL(), v2 = null, ns2 = null, tagged2 = false;
    for (var c2 = 0; c2 < conds2.length; c2++) {
      var cd2 = conds2[c2]; if (!cd2.length) continue;
      if (cd2.length === 3 && cd2[0].t === 'var' && cd2[1].t === 'in' && cd2[2].t === 'numset') { ns2 = cd2[2].v; tagged2 = true; if (v2 && v2 !== cd2[0].v) return { ok: false, why: 'var-mix' }; v2 = cd2[0].v; continue; }
      var ch2 = chain(cd2); if (!ch2) { if (cd2.every(function (k) { return k.t === 'num' || k.t === ','; })) return { ok: false, why: 'no-braces' }; return { ok: false, why: 'unreadable' }; }
      if (ch2.backwards) return { ok: false, why: 'backwards' };
      if (v2 && v2 !== ch2.v) return { ok: false, why: 'var-mix' }; v2 = ch2.v;
      parts2 = intersect(parts2, ch2.parts);
    }
    if (!v2) return { ok: false, why: conds2.length > 1 && toks.every(function (k) { return k.t === 'num' || k.t === ','; }) ? 'no-braces' : 'unreadable' };
    parts2 = merge(parts2);
    if (ns2 && ns2 !== 'R') { var dv2 = discretize(parts2, ns2); if (!dv2) return { ok: false, why: 'unbounded-discrete' }; return { ok: true, set: { kind: 'list', vals: dv2 }, form: 'ineq', v: v2, tagged: true }; }
    return { ok: true, set: { kind: 'int', parts: parts2 }, form: 'ineq', v: v2, tagged: tagged2 };
  }
  function uniq(a) { var s = a.slice().sort(function (x, y) { return x - y; }); return s.filter(function (x, i) { return i === 0 || Math.abs(x - s[i - 1]) > 1e-9; }); }
  function feq(a, b) { return a === b || Math.abs(a - b) < 1e-9; }
  function canon(set) { // single points of an interval set -> list when all parts are points
    if (set.kind === 'int' && set.parts.length && set.parts.every(function (p) { return p.lo === p.hi; })) return { kind: 'list', vals: set.parts.map(function (p) { return p.lo; }) };
    return set;
  }
  function setEq(a, b) {
    a = canon(a); b = canon(b);
    if (a.kind !== b.kind) return false;
    if (a.kind === 'list') return a.vals.length === b.vals.length && a.vals.every(function (x, i) { return feq(x, b.vals[i]); });
    return a.parts.length === b.parts.length && a.parts.every(function (p, i) { var q = b.parts[i]; return feq(p.lo, q.lo) && feq(p.hi, q.hi) && p.lc === q.lc && p.hc === q.hc; });
  }
  var S = HW.sets = { parse: parseSet, eq: setEq };
  function num(x) { if (x === INF) return '\\infty'; if (x === -INF) return '-\\infty'; var r = Math.round(x * 1e6) / 1e6; return String(r); }
  S.tex = function (set, v) {
    v = v || 'x';
    if (set.kind === 'list') return '\\{' + set.vals.map(num).join(', ') + '\\}';
    if (set.parts.length === 1) {
      var p = set.parts[0], c;
      if (p.lo === -INF && p.hi === INF) c = '';
      else if (p.lo === -INF) c = v + (p.hc ? '\\le ' : '<') + num(p.hi);
      else if (p.hi === INF) c = v + (p.lc ? '\\ge ' : '>') + num(p.lo);
      else c = num(p.lo) + (p.lc ? '\\le ' : '<') + v + (p.hc ? '\\le ' : '<') + num(p.hi);
      return '\\{' + v + '\\mid ' + (c ? c + ',\\ ' : '') + v + '\\in\\mathbb{R}\\}';
    }
    return set.parts.map(function (p) { return (p.lc ? '[' : '(') + num(p.lo) + ', ' + num(p.hi) + (p.hc ? ']' : ')'); }).join('\\cup ');
  };

  var WHY = {
    empty: 'Type your answer first.', unbalanced: 'Check your braces: a { needs a matching }.',
    'list-var': 'A list of values should only contain numbers, e.g. ' + t('\\{-1, 2, 5\\}') + '.',
    'var-mix': 'Use the same variable all the way through, e.g. ' + t('\\{x\\mid -2\\le x<5,\\ x\\in\\mathbb{R}\\}') + '.',
    backwards: 'Your inequality or interval runs backwards — write the smaller number first (on the left).',
    'inf-bracket': 'Infinity is never included: always use a round bracket next to ' + t('\\infty') + ', e.g. ' + t('[3,\\infty)') + '.',
    'no-braces': 'Put a list of values inside braces, e.g. ' + t('\\{1, 3, 5\\}') + '.',
    'unbounded-discrete': 'That set has no end, so it can’t be listed — check the inequality.',
    unreadable: 'I can’t read that. Write it like ' + t('\\{x\\mid -2\\le x<5,\\ x\\in\\mathbb{R}\\}') + ', ' + t('-2\\le x<5') + ', ' + t('[-2, 5)') + ' or a list ' + t('\\{1, 3, 5\\}') + '.'
  };
  K.set = function (targetTex, opt) {
    opt = opt || {};
    var tp = parseSet(targetTex); if (!tp.ok) throw new Error('bad set target ' + targetTex + ' (' + tp.why + ')');
    var T = tp.set, V = opt.v || tp.v || 'x', other = opt.other ? parseSet(opt.other) : null;
    var wrongs = (opt.wrong || []).map(function (w) { var ps = parseSet(w.is); return ps.ok && !setEq(ps.set, T) ? { s: ps.set, code: w.code || 'diag', hint: w.hint } : null; }).filter(Boolean);
    var forms = opt.forms || null, tagNeeded = opt.tag !== false;
    return function (resp) {
      var r = parseSet(resp);
      if (!r.ok) return form(r.why === 'empty' ? 'empty' : 'set-' + r.why, WHY[r.why] || WHY.unreadable);
      if (setEq(r.set, T)) {
        if (r.v && V && r.v !== V) return form('set-letter', 'Right set — but use the variable ' + t(V) + ' here.');
        if (forms && forms.indexOf(r.form) < 0 && !(r.form === 'all' && forms.indexOf('builder') >= 0)) return form('set-form', 'Right set — now write it in ' + ({ builder: 'set notation, e.g. ' + t('\\{x\\mid x\\ge 2,\\ x\\in\\mathbb{R}\\}'), interval: 'interval notation, e.g. ' + t('[2,\\infty)'), list: 'a list in braces', ineq: 'an inequality' })[forms[0]] + '.');
        if (tagNeeded && r.form === 'builder' && !r.tagged && T.kind === 'int') return form('set-tag', 'Right — now finish the set notation with ' + t(',\\ ' + V + '\\in\\mathbb{R}') + ' to say which numbers ' + t(V) + ' can be.');
        return ok();
      }
      for (var i = 0; i < wrongs.length; i++) if (setEq(r.set, wrongs[i].s)) return wrong(wrongs[i].code, wrongs[i].hint);
      if (other && other.ok && setEq(r.set, other.set)) return wrong('set-swap', 'That’s the ' + (opt.otherName || 'other set') + '. The <b>domain</b> is the set of inputs (first coordinates); the <b>range</b> is the set of outputs (second coordinates).' + ((opt.v || tp.v) && other.v && other.v !== V ? ' This one is about ' + t(V) + ', not ' + t(other.v) + '.' : ''));
      var A = canon(r.set), B = canon(T);
      if (A.kind === 'int' && B.kind === 'list') return wrong('set-discrete', 'Here there are only separate values (points, not a solid line), so <b>list</b> them in braces, e.g. ' + t('\\{1, 3, 5\\}') + '.');
      if (A.kind === 'list' && B.kind === 'int') return wrong('set-continuous', 'Here every value in between is included too (a solid line or curve), so use an inequality or interval, not a list.');
      if (A.kind === 'list') {
        var miss = B.vals.filter(function (x) { return !A.vals.some(function (y) { return feq(x, y); }); }), extra = A.vals.filter(function (x) { return !B.vals.some(function (y) { return feq(x, y); }); });
        if (miss.length && !extra.length) return wrong('set-missing', 'You’re missing ' + (miss.length === 1 ? 'a value' : miss.length + ' values') + '. Check every point (or every row) again.');
        if (extra.length && !miss.length) return wrong('set-extra', 'You have ' + (extra.length === 1 ? 'a value' : extra.length + ' values') + ' that don’t belong. Check which coordinate you are listing.');
        return wrong('set-values', null);
      }
      if (A.parts.length === B.parts.length && A.parts.every(function (p, j) { var q = B.parts[j]; return feq(p.lo, q.lo) && feq(p.hi, q.hi); }))
        return wrong('set-endpoint', 'The endpoints are right — check whether each one is <b>included</b>: a solid dot means ' + t('\\le') + ' or ' + t('[\\ ]') + '; an open dot means ' + t('<') + ' or ' + t('(\\ )') + '.');
      var unb = function (s) { return s.parts.some(function (p) { return p.lo === -INF || p.hi === INF; }); };
      if (unb(B) && !unb(A)) return wrong('set-arrow', 'Look at the ends of the graph: an <b>arrow</b> means it keeps going forever in that direction, so there is no end value on that side.');
      if (!unb(B) && unb(A)) return wrong('set-arrow', 'Look at the ends of the graph: it stops at a point (a dot), so the set has an end value on both sides.');
      return wrong('set-values', null);
    };
  };
  K.P.set = function (prompt, targetTex, opt, sol, hints, text) {
    opt = opt || {}; var tp = parseSet(targetTex), V = opt.v || tp.v || 'x';
    return K.P.math(prompt, K.set(targetTex, opt), targetTex, sol, hints, text, { keys: 'set', vars: [V], before: opt.before, placeholder: 'e.g. {' + V + ' | -2 <= ' + V + ' < 5, ' + V + ' in R}' });
  };

  /* ---------------- several solutions ---------------- */
  function valueList(resp, v) {
    var s = String(resp || '').replace(/\\(left|right)/g, '').replace(/\\text\{\s*(or|and)\s*\}/gi, ',').replace(/\b(or|and)\b/gi, ',').replace(/;/g, ',');
    var lm, letters = /([a-zA-Z])\s*=/g;
    while ((lm = letters.exec(s))) { if (v && lm[1] !== v) return { letter: lm[1] }; }
    s = s.replace(/[a-zA-Z]\s*=\s*/g, '').replace(/\\pm|±/g, '±');
    s = s.replace(/\\(quad|qquad)|\\[ ,;:!]|~/g, ' ');
    if (!s.trim()) return { empty: true };
    var out = [];
    var pieces = s.split(',');
    for (var i = 0; i < pieces.length; i++) {
      var p = pieces[i].trim(); if (!p) continue;
      var pm = p.charAt(0) === '±'; if (pm) p = p.slice(1);
      var r = ex.parse(p); if (!r.ok) return { bad: true };
      var val = ex.value(r.ast); if (!isFinite(val)) return { bad: true };
      if (!/sqrt|√/.test(p) && /\\times|\\cdot|[×*+]/.test(p) || !/sqrt|√/.test(p) && /[0-9a-zA-Z})]\s*[-−]/.test(p)) return { unsimp: true };
      out.push(val); if (pm) out.push(-val);
    }
    return { vals: out };
  }
  K.valueSet = function (values, opt) {
    opt = opt || {};
    var T = uniq(values.map(function (x) { return Array.isArray(x) ? x[0] / x[1] : x; }));
    return function (resp) {
      var L = valueList(resp, opt.v);
      if (L.empty) return form('empty', 'Type your answer first.');
      if (L.letter) return form('sol-letter', 'Use the variable ' + t(opt.v) + ' here (you wrote ' + t(L.letter + '=') + ').');
      if (L.unsimp) return form('simplify', 'Simplify each solution to a single number (no ' + t('\\times') + ', + or − between numbers).');
      if (L.bad) return form('unreadable', 'Write each solution as a number, separated by commas, e.g. ' + t((opt.v || 'x') + '=3,\\ ' + (opt.v || 'x') + '=-5') + '.');
      var A = uniq(L.vals);
      var miss = T.filter(function (x) { return !A.some(function (y) { return ex.eq(x, y, 1e-9) || Math.abs(x - y) < 1e-12; }); }), extra = A.filter(function (x) { return !T.some(function (y) { return ex.eq(x, y, 1e-9) || Math.abs(x - y) < 1e-12; }); });
      if (!miss.length && !extra.length) return ok();
      if (opt.diag) { var h = opt.diag(A, T); if (h) return wrong(h.code || 'diag', h.hint); }
      if (miss.length && !extra.length) return wrong('sol-missing', 'Correct so far — but there ' + (miss.length === 1 ? 'is another solution' : 'are more solutions') + '. Look for every value that makes the equation true (for example, both a positive and a negative square root, or one from each factor).');
      if (extra.length && !miss.length) return wrong('sol-extra', 'You have ' + (extra.length === 1 ? 'a value that isn’t' : 'values that aren’t') + ' a solution — substitute each one to check.');
      if (A.length === T.length && A.every(function (x) { return T.some(function (y) { return ex.eq(-x, y, 1e-9); }); })) return wrong('sol-sign', 'Check the signs: if ' + t('x-3=0') + ' then ' + t('x=3') + ' (not ' + t('-3') + ').');
      return wrong('value', null);
    };
  };
  K.P.valueSet = function (prompt, values, opt, sol, hints, text) {
    opt = opt || {}; var v = opt.v || 'x', T = uniq(values.map(function (x) { return Array.isArray(x) ? x[0] / x[1] : x; }));
    var keyTex = opt.keyTex || values.map(function (x) { return v + '=' + (Array.isArray(x) ? ex.texRat(ex.norm(x[0], x[1])) : String(x)); }).join(',\\ ');
    return K.P.math(prompt, K.valueSet(values, opt), keyTex, sol, hints, text, { keys: 'solutions', vars: [v], before: opt.before, placeholder: 'e.g. ' + v + ' = 3, ' + v + ' = -5' });
  };

  /* ---------------- ordered pairs ---------------- */
  function pairList(resp) {
    var s = String(resp || '').replace(/\\(left|right)/g, '').replace(/\\\{|\\\}|\\lbrace|\\rbrace/g, ' ').trim();
    if (s.charAt(0) === '{' && s.charAt(s.length - 1) === '}') s = s.slice(1, -1); // outer set braces typed plainly (keep \frac{…}{…})
    if (!s.trim()) return { empty: true };
    var re = /\(([^()]*)\)/g, m, out = [], rest = s;
    while ((m = re.exec(s))) {
      var xy = m[1].split(','); if (xy.length !== 2) return { bad: true };
      var a = ex.parse(xy[0].trim()), b = ex.parse(xy[1].trim()); if (!a.ok || !b.ok) return { bad: true };
      out.push([ex.value(a.ast), ex.value(b.ast)]);
    }
    rest = s.replace(re, '').replace(/[,\s]/g, '');
    if (rest.length || !out.length) return { bad: true };
    return { pairs: out };
  }
  K.pairs = function (pairs, opt) {
    opt = opt || {};
    var key = function (p) { return (Math.round(p[0] * 1e6) / 1e6) + '|' + (Math.round(p[1] * 1e6) / 1e6); };
    var T = {}; pairs.forEach(function (p) { T[key(p)] = 1; });
    return function (resp) {
      var L = pairList(resp);
      if (L.empty) return form('empty', 'Type your answer first.');
      if (L.bad) return form('unreadable', 'Write ordered pairs in brackets, separated by commas, e.g. ' + t('\\{(1, 4), (2, 7)\\}') + '.');
      var A = {}; L.pairs.forEach(function (p) { A[key(p)] = 1; });
      var miss = Object.keys(T).filter(function (k) { return !A[k]; }), extra = Object.keys(A).filter(function (k) { return !T[k]; });
      if (!miss.length && !extra.length) return ok();
      var flipped = L.pairs.every(function (p) { return T[key([p[1], p[0]])]; });
      if (flipped) return wrong('pairs-flip', 'Your pairs are backwards: an ordered pair is (input, output) — ' + t('(x, y)') + '.');
      if (miss.length && !extra.length) return wrong('pairs-missing', 'You’re missing ' + (miss.length === 1 ? 'a pair' : miss.length + ' pairs') + '.');
      return wrong('pairs', null);
    };
  };
  K.P.pairs = function (prompt, pairs, opt, sol, hints, text) {
    var keyTex = '\\{' + pairs.map(function (p) { return '(' + p[0] + ', ' + p[1] + ')'; }).join(', ') + '\\}';
    return K.P.math(prompt, K.pairs(pairs, opt), keyTex, sol, hints, text, { keys: 'pairs', placeholder: 'e.g. {(1, 4), (2, 7)}' });
  };
  HW.addCodes({
    'set-endpoint': 'Endpoint included/excluded wrong', 'set-swap': 'Gave the range for the domain (or reverse)', 'set-discrete': 'Used an interval for separate points', 'set-continuous': 'Listed values for a continuous set',
    'set-missing': 'Left values out of the set', 'set-extra': 'Extra values in the set', 'set-values': 'Wrong set', 'set-arrow': 'Misread an arrow / end point', 'set-tag': 'Set notation without x ∈ R', 'set-letter': 'Wrong variable letter', 'set-form': 'Not in the requested notation',
    'sol-missing': 'Missed a solution', 'sol-extra': 'Extra solution', 'sol-sign': 'Solutions with the wrong sign', 'pairs-flip': 'Ordered pairs backwards', 'pairs-missing': 'Missing ordered pairs', pairs: 'Wrong ordered pairs'
  });

  /* ---------------- keypads ---------------- */
  var W = HW.widgets;
  if (W && W.KEYSETS) {
    var d = function (n) { return { label: String(n), tex: String(n), plain: String(n) }; };
    var KY = {
      del: { label: '⌫', fn: 'del', title: 'Delete' }, clear: { label: 'clear', fn: 'clear' },
      left: { label: '◀', fn: 'left', title: 'Move left' }, right: { label: '▶', fn: 'right', title: 'Move right (out of a box)' },
      enter: { label: 'Check ↵', fn: 'enter', wide: true }, minus: { label: '−', tex: '-', plain: '-' }, dot: { label: '.', tex: '.', plain: '.' },
      comma: { label: ',', tex: ',', plain: ', ' }, frac: { label: '<sup>a</sup>⁄<sub>b</sub>', tex: '\\frac{#@}{#?}', plain: '/', title: 'Fraction' },
      le: { label: '≤', tex: '\\le ', plain: ' <= ' }, lt: { label: '<', tex: '<', plain: ' < ' }, ge: { label: '≥', tex: '\\ge ', plain: ' >= ' }, gt: { label: '>', tex: '>', plain: ' > ' },
      braces: { label: '{ }', tex: '\\left\\lbrace #0\\right\\rbrace', plain: '{', title: 'Braces' }, mid: { label: '|', tex: '\\mid ', plain: ' | ', title: 'such that' },
      inn: { label: '∈', tex: '\\in ', plain: ' in ', title: 'is an element of' }, R: { label: 'ℝ', tex: '\\mathbb{R}', plain: 'R', title: 'the real numbers' },
      lb: { label: '[', tex: '\\lbrack ', plain: '[' }, rb: { label: ']', tex: '\\rbrack ', plain: ']' }, lp: { label: '(', tex: '(', plain: '(' }, rp: { label: ')', tex: ')', plain: ')' },
      inf: { label: '∞', tex: '\\infty ', plain: 'inf', title: 'infinity' }, cup: { label: '∪', tex: '\\cup ', plain: ' U ', title: 'union' },
      pm: { label: '±', tex: '\\pm ', plain: '±' }, eq: { label: '=', tex: '=', plain: ' = ' }, sqrt: { label: '√', tex: '\\sqrt{#0}', plain: 'sqrt(' },
      par: { label: '( )', tex: '\\left(#0\\right)', plain: '(', title: 'Ordered pair: type x, y inside' }
    };
    W.KEYSETS.set = function (opt) {
      var vs = (opt && opt.vars && opt.vars.length ? opt.vars : ['x']).slice(0, 3).map(function (v) { return { label: '<i>' + v + '</i>', tex: v, plain: v }; });
      return [[d(7), d(8), d(9), KY.le, KY.lt, KY.del], [d(4), d(5), d(6), KY.ge, KY.gt, KY.clear], [d(1), d(2), d(3), KY.minus, KY.left, KY.right],
        [d(0), KY.dot, KY.comma, KY.braces, KY.mid, KY.inn, KY.R], vs.concat([KY.lb, KY.lp, KY.rp, KY.rb, KY.inf, KY.enter])];
    };
    W.KEYSETS.solutions = function (opt) {
      var v = (opt && opt.vars && opt.vars[0]) || 'x';
      return [[d(7), d(8), d(9), KY.frac, KY.del], [d(4), d(5), d(6), KY.sqrt, KY.clear], [d(1), d(2), d(3), KY.minus, KY.left, KY.right], [d(0), KY.dot, { label: '<i>' + v + '</i> =', tex: v + '=', plain: v + ' = ' }, KY.comma, KY.pm, KY.enter]];
    };
    W.KEYSETS.pairs = function () {
      return [[d(7), d(8), d(9), KY.par, KY.del], [d(4), d(5), d(6), KY.braces, KY.clear], [d(1), d(2), d(3), KY.minus, KY.left, KY.right], [d(0), KY.dot, KY.comma, KY.frac, KY.enter]];
    };
    W.KEYHELP.set = ['Use <b>{ }</b>, <b>|</b>, <b>≤ &lt;</b> and <b>∈ ℝ</b> for set notation, or <b>[ ( ) ]</b> and <b>∞</b> for interval notation. Press <b>▶</b> to step out of the braces.',
      'Type e.g. <code>{x | -2 &lt;= x &lt; 5, x in R}</code>, <code>[-2, 5)</code> or a list <code>{1, 3, 5}</code>.'];
    W.KEYHELP.solutions = ['Separate solutions with a comma, e.g. ' + HW.k('x=3,\\ x=-5') + ', or use <b>±</b>.', 'Type e.g. <code>x = 3, x = -5</code>.'];
    W.KEYHELP.pairs = ['Press <b>( )</b> for each ordered pair, type <i>x</i> <b>,</b> <i>y</i> inside, press <b>▶</b> to step out, then a comma before the next pair.', 'Type e.g. <code>{(1, 4), (2, 7)}</code>.'];
  }
  if (W) { /* placeholders for the plain-text fallback are passed by the part builders */ }

  /* ---------------- drawings ---------------- */
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function fmtN(x) { return x < 0 ? '−' + Math.abs(x) : String(x); }
  HW.graph = function (g) {
    g = g || {};
    var xr = g.x || [-6, 6], yr = g.y || [-6, 6], grid = g.grid == null ? 1 : g.grid, lab = g.labels == null ? 2 : g.labels;
    var yLen = Math.max(String(Math.round(yr[0])).length, String(Math.round(yr[1])).length), padL = Math.max(g.yTitle ? 40 : 22, (xr[0] >= 0 ? yLen * 7.5 + 8 : 0) + (g.yTitle ? 18 : 0)), padB = g.xTitle ? 38 : 20, padT = 14, padR = 16, U = g.unit || Math.max(14, Math.min(32, 300 / Math.max(xr[1] - xr[0], yr[1] - yr[0])));
    if (g.unitX || g.unitY) { /* unequal scales for contexts */ }
    var ux = g.unitX || U, uy = g.unitY || U;
    var W = padL + (xr[1] - xr[0]) * ux + padR, H = padT + (yr[1] - yr[0]) * uy + padB;
    var X = function (x) { return padL + (x - xr[0]) * ux; }, Y = function (y) { return padT + (yr[1] - y) * uy; };
    var s = '<rect x="0" y="0" width="' + W + '" height="' + H + '" fill="#fff"/>';
    if (grid) {
      for (var gx = Math.ceil(xr[0] / grid) * grid; gx <= xr[1] + 1e-9; gx += grid) s += '<line x1="' + X(gx) + '" y1="' + Y(yr[0]) + '" x2="' + X(gx) + '" y2="' + Y(yr[1]) + '" stroke="#e3e0d8" stroke-width="1"/>';
      var gyStep = g.gridY || grid;
      for (var gy = Math.ceil(yr[0] / gyStep) * gyStep; gy <= yr[1] + 1e-9; gy += gyStep) s += '<line x1="' + X(xr[0]) + '" y1="' + Y(gy) + '" x2="' + X(xr[1]) + '" y2="' + Y(gy) + '" stroke="#e3e0d8" stroke-width="1"/>';
    }
    var ax0 = Math.max(xr[0], Math.min(xr[1], 0)), ay0 = Math.max(yr[0], Math.min(yr[1], 0));
    s += '<line x1="' + X(xr[0]) + '" y1="' + Y(ay0) + '" x2="' + (X(xr[1]) + 8) + '" y2="' + Y(ay0) + '" stroke="#2b3340" stroke-width="1.6" marker-end="url(#gArr)"/>';
    s += '<line x1="' + X(ax0) + '" y1="' + Y(yr[0]) + '" x2="' + X(ax0) + '" y2="' + (Y(yr[1]) - 8) + '" stroke="#2b3340" stroke-width="1.6" marker-end="url(#gArr)"/>';
    s += '<text x="' + (X(xr[1]) + 2) + '" y="' + (Y(ay0) - 6) + '" font-size="13" font-style="italic" text-anchor="end" fill="#2b3340">' + esc(g.xName || 'x') + '</text>';
    s += '<text x="' + (X(ax0) + 7) + '" y="' + (Y(yr[1]) + 4) + '" font-size="13" font-style="italic" fill="#2b3340">' + esc(g.yName || 'y') + '</text>';
    if (lab) {
      var lx = g.labelsX || lab, ly = g.labelsY || lab;
      for (var tx = Math.ceil(xr[0] / lx) * lx; tx <= xr[1] + 1e-9; tx += lx) if ((Math.abs(tx) > 1e-9 || g.firstQuadrant) && tx < xr[1] - 1e-9) s += '<text x="' + X(tx) + '" y="' + (Y(ay0) + 14) + '" font-size="11" text-anchor="middle" fill="#6a7182">' + fmtN(Math.round(tx * 100) / 100) + '</text>';
      for (var ty = Math.ceil(yr[0] / ly) * ly; ty <= yr[1] + 1e-9; ty += ly) if (Math.abs(ty) > 1e-9 && ty < yr[1] - 1e-9) s += '<text x="' + (X(ax0) - 4) + '" y="' + (Y(ty) + 4) + '" font-size="11" text-anchor="end" fill="#6a7182">' + fmtN(Math.round(ty * 100) / 100) + '</text>';
    }
    if (g.xTitle) s += '<text x="' + ((X(xr[0]) + X(xr[1])) / 2) + '" y="' + (H - 6) + '" font-size="12.5" text-anchor="middle" fill="#2b3340">' + esc(g.xTitle) + '</text>';
    if (g.yTitle) s += '<text x="12" y="' + ((Y(yr[0]) + Y(yr[1])) / 2) + '" font-size="12.5" text-anchor="middle" fill="#2b3340" transform="rotate(-90 12 ' + ((Y(yr[0]) + Y(yr[1])) / 2) + ')">' + esc(g.yTitle) + '</text>';
    var col = '#13807a';
    function endMark(kind, x, y, dx, dy) {
      if (kind === 'closed') return '<circle cx="' + X(x) + '" cy="' + Y(y) + '" r="4.2" fill="' + col + '"/>';
      if (kind === 'open') return '<circle cx="' + X(x) + '" cy="' + Y(y) + '" r="4.2" fill="#fff" stroke="' + col + '" stroke-width="2"/>';
      if (kind === 'arrow') { var L = Math.hypot(dx, dy) || 1, ux2 = dx / L, uy2 = dy / L, px = X(x), py = Y(y); var bx = px - ux2 * 9, by = py + uy2 * 9; return '<path d="M' + px + ' ' + py + ' L' + (bx - uy2 * 5) + ' ' + (by - ux2 * 5) + ' L' + (bx + uy2 * 5) + ' ' + (by + ux2 * 5) + ' Z" fill="' + col + '"/>'; }
      return '';
    }
    (g.segs || []).forEach(function (sg) {
      var pts = sg.pts; if (!pts || pts.length < 2) return;
      s += '<polyline points="' + pts.map(function (p) { return X(p[0]) + ',' + Y(p[1]); }).join(' ') + '" fill="none" stroke="' + (sg.color || col) + '" stroke-width="2.4"' + (sg.dash ? ' stroke-dasharray="6 4"' : '') + ' stroke-linejoin="round"/>';
      var a = pts[0], b = pts[1], y2 = pts[pts.length - 1], z = pts[pts.length - 2];
      s += endMark(sg.start || 'none', a[0], a[1], a[0] - b[0], a[1] - b[1]) + endMark(sg.end || 'none', y2[0], y2[1], y2[0] - z[0], y2[1] - z[1]);
    });
    (g.fns || []).forEach(function (fn) {
      var from = fn.from == null ? xr[0] : fn.from, to = fn.to == null ? xr[1] : fn.to, n = 160, pts = [];
      for (var i = 0; i <= n; i++) { var x = from + (to - from) * i / n, y = fn.f(x); if (isFinite(y) && y >= yr[0] - 0.5 && y <= yr[1] + 0.5) pts.push([x, y]); else if (pts.length > 1) break; }
      if (pts.length < 2) return;
      s += '<polyline points="' + pts.map(function (p) { return X(p[0]).toFixed(1) + ',' + Y(p[1]).toFixed(1); }).join(' ') + '" fill="none" stroke="' + (fn.color || col) + '" stroke-width="2.4"' + (fn.dash ? ' stroke-dasharray="6 4"' : '') + '/>';
      var a = pts[0], b = pts[2] || pts[1], y2 = pts[pts.length - 1], z = pts[pts.length - 3] || pts[pts.length - 2];
      s += endMark(fn.start || 'none', a[0], a[1], a[0] - b[0], a[1] - b[1]) + endMark(fn.end || 'none', y2[0], y2[1], y2[0] - z[0], y2[1] - z[1]);
    });
    (g.vline || []).forEach(function (x) { s += '<line x1="' + X(x) + '" y1="' + Y(yr[0]) + '" x2="' + X(x) + '" y2="' + Y(yr[1]) + '" stroke="#c4532a" stroke-width="1.6" stroke-dasharray="5 4"/>'; });
    (g.hline || []).forEach(function (y) { s += '<line x1="' + X(xr[0]) + '" y1="' + Y(y) + '" x2="' + X(xr[1]) + '" y2="' + Y(y) + '" stroke="#c4532a" stroke-width="1.6" stroke-dasharray="5 4"/>'; });
    (g.points || []).forEach(function (p) {
      s += p.open ? '<circle cx="' + X(p.x) + '" cy="' + Y(p.y) + '" r="4.2" fill="#fff" stroke="' + (p.color || col) + '" stroke-width="2"/>' : '<circle cx="' + X(p.x) + '" cy="' + Y(p.y) + '" r="4.2" fill="' + (p.color || col) + '"/>';
      if (p.label) s += '<text x="' + (X(p.x) + 6) + '" y="' + (Y(p.y) - 6) + '" font-size="12" fill="#2b3340">' + esc(p.label) + '</text>';
    });
    var defs = '<defs><marker id="gArr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#2b3340"/></marker></defs>';
    return '<svg class="fig-svg graph-svg" viewBox="0 0 ' + W.toFixed(0) + ' ' + H.toFixed(0) + '" style="max-width:' + (g.max || Math.min(380, W * 1.15)) + 'px" role="img" aria-label="' + esc(g.aria || 'graph') + '">' + defs + s + '</svg>';
  };
  HW.arrowDiagram = function (left, right, pairs, opt) {
    opt = opt || {};
    var n = Math.max(left.length, right.length), rowH = 30, H = n * rowH + 44;
    var half = function (arr) { return Math.max(14, Math.max.apply(null, arr.map(function (v) { return String(fmtN(v)).length; }).concat([1])) * 4.6 + 4); };
    var hl = half(left), hr = half(right), eL = Math.max(42, hl + 14), eR = Math.max(42, hr + 14);
    var lx = Math.max(70, eL + 8), W = Math.max(300, lx + eL + 100 + eR + 8), rx = W - Math.max(70, eR + 8);
    var ly = function (i) { return 34 + (i + 0.5) * (n * rowH / left.length); }, ry = function (i) { return 34 + (i + 0.5) * (n * rowH / right.length); };
    var s = '<rect width="' + W + '" height="' + H + '" fill="#fff"/>';
    s += '<ellipse cx="' + lx + '" cy="' + (34 + n * rowH / 2) + '" rx="' + eL + '" ry="' + (n * rowH / 2 + 8) + '" fill="#f6f4ef" stroke="#2b3340" stroke-width="1.4"/>';
    s += '<ellipse cx="' + rx + '" cy="' + (34 + n * rowH / 2) + '" rx="' + eR + '" ry="' + (n * rowH / 2 + 8) + '" fill="#f6f4ef" stroke="#2b3340" stroke-width="1.4"/>';
    if (opt.leftTitle) s += '<text x="' + lx + '" y="16" font-size="13" text-anchor="middle" fill="#2b3340">' + esc(opt.leftTitle) + '</text>';
    if (opt.rightTitle) s += '<text x="' + rx + '" y="16" font-size="13" text-anchor="middle" fill="#2b3340">' + esc(opt.rightTitle) + '</text>';
    left.forEach(function (v, i) { s += '<text x="' + lx + '" y="' + (ly(i) + 5) + '" font-size="15" text-anchor="middle" fill="#1c2230">' + esc(fmtN(v)) + '</text>'; });
    right.forEach(function (v, i) { s += '<text x="' + rx + '" y="' + (ry(i) + 5) + '" font-size="15" text-anchor="middle" fill="#1c2230">' + esc(fmtN(v)) + '</text>'; });
    pairs.forEach(function (p) {
      var i = left.findIndex(function (v) { return String(v) === String(p[0]); }), j = right.findIndex(function (v) { return String(v) === String(p[1]); }); if (i < 0 || j < 0) return;
      s += '<line x1="' + (lx + hl) + '" y1="' + ly(i) + '" x2="' + (rx - hr - 2) + '" y2="' + ry(j) + '" stroke="#13807a" stroke-width="1.6" marker-end="url(#adArr)"/>';
    });
    var defs = '<defs><marker id="adArr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#13807a"/></marker></defs>';
    return '<svg class="fig-svg" viewBox="0 0 ' + W + ' ' + H + '" style="max-width:' + W + 'px" role="img" aria-label="arrow diagram">' + defs + s + '</svg>';
  };
  HW.valueTable = function (rows, opt) {
    opt = opt || {};
    return '<table class="vtab">' + rows.map(function (r) { return '<tr>' + r.map(function (c, i) { var h = typeof c === 'number' ? fmtN(c) : HW.tex ? HW.tex(String(c)) : String(c); return i === 0 ? '<th>' + h + '</th>' : '<td>' + h + '</td>'; }).join('') + '</tr>'; }).join('') + '</table>';
  };
})(typeof window !== 'undefined' ? window : globalThis);
