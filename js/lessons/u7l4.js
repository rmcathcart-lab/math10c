/* Math 10C · Unit 7 · Lesson 4 — Using Slope–Point Form to Determine the Equation of a Line (RF6 / RF7, some RF4 / RF5)
 * Assignment questions 1–24 (u7_L04.tex) and the Lesson 4 Extra Practice (u7_EP04.tex).
 * Every part is a generator: it keeps the idea and difficulty of the booklet question (the booklet's numbers are one
 * of the possible versions) and changes the numbers. Equations are typed with the eq keypad and graded by K.line
 * (js/lines.js): any correct equation of the line is accepted unless the booklet asks for a form, and a right line in
 * the wrong form is a nudge that doesn't use a try. Levels: LIM BEG EMG PRG ADV MAS. */
(function (root) {
  'use strict';
  var HW = root.HW, K = HW.kit, Ln = HW.lines, ex = HW.ex, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form;

  /* ---------- numbers and LaTeX ---------- */
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var c = a % b; a = b; b = c; } return a; }
  function Fr(p, q) { if (q < 0) { p = -p; q = -q; } var g = gcd(p, q) || 1; return [p / g, q / g]; }
  function fv(m) { return Array.isArray(m) ? m[0] / m[1] : m; }
  function z(v) { return Math.abs(v) < 1e-12 ? 0 : v; }
  function nT(x) { var f = Ln.toFr(z(x)); return Ln.frT(f[0], f[1]); }
  function mT(m) { return nT(fv(m)); }
  function ptT(p) { return '(' + nT(p[0]) + ',\\ ' + nT(p[1]) + ')'; }
  function paren(v) { return v < 0 ? '(' + nT(v) + ')' : nT(v); }
  function um(v) { return v < 0 ? '−' + Math.abs(v) : String(v); }            // plain-text label for SVG
  function ptL(p) { return '(' + um(p[0]) + ', ' + um(p[1]) + ')'; }
  function coefT(c, v, first) {
    c = z(c); if (c === 0) return '';
    var f = Ln.toFr(c), ab = Math.abs(f[0]), s = f[0] < 0 ? '-' : (first ? '' : '+');
    return s + (f[1] === 1 ? (ab === 1 && v ? '' : String(ab)) : '\\frac{' + ab + '}{' + f[1] + '}') + v;
  }
  function lin(terms) { var s = ''; terms.forEach(function (tm) { s += coefT(tm[0], tm[1], !s); }); return s || '0'; }
  function near(a, b) { return Math.abs(a - b) < 1e-9; }
  function samePt(a, b) { return near(a[0], b[0]) && near(a[1], b[1]); }
  function coprime(a, b) { return gcd(a, b) === 1; }
  function properFr(r, qs, sign, minP) { // p/q with p < q, coprime
    var q = r.pick(qs), ps = []; for (var p = minP || 1; p < q; p++) if (coprime(p, q)) ps.push(p);
    return [sign * r.pick(ps), q];
  }
  function improperFr(r, qs, sign, maxP) { var q = r.pick(qs), ps = []; for (var p = q + 1; p <= (maxP || 9); p++) if (coprime(p, q)) ps.push(p); return [sign * r.pick(ps), q]; }

  /* ---------- lines ---------- */
  function psT(m, p, vars) { var s = Ln.tex({ m: m, point: p }, 'point-slope', p, vars); return fv(m) === 1 ? s.replace(/=\((.*)\)$/, '=$1') : s; }
  function siT(m, p, vars) { return Ln.tex({ m: m, point: p }, 'slope-intercept', null, vars); }
  function genT(T) { return Ln.tex(T, 'general'); }
  function bOf(m, p) { return z(p[1] - fv(m) * p[0]); }
  function genABC(T) {
    var L = Ln.of(T), den = 1; L.forEach(function (v) { var q = Ln.toFr(v)[1]; den = den * q / gcd(den, q); });
    var a = L.map(function (v) { return Math.round(v * den); }), g = gcd(gcd(a[0], a[1]), a[2]) || 1; a = a.map(function (v) { return v / g; });
    if (a[0] < 0 || (a[0] === 0 && a[1] < 0)) a = a.map(function (v) { return -v; });
    return a.map(z);
  }
  function G3(A, B, C) { return { A: A, B: B, C: C }; }
  function gT(G) { return genT(G3(G[0], G[1], G[2])); }
  function slopeOfG(G) { return Fr(-G[0], G[1]); }
  function chkT(G, p) {
    var s = '';
    [[G[0], p[0]], [G[1], p[1]]].forEach(function (cv) { if (!cv[0]) return; s += (s && cv[0] > 0 ? '+' : '') + (cv[0] === 1 ? '' : cv[0] === -1 ? '-' : cv[0]) + '(' + nT(cv[1]) + ')'; });
    if (G[2]) s += (G[2] > 0 ? '+' : '') + G[2];
    return t(s + '=0') + ' ✓';
  }
  function rawT(m, p, vars) {
    var X = vars ? vars[0] : 'x', Y = vars ? vars[1] : 'y', mv = fv(m), mm = mv === 1 ? '1' : mv === -1 ? '-1' : mT(m);
    return Y + '-' + paren(p[1]) + '=' + mm + '(' + X + '-' + paren(p[0]) + ')';
  }
  function expandT(m, p) { var mv = fv(m); return lin([[1, 'y'], [-p[1], '']]) + '=' + lin([[mv, 'x'], [-mv * p[0], '']]); }
  function siSteps(m, p) {
    var mv = fv(m), b = bOf(m, p), s = t(psT(m, p));
    if (p[0] !== 0) s += '<br>Expand: ' + t(expandT(m, p));
    if (p[1] !== 0) s += '<br>' + (p[1] > 0 ? 'Add ' + t(nT(p[1])) : 'Subtract ' + t(nT(-p[1]))) + ' on both sides: ' + t('y=' + lin([[mv, 'x'], [b, '']]));
    return s;
  }
  function genSteps(m, p, noCheck) {
    var f = Array.isArray(m) ? Fr(m[0], m[1]) : [m, 1], P0 = f[0], Q = f[1], G = genABC({ m: m, point: p }), s = t(psT(m, p));
    if (Q === 1) { if (p[0] !== 0) s += '<br>Expand: ' + t(expandT(m, p)); }
    else s += '<br>Multiply both sides by ' + t(Q) + ': ' + t(lin([[Q, 'y'], [-Q * p[1], '']]) + '=' + lin([[P0, 'x'], [-P0 * p[0], '']]));
    s += '<br>Move every term to one side (keep the ' + t('x') + '-term positive): ' + t(gT(G));
    if (!noCheck) s += '<br>Check ' + t(ptT(p)) + ': ' + chkT(G, p);
    return s;
  }
  function slopeSteps(A, B, lab) { var dy = B[1] - A[1], dx = B[0] - A[0], m = Fr(dy, dx), raw = '\\frac{' + dy + '}{' + dx + '}', fin = Ln.frT(m[0], m[1]); return t((lab || 'm') + '=\\frac{' + nT(B[1]) + '-' + paren(A[1]) + '}{' + nT(B[0]) + '-' + paren(A[0]) + '}=' + raw + (fin !== raw ? '=' + fin : '')); }
  function slope2(A, B) { return Fr(B[1] - A[1], B[0] - A[0]); }
  function givenSlopeT(G) { // "Ax + By + C = 0 → y = …, slope …"
    var m = slopeOfG(G), b = z(-G[2] / G[1]);
    return t(gT(G)) + ' gives ' + t('y=' + lin([[fv(m), 'x'], [b, '']])) + ', so its slope is ' + t(mT(m)) + '.';
  }
  function perpT(m) { var f = Fr(-m[1], m[0]); return f; }

  /* common slope–point mistakes, as lines (for opt.wrong) */
  function psWrongs(m, p) {
    var x1 = p[0], y1 = p[1], mv = fv(m), w = [
      { is: { m: m, point: [x1, -y1] }, code: 'ps-sign-y', hint: 'Check the sign in ' + t('y-y_1') + ': with ' + t('y_1=' + nT(y1)) + ' it is ' + t(lin([[1, 'y'], [-y1, '']])) + '.' },
      { is: { m: m, point: [-x1, y1] }, code: 'ps-sign-x', hint: 'Check the sign in ' + t('x-x_1') + ': with ' + t('x_1=' + nT(x1)) + ' it is ' + t(lin([[1, 'x'], [-x1, '']])) + '.' },
      { is: { m: m, point: [-x1, -y1] }, code: 'ps-signs', hint: 'Slope–point form has two <b>subtractions</b>, ' + t('y-y_1') + ' and ' + t('x-x_1') + '. Your line goes through ' + t(ptT([-x1, -y1])) + ' instead of ' + t(ptT(p)) + '.' },
      { is: { m: m, point: [y1, x1] }, code: 'ps-swap', hint: 'You swapped the coordinates: ' + t('x_1=' + nT(x1)) + ' goes with ' + t('x') + ', and ' + t('y_1=' + nT(y1)) + ' goes with ' + t('y') + '.' }];
    if (mv !== 1 && x1 !== 0) w.push({ is: { m: m, b: y1 - x1 }, code: 'ps-distribute', hint: 'Multiply the slope into <b>both</b> terms of the bracket: ' + t(mT(m) + '(' + lin([[1, 'x'], [-x1, '']]) + ')=' + lin([[mv, 'x'], [-mv * x1, '']])) + '.' });
    return w;
  }
  function genWrongs(m, p) {
    var f = Array.isArray(m) ? Fr(m[0], m[1]) : [m, 1], w = psWrongs(m, p);
    if (f[1] > 1) w.push({ is: G3(f[0], -f[1], -f[0] * p[0] + p[1]), code: 'clear-one-side', hint: 'When you clear the fraction, multiply <b>every</b> term on both sides by ' + t(f[1]) + ' — including ' + t(nT(-p[1])) + ' on the left.' });
    return w;
  }
  function line(prompt, target, opt, sol, hints, text, good, bad) {
    var p = K.P.line(prompt, target, opt, sol, hints, text); p.good = good || []; p.bad = bad || []; return p;
  }
  var PS_HINTS = ['Slope–point form is ' + t('y-y_1=m(x-x_1)') + ': put the slope in for ' + t('m') + ' and the point in for ' + t('(x_1,\\ y_1)') + '.', 'Subtracting a negative is adding: ' + t('y-(-4)=y+4') + '.'];
  function psPart(prompt, m, p, text, extraHint) {
    var key = psT(m, p), raw = rawT(m, p);
    return line(prompt, { m: m, point: p }, { form: 'point-slope', point: p, wrong: psWrongs(m, p) },
      'Substitute ' + t('m=' + mT(m)) + ' and ' + t('(x_1,\\ y_1)=' + ptT(p)) + ' into ' + t('y-y_1=m(x-x_1)') + ':<br>' + t(raw) + (raw.replace(/\(([^()]*)\)/g, '$1') !== key ? '<br>which tidies to ' + t(key) + '.' : ''),
      extraHint ? [extraHint].concat(PS_HINTS) : PS_HINTS, text, [raw], p[0] || p[1] ? [psT(m, [-p[0], -p[1]])] : []);
  }
  function siPart(prompt, m, p, text, extra) {
    extra = extra || {};
    var b = bOf(m, p);
    return line(prompt, { m: m, point: p }, { form: 'slope-intercept', wrong: psWrongs(m, p).concat(extra.wrong || []) },
      (extra.pre || '') + siSteps(m, p),
      extra.hints || ['Start from ' + t('y-y_1=m(x-x_1)') + ', expand the bracket, then get ' + t('y') + ' by itself.', 'Check: your answer must give ' + t('y=' + nT(p[1])) + ' when ' + t('x=' + nT(p[0])) + '.'], text,
      ['y=' + lin([[b, ''], [fv(m), 'x']])], p[1] ? [siT(m, [p[0], -p[1]])] : [siT(m, [-p[0] || 1, 0])]);
  }
  function genPart(prompt, m, p, text, extra) {
    extra = extra || {};
    var G = genABC({ m: m, point: p });
    return line(prompt, { m: m, point: p }, { form: 'general', wrong: (extra.noPs ? [] : genWrongs(m, p)).concat(extra.wrong || []) },
      (extra.pre || '') + genSteps(m, p),
      extra.hints || ['Write the slope–point equation first, clear any fraction, then move every term to one side: ' + t('Ax+By+C=0') + '.', 'General form: whole numbers, ' + t('A') + ' positive, no common factor.'], text,
      [], [gT([G[0], G[1], -G[2] || 7]), gT([G[0], -G[1], G[2]])]);
  }

  /* ---------- reading a point ---------- */
  function readPt(s) {
    s = String(s == null ? '' : s).replace(/\\left|\\right/g, '').replace(/\\lbrace|\\rbrace|\\\{|\\\}/g, '').replace(/\\,|\\ |\\;|\\!/g, ' ').replace(/\s+/g, '');
    if (!s) return { empty: true };
    var m = /^\((.*)\)$/.exec(s);
    if (!m) { if (s.indexOf(',') < 0) { var a0 = ex.parse(s); if (a0.ok) return { num: ex.value(a0.ast) }; } return { bad: true }; }
    var xy = m[1].split(','); if (xy.length !== 2) return { bad: true };
    var a = ex.parse(xy[0]), b = ex.parse(xy[1]); if (!a.ok || !b.ok) return { bad: true };
    var p = [ex.value(a.ast), ex.value(b.ast)]; if (!isFinite(p[0]) || !isFinite(p[1])) return { bad: true };
    return { p: p };
  }
  function ptCheck(P, opt) {
    opt = opt || {};
    return function (resp) {
      var r = readPt(resp);
      if (r.empty) return form('empty', 'Type your answer first.');
      if (r.num != null) return form('pt-form', 'Write the point as an ordered pair ' + t('(x,\\ y)') + ', in brackets.');
      if (r.bad) return form('pt-form', 'Write one ordered pair in brackets, e.g. ' + t('(-3,\\ 4)') + '.');
      var q = r.p;
      if (samePt(q, P)) return ok();
      if (opt.diag) { var h = opt.diag(q); if (h) return wrong(h.code, h.hint); }
      if (samePt(q, [P[1], P[0]])) return wrong('pt-swap', 'You swapped the coordinates: the ' + t('x') + '-coordinate comes first.');
      if (samePt(q, [-P[0], -P[1]])) return wrong('pt-signs', opt.signs || 'Check both signs.');
      if (samePt(q, [-P[0], P[1]])) return wrong('pt-sign-x', opt.xs || 'Check the sign of the ' + t('x') + '-coordinate.');
      if (samePt(q, [P[0], -P[1]])) return wrong('pt-sign-y', opt.ys || 'Check the sign of the ' + t('y') + '-coordinate.');
      return wrong('pt', null);
    };
  }
  function psReadHints(p) {
    return { signs: 'The signs flip: ' + t('y-y_1') + ' and ' + t('x-x_1') + ' are subtractions, so read ' + t('x_1') + ' and ' + t('y_1') + ' with the <b>opposite</b> sign of what you see.',
      xs: 'Check ' + t('x_1') + ': ' + (p[0] < 0 ? t('x+' + nT(-p[0]) + '=x-(' + nT(p[0]) + ')') + ', so ' + t('x_1=' + nT(p[0])) : p[0] === 0 ? 'there is no number with ' + t('x') + ', so ' + t('x_1=0') : t('x-' + nT(p[0])) + ' means ' + t('x_1=' + nT(p[0]))) + '.',
      ys: 'Check ' + t('y_1') + ': ' + (p[1] < 0 ? t('y+' + nT(-p[1]) + '=y-(' + nT(p[1]) + ')') + ', so ' + t('y_1=' + nT(p[1])) : p[1] === 0 ? 'there is no number with ' + t('y') + ', so ' + t('y_1=0') : t('y-' + nT(p[1])) + ' means ' + t('y_1=' + nT(p[1]))) + '.' };
  }
  function readPsPart(m, p, text) {
    var eq = psT(m, p), H = psReadHints(p);
    var fields = [{ label: 'Slope', before: 'm=', mode: 'math', keys: 'pairs', placeholder: 'e.g. -2/3' }, { label: 'Point', before: '(x_1,\\ y_1)=', mode: 'math', keys: 'pairs', placeholder: 'e.g. (-3, 4)' }];
    fields.forEach(function (f) { f.before = t(f.before); });
    var part = K.P.fields(t(eq), fields, [K.slope(Array.isArray(m) ? m : [m, 1]), ptCheck(p, H)], [mT(m), ptT(p)], t('m=' + mT(m)) + ', point ' + t(ptT(p)),
      'Match ' + t(eq) + ' to ' + t('y-y_1=m(x-x_1)') + (p[0] < 0 || p[1] < 0 || !p[0] || !p[1] ? ' (rewrite it first: ' + t(rawT(m, p)) + ')' : '') + '.<br>Slope ' + t('m=' + mT(m)) + ', point ' + t(ptT(p)) + '.',
      ['The number in front of the bracket is the slope. The point comes from the numbers <b>subtracted</b> from ' + t('x') + ' and ' + t('y') + '.', 'A missing number means ' + t('0') + ': ' + t('y=\\ldots') + ' is ' + t('y-0=\\ldots') + '.'], text);
    part.bad = [[mT(m), ptT([-p[0], -p[1]])], [nT(-fv(m)), ptT(p)]].filter(function (b) { return !(b[1] === ptT(p) && b[0] === mT(m)); });
    return part;
  }

  /* ---------- pictures ---------- */
  function clip(G, xr, yr) {
    var x0 = xr[0] + 0.3, x1 = xr[1] - 0.3, y0 = yr[0] + 0.3, y1 = yr[1] - 0.3, A = G[0], B = G[1], C = G[2], pts = [];
    if (B !== 0) [x0, x1].forEach(function (x) { var y = -(A * x + C) / B; if (y >= y0 - 1e-9 && y <= y1 + 1e-9) pts.push([x, y]); });
    if (A !== 0) [y0, y1].forEach(function (y) { var x = -(B * y + C) / A; if (x >= x0 - 1e-9 && x <= x1 + 1e-9) pts.push([x, y]); });
    pts.sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; });
    return [pts[0], pts[pts.length - 1]];
  }
  function lineG(A, B) { return genABC({ m: slope2(A, B), point: A }); }
  function gridPic(lines, pts, xr, yr, max) {
    return HW.graph({ x: xr, y: yr, labels: 2, max: max || 320,
      segs: lines.map(function (L) { return { pts: clip(L.G, xr, yr), start: 'arrow', end: 'arrow', color: L.color }; }),
      points: pts.map(function (p) { return { x: p[0], y: p[1], label: p[2] === undefined ? ptL(p) : p[2], color: p[3] }; }) });
  }
  function latticeOn(m, b, xr, yr) {
    var out = [], mv = fv(m);
    for (var x = xr[0]; x <= xr[1]; x++) { var y = mv * x + b; if (Math.abs(y - Math.round(y)) < 1e-9 && y >= yr[0] && y <= yr[1]) out.push([x, Math.round(y)]); }
    return out;
  }
  /* a line with slope m and two lattice points far apart inside [−6, 6] */
  function gridLine(r, m, bs) {
    for (var i = 0; i < 200; i++) {
      var b = r.pick(bs), pts = latticeOn(m, b, [-6, 6], [-6, 6]).filter(function (p) { return Math.abs(p[0]) <= 6 && Math.abs(p[1]) <= 6 && !(p[0] === 0 && p[1] === 0); });
      if (pts.length < 2) continue;
      var a = pts[0], c = pts[pts.length - 1];
      if (pts.length > 2 && r.chance(0.5)) c = pts[pts.length - 2];
      if (Math.abs(c[0] - a[0]) >= 3 && a[0] !== 0 && c[0] !== 0) return { b: b, A: a, B: c };
    }
    return null;
  }

  /* ---------- MC with equation options ---------- */
  function eqOpt(tex, right, why) { return { html: t(tex), right: !!right, why: why }; }
  function mcPart(r, prompt, opts, sol, hints, text, keepOrder, cols) { var p = K.P.mc(r, prompt, opts, sol, hints, text, keepOrder); if (cols) p.input.columns = 2; return p; }
  function distinctTex(list) { var seen = {}; return list.every(function (s) { if (seen[s]) return false; seen[s] = 1; return true; }); }

  HW.addCodes({
    'ps-sign-y': 'Slope–point form: sign of y₁', 'ps-sign-x': 'Slope–point form: sign of x₁', 'ps-signs': 'Slope–point form: added instead of subtracted', 'ps-swap': 'Swapped x₁ and y₁',
    'ps-distribute': 'Didn’t multiply the slope into the bracket', 'clear-one-side': 'Cleared the fraction on one side only', 'pt-form': 'Point not written as an ordered pair', 'pt-swap': 'Point coordinates swapped',
    'pt-signs': 'Point read with both signs wrong', 'pt-sign-x': 'Point: x sign', 'pt-sign-y': 'Point: y sign', pt: 'Wrong point', 'pt-given': 'Gave the given point', 'pt-off': 'Point not on the line',
    'xint-as-b': 'Used the x-intercept as b', 'yint-as-xint': 'Used the y-intercept as an x-intercept', 'used-given': 'Used the given line’s slope (not perpendicular)', 'used-perp': 'Used a perpendicular slope (should be parallel)',
    'perp-sign-only': 'Perpendicular: changed only the sign', 'perp-recip-only': 'Perpendicular: took only the reciprocal', 'given-slope-sign': 'Slope of Ax+By+C=0 taken as A/B', 'used-xint': 'Used the x-intercept instead of the y-intercept',
    'used-yint': 'Used the y-intercept instead of the x-intercept', 'line-bc': 'Wrote line BC instead of the parallel through A', 'trail': 'Wrote the trail’s equation', 'wz-for-wx': 'Parallel side instead of perpendicular side',
    'ctx-swap': 'Rate and starting value swapped', 'used-endpoint': 'Used an endpoint instead of the midpoint', 'alt-parallel': 'Altitude parallel to the side', 'alt-median': 'Drew/used a median', 'alt-side': 'Used the side itself',
    'alt-extra': 'Extra line in the drawing', 'alt-missing': 'Altitude missing', 'nr-sign': 'Sign error', 'nr-part': 'Left out a term', 'symb-swap': 'Swapped m and b', 'symb-form': 'Not in slope–intercept form', 'rate-flip': 'Rate upside down', 'rate-dy': 'Used the change in the output only', 'zero-skip': 'Point check arithmetic'
  });

  /* ---------- symbolic: line through (0, b) with slope m ---------- */
  function symbPart(r) {
    var V = r.pick([['m', 'b'], ['m', 'b'], ['a', 'k'], ['k', 'c']]), M = V[0], B = V[1], P = HW.poly;
    function chk(resp) {
      var s = String(resp == null ? '' : resp).replace(/\\left|\\right/g, '').trim().replace(/^y\s*=/, '');
      if (!s) return form('empty', 'Type the right side of the equation first.');
      if (s.indexOf('=') >= 0) return form('unreadable', 'Just type what ' + t('y') + ' equals.');
      var a = ex.parse(s); if (!a.ok) return form('unreadable', 'I can’t read that. Check the brackets.');
      var rr = P.read(a.ast); if (!rr.ok) return form('unreadable', 'I can’t read that.');
      if (P.eq(rr.p, P.parse(M + 'x+' + B))) { var fi = P.formIssue ? P.formIssue(a.ast) : null; if (fi && fi.code !== 'not-poly') return form('symb-form', 'Right — now simplify it (no brackets) so it reads like ' + t('y=mx+b') + '.'); return ok(); }
      if (P.eq(rr.p, P.parse(B + 'x+' + M))) return wrong('symb-swap', 'The slope multiplies ' + t('x') + '; the ' + t('y') + '-coordinate of the point, ' + t(B) + ', is the constant.');
      if (P.eq(rr.p, P.parse(M + 'x-' + B))) return wrong('ps-sign-y', 'Check the sign: ' + t('y-' + B + '=' + M + 'x') + ', so add ' + t(B) + ' to both sides.');
      return wrong('line', null);
    }
    var key = M + 'x+' + B;
    return { prompt: t('(0,\\ ' + B + ')') + ', slope ' + t(M), input: { type: 'math', keys: 'poly', vars: ['x', M, B], before: t('y='), placeholder: 'e.g. ' + M + 'x + ' + B }, check: chk, key: key, answer: t('y=' + key),
      solution: t('y-' + B + '=' + M + '(x-0)') + '<br>' + t('y-' + B + '=' + M + 'x') + '<br>' + t('y=' + key) + '<br>So slope–intercept form is just slope–point form with the point ' + t('(0,\\ b)') + ' on the ' + t('y') + '-axis.',
      hints: ['Use ' + t('y-y_1=m(x-x_1)') + ' with ' + t('x_1=0') + ' and ' + t('y_1=' + B) + ', then get ' + t('y') + ' by itself.'], text: 'line through (0,' + B + ') slope ' + M,
      good: [B + '+' + M + 'x', 'y=' + M + 'x+' + B, 'x' + M + '+' + B], bad: [B + 'x+' + M, M + 'x-' + B, M + '(x+' + B + ')'] };
  }

  /* ---------- points on lines (EP2 iii) ---------- */
  function onLineCheck(m, p0) {
    var mv = fv(m), b = bOf(m, p0);
    return function (resp) {
      var r = readPt(resp);
      if (r.empty) return form('empty', 'Type your answer first.');
      if (r.num != null || r.bad) return form('pt-form', 'Write the point as an ordered pair ' + t('(x,\\ y)') + ', in brackets.');
      var q = r.p;
      if (samePt(q, p0)) return wrong('pt-given', 'That’s the point you were given. Step off the slope from it to reach a <b>different</b> point.');
      if (near(q[1], mv * q[0] + b)) return ok();
      return wrong('pt-off', 'That point isn’t on the line. From ' + t(ptT(p0)) + ' move ' + t(Ln.toFr(mv)[1]) + ' right and ' + (mv > 0 ? 'up ' : 'down ') + t(Math.abs(Ln.toFr(mv)[0])) + '.');
    };
  }

  /* ---------- the triangle for EP14 ---------- */
  function orthocenter(P, Q, R) {
    // (H − P)·(R − Q) = 0 and (H − Q)·(R − P) = 0
    var a1 = R[0] - Q[0], b1 = R[1] - Q[1], c1 = a1 * P[0] + b1 * P[1], a2 = R[0] - P[0], b2 = R[1] - P[1], c2 = a2 * Q[0] + b2 * Q[1], d = a1 * b2 - a2 * b1;
    if (!d) return null; return [(c1 * b2 - c2 * b1) / d, (a1 * c2 - a2 * c1) / d];
  }
  function triangle(r) {
    for (var i = 0; i < 4000; i++) {
      var P = [r.int(-6, -3), r.int(-4, 2)], Q = [r.int(-3, 2), r.int(4, 8)], R = [r.int(3, 6), r.int(-4, 3)];
      var H = orthocenter(P, Q, R); if (!H || Math.abs(H[0] - Math.round(H[0])) > 1e-9 || Math.abs(H[1] - Math.round(H[1])) > 1e-9) continue;
      H = [Math.round(H[0]), Math.round(H[1])];
      if (H[0] < -7 || H[0] > 7 || H[1] < -5 || H[1] > 9) continue;
      if ([P, Q, R].some(function (V) { return samePt(V, H); })) continue;
      var sides = [[P, Q], [Q, R], [P, R]], okS = sides.every(function (s) { var dx = s[1][0] - s[0][0], dy = s[1][1] - s[0][1]; if (!dx || !dy) return false; var m = Fr(dy, dx); return Math.abs(m[0]) <= 6 && m[1] <= 6; });
      if (!okS) continue;
      var area = Math.abs((Q[0] - P[0]) * (R[1] - P[1]) - (R[0] - P[0]) * (Q[1] - P[1])) / 2; if (area < 24) continue;
      if (i < 3999 && r.chance(0.15)) return { P: [-6, -4], Q: [-2, 8], R: [6, 0], H: [0, 2] };
      return { P: P, Q: Q, R: R, H: H };
    }
    return { P: [-6, -4], Q: [-2, 8], R: [6, 0], H: [0, 2] };
  }
  function linesKeySet(v) { var g = HW.draw.geom(v); return Object.keys(g.lines).sort(); }
  function arrowPiece(A, B) { return { v: [A, B], s: 'arrow', e: 'arrow' }; }

  HW.defineLesson({
    id: 'u7l4', unit: 7, num: '4', title: 'Using Slope–Point Form to Determine the Equation of a Line', outcome: 'RF7',
    blurb: 'Write y − y₁ = m(x − x₁) from a slope and a point, read the slope and point back out of it, and turn indirect descriptions — two points, intercepts, parallel and perpendicular lines — into general form.',
    questions: [
      { num: '1', section: 'Assignment — Slope–point form', stem: 'State the equation, in slope–point form, of the line through the given point and with the given slope.', parts: [
        { id: '1a', level: 'BEG', make: function (r) { var p = [r.int(2, 9), r.int(1, 9)], m = r.int(2, 6); return psPart(t(ptT(p)) + ', slope ' + t(m), m, p, 'slope-point: ' + ptT(p) + ', m=' + m); } },
        { id: '1b', level: 'BEG', make: function (r) { var p = [r.int(2, 9), r.int(-9, -2)], m = r.int(-6, -2); return psPart(t(ptT(p)) + ', slope ' + t(m), m, p, 'slope-point: ' + ptT(p) + ', m=' + m); } },
        { id: '1c', level: 'BEG', make: function (r) { var p = [r.int(-9, -2), r.int(2, 9)], m = r.int(2, 7); return psPart(t(ptT(p)) + ', slope ' + t(m), m, p, 'slope-point: ' + ptT(p) + ', m=' + m); } },
        { id: '1d', level: 'EMG', make: function (r) { var p = [0, r.int(-9, -2)], m = [1, r.int(2, 5)]; return psPart(t(ptT(p)) + ', slope ' + t(mT(m)), m, p, 'slope-point: ' + ptT(p) + ', m=' + mT(m), 'With ' + t('x_1=0') + ' the bracket is just ' + t('(x-0)=x') + '.'); } },
        { id: '1e', level: 'EMG', make: function (r) { var p = [r.int(-10, -2), 0], m = properFr(r, [3, 4, 5, 7], 1, 2); return psPart(t(ptT(p)) + ', slope ' + t(mT(m)), m, p, 'slope-point: ' + ptT(p) + ', m=' + mT(m), 'With ' + t('y_1=0') + ' the left side is just ' + t('y-0=y') + '.'); } },
        { id: '1f', level: 'EMG', make: function (r) { var p = [r.int(-6, -1), -r.pick([1, 3, 5, 7]) / 2], m = properFr(r, [3, 5, 7], 1, 2); return psPart(t('\\left(' + nT(p[0]) + ',\\ ' + nT(p[1]) + '\\right)') + ', slope ' + t(mT(m)), m, p, 'slope-point: ' + ptT(p) + ', m=' + mT(m), 'A fraction can be ' + t('y_1') + ' too: ' + t('y-\\left(-\\frac{3}{2}\\right)=y+\\frac{3}{2}') + '.'); } }] },
      { num: '2', stem: 'Write each equation in slope–intercept form, ' + t('y=mx+b') + '.', outcome: 'RF6', parts: [
        { id: '2a', level: 'BEG', make: function (r) { var p = [r.int(2, 9), r.int(2, 9)], m = r.int(2, 7); return siPart(t(psT(m, p)), m, p, 'to slope-intercept: ' + psT(m, p)); } },
        { id: '2b', level: 'EMG', make: function (r) { var p = [r.int(1, 6), r.int(-9, -2)], m = r.int(-6, -2); return siPart(t(psT(m, p)), m, p, 'to slope-intercept: ' + psT(m, p)); } },
        { id: '2c', level: 'EMG', make: function (r) { var p = [r.int(-6, -2), r.int(2, 9)], m = r.int(-9, -3); return siPart(t(psT(m, p)), m, p, 'to slope-intercept: ' + psT(m, p)); } },
        { id: '2d', level: 'EMG', make: function (r) { var p = [r.int(-15, -4), r.int(-9, -2)], m = r.int(2, 5); return siPart(t(psT(m, p)), m, p, 'to slope-intercept: ' + psT(m, p)); } }] },
      { num: '3', stem: 'Find the equation, in slope–intercept form, of the line through the given point and with the given slope.', parts: [
        { id: '3a', level: 'BEG', make: function (r) { var p = [r.int(2, 6), r.int(2, 9)], m = r.int(2, 5); return siPart(t(ptT(p)) + ', slope ' + t(m), m, p, 'y=mx+b through ' + ptT(p) + ', m=' + m); } },
        { id: '3b', level: 'EMG', make: function (r) { var p = [r.int(2, 6), r.int(-9, -2)], m = r.int(2, 6); return siPart(t(ptT(p)) + ', slope ' + t(m), m, p, 'y=mx+b through ' + ptT(p) + ', m=' + m); } },
        { id: '3c', level: 'BEG', make: function (r) { var p = [0, r.int(2, 9)], m = r.int(-6, -2); return siPart(t(ptT(p)) + ', slope ' + t(m), m, p, 'y=mx+b through ' + ptT(p) + ', m=' + m, { hints: ['The point ' + t(ptT(p)) + ' is on the ' + t('y') + '-axis — what does that tell you about ' + t('b') + '?'] }); } },
        { id: '3d', level: 'EMG', make: function (r) { var q = r.pick([2, 3, 4, 5]), k = r.pick([1, 2].filter(function (j) { return q * j <= 10; })), p = [-q * k, r.int(1, 6)], m = [1, q]; return siPart(t(ptT(p)) + ', slope ' + t(mT(m)), m, p, 'y=mx+b through ' + ptT(p) + ', m=' + mT(m)); } },
        { id: '3e', level: 'EMG', make: function (r) { var p = [-r.int(2, 9), -r.int(2, 9)], m = 1; return siPart(t(ptT(p)) + ', slope ' + t(1), m, p, 'y=mx+b through ' + ptT(p) + ', m=1'); } },
        { id: '3f', level: 'PRG', make: function (r) { return symbPart(r); } }] },
      { num: '4', stem: 'Find the equation, in general form ' + t('Ax+By+C=0') + ', of the line through the given point and with the given slope.', parts: [
        { id: '4a', level: 'EMG', make: function (r) { var p = [r.int(2, 7), r.int(2, 7)], m = r.int(2, 5); return genPart(t(ptT(p)) + ', slope ' + t(m), m, p, 'general form through ' + ptT(p) + ', m=' + m); } },
        { id: '4b', level: 'PRG', make: function (r) { var p = [r.int(2, 6), r.int(-9, -3)], m = [1, r.int(3, 6)]; return genPart(t(ptT(p)) + ', slope ' + t(mT(m)), m, p, 'general form through ' + ptT(p) + ', m=' + mT(m)); } },
        { id: '4c', level: 'PRG', make: function (r) { var p = [r.int(-5, -1), r.int(2, 6)], m = properFr(r, [3, 4, 5], -1, 2); return genPart(t(ptT(p)) + ', slope ' + t(mT(m)), m, p, 'general form through ' + ptT(p) + ', m=' + mT(m)); } },
        { id: '4d', level: 'PRG', make: function (r) { var p = [r.int(-9, -2), r.int(-5, -1)], m = properFr(r, [5, 7, 8], 1, 2); return genPart(t(ptT(p)) + ', slope ' + t(mT(m)), m, p, 'general form through ' + ptT(p) + ', m=' + mT(m)); } },
        { id: '4e', level: 'PRG', make: function (r) { var p = [0, r.int(-9, -2)], m = properFr(r, [5, 6, 7], -1, 2); return genPart(t(ptT(p)) + ', slope ' + t(mT(m)), m, p, 'general form through ' + ptT(p) + ', m=' + mT(m)); } },
        { id: '4f', level: 'EMG', make: function (r) { var m = improperFr(r, [2, 3], 1, 8); return genPart(t('(0,\\ 0)') + ', slope ' + t(mT(m)), m, [0, 0], 'general form through origin, m=' + mT(m), { hints: ['Through the origin: ' + t('y-0=m(x-0)') + '. Clear the fraction and move the terms to one side.', 'General form here has no constant: ' + t('C=0') + '.'] }); } }] },
      { num: '5', stem: 'Each equation below is written in slope–point form. State the slope of the line and the coordinates of the point used to write the equation.', outcome: 'RF6', parts: [
        { id: '5a', level: 'BEG', make: function (r) { return readPsPart(improperFr(r, [2, 3], -1, 8), [r.int(-9, -2), r.int(2, 9)], 'read slope & point'); } },
        { id: '5b', level: 'EMG', make: function (r) { return readPsPart(properFr(r, [3, 4, 5], 1, 2), [0, r.int(-9, -2)], 'read slope & point (x1=0)'); } },
        { id: '5c', level: 'BEG', make: function (r) { return readPsPart(r.int(-7, -2), [r.int(2, 9), r.int(1, 9)], 'read slope & point'); } },
        { id: '5d', level: 'EMG', make: function (r) { return readPsPart(r.int(2, 8), [r.int(-7, -1), 0], 'read slope & point (y1=0)'); } },
        { id: '5e', level: 'EMG', make: function (r) { return readPsPart(properFr(r, [5, 7, 9], -1, 2), [0, r.int(-6, -1)], 'read slope & point (x1=0)'); } },
        { id: '5f', level: 'BEG', make: function (r) { return readPsPart(properFr(r, [5, 7, 8], 1, 3), [0, 0], 'read slope & point (origin)'); } }] },
      { num: '6', stem: function (sh) { return 'Two lines have been drawn on the grid: ' + t('\\ell_1') + ' (teal, falling from left to right) and ' + t('\\ell_2') + ' (orange, rising). Each passes through the two marked points with integer coordinates. Determine the equation of each line, in general form.' + sh.pic; },
        shared: function (r) {
          var a = null, b = null;
          for (var i = 0; i < 50 && !(a && b); i++) { a = gridLine(r, r.pick([[-1, 1], [-1, 1], [-2, 1], [-1, 2], [-2, 3], [-3, 2]]), [-3, -2, -1, 1, 2]); b = gridLine(r, r.pick([[3, 1], [3, 1], [2, 1], [4, 1], [3, 2], [5, 2]]), [-2, -1, 1, 2, 3]); }
          if (r.chance(0.2) || !a || !b) { a = { A: [-6, 5], B: [3, -4] }; b = { A: [-2, -5], B: [1, 4] }; }
          var G1 = lineG(a.A, a.B), G2 = lineG(b.A, b.B);
          var pic = gridPic([{ G: G1 }, { G: G2, color: '#c4532a' }], [a.A.concat([undefined]), a.B.concat([undefined]), b.A.concat([undefined, '#c4532a']), b.B.concat([undefined, '#c4532a'])], [-7, 7], [-7, 7], 330);
          return { l1: a, l2: b, pic: pic };
        },
        parts: [
          { id: '6a', sub: 'ℓ₁', level: 'PRG', make: function (r, sh) { return gridLinePart(sh.l1, '\\ell_1'); } },
          { id: '6b', sub: 'ℓ₂', level: 'PRG', make: function (r, sh) { return gridLinePart(sh.l2, '\\ell_2'); } }] },
      { num: '7', section: 'Multiple choice and numerical response', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '7', level: 'EMG', make: function (r) {
          var m = r.int(-6, -2), p = [r.int(2, 7), r.int(-7, -2)], b = bOf(m, p), b2 = -p[1] - m * p[0], A = -m;
          return mcPart(r, 'The equation of the line passing through the point ' + t(ptT(p)) + ' with slope ' + t(m) + ' is', [
            eqOpt(gT([A, 1, -b]), true),
            eqOpt(gT([A, 1, b]), false, 'That line passes through ' + t(ptT([-p[0], -p[1]])) + ': the signs of the point were flipped. Use ' + t('y-y_1') + ' and ' + t('x-x_1') + '.'),
            eqOpt(gT([A, -1, -b]), false, 'In general form the slope is ' + t('-\\frac{A}{B}') + '. This line has slope ' + t(-m) + ', not ' + t(m) + '.'),
            eqOpt(gT([A, 1, -b2]), false, 'Check the sign when you move ' + t('y_1') + ': ' + t(lin([[1, 'y'], [-p[1], '']]) + '=' + m + '(' + lin([[1, 'x'], [-p[0], '']]) + ')') + '. Substitute ' + t(ptT(p)) + ' into this option — it doesn’t give 0.')],
            genSteps(m, p) + '<br>(Or test ' + t(ptT(p)) + ' in each option: only the right one gives ' + t('0') + ' and has slope ' + t(m) + '.)', ['Write ' + t('y-y_1=m(x-x_1)') + ', then move everything to one side.', 'Quick check: substitute the point into each option.'], 'MC point ' + ptT(p) + ' slope ' + m, false, true);
        } }] },
      { num: '8', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '8', level: 'EMG', make: function (r) {
          var m = properFr(r, [3, 4, 5, 7], -1, 2), p = -m[0], q = m[1];
          return mcPart(r, 'The equation of the line passing through the origin with slope ' + t(mT(m)) + ' is', [
            eqOpt(gT([p, q, 0]), true),
            eqOpt(gT([p, -q, 0]), false, 'This line has slope ' + t('+' + Ln.frT(p, q)) + ' (rearrange: ' + t('y=' + Ln.frT(p, q) + 'x') + '). Check the sign.'),
            eqOpt(gT([q, p, 0]), false, 'Rearrange: ' + t('y=-' + Ln.frT(q, p) + 'x') + '. That slope is upside down (run over rise).'),
            eqOpt(gT([q, -p, 0]), false, 'Rearrange: ' + t('y=' + Ln.frT(q, p) + 'x') + ' — wrong sign and upside down.')],
            t('y-0=' + mT(m) + '(x-0)') + '<br>Multiply by ' + t(q) + ': ' + t(q + 'y=-' + p + 'x') + '<br>' + t(gT([p, q, 0])) + '. (Check another point: ' + t(ptT([q, -p])) + ' gives ' + t(p + '(' + q + ')+' + q + '(' + (-p) + ')=0') + ' ✓)', ['Write ' + t('y=mx') + ' and clear the fraction.', 'Rearrange each option to ' + t('y=\\ldots') + ' and compare slopes.'], 'MC origin slope ' + mT(m), false, true);
        } }] },
      { num: '9', stem: '<i>(Multiple Choice)</i>', outcome: 'RF6', parts: [
        { id: '9', level: 'EMG', make: function (r) {
          var m, p, G;
          for (var i = 0; i < 50; i++) { m = properFr(r, [3, 5, 7], -1, 2); p = [r.int(-6, -1), r.int(2, 8)]; G = genABC({ m: m, point: p }); if (G[2] !== 0) break; }
          return mcPart(r, 'Which of the following linear equations is equivalent to ' + t(psT(m, p)) + '?', [
            eqOpt(gT(G), true),
            eqOpt(gT([G[0], -G[1], -G[2]]), false, 'This line has slope ' + t(nT(-fv(m))) + ', not ' + t(mT(m)) + ': in general form the slope is ' + t('-\\frac{A}{B}') + '.'),
            eqOpt(gT([G[0], G[1], -G[2]]), false, 'The slope is right, but test the point ' + t(ptT(p)) + ': it doesn’t give 0. Check the signs of the constant terms.'),
            eqOpt(gT([G[0], -G[1], G[2]]), false, 'This line has slope ' + t(nT(-fv(m))) + ': check the sign of the ' + t('y') + '-term.')],
            genSteps(m, p), ['Multiply both sides by the denominator, expand, and move every term to one side.', 'Check: the point ' + t(ptT(p)) + ' must make the equation true.'], 'MC equivalent to ' + psT(m, p), false, true);
        } }] },
      { num: '10', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '10', level: 'PRG', make: function (r) {
          var m = r.int(2, 9), a = -r.int(2, 9), C = -m * a, ans = -1 + C;
          return K.P.nr('The equation of the line with an ' + t('x') + '-intercept of ' + t(a) + ' and slope ' + t(m) + ' can be written in general form ' + t(m + 'x+By+C=0') + '. The value of ' + t('B+C') + ' is ________.', ans, function (v) {
            if (v === C) return { code: 'nr-part', hint: 'You found ' + t('C') + '. Don’t forget to add ' + t('B') + ' (the coefficient of ' + t('y') + ').' };
            if (v === C + 1) return { code: 'nr-sign', hint: 'Check the sign of ' + t('B') + ': moving ' + t('y') + ' to the right side makes it ' + t('-y') + '.' };
            if (v === m * Math.abs(a) - 1 + 2 * m * a || v === m - 1 || v === -1 - a) return { code: 'xint-as-b', hint: 'An ' + t('x') + '-intercept of ' + t(a) + ' means the point ' + t(ptT([a, 0])) + ' — it is not ' + t('b') + '.' };
            return null;
          }, 'An ' + t('x') + '-intercept of ' + t(a) + ' means the line passes through ' + t(ptT([a, 0])) + '.<br>' + t('y-0=' + m + '(x-' + paren(a) + ')=' + m + 'x+' + C) + ', so ' + t(m + 'x-y+' + C + '=0') + '.<br>' + t('B=-1') + ', ' + t('C=' + C) + ', so ' + t('B+C=' + ans) + '.',
          ['The ' + t('x') + '-intercept gives a point: ' + t(ptT([a, 0])) + '.', 'Write the slope–point equation, then move everything to the side with ' + t(m + 'x') + '.'], 'NR x-int ' + a + ' slope ' + m);
        } }] },
      { num: '11', section: 'Two points, intercepts, parallel and perpendicular', stem: 'Find the equation, in general form, of the line through each pair of points.',
        shared: function (r) { return set11(r); },
        parts: [
          { id: '11a', level: 'PRG', make: function (r, sh) { return twoPtPart(sh.L.a[0], sh.L.a[1]); } },
          { id: '11b', level: 'PRG', make: function (r, sh) { return twoPtPart(sh.L.b[0], sh.L.b[1]); } },
          { id: '11c', level: 'PRG', make: function (r, sh) { return twoPtPart(sh.L.c[0], sh.L.c[1]); } },
          { id: '11d', level: 'PRG', make: function (r, sh) { return twoPtPart(sh.L.d[0], sh.L.d[1]); } }] },
      { num: '12', outcome: 'RF5', stem: function (sh) { return 'Here are four lines like the ones in #11, each through a pair of points:<br>' + ['a', 'b', 'c', 'd'].map(function (k) { return '(' + k + ') ' + t(ptT(sh.L[k][0]) + '\\text{ and }' + ptT(sh.L[k][1])); }).join('<br>') + '<br>Identify the lines which are'; },
        shared: function (r) {
          var s = set11(r), roles = r.shuffle(['a', 'b', 'c', 'd']), L = {}; ['a', 'b', 'c', 'd'].forEach(function (k, i) { L[roles[i]] = s.L[k]; });
          return { L: L, s: s.s, role: { p1: roles[0], odd: roles[1], p2: roles[2], perp: roles[3] } };
        },
        parts: [
          { id: '12a', sub: 'i', level: 'EMG', make: function (r, sh) { return parPerpPart(r, sh, 'par'); } },
          { id: '12b', sub: 'ii', level: 'EMG', make: function (r, sh) { return parPerpPart(r, sh, 'perp'); } }] },
      { num: '13', stem: 'Write the equation of each line in general form.', parts: [
        { id: '13a', level: 'EMG', make: function (r) {
          var m = properFr(r, [3, 4, 5], -1, 2), b = r.int(2, 8);
          return genPart('with slope ' + t(mT(m)) + ' and a ' + t('y') + '-intercept of ' + t(b), m, [0, b], 'general: slope ' + mT(m) + ', y-int ' + b,
            { pre: 'The ' + t('y') + '-intercept gives the point ' + t(ptT([0, b])) + '.<br>', wrong: [{ is: { m: m, point: [b, 0] }, code: 'yint-as-xint', hint: 'A ' + t('y') + '-intercept of ' + t(b) + ' is the point ' + t(ptT([0, b])) + ', on the ' + t('y') + '-axis — not ' + t(ptT([b, 0])) + '.' }] });
        } },
        { id: '13b', level: 'PRG', make: function (r) {
          var m = r.int(2, 6), a = -r.int(1, 6);
          return genPart('with slope ' + t(m) + ' and an ' + t('x') + '-intercept of ' + t(a), m, [a, 0], 'general: slope ' + m + ', x-int ' + a,
            { pre: 'An ' + t('x') + '-intercept of ' + t(a) + ' gives the point ' + t(ptT([a, 0])) + '.<br>', wrong: [{ is: { m: m, b: a }, code: 'xint-as-b', hint: 'An ' + t('x') + '-intercept of ' + t(a) + ' is the point ' + t(ptT([a, 0])) + ', on the ' + t('x') + '-axis. It is not ' + t('b') + ' (that’s the ' + t('y') + '-intercept).' }],
              hints: ['Turn the ' + t('x') + '-intercept into a point first: ' + t('(' + a + ',\\ 0)') + '.', 'Then use slope–point form and move every term to one side.'] });
        } }] },
      { num: '14', stem: 'Write the equation of each line in general form.', parts: [
        { id: '14a', level: 'PRG', make: function (r) {
          var B = r.int(3, 7), A = r.pick([1, 2, 3, 4, 5, 6].filter(function (a) { return a !== B && coprime(a, B); })), k = r.pick([-4, -3, -2, 2, 3, 4]), G = [A, -B, B * k], x0 = r.int(2, 8), mg = Fr(A, B), mp = Fr(-B, A);
          return genPart('through the point ' + t(ptT([x0, 0])) + ' and perpendicular to ' + t(gT(G)), mp, [x0, 0], 'perp to ' + gT(G) + ' through (' + x0 + ',0)', {
            pre: givenSlopeT(G) + '<br>Perpendicular slope (negative reciprocal): ' + t(mT(mp)) + '.<br>',
            wrong: [{ is: { m: mg, point: [x0, 0] }, code: 'used-given', hint: 'That line is <b>parallel</b> to ' + t(gT(G)) + '. A perpendicular line needs the negative reciprocal of ' + t(mT(mg)) + '.' },
              { is: { m: Fr(-A, B), point: [x0, 0] }, code: 'perp-sign-only', hint: 'For a perpendicular slope, change the sign <b>and</b> flip the fraction.' },
              { is: { m: Fr(B, A), point: [x0, 0] }, code: 'perp-recip-only', hint: 'You flipped the fraction — now change the sign too.' }],
            hints: ['Find the slope of the given line first: solve for ' + t('y') + ', or use ' + t('m=-\\frac{A}{B}') + '.', 'Perpendicular slopes are negative reciprocals: their product is ' + t('-1') + '.'] });
        } },
        { id: '14b', level: 'PRG', make: function (r) {
          var B = r.int(3, 8), A = r.pick([1, 2, 3, 4, 5, 7].filter(function (a) { return a !== B && coprime(a, B); })), k = r.int(1, 4), G = [A, B, -B * k], p = [r.int(-5, -1), r.int(2, 7)], m = Fr(-A, B);
          return genPart('through the point ' + t(ptT(p)) + ' and parallel to ' + t(gT(G)), m, p, 'parallel to ' + gT(G) + ' through ' + ptT(p), {
            pre: givenSlopeT(G) + ' Parallel lines have equal slopes.<br>',
            wrong: [{ is: { m: Fr(B, A), point: p }, code: 'used-perp', hint: 'That slope is the negative reciprocal — it makes a <b>perpendicular</b> line. Parallel lines have the <b>same</b> slope.' },
              { is: { m: Fr(A, B), point: p }, code: 'given-slope-sign', hint: 'Check the slope of ' + t(gT(G)) + ': solve for ' + t('y') + ' — the slope is ' + t('-\\frac{A}{B}') + '.' }],
            hints: ['Parallel lines have the same slope. Find the slope of ' + t(gT(G)) + ' by solving for ' + t('y') + '.', 'Then use slope–point form with ' + t(ptT(p)) + '.'] });
        } }] },
      { num: '15', stem: 'Write the equation of each line in general form.', parts: [
        { id: '15a', level: 'ADV', make: function (r) {
          var B = r.int(2, 5), A = r.pick([2, 3, 4, 5, 7].filter(function (a) { return a !== B && coprime(a, B); })), j = r.int(1, 4), G = [A, -B, B * j];
          var u = r.pick([1, 1, 2, 3]), v = r.pick([1, 1, 2]), k = r.int(3, 9); if (!coprime(u, v)) { u = 1; }
          var G2 = [u, v, -v * k], mp = Fr(-B, A), xi = v * k / u;
          return genPart('perpendicular to ' + t(gT(G)) + ' and with the same ' + t('y') + '-intercept as ' + t(gT(G2)), mp, [0, k], 'perp to ' + gT(G) + ', y-int of ' + gT(G2), {
            pre: t('y') + '-intercept of ' + t(gT(G2)) + ': set ' + t('x=0') + ', ' + t(v === 1 ? 'y=' + k : v + 'y=' + v * k) + ', so the point is ' + t(ptT([0, k])) + '.<br>' + givenSlopeT(G) + ' Perpendicular slope: ' + t(mT(mp)) + '.<br>',
            wrong: [{ is: { m: mp, point: [xi, 0] }, code: 'used-xint', hint: 'You used the ' + t('x') + '-intercept of ' + t(gT(G2)) + '. The ' + t('y') + '-intercept comes from setting ' + t('x=0') + '.' },
              { is: { m: Fr(A, B), point: [0, k] }, code: 'used-given', hint: 'That line is parallel to ' + t(gT(G)) + '. Use the negative reciprocal of its slope.' },
              { is: { m: Fr(-A, B), point: [0, k] }, code: 'perp-sign-only', hint: 'For a perpendicular slope, change the sign <b>and</b> flip the fraction.' }],
            hints: ['Two clues: the slope comes from the perpendicular line, the point from the ' + t('y') + '-intercept of the other line (set ' + t('x=0') + ').', 'Then use slope–point form and convert to general form.'] });
        } },
        { id: '15b', level: 'ADV', make: function (r) {
          var a, A, B, q, m;
          for (var i = 0; i < 100; i++) { a = -r.int(2, 6); A = r.int(2, 7); B = r.pick([2, 3, 4, 5].filter(function (b) { return coprime(b, A); })); q = [r.int(3, 8), r.int(-9, -3)]; m = Fr(q[1], q[0] - a); if (m[1] <= 7 && B) break; }
          var G = [A, -B, -A * a], yi = -A * a / B;
          return genPart('with the same ' + t('x') + '-intercept as ' + t(gT(G)) + ', and through the point ' + t(ptT(q)), m, [a, 0], 'x-int of ' + gT(G) + ', through ' + ptT(q), {
            pre: t('x') + '-intercept of ' + t(gT(G)) + ': set ' + t('y=0') + ', ' + t(A + 'x=' + (A * a)) + ', ' + t('x=' + a) + ', so the point is ' + t(ptT([a, 0])) + '.<br>Slope through ' + t(ptT([a, 0])) + ' and ' + t(ptT(q)) + ': ' + slopeSteps([a, 0], q) + '.<br>',
            wrong: [{ is: { m: slope2([0, yi], q), point: q }, code: 'used-yint', hint: 'You used the ' + t('y') + '-intercept of ' + t(gT(G)) + '. The ' + t('x') + '-intercept comes from setting ' + t('y=0') + '.' },
              { is: { m: Fr(A, B), point: q }, code: 'used-given', hint: 'You don’t need the slope of ' + t(gT(G)) + ' — only its ' + t('x') + '-intercept. The slope comes from the two points.' }],
            hints: ['Find the ' + t('x') + '-intercept of the given line (set ' + t('y=0') + '). Now you have two points on your line.', 'Slope from the two points, then slope–point form, then general form.'] });
        } }] },
      { num: '16', stem: '', parts: [
        { id: '16', level: 'PRG', make: function (r) {
          var m, Bp, Cp, A, k;
          for (var i = 0; i < 100; i++) {
            var q = r.pick([2, 2, 3, 4]); m = properFr(r, [q], -1, 1); k = r.pick([2, 3, 4, 6].filter(function (kk) { return q * kk <= 14; }));
            Bp = [r.int(-5, -2), r.int(2, 6)]; Cp = [Bp[0] + q * k, Bp[1] + m[0] * k]; A = [r.int(2, 7), r.int(4, 9)];
            if (Math.abs(bOf(m, A) - Math.round(bOf(m, A))) > 1e-9 && !near(bOf(m, A), bOf(m, Bp))) break;
          }
          var mp = Fr(-m[1], m[0]);
          return siPart('Line ' + t('l') + ' contains the point ' + t('A' + ptT(A)) + ' and is parallel to a line which contains the points ' + t('B' + ptT(Bp)) + ' and ' + t('C' + ptT(Cp)) + '. Determine the equation of line ' + t('l') + ' in the form ' + t('y=mx+b') + '.', m, A, 'parallel to BC through A' + ptT(A), {
            pre: slopeSteps(Bp, Cp, 'm_{BC}') + '. Since ' + t('l\\parallel BC') + ', line ' + t('l') + ' has slope ' + t(mT(m)) + '.<br>',
            wrong: [{ is: { m: mp, point: A }, code: 'used-perp', hint: 'Parallel lines have the <b>same</b> slope — you used the negative reciprocal.' },
              { is: { m: m, point: Bp }, code: 'line-bc', hint: 'That’s line ' + t('BC') + ' itself. Line ' + t('l') + ' has the same slope but goes through ' + t('A') + '.' }],
            hints: ['Find the slope of ' + t('BC') + ' first — line ' + t('l') + ' has the same slope.', 'Then use slope–point form with ' + t('A') + ' and get ' + t('y') + ' by itself. The intercept may be a fraction.'] });
        } }] },
      { num: '17', stem: function (sh) { return 'A coordinate grid is placed over the blueprint of a campground. The ranger station sits at the origin, ' + t('O') + ', and rectangle ' + t('WXYZ') + ' represents a picnic pavilion. A straight nature trail, with equation ' + t('y=' + (sh.k === 1 ? '' : sh.k) + 'x') + ', runs from the station along side ' + t('XY') + ' of the pavilion. Corner ' + t('W') + ' is at ' + t(ptT(sh.W)) + '.' + sh.pic; },
        shared: function (r) {
          var opts = [[2, 2, 2], [2, 1, 2], [3, 1, 1], [3, 2, 1], [2, 2, 3], [2, 3, 2], [3, 1, 2]], o = r.pick(opts), k = o[0], a = o[1], s = o[2];
          var X = [a, k * a], W = [a - s * k, k * a + s], Y = [a + 1, k * (a + 1)], Zp = [W[0] + 1, W[1] + k];
          var xr = [Math.min(W[0], Zp[0]) - 1, Math.max(Y[0], X[0]) + 2], yr = [-1, Math.max(Y[1], Zp[1]) + 1];
          var pic = HW.graph({ x: xr, y: yr, labels: 2, max: 260, segs: [{ pts: [[0, 0], [(yr[1] - 0.4) / k, yr[1] - 0.4]], start: 'none', end: 'none', color: '#2b3340' }, { pts: [X, Y, Zp, W, X], start: 'none', end: 'none' }],
            points: [{ x: 0, y: 0, label: 'O', color: '#2b3340' }, { x: X[0], y: X[1], label: 'X' }, { x: Y[0], y: Y[1], label: 'Y' }, { x: Zp[0], y: Zp[1], label: 'Z' }, { x: W[0], y: W[1], label: 'W' + ptL(W) }] });
          return { k: k, X: X, W: W, Y: Y, Z: Zp, pic: pic };
        },
        parts: [
          { id: '17a', level: 'PRG', make: function (r, sh) {
            var k = sh.k;
            return line('Determine the equation of side ' + t('WZ') + '.', { m: k, point: sh.W }, { wrong: [{ is: { m: k, b: 0 }, code: 'trail', hint: 'That’s the trail itself. Side ' + t('WZ') + ' is the opposite side: parallel to the trail, through ' + t('W') + '.' }, { is: { m: Fr(-1, k), point: sh.W }, code: 'used-perp', hint: 'That’s the perpendicular direction (side ' + t('WX') + '). ' + t('WZ') + ' is opposite ' + t('XY') + ', so it is <b>parallel</b> to the trail.' }].concat(psWrongs(k, sh.W)) },
              'Side ' + t('XY') + ' runs along the trail, so the opposite side ' + t('WZ') + ' is parallel to it: slope ' + t(k) + '.<br>' + siSteps(k, sh.W), ['Opposite sides of a rectangle are parallel. Which side is opposite ' + t('XY') + '?', 'Use slope–point form with ' + t('W') + '.'], 'campground WZ', [psT(k, sh.W)], ['y=' + k + 'x']);
          } },
          { id: '17b', level: 'PRG', make: function (r, sh) {
            var k = sh.k, mp = Fr(-1, k);
            return line('Determine the equation of side ' + t('WX') + '.', { m: mp, point: sh.W }, { wrong: [{ is: { m: k, point: sh.W }, code: 'wz-for-wx', hint: 'That’s side ' + t('WZ') + ' (parallel to the trail). ' + t('WX') + ' meets the trail at a right angle, so it is perpendicular.' }, { is: { m: -k, point: sh.W }, code: 'perp-sign-only', hint: 'For a perpendicular slope, change the sign <b>and</b> take the reciprocal.' }, { is: { m: Fr(1, k), point: sh.W }, code: 'perp-recip-only', hint: 'Reciprocal — now change the sign too.' }].concat(psWrongs(mp, sh.W)) },
              'Adjacent sides of a rectangle are perpendicular, so ' + t('WX\\perp XY') + ': slope ' + t(mT(mp)) + ' (the negative reciprocal of ' + t(k) + ').<br>' + siSteps(mp, sh.W), ['Side ' + t('WX') + ' meets side ' + t('XY') + ' (the trail) at a right angle.', 'Perpendicular slopes are negative reciprocals.'], 'campground WX', [psT(mp, sh.W)], ['y=' + k + 'x+' + bOf(k, sh.W)]);
          } },
          { id: '17c', level: 'ADV', make: function (r, sh) {
            var k = sh.k, mp = Fr(-1, k), bW = bOf(mp, sh.W), X = sh.X;
            var p = K.P.math('Determine the coordinates of corner ' + t('X') + '. (Then verify that ' + t('X') + ' lies on the trail.)', ptCheck(X, { diag: function (q) {
              if (samePt(q, sh.W)) return { code: 'pt', hint: 'That’s ' + t('W') + '. ' + t('X') + ' is where side ' + t('WX') + ' meets the trail.' };
              if (samePt(q, sh.Y) || samePt(q, sh.Z)) return { code: 'pt', hint: 'That’s another corner. ' + t('X') + ' is next to ' + t('W') + ', on the trail.' };
              if (near(q[1], k * q[0])) return { code: 'pt', hint: 'That point is on the trail, but ' + t('X') + ' must also be on side ' + t('WX') + ': solve both equations together.' };
              if (near(q[1], fv(mp) * q[0] + bW)) return { code: 'pt', hint: 'That point is on side ' + t('WX') + ', but not on the trail ' + t('y=' + (k === 1 ? '' : k) + 'x') + '.' };
              return null;
            } }), ptT(X), t('X') + ' is on the trail and on side ' + t('WX') + ', so ' + t((k === 1 ? '' : k) + 'x=' + lin([[fv(mp), 'x'], [bW, '']])) + '.<br>' + t(lin([[k - fv(mp), 'x']]) + '=' + nT(bW)) + ', so ' + t('x=' + X[0]) + ' and ' + t('y=' + k + '(' + X[0] + ')=' + X[1]) + '.<br>' + t('X' + ptT(X)) + '. Verify: trail ' + t(k + '(' + X[0] + ')=' + X[1]) + ' ✓, side ' + t('WX') + ': ' + t(mT(mp) + '(' + X[0] + ')' + (bW ? (bW > 0 ? '+' : '') + nT(bW) : '') + '=' + X[1]) + ' ✓',
              ['' + t('X') + ' is on both lines: the trail and side ' + t('WX') + '. Set the two expressions for ' + t('y') + ' equal.', 'Solve for ' + t('x') + ', then find ' + t('y') + ' from the trail.'], 'campground corner X', { keys: 'pairs', placeholder: 'e.g. (2, 4)' });
            p.bad = [ptT(sh.W), ptT([X[1], X[0]])];
            return p;
          } }] },
      { num: '18', stem: function (sh) { return 'A customer with a fixed amount of store credit can buy ' + t(sh.p1[0]) + (sh.p1[0] === 1 ? ' notebook and ' : ' notebooks and ') + t(sh.p1[1]) + ' pens, or ' + t(sh.p2[0]) + ' notebooks and ' + t(sh.p2[1]) + (sh.p2[1] === 1 ? ' pen' : ' pens') + '. A linear relationship exists between the number of notebooks, ' + t('x') + ', and the number of pens, ' + t('y') + ', that can be bought.'; },
        shared: function (r) {
          var pr = r.pick([[3, 2], [3, 2], [2, 1], [5, 2], [4, 3], [5, 3], [3, 1]]), a = pr[0], b = pr[1], x1 = r.int(1, 4), y1 = a + r.int(1, 3);
          return { a: a, b: b, p1: [x1, y1], p2: [x1 + b, y1 - a] };
        },
        parts: [
          { id: '18a', level: 'EMG', outcome: 'RF4', make: function (r, sh) {
            var p = K.P.pairs('Write the coordinates of two points which lie on the graph of this linear relationship.', [sh.p1, sh.p2], {}, 'Each purchase is a point ' + t('(x,\\ y)=(\\text{notebooks},\\ \\text{pens})') + ': ' + t(ptT(sh.p1)) + ' and ' + t(ptT(sh.p2)) + '.', ['Notebooks are ' + t('x') + ' (first), pens are ' + t('y') + ' (second).'], 'store credit points');
            p.good = ['(' + sh.p2.join(',') + '),(' + sh.p1.join(',') + ')']; p.bad = ['(' + sh.p1[1] + ',' + sh.p1[0] + '),(' + sh.p2[1] + ',' + sh.p2[0] + ')'];
            return p;
          } },
          { id: '18b', level: 'ADV', make: function (r, sh) {
            var m = slope2(sh.p1, sh.p2);
            return genPart('Determine the equation of the linear relationship, in general form.', m, sh.p1, 'store credit general form', {
              pre: slopeSteps(sh.p1, sh.p2) + '<br>', noPs: true, wrong: [{ is: { m: slope2([sh.p1[1], sh.p1[0]], [sh.p2[1], sh.p2[0]]), point: [sh.p1[1], sh.p1[0]] }, code: 'pairs-flip', hint: 'Notebooks are ' + t('x') + ' and pens are ' + t('y') + ' — your line uses the points backwards.' }],
              hints: ['Use the two points from (a): find the slope, then slope–point form.', 'Clear the fraction and write ' + t('Ax+By+C=0') + '.'] });
          } }] },
      { num: '19', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '19', level: 'EMG', make: function (r) {
          var A = r.int(2, 5), B = r.pick([2, 3, 4, 5].filter(function (b) { return b !== A && coprime(A, b); })), c = r.int(1, 12), G = [A, -B, c], p = [r.int(2, 6), r.int(-9, -3)], mp = Fr(-B, A);
          var o = [psT(mp, p), psT(Fr(B, A), [p[0], -p[1]]), psT(mp, [-p[0], 0]), psT(Fr(-A, B), p)];
          return mcPart(r, 'The equation of the line through the point ' + t(ptT(p)) + ' and perpendicular to the line with equation ' + t(gT(G)) + ' can be written in the form', [
            eqOpt(o[0], true), eqOpt(o[1], false, 'Two slips: ' + t('y_1=' + p[1]) + ' gives ' + t('y+' + (-p[1])) + ', and the perpendicular slope must be negative here.'),
            eqOpt(o[2], false, 'This equation uses the point ' + t(ptT([-p[0], 0])) + ', not ' + t(ptT(p)) + '.'),
            eqOpt(o[3], false, 'This changes only the sign of the given slope. A perpendicular slope is the <b>negative reciprocal</b>: flip it too.')],
            givenSlopeT(G) + ' Perpendicular slope: ' + t(mT(mp)) + '.<br>Using ' + t(ptT(p)) + ': ' + t(rawT(mp, p)) + ', i.e. ' + t(o[0]) + '.', ['Find the slope of the given line, then take its negative reciprocal.', 'Then substitute the point into ' + t('y-y_1=m(x-x_1)') + ' carefully.'], 'MC perpendicular slope-point', false, true);
        } }] },
      { num: '20', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '20', level: 'EMG', make: function (r) {
          var k = r.int(2, 4), c = r.int(1, 8), b = -r.int(2, 7), G = [1, -k, -c];
          return mcPart(r, 'A line passing through the point ' + t(ptT([0, b])) + ' is perpendicular to the line ' + t(gT(G)) + '. The equation of the line is', [
            eqOpt(gT([k, 1, -b]), true),
            eqOpt(gT([k, 1, b]), false, 'This line passes through ' + t(ptT([0, -b])) + ', not ' + t(ptT([0, b])) + '. Check the sign of the constant.'),
            eqOpt(gT([1, -k, k * b]), false, 'This line has slope ' + t(mT([1, k])) + ' — the same as the given line, so it is parallel, not perpendicular.'),
            eqOpt(gT([k, -1, -b]), false, 'This line has slope ' + t(k) + ' (not the negative reciprocal) and passes through ' + t(ptT([0, -b])) + '.')],
            givenSlopeT(G) + ' Perpendicular slope: ' + t(-k) + '.<br>' + t('y-' + paren(b) + '=' + (-k) + '(x-0)') + ', so ' + t(lin([[1, 'y'], [-b, '']]) + '=' + (-k) + 'x') + ', i.e. ' + t(gT([k, 1, -b])) + '.', ['The point is the ' + t('y') + '-intercept. The slope is the negative reciprocal of the given line’s slope.'], 'MC perpendicular through y-int', false, true);
        } }] },
      { num: '21', stem: '<i>(Multiple Choice)</i>', outcome: 'RF6', parts: [
        { id: '21', level: 'PRG', make: function (r) {
          var q = r.pick([2, 3]), b = r.int(2, 5), j = r.pick([1, 2]), xi = b * q, m = [-1, q], odd = r.int(0, 3), pA = [-q * j, b + j];
          var reps = [
            { ok: t(psT(m, pA)), bad: t(psT(m, [q * j, b + j])), conv: t(psT(m, pA)) + ' expands to ' + t(siT(m, pA)) },
            { ok: t(gT([1, q, -q * b])), bad: t(gT([1, q, q * b])), conv: t(gT([1, q, -q * b])) + ' gives ' + t(q + 'y=-x+' + q * b) + ', ' + t(siT(m, pA)) },
            { ok: 'the line passing through ' + t(ptT([0, b])) + ' and ' + t(ptT([xi, 0])), bad: 'the line passing through ' + t(ptT([0, xi])) + ' and ' + t(ptT([b, 0])), conv: 'through ' + t(ptT([0, b])) + ' and ' + t(ptT([xi, 0])) + ': slope ' + t('\\frac{0-' + b + '}{' + xi + '-0}=' + mT(m)) + ', intercept ' + t(b) },
            { ok: t(siT(m, pA)), bad: t('y=' + lin([[-1 / q, 'x'], [b - 1, '']])), conv: t(siT(m, pA)) }];
          var oddConv = ['the odd one expands to ' + t('y=' + lin([[-1 / q, 'x'], [b - 2 * j, '']])), 'the odd one gives ' + t('y=' + lin([[-1 / q, 'x'], [-b, '']])), 'the odd one has slope ' + t('-' + q) + '', 'the odd one has ' + t('y') + '-intercept ' + t(b - 1)][odd];
          var opts = reps.map(function (rp, i) { return { html: i === odd ? rp.bad : rp.ok, right: i === odd, why: i === odd ? null : 'Convert it: ' + rp.conv + ' — the same line as most of the others. Look for the one that differs.' }; });
          return mcPart(r, 'Which of the following linear relations is <b>not</b> equivalent to the other three?', opts,
            'Write each one as ' + t('y=mx+b') + '. Three of them are ' + t(siT(m, pA)) + '; ' + oddConv + '.', ['Convert every option to slope–intercept form (find the slope and the ' + t('y') + '-intercept) and compare.'], 'MC not equivalent', true);
        } }] },
      { num: '22', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '22', level: 'BEG', make: function (r) {
          var p, m, b, vals;
          for (var i = 0; i < 100; i++) { p = [r.int(2, 5), r.int(2, 6)]; m = r.int(-4, -2); b = bOf(m, p); vals = [b, -b, p[1] + m * p[0], p[1] + m]; if (distinctTex(vals.map(String)) && vals.every(function (v) { return v !== 0; })) break; }
          var whys = [null, 'Check the sign: ' + t('b=y_1-mx_1=' + p[1] + '-(' + m + ')(' + p[0] + ')') + '.', 'That’s ' + t('y_1+mx_1') + '. Solve ' + t(p[1] + '=' + m + '(' + p[0] + ')+b') + ' for ' + t('b') + ': subtract ' + t(m * p[0]) + ' from both sides.', 'Multiply the slope by ' + t('x_1=' + p[0]) + ': ' + t(p[1] + '=' + m + '(' + p[0] + ')+b') + '.'];
          var opts = vals.map(function (v, i) { return { v: v, html: t(v), right: i === 0, why: whys[i] }; }).sort(function (a, c) { return a.v - c.v; });
          return mcPart(r, 'The point ' + t(ptT(p)) + ' lies on a line with slope ' + t(m) + '. The ' + t('y') + '-intercept of the line is', opts,
            'Substitute into ' + t('y=mx+b') + ': ' + t(p[1] + '=' + m + '(' + p[0] + ')+b') + ', so ' + t(p[1] + '=' + m * p[0] + '+b') + ' and ' + t('b=' + b) + '.', ['Substitute ' + t('m') + ' and the point into ' + t('y=mx+b') + ' and solve for ' + t('b') + '.'], 'MC y-int from point & slope', true, true);
        } }] },
      { num: '23', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '23', level: 'PRG', make: function (r) {
          var m, c, x1, x2, y1, y2;
          for (var i = 0; i < 100; i++) { m = r.int(-5, -2); c = r.int(-12, -3); x1 = r.int(-6, -3); x2 = x1 + r.pick([2, 3]); y1 = m * x1 + c; y2 = m * x2 + c; if (Math.abs(y1) <= 20 && Math.abs(y2) <= 20 && -m - c > 0) break; }
          var a = -m, bb = -c, ans = a + bb;
          return K.P.nr('The line through the points ' + t(ptT([x1, y1])) + ' and ' + t(ptT([x2, y2])) + ' has equation ' + t('y+ax+b=0') + ', where ' + t('a') + ' and ' + t('b') + ' are integers. The value of ' + t('a+b') + ' is ________.', ans, function (v) {
            if (v === a) return { code: 'nr-part', hint: 'That’s ' + t('a') + ' alone. Add ' + t('b') + '.' };
            if (v === bb) return { code: 'nr-part', hint: 'That’s ' + t('b') + ' alone. Add ' + t('a') + '.' };
            if (v === Math.abs(a - bb) || v === -(m + c) + 2 * m || v === Math.abs(m + c)) return { code: 'nr-sign', hint: 'Check the signs: in ' + t('y+ax+b=0') + ', ' + t('a') + ' is the opposite of the slope and ' + t('b') + ' the opposite of the ' + t('y') + '-intercept.' };
            return null;
          }, slopeSteps([x1, y1], [x2, y2]) + '<br>' + t(psT(m, [x1, y1])) + ', so ' + t('y=' + lin([[m, 'x'], [c, '']])) + ' and ' + t('y' + coefT(-m, 'x') + coefT(-c, '') + '=0') + '.<br>' + t('a=' + a) + ', ' + t('b=' + bb) + ', ' + t('a+b=' + ans) + '. (Check ' + t(ptT([x2, y2])) + ': ' + t(y2 + '+' + a + '(' + x2 + ')+' + bb + '=0') + ' ✓)',
          ['Find the slope, write the equation, then move every term to the left so it reads ' + t('y+ax+b=0') + '.'], 'NR y+ax+b');
        } }] },
      { num: '24', stem: function (sh) { return 'Ana and Ben each wrote an equation for the line through ' + t(ptT(sh.P)) + ' and ' + t(ptT(sh.Q)) + '. Ana wrote ' + t(psT(sh.m, sh.P)) + ' and Ben wrote ' + t(psT(sh.m, sh.Q)) + '.'; },
        outcome: 'RF6',
        shared: function (r) { var m = r.pick([2, 3, -2, 2, 4]), P = [r.int(1, 4), r.int(1, 6)], d = r.int(3, 4), Q = [P[0] - d, P[1] - m * d]; return { m: m, P: P, Q: Q }; },
        parts: [
          { id: '24a', level: 'EMG', make: function (r, sh) {
            return mcPart(r, 'Why are both equations correct?', [
              { html: 'Both use the slope of the line, ' + t(sh.m) + ', and a point that is on the line; slope–point form works with <b>any</b> point on the line.', right: true },
              { html: 'They aren’t: only Ana is right, because slope–point form must use the first point given.', why: 'Any point on the line can be ' + t('(x_1,\\ y_1)') + '. Ben used the second point, which is on the line too.' },
              { html: 'They describe two different lines with the same slope, so both are parallel to the line.', why: 'A slope and one point fix exactly <b>one</b> line. Both points are on the line, so both equations describe it.' },
              { html: 'Any equation with slope ' + t(sh.m) + ' describes this line.', why: 'Slope alone isn’t enough: ' + t('y=' + sh.m + 'x+' + (bOf(sh.m, sh.P) + 10)) + ' has slope ' + t(sh.m) + ' but misses the points.' }],
              'The slope is ' + slopeSteps(sh.P, sh.Q) + ', and both students used it. Ana used ' + t(ptT(sh.P)) + ' and Ben used ' + t(ptT(sh.Q)) + ' — both on the line — so both equations describe the same line.', ['How many lines have a given slope and pass through a given point?'], 'why both slope-point eqns correct');
          } },
          { id: '24b', level: 'EMG', make: function (r, sh) {
            var p = siPart('Verify that both equations simplify to the same equation in slope–intercept form: type that equation.', sh.m, sh.P, 'Ana & Ben slope-intercept');
            p.solution = 'Ana: ' + siSteps(sh.m, sh.P) + '<br>Ben: ' + siSteps(sh.m, sh.Q) + '<br>Both give ' + t(siT(sh.m, sh.P)) + ' ✓';
            return p;
          } }] }
    ],
    extra: [
      { num: '1', section: 'Extra practice A — Substituting before simplifying: the sign traps', stem: 'State the equation of each line in slope–point form. (You may type the raw substitution, like ' + t('y-(-3)=4(x-(-5))') + ', or the tidy version.)', parts: [
        { id: 'e1a', level: 'BEG', make: function (r) { var p = [r.int(-9, -2), r.int(-9, -2)], m = r.int(2, 6); return psPart(t(ptT(p)) + ', slope ' + t(m), m, p, 'slope-point ' + ptT(p) + ' m=' + m); } },
        { id: 'e1b', level: 'EMG', make: function (r) { var p = [r.int(-6, -1), r.int(2, 9)], m = improperFr(r, [2, 3, 4], -1, 7); return psPart(t(ptT(p)) + ', slope ' + t(mT(m)), m, p, 'slope-point ' + ptT(p) + ' m=' + mT(m)); } },
        { id: 'e1c', level: 'BEG', make: function (r) { var p = [r.int(2, 9), r.int(-12, -5)]; return psPart(t(ptT(p)) + ', slope ' + t(-1), -1, p, 'slope-point ' + ptT(p) + ' m=-1', 'A slope of ' + t('-1') + ' can be written as just a minus sign: ' + t('-(x-x_1)') + '.'); } },
        { id: 'e1d', level: 'EMG', make: function (r) { var p = [r.int(-9, -2), 0], m = properFr(r, [5, 7], 1, 2); return psPart(t(ptT(p)) + ', slope ' + t(mT(m)), m, p, 'slope-point ' + ptT(p) + ' m=' + mT(m)); } },
        { id: 'e1e', level: 'BEG', make: function (r) { var p = [0, r.int(-9, -2)], m = r.int(-7, -2); return psPart(t(ptT(p)) + ', slope ' + t(m), m, p, 'slope-point ' + ptT(p) + ' m=' + m); } },
        { id: 'e1f', level: 'EMG', make: function (r) { var p = [r.pick([1, 3, 5]) / 2, -r.pick([1, 3, 5, 7]) / 2], m = r.int(2, 9); return psPart(t('\\left(' + nT(p[0]) + ',\\ ' + nT(p[1]) + '\\right)') + ', slope ' + t(m), m, p, 'slope-point ' + ptT(p) + ' m=' + m); } }] },
      { num: '2', stem: 'Each equation is already in slope–point form. State (i) the slope, (ii) the point ' + t('(x_1,\\ y_1)') + ' that was used, (iii) <b>one other point</b> on the line, found by stepping off the slope, and (iv) the ' + t('y') + '-intercept as an ordered pair.', outcome: 'RF6', parts: [
        { id: 'e2a', level: 'EMG', make: function (r) { var m = properFr(r, [3, 4, 5], 1, 2), k = r.pick([1, 2, 3].filter(function (j) { return m[1] * j <= 12; })); return fourPart(m, [m[1] * k, r.int(-9, -2)]); } },
        { id: 'e2b', level: 'EMG', make: function (r) { var m, k, y1; do { m = improperFr(r, [2, 3], -1, 5); k = r.pick([1, 2, 3].filter(function (j) { return m[1] * j <= 10; })); y1 = r.int(1, 6); } while (y1 === -m[0] * k); return fourPart(m, [-m[1] * k, y1]); } },
        { id: 'e2c', level: 'PRG', make: function (r) { var q = r.int(3, 5), m = [-1, q], k = r.pick([1, 2, 3].filter(function (j) { return q * j <= 12; })); return fourPart(m, [-q * k, r.int(4, 9)]); } },
        { id: 'e2d', level: 'PRG', make: function (r) { return fourPart(r.int(2, 4), [r.pick([1, 3, 5]) / 2, -r.pick([1, 3, 5]) / 2]); } }] },
      { num: '3', section: 'Extra practice B — Either point works', stem: function (sh) { return 'A line passes through ' + t('A' + ptT(sh.A)) + ' and ' + t('B' + ptT(sh.B)) + '.'; },
        shared: function (r) {
          for (var i = 0; i < 200; i++) {
            var mm = r.pick([[-1, 1], [-1, 1], [1, 1], [-2, 1], [2, 1], [-1, 2], [1, 2], [-3, 2], [2, 3], [-2, 3]]), k = r.int(1, 3), dx = 2 * mm[1] * k, dy = 2 * mm[0] * k;
            if (Math.abs(dx) > 12 || Math.abs(dy) > 12) continue;
            var A = [r.int(-6, -2), r.int(-6, 9)], B = [A[0] + dx, A[1] + dy];
            if (B[1] < -9 || B[1] > 12 || B[0] > 9) continue;
            if (r.chance(0.15)) { A = [-4, 9]; B = [6, -1]; mm = [-1, 1]; }
            return { A: A, B: B, M: [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2], m: Fr(B[1] - A[1], B[0] - A[0]) };
          }
          return { A: [-4, 9], B: [6, -1], M: [1, 4], m: [-1, 1] };
        },
        parts: [
          { id: 'e3a', level: 'BEG', outcome: 'RF5', make: function (r, sh) {
            var p = K.P.slope('Determine the slope of ' + t('AB') + '. (Do this first — slope–point form can’t start without it.)', sh.m, { diag: function (v) { var dy = sh.B[1] - sh.A[1], dx = sh.B[0] - sh.A[0]; if (near(v, dy)) return { code: 'rate-dy', hint: 'Divide the rise by the run: ' + t('m=\\frac{\\Delta y}{\\Delta x}') + '.' }; return null; } }, slopeSteps(sh.A, sh.B), ['Slope = ' + t('\\frac{y_2-y_1}{x_2-x_1}') + '. Subtract the coordinates in the same order on top and bottom.'], 'slope of AB');
            p.bad = [nT(-fv(sh.m))]; return p;
          } },
          { id: 'e3b', level: 'BEG', make: function (r, sh) { var p = psPart('Write the slope–point equation of the line using ' + t('A') + ' as ' + t('(x_1,\\ y_1)') + '.', sh.m, sh.A, 'slope-point with A'); p.solution = t('m=' + mT(sh.m)) + ' from (a). ' + p.solution; return p; } },
          { id: 'e3c', level: 'BEG', make: function (r, sh) { var p = psPart('Write the slope–point equation of the line using ' + t('B') + ' as ' + t('(x_1,\\ y_1)') + '.', sh.m, sh.B, 'slope-point with B'); p.solution = t('m=' + mT(sh.m)) + ' from (a). ' + p.solution; return p; } },
          { id: 'e3d', level: 'PRG', outcome: 'RF6', make: function (r, sh) {
            var p = genPart('Convert your two answers to general form, ' + t('Ax+By+C=0') + '. (They should agree.) Type the general form.', sh.m, sh.A, 'general form of AB');
            p.solution = 'From (b): ' + genSteps(sh.m, sh.A, true) + '<br>From (c): ' + genSteps(sh.m, sh.B, true) + '<br>Identical.'; return p;
          } },
          { id: 'e3e', level: 'EMG', outcome: 'RF6', make: function (r, sh) {
            return mcPart(r, 'Your two slope–point equations don’t look alike. Why must they still describe the same line?', [
              { html: 'Both use the same slope and a point that is on the line; a slope and one point fix exactly one line.', right: true },
              { html: 'Any two equations with the same slope describe the same line.', why: 'Parallel lines have the same slope too. The slope <b>and</b> a point on the line are needed.' },
              { html: 'They don’t — the line through ' + t('A') + ' and the line through ' + t('B') + ' are parallel lines.', why: 'Both ' + t('A') + ' and ' + t('B') + ' are on the <b>same</b> line, so the equations describe that one line — part (d) confirms it.' },
              { html: 'Because ' + t('A') + ' and ' + t('B') + ' have the same ' + t('y') + '-intercept.', why: 'Points don’t have intercepts — lines do. Think about what a slope and one point determine.' }],
              'Both equations use the slope ' + t(mT(sh.m)) + ' and each uses a point on line ' + t('AB') + '. A slope and one point determine exactly one line, so they are rearrangements of the same line.', ['How many lines have a given slope and pass through a given point?'], 'why two slope-point eqns agree');
          } },
          { id: 'e3f', level: 'PRG', make: function (r, sh) {
            var p = psPart('The midpoint ' + t('M') + ' of ' + t('AB') + ' is also on the line. Find ' + t('M') + ' and write a <b>third</b> slope–point equation using ' + t('M') + ' as ' + t('(x_1,\\ y_1)') + '.', sh.m, sh.M, 'slope-point with midpoint');
            p.solution = t('M=\\left(\\frac{' + sh.A[0] + '+' + paren(sh.B[0]) + '}{2},\\ \\frac{' + sh.A[1] + '+' + paren(sh.B[1]) + '}{2}\\right)=' + ptT(sh.M)) + '<br>' + p.solution + '<br>In general form it is ' + t(gT(genABC({ m: sh.m, point: sh.M }))) + ' — the same line.';
            p.hints = ['Midpoint: average the ' + t('x') + '-coordinates and average the ' + t('y') + '-coordinates.'].concat(PS_HINTS);
            return p;
          } }] },
      { num: '4', stem: function (sh) { return 'Four slope–point equations are given. Three of them describe the <b>same</b> line; one does not.<br>' + sh.eqs.map(function (e, i) { return '(' + 'abcd'[i] + ') ' + t(e); }).join('<br>'); },
        outcome: 'RF6',
        shared: function (r) {
          for (var g = 0; g < 200; g++) {
            var m = properFr(r, [3, 4, 5], r.pick([1, -1]), 1), u = r.int(-3, 6), v = r.int(-6, 6), js = r.sample([-2, -1, 0, 1, 2], 4), odd = r.int(0, 3), s = r.pick([-11, -9, -7, -5, 3, 5, 7, 9, 11]);
            var pts = js.map(function (j, i) { return [u + m[1] * j, v + m[0] * j + (i === odd ? s : 0)]; });
            if (!pts.every(function (p) { return Math.abs(p[0]) <= 9 && Math.abs(p[1]) <= 9; })) continue;
            if (r.chance(0.15)) { m = [2, 3]; pts = [[3, -2], [6, 0], [-3, -6], [-3, 5]]; odd = 3; }
            return { m: m, pts: pts, odd: odd, eqs: pts.map(function (p) { return psT(m, p); }), G: genABC({ m: m, point: pts[(odd + 1) % 4] }), Go: genABC({ m: m, point: pts[odd] }) };
          }
          return { m: [2, 3], pts: [[3, -2], [6, 0], [-3, -6], [-3, 5]], odd: 3, eqs: [[3, -2], [6, 0], [-3, -6], [-3, 5]].map(function (p) { return psT([2, 3], p); }), G: [2, -3, -12], Go: [2, -3, 21] };
        },
        parts: [
          { id: 'e4e', sub: 'e', level: 'PRG', make: function (r, sh) {
            var opts = [0, 1, 2, 3].map(function (i) { return { html: '(' + 'abcd'[i] + ') ' + t(sh.eqs[i]), right: i === sh.odd, why: i === sh.odd ? null : 'Convert (' + 'abcd'[i] + ') to general form: it gives ' + t(gT(sh.G)) + ', like two of the others. Look for the one that gives a different general form.' }; });
            return mcPart(r, 'Convert all four to general form. Which is the odd one out?', opts, [0, 1, 2, 3].map(function (i) { return '(' + 'abcd'[i] + ') ' + t(sh.eqs[i]) + ' → ' + t(gT(i === sh.odd ? sh.Go : sh.G)); }).join('<br>') + '<br>The odd one out is <b>(' + 'abcd'[sh.odd] + ')</b>.', ['Multiply each by the denominator ' + t(sh.m[1]) + ', expand and collect every term on one side.'], 'odd one out of four slope-point', true);
          } },
          { id: 'e4e2', sub: 'e2', level: 'EMG', make: function (r, sh) {
            var p0 = sh.pts[sh.odd];
            return genPart('Write the odd equation, ' + t(sh.eqs[sh.odd]) + ', in general form.', sh.m, p0, 'general form of odd slope-point');
          } },
          { id: 'e4f', sub: 'f', level: 'EMG', make: function (r, sh) {
            var p0 = sh.pts[sh.odd];
            return mcPart(r, 'Exactly one ingredient — the slope or the point — differs in the odd equation. How is the odd line related to the other three?', [
              { html: 'The slope is the same but its point is not on the other line, so the odd line is <b>parallel</b> to the other three.', right: true },
              { html: 'The slope differs, so the odd line crosses the others.', why: 'Look again: all four equations have the slope ' + t(mT(sh.m)) + '.' },
              { html: 'The point differs, so the odd line is perpendicular to the others.', why: 'Perpendicular lines need negative-reciprocal slopes. These slopes are equal.' },
              { html: 'It is the same line, just written with a different point.', why: 'Test its point ' + t(ptT(p0)) + ' in ' + t(gT(sh.G)) + ': it doesn’t give 0, so it isn’t on that line.' }],
              'All four have slope ' + t(mT(sh.m)) + ', so the point is what differs: ' + t(ptT(p0)) + ' is not on ' + t(gT(sh.G)) + '. Same slope, different line: the odd line is <b>parallel</b> to the other three (' + t(gT(sh.Go)) + ').', ['Compare the slopes of the four equations first.'], 'odd line relationship');
          } }] },
      { num: '5', section: 'Extra practice C — One line, all three forms', stem: function (sh) { return 'A line passes through ' + t(ptT(sh.P)) + ' and ' + t(ptT(sh.Q)) + '.'; },
        shared: function (r) {
          for (var i = 0; i < 200; i++) {
            var q = r.pick([2, 3]), p = r.pick([1, 1, 2].filter(function (x) { return coprime(x, q); })), sg = r.pick([-1, -1, 1]), m = [sg * p, q], b = r.pick([-5, -4, -3, -2, 2, 3, 4]), j1 = r.pick([-4, -3, -2]), j2 = r.pick([1, 2]);
            var P = [q * j1, sg * p * j1 + b], Q = [q * j2, sg * p * j2 + b];
            if (Math.abs(P[0]) <= 12 && Math.abs(P[1]) <= 12 && Math.abs(Q[1]) <= 12) { if (r.chance(0.15)) return { m: [-1, 2], P: [-8, 1], Q: [4, -5] }; return { m: m, P: P, Q: Q }; }
          }
          return { m: [-1, 2], P: [-8, 1], Q: [4, -5] };
        },
        parts: [
          { id: 'e5a', level: 'EMG', make: function (r, sh) {
            var p = line('Write its equation in <b>slope–point form</b>, ' + t('y-y_1=m(x-x_1)') + '. (Use either point.)', { m: sh.m, point: sh.P }, { form: 'point-slope', keyTex: psT(sh.m, sh.P), wrong: psWrongs(sh.m, sh.P) }, slopeSteps(sh.P, sh.Q) + '<br>Using ' + t(ptT(sh.P)) + ': ' + t(psT(sh.m, sh.P)) + '<br>(Using ' + t(ptT(sh.Q)) + ' gives ' + t(psT(sh.m, sh.Q)) + ' — also right.)', ['Find the slope first, then substitute it and one of the points.'], 'slope-point through two points', [psT(sh.m, sh.Q)], [siT(sh.m, sh.P)]);
            return p;
          } },
          { id: 'e5b', level: 'PRG', outcome: 'RF6', make: function (r, sh) { return siPart('Rearrange your answer into <b>slope–intercept form</b>, ' + t('y=mx+b') + '.', sh.m, sh.P, 'two points → slope-intercept'); } },
          { id: 'e5c', level: 'PRG', outcome: 'RF6', make: function (r, sh) { return genPart('Clear the fraction and write it in <b>general form</b>, ' + t('Ax+By+C=0') + ', with ' + t('A') + ' positive.', sh.m, sh.P, 'two points → general'); } },
          { id: 'e5d', level: 'LIM', outcome: 'RF6', make: function (r, sh) { return formsMC(r, 'Which of the three forms shows you a point on the line <b>and</b> the slope with no work at all?', 0, sh); } },
          { id: 'e5e', level: 'LIM', outcome: 'RF6', make: function (r, sh) { return formsMC(r, 'Which form hands you the ' + t('y') + '-intercept with no work at all?', 1, sh); } },
          { id: 'e5f', level: 'BEG', outcome: 'RF6', make: function (r, sh) {
            return mcPart(r, 'Which form has no fractions anywhere, and which form is the only one of the three that a <b>vertical</b> line can be written in?', [
              { html: 'General form for both: a vertical line ' + t('x=a') + ' is ' + t('x-a=0') + ', general form with ' + t('B=0') + '.', right: true },
              { html: 'General form has no fractions; slope–point form is the only one for a vertical line.', why: 'Slope–point form needs a value of ' + t('m') + ', and a vertical line’s slope is undefined.' },
              { html: 'Slope–intercept form for both.', why: t('y=mx+b') + ' often has fractional ' + t('m') + ', and it needs a slope — a vertical line has none.' },
              { html: 'General form has no fractions; none of the three forms can describe a vertical line.', why: 'Try writing ' + t('x=3') + ' as ' + t('Ax+By+C=0') + ': ' + t('1x+0y-3=0') + '.' }],
              'General form has whole-number coefficients: ' + t(gT(genABC({ m: sh.m, point: sh.P }))) + '. A vertical line has an undefined slope, so neither ' + t('y=mx+b') + ' nor ' + t('y-y_1=m(x-x_1)') + ' can describe it, but ' + t('x=a') + ' is ' + t('x-a=0') + ': general form with ' + t('B=0') + '.', ['What is the slope of a vertical line? Which forms need a slope?'], 'forms: fractions & vertical');
          } }] },
      { num: '6', section: 'Extra practice D — Indirect descriptions: decode first, substitute second', stem: 'Determine the equation of each line in general form, ' + t('Ax+By+C=0') + '. Write down the slope and the point you extracted before you use the formula.', parts: [
        { id: 'e6a', level: 'PRG', make: function (r) {
          var A, B, m;
          for (var i = 0; i < 100; i++) { A = [r.int(-5, -1), r.int(4, 10)]; B = [A[0] + 2 * r.int(3, 6), A[1] - 2 * r.int(2, 6)]; m = r.pick([-3, -2, -2, 2, 3]); if (B[0] <= 10 && B[1] >= -6) break; }
          var M = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
          return genPart('through the midpoint of ' + t('A' + ptT(A)) + ' and ' + t('B' + ptT(B)) + ', with slope ' + t(m), m, M, 'midpoint & slope', {
            pre: t('M=\\left(\\frac{' + A[0] + '+' + paren(B[0]) + '}{2},\\ \\frac{' + A[1] + '+' + paren(B[1]) + '}{2}\\right)=' + ptT(M)) + ', ' + t('m=' + m) + '.<br>',
            wrong: [{ is: { m: m, point: A }, code: 'used-endpoint', hint: 'That line goes through ' + t('A') + '. The line goes through the <b>midpoint</b> of ' + t('AB') + '.' }, { is: { m: m, point: B }, code: 'used-endpoint', hint: 'That line goes through ' + t('B') + '. The line goes through the <b>midpoint</b> of ' + t('AB') + '.' }, { is: { m: slope2(A, B), point: M }, code: 'line', hint: 'Use the given slope ' + t(m) + ' — not the slope of ' + t('AB') + '.' }],
            hints: ['Find the midpoint first: average the ' + t('x') + '-values and the ' + t('y') + '-values.', 'Then slope–point form with ' + t('m=' + m) + '.'] });
        } },
        { id: 'e6b', level: 'ADV', make: function (r) {
          var c = r.int(2, 6), d = r.pick([3, 4, 5, 6, 8].filter(function (x) { return x !== c; })), mg = Fr(-c, d), mp = Fr(d, c), p = [r.int(1, 5), r.int(-5, -1)];
          return genPart('through ' + t(ptT(p)) + ', perpendicular to the line through ' + t(ptT([0, c])) + ' and ' + t(ptT([d, 0])), mp, p, 'perp to line through intercepts', {
            pre: 'Given line: ' + slopeSteps([0, c], [d, 0]) + '. Negative reciprocal: ' + t('m_{\\perp}=' + mT(mp)) + '.<br>',
            wrong: [{ is: { m: mg, point: p }, code: 'used-given', hint: 'That’s the slope of the given line — your line must be <b>perpendicular</b> to it: use the negative reciprocal.' }],
            hints: ['Find the slope of the line through the two given points, then take its negative reciprocal.'] });
        } },
        { id: 'e6c', level: 'PRG', make: function (r) {
          var a = r.int(2, 7), k = r.int(2, 6), b = r.pick([2, 3, 4, 5].filter(function (x) { return coprime(x, a); })), G = [a, -b, -a * k], mpar = properFr(r, [3, 4, 5], 1, 1);
          return genPart('through the ' + t('x') + '-intercept of ' + t(gT(G)) + ', parallel to ' + t('y=' + mT(mpar) + 'x'), mpar, [k, 0], 'x-int of line, parallel', {
            pre: t('x') + '-intercept: ' + t('y=0') + ', ' + t(a + 'x=' + a * k) + ', ' + t('x=' + k) + '; point ' + t(ptT([k, 0])) + '. Parallel to ' + t('y=' + mT(mpar) + 'x') + ': ' + t('m=' + mT(mpar)) + '.<br>',
            wrong: [{ is: { m: mpar, point: [0, -a * k / b] }, code: 'used-yint', hint: 'You used the ' + t('y') + '-intercept of ' + t(gT(G)) + '. The ' + t('x') + '-intercept comes from setting ' + t('y=0') + '.' }, { is: { m: Fr(-mpar[1], mpar[0]), point: [k, 0] }, code: 'used-perp', hint: 'Parallel lines have the <b>same</b> slope.' }],
            hints: ['Set ' + t('y=0') + ' in ' + t(gT(G)) + ' to find the point.', 'A line parallel to ' + t('y=' + mT(mpar) + 'x') + ' has the same slope.'] });
        } }] },
      { num: '7', stem: 'Determine the equation of each line in general form, ' + t('Ax+By+C=0') + '.', parts: [
        { id: 'e7a', level: 'ADV', make: function (r) {
          var a = r.int(2, 5), b = r.pick([3, 4, 5, 7, 8].filter(function (x) { return coprime(x, a); })), k = r.int(2, 5), G = [a, -b, b * k];
          var u = r.int(2, 4), v = r.pick([3, 5, 6].filter(function (x) { return coprime(x, u) && x !== u; })), G2 = [u, v, -v * r.int(1, 3)], mp = Fr(v, u);
          return genPart('through the ' + t('y') + '-intercept of ' + t(gT(G)) + ', perpendicular to ' + t(gT(G2)), mp, [0, k], 'y-int of one line, perp to another', {
            pre: t('y') + '-intercept: ' + t('x=0') + ', ' + t(-b + 'y+' + b * k + '=0') + ', ' + t('y=' + k) + '; point ' + t(ptT([0, k])) + '.<br>' + givenSlopeT(G2) + ' ' + t('m_{\\perp}=' + mT(mp)) + '.<br>',
            wrong: [{ is: { m: mp, point: [-b * k / a, 0] }, code: 'used-xint', hint: 'You used the ' + t('x') + '-intercept of ' + t(gT(G)) + '. For the ' + t('y') + '-intercept set ' + t('x=0') + '.' }, { is: { m: Fr(-u, v), point: [0, k] }, code: 'used-given', hint: 'That line is parallel to ' + t(gT(G2)) + '. Use the negative reciprocal of its slope.' }, { is: { m: Fr(u, v), point: [0, k] }, code: 'perp-recip-only', hint: 'Check the perpendicular slope: change the sign <b>and</b> flip the fraction of ' + t(mT(Fr(-u, v))) + '.' }],
            hints: ['The point: set ' + t('x=0') + ' in the first equation. The slope: negative reciprocal of the second line’s slope.'] });
        } },
        { id: 'e7b', level: 'ADV', make: function (r) {
          var s = r.int(2, 5), c = r.int(-5, 8), h = r.int(-3, -1), p = [h, s * h + c], u = r.pick([1, 2, 3]), v = r.pick([2, 3, 4].filter(function (x) { return coprime(x, u) && x !== u; })), g = r.pick([2, 3]), G2 = [u * g, v * g, -v * g * r.int(1, 3)], m = Fr(-u, v);
          return genPart('through the point on ' + t('y=' + lin([[s, 'x'], [c, '']])) + ' whose ' + t('x') + '-coordinate is ' + t(h) + ', parallel to ' + t(G2[0] + 'x+' + G2[1] + 'y' + G2[2] + '=0'), m, p, 'point on a line, parallel', {
            pre: t('y=' + s + '(' + h + ')' + (c ? (c > 0 ? '+' : '') + c : '') + '=' + p[1]) + '; point ' + t(ptT(p)) + '.<br>' + t(G2[0] + 'x+' + G2[1] + 'y' + G2[2] + '=0') + ' gives ' + t('y=' + lin([[-u / v, 'x'], [-G2[2] / G2[1], '']])) + ', so ' + t('m=' + mT(m)) + '.<br>',
            wrong: [{ is: { m: Fr(v, u), point: p }, code: 'used-perp', hint: 'Parallel lines have the <b>same</b> slope — you used the negative reciprocal.' }, { is: { m: m, point: [0, c] }, code: 'pt', hint: 'Your line goes through ' + t(ptT([0, c])) + '. You need the point on ' + t('y=' + lin([[s, 'x'], [c, '']])) + ' where ' + t('x=' + h) + '.' }, { is: { m: Fr(u, v), point: p }, code: 'given-slope-sign', hint: 'Check the slope of the given line: solve for ' + t('y') + '.' }],
            hints: ['Substitute ' + t('x=' + h) + ' into ' + t('y=' + lin([[s, 'x'], [c, '']])) + ' to get the point.', 'Solve the other equation for ' + t('y') + ' to read its slope.'] });
        } },
        { id: 'e7c', level: 'MAS', make: function (r) {
          var M, e, f;
          for (var i = 0; i < 100; i++) { M = [r.int(2, 6), r.pick([-3, -2, -1, 1, 2, 3])]; e = r.int(2, 4); f = r.int(3, 7); if (Fr(M[1], M[0])[1] <= 6 && Math.abs(M[1] - f) <= 9 && Math.abs(M[1] + f) <= 9) break; }
          var C = [M[0] - e, M[1] - f], D = [M[0] + e, M[1] + f], mo = Fr(M[1], M[0]), mp = Fr(-mo[1], mo[0]), p = [r.int(-6, -2), r.int(1, 5)];
          return genPart('through ' + t(ptT(p)) + ', perpendicular to the line joining the origin to the midpoint of ' + t('C' + ptT(C)) + ' and ' + t('D' + ptT(D)), mp, p, 'perp to OM', {
            pre: t('M=\\left(\\frac{' + C[0] + '+' + paren(D[0]) + '}{2},\\ \\frac{' + C[1] + '+' + paren(D[1]) + '}{2}\\right)=' + ptT(M)) + '.<br>' + t('m_{OM}=\\frac{' + M[1] + '-0}{' + M[0] + '-0}=' + mT(mo)) + ', so ' + t('m_{\\perp}=' + mT(mp)) + '.<br>',
            wrong: [{ is: { m: mo, point: p }, code: 'used-given', hint: 'That line is parallel to ' + t('OM') + '. You need the negative reciprocal of its slope.' }, { is: { m: Fr(-(D[0] - C[0]), D[1] - C[1]), point: p }, code: 'line', hint: 'That line is perpendicular to ' + t('CD') + '. The question is about the line from the <b>origin</b> to the midpoint of ' + t('CD') + '.' }],
            hints: ['Step 1: the midpoint ' + t('M') + ' of ' + t('CD') + '. Step 2: the slope of ' + t('OM') + ' (from ' + t('(0,\\ 0)') + ' to ' + t('M') + '). Step 3: its negative reciprocal.'] });
        } }] },
      { num: '8', section: 'Extra practice E — From a grid', stem: function (sh) { return 'Two lines are drawn on the grid: ' + t('\\ell_1') + ' (teal) and ' + t('\\ell_2') + ' (orange). Each passes through its two marked lattice points.' + sh.pic; },
        shared: function (r) {
          var m1 = r.pick([[2, 1], [2, 1], [3, 1], [3, 2], [4, 3], [1, 2]]), perp = r.chance(0.4), m2;
          if (perp) m2 = Fr(-m1[1], m1[0]); else m2 = r.pick([[-3, 4], [-1, 3], [-2, 3], [-3, 2], [-1, 2], [-1, 1], [-4, 3]].filter(function (c) { return Fr(-m1[1], m1[0]).join() !== c.join(); }));
          var l1 = gridLine(r, m1, [-3, -2, -1, 1, 2, 3]), k = r.pick([1, 2].filter(function (j) { return m2[1] * j <= 6 && Math.abs(m2[0]) * j <= 6; })), l2 = { A: [-m2[1] * k, -m2[0] * k], B: [m2[1] * k, m2[0] * k] };
          if (!l1 || r.chance(0.15)) { m1 = [2, 1]; m2 = [-3, 4]; l1 = { A: [-3, -5], B: [2, 5] }; l2 = { A: [-4, 3], B: [4, -3] }; perp = false; }
          var pic = gridPic([{ G: lineG(l1.A, l1.B) }, { G: lineG(l2.A, l2.B), color: '#c4532a' }], [l1.A.concat([undefined]), l1.B.concat([undefined]), l2.A.concat([undefined, '#c4532a']), l2.B.concat([undefined, '#c4532a'])], [-7, 7], [-7, 7], 330);
          return { l1: l1, l2: l2, m1: Fr(m1[0], m1[1]), m2: Fr(m2[0], m2[1]), pic: pic };
        },
        parts: [
          { id: 'e8a', level: 'EMG', make: function (r, sh) { return twoPsPart(sh.l1, sh.m1, '\\ell_1'); } },
          { id: 'e8a2', sub: 'a2', level: 'PRG', make: function (r, sh) { var p = genPart('Give the general form of ' + t('\\ell_1') + '.', sh.m1, sh.l1.A, 'grid line 1 general'); return p; } },
          { id: 'e8b', level: 'EMG', make: function (r, sh) { return twoPsPart(sh.l2, sh.m2, '\\ell_2'); } },
          { id: 'e8b2', sub: 'b2', level: 'PRG', make: function (r, sh) { return genPart('Give the general form of ' + t('\\ell_2') + '.', sh.m2, sh.l2.A, 'grid line 2 general'); } },
          { id: 'e8c', level: 'EMG', outcome: 'RF5', make: function (r, sh) {
            var pr = Fr(sh.m1[0] * sh.m2[0], sh.m1[1] * sh.m2[1]);
            return K.P.fraction('The two lines clearly cross. State the product of their slopes, ' + t('m_1\\times m_2') + '.', pr, {}, t('m_1=' + mT(sh.m1)) + ', ' + t('m_2=' + mT(sh.m2)) + ', so ' + t('m_1\\times m_2=' + mT(sh.m1) + '\\times\\left(' + mT(sh.m2) + '\\right)=' + mT(pr)) + '.', ['Find each slope from its two marked points, then multiply.'], 'product of slopes');
          } },
          { id: 'e8c2', sub: 'c2', level: 'EMG', outcome: 'RF5', make: function (r, sh) {
            var pr = Fr(sh.m1[0] * sh.m2[0], sh.m1[1] * sh.m2[1]), perp = pr[0] === -1 && pr[1] === 1;
            return K.P.tf(r, 'True or false: ' + t('\\ell_1') + ' and ' + t('\\ell_2') + ' cross at ' + t('90^\\circ') + '.', perp, perp ? 'The product of the slopes is ' + t('-1') + ': that is exactly the test for perpendicular lines.' : 'The product of the slopes is ' + t(mT(pr)) + ', not ' + t('-1') + ', so they are not perpendicular.',
              t('m_1\\times m_2=' + mT(pr)) + (perp ? ', so the lines are perpendicular: <b>true</b>.' : '. That isn’t ' + t('-1') + ', so the lines do <b>not</b> cross at ' + t('90^\\circ') + ': <b>false</b>.'), ['Perpendicular lines have slopes whose product is ' + t('-1') + '.'], 'perpendicular test');
          } }] },
      { num: '9', section: 'Extra practice F — Two data points, one model', stem: function (sh) { return 'An appliance technician charges a fixed call-out fee plus a constant hourly rate. A job that took ' + t(sh.t1) + ' hours was billed at \\$' + sh.C1 + ', and a job that took ' + t(sh.t2) + ' hours was billed at \\$' + sh.C2 + '. Let ' + t('t') + ' be the time in hours and ' + t('C') + ' the bill in dollars.'; },
        shared: function (r) { var rate = r.pick([35, 40, 45, 50, 55, 60, 65]), fee = 5 * r.int(14, 24), t1 = r.int(1, 3), t2 = t1 + r.int(2, 4); if (r.chance(0.15)) { rate = 45; fee = 95; t1 = 2; t2 = 5; } return { r: rate, f: fee, t1: t1, t2: t2, C1: rate * t1 + fee, C2: rate * t2 + fee, t3: r.pick([5.5, 6.5, 7.5, 8.5]), t4: r.int(7, 10) }; },
        parts: [
          { id: 'e9a', level: 'BEG', outcome: 'RF4', make: function (r, sh) {
            var p = K.P.pairs('Write the two data points as ordered pairs ' + t('(t,\\ C)') + '.', [[sh.t1, sh.C1], [sh.t2, sh.C2]], {}, 'Time is the independent variable, so ' + t('t') + ' comes first: ' + t('(' + sh.t1 + ',\\ ' + sh.C1 + ')') + ' and ' + t('(' + sh.t2 + ',\\ ' + sh.C2 + ')') + '.', ['Time first, bill second.'], 'technician data points'); p.bad = ['(' + sh.C1 + ',' + sh.t1 + '),(' + sh.C2 + ',' + sh.t2 + ')']; return p;
          } },
          { id: 'e9b', level: 'EMG', outcome: 'RF5', make: function (r, sh) {
            var dC = sh.C2 - sh.C1, dt = sh.t2 - sh.t1;
            return K.P.number('Determine the rate of change.', sh.r, function (v) { if (v === dC) return { code: 'rate-dy', hint: 'That’s the change in the bill. Divide by the change in time, ' + t(dt) + ' hours.' }; if (near(v, dt / dC)) return { code: 'rate-flip', hint: 'Upside down: rate = change in bill ÷ change in time.' }; if (v === Math.round(sh.C2 / sh.t2) || v === Math.round(sh.C1 / sh.t1)) return { code: 'rate-dy', hint: 'Dividing one bill by its time includes the call-out fee. Use the <b>change</b> in bill over the <b>change</b> in time.' }; return null; },
              t('m=\\frac{' + sh.C2 + '-' + sh.C1 + '}{' + sh.t2 + '-' + sh.t1 + '}=\\frac{' + dC + '}{' + dt + '}=' + sh.r) + ' dollars per hour.', ['Rate of change = change in ' + t('C') + ' ÷ change in ' + t('t') + '.'], 'technician rate', { after: 'dollars per hour' });
          } },
          { id: 'e9b2', sub: 'b2', level: 'PRG', outcome: 'RF5', make: function (r, sh) {
            return mcPart(r, 'What does the rate of change mean?', [
              { html: 'The bill goes up by \\$' + sh.r + ' for every hour of work.', right: true },
              { html: 'The job takes ' + sh.r + ' more hours for every dollar.', why: 'The units are upside down: the rate is dollars per hour, ' + t('\\frac{\\Delta C}{\\Delta t}') + '.' },
              { html: 'The call-out fee is \\$' + sh.r + '.', why: 'The fee is the starting value (the bill when ' + t('t=0') + '), not the rate.' },
              { html: 'Every job costs \\$' + sh.r + ' in total.', why: 'The bill changes with the time: \\$' + sh.r + ' is added for each hour.' }],
              'Rate = ' + t(sh.r) + ' dollars per hour: each extra hour of labour adds \\$' + sh.r + ' to the bill.', ['Look at the units of ' + t('\\frac{\\Delta C}{\\Delta t}') + '.'], 'meaning of rate');
          } },
          { id: 'e9c', level: 'ADV', outcome: 'RF7', make: function (r, sh) {
            return line('Use slope–point form to write the model, then rearrange it to ' + t('C=mt+b') + '.', { m: sh.r, point: [sh.t1, sh.C1] }, { vars: ['t', 'C'], form: 'slope-intercept', wrong: [{ is: { m: sh.f, b: sh.r }, code: 'ctx-swap', hint: 'The rate multiplies ' + t('t') + '; the fixed fee is the constant.' }] },
              t('C-' + sh.C1 + '=' + sh.r + '(t-' + sh.t1 + ')') + '<br>' + t('C-' + sh.C1 + '=' + sh.r + 't-' + sh.r * sh.t1) + '<br>' + t('C=' + sh.r + 't+' + sh.f), ['Point ' + t('(' + sh.t1 + ',\\ ' + sh.C1 + ')') + ' and slope ' + t(sh.r) + ' in ' + t('C-C_1=m(t-t_1)') + ', then solve for ' + t('C') + '.'], 'technician model', ['C=' + sh.f + '+' + sh.r + 't'], ['C=' + sh.f + 't+' + sh.r]);
          } },
          { id: 'e9d', level: 'PRG', outcome: 'RF5', make: function (r, sh) {
            return mcPart(r, 'In ' + t('C=' + sh.r + 't+' + sh.f) + ', what does ' + t('b=' + sh.f) + ' mean on the invoice?', [
              { html: 'The fixed call-out fee of \\$' + sh.f + ', charged before any labour (the bill when ' + t('t=0') + ').', right: true },
              { html: 'The hourly rate.', why: 'The hourly rate is the slope, \\$' + sh.r + ' per hour.' },
              { html: 'The bill for a one-hour job.', why: 'A one-hour job costs ' + t(sh.r + '+' + sh.f + '=' + (sh.r + sh.f)) + ' dollars. ' + t('b') + ' is the value when ' + t('t=0') + '.' },
              { html: 'The number of hours the technician works for free.', why: t('b') + ' is in dollars (it’s a value of ' + t('C') + '), not hours.' }],
              t('b') + ' is the value of ' + t('C') + ' when ' + t('t=0') + ': the fixed <b>call-out fee</b> of \\$' + sh.f + '.', ['What is the bill when ' + t('t=0') + '?'], 'meaning of b');
          } },
          { id: 'e9e', level: 'EMG', outcome: 'RF4', make: function (r, sh) {
            var v = sh.r * sh.t3 + sh.f;
            return K.P.number('Predict the bill for a job lasting ' + t(sh.t3) + ' hours.', v, function (x) { if (near(x, sh.r * sh.t3)) return { code: 'nr-part', hint: 'Add the call-out fee, \\$' + sh.f + '.' }; return null; }, t('C=' + sh.r + '(' + sh.t3 + ')+' + sh.f + '=' + (sh.r * sh.t3) + '+' + sh.f + '=' + v) + ' dollars.', ['Substitute ' + t('t=' + sh.t3) + ' into your model.'], 'technician prediction', { before: '$', after: '' });
          } },
          { id: 'e9f', level: 'PRG', outcome: 'RF4', make: function (r, sh) {
            var bill = sh.r * sh.t4 + sh.f;
            return K.P.number('A customer was billed \\$' + bill + '. How long did the job take?', sh.t4, function (x) { if (near(x, bill / sh.r)) return { code: 'nr-part', hint: 'Subtract the call-out fee before dividing by the rate.' }; return null; }, t(bill + '=' + sh.r + 't+' + sh.f) + '<br>' + t((bill - sh.f) + '=' + sh.r + 't') + '<br>' + t('t=' + sh.t4) + ' hours.', ['Set ' + t('C=' + bill) + ' and solve for ' + t('t') + '.'], 'technician solve for t', { after: 'hours' });
          } }] },
      { num: '10', stem: function (sh) { return 'In a deep lake the water temperature falls at a constant rate with depth over the first ' + t('40') + ' metres. At a depth of ' + t(sh.d1) + ' m the temperature is ' + t(sh.T1 + '^\\circ') + 'C; at a depth of ' + t(sh.d2) + ' m it is ' + t(sh.T2 + '^\\circ') + 'C. Let ' + t('d') + ' be the depth in metres and ' + t('T') + ' the temperature in ' + t('^\\circ') + 'C.'; },
        shared: function (r) {
          var k = r.pick([4, 5]), T0 = k === 4 ? r.pick([18, 20, 22, 24]) : r.int(21, 25), d1 = r.pick([5, 10, 15]), d2 = d1 + r.pick([10, 15, 20]);
          if (r.chance(0.15)) { k = 5; T0 = 23; d1 = 10; d2 = 25; }
          var T = function (d) { return Math.round(T0 * 10 - k * d) / 10; };
          return { k: k, rate: -k / 10, T0: T0, d1: d1, d2: d2, T1: T(d1), T2: T(d2), T40: T(40), d0: T0 * 10 / k };
        },
        parts: [
          { id: 'e10a', level: 'EMG', outcome: 'RF5', make: function (r, sh) {
            return K.P.number('Determine the rate of change.', sh.rate, function (v) { if (near(v, -sh.rate)) return { code: 'slope-sign', hint: 'The temperature <b>falls</b> as the depth increases, so the rate is negative.' }; if (near(v, 1 / sh.rate) || near(v, -1 / sh.rate)) return { code: 'rate-flip', hint: 'Upside down: rate = change in temperature ÷ change in depth.' }; if (near(v, sh.T2 - sh.T1)) return { code: 'rate-dy', hint: 'Divide the change in temperature by the change in depth.' }; return null; },
              t('m=\\frac{' + sh.T2 + '-' + sh.T1 + '}{' + sh.d2 + '-' + sh.d1 + '}=\\frac{' + Math.round((sh.T2 - sh.T1) * 10) / 10 + '}{' + (sh.d2 - sh.d1) + '}=' + sh.rate) + ' degrees per metre.', ['Rate = change in ' + t('T') + ' ÷ change in ' + t('d') + '.'], 'lake rate', { after: '°C per metre' });
          } },
          { id: 'e10a2', sub: 'a2', level: 'PRG', outcome: 'RF5', make: function (r, sh) {
            var a = Math.abs(sh.rate);
            return mcPart(r, 'What does the rate of change mean?', [
              { html: 'The temperature falls ' + t(a + '^\\circ') + 'C for every metre of extra depth.', right: true },
              { html: 'The depth increases ' + t(a) + ' m for every degree.', why: 'Units upside down: the rate is degrees per metre, ' + t('\\frac{\\Delta T}{\\Delta d}') + '.' },
              { html: 'The temperature rises ' + t(a + '^\\circ') + 'C for every metre of depth.', why: 'The rate is negative: the water gets colder as you go down.' },
              { html: 'The surface temperature is ' + t(a + '^\\circ') + 'C.', why: 'The surface temperature is the starting value (' + t('d=0') + '), not the rate.' }],
              'Rate ' + t(sh.rate) + ' °C per metre: each extra metre of depth, the water is ' + t(a + '^\\circ') + 'C colder.', ['What are the units of ' + t('\\frac{\\Delta T}{\\Delta d}') + '? What does the sign tell you?'], 'lake meaning of rate');
          } },
          { id: 'e10b', level: 'ADV', outcome: 'RF7', make: function (r, sh) {
            var m = Fr(-sh.k, 10);
            return line('Use slope–point form to build the model, then write it as ' + t('T=md+b') + '.', { m: m, point: [sh.d1, sh.T1] }, { vars: ['d', 'T'], form: 'slope-intercept', keyTex: 'T=' + sh.rate + 'd+' + sh.T0, wrong: [{ is: { m: Fr(sh.k, 10), point: [sh.d1, sh.T1] }, code: 'slope-sign', hint: 'Check the sign of the slope: the temperature falls.' }] },
              t('T-' + sh.T1 + '=' + sh.rate + '(d-' + sh.d1 + ')') + '<br>' + t('T-' + sh.T1 + '=' + sh.rate + 'd+' + Math.round(sh.k * sh.d1) / 10) + '<br>' + t('T=' + sh.rate + 'd+' + sh.T0), ['Point ' + t('(' + sh.d1 + ',\\ ' + sh.T1 + ')') + ' and slope ' + t(sh.rate) + ' in ' + t('T-T_1=m(d-d_1)') + '.'], 'lake model', ['T=' + sh.T0 + '-' + (sh.k / 10) + 'd', 'T=' + sh.rate + 'd+' + sh.T0], ['T=' + sh.T0 + 'd' + sh.rate]);
          } },
          { id: 'e10c', level: 'PRG', outcome: 'RF5', make: function (r, sh) {
            return mcPart(r, 'In ' + t('T=' + sh.rate + 'd+' + sh.T0) + ', what does ' + t('b=' + sh.T0) + ' mean?', [
              { html: 'The water temperature at the surface (depth ' + t('0') + ' m) is ' + t(sh.T0 + '^\\circ') + 'C.', right: true },
              { html: 'The temperature falls ' + t(sh.T0 + '^\\circ') + 'C per metre.', why: 'The rate is the slope, ' + t(sh.rate) + '. ' + t('b') + ' is the value of ' + t('T') + ' when ' + t('d=0') + '.' },
              { html: 'The lake is ' + t(sh.T0) + ' m deep.', why: t('b') + ' is a temperature (a value of ' + t('T') + '), not a depth.' },
              { html: 'The temperature at the bottom of the lake.', why: t('b') + ' is the value when ' + t('d=0') + ': the top, not the bottom.' }],
              t('b') + ' is ' + t('T') + ' when ' + t('d=0') + ': the surface temperature, ' + t(sh.T0 + '^\\circ') + 'C.', ['What is ' + t('T') + ' when ' + t('d=0') + '?'], 'lake meaning of b');
          } },
          { id: 'e10d', level: 'EMG', outcome: 'RF4', make: function (r, sh) {
            return K.P.number('Predict the temperature at a depth of ' + t('40') + ' m.', sh.T40, null, t('T=' + sh.rate + '(40)+' + sh.T0 + '=' + (-sh.k * 4) + '+' + sh.T0 + '=' + sh.T40) + ' °C.', ['Substitute ' + t('d=40') + ' into your model.'], 'lake prediction', { after: '°C' });
          } },
          { id: 'e10e', level: 'PRG', outcome: 'RF4', make: function (r, sh) {
            return K.P.number('At what depth does the model predict ' + t('0^\\circ') + 'C?', sh.d0, function (v) { if (near(v, -sh.d0)) return { code: 'nr-sign', hint: 'Depth is positive here: check your signs when you solve ' + t('0=' + sh.rate + 'd+' + sh.T0) + '.' }; if (near(v, sh.T0 * sh.k / 10)) return { code: 'rate-flip', hint: 'Divide by the rate (' + t(Math.abs(sh.rate)) + '), don’t multiply.' }; return null; },
              t('0=' + sh.rate + 'd+' + sh.T0) + '<br>' + t(Math.abs(sh.rate) + 'd=' + sh.T0) + '<br>' + t('d=' + sh.d0) + ' m. (That is beyond the ' + t('40') + ' m the model was built for, so it is only an extrapolation.)', ['Set ' + t('T=0') + ' and solve for ' + t('d') + '.'], 'lake zero', { after: 'm' });
          } },
          { id: 'e10f', level: 'PRG', outcome: 'RF4', make: function (r, sh) {
            var v = Math.round((sh.rate * 120 + sh.T0) * 10) / 10;
            return mcPart(r, 'The lake is ' + t('120') + ' m deep. Why should the model not be used at ' + t('d=120') + '?', [
              { html: 'The rate was only stated to be constant over the first ' + t('40') + ' m; at ' + t('120') + ' m the model gives ' + t(v + '^\\circ') + 'C, which is impossible for liquid water.', right: true },
              { html: 'Because ' + t('120') + ' is not a multiple of the depths in the data.', why: 'Any depth inside the model’s range could be used. The problem is that ' + t('120') + ' m is far outside the range.' },
              { html: 'Because the slope would change sign below ' + t('40') + ' m.', why: 'We don’t know what happens below ' + t('40') + ' m — that is exactly why the model can’t be trusted there.' },
              { html: 'It can be used: a linear model works for every depth.', why: 'Try it: ' + t('T=' + sh.rate + '(120)+' + sh.T0 + '=' + v) + '. Water that cold would be ice.' }],
              'The constant rate was only given for the first ' + t('40') + ' m. Far outside that range the model breaks down: ' + t('T=' + sh.rate + '(120)+' + sh.T0 + '=' + v + '^\\circ') + 'C is impossible for liquid water.', ['Over what depths was the rate said to be constant?'], 'lake extrapolation');
          } }] },
      { num: '11', section: 'Extra practice G — Error analysis', stem: function (sh) { return 'Asked for the equation, in general form, of the line through ' + t(ptT(sh.p)) + ' with slope ' + t(sh.m) + ', a student writes ' + t('y+y_1=m(x+x_1)\\ \\Rightarrow\\ y+' + paren(sh.p[1]) + '=' + sh.m + '(x+' + sh.p[0] + ')\\ \\Rightarrow\\ ' + lin([[1, 'y'], [sh.p[1], '']]) + '=' + lin([[sh.m, 'x'], [sh.m * sh.p[0], '']]) + '\\ \\Rightarrow\\ ' + gT(sh.Gs)) + '.'; },
        shared: function (r) { var p, m; do { p = [r.int(2, 6), r.int(-9, -3)]; m = r.int(-5, -2); } while (p[1] === m * p[0]); return { p: p, m: m, Gs: genABC({ m: m, point: [-p[0], -p[1]] }) }; },
        parts: [
          { id: 'e11a', level: 'EMG', outcome: 'RF6', make: function (r, sh) {
            return mcPart(r, 'What is the student’s error?', [
              { html: 'The form is ' + t('y-y_1=m(x-x_1)') + ' — two subtractions. The student <b>added</b> ' + t('y_1') + ' and ' + t('x_1') + ' instead.', right: true },
              { html: 'The student used the wrong slope.', why: 'The slope ' + t(sh.m) + ' is right. Look at the form the student started from.' },
              { html: 'The student should have used ' + t('y=mx+b') + ' instead.', why: 'Slope–point form works fine here — when it is written correctly.' },
              { html: 'The only mistake is in the last step, collecting terms.', why: 'Check the very first line: is ' + t('y+y_1=m(x+x_1)') + ' the slope–point form?' }],
              'Slope–point form is ' + t('y-y_1=m(x-x_1)') + '. The student added ' + t('y_1') + ' and ' + t('x_1') + ', so their line passes through ' + t(ptT([-sh.p[0], -sh.p[1]])) + ' instead of ' + t(ptT(sh.p)) + '.', ['Compare the student’s first line with ' + t('y-y_1=m(x-x_1)') + '.'], 'error: added in slope-point');
          } },
          { id: 'e11b', level: 'PRG', make: function (r, sh) { var p = genPart('Determine the correct equation in general form.', sh.m, sh.p, 'corrected general form'); p.bad = p.bad.concat([gT(sh.Gs)]); return p; } },
          { id: 'e11c', level: 'PRG', make: function (r, sh) {
            var y = sh.m * 2 * sh.p[0] - sh.p[1], G = sh.Gs, val = G[0] * sh.p[0] + G[1] * sh.p[1] + G[2];
            return K.P.number('Substituting ' + t(ptT(sh.p)) + ' into the student’s equation gives ' + t(G[0] + '(' + sh.p[0] + ')+' + G[1] + '(' + sh.p[1] + ')' + (G[2] >= 0 ? '+' : '') + G[2] + '=' + val + '\\ne 0') + ', so it fails. Find the point on the student’s line with ' + t('x=' + sh.p[0]) + '.', y, function (v) { if (v === sh.p[1]) return { code: 'pt', hint: 'That is the given point — but it isn’t on the student’s line. Substitute ' + t('x=' + sh.p[0]) + ' into the student’s equation.' }; return null; },
              'Student’s line: ' + t(gT(G)) + '. With ' + t('x=' + sh.p[0]) + ': ' + t(G[0] + '(' + sh.p[0] + ')+y' + (G[2] >= 0 ? '+' : '') + G[2] + '=0') + ', so ' + t('y=' + y) + '. The point is ' + t(ptT([sh.p[0], y])) + '.', ['Substitute ' + t('x=' + sh.p[0]) + ' into ' + t(gT(G)) + ' and solve for ' + t('y') + '.'], 'point on student line', { before: t('y=') });
          } }] },
      { num: '12', stem: function (sh) { return 'Asked for the equation, in general form, of the line through ' + t(ptT(sh.p)) + ' with slope ' + t(mT(sh.m)) + ', a student writes ' + t(psT(sh.m, [sh.p[1], sh.p[0]])) + '.'; },
        shared: function (r) { var a = r.int(1, 6), b = r.int(5, 10); if (a === b) b++; return { p: [a, b], m: r.pick([[1, 2], [1, 2], [1, 3], [2, 3], [3, 2]]) }; },
        parts: [
          { id: 'e12a', level: 'EMG', outcome: 'RF6', make: function (r, sh) {
            return mcPart(r, 'Name the error precisely.', [
              { html: 'The coordinates are swapped: ' + t('y_1=' + sh.p[1]) + ' belongs with ' + t('y') + ' and ' + t('x_1=' + sh.p[0]) + ' with ' + t('x') + '.', right: true },
              { html: 'The slope should be ' + t(mT(Fr(sh.m[1], sh.m[0]))) + '.', why: 'The slope ' + t(mT(sh.m)) + ' was given and used correctly. Look at the numbers in the brackets.' },
              { html: 'The signs should be ' + t('+') + ', not ' + t('-') + '.', why: 'Slope–point form does use subtractions. The problem is which number goes where.' },
              { html: 'There is no error: any point can be used.', why: 'Any point <b>on the line</b> works — but ' + t(ptT([sh.p[1], sh.p[0]])) + ' isn’t the given point.' }],
              'The ' + t('y') + '-coordinate ' + t(sh.p[1]) + ' belongs in the ' + t('y_1') + ' slot and the ' + t('x') + '-coordinate ' + t(sh.p[0]) + ' in the ' + t('x_1') + ' slot: ' + t(psT(sh.m, sh.p)) + '.', ['Which coordinate of ' + t(ptT(sh.p)) + ' is ' + t('x_1') + '?'], 'error: swapped coordinates');
          } },
          { id: 'e12b', level: 'PRG', make: function (r, sh) { return genPart('Determine the correct equation in general form.', sh.m, sh.p, 'corrected general form (swap)'); } },
          { id: 'e12c', level: 'PRG', make: function (r, sh) { var q = [sh.p[1], sh.p[0]]; var p = genPart('Convert the <b>student’s</b> equation to general form as well.', sh.m, q, 'student line general form', { noPs: true }); return p; } },
          { id: 'e12c2', sub: 'c2', level: 'PRG', make: function (r, sh) {
            var q = [sh.p[1], sh.p[0]];
            return mcPart(r, 'The two lines are not the same, yet they are related. How?', [
              { html: 'They are parallel (same slope); the student’s line passes through ' + t(ptT(q)) + ', the given point with its coordinates swapped.', right: true },
              { html: 'They are perpendicular.', why: 'Both have slope ' + t(mT(sh.m)) + '. Perpendicular lines need negative-reciprocal slopes.' },
              { html: 'They are parallel, and the student’s line passes through ' + t(ptT(sh.p)) + '.', why: 'Substitute ' + t(ptT(sh.p)) + ' into the student’s equation — it doesn’t work. Parallel lines never share a point.' },
              { html: 'They cross at ' + t(ptT(sh.p)) + '.', why: 'Lines with the same slope never cross.' }],
              'Correct: ' + t(gT(genABC({ m: sh.m, point: sh.p }))) + '; student: ' + t(gT(genABC({ m: sh.m, point: q }))) + '. Same slope ' + t(mT(sh.m)) + ', different lines: they are <b>parallel</b>, and the student’s line passes through ' + t(ptT(q)) + '.', ['Compare the slopes and test the points.'], 'relationship of swapped line');
          } }] },
      { num: '13', stem: function (sh) { return 'Asked for the equation, in general form, of the line through ' + t(ptT(sh.p)) + ' with slope ' + t(mT(sh.m)) + ', a student writes ' + t(psT(sh.m, sh.p) + '\\ \\Rightarrow\\ ' + lin([[sh.m[1], 'y'], [-sh.m[1] * sh.p[1], '']]) + '=' + lin([[sh.m[0], 'x'], [-sh.m[0] * sh.p[0], '']]) + '\\ \\Rightarrow\\ ' + lin([[-sh.G[0], 'x'], [-sh.G[1], 'y'], [-sh.G[2], '']]) + '=0') + '.'; },
        shared: function (r) { var m, p, G; for (var i = 0; i < 50; i++) { m = improperFr(r, [2, 3], -1, 7); p = [r.int(-6, -1), r.int(2, 9)]; G = genABC({ m: m, point: p }); if (G[2] !== 0) break; } return { m: m, p: p, G: G }; },
        parts: [
          { id: 'e13a', level: 'BEG', outcome: 'RF6', make: function (r, sh) {
            var G = sh.G.map(function (v) { return -v; });
            return K.P.number('Every line of the student’s work is algebraically correct. Substitute ' + t(ptT(sh.p)) + ' into the left side of their final equation, ' + t(lin([[G[0], 'x'], [G[1], 'y'], [G[2], '']])) + '. What do you get?', 0, null, t(G[0] + '(' + sh.p[0] + ')' + (G[1] < 0 ? '' : '+') + G[1] + '(' + sh.p[1] + ')' + (G[2] < 0 ? '' : '+') + G[2] + '=' + (G[0] * sh.p[0]) + (G[1] * sh.p[1] < 0 ? '' : '+') + (G[1] * sh.p[1]) + (G[2] < 0 ? '' : '+') + G[2] + '=0') + ' ✓ So ' + t(ptT(sh.p)) + ' does satisfy the student’s equation.', ['Replace ' + t('x') + ' by ' + t(sh.p[0]) + ' and ' + t('y') + ' by ' + t(sh.p[1]) + '.'], 'verify point in student eq');
          } },
          { id: 'e13b', level: 'EMG', outcome: 'RF6', make: function (r, sh) {
            var Gn = sh.G.map(function (v) { return -v; });
            var p = genPart('General form has a house rule. Write the corrected answer.', sh.m, sh.p, 'general form A positive', { pre: 'House rule: in general form ' + t('A') + ', ' + t('B') + ', ' + t('C') + ' are integers and ' + t('A') + ' is <b>positive</b>. Multiply every term by ' + t('-1') + ':<br>' });
            p.solution = 'House rule: in general form ' + t('A') + ', ' + t('B') + ', ' + t('C') + ' are integers, ' + t('A') + ' is <b>positive</b>, no common factor. Multiply the student’s equation by ' + t('-1') + ': ' + t(gT(sh.G)) + '.';
            p.bad = [lin([[Gn[0], 'x'], [Gn[1], 'y'], [Gn[2], '']]) + '=0'];
            return p;
          } },
          { id: 'e13c', level: 'EMG', outcome: 'RF6', make: function (r, sh) {
            return mcPart(r, 'Why is the correction a matter of <i>convention</i> rather than of truth?', [
              { html: 'Multiplying both sides by ' + t('-1') + ' gives an equivalent equation with the same solutions, so both describe the same line; the convention makes every correct answer look identical, so answers can be compared at a glance.', right: true },
              { html: 'Because the student’s equation describes a different line.', why: 'Part (a) showed that the point satisfies it, and the slope is the same — it’s the same line.' },
              { html: 'Because a negative ' + t('A') + ' changes the slope of the line.', why: 'The slope is ' + t('-\\frac{A}{B}') + ': changing the signs of both ' + t('A') + ' and ' + t('B') + ' leaves it unchanged.' },
              { html: 'Because equations with negative coefficients are not allowed in mathematics.', why: 'They are perfectly valid. The rule is only an agreed habit (a convention).' }],
              'Multiplying by ' + t('-1') + ' doesn’t change the solutions, so neither answer is untrue. The convention (' + t('A>0') + ') is still worth following because every correct answer then looks the same.', ['Does multiplying both sides of an equation by ' + t('-1') + ' change which points satisfy it?'], 'convention vs truth');
          } }] },
      { num: '14', section: 'Extra practice H — Stretch: the altitudes of a triangle', stem: function (sh) { return 'An <b>altitude</b> of a triangle is the line drawn from a vertex perpendicular to the opposite side. Triangle ' + t('PQR') + ' has vertices ' + t('P' + ptT(sh.P)) + ', ' + t('Q' + ptT(sh.Q)) + ' and ' + t('R' + ptT(sh.R)) + '.' + sh.pic; },
        shared: function (r) {
          var T = triangle(r);
          T.pic = HW.graph({ x: [-7, 7], y: [-5, 9], labels: 2, max: 300, segs: [{ pts: [T.P, T.Q, T.R, T.P], start: 'none', end: 'none' }], points: [{ x: T.P[0], y: T.P[1], label: 'P' }, { x: T.Q[0], y: T.Q[1], label: 'Q' }, { x: T.R[0], y: T.R[1], label: 'R' }] });
          return T;
        },
        parts: [
          { id: 'e14a', level: 'EMG', outcome: 'RF5', make: function (r, sh) {
            var s = [slope2(sh.P, sh.Q), slope2(sh.Q, sh.R), slope2(sh.P, sh.R)], labs = ['PQ', 'QR', 'PR'];
            var fields = labs.map(function (l) { return { label: t('m_{' + l + '}'), before: '', mode: 'math', keys: 'slope', placeholder: 'e.g. -1/3' }; });
            var p = K.P.fields('Determine the slope of each of the three sides.', fields, s.map(function (m) { return K.slope(m); }), s.map(mT), labs.map(function (l, i) { return t('m_{' + l + '}=' + mT(s[i])); }).join(', '),
              labs.map(function (l, i) { var e = [[sh.P, sh.Q], [sh.Q, sh.R], [sh.P, sh.R]][i]; return slopeSteps(e[0], e[1], 'm_{' + l + '}'); }).join('<br>'), ['Slope = ' + t('\\frac{y_2-y_1}{x_2-x_1}') + ' for each pair of vertices.'], 'triangle side slopes');
            p.bad = [s.map(function (m) { return nT(-fv(m)); })];
            return p;
          } },
          { id: 'e14b', level: 'PRG', make: function (r, sh) { return altPart(sh, 'P', 'Q', 'R'); } },
          { id: 'e14c', level: 'PRG', make: function (r, sh) { return altPart(sh, 'Q', 'P', 'R'); } },
          { id: 'e14d', level: 'PRG', make: function (r, sh) { return altPart(sh, 'R', 'P', 'Q'); } },
          { id: 'e14e', level: 'EMG', make: function (r, sh) { return altDrawPart(sh); } },
          { id: 'e14f', level: 'PRG', make: function (r, sh) {
            return mcPart(r, 'The three altitudes of <i>any</i> triangle meet at a single point. Once you had found two of the altitudes, why did you not strictly need the third one to locate that point?', [
              { html: 'Two non-parallel lines meet in exactly one point, so the first two altitudes already pin it down; the third must pass through the same point, so it only checks.', right: true },
              { html: 'Because the third altitude is always parallel to one of the others.', why: 'All three altitudes pass through one point, so none of them is parallel to another.' },
              { html: 'Because any two lines in a triangle meet at the same point.', why: 'Sides, medians and altitudes meet at different points. The fact used here is that two non-parallel lines meet exactly once.' },
              { html: 'You do need the third: two lines can meet in more than one point.', why: 'Two different straight lines meet at most once.' }],
              'Two non-parallel lines meet at exactly one point, so solving the first two altitude equations together pins down the meeting point. The third altitude goes through the same point, so it adds no new information — it is a check.', ['How many points can two different straight lines have in common?'], 'why two altitudes suffice');
          } }] },
      { num: '15', section: 'Extra practice I — Multiple choice and numerical response', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: 'e15', level: 'EMG', make: function (r) {
          var m = properFr(r, [3, 5, 7], 1, 2), p = [r.int(-8, -2), r.int(1, 6)];
          var o = [genABC({ m: m, point: p }), genABC({ m: [-m[0], m[1]], point: p }), genABC({ m: m, point: [-p[0], -p[1]] }), genABC({ m: [m[1], m[0]], point: p })];
          return mcPart(r, 'The equation, in general form, of the line through ' + t(ptT(p)) + ' with slope ' + t(mT(m)) + ' is', [
            eqOpt(gT(o[0]), true), eqOpt(gT(o[1]), false, 'This line has slope ' + t(nT(-fv(m))) + ': in general form the slope is ' + t('-\\frac{A}{B}') + '.'),
            eqOpt(gT(o[2]), false, 'This line passes through ' + t(ptT([-p[0], -p[1]])) + ' — the signs of the point were flipped.'),
            eqOpt(gT(o[3]), false, 'This line has slope ' + t(mT([m[1], m[0]])) + ' — the slope is upside down.')],
            genSteps(m, p), ['Write ' + t('y-y_1=m(x-x_1)') + ', clear the fraction, and move every term to one side.', 'Check each option with the point.'], 'MC general form from point & slope', false, true);
        } }] },
      { num: '16', stem: '<i>(Multiple Choice)</i>', outcome: 'RF6', parts: [
        { id: 'e16', level: 'EMG', make: function (r) {
          var m, p, G;
          for (var i = 0; i < 50; i++) { m = properFr(r, [5, 7, 8], -1, 2); p = [m[1] * r.pick([1, 2]), -r.int(2, 6)]; G = genABC({ m: m, point: p }); if (G[2] !== 0) break; }
          return mcPart(r, 'Which equation is equivalent to ' + t(psT(m, p)) + '?', [
            eqOpt(gT(G), true), eqOpt(gT([G[0], -G[1], G[2]]), false, 'This line has slope ' + t(nT(-fv(m))) + ': check the sign of the ' + t('y') + '-term.'),
            eqOpt(gT([G[0], G[1], -G[2]]), false, 'Right slope, but test the point ' + t(ptT(p)) + ': it doesn’t give 0. Check the constant.'),
            eqOpt(gT([G[0], -G[1], -G[2]]), false, 'Both the slope sign and the constant are off. Substitute ' + t(ptT(p)) + ' to check.')],
            genSteps(m, p), ['Multiply both sides by ' + t(m[1]) + ', expand, and collect every term on one side.'], 'MC equivalent general form', false, true);
        } }] },
      { num: '17', stem: '<i>(Numerical Response)</i>', parts: [
        { id: 'e17', level: 'PRG', make: function (r) {
          var A, B, c, p, G, s;
          for (var i = 0; i < 200; i++) { A = r.int(2, 5); B = r.pick([2, 3, 4, 5].filter(function (b) { return b !== A && coprime(A, b); })); c = r.int(1, 9); p = [r.int(-6, -2), r.int(2, 7)]; G = genABC({ m: [B, A], point: p }); s = G[0] + G[1] + G[2]; if (s > 0 && s < 1000) break; }
          if (!(s > 0)) { A = 3; B = 2; c = 7; p = [-4, 5]; G = [2, -3, 23]; s = 22; }
          var Gg = [A, B, -c], Gpar = genABC({ m: [-A, B], point: p }), Gneg = genABC({ m: [-B, A], point: p });
          return K.P.nr('The line through ' + t(ptT(p)) + ' perpendicular to ' + t(gT(Gg)) + ' is written in general form ' + t('Ax+By+C=0') + ', where ' + t('A') + ', ' + t('B') + ' and ' + t('C') + ' are integers with ' + t('A') + ' positive and no common factor greater than ' + t('1') + '. The value of ' + t('A+B+C') + ' is ________.', s, function (v) {
            if (v === Gpar[0] + Gpar[1] + Gpar[2]) return { code: 'used-given', hint: 'That’s the line through the point <b>parallel</b> to the given line. Use the negative reciprocal slope.' };
            if (v === Gneg[0] + Gneg[1] + Gneg[2]) return { code: 'perp-recip-only', hint: 'Check the sign of your perpendicular slope.' };
            return null;
          }, givenSlopeT(Gg) + ' ' + t('m_{\\perp}=' + mT([B, A])) + '.<br>' + genSteps([B, A], p) + '<br>' + t('A=' + G[0] + ',\\ B=' + G[1] + ',\\ C=' + G[2]) + ', so ' + t('A+B+C=' + s) + '.', ['Slope of the given line, then its negative reciprocal, then slope–point form, then general form.'], 'NR perpendicular A+B+C');
        } }] }
    ]
  });

  /* ---------- part makers that need the helpers above ---------- */
  function gridLinePart(l, name) {
    var m = slope2(l.A, l.B);
    return genPart('Equation of ' + t(name) + ' in general form:', m, l.A, 'grid line ' + name, {
      pre: 'Through ' + t(ptT(l.A)) + ' and ' + t(ptT(l.B)) + ': ' + slopeSteps(l.A, l.B) + '.<br>', noPs: true,
      wrong: [{ is: { m: Fr(-m[0], m[1]), point: l.A }, code: 'line-slope-sign', hint: 'Check the sign of the slope: does ' + t(name) + ' rise or fall from left to right?' }],
      hints: ['Read the two marked points, find the slope, then use slope–point form.', 'Move every term to one side; clear any fractions.'] });
  }
  function set11(r) {
    for (var g = 0; g < 300; g++) {
      var s = r.pick([2, 2, 3]);
      var xa = r.int(3, 6), ya = r.int(1, 5), da = r.pick([2, 3]), a = [[xa, ya], [xa - da, ya - s * da]];
      var q = r.pick([2, 3]), p = r.pick([3, 4, 5, 7].filter(function (x) { return coprime(x, q) && x !== s * q; })), k = r.pick([1, 2, 3]), xb = r.int(-5, -2), yb = r.int(2, 7), b = [[xb, yb], [xb + q * k, yb - p * k]];
      var ba = ya - s * xa, bc = r.int(-3, 3), xc = r.int(-8, -4), dc = r.int(10, 15); if (bc === ba) continue;
      var c = [[xc, s * xc + bc], [xc + dc, s * (xc + dc) + bc]];
      var bd = r.int(-12, -5), kd = r.pick([2, 3, 4]), d = [[s * kd, bd - kd], [0, bd]];
      if (Math.abs(b[1][1]) > 15 || Math.abs(c[1][1]) > 30 || Math.abs(c[0][1]) > 20) continue;
      if (r.chance(0.15)) { s = 2; a = [[5, 3], [2, -3]]; b = [[-4, 6], [2, -9]]; c = [[-6, -11], [9, 19]]; d = [[8, -13], [0, -9]]; }
      return { s: s, L: { a: a, b: b, c: c, d: d } };
    }
    return { s: 2, L: { a: [[5, 3], [2, -3]], b: [[-4, 6], [2, -9]], c: [[-6, -11], [9, 19]], d: [[8, -13], [0, -9]] } };
  }
  function twoPtPart(A, B) {
    var m = slope2(A, B);
    return genPart(t(ptT(A)) + ' and ' + t(ptT(B)), m, A, 'two points ' + ptT(A) + ' ' + ptT(B), {
      pre: slopeSteps(A, B) + '<br>Using ' + t(ptT(A)) + ':<br>', noPs: true,
      wrong: [{ is: { m: Fr(-m[0], m[1]), point: A }, code: 'line-slope-sign', hint: 'Check the sign of the slope: subtract the coordinates in the <b>same order</b> on the top and the bottom.' }, { is: { m: Fr(m[1], m[0]), point: A }, code: 'line-slope-flip', hint: 'Slope is rise over run: change in ' + t('y') + ' on top.' }],
      hints: ['Find the slope first: ' + t('m=\\frac{y_2-y_1}{x_2-x_1}') + '.', 'Then use slope–point form with either point and move every term to one side.'] });
  }
  function parPerpPart(r, sh, kind) {
    var R = sh.role, L = function (x) { return '(' + x + ')'; }, srt = function (a, b) { return [a, b].sort(); }, pr = function (a, b) { var s = srt(a, b); return L(s[0]) + ' and ' + L(s[1]); };
    var slopes = {}; ['a', 'b', 'c', 'd'].forEach(function (k) { slopes[k] = slope2(sh.L[k][0], sh.L[k][1]); });
    var sol = 'Slopes: ' + ['a', 'b', 'c', 'd'].map(function (k) { return L(k) + ' ' + t(mT(slopes[k])); }).join(', ') + '.<br>';
    if (kind === 'par') {
      return mcPart(r, '(i) parallel', [
        { html: pr(R.p1, R.p2), right: true },
        { html: pr(R.p1, R.perp), why: 'Their slopes are ' + t(mT(slopes[R.p1])) + ' and ' + t(mT(slopes[R.perp])) + ': negative reciprocals, so they are perpendicular, not parallel.' },
        { html: pr(R.odd, R.perp), why: 'Both slopes are negative, but ' + t(mT(slopes[R.odd])) + ' and ' + t(mT(slopes[R.perp])) + ' are not equal. Parallel lines have <b>equal</b> slopes.' },
        { html: pr(R.p1, R.odd), why: 'Compare the slopes: ' + t(mT(slopes[R.p1])) + ' and ' + t(mT(slopes[R.odd])) + ' are not equal.' }],
        sol + pr(R.p1, R.p2) + ' have the same slope, ' + t(mT(slopes[R.p1])) + ', so they are parallel.', ['Find the slope of each line. Parallel lines have equal slopes.'], 'parallel lines from #11 set');
    }
    return mcPart(r, '(ii) perpendicular', [
      { html: pr(R.p1, R.perp) + ', and ' + pr(R.p2, R.perp), right: true },
      { html: pr(R.p1, R.perp) + ' only', why: 'Line ' + L(R.p2) + ' has the same slope as ' + L(R.p1) + ', so it is perpendicular to ' + L(R.perp) + ' as well.' },
      { html: pr(R.odd, R.perp), why: 'Slopes ' + t(mT(slopes[R.odd])) + ' and ' + t(mT(slopes[R.perp])) + ' multiply to ' + t(mT(Fr(slopes[R.odd][0] * slopes[R.perp][0], slopes[R.odd][1] * slopes[R.perp][1]))) + ', not ' + t('-1') + '.' },
      { html: pr(R.p1, R.p2), why: 'Those have equal slopes — they are parallel, not perpendicular.' }],
      sol + t(mT(slopes[R.p1]) + '\\times\\left(' + mT(slopes[R.perp]) + '\\right)=-1') + ', so ' + pr(R.p1, R.perp) + ' are perpendicular, and so are ' + pr(R.p2, R.perp) + '. ' + L(R.odd) + ' is neither parallel nor perpendicular to any of the others.', ['Perpendicular slopes multiply to ' + t('-1') + '. Check every pair.'], 'perpendicular lines from #11 set');
  }
  function fourPart(m, p) {
    var mv = Array.isArray(m) ? m : [m, 1], b = bOf(m, p), q = Ln.toFr(fv(m)), other = [p[0] + q[1], p[1] + q[0]], eq = psT(m, p), H = psReadHints(p);
    var fields = [{ label: '(i) slope', before: t('m='), mode: 'math', keys: 'pairs' }, { label: '(ii) point used', mode: 'math', keys: 'pairs' }, { label: '(iii) another point', mode: 'math', keys: 'pairs' }, { label: '(iv) ' + t('y') + '-intercept', mode: 'math', keys: 'pairs' }];
    var part = K.P.fields(t(eq), fields, [K.slope(mv), ptCheck(p, H), onLineCheck(m, p), ptCheck([0, b], { diag: function (v) { if (near(v[0], b) && near(v[1], 0)) return { code: 'pt-swap', hint: 'The ' + t('y') + '-intercept is on the ' + t('y') + '-axis, so its ' + t('x') + '-coordinate is ' + t('0') + '.' }; return null; } })],
      [mT(m), ptT(p), ptT(other), ptT([0, b])], '(i) ' + t('m=' + mT(m)) + ' (ii) ' + t(ptT(p)) + ' (iii) e.g. ' + t(ptT(other)) + ' (iv) ' + t(ptT([0, b])),
      '(i) ' + t('m=' + mT(m)) + '<br>(ii) ' + t(rawT(m, p)) + ', so ' + t('(x_1,\\ y_1)=' + ptT(p)) + '<br>(iii) Right ' + t(q[1]) + ', ' + (q[0] > 0 ? 'up ' : 'down ') + t(Math.abs(q[0])) + ': ' + t(ptT(other)) + ' (any other point on the line is fine)<br>(iv) ' + t('x=0') + ': ' + t(lin([[1, 'y'], [-p[1], '']]) + '=' + mT(m) + '(0-' + paren(p[0]) + ')=' + nT(-fv(m) * p[0])) + ', so ' + t('y=' + nT(b)) + ': ' + t(ptT([0, b])),
      ['The point comes from the numbers subtracted from ' + t('x') + ' and ' + t('y') + ' (watch the signs).', 'For the ' + t('y') + '-intercept, substitute ' + t('x=0') + '.'], 'four facts from ' + eq);
    part.good = [[mT(m), ptT(p), ptT([p[0] - q[1], p[1] - q[0]]), ptT([0, b])]];
    part.bad = [[mT(m), ptT([-p[0], -p[1]]), ptT(other), ptT([0, b])], [mT(m), ptT(p), ptT(p), ptT([0, b])], [mT(m), ptT(p), ptT(other), ptT([b, 0])]];
    return part;
  }
  function formsMC(r, prompt, which, sh) {
    var ex1 = [psT(sh.m, sh.P), siT(sh.m, sh.P), gT(genABC({ m: sh.m, point: sh.P }))];
    var names = ['Slope–point form', 'Slope–intercept form', 'General form'];
    var whys = which === 0 ? [null, t(ex1[1]) + ' shows the slope and the ' + t('y') + '-intercept, but a point other than ' + t('(0,\\ b)') + ' takes work.', t(ex1[2]) + ' needs rearranging before you can read the slope.', 'One of the forms does: look at ' + t(ex1[0]) + '.']
      : [t(ex1[0]) + ' shows a point and the slope, but the ' + t('y') + '-intercept takes some work.', null, 'General form needs solving (set ' + t('x=0') + ') to find the ' + t('y') + '-intercept.', 'One of the forms does: look at ' + t(ex1[1]) + '.'];
    var opts = names.concat(['None of them']).map(function (n, i) { return { html: n + (i < 3 ? ': ' + t(ex1[i]) : ''), right: i === which, why: whys[i] }; });
    return mcPart(r, prompt, opts, which === 0 ? '<b>Slope–point form</b>: ' + t(ex1[0]) + ' shows the point ' + t(ptT(sh.P)) + ' and the slope ' + t(mT(sh.m)) + ' directly.' : '<b>Slope–intercept form</b>: ' + t(ex1[1]) + ' shows ' + t('b=' + nT(bOf(sh.m, sh.P))) + ', the ' + t('y') + '-intercept ' + t(ptT([0, bOf(sh.m, sh.P)])) + '.', ['Look at your three answers from (a)–(c).'], 'which form shows…', true);
  }
  function twoPsPart(l, m, name) {
    var fields = [{ label: 'From ' + t(ptT(l.A)), mode: 'math', keys: 'eq', vars: ['x', 'y'], placeholder: 'y - y1 = m(x - x1)' }, { label: 'From ' + t(ptT(l.B)), mode: 'math', keys: 'eq', vars: ['x', 'y'], placeholder: 'y - y1 = m(x - x1)' }];
    var p = K.P.fields('For ' + t(name) + ': write <b>two</b> slope–point equations, one from each marked point.', fields,
      [K.line({ m: m, point: l.A }, { form: 'point-slope', point: l.A, wrong: psWrongs(m, l.A) }), K.line({ m: m, point: l.B }, { form: 'point-slope', point: l.B, wrong: psWrongs(m, l.B) })],
      [psT(m, l.A), psT(m, l.B)], t(psT(m, l.A)) + ' and ' + t(psT(m, l.B)),
      slopeSteps(l.A, l.B) + '<br>From ' + t(ptT(l.A)) + ': ' + t(psT(m, l.A)) + '<br>From ' + t(ptT(l.B)) + ': ' + t(psT(m, l.B)) + '<br>Both expand to ' + t(siT(m, l.A)) + ' — the same line.', ['Find the slope from the two marked points first.'].concat(PS_HINTS), 'two slope-point eqns ' + name);
    p.bad = [[psT(m, l.B), psT(m, l.A)], [psT(m, [-l.A[0], -l.A[1]]), psT(m, l.B)]];
    return p;
  }
  function altPart(sh, v, a, b) {
    var V = sh[v], A = sh[a], B = sh[b], ms = slope2(A, B), mp = Fr(-ms[1], ms[0]), mid = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
    var w = [{ is: { m: ms, point: V }, code: 'alt-parallel', hint: 'Your line is <b>parallel</b> to side ' + t(a + b) + '. The altitude is perpendicular to it: use the negative reciprocal of ' + t(mT(ms)) + '.' },
      { is: { m: ms, point: A }, code: 'alt-side', hint: 'That’s side ' + t(a + b) + ' itself. The altitude goes through ' + t(v) + ', perpendicular to ' + t(a + b) + '.' }];
    if (!near(mid[0], V[0])) w.push({ is: { m: slope2(V, mid), point: V }, code: 'alt-median', hint: 'That line goes from ' + t(v) + ' to the <b>midpoint</b> of ' + t(a + b) + ' (a median). An altitude is <b>perpendicular</b> to the opposite side.' });
    return genPart('Determine the equation, in general form, of the altitude from ' + t(v) + ' to side ' + t(a + b) + '.', mp, V, 'altitude from ' + v, {
      pre: t('m_{' + a + b + '}=' + mT(ms)) + ', so ' + t('m_{\\perp}=' + mT(mp)) + '.<br>', wrong: w,
      hints: ['Three steps: the slope of the opposite side ' + t(a + b) + ', its negative reciprocal, then slope–point form with ' + t(v) + '.'] });
  }
  function altDrawPart(sh) {
    var H = sh.H, verts = [['P', sh.P], ['Q', sh.Q], ['R', sh.R]];
    var key = { pts: [], pieces: verts.map(function (vv) { return arrowPiece(vv[1], H); }) };
    var tKeys = linesKeySet(key), sideKeys = linesKeySet({ pts: [], pieces: [arrowPiece(sh.P, sh.Q), arrowPiece(sh.Q, sh.R), arrowPiece(sh.P, sh.R)] });
    var medKeys = linesKeySet({ pts: [], pieces: [arrowPiece(sh.P, [(sh.Q[0] + sh.R[0]) / 2, (sh.Q[1] + sh.R[1]) / 2]), arrowPiece(sh.Q, [(sh.P[0] + sh.R[0]) / 2, (sh.P[1] + sh.R[1]) / 2]), arrowPiece(sh.R, [(sh.P[0] + sh.Q[0]) / 2, (sh.P[1] + sh.Q[1]) / 2])] });
    var Gs = verts.map(function (vv) { return lineG(vv[1], H); });
    var check = function (resp) {
      if (HW.draw.empty(resp)) return form('empty', 'Draw your lines on the grid first.');
      var S = linesKeySet(resp);
      if (!S.length) return form('alt-missing', 'Use the <b>Line</b> tool: tap two grid points on each altitude.');
      var good = S.filter(function (k) { return tKeys.indexOf(k) >= 0; }), extra = S.filter(function (k) { return tKeys.indexOf(k) < 0; });
      if (extra.length) {
        if (extra.every(function (k) { return medKeys.indexOf(k) >= 0; })) return wrong('alt-median', 'That line goes to the <b>midpoint</b> of a side (a median). An altitude meets the opposite side at a <b>right angle</b>.');
        if (extra.every(function (k) { return sideKeys.indexOf(k) >= 0; })) return wrong('alt-side', 'Don’t redraw the sides — draw the altitudes, each through a vertex and ' + t(ptT(H)) + '.');
        return wrong('alt-extra', (extra.length === 1 ? 'One line isn’t' : extra.length + ' lines aren’t') + ' an altitude. Each altitude passes through a vertex and ' + t(ptT(H)) + '.');
      }
      if (good.length < 3) return form('alt-missing', 'Correct so far — draw all three altitudes (' + (3 - good.length) + ' missing).');
      return ok();
    };
    var p = K.P.graph('The point ' + t(ptT(H)) + ' satisfies all three altitude equations (check it!). Draw the three altitudes on the grid: each one is a line through a vertex and ' + t(ptT(H)) + '.',
      { x: [-7, 7], y: [-5, 9], labels: 2, defaultEnd: 'arrow', bg: { segs: [{ pts: [sh.P, sh.Q, sh.R, sh.P], start: 'none', end: 'none', color: '#2b3340' }], points: [{ x: sh.P[0], y: sh.P[1], label: 'P', color: '#2b3340' }, { x: sh.Q[0], y: sh.Q[1], label: 'Q', color: '#2b3340' }, { x: sh.R[0], y: sh.R[1], label: 'R', color: '#2b3340' }] } },
      check, key, verts.map(function (vv, i) { return 'Altitude from ' + t(vv[0]) + ': ' + t(gT(Gs[i])) + ' — ' + chkT(Gs[i], H); }).join('<br>') + '<br>So ' + t(ptT(H)) + ' is on all three. Each altitude is the line through its vertex and ' + t(ptT(H)) + '; each meets the opposite side at a right angle.',
      ['Each altitude passes through one vertex and the meeting point ' + t(ptT(H)) + '.', 'Tap a vertex, then ' + t(ptT(H)) + ', for each line.'], 'draw the three altitudes');
    p.bad = [{ pts: [], pieces: [arrowPiece(sh.P, H), arrowPiece(sh.Q, H)] }, { pts: [], pieces: [arrowPiece(sh.P, sh.Q), arrowPiece(sh.Q, sh.R), arrowPiece(sh.P, sh.R)] }];
    p.good = [{ pts: [], pieces: verts.map(function (vv) { return { v: [vv[1], H], s: 'closed', e: 'closed' }; }) }];
    return p;
  }
})(window);
