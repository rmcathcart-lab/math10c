/* Math 10C · Unit 7 · Lesson 5 — Graphing Linear Equations: A Strategy for Every Form (RF4 / RF5 / RF6 / RF7)
 * Assignment questions 1–11 (u7_L05.tex) and the Lesson 5 Extra Practice (u7_EP05.tex).
 * Every part is a generator: it keeps the idea and difficulty of the booklet question (the booklet's numbers are one of
 * the possible versions) and changes the numbers. Graphing a line is a graph-pad drawing (arrow-ended line through any
 * two grid points on it); equations use K.P.line. Levels: LIM BEG EMG PRG ADV MAS. */
(function (root) {
  'use strict';
  var HW = root.HW, K = HW.kit, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form, Ln = HW.lines, DR = HW.draw, ex = HW.ex, frT = Ln.frT;

  /* ---------- numbers ---------- */
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var c = a % b; a = b; b = c; } return a; }
  function lcm(a, b) { return a / gcd(a, b) * b; }
  function fr(p, q) { if (q < 0) { p = -p; q = -q; } var g = gcd(p, q) || 1; return [p / g + 0, q / g]; }
  function fT(f) { return frT(f[0], f[1]); }
  function nT(x) { return Number.isInteger(x) ? String(x + 0) : fT(Ln.toFr(x)); }
  function pt(p) { return '(' + nT(p[0]) + ',\\ ' + nT(p[1]) + ')'; }
  function ptt(p) { return t(pt(p)); }
  function sg(n) { return n < 0 ? '-' + (-n) : '+' + n; }          // signed constant for LaTeX
  function mf(m) { return Array.isArray(m) ? fr(m[0], m[1]) : [m, 1]; }
  function stepT(m) { m = mf(m); return (m[0] < 0 ? 'down ' + (-m[0]) : 'up ' + m[0]) + ', right ' + m[1]; }
  function cl(n) { return Math.round(n * 1e6) / 1e6; }

  /* ---------- lines: A x + B y + C = 0, integers, no common factor, A > 0 (or A = 0, B > 0) ---------- */
  function line(A, B, C) { var g = gcd(gcd(A, B), C) || 1; A /= g; B /= g; C /= g; if (A < 0 || (A === 0 && B < 0)) { A = -A; B = -B; C = -C; } return { A: A + 0, B: B + 0, C: C + 0 }; }
  function thru(p, q) { var A = q[1] - p[1], B = p[0] - q[0]; return line(A, B, -(A * p[0] + B * p[1])); }
  function ms(m, p0) { m = mf(m); return line(m[0], -m[1], m[1] * p0[1] - m[0] * p0[0]); }   // slope m through p0
  function mb(m, b) { return ms(m, [0, b]); }
  function slopeOf(Lo) { return Lo.B === 0 ? null : fr(-Lo.A, Lo.B); }
  function yInt(Lo) { return fr(-Lo.C, Lo.B); }
  function xInt(Lo) { return fr(-Lo.C, Lo.A); }
  function fv(f) { return f[0] / f[1]; }
  function onL(Lo, p) { return Math.abs(Lo.A * p[0] + Lo.B * p[1] + Lo.C) < 1e-9; }
  function sameL(a, b) { return a.A === b.A && a.B === b.B && a.C === b.C; }
  function yAt(Lo, x) { return cl(-(Lo.A * x + Lo.C) / Lo.B); }
  function xAt(Lo, y) { return cl(-(Lo.B * y + Lo.C) / Lo.A); }
  function lat(Lo, xr, yr) {
    var out = [];
    if (Lo.B === 0) { var x0 = -Lo.C / Lo.A; if (Number.isInteger(x0) && x0 >= xr[0] && x0 <= xr[1]) for (var y = Math.ceil(yr[0]); y <= yr[1]; y++) out.push([x0 + 0, y]); return out; }
    for (var x = Math.ceil(xr[0]); x <= xr[1]; x++) { var yy = -(Lo.A * x + Lo.C) / Lo.B; if (Number.isInteger(yy) && yy >= yr[0] && yy <= yr[1]) out.push([x, yy + 0]); }
    return out;
  }
  function far(Lo, win) { var L2 = lat(Lo, win[0], win[1]); if (L2.length < 2) L2 = lat(Lo, [-60, 60], [-600, 600]); return [L2[0], L2[L2.length - 1]]; }
  function arrow(p, q) { return { pts: [], pieces: [{ v: [p, q], s: 'arrow', e: 'arrow' }], join: 'none' }; }
  function lineV(Lo, win) { var e = far(Lo, win); return arrow(e[0], e[1]); }
  function linesV(list, win) { var v = { pts: [], pieces: [], join: 'none' }; list.forEach(function (Lo) { v.pieces = v.pieces.concat(lineV(Lo, win).pieces); }); return v; }
  function segV(Lo, win) { var e = far(Lo, win); return { pts: [], pieces: [{ v: [e[0], e[1]], s: 'closed', e: 'closed' }], join: 'none' }; }
  function si(Lo, vars) { return Ln.tex(Lo, 'slope-intercept', null, vars); }
  function gen(Lo, vars) { return Ln.tex(Lo, 'general', null, vars); }
  function ps(Lo, p) { return Ln.tex(Lo, 'point-slope', p); }
  function keyOf(Lo, win) { return Object.keys(DR.geom(lineV(Lo, win)).lines)[0]; }

  /* ---------- figures ---------- */
  function fig(Lo, win, o) {   // a line drawn on a grid (arrows to the edges), optional marked points
    o = o || {};
    return DR.graphOf({ x: win[0], y: win[1], labels: o.labels || 2, bg: { points: (o.marks || []).map(function (p) { return { x: p[0], y: p[1], color: '#2b3340' }; }) } }, Lo ? lineV(Lo, win) : { pts: [], pieces: [] }, { max: o.max || 240 });
  }
  function figs(items) {   // [{ label, html }] side by side, wrapping on a phone
    return '<div style="display:flex;flex-wrap:wrap;gap:10px 14px;justify-content:center;margin:6px 0">' + items.map(function (it) { return '<div style="text-align:center;flex:0 1 148px;min-width:0"><div><b>' + it.label + '</b></div>' + it.html + '</div>'; }).join('') + '</div>';
  }
  function dashed(Lo, win) { var e = far(Lo, win), pc = DR.extendPiece({ v: [e[0], e[1]], s: 'arrow', e: 'arrow' }, win[0], win[1]); return { pts: pc.v, start: 'none', end: 'none', dash: true, color: '#c4532a' }; }

  /* ---------- graph-pad parts ---------- */
  function pad(win, o) { return Object.assign({ x: win[0], y: win[1], grid: 1, labels: 2, mode: 'lines', defaultEnd: 'arrow', max: 360 }, o || {}); }
  /* graphExact plus: points only (no line yet), a line through a known point with the wrong slope, the right slope in the wrong place */
  function lineCheck(key, Ls, opt) {
    opt = opt || {};
    var base = K.graphExact(key, { wrong: opt.wrong || [] });
    return function (resp) {
      var res = base(resp); if (res.v !== 'wrong' || res.code !== 'graph') return res;
      var v = DR.norm(resp);
      if (!v.pieces.length && v.pts.length) {
        var off = v.pts.filter(function (p) { return !Ls.some(function (Lo) { return onL(Lo, p); }); })[0];
        if (off) return wrong('l5-point-off', ptt(off) + ' is not on the line. Substitute it into the equation to check, then fix it.');
        return wrong('l5-points-only', v.pts.length > 1 ? 'Your points are on the line — now draw the line through them (Line tool), with arrows on both ends.' : 'That point is on the line — but one point doesn’t fix a line. Find a second point, then draw the line through them.');
      }
      if (Ls.length === 1) {
        var g = DR.geom(resp), ks = Object.keys(g.lines);
        if (ks.length === 1) {
          var S = g.lines[ks[0]], T = Ls[0], sm = S.B === 0 ? null : -S.A / S.B, tm = T.B === 0 ? null : -T.A / T.B;
          var sameSlope = sm === tm || (sm != null && tm != null && Math.abs(sm - tm) < 1e-9);
          if (T.B === 0 && S.A === 0) return wrong('l5-gr-hv', 'You drew a horizontal line. There is no ' + t('y') + ' in this equation — ' + t('x') + ' is fixed — so the line is <b>vertical</b>.');
          if (T.A === 0 && S.B === 0) return wrong('l5-gr-hv', 'You drew a vertical line. There is no ' + t('x') + ' in this equation — ' + t('y') + ' is fixed — so the line is <b>horizontal</b>.');
          var an = (opt.anchor || []).filter(function (a) { return Math.abs(S.A * a.p[0] + S.B * a.p[1] - S.C) < 1e-6; })[0];
          if (an && !sameSlope) return wrong('l5-slope', an.hint);
          if (sameSlope) return wrong('l5-shift', 'Right slope — your line is parallel to the right one, but in the wrong place. ' + (opt.placeHint || 'Check your starting point.'));
        }
      }
      return res;
    };
  }
  /* The pad continues an existing line when a new line is started at its end point, so a student who draws the next
   * line from a shared point (a vertex, an intersection) gets one bent polyline. For questions where every answer is a
   * full line, read each straight run of an arrow-ended polyline as its own line. */
  function splitBends(value) {
    var v = DR.norm(value), out = [];
    v.pieces.forEach(function (pc) {
      if (pc.v.length < 3 || pc.s !== 'arrow' || pc.e !== 'arrow') { out.push(pc); return; }
      var runs = [[pc.v[0], pc.v[1]]];
      for (var i = 2; i < pc.v.length; i++) {
        var run = runs[runs.length - 1], a = run[run.length - 2], b = run[run.length - 1], c = pc.v[i];
        if (Math.abs((b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0])) < 1e-9) run.push(c); else runs.push([b, c]);
      }
      runs.forEach(function (rv) { out.push({ v: rv, s: 'arrow', e: 'arrow' }); });
    });
    return { pts: v.pts, pieces: out, join: v.join };
  }
  /* several lines on one grid: names the line that is missing or wrong */
  function multiCheck(key, Ls, names, win) {
    var base = K.graphExact(key), keys = Ls.map(function (Lo) { return keyOf(Lo, win); });
    return function (resp) {
      resp = splitBends(resp);
      var res = base(resp); if (res.v !== 'wrong' || res.code !== 'graph') return res;
      var have = Object.keys(DR.geom(resp).lines), miss = [], extra = have.filter(function (k) { return keys.indexOf(k) < 0; });
      keys.forEach(function (k, i) { if (have.indexOf(k) < 0) miss.push(names[i]); });
      if (miss.length && !extra.length) return wrong('l5-line-missing', 'Correct so far — still to draw: ' + miss.join(' and ') + '.');
      if (miss.length && extra.length && miss.length < Ls.length) return wrong('l5-line-wrong', 'Not all of your lines are right yet: check ' + miss.join(' and ') + '.');
      return res;
    };
  }
  /* w: [{ L (a line) or v (a drawing), code, hint }] classic mistakes, also used as bad drawings */
  function gpart(prompt, Ls, win, o, sol, hints, text) {
    o = o || {}; Ls = Array.isArray(Ls) ? Ls : [Ls];
    var key = linesV(Ls, win);
    var W = (o.wrong || []).map(function (w) { return { is: w.v || lineV(w.L, win), code: w.code, hint: w.hint }; }).filter(function (w) { return !DR.same(w.is, key); });
    var check = o.names ? multiCheck(key, Ls, o.names, win) : lineCheck(key, Ls, { wrong: W, anchor: o.anchor, placeHint: o.placeHint });
    if (o.names && W.length) { var mc0 = check, wc = K.graphExact(key, { wrong: W }); check = function (resp) { var r1 = wc(splitBends(resp)); if (r1.v === 'wrong' && r1.code !== 'graph') return r1; return mc0(resp); }; }
    var p = K.P.graph(prompt, pad(win, o.pad), check, key, sol, hints, text);
    p.bad = W.map(function (w) { return w.is; }).concat(Ls.length === 1 ? [segV(Ls[0], win)] : []);
    return p;
  }
  function mc(r, prompt, opts, sol, hints, text, keep) {
    var seen = {}, o2 = opts.filter(function (o) { if (seen[o.html]) return false; seen[o.html] = 1; return true; });
    return K.P.mc(r, prompt, o2, sol, hints, text, keep);
  }
  /* ordered pairs with extra diagnoses: alts = [{ pairs, code, hint }] */
  function pairsPart(prompt, pairs, alts, sol, hints, text) {
    var key = function (ps0) { return ps0.map(function (p) { return p.join(','); }).sort().join(';'); }, k0 = key(pairs);
    alts = alts.filter(function (a) { return key(a.pairs) !== k0; });
    var p = K.P.pairs(prompt, pairs, {}, sol, hints, text), base = p.check, al = alts.map(function (a) { return { c: K.pairs(a.pairs), code: a.code, hint: a.hint }; });
    p.check = function (resp) { var r0 = base(resp); if (r0.v !== 'wrong') return r0; for (var i = 0; i < al.length; i++) if (al[i].c(resp).v === 'correct') return wrong(al[i].code, al[i].hint); return r0; };
    p.bad = alts.map(function (a) { return '\\{' + a.pairs.map(function (q) { return '(' + q[0] + ', ' + q[1] + ')'; }).join(', ') + '\\}'; });
    return p;
  }
  function readPair(resp) {
    var s = String(resp || '').replace(/\\left|\\right/g, '').replace(/\\\{|\\\}|\\lbrace|\\rbrace/g, '').replace(/^\{|\}$/g, '').trim();
    var m = /^\(([^()]*)\)$/.exec(s); if (!m) return null; var xy = m[1].split(','); if (xy.length !== 2) return null;
    var a = ex.parse(xy[0].trim()), b = ex.parse(xy[1].trim()); if (!a.ok || !b.ok) return null; return [ex.value(a.ast), ex.value(b.ast)];
  }
  /* "x = …" answers: the right line, solved for x */
  function solvedForX(Lo) {
    var base = K.line(Lo);
    return function (resp) {
      var r0 = base(resp); if (r0.v !== 'correct') return r0;
      var rd = Ln.read(resp), la = rd.lAst; while (la && la.t === 'paren') la = la.a;
      var noX = Object.keys(rd.R).every(function (k) { return !rd.R[k].v.x; });
      if (la && la.t === 'var' && la.n === 'x' && noX) return ok();
      return form('l5-solve-x', 'Right relation — now solve it for ' + t('x') + ': write it as ' + t('x=\\ldots') + ' with only ' + t('y') + ' on the right side.');
    };
  }
  /* slope–point form using either of two given points */
  function psEither(Lo, P1, P2) {
    var c1 = K.line(Lo, { form: 'point-slope', point: P1 }), c2 = K.line(Lo, { form: 'point-slope', point: P2 });
    return function (resp) {
      var a = c1(resp); if (a.v === 'correct') return a; var b = c2(resp); if (b.v === 'correct') return b;
      if (a.code === 'line-form-point') return form('line-form-point', 'Right line — but use one of the marked points, ' + ptt(P1) + ' or ' + ptt(P2) + ', as ' + t('(x_1,\\ y_1)') + '.');
      return a;
    };
  }
  function nw(h) { return '<span style="white-space:nowrap">' + h + '</span>'; }
  function ctab(xs, ys, xh, yh) {   // compact table for wide numbers
    var td = function (v, th) { return '<' + (th ? 'th' : 'td') + ' style="padding:4px 5px;min-width:0">' + (typeof v === 'number' ? (v < 0 ? '−' + (-v) : v) : HW.tex(v)) + '</' + (th ? 'th' : 'td') + '>'; };
    return '<div style="overflow-x:auto"><table class="vtab" style="font-size:14px"><tr>' + td(xh, 1) + xs.map(function (v) { return td(v); }).join('') + '</tr><tr>' + td(yh, 1) + ys.map(function (v) { return td(v); }).join('') + '</tr></table></div>';
  }
  function vtab(xs, ys, xh, yh) { return '<div style="overflow-x:auto">' + HW.valueTable([[xh || t('x')].concat(xs), [yh || t('y')].concat(ys)]) + '</div>'; }

  HW.addCodes({
    'l5-points-only': 'Plotted points but no line', 'l5-point-off': 'Plotted a point not on the line', 'l5-slope': 'Right starting point, wrong slope', 'l5-shift': 'Right slope, wrong position',
    'l5-line-missing': 'A line missing', 'l5-line-wrong': 'One of the lines wrong', 'l5-gr-sign': 'Graphed with the slope sign wrong', 'l5-gr-flip': 'Graphed run over rise', 'l5-gr-bx': 'Plotted b on the x-axis',
    'l5-gr-bsign': 'Wrong sign on the y-intercept', 'l5-gr-axes': 'Intercepts on the wrong axes', 'l5-gr-coef': 'Used coefficients as intercepts', 'l5-gr-isign': 'Intercept signs wrong', 'l5-gr-pt': 'Point signs not flipped (slope–point)',
    'l5-gr-y1': 'Used y₁ as the y-intercept', 'l5-gr-round': 'Rounded a fractional intercept', 'l5-gr-hv': 'Horizontal / vertical mixed up', 'l5-gr-half': 'Forgot to divide by the coefficient', 'l5-gr-student': 'Redrew the student’s wrong line',
    'l5-solve-x': 'Not solved for x', 'l5-rise': 'Slope sign (cooling = negative)', 'l5-run': 'Change in y not divided by the run', 'l5-nodiv': 'Didn’t divide every term', 'l5-dist': 'Didn’t distribute the slope',
    'l5-window-x': 'Window misses an x-intercept', 'l5-window-y': 'Window misses a y-intercept', 'l5-window-big': 'Window far too large', 'l5-window-order': 'Window min/max reversed', 'l5-int-swap': 'x- and y-intercepts swapped',
    'l5-ps-sign': 'Point read with the bracket signs', 'l5-b-table': 'Took b from a table value not at x = 0', 'l5-step': 'Slope from y-change alone', 'l5-c-sign': 'Sign slip moving the constant', 'l5-nr-dist': 'Slope not distributed',
    'l5-pair-axes': 'Intercepts on the wrong axes', 'l5-pair-coef': 'Coefficients taken as intercepts', 'l5-origin': 'Gave (0, 0) again', 'l5-not-on': 'Point not on the line', 'l5-tab-sign': 'Sign slip in a table value', 'l5-half-area': 'Forgot the ½ in the area'
  });

  var W6 = [[-6, 6], [-6, 6]], W8 = [[-8, 8], [-8, 8]], W10 = [[-10, 10], [-10, 10]];
  var STRAT = 'Without using technology and without altering the form in which the equation is written, ';

  /* ---------- reusable graph makers (slope–intercept, slope–point, general by intercepts) ---------- */
  function siGraph(prompt, m, b, win, text) {
    m = mf(m); var Lo = mb(m, b), P1 = [m[1], b + m[0]];
    return gpart(prompt, Lo, win, {
      wrong: [{ L: mb([-m[0], m[1]], b), code: 'l5-gr-sign', hint: 'Check the direction: the slope ' + t(fT(m)) + ' is ' + (m[0] < 0 ? 'negative, so the line falls' : 'positive, so the line rises') + ' from left to right.' },
        { L: mb([m[1] * (m[0] < 0 ? -1 : 1), Math.abs(m[0])], b), code: 'l5-gr-flip', hint: 'Slope is <b>rise over run</b>: ' + t('m=' + fT(m)) + ' means ' + stepT(m) + ' — you stepped run over rise.' },
        { L: ms(m, [b, 0]), code: 'l5-gr-bx', hint: t('b=' + b) + ' is the <b>' + t('y') + '-intercept</b>: start at ' + ptt([0, b]) + ' on the ' + t('y') + '-axis, not on the ' + t('x') + '-axis.' },
        { L: mb(m, -b), code: 'l5-gr-bsign', hint: 'Check the sign of the ' + t('y') + '-intercept: the line crosses the ' + t('y') + '-axis at ' + ptt([0, b]) + '.' }],
      anchor: [{ p: [0, b], hint: 'Your line starts at the right place, ' + ptt([0, b]) + '. Now check the slope: ' + t('m=' + fT(m)) + ' means ' + stepT(m) + '.' }],
      placeHint: 'Start at the ' + t('y') + '-intercept ' + ptt([0, b]) + '.' },
      'Slope–intercept form: ' + t('m=' + fT(m)) + ' and ' + t('b=' + b) + ' are read straight off.<br>Plot ' + ptt([0, b]) + '. From there step ' + stepT(m) + ' to ' + ptt(P1) + ', and again to ' + ptt([2 * m[1], b + 2 * m[0]]) + '.<br>Join the points and extend the line both ways (arrows).',
      ['Plot the ' + t('y') + '-intercept first.', 'Then use rise over run: ' + t('m=' + fT(m)) + '.'], text);
  }
  function psGraph(prompt, m, P0, win, text) {
    m = mf(m); var Lo = ms(m, P0), P1 = [P0[0] + m[1], P0[1] + m[0]];
    return gpart(prompt, Lo, win, {
      wrong: [{ L: ms(m, [-P0[0], -P0[1]]), code: 'l5-gr-pt', hint: 'The numbers in the brackets have the <b>opposite</b> signs to the coordinates: ' + t(ps(Lo, P0)) + ' is ' + t('y-(' + P0[1] + ')=' + fT(m) + '(x-(' + P0[0] + '))') + ', so the point is ' + ptt(P0) + '.' },
        { L: ms([-m[0], m[1]], P0), code: 'l5-gr-sign', hint: 'Right point. Check the direction: the slope ' + t(fT(m)) + ' is ' + (m[0] < 0 ? 'negative — the line falls' : 'positive — the line rises') + ' from left to right.' },
        { L: ms(m, [0, P0[1]]), code: 'l5-gr-y1', hint: t(String(P0[1])) + ' isn’t the ' + t('y') + '-intercept. Slope–point form hands you the point ' + ptt(P0) + ' — start there.' },
        { L: ms([m[1] * (m[0] < 0 ? -1 : 1), Math.abs(m[0])], P0), code: 'l5-gr-flip', hint: 'Slope is <b>rise over run</b>: ' + t('m=' + fT(m)) + ' means ' + stepT(m) + '.' }],
      anchor: [{ p: P0, hint: 'Your line goes through the right point, ' + ptt(P0) + '. Now check the slope: ' + t('m=' + fT(m)) + ' means ' + stepT(m) + '.' }],
      placeHint: 'Start at the point the equation hands you, ' + ptt(P0) + '.' },
      'Slope–point form: ' + t(ps(Lo, P0)) + ' matches ' + t('y-y_1=m(x-x_1)') + ' with ' + t('m=' + fT(m)) + ' and ' + t('(x_1,\\ y_1)=' + pt(P0)) + ' (the signs flip).<br>Plot ' + ptt(P0) + '. Step ' + stepT(m) + ' to ' + ptt(P1) + ' (and again, or step back the other way).<br>Join the points and extend the line both ways.',
      ['Match the equation to ' + t('y-y_1=m(x-x_1)') + ': which point and which slope does it hand you?', 'Careful with signs: ' + t('x+2') + ' means ' + t('x-(-2)') + '.'], text);
  }
  function intGraph(prompt, p, q, win, text) {   // general form with integer intercepts (p, 0), (0, q)
    var Lo = thru([p, 0], [0, q]);
    return gpart(prompt, Lo, win, {
      wrong: [{ L: thru([0, p], [q, 0]), code: 'l5-gr-axes', hint: 'Your intercepts are on the wrong axes. The ' + t('x') + '-intercept ' + t(p) + ' sits on the ' + t('x') + '-axis at ' + ptt([p, 0]) + '; the ' + t('y') + '-intercept ' + t(q) + ' at ' + ptt([0, q]) + '.' },
        { L: Math.abs(Lo.A) <= 60 && Lo.B ? thru([Lo.A, 0], [0, Lo.B]) : null, code: 'l5-gr-coef', hint: 'The coefficients of ' + t('x') + ' and ' + t('y') + ' are not the intercepts. Substitute ' + t('y=0') + ' to find the ' + t('x') + '-intercept, and ' + t('x=0') + ' for the ' + t('y') + '-intercept.' },
        { L: thru([-p, 0], [0, -q]), code: 'l5-gr-isign', hint: 'Check the signs when you solve: put ' + t('y=0') + ' into ' + t(gen(Lo)) + ' and solve for ' + t('x') + ' carefully.' }].filter(function (w) { return w.L; }),
      anchor: [{ p: [p, 0], hint: 'Your line goes through the ' + t('x') + '-intercept ' + ptt([p, 0]) + ' — good. Now check the ' + t('y') + '-intercept: substitute ' + t('x=0') + '.' },
        { p: [0, q], hint: 'Your line goes through the ' + t('y') + '-intercept ' + ptt([0, q]) + ' — good. Now check the ' + t('x') + '-intercept: substitute ' + t('y=0') + '.' }] },
      'General form: use the intercepts.<br>' + t('y=0') + ': ' + t((Lo.A === 1 ? '' : Lo.A) + 'x' + sg(Lo.C) + '=0') + ', so ' + t('x=' + p) + ' → ' + ptt([p, 0]) + '.<br>' + t('x=0') + ': ' + t((Lo.B === 1 ? '' : Lo.B === -1 ? '-' : Lo.B) + 'y' + sg(Lo.C) + '=0') + ', so ' + t('y=' + q) + ' → ' + ptt([0, q]) + '.<br>Plot both intercepts and draw the line through them.',
      ['Substitute ' + t('y=0') + ' to get the ' + t('x') + '-intercept; substitute ' + t('x=0') + ' to get the ' + t('y') + '-intercept.', 'An ' + t('x') + '-intercept is a point ' + t('(a,\\ 0)') + ' on the ' + t('x') + '-axis.'], text);
  }
  /* integer intercepts p, q from the lists with A, |B| ≥ minC after reducing (and |p| ≠ |q|) */
  function intPair(r, ps0, qs, minC) {
    for (var g = 0; g < 200; g++) { var p = r.pick(ps0), q = r.pick(qs), Lo = thru([p, 0], [0, q]); if (Math.abs(p) !== Math.abs(q) && Lo.A >= (minC || 2) && Math.abs(Lo.B) >= (minC || 2)) return { p: p, q: q, L: Lo }; }
    return { p: ps0[0], q: qs[0], L: thru([ps0[0], 0], [0, qs[0]]) };
  }

  HW.defineLesson({
    id: 'u7l5', unit: 7, num: '5', title: 'Graphing Linear Equations: A Strategy for Every Form', outcome: 'RF6',
    blurb: 'Pick the fastest hand-graphing strategy for the form you are given — slope and y-intercept, a point and the slope, or the two intercepts — then graph with technology and recover an equation from a table.',
    questions: [
      /* ---------- Q1: slope–intercept ---------- */
      { num: '1', section: 'Assignment — Graphing without changing the form',
        shared: function (r) { var m = -r.pick([2, 2, 3, 4]), b = r.int(3, 8); return { m: m, b: b, L: mb(m, b) }; },
        stem: function (sh) { return STRAT + 'explain how to graph ' + t(si(sh.L)) + '. Then draw the graph.'; },
        parts: [
          { id: '1a', sub: 'strategy', level: 'LIM', make: function (r, sh) {
            var m = sh.m, b = sh.b;
            return mc(r, 'Which strategy graphs it fastest?', [
              { html: 'It is in slope–intercept form: plot the ' + t('y') + '-intercept ' + ptt([0, b]) + ', then step down ' + (-m) + ' and right 1 again and again, and join the points.', right: true },
              { html: 'Plot ' + ptt([b, 0]) + ' on the ' + t('x') + '-axis, then step down ' + (-m) + ' and right 1, and join the points.', why: t('b=' + b) + ' is the <b>' + t('y') + '-intercept</b>: the line crosses the ' + t('y') + '-axis at ' + ptt([0, b]) + '.' },
              { html: 'Plot ' + ptt([0, b]) + ', then step up ' + (-m) + ' and right 1, and join the points.', why: 'The slope is ' + t(m) + ', negative: from the ' + t('y') + '-intercept the line goes <b>down</b> as you move right.' },
              { html: 'Plot ' + ptt([0, m]) + ', then step up ' + b + ' and right 1, and join the points.', why: 'In ' + t('y=mx+b') + ' the number multiplying ' + t('x') + ' is the slope and the constant is the ' + t('y') + '-intercept — these are swapped.' }],
              t(si(sh.L)) + ' is in slope–intercept form, so ' + t('m=' + m) + ' and ' + t('b=' + b) + ' are read straight off. Plot ' + ptt([0, b]) + '; ' + t('m=\\frac{' + m + '}{1}') + ': step down ' + (-m) + ', right 1, again and again. Join the points.',
              ['Which form is it in? What does that form hand you?'], 'strategy y=mx+b');
          } },
          { id: '1b', sub: 'graph', level: 'BEG', make: function (r, sh) { return siGraph('Draw the graph on the grid.', sh.m, sh.b, W8, 'graph y=' + sh.m + 'x+' + sh.b); } }] },
      /* ---------- Q2: general form by intercepts ---------- */
      { num: '2',
        shared: function (r) { return intPair(r, [4, 5, 6, 8], [-3, -4, -5, -6, -8]); },
        stem: function (sh) { return STRAT + 'explain how to graph ' + t(gen(sh.L)) + '. Then draw the graph.'; },
        parts: [
          { id: '2a', sub: 'strategy', level: 'BEG', make: function (r, sh) {
            var p = sh.p, q = sh.q, Lo = sh.L;
            return mc(r, 'Which strategy graphs it fastest?', [
              { html: 'It is in general form: substitute ' + t('y=0') + ' to get ' + t('x=' + p) + ' and ' + t('x=0') + ' to get ' + t('y=' + q) + '; plot ' + ptt([p, 0]) + ' and ' + ptt([0, q]) + ' and draw the line through them.', right: true },
              { html: 'Read the intercepts from the coefficients: plot ' + ptt([Lo.A, 0]) + ' and ' + ptt([0, Lo.B]) + ' and draw the line through them.', why: 'The coefficients are not the intercepts. Substitute ' + t('y=0') + ' and ' + t('x=0') + ' and solve.' },
              { html: 'Substitute ' + t('y=0') + ' and ' + t('x=0') + ', then plot ' + ptt([0, p]) + ' and ' + ptt([q, 0]) + ' and draw the line through them.', why: 'Right values, wrong axes: the ' + t('x') + '-intercept ' + t(p) + ' is the point ' + ptt([p, 0]) + ', on the ' + t('x') + '-axis.' },
              { html: 'Substitute ' + t('y=0') + ' and ' + t('x=0') + ', then plot ' + ptt([-p, 0]) + ' and ' + ptt([0, -q]) + ' and draw the line through them.', why: 'Check the signs when you solve, e.g. ' + t((Lo.A === 1 ? '' : Lo.A) + 'x' + sg(Lo.C) + '=0') + ' gives ' + t('x=' + p) + '.' }],
              t(gen(Lo)) + ' is in general form, so find the intercepts by substitution: ' + t('y=0') + ' gives ' + t('x=' + p) + ', ' + t('x=0') + ' gives ' + t('y=' + q) + '. Plot ' + ptt([p, 0]) + ' and ' + ptt([0, q]) + ' and join them.',
              ['General form hides the slope — but what drops out when you substitute 0?'], 'strategy general form');
          } },
          { id: '2b', sub: 'graph', level: 'PRG', make: function (r, sh) { return intGraph('Draw the graph on the grid.', sh.p, sh.q, W8, 'graph ' + gen(sh.L)); } }] },
      /* ---------- Q3: slope–point form ---------- */
      { num: '3',
        shared: function (r) { var x1 = -r.int(1, 4), y1 = r.pick([-4, -3, -2, -1, 1, 2, 3, 4, 5]), m = -r.pick([2, 3]); return { P: [x1, y1], m: m, L: ms(m, [x1, y1]) }; },
        stem: function (sh) { return STRAT + 'explain how to graph ' + t(ps(sh.L, sh.P)) + '. Then draw the graph.'; },
        parts: [
          { id: '3a', sub: 'strategy', level: 'BEG', make: function (r, sh) {
            var P0 = sh.P, m = sh.m;
            return mc(r, 'Which strategy graphs it fastest?', [
              { html: 'It is in slope–point form: plot ' + ptt(P0) + ', then step down ' + (-m) + ' and right 1 again and again, and join the points.', right: true },
              { html: 'It is in slope–point form: plot ' + ptt([-P0[0], -P0[1]]) + ', then step down ' + (-m) + ' and right 1, and join the points.', why: 'The numbers in the brackets have the opposite signs to the coordinates: ' + t('x' + sg(-P0[0])) + ' means ' + t('x-(' + P0[0] + ')') + ', so ' + t('x_1=' + P0[0]) + '.' },
              { html: 'It is in slope–point form: plot ' + ptt(P0) + ', then step up ' + (-m) + ' and right 1, and join the points.', why: 'Right point, but the slope is ' + t(m) + ': the line goes <b>down</b> as you move right.' },
              { html: 'Plot the ' + t('y') + '-intercept ' + ptt([0, P0[1]]) + ', then step down ' + (-m) + ' and right 1, and join the points.', why: t(String(P0[1])) + ' isn’t the ' + t('y') + '-intercept: the form hands you the point ' + ptt(P0) + ', not an intercept.' }],
              t(ps(sh.L, P0)) + ' matches ' + t('y-y_1=m(x-x_1)') + ' with ' + t('m=' + m) + ' and the point ' + ptt(P0) + '. Plot it, then step down ' + (-m) + ', right 1, again and again, and join the points.',
              ['Compare with ' + t('y-y_1=m(x-x_1)') + '. Watch the signs.'], 'strategy slope-point');
          } },
          { id: '3b', sub: 'graph', level: 'EMG', make: function (r, sh) { return psGraph('Draw the graph on the grid.', sh.m, sh.P, W8, 'graph ' + ps(sh.L, sh.P)); } }] },
      /* ---------- Q4: six lines in three forms ---------- */
      { num: '4', stem: 'Without altering the form in which each equation is written, draw the graph of each of the following (without technology). Choose the strategy that fits the form: the starting point and the slope, the two intercepts, or other points you find.',
        parts: [
          { id: '4a', level: 'BEG', make: function (r) { var f = r.pick([[1, 2], [1, 3], [2, 3]]), b = r.int(2, 5); return siGraph(t(si(mb([-f[0], f[1]], b))), [-f[0], f[1]], b, W6, 'graph si fraction slope'); } },
          { id: '4b', level: 'EMG', make: function (r) { var P0 = [-r.int(2, 5), r.int(1, 4)], m = -r.pick([2, 3]); return psGraph(t(ps(ms(m, P0), P0)), m, P0, W6, 'graph slope-point integer slope'); } },
          { id: '4c', level: 'PRG', make: function (r) { var s = intPair(r, [3, 4, 5, 6], [-2, -3, -4, -5]); return intGraph(t(gen(s.L)), s.p, s.q, W6, 'graph general by intercepts'); } },
          { id: '4d', level: 'PRG', make: function (r) { var f = r.pick([[3, 4], [2, 3], [1, 3], [1, 4]]), P0 = [-r.int(3, 5), r.int(1, 4)], m = [-f[0], f[1]]; return psGraph(t(ps(ms(m, P0), P0)), m, P0, W6, 'graph slope-point fraction slope'); } },
          { id: '4e', level: 'PRG', make: function (r) {
            var ab = r.pick([[2, 5], [2, 3], [3, 4], [3, 5], [4, 5], [5, 2], [3, 2], [4, 3], [5, 3], [5, 4]]), A = ab[0], B = ab[1], Lo = line(A, B, 0);
            return gpart(t(gen(Lo)), Lo, W6, {
              wrong: [{ L: line(A, -B, 0), code: 'l5-gr-sign', hint: 'Check the sign of the second point: with ' + t('x=' + B) + ', ' + t(A * B + '+' + B + 'y=0') + ' gives ' + t('y=' + (-A)) + '.' },
                { L: line(B, A, 0), code: 'l5-gr-flip', hint: 'Check your second point by substituting it into ' + t(gen(Lo)) + ' — it should give ' + t('0') + '.' }],
              anchor: [{ p: [0, 0], hint: 'Both intercepts are ' + ptt([0, 0]) + ' — good. For a second point, substitute a convenient ' + t('x') + ', such as ' + t('x=' + B) + ', and solve for ' + t('y') + '.' }] },
              'General form with ' + t('C=0') + ': both intercepts are ' + ptt([0, 0]) + ' — only <b>one</b> point.<br>Substitute a convenient ' + t('x') + ': ' + t('x=' + B) + ' gives ' + t(A * B + '+' + B + 'y=0') + ', so ' + t('y=' + (-A)) + ' and ' + ptt([B, -A]) + ' is on the line (so is ' + ptt([-B, A]) + ').<br>Draw the line through ' + ptt([0, 0]) + ' and ' + ptt([B, -A]) + '.',
              ['Substitute ' + t('x=0') + ' and ' + t('y=0') + ': how many different points do you get?', 'Pick an ' + t('x') + ' that makes ' + t('y') + ' a whole number.'], 'graph general C=0');
          } },
          { id: '4f', level: 'ADV', make: function (r) {
            var A, B, k, g = 0;
            do { A = r.pick([2, 3, 4, 5]); B = r.pick([2, 3]); k = r.pick([1, 1, 2, -1, -2]); g++; } while ((gcd(A, B) !== 1 || (A * k) % B === 0) && g < 100);
            var Lo = line(A, B, -A * k), yi = A * k / B, P1 = [k + B, -A], P2 = [k - B, A];
            return gpart(t(gen(Lo)), Lo, W6, {
              wrong: [{ L: thru([k, 0], [0, Math.floor(yi)]), code: 'l5-gr-round', hint: 'The ' + t('y') + '-intercept is ' + t(fT(fr(A * k, B))) + ', a fraction — you can’t round it to a grid point. Use the ' + t('x') + '-intercept and find another point with whole-number coordinates instead.' },
                { L: thru([k, 0], [0, Math.ceil(yi)]), code: 'l5-gr-round', hint: 'The ' + t('y') + '-intercept is ' + t(fT(fr(A * k, B))) + ', a fraction — you can’t round it to a grid point. Use the ' + t('x') + '-intercept and find another point with whole-number coordinates instead.' },
                { L: ms([A, B], [k, 0]), code: 'l5-gr-sign', hint: 'Check your second point by substituting it into ' + t(gen(Lo)) + '.' }],
              anchor: [{ p: [k, 0], hint: 'The ' + t('x') + '-intercept ' + ptt([k, 0]) + ' is right. For a second point, try ' + t('x=' + (k + B)) + ' and solve for ' + t('y') + '.' }] },
              'General form: ' + t('y=0') + ' gives ' + t('x=' + k) + ', so ' + ptt([k, 0]) + '. But ' + t('x=0') + ' gives ' + t(B + 'y=' + (A * k)) + ', ' + t('y=' + fT(fr(A * k, B))) + ' — a fraction, hard to plot.<br>Find lattice points instead: ' + t('x=' + P1[0]) + ' gives ' + t('y=' + P1[1]) + '; ' + t('x=' + P2[0]) + ' gives ' + t('y=' + P2[1]) + '.<br>Draw the line through ' + ptt([k, 0]) + ', ' + ptt(P1) + ' and ' + ptt(P2) + '.',
              ['One intercept is a fraction. Which ' + t('x') + '-values make ' + t('y') + ' a whole number?', 'Try ' + t('x') + '-values that are ' + B + ' apart, starting from the ' + t('x') + '-intercept.'], 'graph general fraction intercept');
          } }] },
      /* ---------- Q5: matching ---------- */
      { num: '5', section: 'Assignment — Reading a graph from its equation',
        shared: function (r) {
          var b = r.sample([-4, -3, -2, -1, 1, 2, 3, 4], 4);
          var ms0 = [r.pick([2, 3]), r.pick([[1, 2], [1, 3]]), -r.pick([2, 3]), r.pick([[-1, 2], [-1, 3]])].map(mf);
          var lines = ms0.map(function (m, i) { return { m: m, b: b[i], L: mb(m, b[i]) }; });
          var forms = r.shuffle(['ps', 'gen', 'si', 'gen']), letters = r.shuffle(['A', 'B', 'C', 'D']);
          lines = r.shuffle(lines);
          lines.forEach(function (ln, i) {
            ln.form = forms[i]; ln.letter = letters[i];
            if (ln.form === 'ps') { var c = [1, -1, 2, -2].map(function (k) { return k * ln.m[1]; }).filter(function (x) { var y = yAt(ln.L, x); return Number.isInteger(y) && y !== 0 && Math.abs(y) <= 8; }); var x1 = r.pick(c.length ? c : [ln.m[1]]); ln.P = [x1, yAt(ln.L, x1)]; ln.tex = ps(ln.L, ln.P); }
            else ln.tex = ln.form === 'gen' ? gen(ln.L) : si(ln.L);
          });
          return { lines: lines };
        },
        stem: function (sh) {
          var byL = sh.lines.slice().sort(function (a, b) { return a.letter < b.letter ? -1 : 1; });
          return 'Match each linear relation to its graph. Each graph is used exactly once.<br>' + sh.lines.map(function (ln, i) { return '<b>Equation ' + (i + 1) + ':</b> ' + t(ln.tex); }).join('<br>') +
            figs(byL.map(function (ln) { return { label: 'Graph ' + ln.letter, html: fig(ln.L, W6, { labels: 2, max: 150 }) }; }));
        },
        parts: [
          { id: '5', level: 'PRG', make: function (r, sh) {
            var rows = sh.lines.map(function (ln, i) { return { id: 'e' + (i + 1), html: '<b>Eqn ' + (i + 1) + '</b> ' + nw(t(ln.tex)) }; }), cols = ['A', 'B', 'C', 'D'].map(function (l) { return { id: l, html: l }; }), want = {};
            sh.lines.forEach(function (ln, i) { want['e' + (i + 1)] = ln.letter; });
            return K.P.grid('Choose the graph (A, B, C or D) for each equation.', rows, cols, want, { why: function (row) { var i = +row.slice(1) - 1; return 'Check Equation ' + (i + 1) + ': rewrite it as ' + t('y=mx+b') + '. Does it rise or fall? Is it steep or shallow? Where does it cross the ' + t('y') + '-axis?'; } },
              'Rewrite each as ' + t('y=mx+b') + ' and compare.<br>' + sh.lines.map(function (ln, i) { return 'Eqn ' + (i + 1) + ': ' + t(ln.tex) + (ln.form === 'si' ? '' : ' → ' + t(si(ln.L))) + ' (' + t('m=' + fT(ln.m)) + ', ' + t('b=' + ln.b) + ') — ' + (Math.abs(fv(ln.m)) > 1 ? 'steep' : 'shallow') + ' and ' + (ln.m[0] > 0 ? 'rising' : 'falling') + ', crossing at ' + t(ln.b) + ': <b>Graph ' + ln.letter + '</b>.'; }).join('<br>'),
              ['The sign of ' + t('m') + ' tells you rising or falling; its size tells you steep or shallow; ' + t('b') + ' tells you where it crosses the ' + t('y') + '-axis.'], 'match equations to graphs');
          } }] },
      /* ---------- Q6: sorting equivalent forms ---------- */
      { num: '6',
        shared: function (r) {
          var f = r.pick([[2, 3], [1, 2], [3, 4], [1, 3], [3, 2]]), b = r.int(1, 4), p = f[0], q = f[1];
          var L1 = mb([-p, q], b), L2 = mb([p, q], -b), L3 = mb([-p, q], -b);
          function psPts(Lo, n) { var c = [-2, -1, 1, 2].map(function (k) { return k * q; }).filter(function (x) { var y = yAt(Lo, x); return Number.isInteger(y) && y !== 0 && Math.abs(y) <= 9; }); return r.sample(c, Math.min(n, c.length)); }
          var c1 = psPts(L1, 2), c2 = psPts(L2, 1);
          var eqs = [{ g: 1, tex: si(L1) }, { g: 2, tex: gen(L2) }, { g: 1, tex: ps(L1, [c1[0], yAt(L1, c1[0])]) }, { g: 3, tex: gen(L3) }, { g: 2, tex: si(L2) }, { g: 1, tex: ps(L1, [c1[1], yAt(L1, c1[1])]), ps: true }, { g: 1, tex: gen(L1) }, { g: 2, tex: ps(L2, [c2[0], yAt(L2, c2[0])]) }];
          eqs[2].ps = true; eqs[7].ps = true;
          eqs = r.shuffle(eqs); eqs.forEach(function (e, i) { e.id = 'ABCDEFGH'.charAt(i); });
          return { L: [L1, L2, L3], eqs: eqs, order: r.shuffle([1, 2, 3]) };
        },
        stem: function (sh) { return '<b>Sorting equivalent forms.</b> The eight equations below describe only three different lines. Sort them into groups, where every equation in a group describes the same line.'; },
        parts: [
          { id: '6a', sub: 'sort', level: 'PRG', make: function (r, sh) {
            var rows = sh.eqs.map(function (e) { return { id: e.id, html: '<b>' + e.id + '.</b> ' + nw(t(e.tex)) }; }), cols = sh.order.map(function (g, j) { return { id: 'g' + g, html: 'Line ' + (j + 1) }; }), want = {};
            sh.eqs.forEach(function (e) { want[e.id] = 'g' + e.g; });
            return K.P.grid('Rewrite each equation in slope–intercept form, then tap the line it describes:<br>' + sh.order.map(function (g, j) { return nw('<b>Line ' + (j + 1) + ':</b> ' + t(si(sh.L[g - 1]))); }).join(' &nbsp; '), rows, cols, want, {
              why: function (row, got, w) { var pair = [got, w].sort().join(); return pair === 'g1,g3' ? row + ' has the right slope but check its ' + t('y') + '-intercept: lines with the same slope and different intercepts are parallel, not the same line.' : 'Check ' + row + ': rewrite it as ' + t('y=mx+b') + ' and compare the slope and the ' + t('y') + '-intercept.'; } },
              sh.eqs.map(function (e) { return '<b>' + e.id + ':</b> ' + t(e.tex) + ' → ' + t(si(sh.L[e.g - 1])); }).join('<br>') + '<br>The lone general-form equation with slope ' + t(fT(slopeOf(sh.L[2]))) + ' and ' + t('b=' + fT(yInt(sh.L[2]))) + ' has the same slope as the four-equation group but a different ' + t('y') + '-intercept: it is parallel to that line, not the same line.',
              ['Get ' + t('y') + ' by itself in each one. For slope–point form, expand the bracket and add ' + t('y_1') + ' to both sides.'], 'sort 8 equations into 3 lines');
          } },
          { id: '6b', sub: 'justify', level: 'EMG', make: function (r, sh) {
            var e = r.pick(sh.eqs.filter(function (x) { return x.ps; })), Lo = sh.L[e.g - 1];
            return K.P.line('Justify one of your groups: write equation <b>' + e.id + '</b>, ' + t(e.tex) + ', in slope–intercept form.', Lo, { form: 'slope-intercept' },
              'Expand the bracket, then move the constant: ' + t(e.tex) + ' → ' + t(si(Lo)) + '.', ['Distribute the slope over the bracket, then add or subtract to get ' + t('y') + ' alone.'], 'slope-point to slope-intercept');
          } }] },
      /* ---------- Q7: coffee cooling (table → equation) ---------- */
      { num: '7', section: 'Assignment — From a table of data to an equation',
        shared: function (r) {
          var y0, k, s, g = 0; do { y0 = r.int(80, 95); k = r.pick([2, 3, 3, 4]); s = r.pick([2, 2, 3]); g++; } while (y0 - 5 * s * k < 26 && g < 100);
          var Ts = [15, 20, 25, 30, 35, 40, 45, 50].filter(function (T) { var v = y0 - k * T; return T > 5 * s && v < 20 && v >= -15; }), T = r.pick(Ts.length ? Ts : [30]);
          var xs = [0, 1, 2, 3, 4, 5].map(function (i) { return i * s; });
          return { y0: y0, k: k, s: s, xs: xs, ys: xs.map(function (x) { return y0 - k * x; }), L: line(k, 1, -y0), T: T };
        },
        stem: function (sh) { return 'The data below is taken from a continuous linear relationship between the number of minutes, ' + t('x') + ', since a cup of coffee was poured and the temperature, ' + t('y') + ', of the coffee in degrees Celsius.' + vtab(sh.xs, sh.ys, t('x') + ' (min)', t('y') + ' (°C)'); },
        parts: [
          { id: '7a', level: 'PRG', outcome: 'RF7', make: function (r, sh) {
            var k = sh.k, s = sh.s, y0 = sh.y0, xl = 5 * s, yl = y0 - k * xl;
            return K.P.line('Determine, in general form, the equation of the linear relation the data represents.', sh.L, { form: 'general',
              wrong: [{ is: { m: k, b: y0 }, code: 'l5-rise', hint: 'The coffee is <b>cooling</b>: the temperature goes down as time goes up, so the slope is negative.' },
                { is: { m: -k * s, b: y0 }, code: 'l5-run', hint: 'The temperature drops ' + t(k * s) + '° every ' + t(s) + ' minutes, not every minute. Slope = change in ' + t('y') + ' ÷ change in ' + t('x') + '.' }] },
              'Using ' + ptt([0, y0]) + ' and ' + ptt([xl, yl]) + ': ' + t('m=\\frac{' + yl + '-' + y0 + '}{' + xl + '-0}=\\frac{' + (yl - y0) + '}{' + xl + '}=' + (-k)) + '.<br>The ' + t('y') + '-intercept is ' + t(y0) + ' (the value at ' + t('x=0') + '), so ' + t(si(sh.L)) + '.<br>General form (' + t('A>0') + '): ' + t(gen(sh.L)) + '.',
              ['Find the slope from two table points, and read the ' + t('y') + '-intercept from the column where ' + t('x=0') + '.', 'Then move every term to one side, with the ' + t('x') + '-term positive.'], 'general form from table');
          } },
          { id: '7b1', sub: 'b(i)', level: 'EMG', make: function (r, sh) {
            var p = K.P.line('Rewrite the equation in terms of ' + t('x') + ', that is ' + t('y=\\ldots') + '.', sh.L, { form: 'slope-intercept' }, 'Solve ' + t(gen(sh.L)) + ' for ' + t('y') + ': ' + t(si(sh.L)) + '.', ['Move the ' + t('x') + '-term and the constant to the other side.'], 'y in terms of x');
            p.good = ['y=' + sh.y0 + '-' + sh.k + 'x']; return p;
          } },
          { id: '7b2', sub: 'b(ii)', level: 'PRG', make: function (r, sh) {
            var key = 'x=\\frac{' + sh.y0 + '-y}{' + sh.k + '}';
            var p = K.P.math('Rewrite the equation in terms of ' + t('y') + ', that is ' + t('x=\\ldots') + '.', solvedForX(sh.L), key, t(gen(sh.L)) + ' → ' + t(sh.k + 'x=' + sh.y0 + '-y') + ' → ' + t(key) + '.', ['Get the ' + t('x') + '-term by itself, then divide by its coefficient.'], 'x in terms of y', { keys: 'eq', vars: ['x', 'y'], placeholder: 'e.g. x = (90 - y)/3' });
            p.good = ['x=\\frac{' + sh.y0 + '}{' + sh.k + '}-\\frac{y}{' + sh.k + '}', 'x=-\\frac{y-' + sh.y0 + '}{' + sh.k + '}'];
            p.bad = [si(sh.L), 'x=\\frac{y-' + sh.y0 + '}{' + sh.k + '}', 'x=' + sh.y0 + '-' + sh.k + 'y']; return p;
          } },
          { id: '7c1', sub: 'c(i)', level: 'PRG', outcome: 'RF5', make: function (r, sh) {
            var k = sh.k, s = sh.s;
            return mc(r, 'What real-world quantity does the slope represent?', [
              { html: 'The cooling rate: the coffee loses ' + k + '°C every minute.', right: true },
              { html: 'The coffee loses ' + k * s + '°C every minute.', why: 'It loses ' + k * s + '° every ' + s + ' minutes. The slope is the change per <b>one</b> minute.' },
              { html: 'The coffee warms up by ' + k + '°C every minute.', why: 'The slope is ' + t(-k) + ': negative, so the temperature goes <b>down</b>.' },
              { html: 'It takes ' + k + ' minutes for the coffee to cool by 1°C.', why: 'Check the units: slope = change in temperature ÷ change in time, so its units are °C per minute, not minutes per °C.' }],
              'The slope is ' + t('-' + k) + ' °C per minute: the coffee loses ' + k + '°C every minute (the units are those of ' + t('y') + ' per unit of ' + t('x') + ').', ['Slope = change in ' + t('y') + ' ÷ change in ' + t('x') + '. What are the units?'], 'meaning of slope');
          } },
          { id: '7c2', sub: 'c(ii)', level: 'EMG', outcome: 'RF5', make: function (r, sh) {
            return mc(r, 'What does the ' + t('y') + '-intercept represent?', [
              { html: 'The temperature of the coffee, ' + sh.y0 + '°C, at the moment it was poured.', right: true },
              { html: 'The room temperature, ' + sh.y0 + '°C.', why: 'The ' + t('y') + '-intercept is where ' + t('x=0') + ': zero minutes after pouring.' },
              { html: 'The number of minutes it takes the coffee to cool completely.', why: 'The ' + t('y') + '-intercept is a temperature (a ' + t('y') + '-value), measured at ' + t('x=0') + '.' },
              { html: 'The temperature of the coffee after 1 minute.', why: 'At ' + t('x=1') + ' it has already cooled by ' + sh.k + '°. The intercept is at ' + t('x=0') + '.' }],
              'The ' + t('y') + '-intercept, ' + t(sh.y0) + ', is the temperature in °C at ' + t('x=0') + ' — the instant the coffee was poured.', ['The ' + t('y') + '-intercept is the ' + t('y') + '-value when ' + t('x=0') + '.'], 'meaning of y-intercept');
          } },
          { id: '7d1', sub: 'd(i)', level: 'EMG', outcome: 'RF4', make: function (r, sh) {
            var v = sh.y0 - sh.k * sh.T;
            return K.P.number('Real coffee cools more and more slowly and levels off at room temperature (about 20°C). What does this linear model predict for the temperature at ' + t('x=' + sh.T) + ' min?', v,
              function (x) { if (x === sh.y0 + sh.k * sh.T) return { code: 'sign', hint: 'The slope is ' + t(-sh.k) + ': ' + t('y=-' + sh.k + '(' + sh.T + ')+' + sh.y0) + '.' }; if (x === 20) return { code: 'l5-room', hint: 'Use the linear model ' + t(si(sh.L)) + ', not real coffee: substitute ' + t('x=' + sh.T) + '.' }; return null; },
              t('y=-' + sh.k + '(' + sh.T + ')+' + sh.y0 + '=' + v) + '°C. That is colder than the room — impossible: coffee can’t cool below room temperature.', ['Substitute ' + t('x=' + sh.T) + ' into ' + t(si(sh.L)) + '.'], 'predict at x=T', { after: ' °C' });
          } },
          { id: '7d2', sub: 'd(ii)', level: 'PRG', outcome: 'RF5', make: function (r, sh) {
            var xl = 5 * sh.s;
            return mc(r, 'For what domain is the linear model reasonable?', [
              { html: t('\\{x\\mid 0\\le x\\le ' + xl + ',\\ x\\in\\mathbb{R}\\}') + ' — about the times that were measured', right: true },
              { html: t('\\{x\\mid x\\ge 0,\\ x\\in\\mathbb{R}\\}'), why: 'The model keeps falling forever — at ' + t('x=' + sh.T) + ' it predicts ' + (sh.y0 - sh.k * sh.T) + '°C, below room temperature. Real coffee levels off, so the model only fits for a while.' },
              { html: t('\\{x\\mid x\\in\\mathbb{R}\\}'), why: 'Negative times are before the coffee was poured, and large times give temperatures below room temperature.' },
              { html: t('\\{x\\mid 0\\le x\\le ' + sh.T + ',\\ x\\in\\mathbb{R}\\}'), why: 'That domain includes ' + t('x=' + sh.T) + ', where the model gives an impossible temperature.' }],
              'The line matches the measured data, so it is reasonable for about the measured times: ' + t('\\{x\\mid 0\\le x\\le ' + xl + ',\\ x\\in\\mathbb{R}\\}') + '. (It reaches room temperature at ' + t('x=' + nT((sh.y0 - 20) / sh.k)) + ', and real cooling slows long before that.)', ['Where does the model stop matching real coffee?'], 'reasonable domain');
          } }] },
      /* ---------- Q8: technology ---------- */
      { num: '8', section: 'Assignment — Graphing with technology',
        shared: function (r) {
          var A, b1, m2, rr, g = 0;
          do { A = r.pick([2, 3, 4]); b1 = -r.int(1, 3); m2 = r.pick([2, 3]); rr = -r.int(2, m2 === 2 ? 4 : 3); g++; } while ((A * -b1 > 8 || A * b1 === rr) && g < 100);
          var L1 = line(1, A, -A * b1), x1 = r.int(rr + 1, -1), P = [x1, m2 * (x1 - rr)], L2 = ms(m2, P), b2 = -m2 * rr;
          return { A: A, b1: b1, L1: L1, x1a: A * b1, m2: m2, r: rr, P: P, L2: L2, b2: b2 };
        },
        stem: function (sh) { return 'Use graphing technology for the linear relations ' + t(gen(sh.L1)) + ' and ' + t(ps(sh.L2, sh.P)) + '.'; },
        parts: [
          { id: '8a1', sub: 'a(i)', level: 'EMG', make: function (r, sh) {
            return K.P.line('Technology needs each equation solved for ' + t('y') + '. Write ' + t(gen(sh.L1)) + ' in the form you would enter as ' + t('Y_1') + ': ' + t('y=\\ldots') + '.', sh.L1, { form: 'slope-intercept', wrong: [{ is: { m: -1, b: sh.b1 }, code: 'l5-nodiv', hint: 'Divide <b>every</b> term by ' + t(sh.A) + ', including the ' + t('x') + '-term.' }, { is: { m: [-1, sh.A], b: -sh.A * sh.b1 }, code: 'l5-nodiv', hint: 'Divide <b>every</b> term by ' + t(sh.A) + ', including the constant.' }] },
              t(gen(sh.L1)) + ' → ' + t(sh.A + 'y=-x' + sg(sh.A * sh.b1)) + ' → ' + t(si(sh.L1)) + '.', ['Move ' + t('x') + ' and the constant to the right, then divide every term by ' + t(sh.A) + '.'], 'tech: general to y=');
          } },
          { id: '8a2', sub: 'a(ii)', level: 'EMG', make: function (r, sh) {
            var P = sh.P;
            return K.P.line('Write ' + t(ps(sh.L2, P)) + ' in the form you would enter as ' + t('Y_2') + ': ' + t('y=\\ldots') + '.', sh.L2, { form: 'slope-intercept', wrong: [{ is: { m: sh.m2, b: P[1] - P[0] }, code: 'l5-dist', hint: 'Multiply the slope by <b>both</b> terms in the bracket: ' + t(sh.m2 + '(x' + sg(-P[0]) + ')=' + sh.m2 + 'x' + sg(-sh.m2 * P[0])) + '.' }, { is: { m: sh.m2, b: -sh.m2 * P[0] - P[1] }, code: 'l5-c-sign', hint: 'To undo ' + t('-' + P[1]) + ' on the left, <b>add</b> ' + t(P[1]) + ' to both sides.' }] },
              t(ps(sh.L2, P)) + ' → ' + t('y-' + P[1] + '=' + sh.m2 + 'x' + sg(-sh.m2 * P[0])) + ' → ' + t(si(sh.L2)) + '.', ['Expand the bracket, then get ' + t('y') + ' by itself.'], 'tech: slope-point to y=');
          } },
          { id: '8b1', sub: 'b', level: 'EMG', outcome: 'RF5', make: function (r, sh) {
            var xs = [sh.x1a, sh.r], ys = [sh.b1, sh.b2], need = { x: [Math.min(0, sh.x1a, sh.r), 0], y: [Math.min(0, sh.b1), Math.max(0, sh.b2)] };
            var key = [String(need.x[0] - 2), '2', String(need.y[0] - 2), String(need.y[1] + 2)], labs = ['Xmin', 'Xmax', 'Ymin', 'Ymax'];
            var check = function (resp) {
              resp = resp || []; var v = [];
              for (var i = 0; i < 4; i++) { var pn = HW.parse.number(String(resp[i] == null ? '' : resp[i])); if (!pn.ok) return form('empty', 'Fill in all four window values (' + labs[i] + ' is ' + (pn.code === 'empty' ? 'empty' : 'not a number') + ').'); v.push(pn.value); }
              if (v[0] >= v[1] || v[2] >= v[3]) return form('l5-window-order', 'Each minimum must be less than its maximum.');
              for (var j = 0; j < 2; j++) if (xs[j] < v[0] || xs[j] > v[1]) return wrong('l5-window-x', 'Your ' + t('x') + '-range doesn’t show the ' + t('x') + '-intercept ' + t(xs[j]) + ' of ' + t(j ? ps(sh.L2, sh.P) : gen(sh.L1)) + '.');
              if (v[0] > 0 || v[1] < 0) return wrong('l5-window-x', 'The ' + t('y') + '-intercepts are on the ' + t('y') + '-axis, where ' + t('x=0') + ': include ' + t('x=0') + ' in the window.');
              for (var k = 0; k < 2; k++) if (ys[k] < v[2] || ys[k] > v[3]) return wrong('l5-window-y', 'Your ' + t('y') + '-range doesn’t show the ' + t('y') + '-intercept ' + t(ys[k]) + ' of ' + t(k ? ps(sh.L2, sh.P) : gen(sh.L1)) + '.');
              if (v[1] - v[0] > 10 * Math.max(need.x[1] - need.x[0], 4) || v[3] - v[2] > 10 * Math.max(need.y[1] - need.y[0], 4)) return wrong('l5-window-big', 'That window is so large the lines and intercepts will be squashed together. Keep each range within about 10 times what you need.');
              return ok();
            };
            return { prompt: 'State an appropriate window that shows the ' + t('x') + '- and ' + t('y') + '-intercepts of both relations.', input: { type: 'fields', fields: labs.map(function (l) { return { label: l }; }) }, check: check, key: key,
              answer: 'For example ' + t('x:[' + key[0] + ',\\ ' + key[1] + ']') + ', ' + t('y:[' + key[2] + ',\\ ' + key[3] + ']') + ' — any window containing all four intercepts.',
              solution: t(si(sh.L1)) + ' has intercepts ' + ptt([sh.x1a, 0]) + ' and ' + ptt([0, sh.b1]) + '; ' + t(si(sh.L2)) + ' has ' + ptt([sh.r, 0]) + ' and ' + ptt([0, sh.b2]) + '. The window must include ' + t('x') + ' from ' + t(need.x[0]) + ' to ' + t(0) + ' and ' + t('y') + ' from ' + t(need.y[0]) + ' to ' + t(need.y[1]) + '; e.g. ' + t('x:[' + key[0] + ',\\ ' + key[1] + ']') + ', ' + t('y:[' + key[2] + ',\\ ' + key[3] + ']') + '.',
              hints: ['Find all four intercepts first; the window has to contain every one of them.'], text: 'tech window', bad: [['0', '10', '0', '10'], ['-1', '1', '-1', '1']] };
          } },
          { id: '8b2', sub: 'b (graph)', level: 'PRG', make: function (r, sh) {
            var win = [[Math.min(sh.x1a, sh.r) - 1, 2], [sh.b1 - 1, sh.b2 + 1]];
            var p = gpart('Draw both graphs on the grid.', [sh.L1, sh.L2], win, { names: [t(gen(sh.L1)), t(ps(sh.L2, sh.P))],
              wrong: [{ v: lineV(sh.L1, win), code: 'l5-line-missing', hint: 'The line for ' + t(gen(sh.L1)) + ' is right — now draw ' + t(ps(sh.L2, sh.P)) + ' too.' }, { v: lineV(sh.L2, win), code: 'l5-line-missing', hint: 'The line for ' + t(ps(sh.L2, sh.P)) + ' is right — now draw ' + t(gen(sh.L1)) + ' too.' }] },
              t(si(sh.L1)) + ': through ' + ptt([sh.x1a, 0]) + ' and ' + ptt([0, sh.b1]) + '.<br>' + t(si(sh.L2)) + ': through ' + ptt([sh.r, 0]) + ' and ' + ptt([0, sh.b2]) + ' (and ' + ptt(sh.P) + ').',
              ['Plot the two intercepts of each line, then draw each line with arrows.'], 'tech: draw both lines');
            return p;
          } },
          { id: '8c', level: 'EMG', outcome: 'RF5', make: function (r, sh) {
            var vals = [sh.x1a, sh.b1, sh.r, sh.b2], names = [t(gen(sh.L1)) + ': ' + t('x') + '-int', t('y') + '-int', t(ps(sh.L2, sh.P)) + ': ' + t('x') + '-int', t('y') + '-int'];
            var chk = vals.map(function (v, i) { var other = vals[i % 2 ? i - 1 : i + 1]; return K.number(v, function (x) { if (x === other && other !== v) return { code: 'l5-int-swap', hint: 'That is the other intercept. The ' + t('x') + '-intercept comes from ' + t('y=0') + '; the ' + t('y') + '-intercept from ' + t('x=0') + '.' }; if (x === -v) return { code: 'sign', hint: 'Check the sign.' }; return null; }); });
            return K.P.fields('Determine the ' + t('x') + '- and ' + t('y') + '-intercepts of <b>each</b> graph.', names.map(function (n) { return { label: n }; }), chk, vals.map(String), names.map(function (n, i) { return n + ' ' + t(vals[i]); }).join('<br>'),
              t(gen(sh.L1)) + ': ' + t('y=0') + ' → ' + t('x=' + sh.x1a) + '; ' + t('x=0') + ' → ' + t(sh.A + 'y' + sg(-sh.A * sh.b1) + '=0') + ', ' + t('y=' + sh.b1) + '.<br>' + t(ps(sh.L2, sh.P)) + ': ' + t('y=0') + ' → ' + t('-' + sh.P[1] + '=' + sh.m2 + '(x' + sg(-sh.P[0]) + ')') + ', ' + t('x=' + sh.r) + '; ' + t('x=0') + ' → ' + t('y=' + sh.b2) + '.',
              ['Substitute ' + t('y=0') + ' for an ' + t('x') + '-intercept and ' + t('x=0') + ' for a ' + t('y') + '-intercept.'], 'intercepts of both lines');
          } }] },
      /* ---------- Q9–Q11 ---------- */
      { num: '9', section: 'Assignment — Multiple choice and numerical response', parts: [
        { id: '9', level: 'BEG', make: function (r) {
          var P0 = [-r.int(1, 5), r.int(2, 6)], m = -r.int(2, 5), Lo = ms(m, P0);
          return mc(r, '<i>(Multiple Choice)</i> Without altering its form, which strategy correctly describes how to graph ' + t(ps(Lo, P0)) + '?', [
            { html: 'Plot ' + ptt(P0) + '; use slope ' + t(m) + '.', right: true },
            { html: 'Plot ' + ptt([0, P0[1]]) + '; use slope ' + t(m) + '.', why: t(String(P0[1])) + ' is the ' + t('y') + '-coordinate of the given point, not the ' + t('y') + '-intercept.' },
            { html: 'Plot ' + ptt(P0) + '; use slope ' + t(-m) + '.', why: 'The slope is the number in front of the bracket: ' + t(m) + ', sign included.' },
            { html: 'Plot ' + ptt([-P0[0], -P0[1]]) + '; use slope ' + t(m) + '.', why: 'The signs in the brackets are the opposite of the coordinates: ' + t('y' + sg(-P0[1])) + ' means ' + t('y_1=' + P0[1]) + '.' }],
            t(ps(Lo, P0)) + ' is ' + t('y-' + P0[1] + '=' + m + '(x-(' + P0[0] + '))') + ', matching ' + t('y-y_1=m(x-x_1)') + ' with ' + t('m=' + m) + ' and ' + t('(x_1,\\ y_1)=' + pt(P0)) + '.', ['Compare with ' + t('y-y_1=m(x-x_1)') + '.'], 'MC slope-point strategy');
        } }] },
      { num: '10', parts: [
        { id: '10', level: 'BEG', outcome: 'RF5', make: function (r) {
          var A, B, C, g = 0; do { A = r.pick([3, 4, 5, 6]); B = r.pick([2, 3, 4]); C = lcm(A, B) * r.pick([1, 2]); g++; } while ((A === B || C > 40 || C / A === C / B) && g < 100);
          var Lo = line(A, -B, C);
          return mc(r, '<i>(Multiple Choice)</i> A line has general form ' + t(gen(Lo)) + '. Its ' + t('x') + '-intercept is', [
            { html: t(-C / A), right: true },
            { html: t(C / A), why: 'Set ' + t('y=0') + ': ' + t(A + 'x+' + C + '=0') + ', so ' + t(A + 'x=-' + C) + ' — watch the sign.' },
            { html: t(-C / B), why: 'For the ' + t('x') + '-intercept set ' + t('y=0') + ' (not ' + t('x=0') + ') and solve for ' + t('x') + '.' },
            { html: t(C / B), why: 'That is the ' + t('y') + '-intercept (from ' + t('x=0') + '). For the ' + t('x') + '-intercept set ' + t('y=0') + '.' }],
            t('x') + '-intercept: set ' + t('y=0') + ': ' + t(A + 'x+' + C + '=0') + ', ' + t(A + 'x=-' + C) + ', ' + t('x=' + (-C / A)) + '.', ['At the ' + t('x') + '-intercept, ' + t('y=0') + '.'], 'MC x-intercept of general form');
        } }] },
      { num: '11', parts: [
        { id: '11', level: 'PRG', make: function (r) {
          var a = r.int(2, 5), x1 = -r.int(1, 4), y1 = r.int(2, 9), c = y1 - a * x1, ans = a + c, Lo = ms(a, [x1, y1]);
          var diag = function (v) {
            if (v === a + y1 - x1) return { code: 'l5-nr-dist', hint: 'Multiply ' + t(a) + ' by <b>both</b> terms in the bracket: ' + t(a + '(x' + sg(-x1) + ')=' + a + 'x' + sg(-a * x1)) + '.' };
            if (v === a + y1 + a * x1) return { code: 'l5-c-sign', hint: 'Check the sign of ' + t('c') + ': expand ' + t(a + '(x' + sg(-x1) + ')') + ' carefully.' };
            if (v === a - a * x1 - y1) return { code: 'l5-c-sign', hint: 'To clear ' + t('-' + y1) + ' from the left, add ' + t(y1) + ' to both sides.' };
            if (v === c) return { code: 'l5-nr-sum', hint: 'That is ' + t('c') + '. The question asks for ' + t('a+c') + '.' };
            return null;
          };
          return K.P.nr('<i>(Numerical Response)</i> The equation ' + t(ps(Lo, [x1, y1])) + ' is rewritten in general form ' + t('ax-y+c=0') + ', with ' + t('a>0') + '. The value of ' + t('a+c') + ' is ____.', ans, diag,
            t(ps(Lo, [x1, y1])) + ' → ' + t('y-' + y1 + '=' + a + 'x' + sg(-a * x1)) + ' → ' + t('y=' + a + 'x' + sg(c)) + ' → ' + t(a + 'x-y' + sg(c) + '=0') + '. So ' + t('a=' + a) + ', ' + t('c=' + c) + ' and ' + t('a+c=' + ans) + '.',
            ['Expand, get ' + t('y') + ' alone, then move every term to the side where ' + t('x') + ' is positive.'], 'NR a+c general form');
        } }] }
    ],

    /* ================= EXTRA PRACTICE (u7_EP05) ================= */
    extra: [
      /* ---- Part A ---- */
      { num: '1', section: 'Extra practice A — Choose the strategy before you draw',
        shared: function (r) {
          var a = r.pick([[3, 4], [2, 3], [2, 5], [3, 5], [1, 4]]), ab = r.int(2, 6);
          var b = intPair(r, [2, 3, 4, 5, 6], [4, 5, 6, 8, 10]), c = intPair(r, [2, 3, 4, 5], [-4, -5, -6, -7, -9]);
          var dm = r.pick([[2, 5], [1, 3], [3, 4], [2, 3]]), dP = [-r.int(2, 6), r.int(2, 6)];
          var A, B, C, g = 0; do { A = r.pick([2, 3, 4, 5]); B = r.pick([3, 4, 5, 7]); C = r.int(1, 7); g++; } while ((gcd(A, B) !== 1 || C % A === 0 || C % B === 0 || A === B) && g < 200);
          var f = r.pick([[5, 2], [3, 2], [4, 3], [2, 3], [5, 3]]);
          var rows = [{ id: 'a', tex: si(mb([-a[0], a[1]], ab)), k: 'si' }, { id: 'b', tex: gen(b.L), k: 'int', ints: [b.p, b.q] }, { id: 'c', tex: gen(c.L), k: 'int', ints: [c.p, c.q] },
            { id: 'd', tex: ps(ms(dm, dP), dP), k: 'ps' }, { id: 'e', tex: gen(line(A, -B, -C)), k: 'tab', E: [A, B, C] }, { id: 'f', tex: si(mb(f, 0)), k: 'si', zero: true }];
          return { rows: rows };
        },
        stem: 'For each equation, name the strategy you would use — <b>do not graph anything</b>.',
        parts: [
          { id: 'e1', sub: 'a–f', level: 'PRG', make: function (r, sh) {
            var cols = [{ id: 'si', html: 'Slope and ' + t('y') + '-intercept' }, { id: 'ps', html: 'Point and slope' }, { id: 'int', html: 'Two intercepts' }, { id: 'tab', html: 'Table of values' }], want = {}, byId = {};
            sh.rows.forEach(function (rw) { want[rw.id] = rw.k; byId[rw.id] = rw; });
            var E = sh.rows[4].E;
            return K.P.grid('Choose the fastest strategy for each.', sh.rows.map(function (rw) { return { id: rw.id, html: '(' + rw.id + ') ' + t(rw.tex) }; }), cols, want, {
              why: function (row, got) {
                var rw = byId[row];
                if (rw.k === 'si') return '(' + row + ') is already solved for ' + t('y') + (rw.zero ? ' — its intercepts are both ' + ptt([0, 0]) + ', only one point; start at the origin and step the slope.' : ': plot ' + t('b') + ' and step the slope.');
                if (rw.k === 'ps') return '(' + row + ') is in slope–point form: it hands you a point and the slope.';
                if (rw.k === 'int') return '(' + row + '): in general form both coefficients divide the constant, so both intercepts are whole numbers — two quick substitutions.';
                return '(' + row + '): ' + E[0] + ' and ' + E[1] + ' don’t divide ' + E[2] + ', so the intercepts (and ' + t('b') + ') are fractions — use a table of values.';
              } },
              sh.rows.map(function (rw) { return '(' + rw.id + ') ' + t(rw.tex) + ': <b>' + { si: 'slope and ' + t('y') + '-intercept', ps: 'point and slope', int: 'two intercepts', tab: 'table of values' }[rw.k] + '</b>' + (rw.k === 'int' ? ' — ' + ptt([rw.ints[0], 0]) + ', ' + ptt([0, rw.ints[1]]) : rw.k === 'tab' ? ' — intercepts ' + t(fT(fr(E[2], E[0]))) + ' and ' + t(fT(fr(-E[2], E[1]))) + ' are fractions' : rw.zero ? ' — start at ' + ptt([0, 0]) : ''); }).join('<br>'),
              ['Look at the form first. In general form, check whether the coefficients of ' + t('x') + ' and ' + t('y') + ' divide the constant.'], 'choose strategy x6');
          } },
          { id: 'e1g', sub: 'g', level: 'EMG', make: function (r, sh) {
            var E = sh.rows[4].E;
            return mc(r, 'Three of the six — (b), (c) and (e) — are in general form, but (e) is not a two-intercept question. Why not?', [
              { html: 'Its coefficients ' + E[0] + ' and ' + E[1] + ' don’t divide the constant ' + E[2] + ', so both intercepts are fractions that can’t be plotted on the grid.', right: true },
              { html: 'Its slope is a fraction.', why: '(c) has a fractional slope too, and the intercepts still work there. The problem in (e) is the <b>intercepts</b>.' },
              { html: 'It isn’t really in general form.', why: t(sh.rows[4].tex) + ' is in general form, ' + t('Ax+By+C=0') + '.' },
              { html: 'Its constant term is negative.', why: 'A negative constant is no problem (look at (b) and (c)). What matters is whether the coefficients divide it.' }],
              'In (b) and (c) the coefficients divide the constant, so both intercepts are whole numbers. In (e), ' + E[0] + ' and ' + E[1] + ' don’t divide ' + E[2] + ': the intercepts ' + t(fT(fr(E[2], E[0]))) + ' and ' + t(fT(fr(-E[2], E[1]))) + ' can’t be plotted accurately — use a table.', ['Find the intercepts of (e).'], 'why not intercepts');
          } }] },
      { num: '2', stem: '<b>The wrong strategy is slower — prove it.</b> Graph each line by the strategy named, and compare.',
        shared: function (r) { var a = intPair(r, [2, 3, 4, 5, 6], [3, 4, 5, 6, 7, 8]), m, b, g = 0; do { m = r.pick([2, 3, 4]); b = r.int(1, 3); g++; } while (b % m === 0 && g < 50); return { a: a, m: m, b: b }; },
        parts: [
          { id: 'e2a', sub: 'a', level: 'PRG', make: function (r, sh) { return intGraph('Graph ' + t(gen(sh.a.L)) + ' <b>by the two intercepts</b>.', sh.a.p, sh.a.q, W8, 'graph by intercepts'); } },
          { id: 'e2a2', sub: 'a (solve for y)', level: 'EMG', make: function (r, sh) {
            var Lo = sh.a.L;
            return K.P.line('Now solve ' + t(gen(Lo)) + ' for ' + t('y') + ' — the first step of the slower strategy.', Lo, { form: 'slope-intercept', wrong: [{ is: { m: -Lo.A, b: -Lo.C / Lo.B }, code: 'l5-nodiv', hint: 'Divide <b>every</b> term by ' + t(Lo.B) + ', including the ' + t('x') + '-term.' }] },
              t(Lo.B + 'y=' + (-Lo.A) + 'x' + sg(-Lo.C)) + ' → ' + t(si(Lo)) + '. Then you still have to step a fractional slope — two extra steps compared with the two substitutions.', ['Move the ' + t('x') + '-term and the constant across, then divide by the coefficient of ' + t('y') + '.'], 'solve for y');
          } },
          { id: 'e2b', sub: 'b', level: 'BEG', make: function (r, sh) { return siGraph('Graph ' + t(si(mb(sh.m, sh.b))) + ' <b>by its slope and ' + t('y') + '-intercept</b>.', sh.m, sh.b, W8, 'graph y=mx+b'); } },
          { id: 'e2b2', sub: 'b (intercepts)', level: 'EMG', outcome: 'RF5', make: function (r, sh) {
            return K.P.fraction('The slower strategy for ' + t(si(mb(sh.m, sh.b))) + ' is the two intercepts. Find the ' + t('x') + '-intercept.', fr(-sh.b, sh.m), {},
              t('y=0') + ': ' + t('0=' + sh.m + 'x+' + sh.b) + ', ' + t(sh.m + 'x=-' + sh.b) + ', ' + t('x=' + fT(fr(-sh.b, sh.m))) + ' — not a lattice point, so it can only be estimated on the grid.', ['Set ' + t('y=0') + ' and solve for ' + t('x') + '.'], 'x-intercept fraction');
          } },
          { id: 'e2c', sub: 'c', level: 'PRG', make: function (r) {
            return mc(r, 'What rule of thumb do (a) and (b) suggest for a general-form equation ' + t('Ax+By+C=0') + '?', [
              { html: 'If ' + t('A') + ' and ' + t('B') + ' both divide ' + t('C') + ', use the intercepts; if not, solve for ' + t('y') + ' and step the slope; if that is ugly too, use a table.', right: true },
              { html: 'Always solve for ' + t('y') + ' first — slope–intercept form is always fastest.', why: 'In (a), solving for ' + t('y') + ' took extra steps and gave a fractional slope; the two intercepts were faster.' },
              { html: 'Always use the two intercepts.', why: 'In (b) the ' + t('x') + '-intercept was a fraction that can’t be plotted accurately.' },
              { html: 'Use a table of values whenever the slope is a fraction.', why: 'A fractional slope is easy to step (e.g. down 7, right 4). A table is the last resort.' }],
              'In (a) the slower method gave a fractional <b>slope</b> (plottable, but extra work); in (b) it gave a fractional <b>intercept</b> (not plottable). Rule: if ' + t('A') + ' and ' + t('B') + ' divide ' + t('C') + ', use the intercepts; otherwise solve for ' + t('y') + '; a table is the fallback.', ['Which awkward number did each slower method produce?'], 'rule of thumb');
          } }] },
      /* ---- Part B ---- */
      { num: '3', section: 'Extra practice B — One strategy at a time, on the grid', stem: 'Each equation is in general form and both intercepts are whole numbers. Find them by substitution, then draw the line through them.',
        shared: function (r) { return { a: intPair(r, [-3, -4, -5, -6, -7], [3, 4, 5, 6, 7]), b: intPair(r, [5, 6, 7, 8], [2, 3, 4, 5]) }; },
        parts: ['a', 'b'].reduce(function (acc, w) {
          acc.push({ id: 'e3' + w, sub: w + ' (intercepts)', level: 'EMG', outcome: 'RF5', make: function (r, sh) {
            var s = sh[w], Lo = s.L;
            return pairsPart('State both intercepts of ' + t(gen(Lo)) + ' as ordered pairs.', [[s.p, 0], [0, s.q]],
              [{ pairs: [[0, s.p], [s.q, 0]], code: 'l5-pair-axes', hint: 'Right values, wrong axes. An ' + t('x') + '-intercept lies on the ' + t('x') + '-axis, so it is ' + t('(\\text{value},\\ 0)') + '; a ' + t('y') + '-intercept is ' + t('(0,\\ \\text{value})') + '.' },
                { pairs: [[Lo.A, 0], [0, Lo.B]], code: 'l5-pair-coef', hint: 'The coefficients of ' + t('x') + ' and ' + t('y') + ' aren’t the intercepts. Substitute ' + t('y=0') + ', then ' + t('x=0') + ', and solve.' },
                { pairs: [[-s.p, 0], [0, -s.q]], code: 'sign', hint: 'Check the signs as you solve.' }],
              t('y=0') + ': ' + t((Lo.A === 1 ? '' : Lo.A) + 'x' + sg(Lo.C) + '=0') + ', ' + t('x=' + s.p) + ' → ' + ptt([s.p, 0]) + '.<br>' + t('x=0') + ': ' + t(Lo.B + 'y' + sg(Lo.C) + '=0') + ', ' + t('y=' + s.q) + ' → ' + ptt([0, s.q]) + '.',
              ['At the ' + t('x') + '-intercept ' + t('y=0') + '; at the ' + t('y') + '-intercept ' + t('x=0') + '.'], 'intercepts as pairs');
          } });
          acc.push({ id: 'e3' + w + '2', sub: w + ' (graph)', level: 'EMG', make: function (r, sh) { var s = sh[w]; return intGraph('Draw the line ' + t(gen(s.L)) + ' through its intercepts.', s.p, s.q, W8, 'graph through intercepts'); } });
          return acc;
        }, []) },
      { num: '4', stem: 'Each equation is in <b>slope–point form</b>. Do not convert it. State the point it hands you and the slope, then step the slope to plot points and draw the line.',
        shared: function (r) {
          var fa = r.pick([[3, 4], [1, 3], [2, 3], [1, 4]]), Pa = [r.int(2, 4), -r.int(1, 3)], fb = r.pick([[2, 3], [1, 3], [3, 4], [1, 4]]), Pb = [-r.int(2, 4), r.int(3, 6)];
          return { a: { m: fa, P: Pa, L: ms(fa, Pa) }, b: { m: [-fb[0], fb[1]], P: Pb, L: ms([-fb[0], fb[1]], Pb) } };
        },
        parts: ['a', 'b'].reduce(function (acc, w) {
          acc.push({ id: 'e4' + w, sub: w + ' (point, slope)', level: 'BEG', make: function (r, sh) {
            var s = sh[w], P0 = s.P, m = mf(s.m);
            var chk = [K.number(P0[0], function (v) { return v === -P0[0] ? { code: 'l5-ps-sign', hint: 'The sign flips: ' + t('x' + sg(-P0[0])) + ' means ' + t('x-(' + P0[0] + ')') + ', so ' + t('x_1=' + P0[0]) + '.' } : null; }),
              K.number(P0[1], function (v) { return v === -P0[1] ? { code: 'l5-ps-sign', hint: 'The sign flips: ' + t('y' + sg(-P0[1])) + ' means ' + t('y-(' + P0[1] + ')') + ', so ' + t('y_1=' + P0[1]) + '.' } : null; }), K.fraction(m)];
            return K.P.fields('For ' + t(ps(s.L, P0)) + ', state the point ' + t('(x_1,\\ y_1)') + ' and the slope.', [{ label: t('x_1=') }, { label: t('y_1=') }, { label: t('m='), mode: 'math', keys: 'fraction' }], chk, [String(P0[0]), String(P0[1]), fT(m)],
              'point ' + ptt(P0) + ', ' + t('m=' + fT(m)), t(ps(s.L, P0)) + ' is ' + t('y-(' + P0[1] + ')=' + fT(m) + '(x-(' + P0[0] + '))') + ': the point is ' + ptt(P0) + ' and ' + t('m=' + fT(m)) + '.', ['Compare with ' + t('y-y_1=m(x-x_1)') + ' — the signs in the brackets are opposite to the coordinates.'], 'read point and slope');
          } });
          acc.push({ id: 'e4' + w + '2', sub: w + ' (graph)', level: 'PRG', make: function (r, sh) { var s = sh[w]; return psGraph('Draw the graph of ' + t(ps(s.L, s.P)) + '.', s.m, s.P, W8, 'graph slope-point'); } });
          return acc;
        }, []).concat([{ id: 'e4c', sub: 'c', level: 'EMG', make: function (r, sh) {
          return mc(r, 'Neither point in (a) or (b) is an intercept. Why does slope–point form almost never hand you an intercept — and why does that cost nothing when graphing?', [
            { html: 'The point is whichever point the line was built from; it is an intercept only if ' + t('x_1=0') + ' or ' + t('y_1=0') + '. A point and a slope already fix the line, so nothing is lost.', right: true },
            { html: 'Slope–point form does hand you an intercept: ' + t('y_1') + ' is the ' + t('y') + '-intercept.', why: t('y_1') + ' is the ' + t('y') + '-coordinate of the given point. It is the ' + t('y') + '-intercept only when ' + t('x_1=0') + '.' },
            { html: 'You must convert to slope–intercept form first, because a line can only be graphed from an intercept.', why: 'Any point plus the slope fixes the line — stepping the slope from ' + ptt(sh.a.P) + ' works just as well.' },
            { html: 'The slope in slope–point form is always a fraction, so the intercept is hidden.', why: 'The slope can be any number. The point simply isn’t chosen to be an intercept.' }],
            'An intercept is just a point with a zero coordinate. ' + ptt(sh.a.P) + ' and ' + ptt(sh.b.P) + ' have no zero, so they aren’t intercepts — but a point and a slope fix the line anyway. (Stepping the slope may land on an intercept.)', ['When is a point an intercept?'], 'why slope-point is enough');
        } }]) },
      { num: '5', stem: function (sh) { return '<b>The fallback.</b> For ' + t(gen(sh.L)) + ' the slope is ' + t(fT(fr(sh.A, sh.B))) + ', the ' + t('x') + '-intercept is ' + t(fT(fr(sh.C, sh.A))) + ' and the ' + t('y') + '-intercept is ' + t(fT(fr(-sh.C, sh.B))) + ' — nothing is pleasant. Use a table of values instead.'; },
        shared: function (r) {
          var A, B, C, g = 0; do { A = r.pick([2, 3, 4]); B = r.pick([3, 5]); C = r.pick([1, 2, 4, 7]); g++; } while ((gcd(A, B) !== 1 || C % A === 0 || C % B === 0) && g < 100);
          var x0 = -10; while (((A * x0 - C) % B + B) % B !== 0) x0++;
          var xs = [0, 1, 2, 3].map(function (i) { return x0 + i * B; }).filter(function (x) { return x <= 10; });
          return { A: A, B: B, C: C, L: line(A, -B, -C), xs: xs, ys: xs.map(function (x) { return (A * x - C) / B; }) };
        },
        parts: [
          { id: 'e5a', sub: 'a (table)', level: 'EMG', outcome: 'RF4', make: function (r, sh) {
            var chk = sh.xs.map(function (x, i) { return K.number(sh.ys[i], function (v) { return v === (sh.A * x + sh.C) / sh.B ? { code: 'l5-tab-sign', hint: 'From ' + t(gen(sh.L)) + ': ' + t(sh.B + 'y=' + sh.A + 'x-' + sh.C) + ', so ' + t('y=(' + sh.A + 'x-' + sh.C + ')\\div ' + sh.B) + '.' } : null; }); });
            return K.P.fields('Complete the table of values.', sh.xs.map(function (x) { return { label: t('x=' + x) + ': ' + t('y=') }; }), chk, sh.ys.map(String), sh.xs.map(function (x, i) { return t(pt([x, sh.ys[i]])); }).join(', '),
              t(sh.B + 'y=' + sh.A + 'x-' + sh.C) + ', so ' + t('y=(' + sh.A + 'x-' + sh.C + ')\\div ' + sh.B) + '.<br>' + sh.xs.map(function (x, i) { return t('x=' + x) + ': ' + t('y=(' + (sh.A * x) + '-' + sh.C + ')\\div ' + sh.B + '=' + sh.ys[i]); }).join('<br>'),
              ['Solve for ' + t('y') + ' first, or substitute each ' + t('x') + ' and solve for ' + t('y') + '.'], 'table of values');
          } },
          { id: 'e5a2', sub: 'a (graph)', level: 'EMG', make: function (r, sh) {
            return gpart('Plot the points from your table and draw the line ' + t(gen(sh.L)) + '.', sh.L, W10, {},
              'Plot ' + sh.xs.map(function (x, i) { return ptt([x, sh.ys[i]]); }).join(', ') + '. Each step: right ' + sh.B + ', up ' + sh.A + '. Join them with one straight line (arrows on both ends).', ['Use the points from the table.'], 'graph from table');
          } },
          { id: 'e5b', sub: 'b', level: 'PRG', make: function (r, sh) {
            var A = sh.A, B = sh.B;
            return mc(r, 'The ' + t('x') + '-values in the table step by ' + t(B) + ', not by ' + t(1) + '. Why is ' + t(B) + ' the smallest step that keeps every ' + t('y') + '-value a whole number?', [
              { html: 'Since ' + t(B + 'y=' + A + 'x-' + sh.C) + ', ' + t('y') + ' is whole only when ' + t(B) + ' divides ' + t(A + 'x-' + sh.C) + '. Raising ' + t('x') + ' by ' + t('k') + ' raises it by ' + t(A + 'k') + ', and ' + t(A + 'k') + ' is first a multiple of ' + t(B) + ' at ' + t('k=' + B) + '.', right: true },
              { html: 'Because the ' + t('x') + '-intercept is ' + t(fT(fr(sh.C, A))) + '.', why: 'The ' + t('x') + '-intercept isn’t even in the table. Think about what makes ' + t('y=(' + A + 'x-' + sh.C + ')\\div ' + B) + ' a whole number.' },
              { html: 'Any step works; ' + t(B) + ' is just a convenient choice.', why: 'Try a step of ' + t(1) + ' from ' + t('x=' + sh.xs[0]) + ': ' + t('y=' + fT(fr(A * (sh.xs[0] + 1) - sh.C, B))) + ', not a whole number.' },
              { html: 'Because ' + t(B) + ' is the coefficient of ' + t('y') + ', and ' + t('x') + ' always steps by the coefficient of ' + t('y') + '.', why: 'Close, but not “always”: what matters is that ' + t(A) + ' and ' + t(B) + ' share no factor, so ' + t(A + 'k') + ' is a multiple of ' + t(B) + ' only when ' + t('k') + ' is.' }],
              t('y') + ' is whole only when ' + t(B) + ' divides ' + t(A + 'x-' + sh.C) + '. Each step of ' + t('k') + ' in ' + t('x') + ' changes this by ' + t(A + 'k') + '; since ' + t(A) + ' and ' + t(B) + ' share no factor, the smallest ' + t('k') + ' that works is ' + t(B) + ' — the run in the slope ' + t(fT(fr(A, B))) + '.', ['What does ' + t('y') + ' equal? When is that a whole number?'], 'why step B');
          } },
          { id: 'e5c', sub: 'c', level: 'EMG', make: function (r) {
            return mc(r, 'A classmate says, “A table of values always works, so just always use a table.” What is the strongest argument against this?', [
              { html: 'For lines like those in Question 3, two substitutions give two whole-number points. A table needs more substitutions, each with a division — more work and more chances to slip.', right: true },
              { html: 'A table of values doesn’t always work.', why: 'It does always work — that’s why it is the fallback. The argument is about speed.' },
              { html: 'A table gives a less accurate line.', why: 'Correct table points are exactly on the line. The problem is the extra work.' },
              { html: 'Tables can’t be used for equations in general form.', why: 'You just used one for a general-form equation in (a).' }],
              'A table always works, but it is the fallback, not the first choice: when the intercepts are whole numbers, two substitutions finish the job.', ['Compare the work in Question 3 with the work in (a).'], 'table is the fallback');
          } }] },
      /* ---- Part C ---- */
      { num: '6', section: 'Extra practice C — Lines with only one intercept',
        shared: function (r) { var a = r.pick([2, 3, 4]), k = r.pick([-5, -4, -3, -2, 2, 3, 4, 5]), c = r.pick([3, 5, 7, 9, 11]) * r.pick([1, 1, -1]), f = r.pick([[3, 2], [1, 2], [2, 3], [4, 3], [5, 2], [1, 3]]); return { a: a, k: k, c: c, f: f }; },
        stem: function (sh) { return 'For each line, first think about what the two-intercept strategy produces — two points, one point, or nothing usable — then graph the line by whatever means actually works.<br>(a) ' + t(sh.a + 'y' + sg(-sh.a * sh.k) + '=0') + ' &nbsp; (b) ' + t('2x' + sg(sh.c) + '=0') + ' &nbsp; (c) ' + t(si(mb(sh.f, 0))); },
        parts: [
          { id: 'e6a', sub: 'a', level: 'EMG', make: function (r, sh) {
            var k = sh.k, Lo = line(0, 1, -k), eq = sh.a + 'y' + sg(-sh.a * k) + '=0';
            return gpart('Graph (a) ' + t(eq) + '.', Lo, W8, { wrong: [{ L: line(1, 0, -k), code: 'l5-gr-hv', hint: 'There is no ' + t('x') + ' in the equation: ' + t('y=' + k) + ' for every ' + t('x') + ', so the line is <b>horizontal</b>.' }, { L: line(0, 1, k), code: 'sign', hint: 'Solve carefully: ' + t(sh.a + 'y=' + (sh.a * k)) + ', so ' + t('y=' + k) + '.' }, { L: line(0, 1, sh.a * k), code: 'l5-gr-half', hint: 'Divide by ' + t(sh.a) + ': ' + t(sh.a + 'y=' + sh.a * k) + ' gives ' + t('y=' + k) + '.' }] },
              t('x=0') + ': ' + t('y=' + k) + ' → ' + ptt([0, k]) + '. ' + t('y=0') + ': ' + t(sg(-sh.a * k).replace('+', '') + '=0') + ' — impossible, so no ' + t('x') + '-intercept: <b>one point</b>.<br>' + t('y=' + k) + ' for every ' + t('x') + ': a <b>horizontal</b> line through ' + ptt([0, k]) + '.', ['Solve for ' + t('y') + '. Does ' + t('x') + ' appear at all?'], 'graph horizontal line');
          } },
          { id: 'e6b', sub: 'b', level: 'EMG', make: function (r, sh) {
            var xv = -sh.c / 2, Lo = line(2, 0, sh.c), key = arrow([xv, -4], [xv, 4]);
            var W = [{ is: arrow([-xv, -4], [-xv, 4]), code: 'sign', hint: 'Solve carefully: ' + t('2x=' + (-sh.c)) + ', so ' + t('x=' + fT(fr(-sh.c, 2))) + '.' }, { is: arrow([-sh.c, -4], [-sh.c, 4]), code: 'l5-gr-half', hint: 'Divide by ' + t(2) + ': ' + t('2x=' + (-sh.c)) + ' gives ' + t('x=' + fT(fr(-sh.c, 2))) + '.' }];
            var p = K.P.graph('Graph (b) ' + t('2x' + sg(sh.c) + '=0') + '. (On this grid you can tap halfway between grid lines across.)', pad(W8, { snapX: 0.5 }), lineCheck(key, [Lo], { wrong: W }), key,
              t('y=0') + ': ' + t('x=' + fT(fr(-sh.c, 2))) + ' → ' + ptt([xv, 0]) + '. ' + t('x=0') + ': ' + t(sh.c + '=0') + ' — impossible, no ' + t('y') + '-intercept: <b>one point</b>.<br>' + t('x=' + fT(fr(-sh.c, 2))) + ' for every ' + t('y') + ': a <b>vertical</b> line through ' + ptt([xv, 0]) + '.', ['Solve for ' + t('x') + '. Does ' + t('y') + ' appear at all?'], 'graph vertical line half');
            p.bad = W.map(function (w) { return w.is; }).filter(function (v) { return !DR.same(v, key); }); return p;
          } },
          { id: 'e6c', sub: 'c', level: 'EMG', make: function (r, sh) {
            var m = mf(sh.f), Lo = mb(m, 0);
            return gpart('Graph (c) ' + t(si(Lo)) + '.', Lo, W8, { wrong: [{ L: mb([-m[0], m[1]], 0), code: 'l5-gr-sign', hint: 'The slope ' + t(fT(m)) + ' is positive: the line rises from left to right.' }, { L: mb([m[1], m[0]], 0), code: 'l5-gr-flip', hint: 'Slope is rise over run: ' + t(fT(m)) + ' means ' + stepT(m) + '.' }],
              anchor: [{ p: [0, 0], hint: 'Both intercepts are ' + ptt([0, 0]) + ' — good. Now step the slope ' + t(fT(m)) + ' from there: ' + stepT(m) + '.' }] },
              'Both intercepts are ' + ptt([0, 0]) + ' — one point, not enough. Step ' + t('m=' + fT(m)) + ' from the origin: ' + stepT(m) + ' to ' + ptt([m[1], m[0]]) + ', and again to ' + ptt([2 * m[1], 2 * m[0]]) + '.', ['Start at the origin and step the slope.'], 'graph y=mx through origin');
          } },
          { id: 'e6d', sub: 'd', level: 'BEG', outcome: 'RF5', make: function (r, sh) {
            var rows = [{ id: 'a', html: '(a) ' + t(sh.a + 'y' + sg(-sh.a * sh.k) + '=0') }, { id: 'b', html: '(b) ' + t('2x' + sg(sh.c) + '=0') }, { id: 'c', html: '(c) ' + t(si(mb(sh.f, 0))) }];
            var cols = [{ id: 'z', html: 'Slope 0' }, { id: 'u', html: 'Undefined slope' }, { id: 'r', html: 'Slope read straight off' }];
            return K.P.grid('One has a slope of 0, one has an undefined slope, and one has a slope you can read straight off. Match them up.', rows, cols, { a: 'z', b: 'u', c: 'r' }, { why: function (row) { return row === 'a' ? '(a) is ' + t('y=' + sh.k) + ': horizontal, so its slope is 0.' : row === 'b' ? '(b) is ' + t('x=' + fT(fr(-sh.c, 2))) + ': vertical — the run is 0, so the slope is undefined.' : '(c) is already ' + t('y=mx') + ': the slope is ' + t(fT(mf(sh.f))) + '.'; } },
              'Slope 0: (a), ' + t('y=' + sh.k) + ' (horizontal). Undefined: (b), ' + t('x=' + fT(fr(-sh.c, 2))) + ' (vertical). Read off: (c), ' + t('m=' + fT(mf(sh.f))) + '.', ['Horizontal lines have slope 0; vertical lines have undefined slope.'], 'slope 0 / undefined / read off');
          } },
          { id: 'e6e', sub: 'e', level: 'EMG', make: function (r, sh) {
            var m = mf(sh.f), Lo = mb(m, 0), key = pt([m[1], m[0]]);
            var check = function (resp) {
              if (!String(resp || '').trim()) return form('empty', 'Type your answer first.');
              var P0 = readPair(resp); if (!P0) return form('unreadable', 'Write one ordered pair, e.g. ' + t('(2,\\ 3)') + '.');
              if (Math.abs(P0[0]) < 1e-9 && Math.abs(P0[1]) < 1e-9) return wrong('l5-origin', 'That is the point you already have. You need a <b>second</b> point: step the slope from ' + ptt([0, 0]) + '.');
              if (onL(Lo, P0)) return ok();
              if (onL(mb([m[1], m[0]], 0), P0)) return wrong('l5-not-on', 'Check: slope ' + t(fT(m)) + ' means ' + stepT(m) + ' — your point steps run over rise.');
              return wrong('l5-not-on', ptt(P0) + ' is not on ' + t(si(Lo)) + ': substitute ' + t('x=' + nT(P0[0])) + ' and see what ' + t('y') + ' you get.');
            };
            var p = K.P.math('In (c) the intercept strategy gives a single point. What must you do next? Name one more point you could use (other than ' + ptt([0, 0]) + ').', check, key,
              'One point doesn’t fix a line, so find a second point by stepping the slope ' + t(fT(m)) + ' from ' + ptt([0, 0]) + ' (or substituting another ' + t('x') + '): e.g. ' + t('x=' + m[1]) + ' gives ' + t('y=' + m[0]) + ', so ' + t(key) + '.', ['Step the slope from the origin.'], 'second point on y=mx', { keys: 'pairs', placeholder: 'e.g. (2, 3)' });
            p.good = [pt([-m[1], -m[0]]), pt([2 * m[1], 2 * m[0]])]; p.bad = ['(0,\\ 0)', pt([m[0], m[1]])]; return p;
          } },
          { id: 'e6f', sub: 'f', level: 'BEG', make: function (r, sh) {
            return mc(r, 'Only one of the three cannot be written in the form ' + t('y=mx+b') + ' at all. Which one?', [
              { html: '(b) ' + t('2x' + sg(sh.c) + '=0') + ' — it is vertical, so there is no number for ' + t('m') + ', and ' + t('y') + ' doesn’t appear.', right: true },
              { html: '(a) ' + t(sh.a + 'y' + sg(-sh.a * sh.k) + '=0'), why: '(a) is ' + t('y=0x+(' + sh.k + ')') + ', i.e. ' + t('y=' + sh.k) + ': slope 0 is a number.' },
              { html: '(c) ' + t(si(mb(sh.f, 0))), why: '(c) is ' + t('y=mx+b') + ' with ' + t('b=0') + '.' },
              { html: 'None of them — every line can be written as ' + t('y=mx+b') + '.', why: 'A vertical line has undefined slope: it can’t be solved for ' + t('y') + '.' }],
              '(b) is ' + t('x=' + fT(fr(-sh.c, 2))) + ', a vertical line: its slope is undefined and ' + t('y') + ' doesn’t appear, so it can’t be solved for ' + t('y') + '.', ['Which line has an undefined slope?'], 'which cannot be y=mx+b', true);
          } }] },
      /* ---- Part D ---- */
      { num: '7', section: 'Extra practice D — Backwards: from a drawn line to all three forms',
        shared: function (r) {
          var fa = r.pick([[3, 2], [2, 3], [1, 2], [3, 4]]), ba = r.pick([-4, -3, -2, -1, 1, 2]), La = mb(fa, ba), kk = 1;
          while (Math.abs(ba + (kk + 1) * fa[0]) <= 6 && (kk + 1) * fa[1] <= 6) kk++;
          var fb = r.pick([[3, 5], [1, 4], [3, 4], [2, 5], [1, 5]]), bb = r.pick([-2, -1, 1, 2, 3]), Lb = mb(fb, bb);
          var xc = r.pick([-5, -4, -3, -2, 2, 3, 4, 5]), yc = r.pick([-4, -3, -2, 2, 3, 4]);
          return { a: { L: La, P: [[0, ba], [kk * fa[1], ba + kk * fa[0]]], m: fa, b: ba }, b: { L: Lb, P: [[-fb[1], bb - fb[0]], [fb[1], bb + fb[0]]], m: fb, b: bb }, c: { x: xc, y: yc } };
        },
        stem: function (sh) { return 'Each line below is drawn through the marked lattice points.' + figs([{ label: '(a)', html: fig(sh.a.L, W6, { marks: sh.a.P, max: 150 }) }, { label: '(b)', html: fig(sh.b.L, W6, { marks: sh.b.P, max: 150 }) }, { label: '(c)', html: fig(line(1, 0, -sh.c.x), W6, { marks: [[sh.c.x, sh.c.y]], max: 150 }) }]); },
        parts: ['a', 'b'].reduce(function (acc, w) {
          acc.push({ id: 'e7' + w + '1', sub: w + ' (slope–intercept)', level: w === 'a' ? 'EMG' : 'PRG', outcome: 'RF7', make: function (r, sh) {
            var s = sh[w], P1 = s.P[0], P2 = s.P[1], m = mf(s.m);
            return K.P.line('Line (' + w + '): write its equation in <b>slope–intercept form</b>.', s.L, { form: 'slope-intercept' },
              'Marked points ' + ptt(P1) + ' and ' + ptt(P2) + ': ' + t('m=\\frac{' + P2[1] + '-(' + P1[1] + ')}{' + P2[0] + '-(' + P1[0] + ')}=\\frac{' + (P2[1] - P1[1]) + '}{' + (P2[0] - P1[0]) + '}=' + fT(m)) + '.<br>' + (w === 'a' ? 'The line crosses the ' + t('y') + '-axis at ' + t(s.b) : t(P2[1] + '=' + fT(m) + '(' + P2[0] + ')+b') + ', so ' + t('b=' + s.b)) + '.<br>' + t(si(s.L)) + '.',
              ['Find the slope from the two marked points (rise over run).', w === 'a' ? 'Read the ' + t('y') + '-intercept from the graph.' : 'The ' + t('y') + '-intercept isn’t marked: substitute a point into ' + t('y=mx+b') + ' to find ' + t('b') + '.'], 'equation from graph (si)');
          } });
          acc.push({ id: 'e7' + w + '2', sub: w + ' (general)', level: 'PRG', outcome: 'RF7', make: function (r, sh) {
            var s = sh[w], m = mf(s.m);
            return K.P.line('Line (' + w + '): write its equation in <b>general form</b> (' + t('A') + ', ' + t('B') + ', ' + t('C') + ' integers, ' + t('A>0') + ').', s.L, { form: 'general' },
              t(si(s.L)) + '; multiply by ' + t(m[1]) + ': ' + t(m[1] + 'y=' + (m[0] === 1 ? '' : m[0]) + 'x' + sg(m[1] * s.b)) + ', so ' + t(gen(s.L)) + '.', ['Start from slope–intercept form, clear the fraction, and move every term to one side.'], 'equation from graph (general)');
          } });
          acc.push({ id: 'e7' + w + '3', sub: w + ' (slope–point)', level: 'EMG', outcome: 'RF7', make: function (r, sh) {
            var s = sh[w], P1 = s.P[0], P2 = s.P[1], Lo = s.L;
            var p = K.P.math('Line (' + w + '): write its equation in <b>slope–point form</b>, ' + t('y-y_1=m(x-x_1)') + ', using one of the marked points.', psEither(Lo, P1, P2), ps(Lo, P2),
              'With ' + ptt(P2) + ': ' + t(ps(Lo, P2)) + ' (or with ' + ptt(P1) + ': ' + t(ps(Lo, P1)) + ').', ['Use the slope you found and either marked point.'], 'equation from graph (slope-point)', { keys: 'eq', vars: ['x', 'y'], placeholder: 'e.g. y - 3 = 2(x + 1)' });
            p.good = [ps(Lo, P1)]; p.bad = [si(Lo) === ps(Lo, P1) ? 'y=0' : si(Lo)]; return p;
          } });
          return acc;
        }, []).concat([
          { id: 'e7c', sub: 'c', level: 'BEG', outcome: 'RF7', make: function (r, sh) {
            var c = sh.c, p = K.P.line('Line (c) is vertical. Write its equation.', { x: c.x }, {}, 'Every point on the line has ' + t('x=' + c.x) + ': ' + t('x=' + c.x) + ' (general form ' + t('x' + sg(-c.x) + '=0') + '). It has no slope–intercept or slope–point form — its slope is undefined.', ['On a vertical line every point has the same ' + t('x') + '-coordinate.'], 'vertical line equation');
            p.good = ['x' + sg(-c.x) + '=0']; p.bad = ['y=' + c.y, 'x=' + (-c.x)]; return p;
          } },
          { id: 'e7d', sub: 'd', level: 'EMG', make: function (r, sh) {
            return mc(r, 'One of the three lines defeats two of the three forms. Which line, and why?', [
              { html: 'Line (c): it is vertical, so its slope is undefined — slope–intercept and slope–point form both need a number for ' + t('m') + '.', right: true },
              { html: 'Line (b): its ' + t('y') + '-intercept isn’t marked, so it has no slope–intercept form.', why: 'Every non-vertical line has a ' + t('y') + '-intercept, marked or not — you found it by substitution.' },
              { html: 'Line (c): it has no ' + t('x') + '-intercept, so general form doesn’t work.', why: 'Line (c) does cross the ' + t('x') + '-axis, at ' + ptt([sh.c.x, 0]) + ', and its general form is ' + t('x' + sg(-sh.c.x) + '=0') + '.' },
              { html: 'Line (a): its slope is a fraction, so general form needs fractions.', why: 'General form clears the fractions by multiplying through.' }],
              'Line (c), ' + t('x=' + sh.c.x) + ': its run between any two points is ' + t(0) + ', so its slope is undefined. Slope–intercept and slope–point form both need a numerical slope.', ['Which form needs a number for ' + t('m') + '?'], 'which line defeats two forms');
          } },
          { id: 'e7e', sub: 'e', level: 'EMG', make: function (r, sh) {
            var s = sh.b, xi = xInt(s.L);
            return mc(r, 'For line (b), which form would you rather have been handed if your only job was to graph the line?', [
              { html: 'Slope–intercept form, ' + t(si(s.L)) + ': it hands you ' + ptt([0, s.b]) + ' and the step “' + stepT(s.m) + '” with no work.', right: true },
              { html: 'General form, ' + t(gen(s.L)) + ': the two intercepts are fastest.', why: 'Its ' + t('x') + '-intercept is ' + t(fT(xi)) + (xi[1] === 1 ? '' : ', a fraction that can’t be plotted accurately') + ' — and finding both takes two substitutions.' },
              { html: 'None — every form takes the same amount of work.', why: 'Some forms hand you a point and a slope directly; general form makes you substitute and solve.' },
              { html: 'Slope–point form with a point that is not marked.', why: 'You want the information handed to you: a point you can plot and a slope you can step.' }],
              t(si(s.L)) + ' hands you ' + ptt([0, s.b]) + ' and the slope directly. The general form ' + t(gen(s.L)) + ' has ' + t('x') + '-intercept ' + t(fT(xi)) + '. (Slope–point form with a marked point would do almost as well.)', ['Which form hands you a point and the slope with no work?'], 'best form to graph');
          } }]) },
      /* ---- Part E ---- */
      { num: '8', section: 'Extra practice E — Recovering an equation from a table',
        shared: function (r) {
          var s, d, b, g = 0; do { s = r.pick([3, 4, 4, 5]); d = r.int(2, 7); b = r.pick([-5, -4, -3, -2, -1, 1, 2, 3, 4]); g++; } while ((gcd(s, d) !== 1 || d === s) && g < 100);
          var xs = [1, 2, 3, 4, 5].map(function (i) { return i * s; });
          return { s: s, d: d, b: b, xs: xs, ys: xs.map(function (x, i) { return (i + 1) * d + b; }), L: line(d, -s, s * b) };
        },
        stem: function (sh) { return 'The table below comes from a linear relation. Notice that the ' + t('x') + '-values step by ' + t(sh.s) + ' and that ' + t('x=0') + ' is not in the table.' + vtab(sh.xs, sh.ys); },
        parts: [
          { id: 'e8a', sub: 'a', level: 'EMG', outcome: 'RF7', make: function (r, sh) {
            return K.P.slope('A student sees the ' + t('y') + '-values going up by ' + t(sh.d) + ' and writes ' + t('m=' + sh.d) + '. Determine the correct slope.', [sh.d, sh.s], { diag: function (v) { return Math.abs(v - sh.d) < 1e-9 ? { code: 'l5-step', hint: 'The ' + t('y') + '-values rise by ' + t(sh.d) + ' while ' + t('x') + ' rises by ' + t(sh.s) + ', not by 1. Slope is rise per unit of run.' } : null; } },
              t('m=\\frac{' + sh.ys[1] + '-' + sh.ys[0] + '}{' + sh.xs[1] + '-' + sh.xs[0] + '}=\\frac{' + sh.d + '}{' + sh.s + '}') + ', not ' + t(sh.d) + '.', ['Divide the change in ' + t('y') + ' by the change in ' + t('x') + '.'], 'slope from table with step');
          } },
          { id: 'e8b', sub: 'b', level: 'EMG', outcome: 'RF7', make: function (r, sh) {
            return K.P.number('The value of ' + t('b') + ' is not in the table. Determine it.', sh.b, function (v) { if (v === sh.ys[0]) return { code: 'l5-b-table', hint: t('b') + ' is the value of ' + t('y') + ' when ' + t('x=0') + ', and the table starts at ' + t('x=' + sh.s) + '. Substitute a point into ' + t('y=' + fT([sh.d, sh.s]) + 'x+b') + '.' }; if (v === -sh.b) return { code: 'sign', hint: 'Check the sign when you solve for ' + t('b') + '.' }; return null; },
              t('y=' + fT([sh.d, sh.s]) + 'x+b') + ' with ' + ptt([sh.xs[0], sh.ys[0]]) + ': ' + t(sh.ys[0] + '=' + fT([sh.d, sh.s]) + '(' + sh.xs[0] + ')+b') + ', ' + t(sh.ys[0] + '=' + sh.d + '+b') + ', ' + t('b=' + sh.b) + '.', ['Substitute one table point into ' + t('y=mx+b') + ' and solve for ' + t('b') + '.'], 'b from table');
          } },
          { id: 'e8c1', sub: 'c (general)', level: 'PRG', outcome: 'RF7', make: function (r, sh) {
            return K.P.line('Write the relation in <b>general form</b>.', sh.L, { form: 'general', wrong: [{ is: { m: sh.d, b: sh.b }, code: 'l5-step', hint: 'Use the slope ' + t(fT([sh.d, sh.s])) + ', not ' + t(sh.d) + '.' }, { is: { m: [sh.d, sh.s], b: sh.ys[0] }, code: 'l5-b-table', hint: 'Use the ' + t('y') + '-intercept you found, ' + t('b=' + sh.b) + '.' }] },
              t(si(sh.L)) + '; ' + t('\\times ' + sh.s) + ': ' + t(sh.s + 'y=' + sh.d + 'x' + sg(sh.s * sh.b)) + ', so ' + t(gen(sh.L)) + '.', ['Clear the fraction, then move every term to one side with the ' + t('x') + '-term positive.'], 'general form from table');
          } },
          { id: 'e8c2', sub: 'c (slope–point)', level: 'EMG', outcome: 'RF7', make: function (r, sh) {
            var P0 = [sh.xs[0], sh.ys[0]];
            return K.P.line('Write the relation in <b>slope–point form</b> using the first point in the table, ' + ptt(P0) + '.', sh.L, { form: 'point-slope', point: P0 }, t(ps(sh.L, P0)) + '.', ['Slope–point form: ' + t('y-y_1=m(x-x_1)') + '.'], 'slope-point from table');
          } },
          { id: 'e8d', sub: 'd', level: 'BEG', outcome: 'RF4', make: function (r, sh) {
            var X = 10 * sh.s, Y = 10 * sh.d + sh.b;
            return K.P.number('Determine ' + t('y') + ' when ' + t('x=' + X) + '.', Y, function (v) { return v === 10 * sh.d ? { code: 'l5-b', hint: 'Don’t forget to add ' + t('b=' + sh.b) + '.' } : null; },
              t('y=' + fT([sh.d, sh.s]) + '(' + X + ')' + sg(sh.b) + '=' + (10 * sh.d) + sg(sh.b) + '=' + Y) + '.', ['Substitute into the slope–intercept form.'], 'y at x');
          } },
          { id: 'e8e', sub: 'e', level: 'EMG', outcome: 'RF4', make: function (r, sh) {
            var X = 20 * sh.s, Y = 20 * sh.d + sh.b;
            return K.P.number('Determine ' + t('x') + ' when ' + t('y=' + Y) + '.', X, null,
              t(gen(sh.L).replace('=0', '')) + ' with ' + t('y=' + Y) + ': ' + t(sh.d + 'x' + sg(-sh.s * Y) + sg(sh.s * sh.b) + '=0') + ', ' + t(sh.d + 'x=' + (sh.d * X)) + ', ' + t('x=' + X) + '.', ['Substitute ' + t('y') + ' into the general form and solve the one-step equation for ' + t('x') + '.'], 'x at y');
          } },
          { id: 'e8f', sub: 'f', level: 'EMG', make: function (r) {
            return mc(r, 'Which form is quickest in (d), where you know ' + t('x') + ', and which in (e), where you know ' + t('y') + '?', [
              { html: '(d) slope–intercept form — it is already solved for ' + t('y') + '; (e) general form — substituting ' + t('y') + ' leaves a one-step equation in ' + t('x') + '.', right: true },
              { html: 'Slope–intercept form for both.', why: 'It works for (e), but you have to undo the fraction slope; general form gets there in one step.' },
              { html: 'General form for both.', why: 'For (d), slope–intercept form gives ' + t('y') + ' straight away with no solving.' },
              { html: '(d) general form; (e) slope–intercept form.', why: 'Reversed: slope–intercept form is already solved for ' + t('y') + ', which is what (d) asks for.' }],
              'The best form depends on which variable you are solving <b>for</b>: ' + t('y=mx+b') + ' when you want ' + t('y') + '; general form when you know ' + t('y') + ' and want ' + t('x') + '.', ['Which form is already solved for ' + t('y') + '?'], 'which form when');
          } }] },
      { num: '9',
        shared: function (r) {
          var s, rt, A0, g = 0; do { s = r.pick([2, 3, 3, 4]); rt = r.pick([10, 15, 20, 20, 25, 30]); A0 = 50 * r.int(20, 36); g++; } while (((A0 * 10) % rt !== 0 || A0 - 5 * s * rt < 400) && g < 200);
          var T1s = [20, 25, 30, 35, 40, 45, 50].filter(function (T) { return T > 5 * s && A0 - rt * T >= 100; }), T1 = r.pick(T1s.length ? T1s : [5 * s + 5]);
          var A2s = []; for (var a2 = 200; a2 <= A0 - 5 * s * rt - 50; a2 += 50) if (((A0 - a2) * 10) % rt === 0) A2s.push(a2);
          var A2 = r.pick(A2s.length ? A2s : [A0 - 6 * s * rt]);
          var ts = [1, 2, 3, 4, 5].map(function (i) { return i * s; });
          return { s: s, rt: rt, A0: A0, ts: ts, As: ts.map(function (x) { return A0 - rt * x; }), L: line(rt, 1, -A0), T1: T1, A2: A2 };
        },
        stem: function (sh) { return 'A hot-air balloon begins a steady descent. The table records the balloon’s altitude ' + t('A') + ', in metres, after ' + t('t') + ' minutes of descending.' + ctab(sh.ts, sh.As, t('t') + ' (min)', t('A') + ' (m)'); },
        parts: [
          { id: 'e9a', sub: 'a', level: 'EMG', outcome: 'RF7', make: function (r, sh) {
            return K.P.number('Determine the rate of change (with its sign).', -sh.rt, function (v) { if (v === sh.rt) return { code: 'sign', hint: 'The balloon is <b>descending</b>: the altitude goes down, so the rate is negative.' }; if (v === -sh.rt * sh.s || v === sh.rt * sh.s) return { code: 'l5-run', hint: 'The altitude drops ' + t(sh.rt * sh.s) + ' m every ' + t(sh.s) + ' minutes. Divide by the run to get metres per <b>minute</b>.' }; return null; },
              t('m=\\frac{' + sh.As[1] + '-' + sh.As[0] + '}{' + sh.ts[1] + '-' + sh.ts[0] + '}=\\frac{' + (-sh.rt * sh.s) + '}{' + sh.s + '}=' + (-sh.rt)) + ' m/min: the balloon loses ' + sh.rt + ' metres of altitude every minute.', ['Change in ' + t('A') + ' ÷ change in ' + t('t') + '.'], 'rate of change with units', { after: ' m/min' });
          } },
          { id: 'e9b1', sub: 'b (A = mt + b)', level: 'PRG', outcome: 'RF7', make: function (r, sh) {
            return K.P.line('Write the relation in the form ' + t('A=mt+b') + '.', sh.L, { form: 'slope-intercept', vars: ['t', 'A'], wrong: [{ is: { m: -sh.rt, b: sh.As[0] }, code: 'l5-b-table', hint: 'The table starts at ' + t('t=' + sh.s) + ', not ' + t('t=0') + '. Substitute a point to find ' + t('b') + '.' }, { is: { m: sh.rt, b: sh.A0 }, code: 'l5-rise', hint: 'Descending: the slope is negative.' }] },
              t(sh.As[0] + '=-' + sh.rt + '(' + sh.s + ')+b') + ', ' + t('b=' + sh.A0) + ': ' + t('A=-' + sh.rt + 't+' + sh.A0) + '.', ['Use the rate as ' + t('m') + ' and substitute a table point to find ' + t('b') + '.'], 'A=mt+b from table');
          } },
          { id: 'e9b2', sub: 'b (general)', level: 'EMG', make: function (r, sh) {
            return K.P.line('Now write it in general form.', sh.L, { form: 'general', vars: ['t', 'A'] }, t('A=-' + sh.rt + 't+' + sh.A0) + ' → ' + t(gen(sh.L, ['t', 'A'])) + '.', ['Move every term to one side, with the ' + t('t') + '-term positive.'], 'context general form');
          } },
          { id: 'e9c', sub: 'c', level: 'BEG', outcome: 'RF5', make: function (r, sh) {
            return K.P.number('State the value of the ' + t('A') + '-intercept. (It is the balloon’s altitude when the descent began.)', sh.A0, function (v) { return v === sh.As[0] ? { code: 'l5-b-table', hint: 'That is the altitude after ' + sh.s + ' minutes. The ' + t('A') + '-intercept is at ' + t('t=0') + '.' } : null; },
              'At ' + t('t=0') + ': ' + t('A=' + sh.A0) + '. The balloon was ' + HW.fmt(sh.A0) + ' m up when the descent began.', ['The ' + t('A') + '-intercept is the value of ' + t('A') + ' when ' + t('t=0') + '.'], 'A-intercept', { after: ' m' });
          } },
          { id: 'e9d', sub: 'd', level: 'EMG', outcome: 'RF5', make: function (r, sh) {
            var ti = sh.A0 / sh.rt;
            return K.P.number('Determine the ' + t('t') + '-intercept. (It marks the moment the balloon reaches the ground.)', ti, null,
              t('A=0') + ': ' + t('0=-' + sh.rt + 't+' + sh.A0) + ', ' + t(sh.rt + 't=' + sh.A0) + ', ' + t('t=' + ti) + ' min — the balloon reaches the ground.', ['Set ' + t('A=0') + ' and solve for ' + t('t') + '.'], 't-intercept', { after: ' min' });
          } },
          { id: 'e9e', sub: 'e', level: 'EMG', outcome: 'RF4', make: function (r, sh) {
            var a1 = sh.A0 - sh.rt * sh.T1, t2 = (sh.A0 - sh.A2) / sh.rt;
            return K.P.fields('Find the altitude at ' + t('t=' + sh.T1) + ' min, and the time at which the altitude is ' + t(sh.A2) + ' m.', [{ label: 'altitude at ' + t('t=' + sh.T1) + ':', after: ' m' }, { label: 'time when ' + t('A=' + sh.A2) + ':' }],
              [K.number(a1, function (v) { return v === sh.A0 + sh.rt * sh.T1 ? { code: 'sign', hint: 'The altitude is decreasing: subtract.' } : null; }), K.number(t2, function (v) { return v === (sh.A0 + sh.A2) / sh.rt ? { code: 'sign', hint: 'Solve ' + t(sh.A2 + '=-' + sh.rt + 't+' + sh.A0) + ': subtract ' + t(sh.A0) + ' from both sides first.' } : null; })],
              [String(a1), String(t2)], 'altitude ' + t(a1) + ' m; time ' + t(t2) + ' min',
              t('A=-' + sh.rt + '(' + sh.T1 + ')+' + sh.A0 + '=' + a1) + ' m.<br>' + t(sh.A2 + '=-' + sh.rt + 't+' + sh.A0) + ', ' + t(sh.rt + 't=' + (sh.A0 - sh.A2)) + ', ' + t('t=' + t2) + ' min.', ['Substitute into ' + t('A=-' + sh.rt + 't+' + sh.A0) + '.'], 'evaluate and solve in context');
          } },
          { id: 'e9f', sub: 'f', level: 'PRG', outcome: 'RF5', make: function (r, sh) {
            var ti = sh.A0 / sh.rt, tS = [1, 2, 5, 10].filter(function (x) { return 20 * x >= ti; })[0], aS = [50, 100, 200, 500].filter(function (x) { return 20 * x >= sh.A0; })[0];
            var tLo = [1, 2, 5, 10][[1, 2, 5, 10].indexOf(tS) - 1], aLo = [50, 100, 200, 500][[50, 100, 200, 500].indexOf(aS) - 1];
            var o = [{ html: t('t') + '-axis ' + tS + ' min per square, ' + t('A') + '-axis ' + aS + ' m per square', right: true },
              { html: t('A') + '-axis ' + tS + ' m per square, ' + t('t') + '-axis ' + aS + ' min per square', why: 'Swapped: the ' + t('t') + '-axis needs to reach ' + t(ti) + ' min and the ' + t('A') + '-axis ' + t(sh.A0) + ' m.' }];
            if (tLo) o.push({ html: t('t') + '-axis ' + tLo + ' min per square, ' + t('A') + '-axis ' + aS + ' m per square', why: '20 squares of ' + tLo + ' min only reach ' + 20 * tLo + ' min — the landing is at ' + t(ti) + ' min.' });
            if (aLo) o.push({ html: t('t') + '-axis ' + tS + ' min per square, ' + t('A') + '-axis ' + aLo + ' m per square', why: '20 squares of ' + aLo + ' m only reach ' + HW.fmt(20 * aLo) + ' m — the start is at ' + HW.fmt(sh.A0) + ' m.' });
            if (o.length < 4) o.push({ html: t('t') + '-axis 1 min per square, ' + t('A') + '-axis 10 m per square', why: '20 squares of 10 m reach only 200 m.' });
            return mc(r, 'To graph this by hand, you use the two intercepts ' + ptt([0, sh.A0]) + ' and ' + ptt([ti, 0]) + ' on a grid 20 squares wide and 20 squares tall. Which scale fits both intercepts?', o,
              'The intercepts are still the right two points (one substitution each, and both have meaning: start of descent and landing). Only the scale is awkward: ' + tS + ' min per square reaches ' + 20 * tS + ' min ' + t('\\ge ' + ti) + '; ' + aS + ' m per square reaches ' + HW.fmt(20 * aS) + ' m ' + t('\\ge ' + sh.A0) + '. Only the first quadrant is needed.', ['20 squares × scale must reach each intercept.'], 'choose a scale');
          } }] },
      /* ---- Part F ---- */
      { num: '10', section: 'Extra practice F — Error analysis',
        shared: function (r) { var p, q, g = 0; do { p = r.int(2, 6); q = r.int(2, 6); g++; } while (p === q && g < 50); return { p: p, q: q, L: thru([p, 0], [0, q]), S: thru([0, p], [q, 0]) }; },
        stem: function (sh) { return 'Asked to graph ' + t(gen(sh.L)) + ' by the two-intercept strategy, a student correctly finds that the ' + t('x') + '-intercept has value ' + t(sh.p) + ' and the ' + t('y') + '-intercept has value ' + t(sh.q) + ' — and then plots ' + ptt([0, sh.p]) + ' and ' + ptt([sh.q, 0]) + '. Their line is shown.' + fig(sh.S, W8, { marks: [[0, sh.p], [sh.q, 0]], max: 220 }); },
        parts: [
          { id: 'e10a', sub: 'a', level: 'EMG', outcome: 'RF5', make: function (r, sh) {
            return mc(r, 'What is the mistake?', [
              { html: 'Each intercept is on the wrong axis: the ' + t('x') + '-intercept belongs at ' + ptt([sh.p, 0]) + ' and the ' + t('y') + '-intercept at ' + ptt([0, sh.q]) + '.', right: true },
              { html: 'The intercept values are wrong.', why: 'The values ' + sh.p + ' and ' + sh.q + ' are right — look at where they were plotted.' },
              { html: 'The line needs a third point.', why: 'Two correct points are enough for a line. These two points are in the wrong places.' },
              { html: 'The slope should have been found first.', why: 'The two-intercept strategy doesn’t need the slope. The problem is where the intercepts were plotted.' }],
              'The student put each intercept on the wrong axis. The ' + t('x') + '-intercept ' + sh.p + ' is on the ' + t('x') + '-axis, at ' + ptt([sh.p, 0]) + '; the ' + t('y') + '-intercept at ' + ptt([0, sh.q]) + '.', ['Which axis does an ' + t('x') + '-intercept lie on?'], 'error: intercepts on wrong axes');
          } },
          { id: 'e10b', sub: 'b', level: 'PRG', outcome: 'RF7', make: function (r, sh) {
            return K.P.line('Determine the equation, in general form, of the line the student <b>actually drew</b>.', sh.S, { form: 'general', wrong: [{ is: sh.L, code: 'l5-gr-student', hint: 'That is the correct line for the question — but this asks for the line the student drew, through ' + ptt([0, sh.p]) + ' and ' + ptt([sh.q, 0]) + '.' }] },
              'Through ' + ptt([0, sh.p]) + ' and ' + ptt([sh.q, 0]) + ': ' + t('m=\\frac{0-' + sh.p + '}{' + sh.q + '-0}=' + fT(fr(-sh.p, sh.q))) + ', ' + t('b=' + sh.p) + '. ' + t(si(sh.S)) + ' → ' + t(gen(sh.S)) + '.', ['Find the slope through the two plotted points; the ' + t('y') + '-intercept is ' + t(sh.p) + '.'], 'equation of the wrong line');
          } },
          { id: 'e10c', sub: 'c', level: 'PRG', make: function (r, sh) {
            var p = gpart('Draw the <b>correct</b> line for ' + t(gen(sh.L)) + '. (The student’s line is shown dashed.)', sh.L, W8, { pad: { bg: { segs: [dashed(sh.S, W8)] } },
              wrong: [{ L: sh.S, code: 'l5-gr-student', hint: 'That’s the student’s line again. The ' + t('x') + '-intercept goes on the ' + t('x') + '-axis: ' + ptt([sh.p, 0]) + '.' }],
              anchor: [{ p: [sh.p, 0], hint: ptt([sh.p, 0]) + ' is right. The other point is the ' + t('y') + '-intercept ' + ptt([0, sh.q]) + '.' }, { p: [0, sh.q], hint: ptt([0, sh.q]) + ' is right. The other point is the ' + t('x') + '-intercept ' + ptt([sh.p, 0]) + '.' }] },
              'The correct line goes through ' + ptt([sh.p, 0]) + ' and ' + ptt([0, sh.q]) + ', slope ' + t(fT(fr(-sh.q, sh.p))) + '.', ['Put each intercept on its own axis.'], 'draw corrected line');
            return p;
          } },
          { id: 'e10d', sub: 'd', level: 'BEG', make: function (r, sh) {
            var Lo = sh.L, v = Lo.B * sh.p + Lo.C;
            return K.P.number('A single substitution would have caught the mistake before the line was ruled. Substitute the student’s point ' + ptt([0, sh.p]) + ' into the left side of ' + t(gen(Lo)) + '. What do you get?', v, null,
              t(Lo.A + '(0)' + sg(Lo.B) + '(' + sh.p + ')' + sg(Lo.C) + '=' + v) + ' ' + t('\\ne 0') + ', so ' + ptt([0, sh.p]) + ' is <b>not</b> on the line — caught before ruling.', ['Replace ' + t('x') + ' with 0 and ' + t('y') + ' with ' + sh.p + '.'], 'test a point');
          } },
          { id: 'e10e', sub: 'e', level: 'LIM', outcome: 'RF5', make: function (r) {
            return mc(r, 'Which memory rule prevents this mistake?', [
              { html: 'At the ' + t('x') + '-intercept, ' + t('y=0') + '; at the ' + t('y') + '-intercept, ' + t('x=0') + '. So the ' + t('x') + '-intercept is ' + t('(\\text{value},\\ 0)') + '.', right: true },
              { html: 'At the ' + t('x') + '-intercept, ' + t('x=0') + '.', why: 'If ' + t('x=0') + ' you are on the ' + t('y') + '-axis. The ' + t('x') + '-intercept is on the ' + t('x') + '-axis, where ' + t('y=0') + '.' },
              { html: 'The ' + t('x') + '-intercept is always ' + t('(0,\\ \\text{value})') + '.', why: 'That point is on the ' + t('y') + '-axis.' },
              { html: 'The larger intercept always goes on the ' + t('y') + '-axis.', why: 'Size has nothing to do with it: the name tells you the axis.' }],
              '“At the ' + t('x') + '-intercept, ' + t('y=0') + '; at the ' + t('y') + '-intercept, ' + t('x=0') + '.”', ['Which coordinate is zero on the ' + t('x') + '-axis?'], 'memory rule intercepts');
          } }] },
      { num: '11',
        shared: function (r) {
          var A, B, C, g = 0; do { A = r.pick([2, 3, 4, 5]); B = r.pick([2, 3, 4, 5]); C = lcm(A, B) * r.pick([1, 2]); g++; } while ((A === B || C > 30 || C / A === A || C / B === B || gcd(A, B) !== 1) && g < 200);
          return { A: A, B: B, C: C, p: C / A, q: -C / B, L: line(A, -B, -C), S: thru([A, 0], [0, -B]) };
        },
        stem: function (sh) { return 'Asked to graph ' + t(gen(sh.L)) + ', a student writes: “It’s in general form, so the intercepts are the numbers in front of ' + t('x') + ' and ' + t('y') + ': the ' + t('x') + '-intercept is ' + t(sh.A) + ' and the ' + t('y') + '-intercept is ' + t(-sh.B) + ',” and draws the line through ' + ptt([sh.A, 0]) + ' and ' + ptt([0, -sh.B]) + '.'; },
        parts: [
          { id: 'e11a', sub: 'a', level: 'EMG', outcome: 'RF5', make: function (r, sh) {
            return pairsPart('Determine the two intercepts correctly and state them as ordered pairs.', [[sh.p, 0], [0, sh.q]],
              [{ pairs: [[sh.A, 0], [0, -sh.B]], code: 'l5-pair-coef', hint: 'That’s the student’s mistake: coefficients aren’t intercepts. Substitute ' + t('y=0') + ' and solve, then ' + t('x=0') + '.' }, { pairs: [[0, sh.p], [sh.q, 0]], code: 'l5-pair-axes', hint: 'Right values, wrong axes: the ' + t('x') + '-intercept is ' + t('(\\text{value},\\ 0)') + '.' }, { pairs: [[-sh.p, 0], [0, -sh.q]], code: 'sign', hint: 'Check the signs as you solve.' }],
              t('y=0') + ': ' + t(sh.A + 'x-' + sh.C + '=0') + ', ' + t('x=' + sh.p) + ' → ' + ptt([sh.p, 0]) + '.<br>' + t('x=0') + ': ' + t('-' + sh.B + 'y-' + sh.C + '=0') + ', ' + t('y=' + sh.q) + ' → ' + ptt([0, sh.q]) + '.', ['Substitute ' + t('y=0') + ', then ' + t('x=0') + '.'], 'correct intercepts');
          } },
          { id: 'e11b', sub: 'b', level: 'PRG', outcome: 'RF7', make: function (r, sh) {
            return K.P.line('Determine the equation, in general form, of the line the student actually drew.', sh.S, { form: 'general', wrong: [{ is: sh.L, code: 'l5-gr-student', hint: 'That is the correct line. This asks for the student’s line, through ' + ptt([sh.A, 0]) + ' and ' + ptt([0, -sh.B]) + '.' }] },
              'Through ' + ptt([sh.A, 0]) + ' and ' + ptt([0, -sh.B]) + ': ' + t('m=\\frac{' + (-sh.B) + '-0}{0-' + sh.A + '}=' + fT(fr(sh.B, sh.A))) + ', ' + t('b=' + (-sh.B)) + ': ' + t(si(sh.S)) + ' → ' + t(gen(sh.S)) + '. Check ' + ptt([sh.p, 0]) + ' (on the true line): it doesn’t satisfy this equation, so they are different lines.', ['Find the slope through the student’s two points.'], 'student line equation');
          } },
          { id: 'e11c', sub: 'c', level: 'ADV', make: function (r, sh) {
            var chk = [K.number(sh.p, function (v) { return v === sh.A ? { code: 'l5-pair-coef', hint: 'Divide every term of ' + t(sh.A + 'x-' + sh.B + 'y=' + sh.C) + ' by ' + t(sh.C) + ' first.' } : null; }), K.number(sh.q, function (v) { return v === -sh.q ? { code: 'sign', hint: t('-\\frac{y}{' + (-sh.q) + '}=\\frac{y}{' + sh.q + '}') + ': keep the negative with ' + t('b') + '.' } : v === -sh.B ? { code: 'l5-pair-coef', hint: 'Divide every term by ' + t(sh.C) + ' first.' } : null; })];
            return K.P.fields('There <i>is</i> a form in which the intercepts sit in the equation. Write ' + t(gen(sh.L)) + ' in the form ' + t('\\frac{x}{a}+\\frac{y}{b}=1') + ' and identify ' + t('a') + ' and ' + t('b') + '.', [{ label: t('a=') }, { label: t('b=') }], chk, [String(sh.p), String(sh.q)], t('a=' + sh.p) + ', ' + t('b=' + sh.q),
              t(sh.A + 'x-' + sh.B + 'y=' + sh.C) + '; divide every term by ' + t(sh.C) + ': ' + t('\\frac{x}{' + sh.p + '}-\\frac{y}{' + (-sh.q) + '}=1') + ', i.e. ' + t('\\frac{x}{' + sh.p + '}+\\frac{y}{' + sh.q + '}=1') + '. So ' + t('a=' + sh.p) + ', ' + t('b=' + sh.q) + ' — exactly the intercepts.', ['Move the constant to the right side, then divide every term by it.'], 'intercept form a, b');
          } },
          { id: 'e11d', sub: 'd', level: 'PRG', make: function (r, sh) {
            return mc(r, 'What would the student have had to do to ' + t(gen(sh.L)) + ' first for the shortcut to be legitimate?', [
              { html: 'Move the constant to the right side and divide the whole equation by it, so the right side is ' + t(1) + ' and each variable sits over its own intercept.', right: true },
              { html: 'Divide every term by the coefficient of ' + t('x') + '.', why: 'That makes the ' + t('x') + '-coefficient 1, but the intercepts still aren’t sitting in the equation.' },
              { html: 'Solve for ' + t('y') + ' first.', why: 'That gives the slope and the ' + t('y') + '-intercept, not both intercepts.' },
              { html: 'Nothing — the shortcut works when the equation equals 0.', why: 'Check with (a): the real intercepts are ' + t(sh.p) + ' and ' + t(sh.q) + ', not ' + t(sh.A) + ' and ' + t(-sh.B) + '.' }],
              'Write ' + t(sh.A + 'x-' + sh.B + 'y=' + sh.C) + ' and divide every term by ' + t(sh.C) + ': ' + t('\\frac{x}{' + sh.p + '}+\\frac{y}{' + sh.q + '}=1') + '. Only then can the intercepts be read; the coefficients of ' + t('Ax+By+C=0') + ' are not intercepts.', ['Look at your answer to (c).'], 'when intercepts can be read');
          } }] },
      /* ---- Part G ---- */
      { num: '12', section: 'Extra practice G — Stretch: three lines, one triangle',
        shared: function (r) {
          var k, m2, d, h, v, g = 0, ok2;
          do { k = -r.int(1, 3); m2 = -r.pick([2, 3]); d = -m2 * r.int(1, 3); v = k + d; h = r.int(-4, 4); g++; ok2 = d >= 4 && v <= 6 && h - d >= -6 && h + d / -m2 <= 6 && v - h !== 0 && Math.abs(v - h) <= 5; } while (!ok2 && g < 500);
          if (!ok2) { k = -2; m2 = -2; d = 6; v = 4; h = 2; }
          var L1 = line(1, -1, v - h), P2 = r.chance(0.5) ? [h, v] : [h + 1, v + m2], L2 = ms(m2, P2), L3 = line(0, 1, -k);
          return { k: k, m2: m2, d: d, V: [h, v], P: [h - d, k], Q: [h + d / -m2, k], c: v - h, L1: L1, L2: L2, L3: L3, P2: P2, win: [[-6, 6], [Math.min(-4, k - 2), 7]] };
        },
        stem: function (sh) { return 'The three lines below are given in three different forms.<br><b>L1:</b> ' + t(gen(sh.L1)) + ' &nbsp; <b>L2:</b> ' + t(ps(sh.L2, sh.P2)) + ' &nbsp; <b>L3:</b> ' + t('y=' + sh.k); },
        parts: [
          { id: 'e12a', sub: 'a', level: 'EMG', make: function (r, sh) {
            var rows = [{ id: 'L1', html: '<b>L1</b> ' + t(gen(sh.L1)) }, { id: 'L2', html: '<b>L2</b> ' + t(ps(sh.L2, sh.P2)) }, { id: 'L3', html: '<b>L3</b> ' + t('y=' + sh.k) }];
            var cols = [{ id: 'int', html: 'Two intercepts' }, { id: 'ps', html: 'Plot the point, step the slope' }, { id: 'hz', html: 'Horizontal line through ' + ptt([0, sh.k]) }, { id: 'tab', html: 'Table of values' }];
            return K.P.grid('State the strategy you would use for each line.', rows, cols, { L1: 'int', L2: 'ps', L3: 'hz' }, { why: function (row) { return row === 'L1' ? 'L1 is in general form with coefficients 1 and −1, which divide the constant: two quick intercepts.' : row === 'L2' ? 'L2 is in slope–point form: it hands you ' + ptt(sh.P2) + ' and the slope ' + t(sh.m2) + '.' : 'L3 has no ' + t('x') + ': it is horizontal.'; } },
              '<b>L1</b>: two intercepts, ' + ptt([-sh.c, 0]) + ' and ' + ptt([0, sh.c]) + '. <b>L2</b>: plot ' + ptt(sh.P2) + ' and step ' + t('m=' + sh.m2) + ' (down ' + (-sh.m2) + ', right 1). <b>L3</b>: horizontal through ' + ptt([0, sh.k]) + '.', ['Look at the form of each equation.'], 'strategy for 3 lines');
          } },
          { id: 'e12b', sub: 'b', level: 'PRG', make: function (r, sh) {
            var p = gpart('Graph all three lines on the grid. They bound a triangle.', [sh.L1, sh.L2, sh.L3], sh.win, { names: ['L1', 'L2', 'L3'],
              wrong: [{ v: linesV([sh.L1, ms(sh.m2, [-sh.P2[0], -sh.P2[1]]), sh.L3], sh.win), code: 'l5-gr-pt', hint: 'L1 and L3 are right. For L2, the point is ' + ptt(sh.P2) + ' — the signs in the brackets are opposite to the coordinates.' }, { v: linesV([sh.L1, sh.L2, line(1, 0, -sh.k)], sh.win), code: 'l5-gr-hv', hint: 'L1 and L2 are right. L3, ' + t('y=' + sh.k) + ', is <b>horizontal</b>.' }] },
              '<b>L1</b>: ' + t(si(sh.L1)) + ', through ' + ptt([-sh.c, 0]) + ' and ' + ptt([0, sh.c]) + '.<br><b>L2</b>: ' + t(si(sh.L2)) + ', through ' + ptt(sh.P2) + ' and ' + ptt([sh.P2[0] + 1, sh.P2[1] + sh.m2]) + '.<br><b>L3</b>: horizontal through ' + ptt([0, sh.k]) + '.<br>The triangle has vertices ' + ptt(sh.V) + ', ' + ptt(sh.P) + ', ' + ptt(sh.Q) + '.',
              ['Draw each line with the strategy its form suggests.'], 'graph three lines');
            // drawn vertex to vertex: L1 continued into L2 at the top vertex, then L3 on its own
            p.good = [{ pts: [], pieces: [{ v: [sh.P, sh.V, sh.Q], s: 'arrow', e: 'arrow' }, { v: [sh.P, sh.Q], s: 'arrow', e: 'arrow' }], join: 'none' }];
            return p;
          } },
          { id: 'e12c', sub: 'c', level: 'ADV', make: function (r, sh) {
            return pairsPart('Determine the coordinates of all three vertices of the triangle <b>algebraically</b> (by solving pairs of the equations).', [sh.V, sh.P, sh.Q], [],
              '<b>L1 and L2:</b> ' + t(si(sh.L1).replace('y=', '') + '=' + si(sh.L2).replace('y=', '')) + ', so ' + t('x=' + sh.V[0]) + ', ' + t('y=' + sh.V[1]) + ' → ' + ptt(sh.V) + '.<br><b>L1 and L3:</b> ' + t(sh.k + '=' + si(sh.L1).replace('y=', '')) + ' → ' + ptt(sh.P) + '.<br><b>L2 and L3:</b> ' + t(sh.k + '=' + si(sh.L2).replace('y=', '')) + ' → ' + ptt(sh.Q) + '.',
              ['On L3, ' + t('y=' + sh.k) + ': substitute that into each of the other lines.', 'For the top vertex, set the two slope–intercept forms equal.'], 'triangle vertices');
          } },
          { id: 'e12d', sub: 'd', level: 'PRG', make: function (r, sh) {
            var base = sh.Q[0] - sh.P[0], ht = sh.V[1] - sh.k, area = base * ht / 2;
            return K.P.number('One side of the triangle is horizontal. Use it as the base to determine the area of the triangle, in square units.', area, function (v) { return v === base * ht ? { code: 'l5-half-area', hint: 'Area of a triangle is ' + t('\\frac{1}{2}bh') + '.' } : null; },
              'Base on L3 from ' + ptt(sh.P) + ' to ' + ptt(sh.Q) + ': ' + t(sh.Q[0] + '-(' + sh.P[0] + ')=' + base) + '. Height from ' + t('y=' + sh.k) + ' up to ' + ptt(sh.V) + ': ' + t(sh.V[1] + '-(' + sh.k + ')=' + ht) + '. Area ' + t('=\\frac{1}{2}(' + base + ')(' + ht + ')=' + area) + ' square units.', ['Base along ' + t('y=' + sh.k) + '; height = vertical distance from that line to the top vertex.'], 'triangle area', { after: ' square units' });
          } },
          { id: 'e12e', sub: 'e', level: 'EMG', make: function (r, sh) {
            return mc(r, 'Two of the vertices were easy to find and one took real work. Which, and why?', [
              { html: 'Easy: ' + ptt(sh.P) + ' and ' + ptt(sh.Q) + ', the two on L3 — L3 hands you ' + t('y=' + sh.k) + ', so one substitution finishes each. Real work: ' + ptt(sh.V) + ', where two slanted lines meet.', right: true },
              { html: 'Easy: ' + ptt(sh.V) + ', because it is the highest point.', why: 'Being highest doesn’t help: both its coordinates are unknown until L1 and L2 are solved together.' },
              { html: 'All three took the same work.', why: 'On L3 the ' + t('y') + '-coordinate is known before you start.' },
              { html: 'Easy: the vertices on L1, because L1 is in general form.', why: 'General form doesn’t hand you a coordinate; L3 does.' }],
              'L3 is ' + t('y=' + sh.k) + ': it hands you the ' + t('y') + '-coordinate, so the two vertices on L3 need one substitution each. ' + ptt(sh.V) + ' joins two slanted lines, so both coordinates are unknown.', ['What does L3 tell you about any point on it?'], 'which vertices were easy');
          } }] },
      /* ---- Part H ---- */
      { num: '13', section: 'Extra practice H — Multiple choice and numerical response', parts: [
        { id: 'e13', level: 'EMG', make: function (r) {
          var a = intPair(r, [3, 4, 5, 6], [-2, -3, -4, -6]), bm = r.pick([2, 3]), bx = r.int(2, 4), f = r.pick([[-3, 5], [-2, 3], [-3, 4], [-1, 4]]), d = r.int(3, 7);
          return mc(r, '<i>(Multiple Choice)</i> Which line <b>cannot</b> be graphed by plotting its two intercepts and joining them?', [
            { html: t(si(mb(f, 0))), right: true },
            { html: t(gen(a.L)), why: 'Its intercepts are ' + ptt([a.p, 0]) + ' and ' + ptt([0, a.q]) + ': two different points.' },
            { html: t(si(mb(bm, -bm * bx))), why: 'Its intercepts are ' + ptt([bx, 0]) + ' and ' + ptt([0, -bm * bx]) + ': two different points.' },
            { html: t('x+y-' + d + '=0'), why: 'Its intercepts are ' + ptt([d, 0]) + ' and ' + ptt([0, d]) + ': two different points.' }],
            t(si(mb(f, 0))) + ': ' + t('x=0') + ' gives ' + t('y=0') + ', and ' + t('y=0') + ' gives ' + t('x=0') + ' — both intercepts are ' + ptt([0, 0]) + ', one point, which doesn’t fix a line.', ['Find both intercepts of each line.'], 'MC which cannot use intercepts');
        } }] },
      { num: '14', parts: [
        { id: 'e14', level: 'EMG', make: function (r) {
          var A, B, C, g = 0; do { A = r.pick([5, 7, 9, 3]); B = r.pick([2, 4, 5, 3]); C = lcm(A, B); g++; } while ((A === B || gcd(A, B) !== 1 || C > 45) && g < 100);
          var Lo = line(A, -B, -C), p = C / A, q = -C / B;
          return mc(r, '<i>(Multiple Choice)</i> The fastest hand-graphing strategy for ' + t(gen(Lo)) + ' is to', [
            { html: 'plot ' + ptt([p, 0]) + ' and ' + ptt([0, q]) + ' and join them', right: true },
            { html: 'solve for ' + t('y') + ' and step the slope from ' + ptt([0, q]), why: 'That works, but it is slower: it needs algebra first and the slope ' + t(fT(fr(A, B))) + ' is a fraction. Both intercepts are whole numbers.' },
            { html: 'build a table of values for ' + t('x=0,\\ 1,\\ 2,\\ 3'), why: 'A table is the fallback, and most of these ' + t('x') + '-values give fractional ' + t('y') + '-values here.' },
            { html: 'plot ' + ptt([A, 0]) + ' and ' + ptt([0, -B]) + ' and join them', why: 'Coefficients are not intercepts — substitute ' + t('y=0') + ' and ' + t('x=0') + '.' }],
            t('y=0') + ': ' + t(A + 'x-' + C + '=0') + ', ' + t('x=' + p) + '; ' + t('x=0') + ': ' + t('-' + B + 'y-' + C + '=0') + ', ' + t('y=' + q) + '. Both whole, so two substitutions finish it.', ['Do ' + t('A') + ' and ' + t('B') + ' divide ' + t('C') + '?'], 'MC fastest strategy');
        } }] },
      { num: '15', parts: [
        { id: 'e15', level: 'EMG', outcome: 'RF5', make: function (r) {
          var A, B, C, g = 0; do { A = r.pick([2, 3, 5]); B = r.pick([3, 4, 5, 7, 8]); C = lcm(A, B); g++; } while ((A === B || C > 40) && g < 100);
          var p = C / A, q = -C / B, Lo = line(A, -B, -C);
          return K.P.nr('<i>(Numerical Response)</i> The line ' + t(gen(Lo)) + ' has ' + t('x') + '-intercept of value ' + t('p') + ' and ' + t('y') + '-intercept of value ' + t('q') + '. The value of ' + t('p-q') + ' is ____.', p - q,
            function (v) { if (v === p + q) return { code: 'sign', hint: t('q') + ' is negative: ' + t('p-q=' + p + '-(' + q + ')') + '.' }; if (v === A + B) return { code: 'l5-pair-coef', hint: 'Coefficients aren’t intercepts: substitute ' + t('y=0') + ' and ' + t('x=0') + '.' }; return null; },
            t('y=0') + ': ' + t(A + 'x=' + C) + ', ' + t('p=' + p) + '. ' + t('x=0') + ': ' + t('-' + B + 'y=' + C) + ', ' + t('q=' + q) + '. ' + t('p-q=' + p + '-(' + q + ')=' + (p - q)) + '.', ['Find each intercept by substitution.'], 'NR p-q intercepts');
        } }] },
      { num: '16', parts: [
        { id: 'e16', level: 'PRG', make: function (r) {
          return mc(r, 'Which test-day flowchart sends every equation in this set — including ' + t('y=\\frac{5}{2}x') + ', ' + t('x=4') + ' and ' + t('3x-5y-4=0') + ' — to the right strategy?', [
            { html: '1. If it is ' + t('y=mx+b') + ' or ' + t('y-y_1=m(x-x_1)') + ', plot the point it hands you and step the slope. 2. If it has only one variable, rule a horizontal or vertical line through the point it names. 3. If it is ' + t('Ax+By+C=0') + ': if ' + t('A') + ' and ' + t('B') + ' divide ' + t('C') + ', join the two intercepts; if not, use a table with an ' + t('x') + '-step that keeps ' + t('y') + ' whole.', right: true },
            { html: '1. Always find the two intercepts. 2. If they are fractions, solve for ' + t('y') + '. 3. If there is no ' + t('y') + ', give up.', why: t('y=\\frac{5}{2}x') + ' has both intercepts at ' + ptt([0, 0]) + ' — one point. And ' + t('x=4') + ' is simply a vertical line.' },
            { html: '1. Always solve for ' + t('y') + ' first. 2. Plot ' + t('b') + ' and step ' + t('m') + '. 3. Use a table if ' + t('m') + ' is a fraction.', why: t('x=4') + ' can’t be solved for ' + t('y') + ', and a fractional slope is easy to step.' },
            { html: '1. If it is in general form, use the intercepts. 2. Otherwise use a table of values. 3. Vertical lines have slope 0.', why: t('3x-5y-4=0') + ' is general form with fractional intercepts, and a vertical line’s slope is undefined, not 0.' }],
            'Start from the form. Slope forms: plot the point and step (this covers ' + t('y=\\frac{5}{2}x') + ', from the origin). One variable: horizontal/vertical (' + t('x=4') + '). General form: intercepts if ' + t('A') + ' and ' + t('B') + ' divide ' + t('C') + '; otherwise a table (' + t('3x-5y-4=0') + ').', ['Test each flowchart on ' + t('y=\\frac{5}{2}x') + ', ' + t('x=4') + ' and ' + t('3x-5y-4=0') + '.'], 'MC flowchart');
        } }] }
    ]
  });
})(window);
