/* Math 10C · Unit 6 (Characteristics of Linear Relations) — exit slips, one per lesson (u6l1x … u6l5x), for Ryan's test
 * mode. Each exit slip is 2–4 short questions (about 5–8 minutes at the end of class) on that day's main skills, using only
 * what has been taught up to and including that lesson. The questions are new (new contexts, wording and structure) but
 * match the lesson's assignment items in skill and difficulty; each one is graded at the level the assignment gives a
 * similar item (one Beginning, one or two Progressing and one Mastery question, so the "highest level right per outcome"
 * rule can tell students apart). Every part is a generator (the student's own numbers), with a key, a worked solution,
 * hints, and typical wrong answers with labelled codes (u6x-… or the Unit 6 practice codes) and partial-credit decisions.
 * The answer widgets and checkers are the ones the Unit 6 practice uses (distance and midpoint, rise/run/slope rows, the
 * graph pad for drawing a line from a point and a slope, slope answers, intercept boxes with "none"); helper code is
 * adapted from js/lessons/u6l*.js. Lesson 5 (the unit review) is a short mix of RF3, RF4 and RF5.
 * A scientific calculator is allowed (as on the unit test); no graphing calculator is needed. */
(function (root) {
  'use strict';
  var HW = root.HW, ex = HW.ex, F = HW.fmt, K = HW.kit, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form, B = K.P, LN = HW.lines, D = HW.draw;

  HW.addCodes({
    'u6x-one-pt': 'Gave only one of the two points', 'u6x-leg': 'Used the distance as the vertical change', 'u6x-perp-sign': 'Perpendicular slope: changed only the sign',
    'u6x-perp-recip': 'Perpendicular slope: took only the reciprocal', 'u6x-perp-same': 'Gave the same slope for a perpendicular line', 'u6x-par-perp': 'Gave the perpendicular slope for a parallel line',
    'u6x-perp-par': 'Used parallel (equal) slopes instead of perpendicular', 'u6x-k-sign': 'Sign slip solving for the unknown', 'u6x-k-flip': 'Used run over rise to solve for the unknown',
    'u6x-col-line': 'Point found on the wrong line', 'u6x-run-div': 'Divided instead of multiplying (run)', 'u6x-run-mult': 'Multiplied instead of dividing (run)',
    'u6x-full-span': 'Used the whole span as the run', 'u6x-no-half': 'Forgot the ½ in the triangle area', 'u6x-height': 'Gave the height instead of the area',
    'u6x-pitch-flip': 'Used 12 over the pitch (run over rise)', 'u6x-rate-step': 'Gave the change per table step, not per unit', 'u6x-rate-sign': 'Rate with the wrong sign',
    'u6x-ctx-first': 'Used the first value in the table as the intercept', 'u6x-ctx-end': 'Stopped at the last value in the table', 'u6x-empty-y': 'Gave the starting value for the time',
    'u6x-tab-step': 'Completed the table with the wrong step', 'u6x-xint-round': 'Rounded to the wrong place',
    'u6x-xint-y': 'Gave the y-intercept for the x-intercept', 'u6x-right-perp': 'Made the right angle at the wrong vertex', 'u6x-right-par': 'Used equal slopes for a right angle'
  });
  HW.addPartial({
    'u6x-one-pt': 'b', 'u6x-leg': 'n', 'u6x-perp-sign': 'b', 'u6x-perp-recip': 'b', 'u6x-perp-same': 'n', 'u6x-par-perp': 'n', 'u6x-perp-par': 'n', 'u6x-k-sign': 's', 'u6x-k-flip': 'b',
    'u6x-col-line': 'n', 'u6x-run-div': 'n', 'u6x-run-mult': 'n', 'u6x-full-span': 'b', 'u6x-no-half': 's', 'u6x-height': 'b', 'u6x-pitch-flip': 'b', 'u6x-rate-step': 'b', 'u6x-rate-sign': 's',
    'u6x-ctx-first': 'n', 'u6x-ctx-end': 'n', 'u6x-empty-y': 'n', 'u6x-tab-step': 'b', 'u6x-xint-round': 's', 'u6x-xint-y': 'n', 'u6x-right-perp': 'n', 'u6x-right-par': 'n'
  });

  /* ================= numbers and LaTeX ================= */
  function cl(x) { return Math.round(x * 1e6) / 1e6; }
  function same(a, b) { return Math.abs(a - b) < 1e-7; }
  function nT(x) { return F(cl(x)); }
  function sgp(x) { x = cl(x); return x < 0 ? '(' + nT(x) + ')' : nT(x); }
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var r = a % b; a = b; b = r; } return a; }
  function range(a, b) { var o = []; for (var i = a; i <= b; i++) o.push(i); return o; }
  function nz(a, b) { return range(a, b).filter(function (x) { return x !== 0; }); }
  function pickWhere(gen, okf) { for (var i = 0; i < 4000; i++) { var o = gen(); if (o != null && okf(o)) return o; } throw new Error('u6 exits: no valid numbers'); }
  function isSq(n) { var q = Math.round(Math.sqrt(n)); return q * q === n; }
  function radParts(n) { var k = 1, m = n; for (var f = 2; f * f <= m; f++) while (m % (f * f) === 0) { m /= f * f; k *= f; } return { k: k, m: m }; }
  function ptT(p) { return '(' + nT(p[0]) + ',\\ ' + nT(p[1]) + ')'; }
  function ptKey(p) { return '(' + cl(p[0]) + ', ' + cl(p[1]) + ')'; }
  function samePt(a, b) { return same(a[0], b[0]) && same(a[1], b[1]); }
  function mid(a, b) { return [cl((a[0] + b[0]) / 2), cl((a[1] + b[1]) / 2)]; }
  function add(a, b) { return [cl(a[0] + b[0]), cl(a[1] + b[1])]; }
  function sub(a, b) { return [cl(a[0] - b[0]), cl(a[1] - b[1])]; }
  function scl(a, k) { return [cl(a[0] * k), cl(a[1] * k)]; }
  function d2(a, b) { return cl((b[0] - a[0]) * (b[0] - a[0]) + (b[1] - a[1]) * (b[1] - a[1])); }
  function rd(x, dp) { return K.roundTo(x, dp); }
  function red(p, q) { if (q === 0) return null; if (q < 0) { p = -p; q = -q; } var g = gcd(p, q) || 1; return [cl(p / g), cl(q / g)]; }
  function frT(p, q) { return LN.frT(p, q); }
  function slT(s) { return s == null ? '\\text{undefined}' : frT(s[0], s[1]); }
  function rawFr(p, q) { return '\\frac{' + nT(p) + '}{' + nT(q) + '}'; }
  function fracSteps(p, q) { var s = rawFr(p, q); if (q === 0) return s; var r2 = slT(red(p, q)); return r2 === s ? s : s + '=' + r2; }
  function subT(a, b) { return nT(a) + '-' + (b < 0 ? '\\left(' + nT(b) + '\\right)' : nT(b)); }
  function formulaT(A, Bp) { return '\\frac{' + subT(Bp[1], A[1]) + '}{' + subT(Bp[0], A[0]) + '}'; }
  function slopeOf(A, Bp) { return red(cl(Bp[1] - A[1]), cl(Bp[0] - A[0])); }
  function sval(s) { return s == null ? null : s[0] / s[1]; }
  function upDown(r) { return r > 0 ? t(r) + ' up' : r < 0 ? t(-r) + ' down' : 'no change up or down'; }
  var TRIPLES = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [7, 24, 25], [12, 16, 20], [9, 40, 41], [20, 21, 29]];

  /* ================= part makers ================= */
  function numPart(prompt, ans, dl, sol, hints, text, inp) {
    ans = cl(ans);
    var L = (dl || []).filter(function (d) { return d && isFinite(d[0]) && !same(cl(d[0]), ans); });
    var p = B.number(prompt, ans, function (v) { for (var i = 0; i < L.length; i++) if (Math.abs(v - L[i][0]) < 1e-6) return { code: L[i][1], hint: L[i][2] }; return null; }, sol, hints, text, inp);
    p.bad = L.map(function (d) { return String(cl(d[0])); }).filter(function (s, i, a) { return a.indexOf(s) === i; });
    return p;
  }
  function numChk(ans, dl) {
    ans = cl(ans); var L = (dl || []).filter(function (d) { return d && isFinite(d[0]) && !same(cl(d[0]), ans); });
    return K.number(ans, function (v) { for (var i = 0; i < L.length; i++) if (Math.abs(v - L[i][0]) < 1e-6) return { code: L[i][1], hint: L[i][2] }; return null; });
  }

  /* ================= distance and midpoint (adapted from u6l1) ================= */
  function dLine(p, q, name) {
    var dx = cl(q[0] - p[0]), dy = cl(q[1] - p[1]);
    return (name ? name + '=' : '') + '\\sqrt{(' + nT(q[0]) + '-' + sgp(p[0]) + ')^{2}+(' + nT(q[1]) + '-' + sgp(p[1]) + ')^{2}}=\\sqrt{' + sgp(dx) + '^{2}+' + sgp(dy) + '^{2}}=\\sqrt{' + nT(dx * dx) + '+' + nT(dy * dy) + '}=\\sqrt{' + nT(dx * dx + dy * dy) + '}';
  }
  function mLine(p, q, name) {
    return (name ? name + '=' : '') + '\\left(\\dfrac{' + nT(p[0]) + '+' + sgp(q[0]) + '}{2},\\ \\dfrac{' + nT(p[1]) + '+' + sgp(q[1]) + '}{2}\\right)=\\left(\\dfrac{' + nT(p[0] + q[0]) + '}{2},\\ \\dfrac{' + nT(p[1] + q[1]) + '}{2}\\right)=' + ptT(mid(p, q));
  }
  var HD = ['Distance formula: ' + t('d=\\sqrt{(x_2-x_1)^{2}+(y_2-y_1)^{2}}') + '. Find the run and the rise, square each, add, then take the square root.',
    'Watch the signs: subtracting a negative coordinate means adding, e.g. ' + t('3-(-3)=6') + '.'];
  var HM = ['Midpoint formula: ' + t('M\\left(\\dfrac{x_1+x_2}{2},\\ \\dfrac{y_1+y_2}{2}\\right)') + ' — average the ' + t('x') + '-coordinates and average the ' + t('y') + '-coordinates.',
    'Add the coordinates (don’t subtract), then divide each sum by ' + t('2') + '.'];
  var HE = ['If ' + t('M') + ' is the midpoint of ' + t('\\overline{AB}') + ', then ' + t('x_M=\\dfrac{x_A+x_B}{2}') + ', so ' + t('x_B=2x_M-x_A') + ': <b>double the midpoint, then subtract the endpoint you have</b>.',
    'Do the same with the ' + t('y') + '-coordinates. The missing endpoint lies <i>beyond</i> the midpoint, not between.'];
  function dCands(p, q) {
    var dx = cl(q[0] - p[0]), dy = cl(q[1] - p[1]), Dd = Math.sqrt(dx * dx + dy * dy), out = [];
    function put(v, code, hint) { if (!isFinite(v) || v <= 0 || Math.abs(v - Dd) < 1e-6 || out.some(function (o) { return Math.abs(o[0] - v) < 1e-6; })) return; out.push([v, code, hint]); }
    put(dx * dx + dy * dy, 'd-no-root', 'That is ' + t('d^{2}') + ' — the last step of the distance formula is to take the <b>square root</b>.');
    put(Math.abs(dx) + Math.abs(dy), 'd-legs', 'You added the run and the rise. The segment is the <b>hypotenuse</b> of a right triangle: square the run and the rise, add, then take the square root.');
    var sx = cl(q[0] + p[0]), sy = cl(q[1] + p[1]);
    put(Math.sqrt(sx * sx + sy * sy), 'd-added', 'The distance formula <b>subtracts</b> the coordinates (' + t('x_2-x_1') + ' and ' + t('y_2-y_1') + ') — it doesn’t add them.');
    var sh = 'Check your subtraction — subtracting a negative coordinate means adding.';
    put(Math.sqrt(sx * sx + dy * dy), 'd-sign', sh);
    put(Math.sqrt(dx * dx + sy * sy), 'd-sign', sh);
    return out;
  }
  function stripP(s) {
    return String(s == null ? '' : s).replace(/\\(left|right)\b\.?/g, '').replace(/\\lparen/g, '(').replace(/\\rparen/g, ')').replace(/\\[,;!: ]/g, '')
      .replace(/\\\{|\\\}|\\lbrace|\\rbrace/g, ' ').replace(/\\text\{\s*and\s*\}/g, ',').trim();
  }
  function simpleNum(ast) { var sh = ex.shape(ast); if (sh.bare) return true; var pf = ex.plainFraction(ast); return !!(pf && pf[1] > 1 && gcd(pf[0], pf[1]) === 1 && !sh.decimals); }
  function coordPair(str) {
    var xy = str.split(','); if (xy.length !== 2 || !xy[0].trim() || !xy[1].trim()) return null;
    var a = ex.parse(xy[0].trim()), b = ex.parse(xy[1].trim()); if (!a.ok || !b.ok) return null;
    var va = ex.value(a.ast), vb = ex.value(b.ast); if (!isFinite(va) || !isFinite(vb)) return null;
    return { x: va, y: vb, simple: simpleNum(a.ast) && simpleNum(b.ast) };
  }
  function readPts(resp) {
    var s = stripP(resp);
    if (/^\{[\s\S]*\}$/.test(s) && !/^\{[^{}]*\}\{/.test(s)) s = s.slice(1, -1).trim();
    if (!s) return { empty: true };
    var re = /\(([^()]*)\)/g, m, out = [];
    while ((m = re.exec(s))) { var c = coordPair(m[1]); if (!c) return { bad: true }; out.push(c); }
    if (!out.length) {
      var c2 = coordPair(s); if (c2) return { pts: [c2], noParen: true };
      var one = ex.parse(s); if (one.ok && isFinite(ex.value(one.ast))) return { single: true };
      return { bad: true };
    }
    if (s.replace(re, '').replace(/[,;\s]|and/g, '').length) return { bad: true };
    return { pts: out };
  }
  function readRes(L) {
    if (L.empty) return form('empty', 'Type your answer first.');
    if (L.single) return form('pt-not-pair', 'A point needs two coordinates: write it as an ordered pair ' + t('(x,\\ y)') + '.');
    if (L.bad) return form('unreadable', 'Write the point as an ordered pair in brackets, e.g. ' + t('(3,\\ -2)') + ' (press <b>( )</b>, type x, comma, y).');
    return null;
  }
  function ptCheck(W, o) {
    o = o || {};
    return function (resp) {
      var L = readPts(resp), rr = readRes(L); if (rr) return rr;
      if (L.pts.length !== 1) return form('pt-many', 'Give just one point.');
      var p = L.pts[0], Q = [p.x, p.y];
      if (samePt(Q, W)) {
        if (!p.simple) return form('simplify', 'Right point — now simplify each coordinate to a single number (for example ' + t('\\frac{12}{2}=6') + ').');
        if (L.noParen) return form('pt-brackets', 'Right coordinates — write the point in brackets: ' + t('(x,\\ y)') + '.');
        return ok();
      }
      var c = o.cands || [];
      for (var i = 0; i < c.length; i++) if (c[i][0] && samePt(Q, c[i][0])) return wrong(c[i][1], c[i][2]);
      if (same(Q[0], W[0])) return wrong('pt-y', 'Your ' + t('x') + '-coordinate is right — check the ' + (same(Q[1], -W[1]) ? '<b>sign</b> of the ' : '') + t('y') + '-coordinate.');
      if (same(Q[1], W[1])) return wrong('pt-x', 'Your ' + t('y') + '-coordinate is right — check the ' + (same(Q[0], -W[0]) ? '<b>sign</b> of the ' : '') + t('x') + '-coordinate.');
      return wrong('pt', null);
    };
  }
  function ptsCheck(want, o) {
    o = o || {};
    return function (resp) {
      var L = readPts(resp), rr = readRes(L); if (rr) return rr;
      var A = []; L.pts.forEach(function (p) { if (!A.some(function (q) { return samePt([q.x, q.y], [p.x, p.y]); })) A.push(p); });
      var miss = want.filter(function (w) { return !A.some(function (p) { return samePt([p.x, p.y], w); }); });
      var extra = A.filter(function (p) { return !want.some(function (w) { return samePt([p.x, p.y], w); }); });
      if (!miss.length && !extra.length) {
        if (A.some(function (p) { return !p.simple; })) return form('simplify', 'Right points — now simplify each coordinate to a single number.');
        if (L.noParen) return form('pt-brackets', 'Right coordinates — write each point in brackets: ' + t('(x,\\ y)') + '.');
        return ok();
      }
      if (o.diag) { var h = o.diag(A.map(function (p) { return [p.x, p.y]; })); if (h) return wrong(h.code, h.hint); }
      if (miss.length && !extra.length) return wrong(o.missCode || 'pts-missing', o.missHint || 'Correct so far — but there is another point that works.');
      if (extra.length && !miss.length) return wrong('pts-extra', 'One of your points doesn’t satisfy the conditions — check each one.');
      return wrong('pts', null);
    };
  }
  function ptPart(prompt, W, o, sol, hints, text) {
    o = o || {};
    var bad = [];
    (o.cands || []).map(function (c) { return c[0]; }).forEach(function (q) { if (q && !samePt(q, W) && bad.indexOf(ptKey(q)) < 0) bad.push(ptKey(q)); });
    return { prompt: prompt, input: { type: 'math', keys: 'pairs', before: o.before, placeholder: 'e.g. (3, -2)' }, check: ptCheck(W, o), key: ptKey(W), answer: t((o.name || '') + ptT(W)),
      solution: sol, hints: hints || HM, text: text, good: ['\\left(' + cl(W[0]) + ',' + cl(W[1]) + '\\right)'], bad: bad };
  }
  function midCands(a, b) {
    var h = [cl((b[0] - a[0]) / 2), cl((b[1] - a[1]) / 2)], hs = 'You subtracted the coordinates. The midpoint formula <b>adds</b> them and divides by ' + t('2') + ' — it averages each coordinate.';
    return [[h, 'mid-subtract', hs], [scl(h, -1), 'mid-subtract', hs], [add(a, b), 'mid-no-halve', 'You added the coordinates — now divide each sum by ' + t('2') + '.']];
  }
  function endCands(a, m) {
    return [[mid(a, m), 'end-average', 'You averaged the endpoint and the midpoint — that gives the point halfway between them. The missing endpoint is <i>beyond</i> the midpoint: double the midpoint, then subtract the endpoint you have.'],
      [sub(m, a), 'end-step', 'That is the step from the known endpoint to the midpoint. The missing endpoint is one more such step past the midpoint: ' + t('B=2M-A') + '.'],
      [add(scl(m, 2), a), 'end-sign', 'Double the midpoint, then <b>subtract</b> the endpoint you have — watch the signs.'],
      [add(m, a), 'end-sum', 'Double the midpoint first, then subtract the known endpoint: ' + t('x_B=2x_M-x_A') + '.'],
      [scl(m, 2), 'end-double', 'You doubled the midpoint — now subtract the known endpoint.']];
  }

  /* ================= rise, run and slope; drawing a line (adapted from u6l2) ================= */
  function rrPart(nm, A, Bp) {
    var rise = cl(Bp[1] - A[1]), run = cl(Bp[0] - A[0]), sl = slopeOf(A, Bp), slc = K.slope(sl);
    var fields = [{ label: 'Rise', name: 'Rise' }, { label: 'Run', name: 'Run' }, { label: 'Slope', name: 'Slope', mode: 'math', keys: 'slope', placeholder: 'e.g. -2/3' }];
    var key = [String(rise), String(run), slT(sl)];
    var check = function (resp) {
      resp = resp || [];
      var plus = function (v) { return String(v == null ? '' : v).replace(/^\s*\+/, ''); }, pr = HW.parse.number(plus(resp[0])), pn = HW.parse.number(plus(resp[1]));
      if (!pr.ok || !pn.ok) return form('rr-blank', 'Fill in the <b>rise</b> and the <b>run</b> as numbers (with a minus sign for down or left).');
      var r = cl(pr.value), n = cl(pn.value);
      var good = (r === rise && n === run) || (r === -rise && n === -run);
      if (!good) {
        if (Math.abs(r) === Math.abs(run) && Math.abs(n) === Math.abs(rise) && Math.abs(rise) !== Math.abs(run)) return wrong('rr-swap', 'Rise and run are swapped: the <b>rise</b> is the vertical change (up or down), the <b>run</b> is the horizontal change (across).');
        if (Math.abs(r) === Math.abs(rise) && Math.abs(n) === Math.abs(run)) return wrong('rr-sign', 'Right sizes — check the signs. Count from ' + t(nm.charAt(0)) + ' to ' + t(nm.charAt(1)) + ': up and right are positive, down and left are negative.');
        if (Math.abs(r) !== Math.abs(rise)) return wrong('rr-rise', '<b>Rise:</b> count the squares up or down from ' + t(nm.charAt(0)) + ' to ' + t(nm.charAt(1)) + ' again.');
        return wrong('rr-run', '<b>Run:</b> count the squares across from ' + t(nm.charAt(0)) + ' to ' + t(nm.charAt(1)) + ' again.');
      }
      var c = slc(resp[2] == null ? '' : resp[2]);
      if (c.v !== 'correct') return { v: c.v, code: c.code, hint: '<b>Slope:</b> ' + (c.hint || 'divide the rise by the run: ' + t('\\frac{\\text{rise}}{\\text{run}}=' + rawFr(rise, run)) + ', then reduce.') };
      return ok();
    };
    var sol = 'Count from ' + t(nm.charAt(0)) + ' to ' + t(nm.charAt(1)) + ': ' + upDown(rise) + ' and ' + t(Math.abs(run)) + ' ' + (run > 0 ? 'right' : 'left') + '. Rise ' + t(rise) + ', run ' + t(run) + '.<br>' +
      t('\\text{slope}=\\frac{\\text{rise}}{\\text{run}}=' + fracSteps(rise, run)) + '. (Counting from ' + t(nm.charAt(1)) + ' to ' + t(nm.charAt(0)) + ' instead changes both signs, and the slope is the same.)';
    return { prompt: 'Find the rise, the run and the slope of segment ' + t(nm) + ', counting from ' + t(nm.charAt(0)) + ' to ' + t(nm.charAt(1)) + '.', input: { type: 'fields', fields: fields }, check: check, key: key,
      answer: 'Rise ' + t(rise) + ', run ' + t(run) + ', slope ' + t(slT(sl)), solution: sol, text: 'rise/run/slope of ' + nm + ' ' + ptT(A) + ptT(Bp),
      hints: ['Start at ' + t(nm.charAt(0)) + '. Count squares up (+) or down (−) to the level of ' + t(nm.charAt(1)) + ' — that’s the rise. Then count squares right (+) or left (−) — that’s the run.', 'Slope ' + t('=\\frac{\\text{rise}}{\\text{run}}') + ', in lowest terms.'],
      good: [[String(-rise), String(-run), slT(sl)]], bad: [[String(run), String(rise), slT(sl)], [String(rise), String(-run), slT(sl)]].filter(function (b) { return !((b[0] === key[0] && b[1] === key[1]) || (Number(b[0]) === -rise && Number(b[1]) === -run)); }) };
  }
  function gv(pts, pieces) { return { pts: pts || [], pieces: pieces || [], join: 'none' }; }
  function seg(a, b, s, e) { return { v: [a, b], s: s || 'closed', e: e || 'closed' }; }
  function lineV(a, b) { return gv([], [seg(a, b, 'arrow', 'arrow')]); }
  var LINEHELP = '<div class="muted">Use <b>╱ Line</b>: tap the given point, tap a second point on the line, then tap it again to finish. The ends start as arrows (a line goes on forever).</div>';
  function ptPlain(p) { var mn = function (x) { x = cl(x); return x < 0 ? '−' + Math.abs(x) : String(x); }; return '(' + mn(p[0]) + ', ' + mn(p[1]) + ')'; }
  function bgPt(P0, w) { var o = { x: P0[0], y: P0[1] }; if (P0[0] <= w.x[1] - 4 && P0[1] <= w.y[1] - 1) o.label = ptPlain(P0); return o; }
  function lineInfo(resp) { var g = D.geom(resp), ks = Object.keys(g.lines); return { g: g, ks: ks, L: ks.length === 1 ? g.lines[ks[0]] : null }; }
  function lineDiag(L, P0, sl) {
    var near = function (a, b) { return Math.abs(a - b) < 1e-9; };
    var thr = Math.abs(L.A * P0[0] + L.B * P0[1] - L.C) < 1e-6, ms = L.B === 0 ? null : -L.A / L.B, mt = sl[1] === 0 ? null : sl[0] / sl[1];
    var sameM = (ms === null && mt === null) || (ms !== null && mt !== null && near(ms, mt));
    if (sameM && !thr) return wrong('draw-point', 'Right steepness — but the line has to pass through the given point ' + t(ptT(P0)) + '. Start there.');
    if (!thr || sameM) return null;
    var pq = t(Math.abs(sl[0])) + ' ' + (mt >= 0 ? 'up' : 'down') + ' for every ' + t(sl[1]) + ' to the right';
    if (ms !== null && mt !== null && mt !== 0 && near(ms, -mt)) return wrong('draw-slope-sign', 'Your line goes through ' + t(ptT(P0)) + ', but it ' + (ms > 0 ? 'rises' : 'falls') + ' from left to right. A ' + (mt > 0 ? 'positive' : 'negative') + ' slope ' + (mt > 0 ? 'rises' : 'falls') + ': step ' + pq + '.');
    if (ms !== null && mt !== null && mt !== 0 && near(ms, 1 / mt)) return wrong('draw-slope-flip', 'Your line has rise and run swapped. From ' + t(ptT(P0)) + ' step ' + pq + ' (the top number of the slope is the rise).');
    return wrong('draw-slope', 'Your line passes through ' + t(ptT(P0)) + ' but its slope is ' + t(ms === null ? '\\text{undefined}' : slT(LN.toFr(ms))) + '. From ' + t(ptT(P0)) + ' step ' + pq + '.');
  }
  function lineDrawPart(prompt, P0, sl, win, P1, sol, hints, text) {
    var target = lineV(P0, P1), W = [];
    var flipS = [P0[0] + sl[0], P0[1] + sl[1]], sgnS = [P0[0] + sl[1], P0[1] - sl[0]];
    W.push({ is: lineV(P0, sgnS), code: 'draw-slope-sign', hint: 'Check the direction: a ' + (sl[0] / sl[1] > 0 ? 'positive slope rises' : 'negative slope falls') + ' from left to right.' });
    if (Math.abs(sl[0]) !== Math.abs(sl[1])) W.push({ is: lineV(P0, flipS), code: 'draw-slope-flip', hint: 'Rise and run are swapped: the top of the slope is the rise (up/down), the bottom is the run (across).' });
    var exact = K.graphExact(target, { wrong: W });
    var check = function (resp) {
      if (D.empty(resp)) return form('empty', 'Draw the line on the grid first.');
      if (D.same(resp, target)) return ok();
      var li = lineInfo(resp);
      if (li.L) { var d = lineDiag(li.L, P0, sl); if (d) return d; }
      return exact(resp);
    };
    var inp = { x: win.x, y: win.y, labels: 2, defaultEnd: 'arrow', tools: ['line', 'ends'], bg: { points: [bgPt(P0, win)] } };
    var p = B.graph(prompt + LINEHELP, inp, check, target, sol, hints, text);
    p.bad = W.map(function (w) { return w.is; }).concat([lineV([P0[0] + 1, P0[1]], [P1[0] + 1, P1[1]])]);
    return p;
  }
  function coordSlopePart(prompt, A, Bp, text) {
    var sl = slopeOf(A, Bp), rise = cl(Bp[1] - A[1]), run = cl(Bp[0] - A[0]);
    var sol = t('m=\\frac{y_2-y_1}{x_2-x_1}=' + formulaT(A, Bp) + '=' + fracSteps(rise, run)) + '.';
    var p = B.slope(prompt, sl, {}, sol, ['Use ' + t('m=\\frac{y_2-y_1}{x_2-x_1}') + ', subtracting in the <b>same order</b> on the top and the bottom.', 'Watch the signs when you subtract a negative: ' + t('a-(-b)=a+b') + '.'], text);
    p.bad = [slT(red(-rise, run)), slT(red(run, rise))].filter(function (b) { return b !== p.key; });
    return p;
  }

  /* ================= intercept / slope boxes with "none" (adapted from u6l4) ================= */
  function readAns(resp) {
    var s = String(resp == null ? '' : resp).replace(/\\left|\\right/g, '').trim();
    if (!s) return { empty: true };
    var low = s.replace(/\\text\{([^}]*)\}|\\mathrm\{([^}]*)\}/g, function (m, a, b) { return a || b; }).replace(/\s+/g, ' ').trim().toLowerCase();
    if (/^(none|no|no intercepts?|no [xy]-?intercepts?|there is none|\\emptyset|\\varnothing|∅)$/.test(low)) return { none: true };
    if (/^(undefined|undef|no slope|infinite|infinity|\\infty|∞)$/.test(low)) return { und: true };
    var m = /^\(\s*([^,()]+?)\s*,\s*([^,()]+?)\s*\)$/.exec(s);
    if (m) { var a = ex.parse(m[1]), b = ex.parse(m[2]); if (a.ok && b.ok && isFinite(ex.value(a.ast)) && isFinite(ex.value(b.ast))) return { pt: [ex.value(a.ast), ex.value(b.ast)] }; return { bad: true }; }
    var r = K.read(s); if (r.res) return { res: r.res };
    if (!isFinite(r.val)) return { bad: true };
    var pf = ex.plainFraction(r.ast), sh = ex.shape(r.ast);
    return { v: r.val, simple: !!(sh.bare || pf), lowest: !pf || pf[1] === 1 || gcd(pf[0], pf[1]) === 1, dec: sh.decimals > 0 };
  }
  function valChk(want, o) {
    o = o || {};
    var v0 = o.v || 'x', w0 = v0 === 'x' ? 'y' : 'x', isX = v0 === 'x';
    return function (resp) {
      var a = readAns(resp);
      if (a.empty) return form('empty', 'Fill in this box (or press <b>none</b>).');
      if (a.res) return a.res;
      if (a.bad) return form('unreadable', 'Write a single number, or <b>none</b>.');
      if (a.und) return wrong('ic-und', '“Undefined” describes a slope, not an intercept. An intercept is the number where the line crosses the axis — or <b>none</b> if it never crosses it.');
      if (a.none) return want == null ? ok() : wrong('ic-said-none', 'This line does cross the ' + t(v0) + '-axis — find where.');
      var v;
      if (a.pt) {
        if (!(isX ? same(a.pt[1], 0) : same(a.pt[0], 0))) return wrong('ic-pt', 'That point isn’t on the ' + t(v0) + '-axis. An ' + v0 + '-intercept is where ' + t(w0 + '=0') + '.');
        v = isX ? a.pt[0] : a.pt[1];
      } else v = a.v;
      if (want == null) return wrong('ic-not-none', o.notNone || 'Check again: does the line ever meet the ' + t(v0) + '-axis? If it never does, press <b>none</b>.');
      if (same(v, want)) {
        if (!a.pt && !a.lowest) return form('lowest', 'Right — now reduce the fraction to lowest terms.');
        if (!a.pt && !a.simple) return form('simplify', 'Right value — now simplify it to a single number.');
        return ok();
      }
      if (o.other != null && same(v, o.other)) return wrong('int-swap', 'That’s the ' + w0 + '-intercept. The ' + t(v0) + '-intercept is where the graph crosses the ' + t(v0) + '-axis, where ' + t(w0 + '=0') + '.');
      if (want !== 0 && same(v, -want)) return wrong('sign', 'Check the sign of your answer.');
      return wrong('value', null);
    };
  }
  function slopeChk(sl) {
    var base = K.slope(sl), zero = sl != null && sval(sl) === 0;
    return function (resp) {
      var a = readAns(resp);
      if (a.empty) return form('empty', 'Fill in the slope.');
      if (a.none) {
        if (sl == null) return form('slope-none', 'For a vertical line we say the slope is <b>undefined</b> (the run is ' + t('0') + ') — use the <b>undefined</b> key.');
        return wrong('slope-none', zero ? 'A horizontal line does have a slope: the rise is ' + t('0') + ', so the slope is ' + t('0') + '.' : 'Every slanted line has a slope: rise ÷ run.');
      }
      if (a.pt) return form('unreadable', 'Give the slope as a number or a fraction.');
      if (a.und && zero) return wrong('slope-und0', '“Undefined” is the slope of a <b>vertical</b> line. This one is horizontal: the rise is ' + t('0') + ', so the slope is ' + t('0') + '.');
      return base(resp);
    };
  }
  function fMath(label, ph, keys) { return { label: label, name: label.replace(/\\\(|\\\)/g, '').replace(/:\s*$/, ''), mode: 'math', keys: keys || 'slope', none: true, placeholder: ph || 'e.g. -2, 1/2 or none' }; }
  function G(spec) { return HW.graph(Object.assign({ x: [-6, 6], y: [-6, 6], labels: 2, max: 300 }, spec)); }
  function fullLine(p, q, w) { w = w || 6; var xr = [-w + 0.35, w - 0.35], yr = [-w + 0.35, w - 0.35]; return { pts: [D.toEdge(p, q, xr, yr), D.toEdge(q, p, xr, yr)], start: 'arrow', end: 'arrow' }; }
  function tbl(xs, ys, xn, yn) { var cell = function (v) { return v == null ? '?' : typeof v === 'string' ? v : t(nT(v)); }; return HW.valueTable([[xn || t('x')].concat(xs.map(cell)), [yn || t('y')].concat(ys.map(cell))]); }

  /* =====================================================================================================
   * Lesson 1 — Length, distance and midpoint of a line segment (RF3)
   * ===================================================================================================== */
  var NAMES2 = [['A', 'B'], ['P', 'Q'], ['C', 'D'], ['R', 'S'], ['E', 'F'], ['J', 'K']];
  HW.defineExit({
    lesson: 'u6l1', calc: true,
    blurb: 'The distance between two points, the midpoint of a segment, a missing endpoint, and points at a given distance on a line.',
    questions: [
      { num: '1', outcome: 'RF3', stem: 'Determine the distance between the two points.', parts: [
        { id: '1', outcome: 'RF3', level: 'BEG', make: function (r) {
          var tr = r.pick(TRIPLES.slice(0, 7)), sw = r.chance(0.5), dx = (sw ? tr[1] : tr[0]) * (r.chance(0.5) ? 1 : -1), dy = (sw ? tr[0] : tr[1]) * (r.chance(0.5) ? 1 : -1);
          var A = pickWhere(function () { return [r.int(-12, 12), r.int(-12, 12)]; }, function (A) { var B0 = [A[0] + dx, A[1] + dy]; return Math.abs(B0[0]) <= 20 && Math.abs(B0[1]) <= 20 && (A[0] < 0 || A[1] < 0 || B0[0] < 0 || B0[1] < 0); });
          var Bp = [A[0] + dx, A[1] + dy], nm = r.pick(NAMES2), Dd = tr[2];
          return numPart(t(nm[0] + ptT(A)) + ' and ' + t(nm[1] + ptT(Bp)), Dd, dCands(A, Bp),
            t(dLine(A, Bp, nm[0] + nm[1]) + '=' + Dd) + '.', HD, 'distance between two points', { before: t(nm[0] + nm[1] + '=') });
        } }] },
      { num: '2', outcome: 'RF3', stem: 'Determine the coordinates of the midpoint of the segment with the given endpoints.', parts: [
        { id: '2', outcome: 'RF3', level: 'EMG', make: function (r) {
          var A = [r.int(-12, 12), r.int(-12, 12)], Bp = pickWhere(function () { return [r.int(-12, 12), r.int(-12, 12)]; }, function (q) { return Math.abs(q[0] - A[0]) >= 4 && Math.abs(q[1] - A[1]) >= 4 && (q[0] < 0 || A[0] < 0) && (q[1] < 0 || A[1] < 0) && !(q[0] + A[0] === 0 && q[1] + A[1] === 0); });
          var nm = r.pick(NAMES2), M = mid(A, Bp);
          return ptPart(t(nm[0] + ptT(A)) + ' and ' + t(nm[1] + ptT(Bp)), M, { cands: midCands(A, Bp), before: t('M='), name: 'M' }, t(mLine(A, Bp, 'M')) + '.', HM, 'midpoint');
        } }] },
      { num: '3', outcome: 'RF3', stem: function (s) { return t('M') + ' is the midpoint of ' + t('\\overline{' + s.nm[0] + s.nm[1] + '}') + '. Its endpoint ' + t(s.nm[0] + ptT(s.A)) + ' and the midpoint ' + t('M' + ptT(s.M)) + ' are given.'; },
        shared: function (r) { var A = [r.int(-9, 9), r.int(-9, 9)], Bp = pickWhere(function () { return [r.int(-12, 12), r.int(-12, 12)]; }, function (q) { return Math.abs(q[0] - A[0]) >= 4 && Math.abs(q[1] - A[1]) >= 4 && (q[0] - A[0]) % 2 === 0 && (q[1] - A[1]) % 2 === 0; }); return { A: A, Bp: Bp, M: mid(A, Bp), nm: r.pick(NAMES2) }; },
        parts: [
          { id: '3', outcome: 'RF3', level: 'PRG', make: function (r, s) {
            var A = s.A, M = s.M, Bp = s.Bp, nb = s.nm[1];
            return ptPart('Determine the coordinates of ' + t(nb) + '.', Bp, { cands: endCands(A, M), before: t(nb + '='), name: nb },
              t('x_{' + nb + '}=2x_M-x_{' + s.nm[0] + '}=2(' + nT(M[0]) + ')-' + sgp(A[0]) + '=' + nT(Bp[0])) + '<br>' + t('y_{' + nb + '}=2y_M-y_{' + s.nm[0] + '}=2(' + nT(M[1]) + ')-' + sgp(A[1]) + '=' + nT(Bp[1])) + '<br>' + t(nb + ptT(Bp)) + '. Check: ' + t(mLine(A, Bp)) + ' ✓',
              HE, 'missing endpoint');
          } }] },
      { num: '4', outcome: 'RF3',
        shared: function (r) {
          return pickWhere(function () {
            var tr = r.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 6, 10], [4, 3, 5], [12, 5, 13], [9, 12, 15], [12, 9, 15]]), A = [r.int(-6, 6), r.int(-6, 6)], vert = r.chance(0.5), sgn = r.chance(0.5) ? 1 : -1, k = (vert ? A[0] : A[1]) + sgn * tr[0];
            var pts = vert ? [[k, A[1] + tr[1]], [k, A[1] - tr[1]]] : [[A[0] + tr[1], k], [A[0] - tr[1], k]];
            return { A: A, vert: vert, k: k, d: tr[2], leg: tr[0], other: tr[1], pts: pts, nm: r.pick(NAMES2) };
          }, function (s) { return Math.abs(s.k) <= 12 && s.k !== 0 && s.pts.every(function (p) { return Math.abs(p[0]) <= 20 && Math.abs(p[1]) <= 20; }); });
        },
        stem: function (s) { return 'Point ' + t(s.nm[1]) + ' lies on the ' + (s.vert ? 'vertical' : 'horizontal') + ' line ' + t((s.vert ? 'x=' : 'y=') + s.k) + ', and its distance from ' + t(s.nm[0] + ptT(s.A)) + ' is ' + t(s.nm[0] + s.nm[1] + '=' + s.d) + ' units.'; },
        parts: [
          { id: '4', outcome: 'RF3', level: 'ADV', make: function (r, s) {
            var A = s.A, nb = s.nm[1], pts = s.pts, vert = s.vert, leg = s.leg, oth = s.other, k = s.k;
            var wrongLeg = vert ? [[k, A[1] + s.d], [k, A[1] - s.d]] : [[A[0] + s.d, k], [A[0] - s.d, k]];
            var chk = ptsCheck(pts, { missCode: 'u6x-one-pt', missHint: 'That point works — but there is a second one, on the other side of ' + t(s.nm[0]) + ' (' + (vert ? 'above and below' : 'left and right') + ').',
              diag: function (L) { return L.length && L.every(function (p) { return wrongLeg.some(function (w) { return samePt(w, p); }); }) ? { code: 'u6x-leg', hint: 'The distance ' + t(s.d) + ' is the slanted side (the hypotenuse), not the ' + (vert ? 'vertical' : 'horizontal') + ' change. The ' + (vert ? 'horizontal' : 'vertical') + ' change is ' + t(leg) + ', so use ' + t(leg + '^{2}+c^{2}=' + s.d + '^{2}') + '.' } : null; } });
            var ord = vert ? 'y' : 'x';
            return { prompt: 'Determine the coordinates of every possible point ' + t(nb) + '.', input: { type: 'math', keys: 'pairs', placeholder: 'e.g. (3, -2), (3, 6)' }, check: chk,
              key: pts.map(ptKey).join(', '), answer: t(pts.map(ptT).join(',\\ ')),
              solution: 'On the line ' + t((vert ? 'x=' : 'y=') + k) + ' the ' + (vert ? 'horizontal' : 'vertical') + ' change from ' + t(s.nm[0]) + ' is ' + t(leg) + '. Let the other change be ' + t('c') + ':<br>' + t(leg + '^{2}+c^{2}=' + s.d + '^{2}') + ', so ' + t('c^{2}=' + (s.d * s.d) + '-' + (leg * leg) + '=' + oth * oth) + ' and ' + t('c=\\pm' + oth) + '.<br>' + t(ord + '=' + (vert ? A[1] : A[0]) + '\\pm' + oth) + ', so ' + t(nb) + ' is ' + t(ptT(pts[0])) + ' or ' + t(ptT(pts[1])) + '.',
              hints: ['Draw it: ' + t(s.nm[0]) + ', the line ' + t((vert ? 'x=' : 'y=') + k) + ', and a right triangle with hypotenuse ' + t(s.d) + '.', 'One leg is the distance from ' + t(s.nm[0]) + ' to the line, ' + t(leg) + '. Find the other leg — it can go either way.'],
              text: 'points at a given distance on a line', good: [pts.slice().reverse().map(ptKey).join(', ')], bad: [ptKey(pts[0]), wrongLeg.map(ptKey).join(', ')] };
          } }] }
    ]
  });

  /* =====================================================================================================
   * Lesson 2 — Rise over run: the slope of a line segment (RF3)
   * ===================================================================================================== */
  var SLOPES = [[1, 2], [2, 3], [3, 4], [3, 2], [4, 3], [2, 5], [5, 2], [1, 3], [3, 5], [-1, 2], [-2, 3], [-3, 4], [-3, 2], [-4, 3], [-2, 5], [-5, 2], [-1, 3], [-3, 5]];
  var RAMPS = [
    { what: 'A wheelchair ramp', rule: function (k) { return 'A building code says a wheelchair ramp may have a slope of <b>no more than</b> ' + t('\\frac{1}{' + k + '}') + '.'; }, ask: function (h) { return 'A ramp must rise ' + t(nT(h)) + ' m to reach a doorway. What is the <b>shortest</b> run (horizontal length) that meets the code?'; }, ks: [12, 15, 16, 20], hs: [0.36, 0.45, 0.48, 0.6, 0.72, 0.75, 0.9] },
    { what: 'A loading ramp', rule: function (k) { return 'A loading ramp for a truck should have a slope of no more than ' + t('\\frac{1}{' + k + '}') + ' so that carts can be pushed up it safely.'; }, ask: function (h) { return 'The truck bed is ' + t(nT(h)) + ' m above the ground. What is the <b>shortest</b> run the ramp can have?'; }, ks: [4, 5, 6, 8], hs: [0.9, 1.2, 1.25, 1.5, 0.8, 1.1] }];
  /* the end of the roof: an isosceles triangle drawn to scale, span along the bottom, dashed height to the peak */
  function roofFig(a, w) {
    var x0 = 30, x1 = 270, yb = 128, hp = 120 * a / 12, xm = (x0 + x1) / 2, ink = '#2b3340';
    var body = '<path d="M' + x0 + ' ' + yb + ' L' + xm + ' ' + (yb - hp).toFixed(1) + ' L' + x1 + ' ' + yb + ' Z" fill="#eef0f2" stroke="' + ink + '" stroke-width="2"/>' +
      '<line x1="' + xm + '" y1="' + (yb - hp).toFixed(1) + '" x2="' + xm + '" y2="' + yb + '" stroke="' + ink + '" stroke-width="1.4" stroke-dasharray="5 4"/>' +
      '<path d="M' + xm + ' ' + (yb - 10) + ' H' + (xm + 10) + ' V' + yb + '" fill="none" stroke="' + ink + '" stroke-width="1.1"/>' +
      '<text x="' + (xm - 8) + '" y="' + (yb - hp / 2).toFixed(1) + '" text-anchor="end" font-style="italic" fill="' + ink + '">h</text>' +
      '<line x1="' + x0 + '" y1="' + (yb + 14) + '" x2="' + x1 + '" y2="' + (yb + 14) + '" stroke="' + ink + '" stroke-width="1.1"/>' +
      '<line x1="' + x0 + '" y1="' + (yb + 9) + '" x2="' + x0 + '" y2="' + (yb + 19) + '" stroke="' + ink + '" stroke-width="1.1"/><line x1="' + x1 + '" y1="' + (yb + 9) + '" x2="' + x1 + '" y2="' + (yb + 19) + '" stroke="' + ink + '" stroke-width="1.1"/>' +
      '<rect x="' + (xm - 26) + '" y="' + (yb + 6) + '" width="52" height="16" fill="#fff"/><text x="' + xm + '" y="' + (yb + 19) + '" text-anchor="middle" fill="' + ink + '">' + HW.esc(String(w).replace('.', '.')) + ' m</text>' +
      '<text x="' + ((xm + x1) / 2 + 14).toFixed(1) + '" y="' + (yb - hp / 2 - 6).toFixed(1) + '" fill="' + ink + '" font-size="13">pitch ' + a + ' in 12</text>';
    var top = Math.max(0, Math.floor(yb - hp - 12));
    return '<div style="margin:.4em 0"><svg viewBox="0 ' + top + ' 300 ' + (yb + 30 - top) + '" width="100%" style="max-width:340px;display:block" role="img" aria-label="isosceles roof triangle, span ' + w + ' m" font-family="KaTeX_Main, \'Times New Roman\', serif" font-size="15">' + body + '</svg></div>';
  }
  HW.defineExit({
    lesson: 'u6l2', calc: true,
    blurb: 'Rise, run and slope of a segment on a grid, drawing a line from a point and a slope, and slope in ramps and roofs.',
    questions: [
      { num: '1', outcome: 'RF3',
        shared: function (r) {
          return pickWhere(function () {
            var rise = r.pick(nz(-8, 8)), run = r.int(2, 8), A = [r.int(-6, 6 - run), r.int(-6, 6)], Bp = [A[0] + run, A[1] + rise];
            if (r.chance(0.5)) { var tmp = A; A = Bp; Bp = tmp; }
            return { A: A, Bp: Bp, nm: r.pick(NAMES2) };
          }, function (s) { return Math.abs(s.Bp[1]) <= 6 && Math.abs(s.A[1]) <= 6 && Math.abs(s.Bp[1] - s.A[1]) !== Math.abs(s.Bp[0] - s.A[0]) && Math.abs(s.Bp[1] - s.A[1]) >= 1; });
        },
        stem: function (s) { return 'Segment ' + t(s.nm[0] + s.nm[1]) + ' has endpoints on grid points.' + HW.graph({ x: [-7, 7], y: [-7, 7], labels: 2, segs: [{ pts: [s.A, s.Bp] }], points: [{ x: s.A[0], y: s.A[1], label: s.nm[0] }, { x: s.Bp[0], y: s.Bp[1], label: s.nm[1] }], max: 320, aria: 'segment on a grid' }); },
        parts: [
          { id: '1', outcome: 'RF3', level: 'BEG', make: function (r, s) { return rrPart(s.nm[0] + s.nm[1], s.A, s.Bp); } }] },
      { num: '2', outcome: 'RF3',
        shared: function (r) {
          return pickWhere(function () { var sl = r.pick(SLOPES), P0 = [r.int(-5, 5), r.int(-5, 5)]; return { sl: sl, P0: P0, P1: [P0[0] + sl[1], P0[1] + sl[0]] }; },
            function (s) { return Math.abs(s.P1[0]) <= 7 && Math.abs(s.P1[1]) <= 7; });
        },
        stem: function (s) { return 'A line passes through the point ' + t(ptT(s.P0)) + ' and has a slope of ' + t(frT(s.sl[0], s.sl[1])) + '.'; },
        parts: [
          { id: '2', outcome: 'RF3', level: 'EMG', make: function (r, s) {
            var sl = s.sl, P0 = s.P0, P1 = s.P1;
            return lineDrawPart('Draw the line on the grid.', P0, sl, { x: [-7, 7], y: [-7, 7] }, P1,
              'From ' + t(ptT(P0)) + ' step ' + t(Math.abs(sl[0])) + ' ' + (sl[0] > 0 ? 'up' : 'down') + ' and ' + t(sl[1]) + ' to the right to reach ' + t(ptT(P1)) + ', then draw the line through both points (arrows on both ends).',
              ['Slope ' + t(frT(sl[0], sl[1])) + ' means a rise of ' + t(sl[0]) + ' for a run of ' + t(sl[1]) + '. A negative rise goes down.', 'Start at ' + t(ptT(P0)) + ', step the rise and run to a second point, and draw the line through both.'], 'draw a line from a point and a slope');
          } }] },
      { num: '3', outcome: 'RF3',
        shared: function (r) { var c = r.pick(RAMPS); return { c: c, k: r.pick(c.ks), h: r.pick(c.hs) }; },
        stem: function (s) { return s.c.rule(s.k); },
        parts: [
          { id: '3', outcome: 'RF3', level: 'PRG', make: function (r, s) {
            var k = s.k, h = s.h, run = cl(k * h);
            return numPart(s.c.ask(h), run, [[cl(h / k), 'u6x-run-div', 'A ramp is much longer than it is high. Slope ' + t('=\\frac{\\text{rise}}{\\text{run}}') + ', so ' + t('\\frac{' + nT(h) + '}{\\text{run}}=\\frac{1}{' + k + '}') + ' and the run is ' + t(nT(h) + '\\times' + k) + '.'], [cl(1 / k * h), 'u6x-run-div', 'Solve ' + t('\\frac{' + nT(h) + '}{\\text{run}}=\\frac{1}{' + k + '}') + ' for the run: multiply ' + t(nT(h)) + ' by ' + t(k) + '.'], [cl(k + h), 'u6x-run-mult', 'The run is ' + t(k) + ' <b>times</b> the rise, not ' + t(k) + ' more than it.']],
              'Slope ' + t('=\\frac{\\text{rise}}{\\text{run}}\\le\\frac{1}{' + k + '}') + ', so the run must be at least ' + t(k) + ' times the rise.<br>' + t('\\frac{' + nT(h) + '}{\\text{run}}=\\frac{1}{' + k + '}') + ' → ' + t('\\text{run}=' + k + '\\times' + nT(h) + '=' + nT(run)) + ' m. (A longer run gives a gentler slope, which also meets the code.)',
              ['Slope ' + t('=\\frac{\\text{rise}}{\\text{run}}') + '. Put in the rise and the greatest slope allowed, then solve for the run.', 'A slope of ' + t('\\frac{1}{' + k + '}') + ' means ' + t(k) + ' units of run for every ' + t('1') + ' unit of rise.'], 'ramp run', { after: 'm' });
          } }] },
      { num: '4', outcome: 'RF3',
        shared: function (r) { return pickWhere(function () { var a = r.pick([3, 4, 5, 6, 8, 9, 10]), w = r.pick([6, 7.2, 8, 9, 9.6, 10, 12]); return { a: a, w: w, h: cl(a / 12 * w / 2) }; }, function (s) { return Math.abs(s.h * 100 - Math.round(s.h * 100)) < 1e-6 && s.h >= 1; }); },
        stem: function (s) { return 'A garage roof has the shape of an isosceles triangle. It spans ' + t(nT(s.w)) + ' m from wall to wall, and the peak is directly above the middle. Each side of the roof has a pitch of ' + t(s.a) + ' in ' + t('12') + ': it rises ' + t(s.a) + ' units for every ' + t('12') + ' units of run.' + roofFig(s.a, s.w); },
        parts: [
          { id: '4', outcome: 'RF3', level: 'ADV', make: function (r, s) {
            var a = s.a, w = s.w, h = s.h, A = cl(w * h / 2), hf = cl(a / 12 * w), hp = cl(12 / a * w / 2);
            var ch = numChk(h, [[hf, 'u6x-full-span', 'Each side of the roof only covers <b>half</b> the span: the run from a wall to the peak is ' + t(nT(w) + '\\div 2=' + nT(w / 2)) + ' m.'], [hp, 'u6x-pitch-flip', 'The pitch ' + t(a) + ' in ' + t('12') + ' is a slope of ' + t('\\frac{' + a + '}{12}') + ' (rise over run), so the height is ' + t('\\frac{' + a + '}{12}\\times') + ' the run.']]);
            var ca = numChk(A, [[cl(w * h), 'u6x-no-half', 'The area of a triangle is ' + t('\\frac{1}{2}\\times\\text{base}\\times\\text{height}') + ' — don’t forget the ' + t('\\frac{1}{2}') + '.'], [h, 'u6x-height', 'That is the height of the peak. The area is ' + t('\\frac{1}{2}\\times' + nT(w) + '\\times' + nT(h)) + '.'], [cl(w * hf / 2), 'u6x-full-span', 'Find the height with the run from a wall to the peak (half the span), then use the whole span as the base.']]);
            var p0 = B.fields('Determine the height of the peak above the top of the walls, and the area of the triangular end of the roof.', [{ label: 'Height:', name: 'Height', mode: 'number', after: 'm' }, { label: 'Area:', name: 'Area', mode: 'number', after: 'm²' }], [ch, ca], [String(h), String(A)],
              'Height ' + t(nT(h)) + ' m, area ' + t(nT(A)) + ' m²',
              'The run from a wall to the peak is half the span: ' + t(nT(w) + '\\div 2=' + nT(w / 2)) + ' m.<br>Slope ' + t('=\\frac{\\text{rise}}{\\text{run}}=\\frac{' + a + '}{12}') + ', so the rise is ' + t('\\frac{' + a + '}{12}\\times' + nT(w / 2) + '=' + nT(h)) + ' m.<br>Area ' + t('=\\frac{1}{2}\\times' + nT(w) + '\\times' + nT(h) + '=' + nT(A)) + ' m².',
              ['Each sloped side runs from a wall to the point under the peak: half the span.', 'Rise ' + t('=\\text{slope}\\times\\text{run}') + '. Then use ' + t('A=\\frac{1}{2}bh') + ' with the whole span as the base.'], 'roof pitch height and area');
            p0.bad = [[String(hf), String(cl(w * hf / 2))], [String(h), String(cl(w * h))]];
            return p0;
          } }] }
    ]
  });

  /* =====================================================================================================
   * Lesson 3 — Slope formula, collinear points, parallel and perpendicular lines (RF3)
   * ===================================================================================================== */
  function perpChk(m, kind) { // kind 'par' | 'perp'; m = slope of the given segment [p, q] (p ≠ 0)
    var want = kind === 'par' ? m : red(-m[1], m[0]), mv = sval(m);
    return K.slope(want, { diag: function (v) {
      if (kind === 'perp') {
        if (same(v, mv)) return { code: 'u6x-perp-same', hint: 'Perpendicular lines don’t have equal slopes (that is parallel). Their slopes are <b>negative reciprocals</b>: flip the fraction and change the sign.' };
        if (same(v, -mv)) return { code: 'u6x-perp-sign', hint: 'You changed the sign — now also take the <b>reciprocal</b> (flip the fraction).' };
        if (same(v, 1 / mv)) return { code: 'u6x-perp-recip', hint: 'You flipped the fraction — now also change the <b>sign</b>.' };
      } else if (same(v, -1 / mv)) return { code: 'u6x-par-perp', hint: 'That is the perpendicular slope. Parallel lines have <b>equal</b> slopes.' };
      return null;
    } });
  }
  HW.defineExit({
    lesson: 'u6l3', calc: true,
    blurb: 'The slope formula, parallel and perpendicular slopes, an unknown coordinate from perpendicular segments, and collinear points.',
    questions: [
      { num: '1', outcome: 'RF3', stem: 'Use the slope formula to determine the slope of the segment with the given endpoints.', parts: [
        { id: '1', outcome: 'RF3', level: 'BEG', make: function (r) {
          var v = pickWhere(function () { var A = [r.int(-12, 12), r.int(-12, 12)], Bp = [r.int(-12, 12), r.int(-12, 12)]; return { A: A, Bp: Bp }; },
            function (v) { var dx = v.Bp[0] - v.A[0], dy = v.Bp[1] - v.A[1]; return dx !== 0 && dy !== 0 && Math.abs(dx) !== Math.abs(dy) && (v.A[0] < 0 || v.Bp[0] < 0) && (v.A[1] < 0 || v.Bp[1] < 0) && Math.abs(dx) <= 16 && Math.abs(dy) <= 16; });
          var nm = r.pick(NAMES2);
          return coordSlopePart(t(nm[0] + ptT(v.A)) + ' and ' + t(nm[1] + ptT(v.Bp)), v.A, v.Bp, 'slope formula');
        } }] },
      { num: '2', outcome: 'RF3',
        shared: function (r) {
          return pickWhere(function () { var A = [r.int(-9, 9), r.int(-9, 9)], Bp = [r.int(-9, 9), r.int(-9, 9)]; return { A: A, Bp: Bp, nm: r.pick(NAMES2) }; },
            function (s) { var dx = s.Bp[0] - s.A[0], dy = s.Bp[1] - s.A[1]; return dx !== 0 && dy !== 0 && Math.abs(dx) !== Math.abs(dy) && red(dy, dx)[1] !== 1 && Math.abs(red(dy, dx)[0]) !== 1; });
        },
        stem: function (s) { return 'Segment ' + t(s.nm[0] + s.nm[1]) + ' joins ' + t(s.nm[0] + ptT(s.A)) + ' and ' + t(s.nm[1] + ptT(s.Bp)) + '.'; },
        parts: [
          { id: '2', outcome: 'RF3', level: 'EMG', make: function (r, s) {
            var A = s.A, Bp = s.Bp, m = slopeOf(A, Bp), pm = red(-m[1], m[0]), nm = s.nm[0] + s.nm[1];
            var p0 = B.fields('Determine the slope of a line <b>parallel</b> to ' + t(nm) + ' and the slope of a line <b>perpendicular</b> to ' + t(nm) + '.', [{ label: 'Parallel:', name: 'Parallel slope', mode: 'math', keys: 'slope', before: t('m='), placeholder: 'e.g. -2/3' }, { label: 'Perpendicular:', name: 'Perpendicular slope', mode: 'math', keys: 'slope', before: t('m='), placeholder: 'e.g. 3/2' }],
              [perpChk(m, 'par'), perpChk(m, 'perp')], [slT(m), slT(pm)], 'Parallel ' + t('m=' + slT(m)) + ', perpendicular ' + t('m=' + slT(pm)),
              t('m_{' + nm + '}=' + formulaT(A, Bp) + '=' + fracSteps(Bp[1] - A[1], Bp[0] - A[0])) + '.<br>Parallel lines have equal slopes: ' + t(slT(m)) + '.<br>Perpendicular lines have negative reciprocal slopes: flip the fraction and change the sign: ' + t(slT(pm)) + '. (Check: ' + t(slT(m) + '\\times\\left(' + slT(pm) + '\\right)=-1') + '.)',
              ['Find ' + t('m_{' + nm + '}') + ' with the slope formula first.', 'Parallel: the same slope. Perpendicular: the negative reciprocal (their product is ' + t('-1') + ').'], 'parallel and perpendicular slopes');
            p0.bad = [[slT(pm), slT(m)], [slT(m), slT([-m[0], m[1]])], [slT(m), slT(red(m[1], m[0]))]];
            return p0;
          } }] },
      { num: '3', outcome: 'RF3',
        shared: function (r) {
          return pickWhere(function () {
            var X = [r.int(-8, 8), r.int(-8, 8)], dq = r.pick([[2, 3], [3, 4], [1, 4], [4, 3], [3, 2], [2, 5], [5, 2], [3, 1], [-2, 3], [-3, 4], [-1, 3], [-4, 3], [-3, 2], [-5, 2]]), j = r.pick([1, 2]), Y = [X[0] + dq[1] * j, X[1] + dq[0] * j];
            var V = [r.int(-8, 8), r.int(-8, 8)], run = dq[0] * r.pick([1, 2, -1]), U = [V[0] - run, null], mp = [-dq[1], dq[0]];
            U[1] = V[1] - mp[0] * run / mp[1];
            return { X: X, Y: Y, U: U, V: V, m: dq };
          }, function (s) { return s.U[1] % 1 === 0 && Math.abs(s.U[1]) <= 15 && Math.abs(s.U[0]) <= 12 && Math.abs(s.Y[0]) <= 12 && Math.abs(s.Y[1]) <= 12 && s.U[0] !== s.V[0]; });
        },
        stem: function (s) { return 'Segment ' + t('UV') + ' joins ' + t('U(' + s.U[0] + ',\\ p)') + ' and ' + t('V' + ptT(s.V)) + '. Segment ' + t('XY') + ' joins ' + t('X' + ptT(s.X)) + ' and ' + t('Y' + ptT(s.Y)) + '. The two segments are <b>perpendicular</b>.'; },
        parts: [
          { id: '3', outcome: 'RF3', level: 'PRG', make: function (r, s) {
            var U = s.U, V = s.V, mxy = slopeOf(s.X, s.Y), mp = red(-mxy[1], mxy[0]), p = U[1], dx = V[0] - U[0];
            var pPar = V[1] - sval(mxy) * dx, pSign = V[1] + sval(mp) * dx, pFlip = V[1] - (1 / sval(mp)) * dx;
            return numPart('Determine the value of ' + t('p') + '.', p, [[pPar, 'u6x-perp-par', 'Perpendicular segments don’t have equal slopes. ' + t('m_{UV}') + ' must be the negative reciprocal of ' + t('m_{XY}=' + slT(mxy)) + ': ' + t(slT(mp)) + '.'], [pSign, 'u6x-k-sign', 'Check the signs in ' + t('\\frac{' + V[1] + '-p}{' + V[0] + '-' + sgp(U[0]) + '}=' + slT(mp)) + '.'], [pFlip, 'u6x-k-flip', 'Slope is rise over run: ' + t('\\frac{y_V-y_U}{x_V-x_U}') + ', with ' + t('p') + ' on the top.']],
              t('m_{XY}=' + formulaT(s.X, s.Y) + '=' + slT(mxy)) + ', so ' + t('m_{UV}=' + slT(mp)) + ' (negative reciprocal).<br>' + t('\\frac{' + V[1] + '-p}{' + V[0] + '-' + sgp(U[0]) + '}=' + slT(mp)) + ' → ' + t(V[1] + '-p=' + slT(mp) + '\\times' + sgp(dx) + '=' + nT(sval(mp) * dx)) + ' → ' + t('p=' + nT(p)) + '.',
              ['Find ' + t('m_{XY}') + ', then the perpendicular slope (negative reciprocal) — that is ' + t('m_{UV}') + '.', 'Write ' + t('m_{UV}') + ' with the slope formula, using ' + t('p') + ', set it equal to that slope, and solve.'], 'perpendicular segments: unknown', { before: t('p=') });
          } }] },
      { num: '4', outcome: 'RF3',
        shared: function (r) {
          return pickWhere(function () {
            var m = r.pick([[1, 2], [2, 3], [1, 3], [3, 2], [-1, 2], [-2, 3], [-1, 3], [3, 4], [-3, 2], [2, 1], [-2, 1], [3, 1]]), k = r.pick(nz(-8, 8)), K0 = [k, k];
            var A = [k - m[1] * r.int(1, 3), k - m[0] * 0], j = r.int(1, 3), j2 = r.int(1, 3);
            A = [k - m[1] * j, k - m[0] * j]; var Bp = [k + m[1] * j2, k + m[0] * j2];
            return { m: m, k: k, A: A, Bp: Bp, K0: K0, nm: r.pick([['A', 'B'], ['P', 'Q'], ['D', 'E']]) };
          }, function (s) { return [s.A, s.Bp].every(function (p) { return Math.abs(p[0]) <= 15 && Math.abs(p[1]) <= 15; }) && !(s.m[0] === 1 && s.m[1] === 1); });
        },
        stem: function (s) { return 'The points ' + t(s.nm[0] + ptT(s.A)) + ', ' + t(s.nm[1] + ptT(s.Bp)) + ' and ' + t('C(k,\\ k)') + ' are collinear (they lie on one line).'; },
        parts: [
          { id: '4', outcome: 'RF3', level: 'ADV', make: function (r, s) {
            var m = s.m, k = s.k, A = s.A, mv = sval(m), c = A[1] - mv * A[0];
            var wrongs = [[-c / (1 + mv), 'u6x-k-sign', 'Check the signs when you collect the ' + t('k') + '-terms: ' + t('\\frac{k-' + sgp(A[1]) + '}{k-' + sgp(A[0]) + '}=' + slT(m)) + '.'], [c, 'u6x-col-line', 'That is where the line meets the ' + t('y') + '-axis. ' + t('C') + ' has the same ' + t('x') + ' and ' + t('y') + '-coordinate, ' + t('k') + '.']];
            return numPart('Determine the value of ' + t('k') + '.', k, wrongs,
              t('m_{' + s.nm[0] + s.nm[1] + '}=' + formulaT(A, s.Bp) + '=' + slT(m)) + '.<br>For ' + t('C') + ' to be on the same line, ' + t('m_{' + s.nm[0] + 'C}=' + slT(m)) + ': ' + t('\\frac{k-' + sgp(A[1]) + '}{k-' + sgp(A[0]) + '}=' + slT(m)) + '.<br>' + t(m[1] + '(k-' + sgp(A[1]) + ')=' + m[0] + '(k-' + sgp(A[0]) + ')') + ' → ' + t('k=' + k) + '.<br>Check: ' + t('C' + ptT([k, k])) + ' gives ' + t('m_{' + s.nm[0] + 'C}=' + formulaT(A, [k, k]) + '=' + slT(m)) + ' ✓',
              ['Collinear points: the slope between any two of them is the same. Find ' + t('m_{' + s.nm[0] + s.nm[1] + '}') + ' first.', 'Set ' + t('m_{' + s.nm[0] + 'C}') + ' (with ' + t('C(k,\\ k)') + ') equal to it, cross-multiply and solve for ' + t('k') + '.'], 'collinear: C(k, k)', { before: t('k=') });
          } }] }
    ]
  });

  /* =====================================================================================================
   * Lesson 4 — Characteristics of linear graphs (RF4, RF5)
   * ===================================================================================================== */
  var WALKCTX = [
    { who: 'Ben walks home from the bus stop at a steady pace.', x: 't', y: 'd', xu: 'min', yu: 'm', yw: 'distance from home', ya: 'Distance from home, ' + t('d') + ' (m)', vs: [40, 50, 60, 75, 80], Ts: [10, 12, 14, 15, 16], st: 2, mean0: 'Ben’s distance from home when he starts walking', meanX: 'the time when Ben gets home' },
    { who: 'A pool is drained at a steady rate.', x: 't', y: 'V', xu: 'min', yu: 'L', yw: 'volume of water', ya: 'Volume of water, ' + t('V') + ' (L)', vs: [20, 25, 30, 40, 45], Ts: [20, 24, 30, 32, 36], st: 4, mean0: 'the volume of water before draining starts', meanX: 'the time when the pool is empty' },
    { who: 'A snowmobile uses fuel at a steady rate.', x: 't', y: 'F', xu: 'h', yu: 'L', yw: 'fuel left', ya: 'Fuel left, ' + t('F') + ' (L)', vs: [4, 5, 6, 8], Ts: [5, 6, 8, 9, 10], st: 1, mean0: 'the fuel in the tank at the start', meanX: 'the time when the tank is empty' }];
  var TWOREAD = [
    { txt: function (a, b) { return 'A candle burns at a constant rate. ' + a + ' after it is lit it is ' + b; }, unit: 'cm', x: 't', y: 'h', end: 'burn out', xu: 'h', w: ['hour', 'hours'], a: 'tall', q: 'How tall was the candle when it was lit', s0: 'When lit:' },
    { txt: function (a, b) { return 'A generator burns fuel at a constant rate. After ' + a + ' its tank holds ' + b; }, unit: 'L', x: 't', y: 'F', end: 'run out of fuel', xu: 'h', w: ['hour', 'hours'], a: '', q: 'How much fuel was in the tank at the start', s0: 'At the start:' },
    { txt: function (a, b) { return 'Water drains from a tank at a constant rate. After ' + a + ' the tank holds ' + b; }, unit: 'L', x: 't', y: 'V', end: 'be empty', xu: 'min', w: ['minute', 'minutes'], a: '', q: 'How much water was in the tank at the start', s0: 'At the start:' }];
  function nUnit(n, w) { return t(n) + ' ' + (n === 1 ? w[0] : w[1]); }
  HW.defineExit({
    lesson: 'u6l4', calc: true,
    blurb: 'Intercepts and slope of a graphed line, completing a linear table, intercepts and rate of change in context, and a line from two readings.',
    questions: [
      { num: '1', outcome: 'RF5',
        shared: function (r) {
          if (r.chance(0.2)) { var vh = r.chance(0.5), k = r.pick(nz(-5, 5)); return { kind: vh ? 'v' : 'h', k: k }; }
          return pickWhere(function () { var a = r.pick(nz(-5, 5)), b = r.pick(nz(-5, 5)); return { kind: 's', a: a, b: b }; }, function (s) { return Math.abs(s.a) !== Math.abs(s.b) && (Math.abs(s.b) % Math.abs(s.a) === 0 || Math.abs(s.a) % Math.abs(s.b) === 0 || gcd(s.a, s.b) === 1); });
        },
        stem: function (s) { var seg0 = s.kind === 's' ? fullLine([s.a, 0], [0, s.b]) : s.kind === 'v' ? fullLine([s.k, 0], [s.k, 1]) : fullLine([0, s.k], [1, s.k]); return 'State the ' + t('x') + '-intercept, the ' + t('y') + '-intercept and the slope of the line.' + G({ segs: [seg0], labels: 1 }); },
        parts: [
          { id: '1', outcome: 'RF5', level: 'BEG', make: function (r, s) {
            var xi, yi, sl;
            if (s.kind === 's') { xi = s.a; yi = s.b; sl = red(-s.b, s.a); } else if (s.kind === 'v') { xi = s.k; yi = null; sl = null; } else { xi = null; yi = s.k; sl = [0, 1]; }
            var chks = [valChk(xi, { v: 'x', other: yi, notNone: 'This line is horizontal and never meets the ' + t('x') + '-axis — press <b>none</b>.' }), valChk(yi, { v: 'y', other: xi, notNone: 'This line is vertical and never meets the ' + t('y') + '-axis — press <b>none</b>.' }), slopeChk(sl)];
            var keys = [xi == null ? 'none' : nT(xi), yi == null ? 'none' : nT(yi), slT(sl)];
            var sol = s.kind === 's' ? 'The line crosses the ' + t('x') + '-axis at ' + t(ptT([xi, 0])) + ' and the ' + t('y') + '-axis at ' + t(ptT([0, yi])) + '.<br>From ' + t(ptT([xi, 0])) + ' to ' + t(ptT([0, yi])) + ': ' + t('\\text{slope}=\\frac{\\text{rise}}{\\text{run}}=' + fracSteps(yi, -xi)) + '.'
              : s.kind === 'v' ? 'The vertical line ' + t('x=' + s.k) + ': ' + t('x') + '-intercept ' + t(s.k) + ', <b>no</b> ' + t('y') + '-intercept, slope <b>undefined</b> (the run is ' + t('0') + ').' : 'The horizontal line ' + t('y=' + s.k) + ': <b>no</b> ' + t('x') + '-intercept, ' + t('y') + '-intercept ' + t(s.k) + ', slope ' + t('0') + '.';
            var p0 = B.fields('Press <b>none</b> for an intercept that doesn’t exist.', [fMath(t('x') + '-intercept:', 'e.g. -4 or none'), fMath(t('y') + '-intercept:', 'e.g. 3 or none'), fMath('Slope:', 'e.g. -1/2 or undefined')], chks, keys,
              t('x') + '-intercept: ' + (xi == null ? 'none' : t(nT(xi))) + '<br>' + t('y') + '-intercept: ' + (yi == null ? 'none' : t(nT(yi))) + '<br>Slope: ' + (sl == null ? 'undefined' : t(slT(sl))), sol,
              ['The ' + t('x') + '-intercept is where the line crosses the ' + t('x') + '-axis; the ' + t('y') + '-intercept is where it crosses the ' + t('y') + '-axis.', 'For the slope, count the rise and the run between two points on the line. Falling left to right means a negative slope.'], 'read intercepts and slope');
            p0.bad = [];
            if (xi != null && yi != null) p0.bad.push([keys[1], keys[0], keys[2]]);
            if (sl != null && sval(sl) !== 0) p0.bad.push([keys[0], keys[1], slT([-sl[0], sl[1]])]);
            if (s.kind === 'v') p0.bad.push([keys[0], 'none', '0']);
            if (s.kind === 'h') p0.bad.push(['none', keys[1], '\\text{undefined}']);
            return p0;
          } }] },
      { num: '2', outcome: 'RF4',
        shared: function (r) {
          var st = r.pick([1, 2]), x0 = r.pick([-2, -1, 0]) * st, m = r.pick(nz(-5, 5)), b = r.int(-6, 9), xs = range(0, 5).map(function (i) { return x0 + i * st; });
          var blanks = r.pick([[1, 3, 5], [0, 2, 5], [0, 3, 4], [1, 2, 5], [0, 4, 5]]);
          return { xs: xs, ys: xs.map(function (x) { return m * x + b; }), blanks: blanks, d: m * st };
        },
        stem: function (s) { return 'Complete the table so that it represents a <b>linear</b> relation.' + tbl(s.xs, s.ys.map(function (y, i) { return s.blanks.indexOf(i) >= 0 ? null : y; })); },
        parts: [
          { id: '2', outcome: 'RF4', level: 'EMG', make: function (r, s) {
            var xs = s.xs, ys = s.ys, d = s.d, bl = s.blanks;
            var shownIdx = range(0, 5).filter(function (i) { return bl.indexOf(i) < 0; });
            var p0 = B.fields('Fill in the missing ' + t('y') + '-values.', bl.map(function (i) { return { label: t('x=' + xs[i]) + ':', name: 'x = ' + xs[i], before: t('y='), mode: 'number' }; }),
              bl.map(function (i) { return numChk(ys[i], [[ys[i] + 2 * d, 'u6x-tab-step', 'Find the constant change first: compare two neighbouring known values (or divide a bigger gap by the number of steps).'], [ys[i] - 2 * d, 'u6x-tab-step', 'Find the constant change first: compare two neighbouring known values (or divide a bigger gap by the number of steps).']]); }),
              bl.map(function (i) { return String(ys[i]); }), tbl(xs, ys),
              'Each step of ' + t(xs[1] - xs[0]) + ' in ' + t('x') + ' changes ' + t('y') + ' by the same amount. From the known values, the change per step is ' + t(nT(d)) + '.<br>' + bl.map(function (i) { return t('x=' + xs[i]) + ': ' + t('y=' + ys[i]); }).join(', ') + '.',
              ['A linear table has the same change in ' + t('y') + ' for each equal step in ' + t('x') + '. Use two known values to find it.', 'If two known values are several steps apart, divide their difference by the number of steps.'], 'complete a linear table');
            p0.bad = [bl.map(function (i) { return String(ys[i] + 2 * d); })];
            return p0;
          } }] },
      { num: '3', outcome: 'RF5',
        shared: function (r) {
          var c = r.pick(WALKCTX), v = r.pick(c.vs), T = r.pick(c.Ts), y0 = v * T, xs = [1, 2, 3, 4].map(function (i) { return i * c.st; });
          return { c: c, v: v, T: T, y0: y0, xs: xs, ys: xs.map(function (x) { return y0 - v * x; }) };
        },
        stem: function (s) { var c = s.c; return c.who + ' The table shows the ' + c.yw + ', ' + t(c.y) + ' (' + c.yu + '), ' + t(c.x) + ' ' + (c.xu === 'h' ? 'hours' : 'minutes') + ' after the start.' + tbl(s.xs, s.ys, t(c.x) + ' (' + c.xu + ')', t(c.y) + ' (' + c.yu + ')'); },
        parts: [
          { id: '3', outcome: 'RF5', level: 'PRG', make: function (r, s) {
            var c = s.c, v = s.v, T = s.T, y0 = s.y0, st = c.st;
            var cs = numChk(-v, [[v, 'u6x-rate-sign', 'The ' + c.yw + ' is going <b>down</b>, so the rate of change is negative.'], [-v * st, 'u6x-rate-step', 'That is the change for one step of the table (' + t(st) + ' ' + c.xu + '). The rate is per <b>1</b> ' + c.xu + ': divide by ' + t(st) + '.']]);
            var cy = numChk(y0, [[s.ys[0], 'u6x-ctx-first', 'That is the value at ' + t(c.x + '=' + s.xs[0]) + ', not at the start (' + t(c.x + '=0') + '). Work backward one step.']]);
            var cx = numChk(T, [[s.xs[3], 'u6x-ctx-end', 'The table stops at ' + t(c.x + '=' + s.xs[3]) + ', but the ' + c.yw + ' is not ' + t('0') + ' yet. Keep going until it reaches ' + t('0') + '.'], [y0, 'u6x-empty-y', 'That is the ' + t(c.y) + '-intercept. The ' + t(c.x) + '-intercept is the time when ' + t(c.y + '=0') + '.']]);
            var p0 = B.fields('Determine the slope (rate of change) and both intercepts of the graph of this relation.', [{ label: 'Slope:', name: 'Slope', mode: 'number', after: c.yu + '/' + c.xu }, { label: t(c.y) + '-intercept:', name: c.y + '-intercept', mode: 'number', after: c.yu }, { label: t(c.x) + '-intercept:', name: c.x + '-intercept', mode: 'number', after: c.xu }], [cs, cy, cx], [String(-v), String(y0), String(T)],
              'Slope ' + t(-v) + ' ' + c.yu + '/' + c.xu + '; ' + t(c.y) + '-intercept ' + t(F(y0)) + ' ' + c.yu + ' (' + c.mean0 + '); ' + t(c.x) + '-intercept ' + t(T) + ' ' + c.xu + ' (' + c.meanX + ')',
              'Slope: ' + t('\\frac{' + s.ys[1] + '-' + s.ys[0] + '}{' + s.xs[1] + '-' + s.xs[0] + '}=' + nT(-v)) + ' ' + c.yu + '/' + c.xu + '.<br>' + t(c.y) + '-intercept (at ' + t(c.x + '=0') + '): one step back from the first column, ' + t(F(s.ys[0]) + '+' + (v * st) + '=' + F(y0)) + ' — ' + c.mean0 + '.<br>' + t(c.x) + '-intercept: ' + t(c.y + '=0') + ' when ' + t(F(y0) + '\\div' + v + '=' + T) + ' ' + c.xu + ' — ' + c.meanX + '.',
              ['Rate of change = change in ' + t(c.y) + ' ÷ change in ' + t(c.x) + '. The table goes up in steps of ' + t(st) + '.', 'The ' + t(c.y) + '-intercept is the value at ' + t(c.x + '=0') + '; the ' + t(c.x) + '-intercept is where ' + t(c.y + '=0') + '.'], 'context slope and intercepts');
            p0.bad = [[String(v), String(y0), String(T)], [String(-v), String(s.ys[0]), String(T)], [String(-v * st), String(y0), String(T)]].filter(function (b) { return b.join('|') !== p0.key.join('|'); });
            return p0;
          } }] },
      { num: '4', outcome: 'RF5',
        shared: function (r) {
          return pickWhere(function () { var c = r.pick(TWOREAD), m = r.pick([1.5, 2, 2.5, 3, 4, 6, 7, 8]), y0 = r.int(18, 60), t1 = r.int(1, 4), t2 = t1 + r.int(2, 5); return { c: c, m: m, y0: y0, t1: t1, t2: t2, y1: cl(y0 - m * t1), y2: cl(y0 - m * t2), E: y0 / m }; },
            function (s) { return s.y2 > 0 && s.y1 % 1 === 0 && s.y2 % 1 === 0 && Math.abs(s.E * 10 - Math.round(s.E * 10)) > 1e-6 && Math.abs((s.E * 10) % 1 - 0.5) > 0.05; });
        },
        stem: function (s) { var c = s.c; return c.txt(nUnit(s.t1, c.w), t(s.y1) + ' ' + c.unit + (c.a ? ' ' + c.a : '')) + ', and after ' + nUnit(s.t2, c.w) + ' it ' + (c.a ? 'is ' : 'holds ') + t(s.y2) + ' ' + c.unit + (c.a ? ' ' + c.a : '') + '.'; },
        parts: [
          { id: '4', outcome: 'RF5', level: 'ADV', make: function (r, s) {
            var c = s.c, m = s.m, y0 = s.y0, E = s.E, dt = s.t2 - s.t1, dy = s.y2 - s.y1;
            var cy = numChk(y0, [[s.y1, 'u6x-ctx-first', 'That is the value after ' + t(s.t1) + ' ' + c.xu + '. Work backward to ' + t(c.x + '=0') + ': add ' + t(s.t1) + ' steps of ' + t(nT(m)) + '.'], [cl(s.y1 - m * s.t1), 'u6x-rate-sign', 'Going back in time, the amount was <b>larger</b>: add ' + t(nT(m * s.t1)) + ', don’t subtract it.']]);
            var cxBase = K.approx(E, 1, {}), cx = function (resp) { var pn = HW.parse.number(String(resp == null ? '' : resp)); if (pn.ok && Math.abs(pn.value - s.t2) < 1e-9) return wrong('u6x-ctx-end', 'At ' + t(c.x + '=' + s.t2) + ' there are still ' + t(s.y2) + ' ' + c.unit + '. Find when the amount reaches ' + t('0') + '.'); if (pn.ok && Math.abs(pn.value - y0) < 1e-9) return wrong('u6x-empty-y', 'That is the starting amount. Divide it by the rate, ' + t(nT(m)) + ' ' + c.unit + '/' + c.xu + '.'); if (pn.ok && Math.abs(pn.value - rd(E, 0)) < 1e-9 && Math.abs(E - rd(E, 0)) > 0.05) return wrong('u6x-xint-round', 'Round to the nearest <b>tenth</b>: one decimal place.'); return cxBase(resp); };
            var p0 = B.fields(c.q + ', and after how long will it ' + c.end + '? Give the time to the nearest tenth.', [{ label: c.s0, name: 'Start', mode: 'number', after: c.unit }, { label: 'It will ' + c.end + ' after', name: 'Time', mode: 'number', after: c.xu }], [cy, cx], [String(y0), rd(E, 1).toFixed(1)],
              t(y0) + ' ' + c.unit + ' at the start; ' + t(rd(E, 1).toFixed(1)) + ' ' + c.xu,
              'Rate of change: ' + t('\\frac{' + s.y2 + '-' + s.y1 + '}{' + s.t2 + '-' + s.t1 + '}=\\frac{' + dy + '}{' + dt + '}=' + nT(-m)) + ' ' + c.unit + '/' + c.xu + '.<br>Start (' + t(c.x + '=0') + '): ' + t(s.y1 + '+' + nT(m) + '\\times' + s.t1 + '=' + y0) + ' ' + c.unit + ' (the ' + t(c.y) + '-intercept).<br>It reaches ' + t('0') + ' when ' + t(c.x + '=' + y0 + '\\div' + nT(m) + '\\approx' + rd(E, 1).toFixed(1)) + ' ' + c.xu + ' (the ' + t(c.x) + '-intercept).',
              ['Find the rate of change from the two readings: change in amount ÷ change in time.', 'Work back to time ' + t('0') + ' for the starting amount; then divide the starting amount by the rate to find when it reaches ' + t('0') + '.'], 'two readings: intercepts');
            p0.bad = [[String(s.y1), rd(E, 1).toFixed(1)], [String(y0), String(s.t2)]];
            return p0;
          } }] }
    ]
  });

  /* =====================================================================================================
   * Lesson 5 — Unit review: RF3, RF4, RF5
   * ===================================================================================================== */
  HW.defineExit({
    lesson: 'u6l5', calc: true,
    blurb: 'Unit 6 review: midpoint, perpendicular slope, an x-intercept from a linear table, and an unknown that makes a right angle (RF3, RF4, RF5).',
    questions: [
      { num: '1', outcome: 'RF3', stem: function (s) { return 'The points ' + t('A' + ptT(s.A)) + ' and ' + t('B' + ptT(s.Bp)) + ' are the ends of a diameter of a circle (the segment ' + t('AB') + ' passes through the centre).'; },
        shared: function (r) { var A = [r.int(-10, 10), r.int(-10, 10)], Bp = pickWhere(function () { return [r.int(-10, 10), r.int(-10, 10)]; }, function (q) { return Math.abs(q[0] - A[0]) >= 4 && Math.abs(q[1] - A[1]) >= 2 && (q[0] + A[0]) % 2 === 0 && (q[0] < 0 || A[0] < 0 || q[1] < 0 || A[1] < 0); }); return { A: A, Bp: Bp }; },
        parts: [
          { id: '1', outcome: 'RF3', level: 'BEG', make: function (r, s) {
            var M = mid(s.A, s.Bp);
            return ptPart('Determine the coordinates of the centre of the circle.', M, { cands: midCands(s.A, s.Bp), before: t('C='), name: 'C' }, 'The centre is the midpoint of the diameter: ' + t(mLine(s.A, s.Bp, 'C')) + '.', HM, 'circle centre = midpoint');
          } }] },
      { num: '2', outcome: 'RF3',
        shared: function (r) { return pickWhere(function () { return { K0: [r.int(-9, 9), r.int(-9, 9)], L0: [r.int(-9, 9), r.int(-9, 9)] }; }, function (s) { var dx = s.L0[0] - s.K0[0], dy = s.L0[1] - s.K0[1]; return dx !== 0 && dy !== 0 && Math.abs(dx) !== Math.abs(dy) && Math.abs(red(dy, dx)[0]) !== 1 || false; }); },
        stem: function (s) { return t('K') + ' and ' + t('L') + ' are the points ' + t(ptT(s.K0)) + ' and ' + t(ptT(s.L0)) + '.'; },
        parts: [
          { id: '2', outcome: 'RF3', level: 'EMG', make: function (r, s) {
            var m = slopeOf(s.K0, s.L0), pm = red(-m[1], m[0]);
            var p0 = B.slope('Determine the slope of a line perpendicular to ' + t('KL') + '.', pm, {}, t('m_{KL}=' + formulaT(s.K0, s.L0) + '=' + fracSteps(s.L0[1] - s.K0[1], s.L0[0] - s.K0[0])) + '.<br>The perpendicular slope is the negative reciprocal: ' + t(slT(pm)) + '.',
              ['Find ' + t('m_{KL}') + ' with the slope formula.', 'Then flip the fraction and change its sign.'], 'perpendicular slope');
            p0.check = perpChk(m, 'perp');
            p0.bad = [slT(m), slT([-m[0], m[1]]), slT(red(m[1], m[0]))];
            return p0;
          } }] },
      { num: '3', outcome: 'RF5',
        shared: function (r) {
          return pickWhere(function () { var st = r.pick([2, 3, 4, 5]), m = r.pick([-3, -2, -1.5, -0.5, 1.5, 2.5, 3, -2.5]), b = r.int(-9, 24), x0 = r.pick([0, 0, -st]); var xs = [0, 1, 2, 3].map(function (i) { return x0 + i * st; }); return { xs: xs, ys: xs.map(function (x) { return cl(m * x + b); }), m: m, b: b, X: -b / m }; },
            function (s) { return s.ys.every(function (y) { return y % 1 === 0; }) && s.b !== 0 && Math.abs(s.X) <= 30 && Math.abs(s.X * 10 - Math.round(s.X * 10)) > 1e-6 && Math.abs((Math.abs(s.X) * 10) % 1 - 0.5) > 0.05 && s.xs.every(function (x) { return !same(x, s.X); }); });
        },
        stem: function (s) { return 'The table represents a linear relation.' + tbl(s.xs, s.ys); },
        parts: [
          { id: '3', outcome: 'RF5', level: 'PRG', make: function (r, s) {
            var X = s.X, m = s.m, b = s.b, st = s.xs[1] - s.xs[0], dy = cl(m * st);
            var base = K.approx(X, 1, {});
            var chk = function (resp) {
              var pn = HW.parse.number(String(resp == null ? '' : resp));
              if (pn.ok && Math.abs(pn.value - b) < 1e-9) return wrong('u6x-xint-y', 'That is the ' + t('y') + '-intercept (the value at ' + t('x=0') + '). The ' + t('x') + '-intercept is where ' + t('y=0') + '.');
              if (pn.ok && Math.abs(pn.value + X) < 0.06 && Math.abs(X) > 0.1) return wrong('sign', 'Check the sign: is the ' + t('x') + '-intercept to the left or to the right of ' + t('x=0') + '?');
              if (pn.ok && Math.abs(pn.value - rd(X, 0)) < 1e-9) return wrong('u6x-xint-round', 'Round to the nearest <b>tenth</b>: one decimal place.');
              return base(resp);
            };
            var key = rd(X, 1).toFixed(1);
            return { prompt: 'To the nearest tenth, determine the ' + t('x') + '-intercept of its graph.', input: { type: 'number', before: t('x=') }, check: chk, key: key, answer: t(key),
              solution: 'Slope: ' + t('\\frac{' + s.ys[1] + '-' + sgp(s.ys[0]) + '}{' + st + '}=' + nT(m)) + '. ' + (s.xs[0] === 0 ? 'At ' + t('x=0') + ', ' + t('y=' + b) + '.' : 'Going one step from ' + t('x=' + s.xs[0]) + ' to ' + t('x=0') + ': ' + t('y=' + s.ys[0] + (dy < 0 ? '' : '+') + nT(dy) + '=' + b) + '.') + ' So ' + t('y=' + nT(m) + 'x' + (b < 0 ? '' : '+') + b) + '.<br>' + t('y=0') + ': ' + t(nT(m) + 'x=' + (-b)) + ', ' + t('x=' + nT(-b) + '\\div' + sgp(m) + '\\approx' + key) + '.',
              hints: ['Find the slope from the table (change in ' + t('y') + ' ÷ change in ' + t('x') + ') and the ' + t('y') + '-intercept (the value at ' + t('x=0') + ').', 'The ' + t('x') + '-intercept is where ' + t('y=0') + ': solve ' + t('mx+b=0') + '.'], text: 'x-intercept from a table',
              bad: [String(b), rd(X, 0).toFixed(0)].filter(function (v) { return v !== key; }) };
          } }] },
      { num: '4', outcome: 'RF3',
        shared: function (r) {
          return pickWhere(function () {
            var A = [r.int(-6, 6), r.int(-6, 6)], u = r.pick([[1, 2], [2, 1], [1, 3], [3, 1], [2, 3], [3, 2], [1, -2], [2, -1], [1, -3], [3, -2]]), i = r.pick([1, 2]), j = r.pick([1, 2, -1]);
            var Bp = [A[0] + u[0] * i, A[1] + u[1] * i], C = [A[0] - u[1] * j, A[1] + u[0] * j];
            return { A: A, Bp: Bp, C: C, u: u };
          }, function (s) { return [s.Bp, s.C].every(function (p) { return Math.abs(p[0]) <= 12 && Math.abs(p[1]) <= 12; }) && s.C[1] !== s.A[1] && s.C[0] !== s.A[0]; });
        },
        stem: function (s) { return 'Triangle ' + t('ABC') + ' has vertices ' + t('A' + ptT(s.A)) + ', ' + t('B' + ptT(s.Bp)) + ' and ' + t('C(k,\\ ' + s.C[1] + ')') + '.'; },
        parts: [
          { id: '4', outcome: 'RF3', level: 'ADV', make: function (r, s) {
            var A = s.A, Bp = s.Bp, C = s.C, k = C[0], mAB = slopeOf(A, Bp), mp = red(-mAB[1], mAB[0]), dy = C[1] - A[1];
            var kPar = A[0] + dy / sval(mAB), kSign = A[0] - dy / sval(mp);
            var mBC0 = mp, kAtB = Bp[0] + (C[1] - Bp[1]) / sval(mp);
            return numPart('Determine the value of ' + t('k') + ' so that the triangle has a right angle at ' + t('A') + '.', k, [[kPar, 'u6x-right-par', 'A right angle at ' + t('A') + ' needs ' + t('AC\\perp AB') + ': the slopes are negative reciprocals, not equal.'], [kSign, 'u6x-k-sign', 'Check the signs when you solve ' + t('\\frac{' + C[1] + '-' + sgp(A[1]) + '}{k-' + sgp(A[0]) + '}=' + slT(mp)) + '.'], [kAtB, 'u6x-right-perp', 'That makes the right angle at ' + t('B') + ' (' + t('BC\\perp AB') + '). The right angle must be at ' + t('A') + ': use segment ' + t('AC') + '.']],
              t('m_{AB}=' + formulaT(A, Bp) + '=' + slT(mAB)) + '. A right angle at ' + t('A') + ' means ' + t('AC\\perp AB') + ', so ' + t('m_{AC}=' + slT(mp)) + '.<br>' + t('\\frac{' + C[1] + '-' + sgp(A[1]) + '}{k-' + sgp(A[0]) + '}=' + slT(mp)) + ' → ' + t('k-' + sgp(A[0]) + '=' + nT(dy) + '\\div\\left(' + slT(mp) + '\\right)=' + nT(dy / sval(mp))) + ' → ' + t('k=' + k) + '.<br>Check: ' + t(slT(mAB) + '\\times\\left(' + slT(mp) + '\\right)=-1') + ' ✓',
              ['The right angle is at ' + t('A') + ', so the two sides that meet there, ' + t('AB') + ' and ' + t('AC') + ', are perpendicular.', 'Find ' + t('m_{AB}') + ', take the negative reciprocal for ' + t('m_{AC}') + ', then solve the slope formula for ' + t('k') + '.'], 'right angle at A: find k', { before: t('k=') });
          } }] }
    ]
  });
})(window);
