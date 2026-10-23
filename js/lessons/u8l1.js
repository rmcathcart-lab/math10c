/* Math 10C · Unit 8 · Lesson 1 — Solving Systems by Graphing: How Many Solutions? (RF9)
 * Assignment questions 1–10 (u8_L01.tex) and the Lesson 1 Extra Practice (u8_EP01.tex).
 * Every part is a generator: it keeps the idea and difficulty of the booklet question (the booklet's numbers are one of
 * the possible versions) and changes the numbers. Graphing a system is a graph-pad drawing (both lines), followed by a
 * separate K.P.point part for the solution (point keypad with "no solution" / "infinitely many"). Context graphs
 * (tickets, bus fares, bottles) accept any extent of each line in the first quadrant. Rewriting an equation in
 * slope–intercept form (review) is tagged RF7. Levels: LIM BEG EMG PRG ADV MAS. */
(function (root) {
  'use strict';
  var HW = root.HW, K = HW.kit, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form, Ln = HW.lines, DR = HW.draw, ex = HW.ex, F = HW.fmt, Fp = function (n) { return HW.fmt(n, true); };

  /* ---------- numbers and LaTeX ---------- */
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var c = a % b; a = b; b = c; } return a; }
  function fr(p, q) { if (q < 0) { p = -p; q = -q; } var g = gcd(p, q) || 1; return [p / g + 0, q / g]; }
  function fT(f) { return Ln.frT(f[0], f[1]); }
  function nT(x) { if (Array.isArray(x)) return fT(x); if (Number.isInteger(x)) return F(x + 0); var f = Ln.toFr(x); return f[1] <= 12 ? fT(f) : String(x); }
  function dT(x) { return Number.isInteger(x) ? F(x) : String(x); }        // decimal display (2.5)
  function fv(f) { return Array.isArray(f) ? f[0] / f[1] : f; }
  function r6(x) { return Math.round(x * 1e6) / 1e6; }
  function pt(p) { return '(' + nT(p[0]) + ',\\ ' + nT(p[1]) + ')'; }
  function ptt(p) { return t(pt(p)); }
  function par(x) { var s = nT(x); return fv(x) < 0 ? '(' + s + ')' : s; }   // value in brackets when negative
  /* terms [[coef, 'x'], …] -> LaTeX; coef a number or [p, q]; dec: show non-integer coefficients as decimals */
  function T(terms, dec) {
    var s = '';
    terms.forEach(function (tm) {
      var c0 = tm[0], v = tm[1] || '', cv = fv(c0); if (Math.abs(cv) < 1e-12) return;
      var neg = cv < 0, body;
      if (dec && !Number.isInteger(cv)) body = String(Math.abs(cv));
      else { var c = Array.isArray(c0) ? fr(c0[0], c0[1]) : Ln.toFr(cv), a = Math.abs(c[0]); body = c[1] === 1 ? ((a === 1 && v) ? '' : F(a)) : '\\frac{' + a + '}{' + c[1] + '}'; }
      s += (neg ? '-' : (s ? '+' : '')) + body + v;
    });
    return s || '0';
  }
  function eqT(lhs, rhs, dec) { return T(lhs, dec) + '=' + (typeof rhs === 'number' ? F(rhs) : T(rhs, dec)); }

  /* ---------- lines: A x + B y + C = 0 (integers) ---------- */
  function line(A, B, C) { var g = gcd(gcd(A, B), C) || 1; A /= g; B /= g; C /= g; if (A < 0 || (A === 0 && B < 0)) { A = -A; B = -B; C = -C; } return { A: A + 0, B: B + 0, C: C + 0 }; }
  function mbL(m, b) {   // y = m x + b; m, b numbers or [p, q]
    var M = Array.isArray(m) ? fr(m[0], m[1]) : [m, 1], Bf = Array.isArray(b) ? fr(b[0], b[1]) : Ln.toFr(b);
    return line(M[0] * Bf[1], -M[1] * Bf[1], M[1] * Bf[0]);
  }
  function arr(Lo) { return [Lo.A, Lo.B, Lo.C]; }
  function slopeOf(Lo) { return fr(-Lo.A, Lo.B); }
  function yInt(Lo) { return fr(-Lo.C, Lo.B); }
  function yAt(Lo, x) { return r6(-(Lo.A * x + Lo.C) / Lo.B); }
  function onL(Lo, p) { return Math.abs(Lo.A * fv(p[0]) + Lo.B * fv(p[1]) + Lo.C) < 1e-9; }
  function sameL(a, b) { return a.A === b.A && a.B === b.B && a.C === b.C; }
  function parL(a, b) { return a.A * b.B === a.B * b.A; }
  function inter(L1, L2) { var d = L1.A * L2.B - L2.A * L1.B; return [fr(L1.B * L2.C - L2.B * L1.C, d), fr(L2.A * L1.C - L1.A * L2.C, d)]; }
  function si(Lo, vars) { return Ln.tex(Lo, 'slope-intercept', null, vars); }
  function gen(Lo, vars) { return Ln.tex(Lo, 'general', null, vars); }
  function kindOf(L1, L2) { return !parL(L1, L2) ? 'one' : sameL(L1, L2) ? 'inf' : 'none'; }
  function latS(Lo, win, sx, sy) {   // snap-grid points of a line inside a window
    sx = sx || 1; sy = sy || 1; var out = [];
    for (var i = Math.ceil(win[0][0] / sx - 1e-9); i * sx <= win[0][1] + 1e-9; i++) {
      var x = r6(i * sx); if (Lo.B === 0) continue; var y = -(Lo.A * x + Lo.C) / Lo.B;
      if (Math.abs(y / sy - Math.round(y / sy)) < 1e-7 && y >= win[1][0] - 1e-9 && y <= win[1][1] + 1e-9) out.push([x, r6(y)]);
    }
    return out;
  }
  function arrowV(p, q) { return { pts: [], pieces: [{ v: [p, q], s: 'arrow', e: 'arrow' }], join: 'none' }; }
  function lineV(Lo, win) { var L2 = latS(Lo, win); if (L2.length < 2) L2 = latS(Lo, [[-60, 60], [-1e5, 1e5]]); return arrowV(L2[0], L2[L2.length - 1]); }
  function clipV(Lo, win) {   // the part of the line inside the window, as a segment without end marks
    var xr = win[0], yr = win[1], P = [];
    [xr[0], xr[1]].forEach(function (x) { var y = -(Lo.A * x + Lo.C) / Lo.B; if (y >= yr[0] - 1e-9 && y <= yr[1] + 1e-9) P.push([x, r6(y)]); });
    if (Lo.A !== 0) [yr[0], yr[1]].forEach(function (y) { var x = -(Lo.B * y + Lo.C) / Lo.A; if (x >= xr[0] - 1e-9 && x <= xr[1] + 1e-9) P.push([r6(x), y]); });
    P.sort(function (a, b) { return a[0] - b[0]; });
    return { v: [P[0], P[P.length - 1]], s: 'none', e: 'none' };
  }
  function uniqL(Ls) { var out = []; Ls.forEach(function (L) { if (!out.some(function (M) { return sameL(M, L); })) out.push(L); }); return out; }

  /* ---------- graph pad ---------- */
  var W7 = [[-7, 7], [-7, 7]], W6 = [[-6, 6], [-6, 6]], W68 = [[-6, 6], [-8, 8]];
  function pad(win, o) { return Object.assign({ x: win[0], y: win[1], grid: 1, labels: 2, mode: 'lines', defaultEnd: 'arrow', max: 360 }, o || {}); }
  /* The pad continues an existing line only when the student keeps tapping, so a bent arrow polyline is read as
   * separate straight lines (same helper as Unit 7). */
  function splitBends(value) {
    var v = DR.norm(value), out = [];
    v.pieces.forEach(function (pc) {
      if (pc.v.length < 3) { out.push(pc); return; }
      var runs = [[pc.v[0], pc.v[1]]];
      for (var i = 2; i < pc.v.length; i++) {
        var run = runs[runs.length - 1], a = run[run.length - 2], b = run[run.length - 1], c = pc.v[i];
        if (Math.abs((b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0])) < 1e-9) run.push(c); else runs.push([b, c]);
      }
      runs.forEach(function (rv, k) { out.push({ v: rv, s: k === 0 ? pc.s : (pc.s === 'arrow' && pc.e === 'arrow' ? 'arrow' : 'closed'), e: k === runs.length - 1 ? pc.e : (pc.s === 'arrow' && pc.e === 'arrow' ? 'arrow' : 'closed') }); });
    });
    return { pts: v.pts, pieces: out, join: v.join };
  }
  function propL(S, L) {   // the same line (coefficients proportional, with a tolerance for clipped end points)
    var a = [S.A, S.B, S.C], b = [L.A, L.B, L.C], sa = Math.max.apply(null, a.map(Math.abs)), sb = Math.max.apply(null, b.map(Math.abs));
    for (var i = 0; i < 3; i++) for (var j = i + 1; j < 3; j++) if (Math.abs(a[i] * b[j] - a[j] * b[i]) > 1e-6 * sa * sb) return false;
    return true;
  }
  function geoL(g, k) { var L = g.lines[k]; return { A: L.A, B: L.B, C: -L.C }; }   // draw.js stores A x + B y = C
  /* Graph one or more lines of a system on one grid.
   * Ls: the lines; names: LaTeX of each equation (as printed); o.context: any extent of each line counts (first-quadrant
   * contexts); o.wrong: [{ L, code, hint }] classic wrong lines; o.pad: graph-pad options. */
  function sysGraph(prompt, Ls, names, win, o, sol, hints, text) {
    o = o || {};
    var U = uniqL(Ls), uNames = U.map(function (L) { var i = Ls.length - 1; while (!sameL(Ls[i], L)) i--; return t(names[i]); });
    var key = { pts: [], pieces: [], join: 'none' };
    U.forEach(function (L) { key.pieces.push(o.context ? clipV(L, win) : lineV(L, win).pieces[0]); });
    var exact = o.context ? null : K.graphExact(key);
    var W0 = (o.wrong || []).filter(function (w) { return w.L && !U.some(function (L) { return sameL(L, w.L); }); });
    function diagnose(S, Tl, name) {
      var sm = S.B === 0 ? null : -S.A / S.B, tm = -Tl.A / Tl.B, sb = S.B === 0 ? null : -S.C / S.B, tb = -Tl.C / Tl.B, nr = function (a, b) { return a != null && Math.abs(a - b) < 1e-9; };
      if (S.B === 0) return wrong('u8-gr-line', 'One of your lines is vertical. Check your line for ' + name + ': substitute two of its points into the equation.');
      if (nr(sm, tm)) return wrong('u8-gr-shift', 'Your line for ' + name + ' has the right slope but is in the wrong place. Check a point on it: ' + (o.context ? 'substitute one value and solve for the other.' : 'it crosses the ' + t('y') + '-axis at ' + ptt([0, Ln.toFr(tb)]) + '.'));
      if (nr(sb, tb)) {
        if (nr(sm, -tm)) return wrong('u8-gr-sign', 'Your line for ' + name + ' starts in the right place, but it goes the wrong way: its slope is ' + t(nT(tm)) + ', so it ' + (tm < 0 ? 'falls' : 'rises') + ' from left to right.');
        if (tm !== 0 && nr(sm, 1 / tm)) return wrong('u8-gr-flip', 'Your line for ' + name + ' starts in the right place. Slope is <b>rise over run</b>: ' + t('m=' + nT(tm)) + ' — you stepped run over rise.');
        return wrong('u8-gr-slope', 'Your line for ' + name + ' crosses the ' + t('y') + '-axis in the right place — now check its slope: ' + t('m=' + nT(tm)) + '.');
      }
      if (nr(sm, -tm) && nr(sb, -tb)) return wrong('u8-gr-sign', 'Your line for ' + name + ' has the signs of the slope and the intercept both switched. Rearrange carefully: when you divide by a negative, every sign changes.');
      return wrong('u8-gr-line', 'Check your line for ' + name + ': substitute two of the points you used into ' + name + ' — both must make it true.');
    }
    var check = function (resp) {
      var v = splitBends(resp);
      if (DR.empty(v)) return form('empty', 'Draw your answer on the grid first.');
      if (exact) { var r0 = exact(v); if (r0.v === 'wrong' && (r0.code === 'graph-length' || r0.code === 'graph-ends')) return wrong('graph-arrows', 'Right lines — but a line keeps going forever: put <b>arrows</b> on both ends of each line (use the <b>Ends</b> tool).'); if (r0.v !== 'wrong' || r0.code !== 'graph') return r0; }
      var g = DR.geom(v), have = Object.keys(g.lines).map(function (k) { return geoL(g, k); });
      if (!have.length) {
        var off = v.pts.filter(function (p) { return !U.some(function (L) { return onL(L, p); }); })[0];
        if (off) return wrong('u8-point-off', ptt(off) + ' is not on ' + (U.length > 1 ? 'either line' : 'the line') + '. Substitute it into the equations to check.');
        return wrong('u8-points-only', 'Your points are on the lines — now draw the ' + (U.length > 1 ? 'lines' : 'line') + ' through them with the <b>╱ Line</b> tool.');
      }
      var hit = have.map(function (S) { for (var i = 0; i < U.length; i++) if (propL(S, U[i])) return i; return -1; });
      var extra = have.filter(function (S, j) { return hit[j] < 0; }), miss = [];
      U.forEach(function (L, i) { if (hit.indexOf(i) < 0) miss.push(i); });
      if (o.context && !extra.length && !miss.length) return ok();
      for (var j = 0; j < extra.length; j++) for (var w = 0; w < W0.length; w++) if (propL(extra[j], W0[w].L)) return wrong(W0[w].code, W0[w].hint);
      if (!extra.length && miss.length) return wrong('u8-line-missing', 'Correct so far — still to draw: ' + miss.map(function (i) { return uNames[i]; }).join(' and ') + '.');
      if (extra.length === 1 && miss.length === 1) return diagnose(extra[0], U[miss[0]], uNames[miss[0]]);
      if (extra.length && !miss.length) return wrong('u8-line-extra', 'All the lines are there, but you have drawn ' + (extra.length === 1 ? 'an extra line' : 'extra lines') + ' as well. Undo or clear the extra ' + (extra.length === 1 ? 'one' : 'ones') + '.');
      return wrong('u8-graph', null);
    };
    var p = K.P.graph(prompt, pad(win, o.pad), check, key, sol, hints, text);
    var bad = W0.map(function (w) { var kv = { pts: [], pieces: key.pieces.slice(), join: 'none' }; kv.pieces[0] = o.context ? clipV(w.L, win) : lineV(w.L, win).pieces[0]; return kv; });
    if (U.length > 1) bad.push({ pts: [], pieces: [key.pieces[0]], join: 'none' });
    p.bad = bad.filter(function (b) { return !DR.same(b, key); });
    return p;
  }

  /* ---------- other part makers ---------- */
  function mc(r, prompt, opts, sol, hints, text, keep) {
    var seen = {}, o2 = opts.filter(function (o) { if (seen[o.html]) return false; seen[o.html] = 1; return true; });
    return K.P.mc(r, prompt, o2, sol, hints, text, keep);
  }
  function pS(x) { if (Array.isArray(x)) { var f = fr(x[0], x[1]); return f[1] === 1 ? String(f[0]) : f[0] + '/' + f[1]; } if (Number.isInteger(x)) return String(x); var g = Ln.toFr(x); return g[1] === 1 ? String(g[0]) : g[0] + '/' + g[1]; }
  function samePt(a, b) { return Math.abs(fv(a[0]) - fv(b[0])) < 1e-9 && Math.abs(fv(a[1]) - fv(b[1])) < 1e-9; }
  /* the solution of a system (or no solution / infinitely many); opt.wrong: [{ is, code, hint }], opt.vars */
  function pointPart(prompt, P, Ls, opt, sol, hints, text) {
    opt = opt || {}; var isPt = Array.isArray(P);
    var W = (opt.wrong || []).filter(function (w) { return !(isPt && Array.isArray(w.is) && samePt(w.is, P)) && w.is !== P; });
    var p = K.P.point(prompt, P, { system: Ls.map(arr), vars: opt.vars, wrong: W }, sol, hints, text);
    var bad = (opt.bad || []).slice();
    if (isPt && !samePt(P, [P[1], P[0]])) bad.push('(' + pS(P[1]) + ', ' + pS(P[0]) + ')');
    if (!isPt) bad.push(P === 'none' ? 'infinitely many' : 'no solution', '(0, 0)');
    else bad.push('no solution');
    W.forEach(function (w) { bad.push(Array.isArray(w.is) ? '(' + pS(w.is[0]) + ', ' + pS(w.is[1]) + ')' : w.is === 'none' ? 'no solution' : 'infinitely many'); });
    p.bad = bad;
    return p;
  }
  /* an equation in a fixed box (labels) — each box graded like K.line in the question's letters */
  function twoEq(prompt, Ts, labels, vars, diag, sol, hints, text, keyTex) {
    var cs = Ts.map(function (Tg) { return K.line(Tg, { vars: vars }); });
    var check = function (resp) {
      resp = resp || []; var a = String(resp[0] || '').trim(), b = String(resp[1] || '').trim();
      if (!a && !b) return form('empty', 'Write both equations.');
      if (!a || !b) return form('sys-one', 'Write an equation in <b>each</b> box.');
      var r1 = cs[0](a), r2 = cs[1](b);
      if (r1.v === 'correct' && r2.v === 'correct') return ok();
      var nm = labels.map(function (l) { return l.replace(/:\s*$/, ''); });
      if (cs[1](a).v === 'correct' && cs[0](b).v === 'correct') return wrong('u8-eq-swap', 'Both equations are right, but in the wrong boxes: the first box is for ' + nm[0] + '.');
      if (diag) { var h = diag(a, b); if (h) return wrong(h.code, h.hint); }
      var bad = r1.v !== 'correct' ? [0, r1] : [1, r2];
      if (bad[1].v === 'form') return { v: 'form', code: bad[1].code, hint: '<b>' + nm[bad[0]] + ':</b> ' + bad[1].hint };
      return wrong(bad[1].code || 'sys-eq', (bad[0] === 1 && r1.v === 'correct' ? 'Your first equation is right. ' : '') + '<b>' + nm[bad[0]] + ':</b> ' + (bad[1].hint || 'check this equation against the information in the question.'));
    };
    var keys = keyTex || Ts.map(function (Tg) { return si(Tg, vars); });
    return { prompt: prompt, input: { type: 'fields', fields: labels.map(function (l) { return { label: l, mode: 'math', keys: 'eq', vars: vars, placeholder: ' ' }; }) },
      check: check, key: keys, answer: labels.map(function (l, i) { return l + ' ' + t(keys[i]); }).join('<br>'), solution: sol, hints: hints || [], text: text,
      bad: [[keys[1], keys[0]]] };
  }
  /* classify a system with a reason: kind 'none' | 'one' | 'inf'; d = { m1, m2, b1, b2 } as LaTeX; trap: extra distractor text */
  function classMC(r, prompt, kind, d, sol, hints, text, trap) {
    var O = [];
    if (kind === 'none') O = [
      { html: '<b>No solution</b> — the slopes are equal (' + t(d.m1) + ') but the ' + t('y') + '-intercepts differ (' + t(d.b1) + ' and ' + t(d.b2) + '): parallel lines.', right: true },
      { html: '<b>Infinitely many solutions</b> — the slopes are equal (' + t(d.m1) + ').', why: 'Equal slopes alone don’t make the same line — compare the ' + t('y') + '-intercepts too: ' + t(d.b1) + ' and ' + t(d.b2) + ' differ, so the lines are parallel and never meet.', code: 'cls-inf' },
      { html: '<b>One solution</b> — the ' + t('y') + '-intercepts are different.', why: 'Different intercepts don’t make lines cross. With the <b>same slope</b> ' + t(d.m1) + ', the lines are parallel.', code: 'cls-one' },
      { html: trap || '<b>Infinitely many solutions</b> — one equation is a multiple of the other.', why: 'Check every term, the constant too: the constants are not in the same ratio, so the equations are not multiples — the intercepts ' + t(d.b1) + ' and ' + t(d.b2) + ' differ.', code: 'cls-mult' }];
    else if (kind === 'inf') O = [
      { html: '<b>Infinitely many solutions</b> — the same slope (' + t(d.m1) + ') and the same ' + t('y') + '-intercept (' + t(d.b1) + '): the same line.', right: true },
      { html: '<b>No solution</b> — the slopes are equal (' + t(d.m1) + ').', why: 'Equal slopes means parallel <b>or</b> the same line. Compare the ' + t('y') + '-intercepts: both are ' + t(d.b1) + ', so it is the same line.', code: 'cls-none' },
      { html: '<b>One solution</b> — the two equations look different.', why: 'Rearrange both into ' + t('y=mx+b') + ': they give exactly the same equation, so every point on the line is a solution.', code: 'cls-one' },
      { html: trap || '<b>No solution</b> — the constant terms are different numbers.', why: 'The constants differ only because one equation is a multiple of the other. Compare slopes and ' + t('y') + '-intercepts: both match.', code: 'cls-const' }];
    else O = [
      { html: '<b>One solution</b> — the slopes are different (' + t(d.m1) + ' and ' + t(d.m2) + '): the lines cross once.', right: true },
      { html: '<b>No solution</b> — the lines are parallel.', why: 'Parallel lines have equal slopes. Here the slopes are ' + t(d.m1) + ' and ' + t(d.m2) + ' — different — so the lines cross exactly once.', code: 'cls-none' },
      { html: trap || '<b>Infinitely many solutions</b> — the equations use the same numbers.', why: 'Using the same numbers in different places isn’t the same as being a multiple. The slopes are ' + t(d.m1) + ' and ' + t(d.m2) + ': different, so one solution.', code: 'cls-inf' },
      { html: '<b>No solution</b> — the ' + t('y') + '-intercepts are different.', why: 'When the slopes are different the lines cross no matter what the intercepts are: one solution.', code: 'cls-int' }];
    return mc(r, prompt, O, sol, hints, text);
  }
  function mbTex(Lo) { return { m: fT(slopeOf(Lo)), b: fT(yInt(Lo)) }; }
  function clsSol(L1, L2, n1, n2) {
    var a = mbTex(L1), b = mbTex(L2), k = kindOf(L1, L2);
    return t(n1) + ' → ' + t(si(L1)) + ': ' + t('m=' + a.m) + ', ' + t('b=' + a.b) + '.<br>' + t(n2) + ' → ' + t(si(L2)) + ': ' + t('m=' + b.m) + ', ' + t('b=' + b.b) + '.<br>' +
      (k === 'one' ? 'Different slopes: the lines cross once — <b>one solution</b>.' : k === 'none' ? 'Same slope, different ' + t('y') + '-intercepts: parallel lines — <b>no solution</b>.' : 'Same slope and same ' + t('y') + '-intercept: the same line — <b>infinitely many solutions</b>.');
  }
  function clsD(L1, L2) { var a = mbTex(L1), b = mbTex(L2); return { m1: a.m, m2: b.m, b1: a.b, b2: b.b }; }
  /* substitution text: terms [[c, v]], vals { x: 4, y: -1 } -> "4+3(-1)" */
  function subT(terms, vals) {
    var s = '';
    terms.forEach(function (tm) {
      var c = fv(tm[0]), v = tm[1]; if (!c) return;
      var neg = c < 0, a = Math.abs(c), body;
      if (!v) body = nT(a);
      else { var val = vals[v]; body = a === 1 ? (fv(val) < 0 ? '(' + nT(val) + ')' : nT(val)) : nT(a) + '(' + nT(val) + ')'; }
      s += (neg ? '-' : (s ? '+' : '')) + body;
    });
    return s;
  }
  function evalT(terms, vals) { return terms.reduce(function (acc, tm) { return acc + tm[0] * (tm[1] ? vals[tm[1]] : 1); }, 0); }
  /* MC: which work is a complete, correct verification of the point P in both equations eqs = [{ l: terms, r: number, tex }] */
  function verifyMC(r, prompt, eqs, P, vars, text) {
    var V = {}; V[vars[0]] = P[0]; V[vars[1]] = P[1];
    var Sw = {}; Sw[vars[0]] = P[1]; Sw[vars[1]] = P[0];
    var line1 = function (e, vals) { var v = evalT(e.l, vals); return t(subT(e.l, vals) + '=' + nT(v)) + (v === e.r ? ' ✓' : ' ' + t('\\ne ' + nT(e.r)) + ' ✗'); };
    var good = eqs.map(function (e) { return line1(e, V); }).join('<br>');
    var only = line1(eqs[0], V) + '<br>It works, so ' + ptt(P) + ' is the solution.';
    var swp = eqs.map(function (e) { return line1(e, Sw); }).join('<br>') + '<br>It fails, so ' + ptt(P) + ' is not the solution.';
    // sign slip on a negative value in the second equation: treat −(−k) as −k
    var e2 = eqs[1], negVar = vars.filter(function (v) { return V[v] < 0; })[0], slip = null;
    if (negVar) {
      var co = e2.l.filter(function (tm) { return tm[1] === negVar; })[0];
      if (co && co[0] < 0) { var Va = {}; Va[vars[0]] = V[vars[0]]; Va[vars[1]] = V[vars[1]]; Va[negVar] = -V[negVar]; var wv = evalT(e2.l, Va); slip = line1(eqs[0], V) + '<br>' + t(subT(e2.l, Va) + '=' + nT(wv)) + ' ' + t('\\ne ' + nT(e2.r)) + ' ✗<br>It fails the second equation, so ' + ptt(P) + ' is not the solution.'; }
    }
    var O = [{ html: good + '<br>Both are true, so ' + ptt(P) + ' is the solution.', right: true },
      { html: only, why: 'One equation isn’t enough: every point on that line works in it. A solution of the system must make <b>both</b> equations true.', code: 'ver-one' },
      P[0] === P[1] ?   // swapping equal coordinates changes nothing: use a "no substitution" distractor instead
        { html: 'The lines cross at ' + ptt(P) + ' on the graph, so it is the solution — there is nothing to substitute.', why: 'Reading the graph finds the point; verifying it <b>algebraically</b> means substituting it into both equations.', code: 'ver-none' } :
        { html: swp, why: 'The coordinates were substituted the wrong way round: in ' + ptt(P) + ', ' + t(vars[0] + '=' + nT(P[0])) + ' and ' + t(vars[1] + '=' + nT(P[1])) + '.', code: 'ver-swap' }];
    if (slip) O.push({ html: slip, why: 'Careful with the double negative: subtracting a negative value adds it. Redo the second check.', code: 'ver-sign' });
    else O.push({ html: line1(eqs[1], V) + '<br>It works, so ' + ptt(P) + ' is the solution.', why: 'One equation isn’t enough — substitute into <b>both</b> equations.', code: 'ver-one2' });
    return mc(r, prompt, O, 'Substitute ' + t(vars[0] + '=' + nT(P[0])) + ' and ' + t(vars[1] + '=' + nT(P[1])) + ' into <b>both</b> equations:<br>' + good + '<br>Both equations are true, so ' + ptt(P) + ' is the solution of the system.',
      ['A solution of a system has to make every equation true.', 'Watch the signs when you substitute a negative number.'], text);
  }
  function numFields(prompt, labels, vals, diags, sol, hints, text, before) {
    var fields = labels.map(function (l) { return { label: l, before: before }; });
    var checkers = vals.map(function (v, i) { return K.number(v, diags ? diags[i] : null); });
    var p = K.P.fields(prompt, fields, checkers, vals.map(String), labels.map(function (l, i) { return l + ' ' + (before ? before : '') + t(nT(vals[i])); }).join('<br>'), sol, hints, text);
    return p;
  }
  function valFields(prompt, labels, vals, sol, hints, text) {   // exact values (fractions allowed), typed in plain boxes
    var fields = labels.map(function (l) { return { label: l, mode: 'math', keys: 'fraction', placeholder: ' ' }; });
    var checkers = vals.map(function (v) { var T0 = fv(v), base = K.value(T0); return function (resp) { var r0 = base(resp); if (r0.v === 'wrong') { var a = K.read(resp); if (a.val != null && isFinite(a.val) && Math.abs(a.val - T0) < 0.01 && Math.abs(a.val - T0) > 1e-9) return form('decimal-rounded', 'Close — give the exact value (a fraction), not a rounded decimal.'); } return r0; }; });
    return K.P.fields(prompt, fields, checkers, vals.map(function (v) { return nT(v); }), labels.map(function (l, i) { return l + ' ' + t(nT(vals[i])); }).join('<br>'), sol, hints, text);
  }

  function rawG(R) { return T([[R[0], 'x'], [R[1], 'y'], [R[2], '']]) + '=0'; }
  function abSol(R1, R2, n1, n2) {
    var f = function (R, n) { return t(n) + ': ' + t('m=-\\frac{' + R[0] + '}{' + R[1] + '}=' + fT(fr(-R[0], R[1]))) + ', ' + t('b=-\\frac{' + R[2] + '}{' + R[1] + '}=' + fT(fr(-R[2], R[1]))) + '.'; };
    var k = kindOf(line(R1[0], R1[1], R1[2]), line(R2[0], R2[1], R2[2]));
    return f(R1, n1) + '<br>' + f(R2, n2) + '<br>' + (k === 'one' ? 'The slopes differ, so the lines cross exactly once: <b>one solution</b>.' : k === 'none' ? 'Same slope, different ' + t('y') + '-intercepts: parallel and distinct — <b>no solution</b>.' : 'Same slope and same ' + t('y') + '-intercept (one equation is a multiple of the other): the same line — <b>infinitely many solutions</b>.');
  }
  function ep3(r, k, R1, R2, trap) {
    var L1 = line(R1[0], R1[1], R1[2]), L2 = line(R2[0], R2[1], R2[2]), n1 = rawG(R1), n2 = rawG(R2), kind = kindOf(L1, L2);
    return classMC(r, '(' + k + ') ' + t(n1) + ', \\(\\;\\) ' + t(n2), kind, clsD(L1, L2), abSol(R1, R2, n1, n2), ['Find ' + t('-\\frac{A}{B}') + ' and ' + t('-\\frac{C}{B}') + ' for each line, then compare — slopes first.'], 'classify general form (' + kind + ')', trap);
  }
  var MS = { a: [[[-3, 2], [3, 2], [-1, 2], [1, 2]], [[3, 4], [-3, 4], [1, 4], [-1, 4]]], b: [[[1, 3], [-1, 3], [2, 3]], [[-2, 3], [2, 3], [-1, 3], [1, 3]]], c: [[-1, 1, -2, 2], [[5, 2], [3, 2], [-3, 2], [-5, 2]]] };
  function mixSys(r, k) {   // y = m1 x + b1 and a general-form line with a fraction slope, integer solution on the 14 x 14 grid
    var s = pick2(r, function (r) { var m1 = r.pick(MS[k][0]), m2 = r.pick(MS[k][1]), d1 = den(m1), d2 = den(m2), q = d1 * d2 / gcd(d1, d2); return { m1: m1, m2: m2, x0: q * r.pick([-3, -2, -1, 1, 2, 3]), y0: r.int(-6, 6) }; },
      function (s) { if (Math.abs(fv(s.m1) - fv(s.m2)) < 1e-9 || Math.abs(s.x0) > 6) return false; var b1 = r6(s.y0 - fv(s.m1) * s.x0), b2 = r6(s.y0 - fv(s.m2) * s.x0); return b1 !== 0 && b2 !== 0 && Math.abs(b1) <= 7 && Math.abs(b2) <= 10 && latS(mbL(s.m1, b1), W7).length >= 2 && latS(mbL(s.m2, b2), W7).length >= 2; });
    s.b1 = r6(s.y0 - fv(s.m1) * s.x0); s.b2 = r6(s.y0 - fv(s.m2) * s.x0); s.L1 = mbL(s.m1, s.b1); s.L2 = mbL(s.m2, s.b2);
    s.n1 = 'y=' + T([[s.m1, 'x'], [s.b1, '']]); s.n2 = gen(s.L2);
    return s;
  }
  function profitPart(sh, n) {
    var cost = sh.c * n + sh.F, rev = sh.p * n, pr = rev - cost;
    return K.P.number('Determine the profit or loss, in dollars, made on ' + n + ' bottles. (Enter a loss as a negative number.)', pr, function (v) {
      if (v === -pr) return { code: 'u8-profit-sign', hint: 'Profit = revenue − cost. Here the ' + (pr < 0 ? 'cost is bigger, so it is a <b>loss</b>: negative.' : 'revenue is bigger, so it is a <b>profit</b>: positive.') };
      if (v === rev) return { code: 'u8-rev-only', hint: 'That is the revenue. Subtract the cost of making ' + n + ' bottles.' };
      if (v === cost || v === -cost) return { code: 'u8-cost-only', hint: 'That is the cost. Profit = revenue − cost.' };
      if (v === rev - sh.c * n) return { code: 'u8-no-fee', hint: 'Include the $' + sh.F + ' set-up charge in the cost.' };
      return null; },
      'Cost: ' + t(sh.c + '(' + n + ')+' + sh.F + '=' + F(cost)) + '. Revenue: ' + t(sh.p + '(' + n + ')=' + F(rev)) + '.<br>' + t(F(rev) + '-' + F(cost) + '=' + F(pr)) + ': ' + (pr < 0 ? 'a <b>loss</b> of $' + Fp(-pr) : 'a <b>profit</b> of $' + Fp(pr)) + '.',
      ['Profit = revenue − cost. A negative profit is a loss.'], 'profit at ' + n);
  }

  HW.addCodes({
    'u8-gr-shift': 'Graph: right slope, wrong place', 'u8-gr-sign': 'Graph: slope sign wrong', 'u8-gr-flip': 'Graph: run over rise', 'u8-gr-slope': 'Graph: right intercept, wrong slope', 'u8-gr-line': 'Graph: a line wrong',
    'u8-point-off': 'Plotted a point not on the line', 'u8-points-only': 'Plotted points but no lines', 'u8-line-missing': 'A line of the system missing', 'u8-line-extra': 'Extra line drawn', 'u8-graph': 'Graph of the system wrong',
    'u8-eq-swap': 'Equations in the wrong boxes', 'u8-collect': 'Sign slip collecting x-terms', 'u8-const': 'Sign slip moving the constants', 'u8-clear-frac': 'Cleared fractions in only some terms',
    'u8-tab-sign': 'Table: sign slip solving for y', 'u8-tab-div': 'Table: forgot to divide by the y-coefficient', 'u8-price-swap': 'Prices matched to the wrong tickets', 'u8-total-n': 'Used the number of tickets as the money total', 'u8-count-swap': 'Ticket counts swapped',
    'u8-fee-rate': 'Fixed fee and rate swapped', 'u8-no-fee': 'Fixed fee left out', 'u8-rev-cost': 'Cost and revenue mixed up', 'u8-profit-sign': 'Profit/loss sign reversed', 'u8-rev-only': 'Profit: used revenue only', 'u8-cost-only': 'Profit: used cost only',
    'u8-sys-same': 'Wrote the same line (infinitely many)', 'u8-sys-par': 'Wrote a parallel line (no solution)', 'u8-sys-cross': 'Wrote a crossing line (one solution)', 'u8-sys-sign': 'Slope sign from the given equation', 'u8-sys-notpt': 'Line misses the required point', 'u8-sys-parallel-given': 'Line parallel to a given line',
    'u8-k-ycoef': 'Matched only the y-coefficients', 'u8-k-xcoef': 'Used the x-coefficient for k', 'u8-k-flip': 'Ratio of coefficients upside down', 'u8-k-sign': 'Sign of k', 'u8-k-div': 'Divided by the multiplier instead of multiplying',
    'u8-c-mult': 'Multiplied the constant instead of dividing', 'u8-c-sign': 'Sign of the constant', 'u8-mult-flip': 'Multiplier upside down', 'u8-same-const': 'Kept the constant (same line)', 'u8-est-far': 'Estimate too far from the crossing', 'u8-est-half': 'Estimate not to the nearest half unit',
    'u8-pq-one': 'Gave one coordinate, not p + q', 'u8-pq-diff': 'Subtracted the coordinates', 'u8-neg': 'Sign slip dividing by −1 (or a negative)', 'u8-nodiv': 'Didn’t divide every term', 'u8-mult': 'Wrong multiplier', 'u8-const-miss': 'Missed some valid constants'
  });

  /* ---------- generators ---------- */
  function pick2(r, list, test, tries) { for (var g = 0; g < (tries || 400); g++) { var v = list(r); if (test(v)) return v; } return null; }

  /* Q1: x + B y = C, A x − y = D with an integer solution; table points inside the 14 × 14 grid */
  function q1shared(r) {
    var s = pick2(r, function (r) { var B = r.pick([3, 3, 2]), A = r.pick([2, 2, 3]), x0 = r.int(1, 6), y0 = r.pick([-3, -2, -1, 1, 2, 3]); return { A: A, B: B, x0: x0, y0: y0 }; },
      function (s) { var C = s.x0 + s.B * s.y0, D = s.A * s.x0 - s.y0; return C !== 0 && D !== 0 && s.x0 - 3 * s.B >= -7 && s.x0 + s.B <= 7 && s.y0 + 3 <= 7 && s.y0 - 1 >= -7 && Math.abs(s.y0) + 2 * s.A <= 7 && s.x0 + 2 <= 7; });
    s.C = s.x0 + s.B * s.y0; s.D = s.A * s.x0 - s.y0;
    s.L1 = line(1, s.B, -s.C); s.L2 = line(s.A, -1, -s.D);
    s.n1 = eqT([[1, 'x'], [s.B, 'y']], s.C); s.n2 = eqT([[s.A, 'x'], [-1, 'y']], s.D);
    s.xs1 = [-3, -2, -1, 0, 1].map(function (k) { return s.x0 + s.B * k; }); s.ys1 = [-3, -2, -1, 0, 1].map(function (k) { return s.y0 - k; });
    s.xs2 = [-2, -1, 0, 1, 2].map(function (j) { return s.x0 + j; }); s.ys2 = [-2, -1, 0, 1, 2].map(function (j) { return s.y0 + s.A * j; });
    return s;
  }
  /* y = m1 x + b1 and y = m2 x + b2 for "set the expressions equal": extra wrong points for the classic slips */
  function eqWrongs(m1, b1, m2, b2, P) {
    var W = [], M1 = fv(m1), M2 = fv(m2), add = function (x, code, hint) { if (!isFinite(x)) return; var p = [Ln.toFr(r6(x)), Ln.toFr(r6(M1 * x + b1))]; if (Math.abs(fv(p[0]) - fv(P[0])) < 1e-9) return; W.push({ is: p, code: code, hint: hint }); };
    if (Math.abs(M1 + M2) > 1e-9) add((b2 - b1) / (M1 + M2), 'u8-collect', 'Check the step where you collect the ' + t('x') + '-terms on one side: moving ' + t(T([[m2, 'x']])) + ' across the equals sign changes its sign.');
    if (Math.abs(M1 - M2) > 1e-9) add((b2 + b1) / (M1 - M2), 'u8-const', 'Check the step where you move the constants: moving ' + t(nT(b1)) + ' across the equals sign changes its sign.');
    var q = Array.isArray(m2) ? fr(m2[0], m2[1])[1] : 1, q1 = Array.isArray(m1) ? fr(m1[0], m1[1])[1] : 1, Q = Math.max(q, q1);
    if (Q > 1 && Math.abs(Q * M1 - Q * M2) > 1e-9) add((b2 - b1) / (Q * M1 - Q * M2), 'u8-clear-frac', 'When you multiply to clear the fraction, multiply <b>every</b> term on both sides by ' + t(Q) + ' — the constants too.');
    return W;
  }
  function den(m) { return Array.isArray(m) ? fr(m[0], m[1])[1] : 1; }
  function eqSol(m1, b1, m2, b2, P) {
    var lhs = T([[m1, 'x'], [b1, '']]), rhs = T([[m2, 'x'], [b2, '']]), d1 = den(m1), d2 = den(m2), q = d1 * d2 / gcd(d1, d2);
    var s = 'Both expressions equal ' + t('y') + ', so set them equal: ' + t(lhs + '=' + rhs) + '.<br>';
    if (q > 1) { var a1 = r6(fv(m1) * q), a2 = r6(fv(m2) * q); s += 'Multiply every term by ' + t(q) + ': ' + t(T([[a1, 'x'], [b1 * q, '']]) + '=' + T([[a2, 'x'], [b2 * q, '']])) + '.<br>Collect: ' + t(T([[r6(a1 - a2), 'x']]) + '=' + nT(q * (b2 - b1))) + (Math.abs(a1 - a2 - 1) < 1e-9 ? '' : ', so ' + t('x=' + nT(P[0]))) + '.<br>'; }
    else s += 'Collect: ' + t(T([[fv(m1) - fv(m2), 'x']]) + '=' + nT(b2 - b1)) + (Math.abs(fv(m1) - fv(m2) - 1) < 1e-9 ? '' : ', so ' + t('x=' + nT(P[0]))) + '.<br>';
    s += 'Substitute into the first equation: ' + t('y=' + subT([[m1, 'x'], [b1, '']], { x: P[0] }) + '=' + nT(P[1])) + '.<br>';
    s += 'Check in the second: ' + t(subT([[m2, 'x'], [b2, '']], { x: P[0] }) + '=' + nT(P[1])) + ' ✓. The solution is ' + ptt(P) + '.';
    return s;
  }

  HW.defineLesson({
    id: 'u8l1', unit: 8, num: '1', title: 'Solving Systems by Graphing: How Many Solutions?', outcome: 'RF9',
    blurb: 'Read the solution of a system off a graph, graph both lines by hand (tables, slope and y-intercept, or intercepts), set two y = … expressions equal, model with a system (tickets, costs, break-even), and tell from the slopes and y-intercepts whether a system has one solution, none, or infinitely many.',
    questions: [
      /* ---------- Q1: one system, four ways ---------- */
      { num: '1', section: 'Assignment — Solving systems by graphing', shared: q1shared,
        stem: function (sh) { return 'Consider the system of equations ' + t(sh.n1) + ', ' + t(sh.n2) + '.'; },
        parts: [
          { id: '1a1', sub: 'a i', level: 'EMG', outcome: 'RF7', make: function (r, sh) {
            var B = sh.B, C = sh.C;
            var p = K.P.line('Write ' + t(sh.n1) + ' in slope–intercept form.', sh.L1, { form: 'slope-intercept', wrong: [{ is: mbL([-1, B], C), code: 'u8-nodiv', hint: 'Divide <b>every</b> term by ' + t(B) + ' — the constant ' + t(C) + ' too.' }] },
              t(sh.n1) + '<br>' + t(B + 'y=' + T([[-1, 'x'], [C, '']])) + '<br>' + t(si(sh.L1)) + ' (divide every term by ' + t(B) + ').',
              ['Get the ' + t('y') + '-term by itself first, then divide every term by its coefficient.'], 'x+By=C to y=mx+b');
            p.bad = [si(mbL([-1, B], C)), si(mbL([1, B], [C, B]))];
            return p;
          } },
          { id: '1a2', sub: 'a ii', level: 'BEG', outcome: 'RF7', make: function (r, sh) {
            var p = K.P.line('Write ' + t(sh.n2) + ' in slope–intercept form.', sh.L2, { form: 'slope-intercept', wrong: [{ is: mbL(-sh.A, sh.D), code: 'u8-neg', hint: 'From ' + t('-y=' + T([[-sh.A, 'x'], [sh.D, '']])) + ', divide <b>every</b> term by ' + t('-1') + ': both signs on the right change.' }] },
              t(sh.n2) + '<br>' + t('-y=' + T([[-sh.A, 'x'], [sh.D, '']])) + '<br>' + t(si(sh.L2)) + ' (divide every term by ' + t('-1') + ').',
              ['Move the ' + t('x') + '-term to the right side, then divide every term by ' + t('-1') + '.'], 'Ax-y=D to y=mx+b');
            p.bad = [si(mbL(-sh.A, sh.D)), si(mbL(sh.A, sh.D))];
            return p;
          } },
          { id: '1b1', sub: 'b i', level: 'EMG', make: function (r, sh) {
            var B = sh.B, C = sh.C;
            var diag = function (x) { return function (v) { var w = (C + x) / B; if (Number.isInteger(w) && v === w) return { code: 'u8-tab-sign', hint: 'Check the sign: from ' + t(eqT([[1, 'x'], [B, 'y']], C)) + ', ' + t(B + 'y=' + C + '-x') + ' — moving ' + t('x') + ' across changes its sign.' }; if (v === C - x) return { code: 'u8-tab-div', hint: 'You found ' + t(B + 'y') + ' — now divide by ' + t(B) + ' to get ' + t('y') + '.' }; return null; }; };
            return numFields('Complete the table of values for ' + t(sh.n1) + '.', sh.xs1.map(function (x) { return t('x=' + x) + ':'; }), sh.ys1, sh.xs1.map(diag),
              'Substitute each ' + t('x') + ' and solve for ' + t('y') + ', e.g. ' + t('x=' + sh.xs1[0]) + ': ' + t(subT([[1, 'x']], { x: sh.xs1[0] }) + '+' + B + 'y=' + C) + ', so ' + t(B + 'y=' + (C - sh.xs1[0])) + ' and ' + t('y=' + sh.ys1[0]) + '.<br>' +
              HW.valueTable([['x'].concat(sh.xs1), ['y'].concat(sh.ys1)]),
              ['Substitute the ' + t('x') + '-value, then solve for ' + t('y') + '.', 'Notice the pattern: each step of ' + t(B) + ' in ' + t('x') + ' changes ' + t('y') + ' by ' + t('1') + '.'], 'table x+By=C', t('y='));
          } },
          { id: '1b2', sub: 'b ii', level: 'BEG', make: function (r, sh) {
            var A = sh.A, D = sh.D;
            var diag = function (x) { return function (v) { if (v === D - A * x) return { code: 'u8-tab-sign', hint: 'Check the sign: ' + t('-y=' + T([[-A, 'x'], [D, '']])) + ', so ' + t('y=' + T([[A, 'x'], [-D, '']])) + '.' }; if (v === A * x + D) return { code: 'u8-tab-sign', hint: 'Check the sign of the constant: ' + t(sh.n2) + ' gives ' + t('y=' + T([[A, 'x'], [-D, '']])) + '.' }; return null; }; };
            return numFields('Complete the table of values for ' + t(sh.n2) + '.', sh.xs2.map(function (x) { return t('x=' + x) + ':'; }), sh.ys2, sh.xs2.map(diag),
              t(sh.n2) + ' gives ' + t('y=' + T([[A, 'x'], [-D, '']])) + '. For example ' + t('x=' + sh.xs2[0]) + ': ' + t('y=' + subT([[A, 'x'], [-D, '']], { x: sh.xs2[0] }) + '=' + sh.ys2[0]) + '.<br>' +
              HW.valueTable([['x'].concat(sh.xs2), ['y'].concat(sh.ys2)]),
              ['Substitute the ' + t('x') + '-value and solve for ' + t('y') + '.', 'Each step of 1 in ' + t('x') + ' changes ' + t('y') + ' by ' + t(A) + '.'], 'table Ax-y=D');
          } },
          { id: '1c', sub: 'c graph', level: 'BEG', make: function (r, sh) {
            return sysGraph('Draw both lines on the grid. (A table of values for each equation gives you points to plot.)', [sh.L1, sh.L2], [sh.n1, sh.n2], W7, {},
              'Plot the table points of ' + t(sh.n1) + ', e.g. ' + ptt([sh.xs1[0], sh.ys1[0]]) + ' and ' + ptt([sh.xs1[4], sh.ys1[4]]) + ', and draw the line through them (arrows on both ends).<br>Do the same for ' + t(sh.n2) + ' with ' + ptt([sh.xs2[0], sh.ys2[0]]) + ' and ' + ptt([sh.xs2[4], sh.ys2[4]]) + '.<br>The lines cross at ' + ptt([sh.x0, sh.y0]) + '.',
              ['Plot at least two points from each table, then draw a line through each set.', 'Put arrows on both ends of each line.'], 'graph system from tables');
          } },
          { id: '1c2', sub: 'c solution', level: 'BEG', make: function (r, sh) {
            return pointPart('State the solution to the system.', [sh.x0, sh.y0], [sh.L1, sh.L2], {},
              'The lines cross at ' + ptt([sh.x0, sh.y0]) + ' — the row ' + t('x=' + sh.x0) + ' gives ' + t('y=' + sh.y0) + ' in <b>both</b> tables.<br>Solution: ' + t('x=' + sh.x0) + ', ' + t('y=' + sh.y0) + ', i.e. ' + ptt([sh.x0, sh.y0]) + '.',
              ['Look for the pair ' + t('(x,\\ y)') + ' that appears in both tables — it is where the lines cross.'], 'solution from tables');
          } },
          { id: '1d', sub: 'd', level: 'LIM', make: function (r, sh) {
            return verifyMC(r, 'Which work correctly verifies the solution ' + ptt([sh.x0, sh.y0]) + ' algebraically?', [{ l: [[1, 'x'], [sh.B, 'y']], r: sh.C }, { l: [[sh.A, 'x'], [-1, 'y']], r: sh.D }], [sh.x0, sh.y0], ['x', 'y'], 'verify solution');
          } }] },
      /* ---------- Q2: set the two expressions equal ---------- */
      { num: '2', stem: 'Both equations in each system are in slope–intercept form. Solve the system by setting the two expressions for ' + t('y') + ' equal, then verify the solution by substituting into both original equations.',
        parts: [
          { id: '2a', level: 'BEG', make: function (r) {
            var s = pick2(r, function (r) { return { m1: r.pick([2, 3, 1]), m2: r.pick([-1, -2]), x0: r.int(1, 5), y0: r.int(-4, 4) }; }, function (s) { var b1 = s.y0 - s.m1 * s.x0, b2 = s.y0 - s.m2 * s.x0; return b1 !== 0 && b2 !== 0 && b1 !== b2 && Math.abs(b1) <= 9 && Math.abs(b2) <= 9; });
            var b1 = s.y0 - s.m1 * s.x0, b2 = s.y0 - s.m2 * s.x0, P = [s.x0, s.y0];
            return pointPart(t('y=' + T([[s.m1, 'x'], [b1, '']])) + ', \\(\\;\\) ' + t('y=' + T([[s.m2, 'x'], [b2, '']])), P, [mbL(s.m1, b1), mbL(s.m2, b2)], { wrong: eqWrongs(s.m1, b1, s.m2, b2, P) },
              eqSol(s.m1, b1, s.m2, b2, P), ['Write ' + t(T([[s.m1, 'x'], [b1, '']]) + '=' + T([[s.m2, 'x'], [b2, '']])) + ' and solve for ' + t('x') + '.', 'Then substitute ' + t('x') + ' into either equation to find ' + t('y') + '.'], 'set equal, integer slopes');
          } },
          { id: '2b', level: 'EMG', make: function (r) {
            var s = pick2(r, function (r) { return { m1: r.pick([-2, -3, 2, 3]), q: r.pick([2, 3, 4, 5]), s2: r.pick([-1, 1]), k: r.pick([1, -1, 2, -2]) }; }, function (s) { var x0 = s.q * s.k, y0 = s.m1 * x0, b2 = y0 - s.s2 * s.k; return Math.abs(x0) <= 10 && b2 !== 0 && Math.abs(b2) <= 15; });
            var x0 = s.q * s.k, y0 = s.m1 * x0, m2 = [s.s2, s.q], b2 = y0 - s.s2 * s.k, P = [x0, y0];
            return pointPart(t('y=' + T([[s.m1, 'x']])) + ', \\(\\;\\) ' + t('y=' + T([[m2, 'x'], [b2, '']])), P, [mbL(s.m1, 0), mbL(m2, b2)], { wrong: eqWrongs(s.m1, 0, m2, b2, P) },
              eqSol(s.m1, 0, m2, b2, P), ['Set ' + t(T([[s.m1, 'x']]) + '=' + T([[m2, 'x'], [b2, '']])) + ', then multiply every term by ' + t(s.q) + ' to clear the fraction.'], 'set equal, fraction slope');
          } },
          { id: '2c', level: 'PRG', make: function (r) {
            var s = pick2(r, function (r) { var q = r.pick([3, 3, 2, 4]), p = r.pick(q === 4 ? [1, 3] : q === 3 ? [1, 2] : [1]); return { q: q, p: p * r.pick([1, 1, -1]), k: r.pick([-4, -3, -2, 2, 3, 4]), b1: r.pick([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]) }; },
              function (s) { var x0 = s.q * s.k, y0 = x0 + s.b1, b2 = y0 - s.p * s.k; return b2 !== 0 && Math.abs(b2) <= 12 && b2 !== s.b1 && Math.abs(x0) <= 16 && Math.abs(y0) <= 16; });
            var x0 = s.q * s.k, y0 = x0 + s.b1, m2 = [s.p, s.q], b2 = y0 - s.p * s.k, P = [x0, y0];
            return pointPart(t('y=' + T([[1, 'x'], [s.b1, '']])) + ', \\(\\;\\) ' + t('y=' + T([[m2, 'x'], [b2, '']])), P, [mbL(1, s.b1), mbL(m2, b2)], { wrong: eqWrongs(1, s.b1, m2, b2, P) },
              eqSol(1, s.b1, m2, b2, P), ['Set the two expressions equal, then multiply <b>every</b> term by ' + t(s.q) + '.', 'The solution can be far from the origin — trust the algebra.'], 'set equal, fraction slope, both intercepts');
          } }] },
      /* ---------- Q3: tickets ---------- */
      { num: '3', shared: function (r) {
          var s = pick2(r, function (r) { var N = r.pick([350, 350, 300, 400]), a0 = 50 * r.int(2, N / 50 - 2); return { N: N, p: r.pick([8, 8, 7, 9, 10, 12]), q: r.pick([5, 5, 4, 6]), a0: a0, s0: N - a0 }; },
            function (s) { if (s.p <= s.q || s.a0 === s.s0) return false; var R = s.p * s.a0 + s.q * s.s0, L = line(s.p, s.q, -R); return latS(L, [[0, s.N], [0, s.N]], 50, 10).length >= 2; });
          s.R = s.p * s.a0 + s.q * s.s0; s.L1 = line(1, 1, -s.N); s.L2 = line(s.p, s.q, -s.R); s.win = [[0, s.N], [0, s.N]];
          s.n1 = 'a+s=' + s.N; s.n2 = s.p + 'a+' + s.q + 's=' + F(s.R);
          return s;
        },
        stem: function (sh) { return 'All ' + t(sh.N) + ' tickets for a school play were sold. Adult tickets cost $' + sh.p + ' each, and student tickets cost $' + sh.q + ' each. Total receipts were $' + Fp(sh.R) + '. The information from the number of tickets can be represented by ' + t(sh.n1) + ', where ' + t('a') + ' is the number of adult tickets and ' + t('s') + ' the number of student tickets.'; },
        parts: [
          { id: '3a', sub: 'a', level: 'BEG', make: function (r, sh) {
            var p = K.P.line('State an equation which can be formed from the costs of the tickets.', sh.L2, { vars: ['a', 's'], keyTex: sh.n2, placeholder: 'e.g. 3a + 2s = 100',
              wrong: [{ is: line(sh.q, sh.p, -sh.R), code: 'u8-price-swap', hint: 'Match each price to its ticket: adult tickets ' + t('a') + ' cost $' + sh.p + ', student tickets ' + t('s') + ' cost $' + sh.q + '.' },
                { is: line(sh.p, sh.q, -sh.N), code: 'u8-total-n', hint: t(sh.p + 'a+' + sh.q + 's') + ' is an amount of <b>money</b>, so it equals the total receipts, $' + Fp(sh.R) + ' — not the number of tickets.' },
                { is: line(1, 1, -sh.R), code: 'u8-total-n', hint: 'This equation is about money: each adult ticket brings in $' + sh.p + ' and each student ticket $' + sh.q + '.' }] },
              'Money from adult tickets: ' + t(sh.p + 'a') + '; from student tickets: ' + t(sh.q + 's') + '. Together they make the total receipts:<br>' + t(sh.n2) + '.',
              ['Each adult ticket brings in $' + sh.p + ', so ' + t('a') + ' adult tickets bring in ' + t(sh.p + 'a') + ' dollars.', 'Add the money from both kinds of ticket and set it equal to the total.'], 'ticket money equation');
            p.good = [sh.q + 's+' + sh.p + 'a=' + sh.R]; p.bad = [sh.q + 'a+' + sh.p + 's=' + sh.R, sh.p + 'a+' + sh.q + 's=' + sh.N];
            return p;
          } },
          { id: '3b', sub: 'b graph', level: 'EMG', make: function (r, sh) {
            var P2 = latS(sh.L2, sh.win, 50, 10).filter(function (p) { return p[0] !== sh.a0; });
            return sysGraph('Graph the system on the grid. (Tap and drag: the box shows the coordinates. The ' + t('s') + '-values snap to tens.)', [sh.L1, sh.L2], [sh.n1, sh.n2], sh.win,
              { context: true, pad: { grid: 50, labels: 50, snapX: 50, snapY: 10, unitX: 300 / sh.N, unitY: 300 / sh.N, xName: 'a', yName: 's', firstQuadrant: true, defaultEnd: 'none' } },
              t(sh.n1) + ': the intercepts ' + ptt([0, sh.N]) + ' and ' + ptt([sh.N, 0]) + '.<br>' + t(sh.n2) + ': choose ' + t('a') + '-values and solve for ' + t('s') + ', e.g. ' + ptt(P2[0]) + (P2[1] ? ' and ' + ptt(P2[1]) : '') + ' (check: ' + t(sh.p + '(' + P2[0][0] + ')+' + sh.q + '(' + P2[0][1] + ')=' + F(sh.R)) + ').<br>The lines cross at ' + ptt([sh.a0, sh.s0]) + '.',
              ['For ' + t(sh.n2) + ', pick an ' + t('a') + '-value such as ' + t(P2[0][0]) + ' and solve for ' + t('s') + '.', 'You need two points on each line.'], 'graph ticket system');
          } },
          { id: '3b2', sub: 'b tickets', level: 'BEG', make: function (r, sh) {
            var p = numFields('How many tickets of each type were sold?', ['Adult tickets:', 'Student tickets:'], [sh.a0, sh.s0], null,
              'The lines cross at ' + ptt([sh.a0, sh.s0]) + ': ' + t('a=' + sh.a0) + ' adult tickets and ' + t('s=' + sh.s0) + ' student tickets.', ['Read the point where the two lines cross: ' + t('(a,\\ s)') + '.'], 'ticket counts');
            var base = p.check; p.check = function (resp) { resp = resp || []; if (Number(resp[0]) === sh.s0 && Number(resp[1]) === sh.a0 && sh.a0 !== sh.s0) return wrong('u8-count-swap', 'You swapped them: the first coordinate of the crossing point is ' + t('a') + ', the number of <b>adult</b> tickets.'); return base(resp); };
            p.bad = [[String(sh.s0), String(sh.a0)]].filter(function () { return sh.a0 !== sh.s0; });
            return p;
          } },
          { id: '3c', sub: 'c', level: 'LIM', make: function (r, sh) {
            return verifyMC(r, 'Which work correctly verifies the solution ' + ptt([sh.a0, sh.s0]) + ' algebraically?', [{ l: [[1, 'a'], [1, 's']], r: sh.N }, { l: [[sh.p, 'a'], [sh.q, 's']], r: sh.R }], [sh.a0, sh.s0], ['a', 's'], 'verify ticket solution');
          } }] },
      /* ---------- Q4: bus companies ---------- */
      { num: '4', shared: function (r) {
          var o = r.pick([[350, 2.5, 5], [350, 2.5, 5], [300, 2.5, 5], [400, 2.5, 5], [450, 2.5, 5], [250, 2.5, 5], [300, 5, 7.5], [250, 5, 7.5], [500, 2.5, 7.5], [600, 2.5, 7.5]]);
          var s = { F: o[0], a: o[1], b: o[2] }; s.d0 = s.F / (s.b - s.a); s.C0 = s.b * s.d0;
          s.LA = line(2 * s.a, -2, 2 * s.F); s.LB = line(2 * s.b, -2, 0); s.win = [[0, 200], [0, 1000]];
          s.nA = 'C=' + F(s.F) + '+' + dT(s.a) + 'd'; s.nB = 'C=' + dT(s.b) + 'd';
          return s;
        },
        stem: function (sh) { return 'A school is choosing a bus company for a field trip. Company A charges $' + sh.F + ' plus $' + sh.a.toFixed(2) + ' per kilometre. Company B charges $' + sh.b.toFixed(2) + ' per kilometre. Let ' + t('C') + ' be the cost in dollars for a trip of ' + t('d') + ' kilometres.'; },
        parts: [
          { id: '4a', sub: 'a', level: 'BEG', make: function (r, sh) {
            var cA = K.line(line(2 * sh.F, -2, 2 * sh.a), { vars: ['d', 'C'] }), cN = K.line(line(2 * sh.a, -2, 0), { vars: ['d', 'C'] });
            return twoEq('Write a cost equation for each company.', [sh.LA, sh.LB], ['Company A:', 'Company B:'], ['d', 'C'],
              function (a) { if (cA(a).v === 'correct') return { code: 'u8-fee-rate', hint: 'Company A: the $' + sh.F + ' is charged once (the constant); the $' + sh.a.toFixed(2) + ' is charged for every kilometre, so it multiplies ' + t('d') + '.' }; if (cN(a).v === 'correct') return { code: 'u8-no-fee', hint: 'Company A also charges a fixed $' + sh.F + ' on top of the per-kilometre cost.' }; return null; },
              'Company A: a fixed $' + sh.F + ' plus $' + sh.a.toFixed(2) + ' for each of the ' + t('d') + ' kilometres: ' + t(sh.nA) + '.<br>Company B: $' + sh.b.toFixed(2) + ' for each kilometre: ' + t(sh.nB) + '.',
              ['Cost = fixed charge + (rate per km) × (number of km).'], 'bus cost equations', [sh.nA, sh.nB]);
          } },
          { id: '4b', sub: 'b', level: 'EMG', make: function (r, sh) {
            var dA = Math.min(200, Math.floor((1000 - sh.F) / sh.a / 20) * 20);   // a second point of A's line that is on the grid
            return sysGraph('Graph both equations on the grid. (Tap and drag: the box shows the coordinates. ' + t('C') + '-values snap to 50s.)', [sh.LA, sh.LB], [sh.nA, sh.nB], sh.win,
              { context: true, pad: { grid: 20, gridY: 100, labels: 1, labelsX: 40, labelsY: 200, snapX: 20, snapY: 50, unitX: 1.6, unitY: 0.3, xName: 'd', yName: 'C', firstQuadrant: true, defaultEnd: 'none' } },
              'Company A: ' + ptt([0, sh.F]) + ' and ' + ptt([dA, sh.F + dA * sh.a]) + '. Company B: ' + ptt([0, 0]) + ' and ' + ptt([100, 100 * sh.b]) + '.<br>Draw a line through each pair. They cross at ' + ptt([sh.d0, sh.C0]) + '.',
              ['Find two points for each company: e.g. ' + t('d=0') + ' and ' + t('d=100') + '.', 'Company B’s line starts at the origin (no fixed charge).'], 'graph bus costs');
          } },
          { id: '4c', sub: 'c point', level: 'BEG', make: function (r, sh) {
            return pointPart('State the point where the two lines cross, as ' + t('(d,\\ C)') + '.', [sh.d0, sh.C0], [sh.LA, sh.LB], { vars: ['d', 'C'] },
              'Set the costs equal: ' + t(dT(sh.b) + 'd=' + sh.F + '+' + dT(sh.a) + 'd') + ', so ' + t(dT(sh.b - sh.a) + 'd=' + sh.F) + ' and ' + t('d=' + sh.d0) + '.<br>' + t('C=' + dT(sh.b) + '(' + sh.d0 + ')=' + sh.C0) + '. The lines cross at ' + ptt([sh.d0, sh.C0]) + '.<br>Check: ' + t(sh.F + '+' + dT(sh.a) + '(' + sh.d0 + ')=' + sh.C0) + ' ✓',
              ['Read the crossing point from your graph, or set the two costs equal.'], 'bus crossing point');
          } },
          { id: '4c2', sub: 'c meaning', level: 'LIM', make: function (r, sh) {
            return mc(r, 'What does the point ' + ptt([sh.d0, sh.C0]) + ' mean for the school?', [
              { html: 'A ' + sh.d0 + ' km trip costs $' + sh.C0 + ' with either company.', right: true },
              { html: 'A ' + sh.C0 + ' km trip costs $' + sh.d0 + ' with either company.', why: 'In ' + t('(d,\\ C)') + ' the first number is the distance ' + t('d') + ' and the second is the cost ' + t('C') + '.', code: 'swap' },
              { html: 'Company A is $' + sh.d0 + ' cheaper than Company B.', why: 'At the crossing point the two costs are <b>equal</b>.', code: 'cheaper' },
              { html: 'Company B is always the better choice.', why: 'The point is where the two lines cross: on one side B is cheaper, on the other side A is.', code: 'always' }],
              'At the crossing point both equations have the same ' + t('d') + ' and the same ' + t('C') + ': a trip of ' + sh.d0 + ' km costs $' + sh.C0 + ' with either company.', ['What do ' + t('d') + ' and ' + t('C') + ' stand for?'], 'meaning of crossing point');
          } },
          { id: '4d', sub: 'd', level: 'EMG', make: function (r, sh) {
            var dd = sh.d0 / 2, A1 = sh.F + sh.a * dd, B1 = sh.b * dd;
            return mc(r, 'For which trip lengths is Company B cheaper?', [
              { html: 'Trips shorter than ' + sh.d0 + ' km', right: true },
              { html: 'Trips longer than ' + sh.d0 + ' km', why: 'Test a short trip, e.g. ' + dd + ' km: A costs $' + A1 + ', B costs $' + B1 + '. B has no fixed charge, so it wins on short trips.', code: 'longer' },
              { html: 'Trips shorter than ' + sh.C0 + ' km', why: sh.C0 + ' is the cost (in dollars) at the crossing point, not a distance.', code: 'cost' },
              { html: 'Only a trip of exactly ' + sh.d0 + ' km', why: 'At exactly ' + sh.d0 + ' km the costs are equal. Look at which line is lower on either side.', code: 'equal' }],
              'Left of ' + t('d=' + sh.d0) + ' Company B’s line is lower (e.g. ' + t('d=' + dd) + ': B costs $' + B1 + ', A costs $' + A1 + '), so <b>B is cheaper for trips shorter than ' + sh.d0 + ' km</b>. For longer trips, A is cheaper.',
              ['Which line is lower to the left of the crossing point?'], 'which company cheaper');
          } }] },
      /* ---------- Q5: graph and count ---------- */
      { num: '5', stem: 'Graph each system and determine whether it has no solution, one solution, or infinitely many solutions.',
        shared: function (r) {
          var a = pick2(r, function (r) { return { m1: r.pick([3, 2, 3]), m2: r.pick([-2, -1, -3]), x0: r.int(-2, 3), y0: r.int(-3, 6) }; }, function (s) { var b1 = s.y0 - s.m1 * s.x0, b2 = s.y0 - s.m2 * s.x0; return b1 !== b2 && Math.abs(b1) <= 9 && Math.abs(b2) <= 9 && latS(mbL(s.m1, b1), W68).length >= 2 && latS(mbL(s.m2, b2), W68).length >= 2; });
          a.b1 = a.y0 - a.m1 * a.x0; a.b2 = a.y0 - a.m2 * a.x0; a.L1 = mbL(a.m1, a.b1); a.L2 = mbL(a.m2, a.b2); a.n1 = 'y=' + T([[a.m1, 'x'], [a.b1, '']]); a.n2 = 'y=' + T([[a.m2, 'x'], [a.b2, '']]);
          var b = pick2(r, function (r) { var bs = r.sample([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6], 2); return { m: r.pick([-1, -1, 1, -2, 2, [1, 2], [-1, 2]]), b1: Math.max(bs[0], bs[1]), b2: Math.min(bs[0], bs[1]) }; }, function (s) { return s.b1 - s.b2 >= 3; });
          b.L1 = mbL(b.m, b.b1); b.L2 = mbL(b.m, b.b2); b.n1 = 'y=' + T([[b.m, 'x'], [b.b1, '']]); b.n2 = 'y=' + T([[b.m, 'x'], [b.b2, '']]);
          var c = { m: r.pick([2, 2, -2, 3, -3, 1, -1]), b: r.pick([-4, -4, -3, -2, 2, 3, 4, 5]), k: r.pick([2, 2, 3]) };
          c.L = mbL(c.m, c.b); c.n1 = eqT([[c.k * c.m, 'x'], [-c.k, 'y']], -c.k * c.b); c.n2 = 'y=' + T([[c.m, 'x'], [c.b, '']]);
          return { a: a, b: b, c: c };
        },
        parts: [
          { id: '5a', sub: 'a graph', level: 'BEG', make: function (r, sh) {
            var a = sh.a;
            return sysGraph('(a) ' + t(a.n1) + ', \\(\\;\\) ' + t(a.n2) + '<br>Graph both lines.', [a.L1, a.L2], [a.n1, a.n2], W68, {},
              t(a.n1) + ': start at ' + ptt([0, a.b1]) + ', slope ' + t(a.m1) + '. ' + t(a.n2) + ': start at ' + ptt([0, a.b2]) + ', slope ' + t(a.m2) + '.<br>(If a ' + t('y') + '-intercept is off the grid, use two other points from a table.) The lines cross at ' + ptt([a.x0, a.y0]) + '.',
              ['Plot the ' + t('y') + '-intercept, then use rise over run.'], 'graph one-solution system');
          } },
          { id: '5a2', sub: 'a solutions', level: 'BEG', make: function (r, sh) {
            var a = sh.a;
            return pointPart('(a) ' + t(a.n1) + ', \\(\\;\\) ' + t(a.n2) + '<br>How many solutions does the system have? If there is exactly one, give it as an ordered pair; otherwise use the <b>no solution</b> or <b>infinitely many</b> key.', [a.x0, a.y0], [a.L1, a.L2], {},
              'The slopes ' + t(a.m1) + ' and ' + t(a.m2) + ' are different, so the lines cross once: <b>one solution</b>, ' + ptt([a.x0, a.y0]) + '.<br>Check: ' + t(subT([[a.m1, 'x'], [a.b1, '']], { x: a.x0 }) + '=' + a.y0) + ' and ' + t(subT([[a.m2, 'x'], [a.b2, '']], { x: a.x0 }) + '=' + a.y0) + ' ✓',
              ['Where do your two lines cross?'], 'count: one solution');
          } },
          { id: '5b', sub: 'b graph', level: 'BEG', make: function (r, sh) {
            var b = sh.b;
            return sysGraph('(b) ' + t(b.n1) + ', \\(\\;\\) ' + t(b.n2) + '<br>Graph both lines.', [b.L1, b.L2], [b.n1, b.n2], W68, {},
              'Both lines have slope ' + t(nT(b.m)) + '. Start them at ' + ptt([0, b.b1]) + ' and ' + ptt([0, b.b2]) + ' and step with the same rise and run: the lines are parallel.',
              ['Plot each ' + t('y') + '-intercept, then use the slope.'], 'graph parallel lines');
          } },
          { id: '5b2', sub: 'b solutions', level: 'BEG', make: function (r, sh) {
            var b = sh.b;
            return pointPart('(b) ' + t(b.n1) + ', \\(\\;\\) ' + t(b.n2) + '<br>How many solutions does the system have? If there is exactly one, give it as an ordered pair; otherwise use the <b>no solution</b> or <b>infinitely many</b> key.', 'none', [b.L1, b.L2], {},
              'Same slope (' + t(nT(b.m)) + '), different ' + t('y') + '-intercepts (' + t(b.b1) + ' and ' + t(b.b2) + '): the lines are parallel and never meet — <b>no solution</b>.',
              ['Do the lines ever meet? Compare their slopes and intercepts.'], 'count: parallel');
          } },
          { id: '5c', sub: 'c graph', level: 'EMG', make: function (r, sh) {
            var c = sh.c;
            return sysGraph('(c) ' + t(c.n1) + ', \\(\\;\\) ' + t(c.n2) + '<br>Graph both lines.', [c.L, c.L], [c.n1, c.n2], W68, {},
              'Rearrange ' + t(c.n1) + ': ' + t(T([[-c.k, 'y']]) + '=' + T([[-c.k * c.m, 'x'], [-c.k * c.b, '']])) + ', so ' + t(c.n2) + ' — the same equation as the second one.<br>Both equations give the same line: draw it once (start at ' + ptt([0, c.b]) + ', slope ' + t(c.m) + ').',
              ['Rearrange the first equation into ' + t('y=mx+b') + ' before you graph it.'], 'graph coincident lines');
          } },
          { id: '5c2', sub: 'c solutions', level: 'EMG', make: function (r, sh) {
            var c = sh.c;
            return pointPart('(c) ' + t(c.n1) + ', \\(\\;\\) ' + t(c.n2) + '<br>How many solutions does the system have? If there is exactly one, give it as an ordered pair; otherwise use the <b>no solution</b> or <b>infinitely many</b> key.', 'inf', [c.L, c.L], {},
              t(c.n1) + ' rearranges to ' + t(c.n2) + ': the two equations describe the <b>same line</b>, so every point on it is a solution — <b>infinitely many solutions</b>.',
              ['Rearrange the first equation. What do you notice?'], 'count: same line');
          } }] },
      /* ---------- Q6: rearrange and classify ---------- */
      { num: '6', stem: 'Rearrange each equation into the form ' + t('y=mx+b') + ' and state whether the system has no solution, one solution, or infinitely many solutions.',
        shared: function (r) {
          var a = { A: r.int(2, 6), C: r.int(2, 9), none: r.chance(0.65) }; if (a.A === a.C) a.C = a.A + 1;
          a.L1 = line(a.A, -1, -a.C); a.L2 = mbL(a.A, a.none ? a.C : -a.C); a.n1 = eqT([[a.A, 'x'], [-1, 'y']], a.C); a.n2 = 'y=' + T([[a.A, 'x'], [a.none ? a.C : -a.C, '']]);
          var b = { a: r.int(2, 9), c: r.pick([2, 3, 4, 5, -2, -3]) }; b.L1 = line(b.a, -1, -b.c); b.L2 = line(1, -b.a, -b.c); b.n1 = eqT([[b.a, 'x'], [-1, 'y']], b.c); b.n2 = eqT([[1, 'x'], [-b.a, 'y']], b.c);
          var c = { b: r.pick([4, 4, 2, 3, 5]), k: r.int(1, 4), inf: r.chance(0.65) }; c.k2 = c.inf ? c.k : r.pick([c.k + 1, -c.k, c.k + 2]);
          c.L1 = line(1, c.b, -c.b * c.k); c.L2 = mbL([-1, c.b], c.k2); c.n1 = T([[c.b, 'y'], [1, 'x'], [-c.b * c.k, '']]) + '=0'; c.n2 = 'y=' + T([[[-1, c.b], 'x'], [c.k2, '']]);
          return { a: a, b: b, c: c };
        },
        parts: [
          { id: '6a1', sub: 'a i', level: 'BEG', outcome: 'RF7', make: function (r, sh) {
            var a = sh.a, p = K.P.line('(a) ' + t(a.n1) + ', \\(\\;\\) ' + t(a.n2) + '<br>Rearrange ' + t(a.n1) + ' into the form ' + t('y=mx+b') + '.', a.L1, { form: 'slope-intercept', wrong: [{ is: mbL(a.A, a.C), code: 'u8-neg', hint: 'From ' + t('-y=' + T([[-a.A, 'x'], [a.C, '']])) + ', divide <b>every</b> term by ' + t('-1') + ': the constant changes sign too.' }] },
              t(a.n1) + '<br>' + t('-y=' + T([[-a.A, 'x'], [a.C, '']])) + '<br>' + t(si(a.L1)), ['Move ' + t(a.A + 'x') + ' to the right, then divide every term by ' + t('-1') + '.'], 'rearrange Ax-y=C');
            p.bad = [si(mbL(a.A, a.C))]; return p;
          } },
          { id: '6a2', sub: 'a ii', level: 'EMG', make: function (r, sh) {
            var a = sh.a;
            return classMC(r, '(a) ' + t(a.n1) + ', \\(\\;\\) ' + t(a.n2) + '<br>How many solutions does the system have?', kindOf(a.L1, a.L2), clsD(a.L1, a.L2), clsSol(a.L1, a.L2, a.n1, a.n2), ['Rearrange the first equation and compare slopes, then intercepts.'], 'classify Ax-y=C, y=Ax±C',
              a.none ? '<b>Infinitely many solutions</b> — the equations have the same numbers ' + t(a.A) + ' and ' + t(a.C) + '.' : '<b>No solution</b> — the constants have opposite signs.');
          } },
          { id: '6b1', sub: 'b i', level: 'EMG', outcome: 'RF7', make: function (r, sh) {
            var b = sh.b, p = K.P.line('(b) ' + t(b.n1) + ', \\(\\;\\) ' + t(b.n2) + '<br>Rearrange ' + t(b.n2) + ' into the form ' + t('y=mx+b') + '.', b.L2, { form: 'slope-intercept', wrong: [{ is: mbL([-1, b.a], [b.c, b.a]), code: 'u8-neg', hint: 'Dividing by ' + t(-b.a) + ' changes the sign of <b>every</b> term.' }, { is: mbL([1, b.a], -b.c), code: 'u8-nodiv', hint: 'Divide every term by ' + t(-b.a) + ' — the constant too.' }] },
              t(b.n2) + '<br>' + t(T([[-b.a, 'y']]) + '=' + T([[-1, 'x'], [b.c, '']])) + '<br>' + t(si(b.L2)) + ' (divide every term by ' + t(-b.a) + ').', ['Move the ' + t('x') + '-term across, then divide every term by ' + t(-b.a) + '.'], 'rearrange x-ay=c');
            p.bad = [si(mbL([-1, b.a], [b.c, b.a]))]; return p;
          } },
          { id: '6b2', sub: 'b ii', level: 'EMG', make: function (r, sh) {
            var b = sh.b;
            return classMC(r, '(b) ' + t(b.n1) + ', \\(\\;\\) ' + t(b.n2) + '<br>How many solutions does the system have?', 'one', clsD(b.L1, b.L2), clsSol(b.L1, b.L2, b.n1, b.n2), ['Rearrange both equations. Swapping the coefficients is not the same as multiplying.'], 'classify swapped coefficients');
          } },
          { id: '6c1', sub: 'c i', level: 'EMG', outcome: 'RF7', make: function (r, sh) {
            var c = sh.c, p = K.P.line('(c) ' + t(c.n1) + ', \\(\\;\\) ' + t(c.n2) + '<br>Rearrange ' + t(c.n1) + ' into the form ' + t('y=mx+b') + '.', c.L1, { form: 'slope-intercept', wrong: [{ is: mbL([-1, c.b], c.b * c.k), code: 'u8-nodiv', hint: 'Divide <b>every</b> term by ' + t(c.b) + ' — the constant too.' }] },
              t(c.n1) + '<br>' + t(T([[c.b, 'y']]) + '=' + T([[-1, 'x'], [c.b * c.k, '']])) + '<br>' + t(si(c.L1)), ['Keep the ' + t('y') + '-term on the left; move the other terms to the right, then divide by ' + t(c.b) + '.'], 'rearrange by+x-c=0');
            p.bad = [si(mbL([-1, c.b], c.b * c.k))]; return p;
          } },
          { id: '6c2', sub: 'c ii', level: 'EMG', make: function (r, sh) {
            var c = sh.c;
            return classMC(r, '(c) ' + t(c.n1) + ', \\(\\;\\) ' + t(c.n2) + '<br>How many solutions does the system have?', kindOf(c.L1, c.L2), clsD(c.L1, c.L2), clsSol(c.L1, c.L2, c.n1, c.n2), ['Rearrange the first equation, then compare it with the second.'], 'classify general vs slope-intercept',
              c.inf ? '<b>No solution</b> — one equation is in general form and the other in slope–intercept form.' : null);
          } }] },
      /* ---------- Q7: write a second equation ---------- */
      { num: '7', shared: function (r) { var A = r.pick([5, 5, 2, 3, 4, 6]), C = r.pick([3, 3, 1, 2, 4, 5, 7, -1, -2, -3]); return { A: A, C: C, L: line(A, -1, -C), n: eqT([[A, 'x'], [-1, 'y']], C) }; },
        stem: function (sh) { return 'Write an equation which forms a system with the equation ' + t(sh.n) + ' so that the system has:'; },
        parts: ['none', 'one', 'inf'].map(function (want, i) {
          return { id: '7' + 'abc'[i], level: want === 'one' ? 'EMG' : 'ADV', make: function (r, sh) {
            var A = sh.A, C = sh.C, G = sh.L;
            var check = function (resp) {
              var rd = Ln.read(resp); if (!rd.ok) return form(rd.why === 'empty' ? 'empty' : 'line-' + rd.why, rd.why === 'empty' ? 'Type your equation first.' : rd.why === 'no-eq' ? 'Write an equation with an equals sign, e.g. ' + t('y=2x+1') + '.' : 'I can’t read that equation — use ' + t('x') + ', ' + t('y') + ' and numbers.');
              var S = { A: rd.a, B: rd.b, C: rd.c }, k = (Math.abs(S.A * G.B - S.B * G.A) < 1e-9) ? (Math.abs(S.A * G.C - S.C * G.A) < 1e-9 && Math.abs(S.B * G.C - S.C * G.B) < 1e-9 ? 'inf' : 'none') : 'one';
              if (k === want) return ok();
              var negSlope = S.B !== 0 && Math.abs(-S.A / S.B + A) < 1e-9;
              if (want !== 'one' && negSlope) return wrong('u8-sys-sign', 'Check the slope of the given line: ' + t(sh.n) + ' rearranges to ' + t('y=' + T([[A, 'x'], [-C, '']])) + ', so its slope is ' + t(A) + ', not ' + t(-A) + '.');
              if (k === 'inf') return wrong('u8-sys-same', 'Your equation is the same line as ' + t(sh.n) + ' (a multiple of it), so the system would have <b>infinitely many</b> solutions. ' + (want === 'none' ? 'Keep the slope but change the constant.' : 'Use a different slope.'));
              if (k === 'none') return wrong('u8-sys-par', 'Your line has the same slope as ' + t(sh.n) + ' but a different intercept: parallel lines, so <b>no solution</b>. ' + (want === 'inf' ? 'For infinitely many, multiply <b>every</b> term — the constant too — by the same number.' : 'Use a different slope.'));
              return wrong('u8-sys-cross', 'Your line has a different slope from ' + t(sh.n) + ' (slope ' + t(A) + '), so the lines cross once: <b>one solution</b>. ' + (want === 'none' ? 'Keep the slope ' + t(A) + ' and change only the intercept.' : 'Multiply the whole equation by a number to get the same line.'));
            };
            var key = want === 'none' ? eqT([[A, 'x'], [-1, 'y']], C + 5) : want === 'one' ? (A === 1 ? 'x+y=1' : 'x-y=1') : eqT([[2 * A, 'x'], [-2, 'y']], 2 * C);
            var sol = 'Rearrange: ' + t(sh.n) + ' becomes ' + t('y=' + T([[A, 'x'], [-C, '']])) + ' — slope ' + t(A) + ', ' + t('y') + '-intercept ' + t(-C) + '.<br>' +
              (want === 'none' ? 'Keep the slope and change the intercept, e.g. ' + t('y=' + T([[A, 'x'], [-C - 5, '']])) + ', i.e. ' + t(key) + '. (Any line with slope ' + t(A) + ' and a different intercept works.)'
                : want === 'one' ? 'Use any different slope, e.g. ' + t('y=x-1') + ', i.e. ' + t(key) + '.'
                  : 'Multiply the whole equation by the same number, e.g. by ' + t(2) + ': ' + t(key) + ' — the same line.');
            var p = K.P.math('(' + 'abc'[i] + ') ' + ['no solution', 'one solution', 'infinitely many solutions'][i], check, key, sol,
              [want === 'none' ? 'No solution means parallel lines: same slope, different ' + t('y') + '-intercept.' : want === 'one' ? 'One solution means the lines cross: the slopes are different.' : 'Infinitely many means the same line: multiply every term by the same number.', 'First rearrange ' + t(sh.n) + ' into ' + t('y=mx+b') + '.'], 'write equation: ' + want, { keys: 'eq', placeholder: 'e.g. y = 2x + 1' });
            p.good = want === 'none' ? ['y=' + T([[A, 'x'], [-C + 1, '']]), eqT([[2 * A, 'x'], [-2, 'y']], 2 * C + 1)] : want === 'one' ? ['y=' + T([[-A, 'x']]), 'y=4', 'x=2'] : ['y=' + T([[A, 'x'], [-C, '']]), eqT([[3 * A, 'x'], [-3, 'y']], 3 * C)];
            p.bad = want === 'none' ? [sh.n, 'y=' + T([[-A, 'x'], [1, '']]), 'y=' + T([[A + 1, 'x']])] : want === 'one' ? ['y=' + T([[A, 'x'], [2, '']]), eqT([[2 * A, 'x'], [-2, 'y']], 2 * C)] : [eqT([[A, 'x'], [-1, 'y']], C + 1), eqT([[2 * A, 'x'], [-2, 'y']], C)];
            return p;
          } };
        }) },
      /* ---------- Q8–Q10: diploma style ---------- */
      { num: '8', section: 'Assignment — Multiple choice and numerical response', parts: [
        { id: '8', level: 'EMG', make: function (r) {
          var s = pick2(r, function (r) { var ab = r.pick([[3, 2], [3, 2], [2, 3], [3, 4], [4, 3], [2, 5], [5, 2]]), ms = r.sample([2, 3, 4], 2); return { a: ab[0], b: ab[1], m1: Math.min(ms[0], ms[1]), m2: Math.max(ms[0], ms[1]), c1: r.pick([5, 5, 1, 2, 3, 4, 6, 7, -1, -3]), inf: r.chance(0.3) }; },
            function (s) { var L = line(s.a, -s.b, -s.c1); return latS(L, W6).length >= 2; });
          var c2 = s.inf ? s.c1 : s.c1 + r.pick([-1, -1, 1, 2]), L1 = line(s.a, -s.b, -s.c1), L2 = line(s.a, -s.b, -c2), Ps = latS(L1, W6);
          var P1 = Ps[Math.floor(Ps.length / 2)], P2 = Ps[Math.floor(Ps.length / 2) - 1];
          var e1 = eqT([[s.m1 * s.a, 'x'], [-s.m1 * s.b, 'y']], s.m1 * s.c1), e2 = eqT([[s.m2 * s.a, 'x'], [-s.m2 * s.b, 'y']], s.m2 * c2);
          var onBoth = function (P) { return onL(L2, P); };
          return mc(r, 'The system ' + t('\\begin{cases}' + e1 + '\\\\' + e2 + '\\end{cases}') + ' has', [
            { html: 'no solution', right: !s.inf, why: 'Divide each equation by its common factor: both become ' + t(eqT([[s.a, 'x'], [-s.b, 'y']], s.c1)) + ' — the same line.', code: 'none' },
            { html: 'one solution, ' + ptt(P1), why: onBoth(P1) ? ptt(P1) + ' is on both lines — but so is every other point of the line: the equations are multiples of each other.' : ptt(P1) + ' is on the first line only: ' + t(subT([[s.m2 * s.a, 'x'], [-s.m2 * s.b, 'y']], { x: P1[0], y: P1[1] }) + '=' + (s.m2 * (s.a * P1[0] - s.b * P1[1]))) + ', not ' + t(s.m2 * c2) + '.', code: 'p1' },
            { html: 'one solution, ' + ptt(P2), why: onBoth(P2) ? ptt(P2) + ' is on both lines — but so is every other point: the same line.' : ptt(P2) + ' is on the first line only: ' + t(subT([[s.m2 * s.a, 'x'], [-s.m2 * s.b, 'y']], { x: P2[0], y: P2[1] }) + '=' + (s.m2 * (s.a * P2[0] - s.b * P2[1]))) + ', not ' + t(s.m2 * c2) + '.', code: 'p2' },
            { html: 'infinitely many solutions', right: s.inf, why: 'The slopes are equal, but the lines are not the same: dividing gives ' + t(eqT([[s.a, 'x'], [-s.b, 'y']], s.c1)) + ' and ' + t(eqT([[s.a, 'x'], [-s.b, 'y']], c2)) + ' — different constants, so parallel lines.', code: 'inf' }],
            t(e1) + ' → ' + t(si(L1)) + '; ' + t(e2) + ' → ' + t(si(L2)) + '.<br>' + (s.inf ? 'Same slope and same intercept: the same line — <b>infinitely many solutions</b>.' : 'Equal slopes (' + t(fT(slopeOf(L1))) + ') but different intercepts: parallel and distinct — <b>no solution</b>. (The points in the other choices lie on the first line only.)'),
            ['Divide each equation by a common factor, or rearrange both into ' + t('y=mx+b') + '.'], 'MC classify multiples');
        } }] },
      { num: '9', parts: [
        { id: '9', level: 'ADV', make: function (r) {
          var s = pick2(r, function (r) { return { a: r.pick([3, 3, 2, 4, 5]), b: r.pick([1, 1, 2, 3]), c: r.pick([-6, -6, -4, -5, 4, 5, 6, -3]), m1: r.pick([2, 2, 4, 3]), m2: r.pick([3, 3, 2]) }; }, function (s) { return gcd(s.a, s.b) === 1 && s.m1 !== s.m2 && gcd(gcd(s.a, s.b), s.c) === 1; });
          var k = s.m1 * s.b, e1 = T([[s.m1 * s.a, 'x'], [1, 'ky']]) + '=' + s.m1 * s.c, e2 = eqT([[-s.m2 * s.a, 'x'], [-s.m2 * s.b, 'y']], -s.m2 * s.c), base = eqT([[s.a, 'x'], [s.b, 'y']], s.c);
          var p = K.P.nr('The value of ' + t('k') + ', where ' + t('k') + ' is a natural number, for which the system of equations ' + t(e1) + ' and ' + t(e2) + ' has an infinite number of solutions, is ____.', k,
            function (v) { if (v === s.m2 * s.b && v !== k) return { code: 'u8-k-ycoef', hint: 'Copying the ' + t('y') + '-coefficient isn’t enough: the two equations must be the <b>same multiple</b> of one line. Divide ' + t(e2) + ' by ' + t(-s.m2) + ' first.' }; if (v === s.m1 * s.a && v !== k) return { code: 'u8-k-xcoef', hint: 'That’s the ' + t('x') + '-coefficient. Find the multiplier that turns ' + t(base) + ' into the first equation, then apply it to the ' + t('y') + '-term.' }; if (v === s.b && v !== k) return { code: 'u8-k-div', hint: 'That makes the first equation ' + t(T([[s.m1 * s.a, 'x'], [s.b, 'y']]) + '=' + s.m1 * s.c) + ' — not a multiple of ' + t(base) + '. Multiply the ' + t('y') + '-term by ' + t(s.m1) + ' too.' }; return null; },
            'Divide ' + t(e2) + ' by ' + t(-s.m2) + ': ' + t(base) + '.<br>Multiplying by ' + t(s.m1) + ' gives ' + t(eqT([[s.m1 * s.a, 'x'], [s.m1 * s.b, 'y']], s.m1 * s.c)) + ', which matches ' + t(e1) + ' when ' + t('k=' + k) + '.<br>Then the two equations describe the same line: ' + t('\\mathbf{k=' + k + '}'),
            ['Infinitely many solutions means the same line: one equation is a multiple of the other.', 'Simplify the second equation first.'], 'NR k for infinitely many');
          return p;
        } }] },
      { num: '10', parts: [
        { id: '10', level: 'ADV', make: function (r) {
          var s = pick2(r, function (r) { return { p: r.pick([4, 4, 2, 5, 3]), q: r.pick([3, 3, 5, 2]), rr: r.pick([9, 9, 6, 7, 8, 10]), m: r.pick([2, 2, 3]), s: r.pick([12, 12, 6, 10, 14]) }; }, function (s) { return gcd(s.p, s.q) === 1 && s.s !== s.m * s.rr && gcd(gcd(s.p, s.q), s.rr) === 1; });
          var a = s.m * s.p, e1 = T([[1, 'ax'], [s.m * s.q, 'y']]) + '=' + s.s, e2 = eqT([[s.p, 'x'], [s.q, 'y']], s.rr), inv = s.m * s.q * s.q / s.p;
          return K.P.nr('The value of ' + t('a') + ', where ' + t('a') + ' is a natural number, for which the system of equations ' + t(e1) + ' and ' + t(e2) + ' has no solution, is ____.', a,
            function (v) { if (Math.abs(v - inv) < 1e-9 && inv !== a) return { code: 'u8-k-flip', hint: 'Check the slopes: ' + t(e1) + ' has slope ' + t('-\\frac{a}{' + s.m * s.q + '}') + ' and ' + t(e2) + ' has slope ' + t('-\\frac{' + s.p + '}{' + s.q + '}') + '. Set them equal.' }; if (v === s.p && v !== a) return { code: 'u8-k-xcoef', hint: 'With ' + t('a=' + s.p) + ' the slopes are ' + t(fT(fr(-s.p, s.m * s.q))) + ' and ' + t(fT(fr(-s.p, s.q))) + ' — not equal. The ' + t('y') + '-coefficients differ, so the ' + t('x') + '-coefficient must change by the same factor.' }; if (s.p % s.m === 0 && v === s.p / s.m) return { code: 'u8-k-div', hint: 'The ' + t('y') + '-coefficient was <b>multiplied</b> by ' + t(s.m) + ', so multiply the ' + t('x') + '-coefficient by ' + t(s.m) + ' too.' }; return null; },
            'Slopes: ' + t(e1) + ' gives ' + t('y=-\\frac{a}{' + s.m * s.q + '}x+' + nT(fr(s.s, s.m * s.q))) + '; ' + t(e2) + ' gives ' + t(si(line(s.p, s.q, -s.rr))) + '.<br>No solution needs equal slopes (the intercepts ' + t(nT(fr(s.s, s.m * s.q))) + ' and ' + t(nT(fr(s.rr, s.q))) + ' already differ): ' + t('\\frac{a}{' + s.m * s.q + '}=\\frac{' + s.p + '}{' + s.q + '}') + ', so ' + t('\\mathbf{a=' + a + '}') + '.',
            ['No solution means parallel lines: equal slopes, different intercepts.', 'Write both slopes as ' + t('-\\frac{A}{B}') + ' and set them equal.'], 'NR a for no solution');
        } }] }
    ],
    extra: [
      /* ---------- EP Part A: mixed forms ---------- */
      { num: '1', section: 'Extra practice A — Mixed forms: rearrange before you graph',
        stem: 'In each system one equation is in slope–intercept form and the other in general form. Rewrite the general-form equation in slope–intercept form.',
        shared: function (r) { return { a: mixSys(r, 'a'), b: mixSys(r, 'b'), c: mixSys(r, 'c') }; },
        parts: ['a', 'b', 'c'].map(function (k) {
          return { id: 'e1' + k, level: 'EMG', outcome: 'RF7', make: function (r, sh) {
            var s = sh[k], L2 = s.L2, A = L2.A, B = L2.B, C = L2.C;
            var p = K.P.line('(' + k + ') ' + t(s.n1) + ', \\(\\;\\) ' + t(s.n2) + '<br>Rewrite ' + t(s.n2) + ' in slope–intercept form.', L2, { form: 'slope-intercept', wrong: [{ is: line(A * B, B, C), code: 'u8-nodiv', hint: 'Divide <b>every</b> term by ' + t(B) + ' — the constant too.' }].filter(function (w) { return Math.abs(B) !== 1; }) },
              t(s.n2) + '<br>' + t(T([[B, 'y']]) + '=' + T([[-A, 'x'], [-C, '']])) + '<br>' + t(si(L2)) + '.<br>First line: ' + t('m=' + nT(s.m1)) + ', ' + t('b=' + s.b1) + '. Second line: ' + t('m=' + nT(s.m2)) + ', ' + t('b=' + s.b2) + '.',
              ['Keep the ' + t('y') + '-term on one side, move the rest across, then divide every term by the coefficient of ' + t('y') + '.'], 'general to y=mx+b');
            p.bad = Math.abs(B) !== 1 ? [si(line(A * B, B, C))] : [];
            return p;
          } };
        }) },
      { num: '2', stem: 'Graph both lines of each system on the grid. State the solution as an ordered pair, and verify it by substituting into both original equations.',
        shared: function (r) { return { a: mixSys(r, 'a'), b: mixSys(r, 'b'), c: mixSys(r, 'c') }; },
        parts: [].concat.apply([], ['a', 'b', 'c'].map(function (k) {
          return [{ id: 'e2' + k, sub: k + ' graph', level: 'PRG', make: function (r, sh) {
            var s = sh[k];
            return sysGraph('(' + k + ') ' + t(s.n1) + ', \\(\\;\\) ' + t(s.n2) + '<br>Graph both lines.', [s.L1, s.L2], [s.n1, s.n2], W7, {},
              t(s.n2) + ' rearranges to ' + t(si(s.L2)) + '.<br>' + t(s.n1) + ': start at ' + ptt([0, s.b1]) + ', slope ' + t(nT(s.m1)) + '. ' + t(si(s.L2)) + ': ' + (Math.abs(s.b2) <= 7 ? 'start at ' + ptt([0, s.b2]) : 'use the points ' + latS(s.L2, W7).slice(0, 2).map(ptt).join(' and ')) + ', slope ' + t(nT(s.m2)) + '.<br>The lines cross at ' + ptt([s.x0, s.y0]) + '.',
              ['Rearrange the general-form equation into ' + t('y=mx+b') + ' first.', 'Plot the ' + t('y') + '-intercept, then use rise over run.'], 'graph mixed-form system');
          } }, { id: 'e2' + k + '2', sub: k + ' solution', level: 'BEG', make: function (r, sh) {
            var s = sh[k];
            return pointPart('(' + k + ') ' + t(s.n1) + ', \\(\\;\\) ' + t(s.n2) + '<br>State the solution as an ordered pair.', [s.x0, s.y0], [s.L1, s.L2], {},
              'The lines cross at ' + ptt([s.x0, s.y0]) + '.<br>In ' + t(s.n1) + ': ' + t(subT([[s.m1, 'x'], [s.b1, '']], { x: s.x0 }) + '=' + s.y0) + ' ✓<br>In ' + t(s.n2) + ': ' + t(subT([[s.L2.A, 'x'], [s.L2.B, 'y'], [s.L2.C, '']], { x: s.x0, y: s.y0 }) + '=0') + ' ✓',
              ['Read the crossing point off your graph, then check it in both equations.'], 'solution mixed-form system');
          } }];
        })) },
      /* ---------- EP Part B: classifying without graphing ---------- */
      { num: '3', section: 'Extra practice B — Classifying a system without graphing',
        stem: 'For a line ' + t('Ax+By+C=0') + ' the slope is ' + t('-\\frac{A}{B}') + ' and the ' + t('y') + '-intercept is ' + t('-\\frac{C}{B}') + '. For each system, use them to decide whether it has one solution, no solution, or infinitely many solutions — and why.',
        parts: [
          { id: 'e3a', level: 'EMG', make: function (r) { var s = pick2(r, function (r) { return { a: r.int(1, 5), b: r.int(2, 7), c1: r.pick([10, -10, 6, -6, 4, 8, -8, 12, 3]), k: r.pick([2, 2, 3]), c2: r.pick([-15, -9, -5, 5, 7, 9, 15, -7, 11]) }; }, function (s) { return gcd(s.a, s.b) === 1 && s.c2 !== s.k * s.c1 && gcd(s.a, s.b) === 1; }); return ep3(r, 'a', [s.a, -s.b, s.c1], [s.k * s.a, -s.k * s.b, s.c2]); } },
          { id: 'e3b', level: 'EMG', make: function (r) { var s = pick2(r, function (r) { return { a: r.int(2, 5), b: r.int(2, 5), c: -r.int(6, 15), k: r.pick([3, 3, 2, 4]) }; }, function (s) { return gcd(s.a, s.b) === 1; }); return ep3(r, 'b', [s.a, s.b, s.c], [s.k * s.a, s.k * s.b, s.k * s.c]); } },
          { id: 'e3c', level: 'EMG', make: function (r) { var b = r.int(2, 7), c = r.pick([7, 7, 2, 3, 4, 5, 6, -3, -5]); return ep3(r, 'c', [1, -b, c], [b, -1, c], '<b>Infinitely many solutions</b> — both equations have the same constant ' + t(c) + '.'); } },
          { id: 'e3d', level: 'EMG', make: function (r) { var s = pick2(r, function (r) { return { a: r.int(3, 6), b: r.int(1, 3), c: -r.pick([8, 6, 9, 10, 4]), k: r.pick([3, 3, 2]) }; }, function (s) { return gcd(s.a, s.b) === 1; }); return ep3(r, 'd', [s.a, s.b, s.c], [s.k * s.a, s.k * s.b, s.k * s.c]); } },
          { id: 'e3e', level: 'EMG', make: function (r) { var s = pick2(r, function (r) { return { a: r.int(3, 7), b: r.int(2, 5), c: r.pick([21, 21, 6, 9, 12, 15, 18]) }; }, function (s) { return gcd(s.a, s.b) === 1; }); return ep3(r, 'e', [s.a, -s.b, s.c], [2 * s.a, -2 * s.b, s.c], '<b>Infinitely many solutions</b> — the second equation is the first one doubled.'); } },
          { id: 'e3f', level: 'EMG', make: function (r) { var s = pick2(r, function (r) { return { a: r.int(2, 9), b: r.int(2, 9), c: r.pick([18, 18, 6, 12, 24, 10]) }; }, function (s) { return s.a !== s.b && gcd(s.a, s.b) === 1; }); return ep3(r, 'f', [s.a, s.b, -s.c], [s.b, s.a, -s.c]); } }] },
      { num: '4', shared: function (r) {
          var s = pick2(r, function (r) { return { a: r.pick([2, 2, 3, 4]), b: r.pick([5, 5, 3, 7]), b4: r.pick([3, 3, 2, 4, 6]), x0: r.pick([-9, -9, -6, -3, 3, 6, -5, 5]), y0: r.pick([-3, -3, -2, -1, 1, 2, 3]), k: r.pick([3, 3, 2]) }; },
            function (s) { var c = -(s.a * s.x0 - s.b * s.y0), c4 = -(s.a * s.x0 - s.b4 * s.y0); return gcd(s.a, s.b) === 1 && gcd(s.a, s.b4) === 1 && s.b4 !== s.b && c !== 0 && c4 !== 0 && Math.abs(c) <= 30 && Math.abs(c4) <= 30; });
          s.c = -(s.a * s.x0 - s.b * s.y0); s.c4 = -(s.a * s.x0 - s.b4 * s.y0);
          s.R1 = [s.k * s.a, -s.k * s.b, s.k * s.c]; s.R2 = [s.a, -s.b, s.c]; s.R3 = [s.k * s.a, -s.k * s.b, s.c]; s.R4 = [s.a, -s.b4, s.c4];
          s.L = [s.R1, s.R2, s.R3, s.R4].map(function (R) { return line(R[0], R[1], R[2]); });
          s.n = [s.R1, s.R2, s.R3, s.R4].map(rawG);
          return s;
        },
        stem: function (sh) { return 'Four lines are given in general form:<br>' + sh.n.map(function (n, i) { return t('\\ell_' + (i + 1) + ':\\ ' + n); }).join('<br>'); },
        parts: [
          { id: 'e4a', sub: 'a i', level: 'BEG', make: function (r, sh) {
            return mc(r, 'Two of these four equations look different but describe the <b>same line</b>. Which two?', [
              { html: t('\\ell_1') + ' and ' + t('\\ell_2'), right: true },
              { html: t('\\ell_1') + ' and ' + t('\\ell_3'), why: 'The ' + t('x') + '- and ' + t('y') + '-terms match, but the constants ' + t(sh.R1[2]) + ' and ' + t(sh.R3[2]) + ' differ: parallel lines, not the same line.', code: 'l13' },
              { html: t('\\ell_2') + ' and ' + t('\\ell_4'), why: 'The ' + t('y') + '-coefficients ' + t(-sh.b) + ' and ' + t(-sh.b4) + ' differ while the ' + t('x') + '-coefficients match: different slopes.', code: 'l24' },
              { html: t('\\ell_2') + ' and ' + t('\\ell_3'), why: 'Multiplying ' + t('\\ell_2') + ' by ' + t(sh.k) + ' gives the constant ' + t(sh.k * sh.c) + ', not ' + t(sh.c) + '.', code: 'l23' }],
              'Multiply ' + t('\\ell_2') + ' by ' + t(sh.k) + ': ' + t(sh.k + '(' + sh.n[1].replace('=0', '') + ')=' + sh.n[0].replace('=0', '')) + ' — exactly ' + t('\\ell_1') + '. Every coefficient <b>and</b> the constant scale by the same multiplier, so ' + t('\\ell_1') + ' and ' + t('\\ell_2') + ' are one line.',
              ['Look for one equation that is a multiple of another — every term, the constant too.'], 'which pair same line');
          } },
          { id: 'e4a2', sub: 'a ii', level: 'BEG', make: function (r, sh) {
            var k = sh.k, base = K.value(k), inv = K.value(1 / k);
            var check = function (resp) { var a = base(resp); if (a.v === 'correct') return a; if (inv(resp).v === 'correct') return ok(); return a; };
            var p = K.P.math(t('\\ell_1') + ' and ' + t('\\ell_2') + ' describe the same line. State the multiplier that turns ' + t('\\ell_2') + ' into ' + t('\\ell_1') + '.', check, String(k),
              t(k + '(' + sh.n[1].replace('=0', '') + ')=' + sh.n[0].replace('=0', '')) + ': the multiplier is ' + t(k) + '. (Going the other way, ' + t('\\ell_1') + ' times ' + t('\\frac{1}{' + k + '}') + ' gives ' + t('\\ell_2') + '.)',
              ['Divide a coefficient of ' + t('\\ell_1') + ' by the matching coefficient of ' + t('\\ell_2') + '.'], 'multiplier', { keys: 'fraction' });
            p.good = ['\\frac{1}{' + k + '}']; p.bad = [String(k + 1)];
            return p;
          } },
          { id: 'e4b', sub: 'b', level: 'EMG', make: function (r, sh) {
            return classMC(r, t('\\ell_1') + ' and ' + t('\\ell_3') + ' differ in one number only. Classify the system formed by ' + t('\\ell_1') + ' and ' + t('\\ell_3') + '.', 'none', clsD(sh.L[0], sh.L[2]), abSol(sh.R1, sh.R3, '\\ell_1', '\\ell_3'), ['Use ' + t('-\\frac{A}{B}') + ' and ' + t('-\\frac{C}{B}') + ' for each line.'], 'classify l1 l3');
          } },
          { id: 'e4c', sub: 'c', level: 'PRG', make: function (r, sh) {
            return pointPart(t('\\ell_2') + ' and ' + t('\\ell_4') + ' also look almost alike. Classify the system they form; if it has one solution, find it.', [sh.x0, sh.y0], [sh.L[1], sh.L[3]], {},
              'Slopes: ' + t('\\ell_2') + ': ' + t('-\\frac{' + sh.a + '}{' + (-sh.b) + '}=' + fT(fr(sh.a, sh.b))) + '; ' + t('\\ell_4') + ': ' + t('-\\frac{' + sh.a + '}{' + (-sh.b4) + '}=' + fT(fr(sh.a, sh.b4))) + '. Different, so <b>one solution</b>.<br>' +
              'Subtract the equations (the ' + t('x') + '-terms cancel): ' + t('(' + (-sh.b) + '+' + sh.b4 + ')y+(' + sh.c + '-' + par(sh.c4) + ')=0') + ', so ' + t(T([[sh.b4 - sh.b, 'y']]) + '=' + (sh.c4 - sh.c)) + ' and ' + t('y=' + sh.y0) + '.<br>' +
              'Then ' + t(T([[sh.a, 'x']]) + '-' + F(sh.b) + '(' + nT(sh.y0) + ')' + (sh.c < 0 ? '-' : '+') + F(Math.abs(sh.c)) + '=0') + ' gives ' + t('x=' + sh.x0) + '. Solution ' + ptt([sh.x0, sh.y0]) + '.<br>Check: ' + t(subT([[sh.a, 'x'], [-sh.b4, 'y'], [sh.c4, '']], { x: sh.x0, y: sh.y0 }) + '=0') + ' ✓',
              ['Compare slopes first. If they differ, find the crossing point.', 'The ' + t('x') + '-terms are the same: subtracting one equation from the other leaves only ' + t('y') + '.'], 'solve l2 l4');
          } },
          { id: 'e4d', sub: 'd', level: 'EMG', make: function (r) {
            return mc(r, 'What must you check — and in what order — to tell a pair of equations that is <b>one line written twice</b> from a pair that is <b>two parallel lines</b>?', [
              { html: 'First compare the slopes ' + t('-\\frac{A}{B}') + '. If they are equal, compare the ' + t('y') + '-intercepts ' + t('-\\frac{C}{B}') + ': equal means the same line, different means parallel lines.', right: true },
              { html: 'Compare the constant terms ' + t('C') + ': if they are equal it is the same line, otherwise the lines are parallel.', why: 'Equal-looking constants can still be different lines (and the same line can be written with different constants, e.g. after multiplying by 3). Compare slopes, then intercepts.', code: 'const' },
              { html: 'Compare only the slopes: equal slopes mean the same line.', why: 'Equal slopes mean parallel <b>or</b> the same line — the intercepts decide which.', code: 'slopes' },
              { html: 'First compare the ' + t('y') + '-intercepts; if they differ, the system has one solution.', why: 'Lines with the same slope and different intercepts never meet. Start with the slopes.', code: 'order' }],
              'Compare the slopes ' + t('-\\frac{A}{B}') + ' first: if they differ there is one solution and nothing else to check. If they are equal, compare the ' + t('y') + '-intercepts ' + t('-\\frac{C}{B}') + ': equal → one line written twice (one equation is a multiple of the other); different → parallel lines, no solution.',
              ['Which number tells you whether the lines are parallel?'], 'order of checks');
          } }] },
      /* ---------- EP Part C: unknown coefficients ---------- */
      { num: '5', section: 'Extra practice C — Solving for an unknown coefficient',
        shared: function (r) {
          var s = pick2(r, function (r) { return { p: r.pick([3, 3, 2, 5]), q: r.pick([4, 4, 3, 5, 7]), r0: r.pick([20, 20, 10, 15, 30, 14]), m: r.pick([2, 2, 3]), s: r.pick([12, 12, 8, 9, 6, 10]) }; }, function (s) { return gcd(s.p, s.q) === 1 && s.s !== s.r0 && s.p !== s.q; });
          s.e1 = T([[1, 'kx'], [s.q, 'y'], [-s.s, '']]) + '=0'; s.e2 = rawG([s.m * s.p, s.m * s.q, -s.m * s.r0]); s.L2 = line(s.p, s.q, -s.r0);
          return s;
        },
        stem: function (sh) { return 'Consider the system ' + t(sh.e1) + ' and ' + t(sh.e2) + '.'; },
        parts: [
          { id: 'e5a', sub: 'a', level: 'ADV', make: function (r, sh) {
            var k = sh.p, flip = sh.q * sh.q / sh.p;
            return K.P.number('Determine the value of ' + t('k') + ' for which the system has <b>no solution</b>.', k, function (v) {
              if (v === sh.m * sh.p) return { code: 'u8-k-xcoef', hint: 'Matching the ' + t('x') + '-coefficients isn’t enough: the ' + t('y') + '-coefficients are ' + t(sh.q) + ' and ' + t(sh.m * sh.q) + '. Set the <b>slopes</b> ' + t('-\\frac{k}{' + sh.q + '}') + ' and ' + t('-\\frac{' + sh.m * sh.p + '}{' + sh.m * sh.q + '}') + ' equal.' };
              if (v === -k) return { code: 'u8-k-sign', hint: 'Check the signs: ' + t('-\\frac{k}{' + sh.q + '}=-\\frac{' + sh.p + '}{' + sh.q + '}') + '.' };
              if (Math.abs(v - flip) < 1e-9) return { code: 'u8-k-flip', hint: 'The slope is ' + t('-\\frac{A}{B}') + ' — the ' + t('x') + '-coefficient on top.' };
              return null; },
              'Slopes: ' + t('-\\frac{k}{' + sh.q + '}') + ' and ' + t('-\\frac{' + sh.m * sh.p + '}{' + sh.m * sh.q + '}=' + fT(fr(-sh.p, sh.q))) + '. Equal slopes: ' + t('k=' + k) + '.<br>Check: ' + t(rawG([k, sh.q, -sh.s])) + ' gives ' + t(si(line(k, sh.q, -sh.s))) + ', and ' + t(sh.e2) + ' gives ' + t(si(sh.L2)) + ': same slope, different ' + t('y') + '-intercepts — parallel, <b>no solution</b>.',
              ['No solution: equal slopes, different ' + t('y') + '-intercepts.', 'Write each slope as ' + t('-\\frac{A}{B}') + '.'], 'k for no solution');
          } },
          { id: 'e5b', sub: 'b', level: 'PRG', make: function (r, sh) {
            var half = fr(1, sh.m), need = -sh.r0, have = -sh.s;
            return mc(r, 'Which explanation shows that <b>no</b> value of ' + t('k') + ' gives infinitely many solutions?', [
              { html: 'For the same line, every term of the first equation must be the same multiple of the second. The ' + t('y') + '-terms fix that multiplier at ' + t(fT(half)) + ', so the constant would have to be ' + t(need) + ' — but it is ' + t(have) + '. The <b>constant condition fails</b>, and ' + t('k') + ' can’t change it.', right: true },
              { html: t('k=' + sh.p) + ' works: then the slopes are equal, so the lines are the same.', why: 'Equal slopes alone give parallel lines or the same line. With ' + t('k=' + sh.p) + ' the ' + t('y') + '-intercepts are ' + t(nT(fr(sh.s, sh.q))) + ' and ' + t(nT(fr(sh.r0, sh.q))) + ' — different, so parallel.', code: 'slope' },
              { html: t('k=' + sh.m * sh.p) + ' works: then the ' + t('x') + '-coefficients are equal.', why: 'With equal ' + t('x') + '-coefficients but ' + t('y') + '-coefficients ' + t(sh.q) + ' and ' + t(sh.m * sh.q) + ', the equations aren’t multiples of each other — and the slopes differ.', code: 'xco' },
              { html: 'The <b>slope</b> condition fails: no value of ' + t('k') + ' makes the slopes equal.', why: t('k=' + sh.p) + ' does make the slopes equal (part a). It is the constants that can’t be matched.', code: 'slopefail' }],
              'Infinitely many needs the same line: every coefficient <b>and</b> the constant scaled by one multiplier. The ' + t('y') + '-terms give ' + t('\\frac{' + sh.q + '}{' + sh.m * sh.q + '}=' + fT(half)) + '; then the constant would need to be ' + t(fT(half) + '\\times(' + (-sh.m * sh.r0) + ')=' + need) + ', but it is ' + t(have) + '. No choice of ' + t('k') + ' changes a constant, so no value works.',
              ['Infinitely many solutions needs two conditions: matching slopes <b>and</b> matching constants.'], 'why no k for inf');
          } },
          { id: 'e5c', sub: 'c', level: 'EMG', make: function (r, sh) {
            var k = sh.p;
            return mc(r, 'State the values of ' + t('k') + ' for which the system has exactly one solution.', [
              { html: 'every real number except ' + t('k=' + k), right: true },
              { html: 'only ' + t('k=' + k), why: t('k=' + k) + ' makes the slopes equal — that gives parallel lines (no solution).', code: 'only' },
              { html: 'every real number ' + t('k'), why: 'One value of ' + t('k') + ' makes the slopes equal, and then the lines are parallel.', code: 'all' },
              { html: 'every real number except ' + t('k=' + sh.m * sh.p), why: t('k=' + sh.m * sh.p) + ' gives slope ' + t(fT(fr(-sh.m * sh.p, sh.q))) + ', different from ' + t(fT(fr(-sh.p, sh.q))) + ': one solution.', code: 'xco' }],
              'One solution means different slopes: ' + t('-\\frac{k}{' + sh.q + '}\\ne' + fT(fr(-sh.p, sh.q))) + ', i.e. ' + t('k\\ne ' + k) + '. So ' + t('k\\in\\mathbb{R},\\ k\\ne ' + k) + '.',
              ['Which value of ' + t('k') + ' makes the slopes equal?'], 'k for one solution');
          } }] },
      { num: '6', shared: function (r) {
          var s = pick2(r, function (r) { return { a: r.pick([2, 2, 3, 4]), b: r.pick([5, 5, 3, 7]), c: r.pick([8, 8, 4, 5, 6, 7, 9]), m: r.pick([3, 3, 2, 4]) }; }, function (s) { return gcd(s.a, s.b) === 1 && gcd(gcd(s.a, s.b), s.c) === 1; });
          s.e1 = rawG([s.a, -s.b, s.c]); s.e2 = T([[s.m * s.a, 'x'], [1, 'ky'], [s.m * s.c, '']]) + '=0'; s.k = -s.m * s.b;
          return s;
        },
        stem: function (sh) { return 'Consider the system ' + t(sh.e1) + ' and ' + t(sh.e2) + '.'; },
        parts: [
          { id: 'e6a', sub: 'a', level: 'ADV', make: function (r, sh) {
            var mult = K.value(sh.m), multI = K.value(1 / sh.m);
            var ck = K.number(sh.k, function (v) { if (v === -sh.k) return { code: 'u8-k-sign', hint: 'Check the sign: ' + t(sh.m + '\\times(' + (-sh.b) + ')=' + sh.k) + '.' }; if (v === -sh.b) return { code: 'u8-k-ycoef', hint: 'Multiply the ' + t('y') + '-coefficient ' + t(-sh.b) + ' by the multiplier too.' }; return null; });
            var cm = function (resp) { var a = mult(resp); if (a.v === 'correct' || multI(resp).v === 'correct') return ok(); return a.v === 'form' ? a : wrong('u8-mult', 'The ' + t('x') + '-terms fix the multiplier: ' + t('\\frac{' + sh.m * sh.a + '}{' + sh.a + '}') + '.'); };
            var p = K.P.fields('Determine the value of ' + t('k') + ' for which the system has <b>infinitely many solutions</b>, and state the multiplier that links the two equations.', [{ label: t('k=') }, { label: 'multiplier:' }], [ck, cm], [String(sh.k), String(sh.m)], t('k=' + sh.k) + ', multiplier ' + t(sh.m),
              'The ' + t('x') + '-terms fix the multiplier: ' + t('\\frac{' + sh.m * sh.a + '}{' + sh.a + '}=' + sh.m) + '.<br>' + t(sh.m + '(' + sh.e1.replace('=0', '') + ')=' + rawG([sh.m * sh.a, sh.k, sh.m * sh.c]).replace('=0', '')) + '.<br>Matching term by term: ' + t('k=' + sh.k) + ', and the constant ' + t(sh.m + '(' + sh.c + ')=' + sh.m * sh.c) + ' already agrees. Multiplier ' + t(sh.m) + ': the same line.',
              ['Which multiplier turns ' + t(sh.a + 'x') + ' into ' + t(sh.m * sh.a + 'x') + '?', 'Apply the same multiplier to the ' + t('y') + '-term.'], 'k for inf + multiplier');
            p.bad = [[String(-sh.k), String(sh.m)]];
            return p;
          } },
          { id: 'e6b', sub: 'b', level: 'EMG', make: function (r, sh) {
            var yi = fT(fr(sh.c, sh.b));
            return mc(r, 'Why can’t that same value ' + t('k=' + sh.k) + ' give <b>no solution</b>?', [
              { html: 'With ' + t('k=' + sh.k) + ' the second equation is exactly ' + t(sh.m) + ' times the first, constants included (' + t(sh.m + '\\times' + sh.c + '=' + sh.m * sh.c) + '), so the ' + t('y') + '-intercepts are equal (' + t(yi) + '): the same line, not parallel lines.', right: true },
              { html: 'With ' + t('k=' + sh.k) + ' the slopes are different, so the lines cross once.', why: 'With ' + t('k=' + sh.k) + ' both slopes are ' + t(fT(fr(sh.a, sh.b))) + ' — equal.', code: 'slopes' },
              { html: 'The constants ' + t(sh.c) + ' and ' + t(sh.m * sh.c) + ' are different, so the lines are parallel.', why: 'The constants differ only because the whole equation was multiplied by ' + t(sh.m) + '. The ' + t('y') + '-intercepts ' + t('-\\frac{C}{B}') + ' are both ' + t(yi) + '.', code: 'const' },
              { html: 'No solution needs different slopes.', why: 'No solution needs <b>equal</b> slopes and <b>different</b> intercepts.', code: 'rule' }],
              t('y') + '-intercepts: ' + t('-\\frac{' + sh.c + '}{' + (-sh.b) + '}=' + yi) + ' and ' + t('-\\frac{' + sh.m * sh.c + '}{' + sh.k + '}=' + yi) + ' — equal. No solution needs equal slopes <b>and different</b> intercepts; here the intercepts match, so the system has infinitely many solutions.',
              ['Compare the ' + t('y') + '-intercepts ' + t('-\\frac{C}{B}') + ' when ' + t('k=' + sh.k) + '.'], 'why not no solution');
          } },
          { id: 'e6c', sub: 'c', level: 'EMG', make: function (r, sh) {
            var mc0 = sh.m * sh.c, opts = [mc0, mc0 + 2 * sh.m, mc0 - sh.m, mc0 + 1, 2 * mc0].sort(function (a, b) { return a - b; }), want = opts.filter(function (v) { return v !== mc0; });
            return { prompt: 'Which numbers could replace the constant ' + t(mc0) + ' in the second equation so that the system has <b>no solution</b> when ' + t('k=' + sh.k) + '? Select all that work.', input: { type: 'select', options: opts }, key: want, answer: t(want.join(',\\ ')) + ' — every number except ' + t(mc0),
              check: K.selectSet(want, function (extra, missing) { if (extra.indexOf(mc0) >= 0) return { code: 'u8-same-const', hint: 'With ' + t(mc0) + ' the second equation is ' + t(sh.m) + ' times the first — the same line (infinitely many solutions).' }; return { code: 'u8-const-miss', hint: 'With ' + t('k=' + sh.k) + ' the slopes are equal, so <b>any</b> constant that breaks the multiple gives parallel lines. Which ones did you leave out?' }; }),
              solution: 'With ' + t('k=' + sh.k) + ' the slopes are equal, so the system has no solution exactly when the lines are <b>not</b> the same: every constant except ' + t(mc0) + '.<br>E.g. ' + t(mc0 + 2 * sh.m) + ': ' + t(rawG([sh.m * sh.a, sh.k, mc0 + 2 * sh.m])) + ' divided by ' + t(sh.m) + ' is ' + t(rawG([sh.a, -sh.b, sh.c + 2])) + ' — same slope, different intercept, so parallel lines.',
              hints: ['Keep the slopes equal; the constant must break the multiple.'], text: 'replace constant for no solution', tries: 2, bad: [opts, [mc0], want.slice(1)] };
          } }] },
      { num: '7', shared: function (r) {
          var s = pick2(r, function (r) { return { a: r.pick([2, 2, 3]), b: r.pick([3, 3, 4, 5]), m: r.pick([3, 3, 2, 4]), c: r.pick([7, 7, 5, 6, 8, 9]) }; }, function (s) { return gcd(s.a, s.b) === 1; });
          s.e1 = T([[s.m * s.a, 'x'], [1, 'ky'], [s.m * s.c, '']]) + '=0'; s.e2 = T([[s.a, 'x'], [-s.b, 'y'], [1, 'c']]) + '=0'; s.k = -s.m * s.b;
          return s;
        },
        stem: function (sh) { return 'Consider the system ' + t(sh.e1) + ' and ' + t(sh.e2) + ', where ' + t('k') + ' and ' + t('c') + ' are constants.'; },
        parts: [
          { id: 'e7a', sub: 'a', level: 'ADV', make: function (r, sh) {
            var ck = K.number(sh.k, function (v) { if (v === -sh.k) return { code: 'u8-k-sign', hint: 'Check the sign: ' + t(sh.m + '\\times(' + (-sh.b) + ')') + '.' }; return null; });
            var cc = K.number(sh.c, function (v) { if (v === sh.m * sh.m * sh.c) return { code: 'u8-c-mult', hint: 'The first equation is ' + t(sh.m) + ' times the second, so ' + t(sh.m + 'c=' + sh.m * sh.c) + ': <b>divide</b> by ' + t(sh.m) + '.' }; if (v === -sh.c) return { code: 'u8-c-sign', hint: 'Check the sign of ' + t('c') + '.' }; return null; });
            var p = K.P.fields('Determine the values of ' + t('k') + ' and ' + t('c') + ' for which the system has infinitely many solutions.', [{ label: t('k=') }, { label: t('c=') }], [ck, cc], [String(sh.k), String(sh.c)], t('k=' + sh.k) + ', ' + t('c=' + sh.c),
              'The ' + t('x') + '-terms fix the multiplier: ' + t('\\frac{' + sh.m * sh.a + '}{' + sh.a + '}=' + sh.m) + '. ' + t(sh.m + '(' + sh.e2.replace('=0', '') + ')=' + T([[sh.m * sh.a, 'x'], [-sh.m * sh.b, 'y'], [sh.m, 'c']])) + '.<br>Match the ' + t('y') + '-terms: ' + t('k=' + sh.m + '(' + (-sh.b) + ')=' + sh.k) + '. Match the constants: ' + t(sh.m + 'c=' + sh.m * sh.c) + ', so ' + t('c=' + sh.c) + '.',
              ['One equation must be a multiple of the other: find the multiplier from the ' + t('x') + '-terms.'], 'k and c for inf');
            p.bad = [[String(sh.k), String(sh.m * sh.m * sh.c)], [String(-sh.k), String(sh.c)]];
            return p;
          } },
          { id: 'e7b', sub: 'b', level: 'PRG', make: function (r, sh) {
            return mc(r, 'Which statement gives the values of ' + t('k') + ' and ' + t('c') + ' for no solution, and for exactly one solution?', [
              { html: 'No solution: ' + t('k=' + sh.k) + ' and ' + t('c\\ne ' + sh.c) + '. One solution: ' + t('k\\ne ' + sh.k) + ', with ' + t('c') + ' any number.', right: true },
              { html: 'No solution: ' + t('k\\ne ' + sh.k) + '. One solution: ' + t('k=' + sh.k) + ' and ' + t('c\\ne ' + sh.c) + '.', why: 'These are switched: with ' + t('k=' + sh.k) + ' the slopes are equal, which is what no solution needs.', code: 'swap' },
              { html: 'No solution: ' + t('k=' + sh.k) + ' and ' + t('c=' + sh.c) + '. One solution: ' + t('k\\ne ' + sh.k) + '.', why: 'With ' + t('k=' + sh.k) + ' and ' + t('c=' + sh.c) + ' the equations are the same line (infinitely many).', code: 'same' },
              { html: 'No solution: ' + t('c\\ne ' + sh.c) + ', with ' + t('k') + ' any number. One solution: ' + t('c=' + sh.c) + '.', why: 'The constant only matters once the slopes are equal. If ' + t('k\\ne ' + sh.k) + ' the slopes differ and there is one solution whatever ' + t('c') + ' is.', code: 'conly' }],
              '<b>No solution:</b> equal slopes (' + t('k=' + sh.k) + ', both slopes ' + t(fT(fr(sh.a, sh.b))) + ') and different intercepts (' + t('c\\ne ' + sh.c) + ').<br><b>One solution:</b> different slopes, ' + t('k\\ne ' + sh.k) + ' — then ' + t('c') + ' can be anything.',
              ['First decide what makes the slopes equal; the constant matters only then.'], 'k, c for none/one');
          } }] },
      /* ---------- EP Part D: off-lattice intersections ---------- */
      { num: '8', section: 'Extra practice D — When the intersection misses the lattice points',
        shared: function (r) {
          var s = pick2(r, function (r) { var sg = r.pick([1, 1, -1]); return { sg: sg, m1: [-sg, 2], m2: [3 * sg, 2], b1: r.int(-4, 4), b2: r.int(-4, 4) }; },
            function (s) { var d = s.b1 - s.b2; if (Math.abs(d) % 2 !== 1) return false; var x = d / (2 * s.sg), y = fv(s.m1) * x + s.b1; return Math.abs(x) <= 4.5 && Math.abs(y) <= 5 && latS(mbL(s.m1, s.b1), W6).length >= 2 && latS(mbL(s.m2, s.b2), W6).length >= 2; });
          s.L1 = mbL(s.m1, s.b1); s.L2 = mbL(s.m2, s.b2); s.n1 = 'y=' + T([[s.m1, 'x'], [s.b1, '']]); s.n2 = gen(s.L2);
          s.P = inter(s.L1, s.L2); s.X = fv(s.P[0]); s.Y = fv(s.P[1]); s.est = [s.X, Math.round(s.Y * 2) / 2];
          return s;
        },
        stem: function (sh) { return 'Consider the system ' + t(sh.n1) + ' and ' + t(sh.n2) + '.'; },
        parts: [
          { id: 'e8a', sub: 'a i', level: 'BEG', outcome: 'RF7', make: function (r, sh) {
            var L2 = sh.L2;
            var p = K.P.line('Rearrange ' + t(sh.n2) + ' into slope–intercept form.', L2, { form: 'slope-intercept', wrong: [{ is: line(L2.A * L2.B, L2.B, L2.C), code: 'u8-nodiv', hint: 'Divide <b>every</b> term by ' + t(L2.B) + '.' }] },
              t(sh.n2) + '<br>' + t(T([[L2.B, 'y']]) + '=' + T([[-L2.A, 'x'], [-L2.C, '']])) + '<br>' + t(si(L2)), ['Move the ' + t('x') + '-term and the constant across, then divide by the coefficient of ' + t('y') + '.'], 'rearrange');
            p.bad = [si(line(L2.A * L2.B, L2.B, L2.C))]; return p;
          } },
          { id: 'e8a2', sub: 'a graph', level: 'EMG', make: function (r, sh) {
            return sysGraph('Graph both lines.', [sh.L1, sh.L2], [sh.n1, sh.n2], W6, {},
              t(sh.n1) + ': start at ' + ptt([0, sh.b1]) + ', slope ' + t(fT(sh.m1)) + '. ' + t(si(sh.L2)) + ': start at ' + ptt([0, sh.b2]) + ', slope ' + t(fT(fr(sh.m2[0], sh.m2[1]))) + '.<br>The lines cross between grid points, near ' + t('(' + sh.est[0] + ',\\ ' + sh.est[1] + ')') + '.',
              ['Rearrange the second equation first.', 'Plot each ' + t('y') + '-intercept, then use rise over run.'], 'graph off-lattice system');
          } },
          { id: 'e8b', sub: 'b estimate', level: 'EMG', make: function (r, sh) {
            var X = sh.X, Y = sh.Y, half = function (v) { return Math.abs(v * 2 - Math.round(v * 2)) < 1e-9; };
            var check = function (resp) {
              var rp = Ln.readPoint(resp); if (rp.empty) return form('empty', 'Type your answer first.');
              if (rp.bad || rp.kind !== 'pt') return form('pt-unreadable', 'Write your estimate as an ordered pair, e.g. ' + t('(1.5,\\ -2)') + '.');
              var x = rp.p[0].v, y = rp.p[1].v, near = function (a, b) { return Math.abs(a - b) <= 0.5 + 1e-9; };
              if (near(x, X) && near(y, Y)) { if (!half(x) || !half(y)) return form('u8-est-half', 'Close — the question asks for each coordinate to the <b>nearest half unit</b> (e.g. ' + t('2.5') + ' or ' + t('2') + ').'); return ok(); }
              if (near(y, X) && near(x, Y)) return wrong('pt-swap', 'Your coordinates are in the wrong order: ' + t('x') + ' first, then ' + t('y') + '.');
              return wrong('u8-est-far', 'Your estimate is too far from where the lines cross. Look again: the crossing is between ' + t('x=' + Math.floor(X)) + ' and ' + t('x=' + Math.ceil(X)) + (Number.isInteger(X) ? '' : '') + '.');
            };
            var key = '(' + sh.est[0] + ', ' + sh.est[1] + ')';
            return { prompt: 'Estimate the solution from your graph, reading each coordinate to the nearest half unit.', input: { type: 'math', keys: 'point', placeholder: 'e.g. (1.5, -2)' }, check: check, key: key, answer: t('(' + sh.est[0] + ',\\ ' + sh.est[1] + ')') + ' (any reading within half a unit of the crossing)',
              solution: 'The lines cross between grid lines: ' + t('x') + ' is about ' + t(sh.est[0]) + ' and ' + t('y') + ' between ' + t(Math.floor(Y)) + ' and ' + t(Math.ceil(Y)) + ', about ' + t(sh.est[1]) + '. Estimate: ' + t('(' + sh.est[0] + ',\\ ' + sh.est[1] + ')') + '.', hints: ['Zoom in on the crossing: which grid lines is it between?'], text: 'estimate off-lattice solution',
              good: [key, '(' + sh.est[0] + ', ' + (sh.est[1] + (Y > sh.est[1] ? 0.5 : -0.5)) + ')'].filter(function (g) { var rp = Ln.readPoint(g); return Math.abs(rp.p[1].v - Y) <= 0.5 + 1e-9; }), bad: ['(' + sh.est[1] + ', ' + sh.est[0] + ')', '(' + (sh.est[0] + 2) + ', ' + sh.est[1] + ')', '(' + pS(sh.P[0]) + ', ' + pS(sh.P[1]) + ')'].filter(function (b) { return check(b).v !== 'correct'; }) };
          } },
          { id: 'e8b2', sub: 'b why', level: 'LIM', make: function (r) {
            return mc(r, 'Why does reading this system’s crossing point off a hand-drawn graph give only an estimate, not the solution?', [
              { html: 'The lines cross between grid lines, so the coordinates have to be judged by eye.', right: true },
              { html: 'Every solution read from a hand-drawn graph is only an estimate.', why: 'When the lines cross exactly on a grid point (as in most systems in this lesson), the graph gives the exact solution.', code: 'all' },
              { html: 'The lines don’t really cross; they only come close.', why: 'The slopes are different, so the lines do cross — just not on a grid point.', code: 'nocross' },
              { html: 'A system with fraction slopes has no exact solution.', why: 'Every system with different slopes has one exact solution; here it is a pair of fractions.', code: 'frac' }],
              'The crossing point is not on a grid intersection, so at least one coordinate is judged by eye between ruled lines. Lessons 2 and 3 find exact values with algebra.', ['Where exactly do the lines cross on the grid?'], 'why estimate');
          } },
          { id: 'e8c', sub: 'c', level: 'BEG', make: function (r, sh) {
            var e = sh.est, L2 = sh.L2, v1 = fv(sh.m1) * e[0] + sh.b1, v2 = L2.A * e[0] + L2.B * e[1] + L2.C;
            return valFields('A student’s estimate is ' + t('(' + e[0] + ',\\ ' + e[1] + ')') + '. Substitute it into both original equations.', [t(T([[sh.m1, 'x'], [sh.b1, '']])) + ' at ' + t('x=' + e[0]) + ' is', t(gen(L2).replace('=0', '')) + ' at ' + t('(' + e[0] + ',\\ ' + e[1] + ')') + ' is'], [Ln.toFr(v1), Ln.toFr(v2)],
              'In ' + t(sh.n1) + ': ' + t(subT([[sh.m1, 'x'], [sh.b1, '']], { x: e[0] }) + '=' + nT(v1)) + ' ' + t('\\ne ' + e[1]) + ' ✗<br>In ' + t(sh.n2) + ': ' + t(subT([[L2.A, 'x'], [L2.B, 'y'], [L2.C, '']], { x: e[0], y: e[1] }) + '=' + nT(v2)) + ' ' + t('\\ne 0') + ' ✗<br>The estimate fails both equations, so it is not the solution.',
              ['Substitute carefully; decimals or fractions are both fine.'], 'substitute estimate');
          } },
          { id: 'e8d', sub: 'd', level: 'BEG', make: function (r, sh) {
            var e = sh.est, d = Math.abs(e[1] - sh.Y), dF = Ln.toFr(d);
            var p = K.P.math('The exact solution is ' + ptt(sh.P) + '. How far is the estimate ' + t('(' + e[0] + ',\\ ' + e[1] + ')') + ' from it in the ' + t('y') + '-coordinate?', K.value(d), fT(dF),
              'In ' + t(sh.n1) + ': ' + t(subT([[sh.m1, 'x'], [sh.b1, '']], { x: sh.P[0] }) + '=' + fT(sh.P[1])) + ' ✓; it checks in ' + t(sh.n2) + ' too.<br>The estimate’s ' + t('x') + '-coordinate ' + t(e[0]) + ' is exact; its ' + t('y') + '-coordinate is off by ' + t('|' + e[1] + '-' + par(sh.P[1]) + '|=' + fT(dF)) + ' of a unit.',
              ['Subtract the two ' + t('y') + '-values.'], 'estimate error', { keys: 'fraction' });
            p.good = [String(d)]; p.bad = [String(d + 0.5)];
            return p;
          } }] },
      { num: '9', shared: function (r) {
          var s = pick2(r, function (r) { var ps = r.sample([2, -4, 1, -1, -2, 4, 5, -5], 2); return { p1: ps[0], p2: ps[1], b1: r.int(-4, 3), b2: r.int(-5, 3) }; },
            function (s) { if (s.p1 === s.p2) return false; var X = 3 * (s.b2 - s.b1) / (s.p1 - s.p2); if (!Number.isInteger(X) || X % 3 === 0 || Math.abs(X) > 5) return false; var Y = (s.p1 * X + 3 * s.b1) / 3; return Y >= -7 && Y <= 5 && latS(mbL([s.p1, 3], s.b1), [[-6, 6], [-8, 6]]).length >= 2 && latS(mbL([s.p2, 3], s.b2), [[-6, 6], [-8, 6]]).length >= 2; });
          s.m1 = [s.p1, 3]; s.L1 = mbL(s.m1, s.b1); s.L2 = mbL([s.p2, 3], s.b2); s.n1 = 'y=' + T([[s.m1, 'x'], [s.b1, '']]); s.n2 = gen(s.L2);
          s.P = inter(s.L1, s.L2); s.X = fv(s.P[0]); s.Y = fv(s.P[1]); s.win = [[-6, 6], [-8, 6]];
          return s;
        },
        stem: function (sh) { return 'Consider the system ' + t(sh.n1) + ' and ' + t(sh.n2) + '.'; },
        parts: [
          { id: 'e9a', sub: 'a i', level: 'EMG', outcome: 'RF7', make: function (r, sh) {
            var L2 = sh.L2;
            var p = K.P.line('Rearrange ' + t(sh.n2) + ' into slope–intercept form.', L2, { form: 'slope-intercept', wrong: [{ is: line(L2.A * L2.B, L2.B, L2.C), code: 'u8-nodiv', hint: 'Divide <b>every</b> term by ' + t(L2.B) + '.' }] },
              t(sh.n2) + '<br>' + t(T([[L2.B, 'y']]) + '=' + T([[-L2.A, 'x'], [-L2.C, '']])) + '<br>' + t(si(L2)), ['Move the ' + t('x') + '-term and the constant across, then divide by the coefficient of ' + t('y') + '.'], 'rearrange');
            p.bad = [si(line(L2.A * L2.B, L2.B, L2.C))]; return p;
          } },
          { id: 'e9a2', sub: 'a graph', level: 'EMG', make: function (r, sh) {
            return sysGraph('Graph both lines.', [sh.L1, sh.L2], [sh.n1, sh.n2], sh.win, {},
              t(sh.n1) + ' and ' + t(si(sh.L2)) + ': plot each ' + t('y') + '-intercept and step with the slope (both slopes are in thirds: run 3).<br>The lines cross on the grid line ' + t('x=' + sh.X) + ', between ' + t('y=' + Math.floor(sh.Y)) + ' and ' + t('y=' + Math.ceil(sh.Y)) + '.',
              ['Rearrange the second equation first.'], 'graph x-on-grid system');
          } },
          { id: 'e9b', sub: 'b', level: 'BEG', make: function (r, sh) {
            var X = sh.X, Y = sh.Y, lo = Math.floor(Y), hi = Math.ceil(Y), est = Math.round(Y * 10) / 10, Yr = Math.round(Y);
            return mc(r, 'One coordinate of the solution can be read exactly off the grid and the other cannot. Which statement is right?', [
              { html: t('x=' + X) + ' exactly (the lines cross on a grid line); ' + t('y') + ' is between ' + t(lo) + ' and ' + t(hi) + ', about ' + t(est) + '.', right: true },
              { html: t('y=' + Yr) + ' exactly; ' + t('x') + ' is between ' + t(X - 1) + ' and ' + t(X) + '.', why: 'The crossing lies on the <b>vertical</b> grid line ' + t('x=' + X) + ' — it is the ' + t('x') + '-coordinate that reads exactly.', code: 'swap' },
              { html: 'Both are exact: the solution is ' + ptt([X, Yr]) + '.', why: 'Substitute ' + t('x=' + X) + ' into ' + t(sh.n1) + ': ' + t('y=' + fT(sh.P[1])) + ', which is not a whole number.', code: 'both' },
              { html: 'Neither can be read exactly.', why: 'The lines cross on the grid line ' + t('x=' + X) + ', so ' + t('x') + ' reads exactly.', code: 'neither' }],
              'The lines cross on the vertical grid line ' + t('x=' + X) + ', so ' + t('x') + ' reads exactly. The ' + t('y') + '-coordinate falls between ' + t(lo) + ' and ' + t(hi) + ': best estimate ' + t('(' + X + ',\\ ' + est + ')') + '.',
              ['Is the crossing on a vertical grid line, a horizontal one, or neither?'], 'which coordinate exact');
          } },
          { id: 'e9c', sub: 'c', level: 'EMG', make: function (r, sh) {
            return mc(r, 'What feature of the two slopes makes the ' + t('x') + '-coordinate land on a grid line while the ' + t('y') + '-coordinate does not?', [
              { html: 'Both slopes have denominator 3. Setting the expressions equal and multiplying by 3 clears the thirds and gives a whole-number ' + t('x') + '; substituting back brings the thirds back into ' + t('y') + '.', right: true },
              { html: 'The slopes are negative reciprocals of each other.', why: 'Negative reciprocal slopes make the lines perpendicular; that has nothing to do with landing on a grid line (and these slopes multiply to ' + t(fT(fr(sh.p1 * sh.p2, 9))) + ').', code: 'perp' },
              { html: 'The ' + t('y') + '-intercepts are whole numbers, so ' + t('x') + ' must be whole.', why: 'Whole-number intercepts don’t force a whole-number crossing; the common denominator of the slopes is what clears.', code: 'int' },
              { html: 'One slope is positive and the other negative.', why: 'The signs of the slopes only decide which way the lines lean.', code: 'signs' }],
              t(T([[sh.m1, 'x'], [sh.b1, '']]) + '=' + T([[[sh.p2, 3], 'x'], [sh.b2, '']])) + '; multiply by 3: ' + t(T([[sh.p1, 'x'], [3 * sh.b1, '']]) + '=' + T([[sh.p2, 'x'], [3 * sh.b2, '']])) + ', so ' + t('x=' + sh.X) + ' — a whole number.<br>Substituting back: ' + t('y=' + subT([[sh.m1, 'x'], [sh.b1, '']], { x: sh.X }) + '=' + fT(sh.P[1])) + '. A whole-number ' + t('x') + ' does not force a whole-number ' + t('y') + '.',
              ['Look at the denominators of the slopes.'], 'why x lands on grid');
          } },
          { id: 'e9d', sub: 'd', level: 'BEG', make: function (r, sh) {
            var L2 = sh.L2;
            return valFields('Show that ' + ptt(sh.P) + ' satisfies both original equations: evaluate each expression.', [t(T([[sh.m1, 'x'], [sh.b1, '']])) + ' at ' + t('x=' + sh.X) + ' is', t(gen(L2).replace('=0', '')) + ' at ' + ptt(sh.P) + ' is'], [sh.P[1], [0, 1]],
              'In ' + t(sh.n1) + ': ' + t(subT([[sh.m1, 'x'], [sh.b1, '']], { x: sh.X }) + '=' + fT(sh.P[1])) + ' ✓<br>In ' + t(sh.n2) + ': ' + t(subT([[L2.A, 'x'], [L2.B, 'y'], [L2.C, '']], { x: sh.P[0], y: sh.P[1] }) + '=0') + ' ✓<br>The solution of the system is ' + ptt(sh.P) + '.',
              ['Use fractions — a rounded decimal won’t check exactly.'], 'verify fraction solution');
          } }] },
      /* ---------- EP Part E: break-even ---------- */
      { num: '10', section: 'Extra practice E — A break-even point read from a graph',
        shared: function (r) {
          var s = pick2(r, function (r) { return { F: r.pick([800, 800, 600, 1000, 1200, 400]), c: r.pick([4, 4, 3, 5, 6]), p: r.pick([12, 12, 10, 14, 15, 9, 11]) }; },
            function (s) { var n = s.F / (s.p - s.c), d = s.p * n, W = [[0, 200], [0, 2400]]; return Number.isInteger(n) && n % 20 === 0 && n >= 60 && n <= 160 && d % 200 === 0 && d <= 2400 && latS(line(s.c, -1, s.F), W, 10, 200).length >= 2 && latS(line(s.p, -1, 0), W, 10, 200).length >= 2; });
          s.n0 = s.F / (s.p - s.c); s.d0 = s.p * s.n0; s.LC = line(s.c, -1, s.F); s.LR = line(s.p, -1, 0); s.win = [[0, 200], [0, 2400]];
          s.nC = 'd=' + s.c + 'n+' + s.F; s.nR = 'd=' + s.p + 'n';
          return s;
        },
        stem: function (sh) { return 'A student council orders reusable water bottles printed with the school crest. The order costs a fixed $' + sh.F + ' set-up charge plus $' + sh.c + ' for each bottle printed, and the council sells the bottles for $' + sh.p + ' each. Let ' + t('n') + ' be the number of bottles and ' + t('d') + ' the amount in dollars.'; },
        parts: [
          { id: 'e10a', sub: 'a equations', level: 'BEG', make: function (r, sh) {
            var cS = K.line(line(sh.F, -1, sh.c), { vars: ['n', 'd'] });
            return twoEq('Write the cost equation and the revenue equation.', [sh.LC, sh.LR], ['Cost:', 'Revenue:'], ['n', 'd'],
              function (a) { if (cS(a).v === 'correct') return { code: 'u8-fee-rate', hint: 'The $' + sh.F + ' is charged once (the constant); the $' + sh.c + ' is charged per bottle, so it multiplies ' + t('n') + '.' }; return null; },
              'Cost = set-up + $' + sh.c + ' per bottle: ' + t(sh.nC) + '.<br>Revenue = $' + sh.p + ' per bottle sold: ' + t(sh.nR) + '.', ['Cost = fixed charge + (cost per bottle)·n. Revenue = (price)·n.'], 'cost and revenue equations', [sh.nC, sh.nR]);
          } },
          { id: 'e10a2', sub: 'a graph', level: 'EMG', make: function (r, sh) {
            var pc = latS(sh.LC, sh.win, 10, 200), pr = latS(sh.LR, sh.win, 10, 200).filter(function (q) { return q[0] > 0; });
            return sysGraph('Graph both equations on the grid. (Tap and drag: the box shows the coordinates.)', [sh.LC, sh.LR], [sh.nC, sh.nR], sh.win,
              { context: true, pad: { grid: 20, gridY: 200, labels: 1, labelsX: 40, labelsY: 400, snapX: 10, snapY: 200, unitX: 1.6, unitY: 0.125, xName: 'n', yName: 'd', firstQuadrant: true, defaultEnd: 'none' } },
              'Cost: ' + ptt(pc[0]) + ' and ' + ptt(pc[pc.length - 1]) + '. Revenue: ' + ptt([0, 0]) + ' and ' + ptt(pr[pr.length - 1]) + '.<br>The lines cross at the break-even point ' + ptt([sh.n0, sh.d0]) + '.',
              ['Find two points on each line, e.g. ' + t('n=0') + ' and another convenient value.'], 'graph cost and revenue');
          } },
          { id: 'e10b', sub: 'b point', level: 'BEG', make: function (r, sh) {
            return pointPart('State the break-even point as ' + t('(n,\\ d)') + '.', [sh.n0, sh.d0], [sh.LC, sh.LR], { vars: ['n', 'd'] },
              'Set cost = revenue: ' + t(sh.p + 'n=' + sh.c + 'n+' + sh.F) + ', ' + t((sh.p - sh.c) + 'n=' + sh.F) + ', ' + t('n=' + sh.n0) + '; ' + t('d=' + sh.p + '(' + sh.n0 + ')=' + F(sh.d0)) + '.<br>Check: ' + t(sh.c + '(' + sh.n0 + ')+' + sh.F + '=' + F(sh.d0)) + ' ✓. Break-even point ' + ptt([sh.n0, sh.d0]) + '.',
              ['Read where the lines cross, or set cost equal to revenue.'], 'break-even point');
          } },
          { id: 'e10b2', sub: 'b meaning', level: 'LIM', make: function (r, sh) {
            return mc(r, 'Which sentence interprets the break-even point ' + ptt([sh.n0, sh.d0]) + '?', [
              { html: 'Selling ' + sh.n0 + ' bottles, the council’s cost and revenue are both $' + Fp(sh.d0) + ', so it breaks even.', right: true },
              { html: 'Selling ' + Fp(sh.d0) + ' bottles brings in $' + sh.n0 + '.', why: 'The first coordinate is the number of bottles ' + t('n') + '; the second is the dollar amount ' + t('d') + '.', code: 'swap' },
              { html: 'Selling ' + sh.n0 + ' bottles makes a profit of $' + Fp(sh.d0) + '.', why: 'At the break-even point the profit is $0: the cost and the revenue are both $' + Fp(sh.d0) + '.', code: 'profit' },
              { html: 'The council has to sell exactly ' + sh.n0 + ' bottles, or it loses money.', why: 'Selling <b>more</b> than ' + sh.n0 + ' bottles makes a profit.', code: 'exact' }],
              'At ' + ptt([sh.n0, sh.d0]) + ' cost = revenue = $' + Fp(sh.d0) + ': selling ' + sh.n0 + ' bottles breaks even. Fewer bottles: a loss; more: a profit.', ['What do ' + t('n') + ' and ' + t('d') + ' stand for?'], 'break-even meaning');
          } },
          { id: 'e10c1', sub: 'c i', level: 'EMG', make: function (r, sh) { var n = sh.n0 - r.pick([40, 40, 20]); return profitPart(sh, n); } },
          { id: 'e10c2', sub: 'c ii', level: 'EMG', make: function (r, sh) { var n = sh.n0 + r.pick([75, 75, 50, 25]); return profitPart(sh, n); } },
          { id: 'e10d', sub: 'd', level: 'EMG', make: function (r, sh) {
            return mc(r, 'Without graphing anything further, how do the two slopes guarantee that this system has exactly one break-even point?', [
              { html: 'The slopes ($' + sh.c + ' and $' + sh.p + ' per bottle) are different, so the lines are not parallel and cross exactly once.', right: true },
              { html: 'Both slopes are positive, so the lines must cross.', why: 'Two lines with the same positive slope never cross. What matters is that the slopes are <b>different</b>.', code: 'pos' },
              { html: 'The revenue line starts at the origin, so it crosses every other line.', why: 'A line through the origin can still be parallel to another line. It is the different slopes that guarantee one crossing.', code: 'origin' },
              { html: 'The cost slope is smaller than the set-up charge.', why: 'The set-up charge is the intercept, not a slope; comparing them says nothing about crossing.', code: 'fee' }],
              'Cost rises $' + sh.c + ' per bottle and revenue $' + sh.p + ' per bottle. Different slopes mean the lines aren’t parallel, so they meet at exactly one point: one break-even number of bottles (no “never” and no “always”).',
              ['When do two lines fail to cross exactly once?'], 'slopes guarantee one solution');
          } }] },
      /* ---------- EP Part F: error analysis ---------- */
      { num: '11', section: 'Extra practice F — Error analysis',
        shared: function (r) {
          var s = pick2(r, function (r) { var ms = r.pick([[[3, 4], [1, 2]], [[3, 4], [1, 2]], [[1, 2], [1, 4]], [[5, 4], [1, 1]], [[3, 4], [1, 1]], [[1, 4], [1, 2]], [[1, 2], [3, 4]]]); return { m1: ms[0], m2: ms[1], b1: r.int(-3, 3), b2: r.int(-3, 5) }; },
            function (s) { var dm = fv(s.m1) - fv(s.m2), X = (s.b2 - s.b1) / dm, Y = fv(s.m1) * X + s.b1; return Number.isInteger(r6(X)) && X >= 12 && X <= 20 && Number.isInteger(r6(Y)) && Y >= 8 && Y <= 20; });
          s.L1 = mbL(s.m1, s.b1); s.L2 = mbL(s.m2, s.b2); s.n1 = 'y=' + T([[s.m1, 'x'], [s.b1, '']]); s.n2 = 'y=' + T([[s.m2, 'x'], [s.b2, '']]);
          var P = inter(s.L1, s.L2); s.X = fv(P[0]); s.Y = fv(P[1]);
          var segOf = function (L, col) { var c = clipV(L, W6); return { pts: c.v, color: col }; };
          s.fig = HW.graph({ x: W6[0], y: W6[1], grid: 1, labels: 2, max: 300, segs: [segOf(s.L1, '#2a5db0'), segOf(s.L2, '#c4532a')] });
          return s;
        },
        stem: function (sh) { return 'Asked how many solutions the system ' + t(sh.n1) + ' (blue) and ' + t(sh.n2) + ' (red) has, a student graphs both lines by hand on a grid with ' + t('-6\\le x\\le 6') + ' and ' + t('-6\\le y\\le 6') + ', sees no crossing point, and writes “the lines do not meet, so the system has no solution.”<div class="fig">' + sh.fig + '</div>'; },
        parts: [
          { id: 'e11a', sub: 'a', level: 'EMG', make: function (r, sh) {
            return mc(r, 'Classify the system correctly without graphing. What was the student’s error?', [
              { html: '<b>One solution</b>: the slopes ' + t(fT(fr(sh.m1[0], sh.m1[1]))) + ' and ' + t(fT(fr(sh.m2[0], sh.m2[1]))) + ' are different. The grid was too small — the lines cross outside it.', right: true },
              { html: '<b>No solution</b>: the lines are parallel, so the student is right.', why: 'Parallel lines have equal slopes; here they are ' + t(fT(fr(sh.m1[0], sh.m1[1]))) + ' and ' + t(fT(fr(sh.m2[0], sh.m2[1]))) + '.', code: 'par' },
              { html: '<b>No solution</b>: lines that don’t meet on the grid never meet.', why: 'Lines go on forever. Different slopes guarantee a crossing — maybe far away.', code: 'grid' },
              { html: '<b>Infinitely many solutions</b>: the lines are very close together.', why: 'Infinitely many means the <b>same</b> line: same slope and same intercept.', code: 'inf' }],
              'Slopes ' + t(fT(fr(sh.m1[0], sh.m1[1]))) + ' and ' + t(fT(fr(sh.m2[0], sh.m2[1]))) + ' are different, so the lines are not parallel: exactly <b>one solution</b>. The student read “no crossing on my grid” as “no crossing at all” — the intersection lies outside the grid.',
              ['Compare the slopes.'], 'error: grid too small');
          } },
          { id: 'e11b', sub: 'b', level: 'PRG', make: function (r, sh) {
            return pointPart('Determine the point of intersection algebraically.', [sh.X, sh.Y], [sh.L1, sh.L2], { wrong: eqWrongs(sh.m1, sh.b1, sh.m2, sh.b2, [sh.X, sh.Y]) },
              eqSol(sh.m1, sh.b1, sh.m2, sh.b2, [sh.X, sh.Y]), ['Set the two expressions for ' + t('y') + ' equal and clear the fractions.'], 'far intersection');
          } },
          { id: 'e11c', sub: 'c', level: 'EMG', make: function (r, sh) {
            var X1 = Math.ceil((sh.X + 2) / 5) * 5, Y1 = Math.ceil((sh.Y + 2) / 5) * 5;
            var win = function (a, b, c, d) { return t(a + '\\le x\\le ' + b) + ', ' + t(c + '\\le y\\le ' + d); };
            return mc(r, 'On which grid would the intersection be visible?', [
              { html: win(0, X1, 0, Y1), right: true },
              { html: win(-10, 10, -10, 10), why: 'The intersection ' + ptt([sh.X, sh.Y]) + ' has ' + t('x=' + sh.X) + ' — outside ' + t('-10\\le x\\le 10') + '.', code: 'ten' },
              { html: win(0, X1, 0, sh.Y - 3), why: 'The ' + t('y') + '-coordinate of the intersection is ' + t(sh.Y) + ', above this grid.', code: 'ysmall' },
              { html: win(0, sh.X - 3, 0, Y1), why: 'The ' + t('x') + '-coordinate of the intersection is ' + t(sh.X) + ', to the right of this grid.', code: 'xsmall' }],
              'Any grid containing ' + ptt([sh.X, sh.Y]) + ', e.g. ' + win(0, X1, 0, Y1) + '. An empty grid only shows the lines don’t meet <b>there</b>; the proof of “no solution” is equal slopes with different intercepts — an algebraic test, not a picture.',
              ['First find where the lines cross: set the two expressions for ' + t('y') + ' equal and solve.'], 'choose a window');
          } }] },
      { num: '12', shared: function (r) {
          var s = { x0: r.pick([4, 4, 2, 3, 5]), y0: r.pick([-1, -1, -2, -3, -4]), a: r.pick([2, 2, 3]) };
          s.s = s.x0 + s.y0; s.c = s.a * s.x0 - s.y0; s.L1 = line(1, 1, -s.s); s.L2 = line(s.a, -1, -s.c); s.n1 = eqT([[1, 'x'], [1, 'y']], s.s); s.n2 = eqT([[s.a, 'x'], [-1, 'y']], s.c);
          var win = [[-4, 8], [-8, 6]], segOf = function (L, col) { var c = clipV(L, win); return { pts: c.v, color: col }; };
          s.fig = HW.graph({ x: win[0], y: win[1], grid: 1, labels: 2, max: 300, segs: [segOf(s.L1, '#2a5db0'), segOf(s.L2, '#c4532a'), { pts: [[s.x0, 0], [s.x0, s.y0]], color: '#8a8f99', dash: true }, { pts: [[0, s.y0], [s.x0, s.y0]], color: '#8a8f99', dash: true }], points: [{ x: s.x0, y: s.y0, color: '#1c2230' }] });
          return s;
        },
        stem: function (sh) { return 'The system ' + t(sh.n1) + ' (blue) and ' + t(sh.n2) + ' (red) has been graphed below, and the point of intersection is marked. A student reports the solution as ' + ptt([sh.y0, sh.x0]) + '.<div class="fig">' + sh.fig + '</div>'; },
        parts: [
          { id: 'e12a', sub: 'a', level: 'BEG', make: function (r, sh) {
            var w = { x: sh.y0, y: sh.x0 };
            return mc(r, 'Substitute ' + ptt([sh.y0, sh.x0]) + ' into both equations. What do you find, and what mistake did the student make?', [
              { html: 'It satisfies ' + t(sh.n1) + ' but not ' + t(sh.n2) + '. The student swapped the coordinates.', right: true },
              { html: 'It satisfies both equations, so the student is right.', why: 'Check the second: ' + t(subT([[sh.a, 'x'], [-1, 'y']], w) + '=' + (sh.a * sh.y0 - sh.x0)) + ', not ' + t(sh.c) + '.', code: 'both' },
              { html: 'It satisfies ' + t(sh.n2) + ' but not ' + t(sh.n1) + '. The student misread the scale.', why: 'Substitute again: ' + t(subT([[1, 'x'], [1, 'y']], w) + '=' + sh.s) + ' works in the first equation; the second fails.', code: 'second' },
              { html: 'It satisfies neither equation. The student read a different crossing point.', why: t(subT([[1, 'x'], [1, 'y']], w) + '=' + sh.s) + ': it does satisfy ' + t(sh.n1) + '.', code: 'neither' }],
              'In ' + t(sh.n1) + ': ' + t(subT([[1, 'x'], [1, 'y']], w) + '=' + sh.s) + ' ✓. In ' + t(sh.n2) + ': ' + t(subT([[sh.a, 'x'], [-1, 'y']], w) + '=' + (sh.a * sh.y0 - sh.x0) + '\\ne ' + sh.c) + ' ✗.<br>The marked point is ' + t(sh.x0) + ' across and ' + t(sh.y0) + ' up/down: the student wrote the coordinates in the wrong order.',
              ['Substitute ' + t('x=' + sh.y0) + ' and ' + t('y=' + sh.x0) + ' into each equation.'], 'error: swapped coordinates');
          } },
          { id: 'e12b', sub: 'b', level: 'BEG', make: function (r, sh) {
            return pointPart('State the correct solution as an ordered pair.', [sh.x0, sh.y0], [sh.L1, sh.L2], {},
              'Read the marked point: across to ' + t('x=' + sh.x0) + ', down to ' + t('y=' + sh.y0) + ': ' + ptt([sh.x0, sh.y0]) + '.<br>Check: ' + t(subT([[1, 'x'], [1, 'y']], { x: sh.x0, y: sh.y0 }) + '=' + sh.s) + ' ✓, ' + t(subT([[sh.a, 'x'], [-1, 'y']], { x: sh.x0, y: sh.y0 }) + '=' + sh.c) + ' ✓',
              ['Go across first (' + t('x') + '), then up or down (' + t('y') + ').'], 'read marked point');
          } },
          { id: 'e12c', sub: 'c', level: 'EMG', make: function (r) {
            return mc(r, 'The student’s pair passed one of the two checks. Why is checking in <b>both</b> equations what catches this error?', [
              { html: 'Each equation on its own has infinitely many solutions (every point on its line), so a wrong pair can satisfy one of them by accident. Only a point on <b>both</b> lines solves the system.', right: true },
              { html: 'The second equation is always the harder one, so it catches more mistakes.', why: 'Either equation could be the one that catches it — what matters is that the solution must lie on both lines.', code: 'harder' },
              { html: 'Checking one equation is enough if you check it carefully.', why: 'The student’s pair passed one equation and was still wrong.', code: 'one' },
              { html: 'Swapped coordinates always fail both equations.', why: 'Not here: the swapped pair still worked in ' + t('x+y') + ', because adding doesn’t care about order.', code: 'always' }],
              'A single equation is satisfied by every point of its line, so passing one check proves little. The solution of the system must lie on <b>both</b> lines — the second substitution is what exposes the error.', ['How many points satisfy just one linear equation?'], 'why check both');
          } }] },
      /* ---------- EP Part G: three lines ---------- */
      { num: '13', section: 'Extra practice G — Stretch: three lines at once',
        shared: function (r) {
          var s = pick2(r, function (r) { return { x1: r.pick([3, 3, 2, 4]), y1: r.pick([2, 2, 1, 3]), a: r.pick([2, 2, 3]), b3: r.int(-1, 4), k: r.pick([3, 3, 2]) }; },
            function (s) { var b1 = s.y1 - s.x1, b2 = s.y1 + s.a * s.x1, x = (b2 - s.b3) / (s.a + 1), y = x + s.b3; return s.b3 !== b1 && s.b3 !== 0 && Number.isInteger(x) && x >= -3 && x <= 5 && y >= -3 && y <= 7 && b2 <= 12; });
          s.b1 = s.y1 - s.x1; s.b2 = s.y1 + s.a * s.x1; s.x2 = (s.b2 - s.b3) / (s.a + 1); s.y2 = s.x2 + s.b3;
          s.R = [[1, -1, s.b1], [s.a, 1, -s.b2], [s.k, -s.k, s.k * s.b3]]; s.L = s.R.map(function (q) { return line(q[0], q[1], q[2]); }); s.n = s.R.map(rawG);
          s.win = [[-4, 6], [-4, 8]];
          return s;
        },
        stem: function (sh) { return 'Three lines are <b>concurrent</b> when all three pass through one common point. Three lines are given in general form:<br>' + sh.n.map(function (n, i) { return t('\\ell_' + (i + 1) + ':\\ ' + n); }).join('<br>'); },
        parts: [
          { id: 'e13a', sub: 'a i', level: 'EMG', outcome: 'RF7', make: function (r, sh) {
            var p = K.P.line('Write ' + t('\\ell_3') + ' in slope–intercept form.', sh.L[2], { form: 'slope-intercept', wrong: [{ is: mbL(1, sh.k * sh.b3), code: 'u8-nodiv', hint: 'Divide <b>every</b> term by ' + t(sh.k) + '.' }] },
              t(sh.n[2]) + '<br>' + t(T([[-sh.k, 'y']]) + '=' + T([[-sh.k, 'x'], [-sh.k * sh.b3, '']])) + '<br>' + t(si(sh.L[2])) + '. (Also ' + t('\\ell_1:\\ ' + si(sh.L[0])) + ' and ' + t('\\ell_2:\\ ' + si(sh.L[1])) + '.)',
              ['Divide every term by the common factor ' + t(sh.k) + ' first.'], 'rearrange l3');
            p.bad = [si(mbL(1, sh.k * sh.b3))]; return p;
          } },
          { id: 'e13a2', sub: 'a graph', level: 'PRG', make: function (r, sh) {
            return sysGraph('Draw all three lines on the grid.', sh.L, sh.n.map(function (n, i) { return '\\ell_' + (i + 1) + ':\\ ' + n; }), sh.win, {},
              t('\\ell_1:\\ ' + si(sh.L[0])) + ', ' + t('\\ell_2:\\ ' + si(sh.L[1])) + ', ' + t('\\ell_3:\\ ' + si(sh.L[2])) + '. Plot each ' + t('y') + '-intercept (or a table point) and use the slope.<br>' + t('\\ell_1') + ' and ' + t('\\ell_3') + ' are parallel; ' + t('\\ell_2') + ' crosses them at ' + ptt([sh.x1, sh.y1]) + ' and ' + ptt([sh.x2, sh.y2]) + '.',
              ['Write each line in ' + t('y=mx+b') + ' form first.'], 'graph three lines');
          } },
          { id: 'e13b', sub: 'b', level: 'EMG', make: function (r, sh) {
            return mc(r, 'Exactly two of the three pairs of lines intersect. Which pair does <b>not</b>, and how is that pair’s system classified?', [
              { html: t('\\ell_1') + ' and ' + t('\\ell_3') + ': no solution (parallel)', right: true },
              { html: t('\\ell_1') + ' and ' + t('\\ell_3') + ': infinitely many solutions', why: 'Same slope ' + t('1') + ', but the ' + t('y') + '-intercepts ' + t(sh.b1) + ' and ' + t(sh.b3) + ' differ: parallel, not the same line.', code: 'inf' },
              { html: t('\\ell_1') + ' and ' + t('\\ell_2') + ': no solution (parallel)', why: 'Their slopes are ' + t('1') + ' and ' + t(-sh.a) + ' — different, so they cross.', code: 'l12' },
              { html: t('\\ell_2') + ' and ' + t('\\ell_3') + ': no solution (parallel)', why: 'Their slopes are ' + t(-sh.a) + ' and ' + t('1') + ' — different, so they cross.', code: 'l23' }],
              t('\\ell_1') + ' and ' + t('\\ell_3') + ' both have slope ' + t('1') + ' but ' + t('y') + '-intercepts ' + t(sh.b1) + ' and ' + t(sh.b3) + ': parallel and distinct, so that system has <b>no solution</b>.',
              ['Compare the slopes of each pair.'], 'which pair parallel');
          } },
          { id: 'e13c1', sub: 'c i', level: 'EMG', make: function (r, sh) {
            return pointPart('Determine the point of intersection of ' + t('\\ell_1') + ' and ' + t('\\ell_2') + '.', [sh.x1, sh.y1], [sh.L[0], sh.L[1]], { wrong: eqWrongs(1, sh.b1, -sh.a, sh.b2, [sh.x1, sh.y1]) },
              eqSol(1, sh.b1, -sh.a, sh.b2, [sh.x1, sh.y1]), ['Write both in ' + t('y=mx+b') + ' form and set them equal.'], 'l1 meets l2');
          } },
          { id: 'e13c2', sub: 'c ii', level: 'EMG', make: function (r, sh) {
            return pointPart('Determine the point of intersection of ' + t('\\ell_2') + ' and ' + t('\\ell_3') + '.', [sh.x2, sh.y2], [sh.L[1], sh.L[2]], { wrong: eqWrongs(-sh.a, sh.b2, 1, sh.b3, [sh.x2, sh.y2]) },
              eqSol(-sh.a, sh.b2, 1, sh.b3, [sh.x2, sh.y2]), ['Write both in ' + t('y=mx+b') + ' form and set them equal.'], 'l2 meets l3');
          } },
          { id: 'e13d', sub: 'd', level: 'EMG', make: function (r, sh) {
            var v = sh.k * sh.x1 - sh.k * sh.y1 + sh.k * sh.b3;
            return mc(r, 'Are the three lines concurrent?', [
              { html: '<b>No</b>: ' + t('\\ell_1') + ' and ' + t('\\ell_2') + ' meet only at ' + ptt([sh.x1, sh.y1]) + ', which is not on ' + t('\\ell_3') + ' (and ' + t('\\ell_1') + ', ' + t('\\ell_3') + ' never meet).', right: true },
              { html: '<b>Yes</b>: every pair of lines except one meets.', why: 'Concurrent means one point on <b>all three</b> lines. The two crossing points ' + ptt([sh.x1, sh.y1]) + ' and ' + ptt([sh.x2, sh.y2]) + ' are different.', code: 'yes' },
              { html: '<b>Yes</b>: ' + ptt([sh.x1, sh.y1]) + ' is on all three lines.', why: 'Substitute into ' + t('\\ell_3') + ': ' + t(subT([[sh.k, 'x'], [-sh.k, 'y'], [sh.k * sh.b3, '']], { x: sh.x1, y: sh.y1 }) + '=' + v + '\\ne 0') + '.', code: 'pt' },
              { html: '<b>No</b>: three lines can never pass through one point.', why: 'They can — e.g. three different lines through ' + ptt([sh.x1, sh.y1]) + '. These three just don’t.', code: 'never' }],
              t('\\ell_1') + ' and ' + t('\\ell_2') + ' meet only at ' + ptt([sh.x1, sh.y1]) + '. In ' + t('\\ell_3') + ': ' + t(subT([[sh.k, 'x'], [-sh.k, 'y'], [sh.k * sh.b3, '']], { x: sh.x1, y: sh.y1 }) + '=' + v + '\\ne 0') + '. So no single point lies on all three lines: <b>not concurrent</b>.',
              ['Is the meeting point of two of the lines on the third?'], 'concurrent?');
          } },
          { id: 'e13e', sub: 'e', level: 'MAS', make: function (r, sh) {
            var P = [sh.x1, sh.y1], L1 = sh.L[0], L2 = sh.L[1];
            var keyL = (P[0] !== 0 && P[1] !== 0 && P[1] / P[0] !== 1 && P[1] / P[0] !== -sh.a) ? line(P[1], -P[0], 0) : line(0, 1, -P[1]);
            var check = function (resp) {
              var rd = Ln.read(resp); if (!rd.ok) return form(rd.why === 'empty' ? 'empty' : 'line-' + rd.why, rd.why === 'empty' ? 'Type your equation first.' : 'Write an equation in ' + t('x') + ' and ' + t('y') + ', e.g. ' + t('2x-3y=0') + '.');
              var S = { A: rd.a, B: rd.b, C: rd.c }, on = Math.abs(S.A * P[0] + S.B * P[1] + S.C) < 1e-9;
              if (!on) return wrong('u8-sys-notpt', 'For ' + t('\\ell_1') + ', ' + t('\\ell_2') + ' and ' + t('\\ell_4') + ' to be concurrent, ' + t('\\ell_4') + ' must pass through the point where ' + t('\\ell_1') + ' and ' + t('\\ell_2') + ' meet, ' + ptt(P) + '.');
              if (Math.abs(S.A * L1.B - S.B * L1.A) < 1e-9) return wrong('u8-sys-parallel-given', 'That line has the same slope as ' + t('\\ell_1') + ' — it is ' + t('\\ell_1') + ' itself. Choose a different slope.');
              if (Math.abs(S.A * L2.B - S.B * L2.A) < 1e-9) return wrong('u8-sys-parallel-given', 'That line has the same slope as ' + t('\\ell_2') + ' — it is ' + t('\\ell_2') + ' itself. Choose a different slope.');
              return K.line(S, { form: 'general' })(resp);
            };
            var key = gen(keyL);
            var p = K.P.math('Determine the equation, in general form, of a line ' + t('\\ell_4') + ' that is not parallel to ' + t('\\ell_1') + ' or ' + t('\\ell_2') + ' and that makes ' + t('\\ell_1') + ', ' + t('\\ell_2') + ' and ' + t('\\ell_4') + ' concurrent.', check, key,
              t('\\ell_4') + ' must pass through ' + ptt(P) + ' — the only point ' + t('\\ell_1') + ' and ' + t('\\ell_2') + ' share — with a slope other than ' + t('1') + ' and ' + t(-sh.a) + '.<br>' +
              (keyL.A !== 0 ? 'E.g. the line through ' + ptt(P) + ' and the origin: ' + t('m=\\frac{' + P[1] + '}{' + P[0] + '}') + ', so ' + t('y=' + T([[[P[1], P[0]], 'x']])) + ', i.e. ' + t(key) + '.' : 'E.g. the horizontal line through ' + ptt(P) + ': ' + t(key) + '.') + '<br>Check: ' + t(subT([[keyL.A, 'x'], [keyL.B, 'y'], [keyL.C, '']], { x: P[0], y: P[1] }) + '=0') + ' ✓, and its slope is neither ' + t('1') + ' nor ' + t(-sh.a) + '.',
              ['First find where ' + t('\\ell_1') + ' and ' + t('\\ell_2') + ' meet.', 'Any line through that point works, as long as its slope is new.'], 'line through intersection', { keys: 'eq', placeholder: 'e.g. 2x - 3y = 0' });
            p.good = [gen(line(0, 1, -P[1])), gen(line(1, 0, -P[0]))].filter(function (g) { return check(g).v === 'correct'; });
            p.bad = [gen(L1), gen(L2), gen(line(1, -1, 0)), 'y=' + T([[2, 'x']])].filter(function (b) { return check(b).v !== 'correct'; });
            return p;
          } }] },
      /* ---------- EP Part H: diploma style ---------- */
      { num: '14', section: 'Extra practice H — Multiple choice and numerical response', parts: [
        { id: 'e14', level: 'EMG', make: function (r) {
          var s = pick2(r, function (r) { var ms = r.sample([2, 3, 4], 2); return { a: r.pick([3, 3, 2, 4, 5]), b: r.pick([2, 2, 3, 5]), c: r.pick([7, 7, 3, 5, 9]), m1: Math.min(ms[0], ms[1]), m2: Math.max(ms[0], ms[1]), type: r.pick(['inf', 'inf', 'none', 'one']) }; }, function (s) { return gcd(s.a, s.b) === 1 && gcd(gcd(s.a, s.b), s.c) === 1; });
          var R1 = [s.m1 * s.a, -s.m1 * s.b, s.m1 * s.c], R2 = [s.m2 * s.a, -s.m2 * s.b, s.m2 * s.c];
          if (s.type === 'none') R2[2] += r.pick([-1, 1, 2]); if (s.type === 'one') R2[1] += r.pick([-1, 1]) * s.m2 / s.m2 * (R2[1] < -3 ? 2 : 1);
          var L1 = line(R1[0], R1[1], R1[2]), L2 = line(R2[0], R2[1], R2[2]), kind = kindOf(L1, L2);
          return mc(r, 'The system ' + t('\\begin{cases}' + rawG(R1) + '\\\\' + rawG(R2) + '\\end{cases}') + ' has', [
            { html: 'no solution', right: kind === 'none', why: kind === 'inf' ? 'Multiply the first equation by ' + t(fT(fr(s.m2, s.m1))) + ': you get the second equation exactly — the same line.' : 'The slopes are different, so the lines cross.', code: 'none' },
            { html: 'exactly one solution', right: kind === 'one', why: 'The slopes ' + t('-\\frac{A}{B}') + ' are equal, so the lines are parallel or the same — never exactly one crossing.', code: 'one' },
            { html: 'exactly two solutions', why: 'Two different lines meet at most once; a system of two linear equations never has exactly two solutions.', code: 'two' },
            { html: 'infinitely many solutions', right: kind === 'inf', why: kind === 'none' ? 'Equal slopes, but the constants are not in the same ratio: parallel, distinct lines.' : 'The slopes are different, so the lines cross once.', code: 'inf' }],
            clsSol(L1, L2, rawG(R1), rawG(R2)) + (kind === 'inf' ? '<br>(Multiply the first equation by ' + t(fT(fr(s.m2, s.m1))) + ' to get the second.)' : ''), ['Compare ' + t('-\\frac{A}{B}') + ' and ' + t('-\\frac{C}{B}') + ' for both lines.'], 'MC classify general form', true);
        } }] },
      { num: '15', parts: [
        { id: 'e15', level: 'PRG', make: function (r) {
          /* sg: sign of the y-term of the second line (the booklet's 3x − 4y + 9 = 0 has sg = −1); it sets the sign of k, so the key letter varies */
          var s = pick2(r, function (r) { var pq = r.pick([[3, 4], [3, 4], [4, 3], [2, 3], [3, 2], [2, 5], [5, 2], [3, 5], [5, 3]]); return { p: pq[0], q: pq[1], sg: r.pick([-1, -1, 1]), rr: r.pick([9, 9, 5, 7, 2, -3]), s: r.pick([-5, -5, 4, 7, -1]) }; }, function (s) { return s.s !== s.sg * s.p * s.rr; });
          var k = s.sg * s.p * s.p, m2 = fT(fr(-s.sg * s.p, s.q)), e1 = T([[1, 'kx'], [s.p * s.q, 'y'], [s.s, '']]) + '=0', e2 = rawG([s.p, s.sg * s.q, s.rr]);
          var vals = [-s.q * s.q, -s.p * s.p, s.p * s.p, s.q * s.q].sort(function (a, b) { return a - b; });
          var why = function (v) { return v === -k ? 'Check the sign: ' + t('-\\frac{k}{' + s.p * s.q + '}=' + m2) + ' gives a <b>' + (k < 0 ? 'negative' : 'positive') + '</b> ' + t('k') + '.' : 'The slope is ' + t('-\\frac{A}{B}') + ': set ' + t('-\\frac{k}{' + s.p * s.q + '}=' + m2) + ' — the ratio is upside down here.'; };
          return mc(r, 'The value of ' + t('k') + ' for which the lines ' + t(e1) + ' and ' + t(e2) + ' have no point in common is', vals.map(function (v) { return { html: t(v), right: v === k, why: v === k ? null : why(v), code: 'v' + v }; }),
            t(e2) + ': ' + t('m=-\\frac{' + s.p + '}{' + (s.sg * s.q) + '}=' + m2) + '. ' + t(e1) + ': ' + t('m=-\\frac{k}{' + s.p * s.q + '}') + '.<br>No point in common → equal slopes: ' + t('-\\frac{k}{' + s.p * s.q + '}=' + m2) + ', so ' + t('k=' + k) + '.<br>The ' + t('y') + '-intercepts ' + t(fT(fr(-s.s, s.p * s.q))) + ' and ' + t(fT(fr(-s.rr, s.sg * s.q))) + ' differ, so the lines are parallel and distinct ✓',
            ['No point in common means parallel lines: equal slopes.'], 'MC k for parallel', true);
        } }] },
      { num: '16', parts: [
        { id: 'e16', level: 'PRG', make: function (r) {
          var s = pick2(r, function (r) { var cd = r.pick([[4, 3], [4, 3], [3, 2], [2, 5], [5, 2], [3, 4]]); return { x0: r.pick([4, 4, 2, 6]), y0: r.int(1, 6), a: r.pick([5, 5, 3, 1, -1, -3]), c: cd[0], d: cd[1] }; }, function (s) { var b = s.y0 - s.a * s.x0 / 2; return b !== 0 && Math.abs(b) <= 12 && fv([s.a, 2]) !== -s.c / s.d; });
          var b = s.y0 - s.a * s.x0 / 2, e = s.c * s.x0 + s.d * s.y0, m1 = [s.a, 2], L1 = mbL(m1, b), L2 = line(s.c, s.d, -e), ans = s.x0 + s.y0;
          var n1 = 'y=' + T([[m1, 'x'], [b, '']]), n2 = rawG([s.c, s.d, -e]);
          return K.P.nr('The lines ' + t(n1) + ' and ' + t(n2) + ' intersect at the point ' + t('(p,\\ q)') + '. The value of ' + t('p+q') + ' is ____.', ans,
            function (v) { if (v === s.x0 && v !== ans) return { code: 'u8-pq-one', hint: 'That is ' + t('p') + ' alone — add ' + t('q') + ' as well.' }; if (v === s.y0 && v !== ans) return { code: 'u8-pq-one', hint: 'That is ' + t('q') + ' alone — add ' + t('p') + ' as well.' }; if (v === Math.abs(s.x0 - s.y0) && v !== ans) return { code: 'u8-pq-diff', hint: 'The question asks for the <b>sum</b> ' + t('p+q') + '.' }; return null; },
            'Substitute ' + t(n1) + ' into ' + t(n2) + ': ' + t(s.c + 'x+' + s.d + '\\left(' + T([[m1, 'x'], [b, '']]) + '\\right)-' + e + '=0') + '.<br>Multiply by 2 and collect: ' + t(T([[2 * s.c + s.d * s.a, 'x']]) + '=' + (2 * e - 2 * s.d * b)) + ', so ' + t('x=' + s.x0) + ' and ' + t('y=' + subT([[m1, 'x'], [b, '']], { x: s.x0 }) + '=' + s.y0) + '.<br>' + t('p+q=' + s.x0 + '+' + s.y0 + '=' + ans) + ' (recorded as ' + ('000' + ans).slice(-3) + ').',
            ['Substitute the expression for ' + t('y') + ' into the other equation.', 'Then add the two coordinates.'], 'NR p+q');
        } }] },
      { num: '17', parts: [
        { id: 'e17', level: 'ADV', make: function (r) {
          var s = pick2(r, function (r) { var pq = r.pick([[2, 5], [2, 5], [3, 4], [3, 2], [2, 3], [5, 2]]); return { p: pq[0], q: pq[1], m: r.pick([4, 4, 2, 3, 5]), rr: r.pick([6, 6, 5, 7, 4]), s: r.pick([20, 20, 12, 18, 10, 15]) }; }, function (s) { return s.s !== s.m * s.rr && gcd(gcd(s.p, s.q), s.rr) === 1; });
          var k = s.m * s.q, e1 = T([[s.m * s.p, 'x'], [1, 'ky'], [-s.s, '']]) + '=0', e2 = rawG([s.p, s.q, -s.rr]);
          return K.P.nr('The system ' + t(e1) + ' and ' + t(e2) + ' has no solution when ' + t('k=') + ' ____.', k,
            function (v) { if (v === s.q && v !== k) return { code: 'u8-k-ycoef', hint: 'With ' + t('k=' + s.q) + ' the slopes are ' + t(fT(fr(-s.m * s.p, s.q))) + ' and ' + t(fT(fr(-s.p, s.q))) + ' — not equal. Scale the ' + t('y') + '-coefficient by the same factor as the ' + t('x') + '-coefficient.' }; if (v === s.m * s.p && v !== k) return { code: 'u8-k-xcoef', hint: 'That is the ' + t('x') + '-coefficient. Set the slopes ' + t('-\\frac{' + s.m * s.p + '}{k}') + ' and ' + t('-\\frac{' + s.p + '}{' + s.q + '}') + ' equal.' }; if (v === -k) return { code: 'u8-k-sign', hint: 'Check the signs of the slopes.' }; return null; },
            'Slopes: ' + t('-\\frac{' + s.m * s.p + '}{k}') + ' and ' + t('-\\frac{' + s.p + '}{' + s.q + '}') + '. Equal slopes: ' + t('\\frac{' + s.m * s.p + '}{k}=\\frac{' + s.p + '}{' + s.q + '}') + ', so ' + t('k=' + k) + '.<br>Check the intercepts differ: ' + t(rawG([s.m * s.p, k, -s.s])) + ' gives ' + t(si(line(s.m * s.p, k, -s.s))) + ', while ' + t(e2) + ' gives ' + t(si(line(s.p, s.q, -s.rr))) + ' — parallel and distinct ✓<br>' + t('k=' + k) + ' (recorded as ' + ('000' + k).slice(-3) + ').',
            ['No solution: equal slopes and different intercepts.'], 'NR k for no solution');
        } }] }
    ]
  });
})(window);
