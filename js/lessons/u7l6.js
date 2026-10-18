/* Math 10C · Unit 7 · Lesson 6 — Slope in Context: Interpreting Rates of Change (RF4 RF5 RF6 RF7)
 * Assignment questions 1–9 (u7_L06.tex) and the Lesson 6 Extra Practice (u7_EP06.tex).
 * Every part is a generator: the booklet's numbers are one possible version, and each version keeps the booklet's idea
 * (direction of the rate, which point is t = 0, which units, …). Outcomes: RF4 plotting / representing a relation,
 * RF5 slope, intercepts, domain and range read in context, RF6 changing the form of an equation, RF7 writing and using
 * the equation of a context line. Levels: LIM BEG EMG PRG ADV MAS. */
(function (root) {
  'use strict';
  var HW = root.HW, F = HW.fmt, K = HW.kit, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form, B = K.P, Ln = HW.lines, Dr = HW.draw;

  /* ---------------- numbers ---------------- */
  function cl(x) { return Math.round(x * 1e9) / 1e9; }
  function nf(x) { return F(cl(x)); }
  function fx(x, d) { return cl(x).toFixed(d); }
  function same(a, b) { return Math.abs(a - b) < 1e-7 * Math.max(1, Math.abs(a), Math.abs(b)); }
  function money(x) { return '\\$' + nf(x); }
  function cash(x) { return '\\$' + fx(x, 2); }
  function rng(a, b, s) { var o = []; for (var v = a; v <= b + 1e-9; v += (s || 1)) o.push(cl(v)); return o; }
  function ptT(p) { return '(' + nf(p[0]) + ',\\ ' + nf(p[1]) + ')'; }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function lsFit(xs, ys) { var n = xs.length, sx = 0, sy = 0, sxx = 0, sxy = 0; for (var i = 0; i < n; i++) { sx += xs[i]; sy += ys[i]; sxx += xs[i] * xs[i]; sxy += xs[i] * ys[i]; } var m = (n * sxy - sx * sy) / (n * sxx - sx * sx); return { m: m, b: (sy - m * sx) / n }; }

  /* ---------------- part makers ---------------- */
  /* a number answer (with units after the box). list: [{ v, code, hint }] targeted wrong values; o.forms: values that are
   * right but in the wrong format (a nudge, no try), e.g. a decimal where a percent is asked. */
  function dg(list) { return function (v) { for (var i = 0; i < list.length; i++) if (same(v, list[i].v)) return { code: list[i].code, hint: list[i].hint }; return null; }; }
  function num(prompt, ans, list, sol, hints, text, o) {
    o = o || {}; ans = cl(ans);
    list = (list || []).filter(function (e) { return e && e.v != null && isFinite(e.v) && !same(e.v, ans); });
    var forms = (o.forms || []).filter(function (e) { return e && isFinite(e.v) && !same(e.v, ans); }), base = K.number(ans, dg(list));
    var check = function (resp) { var p = HW.parse.number(resp); if (p.ok) for (var i = 0; i < forms.length; i++) if (same(p.value, forms[i].v)) return form(forms[i].code, forms[i].hint); return base(resp); };
    var p = { prompt: prompt, input: { type: 'number', before: o.money ? t('\\$') : o.before, after: o.after }, check: check, key: String(ans),
      answer: t((o.money ? '\\$' : '') + nf(ans)) + (o.after ? ' ' + o.after : ''), solution: sol, hints: hints || [], text: text };
    p.bad = list.slice(0, 5).map(function (e) { return String(cl(e.v)); });
    if (o.nr) { p.input.nr = true; delete p.input.after; }
    return p;
  }
  /* multiple choice; drops a wrong option whose text repeats another one */
  function mc(r, prompt, opts, sol, hints, text, keep) {
    var seen = {}, out = [];
    opts.filter(function (o) { return o.right; }).concat(opts.filter(function (o) { return !o.right; })).forEach(function (o) { if (!seen[o.html]) { seen[o.html] = 1; out.push(o); } });
    var ordered = keep ? opts.filter(function (o) { return out.indexOf(o) >= 0; }) : out;
    return B.mc(r, prompt, ordered, sol, hints, text, keep);
  }
  /* equation of a context line, y = mx + b, with the question's letters. o: X, Y (or fn for function notation f(t) = …),
   * form, target (exact target, e.g. a fraction slope), keyTex, wrong: [{ m, b, code, hint }] */
  function eqTex(lhs, X, m, b) { var s = (same(m, 1) ? '' : same(m, -1) ? '-' : nf(m)) + X; if (!same(b, 0)) s += (b > 0 ? '+' : '-') + nf(Math.abs(b)); return lhs + '=' + s; }
  function prep(s, fn, X) {
    s = String(s == null ? '' : s);
    if (fn) s = s.replace(new RegExp(fn + '\\s*(?:\\\\left)?\\s*\\(\\s*' + X + '\\s*(?:\\\\right)?\\s*\\)', 'g'), fn);
    return s.replace(/(\d)(?:\\,|\\ |\\;|~|\s)+(?=\d{3}(?!\d))/g, '$1');
  }
  function line(prompt, m, b, o, sol, hints, text) {
    o = o || {};
    var X = o.X || 'x', Y = o.fn || o.Y || 'y', lhs = o.fn ? o.fn + '(' + X + ')' : Y, vars = [X, Y], fm = o.form || 'slope-intercept';
    var wl = (o.wrong || []).filter(function (w) { return !(same(w.m, m) && same(w.b, b)); });
    var base = K.line(o.target || { m: m, b: b }, { vars: vars, form: fm, wrong: wl.map(function (w) { return { is: { m: w.m, b: w.b }, code: w.code, hint: w.hint }; }) });
    var check = function (resp) {
      var r = base(prep(resp, o.fn, X));
      if (r.v === 'form' && r.code === 'line-vars') return form('line-vars', 'Use the letters from the question: ' + t(lhs) + ' and ' + t(X) + '.');
      if (r.v === 'form' && r.code === 'line-form-si') return form('line-form-si', 'Right equation — now write it in the form ' + t(lhs + '=m' + X + '+b') + ', with ' + t(lhs) + ' by itself on the left.');
      if (r.v === 'form' && r.code === 'line-form-simplify' && fm === 'slope-intercept') return form('line-form-simplify', 'Right equation — now simplify it (reduce any fraction, collect like terms) so it reads ' + t(lhs + '=m' + X + '+b') + '.');
      if (r.v === 'wrong' && r.code === 'line-intercept' && o.bHint) return wrong('line-intercept', o.bHint);
      if (r.hint && o.fn) r = { v: r.v, code: r.code, hint: r.hint.split(t(Y) + '-intercept').join('vertical intercept (the value at ' + t(X + '=0') + ')') };
      if (r.v === 'wrong' && r.code === 'line-slope' && o.mHint) return wrong('line-slope', o.mHint);
      return r;
    };
    var key = o.keyTex || eqTex(lhs, X, m, b);
    var p = B.math(prompt, check, key, sol, hints, text, { keys: 'eq', vars: o.fn ? [X, o.fn] : vars, placeholder: fm === 'general' ? 'e.g. 2' + X + ' - 3' + Y + ' + 6 = 0' : 'e.g. ' + lhs + ' = 2' + X + ' + 5' });
    p.bad = wl.map(function (w) { return eqTex(lhs, X, w.m, w.b); });
    p.good = o.good || [];
    return p;
  }
  /* domain and range of a context model in two boxes. o: dv (input letter), w (output letter or function name), fn (true:
   * the range is written with w(dv)), D: [lo, hi], R: [lo, hi], dW / rW: [{ is: setTex (range written with y), code, hint }] */
  function bld(v, lo, hi, show) { var g = show ? nf : function (x) { return String(cl(x)); }; return '\\{' + v + '\\mid ' + g(lo) + '\\le ' + v + '\\le ' + g(hi) + ',\\ ' + v + '\\in\\mathbb{R}\\}'; }
  function bldT(v, lo, hi) { return bld(v, lo, hi, true); }
  function toY(s, w, dv) {
    s = prep(s).replace(/\\left|\\right/g, '');
    s = s.replace(/([A-Za-z])\s*\(\s*([A-Za-z])\s*\)/g, function (m0, f, a) { return a === dv ? 'y' : m0; });
    if (w && w !== 'y' && w !== dv) s = s.replace(new RegExp('(^|[^A-Za-z\\\\])' + w + '(?![A-Za-z])', 'g'), '$1y');
    return s;
  }
  function drPart(prompt, o, sol, hints, text) {
    var dv = o.dv, wl = o.fn ? o.w + '(' + dv + ')' : o.w;
    var Dt = bld(dv, o.D[0], o.D[1]), Ry = bld('y', o.R[0], o.R[1]), Rs = bld(wl, o.R[0], o.R[1]), Ds = bldT(dv, o.D[0], o.D[1]), RsT = bldT(wl, o.R[0], o.R[1]);
    var ctxEnd = { 'set-arrow': o.endHint || 'This situation has a start and an end, so the set has an end value on both sides.', 'set-endpoint': 'The end values are right — both ends are included here, so use ' + t('\\le') + ' on both sides.' };
    var bD = K.set(Dt, { v: dv, other: bld(dv, o.R[0], o.R[1]), otherName: 'range', wrong: o.dW }), bR = K.set(Ry, { v: 'y', other: bld('y', o.D[0], o.D[1]), otherName: 'domain', wrong: o.rW });
    var cD = function (resp) { var r = bD(prep(resp)); if (r.v === 'wrong' && ctxEnd[r.code]) return wrong(r.code, ctxEnd[r.code]); return r; };
    var cR = function (resp) {
      var r = bR(toY(resp, o.w, dv));
      if (r.v === 'form' && r.code === 'set-letter') return form('set-letter', 'Right set — but the range is a set of outputs: write it with ' + t(wl) + ', e.g. ' + t('\\{' + wl + '\\mid \\ldots\\}') + '.');
      if (r.v === 'form' && r.code === 'set-tag') return form('set-tag', 'Right — now finish the set notation with ' + t(',\\ ' + wl + '\\in\\mathbb{R}') + '.');
      if (r.v === 'wrong' && ctxEnd[r.code]) return wrong(r.code, ctxEnd[r.code]);
      return r;
    };
    var fl = [{ label: 'Domain', name: 'Domain', mode: 'math', keys: 'set', vars: [dv, o.w], placeholder: 'e.g. {' + dv + ' | 0 <= ' + dv + ' <= 5, ' + dv + ' in R}' },
      { label: 'Range', name: 'Range', mode: 'math', keys: 'set', vars: [dv, o.w], placeholder: 'e.g. {' + wl + ' | 1 <= ' + wl + ' <= 4, ' + wl + ' in R}' }];
    var p = B.fields(prompt, fl, [cD, cR], [Dt, Rs], t('D=' + Ds) + '<br>' + t('R=' + RsT), sol, hints, text);
    p.good = [[Dt, Ry], [nf(o.D[0]) + '\\le ' + dv + '\\le ' + nf(o.D[1]), nf(o.R[0]) + '\\le ' + wl + '\\le ' + nf(o.R[1])]];
    p.bad = [[Rs, Dt], ['\\{' + dv + '\\mid ' + dv + '\\ge 0,\\ ' + dv + '\\in\\mathbb{R}\\}', Rs]].concat((o.rW || []).map(function (w) { return [Dt, w.is]; }));
    return p;
  }
  /* an answer "in terms of π": coefficient k (value k·π) */
  function piChk(k, list, o) {
    o = o || {};
    return function (resp) {
      var a = K.read(prep(resp)); if (a.res) return a.res;
      var sh = HW.ex.shape(a.ast), v = a.val, T = k * Math.PI;
      if (same(v, T)) { if (!sh.pi) return form('ctx-pi', 'Right value — but leave it <b>in terms of</b> ' + t('\\pi') + ' (use the ' + t('\\pi') + ' key), e.g. ' + t(nf(k) + '\\pi') + '.'); return ok(); }
      if (!sh.pi && Math.abs(v - T) < 0.01 * Math.abs(T)) return form('ctx-pi', 'That’s a decimal approximation. Give the exact answer in terms of ' + t('\\pi') + ', e.g. ' + t('100\\pi') + '.');
      if (o.negForm && same(v, -T)) return form('ctx-out', o.negForm);
      if (same(v, k)) return form('ctx-pi', 'Don’t drop the ' + t('\\pi') + ': the answer is a number times ' + t('\\pi') + '.');
      for (var i = 0; i < (list || []).length; i++) if (same(v, list[i].v * Math.PI)) return wrong(list[i].code, list[i].hint);
      return wrong('value', null);
    };
  }

  /* ---------------- graphs ---------------- */
  function spec(o) {
    return { x: o.x, y: o.y, grid: o.gx, gridY: o.gy, labels: o.lx, labelsX: o.lx, labelsY: o.ly, unitX: (o.w || 290) / (o.x[1] - o.x[0]), unitY: (o.h || 220) / (o.y[1] - o.y[0]),
      firstQuadrant: true, xName: o.xn, yName: o.yn, xTitle: o.xt, yTitle: o.yt, max: o.max || 360, points: o.points, segs: o.segs, fns: o.fns, aria: o.aria };
  }
  function fig(o) { return '<div class="fig">' + HW.graph(spec(o)) + '</div>'; }
  function pad(o) {
    var I = spec(o); delete I.points; delete I.segs; delete I.fns; delete I.aria;
    I.snapX = o.sx || o.gx; I.snapY = o.sy || o.gy; I.mode = 'lines'; I.defaultEnd = o.end || 'closed'; if (o.bg) I.bg = o.bg;
    return I;
  }
  function seg(a, b, s, e) { return { pts: [], pieces: [{ v: [a, b], s: s || 'closed', e: e || 'closed' }], join: 'none' }; }
  /* a drawing that should be ONE straight piece on the graph of f. o: f, slope, lo/hi (x-span it must cover), minX/maxX
   * (allowed span), tx/ty (tolerances: exact grids use tiny ones; sketches use half a snap step), pts (points to plot),
   * arrowOk, arrowHint, shortHint, longHint, offHint(vertex) */
  function nearLine(o) {
    var tyE = o.ty + Math.abs(o.slope || 0) * o.tx;
    return function (resp) {
      if (Dr.empty(resp)) return form('empty', 'Draw your answer on the grid first.');
      var S = Dr.norm(resp);
      if (!S.pieces.length) {
        var all = (o.pts || []).length && o.pts.every(function (P0) { return S.pts.some(function (q) { return Math.abs(q[0] - P0[0]) <= o.tx + 1e-9 && Math.abs(q[1] - P0[1]) <= o.ty + 1e-9; }); });
        return all ? form('ctx-join', 'Good points — now join them with a straight line (use <b>╱ Line</b>: tap one point, then the other).') : wrong('ctx-points', o.ptHint || 'Check your points: go <b>across</b> to the first coordinate, then <b>up</b> to the second. Then join them with ╱ Line.');
      }
      if (S.pieces.length > 1) return wrong('ctx-pieces', 'Draw the graph as <b>one</b> straight line: with ╱ Line, tap where it starts, then where it ends.');
      var pc = S.pieces[0], vs = pc.v;
      var off = vs.concat(S.pts).filter(function (q) { return Math.abs(q[1] - o.f(q[0])) > tyE + 1e-9; });
      if (off.length) return wrong('ctx-off', o.offHint ? o.offHint(off[0]) : 'The point ' + t(ptT(off[0])) + ' on your line isn’t on the graph of this situation. Check your points against the numbers in the question.');
      var xs = vs.map(function (q) { return q[0]; }), lo = Math.min.apply(null, xs), hi = Math.max.apply(null, xs);
      if (lo > o.lo + o.tx + 1e-9 || hi < o.hi - o.tx - 1e-9) return wrong('ctx-short', o.shortHint || 'Right direction — but your line has to reach both points.');
      if ((pc.s === 'arrow' || pc.e === 'arrow') && !o.arrowOk) return wrong('ctx-arrow', o.arrowHint || 'This situation has a start and an end, so draw a segment with dots at the ends — no arrows.');
      if (lo < o.minX - o.tx - 1e-9 || hi > o.maxX + o.tx + 1e-9) return wrong('ctx-long', o.longHint || 'Your line goes past what the situation allows. Stop it at the end of the situation.');
      if (pc.s === 'open' || pc.e === 'open') return wrong('ctx-open', 'Both ends of this graph are real values, so use solid dots (or plain ends), not open dots.');
      return ok();
    };
  }
  /* two lines on one pad (two pay plans). L: [{ f, slope, name }] each must start at the vertical axis and run at least to xHalf */
  function nearLines(L, o) {
    var tyE = function (l) { return o.ty + Math.abs(l.slope) * o.tx; };
    var fits = function (pc, l) { return pc.v.every(function (q) { return Math.abs(q[1] - l.f(q[0])) <= tyE(l) + 1e-9; }); };
    return function (resp) {
      if (Dr.empty(resp)) return form('empty', 'Draw your answer on the grid first.');
      var S = Dr.norm(resp);
      if (S.pieces.length < 2) return wrong('ctx-two', S.pieces.length ? 'Good start — now draw the other plan’s line too.' : 'Draw each plan as a line: use ╱ Line, tap its starting point on the vertical axis, then a second point.');
      if (S.pieces.length > 2) return wrong('ctx-pieces', 'Draw exactly two lines, one for each plan (each as one straight piece).');
      var a = S.pieces[0], b = S.pieces[1], okAB = fits(a, L[0]) && fits(b, L[1]), okBA = fits(a, L[1]) && fits(b, L[0]);
      if (!okAB && !okBA) {
        for (var i = 0; i < 2; i++) if (!S.pieces.some(function (pc) { return fits(pc, L[i]); })) return wrong('ctx-off', L[i].name + '’s line isn’t right yet. It starts at its base pay on the vertical axis; find a second point by putting a sales amount into its equation.');
        return wrong('ctx-off', null);
      }
      var short = S.pieces.filter(function (pc) { var xs = pc.v.map(function (q) { return q[0]; }); return Math.min.apply(null, xs) > o.tx + 1e-9 || Math.max.apply(null, xs) < o.xHalf - 1e-9; });
      if (short.length) return wrong('ctx-short', 'Start each line at the vertical axis (sales of ' + t('\\$0') + ') and draw it across most of the grid.');
      return ok();
    };
  }

  /* ---------------- shared generators ---------------- */
  function tankShared(r) {
    var c = r.chance(0.3) ? [6, 90] : r.pick([[6, 90], [5, 60], [5, 70], [5, 80], [5, 50], [4, 60], [10, 100], [10, 90], [2, 30]]), rate = c[0], b = c[1], T = b / rate;
    var ts = rng(1, T - 1).filter(function (x) { return (rate * x) % 10 === 0; });
    var t1 = r.pick(ts.filter(function (x) { return x <= T / 2; })), t2 = r.pick(ts.filter(function (x) { return x - t1 >= 3; }));
    var R = r.pick([10, 10, 5, 20]);
    return { rate: rate, b: b, T: T, t1: t1, t2: t2, W1: b - rate * t1, W2: b - rate * t2, R: R, A: R * R, W: function (x) { return b - rate * x; } };
  }
  function odoShared(r) {
    var bk = r.chance(0.25), v = bk ? 99 : r.int(55, 110), t1 = bk ? 3 : r.pick([1, 2, 3]), t2 = bk ? 7 : r.pick([5, 6, 7]), S0 = bk ? 44823 : r.int(2000, 8000) * 10 + r.pick([1, 3, 7, 9]);
    var rest = rng(1, 8).filter(function (x) { return x !== t1 && x !== t2; }), ta = bk ? 5 : r.pick(rest), tb = bk ? 6 : r.pick(rest.filter(function (x) { return x !== ta; }));
    var f = function (x) { return S0 + v * x; };
    return { v: v, t1: t1, t2: t2, S0: S0, O1: f(t1), O2: f(t2), ta: ta, tb: tb, f: f, base: Math.floor(S0 / 100) * 100, top: Math.ceil(f(8) / 100) * 100 + 100 };
  }
  function fuelShared(r) {
    var c = r.chance(0.3) ? [45, 12] : r.pick([[30, 10], [30, 12], [30, 15], [35, 12], [35, 15], [40, 10], [40, 12], [40, 15], [45, 10], [45, 12], [50, 10], [50, 12]]);
    var V = c[0], k = c[1], D = V * k, us = rng(5, V - 5, 5);
    var Fu = V === 45 && k === 12 && r.chance(0.5) ? 15 : r.pick(us), u = V === 45 && k === 12 && Fu === 15 ? 25 : r.pick(us.filter(function (x) { return x !== Fu && V - x !== Fu; }).concat(us.length < 3 ? [Fu === 5 ? 10 : 5] : []));
    if (u === Fu || V - u === Fu) u = us.filter(function (x) { return x !== Fu && V - x !== Fu; })[0] || (Fu === 5 ? 10 : 5);
    return { V: V, k: k, D: D, Fu: Fu, u: u, X: u * k };
  }
  function riverShared(r) {
    var c = r.chance(0.3) ? [0.2, 18] : r.pick([[0.2, 18], [0.15, 20], [0.25, 12], [0.3, 12], [0.25, 16], [0.2, 15], [0.3, 10], [0.15, 24]]);
    var rate = c[0], T = c[1], H0 = cl(rate * T), d = r.pick([4, 5, 6, 8].filter(function (x) { return x < T - 2; })), p = r.int(3, 7);
    return { rate: rate, T: T, H0: H0, d: d, H1: cl(H0 - rate * d), p: p };
  }
  function candleShared(r) {
    var h0, rate, hs;
    if (r.chance(0.2)) { h0 = 15; rate = 0.11; hs = [15.0, 13.8, 12.9, 11.6, 10.7, 9.5, 8.4]; }
    else {
      for (var g = 0; g < 100; g++) { h0 = r.pick([12, 13, 14, 15, 16]); rate = r.pick([0.08, 0.09, 0.1, 0.11, 0.12, 0.13]); if (h0 / rate >= 100 && h0 / rate <= 160) break; }
      hs = rng(0, 60, 10).map(function (x, i) { return cl(Math.round((h0 - rate * x + (i ? r.pick([-0.2, -0.1, 0, 0.1, 0.2]) : 0)) * 10) / 10); });
    }
    var ts = rng(0, 60, 10), fit = lsFit(ts, hs);
    return { h0: h0, ts: ts, hs: hs, m: fit.m, b: fit.b, T: -fit.b / fit.m, ymax: Math.ceil(h0) + 2 };
  }

  /* chairlift-style graph: height E (m) against time t (s), squares of sx seconds by sy metres */
  function chairGen(r, sx, sy) {
    for (var g = 0; g < 300; g++) {
      var bk = sx === 20 && sy === 100 && r.chance(0.25), rate = bk ? 3.5 : r.pick([2.5, 3, 3.5, 4, 4.5]), E0 = bk ? 110 : r.pick(rng(Math.max(10, sy / 2), 1.5 * sy, 10));
      var t1 = bk ? sx : r.pick([sx, 2 * sx]), t2 = bk ? 7 * sx : r.pick([5 * sx, 6 * sx, 7 * sx]), Eend = E0 + rate * 8 * sx;
      if (Eend > 8 * sy || (rate * t1) % 1 || (rate * t2) % 1) continue;
      return { rate: rate, E0: E0, t1: t1, t2: t2, E1: E0 + rate * t1, E2: E0 + rate * t2, sx: sx, sy: sy, top: Math.ceil(Eend / sy) * sy };
    }
    return { rate: 3.5, E0: 110, t1: 20, t2: 140, E1: 180, E2: 600, sx: 20, sy: 100, top: 700 };
  }
  function chairFig(c) {
    return fig({ x: [0, 8.8 * c.sx], y: [0, c.top + 0.8 * c.sy], gx: c.sx, gy: c.sy, lx: 2 * c.sx, ly: c.sy, xn: 't', yn: 'E', xt: 'Time, t (s)', yt: 'Height, E (m)',
      segs: [{ pts: [[0, c.E0], [8 * c.sx, c.E0 + c.rate * 8 * c.sx]] }], points: [{ x: c.t1, y: c.E1, label: '(' + c.t1 + ', ' + c.E1 + ')' }, { x: c.t2, y: c.E2, label: '(' + c.t2 + ', ' + c.E2 + ')' }], aria: 'chairlift height graph' });
  }

  /* interpretation sentences for a model y = mx + b. M: what (the quantity), up/down (verbs), uy/uy1 (top unit plural /
   * singular), ux/uxs (bottom unit singular / plural), money, start (sentence for the intercept, given its value text) */
  function rateS(M, up, val, flip) { var v = M.money && !flip ? t('\\$' + nf(val)) : t(nf(val)); return cap(M.what) + ' is ' + (up ? M.up : M.down) + ' at ' + v + ' ' + (flip ? M.uxs + ' per ' + M.uy1 : (M.money ? '' : M.uy + ' ') + 'per ' + M.ux) + '.'; }
  function interpMC(r, prompt, M, m, b, sol, text) {
    var up = m > 0, a = Math.abs(m), bt = M.money ? t('\\$' + nf(b)) : t(nf(b)), at = M.money ? t('\\$' + nf(a)) : t(nf(a));
    return mc(r, prompt, [
      { html: '<b>Slope:</b> ' + rateS(M, up, a) + ' <b>Intercept:</b> ' + M.start(bt), right: true },
      { html: '<b>Slope:</b> ' + rateS(M, up, a, true) + ' <b>Intercept:</b> ' + M.start(bt), why: 'The units are upside down. The slope is (vertical units) per (horizontal unit): ' + M.uy + ' per ' + M.ux + '.' },
      { html: '<b>Slope:</b> ' + rateS(M, !up, a) + ' <b>Intercept:</b> ' + M.start(bt), why: 'Check the sign of the slope: ' + t(nf(m)) + ' is ' + (up ? 'positive, so the quantity is going up.' : 'negative, so the quantity is going down.') },
      { html: '<b>Slope:</b> ' + rateS(M, up, b) + ' <b>Intercept:</b> ' + M.start(at), why: 'Slope and intercept are swapped: the number multiplying the variable is the rate; the constant is the starting value.' }],
      sol, ['The slope is the rate: vertical units per horizontal unit, and its sign says rising or falling. The intercept is the value when the horizontal variable is 0.'], text);
  }

  /* ================================================================================================= */
  HW.addCodes({
    'ctx-rate-sign': 'Rate sign doesn’t match the situation', 'ctx-flip': 'Rate units upside down', 'ctx-months': 'Wrong length of time interval', 'ctx-years': 'Used years instead of months',
    'ctx-total': 'Gave the total change, not the rate', 'ctx-reading': 'Used a reading instead of the change', 'ctx-b-point': 'Used a data point’s value as the intercept', 'ctx-b-sign': 'Sign slip finding the intercept',
    'ctx-tint-b': 'Gave the starting value instead of the time', 'ctx-start-point': 'Gave a later value as the start', 'ctx-pi': 'Not left in terms of π', 'ctx-out': 'Draining rate given as negative',
    'ctx-r-not-r2': 'Used r instead of r²', 'ctx-area': 'Forgot the cross-section area', 'ctx-join': 'Points not joined', 'ctx-points': 'Points misplaced', 'ctx-pieces': 'More than one piece drawn',
    'ctx-off': 'Line not on the situation’s graph', 'ctx-short': 'Line too short', 'ctx-arrow': 'Arrows on a bounded situation', 'ctx-long': 'Line drawn past the situation', 'ctx-open': 'Open dot on a real end', 'ctx-two': 'Only one line drawn',
    'ctx-one-hour': 'Went back only one hour', 'ctx-no-b': 'Left out the intercept', 'ctx-add-b': 'Added the intercept instead of subtracting', 'ctx-used-left': 'Used vs remaining mixed up',
    'ctx-t0': 'Wrong t = 0 (start of rain, not the peak)', 'ctx-percent': 'Commission as a percent in the equation', 'ctx-as-percent': 'Rate not written as a percent', 'ctx-squares': 'Counted grid squares',
    'ctx-step': 'Didn’t divide by the step in x', 'ctx-convert': 'Unit conversion the wrong way', 'ctx-noconv': 'Didn’t convert units', 'ctx-days': 'Used days per week wrong', 'ctx-fit': 'Line doesn’t fit the data', 'ctx-per10': 'Slope per 10 minutes, not per minute',
    'ctx-nr-m': 'Rate per metre, not per km', 'ctx-temp': 'Used a temperature, not the change'
  });

  var LESSON = {
    id: 'u7l6', unit: 7, num: '6', title: 'Slope in Context: Interpreting Rates of Change', outcome: 'RF5',
    blurb: 'Slope as a rate of change with units — reading it off a graph, interpreting the intercept, average rate of change, and base-plus-commission models.',
    questions: [
      /* ---------------- Q1 ---------------- */
      { num: '1', section: 'Assignment', shared: function (r) {
          var MO = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
          var bk = r.chance(0.25), m1 = bk ? 2 : r.int(0, 5), span = bk ? 6 : r.pick([3, 4, 5, 6, 8, 9, 10]), y1 = bk ? 2013 : r.int(2012, 2022), m2 = m1 + span, y2 = y1 + Math.floor(m2 / 12);
          var rate = bk ? 20000 : r.pick([2500, 4000, 5000, 7500, 12000, 15000, 20000, 25000]), N1 = bk ? 340000 : rate * r.int(8, 30);
          return { co: r.pick(['GreenTech Solar', 'BrightPeak Solar', 'SunHarbour Energy']), item: 'solar panels', d1: MO[m1] + ' ' + y1, d2: MO[m2 % 12] + ' ' + y2, span: span, rate: rate, N1: N1, N2: N1 + rate * span, found: y1 - r.int(1, 3) };
        },
        stem: function (sh) { return sh.co + ' was founded in ' + sh.found + '. By ' + sh.d1 + ' the company had sold ' + t(nf(sh.N1)) + ' solar panels, and by ' + sh.d2 + ' it had sold ' + t(nf(sh.N2)) + ' panels. Calculate the average rate of change, stating appropriate units.'; },
        parts: [
          { id: '1a', sub: 'units', level: 'EMG', make: function (r, sh) {
            return mc(r, 'Which units are appropriate for this rate of change?', [
              { html: 'panels per month', right: true },
              { html: 'months per panel', why: 'Upside down: a rate of change is (change in the quantity) per (change in time) — panels on top, months below.' },
              { html: 'panels', why: 'That is the unit of the total change. A rate compares two quantities: panels <b>per</b> unit of time.' },
              { html: 'panels per year since ' + sh.found, why: 'The founding year is a distraction — the change happened between two dates ' + sh.span + ' months apart, so count months.' }],
              'The quantity is a number of panels and the time between the two counts is measured in months, so the rate is in <b>panels per month</b>.', ['Units of a rate: (unit of the quantity that changes) per (unit of time).'], 'units of rate: panels');
          } },
          { id: '1b', sub: 'rate', level: 'EMG', make: function (r, sh) {
            var dN = sh.N2 - sh.N1;
            return num('Calculate the average rate of change.', sh.rate, [
              { v: dN, code: 'ctx-total', hint: 'That’s the total increase in panels. Divide it by the number of months between the two dates.' },
              { v: dN / (sh.span + 1), code: 'ctx-months', hint: 'Count the months again: from ' + sh.d1 + ' to ' + sh.d2 + ' is ' + sh.span + ' months (count the steps, not the months named).' },
              { v: dN / (sh.span - 1), code: 'ctx-months', hint: 'Count the months again: from ' + sh.d1 + ' to ' + sh.d2 + ' is ' + sh.span + ' months.' },
              { v: sh.span / dN, code: 'ctx-flip', hint: 'Upside down — that’s months per panel. Put the change in panels on top.' },
              { v: -sh.rate, code: 'ctx-rate-sign', hint: 'Sales went up, so the rate is positive. Subtract in the same order: later count minus earlier count.' },
              { v: sh.N2 / sh.span, code: 'ctx-reading', hint: 'Use the <b>change</b> in the number of panels, ' + t(nf(sh.N2) + '-' + nf(sh.N1)) + ', not the total.' }],
              sh.d1 + ' to ' + sh.d2 + ' is ' + t(sh.span) + ' months.<br>' + t('\\text{rate}=\\dfrac{' + nf(sh.N2) + '-' + nf(sh.N1) + '}{' + sh.span + '}=\\dfrac{' + nf(dN) + '}{' + sh.span + '}=' + nf(sh.rate)) + ' panels per month.<br>Positive: sales are increasing by ' + t(nf(sh.rate)) + ' panels each month.',
              ['Rate = (change in panels) ÷ (change in time). How many months are there from ' + sh.d1 + ' to ' + sh.d2 + '?'], 'panels per month', { after: 'panels per month' });
          } }] },
      /* ---------------- Q2 ---------------- */
      { num: '2', shared: function (r) {
          var bk = r.chance(0.25), y2 = bk ? 2016 : r.int(2014, 2024), span = bk ? 5 : r.pick([3, 4, 5, 6, 8]), rate = bk ? 651150 : r.int(400, 16000) * 50, N2 = bk ? 8142900 : r.int(3000, 9000) * 1000 + r.int(1, 19) * 50;
          return { y2: y2, y1: y2 - span, span: span, rate: rate, N2: N2, N1: N2 + rate * span, city: bk ? 'a city’s bike-share program' : r.pick(['a city’s bike-share program', 'a city’s e-scooter program']), what: bk ? 'rides' : r.pick(['rides', 'trips']) };
        },
        stem: function (sh) { return 'In ' + sh.y2 + ' ' + sh.city + ' recorded ' + t(nf(sh.N2)) + ' ' + sh.what + '. In ' + sh.y1 + ' it recorded ' + t(nf(sh.N1)) + ' ' + sh.what + '. Calculate the average rate of change, stating appropriate units.'; },
        parts: [
          { id: '2a', level: 'EMG', make: function (r, sh) {
            var dN = sh.N2 - sh.N1;
            return num('Calculate the average rate of change.', -sh.rate, [
              { v: sh.rate, code: 'ctx-rate-sign', hint: 'Check the direction: the later year (' + sh.y2 + ') has <b>fewer</b> ' + sh.what + ', so the rate must be negative. Put the later year first in both subtractions.' },
              { v: dN, code: 'ctx-total', hint: 'That’s the total change. Divide it by the number of years, ' + t(sh.y2 + '-' + sh.y1 + '=' + sh.span) + '.' },
              { v: -sh.span / dN, code: 'ctx-flip', hint: 'Upside down — that’s years per ' + sh.what.replace(/s$/, '') + '. Put the change in ' + sh.what + ' on top.' },
              { v: -dN / (sh.span + 1), code: 'ctx-months', hint: 'From ' + sh.y1 + ' to ' + sh.y2 + ' is ' + t(sh.span) + ' years.' }],
              sh.y1 + ' to ' + sh.y2 + ' is ' + t(sh.span) + ' years.<br>' + t('\\text{rate}=\\dfrac{' + nf(sh.N2) + '-' + nf(sh.N1) + '}{' + sh.y2 + '-' + sh.y1 + '}=\\dfrac{' + nf(dN) + '}{' + sh.span + '}=' + nf(-sh.rate)) + ' ' + sh.what + ' per year.',
              ['Rate = (change in ' + sh.what + ') ÷ (change in years). Subtract in the same order: later minus earlier for both.', 'The later year is listed first in the question — is the number going up or down?'], 'rate, decreasing', { after: sh.what + ' per year' });
          } },
          { id: '2b', level: 'EMG', make: function (r, sh) {
            var a = t(nf(sh.rate));
            return mc(r, 'Which sentence states the rate of change correctly?', [
              { html: 'The number of ' + sh.what + ' is <b>decreasing</b> by ' + a + ' ' + sh.what + ' per year.', right: true },
              { html: 'The number of ' + sh.what + ' is <b>increasing</b> by ' + a + ' ' + sh.what + ' per year.', why: 'The count in ' + sh.y2 + ' is smaller than in ' + sh.y1 + ', so it is going down — that’s what the negative sign says.' },
              { html: 'The number of ' + sh.what + ' is <b>decreasing</b> by ' + t(nf(-sh.rate)) + ' ' + sh.what + ' per year.', why: '“Decreasing” already carries the minus sign. Saying decreasing by a negative amount would mean increasing.' },
              { html: 'The number of ' + sh.what + ' is <b>decreasing</b> by ' + a + ' years per ' + sh.what.replace(/s$/, '') + '.', why: 'Units upside down: the rate is ' + sh.what + ' per year.' }],
              'The rate is ' + t(nf(-sh.rate)) + ' ' + sh.what + ' per year. The negative sign means the number is <b>decreasing</b>, so in words: decreasing by ' + a + ' ' + sh.what + ' each year.', ['A negative rate means the quantity is going down. In a sentence, say “decreasing” and give the size of the rate.'], 'sentence for a negative rate');
          } }] },
      /* ---------------- Q3 ---------------- */
      { num: '3', shared: tankShared,
        stem: function (sh) { return 'Water is draining from a cylindrical tank at a constant rate. After ' + t(sh.t1) + ' minutes the water level is ' + t(sh.W1) + ' cm; after ' + t(sh.t2) + ' minutes the water level is ' + t(sh.W2) + ' cm.'; },
        parts: [
          { id: '3a', level: 'BEG', outcome: 'RF4', make: function (r, sh) {
            var A = [sh.t1, sh.W1], Bp = [sh.t2, sh.W2];
            var I = pad({ x: [0, 17], y: [0, 110], gx: 1, gy: 10, lx: 2, ly: 20, xn: 't', yn: 'W', xt: 'Time, t (min)', yt: 'Water level, W (cm)' });
            var p = K.P.graph('(a) Plot the ordered pairs (time, water level) on the grid and join them.', I,
              nearLine({ f: sh.W, slope: -sh.rate, lo: sh.t1, hi: sh.t2, minX: 0, maxX: sh.T, tx: 1e-6, ty: 1e-6, pts: [A, Bp], arrowHint: 'The tank stops draining when it is empty, so the graph doesn’t go on forever: join the points with a segment (dots at the ends).' }),
              seg(A, Bp), 'Plot ' + t(ptT(A)) + ': across to ' + t(sh.t1) + ' min, up to ' + t(sh.W1) + ' cm. Plot ' + t(ptT(Bp)) + ' the same way, then join them with a segment.',
              ['The first coordinate is the time (across), the second is the water level (up).', 'Each square across is 1 minute; each square up is 10 cm.'], 'plot tank points');
            p.bad = [seg([sh.t1, sh.W2], [sh.t2, sh.W1]), seg([sh.t1, sh.W1 + 10], [sh.t2, sh.W2 + 10]), seg(A, Bp, 'arrow', 'arrow')];
            return p;
          } },
          { id: '3b', level: 'BEG', make: function (r, sh) {
            return num('(b) Calculate the slope of the line segment joining the ordered pairs.', -sh.rate, [
              { v: sh.rate, code: 'ctx-rate-sign', hint: 'The water level is going <b>down</b>, so the slope must be negative. Subtract in the same order: ' + t('\\dfrac{' + sh.W2 + '-' + sh.W1 + '}{' + sh.t2 + '-' + sh.t1 + '}') + '.' },
              { v: -1 / sh.rate, code: 'ctx-flip', hint: 'That’s run over rise (minutes per cm). Slope = change in water level ÷ change in time.' },
              { v: 1 / sh.rate, code: 'ctx-flip', hint: 'That’s run over rise (minutes per cm). Slope = change in water level ÷ change in time.' },
              { v: sh.W2 - sh.W1, code: 'ctx-total', hint: 'That’s the change in level. Divide it by the change in time, ' + t(sh.t2 + '-' + sh.t1) + '.' }],
              t('m=\\dfrac{' + sh.W2 + '-' + sh.W1 + '}{' + sh.t2 + '-' + sh.t1 + '}=\\dfrac{' + (sh.W2 - sh.W1) + '}{' + (sh.t2 - sh.t1) + '}=' + (-sh.rate)) + ' cm/min',
              ['Slope = (change in water level) ÷ (change in time).'], 'tank slope', { before: t('m='), after: 'cm/min' });
          } },
          { id: '3c', level: 'EMG', make: function (r, sh) {
            return mc(r, '(c) What does the slope of the graph represent?', [
              { html: 'The rate at which the water level is changing: it drops ' + t(sh.rate) + ' cm every minute.', right: true },
              { html: 'The water level when the tank started draining.', why: 'That is the vertical intercept (the value at ' + t('t=0') + '), not the slope.' },
              { html: 'The number of minutes until the tank is empty.', why: 'That is the ' + t('t') + '-intercept. The slope is a rate: cm per minute.' },
              { html: 'The volume of water leaving the tank each minute.', why: 'The vertical axis is the water <b>level</b> in cm, so the slope is in cm per minute — a change in height, not a volume.' }],
              'The slope is (change in level) ÷ (change in time), in cm/min: the rate at which the water level changes. Here the level drops ' + t(sh.rate) + ' cm every minute.', ['Look at the units of the slope: vertical units per horizontal unit.'], 'meaning of tank slope');
          } },
          { id: '3d', level: 'EMG', make: function (r, sh) {
            var a = t(sh.rate);
            return mc(r, '(d) Complete: the water level is changing at the rate of ___ ___ per ___.', [
              { html: 'The water level is <b>decreasing</b> at the rate of ' + a + ' cm per minute.', right: true },
              { html: 'The water level is <b>increasing</b> at the rate of ' + a + ' cm per minute.', why: 'The slope is negative, so the level is going down.' },
              { html: 'The water level is <b>decreasing</b> at the rate of ' + t(-sh.rate) + ' cm per minute.', why: '“Decreasing” already says the slope is negative — give the size of the rate, ' + a + '.' },
              { html: 'The water level is <b>decreasing</b> at the rate of ' + a + ' minutes per cm.', why: 'Units upside down: vertical units (cm) per horizontal unit (minute).' }],
              'The slope is ' + t(-sh.rate) + ' cm/min. Negative means the level is <b>decreasing</b>, at ' + a + ' cm per minute.', ['A negative slope: say “decreasing” and give the size of the rate with its units.'], 'tank rate sentence');
          } },
          { id: '3e', level: 'PRG', outcome: 'RF7', make: function (r, sh) {
            return line('(e) Determine an equation in the form ' + t('W=mt+b') + ', where ' + t('W') + ' is the water level in cm and ' + t('t') + ' is the time in minutes.', -sh.rate, sh.b, { X: 't', Y: 'W',
              wrong: [{ m: -sh.rate, b: sh.W1, code: 'ctx-b-point', hint: t(sh.W1) + ' cm is the level at ' + t('t=' + sh.t1) + ', not at ' + t('t=0') + '. Substitute ' + t(ptT([sh.t1, sh.W1])) + ' into ' + t('W=' + (-sh.rate) + 't+b') + ' to find ' + t('b') + '.' },
                { m: -sh.rate, b: sh.W1 - sh.rate * sh.t1, code: 'ctx-b-sign', hint: 'Check the substitution: ' + t(sh.W1 + '=' + (-sh.rate) + '(' + sh.t1 + ')+b') + ', so ' + t('b=' + sh.W1 + '+' + (sh.rate * sh.t1)) + '.' }] },
              t('W=' + (-sh.rate) + 't+b') + '; substitute ' + t(ptT([sh.t1, sh.W1])) + ':<br>' + t(sh.W1 + '=' + (-sh.rate) + '(' + sh.t1 + ')+b=' + (-sh.rate * sh.t1) + '+b\\Rightarrow b=' + sh.b) + '<br>' + t('W=' + (-sh.rate) + 't+' + sh.b) + '. Check ' + t(ptT([sh.t2, sh.W2])) + ': ' + t((-sh.rate) + '(' + sh.t2 + ')+' + sh.b + '=' + sh.W2) + ' ✓',
              ['Use the slope from (b), then substitute one of the points to find ' + t('b') + '.'], 'W = mt + b for the tank');
          } },
          { id: '3f', level: 'PRG', make: function (r, sh) {
            return num('(f) After how many minutes will the tank be empty?', sh.T, [
              { v: sh.b, code: 'ctx-tint-b', hint: 'That’s the starting water level (in cm). Empty means ' + t('W=0') + ': solve ' + t('0=' + (-sh.rate) + 't+' + sh.b) + '.' },
              { v: -sh.T, code: 'ctx-rate-sign', hint: 'Time can’t be negative here — check the signs when you solve ' + t('0=' + (-sh.rate) + 't+' + sh.b) + '.' },
              { v: sh.b * sh.rate, code: 'ctx-convert', hint: 'Divide, don’t multiply: ' + t(sh.rate + 't=' + sh.b) + '.' },
              { v: sh.t2 + sh.T, code: 'value', hint: 'Count from the start (' + t('t=0') + '), not from the second reading.' }],
              'Empty means ' + t('W=0') + ': ' + t('0=' + (-sh.rate) + 't+' + sh.b + '\\Rightarrow ' + sh.rate + 't=' + sh.b + '\\Rightarrow t=' + sh.T) + ' minutes. (So the model only applies for ' + t(bld('t', 0, sh.T)) + '.)',
              ['The tank is empty when the water level ' + t('W') + ' is 0.'], 'time to empty', { after: 'min' });
          } },
          { id: '3g', level: 'EMG', make: function (r, sh) {
            return num('(g) What was the water level in the tank when it started draining?', sh.b, [
              { v: sh.W1, code: 'ctx-start-point', hint: 'That’s the level after ' + t(sh.t1) + ' minutes. Draining started at ' + t('t=0') + '.' },
              { v: 0, code: 'value', hint: 'At the start the tank was full, not empty. Find ' + t('W') + ' when ' + t('t=0') + '.' },
              { v: sh.T, code: 'ctx-tint-b', hint: 'That’s the time to empty. The question asks for a water level at ' + t('t=0') + '.' }],
              'Draining starts at ' + t('t=0') + ', so ' + t('W=b=' + sh.b) + ' cm. The vertical intercept is the starting water level.', ['Which value of ' + t('t') + ' is “when it started”?'], 'starting level', { after: 'cm' });
          } },
          { id: '3hi', sub: 'h i', level: 'EMG', make: function (r, sh) {
            var k1 = sh.A * sh.W1, k2 = sh.A * sh.W2, bad = [{ v: sh.R * sh.W1, code: 'ctx-r-not-r2', hint: 'The radius is squared: ' + t('\\pi r^{2}=\\pi(' + sh.R + ')^{2}=' + sh.A + '\\pi') + '.' }, { v: 2 * sh.R * sh.W1, code: 'ctx-r-not-r2', hint: 'Use the area of the circle, ' + t('\\pi r^{2}') + ', not the circumference ' + t('2\\pi r') + '.' }];
            var bad2 = bad.map(function (e) { return { v: e.v / sh.W1 * sh.W2, code: e.code, hint: e.hint }; });
            var p = B.fields('(h) The tank is cylindrical with a radius of ' + t(sh.R) + ' cm, so ' + t('V=\\pi r^{2}h=' + sh.A + '\\pi h') + '.<br>i) Calculate the volume (in terms of ' + t('\\pi') + ') of water in the tank after ' + t(sh.t1) + ' min and after ' + t(sh.t2) + ' min.',
              [{ label: 'After ' + sh.t1 + ' min', name: 'After ' + sh.t1 + ' min', mode: 'math', keys: 'expr', after: t('\\text{cm}^{3}'), placeholder: 'e.g. 500π' }, { label: 'After ' + sh.t2 + ' min', name: 'After ' + sh.t2 + ' min', mode: 'math', keys: 'expr', after: t('\\text{cm}^{3}'), placeholder: 'e.g. 500π' }],
              [piChk(k1, bad), piChk(k2, bad2)], [nf(k1) + '\\pi', nf(k2) + '\\pi'], t(nf(k1) + '\\pi\\ \\text{cm}^{3}') + ' and ' + t(nf(k2) + '\\pi\\ \\text{cm}^{3}'),
              'At ' + t('t=' + sh.t1) + ', ' + t('h=' + sh.W1) + ': ' + t('V=' + sh.A + '\\pi(' + sh.W1 + ')=' + nf(k1) + '\\pi') + ' cm³.<br>At ' + t('t=' + sh.t2) + ', ' + t('h=' + sh.W2) + ': ' + t('V=' + sh.A + '\\pi(' + sh.W2 + ')=' + nf(k2) + '\\pi') + ' cm³.',
              ['The height of the water is the water level ' + t('W') + ' at that time. Substitute it for ' + t('h') + '.'], 'tank volumes in π');
            p.bad = [[String(k1), String(k2)], [nf(sh.R * sh.W1) + '\\pi', nf(sh.R * sh.W2) + '\\pi']];
            p.good = [[k1 + '\\pi', k2 + '\\pi']];
            return p;
          } },
          { id: '3hii', sub: 'h ii', level: 'ADV', make: function (r, sh) {
            var k = sh.A * sh.rate;
            var p = B.math('(h) The tank is cylindrical with a radius of ' + t(sh.R) + ' cm, so ' + t('V=\\pi r^{2}h=' + sh.A + '\\pi h') + '.<br>ii) Calculate the rate (in terms of ' + t('\\pi') + ') at which water is draining out of the tank.', piChk(k, [
              { v: sh.rate, code: 'ctx-area', hint: t(sh.rate + '\\pi') + ' leaves out the size of the tank. Use your two volumes from i): change in volume ÷ change in time.' },
              { v: sh.R * sh.rate, code: 'ctx-r-not-r2', hint: 'Each centimetre of water has volume ' + t('\\pi r^{2}(1)=' + sh.A + '\\pi') + ' cm³ — the radius is squared.' },
              { v: sh.A * (sh.W1 - sh.W2), code: 'ctx-total', hint: 'That’s the total volume drained between the two times. Divide by the change in time, ' + t(sh.t2 - sh.t1) + ' min.' }],
              { negForm: 'Right size — the volume changes at ' + t('-' + nf(k) + '\\pi') + ' cm³/min, but the question asks how fast water drains <b>out</b>, which is ' + t(nf(k) + '\\pi') + '.' }),
              nf(k) + '\\pi', t('\\dfrac{' + nf(sh.A * sh.W2) + '\\pi-' + nf(sh.A * sh.W1) + '\\pi}{' + sh.t2 + '-' + sh.t1 + '}=\\dfrac{-' + nf(sh.A * (sh.W1 - sh.W2)) + '\\pi}{' + (sh.t2 - sh.t1) + '}=-' + nf(k) + '\\pi') + '<br>Water drains <b>out</b> at ' + t(nf(k) + '\\pi') + ' cm³/min (' + t('\\approx ' + nf(Math.round(k * Math.PI))) + ' cm³/min).<br>Check: the level falls ' + t(sh.rate) + ' cm/min and each cm is ' + t(sh.A + '\\pi') + ' cm³, so ' + t(sh.A + '\\pi\\times ' + sh.rate + '=' + nf(k) + '\\pi') + ' ✓',
              ['Rate = (change in volume) ÷ (change in time), using your volumes from i).'], 'drain rate in π', { keys: 'expr', after: t('\\text{cm}^{3}\\text{/min}'), placeholder: 'e.g. 300π' });
            p.bad = [nf(sh.rate) + '\\pi', String(k)];
            return p;
          } }] },
      /* ---------------- Q4 ---------------- */
      { num: '4', shared: odoShared,
        stem: function (sh) { return 'Amara rented a car. After driving for ' + t(sh.t1) + ' hours the odometer reading was ' + t(nf(sh.O1)) + ', and after ' + t(sh.t2) + ' hours the odometer reading was ' + t(nf(sh.O2)) + '. Her journey was completed after ' + t(8) + ' hours.'; },
        parts: [
          { id: '4a', level: 'EMG', outcome: 'RF4', make: function (r, sh) {
            var I = pad({ x: [0, 9], y: [sh.base, sh.top], gx: 1, gy: 100, sy: 50, lx: 1, ly: 200, xn: 't', yn: ' ', xt: 'Time, t (h)', yt: 'Odometer (km)', h: 240 });
            var sn = function (v) { return Math.round(v / 50) * 50; }, A = [sh.t1, sn(sh.O1)], Bp = [sh.t2, sn(sh.O2)];
            var p = K.P.graph('(a) Plot the ordered pairs (time, odometer reading) on the grid and join them. <i>The vertical axis begins at ' + t(nf(sh.base)) + '; each grid square up is 100 km, and points snap to every 50 km — plot each reading at the nearest snap point.</i>', I,
              nearLine({ f: sh.f, slope: sh.v, lo: sh.t1, hi: sh.t2, minX: 0, maxX: 8, tx: 1e-6, ty: 25 + 1e-6, pts: [[sh.t1, sh.O1], [sh.t2, sh.O2]], arrowHint: 'The journey starts at ' + t('t=0') + ' and ends at ' + t('t=8') + ', so draw a segment — no arrows.',
                offHint: function (q) { return 'Check the point ' + t(ptT(q)) + '. Read the vertical scale carefully: it starts at ' + t(nf(sh.base)) + ' and each square is 100 km.'; } }),
              seg(A, Bp), 'Plot ' + t(ptT([sh.t1, sh.O1])) + ' and ' + t(ptT([sh.t2, sh.O2])) + ' (at the nearest grid points, ' + t(ptT(A)) + ' and ' + t(ptT(Bp)) + '), then join them.',
              ['The vertical axis does not start at 0: it starts at ' + t(nf(sh.base)) + '.'], 'plot odometer points');
            p.bad = [seg([sh.t1, sn(sh.O2)], [sh.t2, sn(sh.O1)]), seg(A, Bp, 'arrow', 'arrow'), seg([sh.t1, sh.base], [sh.t2, sh.base + 400])];
            return p;
          } },
          { id: '4b', level: 'BEG', make: function (r, sh) {
            return num('(b) Calculate the slope of the line segment joining the ordered pairs.', sh.v, [
              { v: 1 / sh.v, code: 'ctx-flip', hint: 'That’s hours per km (run over rise). Slope = change in reading ÷ change in time.' },
              { v: sh.O2 / sh.t2, code: 'ctx-reading', hint: 'Use the <b>change</b> in the odometer reading, ' + t(nf(sh.O2) + '-' + nf(sh.O1)) + ', and the change in time.' },
              { v: sh.O2 - sh.O1, code: 'ctx-total', hint: 'That’s the distance driven between the readings. Divide by the change in time, ' + t(sh.t2 + '-' + sh.t1) + '.' },
              { v: -sh.v, code: 'ctx-rate-sign', hint: 'The odometer reading only goes up, so the slope is positive. Subtract in the same order.' }],
              t('m=\\dfrac{' + nf(sh.O2) + '-' + nf(sh.O1) + '}{' + sh.t2 + '-' + sh.t1 + '}=\\dfrac{' + (sh.O2 - sh.O1) + '}{' + (sh.t2 - sh.t1) + '}=' + sh.v) + ' km/h', ['Slope = (change in odometer reading) ÷ (change in time).'], 'odometer slope', { before: t('m='), after: 'km/h' });
          } },
          { id: '4c', level: 'EMG', make: function (r, sh) {
            return mc(r, '(c) What does the slope of the graph represent?', [
              { html: 'The car’s average speed: the odometer reading goes up ' + t(sh.v) + ' km for every hour driven.', right: true },
              { html: 'The odometer reading when the journey started.', why: 'That is the vertical intercept. The slope is a rate in km per hour.' },
              { html: 'The total distance Amara drove.', why: 'The total distance is the change in the reading over the whole trip. The slope is the distance <b>per hour</b>.' },
              { html: 'The time it takes to drive one kilometre.', why: 'That would be hours per km — the units upside down.' }],
              'Slope = change in reading ÷ change in time, in km/h: the car’s average speed, ' + t(sh.v) + ' km/h.', ['What are the units of the slope?'], 'meaning of odometer slope');
          } },
          { id: '4d', level: 'PRG', make: function (r, sh) {
            return num('(d) Assuming a constant rate of driving for the whole journey, determine the odometer reading at the start of the journey.', sh.S0, [
              { v: sh.O1 + sh.v * sh.t1, code: 'ctx-add-b', hint: 'Going back in time the reading gets <b>smaller</b>: subtract ' + t(sh.v + '\\times ' + sh.t1) + ' from ' + t(nf(sh.O1)) + '.' },
              { v: sh.O1 - sh.v, code: 'ctx-one-hour', hint: 'That goes back only one hour. The first reading was taken after ' + t(sh.t1) + ' hours.' },
              { v: sh.O1 - sh.v * sh.t2, code: 'value', hint: 'Use the time that goes with the reading: ' + t(nf(sh.O1)) + ' was after ' + t(sh.t1) + ' h.' },
              { v: sh.O1, code: 'ctx-start-point', hint: 'That reading was taken after ' + t(sh.t1) + ' hours of driving, not at the start.' },
              { v: sh.O2 - sh.v * sh.t1, code: 'value', hint: 'Use the time that goes with the reading you start from.' }],
              'Substitute ' + t('m=' + sh.v) + ' and ' + t(ptT([sh.t1, sh.O1])) + ' into ' + t('f(t)=mt+b') + ':<br>' + t(nf(sh.O1) + '=' + sh.v + '(' + sh.t1 + ')+b=' + (sh.v * sh.t1) + '+b\\Rightarrow b=' + nf(sh.S0)) + '<br>The odometer read ' + t(nf(sh.S0)) + ' at ' + t('t=0') + '.',
              ['The start of the journey is ' + t('t=0') + '. Work back from a reading using the speed.'], 'starting odometer reading', { after: 'km' });
          } },
          { id: '4e', level: 'PRG', outcome: 'RF7', make: function (r, sh) {
            return line('(e) Determine an equation in the form ' + t('f(t)=mt+b') + ', where ' + t('f(t)') + ' is the odometer reading after ' + t('t') + ' hours.', sh.v, sh.S0, { X: 't', fn: 'f',
              wrong: [{ m: sh.v, b: sh.O1, code: 'ctx-b-point', hint: t(nf(sh.O1)) + ' is the reading after ' + t(sh.t1) + ' h. ' + t('b') + ' is the reading at ' + t('t=0') + ' (part d).' }, { m: sh.v, b: sh.O1 + sh.v * sh.t1, code: 'ctx-add-b', hint: 'Check ' + t('b') + ': ' + t(nf(sh.O1) + '=' + sh.v + '(' + sh.t1 + ')+b') + ', so subtract.' }],
              bHint: 'Right slope — ' + t('b') + ' is the reading at the start of the journey (part d).' },
              t('f(t)=' + sh.v + 't+' + nf(sh.S0)) + '. Check ' + t('t=' + sh.t2) + ': ' + t(sh.v + '(' + sh.t2 + ')+' + nf(sh.S0) + '=' + nf(sh.O2)) + ' ✓', ['The slope is the speed from (b); the intercept is the starting reading from (d).'], 'f(t) odometer');
          } },
          { id: '4f', level: 'PRG', make: function (r, sh) {
            var E = sh.f(8);
            return drPart('(f) State an appropriate domain and range for ' + t('f') + '.', { dv: 't', w: 'f', fn: true, D: [0, 8], R: [sh.S0, E],
              dW: [{ is: bld('t', sh.t1, sh.t2), code: 'set-values', hint: 'The journey runs from ' + t('t=0') + ' to ' + t('t=8') + ' hours, not just between the two readings.' }],
              rW: [{ is: bld('y', sh.O1, sh.O2), code: 'set-values', hint: 'The range runs from the reading at the start, ' + t('f(0)') + ', to the reading at the end, ' + t('f(8)') + '.' }, { is: bld('y', 0, E), code: 'set-values', hint: 'The odometer didn’t start at 0: ' + t('f(0)=' + nf(sh.S0)) + '.' }],
              endHint: 'The journey starts at ' + t('t=0') + ' and ends at ' + t('t=8') + ', so the set has an end value on both sides.' },
              'The journey runs from ' + t('t=0') + ' to ' + t('t=8') + ' h: ' + t(bld('t', 0, 8)) + '.<br>' + t('f(0)=' + nf(sh.S0)) + ' and ' + t('f(8)=' + sh.v + '(8)+' + nf(sh.S0) + '=' + nf(E)) + ', so the range is ' + t(bldT('f(t)', sh.S0, E)) + '.',
              ['Domain: the times the journey lasts. Range: the odometer readings from start to finish.'], 'domain/range odometer');
          } },
          { id: '4gi', sub: 'g i', level: 'BEG', outcome: 'RF7', make: function (r, sh) {
            return num('(g) Determine ' + t('f(' + sh.ta + ')') + '.', sh.f(sh.ta), [{ v: sh.v * sh.ta, code: 'ctx-no-b', hint: 'Add the starting reading too: ' + t('f(' + sh.ta + ')=' + sh.v + '(' + sh.ta + ')+' + nf(sh.S0)) + '.' }],
              t('f(' + sh.ta + ')=' + sh.v + '(' + sh.ta + ')+' + nf(sh.S0) + '=' + (sh.v * sh.ta) + '+' + nf(sh.S0) + '=' + nf(sh.f(sh.ta))), ['Substitute ' + t('t=' + sh.ta) + ' into your equation.'], 'f(ta)', { after: 'km' });
          } },
          { id: '4gii', sub: 'g ii', level: 'EMG', outcome: 'RF7', make: function (r, sh) {
            var V = t(nf(sh.f(sh.ta)));
            return mc(r, '(g) What does ' + t('f(' + sh.ta + ')=' + nf(sh.f(sh.ta))) + ' mean?', [
              { html: 'After ' + t(sh.ta) + ' hours of driving, the odometer read ' + V + ' km.', right: true },
              { html: 'In ' + t(sh.ta) + ' hours Amara drove ' + V + ' km.', why: t('f(t)') + ' is the odometer <b>reading</b>, not the distance driven. In ' + t(sh.ta) + ' h she drove ' + t(sh.v + '\\times ' + sh.ta + '=' + (sh.v * sh.ta)) + ' km.' },
              { html: 'After ' + V + ' hours the odometer read ' + t(sh.ta) + ' km.', why: 'Input and output are swapped: the input ' + t(sh.ta) + ' is the time.' },
              { html: 'The odometer reading goes up by ' + V + ' km every ' + t(sh.ta) + ' hours.', why: 'That describes a rate. ' + t('f(' + sh.ta + ')') + ' is one reading, at one time.' }],
              t('f(' + sh.ta + ')') + ' is the odometer reading after ' + t(sh.ta) + ' hours: ' + V + ' km.', ['In ' + t('f(t)') + ', the input ' + t('t') + ' is the time and the output is the odometer reading.'], 'meaning of f(ta)');
          } },
          { id: '4giii', sub: 'g iii', level: 'EMG', outcome: 'RF7', make: function (r, sh) {
            var V = sh.f(sh.tb);
            return num('(g) Determine ' + t('t') + ' when ' + t('f(t)=' + nf(V)) + '.', sh.tb, [
              { v: V / sh.v, code: 'ctx-no-b', hint: 'Subtract the starting reading first: ' + t(sh.v + 't=' + nf(V) + '-' + nf(sh.S0)) + '.' },
              { v: (V + sh.S0) / sh.v, code: 'ctx-add-b', hint: 'Subtract ' + t(nf(sh.S0)) + ' from both sides — don’t add it.' }],
              t(nf(V) + '=' + sh.v + 't+' + nf(sh.S0) + '\\Rightarrow ' + sh.v + 't=' + (V - sh.S0) + '\\Rightarrow t=' + sh.tb) + ' h', ['Set ' + t(sh.v + 't+' + nf(sh.S0)) + ' equal to ' + t(nf(V)) + ' and solve.'], 'solve f(t)=V', { before: t('t='), after: 'h' });
          } }] },
      /* ---------------- Q5 ---------------- */
      { num: '5', shared: fuelShared,
        stem: function (sh) { return 'To test the fuel consumption of a new hybrid car, Devon filled the gas tank with ' + t(sh.V) + ' L and drove until it was empty, covering a total distance of ' + t(sh.D) + ' km.'; },
        parts: [
          { id: '5a', level: 'EMG', outcome: 'RF4', make: function (r, sh) {
            var I = pad({ x: [0, 660], y: [0, 55], gx: 50, gy: 5, sx: 10, sy: 5, lx: 100, ly: 10, xn: 'x', yn: 'y', xt: 'Distance, x (km)', yt: 'Fuel, y (L)' });
            var f = function (x) { return sh.V - sh.V / sh.D * x; };
            var p = K.P.graph('(a) Sketch a graph with distance travelled on the horizontal axis and fuel remaining in the tank on the vertical axis. <i>(Points snap to every 10 km.)</i>', I,
              nearLine({ f: f, slope: -sh.V / sh.D, lo: 0, hi: sh.D, minX: 0, maxX: sh.D, tx: 15, ty: 2.5, pts: [[0, sh.V], [sh.D, 0]],
                shortHint: 'The graph runs from the full tank at ' + t('x=0') + ' all the way to an empty tank. Where does it hit the horizontal axis?', longHint: 'Once the tank is empty the car stops, so end the graph where the fuel reaches 0.',
                arrowHint: 'The trip starts with a full tank and ends when it is empty, so draw a segment — no arrows.', offHint: function (q) { return 'Check ' + t(ptT(q)) + '. The graph starts at the full tank ' + t('(0,\\ ' + sh.V + ')') + ' and ends when the tank is empty, ' + t('(' + sh.D + ',\\ 0)') + '.'; } }),
              seg([0, sh.V], [Math.round(sh.D / 10) * 10, 0]), 'At ' + t('x=0') + ' the tank is full: ' + t('(0,\\ ' + sh.V + ')') + '. After ' + t(sh.D) + ' km it is empty: ' + t('(' + sh.D + ',\\ 0)') + '. The fuel goes down steadily, so join them with a straight segment.',
              ['Two points describe the trip: the start (full tank) and the end (empty tank).', 'Distance across, fuel up.'], 'sketch fuel graph');
            p.bad = [seg([0, 0], [sh.D, sh.V]), seg([0, sh.V], [sh.D, 0], 'closed', 'arrow'), seg([0, sh.V], [Math.round(sh.D / 20) * 10, 0])];
            return p;
          } },
          { id: '5b', level: 'PRG', outcome: 'RF7', make: function (r, sh) {
            var T = { m: [-1, sh.k], b: sh.V };
            return line('(b) Write an equation in the form ' + t('y=mx+b') + ' representing the volume of fuel in the tank as a function of distance.', -1 / sh.k, sh.V, { target: T, keyTex: Ln.tex(T, 'slope-intercept'),
              wrong: [{ m: -1 / sh.k, b: sh.D, code: 'ctx-b-point', hint: t(sh.D) + ' is where the tank is empty (the ' + t('x') + '-intercept). ' + t('b') + ' is the fuel at ' + t('x=0') + ': the full tank.' }, { m: -sh.V / sh.D * 10, b: sh.V, code: 'value', hint: 'Check the slope: ' + t('\\dfrac{0-' + sh.V + '}{' + sh.D + '-0}') + '.' }] },
              'The line joins ' + t('(0,\\ ' + sh.V + ')') + ' (full) to ' + t('(' + sh.D + ',\\ 0)') + ' (empty).<br>' + t('m=\\dfrac{0-' + sh.V + '}{' + sh.D + '-0}=-\\dfrac{' + sh.V + '}{' + sh.D + '}=-\\dfrac{1}{' + sh.k + '}') + ', and ' + t('b=' + sh.V) + '.<br>' + t(Ln.tex(T, 'slope-intercept')),
              ['Use the points ' + t('(0,\\ ' + sh.V + ')') + ' and ' + t('(' + sh.D + ',\\ 0)') + '.', 'Slope = change in fuel ÷ change in distance (in lowest terms).'], 'fuel equation');
          } },
          { id: '5ci', sub: 'c i', level: 'EMG', make: function (r, sh) {
            var base = K.slope([-1, sh.k]);
            var p = B.math('(c) State the slope of the graph.', function (resp) { var res = base(resp); if (res.v === 'wrong' && res.code === 'slope-flip') return wrong('ctx-flip', 'That’s ' + t(sh.k) + ' km per litre — run over rise. The slope is litres (vertical) per km (horizontal).'); if (res.v === 'wrong' && res.code === 'slope-sign') return wrong('ctx-rate-sign', 'The fuel is going down as you drive, so the slope is negative.'); return res; },
              '-\\frac{1}{' + sh.k + '}', t('m=\\dfrac{0-' + sh.V + '}{' + sh.D + '-0}=-\\dfrac{1}{' + sh.k + '}') + ' L/km', ['Slope = change in fuel ÷ change in distance.'], 'fuel slope', { keys: 'slope', before: t('m='), after: 'L/km', placeholder: 'e.g. -1/8' });
            p.bad = [String(-sh.k), '\\frac{1}{' + sh.k + '}'];
            return p;
          } },
          { id: '5cii', sub: 'c ii', level: 'EMG', make: function (r, sh) {
            var f = t('\\tfrac{1}{' + sh.k + '}');
            return mc(r, '(c) Explain what the slope represents.', [
              { html: 'The fuel in the tank is decreasing by ' + f + ' L for every kilometre driven — that is, ' + t(1) + ' L every ' + t(sh.k) + ' km.', right: true },
              { html: 'The fuel in the tank is decreasing by ' + t(sh.k) + ' L for every kilometre driven.', why: 'Upside down: the car goes ' + t(sh.k) + ' <b>km</b> on each litre, so it uses ' + f + ' L per km.' },
              { html: 'The fuel in the tank is increasing by ' + f + ' L for every kilometre driven.', why: 'The slope is negative: the fuel is being used up.' },
              { html: 'The car travels ' + f + ' km on one litre of fuel.', why: 'That mixes up the units: the slope is litres per km, and ' + f + ' L is used each km.' }],
              t('m=-\\tfrac{1}{' + sh.k + '}') + ' L/km: the volume of fuel is <b>decreasing</b> at ' + f + ' L for every kilometre driven — 1 L every ' + t(sh.k) + ' km.', ['Units of the slope: litres per kilometre. The sign tells you increasing or decreasing.'], 'meaning of fuel slope');
          } },
          { id: '5d', level: 'PRG', outcome: 'RF7', make: function (r, sh) {
            var x = sh.Fu * sh.k;
            return num('(d) Determine the distance travelled when ' + t(sh.Fu) + ' L of gas has been used.', x, [
              { v: (sh.V - sh.Fu) * sh.k, code: 'ctx-used-left', hint: t(sh.Fu) + ' L <b>used</b> means ' + t(sh.V + '-' + sh.Fu + '=' + (sh.V - sh.Fu)) + ' L remain, so set ' + t('y=' + (sh.V - sh.Fu)) + ', not ' + t('y=' + sh.Fu) + '.' },
              { v: sh.Fu / sh.k, code: 'ctx-flip', hint: 'Each litre takes the car ' + t(sh.k) + ' km, so multiply.' }],
              'If ' + t(sh.Fu) + ' L are used, ' + t(sh.V - sh.Fu) + ' L remain, so ' + t('y=' + (sh.V - sh.Fu)) + ':<br>' + t((sh.V - sh.Fu) + '=-\\tfrac{1}{' + sh.k + '}x+' + sh.V + '\\Rightarrow -' + sh.Fu + '=-\\tfrac{1}{' + sh.k + '}x\\Rightarrow x=' + x) + ' km',
              ['How much fuel is <b>left</b> in the tank? That is the value of ' + t('y') + '.'], 'distance when F used', { after: 'km' });
          } },
          { id: '5e', level: 'PRG', outcome: 'RF7', make: function (r, sh) {
            return num('(e) How many litres of gas are used by the car when it has travelled ' + t(sh.X) + ' km?', sh.u, [
              { v: sh.V - sh.u, code: 'ctx-used-left', hint: 'That’s the fuel <b>remaining</b> in the tank (the value of ' + t('y') + '). The fuel used is ' + t(sh.V) + ' minus that.' },
              { v: sh.X * sh.k, code: 'ctx-flip', hint: 'The car uses 1 L every ' + t(sh.k) + ' km, so divide the distance by ' + t(sh.k) + '.' }],
              t('y=-\\tfrac{1}{' + sh.k + '}(' + sh.X + ')+' + sh.V + '=' + (-sh.u) + '+' + sh.V + '=' + (sh.V - sh.u)) + ' L remaining.<br>Fuel used ' + t('=' + sh.V + '-' + (sh.V - sh.u) + '=' + sh.u) + ' L.',
              ['Find the fuel remaining at ' + t('x=' + sh.X) + ', then subtract it from the full tank.'], 'litres used', { after: 'L' });
          } }] },
      /* ---------------- Q6 ---------------- */
      { num: '6', shared: riverShared,
        stem: function (sh) { return 'After ' + t(sh.p) + ' days of heavy rain the water level in a river peaked at ' + t(fx(sh.H0, 2)) + ' m above its regular level. ' + cap(['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'][sh.d]) + ' days later the water level had dropped to ' + t(fx(sh.H1, 2)) + ' m above its regular level.'; },
        parts: [
          { id: '6a', level: 'ADV', outcome: 'RF7', make: function (r, sh) {
            var m = -sh.rate;
            return line('(a) Assuming the water level falls at a constant rate, determine a function ' + t('h(t)') + ' giving the height of the river above its regular level as a function of time. Take ' + t('t=0') + ' at the peak.', m, sh.H0, { X: 't', fn: 'h',
              wrong: [{ m: m, b: cl(sh.H0 + sh.rate * sh.p), code: 'ctx-t0', hint: 'You used ' + t('t=' + sh.p) + ' for the peak. The question says ' + t('t=0') + ' <b>at the peak</b>, so the peak is the point ' + t('(0,\\ ' + fx(sh.H0, 2) + ')') + '.' },
                { m: cl(-(sh.H0 - sh.H1) / (sh.p + sh.d)), b: sh.H0, code: 'ctx-t0', hint: 'The second reading is ' + t(sh.d) + ' days after the peak, so it is at ' + t('t=' + sh.d) + ' (the rain days don’t count).' },
                { m: m, b: sh.H1, code: 'ctx-b-point', hint: t(fx(sh.H1, 2)) + ' m is the level ' + t(sh.d) + ' days after the peak. At ' + t('t=0') + ' (the peak) the level is ' + t(fx(sh.H0, 2)) + ' m.' },
                { m: cl(-(sh.H0 - sh.H1)), b: sh.H0, code: 'ctx-total', hint: 'That’s the total drop. Divide by the ' + t(sh.d) + ' days it took.' }] },
              'From ' + t('(0,\\ ' + fx(sh.H0, 2) + ')') + ' to ' + t('(' + sh.d + ',\\ ' + fx(sh.H1, 2) + ')') + ':<br>' + t('m=\\dfrac{' + fx(sh.H1, 2) + '-' + fx(sh.H0, 2) + '}{' + sh.d + '-0}=\\dfrac{' + fx(sh.H1 - sh.H0, 2) + '}{' + sh.d + '}=' + nf(m)) + '<br>' + t('t=0') + ' is the peak, so ' + t('b=' + fx(sh.H0, 2)) + ': ' + t('h(t)=' + nf(m) + 't+' + fx(sh.H0, 2)),
              ['The peak is ' + t('t=0') + ', so one point is ' + t('(0,\\ ' + fx(sh.H0, 2) + ')') + '. When is the second reading?'], 'h(t) river');
          } },
          { id: '6bi', sub: 'b i', level: 'EMG', make: function (r, sh) {
            return num('(b) State the slope of the graph of the function.', -sh.rate, [
              { v: sh.rate, code: 'ctx-rate-sign', hint: 'The river is <b>falling</b>, so the slope is negative.' },
              { v: -1 / sh.rate, code: 'ctx-flip', hint: 'That’s days per metre (run over rise). Slope = change in height ÷ change in time.' },
              { v: cl(sh.H1 - sh.H0), code: 'ctx-total', hint: 'That’s the total drop. Divide it by ' + t(sh.d) + ' days.' },
              { v: cl(-(sh.H0 - sh.H1) / (sh.p + sh.d)), code: 'ctx-t0', hint: 'The drop happened over ' + t(sh.d) + ' days (from the peak), not ' + t(sh.p + sh.d) + '.' }],
              t('m=\\dfrac{' + fx(sh.H1, 2) + '-' + fx(sh.H0, 2) + '}{' + sh.d + '}=' + nf(-sh.rate)) + ' m/day', ['Use the slope of your function in (a).'], 'river slope', { before: t('m='), after: 'm/day' });
          } },
          { id: '6bii', sub: 'b ii', level: 'EMG', make: function (r, sh) {
            var a = t(nf(sh.rate));
            return mc(r, '(b) Explain what the slope represents.', [
              { html: 'The river’s height above its regular level is falling by ' + a + ' m each day.', right: true },
              { html: 'The river’s height above its regular level is rising by ' + a + ' m each day.', why: 'The slope is negative: after the peak the level falls.' },
              { html: 'The river falls one metre every ' + a + ' days.', why: 'Units upside down: the slope is metres <b>per day</b>, so the river drops ' + a + ' m in one day.' },
              { html: 'The river is ' + a + ' m above its regular level.', why: 'That’s a height, not a rate. The slope tells how fast the height changes.' }],
              t('m=' + nf(-sh.rate)) + ' m/day: the height above the regular level is <b>falling</b> by ' + a + ' m each day.', ['Units of the slope: metres per day.'], 'meaning of river slope');
          } },
          { id: '6c', level: 'ADV', make: function (r, sh) {
            return drPart('(c) Determine an appropriate domain and range for ' + t('h') + '.', { dv: 't', w: 'h', fn: true, D: [0, sh.T], R: [0, sh.H0],
              dW: [{ is: bld('t', 0, sh.T + sh.p), code: 'ctx-t0', hint: 'Time is measured from the peak (' + t('t=0') + '), so don’t add the rain days.' }, { is: bld('t', 0, sh.d), code: 'set-values', hint: 'The model goes on until the river is back to its regular level (' + t('h=0') + '), not just to the second reading.' }],
              rW: [{ is: bld('y', sh.H1, sh.H0), code: 'set-values', hint: 'The river keeps falling until ' + t('h=0') + ' (its regular level), so the range goes down to 0.' }],
              endHint: 'The model starts at the peak and stops when the river is back to its regular level (' + t('h=0') + '), so both ends are values.' },
              'The river is back to normal when ' + t('h=0') + ': ' + t('0=' + nf(-sh.rate) + 't+' + fx(sh.H0, 2) + '\\Rightarrow t=' + sh.T) + '.<br>Domain: ' + t(bld('t', 0, sh.T)) + '. Range: ' + t('h(0)=' + fx(sh.H0, 2)) + ' and ' + t('h(' + sh.T + ')=0') + ', so ' + t(bld('h(t)', 0, sh.H0)) + '.',
              ['When does the model stop? Find when the river is back to its regular level, ' + t('h(t)=0') + '.'], 'domain/range river');
          } }] },
      /* ---------------- Q7 ---------------- */
      { num: '7', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '7', level: 'PRG', outcome: 'RF7', make: function (r) {
          var bk = r.chance(0.25), a = bk ? 40 : r.pick(rng(35, 95, 5)), b = bk ? 50 : r.pick(rng(40, 120, 10).filter(function (x) { return x !== a; })), t1 = bk ? 2 : r.pick([1, 2, 3]), t2 = bk ? 5 : r.pick([4, 5, 6]), k = bk ? 6 : r.pick([6, 7, 8].filter(function (x) { return x !== t2; }));
          var C = function (h) { return a * h + b; }, wrongC = k * a + a;
          var o = function (f, c) { return money(f) + '\\text{ and }' + money(c); };
          return mc(r, 'A plumbing company charges a fixed call-out fee plus a fixed hourly rate for any repair job. A ' + t(t1) + '-hour job costs ' + t(money(C(t1))) + ' and a ' + t(t2) + '-hour job costs ' + t(money(C(t2))) + '. The fixed call-out fee and the cost of a ' + t(k) + '-hour job are, respectively,', [
            { html: t(o(b, C(k))), right: true },
            { html: t(o(a, C(k))), why: t(money(a)) + ' is the hourly rate (the slope). The call-out fee is the cost at ' + t('t=0') + '.' },
            { html: t(o(b, wrongC)), why: 'Check the ' + t(k) + '-hour cost: ' + t('C(' + k + ')=' + a + '(' + k + ')+' + b) + '.' },
            { html: t(o(a, wrongC)), why: t(money(a)) + ' is the hourly rate, not the fee. Find ' + t('b') + ' by substituting a point.' }],
            'Using ' + t(ptT([t1, C(t1)])) + ' and ' + t(ptT([t2, C(t2)])) + ': ' + t('m=\\dfrac{' + C(t2) + '-' + C(t1) + '}{' + t2 + '-' + t1 + '}=' + a) + ' $/h.<br>' + t('C=' + a + 't+b') + '; substitute ' + t(ptT([t1, C(t1)])) + ': ' + t(C(t1) + '=' + (a * t1) + '+b\\Rightarrow b=' + b) + '.<br>The fee is ' + t(money(b)) + ' and ' + t('C(' + k + ')=' + a + '(' + k + ')+' + b + '=' + money(C(k))) + '.',
            ['Find the hourly rate (slope) from the two jobs, then the fee (the cost at 0 hours).'], 'plumber fee and cost', false);
        } }] },
      /* ---------------- Q8 ---------------- */
      { num: '8', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '8', level: 'PRG', make: function (r) {
          var bk = r.chance(0.25), d = bk ? 300 : r.pick([200, 250, 300, 400, 500, 600]), R = bk ? 3.4 : r.pick(rng(2.5, 4.5, 0.1)), T0 = bk ? 14 : r.int(9, 16), dT = cl(Math.round(R * d / 10) / 100), T2 = cl(T0 + dT);
          var ans = K.roundTo(dT / (d / 1000), 1);
          var p = B.approx('The temperature at the top of a mine shaft is ' + t(T0 + '^\\circ\\text{C}') + '. At ' + t(d) + ' metres below the surface the temperature is ' + t(fx(T2, 2) + '^\\circ\\text{C}') + '. To the nearest tenth, the rate of temperature increase in ' + t('^\\circ\\text{C}') + ' per km is ________.', dT / (d / 1000), 1, { nr: true, diag: dg([
            { v: K.roundTo(dT / d * 100, 1), code: 'ctx-nr-m', hint: 'Convert carefully: ' + t(d) + ' m ' + t('=' + nf(d / 1000)) + ' km.' },
            { v: K.roundTo(T2 / (d / 1000), 1), code: 'ctx-temp', hint: 'Use the <b>change</b> in temperature, ' + t(fx(T2, 2) + '-' + T0) + ', not the temperature itself.' },
            { v: K.roundTo((d / 1000) / dT, 1), code: 'ctx-flip', hint: 'Upside down: the rate is °C per km, so the temperature change goes on top.' }]) },
            t(d) + ' m ' + t('=' + nf(d / 1000)) + ' km, and the temperature rises by ' + t(fx(T2, 2) + '-' + T0 + '=' + fx(dT, 2) + '^\\circ\\text{C}') + '.<br>' + t('\\text{rate}=\\dfrac{' + fx(dT, 2) + '}{' + nf(d / 1000) + '}\\approx ' + ans.toFixed(1)) + ' °C per km.',
            ['Rate = (change in temperature) ÷ (depth in km).', 'How many km is ' + t(d) + ' m?'], 'mine shaft rate');
          return p;
        } }] },
      /* ---------------- Q9 (Extension) ---------------- */
      { num: '9', section: 'Extension — real data are rarely perfectly linear', shared: candleShared,
        stem: function (sh) { return '<i>(Extension)</i> A class lit a candle and measured its height, ' + t('h') + ' centimetres, every ' + t(10) + ' minutes.' + [[0, 4], [4, 7]].map(function (q) { return HW.valueTable([['\\(t\\) (min)'].concat(sh.ts.slice(q[0], q[1])), ['\\(h\\) (cm)'].concat(sh.hs.slice(q[0], q[1]).map(function (v) { return fx(v, 1); }))]); }).join(''); },
        parts: [
          { id: '9a', level: 'PRG', outcome: 'RF4', make: function (r, sh) {
            var data = sh.ts.map(function (x, i) { return { x: x, y: sh.hs[i] }; });
            var I = pad({ x: [0, 150], y: [0, sh.ymax], gx: 10, gy: 1, sx: 10, sy: 0.5, lx: 20, ly: 2, xn: 't', yn: 'h', xt: 't (min)', yt: 'h (cm)', end: 'none', bg: { points: data } });
            var snapH = function (v) { return Math.round(v * 2) / 2; }, A = [0, snapH(sh.b)], Bp = [100, snapH(sh.b + 100 * sh.m)];
            var check = function (resp) {
              if (Dr.empty(resp)) return form('empty', 'Draw your line on the grid first.');
              var S = Dr.norm(resp), g = Dr.geom(S), keys = Object.keys(g.lines);
              if (!keys.length) return form('ctx-join', 'Use <b>╱ Line</b>: tap two points to draw one straight line through the middle of the data.');
              if (keys.length > 1) return wrong('ctx-pieces', 'Draw <b>one straight line</b> — not dot-to-dot. A line of best fit passes through the middle of the points.');
              var Lq = g.lines[keys[0]]; if (Math.abs(Lq.B) < 1e-9) return wrong('ctx-fit', 'That line is vertical. The line of best fit follows the trend of the points.');
              var fl = function (x) { return (Lq.C - Lq.A * x) / Lq.B; }, res = sh.ts.map(function (x, i) { return sh.hs[i] - fl(x); });
              var slope = -Lq.A / Lq.B;
              if (slope >= 0) return wrong('ctx-rate-sign', 'The candle gets shorter as it burns, so your line should go <b>down</b> from left to right.');
              var mx = Math.max.apply(null, res.map(Math.abs));
              if (mx <= 0.6 + 1e-9) return ok();
              if (res[0] > 0.6 || res[res.length - 1] < -0.6) return wrong('ctx-fit', 'Your line is too ' + (res[0] > 0.6 ? 'low on the left' : 'high on the right') + '. Make it pass through the middle of the points, with about as many above as below.');
              return wrong('ctx-fit', 'Your line is too far from some of the points. Make it pass through the middle of the data, with about as many points above as below.');
            };
            var p = K.P.graph('(a) The data are plotted on the grid. Draw the straight line that you think best fits the points. <i>(Use ╱ Line and tap two points; heights snap to every 0.5 cm.)</i>', I, check,
              seg(A, Bp, 'none', 'none'), 'The points are close to — but not exactly on — a straight line. A good line passes through about ' + t(ptT(A)) + ' and ' + t(ptT(Bp)) + ', with the points scattered evenly above and below it.',
              ['A line of best fit follows the trend: about as many points above it as below.', 'It doesn’t have to pass through any data point.'], 'line of best fit');
            p.bad = [seg([0, sh.hs[0]], [60, sh.hs[0]], 'none', 'none'), seg([0, snapH(sh.b) - 3], [100, Bp[1] - 3], 'none', 'none')];
            var dot = { pts: [], pieces: [{ v: sh.ts.map(function (x, i) { return [x, snapH(sh.hs[i])]; }), s: 'none', e: 'none' }], join: 'none' };
            if (Object.keys(Dr.geom(dot).lines).length > 1) p.bad.push(dot);
            return p;
          } },
          { id: '9bi', sub: 'b i', level: 'ADV', outcome: 'RF7', make: function (r, sh) {
            var mk = cl(Math.round(sh.m * 1000) / 1000), bk = cl(Math.round(sh.b * 10) / 10);
            var check = function (resp) {
              var rd = Ln.read(prep(resp), ['t', 'h']);
              if (!rd.ok) { var why = { empty: 'Type your equation first.', 'no-eq': 'Write an equation, e.g. ' + t('h=-0.1t+14') + '.', vars: 'Use the letters ' + t('h') + ' and ' + t('t') + '.' }; return form(rd.why === 'empty' ? 'empty' : 'line-' + rd.why, why[rd.why] || 'I can’t read that equation. Check the signs and the letters.'); }
              if (Math.abs(rd.b) < 1e-12) return wrong('ctx-fit', 'That’s a vertical line. Write ' + t('h') + ' in terms of ' + t('t') + '.');
              var m = -rd.a / rd.b, c = -rd.c / rd.b, res = sh.ts.map(function (x, i) { return Math.abs(sh.hs[i] - (m * x + c)); }), mx = Math.max.apply(null, res);
              if (mx <= 0.7 + 1e-9) { if (!/^\s*h\s*=/.test(prep(resp).replace(/\\left|\\right/g, ''))) return form('line-form-si', 'Good line — now write it in the form ' + t('h=mt+b') + ', with ' + t('h') + ' by itself on the left.'); return ok(); }
              if (m > 0) return wrong('ctx-rate-sign', 'The candle gets shorter, so the slope must be negative.');
              var r10 = sh.ts.map(function (x, i) { return Math.abs(sh.hs[i] - (m / 10 * x + c)); });
              if (Math.max.apply(null, r10) <= 0.9) return wrong('ctx-per10', 'Your slope is the drop per <b>10 minutes</b> (per reading). ' + t('t') + ' is in minutes, so divide the change in height by the change in minutes.');
              if (Math.abs(c - sh.hs[0]) > 1) return wrong('ctx-fit', 'Check ' + t('b') + ': it is the height at ' + t('t=0') + ', about ' + t(fx(sh.hs[0], 1)) + ' cm.');
              return wrong('ctx-fit', 'Your line doesn’t fit the data. Choose two points on your line (far apart), find the slope ' + t('\\frac{\\Delta h}{\\Delta t}') + ', then ' + t('b') + '.');
            };
            var p = B.math('(b) Choose two points on a line of best fit for the data — such as the line you drew in (a) — (not necessarily data points) and write the equation of that line in the form ' + t('h=mt+b') + '. <i>(Any equation close to the data is accepted.)</i>', check, 'h=' + nf(mk) + 't+' + nf(bk),
              'e.g. through ' + t(ptT([0, sh.hs[0]])) + ' and ' + t(ptT([60, sh.hs[6]])) + ': ' + t('m\\approx\\dfrac{' + fx(sh.hs[6], 1) + '-' + fx(sh.hs[0], 1) + '}{60-0}=\\dfrac{' + fx(sh.hs[6] - sh.hs[0], 1) + '}{60}\\approx ' + nf(Math.round((sh.hs[6] - sh.hs[0]) / 60 * 1000) / 1000)) + ' cm/min, ' + t('b\\approx ' + fx(sh.hs[0], 1)) + '.<br>A best-fit line is about ' + t('h=' + nf(mk) + 't+' + nf(bk)) + ' (answers vary slightly).',
              ['Pick two points on your line far apart, e.g. at ' + t('t=0') + ' and ' + t('t=60') + '.', 'Slope = change in height ÷ change in minutes.'], 'equation of best-fit line', { keys: 'eq', vars: ['t', 'h'], placeholder: 'e.g. h = -0.1t + 14' });
            p.bad = ['h=' + nf(mk * 10) + 't+' + nf(bk), 'h=' + nf(-mk) + 't+' + nf(bk), 'h=' + nf(mk) + 't+' + nf(bk + 3)];
            p.good = ['h=' + nf(Math.round((sh.hs[6] - sh.hs[0]) / 60 * 1000) / 1000) + 't+' + fx(sh.hs[0], 1)];
            return p;
          } },
          { id: '9bii', sub: 'b ii', level: 'EMG', make: function (r, sh) {
            var a = t(nf(Math.abs(Math.round(sh.m * 100) / 100)));
            return mc(r, '(b) What does the slope of a line of best fit for these data mean?', [
              { html: 'The candle gets shorter by about ' + a + ' cm each minute.', right: true },
              { html: 'The candle gets shorter by about ' + a + ' cm every 10 minutes.', why: t('t') + ' is measured in minutes, so the slope is cm per <b>minute</b>.' },
              { html: 'The candle burns for about ' + a + ' minutes per centimetre.', why: 'Units upside down: the slope is cm (vertical) per minute (horizontal).' },
              { html: 'The candle was about ' + t(fx(sh.hs[0], 1)) + ' cm tall when it was lit.', why: 'That’s the meaning of the intercept ' + t('b') + ', not the slope.' }],
              'The slope is about ' + t(nf(Math.round(sh.m * 100) / 100)) + ' cm/min: the candle gets shorter by about ' + a + ' cm each minute.', ['Units of the slope: cm per minute.'], 'meaning of candle slope');
          } },
          { id: '9c', level: 'PRG', outcome: 'RF7', make: function (r, sh) {
            /* burn-out time extrapolates far past the data, so any line accepted in (a)/(b) gives roughly 0.85T–1.25T */
            var T = sh.T, lo = 0.85 * T, hi = 1.25 * T;
            var check = function (resp) {
              var p = HW.parse.number(resp); if (!p.ok) return form(p.code === 'empty' ? 'empty' : 'notnumber', p.code === 'empty' ? 'Type your answer first.' : 'Enter a single number of minutes.');
              var v = p.value; if (v >= lo && v <= hi) return ok();
              if (v < 0) return wrong('ctx-rate-sign', 'Time can’t be negative — check the signs when you solve ' + t('0=mt+b') + '.');
              if (Math.abs(v - sh.hs[0]) < 1) return wrong('ctx-tint-b', 'That’s the starting height. The candle burns out when ' + t('h=0') + ': solve for ' + t('t') + '.');
              if (v >= lo / 10 && v <= hi / 10) return wrong('ctx-per10', 'That’s in 10-minute steps. ' + t('t') + ' is in minutes — check your slope.');
              return wrong('value', 'Set ' + t('h=0') + ' in your equation and solve for ' + t('t') + '. (A good answer is roughly ' + t(Math.round(lo / 10) * 10) + ' to ' + t(Math.round(hi / 10) * 10) + ' minutes.)');
            };
            var p = { prompt: '(c) Use the equation of a line of best fit for the data (such as yours from (b)) to predict when the candle will burn out.', input: { type: 'math', keys: 'fraction', after: 'min', placeholder: 'minutes' }, check: check, key: String(Math.round(T)), answer: t('\\approx ' + Math.round(T)) + ' min',
              solution: 'Burns out when ' + t('h=0') + ': ' + t('0=' + nf(Math.round(sh.m * 1000) / 1000) + 't+' + nf(Math.round(sh.b * 10) / 10) + '\\Rightarrow t\\approx ' + Math.round(T)) + ' min. Answers vary with your line: roughly ' + t(Math.round(lo)) + ' to ' + t(Math.round(hi)) + ' min is reasonable.', hints: ['The candle has burned out when its height is 0.'], text: 'candle burn-out time' };
            p.bad = [String(Math.round(sh.hs[0])), String(Math.round(T / 10)), String(-Math.round(T))];
            return p;
          } }] }
    ],
    extra: [
      /* ---------------- EP1 ---------------- */
      { num: '1', section: 'Extra practice A — Slope carries units: reading a rate off a graph', shared: function (r) {
          var bk = r.chance(0.25), c = bk ? [900, 60] : r.pick([[900, 60], [600, 40], [720, 48], [750, 50], [840, 60], [900, 75], [600, 50], [720, 60]]), F0 = c[0], g = c[1], T = F0 / g;
          var ts = rng(1, T - 1).filter(function (x) { return (g * x) % 10 === 0; }), t1 = bk ? 2 : r.pick(ts.filter(function (x) { return x <= T / 3; })), t2 = bk ? 8 : r.pick(ts.filter(function (x) { return x - t1 >= 4; }));
          return { F0: F0, g: g, T: T, t1: t1, t2: t2, F1: F0 - g * t1, F2: F0 - g * t2, ch: chairGen(r, 20, 100) };
        },
        stem: function (sh) {
          var c = sh.ch;
          return 'Each graph shows a linear relationship between two real quantities. Calculate the slope using ' + t('m=\\frac{y_2-y_1}{x_2-x_1}') + ', build the units out of the two axis labels, and interpret it.<br><b>Graph (a):</b> filament remaining on a 3-D printer spool, as a function of printing time.' +
            fig({ x: [0, 16], y: [0, 1000], gx: 1, gy: 100, lx: 3, ly: 200, xn: 't', yn: 'F', xt: 'Time, t (h)', yt: 'Filament, F (g)', segs: [{ pts: [[0, sh.F0], [sh.T, 0]] }], points: [{ x: sh.t1, y: sh.F1, label: '(' + sh.t1 + ', ' + sh.F1 + ')' }, { x: sh.t2, y: sh.F2, label: '(' + sh.t2 + ', ' + sh.F2 + ')' }], aria: 'filament graph' }) +
            '<b>Graph (b):</b> height above the base station of a chairlift, as a function of time. <b>Read the tick numbers carefully — the two axes are not on the same scale.</b>' + chairFig(c);
        },
        parts: [
          { id: 'e1a', level: 'BEG', make: function (r, sh) {
            return num('(a) Calculate the slope of graph (a).', -sh.g, [
              { v: sh.g, code: 'ctx-rate-sign', hint: 'The filament is being used up — the line goes down, so the slope is negative.' },
              { v: -1 / sh.g, code: 'ctx-flip', hint: 'That’s hours per gram (upside down). Vertical units per horizontal unit: grams per hour.' },
              { v: -sh.g / 100, code: 'ctx-squares', hint: 'It looks like you counted grid squares. Use the tick numbers: the change in grams over the change in hours.' }],
              t('m=\\dfrac{' + sh.F2 + '-' + sh.F1 + '}{' + sh.t2 + '-' + sh.t1 + '}=\\dfrac{' + (sh.F2 - sh.F1) + '}{' + (sh.t2 - sh.t1) + '}=' + (-sh.g)) + ' g/h. Units: grams (vertical) per hour (horizontal).', ['Use the two labelled points.'], 'spool slope', { before: t('m='), after: 'g/h' });
          } },
          { id: 'e1b', level: 'EMG', make: function (r, sh) {
            var c = sh.ch;
            return num('(b) Calculate the slope of graph (b).', c.rate, [
              { v: c.rate * c.sx / c.sy, code: 'ctx-squares', hint: 'You counted grid squares. One square across is ' + t(c.sx) + ' s but one square up is ' + t(c.sy) + ' m — use the coordinates from the tick numbers.' },
              { v: 1 / c.rate, code: 'ctx-flip', hint: 'That’s seconds per metre (upside down). Metres (vertical) per second (horizontal).' },
              { v: -c.rate, code: 'ctx-rate-sign', hint: 'The chair is going up, so the slope is positive.' },
              { v: c.E2 - c.E1, code: 'ctx-total', hint: 'Divide the change in height by the change in time, ' + t(c.t2 + '-' + c.t1) + ' s.' }],
              t('m=\\dfrac{' + c.E2 + '-' + c.E1 + '}{' + c.t2 + '-' + c.t1 + '}=\\dfrac{' + (c.E2 - c.E1) + '}{' + (c.t2 - c.t1) + '}=' + nf(c.rate)) + ' m/s. Units: metres per second.', ['Read the coordinates of the two labelled points; don’t count squares.'], 'chairlift slope', { before: t('m='), after: 'm/s' });
          } },
          { id: 'e1c', level: 'EMG', make: function (r, sh) {
            return num('(c) Find the ' + t('F') + '-intercept of graph (a).', sh.F0, [
              { v: sh.F1, code: 'ctx-start-point', hint: 'That’s the value at ' + t('t=' + sh.t1) + '. The intercept is the value at ' + t('t=0') + '.' },
              { v: sh.F1 - sh.g * sh.t1, code: 'ctx-add-b', hint: 'Going back in time the spool had <b>more</b> filament: ' + t(sh.F1 + '+' + sh.t1 + '(' + sh.g + ')') + '.' }],
              t('F') + '-intercept: ' + t(sh.F1 + '+' + sh.t1 + '(' + sh.g + ')=' + sh.F0) + ', the point ' + t('(0,\\ ' + sh.F0 + ')') + '.', ['Work back from ' + t(ptT([sh.t1, sh.F1])) + ' to ' + t('t=0') + ' using the rate.'], 'spool intercept', { after: 'g' });
          } },
          { id: 'e1c2', sub: 'c ii', level: 'EMG', make: function (r, sh) {
            return interpMC(r, '(c) Interpret the slope and the ' + t('F') + '-intercept of graph (a) in sentences with units.', { what: 'the filament on the spool', up: 'increasing', down: 'decreasing', uy: 'grams', uy1: 'gram', ux: 'hour of printing', uxs: 'hours', start: function (v) { return 'The spool held ' + v + ' grams of filament when printing began ' + t('(t=0)') + '.'; } }, -sh.g, sh.F0,
              'The slope ' + t(-sh.g) + ' g/h: the filament is <b>decreasing at ' + sh.g + ' grams per hour</b> of printing. The intercept ' + t(sh.F0) + ' g: the spool held ' + t(sh.F0) + ' g when printing began.', 'interpret spool slope/intercept');
          } },
          { id: 'e1d', level: 'EMG', make: function (r, sh) {
            var c = sh.ch;
            return num('(d) Find the ' + t('E') + '-intercept of graph (b).', c.E0, [
              { v: c.E1, code: 'ctx-start-point', hint: 'That’s the height at ' + t('t=' + c.t1) + '. The intercept is the height at ' + t('t=0') + '.' },
              { v: c.E1 + c.rate * c.t1, code: 'ctx-add-b', hint: 'Going back in time the chair was <b>lower</b>: ' + t(c.E1 + '-' + c.t1 + '(' + nf(c.rate) + ')') + '.' }],
              t('E') + '-intercept: ' + t(c.E1 + '-' + c.t1 + '(' + nf(c.rate) + ')=' + c.E0) + ', the point ' + t('(0,\\ ' + c.E0 + ')') + '.', ['Work back from ' + t(ptT([c.t1, c.E1])) + ' to ' + t('t=0') + '.'], 'chair intercept', { after: 'm' });
          } },
          { id: 'e1d2', sub: 'd ii', level: 'EMG', make: function (r, sh) {
            var c = sh.ch;
            return interpMC(r, '(d) Interpret the slope and the ' + t('E') + '-intercept of graph (b) in sentences with units.', { what: 'the chair’s height above the base station', up: 'increasing', down: 'decreasing', uy: 'metres', uy1: 'metre', ux: 'second', uxs: 'seconds', start: function (v) { return 'At ' + t('t=0') + ' the chair is ' + v + ' metres above the base station.'; } }, c.rate, c.E0,
              'The slope ' + t(nf(c.rate)) + ' m/s: the height is <b>increasing at ' + nf(c.rate) + ' metres per second</b>. The intercept: at ' + t('t=0') + ' the chair is ' + t(c.E0) + ' m above the base station.', 'interpret chair slope/intercept');
          } }] },
      /* ---------------- EP2 ---------------- */
      { num: '2', shared: function (r) { var s = r.pick([[20, 100], [20, 100], [10, 50], [20, 50], [10, 100]]); return { c: chairGen(r, s[0], s[1]) }; },
        stem: function (sh) {
          var c = sh.c, ac = (c.t2 - c.t1) / c.sx, up = cl((c.E2 - c.E1) / c.sy), q = cl(up / ac);
          return '<b>Counting squares is not the same as counting units.</b> A student reads this chairlift graph by counting grid squares: “from ' + t(ptT([c.t1, c.E1])) + ' to ' + t(ptT([c.t2, c.E2])) + ' I go right ' + t(ac) + ' squares and up ' + t(nf(up)) + ' squares, so the slope is ' + t('\\frac{' + nf(up) + '}{' + ac + '}=' + nf(q)) + '.”' + chairFig(c);
        },
        parts: [
          { id: 'e2a', level: 'EMG', make: function (r, sh) {
            var c = sh.c;
            return mc(r, '(a) What does the student’s number measure, and why is it not the rate of change?', [
              { html: 'Squares up per square across — a fact about the drawing, with no units. One square across is ' + t(c.sx) + ' s but one square up is ' + t(c.sy) + ' m, so it doesn’t compare metres with seconds.', right: true },
              { html: 'It is the rate in metres per second; the student only forgot to write the units.', why: 'The squares are different sizes on the two axes (' + t(c.sx) + ' s across, ' + t(c.sy) + ' m up), so squares per square isn’t metres per second.' },
              { html: 'It is the rate in seconds per metre: the student divided the wrong way.', why: 'The student did put “up” on top. The problem is counting squares on axes with different scales.' },
              { html: 'It is correct: rise over run is the same however you measure it.', why: 'Only when one square stands for the same number of units on both axes. Here it doesn’t.' }],
              'It measures <b>squares per square</b>: a fact about the picture, with no units. One square across is ' + t(c.sx) + ' s but one square up is ' + t(c.sy) + ' m, so the rate must compare metres with seconds, using the tick numbers.', ['What is one square worth across? Up?'], 'squares per square');
          } },
          { id: 'e2b', level: 'PRG', make: function (r, sh) {
            var c = sh.c, f = c.sy / c.sx, q = cl(c.rate * c.sx / c.sy);
            return num('(b) Find the number you must multiply the student’s ' + t(nf(q)) + ' by to repair the answer.', f, [
              { v: c.sx / c.sy, code: 'ctx-flip', hint: 'Upside down: one square up is worth ' + t(c.sy) + ' m and one square across ' + t(c.sx) + ' s, so one square per square is ' + t('\\frac{' + c.sy + '\\text{ m}}{' + c.sx + '\\text{ s}}') + '.' },
              { v: c.rate, code: 'ctx-total', hint: 'That’s the repaired rate. The question asks for the number you multiply by.' },
              { v: c.sy, code: 'value', hint: 'Use both scales: (metres per square up) ÷ (seconds per square across).' },
              { v: c.sx, code: 'value', hint: 'Use both scales: (metres per square up) ÷ (seconds per square across).' }],
              'Each vertical square is ' + t(c.sy) + ' m and each horizontal square ' + t(c.sx) + ' s, so one square up per square across is worth ' + t('\\frac{' + c.sy + '\\text{ m}}{' + c.sx + '\\text{ s}}=' + nf(f)) + ' m/s.<br>' + t(nf(q) + '\\times ' + nf(f) + '=' + nf(c.rate)) + ' m/s. Multiply by ' + t(nf(f)) + '.',
              ['How many metres is one square up? How many seconds is one square across?'], 'repair factor');
          } },
          { id: 'e2c', level: 'EMG', make: function (r, sh) {
            return mc(r, '(c) When may you count squares to find a slope, and when may you not?', [
              { html: 'Only when one square stands for the same number of units on both axes; otherwise read the coordinates from the tick numbers and use ' + t('m=\\frac{y_2-y_1}{x_2-x_1}') + '.', right: true },
              { html: 'Always — rise over run is the same however you count it.', why: 'Not when the axes have different scales: then a square up and a square across stand for different amounts.' },
              { html: 'Never — counting squares always gives the wrong slope.', why: 'When both axes have the same scale (say 1 unit per square), counting squares works fine.' },
              { html: 'Only when the slope is positive.', why: 'The sign has nothing to do with it — what matters is whether the two axes use the same scale.' }],
              'Counting squares gives the slope only when one square is the same number of units on both axes. With different scales, use the tick numbers and ' + t('\\frac{y_2-y_1}{x_2-x_1}') + '.', ['Think about what one square is worth on each axis.'], 'rule for counting squares');
          } }] },
      /* ---------------- EP3 ---------------- */
      { num: '3', section: 'Extra practice B — What the y-intercept means', stem: 'For each model, choose the sentences that interpret <b>both</b> the slope and the vertical intercept with units.', parts: [
        { id: 'e3a', level: 'EMG', make: function (r) {
          var m = r.pick([1.2, 1.4, 1.6, 1.8, 2.5]), b = r.pick([30, 36, 40, 45, 50]);
          return interpMC(r, '(a) ' + t('W=' + nf(-m) + 't+' + b) + ', where ' + t('W') + ' is the rinse water left in a dishwasher’s reservoir in litres and ' + t('t') + ' is the running time in minutes.', { what: 'the rinse water in the reservoir', up: 'increasing', down: 'decreasing', uy: 'litres', uy1: 'litre', ux: 'minute', uxs: 'minutes', start: function (v) { return 'The reservoir held ' + v + ' litres when the dishwasher started ' + t('(t=0)') + '.'; } }, -m, b,
            'Slope ' + t(nf(-m)) + ' L/min: the rinse water is <b>decreasing at ' + nf(m) + ' litres per minute</b>. Intercept ' + t(b) + ' L: the reservoir held ' + t(b) + ' L when the dishwasher started.', 'interpret dishwasher model');
        } },
        { id: 'e3b', level: 'EMG', make: function (r) {
          var m = r.pick([120, 135, 145, 160, 175]), b = r.pick([18, 20, 22, 24]);
          return interpMC(r, '(b) ' + t('T=' + m + 'h+' + b) + ', where ' + t('T') + ' is the interior temperature of a pottery kiln in ' + t('^\\circ\\text{C}') + ' and ' + t('h') + ' is the number of hours since firing began.', { what: 'the kiln’s interior temperature', up: 'rising', down: 'falling', uy: '°C', uy1: '°C', ux: 'hour', uxs: 'hours', start: function (v) { return 'The kiln was at ' + v + ' °C when firing began ' + t('(h=0)') + '.'; } }, m, b,
            'Slope ' + t(m) + ' °C/h: the temperature is <b>rising at ' + m + ' °C per hour</b> of firing. Intercept ' + t(b) + ' °C: the kiln was at about room temperature, ' + t(b) + ' °C, when firing began.', 'interpret kiln model');
        } },
        { id: 'e3c', level: 'EMG', make: function (r) {
          var m = r.pick([0.85, 0.92, 1.1, 1.25]), b = r.pick([35, 45, 55, 65]);
          return interpMC(r, '(c) ' + t('C=' + nf(m) + 'd+' + b) + ', where ' + t('C') + ' is the cost in dollars of a courier delivery of ' + t('d') + ' kilometres.', { what: 'the delivery cost', up: 'rising', down: 'falling', uy: 'dollars', uy1: 'dollar', ux: 'kilometre', uxs: 'kilometres', money: true, start: function (v) { return 'A delivery costs ' + v + ' before any distance is driven — a fixed charge.'; } }, m, b,
            'Slope ' + t(nf(m)) + ' $/km: the cost <b>rises by ' + t(cash(m)) + ' for each additional kilometre</b>. Intercept ' + t(money(b)) + ': a fixed charge paid before any distance is driven.', 'interpret courier model');
        } }] },
      /* ---------------- EP4 ---------------- */
      { num: '4', shared: function (r) {
          var good = [
            function () { var a = r.pick([10, 12, 15]), b = r.pick([480, 540, 600]); return { eq: 'V=' + (-a) + 't+' + b, desc: t('V') + ' is the water in a livestock trough in litres, ' + t('t') + ' hours after it was filled.', zero: t('t=0') + ': ' + t('V=' + b) + ' L', sent: 'The trough held ' + t(b) + ' litres of water at the moment it was filled.', wrongS: 'The trough loses ' + t(b) + ' litres of water every hour.' }; },
            function () { var a = r.pick([15, 18, 22]), b = r.pick([180, 240, 300]); return { eq: 'P=' + a + 'n+' + b, desc: t('P') + ' is the total cost in dollars of a school ski trip for ' + t('n') + ' students.', zero: t('n=0') + ': ' + t('P=' + money(b)), sent: 'The trip costs ' + t(money(b)) + ' even with no students — fixed costs, such as the bus, that don’t depend on ' + t('n') + '.', wrongS: 'Each student pays ' + t(money(b)) + ' for the trip.' }; },
            function () { var a = r.pick([0.25, 0.35, 0.4]), b = r.pick([12.5, 14.2, 15.8]); return { eq: 'M=' + nf(-a) + 'd+' + nf(b), desc: t('M') + ' is the mass in kilograms of a wheel of cheese ' + t('d') + ' days into its ageing.', zero: t('d=0') + ': ' + t('M=' + nf(b)) + ' kg', sent: 'The wheel of cheese had a mass of ' + t(nf(b)) + ' kg on the day ageing began.', wrongS: 'The cheese loses ' + t(nf(b)) + ' kg of mass each day.' }; },
            function () { var a = r.pick([1.75, 2.1, 2.4]), b = r.pick([3.5, 4.25, 5]); return { eq: 'C=' + nf(a) + 'k+' + nf(b), desc: t('C') + ' is the taxi fare in dollars for a ride of ' + t('k') + ' kilometres.', zero: t('k=0') + ': ' + t('C=' + cash(b)), sent: 'Every ride costs ' + t(cash(b)) + ' before any distance is driven — the starting fare.', wrongS: 'The fare goes up ' + t(cash(b)) + ' for every kilometre.' }; }];
          var bad = [
            function () { return { eq: 'H=2.9f+78.5', desc: 'a forensic estimate of an adult’s height ' + t('H') + ' in centimetres from the length ' + t('f') + ' of the forearm in centimetres. The model is used only for ' + t('20\\le f\\le 32') + '.', zero: t('f=0') + ': ' + t('H=78.5') + ' cm', why: 'a forearm 0 cm long is far outside ' + t('20\\le f\\le 32') }; },
            function () { return { eq: 'H=2.6L+65', desc: 'an estimate of an adult’s height ' + t('H') + ' in centimetres from the length ' + t('L') + ' of the thigh bone in centimetres, used only for ' + t('38\\le L\\le 52') + '.', zero: t('L=0') + ': ' + t('H=65') + ' cm', why: 'a thigh bone 0 cm long is far outside ' + t('38\\le L\\le 52') }; },
            function () { return { eq: 'T=0.21N+4.4', desc: 'the air temperature ' + t('T') + ' in °C estimated from ' + t('N') + ', the number of cricket chirps per minute, used only for ' + t('60\\le N\\le 200') + '.', zero: t('N=0') + ': ' + t('T=4.4') + ' °C', why: '0 chirps per minute is outside ' + t('60\\le N\\le 200') + ' — silent crickets tell you nothing about the temperature' }; }];
          var ms = r.sample(good, 3).map(function (f) { var o = f(); o.ok = true; return o; }), nb = r.pick(bad)(); nb.ok = false;
          var all = r.shuffle(ms.concat([nb])), L = ['a', 'b', 'c', 'd'];
          all.forEach(function (o, i) { o.L = L[i]; });
          return { all: all, bad: nb, good: all.filter(function (o) { return o.ok; }) };
        },
        stem: function (sh) { return '<b>One of these intercepts means nothing.</b> Three of the four models have a vertical intercept that describes something real. In the fourth, substituting 0 for the independent variable takes you outside the practical domain.<br>' + sh.all.map(function (o) { return '(' + o.L + ') ' + t(o.eq) + ': ' + o.desc; }).join('<br>'); },
        parts: [
          { id: 'e4a', sub: 'a–d', level: 'PRG', make: function (r, sh) {
            var want = {}; sh.all.forEach(function (o) { want[o.L] = o.ok ? 'yes' : 'no'; });
            return B.grid('(a)–(d) Find each intercept, then decide whether it describes something real.', sh.all.map(function (o) { return { id: o.L, html: '(' + o.L + ') ' + t(o.eq) }; }), [{ id: 'yes', html: 'Meaningful' }, { id: 'no', html: 'Not meaningful' }], want,
              { why: function (row) { var o = sh.all.filter(function (x) { return x.L === row; })[0]; return o.ok ? { code: 'row', hint: 'Model (' + row + '): ' + o.zero + ' — is 0 a value the situation can actually have?' } : { code: 'row', hint: 'Model (' + row + '): ' + o.zero + ', but ' + o.why + '.' }; } },
              sh.all.map(function (o) { return '(' + o.L + ') ' + o.zero + ' — ' + (o.ok ? '<b>meaningful</b>.' : '<b>not meaningful</b>: ' + o.why + '.'); }).join('<br>'), ['Substitute 0 for the input. Is that input inside the situation’s practical domain?'], 'meaningful intercepts');
          } },
          { id: 'e4e', sub: 'e', level: 'EMG', make: function (r, sh) {
            var o = sh.bad;
            return mc(r, '(e) Why can’t the situation in model (' + o.L + ') use its intercept?', [
              { html: 'Substituting 0 takes the input outside the stated domain — ' + o.why + ' — so the intercept is a number the algebra produces but the situation can’t use.', right: true },
              { html: 'Because the intercept is a decimal, and real measurements are whole numbers.', why: 'Decimals are fine for measurements. The problem is the input value 0.' },
              { html: 'Because the slope is positive, so the intercept can’t mean anything.', why: 'Lots of models with a positive slope have a meaningful intercept (like a fixed fee). Look at the domain.' },
              { html: 'Because every intercept is just a guess.', why: 'In the other three models the intercept is a real starting value. Here the input 0 is impossible.' }],
              'Model (' + o.L + '): ' + o.zero + '. But ' + o.why + ', so the intercept is produced by the algebra but describes nothing real.', ['Is an input of 0 possible in that situation?'], 'why meaningless');
          } },
          { id: 'e4f', sub: 'f', level: 'EMG', make: function (r, sh) {
            var o = r.pick(sh.good);
            return mc(r, '(f) Which sentence gives the intercept of model (' + o.L + ') the meaning (with units) it deserves?', [
              { html: o.sent, right: true },
              { html: o.wrongS, why: 'That reads the intercept as a rate. The intercept is the value when the input is 0.' },
              { html: 'It is the value of the model at the end of the situation.', why: 'The intercept is at the <b>start</b>, where the input is 0.' },
              { html: 'The intercept has no meaning in this model.', why: 'An input of 0 is possible here, so the intercept is a real starting value.' }],
              '(' + o.L + ') ' + o.zero + ': ' + o.sent, ['The intercept is the output when the input is 0. Say what that means in the situation, with units.'], 'intercept sentence');
          } }] },
      /* ---------------- EP5 ---------------- */
      { num: '5', section: 'Extra practice C — Base plus commission', shared: function (r) {
          var bk = r.chance(0.25), p = bk ? 4 : r.pick([2, 3, 4, 5, 6, 8]), base = bk ? 465 : r.pick(rng(300, 600, 5)), S1 = bk ? 6200 : r.pick(rng(4000, 7000, 100)), S2 = bk ? 9000 : S1 + r.pick(rng(2000, 3600, 400));
          var m = p / 100, E = function (S) { return cl(base + m * S); }, G = bk ? 1000 : null, St = null;
          if (!bk) { for (var g = 0; g < 200; g++) { G = r.pick(rng(800, 1400, 50)); St = cl((G - base) / m); if (Number.isInteger(St) && St % 5 === 0 && St > S2) break; } }
          St = cl((G - base) / m);
          if (!Number.isInteger(St)) { G = 1000; base = 465; p = 4; m = 0.04; S1 = 6200; S2 = 9000; St = 13375; E = function (S) { return cl(465 + 0.04 * S); }; }
          return { p: p, m: m, base: base, S1: S1, S2: S2, E1: E(S1), E2: E(S2), G: G, St: St };
        },
        stem: function (sh) { return 'Jonah sells refurbished e-bikes and is paid a weekly base salary plus a commission on his sales. One week his sales totalled ' + t(money(sh.S1)) + ' and he earned ' + t(money(sh.E1)) + '. The next week his sales totalled ' + t(money(sh.S2)) + ' and he earned ' + t(money(sh.E2)) + '.'; },
        parts: [
          { id: 'e5a', level: 'PRG', outcome: 'RF7', make: function (r, sh) {
            return line('(a) Determine the equation of the model in the form ' + t('E=mS+b') + ', where ' + t('E') + ' is weekly earnings in dollars and ' + t('S') + ' is weekly sales in dollars.', sh.m, sh.base, { X: 'S', Y: 'E',
              wrong: [{ m: sh.p, b: sh.base, code: 'ctx-percent', hint: 'Use the commission rate as a decimal in the equation: ' + t(sh.p + '\\%=' + nf(sh.m)) + '.' }, { m: sh.m, b: sh.E1, code: 'ctx-b-point', hint: t(money(sh.E1)) + ' is one week’s total earnings. ' + t('b') + ' is the pay for sales of ' + t('\\$0') + ': substitute a point to find it.' }] },
              t('m=\\dfrac{' + sh.E2 + '-' + sh.E1 + '}{' + sh.S2 + '-' + sh.S1 + '}=\\dfrac{' + cl(sh.E2 - sh.E1) + '}{' + (sh.S2 - sh.S1) + '}=' + nf(sh.m)) + '<br>' + t(nf(sh.E1) + '=' + nf(sh.m) + '(' + sh.S1 + ')+b=' + nf(sh.m * sh.S1) + '+b\\Rightarrow b=' + nf(sh.base)) + '<br>' + t('E=' + nf(sh.m) + 'S+' + nf(sh.base)),
              ['Slope = change in earnings ÷ change in sales. Then substitute one week to find ' + t('b') + '.'], 'E = mS + b');
          } },
          { id: 'e5b', level: 'EMG', make: function (r, sh) {
            return num('(b) State Jonah’s commission rate as a percent.', sh.p, [{ v: 100 / sh.p, code: 'ctx-flip', hint: 'Upside down — the slope is dollars earned per dollar of sales.' }, { v: sh.p / 100 / 100, code: 'ctx-convert', hint: 'To change a decimal to a percent, multiply by 100.' }],
              t('m=' + nf(sh.m)) + ' dollars of earnings per dollar of sales: Jonah earns ' + t(cash(sh.m)) + ' on every extra ' + t('\\$1') + ' of sales. Commission rate ' + t('=' + nf(sh.m) + '=' + sh.p + '\\%') + '.', ['The slope is the commission rate as a decimal.'], 'commission percent',
              { after: '%', forms: [{ v: sh.m, code: 'ctx-as-percent', hint: 'Right rate — now write it as a percent: multiply the decimal by 100.' }] });
          } },
          { id: 'e5c', level: 'EMG', make: function (r, sh) {
            return num('(c) What would Jonah earn in a week with no sales at all?', sh.base, [
              { v: sh.E1, code: 'ctx-start-point', hint: 'That’s his pay for a week with sales of ' + t(money(sh.S1)) + '. With no sales, ' + t('S=0') + '.' },
              { v: cl(sh.m * sh.S1), code: 'value', hint: 'That’s his commission in the first week. Find ' + t('E') + ' when ' + t('S=0') + '.' },
              { v: 0, code: 'value', hint: 'He still gets his base salary: ' + t('E=' + nf(sh.m) + '(0)+b') + '.' }],
              t('E=' + nf(sh.m) + '(0)+' + nf(sh.base) + '=' + nf(sh.base)) + ': a fixed base salary of ' + t(money(sh.base)) + ' per week, whatever he sells.', ['Substitute ' + t('S=0') + '.'], 'base salary', { money: true });
          } },
          { id: 'e5d', level: 'PRG', outcome: 'RF7', make: function (r, sh) {
            return num('(d) Jonah wants to earn ' + t(money(sh.G)) + ' in a week. What must his sales be?', sh.St, [
              { v: sh.G / sh.m, code: 'ctx-no-b', hint: 'Subtract the base salary first: ' + t(nf(sh.m) + 'S=' + nf(sh.G) + '-' + nf(sh.base)) + '.' },
              { v: (sh.G + sh.base) / sh.m, code: 'ctx-add-b', hint: 'Subtract ' + t(nf(sh.base)) + ' from both sides — don’t add it.' },
              { v: (sh.G - sh.base) * sh.m, code: 'ctx-convert', hint: 'Divide by ' + t(nf(sh.m)) + ', don’t multiply.' }],
              t(nf(sh.G) + '=' + nf(sh.m) + 'S+' + nf(sh.base) + '\\Rightarrow ' + nf(sh.G - sh.base) + '=' + nf(sh.m) + 'S\\Rightarrow S=' + nf(sh.St)) + '. His sales must be ' + t(money(sh.St)) + '.', ['Set ' + t('E=' + nf(sh.G)) + ' and solve for ' + t('S') + '.'], 'sales for target', { money: true });
          } },
          { id: 'e5e', level: 'PRG', outcome: 'RF6', make: function (r, sh) {
            var T = { m: [sh.p, 100], b: sh.base }, key = Ln.tex(T, 'general', null, ['S', 'E']);
            var p = line('(e) Jonah’s model is ' + t('E=' + nf(sh.m) + 'S+' + nf(sh.base)) + '. Rewrite it in general form ' + t('Ax+By+C=0') + ', using ' + t('S') + ' for ' + t('x') + ' and ' + t('E') + ' for ' + t('y') + '. (' + t('A') + ', ' + t('B') + ' and ' + t('C') + ' must be integers and ' + t('A') + ' must be positive.)', sh.m, sh.base, { X: 'S', Y: 'E', form: 'general', target: T, keyTex: key },
              t('E=' + nf(sh.m) + 'S+' + nf(sh.base)) + '. Multiply every term by ' + t(100) + ' to clear the decimal, move every term to one side and divide by any common factor: ' + t(key) + '.',
              ['Clear the decimal first (multiply every term by 100), then move every term to the left side.'], 'general form of E = mS + b');
            p.bad = [p.bad[0] || 'E=' + nf(sh.m) + 'S+' + nf(sh.base + 1)];
            return p;
          } }] },
      /* ---------------- EP6 ---------------- */
      { num: '6', shared: function (r) {
          var bk = r.chance(0.25), pa, pb, Ss, b0, a0;
          for (var g = 0; g < 300; g++) {
            pa = bk ? 4 : r.pick([3, 4, 5]); pb = bk ? 10 : r.pick([8, 10, 12]); Ss = bk ? 4000 : r.pick([3000, 4000, 5000, 6000]); b0 = bk ? 280 : r.pick(rng(200, 400, 20)); a0 = cl(b0 + (pb - pa) / 100 * Ss);
            if (a0 + pa * 80 <= 1180 && b0 + pb * 80 <= 1180 && a0 % 10 === 0) break;
          }
          var A = function (S) { return cl(a0 + pa / 100 * S); }, Bf = function (S) { return cl(b0 + pb / 100 * S); };
          var s1 = r.pick(rng(1000, Ss - 1000, 500).filter(function (x) { return 2 * x !== Ss; })), s2 = r.pick(rng(Ss + 1000, 8000, 500));
          if (bk) { s1 = 2500; s2 = 7000; }
          return { pa: pa, pb: pb, a0: a0, b0: b0, Ss: Ss, Es: A(Ss), A: A, B: Bf, s1: s1, s2: s2 };
        },
        stem: function (sh) { return 'A paddling-gear shop offers its sales staff a choice of two pay plans.<br><b>Plan A:</b> ' + t(money(sh.a0)) + ' per week, plus ' + t(sh.pa + '\\%') + ' commission on weekly sales.<br><b>Plan B:</b> ' + t(money(sh.b0)) + ' per week, plus ' + t(sh.pb + '\\%') + ' commission on weekly sales.'; },
        parts: [
          { id: 'e6a', sub: 'a A', level: 'EMG', outcome: 'RF7', make: function (r, sh) {
            return line('(a) Write an equation for <b>Plan A</b> in the form ' + t('E=mS+b') + '.', sh.pa / 100, sh.a0, { X: 'S', Y: 'E', wrong: [{ m: sh.pa, b: sh.a0, code: 'ctx-percent', hint: 'Write the commission as a decimal: ' + t(sh.pa + '\\%=' + nf(sh.pa / 100)) + '.' }, { m: sh.a0, b: sh.pa / 100, code: 'value', hint: 'The base pay is the intercept ' + t('b') + '; the commission rate is the slope ' + t('m') + '.' }] },
              'Slope = commission rate ' + t(nf(sh.pa / 100)) + ', intercept = base pay ' + t(nf(sh.a0)) + ': ' + t('E=' + nf(sh.pa / 100) + 'S+' + nf(sh.a0)), ['The commission rate (as a decimal) is the slope; the base pay is the intercept.'], 'Plan A equation');
          } },
          { id: 'e6a2', sub: 'a B', level: 'EMG', outcome: 'RF7', make: function (r, sh) {
            return line('(a) Write an equation for <b>Plan B</b> in the form ' + t('E=mS+b') + '.', sh.pb / 100, sh.b0, { X: 'S', Y: 'E', wrong: [{ m: sh.pb, b: sh.b0, code: 'ctx-percent', hint: 'Write the commission as a decimal: ' + t(sh.pb + '\\%=' + nf(sh.pb / 100)) + '.' }] },
              t('E=' + nf(sh.pb / 100) + 'S+' + nf(sh.b0)), ['The commission rate (as a decimal) is the slope; the base pay is the intercept.'], 'Plan B equation');
          } },
          { id: 'e6a3', sub: 'a graph', level: 'PRG', outcome: 'RF4', make: function (r, sh) {
            var I = pad({ x: [0, 8600], y: [0, 1300], gx: 1000, gy: 100, sx: 1000, sy: 20, lx: 2000, ly: 200, xn: 'S', yn: 'E', xt: 'Sales, S ($)', yt: 'Earnings, E ($)' });
            var sn = function (v) { return Math.round(v / 20) * 20; };
            var key = { pts: [], pieces: [{ v: [[0, sn(sh.a0)], [8000, sn(sh.A(8000))]], s: 'closed', e: 'closed' }, { v: [[0, sn(sh.b0)], [8000, sn(sh.B(8000))]], s: 'closed', e: 'closed' }], join: 'none' };
            var p = K.P.graph('(a) Graph both lines on the grid. <i>(Earnings snap to every ' + t('\\$20') + '; draw each line from the vertical axis across the grid.)</i>', I,
              nearLines([{ f: sh.A, slope: sh.pa / 100, name: 'Plan A' }, { f: sh.B, slope: sh.pb / 100, name: 'Plan B' }], { tx: 1e-6, ty: 10 + 1e-6, xHalf: 4000 }), key,
              'Plan A: from ' + t(ptT([0, sh.a0])) + ' to ' + t(ptT([8000, sh.A(8000)])) + '. Plan B: from ' + t(ptT([0, sh.b0])) + ' to ' + t(ptT([8000, sh.B(8000)])) + '. They cross at ' + t(ptT([sh.Ss, sh.Es])) + '.',
              ['Each line starts at its base pay on the vertical axis. Find a second point by putting ' + t('S=8000') + ' into each equation.'], 'graph two pay plans');
            p.bad = [seg([0, sn(sh.a0)], [8000, sn(sh.A(8000))]), { pts: [], pieces: [{ v: [[0, sn(sh.a0)], [8000, sn(sh.B(8000))]], s: 'closed', e: 'closed' }, { v: [[0, sn(sh.b0)], [8000, sn(sh.A(8000))]], s: 'closed', e: 'closed' }], join: 'none' }];
            return p;
          } },
          { id: 'e6b', level: 'EMG', make: function (r, sh) {
            var ma = t(cash(sh.pa / 100)), mb = t(cash(sh.pb / 100));
            return mc(r, '(b) Which statement interprets the slope and intercept of each plan correctly?', [
              { html: 'Plan A earnings rise ' + ma + ' for every extra dollar of sales and are ' + t(money(sh.a0)) + ' in a week with no sales; Plan B earnings rise ' + mb + ' per dollar of sales and are ' + t(money(sh.b0)) + ' with no sales.', right: true },
              { html: 'Plan A earnings rise ' + t(money(sh.pa)) + ' for every extra dollar of sales; Plan B earnings rise ' + t(money(sh.pb)) + ' per dollar of sales.', why: 'The commission is a percent: ' + t(sh.pa + '\\%') + ' of a dollar is ' + ma + ', not ' + t(money(sh.pa)) + '.' },
              { html: 'Plan A pays ' + ma + ' per week plus ' + t(money(sh.a0)) + ' per dollar of sales; Plan B pays ' + mb + ' per week plus ' + t(money(sh.b0)) + ' per dollar of sales.', why: 'Slope and intercept are swapped: the base pay is the intercept; the commission rate is the slope.' },
              { html: 'Plan A earnings rise ' + ma + ' for every extra dollar of sales and are ' + t(money(sh.a0)) + ' in total for the year; Plan B similarly with ' + t(money(sh.b0)) + '.', why: 'The intercept is the pay for one <b>week</b> with no sales.' }],
              '<b>Plan A:</b> slope ' + t(nf(sh.pa / 100)) + ' — earnings rise ' + ma + ' per extra dollar of sales; intercept ' + t(nf(sh.a0)) + ' — ' + t(money(sh.a0)) + ' in a week with no sales.<br><b>Plan B:</b> slope ' + t(nf(sh.pb / 100)) + ', intercept ' + t(nf(sh.b0)) + '.', ['Slope: dollars earned per dollar of sales. Intercept: pay with no sales.'], 'interpret two plans');
          } },
          { id: 'e6c', level: 'PRG', outcome: 'RF7', make: function (r, sh) {
            var dS = function (v) { if (same(v, (sh.a0 - sh.b0) / ((sh.pa + sh.pb) / 100))) return { code: 'ctx-rate-sign', hint: 'When you collect the ' + t('S') + '-terms, subtract the rates: ' + t(nf(sh.pb / 100) + 'S-' + nf(sh.pa / 100) + 'S') + '.' }; if (same(v, (sh.a0 + sh.b0) / ((sh.pb - sh.pa) / 100))) return { code: 'value', hint: 'Subtract the base pays: ' + t(nf(sh.a0) + '-' + nf(sh.b0)) + '.' }; return null; };
            var p = B.fields('(c) Determine algebraically the level of weekly sales at which the two plans pay exactly the same, and the amount paid there.', [{ label: 'Sales', name: 'Sales', before: t('\\$') }, { label: 'Pay', name: 'Pay', before: t('\\$') }],
              [K.number(sh.Ss, dS), K.number(sh.Es, function (v) { if (same(v, sh.Ss)) return { code: 'value', hint: 'That’s the sales level. Put it into either equation to find the pay.' }; return null; })], [String(sh.Ss), String(sh.Es)], t(money(sh.Ss)) + ' of sales; both pay ' + t(money(sh.Es)),
              t(nf(sh.pa / 100) + 'S+' + nf(sh.a0) + '=' + nf(sh.pb / 100) + 'S+' + nf(sh.b0) + '\\Rightarrow ' + nf(sh.a0 - sh.b0) + '=' + nf((sh.pb - sh.pa) / 100) + 'S\\Rightarrow S=' + nf(sh.Ss)) + '<br>' + t('E=' + nf(sh.pa / 100) + '(' + sh.Ss + ')+' + nf(sh.a0) + '=' + nf(sh.Es)),
              ['Set the two expressions for ' + t('E') + ' equal and solve for ' + t('S') + '.'], 'equal pay');
            p.bad = [[String(sh.Es), String(sh.Ss)]];
            return p;
          } },
          { id: 'e6d', sub: 'd low', level: 'EMG', outcome: 'RF7', make: function (r, sh) {
            var a = sh.A(sh.s1), b = sh.B(sh.s1), d = cl(a - b), wd = cl((sh.pb - sh.pa) / 100 * sh.s1);
            return mc(r, '(d) Which plan pays more on sales of ' + t(money(sh.s1)) + ', and by how much?', [
              { html: 'Plan A, by ' + t(money(d)), right: true },
              { html: 'Plan B, by ' + t(money(d)), why: 'Work out both: A pays ' + t(money(a)) + ', B pays ' + t(money(b)) + '.' },
              { html: 'Plan B, by ' + t(money(wd)), why: 'That compares only the commissions. Include each plan’s base pay too.' },
              { html: 'They pay the same.', why: 'They pay the same only at ' + t(money(sh.Ss)) + ' of sales.' }],
              'A: ' + t(nf(sh.pa / 100) + '(' + sh.s1 + ')+' + nf(sh.a0) + '=' + nf(a)) + '; B: ' + t(nf(sh.pb / 100) + '(' + sh.s1 + ')+' + nf(sh.b0) + '=' + nf(b)) + '. <b>Plan A, by ' + t(money(d)) + '.</b>', ['Substitute the sales into both equations.'], 'which plan low');
          } },
          { id: 'e6d2', sub: 'd high', level: 'EMG', outcome: 'RF7', make: function (r, sh) {
            var a = sh.A(sh.s2), b = sh.B(sh.s2), d = cl(b - a), wd = cl((sh.pb - sh.pa) / 100 * sh.s2);
            return mc(r, '(d) Which plan pays more on sales of ' + t(money(sh.s2)) + ', and by how much?', [
              { html: 'Plan B, by ' + t(money(d)), right: true },
              { html: 'Plan A, by ' + t(money(d)), why: 'Work out both: A pays ' + t(money(a)) + ', B pays ' + t(money(b)) + '.' },
              { html: 'Plan B, by ' + t(money(wd)), why: 'That compares only the commissions. Include each plan’s base pay too.' },
              { html: 'Plan A, because its base pay is higher.', why: 'A higher base only wins below ' + t(money(sh.Ss)) + '. Check both equations.' }],
              'A: ' + t(nf(a)) + '; B: ' + t(nf(b)) + '. <b>Plan B, by ' + t(money(d)) + '.</b>', ['Substitute the sales into both equations.'], 'which plan high');
          } },
          { id: 'e6e', level: 'EMG', make: function (r, sh) {
            var S = t(money(sh.Ss));
            return mc(r, '(e) Complete: Plan A is better whenever weekly sales are ___, and Plan B is better whenever they are ___.', [
              { html: 'below ' + S + '; above ' + S, right: true },
              { html: 'above ' + S + '; below ' + S, why: 'Below the crossing point the bigger base pay (Plan A) is ahead; above it, the bigger commission (Plan B) has caught up.' },
              { html: 'below ' + t(money(sh.Es)) + '; above ' + t(money(sh.Es)), why: t(money(sh.Es)) + ' is the <b>pay</b> where they meet. The question is about the level of <b>sales</b>.' },
              { html: 'never; always — Plan B has the higher commission.', why: 'Plan A wins at low sales (check part (d)).' }],
              'The lines cross at ' + S + '. Below that, Plan A’s larger base keeps it ahead; above it, Plan B’s larger commission has overtaken it.', ['Use the crossing point from (c) and your answers to (d).'], 'better plan sentence');
          } }] },
      /* ---------------- EP7 ---------------- */
      { num: '7', shared: function (r) {
          var pa, a0, Se, c0, rp;
          for (var g = 0; g < 400; g++) {
            pa = r.pick([3, 4, 5]); a0 = r.pick(rng(400, 600, 20)); Se = r.pick([4000, 5000, 6000]); c0 = r.pick(rng(200, a0 - 60, 20));
            rp = cl((a0 + pa / 100 * Se - c0) / Se * 100);
            if (Math.abs(rp * 10 - Math.round(rp * 10)) < 1e-9 && rp > pa + 0.5 && rp < 15) break;
          }
          if (r.chance(0.25)) { pa = 4; a0 = 520; Se = 5000; c0 = 340; rp = 7.6; }
          var A = function (S) { return cl(a0 + pa / 100 * S); }, C = function (S) { return cl(c0 + rp / 100 * S); };
          return { pa: pa, a0: a0, Se: Se, c0: c0, rp: rp, A: A, C: C, s2: 8000 };
        },
        stem: function (sh) { return 'A shop pays its staff by <b>Plan A:</b> ' + t(money(sh.a0)) + ' per week plus ' + t(sh.pa + '\\%') + ' commission on weekly sales. It adds a third option, <b>Plan C:</b> ' + t(money(sh.c0)) + ' per week plus a commission rate of ' + t('r') + ', where ' + t('r') + ' is chosen so that on weekly sales of ' + t(money(sh.Se)) + ' Plan C pays exactly what Plan A pays.'; },
        parts: [
          { id: 'e7a', level: 'PRG', outcome: 'RF7', make: function (r, sh) {
            var EA = sh.A(sh.Se);
            return num('(a) Determine ' + t('r') + ', and state it as a percent.', sh.rp, [
              { v: EA / sh.Se * 100, code: 'ctx-no-b', hint: 'Plan C also pays its base: ' + t(nf(sh.c0) + '+' + sh.Se + 'r=' + nf(EA)) + '.' },
              { v: (EA + sh.c0) / sh.Se * 100, code: 'ctx-add-b', hint: 'Subtract Plan C’s base: ' + t(sh.Se + 'r=' + nf(EA) + '-' + nf(sh.c0)) + '.' }],
              'Plan A on ' + t(money(sh.Se)) + ': ' + t(nf(sh.pa / 100) + '(' + sh.Se + ')+' + nf(sh.a0) + '=' + nf(EA)) + '.<br>' + t(nf(sh.c0) + '+' + sh.Se + 'r=' + nf(EA) + '\\Rightarrow ' + sh.Se + 'r=' + nf(EA - sh.c0) + '\\Rightarrow r=' + nf(sh.rp / 100) + '=' + nf(sh.rp) + '\\%'),
              ['Find what Plan A pays on ' + t(money(sh.Se)) + ', then make Plan C pay the same.'], 'Plan C rate', { after: '%', forms: [{ v: sh.rp / 100, code: 'ctx-as-percent', hint: 'Right — now write it as a percent (multiply by 100).' }] });
          } },
          { id: 'e7b', level: 'PRG', outcome: 'RF7', make: function (r, sh) {
            var a = sh.A(sh.s2), c = sh.C(sh.s2), d = cl(c - a);
            return mc(r, '(b) On sales of ' + t(money(sh.s2)) + ', which of Plan A and Plan C pays more, and by how much?', [
              { html: 'Plan C, by ' + t(money(d)), right: true },
              { html: 'Plan A, by ' + t(money(d)), why: 'Work out both: A pays ' + t(money(a)) + ', C pays ' + t(money(c)) + '.' },
              { html: 'Plan C, by ' + t(money(cl(d + sh.a0 - sh.c0))), why: 'That compares only the commissions. Include the base pays too.' },
              { html: 'They pay the same.', why: 'They pay the same only at ' + t(money(sh.Se)) + '.' }],
              'A: ' + t(nf(sh.pa / 100) + '(' + sh.s2 + ')+' + nf(sh.a0) + '=' + nf(a)) + '; C: ' + t(nf(sh.rp / 100) + '(' + sh.s2 + ')+' + nf(sh.c0) + '=' + nf(c)) + '. <b>Plan C pays more, by ' + t(money(d)) + '.</b>', ['Substitute the sales into both plans.'], 'A vs C');
          } },
          { id: 'e7c', level: 'PRG', make: function (r, sh) {
            return mc(r, '(c) Plan C has a smaller base than Plan A but a larger commission rate. Why does that guarantee which plan pays more on sales of ' + t(money(sh.s2)) + ', without any further arithmetic?', [
              { html: 'The lines meet at ' + t(money(sh.Se)) + '. Past that, each extra dollar of sales adds ' + t(nf(sh.rp / 100)) + ' to Plan C but only ' + t(nf(sh.pa / 100)) + ' to Plan A, so C keeps gaining and must be ahead at ' + t(money(sh.s2)) + '.', right: true },
              { html: 'A smaller base always means a plan pays more.', why: 'Below ' + t(money(sh.Se)) + ' the smaller base makes Plan C pay <b>less</b>.' },
              { html: 'Plan C pays more at every level of sales.', why: 'Not at low sales: at ' + t('\\$0') + ' Plan A pays ' + t(money(sh.a0)) + ' and Plan C only ' + t(money(sh.c0)) + '.' },
              { html: 'Because ' + t(sh.s2) + ' is a bigger number than ' + t(sh.Se) + '.', why: 'Being past the meeting point matters only because Plan C’s line is steeper (bigger slope).' }],
              'The two lines cross at ' + t(money(sh.Se)) + '. Beyond that, the steeper line (larger commission rate, Plan C) is above the other one.', ['Think about the two slopes and where the lines cross.'], 'why C wins');
          } }] },
      /* ---------------- EP8 ---------------- */
      { num: '8', section: 'Extra practice D — Negative rates, and what “steeper” means', shared: function (r) {
          var a = r.pick([1200, 1250, 1450, 1500, 1600]), N = r.pick([7, 8, 9, 10]), gr = r.pick([1.2, 1.5, 1.8, 2.4]), T0 = r.int(18, 25), rr = r.pick([0.035, 0.045, 0.06, 0.075]), L0 = r.pick([9.8, 11.4, 12.6, 14.2]);
          return { a: a, N: N, V0: a * N, gr: gr, T0: T0, rr: rr, L0: L0 };
        },
        stem: function (sh) { return 'Each model has a negative rate of change.<br>(a) ' + t('V=-' + nf(sh.a) + 'a+' + nf(sh.V0)) + ', where ' + t('V') + ' is the resale value of a snowmobile in dollars and ' + t('a') + ' is its age in years.<br>(b) ' + t('T=' + nf(-sh.gr) + 'h+' + sh.T0) + ', where ' + t('T') + ' is the temperature in a greenhouse in °C and ' + t('h') + ' is the number of hours since sunset.<br>(c) ' + t('L=' + nf(-sh.rr) + 'd+' + nf(sh.L0)) + ', where ' + t('L') + ' is the level of a reservoir in metres and ' + t('d') + ' is the number of days into a drought.'; },
        parts: [
          { id: 'e8a', level: 'EMG', make: function (r, sh) {
            var a = t(money(sh.a));
            return mc(r, '(a) Interpret the slope of model (a), using the right verb for the situation.', [
              { html: 'The snowmobile is <b>depreciating</b> at ' + a + ' per year of age.', right: true },
              { html: 'The snowmobile is depreciating at ' + t('-' + money(sh.a)) + ' per year of age.', why: '“Depreciating” already says the value goes down. Depreciating by a negative amount would mean gaining value.' },
              { html: 'The snowmobile is gaining value at ' + a + ' per year of age.', why: 'The slope is negative: its value is going down.' },
              { html: 'The snowmobile is depreciating at ' + t(money(sh.V0)) + ' per year of age.', why: t(money(sh.V0)) + ' is the intercept — its value when new. The rate is the slope.' }],
              'Slope ' + t('-' + nf(sh.a)) + ' $/year: the snowmobile is <b>depreciating at ' + t(money(sh.a)) + ' per year</b> of age.', ['Slope units: dollars per year. A negative slope means the value is going down.'], 'snowmobile slope');
          } },
          { id: 'e8b', level: 'EMG', make: function (r, sh) {
            var g = t(nf(sh.gr));
            return mc(r, '(b) Interpret the slope of model (b).', [
              { html: 'The greenhouse is <b>cooling</b> at ' + g + ' °C per hour after sunset.', right: true },
              { html: 'The greenhouse is warming at ' + g + ' °C per hour after sunset.', why: 'The slope is negative: the temperature is falling.' },
              { html: 'The greenhouse is cooling at ' + g + ' hours per °C.', why: 'Units upside down: °C (vertical) per hour (horizontal).' },
              { html: 'The greenhouse is cooling at ' + t(sh.T0) + ' °C per hour after sunset.', why: t(sh.T0) + ' °C is the temperature at sunset (the intercept).' }],
              'Slope ' + t(nf(-sh.gr)) + ' °C/h: the greenhouse is <b>cooling at ' + nf(sh.gr) + ' °C per hour</b>.', ['Slope units: °C per hour.'], 'greenhouse slope');
          } },
          { id: 'e8c', level: 'EMG', make: function (r, sh) {
            var g = t(nf(sh.rr));
            return mc(r, '(c) Interpret the slope of model (c).', [
              { html: 'The reservoir level is <b>falling</b> at ' + g + ' metres per day of the drought.', right: true },
              { html: 'The reservoir level is falling at ' + t(nf(-sh.rr)) + ' metres per day.', why: '“Falling” already carries the minus sign — give the size of the rate.' },
              { html: 'The reservoir level is falling at ' + g + ' days per metre.', why: 'Units upside down: metres per day.' },
              { html: 'The reservoir level is rising at ' + g + ' metres per day.', why: 'The slope is negative: the level is going down.' }],
              'Slope ' + t(nf(-sh.rr)) + ' m/day: the reservoir level is <b>falling at ' + nf(sh.rr) + ' metres per day</b>.', ['Slope units: metres per day.'], 'reservoir slope');
          } },
          { id: 'e8d', level: 'EMG', outcome: 'RF7', make: function (r, sh) {
            return num('(d) At what age does model (a) predict the snowmobile is worth ' + t('\\$0') + '?', sh.N, [{ v: -sh.N, code: 'ctx-rate-sign', hint: 'An age can’t be negative — check the signs when you solve ' + t('0=-' + nf(sh.a) + 'a+' + nf(sh.V0)) + '.' }, { v: sh.a / sh.V0, code: 'ctx-flip', hint: 'Divide ' + t(nf(sh.V0)) + ' by ' + t(nf(sh.a)) + ', not the other way.' }],
              t('0=-' + nf(sh.a) + 'a+' + nf(sh.V0) + '\\Rightarrow ' + nf(sh.a) + 'a=' + nf(sh.V0) + '\\Rightarrow a=' + sh.N) + ' years', ['Set ' + t('V=0') + ' and solve for ' + t('a') + '.'], 'snowmobile worthless', { after: 'years' });
          } },
          { id: 'e8d2', sub: 'd ii', level: 'EMG', make: function (r, sh) {
            return mc(r, '(d) Model (a) predicts the snowmobile is worth ' + t('\\$0') + ' at an age of ' + t(sh.N) + ' years. Is the model believable that far out?', [
              { html: 'No — a ' + sh.N + '-year-old snowmobile still has resale and parts value. Real depreciation slows with age, so the straight line shouldn’t be extended that far.', right: true },
              { html: 'Yes — a straight line keeps going, so the value really does reach ' + t('\\$0') + '.', why: 'A model is only trusted where it matches the situation. Old machines keep some value.' },
              { html: 'Yes — every vehicle is worth nothing after ' + sh.N + ' years.', why: 'Used vehicles that age are still bought and sold.' },
              { html: 'No — because the slope is negative, the model is always wrong.', why: 'A negative slope is fine: the value does go down. The problem is extending the line too far.' }],
              'Not believable: real depreciation slows as a vehicle ages, and an old snowmobile still has some value. The straight line shouldn’t be extended that far.', ['Does a real snowmobile lose the same amount of value every single year, forever?'], 'believable?');
          } },
          { id: 'e8e', level: 'EMG', make: function (r, sh) {
            return num('(e) Restate the rate in (c) in <b>centimetres per day</b>.', sh.rr * 100, [{ v: sh.rr / 100, code: 'ctx-convert', hint: 'A centimetre is smaller than a metre, so there are <b>more</b> of them: multiply by 100.' }, { v: sh.rr * 1000, code: 'ctx-convert', hint: '1 m = 100 cm (1000 is millimetres).' }, { v: -sh.rr * 100, code: 'ctx-rate-sign', hint: 'Give the rate the level falls at (a positive number).' }],
              t(nf(sh.rr) + '\\text{ m/day}\\times 100\\text{ cm/m}=' + nf(sh.rr * 100)) + ' cm/day', ['1 m = 100 cm.'], 'm/day to cm/day', { after: 'cm per day' });
          } },
          { id: 'e8e2', sub: 'e ii', level: 'EMG', make: function (r, sh) {
            return mc(r, '(e) Model (c)’s drop of ' + t(nf(sh.rr)) + ' m per day can be restated as ' + t(nf(sh.rr * 100)) + ' cm per day. Does the reservoir fall faster in this new wording?', [
              { html: 'No — ' + t(nf(sh.rr * 100)) + ' cm and ' + t(nf(sh.rr)) + ' m are the same distance, so it drops the same amount each day. Only the unit changed.', right: true },
              { html: 'Yes — ' + t(nf(sh.rr * 100)) + ' is a bigger number than ' + t(nf(sh.rr)) + '.', why: 'The number got bigger because a centimetre is smaller. The physical rate is the same.' },
              { html: 'Yes — 100 times faster.', why: 'Same amount of water level each day, written in a smaller unit.' },
              { html: 'No — it falls slower in centimetres.', why: 'It’s exactly the same rate — just a different unit.' }],
              'No. ' + t(nf(sh.rr * 100)) + ' cm and ' + t(nf(sh.rr)) + ' m are the same distance. Changing the unit changes the number, not the rate.', ['Is ' + t(nf(sh.rr * 100)) + ' cm more water level than ' + t(nf(sh.rr)) + ' m?'], 'faster in cm?');
          } },
          { id: 'e8f', level: 'PRG', make: function (r, sh) {
            return mc(r, '(f) Can you tell which of the three situations would be graphed with the steepest line?', [
              { html: 'No — the three slopes have different units ($/year, °C/h, m/day), so the numbers can’t be compared, and how steep each line looks depends on the scales chosen for its axes.', right: true },
              { html: 'Yes — the snowmobile, because ' + t('|-' + nf(sh.a) + '|') + ' is the largest.', why: 'You can only compare slopes this way when they have the same units and the same axis scales.' },
              { html: 'Yes — the reservoir, because ' + t(nf(-sh.rr)) + ' is closest to zero.', why: 'Closest to zero would be the <b>least</b> steep — and anyway, slopes with different units can’t be compared.' },
              { html: 'Yes — the snowmobile, because ' + t('-' + nf(sh.a)) + ' is the smallest number.', why: 'Steepness isn’t about which number is smallest, and these slopes have different units.' }],
              '<b>No.</b> The slopes carry different units, so the numbers can’t be compared. How steep each line looks also depends on the scales chosen for its axes.', ['Can you compare dollars per year with metres per day?'], 'steepest?');
          } }] },
      /* ---------------- EP9 ---------------- */
      { num: '9', shared: function (r) {
          for (var g = 0; g < 200; g++) {
            var k1 = r.pick([3, 4, 5, 6]), k2 = r.pick([1, 2, 3]), q = r.pick([2, 3, 4, 5]), d = r.pick([1.5, 2.5, 3.5, 4.5]);
            var ab = [k1, k2, 1 / q, d]; if (ab.some(function (x, i) { return ab.some(function (y, j) { return i !== j && same(x, y); }); }) || d > k1 + 1) continue;
            if (r.chance(0.2)) { k1 = 4; k2 = 2; q = 2; d = 3.5; }
            return { s: [{ id: 'm1', v: -k1, tex: '-' + k1 }, { id: 'm2', v: k2, tex: String(k2) }, { id: 'm3', v: -1 / q, tex: '-\\frac{1}{' + q + '}' }, { id: 'm4', v: d, tex: nf(d) }], X: r.pick([3, 4, 5, 6]), Y: null };
          }
          return { s: [{ id: 'm1', v: -4, tex: '-4' }, { id: 'm2', v: 2, tex: '2' }, { id: 'm3', v: -0.5, tex: '-\\frac{1}{2}' }, { id: 'm4', v: 3.5, tex: '3.5' }], X: 4 };
        },
        stem: function (sh) { return 'Four lines have slopes ' + sh.s.map(function (x, i) { return t('m_' + (i + 1) + '=' + x.tex); }).join(', ') + '.'; },
        parts: [
          { id: 'e9a', level: 'EMG', make: function (r, sh) {
            var items = sh.s.slice().sort(function (a, b) { return Math.abs(a.v) - Math.abs(b.v); });
            return B.order(r, '(a) Put the four slopes in order from <b>least steep to steepest</b>.', items, { first: 'least steep', last: 'steepest', why: function (x, y) { return 'Steepness compares the <b>size</b> of the slope, ignoring its sign: compare ' + t('|m|') + '.'; } },
              'Compare ' + t('|m|') + ': ' + items.map(function (x) { return t('|' + x.tex + '|=' + nf(Math.abs(x.v))); }).join(', ') + '. So: ' + items.map(function (x) { return t(x.tex); }).join(', ') + '.', ['Steepness ignores the sign: compare the absolute values.'], 'order by steepness');
          } },
          { id: 'e9b', level: 'EMG', make: function (r, sh) {
            var items = sh.s.slice().sort(function (a, b) { return a.v - b.v; });
            return B.order(r, '(b) Put the four slopes in order from <b>smallest value to largest value</b>.', items, { first: 'smallest', last: 'largest', why: function () { return 'Order them on a number line: negatives are smaller than positives, and ' + t('-4<-\\frac{1}{2}') + '.'; } },
              'On the number line: ' + items.map(function (x) { return t(x.tex); }).join(', ') + '.', ['Think of a number line: the further left, the smaller.'], 'order by value');
          } },
          { id: 'e9c', level: 'EMG', make: function (r, sh) {
            return mc(r, '(c) The two lists are not the same. What does “steepness” actually compare?', [
              { html: 'The absolute value of the slope — how much the quantity changes per unit, ignoring direction.', right: true },
              { html: 'The value of the slope, including its sign.', why: 'Then a slope of ' + t('-4') + ' would be “less steep” than ' + t('2') + ', but its line is steeper.' },
              { html: 'The ' + t('y') + '-intercept of each line.', why: 'Steepness is about the slope, not where the line crosses the axis.' },
              { html: 'Whether the line goes up or down.', why: 'That’s the direction (the sign). Steepness is the size, ' + t('|m|') + '.' }],
              'Steepness compares ' + t('|m|') + ', the size of the rate; the value of the slope also records the direction (the sign).', ['Which list did you get by ignoring the signs?'], 'what steepness compares');
          } },
          { id: 'e9d', level: 'PRG', make: function (r, sh) {
            var a = r.pick([3, 4, 5, 6]), b = r.pick([1, 2].filter(function (x) { return x < a; }));
            return mc(r, '(d) Tank X drains at ' + t(a) + ' litres per minute. Tank Y fills at ' + t(b) + ' litres per minute. On the same axes (volume against time), which graph is steeper, and which has the larger slope?', [
              { html: 'X’s graph is steeper (' + t('|-' + a + '|>|' + b + '|') + '), but Y’s graph has the larger slope (' + t(b + '>-' + a) + ').', right: true },
              { html: 'Y’s graph is steeper and has the larger slope.', why: 'X changes faster, ' + t(a) + ' L/min against ' + t(b) + ' L/min, so X is steeper.' },
              { html: 'X’s graph is steeper and has the larger slope.', why: 'X’s slope is ' + t('-' + a) + ', which is less than ' + t(b) + '.' },
              { html: 'Y’s graph is steeper, but X’s has the larger slope.', why: 'Both halves are reversed: compare ' + t('|m|') + ' for steepness and the values for size.' }],
              'X: ' + t('m=-' + a) + ' L/min; Y: ' + t('m=' + b) + ' L/min. X is steeper since ' + t('|-' + a + '|>|' + b + '|') + '; Y has the larger slope since ' + t(b + '>-' + a) + '.', ['Steepness: compare absolute values. Larger slope: compare the values.'], 'steeper vs larger');
          } },
          { id: 'e9e', level: 'EMG', make: function (r, sh) {
            return mc(r, '(e) Complete: “Making a rate of change steeper makes its slope a ___ number when the rate is positive, but a ___ number when the rate is negative.”', [
              { html: 'larger … smaller', right: true }, { html: 'larger … larger', why: 'Try it: steepen ' + t('-2') + ' to ' + t('-3') + '. Is ' + t('-3') + ' larger or smaller than ' + t('-2') + '?' },
              { html: 'smaller … larger', why: 'Try it: steepen ' + t('2') + ' to ' + t('3') + ' — the number gets larger.' }, { html: 'smaller … smaller', why: 'Try it: steepen ' + t('2') + ' to ' + t('3') + '.' }],
              'Steepening increases ' + t('|m|') + '. Positive: ' + t('2\\to 3') + ', a <b>larger</b> number. Negative: ' + t('-2\\to -3') + ', a <b>smaller</b> (more negative) number.', ['Try an example for each: 2 → 3 and −2 → −3.'], 'steeper sentence');
          } }] },
      /* ---------------- EP10 ---------------- */
      { num: '10', section: 'Extra practice E — Average rate of change against a constant rate', shared: function (r) {
          var c = r.chance(0.3) ? [0.5, 1] : r.pick([[0.5, 1], [0.25, 2], [0.25, 3], [0.5, 0], [0.5, 2], [0.25, 1]]), k = c[0], a = c[1], c0 = 8 * a + 64 * k;
          var d = function (x) { return cl(c0 - a * x - k * x * x); };
          return { k: k, a: a, c: c0, d: d, P: [0, 2, 4, 6, 8].map(function (x) { return [x, d(x)]; }) };
        },
        stem: function (sh) {
          var L = ['A', 'B', 'C', 'D', 'E'];
          return 'The curve shows the depth of snow on a flat roof through a spring thaw, where ' + t('t') + ' is the number of hours after 8 a.m. and ' + t('d') + ' is the depth in centimetres. The five marked points lie exactly on the curve.' +
            fig({ x: [0, 9.6], y: [0, sh.c + 6], gx: 1, gy: 5, lx: 1, ly: 10, xn: 't', yn: 'd', xt: 'Time, t (h)', yt: 'Depth, d (cm)', fns: [{ f: sh.d, from: 0, to: 8 }], points: sh.P.map(function (p, i) { return { x: p[0], y: p[1], label: L[i] + '(' + p[0] + ', ' + p[1] + ')' }; }), aria: 'snow depth curve' });
        },
        parts: [
          { id: 'e10a', level: 'BEG', make: function (r, sh) {
            var P = sh.P, v = (P[1][1] - P[0][1]) / 2;
            return num('(a) Calculate the average rate of change from ' + t('A') + ' to ' + t('B') + '.', v, [{ v: -v, code: 'ctx-rate-sign', hint: 'The snow is getting shallower, so the rate is negative.' }, { v: P[1][1] - P[0][1], code: 'ctx-total', hint: 'Divide the change in depth by the change in time (2 h).' }, { v: 1 / v, code: 'ctx-flip', hint: 'Upside down: cm per hour.' }],
              t('\\dfrac{' + P[1][1] + '-' + P[0][1] + '}{2-0}=' + nf(v)) + ' cm/h: from 8 to 10 a.m. the depth decreased at an average of ' + t(nf(-v)) + ' cm per hour.', ['Slope of the segment from A to B.'], 'avg rate AB', { after: 'cm/h' });
          } },
          { id: 'e10b', level: 'EMG', make: function (r, sh) {
            var P = sh.P, v1 = (P[3][1] - P[2][1]) / 2, v2 = (P[4][1] - P[3][1]) / 2;
            var p = B.fields('(b) Calculate the average rate of change from ' + t('C') + ' to ' + t('D') + ', and from ' + t('D') + ' to ' + t('E') + '.', [{ label: 'C to D', name: 'C to D', after: 'cm/h' }, { label: 'D to E', name: 'D to E', after: 'cm/h' }],
              [K.number(v1, dg([{ v: -v1, code: 'ctx-rate-sign', hint: 'The depth is decreasing, so the rate is negative.' }, { v: 2 * v1, code: 'ctx-total', hint: 'Divide by the 2 hours.' }])), K.number(v2, dg([{ v: -v2, code: 'ctx-rate-sign', hint: 'The depth is decreasing, so the rate is negative.' }, { v: 2 * v2, code: 'ctx-total', hint: 'Divide by the 2 hours.' }]))],
              [String(v1), String(v2)], t(nf(v1)) + ' cm/h and ' + t(nf(v2)) + ' cm/h',
              'C to D: ' + t('\\tfrac{' + P[3][1] + '-' + P[2][1] + '}{6-4}=' + nf(v1)) + ' cm/h. D to E: ' + t('\\tfrac{' + P[4][1] + '-' + P[3][1] + '}{8-6}=' + nf(v2)) + ' cm/h.', ['Each is the slope of the segment joining the two points.'], 'avg rates CD, DE');
            p.bad = [[String(-v1), String(-v2)]];
            return p;
          } },
          { id: 'e10c', level: 'EMG', make: function (r, sh) {
            var v = -sh.c / 8;
            return num('(c) Calculate the average rate of change for the whole thaw, ' + t('A') + ' to ' + t('E') + '.', v, [{ v: -v, code: 'ctx-rate-sign', hint: 'The depth goes down, so the rate is negative.' }, { v: -sh.c, code: 'ctx-total', hint: 'That’s the total change. Divide by the 8 hours.' }],
              t('\\dfrac{0-' + sh.c + '}{8-0}=' + nf(v)) + ' cm/h', ['Use the first and last points.'], 'avg rate AE', { after: 'cm/h' });
          } },
          { id: 'e10c2', sub: 'c ii', level: 'EMG', make: function (r, sh) {
            var a = t(nf(sh.c / 8));
            return mc(r, '(c) Interpret the average rate for the whole thaw in a sentence with units.', [
              { html: 'From 8 a.m. to 4 p.m. the snow depth decreased at an <b>average</b> of ' + a + ' centimetres per hour.', right: true },
              { html: 'The snow melted at exactly ' + a + ' cm every hour of the thaw.', why: 'It’s an average: the graph is a curve, so the actual rate changed during the day.' },
              { html: 'The snow depth decreased by ' + a + ' cm altogether.', why: 'That’s the rate per hour. Altogether it fell ' + t(sh.c) + ' cm.' },
              { html: 'The snow depth decreased at an average of ' + a + ' hours per centimetre.', why: 'Units upside down: cm per hour.' }],
              'Over the whole thaw (8 a.m. to 4 p.m.) the depth decreased at an <b>average</b> of ' + a + ' cm per hour.', ['An average rate over an interval — say which interval, and say “average”.'], 'interpret average rate');
          } },
          { id: 'e10d', level: 'PRG', outcome: 'RF4', make: function (r, sh) {
            var P = sh.P, rt = function (i, j) { return t(nf((P[j][1] - P[i][1]) / (P[j][0] - P[i][0]))); };
            return mc(r, '(d) The average rates of change are ' + rt(0, 1) + ' cm/h from ' + t('A') + ' to ' + t('B') + ', ' + rt(2, 3) + ' cm/h from ' + t('C') + ' to ' + t('D') + ', ' + rt(3, 4) + ' cm/h from ' + t('D') + ' to ' + t('E') + ', and ' + rt(0, 4) + ' cm/h for the whole thaw, ' + t('A') + ' to ' + t('E') + ' — all different. What does that tell you about this roof?', [
              { html: 'The graph is a curve, so the melting rate is not constant — it speeds up as the day warms. Each average rate describes only its own interval, so “the rate of change” means nothing until you name the interval.', right: true },
              { html: 'There must be an arithmetic mistake — every graph has a single rate of change.', why: 'Only a <b>straight line</b> has one rate. This graph is a curve.' },
              { html: 'The melting rate is constant; the differences come from rounding.', why: 'The points lie exactly on the curve and the rates differ a lot. The rate really changes.' },
              { html: 'Average rates of change are always different from each other, even on a straight line.', why: 'On a straight line every pair of points gives the same slope.' }],
              'The graph is a curve, so this roof’s melting rate is <b>not constant</b>. Each average rate describes only the interval it was measured across.', ['Would a straight-line graph give different rates for different pairs of points?'], 'not constant');
          } },
          { id: 'e10e', level: 'EMG', make: function (r, sh) {
            var P = sh.P, rates = [0, 1, 2, 3].map(function (i) { return (P[i + 1][1] - P[i][1]) / 2; });
            return mc(r, '(e) At what time of day did the snow disappear, and during which two-hour interval was it melting fastest?', [
              { html: '4 p.m.; fastest from 2 p.m. to 4 p.m.', right: true },
              { html: '8 p.m.; fastest from 2 p.m. to 4 p.m.', why: t('t') + ' counts hours after 8 a.m.: ' + t('t=8') + ' is 4 p.m.' },
              { html: '4 p.m.; fastest from 8 a.m. to 10 a.m.', why: 'Fastest melting is the <b>steepest</b> drop. Compare the two-hour rates: ' + rates.map(function (x) { return t(nf(x)); }).join(', ') + ' cm/h.' },
              { html: '4 p.m.; fastest from 12 p.m. to 2 p.m.', why: 'Compare all four two-hour rates: ' + rates.map(function (x) { return t(nf(x)); }).join(', ') + ' cm/h.' }],
              t('E') + ' is at ' + t('t=8') + ': 8 hours after 8 a.m. is <b>4 p.m.</b> Two-hour averages: ' + rates.map(function (x) { return t(nf(x)); }).join(', ') + ' cm/h. Fastest: ' + t('D') + ' to ' + t('E') + ', <b>2 p.m. to 4 p.m.</b>', ['Which segment is steepest?'], 'when gone, fastest');
          } },
          { id: 'e10f', level: 'PRG', outcome: 'RF7', make: function (r, sh) {
            var m = -sh.c / 8;
            return line('(f) A second roof also starts at ' + t(sh.c) + ' cm at 8 a.m. and also clears at 4 p.m., but its snow melts at a <b>constant</b> rate. Write its equation in the form ' + t('d=mt+b') + '.', m, sh.c, { X: 't', Y: 'd',
              wrong: [{ m: m, b: 0, code: 'value', hint: 'At 8 a.m. (' + t('t=0') + ') the depth is ' + t(sh.c) + ' cm — that’s ' + t('b') + '.' }, { m: (sh.P[1][1] - sh.P[0][1]) / 2, b: sh.c, code: 'value', hint: 'Use the start ' + t('(0,\\ ' + sh.c + ')') + ' and the end ' + t('(8,\\ 0)') + ' of this roof, not the first roof’s A to B.' }] },
              'Points ' + t('(0,\\ ' + sh.c + ')') + ' and ' + t('(8,\\ 0)') + ': ' + t('m=\\tfrac{0-' + sh.c + '}{8-0}=' + nf(m)) + ', ' + t('b=' + sh.c) + '. ' + t('d=' + nf(m) + 't+' + sh.c) + ': the snow melts at a constant ' + t(nf(-m)) + ' cm per hour.', ['The second roof goes from ' + t('(0,\\ ' + sh.c + ')') + ' to ' + t('(8,\\ 0)') + ' in a straight line.'], 'constant-rate roof');
          } },
          { id: 'e10g', level: 'PRG', outcome: 'RF7', make: function (r, sh) {
            var d1 = sh.d(4), d2 = sh.c / 2, diff = cl(d1 - d2);
            return mc(r, '(g) Which roof had more snow on it at noon, and by how much?', [
              { html: 'The first roof, by ' + t(nf(diff)) + ' cm.', right: true },
              { html: 'The second roof, by ' + t(nf(diff)) + ' cm.', why: 'Noon is ' + t('t=4') + ': first roof ' + t(d1) + ' cm (point C), second roof ' + t(nf(-sh.c / 8) + '(4)+' + sh.c + '=' + nf(d2)) + ' cm.' },
              { html: 'Neither — both roofs average the same rate, so they have the same depth all day.', why: 'They match only at the start and the end. In between, the first roof melts slowly at first.' },
              { html: 'The first roof, by ' + t(nf(d1)) + ' cm.', why: 'That’s the first roof’s depth. Subtract the second roof’s depth, ' + t(nf(d2)) + ' cm.' }],
              'Noon is ' + t('t=4') + '. First roof: ' + t(d1) + ' cm (point C). Second roof: ' + t(nf(-sh.c / 8) + '(4)+' + sh.c + '=' + nf(d2)) + ' cm. <b>The first roof had ' + nf(diff) + ' cm more.</b> (A straight line gives the same rate for every pair of points; the curve does not.)', ['Noon is 4 hours after 8 a.m.'], 'noon depths');
          } }] },
      /* ---------------- EP11 ---------------- */
      { num: '11', shared: function (r) {
          var y0, rt;
          for (var g = 0; g < 200; g++) { y0 = r.pick([15, 16, 17, 18, 20]); rt = r.pick([1.6, 1.8, 2, 2.2]); if (y0 / rt > 9 && y0 / rt < 12) break; }
          if (r.chance(0.25)) { y0 = 17; rt = 1.8; }
          var g2 = r.pick([[5000, 1.2], [2500, 1.2], [10000, 1.1], [6250, 1.2]]), A = [0, 1, 2, 3, 4].map(function (i) { return Math.round(g2[0] * Math.pow(g2[1], i)); });
          return { y0: y0, rt: rt, X: [0, 3, 6, 9, 12], Y: [0, 3, 6, 9, 12].map(function (x) { return cl(y0 - rt * x); }), A: A };
        },
        stem: function (sh) { return 'Two relations are given as tables.<br><b>Table 1:</b> depth ' + t('y') + ' of a settling pond in metres, ' + t('x') + ' days after treatment began.' + HW.valueTable([['\\(x\\)'].concat(sh.X), ['\\(y\\)'].concat(sh.Y.map(function (v) { return fx(v, 1); }))]) + '<b>Table 2:</b> subscribers ' + t('A') + ' to a podcast, ' + t('t') + ' years after launch.' + HW.valueTable([['\\(t\\)', 0, 1, 2, 3, 4], ['\\(A\\)'].concat(sh.A)]); },
        parts: [
          { id: 'e11a', level: 'EMG', outcome: 'RF4', make: function (r, sh) {
            var d2 = [1, 2, 3, 4].map(function (i) { return sh.A[i] - sh.A[i - 1]; });
            return mc(r, '(a) Calculate the rate of change across each of the four successive intervals in each table. Which relation is linear?', [
              { html: 'Table 1 only', right: true },
              { html: 'Table 2 only', why: 'Table 2’s yearly changes are ' + d2.map(function (x) { return t(nf(x)); }).join(', ') + ' — not constant.' },
              { html: 'Both — each one changes at every step.', why: 'Linear needs a <b>constant</b> rate. Table 2 grows by a different amount each year.' },
              { html: 'Neither', why: 'Table 1 changes by ' + t(fx(-3 * sh.rt, 1)) + ' every 3 days: a constant rate of ' + t(nf(-sh.rt)) + ' m/day.' }],
              'Table 1: ' + t('\\Delta x=3') + ', ' + t('\\Delta y=' + fx(-3 * sh.rt, 1)) + ' each time: rate ' + t(nf(-sh.rt)) + ' m/day on every interval — constant. Table 2: ' + d2.map(function (x) { return t(nf(x)); }).join(', ') + ' per year — not constant. <b>Table 1 is linear.</b>', ['A relation is linear when the rate of change is the same on every interval.'], 'which is linear');
          } },
          { id: 'e11b', level: 'PRG', outcome: 'RF7', make: function (r, sh) {
            return line('(b) For the linear relation, write the equation in the form ' + t('y=mx+b') + '.', -sh.rt, sh.y0, { wrong: [{ m: cl(-3 * sh.rt), b: sh.y0, code: 'ctx-step', hint: 'The ' + t('x') + '-values go up by 3 days, so divide the change in ' + t('y') + ' by 3.' }] },
              t('m=\\dfrac{' + fx(-3 * sh.rt, 1) + '}{3}=' + nf(-sh.rt)) + ', ' + t('b=' + sh.y0) + ' (the depth at ' + t('x=0') + '): ' + t('y=' + nf(-sh.rt) + 'x+' + sh.y0), ['Rate = change in ' + t('y') + ' ÷ change in ' + t('x') + ' (which is 3, not 1).'], 'pond equation');
          } },
          { id: 'e11b2', sub: 'b ii', level: 'PRG', make: function (r, sh) {
            var x = sh.y0 / sh.rt;
            return B.approx('(b) A negative depth is impossible, so the model must stop when the pond is empty. After how many days does that happen? (Nearest tenth.)', x, 1, { after: 'days', diag: dg([{ v: K.roundTo(sh.y0 * sh.rt, 1), code: 'ctx-convert', hint: 'Divide ' + t(sh.y0) + ' by ' + t(nf(sh.rt)) + '.' }, { v: K.roundTo(sh.y0 / (3 * sh.rt), 1), code: 'ctx-step', hint: 'Use the rate per day, ' + t(nf(sh.rt)) + ' m/day.' }]) },
              t('0=' + nf(-sh.rt) + 'x+' + sh.y0 + '\\Rightarrow x=\\dfrac{' + sh.y0 + '}{' + nf(sh.rt) + '}\\approx ' + K.roundTo(x, 1).toFixed(1)) + ' days.', ['Set ' + t('y=0') + ' and solve.'], 'when the pond is empty');
          } },
          { id: 'e11c', level: 'EMG', make: function (r, sh) {
            var v = (sh.A[4] - sh.A[0]) / 4;
            return num('(c) For the non-linear relation, calculate the average rate of change over the whole four years.', v, [{ v: sh.A[4] - sh.A[0], code: 'ctx-total', hint: 'Divide the total change by the 4 years.' }, { v: sh.A[4] / 4, code: 'ctx-reading', hint: 'Use the change in subscribers, ' + t(nf(sh.A[4]) + '-' + nf(sh.A[0])) + '.' }],
              t('\\dfrac{' + nf(sh.A[4]) + '-' + nf(sh.A[0]) + '}{4-0}=\\dfrac{' + nf(sh.A[4] - sh.A[0]) + '}{4}=' + nf(v)) + ' subscribers per year.', ['Use the first and last entries.'], 'podcast average rate', { after: 'subscribers per year' });
          } },
          { id: 'e11c2', sub: 'c ii', level: 'EMG', make: function (r, sh) {
            var v = (sh.A[4] - sh.A[0]) / 4, d2 = [1, 2, 3, 4].map(function (i) { return sh.A[i] - sh.A[i - 1]; });
            return mc(r, '(c) Over the whole four years the average rate of change is ' + t(nf(v)) + ' subscribers per year. Does any single year actually grow at that average rate?', [
              { html: 'No — the yearly gains were ' + d2.map(function (x) { return t(nf(x)); }).join(', ') + '; ' + t(nf(v)) + ' matches none of them.', right: true },
              { html: 'Yes — the average rate is the growth in every year.', why: 'That’s only true when the relation is linear. Check the yearly gains.' },
              { html: 'Yes — the year from ' + t('t=1') + ' to ' + t('t=2') + '.', why: 'That year gained ' + t(nf(d2[1])) + ', not ' + t(nf(v)) + '.' },
              { html: 'No — the average must be bigger than every yearly gain.', why: 'An average lies between the smallest and the largest yearly gain.' }],
              'Over four years the podcast gained an average of ' + t(nf(v)) + ' subscribers per year. The yearly gains were ' + d2.map(function (x) { return t(nf(x)); }).join(', ') + ' — none of them equals the average.', ['Work out each year’s gain.'], 'average vs yearly');
          } }] },
      /* ---------------- EP12 ---------------- */
      { num: '12', section: 'Extra practice F — Changing the units of a rate', shared: function (r) {
          return { g: r.pick([54, 42, 48, 66, 72, 36]), c: r.pick([23.4, 18.6, 31.5, 12.8]), w: r.pick([7.2, 4.8, 9.6, 3.6, 6]), dr: r.pick([96, 72, 84, 108, 120]) };
        },
        stem: 'Convert each rate to the requested units. The situation does not change — only the numbers used to describe it do.',
        parts: [
          { id: 'e12a', level: 'EMG', make: function (r, sh) {
            return num('(a) A conveyor delivers gravel at ' + t(sh.g) + ' tonnes per hour. Express this in tonnes per minute.', sh.g / 60, [{ v: sh.g * 60, code: 'ctx-convert', hint: 'A minute is shorter than an hour, so less gravel arrives each minute: divide by 60.' }, { v: sh.g / 3600, code: 'ctx-convert', hint: '1 h = 60 min (3600 is seconds).' }],
              '1 h = 60 min: ' + t(sh.g + '\\div 60=' + nf(sh.g / 60)) + ' tonnes per minute.', ['How many minutes are in an hour? More or less gravel each minute?'], 't/h to t/min', { after: 'tonnes per minute' });
          } },
          { id: 'e12b', level: 'EMG', make: function (r, sh) {
            return num('(b) Bulk cashews sell for ' + t(cash(sh.c)) + ' per kilogram. Express this in cents per gram.', sh.c / 10, [{ v: sh.c * 100, code: 'ctx-convert', hint: 'That’s cents per <b>kilogram</b>. A gram is 1/1000 of a kilogram, so divide by 1000 too.' }, { v: sh.c / 1000, code: 'ctx-convert', hint: 'That’s dollars per gram. Change dollars to cents (× 100).' }, { v: sh.c * 10, code: 'ctx-convert', hint: 'Cents: × 100. Per gram: ÷ 1000.' }],
              t(cash(sh.c) + '=' + nf(sh.c * 100)) + ' cents; 1 kg = 1000 g: ' + t(nf(sh.c * 100) + '\\div 1000=' + nf(sh.c / 10)) + ' cents per gram.', ['Two steps: dollars → cents, then per kilogram → per gram.'], '$/kg to ¢/g', { after: 'cents per gram' });
          } },
          { id: 'e12c', level: 'EMG', make: function (r, sh) {
            var a = cl(sh.w / 60), b = cl(sh.w / 60 * 1000);
            var p = B.fields('(c) A water main leaks ' + t(nf(sh.w)) + ' L per minute. Express this in litres per second, then in millilitres per second.', [{ label: 'L/s', name: 'L/s', after: 'L/s' }, { label: 'mL/s', name: 'mL/s', after: 'mL/s' }],
              [K.number(a, dg([{ v: sh.w * 60, code: 'ctx-convert', hint: 'Less water leaks in a second than in a minute: divide by 60.' }])), K.number(b, dg([{ v: a / 1000, code: 'ctx-convert', hint: 'A millilitre is smaller, so there are more of them: multiply by 1000.' }]))],
              [String(a), String(b)], t(nf(a)) + ' L/s and ' + t(nf(b)) + ' mL/s', t(nf(sh.w) + '\\div 60=' + nf(a)) + ' L/s; ' + t(nf(a) + '\\times 1000=' + nf(b)) + ' mL/s.', ['1 min = 60 s; 1 L = 1000 mL.'], 'L/min to L/s, mL/s');
            p.bad = [[String(sh.w * 60), String(b)]];
            return p;
          } },
          { id: 'e12d', level: 'PRG', make: function (r, sh) {
            var a = cl(sh.dr / 60), b = cl(sh.dr * 60 / 1000);
            var p = B.fields('(d) A drone climbs ' + t(sh.dr) + ' m per minute. Express this in metres per second, then in kilometres per hour.', [{ label: 'm/s', name: 'm/s', after: 'm/s' }, { label: 'km/h', name: 'km/h', after: 'km/h' }],
              [K.number(a, dg([{ v: sh.dr * 60, code: 'ctx-convert', hint: 'Fewer metres in a second than in a minute: divide by 60.' }])), K.number(b, dg([{ v: sh.dr * 60, code: 'ctx-noconv', hint: 'That’s metres per hour. Change metres to kilometres (÷ 1000).' }, { v: sh.dr / 60 / 1000, code: 'ctx-convert', hint: 'Per hour is <b>more</b> than per minute: multiply by 60, then ÷ 1000 for km.' }]))],
              [String(a), String(b)], t(nf(a)) + ' m/s and ' + t(nf(b)) + ' km/h', t(sh.dr + '\\div 60=' + nf(a)) + ' m/s. ' + t(sh.dr + '\\times 60=' + nf(sh.dr * 60)) + ' m/h ' + t('\\div 1000=' + nf(b)) + ' km/h.', ['Per second: ÷ 60. Per hour: × 60, then metres → kilometres.'], 'm/min to m/s, km/h');
            p.bad = [[String(a), String(sh.dr * 60)]];
            return p;
          } },
          { id: 'e12e', level: 'EMG', make: function (r, sh) {
            var a = nf(sh.dr / 60), b = nf(sh.dr * 60 / 1000);
            return mc(r, '(e) The drone’s rate can be written as ' + t(a) + ' (m/s) or as ' + t(b) + ' (km/h). Does the drone climb faster when the larger number is used?', [
              { html: 'No — it climbs at one speed; ' + t(a) + ' m/s and ' + t(b) + ' km/h are two names for it. Changing units changes the number, never the physical rate.', right: true },
              { html: 'Yes — ' + t(b) + ' is larger, so the drone is faster in km/h.', why: 'Same drone, same climb. Only the units — and so the number — changed.' },
              { html: 'No — it is slower in km/h, because a kilometre is bigger than a metre.', why: 'It isn’t slower either: it is exactly the same rate.' },
              { html: 'It depends on whether the drone is going up or down.', why: 'Direction doesn’t change it: both numbers describe the same climb.' }],
              '<b>No.</b> ' + t(a) + ' m/s and ' + t(b) + ' km/h describe the same climb. Changing units changes the number attached to a rate, not the rate itself — which is why a rate means nothing without its units.', ['Did anything about the drone change?'], 'units change numbers');
          } },
          { id: 'e12f', level: 'PRG', make: function (r, sh) {
            return mc(r, '(f) Most converted numbers came out smaller than the starting rate, but at least one came out larger. Which rule decides which way a converted rate moves?', [
              { html: 'The number gets larger when the new top unit is smaller (L → mL) or the new bottom unit is larger (per minute → per hour); it gets smaller in the opposite cases.', right: true },
              { html: 'The number gets larger when the new top unit is larger (m → km).', why: 'Bigger units mean fewer of them: ' + t('5760') + ' m is only ' + t('5.76') + ' km.' },
              { html: 'The number always gets smaller when you convert.', why: 'L/s → mL/s made the number 1000 times larger.' },
              { html: 'The number gets smaller when the new bottom unit is larger (per minute → per hour).', why: 'More time in the bottom unit means more happens in it: per hour is 60 times per minute.' }],
              'Smaller top unit or larger bottom unit → larger number. Larger top unit or smaller bottom unit → smaller number.', ['Think: per hour vs per minute — in which does more happen?'], 'conversion direction rule');
          } }] },
      /* ---------------- EP13 ---------------- */
      { num: '13', shared: function (r) {
          var c = r.chance(0.25) ? [4.8, 15] : [r.pick([1.2, 2.4, 3.6, 4.8, 6, 3]), r.int(5, 25)];
          return { r: c[0], b: c[1], s: cl(c[0] * 1000 / 60), hrs: r.pick([1.5, 2.5, 3, 4]) };
        },
        stem: function (sh) { return 'A commercial ice machine is modelled by ' + t('I=' + nf(sh.r) + 't+' + sh.b) + ', where ' + t('I') + ' is the mass of ice in the bin in <b>kilograms</b> and ' + t('t') + ' is the time in <b>hours</b> since the machine was switched on.'; },
        parts: [
          { id: 'e13a', level: 'PRG', outcome: 'RF7', make: function (r, sh) {
            return line('(a) Rewrite the model as ' + t('J=mn+b') + ', where ' + t('J') + ' is the mass of ice in <b>grams</b> and ' + t('n') + ' is the time in <b>minutes</b>.', sh.s, sh.b * 1000, { X: 'n', Y: 'J',
              wrong: [{ m: sh.r, b: sh.b, code: 'ctx-noconv', hint: 'Convert both numbers: kg → g (× 1000), and per hour → per minute (÷ 60) for the slope.' },
                { m: sh.s, b: sh.b, code: 'ctx-noconv', hint: 'Right slope — the intercept is a mass too: ' + t(sh.b) + ' kg ' + t('=' + nf(sh.b * 1000)) + ' g.' },
                { m: sh.r * 1000, b: sh.b * 1000, code: 'ctx-noconv', hint: 'That’s grams per <b>hour</b>. Divide by 60 for grams per minute.' },
                { m: sh.r * 1000 * 60, b: sh.b * 1000, code: 'ctx-convert', hint: 'Per minute is <b>less</b> than per hour: divide by 60, don’t multiply.' }] },
              t(nf(sh.r) + '\\text{ kg/h}=\\dfrac{' + nf(sh.r * 1000) + '\\text{ g}}{60\\text{ min}}=' + nf(sh.s)) + ' g/min; ' + t(sh.b + '\\text{ kg}=' + nf(sh.b * 1000)) + ' g. ' + t('J=' + nf(sh.s) + 'n+' + nf(sh.b * 1000)), ['Slope: kg/h → g/min. Intercept: kg → g.'], 'convert ice model');
          } },
          { id: 'e13b', level: 'EMG', make: function (r, sh) {
            var a = t(nf(sh.r)), s = t(nf(sh.s));
            return mc(r, '(b) Which statement gives the slope of each version with its units?', [
              { html: t('I') + ': ' + a + ' kg/h — the bin gains ' + a + ' kg of ice every hour. ' + t('J') + ': ' + s + ' g/min — the bin gains ' + s + ' g every minute.', right: true },
              { html: t('I') + ': ' + a + ' h/kg. ' + t('J') + ': ' + s + ' min/g.', why: 'Units upside down: mass (vertical) per time (horizontal).' },
              { html: t('I') + ': ' + a + ' kg/h. ' + t('J') + ': ' + s + ' kg/min.', why: t('J') + ' is in grams, so its slope is in grams per minute.' },
              { html: t('I') + ': ' + a + ' kg. ' + t('J') + ': ' + s + ' g.', why: 'A slope is a rate — mass <b>per</b> unit of time.' }],
              t('I') + ': ' + a + ' kg/h — the bin gains ' + a + ' kg of ice every hour. ' + t('J') + ': ' + s + ' g/min — the bin gains ' + s + ' g of ice every minute.', ['Units of a slope: (vertical unit) per (horizontal unit).'], 'ice slopes');
          } },
          { id: 'e13c', level: 'EMG', make: function (r, sh) {
            return mc(r, '(c) The slope changed from ' + t(nf(sh.r)) + ' to a much larger number. Is the machine producing ice faster?', [
              { html: 'No — ' + t(nf(sh.s) + '\\text{ g/min}\\times 60=' + nf(sh.r * 1000) + '\\text{ g/h}=' + nf(sh.r) + '\\text{ kg/h}') + '. It’s the same rate; the number is bigger only because a gram is much smaller than a kilogram.', right: true },
              { html: 'Yes — ' + t(nf(sh.s)) + ' is bigger than ' + t(nf(sh.r)) + '.', why: 'Same machine, same ice. Only the units changed.' },
              { html: 'Yes — it makes more ice per minute than per hour.', why: 'It makes ' + t(nf(sh.s)) + ' g each minute, which adds up to ' + t(nf(sh.r)) + ' kg each hour — the same rate.' },
              { html: 'No — it is producing ice more slowly in the new model.', why: 'Neither faster nor slower: exactly the same rate in different units.' }],
              t(nf(sh.s) + '\\times 60=' + nf(sh.r * 1000)) + ' g/h ' + t('=' + nf(sh.r)) + ' kg/h — the same rate. The number is bigger only because the units are smaller.', ['Convert the new slope back to kg per hour.'], 'same rate');
          } },
          { id: 'e13d', level: 'EMG', outcome: 'RF7', make: function (r, sh) {
            var v = cl(sh.r * sh.hrs + sh.b);
            return num('(d) Use the model to find the mass of ice after ' + t(nf(sh.hrs)) + ' hours (in kg). Both versions should agree.', v, [
              { v: cl(sh.r * sh.hrs), code: 'ctx-no-b', hint: 'Add the ice that was already in the bin: ' + t('+' + sh.b) + '.' },
              { v: cl((sh.s * sh.hrs + sh.b * 1000) / 1000), code: 'ctx-noconv', hint: 'In the ' + t('J') + ' version, ' + t('n') + ' is in minutes: ' + t(nf(sh.hrs)) + ' h ' + t('=' + nf(sh.hrs * 60)) + ' min.' }],
              t('I=' + nf(sh.r) + '(' + nf(sh.hrs) + ')+' + sh.b + '=' + nf(v)) + ' kg. Check: ' + t('n=' + nf(sh.hrs * 60)) + ' min, ' + t('J=' + nf(sh.s) + '(' + nf(sh.hrs * 60) + ')+' + nf(sh.b * 1000) + '=' + nf(v * 1000)) + ' g ' + t('=' + nf(v)) + ' kg ✓', ['Substitute ' + t('t=' + nf(sh.hrs)) + ' into ' + t('I') + '.'], 'ice after h hours', { after: 'kg' });
          } },
          { id: 'e13e', level: 'EMG', make: function (r, sh) {
            return mc(r, '(e) Interpret the intercept of each version. Why do the two sentences say the same thing?', [
              { html: 'There were ' + t(sh.b) + ' kg (' + t(nf(sh.b * 1000)) + ' g) of ice in the bin when the machine was switched on — the same mass in different units.', right: true },
              { html: 'The machine makes ' + t(sh.b) + ' kg of ice per hour, which is ' + t(nf(sh.b * 1000)) + ' g per minute.', why: 'The intercept isn’t a rate: it’s the mass at ' + t('t=0') + '.' },
              { html: 'The bin holds at most ' + t(sh.b) + ' kg of ice.', why: 'The intercept is the starting mass, when the machine is switched on.' },
              { html: 'They don’t say the same thing: ' + t(nf(sh.b * 1000)) + ' is much bigger than ' + t(sh.b) + '.', why: t(nf(sh.b * 1000)) + ' g ' + t('=' + sh.b) + ' kg: the same mass.' }],
              t('I') + ': there were ' + t(sh.b) + ' kg of ice when the machine was switched on. ' + t('J') + ': ' + t(nf(sh.b * 1000)) + ' g at the same moment. ' + t(nf(sh.b * 1000) + '\\text{ g}=' + sh.b + '\\text{ kg}') + '.', ['The intercept is the value at time 0.'], 'ice intercepts');
          } }] },
      /* ---------------- EP14 ---------------- */
      { num: '14', section: 'Extra practice G — Error analysis', shared: function (r) {
          return r.pick([
            { y: 'litres of maple sap collected', x: 'hours of tapping', m: r.pick([1.5, 1.2, 2.5]), top: 'litres', bot: 'hour', good: function (m) { return 'Sap is being collected at a rate of ' + t(nf(m)) + ' litres per hour of tapping.'; }, fl: 'hours per litre' },
            { y: 'pages printed', x: 'minutes', m: r.pick([18, 24, 32]), top: 'pages', bot: 'minute', good: function (m) { return 'The printer is printing ' + t(nf(m)) + ' pages per minute.'; }, fl: 'minutes per page' },
            { y: 'kilometres cycled', x: 'hours', m: r.pick([14, 16, 22]), top: 'kilometres', bot: 'hour', good: function (m) { return 'The cyclist’s distance is increasing at ' + t(nf(m)) + ' kilometres per hour.'; }, fl: 'hours per kilometre' }]);
        },
        stem: function (sh) { return 'Asked to interpret the slope of a graph of <i>' + sh.y + '</i> against <i>' + sh.x + '</i>, a student writes: “The slope is ' + t(nf(sh.m)) + '.”'; },
        parts: [
          { id: 'e14a', level: 'EMG', make: function (r, sh) {
            return mc(r, '(a) The arithmetic is correct. What is the answer missing?', [
              { html: 'The units and the context — what is changing, in which direction, per what. ' + t(nf(sh.m)) + ' alone could be ' + sh.top + ' per ' + sh.bot + ', ' + sh.fl + ', or anything else.', right: true },
              { html: 'Nothing — the slope is a number, so the number is the answer.', why: 'An interpretation question asks what the slope <b>means</b>. A bare number doesn’t say.' },
              { html: 'A minus sign.', why: 'The quantity is increasing, so the slope is positive. What’s missing is the meaning.' },
              { html: 'The ' + t('y') + '-intercept.', why: 'The question is about the slope. It needs units and context.' }],
              'It is missing the <b>units</b> and the <b>context</b>. A slope is a ratio of two measured quantities, so ' + t(nf(sh.m)) + ' alone doesn’t say what it means.', ['What would a reader need to know to understand “' + nf(sh.m) + '”?'], 'bare number');
          } },
          { id: 'e14b', level: 'EMG', make: function (r, sh) {
            return mc(r, '(b) Build the units from the two axis labels. Which is a proper interpretation?', [
              { html: sh.good(sh.m), right: true },
              { html: sh.good(sh.m).replace(sh.top + ' per ' + sh.bot, sh.fl), why: 'Units upside down: vertical units (' + sh.top + ') per horizontal unit (' + sh.bot + ').' },
              { html: 'The slope is ' + t(nf(sh.m)) + ' ' + sh.top + '.', why: 'A rate needs “per”: ' + sh.top + ' per ' + sh.bot + '.' },
              { html: t(nf(sh.m)) + ' ' + sh.top + ' in total.', why: 'The slope is a rate, not a total.' }],
              'Vertical axis: ' + sh.top + '; horizontal axis: ' + sh.bot + 's. Units: ' + sh.top + ' per ' + sh.bot + '. “' + sh.good(sh.m) + '”', ['Units: (vertical) per (horizontal).'], 'proper sentence');
          } }] },
      /* ---------------- EP15 ---------------- */
      { num: '15', shared: function (r) { var c = r.pick([3, 4, 5, 6]); return { c: c, h: r.pick(rng(1, c - 1)) }; },
        stem: function (sh) { return 'Comparing a cooling curve of slope ' + t(-sh.c) + ' with a heating curve of slope ' + t(sh.h) + ', a student writes: “' + t(-sh.c) + ' is less than ' + t(sh.h) + ', so the cooling graph is less steep.”'; },
        parts: [
          { id: 'e15a', level: 'EMG', make: function (r, sh) {
            return mc(r, '(a) Identify the confusion.', [
              { html: 'The student compared the slopes as <b>values</b> but drew a conclusion about <b>steepness</b>, which compares absolute values.', right: true },
              { html: 'There is no confusion: a smaller slope means a less steep line.', why: 'Only for positive slopes. ' + t(-sh.c) + ' is smaller but steeper.' },
              { html: 'The student should have compared the intercepts.', why: 'Steepness is about the slope, not the intercept.' },
              { html: 'The student mixed up which curve is heating and which is cooling.', why: 'The labels are right (negative = cooling). The mistake is how steepness is compared.' }],
              'The student compared values, but steepness compares ' + t('|m|') + '.', ['What does steepness compare?'], 'steepness confusion');
          } },
          { id: 'e15b', level: 'EMG', make: function (r, sh) {
            return mc(r, '(b) Which graph really is steeper, and by what measure?', [
              { html: 'The cooling graph: ' + t('|-' + sh.c + '|=' + sh.c + '>|' + sh.h + '|=' + sh.h) + ' — its temperature changes faster.', right: true },
              { html: 'The heating graph: ' + t(sh.h + '>-' + sh.c) + '.', why: 'That compares values. Steepness compares ' + t('|m|') + '.' },
              { html: 'They are equally steep.', why: t(sh.c + '\\ne ' + sh.h) + ': one changes faster.' },
              { html: 'You can’t tell without the intercepts.', why: 'Steepness depends only on the slope.' }],
              t('|-' + sh.c + '|=' + sh.c + '>|' + sh.h + '|=' + sh.h) + ': the cooling graph is steeper.', ['Compare ' + t('|m|') + '.'], 'which is steeper');
          } },
          { id: 'e15c', level: 'PRG', make: function (r, sh) {
            return mc(r, '(c) Which corrected statement gets both the value comparison and the steepness comparison right?', [
              { html: t(-sh.c + '<' + sh.h) + ', so the cooling line has the smaller slope; but ' + t('|-' + sh.c + '|>|' + sh.h + '|') + ', so the cooling line is the steeper one.', right: true },
              { html: t(-sh.c + '<' + sh.h) + ', so the cooling line has the smaller slope and is less steep.', why: 'The second half repeats the original mistake.' },
              { html: t(-sh.c + '>' + sh.h) + ', so the cooling line has the larger slope and is steeper.', why: t(-sh.c) + ' is less than ' + t(sh.h) + ' as a value.' },
              { html: 'The heating line has the smaller slope, but the cooling line is steeper.', why: 'The heating slope ' + t(sh.h) + ' is the larger value.' }],
              '“' + t(-sh.c + '<' + sh.h) + ', so the cooling line has the smaller slope; but ' + t('|-' + sh.c + '|>|' + sh.h + '|') + ', so the cooling line is steeper — it falls faster than the heating line rises.”', ['Value: compare the numbers. Steepness: compare the absolute values.'], 'corrected statement');
          } }] },
      /* ---------------- EP16 ---------------- */
      { num: '16', shared: function (r) { var bk = r.chance(0.25); return { a: bk ? 85 : r.pick([65, 75, 85, 95]), b: bk ? 320 : r.pick([240, 280, 320, 360]), n: bk ? 6 : r.int(4, 9) }; },
        stem: function (sh) { return 'A snow-clearing contract is modelled by ' + t('C=' + sh.a + 'w+' + sh.b) + ', where ' + t('C') + ' is the total cost in dollars for ' + t('w') + ' clearings of a driveway over the season. A student writes: “The slope means the job costs ' + t(money(sh.a)) + '.”'; },
        parts: [
          { id: 'e16a', level: 'EMG', make: function (r, sh) {
            return mc(r, '(a) What has the student confused, and what is the correct interpretation?', [
              { html: 'A rate was read as a total price. Correct: each additional clearing adds ' + t(money(sh.a)) + ' to the total cost — the cost rises at ' + t(money(sh.a)) + ' per clearing.', right: true },
              { html: 'Nothing — the job does cost ' + t(money(sh.a)) + '.', why: 'The whole season costs more than that: ' + t(money(sh.a)) + ' is the cost <b>per clearing</b>.' },
              { html: 'The slope and intercept were mixed up: the slope means the job costs ' + t(money(sh.b)) + '.', why: t(money(sh.b)) + ' is the intercept, and it isn’t the cost of the job either.' },
              { html: 'The slope means the job costs ' + t(money(sh.a)) + ' per season.', why: 'The slope is per <b>clearing</b> (the horizontal variable is ' + t('w') + ').' }],
              'The student read the rate as a total price. Correct: each additional clearing adds ' + t(money(sh.a)) + ' — the cost rises at ' + t(money(sh.a)) + ' per clearing.', ['Units of the slope: dollars per clearing.'], 'rate vs total');
          } },
          { id: 'e16b', level: 'EMG', make: function (r, sh) {
            return mc(r, '(b) Interpret the ' + t(sh.b) + ' in a sentence with units.', [
              { html: 'It is a fixed charge for the season: a contract with zero clearings still costs ' + t(money(sh.b)) + '.', right: true },
              { html: 'Each clearing costs ' + t(money(sh.b)) + '.', why: 'The cost per clearing is the slope, ' + t(money(sh.a)) + '.' },
              { html: 'The season’s total cost is ' + t(money(sh.b)) + '.', why: 'The total depends on how many clearings: ' + t(sh.b) + ' is the cost when ' + t('w=0') + '.' },
              { html: 'The company will do at most ' + t(sh.b) + ' clearings.', why: t(sh.b) + ' is in dollars — it is the value of ' + t('C') + ' at ' + t('w=0') + '.' }],
              'The ' + t(money(sh.b)) + ' is a fixed charge for the season: a contract with zero clearings still costs ' + t(money(sh.b)) + '.', ['What is ' + t('C') + ' when ' + t('w=0') + '?'], 'fixed charge');
          } },
          { id: 'e16c', level: 'BEG', outcome: 'RF7', make: function (r, sh) {
            var v = sh.a * sh.n + sh.b;
            return num('(c) Calculate the total cost of a contract with ' + t(sh.n) + ' clearings.', v, [{ v: sh.a * sh.n, code: 'ctx-no-b', hint: 'Add the fixed charge of ' + t(money(sh.b)) + '.' }, { v: sh.a + sh.b, code: 'value', hint: 'Multiply the rate by the number of clearings: ' + t(sh.a + '(' + sh.n + ')') + '.' }, { v: (sh.a + sh.b) * sh.n, code: 'value', hint: 'Only the rate is multiplied by ' + t(sh.n) + '; the fixed charge is paid once.' }],
              t('C=' + sh.a + '(' + sh.n + ')+' + sh.b + '=' + (sh.a * sh.n) + '+' + sh.b + '=' + v) + '. The total is ' + t(money(v)) + ': neither ' + t(money(sh.a)) + ' (one clearing) nor ' + t(money(sh.b)) + ' (the fixed charge) — it needs both.', ['Substitute ' + t('w=' + sh.n) + '.'], 'season cost', { money: true });
          } }] },
      /* ---------------- EP17 ---------------- */
      { num: '17', section: 'Extra practice H — Stretch and test-style', shared: function (r) {
          var bk = r.chance(0.25), c = bk ? [7, 2] : r.pick([[7, 2], [7, 4], [21, 4]]), A = c[0], k = c[1], b = bk ? 9 : r.int(6, 12), m = A / k, del = bk ? 0.14 : r.pick([0.07, 0.14, 0.21, -0.07, -0.14, -0.21]);
          var mQ = cl(m + del), q = Math.round(mQ * 1e6 / 7);
          return { A: A, k: k, C: k * b, b: b, m: m, del: del, mQ: mQ, q: q };
        },
        stem: function (sh) { return '<b>Two models, two forms, two sets of units.</b> Reservoir P is filling according to ' + t(sh.A + 'x-' + sh.k + 'y+' + sh.C + '=0') + ', where ' + t('x') + ' is the number of weeks since monitoring began and ' + t('y') + ' is the volume in megalitres. Reservoir Q is filling at a steady ' + t(nf(sh.q)) + ' litres per day. (' + t('1\\text{ ML}=1\\,000\\,000\\text{ L}') + '.)'; },
        parts: [
          { id: 'e17a', level: 'EMG', outcome: 'RF6', make: function (r, sh) {
            return line('(a) Rewrite reservoir P’s equation in the form ' + t('y=mx+b') + '.', sh.m, sh.b, {},
              t(sh.A + 'x-' + sh.k + 'y+' + sh.C + '=0\\Rightarrow -' + sh.k + 'y=-' + sh.A + 'x-' + sh.C + '\\Rightarrow y=' + nf(sh.m) + 'x+' + sh.b), ['Get ' + t('y') + ' by itself: move the other terms, then divide by the coefficient of ' + t('y') + '.'], 'P in slope-intercept form');
          } },
          { id: 'e17a2', sub: 'a ii', level: 'EMG', make: function (r, sh) {
            return num('(a) State reservoir P’s rate of change.', sh.m, [{ v: -sh.m, code: 'ctx-rate-sign', hint: 'The reservoir is filling: the rate is positive. Check the signs when you divide by ' + t('-' + sh.k) + '.' }, { v: sh.A, code: 'value', hint: 'Divide by the coefficient of ' + t('y') + ' too: ' + t('\\tfrac{' + sh.A + '}{' + sh.k + '}') + '.' }, { v: sh.k / sh.A, code: 'ctx-flip', hint: 'Upside down: ' + t('m=-\\tfrac{A}{B}=\\tfrac{' + sh.A + '}{' + sh.k + '}') + '.' }],
              'From ' + t('y=' + nf(sh.m) + 'x+' + sh.b) + ': P’s volume rises at ' + t(nf(sh.m)) + ' megalitres per week.', ['The rate is the slope of the equation from (a).'], 'P rate', { after: 'ML per week' });
          } },
          { id: 'e17b', level: 'EMG', make: function (r, sh) {
            return num('(b) Convert reservoir Q’s rate to megalitres per week.', sh.mQ, [{ v: sh.q / 1e6, code: 'ctx-days', hint: 'That’s ML per <b>day</b>. A week has 7 days.' }, { v: sh.q * 7, code: 'ctx-noconv', hint: 'That’s litres per week. Convert to megalitres (÷ 1 000 000).' }, { v: sh.q / 7 / 1e6, code: 'ctx-convert', hint: 'More water arrives in a week than in a day: multiply by 7.' }],
              t(nf(sh.q) + '\\text{ L/day}=' + nf(sh.q / 1e6) + '\\text{ ML/day}') + '; ' + t(nf(sh.q / 1e6) + '\\times 7=' + nf(sh.mQ)) + ' ML per week.', ['Litres → megalitres, then per day → per week.'], 'Q rate in ML/week', { after: 'ML per week' });
          } },
          { id: 'e17c', level: 'EMG', make: function (r, sh) {
            var Qf = sh.del > 0;
            return mc(r, '(c) Which reservoir is filling faster?', [
              { html: Qf ? 'Reservoir Q' : 'Reservoir P', right: true },
              { html: Qf ? 'Reservoir P' : 'Reservoir Q', why: 'Compare in the same units: P ' + t(nf(sh.m)) + ' ML/week, Q ' + t(nf(sh.mQ)) + ' ML/week.' },
              { html: 'They fill at the same rate.', why: 'In ML per week they differ: ' + t(nf(sh.m)) + ' and ' + t(nf(sh.mQ)) + '.' },
              /* a wrong-reason distractor must also name the wrong reservoir, or it is a second right answer */
              Qf ? { html: 'Reservoir P, because ' + t(nf(sh.m)) + ' ML per week is more than Q’s ' + t(nf(sh.q / 1e6)) + ' ML per day.', why: 'Still different units (per week vs per day). In ML per week Q fills at ' + t(nf(sh.mQ)) + '.' }
                : { html: 'Reservoir Q, because ' + t(nf(sh.q)) + ' is much bigger than ' + t(nf(sh.m)) + '.', why: 'Those numbers have different units, so they can’t be compared directly.' }],
              'P: ' + t(nf(sh.m)) + ' ML/week; Q: ' + t(nf(sh.mQ)) + ' ML/week. <b>Reservoir ' + (Qf ? 'Q' : 'P') + ' is faster.</b>', ['Compare both rates in ML per week.'], 'which reservoir faster');
          } },
          { id: 'e17c2', sub: 'c ii', level: 'PRG', make: function (r, sh) {
            var d = Math.abs(sh.del), dl = Math.round(d * 1e6);
            var p = B.fields('(c) By how much faster? Give the difference in ML per week and again in litres per week.', [{ label: 'ML per week', name: 'ML per week', after: 'ML/week' }, { label: 'L per week', name: 'L per week', after: 'L/week' }],
              [K.number(d, dg([{ v: -d, code: 'ctx-rate-sign', hint: 'Give the size of the difference (positive).' }])), K.number(dl, dg([{ v: d * 1000, code: 'ctx-convert', hint: '1 ML = 1 000 000 L.' }]))], [String(d), String(dl)], t(nf(d)) + ' ML/week ' + t('=' + nf(dl)) + ' L/week',
              t(nf(Math.max(sh.m, sh.mQ)) + '-' + nf(Math.min(sh.m, sh.mQ)) + '=' + nf(d)) + ' ML per week; ' + t(nf(d) + '\\times 1\\,000\\,000=' + nf(dl)) + ' L per week.', ['Subtract the two rates in ML/week, then convert.'], 'difference in rates');
            p.bad = [[String(d), String(d * 1000)]];
            return p;
          } },
          { id: 'e17d', level: 'EMG', make: function (r, sh) {
            return mc(r, '(d) Why is comparing ' + t(nf(sh.m)) + ' with ' + t(nf(sh.q)) + ' directly not a valid comparison?', [
              { html: t(nf(sh.m)) + ' is in megalitres per week and ' + t(nf(sh.q)) + ' is in litres per day, so the sizes of the numbers say nothing about the rates. Both must first be converted to the same units.', right: true },
              { html: 'It is valid: the bigger number is always the faster rate.', why: 'Only when both rates have the same units.' },
              { html: 'Because one equation is in general form.', why: 'The form doesn’t matter once you know the slope. The units do.' },
              { html: 'Because one rate is negative.', why: 'Both reservoirs are filling. The problem is the units.' }],
              'The numbers carry different units (ML per week vs L per day). The step that had to happen first: <b>convert both rates to the same units</b>.', ['What units does each number have?'], 'compare in same units');
          } },
          { id: 'e17e', level: 'EMG', make: function (r, sh) {
            return num('(e) How much water did reservoir P hold when monitoring began?', sh.b, [{ v: sh.C, code: 'value', hint: 'Divide by the coefficient of ' + t('y') + ': ' + t('y=' + nf(sh.m) + '(0)+' + sh.b) + '.' }, { v: -sh.b, code: 'ctx-rate-sign', hint: 'Check the sign when you solve for ' + t('y') + '.' }],
              t('x=0') + ': ' + t('y=' + nf(sh.m) + '(0)+' + sh.b + '=' + sh.b) + '. When monitoring began, reservoir P held ' + t(sh.b) + ' megalitres.', ['Monitoring began at ' + t('x=0') + '.'], 'P intercept', { after: 'ML' });
          } }] },
      /* ---------------- EP18 ---------------- */
      { num: '18', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: 'e18', level: 'PRG', outcome: 'RF7', make: function (r) {
          var bk = r.chance(0.25), k = bk ? 55 : r.pick(rng(35, 75, 5)), b = bk ? 20.6 : r.pick(rng(15, 25, 0.2)), x1 = bk ? 40 : r.pick([20, 40, 50]), x2 = bk ? 120 : r.pick([100, 120, 150]);
          var m = -k / 1000, y1 = cl(b + m * x1), y2 = cl(b + m * x2), wB = cl(y1 + m * x1), flip = K.roundTo((x2 - x1) / (y2 - y1), 1);
          var o = function (mm, bb) { return t(nf(mm) + '\\text{ kg per balloon and }' + nf(bb) + '\\text{ kg}'); };
          return mc(r, 'A graph of the mass of a helium cylinder against the number of balloons filled from it passes through ' + t(ptT([x1, y1])) + ' and ' + t(ptT([x2, y2])) + ', where mass is in kilograms. The rate of change and the mass of the full cylinder are, respectively,', [
            { html: o(m, b), right: true },
            { html: o(m, wB), why: 'Check the intercept: ' + t(nf(y1) + '=' + nf(m) + '(' + x1 + ')+b') + ', so ' + t('b=' + nf(y1) + '+' + nf(-m * x1)) + '.' },
            { html: o(-m, b), why: 'The cylinder loses mass as balloons are filled, so the rate is negative.' },
            { html: o(flip, b), why: 'That’s balloons per kg (run over rise). The rate is kg per balloon.' }],
            t('m=\\dfrac{' + nf(y2) + '-' + nf(y1) + '}{' + x2 + '-' + x1 + '}=\\dfrac{' + nf(cl(y2 - y1)) + '}{' + (x2 - x1) + '}=' + nf(m)) + ' kg per balloon.<br>' + t(nf(y1) + '=' + nf(m) + '(' + x1 + ')+b\\Rightarrow b=' + nf(b)) + ' kg (the full cylinder, at 0 balloons).',
            ['Find the slope from the two points, then the intercept (0 balloons).'], 'helium rate and full mass');
        } }] },
      /* ---------------- EP19 ---------------- */
      { num: '19', stem: '<i>(Numerical Response)</i>', parts: [
        { id: 'e19', level: 'PRG', outcome: 'RF7', make: function (r) {
          var bk = r.chance(0.25), rt = bk ? 0.3 : r.pick([0.2, 0.25, 0.3, 0.4, 0.5]), Z = bk ? 75 : r.int(60, 150), t1 = bk ? 25 : r.int(10, 30), t2 = bk ? 55 : t1 + r.pick([20, 30, 40]);
          if (t2 >= Z) { t2 = Z - 10; if (t2 - t1 < 10) t1 = t2 - 15; }
          var T1 = cl(-rt * (Z - t1)), T2 = cl(-rt * (Z - t2)), b = cl(-rt * Z), key = (Z < 100 ? '0' : '') + Z;
          var p = B.nr('When the power fails, the air in a commercial freezer warms at a constant rate. ' + t(t1) + ' minutes after the failure the temperature is ' + t(nf(T1) + '^\\circ\\text{C}') + ', and ' + t(t2) + ' minutes after the failure it is ' + t(nf(T2) + '^\\circ\\text{C}') + '. The number of minutes after the failure at which the temperature reaches ' + t('0^\\circ\\text{C}') + ' is ________. <i>(Answer as a three-digit number.)</i>', Z, dg([
            { v: Z - t1, code: 'value', hint: 'Count from the power failure (' + t('t=0') + '), not from the first reading.' },
            { v: Math.round(-b), code: 'ctx-tint-b', hint: 'That’s the size of the temperature at ' + t('t=0') + '. Solve ' + t('0=' + nf(rt) + 't' + nf(b)) + ' for ' + t('t') + '.' }]),
            t('m=\\dfrac{' + nf(T2) + '-(' + nf(T1) + ')}{' + t2 + '-' + t1 + '}=\\dfrac{' + nf(cl(T2 - T1)) + '}{' + (t2 - t1) + '}=' + nf(rt)) + ' °C/min<br>' + t(nf(T1) + '=' + nf(rt) + '(' + t1 + ')+b\\Rightarrow b=' + nf(b)) + '<br>' + t('0=' + nf(rt) + 't' + nf(b) + '\\Rightarrow t=' + Z) + ' min. Entry: <b>' + key + '</b>',
            ['Find the rate, then the temperature at the moment of the failure (' + t('t=0') + '), then solve for ' + t('T=0') + '.'], 'freezer reaches 0');
          p.key = key; p.answer = t(key);
          return p;
        } }] }
    ]
  };
  /* booklet letters: every part of a multi-part question shows the letter from its id (5d → d), never a position */
  LESSON.questions.concat(LESSON.extra).forEach(function (q) { if (q.parts.length > 1) q.parts.forEach(function (p) { if (!p.sub) p.sub = p.id.replace(/^e?\d+/, ''); }); });
  HW.defineLesson(LESSON);
})(window);
