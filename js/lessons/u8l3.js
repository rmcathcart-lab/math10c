/* Math 10C · Unit 8 · Lesson 3 — Combining Equations: The Elimination Method (RF9)
 * Assignment questions 1–14 (u8_L03.tex) and the Lesson 3 Extra Practice (u8_EP03.tex, questions 1–19).
 * Every part is a generator: it keeps the structure of the booklet system (which variable lines up, add or subtract,
 * one or both equations scaled, general form / rearranged / fractions / decimals, special cases) and changes the
 * numbers; the booklet's own system is one of the possible versions. Solutions are typed as ordered pairs on the
 * point keypad (K.P.point); wrong pairs produced by the classic elimination slips (constant not scaled, right sides
 * combined the other way, a sign not changed when subtracting, back-substituting into a scaled left side with the
 * old constant, fractions cleared on one side only, a sign not changed when rearranging) get their own hints.
 * Levels: LIM BEG EMG PRG ADV MAS. */
(function (root) {
  'use strict';
  var HW = root.HW, K = HW.kit, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form, Ln = HW.lines, PL = HW.poly;

  HW.addCodes({
    'elim-const': 'Scaled an equation but not its constant',
    'elim-rhs': 'Combined the right sides the other way (added vs subtracted)',
    'elim-sub-sign': 'Subtracting: sign of a term not changed',
    'elim-backsub': 'Back-substituted into a scaled left side with the old constant',
    'elim-not': 'Combination still has both variables',
    'clear-one-side': 'Cleared fractions/decimals on one side only',
    'clear-bracket': 'Bracket not multiplied out correctly when clearing',
    'rearr-sign': 'Sign not changed when moving a term across =',
    'eq-step': 'Gave a later (simplified) step instead of the combined equation',
    'nr-partial': 'Gave x or y instead of the requested expression',
    'nr-swap': 'Evaluated the expression with x and y swapped',
    'pt-exact': 'Rounded decimals instead of exact fractions',
    'sub-dist': 'Substitution: bracket not multiplied out'
  });

  /* ---------------- numbers and LaTeX ---------------- */
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var c = a % b; a = b; b = c; } return a; }
  function lcm(a, b) { a = Math.abs(a); b = Math.abs(b); return a / gcd(a, b) * b; }
  function near(a, b) { return Math.abs(a - b) < 1e-9 * Math.max(1, Math.abs(a), Math.abs(b)); }
  function isInt(v) { return Math.abs(v - Math.round(v)) < 1e-9; }
  function toFr(x) { for (var q = 1; q <= 20000; q++) { var p = Math.round(x * q); if (Math.abs(p / q - x) < 1e-9) return [p, q]; } return [x, 1]; }
  function noDiv(a, b) { a = Math.abs(a); b = Math.abs(b); return a !== b && a % b !== 0 && b % a !== 0; }
  function terminates(v) { var q = toFr(v)[1]; while (q % 2 === 0) q /= 2; while (q % 5 === 0) q /= 5; return q === 1; }
  /* N: a number as LaTeX — integer, short decimal, or fraction (fr = true: fractions for every non-integer) */
  function N(v, fr) {
    if (isInt(v)) return String(Math.round(v));
    var f = toFr(v), s = String(Math.round(v * 1e6) / 1e6);
    if (!fr && terminates(v) && /^-?\d+\.\d{1,3}$/.test(s)) return s;
    return (f[0] < 0 ? '-' : '') + '\\frac{' + Math.abs(f[0]) + '}{' + f[1] + '}';
  }
  function NP(v, fr) { var s = N(v, fr); return v < 0 || !isInt(v) ? (/frac/.test(s) ? '\\left(' + s + '\\right)' : '(' + s + ')') : s; }
  function plain(v) { if (isInt(v)) return String(Math.round(v)); var f = toFr(v); return terminates(v) && String(Math.round(v * 1e6) / 1e6).length < 9 ? String(Math.round(v * 1e6) / 1e6) : f[0] + '/' + f[1]; }
  function lin(cs, vs, fr) {
    var out = '';
    cs.forEach(function (c, i) {
      if (Math.abs(c) < 1e-12) return;
      var v = vs[i] || '', a = Math.abs(c), body = v ? (near(a, 1) ? v : N(a, fr) + v) : N(a, fr);
      out += (c < 0 ? '-' : out ? '+' : '') + body;
    });
    return out || '0';
  }
  function eqT(q, V, fr) { return lin([q[0], q[1]], V, fr) + '=' + N(q[2], fr); }
  function genT(q, V) { return lin([q[0], q[1], -q[2]], [V[0], V[1], '']) + '=0'; }
  function al(s) { var i = s.indexOf('='); return s.slice(0, i) + '&' + s.slice(i); }
  function sysT(a, b, gap) { return '\\begin{aligned}' + al(a) + '\\\\' + (gap ? '[' + gap + ']' : '') + al(b) + '\\end{aligned}'; }
  function ptT(P, fr) { return '(' + N(P[0], fr) + ',\\ ' + N(P[1], fr) + ')'; }
  function solveS(S) {
    var D = S[0][0] * S[1][1] - S[0][1] * S[1][0]; if (Math.abs(D) < 1e-12) return null;
    return [(S[0][2] * S[1][1] - S[0][1] * S[1][2]) / D, (S[0][0] * S[1][2] - S[0][2] * S[1][0]) / D];
  }
  function mk(a, b, P) { return [a, b, a * P[0] + b * P[1]]; }
  function pickNZ(r, a, b) { var v; do { v = r.int(a, b); } while (v === 0); return v; }
  function find(r, fn, fallback) { for (var i = 0; i < 800; i++) { var v = fn(r); if (v) return v; } return fallback; }
  function sgnAdd(v, fr) { return v < 0 ? '-' + N(-v, fr) : '+' + N(v, fr); }
  function ord(V) { return t('(' + V[0] + ',\\ ' + V[1] + ')'); }
  /* which variable to eliminate: the one with the smaller LCM (ties → opposite signs) */
  function chooseE(S) {
    var L0 = lcm(S[0][0], S[1][0]), L1 = lcm(S[0][1], S[1][1]);
    if (L0 !== L1) return L0 < L1 ? 0 : 1;
    return S[0][1] * S[1][1] < 0 ? 1 : 0;
  }
  function multipliers(S, e) { var Lc = lcm(S[0][e], S[1][e]); return [Lc / Math.abs(S[0][e]), Lc / Math.abs(S[1][e])]; }
  function scaled(q, m) { return q.map(function (x) { return x * m; }); }
  function PB(v, fr) { var s = N(v, fr); return /frac/.test(s) ? '\\left(' + s + '\\right)' : '(' + s + ')'; }
  function mulTerm(c, v, first, fr) { // c·(value) for checks and substitutions
    var b = near(c, 1) && v >= 0 && isInt(v) ? N(v) : PB(v, fr), s = near(c, 1) ? b : near(c, -1) ? '-' + b : N(c, fr) + b;
    return (s.charAt(0) === '-' || first ? '' : '+') + s;
  }
  function subT(q, P, fr) { return mulTerm(q[0], P[0], true, fr) + mulTerm(q[1], P[1], false, fr) + '=' + N(q[2], fr); }

  /* ---------------- worked solution by elimination ---------------- */
  function backT(q, e, v, V, fr) { // solve q (A x + B y = C) for variable e, given the other variable's value v
    var f = 1 - e, kv = q[f] * v, uT = lin([q[e]], [V[e]]), parts = [];
    var first = e === 0 ? uT + mulTerm(q[f], v, false, fr) : mulTerm(q[f], v, true, fr) + (q[e] < 0 ? '' : '+') + uT;
    parts.push(first + '=' + N(q[2], fr));
    var p2 = e === 0 ? uT + sgnAdd(kv, fr) + '=' + N(q[2], fr) : N(kv, fr) + (q[e] < 0 ? '' : '+') + uT + '=' + N(q[2], fr);
    if (!near(kv, 0) && p2 !== parts[0]) parts.push(p2);
    if (!near(kv, 0)) parts.push(uT + '=' + N(q[2] - kv, fr));
    if (!near(q[e], 1)) parts.push(V[e] + '=' + N((q[2] - kv) / q[e], fr));
    return parts.join('\\ \\Rightarrow\\ ');
  }
  function combine(S, e, ms) {
    var f = 1 - e, E1 = scaled(S[0], ms[0]), E2 = scaled(S[1], ms[1]), sub = near(E1[e], E2[e]);
    var A = E1, B = E2, swapped = false;
    if (sub && E1[f] - E2[f] < 0) { A = E2; B = E1; swapped = true; }
    var k = sub ? A[f] - B[f] : A[f] + B[f], R = sub ? A[2] - B[2] : A[2] + B[2];
    return { E1: E1, E2: E2, A: A, B: B, sub: sub, k: k, R: R, swapped: swapped, f: f };
  }
  function elimSteps(S, V, e, o) {
    o = o || {}; var fr = o.fr, ms = o.m || multipliers(S, e), c = combine(S, e, ms), f = c.f, L = [];
    if (ms[0] !== 1 && ms[1] !== 1) L.push('To eliminate ' + t(V[e]) + ': the LCM of ' + t(Math.abs(S[0][e])) + ' and ' + t(Math.abs(S[1][e])) + ' is ' + t(lcm(S[0][e], S[1][e])) + '.');
    if (ms[0] !== 1) L.push('Eq. 1 × ' + t(ms[0]) + ' (every term): ' + t(eqT(c.E1, V, fr)));
    if (ms[1] !== 1) L.push('Eq. 2 × ' + t(ms[1]) + ' (every term): ' + t(eqT(c.E2, V, fr)));
    var lhs = '(' + lin([c.A[0], c.A[1]], V, fr) + ')' + (c.sub ? '-' : '+') + '(' + lin([c.B[0], c.B[1]], V, fr) + ')';
    var rhs = N(c.A[2], fr) + (c.sub ? '-' : '+') + NP(c.B[2], fr);
    var v = c.R / c.k;
    L.push((c.sub ? 'The ' + t(V[e]) + '-terms match, so <b>subtract</b>' + (c.swapped ? ' (second − first)' : '') : 'The ' + t(V[e]) + '-terms are opposites, so <b>add</b>') + ':<br>' +
      t(lhs + '=' + rhs + '\\ \\Rightarrow\\ ' + lin([c.k], [V[f]], fr) + '=' + N(c.R, fr) + (near(c.k, 1) ? '' : '\\ \\Rightarrow\\ ' + V[f] + '=' + N(v, fr))));
    var w = o.back != null ? o.back : Math.abs(S[1][e]) < Math.abs(S[0][e]) ? 1 : 0, P = [];
    P[f] = v; P[e] = (S[w][2] - S[w][f] * v) / S[w][e];
    L.push('Substitute into Eq. ' + (w + 1) + ': ' + t(backT(S[w], e, v, V, fr)));
    L.push('Check: ' + t(subT(S[0], P, fr) + '\\ \\checkmark') + ' and ' + t(subT(S[1], P, fr) + '\\ \\checkmark'));
    L.push('Solution: <b>' + t(ptT(P, fr)) + '</b>');
    return L.join('<br>');
  }

  /* ---------------- classic slips → the wrong pair they produce ---------------- */
  function slips(S, V, eFirst, only) {
    var out = [], P = solveS(S);
    function add(pt, code, hint) {
      if (!isFinite(pt[0]) || !isFinite(pt[1])) return;
      if (near(pt[0], P[0]) && near(pt[1], P[1])) return;
      if (near(pt[0], P[1]) && near(pt[1], P[0])) return;
      if (out.some(function (w) { return near(w.is[0], pt[0]) && near(w.is[1], pt[1]); })) return;
      out.push({ is: pt, code: code, hint: hint });
    }
    (only ? [eFirst] : eFirst === 1 ? [1, 0] : [0, 1]).forEach(function (e) {
      var f = 1 - e; if (!S[0][e] || !S[1][e] || !isInt(S[0][e]) || !isInt(S[1][e])) return;
      var ms = multipliers(S, e), E1 = scaled(S[0], ms[0]), E2 = scaled(S[1], ms[1]), sub = near(E1[e], E2[e]), s = sub ? -1 : 1;
      var k = E1[f] + s * E2[f]; if (near(k, 0)) return;
      var R = E1[2] + s * E2[2], v = R / k;
      function push(vv, code, hint) { [0, 1].forEach(function (w) { var pt = []; pt[f] = vv; pt[e] = (S[w][2] - S[w][f] * vv) / S[w][e]; add(pt, code, hint); }); }
      [0, 1].forEach(function (w) {
        var m = ms[w]; if (m === 1) return; var q = S[w], pt = []; pt[f] = v; pt[e] = (q[2] - m * q[f] * v) / (m * q[e]);
        add(pt, 'elim-backsub', 'Your ' + t(V[f]) + '-value is right. To find ' + t(V[e]) + ', substitute into an <b>original</b> equation — Eq. ' + (w + 1) + ' × ' + t(m) + ' is ' + t(eqT(scaled(q, m), V)) + ', so its left side goes with ' + t(N(m * q[2])) + ', not ' + t(N(q[2])) + '.');
      });
      if (ms[0] > 1 || ms[1] > 1) {
        var w0 = ms[0] > 1 ? 0 : 1, m0 = ms[w0];
        push((S[0][2] + s * S[1][2]) / k, 'elim-const', 'Check the scaling: multiplying an equation means multiplying <b>every</b> term — the constant too. Eq. ' + (w0 + 1) + ' × ' + t(m0) + ' has right side ' + t(m0 + '\\times' + NP(S[w0][2]) + '=' + N(m0 * S[w0][2])) + '.');
      }
      push((E1[2] - s * E2[2]) / k, 'elim-rhs', sub ? 'When you subtract the equations, subtract the right sides too — sign and all: ' + t(N(E1[2]) + '-' + NP(E2[2]) + '=' + N(E1[2] - E2[2])) + '.' : 'You added the left sides, so add the right sides too: ' + t(N(E1[2]) + '+' + NP(E2[2]) + '=' + N(E1[2] + E2[2])) + '.');
      if (sub && (f === 1 || E2[f] < 0)) { var k2 = E1[f] + E2[f]; if (!near(k2, 0)) push(R / k2, 'elim-sub-sign', 'Subtracting changes the sign of <b>every</b> term being subtracted: ' + t(lin([E1[f]], [V[f]]) + '-(' + (E2[f] > 0 ? '+' : '') + lin([E2[f]], [V[f]]) + ')=' + lin([E1[f] - E2[f]], [V[f]])) + '. Write it as a bracketed difference.'); }
    });
    return out;
  }
  /* other systems a classic slip leads to: [{ S, code, hint }] → wrong pairs */
  function altSlips(S, alts) {
    var P = solveS(S), out = [];
    (alts || []).forEach(function (a) { var Q = solveS(a.S); if (Q && !(near(Q[0], P[0]) && near(Q[1], P[1])) && !(near(Q[0], P[1]) && near(Q[1], P[0]))) out.push({ is: Q, code: a.code, hint: a.hint }); });
    return out;
  }
  function clearAlts(S, raw, d, labels) { // fractions/decimals cleared on the left side only (one equation at a time)
    var out = [];
    [0, 1].forEach(function (i) {
      if (d[i] === 1) return; var Q = S.map(function (q) { return q.slice(); });
      Q[i] = [raw[i][0] * d[i], raw[i][1] * d[i], raw[i][2]];
      out.push({ S: Q, code: 'clear-one-side', hint: 'When you clear ' + (labels || 'the fractions') + ' in Eq. ' + (i + 1) + ', multiply <b>both sides</b> by ' + t(d[i]) + ' — the right side becomes ' + t(d[i] + '\\times' + NP(raw[i][2], true) + '=' + N(d[i] * raw[i][2], true)) + '.' });
    });
    return out;
  }

  /* ---------------- part makers ---------------- */
  var H_ELIM = ['Line up one variable: its coefficients must be <b>equal</b> (then subtract) or <b>opposite</b> (then add). Scale first if needed — every term, the constant too.', 'Find one variable, substitute it into an original equation for the other, then check the pair in <b>both</b> equations.'];
  function ptPrompt(V) { return 'Give the solution as an ordered pair' + (V[0] === 'x' ? '.' : ' ' + ord(V) + '.'); }
  /* o: { prompt, S (Ax + By = C), V, e, m, back, pre, post, alts, wrong, fr, eqs, hints, text, sol } */
  function solveP(o) {
    var V = o.V || ['x', 'y'], P = solveS(o.S), e = o.e != null ? o.e : chooseE(o.S);
    var wr = (o.wrong || []).concat(altSlips(o.S, o.alts), o.noSlips ? [] : slips(o.S, V, e, o.only));
    var frac = !terminates(P[0]) || !terminates(P[1]);
    var target = P.map(function (v) { return isInt(v) ? Math.round(v) : toFr(v); });
    var sol = o.sol || ((o.pre ? o.pre + '<br>' : '') + elimSteps(o.S, V, e, { m: o.m, back: o.back, fr: o.fr || frac }) + (o.post ? '<br>' + o.post : ''));
    var p = K.P.point(o.prompt, target, { vars: V, system: o.S.map(function (q) { return [q[0], q[1], -q[2]]; }), wrong: wr }, sol, o.hints || H_ELIM, o.text);
    if (frac) {
      var chk = p.check;
      p.check = function (resp) {
        var rp = Ln.readPoint(resp, V);
        if (rp && rp.kind === 'pt' && rp.p.some(function (q) { return !q.rat; }) && Math.abs(rp.p[0].v - P[0]) < 0.006 && Math.abs(rp.p[1].v - P[1]) < 0.006 && !(near(rp.p[0].v, P[0]) && near(rp.p[1].v, P[1])))
          return form('pt-exact', 'Close — but give <b>exact</b> values as fractions, not rounded decimals.');
        return chk(resp);
      };
    }
    p.answer = t(ptT(P, o.fr || frac)) + (V[0] !== 'x' ? ', so ' + t(V[0] + '=' + N(P[0], o.fr || frac) + ',\\ ' + V[1] + '=' + N(P[1], o.fr || frac)) : '');
    p.bad = wr.slice(0, 5).map(function (w) { return '(' + plain(w.is[0]) + ',' + plain(w.is[1]) + ')'; });
    if (!near(P[0], P[1])) p.bad.push('(' + plain(P[1]) + ',' + plain(P[0]) + ')');
    p.good = [V[0] + '=' + plain(P[0]) + ', ' + V[1] + '=' + plain(P[1]), '(' + plain(P[0]) + ', ' + plain(P[1]) + ')'];
    p._eqs = o.eqs; p._sol = P; p._V = V;
    return p;
  }
  function special(o) { // o: { prompt, target 'none'|'inf', S, V, sol, hints, text, eqs }
    var p = K.P.point(o.prompt, o.target, { vars: o.V || ['x', 'y'] }, o.sol, o.hints, o.text);
    p.bad = ['(0,0)', o.target === 'none' ? 'infinitely many' : 'no solution'];
    p.good = [o.target === 'none' ? 'no solution' : 'infinitely many'];
    p._eqs = o.eqs; p._special = o.target; p._V = o.V || ['x', 'y'];
    return p;
  }
  /* an equation reached in one step (e.g. "the equation after adding"): T = [A, B, C] for A x + B y = C;
     accepted exactly or with both sides negated; another multiple → nudge; o.wrong: [{ is: [A, B, C], code, hint }] */
  function stepEq(T, o) {
    o = o || {}; var V = o.vars || ['x', 'y'];
    function sc(s, w, k) { return near(s[0], k * w[0]) && near(s[1], k * w[1]) && near(s[2], k * w[2]); }
    function prop(s, w) { return near(s[0] * w[1], s[1] * w[0]) && near(s[0] * w[2], s[2] * w[0]) && near(s[1] * w[2], s[2] * w[1]); }
    return function (resp) {
      if (!String(resp == null ? '' : resp).trim()) return form('empty', 'Type the equation first.');
      var r = Ln.read(resp, V);
      if (!r.ok) return form('eq-unreadable', r.why === 'vars' ? 'Use the letters ' + t(V[0]) + ' and ' + t(V[1]) + ' from the question.' : r.why === 'no-eq' ? 'Write an equation, with an equals sign.' : 'I can’t read that equation — check the signs and brackets.');
      var s = [r.a, r.b, -r.c];
      if (sc(s, T, 1) || sc(s, T, -1)) return ok();
      var ws = o.wrong || [];
      for (var i = 0; i < ws.length; i++) if (sc(s, ws[i].is, 1) || sc(s, ws[i].is, -1)) return wrong(ws[i].code, ws[i].hint);
      if (prop(s, T)) return form('eq-step', o.stepHint || 'That is equivalent — but give the equation exactly as the step produces it (before dividing or simplifying).');
      if ((T[0] === 0 || T[1] === 0) && !near(s[0], 0) && !near(s[1], 0)) return wrong('elim-not', 'Your equation still has <b>both</b> variables. Equal coefficients are removed by subtracting; opposite ones by adding.');
      return wrong('eq', null);
    };
  }
  function stepPart(prompt, T, o, sol, hints, text) {
    o = o || {}; var V = o.vars || ['x', 'y'], key = eqT(T, V);
    var p = K.P.math(prompt, stepEq(T, o), key, sol, hints, text, { keys: 'eq', vars: V, placeholder: 'e.g. ' + (o.placeholder || '5x = 15') });
    p.bad = (o.wrong || []).map(function (w) { return eqT(w.is, V); });
    p.good = [eqT(T.map(function (x) { return -x; }), V)];
    return p;
  }
  function mcP(r, prompt, opts, sol, hints, text, keepOrder) { return K.P.mc(r, prompt, opts, sol, hints, text, keepOrder); }
  function nrP(prompt, ans, diag, sol, hints, text) { return K.P.nr(prompt, ans, diag, sol, hints, text); }
  function comboDiag(P, c) {
    return function (v) {
      if (near(v, P[0]) || near(v, P[1])) return { code: 'nr-partial', hint: 'That is one of the values. The question asks for ' + t(lin(c, ['x', 'y'])) + ': substitute both values into it.' };
      if (near(v, c[0] * P[1] + c[1] * P[0])) return { code: 'nr-swap', hint: 'Check which value is ' + t('x') + ' and which is ' + t('y') + ' before you substitute.' };
      return null;
    };
  }

  /* ---------------- generators for the system types ---------------- */
  function sysBothScaled(r, rng, signs, P) { // both variables need two multiplications (no coefficient divides its partner)
    return find(r, function (r) {
      var a1 = r.int(rng[0], rng[1]), b1 = r.int(rng[0], rng[1]), a2 = r.int(rng[0], rng[1]), b2 = r.int(rng[0], rng[1]);
      var c = [a1 * signs[0], b1 * signs[1], a2 * signs[2], b2 * signs[3]];
      if (!noDiv(a1, a2) || !noDiv(b1, b2) || near(c[0] * c[3] - c[1] * c[2], 0)) return null;
      var Q = P(r); var S = [mk(c[0], c[1], Q), mk(c[2], c[3], Q)];
      return S[0][2] && S[1][2] ? S : null;
    });
  }
  function rndSign(r) { return r.chance(0.5) ? 1 : -1; }

  /* methods to choose between (Extra 10) */
  function methodMC(r, kind, sh) {
    var S = sh.S, a = sh.a, eqs = sh.eqs, opts;
    var y1 = '\\(y\\)', x1 = '\\(x\\)';
    if (kind === 'iso') opts = [
      { html: '<b>Substitution</b>: ' + y1 + ' is already isolated in the first equation, so it can go straight into the second.', right: true },
      { html: '<b>Elimination</b>: the ' + y1 + '-coefficients are already equal or opposite.', why: 'Rearranged, the first equation is ' + t(lin([-a.m, 1], ['x', 'y']) + '=' + N(a.b)) + ': its ' + y1 + '-coefficient is ' + t(1) + ' and the other is ' + t(a.B) + ' — not equal or opposite.' },
      { html: '<b>Elimination</b>: no variable has a coefficient of ' + t('1') + ' or ' + t('-1') + '.', why: 'Look again: ' + y1 + ' in the first equation has coefficient ' + t(1) + ' — it is already isolated.' },
      { html: '<b>Substitution</b>: the ' + x1 + '-coefficients are equal.', why: 'They are ' + t(a.m) + ' and ' + t(a.A) + '. Substitution is quick here for a different reason: ' + y1 + ' is already isolated.' }];
    else if (kind === 'match') opts = [
      { html: '<b>Elimination</b>: ' + x1 + ' already has matching coefficients (' + t(S[0][0]) + ' and ' + t(S[1][0]) + '), so one subtraction removes it with no scaling.', right: true },
      { html: '<b>Substitution</b>: a variable has coefficient ' + t('1') + '.', why: 'No coefficient here is ' + t('1') + ' or ' + t('-1') + '; isolating any variable brings in fractions.' },
      { html: '<b>Elimination</b>: the ' + y1 + '-coefficients are opposites, so add.', why: t(S[0][1]) + ' and ' + t(S[1][1]) + ' are not opposites. It is the ' + x1 + '-coefficients that already match.' },
      { html: '<b>Substitution</b>: ' + y1 + ' is already isolated.', why: 'Neither equation is solved for a variable.' }];
    else if (kind === 'one') opts = [
      { html: '<b>Substitution</b>: ' + x1 + ' has coefficient ' + t('1') + ' in the first equation, so ' + t('x=' + lin([-S[0][1], S[0][2]], ['y', ''])) + ' comes with no fractions.', right: true },
      { html: '<b>Elimination</b>: the ' + x1 + '-coefficients already match.', why: t('1') + ' and ' + t(S[1][0]) + ' don’t match yet (elimination would need Eq. 1 × ' + t(S[1][0]) + ' first — a close second choice).' },
      { html: '<b>Substitution</b>: ' + y1 + ' is already isolated.', why: 'Neither equation is solved for ' + y1 + ' — but one variable is very easy to isolate. Which?' },
      { html: '<b>Elimination</b>: no variable has a coefficient of ' + t('1') + ' or ' + t('-1') + '.', why: 'Look at ' + x1 + ' in the first equation.' }];
    else { var e = chooseE(S), ms = multipliers(S, e), vn = ['x', 'y'][e]; opts = [
      { html: '<b>Elimination</b>: no variable has coefficient ' + t('1') + ' or ' + t('-1') + ', so isolating one brings in fractions; Eq. 1 × ' + t(ms[0]) + ' and Eq. 2 × ' + t(ms[1]) + ' line up ' + t(vn) + ' with integers.', right: true },
      { html: '<b>Substitution</b>: ' + x1 + ' has coefficient ' + t('1') + ' in one equation.', why: 'Check the coefficients: ' + t(S[0][0]) + ' and ' + t(S[1][0]) + '. Isolating any variable here means dividing.' },
      { html: '<b>Elimination</b>: the ' + x1 + '-coefficients already match, so no scaling is needed.', why: t(S[0][0]) + ' and ' + t(S[1][0]) + ' don’t match yet — both equations need scaling. Elimination is still the better choice, but for a different reason.' },
      { html: '<b>Substitution</b>: ' + y1 + ' is already isolated.', why: 'Neither equation is solved for a variable.' }]; }
    var right = opts[0].html.replace(/<[^>]+>/g, '');
    return mcP(r, 'Which method would you use for ' + t(sysT(eqs[0], eqs[1])) + ', and why? (Don’t solve it.)', opts,
      'Look before solving: an isolated variable (or a coefficient of ' + t('1') + ' / ' + t('-1') + ') points to substitution; equal or opposite coefficients — or no coefficient of ' + t('\\pm1') + ' at all — point to elimination.<br>Best choice: ' + opts[0].html + '.',
      ['Is a variable already isolated, or does one have coefficient ' + t('1') + ' or ' + t('-1') + '? Are any coefficients already equal or opposite?'], 'method choice (' + kind + ')');
  }
  function methodSys(r, kind) {
    var S, a = {}, eqs;
    if (kind === 'iso') {
      var d = find(r, function (r) { var m = r.int(2, 5), A = r.int(2, 5), B = r.int(2, 4), x0 = r.int(1, 5), b = pickNZ(r, -9, 9), y0 = m * x0 + b; if (Math.abs(y0) > 12) return null; return { m: m, A: A, B: B, b: b, x0: x0, y0: y0 }; }, { m: 4, A: 3, B: 2, b: -9, x0: 3, y0: 3 });
      a = d; S = [[-d.m, 1, d.b], mk(d.A, d.B, [d.x0, d.y0])]; eqs = ['y=' + lin([d.m, d.b], ['x', '']), eqT(S[1], ['x', 'y'])];
    } else if (kind === 'match') {
      S = find(r, function (r) { var A = r.int(3, 9), b1 = r.int(2, 6), b2 = -r.int(2, 5), Q = [r.int(1, 5), r.int(1, 6)]; if (b1 === -b2 || A % b1 === 0) return null; return [mk(A, b1, Q), mk(A, b2, Q)]; }, [[7, 5, 41], [7, -3, 9]]);
      eqs = [eqT(S[0], ['x', 'y']), eqT(S[1], ['x', 'y'])];
    } else if (kind === 'one') {
      S = find(r, function (r) { var b1 = -r.int(2, 5), a2 = r.int(2, 5), b2 = r.int(2, 6), Q = [r.int(1, 7), pickNZ(r, -3, 3)]; if (!noDiv(b1, b2)) return null; var S = [mk(1, b1, Q), mk(a2, b2, Q)]; return S[0][2] ? S : null; }, [[1, -3, 7], [4, 5, 11]]);
      eqs = [eqT(S[0], ['x', 'y']), eqT(S[1], ['x', 'y'])];
    } else {
      S = sysBothScaled(r, [2, 9], [1, 1, 1, -1], function (r) { return [r.int(1, 5), pickNZ(r, -5, 4)]; }) || [[6, 5, -8], [9, -4, 34]];
      eqs = [eqT(S[0], ['x', 'y']), eqT(S[1], ['x', 'y'])];
    }
    return { S: S, a: a, eqs: eqs };
  }

  /* explanation of a vanished-variables result */
  function vanishMC(r, kind, statement, extra) {
    var none = kind === 'none';
    var opts = [
      { html: none ? '<b>No solution</b>: the statement is false for every ' + t('(x,\\ y)') + ', so the lines are parallel and distinct — they never meet.' : '<b>Infinitely many solutions</b>: the statement is true for every ' + t('(x,\\ y)') + ' — the two equations describe the same line.', right: true },
      { html: none ? '<b>Infinitely many solutions</b>: the two equations are the same line.' : '<b>No solution</b>: the lines are parallel and never meet.', code: 'none-inf', why: none ? 'The same line would leave a <b>true</b> statement such as ' + t('0=0') + '. ' + t(statement) + ' is false, so no point satisfies both equations.' : 'Parallel lines leave a <b>false</b> statement such as ' + t('0=5') + '. ' + t(statement) + ' is always true.' },
      { html: '<b>One solution</b>: ' + (none ? t('x=' + statement.split('=')[1]) : t('(0,\\ 0)')) + '.', why: none ? 'Both variables vanished — nothing is left to solve for. A false number statement means no point works.' : 'Test ' + t('(0,\\ 0)') + ' in the first equation. A true statement with no variables left means every point of the line works.' },
      { html: none ? 'There must be an arithmetic slip: every system has at least one solution.' : 'Elimination doesn’t work for this system; you have to use substitution.', why: none ? 'Parallel lines never cross, so some systems have no solution at all.' : 'Substitution would also end in a true statement like ' + t('0=0') + '. The result <i>is</i> the answer.' }];
    return mcP(r, 'Elimination on this system removes both variables and leaves ' + t(statement) + '. What does that mean?', opts,
      (extra || '') + (none ? t(statement) + ' is <b>false</b>: no ' + t('(x,\\ y)') + ' satisfies both equations, so there is <b>no solution</b> — the lines have the same slope but different intercepts (parallel).' : t(statement) + ' is <b>true</b> whatever ' + t('x') + ' and ' + t('y') + ' are: the equations are multiples of each other — the <b>same line</b> — so there are <b>infinitely many solutions</b>.'),
      ['True statement (like ' + t('0=0') + ') → same line. False statement (like ' + t('0=7') + ') → parallel lines.'], 'meaning of ' + statement);
  }

  /* ---------------- shared data for multi-part questions ---------------- */
  function q6shared(r) {
    return find(r, function (r) {
      var b = r.int(1, 3), a2 = r.int(2, 5), P = [r.int(2, 7), pickNZ(r, -3, 4)], c = P[0] - b * P[1];
      if (!c) return null; var S = [[1, -b, c], mk(a2, 2 * b, P)];
      return S[1][2] ? { S: S, b: b, c: c, a2: a2, P: P } : null;
    }, { S: [[1, -2, 3], [3, 4, 19]], b: 2, c: 3, a2: 3, P: [5, 1] });
  }
  function q7shared(r) {
    return find(r, function (r) {
      var A = r.int(5, 9), b1 = r.int(2, 4), b2 = -r.int(2, 5), P = [r.int(2, 8), -r.int(2, 10)];
      if (b1 === -b2 || gcd(A, b1) !== 1) return null; var S = [mk(A, b1, P), mk(A, b2, P)];
      return S[0][2] && S[1][2] && S[0][2] !== S[1][2] ? { S: S, A: A, b1: b1, b2: b2, P: P } : null;
    }, { S: [[9, 2, 34], [9, -4, 94]], A: 9, b1: 2, b2: -4, P: [6, -10] });
  }
  function subsSol(S, V, w, P, fr) { // substitution after isolating x (coefficient 1 or not) from equation w
    var o = 1 - w, q = S[w], X = V[0], Y = V[1];
    var xe = near(q[0], 1) ? lin([-q[1], q[2]], [Y, '']) : '\\frac{' + lin([q[2], -q[1]], ['', Y]) + '}{' + q[0] + '}';
    var s = S[o], ky = s[0] * (-q[1] / q[0]) + s[1], kc = s[0] * q[2] / q[0];
    return 'From Eq. ' + (w + 1) + ': ' + t(X + '=' + xe) + '.<br>Substitute into Eq. ' + (o + 1) + ': ' + t(N(s[0]) + '\\left(' + xe + '\\right)' + (s[1] < 0 ? '' : '+') + lin([s[1]], [Y]) + '=' + N(s[2])) +
      '<br>' + t(lin([ky, kc], [Y, ''], fr) + '=' + N(s[2]) + '\\ \\Rightarrow\\ ' + lin([ky], [Y], fr) + '=' + N(s[2] - kc, fr) + '\\ \\Rightarrow\\ ' + Y + '=' + N(P[1])) +
      '<br>' + t(X + '=' + (near(q[0], 1) ? mulTerm(-q[1], P[1], true) + sgnAdd(q[2]) : '\\frac{' + N(q[2]) + mulTerm(-q[1], P[1], false) + '}{' + q[0] + '}') + '=' + N(P[0])) +
      '<br>Solution: <b>' + t(ptT(P)) + '</b> — the same as by elimination.';
  }

  /* ---------------- extra practice helpers ---------------- */
  function E2(S, V) { return [eqT(S[0], V || ['x', 'y']), eqT(S[1], V || ['x', 'y'])]; }
  function sysP(e) { return t(sysT(e[0], e[1])); }
  function dfr(v) { return N(v, true).replace(/\\frac/g, '\\dfrac'); }
  function nz(S) { return S[0][2] !== 0 && S[1][2] !== 0; }
  function ep1shared(r) {
    var make = {
      addY: function (r) { return find(r, function (r) { var a1 = r.int(3, 8), a2 = r.int(2, 7), b = r.int(2, 6); if (a1 === a2) return null; var P = [r.int(1, 6), -r.int(1, 5)], S = [mk(a1, b, P), mk(a2, -b, P)]; return nz(S) ? { S: S, V: ['x', 'y'], e: 1, op: 'add' } : null; }); },
      subX: function (r) { return find(r, function (r) { var A = r.int(2, 7), b1 = -r.int(2, 6), b2 = r.int(1, 5), P = [-r.int(1, 5), r.int(1, 6)], S = [mk(A, b1, P), mk(A, b2, P)]; return nz(S) ? { S: S, V: ['x', 'y'], e: 0, op: 'sub' } : null; }); },
      addA: function (r) { return find(r, function (r) { var A = r.int(3, 9), b1 = r.int(1, 4), b2 = r.int(3, 8); if (b1 === b2) return null; var P = [r.int(1, 5), -r.int(1, 5)], S = [mk(-A, b1, P), mk(A, b2, P)]; return nz(S) ? { S: S, V: ['a', 'b'], e: 0, op: 'add' } : null; }); },
      subN: function (r) { return find(r, function (r) { var a1 = r.int(5, 12), a2 = -r.int(2, 6), B = -r.int(2, 7), P = [r.int(1, 5), -r.int(1, 4)], S = [mk(a1, B, P), mk(a2, B, P)]; return nz(S) ? { S: S, V: ['m', 'n'], e: 1, op: 'sub' } : null; }); }
    };
    return { sys: r.shuffle(['addY', 'subX', 'addA', 'subN']).map(function (k) { return make[k](r); }) };
  }
  function ep1solve(sh, i) {
    var s = sh.sys[i], e = E2(s.S, s.V), v = s.V[s.e];
    return solveP({ only: true, prompt: '(' + 'abcd'.charAt(i) + ') ' + sysP(e) + '<br>' + ptPrompt(s.V), S: s.S, V: s.V, e: s.e, eqs: e, text: s.op + ': ' + e.join(', '),
      hints: ['The ' + t(v) + '-coefficients are ' + t(s.S[0][s.e]) + ' and ' + t(s.S[1][s.e]) + ': ' + (s.op === 'add' ? 'opposite, so <b>add</b>.' : 'equal, so <b>subtract</b> (every sign in the second bracket changes).'), H_ELIM[1]] });
  }
  function ep2shared(r) {
    return find(r, function (r) {
      var a1 = r.int(2, 5), a2 = r.int(a1 + 2, 9), b = r.int(2, 6), c1 = r.int(-20, 30), c2 = r.int(-20, 30);
      if ((c1 - c2) % (a1 - a2) || (c1 + c2) % (a1 + a2)) return null;
      var xa = (c1 - c2) / (a1 - a2), xb = (c1 + c2) / (a1 + a2); if ((c1 - a1 * xa) % b || (c1 - a1 * xb) % b) return null;
      var ya = (c1 - a1 * xa) / b, yb = (c1 - a1 * xb) / b; if ([xa, ya, xb, yb].some(function (v) { return Math.abs(v) > 10; }) || (xa === xb && ya === yb) || !c1 || !c2) return null;
      return { a1: a1, a2: a2, b: b, c1: c1, c2: c2, Sa: [[a1, b, c1], [a2, b, c2]], Sb: [[a1, b, c1], [a2, -b, c2]], Pa: [xa, ya], Pb: [xb, yb] };
    }, { a1: 3, a2: 7, b: 5, c1: 16, c2: 4, Sa: [[3, 5, 16], [7, 5, 4]], Sb: [[3, 5, 16], [7, -5, 4]], Pa: [-3, 5], Pb: [2, 2] });
  }
  /* "which variable is cheaper to eliminate" */
  function scaleDesc(S, e) {
    var a1 = S[0][e], a2 = S[1][e];
    if (Math.abs(a1) === Math.abs(a2)) return 'no scaling — the coefficients are already ' + (a1 === a2 ? 'equal, so just subtract' : 'opposite, so just add');
    var ms = multipliers(S, e);
    return ms[0] === 1 ? 'Eq. 2 × ' + t(ms[1]) + ' only' : ms[1] === 1 ? 'Eq. 1 × ' + t(ms[0]) + ' only' : 'Eq. 1 × ' + t(ms[0]) + ' and Eq. 2 × ' + t(ms[1]);
  }
  function scaleCount(S, e) { if (Math.abs(S[0][e]) === Math.abs(S[1][e])) return 0; return multipliers(S, e).filter(function (m) { return m !== 1; }).length; }
  function cheapSys(r, kind, ci) {
    return find(r, function (r) {
      var c = r.int(2, 4), k = r.int(2, 3), o1 = r.int(2, 7), o2 = r.int(2, 7); if (!noDiv(o1, o2)) return null;
      var cheap = kind === 'eq' ? [c + r.int(1, 4), 0] : r.chance(0.5) ? [k * c, c] : [c, k * c]; if (kind === 'eq') cheap[1] = cheap[0];
      if (kind !== 'eq' && r.chance(0.5)) cheap[1] = -cheap[1];
      var other = [o1 * rndSign(r), o2 * rndSign(r)], A = [], B = [];
      A[ci] = cheap[0]; A[1 - ci] = other[0]; B[ci] = cheap[1]; B[1 - ci] = other[1];
      if (near(A[0] * B[1] - A[1] * B[0], 0)) return null;
      var P = [pickNZ(r, -4, 5), pickNZ(r, -4, 5)], S = [mk(A[0], A[1], P), mk(B[0], B[1], P)];
      return nz(S) ? S : null;
    });
  }
  function cheapMC(r, S, V, ci) {
    var v = V[ci], w = V[1 - ci], cv = scaleCount(S, ci), cw = scaleCount(S, 1 - ci), a1 = S[0][ci], a2 = S[1][ci];
    var w2 = Math.abs(a1) === Math.abs(a2) ? { html: 'Eliminate ' + t(v) + ': Eq. 1 × ' + t('(-1)') + ' first, then add.', why: 'That works, but it is an extra step: equal coefficients can be subtracted straight away.' }
      : { html: 'Eliminate ' + t(v) + ': Eq. 1 × ' + t(Math.abs(a2)) + ' and Eq. 2 × ' + t(Math.abs(a1)) + '.', why: 'That lines up ' + t(v) + ' too, but it isn’t the cheapest: ' + t(Math.min(Math.abs(a1), Math.abs(a2))) + ' already divides into ' + t(Math.max(Math.abs(a1), Math.abs(a2))) + ', so one multiplication is enough.' };
    return mcP(r, 'For ' + sysP(E2(S, V)) + ', which variable is cheaper to eliminate, and with which multipliers? (Don’t solve.)', [
      { html: 'Eliminate ' + t(v) + ': ' + scaleDesc(S, ci) + '.', right: true },
      { html: 'Eliminate ' + t(w) + ': ' + scaleDesc(S, 1 - ci) + '.', why: 'That works, but count the multiplications: ' + t(w) + ' needs ' + cw + ', ' + t(v) + ' needs ' + (cv === 0 ? 'none' : cv) + '.' },
      w2,
      { html: 'Either one — both need the same amount of work.', why: 'Count: ' + t(v) + ' needs ' + cv + ' multiplication' + (cv === 1 ? '' : 's') + ', ' + t(w) + ' needs ' + cw + '.' }],
      t(v) + ': coefficients ' + t(a1) + ' and ' + t(a2) + ' → ' + scaleDesc(S, ci) + '.<br>' + t(w) + ': coefficients ' + t(S[0][1 - ci]) + ' and ' + t(S[1][1 - ci]) + ', LCM ' + t(lcm(S[0][1 - ci], S[1][1 - ci])) + ' → ' + scaleDesc(S, 1 - ci) + '.<br><b>' + t(v) + ' is cheaper</b>' + (cv === 0 ? ' — it costs nothing.' : ' — one multiplication instead of two.'),
      ['For each variable, find the LCM of its two coefficients. If one coefficient already divides the other (or they are equal or opposite), little or no scaling is needed.'], 'cheaper variable: ' + E2(S, V).join(', '));
  }
  function vanishStatement(S) { // combine to remove x; returns the constant z in 0 = z
    var ms = multipliers(S, 0), E1 = scaled(S[0], ms[0]), E2b = scaled(S[1], ms[1]), sub = near(E1[0], E2b[0]);
    return { z: sub ? E1[2] - E2b[2] : E1[2] + E2b[2], ms: ms, E1: E1, E2: E2b, sub: sub };
  }
  function vanishSol(S, V, kind) {
    var w = vanishStatement(S), z = w.z;
    return 'To eliminate ' + t('x') + ': ' + (w.ms[0] !== 1 ? 'Eq. 1 × ' + t(w.ms[0]) + ': ' + t(eqT(w.E1, V)) + '; ' : '') + (w.ms[1] !== 1 ? 'Eq. 2 × ' + t(w.ms[1]) + ': ' + t(eqT(w.E2, V)) + '. ' : '') +
      (w.sub ? 'Subtract' : 'Add') + ': ' + t('0=' + N(z)) + ', which is <b>' + (kind === 'none' ? 'false' : 'true') + '</b>.<br>' +
      (kind === 'none' ? '<b>No solution.</b> Both lines have slope ' + t(N(-S[0][0] / S[0][1], true)) + ' but different ' + t('y') + '-intercepts, so they are parallel and distinct.' : '<b>Infinitely many solutions.</b> The equations are multiples of each other: they describe the same line.');
  }

  HW.defineLesson({
    id: 'u8l3', unit: 8, num: '3', title: 'Combining Equations: The Elimination Method', outcome: 'RF9',
    blurb: 'Add or subtract two equations to remove a variable — directly, after scaling one equation, or after scaling both — then prepare messier systems (general form, fractions, decimals) and read the special cases.',
    questions: [
      /* ---------------- 1. adding ---------------- */
      { num: '1', section: 'Part A — Adding or subtracting directly', stem: 'Solve each system by <b>adding</b> the two equations, then verify the solution satisfies both equations.', parts: [
        { id: '1a', sub: 'a', level: 'BEG', make: function (r) {
          var S = find(r, function (r) { var a1 = r.int(2, 6), a2 = r.int(2, 7), b = r.int(2, 6); if (a1 === a2) return null; var P = [r.int(2, 8), r.int(1, 6)]; return [mk(a1, b, P), mk(a2, -b, P)]; });
          var e = [eqT(S[0], ['x', 'y']), eqT(S[1], ['x', 'y'])];
          return solveP({ only: true, prompt: t(sysT(e[0], e[1])) + '<br>' + ptPrompt(['x', 'y']), S: S, e: 1, eqs: e, text: 'add: ' + e.join(', '), hints: ['The ' + t('y') + '-terms are opposites: add the left sides and add the right sides, and ' + t('y') + ' disappears.', H_ELIM[1]] });
        } },
        { id: '1b', sub: 'b', level: 'BEG', make: function (r) {
          var S = find(r, function (r) { var a2 = r.int(2, 5), b = r.int(2, 6), P = [r.int(2, 8), -r.int(1, 6)]; var S = [mk(1, b, P), mk(a2, -b, P)]; return S[0][2] && S[1][2] ? S : null; });
          var e = [eqT(S[0], ['x', 'y']), eqT(S[1], ['x', 'y'])];
          return solveP({ only: true, prompt: t(sysT(e[0], e[1])) + '<br>' + ptPrompt(['x', 'y']), S: S, e: 1, eqs: e, text: 'add: ' + e.join(', '), hints: ['The ' + t('y') + '-terms are opposites, so adding removes ' + t('y') + '. Watch the signs when you add the right sides.', H_ELIM[1]] });
        } },
        { id: '1c', sub: 'c', level: 'BEG', make: function (r) {
          var S = find(r, function (r) { var b1 = r.int(1, 4), b2 = r.int(2, 6); if (b1 === b2) return null; var P = [pickNZ(r, -6, 6), -r.int(1, 6)]; var S = [mk(1, b1, P), mk(-1, b2, P)]; return S[0][2] && S[1][2] ? S : null; });
          var e = [eqT(S[0], ['x', 'y']), eqT(S[1], ['x', 'y'])];
          return solveP({ only: true, prompt: t(sysT(e[0], e[1])) + '<br>' + ptPrompt(['x', 'y']), S: S, e: 0, eqs: e, text: 'add: ' + e.join(', '), hints: ['This time the ' + t('x') + '-terms are opposites (' + t('x') + ' and ' + t('-x') + '), so adding removes ' + t('x') + '.', H_ELIM[1]] });
        } },
        { id: '1d', sub: 'd', level: 'EMG', make: function (r) {
          var V = ['a', 'b'], S = find(r, function (r) { var A = r.int(2, 7), b1 = -r.int(1, 5), b2 = -r.int(1, 5); if (b1 === b2) return null; var P = [r.int(1, 6), -r.int(1, 6)]; var S = [mk(A, b1, P), mk(-A, b2, P)]; return S[0][2] && S[1][2] ? S : null; });
          var e = [eqT(S[0], V), eqT(S[1], V)];
          return solveP({ only: true, prompt: t(sysT(e[0], e[1])) + '<br>' + ptPrompt(V), S: S, V: V, e: 0, eqs: e, text: 'add: ' + e.join(', '), hints: ['The ' + t('a') + '-terms are opposites. Add, and ' + t('a') + ' disappears; the ' + t('b') + '-terms combine to a negative coefficient.', H_ELIM[1]] });
        } }] },
      /* ---------------- 2. subtracting ---------------- */
      { num: '2', stem: 'Solve each system by <b>subtracting</b> the two equations, then verify the solution satisfies both equations.', parts: [
        { id: '2a', sub: 'a', level: 'BEG', make: function (r) {
          var S = find(r, function (r) { var a1 = r.int(3, 7), a2 = r.int(1, 5); if (a1 <= a2) return null; var P = [r.int(1, 6), r.int(1, 8)]; return [mk(a1, 1, P), mk(a2, 1, P)]; });
          var e = [eqT(S[0], ['x', 'y']), eqT(S[1], ['x', 'y'])];
          return solveP({ only: true, prompt: t(sysT(e[0], e[1])) + '<br>' + ptPrompt(['x', 'y']), S: S, e: 1, eqs: e, text: 'subtract: ' + e.join(', '), hints: ['Both equations have ' + t('+y') + ': subtract them as ' + t('(\\ldots)-(\\ldots)') + ' and ' + t('y') + ' disappears.', H_ELIM[1]] });
        } },
        { id: '2b', sub: 'b', level: 'EMG', make: function (r) {
          var V = ['m', 'n'], d = find(r, function (r) { var m0 = r.int(1, 6), n0 = r.int(2, 6); if (gcd(m0, n0) !== 1 || m0 === n0) return null; var b1 = r.int(2, 6); var S = [mk(n0, b1, [m0, n0]), [n0, -m0, 0]]; return S; });
          var e = [eqT(d[0], V), eqT(d[1], V)];
          return solveP({ only: true, prompt: t(sysT(e[0], e[1])) + '<br>' + ptPrompt(V), S: d, V: V, e: 0, eqs: e, text: 'subtract: ' + e.join(', '), hints: ['The ' + t('m') + '-coefficients match. Subtract: ' + t('(\\ldots)-(\\ldots)') + ' — and ' + t('-(-' + Math.abs(d[1][1]) + 'n)') + ' becomes ' + t('+' + Math.abs(d[1][1]) + 'n') + '.', H_ELIM[1]] });
        } },
        { id: '2c', sub: 'c', level: 'EMG', make: function (r) {
          var S = find(r, function (r) { var b1 = -r.int(3, 7), b2 = r.int(1, 4), P = [-r.int(1, 7), r.int(1, 5)]; var S = [mk(-1, b1, P), mk(-1, b2, P)]; return S[0][2] && S[1][2] ? S : null; });
          var e = [eqT(S[0], ['x', 'y']), eqT(S[1], ['x', 'y'])];
          return solveP({ only: true, prompt: t(sysT(e[0], e[1])) + '<br>' + ptPrompt(['x', 'y']), S: S, e: 0, eqs: e, text: 'subtract: ' + e.join(', '), hints: ['Both equations have ' + t('-x') + '. Subtract, changing the sign of every term in the second equation.', 'When you find ' + t('-x=k') + ', remember ' + t('x=-k') + '.'] });
        } },
        { id: '2d', sub: 'd', level: 'EMG', make: function (r) {
          var V = ['a', 'b'], S = find(r, function (r) { var A = r.int(2, 5), B = r.int(1, 4); if (A === B) return null; var g = gcd(A, B), k = r.int(1, 2), P = [-B / g * k, A / g * k]; if (Math.abs(P[0]) > 9 || Math.abs(P[1]) > 9) return null; return [mk(A, -B, P), [-A, -B, 0]]; });
          var e = [eqT(S[0], V), eqT(S[1], V)];
          return solveP({ only: true, prompt: t(sysT(e[0], e[1])) + '<br>' + ptPrompt(V), S: S, V: V, e: 1, eqs: e, text: 'subtract: ' + e.join(', '), hints: ['Both ' + t('b') + '-terms are ' + t(lin([S[0][1]], ['b'])) + ', so subtracting removes ' + t('b') + ': ' + t('(' + lin([S[0][0], S[0][1]], V) + ')-(' + lin([S[1][0], S[1][1]], V) + ')') + '.', 'Subtracting ' + t(lin([S[1][0]], ['a'])) + ' gives ' + t('+' + Math.abs(S[1][0]) + 'a') + '.'] });
        } }] },
      /* ---------------- 3. one equation scaled ---------------- */
      { num: '3', section: 'Part B — Scaling one or both equations', stem: 'Solve each system by elimination. In each, <b>one</b> equation needs to be scaled. Check each solution.', parts: [
        { id: '3a', sub: 'a', level: 'EMG', make: function (r) {
          var V = ['a', 'b'], S = find(r, function (r) { var k = r.int(2, 4), A2 = r.int(2, 5), P = [r.int(1, 7), r.int(1, 5)]; var S = [mk(1, k, P), mk(A2, -1, P)]; return S[1][2] ? S : null; });
          var e = [eqT(S[0], V), eqT(S[1], V)];
          return solveP({ only: true, prompt: t(sysT(e[0], e[1])) + '<br>' + ptPrompt(V), S: S, V: V, e: 1, eqs: e, text: 'scale one: ' + e.join(', '), hints: ['Multiply Eq. 2 by ' + t(S[0][1]) + ' (every term) so the ' + t('b') + '-terms become opposites, then add.', H_ELIM[1]] });
        } },
        { id: '3b', sub: 'b', level: 'EMG', make: function (r) {
          var S = find(r, function (r) { var m = r.int(2, 3), B = r.int(1, 2), A1 = r.int(2, 7), A2 = r.int(1, 7); if (!noDiv(A1, A2) || A2 === m * A1) return null; var P = [r.int(1, 6), pickNZ(r, -4, 4)]; var S = [mk(A1, -B, P), mk(A2, -m * B, P)]; return S[0][2] && S[1][2] ? S : null; });
          var e = [eqT(S[0], ['x', 'y']), eqT(S[1], ['x', 'y'])];
          return solveP({ only: true, prompt: t(sysT(e[0], e[1])) + '<br>' + ptPrompt(['x', 'y']), S: S, e: 1, eqs: e, text: 'scale one: ' + e.join(', '), hints: [t(S[0][1]) + ' divides into ' + t(S[1][1]) + ': scale Eq. 1 so the ' + t('y') + '-terms match, then subtract (sign of every term!).', H_ELIM[1]] });
        } },
        { id: '3c', sub: 'c', level: 'PRG', make: function (r) {
          var S = find(r, function (r) { var A1 = r.int(2, 5), B = r.int(2, 4), A2 = r.int(2, 5); if (A1 === A2) return null; var P = [r.pick([0.5, 1.5, 2.5, -0.5]), r.pick([0.5, 1.5, -0.5, -1.5])]; var S = [mk(A1, -B, P), mk(A2, 1, P)]; return !isInt(S[0][2]) && S[1][2] ? S : null; });
          var e = [eqT(S[0], ['x', 'y']), eqT(S[1], ['x', 'y'])];
          return solveP({ only: true, prompt: t(sysT(e[0], e[1])) + '<br>' + ptPrompt(['x', 'y']) + ' Decimals are fine.', S: S, e: 1, eqs: e, text: 'scale one, decimals: ' + e.join(', '), hints: ['Multiply Eq. 2 by ' + t(-S[0][1]) + ' — the decimal constant gets multiplied too — then add.', 'Divide carefully: a decimal answer such as ' + t('0.5') + ' is fine.'] });
        } }] },
      /* ---------------- 4. both scaled ---------------- */
      { num: '4', stem: 'Solve each system by elimination. In each, <b>both</b> equations need to be scaled. Check each solution. Give exact values (fractions) where necessary.', parts: [
        { id: '4a', sub: 'a', level: 'PRG', make: function (r) {
          var S = sysBothScaled(r, [2, 5], [1, 1, 1, -1], function (r) { return [r.int(1, 5), r.int(1, 5)]; });
          var e = [eqT(S[0], ['x', 'y']), eqT(S[1], ['x', 'y'])];
          return solveP({ prompt: t(sysT(e[0], e[1])) + '<br>' + ptPrompt(['x', 'y']), S: S, eqs: e, text: 'scale both: ' + e.join(', '), hints: ['Pick a variable. The LCM of its two coefficients tells you what to multiply each equation by.', H_ELIM[1]] });
        } },
        { id: '4b', sub: 'b', level: 'PRG', make: function (r) {
          var S = sysBothScaled(r, [2, 5], [1, 1, 1, 1], function (r) { return [r.int(1, 5), -r.int(1, 5)]; });
          var e = [eqT(S[0], ['x', 'y']), eqT(S[1], ['x', 'y'])];
          return solveP({ prompt: t(sysT(e[0], e[1])) + '<br>' + ptPrompt(['x', 'y']), S: S, eqs: e, text: 'scale both: ' + e.join(', '), hints: ['All coefficients are positive, so after scaling you will <b>subtract</b>. Use the LCM of one variable’s coefficients.', H_ELIM[1]] });
        } },
        { id: '4c', sub: 'c', level: 'PRG', make: function (r) {
          var S = find(r, function (r) {
            var a1 = r.int(2, 6), b1 = r.int(2, 6), a2 = r.int(2, 6), b2 = -r.int(2, 6); if (!noDiv(a1, a2) || !noDiv(b1, b2)) return null;
            var S = [[a1, b1, r.int(1, 12)], [a2, b2, r.int(1, 12)]], P = solveS(S); if (!P || isInt(P[0]) || isInt(P[1])) return null;
            var f0 = toFr(P[0]), f1 = toFr(P[1]); if (f0[1] > 25 || f1[1] > 25 || Math.abs(f0[0]) > 60 || Math.abs(f1[0]) > 60 || terminates(P[0]) || terminates(P[1])) return null;
            return S;
          }, [[3, 2, 7], [5, -3, 1]]);
          var e = [eqT(S[0], ['x', 'y']), eqT(S[1], ['x', 'y'])];
          return solveP({ prompt: t(sysT(e[0], e[1])) + '<br>' + ptPrompt(['x', 'y']) + ' Use exact fractions.', S: S, eqs: e, fr: true, text: 'scale both, fraction answer: ' + e.join(', '), hints: ['Scale both equations and combine as usual — this time the division won’t come out even. Keep the answer as a fraction.', 'To find the second variable, substitute the fraction into an original equation (or eliminate the other variable too).'] });
        } }] },
      /* ---------------- 5. preparing first ---------------- */
      { num: '5', section: 'Part C — Preparing a system first', stem: 'Solve each system by elimination. Check each solution.', parts: [
        { id: '5a', sub: 'a', level: 'PRG', make: function (r) {
          var S = find(r, function (r) { var B = r.int(1, 3), A1 = r.int(2, 5), A2 = r.int(2, 7); if (!noDiv(A1, A2)) return null; var P = [r.pick([0.5, 1.5, 2.5, 3.5]), r.pick([0.5, 1.5, -0.5])]; var S = [mk(A1, B, P), mk(A2, -2 * B, P)]; return !isInt(S[0][2]) && S[1][2] ? S : null; });
          var e = [eqT(S[0], ['x', 'y']), eqT(S[1], ['x', 'y'])];
          return solveP({ prompt: t(sysT(e[0], e[1])) + '<br>' + ptPrompt(['x', 'y']) + ' Decimals are fine.', S: S, e: 1, eqs: e, text: 'decimals: ' + e.join(', '), hints: ['Double Eq. 1 — including its decimal constant — so the ' + t('y') + '-terms are opposites, then add.', H_ELIM[1]] });
        } },
        { id: '5b', sub: 'b', level: 'PRG', make: function (r) {
          var d = find(r, function (r) { var B = r.pick([2, 4, 6]), A = r.int(3, 9); if (A % 2 === 0 || gcd(A, B) !== 1) return null; var a2 = r.int(1, 5); if (2 * a2 === A) return null; var P = [B, A]; var c = -(a2 * P[0] - B / 2 * P[1]); if (!c || Math.abs(c) > 15) return null; return { A: A, B: B, a2: a2, c: c, P: P }; }, { A: 7, B: 4, a2: 3, c: 2, P: [4, 7] });
          var S = [[d.A, -d.B, 0], [d.a2, -d.B / 2, -d.c]];
          var e = [d.A + 'x=' + d.B + 'y', lin([d.a2, -d.B / 2, d.c], ['x', 'y', '']) + '=0'];
          return solveP({ prompt: t(sysT(e[0], e[1])) + '<br>' + ptPrompt(['x', 'y']), S: S, e: 1, eqs: e, text: 'rearrange: ' + e.join(', '),
            pre: 'In the form ' + t('Ax+By=C') + ': ' + t(eqT(S[0], ['x', 'y'])) + ' and ' + t(eqT(S[1], ['x', 'y'])) + '.',
            alts: [{ S: [S[0], [d.a2, -d.B / 2, d.c]], code: 'rearr-sign', hint: 'Moving the constant across the equals sign changes its sign: ' + t(e[1]) + ' becomes ' + t(eqT(S[1], ['x', 'y'])) + '.' },
              { S: [[d.A, d.B, 0], S[1]], code: 'rearr-sign', hint: 'Moving ' + t(d.B + 'y') + ' to the left side makes it ' + t('-' + d.B + 'y') + ': ' + t(eqT(S[0], ['x', 'y'])) + '.' }],
            hints: ['First write both equations as ' + t('Ax+By=C') + '. Moving a term across the equals sign changes its sign.', 'Then scale Eq. 2 so the ' + t('y') + '-terms match, and subtract.'] });
        } },
        { id: '5c', sub: 'c', level: 'PRG', make: function (r) {
          var V = ['e', 'f'], S = sysBothScaled(r, [2, 5], [1, 1, 1, 1], function (r) { return [r.int(1, 6), -r.int(1, 5)]; });
          var e = [genT(S[0], V), genT(S[1], V)];
          return solveP({ prompt: t(sysT(e[0], e[1])) + '<br>' + ptPrompt(V), S: S, V: V, eqs: e, text: 'general form, scale both: ' + e.join(', '),
            pre: 'In the form ' + t('Ae+Bf=C') + ': ' + t(eqT(S[0], V)) + ' and ' + t(eqT(S[1], V)) + '.',
            alts: [{ S: [[S[0][0], S[0][1], -S[0][2]], S[1]], code: 'rearr-sign', hint: 'Moving the constant across the equals sign changes its sign: ' + t(e[0]) + ' becomes ' + t(eqT(S[0], V)) + '.' },
              { S: [S[0], [S[1][0], S[1][1], -S[1][2]]], code: 'rearr-sign', hint: 'Moving the constant across the equals sign changes its sign: ' + t(e[1]) + ' becomes ' + t(eqT(S[1], V)) + '.' }],
            hints: ['Move each constant to the right side first (its sign changes), then scale both equations.', H_ELIM[1]] });
        } },
        { id: '5d', sub: 'd', level: 'PRG', make: function (r) {
          var d = find(r, function (r) { var A = r.int(2, 5), B = r.int(2, 5), B2 = r.int(2, 7), P = [r.int(1, 5), -r.int(1, 5)]; var C = A * P[0] + B * P[1], C2 = 2 * A * P[0] - B2 * P[1]; if (!C || !C2 || B2 === 2 * B) return null; return { A: A, B: B, B2: B2, C: C, C2: C2 }; }, { A: 4, B: 3, B2: 5, C: 2, C2: 26 });
          var S = [[d.A, d.B, d.C], [2 * d.A, -d.B2, d.C2]];
          var e = [genT(S[0], ['x', 'y']), (2 * d.A) + 'x=' + lin([d.B2, d.C2], ['y', ''])];
          return solveP({ prompt: t(sysT(e[0], e[1])) + '<br>' + ptPrompt(['x', 'y']), S: S, e: 0, eqs: e, text: 'rearrange: ' + e.join(', '),
            pre: 'In the form ' + t('Ax+By=C') + ': ' + t(eqT(S[0], ['x', 'y'])) + ' and ' + t(eqT(S[1], ['x', 'y'])) + '.',
            alts: [{ S: [[d.A, d.B, -d.C], S[1]], code: 'rearr-sign', hint: 'Moving the constant across the equals sign changes its sign: ' + t(e[0]) + ' becomes ' + t(eqT(S[0], ['x', 'y'])) + '.' },
              { S: [S[0], [2 * d.A, d.B2, d.C2]], code: 'rearr-sign', hint: 'Moving ' + t(d.B2 + 'y') + ' to the left side makes it ' + t('-' + d.B2 + 'y') + ': ' + t(eqT(S[1], ['x', 'y'])) + '.' }],
            hints: ['Rearrange both into ' + t('Ax+By=C') + ' first. Then ' + t(d.A) + ' divides into ' + t(2 * d.A) + ': one scaling lines up ' + t('x') + '.', H_ELIM[1]] });
        } }] },
      /* ---------------- 6. elimination vs substitution ---------------- */
      { num: '6', section: 'Part D — Elimination or substitution?', shared: q6shared,
        stem: function (sh) { return 'Solve the system ' + t(sysT(genT(sh.S[0], ['x', 'y']), eqT(sh.S[1], ['x', 'y']))) + ' by each method below.'; },
        parts: [
          { id: '6a', sub: 'a', level: 'EMG', make: function (r, sh) {
            var S = sh.S, e = [genT(S[0], ['x', 'y']), eqT(S[1], ['x', 'y'])];
            return solveP({ prompt: '<b>Elimination.</b> ' + ptPrompt(['x', 'y']), S: S, e: 1, eqs: e, text: 'elimination: ' + e.join(', '),
              pre: 'In the form ' + t('Ax+By=C') + ': ' + t(eqT(S[0], ['x', 'y'])) + ' and ' + t(eqT(S[1], ['x', 'y'])) + '.',
              alts: [{ S: [[1, S[0][1], -S[0][2]], S[1]], code: 'rearr-sign', hint: 'Moving the constant across the equals sign changes its sign: ' + t(e[0]) + ' becomes ' + t(eqT(S[0], ['x', 'y'])) + '.' }],
              hints: ['Rewrite Eq. 1 as ' + t('Ax+By=C') + ', then double it so the ' + t('y') + '-terms are opposites.', H_ELIM[1]] });
          } },
          { id: '6b', sub: 'b i', level: 'BEG', make: function (r, sh) {
            var S = sh.S, tgt = PL.parse(lin([-S[0][1], S[0][2]], ['y', '']));
            return K.P.poly('<b>Substitution, step 1.</b> Solve the first equation for ' + t('x') + '.', tgt, { before: t('x='), wrong: [{ is: PL.parse(lin([-S[0][1], -S[0][2]], ['y', ''])), code: 'rearr-sign', hint: 'Moving the constant across the equals sign changes its sign.' }, { is: PL.parse(lin([S[0][1], S[0][2]], ['y', ''])), code: 'rearr-sign', hint: 'Moving ' + t(lin([S[0][1]], ['y'])) + ' across the equals sign changes its sign.' }] },
              'Move the ' + t('y') + '-term and the constant to the right side (each changes sign): ' + t(genT(S[0], ['x', 'y']) + '\\ \\Rightarrow\\ x=' + lin([-S[0][1], S[0][2]], ['y', ''])) + '.',
              ['Keep ' + t('x') + ' on the left; move everything else to the right, changing each sign.'], 'isolate x: ' + genT(S[0], ['x', 'y']));
          } },
          { id: '6b2', sub: 'b ii', level: 'EMG', make: function (r, sh) {
            var S = sh.S, P = sh.P, e = [genT(S[0], ['x', 'y']), eqT(S[1], ['x', 'y'])];
            var yq = (S[1][2] - S[0][2]) / (S[1][0] * -S[0][1] + S[1][1]);
            var subW = [{ is: [-S[0][1] * yq + S[0][2], yq], code: 'sub-dist', hint: 'Multiply <b>both</b> terms of the bracket: ' + t(S[1][0] + '(' + lin([-S[0][1], S[0][2]], ['y', '']) + ')=' + lin([S[1][0] * -S[0][1], S[1][0] * S[0][2]], ['y', ''])) + '.' }];
            var p = solveP({ noSlips: true, wrong: subW, prompt: '<b>Substitution, step 2.</b> Substitute ' + t('x=' + lin([-S[0][1], S[0][2]], ['y', ''])) + ' into the second equation and solve. ' + ptPrompt(['x', 'y']), S: S, e: 1, eqs: e, text: 'substitution: ' + e.join(', '),
              sol: subsSol(S, ['x', 'y'], 0, P), hints: ['Replace ' + t('x') + ' in the second equation by the bracket ' + t('(' + lin([-S[0][1], S[0][2]], ['y', '']) + ')') + ' and expand.', 'Solve for ' + t('y') + ', then use ' + t('x=' + lin([-S[0][1], S[0][2]], ['y', ''])) + ' to find ' + t('x') + '.'] });
            return p;
          } },
          { id: '6c', sub: 'c', level: 'EMG', make: function (r, sh) {
            var S = sh.S, xe = lin([-S[0][1], S[0][2]], ['y', '']);
            return mcP(r, 'Which do you prefer? Which statement is a fair reason?', [
              { html: 'Either is reasonable: ' + t('x') + ' has coefficient ' + t('1') + ' in the first equation, so substitution (' + t('x=' + xe) + ') needs no fractions, and elimination needs just one scaling (Eq. 1 × ' + t(2) + ').', right: true },
              { html: 'Only substitution works here, because the first equation is in general form.', why: 'Both methods work on every system — you got the same answer both ways. General form just needs the constant moved first.' },
              { html: 'Only elimination works here, because no variable has a coefficient of ' + t('1') + '.', why: 'Look at ' + t('x') + ' in the first equation: its coefficient is ' + t('1') + '.' },
              { html: 'Elimination, because substitution can give a wrong answer.', why: 'Both methods are exact — they gave the same solution.' }],
              'Both methods give ' + t(ptT(sh.P)) + '. Either is reasonable: substitution is easy because ' + t('x') + ' is isolated with no fractions (' + t('x=' + xe) + '); elimination needs only Eq. 1 × ' + t(2) + '. A fair answer names a method and gives a reason like these.',
              ['Was either method much harder here? What made each one easy?'], 'prefer method (6)');
          } }] },
      { num: '7', shared: q7shared,
        stem: function (sh) { return 'Solve the system ' + t(sysT(genT(sh.S[0], ['x', 'y']), genT(sh.S[1], ['x', 'y']))) + ' by each method below.'; },
        parts: [
          { id: '7a', sub: 'a', level: 'EMG', make: function (r, sh) {
            var S = sh.S, e = [genT(S[0], ['x', 'y']), genT(S[1], ['x', 'y'])];
            return solveP({ prompt: '<b>Elimination.</b> ' + ptPrompt(['x', 'y']), S: S, e: 0, eqs: e, text: 'elimination: ' + e.join(', '),
              pre: 'In the form ' + t('Ax+By=C') + ': ' + t(eqT(S[0], ['x', 'y'])) + ' and ' + t(eqT(S[1], ['x', 'y'])) + '.',
              alts: [{ S: [[S[0][0], S[0][1], -S[0][2]], [S[1][0], S[1][1], -S[1][2]]], code: 'rearr-sign', hint: 'Moving a constant across the equals sign changes its sign: ' + t(e[0]) + ' becomes ' + t(eqT(S[0], ['x', 'y'])) + '.' }],
              hints: ['Move the constants to the right first. The ' + t('x') + '-coefficients already match, so subtract — the constants too.', H_ELIM[1]] });
          } },
          { id: '7b', sub: 'b i', level: 'EMG', make: function (r, sh) {
            var S = sh.S, tex = '\\frac{' + lin([S[0][2], -S[0][1]], ['', 'y']) + '}{' + S[0][0] + '}';
            var p = K.P.poly('<b>Substitution, step 1.</b> Solve the first equation for ' + t('x') + '.', PL.parse(tex), { before: t('x='), expanded: false, keyTex: tex,
              wrong: [{ is: PL.parse('\\frac{' + lin([-S[0][2], -S[0][1]], ['', 'y']) + '}{' + S[0][0] + '}'), code: 'rearr-sign', hint: 'Moving the constant across the equals sign changes its sign.' }, { is: PL.parse(lin([S[0][2], -S[0][1]], ['', 'y'])), code: 'divide', hint: 'Then divide <b>both</b> terms by ' + t(S[0][0]) + ' to get ' + t('x') + ' alone.' }] },
              t(genT(S[0], ['x', 'y']) + '\\ \\Rightarrow\\ ' + S[0][0] + 'x=' + lin([S[0][2], -S[0][1]], ['', 'y']) + '\\ \\Rightarrow\\ x=' + tex) + '. The fraction can’t be avoided: ' + t(S[0][0]) + ' doesn’t divide ' + t(S[0][1]) + '.',
              ['Move the ' + t('y') + '-term and the constant to the right, then divide everything by ' + t(S[0][0]) + '.'], 'isolate x: ' + genT(S[0], ['x', 'y']));
            p.good = ['\\frac{' + S[0][2] + '}{' + S[0][0] + '}' + sgnAdd(-S[0][1]).replace(/\d+$/, function (m) { return '\\frac{' + m + '}{' + S[0][0] + '}'; }) + 'y'];
            return p;
          } },
          { id: '7b2', sub: 'b ii', level: 'PRG', make: function (r, sh) {
            var S = sh.S, P = sh.P, tex = '\\frac{' + lin([S[0][2], -S[0][1]], ['', 'y']) + '}{' + S[0][0] + '}', e = [genT(S[0], ['x', 'y']), genT(S[1], ['x', 'y'])];
            return solveP({ noSlips: true, prompt: '<b>Substitution, step 2.</b> Substitute ' + t('x=' + tex) + ' into the second equation and solve. ' + ptPrompt(['x', 'y']), S: S, e: 0, eqs: e, text: 'substitution: ' + e.join(', '),
              sol: 'From Eq. 1: ' + t('x=' + tex) + '.<br>Into Eq. 2 (' + t(eqT(S[1], ['x', 'y'])) + '): ' + t(S[1][0] + '\\left(' + tex + '\\right)' + sgnAdd(S[1][1]) + 'y=' + N(S[1][2])) +
                '<br>The ' + t(S[0][0]) + 's cancel: ' + t(lin([S[0][2], -S[0][1]], ['', 'y']) + sgnAdd(S[1][1]) + 'y=' + N(S[1][2]) + '\\ \\Rightarrow\\ ' + lin([S[1][1] - S[0][1]], ['y']) + '=' + N(S[1][2] - S[0][2]) + '\\ \\Rightarrow\\ y=' + N(P[1])) +
                '<br>' + t('x=\\frac{' + N(S[0][2]) + mulTerm(-S[0][1], P[1], false) + '}{' + S[0][0] + '}=\\frac{' + N(S[0][0] * P[0]) + '}{' + S[0][0] + '}=' + N(P[0])) + '<br>Solution: <b>' + t(ptT(P)) + '</b> — the same as by elimination.',
              hints: ['Replace ' + t('x') + ' in ' + t(eqT(S[1], ['x', 'y'])) + ' by the fraction. Since both ' + t('x') + '-coefficients are ' + t(S[0][0]) + ', the denominator cancels.', 'Solve for ' + t('y') + ', then substitute back for ' + t('x') + '.'] });
          } },
          { id: '7c', sub: 'c', level: 'EMG', make: function (r, sh) {
            var S = sh.S, tex = '\\frac{' + lin([S[0][2], -S[0][1]], ['', 'y']) + '}{' + S[0][0] + '}';
            return mcP(r, 'Which do you prefer? Which statement is the best reason?', [
              { html: '<b>Elimination</b>: the ' + t('x') + '-coefficients already match (' + t(S[0][0]) + ' and ' + t(S[1][0]) + '), so one subtraction removes ' + t('x') + '; substitution forces the fraction ' + t(tex) + '.', right: true },
              { html: '<b>Substitution</b>: it always takes fewer steps than elimination.', why: 'Not here — isolating ' + t('x') + ' gives ' + t(tex) + ', a fraction to carry through.' },
              { html: '<b>Elimination</b>: the ' + t('y') + '-coefficients are opposites, so adding removes ' + t('y') + '.', why: t(S[0][1]) + ' and ' + t(S[1][1]) + ' are not opposites — it’s the ' + t('x') + '-coefficients (both ' + t(S[0][0]) + ') that already match, so you subtract.' },
              { html: '<b>Substitution</b>: ' + t('x') + ' has coefficient ' + t('1') + ' in both equations.', why: t('x') + ' has coefficient ' + t(S[0][0]) + ' in both equations.' }],
              'Elimination is fastest: the ' + t('x') + '-coefficients are already ' + t(S[0][0]) + ' in both equations, so no scaling is needed; substitution forces the fraction ' + t(tex) + '.',
              ['Which method needed fractions? Which needed no scaling at all?'], 'prefer method (7)');
          } }] },
      /* ---------------- 8. special cases ---------------- */
      { num: '8', section: 'Part E — When both variables vanish', stem: 'Solve each system by elimination. Explain the result in each case.', parts: [
        { id: '8a', sub: 'a i', level: 'PRG', make: function (r) {
          var d = find(r, function (r) { var q = r.pick([-2, -3, -4, 2, 3]), rr = pickNZ(r, -5, 5), m1 = r.pick([-2, -3, -4, 2, 3]), m2 = r.pick([2, 3, 4, 5, -2]); if (Math.abs(m1) === Math.abs(m2)) return null; return { base: [1, q, rr], m1: m1, m2: m2 }; }, { base: [1, -3, 2], m1: -3, m2: 4 });
          var E1 = d.base.map(function (x) { return x * d.m1; }), E2 = d.base.map(function (x) { return x * d.m2; });
          var e = [lin(E1, ['x', 'y', '']) + '=0', lin(E2, ['x', 'y', '']) + '=0'], L = lcm(E1[0], E2[0]);
          return special({ prompt: t(sysT(e[0], e[1])) + '<br>Give the solution: an ordered pair, <b>no solution</b>, or <b>infinitely many</b>.', target: 'inf', eqs: e, text: 'special (same line): ' + e.join(', '),
            sol: 'To eliminate ' + t('x') + ': Eq. 1 × ' + t(L / Math.abs(E1[0])) + ' and Eq. 2 × ' + t(L / Math.abs(E2[0])) + ' give ' + t(lin(E1.map(function (x) { return x * L / Math.abs(E1[0]); }), ['x', 'y', '']) + '=0') + ' and ' + t(lin(E2.map(function (x) { return x * L / Math.abs(E2[0]); }), ['x', 'y', '']) + '=0') + '. Combining them leaves ' + t('0=0') + ' — a true statement with no variables left.<br>Dividing Eq. 1 by ' + t(NP(d.m1)) + ' and Eq. 2 by ' + t(NP(d.m2)) + ' shows why: both become ' + t(lin(d.base, ['x', 'y', '']) + '=0') + '. The same line: <b>infinitely many solutions</b>.',
            hints: ['Scale and combine to eliminate ' + t('x') + '. What is left?', 'Divide each equation by a common factor and compare them.'] });
        } },
        { id: '8a2', sub: 'a ii', level: 'EMG', make: function (r) {
          var d = find(r, function (r) { var q = r.pick([-2, -3, -4, 2, 3]), rr = pickNZ(r, -5, 5), m1 = r.pick([-2, -3, -4, 2, 3]), m2 = r.pick([2, 3, 4, 5, -2]); if (Math.abs(m1) === Math.abs(m2)) return null; return { base: [1, q, rr], m1: m1, m2: m2 }; }, { base: [1, -3, 2], m1: -3, m2: 4 });
          var E1 = d.base.map(function (x) { return x * d.m1; }), E2 = d.base.map(function (x) { return x * d.m2; });
          var p = vanishMC(r, 'inf', '0=0', 'For ' + t(lin(E1, ['x', 'y', '']) + '=0') + ' and ' + t(lin(E2, ['x', 'y', '']) + '=0') + ': both are multiples of ' + t(lin(d.base, ['x', 'y', '']) + '=0') + '. ');
          p.prompt = 'For the system ' + t(sysT(lin(E1, ['x', 'y', '']) + '=0', lin(E2, ['x', 'y', '']) + '=0')) + ', elimination removes both variables and leaves ' + t('0=0') + '. What does that mean?';
          return p;
        } },
        { id: '8b', sub: 'b i', level: 'PRG', make: function (r) {
          var d = find(r, function (r) { var a = r.int(2, 4), b = -r.int(2, 6); if (gcd(a, b) !== 1) return null; var c = pickNZ(r, -6, 6), k = r.pick([-2, -3, 2, 3]), dd = pickNZ(r, -10, 10); if (dd === k * c) return null; return { a: a, b: b, c: c, k: k, d: dd }; }, { a: 2, b: -5, c: 3, k: -2, d: 9 });
          var E1 = [d.a, d.b, d.c], E2 = [d.k * d.a, d.k * d.b, d.d], e = [lin(E1, ['x', 'y', '']) + '=0', lin(E2, ['x', 'y', '']) + '=0'];
          var m = Math.abs(d.k), S1 = [m * d.a, m * d.b, -m * d.c], S2 = [E2[0], E2[1], -E2[2]], sub = near(S1[0], S2[0]), z = sub ? S1[2] - S2[2] : S1[2] + S2[2];
          return special({ prompt: t(sysT(e[0], e[1])) + '<br>Give the solution: an ordered pair, <b>no solution</b>, or <b>infinitely many</b>.', target: 'none', eqs: e, text: 'special (parallel): ' + e.join(', '),
            sol: 'In the form ' + t('Ax+By=C') + ': ' + t(eqT([d.a, d.b, -d.c], ['x', 'y'])) + ' and ' + t(eqT(S2, ['x', 'y'])) + '.<br>Eq. 1 × ' + t(m) + ': ' + t(eqT(S1, ['x', 'y'])) + '. ' + (sub ? 'Subtracting' : 'Adding') + ' Eq. 2 gives ' + t('0=' + N(z)) + ' — a <b>false</b> statement.<br>The left sides are multiples of each other but the constants are not: same slope ' + t(N(-d.a / d.b, true)) + ', different intercepts. The lines are parallel: <b>no solution</b>.',
            hints: ['Scale Eq. 1 so the ' + t('x') + '-terms line up, then combine. What is left?', 'A false statement with no variables means no point satisfies both equations.'] });
        } },
        { id: '8b2', sub: 'b ii', level: 'EMG', make: function (r) {
          var d = find(r, function (r) { var a = r.int(2, 4), b = -r.int(2, 6); if (gcd(a, b) !== 1) return null; var c = pickNZ(r, -6, 6), k = r.pick([-2, -3, 2, 3]), dd = pickNZ(r, -10, 10); if (dd === k * c) return null; return { a: a, b: b, c: c, k: k, d: dd }; }, { a: 2, b: -5, c: 3, k: -2, d: 9 });
          var E1 = [d.a, d.b, d.c], E2 = [d.k * d.a, d.k * d.b, d.d], m = Math.abs(d.k), S1 = [m * d.a, m * d.b, -m * d.c], S2 = [E2[0], E2[1], -E2[2]], z = near(S1[0], S2[0]) ? S1[2] - S2[2] : S1[2] + S2[2];
          var p = vanishMC(r, 'none', '0=' + N(z), 'Eq. 1 × ' + t(m) + ' and Eq. 2 have the same left side (up to sign) but different constants. ');
          p.prompt = 'For the system ' + t(sysT(lin(E1, ['x', 'y', '']) + '=0', lin(E2, ['x', 'y', '']) + '=0')) + ', elimination removes both variables and leaves ' + t('0=' + N(z)) + '. What does that mean?';
          return p;
        } }] },
      /* ---------------- 9. fractions ---------------- */
      { num: '9', section: 'Part F — Clearing fractions first', stem: 'Solve each system by elimination.', parts: [
        { id: '9a', sub: 'a', level: 'PRG', make: function (r) {
          var d = find(r, function (r) {
            var a = r.int(1, 3), dd = r.pick([2, 3]), pq = r.pick([[2, 4], [3, 6], [2, 6]]), x0 = r.int(2, 8), y0 = dd * r.int(1, 4);
            var c1 = a * x0 - y0 / dd, c2 = x0 / pq[0] + y0 / pq[1]; if (!c1 || isInt(c2)) return null;
            return { a: a, d: dd, p: pq[0], q: pq[1], P: [x0, y0], c1: c1, c2: c2 };
          }, { a: 2, d: 3, p: 2, q: 4, P: [6, 9], c1: 9, c2: 21 / 4 });
          var e = [lin([d.a], ['x']) + '-\\dfrac{y}{' + d.d + '}=' + N(d.c1), '\\dfrac{x}{' + d.p + '}+\\dfrac{y}{' + d.q + '}=' + N(d.c2, true).replace('\\frac', '\\dfrac')];
          var S = [[d.a * d.d, -1, d.c1 * d.d], [d.q / d.p, 1, d.c2 * d.q]], raw = [[d.a, -1 / d.d, d.c1], [1 / d.p, 1 / d.q, d.c2]];
          return solveP({ prompt: t(sysT(e[0], e[1], '6pt')) + '<br>' + ptPrompt(['x', 'y']), S: S, e: 1, eqs: e, text: 'fractions: ' + e.join(', '),
            pre: 'Clear fractions: Eq. 1 × ' + t(d.d) + ': ' + t(eqT(S[0], ['x', 'y'])) + '. Eq. 2 × ' + t(d.q) + ': ' + t(eqT(S[1], ['x', 'y'])) + '.',
            alts: clearAlts(S, raw, [d.d, d.q]), hints: ['Multiply each equation by its own common denominator (every term, both sides). Then the ' + t('y') + '-terms are opposites.', H_ELIM[1]] });
        } },
        { id: '9b', sub: 'b', level: 'ADV', make: function (r) {
          var V = ['m', 'n'], d = find(r, function (r) {
            var s = r.int(1, 3), m0 = 3 * r.int(1, 4), n0 = s + 4 * r.int(0, 2); if (n0 < 2) return null;
            var c1 = m0 / 3 - (n0 - s) / 4, c2 = m0 / 2 - n0 / 3; if (!c1 || !c2 || isInt(c2)) return null;
            return { s: s, P: [m0, n0], c1: c1, c2: c2 };
          }, { s: 2, P: [9, 6], c1: 2, c2: 5 / 2 });
          var e = ['\\dfrac{m}{3}-\\dfrac{n' + sgnAdd(-d.s) + '}{4}=' + N(d.c1), '\\dfrac{m}{2}-\\dfrac{n}{3}=' + N(d.c2, true).replace('\\frac', '\\dfrac')];
          var S = [[4, -3, 12 * d.c1 - 3 * d.s], [3, -2, 6 * d.c2]];
          var alts = [{ S: [[4, -3, 12 * d.c1 + 3 * d.s], S[1]], code: 'clear-bracket', hint: 'Careful with ' + t('-3(n' + sgnAdd(-d.s) + ')') + ': it is ' + t('-3n+' + 3 * d.s) + ' (the minus multiplies both terms).' },
            { S: [[4, -3, 12 * d.c1 - d.s], S[1]], code: 'clear-bracket', hint: 'Multiply <b>both</b> terms of ' + t('(n' + sgnAdd(-d.s) + ')') + ' by ' + t('-3') + ': ' + t('-3(n' + sgnAdd(-d.s) + ')=-3n+' + 3 * d.s) + '.' },
            { S: [[4, -3, d.c1 - 3 * d.s], S[1]], code: 'clear-one-side', hint: 'When you multiply Eq. 1 by ' + t(12) + ', the right side becomes ' + t('12\\times' + NP(d.c1) + '=' + N(12 * d.c1)) + ' too.' },
            { S: [S[0], [3, -2, d.c2]], code: 'clear-one-side', hint: 'When you multiply Eq. 2 by ' + t(6) + ', the right side becomes ' + t('6\\times' + NP(d.c2, true) + '=' + N(6 * d.c2)) + ' too.' }];
          return solveP({ prompt: t(sysT(e[0], e[1], '6pt')) + '<br>' + ptPrompt(V), S: S, V: V, e: 1, eqs: e, text: 'fractions: ' + e.join(', '),
            pre: 'Eq. 1 × ' + t(12) + ': ' + t('4m-3(n' + sgnAdd(-d.s) + ')=' + N(12 * d.c1) + '\\ \\Rightarrow\\ 4m-3n+' + 3 * d.s + '=' + N(12 * d.c1) + '\\ \\Rightarrow\\ ' + eqT(S[0], V)) + '.<br>Eq. 2 × ' + t(6) + ': ' + t(eqT(S[1], V)) + '.',
            alts: alts, hints: ['Clear each equation with its LCD (' + t(12) + ' and ' + t(6) + '). Keep ' + t('(n' + sgnAdd(-d.s) + ')') + ' in brackets: the ' + t('-3') + ' multiplies both terms.', 'Then scale both equations to line up ' + t('n') + '.'] });
        } },
        { id: '9c', sub: 'c', level: 'ADV', make: function (r) {
          var d = find(r, function (r) { var x0 = r.pick([4, 8, 12, -4]), y0 = r.pick([3, 6, -3, 9]); var c1 = x0 - 2 * y0 / 3 + x0 / 4, c2 = x0 / 4 - y0 / 2; if (!c1 || !c2 || Math.abs(c1) > 20) return null; return { P: [x0, y0], c1: c1, c2: c2 }; }, { P: [8, 3], c1: 8, c2: 0.5 });
          var e = ['\\dfrac{1}{3}(3x-2y)+\\dfrac{1}{4}x=' + N(d.c1), '\\dfrac{1}{4}x-\\dfrac{1}{2}y=' + N(d.c2, true).replace('\\frac', '\\dfrac')];
          var S = [[15, -8, 12 * d.c1], [1, -2, 4 * d.c2]];
          var alts = [{ S: [[15, -24, 12 * d.c1], S[1]], code: 'clear-bracket', hint: t('\\frac{1}{3}') + ' multiplies <b>both</b> terms in the bracket: ' + t('\\frac{1}{3}(3x-2y)=x-\\frac{2}{3}y') + '.' },
            { S: [[15, -8, d.c1], S[1]], code: 'clear-one-side', hint: 'When you multiply Eq. 1 by ' + t(12) + ', the right side becomes ' + t('12\\times' + NP(d.c1) + '=' + N(12 * d.c1)) + ' too.' },
            { S: [S[0], [1, -2, d.c2]], code: 'clear-one-side', hint: 'When you multiply Eq. 2 by ' + t(4) + ', the right side becomes ' + t('4\\times' + NP(d.c2, true) + '=' + N(4 * d.c2)) + ' too.' }];
          return solveP({ prompt: t(sysT(e[0], e[1], '6pt')) + '<br>' + ptPrompt(['x', 'y']), S: S, e: 1, m: [1, 4], eqs: e, text: 'fractions with brackets: ' + e.join(', '),
            pre: 'Expand Eq. 1: ' + t('x-\\frac{2}{3}y+\\frac{1}{4}x=' + N(d.c1)) + '; × ' + t(12) + ': ' + t('12x-8y+3x=' + N(12 * d.c1) + '\\ \\Rightarrow\\ ' + eqT(S[0], ['x', 'y'])) + '.<br>Eq. 2 × ' + t(4) + ': ' + t(eqT(S[1], ['x', 'y'])) + '.',
            alts: alts, hints: ['Expand the bracket first, then multiply Eq. 1 by ' + t(12) + ' and Eq. 2 by ' + t(4) + ' (every term, both sides).', 'In the cleared system, Eq. 2 × ' + t(4) + ' lines up the ' + t('y') + '-terms.'] });
        } }] },
      /* ---------------- 10–14: MC and NR ---------------- */
      { num: '10', section: 'Part G — Multiple choice and numerical response', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '10', level: 'EMG', make: function (r) {
          var d = find(r, function (r) { var a1 = r.int(2, 5), b = r.int(1, 3), a2 = r.int(2, 7), c1 = r.int(2, 15), c2 = r.int(2, 15); if (2 * a1 === a2 || a1 === a2) return null; var ok1 = [a1 + a2, 2 * a1 + a2, 2 * a1 - a2]; if (ok1[2] === 0) return null; return { a1: a1, b: b, a2: a2, c1: c1, c2: c2 }; }, { a1: 3, b: 2, a2: 5, c1: 11, c2: 9 });
          var R = [2 * d.a1 + d.a2, 2 * d.c1 + d.c2], A = [d.a1 + d.a2, d.c1 + d.c2], B = [2 * d.a1 + d.a2, d.c1 + d.c2], C = [2 * d.a1 - d.a2, 2 * d.c1 - d.c2];
          var tx = function (p) { return t(lin([p[0]], ['x']) + '=' + N(p[1])); };
          var seen = {}; [R, A, B, C].forEach(function (p) { seen[p.join()] = 1; }); if (Object.keys(seen).length < 4) { C = [2 * d.a1 + d.a2, 2 * d.c1 - d.c2]; }
          var e1 = eqT([d.a1, d.b, d.c1], ['x', 'y']), e2 = eqT([d.a2, -2 * d.b, d.c2], ['x', 'y']);
          return mcP(r, 'When ' + t('y') + ' is eliminated from the equations ' + t(e1) + ' and ' + t(e2) + ', we obtain', [
            { html: tx(R), right: true },
            { html: tx(A), why: 'Adding without scaling leaves ' + t(lin([A[0], -d.b], ['x', 'y'])) + ' — the ' + t('y') + '-terms don’t cancel. Multiply the first equation by ' + t(2) + ' first.' },
            { html: tx(B), code: 'elim-const', why: 'Doubling the first equation doubles its constant too: ' + t('2\\times' + d.c1 + '=' + 2 * d.c1) + '.' },
            { html: tx(C), why: 'After doubling, the ' + t('y') + '-terms are ' + t('+' + 2 * d.b + 'y') + ' and ' + t('-' + 2 * d.b + 'y') + ': opposites, so <b>add</b>, don’t subtract.' }],
            'Multiply every term of ' + t(e1) + ' by ' + t(2) + ': ' + t(eqT([2 * d.a1, 2 * d.b, 2 * d.c1], ['x', 'y'])) + '. Now ' + t('+' + 2 * d.b + 'y') + ' and ' + t('-' + 2 * d.b + 'y') + ' are opposites, so add: ' + tx(R) + '.',
            ['Which equation can you multiply so the ' + t('y') + '-terms become opposites?'], 'eliminate y: ' + e1 + ', ' + e2);
        } }] },
      { num: '11', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '11', level: 'EMG', make: function (r) {
          var pq = r.pick([[3, 4], [2, 3], [2, 5], [3, 5], [4, 5]]), p = pq[0], q = pq[1], unit = p * q / gcd(p * q, p + q), k = unit <= 15 ? r.int(1, 2) : 1;
          var x0 = unit * k, c = x0 * (p + q) / (p * q);
          var e2 = '\\frac{1}{' + p + '}x+\\frac{1}{' + q + '}y=' + c, show = function (v) { return t('x=' + v + ',\\ y=' + v); };
          return mcP(r, 'The solution to the system ' + t('x-y=0') + ', ' + t(e2) + ' is', [
            { html: show(x0), right: true },
            { html: show(-x0), why: 'Test it: ' + t('\\frac{1}{' + p + '}(' + -x0 + ')+\\frac{1}{' + q + '}(' + -x0 + ')=' + -c) + ', not ' + t(c) + '.' },
            { html: show(0), why: t('(0,\\ 0)') + ' satisfies ' + t('x-y=0') + ', but the second equation gives ' + t('0\\ne ' + c) + '.' },
            { html: show(c), why: t(c) + ' is the right side of the second equation, not the value of ' + t('x') + ': ' + t('\\frac{' + c + '}{' + p + '}+\\frac{' + c + '}{' + q + '}\\ne ' + c) + '.' }],
            'Clear fractions: × ' + t(p * q) + ' gives ' + t(q + 'x+' + p + 'y=' + c * p * q) + '. Eq. 1 × ' + t(p) + ': ' + t(p + 'x-' + p + 'y=0') + '. Add: ' + t((p + q) + 'x=' + c * p * q + '\\ \\Rightarrow\\ x=' + x0) + ', and ' + t('y=x=' + x0) + '.<br>Check: ' + t('\\frac{' + x0 + '}{' + p + '}+\\frac{' + x0 + '}{' + q + '}=' + (x0 / p) + '+' + (x0 / q) + '=' + c) + ' ✓',
            ['Since ' + t('x-y=0') + ', ' + t('y=x') + '. Or test each option in both equations.'], 'x-y=0, ' + e2);
        } }] },
      { num: '12', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '12', level: 'BEG', make: function (r) {
          var d = find(r, function (r) { var b1 = r.int(2, 4), b2 = r.int(1, 3); if (b1 === b2) return null; var P = [r.int(2, 8), -r.int(1, 4)]; if (P[0] === -P[1]) return null; return { b1: b1, b2: b2, P: P }; }, { b1: 3, b2: 2, P: [6, -1] });
          var S = [mk(1, -d.b1, d.P), mk(1, d.b2, d.P)], e = [eqT(S[0], ['x', 'y']), eqT(S[1], ['x', 'y'])];
          var fails = function (Q) { var i = near(S[0][0] * Q[0] + S[0][1] * Q[1], S[0][2]) ? 1 : 0, q = S[i]; return t(subT(q, Q).replace(/=[^=]*$/, '') + '=' + N(q[0] * Q[0] + q[1] * Q[1]) + '\\ne ' + N(q[2])) + '.'; };
          var P = d.P, opts = [{ html: t(ptT(P)), right: true }, { html: t(ptT([P[1], P[0]])), why: 'Coordinates swapped? ' + fails([P[1], P[0]]) }, { html: t(ptT([-P[0], P[1]])), why: fails([-P[0], P[1]]) }, { html: t(ptT([P[0], -P[1]])), why: fails([P[0], -P[1]]) }];
          return mcP(r, 'The ordered pair ' + t('(x,\\ y)') + ' which satisfies the system of equations ' + t(e[0]) + ', ' + t(e[1]) + ' is', opts,
            'The ' + t('x') + '-coefficients match, so subtract: ' + t('(' + lin([1, S[0][1]], ['x', 'y']) + ')-(' + lin([1, S[1][1]], ['x', 'y']) + ')=' + N(S[0][2]) + '-' + NP(S[1][2]) + '\\ \\Rightarrow\\ ' + lin([S[0][1] - S[1][1]], ['y']) + '=' + N(S[0][2] - S[1][2]) + '\\ \\Rightarrow\\ y=' + P[1]) + '; then ' + t('x=' + N(S[1][2]) + mulTerm(-S[1][1], P[1], false) + '=' + P[0]) + '.<br>' + t(ptT(P)) + ' satisfies both: ' + t(subT(S[0], P)) + ' ✓, ' + t(subT(S[1], P)) + ' ✓',
            ['Substitute each option into <b>both</b> equations, or subtract the equations to find ' + t('y') + '.'], 'which pair: ' + e.join(', '));
        } }] },
      { num: '13', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '13', level: 'ADV', make: function (r) {
          var d = find(r, function (r) { var c = r.int(1, 5), dd = pickNZ(r, -3, 3), k = r.pick([[1, 2], [1, 1], [2, 1]]), x = (12 * c + 24 * dd) / 5, y = (16 * c + 12 * dd) / 5, v = k[0] * x + k[1] * y; v = Math.round(v * 10) / 10; if (v <= 0 || isInt(v) || String(v).length > 4 || near(x, y)) return null; return { c: c, d: dd, k: k, P: [x, y], v: v }; }, { c: 3, d: -1, k: [1, 2], P: [2.4, 7.2], v: 16.8 });
          var e1 = '\\frac{1}{4}x+' + d.c + '=\\frac{1}{2}y', e2 = '\\frac{1}{3}x-\\frac{1}{4}y=' + d.d, ex = lin(d.k, ['x', 'y']), S = [[1, -2, -4 * d.c], [4, -3, 12 * d.d]];
          var p = nrP('If ' + t(e1) + ' and ' + t(e2) + ', then the value of ' + t(ex) + ' is ________.', d.v, comboDiag(d.P, d.k),
            'Eq. 1 × ' + t(4) + ', rearranged: ' + t(eqT(S[0], ['x', 'y'])) + '. Eq. 2 × ' + t(12) + ': ' + t(eqT(S[1], ['x', 'y'])) + '.<br>' + elimSteps(S, ['x', 'y'], 0) + '<br>' + t(ex + '=' + mulTerm(d.k[0], d.P[0], true) + mulTerm(d.k[1], d.P[1], false) + '=' + d.v),
            ['Clear the fractions in each equation and move the variables to the left: ' + t('x-2y=' + (-4 * d.c)) + ' is one of them.', 'Solve for ' + t('x') + ' and ' + t('y') + ' (decimals), then evaluate ' + t(ex) + '.'], 'NR ' + ex + ': ' + e1 + ', ' + e2);
          p._eqs = [e1, e2]; p._sol = d.P; p._V = ['x', 'y'];
          return p;
        } }] },
      { num: '14', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '14', level: 'EMG', make: function (r) {
          var d = find(r, function (r) { var a1 = r.int(2, 5), b = r.int(1, 4), P = [r.int(3, 12), r.int(2, 9)], k = r.int(2, 4); var S = [mk(a1, b, P), mk(1, -b, P)]; var v = P[0] + k * P[1]; if (!S[1][2]) return null; return { S: S, P: P, k: k, v: v }; });
          var e = [eqT(d.S[0], ['x', 'y']), eqT(d.S[1], ['x', 'y'])], ex = lin([1, d.k], ['x', 'y']);
          var p = nrP('If ' + t(e[0]) + ' and ' + t(e[1]) + ', then the value of ' + t(ex) + ' is ________.', d.v, comboDiag(d.P, [1, d.k]),
            elimSteps(d.S, ['x', 'y'], 1) + '<br>' + t(ex + '=' + d.P[0] + '+' + d.k + '(' + d.P[1] + ')=' + d.v),
            ['The ' + t('y') + '-terms are opposites: add the equations.', 'Find both ' + t('x') + ' and ' + t('y') + ', then evaluate ' + t(ex) + '.'], 'NR ' + ex + ': ' + e.join(', '));
          p._eqs = e; p._sol = d.P; p._V = ['x', 'y'];
          return p;
        } }] }
    ],
    extra: [
      /* ---------------- A ---------------- */
      { num: '1', section: 'Extra practice A — Eliminating directly: add, or subtract?', shared: ep1shared,
        stem: 'Every system is already lined up: one variable has coefficients that are either equal or opposite. Decide <b>add or subtract</b>, then solve and verify in both equations.', parts: [
          { id: 'e1', sub: 'add or subtract?', level: 'LIM', make: function (r, sh) {
            var rows = sh.sys.map(function (s, i) { return { id: 'abcd'.charAt(i), html: '(' + 'abcd'.charAt(i) + ') ' + sysP(E2(s.S, s.V)) }; }), want = {};
            sh.sys.forEach(function (s, i) { want['abcd'.charAt(i)] = s.op; });
            return K.P.grid('For each system, should you add or subtract the equations?', rows, [{ id: 'add', html: 'Add' }, { id: 'sub', html: 'Subtract' }], want,
              { why: function (row) { var s = sh.sys['abcd'.indexOf(row)], v = s.V[s.e]; return { code: 'addsub', hint: '(' + row + '): the ' + t(v) + '-coefficients are ' + t(s.S[0][s.e]) + ' and ' + t(s.S[1][s.e]) + ' — ' + (s.op === 'add' ? '<b>opposite</b>, so add.' : '<b>equal</b>, so subtract.') + ' The signs of the constants don’t matter.' }; } },
              sh.sys.map(function (s, i) { var v = s.V[s.e]; return '(' + 'abcd'.charAt(i) + ') ' + t(v) + ': ' + t(s.S[0][s.e]) + ' and ' + t(s.S[1][s.e]) + ' are ' + (s.op === 'add' ? 'opposite → <b>add</b>' : 'equal → <b>subtract</b>'); }).join('<br>'),
              ['Find the variable whose coefficients are the same number. Same sign → subtract; opposite signs → add.'], 'add or subtract (4 systems)');
          } },
          { id: 'e1a', sub: 'a', level: 'BEG', make: function (r, sh) { return ep1solve(sh, 0); } },
          { id: 'e1b', sub: 'b', level: 'BEG', make: function (r, sh) { return ep1solve(sh, 1); } },
          { id: 'e1c', sub: 'c', level: 'BEG', make: function (r, sh) { return ep1solve(sh, 2); } },
          { id: 'e1d', sub: 'd', level: 'EMG', make: function (r, sh) { return ep1solve(sh, 3); } }] },
      { num: '2', shared: ep2shared,
        stem: function (sh) { return 'The two systems below are identical except for <b>one sign</b>: the ' + t(sh.b + 'y') + ' in the second equation.<br>(a) ' + sysP(E2(sh.Sa)) + ' &nbsp; (b) ' + sysP(E2(sh.Sb)); },
        parts: [
          { id: 'e2a', sub: 'a', level: 'BEG', make: function (r, sh) { var e = E2(sh.Sa); return solveP({ only: true, prompt: 'Solve system (a): ' + sysP(e) + '<br>' + ptPrompt(['x', 'y']), S: sh.Sa, e: 1, eqs: e, text: 'one sign (a): ' + e.join(', '), hints: ['Both ' + t('y') + '-terms are ' + t('+' + sh.b + 'y') + ': equal, so subtract.', H_ELIM[1]] }); } },
          { id: 'e2b', sub: 'b', level: 'BEG', make: function (r, sh) { var e = E2(sh.Sb); return solveP({ only: true, prompt: 'Solve system (b): ' + sysP(e) + '<br>' + ptPrompt(['x', 'y']), S: sh.Sb, e: 1, eqs: e, text: 'one sign (b): ' + e.join(', '), hints: [t('+' + sh.b + 'y') + ' and ' + t('-' + sh.b + 'y') + ' are opposites, so add.', H_ELIM[1]] }); } },
          { id: 'e2c', sub: 'c', level: 'EMG', make: function (r, sh) {
            return mcP(r, 'Which statement gives the rule that decides add or subtract, and explains why changing that one sign moved the solution from ' + t(ptT(sh.Pa)) + ' to ' + t(ptT(sh.Pb)) + '?', [
              { html: 'Equal coefficients (sign included) → subtract; opposite coefficients → add. Flipping the sign of ' + t(sh.b + 'y') + ' changes which combination works, so a different equation in ' + t('x') + ' (' + t(lin([sh.a1 - sh.a2], ['x']) + '=' + (sh.c1 - sh.c2)) + ' vs ' + t(lin([sh.a1 + sh.a2], ['x']) + '=' + (sh.c1 + sh.c2)) + ') gives a different solution.', right: true },
              { html: 'Add when the constants on the right have the same sign; otherwise subtract. The solution moved because the constants changed.', why: 'The constants never decide it, and they didn’t change. Look at the coefficients of the variable you want to remove.' },
              { html: 'Subtract whenever the same number appears in both equations, like ' + t(sh.b) + ' and ' + t(sh.b) + '. The solution moved because of a rounding effect.', why: t('+' + sh.b + 'y') + ' and ' + t('-' + sh.b + 'y') + ' contain the same digit but are opposite coefficients: subtracting them gives ' + t(2 * sh.b + 'y') + ', adding gives ' + t(0) + '.' },
              { html: 'It doesn’t matter whether you add or subtract; changing one sign should only move the solution a little.', why: 'One combination removes ' + t('y') + ' and the other doesn’t. And the two solutions are far apart: one sign changes the whole second line (its slope flips sign).' }],
              '<b>Rule:</b> equal coefficients are removed by subtracting; opposite coefficients by adding — the coefficient, sign and all, decides.<br>In (a) the difference of the left sides is ' + t(lin([sh.a1 - sh.a2], ['x'])) + '; in (b) the sum is ' + t(lin([sh.a1 + sh.a2], ['x'])) + '. Different coefficients dividing different constants give different answers: ' + t(ptT(sh.Pa)) + ' and ' + t(ptT(sh.Pb)) + '. Geometrically, the sign change flips the second line’s slope, so it meets the first line somewhere else.',
              ['What makes ' + t('y') + ' disappear in each system — adding or subtracting?'], 'add/subtract rule');
          } }] },
      /* ---------------- B ---------------- */
      { num: '3', section: 'Extra practice B — Scaling one equation', stem: 'Solve each system by scaling <b>one</b> equation (multiply every term, the constant included). Then verify in both originals.', parts: [
        { id: 'e3a', sub: 'a', level: 'EMG', make: function (r) {
          var S = find(r, function (r) { var b1 = r.int(2, 5), A2 = r.int(2, 5), b2 = r.int(2, 6); if (!noDiv(b1, b2)) return null; var P = [r.int(1, 7), -r.int(1, 4)], S = [mk(1, -b1, P), mk(A2, b2, P)]; return nz(S) ? S : null; });
          var e = E2(S); return solveP({ prompt: sysP(e) + '<br>' + ptPrompt(['x', 'y']), S: S, e: 0, eqs: e, text: 'scale one: ' + e.join(', '), hints: [t('1') + ' divides into ' + t(S[1][0]) + ': multiply Eq. 1 by ' + t(S[1][0]) + ' so the ' + t('x') + '-terms match, then subtract.', H_ELIM[1]] });
        } },
        { id: 'e3b', sub: 'b', level: 'EMG', make: function (r) {
          var V = ['m', 'n'], S = find(r, function (r) { var A = r.int(2, 3), k = r.int(2, 3), b1 = r.int(5, 9), b2 = r.int(2, 7); if (!noDiv(b1, b2)) return null; var P = [r.int(1, 5), -r.int(1, 3)], S = [mk(A, b1, P), mk(k * A, -b2, P)]; return nz(S) ? S : null; });
          var e = E2(S, V); return solveP({ prompt: sysP(e) + '<br>' + ptPrompt(V), S: S, V: V, e: 0, eqs: e, text: 'scale one: ' + e.join(', '), hints: [t(S[0][0]) + ' divides into ' + t(S[1][0]) + ': multiply Eq. 1 by ' + t(S[1][0] / S[0][0]) + ' so the ' + t('m') + '-terms match, then subtract.', H_ELIM[1]] });
        } },
        { id: 'e3c', sub: 'c', level: 'EMG', make: function (r) {
          var V = ['u', 'v'], S = find(r, function (r) { var a1 = r.int(3, 8), B = r.int(2, 3), k = r.int(2, 3), P = [r.int(1, 4), -r.int(1, 4)], S = [mk(a1, B, P), mk(1, -k * B, P)]; return nz(S) ? S : null; });
          var e = E2(S, V); return solveP({ prompt: sysP(e) + '<br>' + ptPrompt(V), S: S, V: V, e: 1, eqs: e, text: 'scale one: ' + e.join(', '), hints: [t(S[0][1]) + ' divides into ' + t(-S[1][1]) + ': multiply Eq. 1 by ' + t(-S[1][1] / S[0][1]) + ' so the ' + t('v') + '-terms are opposites, then add.', H_ELIM[1]] });
        } }] },
      /* ---------------- C ---------------- */
      { num: '4', section: 'Extra practice C — Scaling both equations', stem: 'Solve each system by scaling <b>both</b> equations: divide the LCM of one variable’s coefficients by each coefficient to get the two multipliers. Verify in both originals.', parts: [
        { id: 'e4a', sub: 'a', level: 'PRG', make: function (r) { var S = sysBothScaled(r, [2, 10], [1, 1, 1, -1], function (r) { return [r.int(1, 5), -r.int(1, 4)]; }), e = E2(S); return solveP({ prompt: sysP(e) + '<br>' + ptPrompt(['x', 'y']), S: S, eqs: e, text: 'scale both: ' + e.join(', ') }); } },
        { id: 'e4b', sub: 'b', level: 'PRG', make: function (r) { var V = ['p', 'q'], S = sysBothScaled(r, [2, 11], [1, 1, 1, -1], function (r) { return [-r.int(1, 4), r.int(1, 5)]; }), e = E2(S, V); return solveP({ prompt: sysP(e) + '<br>' + ptPrompt(V), S: S, V: V, eqs: e, text: 'scale both: ' + e.join(', ') }); } },
        { id: 'e4c', sub: 'c', level: 'PRG', make: function (r) { var S = sysBothScaled(r, [2, 10], [1, 1, 1, -1], function (r) { return [r.int(1, 4), -r.int(1, 6)]; }), e = E2(S); return solveP({ prompt: sysP(e) + '<br>' + ptPrompt(['x', 'y']), S: S, eqs: e, text: 'scale both: ' + e.join(', ') }); } }] },
      /* ---------------- D ---------------- */
      { num: '5', section: 'Extra practice D — Which variable is cheaper to eliminate?',
        shared: function (r) { return find(r, function (r) { var a1 = r.int(2, 9), a2 = r.int(2, 9), b2 = r.int(2, 5), k = r.int(2, 3); if (!noDiv(a1, a2) || gcd(a1, a2) !== 1) return null; var P = [r.int(1, 6), pickNZ(r, -4, 4)], S = [mk(a1, k * b2, P), mk(a2, b2, P)]; return nz(S) ? { S: S, P: P } : null; }, { S: [[3, 8, 4], [7, 4, 24]], P: [4, -1] }); },
        stem: function (sh) { return 'Consider the system ' + sysP(E2(sh.S)) + '.'; }, parts: [
          { id: 'e5a', sub: 'a', level: 'EMG', make: function (r, sh) { return cheapMC(r, sh.S, ['x', 'y'], 1); } },
          { id: 'e5b', sub: 'b', level: 'EMG', make: function (r, sh) { var e = E2(sh.S); return solveP({ prompt: 'Eliminate the cheaper variable (' + t('y') + ') and solve the system. ' + ptPrompt(['x', 'y']), S: sh.S, e: 1, eqs: e, text: 'cheaper route: ' + e.join(', ') }); } },
          { id: 'e5c', sub: 'c', level: 'PRG', make: function (r, sh) {
            var S = sh.S, a1 = S[0][0], a2 = S[1][0], k = a2 * S[0][1] - a1 * S[1][1], R = a2 * S[0][2] - a1 * S[1][2];
            return stepPart('Go back to the original system and eliminate ' + t('x') + ' instead: Eq. 1 × ' + t(a2) + ' and Eq. 2 × ' + t(a1) + ', then subtract. Which equation in ' + t('y') + ' do you get?', [0, k, R],
              { wrong: [{ is: [0, k, S[0][2] - S[1][2]], code: 'elim-const', hint: 'Scale the right sides too: ' + t(a2 + '\\times' + NP(S[0][2]) + '=' + N(a2 * S[0][2])) + ' and ' + t(a1 + '\\times' + NP(S[1][2]) + '=' + N(a1 * S[1][2])) + '.' },
                { is: [0, k, a2 * S[0][2] + a1 * S[1][2]], code: 'elim-rhs', hint: 'You subtracted the left sides, so subtract the right sides too: ' + t(N(a2 * S[0][2]) + '-' + NP(a1 * S[1][2]) + '=' + N(R)) + '.' },
                { is: [0, a2 * S[0][1] + a1 * S[1][1], R], code: 'elim-sub-sign', hint: 'Subtracting changes the sign of every term in the second bracket: ' + t(lin([a2 * S[0][1]], ['y']) + '-(' + (a1 * S[1][1] > 0 ? '+' : '') + lin([a1 * S[1][1]], ['y']) + ')=' + lin([k], ['y'])) + '.' }],
                placeholder: '5y = 15', stepHint: 'That is equivalent — but give the equation exactly as the subtraction produces it (before dividing).' },
              'Eq. 1 × ' + t(a2) + ': ' + t(eqT(scaled(S[0], a2), ['x', 'y'])) + '. Eq. 2 × ' + t(a1) + ': ' + t(eqT(scaled(S[1], a1), ['x', 'y'])) + '.<br>Subtract: ' + t(lin([k], ['y']) + '=' + N(R)) + ', so ' + t('y=' + N(R / k)) + ' and ' + t('x=' + N(sh.P[0])) + ' — the same pair ' + t(ptT(sh.P)) + ', but with bigger numbers at every step.',
              ['Multiply every term (constants too), then subtract the second scaled equation from the first.'], 'eliminate x instead: ' + E2(S).join(', '));
          } }] },
      { num: '6', shared: function (r) { return { a: cheapSys(r, 'div', 0), b: cheapSys(r, 'div', 1), c: cheapSys(r, 'eq', 0) }; },
        stem: 'For each system, state which variable is cheaper to eliminate and the multipliers it needs. Do not solve in (a)–(c).', parts: [
          { id: 'e6a', sub: 'a', level: 'EMG', make: function (r, sh) { return cheapMC(r, sh.a, ['a', 'b'], 0); } },
          { id: 'e6b', sub: 'b', level: 'EMG', make: function (r, sh) { return cheapMC(r, sh.b, ['x', 'y'], 1); } },
          { id: 'e6c', sub: 'c', level: 'BEG', make: function (r, sh) { return cheapMC(r, sh.c, ['m', 'n'], 0); } },
          { id: 'e6d', sub: 'd', level: 'EMG', make: function (r, sh) { var e = E2(sh.b); return solveP({ prompt: 'Now solve system (b), ' + sysP(e) + ', by the cheaper route. ' + ptPrompt(['x', 'y']), S: sh.b, e: 1, eqs: e, text: 'cheaper route: ' + e.join(', ') }); } }] },
      /* ---------------- E ---------------- */
      { num: '7', section: 'Extra practice E — Rearranging into Ax + By = C first', stem: 'Rewrite each equation in the form ' + t('Ax+By=C') + ', then solve by elimination and verify in both <i>original</i> equations.', parts: [
        { id: 'e7a', sub: 'a', level: 'PRG', make: function (r) {
          var S = find(r, function (r) { var a1 = r.int(3, 7), b1 = r.int(2, 5), a2 = r.int(2, 4), b2 = r.int(3, 8); if (!noDiv(a1, a2) || !noDiv(b1, b2)) return null; var P = [pickNZ(r, -3, 4), pickNZ(r, -4, 3)], S = [mk(a1, -b1, P), mk(a2, b2, P)]; return nz(S) ? S : null; });
          var e = [eqT(S[0], ['x', 'y']), S[1][0] + 'x=' + lin([-S[1][1], S[1][2]], ['y', ''])];
          return solveP({ prompt: sysP(e) + '<br>' + ptPrompt(['x', 'y']), S: S, eqs: e, text: 'rearrange: ' + e.join(', '), pre: 'Rearranged: ' + t(eqT(S[0], ['x', 'y'])) + ' and ' + t(eqT(S[1], ['x', 'y'])) + '.',
            alts: [{ S: [S[0], [S[1][0], -S[1][1], S[1][2]]], code: 'rearr-sign', hint: 'Moving ' + t(lin([-S[1][1]], ['y'])) + ' to the left side changes its sign: ' + t(eqT(S[1], ['x', 'y'])) + '.' }],
            hints: ['Bring the ' + t('y') + '-term of the second equation to the left (its sign changes). Then both equations need scaling.', H_ELIM[1]] });
        } },
        { id: 'e7b', sub: 'b', level: 'PRG', make: function (r) {
          var d = find(r, function (r) { var g = r.int(2, 4), b = r.int(1, 3), P = [pickNZ(r, -5, 5), r.int(1, 5)], c1 = P[0] + b * P[1], c2 = P[0] - b * P[1]; return c1 && c2 ? { g: g, b: b, P: P, c1: c1, c2: c2 } : null; }, { g: 3, b: 2, P: [-3, 4], c1: 5, c2: -11 });
          var S = [[1, d.b, d.c1], [1, -d.b, d.c2]], e = [d.g + '(' + lin([1, d.b], ['x', 'y']) + ')=' + d.g * d.c1, '2x' + sgnAdd(-2 * d.c2) + '=' + lin([2 * d.b], ['y'])];
          return solveP({ prompt: sysP(e) + '<br>' + ptPrompt(['x', 'y']), S: S, e: 1, eqs: e, text: 'rearrange: ' + e.join(', '),
            pre: 'Divide Eq. 1 by ' + t(d.g) + ': ' + t(eqT(S[0], ['x', 'y'])) + '. Rearrange Eq. 2: ' + t(eqT([2, -2 * d.b, 2 * d.c2], ['x', 'y'])) + ', then divide by ' + t(2) + ': ' + t(eqT(S[1], ['x', 'y'])) + '.',
            alts: [{ S: [S[0], [1, -d.b, -d.c2]], code: 'rearr-sign', hint: 'Moving ' + t(N(-2 * d.c2)) + ' across the equals sign changes its sign: ' + t(eqT([2, -2 * d.b, 2 * d.c2], ['x', 'y'])) + '.' },
              { S: [[d.g, d.b, d.g * d.c1], S[1]], code: 'clear-bracket', hint: 'Multiply <b>both</b> terms in the bracket: ' + t(d.g + '(' + lin([1, d.b], ['x', 'y']) + ')=' + lin([d.g, d.g * d.b], ['x', 'y'])) + ' (or simply divide both sides by ' + t(d.g) + ').' }],
            hints: ['Divide the first equation by ' + t(d.g) + '. In the second, move the ' + t('y') + '-term left and the constant right (signs change).', 'Then the ' + t('y') + '-terms are opposites: add.'] });
        } },
        { id: 'e7c', sub: 'c', level: 'PRG', make: function (r) {
          var V = ['a', 'b'], d = find(r, function (r) { var A = r.int(3, 7), B = r.int(2, 6), q = r.int(1, 3), P = [r.int(1, 6), r.int(1, 5)], rr = q * P[1] - P[0], C = A * P[0] - B * P[1]; if (!rr || !C || A * q === B || A === B) return null; return { A: A, B: B, q: q, P: P, rr: rr, C: C }; }, { A: 6, B: 5, q: 2, P: [5, 3], rr: 1, C: 15 });
          var S = [[d.A, -d.B, d.C], [1, -d.q, -d.rr]], e = [genT(S[0], V), (2 * d.q) + 'b=2a' + sgnAdd(2 * d.rr)];
          return solveP({ prompt: sysP(e) + '<br>' + ptPrompt(V), S: S, V: V, e: 0, eqs: e, text: 'rearrange: ' + e.join(', '),
            pre: 'Rearranged: ' + t(eqT(S[0], V)) + '; and ' + t(e[1] + '\\ \\Rightarrow\\ ' + eqT([-2, 2 * d.q, 2 * d.rr], V) + '\\ \\Rightarrow\\ ' + eqT(S[1], V)) + ' (divide by ' + t(-2) + ').',
            alts: [{ S: [[d.A, -d.B, -d.C], S[1]], code: 'rearr-sign', hint: 'Moving the constant across the equals sign changes its sign: ' + t(e[0]) + ' becomes ' + t(eqT(S[0], V)) + '.' },
              { S: [S[0], [1, -d.q, d.rr]], code: 'rearr-sign', hint: 'Watch the signs when you move ' + t('2a') + ' and the constant: ' + t(e[1]) + ' becomes ' + t(eqT(S[1], V)) + '.' }],
            hints: ['Write both as ' + t('Aa+Bb=C') + '. The second simplifies (divide by ' + t(2) + ') to an equation with ' + t('a') + '-coefficient ' + t(1) + '.', 'Scale that one by ' + t(d.A) + ' so the ' + t('a') + '-terms match, then subtract.'] });
        } }] },
      /* ---------------- F ---------------- */
      { num: '8', section: 'Extra practice F — Clearing fractions and decimals first', stem: 'Clear the fractions or decimals (each equation may need its own multiplier), solve by elimination, and verify in the original equations.', parts: [
        { id: 'e8a', sub: 'a', level: 'PRG', make: function (r) {
          var d = find(r, function (r) { var x0 = r.int(-6, 12), y0 = r.int(-6, 9), c1 = x0 / 4 - y0 / 3, c2 = x0 / 6 + y0 / 2; if (!c1 || !c2 || [2, 3, 4, 6, 1].indexOf(toFr(c1)[1]) < 0 || [1, 2, 3, 6].indexOf(toFr(c2)[1]) < 0 || Math.abs(c1) > 6 || Math.abs(c2) > 8) return null; return { P: [x0, y0], c1: c1, c2: c2 }; }, { P: [6, 3], c1: 0.5, c2: 2.5 });
          var e = ['\\dfrac{x}{4}-\\dfrac{y}{3}=' + dfr(d.c1), '\\dfrac{x}{6}+\\dfrac{y}{2}=' + dfr(d.c2)], S = [[3, -4, 12 * d.c1], [1, 3, 6 * d.c2]];
          return solveP({ prompt: t(sysT(e[0], e[1], '6pt')) + '<br>' + ptPrompt(['x', 'y']), S: S, e: 0, eqs: e, text: 'fractions: ' + e.join(', '),
            pre: 'Eq. 1 × ' + t(12) + ': ' + t(eqT(S[0], ['x', 'y'])) + '. Eq. 2 × ' + t(6) + ': ' + t(eqT(S[1], ['x', 'y'])) + '. Now work with the cleared equations.',
            alts: clearAlts(S, [[1 / 4, -1 / 3, d.c1], [1 / 6, 1 / 2, d.c2]], [12, 6]), hints: ['The LCD of the first equation is ' + t(12) + '; of the second, ' + t(6) + '. Multiply every term, both sides.', 'In the cleared system, Eq. 2 × ' + t(3) + ' lines up ' + t('x') + '.'] });
        } },
        { id: 'e8b', sub: 'b', level: 'PRG', make: function (r) {
          var S = find(r, function (r) { var a1 = r.int(2, 7), b2 = r.int(1, 3), a2 = r.int(2, 7); if (!noDiv(a1, a2)) return null; var P = [r.int(1, 5), pickNZ(r, -4, 4)], S = [mk(a1, -2 * b2, P), mk(a2, b2, P)]; return nz(S) && !(S[0][2] % 10 === 0 && S[1][2] % 10 === 0) ? S : null; });
          var raw = S.map(function (q) { return q.map(function (x) { return x / 10; }); }), e = [eqT(raw[0], ['x', 'y']), eqT(raw[1], ['x', 'y'])];
          return solveP({ prompt: sysP(e) + '<br>' + ptPrompt(['x', 'y']), S: S, e: 1, eqs: e, text: 'decimals: ' + e.join(', '),
            pre: 'Multiply both equations by ' + t(10) + ': ' + t(eqT(S[0], ['x', 'y'])) + ' and ' + t(eqT(S[1], ['x', 'y'])) + '.',
            alts: clearAlts(S, raw, [10, 10], 'the decimals'), hints: ['Multiply each equation by ' + t(10) + ' — every term, both sides — to get integer coefficients.', 'Then double the second equation so the ' + t('y') + '-terms are opposites.'] });
        } },
        { id: 'e8c', sub: 'c', level: 'ADV', make: function (r) {
          var d = find(r, function (r) { var x0 = r.int(1, 6), y0 = pickNZ(r, -3, 5), c1 = (11 * x0 - y0) / 12, c2 = (2 * x0 - 3 * y0) / 4; if (!c1 || !c2 || Math.abs(c1) > 8 || toFr(c1)[1] > 6) return null; return { P: [x0, y0], c1: c1, c2: c2 }; }, { P: [4, 2], c1: 3.5, c2: 0.5 });
          var e = ['\\dfrac{2x-y}{3}+\\dfrac{x+y}{4}=' + dfr(d.c1), '\\dfrac{x}{2}-\\dfrac{3y}{4}=' + dfr(d.c2)], S = [[11, -1, 12 * d.c1], [2, -3, 4 * d.c2]];
          return solveP({ prompt: t(sysT(e[0], e[1], '6pt')) + '<br>' + ptPrompt(['x', 'y']), S: S, e: 1, eqs: e, text: 'fractions with binomials: ' + e.join(', '),
            pre: 'Eq. 1 × ' + t(12) + ': ' + t('4(2x-y)+3(x+y)=' + N(12 * d.c1) + '\\ \\Rightarrow\\ 8x-4y+3x+3y=' + N(12 * d.c1) + '\\ \\Rightarrow\\ ' + eqT(S[0], ['x', 'y'])) + '.<br>Eq. 2 × ' + t(4) + ': ' + t(eqT(S[1], ['x', 'y'])) + '. Now work with the cleared equations.',
            alts: [{ S: [[11, 2, 12 * d.c1], S[1]], code: 'clear-bracket', hint: 'The ' + t(4) + ' multiplies <b>both</b> terms of ' + t('(2x-y)') + ': ' + t('4(2x-y)=8x-4y') + '.' }].concat(clearAlts(S, [[11 / 12, -1 / 12, d.c1], [0.5, -0.75, d.c2]], [12, 4])),
            hints: ['Multiply the first equation by ' + t(12) + ': each numerator stays in brackets, ' + t('4(2x-y)+3(x+y)') + '.', 'Then scale the cleared Eq. 1 by ' + t(3) + ' to line up the ' + t('y') + '-terms.'] });
        } }] },
      /* ---------------- G ---------------- */
      { num: '9', section: 'Extra practice G — When both variables vanish', stem: 'Solve each system by elimination. State whether it has one solution, no solution, or infinitely many solutions.', parts: [
        { id: 'e9a', sub: 'a', level: 'PRG', make: function (r) {
          var d = find(r, function (r) { var p = r.int(1, 4), q = -r.int(2, 6); if (gcd(p, q) !== 1) return null; var m1 = r.int(2, 3), m2 = r.pick([-2, -3, 2, 3]); if (Math.abs(m1) === Math.abs(m2)) return null; var c1 = pickNZ(r, -12, 12), c2 = pickNZ(r, -12, 12); if (c1 * m2 === c2 * m1) return null; return [[m1 * p, m1 * q, c1], [m2 * p, m2 * q, c2]]; });
          var e = E2(d); return special({ prompt: sysP(e) + '<br>Give the solution: an ordered pair, <b>no solution</b>, or <b>infinitely many</b>.', target: 'none', eqs: e, text: 'special (parallel): ' + e.join(', '), sol: vanishSol(d, ['x', 'y'], 'none'), hints: ['Scale to line up ' + t('x') + ' and combine. What is left?', 'A false statement with no variables means no solution.'] });
        } },
        { id: 'e9b', sub: 'b', level: 'PRG', make: function (r) {
          var d = find(r, function (r) { var p = r.int(1, 3), q = pickNZ(r, -4, 4), rr = pickNZ(r, -6, 6); if (gcd(gcd(p, q), rr) !== 1) return null; var m1 = r.int(2, 3), m2 = r.pick([-2, -3, 2, 3]); if (Math.abs(m1) === Math.abs(m2)) return null; return [[m1 * p, m1 * q, m1 * rr], [m2 * p, m2 * q, m2 * rr]]; });
          var e = E2(d); return special({ prompt: sysP(e) + '<br>Give the solution: an ordered pair, <b>no solution</b>, or <b>infinitely many</b>.', target: 'inf', eqs: e, text: 'special (same line): ' + e.join(', '), sol: vanishSol(d, ['x', 'y'], 'inf'), hints: ['Scale to line up ' + t('x') + ' and combine. What is left?', 'Divide each equation by a common factor and compare.'] });
        } },
        { id: 'e9c', sub: 'c', level: 'PRG', make: function (r) {
          var S = find(r, function (r) { var g = r.int(2, 3), p = r.int(2, 4), q = -r.int(1, 3); if (gcd(p, q) !== 1) return null; var a2 = r.int(2, 7), b2 = -r.int(2, 7); if (!noDiv(g * p, a2) || !noDiv(g * q, b2) || near(g * p * b2 - g * q * a2, 0)) return null; var P = [pickNZ(r, -3, 3), pickNZ(r, -3, 3)], S = [mk(g * p, g * q, P), mk(a2, b2, P)]; return nz(S) ? S : null; });
          var e = E2(S); return solveP({ prompt: sysP(e) + '<br>Give the solution: an ordered pair, <b>no solution</b>, or <b>infinitely many</b>.', S: S, eqs: e, text: 'looks parallel, one solution: ' + e.join(', '), post: 'The slopes ' + t(N(-S[0][0] / S[0][1], true)) + ' and ' + t(N(-S[1][0] / S[1][1], true)) + ' are different, so the lines meet at exactly one point.' });
        } },
        { id: 'e9d', sub: 'd', level: 'EMG', make: function (r) {
          var z = pickNZ(r, -40, 40);
          return mcP(r, 'In two systems like these, both variables vanished — one left ' + t('0=' + z) + ', the other ' + t('0=0') + '. How does the surviving statement alone tell you which case you are in?', [
            { html: 'A <b>false</b> statement (' + t('0=' + z) + ') means no ' + t('(x,\\ y)') + ' works: <b>no solution</b>, parallel distinct lines. A <b>true</b> statement (' + t('0=0') + ') puts no restriction on ' + t('(x,\\ y)') + ': <b>infinitely many</b> solutions, the same line.', right: true },
            { html: t('0=' + z) + ' means infinitely many solutions; ' + t('0=0') + ' means no solution.', why: 'Swap them: a false statement can never be satisfied, so there is no solution; ' + t('0=0') + ' is always true.' },
            { html: t('0=0') + ' means the solution is ' + t('(0,\\ 0)') + '; ' + t('0=' + z) + ' means ' + t('x=' + z) + '.', why: 'Both variables are gone — nothing is left to solve for. Only a number statement remains, and it is either true or false.' },
            { html: 'Both mean an arithmetic slip: start again with substitution.', why: 'Substitution would end in the same kind of statement. When both variables vanish, the lines are parallel — the statement says which kind.' }],
            'Both variables vanish only when the left sides are multiples of each other (parallel lines). The statement left behind decides: false (' + t('0=' + z) + ') → <b>no solution</b>, parallel and distinct; true (' + t('0=0') + ') → <b>infinitely many</b>, the same line.',
            ['Can any point make ' + t('0=' + z) + ' true? Which points make ' + t('0=0') + ' true?'], 'meaning of 0=c vs 0=0');
        } }] },
      /* ---------------- H ---------------- */
      { num: '10', section: 'Extra practice H — Elimination or substitution?', stem: 'For each system, choose the method you would use and the best reason. <b>Do not solve them here.</b>', parts: [
        { id: 'e10a', sub: 'a', level: 'BEG', make: function (r) { return methodMC(r, 'iso', methodSys(r, 'iso')); } },
        { id: 'e10b', sub: 'b', level: 'BEG', make: function (r) { return methodMC(r, 'match', methodSys(r, 'match')); } },
        { id: 'e10c', sub: 'c', level: 'EMG', make: function (r) { return methodMC(r, 'one', methodSys(r, 'one')); } },
        { id: 'e10d', sub: 'd', level: 'EMG', make: function (r) { return methodMC(r, 'none', methodSys(r, 'none')); } }] },
      { num: '11', stem: 'Solve each system by the method you would choose, and verify both solutions in both original equations.', parts: [
        { id: 'e11a', sub: 'a', level: 'BEG', make: function (r) { var S = methodSys(r, 'match').S, e = E2(S); return solveP({ prompt: 'A system like 10(b): ' + sysP(e) + '<br>' + ptPrompt(['x', 'y']), S: S, e: 0, eqs: e, text: 'matching x: ' + e.join(', ') }); } },
        { id: 'e11b', sub: 'b', level: 'PRG', make: function (r) { var S = methodSys(r, 'none').S, e = E2(S); return solveP({ prompt: 'A system like 10(d): ' + sysP(e) + '<br>' + ptPrompt(['x', 'y']), S: S, eqs: e, text: 'scale both: ' + e.join(', ') }); } }] },
      /* ---------------- I ---------------- */
      { num: '12', section: 'Extra practice I — Error analysis',
        shared: function (r) { return find(r, function (r) { var a1 = r.int(3, 7), b = r.int(1, 3), P = [r.int(2, 6), pickNZ(r, -3, 3)], c1 = a1 * P[0] + 2 * b * P[1], c2 = P[0] - b * P[1]; if (!c1 || !c2) return null; var xs = (c1 + c2) / (a1 + 2), ys = (c1 - a1 * xs) / (2 * b); if (toFr(xs)[1] > 9 || toFr(ys)[1] > 12) return null; return { a1: a1, b: b, P: P, c1: c1, c2: c2, xs: xs, ys: ys, S: [[a1, 2 * b, c1], [1, -b, c2]] }; }, { a1: 5, b: 2, P: [5, -1], c1: 21, c2: 7, xs: 4, ys: 0.25, S: [[5, 4, 21], [1, -2, 7]] }); },
        stem: function (sh) { var S = sh.S; return 'Asked to solve ' + t(eqT(S[0], ['x', 'y'])) + ' and ' + t(eqT(S[1], ['x', 'y'])) + ' by elimination, a student wrote:<br>' + t('\\text{Eq. 2}\\times 2:\\ ' + eqT([2, -2 * sh.b, sh.c2], ['x', 'y'])) + '<br>' + t('\\text{Eq. 1}+\\text{Eq. 2}:\\ ' + (sh.a1 + 2) + 'x=' + (sh.c1 + sh.c2) + ',\\ x=' + N(sh.xs, true)) + '<br>' + t(sh.a1 + PB(sh.xs, true) + '+' + 2 * sh.b + 'y=' + sh.c1 + ',\\ y=' + N(sh.ys, true)); },
        parts: [
          { id: 'e12a', sub: 'a', level: 'EMG', make: function (r, sh) {
            return stepPart('Name the error by writing Eq. 2 multiplied by ' + t(2) + ' correctly.', [2, -2 * sh.b, 2 * sh.c2],
              { wrong: [{ is: [2, -2 * sh.b, sh.c2], code: 'elim-const', hint: 'That is the student’s line. Multiplying by ' + t(2) + ' must double <b>every</b> term — the right side too.' }, { is: [1, -sh.b, sh.c2], code: 'elim-const', hint: 'That is the original Eq. 2. Multiply every term by ' + t(2) + '.' }], placeholder: '6x + 2y = 10', stepHint: 'Write the doubled equation itself, with every term multiplied by 2.' },
              'The student doubled only the left side. Multiplying by ' + t(2) + ' must double every term: ' + t('2(' + lin([1, -sh.b], ['x', 'y']) + ')=2(' + sh.c2 + ')\\ \\Rightarrow\\ ' + eqT([2, -2 * sh.b, 2 * sh.c2], ['x', 'y'])) + '.',
              ['Multiply each of the three numbers in Eq. 2 by ' + t(2) + '.'], 'scale Eq. 2 correctly');
          } },
          { id: 'e12b', sub: 'b', level: 'EMG', make: function (r, sh) { var e = E2(sh.S); return solveP({ prompt: 'Solve the system correctly. ' + ptPrompt(['x', 'y']), S: sh.S, e: 1, eqs: e, text: 'error analysis, solve: ' + e.join(', '), wrong: [{ is: [sh.xs, sh.ys], code: 'elim-const', hint: 'That is the student’s answer. Eq. 2 × ' + t(2) + ' is ' + t(eqT([2, -2 * sh.b, 2 * sh.c2], ['x', 'y'])) + ' — the right side is doubled too.' }] }); } },
          { id: 'e12c', sub: 'c', level: 'PRG', make: function (r, sh) {
            var S = sh.S, Q = [sh.xs, sh.ys], v2 = S[1][0] * Q[0] + S[1][1] * Q[1];
            return mcP(r, 'The student’s pair ' + t(ptT(Q, true)) + ' satisfies Eq. 1 but not Eq. 2. Why could checking in Eq. 1 alone <b>never</b> have caught this mistake?', [
              { html: 'The student found ' + t('y') + ' by substituting into Eq. 1, so Eq. 1 is guaranteed to balance whatever ' + t('x') + ' was. Only the other equation tests the work.', right: true },
              { html: 'Eq. 1 has bigger coefficients, so small errors don’t show up in it.', why: 'Size has nothing to do with it: ' + t('y') + ' was calculated <i>from</i> Eq. 1, so Eq. 1 must work.' },
              { html: 'The pair really satisfies both equations; the mistake was only in the working.', why: 'Try Eq. 2: ' + t(subT(S[1], Q, true).replace(/=.*/, '') + '=' + N(v2, true) + '\\ne ' + S[1][2]) + '.' },
              { html: 'Checking in Eq. 1 would catch it if the student used decimals instead of fractions.', why: 'Exact or decimal, Eq. 1 still balances — ' + t('y') + ' was chosen to make it balance.' }],
              'In Eq. 1: ' + t(subT(S[0], Q, true)) + ' ✓ — it passes. In Eq. 2: ' + t(subT(S[1], Q, true).replace(/=.*/, '') + '=' + N(v2, true) + '\\ne ' + S[1][2]) + ' ✗.<br>Because ' + t('y') + ' came from Eq. 1, Eq. 1 is satisfied no matter how wrong ' + t('x') + ' was. That is why a solution must be checked in <b>both</b> original equations.',
              ['Which equation did the student use to find ' + t('y') + '?'], 'why check both equations');
          } }] },
      { num: '13',
        shared: function (r) { return find(r, function (r) { var a2 = r.int(2, 5), b = r.int(2, 6), P = [r.int(1, 5), pickNZ(r, -3, 3)], S = [mk(a2 + 1, b, P), mk(a2, -b, P)]; return nz(S) && S[0][2] !== S[1][2] ? { S: S, P: P, b: b } : null; }, { S: [[3, 5, 4], [2, -5, 11]], P: [3, -1], b: 5 }); },
        stem: function (sh) { var S = sh.S; return 'Asked to solve ' + t(eqT(S[0], ['x', 'y'])) + ' and ' + t(eqT(S[1], ['x', 'y'])) + ', a student wrote: “Both equations contain ' + t(sh.b + 'y') + ', so I subtract. Eq. 1 − Eq. 2 gives ' + t('x=' + (S[0][2] - S[1][2])) + '.”'; },
        parts: [
          { id: 'e13a', sub: 'a', level: 'EMG', make: function (r, sh) {
            var S = sh.S, T = [1, 2 * sh.b, S[0][2] - S[1][2]];
            return stepPart('Carry out Eq. 1 − Eq. 2 correctly. What equation do you get?', T,
              { wrong: [{ is: [1, 0, S[0][2] - S[1][2]], code: 'elim-sub-sign', hint: 'Subtracting ' + t('-' + sh.b + 'y') + ' <b>adds</b> ' + t(sh.b + 'y') + ': ' + t(sh.b + 'y-(-' + sh.b + 'y)=' + 2 * sh.b + 'y') + '. So ' + t('y') + ' is not eliminated.' },
                { is: [1, 2 * sh.b, S[0][2] + S[1][2]], code: 'elim-rhs', hint: 'Subtract the right sides too: ' + t(S[0][2] + '-' + NP(S[1][2]) + '=' + (S[0][2] - S[1][2])) + '.' },
                { is: [S[0][0] + S[1][0], 0, S[0][2] + S[1][2]], code: 'eq', hint: 'That is Eq. 1 <b>+</b> Eq. 2 — the right move here! But first carry out the student’s Eq. 1 − Eq. 2 to see what goes wrong.' }], placeholder: '2x + 3y = 7', stepHint: 'Give the equation exactly as the subtraction produces it.' },
              t('(' + lin([S[0][0], S[0][1]], ['x', 'y']) + ')-(' + lin([S[1][0], S[1][1]], ['x', 'y']) + ')=' + S[0][2] + '-' + NP(S[1][2]) + '\\ \\Rightarrow\\ ' + eqT(T, ['x', 'y'])) + '.<br>' + t('y') + ' is <b>not</b> eliminated: subtracting ' + t('-' + sh.b + 'y') + ' added ' + t(sh.b + 'y') + '. The coefficients ' + t('+' + sh.b) + ' and ' + t('-' + sh.b) + ' are <b>opposite</b>, so the equations must be <b>added</b>.',
              ['Write it as a bracketed difference and change the sign of every term in the second bracket.'], 'carry out Eq.1 − Eq.2');
          } },
          { id: 'e13b', sub: 'b', level: 'BEG', make: function (r, sh) { var e = E2(sh.S); return solveP({ prompt: 'Solve the system correctly. ' + ptPrompt(['x', 'y']), S: sh.S, e: 1, eqs: e, text: 'error analysis, solve: ' + e.join(', ') }); } },
          { id: 'e13c', sub: 'c', level: 'PRG', make: function (r, sh) {
            var S = sh.S, T = [1, 2 * sh.b, S[0][2] - S[1][2]], q = eqT(T, ['x', 'y']);
            return mcP(r, 'The equation ' + t(q) + ' is <b>true</b> at the correct solution ' + t(ptT(sh.P)) + '. Why is it still useless for solving the system?', [
              { html: 'It still contains <b>both</b> variables: it is just a third line through the solution, not an equation in one unknown.', right: true },
              { html: 'It is false, so the student has to start again.', why: 'Check: ' + t(subT(T, sh.P)) + '. It is true — it just doesn’t help.' },
              { html: 'It is useful: it gives ' + t('x=' + T[2]) + ' directly.', why: 'That is the student’s second error — dropping the ' + t(2 * sh.b + 'y') + '. With it still there, ' + t('x') + ' can’t be read off.' },
              { html: 'Any true combination of the two equations solves the system.', why: 'Only a combination with <b>one</b> variable left lets you solve. This one kept both.' }],
              'At ' + t(ptT(sh.P)) + ': ' + t(subT(T, sh.P)) + ' ✓. Any sum or difference of two true equations is true, so this line passes through the solution — but it still has both variables, so it replaces the system with a third line instead of reducing it to one unknown. (The student then dropped the ' + t(2 * sh.b + 'y') + ' — a second error.)',
              ['How many variables are left in that equation?'], 'true but useless combination');
          } }] },
      { num: '14',
        shared: function (r) { return find(r, function (r) { var a = r.int(2, 3), b = r.int(3, 6), m = r.int(2, 3), b2 = -r.int(3, 8), P = [r.int(1, 5), r.int(1, 4)], S = [mk(a, b, P), mk(m * a, b2, P)]; if (!nz(S) || gcd(a, b) !== 1) return null; var xs = (S[0][2] - m * b * P[1]) / (m * a); return near(xs, P[0]) ? null : { S: S, P: P, m: m, xs: xs }; }, { S: [[2, 5, 16], [6, -7, 4]], P: [3, 2], m: 3, xs: -7 / 3 }); },
        stem: function (sh) { var S = sh.S, m = sh.m, E = scaled(S[0], m); return 'Asked to solve ' + t(eqT(S[0], ['x', 'y'])) + ' and ' + t(eqT(S[1], ['x', 'y'])) + ', a student wrote:<br>' + t('\\text{Eq. 1}\\times ' + m + ':\\ ' + eqT(E, ['x', 'y'])) + '<br>' + t('(\\text{Eq. 1}\\times ' + m + ')-\\text{Eq. 2}:\\ ' + lin([E[1] - S[1][1]], ['y']) + '=' + (E[2] - S[1][2]) + ',\\ y=' + sh.P[1]) + '<br>' + t(lin([E[0]], ['x']) + '+' + E[1] + '(' + sh.P[1] + ')=' + S[0][2] + ',\\ x=' + N(sh.xs, true)); },
        parts: [
          { id: 'e14a', sub: 'a', level: 'EMG', make: function (r, sh) {
            var S = sh.S, m = sh.m, E = scaled(S[0], m);
            var p = K.P.number('Verify the student’s ' + t('y') + '-value: eliminate ' + t('x') + ' yourself. What is ' + t('y') + '?', sh.P[1], function (v) { return v === -sh.P[1] ? { code: 'sign', hint: 'Check the sign: subtract every term of the second bracket.' } : null; },
              t('(' + lin([E[0], E[1]], ['x', 'y']) + ')-(' + lin([S[1][0], S[1][1]], ['x', 'y']) + ')=' + E[2] + '-' + NP(S[1][2]) + '\\ \\Rightarrow\\ ' + lin([E[1] - S[1][1]], ['y']) + '=' + (E[2] - S[1][2]) + '\\ \\Rightarrow\\ y=' + sh.P[1]) + '. The student’s ' + t('y') + ' is correct.',
              ['Eq. 1 × ' + t(m) + ' matches the ' + t('x') + '-terms; then subtract Eq. 2.'], 'verify y');
            p.input.before = t('y=');
            return p;
          } },
          { id: 'e14b', sub: 'b', level: 'EMG', make: function (r, sh) {
            var S = sh.S, m = sh.m, E = scaled(S[0], m), y = sh.P[1];
            return K.P.math('The student’s ' + t('x') + ' is wrong. Substitute ' + t('y=' + y) + ' into an equation that is safe to use and find ' + t('x') + ' correctly.', K.value(sh.P[0], { diag: function (v) { return near(v, sh.xs) ? { code: 'elim-backsub', hint: 'That is the student’s value: it uses the scaled left side ' + t(lin([E[0], E[1]], ['x', 'y'])) + ' with the original right side ' + t(S[0][2]) + '. Use an <b>original</b> equation (or the scaled one with ' + t(E[2]) + ').' } : null; } }), String(sh.P[0]),
              'The scaled equation is ' + t(eqT(E, ['x', 'y'])) + ', not ' + t(lin([E[0], E[1]], ['x', 'y']) + '=' + S[0][2]) + ': the student used the scaled left side with the old right side. The two always-safe equations are the <b>originals</b>.<br>' + t(backT(S[0], 0, y, ['x', 'y'])),
              ['Use one of the two original equations.'], 'find x correctly', { keys: 'fraction', before: t('x=') });
          } },
          { id: 'e14c', sub: 'c', level: 'EMG', make: function (r, sh) {
            var S = sh.S, m = sh.m, E = scaled(S[0], m), Q = [sh.xs, sh.P[1]];
            return mcP(r, 'What exactly went wrong in the student’s last line?', [
              { html: 'The student substituted into the scaled left side ' + t(lin([E[0], E[1]], ['x', 'y'])) + ' but kept the original right side ' + t(S[0][2]) + ' instead of ' + t(E[2]) + '.', right: true },
              { html: 'The value ' + t('y=' + sh.P[1]) + ' is wrong.', why: t('y=' + sh.P[1]) + ' is right: the subtraction gives ' + t(lin([E[1] - S[1][1]], ['y']) + '=' + (E[2] - S[1][2])) + '.' },
              { html: 'Multiplying Eq. 1 by ' + t(m) + ' was a mistake: scaling changes the solution.', why: 'Scaling every term keeps the equation equivalent — ' + t(eqT(E, ['x', 'y'])) + ' gives the right ' + t('x') + ' too.' },
              { html: 'The student should have added the equations instead of subtracting.', why: 'After scaling, the ' + t('x') + '-terms are both ' + t(E[0] + 'x') + ' — equal, so subtracting was right.' }],
              'The scaled equation is ' + t(eqT(E, ['x', 'y'])) + '; the student paired its left side with ' + t(S[0][2]) + '. With the correct ' + t('x=' + sh.P[0]) + ': ' + t(subT(S[0], sh.P)) + ' ✓ and ' + t(subT(S[1], sh.P)) + ' ✓. The student’s pair ' + t(ptT(Q, true)) + ' fails both originals.',
              ['Compare the student’s last line with the scaled equation two lines above.'], 'back-substitution error');
          } }] },
      /* ---------------- J ---------------- */
      { num: '15', section: 'Extra practice J — Stretch',
        shared: function (r) { return find(r, function (r) { var A = pickNZ(r, -5, 5), B = pickNZ(r, -5, 5), p = r.int(1, 4), q = r.pick([-4, -3, -2, 2, 3]); if (Math.abs(A) < 2 && Math.abs(B) < 2) return null; var c1 = A * p + B * q, c2 = B * p - A * q; return c1 && c2 && p !== Math.abs(q) ? { A: A, B: B, p: p, q: q, c1: c1, c2: c2 } : null; }, { A: 4, B: -1, p: 3, q: -2, c1: 14, c2: 5 }); },
        stem: function (sh) { return 'Determine the values of ' + t('A') + ' and ' + t('B') + ' for which the ordered pair ' + t('(' + sh.p + ',\\ ' + sh.q + ')') + ' is the solution of the system ' + t(sysT('Ax+By=' + sh.c1, 'Bx-Ay=' + sh.c2)); },
        parts: [
          { id: 'e15a', sub: 'a', level: 'ADV', make: function (r, sh) {
            var V = ['A', 'B'], T1 = [sh.p, sh.q, sh.c1], T2 = [-sh.q, sh.p, sh.c2];
            var p = K.P.system('Substitute ' + t('x=' + sh.p) + ' and ' + t('y=' + sh.q) + ' into each equation to form a system of two equations in ' + t('A') + ' and ' + t('B') + '.', [{ A: T1[0], B: T1[1], C: -T1[2] }, { A: T2[0], B: T2[1], C: -T2[2] }],
              { vars: V, keyTex: [eqT(T1, V), eqT(T2, V)], labels: ['From Eq. 1', 'From Eq. 2'], diag: function (resp) {
                var bad = [sh.q, sh.p, sh.c2]; for (var i = 0; i < 2; i++) { var rr = Ln.read(resp[i], V); if (rr.ok && near(rr.a * bad[1] - rr.b * bad[0], 0) && near(rr.a * -bad[2] - rr.c * bad[0], 0)) return { code: 'rearr-sign', hint: 'Careful with ' + t('-Ay') + ': with ' + t('y=' + sh.q) + ' it becomes ' + t('-A' + PB(sh.q) + '=' + lin([-sh.q], ['A'])) + '.' }; }
                return null; } },
              'Into ' + t('Ax+By=' + sh.c1) + ': ' + t(eqT(T1, V)) + '.<br>Into ' + t('Bx-Ay=' + sh.c2) + ': ' + t(sh.p + 'B-A' + PB(sh.q) + '=' + sh.c2) + ', i.e. ' + t(eqT(T2, V)) + '.',
              ['Here ' + t('x') + ' and ' + t('y') + ' are known numbers and ' + t('A') + ', ' + t('B') + ' are the unknowns.'], 'form system in A, B');
            p.bad = [[eqT(T1, V), eqT([sh.q, sh.p, sh.c2], V)]];
            return p;
          } },
          { id: 'e15b', sub: 'b', level: 'PRG', make: function (r, sh) { var V = ['A', 'B'], S = [[sh.p, sh.q, sh.c1], [-sh.q, sh.p, sh.c2]], e = E2(S, V); return solveP({ prompt: 'Solve the system ' + sysP(e) + ' by elimination. ' + ptPrompt(V), S: S, V: V, eqs: e, text: 'solve for A, B: ' + e.join(', ') }); } },
          { id: 'e15c', sub: 'c', level: 'EMG', make: function (r, sh) {
            var T1 = [sh.A, sh.B, sh.c1], T2 = [sh.B, -sh.A, sh.c2];
            return K.P.system('With ' + t('A=' + sh.A) + ' and ' + t('B=' + sh.B) + ', write out the original system.', [{ A: T1[0], B: T1[1], C: -T1[2] }, { A: T2[0], B: T2[1], C: -T2[2] }], { keyTex: [eqT(T1, ['x', 'y']), eqT(T2, ['x', 'y'])] },
              'The system becomes ' + t(eqT(T1, ['x', 'y'])) + ' and ' + t(eqT(T2, ['x', 'y'])) + '.<br>Check ' + t('(' + sh.p + ',\\ ' + sh.q + ')') + ': ' + t(subT(T1, [sh.p, sh.q])) + ' ✓ and ' + t(subT(T2, [sh.p, sh.q])) + ' ✓',
              ['Replace ' + t('A') + ' and ' + t('B') + ' in ' + t('Ax+By') + ' and ' + t('Bx-Ay') + ' — watch the sign in ' + t('-Ay') + '.'], 'write the system');
          } }] },
      { num: '16',
        shared: function (r) { return find(r, function (r) { var a = r.int(2, 5), b = r.int(2, 4), x0 = pickNZ(r, -3, 3), y0 = pickNZ(r, -3, 3), k = r.int(1, 9); if (k === 2 * a) return null; var c2 = a * x0 + b * y0, c1 = k * x0 + 2 * b * y0; return c1 && c2 ? { a: a, b: b, P: [x0, y0], k: k, c1: c1, c2: c2 } : null; }, { a: 4, b: 3, P: [1, 1], k: 3, c1: 9, c2: 7 }); },
        stem: function (sh) { return 'In the system ' + t(sysT('kx+' + 2 * sh.b + 'y=' + sh.c1, eqT([sh.a, sh.b, sh.c2], ['x', 'y']))) + ', ' + t('k') + ' is a constant.'; },
        parts: [
          { id: 'e16a', sub: 'a', level: 'ADV', make: function (r, sh) {
            var A2 = 2 * sh.a, R = sh.c1 - 2 * sh.c2;
            return K.P.fields('Eliminate ' + t('y') + ' (Eq. 1 − 2 × Eq. 2). Complete the result.', [{ name: 'Inside the bracket', before: t('(k-'), after: t(')\\,x') }, { name: 'Right side', before: t('=') }],
              [K.number(A2, function (v) { return v === sh.a ? { code: 'elim-const', hint: 'Doubling Eq. 2 doubles every term: ' + t('2(' + sh.a + 'x)=' + A2 + 'x') + '.' } : null; }),
                K.number(R, function (v) { return v === sh.c1 - sh.c2 ? { code: 'elim-const', hint: 'Doubling Eq. 2 doubles its right side too: ' + t('2\\times' + NP(sh.c2) + '=' + 2 * sh.c2) + '.' } : v === -R ? { code: 'elim-rhs', hint: 'Keep the same order on both sides: Eq. 1 − 2 × Eq. 2, so the right side is ' + t(sh.c1 + '-' + NP(2 * sh.c2)) + '.' } : null; })],
              [String(A2), String(R)], t('(k-' + A2 + ')x=' + R),
              'Eq. 2 × ' + t(2) + ': ' + t(eqT([A2, 2 * sh.b, 2 * sh.c2], ['x', 'y'])) + '. The ' + t('y') + '-terms match, so subtract:<br>' + t('(kx+' + 2 * sh.b + 'y)-(' + A2 + 'x+' + 2 * sh.b + 'y)=' + sh.c1 + '-' + NP(2 * sh.c2) + '\\ \\Rightarrow\\ (k-' + A2 + ')x=' + R),
              ['Double Eq. 2 so both ' + t('y') + '-terms are ' + t(2 * sh.b + 'y') + ', then subtract.'], 'eliminate y with k');
          } },
          { id: 'e16b', sub: 'b', level: 'ADV', make: function (r, sh) {
            var A2 = 2 * sh.a, R = sh.c1 - 2 * sh.c2;
            var p = K.P.number('For what value of ' + t('k') + ' does the system have <b>no solution</b>? (Eliminating ' + t('y') + ' gives ' + t('(k-' + A2 + ')x=' + R) + '.)', A2, function (v) { return v === sh.a ? { code: 'elim-const', hint: 'Use the eliminated equation: ' + t('(k-' + A2 + ')x=' + R) + '. Which ' + t('k') + ' makes the left side ' + t('0') + '?' } : null; },
              'With ' + t('k=' + A2) + ' the equation becomes ' + t('0x=' + R) + ', i.e. ' + t('0=' + R) + ' — false for every ' + t('x') + ', so <b>no solution</b>.<br>By slopes: ' + t('y=-\\frac{k}{' + 2 * sh.b + '}x+' + N(sh.c1 / (2 * sh.b), true)) + ' and ' + t('y=-\\frac{' + A2 + '}{' + 2 * sh.b + '}x+' + N(sh.c2 / sh.b, true)) + ': equal slopes exactly when ' + t('k=' + A2) + ', and the intercepts differ — parallel, distinct lines.',
              ['When is the coefficient ' + t('k-' + A2) + ' zero? What statement is left then?'], 'k for no solution');
            p.input.before = t('k='); return p;
          } },
          { id: 'e16c', sub: 'c', level: 'PRG', make: function (r, sh) {
            var A2 = 2 * sh.a, R = sh.c1 - 2 * sh.c2;
            return mcP(r, 'Is there a value of ' + t('k') + ' giving <b>infinitely many</b> solutions? (Eliminating ' + t('y') + ' gives ' + t('(k-' + A2 + ')x=' + R) + '.)', [
              { html: '<b>No</b>: infinitely many solutions would need ' + t('0=0') + ', i.e. ' + t('k-' + A2 + '=0') + ' <i>and</i> ' + t(R + '=0') + ' — and ' + t(R + '=0') + ' is impossible.', right: true },
              { html: '<b>Yes</b>, ' + t('k=' + A2) + ': then the coefficient of ' + t('x') + ' is ' + t('0') + '.', code: 'coincident', why: 'With ' + t('k=' + A2) + ' the statement is ' + t('0=' + R) + ' — false. That is parallel lines (no solution), not the same line.' },
              { html: '<b>Yes</b>, every ' + t('k') + ' except ' + t(A2) + '.', why: 'Those give exactly one solution, ' + t('x=\\frac{' + R + '}{k-' + A2 + '}') + '.' },
              { html: '<b>Yes</b>, ' + t('k=0') + '.', why: t('k=0') + ' gives ' + t(-A2 + 'x=' + R) + ': exactly one solution.' }],
              'The lines coincide only if ' + t('kx+' + 2 * sh.b + 'y=' + sh.c1) + ' is a multiple of ' + t(eqT([sh.a, sh.b, sh.c2], ['x', 'y'])) + '. Matching the ' + t('y') + '-terms means doubling: ' + t(eqT([A2, 2 * sh.b, 2 * sh.c2], ['x', 'y'])) + ', whose constant is ' + t(2 * sh.c2) + ', never ' + t(sh.c1) + '. So <b>no value of k</b> works.',
              ['Infinitely many solutions needs a true statement like ' + t('0=0') + '. Can the right side ' + t(R) + ' ever be ' + t('0') + '?'], 'k for infinitely many');
          } },
          { id: 'e16d', sub: 'd', level: 'PRG', make: function (r, sh) { var S = [[sh.k, 2 * sh.b, sh.c1], [sh.a, sh.b, sh.c2]], e = [eqT(S[0], ['x', 'y']), eqT(S[1], ['x', 'y'])]; return solveP({ prompt: 'Take ' + t('k=' + sh.k) + ': solve ' + sysP(e) + ' completely. ' + ptPrompt(['x', 'y']), S: S, e: 1, eqs: e, text: 'k = ' + sh.k + ': ' + e.join(', ') }); } }] },
      /* ---------------- K ---------------- */
      { num: '17', section: 'Extra practice K — Multiple choice and numerical response', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: 'e17', level: 'EMG', make: function (r) {
          var d = find(r, function (r) {
            var pr = r.pick([[6, 4], [6, 9], [4, 10], [6, 8], [9, 12], [10, 4], [8, 12], [4, 6], [9, 6]]), a1 = pr[0], a2 = pr[1], L = lcm(a1, a2), b1 = -r.int(2, 9), b2 = r.int(2, 9);
            var opts = [[a2, a1], [L / a1, L / a2], [L / a2, L / a1], [b2, -b1]], keys = opts.map(function (o) { return o.join(); });
            if (keys.filter(function (k, i) { return keys.indexOf(k) === i; }).length < 4 || gcd(b1, b2) !== 1) return null;
            var P = [pickNZ(r, -3, 4), pickNZ(r, -3, 3)], S = [mk(a1, b1, P), mk(a2, b2, P)]; return nz(S) ? { S: S, opts: opts, L: L } : null;
          }, { S: [[6, -5, 13], [4, 9, -1]], opts: [[4, 6], [2, 3], [3, 2], [9, 5]], L: 12 });
          var S = d.S, o = d.opts, h = function (p) { return t('\\times ' + p[0]) + ' and ' + t('\\times ' + p[1]); };
          return mcP(r, 'To eliminate ' + t('x') + ' from ' + t(eqT(S[0], ['x', 'y'])) + ' and ' + t(eqT(S[1], ['x', 'y'])) + ', the <i>smallest</i> whole-number multipliers for the first and second equations respectively are', [
            { html: h(o[1]), right: true },
            { html: h(o[0]), why: 'That works (' + t(S[0][0] * o[0][0] + 'x') + ' in both), but it isn’t the smallest: the LCM of ' + t(S[0][0]) + ' and ' + t(S[1][0]) + ' is ' + t(d.L) + '.' },
            { html: h(o[2]), why: 'Those give ' + t(S[0][0] * o[2][0] + 'x') + ' and ' + t(S[1][0] * o[2][1] + 'x') + ' — they don’t match. Divide the LCM by each coefficient in turn.' },
            { html: h(o[3]), why: 'Those line up the ' + t('y') + '-terms (' + t(Math.abs(S[0][1] * o[3][0]) + 'y') + '), not ' + t('x') + '.' }],
            'LCM' + t('(' + S[0][0] + ',\\ ' + S[1][0] + ')=' + d.L) + '. ' + t(d.L + '\\div' + S[0][0] + '=' + o[1][0]) + ' and ' + t(d.L + '\\div' + S[1][0] + '=' + o[1][1]) + ', so Eq. 1 × ' + t(o[1][0]) + ' and Eq. 2 × ' + t(o[1][1]) + ': ' + t(eqT(scaled(S[0], o[1][0]), ['x', 'y'])) + ' and ' + t(eqT(scaled(S[1], o[1][1]), ['x', 'y'])) + '; subtracting removes ' + t('x') + '.',
            ['Find the LCM of the two ' + t('x') + '-coefficients, then divide it by each coefficient.'], 'smallest multipliers to eliminate x');
        } }] },
      { num: '18', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: 'e18', level: 'PRG', make: function (r) {
          var d = find(r, function (r) { var p = r.int(1, 4), q = r.int(2, 5); if (gcd(p, q) !== 1) return null; var rr = pickNZ(r, -6, 6), m1 = r.int(2, 4), m2 = r.pick([-2, -3, -4, 2, 3]); if (Math.abs(m1) === Math.abs(m2)) return null; return { p: p, q: q, rr: rr, m1: m1, m2: m2 }; }, { p: 2, q: 3, rr: 5, m1: 4, m2: -3 });
          var e1 = eqT([d.m1 * d.p, -d.m1 * d.q, d.m1 * d.rr], ['x', 'y']), e2 = lin([d.m2 * d.p, -d.m2 * d.q], ['x', 'y']) + '=k', k = d.m2 * d.rr, c1 = d.m1 * d.rr;
          return mcP(r, 'The system ' + t(e1) + ' and ' + t(e2) + ' has infinitely many solutions when ' + t('k') + ' equals', [
            { html: t(k), right: true },
            { html: t(-k), why: 'Check the sign: ' + t(e2) + ' is ' + t(NP(d.m2) + '(' + lin([d.p, -d.q], ['x', 'y']) + ')') + ', so ' + t('k') + ' must be ' + t(NP(d.m2) + '\\times' + NP(d.rr)) + '.' },
            { html: t(c1), why: 'Copying ' + t(c1) + ' doesn’t make the lines the same: the left sides are different multiples of ' + t(lin([d.p, -d.q], ['x', 'y'])) + ', so the right sides must scale the same way.' },
            { html: t(-c1), why: 'Changing the sign of ' + t(c1) + ' isn’t enough: the right side must scale by the same factor as the left side, ' + t(N(d.m2 / d.m1, true)) + '.' }],
            'Divide: ' + t(e1) + ' by ' + t(d.m1) + ' gives ' + t(eqT([d.p, -d.q, d.rr], ['x', 'y'])) + '; ' + t(e2) + ' by ' + t(NP(d.m2)) + ' gives ' + t(lin([d.p, -d.q], ['x', 'y']) + '=\\frac{k}{' + d.m2 + '}') + '. The same line only when ' + t('\\frac{k}{' + d.m2 + '}=' + d.rr) + ', i.e. ' + t('k=' + k) + '.',
            ['Both left sides are multiples of the same expression. What must the right side be for the second equation to be a multiple of the first?'], 'k for infinitely many');
        } }] },
      { num: '19', stem: '<i>(Numerical Response)</i>', parts: [
        { id: 'e19', level: 'PRG', make: function (r) {
          var d = find(r, function (r) { var S = sysBothScaled(r, [2, 9], [1, 1, 1, -1], function (r) { return [r.int(1, 7), r.int(1, 6)]; }); if (!S) return null; var P = solveS(S), c = r.int(10, 30), dd = r.int(1, 5), v = c * P[0] + dd * P[1]; return v >= 100 && v <= 999 ? { S: S, P: P, k: [c, dd], v: v } : null; }, { S: [[7, 4, 47], [5, -6, 7]], P: [5, 3], k: [25, 2], v: 131 });
          var e = E2(d.S), ex = lin(d.k, ['x', 'y']);
          var p = nrP('The system ' + t(e[0]) + ' and ' + t(e[1]) + ' has solution ' + t('(x,\\ y)') + '. The value of ' + t(ex) + ' is ________. <i>(Record your answer as a three-digit number.)</i>', d.v, comboDiag(d.P, d.k),
            elimSteps(d.S, ['x', 'y'], chooseE(d.S)) + '<br>' + t(ex + '=' + d.k[0] + '(' + d.P[0] + ')+' + d.k[1] + '(' + d.P[1] + ')=' + d.v),
            ['Solve the system first (both equations need scaling), then evaluate ' + t(ex) + '.'], 'NR ' + ex + ': ' + e.join(', '));
          p._eqs = e; p._sol = d.P; p._V = ['x', 'y'];
          return p;
        } }] }
    ]
  });
})(window);
