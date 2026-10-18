/* Math 10C · Unit 7 · Lesson 2 — From Slope to Equation: Building Linear Equations with y = mx + b (RF4–RF7)
 * Assignment questions 1–14 (u7_L02.tex) and the Lesson 2 Extra Practice (u7_EP02.tex, Parts A–H, questions 1–18).
 * Every part is a generator: it keeps the idea and difficulty of the booklet question (the booklet's numbers are one
 * of the possible versions) and changes the numbers. Equations are typed (K.P.line, eq keypad); the perpendicular
 * bisector in Extra 16 is drawn on the graph pad. Levels: LIM BEG EMG PRG ADV MAS. */
(function (root) {
  'use strict';
  var HW = root.HW, K = HW.kit, B = K.P, ex = HW.ex, Lns = HW.lines, DR = HW.draw, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form;

  /* ---------------- fractions as [p, q] ---------------- */
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var c = a % b; a = b; b = c; } return a; }
  function fr(p, q) { if (Array.isArray(p)) return fr(p[0], p[1]); if (q == null) q = 1; if (q < 0) { p = -p; q = -q; } var g = gcd(p, q) || 1; return [p / g, q / g]; }
  function fv(f) { f = fr(f); return f[0] / f[1]; }
  function fAdd(a, b) { a = fr(a); b = fr(b); return fr(a[0] * b[1] + b[0] * a[1], a[1] * b[1]); }
  function fSub(a, b) { b = fr(b); return fAdd(a, [-b[0], b[1]]); }
  function fMul(a, b) { a = fr(a); b = fr(b); return fr(a[0] * b[0], a[1] * b[1]); }
  function fDiv(a, b) { b = fr(b); return fMul(a, [b[1], b[0]]); }
  function fNeg(a) { a = fr(a); return [-a[0], a[1]]; }
  function fInv(a) { a = fr(a); return fr(a[1], a[0]); }
  function nrec(a) { return fNeg(fInv(a)); }                  // negative reciprocal
  function fEq(a, b) { a = fr(a); b = fr(b); return a[0] === b[0] && a[1] === b[1]; }
  function isInt(a) { return fr(a)[1] === 1; }
  function nT(a) { a = fr(a); return Lns.frT(a[0], a[1]); }   // LaTeX of a number or fraction
  function pT(a) { return fv(a) < 0 ? '\\left(' + nT(a) + '\\right)' : nT(a); }
  function ptT(x, y) { return '(' + nT(x) + ',\\ ' + nT(y) + ')'; }
  function ptK(x, y) { return '(' + nT(x) + ', ' + nT(y) + ')'; }  // typed form of a point (for keys)
  function dec(a) { return Math.round(fv(a) * 1e6) / 1e6; }

  /* ---------------- random helpers ---------------- */
  function nz(r, lo, hi) { var v; do { v = r.int(lo, hi); } while (v === 0); return v; }
  function pm(r) { return r.chance(0.5) ? 1 : -1; }
  function properFrac(r, qlo, qhi) { for (;;) { var q = r.int(qlo, qhi), p = r.int(1, q - 1); if (gcd(p, q) === 1) return [p, q]; } }
  function anyFrac(r, plo, phi, qlo, qhi) { for (;;) { var q = r.int(qlo, qhi), p = r.int(plo, phi); if (p !== q && gcd(p, q) === 1) return [p, q]; } }
  function until(gen, okf) { for (var i = 0; i < 4000; i++) { var o = gen(); if (okf(o)) return o; } throw new Error('u7l2: no valid numbers'); }

  /* ---------------- equations of lines ---------------- */
  function L(m, b) { return { m: fr(m), b: fr(b) }; }
  function LP_(m, x0, y0) { return { m: fr(m), point: [dec(x0), dec(y0)] }; }
  function SI(m, b) { return Lns.tex({ m: fr(m), b: fr(b) }, 'slope-intercept'); }
  function GEN(target) { return Lns.tex(target, 'general'); }
  function given(m, c) { return SI(m, c); }                   // a given line y = mx + c
  function bOf(m, x0, y0) { return fSub(y0, fMul(m, x0)); }   // b from y0 = m x0 + b
  /* worked step "y0 = m(x0) + b, so b = …" */
  function subSol(m, x0, y0, vars) {
    vars = vars || ['x', 'y'];
    var mx0 = fMul(m, x0), b = fSub(y0, mx0);
    return t(nT(y0) + '=' + (fEq(m, 1) ? '' : fEq(m, -1) ? '-' : nT(m)) + '\\left(' + nT(x0) + '\\right)+b') + ', so ' + t(nT(y0) + '=' + nT(mx0) + '+b') + ' and ' +
      t('b=' + nT(y0) + (fv(mx0) < 0 ? '+' + nT(fNeg(mx0)) : '-' + nT(mx0)) + '=' + nT(b)) + '.';
  }
  function slopeSol(x1, y1, x2, y2) {
    var m = fr(y2 - y1, x2 - x1);
    return t('m=\\frac{' + nT(y2) + '-' + pT(y1) + '}{' + nT(x2) + '-' + pT(x1) + '}=\\frac{' + (y2 - y1) + '}{' + (x2 - x1) + '}' + ((y2 - y1) / (x2 - x1) === fv(m) && (Math.abs(x2 - x1) !== m[1] || (y2 - y1) !== m[0]) ? '=' + nT(m) : ''));
  }
  /* close-but-decimal: a line that is right to about 0.05 when the student typed decimals */
  function closeL(S, T) {
    if (Math.abs(S[1]) < 1e-12 || Math.abs(T[1]) < 1e-12) return false;
    var ms = -S[0] / S[1], bs = -S[2] / S[1], mt = -T[0] / T[1], bt = -T[2] / T[1];
    return Math.abs(ms - mt) < 0.051 && Math.abs(bs - bt) < 0.051;
  }
  /* the equation part: K.P.line + a nudge for rounded decimals, a general-form alternative that must be accepted, and the
   * wrong lines (opt.wrong) as answers that must not be accepted */
  function LP(prompt, target, opt, sol, hints, text) {
    opt = opt || {};
    var vars = opt.vars || ['x', 'y'], TL = Lns.of(target);
    var p = B.line(prompt, target, opt, sol, hints, text), c = p.check;
    p.check = function (resp) {
      var res = c(resp);
      if (res.v === 'wrong' && !opt.decimalOk && /\d\.\d/.test(String(resp))) {
        var rr = Lns.read(resp, vars);
        if (rr.ok && closeL([rr.a, rr.b, rr.c], TL)) return form('u72-decimal', 'Close — but give the <b>exact</b> equation: write the slope and the intercept as fractions, not rounded decimals.');
      }
      return res;
    };
    if (opt.keyTex) { p.key = opt.keyTex; p.answer = t(opt.keyTex); }
    var bad = [];
    (opt.wrong || []).forEach(function (w) { var is = w.is; if (typeof is === 'string') bad.push(is); else if (!Lns.same(Lns.of(is), TL)) bad.push(Lns.tex(is, 'slope-intercept', null, vars)); });
    p.bad = bad.concat(opt.bad || []).filter(function (x, i, arr) { return arr.indexOf(x) === i; });
    p.good = (!opt.form || opt.form === 'any' ? [Lns.tex(target, 'general', null, vars)] : []).concat(opt.good || []);
    return p;
  }
  /* the question asks for exact fractions: a right line typed with decimals gets a form nudge */
  function exactOnly(p) { var c = p.check; p.check = function (resp) { var res = c(resp); if (res.v === 'correct' && /\d\.\d/.test(String(resp))) return form('u72-decimal', 'Right line — but give it with exact <b>fractions</b>, not decimals, as the question asks.'); return res; }; return p; }
  function withB(m, base) { var o = { m: fr(m) }; if (base.point) o.point = base.point; else o.b = fr(base.b); return o; }
  /* classic perpendicular / parallel slope mistakes. g = the given slope; base = { b } or { point } */
  function perpW(g, base) {
    var out = [{ is: withB(g, base), code: 'u72-perp-same', hint: 'That’s the slope of the given line, so your line is <b>parallel</b> to it. A perpendicular line needs the <b>negative reciprocal</b>: flip the slope and change its sign.' }];
    if (!fEq(fInv(g), g)) out.push({ is: withB(fInv(g), base), code: 'u72-perp-nosign', hint: 'You flipped the slope but kept its sign. Perpendicular slopes multiply to ' + t('-1') + ', so one must be positive and the other negative.' });
    out.push({ is: withB(fNeg(g), base), code: 'u72-perp-noflip', hint: 'You changed the sign but didn’t flip the slope. The perpendicular slope is the negative <b>reciprocal</b>: ' + t(nT(g)) + ' becomes ' + t(nT(nrec(g))) + '.' });
    return out;
  }
  function parW(g, base) { return [{ is: withB(nrec(g), base), code: 'u72-par-perp', hint: 'That’s the negative reciprocal — the slope of a <b>perpendicular</b> line. Parallel lines have <b>equal</b> slopes.' }]; }

  /* an equation with letters: correct when it describes the same line for every value of the letters.
   * coef(env) -> [A, B, C] of the target A x + B y + C = 0; diags: [{ coef, code, hint }] */
  var ENVS = [{ a: 2.17, b: -3.41, p: 1.37, q: 2.71, r: -1.93, s: 0.61 }, { a: -1.29, b: 2.53, p: -2.6, q: -0.83, r: 3.17, s: 1.9 }, { a: 3.7, b: 1.13, p: 0.77, q: 1.61, r: 1.41, s: -2.23 }];
  function astVars(a, acc) { (function w(x) { if (!x || typeof x !== 'object') return; if (x.t === 'var') acc[x.n] = 1; ['a', 'b', 'n'].forEach(function (k) { if (x[k]) w(x[k]); }); })(a); return acc; }
  function prop(u, v) { var n = Math.hypot(u[0], u[1], u[2]) * Math.hypot(v[0], v[1], v[2]) || 1; return Math.abs(u[0] * v[1] - u[1] * v[0]) < 1e-7 * n && Math.abs(u[0] * v[2] - u[2] * v[0]) < 1e-7 * n && Math.abs(u[1] * v[2] - u[2] * v[1]) < 1e-7 * n; }
  function symChk(coef, letters, diags) {
    var allowed = ['x', 'y'].concat(letters);
    return function (resp) {
      var s = String(resp == null ? '' : resp).replace(/\\left|\\right/g, '').replace(/\\cdot/g, '\\times ').trim();
      if (!s) return form('empty', 'Type your equation first.');
      var parts = s.split('=');
      if (parts.length !== 2 || !parts[0].trim() || !parts[1].trim()) return form('line-no-eq', 'Write an equation with one equals sign, e.g. ' + t('x=3') + ' or ' + t('y=2x+1') + '.');
      var la = ex.parse(parts[0]), ra = ex.parse(parts[1]);
      if (!la.ok || !ra.ok) return form('line-unreadable', 'I can’t read that equation. Check the brackets and fractions.');
      var vs = Object.keys(astVars(ra.ast, astVars(la.ast, {}))).filter(function (v) { return allowed.indexOf(v) < 0; });
      if (vs.length) return form('line-vars', 'Use only ' + t('x') + ', ' + t('y') + ' and the letters from the question (' + letters.map(t).join(', ') + ').');
      var match = function (cf) {
        for (var i = 0; i < ENVS.length; i++) {
          var e = ENVS[i], D = function (x, y) { var en = Object.assign({}, e, { x: x, y: y }); return ex.value(la.ast, en) - ex.value(ra.ast, en); };
          var c0 = D(0, 0), A = D(1, 0) - c0, Bc = D(0, 1) - c0;
          if (![c0, A, Bc].every(isFinite)) return 'bad';
          if (Math.abs(D(2, -3) - (c0 + 2 * A - 3 * Bc)) > 1e-7 * (1 + Math.abs(c0) + Math.abs(A) + Math.abs(Bc)) || Math.abs(D(-1.5, 2.5) - (c0 - 1.5 * A + 2.5 * Bc)) > 1e-7 * (1 + Math.abs(c0) + Math.abs(A) + Math.abs(Bc))) return 'nonlin';
          if (Math.abs(A) < 1e-12 && Math.abs(Bc) < 1e-12) return 'nonlin';
          if (!prop([A, Bc, c0], cf(e))) return false;
        }
        return true;
      };
      var m = match(coef);
      if (m === 'bad') return form('line-unreadable', 'I can’t read that equation. Check the brackets and fractions.');
      if (m === 'nonlin') return wrong('line-notlinear', 'That isn’t the equation of a line: ' + t('x') + ' and ' + t('y') + ' should only appear to the first power.');
      if (m) return ok();
      for (var i = 0; i < (diags || []).length; i++) if (match(diags[i].coef) === true) return wrong(diags[i].code, diags[i].hint);
      return wrong('line', null);
    };
  }
  function symPart(prompt, coef, letters, diags, keyTex, sol, hints, text, good, bad) {
    var p = B.math(prompt, symChk(coef, letters, diags), keyTex, sol, hints, text, { keys: 'eq', vars: ['x', 'y'].concat(letters), placeholder: 'e.g. y = 2x + 1' });
    p.good = good || []; p.bad = bad || [];
    return p;
  }

  /* ---------------- other checkers ---------------- */
  function isNone(s) { var z = String(s == null ? '' : s).replace(/\\text\{\s*([^}]*)\}/g, '$1').replace(/\\mathrm\{\s*([^}]*)\}/g, '$1').replace(/[\s-]+/g, '').toLowerCase(); return /^(none|no|nointercepts?|dne|no[xy]intercepts?|noyint|noxint)$/.test(z); }
  function readVal(s) { var z = String(s == null ? '' : s).replace(/\\left|\\right/g, '').replace(/^\s*[a-zA-Z]\s*=\s*/, '').trim(); var a = ex.parse(z); if (!a.ok) return null; var v = ex.value(a.ast); return isFinite(v) ? v : null; }
  function readPt(s) { var z = String(s == null ? '' : s).replace(/\\left|\\right/g, '').trim(); var m = /^\(([^()]*),([^()]*)\)$/.exec(z); if (!m) return null; var a = readVal(m[1]), b = readVal(m[2]); return a == null || b == null ? null : [a, b]; }
  function near(a, b) { return Math.abs(a - b) < 1e-9; }
  /* one intercept box: want = the value (null = there is none); axis 'x' | 'y'; other = the other intercept's value */
  function intChk(want, axis, other, noneWhy) {
    var oth = axis === 'x' ? 'y' : 'x';
    return function (resp) {
      var s = String(resp == null ? '' : resp).trim();
      if (!s) return form('empty', 'Fill in the ' + t(axis) + '-intercept (or press <b>none</b>).');
      if (isNone(s)) return want == null ? ok() : wrong('u72-int-said-none', 'This line does cross the ' + t(axis) + '-axis — read where.');
      var P = readPt(s), v;
      if (P) {
        var on = axis === 'x' ? near(P[1], 0) : near(P[0], 0);
        if (!on) return wrong('u72-int-off', t('(' + P[0] + ',\\ ' + P[1] + ')') + ' isn’t on the ' + t(axis) + '-axis: on the ' + t(axis) + '-axis, ' + t(oth + '=0') + '.');
        v = axis === 'x' ? P[0] : P[1];
      } else { v = readVal(s); if (v == null) return form('u72-int-unreadable', 'Give the ' + t(axis) + '-intercept as a number (or press <b>none</b>).'); }
      if (want == null) return wrong('u72-int-none', noneWhy || 'This line never meets the ' + t(axis) + '-axis, so there is no ' + t(axis) + '-intercept: press <b>none</b>.');
      if (near(v, want)) return ok();
      if (other != null && near(v, other) && !near(other, want)) return wrong('u72-int-swap', 'That’s the ' + t(oth) + '-intercept. The ' + t(axis) + '-intercept is where the line crosses the ' + t(axis) + '-axis.');
      if (near(v, -want)) return wrong('sign', 'Check the sign: which side of the origin does the line cross the ' + t(axis) + '-axis?');
      return wrong('value', null);
    };
  }
  /* a number/fraction box with diagnoses: dl = [[value, code, hint]] */
  function valChk(target, dl, opt) {
    opt = opt || {};
    var base = isInt(target) && !opt.fraction ? K.value(fv(target), { only: 'integer' }) : K.fraction(fr(target));
    return function (resp) {
      var s = String(resp == null ? '' : resp).replace(/^\s*[a-zA-Z]\s*=\s*/, '');
      var res = base(s);
      if (res.v === 'wrong') { var v = readVal(s); if (v != null) for (var i = 0; i < (dl || []).length; i++) if (!near(fv(dl[i][0]), fv(target)) && near(v, fv(dl[i][0]))) return wrong(dl[i][1], dl[i][2]); }
      return res;
    };
  }
  function valPart(prompt, target, dl, sol, hints, text, inp) {
    var p = B.math(prompt, valChk(target, dl), nT(target), sol, hints, text, Object.assign({ keys: 'fraction' }, inp || {}));
    p.bad = (dl || []).filter(function (d) { return !near(fv(d[0]), fv(target)); }).map(function (d) { return nT(d[0]); });
    return p;
  }
  function numPart(prompt, ans, dl, sol, hints, text, inp) {
    dl = (dl || []).filter(function (d) { return isFinite(d[0]) && !near(d[0], ans); });
    var p = B.number(prompt, ans, function (v) { for (var i = 0; i < dl.length; i++) if (Math.abs(v - dl[i][0]) < (dl[i][3] || 1e-9)) return { code: dl[i][1], hint: dl[i][2] }; return null; }, sol, hints, text, inp);
    p.bad = dl.map(function (d) { return String(d[0]); });
    return p;
  }
  function nrPart(prompt, ans, dl, sol, hints, text) {
    dl = (dl || []).filter(function (d) { return isFinite(d[0]) && !near(d[0], ans) && d[0] >= 0; });
    var p = B.nr(prompt, ans, function (v) { for (var i = 0; i < dl.length; i++) if (near(v, dl[i][0])) return { code: dl[i][1], hint: dl[i][2] }; return null; }, sol, hints, text);
    p.bad = dl.map(function (d) { return String(Math.round(d[0] * 100) / 100); }).filter(function (s) { return s.length <= 4; });
    return p;
  }
  /* one point (x, y): dl = [[[x, y], code, hint]] */
  function ptPart(prompt, P, dl, sol, hints, text) {
    var p = B.pairs(prompt, [[fv(P[0]), fv(P[1])]], {}, sol, hints, text), c = p.check;
    dl = (dl || []).filter(function (d) { return !(near(fv(d[0][0]), fv(P[0])) && near(fv(d[0][1]), fv(P[1]))); });
    p.check = function (resp) {
      var s = String(resp == null ? '' : resp);
      if (s.trim() && !/[(]|\\left|\\lparen/.test(s) && readVal(s) != null) return form('u72-pt-value', 'Give the whole point as an ordered pair ' + t('(x,\\ y)') + ', not just one number.');
      var res = c(resp);
      if (res.v === 'wrong') for (var i = 0; i < dl.length; i++) if (K.pairs([[fv(dl[i][0][0]), fv(dl[i][0][1])]])(resp).v === 'correct') return wrong(dl[i][1], dl[i][2]);
      return res;
    };
    p.key = ptK(P[0], P[1]); p.answer = t(ptT(P[0], P[1]));
    p.bad = dl.map(function (d) { return ptK(d[0][0], d[0][1]); });
    return p;
  }
  /* a slope box with diagnoses checked before the built-in ones: pre = [[value, code, hint]] */
  function slopePart(prompt, sl, pre, sol, hints, text) {
    var p = B.slope(prompt, sl, {}, sol, hints, text), c = p.check;
    pre = (pre || []).filter(function (d) { return sl == null || !fEq(d[0], sl); });
    p.check = function (resp) {
      var s = String(resp == null ? '' : resp).replace(/^\s*m\s*=\s*/, ''), v = readVal(s);
      if (v != null) for (var i = 0; i < pre.length; i++) if (near(v, fv(pre[i][0]))) return wrong(pre[i][1], pre[i][2]);
      return c(resp);
    };
    p.bad = pre.map(function (d) { return nT(d[0]); });
    return p;
  }
  function mc(r, prompt, opts, sol, hints, text, keepOrder) { return B.mc(r, prompt, opts, sol, hints, text, keepOrder); }
  /* MC options must be distinct: drop wrong options whose html repeats an earlier one */
  function uniqOpts(opts) { var seen = {}; return opts.filter(function (o) { if (seen[o.html]) return false; seen[o.html] = 1; return true; }); }

  /* ---------------- figures ---------------- */
  var BLUE = '#2456b8', RED = '#b23a3a', TEAL = '#13807a';
  function clipLine(Ls, xr, yr) {
    if (Ls.x != null) return [[Ls.x, yr[0]], [Ls.x, yr[1]]];
    var m = fv(Ls.m), b = fv(Ls.b), pts = [];
    if (m === 0) return [[xr[0], b], [xr[1], b]];
    [xr[0], xr[1]].forEach(function (x) { var y = m * x + b; if (y >= yr[0] - 1e-9 && y <= yr[1] + 1e-9) pts.push([x, y]); });
    [yr[0], yr[1]].forEach(function (y) { var x = (y - b) / m; if (x >= xr[0] - 1e-9 && x <= xr[1] + 1e-9) pts.push([x, y]); });
    pts.sort(function (a, c) { return a[0] - c[0]; });
    return [pts[0], pts[pts.length - 1]];
  }
  function r1(v) { return Math.round(v * 10) / 10; }
  /* a grid with lines (arrows at both ends, in their own colours) and labels like n₁ next to them.
   * lines: [{ m, b } | { x }, color, label: ['n', '1'] , f: where along the line the label sits (0–1)] */
  function figure(spec, lines) {
    var xr = spec.x, yr = spec.y;
    var segs = lines.map(function (Ls) { return { pts: clipLine(Ls, xr, yr), color: Ls.color || BLUE }; });
    var svg = HW.graph(Object.assign({}, spec, { segs: (spec.segs || []).concat(segs) })), G = HW.graph.last, add = '';
    lines.forEach(function (Ls, i) {
      var pp = segs[i].pts, col = segs[i].color;
      [[pp[0], pp[1]], [pp[1], pp[0]]].forEach(function (e) {
        var px = G.X(e[0][0]), py = G.Y(e[0][1]), qx = G.X(e[1][0]), qy = G.Y(e[1][1]), d = Math.hypot(px - qx, py - qy) || 1, ux = (px - qx) / d, uy = (py - qy) / d, bx = px - ux * 10, by = py - uy * 10;
        add += '<path d="M' + r1(px) + ' ' + r1(py) + ' L' + r1(bx - uy * 5) + ' ' + r1(by + ux * 5) + ' L' + r1(bx + uy * 5) + ' ' + r1(by - ux * 5) + ' Z" fill="' + col + '"/>';
      });
      if (Ls.label) {
        var top = pp[0][1] > pp[1][1] ? pp[0] : pp[1], bot = top === pp[0] ? pp[1] : pp[0], f = Ls.f == null ? 0.84 : Ls.f;
        var lx = G.X(bot[0] + (top[0] - bot[0]) * f), ly = G.Y(bot[1] + (top[1] - bot[1]) * f);
        var dx = G.X(top[0]) - G.X(bot[0]), dy = G.Y(top[1]) - G.Y(bot[1]), dd = Math.hypot(dx, dy) || 1, off = Ls.side || 1;
        lx += -dy / dd * 14 * off; ly += dx / dd * 14 * off;
        lx = Math.max(G.padL + 10, Math.min(G.W - 12, lx)); ly = Math.max(14, Math.min(G.H - 22, ly));
        add += '<text x="' + r1(lx) + '" y="' + r1(ly + 4) + '" font-size="14" font-style="italic" text-anchor="middle" fill="' + col + '" stroke="#fff" stroke-width="3" paint-order="stroke">' + Ls.label[0] + (Ls.label[1] ? '<tspan font-size="10" font-style="normal" dy="4">' + Ls.label[1] + '</tspan>' : '') + '</text>';
      }
    });
    return svg.replace('</svg>', add + '</svg>');
  }

  /* ---------------- hints shared by many parts ---------------- */
  var H_SI = ['In ' + t('y=mx+b') + ', ' + t('m') + ' is the slope and ' + t('b') + ' is the ' + t('y') + '-intercept. Substitute both values.', 'Check: when ' + t('x=0') + ', your equation should give the ' + t('y') + '-intercept.'];
  var H_PAR = ['Parallel lines have <b>equal</b> slopes, so read the slope from the given line.', 'A point ' + t('(0,\\ k)') + ' is on the ' + t('y') + '-axis, so it is the ' + t('y') + '-intercept: ' + t('b=k') + '.'];
  var H_PERP = ['Perpendicular slopes are <b>negative reciprocals</b>: flip the slope and change its sign (their product is ' + t('-1') + ').', 'A point ' + t('(0,\\ k)') + ' is on the ' + t('y') + '-axis, so it is the ' + t('y') + '-intercept: ' + t('b=k') + '.'];
  var H_PT = ['Substitute the slope for ' + t('m') + ' and the point’s coordinates for ' + t('x') + ' and ' + t('y') + ' in ' + t('y=mx+b') + ', then solve for ' + t('b') + '.', 'Check: substitute the point into your final equation — it must make it true.'];
  var H_HV = ['A <b>vertical</b> line (parallel to the ' + t('y') + '-axis) has the same ' + t('x') + '-coordinate at every point: ' + t('x=k') + '.', 'A <b>horizontal</b> line (parallel to the ' + t('x') + '-axis) has the same ' + t('y') + '-coordinate at every point: ' + t('y=k') + '.'];
  var H_2P = ['First find the slope: ' + t('m=\\frac{y_2-y_1}{x_2-x_1}') + '. Then substitute ' + t('m') + ' and one of the points into ' + t('y=mx+b') + ' and solve for ' + t('b') + '.', 'Check with the <b>other</b> point: it must satisfy your equation too.'];

  /* ---------------- question makers ---------------- */
  /* Q1 (a)–(c): slope and y-intercept given directly */
  function directPart(m, b, prompt, text) {
    return LP(prompt, L(m, b), { wrong: isInt(b) && !fEq(m, b) ? [{ is: L(b, m), code: 'u72-swap-mb', hint: 'You swapped them: the slope ' + t('m') + ' multiplies ' + t('x') + ', and the ' + t('y') + '-intercept ' + t('b') + ' is the constant term.' }] : [] },
      t('m=' + nT(m)) + ' and ' + t('b=' + nT(b)) + '. Substitute into ' + t('y=mx+b') + ': ' + t(SI(m, b)) + '.<br><b>Check.</b> ' + t('x=0\\Rightarrow y=' + nT(b)) + ' ✓', H_SI, text);
  }
  /* Q2 / Extra 4: the line through two marked lattice points */
  /* Q3: a graph with integer intercepts → table */
  function interceptTable(r, a, b, col) {
    var m = fr(-b, a), xr = [-10, 10];
    var fig = figure({ x: xr, y: xr, labels: 2, max: 340, points: [{ x: a, y: 0, color: '#1c2230' }, { x: 0, y: b, color: '#1c2230' }] }, [{ m: m, b: [b, 1], color: col }]);
    var fields = [{ name: t('x') + '-intercept', label: t('x') + '-intercept', mode: 'math', keys: 'eq', none: false, placeholder: 'number' },
      { name: t('y') + '-intercept', label: t('y') + '-intercept', mode: 'math', keys: 'eq', placeholder: 'number' },
      { name: 'slope', label: 'slope', mode: 'math', keys: 'eq', placeholder: 'm' },
      { name: 'equation', label: 'equation', mode: 'math', keys: 'eq', wide: true, placeholder: 'y = …' }];
    var target = L(m, b);
    var lineC = K.line(target, { wrong: [{ is: L(fNeg(m), b), code: 'line-slope-sign', hint: 'Check the sign of the slope: the line rises from left to right.' }, { is: L(m, a), code: 'u72-b-xint', hint: 'In ' + t('y=mx+b') + ', ' + t('b') + ' is the <b>' + t('y') + '</b>-intercept, not the ' + t('x') + '-intercept.' }] });
    var checks = [intChk(a, 'x', b), intChk(b, 'y', a), K.slope(m), lineC];
    var keys = [String(a), String(b), nT(m), SI(m, b)];
    var p = B.fields(fig + '<br>The marked points are where the line crosses the axes. Complete the table.', fields, checks, keys,
      t('x') + '-intercept: ' + t(a) + '<br>' + t('y') + '-intercept: ' + t(b) + '<br>slope: ' + t(nT(m)) + '<br>equation: ' + t(SI(m, b)),
      'The marked points are the intercepts: ' + t(ptT(a, 0)) + ' and ' + t(ptT(0, b)) + '.<br>' + t('m=\\frac{0-' + pT(b) + '}{' + a + '-0}=\\frac{' + (-b) + '}{' + a + '}' + (gcd(a, b) > 1 || a < 0 ? '=' + nT(m) : '')) + ', and ' + t('b=' + b) + ', so ' + t(SI(m, b)) + '.<br><b>Check.</b> At ' + t(ptT(a, 0)) + ': ' + t(nT(m) + '\\left(' + a + '\\right)' + (b < 0 ? '' : '+') + b + '=' + (fv(m) * a) + (b < 0 ? '' : '+') + b + '=0') + ' ✓',
      ['The ' + t('x') + '-intercept is where the line crosses the ' + t('x') + '-axis (' + t('y=0') + '); the ' + t('y') + '-intercept is where it crosses the ' + t('y') + '-axis (' + t('x=0') + ').', 'Use the two marked points for the slope: rise over run, ' + t('\\frac{y_2-y_1}{x_2-x_1}') + '.'],
      'intercept table: x-int ' + a + ', y-int ' + b);
    p.good = [['(' + a + ', 0)', 'y=' + b, 'm=' + nT(m), GEN(target)]];
    p.bad = [[String(b), String(a), nT(m), SI(m, b)], [String(a), String(b), nT(fNeg(m)), SI(fNeg(m), b)], [String(a), String(b), nT(m), SI(m, a)], [String(-a), String(b), nT(m), SI(m, b)]];
    return p;
  }
  /* MC with four horizontal / vertical equations (Q10, Q11) */
  function hvMC(r, P, vertical) {
    var px = P[0], py = P[1];
    var opts = [
      { html: t('x=' + px), right: vertical, why: vertical ? null : 'That’s a vertical line. A line parallel to the ' + t('x') + '-axis is horizontal: every point has the same ' + t('y') + '-coordinate.' },
      { html: t('x=' + py), right: false, why: vertical ? 'Right kind of line (vertical) — but use the point’s ' + t('x') + '-coordinate, ' + t(px) + '.' : 'A line parallel to the ' + t('x') + '-axis is horizontal, so its equation is ' + t('y=') + ' the point’s ' + t('y') + '-coordinate.' },
      { html: t('y=' + px), right: false, why: vertical ? 'A line parallel to the ' + t('y') + '-axis is vertical, so its equation is ' + t('x=') + ' the point’s ' + t('x') + '-coordinate.' : 'Right kind of line (horizontal) — but use the point’s ' + t('y') + '-coordinate, ' + t(py) + '.' },
      { html: t('y=' + py), right: !vertical, why: vertical ? 'That’s a horizontal line. A line parallel to the ' + t('y') + '-axis is vertical: every point has the same ' + t('x') + '-coordinate.' : null }];
    return mc(r, 'A line is parallel to the ' + t(vertical ? 'y' : 'x') + '-axis and passes through the point ' + t(ptT(px, py)) + '. The equation of the line is', opts,
      'Parallel to the ' + t(vertical ? 'y' : 'x') + '-axis means <b>' + (vertical ? 'vertical' : 'horizontal') + '</b>, so every point has the same ' + t(vertical ? 'x' : 'y') + '-coordinate as ' + t(ptT(px, py)) + ': ' + t(vertical ? 'x=' + px : 'y=' + py) + '.',
      [H_HV[vertical ? 0 : 1]], (vertical ? 'vertical' : 'horizontal') + ' through (' + px + ', ' + py + ') MC');
  }

  HW.addCodes({
    'u72-decimal': 'Rounded decimals instead of exact fractions', 'u72-perp-same': 'Perpendicular: used the given slope', 'u72-perp-nosign': 'Perpendicular: flipped but kept the sign', 'u72-perp-noflip': 'Perpendicular: changed the sign but didn’t flip',
    'u72-par-perp': 'Parallel: used the perpendicular slope', 'u72-swap-mb': 'Swapped slope and y-intercept', 'u72-b-given': 'Took b from the wrong line', 'u72-m-wrongline': 'Took the slope from the wrong line', 'u72-b-xint': 'Used the x-intercept as b',
    'u72-b-solve': 'Sign slip solving for b', 'u72-b-y0': 'Used the point’s y-coordinate as b', 'u72-b-points': 'Used the intercept of the two-point line', 'u72-slope1': 'Read the slope of y = x as 0', 'u72-coord': 'Used the other coordinate',
    'u72-given-line': 'Wrote the given line itself', 'u72-int-said-none': 'Said “none” for an intercept that exists', 'u72-int-none': 'Gave an intercept that doesn’t exist', 'u72-int-off': 'Intercept point not on the axis', 'u72-int-swap': 'Swapped x- and y-intercepts', 'u72-int-unreadable': 'Intercept not a number',
    'u72-pt-value': 'Gave one number instead of a point', 'u72-pt-solve': 'Error solving for the coordinate', 'u72-pt-swap': 'Point with coordinates swapped', 'u72-diff': 'Used the first difference as the slope', 'u72-student': 'Repeated the student’s answer',
    'u72-k-sign': 'Sign error solving for k', 'u72-k-perp': 'Parallel/perpendicular slope mixed up (k)', 'u72-k-nodiv': 'Forgot to divide by the y-coefficient', 'u72-fee': 'Forgot the fixed fee', 'u72-rate-fee': 'Mixed up the rate and the fee', 'u72-mid': 'Midpoint error',
    'u72-nr-perp': 'NR: perpendicular slope error', 'u72-nr-b': 'NR: wrong y-intercept', 'u72-nr-other': 'NR: used the wrong line', 'u72-sym': 'Symbolic line: wrong',
    'u72-gr-par': 'Drew a parallel line instead of the perpendicular', 'u72-origin': 'Through the origin: b not 0', 'u72-same': 'Same line? decision wrong', 'u72-und': 'Vertical line: gave a number slope', 'u72-vertical-form': 'Which lines fit y = mx + b', 'u72-range-all': 'Range of a horizontal line as all reals', 'u72-dom-all': 'Domain of a vertical line as all reals', 'u72-k-var': 'Stray letter in an expression in k', 'u72-gr-endpoint': 'Perpendicular through an endpoint, not the midpoint', 'u72-gr-sign': 'Perpendicular slope with the wrong sign', 'line-notlinear': 'Not the equation of a line'
  });

  HW.defineLesson({
    id: 'u7l2', unit: 7, num: '2', title: 'From Slope to Equation: Building Linear Equations with y = mx + b', outcome: 'RF7',
    blurb: 'Build y = mx + b from a slope and y-intercept, from a graph, from a parallel or perpendicular condition — and write the equations of horizontal and vertical lines.',
    questions: [
      /* ---------------- Question 1 ---------------- */
      { num: '1', section: 'Assignment', stem: 'Write the equation of each line.', parts: [
        { id: '1a', level: 'BEG', make: function (r) {
          var m = r.pick([2, 3, 4, 5, 6, 7, 8, 9]) * r.pick([1, 1, -1]), b = nz(r, -12, 12);
          return directPart([m, 1], [b, 1], 'with slope ' + t(m) + ' and ' + t('y') + '-intercept ' + t(b), 'slope ' + m + ', y-int ' + b);
        } },
        { id: '1b', level: 'BEG', make: function (r) {
          var f = properFrac(r, 3, 9), m = fNeg(f), b = r.int(1, 12);
          return directPart(m, [b, 1], 'with a ' + t('y') + '-intercept of ' + t(b) + ' and a slope of ' + t(nT(m)), 'y-int ' + b + ', slope ' + nT(m));
        } },
        { id: '1c', level: 'BEG', make: function (r) {
          var m = fNeg(properFrac(r, 3, 9));
          return LP('passing through the origin with a slope of ' + t(nT(m)), L(m, 0), { wrong: [{ is: L(m, 1), code: 'u72-origin', hint: 'Through the origin means the line passes through ' + t('(0,\\ 0)') + ', so the ' + t('y') + '-intercept is ' + t('b=0') + '.' }] },
            'Through the origin means ' + t('(0,\\ 0)') + ' is the ' + t('y') + '-intercept, so ' + t('b=0') + '. With ' + t('m=' + nT(m)) + ': ' + t(SI(m, 0)) + '.<br><b>Check.</b> ' + t('x=0\\Rightarrow y=0') + ' ✓', H_SI, 'origin, slope ' + nT(m));
        } },
        { id: '1d', level: 'EMG', make: function (r) {
          var s = r.pick([1, 1, 1, -1]), b = nz(r, -12, 12), gT = s === 1 ? 'y=x' : 'y=-x';
          return LP('with ' + t('y') + '-intercept ' + t(b) + ' and parallel to ' + t(gT), L(s, b), { wrong: parW([s, 1], { b: [b, 1] }).concat([{ is: L(0, b), code: 'u72-slope1', hint: t(gT) + ' means ' + t(s === 1 ? 'y=1x' : 'y=-1x') + ': its slope is the coefficient of ' + t('x') + ', ' + t(s) + ' (not ' + t('0') + ').' }]) },
            t(gT) + ' is ' + t(s === 1 ? 'y=1x+0' : 'y=-1x+0') + ', so its slope is ' + t(s) + '. Parallel ' + t('\\Rightarrow m=' + s) + '. With ' + t('b=' + b) + ': ' + t(SI(s, b)) + '.<br><b>Check.</b> ' + t('x=0\\Rightarrow y=' + b) + ', and the slopes match ✓', H_PAR, 'parallel to ' + gT + ', y-int ' + b);
        } },
        { id: '1e', level: 'EMG', make: function (r) {
          var g = fNeg(anyFrac(r, 2, 7, 2, 7)), c = nz(r, -9, 9), b = r.int(-14, -2), m = nrec(g);
          return LP('with a ' + t('y') + '-intercept of ' + t(b) + ' and perpendicular to ' + t(given(g, c)), L(m, b),
            { wrong: perpW(g, { b: [b, 1] }).concat([{ is: L(m, c), code: 'u72-b-given', hint: 'Right slope — but the ' + t('y') + '-intercept is given: ' + t(b) + '. The given line only supplies the slope.' }]) },
            t(given(g, c)) + ' has slope ' + t(nT(g)) + '; the negative reciprocal is ' + t(nT(m)) + '. With ' + t('b=' + b) + ': ' + t(SI(m, b)) + '.<br><b>Check.</b> ' + t(nT(g) + '\\times ' + pT(m) + '=-1') + ' and ' + t('x=0\\Rightarrow y=' + b) + ' ✓', H_PERP, 'perp to slope ' + nT(g) + ', y-int ' + b);
        } },
        { id: '1f', level: 'EMG', make: function (r) {
          var A = r.pick([1, 1, 2, 3, -1, -2]), k = nz(r, -12, 12), g = properFrac(r, 3, 9), c = nz(r, -6, 6), oT = SI(A, k);
          return LP('with the same ' + t('y') + '-intercept as ' + t(oT) + ' and parallel to ' + t(given(g, c)), L(g, k),
            { wrong: [{ is: L(g, c), code: 'u72-given-line', hint: 'That’s the line ' + t(given(g, c)) + ' itself. Keep its slope, but take ' + t('b') + ' from ' + t(oT) + '.' },
              { is: L(A, c), code: 'u72-m-wrongline', hint: 'You swapped the roles of the two lines: the slope comes from the <b>parallel</b> line ' + t(given(g, c)) + ', and ' + t('b') + ' from ' + t(oT) + '.' },
              { is: L(A, k), code: 'u72-m-wrongline', hint: 'That’s ' + t(oT) + ' itself. It only gives you ' + t('b') + '; the slope comes from the line yours is parallel to.' }].concat(parW(g, { b: [k, 1] })) },
            t(oT) + ' has ' + t('y') + '-intercept ' + t('b=' + k) + '; parallel to ' + t(given(g, c)) + ' gives ' + t('m=' + nT(g)) + '. So ' + t(SI(g, k)) + '.<br><b>Check.</b> ' + t('x=0\\Rightarrow y=' + k) + '; the slopes are equal ✓', H_PAR, 'b of ' + oT + ', parallel to slope ' + nT(g));
        } },
        { id: '1g', level: 'EMG', make: function (r) {
          var k = r.pick([2, 3, 4, 5, 6, 7, 8, 9]) * r.pick([1, 1, -1]), c = nz(r, -9, 9), b = nz(r, -10, 10), m = nrec([k, 1]);
          return LP('through the point ' + t(ptT(0, b)) + ' and perpendicular to ' + t(given(k, c)), L(m, b), { wrong: perpW([k, 1], { b: [b, 1] }).concat([{ is: L(m, c), code: 'u72-b-given', hint: 'Right slope — but your line passes through ' + t(ptT(0, b)) + ', so ' + t('b=' + b) + '.' }]) },
            t(ptT(0, b)) + ' is the ' + t('y') + '-intercept, so ' + t('b=' + b) + '. ' + t(given(k, c)) + ' has slope ' + t(k) + ', so the perpendicular slope is ' + t(nT(m)) + ': ' + t(SI(m, b)) + '.<br><b>Check.</b> ' + t(k + '\\times ' + pT(m) + '=-1') + ' and ' + t('x=0\\Rightarrow y=' + b) + ' ✓', H_PERP, 'through (0,' + b + ') perp to slope ' + k);
        } },
        { id: '1h', level: 'EMG', make: function (r) {
          var q = r.int(7, 12), g = [r.pick([1, 1, -1]), q], c = nz(r, -30, 30), b = nz(r, -12, 12);
          return LP('through the point ' + t(ptT(0, b)) + ' and parallel to ' + t(given(g, c)), L(g, b), { wrong: parW(g, { b: [b, 1] }).concat([{ is: L(g, c), code: 'u72-given-line', hint: 'That’s the given line itself. Keep its slope, but your line passes through ' + t(ptT(0, b)) + ', so ' + t('b=' + b) + '.' }]) },
            t(ptT(0, b)) + ' gives ' + t('b=' + b) + '; parallel to ' + t(given(g, c)) + ' gives ' + t('m=' + nT(g)) + ': ' + t(SI(g, b)) + '.<br><b>Check.</b> ' + t('x=0\\Rightarrow y=' + b) + '; the slopes are equal ✓', H_PAR, 'through (0,' + b + ') parallel to slope ' + nT(g));
        } },
        { id: '1i', level: 'EMG', make: function (r) {
          var A = r.pick([2, 3, 4, 5, -2, -3]), Bq = nz(r, -15, 15), g = until(function () { return anyFrac(r, 3, 9, 2, 4); }, function (f) { return f[0] > f[1]; }), c = nz(r, -9, 9), m = nrec(g), oT = SI(A, Bq);
          return LP('with the same ' + t('y') + '-intercept as ' + t(oT) + ' and perpendicular to ' + t(given(g, c)), L(m, Bq),
            { wrong: perpW(g, { b: [Bq, 1] }).concat([{ is: L(m, c), code: 'u72-b-given', hint: 'Right slope — but ' + t('b') + ' comes from ' + t(oT) + ', not from the line you are perpendicular to.' },
              { is: L(nrec([A, 1]), Bq), code: 'u72-m-wrongline', hint: 'You used the slope of ' + t(oT) + '. That line only gives ' + t('b') + '; the perpendicular slope comes from ' + t(given(g, c)) + '.' }]) },
            t(oT) + ' has ' + t('y') + '-intercept ' + t('b=' + Bq) + '. ' + t(given(g, c)) + ' has slope ' + t(nT(g)) + ', so the perpendicular slope is ' + t(nT(m)) + ': ' + t(SI(m, Bq)) + '.<br><b>Check.</b> ' + t(nT(g) + '\\times ' + pT(m) + '=-1') + ' and ' + t('x=0\\Rightarrow y=' + Bq) + ' ✓', H_PERP, 'b of ' + oT + ', perp to slope ' + nT(g));
        } },
        { id: '1j', level: 'ADV', make: function (r) {
          var co = function (e) { return [1 / e.r, 1, -e.q]; };   // y = -x/r + q  ⇔  x/r + y − q = 0
          var D = function (fn, code, hint) { return { coef: fn, code: code, hint: hint }; };
          return symPart('with the same ' + t('y') + '-intercept as ' + t('y=px+q') + ' and perpendicular to ' + t('y=rx+s') + ' <span class="muted">(use the letters on the keypad)</span>',
            co, ['p', 'q', 'r', 's'], [
              D(function (e) { return [-1 / e.r, 1, -e.q]; }, 'u72-perp-nosign', 'You flipped ' + t('r') + ' but kept its sign. The perpendicular slope is the <b>negative</b> reciprocal, ' + t('-\\frac{1}{r}') + '.'),
              D(function (e) { return [e.r, 1, -e.q]; }, 'u72-perp-noflip', 'You changed the sign but didn’t flip: the negative reciprocal of ' + t('r') + ' is ' + t('-\\frac{1}{r}') + ', not ' + t('-r') + '.'),
              D(function (e) { return [-e.r, 1, -e.q]; }, 'u72-perp-same', 'That line has slope ' + t('r') + ', so it is <b>parallel</b> to ' + t('y=rx+s') + '. You need the negative reciprocal.'),
              D(function (e) { return [1 / e.p, 1, -e.q]; }, 'u72-m-wrongline', 'You took the negative reciprocal of ' + t('p') + '. The slope must come from the line yours is perpendicular to, ' + t('y=rx+s') + '.'),
              D(function (e) { return [1 / e.r, 1, -e.s]; }, 'u72-b-given', 'Right slope — but ' + t('b') + ' comes from ' + t('y=px+q') + ', whose ' + t('y') + '-intercept is ' + t('q') + '.'),
              D(function (e) { return [1 / e.r, 1, -e.p]; }, 'u72-b-given', 'Right slope — but in ' + t('y=px+q') + ' the ' + t('y') + '-intercept is ' + t('q') + ' (the constant), not the slope ' + t('p') + '.')],
            'y=-\\frac{1}{r}x+q',
            t('y=px+q') + ' has ' + t('y') + '-intercept ' + t('b=q') + '. ' + t('y=rx+s') + ' has slope ' + t('r') + ', so the perpendicular slope is ' + t('m=-\\frac{1}{r}') + ' (with ' + t('r\\ne 0') + '): ' + t('y=-\\frac{1}{r}x+q') + '.<br><b>Check.</b> ' + t('r\\times\\left(-\\frac{1}{r}\\right)=-1') + ' and ' + t('x=0\\Rightarrow y=q') + ' ✓',
            ['Do it exactly as with numbers: ' + t('b') + ' is the constant of ' + t('y=px+q') + ', and the slope of ' + t('y=rx+s') + ' is ' + t('r') + '.', 'The negative reciprocal of ' + t('r') + ' is ' + t('-\\frac{1}{r}') + '.'],
            'symbolic: b of y=px+q, perp to y=rx+s', ['y=q-\\frac{x}{r}', 'ry=-x+qr', 'x+ry-qr=0'], ['y=\\frac{1}{r}x+q', 'y=-rx+q', 'y=-\\frac{1}{r}x+s', 'y=rx+q']);
        } }] },

      /* ---------------- Question 2: three lines on one grid ---------------- */
      { num: '2', stem: function (sh) {
          return 'Each of the lines on the grid passes through points with integer coordinates. Determine the equation of each line.<br>' +
            figure({ x: [-9, 9], y: [-9, 9], labels: 2, max: 360 }, [{ m: sh.m1, b: [sh.b1, 1], color: BLUE, label: ['n', '1'], f: 0.9 }, { m: sh.m2, b: [sh.b2, 1], color: RED, label: ['n', '2'], f: 0.1 }, { m: sh.m3, b: [sh.b3, 1], color: TEAL, label: ['n', '3'], f: 0.9, side: -1 }]);
        },
        shared: function (r) {
          return until(function () {
            var q = r.pick([2, 3, 3, 4]), s = r.pick([1, 1, -1]);
            return { m1: [s, q], b1: nz(r, -6, 6), m2: [-r.pick([2, 3, 3, 4]), 1], b2: r.int(3, 7), m3: [r.pick([2, 2, 3]), 1], b3: nz(r, -3, 3) };
          }, function (o) { var bs = [o.b1, o.b2, o.b3]; return Math.abs(bs[0] - bs[1]) >= 2 && Math.abs(bs[0] - bs[2]) >= 2 && Math.abs(bs[1] - bs[2]) >= 2 && Math.abs(o.b1) >= 2; });
        },
        parts: [
          { id: '2a', sub: 'n₁', level: 'BEG', make: function (r, sh) { return gridLinePart(sh.m1, sh.b1, '1'); } },
          { id: '2b', sub: 'n₂', level: 'BEG', make: function (r, sh) { return gridLinePart(sh.m2, sh.b2, '2'); } },
          { id: '2c', sub: 'n₃', level: 'BEG', make: function (r, sh) { return gridLinePart(sh.m3, sh.b3, '3'); } }] },

      /* ---------------- Question 3: intercept tables ---------------- */
      { num: '3', stem: 'Each graph below shows a line whose ' + t('x') + '- and ' + t('y') + '-intercepts are both integers.', parts: [
        { id: '3a', level: 'EMG', make: function (r) {
          var o = until(function () { return { a: r.int(2, 10), b: -r.int(2, 10) }; }, function (o) { var f = fr(-o.b, o.a); return f[1] >= 2 && f[1] <= 6 && Math.abs(o.a) !== Math.abs(o.b); });
          return interceptTable(r, o.a, o.b, BLUE);
        } },
        { id: '3b', level: 'EMG', make: function (r) {
          var o = until(function () { return { a: -r.int(2, 10), b: r.int(2, 10) }; }, function (o) { var f = fr(-o.b, o.a); return f[1] >= 2 && f[1] <= 6 && Math.abs(o.a) !== Math.abs(o.b); });
          return interceptTable(r, o.a, o.b, RED);
        } }] },

      /* ---------------- Questions 4, 5: slope from two points ---------------- */
      { num: '4', stem: '', parts: [
        { id: '4', level: 'EMG', make: function (r) {
          var k = r.int(2, 5), d = r.int(2, 4), x1 = r.int(1, 5), y1 = r.int(3, 12), x2 = x1 + d, y2 = y1 - k * d, b = nz(r, -15, 15), m = [-k, 1], bL = y1 + k * x1;
          return LP('Determine the equation of the line which passes through the point ' + t(ptT(0, b)) + ' and is parallel to the line which passes through ' + t(ptT(x1, y1)) + ' and ' + t(ptT(x2, y2)) + '.', L(m, b),
            { wrong: [{ is: L(m, bL), code: 'u72-b-points', hint: 'That’s the line through ' + t(ptT(x1, y1)) + ' and ' + t(ptT(x2, y2)) + ' itself. Your line has the same slope but passes through ' + t(ptT(0, b)) + ', so ' + t('b=' + b) + '.' }].concat(parW(m, { b: [b, 1] })) },
            'Slope of the line through the two points: ' + slopeSol(x1, y1, x2, y2) + '.<br>A parallel line has the same slope, ' + t('m=' + (-k)) + '; ' + t(ptT(0, b)) + ' is the ' + t('y') + '-intercept, so ' + t('b=' + b) + ': ' + t(SI(m, b)) + '.<br><b>Check.</b> ' + t('x=0\\Rightarrow y=' + b) + ', and the slopes match ✓',
            ['Find the slope of the line through the two given points first: ' + t('m=\\frac{y_2-y_1}{x_2-x_1}') + '.', 'Parallel lines have equal slopes, and ' + t(ptT(0, b)) + ' gives ' + t('b') + ' directly.'], 'through (0,' + b + ') parallel to line through 2 points');
        } }] },
      { num: '5', stem: '', parts: [
        { id: '5', level: 'PRG', make: function (r) {
          var k = r.int(2, 5), u = r.pick([1, 2]), s = r.pick([-1, -1, 1]), x1 = r.int(-2, 6), y1 = nz(r, -11, 4), x2 = x1 + k * u, y2 = y1 + s * u, b = r.int(2, 12), g = [s, k], m = nrec(g);
          return LP('Determine the equation of the line which passes through the point ' + t(ptT(0, b)) + ' and is perpendicular to the line which passes through ' + t(ptT(x1, y1)) + ' and ' + t(ptT(x2, y2)) + '.', L(m, b),
            { wrong: perpW(g, { b: [b, 1] }) },
            'Slope of the line through the two points: ' + slopeSol(x1, y1, x2, y2) + '.<br>The perpendicular slope is the negative reciprocal, ' + t('m=' + nT(m)) + '; ' + t(ptT(0, b)) + ' gives ' + t('b=' + b) + ': ' + t(SI(m, b)) + '.<br><b>Check.</b> ' + t(pT(g) + '\\times ' + pT(m) + '=-1') + ' and ' + t('x=0\\Rightarrow y=' + b) + ' ✓',
            ['Find the slope of the line through the two given points first, and reduce it.', H_PERP[0]], 'through (0,' + b + ') perp to line through 2 points');
        } }] },

      /* ---------------- Question 6 ---------------- */
      { num: '6', stem: 'State the equation of each line.', shared: function (r) {
          var P1 = until(function () { return [nz(r, -9, 9), nz(r, -9, 9)]; }, function (p) { return Math.abs(p[0]) !== Math.abs(p[1]); });
          var P2 = until(function () { return [nz(r, -9, 9), nz(r, -9, 9)]; }, function (p) { return Math.abs(p[0]) !== Math.abs(p[1]); });
          return { P1: P1, P2: P2 };
        },
        parts: [
          { id: '6a', level: 'BEG', make: function (r, sh) { return hvPart(sh.P1, 'v', 'through the point ' + t(ptT(sh.P1[0], sh.P1[1])) + ' and parallel to the ' + t('y') + '-axis'); } },
          { id: '6b', level: 'BEG', make: function (r, sh) { return hvPart(sh.P1, 'h', 'through the point ' + t(ptT(sh.P1[0], sh.P1[1])) + ' and parallel to the ' + t('x') + '-axis'); } },
          { id: '6c', level: 'BEG', make: function (r, sh) { return hvPart(sh.P2, 'h', 'through the point ' + t(ptT(sh.P2[0], sh.P2[1])) + ' and parallel to the ' + t('x') + '-axis'); } },
          { id: '6d', level: 'EMG', make: function (r) {
            return symPart('through the point ' + t('(a,\\ b)') + ' and parallel to the ' + t('y') + '-axis <span class="muted">(use the letters on the keypad)</span>', function (e) { return [1, 0, -e.a]; }, ['a', 'b'],
              [{ coef: function (e) { return [0, 1, -e.b]; }, code: 'line-vh', hint: 'That’s a horizontal line. A line parallel to the ' + t('y') + '-axis is <b>vertical</b>: every point on it has the same ' + t('x') + '-coordinate as ' + t('(a,\\ b)') + '.' },
                { coef: function (e) { return [1, 0, -e.b]; }, code: 'u72-coord', hint: 'Right kind of line (vertical) — but ' + t('b') + ' is the ' + t('y') + '-coordinate. A vertical line is ' + t('x=') + ' the point’s ' + t('x') + '-coordinate.' },
                { coef: function (e) { return [0, 1, -e.a]; }, code: 'line-vh', hint: 'That’s a horizontal line. A line parallel to the ' + t('y') + '-axis is vertical: ' + t('x=') + ' the point’s ' + t('x') + '-coordinate.' }],
              'x=a', 'Parallel to the ' + t('y') + '-axis means <b>vertical</b>, so every point has the same ' + t('x') + '-coordinate as ' + t('(a,\\ b)') + ': ' + t('x=a') + '.<br><b>Check.</b> ' + t('(a,\\ b)') + ' satisfies ' + t('x=a') + ' for every value of ' + t('b') + ' ✓',
              [H_HV[0], 'The answer uses the letter for the ' + t('x') + '-coordinate of the point.'], 'vertical through (a, b)', ['x-a=0', 'a=x'], ['y=b', 'x=b', 'y=a']);
          } }] },

      /* ---------------- Question 7: y = k ---------------- */
      { num: '7', stem: function (sh) { return 'Consider the linear function with equation ' + t('y=' + sh.k) + '.'; },
        shared: function (r) {
          return until(function () { var k = nz(r, -9, 9), m2 = r.int(2, 6), x0 = nz(r, -4, 4); return { k: k, m2: m2, x0: x0, c: k - m2 * x0 }; }, function (o) { return Math.abs(o.k) >= 2 && o.c !== 0 && Math.abs(o.c) <= 20 && o.x0 !== o.k; });
        },
        parts: [
          { id: '7a', level: 'BEG', outcome: 'RF6', make: function (r, sh) {
            var k = sh.k;
            var p = B.fields('State the values of ' + t('m') + ' and ' + t('b') + '.', [{ name: t('m'), label: '', before: t('m='), mode: 'math', keys: 'slope' }, { name: t('b'), label: '', before: t('b='), mode: 'math', keys: 'slope' }],
              [K.slope(0, { diag: function (v) { return near(v, k) ? { code: 'u72-swap-mb', hint: 'That’s ' + t('b') + '. The slope of a horizontal line: it rises ' + t('0') + ' for every unit of run.' } : { code: 'slope', hint: 'A horizontal line rises ' + t('0') + ' for every unit of run, so its slope is ' + t('0') + '.' }; } }), valChk([k, 1], [[0, 'u72-swap-mb', 'That’s ' + t('m') + '. The ' + t('y') + '-intercept is where the line crosses the ' + t('y') + '-axis: ' + t('(0,\\ ' + k + ')') + '.']])], ['0', String(k)], t('m=0') + ', ' + t('b=' + k),
              t('y=' + k) + ' is horizontal. Written as ' + t('y=0x+' + pT(k)) + ', it has ' + t('m=0') + ' and ' + t('b=' + k) + '.', ['A horizontal line rises ' + t('0') + ' for every unit of run.', 'Think of ' + t('y=' + k) + ' as ' + t('y=0x+' + pT(k)) + '.'], 'm and b of y=' + k);
            p.bad = [['\\text{undefined}', String(k)], [String(k), '0'], ['1', String(k)]];
            return p;
          } },
          { id: '7b', level: 'BEG', outcome: 'RF5', make: function (r, sh) {
            var k = sh.k;
            var fields = [{ name: t('x') + '-intercept', label: t('x') + '-intercept', mode: 'math', keys: 'eq', none: true }, { name: t('y') + '-intercept', label: t('y') + '-intercept', mode: 'math', keys: 'eq', none: true }];
            var p = B.fields('State the ' + t('x') + '- and ' + t('y') + '-intercepts of the graph. Press <b>none</b> if there isn’t one.', fields,
              [intChk(null, 'x', k, 'The line ' + t('y=' + k) + ' stays at height ' + t(k) + ' and never reaches the ' + t('x') + '-axis (' + t('y=0') + '), so there is <b>no</b> ' + t('x') + '-intercept.'), intChk(k, 'y', null)], ['none', String(k)],
              t('x') + '-intercept: <b>none</b><br>' + t('y') + '-intercept: ' + t(k),
              'The line sits at height ' + t(k) + ' and never reaches the ' + t('x') + '-axis, so there is <b>no ' + t('x') + '-intercept</b>. It crosses the ' + t('y') + '-axis at ' + t(ptT(0, k)) + ', so the ' + t('y') + '-intercept is ' + t(k) + '.',
              ['Picture the horizontal line ' + t('y=' + k) + '. Does it ever cross the ' + t('x') + '-axis?'], 'intercepts of y=' + k);
            p.good = [['\\text{none}', '(0, ' + k + ')']]; p.bad = [[String(k), String(k)], [String(k), 'none'], ['0', String(k)]];
            return p;
          } },
          { id: '7c', level: 'EMG', outcome: 'RF5', make: function (r, sh) {
            var k = sh.k, dom = '\\{x\\mid x\\in\\mathbb{R}\\}', rng = '\\{' + k + '\\}';
            var fields = [{ name: 'Domain', label: 'Domain', mode: 'math', keys: 'set', vars: ['x', 'y'], wide: true }, { name: 'Range', label: 'Range', mode: 'math', keys: 'set', vars: ['x', 'y'], wide: true }];
            var p = B.fields('Determine the domain and range of the function.', fields,
              [K.set(dom, { v: 'x', other: rng, otherName: 'range', wrong: [{ is: '\\{' + k + '\\}', code: 'set-swap', hint: 'That’s the range. Every real number can be used as an input ' + t('x') + ', so the domain is all real numbers.' }] }),
                K.set(rng, { v: 'y', other: dom, otherName: 'domain', wrong: [{ is: '\\{y\\mid y\\in\\mathbb{R}\\}', code: 'u72-range-all', hint: 'The only output this function ever gives is ' + t(k) + '. Its range is just that one value: ' + t('\\{' + k + '\\}') + ' (or ' + t('\\{y\\mid y=' + k + '\\}') + ').' }] })],
              [dom, rng], 'Domain: ' + t(dom) + '<br>Range: ' + t('\\{y\\mid y=' + k + '\\}') + ' (or ' + t(rng) + ')',
              'Every real number may be used as an input, so the domain is ' + t(dom) + '. The only output ever produced is ' + t(k) + ', so the range is ' + t('\\{y\\mid y=' + k + '\\}') + ', or simply ' + t(rng) + '.',
              ['The domain is every ' + t('x') + '-value the graph uses; the range is every ' + t('y') + '-value.', 'A horizontal line goes on forever left and right, but its height never changes.'], 'domain/range of y=' + k);
            p.good = [['\\mathbb{R}', '\\{y\\mid y=' + k + '\\}']]; p.bad = [['\\mathbb{R}', '\\mathbb{R}'], [rng, dom]];
            return p;
          } },
          { id: '7d', level: 'EMG', outcome: 'RF5', make: function (r, sh) {
            var k = sh.k, m2 = sh.m2, c = sh.c, x0 = sh.x0, oT = SI(m2, c);
            return ptPart('Determine the point of intersection of this line with the line ' + t(oT) + '.', [x0, k],
              [[[k, x0], 'pairs-flip', 'Your coordinates are swapped: the point is ' + t('(x,\\ y)') + ', and on the line ' + t('y=' + k) + ' the ' + t('y') + '-coordinate is ' + t(k) + '.'],
                [[(k + c) / m2, k], 'u72-pt-solve', 'Check how you solved ' + t(k + '=' + m2 + 'x' + (c < 0 ? '' : '+') + c) + ': move the constant to the other side by doing the <b>opposite</b> operation.'],
                [[x0, m2 * k + c], 'u72-pt-solve', 'You substituted ' + t('x=' + k) + '. On the line ' + t('y=' + k) + ' it’s ' + t('y') + ' that equals ' + t(k) + ': set ' + t(k + '=' + m2 + 'x' + (c < 0 ? '' : '+') + c) + ' and solve for ' + t('x') + '.']],
              'At the intersection both equations give the same ' + t('y') + ', so set them equal: ' + t(k + '=' + m2 + 'x' + (c < 0 ? '' : '+') + c + '\\Rightarrow ' + m2 + 'x=' + (k - c) + '\\Rightarrow x=' + x0) + ', and ' + t('y=' + k) + '. The lines meet at ' + t(ptT(x0, k)) + '.<br><b>Check.</b> ' + t(m2 + '\\left(' + x0 + '\\right)' + (c < 0 ? '' : '+') + c + '=' + k) + ' ✓',
              ['Every point on ' + t('y=' + k) + ' has ' + t('y=' + k) + '. Substitute ' + t('y=' + k) + ' into the other equation and solve for ' + t('x') + '.'], 'intersection of y=' + k + ' and ' + oT);
          } }] },

      /* ---------------- Question 8: x = h ---------------- */
      { num: '8', stem: function (sh) { return 'Consider the relation with equation ' + t('x=' + sh.h) + '.'; },
        shared: function (r) { return until(function () { var h = nz(r, -9, 9), p = nz(r, -9, 9); return { h: h, p: p }; }, function (o) { return Math.abs(o.h) >= 2 && Math.abs(o.p) !== Math.abs(o.h); }); },
        parts: [
          { id: '8a', level: 'BEG', outcome: 'RF5', make: function (r, sh) {
            var h = sh.h;
            var fields = [{ name: t('x') + '-intercept', label: t('x') + '-intercept', mode: 'math', keys: 'eq', none: true }, { name: t('y') + '-intercept', label: t('y') + '-intercept', mode: 'math', keys: 'eq', none: true }];
            var p = B.fields('State the ' + t('x') + '- and ' + t('y') + '-intercepts of the graph. Press <b>none</b> if there isn’t one.', fields,
              [intChk(h, 'x', null), intChk(null, 'y', h, t('x') + ' is always ' + t(h) + ' and never ' + t('0') + ', so the vertical line ' + t('x=' + h) + ' never meets the ' + t('y') + '-axis: there is <b>no</b> ' + t('y') + '-intercept.')], [String(h), 'none'],
              t('x') + '-intercept: ' + t(h) + '<br>' + t('y') + '-intercept: <b>none</b>',
              t('x=' + h) + ' is a vertical line crossing the ' + t('x') + '-axis at ' + t(ptT(h, 0)) + ', so the ' + t('x') + '-intercept is ' + t(h) + '. Since ' + t('x') + ' is always ' + t(h) + ' and never ' + t('0') + ', the line never meets the ' + t('y') + '-axis: <b>no ' + t('y') + '-intercept</b>.',
              ['Picture the vertical line ' + t('x=' + h) + '. Does it ever cross the ' + t('y') + '-axis?'], 'intercepts of x=' + h);
            p.good = [['(' + h + ', 0)', '\\text{none}']]; p.bad = [['none', String(h)], [String(h), String(h)], [String(-h), 'none']];
            return p;
          } },
          { id: '8b', level: 'EMG', outcome: 'RF4', make: function (r, sh) {
            var h = sh.h;
            return mc(r, 'Which statement explains why this relation is <b>not</b> a function?', [
              { html: 'The one input ' + t('x=' + h) + ' is paired with infinitely many outputs, so the graph fails the vertical line test.', right: true },
              { html: 'Its slope is ' + t('0') + ', and a function can’t have a slope of ' + t('0') + '.', why: 'The slope of a vertical line is <b>undefined</b>, not ' + t('0') + ' — and horizontal lines (slope ' + t('0') + ') <i>are</i> functions.' },
              { html: 'It has no ' + t('y') + '-intercept, and every function must cross the ' + t('y') + '-axis.', why: 'A function doesn’t need a ' + t('y') + '-intercept (a segment from ' + t('x=2') + ' to ' + t('x=5') + ' can be a function). Look at how many outputs one input has.' },
              { html: 'It isn’t a straight line, so it can’t be a function.', why: t('x=' + h) + ' <i>is</i> a straight line — a vertical one. The problem is that one input has many outputs.' }],
              'Every point on the line has the same input, ' + t('x=' + h) + ', but ' + t('y') + ' can be any real number. That single input is paired with infinitely many outputs, so the graph fails the vertical line test and the relation is not a function.',
              ['A function gives exactly <b>one</b> output for each input. How many points of ' + t('x=' + h) + ' have ' + t('x=' + h) + '?'], 'why x=' + h + ' is not a function');
          } },
          { id: '8c', level: 'EMG', outcome: 'RF5', make: function (r, sh) {
            var h = sh.h, dom = '\\{' + h + '\\}', rng = '\\{y\\mid y\\in\\mathbb{R}\\}';
            var fields = [{ name: 'Domain', label: 'Domain', mode: 'math', keys: 'set', vars: ['x', 'y'], wide: true }, { name: 'Range', label: 'Range', mode: 'math', keys: 'set', vars: ['x', 'y'], wide: true }];
            var p = B.fields('Determine the domain and range of the relation.', fields,
              [K.set(dom, { v: 'x', other: rng, otherName: 'range', wrong: [{ is: '\\{x\\mid x\\in\\mathbb{R}\\}', code: 'u72-dom-all', hint: 'The only input that ever occurs is ' + t(h) + ', so the domain is just ' + t('\\{' + h + '\\}') + ' (or ' + t('\\{x\\mid x=' + h + '\\}') + ').' }] }),
                K.set(rng, { v: 'y', other: dom, otherName: 'domain', wrong: [{ is: '\\{' + h + '\\}', code: 'set-swap', hint: 'That’s the domain. The line goes up and down forever, so every real number is an output.' }] })],
              [dom, rng], 'Domain: ' + t('\\{x\\mid x=' + h + '\\}') + ' (or ' + t(dom) + ')<br>Range: ' + t(rng),
              'The only input that ever occurs is ' + t(h) + ', so the domain is ' + t('\\{x\\mid x=' + h + '\\}') + ', or ' + t(dom) + '. Every real number occurs as an output, so the range is ' + t(rng) + '.',
              ['The domain is every ' + t('x') + '-value on the graph; the range is every ' + t('y') + '-value.'], 'domain/range of x=' + h);
            p.good = [['\\{x\\mid x=' + h + '\\}', '\\mathbb{R}']]; p.bad = [['\\mathbb{R}', '\\mathbb{R}'], [rng, dom]];
            return p;
          } },
          { id: '8d', level: 'BEG', make: function (r, sh) {
            var h = sh.h, p0 = sh.p;
            return LP('State the equation of the line parallel to the ' + t('y') + '-axis that passes through ' + t(ptT(p0, h)) + '.', { x: p0 },
              { wrong: [{ is: { x: h }, code: 'u72-coord', hint: 'Right kind of line (vertical) — but ' + t(h) + ' is the point’s ' + t('y') + '-coordinate. A vertical line is ' + t('x=') + ' the point’s ' + t('x') + '-coordinate.' },
                { is: { y: h }, code: 'line-vh', hint: 'That’s a horizontal line. Parallel to the ' + t('y') + '-axis means vertical: ' + t('x=') + ' the point’s ' + t('x') + '-coordinate.' }] },
              'Parallel to the ' + t('y') + '-axis means vertical, so the equation is ' + t('x=') + ' the ' + t('x') + '-coordinate of the point: ' + t('x=' + p0) + '.<br><b>Check.</b> ' + t(ptT(p0, h)) + ' satisfies ' + t('x=' + p0) + ' ✓', [H_HV[0]], 'vertical through (' + p0 + ',' + h + ')');
          } }] },

      /* ---------------- Question 9 ---------------- */
      { num: '9', stem: 'Write the equation of each line.', shared: function (r) {
          var dpt = function () { return until(function () { return [nz(r, -9, 9), nz(r, -9, 9)]; }, function (p) { return Math.abs(p[0]) !== Math.abs(p[1]); }); };
          var G = dpt(), Hh = dpt(), I = dpt();
          return { P1: dpt(), P2: dpt(), G: G, gc: until(function () { return nz(r, -8, 8); }, function (c) { return c !== G[1] && c !== G[0]; }), H: Hh, hc: until(function () { return nz(r, -8, 8); }, function (c) { return c !== Hh[0] && c !== Hh[1]; }), I: I, ic: until(function () { return nz(r, -8, 8); }, function (c) { return c !== I[0] && c !== I[1]; }) };
        },
        parts: [
          { id: '9a', level: 'BEG', make: function (r, sh) { return hvPart(sh.P1, 'h', 'parallel to the ' + t('x') + '-axis, through ' + t(ptT(sh.P1[0], sh.P1[1]))); } },
          { id: '9b', level: 'BEG', make: function (r, sh) { return hvPart(sh.P1, 'v', 'parallel to the ' + t('y') + '-axis, through ' + t(ptT(sh.P1[0], sh.P1[1]))); } },
          { id: '9c', level: 'BEG', make: function (r, sh) { return hvPart(sh.P2, 'v', 'perpendicular to the ' + t('x') + '-axis, through ' + t(ptT(sh.P2[0], sh.P2[1])), 'Perpendicular to the ' + t('x') + '-axis (which is horizontal) means <b>vertical</b>'); } },
          { id: '9d', level: 'BEG', make: function (r, sh) { return hvPart(sh.P2, 'h', 'perpendicular to the ' + t('y') + '-axis, through ' + t(ptT(sh.P2[0], sh.P2[1])), 'Perpendicular to the ' + t('y') + '-axis (which is vertical) means <b>horizontal</b>'); } },
          { id: '9e', level: 'LIM', make: function () {
            return LP('the ' + t('x') + '-axis', { y: 0 }, {}, 'The ' + t('x') + '-axis is the horizontal line through ' + t('(0,\\ 0)') + ': every point on it has ' + t('y') + '-coordinate ' + t('0') + ', so its equation is ' + t('y=0') + '.', ['Every point on the ' + t('x') + '-axis looks like ' + t('(a,\\ 0)') + '. What is always the same?'], 'the x-axis');
          } },
          { id: '9f', level: 'LIM', make: function () {
            return LP('the ' + t('y') + '-axis', { x: 0 }, {}, 'The ' + t('y') + '-axis is the vertical line through ' + t('(0,\\ 0)') + ': every point on it has ' + t('x') + '-coordinate ' + t('0') + ', so its equation is ' + t('x=0') + '.', ['Every point on the ' + t('y') + '-axis looks like ' + t('(0,\\ b)') + '. What is always the same?'], 'the y-axis');
          } },
          { id: '9g', level: 'EMG', make: function (r, sh) {
            var P = sh.G, c = sh.gc;
            return LP('through ' + t(ptT(P[0], P[1])) + ', perpendicular to the line ' + t('y=' + c), { x: P[0] },
              { wrong: [{ is: { y: P[1] }, code: 'line-vh', hint: 'That line is horizontal, so it is <b>parallel</b> to ' + t('y=' + c) + '. ' + t('y=' + c) + ' is horizontal, so a line perpendicular to it is vertical.' }, { is: { y: c }, code: 'u72-given-line', hint: 'That’s the given line itself. You need the line through ' + t(ptT(P[0], P[1])) + ' perpendicular to it.' }, { is: { x: c }, code: 'u72-coord', hint: 'Right kind of line (vertical) — but it must pass through ' + t(ptT(P[0], P[1])) + ', so use that point’s ' + t('x') + '-coordinate.' }] },
              t('y=' + c) + ' is horizontal, so a line perpendicular to it is <b>vertical</b>. The vertical line through ' + t(ptT(P[0], P[1])) + ' is ' + t('x=' + P[0]) + '.<br><b>Check.</b> ' + t(ptT(P[0], P[1])) + ' satisfies ' + t('x=' + P[0]) + ' ✓', ['Is ' + t('y=' + c) + ' horizontal or vertical? A line perpendicular to it is the other kind.'], 'through (' + P + ') perp to y=' + c);
          } },
          { id: '9h', level: 'EMG', make: function (r, sh) {
            var P = sh.H, c = sh.hc;
            return LP('through ' + t(ptT(P[0], P[1])) + ', parallel to the line ' + t('x=' + c), { x: P[0] },
              { wrong: [{ is: { y: P[1] }, code: 'line-vh', hint: 'That line is horizontal, so it is perpendicular to ' + t('x=' + c) + '. ' + t('x=' + c) + ' is vertical, and all vertical lines are parallel.' }, { is: { x: c }, code: 'u72-given-line', hint: 'That’s the given line itself. Your line must pass through ' + t(ptT(P[0], P[1])) + '.' }, { is: { x: P[1] }, code: 'u72-coord', hint: 'Right kind of line (vertical) — use the point’s ' + t('x') + '-coordinate.' }] },
              t('x=' + c) + ' is vertical, and all vertical lines are parallel. The vertical line through ' + t(ptT(P[0], P[1])) + ' is ' + t('x=' + P[0]) + '.<br><b>Check.</b> ' + t(ptT(P[0], P[1])) + ' satisfies ' + t('x=' + P[0]) + ' ✓', ['Is ' + t('x=' + c) + ' horizontal or vertical? A line parallel to it is the same kind.'], 'through (' + P + ') parallel to x=' + c);
          } },
          { id: '9i', level: 'EMG', make: function (r, sh) {
            var P = sh.I, c = sh.ic;
            return LP('through ' + t(ptT(P[0], P[1])) + ', perpendicular to the line ' + t('x=' + c), { y: P[1] },
              { wrong: [{ is: { x: P[0] }, code: 'line-vh', hint: 'That line is vertical, so it is <b>parallel</b> to ' + t('x=' + c) + '. ' + t('x=' + c) + ' is vertical, so a line perpendicular to it is horizontal.' }, { is: { x: c }, code: 'u72-given-line', hint: 'That’s the given line itself.' }, { is: { y: P[0] }, code: 'u72-coord', hint: 'Right kind of line (horizontal) — use the point’s ' + t('y') + '-coordinate.' }] },
              t('x=' + c) + ' is vertical, so a line perpendicular to it is <b>horizontal</b>. The horizontal line through ' + t(ptT(P[0], P[1])) + ' is ' + t('y=' + P[1]) + '.<br><b>Check.</b> ' + t(ptT(P[0], P[1])) + ' satisfies ' + t('y=' + P[1]) + ' ✓', ['Is ' + t('x=' + c) + ' horizontal or vertical? A line perpendicular to it is the other kind.'], 'through (' + P + ') perp to x=' + c);
          } }] },

      /* ---------------- Questions 10–14 ---------------- */
      { num: '10', section: 'Multiple choice and numerical response', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '10', level: 'LIM', make: function (r) { var P = until(function () { return [nz(r, -12, 12), nz(r, -12, 12)]; }, function (p) { return Math.abs(p[0]) !== Math.abs(p[1]); }); return hvMC(r, P, true); } }] },
      { num: '11', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '11', level: 'LIM', make: function (r) { var P = until(function () { return [nz(r, -12, 12), nz(r, -12, 12)]; }, function (p) { return Math.abs(p[0]) !== Math.abs(p[1]); }); return hvMC(r, P, false); } }] },
      { num: '12', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '12', level: 'BEG', make: function (r) {
          var g = anyFrac(r, 2, 7, 2, 7), sg = r.pick([1, 1, -1]); g = [sg * g[0], g[1]];
          var gT = SI(g, 0), right = nrec(g);
          return mc(r, 'The line through the origin, perpendicular to the line with equation ' + t(gT) + ', has equation', [
            { html: t(SI(g, 0)), why: 'That’s the given line itself. A perpendicular line needs the negative reciprocal slope.' },
            { html: t(SI(fInv(g), 0)), why: 'You flipped the slope but kept its sign. Perpendicular slopes multiply to ' + t('-1') + '.' },
            { html: t(SI(fNeg(g), 0)), why: 'You changed the sign but didn’t flip the slope.' },
            { html: t(SI(right, 0)), right: true }],
            t(gT) + ' has slope ' + t(nT(g)) + '; the negative reciprocal is ' + t(nT(right)) + '. Through the origin, ' + t('b=0') + ', so ' + t(SI(right, 0)) + '.<br><b>Check.</b> ' + t(pT(g) + '\\times ' + pT(right) + '=-1') + ' ✓', [H_PERP[0]], 'MC perp through origin to slope ' + nT(g));
        } }] },
      { num: '13', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '13', level: 'PRG', make: function (r) {
          var k = r.int(2, 7), c = r.int(2, 9), A = until(function () { return r.int(2, 6); }, function (a) { return a !== k; }), Bq = r.int(k + 1, 19), ans = Bq - k, oT = SI(A, -Bq), gT = SI([1, k], c);
          return nrPart('Consider the line which is perpendicular to ' + t(gT) + ' and has the same ' + t('y') + '-intercept as ' + t(oT) + '. If the equation of this line is written in the form ' + t('y=mx+b') + ', then the exact value of ' + t('m-b') + ' is ______.', ans,
            [[k + Bq, 'u72-nr-perp', 'Check the sign of the perpendicular slope: the negative reciprocal of ' + t('\\frac{1}{' + k + '}') + ' is ' + t(-k) + '.'], [A + Bq, 'u72-nr-other', 'You used the slope of ' + t(oT) + '. That line only gives ' + t('b') + '; the slope comes from the line yours is perpendicular to.'],
              [-k - c, 'u72-nr-b', 'The ' + t('y') + '-intercept comes from ' + t(oT) + ', so ' + t('b=' + (-Bq)) + '.'], [Bq - 1 / k, 'u72-nr-perp', 'The perpendicular slope is the negative reciprocal of ' + t('\\frac{1}{' + k + '}') + ': flip it, ' + t('\\frac{' + k + '}{1}') + ', and change the sign.']],
            t(gT) + ' has slope ' + t('\\frac{1}{' + k + '}') + ', so the perpendicular slope is ' + t('m=' + (-k)) + '. ' + t(oT) + ' has ' + t('y') + '-intercept ' + t('b=' + (-Bq)) + ', so the line is ' + t(SI(-k, -Bq)) + ', and ' + t('m-b=' + (-k) + '-\\left(' + (-Bq) + '\\right)=' + (-k) + '+' + Bq + '=' + ans) + '.<br><b>Check.</b> ' + t('\\frac{1}{' + k + '}\\times\\left(' + (-k) + '\\right)=-1') + ' ✓',
            ['Build the line first: its slope is the negative reciprocal of ' + t('\\frac{1}{' + k + '}') + ', and its ' + t('b') + ' is the constant term of ' + t(oT) + '.', 'Then subtract carefully: ' + t('m-b') + ' with a negative ' + t('b') + '.'], 'NR m-b, perp to 1/' + k + ', b=' + (-Bq));
        } }] },
      { num: '14', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '14', level: 'PRG', make: function (r) {
          var k = r.pick([2, 4, 5, 5, -2, -4, -5]), c = r.int(1, 9), ans = Math.round((c - 1 / k) * 100) / 100, gT = SI(k, c), m = nrec([k, 1]);
          return nrPart('Two perpendicular lines intersect on the ' + t('y') + '-axis. One line has equation ' + t(gT) + '. If the equation of the other line is ' + t('y=mx+b') + ', then the exact value of ' + t('m+b') + ' is ______.', ans,
            [[c - k, 'u72-nr-perp', 'The other line’s slope is the negative <b>reciprocal</b> of ' + t(k) + ', not ' + t(-k) + '.'], [Math.round((c + 1 / k) * 100) / 100, 'u72-nr-perp', 'Check the sign: the negative reciprocal of ' + t(k) + ' is ' + t(nT(m)) + '.'], [c + k, 'u72-nr-perp', 'You used the same slope — that would make the lines parallel, not perpendicular.'], [c, 'u72-nr-b', 'Remember to add the slope ' + t('m') + ' as well as ' + t('b') + '.'], [Math.round((1 / k) * 100) / 100, 'u72-nr-b', 'Where do the lines meet? On the ' + t('y') + '-axis — at the ' + t('y') + '-intercept of ' + t(gT) + ', so ' + t('b=' + c) + '.']],
            'The lines meet on the ' + t('y') + '-axis, so they share that ' + t('y') + '-intercept: ' + t('b=' + c) + '. The slope of ' + t(gT) + ' is ' + t(k) + ', so ' + t('m=' + nT(m)) + ' and the other line is ' + t(SI(m, c)) + '. Then ' + t('m+b=' + nT(m) + '+' + c + '=' + ans) + '.<br><b>Check.</b> ' + t(k + '\\times ' + pT(m) + '=-1') + ', and both lines pass through ' + t(ptT(0, c)) + ' ✓',
            ['Two lines that meet on the ' + t('y') + '-axis meet at a point ' + t('(0,\\ b)') + ' — what does that tell you about their ' + t('y') + '-intercepts?', 'Write the decimal: ' + t('\\frac{1}{' + Math.abs(k) + '}=' + (1 / Math.abs(k))) + '.'], 'NR m+b, perp to slope ' + k + ' meeting on y-axis');
        } }] }
    ],

    /* =============================== EXTRA PRACTICE =============================== */
    extra: [
      /* ---------- Part A: the point is not the y-intercept ---------- */
      { num: '1', section: 'Extra practice A — When the point is not the y-intercept', stem: 'Determine the equation of each line in the form ' + t('y=mx+b') + '. Use exact fractions, never decimals.', parts: [
        { id: 'e1a', level: 'EMG', make: function (r) { var m = r.int(2, 5), x0 = r.int(1, 4), y0 = r.int(-8, -2); return exactOnly(slopePointPart([m, 1], x0, y0)); } },
        { id: 'e1b', level: 'EMG', make: function (r) { var m = -r.int(2, 5), x0 = r.int(-5, -2), y0 = r.int(2, 9); return exactOnly(slopePointPart([m, 1], x0, y0)); } },
        { id: 'e1c', level: 'EMG', make: function (r) { var f = properFrac(r, 2, 5), x0 = f[1] * r.int(1, 3), y0 = r.int(-6, -1); return exactOnly(slopePointPart(f, x0, y0)); } },
        { id: 'e1d', level: 'EMG', make: function (r) { var f = fNeg(properFrac(r, 3, 5)), x0 = -f[1] * r.int(1, 2), y0 = r.int(1, 6); return exactOnly(slopePointPart(f, x0, y0)); } },
        { id: 'e1e', level: 'PRG', make: function (r) { var f = until(function () { return properFrac(r, 4, 6); }, function (f) { return f[1] !== 5; }), x0 = until(function () { return nz(r, -5, 5); }, function (x) { return (f[0] * x) % f[1] !== 0; }), y0 = nz(r, -6, 6); return exactOnly(slopePointPart(f, x0, y0)); } },
        { id: 'e1f', level: 'PRG', make: function (r) { var q = r.pick([2, 2, 3]), f = [-1, q], x0 = until(function () { return r.int(1, 9); }, function (x) { return x % q !== 0; }); return exactOnly(slopePointPart(f, x0, 0)); } }] },
      { num: '2', stem: function (sh) { return 'Determine the equation of the line through each pair of points, in the form ' + t('y=mx+b') + ' where possible.'; },
        shared: function (r) {
          var mk = function (m, x1, y1, j) { m = fr(m); var x2 = x1 + m[1] * j, y2 = y1 + m[0] * j; return { x1: x1, y1: y1, x2: x2, y2: y2, m: m }; };
          return {
            a: mk([r.int(2, 4), 1], r.int(1, 3), r.int(2, 7), r.int(1, 3)),
            b: mk([-r.int(2, 4), 1], -r.int(1, 3), r.int(4, 10), r.int(2, 3) + 1),
            c: (function () { var q = r.pick([2, 3]); return mk([1, q], -q * r.int(1, 3), r.int(-5, -1), r.int(2, 3)); })(),
            d: (function () { return until(function () { var f = fNeg(properFrac(r, 3, 5)), x1 = r.int(2, 6); return mk(f, x1, r.int(-4, -1), -2); }, function (o) { return !isInt(bOf(o.m, o.x1, o.y1)); }); })(),
            e: (function () { var q = r.pick([2, 3]); return mk([1, q], -q * r.int(1, 2), r.int(-9, -5), r.int(3, 5)); })(),
            f: (function () { var y = nz(r, -8, 8), x1 = r.int(-3, 4); return { x1: x1, y1: y, x2: x1 + r.int(3, 7), y2: y, m: [0, 1] }; })()
          };
        },
        parts: [
          { id: 'e2a', level: 'EMG', make: function (r, sh) { return twoPointPart(sh.a); } },
          { id: 'e2b', level: 'PRG', make: function (r, sh) { return twoPointPart(sh.b); } },
          { id: 'e2c', level: 'PRG', make: function (r, sh) { return twoPointPart(sh.c); } },
          { id: 'e2d', level: 'PRG', make: function (r, sh) { return twoPointPart(sh.d); } },
          { id: 'e2e', level: 'PRG', make: function (r, sh) { return twoPointPart(sh.e); } },
          { id: 'e2f', level: 'EMG', make: function (r, sh) { return twoPointPart(sh.f); } },
          { id: 'e2g', sub: 'surprise', level: 'EMG', make: function (r, sh) {
            var f = sh.f, list = ['a', 'b', 'c', 'd', 'e', 'f'].map(function (k) { var o = sh[k]; return '(' + k + ') ' + t(ptT(o.x1, o.y1)) + ' and ' + t(ptT(o.x2, o.y2)); }).join('<br>');
            return mc(r, 'The six pairs of points are:<br>' + list + '<br>One of these lines “surprises” you. Which one, and why?', [
              { html: '(f): the rise is ' + t('0') + ', so ' + t('m=0') + ', the ' + t('x') + '-term vanishes and the line is horizontal, ' + t('y=' + f.y1) + '.', right: true },
              { html: '(f): the run is ' + t('0') + ', so the slope is undefined and the line is vertical.', why: 'Look again at (f): the ' + t('x') + '-values ' + t(f.x1) + ' and ' + t(f.x2) + ' are different, so the run isn’t ' + t('0') + '. It’s the ' + t('y') + '-values that are equal.' },
              { html: '(d): its ' + t('y') + '-intercept is a fraction, so it can’t be written as ' + t('y=mx+b') + '.', why: 'A fractional ' + t('b') + ' is fine in ' + t('y=mx+b') + '. Look for the line whose slope behaves differently.' },
              { html: '(c): its slope is less than ' + t('1') + ', so the line is horizontal.', why: 'A slope like ' + t('\\frac{1}{2}') + ' is gentle, but the line still rises. Only a slope of exactly ' + t('0') + ' is horizontal.' }],
              'In (f) both points have ' + t('y=' + f.y1) + ': ' + t('m=\\frac{' + f.y1 + '-' + pT(f.y1) + '}{' + f.x2 + '-' + pT(f.x1) + '}=\\frac{0}{' + (f.x2 - f.x1) + '}=0') + '. The ' + t('x') + '-term vanishes and the line is <b>horizontal</b>: ' + t('y=' + f.y1) + '.',
              ['Which pair of points has something in common?'], 'which two-point line is horizontal');
          } }] },
      { num: '3', stem: function (sh) { return '<b>Running the equation backwards.</b> A line has equation ' + t(SI(sh.m, sh.c)) + '. Each part gives you <i>one</i> coordinate of a point on this line. Determine the other, and state the full ordered pair.'; },
        shared: function (r) {
          return until(function () { var q = r.pick([2, 3, 3, 4]), p = until(function () { return r.int(1, q + 2); }, function (p) { return gcd(p, q) === 1 && p !== q; }); return { m: [p, q], c: nz(r, -7, 7), q: q, p: p, j: [r.int(2, 4), -r.int(1, 2), -r.int(1, 3), r.int(1, 3)] }; },
            function (o) { return Math.abs(o.c) >= 3 && o.j[2] !== o.j[1] && o.j[0] !== o.j[3]; });
        },
        parts: [
          { id: 'e3a', level: 'BEG', outcome: 'RF4', make: function (r, sh) { return backPart(sh, 'x', sh.q * sh.j[0]); } },
          { id: 'e3b', level: 'EMG', outcome: 'RF4', make: function (r, sh) { return backPart(sh, 'y', sh.q * sh.j[1]); } },
          { id: 'e3c', level: 'BEG', outcome: 'RF4', make: function (r, sh) { return backPart(sh, 'x', sh.q * sh.j[2]); } },
          { id: 'e3d', level: 'EMG', outcome: 'RF4', make: function (r, sh) { return backPart(sh, 'y', sh.q * sh.j[3]); } },
          { id: 'e3e', level: 'BEG', outcome: 'RF4', make: function (r, sh) {
            var on = r.chance(0.5), x = on ? sh.q * r.pick([-2, -1, 1, 2, 3]) : until(function () { return nz(r, -9, 9); }, function (x) { return (sh.p * x) % sh.q !== 0; });
            var yv = fAdd(fMul(sh.m, x), sh.c), y = on ? fv(yv) : Math.round(fv(yv)) + 0;
            var trueOn = near(fv(yv), y);
            return B.tf(r, 'True or false: the point ' + t(ptT(x, y)) + ' lies on this line.', trueOn,
              trueOn ? 'Substitute ' + t('x=' + x) + ': ' + t(nT(sh.m) + '\\left(' + x + '\\right)' + (sh.c < 0 ? '' : '+') + sh.c + '=' + nT(yv)) + ', which <b>is</b> ' + t(y) + '.' : 'Substitute ' + t('x=' + x) + ': ' + t(nT(sh.m) + '\\left(' + x + '\\right)' + (sh.c < 0 ? '' : '+') + sh.c + '=' + nT(yv)) + ', which is not ' + t(y) + '.',
              'Substitute ' + t('x=' + x) + ': ' + t(nT(sh.m) + '\\left(' + x + '\\right)' + (sh.c < 0 ? '' : '+') + sh.c + '=' + nT(yv)) + '. ' + (trueOn ? 'That equals ' + t(y) + ', so <b>yes</b>: the point is on the line.' : t(nT(yv) + '\\ne ' + y) + ', so <b>no</b>: the point is not on the line.'),
              ['Substitute the ' + t('x') + '-coordinate and see whether you get the ' + t('y') + '-coordinate.'], 'is (' + x + ',' + y + ') on the line');
          } },
          { id: 'e3f', level: 'EMG', outcome: 'RF5', make: function (r, sh) {
            var xi = fDiv(fNeg(sh.c), sh.m), ri = fNeg([sh.c, 1]);
            var p = ptPart('the point on the line whose ' + t('y') + '-coordinate is ' + t('0') + ' (this point is the line’s ' + t('x') + '-intercept)', [xi, 0],
              [[[fMul(ri, sh.m), 0], 'u72-pt-solve', 'To undo “' + t('\\times ' + nT(sh.m)) + '”, multiply by its reciprocal ' + t(nT(fInv(sh.m))) + ' (or divide by ' + t(nT(sh.m)) + ').'],
                [[fDiv([sh.c, 1], sh.m), 0], 'u72-pt-solve', 'Check the sign: from ' + t('0=' + nT(sh.m) + 'x' + (sh.c < 0 ? '' : '+') + sh.c) + ', moving the constant gives ' + t(nT(sh.m) + 'x=' + (-sh.c)) + '.'],
                [[0, sh.c], 'u72-pt-swap', 'That’s the ' + t('y') + '-intercept (where ' + t('x=0') + '). Here ' + t('y=0') + ': substitute it and solve for ' + t('x') + '.']],
              t('0=' + nT(sh.m) + 'x' + (sh.c < 0 ? '' : '+') + sh.c) + ', so ' + t(nT(sh.m) + 'x=' + (-sh.c)) + ' and ' + t('x=' + (-sh.c) + '\\times ' + nT(fInv(sh.m)) + '=' + nT(xi)) + '. The point is ' + t(ptT(xi, 0)) + ', the <b>' + t('x') + '-intercept</b>.',
              ['Substitute ' + t('y=0') + ' and solve for ' + t('x') + '. Leave a fraction as an exact fraction.'], 'x-intercept of ' + SI(sh.m, sh.c));
            return p;
          } },
          { id: 'e3g', level: 'EMG', outcome: 'RF4', make: function (r, sh) {
            return mc(r, 'Finding the point on this line with a given ' + t('x') + '-coordinate, and finding the point with a given ' + t('y') + '-coordinate: one needs an equation solved and the other does not. Which direction is the quick one, and why?', [
              { html: 'Given ' + t('x') + ' is quick: ' + t('y=mx+b') + ' has ' + t('y') + ' alone on one side, so you substitute ' + t('x') + ' and evaluate.', right: true },
              { html: 'Given ' + t('y') + ' is quick: you substitute ' + t('y') + ' and read off ' + t('x') + '.', why: 'With ' + t('y') + ' given you still have to undo the ' + t((sh.c < 0 ? '' : '+') + sh.c) + ' and the ' + t('\\times ' + nT(sh.m)) + ' — that’s solving an equation.' },
              { html: 'Both are equally quick, because the slope is a fraction either way.', why: 'One direction only needs arithmetic; the other needs inverse operations. Which one?' },
              { html: 'Given ' + t('x') + ' is quick, because ' + t('x') + ' is always the smaller number.', why: 'The size of the numbers doesn’t matter — it’s about which variable is already by itself.' }],
              'Given ' + t('x') + ' is quick: substitute and evaluate, and ' + t('y') + ' comes straight out. Given ' + t('y') + ', you must undo the ' + t((sh.c < 0 ? '' : '+') + sh.c) + ' and the ' + t('\\times ' + nT(sh.m)) + ' — an equation to solve. ' + t('y=mx+b') + ' is built as an “' + t('x') + ' in, ' + t('y') + ' out” recipe.',
              ['Which variable is by itself in ' + t('y=mx+b') + '?'], 'which direction is quick');
          } }] },

      /* ---------- Part B: from a graph and from a table ---------- */
      { num: '4', section: 'Extra practice B — From a graph and from a table', stem: function (sh) {
          return 'Each line below passes through the two marked lattice points. Determine the equation of each line in the form ' + t('y=mx+b') + '.<br>' +
            figure({ x: [-8, 8], y: [-8, 8], labels: 2, max: 340, points: [{ x: sh.A[0], y: sh.A[1], color: BLUE }, { x: sh.A[2], y: sh.A[3], color: BLUE }, { x: sh.B[0], y: sh.B[1], color: RED }, { x: sh.B[2], y: sh.B[3], color: RED }] },
              [{ m: sh.mA, b: bOf(sh.mA, sh.A[0], sh.A[1]), color: BLUE, label: ['p', '1'], f: 0.92, side: -1 }, { m: sh.mB, b: bOf(sh.mB, sh.B[0], sh.B[1]), color: RED, label: ['p', '2'], f: 0.92 }]);
        },
        shared: function (r) {
          var one = function (sgn) {
            return until(function () {
              var f = properFrac(r, 3, 5); if (r.chance(0.4)) f = fInv(f);
              var m = [sgn * f[0], f[1]], x1 = r.int(-7, 1), y1 = r.int(-7, 7), j = r.int(1, 3), x2 = x1 + m[1] * j, y2 = y1 + m[0] * j;
              return { m: m, P: [x1, y1, x2, y2] };
            }, function (o) { var P = o.P; return P.every(function (v) { return v >= -7 && v <= 7; }) && !isInt(bOf(o.m, P[0], P[1])) && Math.abs(fv(o.m)) <= 2 && P[2] - P[0] >= 4 && Math.abs(fv(bOf(o.m, P[0], P[1]))) < 7; });
          };
          return until(function () { var a = one(1), b = one(-1); return { mA: a.m, A: a.P, mB: b.m, B: b.P }; }, function (o) { return Math.abs(fv(bOf(o.mA, o.A[0], o.A[1])) - fv(bOf(o.mB, o.B[0], o.B[1]))) > 1; });
        },
        parts: [
          { id: 'e4a', level: 'PRG', make: function (r, sh) { return twoPointPart({ x1: sh.A[0], y1: sh.A[1], x2: sh.A[2], y2: sh.A[3], m: sh.mA }, t('p_1') + ' passes through ' + t(ptT(sh.A[0], sh.A[1])) + ' and ' + t(ptT(sh.A[2], sh.A[3])) + '. Determine its equation.'); } },
          { id: 'e4b', level: 'PRG', make: function (r, sh) { return twoPointPart({ x1: sh.B[0], y1: sh.B[1], x2: sh.B[2], y2: sh.B[3], m: sh.mB }, t('p_2') + ' passes through ' + t(ptT(sh.B[0], sh.B[1])) + ' and ' + t(ptT(sh.B[2], sh.B[3])) + '. Determine its equation.'); } },
          { id: 'e4c', level: 'EMG', make: function (r, sh) {
            return mc(r, 'Neither line crosses the ' + t('y') + '-axis at a grid point. Why couldn’t reading ' + t('b') + ' off the graph give an exact answer, and what do you do instead?', [
              { html: 'The lines cross the ' + t('y') + '-axis between grid lines, so reading ' + t('b') + ' is only an estimate. Take the slope from the two exact lattice points and solve for ' + t('b') + ' by substituting one of them into ' + t('y=mx+b') + '.', right: true },
              { html: 'The graph is drawn to scale, so ' + t('b') + ' can be read to the nearest tenth, which is exact enough.', why: 'A reading to the nearest tenth is still an estimate — an exact answer like ' + t('-\\frac{1}{4}') + ' needs algebra.' },
              { html: 'Use the ' + t('x') + '-intercept as ' + t('b') + ' instead, because it is easier to read.', why: 'The ' + t('x') + '-intercept isn’t ' + t('b') + ': ' + t('b') + ' is where the line crosses the <b>' + t('y') + '</b>-axis.' },
              { html: 'There is no exact answer: these lines can’t be written in the form ' + t('y=mx+b') + '.', why: 'Every non-vertical line can be written as ' + t('y=mx+b') + ' — here ' + t('b') + ' is just a fraction.' }],
              'The lines cross the ' + t('y') + '-axis at ' + t(nT(bOf(sh.mA, sh.A[0], sh.A[1]))) + ' and ' + t(nT(bOf(sh.mB, sh.B[0], sh.B[1]))) + ', which lie between grid lines, so the graph only lets you estimate ' + t('b') + '. Instead, find the slope from the two exact lattice points, then substitute one of them into ' + t('y=mx+b') + ' and solve for ' + t('b') + '.',
              ['Where exactly do the lines cross the ' + t('y') + '-axis? Can you read that from the grid?'], 'why b cannot be read off');
          } }] },
      { num: '5', stem: 'Each table below shows a relation. Where the relation is linear, determine its equation in the form ' + t('y=mx+b') + '.',
        shared: function (r) {
          var a = until(function () { var m = r.pick([-2, -3, 2, -2]), dx = r.pick([2, 3]), x0 = r.int(-6, -2), b = nz(r, -6, 6); return { m: m, dx: dx, x0: x0, b: b }; }, function (o) { return Math.abs(o.m * o.x0 + o.b) <= 20 && Math.abs(o.m * (o.x0 + 4 * o.dx) + o.b) <= 20; });
          var bb = until(function () { var q = r.pick([3, 4, 5]), p = until(function () { return r.int(1, q - 1); }, function (p) { return gcd(p, q) === 1; }), x0 = -q * r.int(1, 2) + r.pick([0, 2]), y0 = r.int(-12, -4); return { m: [p, q], dx: q, x0: x0, y0: y0 }; }, function (o) { return !isInt(bOf(o.m, o.x0, o.y0)); });
          return { a: a, b: bb, c: { c: nz(r, -4, 4), x0: r.int(0, 1), s: r.pick([1, 1, -1]) }, d: { k: nz(r, -9, 9), xs: until(function () { return r.sample([-5, -3, -2, 0, 1, 4, 6, 9], 4).sort(function (u, v) { return u - v; }); }, function (xs) { var d = [xs[1] - xs[0], xs[2] - xs[1], xs[3] - xs[2]]; return d[0] !== d[1] || d[1] !== d[2]; }) } };
        },
        parts: [
          { id: 'e5a', level: 'PRG', outcome: 'RF7', make: function (r, sh) { var o = sh.a, xs = [0, 1, 2, 3, 4].map(function (i) { return o.x0 + i * o.dx; }); return tablePart(xs, xs.map(function (x) { return o.m * x + o.b; }), [o.m, 1], o.dx); } },
          { id: 'e5b', level: 'PRG', outcome: 'RF7', make: function (r, sh) { var o = sh.b, xs = [0, 1, 2, 3, 4].map(function (i) { return o.x0 + i * o.dx; }); return tablePart(xs, xs.map(function (x) { return fv(fAdd(fMul(o.m, x - o.x0), o.y0)); }), o.m, o.dx); } },
          { id: 'e5c', level: 'BEG', outcome: 'RF4', make: function (r, sh) {
            var o = sh.c, xs = [1, 2, 3, 4].map(function (i) { return i + o.x0; }), ys = xs.map(function (x) { return o.s * x * x + o.c; }), d = [ys[1] - ys[0], ys[2] - ys[1], ys[3] - ys[2]];
            return mc(r, HW.valueTable([[t('x')].concat(xs), [t('y')].concat(ys)]) + 'Is this relation linear?', [
              { html: '<b>Not linear</b>: ' + t('x') + ' steps by ' + t('1') + ', but ' + t('y') + ' changes by ' + t(d.join(',\\ ')) + ' — the rate of change is not constant.', right: true },
              { html: '<b>Linear</b>, with slope ' + t(d[0]) + ', because ' + t('y') + ' changes by ' + t(d[0]) + ' at the start.', why: 'Check <b>every</b> step: the changes in ' + t('y') + ' are ' + t(d.join(',\\ ')) + '. A linear relation has the same change each time.' },
              { html: '<b>Linear</b>, because ' + t('x') + ' goes up by ' + t('1') + ' every time.', why: 'Equal steps in ' + t('x') + ' are only half the test: the steps in ' + t('y') + ' must be equal too.' },
              { html: '<b>Linear</b>, because ' + t('y') + ' always ' + (o.s > 0 ? 'increases' : 'decreases') + '.', why: 'Always going up (or down) isn’t enough — the change must be the <b>same</b> each time.' }],
              t('x') + ' steps by ' + t('1') + ', but ' + t('y') + ' changes by ' + t(d.join(',\\ ')) + '. The rate of change is not constant, so there is no single slope: <b>not linear</b>.',
              ['Find the change in ' + t('y') + ' for each step in ' + t('x') + '. Are they all the same?'], 'nonlinear table');
          } },
          { id: 'e5d', level: 'EMG', outcome: 'RF7', make: function (r, sh) {
            var o = sh.d;
            return LP(HW.valueTable([[t('x')].concat(o.xs), [t('y')].concat(o.xs.map(function () { return o.k; }))]) + 'Determine the equation of this relation.', { y: o.k },
              { wrong: [{ is: { x: o.k }, code: 'line-vh', hint: 'Every ' + t('y') + '-value is ' + t(o.k) + ' while ' + t('x') + ' changes, so the line is horizontal: ' + t('y=' + o.k) + '.' }] },
              t('y') + ' never changes: every rise is ' + t('0') + ', so every ratio ' + t('\\frac{\\text{rise}}{\\text{run}}') + ' is ' + t('0') + ' even though the ' + t('x') + '-steps are uneven. ' + t('m=0') + ', ' + t('b=' + o.k) + ': ' + t('y=' + o.k) + ' (horizontal).',
              ['What is the rise between any two columns?', 'A slope of ' + t('0') + ' makes ' + t('y=mx+b') + ' collapse to ' + t('y=b') + '.'], 'constant table y=' + o.k);
          } },
          { id: 'e5e', level: 'EMG', outcome: 'RF4', make: function (r, sh) {
            var o = sh.b, xs = [0, 1, 2, 3, 4].map(function (i) { return o.x0 + i * o.dx; });
            return mc(r, HW.valueTable([[t('x')].concat(xs), [t('y')].concat(xs.map(function (x) { return fv(fAdd(fMul(o.m, x - o.x0), o.y0)); }))]) + 'In table (b), shown again here, the ' + t('x') + '-values go up in steps of ' + t(o.dx) + ', not ' + t('1') + '. Why are the first differences of the ' + t('y') + '-column (' + t(o.m[0]) + ' each time) <b>not</b> the slope?', [
              { html: 'Slope is rise ÷ run: each difference ' + t(o.m[0]) + ' is the rise for a run of ' + t(o.dx) + ', so divide by the ' + t('x') + '-step: ' + t('m=' + nT(o.m)) + '.', right: true },
              { html: 'The first differences are the slope only when they are negative.', why: 'The sign has nothing to do with it — what matters is the size of the step in ' + t('x') + '.' },
              { html: 'You must multiply each difference by the ' + t('x') + '-step: ' + t('m=' + (o.m[0] * o.dx)) + '.', why: 'Slope is rise <b>divided</b> by run, so divide by the ' + t('x') + '-step.' },
              { html: 'The first differences are the slope; the table just isn’t linear.', why: 'The differences are constant, so the table <i>is</i> linear — but each one covers a run of ' + t(o.dx) + '.' }],
              'Slope is rise <b>divided by</b> run. The first differences ' + t(o.m[0]) + ' are the rise for a run of ' + t(o.dx) + ', not ' + t('1') + ', so the slope is ' + t(nT(o.m)) + ', not ' + t(o.m[0]) + '. Divide each first difference by the step in ' + t('x') + '.',
              ['What is the run between neighbouring columns?'], 'first differences vs slope');
          } }] },

      /* ---------- Part C: parallel and perpendicular conditions ---------- */
      { num: '6', section: 'Extra practice C — Parallel and perpendicular conditions', stem: 'None of the given lines is in the form ' + t('y=mx+b') + '. Rearrange first, take the slope you need, then use the given point. Determine the equation of each line in the form ' + t('y=mx+b') + '.',
        shared: function (r) {
          var A1 = r.int(1, 5), B1 = until(function () { return r.int(2, 6); }, function (b) { return gcd(A1, b) === 1 && b !== A1; }), C1 = A1 * B1 * r.pick([1, 2, -1]);
          var A2 = r.int(2, 5), B2 = until(function () { return r.int(2, 6); }, function (b) { return gcd(A2, b) === 1 && b !== A2; }), C2 = A2 * B2 * r.pick([1, -1]);
          var k = r.pick([-2, -3, 2, -2]), px = r.int(-1, 2), py = r.int(1, 6), run = r.int(2, 4);
          return { g1: { A: A1, B: B1, C: C1, P: [nz(r, -6, 6), nz(r, -6, 6)] }, g2: { A: A2, B: B2, C: C2, P: [nz(r, -7, 7), nz(r, -7, 7)] }, g3: { Q: [px, py, px + run, py + k * run], k: k, P: [r.int(3, 9), nz(r, -6, 6)] } };
        },
        parts: [
          { id: 'e6a', level: 'PRG', outcome: 'RF7', make: function (r, sh) { return condPart(sh.g1, 1, false); } },
          { id: 'e6b', level: 'PRG', outcome: 'RF7', make: function (r, sh) { return condPart(sh.g1, 1, true); } },
          { id: 'e6c', level: 'PRG', outcome: 'RF7', make: function (r, sh) { return condPart(sh.g2, 2, false); } },
          { id: 'e6d', level: 'PRG', outcome: 'RF7', make: function (r, sh) { return condPart(sh.g2, 2, true); } },
          { id: 'e6e', level: 'PRG', outcome: 'RF7', make: function (r, sh) { return condPart(sh.g3, 3, false); } },
          { id: 'e6f', level: 'PRG', outcome: 'RF7', make: function (r, sh) { return condPart(sh.g3, 3, true); } }] },
      { num: '7', stem: function (sh) { return 'Consider the line with equation ' + t('kx+' + sh.C + 'y-' + sh.D + '=0') + ', where ' + t('k') + ' is a constant.'; },
        shared: function (r) {
          return until(function () {
            var C = r.int(2, 5), b0 = r.int(1, 4), D = C * b0, M = r.pick([2, 3, 4, 5, -2, -3]), kk = nz(r, -5, 5), x0 = r.int(2, 6);
            return { C: C, b0: b0, D: D, M: M, kk: kk, x0: x0, y0: (D - kk * x0) / C, c1: nz(r, -5, 5) };
          }, function (o) { return Number.isInteger(o.y0) && o.y0 !== 0 && o.kk !== -o.C * o.M && Math.abs(o.y0) <= 9 && gcd(o.C, o.M) === 1; });
        },
        parts: [
          { id: 'e7a', level: 'ADV', outcome: 'RF6', make: function (r, sh) {
            var C = sh.C, b0 = sh.b0;
            var mChk = function (resp) {
              var s = String(resp == null ? '' : resp).replace(/^\s*m\s*=\s*/, '').replace(/\\left|\\right/g, '');
              if (!s.trim()) return form('empty', 'Fill in ' + t('m') + '.');
              var a = ex.parse(s); if (!a.ok) return form('unreadable', 'Write ' + t('m') + ' using ' + t('k') + ', e.g. ' + t('-\\frac{k}{2}') + '.');
              var vs = Object.keys(astVars(a.ast, {})); if (vs.some(function (v) { return v !== 'k'; })) return form('u72-k-var', 'Use only the letter ' + t('k') + '.');
              var f = function (k) { return ex.value(a.ast, { k: k }); }, same = function (g) { return [1.7, -2.3, 3.1].every(function (k) { return Math.abs(f(k) - g(k)) < 1e-9 * (1 + Math.abs(g(k))); }); };
              if (same(function (k) { return -k / C; })) return ok();
              if (same(function (k) { return k / C; })) return wrong('u72-k-sign', 'Check the sign: moving ' + t('kx') + ' to the other side gives ' + t(C + 'y=-kx+' + sh.D) + '.');
              if (same(function (k) { return -k; })) return wrong('u72-k-nodiv', 'You still have to divide by ' + t(C) + ', the coefficient of ' + t('y') + ': ' + t('y=-\\frac{k}{' + C + '}x+' + b0) + '.');
              if (same(function (k) { return -C / k; }) || same(function (k) { return C / k; })) return wrong('slope-flip', 'Divide ' + t('-k') + ' by ' + t(C) + ' (not ' + t(C) + ' by ' + t('k') + ').');
              return wrong('value', null);
            };
            var p = B.fields('Rearrange the equation into the form ' + t('y=mx+b') + ', carrying ' + t('k') + ' along as a letter. State ' + t('m') + ' and ' + t('b') + '.',
              [{ name: t('m'), label: '', before: t('m='), mode: 'math', keys: 'poly', vars: ['k'] }, { name: t('b'), label: '', before: t('b='), mode: 'math', keys: 'poly', vars: ['k'] }],
              [mChk, valChk([b0, 1], [[-b0, 'sign', 'Check the sign: ' + t(C + 'y=-kx+' + sh.D) + ', so ' + t('b=\\frac{' + sh.D + '}{' + C + '}') + '.'], [sh.D, 'u72-k-nodiv', 'Divide by ' + t(C) + ', the coefficient of ' + t('y') + '.']])],
              ['-\\frac{k}{' + C + '}', String(b0)], t('m=-\\frac{k}{' + C + '}') + ', ' + t('b=' + b0),
              t(C + 'y=-kx+' + sh.D) + ', so ' + t('y=-\\frac{k}{' + C + '}x+' + b0) + '. ' + t('m=-\\frac{k}{' + C + '}') + ' and ' + t('b=' + b0) + ' (' + t('b') + ' doesn’t depend on ' + t('k') + ').',
              ['Get the ' + t('y') + '-term by itself: move ' + t('kx') + ' and ' + t('-' + sh.D) + ' to the other side, then divide every term by ' + t(C) + '.'], 'm and b of kx+' + C + 'y-' + sh.D + '=0');
            p.good = [['-\\frac{1}{' + C + '}k', String(b0)], ['\\frac{-k}{' + C + '}', 'b=' + b0]]; p.bad = [['\\frac{k}{' + C + '}', String(b0)], ['-k', String(b0)], ['-\\frac{k}{' + C + '}', String(-b0)]];
            return p;
          } },
          { id: 'e7b', level: 'PRG', outcome: 'RF7', make: function (r, sh) {
            var C = sh.C, M = sh.M, gT = SI(M, sh.c1), k = -C * M;
            return valPart('Determine the value of ' + t('k') + ' for which this line is <b>parallel</b> to ' + t(gT) + '.', [k, 1],
              [[C * M, 'u72-k-sign', 'Solve ' + t('-\\frac{k}{' + C + '}=' + M) + ' carefully: multiply both sides by ' + t('-' + C) + '.'], [fr(C, M), 'u72-k-perp', 'That makes the line <b>perpendicular</b>. Parallel lines have <b>equal</b> slopes: ' + t('-\\frac{k}{' + C + '}=' + M) + '.'], [-M, 'u72-k-nodiv', 'The slope is ' + t('-\\frac{k}{' + C + '}') + ', not ' + t('-k') + ': multiply by ' + t(C) + ' too.']],
              'Parallel ' + t('\\Rightarrow') + ' equal slopes: ' + t('-\\frac{k}{' + C + '}=' + M) + ', so ' + t('k=' + k) + '.', ['Set the slope ' + t('-\\frac{k}{' + C + '}') + ' equal to the slope of ' + t(gT) + ' and solve.'], 'k for parallel', { before: t('k=') });
          } },
          { id: 'e7c', level: 'ADV', outcome: 'RF7', make: function (r, sh) {
            var C = sh.C, M = sh.M, gT = SI(M, sh.c1), k = fr(C, M), ps = nrec([M, 1]);
            return valPart('Determine the value of ' + t('k') + ' for which this line is <b>perpendicular</b> to ' + t(gT) + '.', k,
              [[fNeg(k), 'u72-k-sign', 'Solve ' + t('-\\frac{k}{' + C + '}=' + nT(ps)) + ' carefully — check the sign.'], [-C * M, 'u72-k-perp', 'That makes the line <b>parallel</b>. For perpendicular, the slope must be the negative reciprocal of ' + t(M) + ', ' + t(nT(ps)) + '.'], [fr(M, C), 'slope-flip', 'Multiply both sides of ' + t('-\\frac{k}{' + C + '}=' + nT(ps)) + ' by ' + t('-' + C) + '.']],
              'Perpendicular ' + t('\\Rightarrow') + ' slope ' + t(nT(ps)) + ': ' + t('-\\frac{k}{' + C + '}=' + nT(ps)) + ', so ' + t('k=' + nT(k)) + '.', ['The slope must be the negative reciprocal of ' + t(M) + '. Set ' + t('-\\frac{k}{' + C + '}') + ' equal to it and solve.'], 'k for perpendicular', { before: t('k=') });
          } },
          { id: 'e7d', level: 'PRG', outcome: 'RF7', make: function (r, sh) {
            var C = sh.C, x0 = sh.x0, y0 = sh.y0, k = sh.kk;
            return valPart('Determine the value of ' + t('k') + ' for which this line passes through ' + t(ptT(x0, y0)) + '.', [k, 1],
              [[-k, 'u72-k-sign', 'Check the sign when you move the constant terms to the other side.'], [fr(sh.D - C * x0, y0), 'u72-pt-swap', 'Substitute ' + t('x=' + x0) + ' and ' + t('y=' + y0) + ' — you swapped them.']],
              'Substitute the point: ' + t('k\\left(' + x0 + '\\right)+' + C + '\\left(' + y0 + '\\right)-' + sh.D + '=0') + ', so ' + t(x0 + 'k' + (C * y0 - sh.D < 0 ? '' : '+') + (C * y0 - sh.D) + '=0') + ' and ' + t('k=' + k) + '.<br><b>Check.</b> ' + t(k * x0 + (C * y0 < 0 ? '' : '+') + (C * y0) + '-' + sh.D + '=0') + ' ✓',
              ['A point is on a line when its coordinates make the equation true. Substitute, then solve for ' + t('k') + '.'], 'k through a point', { before: t('k=') });
          } },
          { id: 'e7e', level: 'EMG', outcome: 'RF6', make: function (r, sh) {
            var C = sh.C, b0 = sh.b0;
            var p = B.fields('For which value of ' + t('k') + ' is the line horizontal? State its equation for that ' + t('k') + '.', [{ name: t('k'), label: '', before: t('k='), mode: 'math', keys: 'eq' }, { name: 'equation', label: 'equation', mode: 'math', keys: 'eq', wide: true }],
              [valChk([0, 1], [[C, 'u72-k-nodiv', 'Horizontal means slope ' + t('0') + ': ' + t('-\\frac{k}{' + C + '}=0') + '.']]), K.line({ y: b0 }, { wrong: [{ is: { y: sh.D }, code: 'u72-k-nodiv', hint: 'With ' + t('k=0') + ': ' + t(C + 'y-' + sh.D + '=0') + ', so ' + t('y=\\frac{' + sh.D + '}{' + C + '}') + '.' }] })],
              ['0', 'y=' + b0], t('k=0') + ', ' + t('y=' + b0),
              'Horizontal ' + t('\\Rightarrow m=0') + ': ' + t('-\\frac{k}{' + C + '}=0') + ', so ' + t('k=0') + '. Then ' + t(C + 'y-' + sh.D + '=0') + ', so ' + t('y=' + b0) + '.', ['A horizontal line has slope ' + t('0') + '.'], 'k for horizontal');
            p.bad = [[String(C), 'y=' + b0], ['0', 'y=' + sh.D], ['0', 'x=' + b0]];
            return p;
          } },
          { id: 'e7f', level: 'PRG', outcome: 'RF6', make: function (r, sh) {
            var C = sh.C;
            return mc(r, 'Why does <b>no</b> value of ' + t('k') + ' make this line vertical?', [
              { html: 'The ' + t(C + 'y') + '-term is there for every ' + t('k') + ', so you can always divide by ' + t(C) + ' and get the defined slope ' + t('-\\frac{k}{' + C + '}') + '. A vertical line has no ' + t('y') + '-term.', right: true },
              { html: 'It is vertical when ' + t('k=0') + ', because then the slope is ' + t('0') + '.', why: 'Slope ' + t('0') + ' is <b>horizontal</b>. With ' + t('k=0') + ' the ' + t('x') + '-term disappears, giving ' + t('y=') + ' a constant.' },
              { html: 'A large enough ' + t('k') + ' makes it vertical.', why: 'A large ' + t('k') + ' makes it steep, but ' + t('-\\frac{k}{' + C + '}') + ' is still a number — the slope is never undefined.' },
              { html: 'Vertical lines have slope ' + t('0') + ', and ' + t('-\\frac{k}{' + C + '}') + ' is never ' + t('0') + '.', why: 'Vertical lines have an <b>undefined</b> slope, and ' + t('-\\frac{k}{' + C + '}=0') + ' when ' + t('k=0') + '.' }],
              'A vertical line has no ' + t('y') + '-term (' + t('x=') + ' a constant). The ' + t(C + 'y') + '-term is there for every ' + t('k') + ', so we can always divide by ' + t(C) + ' and get the defined slope ' + t('-\\frac{k}{' + C + '}') + '. No value of ' + t('k') + ' makes the slope undefined.',
              ['What does the equation of a vertical line look like? Which term is missing?'], 'why never vertical');
          } }] },
      { num: '8', stem: function (sh) {
          return 'Each pair below describes two lines. Three of the pairs describe the <b>same</b> line twice. Build the ' + t('y=mx+b') + ' equation of each line and decide.<br>' + sh.pairs.map(function (p, i) { return '(' + 'abcd'.charAt(i) + ') ' + t(p.n1) + ': ' + p.d1 + '<br>' + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + t(p.n2) + ': ' + p.d2; }).join('<br>');
        },
        shared: function (r) {
          var odd = r.int(0, 3), out = [];
          for (var i = 0; i < 4; i++) out.push(samePair(r, i, i === odd));
          return { pairs: out, odd: odd };
        },
        parts: [
          { id: 'e8', sub: 'a–d', level: 'EMG', make: function (r, sh) {
            var rows = sh.pairs.map(function (p, i) { return { id: 'abcd'.charAt(i), html: '(' + 'abcd'.charAt(i) + ') ' + t(p.n1) + ' and ' + t(p.n2) }; });
            var want = {}; sh.pairs.forEach(function (p, i) { want['abcd'.charAt(i)] = p.same ? 'same' : 'diff'; });
            return B.grid('Decide for each pair.', rows, [{ id: 'same', html: 'same line' }, { id: 'diff', html: 'not the same' }], want, { why: function (row) { var p = sh.pairs['abcd'.indexOf(row)]; return { code: 'u72-same', hint: 'Pair (' + row + '): build both equations — ' + t(p.n1) + ' is ' + t(p.e1) + '. Compare it with ' + t(p.n2) + '.' }; } },
              sh.pairs.map(function (p, i) { return '(' + 'abcd'.charAt(i) + ') ' + t(p.n1) + ': ' + t(p.e1) + '; ' + t(p.n2) + ': ' + t(p.e2) + ' — <b>' + (p.same ? 'same line' : 'not the same') + '</b>.'; }).join('<br>'),
              ['Write both lines as ' + t('y=mx+b') + '. Same slope <b>and</b> same ' + t('b') + ' means the same line.'], 'same line? 4 pairs');
          } },
          { id: 'e8e', sub: 'e', level: 'EMG', make: function (r, sh) {
            var o = 'abcd'.charAt(sh.odd), w = 'abcd'.charAt((sh.odd + 1 + r.int(0, 2)) % 4), p = sh.pairs[sh.odd];
            return mc(r, 'Name the odd pair out and state exactly how those two lines are related.', [
              { html: 'Pair (' + o + '): equal slopes but different ' + t('y') + '-intercepts — two distinct <b>parallel</b> lines.', right: true },
              { html: 'Pair (' + o + '): their slopes are negative reciprocals — the lines are <b>perpendicular</b>.', why: 'Compare the two slopes in pair (' + o + '): they are equal, not negative reciprocals.' },
              { html: 'Pair (' + o + '): different slopes — they cross at one point.', why: 'Write both lines of pair (' + o + ') as ' + t('y=mx+b') + ': the slopes are the same.' },
              { html: 'Pair (' + w + '): equal slopes but different ' + t('y') + '-intercepts — parallel lines.', why: 'Pair (' + w + ') gives the same equation twice. Check the other pairs again.' }],
              'Pair (' + o + '): ' + t(p.e1) + ' and ' + t(p.e2) + ' have equal slopes but different ' + t('y') + '-intercepts, so they are two distinct <b>parallel</b> lines that never meet.',
              ['Which pair gave two different equations? Compare their slopes and intercepts.'], 'odd pair: parallel');
          } }] },

      /* ---------- Part D: horizontal and vertical lines ---------- */
      { num: '9', section: 'Extra practice D — Horizontal and vertical lines', stem: 'State the equation of each line.',
        shared: function (r) {
          var P = until(function () { return [nz(r, -8, 8), nz(r, -9, 9)]; }, function (p) { return Math.abs(p[0]) !== Math.abs(p[1]); });
          var cx = nz(r, -7, 7), cy = until(function () { return [nz(r, -6, 6), nz(r, -6, 12)]; }, function (u) { return u[0] !== u[1]; });
          var dy = nz(r, -8, 8), dx = until(function () { return [nz(r, -8, 8), nz(r, -8, 8)]; }, function (u) { return u[0] < u[1]; });
          return { P: P, cx: cx, cy: cy, dy: dy, dx: dx, e: nz(r, -9, 9), f: until(function () { return nz(r, -9, 9); }, function (v) { return Math.abs(v) >= 2; }) };
        },
        parts: [
          { id: 'e9a', level: 'BEG', make: function (r, sh) { return hvPart(sh.P, 'h', 'through ' + t(ptT(sh.P[0], sh.P[1])) + ', parallel to the ' + t('x') + '-axis'); } },
          { id: 'e9b', level: 'BEG', make: function (r, sh) { return hvPart(sh.P, 'v', 'through ' + t(ptT(sh.P[0], sh.P[1])) + ', perpendicular to the ' + t('x') + '-axis', 'Perpendicular to the ' + t('x') + '-axis means <b>vertical</b>'); } },
          { id: 'e9c', level: 'BEG', make: function (r, sh) { return hvPart([sh.cx, sh.cy[0]], 'v', 'through ' + t(ptT(sh.cx, sh.cy[0])) + ' and ' + t(ptT(sh.cx, sh.cy[1])), 'Both points have ' + t('x=' + sh.cx) + ': the line is <b>vertical</b>'); } },
          { id: 'e9d', level: 'BEG', make: function (r, sh) { return hvPart([sh.dx[0], sh.dy], 'h', 'through ' + t(ptT(sh.dx[0], sh.dy)) + ' and ' + t(ptT(sh.dx[1], sh.dy)), 'Both points have ' + t('y=' + sh.dy) + ': the line is <b>horizontal</b>'); } },
          { id: 'e9e', level: 'BEG', make: function (r, sh) {
            return LP('through ' + t(ptT(0, sh.e)) + ' with slope ' + t('0'), { y: sh.e }, { wrong: [{ is: { x: sh.e }, code: 'line-vh', hint: 'Slope ' + t('0') + ' means <b>horizontal</b> (no rise), not vertical.' }, { is: { x: 0 }, code: 'line-vh', hint: t('x=0') + ' is the ' + t('y') + '-axis (vertical). Slope ' + t('0') + ' means horizontal.' }] },
              t('m=0') + ', ' + t('b=' + sh.e) + ': ' + t('y=0x+' + pT(sh.e)) + ', i.e. ' + t('y=' + sh.e) + '.', ['Substitute ' + t('m=0') + ' into ' + t('y=mx+b') + '.'], 'slope 0 through (0,' + sh.e + ')');
          } },
          { id: 'e9f', level: 'EMG', make: function (r, sh) {
            return LP('with ' + t('x') + '-intercept ' + t(sh.f) + ' and no ' + t('y') + '-intercept', { x: sh.f }, { wrong: [{ is: { y: sh.f }, code: 'line-vh', hint: 'A horizontal line ' + t('y=k') + ' always crosses the ' + t('y') + '-axis. A line with no ' + t('y') + '-intercept never meets the ' + t('y') + '-axis, so it is vertical.' }] },
              'No ' + t('y') + '-intercept means the line never meets the ' + t('y') + '-axis, so it is <b>vertical</b>; it passes through ' + t(ptT(sh.f, 0)) + ': ' + t('x=' + sh.f) + '.', ['Which kind of line never meets the ' + t('y') + '-axis?'], 'x-int ' + sh.f + ', no y-int');
          } },
          { id: 'e9g', sub: 'which', level: 'BEG', make: function (r, sh) {
            var rows = [{ id: 'a', html: '(a) through ' + t(ptT(sh.P[0], sh.P[1])) + ', parallel to the ' + t('x') + '-axis' }, { id: 'b', html: '(b) through ' + t(ptT(sh.P[0], sh.P[1])) + ', perpendicular to the ' + t('x') + '-axis' }, { id: 'c', html: '(c) through ' + t(ptT(sh.cx, sh.cy[0])) + ' and ' + t(ptT(sh.cx, sh.cy[1])) }, { id: 'd', html: '(d) through ' + t(ptT(sh.dx[0], sh.dy)) + ' and ' + t(ptT(sh.dx[1], sh.dy)) }, { id: 'e', html: '(e) through ' + t(ptT(0, sh.e)) + ' with slope ' + t('0') }, { id: 'f', html: '(f) ' + t('x') + '-intercept ' + t(sh.f) + ', no ' + t('y') + '-intercept' }];
            var want = { a: 'can', b: 'cannot', c: 'cannot', d: 'can', e: 'can', f: 'cannot' };
            return B.grid('Three of the lines (a)–(f) <b>cannot</b> be written in the form ' + t('y=mx+b') + '. Decide for each line.', rows, [{ id: 'can', html: 'can' }, { id: 'cannot', html: 'cannot' }], want,
              { why: function (row) { return { code: 'u72-vertical-form', hint: want[row] === 'can' ? 'A horizontal line ' + t('y=k') + ' <i>is</i> in the form ' + t('y=mx+b') + ', with ' + t('m=0') + ' and ' + t('b=k') + '.' : 'A vertical line ' + t('x=k') + ' has an undefined slope — there is no value of ' + t('m') + ' to substitute.' }; } },
              'Horizontal lines ' + t('y=k') + ' are ' + t('y=0x+k') + '. The <b>vertical</b> lines — (b), (c) and (f) — have undefined slopes, so they cannot be written as ' + t('y=mx+b') + '.', ['Can a vertical line have a slope ' + t('m') + '?'], 'which lines fit y=mx+b');
          } }] },
      { num: '10', stem: function (sh) { return 'Consider the line through ' + t('P' + ptT(sh.h, sh.y1)) + ' and ' + t('Q' + ptT(sh.h, sh.y2)) + '.'; },
        shared: function (r) { return until(function () { return { h: nz(r, -8, 8), y1: nz(r, -8, 8), y2: nz(r, -9, 9), k: nz(r, -9, 9) }; }, function (o) { return o.y1 !== o.y2 && Math.abs(o.h) >= 2 && Math.abs(o.h) !== Math.abs(o.y1) && Math.abs(o.h) !== Math.abs(o.y2) && o.k !== o.h; }); },
        parts: [
          { id: 'e10a', level: 'BEG', outcome: 'RF5', make: function (r, sh) {
            return slopePart('Substitute into ' + t('m=\\frac{y_2-y_1}{x_2-x_1}') + '. What is the slope? (Use the correct word if it isn’t a number.)', null,
              [[fr(sh.y2 - sh.y1, 1), 'u72-und', 'Check the run: ' + t(sh.h + '-' + pT(sh.h) + '=0') + '. You can’t divide by ' + t('0') + '.']],
              t('m=\\frac{' + sh.y2 + '-' + pT(sh.y1) + '}{' + sh.h + '-' + pT(sh.h) + '}=\\frac{' + (sh.y2 - sh.y1) + '}{0}') + '. The run is ' + t('0') + ', and division by ' + t('0') + ' is undefined, so the slope is <b>undefined</b>.',
              ['Work out the run, ' + t('x_2-x_1') + '. What happens when you divide by it?'], 'slope of a vertical line');
          } },
          { id: 'e10b', level: 'BEG', outcome: 'RF7', make: function (r, sh) {
            return LP('State the equation of the line.', { x: sh.h }, { wrong: [{ is: { y: sh.h }, code: 'line-vh', hint: 'Both points have the same <b>' + t('x') + '</b>-coordinate, ' + t(sh.h) + ', so the line is vertical: ' + t('x=' + sh.h) + '.' }] },
              'Every point has ' + t('x=' + sh.h) + ': the equation is ' + t('x=' + sh.h) + '.', ['What do ' + t('P') + ' and ' + t('Q') + ' have in common?'], 'vertical through P, Q');
          } },
          { id: 'e10c', level: 'EMG', outcome: 'RF7', make: function (r, sh) {
            return mc(r, 'A student says “the slope is ' + t('0') + ', so the equation is ' + t('y=' + sh.h) + '.” Which describes the errors in that sentence?', [
              { html: 'Two errors: the slope is <b>undefined</b>, not ' + t('0') + ' (slope ' + t('0') + ' is horizontal); and ' + t(sh.h) + ' is the common <b>' + t('x') + '</b>-coordinate, so the equation is ' + t('x=' + sh.h) + '.', right: true },
              { html: 'Only the slope is wrong: it should be undefined, but ' + t('y=' + sh.h) + ' is correct.', why: t('y=' + sh.h) + ' is a horizontal line. The points share their ' + t('x') + '-coordinate, so the line is ' + t('x=' + sh.h) + '.' },
              { html: 'Only the equation is wrong: the slope ' + t('0') + ' is right, but the line is ' + t('x=' + sh.h) + '.', why: 'The run is ' + t('0') + ', so the slope can’t be computed: it is undefined, not ' + t('0') + '.' },
              { html: 'There is no error: a vertical line has slope ' + t('0') + ' and the equation ' + t('y=' + sh.h) + '.', why: 'Slope ' + t('0') + ' and ' + t('y=k') + ' both describe horizontal lines.' }],
              'Error 1: the slope is <b>undefined</b>, not ' + t('0') + ' (' + t('m=0') + ' means horizontal). Error 2: ' + t(sh.h) + ' is the common <b>' + t('x') + '</b>-coordinate, so the equation is ' + t('x=' + sh.h) + ', not ' + t('y=' + sh.h) + '.',
              ['Is the line through ' + t('P') + ' and ' + t('Q') + ' horizontal or vertical?'], 'two errors in a sentence');
          } },
          { id: 'e10d', level: 'PRG', outcome: 'RF4', make: function (r, sh) {
            return mc(r, 'Why can <b>no</b> choice of ' + t('m') + ' and ' + t('b') + ' make ' + t('y=mx+b') + ' produce this line?', [
              { html: 'On this line the single input ' + t('x=' + sh.h) + ' has infinitely many ' + t('y') + '-values, but ' + t('y=mx+b') + ' returns exactly <b>one</b> ' + t('y') + ' for each ' + t('x') + '.', right: true },
              { html: 'Because ' + t('b') + ' would have to be ' + t(sh.h) + ', and the ' + t('y') + '-intercept can’t equal the ' + t('x') + '-intercept.', why: t('b') + ' can be any number — and this line has no ' + t('y') + '-intercept at all. The problem is how many outputs one input has.' },
              { html: 'Because the slope is ' + t('0') + ', and ' + t('m') + ' can’t be ' + t('0') + '.', why: t('m=0') + ' is allowed (horizontal lines), and this line’s slope is undefined, not ' + t('0') + '.' },
              { html: 'Because the line has no ' + t('x') + '-intercept.', why: 'This line does have an ' + t('x') + '-intercept, ' + t(sh.h) + '. Think about how many ' + t('y') + '-values go with ' + t('x=' + sh.h) + '.' }],
              'On this line the single input ' + t('x=' + sh.h) + ' has infinitely many ' + t('y') + '-values. But ' + t('y=mx+b') + ' returns exactly one ' + t('y') + ' for each ' + t('x') + ', so it can never produce more than one point with ' + t('x=' + sh.h) + ' (and it would give points with ' + t('x\\ne ' + sh.h) + ', which this line doesn’t have).',
              ['How many ' + t('y') + '-values does ' + t('y=mx+b') + ' give for one value of ' + t('x') + '?'], 'why x=h is not y=mx+b');
          } },
          { id: 'e10e', level: 'EMG', outcome: 'RF5', make: function (r, sh) {
            var h = sh.h, k = sh.k, R = '\\mathbb{R}';
            var f = function (nm, v) { return { name: nm, label: nm, mode: 'math', keys: 'set', vars: ['x', 'y'], wide: true }; };
            var p = B.fields('State the domain and the range of this relation, and of the horizontal line ' + t('y=' + k) + '.', [f(t('x=' + h) + ' domain'), f(t('x=' + h) + ' range'), f(t('y=' + k) + ' domain'), f(t('y=' + k) + ' range')],
              [K.set('\\{' + h + '\\}', { v: 'x', other: '\\{y\\mid y\\in\\mathbb{R}\\}', otherName: 'range' }), K.set('\\{y\\mid y\\in\\mathbb{R}\\}', { v: 'y', other: '\\{' + h + '\\}', otherName: 'domain' }), K.set('\\{x\\mid x\\in\\mathbb{R}\\}', { v: 'x', other: '\\{' + k + '\\}', otherName: 'range' }), K.set('\\{' + k + '\\}', { v: 'y', other: '\\{x\\mid x\\in\\mathbb{R}\\}', otherName: 'domain' })],
              ['\\{' + h + '\\}', '\\{y\\mid y\\in\\mathbb{R}\\}', '\\{x\\mid x\\in\\mathbb{R}\\}', '\\{' + k + '\\}'],
              t('x=' + h) + ': domain ' + t('\\{x\\mid x=' + h + '\\}') + ', range ' + t('\\{y\\mid y\\in\\mathbb{R}\\}') + '<br>' + t('y=' + k) + ': domain ' + t('\\{x\\mid x\\in\\mathbb{R}\\}') + ', range ' + t('\\{y\\mid y=' + k + '\\}'),
              'The vertical line ' + t('x=' + h) + ' uses only the input ' + t(h) + ' but every output: domain ' + t('\\{' + h + '\\}') + ', range ' + t('\\{y\\mid y\\in\\mathbb{R}\\}') + '. The horizontal line ' + t('y=' + k) + ' is the other way round: domain ' + t('\\{x\\mid x\\in\\mathbb{R}\\}') + ', range ' + t('\\{' + k + '\\}') + '.',
              ['A vertical line uses one ' + t('x') + '-value; a horizontal line uses one ' + t('y') + '-value.'], 'domain/range of x=h and y=k');
            p.bad = [['\\{y\\mid y\\in\\mathbb{R}\\}', '\\{' + h + '\\}', '\\{x\\mid x\\in\\mathbb{R}\\}', '\\{' + k + '\\}'], ['\\{' + h + '\\}', '\\{y\\mid y\\in\\mathbb{R}\\}', '\\{' + k + '\\}', '\\{x\\mid x\\in\\mathbb{R}\\}']];
            return p;
          } }] },

      /* ---------- Part E: from the two intercepts ---------- */
      { num: '11', section: 'Extra practice E — Building from the two intercepts', stem: 'Determine the equation of each line in the form ' + t('y=mx+b') + '.', parts: [
        { id: 'e11a', level: 'EMG', make: function (r) { var o = until(function () { return [r.int(2, 9), -r.int(2, 9)]; }, function (o) { return Math.abs(o[0]) !== Math.abs(o[1]); }); return twoIntPart(o[0], o[1], true); } },
        { id: 'e11b', level: 'EMG', make: function (r) { var o = until(function () { return [-r.int(2, 9), r.int(2, 9)]; }, function (o) { return Math.abs(o[0]) !== Math.abs(o[1]); }); return twoIntPart(o[0], o[1], true); } },
        { id: 'e11c', level: 'EMG', make: function (r) { var o = until(function () { return [-r.int(2, 9), -r.int(2, 9)]; }, function (o) { return Math.abs(o[0]) !== Math.abs(o[1]); }); return twoIntPart(o[0], o[1], false); } },
        { id: 'e11d', level: 'EMG', make: function (r) { var o = until(function () { return [r.int(2, 9), r.int(2, 9)]; }, function (o) { return Math.abs(o[0]) !== Math.abs(o[1]); }); return twoIntPart(o[0], o[1], false); } },
        { id: 'e11e', level: 'EMG', make: function (r) {
          return mc(r, 'When you build ' + t('y=mx+b') + ' from a line’s ' + t('x') + '-intercept and ' + t('y') + '-intercept, one of the two given facts goes straight into the equation with no work, while the other has to be handled as an ordinary point. Which is which, and why?', [
            { html: 'The ' + t('y') + '-intercept is ' + t('b') + ' itself, so it goes straight into ' + t('y=mx+b') + '. The ' + t('x') + '-intercept ' + t('a') + ' has to be written as the point ' + t('(a,\\ 0)') + ' and used (with ' + t('(0,\\ b)') + ') to find the slope.', right: true },
            { html: 'The ' + t('x') + '-intercept goes straight in as ' + t('b') + '; the ' + t('y') + '-intercept is used for the slope.', why: t('b') + ' is where the line crosses the <b>' + t('y') + '</b>-axis.' },
            { html: 'Both go straight in: the ' + t('x') + '-intercept is ' + t('m') + ' and the ' + t('y') + '-intercept is ' + t('b') + '.', why: 'The ' + t('x') + '-intercept isn’t the slope. Write it as the point ' + t('(a,\\ 0)') + ' and compute rise over run.' },
            { html: 'Neither can be used directly; you always need a third point.', why: 'Two points determine a line — and one of them, ' + t('(0,\\ b)') + ', gives ' + t('b') + ' immediately.' }],
            'The <b>' + t('y') + '-intercept</b> is ' + t('b') + ' itself, so it goes straight into ' + t('y=mx+b') + '. The <b>' + t('x') + '-intercept</b> ' + t('a') + ' is only a number until it is written as the point ' + t('(a,\\ 0)') + '; then it works as an ordinary point that supplies the second point for the slope.',
            ['Which letter of ' + t('y=mx+b') + ' is an intercept?'], 'which intercept goes straight in');
        } },
        { id: 'e11f', level: 'PRG', make: function (r) {
          var n = nz(r, -9, 9);
          return mc(r, 'A student claims to have a line with ' + t('x') + '-intercept ' + t(n) + ' and ' + t('y') + '-intercept ' + t('0') + '. Which statement is correct?', [
            { html: 'A ' + t('y') + '-intercept of ' + t('0') + ' means the line passes through ' + t('(0,\\ 0)') + ', which is also on the ' + t('x') + '-axis — so (except for the ' + t('x') + '-axis itself) the ' + t('x') + '-intercept must be ' + t('0') + '.', right: true },
            { html: 'Such a line exists: it is ' + t('y=' + n + 'x') + '.', why: 'Substitute ' + t('y=0') + ' into ' + t('y=' + n + 'x') + ': you get ' + t('x=0') + ', so its ' + t('x') + '-intercept is ' + t('0') + ', not ' + t(n) + '.' },
            { html: 'Such a line exists, but its slope must be ' + t('0') + '.', why: 'Slope ' + t('0') + ' through ' + t('(0,\\ 0)') + ' is the ' + t('x') + '-axis itself — every point on it is an ' + t('x') + '-intercept.' },
            { html: 'Any line through ' + t('(0,\\ 0)') + ' can have any ' + t('x') + '-intercept we like.', why: 'A non-horizontal line meets the ' + t('x') + '-axis only once — and it already does at ' + t('(0,\\ 0)') + '.' }],
            'A ' + t('y') + '-intercept of ' + t('0') + ' means the line passes through ' + t('(0,\\ 0)') + '. That point is also on the ' + t('x') + '-axis, so the ' + t('x') + '-intercept is ' + t('0') + '. Any line other than the ' + t('x') + '-axis meets the ' + t('x') + '-axis only once, so it cannot also cross at ' + t(n) + '. (The ' + t('x') + '-axis, ' + t('y=0') + ', is the exception.)',
            ['Where is the point with ' + t('y') + '-intercept ' + t('0') + '? Which axes is it on?'], 'x-int with y-int 0');
        } }] },

      /* ---------- Part F: a model built from a fee and a rate ---------- */
      { num: '12', section: 'Extra practice F — A model built from a fee and a rate', stem: function (sh) { return 'A tool-rental shop charges a flat booking fee of ' + t('\\$' + money(sh.F)) + ', plus ' + t('\\$' + money(sh.R)) + ' for every hour the tool is kept. Let ' + t('C') + ' be the total cost in dollars for a rental of ' + t('h') + ' hours.'; },
        shared: function (r) {
          return until(function () {
            var R = r.pick([5.5, 6.5, 7.5, 6, 8.5]), d = r.pick([1.5, 2, 2.5, 3]), F = r.pick([12, 15, 18, 20, 24]), h1 = r.int(3, 9), h2 = r.int(4, 10);
            return { R: R, R2: R + d, d: d, F: F, h1: h1, h2: h2, charge: R * h2 + F, be: F / d, j: 4 };
          }, function (o) { return Math.abs(o.be * 10 - Math.round(o.be * 10)) < 1e-9 && o.be > 4.5 && o.be <= 12 && o.h1 !== o.h2 && Math.abs(o.be - Math.round(o.be)) > 1e-9; });
        },
        parts: [
          { id: 'e12a', level: 'EMG', outcome: 'RF7', make: function (r, sh) {
            return LP('Write the equation relating ' + t('C') + ' and ' + t('h') + ' in the form ' + t('C=mh+b') + '.', { m: fr(Math.round(sh.R * 2), 2), b: [sh.F, 1] },
              { vars: ['h', 'C'], form: 'slope-intercept', decimalOk: true, keyTex: 'C=' + sh.R + 'h+' + sh.F, wrong: [{ is: 'C=' + sh.F + 'h+' + sh.R, code: 'u72-rate-fee', hint: 'You swapped them: the hourly rate multiplies ' + t('h') + ' (it is ' + t('m') + '); the booking fee is the starting value ' + t('b') + '.' }, { is: 'C=' + sh.R + 'h', code: 'u72-fee', hint: 'Don’t forget the flat booking fee — it’s charged even for ' + t('0') + ' hours, so it’s ' + t('b') + '.' }], good: ['C=' + sh.F + '+' + sh.R + 'h', 'C=' + money(sh.R) + 'h+' + money(sh.F)] },
              'The rate is ' + t('m=' + sh.R) + ' dollars per hour and the fee is ' + t('b=' + sh.F) + ': ' + t('C=' + sh.R + 'h+' + sh.F) + '.', ['Which number changes with the hours (the rate), and which is charged once (the fee)?'], 'rental equation');
          } },
          { id: 'e12b', level: 'EMG', outcome: 'RF5', make: function (r, sh) {
            return mc(r, 'What is the value of ' + t('m') + ', and what does it mean?', [
              { html: t('m=' + money(sh.R)) + ': the total cost rises by ' + t('\\$' + money(sh.R)) + ' for each additional hour the tool is kept (dollars per hour).', right: true },
              { html: t('m=' + money(sh.R)) + ': the tool is kept ' + t(money(sh.R)) + ' hours for each dollar (hours per dollar).', why: 'Check the units: slope = change in ' + t('C') + ' (dollars) ÷ change in ' + t('h') + ' (hours), so it is dollars <b>per hour</b>.' },
              { html: t('m=' + sh.F) + ': the booking fee charged at the start.', why: 'The fee is charged once, at ' + t('h=0') + ': that’s ' + t('b') + ', not the slope.' },
              { html: t('m=' + money(sh.R)) + ': the total cost of a one-hour rental.', why: 'A one-hour rental costs ' + t('\\$' + money(sh.R + sh.F)) + ' (fee included). The slope is the <b>increase</b> per extra hour.' }],
              t('m=' + money(sh.R)) + ': the total cost rises by ' + t('\\$' + money(sh.R)) + ' for each additional hour the tool is kept — units: dollars per hour.', ['The slope is the rate of change of ' + t('C') + ' with respect to ' + t('h') + ': dollars ÷ hours.'], 'meaning of m');
          } },
          { id: 'e12c', level: 'BEG', outcome: 'RF5', make: function (r, sh) {
            return mc(r, 'What is the value of ' + t('b') + ', and what does it mean?', [
              { html: t('b=' + sh.F) + ': the flat booking fee of ' + t('\\$' + money(sh.F)) + ', charged even for ' + t('0') + ' hours of rental.', right: true },
              { html: t('b=' + sh.F) + ': the cost of each hour of rental.', why: 'The cost per hour is the rate ' + t('m') + '. ' + t('b') + ' is the value of ' + t('C') + ' when ' + t('h=0') + '.' },
              { html: t('b=' + money(sh.R)) + ': the starting cost.', why: t(money(sh.R)) + ' is the hourly rate (the slope). The starting cost at ' + t('h=0') + ' is the fee.' },
              { html: t('b=' + sh.F) + ': the number of hours you can rent for free.', why: t('b') + ' is a cost in dollars (the value of ' + t('C') + '), not a number of hours.' }],
              t('b=' + sh.F) + ': the flat booking fee of ' + t('\\$' + money(sh.F)) + ', the cost when ' + t('h=0') + ' — charged even for ' + t('0') + ' hours.', ['What is ' + t('C') + ' when ' + t('h=0') + '?'], 'meaning of b');
          } },
          { id: 'e12d', level: 'BEG', outcome: 'RF4', make: function (r, sh) {
            var c = Math.round((sh.R * sh.h1 + sh.F) * 100) / 100;
            return numPart('What does a ' + t(sh.h1) + '-hour rental cost?', c, [[sh.R * sh.h1, 'u72-fee', 'Add the booking fee of ' + t('\\$' + sh.F) + ' too.'], [(sh.R + sh.F) * sh.h1, 'u72-rate-fee', 'Only the hourly rate is multiplied by the hours; the fee is added once.']],
              t('C=' + sh.R + '\\left(' + sh.h1 + '\\right)+' + sh.F + '=' + (sh.R * sh.h1) + '+' + sh.F + '=' + c) + ', so the rental costs ' + t('\\$' + money(c)) + '.', ['Substitute ' + t('h=' + sh.h1) + ' into your equation.'], 'cost of ' + sh.h1 + ' h', { before: t('\\$') });
          } },
          { id: 'e12e', level: 'EMG', outcome: 'RF4', make: function (r, sh) {
            var ch = Math.round(sh.charge * 100) / 100;
            return numPart('A customer is charged ' + t('\\$' + money(ch)) + '. For how many hours did they keep the tool?', sh.h2, [[Math.round(ch / sh.R * 100) / 100, 'u72-fee', 'Subtract the booking fee first, then divide by the hourly rate.', 0.06], [Math.round((ch + sh.F) / sh.R * 100) / 100, 'u72-fee', 'Subtract the fee (don’t add it) before dividing.', 0.06]],
              t(ch + '=' + sh.R + 'h+' + sh.F) + ', so ' + t(Math.round((ch - sh.F) * 100) / 100 + '=' + sh.R + 'h') + ' and ' + t('h=\\frac{' + Math.round((ch - sh.F) * 100) / 100 + '}{' + sh.R + '}=' + sh.h2) + ' hours.', ['Substitute ' + t('C=' + ch) + ' and solve for ' + t('h') + '.'], 'hours for $' + ch, { after: 'hours' });
          } },
          { id: 'e12f', level: 'BEG', outcome: 'RF4', make: function (r, sh) {
            return mc(r, '(d) What does a ' + t(sh.h1) + '-hour rental cost?<br>(e) A customer is charged ' + t('\\$' + money(Math.round(sh.charge * 100) / 100)) + '. For how many hours did they keep the tool?<br>These two questions run the same equation in opposite directions. Which operations does each one need?', [
              { html: '(d) substitutes ' + t('h') + ' and <b>evaluates</b>: multiply, then add. (e) substitutes ' + t('C') + ' and <b>solves</b>: subtract the fee, then divide by the rate.', right: true },
              { html: '(d) solves: subtract, then divide. (e) evaluates: multiply, then add.', why: 'In (d) ' + t('h') + ' is given and ' + t('C') + ' is alone on one side — you just evaluate.' },
              { html: 'Both evaluate: multiply, then add.', why: 'In (e) the unknown is ' + t('h') + ', which isn’t by itself — you have to undo the operations.' },
              { html: '(d) evaluates: add, then multiply. (e) solves: divide, then subtract.', why: 'Order of operations: in ' + t(sh.R + 'h+' + sh.F) + ' you multiply first, then add; solving undoes them in reverse — subtract first.' }],
              '(d) substitutes ' + t('h') + ' and <b>evaluates</b>: multiply, then add. (e) substitutes ' + t('C') + ' and <b>solves</b>: subtract the fee, then divide by the rate — the inverse operations in reverse order.', ['Which part gave you the input ' + t('h') + ', and which gave you the output ' + t('C') + '?'], 'evaluate vs solve');
          } },
          { id: 'e12g', level: 'PRG', outcome: 'RF7', make: function (r, sh) {
            var R2 = sh.R2, be = Math.round(sh.be * 100) / 100;
            var p = B.fields('A rival shop charges no booking fee but ' + t('\\$' + money(R2)) + ' per hour. Write its equation, then determine the rental length for which the two shops charge exactly the same.',
              [{ name: 'rival equation', label: 'rival', mode: 'math', keys: 'eq', vars: ['h', 'C'], wide: true }, { name: 'equal cost', label: 'equal cost at', mode: 'math', keys: 'eq', vars: ['h', 'C'], after: 'hours' }],
              [K.line({ m: fr(Math.round(R2 * 2), 2), b: [0, 1] }, { vars: ['h', 'C'], wrong: [{ is: 'C=' + R2 + 'h+' + sh.F, code: 'u72-fee', hint: 'The rival charges <b>no</b> booking fee, so ' + t('b=0') + '.' }] }),
                (function () { var c = K.number(be, function (v) { if (near(v, Math.round(sh.F / R2 * 100) / 100)) return { code: 'u72-fee', hint: 'Set the two costs equal: ' + t(R2 + 'h=' + sh.R + 'h+' + sh.F) + ', then collect the ' + t('h') + '-terms.' }; if (near(v, Math.round(sh.F / (R2 + sh.R) * 100) / 100)) return { code: 'sign', hint: 'Subtract ' + t(sh.R + 'h') + ' from both sides (don’t add it).' }; return null; }); return function (resp) { return c(String(resp == null ? '' : resp).replace(/^\s*h\s*=\s*/, '')); }; })()],
              ['C=' + R2 + 'h', String(be)], 'Rival: ' + t('C=' + R2 + 'h') + '<br>Equal cost at ' + t('h=' + be) + ' hours',
              'Rival: ' + t('C=' + R2 + 'h') + '. Equal cost: ' + t(R2 + 'h=' + sh.R + 'h+' + sh.F) + ', so ' + t(sh.d + 'h=' + sh.F) + ' and ' + t('h=\\frac{' + sh.F + '}{' + sh.d + '}=' + be) + ' hours.',
              ['With no fee, the rival’s equation has ' + t('b=0') + '.', 'Equal cost: set the two expressions for ' + t('C') + ' equal and solve for ' + t('h') + '.'], 'rival equation and break-even');
            p.bad = [['C=' + R2 + 'h+' + sh.F, String(be)], ['C=' + R2 + 'h', String(Math.round(sh.F / R2 * 100) / 100)]];
            return p;
          } },
          { id: 'e12h', level: 'EMG', outcome: 'RF5', make: function (r, sh) {
            var a = sh.R2 * sh.j, b = sh.R * sh.j + sh.F, diff = Math.round((b - a) * 100) / 100;
            return mc(r, 'A rival shop charges no booking fee but ' + t('\\$' + money(sh.R2)) + ' per hour. Which shop is cheaper for a ' + t(sh.j) + '-hour job, and by how much?', uniqOpts([
              { html: 'The rival, by ' + t('\\$' + money(diff)), right: true },
              { html: 'The original shop, by ' + t('\\$' + money(diff)), why: 'Compute both: rival ' + t(sh.R2 + '\\times ' + sh.j) + '; original ' + t(sh.R + '\\times ' + sh.j + '+' + sh.F) + '. Which is smaller?' },
              { html: 'The rival, by ' + t('\\$' + money(Math.round(sh.d * sh.j * 100) / 100)), why: 'That’s only the difference in hourly charges. Include the original shop’s booking fee.' },
              { html: 'They cost the same.', why: 'They only cost the same at ' + t(Math.round(sh.be * 100) / 100) + ' hours.' }]),
              'Rival: ' + t(sh.R2 + '\\times ' + sh.j + '=\\$' + money(a)) + '; original: ' + t(sh.R + '\\times ' + sh.j + '+' + sh.F + '=\\$' + money(b)) + '. The <b>rival</b> is cheaper by ' + t('\\$' + money(diff)) + '. It starts ' + t('\\$' + sh.F) + ' lower (' + t('b=0') + ' vs ' + t('b=' + sh.F) + ') but climbs ' + t('\\$' + money(sh.d)) + ' per hour faster, so it wins below ' + t(Math.round(sh.be * 100) / 100) + ' h and loses above it.',
              ['Substitute ' + t('h=' + sh.j) + ' into both equations.'], 'cheaper for ' + sh.j + ' h');
          } }] },

      /* ---------- Part G: error analysis ---------- */
      { num: '13', section: 'Extra practice G — Error analysis', stem: function (sh) { return 'Asked for the equation of the line with slope ' + t(sh.s) + ' that passes through ' + t(ptT(sh.x0, sh.y0)) + ', a student writes:<br>' + t('y=mx+b\\ \\Rightarrow\\ ' + sh.y0 + '=m(' + sh.x0 + ')+(' + sh.s + ')\\ \\Rightarrow\\ ' + sh.x0 + 'm=' + (sh.y0 - sh.s) + '\\ \\Rightarrow\\ m=' + sh.ms) + ', so ' + t(SI(sh.ms, sh.s)) + '.'; },
        shared: function (r) { return until(function () { var s = -r.int(2, 5), x0 = r.int(2, 4), y0 = r.int(1, 9); return { s: s, x0: x0, y0: y0, ms: (y0 - s) / x0 }; }, function (o) { return Number.isInteger(o.ms) && o.ms !== o.s && o.ms !== 0 && o.ms !== -o.s; }); },
        parts: [
          { id: 'e13a', level: 'EMG', make: function (r, sh) {
            return mc(r, 'What exactly did the student substitute where, and which letter should have been the unknown?', [
              { html: 'They put the given slope ' + t(sh.s) + ' in the ' + t('b') + ' slot and solved for ' + t('m') + '. The slope was given, so ' + t('m=' + sh.s) + ' and the unknown should have been ' + t('b') + '.', right: true },
              { html: 'They swapped the coordinates of the point: they should have substituted ' + t(ptT(sh.y0, sh.x0)) + '.', why: 'The point is substituted correctly (' + t('x=' + sh.x0) + ', ' + t('y=' + sh.y0) + '). Look at where the slope went.' },
              { html: 'Their arithmetic is wrong: ' + t(sh.x0 + 'm=' + (sh.y0 - sh.s)) + ' doesn’t give ' + t('m=' + sh.ms) + '.', why: 'The arithmetic is fine. The error is in the very first substitution.' },
              { html: 'Nothing: ' + t(SI(sh.ms, sh.s)) + ' passes through ' + t(ptT(sh.x0, sh.y0)) + ', so it is correct.', why: 'Passing through the point isn’t enough — the line must also have slope ' + t(sh.s) + '.' }],
              'They put the given slope ' + t(sh.s) + ' in the ' + t('b') + ' slot and treated ' + t('m') + ' as the unknown. The slope was given, so ' + t('m=' + sh.s) + '; the unknown should have been ' + t('b') + '.', ['Compare what ' + t('m') + ' and ' + t('b') + ' stand for with what the student put in each slot.'], 'error: slope in b slot');
          } },
          { id: 'e13b', level: 'PRG', make: function (r, sh) { var p = slopePointPart([sh.s, 1], sh.x0, sh.y0, 'Determine the correct equation.', [{ is: L(sh.ms, sh.s), code: 'u72-student', hint: 'That’s the student’s line — its slope is ' + t(sh.ms) + ', but the slope must be ' + t(sh.s) + '.' }]); return p; } },
          { id: 'e13c', level: 'PRG', make: function (r, sh) {
            return mc(r, 'The student’s line ' + t(SI(sh.ms, sh.s)) + ' really does pass through ' + t(ptT(sh.x0, sh.y0)) + '. Why wouldn’t checking the point catch this error, and which check would?', [
              { html: 'They solved to force the line through the point, so the point check is automatically true. Comparing the coefficient of ' + t('x') + ' with the given slope (' + t(sh.ms + '\\ne ' + sh.s) + ') catches it.', right: true },
              { html: 'Checking the point does catch it: ' + t(ptT(sh.x0, sh.y0)) + ' isn’t on the student’s line.', why: 'Substitute: ' + t(sh.ms + '(' + sh.x0 + ')' + '+(' + sh.s + ')=' + sh.y0) + ' ✓. The point <i>is</i> on their line.' },
              { html: 'No check can catch it; you must redo the whole question.', why: 'A quick check does catch it — look at the slope of the student’s line.' },
              { html: 'Check the ' + t('y') + '-intercept: it should equal the ' + t('y') + '-coordinate ' + t(sh.y0) + '.', why: 'The point isn’t on the ' + t('y') + '-axis, so ' + t('b') + ' isn’t ' + t(sh.y0) + '. Compare the slopes instead.' }],
              t(sh.ms + '(' + sh.x0 + ')' + (sh.s < 0 ? '' : '+') + sh.s + '=' + sh.y0) + ' ✓. The student solved to force the line through ' + t(ptT(sh.x0, sh.y0)) + ', so the point check only tests the point, not the slope. The check that catches it: compare the coefficient of ' + t('x') + ' with the given slope (' + t(sh.ms + '\\ne ' + sh.s) + ').',
              ['What did the student’s method guarantee? What did it not guarantee?'], 'why the point check fails');
          } }] },
      { num: '14', stem: function (sh) { return 'Asked for the equation of the line through ' + t(ptT(sh.x0, sh.y0)) + ' that is <b>parallel</b> to ' + t(given(sh.g, sh.c)) + ', a student writes ' + t('m=' + nT(nrec(sh.g))) + ' and then ' + t(SI(nrec(sh.g), sh.bs)) + '.'; },
        shared: function (r) {
          return until(function () { var g = properFrac(r, 2, 5); if (r.chance(0.3)) g = fNeg(g); var x0 = g[1] * nz(r, -2, 2), y0 = nz(r, -9, 9); return { g: g, c: nz(r, -6, 6), x0: x0, y0: y0, bs: bOf(nrec(g), x0, y0), b: bOf(g, x0, y0) }; },
            function (o) { return !fEq(o.bs, o.b) && fv(o.bs) !== 0 && Math.abs(fv(o.b)) <= 14; });
        },
        parts: [
          { id: 'e14a', level: 'EMG', make: function (r, sh) {
            var g = sh.g;
            return mc(r, 'Name the error.', [
              { html: 'They used the negative reciprocal (the perpendicular slope); parallel lines have <b>equal</b> slopes, so ' + t('m') + ' should be ' + t(nT(g)) + '.', right: true },
              { html: 'They used the right slope but made an error solving for ' + t('b') + '.', why: 'Check the slope first: parallel lines have equal slopes. Is ' + t(nT(nrec(g))) + ' equal to ' + t(nT(g)) + '?' },
              { html: 'They forgot to change the sign of the slope.', why: 'For a parallel line the slope doesn’t change at all — no flip and no sign change.' },
              { html: 'They should have used the given line’s ' + t('y') + '-intercept ' + t(sh.c) + '.', why: 'The new line passes through ' + t(ptT(sh.x0, sh.y0)) + ', so it has its own ' + t('b') + '. The error is in the slope.' }],
              'They used the negative reciprocal — the <b>perpendicular</b> slope. Parallel lines have <b>equal</b> slopes, so ' + t('m') + ' should be ' + t(nT(g)) + '.', ['What is the rule for parallel slopes?'], 'error: perp slope for parallel');
          } },
          { id: 'e14b', level: 'PRG', make: function (r, sh) { return slopePointPart(sh.g, sh.x0, sh.y0, 'Determine the correct equation.', [{ is: L(nrec(sh.g), sh.bs), code: 'u72-student', hint: 'That’s the student’s line. A parallel line keeps the slope ' + t(nT(sh.g)) + '.' }].concat(parW(sh.g, { point: [sh.x0, sh.y0] }))); } },
          { id: 'e14c', level: 'EMG', make: function (r, sh) {
            var gT = given(sh.g, sh.c), P = ptT(sh.x0, sh.y0), Q = ptT(sh.y0, sh.x0);
            var swapOn = near(fv(fAdd(fMul(nrec(sh.g), sh.y0), sh.bs)), sh.x0);
            return mc(r, 'The student’s arithmetic after the slope is flawless. Their answer is the correct answer to which question?', uniqOpts([
              { html: 'The line through ' + t(P) + ' <b>perpendicular</b> to ' + t(gT) + '.', right: true },
              { html: 'The line through ' + t(P) + ' parallel to ' + t(gT) + '.', why: 'That was the original question — their slope is wrong for it.' },
              { html: 'The line through ' + t(ptT(0, sh.y0)) + ' perpendicular to ' + t(gT) + '.', why: 'Check: does the student’s line pass through ' + t(ptT(0, sh.y0)) + '? Its ' + t('y') + '-intercept is ' + t(nT(sh.bs)) + '.' },
              swapOn ? { html: 'The line through the origin perpendicular to ' + t(gT) + '.', why: 'Its ' + t('y') + '-intercept is ' + t(nT(sh.bs)) + ', not ' + t('0') + '.' } : { html: 'The line through ' + t(Q) + ' perpendicular to ' + t(gT) + '.', why: 'Substitute ' + t(Q) + ' into the student’s line: it doesn’t fit. Which point did they use?' }]),
              'Their line has slope ' + t(nT(nrec(sh.g))) + ' (the negative reciprocal of ' + t(nT(sh.g)) + ') and passes through ' + t(P) + ', so it answers: <b>the line through ' + t(P) + ' perpendicular to ' + t(gT) + '</b>.', ['Their slope is the perpendicular one, and their arithmetic used the given point.'], 'student answered the perpendicular question');
          } }] },
      { num: '15', stem: function (sh) { return 'Asked for the equation of the line through ' + t(ptT(sh.x0, sh.y0)) + ' that is <b>perpendicular</b> to ' + t(given(sh.g, sh.c)) + ', a student uses ' + t('m=' + nT(fInv(sh.g))) + ' and gets ' + t(SI(fInv(sh.g), sh.bs)) + '.'; },
        shared: function (r) {
          return until(function () { var g = anyFrac(r, 2, 6, 2, 6), x0 = nz(r, -8, 8), y0 = nz(r, -6, 6); return { g: g, c: nz(r, -5, 5), x0: x0, y0: y0, bs: bOf(fInv(g), x0, y0) }; },
            function (o) { return Math.abs(fv(o.bs)) <= 20; });
        },
        parts: [
          { id: 'e15a', level: 'EMG', make: function (r, sh) {
            var g = sh.g;
            var p = B.fields('Multiply the student’s slope by ' + t(nT(g)) + '. What is the product, and what should the product have been for perpendicular lines?', [{ name: 'product', label: 'product', mode: 'number' }, { name: 'should be', label: 'should be', mode: 'number' }],
              [K.number(1, function (v) { return near(v, -1) ? { code: 'u72-perp-nosign', hint: 'Multiply again: two positive numbers give a positive product.' } : null; }), K.number(-1, function (v) { return near(v, 1) ? { code: 'u72-perp-nosign', hint: 'For perpendicular lines the product of the slopes is ' + t('-1') + ', not ' + t('1') + '.' } : null; })],
              ['1', '-1'], 'product: ' + t('1') + '; should be: ' + t('-1'),
              t(nT(fInv(g)) + '\\times ' + nT(g) + '=1') + '. For perpendicular lines the product must be ' + t('-1') + ', so ' + t(nT(fInv(g))) + ' is wrong: the student took the reciprocal but didn’t change the sign.', ['A number times its reciprocal is ' + t('1') + '.'], 'product of slopes');
            p.bad = [['1', '1'], ['-1', '-1']];
            return p;
          } },
          { id: 'e15b', level: 'PRG', make: function (r, sh) { return slopePointPart(nrec(sh.g), sh.x0, sh.y0, 'Determine the correct equation.', perpW(sh.g, { point: [sh.x0, sh.y0] })); } },
          { id: 'e15c', level: 'EMG', make: function (r, sh) {
            return mc(r, 'Which one-line check catches this mistake every time?', [
              { html: 'Perpendicular slopes multiply to ' + t('-1') + ', so one is positive and the other negative: if both slopes have the same sign, the negative was dropped.', right: true },
              { html: 'Check that the two slopes are reciprocals of each other.', why: t(nT(fInv(sh.g))) + ' <i>is</i> the reciprocal of ' + t(nT(sh.g)) + ' — this check would pass the wrong answer.' },
              { html: 'Check that the line passes through the given point.', why: 'The student’s line does pass through the point — the error is in the slope’s sign.' },
              { html: 'Check that the two lines have the same ' + t('y') + '-intercept.', why: 'Perpendicular lines don’t need the same ' + t('y') + '-intercept.' }],
              'Perpendicular slopes multiply to ' + t('-1') + ', so one must be positive and the other negative; if both slopes have the same sign, the negative was dropped.', ['What must be true about the <b>signs</b> of two perpendicular slopes?'], 'sign check for perpendicular');
          } }] },

      /* ---------- Part H: the perpendicular bisector ---------- */
      { num: '16', section: 'Extra practice H — Stretch: the perpendicular bisector', stem: function (sh) {
          return 'The <b>perpendicular bisector</b> of a segment is the line that cuts the segment in half and meets it at ' + t('90^\\circ') + '. Consider the segment joining ' + t('A' + ptT(sh.A[0], sh.A[1])) + ' and ' + t('B' + ptT(sh.B[0], sh.B[1])) + '.<br>' +
            HW.graph({ x: [-4, 8], y: [-3, 9], labels: 2, max: 300, segs: [{ pts: [sh.A, sh.B], start: 'closed', end: 'closed' }], points: [{ x: sh.A[0], y: sh.A[1], label: 'A' }, { x: sh.B[0], y: sh.B[1], label: 'B' }] });
        },
        shared: function (r) {
          var dirs = [[4, 3], [3, 4], [4, -3], [3, -4], [2, 1], [1, 2], [2, -1], [1, -2], [3, 1], [1, 3], [3, -1], [1, -3]];
          return until(function () {
            var uv = r.pick(dirs), u = uv[0], v = uv[1], M = [r.int(-1, 5), r.int(1, 6)], d = [v, -u];
            var A = [M[0] - u, M[1] - v], Bp = [M[0] + u, M[1] + v], inW = function (p) { return p[0] >= -3 && p[0] <= 7 && p[1] >= -2 && p[1] <= 8; };
            var Ps = [1, -1, 2, -2].map(function (j) { return [M[0] + j * d[0], M[1] + j * d[1]]; }).filter(function (p) { var N = Math.pow(p[0] - A[0], 2) + Math.pow(p[1] - A[1], 2), s = Math.round(Math.sqrt(N)); return inW(p) && s * s !== N; });
            var P = Ps.filter(function (p) { return p[1] === 0; })[0] || Ps[0];
            return { u: u, v: v, M: M, A: A, B: Bp, d: d, P: P, ok: inW(A) && inW(Bp) && !!P && inW([M[0] + d[0], M[1] + d[1]]) || (inW(A) && inW(Bp) && !!P && inW([M[0] - d[0], M[1] - d[1]])) };
          }, function (o) { return o.ok && o.u !== 0 && o.v !== 0; });
        },
        parts: [
          { id: 'e16a', sub: 'a', level: 'BEG', outcome: 'EXT', make: function (r, sh) {
            var A = sh.A, Bp = sh.B, M = sh.M;
            return ptPart('Determine the midpoint ' + t('M') + ' of ' + t('AB') + '.', M,
              [[[sh.u, sh.v], 'u72-mid', 'Add the coordinates (don’t subtract): ' + t('M=\\left(\\frac{x_1+x_2}{2},\\ \\frac{y_1+y_2}{2}\\right)') + '.'], [[A[0] + Bp[0], A[1] + Bp[1]], 'u72-mid', 'Divide each sum by ' + t('2') + '.'], [[M[1], M[0]], 'pairs-flip', 'Your coordinates are in the wrong order: ' + t('x') + ' first.']],
              t('M=\\left(\\frac{' + A[0] + '+' + pT(Bp[0]) + '}{2},\\ \\frac{' + A[1] + '+' + pT(Bp[1]) + '}{2}\\right)=\\left(\\frac{' + (A[0] + Bp[0]) + '}{2},\\ \\frac{' + (A[1] + Bp[1]) + '}{2}\\right)=' + ptT(M[0], M[1])),
              ['The midpoint averages the coordinates: ' + t('\\left(\\frac{x_1+x_2}{2},\\ \\frac{y_1+y_2}{2}\\right)') + '.'], 'midpoint of AB');
          } },
          { id: 'e16b', sub: 'b', level: 'BEG', outcome: 'RF3', make: function (r, sh) {
            var A = sh.A, Bp = sh.B, m = fr(sh.v, sh.u);
            return slopePart('Determine the slope of ' + t('AB') + '.', m, [],
              t('m_{AB}=\\frac{' + Bp[1] + '-' + pT(A[1]) + '}{' + Bp[0] + '-' + pT(A[0]) + '}=\\frac{' + (2 * sh.v) + '}{' + (2 * sh.u) + '}=' + nT(m)), ['Slope = rise ÷ run = ' + t('\\frac{y_2-y_1}{x_2-x_1}') + '.'], 'slope of AB');
          } },
          { id: 'e16c', sub: 'c', level: 'EMG', outcome: 'RF7', make: function (r, sh) {
            var m = fr(sh.v, sh.u), pm_ = nrec(m);
            return slopePart('State the slope of the perpendicular bisector.', pm_, [[m, 'u72-perp-same', 'That’s the slope of ' + t('AB') + ' itself. The bisector is perpendicular to ' + t('AB') + ', so take the negative reciprocal.'], [fInv(m), 'u72-perp-nosign', 'Flipped, but the sign must change too: the slopes multiply to ' + t('-1') + '.'], [fNeg(m), 'u72-perp-noflip', 'Changed the sign, but you also have to flip the fraction.']],
              'The negative reciprocal of ' + t(nT(m)) + ' is ' + t(nT(pm_)) + '.<br><b>Check.</b> ' + t(pT(m) + '\\times ' + pT(pm_) + '=-1') + ' ✓', [H_PERP[0]], 'perpendicular bisector slope');
          } },
          { id: 'e16d', sub: 'd', level: 'PRG', outcome: 'RF7', make: function (r, sh) {
            var m = fr(sh.v, sh.u), pm_ = nrec(m), M = sh.M;
            return slopePointPart(pm_, M[0], M[1], 'Use the midpoint ' + t('M') + ' of ' + t('AB') + ' and the perpendicular slope to determine the equation of the perpendicular bisector in the form ' + t('y=mx+b') + '.',
              [{ is: LP_(m, M[0], M[1]), code: 'u72-gr-par', hint: 'That line has the slope of ' + t('AB') + ' — it lies along ' + t('AB') + '. Use the perpendicular slope.' }, { is: LP_(pm_, sh.A[0], sh.A[1]), code: 'u72-gr-endpoint', hint: 'That line passes through ' + t('A') + '. The bisector passes through the <b>midpoint</b> ' + t('M') + '.' }, { is: LP_(pm_, sh.B[0], sh.B[1]), code: 'u72-gr-endpoint', hint: 'That line passes through ' + t('B') + '. The bisector passes through the <b>midpoint</b> ' + t('M') + '.' }].concat(perpW(m, { point: M })));
          } },
          { id: 'e16d2', sub: 'd, draw', level: 'EMG', outcome: 'RF6', make: function (r, sh) {
            var M = sh.M, d = sh.d, A = sh.A, Bp = sh.B, lineV = function (p, q) { return { pts: [], pieces: [{ v: [p, q], s: 'arrow', e: 'arrow' }], join: 'none' }; };
            var P2 = [M[0] + d[0], M[1] + d[1]], inW = function (p) { return p[0] >= -4 && p[0] <= 8 && p[1] >= -3 && p[1] <= 9; }; if (!inW(P2)) P2 = [M[0] - d[0], M[1] - d[1]];
            var target = lineV(M, P2), m = fr(sh.v, sh.u), pm_ = nrec(m);
            var wr = [{ is: lineV(M, [M[0] + sh.u, M[1] + sh.v]), code: 'u72-gr-par', hint: 'Your line runs along ' + t('AB') + ' (same slope). The bisector crosses ' + t('AB') + ' at a right angle.' },
              { is: lineV(A, [A[0] + d[0], A[1] + d[1]]), code: 'u72-gr-endpoint', hint: 'Your line is perpendicular to ' + t('AB') + ' but passes through ' + t('A') + '. The bisector must pass through the midpoint ' + t('M' + ptT(M[0], M[1])) + '.' },
              { is: lineV(Bp, [Bp[0] + d[0], Bp[1] + d[1]]), code: 'u72-gr-endpoint', hint: 'Your line is perpendicular to ' + t('AB') + ' but passes through ' + t('B') + '. The bisector must pass through the midpoint ' + t('M' + ptT(M[0], M[1])) + '.' },
              { is: lineV(M, [M[0] + sh.v, M[1] + sh.u]), code: 'u72-gr-sign', hint: 'Check the direction: the slope is ' + t(nT(pm_)) + ', so from ' + t('M') + ' go ' + (fv(pm_) < 0 ? 'down' : 'up') + ' ' + t(Math.abs(pm_[0])) + ' for every ' + t(pm_[1]) + ' to the right.' }];
            var base = K.graphExact(target, { wrong: wr }), check = function (resp) { if (!DR.empty(resp) && DR.same(resp, target)) return ok(); return base(resp); };
            var p = B.graph('Draw the perpendicular bisector on the grid. <span class="muted">Use <b>╱ Line</b>: tap two points on it — its ends start as arrows.</span>',
              { x: [-4, 8], y: [-3, 9], labels: 2, defaultEnd: 'arrow', tools: ['line', 'ends'], bg: { segs: [{ pts: [A, Bp], start: 'closed', end: 'closed' }], points: [{ x: A[0], y: A[1], label: 'A' }, { x: Bp[0], y: Bp[1], label: 'B' }] } },
              check, target,
              'Start at ' + t('M' + ptT(M[0], M[1])) + ' and use the slope ' + t(nT(pm_)) + ': ' + (fv(pm_) < 0 ? 'down' : 'up') + ' ' + t(Math.abs(pm_[0])) + ', right ' + t(pm_[1]) + ' to ' + t(ptT(M[0] + pm_[1], M[1] + pm_[0])) + '. Draw the line through those points with arrows at both ends.',
              ['Plot the midpoint ' + t('M') + ' first, then step along the perpendicular slope (the negative reciprocal of the slope of ' + t('AB') + ').'], 'draw perpendicular bisector');
            p.bad = wr.map(function (w) { return w.is; }).concat([{ pts: [], pieces: [{ v: [M, P2], s: 'closed', e: 'closed' }], join: 'none' }]).filter(function (b) { return !DR.same(b, target); });
            return p;
          } },
          { id: 'e16e', sub: 'e', level: 'BEG', outcome: 'RF7', make: function (r, sh) {
            var m = nrec(fr(sh.v, sh.u)), M = sh.M, b = bOf(m, M[0], M[1]);
            return numPart('The perpendicular bisector has equation ' + t(SI(m, b)) + '. Verify it: substitute ' + t('x=' + M[0]) + ' (the ' + t('x') + '-coordinate of the midpoint ' + t('M') + ') into it. What ' + t('y') + '-value does it give?', M[1], [[M[0], 'u72-pt-swap', 'That’s the ' + t('x') + '-value you substituted. Work out ' + t(SI(m, b)) + ' at ' + t('x=' + M[0]) + '.']],
              t('y=' + nT(m) + '\\left(' + M[0] + '\\right)+' + pT(b) + '=' + nT(fMul(m, M[0])) + '+' + pT(b) + '=' + M[1]) + ' ✓ — so ' + t('M' + ptT(M[0], M[1])) + ' is on the line.', ['Substitute ' + t('x=' + M[0]) + ' into ' + t(SI(m, b)) + ' and simplify.'], 'verify M on the bisector', { before: t('y=') });
          } },
          { id: 'e16f', sub: 'f', level: 'PRG', outcome: 'EXT', make: function (r, sh) {
            var P = sh.P, A = sh.A, Bp = sh.B, N = Math.pow(P[0] - A[0], 2) + Math.pow(P[1] - A[1], 2), k = 1;
            for (var s = Math.floor(Math.sqrt(N)); s > 1; s--) if (N % (s * s) === 0) { k = s; break; }
            var spec = { k: k, n: 2, m: N / (k * k) }, rt = K.radTex(spec), eqR = k > 1 ? '=' + rt : '';
            var dA = [P[0] - A[0], P[1] - A[1]], dB = [P[0] - Bp[0], P[1] - Bp[1]];
            var p = B.fields('The point ' + t('P' + ptT(P[0], P[1])) + ' lies on the bisector. Use the distance formula to compute ' + t('PA') + ' and ' + t('PB') + ' as exact values (simplest radical form).',
              [{ name: t('PA'), label: '', before: t('PA='), mode: 'math', keys: 'radical' }, { name: t('PB'), label: '', before: t('PB='), mode: 'math', keys: 'radical' }],
              [K.radical(spec, 'mixed'), K.radical(spec, 'mixed')], [rt, rt], t('PA=PB=' + rt),
              t('PA=\\sqrt{' + pT(dA[0]) + '^{2}+' + pT(dA[1]) + '^{2}}=\\sqrt{' + N + '}' + eqR) + '<br>' + t('PB=\\sqrt{' + pT(dB[0]) + '^{2}+' + pT(dB[1]) + '^{2}}=\\sqrt{' + N + '}' + eqR) + '<br>' + t('PA=PB') + ': ' + t('P') + ' is the same distance from ' + t('A') + ' and ' + t('B') + '.',
              ['Distance: ' + t('\\sqrt{(x_2-x_1)^{2}+(y_2-y_1)^{2}}') + '. Then simplify the radical.'], 'PA and PB');
            p.bad = [[String(N), String(N)]].concat(spec.k > 1 ? [['\\sqrt{' + N + '}', rt]] : []);
            return p;
          } },
          { id: 'e16g', sub: 'g', level: 'PRG', outcome: 'EXT', make: function (r, sh) {
            return mc(r, 'The point ' + t('P' + ptT(sh.P[0], sh.P[1])) + ' on the perpendicular bisector has ' + t('PA=PB') + '. That is a property every point of a perpendicular bisector has. Which sentence states it?', [
              { html: 'Every point on the perpendicular bisector of a segment is the same distance from the two endpoints of the segment.', right: true },
              { html: 'Every point on the perpendicular bisector is the midpoint of the segment.', why: 'Only one point — ' + t('M') + ' — is the midpoint. ' + t('P') + ' isn’t, yet ' + t('PA=PB') + '.' },
              { html: 'Every point on the perpendicular bisector is the same distance from the midpoint as from each endpoint.', why: 'Compare ' + t('PM') + ' with ' + t('PA') + ': they’re different. The equal distances are to the two <b>endpoints</b>.' },
              { html: 'Every point on the perpendicular bisector is closer to the nearer endpoint.', why: t('PA') + ' and ' + t('PB') + ' are <b>equal</b>.' }],
              'Every point on the perpendicular bisector of a segment is the <b>same distance from the two endpoints</b> of the segment.', ['What did you notice about ' + t('PA') + ' and ' + t('PB') + '?'], 'perpendicular bisector property');
          } }] },
      { num: '17', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: 'e17', level: 'EMG', make: function (r) {
          var o = until(function () { var A = r.int(1, 5), Bc = until(function () { return r.int(2, 5); }, function (b) { return gcd(A, b) === 1 && b !== A; }), x0 = Bc * nz(r, -2, 2), y0 = nz(r, -6, 6); return { A: A, B: Bc, C: nz(r, -12, 12), x0: x0, y0: y0 }; },
            function (o) { var m = fr(-o.A, o.B), b0 = bOf(m, o.x0, o.y0), cands = [fAdd(o.y0, fMul(m, o.x0)), bOf(nrec(m), o.x0, o.y0), fNeg(fAdd(o.y0, fMul(m, o.x0))), fr(-o.C, o.B)]; var seen = [nT(b0)]; return cands.filter(function (c) { var k = nT(c); if (seen.indexOf(k) >= 0) return false; seen.push(k); return true; }).length >= 3; });
          var m = fr(-o.A, o.B), b0 = bOf(m, o.x0, o.y0), gT = GEN({ A: o.A, B: o.B, C: o.C });
          var cand = [[fAdd(o.y0, fMul(m, o.x0)), 'You added ' + t('mx') + ' instead of subtracting it when solving for ' + t('b') + ' (or used the slope with the wrong sign). Rearranging ' + t(gT) + ' gives ' + t('m=' + nT(m)) + '.'],
            [bOf(nrec(m), o.x0, o.y0), 'That uses the perpendicular slope ' + t(nT(nrec(m))) + '. Parallel lines have <b>equal</b> slopes.'],
            [fNeg(fAdd(o.y0, fMul(m, o.x0))), 'Check your signs: substitute ' + t(ptT(o.x0, o.y0)) + ' carefully into ' + t('y=' + nT(m) + 'x+b') + '.'],
            [fr(-o.C, o.B), 'That’s the ' + t('y') + '-intercept of the given line. Your line passes through ' + t(ptT(o.x0, o.y0)) + ', so it has its own ' + t('b') + '.']];
          var seen = [nT(b0)], wr = cand.filter(function (c) { var k = nT(c[0]); if (seen.indexOf(k) >= 0) return false; seen.push(k); return true; }).slice(0, 3);
          var opts = [{ html: t(nT(b0)), right: true }].concat(wr.map(function (c) { return { html: t(nT(c[0])), why: c[1] }; }));
          opts.sort(function (a, b) { return fv(parseOpt(a.html)) - fv(parseOpt(b.html)); });
          return mc(r, 'A line passes through ' + t(ptT(o.x0, o.y0)) + ' and is parallel to the line ' + t(gT) + '. The value of the ' + t('y') + '-intercept of this line is', opts,
            t(o.B + 'y=' + (o.A === 1 ? '-' : -o.A) + 'x' + (-o.C < 0 ? '' : '+') + (-o.C)) + ', so the slope is ' + t(nT(m)) + '; parallel ' + t('\\Rightarrow m=' + nT(m)) + '.<br>' + subSol(m, o.x0, o.y0), ['Rearrange the given line to ' + t('y=mx+b') + ' to read its slope.', H_PT[0]], 'MC y-intercept, parallel to general form', true);
        } }] },
      { num: '18', stem: '<i>(Numerical Response)</i>', parts: [
        { id: 'e18', level: 'ADV', make: function (r) {
          var o = until(function () {
            var c = r.int(1, 4), d = until(function () { return r.int(1, 4); }, function (d) { return gcd(c, d) === 1 && d !== c; }), m = fr(-d, c), p = r.int(-4, 3), k = r.int(2, 8), tt = r.pick([-2, -1, 1, 2]);
            return { c: c, d: d, m: m, p: p, k: k, x0: p + c * tt, y0: k - d * tt, C0: nz(r, -9, 9) };
          }, function (o) { return o.p + o.k >= 1 && o.p !== 0 && o.x0 !== 0 && Math.abs(o.x0) <= 9 && Math.abs(o.y0) <= 12 && o.y0 !== o.k; });
          var gT = GEN({ A: o.c, B: -o.d, C: o.C0 }), gs = fr(o.c, o.d), b = bOf(o.m, o.x0, o.y0), ans = o.p + o.k;
          var xPar = fv(fDiv(fSub(o.k, bOf(gs, o.x0, o.y0)), gs)), xSign = fv(fDiv(fSub(o.k, bOf(fNeg(o.m), o.x0, o.y0)), fNeg(o.m)));
          return nrPart('The line that passes through ' + t(ptT(o.x0, o.y0)) + ' and is perpendicular to ' + t(gT) + ' intersects the line ' + t('y=' + o.k) + ' at the point ' + t('(p,\\ q)') + '. The value of ' + t('p+q') + ' is ______.', ans,
            [[Math.round((xPar + o.k) * 100) / 100, 'u72-nr-perp', 'That uses the slope of the given line (a parallel line). You need the negative reciprocal of ' + t(nT(gs)) + '.'], [Math.round((xSign + o.k) * 100) / 100, 'u72-nr-perp', 'Check the sign of the perpendicular slope: it is ' + t(nT(o.m)) + '.'], [o.p, 'u72-nr-b', 'You found ' + t('p') + ' — now add ' + t('q=' + o.k) + '.']],
            'Rearrange: ' + t(gT) + ' gives slope ' + t(nT(gs)) + ', so the perpendicular slope is ' + t('m=' + nT(o.m)) + '.<br>' + subSol(o.m, o.x0, o.y0) + ' The line is ' + t(SI(o.m, b)) + '.<br>Set ' + t('y=' + o.k) + ': ' + t(SI(o.m, b).replace(/^y=/, o.k + '=')) + ', so ' + t('x=' + o.p) + '. The point is ' + t(ptT(o.p, o.k)) + ', and ' + t('p+q=' + o.p + '+' + o.k + '=' + ans) + '.',
            ['Three steps: the slope of the given line, the perpendicular line through the point, then substitute ' + t('y=' + o.k) + '.'], 'NR p+q, perpendicular line meets y=k');
        } }] }
    ]
  });

  /* ---------------- makers used above (function declarations are hoisted) ---------------- */
  function money(v) { return (Math.round(v * 100) / 100).toFixed(2); }
  function parseOpt(html) { var m = /\\\((.*)\\\)/.exec(html); var a = ex.parse(m ? m[1] : '0'); var v = a.ok ? ex.value(a.ast) : 0; return HW.lines.toFr(v); }
  function gridLinePart(m, b, idx) {
    m = fr(m); var rise = m[0], run = m[1], target = L(m, b);
    var w = [];
    if (isInt(m) && !fEq(m, b) && b !== 0) w.push({ is: L(b, m), code: 'u72-swap-mb', hint: 'You swapped them: ' + t('b') + ' is where the line crosses the ' + t('y') + '-axis, and ' + t('m') + ' is rise ÷ run.' });
    var xi = fDiv(fNeg(b), m);
    w.push({ is: L(m, xi), code: 'u72-b-xint', hint: 'In ' + t('y=mx+b') + ', ' + t('b') + ' is where the line crosses the <b>' + t('y') + '</b>-axis.' });
    return LP('Determine the equation of line ' + t('n_' + idx) + '.', target, { wrong: w },
      t('n_' + idx) + ' passes through ' + t(ptT(0, b)) + ' and ' + t(ptT(run, b + rise)) + ': rise ' + t(rise) + ', run ' + t(run) + ', so ' + t('m=' + nT(m)) + '; ' + t('b=' + b) + '.<br>' + t(SI(m, b)) + '. <b>Check.</b> ' + t((fEq(m, 1) ? '' : nT(m)) + '\\left(' + run + '\\right)' + (b < 0 ? '' : '+') + b + '=' + (b + rise)) + ' ✓',
      ['Read ' + t('b') + ' where the line crosses the ' + t('y') + '-axis. Then move along the line from there to the next lattice point and count rise and run.', 'Falling left to right means a negative slope.'], 'line n' + idx + ' from grid');
  }
  /* a vertical ('v') or horizontal ('h') line through P */
  function hvPart(P, kind, prompt, why) {
    var px = P[0], py = P[1], v = kind === 'v', target = v ? { x: px } : { y: py };
    return LP(prompt, target, { wrong: v ? [{ is: { x: py }, code: 'u72-coord', hint: 'Right kind of line (vertical) — but use the point’s <b>' + t('x') + '</b>-coordinate: every point on a vertical line has the same ' + t('x') + '.' }, { is: { y: py }, code: 'line-vh', hint: 'That’s a horizontal line. This line is vertical, so its equation is ' + t('x=') + ' a number.' }]
      : [{ is: { y: px }, code: 'u72-coord', hint: 'Right kind of line (horizontal) — but use the point’s <b>' + t('y') + '</b>-coordinate: every point on a horizontal line has the same ' + t('y') + '.' }, { is: { x: px }, code: 'line-vh', hint: 'That’s a vertical line. This line is horizontal, so its equation is ' + t('y=') + ' a number.' }] },
      (why || (v ? 'Parallel to the ' + t('y') + '-axis means <b>vertical</b>' : 'Parallel to the ' + t('x') + '-axis means <b>horizontal</b>')) + ', so the equation is ' + t(v ? 'x=' : 'y=') + ' the ' + t(v ? 'x' : 'y') + '-coordinate of the point: ' + t(v ? 'x=' + px : 'y=' + py) + '.<br><b>Check.</b> ' + t(ptT(px, py)) + ' satisfies ' + t(v ? 'x=' + px : 'y=' + py) + ' ✓',
      [v ? H_HV[0] : H_HV[1]], (v ? 'vertical' : 'horizontal') + ' through (' + px + ', ' + py + ')');
  }
  /* slope and a point (not on the y-axis) → y = mx + b */
  function slopePointPart(m, x0, y0, prompt, extraWrong, solPre) {
    m = fr(m); var b = bOf(m, x0, y0), slip = fAdd(y0, fMul(m, x0));
    var w = (extraWrong || []).slice();
    if (!fEq(slip, b)) w.push({ is: L(m, slip), code: 'u72-b-solve', hint: 'Check how you solved for ' + t('b') + ': from ' + t(nT(y0) + '=' + nT(fMul(m, x0)) + '+b') + ', <b>subtract</b> ' + t(nT(fMul(m, x0))) + ' from both sides.' });
    if (!fEq([y0, 1], b)) w.push({ is: L(m, y0), code: 'u72-b-y0', hint: t(nT(y0)) + ' is the point’s ' + t('y') + '-coordinate, not the ' + t('y') + '-intercept — the point isn’t on the ' + t('y') + '-axis. Substitute it into ' + t('y=mx+b') + ' and solve for ' + t('b') + '.' });
    return LP(prompt || 'slope ' + t(nT(m)) + ', through ' + t(ptT(x0, y0)), L(m, b), { form: 'slope-intercept', point: [x0, y0], wrong: w },
      (solPre || '') + t('m=' + nT(m)) + ', point ' + t(ptT(x0, y0)) + ': ' + subSol(m, x0, y0) + '<br>' + t(SI(m, b)) + '.<br><b>Check.</b> ' + t(nT(m) + '\\left(' + x0 + '\\right)' + (fv(b) < 0 ? '' : '+') + nT(b) + '=' + nT(fAdd(fMul(m, x0), b))) + ' ✓',
      H_PT, 'slope ' + nT(m) + ' through (' + x0 + ',' + y0 + ')');
  }
  /* two points → y = mx + b (horizontal when the y's are equal) */
  function twoPointPart(o, prompt) {
    var m = fr(o.y2 - o.y1, o.x2 - o.x1), b = bOf(m, o.x1, o.y1);
    var w = [];
    if (o.y1 !== o.y2) {
      var slip = fAdd(o.y1, fMul(m, o.x1)); if (!fEq(slip, b)) w.push({ is: L(m, slip), code: 'u72-b-solve', hint: 'Check how you solved for ' + t('b') + ': subtract ' + t('mx') + ' from both sides — watch the signs.' });
      w.push({ is: { x: o.x1 }, code: 'line-vertical', hint: 'The two points have different ' + t('x') + '-coordinates, so the line isn’t vertical.' });
    } else w.push({ is: { x: o.y1 }, code: 'line-vh', hint: 'Both points have the same <b>' + t('y') + '</b>-coordinate, so the rise is ' + t('0') + ': the line is horizontal, ' + t('y=k') + '.' });
    var sol = o.y1 === o.y2 ? slopeSol(o.x1, o.y1, o.x2, o.y2) + '. With ' + t('m=0') + ', ' + t('y=mx+b') + ' becomes ' + t('y=b') + ', and ' + t('b=' + o.y1) + ': ' + t('y=' + o.y1) + ' — a <b>horizontal</b> line.'
      : slopeSol(o.x1, o.y1, o.x2, o.y2) + '.<br>' + subSol(m, o.x1, o.y1) + '<br>' + t(SI(m, b)) + '.<br><b>Check.</b> ' + t(nT(m) + '\\left(' + o.x2 + '\\right)' + (fv(b) < 0 ? '' : '+') + nT(b) + '=' + o.y2) + ' ✓';
    return LP(prompt || t(ptT(o.x1, o.y1)) + ' and ' + t(ptT(o.x2, o.y2)), L(m, b), { form: 'slope-intercept', wrong: w }, sol, H_2P, 'line through (' + o.x1 + ',' + o.y1 + '), (' + o.x2 + ',' + o.y2 + ')');
  }
  /* "running the equation backwards": a point on y = (p/q)x + c with one coordinate given */
  function backPart(sh, which, x) {
    var m = sh.m, c = sh.c, y = fAdd(fMul(m, x), c), cT = (c < 0 ? '' : '+') + c;
    if (which === 'x') {
      return ptPart('the point with ' + t('x=' + x), [x, y], [[[y, x], 'pairs-flip', 'Your coordinates are swapped: ' + t('x=' + x) + ' goes first.'], [[x, fSub(fMul(m, x), c)], 'u72-pt-solve', 'Check the constant term: it is ' + t(cT) + '.']],
        t('y=' + nT(m) + '\\left(' + x + '\\right)' + cT + '=' + nT(fMul(m, x)) + cT + '=' + nT(y)) + ', so the point is ' + t(ptT(x, y)) + '.', ['Substitute ' + t('x=' + x) + ' and evaluate.'], 'point with x=' + x);
    }
    var yv = fv(y), rhs = fSub(y, c), w1 = fMul(rhs, m), w2 = fDiv(fAdd(y, c), m);
    return ptPart('the point with ' + t('y=' + nT(y)), [x, y], [[[y, x], 'pairs-flip', 'Your coordinates are swapped: ' + t('y=' + nT(y)) + ' is the second coordinate.'], [[w1, y], 'u72-pt-solve', 'To undo “' + t('\\times ' + nT(m)) + '”, multiply by the reciprocal ' + t(nT(fInv(m))) + ' (or divide by ' + t(nT(m)) + ').'], [[w2, y], 'u72-pt-solve', 'Undo the ' + t(cT) + ' with the opposite operation first: ' + t(nT(y) + (c < 0 ? '+' + (-c) : '-' + c) + '=' + nT(rhs)) + '.']],
      t(nT(y) + '=' + nT(m) + 'x' + cT) + ', so ' + t(nT(rhs) + '=' + nT(m) + 'x') + ' and ' + t('x=' + nT(rhs) + '\\times ' + nT(fInv(m)) + '=' + x) + '. The point is ' + t(ptT(x, y)) + '.', ['Substitute ' + t('y=' + nT(y)) + ', then undo the operations: first the constant, then the multiplication.'], 'point with y=' + yv);
  }
  /* a table (equal x-steps dx) → y = mx + b */
  function tablePart(xs, ys, m, dx) {
    m = fr(m); var b = bOf(m, xs[2], ys[2]), dy = ys[1] - ys[0];
    var w = [];
    if (dx !== 1 && !fEq([dy, 1], m)) w.push({ is: { m: [dy, 1], point: [xs[2], ys[2]] }, code: 'u72-diff', hint: 'The first difference ' + t(dy) + ' is the rise for a run of ' + t(dx) + ' (the step in ' + t('x') + '), so the slope is ' + t('\\frac{' + dy + '}{' + dx + '}') + '.' });
    var slip = fAdd(ys[2], fMul(m, xs[2])); if (!fEq(slip, b)) w.push({ is: L(m, slip), code: 'u72-b-solve', hint: 'Check how you solved for ' + t('b') + ': subtract ' + t('mx') + ' from both sides.' });
    return LP(HW.valueTable([[t('x')].concat(xs), [t('y')].concat(ys)]) + 'This relation is linear. Determine its equation.', L(m, b), { form: 'slope-intercept', wrong: w },
      t('x') + ' steps by ' + t(dx) + '; ' + t('y') + ' steps by ' + t(dy) + ' every time, so the relation is linear with ' + t('m=\\frac{' + dy + '}{' + dx + '}' + (dx === 1 || gcd(dy, dx) === 1 && dx > 0 ? '' : '=' + nT(m))) + '.<br>' + subSol(m, xs[2], ys[2]) + '<br>' + t(SI(m, b)) + '.<br><b>Check.</b> ' + t(nT(m) + '\\left(' + xs[4] + '\\right)' + (fv(b) < 0 ? '' : '+') + nT(b) + '=' + ys[4]) + ' ✓',
      ['Slope = (change in ' + t('y') + ') ÷ (change in ' + t('x') + ') between neighbouring columns.', 'Then substitute any column into ' + t('y=mx+b') + ' to find ' + t('b') + '.'], 'table → equation, m=' + nT(m));
  }
  /* Extra 6: parallel / perpendicular to a line in general form (type 1: Ax + By = C, 2: Ax − By − C = 0) or through two points (3) */
  function condPart(g, type, perp) {
    var gm, gT, how;
    if (type === 1) { gm = fr(-g.A, g.B); gT = (g.A === 1 ? '' : g.A) + 'x+' + g.B + 'y=' + g.C; how = t(g.B + 'y=' + (-g.A === -1 ? '-' : -g.A) + 'x' + (g.C < 0 ? '' : '+') + g.C) + ', so ' + t(SI(gm, fr(g.C, g.B))); }
    else if (type === 2) { gm = fr(g.A, g.B); gT = g.A + 'x-' + g.B + 'y' + (g.C < 0 ? '+' + (-g.C) : '-' + g.C) + '=0'; how = t('-' + g.B + 'y=' + (-g.A) + 'x' + (g.C < 0 ? '-' + (-g.C) : '+' + g.C)) + ', so ' + t(SI(gm, fr(-g.C, g.B))); }
    else { gm = fr(g.Q[3] - g.Q[1], g.Q[2] - g.Q[0]); gT = null; how = slopeSol(g.Q[0], g.Q[1], g.Q[2], g.Q[3]); }
    var m = perp ? nrec(gm) : gm, P = g.P, b = bOf(m, P[0], P[1]);
    var desc = type === 3 ? 'the line joining ' + t(ptT(g.Q[0], g.Q[1])) + ' and ' + t(ptT(g.Q[2], g.Q[3])) : t(gT);
    var w = perp ? perpW(gm, { point: P }) : parW(gm, { point: P });
    if (type !== 3 && !perp) w.push({ is: withB(fNeg(gm), { point: P }), code: 'line-slope-sign', hint: 'Check the sign when you rearrange: move the ' + t('x') + '-term to the other side (its sign changes), then divide by the coefficient of ' + t('y') + '.' });
    if (type !== 3) w.push({ is: withB(perp ? nrec([type === 1 ? -g.A : g.A, 1]) : [type === 1 ? -g.A : g.A, 1], { point: P }), code: 'u72-k-nodiv', hint: 'Divide by the coefficient of ' + t('y') + ' too: the slope of ' + t(gT) + ' is ' + t(nT(gm)) + ', not ' + t(type === 1 ? -g.A : g.A) + '.' });
    return slopePointPart(m, P[0], P[1], 'through ' + t(ptT(P[0], P[1])) + ' and ' + (perp ? '<b>perpendicular</b>' : '<b>parallel</b>') + ' to ' + desc, w,
      (type === 3 ? 'Joining line: ' : 'Rearrange: ') + how + ', so its slope is ' + t(nT(gm)) + '. ' + (perp ? 'Perpendicular: the negative reciprocal, ' + t('m=' + nT(m)) : 'Parallel: the same slope, ' + t('m=' + nT(m))) + '.<br>');
  }
  /* Extra 8: a pair of descriptions (same line, or parallel lines when odd) */
  function samePair(r, i, odd) {
    var names = [['A', 'B'], ['C', 'D'], ['E', 'F'], ['G', 'H']][i], m, b, d1, b2, e1, e2, d2;
    var shift = function () { return r.pick([-3, -2, -1, 1, 2, 3]); };
    if (i === 0) { m = anyFrac(r, 1, 4, 2, 5); if (r.chance(0.4)) m = fNeg(m); b = nz(r, -6, 6); d1 = 'through ' + t(ptT(0, b)) + ' with slope ' + t(nT(m)) + '.'; }
    else if (i === 1) { m = [r.pick([-1, -2, 1, 2, -3]), 1]; var x0 = nz(r, -4, 4), y0 = nz(r, -8, 9); b = fv(bOf(m, x0, y0)); d1 = 'through ' + t(ptT(x0, y0)) + ', parallel to ' + t(SI(m, b === 1 ? 4 : 1)) + '.'; }
    else if (i === 2) { m = [r.pick([-2, -3, 2, 3]), 1]; b = nz(r, -5, 5); var xa = r.int(-3, 0), xb = xa + r.int(2, 4); d1 = 'through ' + t(ptT(xa, fv(m) * xa + b)) + ' and ' + t(ptT(xb, fv(m) * xb + b)) + '.'; }
    else { m = [r.pick([2, 3, -2, 1]), 1]; b = nz(r, -5, 5); var xc = r.int(0, 2), xd = xc + r.int(2, 3); d1 = 'through ' + t(ptT(xc, fv(m) * xc + b)) + ' and ' + t(ptT(xd, fv(m) * xd + b)) + '.'; }
    b2 = odd ? b + shift() : b; if (b2 === 0 && i === 2) b2 = b + 4;
    e1 = SI(m, b); e2 = SI(m, b2);
    if (i === 2) d2 = 'through ' + t(ptT(0, b2)) + ', perpendicular to ' + t(SI(nrec(m), 0)) + '.';
    else d2 = t(GEN(L(m, b2))) + '.';
    return { n1: names[0], n2: names[1], d1: d1, d2: d2, e1: e1, e2: e2, same: !odd };
  }
  /* Extra 11: from the two intercepts */
  function twoIntPart(a, b, asPoints) {
    var m = fr(-b, a), target = L(m, b);
    var w = [{ is: L(m, a), code: 'u72-b-xint', hint: t('b') + ' is the <b>' + t('y') + '</b>-intercept, ' + t(b) + '. The ' + t('x') + '-intercept is only used for the slope.' }];
    if (!fEq(fr(b, a), m)) w.push({ is: L(fr(b, a), b), code: 'line-slope-sign', hint: 'Check the sign of the slope: from ' + t(ptT(a, 0)) + ' to ' + t(ptT(0, b)) + ', the rise is ' + t(b) + ' and the run is ' + t(-a) + '.' });
    return LP(asPoints ? t('x') + '-intercept ' + t(ptT(a, 0)) + ', ' + t('y') + '-intercept ' + t(ptT(0, b)) : t('x') + '-intercept ' + t(a) + ', ' + t('y') + '-intercept ' + t(b), target, { form: 'slope-intercept', wrong: w },
      (asPoints ? '' : 'Points ' + t(ptT(a, 0)) + ' and ' + t(ptT(0, b)) + '. ') + t('m=\\frac{' + b + '-0}{0-' + pT(a) + '}=' + nT(m)) + ', ' + t('b=' + b) + ': ' + t(SI(m, b)) + '.<br><b>Check.</b> ' + t(nT(m) + '\\left(' + a + '\\right)' + (b < 0 ? '' : '+') + b + '=0') + ' ✓',
      ['Write the ' + t('x') + '-intercept as a point ' + t('(a,\\ 0)') + ' and the ' + t('y') + '-intercept as ' + t('(0,\\ b)') + '. The ' + t('y') + '-intercept is ' + t('b') + ' itself.', 'Slope: rise ÷ run between the two intercept points.'], 'from intercepts ' + a + ', ' + b);
  }
})(window);
