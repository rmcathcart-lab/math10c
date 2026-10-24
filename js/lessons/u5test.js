/* Math 10C · Unit 5 Test (RF1, RF2, RF8) — the paper outcomes-based unit test (u5_test_A/B/C.tex) as generators.
 * The paper has four pages (RF1; RF2 part 1; RF2 part 2; RF8), each with BEG / PRG / MAS boxes; every question keeps its
 * outcome and its level box. Numbers come from the seed, inside the range Versions A, B and C show (their numbers and
 * situations are possible values), with a key and a worked solution for every version. A scientific calculator is allowed
 * (u5_test_head.tex); no question needs a graphing calculator.
 * Conversions from paper:
 *   - paper Q1–Q3 all read one graph, so they are one question here (parts a–d): a question's shared numbers can't reach
 *     another question.
 *   - "describe / explain" → multiple choice whose options are reasons (Q3 situation, Q7 container, Q11, Q12b, Q13,
 *     Q19 why ∈ I, Q26c), tables of statements (Q8 meanings and why the domain stops, Q21 Jesse's errors), or typed numbers
 *     that carry the meaning (Q8b rate per 100 km, Q27 sentences with blanks, Q28c the domain that rules B(20) out).
 *   - "sketch" → the graph pad (Q4 story graph checked by shape and times; Q20 checked by domain, range and the
 *     vertical line test). Tick tables → grids. Mapping diagram → the arrow pad. "Write five ordered pairs" → typed pairs
 *     checked for the property; Q14b "could a function…" → type one, or none.
 * Levels: BEG / PRG / MAS as on the paper. */
(function (root) {
  'use strict';
  var HW = root.HW, ex = HW.ex, F = HW.fmt, K = HW.kit, P = K.P, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form, S = HW.sets, DR = HW.draw, PL = HW.poly;

  HW.addCodes({
    'u5t-read-swap': 'Read the wrong axis (gave a time for a value, or the reverse)', 'u5t-read-point': 'Read the graph at the wrong point',
    'u5t-one-time': 'Gave only one of the two times', 'u5t-dc-one': 'Discrete/continuous: one relation wrong', 'u5t-dc': 'Discrete/continuous: several relations wrong',
    'u5t-rate-int': 'Gave an intercept as the rate of change', 'u5t-interp-sign': 'Meaning of the rate: gave a negative amount for “goes down by”',
    'u5t-interp-scale': 'Meaning of the rate: didn’t scale to the amount asked (e.g. per 100 km)', 'u5t-mean-one': 'Meanings of the intercepts: one wrong',
    'u5t-mean': 'Meanings of the intercepts: both wrong', 'u5t-why-one': 'Why the domain stops: one end wrong', 'u5t-why': 'Why the domain stops: both ends wrong',
    'u5t-vlt-one': 'Vertical line test: one graph wrong', 'u5t-vlt': 'Vertical line test: several graphs wrong', 'u5t-var-swap': 'Independent and dependent variables swapped',
    'u5t-var-same': 'Same variable in both boxes', 'u5t-ex-fn': 'Example is a function (asked for a non-function)', 'u5t-ex-dom': 'Example has the wrong domain',
    'u5t-ex-range': 'Example has the wrong range', 'u5t-ex-count': 'Example has the wrong number of ordered pairs', 'u5t-fn-impossible': 'Gave a “function” for an impossible domain and range',
    'u5t-said-none': 'Said no function exists (one does)', 'u5t-ex-notfn': 'Example is not a function', 'u5t-dr-xy': 'Used y-values for the domain (or x-values for the range)',
    'u5t-dr-order': 'Wrote the bounds in the wrong order (larger first)', 'u5t-opens': 'Range: wrong direction for the curve', 'u5t-err-one': 'Error analysis: one statement judged wrong',
    'u5t-err': 'Error analysis: several statements judged wrong', 'u5t-ev-no-b': 'Evaluating: left out the constant term', 'u5t-ev-instead': 'Evaluated instead of solving',
    'u5t-solve-instead': 'Solved instead of evaluating', 'u5t-io-swap': 'Input and output swapped', 'u5t-stmt-input': 'Put the output in the brackets',
    'u5t-fee': 'Left out the fixed fee', 'u5t-diff-unit': 'Wrong unit for the change', 'u5t-diff-val': 'Gave one value instead of the difference',
    'u5t-model-rate': 'Rate not found per unit of time', 'u5t-model-swap': 'Start value and rate swapped', 'u5t-dom-T': 'Domain stops at the wrong time'
  });
  HW.addPartial({
    'u5t-read-swap': 'n', 'u5t-read-point': 'n', 'u5t-one-time': 'b', 'u5t-dc-one': 's', 'u5t-dc': 'n', 'u5t-rate-int': 'n', 'u5t-interp-sign': 's', 'u5t-interp-scale': 'b',
    'u5t-mean-one': 'b', 'u5t-mean': 'n', 'u5t-why-one': 'b', 'u5t-why': 'n', 'u5t-vlt-one': 's', 'u5t-vlt': 'n', 'u5t-var-swap': 'n', 'u5t-var-same': 'n',
    'u5t-ex-fn': 'n', 'u5t-ex-dom': 'b', 'u5t-ex-range': 'b', 'u5t-ex-count': 's', 'u5t-fn-impossible': 'n', 'u5t-said-none': 'n', 'u5t-ex-notfn': 'n',
    'u5t-dr-xy': 'b', 'u5t-dr-order': 's', 'u5t-opens': 'n', 'u5t-err-one': 's', 'u5t-err': 'n', 'u5t-ev-no-b': 's', 'u5t-ev-instead': 'n', 'u5t-solve-instead': 'n',
    'u5t-io-swap': 'n', 'u5t-stmt-input': 'n', 'u5t-fee': 'b', 'u5t-diff-unit': 'b', 'u5t-diff-val': 'b', 'u5t-model-rate': 'b', 'u5t-model-swap': 'n', 'u5t-dom-T': 'b'
  });

  /* ================= general helpers ================= */
  function find(gen, test, fallback) { for (var i = 0; i < 1500; i++) { var v = gen(); if (v != null && test(v)) return v; } return fallback; }
  function range(a, b) { var o = []; for (var i = a; i <= b; i++) o.push(i); return o; }
  function nz(a, b) { return range(a, b).filter(function (x) { return x !== 0; }); }
  function cl(x) { return Math.round(x * 1e6) / 1e6; }
  function nT(x) { return String(cl(x)); }
  function same(a, b) { return Math.abs(a - b) < 1e-9; }
  function uniq(a) { var s = a.slice().sort(function (x, y) { return x - y; }); return s.filter(function (x, i) { return i === 0 || Math.abs(x - s[i - 1]) > 1e-9; }); }
  function sorted(a) { for (var i = 1; i < a.length; i++) if (a[i] < a[i - 1]) return false; return true; }
  function pT(p) { return '(' + nT(p[0]) + ',\\ ' + nT(p[1]) + ')'; }
  function psT(ps) { return ps.map(pT).join(',\\ '); }
  function setT(ps) { return '\\{' + psT(ps) + '\\}'; }
  function psH(ps) { var a = ps.map(pT); a[0] = '\\{' + a[0]; a[a.length - 1] += '\\}'; return a.map(function (s) { return '<span class="nw">' + t(s) + '</span>'; }).join(', '); }
  function andT(a) { var s = a.map(function (x) { return t(nT(x)); }); return s.length < 2 ? s.join('') : s.slice(0, -1).join(', ') + ' and ' + s[s.length - 1]; }
  function money(x) { x = cl(x); return Math.abs(x - Math.round(x)) < 1e-9 ? String(Math.round(x)) : x.toFixed(2); }
  function lin(m, b, v) { // m·v + b, written normally
    v = v || 'x'; var s = m === 0 ? '' : (m === 1 ? '' : m === -1 ? '-' : nT(m)) + v;
    if (b) s += (s ? (b > 0 ? '+' : '-') + nT(Math.abs(b)) : nT(b));
    return s || '0';
  }
  function linB(b, m, v) { // b + m·v (constant first, as in 8 − 3x)
    v = v || 'x'; var mm = Math.abs(m), term = (mm === 1 ? '' : nT(mm)) + v;
    return nT(b) + (m < 0 ? '-' : '+') + term;
  }
  function sg(x) { return x < 0 ? '(' + nT(x) + ')' : nT(x); }
  function bank(items, cols) {
    return '<div style="display:grid;grid-template-columns:repeat(' + (cols || 2) + ',minmax(0,1fr));gap:4px 14px;margin:6px 0">' + items.map(function (it) { return '<div><b>' + it.label + '</b>' + it.svg + '</div>'; }).join('') + '</div>';
  }
  /* a grid part whose wrong answers are coded by how many rows are wrong */
  function badRows(want, resp) { resp = resp || {}; return Object.keys(want).filter(function (k) { var g = resp[k], w = want[k]; return Array.isArray(w) ? (g || []).slice().sort().join('|') !== w.slice().sort().join('|') : g !== w; }); }
  function gridPart(prompt, rows, cols, want, why, sol, hints, text, oneCode, manyCode) {
    var p = P.grid(prompt, rows, cols, want, { why: why }, sol, hints, text), base = p.check;
    p.check = function (resp) { var res = base(resp); if (res.v !== 'wrong') return res; return wrong(badRows(want, resp).length === 1 ? oneCode : manyCode, res.hint); };
    var other = function (id) { var c = cols.map(function (x) { return x.id; }).filter(function (c0) { return c0 !== want[id]; }); return c[0]; };
    var one = {}; Object.keys(want).forEach(function (k) { one[k] = want[k]; }); var k0 = Object.keys(want)[0]; one[k0] = other(k0);
    var allW = {}; Object.keys(want).forEach(function (k) { allW[k] = other(k); });
    p.bad = [one, allW];
    return p;
  }
  function numDiag(cands, extra) {
    return function (v) {
      for (var i = 0; i < cands.length; i++) { var c = cands[i]; if (c.v != null && isFinite(c.v) && same(v, c.v)) return { code: c.code, hint: c.hint }; }
      return extra ? extra(v) : null;
    };
  }
  function numChk(ans, cands, extra) { return K.number(ans, numDiag((cands || []).filter(function (c) { return c.v != null && !same(c.v, ans); }), extra)); }
  function numPart(prompt, ans, cands, sol, hints, text, inp) {
    var cs = (cands || []).filter(function (c) { return c.v != null && isFinite(c.v) && !same(c.v, ans); });
    var p = P.number(prompt, ans, numDiag(cs), sol, hints, text, inp);
    p.key = nT(ans); p.answer = t((inp && inp.before ? String(inp.before).replace(/\\\(|\\\)/g, '') : '') + nT(ans)) + (inp && inp.after ? ' ' + inp.after : '');
    p.bad = cs.map(function (c) { return nT(c.v); });
    return p;
  }

  /* ================= set notation (as in Lesson 4) ================= */
  function cond(v, lo, hi, lc, hc) {
    lc = lc !== false; hc = hc !== false;
    if (lo == null && hi == null) return '';
    if (lo == null) return v + (hc ? '\\le ' : '<') + hi;
    if (hi == null) return v + (lc ? '\\ge ' : '>') + lo;
    return lo + (lc ? '\\le ' : '<') + v + (hc ? '\\le ' : '<') + hi;
  }
  function bld(v, lo, hi, lc, hc) { var c = cond(v, lo, hi, lc, hc); return '\\{' + v + '\\mid ' + (c ? c + ',\\ ' : '') + v + '\\in\\mathbb{R}\\}'; }
  function all(v) { return bld(v, null, null); }
  function lst(a) { return '\\{' + uniq(a).map(nT).join(', ') + '\\}'; }
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
          if (L.some(function (x, i) { return L.some(function (y, j) { return j < i && same(x, y); }); })) return form('set-repeat', 'Right values — but write each value <b>only once</b> in a list, even when it appears in several points.');
          if (!sorted(L)) return form('set-order', 'Right values — now write the list in <b>increasing order</b> (smallest first).');
        }
        return r;
      }
      if (r.v === 'wrong' && o.ctx && o.ctx[r.code]) return wrong(r.code, o.ctx[r.code]);
      return r;
    };
  }
  function ph(v) { return 'e.g. {' + v + ' | -2 <= ' + v + ' < 5, ' + v + ' in R}'; }
  /* one part, two boxes: Domain and Range. o: dv, rv, dW / rW (wrong sets), dC / rC (hints for built-in codes), bad */
  function drPart(prompt, D, R, o, sol, hints, text) {
    o = o || {}; var dv = o.dv || 'x', rv = o.rv || 'y';
    var cD = setChk(D, { v: dv, other: R, otherName: 'range', wrong: o.dW, ctx: o.dC }), cR = setChk(R, { v: rv, other: D, otherName: 'domain', wrong: o.rW, ctx: o.rC });
    var vars = [dv, rv].filter(function (v, i, a) { return a.indexOf(v) === i; });
    var fl = [{ label: 'Domain', name: 'Domain', mode: 'math', keys: 'set', vars: vars, placeholder: ph(dv) }, { label: 'Range', name: 'Range', mode: 'math', keys: 'set', vars: vars, placeholder: ph(rv) }];
    var p = P.fields(prompt, fl, [cD, cR], [D, R], t('D=' + D) + '<br>' + t('R=' + R), sol, hints, text);
    p.good = [[ivAlt(D), ivAlt(R)]];
    var Dp = S.parse(D).set, Rp = S.parse(R).set, bad = [];
    if (!S.eq(Dp, Rp)) bad.push([R, D]);
    (o.dW || []).forEach(function (w) { var q = S.parse(w.is); if (q.ok && !S.eq(q.set, Dp)) bad.push([w.is, R]); });
    (o.rW || []).forEach(function (w) { var q = S.parse(w.is); if (q.ok && !S.eq(q.set, Rp)) bad.push([D, w.is]); });
    p.bad = bad.concat(o.bad || []);
    return p;
  }
  function setPart(prompt, target, o, sol, hints, text) {
    o = o || {}; var v = o.v || 'x';
    var p = P.math(prompt, setChk(target, o), target, sol, hints, text, { keys: 'set', vars: [v], placeholder: ph(v) });
    p.good = [ivAlt(target)]; p.bad = (o.wrong || []).map(function (w) { return w.is; }).concat(o.other ? [o.other] : []).filter(function (s) { var a = S.parse(s), b = S.parse(target); return a.ok && !S.eq(a.set, b.set); });
    return p;
  }
  var HINT_D = 'The <b>domain</b> is every ' + t('x') + '-value the relation uses (look left to right); the <b>range</b> is every ' + t('y') + '-value it produces (look bottom to top).';
  var HINT_DOTS = 'Solid dot → that value is included (' + t('\\le') + '). Hollow dot → excluded (' + t('<') + '). Arrow → no end on that side.';
  var HINT_LIST = 'Separate points give a <b>list</b> in braces, each value once, smallest first, e.g. ' + t('\\{-2, 1, 5\\}') + '.';

  /* ================= relations (as in Lesson 5) ================= */
  function info(pairs) {
    var by = {}, order = [], outBy = {}, oorder = [];
    pairs.forEach(function (p) {
      var k = nT(p[0]); if (!by[k]) { by[k] = { x: p[0], ys: [] }; order.push(k); } if (!by[k].ys.some(function (y) { return same(y, p[1]); })) by[k].ys.push(p[1]);
      var o = nT(p[1]); if (!outBy[o]) { outBy[o] = { y: p[1], xs: [] }; oorder.push(o); } if (!outBy[o].xs.some(function (x) { return same(x, p[0]); })) outBy[o].xs.push(p[0]);
    });
    var breakers = order.map(function (k) { return by[k]; }).filter(function (e) { return e.ys.length > 1; });
    var shared = oorder.map(function (k) { return outBy[k]; }).filter(function (e) { return e.xs.length > 1; });
    return { isFn: !breakers.length, breakers: breakers, shared: shared, xs: order.map(function (k) { return by[k].x; }), ys: oorder.map(function (k) { return outBy[k].y; }) };
  }
  function shuffleApart(r, pairs) {
    for (var i = 0; i < 80; i++) { var s = r.shuffle(pairs), bad = false; for (var j = 1; j < s.length; j++) if (same(s[j][0], s[j - 1][0])) bad = true; if (!bad) return s; }
    return pairs.slice();
  }
  function htab(pairs, vx, vy) { return HW.valueTable([[t(vx || 'x')].concat(pairs.map(function (p) { return t(nT(p[0])); })), [t(vy || 'y')].concat(pairs.map(function (p) { return t(nT(p[1])); }))]); }
  function arrowFig(pairs, left, right) { var I = info(pairs); return HW.arrowDiagram(left || uniq(I.xs), right || uniq(I.ys), pairs); }
  var HFN = ['A relation is a function when every input (first coordinate) is paired with exactly one output (second coordinate).', 'Look for an input that appears with two different outputs. Outputs are allowed to repeat.'];
  var HARR = ['Count the arrows <b>leaving</b> each element on the left. A function has exactly one arrow leaving every one of them.', 'Arrows <b>arriving</b> at the same element on the right are allowed.'];
  function discWhy(I, rep) {
    if (I.isFn) return (rep === 'arrow' ? 'Each element on the left has exactly one arrow leaving it' : 'Each input ' + andT(I.xs) + ' appears only once, with one output') +
      (I.shared.length ? ' — the output ' + t(nT(I.shared[0].y)) + ' coming from ' + andT(I.shared[0].xs) + ' is allowed' : '') + '. <b>Function.</b>';
    var b = I.breakers[0];
    return (rep === 'arrow' ? t(nT(b.x)) + ' has ' + b.ys.length + ' arrows leaving it (to ' + andT(b.ys) + ')' : 'The input ' + t(nT(b.x)) + ' is paired with ' + andT(b.ys)) + ': one input, more than one output. <b>Not a function.</b>';
  }
  function discReasonMC(r, fig, pairs, rep, text) {
    var I = info(pairs), opts, s = I.shared[0], b = I.breakers[0];
    var inputs = rep === 'arrow' ? 'element on the left' : 'input';
    if (I.isFn) {
      opts = [
        { html: 'Yes — ' + (rep === 'arrow' ? 'each element on the left has exactly one arrow leaving it.' : 'the inputs ' + t(I.xs.map(nT).join(',\\ ')) + ' are all different, so each input has exactly one output.'), right: true },
        s ? { html: 'No — the output ' + t(nT(s.y)) + ' is paired with ' + (s.xs.length > 2 ? 'several inputs, ' : 'two inputs, ') + andT(s.xs) + '.', code: 'shared-out', why: 'Two inputs may share an output. The test is about inputs: is any ' + inputs + ' paired with two different outputs?' }
          : { html: 'No — every output is different, so the outputs can’t be predicted.', code: 'outs-distinct', why: 'Different outputs are allowed. The test is about inputs: is any ' + inputs + ' paired with two different outputs?' },
        s ? { html: 'Yes — each output is paired with exactly one input.', code: 'out-reason', why: 'The verdict is right but the reason isn’t: the output ' + t(nT(s.y)) + ' comes from ' + andT(s.xs) + '. A function only needs each <b>input</b> to have one output.' }
          : { html: 'Yes — the outputs go up or down in a pattern.', code: 'pattern', why: 'The verdict is right, but a pattern isn’t the test. A function needs each <b>input</b> to have exactly one output.' },
        { html: 'No — the domain and the range don’t have the same number of elements.', code: 'sizes', why: 'The sizes don’t decide it: several inputs can share one output. Check whether any ' + inputs + ' has two outputs.' }];
    } else {
      opts = [
        { html: 'No — the input ' + t(nT(b.x)) + ' is paired with ' + (b.ys.length > 2 ? 'several' : 'two') + ' outputs, ' + andT(b.ys) + '.', right: true },
        rep === 'arrow' ? { html: 'Yes — every element on the right has an arrow pointing to it.', code: 'all-hit', why: 'Count the arrows <b>leaving</b> each element on the left instead: ' + t(nT(b.x)) + ' sends ' + b.ys.length + ' arrows.' }
          : { html: 'Yes — no ordered pair appears twice.', code: 'no-dup-pair', why: t(pT([b.x, b.ys[0]])) + ' and ' + t(pT([b.x, b.ys[1]])) + ' are different pairs, but they give the one input ' + t(nT(b.x)) + ' two different outputs.' },
        { html: 'Yes — each output is paired with exactly one input.', code: 'out-reason', why: 'The test is about inputs, not outputs — and the input ' + t(nT(b.x)) + ' is paired with both ' + andT(b.ys) + '.' },
        { html: 'No — the outputs are not in order.', code: 'order', why: 'The verdict is right, but not the reason: the order of the outputs never matters. The real problem is the input ' + t(nT(b.x)) + ', which has more than one output.' }];
    }
    return P.mc(r, fig + 'Is this relation a function? Choose the answer with the correct reason.', opts, discWhy(I, rep), rep === 'arrow' ? HARR : HFN, 'function? reason: ' + text);
  }

  /* ================= drawing helpers ================= */
  var INK = '#2b3340';
  function G(spec) { return HW.graph(Object.assign({ x: [-6, 6], y: [-6, 6], labels: 2, max: 290 }, spec)); }
  var EDGE = 5.4;
  function toEdge(p, d, w) {
    w = w || EDGE; var k = Infinity;
    if (d[0] > 0) k = Math.min(k, (w - p[0]) / d[0]); if (d[0] < 0) k = Math.min(k, (-w - p[0]) / d[0]);
    if (d[1] > 0) k = Math.min(k, (w - p[1]) / d[1]); if (d[1] < 0) k = Math.min(k, (-w - p[1]) / d[1]);
    return [cl(p[0] + k * d[0]), cl(p[1] + k * d[1])];
  }
  function ell(h, k, a, b) { var o = []; for (var i = 0; i <= 120; i++) { var th = 2 * Math.PI * i / 120; o.push([h + a * Math.cos(th), k + b * Math.sin(th)]); } return o; }
  function poly(pts) { return { pts: [], pieces: [{ v: pts, s: 'none', e: 'none' }], join: 'none' }; }
  function seg(a, b, s, e) { return { v: [a, b], s: s || 'closed', e: e || 'closed' }; }
  function drw(pieces, pts) { return { pts: pts || [], pieces: pieces || [], join: 'none' }; }

  /* ---------- story graphs (as in Lesson 8): runs of pieces going the same way are one stage ---------- */
  function groupsOf(value) {
    var g = [];
    DR.phases(value).phases.forEach(function (p) { var L = g[g.length - 1]; if (L && L.dir === p.dir) { L.segs.push(p); L.x1 = p.x1; L.y1 = p.y1; } else g.push({ dir: p.dir, segs: [p], x0: p.x0, x1: p.x1, y0: p.y0, y1: p.y1 }); });
    return g;
  }
  function simple(Gs) { var v = [[Gs[0].x0, Gs[0].y0]]; Gs.forEach(function (g) { v.push([g.x1, g.y1]); }); return poly(v); }
  function story(spec) {
    var base = K.graphStory(spec);
    return function (resp) {
      if (DR.empty(resp)) return base(resp);
      var ph = DR.phases(resp);
      if (ph.vertical || ph.gaps.length || DR.notFunction(resp)) return base(resp);
      if (!ph.phases.length) return wrong('story-lines', 'Draw the graph as a line: tap where it starts, then each corner in turn, and tap the last point again to finish.');
      var Gs = groupsOf(resp);
      if (spec.prep) Gs = spec.prep(Gs);
      return base(simple(Gs));
    };
  }

  /* ================= RF1 · paper Q1–Q3: one situation graph ================= */
  var NAMES = ['Maya', 'Owen', 'Nia', 'Theo', 'Ravi', 'Lena', 'Kofi', 'Ana', 'Mateo', 'Zoe', 'Iris', 'Sam', 'Tariq', 'Hana', 'Jules', 'Amir'];
  var SHE = { Maya: 1, Nia: 1, Lena: 1, Ana: 1, Zoe: 1, Iris: 1, Hana: 1, Jules: 1 };
  var Q1C = {
    bike: { gy: 1, ly: 2, ys: [4, 6, 8], up2: [2, 4], ymax: 12, t1: [10, 15, 20], fl: [5, 10], r2: [5, 10], dn: [15, 20, 25], T: 60, kStep: 1, yu: 'km', xu: 'min', yn: 'd', xTitle: 'Time (min)', yTitle: 'Distance (km)' },
    drone: { gy: 5, ly: 10, ys: [30, 40, 50], up2: [10, 20], ymax: 70, t1: [15, 20, 25], fl: [5, 10, 15], r2: [5, 10], dn: [15, 20, 25], T: 60, kStep: 5, yu: 'm', xu: 's', yn: 'h', xTitle: 'Time (s)', yTitle: 'Height (m)' },
    tub: { gy: 20, ly: 40, ys: [60, 80, 100], up2: [40, 60, 80], ymax: 180, t1: [5, 10], fl: [5, 10], r2: [5, 10, 15], dn: [15, 20, 25], T: 50, kStep: 20, yu: 'L', xu: 'min', yn: 'V', xTitle: 'Time (min)', yTitle: 'Volume (L)' }
  };
  function q1Shared(r) {
    var kind = r.pick(['bike', 'bike', 'drone', 'tub']), c = Q1C[kind], nm = r.pick(NAMES), she = !!SHE[nm];
    return find(function () {
      var t1 = r.pick(c.t1), t2 = t1 + r.pick(c.fl), t3 = t2 + r.pick(c.r2), t4 = t3 + r.pick(c.dn), y1 = r.pick(c.ys), y3 = y1 + r.pick(c.up2);
      if (t4 > c.T || y3 > c.ymax) return null;
      var ks = [];
      for (var k = c.kStep; k < y3; k += c.kStep) {
        if (same(k, y1)) continue;
        var ta = k < y1 ? t1 * k / y1 : t2 + (k - y1) * (t3 - t2) / (y3 - y1), tb = t3 + (y3 - k) * (t4 - t3) / y3;
        if (Math.abs(ta / 5 - Math.round(ta / 5)) < 1e-9 && Math.abs(tb / 5 - Math.round(tb / 5)) < 1e-9 && ta > 0) ks.push({ k: k, ta: cl(ta), tb: cl(tb) });
      }
      if (!ks.length) return null;
      var kk = r.pick(ks);
      return { kind: kind, c: c, nm: nm, she: she, T: [0, t1, t2, t3, t4], Y: [0, y1, y1, y3, 0], k: kk.k, ta: kk.ta, tb: kk.tb, atC: r.chance(0.35) };
    }, function () { return true; }, { kind: 'bike', c: Q1C.bike, nm: 'Maya', she: true, T: [0, 15, 25, 35, 60], Y: [0, 6, 6, 10, 0], k: 4, ta: 10, tb: 50, atC: false });
  }
  function q1Fig(s) {
    var c = s.c, X = s.T[4] + 10, Y = c.ymax + c.gy, pts = s.T.map(function (x, i) { return [x, s.Y[i]]; });
    var labs = ['', 'A', 'B', 'C', 'D'], off = [null, [-9, -9], [6, -11], [0, -11], [9, -9]];
    var svg = HW.graph({ x: [0, X], y: [0, Y], grid: 5, gridY: c.gy, labels: 10, labelsX: 10, labelsY: c.ly, firstQuadrant: true, unitX: 330 / X, unitY: 200 / Y, xName: 't', yName: c.yn,
      xTitle: c.xTitle, yTitle: c.yTitle, segs: [{ pts: pts }], points: pts.slice(1).map(function (p) { return { x: p[0], y: p[1] }; }), max: 430, aria: 'graph of a situation with points A, B, C and D' });
    var Lt = HW.graph.last, txt = '';
    pts.forEach(function (p, i) { if (!i) return; txt += '<text x="' + (Lt.X(p[0]) + off[i][0]).toFixed(1) + '" y="' + (Lt.Y(p[1]) + off[i][1]).toFixed(1) + '" font-size="13" font-weight="700" font-style="italic" text-anchor="middle" fill="#2b3340" stroke="#fff" stroke-width="3" paint-order="stroke">' + labs[i] + '</text>'; });
    return svg.replace('</svg>', txt + '</svg>');
  }
  function q1Stem(s) {
    var c = s.kind, n = s.nm;
    var intro = c === 'bike' ? 'The graph shows ' + n + '’s distance from home during a bike ride.' : c === 'drone' ? 'The graph shows the height of a drone above the ground during a flight.' : 'The graph shows the volume of water in a bathtub.';
    return intro + q1Fig(s);
  }
  function hisher(s) { return s.she ? 'her' : 'his'; }
  function q1Read(s) {
    var i = s.atC ? 3 : 1, tt = s.T[i], val = s.Y[i], c = s.c, n = s.nm;
    var prompt = s.kind === 'bike' ? 'How far from home was ' + n + ' after ' + t(tt) + ' minutes?' : s.kind === 'drone' ? 'How high was the drone after ' + t(tt) + ' seconds?' : 'How much water was in the tub after ' + t(tt) + ' minutes?';
    var other = s.Y[s.atC ? 1 : 3];
    var p = numPart(prompt, val, [{ v: tt, code: 'u5t-read-swap', hint: 'That’s the time. Go up from ' + t(tt) + ' on the time axis to the graph, then across to read the value on the vertical axis.' },
      { v: other, code: 'u5t-read-point', hint: 'That’s the value at a different point. Start at ' + t(tt) + ' on the time axis.' }],
      'At ' + t(tt) + ' ' + c.xu + ' the graph is at point ' + (s.atC ? 'C' : 'A') + ', ' + t(pT([tt, val])) + ': <b>' + t(val) + ' ' + c.yu + '</b>.',
      ['Find ' + t(tt) + ' on the horizontal (time) axis, go up to the graph, then across to the vertical axis.'], 'read the situation graph at t=' + tt, { after: c.yu });
    p.input.after = c.yu;
    return p;
  }
  function q1Times(s) {
    var c = s.c, n = s.nm, k = s.k, ta = s.ta, tb = s.tb;
    var prompt = s.kind === 'bike' ? 'At what <b>two</b> times was ' + n + ' exactly ' + t(k) + ' km from home?' : s.kind === 'drone' ? 'At what <b>two</b> times was the drone exactly ' + t(k) + ' m above the ground?' : 'At what <b>two</b> times did the tub hold exactly ' + t(k) + ' L of water?';
    var base = K.valueSet([ta, tb], { v: 't', diag: function (A) {
      if (A.length === 1 && (same(A[0], ta) || same(A[0], tb))) return { code: 'u5t-one-time', hint: 'Correct so far — but the graph reaches ' + t(k) + ' ' + c.yu + ' <b>twice</b>. Follow the horizontal line at ' + t(k) + ' across the whole graph.' };
      if (A.some(function (x) { return same(x, k); })) return { code: 'u5t-read-swap', hint: t(k) + ' ' + c.yu + ' is a value on the vertical axis. Find it there, go across to the graph, then read the <b>times</b> below.' };
      return null;
    } });
    var chk = function (resp) { return base(String(resp == null ? '' : resp).replace(/\\text\{[^}]*\}/g, ' ').replace(/\b(min(ute)?s?|sec(ond)?s?|s)\b\.?/gi, ' ')); };
    var p = P.math(prompt, chk, 't=' + ta + ',\\ t=' + tb,
      'Draw a horizontal line at ' + t(k) + ' ' + c.yu + '. It meets the graph twice: on the way ' + (k < s.Y[1] ? 'up from the start' : 'up from B to C') + ' at ' + t(ta) + ' ' + c.xu + ', and on the way down from C to D at ' + t(tb) + ' ' + c.xu + '.',
      ['Find ' + t(k) + ' on the vertical axis and slide across the whole graph.', 'Read the time below each crossing.'], 'two times at value ' + k, { keys: 'solutions', vars: ['t'], placeholder: 'e.g. t = 5, t = 40' });
    p.answer = t(ta + '\\text{ ' + c.xu + '}') + ' and ' + t(tb + '\\text{ ' + c.xu + '}');
    p.good = [ta + ', ' + tb, tb + ', ' + ta];
    p.bad = [String(ta), String(tb), String(k)];
    return p;
  }
  function q1Flat(r, s) {
    var n = s.nm, he = s.she ? 'she' : 'he', y1 = s.Y[1], c = s.c, seg0 = 'from ' + t('A') + ' to ' + t('B') + ' (' + s.T[1] + ' to ' + s.T[2] + ' ' + c.xu + ')';
    var o = s.kind === 'bike' ? [
      { html: n + ' stopped to rest: the graph is flat, so ' + hisher(s) + ' distance from home did not change.', right: true },
      { html: n + ' rode at a steady speed: a flat graph means ' + he + ' kept going at the same speed.', why: 'This graph shows <b>distance from home</b>. Flat means the distance isn’t changing — ' + he + ' isn’t moving.' },
      { html: n + ' rode along a flat, level road.', why: 'The graph shows distance from home, not the shape of the road.' },
      { html: n + ' was riding back toward home.', why: 'Going toward home makes the distance <b>decrease</b>: the graph would fall.' }]
      : s.kind === 'drone' ? [
      { html: 'It hovered at ' + t(y1) + ' m: the graph is flat, so its height did not change.', right: true },
      { html: 'It flew upward at a steady speed.', why: 'Going up would make the height increase: the graph would rise.' },
      { html: 'It was sitting on the ground.', why: 'The flat part is at ' + t(y1) + ' m, not at ' + t('0') + '.' },
      { html: 'It slowly came back down.', why: 'Coming down would make the height decrease: the graph would fall.' }] : [
      { html: 'The tap was off and the drain was closed: the graph is flat, so the volume of water did not change.', right: true },
      { html: 'The tub was filling at a steady rate.', why: 'Filling makes the volume increase: the graph would rise.' },
      { html: 'The tub was empty.', why: 'The flat part is at ' + t(y1) + ' L, not at ' + t('0') + '.' },
      { html: 'The tub was draining slowly.', why: 'Draining makes the volume decrease: the graph would fall.' }];
    return P.mc(r, 'Describe what was happening ' + seg0 + ', and how the graph shows it.', o,
      'From A to B the graph is <b>flat</b>: the value stays at ' + t(y1) + ' ' + c.yu + ' while time passes. ' + (s.kind === 'bike' ? n + ' stopped (rested).' : s.kind === 'drone' ? 'The drone hovered.' : 'No water went in or out.'),
      ['What does a flat (horizontal) piece mean on this graph? Read the vertical axis.'], 'describe flat piece: ' + s.kind);
  }
  function q1Fall(r, s) {
    var n = s.nm, he = s.she ? 'she' : 'he', c = s.c, seg0 = 'from ' + t('C') + ' to ' + t('D') + ' (' + s.T[3] + ' to ' + s.T[4] + ' ' + c.xu + ')';
    var o = s.kind === 'bike' ? [
      { html: n + ' rode back home: the graph falls to ' + t('0') + ', so ' + hisher(s) + ' distance from home decreased to ' + t('0') + '.', right: true },
      { html: n + ' rode downhill: the graph goes down.', why: 'The graph shows distance from home, not height. Going down here means getting closer to home.' },
      { html: n + ' slowed down until ' + he + ' stopped.', why: 'Slowing down would make the graph <b>flatter</b>. A falling distance-from-home graph means getting closer to home.' },
      { html: n + ' rode farther from home, faster than before.', why: 'Moving farther from home makes the graph <b>rise</b>.' }]
      : s.kind === 'drone' ? [
      { html: 'It flew down and landed: the graph falls to ' + t('0') + ', so its height decreased to ' + t('0') + '.', right: true },
      { html: 'It flew away from the pilot.', why: 'The graph shows height above the ground, not distance from the pilot.' },
      { html: 'It slowed down and hovered.', why: 'Hovering would be a flat piece. Here the height drops all the way to ' + t('0') + '.' },
      { html: 'It climbed faster than before.', why: 'Climbing makes the height increase: the graph would rise.' }] : [
      { html: 'The tub was draining: the graph falls to ' + t('0') + ', so the volume decreased until the tub was empty.', right: true },
      { html: 'The tap was turned off.', why: 'With the tap off (and the drain closed) the volume stays the same: a flat piece.' },
      { html: 'Someone got out of the tub.', why: 'Getting out drops the water level all at once. This graph falls steadily for ' + t(s.T[4] - s.T[3]) + ' minutes until the tub is empty.' },
      { html: 'The tub was filling more slowly.', why: 'Filling, even slowly, makes the volume increase: the graph would rise.' }];
    return P.mc(r, 'Describe what was happening ' + seg0 + ', and how the graph shows it.', o,
      'From C to D the graph <b>falls</b> to ' + t('0') + ': the value decreases steadily until it is ' + t('0') + ' at D. ' + (s.kind === 'bike' ? n + ' rode back home.' : s.kind === 'drone' ? 'The drone flew down and landed.' : 'The tub drained until it was empty.'),
      ['Is the graph rising, flat or falling? What does that say about the quantity on the vertical axis?'], 'describe falling piece: ' + s.kind);
  }

  /* ================= RF1 · paper Q4: sketch from a story ================= */
  var Q4C = [
    { id: 'walk', xu: 'min', yT: 'Distance from home', xT: 'Time (min)', a: [10, 15, 20], b: [10, 15, 20], max: 60,
      text: function (s) { var go = s.place; return s.nm + ' walks from home to ' + go + ' at a steady pace for ' + t(s.a) + ' min. ' + (s.she ? 'She' : 'He') + ' stays at ' + go + ' for ' + t(s.b) + ' min, then ' + (s.fast ? 'jogs home, faster than ' + (s.she ? 'she' : 'he') + ' walked,' : 'walks home slowly, more slowly than before,') + ' in ' + t(s.c) + ' min. Sketch a graph of ' + (s.she ? 'her' : 'his') + ' distance from home.'; },
      st: ['walking to ' , 'staying', 'going home'] },
    { id: 'lift', xu: 's', yT: 'Height', xT: 'Time (s)', a: [20, 25, 30, 40], b: [10, 15, 20], max: 70,
      text: function (s) { return 'An elevator starts at the ground floor and rises at a steady speed for ' + t(s.a) + ' s. It stops at the top floor for ' + t(s.b) + ' s, then goes back down to the ground floor, ' + (s.fast ? 'faster' : 'more slowly') + ' than it rose, in ' + t(s.c) + ' s. Sketch a graph of its height.'; },
      st: ['rising', 'stopped at the top floor', 'going down'] },
    { id: 'balloon', xu: 'min', yT: 'Height', xT: 'Time (min)', a: [10, 15, 20], b: [10, 15], max: 60,
      text: function (s) { return 'A hot-air balloon rises at a steady rate for ' + t(s.a) + ' min. It stays at the same height for ' + t(s.b) + ' min, then comes down to the ground in ' + t(s.c) + ' min, ' + (s.fast ? 'faster' : 'more slowly') + ' than it rose. Sketch a graph of its height.'; },
      st: ['rising', 'staying at the same height', 'coming down'] }];
  function q4Shared(r) {
    return find(function () {
      var c = r.pick(Q4C), a = r.pick(c.a), b = r.pick(c.b), fast = r.chance(0.55), cc = fast ? r.pick([5, 10, 15].filter(function (x) { return x < a; })) : r.pick([a + 5, a + 10, a + 15]);
      var nm = r.pick(NAMES);
      return { c: c, a: a, b: b, cc: cc, fast: fast, nm: nm, she: !!SHE[nm], place: r.pick(['the library', 'the store', 'a friend’s house', 'the park']) };
    }, function (s) { return s.cc && s.a + s.b + s.cc <= s.c.max; }, { c: Q4C[0], a: 10, b: 20, cc: 5, fast: true, nm: 'Omar', she: false, place: 'the library' });
  }

  /* ================= RF1 · paper Q5: a situation for a graph ================= */
  function sketchSvg(segs, fns, yT) {
    return HW.graph({ x: [0, 10], y: [0, 6], grid: 0, labels: 0, firstQuadrant: true, xName: ' ', yName: ' ', xTitle: 'Time', yTitle: yT, unit: 26, segs: segs || [], fns: fns || [], max: 300, aria: 'sketch of a graph' });
  }
  function q5Part(r) {
    var kind = r.pick(['speed', 'speed', 'temp', 'gas']), o, svg, sol;
    if (kind === 'speed') {
      var a = r.int(10, 16) / 10, hi = r.int(38, 50) / 10, b = a + r.int(20, 30) / 10, c0 = b + r.int(10, 15) / 10, d = c0 + r.int(12, 20) / 10, e = Math.min(9.6, d + r.int(15, 25) / 10), lo2 = r.int(26, 36) / 10;
      svg = sketchSvg([{ pts: [[0, 0], [a, hi], [b, hi], [c0, 0], [d, 0], [e, lo2]] }], null, 'Speed');
      var veh = r.pick([['A car', 'a red light'], ['A bus', 'a bus stop'], ['A cyclist', 'a stop sign'], ['A train', 'a station']]);
      o = [{ html: veh[0] + ' speeds up from a stop, travels at a steady speed, slows down and stops (at ' + veh[1] + '), waits, then speeds up again.', right: true },
        { html: veh[0] + ' leaves home, stays somewhere for a while, comes back home, waits at home, then leaves again.', why: 'That reads the graph as <b>distance</b> from home. The vertical axis is <b>speed</b>: a flat piece means a steady speed, and the graph at ' + t('0') + ' means stopped.' },
        { html: veh[0] + ' travels at a steady speed, speeds up, slows down to a stop, then speeds up again.', why: 'The graph starts at a speed of ' + t('0') + ' and rises first: it starts from a stop.' },
        { html: veh[0] + ' speeds up from a stop, travels at a steady speed, slows down, then speeds up again without stopping.', why: 'The graph comes down to ' + t('0') + ' and stays there for a while: it does stop and wait.' }];
      sol = 'Read each piece as a change in <b>speed</b>: rising = speeding up (from ' + t('0') + ', a stop); flat = steady speed; falling to ' + t('0') + ' = slowing to a stop; flat at ' + t('0') + ' = waiting; rising = speeding up again. ' + o[0].html;
    } else if (kind === 'temp') {
      var t0 = r.int(4, 6) / 10, a1 = r.int(6, 12) / 10, b1 = a1 + r.int(10, 16) / 10, top = r.int(44, 52) / 10, c1 = b1 + r.int(10, 16) / 10, fl = t0 + r.int(2, 5) / 10;
      svg = sketchSvg([{ pts: [[0, t0], [a1, t0], [b1, top], [c1, top]] }], [{ f: function (x) { return fl + (top - fl) * Math.exp(-0.75 * (x - c1)); }, from: c1, to: 9.6 }], 'Temperature');
      var food = r.pick([['A pizza', 'goes into a hot oven', 'bakes', 'is taken out'], ['A pan of muffins', 'goes into a hot oven', 'bakes', 'is taken out'], ['A pot of soup', 'is put on the stove', 'simmers', 'is taken off the stove'], ['A tray of lasagna', 'goes into a hot oven', 'bakes', 'is taken out']]);
      o = [{ html: food[0] + ' sits at room temperature, ' + food[1] + ' and heats up, stays hot while it ' + food[2] + ', then ' + food[3] + ' and cools, quickly at first and then more slowly.', right: true },
        { html: food[0] + ' ' + food[1] + ' right away, heats up, stays hot, cools down, then sits at room temperature.', why: 'The graph starts with a <b>flat</b> piece: the temperature stays the same for a while before it starts rising.' },
        { html: food[0] + ' sits at room temperature, ' + food[1] + ' and heats up, stays hot, then ' + food[3] + ' and cools at a steady rate.', why: 'The last piece is a <b>curve</b> that flattens out, not a straight line: it cools quickly at first, then more and more slowly.' },
        { html: food[0] + ' sits at room temperature, ' + food[1] + ' and keeps heating up the whole time it ' + food[2] + ', then ' + food[3] + ' and cools.', why: 'Look at the flat piece at the top: for a while the temperature doesn’t change.' }];
      sol = 'Flat at a low temperature (sitting at room temperature), rising (heating), flat at the top (staying hot), then a curve that falls quickly and flattens (cooling, quickly at first, then slowly). ' + o[0].html;
    } else {
      var g0 = r.int(14, 17) / 10, a2 = r.int(12, 18) / 10, lo = r.int(4, 7) / 10, b2 = a2 + r.int(7, 12) / 10, c2 = b2 + r.int(2, 4) / 10, full = r.int(18, 20) / 10, e2 = r.int(46, 50) / 10, end = r.int(8, 11) / 10;
      svg = sketchSvg([{ pts: [[0, g0 * 3], [a2, lo * 3], [b2, lo * 3], [c2, full * 3], [e2 * 2, end * 3]] }], null, 'Gas in tank');
      var who = r.pick(['A car', 'A delivery van', 'A pickup truck', 'A taxi']);
      o = [{ html: who + ' is driven and uses gas steadily, is parked (no gas used), is quickly filled up at a gas station, then is driven again.', right: true },
        { html: who + ' slows down, stops at a red light, speeds up quickly, then slows down again.', why: 'That reads the graph as <b>speed</b>. The vertical axis is the amount of <b>gas in the tank</b>.' },
        { html: who + ' is driven, is parked, then is filled up slowly over a long time, then is driven again.', why: 'The rise is very <b>steep</b>: the tank fills up quickly, as at a gas pump.' },
        { html: who + ' is parked, is driven and uses gas, is filled up, then is parked again.', why: 'The graph <b>falls</b> first: gas is being used from the start, so it is being driven.' }];
      sol = 'Falling = gas being used (driving); flat = no gas used (parked); a steep rise = the tank filled quickly (a gas station); falling again = driving again. ' + o[0].html;
    }
    return P.mc(r, 'Which situation could this graph represent?' + svg, o, sol, ['Read the label on the vertical axis first. Then describe the graph piece by piece: rising, flat or falling — and how steeply.'], 'situation for a ' + kind + ' graph');
  }

  /* ================= RF1 · paper Q6: discrete or continuous ================= */
  var DISC = ['number of concert tickets sold, total ticket revenue', 'number of rows of seats, number of seats', 'number of people in a car, number of seatbelts in use', 'number of overdue books, total late fee',
    'number of students on a trip, number of buses needed', 'number of cupcakes bought, total cost', 'number of goals scored, points in the standings', 'number of songs downloaded, total cost', 'number of cars washed, money raised'];
  var CONT = ['time an oven has been on, oven temperature', 'mass of apples bought, cost of the apples', 'distance hiked, time taken', 'time since a snowstorm began, depth of the snow',
    'time since a tap was turned on, volume of water in the tub', 'time driven, distance travelled', 'amount of gas pumped, cost of the gas', 'time since a candle was lit, height of the candle', 'age of a tree, height of the tree'];
  var DCOLS = [{ id: 'D', html: '<b>Discrete</b>: don’t join the points' }, { id: 'C', html: '<b>Continuous</b>: join the points' }];
  function q6Part(r) {
    var nd = r.pick([1, 2, 2]), rows = r.shuffle(r.sample(DISC, nd).map(function (s) { return { s: s, k: 'D' }; }).concat(r.sample(CONT, 3 - nd).map(function (s) { return { s: s, k: 'C' }; })));
    var want = {}, by = {}; rows.forEach(function (x, i) { want['r' + i] = x.k; by['r' + i] = x; });
    var why = function (id) { var x = by[id]; return { code: 'u5t-dc', hint: '“' + x.s + '”: ' + (x.k === 'D' ? 'the first quantity is a <b>count</b> — only whole numbers make sense (no 2.5 of them), so it is discrete and the points are not joined.' : 'the first quantity is <b>measured</b> — every value in between makes sense (like 2.5), so it is continuous and the points are joined.') }; };
    var L = ['(a)', '(b)', '(c)'];
    return gridPart('Is each relation <b>discrete</b> or <b>continuous</b>? Should the points on its graph be joined?<br>' + rows.map(function (x, i) { return '<b>' + L[i] + '</b> ' + x.s; }).join('<br>'), rows.map(function (x, i) { return { id: 'r' + i, html: L[i] }; }), DCOLS, want, why,
      rows.map(function (x) { return x.s + ': ' + (x.k === 'D' ? '<b>discrete</b> — the first quantity is counted (whole numbers only), so don’t join the points.' : '<b>continuous</b> — the first quantity is measured, every in-between value makes sense, so join the points.'); }).join('<br>'),
      ['Can the first quantity be a value like 2.5? If yes, it is continuous; if only whole numbers make sense, it is discrete.'], 'discrete or continuous: 3 relations', 'u5t-dc-one', 'u5t-dc');
  }

  /* ================= RF1 · paper Q7: a container filling ================= */
  var CONT_SVG = { vase: 'M8 8 L30 70 L50 70 L72 8', flask: 'M30 8 L8 70 L72 70 L50 8', bottle: 'M32 6 L32 36 L10 36 L10 70 L70 70 L70 36 L48 36 L48 6', planter: 'M8 6 L8 38 L30 38 L30 70 L50 70 L50 38 L72 38 L72 6' };
  var CONT_NAME = { vase: 'vase', flask: 'flask', bottle: 'bottle', planter: 'container' };
  function contSvg(kind) { return '<svg class="fig-svg" viewBox="0 0 80 76" style="max-width:92px" role="img" aria-label="the ' + CONT_NAME[kind] + '"><rect width="80" height="76" fill="#fff"/><path d="' + CONT_SVG[kind] + '" fill="#e6f2f1" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/></svg>'; }
  var FILLG = {
    straight: { segs: [{ pts: [[0, 0], [9, 5]] }] }, down: { fns: [{ f: function (x) { return 5 * Math.pow(x / 9, 0.5); }, from: 0, to: 9 }] }, up: { fns: [{ f: function (x) { return 5 * Math.pow(x / 9, 2); }, from: 0, to: 9 }] },
    sf: { segs: [{ pts: [[0, 0], [6.2, 2.5], [9, 5]] }] }, fs: { segs: [{ pts: [[0, 0], [2.8, 2.5], [9, 5]] }] } };
  function fillSvg(k) { var g = FILLG[k]; return HW.graph({ x: [0, 10], y: [0, 6], grid: 0, labels: 0, firstQuadrant: true, xName: ' ', yName: ' ', xTitle: 'Time', yTitle: 'Height', unit: 15, segs: g.segs || [], fns: g.fns || [], max: 170, aria: 'graph of height against time' }); }
  function q7Part(r) {
    var kind = r.pick(['vase', 'flask', 'bottle', 'planter']), nm = CONT_NAME[kind];
    var set = { vase: ['down', 'straight', 'up'], flask: ['up', 'straight', 'down'], bottle: ['sf', 'straight', 'fs'], planter: ['fs', 'straight', 'sf'] }[kind];
    var order = r.shuffle(set), lab = {}; order.forEach(function (k, i) { lab[k] = '(' + ['i', 'ii', 'iii'][i] + ')'; });
    var R = set[0], W = set[2], g = function (k) { return 'Graph ' + lab[k]; };
    var o = {
      vase: [{ html: g(R) + ': the vase is narrow at the bottom, so the water rises quickly at first; as it widens, the height rises more and more slowly.', right: true },
        { html: g(W) + ': the vase is narrow at the bottom, so the water rises slowly at first, then faster as the vase widens.', why: 'A narrow part fills <b>fast</b>: the same water makes a taller layer. As the vase widens, the rise slows down.' },
        { html: g('straight') + ': the water is poured at a constant rate, so the height rises at a constant rate.', why: 'A constant pour gives a constant rise only when the width never changes. This vase gets wider toward the top.' },
        { html: g(R) + ': the vase gets wider toward the top, so the water rises faster and faster.', why: 'Right graph, wrong reason: wider means each second’s water makes a <b>thinner</b> layer, so the height rises more slowly — that is why the graph flattens.' }],
      flask: [{ html: g(R) + ': the flask is wide at the bottom, so the water rises slowly at first; as it narrows, the height rises faster and faster.', right: true },
        { html: g(W) + ': the flask is wide at the bottom, so the water rises quickly at first, then slows down.', why: 'A wide part fills <b>slowly</b>: the water spreads into a thin layer. As the flask narrows, the rise speeds up.' },
        { html: g('straight') + ': the water is poured at a constant rate, so the height rises at a constant rate.', why: 'A constant pour gives a constant rise only when the width never changes. This flask narrows toward the top.' },
        { html: g(R) + ': the water gets heavier as the flask fills, so it rises faster and faster.', why: 'Right graph, wrong reason: the weight of the water has nothing to do with it. The height rises faster because the flask gets <b>narrower</b>.' }],
      bottle: [{ html: g(R) + ': the wide bottom part fills at a slow, steady rate (a gentle straight piece), then the narrow neck fills at a faster steady rate (a steeper straight piece).', right: true },
        { html: g(W) + ': the wide bottom part fills fast, then the narrow neck fills slowly.', why: 'Wide fills <b>slowly</b> and narrow fills <b>fast</b>: the same water makes a thinner layer in a wide part.' },
        { html: g('straight') + ': the water is poured at a constant rate, so the height rises at a constant rate.', why: 'The width changes suddenly at the shoulder, so the steepness has to change there.' },
        { html: g(R) + ': the water slows down when it reaches the neck, so the graph gets steeper.', why: 'Right graph, wrong reason: the tap’s rate never changes. The graph gets steeper because the neck is <b>narrower</b>.' }],
      planter: [{ html: g(R) + ': the narrow bottom part fills at a fast, steady rate (a steep straight piece), then the wide top part fills at a slower steady rate (a gentler straight piece).', right: true },
        { html: g(W) + ': the narrow bottom part fills slowly, then the wide top part fills fast.', why: 'Narrow fills <b>fast</b> and wide fills <b>slowly</b>: the same water makes a taller layer in a narrow part.' },
        { html: g('straight') + ': the water is poured at a constant rate, so the height rises at a constant rate.', why: 'The width changes suddenly half way up, so the steepness has to change there.' },
        { html: g(R) + ': the water pressure drops as the container fills, so the water comes in more slowly.', why: 'Right graph, wrong reason: the water is poured at a constant rate the whole time. The graph flattens because the top part is <b>wider</b>.' }] }[kind];
    var fig = '<div style="display:flex;flex-wrap:wrap;gap:4px 14px;align-items:flex-end"><div><b>The ' + nm + '</b>' + contSvg(kind) + '</div>' + order.map(function (k) { return '<div style="flex:1 1 140px;max-width:180px"><b>' + lab[k] + '</b>' + fillSvg(k) + '</div>'; }).join('') + '</div>';
    return P.mc(r, 'Water is poured at a constant rate into this ' + nm + '. Which graph shows the <b>height</b> of the water over time? Choose the answer with the correct reason.' + fig, o,
      'The same volume of water arrives every second. Where the ' + nm + ' is <b>narrow</b>, that water makes a tall layer (the height rises fast, steep graph); where it is <b>wide</b>, it makes a thin layer (slow rise, gentle graph). ' + o[0].html,
      ['Picture pouring a cup of water into a narrow glass and into a wide bowl. Which rises faster?'], 'container: ' + kind);
  }

  /* ================= RF1 · paper Q8: a linear situation graph ================= */
  function niceStep(V, lo, hi) { var c = [1, 2, 4, 5, 6, 8, 10, 12, 15, 20, 25, 40, 50, 60, 80, 100, 120, 150, 160, 200, 250, 300, 400, 500]; for (var i = 0; i < c.length; i++) if (V % c[i] === 0 && V / c[i] >= lo && V / c[i] <= hi) return c[i]; return V / 5; }
  function q8Shared(r) {
    var kind = r.pick(['gas', 'gas', 'trip', 'laptop', 'tank']), y0, x0;
    if (kind === 'gas') { var pr = r.pick([[60, 750], [50, 500], [48, 600], [40, 800], [60, 1000], [45, 750], [70, 1000], [64, 800], [56, 700], [72, 900], [36, 600], [40, 500]]); y0 = pr[0]; x0 = pr[1]; }
    else if (kind === 'trip') { var vv = find(function () { return [r.pick([60, 70, 80, 90, 100]), r.pick([4, 5, 6, 8])]; }, function (q) { return q[0] * q[1] >= 240 && q[0] * q[1] <= 800; }, [80, 6]); y0 = vv[0] * vv[1]; x0 = vv[1]; }
    else if (kind === 'laptop') { var lp = find(function () { return [r.pick([1200, 1500, 1800, 2000, 2400, 3000]), r.pick([4, 5, 6])]; }, function (q) { return (q[0] / q[1]) % 50 === 0; }, [1500, 5]); y0 = lp[0]; x0 = lp[1]; }
    else { var tk = find(function () { return [r.pick([300, 400, 450, 500, 600, 800]), r.pick([10, 15, 20, 25, 30])]; }, function (q) { return (q[0] / q[1]) % 1 === 0; }, [600, 20]); y0 = tk[0]; x0 = tk[1]; }
    return { kind: kind, y0: y0, x0: x0, gx: kind === 'gas' ? x0 / 5 : kind === 'tank' ? 5 : 1, gy: niceStep(y0, 4, 8) };
  }
  var Q8 = {
    gas: { xv: 'd', yv: 'V', xu: 'km', yu: 'L', xT: 'd (km)', yT: 'V (L)', rateU: 'L/km', scale: 100,
      intro: function () { return 'The graph shows the gas, ' + t('V') + ', left in a car’s tank after it is driven ' + t('d') + ' km.'; },
      vint: function (s) { return 'The tank holds ' + t(s.y0) + ' L of gas at the start, before any driving.'; }, hint: function (s) { return 'The tank is empty after ' + t(s.x0) + ' km of driving.'; },
      d1: function (s) { return 'The car has already driven ' + t(s.y0) + ' km when the graph starts.'; }, d2: function (s) { return 'The tank holds ' + t(s.x0) + ' L of gas when it is full.'; },
      interp: function () { return 'For every ' + t('100') + ' km driven, the car uses'; }, interpU: 'L of gas',
      lo: 'the distance driven can’t be negative: the trip starts at 0 km', hi: 'the tank is empty, so the car can’t drive any farther', w1: function (s) { return 'the tank only holds ' + s.y0 + ' L'; } },
    trip: { xv: 't', yv: 'D', xu: 'h', yu: 'km', xT: 't (h)', yT: 'D (km)', rateU: 'km/h', scale: 1,
      intro: function () { return 'The graph shows the distance, ' + t('D') + ', still to drive on a road trip, ' + t('t') + ' hours after leaving.'; },
      vint: function (s) { return 'The trip is ' + t(s.y0) + ' km long: that is the distance left at the start.'; }, hint: function (s) { return 'They arrive after ' + t(s.x0) + ' hours: no distance is left.'; },
      d1: function (s) { return 'They have already driven ' + t(s.y0) + ' km when the graph starts.'; }, d2: function (s) { return 'The car can drive for at most ' + t(s.x0) + ' hours a day.'; },
      interp: function () { return 'Each hour, the distance left to drive goes down by'; }, interpU: 'km',
      lo: 'time is measured from when they leave (t = 0)', hi: 'they have arrived: there is no distance left to drive', w1: function (s) { return 'the trip is ' + s.y0 + ' km long'; } },
    laptop: { xv: 't', yv: 'V', xu: 'years', yu: '$', xT: 't (years)', yT: 'V ($)', rateU: 'dollars per year', scale: 1,
      intro: function () { return 'The graph shows the value, ' + t('V') + ', of a laptop ' + t('t') + ' years after it was bought.'; },
      vint: function (s) { return 'The laptop cost ' + t('\\$' + s.y0) + ' when it was new.'; }, hint: function (s) { return 'The laptop is worth ' + t('\\$0') + ' after ' + t(s.x0) + ' years.'; },
      d1: function (s) { return 'The laptop is ' + t(s.y0) + ' years old when the graph starts.'; }, d2: function (s) { return 'The laptop loses ' + t('\\$' + s.x0) + ' of value each year.'; },
      interp: function () { return 'Each year, the laptop loses'; }, interpU: 'dollars of value',
      lo: 'time starts when the laptop is bought (t = 0)', hi: 'the value can’t drop below $0', w1: function (s) { return 'the laptop cost $' + s.y0; } },
    tank: { xv: 't', yv: 'W', xu: 'min', yu: 'L', xT: 't (min)', yT: 'W (L)', rateU: 'L/min', scale: 1,
      intro: function () { return 'The graph shows the volume of water, ' + t('W') + ', in a tank ' + t('t') + ' minutes after a valve is opened to drain it.'; },
      vint: function (s) { return 'The tank holds ' + t(s.y0) + ' L when the valve is opened.'; }, hint: function (s) { return 'The tank is empty after ' + t(s.x0) + ' minutes.'; },
      d1: function (s) { return 'The tank drains for ' + t(s.y0) + ' minutes.'; }, d2: function (s) { return 'The tank holds ' + t(s.x0) + ' L when it is full.'; },
      interp: function () { return 'Each minute, the amount of water that drains out is'; }, interpU: 'L',
      lo: 'time starts when the valve is opened (t = 0)', hi: 'the tank is empty: no more water can drain', w1: function (s) { return 'the tank holds ' + s.y0 + ' L'; } } };
  function q8Fig(s) {
    var c = Q8[s.kind], X = s.x0 + s.gx, Y = s.y0 + s.gy;
    return HW.graph({ x: [0, X], y: [0, Y], grid: s.gx, gridY: s.gy, labels: s.gx, labelsX: s.gx, labelsY: s.gy, firstQuadrant: true, unitX: 300 / X, unitY: 190 / Y, xName: c.xv, yName: c.yv, xTitle: c.xT, yTitle: c.yT,
      segs: [{ pts: [[0, s.y0], [s.x0, 0]] }], max: 420, aria: 'a decreasing straight-line graph' });
  }

  /* ================= RF2 · paper Q9: vertical line test ================= */
  function vltGraph(r, isFn) {
    var u = r.int(0, 4), f, fr;
    if (isFn) {
      if (u === 0) { var m = r.pick([-2, -1, -0.5, 0.5, 1, 2]), b = r.int(-2, 2); f = function (x) { return m * x + b; }; return { spec: { fns: [{ f: f, from: -4.8, to: 4.8, start: 'arrow', end: 'arrow' }] }, fn: true, why: 'a slanted line: every vertical line crosses it exactly once' }; }
      if (u === 1) { var h = r.int(-1, 1), k = r.int(-3, 1), a = r.pick([0.5, 1]); return { spec: { fns: [{ f: function (x) { return k + a * (x - h) * (x - h); }, from: -4.8, to: 4.8, start: 'arrow', end: 'arrow' }] }, fn: true, why: 'a parabola opening up: every vertical line crosses it at most once (a horizontal line crossing twice doesn’t matter)' }; }
      if (u === 2) { var h2 = r.int(-1, 1), k2 = r.int(-3, 0), s2 = r.pick([1, 1.5]); return { spec: { fns: [{ f: function (x) { return k2 + s2 * Math.abs(x - h2); }, from: -4.8, to: 4.8, start: 'arrow', end: 'arrow' }] }, fn: true, why: 'a V shape: every vertical line crosses it once' }; }
      if (u === 3) { var c = r.pick([-3, -2, 2, 3]); return { spec: { segs: [{ pts: [[-4.8, c], [4.8, c]], start: 'arrow', end: 'arrow' }] }, fn: true, why: 'a horizontal line: every vertical line crosses it once (every input has the output ' + t(c) + ')' }; }
      var k3 = r.int(-1, 1); return { spec: { fns: [{ f: function (x) { return k3 + 0.3 * x * x * x - 0.9 * x; }, from: -2.4, to: 2.4, start: 'arrow', end: 'arrow' }] }, fn: true, why: 'a curve that goes up, down and up again, but always moves to the right: every vertical line crosses it once' };
    }
    if (u === 0) { var h0 = r.int(-1, 1), k0 = r.int(-1, 1), R0 = r.pick([2, 2.5, 3]); return { spec: { segs: [{ pts: ell(h0, k0, R0, R0) }] }, fn: false, why: 'a circle: the vertical line ' + t('x=' + h0) + ' crosses it twice' }; }
    if (u === 1) { var hh = r.int(-3, -1), kk = r.int(-1, 1), aa = r.pick([0.4, 0.5]), pts = []; for (var i = 0; i <= 60; i++) { var y = kk - 3 + 6 * i / 60; pts.push([hh + aa * (y - kk) * (y - kk) * 1.6, y]); } return { spec: { segs: [{ pts: pts, start: 'arrow', end: 'arrow' }] }, fn: false, why: 'a sideways parabola: a vertical line to the right of its vertex crosses it twice' }; }
    if (u === 2) { var c4 = r.pick([-3, -2, 1, 2, 3]); return { spec: { segs: [{ pts: [[c4, -4.8], [c4, 4.8]], start: 'arrow', end: 'arrow' }] }, fn: false, why: 'a vertical line: the input ' + t(c4) + ' has every ' + t('y') + ' as an output' }; }
    if (u === 3) { var he = r.int(-1, 1), ke = r.int(-1, 1); return { spec: { segs: [{ pts: ell(he, ke, 3.2, 1.6) }] }, fn: false, why: 'an oval: the vertical line ' + t('x=' + he) + ' crosses it twice' }; }
    var hv = r.int(-2, 0), kv = r.int(-1, 1); return { spec: { segs: [{ pts: [[hv + 3.5, kv + 3.5], [hv, kv], [hv + 3.5, kv - 3.5]], start: 'arrow', end: 'arrow' }] }, fn: false, why: 'a sideways V: a vertical line to the right of its corner crosses it twice' };
  }
  function vltSmall(spec) { return HW.graph(Object.assign({ x: [-5, 5], y: [-5, 5], labels: 0, grid: 1, max: 165, aria: 'graph of a relation' }, spec)); }

  /* ================= RF2 · paper Q13: a relation and its reverse ================= */
  var REL = [
    { a: function (r) { return 'pairs each student in ' + r.pick(['Ms. Lee', 'Mr. Singh', 'Mrs. Roy', 'Mr. Park', 'Ms. Diaz']) + '’s class with the <b>month</b> they were born'; }, inp: 'student', inps: 'students', out: 'month', outs: 'months', fwd: true, rev: false, revWhy: 'A month can be paired with two or more students born in it (in almost any class), so one input would have several outputs.' },
    { a: function (r) { return 'pairs each player on the ' + r.pick(['Oilers', 'Flames', 'Canucks', 'Jets', 'school hockey team']) + ' with their <b>jersey number</b>'; }, inp: 'player', inps: 'players', out: 'jersey number', outs: 'jersey numbers', fwd: true, rev: true, revWhy: 'On one team no two players share a number, so each number is paired with exactly one player.' },
    { a: function (r) { return 'pairs each house on ' + r.pick(['Maple Street', 'Elm Avenue', 'Spruce Drive', 'your street']) + ' with the <b>number of people</b> living in it'; }, inp: 'house', inps: 'houses', out: 'number of people', outs: 'numbers', fwd: true, rev: false, revWhy: 'Two houses can have the same number of people (e.g. 4), so one number would be paired with several houses.' },
    { a: function (r) { return 'pairs each student at ' + r.pick(['your school', 'Ridgeview High', 'Lakeside School']) + ' with their <b>locker number</b> (every student has their own locker)'; }, inp: 'student', inps: 'students', out: 'locker number', outs: 'locker numbers', fwd: true, rev: true, revWhy: 'Each locker belongs to exactly one student, so each locker number is paired with one student.' },
    { a: function (r) { return 'pairs each student in ' + r.pick(['Grade 10', 'your math class', 'the band']) + ' with the <b>sports they play</b>'; }, inp: 'student', inps: 'students', out: 'sport', outs: 'sports', fwd: false, rev: false, fwdWhy: 'A student can play two or more sports, so one input can have several outputs.', revWhy: 'A sport is played by several students, so one input would have several outputs.' },
    { a: function (r) { return 'pairs each teacher at ' + r.pick(['your school', 'Ridgeview High', 'Lakeside School']) + ' with the <b>classes they teach</b> (each class has one teacher)'; }, inp: 'teacher', inps: 'teachers', out: 'class', outs: 'classes', fwd: false, rev: true, fwdWhy: 'A teacher usually teaches several classes, so one input has several outputs.', revWhy: 'Each class has exactly one teacher, so each class (input) is paired with one teacher.' },
    { a: function (r) { return 'pairs each ' + r.pick(['Canadian province', 'country in Europe', 'country in South America']) + ' with its <b>capital city</b>'; }, inp: 'place', inps: 'places', out: 'capital', outs: 'capitals', fwd: true, rev: true, revWhy: 'Each capital city is the capital of exactly one of them, so each capital is paired with one place.' },
    { a: function (r) { return 'pairs each person in ' + r.pick(['your family', 'your class', 'a hockey team']) + ' with their <b>date of birth</b>'; }, inp: 'person', inps: 'people', out: 'date of birth', outs: 'dates', fwd: true, rev: false, revWhy: 'Two people (twins, for example) can share a date of birth, so one date could be paired with several people.' },
    { a: function (r) { return 'pairs each student in ' + r.pick(['your school', 'Grade 10', 'Ridgeview High']) + ' with their <b>homeroom teacher</b>'; }, inp: 'student', inps: 'students', out: 'homeroom teacher', outs: 'teachers', fwd: true, rev: false, revWhy: 'A homeroom teacher has many students, so one input would have several outputs.' },
    { a: function (r) { return 'pairs each car in ' + r.pick(['Alberta', 'a parking lot', 'your neighbourhood']) + ' with its <b>licence plate</b>'; }, inp: 'car', inps: 'cars', out: 'licence plate', outs: 'licence plates', fwd: true, rev: true, revWhy: 'Each licence plate belongs to exactly one car, so each plate is paired with one car.' }];
  function relMC(r, c, fwd, verdict, why) {
    var inp = fwd ? c.inp : c.out, out = fwd ? c.out : c.inp, inps = fwd ? c.inps : c.outs, outs = fwd ? c.outs : c.inps;
    var o = verdict ? [
      { html: '<b>Yes.</b> Each ' + inp + ' (input) is paired with exactly one ' + out + ' (output).', right: true },
      { html: '<b>No.</b> Two different ' + inps + ' can be paired with the same ' + out + '.', why: 'Sharing an output is allowed. The test asks whether one <b>input</b> can have more than one output.' },
      { html: '<b>Yes.</b> Every ' + out + ' is paired with at least one ' + inp + '.', why: 'Right verdict, wrong reason: that sentence is about the outputs. A function needs each <b>input</b> to have exactly one output.' },
      { html: '<b>No.</b> There are not the same number of ' + inps + ' and ' + outs + '.', why: 'The sizes don’t decide it. Ask: can one ' + inp + ' be paired with two different ' + outs + '?' }] : [
      { html: '<b>No.</b> One ' + inp + ' (input) can be paired with two or more ' + outs + ' (outputs).', right: true },
      { html: '<b>Yes.</b> Every ' + inp + ' is paired with at least one ' + out + '.', why: 'Having an output isn’t enough: a function needs each input to have <b>exactly one</b> output. Can one ' + inp + ' have two?' },
      { html: '<b>Yes.</b> Each ' + out + ' comes from one ' + inp + '.', why: 'That is about outputs, not inputs. Can one ' + inp + ' be paired with several ' + outs + '?' },
      { html: '<b>No.</b> Two different ' + inps + ' can be paired with the same ' + out + '.', why: 'Right verdict, wrong reason: sharing an output is allowed. The problem is one ' + inp + ' with several ' + outs + '.' }];
    return o;
  }

  /* ================= RF2 · paper Q14: examples of ordered pairs ================= */
  function readPairs(resp) {
    var s = String(resp || '').replace(/\\(left|right)\.?/g, '').replace(/\\lparen/g, '(').replace(/\\rparen/g, ')').replace(/\\lbrace|\\rbrace|\\\{|\\\}|[{}]/g, ' ').replace(/\\[,;: ]/g, ' ');
    if (!s.trim()) return { empty: true };
    var re = /\(([^()]*)\)/g, m, out = [];
    while ((m = re.exec(s))) {
      var xy = m[1].split(','); if (xy.length !== 2) return { bad: true };
      var a = ex.parse(xy[0].trim()), b = ex.parse(xy[1].trim()); if (!a.ok || !b.ok) return { bad: true };
      out.push([ex.value(a.ast), ex.value(b.ast)]);
    }
    if (s.replace(re, '').replace(/[,\s]/g, '').length || !out.length) return { bad: true };
    var seen = {}, u = []; out.forEach(function (p) { var k = nT(p[0]) + '|' + nT(p[1]); if (!seen[k]) { seen[k] = 1; u.push(p); } });
    return { pairs: u };
  }
  function isNoneS(s) { var z = String(s == null ? '' : s).replace(/\\text\{\s*([^}]*)\}|\\mathrm\{\s*([^}]*)\}/g, '$1$2').replace(/\s+/g, '').toLowerCase(); return /^(none|no|nofunction|impossible|notpossible|dne|n\/a|∅|\\emptyset|\\varnothing)$/.test(z); }
  function setEqA(a, b) { var A = uniq(a), B = uniq(b); return A.length === B.length && A.every(function (x, i) { return same(x, B[i]); }); }

  /* ================= RF8 helpers ================= */
  var EQK = 'u5l8eq', Wd = HW.widgets;
  if (Wd && Wd.KEYSETS && !Wd.KEYSETS[EQK]) {
    var dk = function (n) { return { label: String(n), tex: String(n), plain: String(n) }; };
    Wd.KEYSETS[EQK] = function (opt) {
      var vs = (opt && opt.vars && opt.vars.length ? opt.vars : ['x', 'y']).slice(0, 6).map(function (v) { return { label: '<i>' + v + '</i>', tex: v, plain: v }; });
      return [[dk(7), dk(8), dk(9), { label: '+', tex: '+', plain: '+' }, { label: '−', tex: '-', plain: '-' }, { label: '⌫', fn: 'del', title: 'Delete' }],
        [dk(4), dk(5), dk(6), { label: 'x<sup>2</sup>', tex: '^{2}', plain: '^2', title: 'Squared' }, { label: '<sup>a</sup>⁄<sub>b</sub>', tex: '\\frac{#@}{#?}', plain: '/', title: 'Fraction' }, { label: 'clear', fn: 'clear' }],
        [dk(1), dk(2), dk(3), { label: '( )', tex: '\\left(#0\\right)', plain: '(', title: 'Brackets' }, { label: '◀', fn: 'left', title: 'Move left' }, { label: '▶', fn: 'right', title: 'Move right (out of a box)' }],
        [dk(0), { label: '.', tex: '.', plain: '.' }, { label: '=', tex: '=', plain: ' = ' }, { label: 'Check ↵', fn: 'enter', wide: true }], vs];
    };
    if (Wd.KEYHELP && !Wd.KEYHELP[EQK]) Wd.KEYHELP[EQK] = ['Type the whole equation with the <b>=</b> key. For function notation tap the letter, then <b>( )</b>, the input letter, and <b>▶</b> to step out, e.g. ' + HW.k('f(x)=2x-3') + '.', 'Type the whole equation, e.g. <code>f(x) = 2x - 3</code> or <code>y = 2x - 3</code>.'];
  }
  function clean(s) { return String(s == null ? '' : s).replace(/\\left|\\right/g, '').replace(/\\lparen/g, '(').replace(/\\rparen/g, ')').replace(/\\[,;:! ]|~/g, ' ').replace(/\\cdot/g, '\\times ').trim(); }
  function lhsInfo(L) {
    L = L.replace(/\s+/g, '');
    var m = /^([A-Za-z])\(([^()]*)\)$/.exec(L); if (m) return { kind: 'fn', name: m[1], arg: m[2] };
    if (/^[A-Za-z]$/.test(L)) return { kind: 'var', name: L };
    return { kind: 'other' };
  }
  function lettersOf(s) { var o = {}; String(s).replace(/(\\[a-zA-Z]+)|([a-zA-Z])/g, function (m, cmd, ch) { if (ch) o[ch] = 1; return m; }); return Object.keys(o); }
  function relabel(s, from, to) { return String(s).replace(/(\\[a-zA-Z]+)|(?<![a-zA-Z])([a-zA-Z])(?![a-zA-Z])/g, function (m, cmd, ch) { return cmd ? cmd : ch === from ? to : ch; }); }
  /* conversions (as in Lesson 7): mode 'xy' (answer y = …) or 'fn' (answer f(v) = …) */
  function convChk(mode, o) {
    var v = o.v || 'x', out = o.out || 'y';
    var ws = (o.wrong || []).filter(function (w) { return w && !PL.eq(w.is, o.T); });
    var base = K.poly(o.T, { wrong: ws });
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
      var rl = lettersOf(R).filter(function (c) { return c !== v; }), rr = base(R);
      if (rr.v !== 'correct' && rl.length === 1 && lettersOf(R).indexOf(v) < 0) { var alt = base(relabel(R, rl[0], v)); if (alt.v === 'correct') return wrong('conv-var', 'The input variable never changes when you convert: keep ' + t(v) + ' on the right side (you wrote ' + t(rl[0]) + ').'); }
      if (mode === 'xy') {
        if (li.kind === 'fn') return wrong('conv-still-fn', t(li.name + '(' + li.arg + ')') + ' is function notation. To write an equation in two variables, replace ' + t(li.name + '(' + li.arg + ')') + ' with ' + t(out) + '.');
        if (li.name !== out) return form('conv-out', 'Use ' + t(out) + ' for the output: start with ' + t(out + '=') + '.');
      } else {
        if (li.kind === 'var') return wrong('conv-still-y', t(li.name) + ' is an output variable, so this is still ' + t('x') + '-' + t('y') + ' notation. Replace ' + t(li.name) + ' with function notation: ' + want + '.');
        if (li.name === v) return form('conv-name', 'The function needs a name that isn’t the input letter, e.g. ' + t('f(' + v + ')') + '.');
        if (o.reqName && li.name !== o.name) return wrong('conv-name', 'The function is named ' + t(o.name) + ', so write ' + t(o.name + '(' + v + ')') + ', not ' + t(li.name + '(' + li.arg + ')') + '.');
        if (!o.reqName && (li.name === 'y' || li.name === out)) return form('conv-name', 'Name the function with a letter such as ' + t('f') + ': ' + t('f(' + v + ')') + '. (' + t(out) + ' is the output it replaces.)');
        if (li.arg !== v) return wrong('conv-arg', 'The brackets hold the <b>input</b> variable, ' + t(v) + '. Write ' + t((o.reqName ? o.name : li.name) + '(' + v + ')') + ', not ' + t(li.name + '(' + li.arg + ')') + '.');
      }
      return rr;
    };
  }
  function convPart(mode, prompt, o, sol, hints, text) {
    var v = o.v || 'x', name = o.name || 'f', out = o.out || 'y';
    var lhs = mode === 'xy' ? out : name + '(' + v + ')', key = lhs + '=' + o.keyRhs;
    var vars = [v].concat(mode === 'xy' ? [out] : [name]).concat(o.vars || []).filter(function (c, i, a) { return a.indexOf(c) === i; });
    var p = { prompt: prompt, input: { type: 'math', keys: EQK, vars: vars, placeholder: mode === 'xy' ? 'e.g. y = 2x - 3' : 'e.g. f(x) = 2x - 3' }, check: convChk(mode, o), key: key, answer: t(key), solution: sol, hints: hints || [], text: text };
    p.good = [o.keyRhs + '=' + lhs].concat(o.good || []);
    p.bad = (o.wrong || []).filter(function (w) { return !PL.eq(w.is, o.T); }).map(function (w) { return lhs + '=' + PL.tex(w.is); }).concat(o.bad || []);
    return p;
  }

  /* ================= RF2 · paper Q20: sketch a function (as in Lesson 4) ================= */
  var Dr = HW.draw;
  function isPt(p) { return Math.abs(p.lo - p.hi) < 1e-9; }
  function bndHint(got, want, v) {
    if (got.length !== want.length) return null;
    var nm = v === 'x' ? 'domain' : 'range', lowW = v === 'x' ? 'to the left' : 'down', highW = v === 'x' ? 'to the right' : 'up';
    for (var i = 0; i < want.length; i++) {
      var q = want[i], p = got[i];
      if (isPt(q) !== isPt(p)) return null;
      var sides = [[q.lo, p.lo, lowW], [q.hi, p.hi, highW]];
      for (var j = 0; j < 2; j++) {
        var W0 = sides[j][0], G0 = sides[j][1];
        if (!isFinite(W0) && isFinite(G0)) return 'The ' + nm + ' has no ' + (j ? 'upper' : 'lower') + ' end: the graph must keep going ' + sides[j][2] + ' forever. Finish it with an <b>arrow</b> (use <b>●○ Ends</b>).';
        if (isFinite(W0) && !isFinite(G0)) return 'Your graph goes on forever ' + sides[j][2] + ', but the ' + nm + ' stops at ' + t(v + '=' + W0) + '. End it with a dot there, not an arrow.';
        if (isFinite(W0) && Math.abs(W0 - G0) > 1e-9) return null;
      }
    }
    for (var k = 0; k < want.length; k++) {
      var a = want[k], b = got[k];
      if (isFinite(a.lo) && a.lc !== b.lc) return 'Your graph reaches the right values — now fix the dots: ' + t(v + '=' + a.lo) + ' must be ' + (a.lc ? '<b>included</b> (a solid dot)' : '<b>excluded</b> (a hollow dot, and no other point of the graph at that ' + t(v) + ')') + '.';
      if (isFinite(a.hi) && a.hc !== b.hc) return 'Your graph reaches the right values — now fix the dots: ' + t(v + '=' + a.hi) + ' must be ' + (a.hc ? '<b>included</b> (a solid dot)' : '<b>excluded</b> (a hollow dot, and no other point of the graph at that ' + t(v) + ')') + '.';
    }
    return null;
  }
  function sketchChk(rules) {
    var base = K.graphRules(rules);
    var dP = rules.domain ? Dr.setParts(S.parse(rules.domain).set) : null, rP = rules.range ? Dr.setParts(S.parse(rules.range).set) : null;
    return function (resp) {
      var res = base(resp); if (res.v !== 'wrong') return res;
      var v = Dr.norm(resp), dd = Dr.domain(v).parts, rr = Dr.range(v).parts, h;
      if (dP && rP && !Dr.partsSame(dP, rP) && Dr.partsSame(dd, rP) && Dr.partsSame(rr, dP)) return wrong('sk-swap', 'Your graph has the domain and range swapped. The <b>domain</b> is read along the ' + t('x') + '-axis (left to right), the <b>range</b> along the ' + t('y') + '-axis (bottom to top).');
      if (dP && !dP.every(isPt) && !v.pieces.length && v.join === 'none') return wrong('sk-points', 'Separate points only give a <b>list</b> of ' + t('x') + '-values. This domain is a whole interval, so draw a <b>line</b> (╱ Line) that uses every ' + t('x') + ' in between.');
      if (res.code === 'rule-domain' && dP) { h = bndHint(dd, dP, 'x'); if (h) return wrong('sk-ends', h); }
      if (res.code === 'rule-range' && rP) { h = bndHint(rr, rP, 'y'); if (h) return wrong('sk-ends', h); }
      return res;
    };
  }
  var SK_HELP = 'Use <b>╱ Line</b> to draw (tap each corner; tap the last point again to finish) and <b>●○ Ends</b> to make an end solid, hollow or an arrow.';

  /* ================= the questions, in the paper's order ================= */
  var QUESTIONS = [
    /* ======================= RF1 — BEG ======================= */
    { num: '1', outcome: 'RF1', shared: q1Shared, stem: q1Stem, parts: [
      { id: '1a', sub: 'a', outcome: 'RF1', level: 'BEG', make: function (r, s) { return q1Read(s); } },
      { id: '1b', sub: 'b', outcome: 'RF1', level: 'BEG', make: function (r, s) { return q1Times(s); } },
      { id: '1c', sub: 'c', outcome: 'RF1', level: 'BEG', make: function (r, s) { return q1Flat(r, s); } },
      { id: '1d', sub: 'd', outcome: 'RF1', level: 'BEG', make: function (r, s) { return q1Fall(r, s); } }] },

    /* ======================= RF1 — PRG ======================= */
    { num: '4', outcome: 'RF1', stem: 'Sketch the graph. Only the <b>shape</b> and the <b>times</b> matter, not the height.', parts: [
      { id: '4', outcome: 'RF1', level: 'PRG', make: function (r) {
        var s = q4Shared(r), c = s.c, a = s.a, b = s.b, cc = s.cc, tot = a + b + cc, X = Math.ceil((tot + 5) / 5) * 5 + 5;
        var st = c.id === 'walk' ? ['walking to ' + s.place, 'at ' + s.place, 'going home'] : c.st;
        var ph = [{ dir: 'up', text: st[0], x0: 0, x1: a }, { dir: 'flat', text: st[1], x1: a + b }, { dir: 'down', text: st[2], x1: tot, y1: 0 }];
        if (s.fast) ph[2].steeper = 0; else ph[0].steeper = 2;
        var chk = story({ phases: ph, start: 0, startHint: 'The graph starts at ' + t('0') + ': ' + (c.id === 'walk' ? 'at home' : 'on the ground') + ' at time ' + t('0') + '.', end: 0, endHint: 'It ends back at ' + t('0') + '.', xUnit: c.xu,
          prep: function (Gs) { Gs = Gs.slice(); if (Gs.length > 1 && Gs[Gs.length - 1].dir === 'flat' && Math.abs(Gs[Gs.length - 1].y0) < 1e-9) Gs.pop(); return Gs; } });
        var inp = { x: [0, X], y: [0, 6], grid: 5, gridY: 1, labels: X > 50 ? 10 : 5, labelsX: X > 50 ? 10 : 5, labelsY: 100, firstQuadrant: true, xName: 't', yName: ' ', xTitle: c.xT, yTitle: c.yT, unitX: 340 / X, unitY: 30,
          snapX: 5, snapY: 1, defaultEnd: 'none', tools: ['line'], max: 400, help: 'Tap where the graph starts, then each corner in turn, left to right; tap the last point again to finish.' };
        var key = poly([[0, 0], [a, 4], [a + b, 4], [tot, 0]]);
        var p = K.P.graph(c.text({ nm: s.nm, she: s.she, place: s.place, a: a, b: b, c: cc, fast: s.fast }), inp, chk, key,
          'Three straight pieces: up from ' + t('0') + ' to ' + t(a) + ' ' + c.xu + ' (' + st[0] + '), flat from ' + t(a) + ' to ' + t(a + b) + ' ' + c.xu + ' (' + st[1] + '), then down to ' + t('0') + ' at ' + t(tot) + ' ' + c.xu + ' (' + st[2] + '). ' +
          'The way back takes ' + t(cc) + ' ' + c.xu + ' instead of ' + t(a) + ', so that piece is ' + (s.fast ? '<b>steeper</b> (faster)' : '<b>less steep</b> (slower)') + ' than the first.',
          ['Mark the times where the motion changes: ' + t(a) + ', ' + t(a + b) + ' and ' + t(tot) + '.', 'Faster means steeper. Staying in one place means flat.'], 'sketch story: ' + c.id);
        p.answer = 'One possible sketch:' + p.answer;
        p.bad = [poly([[0, 0], [cc, 4], [cc + b, 4], [cc + b + a, 0]]), poly([[0, 0], [a, 4], [a + cc, 0]]), poly([[0, 0], [a, 4], [a + b, 5], [tot, 0]]), poly([[0, 4], [a, 0], [a + b, 0], [tot, 4]])].filter(function (q) { return chk(q).v !== 'correct'; });
        return p;
      } }] },
    { num: '5', outcome: 'RF1', stem: 'No numbers are needed: read the shape of the graph.', parts: [
      { id: '5', outcome: 'RF1', level: 'PRG', make: function (r) { return q5Part(r); } }] },
    { num: '6', outcome: 'RF1', stem: 'A relation is <b>discrete</b> when only separate values make sense, and <b>continuous</b> when every value in between makes sense too.', parts: [
      { id: '6', outcome: 'RF1', level: 'PRG', make: function (r) { return q6Part(r); } }] },

    /* ======================= RF1 — MAS ======================= */
    { num: '7', outcome: 'RF1', stem: 'The shape of a container decides how fast the water level rises.', parts: [
      { id: '7', outcome: 'RF1', level: 'MAS', make: function (r) { return q7Part(r); } }] },
    { num: '8', outcome: 'RF1', shared: q8Shared, stem: function (s) { return Q8[s.kind].intro() + q8Fig(s); }, parts: [
      { id: '8a', sub: 'a', outcome: 'RF1', level: 'MAS', make: function (r, s) {
        var c = Q8[s.kind], cols = r.shuffle([{ id: 'A', html: c.vint(s) }, { id: 'B', html: c.hint(s) }, { id: 'C', html: c.d1(s) }, { id: 'D', html: c.d2(s) }]);
        var want = { v: 'A', h: 'B' };
        var why = function (id) { return { code: 'u5t-mean', hint: id === 'v' ? 'The vertical intercept is where ' + t(c.xv + '=0') + ': the value of ' + t(c.yv) + ' at the start. Read its units on the vertical axis (' + c.yu + ').' : 'The horizontal intercept is where ' + t(c.yv + '=0') + ': the value of ' + t(c.xv) + ' when nothing is left. Read its units on the horizontal axis (' + c.xu + ').' }; };
        return gridPart('Explain what each intercept means: choose the meaning of each one.', [{ id: 'v', html: 'The vertical intercept, ' + t('(0,\\ ' + s.y0 + ')') }, { id: 'h', html: 'The horizontal intercept, ' + t('(' + s.x0 + ',\\ 0)') }], cols, want, why,
          t('(0,\\ ' + s.y0 + ')') + ': ' + c.vint(s) + '<br>' + t('(' + s.x0 + ',\\ 0)') + ': ' + c.hint(s) + '<br>Each intercept is a value of one quantity when the other is ' + t('0') + '; use the units on its own axis.',
          ['At the vertical intercept, ' + t(c.xv + '=0') + '. At the horizontal intercept, ' + t(c.yv + '=0') + '.'], 'meaning of intercepts: ' + s.kind, 'u5t-mean-one', 'u5t-mean');
      } },
      { id: '8b', sub: 'b', outcome: 'RF1', level: 'MAS', make: function (r, s) {
        var c = Q8[s.kind], rate = cl(-s.y0 / s.x0), mag = cl(Math.abs(rate) * c.scale);
        var rc = numChk(rate, [{ v: -rate, code: 'rate-sign', hint: 'Check the sign: the graph goes <b>down</b>, so the rate of change is negative.' }, { v: cl(s.x0 / s.y0), code: 'rate-flip', hint: 'Rate of change is <b>change in ' + t(c.yv) + ' ÷ change in ' + t(c.xv) + '</b> — your division is upside down.' }, { v: cl(-s.x0 / s.y0), code: 'rate-flip', hint: 'Rate of change is <b>change in ' + t(c.yv) + ' ÷ change in ' + t(c.xv) + '</b> — your division is upside down.' },
          { v: s.y0, code: 'u5t-rate-int', hint: 'That’s an intercept. The rate of change is the change in ' + t(c.yv) + ' divided by the change in ' + t(c.xv) + ' between the two intercepts.' }, { v: -s.y0, code: 'u5t-rate-int', hint: 'That’s only the change in ' + t(c.yv) + '. Divide it by the change in ' + t(c.xv) + '.' }]);
        var ic = numChk(mag, [{ v: -mag, code: 'u5t-interp-sign', hint: 'The sentence already says the amount goes <b>down</b> (or is used up), so give the amount as a positive number.' },
          c.scale !== 1 ? { v: Math.abs(rate), code: 'u5t-interp-scale', hint: 'That is the amount for <b>1</b> km. How much for ' + t(c.scale) + ' km?' } : { v: null }]);
        var p = P.fields('Find the rate of change, then explain what it means by completing the sentence.',
          [{ name: 'Rate of change', label: 'Rate of change:', after: c.rateU }, { name: 'Meaning', label: c.interp(), after: c.interpU }], [rc, ic], [nT(rate), nT(mag)],
          'rate ' + t(nT(rate)) + ' ' + c.rateU + '; ' + c.interp() + ' ' + t(nT(mag)) + ' ' + c.interpU,
          'Rate of change ' + t('=\\dfrac{\\Delta ' + c.yv + '}{\\Delta ' + c.xv + '}=\\dfrac{0-' + s.y0 + '}{' + s.x0 + '-0}=' + nT(rate)) + ' ' + c.rateU + '. It is negative because the quantity goes down.<br>' + c.interp() + ' ' + t((c.scale !== 1 ? c.scale + '\\times ' + nT(Math.abs(rate)) + '=' : '') + nT(mag)) + ' ' + c.interpU + '.',
          ['Use the two intercepts: rate ' + t('=\\dfrac{\\text{change in }' + c.yv + '}{\\text{change in }' + c.xv + '}') + '.', 'The units of the rate are (units of ' + t(c.yv) + ') per (unit of ' + t(c.xv) + ').'], 'rate of change: ' + s.kind);
        p.bad = [[nT(-rate), nT(mag)], [nT(rate), nT(-mag)], [nT(cl(s.x0 / s.y0)), nT(mag)]];
        return p;
      } },
      { id: '8ci', sub: 'c i', outcome: 'RF1', level: 'MAS', make: function (r, s) {
        var c = Q8[s.kind], D = bld(c.xv, 0, s.x0), Rr = bld(c.yv, 0, s.y0);
        return setPart('State the domain in set notation. Use the variable ' + t(c.xv) + '.', D, { v: c.xv, other: Rr, otherName: 'range', wrong: [{ is: bld(c.xv, 0, null), code: 'set-arrow', hint: 'The graph stops at ' + t('(' + s.x0 + ',\\ 0)') + ': the situation ends there, so the domain has an upper end.' }] },
          'The graph runs from ' + t(c.xv + '=0') + ' to ' + t(c.xv + '=' + s.x0) + ', and ' + t(c.xv) + ' is measured (continuous): ' + t('D=' + D) + '.', ['Domain: the values of ' + t(c.xv) + ' (horizontal axis) from where the graph starts to where it stops.'], 'domain: ' + s.kind);
      } },
      { id: '8cii', sub: 'c ii', outcome: 'RF1', level: 'MAS', make: function (r, s) {
        var c = Q8[s.kind], cols = r.shuffle([{ id: 'L', html: c.lo }, { id: 'H', html: c.hi }, { id: 'W', html: c.w1(s) }, { id: 'E', html: 'the graph reaches the edge of the grid' }]);
        var why = function (id) { return { code: 'u5t-why', hint: id === 'lo' ? 'The lower end, ' + t(c.xv + '=0') + ', is where the situation starts: ' + c.lo + '.' : 'The upper end, ' + t(c.xv + '=' + s.x0) + ', is where the graph meets the horizontal axis: ' + c.hi + '.' }; };
        return gridPart('Why is the domain restricted? Choose the reason for each end.', [{ id: 'lo', html: 'It starts at ' + t(c.xv + '=0') + ' because…' }, { id: 'hi', html: 'It stops at ' + t(c.xv + '=' + s.x0) + ' because…' }], cols, { lo: 'L', hi: 'H' }, why,
          'Lower end: ' + c.lo + '. Upper end: ' + c.hi + '. Past ' + t(c.xv + '=' + s.x0) + ' the line would give negative values of ' + t(c.yv) + ', which make no sense here.',
          ['What would a value of ' + t(c.xv) + ' below ' + t('0') + ' mean? What would the graph give past ' + t(c.xv + '=' + s.x0) + '?'], 'why the domain is restricted: ' + s.kind, 'u5t-why-one', 'u5t-why');
      } }] },

    /* ======================= RF2 part 1 — BEG ======================= */
    { num: '9', outcome: 'RF2', stem: 'Use the vertical line test.', parts: [
      { id: '9', outcome: 'RF2', level: 'BEG', make: function (r) {
        var nf = r.chance(0.7) ? 2 : r.pick([1, 3]), kinds = r.shuffle([true, true, true, false, false, false].slice(3 - nf, 7 - nf)), gs = kinds.map(function (f) { return vltGraph(r, f); });
        var labs = ['(i)', '(ii)', '(iii)', '(iv)'], want = {}, rows = gs.map(function (g, i) { want['g' + i] = g.fn ? 'Y' : 'N'; return { id: 'g' + i, html: labs[i] }; });
        var why = function (id) { var i = Number(id.slice(1)), g = gs[i]; return { code: 'u5t-vlt', hint: 'Graph ' + labs[i] + ' is ' + g.why + '.' }; };
        var p = gridPart('Is each graph a function? Choose <b>Yes</b> or <b>No</b>.' + bank(gs.map(function (g, i) { return { label: labs[i], svg: vltSmall(g.spec) }; }), 2), rows, [{ id: 'Y', html: 'Yes' }, { id: 'N', html: 'No' }], want, why,
          gs.map(function (g, i) { return labs[i] + ': ' + g.why + ' — <b>' + (g.fn ? 'yes' : 'no') + '</b>.'; }).join('<br>'),
          ['Imagine sliding a vertical line across each graph. If it ever crosses the graph twice, the graph is not a function.'], 'vertical line test: 4 graphs', 'u5t-vlt-one', 'u5t-vlt');
        p.answer = gs.map(function (g, i) { return labs[i] + ' ' + (g.fn ? 'Yes' : 'No'); }).join(', ');
        return p;
      } }] },
    { num: '10', outcome: 'RF2',
      shared: function (r) {
        return find(function () {
          var xs = r.sample(range(-3, 9), 4).sort(function (a, b) { return a - b; }), y3 = r.sample(range(0, 9), 3), pat = r.pick([[0, 1, 0, 2], [0, 1, 2, 1], [0, 1, 2, 0], [0, 0, 1, 2], [0, 1, 1, 2]]);
          return { xs: xs, ys: pat.map(function (i) { return y3[i]; }) };
        }, function (s) { return s.xs[3] - s.xs[0] <= 9; }, { xs: [1, 2, 3, 4], ys: [5, 8, 5, 2] });
      },
      stem: function (s) { return 'The table shows a relation.' + HW.valueTable([[t('x')].concat(s.xs.map(function (x) { return t(x); })), [t('y')].concat(s.ys.map(function (y) { return t(y); }))]); },
      parts: [
        { id: '10a', sub: 'a', outcome: 'RF2', level: 'BEG', make: function (r, s) {
          var pairs = s.xs.map(function (x, i) { return [x, s.ys[i]]; });
          var p = K.P.pairs('Write the relation as a set of ordered pairs.', pairs, {}, 'Each column of the table is one ordered pair ' + t('(x,\\ y)') + ': ' + t(setT(pairs)) + '.', ['Each column gives one pair: the top number first, then the bottom number.'], 'table to ordered pairs');
          p.bad = ['\\{' + pairs.map(function (q) { return '(' + q[1] + ', ' + q[0] + ')'; }).join(', ') + '\\}', '\\{' + pairs.slice(1).map(function (q) { return '(' + q[0] + ', ' + q[1] + ')'; }).join(', ') + '\\}'];
          return p;
        } },
        { id: '10b', sub: 'b', outcome: 'RF2', level: 'BEG', make: function (r, s) {
          var pairs = s.xs.map(function (x, i) { return [x, s.ys[i]]; }), right = uniq(s.ys);
          var p = K.P.arrows('Draw arrows to complete the mapping diagram: tap a value on the left, then its partner on the right.', { left: s.xs, right: right, leftTitle: 'x', rightTitle: 'y' }, pairs,
            'One arrow from each ' + t('x') + ' to its ' + t('y') + ': ' + t(pairs.map(function (q) { return q[0] + '\\to ' + q[1]; }).join(',\\ ')) + '. The value ' + t(info(pairs).shared.length ? info(pairs).shared[0].y : '') + ' receives two arrows.',
            ['Each column of the table is one arrow, from the top value (left oval) to the bottom value (right oval).'], 'mapping diagram from a table');
          p.bad = [pairs.slice(1).map(function (q) { return [String(q[0]), String(q[1])]; }), pairs.map(function (q, i) { return [String(q[0]), String(i === 0 ? right.filter(function (y) { return y !== q[1]; })[0] : q[1])]; })];
          return p;
        } }] },

    /* ======================= RF2 part 1 — PRG ======================= */
    { num: '11', outcome: 'RF2', stem: 'Four relations, each shown a different way.',
      shared: function (r) { var v = r.shuffle(r.chance(0.7) ? [true, true, false, false] : r.chance(0.5) ? [true, true, true, false] : [true, false, false, false]); return { reps: r.shuffle(['arrow', 'table', 'pairs', 'eq']), fn: v }; },
      parts: [0, 1, 2, 3].map(function (i) {
        return { id: '11' + 'abcd'[i], sub: 'abcd'[i], outcome: 'RF2', level: 'PRG', make: function (r, sh) {
          var rep = sh.reps[i], isFn = sh.fn[i], pairs;
          if (rep === 'eq') {
            if (isFn) {
              var m = r.pick(nz(-5, 5).filter(function (x) { return Math.abs(x) > 1; })), b = r.pick(nz(-9, 9)), eq = r.chance(0.5) ? 'y=' + lin(m, b) : 'y=' + linB(b, m);
              return P.mc(r, t(eq) + '<br>Is this relation a function? Choose the answer with the correct reason.', [
                { html: 'Yes — each ' + t('x') + ' gives exactly one ' + t('y') + ': the graph is a slanted line, which passes the vertical line test.', right: true },
                { html: 'No — the line goes on forever, so there are infinitely many outputs.', why: 'Infinitely many outputs is fine: what matters is that each <b>input</b> gives only one.' },
                { html: 'Yes — each ' + t('y') + ' comes from exactly one ' + t('x') + '.', why: 'True for this line, but that is not the test. A function only needs each input ' + t('x') + ' to give one ' + t('y') + '.' },
                { html: 'No — ' + t('y') + ' changes when ' + t('x') + ' changes.', why: 'Of course it does — that is what an output does. The test is whether one ' + t('x') + ' can give two different ' + t('y') + '-values.' }],
                'Substitute any ' + t('x') + ': ' + t(eq) + ' gives exactly one value of ' + t('y') + '. Its graph is a non-vertical line, which passes the vertical line test. <b>Function.</b>', HFN, 'function? equation ' + eq);
            }
            var c = r.int(-4, 4), k = r.int(2, 3), eq2 = 'x=y^{2}' + (c ? (c > 0 ? '+' : '-') + Math.abs(c) : ''), xx = c + k * k;
            return P.mc(r, t(eq2) + '<br>Is this relation a function? Choose the answer with the correct reason.', [
              { html: 'No — ' + t('x=' + xx) + ' gives ' + t('y=' + k) + ' and ' + t('y=-' + k) + ': one input, two outputs.', right: true },
              { html: 'Yes — each ' + t('y') + ' gives exactly one ' + t('x') + '.', why: 'That is the test backwards. Pick an ' + t('x') + ', such as ' + t(xx) + ', and find every ' + t('y') + '.' },
              { html: 'Yes — it is an equation, and an equation always gives one answer.', why: 'Solve it for ' + t('x=' + xx) + ': ' + t('y^{2}=' + k * k) + ' has two solutions.' },
              { html: 'No — negative ' + t('x') + '-values have no output.', why: 'Right verdict, wrong reason: inputs outside the domain are allowed. The problem is an input with <b>two</b> outputs.' }],
              'Try ' + t('x=' + xx) + ': ' + t('y^{2}=' + k * k) + ', so ' + t('y=' + k) + ' or ' + t('y=-' + k) + '. One input, two outputs (the graph is a sideways parabola and fails the vertical line test). <b>Not a function.</b>', HFN, 'function? ' + eq2);
          }
          if (rep === 'arrow') {
            var left = r.sample(range(1, 9), 3).sort(function (a, b) { return a - b; }), right;
            if (isFn) { right = r.sample(range(1, 9), 2).sort(function (a, b) { return a - b; }); var sh2 = r.int(0, 2); pairs = left.map(function (x, j) { return [x, j === sh2 ? right[0] : right[1]]; }); if (r.chance(0.5)) pairs = pairs.map(function (q) { return [q[0], q[1] === right[0] ? right[1] : right[0]]; }); }
            else { right = r.sample(range(1, 9), 3).sort(function (a, b) { return a - b; }); var bi = r.int(0, 2), perm = r.shuffle([0, 1, 2]); pairs = left.map(function (x, j) { return [x, right[perm[j]]]; }); pairs.push([left[bi], right[perm[(bi + 1) % 3]]]); }
            return discReasonMC(r, arrowFig(pairs, left, right), pairs, 'arrow', 'arrow diagram ' + psT(pairs));
          }
          if (rep === 'table') {
            if (isFn) {
              if (r.chance(0.5)) { var c3 = r.int(-2, 3); pairs = [-2, -1, 0, 1, 2].map(function (x) { return [x, x * x + c3]; }); }
              else { var cc = r.int(1, 9), x0 = r.int(-2, 4); pairs = [0, 1, 2, 3].map(function (j) { return [x0 + j, r.chance(0.3) ? cc : cc]; }); if (r.chance(0.5)) pairs[r.int(0, 3)][1] = cc + r.pick([-2, -1, 1, 2]); }
            } else { var xs = r.sample(range(-2, 7), 3).sort(function (a, b) { return a - b; }), ys = r.sample(range(0, 9), 4), dup = r.int(0, 2); var xs4 = xs.slice(); xs4.splice(dup + 1, 0, xs[dup]); pairs = xs4.map(function (x, j) { return [x, ys[j]]; }); }
            return discReasonMC(r, htab(pairs), pairs, 'table', 'table ' + psT(pairs));
          }
          if (isFn) { var xs5 = r.sample(range(-3, 8), 4), cy = r.int(0, 6); pairs = xs5.map(function (x) { return [x, r.chance(0.35) ? cy : r.int(0, 6)]; }); }
          else { var xs6 = r.sample(range(-3, 8), 3), ys6 = r.sample(range(0, 6), 4); pairs = xs6.map(function (x, j) { return [x, ys6[j]]; }); pairs.push([xs6[r.int(0, 2)], ys6[3]]); pairs = shuffleApart(r, pairs); }
          return discReasonMC(r, '<p>' + psH(pairs) + '</p>', pairs, 'pairs', psT(pairs));
        } };
      }) },
    { num: '12', outcome: 'RF2',
      shared: function (r) {
        var c = r.pick([
          function () { var F0 = r.pick([40, 50, 60, 75, 80]), R0 = r.pick([35, 40, 45, 50, 60]); return { s: 'A plumber charges ' + t('C=' + F0 + '+' + R0 + 'h') + ' dollars for a job that takes ' + t('h') + ' hours.', ind: 'h', dep: 'C', iw: 'the number of hours', dw: 'the cost', why: 'The cost <b>depends on</b> how long the job takes.' }; },
          function () { var v = r.pick([18, 20, 22, 24, 25]); return { s: 'The distance ' + t('d') + ', in km, that a cyclist rides in ' + t('t') + ' hours is ' + t('d=' + v + 't') + '.', ind: 't', dep: 'd', iw: 'the time', dw: 'the distance', why: 'The distance <b>depends on</b> how long she rides.' }; },
          function () { var T0 = r.pick([15, 18, 20]), k = r.pick([15, 20, 25]); return { s: 'The temperature of the water in a kettle is ' + t('T=' + T0 + '+' + k + 't') + ' °C, ' + t('t') + ' minutes after it is switched on.', ind: 't', dep: 'T', iw: 'the time', dw: 'the temperature', why: 'The temperature <b>depends on</b> how long the kettle has been on.' }; },
          function () { var F1 = r.pick([3.5, 4, 4.5]), R1 = r.pick([1.75, 2, 2.25, 2.5]); return { s: 'A taxi ride of ' + t('k') + ' kilometres costs ' + t('C=' + F1 + '+' + R1 + 'k') + ' dollars.', ind: 'k', dep: 'C', iw: 'the distance', dw: 'the cost', why: 'The cost <b>depends on</b> how far you ride.' }; },
          function () { var H0 = r.pick([24, 30, 36]), rr = r.pick([2, 3]); return { s: 'A candle that has burned for ' + t('t') + ' hours is ' + t('H=' + H0 + '-' + rr + 't') + ' cm tall.', ind: 't', dep: 'H', iw: 'the time', dw: 'the height', why: 'The height <b>depends on</b> how long the candle has burned.' }; }])();
        c.vert = r.chance(0.5); return c;
      },
      stem: function (s) { return s.s; },
      parts: [
        { id: '12a', sub: 'a', outcome: 'RF2', level: 'PRG', make: function (r, s) {
          var ind = s.ind, dep = s.dep;
          var cl0 = function (x) { return String(x == null ? '' : x).replace(/\\[a-zA-Z]+|[{}$\\()\s]/g, ''); }, is = function (a, b) { return a === b || (ind.toLowerCase() !== dep.toLowerCase() && a.toLowerCase() === b.toLowerCase()); };
          return { prompt: 'Name the independent and the dependent variable (type the letters).', input: { type: 'fields', fields: [{ label: 'Independent variable:', name: 'Independent', mode: 'text', placeholder: 'letter' }, { label: 'Dependent variable:', name: 'Dependent', mode: 'text', placeholder: 'letter' }] },
            key: [ind, dep], answer: 'Independent: ' + t(ind) + ' (' + s.iw + '); dependent: ' + t(dep) + ' (' + s.dw + ')', bad: [[dep, ind], [ind, ind]], text: 'independent/dependent: ' + ind + ', ' + dep,
            solution: s.why + ' So ' + t(dep) + ' (' + s.dw + ') is the <b>dependent</b> variable, and ' + t(ind) + ' (' + s.iw + ') is the <b>independent</b> variable. In the equation, ' + t(dep) + ' is the one worked out from ' + t(ind) + '.',
            hints: ['Which quantity is worked out from the other? That one depends on the other: it is the dependent variable.'],
            check: function (resp) {
              resp = resp || []; var a = cl0(resp[0]), b = cl0(resp[1]);
              if (!a || !b) return form('empty', 'Type one letter in each box.');
              if (is(a, ind) && is(b, dep)) return ok();
              if (is(a, dep) && is(b, ind)) return wrong('u5t-var-swap', 'Swapped: ' + s.why + ' The quantity that depends on the other is the <b>dependent</b> variable.');
              if (is(a, b)) return wrong('u5t-var-same', 'The two boxes need two different variables: one is the input, the other the output.');
              return form('var-letter', 'Use the letters from the question, ' + t(ind) + ' and ' + t(dep) + ' (one letter per box).');
            } };
        } },
        { id: '12b', sub: 'b', outcome: 'RF2', level: 'PRG', make: function (r, s) {
          var axis = s.vert ? 'vertical' : 'horizontal', want = s.vert ? s.dep : s.ind, other = s.vert ? s.ind : s.dep;
          return P.mc(r, 'Which variable goes on the <b>' + axis + '</b> axis of a graph of this relation?', [
            { html: t(want) + ', because it is the ' + (s.vert ? 'dependent' : 'independent') + ' variable.', right: true },
            { html: t(other) + ', because it is the ' + (s.vert ? 'independent' : 'dependent') + ' variable.', why: 'The independent variable (the input) goes on the <b>horizontal</b> axis; the dependent variable (the output) goes on the <b>vertical</b> axis.' },
            { html: t(want) + ', because it is written ' + (s.vert ? 'first' : 'last') + ' in the equation.', why: 'Right variable, wrong reason: the order in the equation doesn’t decide it. Ask which variable depends on the other.' },
            { html: t(other) + ', because it has the larger values.', why: 'The size of the numbers doesn’t matter. The ' + (s.vert ? 'dependent' : 'independent') + ' variable goes on the ' + axis + ' axis.' }],
            'The independent variable goes on the horizontal axis and the dependent variable on the vertical axis. Here ' + t(s.ind) + ' is independent and ' + t(s.dep) + ' is dependent, so ' + t(want) + ' goes on the ' + axis + ' axis.', ['Input across, output up.'], 'which axis: ' + axis);
        } }] },

    /* ======================= RF2 part 1 — MAS ======================= */
    { num: '13', outcome: 'RF2', shared: function (r) { var c = r.pick(REL); return { c: c, text: c.a(r) }; }, stem: function (s) { return 'Consider the relation that ' + s.text + '.'; },
      parts: [
        { id: '13a', sub: 'a', outcome: 'RF2', level: 'MAS', make: function (r, s) {
          var c = s.c;
          return P.mc(r, 'Is this relation a function? Choose the answer with the correct justification.', relMC(r, c, true, c.fwd),
            '<b>' + (c.fwd ? 'Yes' : 'No') + '.</b> ' + (c.fwd ? 'Each ' + c.inp + ' (input) has exactly one ' + c.out + ' (output), so each input has exactly one output.' : c.fwdWhy) + ' (Several inputs sharing an output would still be allowed.)',
            ['The inputs are the ' + c.inps + '. Can one ' + c.inp + ' have two different ' + c.outs + '?'], 'relation: ' + c.inp + ' → ' + c.out);
        } },
        { id: '13b', sub: 'b', outcome: 'RF2', level: 'MAS', make: function (r, s) {
          var c = s.c;
          return P.mc(r, 'Is the <b>reverse</b> relation (each ' + c.out + ' paired with the ' + c.inps + ' that go with it) a function? Choose the answer with the correct justification.', relMC(r, c, false, c.rev),
            '<b>' + (c.rev ? 'Yes' : 'No') + '.</b> In the reverse relation the inputs are the ' + c.outs + '. ' + c.revWhy,
            ['Now the inputs are the ' + c.outs + '. Can one ' + c.out + ' be paired with two different ' + c.inps + '?'], 'reverse relation: ' + c.out + ' → ' + c.inp);
        } }] },
    { num: '14', outcome: 'RF2',
      shared: function (r) {
        var n = r.pick([3, 4, 4]), D = r.sample(range(-3, 9), n).sort(function (a, b) { return a - b; }), m = n === 3 ? r.pick([2, 3]) : 2, R = r.sample(range(-4, 10), m).sort(function (a, b) { return a - b; });
        var poss = r.chance(0.45), R2;
        if (poss) R2 = r.chance(0.5) ? [r.pick(range(-3, 9))] : r.sample(range(-4, 10), 2).sort(function (a, b) { return a - b; });
        else { R2 = uniq(R.concat(r.sample(range(-4, 10).filter(function (y) { return R.indexOf(y) < 0; }), n + 1 - m))); }
        return { D: D, R: R, R2: R2, poss: poss };
      },
      stem: 'Use what a function is to build and judge examples.',
      parts: [
        { id: '14a', sub: 'a', outcome: 'RF2', level: 'MAS', make: function (r, s) {
          var n = s.D.length, need = n + 1;
          var key = s.D.map(function (x, i) { return [x, s.R[i % s.R.length]]; }), extraY = s.R.filter(function (y) { return y !== key[n - 1][1]; })[0]; key.push([s.D[n - 1], extraY]);
          var chk = function (resp) {
            var L = readPairs(resp);
            if (L.empty) return form('empty', 'Type your ordered pairs first.');
            if (L.bad) return form('unreadable', 'Write ordered pairs in brackets, separated by commas, e.g. ' + t('\\{(1, 4), (2, 7)\\}') + '.');
            var ps = L.pairs, I = info(ps);
            if (I.isFn) return wrong('u5t-ex-fn', 'Every input in your set has only one output, so it <b>is</b> a function. To break the test, one input must appear in two pairs with different outputs.');
            if (!setEqA(I.xs, s.D)) return wrong('u5t-ex-dom', 'The first coordinates must be exactly the domain ' + t(lst(s.D)) + ' — every value used, and no others. Yours are ' + t(lst(I.xs)) + '.');
            if (!setEqA(I.ys, s.R)) return wrong('u5t-ex-range', 'The second coordinates must be exactly the range ' + t(lst(s.R)) + ' — every value used, and no others. Yours are ' + t(lst(I.ys)) + '.');
            if (ps.length !== need) return wrong('u5t-ex-count', 'The question asks for exactly ' + t(need) + ' ordered pairs; you have ' + t(ps.length) + '.');
            return ok();
          };
          var keyTex = '\\{' + key.map(function (q) { return '(' + q[0] + ', ' + q[1] + ')'; }).join(', ') + '\\}';
          var p = P.math('Write a set of <b>' + ['', '', '', 'three', 'four', 'five', 'six'][need] + '</b> ordered pairs for a relation with domain ' + t(lst(s.D)) + ' and range ' + t(lst(s.R)) + ' that is <b>not</b> a function.', chk, keyTex,
            'For example ' + t(setT(key)) + '. There are ' + t(need) + ' pairs but only ' + t(n) + ' inputs, so one input (' + t(s.D[n - 1]) + ' here) must appear twice, with two different outputs: one input, two outputs, so it is <b>not a function</b>. Every domain value and every range value is used.',
            ['With ' + t(need) + ' pairs and only ' + t(n) + ' inputs, one input has to be used twice.', 'Give that input two <b>different</b> outputs, and use every value of the range at least once.'], 'example: not a function', { keys: 'pairs', placeholder: 'e.g. {(1, 4), (2, 7)}' });
          p.answer = 'One example: ' + t(setT(key)) + '.';
          var fnSet = s.D.map(function (x, i) { return '(' + x + ', ' + s.R[i % s.R.length] + ')'; });
          p.bad = ['\\{' + fnSet.join(', ') + '\\}', '\\{' + key.slice(0, n - 1).concat([[s.D[n - 1], key[n - 1][1]], [s.D[n - 1], extraY], [s.D[0], extraY === key[0][1] ? s.R.filter(function (y) { return y !== extraY; })[0] : extraY]]).map(function (q) { return '(' + q[0] + ', ' + q[1] + ')'; }).join(', ') + '\\}'];
          return p;
        } },
        { id: '14b', sub: 'b', outcome: 'RF2', level: 'MAS', make: function (r, s) {
          var n = s.D.length, R2 = s.R2, m = R2.length;
          var key = s.poss ? s.D.map(function (x, i) { return [x, R2[i % m]]; }) : null;
          var chk = function (resp) {
            var raw = Array.isArray(resp) ? resp[0] : resp;
            if (!String(raw == null ? '' : raw).trim()) return form('empty', 'Type a function, or press <b>none</b>.');
            if (isNoneS(raw)) return s.poss ? wrong('u5t-said-none', 'It is possible. Each input needs exactly one output, and outputs may be shared: give every input one of the values ' + t(lst(R2)) + ', using each at least once.') : ok();
            var L = readPairs(raw);
            if (L.bad) return form('unreadable', 'Write ordered pairs in brackets, e.g. ' + t('\\{(1, 4), (2, 7)\\}') + ', or press <b>none</b>.');
            var I = info(L.pairs);
            if (!s.poss) return wrong('u5t-fn-impossible', 'Check your example: ' + (I.isFn ? (setEqA(I.ys, R2) ? '' : 'its range is ' + t(lst(I.ys)) + ', not ' + t(lst(R2)) + '. ') : 'it is not a function. ') + 'A function gives each of the ' + t(n) + ' inputs exactly one output, so it has at most ' + t(n) + ' different outputs — but this range has ' + t(m) + '. It can’t be done: <b>none</b>.');
            if (!I.isFn) return wrong('u5t-ex-notfn', 'That isn’t a function: an input appears with two different outputs.');
            if (!setEqA(I.xs, s.D)) return wrong('u5t-ex-dom', 'The first coordinates must be exactly ' + t(lst(s.D)) + '.');
            if (!setEqA(I.ys, R2)) return wrong('u5t-ex-range', 'The outputs must be exactly ' + t(lst(R2)) + ' — every value used, and no others.');
            return ok();
          };
          var p = { prompt: 'Could a <b>function</b> have the domain ' + t(lst(s.D)) + ' and the range ' + t('R=' + lst(R2)) + '? If it can, write one as a set of ordered pairs. If it can’t, press <b>none</b>.',
            input: { type: 'fields', fields: [{ label: 'Function:', name: 'Function', mode: 'math', keys: 'pairs', none: true, wide: true, placeholder: 'e.g. {(1, 4), (2, 7)}  or  none' }] },
            check: chk, key: [s.poss ? '\\{' + key.map(function (q) { return '(' + q[0] + ', ' + q[1] + ')'; }).join(', ') + '\\}' : 'none'],
            answer: s.poss ? 'Yes, for example ' + t(setT(key)) + '.' : '<b>No</b> — none.',
            solution: s.poss ? '<b>Yes.</b> Give each input exactly one output from ' + t(lst(R2)) + ', using every value: for example ' + t(setT(key)) + '. Several inputs may share an output, so a range smaller than the domain is fine.'
              : '<b>No.</b> A function pairs each of the ' + t(n) + ' inputs with exactly one output, so it has at most ' + t(n) + ' different outputs. This range has ' + t(m) + ' values, so no function can have it.',
            hints: ['Each input gets exactly one output. How many different outputs can ' + t(n) + ' inputs make, at most?'], text: 'could a function have this D and R' };
          p.bad = s.poss ? [['none'], ['\\{' + s.D.map(function (x) { return '(' + x + ', ' + R2[0] + ')'; }).concat(m > 1 ? [] : ['(' + s.D[0] + ', ' + (R2[0] + 1) + ')']).join(', ') + '\\}']] : [['\\{' + s.D.map(function (x, i) { return '(' + x + ', ' + R2[i] + ')'; }).join(', ') + '\\}']];
          return p;
        } }] },

    /* ======================= RF2 part 2 — BEG ======================= */
    { num: '15', outcome: 'RF2', stem: 'State the domain and range. Write each as a list in braces, each value once, smallest first.', parts: [
      { id: '15', outcome: 'RF2', level: 'BEG', make: function (r) {
        var pairs = find(function () {
          var kind = r.int(0, 2), xs, ys;
          if (kind === 0) { xs = r.sample(range(-4, 7), 5); var v3 = r.sample(nz(-3, 8), 3); ys = r.shuffle([v3[0], v3[0], v3[1], v3[1], v3[2]]); }
          else if (kind === 1) { var x4 = r.sample(range(-4, 7), 4); xs = x4.concat([x4[r.int(0, 3)]]); ys = r.sample(range(-3, 8), 5); }
          else { var x4b = r.sample(range(-4, 7), 4); xs = x4b.concat([x4b[r.int(0, 3)]]); var y4 = r.sample(range(-3, 8), 4); ys = y4.concat([y4[r.int(0, 3)]]); }
          return xs.map(function (x, i) { return [x, ys[i]]; });
        }, function (ps) { var u = {}; return ps.every(function (q) { var k = q.join(); if (u[k]) return false; u[k] = 1; return true; }) && !sorted(ps.map(function (q) { return q[0]; })) && ps.some(function (q) { return q[0] < 0 || q[1] < 0; }); }, [[-3, 4], [-1, 2], [0, 4], [2, -1], [5, 2]]);
        pairs = shuffleApart(r, pairs);
        var xs = pairs.map(function (q) { return q[0]; }), ys = pairs.map(function (q) { return q[1]; }), D = lst(xs), R = lst(ys);
        var p = drPart('State the domain and range of the relation ' + psH(pairs) + '.', D, R, {},
          'Domain: the first coordinates ' + t(xs.join(',\\ ')) + '; range: the second coordinates ' + t(ys.join(',\\ ')) + '. Repeated values are written once, in increasing order: ' + t('D=' + D) + ' and ' + t('R=' + R) + '.',
          [HINT_D.replace('(look left to right)', '— the first numbers').replace('(look bottom to top)', '— the second numbers'), HINT_LIST], 'D & R of 5 ordered pairs');
        p.bad.push(['\\{' + uniq(xs).slice(1).join(', ') + '\\}', R]);
        return p;
      } }] },
    { num: '16', outcome: 'RF2',
      shared: function (r) { return find(function () { var a = [r.int(-5, -1), r.int(-5, 5)], b = [r.int(1, 5), r.int(-5, 5)]; return r.chance(0.5) ? { P: a, Q: b } : { P: b, Q: a }; }, function (s) { return Math.abs(s.P[0] - s.Q[0]) >= 4 && Math.abs(s.P[1] - s.Q[1]) >= 2 && s.P[1] !== 0 && s.Q[1] !== 0; }, { P: [-4, 1], Q: [2, 4] }); },
      stem: function (s) { return 'The graph shows a line segment with endpoints ' + t(pT(s.P)) + ' and ' + t(pT(s.Q)) + '.' + G({ segs: [{ pts: [s.P, s.Q], start: 'closed', end: 'closed' }] }); },
      parts: [
        { id: '16', outcome: 'RF2', level: 'BEG', make: function (r, s) {
          var xl = Math.min(s.P[0], s.Q[0]), xh = Math.max(s.P[0], s.Q[0]), yl = Math.min(s.P[1], s.Q[1]), yh = Math.max(s.P[1], s.Q[1]), L = s.P[0] < s.Q[0] ? s.P : s.Q, Rt = L === s.P ? s.Q : s.P;
          var dec = L[1] > Rt[1];
          var xbox = function (want, other) { return numChk(want, [{ v: want === xl ? yl : yh, code: 'u5t-dr-xy', hint: 'That is a ' + t('y') + '-value. The domain uses the ' + t('x') + '-coordinates of the endpoints.' }, { v: other, code: 'u5t-dr-order', hint: 'The smaller value goes on the left: ' + t('\\text{smaller}\\le x\\le\\text{larger}') + '.' }]); };
          var ybox = function (want, other) { return numChk(want, [{ v: want === yl ? xl : xh, code: 'u5t-dr-xy', hint: 'That is an ' + t('x') + '-value. The range uses the ' + t('y') + '-coordinates of the endpoints.' }, { v: other, code: 'u5t-dr-order', hint: (dec ? 'The segment goes down from left to right, so the left endpoint has the <b>larger</b> ' + t('y') + '. ' : '') + 'The smaller value goes on the left: ' + t('\\text{smaller}\\le y\\le\\text{larger}') + '.' }]); };
          var p = P.fields('Complete the domain and range: ' + t('D=\\{x\\mid a\\le x\\le b,\\ x\\in\\mathbb{R}\\}') + ' and ' + t('R=\\{y\\mid c\\le y\\le d,\\ y\\in\\mathbb{R}\\}') + '.',
            [{ name: 'a', before: t('a=') }, { name: 'b', before: t('b=') }, { name: 'c', before: t('c=') }, { name: 'd', before: t('d=') }], [xbox(xl, xh), xbox(xh, xl), ybox(yl, yh), ybox(yh, yl)], [String(xl), String(xh), String(yl), String(yh)],
            t('D=' + bld('x', xl, xh)) + ', ' + t('R=' + bld('y', yl, yh)),
            'The segment runs from ' + t('x=' + xl) + ' to ' + t('x=' + xh) + ' (left to right) and from ' + t('y=' + yl) + ' to ' + t('y=' + yh) + ' (bottom to top); both endpoints are solid, so they are included.<br>' + t('D=' + bld('x', xl, xh)) + ', ' + t('R=' + bld('y', yl, yh)) + '.',
            [HINT_D, 'Use the endpoints: their ' + t('x') + '-values for the domain, their ' + t('y') + '-values for the range — smaller first.'], 'segment D & R boxes');
          p.bad = [[String(yl), String(yh), String(xl), String(xh)], [String(xl), String(xh), String(L[1]), String(Rt[1])]].filter(function (b) { return b.join() !== p.key.join(); });
          return p;
        } }] },
    { num: '17', outcome: 'RF2', stem: 'State the domain and range of the mapping diagram. Write each as a list.', parts: [
      { id: '17', outcome: 'RF2', level: 'BEG', make: function (r) {
        var left = r.sample(range(-5, 9), 3).sort(function (a, b) { return a - b; }), right = r.sample(range(-3, 9), 2).sort(function (a, b) { return a - b; }), sh = r.int(0, 2);
        var pairs = left.map(function (x, i) { return [x, i === sh ? right[0] : right[1]]; }); if (r.chance(0.5)) pairs = pairs.map(function (q) { return [q[0], q[1] === right[0] ? right[1] : right[0]]; });
        var D = lst(left), R = lst(right);
        var p = drPart(HW.arrowDiagram(left, right, pairs), D, R, {},
          'Domain = the values the arrows start from: ' + t('D=' + D) + '. Range = the values the arrows point to (a value hit by two arrows is listed once): ' + t('R=' + R) + '.',
          ['The domain is the set of values the arrows <b>start</b> from; the range is the set of values the arrows <b>point to</b>.', HINT_LIST], 'D & R of a mapping diagram');
        p.bad.push([D, '\\{' + pairs.map(function (q) { return q[1]; }).join(', ') + '\\}']);
        return p;
      } }] },

    /* ======================= RF2 part 2 — PRG ======================= */
    { num: '18', outcome: 'RF2', stem: 'State the domain and range of each graph in set notation.', parts: [
      { id: '18a', sub: 'a', outcome: 'RF2', level: 'PRG', make: function (r) {
        var h = r.int(-2, 2), up = r.chance(0.5), k = up ? r.int(-3, 0) : r.int(1, 4), vee = r.chance(0.3), a = up ? 1 : -1, w = EDGE;
        var spec;
        if (vee) { var d = up ? w - k : k + w; spec = { segs: [{ pts: [[h - Math.min(d, w + h) / 1.4, k + a * Math.min(d, w + h) / 1.4], [h, k], [h + Math.min(d, w - h) / 1.4, k + a * Math.min(d, w - h) / 1.4]], start: 'arrow', end: 'arrow' }] }; }
        else { var lim = up ? w : -w, dx = Math.sqrt((lim - k) / a); spec = { fns: [{ f: function (x) { return k + a * (x - h) * (x - h); }, from: Math.max(-w, h - dx), to: Math.min(w, h + dx), start: 'arrow', end: 'arrow' }] }; }
        var D = all('x'), R = up ? bld('y', k, null) : bld('y', null, k);
        return drPart(G(spec), D, R, { rW: [{ is: up ? bld('y', null, k) : bld('y', k, null), code: 'u5t-opens', hint: 'The graph opens <b>' + (up ? 'up' : 'down') + '</b>: the vertex ' + t(pT([h, k])) + ' is the <b>' + (up ? 'lowest' : 'highest') + '</b> point, and the arrows go ' + (up ? 'up' : 'down') + ' forever.' },
          { is: up ? bld('y', k, null, false) : bld('y', null, k, true, false), code: 'dr-vertex', hint: 'The vertex ' + t(pT([h, k])) + ' is on the graph, so ' + t('y=' + k) + ' is included: use ' + t(up ? '\\ge' : '\\le') + '.' }],
          dC: { 'set-arrow': 'The arrows mean the graph keeps going outward forever, so every ' + t('x') + '-value is used.' } },
          'The arrows show the graph going on forever to the left and right, so every real ' + t('x') + ' is used. The ' + (up ? 'lowest' : 'highest') + ' point is the vertex ' + t(pT([h, k])) + ', which is on the graph; the arrows go ' + (up ? 'up' : 'down') + ' forever.<br>' + t('D=' + D) + ', ' + t('R=' + R) + '.',
          [HINT_D, 'Which way do the arrows point? Is there a highest point or a lowest point?'], 'D & R: curve with arrows');
      } },
      { id: '18b', sub: 'b', outcome: 'RF2', level: 'PRG', make: function (r) {
        var s = find(function () {
          var peak = r.chance(0.5), L = [r.int(-5, -3), 0], M = [r.int(-1, 1), 0], Rp = [r.int(3, 4), 0];
          if (peak) { M[1] = r.int(2, 4); L[1] = r.int(-3, 1); Rp[1] = r.int(-3, 1); } else { M[1] = r.int(-4, -2); L[1] = r.int(-1, 3); Rp[1] = r.int(-1, 3); }
          var openL = r.chance(0.5);
          return { peak: peak, L: L, M: M, Rp: Rp, sL: openL ? 'open' : 'closed', sR: openL ? 'closed' : 'open' };
        }, function (s) { return s.L[1] !== s.Rp[1] && Math.abs(s.L[1] - s.Rp[1]) >= 1; }, { peak: true, L: [-3, -1], M: [0, 4], Rp: [4, -2], sL: 'closed', sR: 'open' });
        var L = s.L, M = s.M, Rp = s.Rp, D = bld('x', L[0], Rp[0], s.sL === 'closed', s.sR === 'closed');
        var endE = s.peak ? (L[1] < Rp[1] ? [L, s.sL] : [Rp, s.sR]) : (L[1] > Rp[1] ? [L, s.sL] : [Rp, s.sR]), other = endE[0] === L ? [Rp, s.sR] : [L, s.sL];
        var R = s.peak ? bld('y', endE[0][1], M[1], endE[1] === 'closed', true) : bld('y', M[1], endE[0][1], true, endE[1] === 'closed');
        var rW = [{ is: s.peak ? bld('y', endE[0][1], M[1], endE[1] !== 'closed', true) : bld('y', M[1], endE[0][1], true, endE[1] !== 'closed'), code: 'set-endpoint', hint: 'Check the dot at ' + t(pT(endE[0])) + ': it is ' + (endE[1] === 'closed' ? '<b>solid</b>, so ' + t('y=' + endE[0][1]) + ' is included' : '<b>hollow</b>, so ' + t('y=' + endE[0][1]) + ' is not included') + '.' },
          { is: s.peak ? bld('y', Math.min(L[1], Rp[1]), Math.max(L[1], Rp[1]), true, true) : bld('y', Math.min(L[1], Rp[1]), Math.max(L[1], Rp[1]), true, true), code: 'dr-peak', hint: 'The range isn’t just the endpoints’ ' + t('y') + '-values: the ' + (s.peak ? 'highest' : 'lowest') + ' point is the corner ' + t(pT(M)) + '.' },
          { is: s.peak ? bld('y', other[0][1], M[1], other[1] === 'closed', true) : bld('y', M[1], other[0][1], true, other[1] === 'closed'), code: 'dr-peak', hint: 'Check the ' + (s.peak ? 'lowest' : 'highest') + ' point: the graph reaches ' + t('y=' + endE[0][1]) + ' at ' + t(pT(endE[0])) + '.' }];
        var dW = [{ is: bld('x', L[0], Rp[0], s.sL !== 'closed', s.sR !== 'closed'), code: 'dr-open-side', hint: 'Match each end of the domain to its dot: the hollow dot is at ' + t('x=' + (s.sL === 'open' ? L[0] : Rp[0])) + ', so that value is excluded; the solid dot keeps ' + t('x=' + (s.sL === 'open' ? Rp[0] : L[0])) + '.' }, { is: bld('x', L[0], Rp[0]), code: 'set-endpoint', hint: 'One end of the graph is a <b>hollow</b> dot: that ' + t('x') + '-value is not included, so use ' + t('<') + ' there.' }];
        var desc = function (q, st) { return (st === 'open' ? 'hollow' : 'solid') + ' dot ' + t(pT(q)); };
        return drPart(G({ segs: [{ pts: [L, M, Rp], start: s.sL, end: s.sR }] }), D, R, { dW: dW, rW: rW },
          'The graph runs from the ' + desc(L, s.sL) + ' through the ' + (s.peak ? 'peak' : 'lowest point') + ' ' + t(pT(M)) + ' to the ' + desc(Rp, s.sR) + '.<br><b>Domain</b>: ' + t('x') + ' from ' + t(L[0]) + ' to ' + t(Rp[0]) + ', with the hollow end excluded: ' + t('D=' + D) + '.<br>' +
          '<b>Range</b>: the ' + (s.peak ? 'highest' : 'lowest') + ' point is ' + t(pT(M)) + ' (included); the ' + (s.peak ? 'lowest' : 'highest') + ' is the ' + desc(endE[0], endE[1]) + ' (' + (endE[1] === 'closed' ? 'included' : 'excluded') + '): ' + t('R=' + R) + '.',
          [HINT_D, HINT_DOTS + ' The highest or lowest point may be a corner in the middle.'], 'D & R: polyline with one hollow end');
      } }] },
    { num: '19', outcome: 'RF2',
      shared: function (r) {
        var c = r.pick([{ w: 'cupcakes', v: 'n', out: 'C', p: [3, 2.5, 4], min: 1, max: [12, 24], s: function (q) { return 'A bakery sells cupcakes for ' + t('\\$' + money(q.p)) + ' each. A customer buys at least ' + t('1') + ' and at most ' + t(q.max) + ' cupcakes. The cost is ' + t('C=' + money(q.p) + 'n') + ' dollars for ' + t('n') + ' cupcakes.'; } },
          { w: 'tickets', v: 'n', out: 'C', p: [2.5, 3.25, 2.75], min: 1, max: [10, 20], s: function (q) { return 'Bus tickets cost ' + t('\\$' + money(q.p)) + ' each. A group buys at least ' + t('1') + ' and at most ' + t(q.max) + ' tickets. The cost is ' + t('C=' + money(q.p) + 'n') + ' dollars for ' + t('n') + ' tickets.'; } },
          { w: 'cars', v: 'c', out: 'M', p: [8, 10, 12], min: 0, max: [40, 50, 60], s: function (q) { return 'A car wash fundraiser charges ' + t('\\$' + money(q.p)) + ' per car. The team can wash at most ' + t(q.max) + ' cars in the day. The money raised is ' + t('M=' + money(q.p) + 'c') + ' dollars for ' + t('c') + ' cars.'; } },
          { w: 'movie tickets', v: 'n', out: 'C', p: [12, 14, 15], min: 1, max: [8, 10], s: function (q) { return 'Movie tickets cost ' + t('\\$' + money(q.p)) + ' each. A family buys at least ' + t('1') + ' and at most ' + t(q.max) + ' tickets. The cost is ' + t('C=' + money(q.p) + 'n') + ' dollars for ' + t('n') + ' tickets.'; } }]);
        var q = { c: c, p: r.pick(c.p), max: r.pick(c.max) }; q.text = c.s(q); return q;
      },
      stem: function (q) { return q.text; },
      parts: [
        { id: '19a', sub: 'a', outcome: 'RF2', level: 'PRG', make: function (r, q) {
          var c = q.c, v = c.v, o = c.out, p0 = q.p, lo = c.min, hi = q.max, ns = c.min === 0 ? 'W' : 'I';
          var D = '\\{' + v + '\\mid ' + lo + '\\le ' + v + '\\le ' + hi + ',\\ ' + v + '\\in ' + ns + '\\}', vals = [lo, lo + 1, lo + 2].map(function (k) { return money(p0 * k); });
          var R = '\\{' + vals.join(', ') + ', \\dots, ' + money(p0 * hi) + '\\}';
          var p = drPart('State the domain and range. (A list may end with “…”, e.g. ' + t('\\{2, 4, 6, \\dots, 20\\}') + '.)', D, R, { dv: v, rv: o,
            dW: [{ is: bld(v, lo, hi), code: 'set-continuous', hint: t(v) + ' counts ' + c.w + ': only whole numbers make sense, so use ' + t(v + '\\in ' + ns) + ' (or list the values), not ' + t('\\in\\mathbb{R}') + '.' }],
            rW: [{ is: bld(o, p0 * lo, p0 * hi), code: 'set-continuous', hint: 'The ' + (o === 'M' ? 'amount raised' : 'cost') + ' only takes the values ' + t(vals.join(',\\ ') + ',\\ \\ldots') + ': one for each whole number of ' + c.w + '. List them, with … in the middle.' }] },
            'The number of ' + c.w + ' is a whole number from ' + t(lo) + ' to ' + t(hi) + ': ' + t('D=' + D) + ' (or ' + t('\\{' + lo + ', ' + (lo + 1) + ', ' + (lo + 2) + ', \\dots, ' + hi + '\\}') + ').<br>' +
            'Each one adds ' + t('\\$' + money(p0)) + ': ' + t('R=' + R) + '.',
            ['Can you have ' + t('2.5') + ' ' + c.w + '? Use ' + t('\\in I') + ' or a list.', 'The range is the list of possible ' + (o === 'M' ? 'amounts' : 'costs') + ': ' + t(o + '=' + money(p0) + '\\times') + ' each allowed value of ' + t(v) + '.'], 'D & R in context with I');
          p.good = [['\\{' + lo + ', ' + (lo + 1) + ', ' + (lo + 2) + ', \\dots, ' + hi + '\\}', R]];
          return p;
        } },
        { id: '19b', sub: 'b', outcome: 'RF2', level: 'PRG', make: function (r, q) {
          var c = q.c;
          return P.mc(r, 'Why does the domain use ' + t('\\in I') + ' (or ' + t('\\in W') + '), not ' + t('\\in\\mathbb{R}') + '?', [
            { html: t(c.v) + ' counts ' + c.w + ', so only whole numbers make sense: you can’t have ' + t('2.5') + ' ' + c.w + '.', right: true },
            { html: 'Because the price, ' + t('\\$' + money(q.p)) + ', is a whole number.', why: 'The price doesn’t decide it (a price like ' + t('\\$2.75') + ' works the same way). What kind of numbers can ' + t(c.v) + ' be?' },
            { html: 'Because ' + t(c.v) + ' can be negative.', why: t(c.v) + ' can’t be negative here. The reason is that ' + t(c.v) + ' counts ' + c.w + ': whole numbers only.' },
            { html: 'Because the graph of the relation is a straight line.', why: 'A straight line would use every real number. Here only separate whole-number values make sense: the graph is separate points.' }],
            t(c.v) + ' is a <b>count</b> of ' + c.w + ', so only whole numbers make sense (the data are discrete). ' + t('\\in\\mathbb{R}') + ' would include values like ' + t('2.5') + ', which are impossible here.', ['Could ' + t(c.v) + ' be ' + t('2.5') + '?'], 'why I not R');
        } }] },

    /* ======================= RF2 part 2 — MAS ======================= */
    { num: '20', outcome: 'RF2', stem: 'Sketch on the grid. Many different graphs are right.', parts: [
      { id: '20', outcome: 'RF2', level: 'MAS', make: function (r) {
        var a = r.int(-5, -2), b = r.int(2, 5), c = r.int(-4, -1), d = r.int(2, 5), openRight = r.chance(0.5), rOpen = r.chance(0.5) ? (r.chance(0.5) ? 'lo' : 'hi') : null;
        var Dt = bld('x', a, b, openRight, !openRight), Rt = bld('y', c, d, rOpen !== 'lo', rOpen !== 'hi');
        var key, m1 = cl(a + (b - a) / 3), m2 = cl(a + 2 * (b - a) / 3), mid = Math.round((c + d) / 2) === c ? c + 1 : Math.round((c + d) / 2) === d ? d - 1 : Math.round((c + d) / 2);
        m1 = Math.round(m1); m2 = Math.round(m2); if (m1 <= a) m1 = a + 1; if (m2 <= m1) m2 = m1 + 1; if (m2 >= b) { m2 = b - 1; m1 = Math.min(m1, m2 - 1); }
        if (!rOpen) key = drw([{ v: [[a, mid], [m1, c], [m2, d], [b, mid]], s: openRight ? 'closed' : 'open', e: openRight ? 'open' : 'closed' }]);
        else {
          var openX = openRight ? b : a, openY = rOpen === 'lo' ? c : d, closedX = openRight ? a : b, closedY = rOpen === 'lo' ? d : c;
          key = drw([{ v: openRight ? [[closedX, closedY], [openX, openY]] : [[openX, openY], [closedX, closedY]], s: openRight ? 'closed' : 'open', e: openRight ? 'open' : 'closed' }]);
        }
        var chk = sketchChk({ fn: true, domain: Dt, range: Rt });
        var p = K.P.graph('Sketch the graph of a <b>function</b> with domain ' + t(Dt) + ' and range ' + t(Rt) + '. <div class="muted">' + SK_HELP + '</div>', { x: [-6, 6], y: [-6, 6], labels: 2 }, chk, key,
          'The graph must reach from ' + t('x=' + a) + ' to ' + t('x=' + b) + ' and from ' + t('y=' + c) + ' to ' + t('y=' + d) + ', with no gaps, and pass the vertical line test. ' +
          'Each excluded value (' + t('<') + ') needs a <b>hollow</b> dot, and no other point of the graph may have that ' + t('x') + ' or ' + t('y') + '. ' +
          (rOpen ? 'Here one segment from ' + t(pT(key.pieces[0].v[0])) + ' to ' + t(pT(key.pieces[0].v[1])) + ' does it, with the hollow dot at the end that is excluded in both the domain and the range.' : 'For example, a zig-zag from ' + t(pT(key.pieces[0].v[0])) + ' down to ' + t(pT(key.pieces[0].v[1])) + ', up to ' + t(pT(key.pieces[0].v[2])) + ' and on to ' + t(pT(key.pieces[0].v[3])) + ', with the ' + (openRight ? 'right' : 'left') + ' end hollow.') + ' Any function with these limits is right.',
          ['Start with the extremes: leftmost ' + t('x=' + a) + ', rightmost ' + t('x=' + b) + ', lowest ' + t('y=' + c) + ', highest ' + t('y=' + d) + '.', 'A hollow end dot excludes a value; a corner in the middle of the graph is always included.'], 'sketch a function with D & R');
        p.answer = 'One possible answer:' + p.answer;
        p.bad = [drw([seg([a, c], [b, d])]), drw([seg([c, a], [d, b])]), drw([{ v: [[a, c], [a, d], [b, d]], s: 'closed', e: 'closed' }])].filter(function (q) { return chk(q).v !== 'correct'; });
        return p;
      } }] },
    { num: '21', outcome: 'RF2',
      shared: function (r) {
        return find(function () {
          var up = r.chance(0.6), h = r.int(-1, 2), k = up ? r.int(-4, -2) : r.int(2, 4), side = r.chance(0.5) ? 'L' : 'R', d = r.int(1, 2), e = r.int(d + 1, 3), open = r.chance(0.5);
          var s = up ? 1 : -1, ex0 = side === 'L' ? h - d : h + d, ey = k + s * d * d, tx = side === 'L' ? h + e : h - e, ty = k + s * e * e;
          var name = r.pick(['Jesse', 'Kai', 'Ava', 'Noor', 'Liam', 'Priya', 'Ethan', 'Mei']);
          var e2 = open && r.chance(0.75), e3 = r.chance(0.6); if (!e2 && !e3) { if (open) e2 = true; else e3 = true; }
          return { up: up, h: h, k: k, side: side, ex: ex0, ey: ey, tx: tx, ty: ty, open: open, name: name, e2: e2, e3: e3 };
        }, function (s) { return Math.abs(s.tx) <= 5 && Math.abs(s.ex) <= 5 && s.ty <= 7 && s.ty >= -6 && s.ex !== 0 && s.ey !== 0 && s.ty !== 0 && s.h !== 0; }, { up: true, h: 1, k: -3, side: 'L', ex: -1, ey: 1, tx: 4, ty: 6, open: false, name: 'Jesse', e2: false, e3: true });
      },
      stem: function (s) {
        var xs = [s.ex, s.tx, s.h, 0], ys = [s.ey, s.ty, s.k, 0], X = [Math.min.apply(null, xs) - 1, Math.max.apply(null, xs) + 1], Y = [Math.min.apply(null, ys) - 1, Math.max.apply(null, ys) + 1];
        var sgn = s.up ? 1 : -1, from = Math.min(s.ex, s.tx), to = Math.max(s.ex, s.tx);
        var leftEnd = s.side === 'L' ? (s.open ? 'open' : 'closed') : 'arrow', rightEnd = s.side === 'L' ? 'arrow' : (s.open ? 'open' : 'closed');
        var g = HW.graph({ x: X, y: Y, labels: 2, max: 300, fns: [{ f: function (x) { return s.k + sgn * (x - s.h) * (x - s.h); }, from: from, to: to, start: leftEnd, end: rightEnd }], aria: 'a curve with an end dot and an arrow' });
        return s.name + ' was asked for the domain and range of this graph and wrote:<br>' + t('D=' + stuD(s)) + '<br>' + t('R=' + stuR(s)) + g;
      },
      parts: [
        { id: '21a', sub: 'a', outcome: 'RF2', level: 'MAS', make: function (r, s) {
          var nm = s.name, ept = t(pT([s.ex, s.ey])), vtx = t(pT([s.h, s.k]));
          var rows = [
            { id: 'e1', html: nm + ' treated the arrow as if the graph stopped there.', yes: true, why: 'The arrow means the graph keeps going, so there is no end value on that side.' },
            { id: 'e2', html: s.open ? nm + ' used ' + t('\\le') + ' at the hollow point ' + ept + ', which is not on the graph.' : nm + ' should have used ' + t('<') + ' at the point ' + ept + '.', yes: !!(s.open && s.e2), why: s.open ? (s.e2 ? 'The point ' + ept + ' is hollow, so ' + t('x=' + s.ex) + ' is excluded: ' + t('<') + ' or ' + t('>') + ', not ' + t('\\le') + '.' : nm + ' did use ' + t('<') + ' (or ' + t('>') + ') at the hollow point: that part is right.') : 'The point ' + ept + ' is <b>solid</b>, so it is included: ' + t('\\le') + ' is right there.' },
            { id: 'e3', html: nm + ' used the end point ' + ept + ' for the ' + (s.up ? 'lowest' : 'highest') + ' ' + t('y') + '-value instead of the vertex ' + vtx + '.', yes: s.e3, why: s.e3 ? 'The ' + (s.up ? 'lowest' : 'highest') + ' point of the graph is the vertex ' + vtx + ', not the end point: the curve dips ' + (s.up ? 'below' : 'above') + ' it.' : nm + '’s range does start at the vertex value ' + t(s.k) + ': that part is right.' },
            { id: 'e4', html: nm + ' wrote the domain and the range the wrong way round.', yes: false, why: nm + '’s domain does use ' + t('x') + '-values and the range uses ' + t('y') + '-values.' }];
          var want = {}, by = {}; rows.forEach(function (x) { want[x.id] = x.yes ? 'Y' : 'N'; by[x.id] = x; });
          var p = gridPart('Which of these are errors that ' + nm + ' made? Choose <b>Error</b> or <b>Not an error</b> for each statement.', rows.map(function (x) { return { id: x.id, html: x.html }; }), [{ id: 'Y', html: 'Error' }, { id: 'N', html: 'Not an error' }], want,
            function (id) { return { code: 'u5t-err', hint: by[id].why }; },
            rows.map(function (x) { return (x.yes ? '<b>Error:</b> ' : '<b>Not an error:</b> ') + x.html + ' ' + x.why; }).join('<br>'),
            ['Check each end of the graph: is it a dot (solid or hollow) or an arrow? Then find the highest and lowest points anywhere on the graph.'], 'error analysis: domain and range', 'u5t-err-one', 'u5t-err');
          p.answer = rows.map(function (x) { return (x.yes ? 'Error' : 'Not an error') + ': ' + x.html; }).join('<br>');
          return p;
        } },
        { id: '21b', sub: 'b', outcome: 'RF2', level: 'MAS', make: function (r, s) {
          var D = s.side === 'L' ? bld('x', s.ex, null, !s.open) : bld('x', null, s.ex, true, !s.open), R = s.up ? bld('y', s.k, null) : bld('y', null, s.k);
          return drPart('Write the correct domain and range.', D, R, { dW: [{ is: stuD(s), code: 'set-arrow', hint: 'That is ' + s.name + '’s domain: the arrow means the graph keeps going, so there is no end on that side.' }, { is: s.side === 'L' ? bld('x', s.ex, null, s.open) : bld('x', null, s.ex, true, s.open), code: 'set-endpoint', hint: 'Check the end dot at ' + t(pT([s.ex, s.ey])) + ': it is ' + (s.open ? 'hollow (excluded)' : 'solid (included)') + '.' }],
            rW: [{ is: stuR(s), code: 'set-arrow', hint: 'That is ' + s.name + '’s range: the arrow means the graph keeps going ' + (s.up ? 'up' : 'down') + ' forever.' }, { is: s.up ? bld('y', s.ey, null) : bld('y', null, s.ey), code: 'dr-peak', hint: 'The ' + (s.up ? 'lowest' : 'highest') + ' point is the vertex ' + t(pT([s.h, s.k])) + ', not the end point.' }] },
            'The arrow means the graph keeps going ' + (s.side === 'L' ? 'right' : 'left') + ' and ' + (s.up ? 'up' : 'down') + ' forever. The end dot ' + t(pT([s.ex, s.ey])) + ' is ' + (s.open ? 'hollow, so ' + t('x=' + s.ex) + ' is excluded' : 'solid, so ' + t('x=' + s.ex) + ' is included') + '. The ' + (s.up ? 'lowest' : 'highest') + ' point is the vertex ' + t(pT([s.h, s.k])) + '.<br>' + t('D=' + D) + ', ' + t('R=' + R) + '.',
            [HINT_DOTS, 'The ' + (s.up ? 'lowest' : 'highest') + ' point of a curve is often its vertex, not an end point.'], 'correct D & R after error analysis');
        } }] },

    /* ======================= RF8 — BEG ======================= */
    { num: '22', outcome: 'RF8', shared: function (r) { var m = r.pick(nz(-5, 5).filter(function (x) { return Math.abs(x) > 1; })), b = r.pick(nz(-9, 9)); return { m: m, b: b, p: r.int(2, 5), n: r.int(-4, -1) }; },
      stem: function (s) { return 'For ' + t('f(x)=' + lin(s.m, s.b)) + ', evaluate:'; },
      parts: ['p', 'n', 'z'].map(function (w, i) {
        return { id: '22' + 'abc'[i], sub: 'abc'[i], outcome: 'RF8', level: 'BEG', make: function (r, s) {
          var x = w === 'p' ? s.p : w === 'n' ? s.n : 0, val = s.m * x + s.b, fx = 'f(' + x + ')';
          return numPart('Evaluate ' + t(fx) + '.', val, [{ v: -s.m * x + s.b, code: 'ev-sign', hint: 'Check the sign: ' + t(s.m + '\\times' + sg(x) + '=' + s.m * x) + '.' }, { v: s.m * x, code: 'u5t-ev-no-b', hint: 'Don’t forget the constant term: add ' + t(s.b) + ' after multiplying.' }, { v: s.m * x - s.b, code: 'ev-sign', hint: 'Check the sign of the constant term: it is ' + t((s.b > 0 ? '+' : '') + s.b) + '.' }, { v: s.m + x + s.b, code: 'u5t-ev-no-b', hint: t(s.m + 'x') + ' means ' + t(s.m + '\\times x') + ': multiply, don’t add.' }],
            t(fx + '=' + s.m + '(' + x + ')' + (s.b > 0 ? '+' : '') + s.b + '=' + (s.m * x) + (s.b > 0 ? '+' : '') + s.b + '=' + val), ['Replace every ' + t('x') + ' with ' + t(x) + (x < 0 ? ' (in brackets)' : '') + ', then simplify.'], 'evaluate f(' + x + ')', { before: t(fx + '=') });
        } };
      }) },
    { num: '23', outcome: 'RF8',
      shared: function (r) {
        return find(function () {
          var sl = r.pick([[1, 2], [-1, 2], [2, 3], [-2, 3], [2, 1], [-2, 1], [1, 3], [-1, 3], [3, 2], [-3, 2], [1, 1], [-1, 1]]), b = r.int(-3, 3), q = sl[1], m = sl[0] / q;
          var xs = range(-5, 5).filter(function (x) { return x !== 0 && x % q === 0 && Math.abs(m * x + b) <= 5; });
          if (xs.length < 2) return null;
          var two = r.sample(xs, 2); if (!(two[0] < 0 || two[1] < 0) || !(two[0] > 0 || two[1] > 0)) return null;
          return { m: m, b: b, xs: r.chance(0.5) ? two : two.reverse() };
        }, function (s) { return s.b !== 0 || true; }, { m: -0.5, b: 1, xs: [-2, 4] });
      },
      stem: function (s) {
        var a = toEdge([0, s.b], [-1, -s.m], 5.4), c = toEdge([0, s.b], [1, s.m], 5.4);
        return 'The graph of the function ' + t('g') + ' is shown.' + G({ segs: [{ pts: [a, c], start: 'arrow', end: 'arrow' }], yName: 'y', aria: 'graph of a line y = g(x)' });
      },
      parts: [0, 1, 2].map(function (i) {
        return { id: '23' + 'abc'[i], sub: 'abc'[i], outcome: 'RF8', level: 'BEG', make: function (r, s) {
          var x = i < 2 ? s.xs[i] : 0, val = cl(s.m * x + s.b), gx = 'g(' + x + ')', back = s.m ? cl((x - s.b) / s.m) : null;
          return numPart('Find ' + t(gx) + '.', val, [{ v: back, code: 'u5t-read-swap', hint: 'You found where the <b>output</b> is ' + t(x) + '. In ' + t(gx) + ' the ' + t(x) + ' is the <b>input</b>: start at ' + t('x=' + x) + ' on the horizontal axis.' }, { v: -val, code: 'ev-sign', hint: 'Check the sign: is the graph above or below the ' + t('x') + '-axis at ' + t('x=' + x) + '?' }],
            'Go to ' + t('x=' + x) + ' on the horizontal axis, then up or down to the line: the point is ' + t(pT([x, val])) + ', so ' + t(gx + '=' + val) + '.', ['In ' + t(gx) + ', ' + t(x) + ' is the input (an ' + t('x') + '-value). Read the ' + t('y') + '-value of the graph there.'], 'read g(' + x + ') from a graph', { before: t(gx + '=') });
        } };
      }) },

    /* ======================= RF8 — PRG ======================= */
    { num: '24', outcome: 'RF8', stem: 'Switch between the two notations.', parts: [
      { id: '24a', sub: 'a', outcome: 'RF8', level: 'PRG', make: function (r) {
        var m = r.pick(nz(-6, 6).filter(function (x) { return Math.abs(x) > 1; })), b = r.int(2, 12), rhs = r.chance(0.5) ? linB(b, m) : lin(m, b);
        return convPart('fn', 'Write ' + t('y=' + rhs) + ' in function notation.', { T: PL.parse(rhs), v: 'x', name: 'f', keyRhs: rhs, good: ['g(x)=' + rhs], bad: ['y=' + rhs, 'f(y)=' + rhs] },
          'Replace ' + t('y') + ' with a function name and the input in brackets: ' + t('f(x)=' + rhs) + ' (any function name works).', ['Swap ' + t('y') + ' for ' + t('f(x)') + '. The right side stays the same.'], 'y= to f(x)');
      } },
      { id: '24b', sub: 'b', outcome: 'RF8', level: 'PRG', make: function (r) {
        var c = r.pick([{ n: 'P', v: 'n', m: r.pick([8, 12, 15]), b: r.pick([20, 30, 45]) }, { n: 'd', v: 't', m: -r.pick([4, 6, 8]), b: r.pick([50, 60, 80]) }, { n: 'C', v: 'm', m: r.pick([0.25, 0.15, 0.5]), b: r.pick([25, 40]) }, { n: 'H', v: 'w', m: r.pick([3, 5]), b: r.pick([12, 18]) }]);
        var rhs = lin(c.m, c.b, c.v), nmx = c.n + '(' + c.v + ')';
        return convPart('xy', 'Write ' + t(nmx + '=' + rhs) + ' as an equation in two variables.', { T: PL.parse(rhs), v: c.v, keyRhs: rhs, vars: ['x'], bad: [nmx + '=' + rhs, 'y=' + lin(c.m, c.b, 'x')] },
          'Replace ' + t(nmx) + ' with ' + t('y') + '. The input variable stays ' + t(c.v) + ': ' + t('y=' + rhs) + '.', ['Only the output changes its name. The input letter, ' + t(c.v) + ', stays the same.'], nmx + ' to y=');
      } }] },
    { num: '25', outcome: 'RF8', parts: [
      { id: '25', outcome: 'RF8', level: 'PRG', make: function (r) {
        var o = find(function () { return { a: r.pick(nz(-6, 6).filter(function (x) { return Math.abs(x) > 1; })), b: r.pick(nz(-9, 9)), x: r.pick(nz(-5, 5)) }; }, function (o) { var k = o.a * o.x + o.b; return Math.abs(k) <= 30 && k !== o.x && k !== 0; }, { a: 4, b: 9, x: -2 });
        var k = o.a * o.x + o.b, rule = lin(o.a, o.b);
        return numPart('For ' + t('p(x)=' + rule) + ', solve ' + t('p(x)=' + k) + '.', o.x, [{ v: o.a * k + o.b, code: 'u5t-ev-instead', hint: 'That is ' + t('p(' + k + ')') + '. Here ' + t(k) + ' is the <b>output</b>: solve ' + t(rule + '=' + k) + ' for ' + t('x') + '.' }, { v: cl((k + o.b) / o.a), code: 'fn-solve-inverse', hint: 'To undo ' + t((o.b > 0 ? '+' : '') + o.b) + ', ' + (o.b > 0 ? 'subtract' : 'add') + ' ' + t(Math.abs(o.b)) + ' on both sides.' }, { v: k - o.b, code: 'fn-solve-divide', hint: 'Last step: divide both sides by ' + t(o.a) + '.' }, { v: -o.x, code: 'fn-solve-sign', hint: 'Check the sign when you divide by ' + t(o.a) + '.' }],
          t(rule + '=' + k) + '<br>' + t(o.a + 'x=' + (k - o.b)) + '<br>' + t('x=' + o.x) + '<br>Check: ' + t('p(' + o.x + ')=' + o.a + '(' + o.x + ')' + (o.b > 0 ? '+' : '') + o.b + '=' + k) + ' ✓',
          ['In ' + t('p(x)=' + k) + ', ' + t(k) + ' is the output. Set the rule equal to ' + t(k) + ' and solve for ' + t('x') + '.'], 'solve p(x)=' + k, { before: t('x=') });
      } }] },
    { num: '26', outcome: 'RF8',
      shared: function (r) { return find(function () { var dn = r.chance(0.6), m = r.pick([2, 3, 4]), c = dn ? r.pick([8, 10, 12, 14]) : r.int(1, 5), n = r.int(2, 5); return { dn: dn, m: m, c: c, n: n }; }, function (s) { var xs = s.dn ? (s.c - s.n) / s.m : (s.n + s.c) / s.m; return Math.abs(xs * 2 - Math.round(xs * 2)) < 1e-9 && xs !== s.n && (s.dn ? s.c - s.m * s.n : s.m * s.n - s.c) !== s.n; }, { dn: true, m: 2, c: 10, n: 3 }); },
      stem: function (s) { return 'For ' + t('h(x)=' + (s.dn ? linB(s.c, -s.m) : lin(s.m, -s.c))) + ':'; },
      parts: [
        { id: '26a', sub: 'a', outcome: 'RF8', level: 'PRG', make: function (r, s) {
          var rule = s.dn ? linB(s.c, -s.m) : lin(s.m, -s.c), f = function (x) { return s.dn ? s.c - s.m * x : s.m * x - s.c; }, val = f(s.n), xs = s.dn ? (s.c - s.n) / s.m : (s.n + s.c) / s.m;
          return numPart('Find ' + t('h(' + s.n + ')') + '.', val, [{ v: xs, code: 'u5t-solve-instead', hint: 'That solves ' + t('h(x)=' + s.n) + '. In ' + t('h(' + s.n + ')') + ', ' + t(s.n) + ' is the <b>input</b>: substitute ' + t('x=' + s.n) + '.' }, { v: s.dn ? s.c + s.m * s.n : -s.m * s.n - s.c, code: 'ev-sign', hint: 'Check the signs as you substitute.' }],
            t('h(' + s.n + ')=' + rule.replace('x', '(' + s.n + ')') + '=' + val), ['Replace ' + t('x') + ' with ' + t(s.n) + '.'], 'h(' + s.n + ')', { before: t('h(' + s.n + ')=') });
        } },
        { id: '26b', sub: 'b', outcome: 'RF8', level: 'PRG', make: function (r, s) {
          var rule = s.dn ? linB(s.c, -s.m) : lin(s.m, -s.c), f = function (x) { return s.dn ? s.c - s.m * x : s.m * x - s.c; }, xs = cl(s.dn ? (s.c - s.n) / s.m : (s.n + s.c) / s.m);
          return numPart('Solve ' + t('h(x)=' + s.n) + '.', xs, [{ v: f(s.n), code: 'u5t-ev-instead', hint: 'That is ' + t('h(' + s.n + ')') + '. Here ' + t(s.n) + ' is the <b>output</b>: solve ' + t(rule + '=' + s.n) + '.' }, { v: -xs, code: 'fn-solve-sign', hint: 'Check the sign when you divide by ' + t(s.dn ? -s.m : s.m) + '.' }, { v: s.dn ? cl((s.c + s.n) / s.m) : cl((s.n - s.c) / s.m), code: 'fn-solve-inverse', hint: 'Undo the constant with the opposite operation on both sides.' }],
            t(rule + '=' + s.n) + '<br>' + t((s.dn ? '-' : '') + s.m + 'x=' + (s.dn ? s.n - s.c : s.n + s.c)) + '<br>' + t('x=' + xs),
            ['Set the rule equal to ' + t(s.n) + ' and solve for ' + t('x') + '.'], 'solve h(x)=' + s.n, { before: t('x=') });
        } },
        { id: '26c', sub: 'c', outcome: 'RF8', level: 'PRG', make: function (r, s) {
          var n = s.n;
          return P.mc(r, 'Explain the difference between ' + t('h(' + n + ')') + ' and ' + t('h(x)=' + n) + '.', [
            { html: 'In ' + t('h(' + n + ')') + ', ' + t(n) + ' is the <b>input</b> (' + t('x=' + n) + ') and we find the output. In ' + t('h(x)=' + n) + ', ' + t(n) + ' is the <b>output</b> and we find the input that gives it.', right: true },
            { html: 'In ' + t('h(' + n + ')') + ', ' + t(n) + ' is the output; in ' + t('h(x)=' + n) + ', ' + t(n) + ' is the input.', why: 'That is backwards: the number inside the brackets is always the <b>input</b>.' },
            { html: 'There is no difference: both mean ' + t('x=' + n) + '.', why: 'Only ' + t('h(' + n + ')') + ' has ' + t('x=' + n) + '. In ' + t('h(x)=' + n) + ' the <b>output</b> is ' + t(n) + ', and ' + t('x') + ' is unknown.' },
            { html: t('h(' + n + ')') + ' means ' + t('h\\times ' + n) + ', and ' + t('h(x)=' + n) + ' means ' + t('h\\times x=' + n) + '.', why: 'In function notation the brackets don’t mean multiplication: ' + t('h(' + n + ')') + ' is “the output of ' + t('h') + ' when the input is ' + t(n) + '”.' }],
            'Part (a) put ' + t(n) + ' <b>in</b> for ' + t('x') + ' and worked out the output. Part (b) set the <b>output</b> equal to ' + t(n) + ' and solved for the input ' + t('x') + '.',
            ['The number in the brackets is always the input.'], 'h(n) vs h(x)=n');
        } }] },

    /* ======================= RF8 — MAS ======================= */
    { num: '27', outcome: 'RF8',
      shared: function (r) {
        var c = r.pick([
          { what: 'A kayak rental', fn: 'C', v: 'h', u: 'hour', us: 'hours', m: [15, 12, 18], b: [20, 25, 30], a: [2, 3, 4], verb: 'renting a kayak for', who: r.pick(['Jen', 'Ravi', 'Lee']), pay: 'paid', thing: 'rented the kayak' },
          { what: 'A bike share', fn: 'C', v: 'm', u: 'minute', us: 'minutes', m: [0.3, 0.25, 0.2], b: [2, 3], a: [20, 40], verb: 'a bike-share ride of', who: r.pick(['Ravi', 'Ana', 'Theo']), pay: 'paid', thing: 'his or her ride was' },
          { what: 'A gym membership', fn: 'G', v: 'n', u: 'month', us: 'months', m: [40, 35, 45], b: [75, 50, 60], a: [6, 4, 3], verb: 'a gym membership for', who: r.pick(['Lee', 'Maya', 'Sam']), pay: 'paid', thing: 'the membership lasted' }]);
        var m = r.pick(c.m), b = r.pick(c.b), a = r.pick(c.a), np = find(function () { return r.int(5, 12) * (c.v === 'm' ? 5 : 1); }, function (n) { return n !== a; }, 6);
        return { c: c, m: m, b: b, a: a, np: np, k: r.int(4, 9) * (c.v === 'm' ? 2 : 1) };
      },
      stem: function (s) { var c = s.c; return c.what + ' costs ' + t(c.fn + '(' + c.v + ')=' + lin(s.m, s.b, c.v)) + ' dollars for ' + t(c.v) + ' ' + c.us + '.'; },
      parts: [
        { id: '27a', sub: 'a', outcome: 'RF8', level: 'MAS', make: function (r, s) {
          var c = s.c, val = cl(s.m * s.a + s.b), st = c.fn + '(' + s.a + ')=' + money(val);
          var chk = function (resp) {
            resp = resp || []; var p0 = HW.parse.number(String(resp[0] == null ? '' : resp[0])), p1 = HW.parse.number(String(resp[1] == null ? '' : resp[1]).replace(/^\$/, ''));
            if (!p0.ok || !p1.ok) return form('empty', 'Fill in both blanks with numbers.');
            if (same(p0.value, s.a) && same(p1.value, val)) return ok();
            if (same(p0.value, val) && same(p1.value, s.a)) return wrong('u5t-io-swap', 'Swapped: in ' + t(st) + ' the number in the brackets, ' + t(s.a) + ', is the input (the ' + c.us + '), and ' + t(money(val)) + ' is the output (the cost in dollars).');
            return wrong('value', 'Read the statement: ' + t(c.fn + '(\\text{input})=\\text{output}') + '.');
          };
          return { prompt: 'Explain what ' + t(st) + ' means in this situation by completing the sentence.', input: { type: 'fields', fields: [{ name: c.us, label: c.verb.charAt(0).toUpperCase() + c.verb.slice(1), after: c.us }, { name: 'cost', label: 'costs', before: '$' }] },
            check: chk, key: [String(s.a), money(val)], bad: [[money(val), String(s.a)]], answer: c.verb.charAt(0).toUpperCase() + c.verb.slice(1) + ' ' + t(s.a) + ' ' + c.us + ' costs ' + t('\\$' + money(val)) + '.',
            solution: 'In ' + t(st) + ' the input is ' + t(c.v + '=' + s.a) + ' (' + c.us + ') and the output is ' + t(money(val)) + ' (dollars): the cost of ' + c.verb + ' ' + t(s.a) + ' ' + c.us + ' is ' + t('\\$' + money(val)) + '.',
            hints: ['The number in the brackets is the input (here, ' + c.us + '); the number after the equals sign is the output (dollars).'], text: 'meaning of ' + st };
        } },
        { id: '27b', sub: 'b', outcome: 'RF8', level: 'MAS', make: function (r, s) {
          var c = s.c, tot = cl(s.m * s.np + s.b), v = c.v, fn = c.fn;
          var stChk = function (resp) {
            var q = clean(resp).replace(/\s+/g, '').replace(/\\\$|\$/g, ''); if (!q) return form('empty', 'Write the statement in function notation.');
            var parts = q.split('='), m1 = /^([A-Za-z])\(([^()]*)\)$/.exec(q);
            if (m1 && HW.parse.number(m1[2]).ok && same(HW.parse.number(m1[2]).value, tot)) return wrong('u5t-stmt-input', t(money(tot)) + ' dollars is the <b>output</b> (the cost), not the input: it goes after the equals sign, ' + t(fn + '(' + v + ')=' + money(tot)) + '.');
            if (parts.length !== 2) return form('stmt-unreadable', 'Write one statement, e.g. ' + t(fn + '(' + v + ')=\\ldots') + '.');
            var A = parts[0], B = parts[1], reF = /^([A-Za-z])\(([^()]*)\)$/, mA = reF.exec(A), num = B;
            if (!mA) { mA = reF.exec(B); num = A; }
            if (!mA) return form('stmt-unreadable', 'Use function notation: start with ' + t(fn + '(' + v + ')=') + ', not the rule itself.');
            var nv = HW.parse.number(num);
            if (mA[1] !== fn) return wrong('stmt-name', 'The function is named ' + t(fn) + '.');
            if (HW.parse.number(mA[2]).ok && same(HW.parse.number(mA[2]).value, tot)) return wrong('u5t-stmt-input', t(money(tot)) + ' dollars is the <b>output</b> (the cost), so it goes after the equals sign: ' + t(fn + '(' + v + ')=' + money(tot)) + '.');
            if (mA[2] !== v) return form('stmt-arg', 'The input is unknown, so keep the letter ' + t(v) + ' in the brackets: ' + t(fn + '(' + v + ')=\\ldots') + '.');
            if (!nv.ok) return form('stmt-unreadable', 'After the equals sign, write the cost as a number.');
            return same(nv.value, tot) ? ok() : wrong('value', 'The amount paid is ' + t('\\$' + money(tot)) + '.');
          };
          var vc = numChk(s.np, [{ v: cl(tot / s.m), code: 'u5t-fee', hint: 'Subtract the fixed fee of ' + t('\\$' + money(s.b)) + ' first, then divide by ' + t(money(s.m)) + '.' }, { v: cl((tot + s.b) / s.m), code: 'fn-solve-inverse', hint: 'To undo ' + t('+' + money(s.b)) + ', subtract ' + t(money(s.b)) + ' from both sides.' }, { v: cl(tot - s.b), code: 'fn-solve-divide', hint: 'Last step: divide by ' + t(money(s.m)) + '.' }, { v: cl(s.m * tot + s.b), code: 'u5t-ev-instead', hint: 'That is ' + t(fn + '(' + money(tot) + ')') + '. Here ' + t(money(tot)) + ' is the cost (output): solve for ' + t(v) + '.' }]);
          var p = P.fields(c.who + ' ' + c.pay + ' ' + t('\\$' + money(tot)) + '. Write this in function notation, then find how many ' + c.us + '.',
            [{ name: 'Statement', label: 'In function notation:', mode: 'math', keys: EQK, vars: [fn, v], wide: true, placeholder: 'e.g. ' + fn + '(' + v + ') = …' }, { name: v, before: t(v + '='), after: c.us }],
            [stChk, vc], [fn + '(' + v + ')=' + money(tot), String(s.np)], t(fn + '(' + v + ')=' + money(tot)) + '; ' + t(v + '=' + s.np) + ' ' + c.us,
            t(fn + '(' + v + ')=' + money(tot)) + '<br>' + t(lin(s.m, s.b, v) + '=' + money(tot)) + '<br>' + t(money(s.m) + v + '=' + money(cl(tot - s.b))) + '<br>' + t(v + '=' + s.np) + ' ' + c.us + '.',
            ['The cost is the output: ' + t(fn + '(' + v + ')=\\text{cost}') + '.', 'Subtract the fixed fee, then divide by the rate.'], 'solve ' + fn + '(' + v + ')=' + money(tot));
          p.bad = [[fn + '(' + money(tot) + ')', String(s.np)], [fn + '(' + v + ')=' + money(tot), nT(cl(tot / s.m))]];
          return p;
        } },
        { id: '27c', sub: 'c', outcome: 'RF8', level: 'MAS', make: function (r, s) {
          var c = s.c, k = s.k, fn = c.fn, d = s.m;
          var unitChk = function (resp) {
            var w = String(resp == null ? '' : resp).toLowerCase().replace(/\\text\{([^}]*)\}/g, '$1').replace(/[^a-z ]/g, ' ').replace(/\s+/g, ' ').trim().replace(/^(one |an? |each |extra |additional |more |every )+/, '').replace(/^(extra |additional |more )+/, '');
            if (!w) return form('empty', 'Type a word.');
            var units = { hour: /^(hours?|hrs?|h)$/, minute: /^(minutes?|mins?|m)$/, month: /^(months?|mo)$/ }[c.u];
            if (units.test(w)) return ok();
            if (/dollar|cost|price|money|\$/.test(w)) return wrong('u5t-diff-unit', 'The difference is measured in dollars — but it is the cost of one extra what? Compare the inputs ' + t(k + 1) + ' and ' + t(k) + '.');
            return wrong('u5t-diff-unit', 'The inputs ' + t(k + 1) + ' and ' + t(k) + ' are ' + c.us + '. One more ' + c.u + ' costs this much.');
          };
          var a1 = cl(s.m * (k + 1) + s.b), a0 = cl(s.m * k + s.b);
          var p = P.fields('What does ' + t(fn + '(' + (k + 1) + ')-' + fn + '(' + k + ')') + ' tell you? Find it, then complete the sentence.',
            [{ name: 'Difference', label: t(fn + '(' + (k + 1) + ')-' + fn + '(' + k + ')='), before: '$' }, { name: 'unit', label: 'It is the cost of each extra', mode: 'text', placeholder: 'a word' }],
            [numChk(d, [{ v: a1, code: 'u5t-diff-val', hint: 'That is ' + t(fn + '(' + (k + 1) + ')') + ' alone. Subtract ' + t(fn + '(' + k + ')=' + money(a0)) + '.' }, { v: a0, code: 'u5t-diff-val', hint: 'That is ' + t(fn + '(' + k + ')') + ' alone. Find ' + t(fn + '(' + (k + 1) + ')') + ' too and subtract.' }, { v: cl(d + s.b), code: 'u5t-diff-val', hint: 'That is ' + t(fn + '(1)') + ', the cost of one ' + c.u + ' including the fixed fee. Subtract the two costs.' }]), unitChk],
            [money(d), c.u], t(fn + '(' + (k + 1) + ')-' + fn + '(' + k + ')=' + money(a1) + '-' + money(a0) + '=' + money(d)) + ': each extra ' + c.u + ' costs ' + t('\\$' + money(d)),
            t(fn + '(' + (k + 1) + ')=' + money(a1)) + ' and ' + t(fn + '(' + k + ')=' + money(a0)) + ', so the difference is ' + t('\\$' + money(d)) + '. Going from ' + t(k) + ' to ' + t(k + 1) + ' ' + c.us + ' adds ' + t('\\$' + money(d)) + ': each extra ' + c.u + ' costs ' + t('\\$' + money(d)) + ' (the rate in the rule; the fixed fee cancels).',
            ['Work out both costs and subtract.', 'The two inputs differ by one ' + c.u + '.'], 'meaning of a difference of outputs');
          p.bad = [[money(a1), c.u], [money(d), 'dollar']];
          return p;
        } }] },
    { num: '28', outcome: 'RF8',
      shared: function (r) {
        var c = r.pick([
          { f: 'B', v: 't', S: [80, 85, 88, 90, 92, 95, 96, 100], k: [4, 5], u: 'hours', u1: 'h', what: 'percent', s: function (q) { return 'A phone’s battery charge, ' + t('B(t)') + ' percent, drops at a constant rate, ' + t('t') + ' hours after it is unplugged.'; }, zero: 'the battery is dead', neg: 'a battery charge can’t be negative' },
          { f: 'H', v: 't', S: [20, 24, 30, 36], k: [2, 3, 4], u: 'hours', u1: 'h', what: 'cm', s: function (q) { return 'A candle burns at a constant rate. ' + t('H(t)') + ' is its height, in cm, ' + t('t') + ' hours after it is lit.'; }, zero: 'the candle has burned out', neg: 'a height can’t be negative' },
          { f: 'S', v: 't', S: [60, 72, 90, 96, 120], k: [2, 3, 4, 6], u: 'days', u1: 'days', what: 'cm', s: function (q) { return 'A snowbank melts at a constant rate. ' + t('S(t)') + ' is its depth, in cm, ' + t('t') + ' days after it stops snowing.'; }, zero: 'the snow has all melted', neg: 'a depth can’t be negative' }]);
        return find(function () { var S0 = r.pick(c.S), k = r.pick(c.k), t1 = r.int(2, 6); return { c: c, S0: S0, k: k, t1: t1, T: S0 / k + r.int(2, 6) }; }, function (q) { return q.S0 % q.k === 0 && q.S0 / q.k >= 6 && q.S0 / q.k <= 40 && q.S0 - q.k * q.t1 > 0; }, { c: c, S0: 30, k: 2, t1: 4, T: 18 });
      },
      stem: function (q) { var c = q.c; return c.s(q) + ' ' + t(c.f + '(0)=' + q.S0) + ' and ' + t(c.f + '(' + q.t1 + ')=' + (q.S0 - q.k * q.t1)) + '.'; },
      parts: [
        { id: '28a', sub: 'a', outcome: 'RF8', level: 'MAS', make: function (r, q) {
          var c = q.c, rhs = linB(q.S0, -q.k, c.v), d1 = q.S0 - q.k * q.t1;
          return convPart('fn', 'Write an equation for ' + t(c.f + '(' + c.v + ')') + '.', { T: PL.parse(rhs), v: c.v, name: c.f, reqName: true, keyRhs: rhs, good: [c.f + '(' + c.v + ')=' + lin(-q.k, q.S0, c.v)],
            wrong: [{ is: PL.parse(linB(q.S0, q.k, c.v)), code: 'rate-sign', hint: 'The ' + (c.f === 'B' ? 'charge' : c.f === 'H' ? 'height' : 'depth') + ' goes <b>down</b>, so the rate is negative.' },
              { is: PL.parse(linB(q.S0, -(q.S0 - d1), c.v)), code: 'u5t-model-rate', hint: 'That uses the whole drop, ' + t(q.S0 - d1) + ', as the rate. Divide by the time it took, ' + t(q.t1) + ' ' + c.u + '.' },
              { is: PL.parse(lin(q.S0, -q.k, c.v)), code: 'u5t-model-swap', hint: 'The start value ' + t(q.S0) + ' is the constant term; the rate multiplies ' + t(c.v) + '.' },
              { is: PL.parse(linB(d1, -q.k, c.v)), code: 'u5t-model-swap', hint: 'The constant term is the value at ' + t(c.v + '=0') + ': ' + t(c.f + '(0)=' + q.S0) + '.' }] },
            'Rate ' + t('=\\dfrac{' + d1 + '-' + q.S0 + '}{' + q.t1 + '-0}=-' + q.k) + ' ' + c.what + ' per ' + c.u.replace(/s$/, '') + '. Start value ' + t(c.f + '(0)=' + q.S0) + '.<br>' + t(c.f + '(' + c.v + ')=' + rhs),
            ['Find the rate of change from the two values: change in output ÷ change in input.', t(c.f + '(0)') + ' is the start value (the constant term).'], 'write the model ' + c.f);
        } },
        { id: '28b', sub: 'b', outcome: 'RF8', level: 'MAS', make: function (r, q) {
          var c = q.c, z = q.S0 / q.k, rhs = linB(q.S0, -q.k, c.v);
          return numPart('Solve ' + t(c.f + '(' + c.v + ')=0') + ', then complete the sentence: ' + c.zero + ' after', z, [{ v: q.S0, code: 'u5t-ev-instead', hint: 'That is ' + t(c.f + '(0)') + ', the start value. Solve ' + t(rhs + '=0') + ' for ' + t(c.v) + '.' }, { v: -z, code: 'fn-solve-sign', hint: 'Time can’t be negative: check the sign when you divide by ' + t(-q.k) + '.' }, { v: q.S0 * q.k, code: 'fn-solve-divide', hint: 'Divide ' + t(q.S0) + ' by ' + t(q.k) + ' — don’t multiply.' }],
            t(rhs + '=0') + '<br>' + t(q.S0 + '=' + q.k + c.v) + '<br>' + t(c.v + '=' + z) + ': ' + c.zero + ' ' + t(z) + ' ' + c.u + ' after the start.',
            ['Set the rule equal to ' + t('0') + ' and solve.', 'The answer is a time: when the quantity reaches ' + t('0') + '.'], 'solve ' + c.f + '(t)=0', { after: c.u });
        } },
        { id: '28c', sub: 'c', outcome: 'RF8', level: 'MAS', make: function (r, q) {
          var c = q.c, z = q.S0 / q.k, val = q.S0 - q.k * q.T;
          var p = P.fields('Explain why ' + t(c.f + '(' + q.T + ')') + ' has no meaning here: find its value, then complete the realistic domain, ' + t('\\{' + c.v + '\\mid a\\le ' + c.v + '\\le b,\\ ' + c.v + '\\in\\mathbb{R}\\}') + ', which does not include ' + t(c.v + '=' + q.T) + '.',
            [{ name: c.f + '(' + q.T + ')', before: t(c.f + '(' + q.T + ')=') }, { name: 'a', before: t('a=') }, { name: 'b', before: t('b=') }],
            [numChk(val, [{ v: -val, code: 'ev-sign', hint: 'Check: ' + t(q.S0 + '-' + q.k + '\\times ' + q.T) + ' is less than zero.' }]), numChk(0, []), numChk(z, [{ v: q.T, code: 'u5t-dom-T', hint: 'The model stops making sense when the value reaches ' + t('0') + ', at ' + t(c.v + '=' + z) + ' — before ' + t(q.T) + '.' }, { v: q.S0, code: 'u5t-dom-T', hint: 'The domain is about time (' + t(c.v) + '), not the start value. When does the value reach ' + t('0') + '?' }])],
            [String(val), '0', String(z)], t(c.f + '(' + q.T + ')=' + val) + '; domain ' + t('\\{' + c.v + '\\mid 0\\le ' + c.v + '\\le ' + z + ',\\ ' + c.v + '\\in\\mathbb{R}\\}'),
            t(c.f + '(' + q.T + ')=' + q.S0 + '-' + q.k + '(' + q.T + ')=' + val) + ', but ' + c.neg + '. The model only works from ' + t(c.v + '=0') + ' until the value reaches ' + t('0') + ' at ' + t(c.v + '=' + z) + ': the domain is ' + t('\\{' + c.v + '\\mid 0\\le ' + c.v + '\\le ' + z + ',\\ ' + c.v + '\\in\\mathbb{R}\\}') + ', and ' + t(q.T) + ' is outside it.',
            ['Work out ' + t(c.f + '(' + q.T + ')') + '. Does that value make sense?', 'The domain runs from the start to the time found in (b).'], 'why ' + c.f + '(' + q.T + ') has no meaning');
          p.bad = [[String(val), '0', String(q.T)], [String(-val), '0', String(z)]];
          return p;
        } }] }
  ];

  /* the student's (wrong) domain and range in Q21 */
  function stuD(s) { // arrow treated as an end; hollow point written with ≤ when e2
    var incl = s.open ? !s.e2 ? false : true : true;
    return s.side === 'L' ? bld('x', s.ex, s.tx, incl, true) : bld('x', s.tx, s.ex, true, incl);
  }
  function stuR(s) { // capped at the arrow tip; uses the end point's y instead of the vertex when e3
    var low = s.e3 ? s.ey : s.k;
    return s.up ? bld('y', low, s.ty) : bld('y', s.ty, low);
  }

  HW.defineTest({
    id: 'u5test', unit: 5, title: 'Unit 5 Test', outcome: 'RF2', calc: true,
    blurb: 'The Unit 5 outcomes-based test: RF1 (graphs of situations), RF2 (relations and functions, domain and range) and RF8 (function notation), each at the BEG, PRG and MAS levels. Scientific calculator allowed.',
    questions: QUESTIONS
  });
})(window);
