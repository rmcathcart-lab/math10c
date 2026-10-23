/* Math 10C · Unit 8 · Lesson 2 — Solving Systems of Equations by Substitution (RF9)
 * Assignment questions 1–11 (u8_L02.tex) and the Lesson 2 Extra Practice (u8_EP02.tex, Parts A–I).
 * Every part is a generator: it keeps the idea and difficulty of the booklet question (the booklet's numbers are one
 * of the possible versions) and changes the numbers. Solutions are typed on the point keypad (K.P.point, js/lines.js),
 * equations on the eq keypad, and the "check by graphing" parts are drawn on the graph pad (js/draw.js).
 * Every worked solution is written by subSol(): isolate, substitute, solve, back-substitute, check.
 * Levels: LIM BEG EMG PRG ADV MAS. */
(function (root) {
  'use strict';
  var HW = root.HW, K = HW.kit, B = K.P, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form, LN = HW.lines, DR = HW.draw, ex = HW.ex;

  /* ---------------- rational numbers [p, q] ---------------- */
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var c = a % b; a = b; b = c; } return a; }
  function lcm(a, b) { return a / (gcd(a, b) || 1) * b; }
  function Q(p, q) { if (Array.isArray(p)) return Q(p[0], p[1]); if (q === undefined) q = 1; if (q < 0) { p = -p; q = -q; } var g = gcd(p, q) || 1; return [p / g + 0, q / g]; }
  function qa(a, b) { a = Q(a); b = Q(b); return Q(a[0] * b[1] + b[0] * a[1], a[1] * b[1]); }
  function qs(a, b) { b = Q(b); return qa(a, [-b[0], b[1]]); }
  function qm(a, b) { a = Q(a); b = Q(b); return Q(a[0] * b[0], a[1] * b[1]); }
  function qd(a, b) { a = Q(a); b = Q(b); return Q(a[0] * b[1], a[1] * b[0]); }
  function qn(a) { a = Q(a); return [-a[0] + 0, a[1]]; }
  function qv(a) { a = Q(a); return a[0] / a[1]; }
  function qT(a) { a = Q(a); return LN.frT(a[0], a[1]); }
  function isInt(a) { return Q(a)[1] === 1; }
  function ptT(p) { return '(' + qT(p[0]) + ',\\ ' + qT(p[1]) + ')'; }
  function ptK(p) { return '(' + qT(p[0]) + ', ' + qT(p[1]) + ')'; }
  function dc(x) { return String(Math.round(x * 1e6) / 1e6); }       // a decimal for display
  function rnz(r, a, b) { var v; do { v = r.int(a, b); } while (v === 0); return v; }
  function sgn(r) { return r.chance(0.5) ? 1 : -1; }

  /* ---------------- terms and equations ---------------- */
  function term(c, v, first) {
    var f = Q(c); if (f[0] === 0) return '';
    var s = f[0] < 0 ? '-' : (first ? '' : '+'), ab = Math.abs(f[0]);
    return s + (f[1] === 1 ? (ab === 1 && v ? '' : String(ab)) : '\\frac{' + ab + '}{' + f[1] + '}') + v;
  }
  function pol(list) { var out = ''; list.forEach(function (tm) { out += term(tm[0], tm[1], !out); }); return out || '0'; }
  function cB(c, inner, first) {   // c·(inner)
    var f = Q(c); if (f[0] === 0) return '';
    var s = f[0] < 0 ? '-' : (first ? '' : '+'), ab = Math.abs(f[0]);
    return s + (f[1] === 1 ? (ab === 1 ? '' : String(ab)) : '\\frac{' + ab + '}{' + f[1] + '}') + '\\left(' + inner + '\\right)';
  }
  function cf(n) { return n === 1 ? '' : n === -1 ? '-' : String(n); }
  function brk(v, c) { return '(' + v + (c < 0 ? '-' : '+') + Math.abs(c) + ')'; }   // (v ± |c|)
  function E(a, b, c) { return { a: Q(a), b: Q(b), c: Q(c) }; }          // a·X + b·Y = c
  function co(e, k) { return k === 0 ? e.a : e.b; }
  function eqT(e, V) { V = V || ['x', 'y']; return pol([[e.a, V[0]], [e.b, V[1]]]) + '=' + qT(e.c); }
  function genT(e, V) { V = V || ['x', 'y']; return pol([[e.a, V[0]], [e.b, V[1]], [qn(e.c), '']]) + '=0'; }
  function siT(e, V) { V = V || ['x', 'y']; return V[1] + '=' + pol([[qd(qn(e.a), e.b), V[0]], [qd(e.c, e.b), '']]); }
  function det(E1, E2) { return qs(qm(E1.a, E2.b), qm(E2.a, E1.b)); }
  function solve2(E1, E2) {
    var D = det(E1, E2); if (qv(D) === 0) return null;
    return [qd(qs(qm(E1.c, E2.b), qm(E2.c, E1.b)), D), qd(qs(qm(E1.a, E2.c), qm(E2.a, E1.c)), D)];
  }
  function onE(e, p) { return qv(qs(qa(qm(e.a, p[0]), qm(e.b, p[1])), e.c)) === 0; }
  function sysA(e) { return [qv(e.a), qv(e.b), -qv(e.c)]; }
  function toL(e) { var d = e.a[1] * e.b[1] * e.c[1]; return L3(e.a[0] * d / e.a[1], e.b[0] * d / e.b[1], -e.c[0] * d / e.c[1]); }
  function L3(A, Bc, C) { var g = gcd(gcd(A, Bc), C) || 1; A /= g; Bc /= g; C /= g; if (A < 0 || (A === 0 && Bc < 0)) { A = -A; Bc = -Bc; C = -C; } return { A: A + 0, B: Bc + 0, C: C + 0 }; }
  function sysD(texs) { return '\\[\\begin{aligned}' + texs.map(function (s) { return s.replace('=', '&='); }).join('\\\\') + '\\end{aligned}\\]'; }
  function dT(n, scale) { return dc(n / (scale || 10)); }                 // tenths (or hundredths) as a decimal
  function dTerm(n, v, first, scale) { if (!n) return ''; return (n < 0 ? '-' : first ? '' : '+') + dT(Math.abs(n), scale) + v; }

  /* ---------------- the worked solution: isolate, substitute, solve, back-substitute, check ---------------- */
  function pickIso(Es) {
    var best = null, bs = 1e9;
    for (var i = 0; i < 2; i++) for (var v = 0; v < 2; v++) {
      var c = Q(co(Es[i], v)); if (!c[0]) continue;
      var s = (Math.abs(c[0]) === 1 && c[1] === 1 ? 0 : c[1] === 1 ? Math.abs(c[0]) : 50 + Math.abs(c[0]) * c[1]) + (c[0] < 0 ? 0.5 : 0);
      if (s < bs) { bs = s; best = [i, v]; }
    }
    return best;
  }
  function chkLine(e, V, p) { var a = cB(e.a, qT(p[0]), true); return t(a + cB(e.b, qT(p[1]), !a) + '=' + qT(e.c)) + '&nbsp;✓'; }
  function subSol(Es, o) {
    o = o || {};
    var V = o.vars || ['x', 'y'], iso = o.iso || pickIso(Es), i = iso[0], v = iso[1], w = 1 - v, j = 1 - i;
    var e = Es[i], O = Es[j], cv = co(e, v), cw = co(e, w), al = qd(qn(cw), cv), be = qd(e.c, cv), ov = co(O, v), ow = co(O, w);
    var nm = o.names || ['the first equation', 'the second equation'], out = (o.pre || []).slice();
    var cFirst = qv(al) < 0 && qv(be) > 0, exT = cFirst ? pol([[be, ''], [al, V[w]]]) : pol([[al, V[w]], [be, '']]);
    var mid = qv(cv) === 1 ? '' : t(term(cv, V[v], true) + '=' + pol([[qn(cw), V[w]], [e.c, '']])) + ', so ';
    var given = o.texs && o.texs[i] && o.texs[i].replace(/\s/g, '').indexOf(V[v] + '=') === 0 && !/[()]/.test(o.texs[i]);
    out.push(given ? '<b>Step 1:</b> ' + nm[i] + ' already gives ' + t(V[v] + '=' + exT) + '.' : '<b>Step 1:</b> isolate ' + t(V[v]) + ' in ' + nm[i] + ', ' + t(eqT(e, V)) + ': ' + mid + t(V[v] + '=' + exT));
    var subT = v === 0 ? cB(ov, exT, true) + term(ow, V[w], false) : (term(ow, V[w], true) + cB(ov, exT, !qv(ow)));
    out.push('<b>Step 2:</b> substitute into ' + nm[j] + ', ' + t(eqT(O, V)) + ': ' + t(subT + '=' + qT(O.c)));
    var k = qa(qm(ov, al), ow), m = qm(ov, be);
    var expT = v === 0 ? pol([[qm(ov, al), V[w]], [m, ''], [ow, V[w]]]) : pol([[ow, V[w]], [qm(ov, al), V[w]], [m, '']]);
    var s3 = '<b>Step 3:</b> expand: ' + t(expT + '=' + qT(O.c));
    if (qv(k) === 0) {
      var tr = qv(m) === qv(O.c);
      out.push(s3 + '. Both variables cancel, leaving ' + t(qT(m) + '=' + qT(O.c)) + (tr ? ', which is <b>always true</b>.' : ', which is <b>never true</b>.'));
      out.push(tr ? 'So the system has <b>infinitely many solutions</b>: the two equations describe the <b>same line</b>.' : 'So the system has <b>no solution</b>: the lines are <b>parallel</b> (same slope, different intercepts) and never meet.');
      return { html: out.join('<br>'), kind: tr ? 'inf' : 'none' };
    }
    var den = [k, m, O.c].reduce(function (d, z) { return lcm(d, Q(z)[1]); }, 1), rhs = qs(O.c, m), w0 = qd(rhs, k);
    if (den > 1) s3 += '<br>Multiply every term by ' + t(den) + ' to clear the fractions: ' + t(pol([[qm(k, den), V[w]], [qm(m, den), '']]) + '=' + qT(qm(O.c, den)));
    else if (pol([[k, V[w]], [m, '']]) !== expT) s3 += ', so ' + t(pol([[k, V[w]], [m, '']]) + '=' + qT(O.c));
    s3 += '<br>' + t(term(qm(k, den), V[w], true) + '=' + qT(qm(rhs, den))) + ', so ' + t(V[w] + '=' + qT(w0));
    out.push(s3);
    var v0 = qa(qm(al, w0), be), back = !qv(al) ? qT(be) : cFirst ? qT(be) + cB(al, qT(w0), false) : cB(al, qT(w0), true) + (qv(be) ? (qv(be) < 0 ? '-' : '+') + qT([Math.abs(Q(be)[0]), Q(be)[1]]) : '');
    out.push('<b>Step 4:</b> back-substitute: ' + t(V[v] + '=' + back + '=' + qT(v0)));
    var sol = v === 0 ? [v0, w0] : [w0, v0];
    out.push('Solution: ' + t('(' + V[0] + ',\\ ' + V[1] + ')=' + ptT(sol)));
    if (o.check !== false) out.push('Check: ' + (o.checkEs || Es).map(function (z) { return chkLine(z, V, sol); }).join('&nbsp;&nbsp; '));
    return { html: out.join('<br>'), sol: sol, kind: null };
  }

  /* ---------------- answer parts ---------------- */
  var SUBHINTS = ['Isolate a variable whose coefficient is ' + t('1') + ' or ' + t('-1') + ', substitute that expression (in brackets) into the <b>other</b> equation, solve, then back-substitute.', 'Check your answer in <b>both</b> original equations.'];
  function decOnly(chk) {   // exact answers asked for: a decimal in a correct answer gets a nudge
    return function (resp) { var r = chk(resp); if (r.v === 'correct' && /\d\.\d/.test(String(resp))) return form('pt-fraction', 'Right values — but the question asks for <b>exact</b> values: write them as fractions, not decimals.'); return r; };
  }
  function ptPart(prompt, S, res, hints, text, o) {
    o = o || {};
    var V = S.V || ['x', 'y'], target = res.kind || res.sol;
    var p = B.point(prompt, target, { vars: V, system: S.Es.map(sysA), wrong: o.wrong }, res.html, hints || SUBHINTS, text);
    if (o.exact && !res.kind && (!isInt(res.sol[0]) || !isInt(res.sol[1]))) p.check = decOnly(p.check);
    var bad = [];
    if (!res.kind) {
      var s = res.sol;
      if (qv(s[0]) !== qv(s[1])) bad.push(ptK([s[1], s[0]]));
      if (qv(s[1]) !== 0) bad.push(ptK([s[0], qn(s[1])]));
      bad.push('\\text{no solution}');
      p.good = [V[0] + '=' + qT(s[0]) + ', ' + V[1] + '=' + qT(s[1])];
    } else bad.push(res.kind === 'none' ? '\\text{infinitely many}' : '\\text{no solution}', '(0, 0)');
    p.bad = bad.concat(o.bad || []);
    return p;
  }
  function solvePart(prompt, S, hints, text, o) { o = o || {}; var res = subSol(S.Es, { vars: S.V, pre: S.pre, iso: S.iso, checkEs: S.checkEs, names: S.names, texs: S.texs }); return ptPart(prompt + sysD(S.texs), S, res, hints, text || ('solve ' + S.texs.join(' ; ')), o); }
  function mc(r, prompt, opts, sol, hints, text, keep) { return B.mc(r, prompt, opts, sol, hints || [], text, keep); }

  /* ---------------- graph pad: both lines of a system ---------------- */
  function gv(pts, pieces) { return { pts: pts || [], pieces: pieces || [], join: 'none' }; }
  function segv(a, b, s, e) { return { v: [a, b], s: s || 'closed', e: e || 'closed' }; }
  function lattice(L, xr, yr) {
    var out = [];
    if (L.B === 0) { var k = -L.C / L.A; if (Number.isInteger(k) && k >= xr[0] && k <= xr[1]) for (var y = yr[0]; y <= yr[1]; y++) out.push([k, y]); return out; }
    for (var x = xr[0]; x <= xr[1]; x++) { var yy = (-L.C - L.A * x) / L.B; if (Number.isInteger(yy) && yy >= yr[0] && yy <= yr[1]) out.push([x, yy]); }
    return out;
  }
  function lineDraw(L, xr, yr) { var a = lattice(L, xr, yr); return a.length >= 2 ? gv([], [segv(a[0], a[a.length - 1], 'arrow', 'arrow')]) : null; }
  function exactChk(target) { var base = K.graphExact(target); return function (resp) { if (!DR.empty(resp) && DR.same(resp, target)) return ok(); return base(resp); }; }
  var WIN = [-6, 6];
  function fits(Es, sol) { return Es.every(function (e) { return lattice(toL(e), WIN, WIN).length >= 2; }) && sol && Math.abs(qv(sol[0])) <= 5 && Math.abs(qv(sol[1])) <= 5; }
  function keyOf(L) { return Object.keys(DR.geom(lineDraw(L, WIN, WIN)).lines)[0]; }
  function lineHint(g, T) {   // g: drawn line { A, B, C } (A x + B y = C); T: target { A, B, C } (A x + B y + C = 0)
    var mt = -T.A / T.B, bt = -T.C / T.B, near = function (a, b) { return Math.abs(a - b) < 1e-6; };
    if (g.B === 0) return 'you drew a vertical line. Rewrite the equation as ' + t('y=mx+b') + ' first.';
    var ms = -g.A / g.B, bs = g.C / g.B;
    if (near(ms, mt) && near(bs, -bt) && bt !== 0) return 'right slope, but the sign of the ' + t('y') + '-intercept is wrong.';
    if (near(ms, mt)) return 'right slope, wrong position — recheck the ' + t('y') + '-intercept (or a point on the line).';
    if (near(ms, -mt)) return 'check the <b>sign of the slope</b>: should the line rise or fall from left to right?';
    if (mt !== 0 && near(ms, 1 / mt)) return 'you have used run over rise — slope is rise over run.';
    if (near(bs, bt)) return 'right ' + t('y') + '-intercept — check the slope.';
    return 'rewrite it in the form ' + t('y=mx+b') + ' (expand any brackets first), then plot two points on it.';
  }
  function graphPart(prompt, S, text) {
    var Ls = S.Es.map(toL), V = S.V || ['x', 'y'], keys = Ls.map(keyOf), key = gv([], Ls.map(function (L) { return lineDraw(L, WIN, WIN).pieces[0]; }));
    var base = exactChk(key), names = S.texs;
    var check = function (resp) {
      if (DR.empty(resp)) return form('empty', 'Draw both lines on the grid first.');
      var g = DR.geom(resp), ks = Object.keys(g.lines), has = keys.map(function (k) { return ks.indexOf(k) >= 0; });
      if (has[0] && has[1]) return ks.length > 2 ? wrong('sys-graph-extra', 'Both lines are there — but there is an extra line as well. Delete it.') : base(resp);
      if (!ks.length) return wrong('graph-lines', 'Draw the two <b>lines</b> with the Line tool, not just points.');
      if (has[0] || has[1]) {
        var good = has[0] ? 0 : 1, miss = 1 - good;
        if (ks.length === 1) return wrong('sys-graph-missing', 'The line for ' + t(names[good]) + ' is right. Now draw the second line, ' + t(names[miss]) + '.');
        var other = ks.filter(function (k) { return keys.indexOf(k) < 0; })[0];
        return wrong('sys-graph-one', 'The line for ' + t(names[good]) + ' is right. For ' + t(names[miss]) + ': ' + lineHint(g.lines[other], Ls[miss]));
      }
      if (ks.length === 1) return wrong('graph', 'A system has <b>two</b> lines — and this one isn’t either of them yet. For each equation: ' + lineHint(g.lines[ks[0]], Ls[0]));
      return wrong('graph', 'Neither line is right yet. Rewrite each equation as ' + t('y=mx+b') + ' (expand any brackets first), then plot two points on each line.');
    };
    var pts = Ls.map(function (L) { var a = lattice(L, WIN, WIN); return a.length > 2 ? [a[0], a[a.length - 1]] : a; });
    var sol = solve2(S.Es[0], S.Es[1]);
    var solH = 'Write each equation in slope–intercept form: ' + t(siT(S.Es[0], V)) + ' and ' + t(siT(S.Es[1], V)) + '.<br>Grid points on the first line: ' + pts[0].map(function (p) { return t(ptT(p)); }).join(', ') +
      '; on the second: ' + pts[1].map(function (p) { return t(ptT(p)); }).join(', ') + '. Draw each line through its points, with arrows on both ends.<br>The lines cross at ' + t(ptT(sol)) + ' — the same solution substitution gives.';
    var p = B.graph(prompt + sysD(names) + ' Use <b>╱ Line</b>: tap two points on a line — its ends start as arrows. Draw <b>both</b> lines.', { x: WIN, y: WIN, labels: 2, defaultEnd: 'arrow', tools: ['line', 'ends'] }, check, key, solH,
      ['Rewrite each equation as ' + t('y=mx+b') + ', or find two points on it by substituting values of ' + t('x') + '.', 'The two lines should cross at the solution you found by substitution.'], text);
    var one = gv([], [key.pieces[0]]), wr = Ls.map(function (L) { return L3(-L.A, L.B, L.C); }).map(function (L) { return lineDraw(L, WIN, WIN); });
    p.bad = [one, gv([], [key.pieces[1]])].concat(wr[1] && keyOf(L3(-Ls[1].A, Ls[1].B, Ls[1].C)) !== keys[0] ? [gv([], [key.pieces[0], wr[1].pieces[0]])] : []);
    return p;
  }

  /* ---------------- Question 1 systems (booklet: (a) (4, 3), (b) (−3, 5), (c) (2, −3), (d) (−1, 4)) ---------------- */
  function sysOf(texs, Es, pre, extra) { var S = { texs: texs, Es: Es, pre: pre || [] }; Object.keys(extra || {}).forEach(function (k) { S[k] = extra[k]; }); return S; }
  function expLine(which, raw, e, V) { return 'Expand the ' + which + ' equation: ' + t(raw) + ', so ' + t(eqT(e, V)) + '.'; }
  function gen(r, maker, book) { for (var g = 0; g < 400; g++) { var S = maker(r); if (S) return S; } return book(); }
  function b1a(x0, y0, A, Bc) {
    var E1 = E(A, -Bc, A * x0 - Bc * y0), E2 = E([1, 2], -1, Q(x0 - 2 * y0, 2));
    var S = sysOf([eqT(E1), eqT(E2)], [E1, E2]);
    return fits(S.Es, [x0, y0]) && qv(det(E1, E2)) !== 0 ? S : null;
  }
  function g1a(r) { return gen(r, function (r) { return b1a(r.pick([-4, -2, 2, 4]), r.int(-4, 4), r.int(2, 5), r.int(1, 3)); }, function () { return b1a(4, 3, 3, 2); }); }
  function b1b(x0, y0, A, p, Bk, Ck, s) {
    var q = A * (x0 + p) + y0, rr = Bk * x0 - Ck * (y0 - s), E1 = E(A, 1, q - A * p), E2 = E(Bk, -Ck, rr - Ck * s);
    var texs = [A + brk('x', p) + '+y=' + q, Bk + 'x-' + Ck + brk('y', -s) + '=' + rr];
    var S = sysOf(texs, [E1, E2], [expLine('first', pol([[A, 'x'], [A * p, ''], [1, 'y']]) + '=' + q, E1), expLine('second', pol([[Bk, 'x'], [-Ck, 'y'], [Ck * s, '']]) + '=' + rr, E2)]);
    return fits(S.Es, [x0, y0]) && qv(E1.c) !== 0 ? S : null;
  }
  function g1b(r) { return gen(r, function (r) { return b1b(r.int(-4, 3), r.int(-3, 5), r.int(2, 4), rnz(r, -3, 3), r.int(3, 5), r.int(2, 3), rnz(r, -5, 5)); }, function () { return b1b(-3, 5, 3, 1, 5, 2, 4); }); }
  function b1c(x0, y0, A, p, Bc, q, Cc, D, s) {
    var k = A * (x0 - p) + Bc * (y0 + q), rr = Cc * x0 - D * (y0 + s), E1 = E(A, Bc, k + A * p - Bc * q), E2 = E(Cc, -D, rr + D * s);
    if (gcd(A, Bc) !== 1 || gcd(Cc, D) !== 1) return null;
    var texs = [A + brk('x', -p) + '+' + Bc + brk('y', q) + '=' + k, Cc + 'x-' + D + brk('y', s) + '=' + rr];
    var S = sysOf(texs, [E1, E2], [expLine('first', pol([[A, 'x'], [-A * p, ''], [Bc, 'y'], [Bc * q, '']]) + '=' + k, E1), expLine('second', pol([[Cc, 'x'], [-D, 'y'], [-D * s, '']]) + '=' + rr, E2)]);
    return fits(S.Es, [x0, y0]) ? S : null;
  }
  function g1c(r) { return gen(r, function (r) { return b1c(r.int(-3, 4), r.int(-4, 3), r.int(2, 5), r.pick([1, 2, 3, -1]), r.int(2, 3), r.pick([1, 2, 3, 4, -1, -2]), r.int(2, 5), r.int(2, 3), r.pick([1, 2, 3, -1, -2])); }, function () { return b1c(2, -3, 3, 2, 2, 4, 5, 3, 2); }); }
  function b1d(x0, y0, A, Bb, p, q, C, p2, D, E_, s2, F) {
    var k = A * (Bb * x0 + p) - (y0 - q), rr = C * (p2 - D * x0) - E_ * (s2 - F * y0);
    var E1 = E(A * Bb, -1, k - A * p - q), E2 = E(-C * D, E_ * F, rr - C * p2 + E_ * s2);
    if (A * Bb * E_ * F === C * D) return null;
    var texs = [A + '(' + pol([[Bb, 'x'], [p, '']]) + ')-' + brk('y', -q) + '=' + k, C + '(' + p2 + '-' + cf(D) + 'x)-' + E_ + '(' + s2 + '-' + cf(F) + 'y)=' + rr];
    var S = sysOf(texs, [E1, E2], [expLine('first', pol([[A * Bb, 'x'], [A * p, ''], [-1, 'y'], [q, '']]) + '=' + k, E1), expLine('second', pol([[C * p2, ''], [-C * D, 'x'], [-E_ * s2, ''], [E_ * F, 'y']]) + '=' + rr, E2)]);
    return fits(S.Es, [x0, y0]) ? S : null;
  }
  function g1d(r) { return gen(r, function (r) { return b1d(r.int(-3, 2), r.int(-4, 5), r.int(2, 3), r.int(1, 2), rnz(r, -3, 3), rnz(r, -5, 5), r.int(2, 4), r.int(1, 6), r.int(1, 3), r.int(2, 3), r.int(1, 6), r.int(1, 2)); }, function () { return b1d(-1, 4, 3, 2, 1, 5, 4, 1, 3, 3, 5, 2); }); }

  /* ---------------- shared wording ---------------- */
  var CIRC = ['①', '②'];
  function mcCollapse(r, kind, S, stmt) {   // explain the result of a collapsed substitution
    var V = S.V || ['x', 'y'], inf = kind === 'inf', W = V[1 - (S.iso || pickIso(S.Es))[1]];
    var opts = [
      { html: 'Both variables cancel and ' + t(stmt) + ' is ' + (inf ? 'always true: the equations describe the <b>same line</b>, so there are <b>infinitely many</b> solutions.' : 'never true: the lines are <b>parallel</b>, so there is <b>no solution</b>.'), right: true },
      { html: 'Both variables cancel and ' + t(stmt) + ' is ' + (inf ? 'never true: the lines are parallel, so there is no solution.' : 'always true: the equations describe the same line, so there are infinitely many solutions.'), why: inf ? 'Look again: is ' + t(stmt) + ' a true statement? A true statement means every point on the line works.' : 'Look again: is ' + t(stmt) + ' a true statement? A false statement means no point can work.', code: 'flip' },
      { html: 'The answer is ' + t(W + '=' + stmt.split('=')[0]) + ', so there is exactly one solution.', why: 'The number left over isn’t a value of ' + t(W) + ' — the ' + t(W) + '-terms cancelled, so nothing is left to solve for.', code: 'one' },
      { html: 'Both variables cancelled, which means an algebra mistake was made — start again.', why: 'Cancelling is not a mistake: it is the signal that the two lines have the same slope.', code: 'error' }];
    return mc(r, 'When you solve this system by substitution, what happens, and what does it tell you?' + sysD(S.texs), opts,
      subSol(S.Es, { vars: V, iso: S.iso }).html + '<br>' + (inf ? 'Same slope and same intercept: the graphs are the same line.' : 'Same slope, different intercepts: the graphs are parallel lines.'),
      ['Substitute and simplify. If both variables disappear, ask: is the number statement left over true or false?'], 'explain collapse: ' + S.texs.join(' ; '));
  }
  function collapseStmt(S) { var Es = S.Es, iso = S.iso || pickIso(Es), i = iso[0], v = iso[1], w = 1 - v, j = 1 - i, e = Es[i], O = Es[j]; var m = qm(co(O, v), qd(e.c, co(e, v))); return qT(m) + '=' + qT(O.c); }

  HW.addCodes({
    'pt-fraction': 'Exact answer given as a decimal', 'sys-graph-one': 'Graph of a system: one line wrong', 'sys-graph-missing': 'Graph of a system: only one line drawn', 'sys-graph-extra': 'Graph of a system: extra line',
    'sub-swap': 'Substituted the point’s coordinates into the wrong letters', 'pq-swap': 'Values of the two unknowns swapped', 'pen-price': 'Gave the other unknown’s value', 'ratio-swap': 'Ratio statement written the wrong way round',
    'less-than': '“Less than” translated in the wrong order', 'nr-sum': 'Combined the values the wrong way (sum vs difference)', 'nr-one': 'Gave one unknown instead of the combination', 'z-wrong': 'Three unknowns: last value wrong',
    'xy-right-z': 'Three unknowns: x and y right, z wrong', 'mix-pct': 'Mixture: percent not used correctly', 'mix-total': 'Mixture: total not used', 'mix-swap': 'Mixture: amounts swapped', 'boat-swap': 'Current: downstream and upstream swapped',
    'boat-dist': 'Used the distance as a speed', 'boat-avg': 'Averaged the two times', 'cx-solution': 'Counter-example: gave the actual solution', 'cx-not-on': 'Counter-example: point not on the first line', 'pts-not-on': 'Point not on the line', 'pts-repeat': 'Same point listed twice',
    'k-expr': 'Expression in k wrong', 'dropped-bracket': 'Dropped the bracket when substituting', 'k-den': 'Denominator set to zero wrong', 'one-eq': 'Used only one equation'
  });

  HW.defineLesson({
    id: 'u8l2', unit: 8, num: '2', title: 'Solving Systems of Equations by Substitution', outcome: 'RF9',
    blurb: 'An exact algebraic method: isolate one variable, substitute it into the other equation, solve, then back-substitute.',
    questions: [
      { num: '1', section: 'Solving by substitution', stem: 'Solve each system using the method of substitution and verify that the solution satisfies both equations. Then check each solution by graphing both lines.',
        shared: function (r) { return { a: g1a(r), b: g1b(r), c: g1c(r), d: g1d(r) }; },
        parts: ['a', 'b', 'c', 'd'].reduce(function (acc, L) {
          var lv = { a: ['EMG', 'EMG'], b: ['EMG', 'EMG'], c: ['PRG', 'PRG'], d: ['PRG', 'PRG'] }[L];
          acc.push({ id: '1' + L, sub: L, level: lv[0], make: function (r, sh) { return solvePart('Solve by substitution. Give the solution as an ordered pair.', sh[L], null, 'Q1' + L + ' solve'); } });
          acc.push({ id: '1' + L + 'g', sub: L + ' graph', level: lv[1], make: function (r, sh) { return graphPart('Check the solution by graphing both lines of the system', sh[L], 'Q1' + L + ' graph'); } });
          return acc;
        }, []) },
      { num: '2', stem: 'Solve each of the following systems by substitution. Check each solution.', parts: [
        { id: '2a', level: 'BEG', make: function (r) {
          var S = gen(r, function (r) {
            var x0 = rnz(r, -5, 5), y0 = rnz(r, -5, 5), m = r.pick([1, 1, 2, -1]), k = y0 - m * x0, A = r.int(2, 5), Bc = r.int(2, 5);
            if (!k || A + Bc * m === 0) return null;
            var E1 = E(-m, 1, k), E2 = E(A, Bc, A * x0 + Bc * y0);
            return qv(E2.c) ? sysOf(['y=' + pol([[m, 'x'], [k, '']]), eqT(E2)], [E1, E2], [], { iso: [0, 1] }) : null;
          }, function () { return sysOf(['y=x+5', '2x+3y=5'], [E(-1, 1, 5), E(2, 3, 5)], [], { iso: [0, 1] }); });
          return solvePart('Solve by substitution:', S, ['The first equation already says what ' + t('y') + ' equals. Replace ' + t('y') + ' in the second equation with that expression, in brackets.', 'Check your answer in both equations.']);
        } },
        { id: '2b', level: 'BEG', make: function (r) {
          var S = gen(r, function (r) {
            var x0 = r.int(2, 9), y0 = rnz(r, -4, 4), a = r.int(2, 4), b = r.int(1, 3), c = x0 - a * y0, d = -(x0 + b * y0);
            if (!c || !d) return null;
            return sysOf([pol([[1, 'x'], [-a, 'y']]) + '=' + c, pol([[1, 'x'], [b, 'y'], [d, '']]) + '=0'], [E(1, -a, c), E(1, b, -d)], [], { iso: [0, 0] });
          }, function () { return sysOf(['x-3y=11', 'x+2y-6=0'], [E(1, -3, 11), E(1, 2, 6)], [], { iso: [0, 0] }); });
          return solvePart('Solve by substitution:', S);
        } },
        { id: '2c', level: 'BEG', make: function (r) {
          var S = gen(r, function (r) {
            var p0 = rnz(r, -3, 3), a = r.int(2, 4), q0 = -a * p0, b = r.int(2, 5), c = r.int(2, 5), d = b * p0 + c * q0;
            if (b - c * a === 0 || !d || Math.abs(q0) > 12) return null;
            return sysOf([pol([[a, 'p'], [1, 'q']]) + '=0', pol([[b, 'p'], [c, 'q']]) + '=' + d], [E(a, 1, 0), E(b, c, d)], [], { V: ['p', 'q'], iso: [0, 1] });
          }, function () { return sysOf(['3p+q=0', '5p+2q=-1'], [E(3, 1, 0), E(5, 2, -1)], [], { V: ['p', 'q'], iso: [0, 1] }); });
          return solvePart('Solve by substitution. Give the answer as an ordered pair ' + t('(p,\\ q)') + '.', S);
        } },
        { id: '2d', level: 'PRG', make: function (r) {
          var S = gen(r, function (r) {
            var v0 = rnz(r, -3, 3), k = r.pick([-5, -3, -1, 1, 3, 5]), u0 = Q(2 * v0 + k, 2), A = r.pick([2, 4, 6]), Bc = r.int(1, 6), C = -(qv(qm(A, u0)) - Bc * v0);
            if (A === Bc || !C || !Number.isInteger(C)) return null;
            return sysOf([pol([[A, 'u'], [-Bc, 'v'], [C, '']]) + '=0', '2u=' + pol([[2, 'v'], [k, '']])], [E(A, -Bc, -C), E(2, -2, k)], [], { V: ['u', 'v'], iso: [1, 0] });
          }, function () { return sysOf(['4u-2v+8=0', '2u=2v-3'], [E(4, -2, -8), E(2, -2, -3)], [], { V: ['u', 'v'], iso: [1, 0] }); });
          return solvePart('Solve by substitution. Give the answer as an ordered pair ' + t('(u,\\ v)') + '.', S, ['Divide ' + t('2u=2v+\\ldots') + ' by ' + t('2') + ' to isolate ' + t('u') + ' — a fraction appears, and that is fine.', 'Substitute into the other equation, solve for ' + t('v') + ', then back-substitute.']);
        } },
        { id: '2e', level: 'BEG', make: function (r) {
          var S = gen(r, function (r) {
            var k0 = rnz(r, -4, 4), A = r.int(2, 6), Bc = r.int(2, 6), plus = r.chance(0.3), y0 = plus ? -k0 : k0;
            if (plus && A === Bc) return null;
            return sysOf([pol([[A, 'x'], [Bc, 'y']]) + '=' + (A * k0 + Bc * y0), plus ? 'x+y=0' : 'x-y=0'], [E(A, Bc, A * k0 + Bc * y0), E(1, plus ? 1 : -1, 0)], [], { iso: [1, 1] });
          }, function () { return sysOf(['4x+3y=7', 'x-y=0'], [E(4, 3, 7), E(1, -1, 0)], [], { iso: [1, 1] }); });
          return solvePart('Solve by substitution:', S);
        } },
        { id: '2f', level: 'PRG', make: function (r) {
          var S = gen(r, function (r) {
            var x0 = r.int(1, 6), y0 = rnz(r, -4, 4), a = r.int(2, 8), b = r.int(2, 8), D = r.int(2, 4), Ee = r.pick([2, 3, 5]), c10 = a * x0 + b * y0;
            if (a * -Ee - b * D === 0 || c10 % 10 === 0 || c10 <= 0) return null;
            var E1 = E(a, b, c10), E2 = E(D, -Ee, D * x0 - Ee * y0);
            return sysOf([dTerm(a, 'x', true) + dTerm(b, 'y') + '=' + dT(c10), eqT(E2)], [E1, E2], ['Multiply the first equation by ' + t('10') + ' to clear the decimals: ' + t(eqT(E1)) + '.']);
          }, function () { var E1 = E(5, 4, 17), E2 = E(2, -3, 16); var S0 = sysOf(['0.5x+0.4y=1.7', '2x-3y=16'], [E1, E2], ['Multiply the first equation by ' + t('10') + ' to clear the decimals: ' + t(eqT(E1)) + '.']); return S0; });
          return solvePart('Solve by substitution:', S, ['Multiply the decimal equation by ' + t('10') + ' first, so every coefficient is a whole number.', 'Then isolate a variable, substitute, solve and back-substitute.']);
        } }] },
      { num: '3', stem: 'Solve each system by substitution. Give the answers as exact values (fractions, not decimals).', parts: [
        { id: '3a', level: 'EMG', make: function (r) {
          var S = gen(r, function (r) {
            var A = r.int(2, 5), m = r.int(-4, -1), b = rnz(r, -5, 5), C = rnz(r, -9, 9), x = Q(C + b, A - m), y = qa(qm(m, x), b);
            if (isInt(x) || x[1] > 9 || Math.abs(qv(x)) > 5) return null;
            return sysOf([pol([[A, 'x'], [-1, 'y']]) + '=' + C, 'y=' + pol([[m, 'x'], [b, '']])], [E(A, -1, C), E(-m, 1, b)], [], { iso: [1, 1] });
          }, function () { return sysOf(['4x-y=6', 'y=-2x+3'], [E(4, -1, 6), E(2, 1, 3)], [], { iso: [1, 1] }); });
          return solvePart('Solve by substitution. Give exact values.', S, ['Replace ' + t('y') + ' in the first equation with the expression from the second — in brackets, because of the minus sign in front of it.', 'Leave the answer as a fraction in lowest terms.'], null, { exact: true, wrong: [] });
        } },
        { id: '3b', level: 'PRG', make: function (r) {
          var S = gen(r, function (r) {
            var x0 = r.int(-2, 3), y10 = r.pick([2, 4, 6, 8]) + 10 * r.int(-2, 3), C = r.int(2, 4), D10 = C * x0 * 10 - y10, a = r.int(1, 9), b = r.int(1, 9), e100 = a * x0 * 10 + b * y10;
            if (e100 % 10 || D10 % 10 === 0 || e100 <= 0 || a === b) return null;
            var E1 = E(a, b, e100 / 10), E2 = E(C, -1, Q(D10, 10));
            var S0 = sysOf([dTerm(a, 'x', true) + dTerm(b, 'y') + '=' + dT(e100 / 10), pol([[C, 'x'], [-1, 'y']]) + '=' + dT(D10)], [E1, E2], ['Multiply the first equation by ' + t('10') + ': ' + t(eqT(E1)) + '. In the second, ' + t(dT(D10) + '=' + qT(Q(D10, 10))) + '.'], { iso: [1, 1] });
            return S0;
          }, function () { return sysOf(['0.2x+0.5y=1.9', '3x-y=-0.4'], [E(2, 5, 19), E(3, -1, Q(-2, 5))], ['Multiply the first equation by ' + t('10') + ': ' + t('2x+5y=19') + '. In the second, ' + t('-0.4=-\\frac{2}{5}') + '.'], { iso: [1, 1] }); });
          return solvePart('Solve by substitution. Give exact values (fractions, not decimals).', S, ['Isolate ' + t('y') + ' in the second equation, and clear the decimals in the first by multiplying by ' + t('10') + '.', 'A decimal like ' + t('3.4') + ' is written exactly as ' + t('\\frac{17}{5}') + '.'], null, { exact: true });
        } }] },
      { num: '4', stem: function (sh) { return 'The straight line ' + t('px+qy+' + sh.K + '=0') + ' passes through the points ' + t(ptT(sh.P1)) + ' and ' + t(ptT(sh.P2)) + '.'; },
        shared: function (r) {
          for (var g = 0; g < 400; g++) {
            var P1 = [r.int(-3, 4), r.int(-3, 5)], P2 = [r.int(-4, 3), r.int(-3, 5)], K0 = r.pick([10, 10, 6, 8, 12]);
            if (P1[0] === P2[0] || P1[1] === P2[1] || P1[0] === P1[1] || P2[0] === P2[1]) continue;
            var A = P2[1] - P1[1], Bq = P1[0] - P2[0], C0 = -(A * P1[0] + Bq * P1[1]); if (!C0) continue;
            var p = K0 * A / C0, q = K0 * Bq / C0;
            if (!Number.isInteger(p) || !Number.isInteger(q) || !p || !q || Math.abs(p) > 12 || Math.abs(q) > 12 || p === q) continue;
            if ((P1.indexOf(0) >= 0 && P2.indexOf(0) >= 0) || (P1[1] - P2[1]) === 6 * (P1[0] - P2[0])) continue;
            return { P1: P1, P2: P2, K: K0, p: p, q: q };
          }
          return { P1: [1, 4], P2: [-2, 2], K: 10, p: 2, q: -3 };
        },
        parts: [
          { id: '4a', level: 'EMG', make: function (r, sh) {
            var e1 = { A: sh.P1[0], B: sh.P1[1], C: sh.K }, e2 = { A: sh.P2[0], B: sh.P2[1], C: sh.K }, V = ['p', 'q'];
            var swapped = function (s) { var rr = LN.read(s, V); if (!rr.ok) return false; return [[sh.P1[1], sh.P1[0]], [sh.P2[1], sh.P2[0]]].some(function (P) { return LN.same([rr.a, rr.b, rr.c], [P[0], P[1], sh.K]); }); };
            var p = B.system('Substitute the coordinates of each point into the equation of the line to form two equations in ' + t('p') + ' and ' + t('q') + '.', [e1, e2], { vars: V,
              diag: function (resp) { if ((resp || []).some(swapped)) return { code: 'sub-swap', hint: 'In ' + t('px+qy+' + sh.K + '=0') + ', ' + t('p') + ' multiplies ' + t('x') + ' and ' + t('q') + ' multiplies ' + t('y') + '. So the point ' + t(ptT(sh.P1)) + ' gives ' + t('p(' + sh.P1[0] + ')+q(' + sh.P1[1] + ')+' + sh.K + '=0') + '.' }; return null; } },
              'Using ' + t(ptT(sh.P1)) + ': ' + t('p(' + sh.P1[0] + ')+q(' + sh.P1[1] + ')+' + sh.K + '=0') + ', so ' + t(LN.tex(e1, 'general', null, V)) + '.<br>Using ' + t(ptT(sh.P2)) + ': ' + t('p(' + sh.P2[0] + ')+q(' + sh.P2[1] + ')+' + sh.K + '=0') + ', so ' + t(pol([[sh.P2[0], 'p'], [sh.P2[1], 'q'], [sh.K, '']]) + '=0') + '.',
              ['Replace ' + t('x') + ' and ' + t('y') + ' with the coordinates of the point. The unknowns are now ' + t('p') + ' and ' + t('q') + '.'], 'two equations in p, q');
            p.bad = [[pol([[sh.P1[1], 'p'], [sh.P1[0], 'q'], [sh.K, '']]) + '=0', pol([[sh.P2[1], 'p'], [sh.P2[0], 'q'], [sh.K, '']]) + '=0']];
            return p;
          } },
          { id: '4b', sub: 'b i', level: 'ADV', make: function (r, sh) {
            var V = ['p', 'q'], Es = [E(sh.P1[0], sh.P1[1], -sh.K), E(sh.P2[0], sh.P2[1], -sh.K)];
            var res = subSol(Es, { vars: V, pre: ['Substitute the points: ' + t(pol([[sh.P1[0], 'p'], [sh.P1[1], 'q'], [sh.K, '']]) + '=0') + ' and ' + t(pol([[sh.P2[0], 'p'], [sh.P2[1], 'q'], [sh.K, '']]) + '=0') + ', i.e. ' + t(eqT(Es[0], V)) + ' and ' + t(eqT(Es[1], V)) + '.'] });
            var chk = function (resp) {
              var a = String((resp || [])[0] || '').trim(), b = String((resp || [])[1] || '').trim();
              if (!a || !b) return form('empty', 'Fill in both values.');
              var pa = HW.parse.number(a), pb = HW.parse.number(b); if (!pa.ok || !pb.ok) return form('notnumber', 'Enter a number in each box.');
              if (pa.value === sh.p && pb.value === sh.q) return ok();
              if (pa.value === sh.q && pb.value === sh.p) return wrong('pq-swap', 'Your values are the right numbers in the wrong boxes: which one multiplies ' + t('x') + '?');
              var P = [pa.value, pb.value], on = Es.map(function (e) { return onE(e, P); });
              if (on[0] !== on[1]) return wrong('sys-one-eq', 'Your values work in only one of the two equations. Check both: ' + t(eqT(Es[0], V)) + ' and ' + t(eqT(Es[1], V)) + '.');
              if (pa.value === sh.p) return wrong('pt-y', t('p') + ' is right — substitute it back to find ' + t('q') + ' again.');
              if (pb.value === sh.q) return wrong('pt-x', t('q') + ' is right — substitute it back to find ' + t('p') + ' again.');
              return wrong('pt', null);
            };
            return { prompt: 'Solve the system by substitution to determine the values of ' + t('p') + ' and ' + t('q') + '.', input: { type: 'fields', fields: [{ label: t('p=') }, { label: t('q=') }] }, check: chk, key: [String(sh.p), String(sh.q)],
              answer: t('p=' + sh.p + ',\\ q=' + sh.q), solution: res.html, hints: ['First write one equation for each point: replace ' + t('x') + ' and ' + t('y') + ' by its coordinates.', 'Then isolate ' + t('p') + ' (or ' + t('q') + ') in one equation and substitute into the other.'], text: 'p and q', bad: [[String(sh.q), String(sh.p)]] };
          } },
          { id: '4c', sub: 'b ii', level: 'PRG', make: function (r, sh) {
            var T = { A: sh.p, B: sh.q, C: sh.K };
            var p = LN && K.P.line('Write the equation of the line.', T, { wrong: [{ is: { A: sh.q, B: sh.p, C: sh.K }, code: 'pq-swap', hint: 'You have ' + t('p') + ' and ' + t('q') + ' the wrong way round: ' + t('p') + ' is the coefficient of ' + t('x') + '.' }] },
              'Solving the system gives ' + t('p=' + sh.p) + ' and ' + t('q=' + sh.q) + ', so the line is ' + t(pol([[sh.p, 'x'], [sh.q, 'y'], [sh.K, '']]) + '=0') + (gcd(gcd(sh.p, sh.q), sh.K) > 1 ? ' (or, dividing by ' + t(gcd(gcd(sh.p, sh.q), sh.K)) + ', ' + t(LN.tex(T, 'general')) + ')' : '') + '.<br>Check: ' + t(pol([[sh.p, ''], [0, '']]) + '(' + sh.P1[0] + ')' + (sh.q < 0 ? '-' : '+') + Math.abs(sh.q) + '(' + sh.P1[1] + ')+' + sh.K + '=0') + ' ✓',
              ['Find ' + t('p') + ' and ' + t('q') + ' first (substitute both points, then solve the system), then put them into ' + t('px+qy+' + sh.K + '=0') + '.'], 'equation of the line');
            p.answer = t(pol([[sh.p, 'x'], [sh.q, 'y'], [sh.K, '']]) + '=0'); p.key = pol([[sh.p, 'x'], [sh.q, 'y'], [sh.K, '']]) + '=0';
            return p;
          } },
          { id: '4d', sub: 'c i', level: 'BEG', outcome: 'RF3', make: function (r, sh) {
            var m = Q(sh.P1[1] - sh.P2[1], sh.P1[0] - sh.P2[0]);
            return K.P.slope('Verify the equation: first find the slope of the line through ' + t(ptT(sh.P1)) + ' and ' + t(ptT(sh.P2)) + '.', m, {},
              t('m=\\frac{' + sh.P1[1] + '-' + (sh.P2[1] < 0 ? '(' + sh.P2[1] + ')' : sh.P2[1]) + '}{' + sh.P1[0] + '-' + (sh.P2[0] < 0 ? '(' + sh.P2[0] + ')' : sh.P2[0]) + '}=' + qT(m)), ['Slope = rise over run: ' + t('\\frac{y_2-y_1}{x_2-x_1}') + '. Subtract in the same order on top and bottom.'], 'slope through the points');
          } },
          { id: '4e', sub: 'c ii', level: 'EMG', outcome: 'RF7', make: function (r, sh) {
            var m = Q(sh.P1[1] - sh.P2[1], sh.P1[0] - sh.P2[0]), T = { m: m, point: sh.P1 };
            return K.P.line('Now write the equation of the line in slope–point form, ' + t('y-y_1=m(x-x_1)') + ', using one of the points ' + t(ptT(sh.P1)) + ' or ' + t(ptT(sh.P2)) + '. (Rearranged, it should match ' + t(pol([[sh.p, 'x'], [sh.q, 'y'], [sh.K, '']]) + '=0') + '.)', T, { form: 'point-slope' },
              'With ' + t('m=' + qT(m)) + ' and the point ' + t(ptT(sh.P1)) + ': ' + t(LN.tex(T, 'point-slope', sh.P1)) + '.<br>Multiply by ' + t(m[1]) + ' and move every term to one side: ' + t(LN.tex(T, 'general')) + ' — the same line as ' + t(pol([[sh.p, 'x'], [sh.q, 'y'], [sh.K, '']]) + '=0') + '. ✓',
              ['Slope–point form: ' + t('y-y_1=m(x-x_1)') + '. Substitute the slope and the coordinates of one point.'], 'slope–point form');
          } }] },
      { num: '5', stem: 'Solve the following systems by substitution. Explain the results.',
        shared: function (r) {
          var m = r.pick([2, 3, -2, -3, 4]), b = rnz(r, -6, 6), k = r.pick([2, 3]), sA = m > 0 ? 1 : -1;
          var A = { texs: ['y=' + pol([[m, 'x'], [b, '']]), pol([[sA * k * m, 'x'], [-sA * k, 'y']]) + '=' + (-sA * k * b)], Es: [E(-m, 1, b), E(sA * k * m, -sA * k, -sA * k * b)], iso: [0, 1] };
          var n = r.pick([2, 3, -2, 4]), c = rnz(r, -5, 5), k2 = r.pick([2, 3, 4]), d; do { d = rnz(r, -9, 9); } while (d === k2 * c);
          var Bs = { texs: ['x=' + pol([[n, 'y'], [c, '']]), pol([[k2, 'x'], [-k2 * n, 'y']]) + '=' + d], Es: [E(1, -n, c), E(k2, -k2 * n, d)], iso: [0, 0] };
          return { a: A, b: Bs };
        },
        parts: [
          { id: '5a', sub: 'a', level: 'PRG', make: function (r, sh) { return solvePart('Solve by substitution. If there isn’t exactly one solution, use the <b>no solution</b> or <b>infinitely many</b> key.', sh.a, ['Substitute and simplify. If both variables disappear, is what is left true or false?']); } },
          { id: '5ab', sub: 'a explain', level: 'EMG', make: function (r, sh) { return mcCollapse(r, 'inf', sh.a, collapseStmt(sh.a)); } },
          { id: '5b', sub: 'b', level: 'PRG', make: function (r, sh) { return solvePart('Solve by substitution. If there isn’t exactly one solution, use the <b>no solution</b> or <b>infinitely many</b> key.', sh.b, ['Substitute and simplify. If both variables disappear, is what is left true or false?']); } },
          { id: '5bb', sub: 'b explain', level: 'EMG', make: function (r, sh) { return mcCollapse(r, 'none', sh.b, collapseStmt(sh.b)); } }] },
      { num: '6', stem: function (sh) { return 'A ' + sh.c.big + ' costs $' + sh.d + ' less than ' + ['', 'one', 'two', 'three'][sh.a] + ' ' + sh.c.smalls + '. ' + ['', '', '', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'][sh.b] + ' ' + sh.c.smalls + ' cost the same as ' + ['', '', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'][sh.cc] + ' ' + sh.c.bigs + '.'; },
        shared: function (r) {
          var C = r.pick([{ big: 'notebook', bigs: 'notebooks', small: 'pen', smalls: 'pens', B: 'n', S: 'p' }, { big: 'binder', bigs: 'binders', small: 'marker', smalls: 'markers', B: 'b', S: 'm' }, { big: 'sandwich', bigs: 'sandwiches', small: 'juice box', smalls: 'juice boxes', B: 's', S: 'j' }]);
          for (var g = 0; g < 400; g++) {
            var p = r.int(3, 12), a = r.pick([2, 3]), d = r.int(1, 5), n = a * p - d, gg = gcd(n, p), b = n / gg, cc = p / gg;
            if (b <= 9 && b >= 3 && cc >= 2 && b !== cc) return { c: C, p: p, n: n, a: a, d: d, b: b, cc: cc };
          }
          return { c: C, p: 9, n: 15, a: 2, d: 3, b: 5, cc: 3 };
        },
        parts: [
          { id: '6a', level: 'PRG', make: function (r, sh) {
            var V = [sh.c.S, sh.c.B], T1 = { A: -sh.a, B: 1, C: sh.d }, T2 = { A: sh.b, B: -sh.cc, C: 0 };
            var p = B.system('Let ' + t(sh.c.S) + ' be the price of a ' + sh.c.small + ' and ' + t(sh.c.B) + ' the price of a ' + sh.c.big + ', in dollars. Write a system of two equations.', [T1, T2], { vars: V,
              diag: function (resp) {
                var Ls = (resp || []).map(function (s) { var rr = LN.read(s, V); return rr.ok ? [rr.a, rr.b, rr.c] : null; });
                if (Ls.some(function (L) { return L && LN.same(L, [sh.a, 1, -sh.d]); })) return { code: 'less-than', hint: '“' + sh.d + ' less than ' + sh.a + ' ' + sh.c.smalls + '” means start with ' + t(sh.a + sh.c.S) + ' and take away ' + t(sh.d) + ': ' + t(sh.c.B + '=' + sh.a + sh.c.S + '-' + sh.d) + '.' };
                if (Ls.some(function (L) { return L && LN.same(L, [sh.cc, -sh.b, 0]); })) return { code: 'ratio-swap', hint: 'Check the “cost the same” equation: ' + sh.b + ' ' + sh.c.smalls + ' cost ' + t(sh.b + sh.c.S) + ' dollars, and that equals the cost of ' + sh.cc + ' ' + sh.c.bigs + '.' };
                return null;
              } },
              '“A ' + sh.c.big + ' costs $' + sh.d + ' less than ' + sh.a + ' ' + sh.c.smalls + '”: ' + t(sh.c.B + '=' + sh.a + sh.c.S + '-' + sh.d) + '.<br>“' + sh.b + ' ' + sh.c.smalls + ' cost the same as ' + sh.cc + ' ' + sh.c.bigs + '”: ' + t(sh.b + sh.c.S + '=' + sh.cc + sh.c.B) + '.',
              ['Translate each sentence separately. “' + sh.d + ' less than ' + t(sh.a + sh.c.S) + '” is ' + t(sh.a + sh.c.S + '-' + sh.d) + '.', '“Cost the same as” is an equals sign between the two totals.'], 'write the system');
            p.key = [sh.c.B + '=' + sh.a + sh.c.S + '-' + sh.d, sh.b + sh.c.S + '=' + sh.cc + sh.c.B]; p.answer = t(p.key[0]) + '<br>' + t(p.key[1]);
            p.bad = [[sh.c.B + '=' + sh.d + '-' + sh.a + sh.c.S, sh.b + sh.c.S + '=' + sh.cc + sh.c.B], [sh.c.B + '=' + sh.a + sh.c.S + '-' + sh.d, sh.cc + sh.c.S + '=' + sh.b + sh.c.B]];
            return p;
          } },
          { id: '6b', level: 'PRG', make: function (r, sh) {
            var V = [sh.c.S, sh.c.B], Es = [E(-sh.a, 1, -sh.d), E(sh.b, -sh.cc, 0)], res = subSol(Es, { vars: V, iso: [0, 1], pre: ['Let ' + t(sh.c.S) + ' = price of a ' + sh.c.small + ', ' + t(sh.c.B) + ' = price of a ' + sh.c.big + ': ' + t(sh.c.B + '=' + sh.a + sh.c.S + '-' + sh.d) + ' and ' + t(sh.b + sh.c.S + '=' + sh.cc + sh.c.B) + '.'] });
            return B.number('Set up and solve a system of equations to determine the cost of a ' + sh.c.big + '.', sh.n, function (v) {
              if (v === sh.p) return { code: 'pen-price', hint: 'That’s the price of a <b>' + sh.c.small + '</b>. The question asks for a ' + sh.c.big + ': back-substitute.' };
              if (v === sh.a * sh.p + sh.d) return { code: 'less-than', hint: 'Check the first sentence: “$' + sh.d + ' <b>less</b> than”.' };
              return null;
            }, res.html + '<br>A ' + sh.c.big + ' costs <b>$' + sh.n + '</b>.', ['Write one equation for each sentence, then substitute the expression for the ' + sh.c.big + ' price into the other equation.'], 'cost of a ' + sh.c.big, { before: '$' });
          } }] },
      { num: '7', section: 'Multiple choice and numerical response', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '7', level: 'EMG', make: function (r) {
          var x0, y0, a, c1, c2;
          for (var g = 0; g < 400; g++) { x0 = r.int(2, 10); y0 = rnz(r, -4, 5); a = r.int(2, 4); c1 = x0 + a * y0; c2 = x0 - a * y0; var vals = [x0 + y0, x0 - y0, x0, y0 - x0]; if (vals.filter(function (v, i) { return vals.indexOf(v) === i; }).length === 4 && x0 !== Math.abs(y0)) break; }
          var S = { texs: [pol([[1, 'x'], [a, 'y']]) + '=' + c1, pol([[1, 'x'], [-a, 'y']]) + '=' + c2], Es: [E(1, a, c1), E(1, -a, c2)], iso: [1, 0] };
          var res = subSol(S.Es, { iso: [1, 0] });
          return mc(r, 'If ' + t(S.texs[0]) + ' and ' + t(S.texs[1]) + ', then ' + t('x+y') + ' is equal to', [
            { html: t(x0 + y0), right: true },
            { html: t(x0 - y0), why: 'That’s ' + t('x-y') + '. Add the two values instead.' },
            { html: t(x0), why: 'That’s just ' + t('x') + '. Find ' + t('y') + ' as well, then add.' },
            { html: t(y0 - x0), why: 'That’s ' + t('y-x') + '. The question asks for ' + t('x+y') + '.' }],
            res.html + '<br>' + t('x+y=' + x0 + (y0 < 0 ? '' : '+') + y0 + '=' + (x0 + y0)) + '.', ['Isolate ' + t('x') + ' in the second equation, substitute into the first, and find both ' + t('x') + ' and ' + t('y') + '.'], 'MC x+y');
        } }] },
      { num: '8', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '8', level: 'EMG', make: function (r) {
          var a, b, c; do { a = r.int(2, 5); b = r.int(2, 5); c = r.pick([1, 1, 2]); } while (a === b);
          var abc = a * b * c, xr = r.chance(0.6);
          var fx = function (n, d, s) { return 'x=\\tfrac{1}{' + d + '}(' + n + 'y' + (s < 0 ? '-' : '+') + abc + ')'; }, fy = function (n, d, s) { return 'y=\\tfrac{1}{' + d + '}(' + n + 'x' + (s < 0 ? '-' : '+') + abc + ')'; };
          var cf1 = function (n) { return n === 1 ? '' : String(n); };
          var fX = function (n, d, s) { return fx(cf1(n), d, s); }, fY = function (n, d, s) { return fy(cf1(n), d, s); };
          var opts = xr ? [
            { html: t(fX(a, b, 1)), right: true },
            { html: t(fX(b, b, 1)), why: 'Clear the fractions first (multiply by ' + t(a * b) + '): ' + t(b + 'x-' + a + 'y=' + abc) + '. The coefficient of ' + t('y') + ' is ' + t(a) + ', not ' + t(b) + '.' },
            { html: t(fY(a, b, -1)), why: 'Solving ' + t(b + 'x-' + a + 'y=' + abc) + ' for ' + t('y') + ' means dividing by ' + t(a) + ' — check the fraction in front.' },
            { html: t(fY(b, a, 1)), why: 'Solving ' + t(b + 'x-' + a + 'y=' + abc) + ' for ' + t('y') + ': ' + t(a + 'y=' + b + 'x-' + abc) + '. Check the sign of the constant.' }] : [
            { html: t(fY(b, a, -1)), right: true },
            { html: t(fY(a, a, -1)), why: 'Clear the fractions first (multiply by ' + t(a * b) + '): ' + t(b + 'x-' + a + 'y=' + abc) + '. The coefficient of ' + t('x') + ' is ' + t(b) + ', not ' + t(a) + '.' },
            { html: t(fX(b, a, 1)), why: 'Solving ' + t(b + 'x-' + a + 'y=' + abc) + ' for ' + t('x') + ' means dividing by ' + t(b) + ' — check the fraction in front.' },
            { html: t(fX(a, b, -1)), why: 'Solving ' + t(b + 'x-' + a + 'y=' + abc) + ' for ' + t('x') + ': ' + t(b + 'x=' + a + 'y+' + abc) + '. Check the sign of the constant.' }];
          var rhs = c === 1 ? '1' : String(c);
          var p = mc(r, 'When solving a system of equations, one of which is ' + t('\\dfrac{x}{' + a + '}-\\dfrac{y}{' + b + '}=' + rhs) + ', a substitution which can be made is', opts,
            'Clear the fractions by multiplying every term by ' + t(a * b) + ': ' + t(b + 'x-' + a + 'y=' + abc) + '.<br>' + (xr ? 'Solving for ' + t('x') + ': ' + t(b + 'x=' + a + 'y+' + abc) + ', so ' + t(fX(a, b, 1)) + '.' : 'Solving for ' + t('y') + ': ' + t(a + 'y=' + b + 'x-' + abc) + ', so ' + t(fY(b, a, -1)) + '.'),
            ['Multiply every term by ' + t(a * b) + ' to clear the fractions, then isolate each variable and compare with the options.'], 'MC substitution from fractions');
          p.input.columns = 2; return p;
        } }] },
      { num: '9', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '9', level: 'PRG', make: function (r) {
          var S, v, res;
          for (var g = 0; g < 600; g++) {
            var a1 = r.int(2, 4), b1 = r.int(3, 6), c1 = rnz(r, -9, 9), a2 = r.int(2, 4), b2 = r.int(3, 6), c2 = rnz(r, -9, 9);
            if (a1 === a2 && b1 === b2) continue;
            var Es = [E(a1, -b1, -c1), E(a2, -b2, -c2)], s = solve2(Es[0], Es[1]); if (!s || (isInt(s[0]) && isInt(s[1]))) continue;
            v = qv(qs(s[0], s[1])); var f = v * 10 - Math.floor(v * 10);
            if (v < 0.2 || v > 99 || Math.abs(f - 0.5) < 0.05 || Math.abs(Math.round(v) - v) < 0.06 || Q(s[0])[1] > 13) continue;
            S = { Es: Es, e: [pol([[a1, 'm'], [-b1, 'n'], [c1, '']]), pol([[a2, 'm'], [-b2, 'n'], [c2, '']])], s: s }; break;
          }
          if (!S) S = { Es: [E(2, -5, -8), E(3, -4, 1)], e: ['2m-5n+8', '3m-4n-1'], s: [Q(37, 7), Q(26, 7)] }, v = 11 / 7;
          res = subSol(S.Es, { vars: ['m', 'n'], pre: ['The notation means both expressions equal ' + t('0') + ': ' + t(S.e[0] + '=0') + ' and ' + t(S.e[1] + '=0') + '.'] });
          var want = K.roundTo(v, 1), m0 = qv(S.s[0]), n0 = qv(S.s[1]);
          var p = B.approx('If ' + t(S.e[0] + '=' + S.e[1] + '=0') + ', then the value of ' + t('m-n') + ', to the nearest tenth, is ________.', v, 1, { nr: true, diag: function (x) {
            if (Math.abs(x - K.roundTo(m0 + n0, 1)) < 1e-9) return { code: 'nr-sum', hint: 'That’s ' + t('m+n') + '. The question asks for ' + t('m-n') + '.' };
            if (Math.abs(x - K.roundTo(m0, 1)) < 1e-9 || Math.abs(x - K.roundTo(n0, 1)) < 1e-9) return { code: 'nr-one', hint: 'That’s just one of the values. Find both ' + t('m') + ' and ' + t('n') + ', then subtract.' };
            return null;
          } }, res.html + '<br>' + t('m-n=' + qT(qs(S.s[0], S.s[1])) + '\\approx ' + dc(Math.round(v * 1000) / 1000)) + ', which rounds to <b>' + want.toFixed(1) + '</b>.', ['“' + t('A=B=0') + '” means ' + t('A=0') + ' <b>and</b> ' + t('B=0') + ': two equations.', 'Keep the values as fractions until the very end, then subtract and round.'], 'NR m−n');
          return p;
        } }] },
      { num: '10', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '10', level: 'EMG', make: function (r) {
          var tt, c, a1, b1, a2;
          for (var g = 0; g < 400; g++) { tt = r.int(6, 15); c = r.int(1, 6); a1 = r.int(2, 5); b1 = r.int(2, 4); a2 = r.int(1, 4); if (c < tt && a1 - b1 * a2 !== 0 && a1 !== a2) break; }
          var T1 = a1 * tt + b1 * c, T2 = a2 * tt + c, Es = [E(a1, b1, T1), E(a2, 1, T2)];
          var res = subSol(Es, { vars: ['t', 'c'], iso: [1, 1], pre: ['Let ' + t('t') + ' = price of a movie ticket and ' + t('c') + ' = price of a bag of popcorn, in dollars: ' + t(eqT(Es[0], ['t', 'c'])) + ' and ' + t(eqT(Es[1], ['t', 'c'])) + '.'] });
          return B.nr('Ben pays $' + T1 + ' for ' + a1 + ' movie tickets and ' + b1 + ' bags of popcorn. Mia pays $' + T2 + ' for ' + (a2 === 1 ? '1 movie ticket' : a2 + ' movie tickets') + ' and 1 bag of popcorn. The cost of one movie ticket, in dollars, is ________.', tt, function (v) {
            if (v === c) return { code: 'pen-price', hint: 'That’s the price of a bag of <b>popcorn</b>. The question asks for a movie ticket.' };
            return null;
          }, res.html + '<br>One movie ticket costs <b>$' + tt + '</b>.', ['Let ' + t('t') + ' and ' + t('c') + ' be the prices. Write one equation for Ben and one for Mia, then isolate ' + t('c') + ' in Mia’s equation.'], 'NR ticket price');
        } }] },
      { num: '11', section: 'Extension — three equations in three unknowns', stem: '<i>(Extension)</i> Solve each of the following systems using substitution.', parts: [
        { id: '11a', level: 'PRG', outcome: 'EXT', make: function (r) {
          var x0, k, A, Bz, z0, C, D;
          for (var g = 0; g < 400; g++) { x0 = rnz(r, -8, 8); k = r.pick([2, 3, -2, 4]); A = r.int(2, 5); Bz = r.pick([2, 3, -2]); z0 = rnz(r, -4, 4); if (A !== k && Math.abs(k * x0) <= 30 && x0 + Bz * z0 !== 0) break; }
          var y0 = k * x0; C = A * x0 - y0; D = x0 + Bz * z0;
          var texs = ['y=' + k + 'x', pol([[A, 'x'], [-1, 'y']]) + '=' + C, pol([[1, 'x'], [Bz, 'z']]) + '=' + D];
          var sol = 'Substitute ' + t('y=' + k + 'x') + ' into ' + t(texs[1]) + ': ' + t(A + 'x-(' + k + 'x)=' + C) + ', so ' + (A - k === 1 ? t('x=' + x0) : t(term(A - k, 'x', true) + '=' + C) + ' and ' + t('x=' + x0)) + '.<br>' +
            'Back-substitute: ' + t('y=' + k + '(' + x0 + ')=' + y0) + '.<br>Substitute ' + t('x=' + x0) + ' into ' + t(texs[2]) + ': ' + t(x0 + (Bz < 0 ? '-' : '+') + Math.abs(Bz) + 'z=' + D) + ', so ' + t(term(Bz, 'z', true) + '=' + (D - x0)) + ' and ' + t('z=' + z0) + '.<br>Solution: ' + t('x=' + x0 + ',\\ y=' + y0 + ',\\ z=' + z0) + '.';
          return xyzPart('Solve:' + sysD(texs), [x0, y0, z0], [function (p) { return p[1] === k * p[0]; }, function (p) { return A * p[0] - p[1] === C; }, function (p) { return p[0] + Bz * p[2] === D; }], sol, ['Substitute ' + t('y=' + k + 'x') + ' into the second equation to find ' + t('x') + ' — then the other two values follow.'], '3 unknowns (a)');
        } },
        { id: '11b', level: 'ADV', outcome: 'EXT', make: function (r) {
          var a, b, c, d, e, f, x0, y0, z0;
          for (var g = 0; g < 400; g++) {
            z0 = rnz(r, -3, 3); y0 = rnz(r, -4, 4); x0 = rnz(r, -6, 6); a = r.pick([2, 3, -2]); c = r.int(2, 4); e = r.int(2, 5);
            b = x0 - a * y0; d = -y0 - c * z0; f = x0 - e * z0;
            if (b && d && f && a * c + e !== 0) break;
          }
          var texs = ['x=' + pol([[a, 'y'], [b, '']]), pol([[1, 'y'], [c, 'z'], [d, '']]) + '=0', pol([[1, 'x'], [-e, 'z']]) + '=' + f];
          var yz = pol([[-c, 'z'], [-d, '']]), xz = pol([[-a * c, 'z'], [-a * d + b, '']]);
          var sol = 'From ' + t(texs[1]) + ': ' + t('y=' + yz) + '.<br>Substitute into ' + t(texs[0]) + ': ' + t('x=' + cB(a, yz, true) + term(b, '', false) + '=' + xz) + '.<br>Substitute this ' + t('x') + ' into ' + t(texs[2]) + ': ' + t('\\left(' + xz + '\\right)' + term(-e, 'z', false) + '=' + f) + ', so ' + t(term(-a * c - e, 'z', true) + '=' + (f + a * d - b)) + ' and ' + t('z=' + z0) + '.<br>' +
            'Back-substitute: ' + t('y=' + pol([[-c * z0, ''], [-d, '']]) + '=' + y0) + ', ' + t('x=' + pol([[-a * c * z0, ''], [-a * d + b, '']]) + '=' + x0) + '.<br>Solution: ' + t('x=' + x0 + ',\\ y=' + y0 + ',\\ z=' + z0) + '.';
          return xyzPart('Solve:' + sysD(texs), [x0, y0, z0], [function (p) { return p[0] === a * p[1] + b; }, function (p) { return p[1] + c * p[2] + d === 0; }, function (p) { return p[0] - e * p[2] === f; }], sol, ['Write ' + t('y') + ' in terms of ' + t('z') + ' from the second equation, then ' + t('x') + ' in terms of ' + t('z') + ' from the first. Now the third equation has only ' + t('z') + '.'], '3 unknowns (b)');
        } }] }
    ],
    extra: [
      /* ---------- Part A — choosing what to isolate ---------- */
      { num: '1', section: 'Extra practice A — Choosing What to Isolate', stem: 'For each system: (i) choose the equation and the variable to isolate; (ii) solve by substitution and check in both equations.',
        shared: function (r) { return { a: epA(r, 'a'), b: epA(r, 'b'), c: epA(r, 'c'), d: epA(r, 'd') }; },
        parts: ['a', 'b', 'c', 'd'].reduce(function (acc, L) {
          acc.push({ id: 'e1' + L + 'i', sub: L + ' i', level: 'LIM', make: function (r, sh) { return isoMC(r, sh[L]); } });
          acc.push({ id: 'e1' + L + 'ii', sub: L + ' ii', level: 'EMG', make: function (r, sh) { return solvePart('Solve by substitution:', sh[L]); } });
          return acc;
        }, []).concat([{ id: 'e1e', sub: 'e', level: 'EMG', make: function (r) {
          var A = r.int(3, 8), c = rnz(r, -15, 15);
          return mc(r, 'In ' + t(A + 'x-y=' + c) + ' the coefficient of ' + t('y') + ' is ' + t('-1') + ', not ' + t('1') + '. Why is ' + t('-1') + ' just as good a choice, and what must you watch?', [
            { html: 'Dividing by ' + t('-1') + ' never makes a fraction; just change the sign of <b>every</b> term: ' + t('y=' + A + 'x' + (c < 0 ? '+' : '-') + Math.abs(c)) + '.', right: true },
            { html: 'Dividing by ' + t('-1') + ' never makes a fraction; only the ' + t('x') + '-term changes sign: ' + t('y=' + A + 'x' + (c < 0 ? '-' : '+') + Math.abs(c)) + '.', why: 'Every term on the other side changes sign, the constant too: from ' + t('-y=' + c + '-' + A + 'x') + ' you get ' + t('y=' + (-c) + '+' + A + 'x') + '.' },
            { html: 'It isn’t as good — a ' + t('-1') + ' always leaves a fraction.', why: 'Dividing by ' + t('-1') + ' gives whole numbers: it only changes signs.' },
            { html: 'It isn’t as good — you should multiply both equations by ' + t('-1') + ' first.', why: 'No extra step is needed: isolate ' + t('y') + ' and divide every term by ' + t('-1') + '.' }],
            t(A + 'x-y=' + c) + ' gives ' + t('-y=' + pol([[-A, 'x'], [c, '']])) + ', then dividing <b>every</b> term by ' + t('-1') + ': ' + t('y=' + pol([[A, 'x'], [-c, '']])) + '. No fraction appears; the one thing to watch is that every term changes sign — losing one of those signs is the commonest error in the method.', [], 'why −1 is fine');
        } }]) },
      { num: '2', stem: 'No coefficient is 1 or −1, so a fraction is unavoidable. Solve by substitution, carrying the fractions exactly, and check in both equations.', parts: [
        { id: 'e2a', level: 'PRG', make: function (r) { return solvePart('Solve by substitution:', epFrac(r, true, 'y'), null, null, { exact: true }); } },
        { id: 'e2b', level: 'PRG', make: function (r) { return solvePart('Solve by substitution. Give exact values (fractions in lowest terms).', epFrac(r, false, 'y'), null, null, { exact: true }); } },
        { id: 'e2c', level: 'PRG', make: function (r) { return solvePart('Solve by substitution. Give exact values (fractions in lowest terms).', epFrac(r, false, 'x'), null, null, { exact: true }); } },
        { id: 'e2d', level: 'EMG', make: function (r) {
          var k = r.pick([2, 3]), m = k * r.int(2, 3);
          return mc(r, 'A student isolates ' + t('y=\\frac{8-3x}{' + k + '}') + ' and substitutes it into an equation containing ' + t('-' + m + 'y') + '. A fraction appeared in the middle of the work, but the final answer is a whole-number pair. How is that possible?', [
            { html: t(m) + ' is a multiple of the denominator ' + t(k) + ', so the fraction cancels completely: ' + t('-' + m + '\\cdot\\frac{8-3x}{' + k + '}=-' + (m / k) + '(8-3x)') + '. A fraction partway through is not a sign of an error.', right: true },
            { html: 'The student must have made an error that cancelled out another error.', why: 'Fractions in the middle of correct work are normal. Here the denominator divides the coefficient it is multiplied by.' },
            { html: 'Fractions always disappear by the end of a correct solution.', why: 'Not always — many systems have fractional solutions (see parts (b) and (c)).' },
            { html: 'The student should have rounded the fraction to a decimal.', why: 'Rounding makes the answer inexact. Keep the fraction and let it cancel.' }],
            'Multiplying ' + t('\\frac{8-3x}{' + k + '}') + ' by ' + t(m) + ' cancels the denominator, because ' + t(m + '=' + k + '\\times ' + (m / k)) + '. The equation becomes a whole-number equation again. A fraction only matters if it is still there at the end.', [], 'fraction in the middle');
        } }] },
      /* ---------- Part B — general form ---------- */
      { num: '3', section: 'Extra practice B — Both Equations in General Form', stem: 'Solve each system by substitution and check in both equations. Write each answer as an ordered pair.', parts: [
        { id: 'e3a', level: 'EMG', make: function (r) { return solvePart('Solve by substitution:', epGen(r, 'a')); } },
        { id: 'e3b', level: 'EMG', make: function (r) { return solvePart('Solve by substitution:', epGen(r, 'b')); } },
        { id: 'e3c', level: 'PRG', make: function (r) { return solvePart('Solve by substitution:', epGen(r, 'c')); } },
        { id: 'e3d', level: 'PRG', make: function (r) { return solvePart('Solve by substitution:', epGen(r, 'd')); } }] },
      /* ---------- Part C — clear fractions and decimals ---------- */
      { num: '4', section: 'Extra practice C — Clear the Fractions and Decimals First', stem: 'Clear the fractions or decimals from each equation first, then solve by substitution. Check in the original equations.', parts: [
        { id: 'e4a', level: 'PRG', make: function (r) { return solvePart('Solve:', ep4a(r), ['Multiply each equation by the lowest common denominator of its fractions.', 'Then isolate a variable with coefficient ' + t('\\pm1') + ' if there is one.']); } },
        { id: 'e4b', level: 'PRG', make: function (r) { return solvePart('Solve:', ep4b(r), ['Multiply both equations by ' + t('10') + ' to clear the decimals.']); } },
        { id: 'e4c', level: 'ADV', make: function (r) { return solvePart('Solve. Give exact values.', ep4c(r), ['Multiply the decimal equation by ' + t('4') + ' and the fraction equation by ' + t('3') + '.', 'The answer has fractions — keep them exact.'], null, { exact: true }); } },
        { id: 'e4d', level: 'EMG', make: function (r) {
          return mc(r, 'A classmate says decimal systems are easier on a calculator, working in decimals throughout. Why is clearing to whole numbers safer?', [
            { html: 'Whole-number work stays exact, so the check either works or it doesn’t. A rounded decimal like ' + t('1.36') + ' for ' + t('\\frac{19}{14}') + ' can look right in a check when it isn’t.', right: true },
            { html: 'Calculators can’t multiply decimals correctly.', why: 'The calculator is fine — the problem is that it rounds answers like ' + t('\\frac{19}{14}=1.357142\\ldots') + '.' },
            { html: 'Decimals give a different solution from fractions.', why: 'The exact values are the same; rounding is what changes them.' },
            { html: 'There is no difference: decimals are always exact.', why: 'Many solutions, like ' + t('\\frac{19}{14}') + ', never end as decimals, so any decimal you write is rounded.' }],
            'Clearing to integers keeps every step exact. A solution such as ' + t('x=\\frac{19}{14}=1.357\\,142\\,8\\ldots') + ' can’t be shown exactly on a calculator; rounded to ' + t('1.36') + ' it gives a check that <i>looks</i> right, so right and wrong answers become impossible to tell apart.', [], 'why clear decimals');
        } }] },
      /* ---------- Part D — collapse ---------- */
      { num: '5', section: 'Extra practice D — When Substitution Collapses', stem: 'Solve each system by substitution. Each one collapses: both variables disappear.',
        shared: function (r) { return { a: ep5(r, 'a'), b: ep5(r, 'b'), c: ep5(r, 'c'), d: ep5(r, 'd') }; },
        parts: ['a', 'b', 'c', 'd'].reduce(function (acc, L) {
          acc.push({ id: 'e5' + L, sub: L + ' i–ii', level: L === 'b' || L === 'd' ? 'PRG' : 'EMG', make: function (r, sh) { return solvePart('Solve by substitution. Use the <b>no solution</b> or <b>infinitely many</b> key for the number of solutions.', sh[L], ['Substitute and simplify until both variables cancel. Is the number statement left over always true or never true?']); } });
          acc.push({ id: 'e5' + L + 'iii', sub: L + ' iii', level: 'EMG', make: function (r, sh) { return linesMC(r, sh[L]); } });
          return acc;
        }, []).concat([{ id: 'e5e', sub: 'e', level: 'EMG', make: function (r) {
          var k = r.int(3, 9);
          return mc(r, 'A student says: “I got ' + t('x=0') + ', so there is no solution.” What is the difference between finding ' + t('x=0') + ' and arriving at ' + t('0=' + k) + '?', [
            { html: t('x=0') + ' is a value: the system has one solution whose ' + t('x') + '-coordinate is ' + t('0') + ' (find ' + t('y') + ' next). ' + t('0=' + k) + ' is a false statement: no solution.', right: true },
            { html: 'Both mean there is no solution.', why: t('x=0') + ' is a perfectly good value of ' + t('x') + ' — the variable survived the algebra.' },
            { html: t('x=0') + ' means infinitely many solutions; ' + t('0=' + k) + ' means one solution.', why: 'A false number statement like ' + t('0=' + k) + ' means no point works at all.' },
            { html: 'Both mean infinitely many solutions.', why: 'Only an always-true statement such as ' + t('0=0') + ' means infinitely many.' }],
            'Finding ' + t('x=0') + ' means the variable has a value: one solution, with ' + t('x') + '-coordinate ' + t('0') + '. Arriving at ' + t('0=' + k) + ' means every variable cancelled and what is left is false: no point satisfies both equations, so there is no solution.', [], 'x=0 vs 0=k');
        } }]) },
      /* ---------- Part E — not lattice points ---------- */
      { num: '6', section: 'Extra practice E — Answers That Are Not Lattice Points', stem: 'Solve each system by substitution, leaving every coordinate as an exact fraction in lowest terms.',
        shared: function (r) { return { a: ep6(r), b: ep6(r) }; },
        parts: [
          { id: 'e6a', level: 'PRG', make: function (r, sh) { return solvePart('Solve by substitution. Give exact values.', sh.a, null, null, { exact: true }); } },
          { id: 'e6b', level: 'PRG', make: function (r, sh) { return solvePart('Solve by substitution. Give exact values.', sh.b, null, null, { exact: true }); } },
          { id: 'e6c', level: 'EMG', make: function (r, sh) {
            var s = solve2(sh.b.Es[0], sh.b.Es[1]), ap = '(' + dc(Math.round(qv(s[0]) * 100) / 100) + ',\\ ' + dc(Math.round(qv(s[1]) * 100) / 100) + ')';
            return mc(r, 'The solution of ' + t(sh.b.texs[0]) + ' and ' + t(sh.b.texs[1]) + ' is ' + t(ptT(s)) + '. What would a graph drawn with one square per unit have told you?', [
              { html: 'Only that the lines cross somewhere inside the square from ' + t('(0,\\ 0)') + ' to ' + t('(1,\\ 1)') + ' — no grid point to read, so substitution’s exact answer is the one to trust.', right: true },
              { html: 'The exact solution, by reading the nearest grid point.', why: 'The nearest grid point is not on either line. A graph can only report points it can land on.' },
              { html: 'That there is no solution, because the lines don’t cross on a grid point.', why: 'The lines do cross — just between grid lines. Not landing on a grid point doesn’t mean no solution.' },
              { html: 'The same answer as substitution, ' + t(ap) + ', exactly.', why: 'Those are rounded decimals, and no one-unit grid can show hundredths.' }],
              'The crossing point ' + t(ptT(s) + '\\approx ' + ap) + ' lies inside one grid square. On a one-unit grid there is no mark to read it against, so the graph can only give a rough estimate. Substitution never rounds: it gives the exact fractions, which can be checked exactly.', [], 'graph vs substitution');
          } }] },
      /* ---------- Part F — translating ---------- */
      { num: '7', section: 'Extra practice F — Translating to a System', stem: function (sh) { return 'A lab technician has one bottle of ' + sh.p1 + '% acid solution and one bottle of ' + sh.p2 + '% acid solution. She needs to mix them to make ' + HW.fmt(sh.V) + ' mL of a ' + sh.pt + '% acid solution.'; },
        shared: function (r) {
          for (var g = 0; g < 400; g++) {
            var p1 = r.pick([10, 20, 25, 30]), p2 = r.pick([50, 60, 70, 75, 80]), pt = 5 * r.int(Math.ceil((p1 + 5) / 5), Math.floor((p2 - 5) / 5)), V = 100 * r.int(3, 12), x = V * (p2 - pt) / (p2 - p1);
            if (Number.isInteger(x) && x % 10 === 0 && x > 0 && x < V && x !== V / 2) return { p1: p1, p2: p2, pt: pt, V: V, x: x, y: V - x };
          }
          return { p1: 25, p2: 60, pt: 40, V: 700, x: 400, y: 300 };
        },
        parts: [
          { id: 'e7a', level: 'PRG', make: function (r, sh) {
            var V = ['x', 'y'], T1 = { A: 1, B: 1, C: -sh.V }, T2 = { A: sh.p1, B: sh.p2, C: -sh.pt * sh.V };
            var p = B.system('Let ' + t('x') + ' be the volume of the ' + sh.p1 + '% solution and ' + t('y') + ' the volume of the ' + sh.p2 + '% solution, in mL. Write a system: one equation for volume and one for acid.', [T1, T2], { vars: V,
              diag: function (resp) {
                var Ls = (resp || []).map(function (s) { var rr = LN.read(s, V); return rr.ok ? [rr.a, rr.b, rr.c] : null; });
                var is = function (L) { return Ls.some(function (z) { return z && LN.same(z, L); }); };
                if (is([sh.p1, sh.p2, -sh.pt]) || is([sh.p1 / 100, sh.p2 / 100, -sh.pt / 100])) return { code: 'mix-total', hint: 'The acid in the mixture is ' + sh.pt + '% <b>of ' + HW.fmt(sh.V) + ' mL</b>: ' + t(dc(sh.pt / 100) + '(' + sh.V + ')=' + dc(sh.pt * sh.V / 100)) + ' mL, not ' + t(sh.pt) + '.' };
                if (is([sh.p1 / 100, sh.p2 / 100, -sh.V]) || is([sh.p1, sh.p2, -sh.V])) return { code: 'mix-total', hint: 'The acid equation adds up <b>acid</b>, not total volume: the right side is the acid in the mixture, ' + t(dc(sh.pt / 100) + '(' + sh.V + ')') + ' mL.' };
                if (is([sh.p2, sh.p1, -sh.pt * sh.V])) return { code: 'mix-swap', hint: 'Which variable belongs to the ' + sh.p1 + '% solution? Match each percent to its own volume.' };
                if (is([sh.p1, sh.p2, -sh.pt * sh.V / 100])) return { code: 'mix-pct', hint: 'Write each percent as a decimal (' + t(sh.p1 + '\\%=' + dc(sh.p1 / 100)) + ') on <b>both</b> sides of the acid equation.' };
                return null;
              } },
              'Volume: ' + t('x+y=' + sh.V) + '.<br>Acid: ' + t(dc(sh.p1 / 100) + 'x+' + dc(sh.p2 / 100) + 'y=' + dc(sh.pt / 100) + '(' + sh.V + ')=' + dc(sh.pt * sh.V / 100)) + '.',
              ['The volumes add up to the total. The acid amounts (percent × volume) add up to the acid in the mixture.'], 'mixture system');
            p.key = ['x+y=' + sh.V, dc(sh.p1 / 100) + 'x+' + dc(sh.p2 / 100) + 'y=' + dc(sh.pt * sh.V / 100)]; p.answer = t(p.key[0]) + '<br>' + t(p.key[1]);
            p.bad = [['x+y=' + sh.V, dc(sh.p1 / 100) + 'x+' + dc(sh.p2 / 100) + 'y=' + dc(sh.pt / 100)], ['x+y=' + sh.V, sh.p1 + 'x+' + sh.p2 + 'y=' + sh.pt]];
            return p;
          } },
          { id: 'e7b', level: 'PRG', make: function (r, sh) {
            var Es = [E(1, 1, sh.V), E(sh.p1, sh.p2, sh.pt * sh.V)];
            var res = subSol(Es, { iso: [0, 0], check: false, pre: ['System: ' + t('x+y=' + sh.V) + ' and ' + t(dc(sh.p1 / 100) + 'x+' + dc(sh.p2 / 100) + 'y=' + dc(sh.pt * sh.V / 100)) + '. Multiply the acid equation by ' + t('100') + ': ' + t(eqT(Es[1])) + '.'] });
            var chk = function (resp) {
              var a = HW.parse.number(String((resp || [])[0] || '')), b = HW.parse.number(String((resp || [])[1] || ''));
              if (!a.ok || !b.ok) return form('empty', 'Enter a volume in each box.');
              if (a.value === sh.x && b.value === sh.y) return ok();
              if (a.value === sh.y && b.value === sh.x) return wrong('mix-swap', 'Right numbers, wrong bottles. The mixture (' + sh.pt + '%) is closer to ' + (sh.pt - sh.p1 < sh.p2 - sh.pt ? sh.p1 : sh.p2) + '%, so more of the ' + (sh.pt - sh.p1 < sh.p2 - sh.pt ? sh.p1 : sh.p2) + '% solution is needed.');
              if (a.value + b.value !== sh.V) return wrong('mix-total', 'Your two volumes must add up to ' + HW.fmt(sh.V) + ' mL.');
              return wrong('mix-pct', 'The volumes add to ' + HW.fmt(sh.V) + ' mL, but the acid doesn’t come out to ' + sh.pt + '%. Check the acid equation.');
            };
            return { prompt: 'Solve the system by substitution. How much of each solution should she mix?', input: { type: 'fields', fields: [{ label: sh.p1 + '% solution', after: 'mL' }, { label: sh.p2 + '% solution', after: 'mL' }] }, check: chk, key: [String(sh.x), String(sh.y)],
              answer: HW.fmt(sh.x) + ' mL of the ' + sh.p1 + '% and ' + HW.fmt(sh.y) + ' mL of the ' + sh.p2 + '% solution', solution: res.html + '<br>Check: ' + t(dc(sh.p1 / 100) + '(' + sh.x + ')+' + dc(sh.p2 / 100) + '(' + sh.y + ')=' + dc(sh.pt * sh.V / 100)) + ' ✓<br>She should mix <b>' + HW.fmt(sh.x) + ' mL</b> of the ' + sh.p1 + '% solution with <b>' + HW.fmt(sh.y) + ' mL</b> of the ' + sh.p2 + '% solution.',
              hints: ['Volume: ' + t('x+y=' + sh.V) + '. Acid: ' + t(dc(sh.p1 / 100) + 'x+' + dc(sh.p2 / 100) + 'y=' + dc(sh.pt / 100) + '(' + sh.V + ')') + '.', 'Isolate ' + t('x') + ' in the volume equation and substitute.'], text: 'mixture amounts', bad: [[String(sh.y), String(sh.x)]] };
          } }] },
      { num: '8', stem: function (sh) { return 'A river tour boat travels ' + sh.D + ' km downstream in ' + sh.t1 + ' hours, then returns the same ' + sh.D + ' km upstream in ' + sh.t2 + ' hours. Downstream the current adds to the boat’s own speed; upstream it subtracts.'; },
        shared: function (r) {
          for (var g = 0; g < 400; g++) {
            var tp = r.pick([[2, 3], [3, 4], [1, 2], [3, 5], [2, 3]]), c = r.int(2, 6), num = c * (tp[0] + tp[1]), dd = tp[1] - tp[0];
            if (num % dd) continue; var b = num / dd, D = tp[0] * (b + c), tn = D / b;
            if (Math.round(tn * 100) / 100 === tn && D <= 120) return { t1: tp[0], t2: tp[1], b: b, c: c, D: D, tn: tn };
          }
          return { t1: 2, t2: 3, b: 20, c: 4, D: 48, tn: 2.4 };
        },
        parts: [
          { id: 'e8a', level: 'PRG', make: function (r, sh) {
            var V = ['b', 'c'], T1 = { A: 1, B: 1, C: -sh.D / sh.t1 }, T2 = { A: 1, B: -1, C: -sh.D / sh.t2 };
            var p = B.system('Let ' + t('b') + ' be the boat’s speed in still water and ' + t('c') + ' the speed of the current, both in km/h. Write two equations using distance = speed × time.', [T1, T2], { vars: V,
              diag: function (resp) {
                var Ls = (resp || []).map(function (s) { var rr = LN.read(s, V); return rr.ok ? [rr.a, rr.b, rr.c] : null; }), is = function (L) { return Ls.some(function (z) { return z && LN.same(z, L); }); };
                if (is([1, 1, -sh.D / sh.t2]) || is([1, -1, -sh.D / sh.t1])) return { code: 'boat-swap', hint: 'Downstream the current helps, so the boat is <b>faster</b> and takes the <b>shorter</b> time: ' + t(sh.t1 + '(b+c)=' + sh.D) + '.' };
                if (is([1, 1, -sh.D]) || is([1, -1, -sh.D])) return { code: 'boat-dist', hint: t(sh.D) + ' km is the distance, not a speed. Distance = speed × time: ' + t(sh.t1 + '(b+c)=' + sh.D) + '.' };
                return null;
              } },
              'Downstream speed ' + t('b+c') + ', upstream speed ' + t('b-c') + ':<br>' + t(sh.t1 + '(b+c)=' + sh.D) + ', so ' + t('b+c=' + sh.D / sh.t1) + '<br>' + t(sh.t2 + '(b-c)=' + sh.D) + ', so ' + t('b-c=' + sh.D / sh.t2),
              ['Downstream the speed is ' + t('b+c') + '; upstream it is ' + t('b-c') + '. Multiply each speed by its time to get the distance.'], 'boat system');
            p.key = [sh.t1 + '(b+c)=' + sh.D, sh.t2 + '(b-c)=' + sh.D]; p.answer = t(p.key[0]) + '<br>' + t(p.key[1]);
            p.good = [['b+c=' + sh.D / sh.t1, 'b-c=' + sh.D / sh.t2]]; p.bad = [['b+c=' + sh.D / sh.t2, 'b-c=' + sh.D / sh.t1]];
            return p;
          } },
          { id: 'e8b', level: 'PRG', make: function (r, sh) {
            var Es = [E(1, 1, sh.D / sh.t1), E(1, -1, sh.D / sh.t2)], res = subSol(Es, { vars: ['b', 'c'], iso: [0, 0], pre: [t(sh.t1 + '(b+c)=' + sh.D) + ' gives ' + t('b+c=' + sh.D / sh.t1) + '; ' + t(sh.t2 + '(b-c)=' + sh.D) + ' gives ' + t('b-c=' + sh.D / sh.t2) + '.'] });
            var chk = function (resp) {
              var a = HW.parse.number(String((resp || [])[0] || '')), b = HW.parse.number(String((resp || [])[1] || ''));
              if (!a.ok || !b.ok) return form('empty', 'Enter a speed in each box.');
              if (a.value === sh.b && b.value === sh.c) return ok();
              if (a.value === sh.c && b.value === sh.b) return wrong('pq-swap', 'Right numbers in the wrong boxes: the boat is faster than the current.');
              if (a.value + b.value === sh.D / sh.t1 || a.value - b.value === sh.D / sh.t2) return wrong('sys-one-eq', 'Your speeds work in only one of the equations. Check both: ' + t('b+c=' + sh.D / sh.t1) + ' and ' + t('b-c=' + sh.D / sh.t2) + '.');
              return wrong('pt', null);
            };
            return { prompt: 'Solve the system by substitution. Find the boat’s speed in still water and the speed of the current.', input: { type: 'fields', fields: [{ label: 'boat ' + t('b='), after: 'km/h' }, { label: 'current ' + t('c='), after: 'km/h' }] }, check: chk, key: [String(sh.b), String(sh.c)],
              answer: 'boat ' + sh.b + ' km/h, current ' + sh.c + ' km/h', solution: res.html + '<br>The boat’s speed in still water is <b>' + sh.b + ' km/h</b> and the current flows at <b>' + sh.c + ' km/h</b>.',
              hints: [t('b+c=' + sh.D / sh.t1) + ' and ' + t('b-c=' + sh.D / sh.t2) + '. Isolate ' + t('b') + ' in the first and substitute.'], text: 'boat and current', bad: [[String(sh.c), String(sh.b)]] };
          } },
          { id: 'e8c', level: 'ADV', make: function (r, sh) {
            return B.number('How long would the ' + sh.D + '-km trip take one way with <b>no</b> current at all? (Give the time in hours.)', sh.tn, function (v) {
              if (v === (sh.t1 + sh.t2) / 2) return { code: 'boat-avg', hint: 'Averaging the two times doesn’t work: the boat spends longer going slowly. Find the boat’s still-water speed and use time = distance ÷ speed.' };
              if (v === sh.D / sh.c) return { code: 'boat-dist', hint: 'That uses the current’s speed. With no current the boat moves at its still-water speed.' };
              return null;
            }, 'From the system, the boat’s speed in still water is ' + t('b=' + sh.b) + ' km/h (current ' + t('c=' + sh.c) + ' km/h).<br>With no current: ' + t('\\text{time}=\\frac{' + sh.D + '}{' + sh.b + '}=' + dc(sh.tn)) + ' hours' + (sh.tn % 1 ? ' (' + Math.floor(sh.tn) + ' h ' + Math.round((sh.tn % 1) * 60) + ' min)' : '') + '.', ['First find ' + t('b') + ', the boat’s speed in still water, from the system.', 'Time = distance ÷ speed.'], 'no-current time', { after: 'h' });
          } }] },
      /* ---------- Part G — error analysis ---------- */
      { num: '9', section: 'Extra practice G — Error Analysis', stem: function (sh) { return 'Asked to solve ' + t(sh.texs[0]) + ' and ' + t(sh.texs[1]) + ', a student writes ' + t(sh.texs[0] + '\\Rightarrow y=' + pol([[sh.c, ''], [-sh.a, 'x']])) + ', then ' + t(pol([[sh.a, 'x']]) + '+(' + pol([[sh.c, ''], [-sh.a, 'x']]) + ')=' + sh.c + '\\Rightarrow ' + sh.c + '=' + sh.c) + ', and concludes that the system has infinitely many solutions.'; },
        shared: function (r) {
          for (var g = 0; g < 400; g++) {
            var a = r.int(2, 5), x0 = rnz(r, -3, 4), y0 = rnz(r, -4, 5), d = r.int(2, 5), e = r.int(2, 5), c = a * x0 + y0, f = d * x0 - e * y0;
            if (c > 0 && f && d * -1 - (-e) * a !== 0) return { a: a, c: c, d: d, e: e, f: f, x0: x0, y0: y0, texs: [pol([[a, 'x'], [1, 'y']]) + '=' + c, pol([[d, 'x'], [-e, 'y']]) + '=' + f], Es: [E(a, 1, c), E(d, -e, f)], iso: [0, 1] };
          }
          return { a: 2, c: 7, d: 3, e: 4, f: 5, x0: 3, y0: 1, texs: ['2x+y=7', '3x-4y=5'], Es: [E(2, 1, 7), E(3, -4, 5)], iso: [0, 1] };
        },
        parts: [
          { id: 'e9a', level: 'PRG', make: function (r, sh) {
            return mc(r, 'What is the student’s error?', [
              { html: 'They substituted ' + t('y=' + pol([[sh.c, ''], [-sh.a, 'x']])) + ' back into the <b>same</b> equation it came from, so a true statement like ' + t(sh.c + '=' + sh.c) + ' was guaranteed. It must go into the other equation.', right: true },
              { html: 'They isolated ' + t('y') + ' incorrectly.', why: t('y=' + pol([[sh.c, ''], [-sh.a, 'x']])) + ' is correct. The mistake is where they substituted it.' },
              { html: 'Nothing — ' + t(sh.c + '=' + sh.c) + ' really does mean infinitely many solutions.', why: 'Only if the substitution went into the <b>other</b> equation. Putting an equation back into itself always gives a true statement.' },
              { html: 'They should have isolated ' + t('x') + ' instead of ' + t('y') + '.', why: 'Isolating ' + t('y') + ' was a good choice (coefficient ' + t('1') + '). The problem is which equation they substituted into.' }],
              t('y=' + pol([[sh.c, ''], [-sh.a, 'x']])) + ' is just ' + t(sh.texs[0]) + ' rewritten. Putting it back into the same equation makes the ' + t('x') + '-terms cancel and leaves a true statement, no matter what the other equation is — so ' + t(sh.c + '=' + sh.c) + ' carries no information. The expression has to go into the <b>other</b> equation, ' + t(sh.texs[1]) + '.', [], 'error: same equation');
          } },
          { id: 'e9b', level: 'EMG', make: function (r, sh) { return solvePart('Carry out the substitution correctly and solve the system:', sh); } },
          { id: 'e9c', level: 'PRG', make: function (r, sh) {
            var E1 = sh.Es[0], E2 = sh.Es[1], key = null;
            for (var x = 0; x <= 6 && !key; x++) { var P = [x, sh.c - sh.a * x]; if (!onE(E2, P)) key = P; }
            var chk = function (resp) {
              var rp = LN.readPoint(resp); if (rp.empty) return form('empty', 'Type a point first.');
              if (rp.bad || rp.kind !== 'pt') return form('pt-unreadable', 'Write a point as an ordered pair, e.g. ' + t('(0,\\ 7)') + '.');
              var P = [rp.p[0].v, rp.p[1].v], on1 = Math.abs(sh.a * P[0] + P[1] - sh.c) < 1e-9, on2 = Math.abs(sh.d * P[0] - sh.e * P[1] - sh.f) < 1e-9;
              if (on1 && !on2) return ok();
              if (on1 && on2) return wrong('cx-solution', 'That point satisfies <b>both</b> equations — it is the solution. Pick a different point on ' + t(sh.texs[0]) + '.');
              return wrong('cx-not-on', 'That point isn’t on ' + t(sh.texs[0]) + ': ' + t(sh.a + '(' + P[0] + ')+(' + P[1] + ')') + ' isn’t ' + t(sh.c) + '. Choose any ' + t('x') + ' and work out ' + t('y=' + pol([[sh.c, ''], [-sh.a, 'x']])) + '.');
            };
            return { prompt: 'Find a point that satisfies ' + t(sh.texs[0]) + ' but <b>not</b> ' + t(sh.texs[1]) + '. (One such point disproves “infinitely many solutions”.)', input: { type: 'math', keys: 'pairs', placeholder: 'e.g. (0, 7)' }, check: chk, key: ptK(key), answer: t(ptT(key)) + ' (for example)',
              solution: 'Choose any ' + t('x') + ' and use ' + t('y=' + pol([[sh.c, ''], [-sh.a, 'x']])) + '. For example ' + t(ptT(key)) + ': ' + t(sh.a + '(' + key[0] + ')+' + (key[1] < 0 ? '(' + key[1] + ')' : key[1]) + '=' + sh.c) + ' ✓, but ' + t(sh.d + '(' + key[0] + ')-' + sh.e + '(' + key[1] + ')=' + (sh.d * key[0] - sh.e * key[1])) + ', not ' + t(sh.f) + '.<br>If the system really had infinitely many solutions, the equations would be the same line and <b>every</b> point of the first would satisfy the second. One counter-example destroys that claim.',
              hints: ['Pick an easy ' + t('x') + ' (like ' + t('0') + '), find ' + t('y') + ' from the first equation, then test the point in the second.'], text: 'counter-example', bad: [ptK([sh.x0, sh.y0]), '(100, 100)'] };
          } }] },
      { num: '10', stem: function (sh) { return 'Asked to solve ' + t(sh.texs[0]) + ' and ' + t(sh.texs[1]) + ', a student isolates ' + t('y=\\frac{' + sh.e + '-x}{' + sh.d + '}') + ', substitutes correctly, reaches ' + t(sh.k + 'x=' + sh.k * sh.x0) + ', writes “' + t('x=' + sh.x0) + '”, and stops.'; },
        shared: function (r) {
          for (var g = 0; g < 400; g++) {
            var a = r.int(2, 6), b = r.int(2, 4), d = r.int(2, 4), x0 = rnz(r, -3, 5), y0 = rnz(r, -3, 5), c = a * x0 - b * y0, e = x0 + d * y0, k = a * d + b;
            if (c && e > 0 && Math.abs(x0) !== Math.abs(y0)) return { a: a, b: b, c: c, d: d, e: e, k: k, x0: x0, y0: y0, texs: [pol([[a, 'x'], [-b, 'y']]) + '=' + c, pol([[1, 'x'], [d, 'y']]) + '=' + e], Es: [E(a, -b, c), E(1, d, e)], iso: [1, 1] };
          }
          return { a: 5, b: 2, c: 4, d: 3, e: 11, k: 17, x0: 2, y0: 3, texs: ['5x-2y=4', 'x+3y=11'], Es: [E(5, -2, 4), E(1, 3, 11)], iso: [1, 1] };
        },
        parts: [
          { id: 'e10a', level: 'EMG', make: function (r, sh) {
            var L = sh.a + 'x-' + sh.b + '\\left(\\frac{' + sh.e + '-x}{' + sh.d + '}\\right)=' + sh.c;
            return mc(r, 'After substituting, the student has ' + t(L) + '. Which line correctly clears the fraction?', [
              { html: t((sh.a * sh.d) + 'x-' + sh.b + '(' + sh.e + '-x)=' + sh.c * sh.d), right: true },
              { html: t((sh.a * sh.d) + 'x-' + sh.b + '(' + sh.e + '-x)=' + sh.c), why: 'Every term must be multiplied by ' + t(sh.d) + ' — the right side too.' },
              { html: t(sh.a + 'x-' + sh.b + '(' + sh.e + '-x)=' + sh.c * sh.d), why: 'Every term must be multiplied by ' + t(sh.d) + ', including ' + t(sh.a + 'x') + '.' },
              { html: t((sh.a * sh.d) + 'x-' + (sh.b * sh.e) + '-' + sh.b + 'x=' + sh.c * sh.d), why: 'Expanding ' + t('-' + sh.b + '(' + sh.e + '-x)') + ': ' + t('-' + sh.b + '\\times(-x)=+' + sh.b + 'x') + '.' }],
              'Multiply <b>every</b> term by ' + t(sh.d) + ': ' + t((sh.a * sh.d) + 'x-' + sh.b + '(' + sh.e + '-x)=' + sh.c * sh.d) + '.<br>Then ' + t((sh.a * sh.d) + 'x-' + sh.b * sh.e + '+' + sh.b + 'x=' + sh.c * sh.d) + ', so ' + t(sh.k + 'x=' + sh.k * sh.x0) + ' and ' + t('x=' + sh.x0) + '.', [], 'clear the fraction');
          } },
          { id: 'e10b', level: 'EMG', make: function (r, sh) { return solvePart('Finish the question properly: give the solution of the system.', sh, ['Back-substitute ' + t('x=' + sh.x0) + ' into ' + t('y=\\frac{' + sh.e + '-x}{' + sh.d + '}') + '.']); } },
          { id: 'e10c', level: 'EMG', make: function (r, sh) {
            return mc(r, 'Why can’t “' + t('x=' + sh.x0) + '” be the solution of a system of two equations in two variables?', [
              { html: 'A solution is a <b>point</b> where the lines meet, so it needs both coordinates: ' + t(ptT([sh.x0, sh.y0])) + '. On its own, ' + t('x=' + sh.x0) + ' is a whole vertical line.', right: true },
              { html: 'It can — the ' + t('y') + '-value is optional.', why: 'Each equation is a line; the solution is the point where both lines meet, and a point needs both coordinates.' },
              { html: 'Because ' + t('x') + ' must always be found last.', why: 'Either variable can be found first. The issue is stopping before the second one is found.' },
              { html: 'Because the value of ' + t('x') + ' is wrong.', why: t('x=' + sh.x0) + ' is right — it just isn’t a complete solution.' }],
              'Solving a system means finding where the two lines meet — a point, with two coordinates. ' + t('x=' + sh.x0) + ' alone describes the vertical line through ' + t(sh.x0) + '. Back-substitute: ' + t('y=\\frac{' + sh.e + '-' + (sh.x0 < 0 ? '(' + sh.x0 + ')' : sh.x0) + '}{' + sh.d + '}=' + sh.y0) + ', so the solution is ' + t(ptT([sh.x0, sh.y0])) + '.', [], 'why x alone is not a solution');
          } }] },
      { num: '11', stem: function (sh) { return 'Asked to solve ' + t(sh.texs[0]) + ' and ' + t(sh.texs[1]) + ', a student isolates ' + t('x=' + sh.b + '-' + sh.a + 'y') + ' and then writes ' + t(sh.c + 'y-' + sh.b + '-' + sh.a + 'y=' + sh.d + '\\Rightarrow ' + (sh.c - sh.a) + 'y=' + (sh.d + sh.b) + '\\Rightarrow y=' + sh.yw) + ', ' + t('x=' + sh.b + '-' + sh.a + '(' + sh.yw + ')=' + sh.xw) + '.'; },
        shared: function (r) {
          for (var g = 0; g < 600; g++) {
            var a = r.int(2, 3), c = r.int(a + 1, 6), b = r.int(1, 6), y0 = rnz(r, -3, 4), d = (c + a) * y0 - b, yw = (d + b) / (c - a);
            if (d > 0 && Number.isInteger(yw) && yw !== y0 && Math.abs(yw) <= 15) { var x0 = b - a * y0; return { a: a, b: b, c: c, d: d, y0: y0, x0: x0, yw: yw, xw: b - a * yw, texs: [pol([[1, 'x'], [a, 'y']]) + '=' + b, pol([[c, 'y'], [-1, 'x']]) + '=' + d], Es: [E(1, a, b), E(-1, c, d)], iso: [0, 0] }; }
          }
          return { a: 2, b: 3, c: 4, d: 15, y0: 3, x0: -3, yw: 9, xw: -15, texs: ['x+2y=3', '4y-x=15'], Es: [E(1, 2, 3), E(-1, 4, 15)], iso: [0, 0] };
        },
        parts: [
          { id: 'e11a', level: 'EMG', make: function (r, sh) {
            return mc(r, 'How should the substitution have been written, and which sign did the missing bracket change?', [
              { html: t(sh.c + 'y-(' + sh.b + '-' + sh.a + 'y)=' + sh.d) + '; the bracket makes it ' + t('+' + sh.a + 'y') + ', so the student’s ' + t('-' + sh.a + 'y') + ' has the wrong sign.', right: true },
              { html: t(sh.c + 'y-(' + sh.b + '-' + sh.a + 'y)=' + sh.d) + '; the bracket makes it ' + t('+' + sh.b) + ', so the student’s ' + t('-' + sh.b) + ' has the wrong sign.', why: 'The minus in front of the bracket changes both signs: ' + t('-(' + sh.b + '-' + sh.a + 'y)=-' + sh.b + '+' + sh.a + 'y') + '. The ' + t('-' + sh.b) + ' was right.' },
              { html: t(sh.c + 'y+(' + sh.b + '-' + sh.a + 'y)=' + sh.d) + '; no sign changes.', why: 'The equation has ' + t('-x') + ', so the whole expression for ' + t('x') + ' is subtracted.' },
              { html: 'The student’s line is correct; the error is in the last step.', why: 'Compare ' + t('-(' + sh.b + '-' + sh.a + 'y)') + ' with the student’s ' + t('-' + sh.b + '-' + sh.a + 'y') + '.' }],
              'The whole expression ' + t(sh.b + '-' + sh.a + 'y') + ' replaces ' + t('x') + ', so it needs a bracket: ' + t(sh.c + 'y-(' + sh.b + '-' + sh.a + 'y)=' + sh.d) + '. The minus sign distributes over both terms: ' + t('-(' + sh.b + '-' + sh.a + 'y)=-' + sh.b + '+' + sh.a + 'y') + '. The student kept the ' + t('-' + sh.b) + ' but wrote ' + t('-' + sh.a + 'y') + ' instead of ' + t('+' + sh.a + 'y') + '.', [], 'dropped bracket');
          } },
          { id: 'e11b', level: 'EMG', make: function (r, sh) { return solvePart('Solve the system correctly:', sh, null, null, { wrong: [{ is: [sh.xw, sh.yw], code: 'dropped-bracket', hint: 'That’s the student’s answer. Put the expression for ' + t('x') + ' in brackets: ' + t(sh.c + 'y-(' + sh.b + '-' + sh.a + 'y)=' + sh.d) + '.' }], bad: [ptK([sh.xw, sh.yw])] }); } },
          { id: 'e11c', level: 'PRG', make: function (r, sh) {
            return mc(r, 'The student’s point ' + t(ptT([sh.xw, sh.yw])) + ' passes ' + t(sh.texs[0]) + ' but fails ' + t(sh.texs[1]) + '. Why is that exactly what a dropped bracket in the second equation produces?', [
              { html: 'The student built ' + t('x=' + sh.b + '-' + sh.a + 'y') + ' from the first equation, so any ' + t('(' + sh.b + '-' + sh.a + 'y,\\ y)') + ' satisfies it automatically. The error happened in the second equation, so only the second can catch it.', right: true },
              { html: 'It is a coincidence; a different mistake could pass either equation.', why: 'Not a coincidence: the pair was built from the first equation, so the first can never catch an error made later.' },
              { html: 'The first equation is easier, so it is more likely to be satisfied.', why: 'It has nothing to do with difficulty — ' + t('x') + ' was defined from the first equation.' },
              { html: 'Because the second equation is wrong in the question.', why: 'The question is fine; the student’s substitution into it was not.' }],
              'In ' + t(sh.texs[0]) + ': ' + t(sh.xw + '+' + sh.a + '(' + sh.yw + ')=' + sh.b) + ' ✓. In ' + t(sh.texs[1]) + ': ' + t(sh.c + '(' + sh.yw + ')-(' + sh.xw + ')=' + (sh.c * sh.yw - sh.xw)) + ', not ' + t(sh.d) + '.<br>Whatever ' + t('y') + ' the student ended with, ' + t('x=' + sh.b + '-' + sh.a + 'y') + ' makes the first equation true — it can never catch this mistake. That is why the check must be done in <b>both</b> original equations.', [], 'why one equation passes');
          } }] },
      /* ---------- Part H — stretch ---------- */
      { num: '12', section: 'Extra practice H — Stretch', stem: function (sh) { return 'Consider the system ' + t('\\dfrac{x}{' + sh.B + '}-\\dfrac{y}{' + sh.A + '}=' + qT(Q(sh.C, sh.A * sh.B))) + ' and ' + t(pol([[sh.k * sh.A, 'x'], [-sh.k * sh.B, 'y'], [-sh.k * sh.C, '']]) + '=0') + '.'; },
        shared: function (r) {
          for (var g = 0; g < 400; g++) { var A = r.int(2, 5), Bc = r.int(2, 5), C = rnz(r, -9, 9), k = r.int(2, 3); if (gcd(A, Bc) === 1 && !isInt(Q(C, A * Bc)) && gcd(C, A * Bc) === 1) return { A: A, B: Bc, C: C, k: k }; }
          return { A: 2, B: 3, C: 5, k: 2 };
        },
        parts: [
          { id: 'e12a', level: 'EMG', make: function (r, sh) {
            var L = pol([[sh.A, 'x'], [-sh.B, 'y']]) + '=' + sh.C;
            return mc(r, 'Clear the fractions from the first equation and reduce the second to lowest terms. What do you notice?', [
              { html: 'Both become ' + t(L) + ': they are the <b>same equation</b>, one line written two ways.', right: true },
              { html: 'They have the same ' + t('x') + ' and ' + t('y') + ' coefficients but different constants: parallel lines.', why: 'Compare the constants carefully after clearing: multiply the first by ' + t(sh.A * sh.B) + ' and divide the second by ' + t(sh.k) + '.' },
              { html: 'They have different slopes, so they cross once.', why: 'Rewrite both as ' + t('Ax+By=C') + ' with whole numbers, then compare.' },
              { html: 'The second equation can’t be reduced.', why: 'Every coefficient of the second equation has the common factor ' + t(sh.k) + '.' }],
              'First equation × ' + t(sh.A * sh.B) + ': ' + t(L) + '. Second equation ÷ ' + t(sh.k) + ': ' + t(pol([[sh.A, 'x'], [-sh.B, 'y'], [-sh.C, '']]) + '=0') + ', i.e. ' + t(L) + '. They are the same equation.', [], 'same equation');
          } },
          { id: 'e12b', level: 'PRG', make: function (r, sh) {
            var S = { texs: ['\\dfrac{x}{' + sh.B + '}-\\dfrac{y}{' + sh.A + '}=' + qT(Q(sh.C, sh.A * sh.B)), pol([[sh.k * sh.A, 'x'], [-sh.k * sh.B, 'y'], [-sh.k * sh.C, '']]) + '=0'], Es: [E(sh.A, -sh.B, sh.C), E(sh.k * sh.A, -sh.k * sh.B, sh.k * sh.C)], pre: ['Clear the fractions in the first equation (× ' + t(sh.A * sh.B) + '): ' + t(pol([[sh.A, 'x'], [-sh.B, 'y']]) + '=' + sh.C) + '.'], iso: [0, 0] };
            return solvePart('Solve by substitution anyway. Use the <b>no solution</b> or <b>infinitely many</b> key if needed.', S, ['Substitute and simplify. What is left when the variables cancel?']);
          } },
          { id: 'e12c', level: 'EMG', make: function (r, sh) {
            var on = function (P) { return Math.abs(sh.A * P[0] - sh.B * P[1] - sh.C) < 1e-9; }, keys = [];
            for (var x = -12; x <= 12; x++) { var y = (sh.A * x - sh.C) / sh.B; if (Number.isInteger(y)) keys.push([x, y]); }
            keys = keys.sort(function (p, q) { return Math.abs(p[0]) + Math.abs(p[1]) - Math.abs(q[0]) - Math.abs(q[1]); }).slice(0, 3).sort(function (p, q) { return p[0] - q[0]; });
            var chk = function (resp) {
              resp = resp || []; var Ps = [];
              for (var i = 0; i < 3; i++) {
                var rp = LN.readPoint(String(resp[i] || '')); if (rp.empty) return form('empty', 'Fill in all three points.');
                if (rp.bad || rp.kind !== 'pt') return form('pt-unreadable', 'Write each point as an ordered pair, e.g. ' + t('(1,\\ 2)') + '.');
                Ps.push([rp.p[0].v, rp.p[1].v]);
              }
              for (var j = 0; j < 3; j++) if (!on(Ps[j])) return wrong('pts-not-on', 'Point ' + (j + 1) + ', ' + t('(' + dc(Ps[j][0]) + ',\\ ' + dc(Ps[j][1]) + ')') + ', isn’t on the line ' + t(pol([[sh.A, 'x'], [-sh.B, 'y']]) + '=' + sh.C) + '.');
              for (var a = 0; a < 3; a++) for (var b = a + 1; b < 3; b++) if (Ps[a][0] === Ps[b][0] && Ps[a][1] === Ps[b][1]) return form('pts-repeat', 'Give three <b>different</b> points.');
              return ok();
            };
            return { prompt: 'Give three different ordered pairs that satisfy <b>both</b> equations.', input: { type: 'fields', fields: [1, 2, 3].map(function (i) { return { label: 'Point ' + i, mode: 'math', keys: 'pairs', placeholder: '(x, y)' }; }) }, check: chk, key: keys.map(ptK), answer: keys.map(function (P) { return t(ptT(P)); }).join(', ') + ' (for example)',
              solution: 'Both equations are the line ' + t(pol([[sh.A, 'x'], [-sh.B, 'y']]) + '=' + sh.C) + ', so any point on it works. Choose ' + t('x') + ' and find ' + t('y=\\frac{' + sh.A + 'x' + (sh.C < 0 ? '+' : '-') + Math.abs(sh.C) + '}{' + sh.B + '}') + ': for example ' + keys.map(function (P) { return t(ptT(P)); }).join(', ') + '.<br>The complete solution set is every point on that line — infinitely many.',
              hints: ['Both equations are the same line. Choose values of ' + t('x') + ' that make ' + t('y') + ' come out as a whole number.'], text: 'three points on the line', bad: [keys.slice(0, 2).concat([keys[0]]).map(ptK), ['(0,0)', '(1,1)', '(2,2)']] };
          } }] },
      { num: '13', stem: function (sh) { return 'In the system below, ' + t('k') + ' is a constant, not a variable.' + sysD([pol([[1, 'x']]) + '+ky=' + sh.a, pol([[sh.b, 'x'], [-1, 'y']]) + '=' + sh.c]); },
        shared: function (r) {
          for (var g = 0; g < 400; g++) {
            var a = r.int(1, 5), b = r.int(2, 3), c = rnz(r, -3, 3);
            if (a * b - c === 0) continue;
            for (var k0 = 1; k0 <= 6; k0++) { var D = 1 + b * k0; if ((a + c * k0) % D === 0 && (a * b - c) % D === 0) return { a: a, b: b, c: c, k0: k0 }; }
          }
          return { a: 3, b: 2, c: 1, k0: 2 };
        },
        parts: [
          { id: 'e13a', level: 'ADV', make: function (r, sh) {
            var xsT = '\\frac{' + pol([[sh.c, 'k'], [sh.a, '']]) + '}{' + pol([[sh.b, 'k'], [1, '']]) + '}', ysT = '\\frac{' + (sh.a * sh.b - sh.c) + '}{' + pol([[sh.b, 'k'], [1, '']]) + '}';
            var fx = function (k) { return (sh.a + sh.c * k) / (1 + sh.b * k); }, fy = function (k) { return (sh.a * sh.b - sh.c) / (1 + sh.b * k); };
            var test = [1, 2, 3, 5, -3, 7].filter(function (k) { return 1 + sh.b * k !== 0; });
            var chk1 = function (f, nm) { return function (resp) {
              var s = String(resp || '').trim(); if (!s) return form('empty', 'Fill in both boxes.');
              var a = ex.parse(s); if (!a.ok) return form('unreadable', 'I can’t read the expression for ' + t(nm) + '. Use the fraction key and brackets.');
              var good = test.every(function (k) { var v = ex.value(a.ast, { k: k }); return isFinite(v) && Math.abs(v - f(k)) < 1e-9; });
              if (good) return ok();
              var cv = test.every(function (k) { return isFinite(ex.value(a.ast, { k: k })); }); if (!cv) return wrong('k-expr', 'Your expression for ' + t(nm) + ' uses a letter other than ' + t('k') + ', or isn’t defined.');
              return wrong('k-expr', 'Your expression for ' + t(nm) + ' isn’t right for every ' + t('k') + ' — test it with ' + t('k=1') + ' in both equations.');
            }; };
            var chk = function (resp) { resp = resp || []; var r1 = chk1(fx, 'x')(resp[0]); if (r1.v !== 'correct') return { v: r1.v, code: r1.code, hint: '<b>' + t('x') + ':</b> ' + r1.hint }; var r2 = chk1(fy, 'y')(resp[1]); if (r2.v !== 'correct') return { v: r2.v, code: r2.code, hint: '<b>' + t('y') + ':</b> ' + r2.hint }; return ok(); };
            return { prompt: 'Rearrange the second equation for ' + t('y') + ', then solve by substitution to express ' + t('x') + ' and ' + t('y') + ' in terms of ' + t('k') + '.', input: { type: 'fields', fields: [{ label: t('x='), mode: 'math', keys: 'poly', vars: ['k'], placeholder: ' ' }, { label: t('y='), mode: 'math', keys: 'poly', vars: ['k'], placeholder: ' ' }] }, check: chk,
              key: [xsT, ysT], answer: t('x=' + xsT) + ', ' + t('y=' + ysT),
              solution: 'Rearrange ' + t(pol([[sh.b, 'x'], [-1, 'y']]) + '=' + sh.c) + ' for ' + t('y') + ' (coefficient ' + t('-1') + ', and no ' + t('k') + '): ' + t('y=' + pol([[sh.b, 'x'], [-sh.c, '']]))
                + '.<br>Substitute into ' + t('x+ky=' + sh.a) + ': ' + t('x+k\\left(' + pol([[sh.b, 'x'], [-sh.c, '']]) + '\\right)=' + sh.a) + ', so ' + t('x+' + sh.b + 'kx' + (sh.c < 0 ? '+' : '-') + cf(Math.abs(sh.c)) + 'k=' + sh.a) + '.<br>' + t('x(1+' + sh.b + 'k)=' + pol([[sh.a, ''], [sh.c, 'k']])) + ', so ' + t('x=' + xsT) + '.<br>'
                + t('y=' + sh.b + '\\cdot' + xsT + (sh.c < 0 ? '+' : '-') + Math.abs(sh.c) + '=' + ysT) + '.',
              hints: ['Isolate ' + t('y') + ' in ' + t(pol([[sh.b, 'x'], [-1, 'y']]) + '=' + sh.c) + ' — it has no ' + t('k') + ' in it.', 'After substituting, factor ' + t('x') + ' out of the ' + t('x') + '-terms: ' + t('x(1+' + sh.b + 'k)') + '.'], text: 'x, y in terms of k',
              bad: [['\\frac{' + pol([[sh.c, 'k'], [sh.a, '']]) + '}{' + pol([[sh.b, 'k'], [-1, '']]) + '}', ysT], [xsT, '\\frac{' + (sh.a * sh.b + sh.c) + '}{' + pol([[sh.b, 'k'], [1, '']]) + '}']] };
          } },
          { id: 'e13c', sub: 'c i', level: 'ADV', make: function (r, sh) {
            var kc = Q(-1, sh.b);
            return B.fraction('Every answer in (a) has the denominator ' + t(pol([[sh.b, 'k'], [1, '']])) + '. For what value of ' + t('k') + ' does that denominator become ' + t('0') + '?', kc, { before: t('k=') },
              t(pol([[sh.b, 'k'], [1, '']]) + '=0') + ', so ' + t(sh.b + 'k=-1') + ' and ' + t('k=' + qT(kc)) + '.', ['Set the denominator equal to ' + t('0') + ' and solve for ' + t('k') + '.'], 'k making the denominator 0');
          } },
          { id: 'e13cc', sub: 'c ii', level: 'PRG', make: function (r, sh) {
            var kc = Q(-1, sh.b), S = { texs: ['x' + (kc[0] < 0 ? '-' : '+') + '\\frac{1}{' + sh.b + '}y=' + sh.a, pol([[sh.b, 'x'], [-1, 'y']]) + '=' + sh.c], Es: [E(1, kc, sh.a), E(sh.b, -1, sh.c)], iso: [1, 1] };
            var p = solvePart('Substitute ' + t('k=' + qT(kc)) + ' into the original system and solve it. Use the <b>no solution</b> or <b>infinitely many</b> key if needed.', S, ['Substitute ' + t('y=' + pol([[sh.b, 'x'], [-sh.c, '']])) + ' and simplify. What is left?']);
            p.solution += '<br>The formulas from (a) break down at exactly the ' + t('k') + ' for which the lines stop meeting.';
            return p;
          } },
          { id: 'e13d', sub: 'd', level: 'EMG', make: function (r, sh) {
            var k = sh.k0, D = 1 + sh.b * k, sol = [Q(sh.a + sh.c * k, D), Q(sh.a * sh.b - sh.c, D)];
            var S = { texs: [pol([[1, 'x'], [k, 'y']]) + '=' + sh.a, pol([[sh.b, 'x'], [-1, 'y']]) + '=' + sh.c], Es: [E(1, k, sh.a), E(sh.b, -1, sh.c)], iso: [1, 1] };
            var res = subSol(S.Es, { iso: [1, 1] });
            res.html = 'Using the formulas with ' + t('k=' + k) + ': ' + t('x=\\frac{' + sh.a + (sh.c < 0 ? '-' : '+') + Math.abs(sh.c) + '(' + k + ')}{1+' + sh.b + '(' + k + ')}=' + qT(sol[0])) + ', ' + t('y=\\frac{' + (sh.a * sh.b - sh.c) + '}{' + D + '}=' + qT(sol[1])) + '.<br>Or solve directly:<br>' + res.html;
            return ptPart('Use your formulas to write down the solution when ' + t('k=' + k) + '. (The system is then ' + t(S.texs[0]) + ' and ' + t(S.texs[1]) + '.)', S, res, ['Substitute ' + t('k=' + k) + ' into your expressions for ' + t('x') + ' and ' + t('y') + ' — or solve the system with ' + t('k=' + k) + ' directly.'], 'solution at k=' + k);
          } }] },
      /* ---------- Part I — MC and NR ---------- */
      { num: '14', section: 'Extra practice I — Multiple Choice and Numerical Response', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: 'e14', level: 'LIM', make: function (r) {
          var a1, b1, c1, a2, c2;
          do { a1 = r.int(2, 5); b1 = r.int(3, 8); c1 = r.int(2, 15); a2 = r.int(2, 7); c2 = r.int(2, 12); } while (a1 === a2 || a1 === b1 || a2 === b1);
          var tx = function (n, d) { return '\\dfrac{' + n + '}{' + d + '}'; };
          return mc(r, 'A student is about to solve the system ' + t(pol([[a1, 'x'], [-b1, 'y']]) + '=' + c1) + ' and ' + t(pol([[a2, 'x'], [1, 'y']]) + '=' + c2) + ' by substitution. The <b>only</b> one of the following rearrangements that introduces no fraction is', [
            { html: t('y=' + c2 + '-' + a2 + 'x'), right: true },
            { html: t('x=' + tx(c1 + '+' + b1 + 'y', a1)), why: 'This divides by ' + t(a1) + ', the coefficient of ' + t('x') + ' — a fraction.' },
            { html: t('y=' + tx(a1 + 'x-' + c1, b1)), why: 'This divides by ' + t(b1) + ' — a fraction.' },
            { html: t('x=' + tx(c2 + '-y', a2)), why: 'This divides by ' + t(a2) + ' — a fraction.' }],
            'In ' + t(pol([[a2, 'x'], [1, 'y']]) + '=' + c2) + ' the coefficient of ' + t('y') + ' is ' + t('1') + ', so isolating it needs no division: ' + t('y=' + c2 + '-' + a2 + 'x') + '. Every other choice divides by a coefficient that isn’t ' + t('\\pm1') + '.', ['Which variable has a coefficient of ' + t('1') + ' or ' + t('-1') + '?'], 'MC no-fraction rearrangement');
        } }] },
      { num: '15', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: 'e15', level: 'EMG', make: function (r) {
          var M = r.pick([[3, 2], [5, 2], [4, 3], [5, 3], [3, 4]]), u = r.int(1, 3), a = M[1] * r.int(1, 2) * 2, b = M[1] * u * 3, d = M[1] * r.int(2, 8);
          var A2 = a * M[0] / M[1], B2 = b * M[0] / M[1], c = d * M[0] / M[1], wrongs = [d, 2 * d, d + (A2 - a)].filter(function (v, i, arr) { return v !== c && arr.indexOf(v) === i; });
          while (wrongs.length < 3) { var cand = c + (wrongs.length + 1) * (r.chance(0.5) ? -2 : 3); if (cand !== c && wrongs.indexOf(cand) < 0) wrongs.push(cand); }
          var vals = [c].concat(wrongs.slice(0, 3)).sort(function (p, q) { return p - q; });
          var why = function (v) { return v === d ? 'With the same constant, the second equation is <b>not</b> a multiple of the first (its ' + t('x') + '-coefficient was scaled by ' + t(qT(Q(M[0], M[1]))) + '): parallel lines, no solution.' : v === 2 * d ? 'The coefficients were multiplied by ' + t(qT(Q(M[0], M[1]))) + ', not by ' + t('2') + ' — the constant must be scaled by the same number.' : v === d + (A2 - a) ? 'The equations must be <b>multiples</b> — multiply the constant, don’t add.' : 'Scale the constant by the same number that turns ' + t(a + 'x') + ' into ' + t(A2 + 'x') + '.'; };
          return mc(r, 'The system ' + t(pol([[a, 'x'], [-b, 'y']]) + '=' + d) + ' and ' + t(pol([[A2, 'x'], [-B2, 'y']]) + '=c') + ' has infinitely many solutions when ' + t('c') + ' equals', vals.map(function (v) { return { html: t(v), right: v === c, why: v === c ? null : why(v), code: 'v' + v }; }),
            'Infinitely many solutions means the two equations describe the same line, so the second is a multiple of the first. ' + t(A2 + '=' + qT(Q(M[0], M[1])) + '\\times ' + a) + ' and ' + t(B2 + '=' + qT(Q(M[0], M[1])) + '\\times ' + b) + ', so ' + t('c=' + qT(Q(M[0], M[1])) + '\\times ' + d + '=' + c) + '.', ['What number turns the first equation’s coefficients into the second’s? Multiply the constant by it too.'], 'MC c for infinitely many', true);
        } }] },
      { num: '16', stem: '<i>(Numerical Response)</i>', parts: [
        { id: 'e16', level: 'EMG', make: function (r) {
          var a, b, c, d, x0, y0, p, q, v;
          for (var g = 0; g < 400; g++) { a = r.int(3, 8); b = r.int(2, 5); d = r.int(2, 4); x0 = r.int(1, 6); y0 = r.int(1, 7); p = r.int(5, 13); q = r.int(2, 6); v = p * x0 + q * y0; if (v >= 10 && v <= 999 && p * y0 + q * x0 !== v && a + b * d !== 0) break; }
          c = a * x0 + b * y0;
          var Es = [E(a, b, c), E(1, -d, x0 - d * y0)], res = subSol(Es, { iso: [1, 0] });
          return B.nr('The system ' + t(eqT(Es[0])) + ' and ' + t(eqT(Es[1])) + ' is solved by substitution. The value of ' + t(p + 'x+' + q + 'y') + ' is ________.', v, function (w) {
            if (w === p * y0 + q * x0) return { code: 'pt-swap', hint: 'It looks like ' + t('x') + ' and ' + t('y') + ' were swapped. Check which value is which.' };
            if (w === x0 + y0) return { code: 'nr-one', hint: 'That’s ' + t('x+y') + '. Now work out ' + t(p + 'x+' + q + 'y') + '.' };
            return null;
          }, res.html + '<br>' + t(p + 'x+' + q + 'y=' + p + '(' + x0 + ')+' + q + '(' + y0 + ')=' + v) + (v < 100 ? ' (recorded as ' + String(v).padStart(3, '0') + ')' : '') + '.', ['Isolate ' + t('x') + ' (coefficient ' + t('1') + '), solve the system, then evaluate ' + t(p + 'x+' + q + 'y') + '.'], 'NR combination');
        } }] }
    ]
  });

  /* ======================================================================================================== */
  /* helpers for the extra practice (hoisted function declarations) */
  function xyzPart(prompt, sol, eqOK, solution, hints, text) {
    var chk = function (resp) {
      resp = resp || []; var v = [];
      for (var i = 0; i < 3; i++) { var p = HW.parse.number(String(resp[i] == null ? '' : resp[i])); if (!p.ok) return form('empty', 'Enter a number in each box.'); v.push(p.value); }
      if (v[0] === sol[0] && v[1] === sol[1] && v[2] === sol[2]) return ok();
      var okE = eqOK.map(function (f) { return f(v); });
      if (v[0] === sol[0] && v[1] === sol[1]) return wrong('xy-right-z', t('x') + ' and ' + t('y') + ' are right. Substitute ' + t('x') + ' into the equation with ' + t('z') + ' to find ' + t('z') + '.');
      var bad = okE.indexOf(false);
      return wrong('z-wrong', 'Your values don’t satisfy equation ' + (bad + 1) + '. Substitute them into all three equations to find the slip.');
    };
    return { prompt: prompt, input: { type: 'fields', fields: [{ label: t('x=') }, { label: t('y=') }, { label: t('z=') }] }, check: chk, key: sol.map(String), answer: t('x=' + sol[0] + ',\\ y=' + sol[1] + ',\\ z=' + sol[2]), solution: solution, hints: hints, text: text,
      bad: [[sol[0], sol[1], sol[2] + 1].map(String)].concat(sol[0] !== sol[1] ? [[sol[1], sol[0], sol[2]].map(String)] : []) };
  }
  /* EP 1: exactly one coefficient ±1 (booklet: (a) y in ① coef 1, (b) x in ① coef 1, (c) y in ① coef −1, (d) x in ② coef 1) */
  function epA(r, which) {
    var spec = { a: { iso: [0, 1], book: [5, 1, 3, -4, 2, 1] }, b: { iso: [0, 0], book: [1, -3, 4, 5, 8, 2] }, c: { iso: [0, 1], book: [6, -1, 4, 3, 2, -1] }, d: { iso: [1, 0], book: [9, 2, 1, 4, -1, 7] } }[which];
    var make = function (c) { var Es = [E(c[0], c[1], c[0] * c[4] + c[1] * c[5]), E(c[2], c[3], c[2] * c[4] + c[3] * c[5])]; return { texs: Es.map(function (e) { return eqT(e); }), Es: Es, iso: spec.iso, names: ['the first equation', 'the second equation'] }; };
    for (var g = 0; g < 400; g++) {
      var x0 = rnz(r, -3, 8), y0 = rnz(r, -3, 7), c;
      if (which === 'a') c = [r.int(3, 6), 1, r.int(2, 5), -r.int(2, 5)];
      else if (which === 'b') c = [1, -r.int(2, 4), r.int(2, 5), r.int(2, 6)];
      else if (which === 'c') c = [r.int(3, 7), -1, r.int(2, 5), r.int(2, 4)];
      else c = [r.int(5, 9), r.int(2, 3), 1, r.int(2, 5)];
      if (c[0] * c[3] - c[1] * c[2] === 0) continue;
      var S = make(c.concat([x0, y0])); if (S.Es.some(function (e) { return qv(e.c) === 0; })) continue;
      return S;
    }
    return make(spec.book);
  }
  function isoMC(r, S) {
    var V = ['x', 'y'], opts = [];
    for (var i = 0; i < 2; i++) for (var v = 0; v < 2; v++) {
      var c = co(S.Es[i], v), right = S.iso[0] === i && S.iso[1] === v, ab = Math.abs(qv(c));
      opts.push({ html: 'Isolate ' + t(V[v]) + ' in ' + t(S.texs[i]), right: right, why: right ? null : 'The coefficient of ' + t(V[v]) + ' there is ' + t(qT(c)) + ', so isolating ' + t(V[v]) + ' means dividing by ' + t(ab) + ' — a fraction. Look for a coefficient of ' + t('1') + ' or ' + t('-1') + '.', code: 'iso' + i + v });
    }
    var e = S.Es[S.iso[0]], cv = co(e, S.iso[1]), res = subSol(S.Es, { iso: S.iso });
    return mc(r, 'Which variable, in which equation, should you isolate first? (Choose the one that costs nothing — no fraction.)' + sysD(S.texs), opts,
      'In ' + t(S.texs[S.iso[0]]) + ' the coefficient of ' + t(V[S.iso[1]]) + ' is ' + t(qT(cv)) + ', so isolating it needs no division (' + (qv(cv) === -1 ? 'just change every sign' : 'nothing to divide') + '). Every other coefficient would leave a fraction.<br>' + res.html.split('<br>')[0], ['Look at all four coefficients. Which one is ' + t('1') + ' or ' + t('-1') + '?'], 'which variable to isolate');
  }
  /* EP 2: no ±1 coefficients; the isolated variable's coefficient k divides the other equation's coefficient of it */
  function epFrac(r, wantInt, isoVar) {
    var bookI = { texs: ['3x+2y=8', '5x-4y=6'], Es: [E(3, 2, 8), E(5, -4, 6)], iso: [0, 1] };
    var bookF = isoVar === 'y' ? { texs: ['6x-4y=9', '4x+2y=5'], Es: [E(6, -4, 9), E(4, 2, 5)], iso: [1, 1] } : { texs: ['4x+6y=7', '2x-5y=9'], Es: [E(4, 6, 7), E(2, -5, 9)], iso: [1, 0] };
    for (var g = 0; g < 600; g++) {
      var k = r.pick([2, 2, 3]), kv = k * r.pick([-2, 2]), o1 = r.int(2, 7) * sgn(r), o2 = r.int(2, 7) * sgn(r), iI = wantInt ? 0 : 1;
      if (Math.abs(o1) % k === 0 || Math.abs(o2) === 1 || (isoVar === 'y' ? o1 < 0 || o2 < 0 : kv < 0)) continue;
      // isolate equation: k·v + o1·w ; other: kv·v + o2·w
      var isoE = isoVar === 'y' ? [o1, k] : [k, o1], othE = isoVar === 'y' ? [o2, kv] : [kv, o2];
      var Es, sol;
      if (wantInt) { var x0 = rnz(r, -3, 4), y0 = rnz(r, -3, 4); Es = [E(isoE[0], isoE[1], isoE[0] * x0 + isoE[1] * y0), E(othE[0], othE[1], othE[0] * x0 + othE[1] * y0)]; }
      else { var c1 = rnz(r, -9, 9), c2 = rnz(r, -9, 9); Es = [E(othE[0], othE[1], c2), E(isoE[0], isoE[1], c1)]; }
      sol = solve2(Es[0], Es[1]); if (!sol || Es.some(function (e) { return qv(e.c) === 0 || gcd(gcd(e.a[0], e.b[0]), e.c[0]) > 1; })) continue;
      if (Math.abs(isoE[0]) === 1 || Math.abs(isoE[1]) === 1 || Math.abs(othE[0]) === 1 || Math.abs(othE[1]) === 1) continue;
      if (!wantInt && ((isInt(sol[0]) && isInt(sol[1])) || Q(sol[0])[1] > 45 || Q(sol[1])[1] > 45 || Math.abs(qv(sol[0])) > 6 || Math.abs(qv(sol[1])) > 6)) continue;
      var iso = wantInt ? [0, isoVar === 'y' ? 1 : 0] : [1, isoVar === 'y' ? 1 : 0];
      return { texs: Es.map(function (e) { return eqT(e); }), Es: Es, iso: iso };
    }
    return wantInt ? bookI : bookF;
  }
  /* EP 3: general form */
  function epGen(r, which) {
    var book = { a: [3, -1, -7, 5, 2, -19], b: [4, 3, 6, 1, -2, -4], c: [2, 5, 4, 3, -4, -17], d: [6, -5, -3, 2, 3, 13] }[which];
    var make = function (c) { var Es = [E(c[0], c[1], -c[2]), E(c[3], c[4], -c[5])]; return { texs: [pol([[c[0], 'x'], [c[1], 'y'], [c[2], '']]) + '=0', pol([[c[3], 'x'], [c[4], 'y'], [c[5], '']]) + '=0'], Es: Es, pre: ['Move the constants to the right side: ' + t(eqT(Es[0])) + ' and ' + t(eqT(Es[1])) + '.'] }; };
    for (var g = 0; g < 400; g++) {
      var x0 = r.int(-3, 4), y0 = rnz(r, -3, 3), A1, B1, A2, B2;
      if (which === 'a') { A1 = r.int(2, 5); B1 = -1; A2 = r.int(2, 6); B2 = r.int(2, 4); }
      else if (which === 'b') { A1 = r.int(2, 5); B1 = r.int(2, 4); A2 = 1; B2 = -r.int(2, 3); }
      else if (which === 'c') { A1 = 2; B1 = r.pick([3, 5, 7]); A2 = r.int(3, 5) * (r.chance(0.7) ? 1 : -1); B2 = -r.int(2, 5); if (Math.abs(A2) % 2 === 0) continue; }
      else { A1 = 2 * r.int(2, 4); B1 = -r.pick([3, 5, 7]); A2 = 2; B2 = r.pick([3, 5]); }
      if (A1 * B2 - A2 * B1 === 0) continue;
      var C1 = -(A1 * x0 + B1 * y0), C2 = -(A2 * x0 + B2 * y0); if (!C1 || !C2) continue;
      var S = make([A1, B1, C1, A2, B2, C2]); return S;
    }
    return make(book);
  }
  /* EP 4 (a): fractions; (b): decimals; (c): decimals and fractions, fractional answer */
  function frT(n, d, v, first) { var s = n < 0 ? '-' : first ? '' : '+'; n = Math.abs(n); return s + '\\dfrac{' + (n === 1 ? '' : n) + v + '}{' + d + '}'; }
  function ep4a(r) {
    var book = function () { return build4a(2, -4, 2, 3, 2, 4, 6, 4); };
    function build4a(p1, q1, c1, p2, q2, c2, x0, y0) {   // x/p1 + y/q1 = c1 (q1 signed), x/p2 + y/q2 = c2
      var L1 = lcm(p1, Math.abs(q1)), L2 = lcm(p2, Math.abs(q2)), E1 = E(L1 / p1, L1 / q1, L1 * c1), E2 = E(L2 / p2, L2 / q2, L2 * c2);
      var S = { texs: [frT(1, p1, 'x', true) + frT(q1 < 0 ? -1 : 1, Math.abs(q1), 'y') + '=' + c1, frT(1, p2, 'x', true) + frT(q2 < 0 ? -1 : 1, Math.abs(q2), 'y') + '=' + c2], Es: [E1, E2], checkEs: [E(Q(1, p1), Q(1, q1), c1), E(Q(1, p2), Q(1, q2), c2)],
        pre: ['Multiply the first equation by ' + t(L1) + ': ' + t(eqT(E1)) + '. Multiply the second by ' + t(L2) + ': ' + t(eqT(E2)) + '.'] };
      return S;
    }
    for (var g = 0; g < 400; g++) {
      var p1 = r.pick([2, 3, 4]), q1 = r.pick([2, 3, 4, 5, 6]) * sgn(r), p2 = r.pick([2, 3, 4, 6]), q2 = r.pick([2, 3, 4]) * (r.chance(0.7) ? 1 : -1);
      if (p1 === Math.abs(q1) || p2 === Math.abs(q2)) continue;
      var lx = lcm(p1, p2), ly = lcm(Math.abs(q1), Math.abs(q2)); if (lx > 12 || ly > 12) continue;
      var x0 = lx * r.pick([1, 1, 2, -1]), y0 = ly * r.pick([1, -1, 2]); if (Math.abs(x0) > 12 || Math.abs(y0) > 12) continue;
      var c1 = x0 / p1 + y0 / q1, c2 = x0 / p2 + y0 / q2; if (!c1 || !c2) continue;
      var S = build4a(p1, q1, c1, p2, q2, c2, x0, y0); if (!solve2(S.Es[0], S.Es[1])) continue;
      return S;
    }
    return book();
  }
  function ep4b(r) {
    function build(a, b, c, d, x0, y0) { var E1 = E(a, b, a * x0 + b * y0), E2 = E(c, d, c * x0 + d * y0); return { texs: [dTerm(a, 'x', true) + dTerm(b, 'y') + '=' + dT(a * x0 + b * y0), dTerm(c, 'x', true) + dTerm(d, 'y') + '=' + dT(c * x0 + d * y0)], Es: [E1, E2], pre: ['Multiply both equations by ' + t('10') + ': ' + t(eqT(E1)) + ' and ' + t(eqT(E2)) + '.'] }; }
    for (var g = 0; g < 400; g++) {
      var a = r.int(2, 8), b = r.int(1, 9) * sgn(r), c = r.int(1, 8), d = -r.int(2, 9), x0 = r.int(1, 7), y0 = rnz(r, -4, 4);
      if (a * d - b * c === 0 || Math.abs(b) === 10 || !(a * x0 + b * y0) || !(c * x0 + d * y0) || (a * x0 + b * y0) % 10 === 0 && (c * x0 + d * y0) % 10 === 0) continue;
      return build(a, b, c, d, x0, y0);
    }
    return build(4, 3, 2, -5, 5, -2);
  }
  function ep4c(r) {
    function build(a, b, c1, n, c2) {   // (a x − b y = c1)/4 written in decimals; (x + n y = c2)/3 written in fractions
      var E1 = E(a, -b, c1), E2 = E(1, n, c2), s = solve2(E1, E2); if (!s) return null;
      var S = { texs: [dTerm(25 * a, 'x', true, 100) + dTerm(-25 * b, 'y', false, 100) + '=' + dT(25 * c1, 100), frT(1, 3, 'x', true) + frT(n, 3, 'y') + '=' + qT(Q(c2, 3))], Es: [E1, E2], iso: [1, 0],
        checkEs: [E(Q(a, 4), Q(-b, 4), Q(c1, 4)), E(Q(1, 3), Q(n, 3), Q(c2, 3))], pre: ['Multiply the first equation by ' + t('4') + ': ' + t(eqT(E1)) + '. Multiply the second by ' + t('3') + ': ' + t(eqT(E2)) + '.'] };
      return { S: S, s: s };
    }
    for (var g = 0; g < 400; g++) {
      var a = r.pick([1, 2, 3]), b = r.pick([1, 3]), n = r.pick([2, 4, 5]), c1 = rnz(r, -9, 9), c2 = 3 * rnz(r, -3, 3), B0 = build(a, b, c1, n, c2);
      if (!B0 || a === 4 || (isInt(B0.s[0]) && isInt(B0.s[1])) || Q(B0.s[0])[1] > 15 || Math.abs(qv(B0.s[0])) > 8) continue;
      return B0.S;
    }
    return build(2, 1, 6, 2, 6).S;
  }
  /* EP 5: collapsing systems (type randomised; the booklet's type is the more likely one) */
  function ep5(r, which) {
    var inf = { a: r.chance(0.7), b: !r.chance(0.7), c: r.chance(0.7), d: !r.chance(0.7) }[which], k = r.pick([2, 3]);
    if (which === 'a') { var m = r.pick([2, 3, 4, -2]), b = rnz(r, -6, 6), off = inf ? 0 : rnz(r, -4, 4); if (m < 0) k = -k; return { texs: ['y=' + pol([[m, 'x'], [b, '']]), pol([[k * m, 'x'], [-k, 'y']]) + '=' + (k * -b + (inf ? 0 : off))], Es: [E(-m, 1, b), E(k * m, -k, k * -b + (inf ? 0 : off))], iso: [0, 1], inf: inf }; }
    if (which === 'b') { var a1 = r.int(2, 4), b1 = r.pick([5, 7]), c1 = rnz(r, -6, 6), cc = inf ? 2 * c1 : 2 * c1 + rnz(r, -7, 7); return { texs: [pol([[a1, 'x'], [-b1, 'y']]) + '=' + c1, pol([[2 * a1, 'x'], [-2 * b1, 'y']]) + '=' + cc], Es: [E(a1, -b1, c1), E(2 * a1, -2 * b1, cc)], inf: inf }; }
    if (which === 'c') { var a3 = r.int(2, 5), c3 = rnz(r, -9, 9), cc3 = inf ? k * c3 : k * c3 + rnz(r, -4, 4); return { texs: [pol([[1, 'x'], [a3, 'y']]) + '=' + c3, pol([[k, 'x'], [k * a3, 'y']]) + '=' + cc3], Es: [E(1, a3, c3), E(k, k * a3, cc3)], iso: [0, 0], inf: inf }; }
    var A = r.pick([3, 5]), Bc = 2, C = rnz(r, -7, 7), D = inf ? 2 * C : rnz(r, -9, 9); if (!inf && D === 2 * C) D = 2 * C + 1;
    return { texs: [pol([[A, 'x'], [Bc, 'y'], [C, '']]) + '=0', pol([[2 * A, 'x'], [2 * Bc, 'y'], [D, '']]) + '=0'], Es: [E(A, Bc, -C), E(2 * A, 2 * Bc, -D)], iso: [0, 1], inf: inf };
  }
  function linesMC(r, S) {
    var inf = S.inf, opts = [
      { html: 'They are the <b>same line</b> (equal slopes and equal intercepts).', right: inf, code: 'same' },
      { html: 'They are <b>parallel and distinct</b> (equal slopes, different intercepts).', right: !inf, code: 'par' },
      { html: 'They cross at exactly one point.', right: false, code: 'one' },
      { html: 'They are perpendicular.', right: false, code: 'perp' }];
    opts[0].why = 'A same-line system gives an always-true statement. Is yours always true?'; opts[1].why = 'Parallel lines give a never-true statement. Is yours never true?';
    opts[2].why = 'Lines that cross once give a value of the variable — here both variables cancelled.'; opts[3].why = 'When the variables cancel, the slopes are <b>equal</b>, not negative reciprocals.';
    if (inf) opts[0].why = null; else opts[1].why = null;
    var res = subSol(S.Es, { iso: S.iso });
    return mc(r, 'What does the result of substitution say about the two lines?' + sysD(S.texs), opts, res.html + '<br>' + (inf ? 'In slope–intercept form both are ' + t(siT(S.Es[0])) + ': the same line.' : 'In slope–intercept form: ' + t(siT(S.Es[0])) + ' and ' + t(siT(S.Es[1])) + ' — same slope, different intercepts: parallel and distinct.'), ['Substitute: is the statement left over always true or never true?'], 'what collapse means');
  }
  /* EP 6: both coordinates strictly between 0 and 1 */
  function ep6(r) {
    for (var g = 0; g < 800; g++) {
      var a1 = r.int(2, 7), b1 = r.int(2, 5) * sgn(r), a2 = r.int(2, 7), b2 = r.int(2, 5) * -Math.sign(b1), c1 = r.int(1, 6), c2 = r.int(1, 6);
      var Es = [E(a1, b1, c1), E(a2, b2, c2)], s = solve2(Es[0], Es[1]);
      if (!s || isInt(s[0]) || isInt(s[1])) continue;
      var x = qv(s[0]), y = qv(s[1]); if (x <= 0.05 || x >= 0.95 || y <= 0.05 || y >= 0.95 || Q(s[0])[1] > 45 || Q(s[1])[1] > 45) continue;
      return { texs: Es.map(function (e) { return eqT(e); }), Es: Es };
    }
    return { texs: ['3x+2y=4', '5x-3y=1'], Es: [E(3, 2, 4), E(5, -3, 1)] };
  }
})(window);
