/* Math 10C · Unit 5 · Lesson 1 — The Cartesian Plane, Growing Patterns, and Types of Variables (RF1 / RF2)
 * Assignment questions 1–12 (u5_L01.tex) and the Lesson 1 Extra Practice (u5_EP01.tex).
 * Every part is a generator: the booklet's numbers are one possible version; new versions keep the same structure
 * (same quadrants and axis points, same kind of growing pattern, same kind of decimal rate, …).
 * Conversions: "plot the data" -> choose the right graph (MC with small graphs); "explain / describe" -> MC with a
 * hint for each misconception; tables -> number boxes; equations -> polynomial answer with the left side given.
 * Levels: LIM BEG EMG PRG ADV MAS (LEVEL_RUBRIC.md). */
(function (root) {
  'use strict';
  var HW = root.HW, K = HW.kit, ex = HW.ex, P = HW.poly, KP = K.P, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form;
  var INK = '#2b3340', TEAL = '#13807a', GREY = '#c9ccd2';

  HW.addCodes({
    'pair-format': 'Ordered pair not written as (x, y)', 'pair-brackets': 'Ordered pair without brackets', 'pair-swap': 'Coordinates in the wrong order',
    'pair-sign': 'Sign of a coordinate wrong', 'pair-value': 'Wrong coordinates', 'wrong-point': 'Named the wrong point', 'no-point': 'Named a point that isn’t there',
    letter: 'Not a point letter', 'quad-clockwise': 'Numbered the quadrants clockwise', 'quad-sign': 'Wrong quadrant (signs)', 'var-letter': 'Wrong letter for the variable',
    'no-constant': 'Equation missing the constant term', 'first-term': 'Used the first value as the constant', 'step-as-const': 'Used the step as the constant', 'times-first': 'Multiplied by the first value',
    'per-two': 'Rate per 2 units instead of per 1', 'swapped-coef': 'Rate and starting value swapped', 'off-by-one': 'Figure numbers off by one', 'forgot-centre': 'Forgot the fixed part of the pattern',
    'step-wrong': 'Wrong amount added per figure', 'area-count': 'Counted squares (area) instead of perimeter', 'add-not-sub': 'Added instead of subtracting when solving',
    'no-divide': 'Didn’t divide by the rate', 'no-subtract': 'Didn’t subtract the constant', 'sub-wrong-var': 'Substituted into the wrong variable', estimate: 'Graph reading too far off',
    'neighbour': 'Read the value at the wrong point', 'no-fee': 'Left out the starting value', 'order-ops': 'Order of operations', 'flip-formula': 'Used the inverse formula',
    'no-sub32': 'Did not subtract 32', 'sign-rate': 'Wrong sign on the rate', 'all-sides': 'Counted every side (no sharing)', 'not-whole': 'Treated a non-whole figure number as a figure'
  });

  /* ---------- small helpers ---------- */
  function feq(a, b) { return Math.abs(a - b) < 1e-9; }
  function pt(p) { return '(' + p[0] + ', ' + p[1] + ')'; }
  function money(c) { return (c / 100).toFixed(2); }        // cents -> "3.50"
  function dec(x) { return String(Math.round(x * 1000) / 1000); }
  function sgnWord(v) { return v > 0 ? 'positive' : 'negative'; }
  function quadOf(p) { return p[0] > 0 ? (p[1] > 0 ? 'I' : 'IV') : (p[1] > 0 ? 'II' : 'III'); }
  var QSIGN = { I: '(+, +)', II: '(-, +)', III: '(-, -)', IV: '(+, -)' };
  function lin(p, q, v) { // LaTeX of p·v + q (integers)
    var a = p === 1 ? v : p === -1 ? '-' + v : p + v;
    return q === 0 ? a : a + (q > 0 ? '+' : '-') + Math.abs(q);
  }
  function linP(p, q, v) { var o = {}; o[v] = 1; return P.add(P.mono(p, o), P.num(q)); }
  function times(p) { return p === 2 ? 'twice' : p === 3 ? 'three times' : p === 4 ? 'four times' : p === 5 ? 'five times' : p === 6 ? 'six times' : p + ' times'; }
  function svgWrap(w, h, body, maxw, label) {
    return '<svg class="fig-svg" viewBox="0 0 ' + Math.ceil(w) + ' ' + Math.ceil(h) + '" width="100%" style="max-width:' + Math.round(maxw) + 'px" role="img" aria-label="' + label + '" font-family="KaTeX_Main, \'Times New Roman\', serif" font-size="13" fill="' + INK + '">' + body + '</svg>';
  }
  /* lay figures out in a row, bottoms aligned, each labelled underneath. items: [{ w, h, draw(ox, oy) }] */
  /* one small SVG per figure (bottoms aligned, label underneath) in a row that wraps on narrow screens */
  function figRow(items, labels, opt) {
    opt = opt || {};
    var sc = opt.scale || 1.3, m = 6, H = Math.max.apply(null, items.map(function (i) { return i.h; }));
    var out = items.map(function (it, i) {
      var slot = Math.max(it.w, 58) + 2 * m, x = (slot - it.w) / 2;
      var s = it.draw(x, m + H - it.h) + '<text x="' + (slot / 2) + '" y="' + (m + H + 18) + '" text-anchor="middle" font-size="12">' + labels[i] + '</text>';
      return '<svg class="fig-svg" viewBox="0 0 ' + Math.ceil(slot) + ' ' + Math.ceil(H + m + 26) + '" style="width:' + Math.round(slot * sc) + 'px;max-width:100%;flex:0 0 auto;margin:4px 0" role="img" aria-label="' + (opt.label || 'pattern') + ', ' + labels[i] + '" font-family="KaTeX_Main, \'Times New Roman\', serif" font-size="13" fill="' + INK + '">' + s + '</svg>';
    });
    return '<div class="fig-row" style="display:flex;flex-wrap:wrap;gap:4px 16px;align-items:flex-end;margin:6px 0">' + out.join('') + '</div>';
  }
  function stripMoney(resp) { return String(resp == null ? '' : resp).replace(/\\\$|\$|\\text\{[^}]*\}/g, '').replace(/[a-zA-Z\s]+$/, '').trim(); }
  function numCheck(ans, diag) { var c = K.number(ans, diag); return function (resp) { return c(stripMoney(resp)); }; }
  /* a value read off a graph: anything within tol of the exact value */
  function estCheck(exact, tol, diag, hint) {
    return function (resp) {
      var p = HW.parse.number(stripMoney(resp));
      if (!p.ok) return form(p.code === 'empty' ? 'empty' : 'notnumber', p.code === 'empty' ? 'Type your answer first.' : 'Enter a single number.');
      if (Math.abs(p.value - exact) <= tol + 1e-9) return ok();
      var h = diag ? diag(p.value) : null; if (h) return wrong(h.code, h.hint);
      return wrong('estimate', hint || null);
    };
  }
  /* ---- one ordered pair (x, y), typed as (3, -2) or C(3, -2) ---- */
  function readPair(resp) {
    var s = String(resp == null ? '' : resp).replace(/\\left|\\right/g, '').replace(/\\[,;:! ]|~/g, '').replace(/−/g, '-').replace(/\\lbrace|\\rbrace|\\\{|\\\}|[{}]/g, '').replace(/\s+/g, '');
    if (!s) return { empty: true };
    s = s.replace(/^[A-Za-z]=?(?=\()/, '');
    var m = /^\((.*)\)$/.exec(s), inner = m ? m[1] : s, bits = inner.split(',');
    if (bits.length !== 2 || !bits[0] || !bits[1]) return { bad: true };
    var a = ex.parse(bits[0]), b = ex.parse(bits[1]);
    if (!a.ok || !b.ok) return { bad: true };
    var x = ex.value(a.ast), y = ex.value(b.ast);
    if (!isFinite(x) || !isFinite(y)) return { bad: true };
    return { x: x, y: y, parens: !!m };
  }
  function pairCheck(x, y, diag) {
    return function (resp) {
      var p = readPair(resp);
      if (p.empty) return form('empty', 'Type the ordered pair first.');
      if (p.bad) return form('pair-format', 'Write the point as an ordered pair in brackets, ' + t('(x, y)') + ', for example ' + t('(3, -2)') + '.');
      if (feq(p.x, x) && feq(p.y, y)) return p.parens ? ok() : form('pair-brackets', 'Right numbers — now write them as an ordered pair in brackets: ' + t('(x, y)') + '.');
      var h = diag ? diag(p.x, p.y) : null; if (h) return wrong(h.code, h.hint);
      if (feq(p.x, y) && feq(p.y, x)) return wrong('pair-swap', 'Your numbers are in the wrong order. An ordered pair lists the <b>x</b>-coordinate (across) first, then the <b>y</b>-coordinate (up or down).');
      if ((feq(Math.abs(p.x), Math.abs(x)) && feq(Math.abs(p.y), Math.abs(y))) || (feq(Math.abs(p.x), Math.abs(y)) && feq(Math.abs(p.y), Math.abs(x))))
        return wrong('pair-sign', 'Check the signs: left of the ' + t('y') + '-axis, ' + t('x') + ' is negative; below the ' + t('x') + '-axis, ' + t('y') + ' is negative.');
      return wrong('pair-value', null);
    };
  }
  function pairPart(prompt, x, y, diag, sol, hints, text, bad) {
    return { prompt: prompt, input: { type: 'math', keys: 'pairs', placeholder: 'e.g. (3, -2)' }, check: pairCheck(x, y, diag), key: pt([x, y]), answer: t(pt([x, y])),
      solution: sol, hints: hints || [], text: text, good: ['\\left(' + x + ',' + y + '\\right)', 'P(' + x + ',' + y + ')'], bad: [pt([y, x]) === pt([x, y]) ? pt([x + 1, y]) : pt([y, x])].concat(bad || []) };
  }
  /* ---- an equation  LHS = p·v + q : the left side is printed; the student types the right side ---- */
  function relabel(s, v) {
    var letters = {};
    String(s).replace(/\\[a-zA-Z]+/g, ' ').replace(/[a-zA-Z]/g, function (c) { letters[c] = 1; return c; });
    var ls = Object.keys(letters).filter(function (c) { return c !== v; });
    if (ls.length !== 1) return s;
    return String(s).replace(/(\\[a-zA-Z]+)|([a-zA-Z])/g, function (m0, cmd, ch) { return cmd ? cmd : ch === ls[0] ? v : ch; });
  }
  function eqPart(prompt, lhs, target, keyTex, wrongs, sol, hints, text, extra) {
    extra = extra || {};
    var v = P.vars(target)[0];
    var ws = (wrongs || []).filter(function (w) { return w && !P.eq(w.is, target); });
    var base = K.poly(target, { wrong: ws });
    var check = function (resp) {
      var s = String(resp == null ? '' : resp).replace(new RegExp('^\\s*' + lhs + '\\s*='), '').replace(new RegExp('^\\s*' + lhs.toLowerCase() + '\\s*='), '');
      var r = base(s);
      if (r.v === 'correct' || r.v === 'form') return r;
      var alt = relabel(s, v);
      if (alt !== s && base(alt).v === 'correct') return form('var-letter', 'Right rule — but use the letter ' + t(v) + ' from the question (a capital and a lower-case letter are different variables).');
      return r;
    };
    return { prompt: prompt, input: { type: 'math', keys: 'poly', vars: [v], before: t(lhs + '=') }, check: check, key: keyTex, answer: t(lhs + '=' + keyTex), solution: sol, hints: hints || [], text: text,
      good: [lhs + '=' + keyTex].concat(extra.good || []), bad: ws.map(function (w) { return P.tex(w.is); }).concat(extra.bad || []) };
  }
  /* ---- a table row: one number box per x-value ---- */
  function tablePart(prompt, xName, xs, f, diagFor, sol, hints, text) {
    var fl = xs.map(function (x) { return { label: t(xName + '=' + x), mode: 'number' }; });
    var ch = xs.map(function (x) { return K.number(f(x), diagFor ? function (v) { return diagFor(x, v); } : null); });
    var keys = xs.map(function (x) { return String(f(x)); });
    return KP.fields(prompt, fl, ch, keys, xs.map(function (x) { return t(f(x)); }).join(', '), sol, hints, text);
  }
  function selectPart(prompt, opts, want, diag, sol, hints, text) {
    return { prompt: prompt, input: { type: 'select', options: opts.map(function (o) { return { value: o, html: t(o) }; }) }, check: K.selectSet(want, diag), key: want,
      answer: t(want.join(',\\ ')), solution: sol, hints: hints || [], text: text };
  }
  function mcCols(p) { p.input.columns = 2; return p; }
  function smallGraph(spec) { spec.max = spec.max || 200; return HW.graph(spec); }
  function step(maxv) { return maxv <= 14 ? 2 : maxv <= 30 ? 4 : maxv <= 50 ? 10 : 20; }
  function patternGraph(pts, o) { // pts: [[x,y]...] ; o: { xName, yName, join, from0, max }
    o = o || {};
    var ymax = Math.max.apply(null, pts.map(function (p) { return p[1]; })), ly = step(ymax); ymax = Math.ceil((ymax + 0.01) / ly) * ly;
    var xmax = Math.max.apply(null, pts.map(function (p) { return p[0]; })) + 1;
    var g = { x: [0, xmax], y: [0, ymax], grid: 1, gridY: ly / 2, labels: 1, labelsX: 1, labelsY: ly, unitX: o.unitX || Math.min(20, 110 / xmax), unitY: (o.h || 105) / ymax, xName: o.xName || 'n', yName: o.yName || 'y', firstQuadrant: true,
      points: pts.map(function (p) { return { x: p[0], y: p[1] }; }), segs: o.join ? [{ pts: o.join }] : [], max: o.max || 200, aria: o.aria || 'graph' };
    return HW.graph(g);
  }

  /* ---------- Q1 vocabulary ---------- */
  var VOCAB = ['ordered pairs', 'coordinates', 'origin', 'quadrants', 'axes', 'x-coordinate', 'y-coordinate'];
  function vocabPart(r, sentence, right, pool, sol, text) {
    var others = r.sample(pool.filter(function (w) { return w !== right; }), 3);
    var whyOf = {
      'ordered pairs': 'An ordered pair is the pair of numbers ' + t('(x, y)') + ' itself.', coordinates: 'The coordinates are the two numbers that locate a point.',
      origin: 'The origin is the single point ' + t('(0, 0)') + ' where the axes cross.', quadrants: 'The quadrants are the four regions the axes cut the plane into.',
      axes: 'The axes are the two number lines (the ' + t('x') + '-axis and the ' + t('y') + '-axis).', 'x-coordinate': 'The ' + t('x') + '-coordinate is the first number of an ordered pair.',
      'y-coordinate': 'The ' + t('y') + '-coordinate is the second number of an ordered pair.', 'x-axis': 'The ' + t('x') + '-axis is the horizontal number line.', 'y-axis': 'The ' + t('y') + '-axis is the vertical number line.' };
    var lab = function (w) { return w.replace(/^x-/, '\\(x\\)-').replace(/^y-/, '\\(y\\)-'); };
    return KP.mc(r, sentence, [{ html: lab(right), right: true }].concat(others.map(function (w) { return { html: lab(w), why: whyOf[w] + ' Read the sentence again with that word in the blank.' }; })), sol, ['Look back at the vocabulary in the notes: axes, origin, quadrants, ordered pair, coordinates.'], text);
  }

  /* ---------- Q2 the big grid ---------- */
  function q2Shared(r) {
    var P0;
    for (var tries = 0; tries < 400; tries++) {
      var k = r.int(1, 6);
      P0 = { A: [-r.int(5, 9), r.int(3, 9)], B: [-r.int(1, 5), k], C: [r.int(2, 6), k], D: [r.int(5, 9), r.int(3, 8)], E: [0, k], F: [-r.int(1, 6), 0],
        G: [-r.int(6, 9), -r.int(5, 9)], H: [r.int(1, 4), -r.int(2, 6)], I: [r.int(5, 9), -r.int(6, 9)] };
      var xs = ['A', 'B', 'C', 'D', 'F', 'G', 'H', 'I'].map(function (L) { return P0[L][0]; });
      var ysPos = [P0.A[1], P0.D[1], k], ysNeg = [P0.G[1], P0.H[1], P0.I[1]];
      var uniq = function (a) { return a.filter(function (x, i) { return a.indexOf(x) === i; }).length === a.length; };
      // the only shared x: E and O; the only shared y: B, C, E (y = k) and F, O (y = 0); labels not crowded
      if (uniq(xs) && uniq(ysPos) && uniq(ysNeg) && Math.abs(P0.B[0] - P0.F[0]) + Math.abs(k) > 2 && Math.abs(P0.C[0]) > 1 && Math.abs(P0.A[0] - P0.G[0]) + Math.abs(P0.A[1] - P0.G[1]) > 2) break;
    }
    var sx = r.chance(0.5) ? 1 : -1, sy = r.chance(0.6) ? 1 : -1;
    var pts = {}; Object.keys(P0).forEach(function (L) { pts[L] = [P0[L][0] * sx || 0, P0[L][1] * sy || 0]; });
    pts.O = [0, 0];
    return { pts: pts, letters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'] };
  }
  function q2Graph(sh) {
    return HW.graph({ x: [-10, 10], y: [-10, 10], labels: 5, max: 360, aria: 'grid with points A to I',
      points: sh.letters.map(function (L) { return { x: sh.pts[L][0], y: sh.pts[L][1], label: L }; }).concat([{ x: 0, y: 0, label: 'O' }]) });
  }
  function moveWords(p) {
    var a = p[0] === 0 ? 'stay on the ' + t('y') + '-axis' : 'move ' + Math.abs(p[0]) + ' ' + (p[0] > 0 ? 'right' : 'left');
    var b = p[1] === 0 ? 'stay on the ' + t('x') + '-axis' : Math.abs(p[1]) + ' ' + (p[1] > 0 ? 'up' : 'down');
    return a + ', then ' + b;
  }
  function letterCheck(want, pts) {
    return function (resp) {
      var s = String(resp == null ? '' : resp).replace(/\\text\{([^}]*)\}/g, '$1').replace(/point/ig, '').replace(/[\s.()]/g, '').toUpperCase();
      if (!s) return form('empty', 'Type the letter of the point.');
      if (!/^[A-Z]$/.test(s)) return form('letter', 'Answer with the <b>letter</b> that names the point, for example ' + t('A') + '.');
      if (s === want) return ok();
      var q = pts[s], w = pts[want];
      if (!q) return form('no-point', 'There is no point ' + t(s) + ' on this grid — check the letter.');
      if (q[0] === w[1] && q[1] === w[0]) return wrong('pair-swap', 'Point ' + t(s) + ' is at ' + t(pt(q)) + ' — the numbers the other way round. Move along the ' + t('x') + '-axis first, then up or down.');
      return wrong('wrong-point', 'Point ' + t(s) + ' is at ' + t(pt(q)) + '. For ' + t(pt(w)) + ', start at the origin and ' + moveWords(w) + '.');
    };
  }

  /* ---------- Q3 shapes ---------- */
  var SHAPES = {
    house: { name: 'a pentagon shaped like a house (a rectangle with a triangular roof)',
      make: function (r) { var w = r.pick([4, 4, 6]), h = r.int(2, 4), rf = r.int(1, 3); return [[0, 0], [w, 0], [w, h], [w / 2, h + rf], [0, h]]; },
      wrong: function (v) { return [
        { html: 'a rectangle', why: 'Look at the point ' + t(pt(v[3])) + ': it sits above the top edge and makes a fifth corner — a roof.' },
        { html: 'a triangle', why: 'Count the corners of your drawing: the path turns at five points, not three.' },
        { html: 'a trapezoid', why: 'A trapezoid has four sides. Count the segments you drew.' }]; } },
    trapezoid: { name: 'a trapezoid (exactly one pair of parallel sides)',
      make: function (r) { var b = r.pick([6, 8]), c = r.int(1, 2), h = r.int(3, 5); return [[0, 0], [b, 0], [b - c, h], [c, h]]; },
      wrong: function (v) { return [
        { html: 'a parallelogram', why: 'Only the top and bottom are parallel: the two slanted sides lean in opposite directions.' },
        { html: 'a rectangle', why: 'The side from ' + t(pt(v[1])) + ' to ' + t(pt(v[2])) + ' is slanted, not vertical, so the corners aren’t right angles.' },
        { html: 'a pentagon', why: 'Count the corners: four points, so four sides.' }]; } },
    parallelogram: { name: 'a parallelogram (two pairs of parallel sides)',
      make: function (r) { var b = r.int(3, 5), s = r.int(1, 2), h = r.int(3, 4); return [[0, 0], [b, 0], [b + s, h], [s, h]]; },
      wrong: function (v) { return [
        { html: 'a trapezoid', why: 'Here <b>both</b> pairs of opposite sides are parallel — the two slanted sides lean the same way.' },
        { html: 'a rectangle', why: 'The side from ' + t(pt(v[1])) + ' to ' + t(pt(v[2])) + ' is slanted, so the corners aren’t right angles.' },
        { html: 'a kite', why: 'A kite has two pairs of equal sides next to each other. Here the <i>opposite</i> sides are equal and parallel.' }]; } },
    kite: { name: 'a kite (two pairs of equal sides next to each other)',
      make: function (r) { var w = r.int(2, 3), u = r.int(3, 4), v = r.int(1, 2); return [[w, 0], [2 * w, u], [w, u + v], [0, u]]; },
      wrong: function (v) { return [
        { html: 'a rhombus', why: 'In a rhombus all four sides are equal. Here the two lower sides are longer than the two upper sides.' },
        { html: 'a parallelogram', why: 'Opposite sides of this shape aren’t parallel.' },
        { html: 'a triangle', why: 'Count the corners: the path turns at four points.' }]; } }
  };

  /* ---------- Q4 dot pattern (arms from a centre dot) ---------- */
  var ARMS = { 2: [[-0.6, 0.8], [0.6, 0.8]], 3: [[-0.6, 0.8], [0.6, 0.8], [0, -1]], 4: [[-0.6, 0.8], [0.6, 0.8], [-0.6, -0.8], [0.6, -0.8]] };
  function dotFigure(a, k) {
    var s = 13, pts = [[0, 0]];
    ARMS[a].forEach(function (d) { for (var i = 1; i <= k; i++) pts.push([d[0] * i, d[1] * i]); });
    var xs = pts.map(function (p) { return p[0]; }), ys = pts.map(function (p) { return p[1]; });
    var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
    return { w: (x1 - x0) * s + 10, h: (y1 - y0) * s + 10, draw: function (ox, oy) { return pts.map(function (p) { return '<circle cx="' + (ox + 5 + (p[0] - x0) * s).toFixed(1) + '" cy="' + (oy + 5 + (y1 - p[1]) * s).toFixed(1) + '" r="3.4" fill="' + INK + '"/>'; }).join(''); } };
  }
  /* ---------- Q6 staircase ---------- */
  function stairFigure(D, w0) {
    var c = 13, W = (w0 + D - 1) * c, H = D * c;
    return { w: W, h: H, draw: function (ox, oy) {
      var s = '';
      for (var r = 1; r <= D; r++) for (var j = 0; j < w0 + D - r; j++) s += '<rect x="' + (ox + j * c) + '" y="' + (oy + H - r * c) + '" width="' + c + '" height="' + c + '" fill="#eef0f2" stroke="' + INK + '" stroke-width="1.2"/>';
      return s;
    } };
  }
  function stairP(D, w0) { return 4 * D + 2 * (w0 - 1); }
  function stairArea(D, w0) { var a = 0; for (var r = 1; r <= D; r++) a += w0 + D - r; return a; }

  /* ---------- variable pools (discrete / continuous) ---------- */
  var DISC = ['number of pets owned', 'number of siblings', 'number of correct answers on a quiz', 'number of books on a shelf', 'number of students in a class',
    'number of goals scored in a game', 'number of cars in a parking lot', 'number of pages in a book', 'number of eggs in a carton', 'number of tickets sold', 'number of rooms in a house', 'number of text messages sent in a day'];
  var CONT = ['weight of a truck', 'temperature outside', 'distance travelled', 'height of a plant', 'time taken to run a race', 'volume of water in a bathtub',
    'speed of a car', 'length of a snake', 'mass of a bag of apples', 'amount of rain that falls in a day', 'area of a lawn', 'time spent on homework'];
  var THEMES = [
    { c: ['the diameter of a tree trunk', 'the height of a tree'], d: ['the number of rings in a tree trunk', 'the number of trees in a forest'] },
    { c: ['the speed of a car', 'the volume of gas in a car’s tank'], d: ['the number of passengers in a car', 'the number of doors on a car'] },
    { c: ['the time left in a hockey period', 'the speed of the puck'], d: ['the number of goals scored', 'the number of fans in the arena'] },
    { c: ['the mass of tomatoes harvested', 'the height of a sunflower'], d: ['the number of seeds planted', 'the number of rows in the garden'] },
    { c: ['the time to swim 100 m', 'the temperature of the pool water'], d: ['the number of laps swum', 'the number of swimmers in a lane'] }];
  var ROMAN = ['i', 'ii', 'iii', 'iv'];

  /* ---------- quadrant / sign helpers for the extras ---------- */
  var QOPT = ['I', 'II', 'III', 'IV'];
  function quadMC(r, prompt, right, sol, hints, text, whyFn) {
    return mcCols(KP.mc(r, prompt, QOPT.map(function (q) { return { html: 'Quadrant ' + q, right: q === right, why: q === right ? null : (whyFn ? whyFn(q) : 'Quadrant ' + q + ' has signs ' + t(QSIGN[q]) + '. Check that against the conditions.') }; }), sol, hints, text, true));
  }

  var QUESTIONS = [
      /* ===================== Q1 ===================== */
      { num: '1', section: 'Part A — The Cartesian plane', stem: 'Complete each statement.', parts: [
        { id: '1a', level: 'LIM', make: function (r) {
          var first = r.chance(0.5);
          return vocabPart(r, 'The ' + (first ? '<b>first</b>' : '<b>second</b>') + ' number of an ordered pair is called the ______.', first ? 'x-coordinate' : 'y-coordinate', VOCAB,
            'In ' + t('(x, y)') + ' the first number is the ' + t('x') + '-coordinate (across) and the second is the ' + t('y') + '-coordinate (up or down).', 'vocab: ' + (first ? 'first' : 'second') + ' coordinate');
        } },
        { id: '1b', level: 'LIM', make: function (r) {
          return vocabPart(r, '______ are used to locate or plot a point on a Cartesian plane.', 'ordered pairs', VOCAB.filter(function (w) { return w !== 'coordinates'; }),
            'A point is located by an <b>ordered pair</b> ' + t('(x, y)') + ': move ' + t('x') + ' across, then ' + t('y') + ' up or down.', 'vocab: ordered pairs');
        } },
        { id: '1c', level: 'LIM', make: function (r) {
          return vocabPart(r, 'The two numbers in an ordered pair are together called the ______ of a point on the grid.', 'coordinates', VOCAB.filter(function (w) { return w !== 'ordered pairs'; }),
            'The two numbers together are the point’s <b>coordinates</b>.', 'vocab: coordinates');
        } },
        { id: '1d', level: 'LIM', make: function (r) {
          return vocabPart(r, 'The ' + t('x') + '-axis and the ' + t('y') + '-axis intersect at the ______.', 'origin', VOCAB.concat(['x-axis']),
            'The axes cross at the <b>origin</b>, ' + t('O(0, 0)') + '.', 'vocab: origin');
        } },
        { id: '1e', level: 'LIM', make: function (r) {
          return vocabPart(r, 'The Cartesian plane is divided into four ______.', 'quadrants', VOCAB,
            'The axes cut the plane into four <b>quadrants</b>, numbered I to IV counter-clockwise starting at the top right.', 'vocab: quadrants');
        } }] },
      /* ===================== Q2 ===================== */
      { num: '2', stem: function (sh) { return 'The following questions refer to the grid below.<br>' + q2Graph(sh); }, shared: q2Shared, parts: [
        { id: '2a', level: 'LIM', make: function (r, sh) {
          var quadPts = ['A', 'B', 'C', 'D', 'G', 'H', 'I'], pick = r.sample(quadPts, 2).concat([r.pick(['E', 'F'])]);
          var fl = pick.map(function (L, i) { return { label: ROMAN[i] + ')&nbsp;' + t(pt(sh.pts[L])), mode: 'text', placeholder: 'letter' }; });
          return KP.fields('Name the point represented by each of the following coordinates.', fl, pick.map(function (L) { return letterCheck(L, sh.pts); }), pick,
            pick.map(function (L, i) { return ROMAN[i] + ') ' + t(L); }).join('&nbsp;&nbsp; '),
            pick.map(function (L) { return t(pt(sh.pts[L])) + ': from the origin ' + moveWords(sh.pts[L]) + ' — point ' + t(L) + '.'; }).join('<br>'),
            ['Start at the origin. The first number tells you how far to move left or right, the second how far to move up or down.'], 'name the point: ' + pick.join(','));
        } },
        { id: '2b', level: 'BEG', make: function (r, sh) {
          var pick = ['C', 'G', 'F', 'O', 'H'].map(function (L) { return L; });
          var fl = pick.map(function (L, i) { return { label: ['i', 'ii', 'iii', 'iv', 'v'][i] + ')&nbsp;' + t(L), mode: 'math', keys: 'pairs', placeholder: '(x, y)' }; });
          var ch = pick.map(function (L) { var p = sh.pts[L]; return pairCheck(p[0], p[1]); });
          var p = KP.fields('List the coordinates of each point.', fl, ch, pick.map(function (L) { return pt(sh.pts[L]); }), pick.map(function (L) { return t(L + pt(sh.pts[L])); }).join(', '),
            pick.map(function (L) { var q = sh.pts[L]; return t(L + pt(q)) + (L === 'O' ? ': the origin.' : ': ' + moveWords(q) + '.'); }).join('<br>'),
            ['Write each point as ' + t('(x, y)') + ': across first, then up or down. A point on an axis has a ' + t('0') + ' in it.'], 'coordinates of C, G, F, O, H');
          p.bad = [pick.map(function (L) { var q = sh.pts[L]; return pt([q[1], q[0]]); })];
          return p;
        } },
        { id: '2c', level: 'BEG', make: function (r, sh) {
          var rows = ['A', 'B', 'C', 'D', 'G', 'H', 'I'], want = {};
          rows.forEach(function (L) { want[L] = quadOf(sh.pts[L]); });
          return KP.grid('Which quadrant does each point lie in?', rows.map(function (L) { return { id: L, html: t(L) }; }), QOPT.map(function (q) { return { id: q, html: q }; }), want,
            { colHead: 'Quadrant', why: function (row, got, w) {
              if ((w === 'II' && got === 'IV') || (w === 'IV' && got === 'II')) return { code: 'quad-clockwise', hint: 'Check point ' + t(row) + '. The quadrants are numbered <b>counter-clockwise</b>, starting with I at the top right: I ' + t('(+,+)') + ', II ' + t('(-,+)') + ', III ' + t('(-,-)') + ', IV ' + t('(+,-)') + '.' };
              return { code: 'quad-sign', hint: 'Check point ' + t(row) + ': look at the signs of its two coordinates. I ' + t('(+,+)') + ', II ' + t('(-,+)') + ', III ' + t('(-,-)') + ', IV ' + t('(+,-)') + '.' };
            } },
            QOPT.map(function (q) { var L = rows.filter(function (x) { return want[x] === q; }); return 'Quadrant ' + q + ' ' + t(QSIGN[q]) + ': ' + (L.length ? L.map(function (x) { return t(x + pt(sh.pts[x])); }).join(', ') : 'none'); }).join('<br>'),
            ['Quadrant I is top right; the numbering goes counter-clockwise.', 'Use the signs: I ' + t('(+,+)') + ', II ' + t('(-,+)') + ', III ' + t('(-,-)') + ', IV ' + t('(+,-)') + '.'], 'quadrants of the points');
        } },
        { id: '2d', level: 'BEG', make: function (r, sh) {
          var opts = sh.letters.concat(['O']);
          return selectPart('Which points lie <b>in between</b> quadrants (in no quadrant at all)? Tap every one.', opts, ['E', 'F', 'O'], function (extra, missing) {
            if (missing.indexOf('O') >= 0 && !extra.length) return { code: 'missed', hint: 'Don’t forget the origin ' + t('O(0, 0)') + ': it is on <b>both</b> axes.' };
            if (extra.length) return { code: 'picked-quadrant', hint: t(extra[0]) + ' is at ' + t(pt(sh.pts[extra[0]])) + ': neither coordinate is ' + t('0') + ', so it is inside a quadrant.' };
            return { code: 'missed', hint: 'A point is in no quadrant when it sits <b>on an axis</b> — one of its coordinates is ' + t('0') + '.' };
          }, 'Points on an axis belong to no quadrant: ' + t('E' + pt(sh.pts.E)) + ' is on the ' + t('y') + '-axis, ' + t('F' + pt(sh.pts.F)) + ' is on the ' + t('x') + '-axis, and ' + t('O(0, 0)') + ' is the origin.',
          ['Which points sit exactly on the ' + t('x') + '-axis or the ' + t('y') + '-axis?'], 'points on the axes');
        } },
        { id: '2e', sub: 'e i', level: 'BEG', make: function (r, sh) {
          var opts = sh.letters.concat(['O']);
          return selectPart('Which points have the same ' + t('x') + '-coordinate? Tap them.', opts, ['E', 'O'], function (extra, missing) {
            if (extra.some(function (L) { return sh.pts[L][1] === sh.pts.E[1] && L !== 'E'; })) return { code: 'same-y', hint: 'Those points share their <b>' + t('y') + '</b>-coordinate (the second number). The ' + t('x') + '-coordinate is the first number.' };
            if (missing.indexOf('O') >= 0) return { code: 'missed', hint: 'What is the ' + t('x') + '-coordinate of the origin ' + t('O') + '?' };
            return { code: 'set', hint: 'Write down the first number of every point and look for a repeat.' };
          }, t('E' + pt(sh.pts.E)) + ' and ' + t('O(0, 0)') + ' both have ' + t('x=0') + '. Every other point has a different ' + t('x') + '-coordinate.',
          ['Write down the first number of each point. Which value appears twice?'], 'same x-coordinate');
        } },
        { id: '2e2', sub: 'e ii', level: 'LIM', make: function (r, sh) {
          return KP.mc(r, 'What visual check shows that two points have the same ' + t('x') + '-coordinate?', [
            { html: 'They lie on the same <b>vertical</b> line.', right: true },
            { html: 'They lie on the same <b>horizontal</b> line.', why: 'Points on a horizontal line share their <b>' + t('y') + '</b>-coordinate (same height).' },
            { html: 'They are the same distance from the origin.', why: t('(3, 4)') + ' and ' + t('(5, 0)') + ' are both 5 units from the origin, but their ' + t('x') + '-coordinates differ.' },
            { html: 'They are in the same quadrant.', why: 'Many points share a quadrant without sharing an ' + t('x') + '-coordinate.' }],
            'The ' + t('x') + '-coordinate tells how far across a point is. Points that are the same distance across sit directly above or below each other — on the same <b>vertical</b> line.', ['The ' + t('x') + '-coordinate measures left–right position.'], 'visual check same x');
        } },
        { id: '2f', sub: 'f i', level: 'EMG', make: function (r, sh) {
          var opts = sh.letters.concat(['O']), want = ['B', 'C', 'E', 'F', 'O'];
          return selectPart('Which points share their ' + t('y') + '-coordinate with at least one other point? Tap every one.', opts, want, function (extra, missing) {
            if (missing.indexOf('F') >= 0 || missing.indexOf('O') >= 0) return { code: 'missed', hint: 'There are <b>two</b> groups. Look at the points on the ' + t('x') + '-axis: what is their ' + t('y') + '-coordinate?' };
            if (extra.length) return { code: 'extra', hint: t(extra[0] + pt(sh.pts[extra[0]])) + ' doesn’t share its ' + t('y') + '-coordinate (the second number) with any other point.' };
            return { code: 'missed', hint: 'Write down the second number of every point and look for repeats.' };
          }, t('B, C') + ' and ' + t('E') + ' all have ' + t('y=' + sh.pts.E[1]) + ', and ' + t('F') + ' and ' + t('O') + ' both have ' + t('y=0') + '.',
          ['Write down the second number of each point. Which values appear more than once?'], 'same y-coordinate');
        } },
        { id: '2f2', sub: 'f ii', level: 'LIM', make: function (r, sh) {
          return KP.mc(r, 'What visual check shows that points have the same ' + t('y') + '-coordinate?', [
            { html: 'They lie on the same <b>horizontal</b> line.', right: true },
            { html: 'They lie on the same <b>vertical</b> line.', why: 'Points on a vertical line share their <b>' + t('x') + '</b>-coordinate.' },
            { html: 'They lie on a line through the origin.', why: t('(1, 1)') + ' and ' + t('(3, 3)') + ' are on a line through the origin, but their ' + t('y') + '-coordinates differ.' },
            { html: 'They are in the same quadrant.', why: 'Many points share a quadrant without sharing a ' + t('y') + '-coordinate.' }],
            'The ' + t('y') + '-coordinate tells the height of a point. Points at the same height lie on the same <b>horizontal</b> line.', ['The ' + t('y') + '-coordinate measures up–down position.'], 'visual check same y');
        } }] },
      /* ===================== Q3 ===================== */
      { num: '3', stem: '', parts: [
        { id: '3', level: 'BEG', make: function (r) {
          var fam = r.pick(['house', 'house', 'trapezoid', 'parallelogram', 'kite']), S = SHAPES[fam], v0 = S.make(r);
          var ox = r.pick([-2, -1, 0, 0]), oy = r.pick([-2, -1, 0, 0]), v = v0.map(function (p) { return [p[0] + ox, p[1] + oy]; });
          var path = v.map(function (p) { return t(pt(p)); }).join(' to ') + ' and back to ' + t(pt(v[0]));
          var xs = v.map(function (p) { return p[0]; }), ys = v.map(function (p) { return p[1]; });
          var g = HW.graph({ x: [Math.min(-2, Math.min.apply(null, xs) - 1), Math.max.apply(null, xs) + 1], y: [Math.min(-2, Math.min.apply(null, ys) - 1), Math.max.apply(null, ys) + 1], labels: 2, max: 240,
            segs: [{ pts: v.concat([v[0]]) }], points: v.map(function (p) { return { x: p[0], y: p[1] }; }), aria: 'the plotted figure' });
          return KP.mc(r, 'Plot the following points, in order, on a grid and join each point to the next with a straight line segment: ' + path + '. What geometric figure do the points outline?',
            [{ html: S.name, right: true }].concat(S.wrong(v)), g + '<br>The segments outline ' + S.name + '.', ['Sketch a grid on paper, plot the points in order and join them.', 'Count the corners, then check which sides are parallel.'], 'plot and name: ' + fam);
        } }] },
      /* ===================== Q4 ===================== */
      { num: '4', section: 'Part B — Growing patterns: table, graph and equation', stem: function (sh) {
          var shape = sh.a === 2 ? 'V' : sh.a === 3 ? 'Y' : 'X';
          return figRow([1, 2, 3].map(function (n) { return dotFigure(sh.a, sh.m - 1 + n); }), ['Figure 1', 'Figure 2', 'Figure 3'], { max: 380, label: shape + '-shaped dot pattern' }) +
            '<br>A ' + shape + '-shaped pattern of dots is shown. Figure ' + t('1') + ' has ' + t(sh.S(1)) + ' dots: one ' + (sh.a === 2 ? 'at the bottom of the V' : 'in the centre, where the arms meet') + ' and ' + t(sh.m) + ' on each ' + (sh.a === 2 ? '' : 'of the ' + sh.a + ' ') + 'arm' + (sh.a === 2 ? '' : 's') + '. Each new figure adds one more dot to the end of each arm. Let ' + t('N') + ' be the figure number and ' + t('S') + ' the number of dots.';
        },
        shared: function (r) {
          var a = r.pick([2, 2, 3, 4]), m = r.pick([1, 1, 2]), b = a * (m - 1) + 1;
          return { a: a, m: m, b: b, S: function (N) { return a * N + b; }, f50: r.int(30, 80), Ng: r.int(40, 90) };
        },
        parts: [
          { id: '4a', level: 'BEG', outcome: 'RF2', make: function (r, sh) {
            return tablePart('Complete the table: the number of dots, ' + t('S') + ', for each figure number.', 'N', [1, 2, 3, 4, 5], sh.S, function (N, v) {
              if (v === sh.a * N) return { code: 'forgot-centre', hint: 'Figure ' + N + ': don’t forget the dot ' + (sh.a === 2 ? 'at the bottom of the V' : 'in the centre') + '.' };
              if (v === sh.S(N + 1) || v === sh.S(N - 1)) return { code: 'off-by-one', hint: 'That is the count for Figure ' + (v === sh.S(N + 1) ? N + 1 : N - 1) + '. Start from Figure 1 with ' + sh.S(1) + ' dots.' };
              if (v === sh.S(1) + (N - 1)) return { code: 'step-wrong', hint: 'Each new figure adds one dot to <b>each</b> arm — that is ' + sh.a + ' dots per figure.' };
              return null;
            }, 'Figure 1 has ' + t(sh.S(1)) + ' dots and each figure adds ' + t(sh.a) + ' (one per arm): ' + [1, 2, 3, 4, 5].map(function (N) { return t(sh.S(N)); }).join(', ') + '.',
            ['Count the dots in Figures 1–3, then keep adding the same amount.', 'How many arms are there? Each one gets one more dot per figure.'], 'table S=' + lin(sh.a, sh.b, 'N'));
          } },
          { id: '4b', level: 'BEG', make: function (r, sh) {
            var Ns = [1, 2, 3, 4, 5], o = { xName: 'N', yName: 'S' };
            var right = patternGraph(Ns.map(function (N) { return [N, sh.S(N)]; }), o);
            var joined = patternGraph(Ns.map(function (N) { return [N, sh.S(N)]; }), Object.assign({ join: [[1, sh.S(1)], [5, sh.S(5)]] }, o));
            var noC = patternGraph(Ns.map(function (N) { return [N, sh.a * N]; }), o);
            var shift = patternGraph(Ns.map(function (N) { return [N, sh.S(N + 1)]; }), o);
            return mcCols(KP.mc(r, 'Which graph represents the data from the table?', [
              { html: right, right: true },
              { html: joined, why: 'The points are right, but they shouldn’t be joined: there is no Figure 2.5, so the in-between values have no meaning.' },
              { html: noC, why: 'Check Figure 1: it has ' + sh.S(1) + ' dots, so its point is ' + t(pt([1, sh.S(1)])) + '.' },
              { html: shift, why: 'Check Figure 1: its point should be ' + t(pt([1, sh.S(1)])) + '. This graph is one figure ahead.' }],
              'Plot ' + Ns.map(function (N) { return t(pt([N, sh.S(N)])); }).join(', ') + ' and leave them as separate points (the figure number is a whole number).',
              ['Find the point for Figure 1 first: ' + t('(1, S)') + '.'], 'graph of S=' + lin(sh.a, sh.b, 'N')));
          } },
          { id: '4c', level: 'EMG', make: function (r, sh) {
            return KP.mc(r, 'Does it make sense to join the points with a straight line?', [
              { html: 'No — the figure number is a whole number (there is no Figure 2.5), so the data are <b>discrete</b> and in-between values have no meaning.', right: true },
              { html: 'Yes — the points lie in a straight line.', why: 'Lining up is not the reason to join. Would “Figure 2.5” or “' + (sh.S(2) + sh.a / 2) + ' dots” mean anything?' },
              { html: 'Yes — the number of dots can be any value.', why: 'Can a figure have ' + (sh.S(2) + 0.5) + ' dots? Dots are counted in whole numbers.' },
              { html: 'No — the points do not lie in a straight line.', why: 'They do lie on a line (the pattern adds the same amount each time). The reason not to join is something else.' }],
              'The figure number and the number of dots can only be whole numbers. There is no Figure 2.5, so the variables are <b>discrete</b>: leave the points unconnected.', ['Is there such a thing as Figure 2.5?'], 'join? discrete pattern');
          } },
          { id: '4d', level: 'EMG', make: function (r, sh) {
            var a = sh.a, b = sh.b, S1 = sh.S(1);
            var say = function (p, q) { return (p === 1 ? 'the figure number' : times(p) + ' the figure number') + (q ? ', plus ' + q : ''); };
            var cand = [[1, a, 'That adds only one dot per figure. Each figure adds ' + a + '.'], [a, S1, 'Test Figure 1: ' + times(a) + ' 1, plus ' + S1 + ' is ' + (a + S1) + ', not ' + S1 + '.'],
              [S1, 0, 'Test Figure 2: ' + times(S1) + ' 2 is ' + 2 * S1 + ', but Figure 2 has ' + sh.S(2) + ' dots.'], [a, 0, 'Test Figure 1: ' + times(a) + ' 1 is ' + a + ', but Figure 1 has ' + S1 + ' dots. Something is added.'],
              [b, a, 'Test Figure 2: that gives ' + (2 * b + a) + ', but Figure 2 has ' + sh.S(2) + ' dots.']];
            var seen = {}; seen[a + ',' + b] = 1; var opts = [{ html: 'The number of dots is ' + say(a, b) + '.', right: true }];
            r.shuffle(cand).forEach(function (c) { if (opts.length < 4 && !seen[c[0] + ',' + c[1]]) { seen[c[0] + ',' + c[1]] = 1; opts.push({ html: 'The number of dots is ' + say(c[0], c[1]) + '.', why: c[2] }); } });
            return KP.mc(r, 'Which statement describes the relationship between the number of dots and the figure number?', opts,
              'Each figure adds ' + t(a) + ' dots, so the count goes up by ' + a + ' per figure: ' + t(a + 'N') + '. Figure 1 has ' + t(S1) + ' = ' + t(a + '(1)+' + b) + ', so the number of dots is ' + say(a, b) + '.', ['Test each statement on Figures 1 and 2.'], 'describe S=' + lin(a, b, 'N'));
          } },
          { id: '4e', level: 'EMG', outcome: 'RF2', make: function (r, sh) {
            var a = sh.a, b = sh.b, S1 = sh.S(1);
            return eqPart('Write an equation that can be used to determine the number of dots, ' + t('S') + ', if we know the figure number, ' + t('N') + '.', 'S', linP(a, b, 'N'), lin(a, b, 'N'), [
              { is: linP(a, 0, 'N'), code: 'no-constant', hint: 'Test it on Figure 1: ' + t(a + '(1)=' + a) + ', but Figure 1 has ' + S1 + ' dots. What has to be added?' },
              { is: linP(a, S1, 'N'), code: 'first-term', hint: 'Test it on Figure 1: ' + t(a + '(1)+' + S1 + '=' + (a + S1)) + ', not ' + S1 + '. The constant is the count for a “Figure 0”: ' + t(S1 + '-' + a + '=' + b) + '.' },
              { is: linP(1, a, 'N'), code: 'step-as-const', hint: 'The number added each figure (' + a + ') multiplies ' + t('N') + '; it isn’t added on.' },
              { is: linP(S1, 0, 'N'), code: 'times-first', hint: 'Test it on Figure 2: ' + t(S1 + '(2)=' + 2 * S1) + ', but Figure 2 has ' + sh.S(2) + ' dots.' },
              { is: linP(b, a, 'N'), code: 'swapped-coef', hint: 'Your numbers are swapped: the amount added per figure, ' + a + ', goes in front of ' + t('N') + '.' }],
              'The count rises by ' + t(a) + ' per figure, so ' + t('S=' + a + 'N+\\square') + '. Figure 1: ' + t(S1 + '=' + a + '(1)+\\square') + ', so the constant is ' + t(b) + '.<br>' + t('S=' + lin(a, b, 'N')) + '. Check: ' + t('N=5') + ' gives ' + t(a + '(5)+' + b + '=' + sh.S(5)) + ' ✓',
              ['How many dots are added each figure? That number goes in front of ' + t('N') + '.', 'Then test Figure 1 to find the number to add.'], 'equation S=' + lin(a, b, 'N'), { good: [b + '+' + a + 'N'] });
          } },
          { id: '4f', level: 'BEG', make: function (r, sh) {
            var n = sh.f50, ans = sh.S(n);
            return KP.number('Use the equation to determine the number of dots in Figure ' + t(n) + '.', ans, function (v) {
              if (v === sh.a * n) return { code: 'no-constant', hint: 'You found ' + t(sh.a + '(' + n + ')') + '. Now add the ' + t(sh.b) + '.' };
              if (v === sh.S(1) * n) return { code: 'times-first', hint: 'Use the equation ' + t('S=' + lin(sh.a, sh.b, 'N')) + ' — multiplying by the Figure 1 count doesn’t work.' };
              if (v === n + sh.a || v === n * sh.a + sh.S(1)) return { code: 'value', hint: 'Substitute ' + t('N=' + n) + ' into ' + t('S=' + lin(sh.a, sh.b, 'N')) + '.' };
              return null;
            }, t('S=' + sh.a + '(' + n + ')+' + sh.b + '=' + (sh.a * n) + '+' + sh.b + '=' + ans) + ' dots.', ['Substitute ' + t('N=' + n) + ' into your equation.'], 'S(' + n + ')');
          } },
          { id: '4g', level: 'EMG', make: function (r, sh) {
            var N = sh.Ng, Sv = sh.S(N), a = sh.a, b = sh.b;
            return KP.number('Use the equation to determine the figure number if there are ' + t(Sv) + ' dots.', N, function (v) {
              if (feq(v, (Sv + b) / a)) return { code: 'add-not-sub', hint: 'To undo the “' + t('+' + b) + '”, <b>subtract</b> ' + b + ' from both sides first.' };
              if (feq(v, Sv - b)) return { code: 'no-divide', hint: 'You have ' + t(a + 'N=' + (Sv - b)) + '. Now divide both sides by ' + a + '.' };
              if (feq(v, Sv / a)) return { code: 'no-subtract', hint: 'Subtract the ' + t(b) + ' before you divide by ' + a + '.' };
              if (v === a * Sv + b) return { code: 'sub-wrong-var', hint: t(Sv) + ' is the number of dots, ' + t('S') + ', not the figure number. Solve ' + t(Sv + '=' + lin(a, b, 'N')) + '.' };
              return null;
            }, t(Sv + '=' + lin(a, b, 'N')) + '<br>' + t(a + 'N=' + (Sv - b)) + '<br>' + t('N=' + N) + ' (Figure ' + N + ').', ['Put ' + t('S=' + Sv) + ' into the equation and solve for ' + t('N') + '.', 'Undo the adding first, then the multiplying.'], 'N when S=' + Sv);
          } }] },
      /* ===================== Q5 ===================== */
      { num: '5', stem: function (sh) {
          return 'A taxi company charges a fixed pickup fee plus an additional amount for each kilometre travelled. The table shows the fare, ' + t('F') + ' dollars, for a trip of ' + t('d') + ' kilometres.' +
            HW.valueTable([['\\(d\\) (km)'].concat(sh.ds), ['\\(F\\) ($)'].concat(sh.ds.map(function (d) { return money(sh.fare(d)); }))]);
        },
        shared: function (r) {
          var feeC = r.pick([250, 300, 325, 350, 350, 375, 400, 450]), rateC = r.pick([80, 90, 110, 120, 120, 130, 140, 150, 160]);
          var dq = r.pick([1, 3, 5, 5, 7]), dd = r.pick([1, 3, 5, 7, 7].filter(function (x) { return x !== dq; }));
          var fare = function (d) { return feeC + rateC * d; };
          return { feeC: feeC, rateC: rateC, dq: dq, dd: dd, ds: [0, 2, 4, 6, 8], fare: fare };
        },
        parts: [
          { id: '5a', level: 'BEG', make: function (r, sh) {
            var ds = sh.ds, f = function (d) { return sh.fare(d) / 100; }, ymax = Math.ceil((f(8) + 0.5) / 2) * 2;
            var G = function (pts, line) { return HW.graph({ x: [0, 9], y: [0, ymax], grid: 1, labels: 1, labelsX: 2, labelsY: ymax > 14 ? 4 : 2, gridY: ymax > 14 ? 2 : 1, unitX: 13, unitY: 105 / ymax, xName: 'd', yName: 'F', firstQuadrant: true, max: 200,
              points: pts.map(function (p) { return { x: p[0], y: p[1] }; }), segs: line ? [{ pts: line }] : [], aria: 'fare graph' }); };
            var good = ds.map(function (d) { return [d, f(d)]; });
            return mcCols(KP.mc(r, 'Which graph represents the data?', [
              { html: G(good, [[0, f(0)], [8, f(8)]]), right: true },
              { html: G(good, null), why: 'The points are right, but distance can be any value (e.g. ' + t('3.6') + ' km), so the points should be joined.' },
              { html: G(ds.map(function (d) { return [d, sh.rateC * d / 100]; }), [[0, 0], [8, sh.rateC * 8 / 100]]), why: 'Check the first column of the table: at ' + t('d=0') + ' the fare is already ' + t('\\$' + money(sh.feeC)) + '.' },
              { html: G(ds.map(function (d, i) { return [i, f(d)]; }), [[0, f(0)], [4, f(8)]]), why: 'Check the ' + t('d') + '-values: the table goes ' + t('0, 2, 4, 6, 8') + ', not ' + t('0, 1, 2, 3, 4') + '.' }],
              'Plot ' + good.map(function (p) { return t('(' + p[0] + ', ' + p[1].toFixed(2) + ')'); }).join(', ') + ' and join them with a straight line (distance and fare are continuous).',
              ['Find the point for ' + t('d=0') + ' first.'], 'graph of taxi fares'));
          } },
          { id: '5b', level: 'EMG', make: function (r, sh) {
            return KP.mc(r, 'Does it make sense to join the points together with a straight line?', [
              { html: 'Yes — a trip can be any distance (e.g. ' + t('3.6') + ' km), so the variables are <b>continuous</b> and every in-between value has meaning.', right: true },
              { html: 'No — the table only gives even distances.', why: 'The table shows only a few trips, but a taxi can travel ' + t('3') + ' km or ' + t('3.6') + ' km. Does that in-between value make sense?' },
              { html: 'Yes — because the points lie in a straight line.', why: 'Lining up isn’t the reason: the matchstick points line up too, and they are not joined. Think about the in-between values.' },
              { html: 'No — the fare doesn’t start at ' + t('0') + '.', why: 'Where the graph starts doesn’t decide whether to join it. Think about whether a trip of ' + t('3.6') + ' km makes sense.' }],
              'Distance can take any value, and so can the fare, so the variables are <b>continuous</b>: join the points.', ['Could a taxi ride be ' + t('3.6') + ' km long?'], 'join? taxi');
          } },
          { id: '5c', level: 'BEG', make: function (r, sh) {
            var f = function (d) { return sh.fare(d) / 100; }, ymax = Math.ceil((f(8) + 0.5) / 2) * 2, d = sh.dq, ex0 = f(d);
            var g = HW.graph({ x: [0, 9], y: [0, ymax], grid: 1, labels: 1, labelsX: 1, labelsY: 2, unitX: 34, unitY: 260 / ymax, xName: 'd', yName: 'F', firstQuadrant: true, xTitle: 'Distance, d (km)', yTitle: 'Fare, F ($)', max: 360,
              points: sh.ds.map(function (x) { return { x: x, y: f(x) }; }), segs: [{ pts: [[0, f(0)], [8, f(8)]] }], aria: 'graph of fare against distance' });
            return { prompt: g + '<br>Use the graph to estimate the fare for a trip of ' + t(d) + ' km.', input: { type: 'number', before: '$' }, check: estCheck(ex0, 0.3, function (v) {
                if (Math.abs(v - f(d - 1)) < 0.2 || Math.abs(v - f(d + 1)) < 0.2) return { code: 'neighbour', hint: 'That is the fare near ' + t('d=' + (Math.abs(v - f(d - 1)) < 0.2 ? d - 1 : d + 1)) + '. Go up from ' + t('d=' + d) + ' on the horizontal axis to the line, then across.' };
                if (Math.abs(v - sh.rateC * d / 100) < 0.2) return { code: 'no-fee', hint: 'Read the graph itself — the line starts at ' + t('\\$' + money(sh.feeC)) + ', not at ' + t('0') + '.' };
                return null;
              }, 'Go up from ' + t('d=' + d) + ' to the line, then straight across to the ' + t('F') + '-axis.'), key: money(sh.fare(d)), answer: t('\\approx\\$' + money(sh.fare(d))),
              solution: t('d=' + d) + ' is halfway between ' + t('d=' + (d - 1)) + ' and ' + t('d=' + (d + 1)) + ' on the line. Up to the line and across: ' + t('F\\approx\\$' + money(sh.fare(d))) + '. (Any reading close to this is fine.)',
              hints: ['Find ' + t(d) + ' on the horizontal axis, go up to the line, then across.'], text: 'estimate fare at ' + d + ' km', good: ['\\$' + money(sh.fare(d)), String(Math.round((ex0 + 0.2) * 10) / 10)], bad: [money(sh.fare(d) + 60)] };
          } },
          { id: '5d', level: 'EMG', make: function (r, sh) {
            var Fv = sh.fare(sh.dd);
            return { prompt: 'Use the graph to estimate the distance travelled if the fare was ' + t('\\$' + money(Fv)) + '.', input: { type: 'number', after: 'km' }, check: estCheck(sh.dd, 0.3, function (v) {
                if (Math.abs(v - Fv / 100) < 0.05) return { code: 'value', hint: 'That is the fare. Find ' + t('\\$' + money(Fv)) + ' on the vertical axis, go across to the line, then <b>down</b> to read the distance.' };
                if (Math.abs(v - Fv / sh.rateC) < 0.25) return { code: 'no-fee', hint: 'Read the graph itself rather than dividing by the rate — the fee at ' + t('d=0') + ' is part of the fare.' };
                return null;
              }, 'Find ' + t(money(Fv)) + ' on the ' + t('F') + '-axis, go across to the line, then down to the ' + t('d') + '-axis.'), key: String(sh.dd), answer: t('\\approx ' + sh.dd) + ' km',
              solution: t('\\$' + money(Fv)) + ' lies between the fares for ' + t('d=' + (sh.dd - 1)) + ' and ' + t('d=' + (sh.dd + 1)) + '. Across to the line and down: ' + t('d\\approx ' + sh.dd) + ' km.',
              hints: ['This time start on the vertical (fare) axis.'], text: 'estimate distance for fare ' + money(Fv), good: [String(sh.dd + 0.2)], bad: [String(sh.dd + 1)] };
          } },
          { id: '5e', level: 'PRG', outcome: 'RF2', make: function (r, sh) {
            var fee = [sh.feeC, 100], rate = [sh.rateC, 100], T = P.add(P.num(fee), P.mono(rate, { d: 1 }));
            var mk = function (c, k) { return P.add(P.num([k, 100]), P.mono([c, 100], { d: 1 })); };
            return eqPart('Write an equation expressing ' + t('F') + ' in terms of ' + t('d') + '.', 'F', T, money(sh.feeC) + '+' + money(sh.rateC) + 'd', [
              { is: mk(2 * sh.rateC, sh.feeC), code: 'per-two', hint: 'The fare rises ' + t('\\$' + money(2 * sh.rateC)) + ' every <b>2</b> km. What is the cost for <b>one</b> kilometre?' },
              { is: P.mono(rate, { d: 1 }), code: 'no-fee', hint: 'Test ' + t('d=0') + ': the table says ' + t('\\$' + money(sh.feeC)) + ', but your equation gives ' + t('0') + '.' },
              { is: P.mono([2 * sh.rateC, 100], { d: 1 }), code: 'no-fee', hint: 'Two things to fix: test ' + t('d=0') + ' (the fare is ' + t('\\$' + money(sh.feeC)) + '), and find the cost per <b>one</b> kilometre.' },
              { is: P.add(P.num(rate), P.mono(fee, { d: 1 })), code: 'swapped-coef', hint: 'Your numbers are swapped: the cost per kilometre multiplies ' + t('d') + ', and the pickup fee is added on.' },
              { is: mk(sh.rateC, sh.fare(2)), code: 'first-term', hint: 'Test ' + t('d=0') + ': the fare should be ' + t('\\$' + money(sh.feeC)) + '. The starting value is the fare when ' + t('d=0') + '.' }],
              'The fare rises ' + t('\\$' + money(2 * sh.rateC)) + ' every ' + t('2') + ' km, so ' + t('\\$' + money(2 * sh.rateC) + '\\div 2=\\$' + money(sh.rateC)) + ' per km. At ' + t('d=0') + ' the fare is ' + t('\\$' + money(sh.feeC)) + '.<br>' + t('F=' + money(sh.feeC) + '+' + money(sh.rateC) + 'd'),
              ['What is the fare when ' + t('d=0') + '? That is the starting value.', 'How much does the fare go up for <b>each</b> kilometre? (The table goes up in steps of 2 km.)'], 'equation F=' + money(sh.feeC) + '+' + money(sh.rateC) + 'd',
              { good: [money(sh.rateC) + 'd+' + money(sh.feeC), (sh.rateC / 100) + 'd+' + (sh.feeC / 100)] });
          } },
          { id: '5f', level: 'EMG', make: function (r, sh) {
            var dq = sh.dq, Fq = sh.fare(dq), Fv = sh.fare(sh.dd), fee = money(sh.feeC), rate = money(sh.rateC);
            var fl = [{ label: t('F') + ' when ' + t('d=' + dq), mode: 'number', before: '$' }, { label: t('d') + ' when ' + t('F=' + money(Fv)), mode: 'number', after: 'km' }];
            return KP.fields('Use the equation ' + t('F=' + fee + '+' + rate + 'd') + ' to check your estimates in (c) and (d).', fl, [
              numCheck(Fq / 100, function (v) { return feq(v, sh.rateC * dq / 100) ? { code: 'no-fee', hint: 'Add the pickup fee ' + t('\\$' + fee) + '.' } : feq(v, (sh.feeC + sh.rateC) * dq / 100) ? { code: 'order-ops', hint: 'Multiply ' + t(rate + '\\times ' + dq) + ' first, then add ' + t(fee) + '.' } : null; }),
              numCheck(sh.dd, function (v) { return feq(v, Fv / sh.rateC) ? { code: 'no-subtract', hint: 'Subtract the fee ' + t(fee) + ' first, then divide by ' + t(rate) + '.' } : feq(v, (Fv + sh.feeC) / sh.rateC) ? { code: 'add-not-sub', hint: 'To undo the “' + t('+' + fee) + '”, subtract it.' } : null; })],
              [money(Fq), String(sh.dd)], t('\\$' + money(Fq)) + ' and ' + t(sh.dd) + ' km',
              t('d=' + dq) + ': ' + t('F=' + fee + '+' + rate + '(' + dq + ')=' + fee + '+' + money(sh.rateC * dq) + '=' + money(Fq)) + ' ✓<br>' + t('F=' + money(Fv)) + ': ' + t(money(Fv) + '=' + fee + '+' + rate + 'd') + ', ' + t(rate + 'd=' + money(Fv - sh.feeC)) + ', ' + t('d=' + sh.dd) + ' km ✓ — both match the estimates.',
              ['Substitute for ' + t('d') + ' in the first box; solve for ' + t('d') + ' in the second.'], 'check estimates with F equation');
          } },
          { id: '5g', level: 'PRG', make: function (r, sh) {
            var fee = money(sh.feeC), rate = money(sh.rateC);
            return KP.mc(r, 'In the context of the question, what do the values ' + t(fee) + ' and ' + t(rate) + ' represent in the equation ' + t('F=' + fee + '+' + rate + 'd') + '?', [
              { html: t(fee) + ' is the fixed pickup fee (the fare when ' + t('d=0') + '); ' + t(rate) + ' is the cost for each kilometre.', right: true },
              { html: t(fee) + ' is the cost for each kilometre; ' + t(rate) + ' is the pickup fee.', why: 'Which number is multiplied by the distance? That one is the cost per kilometre.' },
              { html: t(fee) + ' is the pickup fee; ' + t(rate) + ' is the extra cost for every 2 km.', why: 'Use the table: the fare rises ' + t('\\$' + money(2 * sh.rateC)) + ' every 2 km, so ' + t(rate) + ' is for <b>one</b> kilometre.' },
              { html: t(fee) + ' is the fare for a 1 km trip; ' + t(rate) + ' is the cost for each kilometre.', why: 'Substitute ' + t('d=1') + ': the fare is ' + t(fee + '+' + rate + '=' + money(sh.feeC + sh.rateC)) + '. When is the fare exactly ' + t(fee) + '?' }],
              t(fee) + ' is the constant: the fare when ' + t('d=0') + ' — the fixed <b>pickup fee</b>. ' + t(rate) + ' multiplies ' + t('d') + ': the <b>cost per kilometre</b> (the rate of change).', ['Which number is the fare when ' + t('d=0') + '? Which one is multiplied by ' + t('d') + '?'], 'meaning of fee and rate');
          } }] },
      /* ===================== Q6 ===================== */
      { num: '6', stem: function (sh) {
          return 'A staircase pattern is built from ' + t('1') + ' cm by ' + t('1') + ' cm squares. Each new diagram is one step higher and one square wider than the one before.<br>' +
            figRow([1, 2, 3].map(function (D) { return stairFigure(D, sh.w0); }), ['Diagram 1', 'Diagram 2', 'Diagram 3'], { max: 360, label: 'staircase pattern' });
        },
        shared: function (r) { return { w0: r.pick([1, 2, 2, 3]), D10: r.int(8, 15), Dt: r.int(12, 30) }; },
        parts: [
          { id: '6a', level: 'BEG', outcome: 'RF2', make: function (r, sh) {
            var Pf = function (D) { return stairP(D, sh.w0); };
            return tablePart('Find the perimeter of Diagrams 1–3 by counting edges, then extend the pattern: the perimeter ' + t('P') + ' (cm) for each diagram number ' + t('D') + '.', 'D', [1, 2, 3, 4, 5], Pf, function (D, v) {
              if (v === stairArea(D, sh.w0)) return { code: 'area-count', hint: 'Diagram ' + D + ': that is the number of squares (the area). The perimeter is the number of unit edges around the <b>outside</b>.' };
              if (v === Pf(D + 1) || v === Pf(D - 1)) return { code: 'off-by-one', hint: 'That is the perimeter of Diagram ' + (v === Pf(D + 1) ? D + 1 : D - 1) + '. Start from Diagram 1: ' + Pf(1) + ' cm.' };
              return null;
            }, 'Count the edges around the outside: Diagram 1 has ' + t(Pf(1)) + ', and each diagram adds ' + t('4') + ' (one step up and one square across add 2 edges each way): ' + [1, 2, 3, 4, 5].map(function (D) { return t(Pf(D)); }).join(', ') + '.',
            ['Count only the edges on the outside of the shape.', 'A staircase has the same perimeter as the rectangle around it: ' + t('2\\times(\\text{width}+\\text{height})') + '.'], 'staircase perimeters w0=' + sh.w0);
          } },
          { id: '6b', level: 'EMG', make: function (r, sh) {
            return KP.mc(r, 'Does it make sense to join the points ' + t('(D, P)') + ' with a straight line?', [
              { html: 'No — the diagram number is a whole number, so the data are <b>discrete</b>.', right: true },
              { html: 'Yes — perimeter is a length, so it is continuous.', why: 'Perimeter can be any length in general, but here it only comes from whole diagrams. Is there a Diagram 2.5?' },
              { html: 'Yes — the perimeter goes up by the same amount each time.', why: 'A constant increase means the points line up — it doesn’t make in-between diagrams exist.' },
              { html: 'No — perimeters are always even numbers.', why: 'Being even isn’t the reason. Think about the diagram numbers between ' + t('2') + ' and ' + t('3') + '.' }],
              'There is no Diagram 2.5: the diagram number is a whole number, so the variables are <b>discrete</b>. Leave the points unconnected.', ['Is there such a thing as Diagram 2.5?'], 'join? staircase');
          } },
          { id: '6c', level: 'EMG', outcome: 'RF2', make: function (r, sh) {
            var c = 2 * (sh.w0 - 1), P1 = stairP(1, sh.w0);
            return eqPart('Write an equation that can be used to determine the perimeter, ' + t('P') + ', if we know the diagram number, ' + t('D') + '.', 'P', linP(4, c, 'D'), lin(4, c, 'D'), [
              { is: linP(4, P1, 'D'), code: 'first-term', hint: 'Test Diagram 1: ' + t('4(1)+' + P1 + '=' + (4 + P1)) + ', not ' + P1 + '. The constant is what a “Diagram 0” would have: ' + t(P1 + '-4=' + c) + '.' },
              { is: linP(P1, 0, 'D'), code: 'times-first', hint: 'Test Diagram 2: ' + t(P1 + '(2)=' + 2 * P1) + ', but the perimeter of Diagram 2 is ' + stairP(2, sh.w0) + '.' },
              { is: linP(1, 4, 'D'), code: 'step-as-const', hint: 'The increase per diagram (4) multiplies ' + t('D') + '.' },
              c ? { is: linP(4, 0, 'D'), code: 'no-constant', hint: 'Test Diagram 1: ' + t('4(1)=4') + ', but the perimeter is ' + P1 + '.' } : null,
              c ? { is: linP(c, 4, 'D'), code: 'swapped-coef', hint: 'Swapped: the increase per diagram, 4, goes in front of ' + t('D') + '.' } : null],
              'From the table, ' + t('P') + ' rises by ' + t('4') + ' per diagram, so ' + t('P=4D+\\square') + '. Diagram 1: ' + t(P1 + '=4(1)+\\square') + ', so the constant is ' + t(c) + '.<br>' + t('P=' + lin(4, c, 'D')),
              ['How much does the perimeter increase from one diagram to the next?', 'Test Diagram 1 to find the constant.'], 'equation P=' + lin(4, c, 'D'), { good: c ? [c + '+4D'] : ['4\\cdot D'] });
          } },
          { id: '6d', level: 'BEG', make: function (r, sh) {
            var D = sh.D10, ans = stairP(D, sh.w0), c = 2 * (sh.w0 - 1);
            return KP.number('Use the equation to determine the perimeter of Diagram ' + t(D) + '.', ans, function (v) {
              if (c && v === 4 * D) return { code: 'no-constant', hint: 'You found ' + t('4(' + D + ')') + '. Now add ' + t(c) + '.' };
              if (v === stairP(1, sh.w0) * D) return { code: 'times-first', hint: 'Use the equation ' + t('P=' + lin(4, c, 'D')) + '.' };
              if (v === stairArea(D, sh.w0)) return { code: 'area-count', hint: 'That is the number of squares. Use the perimeter equation.' };
              return null;
            }, t('P=4(' + D + ')' + (c ? '+' + c : '') + '=' + ans) + ' cm.', ['Substitute ' + t('D=' + D) + '.'], 'P(' + D + ')', { after: 'cm' });
          } },
          { id: '6e', level: 'EMG', make: function (r, sh) {
            var D = sh.Dt, Pv = stairP(D, sh.w0), c = 2 * (sh.w0 - 1);
            return KP.number('Use the equation to determine the diagram number if the perimeter is ' + t(Pv) + ' cm.', D, function (v) {
              if (c && feq(v, (Pv + c) / 4)) return { code: 'add-not-sub', hint: 'To undo the “' + t('+' + c) + '”, subtract ' + c + ' first.' };
              if (c && feq(v, Pv / 4)) return { code: 'no-subtract', hint: 'Subtract the ' + t(c) + ' before dividing by 4.' };
              if (feq(v, Pv - c) && c) return { code: 'no-divide', hint: 'You have ' + t('4D=' + (Pv - c)) + '. Now divide by 4.' };
              if (v === 4 * Pv + c) return { code: 'sub-wrong-var', hint: t(Pv) + ' is the perimeter, ' + t('P') + '. Solve ' + t(Pv + '=' + lin(4, c, 'D')) + ' for ' + t('D') + '.' };
              return null;
            }, t(Pv + '=' + lin(4, c, 'D')) + (c ? '<br>' + t('4D=' + (Pv - c)) : '') + '<br>' + t('D=' + D) + ' (Diagram ' + D + ').', ['Put ' + t('P=' + Pv) + ' into the equation and solve for ' + t('D') + '.'], 'D when P=' + Pv);
          } }] },
      /* ===================== Q7–Q10 ===================== */
      { num: '7', section: 'Part C — Discrete and continuous variables', stem: '', parts: [
        { id: '7', level: 'EMG', make: function (r) {
          var pool = [
            { html: 'Connect the points when the points lie in a straight line.', why: 'The matchstick and dot patterns lie on straight lines, but their points are not joined. Lining up isn’t the test.' },
            { html: 'Connect the points when the variables are whole numbers.', why: 'That is backwards: whole-number variables are discrete, and discrete points are left separate.' },
            { html: 'Always connect the points; a graph should be a line.', why: 'Think of the dot pattern: is there a Figure 2.5? Some graphs must stay as separate points.' },
            { html: 'Connect the points only when the graph starts at the origin.', why: 'The taxi graph starts at the pickup fee, not at the origin, and it is still joined. The starting point isn’t the test.' },
            { html: 'Connect the points when there are more than five of them.', why: 'The number of points plotted doesn’t change what the variables mean.' }];
          return KP.mc(r, 'Which statement describes, in general, how to decide whether the points on the graph of a relation should be connected?',
            [{ html: 'Connect the points when the variables are <b>continuous</b> (every in-between value has meaning); leave them unconnected when the variables are <b>discrete</b>.', right: true }].concat(r.sample(pool, 3)),
            'Decide from the variables. If every value between two data points has a real meaning in the situation (continuous), connect the points. If only certain values make sense — usually whole numbers (discrete) — leave them unconnected.',
            ['Think about the taxi (joined) and the dot pattern (not joined). What is different about the variables?'], 'rule for connecting points');
        } }] },
      { num: '8', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '8', level: 'BEG', make: function (r) {
          var d = r.pick(DISC), cs = r.sample(CONT, 3);
          return KP.mc(r, 'Which of the following variables is <b>discrete</b>?', [{ html: d, right: true }].concat(cs.map(function (c) { return { html: c, why: 'The ' + c + ' can be any value in a range (a decimal amount makes sense), so it is continuous.' }; })),
            'The ' + cs.join(', the ') + ' can all take in-between (decimal) values, so they are continuous. Only the ' + d + ' must be a whole number: <b>discrete</b>.', ['Which one is a <b>count</b> of whole things?'], 'which is discrete: ' + d);
        } }] },
      { num: '9', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '9', level: 'BEG', make: function (r) {
          var c = r.pick(CONT), ds = r.sample(DISC, 3);
          return KP.mc(r, 'Which of the following variables is <b>continuous</b>?', [{ html: c, right: true }].concat(ds.map(function (d) { return { html: d, why: 'The ' + d + ' is a count — only whole numbers make sense — so it is discrete.' }; })),
            'The ' + ds.join(', the ') + ' are whole-number counts (discrete). The ' + c + ' can take any value in a range, so it is <b>continuous</b>.', ['Which one is <b>measured</b> rather than counted?'], 'which is continuous: ' + c);
        } }] },
      { num: '10', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '10', level: 'EMG', make: function (r) {
          var th = r.pick(THEMES), items = r.shuffle(th.c.map(function (x) { return { s: x, c: true }; }).concat(th.d.map(function (x) { return { s: x, c: false }; })));
          var C = [], D = []; items.forEach(function (it, i) { (it.c ? C : D).push(i); });
          var name = function (set) { var s = set.slice().sort(); if (s.length === 4) return 'all of i), ii), iii), and iv)'; var L = s.map(function (i) { return ROMAN[i] + ')'; }); return (L.length === 1 ? L[0] : L.length === 2 ? L.join(' and ') : L.slice(0, -1).join(', ') + ', and ' + L[L.length - 1]) + ' only'; };
          var key = function (set) { return set.slice().sort().join(''); };
          var cands = [[C[0]], [C[1]], C.concat([D[0]]), C.concat([D[1]]), [0, 1, 2, 3], D.slice()];
          var seen = {}; seen[key(C)] = 1; var opts = [{ set: C, right: true }];
          r.shuffle(cands).forEach(function (s) { if (opts.length < 4 && !seen[key(s)]) { seen[key(s)] = 1; opts.push({ set: s }); } });
          opts.sort(function (a, b) { return a.set.length - b.set.length || key(a.set).localeCompare(key(b.set)); });
          var mc = opts.map(function (o) {
            if (o.right) return { html: name(o.set), right: true };
            var extra = o.set.filter(function (i) { return D.indexOf(i) >= 0; }), miss = C.filter(function (i) { return o.set.indexOf(i) < 0; });
            return { html: name(o.set), why: extra.length ? ROMAN[extra[0]] + ') ' + items[extra[0]].s + ' is a count of whole things — discrete.' : ROMAN[miss[0]] + ') ' + items[miss[0]].s + ' can take any value in a range — it is continuous too.' };
          });
          return KP.mc(r, 'Consider the following variables:<br>' + items.map(function (it, i) { return ROMAN[i] + ') ' + it.s; }).join('<br>') + '<br>Which of the variables above is/are <b>continuous</b>?', mc,
            items.map(function (it, i) { return ROMAN[i] + ') ' + it.s + ': ' + (it.c ? '<b>continuous</b> (measured; any value in a range)' : 'discrete (a whole-number count)'); }).join('<br>') + '<br>So the answer is ' + name(C) + '.',
            ['Decide for each one: is it measured (continuous) or counted (discrete)?'], 'which are continuous (theme)', true);
        } }] },
      /* ===================== Q11–Q12 ===================== */
      { num: '11', section: 'Part D — Multiple choice and numerical response', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '11', level: 'EMG', make: function (r) {
          var kind = r.pick(['y', 'y', 'x', 'both', 'neither']), A = [-4, -3], B = [6, -6];
          for (var g = 0; g < 400; g++) {
            var sameX = r.chance(0.5) ? 1 : -1, sameY = r.chance(0.5) ? 1 : -1;
            var x1, x2, y1, y2;
            if (kind === 'y' || kind === 'both') { x1 = -r.int(1, 8); x2 = r.int(1, 8); } else { x1 = sameX * r.int(1, 8); x2 = sameX * r.int(1, 8); }
            if (kind === 'x' || kind === 'both') { y1 = (r.chance(0.5) ? -1 : 1) * r.int(1, 8); y2 = -Math.sign(y1) * r.int(1, 8); } else { y1 = sameY * r.int(1, 8); y2 = sameY * r.int(1, 8); }
            if (r.chance(0.5)) { var tx = x1; x1 = x2; x2 = tx; var ty = y1; y1 = y2; y2 = ty; }
            if (x1 === x2 || y1 === y2) continue;
            if (kind === 'both' && y1 * x2 === y2 * x1) continue; // through the origin
            A = [x1, y1]; B = [x2, y2]; break;
          }
          var crossY = A[0] * B[0] < 0, crossX = A[1] * B[1] < 0;
          var ys = t(A[1]) + ' and ' + t(B[1]), xs = t(A[0]) + ' and ' + t(B[0]);
          var whyX = crossX ? 'The ' + t('y') + '-coordinates ' + ys + ' have opposite signs, so somewhere along the segment ' + t('y=0') + ': it <b>does</b> cross the ' + t('x') + '-axis.' : 'The ' + t('y') + '-coordinates ' + ys + ' have the same sign, so ' + t('y') + ' is never ' + t('0') + ': it does <b>not</b> reach the ' + t('x') + '-axis.';
          var whyY = crossY ? 'The ' + t('x') + '-coordinates ' + xs + ' have opposite signs, so it <b>does</b> cross the ' + t('y') + '-axis.' : 'The ' + t('x') + '-coordinates ' + xs + ' have the same sign, so it does <b>not</b> reach the ' + t('y') + '-axis.';
          var o = [{ html: 'intersects both the ' + t('x') + '-axis and ' + t('y') + '-axis.', right: crossX && crossY }, { html: 'intersects the ' + t('y') + '-axis but not the ' + t('x') + '-axis.', right: crossY && !crossX },
            { html: 'intersects the ' + t('x') + '-axis but not the ' + t('y') + '-axis.', right: crossX && !crossY }, { html: 'does not intersect the ' + t('x') + '-axis or the ' + t('y') + '-axis.', right: !crossX && !crossY }];
          [[true, true], [false, true], [true, false], [false, false]].forEach(function (cl, i) { if (!o[i].right) o[i].why = cl[0] !== crossX ? whyX : whyY; }); // cl = [crosses x-axis, crosses y-axis]
          var xr = [Math.min(-1, A[0], B[0]) - 1, Math.max(1, A[0], B[0]) + 1], yr = [Math.min(-1, A[1], B[1]) - 1, Math.max(1, A[1], B[1]) + 1];
          var g2 = HW.graph({ x: xr, y: yr, labels: 2, max: 230, segs: [{ pts: [A, B], start: 'closed', end: 'closed' }], aria: 'the segment' });
          return KP.mc(r, 'On a Cartesian plane, the line segment joining the points ' + t(pt(A)) + ' and ' + t(pt(B)), o, g2 + '<br>' + whyY + ' ' + whyX, ['To reach the ' + t('y') + '-axis, the ' + t('x') + '-coordinate must pass through ' + t('0') + '. To reach the ' + t('x') + '-axis, the ' + t('y') + '-coordinate must pass through ' + t('0') + '.'], 'segment crosses axes: ' + kind, true);
        } }] },
      { num: '12', stem: '<i>(Numerical Response)</i> The relationship between degrees Celsius, ' + t('C') + ', and degrees Fahrenheit, ' + t('F') + ', is described by the equation ' + t('C=\\dfrac{5}{9}(F-32)') + '.', parts: [
        { id: '12', level: 'BEG', make: function (r) {
          var ctxs = [['Normal human body temperature is', [986, 986]], ['On a hot summer afternoon the temperature is', [820, 1040]], ['The water in a hot tub is', [980, 1060]], ['On a cool spring morning the temperature is', [500, 640]], ['A classroom thermostat is set to', [660, 760]]];
          var cx, F, C;
          for (var g = 0; g < 300; g++) { cx = r.chance(0.3) ? ctxs[0] : r.pick(ctxs); F = r.int(cx[1][0], cx[1][1]) / 10; C = 5 / 9 * (F - 32); var fr = C - Math.floor(C); if (fr < 0.38 || fr > 0.62) break; }
          var ans = Math.round(C), Ft = String(F % 1 === 0 ? F.toFixed(1) : F);
          var p = KP.approx(cx[0] + ' ' + t(Ft + '^\\circ') + 'F. To the nearest degree, this temperature in degrees Celsius is ________.', C, 0, { nr: true, diag: function (v) {
            if (v === Math.round(5 / 9 * F - 32)) return { code: 'order-ops', hint: 'Subtract inside the brackets first: ' + t('F-32') + ', then multiply by ' + t('\\tfrac{5}{9}') + '.' };
            if (v === Math.round(9 / 5 * (F - 32)) || v === Math.round(9 / 5 * F + 32)) return { code: 'flip-formula', hint: 'Use the equation given: multiply by ' + t('\\tfrac{5}{9}') + ', not ' + t('\\tfrac{9}{5}') + '.' };
            if (v === Math.round(5 / 9 * F)) return { code: 'no-sub32', hint: 'Don’t forget to subtract ' + t('32') + ' first.' };
            return null;
          } }, 'Substitute ' + t('F=' + Ft) + ':<br>' + t('C=\\tfrac{5}{9}(' + Ft + '-32)=\\tfrac{5}{9}(' + dec(F - 32) + ')\\approx ' + (Math.round(C * 100) / 100)) + '<br>To the nearest degree, ' + t('C=' + ans) + '.',
          ['Substitute the Fahrenheit temperature for ' + t('F') + ', subtract 32, then multiply by ' + t('\\tfrac{5}{9}') + '.'], 'F to C: ' + Ft);
          p.key = String(ans); p.answer = t(ans); return p;
        } }] }
  ];

  /* ======================================================================= Extra practice ======================= */
  var X = [];
  function ringFigure(n, k) { // (n+2) by (n+k+2) with an n by (n+k) grey centre
    var c = 10, Wc = n + k + 2, Hc = n + 2;
    return { w: Wc * c, h: Hc * c, draw: function (ox, oy) {
      var s = '';
      for (var i = 0; i < Wc; i++) for (var j = 0; j < Hc; j++) { var inner = i > 0 && i < Wc - 1 && j > 0 && j < Hc - 1; s += '<rect x="' + (ox + i * c) + '" y="' + (oy + j * c) + '" width="' + c + '" height="' + c + '" fill="' + (inner ? '#b9bec6' : '#fff') + '" stroke="' + INK + '" stroke-width="1"/>'; }
      return s;
    } };
  }
  function rowsFigure(bottom, top) {
    var c = 11, W = Math.max(bottom, top, 1) * c, H = (top ? 2 : 1) * c;
    return { w: W, h: H, draw: function (ox, oy) {
      var s = '', i;
      for (i = 0; i < bottom; i++) s += '<rect x="' + (ox + i * c) + '" y="' + (oy + H - c) + '" width="' + c + '" height="' + c + '" fill="#eef0f2" stroke="' + INK + '" stroke-width="1"/>';
      for (i = 0; i < top; i++) s += '<rect x="' + (ox + i * c) + '" y="' + oy + '" width="' + c + '" height="' + c + '" fill="#eef0f2" stroke="' + INK + '" stroke-width="1"/>';
      return s;
    } };
  }
  function chainFigure(s, n) { // n polygons with s sides, each sharing one side with the previous one
    var L0 = s === 3 ? 30 : 13, segs = [], w, h;
    if (s === 6) { var hw = L0 * Math.sqrt(3) / 2; w = 2 * hw * n; h = 2 * L0;
      for (var i = 0; i < n; i++) { var cx = hw + 2 * hw * i, cy = L0; var vs = [[cx, cy - L0], [cx + hw, cy - L0 / 2], [cx + hw, cy + L0 / 2], [cx, cy + L0], [cx - hw, cy + L0 / 2], [cx - hw, cy - L0 / 2]]; for (var j = 0; j < 6; j++) { if (i > 0 && j === 4) continue; segs.push([vs[j], vs[(j + 1) % 6]]); } } }
    else if (s === 8) { var a = L0 / Math.SQRT2, side = L0 + 2 * a; w = side * n; h = side;
      for (var i2 = 0; i2 < n; i2++) { var x0 = side * i2; var v8 = [[x0 + a, 0], [x0 + a + L0, 0], [x0 + side, a], [x0 + side, a + L0], [x0 + a + L0, side], [x0 + a, side], [x0, a + L0], [x0, a]]; for (var j2 = 0; j2 < 8; j2++) { if (i2 > 0 && j2 === 6) continue; segs.push([v8[j2], v8[(j2 + 1) % 8]]); } } }
    else { var th = L0 * Math.sqrt(3) / 2; w = L0 * (n + 1) / 2; h = th; // triangles alternating up/down
      for (var i3 = 0; i3 < n; i3++) { var bx = L0 * i3 / 2; var tri = i3 % 2 === 0 ? [[bx, th], [bx + L0, th], [bx + L0 / 2, 0]] : [[bx, 0], [bx + L0, 0], [bx + L0 / 2, th]];
        for (var j3 = 0; j3 < 3; j3++) { if (i3 > 0 && j3 === 2) continue; segs.push([tri[j3], tri[(j3 + 1) % 3]]); } } }
    return { w: w + 4, h: h + 4, draw: function (ox, oy) { return segs.map(function (sg) { return '<line x1="' + (ox + 2 + sg[0][0]).toFixed(1) + '" y1="' + (oy + 2 + sg[0][1]).toFixed(1) + '" x2="' + (ox + 2 + sg[1][0]).toFixed(1) + '" y2="' + (oy + 2 + sg[1][1]).toFixed(1) + '" stroke="#8a5a2b" stroke-width="2.6" stroke-linecap="round"/>'; }).join(''); } };
  }
  function dotsGrid(cols, rows, tail) { // cols × rows block of dots, plus a tail of dots to the right on the middle row
    var s = 9;
    var w = (cols + (tail || 0)) * s, h = rows * s;
    return { w: w, h: h, draw: function (ox, oy) {
      var out = '', i, j, mid = Math.floor(rows / 2);
      for (i = 0; i < cols; i++) for (j = 0; j < rows; j++) out += '<circle cx="' + (ox + s / 2 + i * s) + '" cy="' + (oy + s / 2 + j * s) + '" r="2.6" fill="' + INK + '"/>';
      for (i = 0; i < (tail || 0); i++) out += '<circle cx="' + (ox + s / 2 + (cols + i) * s) + '" cy="' + (oy + s / 2 + mid * s) + '" r="2.6" fill="' + INK + '"/>';
      return out;
    } };
  }
  function joinMC(r, prompt, discrete, ctxWhy, text) {
    return KP.mc(r, prompt, discrete ? [
      { html: 'No — ' + ctxWhy + ', so the variables are <b>discrete</b>: in-between values have no meaning.', right: true },
      { html: 'Yes — the points lie in a straight line.', why: 'Lining up isn’t the test. Would the in-between values (like Figure 2.5) mean anything?' },
      { html: 'Yes — the graph is in Quadrant I.', why: 'Which quadrant the points are in has nothing to do with joining them.' },
      { html: 'No — there are too few points.', why: 'The number of points isn’t the test. Think about the in-between values.' }] : [
      { html: 'Yes — ' + ctxWhy + ', so the variables are <b>continuous</b>: every in-between value has meaning.', right: true },
      { html: 'No — the table only gives a few values.', why: 'A table shows a sample. Do the values in between make sense in the situation?' },
      { html: 'No — the line would go below zero.', why: 'Stop the line where the situation stops; that isn’t a reason to leave the points unjoined.' },
      { html: 'Yes — because the points line up.', why: 'Lining up isn’t the reason: discrete points can line up too. Think about the in-between values.' }],
      discrete ? 'Do not join: ' + ctxWhy + '.' : 'Join: ' + ctxWhy + '.', ['Ask: does an in-between value (like 2.5) mean anything here?'], text);
  }

  /* ----- EP 1: ring of white tiles ----- */
  X.push({ num: '1', section: 'Extra practice A — Growing patterns whose rule is not obvious', stem: function (sh) {
      return (sh.k ? 'In each figure below a solid rectangle of <i>grey</i> tiles (' + t('n') + ' by ' + t('n+' + sh.k) + ')' : 'In each figure below a solid square block of <i>grey</i> tiles') + ' is surrounded by a single ring of <i>white</i> tiles. Let ' + t('n') + ' be the figure number and ' + t('W') + ' the number of <b>white</b> tiles.<br>' +
        figRow([1, 2, 3].map(function (n) { return ringFigure(n, sh.k); }), ['Figure 1', 'Figure 2', 'Figure 3'], { max: 360, label: 'tile rings' });
    },
    shared: function (r) { var k = r.pick([0, 0, 1, 2]); return { k: k, W: function (n) { return 4 * n + 2 * k + 4; }, n25: r.int(18, 40), nf: r.int(15, 35), bad: 0 }; },
    parts: [
      { id: 'e1a', level: 'BEG', outcome: 'RF2', make: function (r, sh) {
        return tablePart('Complete the table: the number of white tiles ' + t('W') + ' in each figure.', 'n', [1, 2, 3, 4, 5], sh.W, function (n, v) {
          if (v === n * (n + sh.k)) return { code: 'area-count', hint: 'Figure ' + n + ': that is the number of <b>grey</b> tiles. Count the white ring.' };
          if (v === (n + 2) * (n + sh.k + 2)) return { code: 'all-sides', hint: 'That is every tile. Count only the white ones.' };
          if (v === sh.W(n) - 4) return { code: 'forgot-centre', hint: 'Don’t forget the four corner tiles of the ring.' };
          return null;
        }, 'Figure 1 has ' + t(sh.W(1)) + ' white tiles, and each figure adds ' + t('4') + ' (one more tile on each side of the ring): ' + [1, 2, 3, 4, 5].map(function (n) { return t(sh.W(n)); }).join(', ') + '.', ['Count the white tiles in Figures 1–3 and look for the jump each time.'], 'white tiles table k=' + sh.k);
      } },
      { id: 'e1b', level: 'BEG', make: function (r, sh) {
        return KP.number('By how much does ' + t('W') + ' increase from one figure to the next?', 4, function (v) { return v === 1 ? { code: 'step-wrong', hint: 'Look at the table: how far apart are the counts?' } : v === 2 ? { code: 'step-wrong', hint: 'The ring has <b>four</b> sides, and each one gets longer.' } : null; },
          'From the table: ' + [1, 2, 3, 4, 5].map(function (n) { return t(sh.W(n)); }).join('\\to') + ', up by ' + t('4') + ' each time. The ring has four sides, and each side gets one tile longer.', ['Subtract one count in the table from the next.'], 'white tiles increase');
      } },
      { id: 'e1c', level: 'EMG', outcome: 'RF2', make: function (r, sh) {
        var c = 2 * sh.k + 4, W1 = sh.W(1);
        return eqPart('Write an equation for ' + t('W') + ' in terms of ' + t('n') + '.', 'W', linP(4, c, 'n'), lin(4, c, 'n'), [
          { is: linP(4, W1, 'n'), code: 'first-term', hint: 'Test Figure 1: that gives ' + (4 + W1) + ', not ' + W1 + '. Start at ' + W1 + ' and add 4 for each figure <i>after</i> the first: ' + t(W1 + '+4(n-1)') + '.' },
          { is: linP(W1, 0, 'n'), code: 'times-first', hint: 'Test Figure 2: ' + t(W1 + '(2)=' + 2 * W1) + ', but Figure 2 has ' + sh.W(2) + ' white tiles.' },
          { is: linP(4, 0, 'n'), code: 'no-constant', hint: 'Test Figure 1: ' + t('4(1)=4') + ', but it has ' + W1 + ' white tiles.' }],
          'Start at ' + t(W1) + ' and add ' + t('4') + ' for each figure after the first:<br>' + t('W=' + W1 + '+4(n-1)=' + W1 + '+4n-4=' + lin(4, c, 'n')), ['The increase per figure goes in front of ' + t('n') + '.', 'Test Figure 1 to find the constant.'], 'W=' + lin(4, c, 'n'));
      } },
      { id: 'e1d', level: 'PRG', outcome: 'RF2', make: function (r, sh) {
        var k = sh.k, T = linP(4, 2 * k + 4, 'n');
        var whole = k ? '(n+2)(n+' + (k + 2) + ')' : '(n+2)^{2}', grey = k ? 'n(n+' + k + ')' : 'n^{2}';
        var p = KP.poly('Figure ' + t('n') + ' is an ' + t('(n+2)') + ' by ' + t(k ? '(n+' + (k + 2) + ')' : '(n+2)') + ' rectangle of tiles with an ' + t('n') + ' by ' + t(k ? '(n+' + k + ')' : 'n') + ' grey centre. Find the number of white tiles a second way: expand and simplify ' + t(whole + '-' + grey) + '.', T,
          { before: t('W='), wrong: k ? [{ is: P.num(2 * k + 4), code: 'square-binomial', hint: 'Expand ' + t(whole) + ' fully: it has two middle terms, ' + t('n(' + (k + 2) + ')') + ' and ' + t('2n') + '.' }]
            : [{ is: P.num(4), code: 'square-binomial', hint: t('(n+2)^{2}') + ' is not ' + t('n^{2}+4') + ': it has a middle term, ' + t('2(2n)=4n') + '.' }] },
          t('W=' + whole + '-' + grey) + '<br>' + t('=' + P.tex(P.mul(P.parse('n+2'), P.parse('n+' + (k + 2)))) + '-(' + P.tex(P.mul(P.parse('n'), P.parse('n+' + k))) + ')') + '<br>' + t('=' + P.tex(T)) + ' ✓ the same equation.',
          ['Expand the whole rectangle first, then subtract the grey centre (watch the signs).'], 'white tiles by subtraction k=' + k);
        return p;
      } },
      { id: 'e1e', level: 'BEG', make: function (r, sh) {
        var n = sh.n25, ans = sh.W(n), c = 2 * sh.k + 4;
        return KP.number('How many white tiles are in Figure ' + t(n) + '?', ans, function (v) { return v === 4 * n ? { code: 'no-constant', hint: 'Add the ' + t(c) + ' too.' } : v === n * (n + sh.k) ? { code: 'area-count', hint: 'That counts the grey tiles.' } : null; },
          t('W=4(' + n + ')+' + c + '=' + ans) + ' white tiles.', ['Substitute into your equation.'], 'W(' + n + ')');
      } },
      { id: 'e1f', level: 'EMG', make: function (r, sh) {
        var n = sh.nf, Wv = sh.W(n), c = 2 * sh.k + 4;
        return KP.number('Which figure uses exactly ' + t(Wv) + ' white tiles?', n, function (v) { return feq(v, (Wv + c) / 4) ? { code: 'add-not-sub', hint: 'Subtract ' + c + ' first.' } : feq(v, Wv / 4) ? { code: 'no-subtract', hint: 'Subtract the ' + c + ' before dividing by 4.' } : null; },
          t(lin(4, c, 'n') + '=' + Wv) + ', ' + t('4n=' + (Wv - c)) + ', ' + t('n=' + n) + ': Figure ' + n + '.', ['Set your equation equal to ' + t(Wv) + ' and solve.'], 'n for W=' + Wv);
      } },
      { id: 'e1g', level: 'PRG', make: function (r, sh) {
        var c = 2 * sh.k + 4, Wv; do { Wv = 2 * r.int(30, 60); } while ((Wv - c) % 4 === 0);
        var n = (Wv - c) / 4;
        return KP.mc(r, 'Explain why <b>no</b> figure in this pattern uses exactly ' + t(Wv) + ' white tiles.', [
          { html: 'Solving ' + t(lin(4, c, 'n') + '=' + Wv) + ' gives ' + t('n=' + dec(n)) + ', and there is no Figure ' + dec(n) + ' — figure numbers are whole numbers.', right: true },
          { html: t(Wv) + ' is too large for this pattern.', why: 'The pattern keeps growing forever — large counts are possible. Solve the equation and look at the answer.' },
          { html: t(Wv) + ' is an even number, and the counts are odd.', why: 'Look at the table: the counts are all even. Solve the equation instead.' },
          { html: 'Figure ' + Math.round(n) + ' uses ' + t(Wv) + ' white tiles, so the claim is false.', why: 'Check: ' + t('4(' + Math.round(n) + ')+' + c + '=' + (4 * Math.round(n) + c)) + ', not ' + Wv + '.' }],
          t(lin(4, c, 'n') + '=' + Wv) + ', ' + t('4n=' + (Wv - c)) + ', ' + t('n=' + dec(n)) + '. There is no Figure ' + dec(n) + ' — ' + t('n') + ' must be a whole number. (Every count is ' + (c % 4 ? '2 more than a multiple of 4' : 'a multiple of 4') + ', and ' + Wv + ' isn’t.)', ['Solve the equation and look at the value of ' + t('n') + '.'], 'no figure with W=' + Wv);
      } }] });

  /* ----- EP 2: pattern starting at Figure 0 ----- */
  X.push({ num: '2', stem: function (sh) {
      return 'The tile pattern below <b>starts at Figure 0</b>. Let ' + t('n') + ' be the figure number and ' + t('T') + ' the total number of tiles.<br>' +
        figRow([0, 1, 2, 3].map(function (n) { return rowsFigure(sh.a * n + sh.c, sh.b * n); }), ['Figure 0', 'Figure 1', 'Figure 2', 'Figure 3'], { max: 420, gap: 20, label: 'tile pattern from Figure 0' });
    },
    shared: function (r) { var a = r.pick([2, 2, 1, 3]), b = Math.min(a, r.pick([1, 1, 2])), c = r.pick([2, 2, 1, 3]); return { a: a, b: b, c: c, T: function (n) { return (a + b) * n + c; }, n40: r.int(25, 50), nt: r.int(12, 30) }; },
    parts: [
      { id: 'e2a', level: 'BEG', outcome: 'RF2', make: function (r, sh) {
        return tablePart('Complete the table. Note where the figure numbers begin.', 'n', [0, 1, 2, 3, 4, 5], sh.T, function (n, v) {
          if (v === sh.T(n + 1) || v === sh.T(n - 1)) return { code: 'off-by-one', hint: 'That is the count for Figure ' + (v === sh.T(n + 1) ? n + 1 : n - 1) + '. The first diagram is Figure ' + t('0') + '.' };
          return null;
        }, 'Figure 0 has ' + t(sh.c) + ' tile' + (sh.c > 1 ? 's' : '') + ', and each figure adds ' + t(sh.a + sh.b) + ' (' + sh.a + ' on the bottom row, ' + sh.b + ' on top): ' + [0, 1, 2, 3, 4, 5].map(function (n) { return t(sh.T(n)); }).join(', ') + '.', ['The first diagram is Figure 0. How many tiles does each figure add?'], 'figure-0 table');
      } },
      { id: 'e2b', level: 'EMG', make: function (r, sh) {
        var bot = linP(sh.a, sh.c, 'n'), top = linP(sh.b, 0, 'n');
        var fl = [{ label: 'bottom row', mode: 'math', keys: 'poly', vars: ['n'] }, { label: 'top row', mode: 'math', keys: 'poly', vars: ['n'] }];
        return KP.fields('Describe Figure ' + t('n') + ' by its rows: how many tiles are in the bottom row and in the top row?', fl, [K.poly(bot), K.poly(top, { wrong: [{ is: P.num(sh.b), code: 'step-wrong', hint: 'The top row grows: Figure 3 has ' + 3 * sh.b + ' tiles on top.' }].filter(function (w) { return !P.eq(w.is, top); }) })],
          [lin(sh.a, sh.c, 'n'), lin(sh.b, 0, 'n')], 'bottom ' + t(lin(sh.a, sh.c, 'n')) + ', top ' + t(lin(sh.b, 0, 'n')),
          'Bottom row: Figure 0 has ' + t(sh.c) + ' and each figure adds ' + t(sh.a) + ': ' + t(lin(sh.a, sh.c, 'n')) + '. Top row: ' + t(sh.b) + ' per figure, starting from none: ' + t(lin(sh.b, 0, 'n')) + '.', ['Make a small table for each row separately.'], 'rows of figure n');
      } },
      { id: 'e2c', level: 'EMG', outcome: 'RF2', make: function (r, sh) {
        var s = sh.a + sh.b, c = sh.c;
        return eqPart('Write an equation for ' + t('T') + ' in terms of ' + t('n') + '.', 'T', linP(s, c, 'n'), lin(s, c, 'n'), [
          { is: linP(s, c - s, 'n'), code: 'off-by-one', hint: 'Test Figure 0: your equation gives ' + (c - s) + ', but Figure 0 has ' + c + ' tiles. The pattern starts at Figure 0.' },
          { is: linP(s, sh.T(1), 'n'), code: 'first-term', hint: 'Test Figure 0: the count is ' + c + '. The constant is the Figure 0 count.' },
          { is: linP(s, 0, 'n'), code: 'no-constant', hint: 'Test Figure 0: it has ' + c + ' tiles, not 0.' }],
          'Bottom + top: ' + t('T=(' + lin(sh.a, sh.c, 'n') + ')+' + lin(sh.b, 0, 'n') + '=' + lin(s, c, 'n')) + '. Check: ' + t('n=0') + ' gives ' + t(c) + ' ✓',
          ['Add your two row expressions.'], 'T=' + lin(s, c, 'n'));
      } },
      { id: 'e2d', level: 'EMG', make: function (r, sh) {
        var s = sh.a + sh.b, c = sh.c, w = c - s;
        return KP.mc(r, 'A student who assumed the pattern started at Figure 1 wrote ' + t('T=' + lin(s, w, 'n')) + '. Test both equations at ' + t('n=0') + ' and ' + t('n=3') + '. Which is right?', [
          { html: t('T=' + lin(s, c, 'n')) + ': it gives ' + t(c) + ' and ' + t(sh.T(3)) + ', matching Figures 0 and 3.', right: true },
          { html: t('T=' + lin(s, w, 'n')) + ': it gives ' + t(w) + ' and ' + t(s * 3 + w) + '.', why: 'Compare with the diagrams: Figure 0 has ' + c + ' tiles and Figure 3 has ' + sh.T(3) + '.' },
          { html: 'Both — they only differ in where you start counting.', why: 'They give different numbers for the same figure. Only one can match the diagrams.' },
          { html: 'Neither equation works.', why: 'Substitute ' + t('n=0') + ' and ' + t('n=3') + ' into ' + t('T=' + lin(s, c, 'n')) + ' and compare with the diagrams.' }],
          t('n=0') + ': ' + t(lin(s, c, 'n')) + ' gives ' + t(c) + ' ✓; ' + t(lin(s, w, 'n')) + ' gives ' + t(w) + ' ✗.<br>' + t('n=3') + ': ' + t(sh.T(3)) + ' ✓ versus ' + t(3 * s + w) + ' ✗ (that is Figure 2’s count).<br>' + t('T=' + lin(s, c, 'n')) + ' is right; the other forgets that the pattern starts at Figure 0.',
          ['Count the tiles in Figure 0 and Figure 3 on the diagram.'], 'which equation (start at 0)');
      } },
      { id: 'e2e', level: 'BEG', make: function (r, sh) {
        var n = sh.n40, ans = sh.T(n);
        return KP.number('How many tiles are in Figure ' + t(n) + '?', ans, function (v) { return v === sh.T(n - 1) ? { code: 'off-by-one', hint: 'Use ' + t('n=' + n) + ' directly — the equation already starts at Figure 0.' } : null; },
          t('T=' + (sh.a + sh.b) + '(' + n + ')+' + sh.c + '=' + ans) + ' tiles.', ['Substitute into your equation.'], 'T(' + n + ')');
      } },
      { id: 'e2f', level: 'EMG', make: function (r, sh) {
        var n = sh.nt, Tv = sh.T(n), s = sh.a + sh.b;
        return KP.number('Which figure has exactly ' + t(Tv) + ' tiles?', n, function (v) { return feq(v, (Tv + sh.c) / s) ? { code: 'add-not-sub', hint: 'Subtract ' + sh.c + ' first.' } : feq(v, Tv / s) ? { code: 'no-subtract', hint: 'Subtract the ' + sh.c + ' before dividing.' } : null; },
          t(lin(s, sh.c, 'n') + '=' + Tv) + ', ' + t(s + 'n=' + (Tv - sh.c)) + ', ' + t('n=' + n) + ': Figure ' + n + '.', ['Set the equation equal to ' + t(Tv) + '.'], 'n for T=' + Tv);
      } },
      { id: 'e2g', level: 'EMG', make: function (r, sh) {
        var s = sh.a + sh.b, c = sh.c;
        return KP.mc(r, 'In ' + t('T=' + lin(s, c, 'n')) + ', what does the constant ' + t(c) + ' count?', [
          { html: 'The ' + c + ' tile' + (c > 1 ? 's' : '') + ' of Figure 0 — the starting tiles that every later figure still contains.', right: true },
          { html: 'The number of tiles added each figure.', why: 'The tiles added each figure (' + s + ') multiply ' + t('n') + '.' },
          { html: 'The number of tiles in the top row.', why: 'The top row has ' + t(lin(sh.b, 0, 'n')) + ' tiles — it changes with ' + t('n') + '.' },
          { html: 'The number of tiles in Figure 1.', why: 'Figure 1 has ' + sh.T(1) + ' tiles. Which figure has exactly ' + c + '?' }],
          'The constant is ' + t('T') + ' when ' + t('n=0') + ': the ' + c + ' tile' + (c > 1 ? 's' : '') + ' of Figure 0, which stay at the bottom left of every diagram. The ' + t(s + 'n') + ' counts the tiles added.', ['Substitute ' + t('n=0') + '.'], 'meaning of constant');
      } }] });

  /* ----- EP 3: chain of polygons ----- */
  X.push({ num: '3', stem: function (sh) {
      var nm = { 3: 'triangles', 6: 'hexagons', 8: 'octagons' }[sh.s];
      return 'Toothpicks are laid out to make a chain of ' + nm + '. Each new ' + nm.slice(0, -1) + ' shares one complete side with the one before it. Let ' + t('n') + ' be the number of ' + nm + ' and ' + t('H') + ' the number of toothpicks.<br>' +
        figRow([1, 2, 3].map(function (n) { return chainFigure(sh.s, n); }), ['Figure 1', 'Figure 2', 'Figure 3'], { max: 380, label: 'chain of ' + nm });
    },
    shared: function (r) { var s = r.pick([6, 6, 3, 8]); return { s: s, H: function (n) { return (s - 1) * n + 1; }, n32: r.int(20, 45), nb: r.int(30, 60), nm: { 3: 'triangle', 6: 'hexagon', 8: 'octagon' }[s] }; },
    parts: [
      { id: 'e3a', level: 'BEG', outcome: 'RF2', make: function (r, sh) {
        return tablePart('Count the toothpicks in each figure and complete the table.', 'n', [1, 2, 3, 4, 5], sh.H, function (n, v) {
          if (v === sh.s * n) return { code: 'all-sides', hint: 'Figure ' + n + ': a shared side is only one toothpick, so don’t count it twice.' };
          return null;
        }, 'Figure 1 needs ' + t(sh.s) + ' toothpicks; each new ' + sh.nm + ' shares a side, so it adds only ' + t(sh.s - 1) + ': ' + [1, 2, 3, 4, 5].map(function (n) { return t(sh.H(n)); }).join(', ') + '.', ['After the first ' + sh.nm + ', each new one needs only ' + (sh.s - 1) + ' more toothpicks.'], 'chain table s=' + sh.s);
      } },
      { id: 'e3b', level: 'BEG', make: function (r, sh) {
        return KP.number('The first ' + sh.nm + ' needs ' + t(sh.s) + ' toothpicks. How many toothpicks does each <b>additional</b> ' + sh.nm + ' need?', sh.s - 1, function (v) { return v === sh.s ? { code: 'all-sides', hint: 'The new ' + sh.nm + ' shares one side with the one before it — that toothpick is already there.' } : v === 1 ? { code: 'value', hint: 'That is how many <b>fewer</b>. The question asks how many it needs.' } : null; },
          'Each new ' + sh.nm + ' shares one complete side with the previous one, so it needs ' + t(sh.s + '-1=' + (sh.s - 1)) + ' new toothpicks (one fewer).', ['How many sides does a ' + sh.nm + ' have? How many of them are already laid?'], 'toothpicks per extra polygon');
      } },
      { id: 'e3c', level: 'EMG', outcome: 'RF2', make: function (r, sh) {
        var a = sh.s - 1;
        return eqPart('Write an equation for ' + t('H') + ' in terms of ' + t('n') + '.', 'H', linP(a, 1, 'n'), lin(a, 1, 'n'), [
          { is: linP(sh.s, 0, 'n'), code: 'all-sides', hint: 'That counts every side of every ' + sh.nm + ', including the shared ones twice. Test Figure 2: it has ' + sh.H(2) + ' toothpicks.' },
          { is: linP(a, sh.s, 'n'), code: 'first-term', hint: 'Test Figure 1: that gives ' + (a + sh.s) + ', not ' + sh.s + '. Write ' + t(sh.s + '+' + a + '(n-1)') + ' and simplify.' },
          { is: linP(a, 0, 'n'), code: 'no-constant', hint: 'Test Figure 1: ' + t(a + '(1)=' + a) + ', but it has ' + sh.s + ' toothpicks.' },
          { is: linP(sh.s, -1, 'n'), code: 'value', hint: 'Test Figure 2: that gives ' + (2 * sh.s - 1) + ', but Figure 2 has ' + sh.H(2) + '.' }],
          'Start at ' + t(sh.s) + ' and add ' + t(a) + ' per ' + sh.nm + ': ' + t('H=' + sh.s + '+' + a + '(n-1)=' + sh.s + '+' + a + 'n-' + a + '=' + lin(a, 1, 'n')), ['Start with ' + sh.s + ', then add ' + a + ' for each ' + sh.nm + ' after the first.'], 'H=' + lin(a, 1, 'n'));
      } },
      { id: 'e3d', level: 'BEG', make: function (r, sh) {
        var n = sh.n32, ans = sh.H(n);
        return KP.number('How many toothpicks does a chain of ' + t(n) + ' ' + sh.nm + 's need?', ans, function (v) { return v === sh.s * n ? { code: 'all-sides', hint: 'The shared sides are counted twice. Use your equation.' } : v === (sh.s - 1) * n ? { code: 'no-constant', hint: 'Add the 1.' } : null; },
          t('H=' + (sh.s - 1) + '(' + n + ')+1=' + ans) + ' toothpicks.', ['Substitute into your equation.'], 'H(' + n + ')');
      } },
      { id: 'e3e', level: 'EMG', make: function (r, sh) {
        var n = sh.nb, Hv = sh.H(n), a = sh.s - 1;
        return KP.number('A chain uses ' + t(Hv) + ' toothpicks. How many ' + sh.nm + 's does it have?', n, function (v) { return feq(v, (Hv + 1) / a) ? { code: 'add-not-sub', hint: 'Subtract the 1 first.' } : feq(v, Hv / a) ? { code: 'no-subtract', hint: 'Subtract the 1 before dividing.' } : feq(v, Hv / sh.s) ? { code: 'all-sides', hint: 'Use your equation ' + t('H=' + lin(a, 1, 'n')) + '.' } : null; },
          t(lin(a, 1, 'n') + '=' + Hv) + ', ' + t(a + 'n=' + (Hv - 1)) + ', ' + t('n=' + n) + ' ' + sh.nm + 's.', ['Set your equation equal to ' + t(Hv) + ' and solve.'], 'n for H=' + Hv);
      } },
      { id: 'e3f', level: 'PRG', make: function (r, sh) {
        var a = sh.s - 1, Hv; do { Hv = r.int(18, 45) * 10; } while ((Hv - 1) % a === 0);
        var n = (Hv - 1) / a, lo = Math.floor(n), hi = lo + 1;
        return KP.mc(r, 'Could a chain use exactly ' + t(Hv) + ' toothpicks?', [
          { html: 'No: solving ' + t(lin(a, 1, 'n') + '=' + Hv) + ' gives ' + t('n\\approx ' + (Math.round(n * 100) / 100)) + ', which is not a whole number of ' + sh.nm + 's.', right: true },
          { html: 'Yes: ' + hi + ' ' + sh.nm + 's.', why: 'Check: ' + t(a + '(' + hi + ')+1=' + sh.H(hi)) + ', not ' + Hv + '.' },
          { html: 'Yes: about ' + (Math.round(n * 10) / 10) + ' ' + sh.nm + 's.', why: 'Can a chain have part of a ' + sh.nm + '? ' + t('n') + ' counts whole ' + sh.nm + 's.' },
          { html: 'No: ' + t(Hv) + ' is too many toothpicks for a chain.', why: 'Chains can be as long as you like. Solve the equation and look at ' + t('n') + '.' }],
          t(lin(a, 1, 'n') + '=' + Hv) + ', ' + t(a + 'n=' + (Hv - 1)) + ', ' + t('n\\approx ' + (Math.round(n * 100) / 100)) + '. ' + t('n') + ' must be a whole number: ' + lo + ' ' + sh.nm + 's use ' + sh.H(lo) + ' and ' + hi + ' use ' + sh.H(hi) + ', so ' + Hv + ' is skipped.', ['Solve the equation and look at the value of ' + t('n') + '.'], 'can H=' + Hv);
      } },
      { id: 'e3g', level: 'EMG', make: function (r, sh) {
        var a = sh.s - 1;
        return KP.number('Every possible value of ' + t('H') + ' leaves the same remainder when divided by ' + t(a) + '. What is the remainder?', 1, function (v) { return v === 0 ? { code: 'value', hint: 'Try one: ' + t(sh.H(2) + '\\div ' + a) + ' — what is left over?' } : null; },
          t('H=' + lin(a, 1, 'n')) + ': ' + t(a + 'n') + ' is always a multiple of ' + a + ', plus ' + t('1') + '. (One starting toothpick, then ' + a + ' more for every ' + sh.nm + '.) Remainder: ' + t('1') + '.', ['Divide a few of your table values by ' + a + '.'], 'remainder of H');
      } }] });

  /* ----- EP 4: plot a table, read it back ----- */
  X.push({ num: '4', section: 'Extra practice B — Plot it, then read it back', stem: function (sh) {
      return 'A tile pattern has this table of values (' + t('n') + ' = figure number, ' + t('W') + ' = number of tiles). Plot the data on a grid.' + HW.valueTable([['\\(n\\)', 1, 2, 3, 4, 5], ['\\(W\\)'].concat([1, 2, 3, 4, 5].map(sh.W))]);
    },
    shared: function (r) { var a = r.pick([3, 4, 4, 5]), b = r.int(2, 6), q = r.int(3, 5); return { a: a, b: b, q: q, W: function (n) { return a * n + b; } }; },
    parts: [
      { id: 'e4a', level: 'BEG', make: function (r, sh) {
        var q = sh.q, w = sh.W(q);
        return pairPart('State the coordinates of the point that represents Figure ' + t(q) + '.', q, w, null, 'Figure ' + q + ' has ' + t(w) + ' tiles: the point is ' + t(pt([q, w])) + ' (figure number first, then the count).', ['The figure number goes first (horizontal axis).'], 'point for figure ' + q);
      } },
      { id: 'e4b', level: 'EMG', make: function (r, sh) {
        return joinMC(r, 'Should the plotted points be joined?', true, 'the figure number and the number of tiles are whole numbers (there is no Figure 2.5 and no half tile)', 'join? tile table');
      } },
      { id: 'e4c', level: 'EMG', make: function (r, sh) {
        return mcCols(KP.mc(r, 'The plotted points all lie in one quadrant. Which one, and why can no point of this pattern lie in any other?', [
          { html: 'Quadrant I: both coordinates are counts, so both are always positive.', right: true },
          { html: 'Quadrant II: the pattern grows to the left.', why: 'The figure numbers ' + t('1, 2, 3, \\ldots') + ' are positive, so the points are to the <b>right</b> of the ' + t('y') + '-axis.' },
          { html: 'Quadrant IV: the points go down the page.', why: 'The counts ' + t(sh.W(1) + ', ' + sh.W(2) + ', \\ldots') + ' are positive, so the points are <b>above</b> the ' + t('x') + '-axis.' },
          { html: 'Quadrant III: the counts get bigger.', why: 'Quadrant III needs both coordinates negative. Are figure numbers or tile counts ever negative?' }],
          '<b>Quadrant I.</b> ' + t('n\\ge 1') + ' and ' + t('W\\ge ' + sh.W(1)) + ': both coordinates are always positive, which is exactly Quadrant I.', ['What are the signs of the two coordinates?'], 'which quadrant (counts)'));
      } }] });

  /* ----- EP 5: candle ----- */
  var CANDLES = [[24, 1.5], [18, 1.5], [30, 1.5], [24, 2], [20, 2.5], [36, 1.5], [30, 2.5], [32, 2]];
  X.push({ num: '5', stem: function (sh) {
      return 'A candle is ' + t(sh.H0) + ' cm tall when it is lit and burns down at a steady ' + t(sh.r) + ' cm every hour. Let ' + t('t') + ' be the time in hours and ' + t('h') + ' the height of the candle in centimetres.';
    },
    shared: function (r) {
      var c, T, st, tq, tt, hq;
      for (var g = 0; g < 200; g++) {
        c = r.pick(CANDLES); T = c[0] / c[1]; st = T / 4;
        var h = function (x) { return c[0] - c[1] * x; };
        var cands = []; for (var x = 1; x < T; x++) if (x % st && Math.abs(h(x) - Math.round(h(x))) < 1e-9) cands.push(x);
        if (cands.length >= 2) { var two = r.sample(cands, 2); tq = two[0]; tt = two[1]; hq = h(tt); break; }
      }
      return { H0: c[0], r: c[1], T: T, st: st, ts: [0, st, 2 * st, 3 * st, 4 * st], h: function (x) { return c[0] - c[1] * x; }, tq: tq, tt: tt, hq: hq };
    },
    parts: [
      { id: 'e5a', level: 'BEG', make: function (r, sh) {
        var ts = sh.ts.slice(1);
        var fl = ts.map(function (x) { return { label: t('t=' + x), mode: 'number', after: 'cm' }; });
        return KP.fields('Complete the table of heights (at ' + t('t=0') + ' the height is ' + t(sh.H0) + ' cm).', fl, ts.map(function (x) { return K.number(sh.h(x), function (v) { return feq(v, sh.H0 + sh.r * x) ? { code: 'sign-rate', hint: 'The candle gets <b>shorter</b>: subtract.' } : feq(v, sh.r * x) ? { code: 'value', hint: 'That is how much has burned. Subtract it from ' + sh.H0 + '.' } : null; }); }),
          ts.map(function (x) { return dec(sh.h(x)); }), ts.map(function (x) { return t(dec(sh.h(x))); }).join(', '),
          ts.map(function (x) { return t('h=' + sh.H0 + '-' + sh.r + '(' + x + ')=' + dec(sh.h(x))); }).join('<br>'), ['Each hour the candle loses ' + sh.r + ' cm.'], 'candle table');
      } },
      { id: 'e5b', level: 'BEG', make: function (r, sh) {
        var ly = sh.H0 > 24 ? 6 : 4, ym = Math.ceil(sh.H0 / ly) * ly + (sh.H0 % ly ? 0 : ly / 2), xm = sh.T + sh.st;
        var G = function (pts, line) { return HW.graph({ x: [0, xm], y: [Math.min(0, line && line.length ? Math.min(line[0][1], line[line.length - 1][1]) : 0), ym], grid: sh.st, gridY: ly / 2, labels: 1, labelsX: sh.st, labelsY: ly, unitX: 110 / xm, unitY: 100 / ym, xName: 't', yName: 'h', firstQuadrant: true, max: 200,
          points: pts.map(function (p) { return { x: p[0], y: p[1] }; }), segs: line ? [{ pts: line }] : [], aria: 'candle graph' }); };
        var good = sh.ts.map(function (x) { return [x, sh.h(x)]; });
        return mcCols(KP.mc(r, 'Plot the five points from the table and join them. Which graph is correct?', [
          { html: G(good, [[0, sh.H0], [sh.T, 0]]), right: true },
          { html: G(good, null), why: 'Time and height are continuous: the candle has a height at every moment, so join the points.' },
          { html: G(good, [[0, sh.H0], [xm, sh.h(xm)]]), why: 'Once the height reaches 0 the candle is gone — the graph must stop at ' + t('t=' + sh.T) + '.' },
          { html: G(sh.ts.map(function (x) { return [x, sh.r * x]; }), [[0, 0], [sh.T, sh.H0]]), why: 'The candle starts at ' + sh.H0 + ' cm and gets shorter. This graph shows how much has burned.' }],
          'Plot ' + good.map(function (p) { return t(pt([p[0], dec(p[1])])); }).join(', ') + ' and join them: a straight line falling from ' + t(pt([0, sh.H0])) + ' to ' + t(pt([sh.T, 0])) + '.', ['Where does the graph start? Where must it stop?'], 'candle graph'));
      } },
      { id: 'e5c', level: 'BEG', make: function (r, sh) {
        var g = HW.graph({ x: [0, sh.T + 1], y: [0, sh.H0 + 2], grid: 1, gridY: 1, labels: 1, labelsX: 2, labelsY: 2, unitX: 300 / (sh.T + 1), unitY: 260 / (sh.H0 + 2), xName: 't', yName: 'h', firstQuadrant: true, xTitle: 'Time, t (h)', yTitle: 'Height, h (cm)', max: 360,
          points: sh.ts.map(function (x) { return { x: x, y: sh.h(x) }; }), segs: [{ pts: [[0, sh.H0], [sh.T, 0]] }], aria: 'candle height graph' });
        var ans = sh.h(sh.tq);
        return { prompt: g + '<br><b>Read off</b> the height of the candle at ' + t('t=' + sh.tq) + ' h.', input: { type: 'number', after: 'cm' }, check: estCheck(ans, 0.5, function (v) { return Math.abs(v - sh.r * sh.tq) < 0.3 ? { code: 'value', hint: 'That is how much has burned. Read the height straight off the line.' } : null; }),
          key: dec(ans), answer: t(dec(ans)) + ' cm', solution: 'From ' + t('t=' + sh.tq) + ' go up to the line, then across: ' + t('h=' + dec(ans)) + ' cm.', hints: ['Find ' + t(sh.tq) + ' on the time axis, go up to the line, then across.'], text: 'candle h at t=' + sh.tq, bad: [String(ans + 2)] };
      } },
      { id: 'e5d', level: 'EMG', make: function (r, sh) {
        return { prompt: '<b>Read off</b> the time at which the height is ' + t(dec(sh.hq)) + ' cm (use the graph in (c)).', input: { type: 'number', after: 'h' }, check: estCheck(sh.tt, 0.4, function (v) { return Math.abs(v - sh.hq) < 0.01 ? { code: 'value', hint: 'Start at ' + dec(sh.hq) + ' on the <b>height</b> axis, go across to the line, then down.' } : null; }),
          key: String(sh.tt), answer: t(sh.tt) + ' h', solution: 'From ' + t('h=' + dec(sh.hq)) + ' go across to the line, then down: ' + t('t=' + sh.tt) + ' h.', hints: ['This time start on the height axis.'], text: 'candle t at h=' + sh.hq, bad: [String(sh.tt + 2)] };
      } },
      { id: 'e5e', level: 'EMG', outcome: 'RF2', make: function (r, sh) {
        var rr = ex.norm(Math.round(sh.r * 10), 10), T = P.sub(P.num(sh.H0), P.mono(rr, { t: 1 }));
        var Rst = ex.norm(Math.round(sh.r * sh.st * 10), 10);
        return eqPart('Write an equation for ' + t('h') + ' in terms of ' + t('t') + '.', 'h', T, sh.H0 + '-' + sh.r + 't', [
          { is: P.add(P.num(sh.H0), P.mono(rr, { t: 1 })), code: 'sign-rate', hint: 'The candle gets <b>shorter</b> as ' + t('t') + ' increases, so the rate is subtracted.' },
          { is: P.sub(P.num(sh.H0), P.mono(Rst, { t: 1 })), code: 'per-two', hint: 'The table goes up ' + sh.st + ' hours at a time. What is the change in <b>one</b> hour?' },
          { is: P.sub(P.mono(rr, { t: 1 }), P.num(sh.H0)), code: 'swapped-coef', hint: 'Test ' + t('t=0') + ': the height should be ' + sh.H0 + '.' }],
          'It starts at ' + t(sh.H0) + ' cm and drops ' + t(sh.r) + ' cm each hour: ' + t('h=' + sh.H0 + '-' + sh.r + 't'), ['Start value, then subtract the amount burned in ' + t('t') + ' hours.'], 'h=' + sh.H0 + '-' + sh.r + 't', { good: ['-' + sh.r + 't+' + sh.H0] });
      } },
      { id: 'e5g', level: 'EMG', make: function (r, sh) {
        return KP.number('The graph should stop somewhere. At what value of ' + t('t') + ' does the relation stop making sense?', sh.T, function (v) { return feq(v, sh.H0 * sh.r) ? { code: 'value', hint: 'Solve ' + t('0=' + sh.H0 + '-' + sh.r + 't') + ': divide, don’t multiply.' } : feq(v, sh.H0) ? { code: 'value', hint: 'That is the starting height. When is the height ' + t('0') + '?' } : null; },
          t('0=' + sh.H0 + '-' + sh.r + 't') + ', ' + t(sh.r + 't=' + sh.H0) + ', ' + t('t=' + sh.T) + '. The candle is gone; past ' + t('t=' + sh.T) + ' the equation gives a negative height, which no candle can have.', ['When is the height zero?'], 'candle burn-out', { after: 'h' });
      } },
      { id: 'e5h', level: 'EMG', make: function (r, sh) {
        return KP.mc(r, 'Is a value read off a graph ever better than a calculated value? Which statement is best?', [
          { html: 'A graph reading is quick and shows the trend, so it is good for estimating and checking; a calculation is exact, so use it when the precise value is needed.', right: true },
          { html: 'A graph reading is always exact, so you never need the equation.', why: 'A reading is only as accurate as the grid — between grid lines you have to estimate.' },
          { html: 'Graph readings are useless; always calculate.', why: 'Graphs show the whole trend at a glance and are a quick check that a calculation is reasonable.' },
          { html: 'They always give different answers, so one of them must be wrong.', why: 'In (c) and (d) the reading and the equation agree. They usually match closely.' }],
          '<b>Graph reading:</b> fast, shows the trend, good for estimating and checking — but only as accurate as the grid. <b>Calculation:</b> exact; use it when the precise value is needed.', ['Think about what each one is good for.'], 'graph vs calculation');
      } }] });

  /* ----- EP 6: Figure-0 table plotted ----- */
  X.push({ num: '6', stem: function (sh) {
      return 'A tile pattern starts at Figure 0. Its table of values is shown. Plot the data on a grid — the horizontal axis must start at ' + t('n=0') + '.' + HW.valueTable([['\\(n\\)', 0, 1, 2, 3, 4, 5], ['\\(T\\)'].concat([0, 1, 2, 3, 4, 5].map(sh.T))]);
    },
    shared: function (r) { var a = r.pick([2, 3, 3, 4]), c = r.int(1, 5); return { a: a, c: c, T: function (n) { return a * n + c; }, q: r.int(2, 5) }; },
    parts: [
      { id: 'e6a', level: 'BEG', make: function (r, sh) {
        return pairPart('Give the coordinates of the plotted point for Figure ' + t(sh.q) + '.', sh.q, sh.T(sh.q), null, 'Figure ' + sh.q + ' has ' + t(sh.T(sh.q)) + ' tiles (from the table, or ' + t(sh.a + '(' + sh.q + ')+' + sh.c) + '): ' + t(pt([sh.q, sh.T(sh.q)])) + '.', ['Figure number first, then the number of tiles.'], 'point fig ' + sh.q);
      } },
      { id: 'e6b', level: 'BEG', make: function (r, sh) {
        return pairPart('One plotted point sits on the vertical axis. Give its coordinates.', 0, sh.c, function (x, y) { return feq(x, sh.c) && feq(y, 0) ? { code: 'pair-swap', hint: 'A point on the vertical axis has ' + t('x=0') + '. Figure number first.' } : null; },
          t(pt([0, sh.c])) + ': Figure 0, the ' + sh.c + ' starting tile' + (sh.c > 1 ? 's' : '') + ' before anything is added.', ['Which figure number puts a point on the vertical axis?'], 'point on vertical axis');
      } },
      { id: 'e6c', level: 'EMG', make: function (r, sh) {
        return joinMC(r, 'Your six points lie in a straight row. Should you draw the line through them?', true, 'there is no Figure 2.5 — the figure number and the tile count are whole numbers, even though the points are in a straight row', 'collinear but discrete');
      } }] });

  /* ----- EP 7–9: discrete or continuous ----- */
  var BUS = [{ c: false, s: 'the number of passengers on a bus' }, { c: true, s: 'the distance the bus travels on its route' }, { c: true, s: 'the volume of fuel in the bus’s tank' }, { c: false, s: 'the number of stops the bus makes' },
    { c: true, s: 'the time the trip takes' }, { c: false, s: 'the number of seats still empty' }, { c: true, s: 'the speed of the bus' }, { c: false, s: 'the number of tickets sold today' }, { c: true, s: 'the temperature inside the bus' }, { c: false, s: 'the number of wheels on the bus' }];
  var BAKE = [{ c: false, s: 'the number of loaves sold' }, { c: true, s: 'the mass of flour in a bin' }, { c: true, s: 'the oven temperature' }, { c: false, s: 'the number of eggs used' },
    { c: true, s: 'the baking time of a cake' }, { c: false, s: 'the number of cupcakes in a box' }, { c: true, s: 'the volume of milk in a jug' }, { c: false, s: 'the number of customers in a day' }];
  X.push({ num: '7', section: 'Extra practice C — Discrete or continuous? It depends what you measure', stem: '', parts: [
    { id: 'e7', level: 'BEG', make: function (r) {
      var pool = r.pick([BUS, BUS, BAKE]), items;
      do { items = r.sample(pool, 6); } while (items.filter(function (x) { return x.c; }).length < 2 || items.filter(function (x) { return !x.c; }).length < 2);
      var want = {}; items.forEach(function (it, i) { want['r' + i] = it.c ? 'C' : 'D'; });
      return KP.grid('Classify each variable as discrete or continuous.', items.map(function (it, i) { return { id: 'r' + i, html: '(' + 'abcdef'[i] + ') ' + it.s }; }), [{ id: 'D', html: 'Discrete' }, { id: 'C', html: 'Continuous' }], want,
        { why: function (row) { var it = items[Number(row.slice(1))]; return { code: 'row', hint: 'Check ' + it.s + ': ' + (it.c ? 'it is measured — an in-between value like 12.6 makes sense.' : 'it is counted — 4.5 of them makes no sense.') }; } },
        items.map(function (it, i) { return '(' + 'abcdef'[i] + ') ' + (it.c ? '<b>continuous</b> — a value like ' + t('12.63') + ' has meaning' : '<b>discrete</b> — a value like ' + t('4.5') + ' has no meaning'); }).join('<br>'),
        ['For each one, name an in-between value (like 4.5). Does it make sense?'], 'classify six variables');
    } }] });
  var SPLITS = [
    ['Flour', 'the mass of flour scooped from an open bin', 'the number of sealed 2 kg bags of flour bought'],
    ['A phone call', 'how long the call lasts, timed by a stopwatch', 'the number of whole minutes the call is billed for'],
    ['Oven heat', 'the actual temperature inside the oven as it warms up', 'the setting on a dial that clicks only to 25° marks'],
    ['Water', 'the amount of water in a jug', 'the number of identical cups the jug completely fills'],
    ['Ribbon', 'the length of ribbon left on a roll', 'the number of 1 m pieces cut from the roll'],
    ['Gasoline', 'the volume of gas pumped into a car', 'the number of full jerry cans filled']];
  X.push({ num: '8', stem: 'Each pair below is about the <i>same</i> underlying quantity, but the two versions are measured differently.', parts: [
    { id: 'e8a', level: 'PRG', make: function (r) {
      var ps = r.sample(SPLITS, 4), rows = [], want = {};
      ps.forEach(function (p, i) {
        var flip = r.chance(0.3); // sometimes list the counted version first
        var a = flip ? [p[2], 'D'] : [p[1], 'C'], b = flip ? [p[1], 'C'] : [p[2], 'D'];
        rows.push({ id: i + 'i', html: '<b>' + p[0] + '</b> i) ' + a[0] }); want[i + 'i'] = a[1];
        rows.push({ id: i + 'ii', html: '<b>' + p[0] + '</b> ii) ' + b[0] }); want[i + 'ii'] = b[1];
      });
      var all = rows.map(function (rw) { return rw.html.replace(/<[^>]+>/g, '') + ': ' + (want[rw.id] === 'C' ? '<b>continuous</b>' : '<b>discrete</b>'); }).join('<br>');
      return KP.grid('Classify each version.', rows, [{ id: 'D', html: 'Discrete' }, { id: 'C', html: 'Continuous' }], want,
        { why: function (row) { return { code: 'row', hint: 'Check ' + rows.filter(function (x) { return x.id === row; })[0].html.replace(/<[^>]+>/g, '') + ': is it measured on a smooth scale, or counted / set in fixed steps?' }; } },
        all + '<br>In each pair, the measured version is continuous; the version that counts whole items (or clicks in fixed steps) is discrete.', ['Is the value measured, or counted in whole units / fixed steps?'], 'split pairs');
    } },
    { id: 'e8b', level: 'EMG', make: function (r) {
      return KP.mc(r, 'In every pair, what makes one version discrete and the other continuous?', [
        { html: 'How the quantity is measured or packaged: counting whole items or fixed steps gives a discrete variable; measuring on a smooth scale gives a continuous one.', right: true },
        { html: 'The size of the numbers: large numbers are continuous, small numbers are discrete.', why: 'A count can be huge (grains of rice) and still be discrete. Size isn’t the test.' },
        { html: 'Whether the quantity is useful in real life.', why: 'Both versions are useful. Think about what values each version can take.' },
        { html: 'Whether the units are metric.', why: 'Both versions use the same kind of units. Think about counting versus measuring.' }],
        'The split comes from <b>how the quantity is measured or packaged</b>: counting whole bags, cups, minutes or clicks gives separate values (discrete); measuring mass, time or temperature directly gives every value in between (continuous).', ['Compare the two versions in each pair: what changed?'], 'what makes the split');
    } }] });
  var D9 = [['the number of identical crates loaded onto a truck', 'their total mass in kilograms', 'crates', '2.5 crates is not a load'], ['the number of concert tickets bought', 'the total cost in dollars', 'tickets', 'nobody buys 2.5 tickets'], ['the number of boxes of pencils', 'the total number of pencils', 'boxes', 'a store sells whole boxes']];
  var C9 = [['the number of hours a worker has been on shift', 'the pay earned, paid by the minute at $K an hour', 'after 2.5 h the worker has earned $H'], ['the time in minutes a hose has been filling a pool', 'the volume of water in litres, flowing at K L per minute', 'after 2.5 min the pool holds H L'], ['the time in hours a car has been driving at K km/h', 'the distance travelled in kilometres', 'after 2.5 h the car has gone H km']];
  X.push({ num: '9', stem: function (sh) { return 'The same table of values is used for two different situations.' + HW.valueTable([['\\(x\\)', 1, 2, 3, 4, 5], ['\\(y\\)'].concat([1, 2, 3, 4, 5].map(function (x) { return sh.k * x; }))]); },
    shared: function (r) { return { k: r.pick([8, 10, 12, 12, 15, 20]), d: r.pick(D9), c: r.pick(C9) }; },
    parts: [
      { id: 'e9a', level: 'EMG', make: function (r, sh) {
        return joinMC(r, t('x') + ' is ' + sh.d[0] + ' and ' + t('y') + ' is ' + sh.d[1] + '. Join the points or not?', true, sh.d[3] + ' — the number of ' + sh.d[2] + ' is a whole number', 'join? ' + sh.d[2]);
      } },
      { id: 'e9b', level: 'EMG', make: function (r, sh) {
        var txt = function (s) { return s.replace('K', sh.k).replace('H', dec(2.5 * sh.k)); };
        return joinMC(r, t('x') + ' is ' + txt(sh.c[0]) + ' and ' + t('y') + ' is ' + txt(sh.c[1]) + '. Join the points or not?', false, 'time is continuous: ' + txt(sh.c[2]), 'join? continuous context');
      } },
      { id: 'e9c', level: 'PRG', make: function (r, sh) {
        return KP.mc(r, 'The numbers are identical and the equation is ' + t('y=' + sh.k + 'x') + ' both times. What decides whether to join the points?', [
          { html: 'The context: whether every in-between value has meaning in the situation.', right: true },
          { html: 'The equation: a linear equation is always joined.', why: 'Both situations have the same equation ' + t('y=' + sh.k + 'x') + ', yet the answers differ.' },
          { html: 'The numbers in the table: whole numbers mean discrete.', why: 'The tables are identical, yet the answers differ — the numbers can’t be what decides.' },
          { html: 'Whether the graph passes through the origin.', why: 'Both graphs would pass through the origin. Something else decides.' }],
          'The <b>context</b> decides: whether every in-between value has meaning in the situation. The table and ' + t('y=' + sh.k + 'x') + ' are identical in both situations, yet one is joined and one is not, so the numbers cannot settle it.', ['The tables and equations are the same. What is different?'], 'context decides');
      } }] });

  /* ----- EP 10–12: quadrants from signs ----- */
  X.push({ num: '10', section: 'Extra practice D — Quadrants from sign conditions', stem: 'A point ' + t('P(x, y)') + ' satisfies the condition given. Where must it lie?', parts: [
    { id: 'e10a', level: 'BEG', make: function (r) {
      var sx = r.pick([1, -1]), sy = r.pick([1, -1]), q = quadOf([sx, sy]);
      return quadMC(r, t('x' + (sx > 0 ? '>' : '<') + '0') + ' and ' + t('y' + (sy > 0 ? '>' : '<') + '0'), q, t('x') + ' ' + sgnWord(sx) + ', ' + t('y') + ' ' + sgnWord(sy) + ': ' + t(QSIGN[q]) + ', <b>Quadrant ' + q + '</b>.', ['Quadrant I is ' + t('(+,+)') + '; the numbers go counter-clockwise.'], 'signs → quadrant');
    } },
    { id: 'e10b', level: 'EMG', make: function (r) {
      var v = r.pick(['x', 'y']), s = r.pick([1, -1]), sx = s, sy = s, q = quadOf([sx, sy]);
      return quadMC(r, t('xy>0') + ' and ' + t(v + (s > 0 ? '>' : '<') + '0'), q, t('xy>0') + ': the signs are the same. ' + t(v) + ' is ' + sgnWord(s) + ', so the other one is too: ' + t(QSIGN[q]) + ', <b>Quadrant ' + q + '</b>.', ['A product is positive when both factors have the same sign.'], 'xy>0 and sign');
    } },
    { id: 'e10c', level: 'EMG', make: function (r) {
      var v = r.pick(['x', 'y']), s = r.pick([1, -1]), sx = v === 'x' ? s : -s, sy = v === 'y' ? s : -s, q = quadOf([sx, sy]);
      return quadMC(r, t('xy<0') + ' and ' + t(v + (s > 0 ? '>' : '<') + '0'), q, t('xy<0') + ': the signs are opposite. ' + t(v) + ' is ' + sgnWord(s) + ', so the other is ' + sgnWord(-s) + ': ' + t(QSIGN[q]) + ', <b>Quadrant ' + q + '</b>.', ['A product is negative when the factors have opposite signs.'], 'xy<0 and sign');
    } },
    { id: 'e10d', level: 'EMG', make: function (r) {
      var v = r.pick(['x', 'y']), o = v === 'x' ? 'y' : 'x', s = r.pick([1, -1]);
      var opts = [['x', 1], ['x', -1], ['y', 1], ['y', -1]].map(function (a) { var right = a[0] === o && a[1] === s; return { html: 'on the ' + (a[1] > 0 ? 'positive' : 'negative') + ' ' + t(a[0]) + '-axis (in no quadrant)', right: right, why: right ? null : a[0] !== o ? t(v + '=0') + ' means no movement along the ' + t(v) + '-direction — the point is on the <b>' + t(o) + '</b>-axis.' : 'Check the sign of ' + t(o) + '.' }; });
      return mcCols(KP.mc(r, t(v + '=0') + ' and ' + t(o + (s > 0 ? '>' : '<') + '0'), opts, t(v + '=0') + ' puts ' + t('P') + ' on the ' + t(o) + '-axis, and ' + t(o) + ' is ' + sgnWord(s) + ': the <b>' + (s > 0 ? 'positive' : 'negative') + ' ' + t(o) + '-axis</b>, in no quadrant.', ['Where are all the points with ' + t(v + '=0') + '?'], 'axis from condition', true));
    } },
    { id: 'e10e', level: 'EMG', make: function (r) {
      var pos = r.chance(0.5), rel = r.pick(['\\dfrac{x}{y}', 'xy']);
      var right = pos ? 'Quadrant I or Quadrant III' : 'Quadrant II or Quadrant IV';
      var what = rel === 'xy' ? 'product' : 'quotient';
      var opts = ['Quadrant I only', 'Quadrant III only', 'Quadrant I or Quadrant III', 'Quadrant II or Quadrant IV'].map(function (h) { return { html: h, right: h === right, why: h === right ? null : /only/.test(h) ? (pos ? 'That quadrant works, but so does another: try ' + t(h === 'Quadrant I only' ? '(-2, -3)' : '(2, 3)') + '.' : 'In ' + h.replace(' only', '') + ' both coordinates have the same sign, so the ' + what + ' is positive.') : (pos ? 'Opposite signs make the ' + what + ' negative.' : 'Same signs make the ' + what + ' positive.') }; });
      return mcCols(KP.mc(r, t(rel + (pos ? '>' : '<') + '0'), opts, t(rel + (pos ? '>' : '<') + '0') + ': the signs are ' + (pos ? 'the same (both ' + t('+') + ' or both ' + t('-') + '), neither 0' : 'opposite, neither 0') + ': <b>' + right + '</b>.', ['When is a ' + (rel === 'xy' ? 'product' : 'quotient') + ' ' + (pos ? 'positive' : 'negative') + '?'], 'quotient/product sign', true));
    } },
    { id: 'e10f', level: 'PRG', make: function (r) {
      var sum = r.chance(0.6), v = r.pick(['x', 'y']), s = r.pick([1, -1]);
      var other = sum ? -s : s, sx = v === 'x' ? s : other, sy = v === 'y' ? s : other, q = quadOf([sx, sy]), o = v === 'x' ? 'y' : 'x';
      return quadMC(r, t((sum ? 'x+y=0' : 'x-y=0')) + ' and ' + t(v + (s > 0 ? '>' : '<') + '0'), q, (sum ? t('y=-x') + ': the coordinates are opposites' : t('y=x') + ': the coordinates are equal') + '. ' + t(v) + ' is ' + sgnWord(s) + ', so ' + t(o) + ' is ' + sgnWord(sum ? -s : s) + ': ' + t(QSIGN[q]) + ', <b>Quadrant ' + q + '</b>.',
        ['Rearrange the equation to get ' + t('y') + ' on its own.'], 'x±y=0 and sign');
    } }] });
  var TRANS = [['(b, a)', function (a, b) { return [b, a]; }], ['(-a, b)', function (a, b) { return [-a, b]; }], ['(a, -b)', function (a, b) { return [a, -b]; }], ['(-a, -b)', function (a, b) { return [-a, -b]; }], ['(-b, a)', function (a, b) { return [-b, a]; }], ['(b, -a)', function (a, b) { return [b, -a]; }]];
  X.push({ num: '11', stem: '', parts: [
    { id: 'e11', level: 'PRG', make: function (r) {
      var Q = r.pick(['I', 'II', 'III', 'III', 'IV']), sg = { I: [1, 1], II: [-1, 1], III: [-1, -1], IV: [1, -1] }[Q], picks = r.chance(0.5) ? TRANS.slice(0, 4) : r.sample(TRANS, 4);
      var want = {}; picks.forEach(function (tr, i) { want['t' + i] = quadOf(tr[1](sg[0], sg[1])); });
      var sgn = function (v) { return v > 0 ? '+' : '-'; };
      return KP.grid('The point ' + t('P(a, b)') + ' lies in Quadrant ' + Q + '. State the quadrant of each point.', picks.map(function (tr, i) { return { id: 't' + i, html: t(tr[0]) }; }), QOPT.map(function (q) { return { id: q, html: q }; }), want,
        { colHead: 'Quadrant', why: function (row) { var tr = picks[Number(row.slice(1))], s2 = tr[1](sg[0], sg[1]); return { code: 'quad-sign', hint: 'For ' + t(tr[0]) + ': ' + t('a') + ' is ' + sgnWord(sg[0]) + ' and ' + t('b') + ' is ' + sgnWord(sg[1]) + '. What are the signs of the two coordinates?' }; } },
        'Quadrant ' + Q + ': ' + t('a') + ' ' + sgnWord(sg[0]) + ', ' + t('b') + ' ' + sgnWord(sg[1]) + '.<br>' + picks.map(function (tr) { var s2 = tr[1](sg[0], sg[1]); return t(tr[0]) + ': ' + t('(' + sgn(s2[0]) + ', ' + sgn(s2[1]) + ')') + ', Quadrant ' + quadOf(s2); }).join('<br>'),
        ['Write the signs of ' + t('a') + ' and ' + t('b') + ' first. A minus sign in front flips the sign.'], 'quadrants of transformed points');
    } }] });
  X.push({ num: '12', stem: function (sh) { return 'For each point, state its quadrant, or name the axis it lies on (a point on an axis is in no quadrant): ' + sh.pts.map(function (o, i) { return t('ABCDEF'[i] + pt(o.p)); }).join(', ') + '.'; },
    shared: function (r) {
      var nz = function () { return r.pick([1, -1]) * r.int(1, 8); };
      var qs = r.sample(['I', 'II', 'III', 'IV'], 3), sg = { I: [1, 1], II: [-1, 1], III: [-1, -1], IV: [1, -1] };
      var pts = qs.map(function (q) { return { p: [sg[q][0] * r.int(1, 8), sg[q][1] * r.int(1, 8)], w: q }; });
      pts.push({ p: [nz(), 0], w: 'xa' }); pts.push({ p: [0, nz()], w: 'ya' }); pts.push({ p: [0, 0], w: 'o' });
      return { pts: r.shuffle(pts) };
    },
    parts: [
      { id: 'e12a', level: 'BEG', make: function (r, sh) {
        var names = 'ABCDEF', want = {};
        sh.pts.forEach(function (o, i) { want[names[i]] = QOPT.indexOf(o.w) >= 0 ? o.w : 'none'; });
        var cols = QOPT.map(function (q) { return { id: q, html: q }; }).concat([{ id: 'none', html: 'none' }]);
        return KP.grid('Choose each point’s quadrant (choose <b>none</b> for a point on an axis).', sh.pts.map(function (o, i) { return { id: names[i], html: t(names[i]) }; }), cols, want,
          { colHead: 'Quadrant', why: function (row, got, w) { var o = sh.pts[names.indexOf(row)]; if (w === 'none') return { code: 'quad-sign', hint: t(row + pt(o.p)) + ' has a coordinate of ' + t('0') + ', so it sits on an axis — in no quadrant.' }; if (got === 'none') return { code: 'quad-sign', hint: 'Neither coordinate of ' + t(row + pt(o.p)) + ' is ' + t('0') + ', so it is inside a quadrant.' }; return { code: 'quad-sign', hint: 'Check ' + t(row + pt(o.p)) + ': look at the signs. I ' + t('(+,+)') + ', II ' + t('(-,+)') + ', III ' + t('(-,-)') + ', IV ' + t('(+,-)') + '.' }; } },
          sh.pts.map(function (o, i) { return t(names[i] + pt(o.p)) + ': ' + (want[names[i]] === 'none' ? 'on an axis — no quadrant' : t(QSIGN[o.w]) + ', Quadrant ' + o.w); }).join('<br>'), ['A coordinate of ' + t('0') + ' puts the point on an axis.'], 'quadrant or none');
      } },
      { id: 'e12b', level: 'BEG', make: function (r, sh) {
        var names = 'ABCDEF', rows = [], want = {};
        sh.pts.forEach(function (o, i) { if (o.w === 'xa' || o.w === 'ya' || o.w === 'o') { rows.push({ id: names[i], html: t(names[i] + pt(o.p)), o: o }); want[names[i]] = o.w; } });
        var desc = function (o) { return o.w === 'xa' ? 'the ' + (o.p[0] > 0 ? 'positive' : 'negative') + ' ' + t('x') + '-axis (' + t('y=0') + ')' : o.w === 'ya' ? 'the ' + (o.p[1] > 0 ? 'positive' : 'negative') + ' ' + t('y') + '-axis (' + t('x=0') + ')' : 'the origin, on both axes'; };
        return KP.grid('The points on an axis: which axis is each one on?', rows, [{ id: 'xa', html: '\\(x\\)-axis' }, { id: 'ya', html: '\\(y\\)-axis' }, { id: 'o', html: 'both (origin)' }], want,
          { why: function (row, got, w) { var o = rows.filter(function (x) { return x.id === row; })[0].o; if (w === 'o') return { code: 'quad-sign', hint: t(row + '(0, 0)') + ' is the origin, where the two axes cross.' }; return { code: 'quad-sign', hint: 'Check ' + t(row + pt(o.p)) + ': a point with ' + t('y=0') + ' is on the ' + t('x') + '-axis; a point with ' + t('x=0') + ' is on the ' + t('y') + '-axis.' }; } },
          rows.map(function (x) { return x.html + ': ' + desc(x.o); }).join('<br>'), ['If ' + t('y=0') + ' the point hasn’t moved up or down: it is on the ' + t('x') + '-axis.'], 'which axis');
      } }] });

  /* ----- EP 13–14: error analysis ----- */
  X.push({ num: '13', section: 'Extra practice E — Error analysis', stem: function (sh) {
      var a = sh.a, b = sh.b, W = function (n) { return a * n + b; }, ym = Math.ceil((W(5) + 2) / 4) * 4;
      return '<i>(Error analysis)</i> A tile pattern follows ' + t('W=' + lin(a, b, 'n')) + ' (' + t('n') + ' = figure number, ' + t('W') + ' = number of tiles). A student plotted it and joined the points with a ruler, as shown. The hollow point sits on the student’s line.<br>' +
        HW.graph({ x: [0, 6], y: [0, ym], grid: 1, gridY: 2, labels: 1, labelsX: 1, labelsY: 4, unitX: 44, unitY: 230 / ym, xName: 'n', yName: 'W', firstQuadrant: true, max: 320,
          points: [1, 2, 3, 4, 5].map(function (n) { return { x: n, y: W(n) }; }).concat([{ x: sh.h, y: W(sh.h), open: true, label: '(' + sh.h + ', ' + W(sh.h) + ')' }]), segs: [{ pts: [[1, W(1)], [5, W(5)]] }], aria: 'student graph with joined points' });
    },
    shared: function (r) { var a = r.pick([2, 4, 4, 6]), b = r.int(1, 6); return { a: a, b: b, h: r.pick([1.5, 2.5, 2.5, 3.5]) }; },
    parts: [
      { id: 'e13a', level: 'EMG', make: function (r, sh) {
        var v = sh.a * sh.h + sh.b;
        return KP.mc(r, 'What does the hollow point claim, in words about tiles and figures?', [
          { html: 'Figure ' + sh.h + ' has ' + v + ' tiles.', right: true },
          { html: 'Figure ' + v + ' has ' + sh.h + ' tiles.', why: 'The first coordinate is the figure number ' + t('n') + '; the second is the number of tiles.' },
          { html: sh.h + ' tiles are added each figure.', why: 'A single point gives one figure and its count, not the amount added.' },
          { html: 'Figure ' + Math.floor(sh.h) + ' has ' + v + ' tiles.', why: 'Read the first coordinate exactly: it is ' + sh.h + ', not ' + Math.floor(sh.h) + '.' }],
          'The point ' + t(pt([sh.h, v])) + ' claims that <b>Figure ' + sh.h + ' has ' + v + ' tiles</b>.', ['The first coordinate is ' + t('n') + ', the second is ' + t('W') + '.'], 'what the point claims');
      } },
      { id: 'e13b', level: 'PRG', make: function (r, sh) {
        var v = sh.a * sh.h + sh.b, W = function (n) { return sh.a * n + sh.b; };
        var opts = [{ value: 'n', html: 'There is no Figure ' + sh.h + ' — ' + t('n') + ' counts figures, so it must be a whole number.' }, { value: 'W', html: t(v) + ' is not one of the possible counts (' + t(W(1) + ', ' + W(2) + ', ' + W(3) + ', \\ldots') + ').' },
          { value: 'big', html: t(v) + ' is too large to be on the graph.' }, { value: 'line', html: 'The hollow point is not on the line.' }, { value: 'range', html: t(sh.h) + ' is not between ' + t('1') + ' and ' + t('5') + '.' }];
        return { prompt: 'Which <b>two</b> statements are reasons the claim is impossible? Tap both.', input: { type: 'select', options: r.shuffle(opts) }, key: ['n', 'W'], answer: opts[0].html + '<br>' + opts[1].html,
          check: K.selectSet(['n', 'W'], function (extra, missing) {
            if (extra.indexOf('line') >= 0) return { code: 'extra', hint: 'Look again: the hollow point <b>is</b> on the student’s line. That is the problem.' };
            if (extra.indexOf('big') >= 0 || extra.indexOf('range') >= 0) return { code: 'extra', hint: 'Check that statement against the graph — it isn’t true.' };
            return { code: 'missed', hint: 'One reason is about ' + t('n') + ' (the figure number) and one is about ' + t('W') + ' (the number of tiles).' };
          }), solution: '<b>About ' + t('n') + ':</b> there is no Figure ' + sh.h + '. <b>About ' + t('W') + ':</b> the counts go ' + t(W(1) + ', ' + W(2) + ', ' + W(3) + ', \\ldots') + ' (up by ' + sh.a + ' each time), and ' + v + ' is not one of them.', hints: ['One reason is about each coordinate.'], text: 'two reasons the claim fails' };
      } },
      { id: 'e13c', level: 'BEG', make: function (r, sh) {
        var v = sh.a * sh.h + sh.b;
        return KP.number('Solve ' + t(lin(sh.a, sh.b, 'n') + '=' + v) + '.', sh.h, function (x) { return feq(x, (v + sh.b) / sh.a) ? { code: 'add-not-sub', hint: 'Subtract ' + sh.b + ' first.' } : null; },
          t(sh.a + 'n=' + (v - sh.b)) + ', ' + t('n=' + sh.h) + '. A count of ' + v + ' could only come from Figure ' + sh.h + ', which does not exist — this backs up both reasons.', ['Subtract, then divide.'], 'solve for half figure', { before: t('n=') });
      } },
      { id: 'e13d', level: 'EMG', make: function (r, sh) {
        var W = function (n) { return sh.a * n + sh.b; }, ns = [1, 2, 3, 4, 5], o = { xName: 'n', yName: 'W' };
        return mcCols(KP.mc(r, 'Which graph shows what the finished graph should look like?', [
          { html: patternGraph(ns.map(function (n) { return [n, W(n)]; }), o), right: true },
          { html: patternGraph(ns.map(function (n) { return [n, W(n)]; }), Object.assign({ join: [[1, W(1)], [5, W(5)]] }, o)), why: 'That is the student’s graph. The variables are discrete, so the points stay separate.' },
          { html: patternGraph(ns.map(function (n) { return [n, W(n)]; }).concat([[sh.h, W(sh.h)]]), o), why: 'There is an extra point at Figure ' + sh.h + ', which doesn’t exist.' },
          { html: patternGraph(ns.map(function (n) { return [n, sh.a * n]; }), o), why: 'Check Figure 1: it has ' + W(1) + ' tiles.' }],
          '<b>Five separate dots</b> at ' + ns.map(function (n) { return t(pt([n, W(n)])); }).join(', ') + ', with nothing drawn between them. Rule: leave the points unconnected when the variables are discrete.', ['Discrete variables: what happens between the points?'], 'correct discrete graph'));
      } }] });
  X.push({ num: '14', stem: function (sh) {
      return '<i>(Error analysis)</i> Asked to write down the coordinates of the marked point ' + t('P') + ', a student wrote ' + t('P' + pt([sh.P[1], sh.P[0]])) + '. The point they actually described is marked ' + t('Q') + '.<br>' +
        HW.graph({ x: [-5, 5], y: [-5, 5], labels: 2, max: 280, points: [{ x: sh.P[0], y: sh.P[1], label: 'P' }, { x: sh.P[1], y: sh.P[0], label: 'Q' }], aria: 'points P and Q' });
    },
    shared: function (r) { var a, b; do { a = r.int(1, 4); b = r.int(1, 4); } while (a === b); var s = r.pick([1, -1]); return { P: [s * a, -s * b] }; },
    parts: [
      { id: 'e14a', level: 'BEG', make: function (r, sh) {
        var x = sh.P[0], y = sh.P[1];
        return pairPart('State the correct coordinates of ' + t('P') + '.', x, y, null, t('P' + pt(sh.P)) + ': from the origin go ' + Math.abs(x) + ' units ' + (x > 0 ? 'right' : 'left') + ' along the ' + t('x') + '-axis, then ' + Math.abs(y) + ' units ' + (y > 0 ? 'up' : 'down') + '.', ['Across first (' + t('x') + '), then up or down (' + t('y') + ').'], 'correct P');
      } },
      { id: 'e14b', level: 'BEG', make: function (r, sh) {
        var Q = [sh.P[1], sh.P[0]], want = { P: quadOf(sh.P), Q: quadOf(Q) };
        return KP.grid('Name the quadrant of ' + t('P') + ' and the quadrant of ' + t('Q') + '.', [{ id: 'P', html: t('P') }, { id: 'Q', html: t('Q') }], QOPT.map(function (q) { return { id: q, html: q }; }), want, { colHead: 'Quadrant' },
          t('P' + pt(sh.P)) + ': ' + t(QSIGN[want.P]) + ', Quadrant ' + want.P + '.<br>' + t('Q' + pt(Q)) + ': ' + t(QSIGN[want.Q]) + ', Quadrant ' + want.Q + '.', ['Use the signs of each point’s coordinates.'], 'quadrants of P and Q');
      } },
      { id: 'e14c', level: 'EMG', make: function (r, sh) {
        return KP.mc(r, 'The student swapped the numbers <i>and</i> the signs travelled with them. Which advice would stop this mistake?', [
          { html: 'Always write the <b>across</b> (' + t('x') + ') value first and the <b>up/down</b> (' + t('y') + ') value second, keeping each sign with its own number.', right: true },
          { html: 'Always write the larger number first.', why: 'Order has nothing to do with size: ' + t('(1, 4)') + ' and ' + t('(4, 1)') + ' are different points.' },
          { html: 'Always write the positive number first.', why: 'The order is fixed by direction (across, then up/down), not by sign.' },
          { html: 'Read the vertical axis first, because it is easier to see.', why: 'That is exactly the mistake: the ' + t('y') + '-value was written first.' }],
          'Always write the <b>across</b> (' + t('x') + ') value first and the <b>up/down</b> (' + t('y') + ') value second, keeping each sign with its own number — “along the hall, then up the stairs.”', ['What does each position in ' + t('(x, y)') + ' mean?'], 'advice for order');
      } },
      { id: 'e14d', level: 'PRG', make: function (r, sh) {
        var a = r.int(2, 6), b = -r.int(1, 6), c = r.int(1, 6);
        return KP.mc(r, 'For which points does swapping the two coordinates make no difference at all?', [
          { html: 'Points whose two coordinates are equal, such as ' + t(pt([a, a])) + ' and ' + t(pt([b, b])) + ' (they lie on the line ' + t('y=x') + ').', right: true },
          { html: 'Points in Quadrant I.', why: t(pt([c, c + 2])) + ' is in Quadrant I, but swapping gives ' + t(pt([c + 2, c])) + ', a different point.' },
          { html: 'Points on an axis.', why: 'Swapping ' + t(pt([0, c])) + ' gives ' + t(pt([c, 0])) + ' — a point on the other axis.' },
          { html: 'Points whose coordinates are opposites, such as ' + t(pt([c, -c])) + '.', why: 'Swapping ' + t(pt([c, -c])) + ' gives ' + t(pt([-c, c])) + ', which is in a different quadrant.' }],
          'Only points whose two coordinates are <b>equal</b>, of the form ' + t('(a, a)') + ' — the points on the line ' + t('y=x') + ', e.g. ' + t(pt([a, a])) + ', ' + t(pt([b, b])) + ' and the origin. Every other point changes when swapped.', ['Try swapping a few points and see which ones stay put.'], 'swap makes no difference');
      } }] });

  /* ----- EP 15–17: stretch and test-style ----- */
  X.push({ num: '15', section: 'Extra practice F — A stretch, and two for the test', stem: function (sh) {
      return '<i>(Stretch)</i> Two dot patterns grow side by side. Pattern ' + t('A') + ' starts larger, but Pattern ' + t('B') + ' grows faster.<br><b>Pattern A</b><br>' +
        figRow([1, 2, 3].map(function (n) { return dotsGrid(n + sh.m, sh.p); }), ['Figure 1', 'Figure 2', 'Figure 3'], { max: 380, gap: 22, label: 'pattern A' }) + '<br><b>Pattern B</b><br>' +
        figRow([1, 2, 3].map(function (n) { return dotsGrid(n, sh.c, sh.t); }), ['Figure 1', 'Figure 2', 'Figure 3'], { max: 300, gap: 22, label: 'pattern B' });
    },
    shared: function (r) {
      var p, m, c, tl, ns;
      for (var g = 0; g < 500; g++) {
        p = r.pick([2, 3, 3]); c = r.int(p + 1, Math.min(6, p + 3)); tl = r.int(1, 3); m = r.int(2, 6);
        var num = p * m - tl, den = c - p;
        if (num > 0 && num % den === 0) { ns = num / den; if (ns >= 3 && ns <= 7 && (c % 2 === 1 || r.chance(0.3))) break; }
      }
      if (!ns || ns < 3 || ns > 7) { p = 3; m = 4; c = 5; tl = 2; ns = 5; }
      return { p: p, m: m, c: c, t: tl, ns: ns, A: function (n) { return p * (n + m); }, B: function (n) { return c * n + tl; } };
    },
    parts: [
      { id: 'e15a', level: 'BEG', outcome: 'RF2', make: function (r, sh) {
        var fl = [], ch = [], keys = [];
        [1, 2, 3].forEach(function (n) { fl.push({ label: t('A') + ', Figure ' + n, mode: 'number' }); ch.push(K.number(sh.A(n))); keys.push(String(sh.A(n))); });
        [1, 2, 3].forEach(function (n) { fl.push({ label: t('B') + ', Figure ' + n, mode: 'number' }); ch.push(K.number(sh.B(n), function (v) { return v === sh.c * n ? { code: 'forgot-centre', hint: 'Don’t forget the tail of ' + sh.t + ' dot' + (sh.t > 1 ? 's' : '') + '.' } : null; })); keys.push(String(sh.B(n))); });
        return KP.fields('Count the dots in each figure.', fl, ch, keys, 'A: ' + [1, 2, 3].map(function (n) { return t(sh.A(n)); }).join(', ') + '; B: ' + [1, 2, 3].map(function (n) { return t(sh.B(n)); }).join(', '),
          'Pattern A: ' + sh.p + ' rows of ' + t('n+' + sh.m) + ' dots: ' + [1, 2, 3].map(function (n) { return t(sh.A(n)); }).join(', ') + '.<br>Pattern B: ' + t('n') + ' columns of ' + sh.c + ' plus a tail of ' + sh.t + ': ' + [1, 2, 3].map(function (n) { return t(sh.B(n)); }).join(', ') + '.', ['Count rows × dots per row for A; columns × dots per column, plus the tail, for B.'], 'count dots A and B');
      } },
      { id: 'e15b', level: 'EMG', outcome: 'RF2', make: function (r, sh) {
        var q = sh.p * sh.m;
        return eqPart('Pattern ' + t('A') + ' is always ' + sh.p + ' rows of dots. Write an equation for ' + t('A') + ' in terms of ' + t('n') + '.', 'A', linP(sh.p, q, 'n'), lin(sh.p, q, 'n'), [
          { is: linP(sh.p, sh.m, 'n'), code: 'value', hint: 'Each of the ' + sh.p + ' rows has ' + t('n+' + sh.m) + ' dots, so the ' + sh.m + ' is multiplied by ' + sh.p + ' too: ' + t(sh.p + '(n+' + sh.m + ')') + '.' },
          { is: linP(sh.p, sh.A(1), 'n'), code: 'first-term', hint: 'Test Figure 1: that gives ' + (sh.p + sh.A(1)) + ', not ' + sh.A(1) + '.' }],
          'Figure ' + t('n') + ' is ' + sh.p + ' rows of ' + t('n+' + sh.m) + ' dots: ' + t('A=' + sh.p + '(n+' + sh.m + ')=' + lin(sh.p, q, 'n')), ['How many dots are in each row of Figure ' + t('n') + '?'], 'A=' + lin(sh.p, q, 'n'));
      } },
      { id: 'e15c', level: 'EMG', outcome: 'RF2', make: function (r, sh) {
        return eqPart('Pattern ' + t('B') + ' is ' + t('n') + ' full columns plus a fixed tail. Write an equation for ' + t('B') + ' in terms of ' + t('n') + '.', 'B', linP(sh.c, sh.t, 'n'), lin(sh.c, sh.t, 'n'), [
          { is: linP(sh.c, 0, 'n'), code: 'no-constant', hint: 'Don’t forget the tail of ' + sh.t + '.' },
          { is: linP(1, sh.c + sh.t, 'n'), code: 'step-as-const', hint: 'Each figure adds a whole column of ' + sh.c + ' dots.' }],
          t('n') + ' columns of ' + sh.c + ' dots, plus a tail of ' + sh.t + ': ' + t('B=' + lin(sh.c, sh.t, 'n')), ['How many dots does each new column add?'], 'B=' + lin(sh.c, sh.t, 'n'));
      } },
      { id: 'e15d', level: 'PRG', make: function (r, sh) {
        var q = sh.p * sh.m;
        return KP.number('At which figure number do the two patterns have the same number of dots? Solve ' + t('A=B') + '.', sh.ns, function (v) {
          if (feq(v, (q + sh.t) / (sh.c - sh.p))) return { code: 'sign', hint: 'Collect the constants on one side: ' + t(q + '-' + sh.t) + ', not ' + t(q + '+' + sh.t) + '.' };
          if (feq(v, (q - sh.t) / (sh.c + sh.p))) return { code: 'sign', hint: 'Move ' + t(sh.p + 'n') + ' to the other side by <b>subtracting</b> it.' };
          return null;
        }, t(lin(sh.p, q, 'n') + '=' + lin(sh.c, sh.t, 'n')) + '<br>' + t(q + '-' + sh.t + '=' + sh.c + 'n-' + sh.p + 'n') + '<br>' + t((q - sh.t) + '=' + (sh.c - sh.p) + 'n') + '<br>' + t('n=' + sh.ns) + ': Figure ' + sh.ns + '.', ['Set the two expressions equal. Collect the ' + t('n') + ' terms on one side and the numbers on the other.'], 'solve A=B', { before: t('n=') });
      } },
      { id: 'e15e', level: 'EMG', make: function (r, sh) {
        var v = sh.A(sh.ns);
        return KP.number('How many dots does each pattern have at that figure?', v, function (x) { return x === sh.ns ? { code: 'value', hint: 'That is the figure number. Substitute it into either equation.' } : null; },
          t('A=' + sh.p + '(' + sh.ns + ')+' + sh.p * sh.m + '=' + v) + ', ' + t('B=' + sh.c + '(' + sh.ns + ')+' + sh.t + '=' + sh.B(sh.ns)) + ' ✓ — ' + v + ' dots each.', ['Substitute your figure number into both equations.'], 'dots at the match', { after: 'dots' });
      } },
      { id: 'e15f', level: 'PRG', make: function (r, sh) {
        var opts = []; for (var n = 1; n <= sh.ns + 3; n++) opts.push(String(n));
        var want = opts.filter(function (n) { return sh.A(Number(n)) > sh.B(Number(n)); });
        return selectPart('For which figure numbers does Pattern ' + t('A') + ' have <b>more</b> dots than Pattern ' + t('B') + '? Tap every one.', opts, want, function (extra, missing) {
          if (extra.indexOf(String(sh.ns)) >= 0) return { code: 'extra', hint: 'At Figure ' + sh.ns + ' they are <b>equal</b>, not more.' };
          if (extra.length) return { code: 'extra', hint: 'At Figure ' + extra[0] + ': ' + t('A=' + sh.A(Number(extra[0]))) + ' and ' + t('B=' + sh.B(Number(extra[0]))) + '.' };
          return { code: 'missed', hint: 'Pattern A is ahead from Figure 1 until they meet.' };
        }, 'A is ahead for ' + t('n=' + want.join(', ')) + ': for example ' + t(sh.A(1) + '>' + sh.B(1)) + '. They tie at ' + t('n=' + sh.ns) + ', and after that B leads, because B gains ' + sh.c + ' per figure and A only ' + sh.p + '.', ['Make a table of both patterns for Figures 1 to ' + (sh.ns + 1) + '.'], 'A ahead of B');
      } },
      { id: 'e15g', level: 'PRG', make: function (r, sh) {
        return KP.mc(r, 'The solution of ' + t('A=B') + ' happened to be a whole number. Why would a non-whole-number solution have meant the patterns never actually match?', [
          { html: 'Figure numbers are discrete: a solution like ' + t('n=4.6') + ' names a figure that doesn’t exist, so the counts would cross <i>between</i> figures and never be equal at an actual figure.', right: true },
          { html: 'Because the equations would have no solution at all.', why: 'Two lines with different slopes always cross — the question is whether they cross at a whole-number figure.' },
          { html: 'Because you would have to round, and rounding is not allowed.', why: 'If ' + t('n=4.6') + ', try Figures 4 and 5: are the counts equal at either one?' },
          { html: 'They would match at the nearest whole figure.', why: 'Check with numbers: the counts are equal only at the exact solution, and that figure doesn’t exist.' }],
          'Figure numbers are <b>discrete</b>. A solution such as ' + t('n=4.6') + ' would name a figure that does not exist: the counts would cross between figures and never be equal at any actual figure.', ['What kind of number is a figure number?'], 'non-whole solution meaning');
      } }] });
  X.push({ num: '16', stem: '<i>(Multiple Choice)</i>', parts: [
    { id: 'e16', level: 'PRG', make: function (r) {
      var V = r.pick([
        { c: 'xy<0', d: 'y>x', q: 'II', s: t('xy<0') + ': opposite signs, so Quadrant II ' + t('(-,+)') + ' or IV ' + t('(+,-)') + '. In II, ' + t('x<0<y') + ', so ' + t('y>x') + ' always ✓. In IV, ' + t('y<0<x') + ', so ' + t('y>x') + ' never ✗.' },
        { c: 'xy<0', d: 'y<x', q: 'IV', s: t('xy<0') + ': Quadrant II or IV. In IV, ' + t('y<0<x') + ', so ' + t('y<x') + ' always ✓. In II, ' + t('x<0<y') + ' ✗.' },
        { c: 'xy>0', d: 'x+y<0', q: 'III', s: t('xy>0') + ': Quadrant I or III. In I the sum is positive ✗; in III both are negative, so ' + t('x+y<0') + ' ✓.' },
        { c: 'xy>0', d: 'x+y>0', q: 'I', s: t('xy>0') + ': Quadrant I or III. In III the sum is negative ✗; in I both are positive, so ' + t('x+y>0') + ' ✓.' },
        { c: 'xy<0', d: 'x<y', q: 'II', s: t('xy<0') + ': Quadrant II or IV. In II, ' + t('x<0<y') + ' ✓; in IV, ' + t('x>0>y') + ' ✗.' }]);
      return quadMC(r, 'A point ' + t('P(x, y)') + ' satisfies both ' + t(V.c) + ' and ' + t(V.d) + '. The point ' + t('P') + ' must lie in', V.q, V.s + ' <b>Quadrant ' + V.q + '</b>.',
        ['First use ' + t(V.c) + ' to narrow it to two quadrants. Then test each one against ' + t(V.d) + '.'], 'two sign conditions ' + V.c + ', ' + V.d,
        function (q) { return 'Test Quadrant ' + q + ' ' + t(QSIGN[q]) + ': does it satisfy <b>both</b> ' + t(V.c) + ' and ' + t(V.d) + '? Pick numbers to check.'; });
    } }] });
  X.push({ num: '17', stem: '<i>(Numerical Response)</i>', parts: [
    { id: 'e17', level: 'PRG', make: function (r) {
      var a1 = r.int(5, 12), d = r.int(4, 8), n = r.int(25, 60), v = a1 + d * (n - 1), c = a1 - d;
      return KP.nr('In a growing pattern, Figure ' + t('1') + ' contains ' + t(a1) + ' dots and every figure after it contains ' + t(d) + ' more dots than the figure before. The number of the figure that contains exactly ' + t(v) + ' dots is ________.', n, function (x) {
        if (feq(x, (v - a1) / d)) return { code: 'off-by-one', hint: 'You found how many figures come <b>after</b> Figure 1. Add 1 (or use ' + t('D=' + lin(d, c, 'n')) + ').' };
        if (feq(x, v / d)) return { code: 'no-subtract', hint: 'Write the rule first: ' + t('D=' + a1 + '+' + d + '(n-1)') + '.' };
        if (feq(x, (v - a1) / d + 2)) return { code: 'off-by-one', hint: 'Check with Figure 2: it has ' + (a1 + d) + ' dots.' };
        return null;
      }, t('D=' + a1 + '+' + d + '(n-1)=' + lin(d, c, 'n')) + '<br>' + t(lin(d, c, 'n') + '=' + v) + '<br>' + t(d + 'n=' + (v - c)) + '<br>' + t('n=' + n) + '. Figure ' + n + '.', ['Write an equation for the number of dots in Figure ' + t('n') + ' first.'], 'NR figure with ' + v + ' dots');
    } }] });

  HW.defineLesson({
    id: 'u5l1', unit: 5, num: '1', title: 'The Cartesian Plane, Growing Patterns, and Types of Variables', outcome: 'RF1',
    blurb: 'Plotting and naming points, describing a growing pattern with a table, a graph and an equation, and telling discrete variables from continuous ones.',
    questions: QUESTIONS, extra: X
  });
})(window);
