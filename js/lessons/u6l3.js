/* Math 10C · Unit 6 · Lesson 3 — Rise Over Run: The Slope of a Line Segment (RF3)
 * Assignment questions 1–18 (u6_L03.tex) and the Lesson 3 Extra Practice (u6_EP03.tex).
 * Every part is a generator: it keeps the booklet question's structure (which segments rise or fall, steep or shallow,
 * reducible counts, a negative rise or run, the context) and changes the numbers; the booklet's own numbers are among the
 * possible values wherever they fit the grid.
 * Inputs: rise / run / slope rows → three boxes (the slope box has the "undefined" key); slopes → K.P.slope (js/lines.js);
 * "draw the line / segment" → graph pad (js/draw.js); "write points on the line" / "find Q" → ordered pairs checked by a
 * rule (any correct points); rates → a number, with the units or the meaning as multiple choice; explain-questions → MC
 * with misconception hints. Levels: LIM BEG EMG PRG ADV MAS. */
(function (root) {
  'use strict';
  var HW = root.HW, ex = HW.ex, K = HW.kit, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form, B = K.P, LN = HW.lines, DR = HW.draw;

  HW.addCodes({
    'rr-blank': 'Rise/run box left blank', 'rr-swap': 'Rise and run swapped', 'rr-sign': 'Rise or run with the wrong sign', 'rr-rise': 'Miscounted the rise', 'rr-run': 'Miscounted the run',
    'pts-format': 'Points not written as ordered pairs', 'pts-dup': 'Same point twice', 'pts-given': 'Gave the given point', 'pts-int': 'Point without integer coordinates', 'pts-few': 'Not enough points',
    'pts-sign': 'Point stepped with the wrong slope sign', 'pts-flip': 'Point stepped run-over-rise', 'pts-off': 'Point not on the line', 'pts-vh': 'Horizontal/vertical mixed up (points)',
    'draw-point': 'Line misses the given point', 'draw-slope-sign': 'Drew the slope with the wrong sign', 'draw-slope-flip': 'Drew run over rise', 'draw-slope': 'Drew the wrong slope', 'draw-vh': 'Drew vertical for horizontal (or reverse)',
    'draw-noline': 'Plotted points instead of drawing', 'draw-many': 'Drew more than one line', 'draw-arrows': 'Segment drawn with arrows', 'draw-short': 'Segment does not cross both axes',
    'calc-divided': 'Divided instead of multiplying', 'calc-mult': 'Multiplied instead of dividing', 'calc-sign': 'Sign of rise/run', 'calc-flip': 'Used run over rise',
    'rate-flip': 'Rate upside down', 'rate-sign': 'Rate with the wrong sign', 'rate-one': 'Used one coordinate, not the change',
    'units-cm': 'Answer in cm, not m', 'units-km': 'Did not convert km to m', 'grade-whole': 'Used the percent as a whole number',
    'area-full': 'Used the whole base as the run', 'area-noh': 'Gave the height, not the area', 'area-half': 'Forgot the ½ in the area',
    'pyr-base': 'Used the whole base as the run', 'pyr-half': 'Used half the side instead of half the diagonal', 'pyr-diag': 'Used the whole diagonal',
    'tri-slanted': 'Triangle legs not parallel to the axes', 'tri-ab': 'Rise–run triangle for AB missing', 'tri-ad': 'Rise–run triangle for AD missing',
    'scale-squares': 'Counted squares instead of units', 'pt-swap': 'Point with coordinates swapped', 'pt-other': 'Point read wrongly',
    'k-sign': 'Solved with the slope’s sign flipped', 'k-flip': 'Solved with run over rise', 'end-sign': 'Rise/run sign in the endpoint', 'end-swap': 'Added rise to x and run to y', 'end-nostart': 'Forgot to start from the given point',
    'den-order': 'Denominator subtracted in the other order', 'ramp-max': 'Read “no greater than” as a minimum', 'pct-dec': 'Grade as a decimal, not a percent', 'fac-diff': 'Gave a difference instead of a factor'
  });

  /* ---------------- numbers and LaTeX ---------------- */
  function cl(x) { return Math.round(x * 1e9) / 1e9; }
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var c = a % b; a = b; b = c; } return a; }
  function red(p, q) { if (q === 0) return null; if (q < 0) { p = -p; q = -q; } var g = gcd(p, q) || 1; return [cl(p / g), cl(q / g)]; }
  function nT(x) { x = cl(x); if (x % 1 !== 0 && cl(x * 2) % 1 === 0) return (x < 0 ? '-' : '') + '\\frac{' + Math.abs(cl(x * 2)) + '}{2}'; return String(x); }
  function frT(p, q) { return LN.frT(p, q); }
  function slT(s) { return s == null ? '\\text{undefined}' : frT(s[0], s[1]); }
  function rawFr(p, q) { return '\\frac{' + nT(p) + '}{' + nT(q) + '}'; }
  function fracSteps(p, q) { var s = rawFr(p, q); if (q === 0) return s; var rr = red(p, q), r2 = slT(rr); return r2 === s ? s : s + '=' + r2; }
  function ptT(p) { return '(' + nT(p[0]) + ',\\ ' + nT(p[1]) + ')'; }
  function ptsT(arr) { return arr.map(ptT).join(',\\ '); }
  function mn(x) { x = cl(x); return x < 0 ? '−' + Math.abs(x) : String(x); }
  function ptPlain(p) { return '(' + mn(p[0]) + ', ' + mn(p[1]) + ')'; }
  function subD(a, b) { a = cl(a); b = cl(b); return a + '-' + (b < 0 ? '(' + b + ')' : b); }
  function subT(a, b) { return nT(a) + '-' + (b < 0 ? '\\left(' + nT(b) + '\\right)' : nT(b)); }
  function formulaT(A, Bp) { return '\\frac{' + subT(Bp[1], A[1]) + '}{' + subT(Bp[0], A[0]) + '}'; }
  function slopeOf(A, Bp) { return red(cl(Bp[1] - A[1]), cl(Bp[0] - A[0])); }
  function sval(s) { return s == null ? null : s[0] / s[1]; }
  function near(a, b) { return Math.abs(a - b) < 1e-9; }
  function same(p, q) { return near(p[0], q[0]) && near(p[1], q[1]); }
  function upDown(r) { return r > 0 ? t(r) + ' up' : r < 0 ? t(-r) + ' down' : 'no change up or down'; }
  function sgnWord(s) { var v = sval(s); return s == null ? 'undefined' : v > 0 ? 'positive' : v < 0 ? 'negative' : 'zero'; }
  function dec(x, d) { return String(cl(Number(x.toFixed(d)))); }

  /* ---------------- ordered points typed by the student ---------------- */
  function readPts(resp) {
    var s = String(resp == null ? '' : resp).replace(/\\(left|right)/g, '').replace(/\\\{|\\\}|\\lbrace|\\rbrace/g, ' ').replace(/\\[,;:! ]|\\quad/g, ' ').replace(/−/g, '-').trim();
    if (s.charAt(0) === '{' && s.charAt(s.length - 1) === '}') s = s.slice(1, -1);
    if (!s.trim()) return { empty: true };
    var re = /\(([^()]*)\)/g, m, out = [];
    while ((m = re.exec(s))) {
      var xy = m[1].split(','); if (xy.length !== 2) return { bad: true };
      var a = ex.parse(xy[0].trim()), b = ex.parse(xy[1].trim()); if (!a.ok || !b.ok) return { bad: true };
      var va = ex.value(a.ast), vb = ex.value(b.ast); if (!isFinite(va) || !isFinite(vb)) return { bad: true };
      out.push([cl(va), cl(vb)]);
    }
    if (s.replace(re, '').replace(/[,;\s]|and/g, '').length || !out.length) return { bad: true };
    return { pts: out };
  }
  /* o: { n: how many points, test(p) -> null | {code, hint}, exclude: [points], integer: true } */
  function ptsCheck(o) {
    var n = o.n || 1, exc = o.exclude || [];
    return function (resp) {
      var L = readPts(resp);
      if (L.empty) return form('empty', 'Type your point' + (n > 1 ? 's' : '') + ' first.');
      if (L.bad) return form('pts-format', 'Write each point in brackets' + (n > 1 ? ', separated by commas' : '') + ', e.g. ' + t(n > 1 ? '(3,\\ 0),\\ (4,\\ 3)' : '(3,\\ 0)') + '.');
      var P = L.pts, i, j;
      if (n === 1 && P.length > 1) return form('pts-few', 'Give just one point.');
      for (i = 0; i < P.length; i++) for (j = 0; j < i; j++) if (same(P[i], P[j])) return form('pts-dup', 'You wrote ' + t(ptT(P[i])) + ' twice — give ' + n + ' different points.');
      for (i = 0; i < P.length; i++) for (j = 0; j < exc.length; j++) if (same(P[i], exc[j])) return form('pts-given', t(ptT(P[i])) + ' is the point you were given. Give ' + (n > 1 ? 'other points' : 'a different point') + '.');
      if (o.integer) for (i = 0; i < P.length; i++) if (P[i][0] % 1 || P[i][1] % 1) return form('pts-int', 'Use points with integer coordinates — ' + t(ptT(P[i])) + ' isn’t one. Step a whole rise and run at a time.');
      for (i = 0; i < P.length; i++) { var h = o.test(P[i]); if (h) return wrong(h.code, h.hint); }
      if (P.length < n) return form('pts-few', (P.length === 1 ? 'That point works! ' : 'Those work! ') + 'You need ' + n + ' points in all.');
      return ok();
    };
  }
  function ptsPart(prompt, o, key, sol, hints, text) {
    var n = o.n || 1;
    return B.math(prompt, ptsCheck(o), ptsT(key), sol, hints, text, { keys: 'pairs', placeholder: n > 1 ? 'e.g. (3, 0), (4, 3)' : 'e.g. (3, 0)' });
  }
  /* is p on the line through P0 with slope sl = [p, q] (q = 0: vertical)? null = yes, else a diagnosis */
  function onLineTest(P0, sl) {
    var P0T = t(ptT(P0));
    return function (p) {
      var dx = cl(p[0] - P0[0]), dy = cl(p[1] - P0[1]);
      if (near(dy * sl[1], sl[0] * dx)) return null;
      if (sl[1] === 0) return dy === 0 ? { code: 'pts-vh', hint: 'From ' + P0T + ' to ' + t(ptT(p)) + ' the segment is horizontal, so its slope is ' + t('0') + '. An <b>undefined</b> slope is vertical: the run is ' + t('0') + ', so keep ' + t('x=' + nT(P0[0])) + '.' } : { code: 'pts-off', hint: 'An undefined slope means the run is ' + t('0') + ': the second point must have the same ' + t('x') + '-coordinate, ' + t(nT(P0[0])) + '.' };
      if (sl[0] === 0) return dx === 0 ? { code: 'pts-vh', hint: 'From ' + P0T + ' to ' + t(ptT(p)) + ' the segment is vertical, so its slope is undefined. A slope of ' + t('0') + ' is horizontal: the rise is ' + t('0') + ', so keep ' + t('y=' + nT(P0[1])) + '.' } : { code: 'pts-off', hint: 'A slope of ' + t('0') + ' means the rise is ' + t('0') + ': the point must have the same ' + t('y') + '-coordinate, ' + t(nT(P0[1])) + '.' };
      var m = sl[0] / sl[1];
      if (dx === 0) return { code: 'pts-off', hint: 'From ' + P0T + ' to ' + t(ptT(p)) + ' the run is ' + t('0') + ' (a vertical step). Step ' + t(Math.abs(sl[1])) + ' across as well as ' + t(Math.abs(sl[0])) + ' ' + (m > 0 ? 'up' : 'down') + '.' };
      var s = dy / dx;
      if (near(s, -m)) return { code: 'pts-sign', hint: 'From ' + P0T + ' to ' + t(ptT(p)) + ' the slope is ' + t(fracSteps(dy, dx)) + ' — the sign is wrong. A ' + (m > 0 ? 'positive slope goes <b>up</b>' : 'negative slope goes <b>down</b>') + ' as you move right.' };
      if (near(s, 1 / m)) return { code: 'pts-flip', hint: 'From ' + P0T + ' to ' + t(ptT(p)) + ' the slope is ' + t(fracSteps(dy, dx)) + ' — that’s run over rise. The top of the slope is the <b>rise</b> (up or down), the bottom is the <b>run</b> (across).' };
      return { code: 'pts-off', hint: t(ptT(p)) + ' isn’t on the line: from ' + P0T + ' the rise is ' + t(nT(dy)) + ' and the run is ' + t(nT(dx)) + ', a slope of ' + t(fracSteps(dy, dx)) + ', not ' + t(slT(red(sl[0], sl[1]))) + '.' };
    };
  }
  function stepPts(P0, sl, ks) { return ks.map(function (k) { return [P0[0] + k * sl[1], P0[1] + k * sl[0]]; }); }

  /* ---------------- figures ---------------- */
  function segFig(segs, names, lim) {
    var sg = [], pts = [];
    segs.forEach(function (s, i) { sg.push({ pts: [s[0], s[1]] }); pts.push({ x: s[0][0], y: s[0][1], label: names[i].charAt(0) }, { x: s[1][0], y: s[1][1], label: names[i].charAt(1) }); });
    return HW.graph({ x: [-lim - 1, lim + 1], y: [-lim - 1, lim + 1], labels: 2, segs: sg, points: pts, max: 340, aria: 'line segments on a grid' });
  }
  function clipEnd(P, d, len, lim) {   // from P along d, at most len units, staying inside [-lim, lim]
    var L = Math.hypot(d[0], d[1]), s = len / L;
    [0, 1].forEach(function (k) { if (d[k] > 0) s = Math.min(s, (lim - P[k]) / d[k]); if (d[k] < 0) s = Math.min(s, (-lim - P[k]) / d[k]); });
    return [cl(P[0] + d[0] * Math.max(0, s)), cl(P[1] + d[1] * Math.max(0, s))];
  }
  function pyramidFig(s, h) {
    var half = s / 2;
    return '<div class="fig-row" style="display:flex;flex-wrap:wrap;gap:12px;align-items:flex-end">' +
      '<svg class="fig-svg" viewBox="0 0 170 150" style="max-width:150px" role="img" aria-label="square pyramid">' +
      '<path d="M85 12 L22 110 L80 138 L148 104 Z" fill="#f4f1ea" stroke="#2b3340" stroke-width="1.6"/><path d="M85 12 L80 138" stroke="#2b3340" stroke-width="1.6"/>' +
      '<path d="M22 110 L88 86 L148 104" fill="none" stroke="#8a90a0" stroke-width="1.2" stroke-dasharray="4 3"/><path d="M85 12 L88 86" stroke="#8a90a0" stroke-width="1.2" stroke-dasharray="4 3"/>' +
      '<text x="85" y="9" font-size="12" text-anchor="middle" fill="#2b3340">apex</text></svg>' +
      '<svg class="fig-svg" viewBox="0 0 245 170" style="max-width:230px" role="img" aria-label="side view of the pyramid">' +
      '<path d="M20 140 L200 140 L110 20 Z" fill="#f4f1ea" stroke="#2b3340" stroke-width="1.6"/><path d="M110 20 L110 140" stroke="#2b3340" stroke-width="1.3" stroke-dasharray="5 4"/>' +
      '<path d="M110 128 L122 128 L122 140" fill="none" stroke="#2b3340" stroke-width="1.2"/><path d="M200 140 L110 20" stroke="#13807a" stroke-width="3.2"/>' +
      '<text x="104" y="84" font-size="13" text-anchor="end" fill="#2b3340">' + mn(h) + '</text>' +
      '<text x="65" y="156" font-size="13" text-anchor="middle" fill="#2b3340">' + mn(half) + '</text><text x="155" y="156" font-size="13" text-anchor="middle" fill="#2b3340">' + mn(half) + '</text>' +
      '<text x="162" y="76" font-size="12" fill="#13807a">beetle’s path</text><text x="110" y="168" font-size="11.5" text-anchor="middle" fill="#6a7182">side view (m)</text></svg></div>';
  }
  function triFig(half, h, bcTxt, halfTxt) {   // isosceles triangle, drawn to scale
    var hw = 130, hp = Math.max(28, Math.min(120, hw * h / half)), x0 = 20, yb = hp + 26, W = 2 * hw + 40, H = yb + 40;
    var A = [x0 + hw, yb - hp], Bq = [x0, yb], C = [x0 + 2 * hw, yb];
    return '<svg class="fig-svg" viewBox="0 0 ' + W + ' ' + H + '" style="max-width:320px" role="img" aria-label="isosceles triangle ABC">' +
      '<path d="M' + A + ' L' + Bq + ' L' + C + ' Z" fill="#f4f1ea" stroke="#2b3340" stroke-width="1.8"/>' +
      '<path d="M' + A + ' L' + (x0 + hw) + ',' + yb + '" stroke="#2b3340" stroke-width="1.3" stroke-dasharray="5 4"/>' +
      '<path d="M' + (x0 + hw - 10) + ',' + yb + ' L' + (x0 + hw - 10) + ',' + (yb - 10) + ' L' + (x0 + hw) + ',' + (yb - 10) + '" fill="none" stroke="#2b3340" stroke-width="1.1"/>' +
      '<text x="' + A[0] + '" y="' + (A[1] - 6) + '" font-size="14" text-anchor="middle" font-style="italic" fill="#2b3340">A</text>' +
      '<text x="' + (Bq[0] - 4) + '" y="' + (yb + 16) + '" font-size="14" font-style="italic" fill="#2b3340">B</text><text x="' + (C[0] - 6) + '" y="' + (yb + 16) + '" font-size="14" font-style="italic" fill="#2b3340">C</text>' +
      '<text x="' + (x0 + hw - 6) + '" y="' + (yb - hp / 2 + 4) + '" font-size="13" text-anchor="end" font-style="italic" fill="#2b3340">h</text>' +
      '<text x="' + (x0 + 1.5 * hw) + '" y="' + (yb - 4) + '" font-size="12.5" text-anchor="middle" fill="#2b3340">' + halfTxt + '</text>' +
      '<line x1="' + x0 + '" y1="' + (yb + 26) + '" x2="' + (x0 + 2 * hw) + '" y2="' + (yb + 26) + '" stroke="#6a7182" stroke-width="1.1"/>' +
      '<text x="' + (x0 + hw) + '" y="' + (yb + 38) + '" font-size="12.5" text-anchor="middle" fill="#2b3340">BC = ' + bcTxt + ' cm</text></svg>';
  }
  function pqFig(a, b, mirror) {   // P on the y-axis, Q on the x-axis, dashed legs labelled a and b
    var u = 22, qx = mirror ? -b : b, x0 = Math.min(0, qx) - 1.4, x1 = Math.max(0, qx) + 1.6, y0 = -1.3, y1 = a + 1.5;
    var X = function (x) { return 12 + (x - x0) * u; }, Y = function (y) { return 12 + (y1 - y) * u; }, W = (x1 - x0) * u + 24, H = (y1 - y0) * u + 24;
    var d = [qx, -a], e1 = [-0.28 * d[0], a - 0.28 * d[1]], e2 = [qx + 0.25 * d[0], 0.25 * d[1]];
    var s = '<defs><marker id="u6l3ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#2b3340"/></marker></defs>';
    s += '<line x1="' + X(x0) + '" y1="' + Y(0) + '" x2="' + X(x1) + '" y2="' + Y(0) + '" stroke="#2b3340" stroke-width="1.4" marker-end="url(#u6l3ar)"/>';
    s += '<line x1="' + X(0) + '" y1="' + Y(y0) + '" x2="' + X(0) + '" y2="' + Y(y1) + '" stroke="#2b3340" stroke-width="1.4" marker-end="url(#u6l3ar)"/>';
    s += '<text x="' + (X(x1) - 2) + '" y="' + (Y(0) - 6) + '" font-size="13" font-style="italic" text-anchor="end" fill="#2b3340">x</text><text x="' + (X(0) + 6) + '" y="' + (Y(y1) + 10) + '" font-size="13" font-style="italic" fill="#2b3340">y</text>';
    s += '<line x1="' + X(e1[0]) + '" y1="' + Y(e1[1]) + '" x2="' + X(e2[0]) + '" y2="' + Y(e2[1]) + '" stroke="#13807a" stroke-width="2.4"/>';
    s += '<path d="M' + X(0) + ' ' + Y(a) + ' L' + X(0) + ' ' + Y(0) + ' L' + X(qx) + ' ' + Y(0) + '" fill="none" stroke="#c4532a" stroke-width="1.6" stroke-dasharray="5 4"/>';
    s += '<circle cx="' + X(0) + '" cy="' + Y(a) + '" r="4" fill="#2b3340"/><circle cx="' + X(qx) + '" cy="' + Y(0) + '" r="4" fill="#2b3340"/>';
    s += '<text x="' + (X(0) + (mirror ? 8 : -8)) + '" y="' + (Y(a) + 4) + '" font-size="14" font-style="italic" text-anchor="' + (mirror ? 'start' : 'end') + '" fill="#2b3340">P</text>';
    s += '<text x="' + X(qx) + '" y="' + (Y(0) + 17) + '" font-size="14" font-style="italic" text-anchor="middle" fill="#2b3340">Q</text>';
    s += '<text x="' + (X(0) + (mirror ? -6 : 6)) + '" y="' + (Y(a / 2) + 4) + '" font-size="13" text-anchor="' + (mirror ? 'end' : 'start') + '" fill="#c4532a">' + a + '</text>';
    s += '<text x="' + X(qx / 2) + '" y="' + (Y(0) - 5) + '" font-size="13" text-anchor="middle" fill="#c4532a">' + b + '</text>';
    return '<svg class="fig-svg" viewBox="0 0 ' + W.toFixed(0) + ' ' + H.toFixed(0) + '" style="max-width:' + Math.min(240, W).toFixed(0) + 'px" role="img" aria-label="segment PQ with its rise and run">' + s + '</svg>';
  }

  /* ---------------- rise / run / slope rows ---------------- */
  function rrPart(nm, A, Bp) {
    var rise = cl(Bp[1] - A[1]), run = cl(Bp[0] - A[0]), sl = slopeOf(A, Bp), slc = K.slope(sl);
    var fields = [{ label: 'Rise', name: 'Rise' }, { label: 'Run', name: 'Run' }, { label: 'Slope', name: 'Slope', mode: 'math', keys: 'slope', placeholder: 'e.g. -2/3' }];
    var key = [String(rise), String(run), slT(sl)];
    var dir = run === 0 ? 'straight ' + (rise > 0 ? 'up' : 'down') : rise === 0 ? 'straight across' : (rise > 0 ? 'up' : 'down') + ' to the right';
    var check = function (resp) {
      resp = resp || [];
      var plus = function (v) { return String(v == null ? '' : v).replace(/^\s*\+/, ''); }, pr = HW.parse.number(plus(resp[0])), pn = HW.parse.number(plus(resp[1]));
      if (!pr.ok || !pn.ok) return form('rr-blank', 'Fill in the <b>rise</b> and the <b>run</b> as numbers (with a minus sign for down or left).');
      var r = cl(pr.value), n = cl(pn.value);
      var good = (r === rise && n === run) || (r === -rise && n === -run);
      if (!good) {
        if (Math.abs(r) === Math.abs(run) && Math.abs(n) === Math.abs(rise) && Math.abs(rise) !== Math.abs(run)) return wrong('rr-swap', 'Rise and run are swapped: the <b>rise</b> is the vertical change (up or down), the <b>run</b> is the horizontal change (across).');
        if (Math.abs(r) === Math.abs(rise) && Math.abs(n) === Math.abs(run)) return wrong('rr-sign', 'Right sizes — check the signs. Count from ' + t(nm.charAt(0)) + ' to ' + t(nm.charAt(1)) + ': up and right are positive, down and left are negative. ' + t(nm) + ' goes ' + dir + '.');
        if (Math.abs(r) !== Math.abs(rise)) return wrong('rr-rise', '<b>Rise:</b> count the squares up or down from ' + t(nm.charAt(0)) + ' to ' + t(nm.charAt(1)) + ' again.');
        return wrong('rr-run', '<b>Run:</b> count the squares across from ' + t(nm.charAt(0)) + ' to ' + t(nm.charAt(1)) + ' again.');
      }
      var c = slc(resp[2] == null ? '' : resp[2]);
      if (c.v !== 'correct') return { v: c.v, code: c.code, hint: '<b>Slope:</b> ' + (c.hint || 'divide the rise by the run: ' + t('\\frac{\\text{rise}}{\\text{run}}=' + rawFr(rise, run)) + (run === 0 ? '.' : ', then reduce.')) };
      return ok();
    };
    var sol = 'Count from ' + t(nm.charAt(0)) + ' to ' + t(nm.charAt(1)) + ' (left to right' + (run === 0 ? ' — here straight ' + (rise > 0 ? 'up' : 'down') : '') + '): ' + upDown(rise) + ' and ' + (run === 0 ? 'no squares across' : t(run) + ' right') + '. Rise ' + t(rise) + ', run ' + t(run) + '.<br>' +
      (run === 0 ? t('\\text{slope}=\\frac{' + rise + '}{0}') + ' — you can’t divide by ' + t('0') + ', so the slope is <b>undefined</b> (a vertical segment).' : t('\\text{slope}=\\frac{\\text{rise}}{\\text{run}}=' + fracSteps(rise, run)) + (rise === 0 ? ' (a horizontal segment).' : '.')) +
      ' (Counting from ' + t(nm.charAt(1)) + ' to ' + t(nm.charAt(0)) + ' instead makes both signs change, and the slope is the same.)';
    return { prompt: 'Segment ' + t(nm) + ': fill in its row of the table.', input: { type: 'fields', fields: fields }, check: check, key: key,
      answer: 'Rise ' + t(rise) + ', run ' + t(run) + ', slope ' + t(slT(sl)), solution: sol, text: 'rise/run/slope of ' + nm + ' ' + ptT(A) + ptT(Bp),
      hints: ['Start at ' + t(nm.charAt(0)) + '. Count squares up (+) or down (−) to the level of ' + t(nm.charAt(1)) + ' — that’s the rise. Then count squares right (+) or left (−) — that’s the run.', 'Slope ' + t('=\\frac{\\text{rise}}{\\text{run}}') + ', in lowest terms.'],
      good: run !== 0 || rise !== 0 ? [[String(-rise), String(-run), slT(sl)]] : [], bad: [[String(run), String(rise), slT(sl)], [String(rise), String(-run || run), slT(sl)]].filter(function (b) { return !((b[0] === key[0] && b[1] === key[1]) || (Number(b[0]) === -rise && Number(b[1]) === -run)); }) };
  }
  function distSeg(p, a, b) { var dx = b[0] - a[0], dy = b[1] - a[1], L2 = dx * dx + dy * dy, u = L2 ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L2)) : 0; return Math.hypot(p[0] - a[0] - u * dx, p[1] - a[1] - u * dy); }
  /* place segments (types: {rise, run}, run >= 0) with integer endpoints in [-lim, lim], endpoints apart and off the other segments */
  function placeSegs(r, types, lim) {
    for (var tries = 0; tries < 400; tries++) {
      var segs = [], bad = false;
      types.forEach(function (ty) {
        var xlo = -lim, xhi = lim - ty.run, ylo = Math.max(-lim, -lim - ty.rise), yhi = Math.min(lim, lim - ty.rise);
        if (xhi < xlo || yhi < ylo) { bad = true; return; }
        var A = [r.int(xlo, xhi), r.int(ylo, yhi)]; segs.push([A, [A[0] + ty.run, A[1] + ty.rise]]);
      });
      if (bad) return null;
      var ends = []; segs.forEach(function (s) { ends.push(s[0], s[1]); });
      for (var i = 0; i < ends.length && !bad; i++) for (var j = 0; j < i; j++) if (Math.hypot(ends[i][0] - ends[j][0], ends[i][1] - ends[j][1]) < 2) { bad = true; break; }
      for (var k = 0; k < segs.length && !bad; k++) for (var e = 0; e < ends.length; e++) if (Math.floor(e / 2) !== k && distSeg(ends[e], segs[k][0], segs[k][1]) < 0.6) { bad = true; break; }
      if (!bad) return segs;
    }
    return null;
  }

  /* ---------------- slope parts ---------------- */
  function slopePart(prompt, sl, sol, hints, text, opt) { return B.slope(prompt, sl == null ? null : sl, opt || {}, sol, hints, text); }
  function coordSlopePart(prompt, A, Bp, nmA, nmB, text) {
    var sl = slopeOf(A, Bp), rise = cl(Bp[1] - A[1]), run = cl(Bp[0] - A[0]);
    var sol = t('m=\\frac{y_2-y_1}{x_2-x_1}=' + formulaT(A, Bp) + '=' + fracSteps(rise, run)) + (run === 0 ? '. The run is ' + t('0') + ' and you can’t divide by ' + t('0') + ': the slope is <b>undefined</b> (vertical).' : rise === 0 ? '. The rise is ' + t('0') + ', so the slope is ' + t('0') + ' (horizontal).' : '.');
    return slopePart(prompt, sl, sol, ['Use ' + t('m=\\frac{y_2-y_1}{x_2-x_1}') + ', subtracting in the <b>same order</b> on the top and the bottom.', 'Watch the signs when you subtract a negative: ' + t('a-(-b)=a+b') + '.'], text || ('slope ' + nmA + nmB + ' ' + ptT(A) + ptT(Bp)));
  }

  /* ---------------- drawing parts ---------------- */
  function gv(pts, pieces) { return { pts: pts || [], pieces: pieces || [], join: 'none' }; }
  function seg(a, b, s, e) { return { v: [a, b], s: s || 'closed', e: e || 'closed' }; }
  function lineV(a, b) { return gv([], [seg(a, b, 'arrow', 'arrow')]); }
  var LINEHELP = '<div class="muted">Use <b>╱ Line</b>: tap the given point, tap a second point on the line, then tap it again to finish. The ends start as arrows (a line goes on forever).</div>';
  var SEGHELP = '<div class="muted">Use <b>╱ Line</b>: tap where the segment starts, tap where it ends, then tap that end again to finish. The ends are solid dots.</div>';
  function bgPt(P0, w) { var o = { x: P0[0], y: P0[1] }; if (P0[0] <= w.x[1] - 4 && P0[1] <= w.y[1] - 1) o.label = ptPlain(P0); return o; }
  function inWin(p, w) { return p[0] >= w.x[0] && p[0] <= w.x[1] && p[1] >= w.y[0] && p[1] <= w.y[1]; }
  function winFor(P0) { var w = { x: [-7, 7], y: [-7, 7] }; if (P0[1] < -7) w.y = [-9, 5]; if (P0[1] > 7) w.y = [-5, 9]; if (P0[0] < -7) w.x = [-9, 5]; if (P0[0] > 7) w.x = [-5, 9]; return w; }
  function lineInfo(resp) { var g = DR.geom(resp), ks = Object.keys(g.lines); return { g: g, ks: ks, L: ks.length === 1 ? g.lines[ks[0]] : null }; }
  function lineDiag(L, P0, sl) {   // one drawn line L (A x + B y = C) vs the target through P0 with slope sl = [p, q]
    var thr = Math.abs(L.A * P0[0] + L.B * P0[1] - L.C) < 1e-6, ms = L.B === 0 ? null : -L.A / L.B, mt = sl[1] === 0 ? null : sl[0] / sl[1];
    var sameM = (ms === null && mt === null) || (ms !== null && mt !== null && near(ms, mt));
    if (sameM && !thr) return wrong('draw-point', 'Right steepness — but the line has to pass through the given point ' + t(ptT(P0)) + '. Start there.');
    if (!thr) return null;
    if (sameM) return null;
    var pq = mt === null ? 'up or down only' : t(Math.abs(sl[0])) + ' ' + (mt >= 0 ? 'up' : 'down') + ' for every ' + t(sl[1]) + ' to the right';
    if (mt === 0 && ms === null) return wrong('draw-vh', 'That line is vertical (undefined slope). A slope of ' + t('0') + ' is <b>horizontal</b>: the rise is ' + t('0') + '.');
    if (mt === null && ms === 0) return wrong('draw-vh', 'That line is horizontal (slope ' + t('0') + '). An undefined slope is <b>vertical</b>: the run is ' + t('0') + '.');
    if (ms !== null && mt !== null && mt !== 0 && near(ms, -mt)) return wrong('draw-slope-sign', 'Your line goes through ' + t(ptT(P0)) + ', but it ' + (ms > 0 ? 'rises' : 'falls') + ' from left to right. A ' + (mt > 0 ? 'positive' : 'negative') + ' slope ' + (mt > 0 ? 'rises' : 'falls') + ': step ' + pq + '.');
    if (ms !== null && mt !== null && mt !== 0 && near(ms, 1 / mt)) return wrong('draw-slope-flip', 'Your line has rise and run swapped. From ' + t(ptT(P0)) + ' step ' + pq + ' (the top number of the slope is the rise).');
    return wrong('draw-slope', 'Your line passes through ' + t(ptT(P0)) + ' but its slope is ' + t(ms === null ? '\\text{undefined}' : slT(LN.toFr(ms))) + '. From ' + t(ptT(P0)) + ' step ' + pq + '.');
  }
  /* "plot the line through P0 with slope sl" (a whole line: arrows) */
  function lineDrawPart(prompt, P0, sl, win, P1, sol, hints, text) {
    var target = lineV(P0, P1), W = [];
    var flipS = sl[0] !== 0 ? [P0[0] + sl[0], P0[1] + sl[1]] : null, sgnS = [P0[0] + sl[1], P0[1] - sl[0]];
    if (sl[0] !== 0 && sl[1] !== 0) W.push({ is: lineV(P0, sgnS), code: 'draw-slope-sign', hint: 'Check the direction: a ' + (sl[0] / sl[1] > 0 ? 'positive slope rises' : 'negative slope falls') + ' from left to right.' });
    if (flipS && Math.abs(sl[0]) !== Math.abs(sl[1])) W.push({ is: lineV(P0, flipS), code: 'draw-slope-flip', hint: 'Rise and run are swapped: the top of the slope is the rise (up/down), the bottom is the run (across).' });
    var exact = K.graphExact(target, { wrong: W });
    var check = function (resp) {
      if (DR.empty(resp)) return form('empty', 'Draw the line on the grid first.');
      if (DR.same(resp, target)) return ok();
      var li = lineInfo(resp);
      if (li.L) { var d = lineDiag(li.L, P0, sl); if (d) return d; }
      return exact(resp);
    };
    var inp = { x: win.x, y: win.y, labels: 2, defaultEnd: 'arrow', tools: ['line', 'ends'], bg: { points: [bgPt(P0, win)] } };
    var p = B.graph(prompt + LINEHELP, inp, check, target, sol, hints, text);
    p.bad = [gv([], [seg(P0, P1)])].concat(W.map(function (w) { return w.is; }));
    return p;
  }
  /* "draw a segment through P0 with slope sl that crosses both axes" */
  function segDrawPart(prompt, P0, sl, win, key, xi, yi, sol, hints, text) {
    var check = function (resp) {
      if (DR.empty(resp)) return form('empty', 'Draw the segment on the grid first.');
      var li = lineInfo(resp);
      if (!li.ks.length) return wrong('draw-noline', 'Join your points with the <b>╱ Line</b> tool to make a segment.');
      if (li.ks.length > 1) return wrong('draw-many', 'Draw one straight segment (every part of it on the same line).');
      var d = lineDiag(li.L, P0, sl); if (d) return d;
      var thr = Math.abs(li.L.A * P0[0] + li.L.B * P0[1] - li.L.C) < 1e-6;
      if (!thr) return wrong('draw-point', 'The segment has to pass through ' + t(ptT(P0)) + '.');
      if (!DR.contains(resp, P0)) return wrong('draw-point', 'Your segment is on the right line, but make it reach the given point ' + t(ptT(P0)) + '.');
      var arrows = li.L.iv.some(function (iv) { return !isFinite(iv.lo) || !isFinite(iv.hi); });
      if (!DR.contains(resp, [xi, 0]) || !DR.contains(resp, [0, yi])) return wrong('draw-short', 'Right direction — now make the segment longer: it has to cross <b>both</b> the ' + t('x') + '-axis and the ' + t('y') + '-axis. Keep stepping the rise and run.');
      if (arrows) return form('draw-arrows', 'Right line! A <b>segment</b> stops at two end points, though — use <b>●○ Ends</b> to make each end a solid dot.');
      return ok();
    };
    var inp = { x: win.x, y: win.y, labels: 2, defaultEnd: 'closed', tools: ['line', 'ends'], bg: { points: [bgPt(P0, win)] } };
    var p = B.graph(prompt + SEGHELP, inp, check, key, sol, hints, text);
    var n1 = [P0[0] + sl[1], P0[1] + sl[0]];
    p.bad = [gv([], [seg(P0, n1)]), gv([], [seg([P0[0] - sl[1] * 3, P0[1] + sl[0] * 3], [P0[0] + sl[1] * 3, P0[1] - sl[0] * 3])]), gv([], [seg(P0, [P0[0] + sl[0] * 3, P0[1] + sl[1] * 3])])];
    return p;
  }

  /* ---------------- generators for shared questions ---------------- */
  function q1Shared(r) {
    for (var g = 0; g < 50; g++) {
      var ab = r.pick([[4, 8], [2, 4], [2, 6], [4, 6], [3, 6], [2, 8], [6, 8]]), cd = r.pick([[4, 6], [2, 4], [2, 6], [3, 6], [2, 8], [4, 8], [6, 8]]);
      var ef = r.pick([[6, 4], [4, 2], [6, 2], [8, 2], [8, 4], [8, 6]]), k = r.pick([1, 1, 2, 3]), n = k === 1 ? r.pick([4, 5, 6, 7]) : k === 2 ? r.pick([2, 3, 4]) : r.pick([2, 3]);
      var segs = placeSegs(r, [{ rise: ab[0], run: ab[1] }, { rise: -cd[0], run: cd[1] }, { rise: -ef[0], run: ef[1] }, { rise: k * n, run: n }], 5);
      if (segs) return { segs: segs, names: ['AB', 'CD', 'EF', 'GH'] };
    }
    return { segs: [[[-5, 1], [3, 5]], [[-4, -1], [2, -5]], [[-3, 4], [1, -2]], [[-2, -3], [4, 3]]], names: ['AB', 'CD', 'EF', 'GH'] };
  }
  function q2Shared(r) {
    for (var g = 0; g < 300; g++) {
      var f1 = r.pick([[1, 2], [1, 3], [2, 3], [1, 4], [3, 4]]), j1 = f1[1] <= 2 ? 2 : r.pick([1, 2]);
      var k2 = r.pick([2, 3, 4, 5]), f3 = r.pick([[1, 3], [1, 4], [2, 5], [1, 5], [3, 5], [1, 2], [2, 3]]), j3 = f3[1] <= 3 ? 2 : 1;
      var k4 = r.pick([2, 3, 4]), j4 = k4 <= 3 ? r.pick([1, 2]) : 1;
      var steps = [[f1[1] * j1, f1[0] * j1], [1, k2], [f3[1] * j3, -f3[0] * j3], [j4, -k4 * j4]];
      if (steps.some(function (s) { return Math.abs(s[0]) > 8 || Math.abs(s[1]) > 9; })) continue;
      var M = steps.map(function (s) { var xlo = -5, xhi = 5 - s[0], ylo = Math.max(-5, -5 - s[1]), yhi = Math.min(5, 5 - s[1]); if (xhi < xlo || yhi < ylo) return null; var A = [r.int(xlo, xhi), r.int(ylo, yhi)]; return [A, [A[0] + s[0], A[1] + s[1]]]; });
      if (M.some(function (m) { return !m; })) continue;
      var ends = [], bad = false; M.forEach(function (m) { ends.push(m[0], m[1]); });
      for (var i = 0; i < ends.length && !bad; i++) for (var j = 0; j < i; j++) if (Math.hypot(ends[i][0] - ends[j][0], ends[i][1] - ends[j][1]) < 1.9) { bad = true; break; }
      if (bad) continue;
      // full drawn lines (a little past the marked points) must not run through another line's marked point
      var drawn = M.map(function (m) { var d = [m[1][0] - m[0][0], m[1][1] - m[0][1]]; return [clipEnd(m[0], [-d[0], -d[1]], 1.3, 5.7), clipEnd(m[1], d, 1.3, 5.7)]; });
      for (var a = 0; a < 4 && !bad; a++) for (var e = 0; e < ends.length; e++) if (Math.floor(e / 2) !== a && distSeg(ends[e], drawn[a][0], drawn[a][1]) < 0.45) { bad = true; break; }
      if (bad) continue;
      return { M: M, drawn: drawn };
    }
    return { M: [[[-5, 3], [-1, 5]], [[1, -5], [2, -1]], [[-5, -1], [1, -3]], [[2, 5], [4, -1]]], drawn: [[[-5.3, 2.85], [-0.6, 5.2]], [[0.9, -5.4], [2.6, 1.4]], [[-5.3, -0.9], [1.2, -3.0667]], [[1.9, 5.3], [4.4, -2.2]]] };
  }
  function q2Fig(sh) {
    var segs = sh.drawn.map(function (d) { return { pts: d }; }), pts = [];
    sh.M.forEach(function (m, i) { pts.push({ x: m[0][0], y: m[0][1] }, { x: m[1][0], y: m[1][1], label: 'Line ' + (i + 1) }); });
    return HW.graph({ x: [-6, 6], y: [-6, 6], labels: 2, segs: segs, points: pts, max: 340, aria: 'four lines on a grid' });
  }
  function intPtsOn(P0, sl, win) { var out = []; for (var k = -20; k <= 20; k++) { var p = [P0[0] + k * sl[1], P0[1] + k * sl[0]]; if (inWin(p, win)) out.push(p); } return out; }
  function q3Shared(r) {
    var win = { x: [-7, 7], y: [-7, 7] };
    for (var g = 0; g < 400; g++) {
      var sl = g === 0 && r.chance(0.2) ? [2, 3] : r.pick([[2, 3], [1, 2], [3, 4], [1, 3], [3, 2], [2, 5]]), P0 = g === 0 && r.chance(0.3) ? [-6, -3] : [r.int(-7, -3), r.int(-6, -2)];
      var m = sl[0] / sl[1], yi = cl(P0[1] - m * P0[0]), xi = cl(P0[0] - P0[1] / m);
      if (Math.abs(yi) < 0.9 || Math.abs(yi) > 5.5 || Math.abs(xi) < 0.9 || Math.abs(xi) > 6) continue;
      var ip = intPtsOn(P0, sl, win); if (ip.length < 4) continue;
      var lo = ip[0], hi = ip[ip.length - 1];
      if (!(lo[0] < Math.min(0, xi) - 0.01 && hi[0] > Math.max(0, xi) + 0.01)) continue;
      return { sl: sl, P0: P0, win: win, ip: ip, key: gv([], [seg(lo, hi)]), xi: xi, yi: yi };
    }
    return { sl: [2, 3], P0: [-6, -3], win: win, ip: intPtsOn([-6, -3], [2, 3], win), key: gv([], [seg([-6, -3], [6, 5])]), xi: -1.5, yi: 1 };
  }
  function cfg(r, pool, xr, yr, bk) {
    for (var g = 0; g < 300; g++) {
      var useB = bk && g === 0 && r.chance(0.25), sl = useB ? bk[0] : r.pick(pool), P0 = useB ? bk[1] : [r.int(xr[0], xr[1]), r.int(yr[0], yr[1])];
      if (sl[1] < 0) sl = [-sl[0], -sl[1]];
      var win = winFor(P0); if (!inWin(P0, win)) continue;
      var P1 = null;[1, -1, 2, -2, 3, -3].forEach(function (k) { var p = [P0[0] + k * sl[1], P0[1] + k * sl[0]]; if (!P1 && inWin(p, win)) P1 = p; });
      if (!P1) continue;
      return { sl: sl, P0: P0, win: win, P1: P1 };
    }
    return null;
  }
  function q4Shared(r) {
    return {
      a: cfg(r, [[3, 5], [2, 5], [3, 4], [2, 3], [4, 5], [1, 3]], [1, 5], [-5, -1], [[3, 5], [3, -1]]),
      b: cfg(r, [[-1, 4], [-1, 3], [-1, 5], [-1, 2]], [2, 6], [1, 5], [[-1, 4], [5, 2]]),
      c: cfg(r, [[-5, 2], [-3, 2], [-4, 3], [-5, 3], [-7, 4]], [-7, -3], [3, 7], [[-5, 2], [-6, 7]]),
      d: cfg(r, [[3, 1], [2, 1], [4, 1]], [0, 0], [-6, -2], [[3, 1], [0, -5]]),
      e: cfg(r, [[-3, 1], [-2, 1], [-4, 1]], [1, 3], [-8, -5], [[-3, 1], [1, -8]]),
      f: cfg(r, [[0, 1]], [0, 0], [2, 7], [[0, 1], [0, 7]])
    };
  }
  function q4Draw(c, L) {
    var sl = c.sl, P0 = c.P0, P1 = c.P1;
    var sol = (sl[0] === 0 ? 'A slope of ' + t('0') + ' is horizontal: every point on the line has ' + t('y=' + nT(P0[1])) + '.' :
      'Write the slope as ' + t('\\frac{\\text{rise}}{\\text{run}}=' + rawFr(sl[0], sl[1])) + '. From ' + t(ptT(P0)) + ' step ' + upDown(sl[0]) + ' and ' + t(sl[1]) + ' right' + (inWin([P0[0] + sl[1], P0[1] + sl[0]], c.win) ? '' : ' (or the reverse: ' + upDown(-sl[0]) + ' and ' + t(sl[1]) + ' left)') + ' to reach ' + t(ptT(P1)) + '.') + ' Draw the line through the two points, with arrows on both ends.';
    return lineDrawPart('Plot the line through ' + t(ptT(P0)) + ' with slope ' + t(slT(red(sl[0], sl[1]))) + '.', P0, sl, c.win, P1, sol,
      ['Write the slope as a fraction ' + t('\\frac{\\text{rise}}{\\text{run}}') + (sl[1] === 1 && sl[0] !== 0 ? ' — for example ' + t(sl[0] + '=\\frac{' + sl[0] + '}{1}') : '') + '. Start at the given point and step the rise and the run.', sl[0] / sl[1] < 0 ? 'A negative slope: step down as you go right (or up as you go left).' : 'Two points are enough to draw a line.'], 'draw line slope ' + slT(red(sl[0], sl[1])) + ' through ' + ptT(P0));
  }
  function q4Pts(c, L) {
    var sl = c.sl, P0 = c.P0, key = stepPts(P0, sl, sl[0] === 0 ? [1, -1, 2] : [1, -1, 2]);
    var good = [ptsT(stepPts(P0, sl, [-1, -2, -3])), ptsT(stepPts(P0, sl, [3, 4, 5]))];
    var bad = sl[0] !== 0 ? [ptsT([[P0[0] + sl[1], P0[1] - sl[0]], [P0[0] - sl[1], P0[1] + sl[0]], [P0[0] + 2 * sl[1], P0[1] - 2 * sl[0]]])] : [ptsT([[P0[0], P0[1] + 1], [P0[0], P0[1] + 2], [P0[0], P0[1] - 1]])];
    var p = ptsPart('Line with slope ' + t(slT(red(sl[0], sl[1]))) + ' through ' + t(ptT(P0)) + ': list three other points on the line that have integer coordinates.', { n: 3, integer: true, exclude: [P0], test: onLineTest(P0, sl) }, key,
      (sl[0] === 0 ? 'Slope ' + t('0') + ': the line is horizontal, so every point has ' + t('y=' + nT(P0[1])) + ', e.g. ' + t(ptsT(key)) + '.' : 'Step ' + t('(+' + sl[1] + ',\\ ' + (sl[0] > 0 ? '+' : '') + sl[0] + ')') + ' or ' + t('(-' + sl[1] + ',\\ ' + (sl[0] > 0 ? '-' : '+') + Math.abs(sl[0]) + ')') + ' from ' + t(ptT(P0)) + ': ' + t(ptsT(key)) + ', … (other correct points are fine).'),
      ['Each step: add the run to ' + t('x') + ' and the rise to ' + t('y') + '. Going the other way, subtract both.', 'Check a point: from ' + t(ptT(P0)) + ', does ' + t('\\frac{\\text{change in }y}{\\text{change in }x}') + ' equal the slope?'], 'three points on line slope ' + slT(red(sl[0], sl[1])) + ' through ' + ptT(P0));
    p.good = good; p.bad = bad; return p;
  }
  function q5Part(P, sl, L, lvlTxt) {
    var key = sl[1] === 0 ? [[P[0], P[1] + 3], [P[0], P[1] - 4]] : sl[0] === 0 ? [[P[0] + 3, P[1]], [P[0] - 4, P[1]]] : stepPts(P, sl, [1, 2]);
    var sT = sl[1] === 0 ? '\\text{undefined}' : slT(red(sl[0], sl[1]));
    var sol = sl[1] === 0 ? 'An undefined slope means the run is ' + t('0') + ' (a vertical segment), so ' + t('Q') + ' keeps ' + t('x=' + nT(P[0])) + ': for example ' + t(ptsT(key)) + '.'
      : sl[0] === 0 ? 'A slope of ' + t('0') + ' means the rise is ' + t('0') + ' (a horizontal segment), so ' + t('Q') + ' keeps ' + t('y=' + nT(P[1])) + ': for example ' + t(ptsT(key)) + '.'
        : t(sT === rawFr(sl[0], sl[1]) ? sT : sT + '=' + rawFr(sl[0], sl[1])) + ', so step ' + t('(+' + sl[1] + ',\\ ' + (sl[0] > 0 ? '+' : '') + sl[0] + ')') + ' from ' + t('P' + ptT(P)) + ': ' + t(ptsT(key)) + '. (Any point you reach by stepping a multiple of the run and rise works, e.g. ' + t(ptT([P[0] - sl[1], P[1] - sl[0]])) + '.)';
    var p = ptsPart('(' + L + ') Slope of ' + t('PQ') + ' ' + t('=' + sT) + '. Give two positions for ' + t('Q') + '.', { n: 2, exclude: [P], test: onLineTest(P, sl) }, key, sol,
      [sl[1] === 0 ? 'Undefined slope: what has to be true about the run?' : sl[0] === 0 ? 'Slope 0: what has to be true about the rise?' : 'Write the slope as ' + t('\\frac{\\text{rise}}{\\text{run}}') + (sl[1] === 1 ? ' (' + t(sl[0] + '=\\frac{' + sl[0] + '}{1}') + ')' : '') + ', then step from ' + t('P') + '.'], 'two Q with slope ' + sT + ' from ' + ptT(P));
    p.good = [ptsT(sl[1] === 0 ? [[P[0], P[1] + 1], [P[0], P[1] - 1]] : sl[0] === 0 ? [[P[0] + 1, P[1]], [P[0] - 1, P[1]]] : stepPts(P, sl, [-1, 3]))];
    p.bad = [ptsT(sl[1] === 0 ? [[P[0] + 1, P[1]], [P[0] + 2, P[1]]] : sl[0] === 0 ? [[P[0], P[1] + 1], [P[0], P[1] + 2]] : [[P[0] + sl[1], P[1] - sl[0]], [P[0] + sl[0], P[1] + sl[1]]])];
    return p;
  }
  function q6Part(r, L, kind) {
    var pools = { a: [[3, 8], [2, 5], [3, 4], [5, 8], [3, 10], [4, 9], [2, 3]], b: [[2, 7], [3, 5], [2, 9], [3, 4], [4, 7], [5, 6]], c: [[5, 12], [3, 8], [4, 9], [7, 12], [5, 6], [2, 7]], d: [[7, 10], [3, 5], [5, 8], [4, 7], [2, 9], [5, 9]] };
    var bk = { a: [[3, 8], 5], b: [[2, 7], 4], c: [[5, 12], 3], d: [[7, 10], 3] }[L];
    var useB = r.chance(0.2), f = useB ? bk[0] : r.pick(pools[L]), k = useB ? bk[1] : r.int(L === 'a' ? 3 : 2, L === 'c' ? 4 : 6);
    var neg = L === 'b' || L === 'c', p = neg ? -f[0] : f[0], q = f[1], m = p / q, rise = p * k, run = q * k, sT = frT(p, q);
    if (kind === 'rise') {
      return B.number('(' + L + ') slope ' + t('=' + sT) + ', run ' + t('=' + run) + '. Find the rise.', rise, function (v) {
        if (near(v, run / m)) return { code: 'calc-divided', hint: 'You divided. Since ' + t('\\text{slope}=\\frac{\\text{rise}}{\\text{run}}') + ', the rise is <b>slope × run</b>.' };
        if (near(v, -rise)) return { code: 'calc-sign', hint: 'Check the sign: a ' + (m > 0 ? 'positive' : 'negative') + ' slope with a positive run has a ' + (m > 0 ? 'positive' : 'negative') + ' rise.' };
        return null;
      }, t('\\text{rise}=\\text{slope}\\times\\text{run}=' + sT + '\\times ' + run + '=' + rise), ['Rearrange ' + t('\\text{slope}=\\frac{\\text{rise}}{\\text{run}}') + ': multiply both sides by the run.', 'Divide ' + t(run) + ' by ' + t(q) + ' first, then multiply by ' + t(p) + '.'], 'rise from slope ' + sT + ' run ' + run, { before: 'rise =' });
    }
    return B.number('(' + L + ') slope ' + t('=' + sT) + ', rise ' + t('=' + rise) + '. Find the run.', run, function (v) {
      if (near(v, rise * m)) return { code: 'calc-mult', hint: 'You multiplied. Since ' + t('\\text{slope}=\\frac{\\text{rise}}{\\text{run}}') + ', the run is <b>rise ÷ slope</b>.' };
      if (near(v, -run)) return { code: 'calc-sign', hint: 'Check the sign: the rise and the slope are both ' + (rise < 0 && m < 0 ? 'negative' : rise > 0 && m > 0 ? 'positive' : 'given') + ', so ' + t('\\text{run}=\\frac{\\text{rise}}{\\text{slope}}') + ' is ' + (run > 0 ? 'positive' : 'negative') + '.' };
      return null;
    }, t('\\text{run}=\\frac{\\text{rise}}{\\text{slope}}=\\frac{' + rise + '}{' + sT + '}=' + rise + '\\times ' + (p < 0 ? '\\left(' + frT(q, p) + '\\right)' : frT(q, p)) + '=' + run), ['Rearrange ' + t('\\text{slope}=\\frac{\\text{rise}}{\\text{run}}') + ' to get ' + t('\\text{run}=\\frac{\\text{rise}}{\\text{slope}}') + '.', 'Dividing by a fraction = multiplying by its reciprocal.'], 'run from slope ' + sT + ' rise ' + rise, { before: 'run =' });
  }
  /* "does the ramp meet the code?" (rise in cm, run in m; code: slope at most 1/12) */
  function rampMC(r, R, run) {
    var s = R / (run * 100), meets = s <= 1 / 12 + 1e-12, sD = dec(s, 3), cmRun = cl(run * 100);
    var corr = (meets ? '<b>Yes.</b> ' : '<b>No.</b> ') + 'In the same units the slope is ' + t('\\frac{' + R + '}{' + cmRun + '}\\approx ' + sD) + ', which is ' + (meets ? 'less' : 'greater') + ' than ' + t('\\frac{1}{12}\\approx 0.083') + (meets ? ', so it is gentle enough.' : ', so the ramp is too steep.');
    var opts = [{ html: corr, right: true },
      { html: (meets ? '<b>No.</b> The slope ' + t('\\approx ' + sD) + ' is less than ' + t('\\frac{1}{12}') + ', so the ramp isn’t steep enough.' : '<b>Yes.</b> The slope ' + t('\\approx ' + sD) + ' is greater than ' + t('\\frac{1}{12}') + ', and the code needs at least ' + t('\\frac{1}{12}') + '.'), code: 'ramp-max', why: 'Read the rule again: the slope may be <b>no greater than</b> ' + t('\\frac{1}{12}') + ' — it is a maximum. A greater slope is steeper than allowed; a smaller one is fine.' },
      { html: '<b>No.</b> The slope is ' + t(R + '\\div ' + run + '\\approx ' + dec(R / run, 1)) + ', far more than ' + t('\\frac{1}{12}') + '.', code: 'units-cm', why: 'The rise is in centimetres and the run is in metres. Change them to the same units before you divide: ' + t(run + '\\text{ m}=' + cmRun + '\\text{ cm}') + '.' },
      { html: '<b>Yes.</b> Run ' + t('\\div') + ' rise ' + t('=' + cmRun + '\\div ' + R + '\\approx ' + dec(cmRun / R, 1)) + ', which is greater than ' + t('\\frac{1}{12}') + '.', code: 'calc-flip', why: 'Slope is <b>rise ÷ run</b>, not run ÷ rise. (Run ÷ rise would have to be at least ' + t('12') + '.)' }];
    return { opts: opts, meets: meets, s: s, sD: sD, cmRun: cmRun };
  }

  function pyrShared(r) { for (var g = 0; g < 200; g++) { var o = g === 0 && r.chance(0.3) ? [10, 12] : r.pick([[10, 12], [8, 6], [10, 8], [12, 9], [6, 9], [8, 10], [10, 6], [12, 15], [16, 12], [8, 14], [6, 7], [10, 13]]); var a17 = 2 * o[1] / o[0], a18 = Math.SQRT2 * o[1] / o[0]; if (Math.abs(a17 * 10 - Math.round(a17 * 10)) > 1e-9) continue; var fr = a18 * 10 - Math.floor(a18 * 10); if (Math.abs(fr - 0.5) < 0.08) continue; return { s: o[0], h: o[1] }; } return { s: 10, h: 12 }; }
  function pyrStem(sh) { return 'A pyramid has a square base of side length ' + t(sh.s) + ' m and a vertical height of ' + t(sh.h) + ' m.' + pyramidFig(sh.s, sh.h); }

  HW.defineLesson({
    id: 'u6l3', unit: 6, num: '3', title: 'Rise Over Run: The Slope of a Line Segment', outcome: 'RF3',
    blurb: 'Slope as rise over run — counted off a grid, positive, negative, zero or undefined, read as a rate of change with units, and run backwards from a given slope.',
    questions: [
      { num: '1', stem: function (sh) { return 'Each line segment on the grid has endpoints with integer coordinates. Find the rise, the run and the slope of each segment.' + segFig(sh.segs, sh.names, 5); },
        shared: q1Shared,
        parts: [0, 1, 2, 3].map(function (i) { return { id: '1' + 'abcd'.charAt(i), sub: ['AB', 'CD', 'EF', 'GH'][i], level: 'BEG', make: function (r, sh) { return rrPart(sh.names[i], sh.segs[i][0], sh.segs[i][1]); } }; }) },
      { num: '2', stem: function (sh) { return 'Each line passes through the two marked points, which have integer coordinates. Calculate the slope of each line.' + q2Fig(sh); },
        shared: q2Shared,
        parts: [0, 1, 2, 3].map(function (i) {
          return { id: '2' + 'abcd'.charAt(i), sub: 'Line ' + (i + 1), level: 'BEG', make: function (r, sh) {
            var A = sh.M[i][0], Bp = sh.M[i][1], rise = Bp[1] - A[1], run = Bp[0] - A[0], sl = slopeOf(A, Bp);
            return slopePart('Slope of Line ' + (i + 1) + ':', sl, 'Marked points ' + t(ptT(A)) + ' and ' + t(ptT(Bp)) + ': run ' + t(run) + ', rise ' + t(rise) + '.<br>' + t('m=' + fracSteps(rise, run)) + (sval(sl) < 0 ? ' — the line falls from left to right.' : ' — the line rises from left to right.'),
              ['Use the two marked points. Count the run from the left point to the right point, and the rise (up +, down −).', 'Slope ' + t('=\\frac{\\text{rise}}{\\text{run}}') + ', in lowest terms.'], 'slope of line through ' + ptT(A) + ptT(Bp));
          } };
        }) },
      { num: '3', stem: function (sh) { return 'A line segment passes through the point ' + t(ptT(sh.P0)) + ' and has a slope of ' + t(slT(sh.sl)) + '.'; },
        shared: q3Shared,
        parts: [
          { id: '3a', sub: 'draw', level: 'EMG', make: function (r, sh) {
            var sl = sh.sl;
            return segDrawPart('Draw the segment on the grid. It must be long enough to cross both the ' + t('x') + '-axis and the ' + t('y') + '-axis.', sh.P0, sl, sh.win, sh.key, sh.xi, sh.yi,
              'From ' + t(ptT(sh.P0)) + ' step ' + t(sl[0]) + ' up and ' + t(sl[1]) + ' right, again and again: ' + t(ptsT(sh.ip.filter(function (p) { return p[0] > sh.P0[0]; }).slice(0, 4))) + '. A segment from ' + t(ptT(sh.ip[0])) + ' to ' + t(ptT(sh.ip[sh.ip.length - 1])) + ' crosses the ' + t('y') + '-axis at ' + t('(0,\\ ' + frT.apply(null, LN.toFr(sh.yi)) + ')') + ' and the ' + t('x') + '-axis at ' + t('(' + frT.apply(null, LN.toFr(sh.xi)) + ',\\ 0)') + '.',
              ['Slope ' + t(slT(sl)) + ': from the point, go ' + t(sl[0]) + ' up and ' + t(sl[1]) + ' right. Repeat until you are past both axes.', 'Join your first and last points with one straight segment.'], 'draw segment slope ' + slT(sl) + ' through ' + ptT(sh.P0));
          } },
          { id: '3b', sub: 'points', level: 'BEG', make: function (r, sh) {
            var others = sh.ip.filter(function (p) { return !same(p, sh.P0); }), key = others.slice(0, 3), sl = sh.sl;
            var p = ptsPart('Write the coordinates of three other points on the segment that have integer coordinates.', { n: 3, integer: true, exclude: [sh.P0], test: onLineTest(sh.P0, sl) }, key,
              'From ' + t(ptT(sh.P0)) + ' each run of ' + t('+' + sl[1]) + ' pairs with a rise of ' + t('+' + sl[0]) + ': ' + t(ptsT(sh.ip)) + '. Any three of these (other than the given point) are correct.',
              ['Add ' + t(sl[1]) + ' to ' + t('x') + ' and ' + t(sl[0]) + ' to ' + t('y') + ', again and again.'], 'three points slope ' + slT(sl) + ' from ' + ptT(sh.P0));
            p.good = [ptsT(others.slice(-3))]; p.bad = [ptsT(stepPts(sh.P0, [sl[1], sl[0]], [1, 2, 3])), ptsT(stepPts(sh.P0, [-sl[0], sl[1]], [1, 2, 3]))];
            return p;
          } }] },
      { num: '4', stem: 'For each slope and point, plot the line through the given point, then list three other points on it that have integer coordinates. (The line does not have to cross both axes.)',
        shared: q4Shared,
        parts: ['a', 'b', 'c', 'd', 'e', 'f'].reduce(function (acc, L) {
          var lv = { a: ['EMG', 'BEG'], b: ['EMG', 'BEG'], c: ['EMG', 'BEG'], d: ['BEG', 'BEG'], e: ['BEG', 'BEG'], f: ['BEG', 'LIM'] }[L];
          acc.push({ id: '4' + L, sub: L + ' · line', level: lv[0], make: function (r, sh) { return q4Draw(sh[L], L); } });
          acc.push({ id: '4' + L + 'p', sub: L + ' · points', level: lv[1], make: function (r, sh) { return q4Pts(sh[L], L); } });
          return acc;
        }, []) },
      { num: '5', stem: function (sh) { return t('P') + ' has coordinates ' + t(ptT(sh.P)) + '. Find two positions for point ' + t('Q') + ' so that the slope of ' + t('PQ') + ' is the value given.'; },
        shared: function (r) { return { P: r.chance(0.25) ? [2, -3] : [r.int(-3, 4), r.int(-4, 3)], s: { a: r.pick([3, 2, 4]), b: r.pick([-2, -3, -4]), c: r.pick([[2, 5], [1, 3], [2, 3], [3, 4], [1, 4], [3, 5]]), d: r.pick([[-3, 4], [-2, 3], [-1, 4], [-3, 5], [-2, 5], [-4, 5]]) } }; },
        parts: [
          { id: '5a', level: 'BEG', make: function (r, sh) { return q5Part(sh.P, [sh.s.a, 1], 'a'); } },
          { id: '5b', level: 'BEG', make: function (r, sh) { return q5Part(sh.P, [sh.s.b, 1], 'b'); } },
          { id: '5c', level: 'EMG', make: function (r, sh) { return q5Part(sh.P, sh.s.c, 'c'); } },
          { id: '5d', level: 'EMG', make: function (r, sh) { return q5Part(sh.P, sh.s.d, 'd'); } },
          { id: '5e', level: 'BEG', make: function (r, sh) { return q5Part(sh.P, [0, 1], 'e'); } },
          { id: '5f', level: 'BEG', make: function (r, sh) { return q5Part(sh.P, [1, 0], 'f'); } }] },
      { num: '6', stem: 'Two of the three measures rise, run and slope are given. Calculate the third measure.', parts: [
        { id: '6a', level: 'EMG', make: function (r) { return q6Part(r, 'a', 'rise'); } },
        { id: '6b', level: 'PRG', make: function (r) { return q6Part(r, 'b', 'run'); } },
        { id: '6c', level: 'EMG', make: function (r) { return q6Part(r, 'c', 'rise'); } },
        { id: '6d', level: 'PRG', make: function (r) { return q6Part(r, 'd', 'run'); } }] },
      { num: '7', stem: '', parts: [
        { id: '7', level: 'EMG', make: function (r) {
          var useB = r.chance(0.25), f = useB ? [3, 5] : r.pick([[3, 5], [2, 5], [1, 4], [3, 4], [2, 3], [1, 3], [3, 8], [1, 2]]), u = useB ? 0.5 : r.pick([0.3, 0.4, 0.5, 0.6, 0.7, 0.8]);
          var base = cl(f[1] * u), h = cl(f[0] * u), m = f[0] / f[1];
          for (var g = 0; g < 20 && (base > 6.5 || base < 1.5); g++) { u = r.pick([0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.2]); base = cl(f[1] * u); h = cl(f[0] * u); }
          return B.number('A skateboard ramp has a slope of ' + t(frT(f[0], f[1])) + '. Calculate the height of the ramp if its base length is ' + t(base) + ' metres.', h, function (v) {
            if (near(v, cl(base / m))) return { code: 'calc-divided', hint: 'You divided by the slope. The height is the <b>rise</b> and the base is the <b>run</b>: rise = slope × run.' };
            if (near(v, cl(base * f[1] / f[0]))) return { code: 'calc-flip', hint: 'Slope is rise over run: the height goes on top.' };
            return null;
          }, 'The height is the rise and the base length is the run, so ' + t('\\text{rise}=\\text{slope}\\times\\text{run}=' + frT(f[0], f[1]) + '\\times ' + base + '=' + h) + '. The ramp is ' + t(h) + ' m high.',
          ['Which measure is the height — the rise or the run?', 'Multiply the slope by the base length.'], 'ramp height slope ' + f[0] + '/' + f[1] + ' base ' + base, { after: 'm' });
        } }] },
      { num: '8', stem: '', parts: [
        { id: '8', level: 'ADV', make: function (r) {
          var useB = r.chance(0.25), f = useB ? [5, 12] : r.pick([[5, 12], [3, 4], [2, 3], [3, 5], [1, 2], [4, 5], [2, 5], [5, 8]]), u = useB ? 0.3 : r.pick([0.2, 0.3, 0.4, 0.5, 0.6]);
          var half = cl(f[1] * u); if (half > 6) { u = 0.2; half = cl(f[1] * u); }
          var BC = cl(2 * half), h = cl(f[0] * u), area = cl(half * h);
          return B.number('Triangle ' + t('ABC') + ' is isosceles with ' + t('AB=AC') + ' and ' + t('BC=' + BC) + ' cm. The slope of ' + t('AC') + ' is ' + t(frT(-f[0], f[1])) + '. Calculate the area of the triangle. (The height ' + t('h') + ' meets ' + t('BC') + ' at its midpoint.)' + triFig(half, h, mn(BC), mn(half)), area, function (v) {
            if (near(v, cl(2 * area))) return { code: 'area-full', hint: 'Check two things: the run for ' + t('AC') + ' is only <b>half</b> of ' + t('BC') + ' (the height meets ' + t('BC') + ' at its midpoint), and the area of a triangle is ' + t('\\frac{1}{2}\\times\\text{base}\\times\\text{height}') + '.' };
            if (near(v, h)) return { code: 'area-noh', hint: 'That’s the height ' + t('h') + '. Now use it to find the <b>area</b>.' };
            if (near(v, -area)) return { code: 'calc-sign', hint: 'An area is positive. The negative slope only tells you ' + t('AC') + ' falls from left to right; use its size for the height.' };
            if (near(v, cl(0.5 * BC * half * f[1] / f[0]))) return { code: 'calc-flip', hint: 'Slope is rise over run: ' + t('\\frac{h}{' + half + '}=\\frac{' + f[0] + '}{' + f[1] + '}') + '.' };
            return null;
          }, 'The height meets ' + t('BC') + ' at its midpoint, so the run from the foot of the height to ' + t('C') + ' is ' + t('\\frac{1}{2}(' + BC + ')=' + half) + ' cm.<br>The size of the slope of ' + t('AC') + ' is ' + t('\\frac{\\text{rise}}{\\text{run}}=\\frac{h}{' + half + '}') + ', so ' + t('\\frac{h}{' + half + '}=' + frT(f[0], f[1]) + '\\Rightarrow h=' + frT(f[0], f[1]) + '\\times ' + half + '=' + h) + ' cm.<br>' + t('\\text{Area}=\\frac{1}{2}\\times ' + BC + '\\times ' + h + '=' + area) + ' cm².',
          ['Use the slope of ' + t('AC') + ' to find the height ' + t('h') + ' first. What is the run from the foot of the height to ' + t('C') + '?', 'Then area ' + t('=\\frac{1}{2}\\times\\text{base}\\times\\text{height}') + '.'], 'isosceles area BC ' + BC + ' slope ' + f[0] + '/' + f[1], { after: 'cm²' });
        } }] },
      { num: '9', stem: function (sh) { return 'A cyclist rides at a steady pace. Her distance–time graph passes through ' + t('(0,\\ 0)') + ' and ' + t('(' + sh.tt + ',\\ ' + sh.d + ')') + ', where time is in hours and distance is in kilometres.'; },
        shared: function (r) { var o = r.chance(0.25) ? [18, 2.5] : r.pick([[12, 2.5], [14, 2.5], [16, 2.5], [18, 2.5], [20, 1.5], [24, 1.5], [16, 3.5], [12, 3.5], [22, 1.5], [15, 2], [18, 3]]); return { v: o[0], tt: o[1], d: cl(o[0] * o[1]) }; },
        parts: [
          { id: '9a', sub: 'a', level: 'BEG', make: function (r, sh) {
            return B.number('(a) Determine the slope of the graph (the number).', sh.v, function (v) {
              if (near(v, cl(sh.tt / sh.d)) || near(v, Number((sh.tt / sh.d).toFixed(2))) || near(v, Number((sh.tt / sh.d).toFixed(3)))) return { code: 'rate-flip', hint: 'That’s run over rise. Distance is on the vertical axis: slope ' + t('=\\frac{\\text{change in distance}}{\\text{change in time}}') + '.' };
              if (near(v, sh.d)) return { code: 'rate-one', hint: 'That’s the distance. The slope compares the change in distance with the change in time.' };
              return null;
            }, 'rise ' + t('=' + sh.d + '-0=' + sh.d) + ' km, run ' + t('=' + sh.tt + '-0=' + sh.tt) + ' h. ' + t('\\text{slope}=\\frac{' + sh.d + '\\text{ km}}{' + sh.tt + '\\text{ h}}=' + sh.v) + ' km/h.', ['Slope ' + t('=\\frac{\\text{rise}}{\\text{run}}') + ' — what is on the vertical axis?'], 'cyclist slope ' + sh.d + '/' + sh.tt);
          } },
          { id: '9au', sub: 'a · units', level: 'LIM', make: function (r, sh) {
            return B.mc(r, 'What are the units of the slope?', [{ html: 'km/h (kilometres per hour)', right: true },
              { html: 'h/km (hours per kilometre)', why: 'Units upside down: a slope’s units are (vertical-axis units) <b>per</b> (horizontal-axis unit). Distance is on the vertical axis.' },
              { html: 'km (kilometres)', why: 'A slope is a rise divided by a run, so its units are a ratio: km divided by h.' },
              { html: 'km·h (kilometre-hours)', why: 'The rise is <b>divided</b> by the run, not multiplied: km ÷ h.' }],
            'Slope ' + t('=\\frac{' + sh.d + '\\text{ km}}{' + sh.tt + '\\text{ h}}=' + sh.v + '\\text{ km/h}') + ': units of the vertical axis per unit of the horizontal axis.', ['The rise is in km and the run is in hours. What do you get when you divide them?'], 'units of cyclist slope');
          } },
          { id: '9b', sub: 'b', level: 'LIM', make: function (r, sh) {
            return B.mc(r, '(b) What does the slope tell you about the cyclist?', [{ html: 'She rides ' + sh.v + ' km every hour (her speed).', right: true },
              { html: 'She rides for ' + sh.v + ' hours.', why: 'The slope compares distance with time: it is a <b>rate</b>, so it is km per hour, not a length of time.' },
              { html: 'She ends up ' + sh.v + ' km from home.', why: 'That would be a distance. The slope tells how fast the distance changes.' },
              { html: 'Each kilometre takes her ' + sh.v + ' hours.', why: 'That’s the rate upside down (hours per km). The slope is km per hour.' }],
            'The slope is ' + t(sh.v) + ' km/h: she covers ' + t(sh.v) + ' km every hour — the slope of a distance–time graph is the <b>speed</b>.', ['Read the units: km per h.'], 'meaning of cyclist slope');
          } }] },
      { num: '10', stem: function (sh) { return 'The graph shows the balance on Jaden’s bus pass during the first weeks of school.' + HW.graph({ x: [0, sh.W + 1], y: [0, sh.ytop], grid: 1, gridY: sh.gy, labelsX: 2, labelsY: sh.gy, unitX: Math.min(26, 300 / (sh.W + 1)), unitY: 230 / sh.ytop, firstQuadrant: true, xName: '', yName: '', xTitle: 'Week', yTitle: 'Balance ($)', segs: [{ pts: [[0, sh.B], [sh.W, 0]] }], points: [{ x: 0, y: sh.B, label: '(0, ' + sh.B + ')' }, { x: sh.w, y: sh.B - sh.rt * sh.w, label: '(' + sh.w + ', ' + (sh.B - sh.rt * sh.w) + ')' }], max: 360, aria: 'bus pass balance graph' }); },
        shared: function (r) { var o = r.chance(0.25) ? [60, 6] : r.pick([[60, 6], [48, 6], [72, 6], [80, 8], [40, 4], [50, 5], [64, 8], [90, 9], [60, 5], [70, 7], [56, 7]]); var Wk = o[0] / o[1]; return { B: o[0], rt: o[1], W: Wk, w: r.chance(0.3) ? 4 : r.int(2, Math.min(5, Wk - 3)), ytop: Math.ceil((o[0] + 8) / 10) * 10, gy: 10 }; },
        parts: [
          { id: '10a', level: 'BEG', make: function (r, sh) {
            var y2 = sh.B - sh.rt * sh.w;
            return B.number('(a) Determine the slope of the graph, including its units.', -sh.rt, function (v) {
              if (near(v, sh.rt)) return { code: 'rate-sign', hint: 'The balance goes <b>down</b> as the weeks go by, so the slope is negative.' };
              if (near(v, cl(-1 / sh.rt)) || near(v, cl(1 / sh.rt))) return { code: 'rate-flip', hint: 'That’s run over rise. Slope ' + t('=\\frac{\\text{change in balance}}{\\text{change in weeks}}') + '.' };
              if (near(v, -(sh.B - y2)) || near(v, sh.B - y2)) return { code: 'rate-one', hint: 'That’s the change in balance over ' + t(sh.w) + ' weeks. Divide by the run, ' + t(sh.w) + ' weeks.' };
              return null;
            }, 'From ' + t('(0,\\ ' + sh.B + ')') + ' to ' + t('(' + sh.w + ',\\ ' + y2 + ')') + ': rise ' + t('=' + y2 + '-' + sh.B + '=' + (y2 - sh.B)) + ' dollars, run ' + t('=' + sh.w) + ' weeks. ' + t('\\text{slope}=\\frac{' + (y2 - sh.B) + '}{' + sh.w + '}=' + (-sh.rt)) + ' dollars per week.',
            ['Use the two marked points. Is the graph going up or down?'], 'bus pass slope', { after: 'dollars per week' });
          } },
          { id: '10b', level: 'EMG', make: function (r, sh) {
            return B.mc(r, '(b) What does the slope mean in this situation?', [{ html: 'The balance goes down by $' + sh.rt + ' every week (Jaden spends $' + sh.rt + ' a week on fares).', right: true },
              { html: 'The balance goes up by $' + sh.rt + ' every week.', why: 'The slope is negative: the balance is <b>decreasing</b>.' },
              { html: 'The pass started with $' + sh.rt + ' on it.', why: 'The starting balance is where the graph meets the vertical axis ($' + sh.B + '). The slope is a rate: dollars per week.' },
              { html: 'The pass lasts ' + sh.rt + ' weeks.', why: 'The slope’s units are dollars per week — it tells how fast the balance changes, not how long it lasts.' }],
            'The slope is ' + t('-' + sh.rt) + ' dollars per week: the minus sign means the balance <b>decreases</b>, by $' + sh.rt + ' each week.', ['What do the units “dollars per week” and the negative sign tell you?'], 'meaning of negative rate');
          } },
          { id: '10c', level: 'EMG', make: function (r, sh) {
            return B.number('(c) After how many weeks will the pass be empty?', sh.W, function (v) {
              if (near(v, sh.rt)) return { code: 'rate-one', hint: 'That’s the amount spent each week. How many weeks until all $' + sh.B + ' is used up?' };
              return null;
            }, '$' + sh.B + ' at $' + sh.rt + ' per week lasts ' + t(sh.B + '\\div ' + sh.rt + '=' + sh.W) + ' weeks — where the graph meets the horizontal axis.', ['Where does the graph reach a balance of $0?'], 'weeks until empty', { after: 'weeks' });
          } }] },
      { num: '11', stem: function (sh) { return 'A highway sign warns of ' + (sh.g === 8 || sh.g === 11 || sh.g === 18 ? 'an ' : 'a ') + t(sh.g + '\\%') + ' downhill grade.'; },
        shared: function (r) { return { g: r.chance(0.25) ? 8 : r.pick([4, 5, 6, 8, 10, 12, 15, 6, 8]), d: r.chance(0.25) ? 1.5 : r.pick([0.5, 1.5, 2, 2.5, 3, 1.2, 0.8]) }; },
        parts: [
          { id: '11a', level: 'BEG', make: function (r, sh) {
            var f = red(sh.g, 100);
            var p = B.fraction('(a) Write ' + t(sh.g + '\\%') + ' as a fraction in lowest terms.', f, { diag: function (v) { if (near(v, -f[0] / f[1])) return { code: 'calc-sign', hint: 'The grade itself, ' + t(sh.g + '\\%') + ', is positive — “downhill” tells you the direction.' }; if (near(v, sh.g / 10)) return { code: 'grade-whole', hint: 'Percent means “out of 100”: ' + t(sh.g + '\\%=\\frac{' + sh.g + '}{100}') + '.' }; return null; } },
              t(sh.g + '\\%=\\frac{' + sh.g + '}{100}=' + frT(f[0], f[1])) + ': the road drops ' + t(f[0]) + ' m for every ' + t(f[1]) + ' m of run.', ['Percent means “out of 100”. Then reduce.'], 'grade ' + sh.g + '% as fraction');
            p.bad = ['\\frac{' + sh.g + '}{100}'].filter(function () { return gcd(sh.g, 100) > 1; }); return p;
          } },
          { id: '11b', level: 'EMG', make: function (r, sh) {
            var m = cl(sh.d * 1000), drop = cl(sh.g * sh.d * 10);
            return B.number('(b) How many metres does the road drop over a horizontal distance of ' + t(sh.d) + ' km?', drop, function (v) {
              if (near(v, cl(sh.g * sh.d / 100))) return { code: 'units-km', hint: 'Change ' + t(sh.d + '\\text{ km}') + ' to metres first: the answer should be in metres.' };
              if (near(v, cl(sh.g * m))) return { code: 'grade-whole', hint: t(sh.g + '\\%') + ' is ' + t('\\frac{' + sh.g + '}{100}') + ', not ' + t(sh.g) + '.' };
              if (near(v, -drop)) return { code: 'calc-sign', hint: 'The question asks how many metres the road <b>drops</b> — give the distance as a positive number.' };
              if (near(v, cl(m * 100 / sh.g))) return { code: 'calc-divided', hint: 'Multiply the run by the grade: drop = ' + t('\\frac{' + sh.g + '}{100}\\times\\text{run}') + '.' };
              return null;
            }, t(sh.d + '\\text{ km}=' + m + '\\text{ m}') + ' of run. Drop ' + t('=\\frac{' + sh.g + '}{100}\\times ' + m + '=' + drop) + ' m.', ['Convert km to m (1 km = 1000 m).', 'drop = grade × run.'], 'drop at ' + sh.g + '% over ' + sh.d + ' km', { after: 'm' });
          } }] },
      { num: '12', stem: function (sh) { return 'A building code requires a wheelchair ramp to have a slope no greater than ' + t('\\frac{1}{12}') + '. A ramp must rise ' + t(sh.R) + ' cm to reach a doorway.'; },
        shared: function (r) {
          var R = r.chance(0.25) ? 45 : r.pick([30, 36, 40, 45, 48, 50, 54, 60, 75]), min = cl(0.12 * R), fail = r.chance(0.6), dlt = r.pick([0.3, 0.4, 0.5, 0.6, 0.8]);
          var run = R === 45 && fail && r.chance(0.5) ? 4.8 : cl(fail ? min - dlt : min + dlt);
          return { R: R, min: min, run: Number(run.toFixed(2)) };
        },
        parts: [
          { id: '12a', level: 'PRG', make: function (r, sh) {
            var m = rampMC(r, sh.R, sh.run);
            return B.mc(r, '(a) A contractor plans a ramp with a run of ' + t(sh.run) + ' m. Does it meet the code? Choose the answer with correct reasoning.', m.opts,
              'Use the same units: ' + t(sh.run + '\\text{ m}=' + m.cmRun + '\\text{ cm}') + '. ' + t('\\text{slope}=\\frac{' + sh.R + '}{' + m.cmRun + '}\\approx ' + m.sD) + ', and ' + t('\\frac{1}{12}\\approx 0.083') + '. ' + (m.meets ? t(m.sD + '\\le 0.083') + ', so the ramp <b>meets the code</b>.' : t(m.sD + '>0.083') + ', so the ramp is too steep: it <b>does not meet the code</b>.'),
              ['Put the rise and the run in the same units, then compare the slope with ' + t('\\frac{1}{12}\\approx 0.083') + '.'], 'ramp ' + sh.R + ' cm over ' + sh.run + ' m');
          } },
          { id: '12b', level: 'PRG', make: function (r, sh) {
            var ans = sh.min;
            var p = B.number('(b) What is the shortest run, in metres, that meets the code?', ans, function (v) {
              if (near(v, cl(12 * sh.R))) return { code: 'units-cm', hint: 'That’s in centimetres — give the run in <b>metres</b>.' };
              if (near(v, cl(sh.R / 12)) || near(v, cl(sh.R / 1200)) || near(v, Number((sh.R / 12).toFixed(2)))) return { code: 'calc-divided', hint: 'A slope of at most ' + t('\\frac{1}{12}') + ' means at least ' + t('12') + ' cm of run for every ' + t('1') + ' cm of rise: <b>multiply</b> the rise by 12.' };
              return null;
            }, 'Each ' + t('1') + ' cm of rise needs at least ' + t('12') + ' cm of run: ' + t('\\text{run}=' + sh.R + '\\times 12=' + cl(12 * sh.R)) + ' cm ' + t('=' + ans) + ' m. (Any shorter run makes the slope greater than ' + t('\\frac{1}{12}') + '.)', ['Solve ' + t('\\frac{' + sh.R + '}{\\text{run}}=\\frac{1}{12}') + '.', 'Then change cm to m.'], 'shortest ramp run for ' + sh.R + ' cm', { after: 'm' });
            p.bad = [String(cl(12 * sh.R))]; return p;
          } }] },
      { num: '13', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '13', level: 'LIM', make: function (r) {
          var ab = r.chance(0.25) ? [5, 2] : r.pick([[5, 2], [4, 3], [5, 3], [3, 2], [5, 4], [4, 5], [3, 4], [2, 5]]), a = ab[0], b = ab[1], mir = r.chance(0.3), right = mir ? frT(a, b) : frT(-a, b);
          var opts = [[a, b], [-a, b], [b, a], [-b, a]].map(function (f) { var tx = frT(f[0], f[1]), isR = tx === right; return { html: t(tx), right: isR, why: isR ? null : (Math.abs(f[0]) === b && Math.abs(f[1]) === a ? 'That’s run over rise. The vertical leg is the rise.' : 'Right size — check the sign: does ' + t('\\overline{PQ}') + ' rise or fall from left to right?') }; });
          return B.mc(r, 'The slope of ' + t('\\overline{PQ}') + ' is' + pqFig(a, b, mir), opts,
            'The dashed legs give the rise and the run. ' + (mir ? 'From ' + t('Q') + ' (left) up to ' + t('P') + ' the rise is ' + t('+' + a) + ' and the run is ' + t('+' + b) + ': ' + t('\\overline{PQ}') + ' rises left to right. Slope ' + t('=\\frac{' + a + '}{' + b + '}') + '.' : 'From ' + t('P') + ' down to ' + t('Q') + ' the rise is ' + t('-' + a) + ' and the run is ' + t(b) + ': ' + t('\\overline{PQ}') + ' falls left to right. Slope ' + t('=\\frac{-' + a + '}{' + b + '}=' + right) + '.'),
            ['Which leg is the rise (vertical)? Does the segment go up or down as you move right?'], 'slope of PQ from legs ' + a + ',' + b);
        } }] },
      { num: '14', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '14', level: 'BEG', make: function (r) {
          var useB = r.chance(0.25), P = useB ? [-3, 0] : [r.int(-5, 3), r.int(-4, 4)], f = useB ? [3, 4] : r.pick([[3, 4], [2, 3], [2, 5], [1, 3], [3, 5], [4, 3], [5, 2], [1, 4]]), p = f[0], q = f[1];
          var opts = [{ html: t(ptT([P[0] + q, P[1] - p])), right: true },
            { html: t(ptT([P[0] + q, P[1] + p])), why: 'That point is up and to the right, so its slope from ' + t(ptT(P)) + ' is positive. A negative slope goes <b>down</b> as you move right.' },
            { html: t(ptT([P[0] - q, P[1] + p])), why: 'That point is on the line, but it is to the <b>left</b> of ' + t(ptT(P)) + '.' },
            { html: t(ptT([P[0] - q, P[1] - p])), why: 'That point is down and to the left, so its slope from ' + t(ptT(P)) + ' is positive.' }];
          return B.mc(r, 'The point ' + t(ptT(P)) + ' is on a line with slope ' + t(frT(-p, q)) + '. The next point with integer coordinates on the line, to the right of ' + t(ptT(P)) + ', is', opts,
            'Write the slope as ' + t('\\frac{\\text{rise}}{\\text{run}}=\\frac{-' + p + '}{' + q + '}') + '. The smallest whole step to the right is run ' + t('+' + q) + ', rise ' + t('-' + p) + ': ' + t('(' + nT(P[0]) + '+' + q + ',\\ ' + nT(P[1]) + '-' + p + ')=' + ptT([P[0] + q, P[1] - p])) + '.', ['To the right means the run is positive. With a negative slope, what is the sign of the rise?'], 'next point right slope -' + p + '/' + q);
        } }] },
      { num: '15', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '15', level: 'PRG', make: function (r) {
          var L = r.chance(0.4) ? ['W', 'X', 'Y', 'Z'] : r.shuffle(['W', 'X', 'Y', 'Z']), Q = { I: L[0], II: L[1], III: L[2], IV: L[3] }, pos = r.chance(0.6);
          var word = pos ? 'positive' : 'negative', sure = pos ? [Q.I, Q.III] : [Q.II, Q.IV], never = pos ? [Q.II, Q.IV] : [Q.I, Q.III];
          var mix = [[Q.I, Q.II], [Q.II, Q.III], [Q.III, Q.IV], [Q.I, Q.IV]], two = r.sample(mix, 2);
          var nm = function (pr) { return t(pr.slice().sort().join('')); };
          var why = function (pr) { var qs = Object.keys(Q).filter(function (k) { return pr.indexOf(Q[k]) >= 0; }); var sameY = (qs.indexOf('I') >= 0 && qs.indexOf('II') >= 0) || (qs.indexOf('III') >= 0 && qs.indexOf('IV') >= 0); return 'Not guaranteed: ' + nm(pr) + ' joins quadrants ' + qs.join(' and ') + ', where both points have ' + (sameY ? 'the same sign of ' + t('y') + ', so the rise' : 'the same sign of ' + t('x') + ', so the run') + ' could be positive, negative or zero.'; };
          var opts = [{ html: 'Line segment ' + nm(sure) + ' has a ' + word + ' slope.', right: true },
            { html: 'Line segment ' + nm(two[0]) + ' has a ' + word + ' slope.', why: why(two[0]) },
            { html: 'Line segment ' + nm(two[1]) + ' has a ' + word + ' slope.', why: why(two[1]) },
            { html: 'Line segment ' + nm(never) + ' has a ' + word + ' slope.', why: nm(never) + ' joins quadrants ' + (pos ? 'II and IV' : 'I and III') + ': the rise and run always have ' + (pos ? 'opposite' : 'the same') + ' signs, so that slope is always <b>' + (pos ? 'negative' : 'positive') + '</b>.' }];
          return B.mc(r, t(Q.I) + ' is a point in quadrant I, ' + t(Q.II) + ' is in quadrant II, ' + t(Q.III) + ' is in quadrant III and ' + t(Q.IV) + ' is in quadrant IV. Which statement <b>must</b> be true?', opts,
            'Going from the quadrant ' + (pos ? 'III point to the quadrant I point' : 'II point to the quadrant IV point') + ', ' + (pos ? 'both ' + t('x') + ' and ' + t('y') + ' increase: run and rise are both positive' : t('x') + ' increases and ' + t('y') + ' decreases: the run is positive and the rise negative') + ', for <b>every</b> choice of points. So ' + nm(sure) + ' always has a ' + word + ' slope. Segments joining neighbouring quadrants can have any slope.',
            ['Sketch the four quadrants and try a few different points for each pair.'], 'quadrant slope must be ' + word);
        } }] },
      { num: '16', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '16', level: 'BEG', make: function (r) {
          var useB = r.chance(0.25), a = useB ? 3 : r.pick([2, 3, 4, 5]), bb = useB ? 4 : a + r.int(1, 2), sm = useB ? [1, 5] : r.pick([[1, 5], [1, 4], [2, 5], [1, 3]]), nf = useB ? [3, 2] : r.pick([[3, 2], [5, 4], [4, 3], [5, 3]].filter(function (f) { return f[0] / f[1] < a; }));
          var opts = [{ html: t('m=' + a), why: t(a) + ' is the greatest <b>number</b>, but steepness ignores the sign: compare the sizes ' + t('|m|') + '.' },
            { html: t('m=-' + bb), right: true }, { html: t('m=' + frT(sm[0], sm[1])), why: 'A slope this small is close to horizontal — nearly flat.' },
            { html: t('m=' + frT(-nf[0], nf[1])), why: 'Compare sizes: ' + t('\\left|' + frT(-nf[0], nf[1]) + '\\right|=' + frT(nf[0], nf[1])) + ', which is less than ' + t(bb) + '.' }];
          return B.mc(r, 'Four lines have the slopes listed below. Which line is the steepest?', opts,
            'Steepness is the size of the slope, ignoring the sign: ' + t('|' + a + '|=' + a + ',\\ |-' + bb + '|=' + bb + ',\\ \\left|' + frT(sm[0], sm[1]) + '\\right|=' + frT(sm[0], sm[1]) + ',\\ \\left|' + frT(-nf[0], nf[1]) + '\\right|=' + frT(nf[0], nf[1])) + '. The largest size is ' + t(bb) + ', so ' + t('m=-' + bb) + ' is steepest.', ['Ignore the signs and compare the sizes.'], 'steepest of four slopes');
        } }] },
      { num: '17', section: 'Numerical Response', stem: pyrStem, shared: pyrShared,
        parts: [
          { id: '17', level: 'EMG', make: function (r, sh) {
            var ans = 2 * sh.h / sh.s;
            return B.approx('<i>(Numerical Response)</i> A beetle starts at the midpoint of one edge of the base and climbs straight up the face to the apex, as in the side view. To the nearest tenth, the slope of the beetle’s climb is ________.', ans, 1, { nr: true, diag: function (v) {
              if (near(v, K.roundTo(sh.h / sh.s, 1))) return { code: 'pyr-base', hint: 'The beetle starts at the middle of an edge, so the run to the point under the apex is only <b>half</b> the side length.' };
              if (near(v, K.roundTo(sh.s / (2 * sh.h), 1))) return { code: 'calc-flip', hint: 'Slope is rise over run: the height goes on top.' };
              return null;
            } }, 'In the side view the run is half the base side and the rise is the height: run ' + t('=\\frac{' + sh.s + '}{2}=' + sh.s / 2) + ' m, rise ' + t('=' + sh.h) + ' m. ' + t('\\text{slope}=\\frac{' + sh.h + '}{' + sh.s / 2 + '}=' + K.roundTo(ans, 1).toFixed(1)) + '.', ['Rise = the height. Run = from the start point to the point straight under the apex.'], 'beetle slope s=' + sh.s + ' h=' + sh.h);
          } }] },
      { num: '18', stem: pyrStem, shared: pyrShared,
        parts: [
          { id: '18', level: 'ADV', make: function (r, sh) {
            var hd = sh.s * Math.SQRT2 / 2, ans = sh.h / hd;
            return B.approx('<i>(Numerical Response)</i> A fly starts at a corner of the base and climbs along the slanted edge to the apex. To the nearest tenth, the slope of the fly’s climb is ________.', ans, 1, { nr: true, diag: function (v) {
              if (near(v, K.roundTo(2 * sh.h / sh.s, 1))) return { code: 'pyr-half', hint: 'That’s the beetle’s slope. The fly starts at a <b>corner</b>: its run goes from the corner to the centre of the base — half the <b>diagonal</b> of the square.' };
              if (near(v, K.roundTo(sh.h / (2 * hd), 1))) return { code: 'pyr-diag', hint: 'The apex is above the centre of the base, so the run is <b>half</b> the diagonal.' };
              if (near(v, K.roundTo(sh.h / sh.s, 1))) return { code: 'pyr-base', hint: 'The run is from the corner to the point under the apex (the centre of the square): half the diagonal.' };
              if (near(v, K.roundTo(hd / sh.h, 1))) return { code: 'calc-flip', hint: 'Slope is rise over run: the height goes on top.' };
              return null;
            } }, 'Along a slanted edge the run is half the base diagonal. The diagonal is ' + t('\\sqrt{' + sh.s + '^2+' + sh.s + '^2}=' + sh.s + '\\sqrt{2}') + ' m, so the run is ' + t(nT(sh.s / 2) + '\\sqrt{2}\\approx ' + hd.toFixed(4)) + ' m. ' + t('\\text{slope}=\\frac{' + sh.h + '}{' + hd.toFixed(4) + '}\\approx ' + ans.toFixed(4) + '\\approx ' + K.roundTo(ans, 1).toFixed(1)) + '.', ['The apex is directly above the centre of the square base. How far is a corner from the centre?', 'Use the Pythagorean theorem for the diagonal of the base.'], 'fly slope s=' + sh.s + ' h=' + sh.h);
          } }] }
    ],
    extra: EXTRA()
  });

  /* ======================= Extra practice ======================= */
  function EXTRA() {
    return [
      { num: '1', section: 'Extra practice A — Counting slope off a grid', stem: function (sh) { return 'Each segment has endpoints with integer coordinates. Find the rise, the run and the slope. Write <i>undefined</i> for the slope where that is the answer (and give the rise and run anyway).' + segFig(sh.segs, sh.names, 6); },
        shared: function (r) {
          for (var g = 0; g < 60; g++) {
            var ab = r.pick([[8, 6], [6, 4], [4, 2], [8, 4], [9, 6], [6, 2]]), cd = r.pick([[6, 5], [5, 3], [4, 3], [7, 4], [5, 2], [7, 5]]), ef = r.int(3, 6), gh = r.int(3, 7);
            var segs = placeSegs(r, [{ rise: -ab[0], run: ab[1] }, { rise: cd[0], run: cd[1] }, { rise: 0, run: ef }, { rise: -gh, run: 0 }], 6);
            if (segs) return { segs: segs, names: ['AB', 'CD', 'EF', 'GH'] };
          }
          return { segs: [[[-6, 3], [0, -5]], [[-5, -2], [0, 4]], [[2, 5], [6, 5]], [[3, -1], [3, -6]]], names: ['AB', 'CD', 'EF', 'GH'] };
        },
        parts: [0, 1, 2, 3].map(function (i) { return { id: 'e1' + 'abcd'.charAt(i), sub: ['AB', 'CD', 'EF', 'GH'][i], level: 'BEG', make: function (r, sh) { return rrPart(sh.names[i], sh.segs[i][0], sh.segs[i][1]); } }; }) },
      { num: '2', stem: function (sh) { return 'On this grid <b>one square across represents 2 units</b>, while one square up represents 1 unit. Read the tick labels, not the squares.' + HW.graph({ x: [0, 18], y: [0, 8], grid: 2, gridY: 1, labelsX: 2, labelsY: 1, unitX: 16, unitY: 32, firstQuadrant: true, segs: [{ pts: [sh.P, sh.Q] }, { pts: [sh.R, sh.S] }], points: [{ x: sh.P[0], y: sh.P[1], label: 'P' }, { x: sh.Q[0], y: sh.Q[1], label: 'Q' }, { x: sh.R[0], y: sh.R[1], label: 'R' }, { x: sh.S[0], y: sh.S[1], label: 'S' }], max: 360, aria: 'grid with unequal scales' }); },
        shared: function (r) {
          for (var g = 0; g < 300; g++) {
            var a = r.int(2, 5), b = r.int(3, 7), c = r.int(3, 6), d = r.int(3, 6);
            var P = [2 * r.int(1, 9 - a), r.int(1, 8 - b)], Q = [P[0] + 2 * a, P[1] + b], R = [2 * r.int(0, 9 - c), r.int(d + 1, 8)], S = [R[0] + 2 * c, R[1] - d];
            if (R[0] === 0 && S[0] === 0) continue;
            if (b / (2 * a) === b / a || a === b || 2 * a === b) continue;
            var pts = [P, Q, R, S], bad = false; for (var i = 0; i < 4; i++) for (var j = 0; j < i; j++) if (Math.hypot((pts[i][0] - pts[j][0]) / 2, pts[i][1] - pts[j][1]) < 2) bad = true;
            if (pts.some(function (p) { return p[0] <= 0 || p[0] >= 18 || p[1] <= 0; })) bad = true;
            var sc = function (p) { return [p[0] / 2, p[1]]; };
            if (distSeg(sc(P), sc(R), sc(S)) < 1 || distSeg(sc(Q), sc(R), sc(S)) < 1 || distSeg(sc(R), sc(P), sc(Q)) < 1 || distSeg(sc(S), sc(P), sc(Q)) < 1) bad = true;
            if (!bad) return { P: P, Q: Q, R: R, S: S };
          }
          return { P: [2, 1], Q: [10, 7], R: [4, 8], S: [16, 3] };
        },
        parts: [
          { id: 'e2a', sub: 'a', level: 'BEG', make: function (r, sh) {
            var nm = ['P', 'Q', 'R', 'S'], pts = [sh.P, sh.Q, sh.R, sh.S];
            var checks = pts.map(function (p, i) { return function (resp) {
              var L = readPts(resp); if (L.empty) return form('empty', 'Fill in the coordinates of ' + t(nm[i]) + '.'); if (L.bad || L.pts.length !== 1) return form('pts-format', 'Write one point in brackets, e.g. ' + t('(6,\\ 2)') + '.');
              var q = L.pts[0]; if (same(q, p)) return ok();
              if (same(q, [p[1], p[0]])) return wrong('pt-swap', 'Coordinates swapped: ' + t('x') + ' (across) comes first.');
              if (same(q, [p[0] / 2, p[1]])) return wrong('scale-squares', 'You counted squares across. Each square across is <b>2</b> units — read the tick labels.');
              return wrong('pt-other', 'Read the tick labels below and beside the point again.');
            }; });
            return B.fields('(a) Write the coordinates of ' + t('P') + ', ' + t('Q') + ', ' + t('R') + ' and ' + t('S') + '.', nm.map(function (n) { return { label: t(n), name: n, mode: 'math', keys: 'pairs', placeholder: '(x, y)' }; }), checks, pts.map(ptT),
              nm.map(function (n, i) { return t(n + ptT(pts[i])); }).join(', '), 'Read the tick labels (across: 2 per square; up: 1 per square): ' + nm.map(function (n, i) { return t(n + ptT(pts[i])); }).join(', ') + '.', ['Across, each square is 2 units: count squares and double.'], 'read points on 2:1 grid');
          } },
          { id: 'e2b', sub: 'b', level: 'EMG', make: function (r, sh) {
            var s1 = slopeOf(sh.P, sh.Q), s2 = slopeOf(sh.R, sh.S), sq1 = red(sh.Q[1] - sh.P[1], (sh.Q[0] - sh.P[0]) / 2), sq2 = red(sh.S[1] - sh.R[1], (sh.S[0] - sh.R[0]) / 2);
            var mk = function (sl, sq) { var c = K.slope(sl, { diag: function (v) { return near(v, sq[0] / sq[1]) ? { code: 'scale-squares', hint: 'You counted squares. Each square across is 2 units, so the run is twice the number of squares.' } : null; } }); return c; };
            return B.fields('(b) Calculate the slope of ' + t('PQ') + ' and the slope of ' + t('RS') + '.', [{ label: t('m_{PQ}'), name: 'PQ', mode: 'math', keys: 'slope' }, { label: t('m_{RS}'), name: 'RS', mode: 'math', keys: 'slope' }], [mk(s1, sq1), mk(s2, sq2)], [slT(s1), slT(s2)],
              t('m_{PQ}=' + slT(s1) + ',\\ m_{RS}=' + slT(s2)), t('m_{PQ}=' + formulaT(sh.P, sh.Q) + '=' + fracSteps(sh.Q[1] - sh.P[1], sh.Q[0] - sh.P[0])) + '<br>' + t('m_{RS}=' + formulaT(sh.R, sh.S) + '=' + fracSteps(sh.S[1] - sh.R[1], sh.S[0] - sh.R[0])), ['Use the coordinates from (a), not the squares.'], 'slopes on 2:1 grid');
          } },
          { id: 'e2c', sub: 'c', level: 'EMG', make: function (r, sh) {
            var s1 = slopeOf(sh.P, sh.Q), sq = red(sh.Q[1] - sh.P[1], (sh.Q[0] - sh.P[0]) / 2);
            return B.mc(r, '(c) A student counts squares instead of units and reports ' + t(slT(sq)) + ' for ' + t('PQ') + '. How is that answer related to the correct one, and why?', [
              { html: 'It is <b>twice</b> the correct slope: each square across is 2 units, so counting squares halves the run, and halving the bottom of a fraction doubles it.', right: true },
              { html: 'It is <b>half</b> the correct slope, because the squares across are worth 2 units.', why: 'Compare the numbers: ' + t(slT(sq)) + ' vs ' + t(slT(s1)) + '. Which is bigger? A smaller run (bottom) makes a bigger fraction.' },
              { html: 'It is the reciprocal of the correct slope.', why: 'Only the run is miscounted; the rise is still on top.' },
              { html: 'It is the same slope written differently.', why: 'Work out both as decimals: ' + t(slT(sq) + '=' + dec(sval(sq), 3)) + ' and ' + t(slT(s1) + '=' + dec(sval(s1), 3)) + '.' }],
              'Counting squares: rise ' + t(sh.Q[1] - sh.P[1]) + ', run ' + t((sh.Q[0] - sh.P[0]) / 2) + ' squares, so ' + t(slT(sq)) + '. But ' + t((sh.Q[0] - sh.P[0]) / 2) + ' squares across are ' + t(sh.Q[0] - sh.P[0]) + ' units, so the student’s run is half the true run, and ' + t(slT(sq) + '=2\\times ' + slT(s1)) + '.', ['Compare the run the student used with the true run.'], 'square-counting doubles slope');
          } },
          { id: 'e2d', sub: 'd', level: 'PRG', make: function (r, sh) {
            var s2 = slopeOf(sh.R, sh.S), sq = red(sh.S[1] - sh.R[1], (sh.S[0] - sh.R[0]) / 2), half = red(sh.S[1] - sh.R[1], 2 * (sh.S[0] - sh.R[0]));
            return B.mc(r, '(d) What would a student who counts squares instead of units get for ' + t('RS') + '? Would <i>any</i> segment on this grid be given its correct slope by counting squares?', [
              { html: t(slT(sq)) + ', twice the correct value. Only a <b>horizontal</b> segment comes out right (its slope is ' + t('0') + ' either way); a vertical one is undefined either way.', right: true },
              { html: t(slT(sq)) + ', twice the correct value. No segment can ever come out right.', why: 'Try a horizontal segment: its rise is ' + t('0') + ', so ' + t('\\frac{0}{\\text{run}}=0') + ' whether you count squares or units.' },
              { html: t(slT(half)) + ', half the correct value. Only vertical segments come out right.', why: 'Counting squares makes the run smaller, which makes the slope bigger, not smaller.' },
              { html: t(slT(sq)) + ', twice the correct value. Segments with slope ' + t('1') + ' come out right.', why: 'A slope of ' + t('1') + ' in units would be counted as ' + t('2') + ' in squares — every non-zero slope is doubled.' }],
              'Squares: rise ' + t(sh.S[1] - sh.R[1]) + ', run ' + t((sh.S[0] - sh.R[0]) / 2) + ', so ' + t(slT(sq)) + ' — again twice the correct ' + t(slT(s2)) + '. Every segment with a non-zero run has its run halved and its slope doubled. Only a <b>horizontal</b> segment (rise ' + t('0') + ') comes out right; a vertical one is undefined either way.', ['What happens to a slope of 0 when you halve the run?'], 'which segments survive square counting');
          } }] },
      { num: '3', stem: function (sh) { return 'Four segments are given by their endpoints: ' + sh.segs.map(function (s) { return t(s.n.charAt(0) + ptT(s.A) + '\\to ' + s.n.charAt(1) + ptT(s.B)); }).join(', ') + '.'; },
        shared: function (r) {
          var combos = [[[-2, 5], [-1, 1], [3, 2], [-5, 2]], [[-1, 3], [-1, 1], [4, 3], [-2, 1]], [[-1, 4], [-2, 3], [3, 2], [-5, 3]], [[-2, 7], [-3, 4], [5, 4], [-3, 2]], [[-1, 2], [-4, 3], [5, 3], [-3, 1]]];
          var sl = r.chance(0.3) ? combos[0] : r.pick(combos), names = ['JK', 'LM', 'NP', 'QR'], order = r.chance(0.3) ? [1, 2, 0, 3] : r.shuffle([0, 1, 2, 3]);
          var segs = order.map(function (k, i) {
            var f = sl[k], mults = [1, 2, 3, 4, 6].filter(function (m) { return Math.abs(f[0] * m) <= 12 && Math.abs(f[1] * m) <= 12 && (m > 1 || r.chance(0.5)); }), mult = mults.length ? r.pick(mults) : 1, run = f[1] * mult, rise = f[0] * mult;
            var A = [r.int(Math.max(-8, -8 - run), Math.min(8, 8 - run)), r.int(Math.max(-8, -8 - rise), Math.min(8, 8 - rise))], Bp = [A[0] + run, A[1] + rise];
            return { n: names[i], A: A, B: Bp, s: red(f[0], f[1]), k: k };
          });
          return { segs: segs };
        },
        parts: [
          { id: 'e3a', sub: 'a', level: 'BEG', make: function (r, sh) {
            return B.fields('(a) Calculate all four slopes.', sh.segs.map(function (s) { return { label: t('m_{' + s.n + '}'), name: s.n, mode: 'math', keys: 'slope' }; }), sh.segs.map(function (s) { return K.slope(s.s); }), sh.segs.map(function (s) { return slT(s.s); }),
              sh.segs.map(function (s) { return t('m_{' + s.n + '}=' + slT(s.s)); }).join(', '), sh.segs.map(function (s) { return t('m_{' + s.n + '}=' + formulaT(s.A, s.B) + '=' + fracSteps(s.B[1] - s.A[1], s.B[0] - s.A[0])); }).join('<br>'), ['Use ' + t('m=\\frac{y_2-y_1}{x_2-x_1}') + ' for each segment.'], 'four slopes from endpoints');
          } },
          { id: 'e3b', sub: 'b', level: 'EMG', make: function (r, sh) {
            var sorted = sh.segs.slice().sort(function (a, b) { return Math.abs(sval(a.s)) - Math.abs(sval(b.s)); });
            var p = B.order(r, '(b) List the four segments in order from <b>least steep</b> to <b>steepest</b>.', sorted.map(function (s) { return { id: s.n, tex: s.n }; }), { first: 'least steep', last: 'steepest', why: function (a, b) { var A = sh.segs.filter(function (s) { return s.n === a; })[0], Bq = sh.segs.filter(function (s) { return s.n === b; })[0]; return t(a) + ' and ' + t(b) + ' are in the wrong order: compare the sizes ' + t('|' + slT(A.s) + '|') + ' and ' + t('|' + slT(Bq.s) + '|') + ' — ignore the signs.'; } },
              'Compare the sizes ' + t('|m|') + ': ' + sorted.map(function (s) { return t('|m_{' + s.n + '}|=' + dec(Math.abs(sval(s.s)), 2)); }).join(', ') + '. Least steep to steepest: ' + t(sorted.map(function (s) { return s.n; }).join(',\\ ')) + '.', ['Steepness is the size of the slope, ' + t('|m|') + ', not its sign.'], 'order by steepness');
            return p;
          } },
          { id: 'e3c', sub: 'c', level: 'BEG', make: function (r, sh) {
            var byNum = sh.segs.slice().sort(function (a, b) { return sval(a.s) - sval(b.s); }), top = byNum[3], steep = sh.segs.slice().sort(function (a, b) { return Math.abs(sval(b.s)) - Math.abs(sval(a.s)); })[0];
            return B.mc(r, '(c) Which segment has the <b>greatest</b> slope as a number?', sh.segs.map(function (s) { return { html: t(s.n), right: s === top, why: s === steep ? t(s.n) + ' is the steepest, but its slope is negative — as a number it is the least.' : 'Compare the signed values: ' + t(byNum.map(function (x) { return slT(x.s); }).join('<')) + '.' }; }),
              'Signed values: ' + t(byNum.map(function (x) { return slT(x.s); }).join('<')) + '. The greatest is ' + t(top.n) + ' with ' + t('m=' + slT(top.s)) + '.', ['Every positive number is greater than every negative number.'], 'greatest slope as number');
          } },
          { id: 'e3d', sub: 'd', level: 'BEG', make: function (r, sh) {
            var byNum = sh.segs.slice().sort(function (a, b) { return sval(a.s) - sval(b.s); }), low = byNum[0];
            return B.mc(r, '(d) Which segment has the <b>least</b> slope as a number?', sh.segs.map(function (s) { return { html: t(s.n), right: s === low, why: Math.abs(sval(s.s)) < Math.abs(sval(low.s)) && sval(s.s) < 0 ? 'Among negative numbers, the one furthest from zero is the least: ' + t(slT(low.s) + '<' + slT(s.s)) + '.' : 'Compare the signed values: ' + t(byNum.map(function (x) { return slT(x.s); }).join('<')) + '.' }; }),
              'From the same ordering, ' + t(byNum.map(function (x) { return slT(x.s); }).join('<')) + ', the least is ' + t(low.n) + ' with ' + t('m=' + slT(low.s)) + '.', ['On a number line, which slope is furthest left?'], 'least slope as number');
          } },
          { id: 'e3e', sub: 'e', level: 'EMG', make: function (r, sh) {
            return B.mc(r, '(e) The segment with the greatest slope is not the steepest one. Why are “greatest slope” and “steepest” different questions once negatives are involved?', [
              { html: '“Greatest” compares the signed numbers, so every negative slope loses to every positive one; “steepest” compares the sizes ' + t('|m|') + ', ignoring the sign.', right: true },
              { html: 'They are the same question; the answers differ only because of a calculation error.', why: 'Look at your answers to (b) and (c): the steepest segment has a negative slope, so as a number it is small.' },
              { html: '“Steepest” means the slope closest to zero.', why: 'A slope close to zero is nearly flat — the <b>least</b> steep.' },
              { html: 'Negative slopes are never steep.', why: 'A slope of ' + t('-5') + ' falls steeply — steeper than a slope of ' + t('2') + '.' }],
              '“Greatest” uses signed values: a negative slope is less than any positive one. “Steepest” uses ' + t('|m|') + ': a slope of ' + t('-\\frac{5}{2}') + ' is steeper than ' + t('\\frac{3}{2}') + ' because ' + t('\\frac{5}{2}>\\frac{3}{2}') + '.', ['Think about a slope of ' + t('-10') + ': is it great as a number? Is it steep?'], 'greatest vs steepest');
          } }] },
      { num: '4', section: 'Extra practice B — Slope from coordinates', stem: 'Calculate the slope of the segment joining each pair of points. Reduce every fraction to lowest terms.', parts: [
        { id: 'e4a', level: 'BEG', make: function (r) { for (var g = 0; g < 100; g++) { var f = r.pick([[-1, 2], [-2, 3], [-3, 4], [-1, 3], [-2, 5]]), k = r.pick([2, 3, 4]), A = [r.int(-8, -2), r.int(-3, 6)], Bp = [A[0] + f[1] * k, A[1] + f[0] * k]; if (Math.abs(Bp[0]) <= 9 && Math.abs(Bp[1]) <= 9) break; } return coordSlopePart('(a) ' + t('A' + ptT(A)) + ', ' + t('B' + ptT(Bp)), A, Bp, 'A', 'B'); } },
        { id: 'e4b', level: 'BEG', make: function (r) { for (var g = 0; g < 100; g++) { var f = r.pick([[3, 4], [2, 3], [1, 2], [3, 5], [1, 4]]), k = r.pick([2, 3]), A = [r.int(1, 6), r.int(-8, -2)], Bp = [A[0] - f[1] * k, A[1] + f[0] * k]; if (Math.abs(Bp[0]) <= 9 && Math.abs(Bp[1]) <= 9) break; } return coordSlopePart('(b) ' + t('C' + ptT(A)) + ', ' + t('D' + ptT(Bp)), A, Bp, 'C', 'D'); } },
        { id: 'e4c', level: 'BEG', make: function (r) { for (var g = 0; g < 100; g++) { var f = r.pick([[12, 5], [7, 3], [9, 4], [11, 5], [8, 3], [10, 7]]), A = [r.int(-7, -3), r.int(-6, -3)], Bp = [A[0] + f[1], A[1] + f[0]]; if (Math.abs(Bp[0]) <= 9 && Math.abs(Bp[1]) <= 9) break; } return coordSlopePart('(c) ' + t('E' + ptT(A)) + ', ' + t('F' + ptT(Bp)), A, Bp, 'E', 'F'); } },
        { id: 'e4d', level: 'EMG', make: function (r) { var a = r.pick([1, 3, -1, 5]), run = -r.pick([3, 2, 4, 5]), rise = r.pick([7, 5, 4, 2, 9]); if (gcd(rise, run) > 1 && r.chance(0.7)) rise += 1; var A = [a / 2, -r.int(1, 5)], Bp = [a / 2 + run, A[1] + rise]; return coordSlopePart('(d) ' + t('G' + ptT(A)) + ', ' + t('H' + ptT(Bp)), A, Bp, 'G', 'H'); } },
        { id: 'e4e', level: 'BEG', make: function (r) { var y = r.int(-6, 6), A = [r.int(-9, -2), y], Bp = [r.int(2, 9), y]; return coordSlopePart('(e) ' + t('J' + ptT(A)) + ', ' + t('K' + ptT(Bp)), A, Bp, 'J', 'K'); } },
        { id: 'e4f', level: 'BEG', make: function (r) { var x = r.int(-6, 6), A = [x, r.int(-8, -2)], Bp = [x, r.int(2, 8)]; return coordSlopePart('(f) ' + t('L' + ptT(A)) + ', ' + t('M' + ptT(Bp)), A, Bp, 'L', 'M'); } },
        { id: 'e4g', level: 'EMG', make: function (r) {
          return B.mc(r, '(g) Some of the slopes came out negative. If you subtract the coordinates in the <b>opposite</b> order (first point minus second), what happens to the slope?', [
            { html: 'It stays the same: reversing the order changes the sign of <b>both</b> the rise and the run, and the two sign changes cancel.', right: true },
            { html: 'It changes sign, because the rise becomes negative.', why: 'The run changes sign too: ' + t('\\frac{-a}{-b}=\\frac{a}{b}') + '.' },
            { html: 'It becomes the reciprocal.', why: 'The rise is still on top — only the order of subtraction changed.' },
            { html: 'It depends on which point is on the left.', why: 'Try it: ' + t('\\frac{4-1}{6-2}') + ' and ' + t('\\frac{1-4}{2-6}') + ' are both ' + t('\\frac{3}{4}') + '.' }],
            'Reversing the order negates both the numerator and the denominator: ' + t('\\frac{y_1-y_2}{x_1-x_2}=\\frac{-(y_2-y_1)}{-(x_2-x_1)}=\\frac{y_2-y_1}{x_2-x_1}') + '. Just use the <b>same</b> order on top and bottom.', ['Try it with one of your pairs of points.'], 'order of subtraction');
        } }] },
      { num: '5', stem: 'For each pair of points, state whether the slope is ' + t('0') + ' or <b>undefined</b>, and write the value of the denominator ' + t('x_2-x_1') + ' (use the first point as ' + t('(x_1,\\ y_1)') + ').', parts: ['a', 'b', 'c', 'd', 'e', 'f'].map(function (L) {
        return { id: 'e5' + L, level: 'BEG', make: function (r) {
          var horiz = L === 'a' || L === 'd' || L === 'e', A, Bp;
          if (L === 'a') { var y = r.int(-7, 7); A = [r.int(2, 6), y]; Bp = [r.int(-9, -2), y]; }
          if (L === 'b') { var x = r.int(2, 8); A = [x, r.int(1, 5)]; Bp = [x, r.int(-11, -2)]; }
          if (L === 'c') { A = [0, r.int(-6, -1)]; Bp = [0, r.int(2, 9)]; }
          if (L === 'd') { A = [r.int(-9, -2), 0]; Bp = [r.int(1, 7), 0]; }
          if (L === 'e') { var yd = r.pick([2.5, -1.5, 3.5, -4.5, 0.5]); A = [r.int(-7, -2), yd]; Bp = [r.int(4, 12), yd]; }
          if (L === 'f') { var xd = r.pick([-1.5, 2.5, -3.5, 0.5]); A = [xd, r.int(-6, -2)]; Bp = [xd, r.int(3, 8)]; }
          var den = cl(Bp[0] - A[0]), sl = slopeOf(A, Bp), sc = K.slope(sl);
          var ptsTx = function (p) { return '(' + String(cl(p[0])) + ',\\ ' + String(cl(p[1])) + ')'; };
          return B.fields('(' + L + ') ' + t(ptsTx(A)) + ' and ' + t(ptsTx(Bp)), [{ label: 'Slope', name: 'Slope', mode: 'math', keys: 'slope', placeholder: '0 or undefined' }, { label: t('x_2-x_1'), name: 'Denominator' }],
            [sc, function (resp) { var p = HW.parse.number(resp); if (!p.ok) return form('empty', 'Write the value of ' + t('x_2-x_1') + '.'); if (near(p.value, den)) return ok(); if (den !== 0 && near(p.value, -den)) return form('den-order', 'That’s ' + t('x_1-x_2') + '. Use the first point as ' + t('(x_1,\\ y_1)') + ': ' + t('x_2-x_1=' + subD(Bp[0], A[0])) + '.'); return wrong('value', 'Subtract the ' + t('x') + '-coordinates: ' + t(subD(Bp[0], A[0])) + '.'); }],
            [slT(sl), String(den)], 'slope ' + t(slT(sl)) + '; ' + t('x_2-x_1=' + den),
            t('\\frac{' + subD(Bp[1], A[1]) + '}{' + subD(Bp[0], A[0]) + '}=\\frac{' + cl(Bp[1] - A[1]) + '}{' + den + '}') + (horiz ? ': the numerator is ' + t('0') + ' and the denominator isn’t, so the slope is ' + t('0') + ' (horizontal).' : ': the denominator is ' + t('0') + ', so the slope is <b>undefined</b> (vertical).'),
            ['Which coordinates are the same in the two points?', 'Slope ' + t('0') + ': the top is ' + t('0') + '. Undefined: the bottom is ' + t('0') + '.'], 'zero or undefined ' + ptsTx(A) + ptsTx(Bp));
        } };
      }).concat([
        { id: 'e5g', sub: 'g', level: 'LIM', make: function (r) {
          return B.mc(r, '(g) Complete the sentence: “A slope of ' + t('0') + ' happens when ____, and an undefined slope happens when ____.”', [
            { html: '…the <b>numerator</b> is ' + t('0') + ' … the <b>denominator</b> is ' + t('0') + '.', right: true },
            { html: '…the <b>denominator</b> is ' + t('0') + ' … the <b>numerator</b> is ' + t('0') + '.', why: 'Swapped. A slope of ' + t('0') + ' is ' + t('\\frac{0}{\\text{run}}') + '; an undefined slope is ' + t('\\frac{\\text{rise}}{0}') + '.' },
            { html: '…both are ' + t('0') + ' … neither is ' + t('0') + '.', why: 'If both were ' + t('0') + ' the two points would be the same point. A slope of ' + t('0') + ' has a zero rise and a non-zero run.' },
            { html: '…the run is ' + t('0') + ' … the rise is ' + t('0') + '.', why: 'Swapped: a zero <b>run</b> (vertical) is the undefined one.' }],
            'Slope ' + t('0') + ': ' + t('\\frac{0}{\\text{run}}=0') + ' — the numerator is ' + t('0') + '. Undefined: ' + t('\\frac{\\text{rise}}{0}') + ' — the denominator is ' + t('0') + '.', ['Slope = numerator over denominator = rise over run.'], 'zero vs undefined sentence');
        } },
        { id: 'e5h', sub: 'g · why', level: 'EMG', make: function (r) {
          var n = r.int(3, 9);
          return B.mc(r, 'Why is ' + t('\\frac{0}{' + n + '}') + ' a perfectly good number, but ' + t('\\frac{' + n + '}{0}') + ' is not?', [
            { html: t('\\frac{0}{' + n + '}=0') + ' because ' + t('0\\times ' + n + '=0') + '; but ' + t('\\frac{' + n + '}{0}') + ' would need a number that gives ' + t(n) + ' when multiplied by ' + t('0') + ' — and there isn’t one.', right: true },
            { html: 'Both are ' + t('0') + ', because anything with a ' + t('0') + ' in it is ' + t('0') + '.', why: 'Check ' + t('\\frac{' + n + '}{0}=0') + ' by multiplying back: ' + t('0\\times 0=0') + ', not ' + t(n) + '.' },
            { html: t('\\frac{' + n + '}{0}=' + n) + ', since dividing by nothing leaves the number unchanged.', why: 'Dividing by ' + t('1') + ' leaves a number unchanged. Check: ' + t(n + '\\times 0=0') + ', not ' + t(n) + '.' },
            { html: t('\\frac{0}{' + n + '}') + ' is undefined too; only ' + t('\\frac{0}{0}') + ' is a number.', why: t('\\frac{0}{' + n + '}=0') + ': ' + t(n) + ' groups of nothing is nothing.' }],
            t('\\frac{0}{' + n + '}=0') + ' because ' + t('0\\times ' + n + '=0') + '. ' + t('\\frac{' + n + '}{0}') + ' would need a number ' + t('k') + ' with ' + t('k\\times 0=' + n) + ', but every number times ' + t('0') + ' is ' + t('0') + '. So a vertical segment’s slope is <b>undefined</b>, not ' + t('0') + '.', ['Check a division by multiplying back.'], 'why n/0 undefined');
        } }]) },
      { num: '6', stem: function (sh) { return 'A line passes through the point ' + t(ptT(sh.P)) + '.'; },
        shared: function (r) { return { P: r.chance(0.25) ? [5, -2] : [r.pick([-6, -5, -4, -3, -2, 2, 3, 4, 5, 6]), r.pick([-6, -5, -4, -3, -2, 2, 3, 4, 5, 6])] }; },
        parts: [
          { id: 'e6a', level: 'BEG', make: function (r, sh) { var P = sh.P, k = [P[0] + r.pick([3, 4, 6, -3, -5]), P[1]]; var p = ptsPart('(a) Give a second point so that the slope is ' + t('0') + '.', { n: 1, exclude: [P], test: onLineTest(P, [0, 1]) }, [k], 'Slope ' + t('0') + ' needs a rise of ' + t('0') + ': keep ' + t('y=' + P[1]) + ', e.g. ' + t(ptT(k)) + '.', ['Which coordinate must stay the same for the rise to be 0?'], 'point slope 0 from ' + ptT(P)); p.bad = [ptT([P[0], P[1] + 3])]; return p; } },
          { id: 'e6b', level: 'BEG', make: function (r, sh) { var P = sh.P, k = [P[0], P[1] + r.pick([3, 4, 6, -3, -5])]; var p = ptsPart('(b) Give a second point so that the slope is undefined.', { n: 1, exclude: [P], test: onLineTest(P, [1, 0]) }, [k], 'An undefined slope needs a run of ' + t('0') + ': keep ' + t('x=' + P[0]) + ', e.g. ' + t(ptT(k)) + '.', ['Which coordinate must stay the same for the run to be 0?'], 'point undefined slope from ' + ptT(P)); p.bad = [ptT([P[0] + 3, P[1]])]; return p; } },
          { id: 'e6c', level: 'EMG', make: function (r, sh) {
            var P = sh.P;
            return B.mc(r, '(c) Which describes <b>every</b> second point that makes the slope ' + t('0') + ', and every second point that makes the slope undefined?', [
              { html: 'Slope ' + t('0') + ': every point ' + t('(a,\\ ' + P[1] + ')') + ' with ' + t('a\\ne ' + P[0]) + ' — the horizontal line ' + t('y=' + P[1]) + '; undefined: every point ' + t('(' + P[0] + ',\\ b)') + ' with ' + t('b\\ne ' + P[1]) + ' — the vertical line ' + t('x=' + P[0]) + '.', right: true },
              { html: 'Slope ' + t('0') + ': the vertical line ' + t('x=' + P[0]) + '; undefined: the horizontal line ' + t('y=' + P[1]) + '.', why: 'Swapped: slope ' + t('0') + ' is horizontal (same ' + t('y') + '), undefined is vertical (same ' + t('x') + ').' },
              { html: 'Slope ' + t('0') + ': only ' + t('(' + (P[0] + 1) + ',\\ ' + P[1] + ')') + '; undefined: only ' + t('(' + P[0] + ',\\ ' + (P[1] + 1) + ')') + '.', why: 'Any distance along works, not just one step: ' + t('\\frac{0}{7}') + ' is still ' + t('0') + '.' },
              { html: 'Slope ' + t('0') + ': every point on the ' + t('x') + '-axis; undefined: every point on the ' + t('y') + '-axis.', why: 'The points have to line up with ' + t(ptT(P)) + ', which ' + (P[1] === 0 && P[0] === 0 ? 'here is the origin — but that is a coincidence' : 'is not on the axes') + '.' }],
              'Slope ' + t('0') + ': the rise must be ' + t('0') + ': every point with ' + t('y=' + P[1]) + ' (except ' + t(ptT(P)) + ' itself). Undefined: the run must be ' + t('0') + ': every point with ' + t('x=' + P[0]) + ' (except ' + t(ptT(P)) + ').', ['Think of all the points you could choose, not just one.'], 'all points slope 0 / undefined');
          } },
          { id: 'e6d', level: 'EMG', make: function (r) {
            return B.mc(r, '(d) Why can no single line have both a slope of ' + t('0') + ' and an undefined slope?', [
              { html: 'Slope ' + t('0') + ' needs a run that is <b>not</b> ' + t('0') + ' (horizontal); undefined needs a run that <b>is</b> ' + t('0') + ' (vertical). A line has only one slope.', right: true },
              { html: 'It can: a line through the origin has both.', why: 'The ' + t('x') + '-axis has slope ' + t('0') + ' and the ' + t('y') + '-axis is undefined — they are two different lines.' },
              { html: 'Because ' + t('0') + ' and undefined are the same thing.', why: 'Slope ' + t('0') + ' is flat; undefined is vertical — opposite extremes.' },
              { html: 'Because a slope must always be positive or negative.', why: 'Horizontal lines really do have slope ' + t('0') + ' — it is neither positive nor negative.' }],
              'Slope ' + t('0') + ' means ' + t('\\frac{0}{\\text{run}}') + ' with run ' + t('\\ne 0') + ' (horizontal); undefined means run ' + t('=0') + ' (vertical). The run can’t be both zero and non-zero, so a line can’t be both.', ['What does each one say about the run?'], 'not both 0 and undefined');
          } }] },
      { num: '7', section: 'Extra practice C — Running the formula backwards', stem: 'Draw the line through the given point with the given slope, long enough to reach the edges of the grid. Then list three other points on your line that have integer coordinates.',
        shared: function (r) { return { a: cfg(r, [[5, 2], [3, 2], [4, 3], [5, 3], [7, 3]], [-5, -2], [-5, -2], [[5, 2], [-4, -3]]), b: cfg(r, [[-3, 4], [-2, 3], [-3, 5], [-1, 3], [-2, 5]], [2, 5], [1, 4], [[-3, 4], [4, 2]]) }; },
        parts: [
          { id: 'e7a', sub: 'a · line', level: 'EMG', make: function (r, sh) { return q4Draw(sh.a, 'a'); } },
          { id: 'e7ap', sub: 'a · points', level: 'BEG', make: function (r, sh) { return q4Pts(sh.a, 'a'); } },
          { id: 'e7b', sub: 'b · line', level: 'EMG', make: function (r, sh) { return q4Draw(sh.b, 'b'); } },
          { id: 'e7bp', sub: 'b · points', level: 'BEG', make: function (r, sh) { return q4Pts(sh.b, 'b'); } },
          { id: 'e7c', sub: 'c', level: 'EMG', make: function (r, sh) {
            var c = sh.a, sl = c.sl, P0 = c.P0;
            return B.mc(r, '(c) Two students each list three integer points on the line through ' + t(ptT(P0)) + ' with slope ' + t(frT(sl[0], sl[1])) + '. Their lists are probably different, yet both can be right. What do all the correct answers have in common?', [
              { html: 'Each is reached from ' + t(ptT(P0)) + ' by moving <b>the same multiple of the rise and the run</b>: ' + t('(' + nT(P0[0]) + '+' + sl[1] + 'k,\\ ' + nT(P0[1]) + '+' + sl[0] + 'k)') + ' for a whole number ' + t('k') + ', so ' + t('\\frac{' + sl[0] + 'k}{' + sl[1] + 'k}=' + frT(sl[0], sl[1])) + ' every time.', right: true },
              { html: 'They all have the same ' + t('x') + '-coordinate.', why: 'Points with the same ' + t('x') + '-coordinate are on a vertical line.' },
              { html: 'Each is exactly one rise and one run from ' + t(ptT(P0)) + '.', why: 'Two or three steps (or steps backwards) land on the line too.' },
              { html: 'They are the points where the line crosses grid lines.', why: 'A line crosses grid lines at many non-integer points too. The integer points come from whole steps of the rise and run.' }],
              'Every correct point is ' + t('(' + nT(P0[0]) + '+' + sl[1] + 'k,\\ ' + nT(P0[1]) + '+' + sl[0] + 'k)') + ' for some whole number ' + t('k') + ' (positive or negative). Different ' + t('k') + ' give different points, but the slope from ' + t(ptT(P0)) + ' is always ' + t(frT(sl[0], sl[1])) + ', so they all lie on the one line.', ['Write down how you got from the given point to each of your points.'], 'same multiple of rise and run');
          } }] },
      { num: '8', stem: 'In each case the slope of the segment is given. Determine the missing coordinate.', parts: [
        { id: 'e8a', level: 'PRG', make: function (r) {
          var useB = r.chance(0.25), f = useB ? [-2, 3] : r.pick([[-2, 3], [-3, 4], [-1, 2], [-3, 5], [2, 3], [-4, 3]]), k = useB ? 3 : r.int(-5, 6), x1 = useB ? 3 : r.int(-4, 4), run = f[1] * (useB ? 2 : r.pick([1, 2])), x2 = x1 + run, y2 = k + f[0] * run / f[1];
          return B.number('(a) ' + t('A(' + x1 + ',\\ k)') + ', ' + t('B' + ptT([x2, y2])) + ', ' + t('m=' + frT(f[0], f[1])), k, function (v) {
            if (near(v, y2 + f[0] * run / f[1])) return { code: 'k-sign', hint: 'Check your signs: substitute ' + t('k=' + nT(v)) + ' back into ' + t('m=\\frac{y_2-y_1}{x_2-x_1}') + ' — do you get ' + t(frT(f[0], f[1])) + '?' };
            if (near(v, y2 - f[1] * run / f[0])) return { code: 'k-flip', hint: 'Slope is the change in ' + t('y') + ' over the change in ' + t('x') + '.' };
            return null;
          }, t('\\frac{' + nT(y2) + '-k}{' + subT(x2, x1) + '}=' + frT(f[0], f[1])) + ', so ' + t(nT(y2) + '-k=' + frT(f[0], f[1]) + '\\times ' + run + '=' + (f[0] * run / f[1])) + ' and ' + t('k=' + k) + '. Check: ' + t(formulaT([x1, k], [x2, y2]) + '=' + fracSteps(y2 - k, run)) + ' ✓', ['Substitute into ' + t('m=\\frac{y_2-y_1}{x_2-x_1}') + ' and solve for ' + t('k') + '.', 'Work out the run first; then rise = slope × run.'], 'missing y with slope', { before: t('k=') });
        } },
        { id: 'e8b', level: 'PRG', make: function (r) {
          var useB = r.chance(0.25), f = useB ? [3, 4] : r.pick([[3, 4], [2, 3], [3, 2], [-2, 5], [4, 3], [-3, 4]]), P = useB ? [-5, 4] : [r.int(-6, 4), r.int(-3, 6)], rise = f[0] * (useB ? -2 : r.pick([-2, 2, -1, 3])), run = rise * f[1] / f[0], tt = P[0] + run, y2 = P[1] + rise;
          return B.number('(b) ' + t('P' + ptT(P)) + ', ' + t('Q(t,\\ ' + y2 + ')') + ', ' + t('m=' + frT(f[0], f[1])), tt, function (v) {
            if (near(v, P[0] - run)) return { code: 'k-sign', hint: 'Check the sign of the run: substitute ' + t('t=' + nT(v)) + ' back into the slope formula.' };
            if (near(v, P[0] + rise * f[0] / f[1])) return { code: 'calc-mult', hint: 'The run is rise <b>÷</b> slope, not rise × slope.' };
            return null;
          }, t('\\frac{' + subT(y2, P[1]) + '}{t-' + (P[0] < 0 ? '(' + P[0] + ')' : P[0]) + '}=' + frT(f[0], f[1])) + ': the rise is ' + t(rise) + ', so the run is ' + t('\\frac{' + rise + '}{' + frT(f[0], f[1]) + '}=' + run) + ' and ' + t('t=' + nT(P[0]) + (run < 0 ? '' : '+') + run + '=' + tt) + '. Check: ' + t(formulaT(P, [tt, y2]) + '=' + fracSteps(rise, run)) + ' ✓', ['Find the rise first, then run = rise ÷ slope.'], 'missing x2 with slope', { before: t('t=') });
        } },
        { id: 'e8c', level: 'PRG', make: function (r) {
          var useB = r.chance(0.25), m = useB ? -4 : r.pick([-4, -3, 3, -2, 2, 4]), D = useB ? [2, 5] : [r.int(-4, 4), r.int(-2, 7)], run = useB ? -3 : r.pick([-3, -2, 2, 3]), w = D[0] - run, y1 = D[1] - m * run;
          return B.number('(c) ' + t('C(w,\\ ' + y1 + ')') + ', ' + t('D' + ptT(D)) + ', ' + t('m=' + m), w, function (v) {
            if (near(v, D[0] + run)) return { code: 'k-sign', hint: 'Check the signs: substitute ' + t('w=' + nT(v)) + ' back into ' + t('\\frac{y_2-y_1}{x_2-x_1}') + ' — do you get ' + t(m) + '?' };
            return null;
          }, t('\\frac{' + subT(D[1], y1) + '}{' + D[0] + '-w}=' + m) + ', so ' + t((D[1] - y1) + '=' + m + '(' + D[0] + '-w)') + ', ' + t(D[0] + '-w=' + run) + ', and ' + t('w=' + w) + '. Check: ' + t(formulaT([w, y1], D) + '=' + fracSteps(D[1] - y1, D[0] - w)) + ' ✓', ['Write the slope formula with ' + t('w') + ' in it, then solve.'], 'missing x1 with slope', { before: t('w=') });
        } },
        { id: 'e8d', level: 'EMG', make: function (r) {
          var x = r.int(-7, 7), y = r.pick([-9, -8, -7, -6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7, 8, 9]);   // y = 0 would duplicate the “only h = 0” option
          return B.mc(r, '(d) ' + t('E(' + x + ',\\ h)') + ', ' + t('F' + ptT([x, y])) + ', slope undefined. What can ' + t('h') + ' be?', [
            { html: 'Any value except ' + t(y), right: true }, { html: 'Only ' + t('h=' + y), why: 'Then ' + t('E') + ' and ' + t('F') + ' would be the same point — no segment at all.' },
            { html: 'Only ' + t('h=0'), why: 'The run is ' + t(x + '-' + (x < 0 ? '(' + x + ')' : x) + '=0') + ' already, whatever ' + t('h') + ' is.' }, { html: 'No value — an undefined slope is impossible.', why: 'Vertical segments have undefined slopes, and both points already have ' + t('x=' + x) + '.' }],
            'Undefined means the run is ' + t('0') + ': ' + t('x_2-x_1=0') + ' already, for every ' + t('h') + '. So ' + t('h') + ' can be any value except ' + t(y) + ' (that would make ' + t('E') + ' and ' + t('F') + ' the same point).', ['What makes a slope undefined? Is that already true here?'], 'undefined slope missing y');
        } },
        { id: 'e8e', level: 'BEG', make: function (r) {
          var G = [r.int(-6, 0), 0], H = [r.int(2, 8), r.int(-6, 6)];
          return B.number('(e) ' + t('G(' + G[0] + ',\\ y)') + ', ' + t('H' + ptT(H)) + ', ' + t('m=0'), H[1], function (v) { if (near(v, 0)) return { code: 'value', hint: 'A slope of ' + t('0') + ' means the <b>rise</b> is ' + t('0') + ' — not that ' + t('y') + ' is ' + t('0') + '.' }; return null; },
            t('\\frac{' + H[1] + '-y}{' + subT(H[0], G[0]) + '}=0') + ', so ' + t(H[1] + '-y=0') + ' and ' + t('y=' + H[1]) + ': a horizontal segment.', ['Slope 0: the two points are at the same height.'], 'missing y slope 0', { before: t('y=') });
        } },
        { id: 'e8f', level: 'EMG', make: function (r) {
          var x = r.int(-7, 7), y = r.pick([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]), G0 = r.int(-6, 0), H = [r.int(2, 8), r.int(-6, 6)];
          var cE = t('E(' + x + ',\\ h)') + ', ' + t('F' + ptT([x, y])) + ' with an undefined slope', cG = t('G(' + G0 + ',\\ y)') + ', ' + t('H' + ptT(H)) + ' with ' + t('m=0');
          return B.mc(r, '(f) A missing coordinate found from a slope usually has exactly one value. Two special cases behave differently: ' + cE + ', and ' + cG + '. One of them has exactly one answer, the other infinitely many. Which is which, and why?', [
            { html: 'The slope-' + t('0') + ' case (' + t('G, H') + ') has one answer: slope ' + t('0') + ' forces the <b>numerator</b> to be ' + t('0') + '. The undefined case (' + t('E, F') + ') has infinitely many: undefined is a condition on the <b>denominator</b>, which the given ' + t('x') + '-coordinates already meet.', right: true },
            { html: 'The undefined case (' + t('E, F') + ') has one answer and the slope-' + t('0') + ' case (' + t('G, H') + ') infinitely many.', why: 'For ' + t('G, H') + ', only one ' + t('y') + ' makes the rise ' + t('0') + '. For ' + t('E, F') + ', ' + t('h') + ' never enters the run.' },
            { html: 'Both have infinitely many answers, because ' + t('0') + ' and undefined are special.', why: 'For ' + t('G, H') + ' the rise ' + t(H[1] + '-y') + ' is ' + t('0') + ' for only one value of ' + t('y') + '.' },
            { html: 'Both have exactly one answer.', why: 'For ' + t('E, F') + ', try ' + t('h=' + (y + 1)) + ' and ' + t('h=' + (y + 2)) + ': both segments are vertical.' }],
            t('G, H') + ': ' + t('m=0') + ' means the numerator ' + t(H[1] + '-y=0') + ', and only ' + t('y=' + H[1]) + ' does that. ' + t('E, F') + ': undefined means the denominator ' + t('x_2-x_1=0') + ' — already true, and ' + t('h') + ' doesn’t appear in it, so every ' + t('h') + ' except ' + t(y) + ' (which repeats the point) works.', ['Where does the unknown appear in each slope fraction — top or bottom?'], 'one vs infinitely many');
        } }] },
      { num: '9', stem: 'Use ' + t('m=\\frac{\\text{rise}}{\\text{run}}') + ' in reverse.', parts: [
        { id: 'e9a', level: 'PRG', make: function (r) {
          var useB = r.chance(0.25), S = useB ? [-2, 5] : [r.pick([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4]), r.int(-4, 8)], f = useB ? [-3, 8] : r.pick([[-3, 8], [-2, 5], [3, 4], [-5, 6], [2, 7], [-3, 4]]), run = useB ? 24 : f[1] * r.pick([2, 3, 4]), rise = f[0] * run / f[1], E = [S[0] + run, S[1] + rise];
          var test = function (p) { if (same(p, E)) return null; if (same(p, [S[0] + run, S[1] - rise])) return { code: 'end-sign', hint: 'Check the sign of the rise: ' + t('\\text{rise}=' + frT(f[0], f[1]) + '\\times ' + run + '=' + rise) + '.' }; if (same(p, [S[0] + rise, S[1] + run])) return { code: 'end-swap', hint: 'Add the run to ' + t('x') + ' and the rise to ' + t('y') + '.' }; if (same(p, [run, rise])) return { code: 'end-nostart', hint: 'Those are the run and rise. Add them to the starting point ' + t(ptT(S)) + '.' }; return same(p, E) ? null : { code: 'pts-off', hint: 'Find the rise first (rise = slope × run), then add the run and rise to ' + t(ptT(S)) + '.' }; };
          var p = ptsPart('(a) A segment starts at ' + t(ptT(S)) + ', has slope ' + t(frT(f[0], f[1])) + ' and a run of ' + t(run) + '. Determine the other endpoint.', { n: 1, test: test }, [E],
            t('\\text{rise}=m\\times\\text{run}=' + frT(f[0], f[1]) + '\\times ' + run + '=' + rise) + '. Endpoint: ' + t('(' + nT(S[0]) + '+' + run + ',\\ ' + nT(S[1]) + (rise < 0 ? '' : '+') + rise + ')=' + ptT(E)) + '. Check: ' + t(formulaT(S, E) + '=' + fracSteps(rise, run)) + ' ✓', ['rise = slope × run. Then add to the starting coordinates.'], 'endpoint from run');
          p.bad = [ptT([S[0] + run, S[1] - rise]), ptT([run, rise])]; return p;
        } },
        { id: 'e9b', level: 'PRG', make: function (r) {
          var useB = r.chance(0.25), S = useB ? [7, -2] : [r.pick([-3, -2, -1, 1, 2, 3, 4, 5, 6, 7, 8]), r.int(-5, 5)], f = useB ? [5, 6] : r.pick([[5, 6], [3, 4], [2, 5], [4, 3], [3, 7]]), rise = useB ? -15 : -f[0] * r.pick([2, 3]), run = rise * f[1] / f[0], E = [S[0] + run, S[1] + rise];
          var test = function (p) { if (same(p, E)) return null; if (same(p, [S[0] - run, S[1] + rise])) return { code: 'end-sign', hint: 'A positive slope with a negative rise needs a <b>negative</b> run: ' + t('\\text{run}=\\frac{' + rise + '}{' + frT(f[0], f[1]) + '}=' + run) + '.' }; if (same(p, [S[0] + rise, S[1] + run])) return { code: 'end-swap', hint: 'Add the run to ' + t('x') + ' and the rise to ' + t('y') + '.' }; if (same(p, [run, rise])) return { code: 'end-nostart', hint: 'Those are the run and rise. Add them to ' + t(ptT(S)) + '.' }; return same(p, E) ? null : { code: 'pts-off', hint: 'Find the run first (run = rise ÷ slope), then add the run and rise to ' + t(ptT(S)) + '.' }; };
          var p = ptsPart('(b) A segment starts at ' + t(ptT(S)) + ', has slope ' + t(frT(f[0], f[1])) + ' and a rise of ' + t(rise) + '. Determine the other endpoint.', { n: 1, test: test }, [E],
            t('\\text{run}=\\frac{\\text{rise}}{m}=' + rise + '\\times ' + frT(f[1], f[0]) + '=' + run) + '. Endpoint: ' + t('(' + nT(S[0]) + run + ',\\ ' + nT(S[1]) + rise + ')=' + ptT(E)) + '. Check: ' + t(rawFr(rise, run) + '=' + frT(f[0], f[1])) + ' ✓', ['run = rise ÷ slope. A negative rise with a positive slope gives a negative run.'], 'endpoint from rise');
          p.bad = [ptT([S[0] - run, S[1] + rise])]; return p;
        } },
        { id: 'e9c', level: 'BEG', make: function (r) {
          var f = r.pick([[4, 9], [2, 5], [3, 7], [5, 8]]);
          return B.mc(r, '(c) A segment has slope ' + t(frT(f[0], f[1])) + ', and both its rise and its run are negative. In which direction does the second endpoint lie from the first?', [
            { html: 'Down and to the left', right: true }, { html: 'Up and to the right', why: 'That would be a positive rise and a positive run.' },
            { html: 'Down and to the right', why: 'A negative run moves <b>left</b>.' }, { html: 'Up and to the left', why: 'A negative rise moves <b>down</b>.' }],
            'A negative run moves left and a negative rise moves down. ' + t('\\frac{-' + f[0] + '}{-' + f[1] + '}=' + frT(f[0], f[1])) + ': the two negatives cancel, so the slope is still positive.', ['Rise: up is +, down is −. Run: right is +, left is −.'], 'direction with negative rise and run');
        } }] },
      { num: '10', section: 'Extra practice D — Slope as a rate, with units', stem: function (sh) { return 'A loading ramp rises ' + t(sh.rise) + ' m over a horizontal run of ' + t(sh.run) + ' m.'; },
        shared: function (r) { var useB = r.chance(0.25), f = useB ? [1, 8] : r.pick([[1, 8], [1, 5], [1, 4], [1, 10], [3, 20], [3, 8], [1, 20], [3, 10]]), u = useB ? 0.9 : r.pick([0.3, 0.4, 0.6, 0.7, 0.9, 0.8]); return { f: f, rise: cl(f[0] * u), run: cl(f[1] * u), run2: r.chance(0.3) ? 10 : r.pick([10, 12, 15, 6, 20]) }; },
        parts: [
          { id: 'e10a', level: 'BEG', make: function (r, sh) { return B.fraction('(a) Determine the slope of the ramp as a fraction in lowest terms.', sh.f, {}, t('m=\\frac{' + sh.rise + '}{' + sh.run + '}=\\frac{' + cl(sh.rise * 10) + '}{' + cl(sh.run * 10) + '}=' + frT(sh.f[0], sh.f[1])), ['Multiply the top and bottom by 10 to clear the decimals, then reduce.'], 'ramp slope fraction'); } },
          { id: 'e10b', level: 'EMG', make: function (r, sh) {
            var pct = cl(100 * sh.f[0] / sh.f[1]);
            return B.number('(b) Engineers write the slope as a percent <i>grade</i>. Express the slope as a percent.', pct, function (v) { if (near(v, cl(sh.f[0] / sh.f[1]))) return { code: 'pct-dec', hint: 'That’s the decimal. Multiply by ' + t('100') + ' to make it a percent.' }; return null; },
              t(frT(sh.f[0], sh.f[1]) + '=' + cl(sh.f[0] / sh.f[1]) + '=' + pct + '\\%') + ' grade.', ['Change the fraction to a decimal, then × 100.'], 'grade percent', { after: '%' });
          } },
          { id: 'e10c', level: 'BEG', make: function (r, sh) {
            var a = sh.f[0], b = sh.f[1];
            var chk = function (resp) {
              resp = resp || []; var p = HW.parse.number(resp[0] || ''), q = HW.parse.number(resp[1] || '');
              if (!p.ok || !q.ok) return form('empty', 'Fill in both boxes.');
              if (near(p.value * b, q.value * a) && p.value > 0) { if (near(p.value, a) && near(q.value, b)) return ok(); return form('lowest', 'Right rate — now use the numbers of your lowest-terms fraction from (a).'); }
              if (near(p.value * a, q.value * b)) return wrong('calc-flip', 'Upside down: the rise (up) goes first, the run (along) second.');
              return wrong('value', null);
            };
            var p = B.fields('(c) The slope is a rate. Complete: “___ metre(s) up per ___ metres along”.', [{ name: 'Rate', after: 'metre(s) up per' }, { name: 'Rate', after: 'metres along' }], [], [String(a), String(b)], t(a) + ' m up per ' + t(b) + ' m along',
              t(frT(a, b)) + ': ' + t(a) + ' m up per ' + t(b) + ' m along (the same rate as ' + t(sh.rise) + ' m up per ' + t(sh.run) + ' m along).', ['Use your fraction from (a): top = up, bottom = along.'], 'rate in words');
            p.check = chk; p.good = []; p.bad = [[String(b), String(a)], [String(sh.rise), String(sh.run) + '1']]; return p;
          } },
          { id: 'e10d', level: 'EMG', make: function (r, sh) {
            var h = cl(sh.f[0] * sh.run2 / sh.f[1]);
            return B.number('(d) A second ramp has the same grade but a run of ' + t(sh.run2) + ' m. How high does it rise?', h, function (v) { if (near(v, cl(sh.run2 * sh.f[1] / sh.f[0]))) return { code: 'calc-divided', hint: 'rise = slope × run.' }; return null; },
              t('\\text{rise}=' + frT(sh.f[0], sh.f[1]) + '\\times ' + sh.run2 + '=' + h) + ' m.', ['rise = slope × run.'], 'same grade new run', { after: 'm' });
          } }] },
      { num: '11', stem: function (sh) { return 'A wheelchair ramp must have a slope of <b>no more than</b> ' + t('\\frac{1}{12}') + ' — at most ' + t('1') + ' m of rise for every ' + t('12') + ' m of run. A doorway threshold sits ' + t(sh.H) + ' m above the sidewalk.'; },
        shared: function (r) { var useB = r.chance(0.25), H = useB ? 0.75 : r.pick([0.5, 0.6, 0.75, 0.8, 0.9, 0.7]), g = useB ? 0.625 : r.pick([0.4, 0.45, 0.5, 0.55, 0.6, 0.625].filter(function (x) { return x < H - 0.04; })); return { H: H, g: g, rc: cl(12 * g) }; },
        parts: [
          { id: 'e11a', level: 'PRG', make: function (r, sh) {
            return B.number('(a) Determine the <b>shortest</b> horizontal run a single straight ramp to the threshold may have.', cl(12 * sh.H), function (v) { if (near(v, cl(sh.H / 12)) || near(v, Number((sh.H / 12).toFixed(3)))) return { code: 'calc-divided', hint: 'Each metre of rise needs 12 m of run: multiply by 12.' }; return null; },
              t('\\frac{' + sh.H + '}{\\text{run}}\\le\\frac{1}{12}\\Rightarrow\\text{run}\\ge 12(' + sh.H + ')=' + cl(12 * sh.H)) + '. Shortest run: ' + t(cl(12 * sh.H)) + ' m.', ['At most 1 m of rise per 12 m of run.'], 'shortest run', { after: 'm' });
          } },
          { id: 'e11b', level: 'PRG', make: function (r, sh) {
            var s = sh.H / sh.rc, sD = dec(s, 3);
            return B.mc(r, '(b) A contractor has only ' + t(sh.rc) + ' m of sidewalk to work with. Does a ramp with that run meet the rule?', [
              { html: '<b>No.</b> ' + t('m=\\frac{' + sh.H + '}{' + sh.rc + '}\\approx ' + sD) + ', which is greater than ' + t('\\frac{1}{12}\\approx 0.083') + ': too steep.', right: true },
              { html: '<b>Yes.</b> ' + t('m\\approx ' + sD) + ' is more than ' + t('\\frac{1}{12}') + ', so it is steep enough.', code: 'ramp-max', why: 'The rule is a <b>maximum</b>: the slope may be at most ' + t('\\frac{1}{12}') + '.' },
              { html: '<b>Yes.</b> The run, ' + t(sh.rc) + ' m, is less than ' + t('12') + ' m.', why: 'The run has to be compared with ' + t('12\\times\\text{rise}=' + cl(12 * sh.H)) + ' m, not with ' + t('12') + ' m.' },
              { html: '<b>Yes.</b> ' + t('m\\approx ' + sD) + ' is less than ' + t('1') + '.', why: 'Compare with ' + t('\\frac{1}{12}\\approx 0.083') + ', not with ' + t('1') + '.' }],
              t('m=\\frac{' + sh.H + '}{' + sh.rc + '}\\approx ' + sD) + ' and ' + t('\\frac{1}{12}\\approx 0.083') + '. Since ' + t(sD + '>0.083') + ', the ramp is too steep: it does <b>not</b> meet the rule.', ['Work out the slope, then compare it with ' + t('\\frac{1}{12}') + '.'], 'short run meets rule?');
          } },
          { id: 'e11c', level: 'PRG', make: function (r, sh) {
            return B.number('(c) If the contractor must use that ' + t(sh.rc) + ' m run, what is the greatest rise the ramp may have?', sh.g, function (v) { if (near(v, cl(12 * sh.rc))) return { code: 'calc-mult', hint: 'rise = slope × run with slope ' + t('\\frac{1}{12}') + ': divide the run by 12.' }; return null; },
              t('\\text{rise}=\\frac{1}{12}\\times ' + sh.rc + '=' + sh.g) + '. Greatest rise: ' + t(sh.g) + ' m.', ['Use the greatest slope allowed, ' + t('\\frac{1}{12}') + '.'], 'greatest rise', { after: 'm' });
          } },
          { id: 'e11d', level: 'PRG', make: function (r) {
            return B.mc(r, '(d) The rule is a <i>maximum</i> slope, yet it forces a <i>minimum</i> length. Which explanation is right?', [
              { html: 'A larger slope is a steeper climb — harder and less safe. From ' + t('\\frac{\\text{rise}}{\\text{run}}\\le\\frac{1}{12}') + ', multiplying by ' + t('12\\times\\text{run}') + ' gives ' + t('\\text{run}\\ge 12\\times\\text{rise}') + ': a minimum run.', right: true },
              { html: 'A larger slope is gentler; the rule becomes ' + t('\\text{run}\\le 12\\times\\text{rise}') + '.', why: 'More rise for the same run is <b>steeper</b>, not gentler.' },
              { html: 'A larger slope is steeper; the rule becomes ' + t('\\text{run}\\le 12\\times\\text{rise}') + ', a maximum run.', why: 'Multiply both sides of ' + t('\\frac{\\text{rise}}{\\text{run}}\\le\\frac{1}{12}') + ' by ' + t('12\\times\\text{run}') + ' (positive): ' + t('12\\times\\text{rise}\\le\\text{run}') + '.' },
              { html: 'A larger slope is steeper; the rule becomes ' + t('\\text{rise}\\ge 12\\times\\text{run}') + '.', why: 'The 12 belongs with the rise: ' + t('12\\times\\text{rise}\\le\\text{run}') + '.' }],
              'More rise for the same run means a steeper climb, so the slope must be kept small. ' + t('\\frac{\\text{rise}}{\\text{run}}\\le\\frac{1}{12}') + ' times ' + t('12\\times\\text{run}') + ' gives ' + t('12\\times\\text{rise}\\le\\text{run}') + ' — a minimum run.', ['Rearrange the inequality for the run.'], 'max slope, min run');
          } }] },
      { num: '12', stem: function (sh) { return 'A roof described as a “' + sh.a + ' in 12” pitch rises ' + t(sh.a) + ' ft vertically for every ' + t('12') + ' ft of horizontal run.'; },
        shared: function (r) { var useB = r.chance(0.25), a = useB ? 4 : r.pick([3, 4, 6, 8, 9, 10, 5]), bs = [5, 6, 8, 9, 10, 12].filter(function (x) { return x > a && x % a !== 0; }), b = useB ? 9 : bs.length ? r.pick(bs) : 12; return { a: a, b: b, W: useB ? 30 : r.pick([24, 30, 36, 40, 28].filter(function (w) { return (a * w) % 3 === 0; })) }; },   // a·W/24 must be a terminating decimal
        parts: [
          { id: 'e12a', level: 'BEG', make: function (r, sh) { var f = red(sh.a, 12); return B.fraction('(a) State the slope of that roofline in lowest terms.', f, {}, t('m=\\frac{' + sh.a + '}{12}=' + frT(f[0], f[1])), ['rise over run, then reduce.'], 'pitch slope'); } },
          { id: 'e12b', level: 'BEG', make: function (r, sh) { var f = red(-sh.a, 12); return slopePart('(b) The far side of the roof is the mirror image. State its slope.', f, 'Read left to right, the far side falls: its rise is negative while the run stays positive. ' + t('m=-\\frac{' + sh.a + '}{12}=' + frT(f[0], f[1])) + ' — same steepness, opposite sign.', ['Read the far side from left to right: up or down?'], 'mirror roof slope'); } },
          { id: 'e12c', level: 'EMG', make: function (r, sh) {
            var h = cl(sh.a * sh.W / 24);
            return B.number('(c) The house is ' + t(sh.W) + ' ft wide and the peak is centred. How far above the eaves is the peak?', h, function (v) { if (near(v, cl(sh.a * sh.W / 12))) return { code: 'area-full', hint: 'The peak is centred, so the run from the eave to the peak is only <b>half</b> the width.' }; return null; },
              'Run to the peak ' + t('=\\frac{' + sh.W + '}{2}=' + sh.W / 2) + ' ft. ' + t('\\text{rise}=' + frT(sh.a, 12) + '\\times ' + sh.W / 2 + '=' + h) + ' ft.', ['What is the run from the eave to the peak?'], 'roof peak height', { after: 'ft' });
          } },
          { id: 'e12d', level: 'EMG', make: function (r, sh) {
            var fct = red(sh.b, sh.a);
            var p = B.math('(d) A “' + sh.b + ' in 12” roof is quoted for a different house. It is steeper. By what factor is it steeper than the “' + sh.a + ' in 12” roof?', K.value(sh.b / sh.a, { diag: function (v) { if (near(v, sh.b - sh.a)) return { code: 'fac-diff', hint: 'That’s the difference. A <b>factor</b> means “how many times as steep”: divide the slopes.' }; if (near(v, sh.a / sh.b)) return { code: 'calc-flip', hint: 'Steeper by a factor greater than 1: divide the steeper slope by the gentler one.' }; return null; } }),
              frT(fct[0], fct[1]), t(frT(sh.b, 12) + '\\div ' + frT(sh.a, 12) + '=\\frac{' + sh.b + '}{' + sh.a + '}=' + frT(fct[0], fct[1]) + (fct[1] !== 1 ? '\\approx ' + dec(sh.b / sh.a, 2) : '')) + ': the “' + sh.b + ' in 12” roof is ' + t(frT(fct[0], fct[1])) + ' times as steep.', ['Divide one slope by the other.'], 'roof steepness factor', { keys: 'fraction' });
            var c0 = p.check; p.check = function (resp) { var res = c0(resp), v = HW.parse.number(resp); if (res.v === 'wrong' && v.ok && Math.abs(v.value - sh.b / sh.a) < 0.006) return form('decimal-rounded', 'Close — but that decimal is rounded. Give the exact factor as a fraction.'); return res; };
            p.good = Number((sh.b / sh.a).toFixed(4)) === sh.b / sh.a ? [String(sh.b / sh.a)] : []; p.bad = [String(sh.b - sh.a)]; return p;
          } }] },
      { num: '13', section: 'Extra practice E — Error analysis', stem: function (sh) { return 'Asked for the slope of the segment joining ' + t('A' + ptT(sh.A)) + ' and ' + t('B' + ptT(sh.B)) + ', a student writes ' + t('m=\\frac{x_2-x_1}{y_2-y_1}=' + '\\frac{' + subT(sh.B[0], sh.A[0]) + '}{' + subT(sh.B[1], sh.A[1]) + '}=' + fracSteps(sh.B[0] - sh.A[0], sh.B[1] - sh.A[1])) + '.'; },
        shared: function (r) { for (var g = 0; g < 100; g++) { var A = r.chance(0.2) ? [-3, 5] : [r.int(-6, 2), r.int(0, 7)], Bp = r.chance(0.2) ? [5, -1] : [r.int(2, 8), r.int(-6, 4)]; var s = slopeOf(A, Bp); if (!s || s[0] === 0 || Math.abs(s[0]) === Math.abs(s[1]) || Bp[0] === A[0]) continue; return { A: A, B: Bp, s: s }; } return { A: [-3, 5], B: [5, -1], s: [-3, 4] }; },
        parts: [
          { id: 'e13a', level: 'EMG', make: function (r, sh) {
            return B.mc(r, '(a) What is the mistake?', [{ html: 'The formula is upside down: the student found run over rise instead of rise over run.', right: true },
              { html: 'The student subtracted in different orders on the top and bottom.', why: 'Both subtractions use point B first — the order is consistent.' },
              { html: 'The student made a sign error subtracting a negative.', why: 'The arithmetic is right; check which change is on top.' },
              { html: 'There is no mistake.', why: 'Slope is ' + t('\\frac{y_2-y_1}{x_2-x_1}') + ' — the change in ' + t('y') + ' goes on top.' }],
              'The student inverted the formula: ' + t('\\frac{x_2-x_1}{y_2-y_1}') + ' is run over rise. Slope is ' + t('\\frac{\\text{rise}}{\\text{run}}=\\frac{y_2-y_1}{x_2-x_1}') + '.', ['Which change belongs on top?'], 'name the run/rise error');
          } },
          { id: 'e13b', level: 'BEG', make: function (r, sh) { return coordSlopePart('(b) Determine the correct slope.', sh.A, sh.B, 'A', 'B'); } },
          { id: 'e13c', level: 'EMG', make: function (r, sh) {
            var w = slT(red(sh.s[1], sh.s[0])), c = slT(sh.s);
            return B.mc(r, '(c) The correct slope is ' + t(c) + '. How is the student’s answer ' + t(w) + ' related to it?', [{ html: 'It is the <b>reciprocal</b>: the product is ' + t('1') + '.', right: true },
              { html: 'It is the negative reciprocal.', why: 'Both have the same sign, and ' + t(w + '\\times ' + c + '=1') + ', not ' + t('-1') + '.' },
              { html: 'It is the opposite (negative).', why: 'The opposite of ' + t(c) + ' is ' + t(slT([-sh.s[0], sh.s[1]])) + '.' },
              { html: 'They are equal.', why: 'Compare as decimals: ' + t(dec(sval(red(sh.s[1], sh.s[0])), 3)) + ' and ' + t(dec(sval(sh.s), 3)) + '.' }],
              t(w) + ' is the reciprocal of ' + t(c) + ': ' + t(w + '\\times\\left(' + c + '\\right)=1') + '.', ['Multiply the two slopes.'], 'reciprocal relationship');
          } },
          { id: 'e13d', level: 'ADV', make: function (r) {
            return B.valueSet('(d) For which slopes would this mistake go unnoticed — when does run over rise equal rise over run?', [1, -1], { v: 'm', diag: function (A) { if (A.length === 1 && near(A[0], 1)) return { code: 'sol-missing', hint: 'Right — and there is one more slope that equals its own reciprocal.' }; return null; } },
              'We need ' + t('m=\\frac{1}{m}') + ', so ' + t('m^2=1') + ': ' + t('m=1') + ' or ' + t('m=-1') + ' (rise and run the same size).', ['When is a number equal to its reciprocal?'], 'm = 1/m');
          } }] },
      { num: '14', stem: function (sh) { return 'Asked for the slope of the segment joining ' + t('P' + ptT(sh.P)) + ' and ' + t('Q' + ptT(sh.Q)) + ', a student computes the rise as ' + t(Math.abs(sh.rise)) + ' and the run as ' + t(sh.run) + ' and answers ' + t(frT(Math.abs(sh.rise), sh.run)) + '.'; },
        shared: function (r) { for (var g = 0; g < 100; g++) { var P = r.chance(0.2) ? [-2, 7] : [r.int(-6, 0), r.int(3, 8)], Q = r.chance(0.2) ? [6, 1] : [r.int(2, 8), r.int(-4, 2)]; if (Q[1] < P[1] && Q[0] > P[0] && gcd(P[1] - Q[1], Q[0] - P[0]) >= 1) return { P: P, Q: Q, rise: Q[1] - P[1], run: Q[0] - P[0] }; } return { P: [-2, 7], Q: [6, 1], rise: -6, run: 8 }; },
        parts: [
          { id: 'e14a', level: 'BEG', make: function (r, sh) { var s = slopeOf(sh.P, sh.Q); return slopePart('(a) The run is right. Find the correct rise, with its sign, and give the correct slope.', s, t('\\text{rise}=' + subT(sh.Q[1], sh.P[1]) + '=' + sh.rise) + ' (not ' + t(-sh.rise) + '), ' + t('\\text{run}=' + subT(sh.Q[0], sh.P[0]) + '=' + sh.run) + '. ' + t('m=' + fracSteps(sh.rise, sh.run)) + '.', ['Is ' + t('Q') + ' higher or lower than ' + t('P') + '?'], 'fix rise sign'); } },
          { id: 'e14b', level: 'EMG', make: function (r) {
            return B.mc(r, '(b) Describe the line the student’s answer would give, and the line the correct answer gives.', [{ html: 'The student’s line <b>climbs</b> from left to right; the correct line <b>falls</b> — same steepness, opposite tilt.', right: true },
              { html: 'The student’s line falls; the correct line climbs.', why: 'The student’s answer is positive: positive slopes climb.' },
              { html: 'Both lines climb, but the correct one is steeper.', why: 'The two answers have the same size; only the sign differs.' },
              { html: 'The student’s line is horizontal.', why: 'A positive slope climbs.' }],
              'A positive slope climbs from left to right; the correct negative slope falls. The sizes are the same, so the steepness is the same.', ['Positive: climbs. Negative: falls.'], 'student vs correct line');
          } },
          { id: 'e14c', level: 'EMG', make: function (r, sh) {
            return B.mc(r, '(c) Without any calculation, how could a quick sketch of ' + t('P') + ' and ' + t('Q') + ' have caught this error?', [{ html: t('P') + ' is on the left and higher (' + t('y=' + sh.P[1]) + ') and ' + t('Q') + ' is on the right and lower (' + t('y=' + sh.Q[1]) + '), so the segment goes downhill — a positive slope is impossible.', right: true },
              { html: 'A sketch shows the segment is steep, so the slope must be greater than ' + t('1') + '.', why: 'Steepness doesn’t tell you the sign. Look at whether it goes up or down from left to right.' },
              { html: 'A sketch can’t catch sign errors; only the formula can.', why: 'The direction of a sketch — uphill or downhill — shows the sign at a glance.' },
              { html: 'A sketch shows both points are in the same quadrant.', why: 'Quadrants don’t matter here; the direction of the segment does.' }],
              'Left-to-right, ' + t('P') + ' to ' + t('Q') + ' goes down, so the slope must be negative.', ['Imagine walking from ' + t('P') + ' to ' + t('Q') + ': uphill or downhill?'], 'sketch check sign');
          } }] },
      { num: '15', stem: function (sh) { return 'Asked for the slope of the segment joining ' + t(ptT(sh.A)) + ' and ' + t(ptT(sh.B)) + ', a student writes: “The run is ' + t('0') + '. Zero divided into anything is zero, so the slope is ' + t('0') + '.”'; },
        shared: function (r) { var x = r.chance(0.25) ? 4 : r.int(-6, 6), y1 = r.chance(0.25) ? -3 : r.int(-6, 0), y2 = y1 + r.int(5, 12); return { A: [x, y1], B: [x, y2] }; },
        parts: [
          { id: 'e15a', level: 'BEG', make: function (r, sh) {
            var rise = sh.B[1] - sh.A[1];
            return B.fields('(a) Write the rise and the run.', [{ label: 'Rise', name: 'Rise' }, { label: 'Run', name: 'Run' }], [K.number(rise, function (v) { return near(v, -rise) ? { code: 'calc-sign', hint: 'Subtract in the order second − first: ' + t(subT(sh.B[1], sh.A[1])) + '.' } : null; }), K.number(0)], [String(rise), '0'], 'rise ' + t(rise) + ', run ' + t('0'),
              t('\\text{rise}=' + subT(sh.B[1], sh.A[1]) + '=' + rise) + ', ' + t('\\text{run}=' + subT(sh.B[0], sh.A[0]) + '=0') + ', so the formula gives ' + t('\\frac{' + rise + '}{0}') + '.', ['Subtract the ' + t('y') + '-values, then the ' + t('x') + '-values.'], 'rise and run vertical');
          } },
          { id: 'e15b', level: 'EMG', make: function (r, sh) {
            var rise = sh.B[1] - sh.A[1];
            return B.mc(r, '(b) The fraction ' + t('\\frac{' + rise + '}{0}') + ' is not ' + t('0') + '. What is it instead, and why?', [{ html: 'The <b>denominator</b> is ' + t('0') + ', and dividing by ' + t('0') + ' gives no number at all: the slope is <b>undefined</b>.', right: true },
              { html: 'It is ' + t(rise) + ', because dividing by ' + t('0') + ' changes nothing.', why: 'Check by multiplying back: ' + t(rise + '\\times 0=0') + ', not ' + t(rise) + '.' },
              { html: 'It is ' + t('0') + ' after all — the student is right.', why: 'Slope ' + t('0') + ' is a zero <b>numerator</b> over a non-zero denominator, like ' + t('\\frac{0}{' + rise + '}') + '. Here the zero is on the bottom.' },
              { html: 'It is infinity, a very large slope.', why: 'In this course we say the slope is <b>undefined</b>: there is no number that works.' }],
              'The denominator is ' + t('0') + ', and there is no number ' + t('k') + ' with ' + t('k\\times 0=' + rise) + '. The slope is <b>undefined</b> (a vertical segment). Slope ' + t('0') + ' would be ' + t('\\frac{0}{\\text{run}}') + '.', ['Is the zero on the top or the bottom?'], 'n/0 is undefined');
          } },
          { id: 'e15c', level: 'BEG', make: function (r, sh) {
            var A = sh.A, k = [[A[0], A[1]], [A[0] + 6, A[1]]];
            var test = function (p) { return null; };
            var c = function (resp) {
              var L = readPts(resp); if (L.empty) return form('empty', 'Type two points.'); if (L.bad) return form('pts-format', 'Write two points in brackets, e.g. ' + t('(1,\\ 2),\\ (5,\\ 2)') + '.');
              if (L.pts.length !== 2) return form('pts-few', 'Give exactly two points.');
              var p = L.pts[0], q = L.pts[1]; if (same(p, q)) return form('pts-dup', 'Use two different points.');
              if (near(p[0], q[0])) return wrong('pts-vh', 'Those two points have the same ' + t('x') + ' — another vertical segment (undefined slope). For slope ' + t('0') + ', keep the ' + t('y') + '-values the same.');
              if (!near(p[1], q[1])) return wrong('pts-off', 'From ' + t(ptT(p)) + ' to ' + t(ptT(q)) + ' the rise isn’t ' + t('0') + '. For slope ' + t('0') + ', the two ' + t('y') + '-values must be equal.');
              return ok();
            };
            var p = B.math('(c) Give two points whose segment really does have slope ' + t('0') + '.', c, ptsT(k), 'For example ' + t(ptsT(k)) + ': ' + t('m=\\frac{' + subT(A[1], A[1]) + '}{' + subT(A[0] + 6, A[0]) + '}=\\frac{0}{6}=0') + '. That segment is horizontal; the student’s segment is vertical.', ['Slope 0: rise 0. Which coordinate stays the same?'], 'two points slope 0', { keys: 'pairs', placeholder: 'e.g. (1, 2), (5, 2)' });
            p.bad = [ptsT([[A[0], A[1]], [A[0], A[1] + 3]])]; return p;
          } },
          { id: 'e15d', level: 'EMG', make: function (r) {
            return B.mc(r, '(d) Why is “no slope” also an unacceptable answer for this segment?', [{ html: '“No slope” sounds like no steepness — flat — the same mix-up as ' + t('0') + '. The segment is vertical, as steep as possible; <i>undefined</i> says exactly what went wrong: the division can’t be done.', right: true },
              { html: 'It is acceptable — “no slope” and “undefined” mean the same to everyone.', why: 'Many people hear “no slope” as “flat”, which is a slope of ' + t('0') + ' — the opposite of vertical.' },
              { html: 'Because vertical segments have a slope of ' + t('0') + '.', why: 'Horizontal segments have slope ' + t('0') + '. Vertical ones are undefined.' },
              { html: 'Because every segment has a numerical slope.', why: 'Vertical segments don’t: their run is ' + t('0') + '.' }],
              '“No slope” is easily heard as “flat” (slope ' + t('0') + '). A vertical segment is the opposite of flat. “Undefined” is precise: ' + t('\\frac{\\text{rise}}{0}') + ' can’t be calculated.', ['What would “no slope” make you picture?'], 'no slope vs undefined');
          } }] },
      { num: '16', section: 'Extra practice F — Stretch', stem: 'Determine the value of ' + t('k') + ' in each case, or state that every value of ' + t('k') + ' works.', parts: [
        { id: 'e16a', level: 'PRG', make: function (r) {
          var useB = r.chance(0.25), f = useB ? [-1, 2] : r.pick([[-1, 2], [-2, 3], [1, 3], [-3, 2], [2, 3]]), A0 = useB ? 2 : r.int(-3, 4), Bp = useB ? [-4, 3] : [A0 - f[1] * r.pick([1, 2]), r.int(-4, 5)], k = Bp[1] - f[0] * (Bp[0] - A0) / f[1];
          return B.number('(a) The segment joining ' + t('A(' + A0 + ',\\ k)') + ' and ' + t('B' + ptT(Bp)) + ' has slope ' + t(frT(f[0], f[1])) + '.', k, function (v) { if (near(v, Bp[1] + f[0] * (Bp[0] - A0) / f[1])) return { code: 'k-sign', hint: 'Check your signs: substitute your ' + t('k') + ' back into the slope formula.' }; return null; },
            t('\\frac{' + Bp[1] + '-k}{' + subT(Bp[0], A0) + '}=' + frT(f[0], f[1])) + ', so ' + t(Bp[1] + '-k=' + frT(f[0], f[1]) + '\\times(' + (Bp[0] - A0) + ')=' + cl(f[0] * (Bp[0] - A0) / f[1])) + ' and ' + t('k=' + k) + '. Check: ' + t(formulaT([A0, k], Bp) + '=' + fracSteps(Bp[1] - k, Bp[0] - A0)) + ' ✓', ['Substitute into the slope formula and solve.'], 'stretch k (a)', { before: t('k=') });
        } },
        { id: 'e16b', level: 'PRG', make: function (r) {
          var y1 = r.int(-4, 2), run = r.pick([6, 4, 3, 2]), f = r.pick([[3, 2], [1, 2], [-1, 2], [2, 3], [5, 2]]), rise = f[0] * run / f[1]; if (rise % 1) { run = 2 * f[1]; rise = 2 * f[0]; }
          return B.mc(r, '(b) The segment joining ' + t('A(k,\\ ' + y1 + ')') + ' and ' + t('B(k+' + run + ',\\ ' + (y1 + rise) + ')') + ' has slope ' + t(frT(f[0], f[1])) + '.', [
            { html: 'Every value of ' + t('k') + ' works.', right: true }, { html: t('k=0') + ' only', why: 'Try ' + t('k=5') + ': the run is still ' + t(run) + ' and the rise still ' + t(rise) + '.' },
            { html: t('k=' + run) + ' only', why: 'The ' + t('k') + ' cancels in the run: ' + t('(k+' + run + ')-k=' + run) + '.' }, { html: 'No value of ' + t('k') + ' works.', why: 'Work out the slope: ' + t('\\frac{' + rise + '}{' + run + '}=' + frT(f[0], f[1])) + ' — always.' }],
            t('m=\\frac{' + (y1 + rise) + '-' + (y1 < 0 ? '(' + y1 + ')' : y1) + '}{(k+' + run + ')-k}=\\frac{' + rise + '}{' + run + '}=' + frT(f[0], f[1])) + '. The ' + t('k') + ' cancels, so the slope is ' + t(frT(f[0], f[1])) + ' for <b>every</b> value of ' + t('k') + '.', ['Simplify the run ' + t('(k+' + run + ')-k') + '.'], 'k cancels');
        } },
        { id: 'e16c', level: 'MAS', make: function (r) {
          for (var g = 0; g < 200; g++) { var useB = g === 0 && r.chance(0.25), a = useB ? 2 : r.pick([2, 3, -2, -1]), m = useB ? -1 : r.pick([-1, 1, -2, 2, 3]), k = useB ? 1 : r.int(-3, 3), x2 = useB ? 6 : r.int(-5, 7); if (m === a || x2 === k) continue; var y2 = a * k + m * (x2 - k); if (Math.abs(y2) > 15) continue; break; }
          var aT = a === 1 ? '' : a === -1 ? '-' : String(a);
          return B.number('(c) The segment joining ' + t('A(k,\\ ' + aT + 'k)') + ' and ' + t('B' + ptT([x2, y2])) + ' has slope ' + t(m) + '.', k, null,
            t('\\frac{' + y2 + '-' + (a < 0 ? '(' + aT + 'k)' : aT + 'k') + '}{' + x2 + '-k}=' + m) + ' → ' + t(y2 + (a < 0 ? '+' + (a === -1 ? '' : -a) : '-' + aT) + 'k=' + m + '(' + x2 + '-k)') + ' → ' + t('k=' + k) + '. Check: ' + t('A' + ptT([k, a * k])) + ', ' + t(formulaT([k, a * k], [x2, y2]) + '=' + fracSteps(y2 - a * k, x2 - k)) + ' ✓', ['Write the slope formula, cross-multiply, and collect the ' + t('k') + '-terms on one side.'], 'stretch k in both coords', { before: t('k=') });
        } },
        { id: 'e16d', level: 'MAS', make: function (r) {
          for (var g = 0; g < 300; g++) { var useB = g === 0 && r.chance(0.25), f = useB ? [-1, 2] : r.pick([[-1, 2], [1, 2], [-2, 3], [-1, 3], [2, 3]]), k = useB ? -1 : r.int(-4, 4), d = useB ? 3 : k + f[1] * r.pick([1, 2, -1]), c = k - f[0] * (d - k) / f[1]; if (c % 1 || d === k || c === k || Math.abs(c) > 9 || Math.abs(d) > 9) continue; break; }
          return B.number('(d) The segment joining ' + t('A(k,\\ ' + c + ')') + ' and ' + t('B(' + d + ',\\ k)') + ' has slope ' + t(frT(f[0], f[1])) + '.', k, null,
            t('\\frac{k-' + (c < 0 ? '(' + c + ')' : c) + '}{' + d + '-k}=' + frT(f[0], f[1])) + ' → ' + t(f[1] + '(k' + (c < 0 ? '+' + (-c) : '-' + c) + ')=' + f[0] + '(' + d + '-k)') + ' → ' + t('k=' + k) + '. Check: ' + t('A' + ptT([k, c]) + ',\\ B' + ptT([d, k])) + ': ' + t(formulaT([k, c], [d, k]) + '=' + fracSteps(k - c, d - k)) + ' ✓', ['Cross-multiply: ' + t(f[1] + '(k' + (c < 0 ? '+' + (-c) : '-' + c) + ')=' + f[0] + '(' + d + '-k)') + ', then solve.'], 'stretch k in x1 and y2', { before: t('k=') });
        } },
        { id: 'e16e', level: 'EMG', make: function (r) {
          var y1 = r.int(-4, 2), run = r.pick([6, 4, 3, 2]), f = r.pick([[3, 2], [1, 2], [-1, 2], [2, 3], [5, 2]]), rise = f[0] * run / f[1]; if (rise % 1) { run = 2 * f[1]; rise = 2 * f[0]; }
          return B.mc(r, '(e) Part (b) is different from the others: any segment like the one joining ' + t('A(k,\\ ' + y1 + ')') + ' and ' + t('B(k+' + run + ',\\ ' + (y1 + rise) + ')') + ' has slope ' + t(frT(f[0], f[1])) + ' for <b>every</b> value of ' + t('k') + '. What is special about those two points?', [
            { html: 'The same ' + t('k') + ' appears in both ' + t('x') + '-coordinates, so it cancels: the run and rise are fixed numbers, and changing ' + t('k') + ' only slides the segment sideways.', right: true },
            { html: 'The slope is positive, so ' + t('k') + ' can be anything.', why: 'Other segments with positive slopes still give just one value of ' + t('k') + '. What matters is that ' + t('k') + ' cancels.' },
            { html: t('k') + ' appears only in the ' + t('y') + '-coordinates.', why: 'Look again: ' + t('k') + ' is in both ' + t('x') + '-coordinates.' },
            { html: 'There is a mistake in the question.', why: 'The question is fine — it just has infinitely many answers.' }],
            'The run is always ' + t('(k+' + run + ')-k=' + run) + ' and the rise ' + t(rise) + ' doesn’t involve ' + t('k') + ', so the slope doesn’t depend on ' + t('k') + ' at all — the equation holds for every ' + t('k') + '.', ['Simplify the run ' + t('(k+' + run + ')-k') + '.'], 'why k cancels');
        } }] },
      { num: '17', stem: function (sh) { return 'The points ' + ['A', 'B', 'C', 'D'].map(function (n, i) { return t(n + ptT(sh.P[i])); }).join(', ') + ' all lie on one line.'; },
        shared: function (r) { for (var g = 0; g < 200; g++) { var useB = g === 0 && r.chance(0.3), f = useB ? [2, 3] : r.pick([[2, 3], [1, 2], [1, 3], [3, 2], [-2, 3], [-1, 2], [-1, 3]]), A = useB ? [-6, -4] : [r.int(-7, -7 + 14 - 4 * Math.abs(f[1])), 0]; if (!useB) { var ylo = f[0] > 0 ? -7 : -7 + 4 * Math.abs(f[0]), yhi = f[0] > 0 ? 7 - 4 * f[0] : 7; if (ylo > yhi) continue; A[1] = r.int(ylo, yhi); } var P = [0, 1, 3, 4].map(function (k) { return [A[0] + k * f[1], A[1] + k * f[0]]; }); if (P.some(function (p) { return Math.abs(p[0]) > 7 || Math.abs(p[1]) > 7; })) continue; return { f: f, P: P }; } return { f: [2, 3], P: [[-6, -4], [-3, -2], [3, 2], [6, 4]] }; },
        parts: [
          { id: 'e17a', level: 'BEG', make: function (r, sh) {
            var P = sh.P, pairs = [[0, 1], [0, 3], [1, 2]], nm = ['A', 'B', 'C', 'D'], s = red(sh.f[0], sh.f[1]);
            return B.fields('(a) Calculate the slope using ' + t('A') + ' and ' + t('B') + ', then ' + t('A') + ' and ' + t('D') + ', then ' + t('B') + ' and ' + t('C') + '.', pairs.map(function (pr) { return { label: t('m_{' + nm[pr[0]] + nm[pr[1]] + '}'), name: nm[pr[0]] + nm[pr[1]], mode: 'math', keys: 'slope' }; }), pairs.map(function () { return K.slope(s); }), pairs.map(function () { return slT(s); }),
              'All three: ' + t(slT(s)), pairs.map(function (pr) { return t('m_{' + nm[pr[0]] + nm[pr[1]] + '}=' + formulaT(P[pr[0]], P[pr[1]]) + '=' + fracSteps(P[pr[1]][1] - P[pr[0]][1], P[pr[1]][0] - P[pr[0]][0])); }).join('<br>') + '<br>All three are ' + t(slT(s)) + '.', ['Use ' + t('m=\\frac{y_2-y_1}{x_2-x_1}') + ' three times.'], 'three slopes on one line');
          } },
          { id: 'e17b', level: 'EMG', make: function (r, sh) {
            var P = sh.P, A = P[0], Bp = P[1], Dp = P[3], cB = [Bp[0], A[1]], cD = [Dp[0], A[1]];
            var key = gv([], [{ v: [A, cB, Bp], s: 'closed', e: 'closed' }, { v: [A, cD, Dp], s: 'closed', e: 'closed' }]);
            var cov = function (resp, U, V) { for (var i = 0; i <= 4; i++) { var p = [U[0] + (V[0] - U[0]) * i / 4, U[1] + (V[1] - U[1]) * i / 4]; if (!DR.contains(resp, p)) return false; } return true; };
            var legs = function (resp, Pp, Q) { var c1 = [Q[0], Pp[1]], c2 = [Pp[0], Q[1]]; return (cov(resp, Pp, c1) && cov(resp, c1, Q)) || (cov(resp, Pp, c2) && cov(resp, c2, Q)); };
            var chk = function (resp) {
              if (DR.empty(resp)) return form('empty', 'Draw the two triangles on the grid first.');
              var g = DR.geom(resp), slant = Object.keys(g.lines).filter(function (k) { var L = g.lines[k]; if (L.A === 0 || L.B === 0) return false; return !(Math.abs(L.A * A[0] + L.B * A[1] - L.C) < 1e-6 && Math.abs(L.A * Dp[0] + L.B * Dp[1] - L.C) < 1e-6); });
              if (slant.length) return wrong('tri-slanted', 'The legs of a rise-and-run triangle are parallel to the axes: one <b>horizontal</b> (the run) and one <b>vertical</b> (the rise).');
              if (!legs(resp, A, Bp)) return wrong('tri-ab', 'Draw the triangle for ' + t('AB') + ': from ' + t('A') + ' go straight across to the point level with ' + t('A') + ' and below or above ' + t('B') + ', then straight up or down to ' + t('B') + '.');
              if (!legs(resp, A, Dp)) return wrong('tri-ad', 'Good for ' + t('AB') + ' — now draw the triangle for ' + t('AD') + ' the same way.');
              return ok();
            };
            var inp = { x: [-7, 7], y: [-7, 7], labels: 2, defaultEnd: 'closed', tools: ['line', 'ends'], bg: { segs: [{ pts: [clipEnd(A, [A[0] - Dp[0], A[1] - Dp[1]], 1.5, 6.8), clipEnd(Dp, [Dp[0] - A[0], Dp[1] - A[1]], 1.5, 6.8)], color: '#9aa1ad' }], points: ['A', 'B', 'C', 'D'].map(function (n, i) { return { x: P[i][0], y: P[i][1], label: n }; }) } };
            var p = B.graph('(b) Draw the rise-and-run right triangle for ' + t('AB') + ' and the one for ' + t('AD') + '. Make each triangle’s legs parallel to the axes.<div class="muted">Use <b>╱ Line</b> and tap the corners in order (for example ' + t('A') + ', the corner, then ' + t('B') + '); tap the last point again to finish.</div>', inp, chk, key,
              t('AB') + ': run ' + t(Bp[0] - A[0]) + ', rise ' + t(Bp[1] - A[1]) + ', right angle at ' + t(ptT(cB)) + '. ' + t('AD') + ': run ' + t(Dp[0] - A[0]) + ', rise ' + t(Dp[1] - A[1]) + ', right angle at ' + t(ptT(cD)) + '. (Going up first, then across, is fine too.)', ['Each triangle: one horizontal leg (the run) and one vertical leg (the rise); the hypotenuse is on the line.'], 'draw rise-run triangles');
            p.bad = [gv([], [{ v: [A, cB, Bp], s: 'closed', e: 'closed' }]), gv([], [seg(A, Dp)])]; return p;
          } },
          { id: 'e17c', level: 'PRG', make: function (r) {
            return B.mc(r, '(c) Picture the rise-and-run right triangle for ' + t('AB') + ' and the one for ' + t('AD') + ', each with legs parallel to the axes. Why must those two triangles be <b>similar</b>?', [
              { html: 'Each has a right angle (horizontal and vertical legs), they share the angle at ' + t('A') + ' (both hypotenuses lie along the same line from ' + t('A') + '), so the third angles match too.', right: true },
              { html: 'They have the same side lengths.', why: 'Same side lengths would make them congruent; the ' + t('AD') + ' triangle is bigger.' },
              { html: 'Both are isosceles.', why: 'Their legs are different lengths (unless the slope is ' + t('\\pm 1') + ').' },
              { html: 'Because ' + t('B') + ' is between ' + t('A') + ' and ' + t('D') + '.', why: 'That is true, but similarity needs matching angles.' }],
              'Right angles match (horizontal leg meets vertical leg). The angle at ' + t('A') + ' is shared because both hypotenuses lie on the same line from ' + t('A') + '. The third angles are each ' + t('90^\\circ') + ' minus the angle at ' + t('A') + '. Three pairs of equal angles: similar.', ['List the three angles of each triangle.'], 'triangles similar');
          } },
          { id: 'e17d', level: 'PRG', make: function (r) {
            return B.mc(r, '(d) How does similarity show that <i>any</i> two points on the line give the same slope?', [
              { html: 'Any two points give a rise-and-run triangle similar to these, and similar triangles have proportional sides, so ' + t('\\frac{\\text{rise}}{\\text{run}}') + ' is the same for every pair.', right: true },
              { html: 'Similar triangles have equal sides, so the rise and run are always the same.', why: 'The rise and run change (' + t('AB') + ' and ' + t('AD') + ' have different ones); only their <b>ratio</b> stays the same.' },
              { html: 'It only works for points with integer coordinates.', why: 'Similarity works for any points on the line.' },
              { html: 'Because the slope is always rise plus run.', why: 'Slope is a ratio: rise divided by run.' }],
              'Every pair of points on the line makes a right triangle similar to these, and corresponding sides of similar triangles are proportional: ' + t('\\frac{\\text{rise}}{\\text{run}}') + ' is the same for all of them. That common ratio is the slope of the <i>line</i>.', ['Proportional sides → equal ratios.'], 'slope same anywhere');
          } }] },
      { num: '18', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: 'e18', level: 'EMG', make: function (r) {
          var useB = r.chance(0.25), f = useB ? [3, 5] : r.pick([[3, 5], [2, 3], [3, 4], [2, 5], [4, 5]]), p = f[0], q = f[1], cmp = useB ? [1, 2] : r.pick([[1, 2], [1, 3], [1, 4]].filter(function (c) { return c[0] / c[1] < p / q; }));
          return B.mc(r, 'A line segment has slope ' + t(frT(-p, q)) + '. Which statement must be true?', [
            { html: 'A run of ' + t(q) + ' along the segment goes with a rise of ' + t(p) + '.', why: t('\\text{rise}=' + frT(-p, q) + '\\times ' + q + '=-' + p) + ', not ' + t(p) + '.' },
            { html: 'A run of ' + t(-2 * q) + ' along the segment goes with a rise of ' + t(2 * p) + '.', right: true },
            { html: 'The segment is less steep than a segment of slope ' + t(frT(cmp[0], cmp[1])) + '.', why: 'Compare sizes: ' + t(frT(p, q) + '=' + dec(p / q, 2)) + ' is more than ' + t(frT(cmp[0], cmp[1]) + '\\approx ' + dec(cmp[0] / cmp[1], 2)) + ', so it is <b>steeper</b>.' },
            { html: 'The segment rises from left to right.', why: 'A negative slope falls from left to right.' }],
            t('\\text{rise}=m\\times\\text{run}') + ' with ' + t('m=' + frT(-p, q)) + ': a run of ' + t(-2 * q) + ' gives ' + t(frT(-p, q) + '\\times(' + (-2 * q) + ')=' + 2 * p) + ' ✓. (A run of ' + t(q) + ' gives a rise of ' + t(-p) + '; ' + t('|' + frT(-p, q) + '|>' + frT(cmp[0], cmp[1])) + ' so it is steeper; negative slopes fall.)', ['Test each statement with rise = slope × run.'], 'must be true slope -' + p + '/' + q);
        } }] },
      { num: '19', stem: '<i>(Numerical Response)</i>', parts: [
        { id: 'e19', level: 'PRG', make: function (r) {
          for (var g = 0; g < 200; g++) { var useB = g === 0 && r.chance(0.25), f = useB ? [3, 2] : r.pick([[3, 2], [2, 3], [5, 4], [3, 4], [4, 3], [5, 2]]), x1 = useB ? -4 : r.int(-8, -1), x2 = useB ? 8 : x1 + f[1] * r.pick([2, 3, 4]), y2 = useB ? 20 : r.int(10, 30), pp = y2 - f[0] * (x2 - x1) / f[1]; if (pp < 0 || pp % 1 || pp > 99) continue; break; }
          return B.nr('The segment joining ' + t('(' + x1 + ',\\ p)') + ' and ' + t(ptT([x2, y2])) + ' has a slope of ' + t(frT(f[0], f[1])) + '. The value of ' + t('p') + ' is ________.', pp, function (v) { if (near(v, y2 + f[0] * (x2 - x1) / f[1])) return { code: 'k-sign', hint: 'Check the signs: substitute your ' + t('p') + ' back in.' }; if (near(v, f[0] * (x2 - x1) / f[1])) return { code: 'end-nostart', hint: 'That’s the rise. Now use it to find ' + t('p') + ': ' + t(y2 + '-p=\\text{rise}') + '.' }; return null; },
            t('\\frac{' + y2 + '-p}{' + subT(x2, x1) + '}=' + frT(f[0], f[1])) + ', so ' + t(y2 + '-p=' + frT(f[0], f[1]) + '\\times ' + (x2 - x1) + '=' + cl(f[0] * (x2 - x1) / f[1])) + ' and ' + t('p=' + pp) + '.', ['Work out the run, then the rise = slope × run.'], 'find p for slope');
        } }] }
    ];
  }
})(window);
