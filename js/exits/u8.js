/* Math 10C · Unit 8 exit slips (Lessons 8.1–8.6, Systems of Linear Equations) — one short end-of-class check per
 * lesson, written only in test mode. HW.defineExit makes u8l1x … u8l6x ("Exit Slip 8.1" …).
 * Each slip has 3–4 questions (3–5 parts, about 5–8 minutes) that are new but match the skills and difficulty of the
 * lesson's assignment (u8_LXX.tex / js/lessons/u8lN.js), using only what has been taught up to that lesson. The questions
 * are spread over the Beginning, Progressing and Mastery boxes (the word-problem lessons 8.4 and 8.5 start at Emerging,
 * as their assignments do). Every part is a generator (each student gets their own numbers) with a key, a worked
 * solution, hints and typical wrong answers (codes u8x-…, labelled and given a partial-credit decision below).
 * Solutions are typed as ordered pairs (point keypad with "no solution" / "infinitely many"); graphs use the graph pad.
 * Lesson 8.6 is the unit review: its slip mixes graphing/solving methods, the number of solutions and an application.
 * A scientific calculator is allowed (as on the unit test); nothing needs a graphing calculator. */
(function (root) {
  'use strict';
  var HW = root.HW, K = HW.kit, B = K.P, ex = HW.ex, Ln = HW.lines, DR = HW.draw, F = HW.fmt, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form;

  HW.addCodes({
    'u8x-gr-line': 'Graph: a line through the wrong points', 'u8x-gr-shift': 'Graph: right slope, wrong position', 'u8x-gr-sign': 'Graph: slope sign wrong', 'u8x-gr-flip': 'Graph: rise and run swapped',
    'u8x-gr-slope': 'Graph: right intercept, wrong slope', 'u8x-line-missing': 'Graph: one line missing', 'u8x-line-extra': 'Graph: an extra line', 'u8x-point-off': 'Graph: points not on the lines', 'u8x-points-only': 'Graph: points not joined into lines', 'u8x-graph': 'Graph not right',
    'u8x-same': 'Wrote the same line (infinitely many, not none)', 'u8x-parallel': 'Wrote a parallel line (no solution, not infinitely many)', 'u8x-cross': 'Wrote a line that crosses (one solution)',
    'u8x-distribute': 'Substitution: did not multiply every term', 'u8x-c-sign': 'Sign slip with the constant term', 'u8x-pq-swap': 'Values of the two letters swapped',
    'u8x-elim-const': 'Elimination: did not scale the constant', 'u8x-elim-noscale': 'Elimination: combined without scaling', 'u8x-elim-sign': 'Elimination: added instead of subtracting (or the reverse)',
    'u8x-price-swap': 'The two prices swapped', 'u8x-combo-swap': 'Combination cost with the prices swapped', 'u8x-combo-one': 'Combination cost: one price wrong', 'u8x-digit-rev': 'Gave the reversed number',
    'u8x-digit-sum': 'Gave the digit sum or difference', 'u8x-mix-swap': 'Mixture amounts swapped', 'u8x-mix-pct': 'Mixture: percent used as a whole number', 'u8x-wind-swap': 'Plane/boat speed and wind/current speed swapped',
    'u8x-ground': 'Gave a ground speed (with or against the wind)', 'u8x-cost-sign': 'Break-even: sign slip solving', 'u8x-cost-add': 'Break-even: added instead of subtracting', 'u8x-k-unscaled': 'Equivalent equations: did not scale every term',
    'u8x-sys-one': 'System: one of the two equations wrong', 'u8x-sys-eq': 'System: both equations wrong', 'u8x-sys-double': 'System: perimeter not doubled', 'u8x-sys-rel': 'System: relationship written backwards',
    'u8x-sys-coef': 'System: coefficients attached to the wrong variables', 'u8x-sys-total': 'System: used the wrong total', 'u8x-sys-units': 'System: mixed cents and dollars'
  });
  HW.addPartial({
    'u8x-gr-line': 'b', 'u8x-gr-shift': 's', 'u8x-gr-sign': 's', 'u8x-gr-flip': 's', 'u8x-gr-slope': 'b', 'u8x-line-missing': 's', 'u8x-line-extra': 's', 'u8x-point-off': 'n', 'u8x-points-only': 'n', 'u8x-graph': 'n',
    'u8x-same': 'n', 'u8x-parallel': 'n', 'u8x-cross': 'n', 'u8x-distribute': 'b', 'u8x-c-sign': 's', 'u8x-pq-swap': 'b', 'u8x-elim-const': 'b', 'u8x-elim-noscale': 'n', 'u8x-elim-sign': 'b',
    'u8x-price-swap': 's', 'u8x-combo-swap': 'b', 'u8x-combo-one': 's', 'u8x-digit-rev': 's', 'u8x-digit-sum': 'n', 'u8x-mix-swap': 's', 'u8x-mix-pct': 'b', 'u8x-wind-swap': 's', 'u8x-ground': 'b',
    'u8x-cost-sign': 's', 'u8x-cost-add': 'b', 'u8x-k-unscaled': 'b',
    'u8x-sys-one': 'b', 'u8x-sys-eq': 'n', 'u8x-sys-double': 'b', 'u8x-sys-rel': 'b', 'u8x-sys-coef': 'b', 'u8x-sys-total': 'b', 'u8x-sys-units': 's'
  });

  /* ---------------- numbers and LaTeX ---------------- */
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var c = a % b; a = b; b = c; } return a; }
  function fr(p, q) { if (Array.isArray(p)) return fr(p[0], p[1]); if (q == null) q = 1; if (q < 0) { p = -p; q = -q; } var g = gcd(p, q) || 1; return [p / g + 0, q / g]; }
  function fv(f) { return Array.isArray(f) ? f[0] / f[1] : f; }
  function cl(x) { return Math.round(x * 1e9) / 1e9; }
  function nf(x) { return F(cl(x)); }
  function nT(x) { if (Array.isArray(x)) { var f = fr(x); return Ln.frT(f[0], f[1]); } if (Number.isInteger(cl(x))) return F(cl(x)); var g = Ln.toFr(x); return g[1] <= 12 ? Ln.frT(g[0], g[1]) : String(cl(x)); }
  function pT(x) { return fv(x) < 0 ? '(' + nT(x) + ')' : nT(x); }
  function ptT(p) { return '(' + nT(p[0]) + ',\\ ' + nT(p[1]) + ')'; }
  function pS(x) { if (Array.isArray(x)) { var f = fr(x); return f[1] === 1 ? String(f[0]) : f[0] + '/' + f[1]; } if (Number.isInteger(cl(x))) return String(cl(x)); var g = Ln.toFr(x); return g[1] === 1 ? String(g[0]) : g[0] + '/' + g[1]; }
  function ptK(p) { return '(' + pS(p[0]) + ', ' + pS(p[1]) + ')'; }
  function near(a, b) { return Math.abs(a - b) < 1e-9 * Math.max(1, Math.abs(a), Math.abs(b)); }
  function nz(r, lo, hi) { var v; do { v = r.int(lo, hi); } while (v === 0); return v; }
  function until(gen, okf) { for (var i = 0; i < 6000; i++) { var o = gen(); if (okf(o)) return o; } throw new Error('u8 exits: no valid numbers'); }
  /* terms [[coef, 'x'], …] -> LaTeX (coef a number or [p, q]) */
  function T(terms) {
    var s = '';
    terms.forEach(function (tm) {
      var cv = fv(tm[0]), v = tm[1] || ''; if (Math.abs(cv) < 1e-12) return;
      var body, a = Math.abs(cv);
      if (Array.isArray(tm[0])) { var c = fr(tm[0]); body = c[1] === 1 ? (Math.abs(c[0]) === 1 && v ? '' : F(Math.abs(c[0]))) : '\\frac{' + Math.abs(c[0]) + '}{' + c[1] + '}'; }
      else body = a === 1 && v ? '' : nf(a);
      s += (cv < 0 ? '-' : (s ? '+' : '')) + body + v;
    });
    return s || '0';
  }
  function eqT(lhs, rhs) { return T(lhs) + '=' + (typeof rhs === 'number' ? nf(rhs) : T(rhs)); }
  function sysT(e1, e2) { return '\\[\\begin{aligned}' + e1.replace('=', '&=') + '\\\\' + e2.replace('=', '&=') + '\\end{aligned}\\]'; }

  /* ---------------- lines A x + B y + C = 0 ---------------- */
  function line(A, Bc, C) { var g = gcd(gcd(A, Bc), C) || 1; A /= g; Bc /= g; C /= g; if (A < 0 || (A === 0 && Bc < 0)) { A = -A; Bc = -Bc; C = -C; } return { A: A + 0, B: Bc + 0, C: C + 0 }; }
  function mbL(m, b) { var M = Array.isArray(m) ? fr(m) : [m, 1], Bf = Array.isArray(b) ? fr(b) : Ln.toFr(b); return line(M[0] * Bf[1], -M[1] * Bf[1], M[1] * Bf[0]); }
  function std(a, b, c) { return line(a, b, -c); }   // a x + b y = c
  function arr(Lo) { return [Lo.A, Lo.B, Lo.C]; }
  function onL(Lo, p) { return Math.abs(Lo.A * fv(p[0]) + Lo.B * fv(p[1]) + Lo.C) < 1e-9; }
  function sameL(a, b) { return a.A === b.A && a.B === b.B && a.C === b.C; }
  function si(Lo, vars) { return Ln.tex(Lo, 'slope-intercept', null, vars); }
  function latS(Lo, win) {
    var out = [];
    for (var x = Math.ceil(win[0][0]); x <= win[0][1]; x++) { if (Lo.B === 0) continue; var y = -(Lo.A * x + Lo.C) / Lo.B; if (Math.abs(y - Math.round(y)) < 1e-7 && y >= win[1][0] - 1e-9 && y <= win[1][1] + 1e-9) out.push([x, Math.round(y)]); }
    return out;
  }
  function arrowV(p, q) { return { pts: [], pieces: [{ v: [p, q], s: 'arrow', e: 'arrow' }], join: 'none' }; }
  function lineV(Lo, win) { var L2 = latS(Lo, win); if (L2.length < 2) L2 = latS(Lo, [[-60, 60], [-1e5, 1e5]]); return arrowV(L2[0], L2[L2.length - 1]); }
  function uniqL(Ls) { var out = []; Ls.forEach(function (L) { if (!out.some(function (M) { return sameL(M, L); })) out.push(L); }); return out; }

  /* ---------------- graph pad: both lines of a system (the Unit 8 Lesson 1 checker) ---------------- */
  var W6 = [[-6, 6], [-6, 6]];
  var PADHELP = ' <span style="color:#6a7182;font-size:.92em">(Use <b>╱ Line</b>: tap two points on a line — its ends start as arrows. Draw both lines.)</span>';
  function pad(win) { return { x: win[0], y: win[1], grid: 1, labels: 2, mode: 'lines', defaultEnd: 'arrow', max: 360 }; }
  function splitBends(value) {
    var v = DR.norm(value), out = [];
    v.pieces.forEach(function (pc) {
      if (pc.v.length < 3) { out.push(pc); return; }
      var runs = [[pc.v[0], pc.v[1]]];
      for (var i = 2; i < pc.v.length; i++) {
        var run = runs[runs.length - 1], a = run[run.length - 2], b = run[run.length - 1], c = pc.v[i];
        if (Math.abs((b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0])) < 1e-9) run.push(c); else runs.push([b, c]);
      }
      var both = pc.s === 'arrow' && pc.e === 'arrow';
      runs.forEach(function (rv, k) { out.push({ v: rv, s: k === 0 ? pc.s : (both ? 'arrow' : 'closed'), e: k === runs.length - 1 ? pc.e : (both ? 'arrow' : 'closed') }); });
    });
    return { pts: v.pts, pieces: out, join: v.join };
  }
  function propL(S, L) {
    var a = [S.A, S.B, S.C], b = [L.A, L.B, L.C], sa = Math.max.apply(null, a.map(Math.abs)), sb = Math.max.apply(null, b.map(Math.abs));
    for (var i = 0; i < 3; i++) for (var j = i + 1; j < 3; j++) if (Math.abs(a[i] * b[j] - a[j] * b[i]) > 1e-6 * sa * sb) return false;
    return true;
  }
  function geoL(g, k) { var L = g.lines[k]; return { A: L.A, B: L.B, C: -L.C }; }
  function sysGraph(prompt, Ls, names, win, o, sol, hints, text) {
    o = o || {};
    var U = uniqL(Ls), uNames = U.map(function (L) { var i = Ls.length - 1; while (!sameL(Ls[i], L)) i--; return t(names[i]); });
    var key = { pts: [], pieces: U.map(function (L) { return lineV(L, win).pieces[0]; }), join: 'none' };
    var exact = K.graphExact(key);
    var W0 = (o.wrong || []).filter(function (w) { return w.L && !U.some(function (L) { return sameL(L, w.L); }); });
    function diagnose(S, Tl, name) {
      var sm = S.B === 0 ? null : -S.A / S.B, tm = -Tl.A / Tl.B, sb = S.B === 0 ? null : -S.C / S.B, tb = -Tl.C / Tl.B, nr = function (a, b) { return a != null && Math.abs(a - b) < 1e-9; };
      if (S.B === 0) return wrong('u8x-gr-line', 'One of your lines is vertical. Check your line for ' + name + ': substitute two of its points into the equation.');
      if (nr(sm, tm)) return wrong('u8x-gr-shift', 'Your line for ' + name + ' has the right slope but is in the wrong place: it should cross the ' + t('y') + '-axis at ' + t(ptT([0, Ln.toFr(tb)])) + '.');
      if (nr(sb, tb)) {
        if (nr(sm, -tm)) return wrong('u8x-gr-sign', 'Your line for ' + name + ' starts in the right place, but it goes the wrong way: its slope is ' + t(nT(tm)) + ', so it ' + (tm < 0 ? 'falls' : 'rises') + ' from left to right.');
        if (tm !== 0 && nr(sm, 1 / tm)) return wrong('u8x-gr-flip', 'Your line for ' + name + ' starts in the right place. Slope is <b>rise over run</b>: ' + t('m=' + nT(tm)) + ' — you stepped run over rise.');
        return wrong('u8x-gr-slope', 'Your line for ' + name + ' crosses the ' + t('y') + '-axis in the right place — now check its slope: ' + t('m=' + nT(tm)) + '.');
      }
      return wrong('u8x-gr-line', 'Check your line for ' + name + ': substitute two of the points you used into ' + name + ' — both must make it true.');
    }
    var check = function (resp) {
      var v = splitBends(resp);
      if (DR.empty(v)) return form('empty', 'Draw your answer on the grid first.');
      var r0 = exact(v);
      if (r0.v === 'wrong' && (r0.code === 'graph-length' || r0.code === 'graph-ends')) return wrong('graph-arrows', 'Right lines — but a line keeps going forever: put <b>arrows</b> on both ends of each line (use the <b>Ends</b> tool).');
      if (r0.v !== 'wrong' || r0.code !== 'graph') return r0;
      var g = DR.geom(v), have = Object.keys(g.lines).map(function (k) { return geoL(g, k); });
      if (!have.length) {
        var off = v.pts.filter(function (p) { return !U.some(function (L) { return onL(L, p); }); })[0];
        if (off) return wrong('u8x-point-off', t(ptT(off)) + ' is not on ' + (U.length > 1 ? 'either line' : 'the line') + '. Substitute it into the equations to check.');
        return wrong('u8x-points-only', 'Your points are on the lines — now draw the lines through them with the <b>╱ Line</b> tool.');
      }
      var hit = have.map(function (S) { for (var i = 0; i < U.length; i++) if (propL(S, U[i])) return i; return -1; });
      var extra = have.filter(function (S, j) { return hit[j] < 0; }), miss = [];
      U.forEach(function (L, i) { if (hit.indexOf(i) < 0) miss.push(i); });
      for (var j = 0; j < extra.length; j++) for (var w = 0; w < W0.length; w++) if (propL(extra[j], W0[w].L)) return wrong(W0[w].code, W0[w].hint);
      if (!extra.length && miss.length) return wrong('u8x-line-missing', 'Correct so far — still to draw: ' + miss.map(function (i) { return uNames[i]; }).join(' and ') + '.');
      if (extra.length === 1 && miss.length === 1) return diagnose(extra[0], U[miss[0]], uNames[miss[0]]);
      if (extra.length && !miss.length) return wrong('u8x-line-extra', 'All the lines are there, but you have drawn ' + (extra.length === 1 ? 'an extra line' : 'extra lines') + ' as well. Undo or clear the extra ' + (extra.length === 1 ? 'one' : 'ones') + '.');
      return wrong('u8x-graph', null);
    };
    var p = K.P.graph(prompt + PADHELP, pad(win), check, key, sol, hints, text);
    var bad = W0.map(function (w) { var kv = { pts: [], pieces: key.pieces.slice(), join: 'none' }; kv.pieces[0] = lineV(w.L, win).pieces[0]; return kv; });
    if (U.length > 1) bad.push({ pts: [], pieces: [key.pieces[0]], join: 'none' });
    p.bad = bad.filter(function (b) { return !DR.same(b, key); });
    return p;
  }

  /* ---------------- other part makers ---------------- */
  function mc(r, prompt, opts, sol, hints, text, keep) {
    var seen = {}, o2 = opts.filter(function (o) { if (seen[o.html]) return false; seen[o.html] = 1; return true; });
    return K.P.mc(r, prompt, o2, sol, hints, text, keep);
  }
  function samePt(a, b) { return Math.abs(fv(a[0]) - fv(b[0])) < 1e-9 && Math.abs(fv(a[1]) - fv(b[1])) < 1e-9; }
  /* the solution of a system as an ordered pair (or no solution / infinitely many) */
  function pointPart(prompt, P, Ls, opt, sol, hints, text) {
    opt = opt || {}; var isPt = Array.isArray(P);
    var W = (opt.wrong || []).filter(function (w) { return Array.isArray(w.is) ? !(isPt && samePt(w.is, P)) && w.is.every(function (v) { return isFinite(fv(v)); }) : w.is !== P; });
    var p = K.P.point(prompt, P, { system: Ls.map(arr), vars: opt.vars, wrong: W }, sol, hints, text);
    if (opt.vars) { p.key = ptK(P); p.answer = t(ptT(P)) + ', so ' + t(opt.vars[0] + '=' + nT(P[0]) + ',\\ ' + opt.vars[1] + '=' + nT(P[1])); }
    var bad = [];
    if (isPt && !samePt(P, [P[1], P[0]])) bad.push(ptK([P[1], P[0]]));
    bad.push(isPt ? 'no solution' : P === 'none' ? 'infinitely many' : 'no solution');
    W.forEach(function (w) { bad.push(Array.isArray(w.is) ? ptK(w.is) : w.is === 'none' ? 'no solution' : 'infinitely many'); });
    p.bad = bad.filter(function (x, i, a) { return a.indexOf(x) === i; });
    return p;
  }
  /* [[value, code, hint, tol?]] -> diag */
  function dg(list, ans) {
    var L2 = (list || []).filter(function (d) { return d && isFinite(fv(d[0])) && (ans == null || !near(fv(d[0]), fv(ans))); });
    return function (v) { for (var i = 0; i < L2.length; i++) if (Math.abs(v - fv(L2[i][0])) < (L2[i][3] || 1e-9)) return { code: L2[i][1], hint: L2[i][2] }; return null; };
  }
  function badOf(list, ans) { return (list || []).filter(function (d) { return isFinite(fv(d[0])) && !near(fv(d[0]), ans); }).map(function (d) { var v = fv(d[0]); return d[3] >= 0.001 && !Number.isInteger(cl(v)) ? v.toFixed(2) : String(cl(v)); }); }
  function numPart(prompt, ans, list, sol, hints, text, inp) {
    var p = B.number(prompt, ans, dg(list, ans), sol, hints, text, inp);
    p.key = String(cl(ans)); p.answer = (inp && inp.money ? t('\\$' + nf(ans)) : t(nf(ans))) + (inp && inp.after ? ' ' + inp.after : '');
    if (inp && inp.money) { p.input.before = t('\\$'); delete p.input.money; }
    p.bad = badOf(list, ans).filter(function (x, i, a) { return a.indexOf(x) === i; });
    return p;
  }
  function numC(ans, list) { return K.number(ans, dg(list, ans)); }
  /* a system of two equations in the question's letters (either order). bads: [{ eqs: [text, text], code, hint }] —
   * typical wrong systems (they are also the part's bad answers); other mistakes say which equation is right. */
  function sysWrite(prompt, Ls, vars, keyTex, sol, hints, text, bads) {
    var TL = Ls.map(function (L) { return { A: L.A, B: L.B, C: L.C }; });
    var base = K.system(TL, { vars: vars, form: 'any' });
    var rd = function (s) { var r0 = Ln.read(s, vars); return r0.ok ? [r0.a, r0.b, r0.c] : null; };
    var specs = (bads || []).map(function (b) { return { L: b.eqs.map(rd), code: b.code, hint: b.hint }; }).filter(function (b) { return b.L[0] && b.L[1] && !(Ln.same(b.L[0], arr(TL[0])) && Ln.same(b.L[1], arr(TL[1]))) && !(Ln.same(b.L[0], arr(TL[1])) && Ln.same(b.L[1], arr(TL[0]))); });
    var check = function (resp) {
      var r0 = base(resp); if (r0.v !== 'wrong') return r0;
      var S = [rd(String((resp || [])[0] || '')), rd(String((resp || [])[1] || ''))];
      if (!S[0] || !S[1]) return r0;
      for (var i = 0; i < specs.length; i++) { var b = specs[i]; if ((Ln.same(S[0], b.L[0]) && Ln.same(S[1], b.L[1])) || (Ln.same(S[0], b.L[1]) && Ln.same(S[1], b.L[0]))) return wrong(b.code, b.hint); }
      if (Ln.same(S[0], S[1])) return wrong('sys-same', 'Your two equations describe the same line. The two facts in the question give two <b>different</b> equations.');
      var hit = S.map(function (q) { return TL.some(function (L) { return Ln.same(q, arr(L)); }); });
      if (hit[0] || hit[1]) return wrong('u8x-sys-one', 'Your ' + (hit[0] ? 'first' : 'second') + ' equation is right. Check the ' + (hit[0] ? 'second' : 'first') + ' one against the words: ' + (hints[1] || hints[0]));
      return wrong('u8x-sys-eq', null);
    };
    var labels = ['Equation 1', 'Equation 2'];
    var p = { prompt: prompt, input: { type: 'fields', fields: labels.map(function (l) { return { label: l, mode: 'math', keys: 'eq', vars: vars, placeholder: 'an equation in ' + vars[0] + ' and ' + vars[1] }; }) },
      check: check, key: keyTex, answer: keyTex.map(function (k) { return t(k); }).join('<br>'), solution: sol, hints: hints || [], text: text };
    p.bad = (bads || []).map(function (b) { return b.eqs; });
    return p;
  }

  /* =====================================================================================================
   * Exit Slip 8.1 — Solving systems by graphing: how many solutions?
   * ===================================================================================================== */
  HW.defineExit({
    lesson: 'u8l1', calc: true, outcome: 'RF9',
    blurb: 'Graph a system and read its solution, decide how many solutions a system has after rearranging, and write an equation that makes a system with no solution or infinitely many.',
    questions: [
      { num: '1', shared: function (r) {
          return until(function () {
            var x0 = r.int(-4, 4), y0 = r.int(-4, 4), m1 = nz(r, -3, 3), m2 = r.pick([[1, 2], [-1, 2], [1, 3], [-1, 3], [2, 1], [-2, 1], [-1, 1], [1, 1]]);
            return { P: [x0, y0], m1: m1, m2: fr(m2), b1: y0 - m1 * x0, b2: fr(y0 * m2[1] - m2[0] * x0, m2[1]) };
          }, function (s) {
            if (fv(s.m2) === s.m1 || s.b2[1] !== 1 || Math.abs(s.b1) > 6 || Math.abs(s.b2[0]) > 6 || s.b1 === 0 && s.b2[0] === 0) return false;
            var L1 = mbL(s.m1, s.b1), L2 = mbL(s.m2, s.b2[0]);
            return latS(L1, W6).length >= 3 && latS(L2, W6).length >= 3 && (s.P[0] !== 0 || s.P[1] !== 0);
          });
        },
        stem: function (s) { return 'Consider the system ' + t(si(mbL(s.m1, s.b1))) + ' and ' + t(si(mbL(s.m2, s.b2[0]))) + '.'; },
        parts: [
          { id: '1a', outcome: 'RF9', level: 'BEG', make: function (r, s) {
            var L1 = mbL(s.m1, s.b1), L2 = mbL(s.m2, s.b2[0]), n1 = si(L1), n2 = si(L2);
            var W = [{ L: mbL(-s.m1, s.b1), code: 'u8x-gr-sign', hint: 'Check the direction of ' + t(n1) + ': its slope is ' + t(s.m1) + ', so it ' + (s.m1 < 0 ? 'falls' : 'rises') + ' from left to right.' },
              { L: mbL(s.m1, -s.b1), code: 'u8x-gr-shift', hint: 'Check where ' + t(n1) + ' crosses the ' + t('y') + '-axis: at ' + t(ptT([0, s.b1])) + '.' }];
            return sysGraph('Graph both lines on the grid.', [L1, L2], [n1, n2], W6, { wrong: W },
              t(n1) + ': start at ' + t(ptT([0, s.b1])) + ', slope ' + t(s.m1) + '.<br>' + t(n2) + ': start at ' + t(ptT([0, s.b2[0]])) + ', slope ' + t(nT(s.m2)) + '.<br>The lines cross at ' + t(ptT(s.P)) + '.',
              ['Each equation is in the form ' + t('y=mx+b') + ': plot ' + t('b') + ' on the ' + t('y') + '-axis, then use the slope.', 'Draw both lines with arrows at both ends.'], 'graph system');
          } },
          { id: '1b', outcome: 'RF9', level: 'BEG', make: function (r, s) {
            var L1 = mbL(s.m1, s.b1), L2 = mbL(s.m2, s.b2[0]);
            return pointPart('State the solution of the system.', s.P, [L1, L2], {},
              'The lines cross at ' + t(ptT(s.P)) + '.<br><b>Check.</b> ' + t(nT(s.P[1]) + '=' + s.m1 + pT(s.P[0]) + (s.b1 < 0 ? '' : '+') + s.b1) + ' ✓ and ' + t(nT(s.P[1]) + '=' + nT(s.m2) + pT(s.P[0]) + (s.b2[0] < 0 ? '' : '+') + s.b2[0]) + ' ✓',
              ['The solution is the point where the two lines cross.', 'Check it: it must make both equations true.'], 'solution from graph');
          } }] },
      { num: '2', stem: '', parts: [
        { id: '2', outcome: 'RF9', level: 'EMG', make: function (r) {
          var kind = r.pick(['one', 'none', 'inf']), a = nz(r, -5, 5), c = nz(r, -9, 9), k = r.pick([1, 2, 3]);
          var e1 = eqT([[k * a, 'x'], [-k, 'y']], k * c), m2 = a, b2 = -c;
          if (kind === 'none') b2 = until(function () { return nz(r, -9, 9); }, function (d) { return d !== -c; });
          if (kind === 'one') { m2 = until(function () { return nz(r, -5, 5); }, function (m) { return m !== a; }); b2 = nz(r, -9, 9); }
          var e2 = si(mbL(m2, b2));
          var O = { one: 'One solution — the lines have different slopes, so they cross at exactly one point.', none: 'No solution — the lines have the same slope but different ' + t('y') + '-intercepts, so they are parallel.', inf: 'Infinitely many solutions — both equations describe the same line (same slope and same ' + t('y') + '-intercept).' };
          var opts = [{ html: O.one, right: kind === 'one', why: 'Rearrange the first equation: ' + t('y=' + T([[a, 'x'], [-c, '']])) + '. Its slope is ' + t(a) + ' and the other slope is ' + t(m2) + ' — ' + (m2 === a ? 'the same.' : 'different.') },
            { html: O.none, right: kind === 'none', why: kind === 'one' ? 'The slopes, ' + t(a) + ' and ' + t(m2) + ', are different, so the lines are not parallel.' : 'Rearrange the first equation: ' + t('y=' + T([[a, 'x'], [-c, '']])) + '. The ' + t('y') + '-intercepts are both ' + t(-c) + ', so it is the same line.' },
            { html: O.inf, right: kind === 'inf', why: kind === 'one' ? 'The slopes, ' + t(a) + ' and ' + t(m2) + ', are different, so the lines are different.' : 'Rearrange the first equation: ' + t('y=' + T([[a, 'x'], [-c, '']])) + '. The ' + t('y') + '-intercepts, ' + t(-c) + ' and ' + t(b2) + ', are different.' },
            kind === 'one' ? { html: 'No solution — the two equations are written in different forms.', why: 'The form doesn’t decide it. Rearrange the first equation and compare the slopes: ' + t(a) + ' and ' + t(m2) + '.' }
              : { html: 'One solution — two different-looking equations always cross once.', why: 'Rearrange the first equation: ' + t('y=' + T([[a, 'x'], [-c, '']])) + '. Compare its slope and ' + t('y') + '-intercept with ' + t(e2) + '.' }];
          return mc(r, 'How many solutions does the system ' + t(e1) + ' and ' + t(e2) + ' have?', opts,
            'Rearrange ' + t(e1) + ': ' + t(T([[-k, 'y']]) + '=' + T([[-k * a, 'x'], [k * c, '']]) + (k > 1 ? '' : '')) + ', so ' + t('y=' + T([[a, 'x'], [-c, '']])) + ' (slope ' + t(a) + ', ' + t('y') + '-intercept ' + t(-c) + ').<br>' + t(e2) + ' has slope ' + t(m2) + ' and ' + t('y') + '-intercept ' + t(b2) + '.<br>' + O[kind],
            ['Rearrange the first equation into ' + t('y=mx+b') + '.', 'Different slopes: one solution. Same slope, different intercepts: none. Same slope and intercept: infinitely many.'], 'how many solutions ' + kind);
        } }] },
      { num: '3', stem: '', parts: [
        { id: '3', outcome: 'RF9', level: 'ADV', make: function (r) {
          var none = r.chance(0.5), a = r.int(1, 6), b = nz(r, -6, 6), c = nz(r, -12, 12);
          if (gcd(gcd(a, b), c) !== 1) c += c > 0 ? 1 : -1;
          var E = eqT([[a, 'x'], [b, 'y']], c), GL = [a, b, -c];
          var keyTex = none ? eqT([[a, 'x'], [b, 'y']], c + (c > 0 ? 5 : -5)) : eqT([[2 * a, 'x'], [2 * b, 'y']], 2 * c);
          var check = function (resp) {
            var rr = Ln.read(resp);
            if (!rr.ok) return form(rr.why === 'empty' ? 'empty' : 'line-' + rr.why, rr.why === 'empty' ? 'Type your equation first.' : rr.why === 'no-eq' ? 'Write an equation with an equals sign, using ' + t('x') + ' and ' + t('y') + '.' : 'That isn’t the equation of a line — use ' + t('x') + ' and ' + t('y') + ' to the first power only.');
            var S = [rr.a, rr.b, rr.c], par = Math.abs(S[0] * GL[1] - S[1] * GL[0]) < 1e-9, same = par && Ln.same(S, GL);
            if (none) { if (par && !same) return ok(); if (same) return wrong('u8x-same', 'Your equation describes the <b>same</b> line as ' + t(E) + ' (it is a multiple of it), so the system would have infinitely many solutions. Keep the slope but change the constant.'); return wrong('u8x-cross', 'Your line has a different slope from ' + t(E) + ', so the lines cross once: one solution. For no solution the lines must be parallel.'); }
            if (same) return ok();
            if (par) return wrong('u8x-parallel', 'Your line is parallel to ' + t(E) + ' but not the same line, so the system has <b>no</b> solution. For infinitely many, multiply <b>every</b> term (the constant too) by the same number.');
            return wrong('u8x-cross', 'Your line crosses ' + t(E) + ' once (different slope): one solution. For infinitely many, the second equation must describe the same line.');
          };
          var p = B.math('Write an equation that forms a system with ' + t(E) + ' so that the system has <b>' + (none ? 'no solution' : 'infinitely many solutions') + '</b>.', check, keyTex,
            (none ? 'For no solution the lines must be <b>parallel</b>: the same slope, a different intercept. Keep the left side and change the constant, for example ' + t(keyTex) + '. (Any equation ' + t(eqT([[a, 'x'], [b, 'y']], 0).replace('=0', '=k')) + ' with ' + t('k\\ne ' + c) + ', or a multiple of one, works.)'
              : 'For infinitely many solutions the second equation must describe the <b>same line</b>: multiply every term by the same number, for example by ' + t('2') + ': ' + t(keyTex) + '.') + '<br><b>Check.</b> Rearranged, both have slope ' + t(nT([-a, b])) + (none ? ' and different ' + t('y') + '-intercepts.' : ' and the same ' + t('y') + '-intercept.'),
            [none ? 'Parallel lines never meet: same slope, different ' + t('y') + '-intercept.' : 'Infinitely many solutions means the two equations describe the same line.', none ? 'Keep the ' + t('x') + '- and ' + t('y') + '-terms and change only the constant.' : 'Multiply every term of ' + t(E) + ' — including the constant — by the same number.'], (none ? 'none' : 'inf') + ' partner of ' + E,
            { keys: 'eq', vars: ['x', 'y'], placeholder: 'e.g. 2x - 3y = 6' });
          p.bad = none ? [E, eqT([[2 * a, 'x'], [2 * b, 'y']], 2 * c), eqT([[b, 'x'], [a, 'y']], c + 1)] : [eqT([[2 * a, 'x'], [2 * b, 'y']], c), eqT([[a, 'x'], [b, 'y']], c + 3), eqT([[b, 'x'], [a, 'y']], c)];
          p.bad = p.bad.filter(function (x) { return check(x).v !== 'correct'; });
          return p;
        } }] }
    ]
  });

  /* =====================================================================================================
   * Exit Slip 8.2 — Solving systems by substitution
   * ===================================================================================================== */
  HW.defineExit({
    lesson: 'u8l2', calc: true, outcome: 'RF9',
    blurb: 'Solve a system by substitution when one variable is already isolated, solve one that needs expanding first, and find the coefficients of a line through two points.',
    questions: [
      { num: '1', stem: '', parts: [
        { id: '1', outcome: 'RF9', level: 'BEG', make: function (r) {
          var o = until(function () { return { x0: r.int(-6, 6), y0: r.int(-6, 6), a: nz(r, -4, 4), c: nz(r, -5, 5), d: nz(r, -5, 5), xIso: r.chance(0.4) }; },
            function (o) { var det = o.xIso ? o.c * o.a + o.d : o.c + o.d * o.a; var b = o.xIso ? o.x0 - o.a * o.y0 : o.y0 - o.a * o.x0; return det !== 0 && Math.abs(b) <= 12 && b !== 0 && (o.x0 !== 0 || o.y0 !== 0) && o.x0 !== o.y0 && Math.abs(o.c * o.x0 + o.d * o.y0) <= 40; });
          var x0 = o.x0, y0 = o.y0, a = o.a, c = o.c, d = o.d, b = o.xIso ? x0 - a * y0 : y0 - a * x0, e = c * x0 + d * y0;
          var e1 = o.xIso ? 'x=' + T([[a, 'y'], [b, '']]) : 'y=' + T([[a, 'x'], [b, '']]), e2 = eqT([[c, 'x'], [d, 'y']], e);
          var L1 = o.xIso ? line(1, -a, -b) : line(-a, 1, -b), L2 = std(c, d, e);
          var W = [];
          var den = o.xIso ? c * a + d : c + d * a;
          if (!o.xIso) { var xs = (e - b) / den; if (isFinite(xs) && !near(xs, x0)) W.push({ is: [Ln.toFr(xs), Ln.toFr(a * xs + b)], code: 'u8x-distribute', hint: 'When you substitute ' + t(T([[a, 'x'], [b, '']])) + ' for ' + t('y') + ', multiply <b>both</b> terms by ' + t(d) + ': ' + t(d + '\\left(' + T([[a, 'x'], [b, '']]) + '\\right)=' + T([[d * a, 'x'], [d * b, '']])) + '.' }); }
          else { var ys = (e - b) / den; if (isFinite(ys) && !near(ys, y0)) W.push({ is: [Ln.toFr(a * ys + b), Ln.toFr(ys)], code: 'u8x-distribute', hint: 'When you substitute ' + t(T([[a, 'y'], [b, '']])) + ' for ' + t('x') + ', multiply <b>both</b> terms by ' + t(c) + ': ' + t(c + '\\left(' + T([[a, 'y'], [b, '']]) + '\\right)=' + T([[c * a, 'y'], [c * b, '']])) + '.' }); }
          var v = o.xIso ? 'y' : 'x', other = o.xIso ? 'x' : 'y', vv = o.xIso ? y0 : x0;
          var subLine = o.xIso ? T([[c, '']]).replace(/^1$/, '') + '\\left(' + T([[a, 'y'], [b, '']]) + '\\right)' + (d < 0 ? '' : '+') + T([[d, 'y']]) + '=' + e : T([[c, 'x']]) + (d < 0 ? '-' : '+') + (Math.abs(d) === 1 ? '' : Math.abs(d)) + '\\left(' + T([[a, 'x'], [b, '']]) + '\\right)=' + e;
          return pointPart('Solve the system by substitution. Give the solution as an ordered pair.' + sysT(e1, e2), [x0, y0], [L1, L2], { wrong: W },
            'Substitute ' + t(other + '=' + T([[a, v], [b, '']])) + ' into the second equation:<br>' + t(subLine) + '<br>' + t(T([[den, v]]) + (o.xIso ? (c * b < 0 ? '-' : '+') + Math.abs(c * b) : (d * b < 0 ? '-' : '+') + Math.abs(d * b)) + '=' + e) + ' &nbsp;→&nbsp; ' + t(v + '=' + vv) + '.<br>Then ' + t(other + '=' + a + pT(vv) + (b < 0 ? '' : '+') + b + '=' + (o.xIso ? x0 : y0)) + '. The solution is ' + t(ptT([x0, y0])) + '.<br><b>Check.</b> ' + t(c + pT(x0) + (d < 0 ? '' : '+') + d + pT(y0) + '=' + e) + ' ✓',
            ['The first equation already gives ' + t(other) + ' in terms of ' + t(v) + ': replace ' + t(other) + ' in the second equation with that expression (in brackets).', 'Solve for ' + t(v) + ', then substitute back to find ' + t(other) + '.'], 'substitution, isolated ' + other);
        } }] },
      { num: '2', stem: '', parts: [
        { id: '2', outcome: 'RF9', level: 'PRG', make: function (r) {
          var o = until(function () { return { x0: r.int(-5, 6), y0: r.int(-5, 6), a: r.int(2, 5), b: r.pick([1, 2, 3]), c: r.int(2, 5), d: r.pick([1, 2, 3]), p: nz(r, -5, 5), q: nz(r, -5, 5), s: nz(r, -5, 5) }; },
            function (o) { return o.a * -o.d - o.b * o.c !== 0 && (o.b === 1 || o.d === 1) && o.x0 !== o.y0 && Math.abs(o.a * (o.x0 + o.p) + o.b * (o.y0 + o.q)) <= 40 && o.p !== o.q; });
          var x0 = o.x0, y0 = o.y0, rr = o.a * (o.x0 + o.p) + o.b * (o.y0 + o.q), u = o.c * x0 - o.d * (y0 - o.s);
          var br = function (k, v, n) { return (k === 1 ? '' : k) + '(' + v + (n < 0 ? '-' : '+') + Math.abs(n) + ')'; };
          var e1 = br(o.a, 'x', o.p) + '+' + br(o.b, 'y', o.q) + '=' + rr, e2 = o.c + 'x-' + br(o.d, 'y', -o.s) + '=' + u;
          var A1 = std(o.a, o.b, rr - o.a * o.p - o.b * o.q), A2 = std(o.c, -o.d, u - o.d * o.s);
          var ex1 = eqT([[o.a, 'x'], [o.b, 'y']], rr - o.a * o.p - o.b * o.q), ex2 = eqT([[o.c, 'x'], [-o.d, 'y']], u - o.d * o.s);
          var W = [];
          var B2 = std(o.c, -o.d, u + o.d * o.s), ip = (function () { var D = A1.A * B2.B - B2.A * A1.B; if (!D) return null; return [(A1.B * B2.C - B2.B * A1.C) / D, (B2.A * A1.C - A1.A * B2.C) / D]; })();
          if (ip && isFinite(ip[0])) W.push({ is: [Ln.toFr(ip[0]), Ln.toFr(ip[1])], code: 'u8x-c-sign', hint: 'Check how you expanded ' + t('-' + br(o.d, 'y', -o.s)) + ': the minus sign multiplies <b>both</b> terms in the bracket.' });
          return pointPart('Solve the system by substitution. Give the solution as an ordered pair.' + sysT(e1, e2), [x0, y0], [A1, A2], { wrong: W },
            'Expand and simplify each equation first:<br>' + t(ex1) + ' and ' + t(ex2) + '.<br>Isolate the variable with coefficient ' + t('\\pm1') + ' in one equation, substitute it into the other, and solve.<br>The solution is ' + t(ptT([x0, y0])) + '.<br><b>Check.</b> ' + t(br(o.a, pT(x0), o.p) + '+' + br(o.b, pT(y0), o.q) + '=' + rr) + ' ✓ and ' + t(o.c + pT(x0) + '-' + br(o.d, pT(y0), -o.s) + '=' + u) + ' ✓',
            ['Expand the brackets and collect like terms in both equations first.', 'Then isolate a variable whose coefficient is ' + t('1') + ' or ' + t('-1') + ', and substitute.'], 'substitution with brackets');
        } }] },
      { num: '3', stem: '', parts: [
        { id: '3', outcome: 'RF9', level: 'ADV', make: function (r) {
          var o = until(function () {
            var pp = nz(r, -5, 5), qq = nz(r, -5, 5), g = r.pick([1, 1, 2, 3]), x1 = r.int(-5, 5), y1 = r.int(-5, 5), j = r.pick([-2, -1, 1, 2]);
            return { pp: pp, qq: qq, g: g, x1: x1, y1: y1, x2: x1 + qq * j, y2: y1 - pp * j };
          }, function (o) { var p = o.g * o.pp, q = o.g * o.qq, c = -(p * o.x1 + q * o.y1); return gcd(o.pp, o.qq) === 1 && c !== 0 && Math.abs(c) <= 24 && Math.abs(o.x2) <= 9 && Math.abs(o.y2) <= 9 && p !== q && Math.abs(p) !== Math.abs(q) && o.x1 !== o.x2; });
          var p = o.g * o.pp, q = o.g * o.qq, c = -(p * o.x1 + q * o.y1), Lname = 'px+qy' + (c < 0 ? '-' : '+') + Math.abs(c) + '=0';
          var P1 = [o.x1, o.y1], P2 = [o.x2, o.y2];
          var e1 = T([[o.x1, 'p'], [o.y1, 'q'], [c, '']]) + '=0', e2 = T([[o.x2, 'p'], [o.y2, 'q'], [c, '']]) + '=0';
          var flds = [{ label: t('p') + ' =', name: t('p'), mode: 'math', keys: 'fraction', placeholder: 'a number' }, { label: t('q') + ' =', name: t('q'), mode: 'math', keys: 'fraction', placeholder: 'a number' }];
          var cks = [numC(p, [[-p, 'u8x-c-sign', 'Check the signs: when the constant ' + t(c) + ' moves to the other side, it changes sign.'], [q, 'u8x-pq-swap', 'That’s the value of ' + t('q') + '. ' + t('p') + ' is the coefficient of ' + t('x') + '.']]),
            numC(q, [[-q, 'u8x-c-sign', 'Check the signs: when the constant ' + t(c) + ' moves to the other side, it changes sign.'], [p, 'u8x-pq-swap', 'That’s the value of ' + t('p') + '. ' + t('q') + ' is the coefficient of ' + t('y') + '.']])];
          var pr = B.fields('The line ' + t(Lname) + ' passes through the points ' + t(ptT(P1)) + ' and ' + t(ptT(P2)) + '. Determine the values of ' + t('p') + ' and ' + t('q') + '.', flds, cks, [String(p), String(q)], t('p=' + p + ',\\ q=' + q),
            'Substitute each point into ' + t(Lname) + ':<br>' + t(ptT(P1)) + ': ' + t(e1) + '<br>' + t(ptT(P2)) + ': ' + t(e2) + '<br>Solve this system in ' + t('p') + ' and ' + t('q') + ' by substitution (isolate the letter with the simpler coefficient): ' + t('p=' + p) + ', ' + t('q=' + q) + '.<br>The line is ' + t(T([[p, 'x'], [q, 'y'], [c, '']]) + '=0') + '. <b>Check.</b> ' + t(T([[p, '']]) + pT(o.x2) + (q < 0 ? '' : '+') + q + pT(o.y2) + (c < 0 ? '' : '+') + c + '=0') + ' ✓',
            ['Each point gives an equation: replace ' + t('x') + ' and ' + t('y') + ' with its coordinates. The unknowns are ' + t('p') + ' and ' + t('q') + '.', 'Solve the two equations in ' + t('p') + ' and ' + t('q') + ' by substitution.'], 'p, q from two points');
          pr.bad = [[String(-p), String(-q)], [String(q), String(p)], [String(p), String(-q)]];
          return pr;
        } }] }
    ]
  });

  /* =====================================================================================================
   * Exit Slip 8.3 — The elimination method
   * ===================================================================================================== */
  HW.defineExit({
    lesson: 'u8l3', calc: true, outcome: 'RF9',
    blurb: 'Solve by adding or subtracting the equations, recognize the result of eliminating a variable after scaling, solve when both equations must be scaled, and solve a system with fractions.',
    questions: [
      { num: '1', stem: '', parts: [
        { id: '1', outcome: 'RF9', level: 'BEG', make: function (r) {
          var o = until(function () { return { x0: r.int(-6, 6), y0: r.int(-6, 6), a: nz(r, -7, 7), b: nz(r, -7, 7), k: r.int(1, 6), add: r.chance(0.5), elimX: r.chance(0.3) }; },
            function (o) { return Math.abs(o.a) !== Math.abs(o.b) && (o.add ? o.a + o.b : o.a - o.b) !== 0 && o.x0 !== o.y0 && (o.x0 || o.y0); });
          var x0 = o.x0, y0 = o.y0, k = o.k, s2 = o.add ? -1 : 1;
          var c1 = o.elimX ? [[k, 'x'], [o.a, 'y']] : [[o.a, 'x'], [k, 'y']], c2 = o.elimX ? [[s2 * k, 'x'], [o.b, 'y']] : [[o.b, 'x'], [s2 * k, 'y']];
          var r1 = o.elimX ? k * x0 + o.a * y0 : o.a * x0 + k * y0, r2 = o.elimX ? s2 * k * x0 + o.b * y0 : o.b * x0 + s2 * k * y0;
          var e1 = eqT(c1, r1), e2 = eqT(c2, r2), L1 = std(c1[0][0], c1[1][0], r1), L2 = std(c2[0][0], c2[1][0], r2);
          var v = o.elimX ? 'y' : 'x', coef = o.add ? o.a + o.b : o.a - o.b, rhs = o.add ? r1 + r2 : r1 - r2, other = o.elimX ? 'x' : 'y';
          return pointPart('Solve the system by elimination. Give the solution as an ordered pair.' + sysT(e1, e2), [x0, y0], [L1, L2], {},
            'The ' + t(other) + '-terms are ' + (o.add ? 'opposites, so <b>add</b>' : 'equal, so <b>subtract</b>') + ' the equations: ' + t(T([[coef, v]]) + '=' + rhs) + ', so ' + t(v + '=' + (o.elimX ? y0 : x0)) + '.<br>Substitute into the first equation to find ' + t(other + '=' + (o.elimX ? x0 : y0)) + '. The solution is ' + t(ptT([x0, y0])) + '.<br><b>Check</b> in the second equation: ' + t(T([[c2[0][0], '']]).replace(/^1$/, '') + pT(x0) + (c2[1][0] < 0 ? '' : '+') + c2[1][0] + pT(y0) + '=' + r2) + ' ✓',
            ['Look for a variable with the same coefficient (subtract) or opposite coefficients (add).', 'After you find one variable, substitute it to find the other.'], 'elimination direct');
        } }] },
      { num: '2', stem: '', parts: [
        { id: '2', outcome: 'RF9', level: 'EMG', make: function (r) {
          var o = until(function () { return { a: nz(r, -6, 6), b: r.int(1, 4), c: nz(r, -15, 15), d: nz(r, -7, 7), k: r.pick([2, 3]), f: nz(r, -15, 15), add: r.chance(0.6) }; },
            function (o) { return (o.k * o.a + (o.add ? o.d : -o.d)) !== 0 && o.k * o.a !== o.d && Math.abs(o.d) !== Math.abs(o.a); });
          var e = o.k * o.b, s2 = o.add ? -1 : 1, E1 = eqT([[o.a, 'x'], [o.b, 'y']], o.c), E2 = eqT([[o.d, 'x'], [s2 * e, 'y']], o.f);
          var right = o.add ? [o.k * o.a + o.d, o.k * o.c + o.f] : [o.k * o.a - o.d, o.k * o.c - o.f];
          var noC = o.add ? [o.k * o.a + o.d, o.c + o.f] : [o.k * o.a - o.d, o.c - o.f], noS = o.add ? [o.a + o.d, o.c + o.f] : [o.a - o.d, o.c - o.f], wsg = o.add ? [o.k * o.a - o.d, o.k * o.c - o.f] : [o.k * o.a + o.d, o.k * o.c + o.f];
          var eq = function (p) { return t(T([[p[0], 'x']]) + '=' + p[1]); };
          return mc(r, 'When ' + t('y') + ' is eliminated from the equations ' + t(E1) + ' and ' + t(E2) + ', the result is', [
            { html: eq(right), right: true },
            { html: eq(noC), why: 'Multiply <b>every</b> term of the first equation by ' + t(o.k) + ' — the constant ' + t(o.c) + ' too.' },
            { html: eq(noS), why: 'The ' + t('y') + '-terms, ' + t(T([[o.b, 'y']])) + ' and ' + t(T([[s2 * e, 'y']])) + ', don’t cancel yet: first multiply the first equation by ' + t(o.k) + '.' },
            { html: eq(wsg), why: 'After multiplying the first equation by ' + t(o.k) + ', the ' + t('y') + '-terms are ' + (o.add ? 'opposites, so <b>add</b> the equations.' : 'equal, so <b>subtract</b> the equations.') }],
            'Multiply the first equation by ' + t(o.k) + ': ' + t(eqT([[o.k * o.a, 'x'], [e, 'y']], o.k * o.c)) + '. Now the ' + t('y') + '-terms are ' + (o.add ? 'opposites, so add' : 'equal, so subtract') + ': ' + eq(right) + '.',
            ['Make the ' + t('y') + '-coefficients the same size first: multiply the whole first equation by ' + t(o.k) + '.', 'Then add (opposite signs) or subtract (same signs).'], 'eliminate y result');
        } }] },
      { num: '3', stem: '', parts: [
        { id: '3', outcome: 'RF9', level: 'PRG', make: function (r) {
          var o = until(function () { return { x0: r.int(-6, 6), y0: r.int(-6, 6), a1: nz(r, -7, 7), b1: nz(r, -7, 7), a2: nz(r, -7, 7), b2: nz(r, -7, 7) }; },
            function (o) {
              var det = o.a1 * o.b2 - o.a2 * o.b1, mult = function (u, v) { return Math.abs(u) === 1 || Math.abs(v) === 1 || u % v === 0 || v % u === 0; };
              return det !== 0 && !mult(o.a1, o.a2) && !mult(o.b1, o.b2) && gcd(o.a1, o.b1) === 1 && gcd(o.a2, o.b2) === 1 && o.x0 !== o.y0 && (o.x0 || o.y0) && Math.abs(o.a1 * o.x0 + o.b1 * o.y0) <= 50 && Math.abs(o.a2 * o.x0 + o.b2 * o.y0) <= 50;
            });
          var x0 = o.x0, y0 = o.y0, c1 = o.a1 * x0 + o.b1 * y0, c2 = o.a2 * x0 + o.b2 * y0;
          var e1 = eqT([[o.a1, 'x'], [o.b1, 'y']], c1), e2 = eqT([[o.a2, 'x'], [o.b2, 'y']], c2), L1 = std(o.a1, o.b1, c1), L2 = std(o.a2, o.b2, c2);
          var lc = Math.abs(o.b1 * o.b2) / gcd(o.b1, o.b2), k1 = lc / Math.abs(o.b1), k2 = lc / Math.abs(o.b2), same = (o.b1 > 0) === (o.b2 > 0);
          var cx = same ? k1 * o.a1 - k2 * o.a2 : k1 * o.a1 + k2 * o.a2, cr = same ? k1 * c1 - k2 * c2 : k1 * c1 + k2 * c2;
          return pointPart('Solve the system by elimination. Give the solution as an ordered pair.' + sysT(e1, e2), [x0, y0], [L1, L2], {},
            'Eliminate ' + t('y') + ': multiply the first equation by ' + t(k1) + ' and the second by ' + t(k2) + ':<br>' + t(eqT([[k1 * o.a1, 'x'], [k1 * o.b1, 'y']], k1 * c1)) + '<br>' + t(eqT([[k2 * o.a2, 'x'], [k2 * o.b2, 'y']], k2 * c2)) + '<br>' + (same ? 'Subtract' : 'Add') + ': ' + t(T([[cx, 'x']]) + '=' + cr) + ', so ' + t('x=' + x0) + '.<br>Substitute into the first equation: ' + t(o.a1 + pT(x0) + (o.b1 < 0 ? '' : '+') + o.b1 + 'y=' + c1) + ', so ' + t('y=' + y0) + '.<br>The solution is ' + t(ptT([x0, y0])) + '. <b>Check</b> in the second equation ✓',
            ['Neither variable lines up yet: multiply <b>both</b> equations so that one variable gets the same coefficient (use the lowest common multiple).', 'Every term of an equation, including the constant, gets multiplied.'], 'elimination both scaled');
        } }] },
      { num: '4', stem: '', parts: [
        { id: '4', outcome: 'RF9', level: 'ADV', make: function (r) {
          var o = until(function () { return { a: r.pick([2, 3, 4, 5]), b: r.pick([2, 3, 4, 5, 6]), d: r.pick([2, 3, 4, 5]), e: r.pick([2, 3, 4, 6]), i: nz(r, -3, 3), j: nz(r, -3, 3), p: nz(r, -5, 5) }; },
            function (o) {
              var x0 = o.a * o.i, y0 = o.b * o.j; if ((x0 - o.p) % o.d !== 0 || y0 % o.e !== 0 || o.a === o.b || o.d === o.e) return false;
              var c1 = x0 / o.a + y0 / o.b, c2 = (x0 - o.p) / o.d - y0 / o.e; return Math.abs(x0) <= 15 && Math.abs(y0) <= 15 && c1 !== 0 && (1 / (o.a * -o.e) - 1 / (o.b * o.d)) !== 0 && Math.abs(c2) <= 9;
            });
          var x0 = o.a * o.i, y0 = o.b * o.j, c1 = x0 / o.a + y0 / o.b, c2 = (x0 - o.p) / o.d - y0 / o.e;
          var e1 = '\\dfrac{x}{' + o.a + '}+\\dfrac{y}{' + o.b + '}=' + c1, e2 = '\\dfrac{x' + (o.p < 0 ? '+' : '-') + Math.abs(o.p) + '}{' + o.d + '}-\\dfrac{y}{' + o.e + '}=' + c2;
          var L1 = std(o.b, o.a, o.a * o.b * c1), L2 = std(o.e, -o.d, o.d * o.e * c2 + o.e * o.p);
          var n1 = eqT([[o.b, 'x'], [o.a, 'y']], o.a * o.b * c1), n2 = eqT([[o.e, 'x'], [-o.d, 'y']], o.d * o.e * c2 + o.e * o.p);
          var W = [{ is: (function () { var M = std(o.e, -o.d, o.d * o.e * c2 + o.p), D = L1.A * M.B - M.A * L1.B; return D ? [Ln.toFr((L1.B * M.C - M.B * L1.C) / D), Ln.toFr((M.A * L1.C - L1.A * M.C) / D)] : [NaN, NaN]; })(), code: 'u8x-elim-const',
            hint: 'When you clear the fractions in the second equation, multiply <b>every</b> part by ' + t(o.d * o.e) + ': ' + t(o.d * o.e + '\\times\\frac{x' + (o.p < 0 ? '+' : '-') + Math.abs(o.p) + '}{' + o.d + '}=' + o.e + '(x' + (o.p < 0 ? '+' : '-') + Math.abs(o.p) + ')') + ' — the ' + t(Math.abs(o.p)) + ' gets multiplied too.' }];
          return pointPart('Solve the system by elimination. Give the solution as an ordered pair.' + sysT(e1, e2), [x0, y0], [L1, L2], { wrong: W },
            'Clear the fractions first.<br>Multiply the first equation by ' + t(o.a * o.b) + ': ' + t(n1) + '.<br>Multiply the second equation by ' + t(o.d * o.e) + ': ' + t(o.e + '(x' + (o.p < 0 ? '+' : '-') + Math.abs(o.p) + ')-' + o.d + 'y=' + o.d * o.e * c2) + ', so ' + t(n2) + '.<br>Now eliminate one variable and solve: ' + t('x=' + x0) + ', ' + t('y=' + y0) + '.<br><b>Check.</b> ' + t('\\frac{' + x0 + '}{' + o.a + '}+\\frac{' + y0 + '}{' + o.b + '}=' + c1) + ' ✓',
            ['Multiply each equation by the lowest common denominator of its fractions so that every coefficient is an integer.', 'Then eliminate a variable as usual.'], 'elimination with fractions');
        } }] }
    ]
  });

  /* =====================================================================================================
   * Exit Slip 8.4 — Word problems with systems of equations
   * ===================================================================================================== */
  var ITEMS = [['pizza', 'pizzas', 'salad', 'salads'], ['burger', 'burgers', 'milkshake', 'milkshakes'], ['notebook', 'notebooks', 'binder', 'binders'], ['bag of apples', 'bags of apples', 'bag of oranges', 'bags of oranges'], ['movie ticket', 'movie tickets', 'popcorn combo', 'popcorn combos']];
  HW.defineExit({
    lesson: 'u8l4', calc: true, outcome: 'RF9',
    blurb: 'Write a system of equations for a word problem, solve a two-price problem and use the prices, and solve a digit problem.',
    questions: [
      { num: '1', stem: '', parts: [
        { id: '1', outcome: 'RF9', level: 'EMG', make: function (r) {
          var kind = r.pick(['rect', 'nums', 'tix', 'coins']);
          if (kind === 'rect') {
            var w = r.int(4, 20), k = r.int(2, 9), twice = r.chance(0.5), l = twice ? 2 * w - k : w + k, P = 2 * (l + w);
            if (l <= w) { l = w + k; twice = false; P = 2 * (l + w); }
            var rel = twice ? 'is ' + t(k) + ' cm less than twice its width' : 'is ' + t(k) + ' cm more than its width';
            var E2 = twice ? line(1, -2, k) : line(1, -1, -k);
            return sysWrite('A rectangle has a perimeter of ' + t(P) + ' cm. Its length ' + rel + '. Let ' + t('l') + ' be the length and ' + t('w') + ' the width, in centimetres. Write a system of two equations that models this situation. (Don’t solve it.)',
              [line(2, 2, -P), E2], ['l', 'w'], ['2l+2w=' + P, twice ? 'l=2w-' + k : 'l=w+' + k],
              'Perimeter: ' + t('2l+2w=' + P) + '.<br>Length: ' + t(twice ? 'l=2w-' + k : 'l=w+' + k) + '.',
              ['A rectangle’s perimeter is ' + t('2l+2w') + '.', 'Translate the sentence about the length word by word: “is” becomes ' + t('=') + '.'], 'write system rectangle', [{ eqs: ['l+w=' + P, twice ? 'l=2w-' + k : 'l=w+' + k], code: 'u8x-sys-double', hint: 'The perimeter goes all the way round: two lengths and two widths, ' + t('2l+2w') + '.' }, { eqs: ['2l+2w=' + P, twice ? 'l=2w+' + k : 'w=l+' + k], code: 'u8x-sys-rel', hint: 'Check the sentence about the length: the length ' + rel + ', so ' + t(twice ? 'l=2w-' + k : 'l=w+' + k) + '.' }]);
          }
          if (kind === 'nums') {
            var y = r.int(-6, 12), m = r.pick([2, 3]), d = r.int(1, 9), x = m * y + d, s = x + y;
            return sysWrite('The sum of two numbers is ' + t(s) + '. The larger number is ' + t(d) + ' more than ' + (m === 2 ? 'twice' : 'three times') + ' the smaller number. Let ' + t('x') + ' be the larger number and ' + t('y') + ' the smaller number. Write a system of two equations that models this situation. (Don’t solve it.)',
              [line(1, 1, -s), line(1, -m, -d)], ['x', 'y'], ['x+y=' + s, 'x=' + m + 'y+' + d],
              'Sum: ' + t('x+y=' + s) + '.<br>“The larger is ' + t(d) + ' more than ' + (m === 2 ? 'twice' : 'three times') + ' the smaller”: ' + t('x=' + m + 'y+' + d) + '.',
              ['“The sum of two numbers” means you add them.', '“' + t(d) + ' more than ' + (m === 2 ? 'twice' : 'three times') + ' the smaller” is ' + t(m + 'y+' + d) + '.'], 'write system numbers', [{ eqs: ['x+y=' + s, 'y=' + m + 'x+' + d], code: 'u8x-sys-rel', hint: t('x') + ' is the <b>larger</b> number, so it is the one that equals ' + (m === 2 ? 'twice' : 'three times') + ' the smaller plus ' + t(d) + ': ' + t('x=' + m + 'y+' + d) + '.' }, { eqs: ['x+y=' + s, m + 'x=y+' + d], code: 'u8x-sys-rel', hint: '“The larger is ' + t(d) + ' more than ' + (m === 2 ? 'twice' : 'three times') + ' the smaller”: ' + t('x=' + m + 'y+' + d) + '.' }]);
          }
          if (kind === 'tix') {
            var A = r.int(9, 16), S = r.int(4, A - 2), na = r.int(40, 160), ns = r.int(40, 160), N = na + ns, R = A * na + S * ns;
            return sysWrite('A school sold ' + t(N) + ' tickets to its play. Adult tickets cost ' + t('\\$' + A) + ' and student tickets cost ' + t('\\$' + S) + '. Ticket sales came to ' + t('\\$' + F(R)) + '. Let ' + t('a') + ' be the number of adult tickets and ' + t('s') + ' the number of student tickets. Write a system of two equations that models this situation. (Don’t solve it.)',
              [line(1, 1, -N), line(A, S, -R)], ['a', 's'], ['a+s=' + N, A + 'a+' + S + 's=' + R],
              'Number of tickets: ' + t('a+s=' + N) + '.<br>Money: ' + t(A + 'a+' + S + 's=' + F(R)) + '.',
              ['One equation counts the tickets; the other adds up the money.', 'Money from adult tickets is (price) × (number of adult tickets).'], 'write system tickets', [{ eqs: ['a+s=' + N, S + 'a+' + A + 's=' + R], code: 'u8x-sys-coef', hint: 'Each price goes with its own kind of ticket: adult tickets ' + t('a') + ' cost ' + t('\\$' + A) + '.' }, { eqs: ['a+s=' + R, A + 'a+' + S + 's=' + N], code: 'u8x-sys-total', hint: 'The number of tickets adds up to ' + t(N) + '; the money adds up to ' + t('\\$' + F(R)) + '.' }]);
          }
          var nn = r.int(10, 60), nd = r.int(10, 60), N2 = nn + nd, V = (5 * nn + 25 * nd) / 100;
          return sysWrite('A jar holds ' + t(N2) + ' coins, all nickels and quarters, worth ' + t('\\$' + V.toFixed(2)) + ' in total. Let ' + t('n') + ' be the number of nickels and ' + t('q') + ' the number of quarters. Write a system of two equations that models this situation. (Don’t solve it.)',
            [line(1, 1, -N2), line(5, 25, -Math.round(V * 100))], ['n', 'q'], ['n+q=' + N2, '0.05n+0.25q=' + V.toFixed(2)],
            'Number of coins: ' + t('n+q=' + N2) + '.<br>Value (in dollars): ' + t('0.05n+0.25q=' + V.toFixed(2)) + ' (or, in cents, ' + t('5n+25q=' + Math.round(V * 100)) + ').',
            ['One equation counts the coins; the other adds up their value.', 'A nickel is worth ' + t('\\$0.05') + ' and a quarter ' + t('\\$0.25') + '. Use the same units on both sides.'], 'write system coins', [{ eqs: ['n+q=' + N2, '0.25n+0.05q=' + V.toFixed(2)], code: 'u8x-sys-coef', hint: 'Each value goes with its own coin: ' + t('n') + ' nickels are worth ' + t('0.05n') + ' dollars.' }, { eqs: ['n+q=' + N2, '5n+25q=' + V.toFixed(2)], code: 'u8x-sys-units', hint: 'Use the same units on both sides: ' + t('5n+25q') + ' is in cents, so the total must be ' + t(Math.round(V * 100)) + ' cents (or use ' + t('0.05n+0.25q') + ' for dollars).' }]);
        } }] },
      { num: '2', shared: function (r) {
          return until(function () {
            var it = r.pick(ITEMS), x = r.int(3, 15), y = r.int(2, 12), a1 = r.int(2, 6), b1 = r.int(1, 5), a2 = r.int(1, 5), b2 = r.int(2, 6), qa = r.int(2, 8), qb = r.int(2, 8);
            return { it: it, x: x, y: y, a1: a1, b1: b1, a2: a2, b2: b2, c1: a1 * x + b1 * y, c2: a2 * x + b2 * y, qa: qa, qb: qb };
          }, function (s) { return s.x !== s.y && s.a1 * s.b2 - s.a2 * s.b1 !== 0 && !(s.a1 === s.a2 && s.b1 === s.b2) && s.a1 * s.b2 !== s.a2 * s.b1 && !(s.qa === s.a1 && s.qb === s.b1) && !(s.qa === s.a2 && s.qb === s.b2) && s.qa * s.x + s.qb * s.y !== s.qa * s.y + s.qb * s.x; });
        },
        stem: function (s) { var it = s.it; return t(s.a1) + ' ' + it[s.a1 === 1 ? 0 : 1] + ' and ' + t(s.b1) + ' ' + it[s.b1 === 1 ? 2 : 3] + ' cost ' + t('\\$' + s.c1) + '. ' + t(s.a2) + ' ' + it[s.a2 === 1 ? 0 : 1] + ' and ' + t(s.b2) + ' ' + it[s.b2 === 1 ? 2 : 3] + ' cost ' + t('\\$' + s.c2) + '. (All ' + it[1] + ' cost the same, and so do all ' + it[3] + '.)'; },
        parts: [
          { id: '2a', outcome: 'RF9', level: 'PRG', make: function (r, s) {
            var it = s.it, sw = [[s.y, 'u8x-price-swap', 'You swapped the two prices: check which item each equation’s coefficients belong to.']];
            var p = B.fields('Set up and solve a system of equations to find the price of one ' + it[0] + ' and the price of one ' + it[2] + '.',
              [{ label: 'One ' + it[0] + ':', name: it[0], before: t('\\$'), mode: 'math', keys: 'fraction', placeholder: 'a number' }, { label: 'One ' + it[2] + ':', name: it[2], before: t('\\$'), mode: 'math', keys: 'fraction', placeholder: 'a number' }],
              [numC(s.x, sw), numC(s.y, [[s.x, 'u8x-price-swap', 'You swapped the two prices.']])], [String(s.x), String(s.y)], it[0] + ' ' + t('\\$' + s.x) + ', ' + it[2] + ' ' + t('\\$' + s.y),
              'Let ' + t('a') + ' be the price of a ' + it[0] + ' and ' + t('b') + ' the price of a ' + it[2] + ':<br>' + t(s.a1 + 'a+' + s.b1 + 'b=' + s.c1) + ' and ' + t(s.a2 + 'a+' + s.b2 + 'b=' + s.c2) + '.<br>Solve (elimination or substitution): ' + t('a=' + s.x) + ', ' + t('b=' + s.y) + '.<br><b>Check.</b> ' + t(s.a2 + '(' + s.x + ')+' + s.b2 + '(' + s.y + ')=' + s.c2) + ' ✓',
              ['Let two letters stand for the two prices; each sentence gives one equation.', 'Solve the system by elimination (or substitution).'], 'two prices');
            p.bad = [[String(s.y), String(s.x)], [String(s.x), String(s.x)]];
            return p;
          } },
          { id: '2b', outcome: 'RF9', level: 'PRG', make: function (r, s) {
            var it = s.it, ans = s.qa * s.x + s.qb * s.y;
            return numPart('How much do ' + t(s.qa) + ' ' + it[1] + ' and ' + t(s.qb) + ' ' + it[3] + ' cost?', ans,
              [[s.qa * s.y + s.qb * s.x, 'u8x-combo-swap', 'Check which price goes with which item: ' + t(s.qa) + ' ' + it[1] + ' and ' + t(s.qb) + ' ' + it[3] + '.'], [s.qa * s.x + s.qb * (s.y + 1), 'u8x-combo-one', 'Check the price of one ' + it[2] + ' by substituting it back into both equations.']],
              t(s.qa + '(' + s.x + ')+' + s.qb + '(' + s.y + ')=' + s.qa * s.x + '+' + s.qb * s.y + '=' + ans) + ', so they cost ' + t('\\$' + ans) + '.',
              ['Use the two prices you found.', 'Multiply each price by the number of items, then add.'], 'combination cost', { money: true });
          } }] },
      { num: '3', stem: '', parts: [
        { id: '3', outcome: 'RF9', level: 'ADV', make: function (r) {
          var o = until(function () { return { tn: r.int(1, 9), un: r.int(1, 9) }; }, function (o) { return o.tn !== o.un; });
          var tn = o.tn, un = o.un, s = tn + un, d = 9 * (un - tn), N = 10 * tn + un, Rv = 10 * un + tn;
          return numPart('A two-digit number has digits whose sum is ' + t(s) + '. When the digits are reversed, the new number is ' + t(Math.abs(d)) + ' ' + (d > 0 ? 'more' : 'less') + ' than the original number. What is the original number?', N,
            [[Rv, 'u8x-digit-rev', 'That’s the number with its digits reversed. The original number is ' + t('10t+u') + ', where ' + t('t') + ' is its tens digit.'], [s, 'u8x-digit-sum', 'That’s the sum of the digits. Use it in one equation, ' + t('t+u=' + s) + ', and find each digit.'], [Math.abs(d), 'u8x-digit-sum', 'That’s the difference between the numbers. Let ' + t('t') + ' and ' + t('u') + ' be the digits and write two equations.']],
            'Let ' + t('t') + ' be the tens digit and ' + t('u') + ' the units digit, so the number is ' + t('10t+u') + ' and the reversed number is ' + t('10u+t') + '.<br>' + t('t+u=' + s) + '<br>' + t('10u+t=10t+u' + (d > 0 ? '+' : '-') + Math.abs(d)) + ', so ' + t('9u-9t=' + d) + ', i.e. ' + t('u-t=' + (d / 9)) + '.<br>Adding: ' + t('2u=' + (s + d / 9)) + ', so ' + t('u=' + un) + ' and ' + t('t=' + tn) + '. The number is ' + t(N) + '.<br><b>Check.</b> ' + t(Rv + (d > 0 ? '-' : '+') + N + '=' + (d > 0 ? d : -d)) + ' ✓',
            ['Let ' + t('t') + ' and ' + t('u') + ' be the digits: the number is ' + t('10t+u') + ' and the reversed number is ' + t('10u+t') + '.', 'Write one equation for the digit sum and one comparing the two numbers.'], 'digit problem');
        } }] }
    ]
  });

  /* =====================================================================================================
   * Exit Slip 8.5 — Mixture and motion problems
   * ===================================================================================================== */
  var BLENDS = [{ what: 'coffee beans', u: 'kg', a: [9, 14], b: [15, 22] }, { what: 'trail mix', u: 'kg', a: [6, 10], b: [11, 16] }, { what: 'tea leaves', u: 'kg', a: [20, 30], b: [32, 45] }, { what: 'birdseed', u: 'kg', a: [2, 4], b: [5, 8] }];
  var SOLS = [{ what: 'acid solution', u: 'mL', who: 'A lab technician' }, { what: 'saline solution', u: 'mL', who: 'A nurse' }, { what: 'antifreeze solution', u: 'L', who: 'A mechanic' }, { what: 'alloy that is pure silver', u: 'g', who: 'A jeweller', alloy: true }];
  var MOVERS = [{ v: 'plane', still: 'in still air', med: 'wind', with: 'with the wind', against: 'into the wind', u: 'km/h', D: [600, 1800], spd: [180, 400], cur: [20, 60], tt: [2, 6] },
    { v: 'boat', still: 'in still water', med: 'current', with: 'downstream', against: 'upstream', u: 'km/h', D: [24, 120], spd: [12, 40], cur: [2, 8], tt: [1, 6] }];
  HW.defineExit({
    lesson: 'u8l5', calc: true, outcome: 'RF9',
    blurb: 'Write the system for a mixture problem, solve a percent-mixture problem, and solve a motion problem with a wind or current.',
    questions: [
      { num: '1', stem: '', parts: [
        { id: '1', outcome: 'RF9', level: 'EMG', make: function (r) {
          var c = r.pick(BLENDS), pa = r.int(c.a[0], c.a[1]), pb = r.int(c.b[0], c.b[1]), x = 5 * r.int(2, 12), y = 5 * r.int(2, 12), N = x + y, V = pa * x + pb * y, perKg = r.chance(0.4) && V % N === 0;
          var tail = perKg ? 'to make ' + t(N) + ' kg of a blend worth ' + t('\\$' + (V / N)) + ' per kg' : 'to make ' + t(N) + ' kg of a blend worth ' + t('\\$' + F(V)) + ' in total';
          return sysWrite('A store mixes ' + c.what + ' that sell for ' + t('\\$' + pa) + ' per kg with ' + c.what + ' that sell for ' + t('\\$' + pb) + ' per kg ' + tail + '. Let ' + t('x') + ' be the mass of the ' + t('\\$' + pa) + ' ' + c.what + ' and ' + t('y') + ' the mass of the ' + t('\\$' + pb) + ' ' + c.what + ', in kg. Write a system of two equations: one for the total mass and one for the total value. (Don’t solve it.)',
            [line(1, 1, -N), line(pa, pb, -V)], ['x', 'y'], ['x+y=' + N, pa + 'x+' + pb + 'y=' + V],
            'Total mass: ' + t('x+y=' + N) + '.<br>Total value: ' + t(pa + 'x+' + pb + 'y=' + (perKg ? (V / N) + '(' + N + ')=' : '') + F(V)) + '.',
            ['One equation adds the masses; the other adds the values (price per kg × mass).', perKg ? 'The blend’s total value is (its price per kg) × (its mass).' : 'The total value is given in dollars.'], 'write mixture system', [{ eqs: ['x+y=' + N, pa + 'x+' + pb + 'y=' + (perKg ? V / N : N)], code: 'u8x-sys-total', hint: perKg ? 'The value equation needs the blend’s total value: ' + t('\\$' + (V / N)) + ' per kg × ' + t(N) + ' kg.' : 'The value equation adds up dollars, so its total is ' + t('\\$' + F(V)) + ', not the mass.' }, { eqs: ['x+y=' + V, pa + 'x+' + pb + 'y=' + N], code: 'u8x-sys-total', hint: 'The masses add up to ' + t(N) + ' kg; the values add up to ' + t('\\$' + F(V)) + '.' }]);
        } }] },
      { num: '2', stem: '', parts: [
        { id: '2', outcome: 'RF9', level: 'PRG', make: function (r) {
          var c = r.pick(SOLS), o = until(function () { var p1 = 5 * r.int(1, 8), p2 = 5 * r.int(p1 / 5 + 2, 19), x = 10 * r.int(2, 40), y = 10 * r.int(2, 40); return { p1: p1, p2: p2, x: x, y: y }; },
            function (o) { var p = (o.p1 * o.x + o.p2 * o.y) / (o.x + o.y); return Number.isInteger(p) && o.x !== o.y && p !== o.p1 && p !== o.p2 && o.x + o.y <= 600; });
          var V = o.x + o.y, p = (o.p1 * o.x + o.p2 * o.y) / V, u = c.u === 'L' ? 'L' : c.u, scale = c.u === 'L' ? 10 : 1;
          var X = o.x / scale, Y = o.y / scale, VV = V / scale;
          var what = c.alloy ? 'alloy' : c.what;
          var txt = c.alloy ? c.who + ' needs ' + t(nf(VV)) + ' g of an alloy that is ' + t(p + '\\%') + ' silver. She has one alloy that is ' + t(o.p1 + '\\%') + ' silver and another that is ' + t(o.p2 + '\\%') + ' silver.'
            : c.who + ' needs ' + t(nf(VV)) + ' ' + u + ' of a ' + t(p + '\\%') + ' ' + c.what + '. There is a ' + t(o.p1 + '\\%') + ' ' + c.what + ' and a ' + t(o.p2 + '\\%') + ' ' + c.what + ' in stock.';
          var pr = B.fields(txt + ' How much of each should be mixed?',
            [{ label: t(o.p1 + '\\%') + ' ' + what + ':', name: o.p1 + '%', mode: 'math', keys: 'fraction', placeholder: 'a number', after: u }, { label: t(o.p2 + '\\%') + ' ' + what + ':', name: o.p2 + '%', mode: 'math', keys: 'fraction', placeholder: 'a number', after: u }],
            [numC(X, [[Y, 'u8x-mix-swap', 'You swapped the amounts: the mixture is closer to ' + t((Math.abs(p - o.p1) < Math.abs(p - o.p2) ? o.p1 : o.p2) + '\\%') + ', so there is more of that one.']]), numC(Y, [[X, 'u8x-mix-swap', 'You swapped the amounts.']])],
            [String(cl(X)), String(cl(Y))], t(nf(X)) + ' ' + u + ' of the ' + t(o.p1 + '\\%') + ' and ' + t(nf(Y)) + ' ' + u + ' of the ' + t(o.p2 + '\\%') + ' ' + what,
            'Let ' + t('x') + ' and ' + t('y') + ' be the amounts of the ' + t(o.p1 + '\\%') + ' and ' + t(o.p2 + '\\%') + ' ' + what + ':<br>' + t('x+y=' + nf(VV)) + '<br>' + t(nf(o.p1 / 100) + 'x+' + nf(o.p2 / 100) + 'y=' + nf(p / 100) + '(' + nf(VV) + ')=' + nf(p * VV / 100)) + '<br>Substitute ' + t('y=' + nf(VV) + '-x') + ': ' + t(nf((o.p1 - o.p2) / 100) + 'x=' + nf((p - o.p2) * VV / 100)) + ', so ' + t('x=' + nf(X)) + ' and ' + t('y=' + nf(Y)) + '.',
            ['One equation adds the amounts; the other adds the amounts of pure ' + (c.alloy ? 'silver' : 'substance') + ' (percent as a decimal × amount).', 'Solve by substitution or elimination.'], 'percent mixture');
          pr.bad = [[String(cl(Y)), String(cl(X))], [String(cl(X)), String(cl(X))]];
          return pr;
        } }] },
      { num: '3', stem: '', parts: [
        { id: '3', outcome: 'RF9', level: 'ADV', make: function (r) {
          var c = r.pick(MOVERS), o = until(function () { var t1 = r.int(c.tt[0], c.tt[1] - 1), t2 = r.int(t1 + 1, c.tt[1]), k = r.int(1, 60); return { t1: t1, t2: t2, k: k }; },
            function (o) { var s = o.k * (o.t1 + o.t2) / 2, w = o.k * (o.t2 - o.t1) / 2, D = o.k * o.t1 * o.t2; return Number.isInteger(s) && Number.isInteger(w) && s >= c.spd[0] && s <= c.spd[1] && w >= c.cur[0] && w <= c.cur[1] && D >= c.D[0] && D <= c.D[1]; });
          var s = o.k * (o.t1 + o.t2) / 2, w = o.k * (o.t2 - o.t1) / 2, D = o.k * o.t1 * o.t2, g1 = s + w, g2 = s - w;
          var pr = B.fields('A ' + c.v + ' travels ' + t(F(D)) + ' km ' + c.with + ' in ' + t(o.t1) + ' h. The return trip, ' + c.against + ', takes ' + t(o.t2) + ' h. Find the speed of the ' + c.v + ' ' + c.still + ' and the speed of the ' + c.med + '.',
            [{ label: 'Speed of the ' + c.v + ' ' + c.still + ':', name: c.v, mode: 'math', keys: 'fraction', placeholder: 'a number', after: 'km/h' }, { label: 'Speed of the ' + c.med + ':', name: c.med, mode: 'math', keys: 'fraction', placeholder: 'a number', after: 'km/h' }],
            [numC(s, [[w, 'u8x-wind-swap', 'That’s the speed of the ' + c.med + '. The ' + c.v + '’s own speed is the larger one.'], [g1, 'u8x-ground', 'That’s the speed ' + c.with + ' (' + c.v + ' + ' + c.med + '). Use it in a system: ' + t('s+w=' + g1) + ' and ' + t('s-w=' + g2) + '.'], [g2, 'u8x-ground', 'That’s the speed ' + c.against + ' (' + c.v + ' − ' + c.med + '). Set up a system with both speeds.']]),
              numC(w, [[s, 'u8x-wind-swap', 'That’s the ' + c.v + '’s own speed. The ' + c.med + ' is the smaller one.'], [g1 - g2, 'u8x-ground', 'That’s the difference between the two speeds. The ' + c.med + ' adds on one way and takes away the other way, so it is half of that.']])],
            [String(s), String(w)], c.v + ' ' + t(s) + ' km/h, ' + c.med + ' ' + t(w) + ' km/h',
            'Speed ' + c.with + ': ' + t(F(D) + '\\div ' + o.t1 + '=' + g1) + ' km/h; speed ' + c.against + ': ' + t(F(D) + '\\div ' + o.t2 + '=' + g2) + ' km/h.<br>Let ' + t('s') + ' be the ' + c.v + '’s speed ' + c.still + ' and ' + t('w') + ' the ' + c.med + '’s speed:<br>' + t('s+w=' + g1) + ' and ' + t('s-w=' + g2) + '.<br>Add: ' + t('2s=' + (g1 + g2)) + ', so ' + t('s=' + s) + ' km/h and ' + t('w=' + w) + ' km/h.',
            ['Speed = distance ÷ time for each trip. ' + (c.v === 'plane' ? 'With the wind' : 'Downstream') + ' the speeds add; ' + (c.v === 'plane' ? 'into the wind' : 'upstream') + ' they subtract.', 'Write ' + t('s+w=\\ldots') + ' and ' + t('s-w=\\ldots') + ' and add the equations.'], 'wind/current');
          pr.bad = [[String(w), String(s)], [String(g1), String(w)], [String(s), String(g1 - g2)]];
          return pr;
        } }] }
    ]
  });

  /* =====================================================================================================
   * Exit Slip 8.6 — Unit review
   * ===================================================================================================== */
  var PLANS = [{ txt: 'Garage A charges {F1} plus {r1} per hour. Garage B charges {F2} plus {r2} per hour.', q: 'After how many hours of parking do the two garages cost the same?', u: 'h', F: [3, 12], r: [1.25, 4, 0.25], x: [3, 10] },
    { txt: 'Gym A charges a {F1} membership fee plus {r1} per visit. Gym B charges a {F2} membership fee plus {r2} per visit.', q: 'For how many visits do the two gyms cost the same?', u: 'visits', F: [20, 80], r: [3, 12, 1], x: [5, 20] },
    { txt: 'Car rental A charges {F1} per day plus {r1} per km. Car rental B charges {F2} per day plus {r2} per km.', q: 'For how many kilometres in a day do the two rentals cost the same?', u: 'km', F: [30, 70], r: [0.15, 0.6, 0.05], x: [40, 200], xs: 10 }];
  function money2(x) { return '\\(\\$' + (Number.isInteger(cl(x)) ? String(cl(x)) : cl(x).toFixed(2)) + '\\)'; }
  HW.defineExit({
    lesson: 'u8l6', calc: true, outcome: 'RF9',
    blurb: 'Unit review: solve a system, decide how many solutions a system has, find when two plans cost the same, and make a system with infinitely many solutions.',
    questions: [
      { num: '1', stem: '', parts: [
        { id: '1', outcome: 'RF9', level: 'BEG', make: function (r) {
          var o = until(function () { return { x0: r.int(-5, 8), y0: r.int(-5, 8), a: r.int(2, 5) }; }, function (o) { return o.x0 !== o.y0 && (o.x0 + o.y0 !== 0); });
          var x0 = o.x0, y0 = o.y0, a = o.a, s = x0 + y0, e = a * x0 - y0, e1 = eqT([[1, 'x'], [1, 'y']], s), e2 = eqT([[a, 'x'], [-1, 'y']], e);
          return pointPart('Solve the system. Give the solution as an ordered pair.' + sysT(e1, e2), [x0, y0], [std(1, 1, s), std(a, -1, e)], {},
            'The ' + t('y') + '-terms are opposites, so add the equations: ' + t((a + 1) + 'x=' + (s + e)) + ', so ' + t('x=' + x0) + '.<br>Then ' + t(x0 + '+y=' + s) + ', so ' + t('y=' + y0) + '. The solution is ' + t(ptT([x0, y0])) + '.<br><b>Check.</b> ' + t(a + pT(x0) + '-' + pT(y0) + '=' + e) + ' ✓',
            ['Adding the two equations eliminates ' + t('y') + '.', 'Substitute the value you find into the first equation.'], 'review solve');
        } }] },
      { num: '2', stem: '', parts: [
        { id: '2', outcome: 'RF9', level: 'EMG', make: function (r) {
          var kind = r.pick(['one', 'none', 'inf']), a = nz(r, -6, 6), b = nz(r, -6, 6), c = nz(r, -12, 12), k = r.pick([2, 3, 4]);
          if (Math.abs(a) === Math.abs(b)) b = b > 0 ? b + 1 : b - 1;
          var A2 = k * a, B2 = k * b, C2 = k * c;
          if (kind === 'none') C2 = k * c + nz(r, -5, 5);
          if (kind === 'one') { B2 = k * b + (r.chance(0.5) ? 1 : -1) * r.int(1, 3); if (B2 === 0) B2 = k * b + 4; }
          var e1 = eqT([[a, 'x'], [b, 'y']], c), e2 = eqT([[A2, 'x'], [B2, 'y']], C2);
          var O = { one: 'One solution — the left side of the second equation is not a multiple of the first, so the slopes are different.', none: 'No solution — the left side of the second equation is ' + t(k) + ' times the first, but the constant is not: the lines are parallel.', inf: 'Infinitely many solutions — the second equation is ' + t(k) + ' times the first: it is the same line.' };
          var opts = [{ html: O.one, right: kind === 'one', why: 'Compare: ' + t(k) + ' times the first equation is ' + t(eqT([[k * a, 'x'], [k * b, 'y']], k * c)) + '. The ' + t('x') + '- and ' + t('y') + '-terms of the second equation match that, so the slopes are equal.' },
            { html: O.none, right: kind === 'none', why: kind === 'one' ? 'The ' + t('y') + '-coefficient ' + t(B2) + ' is not ' + t(k) + ' times ' + t(b) + ', so the slopes differ.' : 'The constant ' + t(C2) + ' is also ' + t(k) + ' times ' + t(c) + ', so the whole equation is a multiple: the same line.' },
            { html: O.inf, right: kind === 'inf', why: kind === 'one' ? 'The ' + t('y') + '-coefficient ' + t(B2) + ' is not ' + t(k) + ' times ' + t(b) + ', so this is not a multiple of the first equation.' : 'Only the left side is ' + t(k) + ' times the first equation; ' + t(k + '\\times ' + pT(c) + '=' + k * c) + ', not ' + t(C2) + '.' },
            { html: kind === 'one' ? 'No solution — the ' + t('x') + '-term of the second equation is ' + t(k) + ' times the ' + t('x') + '-term of the first, so the lines are parallel.' : 'One solution — the numbers in the two equations are different.', why: kind === 'one' ? 'Compare <b>all</b> the coefficients: the ' + t('y') + '-terms are not in the same ratio, so the slopes are different.' : 'Different numbers don’t mean different lines: check whether the second equation is a multiple of the first.' }];
          return mc(r, 'Without solving, how many solutions does the system ' + t(e1) + ' and ' + t(e2) + ' have?', opts,
            t(k) + ' times the first equation is ' + t(eqT([[k * a, 'x'], [k * b, 'y']], k * c)) + '. Compare it with ' + t(e2) + '.<br>' + O[kind],
            ['Multiply the first equation by ' + t(k) + ' and compare it with the second.', 'Same left side and same constant: same line. Same left side, different constant: parallel lines.'], 'review count ' + kind);
        } }] },
      { num: '3', stem: '', parts: [
        { id: '3', outcome: 'RF9', level: 'PRG', make: function (r) {
          var c = r.pick(PLANS), o = until(function () {
            var st = c.r[2], n = Math.round((c.r[1] - c.r[0]) / st), r1 = cl(c.r[0] + st * r.int(0, n)), r2 = cl(c.r[0] + st * r.int(0, n)), xs = c.xs || 1, x = xs * r.int(Math.ceil(c.x[0] / xs), Math.floor(c.x[1] / xs)), F2 = r.int(c.F[0], c.F[1]);
            return { r1: r1, r2: r2, x: x, F2: F2, F1: cl(F2 + (r2 - r1) * x) };
          }, function (o) { return o.r1 < o.r2 && o.F1 > o.F2 && Number.isInteger(o.F1) && o.F1 <= c.F[1] * 2.2; });
          var txt = c.txt.replace('{F1}', money2(o.F1)).replace('{F2}', money2(o.F2)).replace('{r1}', money2(o.r1)).replace('{r2}', money2(o.r2));
          var dF = o.F1 - o.F2, dr = cl(o.r2 - o.r1);
          return numPart(txt + ' ' + c.q, o.x, [[cl((o.F1 + o.F2) / dr), 'u8x-cost-add', 'Set the costs equal and move the like terms: the fees <b>subtract</b>, ' + t(nf(o.F1) + '-' + nf(o.F2)) + '.', 0.05], [-o.x, 'u8x-cost-sign', 'Check the signs: the answer must be positive.'], [cl(dF / (o.r1 + o.r2)), 'u8x-cost-add', 'Collect the rates by subtracting them, not adding them.', 0.05]],
            'Let ' + t('x') + ' be the ' + (c.u === 'h' ? 'number of hours' : c.u === 'km' ? 'number of kilometres' : 'number of visits') + ' and ' + t('C') + ' the cost:<br>' + t('C=' + nf(o.F1) + '+' + nf(o.r1) + 'x') + ' and ' + t('C=' + nf(o.F2) + '+' + nf(o.r2) + 'x') + '.<br>Set them equal: ' + t(nf(o.F1) + '+' + nf(o.r1) + 'x=' + nf(o.F2) + '+' + nf(o.r2) + 'x\\Rightarrow ' + nf(dF) + '=' + nf(dr) + 'x\\Rightarrow x=' + o.x) + ' ' + c.u + '.<br><b>Check.</b> Both cost ' + t('\\$' + cl(o.F1 + o.r1 * o.x).toFixed(2)) + ' ✓',
            ['Write a cost equation for each plan: fixed fee + rate × amount.', 'The costs are the same when the two expressions are equal: solve for the amount.'], 'break-even ' + c.u, { after: c.u });
        } }] },
      { num: '4', stem: '', parts: [
        { id: '4', outcome: 'RF9', level: 'ADV', make: function (r) {
          var o = until(function () { return { a: nz(r, -6, 6), b: nz(r, -6, 6), c: nz(r, -12, 12), k: r.pick([2, 3, 4, 5, -2, -3]) }; }, function (o) { return gcd(gcd(o.a, o.b), o.c) === 1 && Math.abs(o.a) !== Math.abs(o.b); });
          var a = o.a, b = o.b, c = o.c, k = o.k, e1 = eqT([[a, 'x'], [b, 'y']], c), B2 = k * b, A2 = k * a, C2 = k * c;
          var e2 = 'ax' + (B2 < 0 ? '-' : '+') + Math.abs(B2) + 'y=d';
          var pr = B.fields('The system ' + t(e1) + ' and ' + t(e2) + ' has infinitely many solutions. Determine the values of ' + t('a') + ' and ' + t('d') + '.',
            [{ label: t('a') + ' =', name: t('a'), mode: 'math', keys: 'fraction', placeholder: 'a number' }, { label: t('d') + ' =', name: t('d'), mode: 'math', keys: 'fraction', placeholder: 'a number' }],
            [numC(A2, [[a, 'u8x-k-unscaled', 'The ' + t('y') + '-coefficient went from ' + t(b) + ' to ' + t(B2) + ': the whole equation was multiplied by ' + t(k) + ', so ' + t('a') + ' is ' + t(k) + ' times ' + t(a) + '.'], [-A2, 'u8x-c-sign', 'Check the sign: the multiplier is ' + t(k) + '.']]),
              numC(C2, [[c, 'u8x-k-unscaled', 'Infinitely many solutions means the same line: the constant is multiplied by ' + t(k) + ' too.'], [-C2, 'u8x-c-sign', 'Check the sign: the multiplier is ' + t(k) + '.']])],
            [String(A2), String(C2)], t('a=' + A2 + ',\\ d=' + C2),
            'Infinitely many solutions means both equations describe the same line, so the second equation is a multiple of the first. The ' + t('y') + '-coefficients give the multiplier: ' + t(B2 + '\\div ' + pT(b) + '=' + k) + '.<br>So ' + t('a=' + k + '\\times ' + pT(a) + '=' + A2) + ' and ' + t('d=' + k + '\\times ' + pT(c) + '=' + C2) + ': the second equation is ' + t(eqT([[A2, 'x'], [B2, 'y']], C2)) + '.',
            ['Infinitely many solutions: the second equation is the first one multiplied by some number.', 'Find that number from the ' + t('y') + '-coefficients, then multiply the other terms by it.'], 'inf many: a and d');
          pr.bad = [[String(a), String(c)], [String(A2), String(c)], [String(-A2), String(-C2)]];
          return pr;
        } }] }
    ]
  });
})(window);
