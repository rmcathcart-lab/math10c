/* Math 10C · Unit 10 · Lesson 6 — Measurement — A Cumulative Review (M1 M2 M3, EXT)
 * Assignment questions 1–29 (u10_L06.tex) and the Lesson 6 Extra Practice (u10_EP06.tex, Parts A–G).
 * Every part is a generator: it keeps the idea and difficulty of the booklet question (the booklet's numbers are one
 * of the possible versions) and changes the numbers. Rounded answers use K.P.near (js/geom.js) with targeted
 * alternatives for the classic slips (diameter as radius, slant vs perpendicular height, the ⅓, the hemisphere's flat
 * base, square/cubic unit factors, rounding too early, …). Instrument readings (vernier caliper, micrometer) are drawn
 * as static SVG to the booklet's true geometry (\vernierScale, \microScale), ported from the teaching site's u10l1.
 * Outcomes: M1 instruments/referents, M2 conversions, M3 surface area and volume, EXT micro/mega prefixes.
 * Levels: LIM BEG EMG PRG ADV MAS. */
(function (root) {
  'use strict';
  var HW = root.HW, K = HW.kit, B = K.P, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form, F = HW.fmt;
  var PI = Math.PI, M3FT = 1 / Math.pow(0.3048, 3);   // 1 m³ in ft³ (built from 1 ft = 0.3048 m)

  var CODES = {
    'diam-radius': 'Used the diameter as the radius', 'radius-diam': 'Gave the radius instead of the diameter', 'slant-for-h': 'Used the slant height where the perpendicular height belongs',
    'h-for-slant': 'Used the perpendicular height where the slant height belongs', 'no-third': 'Forgot the ⅓ (pyramid/cone volume)', 'no-half': 'Forgot a ½ (triangle or half-solid)',
    'hemi-base': 'Counted the hemisphere’s flat base when it doesn’t belong', 'hemi-nobase': 'Left out the hemisphere’s flat base', 'sphere-for-hemi': 'Used the whole sphere for a hemisphere',
    'extra-face': 'Counted a face that isn’t there (open end / hidden / joined)', 'missing-face': 'Left out a face', 'lin-factor': 'Used a linear unit factor for area or volume',
    'sq-factor': 'Used the squared factor for a volume', 'conv-dir': 'Converted in the wrong direction', 'conv-step': 'A unit conversion step missing or wrong',
    'early-round': 'Rounded an intermediate value too early', 'whole-up': 'Rounded a count down when it must go up', 'whole-down': 'Rounded a count up when it must go down',
    'currency': 'Currency conversion missing or reversed', 'per-rate': 'Rate applied wrongly (per 10 L, per truck, …)', 'pct-base': 'Percent error divided by the wrong value',
    'not-pct': 'Gave a decimal instead of a percent', 'no-root': 'Forgot to take the root when solving for a length', 'wrong-root': 'Square root / cube root mix-up',
    'formula': 'Used the formula for a different solid', 'vol-sa': 'Mixed up surface area and volume', 'read-coarse': 'Misread the coarse (main / sleeve) scale',
    'read-half': 'Missed (or invented) the half-millimetre mark', 'read-fine': 'Misread the fine (vernier / thimble) scale', 'read-hundredths': 'Read vernier divisions as 0.01 mm',
    'neighbour': 'Read the vernier mark next to the one that lines up', 'scale-k': 'Used k instead of k² or k³ when scaling', 'add-errors': 'Added error factors that multiply',
    'double-err': 'Doubled an error that should be squared', 'lateral-only': 'Gave only the curved surface when the whole surface was asked', 'total-for-lateral': 'Included the base(s) when only the curved surface was asked',
    'units': 'Answer in the wrong unit', 'whole': 'Gave a fraction of an object (count must be whole)', 'unit-yd': 'Used the wrong number of inches/feet in a yard',
    'ratio-flip': 'Ratio or factor upside down', 'not-sum': 'Added lengths instead of multiplying them', 'same-claim': 'Repeated the student’s (wrong) value',
    'no-sq': 'Divided an area by a length (tile not squared)', 'unit-size': 'Chose a unit of the wrong size', 'instrument': 'Chose an unsuitable instrument', 'count': 'Miscounted the false statements',
    'missing-part': 'Left out part of the referent count', 'compare-sys': 'Compared metric and imperial sizes wrongly', 'compare': 'Picked the more expensive option', 'none': 'Chose “none of the above” wrongly',
    'reason': 'Chose a reason that doesn’t hold', 'claim': 'Accepted a false claim'
  };
  HW.addCodes(CODES); (function () { var m = {}; Object.keys(CODES).forEach(function (k) { m['mc-' + k] = 'MC: ' + CODES[k]; }); HW.addCodes(m); })();

  /* ---------------- numbers ---------------- */
  function rnd(x, dp) { return K.roundTo(x, dp); }
  function fx(x, dp) { return F(rnd(x, dp).toFixed(dp)); }                // rounded, TeX (thin spaces)
  function kx(x, dp) { return rnd(x, dp).toFixed(dp); }                   // rounded, plain key
  function dots(x, n) { var s = (+x).toFixed(n == null ? 4 : n); return F(s) + '\\ldots'; }   // a carried value
  function num(x) { var s = String(+(+x).toPrecision(12)); return F(s); } // exact-ish decimal for TeX
  function plain(x) { return String(+(+x).toPrecision(12)); }
  function cm2(u) { return '\\text{ ' + u + '}^{2}'; }
  function cu(u) { return '\\text{ ' + u + '}^{3}'; }
  function un(u) { return '\\text{ ' + u + '}'; }
  function pick(r, a) { return r.pick(a); }
  function step(r, lo, hi, st) { var n = Math.round((hi - lo) / st); return +(lo + st * r.int(0, n)).toFixed(6); }
  function frac(x) { return x - Math.floor(x); }
  function piT(c) { return (c === 1 ? '' : num(c)) + '\\pi'; }
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var c = a % b; a = b; b = c; } return a; }

  /* ---------------- checkers ---------------- */
  /* run fn(value) first (format nudges / special diagnoses); fall back to the normal checker */
  function pre(check, fn) { return function (resp) { var p = HW.parse.number(resp); if (p.ok) { var h = fn(p.value); if (h) return h; } return check(resp); }; }
  /* a value that is exact (any number of decimals accepted when it equals x) or else rounded to dp */
  function nearX(x, dp, opt) { var c = K.near(x, dp, opt); return function (resp) { var p = HW.parse.number(resp); if (p.ok && Math.abs(p.value - x) < 1e-9) return ok(); return c(resp); }; }
  /* a whole-number count: n = the right count, q = the exact quotient, dir 'up' (need enough) or 'down' (whole ones only) */
  function countCheck(n, q, dir, diag) {
    return function (resp) {
      var p = HW.parse.number(resp);
      if (!p.ok) return form(p.code === 'empty' ? 'empty' : 'notnumber', p.code === 'empty' ? 'Type your answer first.' : 'Enter a single whole number.');
      var v = p.value;
      if (v === n) return ok();
      if (!Number.isInteger(v) && Math.abs(v - q) < Math.max(0.02, q * 0.02)) return form('whole', 'That’s the exact quotient — now decide how many <b>whole</b> ones that means (' + (dir === 'up' ? 'a part-load still needs a whole one' : 'only complete ones count') + ').');
      if (dir === 'up' && v === Math.floor(q)) return wrong('whole-up', t(v) + ' would not be enough: ' + t(num(rnd(q, 3)) ) + ' means a little more than ' + t(v) + ', so you need one more.');
      if (dir === 'down' && v === Math.ceil(q)) return wrong('whole-down', 'Only complete ones count: ' + t(num(rnd(q, 3))) + ' means ' + t(Math.floor(q)) + ' whole ones and part of another.');
      var h = diag ? diag(v) : null; if (h) return wrong(h.code || 'diag', h.hint);
      return wrong('value', null);
    };
  }
  function exactNum(x, diag) { return K.number(x, diag ? function (v) { return diag(v); } : null); }
  /* K.near alts -> also used as `bad` answers in the tests */
  function badOf(x, dp, alts) { var key = kx(x, dp), out = []; (alts || []).forEach(function (a) { if (isFinite(a.v) && a.v > -1e12 && a.v < 1e12) { var s = kx(a.v, dp); if (s !== key && out.indexOf(s) < 0) out.push(s); } }); return out; }

  /* ---------------- part builders ---------------- */
  /* a rounded answer with a unit after the box */
  function near(prompt, x, dp, unit, alts, sol, hints, text, opt) {
    opt = opt || {};
    var p = B.near(prompt, x, dp, { unit: unit, alts: alts || [], nr: opt.nr, before: opt.before }, sol, hints, text);
    if (opt.before) p.answer = opt.before + t(fx(x, dp)) + (unit ? ' ' + unit : '');
    if (opt.exact) p.check = nearX(x, dp, { alts: alts || [], nr: opt.nr });
    if (opt.pre) p.check = pre(p.check, opt.pre);
    p.bad = badOf(x, dp, alts);
    if (opt.nr) p.bad = p.bad.filter(function (s) { return s.length <= 4; });
    if (opt.good) p.good = opt.good;
    return p;
  }
  /* a numerical-response integer (4 boxes) */
  function nrInt(prompt, n, diag, sol, hints, text, unit) {
    var p = B.nr(prompt, n, diag, sol, hints, text);
    if (unit) { p.input.after = unit; p.answer = t(n) + ' ' + unit; }
    return p;
  }
  /* several boxes. rows: [{ label, after, x, dp, alts, exact, check, key, show }] */
  function fields(prompt, rows, sol, hints, text) {
    var fl = rows.map(function (rw) { return { label: rw.label, after: rw.after }; });
    var checks = rows.map(function (rw) { return rw.check || (rw.exact ? nearX(rw.x, rw.dp, { alts: rw.alts || [] }) : K.near(rw.x, rw.dp, { alts: rw.alts || [] })); });
    var keys = rows.map(function (rw) { return rw.key != null ? String(rw.key) : rw.exact ? plain(rw.x) : kx(rw.x, rw.dp); });
    var ans = rows.map(function (rw, i) { return rw.label + ' ' + (rw.show || t(rw.key != null ? F(String(rw.key)) : rw.exact ? num(rw.x) : fx(rw.x, rw.dp))) + (rw.after ? ' ' + rw.after : ''); }).join('<br>');
    var p = B.fields(prompt, fl, checks, keys, ans, sol, hints, text);
    // wrong versions for the tests: each row's first alternative in turn
    var bad = [];
    rows.forEach(function (rw, i) {
      if (rw.check || !rw.alts) return;
      var bs = badOf(rw.x, rw.dp, rw.alts);
      if (bs.length) { var b = keys.slice(); b[i] = bs[0]; bad.push(b); }
    });
    p.bad = bad;
    return p;
  }
  /* multiple choice from {html, right, why, code}; checks the options are distinct */
  function mc(r, prompt, opts, sol, hints, text, keepOrder) {
    var seen = {};
    opts.forEach(function (o) { if (seen[o.html]) throw new Error('duplicate MC option ' + o.html); seen[o.html] = 1; });
    if (opts.filter(function (o) { return o.right; }).length !== 1) throw new Error('MC needs one right option');
    return B.mc(r, prompt, opts, sol, hints, text, keepOrder);
  }
  /* numeric MC: right value + wrong values (dropping any that print the same as one already used) */
  function mcVals(r, prompt, right, wrongs, fmt, sol, hints, text, opt) {
    opt = opt || {};
    var opts = [{ html: fmt(right), right: true }], used = {}; used[fmt(right)] = 1;
    wrongs.forEach(function (w) { var h = fmt(w.v); if (used[h] || opts.length >= 4) return; used[h] = 1; opts.push({ html: h, why: w.why, code: w.code }); });
    if (opts.length < 4) throw new Error('not enough distinct MC options for ' + text);
    if (opt.sort) opts.sort(function (a, b) { return opt.sort(a, b); });
    return mc(r, prompt, opts, sol, hints, text, !!opt.sort);
  }
  function ul(items) { return items.join('<br>'); }

  /* ---------------- SVG drawing (style of js/geom.js) ---------------- */
  var INK = '#2b3340', COL = '#13807a', SOFT = '#f4faf9', RED = '#b3261e', GRY = '#6a7182', BLU = '#2d5fa8';
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function f1(v) { return (+v).toFixed(1); }
  function svg(w, h, body, maxw, aria, style) { return '<svg class="fig-svg" viewBox="0 0 ' + Math.round(w) + ' ' + Math.round(h) + '" width="100%" style="max-width:' + Math.round(maxw || w) + 'px' + (style ? ';' + style : '') + '" role="img" aria-label="' + esc(aria || 'figure') + '">' + body + '</svg>'; }
  function ln(a, b, o) { o = o || {}; return '<line x1="' + f1(a[0]) + '" y1="' + f1(a[1]) + '" x2="' + f1(b[0]) + '" y2="' + f1(b[1]) + '" stroke="' + (o.c || INK) + '" stroke-width="' + (o.w || 2) + '"' + (o.dash ? ' stroke-dasharray="' + (o.dash === true ? '5 4' : o.dash) + '"' : '') + ' stroke-linecap="round"/>'; }
  function pg(pts, o) { o = o || {}; return '<polygon points="' + pts.map(function (p) { return f1(p[0]) + ',' + f1(p[1]); }).join(' ') + '" fill="' + (o.fill || 'none') + '" stroke="' + (o.c || (o.noStroke ? 'none' : INK)) + '" stroke-width="' + (o.w || 2) + '"' + (o.dash ? ' stroke-dasharray="5 4"' : '') + ' stroke-linejoin="round"/>'; }
  function path(d, o) { o = o || {}; return '<path d="' + d + '" fill="' + (o.fill || 'none') + '" stroke="' + (o.c || INK) + '" stroke-width="' + (o.w || 2) + '"' + (o.dash ? ' stroke-dasharray="5 4"' : '') + ' stroke-linejoin="round"/>'; }
  function tx(x, y, s, o) {
    o = o || {}; var it = /^[A-Za-zθ]$/.test(String(s)) ? ' font-style="italic"' : '';
    return '<text x="' + f1(x) + '" y="' + f1(y) + '" font-size="' + (o.size || 13) + '" text-anchor="' + (o.a || 'middle') + '" dominant-baseline="central" fill="' + (o.c || INK) + '"' + it + (o.b ? ' font-weight="700"' : '') + (o.halo === false ? '' : ' paint-order="stroke" stroke="#fff" stroke-width="3" stroke-linejoin="round"') + '>' + esc(s).replace(/(\d)-(\d)/g, '$1−$2') + '</text>';
  }
  function arrowH(x1, x2, y, lab, o) { // dimension line with arrowheads and a label underneath (o.above puts it on top)
    o = o || {}; var a = 6, s = ln([x1, y], [x2, y], { w: 1.3 }) + path('M' + f1(x1 + a) + ' ' + f1(y - a * 0.6) + ' L' + f1(x1) + ' ' + f1(y) + ' L' + f1(x1 + a) + ' ' + f1(y + a * 0.6), { w: 1.3 }) + path('M' + f1(x2 - a) + ' ' + f1(y - a * 0.6) + ' L' + f1(x2) + ' ' + f1(y) + ' L' + f1(x2 - a) + ' ' + f1(y + a * 0.6), { w: 1.3 });
    return s + (lab ? tx((x1 + x2) / 2, y + (o.above ? -11 : 12), lab) : '');
  }
  function arrowV(x, y1, y2, lab, o) {
    o = o || {}; var a = 6, s = ln([x, y1], [x, y2], { w: 1.3 }) + path('M' + f1(x - a * 0.6) + ' ' + f1(y1 + a) + ' L' + f1(x) + ' ' + f1(y1) + ' L' + f1(x + a * 0.6) + ' ' + f1(y1 + a), { w: 1.3 }) + path('M' + f1(x - a * 0.6) + ' ' + f1(y2 - a) + ' L' + f1(x) + ' ' + f1(y2) + ' L' + f1(x + a * 0.6) + ' ' + f1(y2 - a), { w: 1.3 });
    return s + (lab ? tx(x + (o.left ? -7 : 7), (y1 + y2) / 2, lab, { a: o.left ? 'end' : 'start' }) : '');
  }
  function halfEll(cx, cy, rx, ry, front, o) { // front (lower) or back (upper) half of a horizontal ellipse
    o = o || {}; return path('M' + f1(cx - rx) + ' ' + f1(cy) + ' A' + f1(rx) + ' ' + f1(ry) + ' 0 0 ' + (front ? 0 : 1) + ' ' + f1(cx + rx) + ' ' + f1(cy), o);
  }
  function row(svgs) { return '<div style="display:flex;flex-wrap:wrap;gap:6px 14px;justify-content:center;align-items:flex-end">' + svgs.map(function (s) { return '<div style="flex:1 1 140px;max-width:240px">' + s + '</div>'; }).join('') + '</div>'; }
  function figWrap(s) { return '<div class="u10l6-fig">' + s + '</div>'; }

  /* ---- vernier caliper scale (booklet \vernierScale{M}{N}: main mm scale; 20 vernier divisions of 0.95 mm; reading M + 0.05N).
   * Drawn at 24 px per mm so the alignment shows; on a phone the figure scrolls sideways. ---- */
  function vernierSVG(M, N) {
    var s = 24, lo = M - 3, hi = M + 21, pad = 18, W = (hi - lo) * s + 2 * pad, y0 = 70, H = 150, R = M + 0.05 * N;
    var X = function (mm) { return pad + (mm - lo) * s; }, b = '';
    b += '<rect x="4" y="30" width="' + (W - 8) + '" height="' + (y0 - 30) + '" fill="#f1f3f6" stroke="#a9b0bb" stroke-width="1"/>';
    for (var m = lo; m <= hi; m++) { var big = m % 5 === 0; b += ln([X(m), y0], [X(m), y0 - (big ? 20 : 11)], { w: big ? 1.6 : 1.1 }); if (big) b += tx(X(m), y0 - 30, String(m), { size: 13 }); }
    b += tx(W / 2, 14, 'Main scale (mm)', { size: 13, b: true });
    var xz = X(R), xe = xz + 19 * 0.95 * s, pl = Math.max(4, xz - 1.55 * s), pr = Math.min(W - 4, xe + 0.74 * s);
    b += '<rect x="' + f1(pl) + '" y="' + y0 + '" width="' + f1(pr - pl) + '" height="44" fill="#e3e7ec" stroke="#a9b0bb" stroke-width="1"/>';
    for (var n = 0; n <= 20; n++) { var x = xz + 0.95 * n * s, bg = n % 5 === 0; b += ln([x, y0], [x, y0 + (bg ? 20 : 11)], { w: n === 0 ? 2.4 : bg ? 1.6 : 1.1, c: n === 0 ? RED : INK }); if (bg) b += tx(x, y0 + 30, String(n), { size: 13 }); }
    b += tx(xz - 8, y0 + 34, 'index', { size: 12, a: 'end', c: RED });
    b += tx((xz + xe) / 2, H - 14, 'Vernier scale: 0.05 mm per division', { size: 13, b: true });
    return '<div class="u10l6-scroll" style="overflow-x:auto;-webkit-overflow-scrolling:touch;margin:6px 0">' + svg(W, H, b, W, 'vernier caliper scale', 'min-width:560px') + '</div><div class="small muted" style="font-size:12px">On a narrow screen, scroll the scale sideways (or zoom in) to see every mark.</div>';
  }
  /* ---- micrometer (booklet \microScale{half}{fine}: reading half×0.5 + fine×0.01 mm; whole-mm marks above the index line,
   * half-mm marks below; the thimble edge sits at the reading) ---- */
  function microSVG(half, fine) {
    var k = 50, Rm = half * 0.5 + fine * 0.01, mlo = Math.max(0, Math.floor(Rm) - 6), mE = (Rm - mlo) * 0.55;
    var X = function (x) { return (x + 0.6) * k; }, Y = function (y) { return (1.55 - y) * k; }, b = '';
    var W = X(mE + 3.15), H = Y(-2.25);
    b += '<rect x="' + f1(X(-0.45)) + '" y="' + f1(Y(0.86)) + '" width="' + f1(X(mE) - X(-0.45)) + '" height="' + f1(1.48 * k) + '" fill="#eef1f4" stroke="#a9b0bb" stroke-width="1"/>';
    for (var kk = 2 * mlo; kk <= half; kk++) {
      var x = X((kk * 0.5 - mlo) * 0.55);
      if (kk % 2) b += ln([x, Y(-0.03)], [x, Y(-0.26)], { w: 1.4 });
      else if ((kk / 2) % 5 === 0) b += ln([x, Y(0.03)], [x, Y(0.48)], { w: 2 }) + tx(x, Y(0.48) - 10, String(kk / 2), { size: 13 });
      else b += ln([x, Y(0.03)], [x, Y(0.30)], { w: 1.4 });
    }
    b += ln([X(-0.38), Y(0)], [X(mE), Y(0)], { w: 1.8 });
    b += '<rect x="' + f1(X(mE)) + '" y="' + f1(Y(1.35)) + '" width="' + f1(2.95 * k) + '" height="' + f1(2.7 * k) + '" fill="#d9dee5" stroke="#a9b0bb" stroke-width="1"/>';
    b += ln([X(mE), Y(1.35)], [X(mE), Y(-1.35)], { w: 2.4 });
    for (var d = -6; d <= 6; d++) {
      var yy = Y(-d * 0.22), tv = ((fine + d) % 50 + 50) % 50, maj = tv % 5 === 0;
      b += ln([X(mE + 0.12), yy], [X(mE + (maj ? 0.72 : 0.5)), yy], { w: maj ? 1.8 : 1.2 });
      if (maj) b += tx(X(mE + 0.8), yy, String(tv), { size: 12, a: 'start', halo: false });
    }
    b += ln([X(mE + 1.55), Y(0)], [X(mE + 3.0), Y(0)], { w: 1.6, c: RED, dash: '4 4' }) + tx(X(mE + 2.93), Y(0) - 11, 'index line', { size: 12, a: 'end', c: RED });
    b += tx(W / 2, Y(-1.68), 'Sleeve: a mark every 0.5 mm', { size: 13, b: true }) + tx(W / 2, Y(-2.04), 'Thimble: 0.01 mm per division', { size: 13, b: true });
    return svg(W, H, b, 430, 'micrometer');
  }

  /* ---- solids not covered by HW.solid ---- */
  function triPyramidSVG(side, ht) {
    var FL = [40, 170], FR = [150, 185], BK = [175, 135], C = [122, 163], A = [122, 30], b = '';
    b += pg([A, FL, FR], { fill: SOFT, noStroke: true }) + pg([A, FR, BK], { fill: '#e9f4f2', noStroke: true });
    b += ln(FL, FR) + ln(FR, BK) + ln(FL, BK, { dash: true, w: 1.4 }) + ln(A, FL) + ln(A, FR) + ln(A, BK) + ln(A, C, { dash: '2 3', w: 1.4 });
    b += ln([A[0], A[1]], [215, 30], { dash: '2 3', w: 1 }) + ln([C[0] + 6, C[1]], [215, C[1]], { dash: '2 3', w: 1 }) + arrowV(208, 30, C[1], ht);
    b += tx((FL[0] + FR[0]) / 2 - 4, (FL[1] + FR[1]) / 2 + 14, side);
    return svg(270, 205, b, 250, 'triangular pyramid');
  }
  function triPrismSVG(a, bb, c, L) { // right-triangle prism: legs a (bottom) and b (left), hypotenuse c, length L
    var A = [62, 165], Bp = [132, 165], C = [62, 72], dx = 95, dy = -45, A2 = [A[0] + dx, A[1] + dy], B2 = [Bp[0] + dx, Bp[1] + dy], C2 = [C[0] + dx, C[1] + dy], s = '';
    s += pg([A, Bp, C], { fill: SOFT }) + ln(Bp, B2) + ln(C, C2) + ln(B2, C2) + ln(A, A2, { dash: true, w: 1.4 }) + ln(A2, B2, { dash: true, w: 1.4 }) + ln(A2, C2, { dash: true, w: 1.4 });
    s += path('M62 154 L73 154 L73 165', { w: 1.2 });
    s += tx(97, 180, a) + tx(56, 118, bb, { a: 'end' }) + tx(102, 112, c, { a: 'start' }) + tx(182, 147, L, { a: 'start' });
    return svg(272, 195, s, 260, 'triangular prism');
  }
  function cupSVG(dl, hl) { // cone-shaped cup: wide end up
    var cx = 110, top = 45, rx = 62, ry = 16, tip = 170, s = '';
    s += pg([[cx - rx, top], [cx + rx, top], [cx, tip]], { fill: SOFT, noStroke: true }) + '<ellipse cx="' + cx + '" cy="' + top + '" rx="' + rx + '" ry="' + ry + '" fill="#fff" stroke="' + INK + '" stroke-width="2"/>';
    s += ln([cx - rx, top], [cx, tip]) + ln([cx + rx, top], [cx, tip]) + ln([cx, top], [cx, tip], { dash: true, w: 1.3 }) + arrowV(cx + rx + 14, top, tip, hl);
    s += arrowH(cx - rx, cx + rx, top - ry - 10, dl, { above: true });
    return svg(250, 185, s, 230, 'cone-shaped cup');
  }
  function funnelCone(rl, hl) { return HW.solid('cone', { r: rl, h: hl, width: 220 }); }

  /* bread oven: plinth (W wide, D deep, H high) with a half-cylinder chamber of diameter d on top, running the full depth */
  function ovenSVG(W, D, H, d, labs) {
    var sc = 120, x0 = 62, yb = 215, w = W * sc, h = H * sc, dx = D * sc * 0.42, dy = -D * sc * 0.3, r = d / 2 * sc, s = '';
    var FL = [x0, yb], FR = [x0 + w, yb], TR = [x0 + w, yb - h], TL = [x0, yb - h], TR2 = [TR[0] + dx, TR[1] + dy], FR2 = [FR[0] + dx, FR[1] + dy], TL2 = [TL[0] + dx, TL[1] + dy];
    var cx = x0 + w / 2, cy = yb - h, cx2 = cx + dx, cy2 = cy + dy, vL = Math.hypot(dx, dy), nx = dy / vL, ny = -dx / vL; if (ny > 0) { nx = -nx; ny = -ny; }
    s += pg([FL, FR, TR, TL], { fill: '#eef1f4' }) + pg([FR, FR2, TR2, TR], { fill: '#e2e6eb' }) + pg([TL, TR, TR2, TL2], { fill: '#f4f6f8' });
    // chamber: back semicircle, tangent lines, front semicircle
    s += path('M' + f1(cx2 - r) + ' ' + f1(cy2) + ' A' + f1(r) + ' ' + f1(r) + ' 0 0 1 ' + f1(cx2 + r) + ' ' + f1(cy2), { fill: '#f6efe4' });
    s += pg([[cx + nx * r, cy + ny * r], [cx2 + nx * r, cy2 + ny * r], [cx2 + r, cy2], [cx + r, cy]], { fill: '#f6efe4', noStroke: true });
    s += ln([cx + nx * r, cy + ny * r], [cx2 + nx * r, cy2 + ny * r]) + ln([cx + r, cy], [cx2 + r, cy2]);
    s += path('M' + f1(cx - r) + ' ' + f1(cy) + ' A' + f1(r) + ' ' + f1(r) + ' 0 0 1 ' + f1(cx + r) + ' ' + f1(cy) + ' Z', { fill: '#fbf5ec' });
    s += ln([cx - r, cy], [cx + r, cy], { c: RED, dash: '5 3', w: 2.2 });
    s += arrowH(cx - r, cx + r, cy + 14, null) + tx(cx, cy + 27, labs.d);
    s += tx((FL[0] + FR[0]) / 2, yb + 14, labs.W) + tx(FR[0] + dx / 2 + 8, (FR[1] + FR2[1]) / 2 + 10, labs.D, { a: 'start' }) + tx(x0 - 6, yb - h / 2, labs.H, { a: 'end' });
    return svg(x0 + w + dx + 70, yb + 28, s, 330, 'bread oven');
  }
  /* a block (L long, W wide, H high) with a semicircular groove of diameter d along the top */
  function grooveSVG(L, W, H, d, labs) {
    var sc = 13, x0 = 60, yb = 170, w = W * sc, h = H * sc, dx = L * sc * 0.42, dy = -L * sc * 0.3, r = d / 2 * sc, cx = x0 + w / 2, top = yb - h, s = '';
    var FL = [x0, yb], FR = [x0 + w, yb], TR = [x0 + w, top], TL = [x0, top];
    s += pg([FR, [FR[0] + dx, FR[1] + dy], [TR[0] + dx, TR[1] + dy], TR], { fill: '#e2e6eb' });
    s += pg([TL, [cx - r, top], [cx - r + dx, top + dy], [TL[0] + dx, TL[1] + dy]], { fill: '#f4f6f8' }) + pg([[cx + r, top], TR, [TR[0] + dx, TR[1] + dy], [cx + r + dx, top + dy]], { fill: '#f4f6f8' });
    s += path('M' + f1(cx - r + dx) + ' ' + f1(top + dy) + ' A' + f1(r) + ' ' + f1(r) + ' 0 0 0 ' + f1(cx + r + dx) + ' ' + f1(top + dy), { dash: true, w: 1.3 });
    s += ln([cx - r, top], [cx - r + dx, top + dy], { w: 1.4 }) + ln([cx + r, top], [cx + r + dx, top + dy], { w: 1.4 }) + ln([cx, top + r], [cx + dx, top + r + dy], { w: 1.2, dash: '2 3' });
    s += path('M' + f1(FL[0]) + ' ' + f1(FL[1]) + ' L' + f1(FR[0]) + ' ' + f1(FR[1]) + ' L' + f1(TR[0]) + ' ' + f1(TR[1]) + ' L' + f1(cx + r) + ' ' + f1(top) + ' A' + f1(r) + ' ' + f1(r) + ' 0 0 1 ' + f1(cx - r) + ' ' + f1(top) + ' L' + f1(TL[0]) + ' ' + f1(TL[1]) + ' Z', { fill: '#eef1f4' });
    s += tx(cx, yb + 14, labs.W) + tx(x0 - 6, yb - h / 2, labs.H, { a: 'end' }) + tx(FR[0] + dx / 2 + 8, (FR[1] + FR[1] + dy) / 2 + 10, labs.L, { a: 'start' }) + tx(cx, top - 12, labs.d);
    return svg(x0 + w + dx + 70, yb + 26, s, 320, 'grooved block');
  }
  /* spinning top: hemisphere (dome up) on a cone pointing down */
  function topSVG(dl, hl) {
    var cx = 110, cy = 80, r = 60, tip = 210, s = '';
    s += path('M' + (cx - r) + ' ' + cy + ' A' + r + ' ' + r + ' 0 0 1 ' + (cx + r) + ' ' + cy + ' Z', { fill: SOFT, c: 'none' }) + pg([[cx - r, cy], [cx + r, cy], [cx, tip]], { fill: '#e9f4f2', noStroke: true });
    s += path('M' + (cx - r) + ' ' + cy + ' A' + r + ' ' + r + ' 0 0 1 ' + (cx + r) + ' ' + cy) + ln([cx - r, cy], [cx, tip]) + ln([cx + r, cy], [cx, tip]);
    s += halfEll(cx, cy, r, 13, true, { w: 1.5, dash: true }) + halfEll(cx, cy, r, 13, false, { w: 1.5, dash: true });
    s += ln([cx, cy], [cx, tip], { dash: '2 3', w: 1.3 }) + tx(cx + 6, (cy + tip) / 2 + 12, hl, { a: 'start' }) + arrowH(cx - r, cx + r, cy + 24, null) + tx(cx, cy + 37, dl);
    return svg(230, 222, s, 210, 'spinning top');
  }
  /* square frustum (base side b, top side a, height h) */
  function frustumSVG(bl, al, hl) {
    var b0 = [40, 190], b1 = [190, 190], b2 = [240, 150], b3 = [90, 150], c = [140, 170], t0 = [102.5, 95], t1 = [177.5, 95], t2 = [202.5, 75], t3 = [127.5, 75], ct = [152.5, 85], s = '';
    s += pg([b0, b1, t1, t0], { fill: SOFT, noStroke: true }) + pg([b1, b2, t2, t1], { fill: '#e9f4f2', noStroke: true }) + pg([t0, t1, t2, t3], { fill: '#f7fbfa' });
    s += ln(b0, b1) + ln(b1, b2) + ln(b2, b3, { dash: true, w: 1.3 }) + ln(b3, b0, { dash: true, w: 1.3 }) + ln(b0, t0) + ln(b1, t1) + ln(b2, t2) + ln(b3, t3, { dash: true, w: 1.3 });
    s += ln(ct, c, { dash: '2 3', w: 1.3 }) + tx(ct[0] + 6, 130, hl, { a: 'start' }) + tx(115, 205, bl) + tx(152, 62, al, { size: 12 });
    return svg(260, 215, s, 260, 'frustum of a square pyramid');
  }
  /* cylinder topped by a cone (flue) — two HW.solid figures side by side are clearer than one composite */
  function containers(V) { return row([HW.solid('cylinder', { r: 'r', h: 'h = 2r', width: 160 }), HW.solid('cube', { s: 'a', width: 160 }), HW.solid('sphere', { r: 'r', width: 160 })]) + '<div class="small muted" style="text-align:center">A: cylinder (h = 2r) &nbsp;·&nbsp; B: cube &nbsp;·&nbsp; C: sphere — each holds ' + t(F(V) + '\\text{ cm}^{3}') + '</div>'; }

  /* ---------------- small helpers for the assignment ---------------- */
  function dec(x) { var s = (+x).toFixed(12).replace(/0+$/, '').replace(/\.$/, ''); return s; }   // exact-looking decimal string
  function decT(x) { return F(dec(x)); }
  function mixT(p, q) { // p/q as a mixed number (TeX)
    var g = gcd(p, q); p /= g; q /= g; var w = Math.floor(p / q), r = p - w * q;
    return r === 0 ? String(w) : (w ? w : '') + '\\tfrac{' + r + '}{' + q + '}';
  }
  function frT(f) { return '\\tfrac{' + f[0] + '}{' + f[1] + '}'; }
  var WORDS = ['zero', 'one', 'two', 'three', 'four'];
  function countFalseMC(r, stmts, prompt, extNote) {   // stmts: [{tex, truth, why}] (4 of them)
    var k = stmts.filter(function (s) { return !s.truth; }).length;
    var pool = [0, 1, 2, 3, 4].filter(function (v) { return v !== k; }), others = r.sample(pool, 3), vals = others.concat([k]).sort(function (a, b) { return a - b; });
    var opts = vals.map(function (v) { return { html: WORDS[v], right: v === k, code: 'count', why: v === 4 - k ? 'That’s how many are <b>true</b>. The question asks how many are false.' : 'Check each statement again: a smaller unit always takes a <b>bigger</b> number.' }; });
    var list = stmts.map(function (s, i) { return 'Statement ' + (i + 1) + ': ' + t(s.tex); }).join('<br>');
    return mc(r, list + '<br>' + prompt, opts, stmts.map(function (s, i) { return 'Statement ' + (i + 1) + ': ' + t(s.tex) + ' — <b>' + (s.truth ? 'true' : 'false') + '</b>. ' + s.why; }).join('<br>') + '<br>So <b>' + WORDS[k] + '</b> of the statements ' + (k === 1 ? 'is' : 'are') + ' false.',
      ['Rewrite each statement with the prefix ladder: kilo ' + t('10^{3}') + ', centi ' + t('10^{-2}') + ', milli ' + t('10^{-3}') + (extNote ? ', micro ' + t('10^{-6}') + ', nano ' + t('10^{-9}') + ', mega ' + t('10^{6}') : '') + '.', 'Going to a smaller unit gives a bigger number.'], 'how many false (metric)', true);
  }
  // metric statements: [true tex, false tex, why]
  var MET = [
    ['1\\text{ mm}=0.1\\text{ cm}', '1\\text{ mm}=0.01\\text{ cm}', 'There are 10 mm in 1 cm, so 1 mm is ' + t('\\tfrac{1}{10}') + ' cm.'],
    ['1\\text{ m}=100\\text{ cm}', '1\\text{ m}=10\\text{ cm}', 'Centi means one hundredth, so 1 m = 100 cm.'],
    ['1\\text{ km}=100\\,000\\text{ cm}', '1\\text{ km}=10\\,000\\text{ cm}', '1 km = 1000 m and 1 m = 100 cm, so 1 km = 100 000 cm.'],
    ['1\\text{ cm}=10\\text{ mm}', '1\\text{ cm}=0.01\\text{ mm}', 'A centimetre is the larger unit: 1 cm = 10 mm.'],
    ['1\\text{ m}=1000\\text{ mm}', '1\\text{ m}=100\\text{ mm}', 'Milli means one thousandth: 1 m = 1000 mm.'],
    ['1\\text{ km}=1000\\text{ m}', '1\\text{ km}=100\\text{ m}', 'Kilo means 1000.'],
    ['1\\text{ cm}=0.01\\text{ m}', '1\\text{ cm}=0.1\\text{ m}', '1 cm is one hundredth of a metre.'],
    ['1\\text{ mm}=0.001\\text{ m}', '1\\text{ mm}=0.01\\text{ m}', '1 mm is one thousandth of a metre.'],
    ['1\\text{ m}=0.001\\text{ km}', '1\\text{ m}=1000\\text{ km}', 'A metre is much smaller than a kilometre: 1 m = 0.001 km.']];
  var MICRO = [
    ['1\\ \\mu\\text{m}=1000\\text{ nm}', '1\\ \\mu\\text{m}=100\\text{ nm}', 'Micro is ' + t('10^{-6}') + ' and nano is ' + t('10^{-9}') + ': a factor of 1000.'],
    ['1\\text{ mm}=1000\\ \\mu\\text{m}', '1\\text{ mm}=100\\ \\mu\\text{m}', 'Milli ' + t('10^{-3}') + ' to micro ' + t('10^{-6}') + ' is a factor of 1000.'],
    ['1\\text{ Mm}=1000\\text{ km}', '1\\text{ Mm}=0.001\\text{ km}', 'Mega is ' + t('10^{6}') + ' and kilo is ' + t('10^{3}') + ', so 1 Mm = 1000 km.'],
    ['1\\ \\mu\\text{m}=0.001\\text{ mm}', '1\\ \\mu\\text{m}=0.01\\text{ mm}', '1 mm = 1000 μm, so 1 μm = 0.001 mm.'],
    ['1\\text{ nm}=0.001\\ \\mu\\text{m}', '1\\text{ nm}=0.01\\ \\mu\\text{m}', '1 μm = 1000 nm, so 1 nm = 0.001 μm.'],
    ['1\\text{ m}=1\\,000\\,000\\ \\mu\\text{m}', '1\\text{ m}=1000\\ \\mu\\text{m}', 'Micro is ' + t('10^{-6}') + ', so 1 m = 1 000 000 μm.'],
    ['1\\text{ Mm}=1\\,000\\,000\\text{ m}', '1\\text{ Mm}=1000\\text{ m}', 'Mega is ' + t('10^{6}') + '.']];
  function stmtsFrom(r, pool, n, kFalse) {
    var ch = r.sample(pool, n), fs = r.sample([0, 1, 2, 3].slice(0, n), kFalse);
    return ch.map(function (s, i) { var f = fs.indexOf(i) >= 0; return { tex: f ? s[1] : s[0], truth: !f, why: s[2] }; });
  }
  var UNITS_IMP = ['mile', 'yard', 'foot', 'inch'];
  var IMP_OBJ = [['the length of a pencil', 3], ['the width of a smartphone', 3], ['the diameter of a coin', 3], ['the height of a classroom door', 2], ['the length of a car', 2],
    ['the length of a football field', 1], ['the length of a soccer field', 1], ['the distance between two towns', 0], ['the length of a marathon', 0]];
  var INSTR = ['micrometer', 'vernier caliper', 'ruler', 'trundle wheel'];
  var INSTR_OBJ = [['the width of a small keyhole', 1, 'in'], ['the inside diameter of a narrow pipe', 1, 'in'], ['the depth of a small drilled hole', 1, 'in'],
    ['the thickness of a credit card', 0, 'thin'], ['the thickness of a sheet of paper', 0, 'thin'], ['the diameter of a thin wire', 0, 'thin'],
    ['the length of a pencil', 2, 'mid'], ['the width of a textbook', 2, 'mid'], ['the length of a running track', 3, 'long'], ['the perimeter of a school field', 3, 'long']];
  function instrWhy(i, kind) {
    if (i === 0) return kind === 'in' ? 'A micrometer’s flat anvil and spindle measure an <b>outside</b> thickness — they can’t reach into a gap or hole.' : 'A micrometer opens only about 25 mm. This is far too big for it.';
    if (i === 1) return kind === 'thin' ? 'A caliper reads to 0.05 mm, but this is so thin that you want the micrometer’s 0.01 mm.' : 'A caliper’s jaws open only a few centimetres — far too small for this.';
    if (i === 2) return kind === 'long' ? 'You’d have to lay a ruler end to end hundreds of times. Something you walk along is easier.' : 'A ruler reads only to the nearest millimetre — far too coarse for something this small.';
    return 'A trundle wheel is walked along the ground to measure long distances in metres, not small objects.';
  }
  var KEYSETS = [
    { name: 'hex key', met: [3, 4, 5, 6, 7, 8], imp: [[1, 8], [5, 32], [3, 16], [7, 32], [1, 4], [5, 16]] },
    { name: 'wrench', met: [7, 8, 9, 11, 13, 16], imp: [[1, 4], [9, 32], [3, 8], [7, 16], [1, 2], [5, 8]] }];
  function inMM(f) { return f[0] / f[1] * 25.4; }
  function setTex(ks) { return 'metric sizes ' + ks.met.map(function (m) { return t(m + '\\text{ mm}'); }).join(', ') + ' and imperial sizes ' + ks.imp.map(function (f) { return t(frT(f) + '\\text{ in}'); }).join(', '); }
  function nameP(r) { return r.pick(['Dov', 'Zara', 'Mia', 'Kai', 'Priya', 'Devon', 'Lena', 'Omar']); }

  HW.defineLesson({
    id: 'u10l6', unit: 10, num: '6', title: 'Measurement — A Cumulative Review', outcome: 'M3',
    blurb: 'Every skill of the unit together: referents and instruments, SI and imperial conversions, map scales, and surface area and volume of every solid.',
    questions: [
      { num: '1', section: 'Assignment — Multiple choice and numerical response', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '1', level: 'LIM', outcome: 'M1', make: function (r) {
          var ob = r.pick(IMP_OBJ), k = ob[1];
          var opts = UNITS_IMP.map(function (u, i) { return { html: u, right: i === k, code: 'unit-size', why: i === k ? null : 'A ' + u + ' is ' + (i < k ? 'far too big' : 'far too small') + ' for ' + ob[0] + ' — the measurement would be ' + (i < k ? 'an awkward tiny fraction.' : 'an awkwardly huge number.') }; });
          return mc(r, 'Which is the most suitable imperial unit of measurement for ' + ob[0] + '?', opts,
            'Choose the unit that makes the measurement a convenient-sized number. For ' + ob[0] + ', that is the <b>' + UNITS_IMP[k] + '</b>.', ['Picture the object: about how many inches? feet? yards? miles?'], 'imperial unit for ' + ob[0], true);
        } }] },
      { num: '2', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '2', level: 'BEG', outcome: 'M2', make: function (r) {
          var L = r.chance(0.2) ? 124 : r.int(110, 190), W = L === 124 ? 62 : r.int(35, L - 25), D = (L - W) * 10, s = r.int(0, 3);
          var opts = [0, 1, 2, 3].map(function (k) {
            var f = Math.pow(10, k - s), v = D * f, why = null;
            if (f === 0.1) why = 'That’s the difference in <b>centimetres</b>. Each centimetre is 10 mm.';
            else if (f === 0.01) why = 'That is ' + t('\\tfrac{1}{100}') + ' of the answer — it looks like a conversion was skipped. Change both lengths to mm first.';
            else if (f === 0.001) why = 'That’s the difference in <b>metres</b>. Each metre is 1000 mm.';
            else if (f > 1) why = 'Too big: 1 m = 1000 mm and 1 cm = 10 mm. Convert both lengths to mm, then subtract.';
            return { html: t(F(dec(v))), right: k === s, why: why, code: 'conv-step' };
          });
          return mc(r, 'A rectangular photograph measures ' + t(W + '\\text{ cm}') + ' in width and ' + t(dec(L / 100) + '\\text{ m}') + ' in length. The difference between these two measurements, in mm, is', opts,
            'Convert both to millimetres: ' + t(dec(L / 100) + '\\text{ m}=' + F(L * 10) + '\\text{ mm}') + ' and ' + t(W + '\\text{ cm}=' + (W * 10) + '\\text{ mm}') + '.<br>' + t(F(L * 10) + '-' + (W * 10) + '=' + F(D) + '\\text{ mm}') + '.',
            ['Put both lengths in millimetres before you subtract: 1 m = 1000 mm, 1 cm = 10 mm.'], 'difference in mm', true);
        } }] },
      { num: '3', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '3', level: 'BEG', outcome: 'M2', make: function (r) {
          var x = r.pick([0.036, 0.036, 0.048, 0.054, 0.072, 0.29, 0.45, 0.065, 1.8]), ans = x / 1e5;
          return mcVals(r, 'The number of kilometres in ' + t(dec(x) + '\\text{ centimetres}') + ' is', ans, [
            { v: x / 1e7, code: 'conv-step', why: 'Too small. cm → m is ' + t('\\div 100') + ' and m → km is ' + t('\\div 1000') + ': ' + t('\\div 100\\,000') + ' in all.' },
            { v: x / 1e3, code: 'conv-step', why: 'You divided by 1000 (m → km) but skipped cm → m (' + t('\\div 100') + ').' },
            { v: x * 1e5, code: 'conv-dir', why: 'A kilometre is a much <b>bigger</b> unit, so the number must get smaller — divide.' }],
            function (v) { return t(F(dec(v))); },
            t(dec(x) + '\\text{ cm}=' + dec(x / 100) + '\\text{ m}') + ' (' + t('\\div 100') + ') ' + t('=' + dec(ans) + '\\text{ km}') + ' (' + t('\\div 1000') + ').',
            ['Two steps: cm → m (' + t('\\div 100') + '), then m → km (' + t('\\div 1000') + ').'], 'cm to km ' + x);
        } }] },
      { num: '4', stem: '<i>(Multiple Choice)</i> Consider the following four statements.', parts: [
        { id: '4', level: 'BEG', outcome: 'M2', make: function (r) {
          var k = r.pick([0, 1, 1, 2, 3]);
          return countFalseMC(r, stmtsFrom(r, MET, 4, k), 'How many of these statements are false?');
        } }] },
      { num: '5', stem: '<i>(Multiple Choice)</i> The height of horses is often measured in <i>hands</i>.', parts: [
        { id: '5', level: 'EMG', outcome: 'M1', make: function (r) {
          var n, q; do { n = r.int(13, 17); q = r.int(1, 3); } while ((4 * n + q) % 3); if (r.chance(0.25)) { n = 15; q = 3; }
          var inch = 4 * n + q, hT = n + '\\tfrac{' + (q === 2 ? '1}{2' : q + '}{4') + '}';
          var right = { html: t(mixT(inch, 12)) + ' feet', right: true };
          var w = [{ html: t(mixT(4 * n, 12)) + ' feet', code: 'missing-part', why: 'You left out the ' + t(q === 2 ? '\\tfrac12' : '\\tfrac{' + q + '}{4}') + ' hand. Multiply the <b>whole</b> ' + t(hT) + ' by 4 in.' },
            { html: t(dec(inch / 10)) + ' feet', code: 'conv-step', why: 'A foot has 12 inches, not 10. Divide the inches by 12.' },
            { html: t(mixT(inch + 12, 12)) + ' feet', code: 'conv-step', why: 'Check the division: ' + t(inch + '\\div 12') + '.' }];
          var opts = [right].concat(w).filter(function (o, i, a) { return a.map(function (x) { return x.html; }).indexOf(o.html) === i; });
          return mc(r, 'Using the width of an adult hand as a referent for ' + t('4') + ' inches, the height of a horse measuring ' + t(hT) + ' hands is', opts,
            t(hT + '\\times 4=' + inch + '\\text{ in}') + ', then ' + t(inch + '\\text{ in}\\times\\dfrac{1\\text{ ft}}{12\\text{ in}}=' + mixT(inch, 12) + '\\text{ ft}') + '.', ['Each hand is 4 inches. Find the inches first, then change to feet (12 in = 1 ft).'], 'horse ' + hT + ' hands');
        } }] },
      { num: '6', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '6', level: 'EMG', outcome: 'M1', make: function (r) {
          var ob = r.pick(INSTR_OBJ);
          var opts = INSTR.map(function (n, i) { return { html: n, right: i === ob[1], code: 'instrument', why: i === ob[1] ? null : instrWhy(i, ob[2]) }; });
          var why = ob[1] === 1 ? 'Its jaws (inside jaws or depth rod) reach into small gaps and read to 0.05 mm.' : ob[1] === 0 ? 'It measures small outside thicknesses to 0.01 mm.' : ob[1] === 2 ? 'Millimetre precision is plenty, and it fits in one placement.' : 'It is walked along the ground to measure long distances.';
          return mc(r, 'Which of the following measuring instruments would be easiest to use to measure ' + ob[0] + '?', opts, 'The <b>' + INSTR[ob[1]] + '</b>. ' + why, ['Think about the size of the object and the precision you need — and whether you measure an inside or an outside.'], 'instrument for ' + ob[0], true);
        } }] },
      { num: '7', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '7', level: 'BEG', outcome: 'M2', make: function (r) {
          var m = r.chance(0.2) ? 121 : r.int(50, 200), D = 8 * m;
          return mcVals(r, 'A section of the Trans-Canada Highway is ' + t(F(D)) + ' km long. Using the approximate conversion ' + t('5\\text{ miles}=8\\text{ km}') + ', this distance in miles is', 5 * m, [
            { v: D * 8 / 5, code: 'conv-dir', why: 'You multiplied by ' + t('\\tfrac{8}{5}') + '. A mile is longer than a kilometre, so the number of miles must be <b>smaller</b>: use ' + t('\\tfrac{5\\text{ mi}}{8\\text{ km}}') + '.' },
            { v: D / 4, code: 'conv-step', why: 'Use the ratio exactly: ' + t('\\times\\dfrac{5\\text{ mi}}{8\\text{ km}}') + '.' },
            { v: D / 8, code: 'conv-step', why: 'That’s how many 8 km blocks there are. Each block is 5 miles.' }],
            function (v) { return t(F(dec(v))); },
            t(F(D) + '\\text{ km}\\times\\dfrac{5\\text{ mi}}{8\\text{ km}}=\\dfrac{' + F(D) + '}{8}\\times 5=' + m + '\\times 5=' + F(5 * m) + '\\text{ mi}') + ' (km cancels).', ['Arrange the ratio so km cancels: ' + t('\\times\\dfrac{5\\text{ mi}}{8\\text{ km}}') + '.'], 'km to mi ' + D);
        } }] },
      { num: '8', stem: '<i>(Multiple Choice)</i> The vernier caliper below reads to the nearest ' + t('0.05') + ' mm.', parts: [
        { id: '8', level: 'EMG', outcome: 'M1', make: function (r) {
          var M = r.int(6, 42), N = r.pick([1, 2, 3, 4, 6, 7, 8, 9, 11, 12, 13, 14, 16, 17, 18, 19]); if (r.chance(0.15)) { M = 14; N = 17; }
          var R = M + 0.05 * N, nb = N < 19 && r.chance(0.5) ? N + 1 : N - 1;
          return mcVals(r, 'The reading is' + figWrap(vernierSVG(M, N)), R, [
            { v: M + 0.01 * N, code: 'read-hundredths', why: 'Each vernier division is worth ' + t('0.05') + ' mm, not ' + t('0.01') + ' mm: multiply the matching mark by 0.05.' },
            { v: M + 1 + 0.05 * N, code: 'read-coarse', why: 'The coarse reading is the last main-scale mark the index (vernier 0) has <b>passed</b>, not the next one.' },
            { v: M + 0.05 * nb, code: 'neighbour', why: 'Look again along the vernier: which single mark lines up exactly with a main-scale mark? You chose its neighbour.' }],
            function (v) { return t(v.toFixed(2) + '\\text{ mm}'); },
            'Coarse: the index sits just past ' + t(M) + ' mm, so ' + t(M + '\\text{ mm}') + '. Fine: vernier mark ' + t(N) + ' lines up with a main-scale mark: ' + t(N + '\\times 0.05=' + (0.05 * N).toFixed(2) + '\\text{ mm}') + '.<br>Reading ' + t(M + '+' + (0.05 * N).toFixed(2) + '=' + R.toFixed(2) + '\\text{ mm}') + '.',
            ['Read the main scale at the index (the vernier’s 0), then find the one vernier mark that lines up exactly.', 'Fine reading = matching mark × 0.05 mm.'], 'vernier ' + R.toFixed(2));
        } }] },
      { num: '9', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '9', level: 'PRG', outcome: 'M2', make: function (r) {
          var L, W, tl; if (r.chance(0.2)) { L = 6; W = 4; tl = 9; } else { tl = r.pick([6, 9, 12]); L = r.int(4, 9); W = r.int(2, L - 1); }
          var a = 36 * L / tl, b = 36 * W / tl, n = a * b, who = r.pick(['Priya and Devon are', 'Kai and Lena are', 'Omar is', 'Mia is']);
          return nrInt(who + ' tiling a rectangular hallway floor that is ' + t(L) + ' yards long and ' + t(W) + ' yards wide, using square tiles that measure ' + t(tl) + ' inches by ' + t(tl) + ' inches. The number of tiles needed is ________.', n, function (v) {
            if (v === (12 * L / tl) * (12 * W / tl)) return { code: 'unit-yd', hint: 'A yard is 3 feet = <b>36</b> inches, not 12.' };
            if (v === 36 * L * 36 * W / tl) return { code: 'no-sq', hint: 'Each tile covers ' + t(tl + '\\times ' + tl) + ' square inches, not ' + t(tl) + '. Count the tiles along each side instead.' };
            if (v === a + b || v === 2 * (a + b)) return { code: 'not-sum', hint: 'Tiles fill an area: multiply the number along the length by the number along the width.' };
            return null;
          }, t(L + '\\text{ yd}=' + L + '\\times 36=' + (36 * L) + '\\text{ in}') + ' and ' + t(W + '\\text{ yd}=' + (36 * W) + '\\text{ in}') + '.<br>Tiles along each side: ' + t((36 * L) + '\\div ' + tl + '=' + a) + ' and ' + t((36 * W) + '\\div ' + tl + '=' + b) + '.<br>' + t(a + '\\times ' + b + '=' + n) + ' tiles.',
          ['Change the floor to inches (1 yd = 36 in), the unit the tiles are given in.', 'Count the tiles along the length and along the width, then multiply.'], 'tiles ' + L + 'x' + W + ' yd, ' + tl + ' in');
        } }] },
      { num: '10', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '10', level: 'EMG', outcome: 'M2', make: function (r) {
          var S, m, D; if (r.chance(0.2)) { S = 850000; m = 50; } else { do { S = r.pick([250000, 500000, 750000, 850000, 1200000, 1500000, 2000000]); m = r.int(6, 60); } while ((m * S) % 100000 || m * S / 100000 > 1500); }
          D = m * S / 100000; var s = r.int(0, 3);
          var opts = [0, 1, 2, 3].map(function (k) {
            var f = Math.pow(10, k - s), v = m * f;
            var why = f === 0.01 ? 'You changed km to m (' + t('\\times 1000') + ') but not to cm: the real distance must be in cm before you divide.' : f === 0.1 ? 'Check the conversion: 1 km = 100 000 cm.' : f < 1 ? 'Too small: change the real distance to cm (1 km = 100 000 cm), then divide by the scale number.' : 'Too big: 1 km = 100 000 cm. Check the conversion and the division.';
            return { html: t(F(dec(v)) + '\\text{ cm}'), right: k === s, why: f === 1 ? null : why, code: 'conv-step' };
          });
          return mc(r, 'The scale on a map is ' + t('1:' + F(S)) + '. If the actual distance between two towns is ' + t(D + '\\text{ km}') + ', the distance between them on the map is', opts,
            t(D + '\\text{ km}=' + F(D * 1000) + '\\text{ m}=' + F(D * 100000) + '\\text{ cm}') + '.<br>Map distance ' + t('=\\dfrac{' + F(D * 100000) + '}{' + F(S) + '}=' + m + '\\text{ cm}') + '.', ['Put the real distance in centimetres first, then divide by ' + t(F(S)) + '.'], 'map scale 1:' + S + ', ' + D + ' km', true);
        } }] },
      { num: '11', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '11', level: 'PRG', outcome: 'M2', make: function (r) {
          var a, b, c, k, n; if (r.chance(0.2)) { a = 60; b = 45; c = 20; k = 5; } else { do { a = r.pick([40, 50, 60, 75, 80, 90, 100]); b = r.pick([30, 35, 40, 45, 50]); c = r.pick([20, 25, 30, 40]); k = r.int(2, 6); } while ((a * b * c * k) % 10000 || a * b * c * k / 10000 > 99); }
          n = a * b * c * k / 10000; var Lt = a * b * c / 1000;
          return nrInt('An aquarium has dimensions ' + t(a + '\\text{ cm}\\times ' + b + '\\text{ cm}\\times ' + c + '\\text{ cm}') + '. The directions on a bottle of fish medicine are to add ' + t(k) + ' drops per ' + t('10') + ' litres of water. The number of drops that should be added to a completely full aquarium is ________.', n, function (v) {
            if (v === n * 10) return { code: 'per-rate', hint: 'Check two things: 1 L = 1000 cm³, and the dose is per <b>10</b> litres, not per litre.' };
            if (Math.abs(v - Lt / 10 * 10 / k) < 0.01 || Math.abs(v - 10 * Lt / k) < 0.01) return { code: 'per-rate', hint: 'The rate is ' + t(k) + ' drops for every 10 L: multiply the number of 10 L lots by ' + t(k) + '.' };
            if (v === Lt) return { code: 'per-rate', hint: 'That’s the volume in litres. Now apply the dose: ' + t(k) + ' drops per 10 L.' };
            return null;
          }, t('V=' + a + '\\times ' + b + '\\times ' + c + '=' + F(a * b * c) + '\\text{ cm}^{3}=' + F(a * b * c) + '\\text{ mL}=' + dec(Lt) + '\\text{ L}') + '.<br>Drops ' + t('=\\dfrac{' + dec(Lt) + '}{10}\\times ' + k + '=' + n) + '.',
          ['Find the volume in cm³, then litres (1000 cm³ = 1 L).', 'How many 10 L lots is that? Each lot gets ' + t(k) + ' drops.'], 'aquarium drops');
        } }] },
      { num: '12', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '12', level: 'EMG', outcome: 'M1', make: function (r) {
          var Y, s; if (r.chance(0.2)) { Y = 10; s = 9; } else { do { s = r.pick([8, 9, 10, 11]); Y = r.int(5, 30); } while ((36 * Y) % s); }
          var n = 36 * Y / s, who = nameP(r);
          return nrInt(who + ' is marking the sideline of a field, which needs to be ' + t(Y) + ' yards long. ' + who + '’s shoe is ' + t(s) + ' inches long, so each heel-to-toe step covers ' + t(s) + ' inches; this is the referent, and the feet are placed heel to toe repeatedly along the line. The number of times the feet must be placed is ________.', n, function (v) {
            if (Math.abs(v - 12 * Y / s) < 0.01) return { code: 'unit-yd', hint: 'A yard is 3 feet = <b>36</b> inches.' };
            if (Math.abs(v - 3 * Y / s) < 0.01 || v === 3 * Y) return { code: 'conv-step', hint: 'Put the line in <b>inches</b> (the shoe’s unit) before dividing: 1 yd = 36 in.' };
            return null;
          }, t(Y + '\\text{ yd}=' + Y + '\\times 36=' + (36 * Y) + '\\text{ in}') + '. Each placement covers ' + t(s) + ' in, so ' + t((36 * Y) + '\\div ' + s + '=' + n) + ' placements.',
          ['Change the length of the line to inches (1 yd = 36 in), then divide by the shoe length.'], 'shoe referent ' + Y + ' yd');
        } }] },
      { num: '13', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '13', level: 'EMG', outcome: 'M2', make: function (r) {
          var ks, i, j, c; do { ks = r.pick(KEYSETS); i = r.int(0, 4); c = ks.imp.map(function (f, jj) { return [jj, inMM(f)]; }).filter(function (p) { return p[1] > ks.met[i] && p[1] < ks.met[i + 1]; }); } while (c.length !== 1);
          if (r.chance(0.2)) { ks = KEYSETS[0]; i = 2; c = [[3]]; }
          j = c[0][0]; var lo = ks.met[i], hi = ks.met[i + 1], st = r.int(Math.max(0, j - 3), Math.min(j, 2)), who = nameP(r);
          var opts = ks.imp.slice(st, st + 4).map(function (f, q) { var jj = st + q, mm = inMM(f); return { html: t(frT(f) + '\\text{ in}'), right: jj === j, code: 'compare-sys', why: jj === j ? null : t(frT(f) + '\\text{ in}=' + dec(rnd(mm, 3)) + '\\text{ mm}') + ', which is ' + (mm < lo ? 'smaller than the ' + lo + ' mm key that was already too small.' : 'larger than the ' + hi + ' mm key that was already too large.') }; });
          return mc(r, 'A ' + ks.name + ' set includes ' + setTex(ks) + '. ' + who + '’s ' + t(lo + '\\text{ mm}') + ' ' + ks.name + ' is too small for a bolt and the ' + t(hi + '\\text{ mm}') + ' one is too large. Which imperial ' + ks.name + ' should ' + who + ' try?', opts,
            'Change the options to mm (' + t('1\\text{ in}=25.4\\text{ mm}') + '): ' + ks.imp.slice(st, st + 4).map(function (f) { return t(frT(f) + '=' + dec(rnd(inMM(f), 3))); }).join(', ') + ' mm.<br>The only one between ' + t(lo) + ' mm and ' + t(hi) + ' mm is ' + t(frT(ks.imp[j]) + '\\text{ in}') + '.', ['Change each imperial size to millimetres: multiply by 25.4.'], ks.name + ' metric→imperial ' + lo + '-' + hi, true);
        } }] },
      { num: '14', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '14', level: 'EMG', outcome: 'M2', make: function (r) {
          var ks, i, c; do { ks = r.pick(KEYSETS); i = r.int(0, 4); c = ks.met.filter(function (m) { return m > inMM(ks.imp[i]) && m < inMM(ks.imp[i + 1]); }); } while (c.length !== 1);
          if (r.chance(0.2)) { ks = KEYSETS[0]; i = 4; c = [7]; }
          var ans = c[0], j = ks.met.indexOf(ans), st = r.int(Math.max(0, j - 3), Math.min(j, 2)), a = ks.imp[i], b = ks.imp[i + 1], who = nameP(r);
          var opts = ks.met.slice(st, st + 4).map(function (m) { return { html: t(m + '\\text{ mm}'), right: m === ans, code: 'compare-sys', why: m === ans ? null : m < inMM(a) ? t(m + '\\text{ mm}') + ' is smaller than ' + t(frT(a) + '\\text{ in}=' + dec(rnd(inMM(a), 3)) + '\\text{ mm}') + ', which was already too small.' : t(m + '\\text{ mm}') + ' is larger than ' + t(frT(b) + '\\text{ in}=' + dec(rnd(inMM(b), 3)) + '\\text{ mm}') + ', which was already too large.' }; });
          return mc(r, 'A ' + ks.name + ' set includes ' + setTex(ks) + '. ' + who + '’s ' + t(frT(a) + '\\text{ in}') + ' ' + ks.name + ' is too small for a bolt and the ' + t(frT(b) + '\\text{ in}') + ' one is too large. Which metric ' + ks.name + ' should ' + who + ' try?', opts,
            t(frT(a) + '\\text{ in}=' + dec(rnd(inMM(a), 4)) + '\\text{ mm}') + ' and ' + t(frT(b) + '\\text{ in}=' + dec(rnd(inMM(b), 4)) + '\\text{ mm}') + '. The only metric size between them is ' + t(ans + '\\text{ mm}') + '.', ['Change the two imperial sizes to mm (' + t('\\times 25.4') + ') and look between them.'], ks.name + ' imperial→metric', true);
        } }] },
      { num: '15', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '15', level: 'PRG', outcome: 'M2', make: function (r) {
          var d, tm; if (r.chance(0.2)) { d = 200; tm = 11.82; } else { d = r.pick([100, 200, 400]); tm = d === 100 ? step(r, 10.2, 14.5, 0.01) : d === 200 ? step(r, 20.5, 29, 0.01) : step(r, 46, 65, 0.01); }
          var ms = d / tm, kh = ms * 3.6, who = r.pick(['A sprinter', 'A runner', 'An athlete']);
          return near(who + ' completes a ' + t(d) + ' m time trial in ' + t(dec(tm)) + ' seconds. Her average speed, to the nearest ' + t('0.1') + ' km/h, is ________.', kh, 1, 'km/h', [
            { v: ms, code: 'units', hint: 'That’s the speed in metres per <b>second</b>. Convert to km/h: ' + t('\\times\\dfrac{3600\\text{ s}}{1\\text{ h}}\\times\\dfrac{1\\text{ km}}{1000\\text{ m}}') + '.' },
            { v: ms / 3.6, code: 'conv-dir', hint: 'To go from m/s to km/h you <b>multiply</b> by 3.6 (there are 3600 s in an hour, 1000 m in a km).' },
            { v: ms * 60 / 1000, code: 'conv-step', hint: 'An hour is 3600 seconds, not 60.' },
            { v: kh * 0.6214, code: 'units', hint: 'That’s miles per hour. The question asks for km/h.' }],
            'Speed ' + t('=\\dfrac{' + d + '\\text{ m}}{' + dec(tm) + '\\text{ s}}=' + dots(ms) + '\\text{ m/s}') + '.<br>' + t(dots(ms) + '\\times\\dfrac{3600\\text{ s}}{1\\text{ h}}\\times\\dfrac{1\\text{ km}}{1000\\text{ m}}=' + dots(ms) + '\\times 3.6=' + dots(kh, 3)) + ' ≈ ' + t(fx(kh, 1) + '\\text{ km/h}') + '.',
            ['Find the speed in m/s first (distance ÷ time).', '1 m/s = 3.6 km/h (3600 s per hour, 1000 m per km).'], 'speed ' + d + ' m in ' + tm + ' s', { nr: true });
        } }] },
      { num: '16', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '16', level: 'PRG', make: function (r) {
          var d, h; if (r.chance(0.2)) { d = 8.2; h = 12.5; } else { d = step(r, 6, 12, 0.1); h = step(r, 8, 18, 0.5); }
          var rr = d / 2, A = PI * d * h;
          return near('A cylindrical can of paint has a base diameter of ' + t(dec(d)) + ' cm and a height of ' + t(dec(h)) + ' cm. A paper label completely covers the curved surface of the can. The surface area of the label, to the nearest cm², is ________.' + figWrap(HW.solid('cylinder', { d: dec(d) + ' cm', h: dec(h) + ' cm', width: 220 })), A, 0, 'cm²', [
            { v: A + 2 * PI * rr * rr, code: 'extra-face', hint: 'A label wraps only the <b>curved</b> side — the two circular ends aren’t covered.' },
            { v: A + PI * rr * rr, code: 'extra-face', hint: 'The label covers only the curved side, not an end.' },
            { v: 2 * PI * d * h, code: 'diam-radius', hint: 'You used the diameter in ' + t('2\\pi r h') + '. Either halve it (' + t('r=' + dec(rr)) + ') or use ' + t('\\pi d h') + '.' },
            { v: PI * rr * h, code: 'formula', hint: 'The curved surface is the circumference times the height: ' + t('2\\pi r h=\\pi d h') + '.' },
            { v: PI * rr * rr * h, code: 'vol-sa', hint: 'That’s the volume. The label is an <b>area</b>: circumference × height.' }],
            'The label is the curved surface only — circumference × height:<br>' + t('A=\\pi d h=\\pi(' + dec(d) + ')(' + dec(h) + ')=' + num(d * h) + '\\pi=' + dots(A, 3)) + ' ≈ ' + t(fx(A, 0) + '\\text{ cm}^{2}') + '.',
            ['Unroll the label: it is a rectangle, the circumference of the can by its height.', 'Circumference ' + t('=\\pi d') + '.'], 'paint can label', { nr: true });
        } }] },
      { num: '17', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '17', level: 'PRG', make: function (r) {
          var tr, k, rr, h, s; if (r.chance(0.2)) { rr = 9; h = 12; s = 15; } else { do { tr = r.pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25]]); k = r.int(1, 3); var sw = r.chance(0.5); rr = (sw ? tr[1] : tr[0]) * k; h = (sw ? tr[0] : tr[1]) * k; s = tr[2] * k; } while (s > 30); }
          return mcVals(r, 'A conical funnel has a base radius of ' + t(rr) + ' cm, a height of ' + t(h) + ' cm, and no base (it is open at its wide end). The surface area of the funnel, in terms of ' + t('\\pi') + ', is' + figWrap(funnelCone('r = ' + rr + ' cm', 'h = ' + h + ' cm')), rr * s, [
            { v: rr * s + rr * rr, code: 'extra-face', why: 'The funnel is open at its wide end — leave out the base ' + t('\\pi r^{2}') + '.' },
            { v: rr * h, code: 'h-for-slant', why: 'The curved surface ' + t('\\pi r s') + ' needs the <b>slant</b> height ' + t('s') + ', not the perpendicular height. Find ' + t('s') + ' with Pythagoras first.' },
            { v: rr * rr, code: 'formula', why: 'That’s the area of the (missing) base. The funnel is the curved surface ' + t('\\pi r s') + '.' }],
            function (v) { return t(v + '\\pi\\text{ cm}^{2}'); },
            'Slant height first: ' + t('s^{2}=h^{2}+r^{2}=' + h + '^{2}+' + rr + '^{2}=' + (h * h + rr * rr) + '') + ', so ' + t('s=' + s + '\\text{ cm}') + '.<br>No base, so only the curved surface: ' + t('SA=\\pi r s=\\pi(' + rr + ')(' + s + ')=' + (rr * s) + '\\pi\\text{ cm}^{2}') + '.',
            ['Which surfaces does an open funnel have?', 'The curved surface of a cone is ' + t('\\pi r s') + ', with the slant height from ' + t('s^{2}=h^{2}+r^{2}') + '.'], 'funnel r=' + rr + ' h=' + h);
        } }] },
      { num: '18', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '18', level: 'EMG', make: function (r) {
          var d = r.chance(0.2) ? 14 : 2 * r.int(4, 15), rr = d / 2, A = 4 * PI * rr * rr, none = r.chance(0.25);
          var obj = r.pick(['ornament', 'ball', 'globe', 'lantern']);
          var ws = [{ v: 2 * PI * rr * rr, code: 'formula', why: 'That is half the sphere’s area (a hemisphere’s curved surface). A sphere is ' + t('4\\pi r^{2}') + '.' },
            { v: 4 * PI * d * d, code: 'diam-radius', why: 'You used the diameter as the radius. Halve it first: ' + t('r=' + rr) + ' in.' },
            { v: 4 / 3 * PI * Math.pow(rr, 3), code: 'vol-sa', why: 'That’s the volume. Surface area is ' + t('4\\pi r^{2}') + '.' }];
          var vals = (none ? ws : [{ v: A, right: true }].concat(ws.slice(0, 2))).map(function (w) { return { html: t(F(String(Math.round(w.v)))), right: !!w.right, why: w.why, code: w.code }; });
          vals = r.shuffle(vals); vals.push({ html: 'none of the above', right: none, code: 'none', why: none ? null : 'One of the values is right — find ' + t('4\\pi r^{2}') + ' with ' + t('r=' + rr) + '.' });
          return mc(r, 'A spherical ' + obj + ' has a diameter of ' + t(d) + ' inches. The surface area of the ' + obj + ', to the nearest square inch, is' + figWrap(HW.solid('sphere', { d: d + ' in', width: 200 })), vals,
            'Halve the diameter: ' + t('r=' + rr) + ' in.<br>' + t('SA=4\\pi r^{2}=4\\pi(' + rr + ')^{2}=' + (4 * rr * rr) + '\\pi=' + dots(A, 3)) + ' ≈ ' + t(F(String(Math.round(A))) + '\\text{ in}^{2}') + (none ? ' — not among the values, so <b>none of the above</b>.' : '.'),
            ['A sphere’s surface area is ' + t('4\\pi r^{2}') + ' — and the radius is half the diameter.'], 'sphere SA d=' + d, true);
        } }] },
      { num: '19', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '19', level: 'PRG', make: function (r) {
          var a, h; if (r.chance(0.2)) { a = 12; h = 9; } else { a = r.pick([6, 8, 10, 12, 14]); h = r.pick([6, 9, 12, 15]); }
          var V = a * a * h / 12, base = a * a / 4;
          var o = [{ html: t(num(V) + '\\sqrt{3}'), right: true }, { html: t(num(base) + '\\sqrt{3}'), code: 'vol-sa', why: 'That’s the area of the base. The volume is ' + t('\\tfrac13 A_{\\text{Base}}h') + '.' },
            { html: t(num(3 * V) + '\\sqrt{3}'), code: 'no-third', why: 'That’s the prism on the same base. A pyramid holds ' + t('\\tfrac13') + ' of it.' },
            { html: t(num(a * a * h / 6)), code: 'formula', why: 'The base is an <b>equilateral</b> triangle, not a right triangle with legs ' + t(a) + ': its height is ' + t('\\tfrac{\\sqrt3}{2}(' + a + ')') + ', so its area is ' + t('\\tfrac{\\sqrt3}{4}(' + a + ')^{2}') + '.' }];
          return mc(r, 'A decorative object is in the shape of a triangular pyramid. The base is an equilateral triangle with sides of ' + t(a) + ' m, and the height is ' + t(h) + ' m. The volume of the pyramid in m³ is' + figWrap(triPyramidSVG(a + ' m', h + ' m')), o,
            'Base area: ' + t('A_{\\text{Base}}=\\tfrac{\\sqrt3}{4}(' + a + ')^{2}=\\tfrac{\\sqrt3}{4}(' + a * a + ')=' + num(base) + '\\sqrt3\\text{ m}^{2}') + '.<br>' + t('V=\\tfrac13 A_{\\text{Base}}h=\\tfrac13(' + num(base) + '\\sqrt3)(' + h + ')=' + num(V) + '\\sqrt3\\text{ m}^{3}') + '.',
            ['An equilateral triangle of side ' + t('a') + ' has area ' + t('\\tfrac{\\sqrt3}{4}a^{2}') + '.', 'A pyramid’s volume is ' + t('\\tfrac13 A_{\\text{Base}}h') + '.'], 'triangular pyramid a=' + a + ' h=' + h);
        } }] },
      { num: '20', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '20', level: 'EMG', make: function (r) {
          var rr = r.chance(0.2) ? 7 : r.int(4, 15), V = rnd(2 / 3 * PI * Math.pow(rr, 3), 1), obj = r.pick(['water tank', 'storage dome', 'fountain basin']);
          return mcVals(r, 'The volume of a hemispherical ' + obj + ' is ' + t(F(V.toFixed(1)) + '\\text{ m}^{3}') + '. The radius of the ' + obj + ', to the nearest tenth of a metre, is' + figWrap(HW.solid('hemisphere', { r: 'r = ?', width: 200 })), rnd(Math.cbrt(3 * V / (2 * PI)), 1), [
            { v: rnd(Math.cbrt(3 * V / (4 * PI)), 1), code: 'sphere-for-hemi', why: 'That uses the whole-sphere formula ' + t('\\tfrac43\\pi r^{3}') + '. A hemisphere is ' + t('V=\\tfrac23\\pi r^{3}') + '.' },
            { v: rnd(Math.cbrt(V / PI), 1), code: 'formula', why: 'Don’t drop the ' + t('\\tfrac23') + ': ' + t('r^{3}=\\dfrac{3V}{2\\pi}') + '.' },
            { v: rnd(Math.sqrt(3 * V / (2 * PI)), 1), code: 'wrong-root', why: 'Volume has ' + t('r^{3}') + ', so take the <b>cube</b> root, not the square root.' },
            { v: rnd(3 * V / (2 * PI), 1), code: 'no-root', why: 'That is ' + t('r^{3}') + '. Take its cube root.' }],
            function (v) { return t(v.toFixed(1) + '\\text{ m}'); },
            t('V=\\tfrac23\\pi r^{3}\\Rightarrow r^{3}=\\dfrac{3V}{2\\pi}=\\dfrac{3(' + V.toFixed(1) + ')}{2\\pi}=' + dots(3 * V / (2 * PI), 2)) + '.<br>' + t('r=\\sqrt[3]{' + dots(3 * V / (2 * PI), 2) + '}\\approx ' + rr + '.0\\text{ m}') + '.',
            ['Solve ' + t('V=\\tfrac23\\pi r^{3}') + ' for ' + t('r^{3}') + ' first, then take the cube root.'], 'hemisphere r from V=' + V);
        } }] },
      { num: '21', section: 'Assignment — Written response', shared: function (r) {
          var o; for (var g = 0; g < 400; g++) {
            o = g === 0 && r.chance(0.25) ? { rr: 2.2, h: 4.5, tk: [2.5, 2, 8], D: 10, f1: 200, v1: 3.5, f2: 150, v2: 0.10, x: 0.93 }
              : { rr: r.pick([1.8, 2.0, 2.2, 2.4, 2.5, 2.8]), h: r.pick([3.5, 4.0, 4.5, 5.0, 5.5]), tk: [r.pick([2, 2.5]), 2, r.pick([6, 7, 8, 9, 10])], D: r.pick([8, 10, 12]), f1: r.pick([180, 200, 220, 250]), v1: r.pick([3.0, 3.5, 4.0, 4.5]), f2: r.pick([120, 150, 160, 175]), v2: r.pick([0.08, 0.10, 0.12]), x: r.pick([0.73, 0.75, 0.92, 0.93]) };
            o.V = PI * o.rr * o.rr * o.h; o.Vt = o.tk[0] * o.tk[1] * o.tk[2]; o.q = o.V / o.Vt; o.n = Math.ceil(o.q); o.cap = 2 / 3 * PI * Math.pow(o.D / 2, 3); o.pct = o.V / o.cap * 100;
            o.ft3 = o.V * M3FT; o.C1 = o.f1 * o.n + o.v1 * o.V; o.US = o.f2 * o.n + o.v2 * o.ft3; o.C2 = o.US / o.x;
            if (frac(o.q) > 0.12 && frac(o.q) < 0.88 && o.pct > 8 && o.pct < 92 && Math.abs(o.C1 - o.C2) > 15 && Math.abs(o.C1 - o.US) > 15) break;
          }
          return o;
        }, stem: function (s) { return 'Golden Plains Dairy stores fresh milk in a cylindrical vat with a radius of ' + t(dec(s.rr)) + ' m and a height of ' + t(dec(s.h)) + ' m, filled completely.' + figWrap(HW.solid('cylinder', { r: dec(s.rr) + ' m', h: dec(s.h) + ' m', width: 200 })); },
        parts: [
          { id: '21a', level: 'BEG', make: function (r, s) {
            return near('Determine the volume of milk in the vat, correct to one decimal place.', s.V, 1, 'm³', [
              { v: PI * 4 * s.rr * s.rr * s.h, code: 'diam-radius', hint: 'Use the radius ' + t(dec(s.rr)) + ' m as given — don’t double it.' },
              { v: 2 * PI * s.rr * s.h, code: 'vol-sa', hint: 'That’s the curved surface area. Volume is ' + t('\\pi r^{2}h') + '.' },
              { v: s.V / 3, code: 'formula', hint: 'A cylinder has no ' + t('\\tfrac13') + ' — that is a cone.' }],
              t('V=\\pi r^{2}h=\\pi(' + dec(s.rr) + ')^{2}(' + dec(s.h) + ')=' + num(s.rr * s.rr * s.h) + '\\pi=' + dots(s.V)) + ' ≈ ' + t(fx(s.V, 1) + '\\text{ m}^{3}') + '.', ['Volume of a cylinder: ' + t('V=\\pi r^{2}h') + '.'], 'vat volume');
          } },
          { id: '21b', level: 'EMG', make: function (r, s) {
            var p = { prompt: 'The vat holds ' + t('\\pi(' + dec(s.rr) + ')^{2}(' + dec(s.h) + ')\\approx ' + dots(s.V, 3) + '\\text{ m}^{3}') + ' of milk. It is transported using rectangular tanker trucks with interior dimensions ' + t(dec(s.tk[0]) + '\\text{ m}\\times ' + s.tk[1] + '\\text{ m}\\times ' + s.tk[2] + '\\text{ m}') + '. Determine the number of trucks needed.',
              input: { type: 'number', after: 'trucks' }, key: String(s.n), answer: t(s.n) + ' trucks', text: 'number of trucks',
              check: countCheck(s.n, s.q, 'up', function (v) { if (Math.abs(v - s.Vt) < 1e-9) return { code: 'vol-sa', hint: 'That’s the volume of one truck. Divide the milk by it.' }; return null; }),
              solution: t('V_{\\text{truck}}=' + dec(s.tk[0]) + '\\times ' + s.tk[1] + '\\times ' + s.tk[2] + '=' + num(s.Vt) + '\\text{ m}^{3}') + '.<br>' + t('\\dfrac{' + dots(s.V, 3) + '}{' + num(s.Vt) + '}=' + dots(s.q, 3)) + '. A part-load still needs a whole truck, so <b>' + s.n + ' trucks</b>.',
              hints: ['Find the volume of one truck, then divide.', 'Round <b>up</b>: leftover milk still needs a truck.'], bad: [String(Math.floor(s.q))] };
            return p;
          } },
          { id: '21c', level: 'PRG', make: function (r, s) {
            var P = s.pct;
            return near('At the plant, the ' + t(dots(s.V, 3) + '\\text{ m}^{3}') + ' of milk (the full vat: ' + t('\\pi(' + dec(s.rr) + ')^{2}(' + dec(s.h) + ')') + ') is poured into a hemispherical storage tank with a diameter of ' + t(s.D) + ' m. Determine what percentage of the hemispherical tank’s capacity is filled, to the nearest tenth of a percent.', P, 1, '%', [
              { v: P / 2, code: 'sphere-for-hemi', hint: 'You used a whole sphere. The tank is a <b>hemisphere</b>: ' + t('V=\\tfrac23\\pi r^{3}') + '.' },
              { v: P / 8, code: 'diam-radius', hint: 'Halve the diameter: ' + t('r=' + (s.D / 2)) + ' m.' },
              { v: 10000 / P, code: 'ratio-flip', hint: 'Percentage filled = milk ÷ tank capacity × 100 — your fraction is upside down.' }],
              'Tank: ' + t('r=' + (s.D / 2) + '\\text{ m}') + ', ' + t('V=\\tfrac23\\pi(' + (s.D / 2) + ')^{3}=' + dots(s.cap, 3) + '\\text{ m}^{3}') + '.<br>' + t('\\dfrac{' + dots(s.V, 3) + '}{' + dots(s.cap, 3) + '}\\times 100\\%=' + dots(P, 3) + '\\%') + ' ≈ ' + t(fx(P, 1) + '\\%') + '.',
              ['Capacity of a hemisphere: ' + t('\\tfrac23\\pi r^{3}') + ' with ' + t('r') + ' = half the diameter.', 'Percent filled = milk ÷ capacity × 100.'], 'percent of hemisphere filled',
              { pre: function (v) { return Math.abs(v - P / 100) < 0.0006 ? form('not-pct', 'That’s the fraction filled. Multiply by 100 to make it a percent.') : null; } });
          } },
          { id: '21d', sub: 'd-i', level: 'ADV', outcome: 'M2', make: function (r, s) {
            var lead = 'The milk (' + t(dots(s.V, 3) + '\\text{ m}^{3}') + ') needs ' + t(s.n) + ' trucks. Foothills Transport charges C$' + s.f1 + ' per truck plus C$' + s.v1.toFixed(2) + ' per m³ of milk. Rocky Mountain Haulers charges US$' + s.f2 + ' per truck plus US$' + s.v2.toFixed(2) + ' per ft³ of milk. Using C$1 = US$' + s.x.toFixed(2) + ' and ' + t('2.54\\text{ cm}=1\\text{ inch}') + ', determine each company’s total cost in <b>Canadian</b> dollars, to the nearest cent.';
            return fields(lead, [
              { label: 'Foothills Transport: C$', x: s.C1, dp: 2, alts: [{ v: s.f1 + s.v1 * s.V, code: 'per-rate', hint: 'The truck fee is per truck: ' + t(s.n) + ' trucks.' }, { v: s.f1 * s.n + s.v1 * rnd(s.V, 1), code: 'early-round', hint: 'Use the unrounded volume.' }] },
              { label: 'Rocky Mountain Haulers: C$', x: s.C2, dp: 2, alts: [
                { v: s.US, code: 'currency', hint: 'That’s the cost in <b>US</b> dollars. Change it to Canadian: divide by ' + s.x.toFixed(2) + '.' },
                { v: s.US * s.x, code: 'currency', hint: 'C$1 buys only US$' + s.x.toFixed(2) + ', so a US amount is <b>more</b> Canadian dollars: divide by ' + s.x.toFixed(2) + '.' },
                { v: (s.f2 * s.n + s.v2 * s.V * 3.2808) / s.x, code: 'lin-factor', hint: 'Volume needs the <b>cubic</b> factor: ' + t('1\\text{ m}^{3}=(\\tfrac{1}{0.3048})^{3}\\approx 35.3147\\text{ ft}^{3}') + ', not 3.2808.' },
                { v: (s.f2 * s.n + s.v2 * s.V * Math.pow(0.3048, 3)) / s.x, code: 'conv-dir', hint: 'A cubic foot is smaller than a cubic metre, so there are <b>more</b> ft³: multiply by 35.3147.' },
                { v: (s.f2 + s.v2 * s.ft3) / s.x, code: 'per-rate', hint: 'The truck fee is per truck: ' + t(s.n) + ' trucks.' }] }],
              '<b>Foothills:</b> ' + t(s.f1 + '(' + s.n + ')+' + s.v1.toFixed(2) + '(' + dots(s.V) + ')=' + fx(s.C1, 2)) + ' C$.<br><b>Rocky Mountain:</b> ' + t('1\\text{ ft}=0.3048\\text{ m}') + ', so ' + t('1\\text{ m}^{3}=\\left(\\tfrac{1}{0.3048}\\right)^{3}=35.3147\\ldots\\text{ ft}^{3}') + ' and the milk is ' + t(dots(s.V) + '\\times 35.3147\\ldots=' + dots(s.ft3, 2) + '\\text{ ft}^{3}') + '.<br>US cost ' + t('=' + s.f2 + '(' + s.n + ')+' + s.v2.toFixed(2) + '(' + dots(s.ft3, 2) + ')=' + dots(s.US, 3)) + '; in Canadian dollars ' + t(dots(s.US, 3) + '\\div ' + s.x.toFixed(2) + '=' + fx(s.C2, 2)) + ' C$.',
              ['Rocky Mountain’s rate is per ft³: change the volume with the cubic factor ' + t('(1/0.3048)^{3}') + '.', 'Then change US$ to C$ by dividing by the exchange rate.'], 'trucking bids');
          } },
          { id: '21d2', sub: 'd-ii', level: 'PRG', outcome: 'M2', make: function (r, s) {
            var cheap = s.C1 < s.C2 ? 'Foothills Transport' : 'Rocky Mountain Haulers', other = s.C1 < s.C2 ? 'Rocky Mountain Haulers' : 'Foothills Transport', d = Math.abs(s.C1 - s.C2);
            var w1 = s.C1 < s.US ? 'Foothills Transport' : 'Rocky Mountain Haulers', d1 = Math.abs(s.C1 - s.US), w2 = s.C1 < s.US * s.x ? 'Foothills Transport' : 'Rocky Mountain Haulers', d2 = Math.abs(s.C1 - s.US * s.x);
            var opts = [{ html: cheap + ', by about C$' + d.toFixed(2), right: true },
              { html: other + ', by about C$' + d.toFixed(2), code: 'compare', why: 'Compare the two totals again — which one is smaller?' },
              { html: w1 + ', by about C$' + d1.toFixed(2), code: 'currency', why: 'You compared a US-dollar total with a Canadian one. Change Rocky Mountain’s bid to C$ first (÷ ' + s.x.toFixed(2) + ').' },
              { html: w2 + ', by about C$' + d2.toFixed(2), code: 'currency', why: 'To change US$ to C$ you divide by ' + s.x.toFixed(2) + ' (a US dollar is worth more), not multiply.' }];
            var seen = {}; opts = opts.filter(function (o) { if (seen[o.html]) return false; seen[o.html] = 1; return true; });
            if (opts.length < 4) opts.push({ html: other + ', by about C$' + (2 * d).toFixed(2), code: 'compare', why: 'Compare the two totals again.' });
            return mc(r, 'The milk (' + t(dots(s.V, 3) + '\\text{ m}^{3}') + ') needs ' + t(s.n) + ' trucks. Foothills Transport charges C$' + s.f1 + ' per truck plus C$' + s.v1.toFixed(2) + ' per m³. Rocky Mountain Haulers charges US$' + s.f2 + ' per truck plus US$' + s.v2.toFixed(2) + ' per ft³. Using C$1 = US$' + s.x.toFixed(2) + ' and 2.54 cm = 1 inch, which company is cheaper?', opts,
              'Foothills: C$' + s.C1.toFixed(2) + '. Rocky Mountain: US$' + s.US.toFixed(2) + ' = C$' + s.C2.toFixed(2) + ' (÷ ' + s.x.toFixed(2) + '). So <b>' + cheap + '</b> is cheaper, by about C$' + d.toFixed(2) + '.',
              ['Work out both costs in Canadian dollars before comparing.', 'Volume in ft³: multiply m³ by ' + t('(1/0.3048)^{3}\\approx 35.3147') + '.'], 'cheaper bid');
          } }] },
      { num: '22', stem: '<i>(Written Response)</i>', parts: [
        { id: '22', level: 'PRG', outcome: 'M1', make: function (r) {
          var M = r.int(10, 45), N = r.pick([2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15, 16, 17, 18]); if (r.chance(0.15)) { M = 37; N = 12; }
          var R = M + 0.05 * N;
          return near('State the reading of this vernier caliper, accurate to ' + t('0.05') + ' mm.' + figWrap(vernierSVG(M, N)), R, 2, 'mm', [
            { v: M + 0.01 * N, code: 'read-hundredths', hint: 'Each vernier division is worth ' + t('0.05') + ' mm: multiply the matching mark by 0.05.' },
            { v: M + 1 + 0.05 * N, code: 'read-coarse', hint: 'The coarse reading is the last main-scale mark the index has <b>passed</b>.' },
            { v: M + 0.05 * (N + 1), code: 'neighbour', hint: 'Look again: exactly one vernier mark lines up with a main-scale mark. You read its neighbour.' },
            { v: M + 0.05 * (N - 1), code: 'neighbour', hint: 'Look again: exactly one vernier mark lines up with a main-scale mark. You read its neighbour.' },
            { v: M + 0.1 * N, code: 'read-fine', hint: 'Each vernier division is 0.05 mm, not 0.1 mm.' },
            { v: M + N, code: 'read-fine', hint: 'The vernier mark number is not a whole number of millimetres: multiply it by 0.05 mm.' }],
            'Coarse: the index has passed ' + t(M) + ' mm. Fine: vernier mark ' + t(N) + ' lines up, so ' + t(N + '\\times 0.05=' + (0.05 * N).toFixed(2) + '\\text{ mm}') + '.<br>Reading ' + t(M + '+' + (0.05 * N).toFixed(2) + '=' + R.toFixed(2) + '\\text{ mm}') + ' — two decimals, because the caliper reads to 0.05 mm.',
            ['Main scale at the index (the vernier’s 0), plus the matching vernier mark × 0.05 mm.'], 'vernier reading ' + R.toFixed(2));
        } }] },
      { num: '23', shared: function (r) {
          if (r.chance(0.25)) return { a: 6, b: 8, c: 10, L: 15 };
          var tr = r.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15]]), sw = r.chance(0.4);
          return { a: sw ? tr[1] : tr[0], b: sw ? tr[0] : tr[1], c: tr[2], L: r.int(10, 25) };
        }, stem: function (s) { return '<i>(Written Response)</i> A chocolate bar is a right triangular prism. Its triangular ends are right triangles with legs of ' + t(s.a) + ' cm and ' + t(s.b) + ' cm and a hypotenuse of ' + t(s.c) + ' cm, and the bar is ' + t(s.L) + ' cm long.' + figWrap(triPrismSVG(s.a + ' cm', s.b + ' cm', s.c + ' cm', s.L + ' cm')); },
        parts: [
          { id: '23a', level: 'BEG', make: function (r, s) {
            var A = s.a * s.b / 2, V = A * s.L;
            return near('Determine the volume of the bar.', V, 0, 'cm³', [
              { v: 2 * V, code: 'no-half', hint: 'The base is a <b>triangle</b>: ' + t('A_{\\text{Base}}=\\tfrac12 bh') + '.' },
              { v: s.a * s.c / 2 * s.L, code: 'formula', hint: 'The triangle’s base and height are the two <b>legs</b> (they meet at the right angle), not the hypotenuse.' },
              { v: V / 3, code: 'no-third', hint: 'A prism has no ' + t('\\tfrac13') + ' — that’s for pyramids.' }],
              'For a prism ' + t('V=A_{\\text{Base}}\\times h') + ': the base is the triangular end and ' + t('h') + ' is the ' + t(s.L) + ' cm length.<br>' + t('A_{\\text{Base}}=\\tfrac12(' + s.a + ')(' + s.b + ')=' + num(A) + '\\text{ cm}^{2}') + ', ' + t('V=' + num(A) + '\\times ' + s.L + '=' + num(V) + '\\text{ cm}^{3}') + '.', ['Volume of a prism = area of the triangular end × length.'], 'triangular prism volume', { exact: true });
          } },
          { id: '23b', level: 'EMG', make: function (r, s) {
            var A = s.a * s.b / 2, SA = 2 * A + (s.a + s.b + s.c) * s.L;
            return near('Determine the surface area of the foil wrapper that covers the bar exactly.', SA, 0, 'cm²', [
              { v: A + (s.a + s.b + s.c) * s.L, code: 'missing-face', hint: 'There are <b>two</b> triangular ends.' },
              { v: 2 * A + (s.a + s.b) * s.L, code: 'missing-face', hint: 'Don’t forget the rectangle on the sloping (hypotenuse) face: ' + t(s.c + '\\times ' + s.L) + '.' },
              { v: 4 * A + (s.a + s.b + s.c) * s.L, code: 'no-half', hint: 'Each triangular end is ' + t('\\tfrac12(' + s.a + ')(' + s.b + ')') + '.' },
              { v: A * s.L, code: 'vol-sa', hint: 'That’s the volume. The wrapper is the total area of all five faces.' }],
              'Two triangular ends: ' + t('2\\left(\\tfrac12\\cdot ' + s.a + '\\cdot ' + s.b + '\\right)=' + 2 * A) + ' cm².<br>Three rectangles: ' + t('(' + s.a + '+' + s.b + '+' + s.c + ')(' + s.L + ')=' + (s.a + s.b + s.c) * s.L) + ' cm².<br>' + t('SA=' + 2 * A + '+' + (s.a + s.b + s.c) * s.L + '=' + SA + '\\text{ cm}^{2}') + ' — an area, so cm².', ['The wrapper covers 5 faces: 2 triangles and 3 rectangles.', 'The three rectangles together are (perimeter of the triangle) × length.'], 'triangular prism SA', { exact: true });
          } },
          { id: '23c', level: 'BEG', outcome: 'M2', make: function (r, s) {
            var V = s.a * s.b / 2 * s.L;
            return fields('Melted, the chocolate (' + t('V=\\tfrac12(' + s.a + ')(' + s.b + ')(' + s.L + ')=' + V + '\\text{ cm}^{3}') + ') is poured into a measuring cup. State its volume in millilitres and in litres.', [
              { label: 'Volume:', after: 'mL', x: V, dp: 0, exact: true, alts: [{ v: V / 1000, code: 'conv-dir', hint: '1 cm³ = 1 mL exactly.' }] },
              { label: 'Volume:', after: 'L', x: V / 1000, dp: 3, exact: true, alts: [{ v: V / 100, code: 'conv-step', hint: '1 L = 1000 mL.' }, { v: V * 1000, code: 'conv-dir', hint: 'A litre is bigger than a millilitre, so the number gets smaller: ÷ 1000.' }] }],
              t('1\\text{ cm}^{3}=1\\text{ mL}') + ', so ' + t(V + '\\text{ cm}^{3}=' + V + '\\text{ mL}') + '. ' + t('1000\\text{ mL}=1\\text{ L}') + ', so ' + t(V + '\\text{ mL}=' + dec(V / 1000) + '\\text{ L}') + '.', ['1 cm³ = 1 mL, and 1000 mL = 1 L.'], 'cm³ to mL and L');
          } }] },
      { num: '24', shared: function (r) {
          if (r.chance(0.25)) return { b: 10, h: 12, s: 13 };
          var o = r.pick([[6, 4, 5], [8, 3, 5], [12, 8, 10], [16, 6, 10], [16, 15, 17], [18, 12, 15], [24, 9, 15], [10, 12, 13]]); return { b: o[0], h: o[1], s: o[2] };
        }, stem: function (s) { return '<i>(Written Response)</i> A monument is a square-based pyramid. Each side of the base is ' + t(s.b) + ' cm and the pyramid’s perpendicular height is ' + t(s.h) + ' cm.' + figWrap(HW.solid('sqpyramid', { s: s.b + ' cm', h: 'h = ' + s.h + ' cm', width: 230 })); },
        parts: [
          { id: '24a', level: 'EMG', make: function (r, s) {
            return near('Determine the slant height ' + t('s') + ' of a triangular face.', s.s, 1, 'cm', [
              { v: Math.hypot(s.h, s.b), code: 'formula', hint: 'The slant height’s foot is at the <b>middle</b> of a base edge, only half a side (' + t(s.b / 2) + ' cm) from the centre.' },
              { v: Math.sqrt(Math.abs(s.h * s.h - s.b * s.b / 4)), code: 'formula', hint: 'The slant height is the <b>hypotenuse</b>: ' + t('s^{2}=h^{2}+\\left(\\tfrac{b}{2}\\right)^{2}') + ' — add the squares.' },
              { v: s.h + s.b / 2, code: 'formula', hint: 'Use Pythagoras, not addition: ' + t('s=\\sqrt{h^{2}+(b/2)^{2}}') + '.' }],
              'The right triangle has legs ' + t('h=' + s.h) + ' and half a side, ' + t(s.b + '\\div 2=' + s.b / 2) + '.<br>' + t('s^{2}=' + s.h + '^{2}+' + s.b / 2 + '^{2}=' + (s.h * s.h + s.b * s.b / 4)) + ', so ' + t('s=' + s.s + '\\text{ cm}') + '.', ['The slant height runs from the apex to the middle of a base edge.', 'Use Pythagoras with ' + t('h') + ' and half the base side.'], 'pyramid slant height', { exact: true });
          } },
          { id: '24b', level: 'BEG', make: function (r, s) {
            var SA = s.b * s.b + 2 * s.b * s.s;
            return near('The slant height of each triangular face is ' + t('s=' + s.s) + ' cm. Determine the total surface area of the monument, including its base.', SA, 0, 'cm²', [
              { v: s.b * s.b + 2 * s.b * s.h, code: 'h-for-slant', hint: 'Surface area uses the <b>slant</b> height ' + t('s=' + s.s) + ', not the perpendicular height.' },
              { v: 2 * s.b * s.s, code: 'missing-face', hint: 'Include the square base: ' + t(s.b + '\\times ' + s.b) + '.' },
              { v: s.b * s.b + 4 * s.b * s.s, code: 'no-half', hint: 'Each triangle is ' + t('\\tfrac12 bs') + '.' },
              { v: s.b * s.b * s.h / 3, code: 'vol-sa', hint: 'That’s the volume.' }],
              'Base: ' + t(s.b + '\\times ' + s.b + '=' + s.b * s.b) + ' cm². Four triangles: ' + t('4\\left(\\tfrac12\\right)(' + s.b + ')(' + s.s + ')=' + 2 * s.b * s.s) + ' cm².<br>' + t('SA=' + s.b * s.b + '+' + 2 * s.b * s.s + '=' + SA + '\\text{ cm}^{2}') + '.', ['Square base plus four triangles, each ' + t('\\tfrac12 bs') + '.'], 'pyramid SA', { exact: true });
          } },
          { id: '24c', level: 'EMG', make: function (r, s) {
            var V = s.b * s.b * s.h / 3;
            return near('Determine the volume of the monument.', V, 0, 'cm³', [
              { v: s.b * s.b * s.s / 3, code: 'slant-for-h', hint: 'Volume uses the <b>perpendicular</b> height ' + t('h=' + s.h) + ', not the slant height.' },
              { v: s.b * s.b * s.h, code: 'no-third', hint: 'A pyramid holds ' + t('\\tfrac13') + ' of the prism on the same base.' },
              { v: s.b * s.h / 3, code: 'formula', hint: t('A_{\\text{Base}}') + ' is the area of the square base, ' + t(s.b + '^{2}') + '.' }],
              t('A_{\\text{Base}}=' + s.b + '^{2}=' + s.b * s.b + '\\text{ cm}^{2}') + '. ' + t('V=\\tfrac13 A_{\\text{Base}}h=\\tfrac13(' + s.b * s.b + ')(' + s.h + ')=' + num(V) + '\\text{ cm}^{3}') + '.', ['Pyramid: ' + t('V=\\tfrac13 A_{\\text{Base}}h') + ' with the perpendicular height.'], 'pyramid volume', { exact: true });
          } }] },
      { num: '25', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '25', level: 'EMG', make: function (r) {
          var rr = r.chance(0.2) ? 6 : r.int(3, 12), obj = r.pick(['paperweight', 'doorstop', 'garden ornament']);
          return mcVals(r, 'A solid glass ' + obj + ' is a hemisphere of radius ' + t(rr) + ' cm, resting flat side down. Its total surface area, including the flat circular base, to the nearest tenth of a cm², is' + figWrap(HW.solid('hemisphere', { r: 'r = ' + rr + ' cm', width: 200 })), rnd(3 * PI * rr * rr, 1), [
            { v: rnd(2 * PI * rr * rr, 1), code: 'hemi-nobase', why: 'That’s only the curved dome. The question includes the flat circular base: add ' + t('\\pi r^{2}') + '.' },
            { v: rnd(4 * PI * rr * rr, 1), code: 'sphere-for-hemi', why: 'That’s a whole sphere. A hemisphere with its base is ' + t('2\\pi r^{2}+\\pi r^{2}=3\\pi r^{2}') + '.' },
            { v: rnd(8 * PI * rr * rr, 1), code: 'diam-radius', why: 'Use the radius ' + t(rr) + ' cm, not the diameter.' }],
            function (v) { return t(F(v.toFixed(1)) + '\\text{ cm}^{2}'); },
            'Curved surface ' + t('2\\pi r^{2}') + ' plus flat base ' + t('\\pi r^{2}') + ': ' + t('SA=3\\pi r^{2}=3\\pi(' + rr + ')^{2}=' + 3 * rr * rr + '\\pi=' + dots(3 * PI * rr * rr, 3)) + ' ≈ ' + t(fx(3 * PI * rr * rr, 1) + '\\text{ cm}^{2}') + '.',
            ['A hemisphere’s curved surface is half a sphere’s: ' + t('2\\pi r^{2}') + '. The flat base is a circle.'], 'hemisphere SA with base r=' + rr);
        } }] },
      { num: '26', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '26', level: 'EMG', make: function (r) {
          var d, h; if (r.chance(0.2)) { d = 8; h = 10; } else { d = r.pick([6, 7, 8, 9, 10, 12]); h = r.int(8, 15); }
          var rr = d / 2, V = PI * rr * rr * h / 3;
          return near('A cone-shaped paper cup has a diameter of ' + t(d) + ' cm and a depth of ' + t(h) + ' cm. Its capacity, to the nearest cm³, is ________.' + figWrap(cupSVG(d + ' cm', h + ' cm')), V, 0, 'cm³', [
            { v: PI * d * d * h / 3, code: 'diam-radius', hint: 'Halve the diameter: ' + t('r=' + dec(rr)) + ' cm.' },
            { v: PI * rr * rr * h, code: 'no-third', hint: 'A cone holds ' + t('\\tfrac13') + ' of the cylinder on the same base.' },
            { v: PI * rr * rr * h / 2, code: 'formula', hint: 'The cone formula has ' + t('\\tfrac13') + ', not ' + t('\\tfrac12') + '.' }],
            'Halve the diameter: ' + t('r=' + dec(rr)) + ' cm. The depth is the perpendicular height.<br>' + t('V=\\tfrac13\\pi r^{2}h=\\tfrac13\\pi(' + dec(rr) + ')^{2}(' + h + ')=' + dots(V, 3)) + ' ≈ ' + t(fx(V, 0) + '\\text{ cm}^{3}') + '.', ['Cone: ' + t('V=\\tfrac13\\pi r^{2}h') + ', with ' + t('r') + ' = half the diameter.'], 'cone cup volume', { nr: true });
        } }] },
      { num: '27', section: 'Extension — micro- and mega-prefixes; the micrometer', stem: '<i>(Extension; Multiple Choice)</i> Consider the following four statements.', parts: [
        { id: '27', level: 'BEG', outcome: 'EXT', make: function (r) {
          var k = r.pick([0, 1, 1, 2, 3]), nm = r.int(2, 3), fi = r.sample([0, 1, 2, 3], k);
          var micro = r.sample(MICRO, nm), met = r.sample(MET, 4 - nm), all = r.shuffle(micro.concat(met));
          var ss = all.map(function (s, i) { var f = fi.indexOf(i) >= 0; return { tex: f ? s[1] : s[0], truth: !f, why: s[2] }; });
          return countFalseMC(r, ss, 'How many of these statements are false?', true);
        } }] },
      { num: '28', stem: '<i>(Multiple Choice)</i> The micrometer below has a measuring range of 0–25 mm and is accurate to ' + t('0.01') + ' mm. The sleeve scale has increments of ' + t('0.5') + ' mm and the thimble scale has increments of ' + t('0.01') + ' mm.', parts: [
        { id: '28', level: 'EMG', outcome: 'M1', make: function (r) {
          var half = r.int(10, 46), fine = r.int(5, 45); if (r.chance(0.15)) { half = 29; fine = 33; }
          var R = half * 0.5 + fine / 100, odd = half % 2 === 1, hv = odd ? R - 0.5 : R + 0.5;
          return mcVals(r, 'The reading is' + figWrap(microSVG(half, fine)), R, [
            { v: hv, code: 'read-half', why: odd ? 'The half-millimetre mark below the line has been uncovered — add the 0.5 mm.' : 'No half-millimetre mark is showing past the last whole millimetre: don’t add 0.5 mm.' },
            { v: R - 1, code: 'read-coarse', why: 'Count the whole-millimetre marks above the line again: the last one showing is ' + t(Math.floor(half / 2)) + '.' },
            { v: hv - 1, code: 'read-coarse', why: 'Read the sleeve again: last whole-mm mark above the line, plus 0.5 if a half mark below the line shows.' }],
            function (v) { return t(v.toFixed(2) + '\\text{ mm}'); },
            'Sleeve: the last mark the thimble has uncovered is ' + t((half * 0.5).toFixed(1) + '\\text{ mm}') + (odd ? ' (a half-millimetre mark below the line)' : '') + '. Thimble: the index line is on ' + t(fine) + ', so ' + t(fine + '\\times 0.01=' + (fine / 100).toFixed(2) + '\\text{ mm}') + '.<br>Reading ' + t((half * 0.5).toFixed(1) + '+' + (fine / 100).toFixed(2) + '=' + R.toFixed(2) + '\\text{ mm}') + '.',
            ['Sleeve reading: the last whole mm above the line, plus 0.5 if a half mark below the line is showing.', 'Add the thimble division at the index line × 0.01 mm.'], 'micrometer ' + R.toFixed(2));
        } }] },
      { num: '29', stem: '<i>(Written Response)</i>', parts: [
        { id: '29', level: 'PRG', outcome: 'M1', make: function (r) {
          var half = r.int(4, 46), fine = r.int(4, 46); if (r.chance(0.15)) { half = 13; fine = 8; }
          var R = half * 0.5 + fine / 100, odd = half % 2 === 1;
          return near('State the reading of this micrometer, accurate to ' + t('0.01') + ' mm.' + figWrap(microSVG(half, fine)), R, 2, 'mm', [
            { v: odd ? R - 0.5 : R + 0.5, code: 'read-half', hint: odd ? 'A half-millimetre mark below the index line is showing — add 0.5 mm to the whole millimetres.' : 'Only whole millimetres are showing past the last mark — no extra 0.5 mm.' },
            { v: Math.floor(half / 2) + fine / 10, code: 'read-fine', hint: 'Each thimble division is 0.01 mm: ' + t(fine + '\\times 0.01') + '.' },
            { v: R - 1, code: 'read-coarse', hint: 'Count the whole-millimetre marks above the line again.' },
            { v: R + 1, code: 'read-coarse', hint: 'Count the whole-millimetre marks above the line again — only marks the thimble has uncovered count.' }],
            'Sleeve: ' + t((half * 0.5).toFixed(1) + '\\text{ mm}') + (odd ? ' (the half-mm mark below the line is showing)' : '') + '. Thimble: ' + t(fine + '\\times 0.01=' + (fine / 100).toFixed(2) + '\\text{ mm}') + '.<br>Reading ' + t(R.toFixed(2) + '\\text{ mm}') + '.',
            ['Sleeve (whole mm, plus 0.5 if a half mark shows) + thimble division × 0.01 mm.'], 'micrometer reading ' + R.toFixed(2));
        } }] }
    ],
    extra: [
      /* ======================= Part A — One solid, every question ======================= */
      { num: '1', section: 'Extra practice A — One solid, every question', shared: function (r) {
          var o; for (var g = 0; g < 300; g++) {
            o = g === 0 && r.chance(0.25) ? { W: 1.40, D: 1.20, H: 0.85, d: 900, V0: 500, p: 38.50, fl: [14, 10.5, 17.5], dc: 20, hc: 40 }
              : { W: r.pick([1.20, 1.30, 1.40, 1.50]), D: r.pick([1.00, 1.10, 1.20]), H: r.pick([0.80, 0.85, 0.90]), d: r.pick([800, 850, 900, 1000]), V0: r.pick([400, 450, 500, 550, 600]), p: r.pick([32.50, 38.50, 42.00, 45.75]),
                fl: r.pick([[14, 10.5, 17.5], [12, 9, 15], [16, 12, 20], [10, 7.5, 12.5], [15, 8, 17], [12, 5, 13]]), dc: r.pick([16, 18, 20, 22, 24]), hc: r.pick([30, 35, 40, 45, 50]) };
            o.r = o.d / 2000; o.Vp = o.W * o.D * o.H; o.Ab = 0.5 * PI * o.r * o.r; o.Vc = o.Ab * o.D; o.V = o.Vp + o.Vc;
            o.walls = 2 * o.W * o.H + 2 * o.D * o.H; o.topx = o.W * o.D - 2 * o.r * o.D; o.curv = PI * o.r * o.D; o.ends = PI * o.r * o.r; o.SA = o.walls + o.topx + o.curv + o.ends;
            o.Lf = o.V0 / 1000 / o.Ab;
            if (o.d / 1000 <= o.W - 0.3 && o.Lf > 0.8 && o.Lf < 2.6 && o.fl[0] * 2 > o.dc) break;
          }
          return o;
        }, stem: function (s) { return '<b>The bread oven.</b> A backyard wood-fired bread oven is built in two pieces. The lower piece is a solid concrete plinth: a right rectangular prism ' + t(s.W.toFixed(2) + '\\text{ m}') + ' wide, ' + t(s.D.toFixed(2) + '\\text{ m}') + ' deep and ' + t(s.H.toFixed(2) + '\\text{ m}') + ' high. The upper piece is the baking chamber: a right prism whose base is a <b>semicircle</b> of diameter ' + t(s.d + '\\text{ mm}') + ', laid on its flat rectangular face on top of the plinth and running the full ' + t(s.D.toFixed(2) + '\\text{ m}') + ' depth. The red dashed segment marks the front edge of the flat face where the chamber meets the plinth — that whole face is <i>internal</i>.' + figWrap(ovenSVG(s.W, s.D, s.H, s.d / 1000, { W: s.W.toFixed(2) + ' m', D: s.D.toFixed(2) + ' m', H: s.H.toFixed(2) + ' m', d: s.d + ' mm' })); },
        parts: [
          { id: 'e1a', level: 'BEG', outcome: 'M2', make: function (r, s) {
            var dm = s.d / 1000;
            return fields('Convert the chamber’s diameter to metres with a unit factor, and state the radius ' + t('r') + ' you will substitute.', [
              { label: t('d='), after: 'm', x: dm, dp: 3, check: exactNum(dm, function (v) { if (v === s.d / 100) return { code: 'conv-step', hint: '1 m = <b>1000</b> mm.' }; if (v === s.d * 1000) return { code: 'conv-dir', hint: 'A metre is bigger than a millimetre, so the number gets smaller: ÷ 1000.' }; if (v === dm / 2) return { code: 'radius-diam', hint: 'This box is the diameter; the radius goes in the next box.' }; return null; }), key: plain(dm) },
              { label: t('r='), after: 'm', x: dm / 2, dp: 3, check: exactNum(dm / 2, function (v) { if (v === dm) return { code: 'radius-diam', hint: 'The radius is half the diameter.' }; return null; }), key: plain(dm / 2) }],
              t('\\dfrac{' + s.d + '\\text{ mm}}{1}\\times\\dfrac{1\\text{ m}}{1000\\text{ mm}}=' + dm.toFixed(3) + '\\text{ m}') + ', so ' + t('d=' + dm.toFixed(3) + '\\text{ m}') + ' and ' + t('r=' + (dm / 2).toFixed(3) + '\\text{ m}') + '.', ['1 m = 1000 mm. Put mm on the bottom of the unit factor so it cancels.'], 'oven diameter to m');
          } },
          { id: 'e1b', level: 'PRG', make: function (r, s) {
            return near('Determine the <b>total volume</b> of concrete and chamber together — the plinth plus the half-cylinder — to the nearest hundredth of a cubic metre.', s.V, 2, 'm³', [
              { v: s.Vp + 2 * s.Vc, code: 'formula', hint: 'The chamber is <b>half</b> a cylinder: its base is the semicircle ' + t('\\tfrac12\\pi r^{2}') + '.' },
              { v: s.Vp + 4 * s.Vc, code: 'diam-radius', hint: 'Use the radius ' + t(s.r.toFixed(3) + '\\text{ m}') + ', not the diameter.' },
              { v: s.Vp, code: 'missing-face', hint: 'Add the chamber’s volume too.' },
              { v: s.Vc, code: 'missing-face', hint: 'Add the plinth’s volume too.' }],
              '<b>Plinth:</b> ' + t('V=' + s.W.toFixed(2) + '\\times ' + s.D.toFixed(2) + '\\times ' + s.H.toFixed(2) + '=' + num(s.Vp)) + ' m³.<br><b>Chamber:</b> ' + t('A_{\\text{Base}}=\\tfrac12\\pi(' + s.r.toFixed(3) + ')^{2}=' + dots(s.Ab, 6)) + ' m², ' + t('V=' + dots(s.Ab, 6) + '\\times ' + s.D.toFixed(2) + '=' + dots(s.Vc, 6)) + ' m³.<br>Total ' + t('=' + dots(s.V, 6)) + ' ≈ ' + t(fx(s.V, 2) + '\\text{ m}^{3}') + '.',
              ['Plinth: length × width × height. Chamber: a prism whose base is a semicircle, ' + t('\\tfrac12\\pi r^{2}') + ', times its length.'], 'oven total volume');
          } },
          { id: 'e1c', level: 'EMG', outcome: 'M2', make: function (r, s) {
            var L = s.Vc * 1000;
            return near('Determine the <b>capacity of the baking chamber alone</b>, in litres, to the nearest litre. (' + t('1\\text{ m}^{3}=1000\\text{ L}') + ')', L, 0, 'L', [
              { v: 2 * L, code: 'formula', hint: 'The chamber is half a cylinder.' },
              { v: s.V * 1000, code: 'missing-face', hint: 'Only the chamber — not the concrete plinth.' },
              { v: s.Vc, code: 'conv-step', hint: 'That’s in m³. Multiply by 1000 to get litres.' }],
              t('V=\\tfrac12\\pi(' + s.r.toFixed(3) + ')^{2}(' + s.D.toFixed(2) + ')=' + dots(s.Vc, 6) + '\\text{ m}^{3}') + '; ' + t('\\times\\dfrac{1000\\text{ L}}{1\\text{ m}^{3}}=' + dots(L, 2)) + ' ≈ ' + t(fx(L, 0) + '\\text{ L}') + '.', ['Volume of the half-cylinder in m³, then × 1000.'], 'chamber capacity L');
          } },
          { id: 'e1d', level: 'ADV', make: function (r, s) {
            return near('Determine the <b>total outside surface area</b> of the finished oven, to the nearest hundredth of a square metre. The oven stands on the ground, so the bottom of the plinth is not counted; the rectangular face where the chamber meets the plinth is internal and is counted on <i>neither</i> piece.', s.SA, 2, 'm²', [
              { v: s.SA + s.W * s.D, code: 'extra-face', hint: 'The bottom of the plinth is on the ground — leave it out.' },
              { v: s.SA + 2 * s.r * s.D, code: 'extra-face', hint: 'The joining rectangle (' + t(num(2 * s.r) + '\\times ' + s.D.toFixed(2)) + ') is internal: take it off the plinth top.' },
              { v: s.SA + 4 * s.r * s.D, code: 'extra-face', hint: 'The joining rectangle is internal: it belongs to neither the plinth top nor the chamber.' },
              { v: s.SA + s.ends, code: 'formula', hint: 'Each end of the chamber is a <b>semi</b>circle: the two together make one circle, ' + t('\\pi r^{2}') + '.' },
              { v: s.SA + s.curv, code: 'formula', hint: 'The curved roof is half a cylinder’s curved surface: ' + t('\\pi r\\times\\text{length}') + '.' }],
              '<b>Kept:</b> four plinth walls ' + t('2(' + s.W.toFixed(2) + '\\times ' + s.H.toFixed(2) + ')+2(' + s.D.toFixed(2) + '\\times ' + s.H.toFixed(2) + ')=' + num(s.walls)) + '; the exposed plinth top ' + t(num(s.W * s.D) + '-' + num(2 * s.r * s.D) + '=' + num(s.topx)) + '; the curved roof ' + t('\\pi(' + s.r.toFixed(3) + ')(' + s.D.toFixed(2) + ')=' + dots(s.curv, 6)) + '; the two semicircular ends ' + t('\\pi(' + s.r.toFixed(3) + ')^{2}=' + dots(s.ends, 6)) + '.<br><b>Dropped:</b> the plinth bottom and the joining rectangle.<br>' + t('SA=' + dots(s.SA, 6)) + ' ≈ ' + t(fx(s.SA, 2) + '\\text{ m}^{2}') + '.',
              ['List every face you keep: 4 plinth walls, the part of the plinth top not under the chamber, the curved roof, 2 semicircular ends.', 'Drop the bottom (on the ground) and the joining rectangle (internal).'], 'oven surface area');
          } },
          { id: 'e1e', level: 'BEG', make: function (r, s) {
            var c = s.SA * s.p;
            return near('Weatherproof stucco costs $' + s.p.toFixed(2) + ' per square metre and is applied to every outside surface of the oven, an area of ' + t(dots(s.SA, 6) + '\\text{ m}^{2}') + ' (unrounded). Find the cost to the nearest cent, using the <b>unrounded</b> area.', c, 2, '', [
              { v: rnd(s.SA, 2) * s.p, code: 'early-round', hint: 'Use the unrounded area, then round the cost once at the end.' },
              { v: s.SA / s.p, code: 'per-rate', hint: 'Cost = area × price per square metre.' }],
              t(dots(s.SA, 6) + '\\times 38.50').replace('38.50', s.p.toFixed(2)) + ' ' + t('=' + dots(c, 4)) + ' ≈ $' + c.toFixed(2) + '. (The rounded area would have given $' + (rnd(s.SA, 2) * s.p).toFixed(2) + '.)', ['Cost = area × price, rounding only the final cost.'], 'stucco cost', { before: '$' });
          } },
          { id: 'e1f', level: 'PRG', make: function (r, s) {
            var Lcm = s.Lf * 100;
            return near('A second oven of the same design is to have a baking chamber holding exactly ' + t(s.V0 + '\\text{ L}') + ', with the same ' + t(s.d + '\\text{ mm}') + ' diameter. What chamber length (depth) is needed? Give it to the nearest centimetre.', Lcm, 0, 'cm', [
              { v: Lcm / 2, code: 'formula', hint: 'The chamber is <b>half</b> a cylinder: ' + t('V=\\tfrac12\\pi r^{2}L') + '.' },
              { v: Lcm / 4, code: 'diam-radius', hint: 'Use the radius ' + t(s.r.toFixed(3) + '\\text{ m}') + '.' },
              { v: s.Lf * 100000, code: 'conv-step', hint: 'Change litres to m³ first: ' + t('1000\\text{ L}=1\\text{ m}^{3}') + '.' }],
              t(s.V0 + '\\text{ L}=' + dec(s.V0 / 1000) + '\\text{ m}^{3}') + '. ' + t('L=\\dfrac{V}{\\tfrac12\\pi r^{2}}=\\dfrac{' + dec(s.V0 / 1000) + '}{' + dots(s.Ab, 6) + '}=' + dots(s.Lf, 6) + '\\text{ m}') + ' ≈ ' + t(fx(Lcm, 0) + '\\text{ cm}') + '.',
              ['Write the volume in m³, then solve ' + t('V=\\tfrac12\\pi r^{2}L') + ' for ' + t('L') + '.'], 'chamber length for volume',
              { pre: function (v) { return Math.abs(v - s.Lf) < 0.006 ? form('units', 'That’s the length in metres. Give it in <b>centimetres</b>.') : null; } });
          } },
          { id: 'e1g', level: 'ADV', make: function (r, s) {
            var rk = s.fl[0], hk = s.fl[1], sk = s.fl[2], rc = s.dc / 2, A = 2 * PI * rc * s.hc + PI * rk * sk;
            return fields('A stainless flue is fitted: a cylinder of diameter ' + t(dec(s.dc) + '.0\\text{ cm}') + ' and height ' + t(s.hc + '.0\\text{ cm}') + ', capped by a cone of base diameter ' + t(dec(2 * rk) + '\\text{ cm}') + ' and <i>perpendicular</i> height ' + t(dec(hk) + '\\text{ cm}') + '. Find the slant height of the cone, then the area of stainless sheet needed for the curved wall of the cylinder and the curved surface of the cone (no ends, no cap underside), in cm² to the nearest hundredth and then in m² to the nearest ten-thousandth.', [
              { label: 'Slant height ' + t('s='), after: 'cm', x: sk, dp: 1, exact: true, alts: [{ v: Math.hypot(hk, 2 * rk), code: 'diam-radius', hint: 'Use the cone’s radius, ' + t(dec(rk)) + ' cm, in Pythagoras.' }] },
              { label: 'Sheet area:', after: 'cm²', x: A, dp: 2, alts: [{ v: 2 * PI * rc * s.hc + PI * rk * hk, code: 'h-for-slant', hint: 'The cone’s curved surface uses the <b>slant</b> height: ' + t('\\pi r s') + '.' }, { v: 4 * PI * rc * s.hc + PI * rk * sk, code: 'diam-radius', hint: 'Use the cylinder’s radius ' + t(dec(rc)) + ' cm in ' + t('2\\pi r h') + '.' }, { v: A + PI * rc * rc * 2, code: 'extra-face', hint: 'No ends — only the curved surfaces.' }] },
              { label: 'Sheet area:', after: 'm²', x: A / 10000, dp: 4, alts: [{ v: A / 100, code: 'lin-factor', hint: 'For area, use the <b>squared</b> factor: ' + t('1\\text{ m}^{2}=100^{2}\\text{ cm}^{2}=10\\,000\\text{ cm}^{2}') + '.' }] }],
              'Cone: ' + t('r=' + dec(rk)) + ' cm, ' + t('s=\\sqrt{' + dec(hk) + '^{2}+' + rk + '^{2}}=' + dec(sk) + '\\text{ cm}') + '.<br>Cylinder wall ' + t('2\\pi(' + dec(rc) + ')(' + s.hc + ')=' + num(2 * rc * s.hc) + '\\pi') + '; cone ' + t('\\pi(' + rk + ')(' + dec(sk) + ')=' + num(rk * sk) + '\\pi') + '.<br>Total ' + t(num(2 * rc * s.hc + rk * sk) + '\\pi=' + dots(A, 4)) + ' ≈ ' + t(fx(A, 2) + '\\text{ cm}^{2}') + ' ' + t('=' + dots(A, 4) + '\\div 10\\,000') + ' ≈ ' + t(fx(A / 10000, 4) + '\\text{ m}^{2}') + '.',
              ['The cone’s slant height comes from Pythagoras with its radius and perpendicular height.', 'cm² → m²: divide by ' + t('100^{2}') + '.'], 'flue sheet area');
          } }] },
      { num: '2', shared: function (r) {
          var o; for (var g = 0; g < 300; g++) {
            o = g === 0 && r.chance(0.25) ? { C: 26.4, h: 3.8, V2: 50 } : { C: step(r, 18, 32, 0.2), h: step(r, 2.6, 4.4, 0.1) };
            o.r = o.C / (2 * PI); o.V = PI * o.r * o.r * o.h / 3; o.s = Math.hypot(o.r, o.h); o.Lat = PI * o.r * o.s; o.q = o.Lat / 48; o.n = Math.ceil(o.q);
            if (!o.V2) o.V2 = Math.round(o.V * r.pick([0.6, 0.65, 0.7, 0.75, 0.8]) / 5) * 5;
            o.r2 = Math.sqrt(3 * o.V2 / (PI * o.h)); o.C2 = 2 * PI * o.r2;
            if (frac(o.q) > 0.1 && frac(o.q) < 0.9 && o.V2 < o.V * 0.9) break;
          }
          return o;
        }, stem: function (s) { return '<b>The salt pile.</b> Road salt is stockpiled in a cone. A tape run around the base of the pile gives its circumference as ' + t(dec(s.C) + '\\text{ m}') + ', and a measuring pole gives its perpendicular height as ' + t(dec(s.h) + '\\text{ m}') + '.' + figWrap(HW.solid('cone', { h: 'h = ' + dec(s.h) + ' m', width: 210 })) + '<div class="small muted" style="text-align:center">circumference of the base: ' + dec(s.C) + ' m</div>'; },
        parts: [
          { id: 'e2a', level: 'EMG', make: function (r, s) {
            return near('The radius was never measured. Rearrange ' + t('C=2\\pi r') + ' and find ' + t('r') + ', to the nearest thousandth of a metre.', s.r, 3, 'm', [
              { v: s.C / PI, code: 'radius-diam', hint: t('C\\div\\pi') + ' is the diameter. Divide by ' + t('2\\pi') + '.' },
              { v: s.C / 2, code: 'formula', hint: t('r=\\dfrac{C}{2\\pi}') + ' — divide by ' + t('\\pi') + ' as well.' },
              { v: Math.sqrt(s.C / PI), code: 'formula', hint: 'That’s from the area formula. Here ' + t('C=2\\pi r') + '.' }],
              t('r=\\dfrac{C}{2\\pi}=\\dfrac{' + dec(s.C) + '}{2\\pi}=' + dots(s.r, 6)) + ' ≈ ' + t(fx(s.r, 3) + '\\text{ m}') + '. Keep the full value for the next parts.', ['Divide both sides of ' + t('C=2\\pi r') + ' by ' + t('2\\pi') + '.'], 'radius from circumference');
          } },
          { id: 'e2a2', sub: 'a-ii', level: 'BEG', make: function (r, s) {
            return mc(r, 'You found ' + t('r=\\dfrac{' + dec(s.C) + '}{2\\pi}\\approx ' + fx(s.r, 3)) + ' m. Why should you <b>not</b> round ' + t('r') + ' (say to ' + t(fx(s.r, 1)) + ') before going on?', [
              { html: t('r') + ' is about to be squared and used again in later parts, so a small rounding slip grows and spreads to every later answer.', right: true },
              { html: 'Rounding is never allowed in a measurement question.', code: 'reason', why: 'Rounding is fine — once, at the very end. The problem is rounding <i>part-way</i>.' },
              { html: 'Because the radius is in metres, not centimetres.', code: 'reason', why: 'The unit doesn’t matter here. Think about what happens to a small error when ' + t('r') + ' is squared.' },
              { html: 'Because the answer must be left in terms of ' + t('\\pi') + '.', code: 'reason', why: 'The question asks for decimals. The issue is that an early-rounded ' + t('r') + ' carries its error into every later step.' }],
              'Every later part uses ' + t('r') + ' (the volume squares it), so an early rounding error is magnified and copied forward. Carry full precision; round once at the end.', ['What happens to a small error in ' + t('r') + ' when ' + t('r') + ' is squared?'], 'why not round r');
          } },
          { id: 'e2b', level: 'PRG', make: function (r, s) {
            return near('Determine the volume of salt in the pile, to the nearest tenth of a cubic metre. (The radius is ' + t('r=\\dfrac{' + dec(s.C) + '}{2\\pi}\\approx ' + dots(s.r, 4)) + ' m.)', s.V, 1, 'm³', [
              { v: 3 * s.V, code: 'no-third', hint: 'A cone holds ' + t('\\tfrac13') + ' of the cylinder: ' + t('V=\\tfrac13\\pi r^{2}h') + '.' },
              { v: 4 * s.V, code: 'diam-radius', hint: 'You used the diameter. ' + t('r=C\\div 2\\pi') + '.' },
              { v: PI * rnd(s.r, 1) * rnd(s.r, 1) * s.h / 3, code: 'early-round', hint: 'Use the unrounded radius — rounding it early has changed the answer.' },
              { v: PI * s.r * s.r * s.s / 3, code: 'slant-for-h', hint: 'Volume uses the <b>perpendicular</b> height.' }],
              'A cone uses the perpendicular height ' + t('h=' + dec(s.h)) + ' m.<br>' + t('V=\\tfrac13\\pi r^{2}h=\\tfrac13\\pi(' + dots(s.r, 4) + ')^{2}(' + dec(s.h) + ')=' + dots(s.V, 4)) + ' ≈ ' + t(fx(s.V, 1) + '\\text{ m}^{3}') + '.', ['Cone: ' + t('V=\\tfrac13\\pi r^{2}h') + ' with the unrounded ' + t('r') + '.'], 'salt pile volume');
          } },
          { id: 'e2c', level: 'PRG', outcome: 'M2', make: function (r, s) {
            var ft = s.V * M3FT;
            return near('The pile holds ' + t(dots(s.V, 4) + '\\text{ m}^{3}') + '. Express that volume in cubic feet, to the nearest cubic foot, building the cubic factor from ' + t('1\\text{ ft}=0.3048\\text{ m}') + '.', ft, 0, 'ft³', [
              { v: s.V / 0.3048, code: 'lin-factor', hint: 'For volume the factor is <b>cubed</b>: ' + t('1\\text{ m}^{3}=\\left(\\tfrac{1}{0.3048}\\right)^{3}\\text{ ft}^{3}') + '.' },
              { v: s.V / 0.3048 / 0.3048, code: 'sq-factor', hint: 'That’s the squared (area) factor. Volume needs the cube.' },
              { v: s.V * Math.pow(0.3048, 3), code: 'conv-dir', hint: 'A cubic foot is smaller than a cubic metre, so the number of ft³ must be <b>bigger</b>.' }],
              t('1\\text{ ft}^{3}=(0.3048)^{3}\\text{ m}^{3}=0.028\\,316\\,846\\ldots\\text{ m}^{3}') + ', so ' + t('1\\text{ m}^{3}=35.314\\,666\\ldots\\text{ ft}^{3}') + '.<br>' + t(dots(s.V, 4) + '\\times 35.314\\,666\\ldots=' + dots(ft, 3)) + ' ≈ ' + t(fx(ft, 0) + '\\text{ ft}^{3}') + '.', ['Cube the length factor: ' + t('1\\text{ m}=\\tfrac{1}{0.3048}\\text{ ft}') + '.'], 'm³ to ft³');
          } },
          { id: 'e2d', level: 'PRG', make: function (r, s) {
            return fields('The pile (radius ' + t('r\\approx ' + dots(s.r, 4)) + ' m, perpendicular height ' + t(dec(s.h)) + ' m) is to be covered with tarpaulin. Find the slant height ' + t('s') + ' (nearest hundredth), then the <b>lateral</b> (curved) area of the cone (nearest tenth). Tarps come in ' + t('6.0\\text{ m}\\times 8.0\\text{ m}') + ' sheets; how many are needed?', [
              { label: t('s='), after: 'm', x: s.s, dp: 2, alts: [{ v: Math.sqrt(Math.abs(s.h * s.h - s.r * s.r)), code: 'formula', hint: 'The slant height is the hypotenuse: ' + t('s^{2}=h^{2}+r^{2}') + '.' }, { v: s.h + s.r, code: 'formula', hint: 'Use Pythagoras.' }] },
              { label: 'Lateral area:', after: 'm²', x: s.Lat, dp: 1, alts: [{ v: PI * s.r * s.h, code: 'h-for-slant', hint: 'The curved surface uses the slant height: ' + t('\\pi r s') + '.' }, { v: s.Lat + PI * s.r * s.r, code: 'extra-face', hint: 'Only the curved surface is covered — the ground is the base.' }] },
              { label: 'Tarps:', after: '', key: s.n, check: countCheck(s.n, s.q, 'up') }],
              t('s=\\sqrt{h^{2}+r^{2}}=\\sqrt{' + dec(s.h) + '^{2}+' + dots(s.r, 4) + '^{2}}=' + dots(s.s, 4)) + ' m.<br>Lateral area ' + t('=\\pi r s=' + dots(s.Lat, 4)) + ' ≈ ' + t(fx(s.Lat, 1) + '\\text{ m}^{2}') + '.<br>One tarp is ' + t('48\\text{ m}^{2}') + '; ' + t(dots(s.Lat, 3) + '\\div 48=' + dots(s.q, 3)) + ', so <b>' + s.n + ' tarps</b>.', ['Surface area takes the slant height; volume took the perpendicular height.', 'Round the number of tarps <b>up</b>.'], 'salt pile tarp');
          } },
          { id: 'e2e', level: 'EMG', outcome: 'M2', make: function (r, s) {
            return near('Salt has a density of ' + t('1.20') + ' tonnes per cubic metre. The pile holds ' + t(dots(s.V, 4) + '\\text{ m}^{3}') + '. Find the mass of the pile to the nearest tenth of a tonne.', s.V * 1.2, 1, 't', [
              { v: s.V / 1.2, code: 'per-rate', hint: 'Mass = volume × density (tonnes per m³): multiply.' }],
              t(dots(s.V, 4) + '\\text{ m}^{3}\\times\\dfrac{1.20\\text{ t}}{1\\text{ m}^{3}}=' + dots(1.2 * s.V, 3)) + ' ≈ ' + t(fx(1.2 * s.V, 1) + '\\text{ t}') + '.', ['Write the density as a unit factor so m³ cancels.'], 'salt mass');
          } },
          { id: 'e2f', level: 'ADV', make: function (r, s) {
            return near('Trucks remove salt until only ' + t(s.V2 + '.0\\text{ m}^{3}') + ' remains, and the pile keeps its ' + t(dec(s.h) + '\\text{ m}') + ' height (it was ' + t(dots(s.V, 2) + '\\text{ m}^{3}') + ' with base circumference ' + t(dec(s.C)) + ' m). What would a tape run around the base of the smaller pile now read, to the nearest tenth of a metre?', s.C2, 1, 'm', [
              { v: s.C * s.V2 / s.V, code: 'scale-k', hint: 'Volume is proportional to ' + t('r^{2}') + ' (at a fixed height), not to ' + t('r') + ' — so the circumference doesn’t shrink in the same proportion. Solve for ' + t('r') + ' first.' },
              { v: s.r2, code: 'formula', hint: 'That’s the new radius. The tape reads the circumference: ' + t('C=2\\pi r') + '.' },
              { v: PI * s.r2, code: 'formula', hint: 'Circumference is ' + t('2\\pi r') + '.' },
              { v: 2 * PI * Math.sqrt(s.V2 / (PI * s.h)), code: 'no-third', hint: 'A cone: ' + t('V=\\tfrac13\\pi r^{2}h') + ', so ' + t('r^{2}=\\dfrac{3V}{\\pi h}') + '.' }],
              t('r=\\sqrt{\\dfrac{3V}{\\pi h}}=\\sqrt{\\dfrac{3(' + s.V2 + ')}{\\pi(' + dec(s.h) + ')}}=' + dots(s.r2, 4) + '\\text{ m}') + '.<br>' + t('C=2\\pi r=' + dots(s.C2, 4)) + ' ≈ ' + t(fx(s.C2, 1) + '\\text{ m}') + '.', ['Solve ' + t('V=\\tfrac13\\pi r^{2}h') + ' for ' + t('r') + ', then find ' + t('C=2\\pi r') + '.'], 'new circumference');
          } }] },

      /* ======================= Part B — Measure, convert, compute ======================= */
      { num: '3', section: 'Extra practice B — Measure, convert, compute', shared: function (r) {
          var o = r.chance(0.25) ? { half: 19, fine: 37 } : { half: 2 * r.int(6, 19) + 1, fine: r.int(6, 44) };
          o.D = o.half * 0.5 + o.fine / 100; o.r = o.D / 2; o.V = 4 / 3 * PI * Math.pow(o.r, 3); o.SA = 4 * PI * o.r * o.r; o.m = o.V / 1000 * 7.85; o.q = 1000 / o.m; o.nb = Math.floor(o.q);
          return o;
        }, stem: function (s) { return 'A steel ball bearing is measured with a micrometer. The sleeve carries a mark every 0.5 mm — whole millimetres above the index line, half millimetres below it — and the thimble reads to 0.01 mm.' + figWrap(microSVG(s.half, s.fine)); },
        parts: [
          { id: 'e3a', level: 'PRG', outcome: 'M1', make: function (r, s) {
            var co = s.half * 0.5, fi = s.fine / 100;
            return fields('State the coarse (sleeve) reading and the fine (thimble) reading separately, then the diameter, written to the micrometer’s own precision.', [
              { label: 'Coarse:', after: 'mm', x: co, key: plain(co), check: exactNum(co, function (v) { if (v === co - 0.5) return { code: 'read-half', hint: 'A half-millimetre mark below the index line is showing too: add 0.5.' }; return null; }) },
              { label: 'Fine:', after: 'mm', x: fi, key: plain(fi), check: pre(exactNum(fi, function (v) { if (Math.abs(v - s.fine / 10) < 1e-9) return { code: 'read-fine', hint: 'Each thimble division is 0.01 mm.' }; return null; }), function (v) { return v === s.fine ? form('units', 'Right division — now write it in millimetres: ' + t(s.fine + '\\times 0.01') + '.') : null; }) },
              { label: 'Diameter:', after: 'mm', x: s.D, dp: 2, alts: [{ v: s.D - 0.5, code: 'read-half', hint: 'Include the half-millimetre mark below the line.' }] }],
              'Coarse: the last sleeve mark uncovered is the half-millimetre mark below the line at ' + t(co.toFixed(1)) + ' mm (not ' + t(co - 0.5) + '). Fine: ' + t(s.fine + '\\times 0.01=' + fi.toFixed(2) + '\\text{ mm}') + '.<br>Diameter ' + t(co.toFixed(1) + '+' + fi.toFixed(2) + '=' + s.D.toFixed(2) + '\\text{ mm}') + '.', ['Sleeve: last whole mm above the line + 0.5 if a half mark shows below it.', 'Thimble: division at the index line × 0.01 mm.'], 'bearing micrometer reading');
          } },
          { id: 'e3b', level: 'PRG', make: function (r, s) {
            return fields('The bearing’s diameter is ' + t(s.D.toFixed(2) + '\\text{ mm}') + '. Determine its volume to the nearest tenth of a cubic millimetre, and then in cubic centimetres to the nearest thousandth.', [
              { label: t('V='), after: 'mm³', x: s.V, dp: 1, alts: [{ v: 8 * s.V, code: 'diam-radius', hint: 'Halve the diameter: ' + t('r=' + num(s.r)) + ' mm.' }, { v: s.SA, code: 'vol-sa', hint: 'That’s the surface area. Volume is ' + t('\\tfrac43\\pi r^{3}') + '.' }] },
              { label: t('V='), after: 'cm³', x: s.V / 1000, dp: 3, alts: [{ v: s.V / 10, code: 'lin-factor', hint: 'Volume needs the cubic factor: ' + t('1\\text{ cm}^{3}=10^{3}\\text{ mm}^{3}') + '.' }, { v: s.V / 100, code: 'sq-factor', hint: 'Volume needs ' + t('10^{3}') + ', not ' + t('10^{2}') + '.' }] }],
              t('r=' + num(s.r) + '\\text{ mm}') + '. ' + t('V=\\tfrac43\\pi(' + num(s.r) + ')^{3}=' + dots(s.V, 4)) + ' ≈ ' + t(fx(s.V, 1) + '\\text{ mm}^{3}') + '.<br>' + t('\\times\\dfrac{1\\text{ cm}^{3}}{10^{3}\\text{ mm}^{3}}=' + dots(s.V / 1000, 5)) + ' ≈ ' + t(fx(s.V / 1000, 3) + '\\text{ cm}^{3}') + '.', ['Sphere: ' + t('V=\\tfrac43\\pi r^{3}') + '. Then ' + t('1\\text{ cm}^{3}=1000\\text{ mm}^{3}') + '.'], 'bearing volume');
          } },
          { id: 'e3c', level: 'PRG', make: function (r, s) {
            return fields('The bearing’s diameter is ' + t(s.D.toFixed(2) + '\\text{ mm}') + '. Determine its surface area in square millimetres and in square centimetres, each to the nearest hundredth.', [
              { label: t('SA='), after: 'mm²', x: s.SA, dp: 2, alts: [{ v: 4 * s.SA, code: 'diam-radius', hint: 'Use the radius, ' + t(num(s.r)) + ' mm.' }, { v: s.SA / 2, code: 'formula', hint: 'A sphere’s surface area is ' + t('4\\pi r^{2}') + '.' }] },
              { label: t('SA='), after: 'cm²', x: s.SA / 100, dp: 2, alts: [{ v: s.SA / 10, code: 'lin-factor', hint: 'Area needs the squared factor: ' + t('1\\text{ cm}^{2}=10^{2}\\text{ mm}^{2}') + '.' }, { v: s.SA / 1000, code: 'formula', hint: 'That’s the cubic factor. For area, divide by ' + t('10^{2}=100') + '.' }] }],
              t('SA=4\\pi(' + num(s.r) + ')^{2}=' + dots(s.SA, 4)) + ' ≈ ' + t(fx(s.SA, 2) + '\\text{ mm}^{2}') + '; ' + t('\\div 10^{2}') + ' gives ' + t(fx(s.SA / 100, 2) + '\\text{ cm}^{2}') + '.', ['Sphere: ' + t('SA=4\\pi r^{2}') + '. Area factor: ' + t('1\\text{ cm}^{2}=100\\text{ mm}^{2}') + '.'], 'bearing SA');
          } },
          { id: 'e3d', level: 'PRG', outcome: 'M2', make: function (r, s) {
            return fields('One bearing has a volume of ' + t(dots(s.V / 1000, 6) + '\\text{ cm}^{3}') + '. Steel has a density of ' + t('7.85\\text{ g/cm}^{3}') + '. Find the mass of one bearing to the nearest hundredth of a gram, and then the greatest whole number of bearings in a ' + t('1.00\\text{ kg}') + ' bag.', [
              { label: 'Mass:', after: 'g', x: s.m, dp: 2, alts: [{ v: s.V / 1000 / 7.85, code: 'per-rate', hint: 'Mass = volume × density.' }, { v: s.V * 7.85, code: 'units', hint: 'The density is per <b>cm³</b>; use the volume in cm³.' }] },
              { label: 'Bearings:', after: '', key: s.nb, check: countCheck(s.nb, s.q, 'down') }],
              t('m=' + dots(s.V / 1000, 6) + '\\times 7.85=' + dots(s.m, 4)) + ' ≈ ' + t(fx(s.m, 2) + '\\text{ g}') + '.<br>' + t('\\dfrac{1000\\text{ g}}{' + dots(s.m, 4) + '\\text{ g}}=' + dots(s.q, 3)) + ', so <b>' + s.nb + '</b> whole bearings.', ['Mass = volume (cm³) × density (g/cm³).', '1 kg = 1000 g. Only whole bearings count.'], 'bearing mass and count');
          } },
          { id: 'e3e', level: 'ADV', make: function (r, s) {
            var f = Math.pow((s.D - 0.5) / s.D, 3);
            return near('The bearing’s diameter is ' + t(s.D.toFixed(2) + '\\text{ mm}') + '. A student reads the sleeve as ' + t(dec(s.half * 0.5 - 0.5)) + ' instead of ' + t(dec(s.half * 0.5)) + ' and reports ' + t((s.D - 0.5).toFixed(2) + '\\text{ mm}') + '. Without recomputing from scratch, state the factor by which that student’s <i>volume</i> would be wrong (student’s volume ÷ true volume), to three decimal places.', f, 3, '', [
              { v: (s.D - 0.5) / s.D, code: 'scale-k', hint: 'That’s the <b>linear</b> factor. Volume depends on ' + t('d^{3}') + ', so cube it.' },
              { v: Math.pow((s.D - 0.5) / s.D, 2), code: 'scale-k', hint: 'Volume depends on the <b>cube</b> of the diameter, not the square.' },
              { v: 1 / f, code: 'ratio-flip', hint: 'Student’s volume ÷ true volume — your ratio is upside down.' }],
              'Volume is proportional to ' + t('d^{3}') + ', so the factor is ' + t('\\left(\\dfrac{' + (s.D - 0.5).toFixed(2) + '}{' + s.D.toFixed(2) + '}\\right)^{3}=(' + dots((s.D - 0.5) / s.D, 6) + ')^{3}=' + dots(f, 5)) + ' ≈ ' + t(fx(f, 3)) + '. It isn’t simply ' + t('\\tfrac{' + (s.D - 0.5).toFixed(2) + '}{' + s.D.toFixed(2) + '}') + ': a linear factor is <b>cubed</b> for a volume.', ['Every length in the volume formula is scaled by the same factor. Volume has three lengths multiplied.'], 'misread volume factor');
          } }] },
      { num: '4', shared: function (r) {
          var o = r.chance(0.25) ? { M: 27, N: 7, n: 250, p: 185, rho: 8.47 } : { M: r.int(18, 34), N: r.pick([1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 2, 4, 6, 8]), n: r.pick([100, 150, 200, 250, 300, 500]), p: r.pick([150, 165, 185, 200, 240]), rho: r.pick([8.40, 8.47, 8.53]) };
          o.D = o.M + 0.05 * o.N; o.r = o.D / 2; o.V = 2 / 3 * PI * Math.pow(o.r, 3); o.Sc = 2 * PI * o.r * o.r; o.cost = o.n * o.Sc / 1e6 * o.p; o.mk = o.V / 1000 * o.rho; o.q = 1000 / o.mk; o.nk = Math.floor(o.q);
          return o;
        }, stem: function (s) { return 'A solid brass drawer knob is a <b>hemisphere</b>. Its diameter is measured with a vernier caliper reading to ' + t('0.05') + ' mm.' + figWrap(vernierSVG(s.M, s.N)); },
        parts: [
          { id: 'e4a', level: 'PRG', outcome: 'M1', make: function (r, s) {
            var fi = s.N * 0.05;
            return fields('State the coarse reading, the fine reading, and the total (to the caliper’s own precision). Then state the radius.', [
              { label: 'Coarse:', after: 'mm', x: s.M, key: s.M, check: exactNum(s.M, function (v) { if (v === s.M + 1) return { code: 'read-coarse', hint: 'Use the last main-scale mark the index has <b>passed</b>.' }; return null; }) },
              { label: 'Fine:', after: 'mm', x: fi, key: plain(fi), check: pre(exactNum(fi, function (v) { if (Math.abs(v - s.N / 100) < 1e-9) return { code: 'read-hundredths', hint: 'Each vernier division is 0.05 mm.' }; return null; }), function (v) { return v === s.N ? form('units', 'Right mark — now multiply by 0.05 mm.') : null; }) },
              { label: 'Total:', after: 'mm', x: s.D, dp: 2, alts: [{ v: s.M + s.N / 100, code: 'read-hundredths', hint: 'Fine = matching mark × 0.05 mm.' }] },
              { label: 'Radius:', after: 'mm', x: s.r, dp: 3, exact: true, alts: [{ v: s.D, code: 'radius-diam', hint: 'The radius is half the diameter.' }] }],
              'Coarse: the vernier’s 0 has passed ' + t(s.M) + ' mm. Fine: mark ' + t(s.N) + ' lines up: ' + t(s.N + '\\times 0.05=' + fi.toFixed(2) + '\\text{ mm}') + '.<br>Total ' + t(s.D.toFixed(2) + '\\text{ mm}') + ', so ' + t('r=' + num(s.r) + '\\text{ mm}') + '.', ['Coarse at the index; fine = matching vernier mark × 0.05 mm.'], 'knob caliper reading');
          } },
          { id: 'e4b', level: 'PRG', make: function (r, s) {
            return fields('The knob’s radius is ' + t(num(s.r) + '\\text{ mm}') + '. Determine the volume of brass in one knob, in cubic millimetres to the nearest hundredth and in cubic centimetres to the nearest thousandth.', [
              { label: t('V='), after: 'mm³', x: s.V, dp: 2, alts: [{ v: 2 * s.V, code: 'sphere-for-hemi', hint: 'A hemisphere is half a sphere: ' + t('V=\\tfrac23\\pi r^{3}') + '.' }, { v: 8 * s.V, code: 'diam-radius', hint: 'Use the radius.' }] },
              { label: t('V='), after: 'cm³', x: s.V / 1000, dp: 3, alts: [{ v: s.V / 100, code: 'sq-factor', hint: t('1\\text{ cm}^{3}=1000\\text{ mm}^{3}') + '.' }, { v: s.V / 10, code: 'lin-factor', hint: t('1\\text{ cm}^{3}=10^{3}\\text{ mm}^{3}') + '.' }] }],
              t('V=\\tfrac23\\pi(' + num(s.r) + ')^{3}=' + dots(s.V, 4)) + ' ≈ ' + t(fx(s.V, 2) + '\\text{ mm}^{3}') + ' ' + t('=' + fx(s.V / 1000, 3) + '\\text{ cm}^{3}') + '.', ['Hemisphere: ' + t('V=\\tfrac23\\pi r^{3}') + '.'], 'knob volume');
          } },
          { id: 'e4c', level: 'PRG', make: function (r, s) {
            return near('The knob’s radius is ' + t(num(s.r) + '\\text{ mm}') + '. The <b>curved</b> surface is chrome-plated; the flat circular face is glued to the drawer and is <i>not</i> plated. Find the plated area in square millimetres to the nearest hundredth.', s.Sc, 2, 'mm²', [
              { v: 1.5 * s.Sc, code: 'hemi-base', hint: 'The flat face is glued to the drawer and isn’t plated: use ' + t('2\\pi r^{2}') + ', not ' + t('3\\pi r^{2}') + '.' },
              { v: 2 * s.Sc, code: 'sphere-for-hemi', hint: 'Only half a sphere’s surface: ' + t('2\\pi r^{2}') + '.' },
              { v: 4 * s.Sc, code: 'diam-radius', hint: 'Use the radius.' }],
              'The wording selects the curved surface only, ' + t('2\\pi r^{2}') + ': ' + t('2\\pi(' + num(s.r) + ')^{2}=' + dots(s.Sc, 4)) + ' ≈ ' + t(fx(s.Sc, 2) + '\\text{ mm}^{2}') + '.', ['Which surfaces are plated? The flat face isn’t.'], 'knob plated area');
          } },
          { id: 'e4d', level: 'ADV', outcome: 'M2', make: function (r, s) {
            return near('Each knob has ' + t(dots(s.Sc, 4) + '\\text{ mm}^{2}') + ' of plated surface. Plating costs $' + s.p.toFixed(2) + ' per square metre. Find the cost of plating a batch of ' + t(s.n) + ' knobs, to the nearest cent.', s.cost, 2, '', [
              { v: s.cost * 1000, code: 'lin-factor', hint: 'Area needs the squared factor: ' + t('1\\text{ m}^{2}=1000^{2}\\text{ mm}^{2}=10^{6}\\text{ mm}^{2}') + '.' },
              { v: s.cost * 100, code: 'conv-step', hint: 'Check the factor: ' + t('1\\text{ m}^{2}=10^{6}\\text{ mm}^{2}') + '.' },
              { v: s.cost / s.n, code: 'per-rate', hint: 'That’s one knob. The batch has ' + t(s.n) + '.' },
              { v: s.cost * 1.5, code: 'hemi-base', hint: 'Only the curved surface is plated.' }],
              t(s.n + '\\times ' + dots(s.Sc, 4) + '=' + dots(s.n * s.Sc, 2) + '\\text{ mm}^{2}') + '. ' + t('1\\text{ m}^{2}=1000^{2}\\text{ mm}^{2}=10^{6}\\text{ mm}^{2}') + ' (the exponent is 2 because area has two dimensions), so ' + t(dots(s.n * s.Sc / 1e6, 6) + '\\text{ m}^{2}') + '.<br>Cost ' + t('=' + dots(s.n * s.Sc / 1e6, 6) + '\\times ' + s.p.toFixed(2) + '=' + dots(s.cost, 4)) + ' ≈ $' + s.cost.toFixed(2) + '.', ['Total area in mm², then change to m² with ' + t('1\\text{ m}^{2}=10^{6}\\text{ mm}^{2}') + '.'], 'plating cost', { before: '$' });
          } },
          { id: 'e4e', level: 'PRG', outcome: 'M2', make: function (r, s) {
            return { prompt: 'Each knob holds ' + t(dots(s.V / 1000, 6) + '\\text{ cm}^{3}') + ' of brass. Brass has a density of ' + t(s.rho.toFixed(2) + '\\text{ g/cm}^{3}') + '. How many whole knobs can be cast from ' + t('1.00\\text{ kg}') + ' of brass, if none is wasted?', input: { type: 'number', after: 'knobs' }, key: String(s.nk), answer: t(s.nk) + ' knobs', text: 'knobs from 1 kg',
              check: countCheck(s.nk, s.q, 'down', function (v) { if (Math.abs(v - Math.floor(1000 * s.rho / (s.V / 1000))) < 1) return { code: 'per-rate', hint: 'Mass of one knob = volume × density; then divide 1000 g by it.' }; return null; }),
              solution: 'One knob: ' + t(dots(s.V / 1000, 6) + '\\times ' + s.rho.toFixed(2) + '=' + dots(s.mk, 4) + '\\text{ g}') + '.<br>' + t('1000\\div ' + dots(s.mk, 4) + '=' + dots(s.q, 3)) + ', so <b>' + s.nk + '</b> whole knobs.', hints: ['Find the mass of one knob first (volume × density).', 'Only complete knobs count.'], bad: [String(s.nk + 1)] };
          } }] },
      { num: '5', shared: function (r) {
          var o; for (var g = 0; g < 300; g++) {
            o = g === 0 && r.chance(0.25) ? { k: 3, S: 22, C: 1.86, dep: 88.0, G: 70 } : (function () { var k = r.pick([3, 4]), S = r.int(18, 23), est = k * S, e = 0.06 + 0.09 * r.int(0, 10) / 10; return { k: k, S: S, C: rnd(PI * est / (1 + e) / 100, 2), dep: r.int(70, 95), G: est + r.int(4, 10) }; })();
            o.est = o.k * o.S; o.dt = o.C * 100 / PI; o.pe = (o.est - o.dt) / o.dt * 100; o.Ve = PI * Math.pow(o.est / 2, 2) * o.dep / 1000; o.Vt = PI * Math.pow(o.dt / 2, 2) * o.dep / 1000; o.pv = (o.Ve - o.Vt) / o.Vt * 100;
            if (o.pe > 5 && o.pe < 16) break;
          }
          return o;
        }, stem: function (s) { return '<b>A referent against a tape.</b> Kavi estimates the top of a cylindrical rain barrel by laying his hand-spans across it: it takes exactly ' + t(s.k) + ' spans, and he takes his span to be ' + t(s.S + '\\text{ cm}') + '. A tape is then run <i>around</i> the barrel and reads a circumference of ' + t(s.C.toFixed(2) + '\\text{ m}') + ', and the inside depth is measured as ' + t(s.dep + '.0\\text{ cm}') + '.'; },
        parts: [
          { id: 'e5a', level: 'EMG', outcome: 'M1', make: function (r, s) {
            return fields('State Kavi’s estimated diameter, then find the diameter the tape gives, to the nearest hundredth of a centimetre.', [
              { label: 'Estimate:', after: 'cm', x: s.est, key: s.est, check: exactNum(s.est) },
              { label: 'Tape:', after: 'cm', x: s.dt, dp: 2, alts: [{ v: s.dt / 2, code: 'formula', hint: t('C=\\pi d') + ', so ' + t('d=C\\div\\pi') + ' (not ' + t('2\\pi') + ').' }, { v: s.C * 100 * PI, code: 'formula', hint: t('d=C\\div\\pi') + '.' }] }],
              'Estimate: ' + t(s.k + '\\times ' + s.S + '=' + s.est + '\\text{ cm}') + '.<br>Tape: ' + t('C=' + s.C.toFixed(2) + '\\text{ m}=' + num(s.C * 100) + '\\text{ cm}') + ', ' + t('d=\\dfrac{C}{\\pi}=' + dots(s.dt, 4)) + ' ≈ ' + t(fx(s.dt, 2) + '\\text{ cm}') + '.', ['Change the circumference to cm, then ' + t('d=C\\div\\pi') + '.'], 'barrel diameters');
          } },
          { id: 'e5b', level: 'PRG', outcome: 'M1', make: function (r, s) {
            return near('Kavi’s estimated diameter is ' + t(s.est + '\\text{ cm}') + '; the tape gives ' + t(dots(s.dt, 4) + '\\text{ cm}') + '. Find the <b>percent error</b> of the estimate, to the nearest tenth of a percent, taking the tape’s value as the true one.', s.pe, 1, '%', [
              { v: (s.est - s.dt) / s.est * 100, code: 'pct-base', hint: 'Divide by the <b>true</b> value (the tape’s), not the estimate.' }],
              t('\\dfrac{|' + s.est + '-' + dots(s.dt, 4) + '|}{' + dots(s.dt, 4) + '}\\times 100=' + dots(s.pe, 4)) + ' ≈ ' + t(fx(s.pe, 1) + '\\%') + ' (an over-estimate).', ['Percent error = |estimate − true| ÷ true × 100.'], 'percent error diameter',
              { pre: function (v) { return Math.abs(v - s.pe / 100) < 0.0006 ? form('not-pct', 'Multiply by 100 to give a percent.') : null; } });
          } },
          { id: 'e5c', level: 'PRG', make: function (r, s) {
            return fields('The barrel’s inside depth is ' + t(s.dep + '.0\\text{ cm}') + '. Find its capacity in litres, to the nearest tenth, from Kavi’s estimated diameter (' + t(s.est) + ' cm) and then from the tape’s diameter (' + t(dots(s.dt, 4)) + ' cm).', [
              { label: 'From the estimate:', after: 'L', x: s.Ve, dp: 1, alts: [{ v: 4 * s.Ve, code: 'diam-radius', hint: 'Halve the diameter: ' + t('r=' + num(s.est / 2)) + ' cm.' }, { v: s.Ve * 10, code: 'conv-step', hint: t('1\\text{ L}=1000\\text{ cm}^{3}') + '.' }] },
              { label: 'From the tape:', after: 'L', x: s.Vt, dp: 1, alts: [{ v: 4 * s.Vt, code: 'diam-radius', hint: 'Halve the diameter.' }, { v: s.Vt * 10, code: 'conv-step', hint: t('1\\text{ L}=1000\\text{ cm}^{3}') + '.' }] }],
              'Estimate: ' + t('\\pi(' + num(s.est / 2) + ')^{2}(' + s.dep + ')=' + dots(s.Ve * 1000, 2) + '\\text{ cm}^{3}') + ' ≈ ' + t(fx(s.Ve, 1) + '\\text{ L}') + '.<br>Tape: ' + t('r=' + dots(s.dt / 2, 4)) + ', ' + t('\\pi r^{2}(' + s.dep + ')=' + dots(s.Vt * 1000, 2) + '\\text{ cm}^{3}') + ' ≈ ' + t(fx(s.Vt, 1) + '\\text{ L}') + '.', ['Cylinder: ' + t('V=\\pi r^{2}h') + ' in cm³, then ÷ 1000 for litres.'], 'barrel capacities');
          } },
          { id: 'e5d', level: 'ADV', make: function (r, s) {
            return near('From Kavi’s estimate the barrel holds ' + t(dots(s.Ve, 3) + '\\text{ L}') + '; from the tape it holds ' + t(dots(s.Vt, 3) + '\\text{ L}') + '. The diameter estimate was ' + t(fx(s.pe, 1) + '\\%') + ' too big. Find the percent error of the estimated <i>capacity</i>, to the nearest tenth of a percent.', s.pv, 1, '%', [
              { v: 2 * s.pe, code: 'double-err', hint: 'Close, but not exactly double: capacity depends on ' + t('r^{2}') + ', so the error <b>factor</b> is squared: ' + t('(1+e)^{2}') + ', not ' + t('1+2e') + '.' },
              { v: s.pe, code: 'scale-k', hint: 'Capacity depends on ' + t('r^{2}') + ', so its error is bigger than the diameter’s.' },
              { v: (s.Ve - s.Vt) / s.Ve * 100, code: 'pct-base', hint: 'Divide by the true (tape) capacity.' }],
              t('\\dfrac{' + dots(s.Ve, 3) + '-' + dots(s.Vt, 3) + '}{' + dots(s.Vt, 3) + '}\\times 100=' + dots(s.pv, 4)) + ' ≈ ' + t(fx(s.pv, 1) + '\\%') + '.<br>Why: the diameter’s error factor is ' + t(dots(1 + s.pe / 100, 6)) + ' and ' + t('(' + dots(1 + s.pe / 100, 6) + ')^{2}=' + dots(1 + s.pv / 100, 6)) + ' — the capacity’s factor. ' + t('V=\\pi r^{2}h') + ' and only ' + t('r') + ' is wrong, so the factor is <b>squared</b>, not doubled (doubling would give ' + t(fx(2 * s.pe, 1) + '\\%') + ').', ['Percent error = |estimate − true| ÷ true × 100, using the two capacities.'], 'percent error capacity');
          } },
          { id: 'e5e', level: 'EMG', outcome: 'M1', make: function (r, s) {
            var rows = [{ id: 'gate', html: '(i) whether the barrel will fit through a ' + t(s.G + '\\text{ cm}') + ' gateway' }, { id: 'dose', html: '(ii) how much mosquito treatment to add, at 2 mL per 10 L of water' }];
            var cols = [{ id: 'ok', html: 'Span estimate is good enough' }, { id: 'tape', html: 'Measure: tape measure, to the nearest mm' }];
            return B.grid('Kavi’s estimate is ' + t(s.est) + ' cm (true ' + t(fx(s.dt, 1)) + ' cm); its capacity is ' + t(fx(s.pv, 0) + '\\%') + ' too big. For each job, is the span estimate good enough?', rows, cols, { gate: 'ok', dose: 'tape' }, {
              why: function (row) { return row === 'gate' ? { code: 'tolerance', hint: 'Even the over-estimate (' + s.est + ' cm) is less than ' + s.G + ' cm — the true barrel is smaller still. The estimate settles it.' } : { code: 'tolerance', hint: 'A ' + fx(s.pv, 0) + '% error in the capacity means a ' + fx(s.pv, 0) + '% overdose. Dosing needs a measured diameter.' }; } },
              '(i) <b>Good enough</b>: ' + s.est + ' cm already clears ' + s.G + ' cm, and the true diameter is smaller. (ii) <b>Not good enough</b>: the estimate gives ' + t(fx(s.Ve / 5, 1)) + ' mL against the true ' + t(fx(s.Vt / 5, 1)) + ' mL. Run a <b>tape measure</b> around the barrel, read to the nearest millimetre.', ['How big is the error compared with the margin each job allows?'], 'referent fit for purpose');
          } }] },

      /* ======================= Part C — Composite solids ======================= */
      { num: '6', section: 'Extra practice C — Composite solids', shared: function (r) {
          var o; for (var g = 0; g < 300; g++) {
            o = g === 0 && r.chance(0.25) ? { L: 24, W: 10, H: 6, d: 8, V2: 500 } : { L: r.pick([20, 24, 30]), W: r.pick([9, 10, 12]), H: r.pick([5, 6, 8]), d: r.pick([6, 7, 8]), V2: r.pick([300, 350, 400, 450, 500, 600]) };
            o.r = o.d / 2; o.Vb = o.L * o.W * o.H; o.Vg = 0.5 * PI * o.r * o.r * o.L; o.V = o.Vb - o.Vg; o.SAb = 2 * (o.L * o.W + o.L * o.H + o.W * o.H); o.SA = o.SAb - o.d * o.L - PI * o.r * o.r + PI * o.r * o.L;
            o.r2 = Math.sqrt(2 * o.V2 / (PI * o.L)); o.d2 = 2 * o.r2;
            if (o.d <= o.W - 2 && o.r < o.H - 1 && o.d2 < o.W - 0.5 && o.r2 < o.H - 0.5 && Math.abs(o.V2 - o.Vg) > 30) break;
          }
          return o;
        }, stem: function (s) { return 'A rectangular block of wood measures ' + t(s.L + '.0\\text{ cm}') + ' long, ' + t(s.W + '.0\\text{ cm}') + ' wide and ' + t(s.H + '.0\\text{ cm}') + ' high. A groove whose cross section is a <b>semicircle</b> of diameter ' + t(s.d + '.0\\text{ cm}') + ' is routed straight along the middle of the top face, running the whole ' + t(s.L + '.0\\text{ cm}') + ' length.' + figWrap(grooveSVG(s.L, s.W, s.H, s.d, { L: s.L + '.0 cm', W: s.W + '.0 cm', H: s.H + '.0 cm', d: s.d + '.0 cm' })); },
        parts: [
          { id: 'e6a', level: 'PRG', make: function (r, s) {
            return near('Determine the volume of wood remaining, to the nearest tenth of a cubic centimetre.', s.V, 1, 'cm³', [
              { v: s.Vb - 2 * s.Vg, code: 'formula', hint: 'The groove is <b>half</b> a cylinder: base ' + t('\\tfrac12\\pi r^{2}') + '.' },
              { v: s.Vb - 4 * s.Vg, code: 'diam-radius', hint: 'Use the radius ' + t(num(s.r)) + ' cm.' },
              { v: s.Vg, code: 'formula', hint: 'That’s the groove. Subtract it from the block.' },
              { v: s.Vb, code: 'missing-face', hint: 'Subtract the groove.' }],
              t('V=(' + s.L + ')(' + s.W + ')(' + s.H + ')-\\tfrac12\\pi(' + num(s.r) + ')^{2}(' + s.L + ')=' + s.Vb + '-' + num(0.5 * s.r * s.r * s.L) + '\\pi=' + dots(s.V, 4)) + ' ≈ ' + t(fx(s.V, 1) + '\\text{ cm}^{3}') + '.', ['Block (rectangular prism) minus groove (prism with a semicircular base).'], 'grooved block volume');
          } },
          { id: 'e6b', level: 'ADV', make: function (r, s) {
            return near('Determine the total surface area of the grooved block, to the nearest tenth of a square centimetre. Take every outside face, including the two ends and the curved floor of the groove.', s.SA, 1, 'cm²', [
              { v: s.SA + s.d * s.L, code: 'extra-face', hint: 'The groove removed a ' + t(s.d + '\\times ' + s.L) + ' strip of the top face.' },
              { v: s.SA + PI * s.r * s.r, code: 'extra-face', hint: 'Each end lost a semicircle: take off ' + t('2\\times\\tfrac12\\pi r^{2}') + '.' },
              { v: s.SA - PI * s.r * s.L, code: 'missing-face', hint: 'The groove <b>adds</b> its curved floor, ' + t('\\pi r L') + '.' },
              { v: s.SA + PI * s.r * s.L, code: 'formula', hint: 'The groove floor is half a cylinder’s curved surface: ' + t('\\pi r L') + ', not ' + t('2\\pi r L') + '.' },
              { v: s.SAb, code: 'missing-face', hint: 'That’s the plain block. Remove the strip and the two semicircles, then add the groove floor.' }],
              'Plain block: ' + t('2(' + s.L + '\\cdot' + s.W + '+' + s.L + '\\cdot' + s.H + '+' + s.W + '\\cdot' + s.H + ')=' + s.SAb) + '.<br>Removed: strip ' + t(s.d + '\\times ' + s.L + '=' + s.d * s.L) + ' and two semicircles ' + t('\\pi(' + num(s.r) + ')^{2}') + '. Added: groove floor ' + t('\\pi(' + num(s.r) + ')(' + s.L + ')') + '.<br>' + t('SA=' + (s.SAb - s.d * s.L) + '+' + num(s.r * s.L - s.r * s.r) + '\\pi=' + dots(s.SA, 4)) + ' ≈ ' + t(fx(s.SA, 1) + '\\text{ cm}^{2}') + '.', ['Start with the plain block’s surface area. What did the groove remove, and what did it add?'], 'grooved block SA');
          } },
          { id: 'e6c', level: 'EMG', make: function (r, s) {
            return near('The block is turned into a mould: the groove (a half-cylinder of diameter ' + t(s.d) + ' cm and length ' + t(s.L) + ' cm) is plugged at both ends and filled with wax. What is its capacity, in millilitres to the nearest tenth? (' + t('1\\text{ cm}^{3}=1\\text{ mL}') + ')', s.Vg, 1, 'mL', [
              { v: 2 * s.Vg, code: 'formula', hint: 'Half a cylinder.' }, { v: 4 * s.Vg, code: 'diam-radius', hint: 'Use the radius.' }],
              t('\\tfrac12\\pi(' + num(s.r) + ')^{2}(' + s.L + ')=' + num(0.5 * s.r * s.r * s.L) + '\\pi=' + dots(s.Vg, 4)) + ' cm³ ≈ ' + t(fx(s.Vg, 1) + '\\text{ mL}') + '.', ['The wax fills a half-cylinder: ' + t('\\tfrac12\\pi r^{2}L') + '.'], 'groove capacity');
          } },
          { id: 'e6d', level: 'ADV', make: function (r, s) {
            return near('A second block, also ' + t(s.L + '.0\\text{ cm}') + ' long, needs a semicircular groove of capacity exactly ' + t(s.V2 + '\\text{ mL}') + '. What groove diameter is required, to the nearest tenth of a centimetre? (Check that it fits in a block ' + t(s.W) + ' cm wide and ' + t(s.H) + ' cm high.)', s.d2, 1, 'cm', [
              { v: s.r2, code: 'radius-diam', hint: 'That’s the radius. The question asks for the diameter.' },
              { v: s.d2 / Math.SQRT2, code: 'formula', hint: 'The groove is <b>half</b> a cylinder: ' + t('\\tfrac12\\pi r^{2}L=V') + '.' },
              { v: 2 * s.V2 / (PI * s.L), code: 'no-root', hint: 'That’s ' + t('r^{2}') + '. Take the square root, then double.' }],
              t('\\tfrac12\\pi r^{2}(' + s.L + ')=' + s.V2 + '\\Rightarrow r^{2}=\\dfrac{2(' + s.V2 + ')}{' + s.L + '\\pi}=' + dots(s.r2 * s.r2, 4)) + ', ' + t('r=' + dots(s.r2, 4)) + ', so ' + t('d=' + dots(s.d2, 4)) + ' ≈ ' + t(fx(s.d2, 1) + '\\text{ cm}') + '.<br>Check: ' + t(fx(s.d2, 2)) + ' cm < ' + s.W + ' cm wide, and the depth ' + t(fx(s.r2, 2)) + ' cm < ' + s.H + ' cm high — it fits.', ['Solve ' + t('\\tfrac12\\pi r^{2}L=V') + ' for ' + t('r') + ', then double it.'], 'groove diameter for capacity');
          } }] },
      { num: '7', shared: function (r) {
          var o; for (var g = 0; g < 200; g++) {
            o = g === 0 && r.chance(0.25) ? { d: 12, h: 16, V2: 1.5 } : { d: r.pick([8, 10, 12, 14]), h: r.int(10, 20), V2: r.pick([1.2, 1.5, 1.8, 2.0]) };
            o.r = o.d / 2; o.Vk = PI * o.r * o.r * o.h / 3; o.Vh = 2 / 3 * PI * Math.pow(o.r, 3); o.V = o.Vk + o.Vh; o.s = Math.hypot(o.h, o.r); o.SA = PI * o.r * o.s + 2 * PI * o.r * o.r;
            o.h2 = (o.V2 * 1000 - o.Vh) / (PI * o.r * o.r / 3);
            if (o.h2 > o.h + 3 && o.h2 < 80) break;
          }
          return o;
        }, stem: function (s) { return 'A wooden spinning top is a <b>cone</b> of perpendicular height ' + t(s.h + '.0\\text{ cm}') + ' joined along its base to a <b>hemisphere</b> of the same diameter, ' + t(s.d + '.0\\text{ cm}') + '. The dashed circle marks where the two pieces meet.' + figWrap(topSVG(s.d + '.0 cm', s.h + '.0 cm')); },
        parts: [
          { id: 'e7a', level: 'PRG', make: function (r, s) {
            return fields('Determine the total volume of the top, to the nearest tenth of a cubic centimetre, and then in litres to the nearest thousandth.', [
              { label: t('V='), after: 'cm³', x: s.V, dp: 1, alts: [{ v: s.Vk + 2 * s.Vh, code: 'sphere-for-hemi', hint: 'The top has half a sphere: ' + t('\\tfrac23\\pi r^{3}') + '.' }, { v: 3 * s.Vk + s.Vh, code: 'no-third', hint: 'A cone is ' + t('\\tfrac13\\pi r^{2}h') + '.' }, { v: 8 * s.V, code: 'diam-radius', hint: 'Use the radius ' + t(s.r) + ' cm.' }] },
              { label: t('V='), after: 'L', x: s.V / 1000, dp: 3, alts: [{ v: s.V / 100, code: 'conv-step', hint: t('1\\text{ L}=1000\\text{ cm}^{3}') + '.' }] }],
              t('r=' + s.r) + ' cm. Cone ' + t('\\tfrac13\\pi(' + s.r + ')^{2}(' + s.h + ')=' + num(s.r * s.r * s.h / 3) + '\\pi') + '; hemisphere ' + t('\\tfrac23\\pi(' + s.r + ')^{3}=' + num(2 * Math.pow(s.r, 3) / 3) + '\\pi') + '.<br>' + t('V=' + dots(s.V, 4)) + ' ≈ ' + t(fx(s.V, 1) + '\\text{ cm}^{3}') + ' ' + t('=' + fx(s.V / 1000, 3) + '\\text{ L}') + '.', ['Cone ' + t('\\tfrac13\\pi r^{2}h') + ' (perpendicular height) plus hemisphere ' + t('\\tfrac23\\pi r^{3}') + '.'], 'top volume');
          } },
          { id: 'e7b', level: 'ADV', make: function (r, s) {
            return near('Determine the total outside surface area of the top, to the nearest tenth of a square centimetre.', s.SA, 1, 'cm²', [
              { v: PI * s.r * s.h + 2 * PI * s.r * s.r, code: 'h-for-slant', hint: 'The cone’s surface needs the <b>slant</b> height: ' + t('s=\\sqrt{h^{2}+r^{2}}') + '.' },
              { v: s.SA + PI * s.r * s.r, code: 'hemi-base', hint: 'The hemisphere’s flat base is glued to the cone — it’s internal.' },
              { v: s.SA + 2 * PI * s.r * s.r, code: 'extra-face', hint: 'The joining circle is internal: neither the cone’s base nor the hemisphere’s flat face is outside.' },
              { v: PI * s.r * s.s + 4 * PI * s.r * s.r, code: 'sphere-for-hemi', hint: 'Half a sphere: ' + t('2\\pi r^{2}') + '.' }],
              'Slant height: ' + t('s=\\sqrt{' + s.h + '^{2}+' + s.r + '^{2}}=' + dots(s.s, 4)) + ' cm. Cone surface ' + t('\\pi r s=' + dots(PI * s.r * s.s, 3)) + '; hemisphere curved ' + t('2\\pi r^{2}=' + 2 * s.r * s.r + '\\pi') + '. The joining circle is internal, so no ' + t('\\pi r^{2}') + '.<br>' + t('SA=' + dots(s.SA, 4)) + ' ≈ ' + t(fx(s.SA, 1) + '\\text{ cm}^{2}') + '.', ['Cone’s curved surface (slant height!) plus the hemisphere’s curved surface. The circle where they meet is inside.'], 'top surface area');
          } },
          { id: 'e7c', level: 'ADV', make: function (r, s) {
            return near('A larger top of the same ' + t(s.d + '.0\\text{ cm}') + ' diameter (same hemisphere) is to have a volume of exactly ' + t(s.V2.toFixed(2) + '\\text{ L}') + '. What perpendicular cone height is needed, to the nearest tenth of a centimetre?', s.h2, 1, 'cm', [
              { v: s.V2 * 1000 / (PI * s.r * s.r / 3), code: 'missing-face', hint: 'The hemisphere is part of the volume too: subtract ' + t('\\tfrac23\\pi r^{3}') + ' first.' },
              { v: (s.V2 * 1000 - s.Vh) / (PI * s.r * s.r), code: 'no-third', hint: 'Cone volume has ' + t('\\tfrac13') + '.' },
              { v: (s.V2 * 1000 - 2 * s.Vh) / (PI * s.r * s.r / 3), code: 'sphere-for-hemi', hint: 'A hemisphere, not a sphere.' }],
              t(s.V2.toFixed(2) + '\\text{ L}=' + s.V2 * 1000 + '\\text{ cm}^{3}') + '. ' + t('\\tfrac13\\pi(' + s.r + ')^{2}h+' + num(2 * Math.pow(s.r, 3) / 3) + '\\pi=' + s.V2 * 1000) + '<br>' + t('h=\\dfrac{' + s.V2 * 1000 + '-' + dots(s.Vh, 3) + '}{' + num(s.r * s.r / 3) + '\\pi}=' + dots(s.h2, 4)) + ' ≈ ' + t(fx(s.h2, 1) + '\\text{ cm}') + '.', ['Total = cone + hemisphere. Subtract the hemisphere, then solve the cone formula for ' + t('h') + '.'], 'cone height for volume');
          } }] },
      { num: '8', shared: function (r) {
          var o; for (var g = 0; g < 300; g++) {
            o = g === 0 && r.chance(0.25) ? { Bs: 1.20, h: 0.80, p: 185 } : { Bs: r.pick([1.00, 1.20, 1.40, 1.60]), h: r.pick([0.60, 0.80, 1.00, 1.20]), p: r.pick([165, 185, 210]) };
            o.T = o.Bs / 2; o.H = 2 * o.h; o.Vbig = o.Bs * o.Bs * o.H / 3; o.Vs = o.T * o.T * o.h / 3; o.V = o.Vbig - o.Vs; o.ord = Math.ceil(o.V / 0.25 - 1e-9) * 0.25; o.sl = Math.hypot(o.h, (o.Bs - o.T) / 2); o.form = 2 * (o.Bs + o.T) * o.sl;
            if (Math.abs(o.V * 1e4 - Math.round(o.V * 1e4)) < 1e-6 && frac(o.V / 0.25 + 1e-9) > 0.05) break;
          }
          return o;
        }, stem: function (s) { return 'A concrete pier footing is the <b>frustum</b> of a square pyramid: a square base ' + t(s.Bs.toFixed(2) + '\\text{ m}') + ' on a side, a square top ' + t(s.T.toFixed(2) + '\\text{ m}') + ' on a side, and a perpendicular height of ' + t(s.h.toFixed(2) + '\\text{ m}') + '. The sides are flat trapezoids.' + figWrap(frustumSVG(s.Bs.toFixed(2) + ' m', s.T.toFixed(2) + ' m', s.h.toFixed(2) + ' m')); },
        parts: [
          { id: 'e8a', level: 'PRG', make: function (r, s) {
            return near('The frustum is what is left when a smaller pyramid is cut off the top of a larger one. The top square is exactly half the base square’s side. How tall would the complete pyramid be?', s.H, 2, 'm', [
              { v: s.h, code: 'formula', hint: 'That’s the frustum. The small pyramid on top adds more height.' },
              { v: 1.5 * s.h, code: 'scale-k', hint: 'The cut is where the cross section is half the base, so it is <b>halfway</b> up from the apex: the small pyramid is half the whole height.' },
              { v: 4 * s.h, code: 'scale-k', hint: 'Lengths scale by the linear factor ' + t('k=\\tfrac12') + ' — not ' + t('k^{2}') + '.' }],
              'Every cross section of a pyramid is similar to the base, scaled by its fraction of the way down from the apex. The top is ' + t('\\tfrac12') + ' of the base, so the cut is halfway down: ' + t('H-' + s.h.toFixed(2) + '=\\tfrac12 H') + ', ' + t('H=' + s.H.toFixed(2) + '\\text{ m}') + '.', ['Similar solids: if the top square is half the base, how far down from the apex is it?'], 'full pyramid height', { exact: true });
          } },
          { id: 'e8b', level: 'PRG', make: function (r, s) {
            return near('The complete pyramid would be ' + t(s.H.toFixed(2) + '\\text{ m}') + ' tall. Determine the volume of concrete in the frustum exactly, as (big pyramid) − (small pyramid).', s.V, 4, 'm³', [
              { v: s.Vbig, code: 'missing-face', hint: 'Subtract the small pyramid cut off the top.' },
              { v: s.Bs * s.Bs * s.h / 3, code: 'formula', hint: 'The frustum isn’t a pyramid of height ' + t(s.h.toFixed(2)) + ': use big − small.' },
              { v: (s.Bs * s.Bs + s.T * s.T) / 2 * s.h, code: 'formula', hint: 'Averaging the two square areas doesn’t give a frustum’s volume. Use big pyramid − small pyramid.' },
              { v: 3 * s.V, code: 'no-third', hint: 'Each pyramid has ' + t('\\tfrac13') + '.' }],
              t('V_{\\text{big}}=\\tfrac13(' + s.Bs.toFixed(2) + ')^{2}(' + s.H.toFixed(2) + ')=' + num(s.Vbig)) + ', ' + t('V_{\\text{small}}=\\tfrac13(' + s.T.toFixed(2) + ')^{2}(' + s.h.toFixed(2) + ')=' + num(s.Vs)) + '.<br>' + t('V=' + num(s.Vbig) + '-' + num(s.Vs) + '=' + num(s.V) + '\\text{ m}^{3}') + ' (exact). Check: ' + t('\\tfrac{' + num(s.Vs) + '}{' + num(s.Vbig) + '}=\\tfrac18=\\left(\\tfrac12\\right)^{3}') + '.', ['Pyramid: ' + t('\\tfrac13 A_{\\text{Base}}h') + '. Big one: base ' + t(s.Bs.toFixed(2)) + ', height ' + t(s.H.toFixed(2)) + '. Small one: base ' + t(s.T.toFixed(2)) + ', height ' + t(s.h.toFixed(2)) + '.'], 'frustum volume', { exact: true });
          } },
          { id: 'e8c', level: 'EMG', outcome: 'M2', make: function (r, s) {
            return fields('The footing holds ' + t(num(s.V) + '\\text{ m}^{3}') + ' of concrete. Express that volume in litres, and in cubic feet to the nearest tenth.', [
              { label: t('V='), after: 'L', x: s.V * 1000, dp: 0, exact: true, alts: [{ v: s.V * 100, code: 'conv-step', hint: t('1\\text{ m}^{3}=1000\\text{ L}') + '.' }] },
              { label: t('V='), after: 'ft³', x: s.V * M3FT, dp: 1, alts: [{ v: s.V * 3.2808, code: 'lin-factor', hint: 'Cube the factor: ' + t('1\\text{ m}^{3}=35.3147\\text{ ft}^{3}') + '.' }, { v: s.V * Math.pow(0.3048, 3), code: 'conv-dir', hint: 'There are more ft³ than m³: divide by ' + t('0.3048^{3}') + '.' }] }],
              t(num(s.V) + '\\times 1000=' + num(s.V * 1000) + '\\text{ L}') + '. ' + t(num(s.V) + '\\div(0.3048)^{3}=' + dots(s.V * M3FT, 4)) + ' ≈ ' + t(fx(s.V * M3FT, 1) + '\\text{ ft}^{3}') + '.', ['1 m³ = 1000 L; ' + t('1\\text{ ft}^{3}=(0.3048)^{3}\\text{ m}^{3}') + '.'], 'frustum litres and ft³');
          } },
          { id: 'e8d', level: 'PRG', outcome: 'M2', make: function (r, s) {
            var c1 = s.V * s.p, c2 = s.ord * s.p;
            return fields('The footing needs ' + t(num(s.V) + '\\text{ m}^{3}') + ' of concrete. Ready-mix concrete costs $' + s.p.toFixed(2) + ' per cubic metre and is sold only in whole quarter-cubic-metres. Find the exact cost of the concrete used, and the cost of what must actually be ordered.', [
              { label: 'Concrete used: $', x: c1, dp: 2, exact: true, alts: [] },
              { label: 'Ordered: $', x: c2, dp: 2, exact: true, alts: [{ v: Math.floor(s.V / 0.25) * 0.25 * s.p, code: 'whole-up', hint: 'Rounding down to ' + num(Math.floor(s.V / 0.25) * 0.25) + ' m³ would leave the hole unfilled — order the next quarter up.' }, { v: Math.ceil(s.V) * s.p, code: 'whole-up', hint: 'It’s sold in quarter-cubic-metres, not whole cubic metres.' }] }],
              'Used: ' + t(num(s.V) + '\\times ' + s.p + '=' + c1.toFixed(2)) + ' dollars.<br>Ordered: ' + t(num(s.V)) + ' rounds <b>up</b> to the next quarter, ' + t(num(s.ord) + '\\text{ m}^{3}') + ': ' + t(num(s.ord) + '\\times ' + s.p + '=' + c2.toFixed(2)) + ' dollars.', ['Order enough: round the volume up to the next 0.25 m³.'], 'concrete cost');
          } },
          { id: 'e8e', level: 'ADV', make: function (r, s) {
            var lean = (s.Bs - s.T) / 2;
            return fields('Plywood formwork lines the four sloping sides only. Find the slant height of one trapezoidal face (to the nearest thousandth of a metre) and then the formwork area, to the nearest hundredth of a square metre.', [
              { label: 'Slant height:', after: 'm', x: s.sl, dp: 3, alts: [{ v: s.h, code: 'h-for-slant', hint: 'The face leans out by ' + t(num(lean)) + ' m, so its slant height is longer than ' + t(s.h.toFixed(2)) + ' m: Pythagoras.' }, { v: Math.hypot(s.h, s.Bs - s.T), code: 'formula', hint: 'Each side leans out by half the difference: ' + t('\\tfrac{' + s.Bs.toFixed(2) + '-' + s.T.toFixed(2) + '}{2}=' + num(lean)) + '.' }] },
              { label: 'Formwork:', after: 'm²', x: s.form, dp: 2, alts: [{ v: 2 * (s.Bs + s.T) * s.h, code: 'h-for-slant', hint: 'Use the slant height of the face, not the vertical height.' }, { v: 4 * (s.Bs + s.T) * s.sl, code: 'no-half', hint: 'A trapezoid is ' + t('\\tfrac12(a+b)h') + '.' }, { v: (s.Bs + s.T) / 2 * s.sl, code: 'missing-face', hint: 'There are <b>four</b> sloping faces.' }] }],
              'Each face leans out ' + t('\\tfrac{' + s.Bs.toFixed(2) + '-' + s.T.toFixed(2) + '}{2}=' + num(lean)) + ' m: ' + t('s=\\sqrt{' + num(lean) + '^{2}+' + s.h.toFixed(2) + '^{2}}=' + dots(s.sl, 5)) + ' m.<br>One trapezoid ' + t('\\tfrac12(' + s.Bs.toFixed(2) + '+' + s.T.toFixed(2) + ')(' + dots(s.sl, 5) + ')') + '; four of them ' + t('=' + dots(s.form, 4)) + ' ≈ ' + t(fx(s.form, 2) + '\\text{ m}^{2}') + '.', ['The slant height of a face is the hypotenuse of a right triangle: the vertical height and how far the face leans out.'], 'frustum formwork');
          } }] },
      /* ======================= Part D — Working backwards ======================= */
      { num: '9', section: 'Extra practice D — Working backwards', stem: 'Solve each for the dimension named. Round only at the end, to the precision stated.', parts: [
        { id: 'e9a', level: 'PRG', make: function (r) {
          var VL = r.chance(0.25) ? 2.5 : r.pick([1.5, 2.0, 3.0, 4.0, 5.0]), V = VL * 1000, rr = Math.cbrt(3 * V / (4 * PI)), d = 2 * rr;
          return near('<span style="font-variant:small-caps">Sphere from volume.</span> A spherical float holds ' + t(VL.toFixed(2) + '\\text{ L}') + '. Find its diameter, to the nearest tenth of a centimetre.', d, 1, 'cm', [
            { v: rr, code: 'radius-diam', hint: 'That’s the radius. Double it for the diameter.' },
            { v: 2 * Math.cbrt(3 * V / (2 * PI)), code: 'formula', hint: 'A sphere is ' + t('\\tfrac43\\pi r^{3}') + ' (that was the hemisphere formula).' },
            { v: 2 * Math.sqrt(3 * V / (4 * PI)), code: 'wrong-root', hint: 'Volume has ' + t('r^{3}') + ': take the <b>cube</b> root.' },
            { v: 2 * Math.cbrt(3 * VL / (4 * PI)), code: 'conv-step', hint: 'Change litres to cm³ first: ' + t('1\\text{ L}=1000\\text{ cm}^{3}') + '.' }],
            t(VL.toFixed(2) + '\\text{ L}=' + F(V) + '\\text{ cm}^{3}') + '. ' + t('r=\\sqrt[3]{\\dfrac{3V}{4\\pi}}=\\sqrt[3]{\\dfrac{3(' + V + ')}{4\\pi}}=' + dots(rr, 4)) + ' cm, so ' + t('d=2r=' + dots(d, 4)) + ' ≈ ' + t(fx(d, 1) + '\\text{ cm}') + '.', ['Litres → cm³, then solve ' + t('V=\\tfrac43\\pi r^{3}') + ' for ' + t('r') + ', then double.'], 'sphere diameter from volume');
        } },
        { id: 'e9b', level: 'ADV', make: function (r) {
          var A, rc; if (r.chance(0.25)) { A = 0.25; rc = 12; } else { A = r.pick([0.20, 0.25, 0.30]); rc = r.pick([10, 12, 15]); }
          var Acm = A * 10000, sl = Acm / (PI * rc), h = Math.sqrt(sl * sl - rc * rc);
          return fields('<span style="font-variant:small-caps">Cone from lateral area.</span> A cone’s curved surface is ' + t(A.toFixed(2) + '\\text{ m}^{2}') + ' and its base radius is ' + t(rc + '.0\\text{ cm}') + '. Find the slant height, then the perpendicular height, each to the nearest tenth of a centimetre.', [
            { label: 'Slant height ' + t('s='), after: 'cm', x: sl, dp: 1, alts: [{ v: A * 100 / (PI * rc), code: 'lin-factor', hint: 'Area needs the squared factor: ' + t('1\\text{ m}^{2}=100^{2}\\text{ cm}^{2}') + '.' }, { v: Acm / (2 * PI * rc), code: 'formula', hint: 'The cone’s curved surface is ' + t('\\pi r s') + ' (no 2).' }, { v: (Acm - PI * rc * rc) / (PI * rc), code: 'formula', hint: 'Only the curved surface is given — no base.' }] },
            { label: 'Height ' + t('h='), after: 'cm', x: h, dp: 1, alts: [{ v: Math.hypot(sl, rc), code: 'formula', hint: 'The slant height is the hypotenuse: ' + t('h=\\sqrt{s^{2}-r^{2}}') + '.' }] }],
            t(A.toFixed(2) + '\\text{ m}^{2}=' + A.toFixed(2) + '\\times 100^{2}=' + F(Acm) + '\\text{ cm}^{2}') + '.<br>' + t('s=\\dfrac{' + F(Acm) + '}{\\pi(' + rc + ')}=' + dots(sl, 4)) + ' cm (slant); ' + t('h=\\sqrt{s^{2}-r^{2}}=' + dots(h, 4)) + ' cm (perpendicular).', ['Change m² to cm² (×100²). Then ' + t('\\pi r s=A') + ' gives ' + t('s') + ', and Pythagoras gives ' + t('h') + '.'], 'cone from lateral area');
        } },
        { id: 'e9c', level: 'PRG', make: function (r) {
          var SA, rc; if (r.chance(0.25)) { SA = 600; rc = 5; } else { SA = r.pick([500, 600, 750, 800]); rc = r.pick([4, 5, 6]); }
          var h = (SA - 2 * PI * rc * rc) / (2 * PI * rc);
          return near('<span style="font-variant:small-caps">Cylinder from surface area.</span> A closed cylinder has total surface area ' + t(SA + '\\text{ cm}^{2}') + ' and radius ' + t(rc + '.0\\text{ cm}') + '. Find its height, to the nearest tenth of a centimetre.', h, 1, 'cm', [
            { v: SA / (2 * PI * rc), code: 'missing-face', hint: 'A closed cylinder has two circular ends: subtract ' + t('2\\pi r^{2}') + ' first.' },
            { v: (SA - PI * rc * rc) / (2 * PI * rc), code: 'missing-face', hint: 'There are <b>two</b> ends: ' + t('2\\pi r^{2}') + '.' },
            { v: (SA - 2 * PI * rc * rc) / (PI * rc), code: 'formula', hint: 'The curved surface is ' + t('2\\pi r h') + '.' }],
            t('h=\\dfrac{SA-2\\pi r^{2}}{2\\pi r}=\\dfrac{' + SA + '-2\\pi(' + rc + ')^{2}}{2\\pi(' + rc + ')}=' + dots(h, 4)) + ' ≈ ' + t(fx(h, 1) + '\\text{ cm}') + '.', ['Write ' + t('SA=2\\pi r^{2}+2\\pi r h') + ' and isolate ' + t('h') + '.'], 'cylinder height from SA');
        } },
        { id: 'e9d', level: 'EMG', outcome: 'M2', make: function (r) {
          var cap, a, b, d; do { cap = r.pick([360, 450, 540, 600, 720]); a = r.pick([1.20, 1.00, 1.50, 0.90]); b = r.pick([0.75, 0.60, 0.80, 0.50]); d = cap / 1000 / (a * b) * 100; } while (Math.abs(d - Math.round(d)) > 1e-9 || d < 30 || d > 120);
          if (r.chance(0.25)) { cap = 450; a = 1.20; b = 0.75; d = 50; }
          return near('<span style="font-variant:small-caps">Prism from capacity.</span> A rectangular tank holds ' + t(cap + '\\text{ L}') + '. Its base is ' + t(a.toFixed(2) + '\\text{ m}') + ' by ' + t(b.toFixed(2) + '\\text{ m}') + '. Find its depth, to the nearest centimetre.', d, 0, 'cm', [
            { v: d * 1000, code: 'conv-step', hint: 'Change litres to m³: ' + t('1000\\text{ L}=1\\text{ m}^{3}') + '.' },
            { v: d / 10, code: 'conv-step', hint: 'Check the conversion: ' + t('1\\text{ m}^{3}=1000\\text{ L}') + ', and 1 m = 100 cm.' }],
            t(cap + '\\text{ L}=' + dec(cap / 1000) + '\\text{ m}^{3}') + '. ' + t('h=\\dfrac{V}{A_{\\text{Base}}}=\\dfrac{' + dec(cap / 1000) + '}{' + a.toFixed(2) + '\\times ' + b.toFixed(2) + '}=' + dec(d / 100) + '\\text{ m}=' + d + '\\text{ cm}') + '.', ['Litres → m³, then depth = volume ÷ base area.'], 'tank depth', { exact: true, pre: function (v) { return Math.abs(v - d / 100) < 1e-9 ? form('units', 'That’s the depth in metres. Give it in <b>centimetres</b>.') : null; } });
        } }] },
      { num: '10', stem: 'A closed cylindrical can has a total surface area and a height as given. This time the <i>radius</i> is unknown, and ' + t('SA=2\\pi r^{2}+2\\pi r h') + ' is a quadratic in ' + t('r') + ': write it as ' + t('ar^{2}+br+c=0') + ', solve it, and reject the root that cannot be a radius.', parts: [
        { id: 'e10', level: 'MAS', make: function (r) {
          var SA, h; if (r.chance(0.25)) { SA = 400; h = 10; } else { SA = r.pick([300, 400, 500, 600]); h = r.pick([8, 10, 12]); }
          var a = 2 * PI, b = 2 * PI * h, c = -SA, rr = (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a), V = PI * rr * rr * h;
          return fields('The can’s total surface area is ' + t(SA + '\\text{ cm}^{2}') + ' and its height is ' + t(h + '.0\\text{ cm}') + '. Give ' + t('r') + ' to the nearest tenth of a centimetre, and then the can’s capacity in millilitres to the nearest millilitre (carry the unrounded ' + t('r') + ').', [
              { label: t('r='), after: 'cm', x: rr, dp: 1, alts: [{ v: (-b - Math.sqrt(b * b - 4 * a * c)) / (2 * a), code: 'sign', hint: 'That root is negative — a radius can’t be. Take the other one.' }, { v: SA / (2 * PI * h), code: 'missing-face', hint: 'Don’t ignore the ends: the ' + t('2\\pi r^{2}') + ' term makes it a quadratic.' }] },
              { label: 'Capacity:', after: 'mL', x: V, dp: 0, alts: [{ v: PI * rnd(rr, 1) * rnd(rr, 1) * h, code: 'early-round', hint: 'Use the unrounded radius.' }, { v: 2 * PI * rr * h, code: 'vol-sa', hint: 'Capacity is the volume ' + t('\\pi r^{2}h') + '.' }] }],
            t('2\\pi r^{2}+' + 2 * h + '\\pi r-' + SA + '=0') + ', so ' + t('a=2\\pi,\\ b=' + 2 * h + '\\pi,\\ c=-' + SA) + '.<br>' + t('r=\\dfrac{-' + 2 * h + '\\pi\\pm\\sqrt{(' + 2 * h + '\\pi)^{2}-4(2\\pi)(-' + SA + ')}}{4\\pi}') + '; the minus sign gives a negative root (rejected), the plus sign gives ' + t('r=' + dots(rr, 5)) + ' ≈ ' + t(fx(rr, 1) + '\\text{ cm}') + '.<br>Capacity ' + t('\\pi r^{2}h=' + dots(V, 3)) + ' cm³ ≈ ' + t(fx(V, 0) + '\\text{ mL}') + '.', ['Move ' + t(SA) + ' to the left so the equation equals 0, then use the quadratic formula.', 'Keep the positive root.'], 'radius from SA (quadratic)');
        } }] },
      { num: '11', shared: function (r) { var A = r.chance(0.25) ? 120 : r.pick([80, 100, 150, 200, 250]); var o = { A: A, rf: Math.sqrt(A / (3 * PI)), rs: Math.sqrt(A / (2 * PI)) }; o.V = 2 / 3 * PI * Math.pow(o.rf, 3); return o; },
        stem: function (s) { return 'A hemispherical grain dome is built <b>with a concrete floor</b>, and the total area of concrete and shell together is ' + t(s.A + '\\text{ m}^{2}') + '.'; },
        parts: [
          { id: 'e11a', level: 'PRG', make: function (r, s) {
            return near('Find the radius of the dome, to the nearest hundredth of a metre.', s.rf, 2, 'm', [
              { v: s.rs, code: 'hemi-nobase', hint: '“With a concrete floor … together” counts the flat circular base too: ' + t('3\\pi r^{2}') + ', not ' + t('2\\pi r^{2}') + '.' },
              { v: Math.sqrt(s.A / (4 * PI)), code: 'sphere-for-hemi', hint: 'It’s a hemisphere plus its floor: ' + t('2\\pi r^{2}+\\pi r^{2}=3\\pi r^{2}') + '.' },
              { v: s.A / (3 * PI), code: 'no-root', hint: 'That’s ' + t('r^{2}') + '. Take the square root.' }],
              'The wording counts the shell <b>and</b> the floor: ' + t('SA=3\\pi r^{2}') + '. ' + t('3\\pi r^{2}=' + s.A + '\\Rightarrow r^{2}=\\dfrac{' + s.A + '}{3\\pi}') + ', ' + t('r=' + dots(s.rf, 5)) + ' ≈ ' + t(fx(s.rf, 2) + '\\text{ m}') + '.', ['Which hemisphere formula does “with a concrete floor” select?'], 'dome radius');
          } },
          { id: 'e11b', level: 'PRG', outcome: 'M2', make: function (r, s) {
            return near('The dome’s radius is ' + t('r=\\sqrt{\\tfrac{' + s.A + '}{3\\pi}}\\approx ' + dots(s.rf, 6)) + ' m. Find its capacity in litres, to the nearest litre, carrying the unrounded radius.', s.V * 1000, 0, 'L', [
              { v: 2 / 3 * PI * Math.pow(rnd(s.rf, 2), 3) * 1000, code: 'early-round', hint: 'Use the unrounded radius — the rounded one is many litres out.' },
              { v: 2 * s.V * 1000, code: 'sphere-for-hemi', hint: 'A hemisphere: ' + t('\\tfrac23\\pi r^{3}') + '.' },
              { v: s.V, code: 'conv-step', hint: 'That’s m³. Multiply by 1000 for litres.' }],
              t('V=\\tfrac23\\pi r^{3}=' + dots(s.V, 4) + '\\text{ m}^{3}') + '; ' + t('\\times 1000=' + dots(s.V * 1000, 2)) + ' ≈ ' + t(fx(s.V * 1000, 0) + '\\text{ L}') + '.', ['Hemisphere: ' + t('\\tfrac23\\pi r^{3}') + '; 1 m³ = 1000 L.'], 'dome capacity');
          } },
          { id: 'e11c', level: 'EMG', make: function (r, s) {
            return near('Had the wording been “the shell has area ' + t(s.A + '\\text{ m}^{2}') + '” (no floor), what radius would follow? Give it to the nearest hundredth of a metre.', s.rs, 2, 'm', [
              { v: s.rf, code: 'hemi-base', hint: 'The shell alone is the curved surface: ' + t('2\\pi r^{2}') + '.' },
              { v: s.A / (2 * PI), code: 'no-root', hint: 'Take the square root.' }],
              t('2\\pi r^{2}=' + s.A + '\\Rightarrow r=\\sqrt{\\dfrac{' + s.A + '}{2\\pi}}=' + dots(s.rs, 5)) + ' ≈ ' + t(fx(s.rs, 2) + '\\text{ m}') + '.', ['Shell only: ' + t('2\\pi r^{2}') + '.'], 'shell-only radius');
          } },
          { id: 'e11d', sub: 'c-ii', level: 'PRG', make: function (r, s) {
            return mc(r, 'With the floor counted, ' + t('r=\\sqrt{\\tfrac{' + s.A + '}{3\\pi}}') + '; with the shell only, ' + t('r=\\sqrt{\\tfrac{' + s.A + '}{2\\pi}}') + '. What is the exact ratio (shell-only radius) ÷ (radius with floor)?', [
              { html: t('\\sqrt{\\tfrac32}=\\tfrac{\\sqrt6}{2}'), right: true },
              { html: t('\\tfrac32'), code: 'no-root', why: 'The area depends on ' + t('r^{2}') + ', so the radii are in the ratio of the <b>square root</b> of ' + t('\\tfrac{3\\pi}{2\\pi}') + '.' },
              { html: t('\\tfrac23'), code: 'ratio-flip', why: 'The shell-only radius is the larger one, so the ratio is more than 1 — and it involves a square root.' },
              { html: t('\\tfrac94'), code: 'scale-k', why: 'Radii scale as the square <b>root</b> of the area ratio, not its square.' }],
              t('\\dfrac{\\sqrt{' + s.A + '/(2\\pi)}}{\\sqrt{' + s.A + '/(3\\pi)}}=\\sqrt{\\dfrac{3}{2}}=\\dfrac{\\sqrt6}{2}\\approx 1.2247') + '. It isn’t ' + t('\\tfrac32') + ' or ' + t('\\tfrac23') + ' because area depends on ' + t('r^{2}') + ': the radius responds by the square root of the coefficient ratio.', ['Divide the two expressions; ' + t(s.A) + ' and ' + t('\\pi') + ' cancel.'], 'ratio of radii');
          } }] },

      /* ======================= Part E — Reasoning and error analysis ======================= */
      { num: '12', section: 'Extra practice E — Reasoning and error analysis', shared: function (r) { return r.chance(0.25) ? { r: 1.2, h: 3.0 } : { r: r.pick([0.8, 1.0, 1.2, 1.5, 2.0]), h: r.pick([2.0, 2.5, 3.0, 4.0]) }; },
        stem: function (s) { return '<b>“Doubling the radius doubles the volume.”</b> A cylindrical tank has radius ' + t(s.r.toFixed(1) + '\\text{ m}') + ' and height ' + t(s.h.toFixed(1) + '\\text{ m}') + '.'; },
        parts: [
          { id: 'e12a', level: 'PRG', make: function (r, s) {
            var V = PI * s.r * s.r * s.h, V2 = 4 * V;
            return fields('Find the volume as it stands, to the nearest hundredth of a cubic metre. Then find it with the radius doubled and the height unchanged, and state the exact factor.', [
              { label: 'Volume:', after: 'm³', x: V, dp: 2, alts: [{ v: 2 * PI * s.r * s.h, code: 'vol-sa', hint: 'Volume is ' + t('\\pi r^{2}h') + '.' }] },
              { label: 'Radius doubled:', after: 'm³', x: V2, dp: 2, alts: [{ v: 2 * V, code: 'scale-k', hint: 'Work it out with ' + t('r=' + (2 * s.r).toFixed(1)) + ': the radius is squared in the formula.' }] },
              { label: 'Factor:', key: 4, check: exactNum(4, function (v) { if (v === 2) return { code: 'scale-k', hint: 'Divide your two volumes: the radius is squared, so doubling it multiplies the volume by ' + t('2^{2}') + '.' }; if (v === 8) return { code: 'scale-k', hint: 'Only the radius doubled; the height stayed the same.' }; return null; }) }],
              t('V=\\pi(' + s.r.toFixed(1) + ')^{2}(' + s.h.toFixed(1) + ')=' + num(s.r * s.r * s.h) + '\\pi=' + dots(V, 4)) + ' ≈ ' + t(fx(V, 2)) + ' m³.<br>' + t('V=\\pi(' + (2 * s.r).toFixed(1) + ')^{2}(' + s.h.toFixed(1) + ')=' + num(4 * s.r * s.r * s.h) + '\\pi') + ' ≈ ' + t(fx(V2, 2)) + ' m³. Factor ' + t('=4') + ', not 2 — the claim is false.', ['Use ' + t('V=\\pi r^{2}h') + ' twice and divide.'], 'doubling the radius');
          } },
          { id: 'e12b', level: 'EMG', make: function (r, s) {
            return { prompt: 'Now double <i>every</i> dimension of the tank (radius ' + t(s.r.toFixed(1)) + ' → ' + t((2 * s.r).toFixed(1)) + ' m, height ' + t(s.h.toFixed(1)) + ' → ' + t((2 * s.h).toFixed(1)) + ' m). By what exact factor is the volume multiplied?', input: { type: 'number' }, key: '8', answer: t('8'), text: 'double every dimension',
              check: exactNum(8, function (v) { if (v === 2) return { code: 'scale-k', hint: 'Volume has three lengths multiplied: ' + t('r\\cdot r\\cdot h') + '.' }; if (v === 4) return { code: 'scale-k', hint: 'The radius gives ' + t('2^{2}') + ' and the height gives another 2.' }; if (v === 6) return { code: 'add-errors', hint: 'The factors multiply: ' + t('2^{2}\\times 2') + '.' }; return null; }),
              solution: 'In ' + t('V=\\pi r^{2}h') + ' the radius has exponent 2 (factor ' + t('2^{2}=4') + ') and the height exponent 1 (factor 2): ' + t('4\\times 2=8=2^{3}') + '.', hints: ['Which exponent does each dimension carry in ' + t('V=\\pi r^{2}h') + '?'], bad: ['2', '4', '6'] };
          } },
          { id: 'e12c', level: 'ADV', make: function (r, s) {
            var R = Math.round(s.r * 10), H = Math.round(s.h * 10), p = 2 * (2 * R + H), q = R + H, g = gcd(p, q);
            return B.fraction('Doubling all dimensions multiplies the surface area ' + t('SA=2\\pi r^{2}+2\\pi r h') + ' by 4. Find the exact factor by which the surface area is multiplied when only the radius is doubled (' + t(s.r.toFixed(1)) + ' → ' + t((2 * s.r).toFixed(1)) + ' m, height ' + t(s.h.toFixed(1)) + ' m). Give it as a fraction in lowest terms.', [p / g, q / g], { diag: function (v) { if (Math.abs(v - 4) < 1e-9) return { code: 'scale-k', hint: 'The ' + t('k^{2}') + ' rule only works for <b>similar</b> solids (every dimension scaled). Compute both surface areas.' }; if (Math.abs(v - 2) < 1e-9) return { code: 'scale-k', hint: 'The two terms grow differently: the ends by 4, the wall by 2. Compute both surface areas.' }; return null; } },
              'Before: ' + t('2\\pi(' + s.r.toFixed(1) + ')^{2}+2\\pi(' + s.r.toFixed(1) + ')(' + s.h.toFixed(1) + ')=' + num(2 * s.r * s.r + 2 * s.r * s.h) + '\\pi') + '. After: ' + t('2\\pi(' + (2 * s.r).toFixed(1) + ')^{2}+2\\pi(' + (2 * s.r).toFixed(1) + ')(' + s.h.toFixed(1) + ')=' + num(8 * s.r * s.r + 4 * s.r * s.h) + '\\pi') + '.<br>Factor ' + t('=\\dfrac{' + num(8 * s.r * s.r + 4 * s.r * s.h) + '}{' + num(2 * s.r * s.r + 2 * s.r * s.h) + '}=' + '\\tfrac{' + p / g + '}{' + q / g + '}') + '. Doubling ' + t('r') + ' alone isn’t a similar solid, so the ends (×4) and the wall (×2) grow differently and the total lands between.',
              ['Work out the surface area before and after, then divide (the ' + t('\\pi') + ' cancels).'], 'SA factor radius doubled');
          } }] },
      { num: '13', shared: function (r) { var o; do { o = r.chance(0.25) ? { L: 40, e: 4 } : { L: r.pick([30, 40, 50, 60]), e: r.pick([4, 5]) }; o.SA = 2 + 4 * o.L; o.VA = o.L; o.SB = 6 * o.e * o.e; o.VB = Math.pow(o.e, 3); } while (!(o.VB > o.VA && o.SA > o.SB)); return o; },
        stem: function (s) { return '<b>“Solid A has surface area ' + t(s.SA + '\\text{ cm}^{2}') + ' and solid B has volume ' + t(s.VB + '\\text{ cm}^{3}') + ', so A is bigger.”</b> Solid A is a rectangular prism ' + t('1.0\\text{ cm}\\times 1.0\\text{ cm}\\times ' + s.L + '.0\\text{ cm}') + '; solid B is a cube of edge ' + t(s.e + '.0\\text{ cm}') + '.'; },
        parts: [
          { id: 'e13a', level: 'EMG', make: function (r, s) {
            return fields('Find <i>both</i> the surface area and the volume of <i>both</i> solids.', [
              { label: 'A: ' + t('SA='), after: 'cm²', x: s.SA, key: s.SA, check: exactNum(s.SA, function (v) { if (v === 4 * s.L) return { code: 'missing-face', hint: 'Don’t forget the two 1 cm × 1 cm ends.' }; return null; }) },
              { label: 'A: ' + t('V='), after: 'cm³', x: s.VA, key: s.VA, check: exactNum(s.VA) },
              { label: 'B: ' + t('SA='), after: 'cm²', x: s.SB, key: s.SB, check: exactNum(s.SB, function (v) { if (v === s.e * s.e) return { code: 'missing-face', hint: 'A cube has 6 faces.' }; return null; }) },
              { label: 'B: ' + t('V='), after: 'cm³', x: s.VB, key: s.VB, check: exactNum(s.VB) }],
              'A: ' + t('SA=2(1\\times 1)+4(1\\times ' + s.L + ')=' + s.SA) + ' cm², ' + t('V=' + s.L) + ' cm³.<br>B: ' + t('SA=6(' + s.e + ')^{2}=' + s.SB) + ' cm², ' + t('V=' + s.e + '^{3}=' + s.VB) + ' cm³.', ['Prism: add the 6 rectangular faces; cube: ' + t('6a^{2}') + ' and ' + t('a^{3}') + '.'], 'SA and V of A and B');
          } },
          { id: 'e13a2', sub: 'a-ii', level: 'EMG', make: function (r, s) {
            return mc(r, 'A: ' + t('SA=' + s.SA + '\\text{ cm}^{2},\\ V=' + s.VA + '\\text{ cm}^{3}') + '. B: ' + t('SA=' + s.SB + '\\text{ cm}^{2},\\ V=' + s.VB + '\\text{ cm}^{3}') + '. Which sentence shows the original claim is meaningless?', [
              { html: t(s.SA + '\\text{ cm}^{2}') + ' and ' + t(s.VB + '\\text{ cm}^{3}') + ' measure different kinds of quantity (area and volume), so neither number is “bigger” than the other.', right: true },
              { html: 'The claim is right because ' + t(s.SA + '>' + s.VB) + '.', code: 'claim', why: 'You can’t compare cm² with cm³ — like comparing kilograms with metres.' },
              { html: 'The claim is wrong only because ' + t('\\pi') + ' wasn’t used.', code: 'claim', why: 'Neither solid involves ' + t('\\pi') + '. The problem is comparing an area with a volume.' },
              { html: 'The claim would be fine if both were in metres.', code: 'claim', why: 'Changing units doesn’t make an area comparable with a volume.' }],
              'An area (cm²) and a volume (cm³) are different kinds of quantity. Compared like with like, A has the larger surface area but B has the larger volume.', ['What units does each number have?'], 'area vs volume claim');
          } },
          { id: 'e13b', level: 'PRG', make: function (r, s) {
            return B.grid('A: ' + t('SA=' + s.SA + ',\\ V=' + s.VA) + '. B: ' + t('SA=' + s.SB + ',\\ V=' + s.VB) + ' (cm², cm³). Which solid…', [{ id: 'w', html: 'holds more water?' }, { id: 'p', html: 'needs more wrapping paper?' }, { id: 'h', html: 'loses heat faster (more surface per unit of volume)?' }], [{ id: 'A', html: 'A' }, { id: 'B', html: 'B' }], { w: 'B', p: 'A', h: 'A' },
              { why: function (row) { return row === 'w' ? { code: 'vol-sa', hint: 'Holding water is about <b>volume</b>.' } : row === 'p' ? { code: 'vol-sa', hint: 'Wrapping is about <b>surface area</b>.' } : { code: 'vol-sa', hint: 'Heat escapes through the surface and is stored in the volume: compare SA ÷ V.' }; } },
              'Water: <b>B</b> (' + s.VB + ' cm³ > ' + s.VA + ' cm³). Paper: <b>A</b> (' + s.SA + ' cm² > ' + s.SB + ' cm²). Heat: <b>A</b> — ' + t('\\tfrac{' + s.SA + '}{' + s.VA + '}=' + fx(s.SA / s.VA, 2)) + ' cm⁻¹ against ' + t('\\tfrac{' + s.SB + '}{' + s.VB + '}=' + fx(s.SB / s.VB, 2)) + ' cm⁻¹.', ['Decide whether each question is about volume, surface area, or their ratio.'], 'which solid');
          } },
          { id: 'e13c', sub: 'b-ii', level: 'EMG', make: function (r, s) {
            return fields('Give each solid’s surface-area-to-volume ratio ' + t('\\tfrac{SA}{V}') + ', to the nearest hundredth. (A: ' + t('SA=' + s.SA + ',\\ V=' + s.VA) + '; B: ' + t('SA=' + s.SB + ',\\ V=' + s.VB) + '.)', [
              { label: 'A:', after: 'cm⁻¹', x: s.SA / s.VA, dp: 2, exact: true, alts: [{ v: s.VA / s.SA, code: 'ratio-flip', hint: 'Surface area ÷ volume.' }] },
              { label: 'B:', after: 'cm⁻¹', x: s.SB / s.VB, dp: 2, exact: true, alts: [{ v: s.VB / s.SB, code: 'ratio-flip', hint: 'Surface area ÷ volume.' }] }],
              'A: ' + t('\\tfrac{' + s.SA + '\\text{ cm}^{2}}{' + s.VA + '\\text{ cm}^{3}}=' + fx(s.SA / s.VA, 2) + '\\text{ cm}^{-1}') + '; B: ' + t('\\tfrac{' + s.SB + '}{' + s.VB + '}=' + fx(s.SB / s.VB, 2) + '\\text{ cm}^{-1}') + '. The unit ' + t('\\text{cm}^{2}\\div\\text{cm}^{3}=\\text{cm}^{-1}') + ' shows area and volume aren’t interchangeable.', ['Divide SA by V for each solid.'], 'SA:V ratios');
          } }] },
      { num: '14', shared: function (r) { var R = r.chance(0.25) ? 9 : r.pick([6, 7.5, 8, 10, 12]); return { R: R, V: 4 / 3 * PI * R * R * R, V3: 4 / 3 * 3.14 * R * R * R, S: 4 * PI * R * R, S3: 4 * 3.14 * R * R, c: r.pick([55, 62, 70, 85]) }; },
        stem: function (s) { return '<b>“3.14 is close enough.”</b> A spherical gas holder has a radius of ' + t(dec(s.R) + (s.R % 1 ? '0' : '.00') + '\\text{ m}') + '.'; },
        parts: [
          { id: 'e14a', level: 'PRG', make: function (r, s) {
            var d = s.V - s.V3;
            return fields('Find the volume with exact ' + t('\\pi') + ' and again with ' + t('3.14') + ', each to the nearest hundredth of a cubic metre. Give the difference in cubic metres (nearest hundredth) and in litres (nearest hundredth).', [
              { label: 'With ' + t('\\pi') + ':', after: 'm³', x: s.V, dp: 2, alts: [{ v: 4 * PI * s.R * s.R, code: 'vol-sa', hint: 'Volume: ' + t('\\tfrac43\\pi r^{3}') + '.' }] },
              { label: 'With 3.14:', after: 'm³', x: s.V3, dp: 2, alts: [] },
              { label: 'Difference:', after: 'm³', x: d, dp: 2, alts: [{ v: rnd(s.V, 2) - rnd(s.V3, 2), code: 'early-round', hint: 'Subtract the unrounded volumes.' }] },
              { label: 'Difference:', after: 'L', x: d * 1000, dp: 2, alts: [{ v: d * 100, code: 'conv-step', hint: t('1\\text{ m}^{3}=1000\\text{ L}') + '.' }, { v: (rnd(s.V, 2) - rnd(s.V3, 2)) * 1000, code: 'early-round', hint: 'Use the unrounded difference.' }] }],
              t('V=\\tfrac43\\pi(' + dec(s.R) + ')^{3}=' + num(4 / 3 * Math.pow(s.R, 3)) + '\\pi=' + dots(s.V, 4)) + ' ≈ ' + fx(s.V, 2) + ' m³. With 3.14: ' + t(num(4 / 3 * Math.pow(s.R, 3)) + '(3.14)=' + dots(s.V3, 4)) + ' ≈ ' + fx(s.V3, 2) + ' m³.<br>Difference ' + t(num(4 / 3 * Math.pow(s.R, 3)) + '(\\pi-3.14)=' + dots(d, 6)) + ' ≈ ' + fx(d, 2) + ' m³ = ' + t(fx(d * 1000, 2)) + ' L.', ['Same formula twice, once with each value of ' + t('\\pi') + '.'], '3.14 volume error');
          } },
          { id: 'e14b', level: 'PRG', make: function (r, s) {
            var d = s.S - s.S3, cost = d * s.c;
            return fields('Find the surface area with exact ' + t('\\pi') + ' and with ' + t('3.14') + ' (nearest hundredth). A protective coating costs $' + s.c.toFixed(2) + ' per square metre: by how much would the 3.14 quotation be out, to the nearest cent?', [
              { label: 'With ' + t('\\pi') + ':', after: 'm²', x: s.S, dp: 2, alts: [{ v: s.S / 2, code: 'formula', hint: 'Sphere: ' + t('4\\pi r^{2}') + '.' }] },
              { label: 'With 3.14:', after: 'm²', x: s.S3, dp: 2, alts: [] },
              { label: 'Out by: $', x: cost, dp: 2, alts: [{ v: (rnd(s.S, 2) - rnd(s.S3, 2)) * s.c, code: 'early-round', hint: 'Use the unrounded areas.' }, { v: s.S * s.c, code: 'per-rate', hint: 'Only the <b>difference</b> in area matters.' }] }],
              t('SA=4\\pi(' + dec(s.R) + ')^{2}=' + num(4 * s.R * s.R) + '\\pi=' + dots(s.S, 4)) + '; with 3.14: ' + t(fx(s.S3, 2)) + '.<br>Difference ' + t(num(4 * s.R * s.R) + '(\\pi-3.14)=' + dots(d, 6)) + ' m², × $' + s.c.toFixed(2) + ' = $' + cost.toFixed(2) + '.', ['Find the difference in area, then multiply by the price.'], '3.14 coating error');
          } },
          { id: 'e14c', level: 'EMG', make: function (r, s) {
            var pe = (PI - 3.14) / PI * 100;
            return fields('Give the percent error of 3.14 itself, ' + t('\\tfrac{\\pi-3.14}{\\pi}\\times 100') + ', to four significant figures (that is, to the nearest hundred-thousandth). Then give the percent error in the volume of the gas holder, to the same precision.', [
              { label: '3.14 itself:', after: '%', x: pe, dp: 5, alts: [{ v: pe / 100, code: 'not-pct', hint: 'Multiply by 100 for a percent.' }] },
              { label: 'Volume:', after: '%', x: pe, dp: 5, alts: [{ v: 3 * pe, code: 'scale-k', hint: t('\\pi') + ' appears to the first power in ' + t('\\tfrac43\\pi r^{3}') + ' — it isn’t cubed. ' + t('r') + ' is.' }, { v: Math.pow(1 + pe / 100, 3) * 100 - 100, code: 'scale-k', hint: 'Only ' + t('r') + ' is cubed; ' + t('\\pi') + ' is not.' }] }],
              t('\\dfrac{\\pi-3.14}{\\pi}\\times 100=' + dots(pe, 7) + '\\approx 0.05070\\%') + '. In the volume, ' + t('\\dfrac{k\\pi-k(3.14)}{k\\pi}') + ' — the ' + t('k=\\tfrac43 r^{3}') + ' cancels, so the error is the same, ' + t('0.05070\\%') + '. An error in ' + t('\\pi') + ' isn’t cubed because ' + t('\\pi') + ' isn’t cubed in the formula.', ['Percent error = (true − approximate) ÷ true × 100.'], '3.14 percent error');
          } }] },
      { num: '15', shared: function (r) { var o = r.chance(0.25) ? { rc: 40, h: 1.2 } : { rc: r.pick([30, 40, 50, 60]), h: r.pick([0.9, 1.2, 1.5, 1.8]) }; o.rm = o.rc / 100; o.stu = (2 * PI * o.rc * o.rc + 2 * PI * o.rc * o.h) / 100; o.SAm = 2 * PI * o.rm * o.rm + 2 * PI * o.rm * o.h; o.SAc = o.SAm * 10000; return o; },
        stem: function (s) { var k = 2 * s.rc * s.rc + 2 * s.rc * s.h; return '<b>Two errors in four lines.</b> Asked for the surface area of a closed cylinder of radius ' + t(s.rc + '\\text{ cm}') + ' and height ' + t(s.h.toFixed(1) + '\\text{ m}') + ', <b>in square metres</b>, a student wrote ' + t('SA=2\\pi(' + s.rc + ')^{2}+2\\pi(' + s.rc + ')(' + s.h.toFixed(1) + ')=' + num(k) + '\\pi=' + fx(k * PI, 1) + '\\text{ cm}^{2},\\quad ' + fx(k * PI, 1) + '\\div 100=' + fx(k * PI / 100, 1) + '\\text{ m}^{2}') + '.'; },
        parts: [
          { id: 'e15a', level: 'PRG', make: function (r, s) {
            return B.grid('For each step, is it an error?', [{ id: 'mix', html: 'Substituting ' + t('r=' + s.rc) + ' (cm) and ' + t('h=' + s.h.toFixed(1)) + ' (m) into the same formula' }, { id: 'div', html: 'Dividing by 100 to change cm² to m²' }, { id: 'form', html: 'Using ' + t('SA=2\\pi r^{2}+2\\pi rh') + ' for a closed cylinder' }, { id: 'sq', html: 'Squaring the radius in ' + t('2\\pi r^{2}') }],
              [{ id: 'err', html: 'Error' }, { id: 'ok', html: 'Not an error' }], { mix: 'err', div: 'err', form: 'ok', sq: 'ok' },
              { why: function (row) { return { mix: { code: 'units', hint: 'Can you multiply centimetres by metres and get anything meaningful?' }, div: { code: 'lin-factor', hint: 'cm² → m² needs ' + t('\\div 100^{2}') + '.' }, form: { code: 'formula', hint: 'That is the right formula for a closed cylinder.' }, sq: { code: 'formula', hint: 'The formula does square the radius.' } }[row]; } },
              '<b>Error 1:</b> mixed units in one substitution (' + t('r') + ' in cm, ' + t('h') + ' in m). <b>Error 2:</b> cm² → m² needs ' + t('\\div 100^{2}=\\div 10\\,000') + ', not ' + t('\\div 100') + '. The formula and the squaring are fine.', ['Check the units of every number substituted, and the exponent of the conversion factor.'], 'two errors');
          } },
          { id: 'e15a2', sub: 'a-ii', level: 'EMG', make: function (r, s) {
            return mc(r, 'Which of the two errors would writing every conversion as a <b>unit factor</b> (e.g. ' + t('\\tfrac{' + s.h.toFixed(1) + '\\text{ m}}{1}\\times\\tfrac{100\\text{ cm}}{1\\text{ m}}') + ') have caught on sight?', [
              { html: 'The mixed units: with units written in, cm and m visibly don’t match before any arithmetic.', right: true },
              { html: 'Neither — unit factors only help with currency.', code: 'reason', why: 'Unit factors show every unit, so a cm-times-m clash is visible at once.' },
              { html: 'Only the ' + t('\\div 100') + ' error, because the formula is fine.', code: 'reason', why: 'The question is which error is visible immediately once units are written beside every number.' },
              { html: 'Neither — the student needed exact ' + t('\\pi') + '.', code: 'reason', why: 'The student did use ' + t('\\pi') + '. The errors are about units.' }],
              'Written as ' + t('\\tfrac{' + s.h.toFixed(1) + '\\text{ m}}{1}\\times\\tfrac{100\\text{ cm}}{1\\text{ m}}=' + num(s.h * 100) + '\\text{ cm}') + ', the metres cancel and the clash with ' + t('r=' + s.rc + '\\text{ cm}') + ' is visible before any arithmetic. (A squared unit factor ' + t('\\tfrac{1\\text{ m}^{2}}{100^{2}\\text{ cm}^{2}}') + ' would also catch the second.)', ['Imagine the units written beside every number in the first line.'], 'unit factor catches');
          } },
          { id: 'e15b', level: 'PRG', make: function (r, s) {
            return near('Give the correct surface area to the nearest hundredth of a square metre, working entirely in metres.', s.SAm, 2, 'm²', [
              { v: s.stu, code: 'same-claim', hint: 'That’s the student’s answer. Put ' + t('r=' + s.rm.toFixed(2) + '\\text{ m}') + '.' },
              { v: s.SAm - PI * s.rm * s.rm, code: 'missing-face', hint: 'A closed cylinder has two ends.' },
              { v: 2 * PI * s.rm * s.h, code: 'missing-face', hint: 'Include the two ends ' + t('2\\pi r^{2}') + '.' }],
              t('r=' + s.rm.toFixed(2) + '\\text{ m},\\ h=' + s.h.toFixed(2) + '\\text{ m}') + '. ' + t('SA=2\\pi(' + s.rm.toFixed(2) + ')^{2}+2\\pi(' + s.rm.toFixed(2) + ')(' + s.h.toFixed(2) + ')=' + num(2 * s.rm * s.rm + 2 * s.rm * s.h) + '\\pi=' + dots(s.SAm, 5)) + ' ≈ ' + t(fx(s.SAm, 2) + '\\text{ m}^{2}') + '.', ['Change ' + t(s.rc + '\\text{ cm}') + ' to metres first.'], 'cylinder SA in m');
          } },
          { id: 'e15c', level: 'ADV', make: function (r, s) {
            var f = s.stu / s.SAm;
            return fields('Redo it entirely in centimetres (' + t('r=' + s.rc) + ' cm, ' + t('h=' + num(s.h * 100)) + ' cm), giving the area in cm² to the nearest hundredth. Then state the factor by which the student’s answer (' + t(fx(s.stu, 1) + '\\text{ m}^{2}') + ') is too large, to the nearest hundredth.', [
              { label: t('SA='), after: 'cm²', x: s.SAc, dp: 2, alts: [{ v: s.SAm * 100, code: 'lin-factor', hint: 'Work in cm from the start: ' + t('h=' + num(s.h * 100)) + ' cm.' }] },
              { label: 'Factor:', after: '', x: f, dp: 2, alts: [{ v: 1 / f, code: 'ratio-flip', hint: 'Student’s answer ÷ correct answer.' }] }],
              t('SA=2\\pi(' + s.rc + ')^{2}+2\\pi(' + s.rc + ')(' + num(s.h * 100) + ')=' + num(2 * s.rc * s.rc + 2 * s.rc * s.h * 100) + '\\pi=' + dots(s.SAc, 4)) + ' cm²; ' + t('\\div 100^{2}=' + dots(s.SAm, 5)) + ' m² — the same. Student ÷ correct ' + t('=\\dfrac{' + dots(s.stu, 3) + '}{' + dots(s.SAm, 4) + '}=' + dots(f, 4)) + ' ≈ ' + fx(f, 2) + ' times too large.', ['Every length in cm; then divide by ' + t('100^{2}') + ' to compare.'], 'cylinder SA in cm');
          } }] },
      { num: '16', stem: '<b>Two heights, and one flat circle.</b> Find the mistake in each report and correct it.', parts: [
        { id: 'e16a', level: 'PRG', make: function (r) {
          var tr = r.chance(0.25) ? [9, 12, 15] : r.pick([[9, 12, 15], [6, 8, 10], [5, 12, 13], [8, 15, 17], [12, 9, 15], [7, 24, 25]]), rr = tr[0], h = tr[1], sl = tr[2], V = PI * rr * rr * h / 3, W = PI * rr * rr * sl / 3;
          return fields('A cone has base radius ' + t(rr + '.0\\text{ cm}') + ' and slant height ' + t(sl + '.0\\text{ cm}') + '. A student writes ' + t('V=\\tfrac13\\pi(' + rr + '.0)^{2}(' + sl + '.0)=' + fx(W, 1) + '\\text{ cm}^{3}') + '. Give the correct volume to the nearest tenth, and the exact factor (student ÷ correct) by which the student is out, as a decimal.', [
            { label: t('V='), after: 'cm³', x: V, dp: 1, alts: [{ v: W, code: 'slant-for-h', hint: 'That’s the student’s value: it uses the slant height. Find the perpendicular height first: ' + t('h=\\sqrt{s^{2}-r^{2}}') + '.' }] },
            { label: 'Factor:', after: '', x: sl / h, dp: 4, exact: true, alts: [{ v: h / sl, code: 'ratio-flip', hint: 'Student ÷ correct — it is more than 1.' }] }],
            'The volume needs the <b>perpendicular</b> height: ' + t('h=\\sqrt{' + sl + '^{2}-' + rr + '^{2}}=' + h) + ' cm. ' + t('V=\\tfrac13\\pi(' + rr + ')^{2}(' + h + ')=' + num(rr * rr * h / 3) + '\\pi=' + dots(V, 3)) + ' ≈ ' + t(fx(V, 1)) + ' cm³.<br>Factor ' + t('=\\dfrac{' + sl + '}{' + h + '}=' + dec(sl / h)) + ' (V is proportional to the height substituted).', ['Which height does a cone’s volume use?'], 'cone volume slant error');
        } },
        { id: 'e16b', level: 'EMG', make: function (r) {
          var rr = r.chance(0.25) ? 5 : r.pick([4, 6, 7.5, 8]), A = 2 * PI * rr * rr;
          return near('A solid glass hemisphere of radius ' + t(dec(rr) + (rr % 1 ? '' : '.0') + '\\text{ cm}') + ' rests on a felt pad. Asked for “the glass surface you can touch”, a student answers ' + t('3\\pi r^{2}=' + fx(3 * PI * rr * rr, 1) + '\\text{ cm}^{2}') + '. Give the correct area, to the nearest tenth.', A, 1, 'cm²', [
            { v: 1.5 * A, code: 'hemi-base', hint: 'That’s the student’s answer. The flat face rests on the pad — you can’t touch it.' },
            { v: 2 * A, code: 'sphere-for-hemi', hint: 'Half a sphere’s surface: ' + t('2\\pi r^{2}') + '.' }],
            '“The glass surface you can <i>touch</i>”: the flat face is on the felt pad, so only the curved dome counts. ' + t('SA=2\\pi r^{2}=2\\pi(' + dec(rr) + ')^{2}=' + num(2 * rr * rr) + '\\pi=' + dots(A, 3)) + ' ≈ ' + t(fx(A, 1) + '\\text{ cm}^{2}') + '.', ['Which surfaces can you actually touch when it rests on the pad?'], 'touchable hemisphere');
        } },
        { id: 'e16c', level: 'EMG', make: function (r) {
          var rr = r.chance(0.25) ? 1.8 : r.pick([1.5, 2.0, 2.2, 2.4]);
          return fields('A hemispherical dome tent of radius ' + t(rr.toFixed(1) + '\\text{ m}') + ' is sold “complete with sewn-in groundsheet”. Give the total area of fabric to the nearest hundredth of a square metre, and the area if the groundsheet were sold separately (dome only).', [
            { label: 'With groundsheet:', after: 'm²', x: 3 * PI * rr * rr, dp: 2, alts: [{ v: 2 * PI * rr * rr, code: 'hemi-nobase', hint: '“Complete with sewn-in groundsheet” includes the floor: ' + t('3\\pi r^{2}') + '.' }, { v: 4 * PI * rr * rr, code: 'sphere-for-hemi', hint: 'A hemisphere plus its floor: ' + t('3\\pi r^{2}') + '.' }] },
            { label: 'Dome only:', after: 'm²', x: 2 * PI * rr * rr, dp: 2, alts: [{ v: 3 * PI * rr * rr, code: 'hemi-base', hint: 'Without the groundsheet: ' + t('2\\pi r^{2}') + '.' }] }],
            t('3\\pi(' + rr.toFixed(1) + ')^{2}=' + num(3 * rr * rr) + '\\pi') + ' ≈ ' + t(fx(3 * PI * rr * rr, 2) + '\\text{ m}^{2}') + '; dome only ' + t('2\\pi(' + rr.toFixed(1) + ')^{2}') + ' ≈ ' + t(fx(2 * PI * rr * rr, 2) + '\\text{ m}^{2}') + '.', ['Does the wording include the flat floor?'], 'tent fabric');
        } }] },

      /* ======================= Part F — Challenge ======================= */
      { num: '17', section: 'Extra practice F — Challenge', shared: function (r) {
          var V = r.chance(0.25) ? 2000 : r.pick([1000, 1500, 2500, 3000]), o = { V: V, c: r.pick([0.0042, 0.0035, 0.0050]) };
          o.rA = Math.cbrt(V / (2 * PI)); o.hA = 2 * o.rA; o.a = Math.cbrt(V); o.rC = Math.cbrt(3 * V / (4 * PI)); o.SA = 6 * PI * o.rA * o.rA; o.SB = 6 * o.a * o.a; o.SC = 4 * PI * o.rC * o.rC;
          return o;
        }, stem: function (s) { return '<b>Least material for the same capacity.</b> Three closed containers must each hold exactly ' + t(F(s.V) + '\\text{ cm}^{3}') + ': <b>A</b> a cylinder whose height equals its diameter, <b>B</b> a cube, <b>C</b> a sphere.' + containers(s.V); },
        parts: [
          { id: 'e17a', level: 'ADV', make: function (r, s) {
            return fields('Find each container’s dimensions, to the nearest hundredth of a centimetre.', [
              { label: 'A: ' + t('r='), after: 'cm', x: s.rA, dp: 2, alts: [{ v: Math.cbrt(s.V / PI), code: 'formula', hint: 'With ' + t('h=2r') + ': ' + t('V=\\pi r^{2}(2r)=2\\pi r^{3}') + '.' }, { v: Math.sqrt(s.V / (2 * PI)), code: 'wrong-root', hint: 'Cube root: ' + t('r^{3}=\\tfrac{V}{2\\pi}') + '.' }] },
              { label: 'A: ' + t('h='), after: 'cm', x: s.hA, dp: 2, alts: [{ v: s.rA, code: 'radius-diam', hint: t('h=2r') + '.' }] },
              { label: 'B: edge', after: 'cm', x: s.a, dp: 2, alts: [{ v: Math.sqrt(s.V), code: 'wrong-root', hint: 'A cube’s volume is ' + t('a^{3}') + ': cube root.' }, { v: s.V / 6, code: 'formula', hint: t('V=a^{3}') + '.' }] },
              { label: 'C: ' + t('r='), after: 'cm', x: s.rC, dp: 2, alts: [{ v: Math.cbrt(3 * s.V / (2 * PI)), code: 'formula', hint: 'Sphere: ' + t('\\tfrac43\\pi r^{3}') + '.' }] }],
              'A: ' + t('2\\pi r^{3}=' + s.V + '\\Rightarrow r=\\sqrt[3]{\\tfrac{' + s.V + '}{2\\pi}}=' + dots(s.rA, 5)) + ', ' + t('h=' + dots(s.hA, 4)) + '.<br>B: ' + t('a=\\sqrt[3]{' + s.V + '}=' + dots(s.a, 5)) + '.<br>C: ' + t('r=\\sqrt[3]{\\tfrac{3(' + s.V + ')}{4\\pi}}=' + dots(s.rC, 5)) + '.', ['Write each volume formula, substitute ' + t('h=2r') + ' for A, and solve for the length.'], 'container dimensions');
          } },
          { id: 'e17b', level: 'ADV', make: function (r, s) {
            return fields('Using the unrounded dimensions (A: ' + t('r\\approx ' + dots(s.rA, 4)) + ', ' + t('h=2r') + '; B: edge ' + t(dots(s.a, 4)) + '; C: ' + t('r\\approx ' + dots(s.rC, 4)) + '), find each surface area, to the nearest hundredth of a square centimetre.', [
              { label: 'A:', after: 'cm²', x: s.SA, dp: 2, alts: [{ v: 2 * PI * s.rA * s.hA, code: 'missing-face', hint: 'Closed: include both ends, ' + t('2\\pi r^{2}') + '.' }, { v: 4 * PI * s.rA * s.rA, code: 'formula', hint: t('2\\pi r^{2}+2\\pi r(2r)=6\\pi r^{2}') + '.' }] },
              { label: 'B:', after: 'cm²', x: s.SB, dp: 2, alts: [{ v: 4 * s.a * s.a, code: 'missing-face', hint: 'A cube has 6 faces.' }] },
              { label: 'C:', after: 'cm²', x: s.SC, dp: 2, alts: [{ v: 2 * PI * s.rC * s.rC, code: 'formula', hint: 'Sphere: ' + t('4\\pi r^{2}') + '.' }] }],
              'A: ' + t('6\\pi r^{2}=' + dots(s.SA, 3)) + '. B: ' + t('6a^{2}=' + dots(s.SB, 3)) + '. C: ' + t('4\\pi r^{2}=' + dots(s.SC, 3)) + '.', ['A closed cylinder with ' + t('h=2r') + ' has ' + t('SA=6\\pi r^{2}') + '.'], 'container surface areas');
          } },
          { id: 'e17b2', sub: 'b-ii', level: 'EMG', make: function (r, s) {
            return B.order(r, 'The surface areas are A (cylinder) ' + t(fx(s.SA, 2)) + ', B (cube) ' + t(fx(s.SB, 2)) + ', C (sphere) ' + t(fx(s.SC, 2)) + ' cm². Rank the containers from least material to most.', [{ id: 'C', html: 'C (sphere)', tex: 'C' }, { id: 'A', html: 'A (cylinder)', tex: 'A' }, { id: 'B', html: 'B (cube)', tex: 'B' }], { first: 'least material', last: 'most material' },
              'C ' + t('<') + ' A ' + t('<') + ' B: the sphere uses least material, the cube most.', ['Compare the three surface areas.'], 'rank by material');
          } },
          { id: 'e17c', level: 'ADV', make: function (r, s) {
            var cs = [s.SA * s.c, s.SB * s.c, s.SC * s.c], save = (s.SB - s.SC) / s.SB * 100;
            return fields('Sheet material costs $' + String(s.c) + ' per square centimetre. With the surface areas A ' + t(dots(s.SA, 3)) + ', B ' + t(dots(s.SB, 3)) + ', C ' + t(dots(s.SC, 3)) + ' cm², give the three costs to the nearest cent, and the percentage saved by the best over the worst, to the nearest tenth.', [
              { label: 'A: $', x: cs[0], dp: 2, alts: [] }, { label: 'B: $', x: cs[1], dp: 2, alts: [] }, { label: 'C: $', x: cs[2], dp: 2, alts: [] },
              { label: 'Saved:', after: '%', x: save, dp: 1, alts: [{ v: (s.SB - s.SC) / s.SC * 100, code: 'pct-base', hint: 'Percentage saved compares with the <b>worst</b> (the cube’s) cost.' }, { v: (s.SA - s.SC) / s.SA * 100, code: 'compare', hint: 'Best over <b>worst</b>: the sphere against the cube.' }] }],
              'A: ' + t(dots(s.SA, 3) + '\\times ' + s.c + '\\approx ' + cs[0].toFixed(2)) + '; B: ' + t(cs[1].toFixed(2)) + '; C: ' + t(cs[2].toFixed(2)) + ' dollars.<br>Saved: ' + t('\\dfrac{' + dots(s.SB, 3) + '-' + dots(s.SC, 3) + '}{' + dots(s.SB, 3) + '}\\times 100=' + dots(save, 4)) + ' ≈ ' + fx(save, 1) + '%.', ['Cost = area × price per cm². Saving = (worst − best) ÷ worst × 100.'], 'container costs');
          } },
          { id: 'e17d', level: 'EMG', make: function (r, s) {
            return mc(r, 'The sphere uses the least material, yet almost nothing is sold in spherical containers. Which is the best practical reason?', [
              { html: 'Spheres don’t stand up or stack, waste space when packed, and are hard to make, fill, label and pour from.', right: true },
              { html: 'A sphere holds less than the other two.', code: 'reason', why: 'All three hold exactly the same ' + F(s.V) + ' cm³.' },
              { html: 'A sphere’s surface area can’t be calculated exactly.', code: 'reason', why: t('4\\pi r^{2}') + ' is exact. The reasons are practical ones: stacking, packing, making, pouring.' },
              { html: 'The cube uses the least material.', code: 'reason', why: 'Check the ranking: the cube uses the most.' }],
              'Spheres roll, can’t stack, waste about a quarter of a carton’s space, and are hard to manufacture, fill, seal, label and pour from. Close to the winner: spherical gas storage tanks. Close to the runner-up: an ordinary soup can (a squat ' + t('h\\approx 2r') + ' cylinder).', ['Think about shelves, boxes and pouring.'], 'why not spheres');
          } }] },
      { num: '18', stem: '<b>When the surface area and the volume are the same number.</b>', parts: [
        { id: 'e18a', level: 'ADV', make: function (r) {
          var k = r.chance(0.4) ? 2 : r.pick([1, 4]), rc = (2 + 2 * k) / k;
          return fields('Find, algebraically, the size for which the surface area and the volume are numerically equal: the radius of a sphere, the edge of a cube, and the radius of a closed cylinder with ' + t('h=' + (k === 1 ? '' : k) + 'r') + '.', [
            { label: 'Sphere ' + t('r='), after: '', x: 3, key: 3, check: exactNum(3, function (v) { if (Math.abs(v - 1 / 3) < 1e-9) return { code: 'ratio-flip', hint: 'Divide both sides of ' + t('4\\pi r^{2}=\\tfrac43\\pi r^{3}') + ' by ' + t('4\\pi r^{2}') + ': ' + t('1=\\tfrac{r}{3}') + '.' }; return null; }) },
            { label: 'Cube edge ' + t('a='), after: '', x: 6, key: 6, check: exactNum(6, function (v) { if (Math.abs(v - 1 / 6) < 1e-9) return { code: 'ratio-flip', hint: t('6a^{2}=a^{3}\\Rightarrow a=6') + '.' }; return null; }) },
            { label: 'Cylinder ' + t('r='), after: '', x: rc, dp: 2, exact: true, alts: [{ v: 3, code: 'formula', hint: 'With ' + t('h=' + (k === 1 ? '' : k) + 'r') + ': ' + t('SA=2\\pi r^{2}+2\\pi r(' + (k === 1 ? '' : k) + 'r)=' + (2 + 2 * k) + '\\pi r^{2}') + ' and ' + t('V=' + (k === 1 ? '' : k) + '\\pi r^{3}') + '.' }] }],
            'Sphere: ' + t('4\\pi r^{2}=\\tfrac43\\pi r^{3}\\Rightarrow r=3') + '. Cube: ' + t('6a^{2}=a^{3}\\Rightarrow a=6') + '.<br>Cylinder: ' + t('SA=' + (2 + 2 * k) + '\\pi r^{2},\\ V=' + (k === 1 ? '' : k) + '\\pi r^{3}') + ', so ' + t('r=\\tfrac{' + (2 + 2 * k) + '}{' + k + '}=' + num(rc)) + '.', ['Set SA = V and divide both sides by the common factor (like ' + t('4\\pi r^{2}') + ').'], 'SA = V sizes');
        } },
        { id: 'e18b', level: 'PRG', make: function (r) {
          var u = r.chance(0.6) ? ['cm', 'mm', 10] : ['m', 'cm', 100], k = u[2], R = 3 * k;
          return fields('The sphere of radius ' + t('3\\text{ ' + u[0] + '}') + ' has ' + t('SA=36\\pi\\text{ ' + u[0] + '}^{2}') + ' and ' + t('V=36\\pi\\text{ ' + u[0] + '}^{3}') + '. Rewrite <i>the same sphere</i> in ' + u[1] + ' (' + t('r=' + R + '\\text{ ' + u[1] + '}') + ') and give both numbers as multiples of ' + t('\\pi') + ', and the factor between them (V-number ÷ SA-number).', [
            { label: t('SA='), after: t('\\pi\\text{ ' + u[1] + '}^{2}'), x: 4 * R * R, key: 4 * R * R, check: exactNum(4 * R * R, function (v) { if (v === 36 * k) return { code: 'lin-factor', hint: 'Area numbers scale by ' + t(k + '^{2}') + '.' }; return null; }) },
            { label: t('V='), after: t('\\pi\\text{ ' + u[1] + '}^{3}'), x: 4 * R * R * R / 3, key: 4 * R * R * R / 3, check: exactNum(4 * R * R * R / 3, function (v) { if (v === 36 * k * k) return { code: 'sq-factor', hint: 'Volume numbers scale by ' + t(k + '^{3}') + '.' }; return null; }) },
            { label: 'Factor:', after: '', x: k, key: k, check: exactNum(k, function (v) { if (Math.abs(v - 1 / k) < 1e-9) return { code: 'ratio-flip', hint: 'V-number ÷ SA-number.' }; return null; }) }],
            t('SA=4\\pi(' + R + ')^{2}=' + F(4 * R * R) + '\\pi') + ', ' + t('V=\\tfrac43\\pi(' + R + ')^{3}=' + F(4 * R * R * R / 3) + '\\pi') + '. Factor ' + t('=' + k) + ' — exactly the number of ' + u[1] + ' in a ' + u[0] + '. The equality is gone.', ['Area numbers scale by ' + t('k^{2}') + ', volume numbers by ' + t('k^{3}') + '.'], 'SA=V change of unit');
        } },
        { id: 'e18c', level: 'PRG', make: function (r) {
          return mc(r, 'Why must changing the unit break the equality ' + t('SA=V') + ', and why does every sphere have exactly one unit in which ' + t('SA') + ' and ' + t('V') + ' come out as the same number?', [
            { html: 'Shrinking the unit by ' + t('k') + ' multiplies the area number by ' + t('k^{2}') + ' and the volume number by ' + t('k^{3}') + ', so V÷SA changes by ' + t('k') + '. V÷SA ' + t('=\\tfrac{r}{3}') + ', and exactly one unit makes ' + t('r') + ' measure 3.', right: true },
            { html: 'Changing the unit multiplies both numbers by the same factor, so the equality survives.', code: 'reason', why: 'Areas scale by ' + t('k^{2}') + ' but volumes by ' + t('k^{3}') + ' — not the same factor.' },
            { html: 'Only metric units keep the equality; imperial units break it.', code: 'reason', why: 'It’s about the size of the unit, not the system.' },
            { html: 'Every sphere has ' + t('SA=V') + ' in every unit, because both contain ' + t('\\pi') + '.', code: 'reason', why: 'Try it: ' + t('r=3') + ' cm gives ' + t('36\\pi') + ' for both, but in mm the numbers differ by a factor of 10.' }],
            'Area numbers scale by ' + t('k^{2}') + ', volume numbers by ' + t('k^{3}') + ', so the ratio V÷SA is multiplied by ' + t('k') + '. For a sphere V÷SA ' + t('=\\tfrac r3') + ', so the numbers agree only in the one unit in which ' + t('r') + ' measures 3.', ['Use the ' + t('k^{2}') + ' and ' + t('k^{3}') + ' rules.'], 'why SA=V depends on unit');
        } },
        { id: 'e18d', level: 'MAS', make: function (r) {
          var R = r.chance(0.25) ? 5 : r.pick([4, 6, 7.5, 9, 10]), u = R / 3;
          return near('A sphere has radius ' + t(dec(R) + (R % 1 ? '' : '.0') + '\\text{ cm}') + '. Find the length of the unit, in centimetres to the nearest hundredth, in which this sphere’s surface area and volume would be numerically equal.', u, 2, 'cm', [
            { v: 3 * R, code: 'ratio-flip', hint: 'The radius must measure <b>3</b> of the new units: ' + t('\\tfrac{' + dec(R) + '}{u}=3') + '.' },
            { v: R / 6, code: 'formula', hint: 'For a sphere the special size is ' + t('r=3') + ' units (6 is the cube’s edge).' },
            { v: 3 / R, code: 'ratio-flip', hint: t('\\tfrac{' + dec(R) + '\\text{ cm}}{u}=3') + ', so ' + t('u=\\tfrac{' + dec(R) + '}{3}') + '.' }],
            'In the new unit of length ' + t('u') + ' cm, the radius measures ' + t('\\tfrac{' + dec(R) + '}{u}') + ', and SA = V needs it to be 3: ' + t('u=\\tfrac{' + dec(R) + '}{3}=' + dots(u, 4)) + ' ≈ ' + t(fx(u, 2) + '\\text{ cm}') + '. Check: ' + t('r=3') + ' units gives ' + t('SA=V=36\\pi') + '.', ['In which unit does the radius measure exactly 3?'], 'unit making SA=V', { exact: true });
        } },
        { id: 'e18e', sub: 'd-ii', level: 'EMG', make: function (r) {
          return mc(r, 'What does “' + t('SA=V') + '” actually tell you about a solid?', [
            { html: 'Only that its size measures a particular number (like ' + t('r=3') + ') in the unit chosen — nothing about its shape, material or efficiency.', right: true },
            { html: 'That the solid is as efficient as possible (least surface for its volume).', code: 'reason', why: 'Every sphere has SA = V in some unit, efficient or not. It’s a coincidence of the unit.' },
            { html: 'That its area and volume are the same size.', code: 'reason', why: 'An area and a volume can’t be compared — the units differ.' },
            { html: 'That it must be a sphere.', code: 'reason', why: 'A cube of edge 6 or a cylinder also has SA = V in the right unit.' }],
            'It says only that a length measures 3 (or 6, …) in the chosen unit. Change the unit and it disappears; area and volume were never comparable.', ['Would it still be true after changing units?'], 'meaning of SA=V');
        } }] },
      { num: '19', shared: function (r) {
          var o = r.chance(0.25) ? { d: 6.40, h: 7.50, k: 25 } : { d: r.pick([5.60, 6.00, 6.40, 7.20]), h: r.pick([6.00, 7.50, 9.00]), k: r.pick([20, 25, 40, 50]) };
          o.r = o.d / 2; o.V = PI * o.r * o.r * o.h; o.dm = o.d / o.k * 100; o.hm = o.h / o.k * 100; o.Vm = o.V / Math.pow(o.k, 3) * 1000; o.P = 2 * PI * o.r * o.h + PI * o.r * o.r; o.Pm = o.P / (o.k * o.k);
          return o;
        }, stem: function (s) { return '<b>A scale model.</b> A cylindrical water tower has a diameter of ' + t(s.d.toFixed(2) + '\\text{ m}') + ' and a height of ' + t(s.h.toFixed(2) + '\\text{ m}') + '. A display model is built at a scale of ' + t('1:' + s.k) + '.' + figWrap(HW.solid('cylinder', { d: s.d.toFixed(2) + ' m', h: s.h.toFixed(2) + ' m', width: 190 })); },
        parts: [
          { id: 'e19a', level: 'EMG', make: function (r, s) {
            return fields('Determine the real tower’s capacity, in cubic metres to the nearest thousandth and in litres to the nearest litre.', [
              { label: t('V='), after: 'm³', x: s.V, dp: 3, alts: [{ v: 4 * s.V, code: 'diam-radius', hint: 'Use the radius ' + t(s.r.toFixed(2)) + ' m.' }] },
              { label: t('V='), after: 'L', x: s.V * 1000, dp: 0, alts: [{ v: s.V * 100, code: 'conv-step', hint: t('1\\text{ m}^{3}=1000\\text{ L}') + '.' }] }],
              t('V=\\pi(' + s.r.toFixed(2) + ')^{2}(' + s.h.toFixed(2) + ')=' + num(s.r * s.r * s.h) + '\\pi=' + dots(s.V, 5)) + ' ≈ ' + t(fx(s.V, 3)) + ' m³ ≈ ' + t(fx(s.V * 1000, 0)) + ' L.', ['Cylinder: ' + t('\\pi r^{2}h') + '; 1 m³ = 1000 L.'], 'tower capacity');
          } },
          { id: 'e19b', level: 'PRG', make: function (r, s) {
            return fields('The real tower holds ' + t(dots(s.V, 4) + '\\text{ m}^{3}') + '. State the model’s diameter and height in centimetres, then the model’s capacity in litres to the nearest thousandth.', [
              { label: 'Model diameter:', after: 'cm', x: s.dm, dp: 2, exact: true, alts: [{ v: s.d / s.k, code: 'units', hint: 'That’s in metres. Give centimetres.' }] },
              { label: 'Model height:', after: 'cm', x: s.hm, dp: 2, exact: true, alts: [{ v: s.h / s.k, code: 'units', hint: 'That’s in metres.' }] },
              { label: 'Model capacity:', after: 'L', x: s.Vm, dp: 3, alts: [{ v: s.V * 1000 / s.k, code: 'scale-k', hint: 'Capacity scales by the <b>cube</b>: divide by ' + t(s.k + '^{3}') + '.' }, { v: s.V * 1000 / (s.k * s.k), code: 'scale-k', hint: 'Volume scales by ' + t('k^{3}') + ', not ' + t('k^{2}') + '.' }] }],
              'Model: ' + t('\\tfrac{' + s.d.toFixed(2) + '}{' + s.k + '}\\text{ m}=' + num(s.dm) + '\\text{ cm}') + ', ' + t('\\tfrac{' + s.h.toFixed(2) + '}{' + s.k + '}\\text{ m}=' + num(s.hm) + '\\text{ cm}') + '.<br>Route 1: ' + t('\\dfrac{' + dots(s.V, 4) + '}{' + s.k + '^{3}}=' + dots(s.Vm / 1000, 7) + '\\text{ m}^{3}') + ' ≈ ' + t(fx(s.Vm, 3) + '\\text{ L}') + '. Route 2: ' + t('\\pi(' + num(s.dm / 2) + ')^{2}(' + num(s.hm) + ')\\text{ cm}^{3}') + ' gives the same.', ['Lengths ÷ ' + s.k + '; capacity ÷ ' + t(s.k + '^{3}') + '.'], 'model dimensions and capacity');
          } },
          { id: 'e19c', level: 'ADV', make: function (r, s) {
            return fields('The real tower’s curved wall and flat top are painted (not the base). Find that area to the nearest thousandth of a square metre, then the model’s painted area in square metres (nearest ten-thousandth) and in square centimetres (nearest hundredth).', [
              { label: 'Real:', after: 'm²', x: s.P, dp: 3, alts: [{ v: s.P + PI * s.r * s.r, code: 'extra-face', hint: 'The base isn’t painted.' }, { v: 2 * PI * s.r * s.h, code: 'missing-face', hint: 'Include the flat top.' }] },
              { label: 'Model:', after: 'm²', x: s.Pm, dp: 4, alts: [{ v: s.P / s.k, code: 'scale-k', hint: 'Areas scale by ' + t('k^{2}') + '.' }, { v: s.P / Math.pow(s.k, 3), code: 'scale-k', hint: 'Areas scale by ' + t('k^{2}') + ', not ' + t('k^{3}') + '.' }] },
              { label: 'Model:', after: 'cm²', x: s.Pm * 10000, dp: 2, alts: [{ v: s.Pm * 100, code: 'lin-factor', hint: t('1\\text{ m}^{2}=100^{2}\\text{ cm}^{2}') + '.' }] }],
              'Real: ' + t('2\\pi(' + s.r.toFixed(2) + ')(' + s.h.toFixed(2) + ')+\\pi(' + s.r.toFixed(2) + ')^{2}=' + num(2 * s.r * s.h + s.r * s.r) + '\\pi=' + dots(s.P, 5)) + ' ≈ ' + t(fx(s.P, 3)) + ' m².<br>Model: ' + t('\\div ' + s.k + '^{2}=' + dots(s.Pm, 6)) + ' m² ' + t('=' + dots(s.Pm * 10000, 4)) + ' cm² (also from the model’s own dimensions).', ['Curved wall ' + t('2\\pi rh') + ' plus top ' + t('\\pi r^{2}') + '. Areas scale by ' + t('k^{2}') + '.'], 'painted areas');
          } },
          { id: 'e19d', level: 'PRG', make: function (r, s) {
            var cl = s.V * 1000 / s.k;
            return fields('The real tower holds ' + t(dots(s.V * 1000, 1) + '\\text{ L}') + ' and the model ' + t(dots(s.Vm, 4) + '\\text{ L}') + '. A classmate says “the model is ' + t('\\tfrac{1}{' + s.k + '}') + ' the size, so it holds ' + t('\\tfrac{1}{' + s.k + '}') + ' as much.” Give the litres that claim produces (nearest litre), and the exact factor by which it is too big.', [
              { label: 'Claim:', after: 'L', x: cl, dp: 0, alts: [] },
              { label: 'Too big by a factor of', after: '', x: s.k * s.k, key: s.k * s.k, check: exactNum(s.k * s.k, function (v) { if (v === s.k) return { code: 'scale-k', hint: 'Divide the claim by the true model capacity: ' + t('\\tfrac{k^{3}}{k}') + '.' }; if (v === Math.pow(s.k, 3)) return { code: 'scale-k', hint: 'The claim already divided by ' + s.k + '; compare it with the truth.' }; return null; }) }],
              'Claim: ' + t(dots(s.V * 1000, 1) + '\\div ' + s.k + '\\approx ' + fx(cl, 0)) + ' L. Truth ' + t(fx(s.Vm, 3)) + ' L. Factor ' + t('=\\tfrac{k^{3}}{k}=k^{2}=' + s.k * s.k) + '.', ['The classmate divided by ' + t('k') + ' where ' + t('k^{3}') + ' was needed.'], 'scale claim');
          } },
          { id: 'e19e', level: 'EMG', make: function (r, s) {
            return mc(r, 'Which sentence links the scale factors ' + t('k, k^{2}, k^{3}') + ' to the unit factors ' + t('100, 100^{2}, 100^{3}') + ' used in converting m, m², m³ to cm, cm², cm³?', [
              { html: 'Whenever every length is multiplied by a factor, areas are multiplied by its square and volumes by its cube — whether the factor comes from a scale model or from a change of unit.', right: true },
              { html: 'Scale models use ' + t('k') + ' for everything; only unit conversions need squares and cubes.', code: 'reason', why: 'The model’s capacity needed ' + t('k^{3}') + ' — the same rule as converting m³.' },
              { html: 'Unit conversions always multiply by 100, whatever the dimension.', code: 'reason', why: t('1\\text{ m}^{2}=100^{2}\\text{ cm}^{2}') + ' and ' + t('1\\text{ m}^{3}=100^{3}\\text{ cm}^{3}') + '.' },
              { html: 'Areas scale by ' + t('2k') + ' and volumes by ' + t('3k') + '.', code: 'reason', why: 'Exponents, not multiples: ' + t('k^{2}') + ' and ' + t('k^{3}') + '.' }],
              'Same rule, same exponents: m → cm multiplies lengths by 100, areas by ' + t('100^{2}') + ', volumes by ' + t('100^{3}') + '; a 1:' + s.k + ' model divides them by ' + t(s.k + ', ' + s.k + '^{2}, ' + s.k + '^{3}') + '.', ['Compare how the model’s area and capacity were found with how m² and m³ convert to cm² and cm³.'], 'scale and unit factors');
          } }] },

      /* ======================= Part G — Estimating and converting in the field ======================= */
      { num: '20', section: 'Extra practice G — Estimating and converting in the field', shared: function (r) {
          var o = r.chance(0.25) ? { nL: 7, nW: 3, nH: 3, p: 0.90, pt: 0.86, sp: 0.80, st: 0.76, beam: 6.00 } : (function () { var p = r.pick([0.90, 0.85, 1.00]), sp = r.pick([0.80, 0.75]); return { nL: r.int(6, 9), nW: r.pick([3, 4]), nH: 3, p: p, pt: +(p - r.pick([0.03, 0.04, 0.05])).toFixed(2), sp: sp, st: +(sp - r.pick([0.03, 0.04])).toFixed(2) }; })();
          o.eL = o.nL * o.p; o.eW = o.nW * o.p; o.eH = o.nH * o.sp; o.tL = o.nL * o.pt; o.tW = o.nW * o.pt; o.tH = o.nH * o.st;
          o.peP = (o.p - o.pt) / o.pt * 100; o.peS = (o.sp - o.st) / o.st * 100; o.Ve = o.eL * o.eW * o.eH; o.Vt = o.tL * o.tW * o.tH; o.pv = (o.Ve - o.Vt) / o.Vt * 100;
          if (!o.beam) o.beam = +(o.tL - r.pick([0.02, 0.03, 0.05])).toFixed(2);
          return o;
        }, stem: function (s) { return '<b>A referent, used three times over.</b> Priya estimates the inside of a shipping container without a tape. She walks its length in ' + t(s.nL) + ' paces and its width in ' + t(s.nW) + ' paces, taking her pace to be ' + t(s.p.toFixed(2) + '\\text{ m}') + '; she measures its height as ' + t(s.nH) + ' arm-spans, taking her span to be ' + t(s.sp.toFixed(2) + '\\text{ m}') + '. Her counts are exact. Her pace is truly ' + t(s.pt.toFixed(2) + '\\text{ m}') + ' and her span is truly ' + t(s.st.toFixed(2) + '\\text{ m}') + '.'; },
        parts: [
          { id: 'e20a', level: 'BEG', outcome: 'M1', make: function (r, s) {
            var mk = function (lab, v, alt) { return { label: lab, after: 'm', x: v, dp: 2, exact: true, alts: alt ? [alt] : [] }; };
            return fields('State Priya’s three estimated dimensions and the three true dimensions, in metres.', [
              mk('Estimated length:', s.eL), mk('Estimated width:', s.eW), mk('Estimated height:', s.eH, { v: s.nH * s.p, code: 'formula', hint: 'The height was measured in arm-spans, not paces.' }),
              mk('True length:', s.tL, { v: s.eL, code: 'formula', hint: 'Use her <b>true</b> pace, ' + s.pt.toFixed(2) + ' m.' }), mk('True width:', s.tW), mk('True height:', s.tH)],
              'Estimates: ' + t(s.nL + '(' + s.p.toFixed(2) + ')=' + num(s.eL) + ',\\ ' + s.nW + '(' + s.p.toFixed(2) + ')=' + num(s.eW) + ',\\ ' + s.nH + '(' + s.sp.toFixed(2) + ')=' + num(s.eH)) + ' m.<br>True: ' + t(s.nL + '(' + s.pt.toFixed(2) + ')=' + num(s.tL) + ',\\ ' + s.nW + '(' + s.pt.toFixed(2) + ')=' + num(s.tW) + ',\\ ' + s.nH + '(' + s.st.toFixed(2) + ')=' + num(s.tH)) + ' m.', ['Count × referent length — the assumed one for the estimate, the true one for the truth.'], 'paced dimensions');
          } },
          { id: 'e20a2', sub: 'a-ii', level: 'EMG', outcome: 'M1', make: function (r, s) {
            return fields('The estimates are ' + t(num(s.eL) + ',\\ ' + num(s.eW) + ',\\ ' + num(s.eH)) + ' m and the true dimensions ' + t(num(s.tL) + ',\\ ' + num(s.tW) + ',\\ ' + num(s.tH)) + ' m. Give the percent error of each, to the nearest hundredth of a percent.', [
              { label: 'Length:', after: '%', x: s.peP, dp: 2, alts: [{ v: (s.eL - s.tL) / s.eL * 100, code: 'pct-base', hint: 'Divide by the <b>true</b> value.' }] },
              { label: 'Width:', after: '%', x: s.peP, dp: 2, alts: [{ v: (s.eW - s.tW) / s.eW * 100, code: 'pct-base', hint: 'Divide by the true value.' }] },
              { label: 'Height:', after: '%', x: s.peS, dp: 2, alts: [{ v: (s.eH - s.tH) / s.eH * 100, code: 'pct-base', hint: 'Divide by the true value.' }] }],
              'Length: ' + t('\\tfrac{' + num(s.eL) + '-' + num(s.tL) + '}{' + num(s.tL) + '}\\times 100=' + dots(s.peP, 5)) + ' ≈ ' + fx(s.peP, 2) + '%. Width: the same referent, so the same ' + fx(s.peP, 2) + '% (the count cancels). Height: ' + t('\\tfrac{' + num(s.eH) + '-' + num(s.tH) + '}{' + num(s.tH) + '}\\times 100') + ' ≈ ' + fx(s.peS, 2) + '%.', ['Percent error = (estimate − true) ÷ true × 100.'], 'paced percent errors');
          } },
          { id: 'e20b', level: 'PRG', make: function (r, s) {
            return fields('Find the estimated volume and the true volume, each to the nearest thousandth of a cubic metre, and the percent error of the volume, to the nearest hundredth of a percent. (Estimates ' + t(num(s.eL) + '\\times ' + num(s.eW) + '\\times ' + num(s.eH)) + '; true ' + t(num(s.tL) + '\\times ' + num(s.tW) + '\\times ' + num(s.tH)) + ', in m.)', [
              { label: 'Estimated:', after: 'm³', x: s.Ve, dp: 3, exact: true, alts: [] },
              { label: 'True:', after: 'm³', x: s.Vt, dp: 3, alts: [] },
              { label: 'Percent error:', after: '%', x: s.pv, dp: 2, alts: [{ v: 2 * s.peP + s.peS, code: 'add-errors', hint: 'The three errors don’t add: compare the two volumes directly.' }, { v: (s.Ve - s.Vt) / s.Ve * 100, code: 'pct-base', hint: 'Divide by the true volume.' }] }],
              t('V_{\\text{est}}=' + num(s.Ve)) + ' m³, ' + t('V_{\\text{true}}=' + num(rnd(s.Vt, 6))) + ' m³. ' + t('\\tfrac{' + num(s.Ve) + '-' + num(rnd(s.Vt, 6)) + '}{' + num(rnd(s.Vt, 6)) + '}\\times 100=' + dots(s.pv, 5)) + ' ≈ ' + fx(s.pv, 2) + '%.', ['Volume = length × width × height, for each set.'], 'container volumes');
          } },
          { id: 'e20c', level: 'PRG', make: function (r, s) {
            var prod = (s.p / s.pt) * (s.p / s.pt) * (s.sp / s.st), sum = 2 * s.peP + s.peS;
            return mc(r, 'The paced length and width are each ' + fx(s.peP, 2) + '% too big and the height ' + fx(s.peS, 2) + '% too big; the volume came out ' + fx(s.pv, 2) + '% too big. Which explains the volume’s error?', [
              { html: 'The volume’s error factor is the <b>product</b> of the three linear factors: ' + t('(' + dots(s.p / s.pt, 4) + ')^{2}(' + dots(s.sp / s.st, 4) + ')=' + fx(prod, 4)) + ' — a ' + t('k^{2}m') + ' pattern, not a clean ' + t('k^{3}') + ', because two different referents were used.', right: true },
              { html: 'The volume’s error is the <b>sum</b> of the three errors, ' + fx(sum, 2) + '%.', code: 'add-errors', why: 'The sum is ' + fx(sum, 2) + '%, not ' + fx(s.pv, 2) + '%. Errors in a product multiply.' },
              { html: 'The volume’s error is the pace error cubed, ' + t('(' + dots(s.p / s.pt, 4) + ')^{3}') + '.', code: 'scale-k', why: 'The height used a different referent (the span), so it isn’t a clean ' + t('k^{3}') + '.' },
              { html: 'The volume’s error is three times the average error.', code: 'add-errors', why: 'That’s just the sum again. The factors multiply.' }],
              t('\\tfrac{' + s.p.toFixed(2) + '}{' + s.pt.toFixed(2) + '}\\times\\tfrac{' + s.p.toFixed(2) + '}{' + s.pt.toFixed(2) + '}\\times\\tfrac{' + s.sp.toFixed(2) + '}{' + s.st.toFixed(2) + '}=' + dots(prod, 6)) + ' = ' + t('V_{\\text{est}}\\div V_{\\text{true}}') + '. The sum ' + fx(sum, 2) + '% is not ' + fx(s.pv, 2) + '%: errors in a product multiply.', ['Divide the estimated volume by the true volume and compare with the three linear factors.'], 'error factors multiply');
          } },
          { id: 'e20d', level: 'EMG', outcome: 'M2', make: function (r, s) {
            var L = s.Vt * 1000;
            return B.sci('The container’s true volume is ' + t(num(rnd(s.Vt, 6)) + '\\text{ m}^{3}') + '. Give its true capacity in litres, in scientific notation to five significant figures.', L, { sig: 5, diag: function (v) { if (Math.abs(v - s.Vt * 1e6) / (s.Vt * 1e6) < 1e-3) return { code: 'units', hint: 'That’s cm³ (or mL). Litres: ' + t('1\\text{ m}^{3}=1000\\text{ L}') + '.' }; return null; } },
              t(num(rnd(s.Vt, 6)) + '\\times 1000=' + F(String(rnd(L, 3))) + '\\text{ L}=' + K.sciTex(L, 5) + '\\text{ L}') + '. Litres keep the number a size a person can picture; cm³ would give an eight-figure number for a measurement only good to about ' + fx(s.pv, 0) + '%.', ['1 m³ = 1000 L, then write it as ' + t('a\\times 10^{n}') + ' with five significant digits.'], 'container litres sci');
          } },
          { id: 'e20e', level: 'EMG', outcome: 'M1', make: function (r, s) {
            return B.grid('The paced length is ' + t(num(s.eL)) + ' m; the true length is ' + t(num(s.tL)) + ' m. For each job, is the paced estimate fit for purpose?', [{ id: 'pal', html: '(i) roughly how many pallets will fit' }, { id: 'beam', html: '(ii) whether a beam ' + t(s.beam.toFixed(2) + '\\text{ m}') + ' long will go in' }],
              [{ id: 'ok', html: 'Paced estimate is fit for purpose' }, { id: 'tape', html: 'Measure: tape measure, to the nearest mm' }], { pal: 'ok', beam: 'tape' },
              { why: function (row) { return row === 'pal' ? { code: 'tolerance', hint: '“Roughly how many” is a ballpark: an error of a few percent changes the count by only one or two.' } : { code: 'tolerance', hint: 'The beam clears by only ' + t(fx(s.tL - s.beam, 2)) + ' m, but the estimate is off by ' + t(fx(s.eL - s.tL, 2)) + ' m. You need a measurement.' }; } },
              '(i) <b>Fit for a ballpark</b>: the count is only a rough number. (ii) <b>Not fit</b>: the true clearance is ' + t(fx(s.tL - s.beam, 2)) + ' m but the estimate is wrong by ' + t(fx(s.eL - s.tL, 2)) + ' m. Use a steel tape (or laser measure), reading to the nearest millimetre.', ['Compare each job’s margin with the size of the estimate’s error.'], 'paced estimate fit for purpose');
          } }] }
    ]
  });
})(window);
