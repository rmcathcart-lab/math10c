/* Math 10C · Unit 5 (Relations and Functions) — exit slips, one per lesson (u5l1x … u5l9x), for Ryan's test mode.
 * Each exit slip is 2–4 short questions (about 5–8 minutes at the end of class) on that day's main skills, using only
 * what has been taught up to and including that lesson. The questions are new (new contexts, wording and structure)
 * but match the lesson's assignment items in skill and difficulty; each one is graded at the level the assignment gives
 * a similar item (normally one Beginning, one Progressing and one Mastery question, so the "highest level right per
 * outcome" rule can tell students apart). Every part is a generator (the student's own numbers), with a key, a worked
 * solution, hints, and typical wrong answers with labelled codes (u5x-…) and partial-credit decisions.
 * The answer widgets and checkers are the ones the Unit 5 practice uses (graph pad, number lines, set keypad, intercept
 * points, function notation); helper code is adapted from js/lessons/u5l*.js. Lesson 9 (the unit review) is a short mix
 * of RF1, RF2 and RF8. A scientific calculator is allowed (as on the unit test); no graphing calculator is needed. */
(function (root) {
  'use strict';
  var HW = root.HW, ex = HW.ex, F = HW.fmt, K = HW.kit, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form, B = K.P, P = HW.poly, S = HW.sets, Dr = HW.draw;

  HW.addCodes({
    'u5x-swap-all': 'Plotted every point as (y, x)', 'u5x-one-swap': 'One point plotted as (y, x)', 'u5x-one-sign': 'One point with a sign slip',
    'u5x-swap-coef': 'Rate and constant swapped in the pattern rule', 'u5x-step-const': 'Added the step instead of multiplying by it',
    'u5x-per-step': 'Used the change per table step, not per unit', 'u5x-no-b': 'Left out the constant term', 'u5x-var-swap': 'Independent and dependent variables swapped',
    'u5x-diff-order': 'Differences subtracted the wrong way', 'u5x-lin-word': 'Linear/nonlinear decision wrong',
    'u5x-evaluated': 'Evaluated instead of solving', 'u5x-a-c': 'Used the y-intercept as a', 'u5x-a-flip': 'Divided the wrong way to find a',
    'u5x-no-a': 'Left a out of the expanded equation', 'u5x-factor-sign': 'Used (x + p) for the x-intercept p', 'u5x-expand': 'Expansion slip',
    'u5x-one-k': 'Gave only one of the possible values', 'u5x-k-y': 'Used the outputs instead of the inputs', 'u5x-k-extra': 'Included a value that keeps it a function',
    'u5x-read-swap': 'Read the graph sideways (input and output swapped)', 'u5x-read-off': 'Misread the graph by one grid line', 'u5x-plus-out': 'Added k to the output instead of the input',
    'u5x-profit-rev': 'Ignored the cost per item', 'u5x-profit-fixed': 'Ignored the fixed cost', 'u5x-profit-cost': 'Solved cost = target instead of profit = target',
    'u5x-profit-sign': 'Subtracted the fixed cost instead of adding it', 'u5x-speed-dist': 'Gave the distance instead of the speed', 'u5x-speed-flip': 'Divided time by distance',
    'u5x-speed-total': 'Used the total distance from home instead of the change', 'u5x-stage': 'Described a stage of the graph wrongly', 'u5x-empty-flip': 'Divided the wrong way to find the time',
    'u5x-fn-wrong': 'Wrong function decision', 'u5x-conv-nodiv': 'Solved for By instead of y', 'u5x-conv-sign': 'Sign slip moving a term across',
    'u5x-conv-part': 'Divided only one term by the coefficient of y', 'u5x-speed-neg': 'Gave a negative speed'
  });
  HW.addPartial({
    'u5x-swap-all': 'n', 'u5x-one-swap': 's', 'u5x-one-sign': 's', 'u5x-swap-coef': 'n', 'u5x-step-const': 'n', 'u5x-per-step': 'b', 'u5x-no-b': 's',
    'u5x-var-swap': 'n', 'u5x-diff-order': 's', 'u5x-lin-word': 'b', 'u5x-evaluated': 'n', 'u5x-a-c': 'n', 'u5x-a-flip': 'n',
    'u5x-no-a': 'b', 'u5x-factor-sign': 'b', 'u5x-expand': 's', 'u5x-one-k': 'b', 'u5x-k-y': 'n', 'u5x-k-extra': 'b', 'u5x-read-swap': 'n', 'u5x-read-off': 's',
    'u5x-plus-out': 'n', 'u5x-profit-rev': 'b', 'u5x-profit-fixed': 'b', 'u5x-profit-cost': 'n', 'u5x-profit-sign': 's', 'u5x-speed-dist': 'n', 'u5x-speed-flip': 'n',
    'u5x-speed-total': 'b', 'u5x-stage': 's', 'u5x-empty-flip': 'n', 'u5x-fn-wrong': 'n', 'u5x-conv-nodiv': 'b', 'u5x-conv-sign': 's', 'u5x-conv-part': 'b', 'u5x-speed-neg': 's'
  });

  /* ================= numbers and LaTeX ================= */
  function cl(x) { return Math.round(x * 1e6) / 1e6; }
  function same(a, b) { return Math.abs(a - b) < 1e-9; }
  function nT(x) { return F(cl(x)); }
  function nf(x) { return String(cl(x)); }
  function sgp(x) { x = cl(x); return x < 0 ? '(' + nT(x) + ')' : nT(x); }      // bracket a negative input
  function range(a, b) { var o = []; for (var i = a; i <= b; i++) o.push(i); return o; }
  function nz(a, b) { return range(a, b).filter(function (x) { return x !== 0; }); }
  function uniq(a) { var s = a.slice().sort(function (x, y) { return x - y; }); return s.filter(function (x, i) { return i === 0 || Math.abs(x - s[i - 1]) > 1e-9; }); }
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var c = a % b; a = b; b = c; } return a; }
  function pickWhere(gen, okf) { for (var i = 0; i < 3000; i++) { var o = gen(); if (o != null && okf(o)) return o; } throw new Error('u5 exits: no valid numbers'); }
  function term(c, v, first) {
    var neg, mag;
    if (Array.isArray(c)) { var q = ex.norm(c[0], c[1]); if (!q[0]) return ''; neg = q[0] < 0; mag = q[1] === 1 ? String(Math.abs(q[0])) : '\\frac{' + Math.abs(q[0]) + '}{' + q[1] + '}'; if (v && mag === '1') mag = ''; }
    else { c = cl(c); if (!c) return ''; neg = c < 0; mag = nf(Math.abs(c)); if (v && mag === '1') mag = ''; }
    return (neg ? '-' : first ? '' : '+') + mag + v;
  }
  /* an expression from [[coef, letterPart], …] in the order given (coef a number or [p, q]) */
  function lin(list) { var s = ''; list.forEach(function (p) { s += term(p[0], p[1], s === ''); }); return s || '0'; }
  function PL(tex) { return P.parse(tex); }
  function ptT(p) { return '(' + nf(p[0]) + ',\\ ' + nf(p[1]) + ')'; }
  function ptKey(p) { return '(' + nf(p[0]) + ', ' + nf(p[1]) + ')'; }
  function money(x) { x = cl(x); return Math.abs(x - Math.round(x)) < 1e-9 ? F(Math.round(x)) : x.toFixed(2); }

  /* ================= part makers ================= */
  /* one number; dl = [[wrongValue, code, hint], …] (entries equal to the answer are dropped) */
  function numPart(prompt, ans, dl, sol, hints, text, inp) {
    ans = cl(ans);
    var L = (dl || []).filter(function (d) { return d && isFinite(d[0]) && !same(cl(d[0]), ans); });
    var p = B.number(prompt, ans, function (v) { for (var i = 0; i < L.length; i++) if (Math.abs(v - L[i][0]) < 1e-6) return { code: L[i][1], hint: L[i][2] }; return null; }, sol, hints, text, inp);
    p.bad = L.map(function (d) { return String(cl(d[0])); }).filter(function (s, i, a) { return a.indexOf(s) === i; });
    var base = p.check; p.check = function (resp) { return base(String(resp == null ? '' : resp).replace(/^\s*[a-zA-Z]\s*=\s*(?=[-−+.\d\\])/, '')); }; // "x = 6" typed after a printed "x =" is fine
    return p;
  }
  function numChk(ans, dl) {
    ans = cl(ans); var L = (dl || []).filter(function (d) { return d && isFinite(d[0]) && !same(cl(d[0]), ans); });
    return K.number(ans, function (v) { for (var i = 0; i < L.length; i++) if (Math.abs(v - L[i][0]) < 1e-6) return { code: L[i][1], hint: L[i][2] }; return null; });
  }
  /* polynomial answer with a printed left side (e.g. "T =", "F(t+2) ="); wl = [{ is, code, hint }] */
  function polyPart(prompt, before, T, keyTex, wl, sol, hints, text, vars, expanded) {
    var W = (wl || []).filter(function (w) { return !P.eq(w.is, T); });
    var p = B.poly(prompt, T, { before: before, keyTex: keyTex, wrong: W, vars: vars, expanded: expanded }, sol, hints, text);
    p.bad = W.map(function (w) { return P.tex(w.is); });
    return p;
  }
  /* several solutions in any order; dl = [[values], code, hint] */
  function setSame(A, Bs) { A = uniq(A); Bs = uniq(Bs); return A.length === Bs.length && A.every(function (x, i) { return Math.abs(x - Bs[i]) < 1e-6; }); }
  function solPart(prompt, vals, v, dl, sol, hints, text, extraDiag) {
    var L = (dl || []).filter(function (d) { return d[0].length && d[0].every(isFinite) && !setSame(d[0], vals); });
    var p = B.valueSet(prompt, vals, { v: v, diag: function (A, T) { for (var i = 0; i < L.length; i++) if (setSame(A, L[i][0])) return { code: L[i][1], hint: L[i][2] }; return extraDiag ? extraDiag(A, T) : null; } }, sol, hints, text);
    var base = p.check; // a list written as a set, {3, -5} or k ∈ {3, -5}, is fine too
    p.check = function (resp) { var s0 = String(resp == null ? '' : resp), m = /^\s*(?:[a-zA-Z]\s*(?:\\in|∈|=)\s*)?(?:\\left)?\s*(?:\\\{|\\lbrace|\{)([^{}]*?)(?:\\right)?\s*(?:\\\}|\\rbrace|\})\s*$/.exec(s0); return base(m ? m[1] : s0); };
    p.bad = L.map(function (d) { return d[0].map(function (x) { return v + '=' + nf(x); }).join(', '); });
    if (vals.length > 1) p.bad.push(v + '=' + nf(vals[0]));
    var s = uniq(vals); p.good = [s.slice().reverse().map(function (x) { return v + '=' + nf(x); }).join(', '), s.map(nf).join(', ')];
    return p;
  }
  /* "L = …": an equation whose left side is printed; the student types the right side (K.poly, any order of terms) */
  function eqPart(prompt, lhs, v, T, keyTex, wl, sol, hints, text) {
    var W = (wl || []).filter(function (w) { return w && !P.eq(w.is, T); });
    var base = K.poly(T, { wrong: W, expanded: false });
    var check = function (resp) {
      var s = String(resp == null ? '' : resp).replace(new RegExp('^\\s*' + lhs + '\\s*='), '');
      return base(s);
    };
    return { prompt: prompt, input: { type: 'math', keys: 'poly', vars: [v], before: t(lhs + '=') }, check: check, key: keyTex, answer: t(lhs + '=' + keyTex), solution: sol, hints: hints || [], text: text,
      good: [lhs + '=' + keyTex], bad: W.map(function (w) { return P.tex(w.is); }) };
  }
  function mc(r, prompt, opts, sol, hints, text, keepOrder) { return B.mc(r, prompt, opts, sol, hints, text, keepOrder); }

  /* ================= set notation (domain and range; adapted from u5l4) ================= */
  function lst(a) { return '\\{' + uniq(a).map(nf).join(', ') + '\\}'; }
  function cond(v, lo, hi, lc, hc) {
    lc = lc !== false; hc = hc !== false;
    if (lo == null && hi == null) return '';
    if (lo == null) return v + (hc ? '\\le ' : '<') + hi;
    if (hi == null) return v + (lc ? '\\ge ' : '>') + lo;
    return lo + (lc ? '\\le ' : '<') + v + (hc ? '\\le ' : '<') + hi;
  }
  function bld(v, lo, hi, lc, hc) { var c = cond(v, lo, hi, lc, hc); return '\\{' + v + '\\mid ' + (c ? c + ',\\ ' : '') + v + '\\in\\mathbb{R}\\}'; }
  function all(v) { return bld(v, null, null); }
  function ivAlt(tex) {
    var p = S.parse(tex); if (!p.ok || p.set.kind !== 'int' || p.set.parts.length !== 1) return tex;
    var q = p.set.parts[0], n = function (x) { return x === Infinity ? '\\infty' : x === -Infinity ? '-\\infty' : String(x); };
    return (q.lc ? '[' : '(') + n(q.lo) + ', ' + n(q.hi) + (q.hc ? ']' : ')');
  }
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
  function sortedArr(a) { for (var i = 1; i < a.length; i++) if (a[i] < a[i - 1]) return false; return true; }
  function setChk(target, o) {
    o = o || {};
    var T = S.parse(target).set;
    var wr = (o.wrong || []).filter(function (w) { var p = S.parse(w.is); return p.ok && !S.eq(p.set, T); });
    var base = K.set(target, { v: o.v, other: o.other, otherName: o.otherName, wrong: wr });
    return function (resp) {
      var r = base(resp);
      if (r.v === 'correct') {
        var L = listRaw(resp);
        if (L && L.length > 1) {
          if (L.some(function (x, i) { return L.some(function (y, j) { return j < i && Math.abs(x - y) < 1e-9; }); })) return form('set-repeat', 'Right values — but write each value <b>only once</b> in a list.');
          if (!sortedArr(L)) return form('set-order', 'Right values — now write the list in <b>increasing order</b> (smallest first).');
        }
      }
      return r;
    };
  }
  function ph(v) { return 'e.g. {' + v + ' | -2 <= ' + v + ' < 5, ' + v + ' in R}'; }
  /* one part, two boxes: Domain and Range. o: dv, rv, dW, rW (wrong lists), good, bad */
  function drPart(prompt, D, R, o, sol, hints, text) {
    o = o || {}; var dv = o.dv || 'x', rv = o.rv || 'y';
    var cD = setChk(D, { v: dv, other: R, otherName: 'range', wrong: o.dW }), cR = setChk(R, { v: rv, other: D, otherName: 'domain', wrong: o.rW });
    var vars = [dv, rv].filter(function (v, i, a) { return a.indexOf(v) === i; });
    var fl = [{ label: 'Domain', name: 'Domain', mode: 'math', keys: 'set', vars: vars, placeholder: ph(dv) }, { label: 'Range', name: 'Range', mode: 'math', keys: 'set', vars: vars, placeholder: ph(rv) }];
    var p = B.fields(prompt, fl, [cD, cR], [D, R], t('D=' + D) + '<br>' + t('R=' + R), sol, hints, text);
    p.good = [[ivAlt(D), ivAlt(R)]].concat(o.good || []);
    var Dp = S.parse(D).set, Rp = S.parse(R).set, bad = [];
    if (!S.eq(Dp, Rp)) bad.push([R, D]);
    (o.dW || []).forEach(function (w) { var q = S.parse(w.is); if (q.ok && !S.eq(q.set, Dp)) bad.push([w.is, R]); });
    (o.rW || []).forEach(function (w) { var q = S.parse(w.is); if (q.ok && !S.eq(q.set, Rp)) bad.push([D, w.is]); });
    p.bad = bad.concat(o.bad || []);
    return p;
  }
  var HINT_D = 'The <b>domain</b> is every ' + t('x') + '-value the relation uses (look left to right); the <b>range</b> is every ' + t('y') + '-value it produces (look bottom to top).';
  var HINT_DOTS = 'Solid dot → that value is included (' + t('\\le') + '). Hollow dot → excluded (' + t('<') + '). Arrow → no end on that side.';
  var EDGE = 5.4;
  function G(spec) { return HW.graph(Object.assign({ x: [-6, 6], y: [-6, 6], labels: 1, max: 300 }, spec)); }
  function toEdge(p, d, w) {
    w = w || EDGE; var k = Infinity;
    if (d[0] > 0) k = Math.min(k, (w - p[0]) / d[0]); if (d[0] < 0) k = Math.min(k, (-w - p[0]) / d[0]);
    if (d[1] > 0) k = Math.min(k, (w - p[1]) / d[1]); if (d[1] < 0) k = Math.min(k, (-w - p[1]) / d[1]);
    return [cl(p[0] + k * d[0]), cl(p[1] + k * d[1])];
  }
  function parab(h, k, a, w) { // y = k + a(x − h)² with arrows, clipped to the box
    w = w || EDGE; var lim = a > 0 ? w : -w, dx = Math.sqrt((lim - k) / a);
    return { f: function (x) { return k + a * (x - h) * (x - h); }, from: Math.max(-w, h - dx), to: Math.min(w, h + dx), start: 'arrow', end: 'arrow' };
  }
  function flexFigs(list, w) { w = w || 150; return '<div style="display:flex;flex-wrap:wrap;gap:6px 14px;align-items:flex-start">' + list.map(function (f) { return '<div style="flex:1 1 ' + w + 'px;max-width:' + (w > 200 ? 300 : 230) + 'px">' + f + '</div>'; }).join('') + '</div>'; }

  /* ================= domain/range shading on number lines (domrange; adapted from u5l4) ================= */
  var HINT_SHADOW = 'Shine a light straight down onto the graph: its shadow on the ' + t('x') + '-axis is the <b>domain</b>. Shine it from the side: its shadow on the ' + t('y') + '-axis is the <b>range</b>.';
  var HINT_SH_DOTS = 'Copy the graph’s ends onto the number lines: solid end → solid dot, hollow end → open dot (tap the dot a second time), arrow → shade right to the end of the number line, with no dot.';
  function shadeDR(prompt, spec, D, R, o, sol, hints, text) {
    o = o || {}; var dv = o.dv || 'x', rv = o.rv || 'y';
    var g = Object.assign({ x: [-6, 6], y: [-6, 6], labels: 1 }, spec); g.max = 300;
    var inp = { graph: g, v: dv, w: rv, dom: { labels: 2 }, ran: { labels: 2 } };
    if (o.hideGraph) inp.hideGraph = true; // the question stem already shows this graph
    var p = B.domrange(prompt, inp, D, R, sol, [HINT_SH_DOTS].concat(hints || [HINT_SHADOW]).slice(0, 2), text);
    var parts = function (tex) { return Dr.setParts(S.parse(tex).set); }, TD = parts(D), TR = parts(R);
    var prep = function (W, T) { return (W || []).map(function (w) { var q = S.parse(w.is); return q.ok ? { parts: Dr.setParts(q.set), code: w.code, hint: w.hint } : null; }).filter(function (w) { return w && !Dr.partsSame(w.parts, T); }); };
    var WD = prep(o.dW, TD), WR = prep(o.rW, TR), base = p.check;
    p.check = function (resp) {
      var res = base(resp); if (res.v !== 'wrong' || res.code === 'dr-swap') return res;
      resp = resp || {};
      var one = function (val, T, W) {
        if (!val || (!(val.dots || []).length && !(val.shade || []).length)) return null;
        var G0 = Dr.numlineParts(val); if (Dr.partsSame(G0, T)) return null;
        for (var i = 0; i < W.length; i++) if (Dr.partsSame(G0, W[i].parts)) return W[i];
        return null;
      };
      var a = one(resp.domain, TD, WD); if (a) return wrong(a.code, '<b>Domain:</b> ' + a.hint);
      var b = one(resp.range, TR, WR); if (b) return wrong(b.code, '<b>Range:</b> ' + b.hint);
      return res;
    };
    WD.forEach(function (w) { p.bad.push({ domain: Dr.numlineKey(w.parts), range: p.key.range }); });
    WR.forEach(function (w) { p.bad.push({ domain: p.key.domain, range: Dr.numlineKey(w.parts) }); });
    return p;
  }

  /* ================= intercept points (adapted from u5l3) ================= */
  function vt(x) { if (Math.abs(x - Math.round(x)) < 1e-9) return F(Math.round(x)); for (var q = 2; q <= 24; q++) if (Math.abs(x * q - Math.round(x * q)) < 1e-6) return ex.texRat(ex.norm(Math.round(x * q), q)); return String(cl(x)); }
  function iptT(p) { return '(' + vt(p[0]) + ',\\ ' + vt(p[1]) + ')'; }
  function iptsT(ps) { return ps.map(iptT).join(',\\ '); }
  function iptKey(p) { return '(' + vt(p[0]) + ', ' + vt(p[1]) + ')'; }
  function uniqD(a) { var o = []; a.forEach(function (x) { if (!o.some(function (y) { return same(x, y); })) o.push(x); }); return o.sort(function (x, y) { return y - x; }); }
  function strip(s) { return String(s == null ? '' : s).replace(/\\(left|right)/g, '').replace(/\\lparen/g, '(').replace(/\\rparen/g, ')').replace(/\\\{|\\\}|\\lbrace|\\rbrace/g, ' ').trim(); }
  function isNone(s) { var z = String(s == null ? '' : s).replace(/\\text\{\s*([^}]*)\}/g, '$1').replace(/[\s-]+/g, '').toLowerCase(); return /^(none|no|nointercepts?|dne|no[xy]intercepts?|nosolutions?)$/.test(z); }
  function pairList(resp) {
    var s = strip(resp).trim();
    if (/^\{[\s\S]*\}$/.test(s) && !/^\{[^{}]*\}\{/.test(s)) s = s.slice(1, -1).trim();
    if (!s) return { empty: true };
    var re = /\(([^()]*)\)/g, m, out = [];
    while ((m = re.exec(s))) {
      var xy = m[1].split(','); if (xy.length !== 2) return { bad: true };
      var a = ex.parse(xy[0].trim()), b = ex.parse(xy[1].trim()); if (!a.ok || !b.ok) return { bad: true };
      var va = ex.value(a.ast), vb = ex.value(b.ast); if (!isFinite(va) || !isFinite(vb)) return { bad: true };
      out.push([va, vb]);
    }
    if (s.replace(re, '').replace(/[,;\s]|\\[,;!: ]|\\text\{\s*and\s*\}|and/g, '').length || !out.length) return { bad: true };
    return { pairs: out };
  }
  function valueList(resp) {
    var s = strip(resp).replace(/\\text\{\s*(or|and)\s*\}/gi, ',').replace(/\b(or|and)\b/gi, ',').replace(/[a-zA-Z]\s*=\s*/g, '').replace(/\\pm|±/g, '±');
    if (!s.trim()) return null;
    var out = [], ps = s.split(/[,;]/);
    for (var i = 0; i < ps.length; i++) {
      var p = ps[i].trim(); if (!p) continue;
      var both = p.charAt(0) === '±'; if (both) p = p.slice(1);
      var r = ex.parse(p); if (!r.ok) return null;
      var v = ex.value(r.ast); if (!isFinite(v)) return null;
      out.push(v); if (both) out.push(-v);
    }
    return out.length ? uniqD(out) : null;
  }
  function sameVals(A, T) { A = uniqD(A); T = uniqD(T); return A.length === T.length && A.every(function (x, i) { return same(x, T[i]); }); }
  function samePts(A, T) {
    var k = function (p) { return cl(p[0]) + '|' + cl(p[1]); }, a = {}, b = {};
    A.forEach(function (p) { a[k(p)] = 1; }); T.forEach(function (p) { b[k(p)] = 1; });
    var ka = Object.keys(a), kb = Object.keys(b);
    return ka.length === kb.length && ka.every(function (x) { return b[x]; });
  }
  function ptsCheck(want, axis, o) {
    o = o || {};
    var zero = axis === 'x' ? 1 : 0, keep = 1 - zero, other = axis === 'x' ? 'y' : 'x', name = t(axis) + '-intercept';
    var vals = want ? want.map(function (p) { return p[keep]; }) : [];
    var sample = axis === 'x' ? t('(3,\\ 0)') : t('(0,\\ 3)'), an = axis === 'x' ? 'an' : 'a', An = axis === 'x' ? 'An' : 'A';
    return function (resp) {
      var s = String(resp == null ? '' : resp).trim();
      if (!s) return form('empty', 'Type the ' + name + ' point(s), or press <b>none</b> if there isn’t one.');
      if (isNone(s)) return want ? wrong('int-said-none', 'There is ' + an + ' ' + name + ' here: substitute ' + t(other + '=0') + ' and solve — the equation does have a solution.') : ok();
      var L = pairList(s);
      if (L.bad || L.empty) {
        var V = valueList(s);
        if (V) {
          if (!want) return wrong('int-missed-none', 'Check: when you substitute, the equation has no solution — so there is no ' + name + '.');
          if (sameVals(V, vals)) return form('int-value-not-point', 'Right value' + (vals.length > 1 ? 's' : '') + ' — but the question asks for intercept <b>points</b>. Write each one as an ordered pair, like ' + sample + '.');
          return wrong('int-bad-value', 'Write each intercept point as an ordered pair, like ' + sample + ' — and check your value: substitute ' + t(other + '=0') + ' and solve.');
        }
        return form('int-unreadable', 'Write each point as an ordered pair in brackets, like ' + sample + ', with a comma between points — or press <b>none</b>.');
      }
      var A = L.pairs;
      if (!want) return wrong('int-missed-none', o.noneWhy || 'Check: when you substitute ' + t(other + '=0') + ', the equation has no solution — so there is no ' + name + '. Press <b>none</b>.');
      if (samePts(A, want)) return ok();
      if (o.diag) { var h = o.diag(A); if (h) return wrong(h.code, h.hint); }
      var sub = A.every(function (p) { return want.some(function (q) { return same(p[0], q[0]) && same(p[1], q[1]); }); });
      if (o.other && samePts(A, o.other) && !sub) return wrong('int-pt-swap', 'Those are the ' + t(other) + '-intercept points (they have ' + t(axis + '=0') + '). This box is for where the graph meets the ' + t(axis) + '-axis.');
      if (!sub && A.every(function (p) { return same(p[keep], 0) && vals.some(function (v) { return same(v, p[zero]); }); }) && !vals.every(function (v) { return same(v, 0); }))
        return wrong('int-pt-flip', 'Your coordinates are in the wrong order. ' + An + ' ' + name + ' point lies on the ' + t(axis) + '-axis, so its ' + t(other) + '-coordinate is ' + t('0') + ': ' + (axis === 'x' ? t('(a,\\ 0)') : t('(0,\\ b)')) + '.');
      var off = A.filter(function (p) { return !same(p[zero], 0); });
      if (off.length) return wrong('int-off-axis', t(iptT(off[0])) + ' isn’t on the ' + t(axis) + '-axis: every ' + name + ' point has ' + t(other) + '-coordinate ' + t('0') + '.');
      var got = uniqD(A.map(function (p) { return p[keep]; }));
      var miss = vals.filter(function (v) { return !got.some(function (g) { return same(g, v); }); }), extra = got.filter(function (g) { return !vals.some(function (v) { return same(g, v); }); });
      if (miss.length && !extra.length) return wrong('int-missing', o.missWhy || 'Correct so far — but there is another ' + name + '. When you solve, look for <b>every</b> solution.');
      if (extra.length && !miss.length) return wrong('int-extra', 'One of your points isn’t ' + an + ' ' + name + ': substitute it into the equation to check.');
      if (got.length === vals.length && got.every(function (g) { return vals.some(function (v) { return same(-g, v); }); })) return wrong('int-sign', 'Check the sign' + (vals.length > 1 ? 's' : '') + ' of your ' + name + (vals.length > 1 ? 's' : '') + ' — redo the step where you move a term to the other side.');
      return wrong('value', null);
    };
  }
  var HXY = ['For the ' + t('x') + '-intercept(s) substitute ' + t('y=0') + '; for the ' + t('y') + '-intercept substitute ' + t('x=0') + '.',
    'An ' + t('x') + '-intercept point looks like ' + t('(a,\\ 0)') + ' and a ' + t('y') + '-intercept point like ' + t('(0,\\ b)') + '. If an equation has no solution, press <b>none</b>.'];
  function interceptsPart(prompt, xs, ys, o) {
    o = o || {};
    var ord = function (vs) { vs = uniqD(vs); return vs.length === 2 && same(vs[0], -vs[1]) ? vs : vs.reverse(); };
    var xp = xs ? ord(xs).map(function (v) { return [v, 0]; }) : null, yp = ys ? ord(ys).map(function (v) { return [0, v]; }) : null;
    var fields = [{ name: t('x') + '-intercept point(s)', label: t('x') + '-intercept point(s)', mode: 'math', keys: 'pairs', none: true, wide: true, placeholder: 'e.g. (2, 0)  or  none' },
      { name: t('y') + '-intercept point(s)', label: t('y') + '-intercept point(s)', mode: 'math', keys: 'pairs', none: true, wide: true, placeholder: 'e.g. (0, 3)  or  none' }];
    var chx = ptsCheck(xp, 'x', { other: yp, diag: o.xDiag, missWhy: o.xMiss }), chy = ptsCheck(yp, 'y', { other: xp, diag: o.yDiag });
    var kx = xp ? xp.map(iptKey).join(', ') : 'none', ky = yp ? yp.map(iptKey).join(', ') : 'none';
    var ax = t('x') + '-intercept point' + (xp && xp.length > 1 ? 's' : '') + ': ' + (xp ? t(iptsT(xp)) : '<b>none</b>'), ay = t('y') + '-intercept point: ' + (yp ? t(iptsT(yp)) : '<b>none</b>');
    var p = B.fields(prompt, fields, [chx, chy], [kx, ky], ax + '<br>' + ay, o.sol, o.hints || HXY, o.text);
    var bad = [];
    if (xp && yp && !samePts(xp, yp)) bad.push([ky, kx]);
    if (xp && !xp.every(function (q) { return same(q[0], 0); })) bad.push([xp.map(function (q) { return iptKey([q[1], q[0]]); }).join(', '), ky]);
    if (xp) bad.push(['none', ky]); else bad.push(['(1, 0)', ky]);
    if (xp && xp.length > 1) bad.push([iptKey(xp[0]), ky]);
    if (xp && !samePts(xp.map(function (q) { return [-q[0], 0]; }), xp)) bad.push([xp.map(function (q) { return iptKey([-q[0], 0]); }).join(', '), ky]);
    p.good = [[xp ? xp.slice().reverse().map(function (q) { return '\\left(' + vt(q[0]) + ',' + vt(q[1]) + '\\right)'; }).join(',') : '\\text{none}', yp ? ky : 'none']];
    p.bad = bad.concat(o.bad || []);
    return p;
  }

  /* ================= graph pad helpers ================= */
  function gv(pts, pieces, join) { return { pts: pts || [], pieces: pieces || [], join: join || 'none' }; }
  function segv(a, b, s, e) { return { v: [a, b], s: s || 'closed', e: e || 'closed' }; }
  function exactChk(target, opt) {
    var base = K.graphExact(target, opt);
    return function (resp) { if (!Dr.empty(resp) && Dr.same(resp, target)) return ok(); return base(resp); };
  }
  var SK_HELP = 'Use <b>╱ Line</b> to draw (tap each corner; tap the last point again to finish), <b>●○ Ends</b> to make an end solid, hollow or an arrow, and <b>● Point</b> for separate points.';
  function isPt(p) { return Math.abs(p.lo - p.hi) < 1e-9; }
  /* K.graphRules plus the u5l4 diagnoses for wrong ends */
  function sketchChk(rules) {
    var base = K.graphRules(rules);
    var dP = rules.domain ? Dr.setParts(S.parse(rules.domain).set) : null, rP = rules.range ? Dr.setParts(S.parse(rules.range).set) : null;
    return function (resp) {
      var res = base(resp); if (res.v !== 'wrong') return res;
      var v = Dr.norm(resp), dd = Dr.domain(v).parts, rr = Dr.range(v).parts;
      if (dP && rP && !Dr.partsSame(dP, rP) && Dr.partsSame(dd, rP) && Dr.partsSame(rr, dP)) return wrong('sk-swap', 'Your graph has the domain and range swapped. The <b>domain</b> is read along the ' + t('x') + '-axis (left to right), the <b>range</b> along the ' + t('y') + '-axis (bottom to top).');
      if (dP && !dP.every(isPt) && !v.pieces.length && v.join === 'none') return wrong('sk-points', 'Separate points only give a <b>list</b> of ' + t('x') + '-values. This domain is a whole interval, so draw a <b>line</b> (╱ Line) that uses every ' + t('x') + ' in between.');
      if ((res.code === 'rule-domain' && dP && dd.length === dP.length && dd.every(function (q, i) { return same(q.lo, dP[i].lo) && same(q.hi, dP[i].hi); })) ||
          (res.code === 'rule-range' && rP && rr.length === rP.length && rr.every(function (q, i) { return same(q.lo, rP[i].lo) && same(q.hi, rP[i].hi); })))
        return wrong('sk-ends', 'Your graph reaches the right values — now fix the end dots: a value that is <b>excluded</b> needs a hollow dot (and no other point of the graph at that value); an <b>included</b> one needs a solid dot.');
      return res;
    };
  }
  function sketchPart(prompt, pad, rules, key, bads, sol, hints, text) {
    var p = B.graph(prompt + '<div class="muted">Many different drawings are right. ' + SK_HELP + '</div>', pad, sketchChk(rules), key, sol, hints, text);
    p.answer = 'One possible answer:' + p.answer; p.bad = bads || [];
    return p;
  }

  /* =====================================================================================================
   * Lesson 1 — The Cartesian plane, growing patterns, types of variables (RF1, RF2)
   * ===================================================================================================== */
  var QUAD = { I: [1, 1], II: [-1, 1], III: [-1, -1], IV: [1, -1] };
  var PAT = [
    { noun: 'tiles', L: 'T', v: 'n', what: 'A pattern is built from square tiles' },
    { noun: 'toothpicks', L: 'P', v: 'n', what: 'A pattern of shapes is made from toothpicks' },
    { noun: 'beads', L: 'B', v: 'k', what: 'A bead design grows the same way each time' },
    { noun: 'dots', L: 'D', v: 'f', what: 'A dot pattern grows the same way each time' },
    { noun: 'cubes', L: 'C', v: 'n', what: 'A staircase is built from linking cubes' },
    { noun: 'chairs', L: 'S', v: 'n', what: 'Tables are pushed together in a row and chairs are placed around them' }];
  var CONT = [
    { key: 'pool', v: 't', L: 'V', unit: 'L', vunit: 'min', up: true, s: [5, 10], b: [150, 200, 250, 300, 400], r: [12, 15, 18, 25, 35, 40, 45], txt: function (b) { return 'A swimming pool already holds ' + t(F(b)) + ' L of water when a hose is turned on. Water flows in at a steady rate. The table shows the volume of water, ' + t('V') + ' (L), after ' + t('t') + ' minutes.'; }, what: 'volume of water', xw: 'time' },
    { key: 'candle', v: 't', L: 'h', unit: 'cm', vunit: 'h', up: false, s: [2], b: [20, 24, 25, 30], r: [0.5, 1.5, 2.5], txt: function (b) { return 'A candle is ' + t(b) + ' cm tall when it is lit, and it burns down at a steady rate. The table shows its height, ' + t('h') + ' (cm), after ' + t('t') + ' hours.'; }, what: 'height of the candle', xw: 'time' },
    { key: 'balloon', v: 't', L: 'h', unit: 'm', vunit: 's', up: true, s: [4, 5], b: [20, 30, 40, 50], r: [1.5, 2.5, 3, 3.5, 4], txt: function (b) { return 'A weather balloon is released from the roof of a building ' + t(b) + ' m above the ground and rises at a steady rate. The table shows its height, ' + t('h') + ' (m), after ' + t('t') + ' seconds.'; }, what: 'height of the balloon', xw: 'time' },
    { key: 'battery', v: 't', L: 'B', unit: '\\%', vunit: 'min', up: false, s: [10, 20], b: [90, 95, 100], r: [0.4, 0.5, 0.75], txt: function (b) { return 'A phone’s battery is at ' + t(b + '\\%') + ' when a video starts streaming, and the charge goes down at a steady rate. The table shows the charge, ' + t('B') + ' (%), after ' + t('t') + ' minutes.'; }, what: 'battery charge', xw: 'time' }];

  HW.defineExit({
    lesson: 'u5l1', calc: true,
    blurb: 'Plot points in all four quadrants; write and use the rule of a growing pattern; continuous data and rates from a table.',
    questions: [
      { num: '1', outcome: 'RF1', stem: 'Plot each point on the grid.', parts: [
        { id: '1', outcome: 'RF1', level: 'BEG', make: function (r) {
          var qs = r.sample(['I', 'II', 'III', 'IV'], 3), pts = [];
          qs.forEach(function (q) {
            var p = pickWhere(function () { var a = r.int(1, 5), b = r.int(1, 5); return [QUAD[q][0] * a, QUAD[q][1] * b]; }, function (p) { return Math.abs(p[0]) !== Math.abs(p[1]) && !pts.some(function (z) { return z[0] === p[0] && z[1] === p[1]; }); });
            pts.push(p);
          });
          var k = r.pick(nz(-5, 5)), axisPt = r.chance(0.5) ? [0, k] : [k, 0];
          pts.splice(r.int(0, 3), 0, axisPt);
          var names = ['A', 'B', 'C', 'D'], key = gv(pts.map(function (p) { return p.slice(); }));
          var swapAll = gv(pts.map(function (p) { return [p[1], p[0]]; }));
          var wr = [{ is: swapAll, code: 'u5x-swap-all', hint: 'Every point is plotted as ' + t('(y,\\ x)') + '. In ' + t('(x,\\ y)') + ' go <b>across</b> to ' + t('x') + ' first, then <b>up or down</b> to ' + t('y') + '.' }];
          pts.forEach(function (p, i) {
            var sw = pts.map(function (z, j) { return j === i ? [z[1], z[0]] : z.slice(); }), sg = pts.map(function (z, j) { return j === i ? (z[0] !== 0 ? [-z[0], z[1]] : [z[0], -z[1]]) : z.slice(); });
            wr.push({ is: gv(sw), code: 'u5x-one-swap', hint: 'Point ' + t(names[i]) + ' is plotted at ' + t(ptT([p[1], p[0]])) + ' — its coordinates the other way round. Across first (' + t('x=' + p[0]) + '), then up or down (' + t('y=' + p[1]) + ').' });
            wr.push({ is: gv(sg), code: 'u5x-one-sign', hint: 'Check the signs of point ' + t(names[i]) + ': a negative ' + t('x') + ' is left of the ' + t('y') + '-axis, a negative ' + t('y') + ' is below the ' + t('x') + '-axis.' });
          });
          var move = function (p) {
            var a = p[0] === 0 ? 'stay on the ' + t('y') + '-axis' : 'go ' + Math.abs(p[0]) + ' ' + (p[0] > 0 ? 'right' : 'left'), b = p[1] === 0 ? 'stay on the ' + t('x') + '-axis' : Math.abs(p[1]) + ' ' + (p[1] > 0 ? 'up' : 'down');
            return a + ', then ' + b;
          };
          var quadOf = function (p) { return p[0] === 0 ? 'a point on the ' + t('y') + '-axis, in no quadrant' : p[1] === 0 ? 'a point on the ' + t('x') + '-axis, in no quadrant' : 'Quadrant ' + (p[0] > 0 ? (p[1] > 0 ? 'I' : 'IV') : (p[1] > 0 ? 'II' : 'III')); };
          var lab = pts.map(function (q, i) { return t(names[i] + ptT(q)); });
          var p = B.graph('Plot ' + lab.slice(0, -1).join(', ') + ' and ' + lab[lab.length - 1] + '. (Tap the grid to place a point; tap it again to remove it.)',
            { x: [-6, 6], y: [-6, 6], labels: 1, mode: 'points', max: 360 }, exactChk(key, { wrong: wr }), key,
            pts.map(function (q, i) { return t(names[i] + ptT(q)) + ': start at the origin, ' + move(q) + ' (' + quadOf(q) + ').'; }).join('<br>'),
            ['Start at the origin each time. The first number tells you how far to go <b>across</b> (right if positive, left if negative).', 'The second number tells you how far to go <b>up</b> (positive) or <b>down</b> (negative). A 0 keeps you on an axis.'], 'plot 4 points');
          p.bad = wr.map(function (w) { return w.is; }).filter(function (b) { return !Dr.same(b, key); }).slice(0, 4);
          return p;
        } }] },
      { num: '2', outcome: 'RF2',
        shared: function (r) {
          var c = r.pick(PAT), d = r.int(2, 9), b = r.pick(range(1, 9).filter(function (x) { return x !== d; })), k = r.int(24, 60);
          return { c: c, d: d, b: b, k: k, N: d * k + b, S: function (n) { return d * n + b; } };
        },
        stem: function (s) { return s.c.what + '. The table shows the number of ' + s.c.noun + ', ' + t(s.c.L) + ', in Figure ' + t(s.c.v) + '.' + HW.valueTable([[t(s.c.v), 1, 2, 3, 4], [t(s.c.L), s.S(1), s.S(2), s.S(3), s.S(4)]]); },
        parts: [
          { id: '2a', outcome: 'RF2', level: 'EMG', make: function (r, s) {
            var d = s.d, b = s.b, v = s.c.v, L = s.c.L, S1 = s.S(1), T = PL(lin([[d, v], [b, '']]));
            return eqPart('Write an equation for ' + t(L) + ' in terms of ' + t(v) + '.', L, v, T, lin([[d, v], [b, '']]), [
              { is: PL(lin([[d, v]])), code: 'no-constant', hint: 'Test it on Figure 1: ' + t(d + '(1)=' + d) + ', but Figure 1 has ' + S1 + ' ' + s.c.noun + '. What has to be added?' },
              { is: PL(lin([[d, v], [S1, '']])), code: 'first-term', hint: 'Test it on Figure 1: ' + t(d + '(1)+' + S1 + '=' + (d + S1)) + ', not ' + S1 + '. The constant is the count for a “Figure 0”: ' + t(S1 + '-' + d + '=' + b) + '.' },
              { is: PL(lin([[b, v], [d, '']])), code: 'u5x-swap-coef', hint: 'Your numbers are swapped: the amount added each figure, ' + t(d) + ', multiplies ' + t(v) + '.' },
              { is: PL(lin([[1, v], [d, '']])), code: 'u5x-step-const', hint: 'The ' + t(d) + ' ' + s.c.noun + ' added each figure multiply ' + t(v) + ' (' + t(d + v) + '); they aren’t added on once.' }],
              'Each figure has ' + t(d) + ' more ' + s.c.noun + ' than the one before, so ' + t(L + '=' + d + v + '+\\square') + '. Figure 1: ' + t(S1 + '=' + d + '(1)+\\square') + ', so the constant is ' + t(S1 + '-' + d + '=' + b) + '.<br>' + t(L + '=' + lin([[d, v], [b, '']])) + '. Check Figure 4: ' + t(d + '(4)+' + b + '=' + s.S(4)) + ' ✓',
              ['How many ' + s.c.noun + ' are added from one figure to the next? That number goes in front of ' + t(v) + '.', 'Then test Figure 1 to find the number to add.'], 'pattern equation ' + d + v + '+' + b);
          } },
          { id: '2b', outcome: 'RF1', level: 'EMG', make: function (r, s) {
            var d = s.d, b = s.b, v = s.c.v, L = s.c.L, N = s.N, k = s.k;
            return numPart('Which figure has exactly ' + t(F(N)) + ' ' + s.c.noun + '?', k, [
              [(N - s.S(1)) / d, 'off-by-one', 'Check: ' + t(d + '(' + nf((N - s.S(1)) / d) + ')+' + b + '=' + F(s.S((N - s.S(1)) / d))) + ', not ' + t(F(N)) + '. Solve ' + t(d + v + '+' + b + '=' + N) + ' with the constant ' + t(b) + '.'],
              [(N + b) / d, 'add-not-sub', 'To undo “+ ' + b + '”, <b>subtract</b> ' + t(b) + ' from both sides.'],
              [N / d, 'no-subtract', 'Subtract the constant ' + t(b) + ' first, then divide by ' + t(d) + '.'],
              [N - b, 'no-divide', 'You subtracted ' + t(b) + ' — now divide by ' + t(d) + '.']],
              'Solve ' + t(d + v + '+' + b + '=' + F(N)) + ':<br>' + t(d + v + '=' + F(N - b)) + '<br>' + t(v + '=' + F(N - b) + '\\div ' + d + '=' + k) + '<br>Figure ' + t(k) + ' has ' + t(F(N)) + ' ' + s.c.noun + '.',
              ['Use your equation: set it equal to ' + t(F(N)) + ' and solve for ' + t(v) + '.', 'Undo the operations in reverse order: subtract, then divide.'], 'figure with N items', { before: 'Figure' });
          } }] },
      { num: '3', outcome: 'RF2',
        shared: function (r) {
          var c = r.pick(CONT), s0 = r.pick(c.s), b = r.pick(c.b), rr = r.pick(c.r);
          if (!c.up && b - 3 * s0 * rr <= 0) rr = c.r[0];
          return { c: c, s: s0, b: b, r: rr, m: c.up ? rr : -rr, xs: [0, s0, 2 * s0, 3 * s0] };
        },
        stem: function (s) { var c = s.c; return c.txt(s.b) + HW.valueTable([[t(c.v) + ' (' + c.vunit + ')'].concat(s.xs), [t(c.L) + ' (' + (c.unit === '\\%' ? '%' : c.unit) + ')'].concat(s.xs.map(function (x) { return nf(s.b + s.m * x); }))]); },
        parts: [
          { id: '3a', outcome: 'RF2', level: 'PRG', make: function (r, s) {
            var c = s.c, v = c.v, L = c.L, m = s.m, b = s.b, st = s.s, T = PL(lin([[b, ''], [m, v]])), key = lin([[b, ''], [m, v]]);
            var u = c.unit === '\\%' ? '\\%' : '\\text{ ' + c.unit + '}';
            return eqPart('Write an equation for ' + t(L) + ' in terms of ' + t(v) + '.', L, v, T, key, [
              { is: PL(lin([[b, ''], [m * st, v]])), code: 'u5x-per-step', hint: t(nf(Math.abs(m * st)) + u) + ' is the change every ' + t(st) + ' ' + c.vunit + ' (one step of the table). The rate is the change for <b>1</b> ' + c.vunit + ': divide by ' + t(st) + '.' },
              { is: PL(lin([[m, v]])), code: 'no-fee', hint: 'At ' + t(v + '=0') + ' the ' + c.what + ' is already ' + t(nf(b)) + '. Add that starting value.' },
              { is: PL(lin([[b, ''], [-m, v]])), code: 'sign-rate', hint: 'The ' + c.what + ' ' + (m < 0 ? '<b>decreases</b>' : '<b>increases</b>') + ' as time goes on, so the rate is ' + (m < 0 ? 'negative' : 'positive') + '.' },
              { is: PL(lin([[m, ''], [b, v]])), code: 'u5x-swap-coef', hint: 'The starting value, ' + t(nf(b)) + ', is the constant; the rate multiplies ' + t(v) + '.' }],
              'Starting value (at ' + t(v + '=0') + '): ' + t(nf(b)) + '.<br>Every ' + t(st) + ' ' + c.vunit + ' the ' + c.what + ' changes by ' + t(nf(m * st)) + ', so the rate is ' + t(nf(m * st) + '\\div ' + st + '=' + nf(m)) + ' per ' + c.vunit + '.<br>' + t(L + '=' + key),
              ['Starting value: read ' + t(L) + ' when ' + t(v + '=0') + '.', 'The table goes up in steps of ' + t(st) + ' ' + c.vunit + ': divide the change in ' + t(L) + ' by ' + t(st) + ' to get the rate per ' + c.vunit + '.'], c.key + ' equation');
          } },
          { id: '3b', outcome: 'RF1', level: 'EMG', make: function (r, s) {
            var c = s.c;
            return mc(r, 'The points from the table are plotted on a grid. Should they be joined with a line?', [
              { html: '<b>Yes</b>: ' + c.xw + ' and the ' + c.what + ' are continuous, so every value between the table’s values happens too.', right: true },
              { html: '<b>No</b>: only the times in the table were measured, so only those points belong on the graph.', why: 'The ' + c.what + ' changes steadily all the time, not just at the times in the table. Time is continuous, so the values in between happen too.' },
              { html: '<b>No</b>: points on a graph are never joined unless the question says so.', why: 'Joining depends on the variables: if every value in between makes sense (continuous data), the points are joined.' },
              { html: '<b>Yes</b>: the points line up, and points in a straight line are always joined.', why: 'Points can line up and still be discrete (like numbers of tiles). Here they are joined because time and the ' + c.what + ' are continuous.' }],
              'Time is continuous, and the ' + c.what + ' changes steadily at every moment, so the values between the table’s points happen too: <b>join the points</b>.',
              ['Do values <b>between</b> the table’s times make sense? Is ' + c.xw + ' counted or measured?'], 'join continuous data');
          } }] }
    ]
  });

  /* =====================================================================================================
   * Lesson 2 — Describing relationships between two quantities (RF1, RF2)
   * ===================================================================================================== */
  var IVDV = [
    { ind: 'A', dep: 'p', s: ['The amount of paint, ' + t('p') + ' (L), needed for a wall depends on the area of the wall, ' + t('A') + ' (m²).', 'The area of a wall, ' + t('A') + ' (m²), decides the amount of paint, ' + t('p') + ' (L), needed to cover it.'], why: 'The paint needed is worked out from the area — the area doesn’t depend on the paint.' },
    { ind: 's', dep: 't', s: ['The time, ' + t('t') + ' (min), it takes to download a file is related to the size of the file, ' + t('s') + ' (MB).', 'The size of a file, ' + t('s') + ' (MB), is related to the time, ' + t('t') + ' (min), it takes to download.'], why: 'A bigger file takes longer: the time depends on the size. Careful: time is the output here.' },
    { ind: 'n', dep: 'h', s: ['The height, ' + t('h') + ' (cm), of a stack of plates is related to the number of plates, ' + t('n') + ', in the stack.', 'The number of plates, ' + t('n') + ', in a stack is related to the height of the stack, ' + t('h') + ' (cm).'], why: 'Adding plates makes the stack taller: the height depends on the number of plates.' },
    { ind: 'm', dep: 'T', s: ['The temperature, ' + t('T') + ' (°C), of a cup of tea is related to the time, ' + t('m') + ' (min), since it was poured.', 'The time, ' + t('m') + ' (min), since a cup of tea was poured is related to its temperature, ' + t('T') + ' (°C).'], why: 'The tea cools as time passes: the temperature depends on the time.' },
    { ind: 'a', dep: 'h', s: ['The height, ' + t('h') + ' (m), of a spruce tree is related to its age, ' + t('a') + ' (years).', 'The age, ' + t('a') + ' (years), of a spruce tree is related to its height, ' + t('h') + ' (m).'], why: 'A tree grows as it gets older: the height depends on the age.' },
    { ind: 'n', dep: 'M', s: ['The total mass, ' + t('M') + ' (kg), of a box of apples is related to the number of apples, ' + t('n') + ', in the box.', 'The number of apples, ' + t('n') + ', in a box is related to the total mass of the box, ' + t('M') + ' (kg).'], why: 'Each apple adds mass: the mass depends on how many apples there are.' },
    { ind: 'f', dep: 'k', s: ['The distance, ' + t('k') + ' (km), a car can drive is related to the volume of fuel, ' + t('f') + ' (L), in its tank.', 'The volume of fuel, ' + t('f') + ' (L), in a car’s tank is related to the distance, ' + t('k') + ' (km), the car can drive.'], why: 'More fuel lets the car go farther: the distance depends on the fuel.' },
    { ind: 'h', dep: 'W', s: ['The volume of water left in a tank, ' + t('W') + ' (L), is related to the time, ' + t('h') + ' (hours), it has been draining.', 'The time, ' + t('h') + ' (hours), a tank has been draining is related to the volume of water left, ' + t('W') + ' (L).'], why: 'The water drains away as time passes: the volume left depends on the time.' },
    { ind: 'w', dep: 'C', s: ['The cost, ' + t('C') + ' (dollars), of mailing a parcel depends on its mass, ' + t('w') + ' (kg).', 'The mass, ' + t('w') + ' (kg), of a parcel decides the cost, ' + t('C') + ' (dollars), of mailing it.'], why: 'The post office charges by mass: the cost depends on the mass.' },
    { ind: 'r', dep: 'A', s: ['The area, ' + t('A') + ' (cm²), of a circle is related to its radius, ' + t('r') + ' (cm).', 'The radius, ' + t('r') + ' (cm), of a circle is related to its area, ' + t('A') + ' (cm²).'], why: 'The area is worked out from the radius (' + t('A=\\pi r^{2}') + ').' },
    { ind: 'd', dep: 'E', s: ['The number of people, ' + t('E') + ', who enter a store is related to the day of the sale, ' + t('d') + '.', 'The day of a sale, ' + t('d') + ', is related to the number of people, ' + t('E') + ', who enter the store.'], why: 'The count of people is recorded for each day: it depends on the day.' },
    { ind: 'g', dep: 'L', s: ['The length, ' + t('L') + ' (cm), of a spring is related to the mass, ' + t('g') + ' (g), hung from it.', 'The mass, ' + t('g') + ' (g), hung from a spring is related to the length of the spring, ' + t('L') + ' (cm).'], why: 'Hanging more mass stretches the spring: its length depends on the mass.' }];
  function varsPart(prompt, ind, dep, why, sol, text) {
    function clean(s) { return String(s == null ? '' : s).replace(/\\[a-zA-Z]+|[{}$\\()\s]/g, ''); }
    var ci = ind.toLowerCase() !== dep.toLowerCase(); // the two letters differ even ignoring case: accept either case
    function eqL(a, b) { return a === b || (ci && a.length === 1 && a.toLowerCase() === b.toLowerCase()); }
    return { prompt: prompt, text: text, solution: sol,
      input: { type: 'fields', fields: [{ label: 'Independent variable:', name: 'Independent', mode: 'text', placeholder: 'letter' }, { label: 'Dependent variable:', name: 'Dependent', mode: 'text', placeholder: 'letter' }] },
      key: [ind, dep], answer: 'Independent: ' + t(ind) + '; dependent: ' + t(dep), bad: [[dep, ind]],
      check: function (resp) {
        resp = resp || []; var a = clean(resp[0]), b = clean(resp[1]);
        if (!a || !b) return form('empty', 'Type one letter in each box.');
        if (eqL(a, ind) && eqL(b, dep)) return ok();
        if (eqL(a, dep) && eqL(b, ind)) return wrong('u5x-var-swap', why);
        if (a === b) return form('var-same', 'The two boxes need two different variables: one is the input, the other the output.');
        return form('var-letter', 'Use the letters from the question, ' + t(ind) + ' and ' + t(dep) + ' (one letter per box, same capital or small letter).');
      },
      hints: ['The independent variable is the input — the one that changes on its own. The dependent variable is the output: its value is decided by the input.', 'Ask: which quantity <b>depends on</b> the other?'] };
  }
  var RATE = [
    { key: 'hike', v: 't', L: 'E', up: false, b: [1800, 2000, 2200, 2400, 2600], rr: [150, 200, 250, 300], txt: function (b, rr) { return 'A hiker starts at an elevation of ' + t(F(b)) + ' m and walks down a trail, losing ' + t(rr) + ' m of elevation every hour.'; }, ask: function (X) { return 'After how many hours is the hiker at an elevation of ' + t(F(X)) + ' m?'; }, Lw: 'the elevation, ' + t('E') + ' (m),', vw: 'hours', unit: 'h' },
    { key: 'fuel', v: 't', L: 'F', up: false, b: [60, 72, 80, 90, 96], rr: [3, 4, 6, 8], txt: function (b, rr) { return 'A generator starts with ' + t(b) + ' L of fuel and burns ' + t(rr) + ' L every hour.'; }, ask: function (X) { return 'After how many hours are ' + t(X) + ' L of fuel left?'; }, Lw: 'the fuel left, ' + t('F') + ' (L),', vw: 'hours', unit: 'h' },
    { key: 'save', v: 'w', L: 'A', up: true, b: [40, 60, 75, 120, 150], rr: [15, 20, 25, 30], txt: function (b, rr) { return 'Mila has ' + t('\\$' + b) + ' in her savings account and adds ' + t('\\$' + rr) + ' every week.'; }, ask: function (X) { return 'After how many weeks will she have ' + t('\\$' + F(X)) + '?'; }, Lw: 'the amount saved, ' + t('A') + ' (dollars),', vw: 'weeks', unit: 'weeks' },
    { key: 'diver', v: 't', L: 'D', up: true, b: [2, 3, 4, 5], rr: [6, 8, 9, 12], txt: function (b, rr) { return 'A diver is ' + t(b) + ' m below the surface and swims straight down, going ' + t(rr) + ' m deeper every minute.'; }, ask: function (X) { return 'After how many minutes is the diver ' + t(X) + ' m below the surface?'; }, Lw: 'the depth, ' + t('D') + ' (m),', vw: 'minutes', unit: 'min' },
    { key: 'pool', v: 'm', L: 'V', up: false, b: [900, 1200, 1500, 1800], rr: [40, 50, 60, 75], txt: function (b, rr) { return 'A hot tub holds ' + t(F(b)) + ' L of water. It is drained at ' + t(rr) + ' L per minute.'; }, ask: function (X) { return 'After how many minutes are ' + t(F(X)) + ' L left?'; }, Lw: 'the volume left, ' + t('V') + ' (L),', vw: 'minutes', unit: 'min' }];

  HW.defineExit({
    lesson: 'u5l2', calc: true,
    blurb: 'Tables of values from an equation, independent and dependent variables, linear or nonlinear, and equations from a situation.',
    questions: [
      { num: '1', outcome: 'RF1',
        shared: function (r) { var m = r.pick(nz(-5, 5).filter(function (x) { return Math.abs(x) > 1; })), b = r.pick(nz(-9, 9)), xs = r.sample([-4, -3, -2, -1], 2).concat([0], r.sample([1, 2, 3, 4], 1)).sort(function (a, c) { return a - c; }); return { m: m, b: b, xs: xs }; },
        stem: function (s) { return 'Consider the relation ' + t('y=' + lin([[s.m, 'x'], [s.b, '']])) + '.'; },
        parts: [
          { id: '1', outcome: 'RF1', level: 'BEG', make: function (r, s) {
            var m = s.m, b = s.b, f = function (x) { return m * x + b; };
            var fl = s.xs.map(function (x) { return { label: t('x=' + x) + ':', before: t('y='), mode: 'number' }; });
            var ch = s.xs.map(function (x) { return numChk(f(x), [[m * Math.abs(x) + b, 'fn-neg-sub', 'Careful with the negative input: ' + t(m + '\\times' + sgp(x) + '=' + m * x) + '.'], [m * x, 'u5x-no-b', 'Don’t forget the constant: add ' + t(sgp(b)) + '.'], [m + x + b, 'fn-add-coef', t(m + 'x') + ' means ' + t(m + '\\times x') + ': multiply, don’t add.']]); });
            var p = B.fields('Complete the table of values: find ' + t('y') + ' for each value of ' + t('x') + '.', fl, ch, s.xs.map(function (x) { return String(f(x)); }), s.xs.map(function (x) { return t('x=' + x) + ': ' + t('y=' + f(x)); }).join(', '),
              s.xs.map(function (x) { return t('x=' + x) + ': ' + t('y=' + m + '(' + x + ')' + (b < 0 ? '' : '+') + b + '=' + f(x)); }).join('<br>'),
              ['Substitute each value of ' + t('x') + ' into the equation, in brackets.', 'Multiply first, then add the constant. A negative times a negative is positive.'], 'table from y=mx+b');
            p.bad = [s.xs.map(function (x) { return String(m * x); }), s.xs.map(function (x) { return String(m * Math.abs(x) + b); })];
            return p;
          } }] },
      { num: '2', outcome: 'RF2', stem: 'State the independent variable and the dependent variable.', parts: [
        { id: '2', outcome: 'RF2', level: 'EMG', make: function (r) {
          var c = r.pick(IVDV), k = r.int(0, 1);
          return varsPart(c.s[k], c.ind, c.dep, c.why + ' Independent: ' + t(c.ind) + '; dependent: ' + t(c.dep) + '.', c.why + '<br>Independent variable (input): ' + t(c.ind) + '. Dependent variable (output): ' + t(c.dep) + '.', 'independent/dependent ' + c.ind + ', ' + c.dep);
        } }] },
      { num: '3', outcome: 'RF1',
        shared: function (r) {
          var linear = r.chance(0.5), st = r.pick([1, 2]), x0 = r.pick([-2, -1, 0]), xs = [0, 1, 2, 3, 4].map(function (i) { return x0 + i * st; }), f;
          if (linear) { var a = r.pick(nz(-6, 6).filter(function (x) { return Math.abs(x) > 1; })), b = r.int(-6, 9); f = function (x) { return a * x + b; }; }
          else { var q = r.pick([1, 1, 2, -1]), c = r.int(-5, 6), bb = r.int(-3, 3); f = function (x) { return q * x * x + bb * x + c; }; }
          return { linear: linear, xs: xs, ys: xs.map(f) };
        },
        stem: function (s) { return 'The ' + t('x') + '-values in the table go up in equal steps.' + HW.valueTable([[t('x')].concat(s.xs), [t('y')].concat(s.ys)]); },
        parts: [
          { id: '3', outcome: 'RF1', level: 'EMG', make: function (r, s) {
            var ys = s.ys, d = [1, 2, 3, 4].map(function (i) { return ys[i] - ys[i - 1]; }), word = s.linear ? 'linear' : 'nonlinear';
            var fl = d.map(function (x, i) { return { label: 'Change from ' + t('y=' + ys[i]) + ' to ' + t('y=' + ys[i + 1]) + ':', mode: 'number' }; }).concat([{ label: 'The relation is', name: 'Linear or nonlinear', mode: 'text', wide: true, placeholder: 'type linear or nonlinear' }]);
            var ch = d.map(function (x, i) { var c0 = numChk(x, [[-x, 'u5x-diff-order', 'Subtract in order: the <b>new</b> value minus the <b>old</b> one, ' + t(ys[i + 1] + '-' + sgp(ys[i])) + '.']]); return function (resp) { return c0(String(resp == null ? '' : resp).replace(/^\s*\+/, '')); }; }); // "+3" (as the booklet writes a change) is fine
            ch.push(function (resp) {
              var w = String(resp == null ? '' : resp).replace(/\\text\{([^}]*)\}/g, '$1').trim().toLowerCase().replace(/[^a-z]/g, '');
              if (!w) return form('empty', 'Type <b>linear</b> or <b>nonlinear</b>.');
              if (w !== 'linear' && w !== 'nonlinear' && w !== 'notlinear') return form('word', 'Type <b>linear</b> or <b>nonlinear</b>.');
              var isLin = w === 'linear';
              return isLin === s.linear ? ok() : wrong('u5x-lin-word', s.linear ? 'The changes in ' + t('y') + ' are all the same, so the relation is <b>linear</b>.' : 'The changes in ' + t('y') + ' are not all the same, so the relation is <b>nonlinear</b>.');
            });
            var p = B.fields('Find the change in ' + t('y') + ' from each value to the next. Then decide whether the relation is <b>linear</b> or <b>nonlinear</b>.', fl, ch, d.map(String).concat([word]), 'Changes: ' + t(d.join(',\\ ')) + ' — <b>' + word + '</b>',
              'Changes in ' + t('y') + ': ' + d.map(function (x, i) { return t(ys[i + 1] + '-' + sgp(ys[i]) + '=' + x); }).join(', ') + '.<br>' + (s.linear ? 'The ' + t('x') + '-values go up in equal steps and every change in ' + t('y') + ' is ' + t(d[0]) + ', so the relation is <b>linear</b>.' : 'The ' + t('x') + '-values go up in equal steps but the changes in ' + t('y') + ' are not equal, so the relation is <b>nonlinear</b>.'),
              ['Subtract each ' + t('y') + '-value from the next one (new minus old).', 'Equal steps in ' + t('x') + ' and equal changes in ' + t('y') + ' mean the relation is linear.'], 'linear or not from a table');
            p.bad = [d.map(String).concat([s.linear ? 'nonlinear' : 'linear']), d.map(function (x) { return String(-x); }).concat([word])];
            return p;
          } }] },
      { num: '4', outcome: 'RF1',
        shared: function (r) {
          var c = r.pick(RATE), b = r.pick(c.b), rr = r.pick(c.rr), m = c.up ? rr : -rr;
          var n = pickWhere(function () { return r.int(3, 12); }, function (n) { return b + m * n > 0; });
          return { c: c, b: b, rr: rr, m: m, n: n, X: b + m * n };
        },
        stem: function (s) { return s.c.txt(s.b, s.rr); },
        parts: [
          { id: '4a', outcome: 'RF1', level: 'PRG', make: function (r, s) {
            var c = s.c, v = c.v, L = c.L, key = lin([[s.b, ''], [s.m, v]]), T = PL(key);
            return eqPart('Write an equation for ' + c.Lw + ' after ' + t(v) + ' ' + c.vw + '.', L, v, T, key, [
              { is: PL(lin([[s.m, v]])), code: 'no-fee', hint: 'At ' + t(v + '=0') + ' the value is already ' + t(F(s.b)) + ': add that starting value.' },
              { is: PL(lin([[s.b, ''], [-s.m, v]])), code: 'sign-rate', hint: 'Does the quantity go ' + (s.m < 0 ? '<b>down</b>' : '<b>up</b>') + ' as time passes? The sign of the rate must show that.' },
              { is: PL(lin([[s.m, ''], [s.b, v]])), code: 'u5x-swap-coef', hint: 'The starting value is the constant; the amount per ' + c.unit.replace(/s$/, '') + ' multiplies ' + t(v) + '.' }],
              'Start: ' + t(F(s.b)) + '. Each ' + (c.vw === 'weeks' ? 'week' : c.vw === 'hours' ? 'hour' : 'minute') + ' the value ' + (s.m < 0 ? 'goes down' : 'goes up') + ' by ' + t(s.rr) + '.<br>' + t(L + '=' + key),
              ['What is the value at the start (' + t(v + '=0') + ')? That is the constant.', 'How much does it change each ' + (c.vw === 'weeks' ? 'week' : c.vw === 'hours' ? 'hour' : 'minute') + ', and in which direction? That number (with its sign) multiplies ' + t(v) + '.'], c.key + ' equation');
          } },
          { id: '4b', outcome: 'RF1', level: 'PRG', make: function (r, s) {
            var c = s.c, v = c.v, L = c.L, X = s.X, n = s.n, b = s.b, m = s.m, key = lin([[b, ''], [m, v]]);
            return numPart(c.ask(X), n, [
              [(b + X) / Math.abs(m), 'add-not-sub', 'Check: substitute your answer into ' + t(L + '=' + key) + '. Find the <b>change</b> first: the difference between ' + t(F(b)) + ' and ' + t(F(X)) + '.'],
              [X / Math.abs(m), 'no-subtract', 'The value doesn’t start at 0: it starts at ' + t(F(b)) + '. Use the change from ' + t(F(b)) + ' to ' + t(F(X)) + '.'],
              [Math.abs(X - b), 'no-divide', 'That is the total change. Divide it by the ' + t(s.rr) + ' per ' + (c.vw === 'weeks' ? 'week' : c.vw === 'hours' ? 'hour' : 'minute') + '.'],
              [b + m * X, 'u5x-evaluated', 'You substituted ' + t(F(X)) + ' for ' + t(v) + '. Here ' + t(F(X)) + ' is the value of ' + t(L) + ': solve ' + t(key + '=' + X) + '.']],
              'Solve ' + t(key + '=' + F(X)) + ':<br>' + t(nf(m) + v + '=' + F(X) + '-' + sgp(b) + '=' + F(X - b)) + '<br>' + t(v + '=' + F(X - b) + '\\div' + sgp(m) + '=' + n) + '<br>After ' + t(n) + ' ' + c.vw + '.',
              ['Set your equation equal to ' + t(F(X)) + ' and solve for ' + t(v) + '.', 'Subtract the starting value first, then divide by the rate.'], c.key + ' solve', { after: c.unit });
          } }] }
    ]
  });

  /* =====================================================================================================
   * Lesson 3 — Where graphs meet the axes: intercepts (RF1)
   * ===================================================================================================== */
  HW.defineExit({
    lesson: 'u5l3', calc: true,
    blurb: 'x- and y-intercepts of lines and parabolas from their equations, as ordered pairs; a parabola from its intercepts.',
    questions: [
      { num: '1', outcome: 'RF1', stem: 'Determine the ' + t('x') + '- and ' + t('y') + '-intercepts. Write each intercept point as an ordered pair.', parts: [
        { id: '1', outcome: 'RF1', level: 'BEG', make: function (r) {
          var m = r.pick(nz(-6, 6).filter(function (x) { return Math.abs(x) > 1; })), x0 = r.pick(nz(-8, 8)), b = -m * x0, form0 = r.chance(0.5);
          var eq = form0 ? 'y=' + lin([[m, 'x'], [b, '']]) : 'y=' + lin([[b, ''], [m, 'x']]);
          return interceptsPart(t(eq), [x0], [b], { sol: '<b>' + t('x') + '-intercept</b>: let ' + t('y=0') + ': ' + t('0=' + lin([[m, 'x'], [b, '']])) + ', so ' + t(lin([[m, 'x']]) + '=' + (-b)) + ' and ' + t('x=' + x0) + '. Point ' + t(iptT([x0, 0])) + '.<br><b>' + t('y') + '-intercept</b>: let ' + t('x=0') + ': ' + t('y=' + m + '(0)' + (b < 0 ? '' : '+') + b + '=' + b) + '. Point ' + t(iptT([0, b])) + '.', text: 'intercepts of ' + eq });
        } }] },
      { num: '2', outcome: 'RF1', stem: 'Determine the ' + t('x') + '-intercept(s) and the ' + t('y') + '-intercept of the parabola. Write each intercept point as an ordered pair; press <b>none</b> if there isn’t one.', parts: [
        { id: '2', outcome: 'RF1', level: 'EMG', make: function (r) {
          var kind = r.pick(['down', 'up', 'up', 'down', 'none']), k = r.int(2, 9), a = r.pick([1, 1, 2, 3]), eq, xs, c, sol;
          if (kind === 'down') { c = a * k * k; eq = 'y=' + c + (a === 1 ? '-x^{2}' : '-' + a + 'x^{2}'); xs = [k, -k]; sol = t('0=' + c + '-' + (a === 1 ? '' : a) + 'x^{2}') + ' → ' + t((a === 1 ? '' : a) + 'x^{2}=' + c) + ' → ' + t('x^{2}=' + k * k) + ' → ' + t('x=\\pm ' + k) + '.'; }
          else if (kind === 'up') { c = -a * k * k; eq = 'y=' + (a === 1 ? '' : a) + 'x^{2}' + c; xs = [k, -k]; sol = t('0=' + (a === 1 ? '' : a) + 'x^{2}' + c) + ' → ' + t((a === 1 ? '' : a) + 'x^{2}=' + (-c)) + ' → ' + t('x^{2}=' + k * k) + ' → ' + t('x=\\pm ' + k) + '.'; }
          else { c = r.int(2, 30); eq = 'y=' + (a === 1 ? '' : a) + 'x^{2}+' + c; xs = null; sol = t('0=' + (a === 1 ? '' : a) + 'x^{2}+' + c) + ' → ' + t((a === 1 ? '' : a) + 'x^{2}=-' + c) + '. A square is never negative, so there is <b>no</b> ' + t('x') + '-intercept.'; }
          return interceptsPart(t(eq), xs, [c], { sol: '<b>' + t('x') + '-intercepts</b>: let ' + t('y=0') + ': ' + sol + '<br><b>' + t('y') + '-intercept</b>: let ' + t('x=0') + ': ' + t('y=' + c) + ', point ' + t(iptT([0, c])) + '.', xMiss: 'Correct so far — a square root has two answers, ' + t('+') + ' and ' + t('-') + ', so there is a second ' + t('x') + '-intercept.', text: 'parabola intercepts ' + eq,
            hints: ['Let ' + t('y=0') + ' and solve for ' + t('x^{2}') + ', then take the square root: remember ' + t('\\pm') + '. If ' + t('x^{2}') + ' would have to be negative, there is no ' + t('x') + '-intercept.', 'For the ' + t('y') + '-intercept let ' + t('x=0') + '.'] });
        } }] },
      { num: '3', outcome: 'RF1', stem: 'Determine the ' + t('x') + '- and ' + t('y') + '-intercepts of the line. Write each intercept point as an ordered pair.', parts: [
        { id: '3', outcome: 'RF1', level: 'PRG', make: function (r) {
          var v = pickWhere(function () { var x0 = r.pick(nz(-9, 9)), y0 = r.pick(nz(-9, 9)), L = Math.abs(x0 * y0) / gcd(x0, y0); return { x0: x0, y0: y0, A: L / x0, B: L / y0, C: -L }; },
            function (v) { return Math.abs(v.A) >= 2 && Math.abs(v.B) >= 2 && Math.abs(v.x0) !== Math.abs(v.y0) && Math.abs(v.C) <= 72; });
          if (v.A < 0) { v.A = -v.A; v.B = -v.B; v.C = -v.C; }
          var gen = r.chance(0.6), eq = gen ? lin([[v.A, 'x'], [v.B, 'y'], [v.C, '']]) + '=0' : lin([[v.A, 'x'], [v.B, 'y']]) + '=' + (-v.C);
          var sx = 'Let ' + t('y=0') + ': ' + t(lin([[v.A, 'x']]) + (gen ? (v.C < 0 ? '' : '+') + v.C + '=0' : '=' + (-v.C))) + ', so ' + t(v.A + 'x=' + (-v.C)) + ' and ' + t('x=' + v.x0) + '.';
          var sy = 'Let ' + t('x=0') + ': ' + t(lin([[v.B, 'y']]) + (gen ? (v.C < 0 ? '' : '+') + v.C + '=0' : '=' + (-v.C))) + ', so ' + t(v.B + 'y=' + (-v.C)) + ' and ' + t('y=' + v.y0) + '.';
          return interceptsPart(t(eq), [v.x0], [v.y0], { sol: '<b>' + t('x') + '-intercept</b>: ' + sx + ' Point ' + t(iptT([v.x0, 0])) + '.<br><b>' + t('y') + '-intercept</b>: ' + sy + ' Point ' + t(iptT([0, v.y0])) + '.', text: 'intercepts of ' + eq,
            xDiag: function (A) { return A.length === 1 && same(A[0][1], 0) && same(A[0][0], -v.C) ? { code: 'int-no-divide', hint: 'You found ' + t(v.A + 'x=' + (-v.C)) + ' — now divide by ' + t(v.A) + '.' } : null; },
            yDiag: function (A) { return A.length === 1 && same(A[0][0], 0) && same(A[0][1], -v.C) ? { code: 'int-no-divide', hint: 'You found ' + t(v.B + 'y=' + (-v.C)) + ' — now divide by ' + t(v.B) + '.' } : null; },
            bad: [[iptKey([-v.C, 0]), iptKey([0, v.y0])]],
            hints: ['For the ' + t('x') + '-intercept, the ' + t('y') + '-term disappears when ' + t('y=0') + '. Solve what is left for ' + t('x') + '.', 'Move the constant to the other side, then divide by the coefficient — watch the signs.'] });
        } }] },
      { num: '4', outcome: 'RF1',
        shared: function (r) {
          return pickWhere(function () { var p = r.pick(nz(-6, 6)), q = r.pick(nz(-6, 6)), a = r.pick([-3, -2, -1, 2, 3]); return { p: Math.min(p, q), q: Math.max(p, q), a: a, c: a * p * q }; },
            function (s) { return s.p !== s.q && s.p !== -s.q && Math.abs(s.c) <= 60 && Math.abs(s.c) >= 4; });
        },
        stem: function (s) { return 'A parabola has ' + t('x') + '-intercepts ' + t(iptT([s.p, 0])) + ' and ' + t(iptT([s.q, 0])) + ', and ' + t('y') + '-intercept ' + t(iptT([0, s.c])) + '. Its equation can be written ' + t('y=a' + '(x' + (s.p < 0 ? '+' + (-s.p) : '-' + s.p) + ')(x' + (s.q < 0 ? '+' + (-s.q) : '-' + s.q) + ')') + '.'; },
        parts: [
          { id: '4', outcome: 'RF1', level: 'ADV', make: function (r, s) {
            var a = s.a, p = s.p, q = s.q, c = s.c, fp = '(x' + (p < 0 ? '+' + (-p) : '-' + p) + ')', fq = '(x' + (q < 0 ? '+' + (-q) : '-' + q) + ')';
            var keyRhs = lin([[a, 'x^{2}'], [-a * (p + q), 'x'], [a * p * q, '']]), T = PL(keyRhs);
            var W = [{ is: PL(lin([[1, 'x^{2}'], [-(p + q), 'x'], [p * q, '']])), code: 'u5x-no-a', hint: 'You expanded ' + t(fp + fq) + ' but left out ' + t('a=' + a) + ': multiply every term by it.' },
              { is: PL(lin([[a, 'x^{2}'], [a * (p + q), 'x'], [a * p * q, '']])), code: 'u5x-factor-sign', hint: 'Check the factors: an ' + t('x') + '-intercept of ' + t(p) + ' gives the factor ' + t(fp) + ' (it is ' + t('0') + ' when ' + t('x=' + p) + ').' },
              { is: PL(lin([[a, 'x^{2}'], [-a * (p + q), 'x'], [-a * p * q, '']])), code: 'u5x-expand', hint: 'Check the constant term: ' + t('a\\times(' + (-p) + ')\\times(' + (-q) + ')') + ' — and compare with the ' + t('y') + '-intercept, ' + t(c) + '.' }];
            var ac = numChk(a, [[c, 'u5x-a-c', 'At ' + t('x=0') + ': ' + t(c + '=a(0' + (p < 0 ? '+' + (-p) : '-' + p) + ')(0' + (q < 0 ? '+' + (-q) : '-' + q) + ')=' + p * q + 'a') + '. Divide by ' + t(p * q) + ' to find ' + t('a') + '.'], [p * q / c, 'u5x-a-flip', 'Solve ' + t(c + '=' + p * q + 'a') + ': ' + t('a=' + c + '\\div' + sgp(p * q)) + '.'], [-a, 'fn-sign', 'Check the sign: ' + t('(0' + (p < 0 ? '+' + (-p) : '-' + p) + ')(0' + (q < 0 ? '+' + (-q) : '-' + q) + ')=' + p * q) + '.']]);
            var Wf = W.filter(function (w) { return !P.eq(w.is, T); }), ec = K.poly(T, { wrong: Wf, expanded: true });
            var echk = function (resp) { var s0 = String(resp == null ? '' : resp).replace(/^\s*y\s*=/, ''); return ec(s0); };
            var p0 = B.fields('Use the ' + t('y') + '-intercept to find ' + t('a') + '. Then write the equation in the form ' + t('y=ax^{2}+bx+c') + '.',
              [{ label: t('a='), name: 'a', mode: 'number' }, { label: 'Equation:', name: 'Equation', before: t('y='), mode: 'math', keys: 'poly', vars: ['x'], wide: true }], [ac, echk], [String(a), keyRhs],
              t('a=' + a) + ', ' + t('y=' + keyRhs),
              'Substitute the ' + t('y') + '-intercept ' + t(iptT([0, c])) + ': ' + t(c + '=a(0' + (p < 0 ? '+' + (-p) : '-' + p) + ')(0' + (q < 0 ? '+' + (-q) : '-' + q) + ')=' + p * q + 'a') + ', so ' + t('a=' + a) + '.<br>' +
              t('y=' + a + fp + fq + '=' + a + '(x^{2}' + term(-(p + q), 'x', false) + term(p * q, '', false) + ')=' + keyRhs) + '.<br>Check: the constant term ' + t(c) + ' is the ' + t('y') + '-intercept ✓',
              ['At the ' + t('y') + '-intercept ' + t('x=0') + ': substitute ' + t('x=0') + ' and ' + t('y=' + c) + ' into ' + t('y=a' + fp + fq) + ' and solve for ' + t('a') + '.', 'Expand the two brackets first, then multiply every term by ' + t('a') + '.'], 'parabola from intercepts');
            p0.bad = [[String(c), keyRhs]].concat(Wf.map(function (w) { return [String(a), P.tex(w.is)]; }));
            return p0;
          } }] }
    ]
  });

  /* =====================================================================================================
   * Lesson 4 — Domain and range (RF2)
   * ===================================================================================================== */
  HW.defineExit({
    lesson: 'u5l4', calc: true,
    blurb: 'Domain and range from an arrow diagram, shaded on number lines from a graph, in set notation, and a sketch to fit a given domain and range.',
    questions: [
      { num: '1', outcome: 'RF2', stem: 'State the domain and range of the relation shown in the arrow diagram.', parts: [
        { id: '1', outcome: 'RF2', level: 'BEG', make: function (r) {
          var vals = pickWhere(function () { var L = r.sample(nz(-9, 12), 4).sort(function (a, b) { return a - b; }), R = r.sample(range(-6, 20), 4).sort(function (a, b) { return a - b; }); return { L: L, R: R }; }, function () { return true; });
          var L = vals.L, Rv = vals.R, unhit = r.pick(Rv), hit = Rv.filter(function (x) { return x !== unhit; }), dbl = r.pick(L);
          var pairs = L.map(function (x, i) { return [x, hit[i % hit.length]]; });
          var extra = hit.filter(function (y) { return !pairs.some(function (p) { return p[0] === dbl && p[1] === y; }); })[0];
          pairs.push([dbl, extra]);
          var used = uniq(pairs.map(function (p) { return p[1]; })), D = lst(L), Rr = lst(used);
          var rW = [{ is: lst(Rv), code: 'dr-unhit', hint: 'Check every value on the right: ' + t(unhit) + ' receives <b>no arrow</b>, so the relation never produces it. Only values that are landed on are in the range.' }];
          var sol = 'The arrows are ' + t(pairs.map(function (p) { return p[0] + '\\to ' + p[1]; }).join(',\\ ')) + '.<br>Domain = the values the arrows start from: ' + t('D=' + D) + ' (' + t(dbl) + ' has two arrows but is listed once).<br>Range = the values the arrows point to: ' + t('R=' + Rr) + '; ' + t(unhit) + ' gets no arrow, so it is not in the range.';
          return drPart(HW.arrowDiagram(L, Rv, pairs), D, Rr, { rW: rW, bad: [[lst(L.slice(1)), Rr]] }, sol,
            ['The domain is the set of values the arrows <b>start</b> from; the range is the set of values the arrows <b>point to</b>.', 'List each value once, smallest first, in braces.'], 'domain and range of an arrow diagram');
        } }] },
      { num: '2', outcome: 'RF2',
        shared: function (r) {
          return pickWhere(function () {
            var a = r.int(-5, -2), b = r.int(2, 5), m = r.int(a + 1, b - 1), peak = r.chance(0.5);
            var yL = r.int(-4, 4), yR = r.int(-4, 4), yM = peak ? r.int(Math.max(yL, yR) + 1, 5) : r.int(-5, Math.min(yL, yR) - 1);
            var openL = r.chance(0.5);
            return { L: [a, yL], M: [m, yM], R: [b, yR], peak: peak, sL: openL ? 'open' : 'closed', sR: openL ? 'closed' : 'open' };
          }, function (s) { return Math.abs(s.L[1] - s.R[1]) >= 2 && s.M[1] >= -5 && s.M[1] <= 5 && Math.abs(s.M[1]) <= 5; });
        },
        stem: function (s) { return 'The graph of a relation is shown below.' + G({ segs: [{ pts: [s.L, s.M, s.R], start: s.sL, end: s.sR }] }); },
        parts: [
          { id: '2', outcome: 'RF2', level: 'EMG', make: function (r, s) {
            var L = s.L, M = s.M, R = s.R, openPt = s.sL === 'open' ? L : R, clPt = s.sL === 'open' ? R : L;
            var D = bld('x', L[0], R[0], s.sL === 'closed', s.sR === 'closed');
            var ends = [L, R], lowEnd = L[1] < R[1] ? L : R, highEnd = L[1] < R[1] ? R : L, lowS = lowEnd === L ? s.sL : s.sR, highS = highEnd === L ? s.sL : s.sR, Rg;
            if (s.peak) Rg = bld('y', lowEnd[1], M[1], lowS === 'closed', true); else Rg = bld('y', M[1], highEnd[1], true, highS === 'closed');
            var spec = { segs: [{ pts: [L, M, R], start: s.sL, end: s.sR }] };
            var dW = [{ is: bld('x', L[0], R[0], s.sR === 'closed', s.sL === 'closed'), code: 'dr-open-side', hint: 'Match each end of the domain to its dot: the hollow dot is at ' + t('x=' + openPt[0]) + ', so that value is excluded; the solid dot keeps ' + t('x=' + clPt[0]) + '.' }];
            var rW = s.peak ? [{ is: bld('y', lowEnd[1], highEnd[1], lowS === 'closed', highS === 'closed'), code: 'dr-peak', hint: 'The highest point isn’t an end of the graph: it is the corner ' + t(ptT(M)) + '. Look for the highest and lowest points <b>anywhere</b> on the graph.' }]
              : [{ is: bld('y', lowEnd[1], highEnd[1], lowS === 'closed', highS === 'closed'), code: 'dr-peak', hint: 'The lowest point isn’t an end of the graph: it is the corner ' + t(ptT(M)) + '. Look for the highest and lowest points <b>anywhere</b> on the graph.' }];
            var ext = s.peak ? 'highest point is the corner ' + t(ptT(M)) + ' (on the graph); the lowest is the end ' + t(ptT(lowEnd)) + ' (' + (lowS === 'closed' ? 'solid: included' : 'hollow: excluded') + ')' : 'lowest point is the corner ' + t(ptT(M)) + ' (on the graph); the highest is the end ' + t(ptT(highEnd)) + ' (' + (highS === 'closed' ? 'solid: included' : 'hollow: excluded') + ')';
            return shadeDR('Show the domain and the range on the two number lines: a dot at each end value (solid or open), shaded in between.', spec, D, Rg, { dW: dW, rW: rW, hideGraph: true },
              'Left to right the graph runs from ' + t('x=' + L[0]) + ' (' + (s.sL === 'closed' ? 'solid' : 'hollow') + ') to ' + t('x=' + R[0]) + ' (' + (s.sR === 'closed' ? 'solid' : 'hollow') + '): ' + t('D=' + D) + '.<br>Bottom to top: the ' + ext + ': ' + t('R=' + Rg) + '.',
              [s.peak ? 'The highest point can be a corner in the middle of the graph.' : 'The lowest point can be a corner in the middle of the graph.'], 'shade domain and range');
          } }] },
      { num: '3', outcome: 'RF2', stem: 'State the domain and range of the relation graphed below, in set notation.', parts: [
        { id: '3', outcome: 'RF2', level: 'PRG', make: function (r) {
          var kind = r.pick(['parab', 'ray', 'ray']);
          if (kind === 'parab') {
            var h = r.int(-3, 3), k = r.int(-4, 4), up = r.chance(0.5), a = up ? r.pick([0.5, 1, 2]) : -r.pick([0.5, 1, 2]);
            if (up && k > 2) k = -k; if (!up && k < -2) k = -k;
            var D = all('x'), Rg = up ? bld('y', k, null) : bld('y', null, k);
            return drPart(G({ fns: [parab(h, k, a)] }), D, Rg, { rW: [{ is: up ? bld('y', null, k) : bld('y', k, null), code: 'dr-opens', hint: 'The curve opens <b>' + (up ? 'up' : 'down') + '</b>: the vertex ' + t(ptT([h, k])) + ' is the ' + (up ? 'lowest' : 'highest') + ' point.' }, { is: up ? bld('y', k, null, false) : bld('y', null, k, true, false), code: 'dr-vertex', hint: 'The vertex ' + t(ptT([h, k])) + ' is on the curve, so ' + t('y=' + k) + ' is included: use ' + t(up ? '\\ge' : '\\le') + '.' }], dW: [{ is: bld('x', h - 3, h + 3), code: 'set-arrow', hint: 'The arrows mean the curve keeps going outward forever, so every ' + t('x') + '-value is used.' }] },
              'The arrows show the curve going ' + (up ? 'up' : 'down') + ' forever on both sides, so every real ' + t('x') + ' is used: ' + t('D=' + D) + '.<br>The vertex ' + t(ptT([h, k])) + ' is the ' + (up ? 'lowest' : 'highest') + ' point and is on the curve: ' + t('R=' + Rg) + '.',
              [HINT_D, 'Which way do the arrows point? Is there a highest point or a lowest point?'], 'D & R of a parabola');
          }
          var a0 = r.int(-4, 2), b0 = r.int(-4, 3), sl = r.pick([1, 2, 0.5, -1, -2, -0.5]), dir = r.chance(0.5) ? 1 : -1, st = r.chance(0.7) ? 'open' : 'closed';
          var end = toEdge([a0, b0], [dir, dir * sl]), goesUp = dir * sl > 0, right = dir > 0;
          var D2 = right ? bld('x', a0, null, st === 'closed') : bld('x', null, a0, true, st === 'closed'), R2 = goesUp ? bld('y', b0, null, st === 'closed') : bld('y', null, b0, true, st === 'closed');
          var dW = [{ is: right ? bld('x', null, a0, true, st === 'closed') : bld('x', a0, null, st === 'closed'), code: 'dr-ray-dir', hint: 'The ray goes to the <b>' + (right ? 'right' : 'left') + '</b> from ' + t('x=' + a0) + '.' }];
          var rW = [{ is: goesUp ? bld('y', null, b0, true, st === 'closed') : bld('y', b0, null, st === 'closed'), code: 'dr-ray-dir', hint: 'The ray goes <b>' + (goesUp ? 'up' : 'down') + '</b> from ' + t('y=' + b0) + '.' }];
          if (st === 'open') { dW.push({ is: right ? bld('x', a0, null) : bld('x', null, a0), code: 'set-endpoint', hint: 'The dot at ' + t(ptT([a0, b0])) + ' is hollow, so ' + t('x=' + a0) + ' is not on the graph: use ' + t(right ? '>' : '<') + '.' }); rW.push({ is: goesUp ? bld('y', b0, null) : bld('y', null, b0), code: 'set-endpoint', hint: 'The dot at ' + t(ptT([a0, b0])) + ' is hollow, so ' + t('y=' + b0) + ' is not on the graph: use ' + t(goesUp ? '>' : '<') + '.' }); }
          return drPart(G({ segs: [{ pts: [[a0, b0], end], start: st, end: 'arrow' }] }), D2, R2, { dW: dW, rW: rW },
            'The ray starts at the ' + (st === 'open' ? '<b>hollow</b> dot (not on the graph)' : '<b>solid</b> dot (on the graph)') + ' ' + t(ptT([a0, b0])) + ' and goes ' + (goesUp ? 'up' : 'down') + ' to the ' + (right ? 'right' : 'left') + ' forever (arrow).<br>' + t('D=' + D2) + ', ' + t('R=' + R2) + '.',
            [HINT_D, HINT_DOTS], 'D & R of a ray');
        } }] },
      { num: '4', outcome: 'RF2',
        shared: function (r) {
          return pickWhere(function () { var a = r.int(-5, -1), b = r.int(1, 5), lo = r.int(-5, -1), hi = r.int(1, 5); return { a: a, b: b, lo: lo, hi: hi, openLeft: r.chance(0.5), openLow: r.chance(0.5) }; }, function (s) { return s.b - s.a >= 4 && s.hi - s.lo >= 4; });
        },
        stem: 'Sketch the graph of a <b>function</b> with the domain and range given.',
        parts: [
          { id: '4', outcome: 'RF2', level: 'ADV', make: function (r, s) {
            var a = s.a, b = s.b, lo = s.lo, hi = s.hi;
            var Dt = bld('x', a, b, !s.openLeft, s.openLeft), Rt = bld('y', lo, hi, !s.openLow, s.openLow);
            // one hollow dot carries both excluded values (x = a or b, y = lo or hi); the other end is solid
            var exX = s.openLeft ? a : b, inX = s.openLeft ? b : a, exY = s.openLow ? lo : hi, inY = s.openLow ? hi : lo;
            var key = gv([], [{ v: [[exX, exY], [inX, inY]], s: 'open', e: 'closed' }]);
            var bads = [gv([], [{ v: [[exX, exY], [inX, inY]], s: 'closed', e: 'closed' }]), gv([], [{ v: [[exX, inY], [inX, exY]], s: 'open', e: 'closed' }]), gv([], [{ v: [[exX, exY], [inX, inY]], s: 'closed', e: 'open' }])];
            var pad = { x: [-6, 6], y: [-6, 6], labels: 2 };
            return sketchPart(t('D=' + Dt) + ' and ' + t('R=' + Rt), pad, { fn: true, domain: Dt, range: Rt }, key, bads,
              'The excluded values are ' + t('x=' + exX) + ' and ' + t('y=' + exY) + ', and they can share one hollow dot at ' + t(ptT([exX, exY])) + '. A segment from the hollow dot ' + t(ptT([exX, exY])) + ' to the solid dot ' + t(ptT([inX, inY])) + ' uses every ' + t('x') + ' in the domain and every ' + t('y') + ' in the range, and each vertical line meets it at most once, so it is a function. (Other drawings work too.)',
              ['Which ' + t('x') + '-value and which ' + t('y') + '-value must be left out? One hollow dot can leave out both.', 'Use <b>●○ Ends</b>: tap an end once to make it hollow.'], 'sketch a function with half-open D and R');
          } }] }
    ]
  });

  /* =====================================================================================================
   * Lesson 5 — What is a function? (RF2)
   * ===================================================================================================== */
  var SMALL = { x: [-5, 5], y: [-5, 5], labels: 0, max: 165, grid: 1 };
  function smallG(spec, aria) { return HW.graph(Object.assign({}, SMALL, spec, { aria: aria })); }
  function circlePts(h, k, rr) { var o = []; for (var i = 0; i <= 64; i++) { var th = 2 * Math.PI * i / 64; o.push([cl(h + rr * Math.cos(th)), cl(k + rr * Math.sin(th))]); } return o; }
  var FN_GRAPHS = [
    { fn: true, make: function (r) { var m = r.pick([1, 2, -1, -2, 0.5]), b = r.int(-2, 2); return { spec: { segs: [{ pts: [toEdge([0, b], [-1, -m], 4.6), toEdge([0, b], [1, m], 4.6)], start: 'arrow', end: 'arrow' }] }, name: 'a slanted line', why: 'every vertical line crosses a slanted line exactly once' }; } },
    { fn: true, make: function (r) { var h = r.int(-1, 1), k = r.int(-3, 0); return { spec: { fns: [parab(h, k, 1, 4.6)] }, name: 'a U-shaped curve', why: 'every vertical line crosses it at most once' }; } },
    { fn: true, make: function (r) { var h = r.int(-1, 1), k = r.int(-2, 1), up = r.chance(0.5) ? 1 : -1; return { spec: { segs: [{ pts: [[h - 4, k + 3 * up], [h, k - up], [h + 4, k + 2 * up]], start: 'closed', end: 'closed' }] }, name: up > 0 ? 'a V-shaped graph' : 'an upside-down V', why: 'every vertical line crosses it at most once' }; } },
    { fn: true, make: function (r) { var c = r.pick([-3, -2, 2, 3]); return { spec: { segs: [{ pts: [[-4.6, c], [4.6, c]], start: 'arrow', end: 'arrow' }] }, name: 'a horizontal line', why: 'a horizontal line has one ' + t('y') + ' for every ' + t('x') }; } },
    { fn: false, make: function (r) { var c = r.pick([-3, -2, -1, 1, 2, 3]); return { spec: { segs: [{ pts: [[c, -4.6], [c, 4.6]], start: 'arrow', end: 'arrow' }] }, name: 'a vertical line', why: 'a vertical line has many ' + t('y') + '-values for one ' + t('x') }; } },
    { fn: false, make: function (r) { var h = r.int(-1, 1), k = r.int(-1, 1), rr = r.pick([2, 3]); return { spec: { segs: [{ pts: circlePts(h, k, rr), start: 'none', end: 'none' }] }, name: 'a circle', why: 'a vertical line through the circle crosses it twice' }; } },
    { fn: false, make: function (r) { var k = r.int(-1, 1); return { spec: { fns: [] , segs: [{ pts: range(-20, 20).map(function (i) { var y = k + i * 0.2; return [cl(-3 + 0.45 * (y - k) * (y - k)), cl(y)]; }).filter(function (p) { return p[0] <= 4.6; }), start: 'arrow', end: 'arrow' }] }, name: 'a sideways U', why: 'a vertical line to the right of its tip crosses it twice' }; } }];
  HW.defineExit({
    lesson: 'u5l5', calc: true,
    blurb: 'Functions or not: the vertical line test, ordered pairs, a missing input value, and a sketch of a relation that is not a function.',
    questions: [
      { num: '1', outcome: 'RF2',
        shared: function (r) {
          var picks = pickWhere(function () { return r.sample(FN_GRAPHS, 3); }, function (g) { return g.some(function (x) { return x.fn; }) && g.some(function (x) { return !x.fn; }); });
          return { gs: picks.map(function (g) { var o = g.make(r); o.fn = g.fn; return o; }) };
        },
        stem: function (s) { return 'Use the vertical line test on each graph.' + flexFigs(s.gs.map(function (g, i) { return '<div style="text-align:center;font-weight:600">Graph ' + 'ABC'[i] + '</div>' + smallG(g.spec, 'graph ' + 'ABC'[i]); }), 150); },
        parts: [
          { id: '1', outcome: 'RF2', level: 'BEG', make: function (r, s) {
            var rows = s.gs.map(function (g, i) { return { id: 'ABC'[i], html: 'Graph ' + 'ABC'[i], label: 'Graph ' + 'ABC'[i] }; }), want = {};
            s.gs.forEach(function (g, i) { want['ABC'[i]] = g.fn ? 'F' : 'N'; });
            return B.grid('Is each graph the graph of a function?', rows, [{ id: 'F', html: 'Function' }, { id: 'N', html: 'Not a function' }], want,
              { why: function (id) { var g = s.gs['ABC'.indexOf(id)]; return { code: 'u5x-fn-wrong', hint: 'Graph ' + id + ' is ' + g.name + ': ' + g.why + ', so it is ' + (g.fn ? '' : '<b>not</b> ') + 'a function.' }; }, rowHead: 'Graph' },
              s.gs.map(function (g, i) { return 'Graph ' + 'ABC'[i] + ' (' + g.name + '): ' + g.why + ' → ' + (g.fn ? '<b>function</b>' : '<b>not a function</b>') + '.'; }).join('<br>'),
              ['Imagine a vertical line sliding across the graph from left to right.', 'If it ever crosses the graph more than once, one input has two outputs: not a function.'], 'vertical line test, 3 graphs');
          } }] },
      { num: '2', outcome: 'RF2',
        shared: function (r) {
          var mk = function (kind) {
            var xs = r.sample(nz(-9, 9), 4), ys = xs.map(function () { return r.int(-9, 9); });
            if (kind === 'repX') { ys = r.sample(range(-9, 9), 4); xs[3] = xs[r.int(0, 2)]; }
            if (kind === 'repY') { ys = r.sample(range(-9, 9), 3); ys.push(ys[r.int(0, 2)]); }
            if (kind === 'plain') { ys = r.sample(range(-9, 9), 4); }
            var pairs = xs.map(function (x, i) { return [x, ys[i]]; }), idx = r.shuffle([0, 1, 2, 3]);
            return idx.map(function (i) { return pairs[i]; });
          };
          var kinds = r.shuffle(['repX', 'repY', r.pick(['plain', 'repX'])]);
          return { rel: kinds.map(mk) };
        },
        stem: function (s) { return 'Decide whether each relation is a function.<br>' + s.rel.map(function (ps, i) { return '(' + 'abc'[i] + ') ' + t('\\{' + ps.map(ptT).join(',\\ ') + '\\}'); }).join('<br>'); },
        parts: [
        { id: '2', outcome: 'RF2', level: 'EMG', make: function (r, s) {
          var rel = s.rel, rows = rel.map(function (ps, i) { return { id: 'r' + i, html: 'Relation (' + 'abc'[i] + ')', label: '(' + 'abc'[i] + ')' }; }), want = {};
          var isFn = function (ps) { return !ps.some(function (p, i) { return ps.some(function (q, j) { return j < i && q[0] === p[0] && q[1] !== p[1]; }); }); };
          rel.forEach(function (ps, i) { want['r' + i] = isFn(ps) ? 'F' : 'N'; });
          var why = function (ps) {
            var rep = null; ps.forEach(function (p, i) { ps.forEach(function (q, j) { if (j < i && q[0] === p[0] && q[1] !== p[1]) rep = [q, p]; }); });
            if (rep) return 'The input ' + t(rep[0][0]) + ' has two outputs, ' + t(rep[0][1]) + ' and ' + t(rep[1][1]) + ': <b>not a function</b>.';
            var ry = null; ps.forEach(function (p, i) { ps.forEach(function (q, j) { if (j < i && q[1] === p[1]) ry = [q, p]; }); });
            return 'Every input (first coordinate) appears once' + (ry ? ' — the output ' + t(ry[0][1]) + ' is repeated, but that is allowed' : '') + ': <b>function</b>.';
          };
          return B.grid('Is each set of ordered pairs a function?', rows, [{ id: 'F', html: 'Function' }, { id: 'N', html: 'Not a function' }], want,
            { why: function (id) { var ps = rel[Number(id.slice(1))]; return { code: 'u5x-fn-wrong', hint: why(ps) }; }, rowHead: 'Relation' },
            rel.map(function (ps, i) { return '(' + 'abc'[i] + ') ' + why(ps); }).join('<br>'),
            ['A function gives each input exactly <b>one</b> output: look for a first coordinate that appears with two different second coordinates.', 'A repeated <b>output</b> (second coordinate) does not stop a relation from being a function.'], 'function or not: ordered pairs');
        } }] },
      { num: '3', outcome: 'RF2',
        shared: function (r) {
          var xs = r.sample(nz(-8, 9), 3), ys = r.sample(range(-9, 9), 4), g = ys[3];
          return { pts: xs.map(function (x, i) { return [x, ys[i]]; }), g: g, xs: xs };
        },
        stem: function (s) { return 'The relation ' + t('\\{' + s.pts.map(ptT).join(',\\ ') + ',\\ (k,\\ ' + s.g + ')\\}') + ' is <b>not</b> a function.'; },
        parts: [
          { id: '3', outcome: 'RF2', level: 'PRG', make: function (r, s) {
            var xs = s.xs, ys = s.pts.map(function (p) { return p[1]; });
            return solPart('Determine every possible value of ' + t('k') + '.', xs, 'k', [[ys.slice(0, 3), 'u5x-k-y', 'Those are outputs. ' + t('k') + ' is the <b>input</b> of the last pair: it must equal an input that already has a different output.']],
              'For the relation not to be a function, some input must have two different outputs. The last pair has output ' + t(s.g) + ', which is different from every other output, so ' + t('k') + ' can be <b>any</b> of the other inputs: ' + t('k=' + xs.slice().sort(function (a, b) { return a - b; }).join(',\\ k=')) + '.<br>(Any other value of ' + t('k') + ' gives four different inputs — a function.)',
              ['Not a function means one input has two outputs. Which inputs could ' + t('k') + ' copy?', 'Check each input already in the set: would ' + t('(k,\\ ' + s.g + ')') + ' give it a second output?'], 'k so that it is not a function',
              function (A, T) {
                if (A.length < T.length && A.every(function (x) { return T.some(function (y) { return same(x, y); }); })) return { code: 'u5x-one-k', hint: 'That value works — but it isn’t the only one. Check every input already in the set.' };
                if (A.some(function (x) { return !T.some(function (y) { return same(x, y); }); }) && T.every(function (y) { return A.some(function (x) { return same(x, y); }); })) return { code: 'u5x-k-extra', hint: 'One of your values doesn’t match any input in the set: with it, every input would still have one output (a function).' };
                return null;
              });
          } }] },
      { num: '4', outcome: 'RF2',
        shared: function (r) { var a = r.int(-5, -2), b = r.int(2, 5), p = r.int(a + 1, b - 1), q = r.int(-3, 3); return { a: a, b: b, p: p, q: q }; },
        stem: function (s) { return 'Sketch a relation that is <b>not</b> a function, with domain ' + t(bld('x', s.a, s.b)) + ', that passes through the point ' + t(ptT([s.p, s.q])) + '.'; },
        parts: [
          { id: '4', outcome: 'RF2', level: 'ADV', make: function (r, s) {
            var a = s.a, b = s.b, p = s.p, q = s.q, Dt = bld('x', a, b);
            var key = gv([], [segv([a, q], [b, q]), segv([p, q - 2 < -6 ? -6 : q - 2], [p, q + 2 > 6 ? 6 : q + 2])]);
            var bads = [gv([], [segv([a, q], [b, q])]), gv([], [segv([a, q + 1], [b, q + 1]), segv([p, q + 2], [p, q + 3])]), gv([], [segv([a, q], [b + 1, q]), segv([p, q - 1], [p, q + 1])])];
            return sketchPart('Draw your relation on the grid.', { x: [-6, 6], y: [-6, 6], labels: 2 }, { fn: false, domain: Dt, through: [[p, q]] }, key, bads,
              'A relation is not a function when some input has two or more outputs (a vertical line meets the graph more than once). One answer: the horizontal segment from ' + t(ptT([a, q])) + ' to ' + t(ptT([b, q])) + ' (it gives the domain and passes through ' + t(ptT([p, q])) + ') together with a short vertical segment at ' + t('x=' + p) + ', which gives ' + t('x=' + p) + ' many outputs. A circle or a sideways U across the domain would work too.',
              ['Not a function: some vertical line must meet your graph twice — for example, include a vertical piece.', 'The graph must reach exactly from ' + t('x=' + a) + ' to ' + t('x=' + b) + ' (solid ends) and pass through ' + t(ptT([p, q])) + '.'], 'sketch a non-function with given domain');
          } }] }
    ]
  });

  /* =====================================================================================================
   * Lesson 6 — Function notation (RF8)
   * ===================================================================================================== */
  var FN_NAMES = ['f', 'g', 'h', 'p', 'k'];
  HW.defineExit({
    lesson: 'u5l6', calc: true,
    blurb: 'Evaluate linear and quadratic functions (negative inputs), solve f(x) = b, and substitute an expression into a function.',
    questions: [
      { num: '1', outcome: 'RF8',
        shared: function (r) { var m = r.pick(nz(-7, 7).filter(function (x) { return Math.abs(x) > 1; })), b = r.pick(nz(-12, 12)), p = r.int(2, 9), q = r.int(2, 9); return { n: r.pick(FN_NAMES), m: m, b: b, p: p, q: -q, ord: r.chance(0.5) }; },
        stem: function (s) { return 'Consider the function ' + t(s.n + '(x)=' + (s.ord ? lin([[s.m, 'x'], [s.b, '']]) : lin([[s.b, ''], [s.m, 'x']]))) + '.'; },
        parts: [
          { id: '1', outcome: 'RF8', level: 'BEG', make: function (r, s) {
            var n = s.n, m = s.m, b = s.b, f = function (x) { return m * x + b; };
            var dl = function (x) { return [[x < 0 ? -m * x + b : NaN, 'fn-neg-sub', 'Careful with the sign: ' + t(m + '\\times' + sgp(x) + '=' + m * x) + '.'], [m * x, 'fn-const', 'Don’t forget the constant term: ' + t(sgp(b)) + '.'], [m + x + b, 'fn-add-coef', t(m + 'x') + ' means ' + t(m + '\\times x') + ': multiply, don’t add.']]; };
            var fl = [{ label: t(n + '(' + s.p + ')='), name: n + '(' + s.p + ')', mode: 'number' }, { label: t(n + '(' + s.q + ')='), name: n + '(' + s.q + ')', mode: 'number' }];
            var p0 = B.fields('Determine ' + t(n + '(' + s.p + ')') + ' and ' + t(n + '(' + s.q + ')') + '.', fl, [numChk(f(s.p), dl(s.p)), numChk(f(s.q), dl(s.q))], [String(f(s.p)), String(f(s.q))],
              t(n + '(' + s.p + ')=' + f(s.p)) + ', ' + t(n + '(' + s.q + ')=' + f(s.q)),
              t(n + '(' + s.p + ')=' + m + '(' + s.p + ')' + (b < 0 ? '' : '+') + b + '=' + f(s.p)) + '<br>' + t(n + '(' + s.q + ')=' + m + '(' + s.q + ')' + (b < 0 ? '' : '+') + b + '=' + f(s.q)),
              ['Replace every ' + t('x') + ' with the number in the brackets.', 'Put a negative input in brackets: ' + t(m + '(' + s.q + ')') + '.'], 'evaluate linear f');
            p0.bad = [[String(f(s.p)), String(m * -s.q + b)], [String(m * s.p), String(m * s.q)]];
            return p0;
          } }] },
      { num: '2', outcome: 'RF8',
        shared: function (r) { var c = r.pick(nz(-12, 15)), a = r.pick([1, 1, 2, 3, -1, -2]), k = r.int(2, 6); return { n: r.pick(FN_NAMES), a: a, c: c, k: -k }; },
        stem: function (s) { return 'Consider the function ' + t(s.n + '(x)=' + (s.a < 0 ? lin([[s.c, ''], [s.a, 'x^{2}']]) : lin([[s.a, 'x^{2}'], [s.c, '']]))) + '.'; },
        parts: [
          { id: '2', outcome: 'RF8', level: 'EMG', make: function (r, s) {
            var n = s.n, a = s.a, c = s.c, k = s.k, ans = a * k * k + c;
            return numPart('Evaluate ' + t(n + '(' + k + ')') + '.', ans, [
              [-a * k * k + c, 'fn-neg-square', t('(' + k + ')^{2}=' + k * k) + ' — a negative number squared is positive.'],
              [a * 2 * k + c, 'fn-square-2x', t('x^{2}') + ' means ' + t('x\\times x') + ', not ' + t('2x') + '.'],
              [(a * k) * (a * k) + c, 'fn-coef-power', 'Square only the input: ' + t(a + '(' + k + ')^{2}=' + a + '\\times' + k * k) + '.'],
              [a * k * k, 'fn-const', 'Don’t forget the constant term ' + t(sgp(c)) + '.']],
              t(n + '(' + k + ')=' + (a === 1 ? '' : a === -1 ? '-' : a) + '(' + k + ')^{2}' + term(c, '', false)) + '<br>' + t('=' + (a === 1 ? '' : a === -1 ? '-' : a + '\\times') + k * k + term(c, '', false) + '=' + ans),
              ['Put the negative input in brackets and square it first: ' + t('(' + k + ')^{2}') + '.', 'Then multiply by the coefficient and add the constant.'], 'evaluate quadratic at negative');
          } }] },
      { num: '3', outcome: 'RF8',
        shared: function (r) { var m = r.pick(nz(-8, -2).concat([2, 3, 4, 5])), b = r.int(-15, 20), x = r.pick(nz(-9, 9)); return { n: r.pick(FN_NAMES), m: m, b: b, x: x, v: m * x + b }; },
        stem: function (s) { return 'Consider the function ' + t(s.n + '(x)=' + (s.m < 0 ? lin([[s.b, ''], [s.m, 'x']]) : lin([[s.m, 'x'], [s.b, '']]))) + '.'; },
        parts: [
          { id: '3', outcome: 'RF8', level: 'PRG', make: function (r, s) {
            var n = s.n, m = s.m, b = s.b, x = s.x, v = s.v;
            return numPart('Determine ' + t('x') + ' if ' + t(n + '(x)=' + v) + '.', x, [
              [(v + b) / m, 'fn-solve-inverse', 'To undo ' + t((b < 0 ? '' : '+') + b) + ', ' + (b < 0 ? 'add' : 'subtract') + ' ' + t(Math.abs(b)) + ' on both sides.'],
              [-(v - b) / m, 'fn-solve-sign', 'Check the sign when you divide by ' + t(sgp(m)) + '.'],
              [v - b, 'fn-solve-divide', 'You found ' + t(m + 'x=' + (v - b)) + ' — now divide by ' + t(sgp(m)) + '.'],
              [m * v + b, 'u5x-evaluated', 'That is ' + t(n + '(' + v + ')') + '. Here ' + t(v) + ' is the <b>output</b>: solve ' + t(lin([[m, 'x'], [b, '']]) + '=' + v) + '.']],
              'Solve ' + t((m < 0 ? lin([[b, ''], [m, 'x']]) : lin([[m, 'x'], [b, '']])) + '=' + v) + ':<br>' + t(lin([[m, 'x']]) + '=' + v + (b < 0 ? '+' + (-b) : '-' + b) + '=' + (v - b)) + '<br>' + t('x=' + (v - b) + '\\div' + sgp(m) + '=' + x) + '<br>Check: ' + t(n + '(' + x + ')=' + m + '(' + x + ')' + (b < 0 ? '' : '+') + b + '=' + v) + ' ✓',
              ['In ' + t(n + '(x)=' + v) + ' the number ' + t(v) + ' is the output. Set the rule equal to ' + t(v) + '.', 'Undo the constant first, then divide by the coefficient of ' + t('x') + ' (watch the sign).'], 'solve linear f(x)=v', { before: t('x=') });
          } }] },
      { num: '4', outcome: 'RF8',
        shared: function (r) { var bq = r.pick(nz(-6, 6)), c = r.pick(nz(-9, 9)), k = r.pick(nz(-4, 4)); return { n: r.pick(['F', 'G', 'H']), bq: bq, c: c, k: k, v: r.pick(['a', 't', 'm']) }; },
        stem: function (s) { return 'Consider the function ' + t(s.n + '(x)=x^{2}' + term(s.bq, 'x', false) + term(s.c, '', false)) + '.'; },
        parts: [
          { id: '4', outcome: 'RF8', level: 'ADV', make: function (r, s) {
            var n = s.n, bq = s.bq, c = s.c, k = s.k, v = s.v, inner = v + (k < 0 ? '-' + (-k) : '+' + k);
            var A1 = 1, B1 = 2 * k + bq, C1 = k * k + bq * k + c, T = PL(lin([[1, v + '^{2}'], [B1, v], [C1, '']]));
            var W = [{ is: PL(lin([[1, v + '^{2}'], [bq, v], [k * k + bq * k + c - 2 * k * 0, '']])), code: 'fn-binom-sq', hint: t('(' + inner + ')^{2}') + ' is ' + t('(' + inner + ')(' + inner + ')=' + v + '^{2}' + term(2 * k, v, false) + '+' + k * k) + ' — don’t forget the middle term.' },
              { is: PL(lin([[1, v + '^{2}'], [bq, v], [c + k, '']])), code: 'u5x-plus-out', hint: 'That is ' + t(n + '(' + v + ')' + (k < 0 ? '' : '+') + k) + '. Replace <b>every</b> ' + t('x') + ' with ' + t('(' + inner + ')') + ' and expand.' },
              { is: PL(lin([[1, v + '^{2}'], [2 * k + bq, v], [k * k + k + c, '']])), code: 'fn-dist', hint: 'Multiply <b>every</b> term in the bracket: ' + t(bq + '(' + inner + ')=' + lin([[bq, v], [bq * k, '']])) + '.' }];
            return polyPart('Determine a simplified expression for ' + t(n + '(' + inner + ')') + '.', t(n + '(' + inner + ')='), T, lin([[1, v + '^{2}'], [B1, v], [C1, '']]), W,
              t(n + '(' + inner + ')=(' + inner + ')^{2}' + (bq < 0 ? '-' : '+') + (Math.abs(bq) === 1 ? '' : Math.abs(bq)) + '(' + inner + ')' + term(c, '', false)) + '<br>' + t('=' + v + '^{2}' + term(2 * k, v, false) + '+' + k * k + term(bq, v, false) + term(bq * k, '', false) + term(c, '', false)) + '<br>' + t('=' + lin([[1, v + '^{2}'], [B1, v], [C1, '']])),
              ['Replace every ' + t('x') + ' with ' + t('(' + inner + ')') + ', in brackets.', 'Expand ' + t('(' + inner + ')^{2}') + ' as ' + t('(' + inner + ')(' + inner + ')') + ', distribute, then collect like terms.'], 'F(a+k) expansion', [v]);
          } }] }
    ]
  });

  /* =====================================================================================================
   * Lesson 7 — Function notation: graphs, conversions, real-world models (RF8)
   * ===================================================================================================== */
  var EQK = 'u5l8eq'; // the equation keypad registered by js/lessons/u5l7.js (loaded before the exit slips)
  function cleanS(s) { return String(s == null ? '' : s).replace(/\\left|\\right/g, '').replace(/\\lparen/g, '(').replace(/\\rparen/g, ')').replace(/\\[,;:! ]|~/g, ' ').replace(/\\cdot/g, '\\times ').trim(); }
  function lhsInfo(L) {
    L = L.replace(/\s+/g, '');
    var m = /^([A-Za-z])\(([^()]*)\)$/.exec(L); if (m) return { kind: 'fn', name: m[1], arg: m[2] };
    if (/^[A-Za-z]$/.test(L)) return { kind: 'var', name: L };
    return { kind: 'other' };
  }
  /* "write it in function notation": the answer f(x) = … (K.poly on the right side). o: T, wrong, name */
  function fnNotChk(o) {
    var ws = (o.wrong || []).filter(function (w) { return w && !P.eq(w.is, o.T); }), base = K.poly(o.T, { wrong: ws, expanded: true }), nm = o.name || 'f';
    return function (resp) {
      var s0 = cleanS(resp);
      if (!s0) return form('empty', 'Type the whole equation first.');
      var parts = s0.split('='), want = t(nm + '(x)=\\ldots');
      if (parts.length === 1) return form('conv-no-eq', 'Write the whole <b>equation</b>, starting with ' + want + '.');
      if (parts.length > 2 || !parts[0].trim() || !parts[1].trim()) return form('unreadable', 'Write one equation, starting with ' + want + '.');
      var L = parts[0], R = parts[1], li = lhsInfo(L);
      if (li.kind === 'other') { var ri = lhsInfo(R); if (ri.kind !== 'other') { li = ri; R = L; } }
      if (li.kind === 'other') return form('conv-lhs', 'Start your equation with ' + want + '.');
      if (li.kind === 'var') return wrong('conv-still-y', t(li.name) + ' is an output variable, so this is still ' + t('x') + '-' + t('y') + ' notation. Replace ' + t(li.name) + ' with function notation: ' + want + '.');
      if (li.name !== nm) return wrong('conv-name', 'The question names the function ' + t(nm) + ', so write ' + t(nm + '(x)') + '.');
      if (li.arg !== 'x') return wrong('conv-arg', 'The brackets hold the <b>input</b> variable, ' + t('x') + '.');
      return base(R);
    };
  }
  function vGraph(s) { return G({ segs: [{ pts: s.V, start: 'closed', end: 'closed' }], aria: 'graph of the function ' + s.name }); }
  var COSTCTX = [
    { who: 'A bakery', item: 'cakes', one: 'cake' }, { who: 'A print shop', item: 'T-shirts', one: 'T-shirt' }, { who: 'A candle maker', item: 'candles', one: 'candle' },
    { who: 'A furniture maker', item: 'stools', one: 'stool' }, { who: 'A school club', item: 'yearbooks', one: 'yearbook' }];
  HW.defineExit({
    lesson: 'u5l7', calc: true,
    blurb: 'Read a function’s values and solve s(x) = b from its graph, write a relation in function notation, and use a cost model.',
    questions: [
      { num: '1', outcome: 'RF8',
        shared: function (r) {
          var xs = [-6, -3, 0, 3, 6], ys = pickWhere(function () { return xs.map(function () { return r.int(-5, 5); }); }, function (y) { return y.every(function (v, i) { return i === 0 || v !== y[i - 1]; }) && uniq(y).length >= 4; });
          return { name: r.pick(['q', 'g', 'h']), V: xs.map(function (x, i) { return [x, ys[i]]; }), ask: r.sample([0, 1, 3, 4], 2).sort() };
        },
        stem: function (s) { return 'The graph of the function ' + t(s.name) + ' is shown below.' + vGraph(s); },
        parts: [
          { id: '1', outcome: 'RF8', level: 'BEG', make: function (r, s) {
            var n = s.name, P0 = s.ask.map(function (i) { return s.V[i]; });
            var ch = P0.map(function (q) { return numChk(q[1], [[q[0], 'u5x-read-swap', 'In ' + t(n + '(' + q[0] + ')') + ' the ' + t(q[0]) + ' is the <b>input</b>: go to ' + t('x=' + q[0]) + ' on the horizontal axis, then up or down to the graph and read the height.'], [q[1] + 1, 'u5x-read-off', 'Read the height again carefully — count the grid lines from the ' + t('x') + '-axis.'], [q[1] - 1, 'u5x-read-off', 'Read the height again carefully — count the grid lines from the ' + t('x') + '-axis.'], [-q[1], 'fn-sign', 'Check the sign: is the point above or below the ' + t('x') + '-axis?']]); });
            var p0 = B.fields('Use the graph to complete each statement.', P0.map(function (q) { return { label: t(n + '(' + q[0] + ')='), name: n + '(' + q[0] + ')', mode: 'number' }; }), ch, P0.map(function (q) { return String(q[1]); }),
              P0.map(function (q) { return t(n + '(' + q[0] + ')=' + q[1]); }).join(', '),
              P0.map(function (q) { return 'Go to ' + t('x=' + q[0]) + ', move ' + (q[1] === 0 ? 'nowhere (the graph is on the axis)' : (q[1] > 0 ? 'up' : 'down') + ' to the graph') + ': the point is ' + t(ptT(q)) + ', so ' + t(n + '(' + q[0] + ')=' + q[1]) + '.'; }).join('<br>'),
              ['The number in the brackets is the input, an ' + t('x') + '-value.', 'Find that ' + t('x') + ' on the horizontal axis, go up or down to the graph, and read the ' + t('y') + '-value.'], 'read f(a) from a graph');
            p0.bad = [P0.map(function (q) { return String(q[0]); }), P0.map(function (q) { return String(q[1] + 1); })].filter(function (x) { return x.join('|') !== p0.key.join('|'); });
            return p0;
          } }] },
      { num: '2', outcome: 'RF8',
        shared: function (r) {
          return pickWhere(function () {
            var pL = r.pick([1, 2]), pR = r.pick([1, 2]), c = pL * pR === 4 ? 2 * r.int(1, 2) : r.pick([2, 4]), up = r.chance(0.5);
            var h = r.int(-2, 2), k = up ? r.int(-5, -1) : r.int(1, 5), L1 = r.int(2, 5), L2 = r.int(2, 5), sg = up ? 1 : -1;
            var V = [[h - L1, k + sg * pL * L1], [h, k], [h + L2, k + sg * pR * L2]];
            return { name: r.pick(['s', 'p', 'w']), V: V, b: k + sg * c, xs: [h - c / pL, h + c / pR], c: c, pL: pL, pR: pR, L1: L1, L2: L2, up: up };
          }, function (s) { return s.V.every(function (q) { return q[0] >= -6 && q[0] <= 6 && Math.abs(q[1]) <= 6; }) && s.c < s.pL * s.L1 && s.c < s.pR * s.L2 && s.xs.every(function (x) { return x % 1 === 0; }) && s.b !== 0; });
        },
        stem: function (s) { return 'The graph of the function ' + t(s.name) + ' is shown below.' + vGraph(s); },
        parts: [
          { id: '2', outcome: 'RF8', level: 'EMG', make: function (r, s) {
            var n = s.name, b = s.b, xs = s.xs, V = s.V;
            var fAt = function (x) { if (x < V[0][0] || x > V[2][0]) return NaN; var A = x <= V[1][0] ? V[0] : V[1], Bq = x <= V[1][0] ? V[1] : V[2]; return A[1] + (Bq[1] - A[1]) * (x - A[0]) / (Bq[0] - A[0]); };
            var ev = fAt(b), dl = [];
            if (isFinite(ev)) dl.push([[ev], 'u5x-evaluated', 'That is ' + t(n + '(' + b + ')') + '. In ' + t(n + '(x)=' + b) + ' the ' + t(b) + ' is the <b>output</b> (a height): find ' + t(b) + ' on the vertical axis and read across.']);
            return solPart('Use the graph to solve ' + t(n + '(x)=' + b) + '.', xs, 'x', dl,
              'Draw the horizontal line ' + t('y=' + b) + '. It meets the graph at ' + t(ptT([xs[0], b])) + ' and ' + t(ptT([xs[1], b])) + ', so ' + t(n + '(x)=' + b) + ' when ' + t('x=' + xs[0]) + ' or ' + t('x=' + xs[1]) + '.',
              ['In ' + t(n + '(x)=' + b) + ' you know the <b>output</b>. Find ' + t(b) + ' on the vertical axis and draw a horizontal line.', 'Read the ' + t('x') + '-value of <b>every</b> point where that line meets the graph.'], 'solve s(x)=b from a graph',
              function (A, T) { return A.length < T.length && A.every(function (x) { return T.some(function (y) { return same(x, y); }); }) ? { code: 'fn-one-root', hint: 'Correct so far — but follow the line ' + t('y=' + b) + ' across the <b>whole</b> graph: it meets it once more.' } : null; });
          } }] },
      { num: '3', outcome: 'RF8',
        shared: function (r) {
          return pickWhere(function () { var Bq = r.pick([2, 3, 4, 5, -2, -3, -4]), A = r.pick(nz(-7, 7)), k = r.pick(nz(-6, 6)); return { A: A, B: Bq, k: k, C: -Bq * k, name: r.pick(['f', 'g', 'h']) }; },
            function (v) { return Math.abs(v.A) % Math.abs(v.B) !== 0 && gcd(v.A, v.B) === 1 && v.A > 0; });
        },
        stem: function (s) { return 'A relation is given by the equation ' + t(lin([[s.A, 'x'], [s.B, 'y'], [s.C, '']]) + '=0') + '.'; },
        parts: [
          { id: '3', outcome: 'RF8', level: 'PRG', make: function (r, s) {
            var A = s.A, Bq = s.B, k = s.k, C = s.C, n = s.name, rhs = lin([[[-A, Bq], 'x'], [k, '']]), T = PL(rhs), Ax = (A === 1 ? '' : A) + 'x';
            var W = [{ is: PL(lin([[-A, 'x'], [-C, '']])), code: 'u5x-conv-nodiv', hint: 'You solved for ' + t(Bq + 'y') + ', not ' + t('y') + '. Divide <b>every</b> term by ' + t(sgp(Bq)) + '.' },
              { is: PL(lin([[[A, Bq], 'x'], [k, '']])), code: 'u5x-conv-sign', hint: 'Check the sign of the ' + t('x') + '-term: moving ' + t(Ax) + ' to the other side makes it ' + t('-' + Ax) + ', and then you divide by ' + t(sgp(Bq)) + '.' },
              { is: PL(lin([[[-A, Bq], 'x'], [-k, '']])), code: 'u5x-conv-sign', hint: 'Check the sign of the constant: ' + t(lin([[Bq, 'y']]) + '=' + lin([[-A, 'x'], [-C, '']])) + ', then divide every term by ' + t(sgp(Bq)) + '.' },
              { is: PL(lin([[-A, 'x'], [k, '']])), code: 'u5x-conv-part', hint: 'Divide <b>both</b> terms on the right by ' + t(sgp(Bq)) + ', not just the constant.' }];
            var p0 = { prompt: 'Write the relation in function notation, using the name ' + t(n) + '.', input: { type: 'math', keys: EQK, vars: ['x', n], placeholder: 'e.g. ' + n + '(x) = 2x - 3' }, check: fnNotChk({ T: T, wrong: W, name: n }), key: n + '(x)=' + rhs, answer: t(n + '(x)=' + rhs),
              solution: 'Solve for ' + t('y') + ':<br>' + t(lin([[Bq, 'y']]) + '=' + lin([[-A, 'x'], [-C, '']])) + '<br>' + t('y=' + rhs) + '<br>Replace ' + t('y') + ' with ' + t(n + '(x)') + ': ' + t(n + '(x)=' + rhs), hints: ['Get ' + t('y') + ' by itself first: move the other terms across, then divide every term by ' + t(sgp(Bq)) + '.', 'Then write ' + t(n + '(x)') + ' in place of ' + t('y') + '.'], text: 'general form to function notation' };
            p0.good = [n + '(x)=' + lin([[k, ''], [[-A, Bq], 'x']])];
            p0.bad = W.filter(function (w) { return !P.eq(w.is, T); }).map(function (w) { return n + '(x)=' + P.tex(w.is); }).concat(['y=' + rhs]);
            return p0;
          } }] },
      { num: '4', outcome: 'RF8',
        shared: function (r) {
          return pickWhere(function () { var c = r.pick([4, 5, 6, 8, 12, 15]), g = r.pick([6, 8, 9, 10, 12, 14, 15, 18, 20]), Fx = 50 * r.int(6, 18), n = r.int(30, 160); return { ctx: r.pick(COSTCTX), c: c, p: c + g, g: g, F: Fx, n: n, X: n * g - Fx }; },
            function (s) { return s.X >= 200 && s.X % 50 === 0 && s.X <= 3000; });
        },
        stem: function (s) { return s.ctx.who + ' models its cost, in dollars, to make ' + t('n') + ' ' + s.ctx.item + ' by ' + t('C(n)=' + F(s.F) + '+' + s.c + 'n') + '. It sells each ' + s.ctx.one + ' for ' + t('\\$' + s.p) + '.'; },
        parts: [
          { id: '4', outcome: 'RF8', level: 'ADV', make: function (r, s) {
            var c = s.c, pr = s.p, g = s.g, Fx = s.F, X = s.X, n = s.n;
            return numPart('How many ' + s.ctx.item + ' must be made and sold for a <b>profit</b> of ' + t('\\$' + F(X)) + '? (Profit = money from sales − cost.)', n, [
              [(X + Fx) / pr, 'u5x-profit-rev', 'The sales money is ' + t(pr + 'n') + ', but the cost ' + t('C(n)') + ' also grows by ' + t('\\$' + c) + ' per ' + s.ctx.one + '. Profit ' + t('=' + pr + 'n-(' + Fx + '+' + c + 'n)') + '.'],
              [X / g, 'u5x-profit-fixed', 'Don’t forget the fixed cost ' + t('\\$' + F(Fx)) + ': profit ' + t('=' + pr + 'n-(' + Fx + '+' + c + 'n)=' + g + 'n-' + Fx) + '.'],
              [(X - Fx) / c, 'u5x-profit-cost', 'That solves ' + t('C(n)=' + F(X)) + ' (the cost). The ' + t('\\$' + F(X)) + ' is the profit: sales − cost.'],
              [(X - Fx) / g, 'u5x-profit-sign', 'Check the sign: ' + t(g + 'n-' + Fx + '=' + X) + ' gives ' + t(g + 'n=' + X + '+' + Fx) + '.']],
              'Profit ' + t('=' + pr + 'n-C(n)=' + pr + 'n-(' + F(Fx) + '+' + c + 'n)=' + g + 'n-' + F(Fx)) + '.<br>' + t(g + 'n-' + F(Fx) + '=' + F(X)) + '<br>' + t(g + 'n=' + F(X + Fx)) + '<br>' + t('n=' + F(X + Fx) + '\\div' + g + '=' + n) + ' ' + s.ctx.item + '.<br>Check: ' + t('C(' + n + ')=' + F(Fx + c * n)) + ', sales ' + t(pr + '\\times' + n + '=' + F(pr * n)) + ', profit ' + t(F(pr * n) + '-' + F(Fx + c * n) + '=' + F(X)) + ' ✓',
              ['Write the profit as sales minus cost: ' + t(pr + 'n-C(n)') + '. Simplify it first.', 'Set the profit equal to ' + t(F(X)) + ' and solve for ' + t('n') + '.'], 'profit from a cost function', { after: s.ctx.item });
          } }] }
    ]
  });

  /* =====================================================================================================
   * Lesson 8 — Interpreting and sketching real-world graphs (RF1)
   * ===================================================================================================== */
  var WALK = [['away', 'stop', 'back', 'stop'], ['away', 'stop', 'away', 'back'], ['away', 'back', 'stop', 'back'], ['away', 'away', 'stop', 'back'], ['stop', 'away', 'stop', 'back'], ['away', 'stop', 'back', 'away']];
  var WHO = ['Jordan', 'Priya', 'Sam', 'Mei', 'Lucas', 'Ava'];
  HW.defineExit({
    lesson: 'u5l8', calc: true,
    blurb: 'Describe a distance–time graph stage by stage, find speeds from a graph, and sketch a graph for a story with numbers.',
    questions: [
      { num: '1', outcome: 'RF1',
        shared: function (r) {
          return pickWhere(function () {
            var pat = r.pick(WALK), d = r.int(0, 2), V = [[0, d]], tm = 0, ok0 = true;
            pat.forEach(function (st) { tm += 10 * r.int(1, 2); var y = V[V.length - 1][1]; if (st === 'away') y += r.int(1, 3); if (st === 'back') y -= r.int(1, 3); if (y < 0 || y > 6) ok0 = false; V.push([tm, y]); });
            return ok0 ? { pat: pat, V: V, who: r.pick(WHO) } : null;
          }, function (s) { return s.V[s.V.length - 1][0] <= 70; });
        },
        stem: function (s) { return 'The graph shows ' + s.who + '’s distance from home during a walk.' + G({ x: [0, 80], y: [0, 7], grid: 10, gridY: 1, labels: 10, labelsX: 10, labelsY: 1, unitX: 3.6, unitY: 32, firstQuadrant: true, xName: 't', yName: 'd', xTitle: 'Time (min)', yTitle: 'Distance from home (km)', segs: [{ pts: s.V, start: 'closed', end: 'closed' }], points: s.V.slice(1, -1).map(function (q) { return { x: q[0], y: q[1] }; }), max: 340, aria: 'distance from home against time' }); },
        parts: [
          { id: '1', outcome: 'RF1', level: 'BEG', make: function (r, s) {
            var V = s.V, rows = s.pat.map(function (st, i) { return { id: 's' + i, html: t(V[i][0]) + '–' + t(V[i + 1][0]) + ' min' }; }), want = {};
            s.pat.forEach(function (st, i) { want['s' + i] = st; });
            var say = { away: 'her distance from home <b>increases</b>: walking away from home', stop: 'the graph is flat: the distance doesn’t change, so ' + s.who + ' is stopped', back: 'the distance from home <b>decreases</b>: walking back toward home' };
            return B.grid('Describe what ' + s.who + ' is doing in each time interval.', rows, [{ id: 'away', html: 'walking away from home' }, { id: 'stop', html: 'stopped' }, { id: 'back', html: 'walking back toward home' }], want,
              { why: function (rid) { var i = Number(rid.slice(1)); return { code: 'u5x-stage', hint: 'From ' + t(V[i][0]) + ' to ' + t(V[i + 1][0]) + ' min ' + say[s.pat[i]].replace('her', s.who + '’s') + '.' }; }, rowHead: 'Time' },
              s.pat.map(function (st, i) { return t(V[i][0]) + '–' + t(V[i + 1][0]) + ' min: ' + say[st].replace('her', s.who + '’s') + '.'; }).join('<br>'),
              ['The graph shows distance from <b>home</b>, not height: rising = getting farther from home, falling = getting closer, flat = not moving.'], 'describe a distance-time graph');
          } }] },
      { num: '2', outcome: 'RF1',
        shared: function (r) {
          return pickWhere(function () {
            // every corner on a 5 km grid line (the graph has no point labels), so the distances can be read exactly
            var v1 = r.pick([10, 15, 20, 25, 30]), t1 = r.pick([1, 2]), t2 = r.pick([1, 2]), v3 = r.pick([5, 10, 15, 20, 25]), t3 = r.pick([1, 2, 3]), back = r.chance(0.5);
            var d1 = v1 * t1, d3 = back ? d1 - v3 * t3 : d1 + v3 * t3;
            return { v1: v1, t1: t1, t2: t2, v3: v3, t3: t3, back: back, V: [[0, 0], [t1, d1], [t1 + t2, d1], [t1 + t2 + t3, d3]], who: r.pick(WHO) };
          }, function (s) { var e = s.V[3][1]; return e >= 0 && e <= 60 && s.v1 !== s.v3 && s.V[3][0] <= 6; });
        },
        stem: function (s) { var ym = 10 * Math.ceil((Math.max(s.V[1][1], s.V[3][1]) + 5) / 10), xm = s.V[3][0] + 1; return 'The graph shows ' + s.who + '’s distance from home during a bike ride.' + G({ x: [0, xm], y: [0, ym], grid: 1, gridY: 5, labels: 1, labelsX: 1, labelsY: 10, unitX: Math.min(56, 280 / xm), unitY: 220 / ym, firstQuadrant: true, xName: 't', yName: 'd', xTitle: 'Time (h)', yTitle: 'Distance from home (km)', segs: [{ pts: s.V, start: 'closed', end: 'closed' }], points: s.V.slice(1, -1).map(function (q) { return { x: q[0], y: q[1] }; }), max: 340, aria: 'bike ride distance against time' }); },
        parts: [
          { id: '2', outcome: 'RF1', level: 'EMG', make: function (r, s) {
            var V = s.V, d1 = V[1][1], d3 = V[3][1], ta = V[2][0], tb = V[3][0];
            var c1 = numChk(s.v1, [[d1, 'u5x-speed-dist', 'That is the distance covered. Speed = distance ÷ time: ' + t(d1 + '\\div' + s.t1) + '.'], [s.t1 / d1, 'u5x-speed-flip', 'Divide the distance by the time (km per hour), not the time by the distance.']]);
            var c3 = numChk(s.v3, [[Math.abs(d3 - d1), 'u5x-speed-dist', 'That is the distance covered. Divide it by the time taken, ' + t(s.t3) + ' h.'], [-s.v3, 'u5x-speed-neg', 'Speed is always positive. The graph falls because ' + s.who + ' is heading back home, but the speed is ' + t(s.v3) + ' km/h.'], [d3 / tb, 'u5x-speed-total', 'Use the <b>change</b> in distance (' + t(d3 + '-' + d1) + ') over the <b>change</b> in time (' + t(tb + '-' + ta) + '), not the values at the end.'], [s.t3 / Math.abs(d3 - d1), 'u5x-speed-flip', 'Divide the distance by the time, not the time by the distance.']]);
            var p0 = B.fields('Determine ' + s.who + '’s speed from ' + t('0') + ' to ' + t(V[1][0]) + ' h and from ' + t(ta) + ' to ' + t(tb) + ' h.', [{ label: t('0') + '–' + t(V[1][0]) + ' h:', name: 'first speed', mode: 'number', after: 'km/h' }, { label: t(ta) + '–' + t(tb) + ' h:', name: 'second speed', mode: 'number', after: 'km/h' }], [c1, c3], [String(s.v1), String(s.v3)],
              t(s.v1) + ' km/h and ' + t(s.v3) + ' km/h',
              'First part: ' + t(d1) + ' km in ' + t(s.t1) + ' h, so ' + t('\\dfrac{' + d1 + '}{' + s.t1 + '}=' + s.v1) + ' km/h.<br>Last part: from ' + t(d1) + ' km to ' + t(d3) + ' km is ' + t(Math.abs(d3 - d1)) + ' km in ' + t(tb + '-' + ta + '=' + s.t3) + ' h, so ' + t('\\dfrac{' + Math.abs(d3 - d1) + '}{' + s.t3 + '}=' + s.v3) + ' km/h' + (s.back ? ' (back toward home; the rate of change is ' + t(-s.v3) + ' km/h, but speed is positive)' : '') + '.',
              ['Speed = change in distance ÷ change in time. Read both from the graph at the ends of the segment.', 'Each grid line across is ' + t('1') + ' h; up the side each one is ' + t('5') + ' km.'], 'speeds from a distance-time graph');
            p0.bad = [[String(d1), String(s.v3)], [String(s.v1), String(Math.abs(d3 - d1))]].filter(function (x) { return x.join('|') !== p0.key.join('|'); });
            return p0;
          } }] },
      { num: '3', outcome: 'RF1',
        shared: function (r) {
          return pickWhere(function () {
            var V0 = r.pick([40, 50, 60, 70, 80]), r1 = r.pick([2, 4, 5]), t1 = r.int(2, 5), t2 = r.int(2, 4), r2 = r.pick([5, 10, 15, 20]), V1 = V0 - r1 * t1, t3 = V1 / r2;
            return { V0: V0, r1: r1, t1: t1, t2: t2, r2: r2, V1: V1, t3: t3, T: t1 + t2 + t3 };
          }, function (s) { return s.V1 > 0 && s.V1 % 5 === 0 && s.t3 % 1 === 0 && s.t3 >= 2 && s.T <= 18 && s.r2 > s.r1; });
        },
        stem: function (s) { return 'A tank holds ' + t(s.V0) + ' L of water. It drains at ' + t(s.r1) + ' L/min for ' + t(s.t1) + ' min. Then the valve is closed for ' + t(s.t2) + ' min. Then the valve is opened wider, and the tank drains at ' + t(s.r2) + ' L/min until it is empty.'; },
        parts: [
          { id: '3', outcome: 'RF1', level: 'PRG', make: function (r, s) {
            var a = s.t1, b = s.t1 + s.t2, T = s.T, V0 = s.V0, V1 = s.V1;
            var I = { x: [0, 20], y: [0, 90], grid: 1, gridY: 5, labels: 2, labelsX: 2, labelsY: 10, unitX: 15, unitY: 3.2, firstQuadrant: true, xName: 't', yName: 'V', xTitle: 'Time (min)', yTitle: 'Volume (L)', tools: ['line'], defaultEnd: 'none', snapX: 1, snapY: 5 };
            var chk = K.graphStory({ phases: [{ dir: 'down', text: 'drains at ' + s.r1 + ' L/min', x0: 0, x1: a, y0: V0, y1: V1 }, { dir: 'flat', text: 'valve closed', x0: a, x1: b, y0: V1, y1: V1 }, { dir: 'down', text: 'drains at ' + s.r2 + ' L/min', x0: b, x1: T, y0: V1, y1: 0 }],
              start: V0, end: 0, xUnit: 'min', yUnit: 'L', startHint: 'The tank starts full: at ' + t('t=0') + ' it holds ' + t(V0) + ' L.', endHint: 'The story ends when the tank is <b>empty</b>: the graph must come down to ' + t('V=0') + '.' });
            var key = gv([], [{ v: [[0, V0], [a, V1], [b, V1], [T, 0]], s: 'none', e: 'none' }]);
            var p0 = B.graph('Sketch the volume of water, ' + t('V') + ' (L), against time, ' + t('t') + ' (min). Use <b>╱ Line</b>: tap the start, then each corner, and tap the last point again to finish.', I, chk, key,
              'Stage 1: from ' + t(V0) + ' L, ' + t(s.r1 + '\\times' + a + '=' + (s.r1 * a)) + ' L drain, leaving ' + t(V1) + ' L at ' + t('t=' + a) + ' min.<br>Stage 2: flat at ' + t(V1) + ' L until ' + t('t=' + b) + ' min.<br>Stage 3: ' + t(V1 + '\\div' + s.r2 + '=' + s.t3) + ' more minutes to empty, so it reaches ' + t('0') + ' L at ' + t('t=' + T) + ' min. The last stage is steeper because it drains faster.',
              ['Work out the volume at the end of each stage and the time when each stage ends.', 'A closed valve means the volume stays the same: a flat piece. Faster draining is a steeper piece.'], 'sketch a draining tank');
            p0.bad = [gv([], [{ v: [[0, V0], [a, V1], [T, 0]], s: 'none', e: 'none' }]), gv([], [{ v: [[0, V0], [a, V1], [b, V1], [T + 2, 0]], s: 'none', e: 'none' }]), gv([], [{ v: [[0, V0], [a, V0 - s.r1], [b, V0 - s.r1], [T, 0]], s: 'none', e: 'none' }])];
            return p0;
          } }] }
    ]
  });

  /* =====================================================================================================
   * Lesson 9 — Unit review: RF1, RF2, RF8
   * ===================================================================================================== */
  /* new contexts (the booklet's review question uses a phone battery, 100 − 12t) */
  var DRAIN = [
    { L: 'h', txt: 'A hot-air balloon is coming down to land. Its height, in metres, ' + t('t') + ' minutes after it starts to descend is modelled by the linear function', unit: 'm', tw: 'minutes', tu: 'min', b0: [240, 300, 360, 420, 480], rs: [12, 15, 16, 20, 24, 25, 30], ask: 'After how many minutes does the balloon reach the ground?', zero: 'reaches the ground (height ' + t('0') + ')', outw: 'height' },
    { L: 'V', txt: 'The volume of water, in litres, left in a rain barrel ' + t('t') + ' minutes after its tap is opened is modelled by the linear function', unit: 'L', tw: 'minutes', tu: 'min', b0: [160, 180, 200, 240, 250], rs: [8, 10, 12, 15, 16, 20], ask: 'After how many minutes is the rain barrel empty?', zero: 'is empty (volume ' + t('0') + ')', outw: 'volume' },
    { L: 'F', txt: 'The volume of fuel, in litres, left in a tractor’s tank after ' + t('t') + ' hours of ploughing is modelled by the linear function', unit: 'L', tw: 'hours', tu: 'h', b0: [90, 96, 120, 144, 150], rs: [6, 8, 9, 10, 12, 15], ask: 'After how many hours does the tractor run out of fuel?', zero: 'runs out of fuel (volume ' + t('0') + ')', outw: 'fuel left' }];
  HW.defineExit({
    lesson: 'u5l9', calc: true,
    blurb: 'Unit 5 review: evaluate a function, domain and range from a table and from a graph, and solve a linear function model (RF1, RF2, RF8).',
    questions: [
      { num: '1', outcome: 'RF8',
        shared: function (r) { return { n: r.pick(['f', 'g', 'h', 'p']), a: r.int(-9, 12), m: r.pick([2, 3, 4, 5, 6, 7]), x: -r.int(2, 8) }; },
        stem: function (s) { return 'Consider the function ' + t(s.n + '(x)=' + lin([[s.a, ''], [-s.m, 'x']])) + '.'; },
        parts: [
          { id: '1', outcome: 'RF8', level: 'BEG', make: function (r, s) {
            var n = s.n, a = s.a, m = s.m, x = s.x, ans = a - m * x;
            return numPart('Evaluate ' + t(n + '(' + x + ')') + '.', ans, [[a + m * x, 'fn-neg-sub', 'Careful: ' + t('-' + m + '\\times(' + x + ')=+' + (-m * x)) + ' — a negative times a negative is positive.'], [-m * x, 'fn-const', 'Don’t forget the constant ' + t(a) + '.'], [a - m - x, 'fn-add-coef', t(m + 'x') + ' means ' + t(m + '\\times x') + '.']],
              t(n + '(' + x + ')=' + (a === 0 ? '' : a) + '-' + m + '(' + x + ')=' + (a === 0 ? '' : a + '+') + (-m * x) + '=' + ans),
              ['Replace ' + t('x') + ' with ' + t('(' + x + ')') + ' in brackets.', t('-' + m + '\\times(' + x + ')') + ' is positive.'], 'evaluate at a negative input');
          } }] },
      { num: '2', outcome: 'RF2',
        shared: function (r) {
          var xs = r.sample(nz(-8, 9), 5).sort(function (a, b) { return a - b; }), ys = r.sample(range(-9, 12), 4); ys.push(ys[r.int(0, 3)]); ys = r.shuffle(ys);
          return { pts: xs.map(function (x, i) { return [x, ys[i]]; }) };
        },
        stem: function (s) { return 'A relation is given by the table of values below.' + HW.valueTable([[t('x')].concat(s.pts.map(function (q) { return q[0]; })), [t('y')].concat(s.pts.map(function (q) { return q[1]; }))]); },
        parts: [
          { id: '2', outcome: 'RF2', level: 'BEG', make: function (r, s) {
            var xs = s.pts.map(function (q) { return q[0]; }), ys = s.pts.map(function (q) { return q[1]; }), D = lst(xs), Rr = lst(ys);
            return drPart('State the domain and range of the relation.', D, Rr, { bad: [[D, '\\{' + ys.join(', ') + '\\}'], [lst(xs.slice(1)), Rr]] },
              'Domain: the ' + t('x') + '-values, ' + t('D=' + D) + '.<br>Range: the ' + t('y') + '-values, each written once, smallest first: ' + t('R=' + Rr) + '.',
              ['The domain is the set of inputs (the ' + t('x') + ' row); the range is the set of outputs (the ' + t('y') + ' row).', 'Write each value once, smallest first, in braces.'], 'domain and range from a table');
          } }] },
      { num: '3', outcome: 'RF2',
        shared: function (r) {
          return pickWhere(function () { var a = r.int(-5, -2), e = r.int(0, 4), m = r.int(a + 1, 1), k = r.int(-5, e - 2), right = r.chance(0.5), st = r.chance(0.5) ? 'open' : 'closed'; return { a: a, e: e, m: m, k: k, right: right, st: st }; }, function (s) { return s.m - s.a >= 1 && s.e - s.k >= 2; });
        },
        stem: function (s) {
          var sx = s.right ? 1 : -1, E = [sx * s.a, s.e], M = [sx * s.m, s.k], end = toEdge(M, [sx, 1.5]);
          return 'The relation graphed below has an end dot and an arrow.' + G({ segs: [{ pts: [E, M, end], start: s.st, end: 'arrow' }] });
        },
        parts: [
          { id: '3', outcome: 'RF2', level: 'PRG', make: function (r, s) {
            var sx = s.right ? 1 : -1, ex0 = sx * s.a, mx = sx * s.m, inc = s.st === 'closed';
            var D = s.right ? bld('x', ex0, null, inc) : bld('x', null, ex0, true, inc), Rg = bld('y', s.k, null);
            var dW = [{ is: s.right ? bld('x', null, ex0, true, inc) : bld('x', ex0, null, inc), code: 'dr-ray-dir', hint: 'The arrow points to the <b>' + (s.right ? 'right' : 'left') + '</b>, so the graph goes on forever in that direction from ' + t('x=' + ex0) + '.' }];
            if (!inc) dW.push({ is: s.right ? bld('x', ex0, null) : bld('x', null, ex0), code: 'set-endpoint', hint: 'The end dot at ' + t('x=' + ex0) + ' is hollow, so that value is not included: use ' + t(s.right ? '>' : '<') + '.' });
            else dW.push({ is: s.right ? bld('x', ex0, null, false) : bld('x', null, ex0, true, false), code: 'set-endpoint', hint: 'The end dot at ' + t('x=' + ex0) + ' is solid, so that value is included: use ' + t(s.right ? '\\ge' : '\\le') + '.' });
            var rW = [{ is: bld('y', s.e, null, inc), code: 'dr-peak', hint: 'The lowest point isn’t the end dot: the graph dips down to the corner ' + t(ptT([mx, s.k])) + '.' }, { is: bld('y', s.k, null, false), code: 'dr-vertex', hint: 'The corner ' + t(ptT([mx, s.k])) + ' is on the graph, so ' + t('y=' + s.k) + ' is included: use ' + t('\\ge') + '.' }, { is: bld('y', s.k, s.e, true, inc), code: 'set-arrow', hint: 'The arrow means the graph keeps going <b>up</b> forever, so the range has no upper end.' }];
            return drPart('State the domain and range of the relation, in set notation.', D, Rg, { dW: dW, rW: rW },
              'Left to right: the graph starts at the ' + (inc ? 'solid' : 'hollow') + ' dot ' + t(ptT([ex0, s.e])) + ' and the arrow goes on forever to the ' + (s.right ? 'right' : 'left') + ': ' + t('D=' + D) + '.<br>Bottom to top: the lowest point is the corner ' + t(ptT([mx, s.k])) + ' (on the graph); the arrow goes up forever: ' + t('R=' + Rg) + '.',
              [HINT_D, 'Check the corner: the lowest point is not always an end dot. An arrow means no end on that side.'], 'D & R: end dot, corner and arrow');
          } }] },
      { num: '4', outcome: 'RF8',
        shared: function (r) {
          return pickWhere(function () { var c = r.pick(DRAIN), b0 = r.pick(c.b0), rt = r.pick(c.rs), n = r.int(2, 9); return { c: c, b0: b0, r: rt, n: n, v: b0 - rt * n, E: cl(b0 / rt) }; },
            function (s) { return s.v > 0 && Math.abs(s.E * 10 - Math.round(s.E * 10)) < 1e-9 && s.E - s.n >= 2; });
        },
        stem: function (s) { return s.c.txt + ' ' + t(s.c.L + '(t)=' + s.b0 + '-' + s.r + 't') + '.'; },
        parts: [
          { id: '4a', outcome: 'RF8', level: 'PRG', make: function (r, s) {
            var c = s.c, L = c.L, rt = s.r, v = s.v, n = s.n, b0 = s.b0;
            return numPart('Solve ' + t(L + '(t)=' + v) + '.', n, [[(b0 + v) / rt, 'fn-solve-inverse', 'Subtract ' + t(b0) + ' from both sides first: ' + t('-' + rt + 't=' + v + '-' + b0) + '.'], [b0 - rt * v, 'u5x-evaluated', 'That is ' + t(L + '(' + v + ')') + '. Here ' + t(v) + ' is the ' + c.outw + ' (the output): solve ' + t(b0 + '-' + rt + 't=' + v) + '.'], [v / rt, 'no-subtract', 'The ' + c.outw + ' starts at ' + t(b0) + ', not ' + t('0') + ': use ' + t(b0 + '-' + v) + ' for the change.'], [b0 - v, 'no-divide', 'Now divide by ' + t(rt) + '.']],
              t(b0 + '-' + rt + 't=' + v) + '<br>' + t('-' + rt + 't=' + v + '-' + b0 + '=' + (v - b0)) + '<br>' + t('t=' + (v - b0) + '\\div(-' + rt + ')=' + n) + '. After ' + t(n) + ' ' + c.tw + ' the ' + c.outw + ' is ' + t(v) + ' ' + c.unit + '.',
              ['In ' + t(L + '(t)=' + v) + ' you know the output. Set the rule equal to ' + t(v) + '.', 'Subtract ' + t(b0) + ', then divide by ' + t('-' + rt) + '.'], 'solve a linear model', { before: t('t='), after: c.tu });
          } },
          { id: '4b', outcome: 'RF1', level: 'EMG', make: function (r, s) {
            var c = s.c, rt = s.r, E = s.E, L = c.L, b0 = s.b0;
            return numPart(c.ask, E, [[rt / b0, 'u5x-empty-flip', 'Solve ' + t(b0 + '-' + rt + 't=0') + ': ' + t('t=' + b0 + '\\div' + rt) + '.'], [b0, 'u5x-evaluated', 'That is the value at the start, ' + t(L + '(0)') + '. Find when ' + t(L + '(t)=0') + '.'], [b0 - rt, 'u5x-evaluated', 'That is ' + t(L + '(1)') + '. Find the time when ' + t(L + '(t)=0') + '.']],
              'It ' + c.zero + ' when ' + t(L + '(t)=0') + ' (the ' + t('t') + '-intercept):<br>' + t(b0 + '-' + rt + 't=0') + '<br>' + t(rt + 't=' + b0) + '<br>' + t('t=' + b0 + '\\div' + rt + '=' + nf(E)) + ' ' + c.tu + '.',
              ['Set the ' + c.outw + ' equal to ' + t('0') + ': solve ' + t(L + '(t)=0') + '.'], 'linear model: t-intercept', { after: c.tu });
          } }] }
    ]
  });
})(window);
