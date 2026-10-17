/* Math 10C · Unit 5 · Lesson 4 — Determining the Domain and Range of a Relation (RF2)
 * Assignment questions 1–9 (u5_L04.tex) and the Lesson 4 Extra Practice (u5_EP04.tex).
 * Every part is a generator: it keeps the booklet question's structure (repeated values, a vertical line's single
 * x-value, hollow vs solid endpoints, arrows, a peak or vertex inside the graph, a circle's centre ± radius, a
 * practical domain) and changes the numbers; the booklet's own numbers are among the possible values.
 * A domain-and-range question is one part with two boxes (Domain, Range) on the set keypad (K.set from js/relfn.js):
 * set-builder, inequality, interval and list forms are all accepted. Following the booklet's rule, a list with a value
 * written twice, or not in increasing order, gets a nudge that does not use a try.
 * Sketches (EP 10) become multiple choice between small graphs; explain-questions become multiple choice with
 * misconception hints; "give an example" (EP 11) is a typed set of ordered pairs checked for its counts.
 * Levels: LIM BEG EMG PRG ADV MAS. */
(function (root) {
  'use strict';
  var HW = root.HW, ex = HW.ex, F = HW.fmt, K = HW.kit, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form, B = K.P, S = HW.sets;

  HW.addCodes({
    'set-repeat': 'Wrote a value twice in a list', 'set-order': 'List not in increasing order',
    'dr-peak': 'Used an endpoint instead of the highest/lowest point', 'dr-open-side': 'Open dot attached to the wrong bound',
    'dr-vertex': 'Excluded the vertex (it is on the graph)', 'dr-one-value': 'Interval for a line with only one value',
    'dr-diameter': 'Used the diameter instead of the radius', 'dr-centre': 'Ignored the centre of the circle', 'dr-centre-sign': 'Sign of the centre coordinate',
    'dr-half': 'Only half of the curve', 'dr-opens': 'Wrong direction for the curve', 'dr-from-zero': 'Started the context at 0',
    'dr-copy': 'Copied the domain for the range', 'dr-no-b': 'Forgot the constant term', 'dr-square': 'Thought a square can be negative',
    'dr-unhit': 'Included an output with no arrow', 'dr-ray-dir': 'Wrong direction for the ray', 'dr-wrong-ends': 'Endpoints of the wrong segment',
    'tab-no-fee': 'Left out the flat fee', 'tab-add': 'Added instead of multiplying', 'tab-rate': 'Multiplied the fee too',
    'nr-all-pairs': 'Counted repeated values', 'nr-sum': 'Added instead of multiplying', 'nr-repeat': 'Counted a repeated value twice',
    'nr-lower': 'Used the lower bounds', 'nr-centre': 'Left out the radius / centre', 'cnt-zero': 'Forgot n = 0', 'cnt-extra': 'Counted one too many',
    'ea-outside': 'Value outside the bounds', 'ea-output': 'Value is an output', 'pairs-count': 'Ordered pairs with the wrong counts',
    'empty-time': 'Divided the wrong way', 'empty-vol': 'Gave the volume instead of the time', 'dr-scale': 'Misread the axis scale'
  });

  /* ---------------- numbers ---------------- */
  function range(a, b) { var o = []; for (var i = a; i <= b; i++) o.push(i); return o; }
  function nz(a, b) { return range(a, b).filter(function (x) { return x !== 0; }); }
  function uniq(a) { var s = a.slice().sort(function (x, y) { return x - y; }); return s.filter(function (x, i) { return i === 0 || Math.abs(x - s[i - 1]) > 1e-9; }); }
  function cl(x) { return Math.round(x * 1e6) / 1e6; }
  function ptT(p) { return '(' + p[0] + ',\\ ' + p[1] + ')'; }
  function ptsT(ps) { return ps.map(ptT).join(',\\ '); }
  function ptsH(ps) { return ps.map(function (p) { return t(ptT(p)); }).join(', '); }  // wraps on a phone
  function setH(ps) { var a = ps.map(ptT); a[0] = '\\{' + a[0]; a[a.length - 1] += '\\}'; return a.map(t).join(', '); }
  function sorted(a) { for (var i = 1; i < a.length; i++) if (a[i] < a[i - 1]) return false; return true; }
  function shuffleUnsorted(r, arr, key) { var s = r.shuffle(arr); for (var g = 0; g < 20 && sorted(s.map(key)); g++) s = r.shuffle(arr); return s; }
  function signed(x) { return x < 0 ? '-' + Math.abs(x) : '+' + x; }

  /* ---------------- set LaTeX ---------------- */
  function lst(a) { return '\\{' + uniq(a).join(', ') + '\\}'; }
  function cond(v, lo, hi, lc, hc) {
    lc = lc !== false; hc = hc !== false;
    if (lo == null && hi == null) return '';
    if (lo == null) return v + (hc ? '\\le ' : '<') + hi;
    if (hi == null) return v + (lc ? '\\ge ' : '>') + lo;
    return lo + (lc ? '\\le ' : '<') + v + (hc ? '\\le ' : '<') + hi;
  }
  function bld(v, lo, hi, lc, hc) { var c = cond(v, lo, hi, lc, hc); return '\\{' + v + '\\mid ' + (c ? c + ',\\ ' : '') + v + '\\in\\mathbb{R}\\}'; }
  function all(v) { return bld(v, null, null); }
  function nxt(r) { return r ? '\\le ' : '<'; }
  /* other correct ways to write a set (interval, bare inequality) — used for the tests' "good" answers */
  function ivAlt(tex) {
    var p = S.parse(tex); if (!p.ok || p.set.kind !== 'int' || p.set.parts.length !== 1) return tex;
    var q = p.set.parts[0], n = function (x) { return x === Infinity ? '\\infty' : x === -Infinity ? '-\\infty' : String(x); };
    return (q.lc ? '[' : '(') + n(q.lo) + ', ' + n(q.hi) + (q.hc ? ']' : ')');
  }
  function ineqAlt(tex, v) {
    var p = S.parse(tex); if (!p.ok || p.set.kind !== 'int' || p.set.parts.length !== 1) return tex;
    var q = p.set.parts[0];
    if (q.lo === -Infinity && q.hi === Infinity) return v + '\\in\\mathbb{R}';
    return cond(v, q.lo === -Infinity ? null : q.lo, q.hi === Infinity ? null : q.hi, q.lc, q.hc);
  }

  /* ---------------- checkers ---------------- */
  /* the raw values of a typed list {a, b, c} (in the order typed, repeats kept), or null if it isn't a plain list */
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
  /* K.set plus: the booklet's list rules (each value once, increasing order) and context-specific hints for the
   * built-in diagnoses (o.ctx = { code: hint }). o.wrong entries equal to the target are dropped. */
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
          if (dup) return o.dupWrong ? wrong('set-repeat', o.dupWrong) : form('set-repeat', 'Right values — but write each value <b>only once</b> in a list, even when it appears in several points.');
          if (!sorted(L)) return form('set-order', 'Right values — now write the list in <b>increasing order</b> (smallest first).');
        }
        return r;
      }
      if (r.v === 'wrong' && o.ctx && o.ctx[r.code]) return wrong(r.code, o.ctx[r.code]);
      return r;
    };
  }
  function ph(v) { return 'e.g. {' + v + ' | -2 <= ' + v + ' < 5, ' + v + ' in R}'; }
  /* one part, two boxes: Domain and Range.  o: dv, rv (letters), dW / rW (opt.wrong lists), dC / rC (ctx hints), good, bad */
  function drPart(prompt, D, R, o, sol, hints, text) {
    o = o || {}; var dv = o.dv || 'x', rv = o.rv || 'y';
    var cD = setChk(D, { v: dv, other: R, otherName: 'range', wrong: o.dW, ctx: o.dC }), cR = setChk(R, { v: rv, other: D, otherName: 'domain', wrong: o.rW, ctx: o.rC });
    var vars = [dv, rv].filter(function (v, i, a) { return a.indexOf(v) === i; });
    var fl = [{ label: 'Domain', name: 'Domain', mode: 'math', keys: 'set', vars: vars, placeholder: ph(dv) }, { label: 'Range', name: 'Range', mode: 'math', keys: 'set', vars: vars, placeholder: ph(rv) }];
    var p = B.fields(prompt, fl, [cD, cR], [D, R], t('D=' + D) + '<br>' + t('R=' + R), sol, hints, text);
    p.good = [[ivAlt(D), ivAlt(R)], [ineqAlt(D, dv), ineqAlt(R, rv)]].concat(o.good || []);
    var Dp = S.parse(D).set, Rp = S.parse(R).set, bad = [];
    if (!S.eq(Dp, Rp)) bad.push([R, D]);
    (o.dW || []).forEach(function (w) { var q = S.parse(w.is); if (q.ok && !S.eq(q.set, Dp)) bad.push([w.is, R]); });
    (o.rW || []).forEach(function (w) { var q = S.parse(w.is); if (q.ok && !S.eq(q.set, Rp)) bad.push([D, w.is]); });
    p.bad = bad.concat(o.bad || []);
    return p;
  }
  /* a single set box (one domain or one range) */
  function setPart(prompt, target, o, sol, hints, text) {
    o = o || {}; var v = o.v || 'x';
    var p = B.math(prompt, setChk(target, o), target, sol, hints, text, { keys: 'set', vars: [v], before: o.before, placeholder: ph(v) });
    p.good = [ivAlt(target), ineqAlt(target, v)].concat(o.good || []); p.bad = o.bad || [];
    return p;
  }
  function mc2(p) { p.input.columns = 2; return p; }
  function readPairs(resp) {
    var s = String(resp || '').replace(/\\(left|right)\.?/g, '').replace(/\\lparen/g, '(').replace(/\\rparen/g, ')').replace(/\\lbrace|\\rbrace|\\\{|\\\}|[{}]/g, ' ');
    if (!s.trim()) return { empty: true };
    var re = /\(([^()]*)\)/g, m, out = [];
    while ((m = re.exec(s))) {
      var xy = m[1].split(','); if (xy.length !== 2) return { bad: true };
      var a = ex.parse(xy[0].trim()), b = ex.parse(xy[1].trim()); if (!a.ok || !b.ok) return { bad: true };
      out.push([ex.value(a.ast), ex.value(b.ast)]);
    }
    if (s.replace(re, '').replace(/[,\s]/g, '').length || !out.length) return { bad: true };
    return { pairs: out };
  }

  /* ---------------- drawings ---------------- */
  var EDGE = 5.4;
  function G(spec) { return HW.graph(Object.assign({ x: [-6, 6], y: [-6, 6], labels: 1, max: 300 }, spec)); }
  function Gs(spec) { return HW.graph(Object.assign({ x: [-6, 6], y: [-6, 6], labels: 2, max: 175 }, spec)); }
  function toEdge(p, d, w) {
    w = w || EDGE; var k = Infinity;
    if (d[0] > 0) k = Math.min(k, (w - p[0]) / d[0]); if (d[0] < 0) k = Math.min(k, (-w - p[0]) / d[0]);
    if (d[1] > 0) k = Math.min(k, (w - p[1]) / d[1]); if (d[1] < 0) k = Math.min(k, (-w - p[1]) / d[1]);
    return [cl(p[0] + k * d[0]), cl(p[1] + k * d[1])];
  }
  function ellPts(h, k, a, b) { var o = []; for (var i = 0; i <= 96; i++) { var th = 2 * Math.PI * i / 96; o.push([cl(h + a * Math.cos(th)), cl(k + b * Math.sin(th))]); } return o; }
  function ellipse(h, k, a, b) { return { pts: ellPts(h, k, a, b) }; }
  function line(m, b, w) { // a full line y = mx + b with arrows at both ends (or a vertical line x = b when m is null)
    if (m == null) return { pts: [[b, -(w || EDGE)], [b, w || EDGE]], start: 'arrow', end: 'arrow' };
    var p = [0, b], d = [1, m]; return { pts: [toEdge(p, [-1, -m], w), toEdge(p, d, w)], start: 'arrow', end: 'arrow' };
  }
  function parab(h, k, a, w) { // y = k + a(x - h)^2 with arrows, clipped to the box
    w = w || EDGE; var lim = a > 0 ? w : -w, dx = Math.sqrt((lim - k) / a);
    var lo = Math.max(-w, h - dx), hi = Math.min(w, h + dx);
    return { f: function (x) { return k + a * (x - h) * (x - h); }, from: lo, to: hi, start: 'arrow', end: 'arrow' };
  }
  function flexFigs(list) { return '<div style="display:flex;flex-wrap:wrap;gap:6px 14px">' + list.map(function (f) { return '<div style="flex:1 1 150px;max-width:220px">' + f + '</div>'; }).join('') + '</div>'; }

  var HINT_D = 'The <b>domain</b> is every ' + t('x') + '-value the relation uses (look left to right); the <b>range</b> is every ' + t('y') + '-value it produces (look bottom to top).';
  var HINT_DOTS = 'Solid dot → that value is included (' + t('\\le') + '). Hollow dot → excluded (' + t('<') + '). Arrow → no end on that side.';
  var HINT_LIST = 'Separate points give a <b>list</b> in braces, each value once, smallest first, e.g. ' + t('\\{-2, 1, 5\\}') + '.';

  /* ---------------- reusable makers ---------------- */
  /* domain & range of a set of ordered pairs (shown as a list, a table, or words) */
  function pairsDR(prompt, pairs, o) {
    o = o || {}; var dv = o.dv || 'x', rv = o.rv || 'y';
    var xs = pairs.map(function (p) { return p[0]; }), ys = pairs.map(function (p) { return p[1]; }), D = lst(xs), R = lst(ys);
    var rep = function (a) { var u = uniq(a); return u.length < a.length; };
    var sol = (o.solPre || '') + 'First coordinates (' + t(dv) + '): ' + t(xs.join(',\\ ')) + (rep(xs) ? ' — repeated values are written once' : '') + '. ' +
      'Second coordinates (' + t(rv) + '): ' + t(ys.join(',\\ ')) + (rep(ys) ? ' — repeated values are written once' : '') + '.<br>' +
      'In increasing order: ' + t('D=' + D) + ' and ' + t('R=' + R) + '.';
    var good = [[D.replace(/^\\\{/, '\\left\\lbrace ').replace(/\\\}$/, '\\right\\rbrace '), R]];
    var bad = [];
    if (uniq(xs).length > 1) bad.push(['\\{' + uniq(xs).slice(1).join(', ') + '\\}', R]);
    if (uniq(ys).length > 1) bad.push([D, bld(rv, uniq(ys)[0], uniq(ys)[uniq(ys).length - 1])]);
    var p = drPart(prompt, D, R, { dv: dv, rv: rv, good: good, bad: bad, dW: o.dW, rW: o.rW }, sol,
      [HINT_D.replace('(look left to right)', '— the first numbers').replace('(look bottom to top)', '— the second numbers'), HINT_LIST], o.text || 'domain and range of pairs');
    return p;
  }
  function arrowDR(left, right, pairs, o) {
    o = o || {};
    var used = uniq(pairs.map(function (p) { return p[1]; })), D = lst(left), R = lst(used);
    var unhit = right.filter(function (v) { return used.indexOf(v) < 0; });
    var rW = unhit.length ? [{ is: lst(right), code: 'dr-unhit', hint: 'Check every value on the right: ' + t(unhit.join(',\\ ')) + ' receives <b>no arrow</b>, so the relation never produces it. Only values that are landed on are in the range.' }] : [];
    var sol = 'The arrows are ' + t(pairs.map(function (p) { return p[0] + '\\to ' + p[1]; }).join(',\\ ')) + '.<br>' +
      'Domain = the starting values on the left: ' + t('D=' + D) + '.<br>Range = the values actually landed on: ' + t('R=' + R) + (used.length < pairs.length ? ' (a value hit by several arrows is listed once)' : '') + (unhit.length ? '; ' + t(unhit.join(',\\ ')) + ' gets no arrow, so it is not in the range' : '') + '.';
    return drPart((o.pre || '') + HW.arrowDiagram(left, right, pairs), D, R, { rW: rW, bad: [[D, lst(pairs.map(function (p) { return p[1]; }).concat([used[0] + 100]))]] }, sol,
      ['The domain is the set of values the arrows <b>start</b> from; the range is the set of values the arrows <b>point to</b>.', 'List each value once, smallest first.'], o.text || 'domain and range of an arrow diagram');
  }
  /* a segment from P to Q with end styles (closed / open), both bounds from the endpoints */
  function segDR(P, Q, sP, sQ, o) {
    o = o || {};
    var L = P[0] < Q[0] ? [P, sP] : [Q, sQ], Rt = P[0] < Q[0] ? [Q, sQ] : [P, sP];
    var lo = L[0][1] < Rt[0][1] ? L : Rt, hi = L[0][1] < Rt[0][1] ? Rt : L;
    var D = bld('x', L[0][0], Rt[0][0], L[1] === 'closed', Rt[1] === 'closed'), R = bld('y', lo[0][1], hi[0][1], lo[1] === 'closed', hi[1] === 'closed');
    var rW = [], dW = [];
    if (sP !== sQ) {
      rW.push({ is: bld('y', lo[0][1], hi[0][1], hi[1] === 'closed', lo[1] === 'closed'), code: 'dr-open-side', hint: 'Match each end of the range to its dot: the hollow dot is ' + t(ptT(sP === 'open' ? P : Q)) + ', so it is ' + t('y=' + (sP === 'open' ? P : Q)[1]) + ' that is excluded. The solid dot ' + t(ptT(sP === 'open' ? Q : P)) + ' keeps ' + t('y=' + (sP === 'open' ? Q : P)[1]) + '.' });
      dW.push({ is: bld('x', L[0][0], Rt[0][0], Rt[1] === 'closed', L[1] === 'closed'), code: 'dr-open-side', hint: 'Match each end of the domain to its dot: the hollow dot is at ' + t('x=' + (sP === 'open' ? P : Q)[0]) + ', so that value is excluded; the solid dot keeps ' + t('x=' + (sP === 'open' ? Q : P)[0]) + '.' });
    }
    var desc = function (pt, s) { return (s === 'open' ? 'hollow' : 'solid') + ' dot ' + t(ptT(pt)) + ' (' + (s === 'open' ? 'excluded' : 'included') + ')'; };
    var sol = 'The segment runs from the ' + desc(L[0], L[1]) + ' to the ' + desc(Rt[0], Rt[1]) + '.<br>' +
      '<b>Domain</b> (left to right): ' + t('x') + ' from ' + t(L[0][0]) + ' to ' + t(Rt[0][0]) + ', so ' + t('D=' + D) + '.<br>' +
      '<b>Range</b> (bottom to top): ' + t('y') + ' from ' + t(lo[0][1]) + ' to ' + t(hi[0][1]) + ', so ' + t('R=' + R) + '.';
    return drPart(G({ segs: [{ pts: [P, Q], start: sP, end: sQ }] }), D, R, { dW: dW, rW: rW }, sol, [HINT_D, HINT_DOTS], o.text || 'domain and range of a segment');
  }
  /* a "V" from end L down (or up) to the vertex M and back up to end Rt. ends: 'closed' | 'open' */
  function vDR(Lp, M, Rp, ends, o) {
    o = o || {};
    var top = Math.max(Lp[1], Rp[1]), ymin = Math.min(M[1], Lp[1], Rp[1]), ymax = Math.max(M[1], Lp[1], Rp[1]);
    var lowEnd = Lp[1] <= Rp[1] ? Lp : Rp, peak = M[1] > top; // peak: M is the top (an upside-down V)
    var cl0 = ends === 'closed';
    var D = bld('x', Lp[0], Rp[0], cl0, cl0), R;
    var rW = [], dW = [];
    if (peak) { // inverted: bottom from the lower endpoint, top from the peak
      R = bld('y', lowEnd[1], M[1], cl0, true);
      var other = Lp[1] <= Rp[1] ? Rp : Lp;
      if (other[1] !== lowEnd[1]) rW.push({ is: bld('y', other[1], M[1], cl0, true), code: 'dr-peak', hint: 'Check the lowest point: the graph goes down to ' + t('y=' + lowEnd[1]) + ' at ' + t(ptT(lowEnd)) + ', lower than the other end.' });
      rW.push({ is: bld('y', lowEnd[1], Math.max(Lp[1], Rp[1]), cl0, cl0), code: 'dr-peak', hint: 'The range is not just the two endpoints’ ' + t('y') + '-values: the highest point is the peak ' + t(ptT(M)) + '. Look for the highest and lowest points <b>anywhere</b> on the graph.' });
    } else {
      R = bld('y', M[1], top, true, cl0);
      rW.push({ is: bld('y', M[1], top, false, cl0), code: 'dr-vertex', hint: 'The lowest point ' + t(ptT(M)) + ' is a corner <b>on</b> the graph (no hollow dot there), so ' + t('y=' + M[1]) + ' is included: use ' + t('\\le') + '.' });
    }
    var sol = 'The graph goes from ' + t(ptT(Lp)) + ' to ' + t(ptT(M)) + ' to ' + t(ptT(Rp)) + '; the end dots are <b>' + (cl0 ? 'solid' : 'hollow') + '</b>' + (cl0 ? ' (included)' : ' (excluded)') + '.<br>' +
      '<b>Domain</b>: ' + t('x') + ' from ' + t(Lp[0]) + ' to ' + t(Rp[0]) + ': ' + t('D=' + D) + '.<br>' +
      '<b>Range</b>: lowest ' + t('y') + ' is ' + t(ymin) + ', highest is ' + t(ymax) + (peak ? ' (the peak ' + t(ptT(M)) + ')' : '') + (!cl0 && !peak ? '. The vertex ' + t(ptT(M)) + ' is on the graph, so ' + t(ymin) + ' is included; ' + t(top) + ' comes only from the hollow ends, so it is excluded' : '') + ': ' + t('R=' + R) + '.';
    return drPart(G({ segs: [{ pts: [Lp, M, Rp], start: ends, end: ends }] }), D, R, { dW: dW, rW: rW }, sol,
      [HINT_D, peak ? 'The highest point is not always an endpoint — check the corner in the middle.' : HINT_DOTS], o.text || 'domain and range of a V-shaped graph');
  }
  /* a full horizontal (kind 'h', y = c) or vertical (kind 'v', x = c) line */
  function hvDR(kind, c) {
    var D, R, o, sol;
    if (kind === 'h') {
      D = all('x'); R = lst([c]);
      o = { rW: [{ is: all('y'), code: 'dr-one-value', hint: 'Every point on this line has ' + t('y=' + c) + '. The line goes forever sideways, not up and down, so only one ' + t('y') + '-value is produced.' }],
        rC: { 'set-discrete': 'Every point on this horizontal line has the same ' + t('y') + '-value, ' + t(c) + ', so the range is just that one value: ' + t('\\{' + c + '\\}') + '.' },
        dW: [{ is: lst([c]), code: 'set-swap', hint: 'The line is ' + t('y=' + c) + ': ' + t(c) + ' is a ' + t('y') + '-value. The arrows show the line goes forever left and right, so every ' + t('x') + ' is used.' }] };
      sol = 'A horizontal line ' + t('y=' + c) + ' with arrows at both ends: it goes forever left and right, so every real ' + t('x') + ' is used, but every point has ' + t('y=' + c) + '.<br>' + t('D=' + D) + ', ' + t('R=' + R) + ' (one value, so a list).';
    } else {
      D = lst([c]); R = all('y');
      o = { dW: [{ is: all('x'), code: 'dr-one-value', hint: 'Every point on this line has ' + t('x=' + c) + '. The line goes forever up and down, not sideways, so only one ' + t('x') + '-value is used.' }],
        dC: { 'set-discrete': 'Every point on this vertical line has the same ' + t('x') + '-value, ' + t(c) + ', so the domain is just that one value: ' + t('\\{' + c + '\\}') + '.' },
        rW: [{ is: lst([c]), code: 'set-swap', hint: 'The line is ' + t('x=' + c) + ': ' + t(c) + ' is an ' + t('x') + '-value. The arrows show the line goes forever up and down, so every ' + t('y') + ' is reached.' }] };
      sol = 'A vertical line ' + t('x=' + c) + ' with arrows at both ends: every point has ' + t('x=' + c) + ', but it goes forever up and down, so every real ' + t('y') + ' is reached.<br>' + t('D=' + D) + ' (one value, so a list), ' + t('R=' + R) + '.';
    }
    o.good = [[kind === 'h' ? '\\mathbb{R}' : 'x=' + c, kind === 'h' ? 'y=' + c : '\\mathbb{R}'], [kind === 'h' ? 'all real numbers' : '\\{' + c + '\\}', kind === 'h' ? '\\{' + c + '\\}' : '(-\\infty,\\infty)']];
    return drPart(G({ segs: [kind === 'h' ? { pts: [[-EDGE, c], [EDGE, c]], start: 'arrow', end: 'arrow' } : line(null, c)] }), D, R, o, sol,
      [HINT_D, 'Arrows on both ends: the line never stops in that direction.'], (kind === 'h' ? 'horizontal' : 'vertical') + ' line, domain and range');
  }
  function circleDR(h, k, r, o) {
    o = o || {}; var dv = o.dv || 'x', rv = o.rv || 'y', a = o.a || r, b = o.b || r;
    var D = bld(dv, h - a, h + a), R = bld(rv, k - b, k + b);
    var dW = [], rW = [];
    if (!o.ellipse) {
      dW.push({ is: bld(dv, h - 2 * r, h + 2 * r), code: 'dr-diameter', hint: 'The radius ' + t(r) + ' is the distance from the centre to the edge. Go ' + t(r) + ' (not ' + t(2 * r) + ') each way from ' + t(dv + '=' + h) + '.' });
      rW.push({ is: bld(rv, k - 2 * r, k + 2 * r), code: 'dr-diameter', hint: 'The radius ' + t(r) + ' is the distance from the centre to the edge. Go ' + t(r) + ' (not ' + t(2 * r) + ') up and down from ' + t(rv + '=' + k) + '.' });
      if (h !== 0) { dW.push({ is: bld(dv, -r, r), code: 'dr-centre', hint: 'The circle is not centred at the origin: start from the centre’s ' + t(dv) + '-coordinate, ' + t(h) + ', and go ' + t(r) + ' each way.' }); dW.push({ is: bld(dv, -h - r, -h + r), code: 'dr-centre-sign', hint: 'Check the sign: the centre is ' + t(ptT([h, k])) + ', so its ' + t(dv) + '-coordinate is ' + t(h) + '.' }); }
      if (k !== 0) { rW.push({ is: bld(rv, -r, r), code: 'dr-centre', hint: 'The circle is not centred at the origin: start from the centre’s ' + t(rv) + '-coordinate, ' + t(k) + ', and go ' + t(r) + ' up and down.' }); rW.push({ is: bld(rv, -k - r, -k + r), code: 'dr-centre-sign', hint: 'Check the sign: the centre is ' + t(ptT([h, k])) + ', so its ' + t(rv) + '-coordinate is ' + t(k) + '.' }); }
    } else {
      dW.push({ is: bld(dv, 0, a), code: 'dr-half', hint: 'The curve also goes to the <b>left</b> of the ' + t(rv) + '-axis — include the negative ' + t(dv) + '-values too.' });
      rW.push({ is: bld(rv, 0, b), code: 'dr-half', hint: 'The curve also goes <b>below</b> the ' + t(dv) + '-axis — include the negative ' + t(rv) + '-values too.' });
    }
    var sol = o.ellipse
      ? 'The ellipse is centred at the origin. It reaches ' + t(dv + '=\\pm ' + a) + ' left and right and ' + t(rv + '=\\pm ' + b) + ' up and down, and the curve is unbroken.<br>' + t('D=' + D) + ', ' + t('R=' + R) + '. Use the axis letters ' + t(dv) + ' and ' + t(rv) + ', not ' + t('x') + ' and ' + t('y') + '.'
      : 'Centre ' + t(ptT([h, k])) + ', radius ' + t(r) + '.<br>Left/right: ' + t(h + '-' + r + '=' + (h - r)) + ' to ' + t(h + '+' + r + '=' + (h + r)) + '. Down/up: ' + t(k + '-' + r + '=' + (k - r)) + ' to ' + t(k + '+' + r + '=' + (k + r)) + '.<br>' +
        'The circle includes its edge points, so use ' + t('\\le') + ': ' + t('D=' + D) + ', ' + t('R=' + R) + '.';
    return drPart(o.prompt || '', D, R, { dv: dv, rv: rv, dW: dW, rW: rW }, sol,
      o.ellipse ? ['Find the farthest left and right points, then the lowest and highest.', 'The axes are labelled ' + t(dv) + ' and ' + t(rv) + ': use those letters.'] : ['A circle reaches one radius left, right, up and down from its centre.', 'Domain: centre’s ' + t('x') + ' ± radius. Range: centre’s ' + t('y') + ' ± radius.'], o.text || 'domain and range of a circle');
  }
  /* MC: which graph has this domain and range? opts: [{ g: spec, right, why }] */
  function graphMC(r, prompt, opts, sol, hints, text) {
    return mc2(B.mc(r, prompt, opts.map(function (o) { return { html: Gs(o.g), right: o.right, why: o.why }; }), sol, hints, text));
  }

  HW.defineLesson({
    id: 'u5l4', unit: 5, num: '4', title: 'Determining the Domain and Range of a Relation', outcome: 'RF2',
    blurb: 'The set of inputs and the set of outputs — read from ordered pairs, tables, arrow diagrams, graphs and real situations.',
    questions: [
      /* ---------- Q1 ordered pairs ---------- */
      { num: '1', section: 'Assignment 4', stem: 'List the domain and range of each set of ordered pairs.', parts: [
        { id: '1a', level: 'BEG', make: function (r) {
          var xs, ys;
          do { xs = r.sample(range(-4, 9), 5); } while (!xs.some(function (x) { return x < 0; }));
          var v3 = r.sample(nz(-5, 10), 3); while (!v3.some(function (y) { return y < 0; })) v3 = r.sample(nz(-5, 10), 3);
          ys = r.shuffle([v3[0], v3[0], v3[0], v3[1], v3[2]]);
          var pairs = shuffleUnsorted(r, xs.map(function (x, i) { return [x, ys[i]]; }), function (p) { return p[0]; });
          return pairsDR(ptsH(pairs), pairs, { text: 'D & R of 5 pairs (repeated y)' });
        } },
        { id: '1b', level: 'BEG', make: function (r) {
          var c = r.int(-9, -2), ys; do { ys = r.sample(nz(-5, 10), 4); } while (!ys.some(function (y) { return y < 0; }) || sorted(ys));
          var pairs = ys.map(function (y) { return [c, y]; });
          var p = pairsDR(ptsH(pairs), pairs, { text: 'D & R of pairs with one x-value' });
          p.hints = ['Every pair has the same first coordinate. How many different ' + t('x') + '-values is that?', HINT_LIST];
          return p;
        } }] },
      /* ---------- Q2 table ---------- */
      { num: '2', stem: 'State the domain and range of the relation given by the table of values below.', parts: [
        { id: '2', level: 'BEG', make: function (r) {
          var x0 = r.pick([-4, -3, -2]), xs = [x0]; for (var i = 0; i < 5; i++) xs.push(xs[i] + r.pick([1, 2]));
          var m = r.pick([-2, -3]), b = r.int(1, 6), pairs = xs.map(function (x) { return [x, b + m * x]; });
          var tab = HW.valueTable([[t('x')].concat(xs), [t('y')].concat(pairs.map(function (p) { return p[1]; }))]);
          var p = pairsDR(tab, pairs, { solPre: 'The domain is the top row and the range is the bottom row. ', text: 'D & R from a table' });
          p.hints = ['The domain is the top row (' + t('x') + '), the range is the bottom row (' + t('y') + ').', 'Write each list in increasing order — the ' + t('y') + '-row runs downhill, so reverse it.'];
          return p;
        } }] },
      /* ---------- Q3 arrow diagram ---------- */
      { num: '3', stem: 'State the domain and range of the relation shown in the arrow diagram below.', parts: [
        { id: '3', level: 'BEG', make: function (r) {
          var s = r.pick([1, 2, 3]), st = r.pick([1, 2, 3]), left = [s, s + st, s + 2 * st, s + 3 * st];
          var r1 = r.pick([5, 10, 12, 15]), r2 = r1 + r.pick([5, 10]), pat; do { pat = r.shuffle([0, 0, 1, 1]); } while (pat.join() === '0,0,1,1' || pat.join() === '1,1,0,0');
          return arrowDR(left, [r1, r2], left.map(function (l, i) { return [l, pat[i] ? r2 : r1]; }), { text: 'D & R of an arrow diagram' });
        } }] },
      /* ---------- Q4 graphs ---------- */
      { num: '4', stem: 'State the domain and range of each relation graphed below.', parts: [
        { id: '4a', level: 'BEG', make: function (r) {
          var xs = r.sample(range(-5, 5), 5).sort(function (a, b) { return a - b; }), ys = r.sample(nz(-5, 5), 5), pts = xs.map(function (x, i) { return [x, ys[i]]; });
          var p = pairsDR(G({ points: pts.map(function (q) { return { x: q[0], y: q[1] }; }) }), pts, { solPre: 'Five separate points: ' + ptsH(pts) + '. ', text: 'D & R of plotted points' });
          p.hints = ['These are separate dots, not a line: list the ' + t('x') + '-coordinates and the ' + t('y') + '-coordinates.', HINT_LIST];
          return p;
        } },
        { id: '4b', level: 'EMG', make: function (r) {
          var L = [r.int(-5, -3), 0], M = [r.int(-2, 0), r.int(3, 5)], Rp = [r.int(2, 4), 0], yy = r.sample(range(-4, -1), 2); L[1] = yy[0]; Rp[1] = yy[1];
          return vDR(L, M, Rp, 'closed', { text: 'D & R of a graph with a peak' });
        } },
        { id: '4c', level: 'PRG', make: function (r) {
          var h = r.pick([-1, 0, 0, 1]), k = r.int(-3, -1), s = r.pick([1, 1.5, 2]);
          var D = all('x'), R = bld('y', k, null);
          var sol = 'Two rays start at the vertex ' + t(ptT([h, k])) + ' and spread up and out with <b>arrows</b>, so they go on forever: every real ' + t('x') + ' is used. The lowest point is the vertex, which is on the graph, and there is no top.<br>' + t('D=' + D) + ', ' + t('R=' + R) + '.';
          return drPart(G({ segs: [{ pts: [toEdge([h, k], [-1, s]), [h, k], toEdge([h, k], [1, s])], start: 'arrow', end: 'arrow' }] }), D, R,
            { rW: [{ is: bld('y', k, null, false), code: 'dr-vertex', hint: 'The vertex ' + t(ptT([h, k])) + ' is on the graph (no hollow dot), so ' + t('y=' + k) + ' is included: use ' + t('\\ge') + '.' }, { is: all('y'), code: 'set-arrow', hint: 'The graph never goes below the vertex ' + t(ptT([h, k])) + ', so the range has a lowest value.' }],
              dC: { 'set-arrow': 'Look at the ends: the arrows mean the rays keep going forever, so they reach every ' + t('x') + '-value — the edge of the grid is not the end of the graph.' }, rC: { 'set-arrow': 'The graph has a lowest point (the vertex) but the arrows keep going up forever, so there is a bottom value and no top.' } },
            sol, [HINT_D, 'Arrows mean “keeps going”. Where is the lowest point?'], 'D & R of a V with arrows');
        } },
        { id: '4d', level: 'PRG', make: function (r) {
          return segDR([r.int(-5, -2), r.int(1, 4)], [r.int(1, 4), r.int(-4, -1)], 'open', 'closed', { text: 'D & R of a segment, hollow + solid' });
        } },
        { id: '4e', level: 'EMG', make: function (r) { return hvDR('h', r.pick([-4, -3, -2, 2, 3, 4])); } },
        { id: '4f', level: 'EMG', make: function (r) { return hvDR('v', r.pick([-4, -3, -2, 2, 3, 4])); } },
        { id: '4g', level: 'EMG', make: function (r) {
          var m = r.pick([1, -1, 2, -2, 0.5]), b = r.int(-2, 2), D = all('x'), R = all('y');
          var sol = 'A slanted line with arrows at both ends goes on forever left and right <b>and</b> up and down, so it uses every real ' + t('x') + ' and produces every real ' + t('y') + '.<br>' + t('D=' + D) + ', ' + t('R=' + R) + '.';
          return drPart(G({ segs: [line(m, b)] }), D, R, { dW: [{ is: bld('x', -5, 5), code: 'set-arrow', hint: 'The arrows mean the line keeps going past the edge of the grid, so there is no end value.' }], rW: [{ is: bld('y', -5, 5), code: 'set-arrow', hint: 'The arrows mean the line keeps going past the edge of the grid, so there is no end value.' }],
            dC: { 'set-arrow': 'Arrows on both ends: the line keeps going forever, so no ' + t('x') + '-value is left out.' }, rC: { 'set-arrow': 'Arrows on both ends: the line keeps going up and down forever, so no ' + t('y') + '-value is left out.' } },
            sol, [HINT_D, 'Arrows on both ends — does the line ever stop going left, right, up or down?'], 'D & R of a full slanted line');
        } },
        { id: '4h', level: 'PRG', make: function (r) {
          var a = r.int(-4, -1), b = r.int(-3, -1), s = r.pick([1, 1, 2, 0.5]), D = bld('x', a, null, false), R = bld('y', b, null, false);
          var sol = 'The ray starts at the <b>hollow</b> dot ' + t(ptT([a, b])) + ' (not on the graph) and goes up to the right forever.<br>' + t('x') + ' starts just after ' + t(a) + ' and grows forever; ' + t('y') + ' starts just above ' + t(b) + ' and grows forever.<br>' + t('D=' + D) + ', ' + t('R=' + R) + '.';
          return drPart(G({ segs: [{ pts: [[a, b], toEdge([a, b], [1, s])], start: 'open', end: 'arrow' }] }), D, R,
            { dW: [{ is: bld('x', null, a, true, false), code: 'dr-ray-dir', hint: 'The ray goes to the <b>right</b> of ' + t('x=' + a) + ', so the ' + t('x') + '-values are bigger than ' + t(a) + '.' }], rW: [{ is: bld('y', null, b, true, false), code: 'dr-ray-dir', hint: 'The ray goes <b>up</b> from ' + t('y=' + b) + ', so the ' + t('y') + '-values are bigger than ' + t(b) + '.' }] },
            sol, [HINT_D, HINT_DOTS], 'D & R of a ray with a hollow start');
        } },
        { id: '4i', level: 'PRG', make: function (r) {
          var h = r.pick([-1, 0, 0, 1]), c = r.pick([2, 3]), top = r.int(3, 5), v = r.int(-2, 0);
          return vDR([h - c, top], [h, v], [h + c, top], 'open', { text: 'D & R of a V with hollow ends' });
        } }] },
      /* ---------- Q5 curves, ellipse, words, circle ---------- */
      { num: '5', stem: 'State the domain and range of each relation described below.', parts: [
        { id: '5a', level: 'PRG', make: function (r) {
          var h = r.pick([-1, 0, 0, 1]), k = r.int(1, 4), a = r.pick([-0.5, -1]), D = all('x'), R = bld('y', null, k);
          var sol = 'The arrows show the curve falling forever on both sides, so every real ' + t('x') + ' is used. The highest point is the vertex ' + t(ptT([h, k])) + ', which is on the curve; there is no lowest point.<br>' + t('D=' + D) + ', ' + t('R=' + R) + '.';
          return drPart(G({ fns: [parab(h, k, a)] }), D, R,
            { rW: [{ is: bld('y', k, null), code: 'dr-opens', hint: 'The curve opens <b>down</b>: the vertex ' + t(ptT([h, k])) + ' is the <b>highest</b> point and the arrows go down forever, so ' + t('y\\le ' + k) + '.' }, { is: bld('y', null, k, true, false), code: 'dr-vertex', hint: 'The vertex ' + t(ptT([h, k])) + ' is on the curve, so ' + t('y=' + k) + ' is included: use ' + t('\\le') + '.' }],
              dC: { 'set-arrow': 'The arrows mean the curve keeps going down and outward forever, so every ' + t('x') + '-value is reached eventually.' } },
            sol, [HINT_D, 'Which way do the arrows point? Is there a highest point or a lowest point?'], 'D & R of a downward curve');
        } },
        { id: '5b', level: 'EMG', make: function (r) {
          var ab = r.pick([[5, 3], [4, 2], [5, 2], [4, 3], [3, 2], [5, 4]]), lt = r.pick([['p', 'q'], ['p', 'q'], ['u', 'v'], ['s', 't']]);
          return circleDR(0, 0, 0, { ellipse: true, a: ab[0], b: ab[1], dv: lt[0], rv: lt[1], text: 'D & R of an ellipse (letters ' + lt.join(',') + ')',
            prompt: 'An ellipse, with horizontal axis ' + t(lt[0]) + ' and vertical axis ' + t(lt[1]) + '.' + G({ segs: [ellipse(0, 0, ab[0], ab[1])], xName: lt[0], yName: lt[1] }) });
        } },
        { id: '5c', level: 'BEG', make: function (r) {
          var xs = r.sample(nz(-5, 5), 2).concat([0]).sort(function (a, b) { return a - b; }); if (r.chance(0.5)) xs = r.sample(range(-5, 5), 3).sort(function (a, b) { return a - b; });
          while (!xs.some(function (x) { return x < 0; })) xs = r.sample(range(-5, 5), 3).sort(function (a, b) { return a - b; });
          var c = r.pick(nz(-6, 9)), pairs = xs.map(function (x) { return [x, c]; });
          var p = pairsDR('A relation that assigns each of the values ' + t(xs.join(',\\ ')) + ' to the single output value ' + t(c) + '.', pairs,
            { solPre: 'The relation is ' + ptsH(pairs) + ': three inputs, all sent to one output. ', text: 'D & R from a description' });
          p.hints = ['The inputs are the domain; the outputs are the range.', 'The single output is written once: ' + t('\\{' + c + '\\}') + '-style.'];
          return p;
        } },
        { id: '5d', level: 'PRG', make: function (r) {
          var h = r.pick(nz(-5, 5)), k = r.pick(nz(-4, 4)), rad = r.int(3, 7); while (Math.abs(h) === Math.abs(k)) k = r.pick(nz(-4, 4));
          return circleDR(h, k, rad, { prompt: 'A circle with centre ' + t(ptT([h, k])) + ' and a radius of ' + t(rad) + '.', text: 'D & R of a circle from its centre and radius' });
        } }] },
      /* ---------- Q6 list or inequality ---------- */
      { num: '6', stem: function (sh) {
          return 'For each relation, state whether the domain and range are best described as a finite list of values or with an inequality, then write the domain and range using the appropriate notation.<br>' +
            '(a) ' + setH(sh.a) + '<br>(b) All points on the line ' + t('y=' + sh.m + 'x' + (sh.b ? signed(sh.b) : '')) + ' for ' + t(sh.lo + '\\le x\\le ' + sh.hi) + '.<br>(c) All points on the graph of ' + t('y=x^{2}' + (sh.k ? signed(sh.k) : '')) + '.';
        },
        shared: function (r) {
          var x0 = r.pick([-4, -3, -2]), st = r.pick([1, 2, 2, 3]), c = r.pick(nz(-5, 5));
          return { a: [0, 1, 2, 3].map(function (i) { return [x0 + i * st, c]; }), c: c, m: r.pick([2, 3]), b: r.pick(nz(-4, 4)), lo: r.int(-4, -1), hi: r.int(2, 6), k: r.pick([0, 0, -4, -3, -2, -1, 1, 2, 3, 4]) };
        },
        parts: [
          { id: '6', sub: 'list or inequality', level: 'LIM', make: function (r, sh) {
            var rows = [{ id: 'a', html: '(a) the four ordered pairs' }, { id: 'b', html: '(b) the line segment' }, { id: 'c', html: '(c) the graph of ' + t('y=x^{2}' + (sh.k ? signed(sh.k) : '')) }];
            var p = B.grid('Choose the notation for each relation.', rows, [{ id: 'list', html: 'Finite list' }, { id: 'ineq', html: 'Inequality' }], { a: 'list', b: 'ineq', c: 'ineq' },
              { why: function (row) { return row === 'a' ? 'Relation (a) has only four points, so only a few separate values: a <b>list</b>.' : 'Relation (' + row + ') is an unbroken line or curve: it has infinitely many points, so every value in between occurs — an <b>inequality</b>.'; } },
              '(a) has only four ordered pairs, so its domain and range are <b>finite lists</b>. (b) and (c) are unbroken lines/curves with infinitely many points, so they need <b>inequalities</b> (set-builder notation).',
              ['A few separate points → list. An unbroken line or curve → inequality.'], 'list vs inequality');
            return p;
          } },
          { id: '6a', sub: 'a', level: 'BEG', make: function (r, sh) {
            var p = pairsDR('(a) ' + setH(sh.a), sh.a, { solPre: 'Four ordered pairs only, so a <b>finite list</b>. All four share the output ' + t(sh.c) + '. ', text: 'D & R of four pairs, one y-value' });
            return p;
          } },
          { id: '6b', sub: 'b', level: 'PRG', make: function (r, sh) {
            var y1 = sh.m * sh.lo + sh.b, y2 = sh.m * sh.hi + sh.b, D = bld('x', sh.lo, sh.hi), R = bld('y', y1, y2), eq = 'y=' + sh.m + 'x' + (sh.b ? signed(sh.b) : '');
            var sol = 'A continuous segment, so <b>inequalities</b>. At ' + t('x=' + sh.lo) + ': ' + t('y=' + sh.m + '(' + sh.lo + ')' + (sh.b ? signed(sh.b) : '') + '=' + y1) + '; at ' + t('x=' + sh.hi) + ': ' + t('y=' + sh.m + '(' + sh.hi + ')' + (sh.b ? signed(sh.b) : '') + '=' + y2) + '. The line rises steadily, so ' + t('y') + ' takes every value in between.<br>' + t('D=' + D) + ', ' + t('R=' + R) + '.';
            return drPart('(b) All points on the line ' + t(eq) + ' for ' + t(sh.lo + '\\le x\\le ' + sh.hi) + '.', D, R,
              { rW: [{ is: bld('y', sh.lo, sh.hi), code: 'dr-copy', hint: 'Those are the ' + t('x') + '-bounds. Substitute ' + t('x=' + sh.lo) + ' and ' + t('x=' + sh.hi) + ' into ' + t(eq) + ' to find the lowest and highest ' + t('y') + '.' },
                { is: bld('y', sh.m * sh.lo, sh.m * sh.hi), code: 'dr-no-b', hint: 'Don’t forget the ' + t(sh.b) + ' in ' + t(eq) + ' when you substitute.' }],
                rC: { 'set-continuous': 'All the points on the segment count, not just whole-number ones, so the range is an inequality.' }, dC: { 'set-continuous': 'All the points on the segment count, not just whole-number ' + t('x') + '-values, so the domain is an inequality.' } },
              sol, ['The domain is given. For the range, substitute the two end ' + t('x') + '-values into the equation.', 'The line rises, so the smallest ' + t('y') + ' comes from the smallest ' + t('x') + '.'], 'D & R of a line segment from its equation');
          } },
          { id: '6c', sub: 'c', level: 'PRG', make: function (r, sh) {
            var eq = 'y=x^{2}' + (sh.k ? signed(sh.k) : ''), D = all('x'), R = bld('y', sh.k, null);
            var sol = 'The whole parabola, so <b>inequalities</b>. Any real ' + t('x') + ' can be squared, so ' + t('D=' + D) + '. A square is never negative: ' + t('x^{2}\\ge 0') + ', so ' + t(eq.replace('y=', '') + '\\ge ' + sh.k) + ', and ' + t('x=0') + ' gives exactly ' + t('y=' + sh.k) + '.<br>' + t('R=' + R) + '.';
            return drPart('(c) All points on the graph of ' + t(eq) + '.', D, R,
              { rW: [{ is: all('y'), code: 'dr-square', hint: 'Can ' + t('x^{2}') + ' ever be negative? Then can ' + t('y') + ' ever be less than ' + t(sh.k) + '?' }, { is: bld('y', sh.k, null, false), code: 'dr-vertex', hint: 'At ' + t('x=0') + ', ' + t('y=' + sh.k) + ' exactly, so ' + t(sh.k) + ' is included: use ' + t('\\ge') + '.' }, { is: bld('y', null, sh.k), code: 'dr-opens', hint: t('x^{2}') + ' is never negative, so ' + t('y') + ' is never <b>less</b> than ' + t(sh.k) + ': the range goes up from there.' }].concat(sh.k ? [{ is: bld('y', 0, null), code: 'dr-no-b', hint: 'Don’t forget the ' + t(signed(sh.k)) + ': the smallest value is ' + t('0' + signed(sh.k) + '=' + sh.k) + '.' }] : []),
                dC: { 'set-discrete': 'Every real ' + t('x') + ' can be squared, so this is not a list.' } },
              sol, ['Which ' + t('x') + '-values can you substitute? What is the smallest value ' + t('x^{2}') + ' can be?', 'A square is never negative.'], 'D & R of y = x² + k');
          } }] },
      /* ---------- Q7 courier ---------- */
      { num: '7', stem: function (sh) { return 'A courier company charges a flat fee of $' + sh.f + ' plus $' + sh.rt + ' per kilometre travelled, so the cost ' + t('C') + ', in dollars, of a delivery that travels ' + t('d') + ' kilometres is ' + t('C=' + sh.f + '+' + sh.rt + 'd') + '. To keep routes efficient the company only accepts deliveries with ' + t(sh.d0 + '\\le d\\le ' + sh.d1) + ' kilometres.'; },
        shared: function (r) {
          var d0 = r.pick([1, 2, 2, 3, 5]), d1 = r.pick([15, 20, 20, 25, 30]), mid = r.sample(range(d0 + 1, d1 - 1), 3).sort(function (a, b) { return a - b; });
          return { f: r.pick([5, 6, 7, 8, 9, 10, 12]), rt: r.pick([2, 3, 4, 5]), d0: d0, d1: d1, ds: [d0].concat(mid, [d1]) };
        },
        parts: [
          { id: '7a', sub: 'a', level: 'BEG', make: function (r, sh) {
            var C = function (d) { return sh.f + sh.rt * d; };
            var fields = sh.ds.map(function (d) { return { label: t('d=' + d) + ':', name: 'd = ' + d, before: t('C=') }; });
            var checks = sh.ds.map(function (d) { return K.number(C(d), function (v) {
              if (v === sh.rt * d) return { code: 'tab-no-fee', hint: 'Remember the flat fee: ' + t('C=' + sh.f + '+' + sh.rt + '(' + d + ')') + '.' };
              if (v === sh.f + sh.rt + d) return { code: 'tab-add', hint: t(sh.rt + 'd') + ' means ' + t(sh.rt + '\\times d') + ': multiply the distance by ' + t(sh.rt) + '.' };
              if (v === (sh.f + sh.rt) * d) return { code: 'tab-rate', hint: 'Only the ' + t(sh.rt) + ' is multiplied by ' + t('d') + '; the fee ' + t(sh.f) + ' is added once.' };
              return null; }); });
            var p = B.fields('(a) Complete the table of values: find ' + t('C') + ' for each distance.', fields, checks, sh.ds.map(function (d) { return String(C(d)); }),
              sh.ds.map(function (d) { return t('d=' + d) + ': ' + t('C=' + C(d)); }).join('<br>'),
              'Substitute each distance into ' + t('C=' + sh.f + '+' + sh.rt + 'd') + ':<br>' + sh.ds.map(function (d) { return t(sh.f + '+' + sh.rt + '(' + d + ')=' + C(d)); }).join(', ') + ' dollars.',
              ['Multiply the distance by ' + t(sh.rt) + ', then add the flat fee ' + t(sh.f) + '.'], 'courier table of values');
            return p;
          } },
          { id: '7b', sub: 'b', level: 'PRG', make: function (r, sh) {
            var c0 = sh.f + sh.rt * sh.d0, c1 = sh.f + sh.rt * sh.d1, D = bld('d', sh.d0, sh.d1), R = bld('C', c0, c1);
            var sol = 'A distance can be any real number of kilometres in the allowed interval, so both sets are inequalities with ' + t('\\in\\mathbb{R}') + '.<br>' + t('D=' + D) + '.<br>' +
              t('C=' + sh.f + '+' + sh.rt + 'd') + ' increases with ' + t('d') + ', so the cost runs from ' + t('C(' + sh.d0 + ')=' + c0) + ' to ' + t('C(' + sh.d1 + ')=' + c1) + ': ' + t('R=' + R) + '.';
            return drPart('(b) State the domain and range of the relation. Use ' + t('d') + ' for the domain and ' + t('C') + ' for the range.', D, R,
              { dv: 'd', rv: 'C', dW: [{ is: bld('d', 0, sh.d1), code: 'dr-from-zero', hint: 'The company only accepts deliveries of at least ' + t(sh.d0) + ' km, so the domain starts at ' + t(sh.d0) + ', not ' + t('0') + '.' }, { is: bld('d', 0, null), code: 'dr-from-zero', hint: 'The company’s rule limits the distance on both sides: ' + t(sh.d0 + '\\le d\\le ' + sh.d1) + '.' }],
                rW: [{ is: bld('C', sh.f, c1), code: 'dr-from-zero', hint: 'The shortest delivery allowed is ' + t(sh.d0) + ' km, not ' + t('0') + ' km, so the cheapest cost is ' + t(sh.f + '+' + sh.rt + '(' + sh.d0 + ')') + '.' }],
                dC: { 'set-continuous': 'A distance is <b>measured</b>, not counted: a ' + t('7.5') + ' km delivery is allowed too, so the domain is an inequality, not a list.' },
                rC: { 'set-continuous': 'The table shows only five distances, but every distance in between is allowed, so every cost in between occurs too: use an inequality.' } },
              sol, ['The domain is the set of allowed distances — it is stated in the question.', 'For the range, find the cost at the shortest and at the longest allowed distance.'], 'courier domain and range');
          } },
          { id: '7c', sub: 'b, explain', level: 'EMG', outcome: 'RF1', make: function (r, sh) {
            var c0 = sh.f + sh.rt * sh.d0, c1 = sh.f + sh.rt * sh.d1;
            return B.mc(r, 'Which statement best explains why the <b>range</b> is restricted?', [
              { html: 'The company only accepts trips from ' + t(sh.d0) + ' to ' + t(sh.d1) + ' km, and the cost rises steadily with distance, so the cost runs from $' + c0 + ' (shortest trip) to $' + c1 + ' (longest trip).', right: true },
              { html: 'A cost can’t be negative, so the range starts at $0.', why: 'The cost is never $0 here: the shortest trip allowed is ' + t(sh.d0) + ' km, which costs $' + c0 + '.' },
              { html: 'The range starts at $' + sh.f + ' because that is the flat fee.', why: 'That would be a trip of ' + t('0') + ' km, which the company doesn’t accept. The shortest trip is ' + t(sh.d0) + ' km.' },
              { html: 'Only the five costs in the table are possible.', why: 'The table shows just a few distances. Any distance in between (like ' + t('7.5') + ' km) is allowed, so every cost in between occurs too.' }],
              'The domain is restricted by the company’s rule (' + t(sh.d0 + '\\le d\\le ' + sh.d1) + '). Because ' + t('C=' + sh.f + '+' + sh.rt + 'd') + ' increases with distance, the range is restricted to the costs of the shortest and longest allowed trips: $' + c0 + ' to $' + c1 + '.',
              ['What is the shortest trip allowed, and what does it cost?'], 'why the range is restricted');
          } }] },
      /* ---------- Q8 MC ---------- */
      { num: '8', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '8', level: 'EMG', make: function (r) {
          var k = r.int(2, 6), R = bld('y', null, k);
          return B.mc(r, 'Which of the following relations has range ' + t(R) + '?', [
            { html: 'A downward-opening curve with maximum point ' + t(ptT([0, k])) + ' that continues infinitely far down in both directions.', right: true },
            { html: 'A circle centred at the origin with radius ' + t(k) + '.', why: 'A circle stops at its bottom too: its range is ' + t('-' + k + '\\le y\\le ' + k) + ', bounded below as well as above.' },
            { html: 'The set of points ' + t('\\{(1,\\ ' + k + '),\\ (2,\\ ' + k + '),\\ (3,\\ ' + k + ')\\}') + '.', why: 'All three points have ' + t('y=' + k) + ', so the range is just ' + t('\\{' + k + '\\}') + ', one value.' },
            { html: 'A horizontal line segment from ' + t(ptT([-k, 0])) + ' to ' + t(ptT([k, 0])) + '.', why: 'Every point on that segment has ' + t('y=0') + ', so its range is ' + t('\\{0\\}') + '.' }],
            'The range needs every ' + t('y') + ' up to ' + t(k) + ', with no bottom. A circle of radius ' + t(k) + ' has range ' + t('-' + k + '\\le y\\le ' + k) + '; the three points have range ' + t('\\{' + k + '\\}') + '; the segment has range ' + t('\\{0\\}') + '. The downward curve with maximum ' + t(ptT([0, k])) + ' that drops forever has range exactly ' + t('y\\le ' + k) + '.',
            ['The range has a top value ' + t(k) + ' but no bottom. Which relation goes down forever?'], 'which relation has range y ≤ k');
        } }] },
      /* ---------- Q9 NR ---------- */
      { num: '9', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '9', level: 'EMG', make: function (r) {
          var n = r.pick([5, 5, 6]), xRep = r.chance(0.35), b = r.pick(n === 5 ? [2, 3, 3] : [3, 4]), a = xRep ? n - 1 : n;
          var xv = r.sample(range(-6, 8), a), xs = xRep ? xv.concat([xv[r.int(0, a - 1)]]) : xv.slice();
          var yv = r.sample(range(1, 20), b), ys, pairs, okp = false;
          for (var g = 0; g < 50 && !okp; g++) {
            ys = yv.slice(); while (ys.length < n) ys.push(r.pick(yv)); ys = r.shuffle(ys);
            pairs = xs.map(function (x, i) { return [x, ys[i]]; });
            okp = uniq(pairs.map(function (p) { return p[0] * 1000 + p[1]; })).length === n;
          }
          pairs = r.shuffle(pairs).sort(function (p, q) { return p[0] - q[0]; });
          var ans = a * b, diag = function (v) {
            if (v === n * n && v !== ans) return { code: 'nr-all-pairs', hint: 'Count the <b>different</b> values: a value that appears in several pairs is one element.' };
            if (v === a + b && v !== ans) return { code: 'nr-sum', hint: 'The question asks for ' + t('a\\times b') + ', the product.' };
            if ((v === n * b || v === a * n) && v !== ans) return { code: 'nr-repeat', hint: 'One of your counts includes a repeated value. List each set with each value once, then count.' };
            return null; };
          var xsU = uniq(pairs.map(function (p) { return p[0]; })), ysU = uniq(pairs.map(function (p) { return p[1]; }));
          return B.nr('A relation includes the ordered pairs ' + ptsH(pairs) + '. If ' + t('a') + ' is the number of elements in the domain and ' + t('b') + ' is the number of elements in the range, the value of ' + t('a\\times b') + ' is ______.', ans, diag,
            'Domain: ' + t('\\{' + xsU.join(', ') + '\\}') + ', so ' + t('a=' + a) + '. Range: ' + t('\\{' + ysU.join(', ') + '\\}') + ', so ' + t('b=' + b) + ' (repeated values count once).<br>' + t('a\\times b=' + a + '\\times ' + b + '=' + ans) + '.',
            ['Write the domain and the range as lists (each value once), then count each list.'], 'count domain × range elements');
        } }] }
    ],

    extra: [
      /* ---------- EP Part A ---------- */
      { num: '1', section: 'Extra practice A — Lists, tables and mapping diagrams', stem: 'State the domain and range of each set of ordered pairs. A repeated value is still written only once, and every list goes in increasing order.', parts: [
        { id: 'e1a', level: 'BEG', make: function (r) {
          for (var g = 0; g < 100; g++) {
            var xv = r.sample(range(-4, 7), 4), yv = r.sample(nz(-4, 8), 3);
            var xs = r.shuffle(xv.concat([xv[r.int(0, 3)]])), ys = r.shuffle([yv[0], yv[0], yv[1], yv[1], yv[2]]);
            var pairs = xs.map(function (x, i) { return [x, ys[i]]; });
            if (uniq(pairs.map(function (p) { return p[0] * 1000 + p[1]; })).length === 5 && !sorted(xs)) break;
          }
          return pairsDR(ptsH(pairs), pairs, { text: 'D & R of pairs with repeats' });
        } },
        { id: 'e1b', level: 'BEG', make: function (r) {
          var xs = r.sample(range(1, 16), 4).sort(function (a, b) { return a - b; }); if (r.chance(0.3)) xs = [1, 4, 9, 16];
          var c = r.int(-6, -1), pairs = xs.map(function (x) { return [x, c]; });
          return pairsDR(ptsH(pairs), pairs, { text: 'D & R of pairs with one y-value' });
        } },
        { id: 'e1c', level: 'EMG', make: function (r) {
          for (var g = 0; g < 100; g++) {
            var xv = r.sample([-3.5, -2.5, -1.5, -0.5, 0.5, 1.5, 2.5, 3.5], 3), yv = r.sample(nz(-4, 7), 3);
            var xs = r.shuffle(xv.concat([xv[r.int(0, 2)]])), ys = r.shuffle(yv.concat([yv[r.int(0, 2)]]));
            var pairs = xs.map(function (x, i) { return [x, ys[i]]; });
            if (uniq(pairs.map(function (p) { return p[0] * 1000 + p[1]; })).length === 4) break;
          }
          return pairsDR(ptsH(pairs), pairs, { text: 'D & R of pairs with decimals' });
        } }] },
      { num: '2', stem: 'State the domain and range of the relation in each table of values.', parts: [
        { id: 'e2a', level: 'BEG', make: function (r) {
          for (var g = 0; g < 100; g++) {
            var xv = r.sample(range(-5, 7), 4).sort(function (a, b) { return a - b; }), rep = r.int(1, 3), xs = xv.slice(0, rep + 1).concat([xv[rep]], xv.slice(rep + 1));
            var yv = r.sample(nz(-4, 9), 3), ys = r.shuffle([yv[0], yv[0], yv[1], yv[1], yv[2]]);
            var pairs = xs.map(function (x, i) { return [x, ys[i]]; });
            if (uniq(pairs.map(function (p) { return p[0] * 1000 + p[1]; })).length === 5) break;
          }
          var tab = HW.valueTable([[t('x')].concat(xs), [t('y')].concat(ys)]);
          return pairsDR(tab, pairs, { solPre: 'Domain = the top row, range = the bottom row. ', text: 'D & R from a table with repeats' });
        } },
        { id: 'e2b', level: 'BEG', make: function (r) {
          var T = r.pick([4, 5, 5, 6]), ts = range(0, T), hs = [r.int(1, 4)], flat = r.int(1, T - 1);
          for (var i = 1; i <= T; i++) hs.push(hs[i - 1] + (i === flat + 1 ? 0 : r.int(2, 6)));
          var pairs = ts.map(function (x, i) { return [x, hs[i]]; });
          var tab = HW.valueTable([[t('t') + ' (weeks)'].concat(ts), [t('h') + ' (cm)'].concat(hs)]);
          var p = pairsDR('The table records the height of a seedling at the end of each week.' + tab + 'Use ' + t('t') + ' for the domain and ' + t('h') + ' for the range.', pairs, { dv: 't', rv: 'h', solPre: 'The domain is the set of times and the range is the set of heights. ', text: 'seedling table D & R' });
          p.good.push(['\\{t\\mid 0\\le t\\le ' + T + ',\\ t\\in W\\}', lst(hs)]);
          return p;
        } }] },
      { num: '3', stem: 'State the domain and range of each mapping diagram.', parts: [
        { id: 'e3a', level: 'BEG', make: function (r) {
          var left = r.sample(range(-4, 8), 4).sort(function (a, b) { return a - b; }), right = r.sample(range(1, 9), 2).sort(function (a, b) { return a - b; }), pat;
          do { pat = r.shuffle([0, 0, 1, 1]); } while (pat.join() === '0,0,1,1' || pat.join() === '1,1,0,0');
          return arrowDR(left, right, left.map(function (l, i) { return [l, right[pat[i]]]; }), { text: 'D & R of a mapping diagram' });
        } },
        { id: 'e3b', level: 'EMG', make: function (r) {
          var s = r.int(1, 4), left = [s, s + 1, s + 2], r0 = r.pick([4, 5, 6]), st = r.pick([1, 2]), right = [r0, r0 + st, r0 + 2 * st];
          var un = r.int(0, 2), hit = right.filter(function (v, i) { return i !== un; }), two = r.int(0, 2);
          var pairs = [];
          left.forEach(function (l, i) { if (i === two) { pairs.push([l, hit[0]]); pairs.push([l, hit[1]]); } else pairs.push([l, r.pick(hit)]); });
          var p = arrowDR(left, right, pairs, { pre: 'Look carefully: one value on the right receives no arrow, and one value on the left sends out two.', text: 'mapping diagram with an unused output' });
          return p;
        } }] },
      /* ---------- EP Part B ---------- */
      { num: '4', section: 'Extra practice B — Graphs, including hollow endpoints', stem: 'State the domain and range of each relation. Each graph has at least one hollow endpoint.', parts: [
        { id: 'e4a', level: 'PRG', make: function (r) { return segDR([r.int(-5, -2), r.int(-4, -1)], [r.int(1, 4), r.int(1, 4)], 'open', 'closed', { text: 'segment hollow left, solid right' }); } },
        { id: 'e4b', level: 'PRG', make: function (r) { return segDR([r.int(-4, -2), r.int(2, 4)], [r.int(2, 4), r.int(-4, -2)], 'open', 'open', { text: 'segment, both ends hollow' }); } },
        { id: 'e4c', level: 'PRG', make: function (r) {
          var a = r.int(-3, 0), b = r.int(1, 4), s = r.pick([-1, -1, -2, -0.5]), D = bld('x', a, null, false), R = bld('y', null, b, true, false);
          var sol = 'The ray starts at the <b>hollow</b> dot ' + t(ptT([a, b])) + ' and goes down to the right with an arrow.<br>' + t('x') + ' starts just after ' + t(a) + ' and grows forever: ' + t('D=' + D) + '.<br>' + t('y') + ' starts just below ' + t(b) + ' and falls forever: ' + t('R=' + R) + '.';
          return drPart(G({ segs: [{ pts: [[a, b], toEdge([a, b], [1, s])], start: 'open', end: 'arrow' }] }), D, R,
            { rW: [{ is: bld('y', b, null, false), code: 'dr-ray-dir', hint: 'The ray goes <b>down</b> from the hollow dot, so the ' + t('y') + '-values are <b>less</b> than ' + t(b) + '.' }, { is: bld('y', null, b), code: 'set-endpoint', hint: 'The dot at ' + t(ptT([a, b])) + ' is hollow, so ' + t('y=' + b) + ' is not on the graph: use ' + t('<') + '.' }],
              dW: [{ is: bld('x', null, a, true, false), code: 'dr-ray-dir', hint: 'The ray goes to the <b>right</b>, so the ' + t('x') + '-values are bigger than ' + t(a) + '.' }] },
            sol, [HINT_D, HINT_DOTS], 'ray from a hollow dot, going down');
        } }] },
      { num: '5', stem: function (sh) { return 'The two graphs below have exactly the same shape. Only the endpoints differ.' + flexFigs(['<b>(a)</b>' + Gs({ segs: [{ pts: [sh.L, sh.M, sh.R], start: 'closed', end: 'closed' }] }), '<b>(b)</b>' + Gs({ segs: [{ pts: [sh.L, sh.M, sh.R], start: 'open', end: 'open' }] })]); },
        shared: function (r) { var xv = r.int(-1, 2), c = r.pick([2, 3]), top = r.int(2, 4), bot = r.int(-4, -2); return { L: [xv - c, top], M: [xv, bot], R: [xv + c, top] }; },
        parts: [
          { id: 'e5a', level: 'EMG', make: function (r, sh) { var p = vDR(sh.L, sh.M, sh.R, 'closed', { text: 'V with solid ends' }); p.prompt = '(a) State the domain and range.' + p.prompt; return p; } },
          { id: 'e5b', level: 'PRG', make: function (r, sh) { var p = vDR(sh.L, sh.M, sh.R, 'open', { text: 'V with hollow ends' }); p.prompt = '(b) State the domain and range.' + p.prompt; return p; } },
          { id: 'e5c', level: 'EMG', make: function (r, sh) {
            return B.mc(r, '(c) Going from (a) to (b), <b>both</b> bounds of the domain changed from ' + t('\\le') + ' to ' + t('<') + ', but only <b>one</b> bound of the range did. Why did the lower bound of the range, ' + t('y=' + sh.M[1]) + ', not change?', [
              { html: 'That value comes from the vertex ' + t(ptT(sh.M)) + ', which is still on the graph. The hollow dots only remove the endpoints, whose ' + t('y') + '-value is ' + t(sh.L[1]) + '.', right: true },
              { html: 'The bottom of a range is always included.', why: 'That isn’t a rule: a ray from a hollow dot that goes up has a range like ' + t('y>-1') + ', with the bottom excluded.' },
              { html: 'The vertex became a hollow dot too, but hollow dots at the bottom still count.', why: 'Look again at graph (b): the vertex has no dot at all — it is an ordinary point on the graph. Hollow dots never count.' },
              { html: 'The range is read on the ' + t('y') + '-axis, and open dots only affect the ' + t('x') + '-axis.', why: 'An open dot removes a whole point, so it can affect both the domain and the range — here it removed ' + t('y=' + sh.L[1]) + ' from the range.' }],
              'Making the endpoints hollow removes only the points ' + t(ptT(sh.L)) + ' and ' + t(ptT(sh.R)) + '. The only ' + t('y') + '-value they supplied was ' + t(sh.L[1]) + ', so only the upper bound became strict. The lowest value, ' + t(sh.M[1]) + ', comes from the vertex in the middle of the graph, which is still there.',
              ['Which point of the graph gives the lowest ' + t('y') + '-value? Is that point an endpoint?'], 'why one range bound stayed');
          } }] },
      { num: '6', stem: 'State the domain and range of each curve or line below. (Some answers are lists, not inequalities.)', parts: [
        { id: 'e6a', level: 'PRG', make: function (r) {
          var h = r.pick([-1, 0, 0, 1]), k = r.int(-4, -1), a = r.pick([1, 0.5]), D = all('x'), R = bld('y', k, null);
          return drPart(G({ fns: [parab(h, k, a)] }), D, R,
            { rW: [{ is: bld('y', null, k), code: 'dr-opens', hint: 'The curve opens <b>up</b>: the vertex ' + t(ptT([h, k])) + ' is the <b>lowest</b> point and the arrows go up forever.' }, { is: bld('y', k, null, false), code: 'dr-vertex', hint: 'The vertex ' + t(ptT([h, k])) + ' is on the curve, so ' + t('y=' + k) + ' is included: use ' + t('\\ge') + '.' }],
              dC: { 'set-arrow': 'The arrows mean the curve keeps going up and outward forever, so every ' + t('x') + '-value is reached.' } },
            'A parabola with vertex ' + t(ptT([h, k])) + ' and arrows on both arms: every real ' + t('x') + ' is used, and the lowest ' + t('y') + ' is ' + t(k) + ' with no upper limit. Infinitely many values, so inequalities.<br>' + t('D=' + D) + ', ' + t('R=' + R) + '.',
            [HINT_D, 'Where is the lowest point? Do the arrows ever stop?'], 'D & R of an upward parabola');
        } },
        { id: 'e6b', level: 'EMG', make: function (r) { return hvDR('h', r.pick([-4, -3, -2, 2, 3, 4])); } },
        { id: 'e6c', level: 'EMG', make: function (r) { return hvDR('v', r.pick([-4, -3, -2, 2, 3, 4])); } },
        { id: 'e6d', level: 'EMG', make: function (r) {
          var h = r.int(-2, 2), k = r.int(-2, 2), rad = r.pick([2, 3, 3]); while (h === 0 && k === 0) h = r.int(-2, 2);
          return circleDR(h, k, rad, { prompt: G({ segs: [ellipse(h, k, rad, rad)], points: [] }), text: 'D & R of a drawn circle' });
        } }] },
      /* ---------- EP Part C ---------- */
      { num: '7', section: 'Extra practice C — Practical domains and ranges', stem: function (sh) { return 'A drama club sells tickets to its spring play for $' + sh.p + ' each. The theatre seats ' + t(sh.N) + ' people, so the revenue ' + t('R') + ', in dollars, from selling ' + t('n') + ' tickets is ' + t('R=' + sh.p + 'n') + '.'; },
        shared: function (r) { return { p: r.pick([5, 8, 10, 12, 12, 15]), N: r.pick([120, 150, 180, 200, 240, 240, 300]) }; },
        parts: [
          { id: 'e7a', sub: 'a', level: 'PRG', make: function (r, sh) {
            var target = '\\{n\\mid 0\\le n\\le ' + sh.N + ',\\ n\\in W\\}';
            return setPart('(a) State the domain. Use the number set that a count of tickets belongs to, not ' + t('\\mathbb{R}') + '.', target,
              { v: 'n', before: t('D='), good: ['\\{n\\mid 0\\le n\\le ' + sh.N + ',\\ n\\in I\\}', '{n | 0 <= n <= ' + sh.N + ', n in W}'], bad: ['\\{n\\mid 0\\le n\\le ' + sh.N + ',\\ n\\in\\mathbb{R}\\}', '\\{n\\mid 1\\le n\\le ' + sh.N + ',\\ n\\in W\\}', '\\{n\\mid 0\\le n\\le ' + sh.N + ',\\ n\\in N\\}'],
                ctx: { 'set-discrete': 'Tickets are <b>counted</b>: nobody buys ' + t('2.5') + ' tickets. Use whole numbers: ' + t('n\\in W') + ' instead of ' + t('n\\in\\mathbb{R}') + '.',
                  'set-missing': 'Selling ' + t('0') + ' tickets is possible too (the lowest count). Note ' + t('N') + ' starts at ' + t('1') + ' but ' + t('W') + ' starts at ' + t('0') + '.' } },
              'The number of tickets is a whole number (a count), at least ' + t('0') + ' and at most the ' + t(sh.N) + ' seats.<br>' + t('D=' + target) + ' (or ' + t('n\\in I') + ' with the bound ' + t('0\\le n') + ').',
              ['What kind of number is a count of tickets? What are the fewest and the most tickets that can be sold?'], 'ticket domain (whole numbers)');
          } },
          { id: 'e7b', sub: 'b', level: 'PRG', make: function (r, sh) {
            var max = sh.p * sh.N, k1 = r.int(3, 9), right = sh.p * k1 + r.int(1, sh.p - 1), m = r.sample(range(2, Math.floor(sh.N / 2)), 2);
            return B.mc(r, '(b) A student writes ' + t('R=\\{R\\mid 0\\le R\\le ' + max + ',\\ R\\in I\\}') + '. The bounds are right but the notation is not: some whole numbers between the bounds are never produced. Which amount can the revenue <b>never</b> be?', [
              { html: '$' + right, right: true },
              { html: '$' + sh.p * m[0], why: t(sh.p + '\\times ' + m[0] + '=' + sh.p * m[0]) + ', so selling ' + t(m[0]) + ' tickets gives exactly $' + sh.p * m[0] + '.' },
              { html: '$' + sh.p * m[1], why: t(sh.p + '\\times ' + m[1] + '=' + sh.p * m[1]) + ', so selling ' + t(m[1]) + ' tickets gives exactly $' + sh.p * m[1] + '.' },
              { html: '$' + max, why: 'That is a full house: ' + t(sh.p + '\\times ' + sh.N + '=' + max) + '.' }],
              'Every revenue is ' + t(sh.p) + ' times a whole number of tickets, so it must be a multiple of ' + t(sh.p) + '. ' + t(right + '\\div ' + sh.p + '\\approx ' + (Math.round(right / sh.p * 100) / 100)) + ' is not a whole number of tickets, so $' + right + ' is never produced — the student’s set includes values the relation never makes.',
              ['Revenue = ' + t(sh.p) + ' × (number of tickets). Which amount is not a multiple of ' + t(sh.p) + '?'], 'revenue value never produced');
          } },
          { id: 'e7c', sub: 'b, range', level: 'PRG', make: function (r, sh) {
            var max = sh.p * sh.N;
            return B.mc(r, '(b, continued) Which is the correct range?', [
              { html: t('\\{0,\\ ' + sh.p + ',\\ ' + 2 * sh.p + ',\\ \\ldots,\\ ' + max + '\\}') + ', the multiples of ' + t(sh.p) + ' from ' + t('0') + ' to ' + t(max), right: true },
              { html: t('\\{R\\mid 0\\le R\\le ' + max + ',\\ R\\in\\mathbb{R}\\}'), why: 'That includes amounts like $' + (sh.p + 0.5) + ' or $' + (sh.p + 1) + ', which no whole number of tickets gives.' },
              { html: t('\\{0,\\ 1,\\ 2,\\ \\ldots,\\ ' + max + '\\}'), why: 'Not every whole number of dollars occurs: the revenue jumps by $' + sh.p + ' for each ticket.' },
              { html: t('\\{' + sh.p + ',\\ ' + 2 * sh.p + ',\\ \\ldots,\\ ' + max + '\\}'), why: 'Selling ' + t('0') + ' tickets is possible, which gives $0. Start the list at ' + t('0') + '.' }],
              t('n=0,1,2,\\ldots,' + sh.N) + ' gives ' + t('R=0,\\ ' + sh.p + ',\\ ' + 2 * sh.p + ',\\ \\ldots,\\ ' + max) + ': only the multiples of ' + t(sh.p) + ' from ' + t('0') + ' to ' + t(sh.p + '(' + sh.N + ')=' + max) + '.',
              ['Substitute ' + t('n=0') + ', ' + t('1') + ', ' + t('2') + ', … What pattern do the revenues follow?'], 'ticket revenue range');
          } },
          { id: 'e7d', sub: 'c', level: 'EMG', make: function (r, sh) {
            return B.number('(c) How many ordered pairs does this relation contain?', sh.N + 1, function (v) {
              if (v === sh.N) return { code: 'cnt-zero', hint: 'Don’t forget ' + t('n=0') + ' (no tickets sold): count ' + t('0, 1, 2, \\ldots, ' + sh.N) + '.' };
              if (v === sh.N + 2) return { code: 'cnt-extra', hint: 'Count ' + t('0, 1, 2, \\ldots, ' + sh.N) + ' carefully: that is ' + t(sh.N + '-0+1') + ' values.' };
              return null; },
              'One ordered pair for each possible ' + t('n') + ': ' + t('n=0, 1, 2, \\ldots, ' + sh.N) + '. That is ' + t(sh.N + '-0+1=' + (sh.N + 1)) + ' ordered pairs.',
              ['One ordered pair for each value in the domain. How many values are in the domain?'], 'number of ordered pairs');
          } }] },
      { num: '8', stem: function (sh) {
          var g = HW.graph({ x: [0, sh.T + sh.ts * 0.7], y: [0, sh.H + 9], grid: sh.ts, gridY: 5, labelsX: sh.ts, labelsY: 10, labels: sh.ts, firstQuadrant: true, unitX: 260 / sh.T, unitY: 165 / sh.H, xName: 't', yName: 'h', xTitle: 'Time (s)', yTitle: 'Height (m)', max: 360,
            segs: [{ pts: [[0, 0], [sh.t1, sh.H], [sh.t2, sh.H], [sh.T, 0]], start: 'closed', end: 'closed' }] });
          return 'A delivery drone takes off from the ground, climbs steadily to its cruising height, hovers there, and then descends to the ground. Its height ' + t('h') + ', in metres, ' + t('t') + ' seconds after take-off is graphed below.' + g;
        },
        shared: function (r) { var ts = r.pick([10, 15, 15, 20]), u1 = r.pick([1, 2, 2]), u2 = u1 + r.pick([1, 2]), u3 = u2 + r.pick([2, 3]); return { ts: ts, t1: u1 * ts, t2: u2 * ts, T: u3 * ts, H: r.pick([30, 35, 40, 45, 45, 50]) }; },
        parts: [
          { id: 'e8a', sub: 'a', level: 'PRG', make: function (r, sh) {
            var D = bld('t', 0, sh.T), R = bld('h', 0, sh.H);
            return drPart('(a) State the domain and the range. Use ' + t('t') + ' and ' + t('h') + '.', D, R,
              { dv: 't', rv: 'h', dW: [{ is: bld('t', 0, sh.T / sh.ts), code: 'dr-scale', hint: 'Read the scale: each gridline on the time axis is ' + t(sh.ts) + ' s, so the drone lands at ' + t('t=' + sh.T) + ' s.' }, { is: bld('t', sh.t1, sh.t2), code: 'dr-wrong-ends', hint: 'That is only the hovering part. The domain covers the whole flight, from take-off to landing.' }],
                rW: [{ is: bld('h', sh.H, sh.H), code: 'dr-wrong-ends', hint: 'The drone is at ' + t(sh.H) + ' m only while hovering; on the way up and down it passes through every height from ' + t('0') + ' to ' + t(sh.H) + '.' }] },
              'Scales: each time gridline is ' + t(sh.ts) + ' s; each height gridline is ' + t('5') + ' m. The flight starts at ' + t('(0,\\ 0)') + ', climbs to ' + t(sh.H) + ' m, hovers from ' + t(sh.t1) + ' to ' + t(sh.t2) + ' s and lands at ' + t(ptT([sh.T, 0])) + '. Time and height are measured, so ' + t('\\in\\mathbb{R}') + '.<br>' + t('D=' + D) + ', ' + t('R=' + R) + '.',
              ['Read the scales on both axes first.', 'Domain: from take-off to landing. Range: from the ground to the highest point.'], 'drone domain and range');
          } },
          { id: 'e8b', sub: 'b', level: 'EMG', outcome: 'RF1', make: function (r, sh) {
            return B.mc(r, '(b) Why can’t the domain be ' + t('\\{t\\mid t\\in\\mathbb{R}\\}') + '?', [
              { html: 'Left bound: time is measured from take-off, so a negative ' + t('t') + ' is before the flight. Right bound: the drone lands at ' + t('t=' + sh.T) + ' s and the flight is over.', right: true },
              { html: 'Because the height can’t be negative.', why: 'That is a reason about the <b>range</b> (heights). The domain is about times: when does the flight start and end?' },
              { html: 'Because time is counted in whole seconds.', why: 'Time is measured, not counted: ' + t('12.7') + ' s is a moment of the flight too. That isn’t what limits the domain.' },
              { html: 'Because the graph has arrows at both ends.', why: 'Look again: the graph ends in solid dots, not arrows. Arrows would mean it goes on forever.' }],
              'The flight starts at ' + t('t=0') + ' (take-off), so negative times have no height to record; it ends at ' + t('t=' + sh.T) + ' s when the drone lands — the graph stops at the solid point ' + t(ptT([sh.T, 0])) + '.',
              ['When does the flight start? When does it end?'], 'why the drone domain is bounded');
          } },
          { id: 'e8c', sub: 'c', level: 'EMG', make: function (r, sh) {
            return B.mc(r, '(c) For a count of tickets sold, the domain uses ' + t('n\\in W') + ', but for the drone the domain uses ' + t('t\\in\\mathbb{R}') + '. Why?', [
              { html: 'Tickets are <b>counted</b>, so only whole numbers are possible; time is <b>measured</b>, so every value in between (like ' + t('12.7') + ' s) is a moment of the flight.', right: true },
              { html: 'The drone’s graph is a line, so it must use ' + t('\\mathbb{R}') + '; the ticket graph could use either.', why: 'The notation follows the quantity: tickets can never be ' + t('2.5') + ', so the ticket domain can’t use ' + t('\\mathbb{R}') + '.' },
              { html: 'The drone’s times are bigger numbers than the ticket counts.', why: 'Size doesn’t matter: ' + t('240') + ' tickets is bigger than ' + t(sh.T) + ' s. What matters is whether in-between values make sense.' },
              { html: 'Time can be negative but a ticket count can’t.', why: 'In this situation time can’t be negative either (it starts at take-off).' }],
              'A count (tickets, people, cupcakes) only takes whole-number values, so its domain uses ' + t('W') + ' (or ' + t('I') + ' with a bound like ' + t('n\\ge 0') + '). A measurement (time, distance, height) can take any value in between, so it uses ' + t('\\mathbb{R}') + '.',
              ['Can you sell ' + t('2.5') + ' tickets? Can the drone be in the air at ' + t('2.5') + ' s?'], 'counted vs measured');
          } }] },
      { num: '9', stem: function (sh) { return 'A ' + sh.V0 + ' L rain barrel is opened and drains at a steady ' + sh.k + ' L per minute, so the volume ' + t('V') + ' of water left, in litres, after ' + t('t') + ' minutes is ' + t('V=' + sh.V0 + '-' + sh.k + 't') + '.'; },
        shared: function (r) { var c = r.pick([[60, 4], [60, 4], [40, 2], [48, 3], [50, 5], [72, 6], [80, 4], [90, 5], [100, 4], [120, 8]]); return { V0: c[0], k: c[1], T: c[0] / c[1] }; },
        parts: [
          { id: 'e9a', sub: 'a', level: 'PRG', make: function (r, sh) {
            var D = bld('t', 0, sh.T), R = bld('V', 0, sh.V0);
            return drPart('(a) State the domain and the range of the relation in this situation. Use ' + t('t') + ' and ' + t('V') + '.', D, R,
              { dv: 't', rv: 'V', dW: [{ is: bld('t', 0, null), code: 'set-arrow', hint: 'The barrel can’t drain forever: when does ' + t('V') + ' reach ' + t('0') + '?' }, { is: bld('t', 0, sh.V0), code: 'empty-vol', hint: t(sh.V0) + ' is the volume. Find the <b>time</b> when the barrel is empty: solve ' + t(sh.V0 + '-' + sh.k + 't=0') + '.' }],
                rW: [{ is: bld('V', null, sh.V0), code: 'set-arrow', hint: 'The volume can’t go below ' + t('0') + ' L: the barrel is empty then.' }] },
              'It starts full: ' + t('t=0') + ', ' + t('V=' + sh.V0) + '. It is empty when ' + t(sh.V0 + '-' + sh.k + 't=0') + ', so ' + t(sh.k + 't=' + sh.V0) + ' and ' + t('t=' + sh.T) + '.<br>' + t('D=' + D) + ', ' + t('R=' + R) + '.',
              ['When does the draining start, and when is the barrel empty?', 'Solve ' + t(sh.V0 + '-' + sh.k + 't=0') + ' for the last time.'], 'rain barrel domain and range');
          } },
          { id: 'e9b', sub: 'b', level: 'EMG', outcome: 'RF1', make: function (r, sh) {
            return B.number('(b) A student writes ' + t('D=\\{t\\mid t\\ge 0,\\ t\\in\\mathbb{R}\\}') + '. The lower bound is right but the upper bound is missing. The barrel runs dry, which fixes the upper bound. At what time ' + t('t') + ' does that happen?', sh.T, function (v) {
              if (v === sh.V0) return { code: 'empty-vol', hint: t(sh.V0) + ' L is the starting volume. Find the time when ' + t('V=0') + '.' };
              if (v === sh.V0 * sh.k) return { code: 'empty-time', hint: 'Solve ' + t(sh.V0 + '-' + sh.k + 't=0') + ': divide ' + t(sh.V0) + ' by ' + t(sh.k) + '.' };
              if (v === sh.V0 - sh.k) return { code: 'empty-time', hint: 'That is the volume after one minute. Find ' + t('t') + ' when ' + t('V=0') + '.' };
              return null; },
              'The barrel runs dry when ' + t('V=0') + ': ' + t(sh.V0 + '-' + sh.k + 't=0') + ', ' + t(sh.k + 't=' + sh.V0) + ', ' + t('t=' + sh.T) + '. After ' + t(sh.T) + ' minutes there is no water left to drain (' + t('V') + ' can’t be negative), so ' + t('D=\\{t\\mid 0\\le t\\le ' + sh.T + ',\\ t\\in\\mathbb{R}\\}') + '.',
              ['Set ' + t('V=0') + ' and solve for ' + t('t') + '.'], 'when the barrel is empty', { after: 'min' });
          } },
          { id: 'e9c', sub: 'c', level: 'EMG', make: function (r, sh) {
            var D = all('t'), R = all('V');
            return drPart('(c) Now treat ' + t('V=' + sh.V0 + '-' + sh.k + 't') + ' as a purely mathematical equation, with no barrel. State its domain and range.', D, R,
              { dv: 't', rv: 'V', dW: [{ is: bld('t', 0, sh.T), code: 'dr-wrong-ends', hint: 'With no barrel there is no reason to stop: any real ' + t('t') + ' can be substituted, even negative ones.' }], rW: [{ is: bld('V', 0, sh.V0), code: 'dr-wrong-ends', hint: 'With no barrel, ' + t('V') + ' can be negative or more than ' + t(sh.V0) + ': the line goes on forever both ways.' }] },
              'With no barrel, any real ' + t('t') + ' may be substituted, and the line ' + t('V=' + sh.V0 + '-' + sh.k + 't') + ' continues forever in both directions, so every real ' + t('V') + ' occurs: ' + t('D=' + D) + ', ' + t('R=' + R) + '.<br>The situation in (a) keeps only the piece from ' + t(ptT([0, sh.V0])) + ' to ' + t(ptT([sh.T, 0])) + '.',
              ['A line with no restrictions goes on forever in both directions.'], 'pure-math line domain and range');
          } }] },
      /* ---------- EP Part D ---------- */
      { num: '10', section: 'Extra practice D — Working backwards', stem: 'Which graph has exactly the domain and range given?', parts: [
        { id: 'e10a', level: 'EMG', make: function (r) {
          var a = r.int(-4, -2), b = r.int(2, 4), c = r.int(-3, -1), d = r.int(3, 5); while (b - a === d - c && a === c) d = r.int(3, 5);
          var Dt = bld('x', a, b), Rt = bld('y', c, d);
          return graphMC(r, t('D=' + Dt) + ' and ' + t('R=' + Rt), [
            { g: { segs: [{ pts: [[a, c], [b, d]], start: 'closed', end: 'closed' }] }, right: true },
            { g: { segs: [{ pts: [[c, a], [d, b]], start: 'closed', end: 'closed' }] }, why: 'This graph runs from ' + t('x=' + c) + ' to ' + t('x=' + d) + ': the domain and range are swapped. The domain is read along the ' + t('x') + '-axis.' },
            { g: { segs: [{ pts: [[a, c], [b, d]], start: 'open', end: 'open' }] }, why: 'Hollow dots exclude the endpoints, so this graph has ' + t(a + '<x<' + b) + '. The given sets use ' + t('\\le') + '.' },
            { g: { segs: [{ pts: [[a, c], toEdge([a, c], [b - a, d - c])], start: 'closed', end: 'arrow' }] }, why: 'The arrow means this graph goes on forever, so its domain has no upper bound.' }],
            'The segment from ' + t(ptT([a, c])) + ' to ' + t(ptT([b, d])) + ' with both endpoints <b>solid</b> uses exactly ' + t(a + '\\le x\\le ' + b) + ' and ' + t(c + '\\le y\\le ' + d) + '. (Other drawings work too — any unbroken graph with those extremes and solid endpoints.)',
            ['Check each graph’s leftmost and rightmost points, then its lowest and highest, and the type of each end.'], 'graph with given closed D & R');
        } },
        { id: 'e10b', level: 'EMG', make: function (r) {
          var c = r.pick(nz(-4, 4));
          return graphMC(r, t('D=\\{x\\mid x\\in\\mathbb{R}\\}') + ' and ' + t('R=\\{' + c + '\\}'), [
            { g: { segs: [{ pts: [[-EDGE, c], [EDGE, c]], start: 'arrow', end: 'arrow' }] }, right: true },
            { g: { segs: [line(null, c)] }, why: 'That is the vertical line ' + t('x=' + c) + ': its domain is ' + t('\\{' + c + '\\}') + ' and its range is all real numbers — swapped.' },
            { g: { segs: [{ pts: [[-3, c], [3, c]], start: 'closed', end: 'closed' }] }, why: 'This segment stops at ' + t('x=-3') + ' and ' + t('x=3') + ', so its domain is not all real numbers.' },
            { g: { segs: [line(1, c)] }, why: 'A slanted line produces every ' + t('y') + '-value, so its range is all real numbers, not ' + t('\\{' + c + '\\}') + '.' }],
            'Every real ' + t('x') + ' but only the output ' + t(c) + ': the horizontal line ' + t('y=' + c) + ' with arrows on both ends.',
            ['Only one ' + t('y') + '-value is allowed. Which graph keeps the same height everywhere and never stops?'], 'graph with D = R, R = {c}');
        } },
        { id: 'e10c', level: 'EMG', make: function (r) {
          var xs = r.sample(range(-4, 5), 4).sort(function (a, b) { return a - b; }), yv = r.sample(range(-3, 4), 2).sort(function (a, b) { return a - b; });
          var ys; do { ys = xs.map(function () { return r.pick(yv); }); } while (uniq(ys).length < 2);
          var pts = xs.map(function (x, i) { return [x, ys[i]]; }), P = function (ps) { return ps.map(function (q) { return { x: q[0], y: q[1] }; }); };
          var other = pts.map(function (q, i) { return [q[0], i === 0 ? yv[0] - 2 >= -5 ? yv[0] - 2 : yv[1] + 2 : q[1]]; });
          return graphMC(r, t('D=' + lst(xs)) + ' and ' + t('R=' + lst(yv)), [
            { g: { points: P(pts) }, right: true },
            { g: { segs: [{ pts: pts, start: 'closed', end: 'closed' }] }, why: 'Joining the points makes an unbroken path: every ' + t('x') + ' between ' + t(xs[0]) + ' and ' + t(xs[3]) + ' would be used, so the domain would be an inequality, not a list.' },
            { g: { points: P(pts.map(function (q) { return [q[1], q[0]]; })) }, why: 'These points have ' + t('x') + '-values ' + t(lst(ys)) + ' — the coordinates are swapped.' },
            { g: { points: P(other) }, why: 'One of these points has ' + t('y=' + other[0][1]) + ', which is not in the range ' + t(lst(yv)) + '.' }],
            'Four separate (unjoined) points with ' + t('x') + '-values ' + t(xs.join(',\\ ')) + ', each with a ' + t('y') + '-value of ' + t(yv[0]) + ' or ' + t(yv[1]) + ', both used. One answer: ' + ptsH(pts) + '.',
            ['A list domain means separate points, not a line.', 'Check that every ' + t('y') + '-value used is in the range, and both are used.'], 'points with a list D & R');
        } },
        { id: 'e10d', level: 'PRG', make: function (r) {
          var a = r.int(-3, -1), b = r.int(2, 4), lo = r.int(-4, -2), hi = r.int(1, 3);
          var Dt = bld('x', a, b, false, true), Rt = bld('y', lo, hi, true, false);
          return graphMC(r, t('D=' + Dt) + ' and ' + t('R=' + Rt), [
            { g: { segs: [{ pts: [[a, hi], [b, lo]], start: 'open', end: 'closed' }] }, right: true },
            { g: { segs: [{ pts: [[a, hi], [b, lo]], start: 'closed', end: 'open' }] }, why: 'Here the hollow dot is on the right, so ' + t('x=' + b) + ' would be excluded and ' + t('x=' + a) + ' included — the opposite of ' + t(a + '<x\\le ' + b) + '.' },
            { g: { segs: [{ pts: [[a, lo], [b, hi]], start: 'open', end: 'closed' }] }, why: 'This segment rises, so its hollow end ' + t(ptT([a, lo])) + ' excludes ' + t('y=' + lo) + ' and its solid end keeps ' + t('y=' + hi) + ': range ' + t(lo + '<y\\le ' + hi) + '. We need the top excluded.' },
            { g: { segs: [{ pts: [[a, hi], [b, lo]], start: 'closed', end: 'closed' }] }, why: 'Both dots are solid, so both bounds would use ' + t('\\le') + '. The domain needs ' + t('x=' + a) + ' excluded.' }],
            'The left end ' + t('x=' + a) + ' must be excluded and the top ' + t('y=' + hi) + ' excluded, so the hollow dot is at ' + t(ptT([a, hi])) + '; the solid dot is at ' + t(ptT([b, lo])) + ', keeping ' + t('x=' + b) + ' and ' + t('y=' + lo) + '. A falling segment from the hollow ' + t(ptT([a, hi])) + ' to the solid ' + t(ptT([b, lo])) + ' does it.',
            ['Which ' + t('x') + '-value and which ' + t('y') + '-value are excluded? They must belong to the same hollow dot.'], 'graph with half-open D & R');
        } }] },
      { num: '11', stem: 'Answer each question with an example: give a set of ordered pairs.', parts: [
        { id: 'e11a', level: 'EMG', make: function (r) { return countPairsPart(r, r.pick([3, 4, 4, 5]), 1); } },
        { id: 'e11b', level: 'PRG', make: function (r) { return countPairsPart(r, 1, r.pick([3, 4, 4, 5])); } },
        { id: 'e11c', level: 'PRG', make: function (r) { var d = r.pick([2, 3, 3]); return countPairsPart(r, d, d + 2); } }] },
      /* ---------- EP Part E ---------- */
      { num: '12', section: 'Extra practice E — Error analysis', stem: function (sh) { return 'Asked for the domain of the relation graphed below, a student writes ' + t('D=' + bld('y', sh.P[1], sh.Q[1])) + '.' + G({ segs: [{ pts: [sh.P, sh.Q], start: 'closed', end: 'closed' }] }); },
        shared: function (r) { var P = [r.int(-5, -3), r.int(-3, -1)], Q = [r.int(0, 2), r.int(2, 4)]; while (P[0] === P[1] || Q[0] === Q[1]) { P = [r.int(-5, -3), r.int(-3, -1)]; Q = [r.int(0, 2), r.int(2, 4)]; } return { P: P, Q: Q }; },
        parts: [
          { id: 'e12a', level: 'PRG', make: function (r, sh) {
            return B.mc(r, '(a) The student made <b>two</b> separate mistakes. What are they?', [
              { html: 'The letter should be ' + t('x') + ', not ' + t('y') + '; and ' + t(sh.P[1]) + ' to ' + t(sh.Q[1]) + ' are the ' + t('y') + '-values (the range) — the domain uses the ' + t('x') + '-values ' + t(sh.P[0]) + ' to ' + t(sh.Q[0]) + '.', right: true },
              { html: 'The endpoints should be excluded (' + t('<') + '), and the letter should be ' + t('x') + '.', why: 'Both endpoints are solid dots, so ' + t('\\le') + ' is right. Compare the numbers with the graph’s ' + t('x') + '-values.' },
              { html: 'The inequality runs the wrong way, and ' + t('\\in\\mathbb{R}') + ' is missing.', why: 'The inequality is in the right order and does end with ' + t('\\in\\mathbb{R}') + '. Look at the letter and at which coordinates were used.' },
              { html: 'Only the letter is wrong: it should be ' + t('\\{x\\mid ' + sh.P[1] + '\\le x\\le ' + sh.Q[1] + ',\\ x\\in\\mathbb{R}\\}') + '.', why: 'Changing the letter isn’t enough: does the graph really go from ' + t('x=' + sh.P[1]) + ' to ' + t('x=' + sh.Q[1]) + '?' }],
              'Mistake 1 (letter): a domain describes the ' + t('x') + '-axis, so it is written with ' + t('x') + '. Mistake 2 (values): ' + t(sh.P[1]) + ' to ' + t(sh.Q[1]) + ' are the graph’s ' + t('y') + '-values — that is the range. The domain comes from the ' + t('x') + '-values, ' + t(sh.P[0]) + ' to ' + t(sh.Q[0]) + '.',
              ['Read the graph’s ' + t('x') + '-values and ' + t('y') + '-values. Which did the student use?'], 'two mistakes in a domain');
          } },
          { id: 'e12b', level: 'BEG', make: function (r, sh) {
            var p = segDR(sh.P, sh.Q, 'closed', 'closed', { text: 'correct the domain and range' });
            p.prompt = '(b) Write the correct domain and range.'; return p;
          } }] },
      { num: '13', stem: function (sh) { return 'A relation is given by ' + ptsH(sh.pairs) + '. One student writes ' + t('R=' + bld('y', sh.ymin, sh.ymax)) + '. A second student writes ' + t('D=' + lst(sh.xs)) + ' and ' + t('R=\\{' + sh.ys.join(', ') + '\\}') + '.'; },
        shared: function (r) {
          var xs = r.sample(range(-4, 6), 4).sort(function (a, b) { return a - b; }), y0 = r.int(-2, 2), g1 = r.int(2, 4), g2 = r.int(2, 4), yv = [y0, y0 + g1, y0 + g1 + g2];
          var ys = [yv[0], yv[1], yv[1], yv[2]]; return { xs: xs, ys: ys, yv: yv, ymin: yv[0], ymax: yv[2], pairs: xs.map(function (x, i) { return [x, ys[i]]; }) };
        },
        parts: [
          { id: 'e13a', level: 'EMG', make: function (r, sh) {
            var key = sh.yv[1] - 1;
            return { prompt: '(a) Name a number that satisfies the first student’s range but is <b>not</b> an output of the relation.', input: { type: 'number' }, key: String(key), answer: t(key) + ' (any number from ' + t(sh.ymin) + ' to ' + t(sh.ymax) + ' other than ' + t(sh.yv.join(',\\ ')) + ')', text: 'value in the interval but not an output',
              check: function (resp) {
                var p = HW.parse.number(resp); if (!p.ok) return form(p.code === 'empty' ? 'empty' : 'notnumber', p.code === 'empty' ? 'Type your answer first.' : 'Enter a single number.');
                var v = p.value;
                if (v < sh.ymin - 1e-9 || v > sh.ymax + 1e-9) return wrong('ea-outside', t(v) + ' doesn’t satisfy ' + t(sh.ymin + '\\le y\\le ' + sh.ymax) + '. Pick a number <b>between</b> ' + t(sh.ymin) + ' and ' + t(sh.ymax) + '.');
                if (sh.yv.some(function (y) { return Math.abs(y - v) < 1e-9; })) return wrong('ea-output', t(v) + ' is an output: it is the ' + t('y') + '-value of a pair. Pick a number between the bounds that is <b>not</b> one of ' + t(sh.yv.join(',\\ ')) + '.');
                return ok();
              },
              good: [String(sh.ymin + 0.5), String(sh.yv[1] + 1)], bad: [String(sh.yv[1]), String(sh.ymax + 1)],
              solution: 'The outputs are only ' + t(sh.yv.join(',\\ ')) + '. A number such as ' + t(key) + ' satisfies ' + t(sh.ymin + '\\le ' + key + '\\le ' + sh.ymax) + ' but is never produced. That proves the set-builder range is wrong: it claims outputs the relation never makes. Four points need a list.',
              hints: ['The first student’s range includes every number from ' + t(sh.ymin) + ' to ' + t(sh.ymax) + '. Which of those are actually ' + t('y') + '-values of the pairs?'] };
          } },
          { id: 'e13b', level: 'EMG', make: function (r, sh) {
            var R = lst(sh.yv);
            return setPart('(b) The second student’s range breaks one of the rules for writing a list. Write the correct range.', R,
              { v: 'y', before: t('R='), dupWrong: 'That is the second student’s answer. The rule: <b>each value is listed only once</b> — the output ' + t(sh.yv[1]) + ' comes from two pairs but is written once.', bad: ['\\{' + sh.ys.join(', ') + '\\}', bld('y', sh.ymin, sh.ymax)],
                ctx: { 'set-discrete': 'There are only four points, so the range is a <b>list</b> of the separate ' + t('y') + '-values.' } },
              'Rule: <b>each value is listed only once.</b> The output ' + t(sh.yv[1]) + ' comes from two pairs but is written once: ' + t('R=' + R) + '.',
              ['Look at the second student’s list. Is any value written twice?'], 'correct a list with a repeat');
          } },
          { id: 'e13c', level: 'EMG', make: function (r, sh) {
            return B.mc(r, '(c) Which feature of a relation decides whether set-builder notation with an inequality is allowed at all?', [
              { html: 'Whether <b>every</b> number between the bounds really is a value (an unbroken stretch), not just a few separate values.', right: true },
              { html: 'Whether it has more than three values.', why: 'A relation with a hundred separate points still needs a list (or a whole-number set). The question is whether the values in between occur.' },
              { html: 'Whether the values are integers.', why: 'Separate values like ' + t('-1.5,\\ 0.5,\\ 2.5') + ' still need a list, and an unbroken stretch of reals uses an inequality.' },
              { html: 'Whether the relation is a function.', why: 'Functions and non-functions can both have lists or inequalities: a circle is not a function but has an inequality range.' }],
              'An inequality says <i>every</i> real number between the bounds is a value. That is only true for an unbroken (continuous) graph; a few separate, scattered values must be written as a list.',
              ['Does ' + t(sh.ymin + '\\le y\\le ' + sh.ymax) + ' include numbers that are not outputs?'], 'when set-builder notation is allowed');
          } }] },
      /* ---------- EP Part F ---------- */
      { num: '14', section: 'Extra practice F — A stretch, and two for the test', stem: function (sh) {
          return 'Domain and range are independent of one another. Both relations below have domain ' + t(bld('x', -sh.a, sh.a)) + '.' +
            flexFigs(['<b>Graph 1</b>' + Gs({ segs: [{ pts: [[-sh.a, sh.y1], [sh.a, sh.y2]], start: 'closed', end: 'closed' }] }), '<b>Graph 2</b>' + Gs({ segs: [{ pts: [[-sh.a, sh.c], [sh.a, sh.c]], start: 'closed', end: 'closed' }] })]);
        },
        shared: function (r) { var a = r.pick([2, 3, 3, 4]), y1 = r.int(-4, -1), y2 = r.int(1, 4), c = r.pick(nz(-4, 4)); return { a: a, y1: y1, y2: y2, c: c }; },
        parts: [
          { id: 'e14a', level: 'EMG', make: function (r, sh) {
            var R1 = bld('y', sh.y1, sh.y2), R2 = lst([sh.c]);
            var c1 = setChk(R1, { v: 'y', other: bld('x', -sh.a, sh.a), otherName: 'domain' }), c2 = setChk(R2, { v: 'y', other: bld('x', -sh.a, sh.a), otherName: 'domain', ctx: { 'set-discrete': 'Every point of Graph 2 has the same ' + t('y') + '-value, so its range is one value: a list.' } });
            var fl = [{ label: 'Range of Graph 1', name: 'Graph 1', mode: 'math', keys: 'set', vars: ['y'], placeholder: ph('y') }, { label: 'Range of Graph 2', name: 'Graph 2', mode: 'math', keys: 'set', vars: ['y'], placeholder: ph('y') }];
            var p = B.fields('(a) State the range of each graph.', fl, [c1, c2], [R1, R2], 'Graph 1: ' + t('R=' + R1) + '<br>Graph 2: ' + t('R=' + R2),
              'Graph 1 rises from ' + t(ptT([-sh.a, sh.y1])) + ' to ' + t(ptT([sh.a, sh.y2])) + ': ' + t('R=' + R1) + '. Graph 2 stays at ' + t('y=' + sh.c) + ': ' + t('R=' + R2) + '. Same domain, different ranges.',
              ['Read each graph from its lowest point to its highest point.'], 'same domain, two ranges');
            p.good = [[ivAlt(R1), 'y=' + sh.c]]; p.bad = [[R1, all('y')], [R2, R1]].concat(sh.y1 === -sh.a && sh.y2 === sh.a ? [] : [[bld('y', -sh.a, sh.a), R2]]);
            return p;
          } },
          { id: 'e14b', level: 'PRG', make: function (r, sh) {
            return B.tf(r, '(b) True or false: “If I tell you the domain of a relation, you can tell me its range.”', false, 'Look at part (a): the same domain gave two different ranges.',
              '<b>False.</b> In (a) the same domain ' + t(bld('x', -sh.a, sh.a)) + ' gave two different ranges, ' + t(bld('y', sh.y1, sh.y2)) + ' and ' + t('\\{' + sh.c + '\\}') + '. Likewise two segments can share the range ' + t(bld('y', -1, 2)) + ' with different domains, e.g. from ' + t('(0,\\ -1)') + ' to ' + t('(3,\\ 2)') + ' and from ' + t('(-5,\\ 2)') + ' to ' + t('(-2,\\ -1)') + '.',
              ['Do the two graphs in (a) have the same range?'], 'domain decides range? (false)');
          } }] },
      { num: '15', stem: 'True or false? (If false, think of a counterexample.)', parts: [
        { id: 'e15a', level: 'EMG', make: function (r) { var c = r.pick(nz(-6, 9));
          return B.tf(r, 'A relation whose range is ' + t('\\{' + c + '\\}') + ' must be a horizontal line.', false, 'Think of separate points that all have ' + t('y=' + c) + ', or a short segment at that height.',
            '<b>False.</b> The four separate points ' + ptsH([[1, c], [2, c], [3, c], [4, c]]) + ' have range ' + t('\\{' + c + '\\}') + ' but are not a line.', [], 'range {c} ⇒ horizontal line? (false)'); } },
        { id: 'e15b', level: 'LIM', make: function (r) { var c = r.pick(nz(-6, 6));
          return B.tf(r, 'The vertical line ' + t('x=' + c) + ' has exactly one value in its domain.', true, 'Every point on ' + t('x=' + c) + ' has the same ' + t('x') + '-coordinate.',
            '<b>True.</b> Every point on the vertical line ' + t('x=' + c) + ' has ' + t('x') + '-value ' + t(c) + ', so ' + t('D=\\{' + c + '\\}') + '.', [], 'vertical line has one domain value (true)'); } },
        { id: 'e15c', level: 'PRG', make: function (r) { var a = r.int(-3, 3), b = r.pick(nz(-4, 5)), w = r.pick([3, 4]);
          return B.tf(r, 'If a graph has a hollow endpoint at ' + t(ptT([a, b])) + ', then ' + t(b) + ' cannot be in the range.', false, 'Another point of the graph can still have ' + t('y=' + b) + ' — think of a horizontal segment starting at that hollow dot.',
            '<b>False.</b> The horizontal segment from a hollow ' + t(ptT([a, b])) + ' to a solid ' + t(ptT([a + w, b])) + ': every other point has ' + t('y=' + b) + ', so ' + t('R=\\{' + b + '\\}') + ' and ' + t(b) + ' <i>is</i> in the range. A hollow dot removes one point, not a whole ' + t('y') + '-value.', [], 'hollow dot ⇒ value excluded? (false)'); } },
        { id: 'e15d', level: 'EMG', make: function (r) { var k = r.int(-4, -1);
          return B.tf(r, 'A relation with a domain of ' + t(all('x')) + ' must also have a range of ' + t(all('y')) + '.', false, 'Think of a horizontal line, or a parabola with a lowest point.',
            '<b>False.</b> The parabola ' + t('y=x^{2}' + signed(k)) + ' uses every real ' + t('x') + ' but has range ' + t(bld('y', k, null)) + ' (and a horizontal line ' + t('y=3') + ' has range ' + t('\\{3\\}') + ').', [], 'domain R ⇒ range R? (false)'); } }] },
      { num: '16', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: 'e16', level: 'EMG', make: function (r) {
          var k = r.pick(nz(-4, 4)), m = r.pick(nz(-3, 4));
          return B.mc(r, 'Which relation has domain ' + t(bld('x', k, null, false)) + '?', [
            { html: 'A ray beginning at a <b>hollow</b> point ' + t(ptT([k, m])) + ' and continuing forever to the right.', right: true },
            { html: 'A ray beginning at a <b>solid</b> point ' + t(ptT([k, m])) + ' and continuing forever to the right.', why: 'A solid point includes ' + t('x=' + k) + ', so that domain is ' + t('x\\ge ' + k) + '.' },
            { html: 'The vertical line ' + t('x=' + k) + '.', why: 'Every point on that line has ' + t('x=' + k) + ', so its domain is ' + t('\\{' + k + '\\}') + '.' },
            { html: 'A parabola with vertex ' + t(ptT([k, m])) + ' opening upward.', why: 'A full parabola goes forever left <b>and</b> right, so its domain is all real numbers.' }],
            t('x>' + k) + ' needs ' + t('x=' + k) + ' excluded and every larger ' + t('x') + ' used. The solid ray gives ' + t('x\\ge ' + k) + '; the vertical line gives ' + t('\\{' + k + '\\}') + '; the parabola gives all real numbers. The ray from a <b>hollow</b> point going right gives exactly ' + t('x>' + k) + '.',
            ['Strict ' + t('>') + ' means the starting value is not included.'], 'which relation has domain x > k');
        } }] },
      { num: '17', stem: '<i>(Numerical Response)</i>', parts: [
        { id: 'e17', level: 'PRG', make: function (r) {
          var h, k, rad, ans;
          do { h = r.int(-5, 5); k = r.int(-5, 5); rad = r.int(3, 9); ans = h + k + 2 * rad; } while (ans < 1 || h === 0 || k === 0 || ans === h + k || ans === 2 * rad);
          return B.nr('A circle has centre ' + t(ptT([h, k])) + ' and a radius of ' + t(rad) + '. Its domain is ' + t('\\{x\\mid m\\le x\\le n,\\ x\\in\\mathbb{R}\\}') + ' and its range is ' + t('\\{y\\mid p\\le y\\le q,\\ y\\in\\mathbb{R}\\}') + '. The value of ' + t('n+q') + ' is ______.', ans, function (v) {
            if (v === h + k) return { code: 'nr-centre', hint: t('n') + ' and ' + t('q') + ' are the edges of the circle, one radius from the centre: ' + t('n=' + h + '+' + rad) + '.' };
            if (v === 2 * rad || v === h + k + rad) return { code: 'nr-centre', hint: 'Both ' + t('n') + ' and ' + t('q') + ' are “centre coordinate + radius”: ' + t('n=' + h + '+' + rad) + ', ' + t('q=' + k + '+' + rad) + '.' };
            if (v === h + k + 4 * rad) return { code: 'dr-diameter', hint: 'Go one radius (not a diameter) from the centre.' };
            return null; },
            'Domain: ' + t(h + '-' + rad + '=' + (h - rad)) + ' to ' + t(h + '+' + rad + '=' + (h + rad)) + ', so ' + t('n=' + (h + rad)) + '. Range: ' + t(k + '-' + rad + '=' + (k - rad)) + ' to ' + t(k + '+' + rad + '=' + (k + rad)) + ', so ' + t('q=' + (k + rad)) + '.<br>' + t('n+q=' + (h + rad) + (k + rad < 0 ? '' : '+') + (k + rad) + '=' + ans) + '.',
            ['The largest ' + t('x') + ' is the centre’s ' + t('x') + ' plus the radius; the largest ' + t('y') + ' is the centre’s ' + t('y') + ' plus the radius.'], 'circle n + q');
        } }] }
    ]
  });

  /* EP 11: a set of ordered pairs with exactly nD values in the domain and nR in the range */
  function countPairsPart(r, nD, nR) {
    var xs = r.sample(range(1, 9), nD).sort(function (a, b) { return a - b; }), ys = r.sample(range(1, 9), nR).sort(function (a, b) { return a - b; }), ex1 = [];
    for (var i = 0; i < Math.max(nD, nR); i++) ex1.push([xs[Math.min(i, nD - 1)], ys[Math.min(i, nR - 1)]]);
    var keyTex = '\\{' + ex1.map(function (p) { return '(' + p[0] + ', ' + p[1] + ')'; }).join(', ') + '\\}';
    var q = 'Can a relation have ' + t(nD) + (nD === 1 ? ' value' : ' values') + ' in its domain and ' + (nR === 1 ? 'only ' : '') + t(nR) + (nR === 1 ? ' value' : ' values') + ' in its range? Yes — write a set of ordered pairs that does it.';
    return { prompt: q, input: { type: 'math', keys: 'pairs', placeholder: 'e.g. {(1, 4), (2, 7)}' }, key: keyTex, answer: setH(ex1) + ' (one example)', text: 'pairs with ' + nD + ' domain / ' + nR + ' range values',
      check: function (resp) {
        var L = readPairs(resp);
        if (L.empty) return form('empty', 'Type your answer first.');
        if (L.bad) return form('unreadable', 'Write ordered pairs in brackets, separated by commas, e.g. ' + t('\\{(1, 4), (2, 7)\\}') + '.');
        var dx = uniq(L.pairs.map(function (p) { return p[0]; })).length, dy = uniq(L.pairs.map(function (p) { return p[1]; })).length;
        if (dx === nD && dy === nR) return ok();
        return wrong('pairs-count', 'Your pairs have ' + t(dx) + ' different ' + t('x') + '-value' + (dx === 1 ? '' : 's') + ' (domain) and ' + t(dy) + ' different ' + t('y') + '-value' + (dy === 1 ? '' : 's') + ' (range). You need exactly ' + t(nD) + ' and ' + t(nR) + '.');
      },
      good: [keyTex.replace(/\\\{|\\\}/g, ''), '\\left\\lbrace ' + ex1.map(function (p) { return '\\left(' + p[0] + ',' + p[1] + '\\right)'; }).join(',') + '\\right\\rbrace '],
      bad: ['\\{' + ex1.slice(0, 1).map(function (p) { return '(' + p[0] + ', ' + p[1] + ')'; }).join(', ') + ', (' + (xs[0] + 20) + ', ' + (ys[0] + 20) + ')\\}'],
      solution: '<b>Yes.</b> For example ' + setH(ex1) + ': ' + t('D=' + lst(xs)) + ' (' + nD + (nD === 1 ? ' value' : ' values') + ') and ' + t('R=' + lst(ys)) + ' (' + nR + (nR === 1 ? ' value' : ' values') + ').' +
        (nD === 1 ? ' A relation may pair one input with several outputs.' : nR === 1 ? ' Several inputs can share one output.' : ' Nothing forces the two sets to be the same size.'),
      hints: ['Choose ' + t(nD) + ' different ' + t('x') + '-values and ' + t(nR) + ' different ' + t('y') + '-values; you may reuse a value in several pairs.'] };
  }
})(window);
