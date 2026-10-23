/* Math 10C · Unit 10 · Lesson 1 — Systems of Measurement, Referents, and Measuring Instruments (M1)
 * Assignment questions 1–18 (u10_L01.tex) and the Lesson 1 Extra Practice (u10_EP01.tex, questions 1–24).
 * Every part is a generator: it keeps the idea and difficulty of the booklet question (the booklet's numbers are one
 * of the possible values) and changes the numbers, the objects or the order. Levels: LIM BEG EMG PRG ADV MAS.
 *
 * Instrument drawings are local static SVGs that follow the booklet's own true geometry (\vernierScale, \microScale,
 * ported from the teaching-site lesson lessons/js/lessons/u10l1.js), so every version shows a new, honest reading:
 *   vernSvg(M, N)       vernier caliper: main scale (mm) + 20-division vernier, reading M + 0.05N mm
 *   micSvg(h, f)        micrometer: sleeve marked every 0.5 mm (halves below the index line) + 50-division thimble,
 *                       reading 0.5h + 0.01f mm
 *   cmRulerSvg(o)       centimetre ruler (mm marks) with an object on it, optionally a zoomed view of one end
 *   inTapeSvg(o)        inch tape / ruler (whole, half and quarter inches) with the end of an object
 *   heightSvg(H)        a vertical height chart in inches with a head at the reading
 * Outcome M1 throughout; conversion-only parts (extra practice 12–13) are M2. This lesson has no micro/mega
 * prefix items (the EXT extension lives in Lesson 2). */
(function (root) {
  'use strict';
  var HW = root.HW, F = HW.fmt, K = HW.kit, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form, P = K.P;
  var INK = '#2b3340', GREY = '#6a7182', RED = '#b3261e', BLUE = '#1f5fa8', TEAL = '#13807a', AMBER = '#a86a00';

  /* ---------------- small helpers ---------------- */
  function rnd(x, dp) { return K.roundTo(x, dp); }
  function fx(x, dp) { return rnd(x, dp).toFixed(dp); }
  function FX(x, dp) { return F(fx(x, dp)); }               // fixed decimals, thin spaces for ≥ 1000
  function N(x) { return F(String(rnd(x, 6))); }           // a number as LaTeX, no trailing zeros
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function lc(s) { return s.charAt(0).toLowerCase() + s.slice(1); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function near(a, b) { return Math.abs(a - b) < 1e-7 * Math.max(1, Math.abs(a), Math.abs(b)); }
  function decs(resp) { var s = HW.parse.plain(resp).replace(/\s/g, ''); return (s.split('.')[1] || '').length; }
  function num(resp) { var p = HW.parse.number(resp); return p.ok ? p.value : null; }
  function pct(est, meas) { return Math.abs(est - meas) / meas * 100; }
  function unitAlts(x, unit) { // typical unit slips for a length answer
    var out = [];
    if (unit === 'm') out.push({ v: x * 100, code: 'unit-slip', hint: 'That looks like the length in <b>centimetres</b>. Divide by ' + t('100') + ' to get metres.' });
    if (unit === 'cm') { out.push({ v: x / 100, code: 'unit-slip', hint: 'That looks like the length in <b>metres</b>. The box asks for centimetres (' + t('1\\text{ m}=100\\text{ cm}') + ').' }); out.push({ v: x * 10, code: 'unit-slip', hint: 'That looks like the length in <b>millimetres</b>. The box asks for centimetres (' + t('1\\text{ cm}=10\\text{ mm}') + ').' }); }
    if (unit === 'mm') out.push({ v: x / 10, code: 'unit-slip', hint: 'That looks like the length in <b>centimetres</b>. The box asks for millimetres (' + t('1\\text{ cm}=10\\text{ mm}') + ').' });
    return out;
  }

  /* exact-value checker: any decimal equal to x. A value that is only a rounding of x gets a nudge. */
  function exactCk(x, alts, opt) {
    opt = opt || {};
    return function (resp) {
      var p = HW.parse.number(resp);
      if (!p.ok) return form(p.code === 'empty' ? 'empty' : 'notnumber', p.code === 'empty' ? 'Type your answer first.' : 'Enter a single number (the unit is already written after the box).');
      var v = p.value;
      if (near(v, x)) { if (opt.dp != null && decs(resp) < opt.dp) return form('precision', opt.precisionHint || ('Right value! Write it to ' + opt.dp + ' decimal places: ' + t(fx(x, opt.dp)) + '.')); return ok(); }
      for (var i = 0; i < (alts || []).length; i++) if (near(v, alts[i].v)) return wrong(alts[i].code || 'diag', alts[i].hint);
      if (!opt.noRoundNudge && x !== 0 && Math.abs(v - x) <= 0.006 * Math.abs(x) && decs(resp) < String(x).replace(/^[^.]*\.?/, '').length) return form('rounded', 'Close — but this value comes out exactly. Give it without rounding.');
      return wrong('value', null);
    };
  }
  /* rounded-value checker: K.near, but a whole-number response equal to the rounded value (4 for 4.0) is accepted */
  function nearCk(x, dp, alts) {
    var c = K.near(x, dp, { alts: alts || [] });
    var f = Math.pow(10, dp), half = Math.abs(x * f - Math.floor(x * f) - 0.5) < 1e-6; // an exact half: either rounding is accepted
    return function (resp) { var v = num(resp); if (v != null && (near(v, rnd(x, dp)) || (half && near(v, Math.floor(x * f) / f)))) return ok(); return c(resp); };
  }
  /* one number box */
  function numPart(prompt, x, ck, unit, sol, hints, text, dp) {
    var key = dp != null ? fx(x, dp) : String(rnd(x, 6));
    return { prompt: prompt, input: { type: 'number', after: unit || undefined }, check: ck, key: key, answer: t(F(key)) + (unit ? ' ' + esc(unit) : ''), solution: sol, hints: hints || [], text: text };
  }
  function exactPart(prompt, x, unit, alts, sol, hints, text, opt) { opt = opt || {}; var p = numPart(prompt, x, exactCk(x, alts, opt), unit, sol, hints, text, opt.dp); p.bad = (alts || []).map(function (a) { return String(rnd(a.v, 6)); }); return p; }
  function nearPart(prompt, x, dp, unit, alts, sol, hints, text) { var p = numPart(prompt, x, nearCk(x, dp, alts), unit, sol, hints, text, dp); p.bad = (alts || []).map(function (a) { return fx(a.v, dp); }).filter(function (b) { return p.check(b).v !== 'correct'; }); return p; }
  /* several number boxes: specs [{ label, after, x, dp, alts, exact }] */
  function fieldsPart(prompt, specs, sol, hints, text) {
    var fields = specs.map(function (s) { return { label: s.label, name: s.name || s.label, after: s.after }; });
    var checks = specs.map(function (s) { return s.check || (s.exact ? exactCk(s.x, s.alts, { dp: s.dp }) : nearCk(s.x, s.dp, s.alts)); });
    var keys = specs.map(function (s) { return s.key != null ? s.key : s.dp != null ? fx(s.x, s.dp) : String(rnd(s.x, 6)); });
    var ans = specs.map(function (s, i) { return s.label + ' ' + t(F(keys[i])) + (s.after ? ' ' + esc(s.after) : ''); }).join('<br>');
    var p = K.P.fields(prompt, fields, checks, keys, ans, sol, hints, text);
    var bad = [];
    specs.forEach(function (s, i) { (s.alts || []).slice(0, 2).forEach(function (a) { if (s.check) return; var dp = s.exact ? 6 : s.dp; if (Math.abs(rnd(a.v, dp) - rnd(s.x, dp)) < 1e-9) return; var b = keys.slice(); b[i] = s.exact ? String(rnd(a.v, 6)) : fx(a.v, s.dp); bad.push(b); }); });
    p.bad = bad.filter(function (b) { return p.check(b).v !== 'correct'; });
    return p;
  }
  function mc(r, prompt, opts, sol, hints, text, keepOrder) { return P.mc(r, prompt, opts, sol, hints, text, keepOrder); }
  function mc2(r, prompt, opts, sol, hints, text) { var p = P.mc(r, prompt, opts, sol, hints, text); p.tries = 1; p.input.columns = 2; return p; }
  function named(p, rows, cols) { var nm = {}; cols.forEach(function (c) { nm[c.id] = c.name || c.html; }); p.answer = rows.map(function (rw) { return rw.html + ': <b>' + nm[p.key[rw.id]] + '</b>'; }).join('<br>'); return p; }
  function pickOther(r, arr, not) { return r.pick(arr.filter(function (x) { return not.indexOf(x) < 0; })); }

  /* ---------------- SVG drawing primitives ---------------- */
  function L(x1, y1, x2, y2, o) { o = o || {}; return '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" stroke="' + (o.c || INK) + '" stroke-width="' + (o.w || 1) + '"' + (o.dash ? ' stroke-dasharray="' + o.dash + '"' : '') + (o.cap ? ' stroke-linecap="' + o.cap + '"' : '') + '/>'; }
  function R(x, y, w, h, fill, o) { o = o || {}; return '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + Math.max(0, w).toFixed(1) + '" height="' + Math.max(0, h).toFixed(1) + '"' + (o.rx ? ' rx="' + o.rx + '"' : '') + ' fill="' + fill + '" stroke="' + (o.stroke || 'none') + '" stroke-width="' + (o.sw || 1) + '"/>'; }
  function TX(x, y, s, o) { o = o || {}; return '<text x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" font-size="' + (o.size || 13) + '" text-anchor="' + (o.anchor || 'middle') + '" dominant-baseline="central" fill="' + (o.c || INK) + '"' + (o.weight ? ' font-weight="' + o.weight + '"' : '') + (o.italic ? ' font-style="italic"' : '') + '>' + esc(s) + '</text>'; }
  function svgFit(W, H, body, aria, maxW) { return '<svg class="fig-svg" viewBox="0 0 ' + Math.ceil(W) + ' ' + Math.ceil(H) + '" width="100%" style="max-width:' + Math.ceil(maxW || W) + 'px" role="img" aria-label="' + esc(aria) + '">' + body + '</svg>'; }
  /* a figure drawn at a fixed pixel size (fine scales must not shrink); scrolls sideways on a narrow screen */
  function svgScroll(W, H, body, aria, minW) {
    return '<div class="grid-scroll" style="margin:8px 0"><svg viewBox="0 0 ' + Math.ceil(W) + ' ' + Math.ceil(H) + '" style="display:block;width:100%;min-width:' + Math.ceil(minW || W) + 'px;max-width:' + Math.ceil(W * 1.25) + 'px;height:auto" role="img" aria-label="' + esc(aria) + '">' + body + '</svg></div>' +
      '<div style="font-size:12px;color:' + GREY + ';margin:-2px 0 6px">On a small screen, swipe the scale sideways to see all of it.</div>';
  }

  /* ---------------- vernier caliper (booklet \vernierScale{M}{N}: 20 divisions of 0.95 mm) ---------------- */
  function vernSvg(M, Nf) {
    var u = 32, k = u / 0.74, lo = M - 3, hi = M + 21, padL = 20, W = (hi - lo) * u + 2 * padL;
    var X = function (m) { return padL + (m - lo) * u; };
    var top = 26, y0 = top + 1.05 * k, H = y0 + 1.0 * k + 30, p = M + 0.05 * Nf, xz = X(p), xe = xz + 19 * u, s = '';
    s += R(4, top, W - 8, 1.05 * k, '#f2f3f5', { stroke: '#b9bec6' });
    s += TX(padL, 12, 'Main scale (mm)', { weight: 700, size: 14, anchor: 'start' });
    for (var m = lo; m <= hi; m++) {
      var big = m % 5 === 0, x = X(m);
      s += L(x, y0, x, y0 - (big ? 0.55 : 0.32) * k, { w: big ? 1.5 : 1 });
      if (big) s += TX(x, y0 - 0.55 * k - 9, String(m), { size: 14 });
    }
    s += R(xz - 1.15 * k, y0, (xe - xz) + 1.7 * k, 1.0 * k, '#dcdfe4', { stroke: '#a3a9b2' });
    for (var n = 0; n <= 20; n++) {
      var xn = xz + 0.95 * n * u, bg = n % 5 === 0;
      s += L(xn, y0, xn, y0 + (bg ? 0.55 : 0.32) * k, { w: n === 0 ? 2.2 : bg ? 1.5 : 1, c: n === 0 ? RED : INK });
      if (bg) s += TX(xn, y0 + 0.55 * k + 9, String(n), { size: 14, c: n === 0 ? RED : INK });
    }
    s += L(4, y0, W - 4, y0, { w: 0.8, c: '#7d848e' });
    s += TX(xz - 7, y0 + 0.78 * k, 'index', { anchor: 'end', size: 13, c: RED });
    s += TX(Math.max(padL, xz - 1.15 * k + 4), H - 10, 'Vernier scale: 0.05 mm per division', { weight: 700, size: 14, anchor: 'start' });
    return svgScroll(W, H, s, 'vernier caliper scale', W);
  }
  /* ---------------- micrometer (booklet \microScale{h}{f}: reading 0.5h + 0.01f mm) ---------------- */
  function micSvg(h, f, opt) {
    opt = opt || {};
    var k = 50, R0 = 0.5 * h + 0.01 * f, mlo = Math.max(0, Math.floor(R0 + 1e-9) - 6), mE = (R0 - mlo) * 0.55;
    var X = function (x) { return (x + 0.55) * k; }, Y = function (y) { return (1.45 - y) * k; };
    var W = X(mE + 3.05) + 4, H = Y(-1.35) + (opt.noCaption ? 8 : 52), s = '';
    s += R(X(-0.45), Y(0.86), X(mE) - X(-0.45), 1.48 * k, '#f2f3f5', { stroke: '#b9bec6' });
    for (var kk = 2 * mlo; kk <= h; kk++) {
      var x = X((kk * 0.5 - mlo) * 0.55);
      if (kk % 2) s += L(x, Y(-0.03), x, Y(-0.26), { w: 1.2 });
      else if ((kk / 2) % 5 === 0) { s += L(x, Y(0.03), x, Y(0.48), { w: 1.8 }); s += TX(x, Y(0.48) - 10, String(kk / 2), { size: 16 }); }
      else s += L(x, Y(0.03), x, Y(0.30), { w: 1.2 });
    }
    s += L(X(-0.38), Y(0), X(mE), Y(0), { w: 1.8 });
    s += R(X(mE), Y(1.35), 2.95 * k, 2.7 * k, '#d3d7dd', { stroke: '#a3a9b2' });
    s += L(X(mE), Y(1.35), X(mE), Y(-1.35), { w: 2 });
    for (var d = -6; d <= 6; d++) {
      var y = Y(-d * 0.22), v = ((f + d) % 50 + 50) % 50, maj = v % 5 === 0;
      s += L(X(mE + 0.12), y, X(mE + (maj ? 0.72 : 0.5)), y, { w: maj ? 1.6 : 1.1 });
      if (maj) s += TX(X(mE + 0.78), y, String(v), { anchor: 'start', size: 16 });
    }
    s += L(X(mE + 1.55), Y(0), X(mE + 3.0), Y(0), { c: RED, w: 1.6, dash: '5 4' });
    s += TX(X(mE + 2.95), Y(0) - 11, 'index line', { anchor: 'end', size: 14, c: RED });
    if (!opt.noCaption) { s += TX(W / 2, Y(-1.35) + 17, 'Sleeve: a mark every 0.5 mm', { weight: 700, size: 15 }); s += TX(W / 2, Y(-1.35) + 38, 'Thimble: 0.01 mm per division', { weight: 700, size: 15 }); }
    return svgFit(W, H, s, 'micrometer sleeve and thimble', Math.max(300, W));
  }
  /* ---------------- centimetre ruler ---------------- */
  // o: { a, b (object ends, cm), from, to (ruler window, cm), obj: 'screw'|'bar'|'case'…, zoom: true (long object: cm ticks + a zoomed view of the right end) }
  function objShape(x1, x2, y, hh, kind) {
    var w = x2 - x1, s = '';
    if (kind === 'screw') {
      s += R(x1, y + hh * 0.05, Math.min(10, w * 0.12), hh * 0.9, '#c9ced6', { stroke: INK, sw: 1.3, rx: 2 });
      s += R(x1 + Math.min(10, w * 0.12), y + hh * 0.3, w - Math.min(10, w * 0.12) - 6, hh * 0.4, '#dde1e7', { stroke: INK, sw: 1.3 });
      s += '<polygon points="' + (x2 - 6).toFixed(1) + ',' + (y + hh * 0.3).toFixed(1) + ' ' + x2.toFixed(1) + ',' + (y + hh * 0.5).toFixed(1) + ' ' + (x2 - 6).toFixed(1) + ',' + (y + hh * 0.7).toFixed(1) + '" fill="#dde1e7" stroke="' + INK + '" stroke-width="1.3"/>';
      for (var i = x1 + 16; i < x2 - 8; i += 6) s += L(i, y + hh * 0.3, i + 3, y + hh * 0.7, { w: 0.8 });
    } else if (kind === 'crayon') {
      s += R(x1, y + hh * 0.15, w - 10, hh * 0.7, '#f3c66b', { stroke: INK, sw: 1.3, rx: 2 });
      s += '<polygon points="' + (x2 - 10).toFixed(1) + ',' + (y + hh * 0.15).toFixed(1) + ' ' + x2.toFixed(1) + ',' + (y + hh * 0.5).toFixed(1) + ' ' + (x2 - 10).toFixed(1) + ',' + (y + hh * 0.85).toFixed(1) + '" fill="#f3c66b" stroke="' + INK + '" stroke-width="1.3"/>';
    } else s += R(x1, y, w, hh, kind === 'case' ? '#cfe3f7' : '#d9ece9', { stroke: INK, sw: 1.4, rx: kind === 'case' ? 6 : 3 });
    return s;
  }
  function cmTicks(x0, y, pxcm, from, to, mm, labEvery) {
    var s = '';
    for (var i = Math.round(from * 10); i <= Math.round(to * 10); i++) {
      var x = x0 + (i / 10 - from) * pxcm, isCm = i % 10 === 0, isHalf = i % 5 === 0;
      if (!mm && !isHalf) continue;
      s += L(x, y, x, y + (isCm ? 20 : isHalf ? 13 : 8), { w: isCm ? 1.4 : 1 });
      if (isCm && (i / 10) % (labEvery || 1) === 0) s += TX(x, y + 31, String(i / 10), { size: 13 });
    }
    return s;
  }
  function cmRulerSvg(o) {
    var from = o.from, to = o.to, W = 360, pad = 16, px = (W - 2 * pad) / (to - from), X = function (c) { return pad + (c - from) * px; };
    var oy = 14, oh = 26, ry = oy + oh + 6, s = '';
    s += objShape(X(o.a), X(o.b), oy, oh, o.obj);
    s += R(X(from) - 10, ry, (to - from) * px + 20, 44, '#fff8dc', { stroke: '#b8a46a', sw: 1.3, rx: 3 });
    s += cmTicks(X(from), ry, px, from, to, !o.zoom, o.zoom ? 5 : 1);
    [o.a, o.b].forEach(function (c) { if (c > from + 1e-9 || !o.zoom) s += L(X(c), oy - 4, X(c), ry + 22, { c: RED, w: 1.3, dash: '4 3' }); });
    var H = ry + 50;
    if (o.zoom) {
      var z0 = Math.floor(o.b) - 1, z1 = z0 + 3, zx = 30, zw = W - 60, zpx = zw / 3, zy = H + 26, ZX = function (c) { return zx + (c - z0) * zpx; };
      s += '<polygon points="' + X(z0).toFixed(1) + ',' + (ry + 44) + ' ' + X(z1).toFixed(1) + ',' + (ry + 44) + ' ' + (zx + zw).toFixed(1) + ',' + (zy - 4) + ' ' + zx + ',' + (zy - 4) + '" fill="#8a909a" fill-opacity="0.12"/>';
      s += R(X(z0), ry - 1, X(z1) - X(z0), 46, 'none', { stroke: GREY, sw: 1.2 });
      s += R(zx - 8, zy - 4, zw + 16, 92, '#ffffff', { stroke: GREY, sw: 1.2, rx: 8 });
      s += objShape(zx - 8, ZX(o.b), zy + 4, 24, o.obj);
      s += R(zx - 4, zy + 32, zw + 8, 44, '#fff8dc', { stroke: '#b8a46a', sw: 1.2 });
      s += cmTicks(zx, zy + 32, zpx, z0, z1, true, 1);
      s += L(ZX(o.b), zy, ZX(o.b), zy + 54, { c: RED, w: 1.3, dash: '4 3' });
      s += TX(zx + zw + 4, zy + 82, 'zoomed in', { size: 11, c: GREY, anchor: 'end' });
      H = zy + 96;
    }
    return svgFit(W, H, s, 'object on a centimetre ruler', W * 1.35);
  }
  /* ---------------- inch tape / ruler (horizontal) ---------------- */
  // o: { from, to (window, inches), end (object's end, inches), start (object's start, or null if it starts left of the window), obj }
  function inTapeSvg(o) {
    var W = 360, pad = 16, px = (W - 2 * pad) / (o.to - o.from), X = function (v) { return pad + (v - o.from) * px; };
    var oy = 12, oh = 28, ry = oy + oh + 6, s = '', x1 = o.start == null ? 0 : X(o.start);
    s += objShape(x1, X(o.end), oy, oh, o.obj || 'bar');
    s += R(4, ry, W - 8, 46, o.tape ? '#f6d55c' : '#eef4ff', { stroke: o.tape ? '#a88b1d' : '#7f9cc9', sw: 1.3, rx: 3 });
    for (var i = Math.ceil(o.from * 4); i <= Math.floor(o.to * 4); i++) {
      var x = X(i / 4), whole = i % 4 === 0, half = i % 2 === 0;
      s += L(x, ry, x, ry + (whole ? 22 : half ? 15 : 9), { w: whole ? 1.5 : 1 });
      if (whole) s += TX(x, ry + 34, String(i / 4), { size: 13, weight: (i / 4) % 12 === 0 ? 700 : null, c: (i / 4) % 12 === 0 ? RED : INK });
    }
    s += L(X(o.end), oy - 4, X(o.end), ry + 24, { c: RED, w: 1.3, dash: '4 3' });
    return svgFit(W, ry + 52, s, 'inch tape measure', W * 1.35);
  }
  /* ---------------- vertical height chart (inches) ---------------- */
  function heightSvg(Hin) {
    var lo = Math.floor(Hin) - 7, hi = lo + 10, pxi = 26, top = 16, W = 250, Y = function (v) { return top + (hi - v) * pxi; }, s = '';
    var cx = 70, yh = Y(Hin);
    s += R(130, top - 8, 52, (hi - lo) * pxi + 16, '#f6d55c', { stroke: '#a88b1d', sw: 1.3, rx: 3 });
    for (var i = lo * 4; i <= hi * 4; i++) {
      var y = Y(i / 4), whole = i % 4 === 0, half = i % 2 === 0;
      s += L(130, y, 130 + (whole ? 22 : half ? 15 : 9), y, { w: whole ? 1.5 : 1 });
      if (whole) { var v = i / 4; s += TX(160, y, String(v), { size: 12, anchor: 'start', weight: v % 12 === 0 ? 700 : null, c: v % 12 === 0 ? RED : INK }); if (v % 12 === 0) s += TX(186, y, '= ' + (v / 12) + ' ft', { size: 12, anchor: 'start', c: RED }); }
    }
    s += '<circle cx="' + cx + '" cy="' + (yh + 26) + '" r="26" fill="#f3d2b5" stroke="' + INK + '" stroke-width="1.6"/>';
    s += '<path d="M' + (cx - 26) + ' ' + (yh + 18) + ' Q' + cx + ' ' + (yh - 8) + ' ' + (cx + 26) + ' ' + (yh + 18) + '" fill="#5b4636" stroke="' + INK + '" stroke-width="1.2"/>';
    s += '<path d="M' + (cx - 48) + ' ' + (yh + 110) + ' Q' + (cx - 44) + ' ' + (yh + 62) + ' ' + cx + ' ' + (yh + 60) + ' Q' + (cx + 44) + ' ' + (yh + 62) + ' ' + (cx + 48) + ' ' + (yh + 110) + '" fill="#9cc3e6" stroke="' + INK + '" stroke-width="1.4"/>';
    s += R(cx - 30, yh - 5, 100, 5, '#7a5a3a', { stroke: INK, sw: 1 });
    s += TX(cx - 34, yh - 14, 'book on head', { size: 11, c: GREY, anchor: 'start' });
    s += TX(156, top + (hi - lo) * pxi + 20, 'inches', { size: 11, c: GREY });
    return svgFit(W, top + (hi - lo) * pxi + 30, s, 'height chart in inches', W);
  }

  /* ---------------- reading checkers for the instruments ---------------- */
  function vernAlts(M, Nf) {
    var x = M + 0.05 * Nf, out = [
      { v: M + Nf, code: 'vern-aligned', hint: 'You read the main-scale mark where the vernier line meets it. The <b>coarse reading</b> comes from the vernier’s own <b>0</b> mark (the red index): the last whole millimetre it has passed.' },
      { v: M + Nf + 0.05 * Nf, code: 'vern-aligned', hint: 'Your coarse reading came from the main-scale mark that the vernier line meets. Take the coarse reading at the vernier’s <b>0</b> (the red index) instead.' },
      { v: M + 0.1 * Nf, code: 'vern-tenths', hint: 'Each vernier division is worth ' + t('0.05') + ' mm, not ' + t('0.1') + ' mm: fine reading ' + t('=\\text{division number}\\times0.05') + '.' },
      { v: M + 0.01 * Nf, code: 'vern-tenths', hint: 'Each vernier division is worth ' + t('0.05') + ' mm, not ' + t('0.01') + ' mm: fine reading ' + t('=\\text{division number}\\times0.05') + '.' },
      { v: M, code: 'no-fine', hint: 'That is only the <b>coarse</b> reading. Add the fine reading: find the vernier mark that lines up with a main-scale mark.' },
      { v: 0.05 * Nf, code: 'no-coarse', hint: 'That is only the <b>fine</b> reading. Add the coarse reading from the main scale (the last whole mm before the index).' },
      { v: M + 1 + 0.05 * Nf, code: 'vern-coarse', hint: 'Check the coarse reading: it is the last whole-millimetre mark <b>at or to the left of</b> the index, not the next one.' },
      { v: M - 1 + 0.05 * Nf, code: 'vern-coarse', hint: 'Check the coarse reading: count the millimetre marks from the numbered one up to the index again.' },
      { v: M + 0.05 * (Nf + 1), code: 'vern-neighbour', hint: 'Very close — look again for the vernier mark that lines up <b>best</b>. Compare it with the marks on either side.' },
      { v: M + 0.05 * (Nf - 1), code: 'vern-neighbour', hint: 'Very close — look again for the vernier mark that lines up <b>best</b>. Compare it with the marks on either side.' },
      { v: x / 10, code: 'unit-slip', hint: 'That looks like centimetres. The reading is asked for in <b>millimetres</b>.' }];
    return out.filter(function (a) { return !near(a.v, x); });
  }
  function micAlts(h, f) {
    var c = 0.5 * h, x = c + 0.01 * f, half = h % 2 === 1, out = [];
    if (half) out.push({ v: x - 0.5, code: 'mic-half', hint: 'Look <b>below</b> the index line: a half-millimetre mark is showing past the last whole millimetre, so the coarse reading ends in ' + t('.5') + '.' });
    else out.push({ v: x + 0.5, code: 'mic-half', hint: 'No half-millimetre mark is showing past the last whole millimetre (the half marks are the short ones <b>below</b> the line), so don’t add ' + t('0.5') + ' mm.' });
    if (half) out.push({ v: x + 0.5, code: 'mic-hidden', hint: 'The thimble’s edge hasn’t uncovered that mark yet. Use the last sleeve mark that is fully visible.' });
    out.push({ v: c + 0.1 * f, code: 'mic-tenths', hint: 'Each thimble division is worth ' + t('0.01') + ' mm: fine reading ' + t('=\\text{division}\\times0.01') + '.' });
    out.push({ v: c, code: 'no-fine', hint: 'That is only the <b>coarse</b> (sleeve) reading. Add the fine reading from the thimble mark on the index line.' });
    out.push({ v: 0.01 * f, code: 'no-coarse', hint: 'That is only the <b>fine</b> (thimble) reading. Add the coarse reading from the sleeve.' });
    out.push({ v: x + 1, code: 'mic-coarse', hint: 'Check the whole millimetres on the sleeve: count the marks above the line from the numbered one, and stop at the last one the thimble has uncovered.' });
    out.push({ v: x - 1, code: 'mic-coarse', hint: 'Check the whole millimetres on the sleeve: count the marks above the line from the numbered one again.' });
    out.push({ v: x + 0.01, code: 'mic-neighbour', hint: 'Very close — read the thimble mark that sits exactly <b>on</b> the index line, not the one beside it.' });
    out.push({ v: x - 0.01, code: 'mic-neighbour', hint: 'Very close — read the thimble mark that sits exactly <b>on</b> the index line, not the one beside it.' });
    var f5 = 5 * Math.round(f / 5) % 50; if (f5 !== f) out.push({ v: c + 0.01 * f5, code: 'mic-label', hint: 'You read the nearest <b>numbered</b> thimble mark. Count the small divisions from it to the mark on the index line.' });
    out.push({ v: x / 10, code: 'unit-slip', hint: 'That looks like centimetres. The reading is asked for in <b>millimetres</b>.' });
    return out.filter(function (a) { return !near(a.v, x); });
  }
  function vernPart(prompt, M, Nf, text) {
    var x = M + 0.05 * Nf, alts = vernAlts(M, Nf);
    var p = exactPart(prompt + vernSvg(M, Nf), x, 'mm', alts,
      '<b>Coarse</b> (main scale): the index — the vernier’s 0 — has passed the ' + t(M) + ' mm mark, so the coarse reading is ' + t(M + '\\text{ mm}') + '.<br><b>Fine</b> (vernier): mark ' + t(Nf) + ' lines up with a main-scale mark, so ' + t(Nf + '\\times0.05=' + fx(0.05 * Nf, 2) + '\\text{ mm}') + '.<br>' + t(M + '+' + fx(0.05 * Nf, 2) + '=' + fx(x, 2)) + ' mm, written to two decimals because the caliper reads to ' + t('0.05') + ' mm.',
      ['Coarse reading: the last whole millimetre on the main scale <b>at or before</b> the vernier’s 0 (the red index).', 'Fine reading: find the one vernier mark that lines up exactly with a main-scale mark; multiply its number by ' + t('0.05') + ' mm.'],
      text || ('vernier ' + fx(x, 2)), { dp: 2, precisionHint: 'Right value! A caliper reads to ' + t('0.05') + ' mm, so state the reading with two decimals: ' + t(fx(x, 2)) + ' mm.' });
    p.good = [fx(x, 2)];
    return p;
  }
  function micPart(prompt, h, f, text) {
    var c = 0.5 * h, x = c + 0.01 * f, half = h % 2 === 1, alts = micAlts(h, f);
    var p = exactPart(prompt + micSvg(h, f), x, 'mm', alts,
      '<b>Coarse</b> (sleeve): the last mark the thimble has uncovered is ' + (half ? 'the half-millimetre mark below the line past ' + t(Math.floor(c)) + ', so ' + t(fx(c, 1) + '\\text{ mm}') : 'the whole-millimetre mark ' + t(c) + ' (no half mark is showing below the line), so ' + t(fx(c, 1) + '\\text{ mm}')) + '.<br><b>Fine</b> (thimble): the index line is on mark ' + t(f) + ', so ' + t(f + '\\times0.01=' + fx(0.01 * f, 2) + '\\text{ mm}') + '.<br>' + t(fx(c, 1) + '+' + fx(0.01 * f, 2) + '=' + fx(x, 2)) + ' mm.',
      ['Coarse reading: the last sleeve mark the thimble has uncovered — whole millimetres above the line, half millimetres below it.', 'Fine reading: the thimble number on the index line, times ' + t('0.01') + ' mm.'],
      text || ('micrometer ' + fx(x, 2)), { dp: 2, precisionHint: 'Right value! A micrometer reads to ' + t('0.01') + ' mm, so state the reading with two decimals: ' + t(fx(x, 2)) + ' mm.' });
    p.good = [fx(x, 2)];
    return p;
  }
  /* feet-and-inches answer (two boxes). total = inches; diag(totalTyped) -> {code, hint} */
  function ftInCk(total, diag) {
    return function (resp) {
      resp = resp || [];
      var a = num(resp[0]), b = num(resp[1]);
      if ((resp[0] == null || String(resp[0]).trim() === '') && (resp[1] == null || String(resp[1]).trim() === '')) return form('empty', 'Fill in the feet and the inches.');
      if (a == null || b == null) return form('blank', 'Put a whole number in each box (use ' + t('0') + ' if there are no feet or no inches).');
      var tot = 12 * a + b;
      if (near(tot, total)) { if (b >= 12) return form('in-over-12', 'Right length — but ' + t('12') + ' in make a foot, so carry: the inches box should be less than ' + t('12') + '.'); if (b < 0) return form('in-negative', 'Right length — write it with a positive number of inches.'); return ok(); }
      var h = diag ? diag(tot, a, b) : null; if (h) return wrong(h.code, h.hint);
      if (near(a, Math.floor(total / 12)) && !near(b, total % 12)) return wrong('inches', 'The feet are right; check the inches.');
      if (near(b, total % 12)) return wrong('feet', 'The inches are right; check the feet.');
      return wrong('value', null);
    };
  }
  function ftInTex(tot) { return t(Math.floor(tot / 12) + '\\text{ ft }' + (tot % 12) + '\\text{ in}'); }

  HW.addCodes({
    'unit-slip': 'Unit slip (cm / m / mm)', precision: 'Not written to the instrument’s precision', rounded: 'Rounded a value that is exact',
    'vern-aligned': 'Vernier: coarse reading taken where the lines meet, not at the index', 'vern-tenths': 'Vernier: used 0.1 or 0.01 mm per division instead of 0.05',
    'vern-coarse': 'Vernier: coarse (main-scale) reading off by 1 mm', 'vern-neighbour': 'Vernier: picked a neighbouring mark (best line-up misread)',
    'no-fine': 'Gave only the coarse reading', 'no-coarse': 'Gave only the fine reading',
    'mic-half': 'Micrometer: half-millimetre mark missed or added', 'mic-hidden': 'Micrometer: read a sleeve mark still under the thimble', 'mic-tenths': 'Micrometer: used 0.1 mm per thimble division',
    'mic-coarse': 'Micrometer: whole millimetres miscounted', 'mic-neighbour': 'Micrometer: thimble mark beside the index line', 'mic-label': 'Micrometer: read the nearest numbered thimble mark',
    'ruler-start': 'Ruler: read the end mark without subtracting the start', 'ruler-mm': 'Ruler: millimetres miscounted', 'tape-neighbour': 'Tape: read the neighbouring mark',
    'in-over-12': '12 or more inches not carried to feet', 'pace-ft': 'Used 1 pace = 1 ft (it is 1 yd = 3 ft)', 'hands-added': 'Added the hand widths instead of subtracting', inches: 'Inches wrong', feet: 'Feet wrong',
    'gave-other-unit': 'Answer in the wrong unit', 'pct-base': 'Percent error divided by the estimate instead of the measured value', 'pct-no100': 'Percent error not multiplied by 100',
    'pct-abs': 'Gave the absolute error, not the percent', 'km-not-m': 'Didn’t change km to m', 'multiplied': 'Multiplied instead of dividing', divided: 'Divided instead of multiplying',
    'round-up': 'Rounded down when a whole item must be bought (round up)', 'whole-count': 'Rounded the count instead of giving the whole repetitions'
  });

  /* =========================================================================================================
   * ASSIGNMENT
   * ========================================================================================================= */
  var SI_PINKY = { html: 'the width of a pinky fingernail (about 1 cm)', why: 'That is an <b>SI</b> referent (about 1 centimetre). The question asks for an <b>imperial</b> referent — inches, feet or yards.' };
  var SI_KID = { html: 'the height of a 4-year-old child (about 1 m)', why: 'That is an <b>SI</b> referent (about 1 metre). The question asks for an <b>imperial</b> referent — inches, feet or yards.' };
  function q1Shared(r) {
    var shelf = r.pick(['foot', 'foot', 'pace']), sn = shelf === 'foot' ? r.int(3, 6) : r.int(2, 4), sEst = sn * (shelf === 'foot' ? 12 : 36);
    var sAct = sEst + r.pick(shelf === 'foot' ? [-3, -2, -1, 1, 2] : [-5, -4, -3, 3, 4, 5]);
    var kh = r.int(1, 4), kEst = 72 - 4 * kh, kAct = kEst + r.pick([-3, -2, -1, 1, 2, 3]);
    var ln = r.int(11, 15), lAct = ln + r.pick([-1, 0, 1, 2]);
    return { shelf: shelf, sn: sn, sEst: sEst, sAct: sAct, sJit: r.pick([-0.2, -0.1, 0.1, 0.2]), kh: kh, kEst: kEst, kAct: kAct, kJit: r.pick([-0.15, 0.1, 0.15]), ln: ln, lAct: lAct, lJit: r.pick([-0.15, -0.1, 0.1, 0.15]) };
  }
  function refMC(r, what, right, others) {
    return mc(r, 'Which of these is a sensible <b>imperial</b> referent for estimating ' + what + '?', [right].concat(others),
      'Choose a referent that is <b>imperial</b> (inches, feet, yards) and <b>close in size</b> to the object, so it fits a small number of times: ' + right.html + '.',
      ['Is the referent imperial or SI? Is it close in size to the object, so you only lay it down a few times?'], 'imperial referent for ' + what);
  }
  var THUMB_WHY = function (n) { return 'A thumb (about 1 in) is far smaller than this — you would lay it down about ' + n + ' times, and every placement adds error. Pick a referent closer in size.'; };

  function q3Rows() {
    return [['i', '1 inch', 'E', 'width of a thumb across the joint'], ['ii', '1 metre', 'I', 'height of a 4-year-old child'], ['iii', '1 foot', 'F', 'length of an adult foot'],
      ['iv', '1 millimetre', 'B', 'thickness of a dime'], ['v', '50 metres', 'K', 'length of an Olympic swimming pool'], ['vi', '20 centimetres', 'H', 'width of a workbook'],
      ['vii', '2 metres', 'G', 'height of a standard doorway'], ['viii', '7.6 centimetres', 'D', 'diameter of a hockey puck'], ['ix', '0.1 metres', 'C', 'width of five adult toes'],
      ['x', '1 centimetre', 'A', 'width of an adult pinky fingernail'], ['xi', '1 yard', 'J', 'length of an adult pace']];
  }
  function q3Part(r, sh, g) {
    var all = q3Rows(), grp = sh.groups[g].map(function (i) { return all[i]; }), byL = {};
    grp.forEach(function (x) { byL[x[2]] = x; });
    var rows = grp.slice().sort(function (a, b) { return a[2] < b[2] ? -1 : 1; }).map(function (x) { return { id: x[2], html: x[2] + '. ' + x[3] }; });
    var cols = r.shuffle(grp).map(function (x) { return { id: x[0], html: x[1] }; }), want = {};
    grp.forEach(function (x) { want[x[2]] = x[0]; });
    var p = P.grid('Match each referent with its approximate measurement. Each measurement is used once.', rows, cols, want, {
      why: function (row) { var x = byL[row]; return { code: 'row', hint: 'Check “' + x[3] + '” again: is it an imperial or an SI referent, and roughly how big is it?' }; }
    }, rows.map(function (rw) { var x = byL[rw.id]; return x[2] + '. ' + x[3] + ' ≈ <b>' + x[1] + '</b> (' + x[0] + ')'; }).join('<br>'),
    ['Sort them by size first: the smallest referent goes with the smallest measurement.', 'Imperial referents: thumb (1 in), adult foot (1 ft), pace (1 yd). The rest are SI.'], 'match referents ' + grp.map(function (x) { return x[0]; }).join(','));
    return p;
  }

  /* Q5: a new referent for each unit (not one already in the lesson) */
  var Q5 = {
    mm: { name: 'millimetre', size: 1, lesson: 'the thickness of a dime', pool: ['the width of a strand of uncooked spaghetti', 'the thickness of a credit card', 'the thickness of the wire in a paperclip'] },
    cm: { name: 'centimetre', size: 10, lesson: 'the width of an adult pinky fingernail', pool: ['the diameter of an AA battery', 'the width of a standard pencil', 'the width of a staple'] },
    m: { name: 'metre', size: 1000, lesson: 'the height of a 4-year-old child', pool: ['the height of a kitchen countertop', 'the length of a guitar', 'the height of a doorknob above the floor'] },
    in: { name: 'inch', size: 25.4, lesson: 'the width of a thumb across the joint', pool: ['the diameter of a quarter (25¢ coin)', 'the width of a postage stamp'] },
    ft: { name: 'foot', size: 305, lesson: 'the length of an adult foot', pool: ['the length of a standard school ruler (12 in)', 'the side of a square floor tile (12 in)', 'the length of a sheet of legal paper'] },
    yd: { name: 'yard', size: 914, lesson: 'the length of an adult pace', pool: ['the distance from your chin to the fingertips of your outstretched arm', 'the length of a baseball bat', 'the width of a single bed'] }
  };
  function q5Part(r, u) {
    var U = Q5[u], keys = Object.keys(Q5).filter(function (k) { var a = Q5[k].size, b = U.size; return Math.max(a, b) / Math.min(a, b) >= 3; });
    var ds = r.sample(keys, 2);
    var opts = [{ html: r.pick(U.pool), right: true }, { html: U.lesson, why: 'That is about 1 ' + U.name + ', but it is the referent the lesson already gave. The question asks for a <b>different</b> one.' }]
      .concat(ds.map(function (k) { return { html: r.pick(Q5[k].pool), why: 'That is closer to 1 <b>' + Q5[k].name + '</b> than to 1 ' + U.name + '.' }; }));
    return mc(r, 'Which of these is a good personal referent for <b>1 ' + U.name + '</b>, different from any referent already given in the lesson?', opts,
      'A referent for 1 ' + U.name + ' must be about that size and (here) not the lesson’s own example (' + U.lesson + '). ' + cap(opts[0].html) + ' is about 1 ' + U.name + '.',
      ['Picture each object next to a ruler or metre stick. Which one is about 1 ' + U.name + '?'], 'new referent for 1 ' + U.name);
  }

  /* Q8–14: the most reasonable unit */
  var UNITS = { mm: ['millimetre', 1e-3], cm: ['centimetre', 1e-2], m: ['metre', 1], km: ['kilometre', 1000], in: ['inch', 0.0254], ft: ['foot', 0.3048], yd: ['yard', 0.9144], mi: ['mile', 1609.344] };
  function inUnit(sizeM, u) { var v = sizeM / UNITS[u][1], s = v >= 100000 ? F(String(Math.round(v / Math.pow(10, Math.floor(Math.log10(v)) - 1)) * Math.pow(10, Math.floor(Math.log10(v)) - 1))) : v >= 10 ? F(String(Math.round(v))) : v >= 0.1 ? String(rnd(v, 2)) : String(Number(v.toPrecision(1))); return s; }
  function pl(u, v) { var nm = UNITS[u][0]; if (v === '1') return nm; return nm === 'inch' ? 'inches' : nm === 'foot' ? 'feet' : nm + 's'; }
  function unitMC(r, objs, units, right, note) {
    var o = r.pick(objs);
    var opts = units.map(function (u) {
      if (u === right) return { html: UNITS[u][0], right: true };
      return { html: UNITS[u][0], why: o.n + ' is about ' + t(inUnit(o.m, u)) + ' ' + pl(u, inUnit(o.m, u)) + ' — ' + (o.m / UNITS[u][1] > 50 ? 'far too many to be convenient.' : 'an awkward fraction, so that unit is far too big.') };
    });
    return mc(r, 'Select the unit that would most reasonably be used to state this measurement: <b>' + lc(o.n) + '</b>.', opts,
      o.n + ' is about ' + t(inUnit(o.m, right)) + ' ' + pl(right, inUnit(o.m, right)) + (note ? ' — ' + note : '') + '. In the other units it is ' + units.filter(function (u) { return u !== right; }).map(function (u) { return t(inUnit(o.m, u)) + ' ' + pl(u, inUnit(o.m, u)); }).join(', ') + ': too many digits or awkward fractions.',
      ['Choose the unit that gives a small, convenient number — not millions, and not a tiny fraction.'], 'unit for ' + lc(o.n));
  }

  /* Q18: best instrument */
  var INSTR = {
    A: { n: 'Trundle wheel', objs: [['The length of a running track', 'A running track is hundreds of metres long — roll a trundle wheel along it.'], ['The perimeter of a soccer field', 'A field’s perimeter is hundreds of metres — roll a trundle wheel around it.'], ['The length of a city block', 'A city block is over a hundred metres — a trundle wheel rolls it out.']] },
    B: { n: 'Micrometer', objs: [['The diameter of a pencil’s lead', 'A pencil lead is under 1 mm across — only a micrometer (0.01 mm) can measure it.'], ['The thickness of a guitar string', 'A guitar string is well under 1 mm thick — use a micrometer (0.01 mm).'], ['The thickness of a human hair', 'A hair is a tiny fraction of a millimetre — use a micrometer (0.01 mm).']] },
    C: { n: 'Ruler', objs: [['The width of a textbook cover', 'A textbook is about 20–30 cm wide and the nearest millimetre is plenty — use a ruler.'], ['The length of a pencil', 'A pencil fits on a ruler and the nearest millimetre is plenty.'], ['The length of a shoe', 'A shoe fits along a ruler and the nearest millimetre is plenty.']] },
    D: { n: 'Vernier caliper', objs: [['The depth of a small drilled hole', 'A caliper’s depth rod measures the depth of a small hole to 0.05 mm.'], ['The inside diameter of a pipe fitting', 'A caliper’s inside jaws measure an inside diameter to 0.05 mm.'], ['The inside diameter of a finger ring', 'A caliper’s inside jaws measure an inside diameter to 0.05 mm.']] }
  };

  var questions = [
    { num: '1', section: 'Assignment — Referents and estimating', stem: 'For each object, a referent is used to estimate the <b>imperial</b> measure, and then a ruler or tape measure gives the actual measurement.', shared: q1Shared, parts: [
      { id: '1ai', sub: 'a i', level: 'LIM', make: function (r, s) {
        return s.shelf === 'foot' ? refMC(r, 'the length of a small bookcase (about as long as a student desk)', { html: 'the length of an adult foot (about 1 ft), placed heel to toe', right: true }, [{ html: 'the width of a thumb (about 1 in)', why: THUMB_WHY(36) }, { html: 'a furlong (how far oxen plow before resting)', why: 'A furlong is 220 yd — far longer than any bookcase.' }, SI_PINKY])
          : refMC(r, 'the length of a long bookshelf that runs along a whole wall', { html: 'one adult pace (about 1 yd)', right: true }, [{ html: 'the width of a thumb (about 1 in)', why: THUMB_WHY(100) }, { html: 'a mile', why: 'A mile is 1 760 yd — far longer than any shelf.' }, SI_PINKY]);
      } },
      { id: '1aii', sub: 'a ii', level: 'BEG', make: function (r, s) {
        var ft = s.shelf === 'foot', per = ft ? 12 : 36;
        var alts = [{ v: s.sn, code: 'gave-other-unit', hint: 'That is the length in ' + (ft ? 'feet' : 'yards') + '. The question asks for <b>inches</b>: ' + t(ft ? '1\\text{ ft}=12\\text{ in}' : '1\\text{ yd}=36\\text{ in}') + '.' }];
        if (!ft) { alts.push({ v: 3 * s.sn, code: 'gave-other-unit', hint: 'That is the length in feet. The question asks for <b>inches</b>: ' + t('1\\text{ ft}=12\\text{ in}') + '.' }); alts.push({ v: 12 * s.sn, code: 'pace-ft', hint: 'A pace is about 1 <b>yard</b> ' + t('=3\\text{ ft}=36\\text{ in}') + ', not 1 foot.' }); }
        return exactPart((ft ? 'Placing your feet heel to toe along the bookcase, you count ' + t(s.sn) + ' foot lengths (adult foot ' + t('\\approx1') + ' ft).' : 'Walking along the shelf with normal paces, you count ' + t(s.sn) + ' paces (adult pace ' + t('\\approx1') + ' yd).') + ' Estimate the length in <b>inches</b>.',
          s.sEst, 'in', alts, 'Estimate ' + t('=\\text{count}\\times\\text{referent}') + ': ' + t(s.sn + '\\times' + per + '\\text{ in}=' + s.sEst + '\\text{ in}') + (ft ? '' : ' (' + t('1\\text{ yd}=3\\text{ ft}=36\\text{ in}') + ')') + '.',
          ['Multiply the count by the referent’s length in inches.', ft ? '1 ft = 12 in.' : '1 yd = 3 ft = 36 in.'], 'bookshelf estimate ' + s.sn + ' ' + s.shelf);
      } },
      { id: '1aiii', sub: 'a iii', level: 'BEG', make: function (r, s) {
        var end = s.sAct + s.sJit;
        return exactPart('A tape measure is stretched along the shelf, with its 0 at the shelf’s left end. Here is the tape at the shelf’s right end. What is the shelf’s actual length, to the nearest inch?' + inTapeSvg({ from: s.sAct - 5, to: s.sAct + 3, end: end, tape: true }),
          s.sAct, 'in', [{ v: s.sAct + 1, code: 'tape-neighbour', hint: 'Look at the inch mark <b>closest</b> to the end of the shelf.' }, { v: s.sAct - 1, code: 'tape-neighbour', hint: 'Look at the inch mark <b>closest</b> to the end of the shelf.' }],
          'The end of the shelf is closest to the ' + t(s.sAct) + ' in mark, so the shelf is about <b>' + s.sAct + ' in</b> long' + (s.sAct >= 12 ? ' ' + t('(' + Math.floor(s.sAct / 12) + '\\text{ ft }' + (s.sAct % 12) + '\\text{ in})') : '') + '. The estimate, ' + t(s.sEst) + ' in, is off by ' + t(Math.abs(s.sEst - s.sAct)) + ' in.',
          ['The tape’s numbers are inches from the shelf’s left end. Which inch mark is the end of the shelf closest to?'], 'read inch tape ' + s.sAct);
      } },
      { id: '1bi', sub: 'b i', level: 'LIM', make: function (r) {
        return refMC(r, 'the height of a classmate', { html: 'one adult pace (about 1 yd), laid off up a wall beside them', right: true }, [{ html: 'the width of a thumb (about 1 in)', why: THUMB_WHY(65) }, { html: 'a mile', why: 'A mile is 1 760 yd — absurdly long for a person’s height.' }, SI_KID]);
      } },
      { id: '1bii', sub: 'b ii', level: 'EMG', make: function (r, s) {
        var tot = s.kEst, kh = s.kh;
        var p = { prompt: 'Your classmate stands against a wall. Laid off up the wall beside them, <b>2 paces</b> (about 1 yd each) reach a little above their head: the top of their head is <b>' + kh + ' hand width' + (kh > 1 ? 's' : '') + '</b> (about 4 in each) below the top of the second pace. Estimate the classmate’s height in feet and inches.',
          input: { type: 'fields', fields: [{ label: 'Height', after: 'ft', name: 'Feet' }, { label: '', after: 'in', name: 'Inches' }] },
          check: ftInCk(tot, function (T) {
            if (near(T, 24 - 4 * kh)) return { code: 'pace-ft', hint: 'A pace is about 1 <b>yard</b> = 3 ft, so 2 paces are 6 ft, not 2 ft.' };
            if (near(T, 72 + 4 * kh)) return { code: 'hands-added', hint: 'The head is <b>below</b> the top of the second pace, so subtract the hand widths.' };
            if (near(T, 72 - kh)) return { code: 'hand-1in', hint: 'A hand width is about <b>4 in</b>, not 1 in.' };
            return null;
          }),
          key: [String(Math.floor(tot / 12)), String(tot % 12)], answer: ftInTex(tot),
          solution: '2 paces ' + t('\\approx2\\times3\\text{ ft}=6\\text{ ft}=72\\text{ in}') + '. ' + kh + ' hand width' + (kh > 1 ? 's' : '') + ' ' + t('\\approx' + kh + '\\times4=' + 4 * kh + '\\text{ in}') + '.<br>' + t('72-' + 4 * kh + '=' + tot + '\\text{ in}') + ' ' + t('=' + Math.floor(tot / 12) + '\\times12+' + tot % 12) + ', so about <b>' + Math.floor(tot / 12) + ' ft ' + tot % 12 + ' in</b>.',
          hints: ['2 paces ≈ 2 yd = 6 ft = 72 in. Each hand width is about 4 in.', 'Subtract the hands, then change the inches to feet and inches (12 in = 1 ft).'], text: 'classmate height estimate 2 paces − ' + kh + ' hands' };
        p.bad = [[String(Math.floor((72 + 4 * kh) / 12)), String((72 + 4 * kh) % 12)], ['2', '0']];
        return p;
      } },
      { id: '1biii', sub: 'b iii', level: 'BEG', make: function (r, s) {
        var tot = s.kAct;
        var p = { prompt: 'A tape measure on the wall reads the classmate’s height, in inches from the floor. Read their height to the nearest inch and write it in feet and inches.' + heightSvg(tot + s.kJit),
          input: { type: 'fields', fields: [{ label: 'Height', after: 'ft', name: 'Feet' }, { label: '', after: 'in', name: 'Inches' }] },
          check: ftInCk(tot, function (T) { if (near(Math.abs(T - tot), 1)) return { code: 'tape-neighbour', hint: 'Read the inch mark <b>closest</b> to the bottom of the book on their head.' }; return null; }),
          key: [String(Math.floor(tot / 12)), String(tot % 12)], answer: ftInTex(tot),
          solution: 'The book sits at the ' + t(tot) + ' in mark. ' + t(tot + '=' + Math.floor(tot / 12) + '\\times12+' + tot % 12) + ', so the height is <b>' + Math.floor(tot / 12) + ' ft ' + tot % 12 + ' in</b>.',
          hints: ['Find the inch mark level with the bottom of the book.', '12 in = 1 ft: how many whole feet are in that many inches, and how many inches are left over?'], text: 'read height chart ' + tot };
        p.bad = [[String(Math.floor((tot + 1) / 12)), String((tot + 1) % 12)]];
        return p;
      } },
      { id: '1biv', sub: 'b iv', level: 'PRG', make: function (r, s) {
        var d = Math.abs(s.kEst - s.kAct), pc = d / s.kAct * 100;
        return fieldsPart('The estimate of the classmate’s height was ' + ftInTex(s.kEst) + ', and the tape measure reads ' + ftInTex(s.kAct) + '. Find the difference, and that difference as a percent of the measured height. (An estimate within about ' + t('10\\%') + ' is reasonable.)',
          [{ label: 'Difference', after: 'in', x: d, exact: true, alts: [{ v: d / 12, code: 'gave-other-unit', hint: 'Give the difference in <b>inches</b>.' }] },
            { label: 'Percent of the measured height', after: '% (nearest whole percent)', x: pc, dp: 0, alts: [{ v: d / s.kEst * 100, code: 'pct-base', hint: 'Divide by the <b>measured</b> height, not the estimate.' }, { v: d / s.kAct, code: 'pct-no100', hint: 'Multiply by ' + t('100') + ' to make a percent.' }] }],
          'In inches: estimate ' + t(Math.floor(s.kEst / 12) + '(12)+' + s.kEst % 12 + '=' + s.kEst) + ', measured ' + t(Math.floor(s.kAct / 12) + '(12)+' + s.kAct % 12 + '=' + s.kAct) + '.<br>Difference ' + t('|' + s.kEst + '-' + s.kAct + '|=' + d) + ' in; ' + t('\\frac{' + d + '}{' + s.kAct + '}\\times100\\approx' + fx(pc, 0) + '\\%') + '. Well within ' + t('10\\%') + ', so the estimate is reasonable.',
          ['Change both heights to inches first (1 ft = 12 in).', 'Percent difference = difference ÷ measured × 100.'], 'height estimate vs measured');
      } },
      { id: '1ci', sub: 'c i', level: 'LIM', make: function (r) {
        return refMC(r, 'the width of a laptop screen', { html: 'the width of a thumb across the joint (about 1 in)', right: true }, [{ html: 'one adult pace (about 1 yd)', why: 'A pace (about 1 yd = 36 in) is longer than the whole screen — it can’t be counted along it.' }, { html: 'a furlong', why: 'A furlong is 220 yd — absurdly long for a laptop.' }, SI_PINKY]);
      } },
      { id: '1cii', sub: 'c ii', level: 'LIM', make: function (r, s) {
        return exactPart('Laying your thumb across the screen again and again, you count ' + t(s.ln) + ' thumb widths (thumb ' + t('\\approx1') + ' in). Estimate the width of the screen in inches.',
          s.ln, 'in', [{ v: 2.5 * s.ln, code: 'gave-other-unit', hint: 'That is the SI estimate in centimetres (thumb ≈ 2.5 cm). The question asks for <b>inches</b>: thumb ≈ 1 in.' }],
          t(s.ln + '\\times1\\text{ in}=' + s.ln + '\\text{ in}') + ' (about ' + t(s.ln + '\\div12\\approx' + fx(s.ln / 12, 1)) + ' ft).', ['Each thumb width is about 1 inch.'], 'laptop estimate ' + s.ln + ' thumbs');
      } },
      { id: '1ciii', sub: 'c iii', level: 'BEG', make: function (r, s) {
        var to = Math.min(18, s.lAct + 3);
        return exactPart('An inch ruler is laid across the screen with its 0 at the left edge. What is the actual width, to the nearest inch?' + inTapeSvg({ from: 0, to: to, start: 0, end: s.lAct + s.lJit, obj: 'bar' }),
          s.lAct, 'in', [{ v: s.lAct + 1, code: 'tape-neighbour', hint: 'Look at the inch mark <b>closest</b> to the right edge of the screen.' }, { v: s.lAct - 1, code: 'tape-neighbour', hint: 'Look at the inch mark <b>closest</b> to the right edge of the screen.' }, { v: s.lAct * 2.54, code: 'gave-other-unit', hint: 'Read the ruler in inches.' }],
          'The right edge is closest to the ' + t(s.lAct) + ' in mark: about <b>' + s.lAct + ' in</b>. The thumb estimate was ' + t(s.ln) + ' in' + (s.ln === s.lAct ? ' — spot on.' : ', off by ' + t(Math.abs(s.ln - s.lAct)) + ' in.'),
          ['Which whole-inch mark is the right edge closest to?'], 'read inch ruler ' + s.lAct);
      } }] },
    { num: '2', stem: 'In curling, the house has three rings around a central button: the 12-foot, 8-foot and 4-foot circles, named for their <b>diameters</b>, so their radii are 6 ft, 4 ft and 2 ft. Two players cannot tell by eye which of their two stones is closer to the button.', parts: [
      { id: '2a', level: 'EMG', make: function (r) {
        return mc(r, 'Both stones are in the <b>outer ring</b>, between the 12-foot and 8-foot circles. Which personal strategy is most sensible for deciding which stone is closer?', [
          { html: 'Walk normal paces (about 1 yd = 3 ft each) from each stone to the button and count; the stone needing fewer paces (or the shorter leftover) is closer.', right: true },
          { html: 'Lay thumb widths (about 1 in) end to end from each stone to the button.', why: 'It would work, but each stone is 4–6 ft = 48–72 thumb widths away: slow, and every placement adds error. A pace is close enough in size here.' },
          { html: 'Walk once around the 12-foot circle, counting paces.', why: 'That measures the circle, not how far each stone is from the button.' },
          { html: 'Compare the two stones by eye from the end of the sheet.', why: 'The players already couldn’t tell by eye — you need a referent to compare the two distances.' }],
          'In the outer ring each stone is between 4 ft and 6 ft (the radii of the 8- and 12-foot circles) from the centre: 1 to 2 paces of about 3 ft. Pacing from each stone to the button and comparing the counts (and the leftovers) decides it.',
          ['How far from the centre is the outer ring? Which referent is close to that size?'], 'curling outer ring strategy');
      } },
      { id: '2b', level: 'EMG', make: function (r) {
        var small = r.pick([['hand widths (about 4 in)', '6 hand widths'], ['thumb widths (about 1 in)', '24 thumb widths']]);
        return mc(r, 'Both stones are near the button, <b>inside the 4-foot circle</b>. Which personal strategy is most sensible now?', [
          { html: 'A pace (3 ft) is longer than the 2 ft from the edge of the 4-foot circle to the centre, so switch to ' + small[0] + ' from each stone to the button; 2 ft is ' + small[1] + ', enough to tell them apart.', right: true },
          { html: 'Keep pacing from each stone to the button; fewer paces means closer.', why: 'Inside the 4-foot circle both stones are less than 2 ft from the centre — less than one pace. Both counts would be 0, so paces can’t separate them.' },
          { html: 'Use the 8-foot circle’s diameter as the referent.', why: 'An 8-ft referent is far bigger than the 2-ft distances you are comparing.' },
          { html: 'Measure each distance in yards.', why: 'A yard is a pace (3 ft) — too coarse to separate two distances that are both under 2 ft.' }],
          'Inside the 4-foot circle every stone is within ' + t('4\\div2=2') + ' ft of the centre — less than one pace. Choose a referent <b>smaller than the difference you need to detect</b>: hand widths ' + t('(2\\text{ ft}=24\\text{ in}=6\\text{ hands})') + ' or thumb widths (24 of them).',
          ['How far from the centre can a stone inside the 4-foot circle be? Is a pace smaller or bigger than that?'], 'curling near the button strategy');
      } }] },
    { num: '3', stem: 'Match each approximate measurement with the referent. (The eleven matches are split into three short tables.)', shared: function (r) { var o = r.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]); return { groups: [o.slice(0, 4), o.slice(4, 8), o.slice(8)] }; }, parts: [
      { id: '3a', sub: 'first 4', level: 'LIM', make: function (r, sh) { return q3Part(r, sh, 0); } },
      { id: '3b', sub: 'next 4', level: 'LIM', make: function (r, sh) { return q3Part(r, sh, 1); } },
      { id: '3c', sub: 'last 3', level: 'LIM', make: function (r, sh) { return q3Part(r, sh, 2); } }] },
    { num: '4', stem: function (sh) { return 'You estimate the length of your pencil case with a personal referent, then check it with a ruler.'; }, shared: function (r) {
        var n = r.int(8, 10), est = 2.5 * n, act;
        do { act = est * 10 + r.pick([-1, 1]) * r.int(5, 28); } while (act < 180 || act > 265 || act % 10 === 0);
        return { n: n, est: est, act: act / 10 };
      }, parts: [
      { id: '4a', level: 'BEG', make: function (r, sh) {
        return exactPart('Laid along the case, your thumb (about ' + t('2.5') + ' cm across) fits ' + t(sh.n) + ' times. Estimate the length of the pencil case in centimetres.', sh.est, 'cm',
          [{ v: sh.n, code: 'gave-other-unit', hint: 'That is the estimate in inches (thumb ≈ 1 in). The question asks for <b>centimetres</b>: each thumb is about 2.5 cm.' }].concat(unitAlts(sh.est, 'cm')),
          t(sh.n + '\\times2.5\\text{ cm}=' + N(sh.est) + '\\text{ cm}') + '.', ['Estimate = count × referent length.'], 'pencil case estimate ' + sh.n + ' thumbs');
      } },
      { id: '4b', level: 'BEG', make: function (r, sh) {
        var a = sh.act;
        return exactPart('The pencil case lies on a 30-cm ruler with one end at 0. The picture below zooms in on the other end. Read its length, in centimetres, to the nearest millimetre.' + cmRulerSvg({ a: 0, b: a, from: 0, to: 30, obj: 'case', zoom: true }),
          a, 'cm', [{ v: a + 0.1, code: 'ruler-mm', hint: 'Count the small millimetre marks past the last whole centimetre again.' }, { v: a - 0.1, code: 'ruler-mm', hint: 'Count the small millimetre marks past the last whole centimetre again.' }, { v: rnd(a + 1, 1), code: 'ruler-mm', hint: 'Check the whole centimetres: which numbered mark comes just before the end of the case?' }, { v: rnd(a - 1, 1), code: 'ruler-mm', hint: 'Check the whole centimetres: which numbered mark comes just before the end of the case?' }].concat(unitAlts(a, 'cm')),
          'The end of the case is ' + t(Math.round((a - Math.floor(a)) * 10)) + ' mm past the ' + t(Math.floor(a)) + ' cm mark: ' + t(fx(a, 1)) + ' cm (' + t(Math.round(a * 10)) + ' mm).',
          ['Find the last whole-centimetre mark before the end, then count the millimetre marks after it.', 'Each small mark is 1 mm = 0.1 cm.'], 'read cm ruler ' + fx(a, 1), { dp: 1, precisionHint: 'Right value! A ruler reads to the nearest millimetre, so give one decimal place: ' + t(fx(a, 1)) + ' cm.' });
      } },
      { id: '4c', level: 'EMG', make: function (r, sh) {
        var d = rnd(Math.abs(sh.est - sh.act), 1), pc = d / sh.act * 100;
        return fieldsPart('The estimate was ' + t(N(sh.est)) + ' cm and the ruler reads ' + t(fx(sh.act, 1)) + ' cm. How far off was the estimate, and what percent of the measured length is that?',
          [{ label: 'Off by', after: 'cm', x: d, exact: true, alts: [] }, { label: 'Percent', after: '% (nearest whole percent)', x: pc, dp: 0, alts: [{ v: d / sh.est * 100, code: 'pct-base', hint: 'Divide by the <b>measured</b> length (the ruler’s reading), not the estimate.' }, { v: d / sh.act, code: 'pct-no100', hint: 'Multiply by ' + t('100') + ' to make a percent.' }] }],
          t('|' + N(sh.est) + '-' + fx(sh.act, 1) + '|=' + fx(d, 1)) + ' cm. ' + t('\\frac{' + fx(d, 1) + '}{' + fx(sh.act, 1) + '}\\times100\\approx' + fx(pc, 0) + '\\%') + ' — ' + (pc <= 10 ? 'acceptable for a referent estimate.' : 'a rough estimate; a referent closer in size would help.'),
          ['Subtract the two lengths (ignore the sign).', 'Percent = difference ÷ measured × 100.'], 'pencil case error');
      } }] },
    { num: '5', stem: 'Provide a personal referent for each linear measurement, <b>different</b> from any referent already given in the lesson.', parts: ['mm', 'cm', 'm', 'in', 'ft', 'yd'].map(function (u, i) {
      return { id: '5' + 'abcdef'.charAt(i), level: 'LIM', make: function (r) { return q5Part(r, u); } };
    }) },
    { num: '6', stem: 'Describe and explain a personal strategy that could be used to determine the circumference of a round object.', parts: [
      { id: '6', level: 'EMG', make: function (r) {
        var o = r.pick([['a basketball', 75], ['a soccer ball', 70], ['a volleyball', 66], ['a beach ball', 150]]);
        return mc(r, 'Which strategy determines the circumference of <b>' + o[0] + '</b>?', [
          { html: 'Wrap a string once around the widest part, mark where it meets itself, straighten it out, and count pinky-fingernail widths (about 1 cm each) along it.', right: true },
          { html: 'Lay pinky-fingernail widths in a straight line across the ball from one side to the other; that count is the circumference.', why: 'Straight across the ball is the <b>diameter</b>, not the circumference (the distance around).' },
          { html: 'Walk around the ball, counting paces.', why: 'A pace (about 90 cm) is about as long as the whole distance around the ball — far too big a referent, and walking around it doesn’t measure the ball.' },
          { html: 'Stand the ball beside a doorway (about 2 m) and compare.', why: 'That compares heights, and the doorway is far bigger than the ball.' }],
          'A curved surface can’t be measured with a straight referent laid on it, so transfer the distance around to a string, straighten it, and count a small referent along it. ' + cap(o[0]) + ' is about ' + t(o[1]) + ' cm around, so expect about ' + t(o[1]) + ' fingernail widths.',
          ['Circumference means the distance <b>around</b>. How can you turn a curved distance into a straight one?'], 'circumference strategy ' + o[0]);
      } }] },
    { num: '7', stem: function (sh) { return 'In the past, ' + t(sh.b) + ' city blocks was a common referent for a mile.'; }, shared: function (r) { return { b: r.pick([10, 10, 8, 16, 20]) }; }, parts: [
      { id: '7a', level: 'EMG', make: function (r, sh) {
        return mc(r, 'What assumption is being made in stating that ' + t(sh.b) + ' city blocks is about 1 mile?', [
          { html: 'That the blocks are all about the same length as one another, each about ' + t('\\tfrac{1}{' + sh.b + '}') + ' of a mile.', right: true },
          { html: 'That a city block is exactly 1 mile long.', why: 'Then ' + t(sh.b) + ' blocks would be ' + t(sh.b) + ' miles.' },
          { html: 'That everyone walks the blocks at the same speed.', why: 'Speed doesn’t change a length. Think about what has to be true of the blocks themselves.' },
          { html: 'That the blocks are measured in kilometres.', why: 'The units don’t matter; the referent only works if every block is about the same size.' }],
          'A referent only works if it is the same size every time it is repeated. Saying ' + t(sh.b) + ' blocks ' + t('\\approx') + ' 1 mile assumes every block is about the same length, ' + t('\\tfrac{1}{' + sh.b + '}') + ' mi.',
          ['What has to be true about something you count over and over as a referent?'], 'city block assumption');
      } },
      { id: '7b', level: 'BEG', make: function (r, sh) {
        var y = 1760 / sh.b;
        return exactPart('About how long is one block, in yards? (' + t('1\\text{ mi}=1\\,760\\text{ yd}') + ')', y, 'yd',
          [{ v: 1760 * sh.b, code: 'multiplied', hint: 'One block is a <b>fraction</b> of a mile: divide ' + t('1\\,760') + ' by ' + t(sh.b) + '.' }, { v: 5280 / sh.b, code: 'gave-other-unit', hint: 'That is the block length in <b>feet</b> (5 280 ft per mile). The question asks yards.' }],
          t('1\\,760\\div' + sh.b + '=' + y) + ' yd per block.', ['The ' + sh.b + ' blocks share the mile equally.'], 'block length ' + sh.b + ' per mile');
      } }] },
    { num: '8', section: 'Multiple choice and numerical response', stem: '<i>(Multiple Choice)</i>', parts: [
      { id: '8', level: 'BEG', make: function (r) { return unitMC(r, [{ n: 'Length of a hockey rink', m: 61 }, { n: 'Length of a school gym', m: 30 }, { n: 'Length of a tennis court', m: 24 }, { n: 'Length of a soccer field', m: 100 }], ['mm', 'mi', 'm', 'km'], 'm'); } }] },
    { num: '9', stem: '<i>(Multiple Choice)</i>', parts: [
      { id: '9', level: 'LIM', make: function (r) { return unitMC(r, [{ n: 'Distance between two provincial capital cities', m: 700000 }, { n: 'Distance from Edmonton to Calgary', m: 300000 }, { n: 'Distance from Vancouver to Winnipeg', m: 2200000 }], ['mm', 'm', 'ft', 'km'], 'km'); } }] },
    { num: '10', stem: '<i>(Multiple Choice)</i>', parts: [
      { id: '10', level: 'BEG', make: function (r) { return unitMC(r, [{ n: 'Diagonal measurement of a laptop screen', m: 15.6 * 0.0254 }, { n: 'Diagonal measurement of a TV screen', m: 55 * 0.0254 }, { n: 'Diagonal measurement of a tablet screen', m: 10.9 * 0.0254 }, { n: 'Diagonal measurement of a computer monitor', m: 24 * 0.0254 }], ['mi', 'm', 'in', 'mm'], 'in', 'screens are sold by the inch, measured diagonally'); } }] },
    { num: '11', stem: '<i>(Multiple Choice)</i>', parts: [
      { id: '11', level: 'LIM', make: function (r) { return unitMC(r, [{ n: 'Length of a paperclip', m: 0.033 }, { n: 'Length of a grain of rice', m: 0.007 }, { n: 'Length of a staple', m: 0.013 }, { n: 'Diameter of a shirt button', m: 0.015 }], ['mm', 'mi', 'm', 'yd'], 'mm'); } }] },
    { num: '12', stem: '<i>(Multiple Choice)</i>', parts: [
      { id: '12', level: 'BEG', make: function (r) { return unitMC(r, [{ n: 'Length of a school hallway', m: 37 }, { n: 'Length of a football field', m: 91 }, { n: 'Length of a backyard', m: 18 }, { n: 'Length of a city lot', m: 36 }], ['cm', 'mi', 'yd', 'in'], 'yd'); } }] },
    { num: '13', stem: '<i>(Multiple Choice)</i>', parts: [
      { id: '13', level: 'LIM', make: function (r) { return unitMC(r, [{ n: 'Width of a smartphone', m: 0.07 }, { n: 'Width of a credit card', m: 0.054 }, { n: 'Length of a USB flash drive', m: 0.045 }, { n: 'Length of an eraser', m: 0.05 }], ['mm', 'yd', 'm', 'mi'], 'mm'); } }] },
    { num: '14', stem: '<i>(Multiple Choice)</i>', parts: [
      { id: '14', level: 'LIM', make: function (r) { return unitMC(r, [{ n: 'Height of a giraffe', m: 5 }, { n: 'Length of a school bus', m: 12 }, { n: 'Height of a two-storey house', m: 8 }, { n: 'Height of a basketball hoop', m: 3 }], ['mm', 'in', 'mi', 'm'], 'm'); } }] },
    { num: '15', stem: '<i>(Numerical Response)</i>', parts: [
      { id: '15', level: 'EMG', make: function (r) {
        var v = r.pick([['An Olympic swimming pool is approximately', 50, 1], ['An Olympic swimming pool is approximately', 50, 1], ['An Olympic swimming pool is approximately', 50, 2], ['A short-course swimming pool is approximately', 25, 1], ['One lap of a running track is', 400, 2], ['One lap of a running track is', 400, 10], ['A Canadian football field (goal line to goal line) is about', 100, 3]]);
        var ans = v[2] * 1000 / v[1];
        return P.nr(v[0] + ' ' + t(v[1]) + ' metres long. The number of ' + (v[1] === 400 ? 'laps' : v[1] === 100 ? 'field lengths' : 'pool lengths') + ' that would have to be used as a referent to measure ' + t(v[2]) + ' kilometre' + (v[2] > 1 ? 's' : '') + ' is ________.', ans, function (x) {
          if (near(x, v[2] / v[1])) return { code: 'km-not-m', hint: 'Change the kilometres to metres first: ' + t('1\\text{ km}=1\\,000\\text{ m}') + '.' };
          if (near(x, v[2] * 1000 * v[1]) || near(x, v[2] * v[1])) return { code: 'multiplied', hint: 'How many ' + t(v[1]) + '-m lengths fit into the distance? Divide.' };
          if (near(x, v[2] * 100 / v[1])) return { code: 'km-not-m', hint: 'Check the conversion: ' + t('1\\text{ km}=1\\,000\\text{ m}') + ', not 100 m.' };
          return null;
        }, t(v[2] + '\\text{ km}=' + F(v[2] * 1000) + '\\text{ m}') + ', and ' + t(F(v[2] * 1000) + '\\div' + v[1] + '=' + ans) + '. Check: ' + t(ans + '\\times' + v[1] + '=' + F(v[2] * 1000)) + ' m ✓.', ['Change the distance to metres, then divide by the referent’s length.'], 'referent count for ' + v[2] + ' km with ' + v[1] + ' m');
      } }] },
    { num: '16', section: 'Reading a vernier caliper and a micrometer', stem: 'Determine each vernier caliper reading, in millimetres, to the caliper’s precision.', parts: [
      { id: '16a', level: 'PRG', make: function (r) { return vernPart('', r.int(12, 95), r.int(1, 9)); } },
      { id: '16b', level: 'PRG', make: function (r) { return vernPart('', r.int(12, 95), r.int(1, 19)); } }] },
    { num: '17', stem: 'Determine each micrometer reading, in millimetres.', parts: [
      { id: '17a', level: 'EMG', make: function (r) { return micPart('', 2 * r.int(3, 16), r.int(3, 47)); } },
      { id: '17b', level: 'PRG', make: function (r) { return micPart('', 2 * r.int(3, 11) + 1, r.int(3, 47)); } }] },
    { num: '18', stem: 'Match each object with the best measuring instrument. Each instrument may be used once, more than once, or not at all.', parts: [
      { id: '18', level: 'BEG', make: function (r) {
        var ks = ['A', 'B', 'C', 'D'], picks;
        do { picks = [0, 1, 2, 3].map(function () { return r.pick(ks); }); } while (picks.filter(function (k, i) { return picks.indexOf(k) === i; }).length < 3);
        if (r.chance(0.35)) picks = r.shuffle(ks.slice());
        var used = {}, rows = [], want = {}, cue = {};
        picks.forEach(function (k, i) { var o; do { o = r.pick(INSTR[k].objs); } while (used[o[0]]); used[o[0]] = 1; var id = 'r' + i; rows.push({ id: id, html: '(' + ['i', 'ii', 'iii', 'iv'][i] + ') ' + o[0] }); want[id] = k; cue[id] = o[1]; });
        var cols = ks.map(function (k) { return { id: k, html: k + '. ' + INSTR[k].n }; });
        var p = P.grid('Choose the best instrument for each object.', rows, cols, want, { why: function (row) { return { code: 'row', hint: 'Check ' + rows.filter(function (x) { return x.id === row; })[0].html.replace(/^\([ivx]+\) /, '') + ': think about its <b>size</b> and the <b>precision</b> it needs.' }; } },
          rows.map(function (x) { return x.html + ': <b>' + INSTR[want[x.id]].n + '</b> — ' + cue[x.id]; }).join('<br>'),
          ['Trundle wheel: long distances along the ground. Ruler: desk-sized objects, to the nearest mm. Vernier caliper: small objects, inside sizes and depths, to 0.05 mm. Micrometer: the thickness of very small objects, to 0.01 mm.'], 'best instrument matching');
        p.input.colHead = 'Instrument';
        return p;
      } }] }
  ];

  /* =========================================================================================================
   * EXTRA PRACTICE
   * ========================================================================================================= */
  var EREF = [['A', 'thumb width', 2.5], ['B', 'hand width', 10], ['C', 'span', 20], ['D', 'cubit', 45], ['E', 'pace', 90], ['F', 'doorway height', 200]];
  var E1OBJ = { A: [['width of a postage stamp', 2.4], ['diameter of a quarter', 2.4]], B: [['length of a debit card', 8.5], ['height of a coffee mug', 10], ['height of a pop can', 12]],
    C: [['width of a sheet of printer paper', 21.6], ['height of a hardcover book', 24], ['diameter of a dinner plate', 25]], D: [['length of a computer keyboard', 44], ['height of a backpack', 46], ['length of a bed pillow', 50]],
    E: [['width of a single bed', 92], ['height of a kitchen counter', 91], ['width of a doorway', 85]], F: [['height of a refrigerator', 180], ['length of a sofa', 210], ['height of a tall bookshelf', 190]] };
  function closestRef(cm) { var best = null, bd = 1e9; EREF.forEach(function (e) { var d = Math.abs(Math.log(cm / e[2])); if (d < bd) { bd = d; best = e[0]; } }); return best; }
  function percAlts(est, meas) { return [{ v: Math.abs(est - meas) / est * 100, code: 'pct-base', hint: 'Divide by the <b>measured</b> (true) value, not the estimate.' }, { v: Math.abs(est - meas) / meas, code: 'pct-no100', hint: 'Multiply by ' + t('100') + ' to make it a percent.' }]; }
  function pctTex(e, m, dpIn, dpOut) { var ev = Number(String(e).replace(/\\,/g, '')), mv = Number(String(m).replace(/\\,/g, '')); return t('\\frac{|' + e + '-' + m + '|}{' + m + '}\\times100\\approx' + fx(pct(ev, mv), dpOut == null ? 1 : dpOut) + '\\%'); }
  var M2 = 'M2';

  var extra = [
    /* ---------- Part A ---------- */
    { num: '1', section: 'Extra practice A — Choosing a referent that fits the object', stem: 'Each object should be estimated with the referent that is <b>closest to it in size</b>. Referent values: thumb 2.5 cm, hand 10 cm, span 20 cm, cubit 45 cm, pace 90 cm, doorway 200 cm.',
      shared: function (r) {
        var rows = EREF.map(function (e) { var o = r.pick(E1OBJ[e[0]]); return { id: e[0], name: o[0], cm: o[1] }; });
        return { rows: r.shuffle(rows), tall: r.pick([['height of a refrigerator', 180], ['height of a tall bookshelf', 190], ['length of a single bed', 195]]) };
      }, parts: [
      { id: 'e1a', sub: 'a', level: 'BEG', make: function (r, sh) {
        var rows = sh.rows.map(function (o, i) { return { id: 'r' + i, html: ['i', 'ii', 'iii', 'iv', 'v', 'vi'][i] + '. ' + o.name + ' (≈ ' + o.cm + ' cm)' }; }), want = {};
        sh.rows.forEach(function (o, i) { want['r' + i] = closestRef(o.cm); });
        var cols = EREF.map(function (e) { return { id: e[0], html: e[0] + '<br><small>' + e[1].replace(' width', '').replace(' height', '') + ' ' + e[2] + '</small>' }; });
        return P.grid('Match each object with the referent closest to it in size (each referent once). Then the count for each is about 1.', rows, cols, want, { why: function (row) { var o = sh.rows[Number(row.slice(1))]; return { code: 'row', hint: 'Check the ' + o.name + ': which referent is nearest to ' + o.cm + ' cm?' }; } },
          sh.rows.map(function (o, i) { var k = want['r' + i], e = EREF.filter(function (x) { return x[0] === k; })[0]; return rows[i].html + ': <b>' + k + '</b> (' + e[1] + ') — ' + t(o.cm + '\\div' + e[2] + '\\approx' + Math.round(o.cm / e[2])) + ' repetition'; }).join('<br>'),
          ['Compare each object’s size with the six referent lengths and pick the nearest.'], 'closest referent matching');
      } },
      { id: 'e1b', sub: 'b i', level: 'EMG', make: function (r) {
        return mc(r, 'Every count in (a) is about 1. Which rule for choosing a referent does that illustrate?', [
          { html: 'Choose the referent closest in size to the object, so it covers the object in about one repetition — at most a handful.', right: true },
          { html: 'Always choose the smallest referent, because small referents are the most precise.', why: 'A tiny referent has to be laid down many times; every placement adds error and the count is easy to lose (see part ii).' },
          { html: 'Always choose the pace, because you always have it with you.', why: 'A pace is far too big for a stamp or a debit card — you can’t count a fraction of a pace by eye.' },
          { html: 'Any referent works, as long as you multiply correctly.', why: 'The arithmetic can be perfect and the estimate still poor: the referent must suit the object’s size.' }],
          'The matched referents each fit their object about once. The rule: <b>choose the referent closest in size to the object</b>.', ['Why does a count of about 1 make an estimate easy and reliable?'], 'referent rule');
      } },
      { id: 'e1c', sub: 'b ii', level: 'BEG', make: function (r, sh) {
        var n = sh.tall[1] / 2.5;
        return exactPart('How many thumb widths (2.5 cm) would the ' + sh.tall[0] + ' (≈ ' + sh.tall[1] + ' cm) take?', n, 'thumb widths', [{ v: sh.tall[1] * 2.5, code: 'multiplied', hint: 'Count = length ÷ referent length.' }],
          t(sh.tall[1] + '\\div2.5=' + n) + ' thumb widths. That is a poor choice: ' + n + ' placements is too many to count reliably, and each one’s small error is repeated ' + n + ' times.', ['Divide the length by the referent’s length.'], 'thumbs for ' + sh.tall[0]);
      } }] },
    { num: '2', stem: function (sh) { return 'A school hallway is measured with a tape as ' + t(FX(sh.L / 100, 2)) + ' m. Devlin estimates it with his thumb (truly 2.5 cm) and Rue with her pace (truly 90 cm). Both count perfectly, but each multiplies by a slightly wrong <b>value</b>.'; },
      shared: function (r) { var k = 5 * r.int(5, 9); return { k: k, L: 90 * k, T: 36 * k, dv: r.pick([2.4, 2.4, 2.6]), rv: r.pick([88, 88, 92, 87, 93]) }; }, parts: [
      { id: 'e2a', sub: 'a', level: 'BEG', make: function (r, sh) {
        return fieldsPart('How many thumb widths does the hallway take? How many paces?', [{ label: 'Thumb widths', x: sh.T, exact: true, alts: [{ v: sh.L / 100 / 2.5, code: 'unit-slip', hint: 'Change the metres to centimetres first (×100).' }] }, { label: 'Paces', x: sh.k, exact: true, alts: [{ v: sh.L / 100 / 90, code: 'unit-slip', hint: 'Change the metres to centimetres first (×100).' }] }],
          t(FX(sh.L / 100, 2) + '\\text{ m}=' + F(sh.L) + '\\text{ cm}') + '. Thumbs: ' + t(F(sh.L) + '\\div2.5=' + F(sh.T)) + '. Paces: ' + t(F(sh.L) + '\\div90=' + sh.k) + '.', ['Work in centimetres: count = length ÷ referent.'], 'hallway counts');
      } },
      { id: 'e2b', sub: 'b', level: 'EMG', make: function (r, sh) { return e2err(sh, 'Devlin', sh.T, sh.dv, 2.5); } },
      { id: 'e2c', sub: 'c', level: 'EMG', make: function (r, sh) { return e2err(sh, 'Rue', sh.k, sh.rv, 90); } },
      { id: 'e2d', sub: 'd', level: 'PRG', make: function (r, sh) {
        var dE = Math.abs(2.5 - sh.dv), rE = Math.abs(90 - sh.rv), dTot = rnd(sh.T * dE, 4), rTot = sh.k * rE;
        return mc(r, 'Rue’s referent value is wrong by ' + t(rE) + ' cm and Devlin’s by only ' + t('0.1') + ' cm, yet Rue’s estimate is the better one. Why?', [
          { html: 'Devlin lays his referent down ' + t(F(sh.T)) + ' times, so his ' + t('0.1') + '-cm error becomes ' + t(N(dTot)) + ' cm; Rue lays hers down only ' + t(sh.k) + ' times, so hers becomes ' + t(rTot) + ' cm. The error in an estimate is the number of repetitions times the error in the referent’s value.', right: true },
          { html: 'Rue’s referent value is closer to the truth than Devlin’s.', why: 'No: Rue is out by ' + t(rE) + ' cm, Devlin by only ' + t('0.1') + ' cm. Think about how many times each error is repeated.' },
          { html: 'A pace is always more accurate than a thumb, whatever the counts.', why: 'It depends on the counts and the error per placement. Work out each total error: count × error in the value.' },
          { html: 'Devlin made an arithmetic slip somewhere.', why: 'Both multiplied correctly. The difference comes from how many times each wrong value was used.' }],
          'Devlin: ' + t(F(sh.T) + '\\times0.1=' + N(dTot)) + ' cm. Rue: ' + t(sh.k + '\\times' + rE + '=' + rTot) + ' cm. In percent: ' + t('0.1\\div2.5=4.0\\%') + ' against ' + t(rE + '\\div90\\approx' + fx(rE / 90 * 100, 1) + '\\%') + '.',
          ['How many times did each of them use their wrong value?'], 'repetitions times referent error');
      } }] },
    { num: '3', stem: function (sh) { return 'Jamil is asked to estimate the ' + sh.o[0] + ', which is ' + t(fx(sh.o[1], 1)) + ' cm, and he proposes to use his pace (90 cm).'; },
      shared: function (r) { return { o: r.pick([['width of a smartphone', 7.0], ['width of a smartphone', 7.0], ['length of a debit card', 8.5], ['length of a house key', 5.5], ['width of a deck of cards', 6.3]]), q: r.pick([5, 5, 10, 2]) }; }, parts: [
      { id: 'e3a', sub: 'a', level: 'BEG', make: function (r, sh) {
        var v = sh.o[1] / 90;
        return nearPart('How many paces wide is it, to the nearest hundredth of a pace?', v, 2, 'paces', [{ v: 90 / sh.o[1], code: 'divided', hint: 'Count = length ÷ pace, so divide the object by the pace (the answer is less than 1).' }],
          t(fx(sh.o[1], 1) + '\\div90\\approx' + fx(v, 2)) + ' of a pace. No one can judge a few hundredths of a pace by eye; counted in whole paces it is 0, and the estimate would be 0 cm.', ['Count = length ÷ referent length.'], 'paces for ' + sh.o[0]);
      } },
      { id: 'e3b', sub: 'b', level: 'EMG', make: function (r, sh) {
        return fieldsPart('Suppose Jamil can judge a length only to the <b>nearest half-pace</b>. The largest error that leaves is half of a half-pace. Find that error, and express it as a percent of the object’s length (nearest tenth).',
          [{ label: 'Largest error', after: 'cm', x: 22.5, exact: true, alts: [{ v: 45, code: 'half-pace', hint: 'A half-pace is 45 cm; the largest error is <b>half</b> of that.' }] }, { label: 'Percent', after: '%', x: 22.5 / sh.o[1] * 100, dp: 1, alts: [{ v: 45 / sh.o[1] * 100, code: 'half-pace', hint: 'Use the largest error, half of a half-pace: 22.5 cm.' }, { v: sh.o[1] / 22.5 * 100, code: 'pct-base', hint: 'Percent error = error ÷ the object’s length × 100.' }] }],
          'Half-pace ' + t('=45') + ' cm; half of that is ' + t('22.5') + ' cm. ' + t('\\frac{22.5}{' + fx(sh.o[1], 1) + '}\\times100\\approx' + fx(22.5 / sh.o[1] * 100, 1) + '\\%') + ': the possible error is several times the object itself, so the estimate tells you nothing.', ['A half-pace is 45 cm.'], 'resolution error of a pace');
      } },
      { id: 'e3c', sub: 'c', level: 'ADV', make: function (r, sh) {
        var Lm = 22.5 / (sh.q / 100) / 100;
        return nearPart('Still reading to the nearest half-pace (largest error 22.5 cm), find the <b>shortest</b> object whose length a pace can estimate to within ' + t(sh.q + '\\%') + '. Give it in metres.', Lm, 2, 'm', [{ v: 45 / (sh.q / 100) / 100, code: 'half-pace', hint: 'The largest error is 22.5 cm (half of a half-pace), not 45 cm.' }, { v: 22.5 * sh.q / 100 / 100, code: 'multiplied', hint: 'Set ' + t('\\frac{22.5}{L}\\le' + sh.q / 100) + ' and solve for ' + t('L') + ': divide.' }, { v: 22.5 / (sh.q / 100), code: 'unit-slip', hint: 'That is in centimetres; give the length in metres.' }],
          t('\\frac{22.5}{L}\\le' + sh.q / 100 + '\\ \\Rightarrow\\ L\\ge\\frac{22.5}{' + sh.q / 100 + '}=' + N(22.5 / (sh.q / 100)) + '\\text{ cm}') + ' ' + t('=' + fx(Lm, 2) + '\\text{ m}') + '.', ['The error 22.5 cm must be at most ' + sh.q + '% of the length L.'], 'shortest object for ' + sh.q + '%');
      } },
      { id: 'e3d', sub: 'd', level: 'PRG', make: function (r) {
        return mc(r, 'Question 2 showed a referent far too small; question 3 shows one far too large. Which two-sided rule do they illustrate?', [
          { html: 'The referent must be small enough that the smallest step it can be read to is a small fraction of the object (or the resolution error blows up), and large enough that the count stays small (or the count, and the accumulated error, blows up).', right: true },
          { html: 'Use the smallest referent you have: more repetitions always means a better estimate.', why: 'Question 2 says otherwise: 1 260 thumb placements turned a 0.1-cm slip into more than a metre.' },
          { html: 'Use the largest referent you have: fewer repetitions always means a better estimate.', why: 'Question 3 says otherwise: a pace can’t resolve a phone at all (an error of over 300%).' },
          { html: 'The size of the referent doesn’t matter if you are careful.', why: 'Both questions had perfect counting and still went wrong — because of the referent’s size.' }],
          'Too large: the <b>resolution</b> error blows up (question 3). Too small: the <b>count</b> blows up, and with it the accumulated error (question 2). Pick a referent in between — close in size to the object.', ['What went wrong in each question, and what was the cause?'], 'two-sided referent rule');
      } }] },
    /* ---------- Part B ---------- */
    { num: '4', section: 'Extra practice B — Estimate = count × referent length, both ways', stem: 'Find each estimate, in centimetres and then in metres.', parts: [
      e4part('e4a', 'a', 'BEG', 'hand widths', 'hand', 10, 8, 19),
      e4part('e4b', 'b', 'BEG', 'paces', 'pace', 90, 15, 35),
      e4part('e4c', 'c', 'BEG', 'cubits', 'cubit', 45, 3, 9),
      e4part('e4d', 'd', 'EMG', 'thumb widths', 'thumb', 2.5, 11, 24, 2)] },
    { num: '5', stem: 'Now solve for the count: how many whole repetitions of the referent does each estimate represent?', shared: function (r) {
        var E; do { E = 10 * r.int(15, 45); } while (!((E / 45) % 1 > 0.55 && (E / 45) % 1 < 0.92));
        return { a: r.int(20, 48), b: r.int(30, 80), E: E };
      }, parts: [
      { id: 'e5a', sub: 'a', level: 'BEG', make: function (r, sh) { return e5count(fx(sh.a * 20 / 100, 2), sh.a * 20, 20, 'span', 'spans'); } },
      { id: 'e5b', sub: 'b', level: 'BEG', make: function (r, sh) { return e5count(fx(sh.b * 90 / 100, 2), sh.b * 90, 90, 'pace', 'paces'); } },
      { id: 'e5c', sub: 'c', level: 'EMG', make: function (r, sh) {
        var q = sh.E / 45, w = Math.floor(q);
        return exactPart('An estimate of ' + t(fx(sh.E / 100, 2)) + ' m using a cubit of 45 cm. How many <b>whole</b> cubits does it represent?', w, 'whole cubits', [{ v: w + 1, code: 'whole-count', hint: t(F(sh.E) + '\\div45=' + fx(q, 3) + '\\ldots') + ': only ' + w + ' <b>whole</b> cubits fit, with part of a cubit left over.' }, { v: sh.E / 100 / 45, code: 'unit-slip', hint: 'Change the metres to centimetres first.' }],
          t(F(sh.E) + '\\div45=' + fx(q, 3) + '\\ldots') + ': <b>' + w + ' whole cubits</b>, with about ' + t(fx(q - w, 2)) + ' of a cubit left over. It does not come out whole.', ['Count = estimate ÷ referent, in the same unit.'], 'whole cubits in ' + sh.E + ' cm');
      } },
      { id: 'e5d', sub: 'd i', level: 'PRG', make: function (r, sh) {
        var w = Math.round(sh.E / 45), est = 45 * w, pc = Math.abs(est - sh.E) / sh.E * 100;
        return fieldsPart('The ' + t(fx(sh.E / 100, 2)) + '-m estimate is ' + t(fx(sh.E / 45, 3) + '\\ldots') + ' cubits. Round the count to the nearest whole cubit, give the estimate that whole count produces, and the percent error that the rounding alone introduces (nearest tenth).',
          [{ label: 'Nearest whole count', after: 'cubits', x: w, exact: true, alts: [{ v: w - 1, code: 'whole-count', hint: 'Round to the <b>nearest</b> whole number this time.' }] },
            { label: 'Estimate', after: 'm', x: est / 100, exact: true, alts: unitAlts(est / 100, 'm') },
            { label: 'Percent error', after: '%', x: pc, dp: 1, alts: [{ v: Math.abs(est - sh.E) / est * 100, code: 'pct-base', hint: 'Compare with the original ' + fx(sh.E / 100, 2) + ' m: divide by it.' }] }],
          'Nearest whole: ' + t(w) + ' cubits ' + t('\\rightarrow' + w + '\\times45=' + est + '\\text{ cm}=' + fx(est / 100, 2) + '\\text{ m}') + '. ' + t('\\frac{' + est + '-' + sh.E + '}{' + sh.E + '}\\times100\\approx' + fx(pc, 1) + '\\%') + '.', ['Round, multiply back by 45 cm, then compare with the original estimate.'], 'rounding a cubit count');
      } },
      { id: 'e5e', sub: 'd ii', level: 'EMG', make: function (r, sh) {
        return mc(r, 'Which referent from the list (thumb, hand, span, cubit, pace, doorway) would have made the rounding in (d i) matter less for this length — and why?', [
          { html: 'The span (20 cm): rounding to a whole span is off by at most half a span, 10 cm, against half a cubit, 22.5 cm.', right: true },
          { html: 'The pace (90 cm): bigger referents mean fewer repetitions.', why: 'Rounding to a whole pace can be off by up to 45 cm — worse, not better.' },
          { html: 'The doorway (200 cm): the length is close to one doorway.', why: 'Rounding to a whole doorway can be off by up to 100 cm.' },
          { html: 'None: the rounding error is the same for every referent.', why: 'The largest rounding error is half of one referent, so it depends on the referent’s size.' }],
          'Rounding a count to a whole number is off by at most half a referent. Half a span is 10 cm, half a cubit 22.5 cm, so the span makes the rounding matter less. (But a smaller referent means more placements — see Part C — so the best referent balances the two.)', ['What is the largest error when you round a count to the nearest whole number?'], 'referent for less rounding error');
      } }] },
    { num: '6', stem: function (sh) { return 'Priya paces a corridor that a tape measure gives as ' + t(fx(sh.n * sh.p / 100, 2)) + ' m, and it takes her exactly ' + t(sh.n) + ' paces.'; },
      shared: function (r) { return { p: r.pick([96, 96, 84, 86, 88, 92, 94, 98, 100]), n: r.int(20, 30), m: r.int(12, 30) }; }, parts: [
      { id: 'e6a', sub: 'a', level: 'EMG', make: function (r, sh) {
        var L = sh.n * sh.p;
        return exactPart('Solve estimate = count × referent length for the referent length, and find Priya’s true pace in centimetres.', sh.p, 'cm', [{ v: L / 100 / sh.n, code: 'unit-slip', hint: 'That is in metres. Change the corridor to centimetres first.' }, { v: sh.n / (L / 100), code: 'divided', hint: 'Referent = estimate ÷ count (the length divided by the number of paces).' }],
          t('\\text{referent}=\\frac{\\text{estimate}}{\\text{count}}=\\frac{' + F(L) + '\\text{ cm}}{' + sh.n + '}=' + sh.p + '\\text{ cm}') + '.', ['Referent length = length ÷ count. Work in centimetres.'], 'true pace ' + sh.p);
      } },
      { id: 'e6b', sub: 'b i', level: 'EMG', make: function (r, sh) {
        var small = sh.p > 90;
        return mc2(r, 'Priya has always used 90 cm as her pace (her true pace is ' + t(sh.p) + ' cm). Were her past estimates too large or too small?', [
          { html: '<b>Too small</b>', right: small, why: small ? null : 'She multiplied by 90 when each pace is really only ' + sh.p + ' cm, so she credited each pace with too much.' },
          { html: '<b>Too large</b>', right: !small, why: !small ? null : 'She multiplied by 90 when each pace is really ' + sh.p + ' cm, so every estimate fell short.' }],
          'She multiplied each count by 90 cm instead of ' + sh.p + ' cm, so every estimate came out <b>' + (small ? 'too small' : 'too large') + '</b>.', [], 'direction of pace error');
      } },
      { id: 'e6c', sub: 'b ii', level: 'PRG', make: function (r, sh) {
        var pc = Math.abs(sh.p - 90) / sh.p * 100;
        return nearPart('By what percent of the true length were Priya’s past estimates off? (true pace ' + t(sh.p) + ' cm, value used 90 cm; nearest hundredth of a percent)', pc, 2, '%', [{ v: Math.abs(sh.p - 90) / 90 * 100, code: 'pct-base', hint: 'The percent is of the <b>true</b> length, so divide by the true pace, ' + sh.p + ' cm.' }, { v: Math.abs(sh.p - 90), code: 'pct-abs', hint: 'That is the error per pace in centimetres. Divide by the true pace and multiply by 100.' }],
          t('\\frac{|' + sh.p + '-90|}{' + sh.p + '}\\times100\\approx' + fx(pc, 2) + '\\%') + ' of the true length, every time — however many paces she took.', ['Error per pace ÷ true pace × 100.'], 'pace percent error');
      } },
      { id: 'e6d', sub: 'c', level: 'PRG', make: function (r, sh) {
        var F0 = sh.m * 90, tr = sh.m * sh.p;
        return fieldsPart('Last week Priya reported a fence as ' + t(fx(F0 / 100, 2)) + ' m, using 90 cm per pace. Recover her pace count, then give the fence’s true length (her true pace is ' + t(sh.p) + ' cm).',
          [{ label: 'Pace count', x: sh.m, exact: true, alts: [{ v: F0 / sh.p, code: 'divided', hint: 'She multiplied by <b>90</b> to get her report, so divide the report by 90.' }] },
            { label: 'True length', after: 'm', x: tr / 100, dp: 2, exact: true, alts: [{ v: F0 * 90 / sh.p / 100, code: 'divided', hint: 'Her true pace is ' + (sh.p > 90 ? 'longer' : 'shorter') + ' than 90 cm, so the true fence is ' + (sh.p > 90 ? 'longer' : 'shorter') + ' than she reported.' }].concat(unitAlts(tr / 100, 'm')) }],
          'Count: ' + t(F(F0) + '\\div90=' + sh.m) + ' paces. True length: ' + t(sh.m + '\\times' + sh.p + '=' + F(tr) + '\\text{ cm}=' + fx(tr / 100, 2) + '\\text{ m}') + '.', ['Undo her multiplication, then multiply by the true pace.'], 'recover fence length');
      } }] },
    /* ---------- Part C ---------- */
    { num: '7', section: 'Extra practice C — Accumulated error: what the count multiplies', stem: function (sh) { return 'Theo’s span is truly ' + t(fx(sh.t, 1)) + ' cm, but he uses 20 cm as its value.'; },
      shared: function (r) { var n = r.pick([20, 20, 10, 30]); return { t: r.pick([19.5, 19.5, 19, 18.5]), n1: n, n2: 3 * n }; }, parts: [
      { id: 'e7a', sub: 'a', level: 'EMG', make: function (r, sh) { return e7part(sh, sh.n1, 'a countertop'); } },
      { id: 'e7b', sub: 'b', level: 'EMG', make: function (r, sh) { return e7part(sh, sh.n2, 'a wall'); } },
      { id: 'e7c', sub: 'c', level: 'EMG', make: function (r, sh) {
        var a = sh.n1 * (20 - sh.t), A = sh.n1 * sh.t, b = sh.n2 * (20 - sh.t), B = sh.n2 * sh.t;
        return fieldsPart('Find the percent error of each estimate, to the nearest tenth: the ' + t(sh.n1) + '-span countertop (error ' + t(N(a)) + ' cm on ' + t(N(A)) + ' cm) and the ' + t(sh.n2) + '-span wall (error ' + t(N(b)) + ' cm on ' + t(N(B)) + ' cm).',
          [{ label: 'Countertop', after: '%', x: a / A * 100, dp: 1, alts: percAlts(sh.n1 * 20, A) }, { label: 'Wall', after: '%', x: b / B * 100, dp: 1, alts: percAlts(sh.n2 * 20, B) }],
          t('\\frac{' + N(a) + '}{' + N(A) + '}\\times100\\approx' + fx(a / A * 100, 1) + '\\%') + ' and ' + t('\\frac{' + N(b) + '}{' + N(B) + '}\\times100\\approx' + fx(b / B * 100, 1) + '\\%') + ' — identical, not merely close.', ['Percent error = error ÷ true length × 100.'], 'percent error unchanged by count');
      } },
      { id: 'e7d', sub: 'd', level: 'PRG', make: function (r, sh) {
        var e = fx(20 - sh.t, 1);
        return mc(r, 'The error in centimetres tripled from the countertop to the wall, but the percent error did not move at all. Why — and which number should be quoted to describe how good an estimate is?', [
          { html: 'Tripling the count triples both the error and the true length, so the count cancels: ' + t('\\frac{n(' + e + ')}{n(' + fx(sh.t, 1) + ')}=\\frac{' + e + '}{' + fx(sh.t, 1) + '}') + '. Quote the <b>percent</b> error.', right: true },
          { html: 'Both are the same because Theo counted more carefully on the wall. Quote the centimetre error.', why: 'He counted perfectly both times. The centimetre error grows with the count; the percent doesn’t.' },
          { html: 'The percent error only looks the same because of rounding. Quote the centimetre error.', why: 'Work both to more decimals — they are exactly equal.' },
          { html: 'The count cancels, so quote the centimetre error, since it shows how far off he was.', why: 'The centimetre error depends on how long the object happened to be; the percent describes the method itself.' }],
          'Error ' + t('=n(' + e + ')') + ', true length ' + t('=n(' + fx(sh.t, 1) + ')') + ': the count ' + t('n') + ' cancels in the percent error. Quote the percent error — it describes the method, not the size of the object.', ['Write the error and the true length in terms of the count n.'], 'why percent error is unchanged');
      } }] },
    { num: '8', stem: function (sh) { return 'Dara and Rowan estimate the same hallway, which a tape gives as ' + t(fx(sh.L / 100, 2)) + ' m. Dara’s span is truly 18.0 cm and she uses 20 cm; Rowan’s pace is truly 90.0 cm and he uses 95 cm. Both count perfectly.'; },
      shared: function (r) { var k = r.pick([12, 12, 10, 11, 13, 14]); return { L: 90 * k, d: k * 5, w: k, e: r.pick([0.4, 0.4, 0.3, 0.5]) }; }, parts: [
      { id: 'e8a', sub: 'a', level: 'EMG', make: function (r, sh) {
        return fieldsPart('Find each student’s count from the true referent lengths, then each student’s estimate in metres.',
          [{ label: 'Dara’s spans', x: sh.d, exact: true, alts: [{ v: sh.L / 20, code: 'used-assumed', hint: 'The count comes from the <b>true</b> span, 18 cm.' }] }, { label: 'Rowan’s paces', x: sh.w, exact: true, alts: [{ v: sh.L / 95, code: 'used-assumed', hint: 'The count comes from the <b>true</b> pace, 90 cm.' }] },
            { label: 'Dara’s estimate', after: 'm', x: sh.d * 20 / 100, dp: 2, exact: true, alts: [{ v: sh.L / 100, code: 'used-true', hint: 'Dara multiplies her count by the value she <b>uses</b>, 20 cm.' }] }, { label: 'Rowan’s estimate', after: 'm', x: sh.w * 95 / 100, dp: 2, exact: true, alts: [{ v: sh.L / 100, code: 'used-true', hint: 'Rowan multiplies his count by the value he <b>uses</b>, 95 cm.' }] }],
          t(F(sh.L) + '\\div18=' + sh.d) + ' spans, ' + t(F(sh.L) + '\\div90=' + sh.w) + ' paces.<br>Dara: ' + t(sh.d + '\\times20=' + F(sh.d * 20) + '\\text{ cm}=' + fx(sh.d * 0.2, 2) + '\\text{ m}') + '. Rowan: ' + t(sh.w + '\\times95=' + F(sh.w * 95) + '\\text{ cm}=' + fx(sh.w * 0.95, 2) + '\\text{ m}') + '.', ['Counts use the true lengths; estimates use the values they assumed.'], 'two students counts and estimates');
      } },
      { id: 'e8b', sub: 'b', level: 'PRG', make: function (r, sh) {
        return fieldsPart('Find each student’s percent error (nearest tenth). (Dara estimated ' + t(fx(sh.d * 0.2, 2)) + ' m, Rowan ' + t(fx(sh.w * 0.95, 2)) + ' m; the tape says ' + t(fx(sh.L / 100, 2)) + ' m.)',
          [{ label: 'Dara', after: '%', x: 100 / 9, dp: 1, alts: percAlts(sh.d * 20, sh.L) }, { label: 'Rowan', after: '%', x: 50 / 9, dp: 1, alts: percAlts(sh.w * 95, sh.L) }],
          'Dara: ' + pctTex(F(sh.d * 20), F(sh.L)) + '. Rowan: ' + pctTex(F(sh.w * 95), F(sh.L)) + '.<br>Each equals the error in the referent <b>value</b> as a percent of the true referent: ' + t('\\frac{2}{18}\\approx11.1\\%') + ', ' + t('\\frac{5}{90}\\approx5.6\\%') + '.', ['Percent error = |estimate − tape| ÷ tape × 100.'], 'two students percent errors');
      } },
      { id: 'e8c', sub: 'c', level: 'PRG', make: function (r) {
        return mc(r, 'Rowan’s referent value is wrong by 5 cm and Dara’s by only 2 cm, yet Rowan’s estimate is twice as good. Which explains the apparent contradiction?', [
          { html: 'What matters is the error as a <b>fraction of the referent</b>: 5 cm is only ' + t('\\tfrac{5}{90}') + ' of a pace, while 2 cm is ' + t('\\tfrac{2}{18}') + ' of a span — twice as large a share.', right: true },
          { html: 'Rowan counted more carefully than Dara.', why: 'Both counted perfectly. Compare each error with the size of its referent.' },
          { html: 'A bigger error in centimetres always gives a smaller percent error.', why: 'Not always — it depends on the size of the referent it is compared with.' },
          { html: 'Dara’s hallway was longer.', why: 'It is the same hallway. Compare each referent error with its referent.' }],
          'A referent error repeats with every placement, so the percent error equals the referent error ÷ the true referent: ' + t('\\tfrac{5}{90}\\approx5.6\\%') + ' for Rowan, ' + t('\\tfrac{2}{18}\\approx11.1\\%') + ' for Dara.', ['Compare each error with the length of its own referent.'], 'error as a fraction of the referent');
      } },
      { id: 'e8d', sub: 'd i', level: 'EMG', make: function (r, sh) {
        return fieldsPart('Suppose instead both knew their referent lengths exactly, but each placement can be out by up to ' + t(sh.e) + ' cm. Find the worst-case total for each student (Dara ' + t(sh.d) + ' spans, Rowan ' + t(sh.w) + ' paces).',
          [{ label: 'Dara', after: 'cm', x: rnd(sh.d * sh.e, 4), exact: true, alts: [] }, { label: 'Rowan', after: 'cm', x: rnd(sh.w * sh.e, 4), exact: true, alts: [] }],
          'Dara: ' + t(sh.d + '\\times' + sh.e + '=' + N(sh.d * sh.e)) + ' cm. Rowan: ' + t(sh.w + '\\times' + sh.e + '=' + N(sh.w * sh.e)) + ' cm.', ['Worst case = number of placements × the error per placement.'], 'placement error totals');
      } },
      { id: 'e8e', sub: 'd ii', level: 'EMG', make: function (r, sh) {
        return mc(r, 'What does the placement error in (d i) add to the case for the larger referent?', [
          { html: 'Placement error grows with the count and does not cancel out of the percent error, so even with perfect referent values the larger referent wins: it is laid down far fewer times.', right: true },
          { html: 'Nothing: placement error cancels out of the percent error, like the referent-value error.', why: 'It doesn’t: the true length stays the same while the placement error grows with the count.' },
          { html: 'It favours the smaller referent, because each of its placements is small.', why: 'Each placement can be out by the same ' + sh.e + ' cm whatever the referent; the small referent needs more placements.' },
          { html: 'It shows the two methods are equally good.', why: 'Compare the totals: ' + N(sh.d * sh.e) + ' cm against ' + N(sh.w * sh.e) + ' cm.' }],
          t(N(sh.d * sh.e)) + ' cm against ' + t(N(sh.w * sh.e)) + ' cm: the referent laid down ' + (sh.d / sh.w) + ' times less often wins, even when both referent values are perfect.', ['Does this error depend on how many times the referent is placed?'], 'placement error favours larger referent');
      } }] },
    { num: '9', stem: function (sh) { var v = sh.v; return 'An object of true length ' + t('L') + ' is covered by exactly ' + t(v.n) + ' repetitions of a referent whose true length is ' + t(v.t) + ', so ' + t('L=' + v.n + v.t) + '. The estimate is made by multiplying the count by an assumed referent length ' + t(v.a) + '.'; },
      shared: function (r) { return { v: r.pick([{ n: 'n', a: 'a', t: 't' }, { n: 'n', a: 'a', t: 't' }, { n: 'k', a: 'r', t: 's' }, { n: 'c', a: 'u', t: 'v' }]) }; }, parts: [
      { id: 'e9a', sub: 'a', level: 'EMG', make: function (r, sh) {
        var v = sh.v, p = K.P.poly('Write the estimate ' + t('E') + ' in terms of ' + t(v.n) + ' and ' + t(v.a) + '.', v.n + v.a, { before: t('E='), keyTex: v.n + v.a, vars: [v.n, v.a, v.t], wrong: [{ is: v.n + v.t, code: 'used-true', hint: 'That is the <b>true</b> length ' + t('L') + '. The estimate multiplies the count by the <b>assumed</b> length ' + t(v.a) + '.' }] },
          'Estimate = count × assumed referent length: ' + t('E=' + v.n + v.a) + '.', ['Estimate = count × the referent length you assumed.'], 'E in terms of n and a');
        p.bad = [v.n + v.t, v.n + '+' + v.a];
        return p;
      } },
      { id: 'e9b', sub: 'b', level: 'PRG', make: function (r, sh) {
        var v = sh.v, base = K.poly(v.n + v.a + '-' + v.n + v.t, { expanded: false });
        var chk = function (resp) {
          var res = base(resp); if (res.v !== 'correct') { if (res.v === 'wrong' && res.code === 'sign-all') return wrong('sign', 'Check the order: the error is estimate minus true length, ' + t('E-L') + '.'); return res; }
          if (!/\(/.test(String(resp).replace(/\\left/g, ''))) return form('factor', 'Right expression — now <b>factor</b> it: take out the common factor ' + t(v.n) + '.');
          return ok();
        };
        var p = P.math('Write the absolute error ' + t('E-L') + ' in terms of ' + t(v.n) + ', ' + t(v.a) + ' and ' + t(v.t) + ', factored.', chk, v.n + '(' + v.a + '-' + v.t + ')',
          t('E-L=' + v.n + v.a + '-' + v.n + v.t + '=' + v.n + '(' + v.a + '-' + v.t + ')') + '.', ['Subtract ' + t('L=' + v.n + v.t) + ' from ' + t('E=' + v.n + v.a) + ', then take out the common factor.'], 'factored absolute error', { keys: 'poly', vars: [v.n, v.a, v.t], before: t('E-L=') });
        p.good = ['(' + v.a + '-' + v.t + ')' + v.n]; p.bad = [v.n + v.a + '-' + v.n + v.t, v.n + '(' + v.t + '-' + v.a + ')'];
        return p;
      } },
      { id: 'e9c', sub: 'c', level: 'PRG', make: function (r, sh) {
        var v = sh.v, A = v.a, Tt = v.t, n = v.n;
        return mc(r, 'Write the percent error and simplify it as far as it will go.', [
          { html: t('\\frac{|' + A + '-' + Tt + '|}{' + Tt + '}\\times100'), right: true },
          { html: t('\\frac{|' + A + '-' + Tt + '|}{' + A + '}\\times100'), why: 'Percent error divides by the <b>true</b> length ' + t('L=' + n + Tt) + ', so the denominator becomes ' + t(Tt) + ', not ' + t(A) + '.' },
          { html: t('|' + n + '(' + A + '-' + Tt + ')|\\times100'), why: 'You still have to divide by the true length ' + t('L=' + n + Tt) + '.' },
          { html: t('\\frac{|' + A + '-' + Tt + '|}{' + n + Tt + '}\\times100'), why: 'The ' + t(n) + ' in the error ' + t(n + '(' + A + '-' + Tt + ')') + ' cancels the ' + t(n) + ' in ' + t('L=' + n + Tt) + ' — it doesn’t stay in the denominator.' }],
          t('\\frac{|E-L|}{L}\\times100=\\frac{|' + n + '(' + A + '-' + Tt + ')|}{' + n + Tt + '}\\times100=\\frac{|' + A + '-' + Tt + '|}{' + Tt + '}\\times100') + '. The count cancels: the percent error does not depend on how many repetitions were made.', ['Percent error = |E − L| ÷ L × 100. Substitute and cancel.'], 'percent error formula');
      } },
      { id: 'e9d', sub: 'd', level: 'PRG', make: function (r, sh) {
        var v = sh.v;
        return mc(r, 'Parts (b) and (c) say two different things about using a small referent many times. Which pair of statements is correct?', [
          { html: '(b): the absolute error is proportional to the count, so it grows with many repetitions. (c): the percent error does not depend on the count at all.', right: true },
          { html: '(b): the absolute error does not depend on the count. (c): the percent error grows with the count.', why: 'Look again: ' + t(v.n) + ' is a factor of the error in (b), and it cancels in (c).' },
          { html: 'Both errors grow with the count.', why: 'In (c) the ' + t(v.n) + ' cancels.' },
          { html: 'Neither error depends on the count.', why: 'In (b) the error is ' + t(v.n) + ' times ' + t('(' + v.a + '-' + v.t + ')') + '.' }],
          'From (b), ' + t(v.n + '(' + v.a + '-' + v.t + ')') + ': the error in centimetres is proportional to the count (question 7: 20 spans gave 10 cm, 60 spans gave 30 cm). From (c), the count cancels: question 7’s two estimates were both out by 2.6%.', ['Where does the count appear in each formula?'], 'absolute vs percent error and count');
      } },
      { id: 'e9e', sub: 'e', level: 'PRG', make: function (r) {
        return mc(r, 'What does a real estimate suffer from that the formula in (c) cannot see?', [
          { html: 'Placement and counting error — each placement can land a little short or long, and the count can be lost. It <b>does</b> grow with the count (question 8(d)).', right: true },
          { html: 'Arithmetic errors, which grow with the count.', why: 'The formula assumes the arithmetic is right; the real-world problem is in placing and counting the referent.' },
          { html: 'Nothing: the formula covers every source of error.', why: 'It assumes exactly n perfect placements. What happens in real life each time you pick up the referent and put it down?' },
          { html: 'Unit-conversion error, which shrinks as the count grows.', why: 'Conversions don’t depend on the count. Think about laying the referent down again and again.' }],
          'The formula assumes exactly ' + t('n') + ' perfect placements. In reality each placement may land a little short or long, and over many repetitions the count itself can be lost; that error grows with ' + t('n') + ' (question 8(d), and question 17).', ['Think about what actually happens each time you lay the referent down.'], 'placement error not in formula');
      } }] },
    /* ---------- Part D ---------- */
    { num: '10', section: 'Extra practice D — Percent error, and “good enough for what?”', stem: 'Find the percent error of each estimate, to the nearest tenth of a percent: ' + t('\\text{percent error}=\\frac{|\\text{estimate}-\\text{measured}|}{\\text{measured}}\\times100\\%') + '.',
      shared: function (r) {
        for (var g = 0; g < 500; g++) {
          var m1 = 3 + 0.05 * r.int(0, 12), d1 = 0.01 * r.int(13, 17), e1 = rnd(m1 + (r.chance(0.6) ? d1 : -d1), 2);
          var m2 = r.int(70, 95), d2 = r.int(3, 5), e2 = m2 + (r.chance(0.6) ? -d2 : d2);
          var m3 = rnd(11 + 0.1 * r.int(0, 30), 1), d3 = rnd(0.1 * r.int(5, 7), 1), e3 = rnd(m3 + (r.chance(0.5) ? -d3 : d3), 1);
          var p = [pct(e1, m1), pct(e2, m2), pct(e3, m3)], q = p.map(function (x) { return rnd(x, 1); });
          if (q[0] === q[1] || q[1] === q[2] || q[0] === q[2]) continue;
          if (!(q[1] > q[0] && q[1] > q[2])) continue;
          if (Math.max.apply(null, p) > 6 || Math.min.apply(null, p) < 3.5) continue;
          return { a: [e1, m1, 'm', 2], b: [e2, m2, 'cm', 0], c: [e3, m3, 'm', 1], p: p };
        }
        return { a: [3.40, 3.25, 'm', 2], b: [78, 82, 'cm', 0], c: [12.0, 12.6, 'm', 1], p: [pct(3.4, 3.25), pct(78, 82), pct(12, 12.6)] };
      }, parts: [
      { id: 'e10a', sub: 'a', level: 'EMG', make: function (r, sh) { return e10part(sh.a, 'a'); } },
      { id: 'e10b', sub: 'b', level: 'EMG', make: function (r, sh) { return e10part(sh.b, 'b'); } },
      { id: 'e10c', sub: 'c', level: 'EMG', make: function (r, sh) { return e10part(sh.c, 'c'); } },
      { id: 'e10d', sub: 'd i', level: 'PRG', make: function (r, sh) {
        var items = ['a', 'b', 'c'].map(function (k, i) { var v = sh[k]; return { id: k, tex: '(' + k + ')', html: '(' + k + ') ' + t(fx(v[0], v[3]) + '\\text{ ' + v[2] + '} \\text{ vs } ' + fx(v[1], v[3]) + '\\text{ ' + v[2] + '}'), p: sh.p[i] }; });
        items.sort(function (x, y) { return x.p - y.p; });
        var p = P.order(r, 'Rank the three estimates from <b>best</b> (smallest percent error) to <b>worst</b>.', items, { first: 'best', last: 'worst' },
          items.map(function (x) { return x.html + ': ' + t(fx(x.p, 1) + '\\%'); }).join('<br>'), ['Work out the percent error of each one first.'], 'rank estimates by percent error');
        return p;
      } },
      { id: 'e10e', sub: 'd ii', level: 'EMG', make: function (r, sh) {
        var b = sh.b, ab = Math.abs(sh.a[0] - sh.a[1]) * 100, cb = Math.abs(sh.c[0] - sh.c[1]) * 100;
        return mc(r, 'Estimate (b) is off by only ' + t(Math.abs(b[0] - b[1])) + ' cm — far less than (a) (' + t(N(ab)) + ' cm) or (c) (' + t(N(cb)) + ' cm) — and yet it is the worst of the three. What does that show?', [
          { html: 'An absolute error means little until it is compared with the size of the thing measured: judge an estimate by its <b>percent</b> error.', right: true },
          { html: 'The percent errors must have been calculated wrongly.', why: 'Recheck: (b)’s ' + Math.abs(b[0] - b[1]) + ' cm is out of only ' + b[1] + ' cm, a bigger share than the others.' },
          { html: 'Estimates in centimetres are always worse than estimates in metres.', why: 'The unit isn’t the issue — the size of the error compared with the size of the object is.' },
          { html: 'The smallest error in centimetres is always the best estimate.', why: 'That is exactly what (b) disproves.' }],
          Math.abs(b[0] - b[1]) + ' cm is a large share of a ' + b[1] + '-cm object but a tiny share of a ' + fx(sh.c[1], 1) + '-m one. Judge an estimate by its percent error.', ['Compare each error with the length of its own object.'], 'absolute vs percent error');
      } }] },
    { num: '11', stem: function (sh) { return 'A rectangular room’s two walls are measured with a tape as ' + t(fx(sh.w1, 2)) + ' m and ' + t(fx(sh.w2, 2)) + ' m. Estimating with a pace, a student reports them as ' + t(fx(sh.e1, 2)) + ' m and ' + t(fx(sh.e2, 2)) + ' m.'; },
      shared: function (r) {
        for (var g = 0; g < 500; g++) {
          var w1 = rnd(2.3 + 0.02 * r.int(0, 20), 2), w2 = rnd(2.9 + 0.02 * r.int(0, 30), 2), e1 = rnd(w1 * (1 + 0.01 * r.int(6, 12)), 1), e2 = rnd(w2 * (1 + 0.01 * r.int(10, 18)), 1);
          var b1 = Math.ceil(w1 * w2 * 1.1 / 2.2 - 1e-9), b2 = Math.ceil(e1 * e2 * 1.1 / 2.2 - 1e-9);
          if (b2 === b1 + 1 && Math.abs(w1 * w2 * 1.1 / 2.2 - Math.round(w1 * w2 * 1.1 / 2.2)) > 0.05 && Math.abs(e1 * e2 * 1.1 / 2.2 - Math.round(e1 * e2 * 1.1 / 2.2)) > 0.05) return { w1: w1, w2: w2, e1: e1, e2: e2, b1: b1, b2: b2 };
        }
        return { w1: 2.48, w2: 3.10, e1: 2.70, e2: 3.60, b1: 4, b2: 5 };
      }, parts: [
      { id: 'e11a', sub: 'a', level: 'EMG', make: function (r, sh) {
        return fieldsPart('Find the percent error of each estimate (nearest tenth).', [{ label: fx(sh.w1, 2) + ' m wall', after: '%', x: pct(sh.e1, sh.w1), dp: 1, alts: percAlts(sh.e1, sh.w1) }, { label: fx(sh.w2, 2) + ' m wall', after: '%', x: pct(sh.e2, sh.w2), dp: 1, alts: percAlts(sh.e2, sh.w2) }],
          pctTex(fx(sh.e1, 2), fx(sh.w1, 2)) + '<br>' + pctTex(fx(sh.e2, 2), fx(sh.w2, 2)), ['Divide each error by the measured length, then × 100.'], 'room walls percent error');
      } },
      { id: 'e11b', sub: 'b', level: 'BEG', make: function (r, sh) {
        var d = rnd((sh.e1 - sh.w1) * 100, 4);
        return exactPart('<b>Hanging a shelf.</b> A shelf is cut to the estimate, ' + t(fx(sh.e1, 2)) + ' m, to fit snugly between the two walls that are really ' + t(fx(sh.w1, 2)) + ' m apart. By how many centimetres would it be too long?', d, 'cm', unitAlts(d, 'cm'),
          t(fx(sh.e1, 2) + '-' + fx(sh.w1, 2) + '=' + fx(d / 100, 2) + '\\text{ m}=' + N(d) + '\\text{ cm}') + ' too long: it won’t go in. A shelf is cut <b>to</b> the number, so the estimate is not good enough; use a tape measure.', ['Subtract, then change metres to centimetres.'], 'shelf too long');
      } },
      { id: 'e11c', sub: 'c', level: 'PRG', make: function (r, sh) {
        var A1 = sh.w1 * sh.w2, A2 = sh.e1 * sh.e2;
        return fieldsPart('<b>Ordering flooring.</b> Laminate is sold only in whole boxes, each covering ' + t('2.2\\text{ m}^2') + ', and the installer adds ' + t('10\\%') + ' for waste before rounding up to the next whole box. How many boxes do the measured lengths call for, and how many do the estimated lengths call for?',
          [{ label: 'From the measured lengths', after: 'boxes', x: sh.b1, exact: true, alts: [{ v: Math.ceil(A1 / 2.2 - 1e-9), code: 'no-waste', hint: 'Add the 10% waste first (× 1.1).' }, { v: Math.floor(A1 * 1.1 / 2.2), code: 'round-up', hint: 'Boxes are bought whole: round <b>up</b>.' }].filter(function (a) { return a.v !== sh.b1; }) },
            { label: 'From the estimated lengths', after: 'boxes', x: sh.b2, exact: true, alts: [{ v: Math.ceil(A2 / 2.2 - 1e-9), code: 'no-waste', hint: 'Add the 10% waste first (× 1.1).' }, { v: Math.floor(A2 * 1.1 / 2.2), code: 'round-up', hint: 'Boxes are bought whole: round <b>up</b>.' }].filter(function (a) { return a.v !== sh.b2; }) }],
          'Measured: ' + t(fx(sh.w1, 2) + '\\times' + fx(sh.w2, 2) + '=' + N(rnd(A1, 4)) + '\\text{ m}^2') + ', ' + t('\\times1.1=' + N(rnd(A1 * 1.1, 4))) + ', ' + t('\\div2.2\\approx' + fx(A1 * 1.1 / 2.2, 2) + '\\rightarrow' + sh.b1) + ' boxes.<br>Estimated: ' + t(fx(sh.e1, 2) + '\\times' + fx(sh.e2, 2) + '=' + N(rnd(A2, 4))) + ', ' + t('\\times1.1=' + N(rnd(A2 * 1.1, 4))) + ', ' + t('\\div2.2\\approx' + fx(A2 * 1.1 / 2.2, 2) + '\\rightarrow' + sh.b2) + ' boxes. The estimate costs one unnecessary box.',
          ['Area × 1.1, then ÷ 2.2, then round up.'], 'flooring boxes');
      } },
      { id: 'e11d', sub: 'd', level: 'PRG', make: function (r, sh) {
        return mc(r, 'One of these purposes (the shelf, the flooring) tolerates an error of about ' + t(fx(pct(sh.e1, sh.w1), 0) + '\\%') + ' and the other does not. Which is which, and why?', [
          { html: 'The flooring tolerates it — it already has a margin (10% waste, rounding up to whole boxes); the shelf does not — it is cut <b>to</b> the number.', right: true },
          { html: 'The shelf tolerates it, because a shelf is shorter than a floor.', why: 'A shelf cut ' + N(rnd((sh.e1 - sh.w1) * 100, 4)) + ' cm too long won’t fit at all.' },
          { html: 'Neither tolerates any error, because every estimate must be exact.', why: 'Some purposes have a margin built in: an extra box of flooring doesn’t ruin the job.' },
          { html: 'Both tolerate it, because the error is under 10%.', why: 'The shelf is cut to the number: being several centimetres too long means it doesn’t fit.' }],
          'A purpose tolerates estimation error when it has a <b>margin</b> built in — a waste allowance, rounding up, room to spare. Anything cut, machined or set to the measured number tolerates none.', ['What happens in each job if the length is a bit off?'], 'which purpose tolerates error');
      } }] },
    /* ---------- Part E ---------- */
    { num: '12', section: 'Extra practice E — Referents in both systems', stem: function (sh) { return 'Ori estimates the length of a desk twice: once with his span, taken as 20 cm, and once with his shoe, taken as 12 in. He counts ' + t(sh.s) + ' spans, and separately ' + t(sh.h) + ' shoe lengths. (' + t('1\\text{ in}=2.54\\text{ cm}') + ')'; },
      shared: function (r) { for (var g = 0; g < 100; g++) { var h = r.pick([6, 6, 3]), s = Math.round(1.524 * h) + r.pick([0, 0, -1, 1]), dd = Math.abs(20 * s - 30.48 * h) / (30.48 * h); if (dd > 0.002 && dd < 0.1) return { h: h, s: s }; } return { h: 6, s: 9 }; }, parts: [
      { id: 'e12a', sub: 'a', level: 'BEG', make: function (r, sh) { var c = 20 * sh.s; return fieldsPart('Give the SI estimate in centimetres and in metres.', [{ label: 'SI estimate', after: 'cm', x: c, exact: true, alts: [] }, { label: '', name: 'In metres', after: 'm', x: c / 100, exact: true, alts: unitAlts(c / 100, 'm') }], t(sh.s + '\\times20=' + c + '\\text{ cm}=' + fx(c / 100, 2) + '\\text{ m}') + '.', ['Count × referent.'], 'SI desk estimate'); } },
      { id: 'e12b', sub: 'b', level: 'EMG', outcome: M2, make: function (r, sh) {
        var i = 12 * sh.h;
        return fieldsPart('Give the imperial estimate in inches, then in feet, then in yards.', [{ label: 'Inches', after: 'in', x: i, exact: true, alts: [] }, { label: 'Feet', after: 'ft', x: i / 12, exact: true, alts: [{ v: i * 12, code: 'multiplied', hint: 'There are fewer feet than inches: divide by 12.' }] }, { label: 'Yards', after: 'yd', x: i / 36, exact: true, alts: [{ v: i / 12 * 3, code: 'multiplied', hint: 'There are fewer yards than feet: divide by 3.' }] }],
          t(sh.h + '\\times12=' + i + '\\text{ in}') + '; ' + t(i + '\\div12=' + i / 12 + '\\text{ ft}') + '; ' + t(i / 12 + '\\div3=' + i / 36 + '\\text{ yd}') + '.', ['1 ft = 12 in, 1 yd = 3 ft.'], 'imperial desk estimate');
      } },
      { id: 'e12c', sub: 'c', level: 'PRG', outcome: M2, make: function (r, sh) {
        var i = 12 * sh.h, c = rnd(i * 2.54, 4), si = 20 * sh.s, d = rnd(Math.abs(c - si), 4);
        return fieldsPart('Convert the imperial estimate (' + t(i) + ' in) to centimetres, then state by how many centimetres the two estimates disagree (the SI estimate is ' + t(si) + ' cm) and what percent of the imperial estimate that is (nearest tenth).',
          [{ label: 'Imperial estimate', after: 'cm', x: c, exact: true, alts: [{ v: i / 2.54, code: 'divided', hint: 'Centimetres are smaller than inches, so there are <b>more</b> of them: multiply by 2.54.' }] }, { label: 'Disagreement', after: 'cm', x: d, exact: true, alts: [] }, { label: 'Percent', after: '%', x: d / c * 100, dp: 1, alts: [{ v: d / si * 100, code: 'pct-base', hint: 'The question asks for a percent of the <b>imperial</b> estimate.' }] }],
          t(i + '\\times2.54=' + N(c) + '\\text{ cm}') + '. ' + t('|' + N(c) + '-' + si + '|=' + N(d)) + ' cm. ' + t('\\frac{' + N(d) + '}{' + N(c) + '}\\times100\\approx' + fx(d / c * 100, 1) + '\\%') + '.', ['Inches × 2.54 = centimetres.'], 'compare SI and imperial estimates');
      } },
      { id: 'e12d', sub: 'd', level: 'EMG', make: function (r, sh) {
        return mc(r, 'Both estimates came from the same desk and the same person. What is the most likely reason they disagree, and what single measurement would settle which referent value is at fault?', [
          { html: 'At least one referent <b>value</b> is off (his span isn’t exactly 20 cm, or his shoe isn’t exactly 12 in). Measure the desk with a tape, then divide by ' + sh.s + ' and by ' + sh.h + ' to find both true referent lengths.', right: true },
          { html: 'The conversion factor 2.54 is only approximate. Look up a better one.', why: '1 in = 2.54 cm <b>exactly</b>, by definition.' },
          { html: 'SI and imperial estimates can never agree. Nothing needs measuring.', why: 'They describe the same desk, so they should agree once both are in the same unit.' },
          { html: 'He must have miscounted the spans. Count them again.', why: 'Recounting can’t show whether 20 cm and 12 in are the right values — only a measurement can.' }],
          'The desk has one length, so ' + t(sh.s + '\\times\\text{(true span)}=' + sh.h + '\\times\\text{(true shoe)}') + '; with the assumed values it doesn’t hold. Tape the desk, then divide by each count to recover each true referent.', ['Which numbers in his work are assumptions rather than measurements?'], 'why two referent estimates disagree');
      } }] },
    { num: '13', stem: function (sh) { return 'Two garden beds are estimated by two different people. Bed A is paced out at ' + t(sh.a) + ' paces, with the pace taken as 90 cm. Bed B is stepped out at ' + t(sh.b) + ' shoe lengths, with the shoe taken as 1 ft. (' + t('1\\text{ ft}=0.3048\\text{ m}') + ', ' + t('1\\text{ m}=3.2808\\text{ ft}') + ')'; },
      shared: function (r) {
        for (var g = 0; g < 400; g++) {
          var a = r.int(4, 8), b = r.int(14, 30), A = 0.9 * a, B = 0.3048 * b, d = (B - A) / B;
          var hot = [A * 0.95, A * 1.05, B * 0.95, B * 1.05].some(function (v) { var z = v * 100 - Math.floor(v * 100 + 1e-9); return Math.abs(z - 0.5) < 0.002; });
          if (d < 0.03 || d > 0.2 || (hot && !(a === 5 && b === 16))) continue;
          if (Math.abs(A * 1.05 - B * 0.95) < 0.02) continue;
          return { a: a, b: b, A: A, B: B };
        }
        return { a: 5, b: 16, A: 4.5, B: 4.8768 };
      }, parts: [
      { id: 'e13a', sub: 'a', level: 'EMG', outcome: M2, make: function (r, sh) {
        return fieldsPart('Express both estimates in metres, to the nearest hundredth of a metre.', [{ label: 'Bed A', after: 'm', x: sh.A, dp: 2, alts: unitAlts(sh.A, 'm') }, { label: 'Bed B', after: 'm', x: sh.B, dp: 2, alts: [{ v: sh.b / 3.2808 * 1, code: 'other-factor', hint: 'Use ' + t('1\\text{ ft}=0.3048\\text{ m}') + ': multiply the feet by 0.3048.' }, { v: sh.b * 3.2808, code: 'divided', hint: 'A metre is longer than a foot, so there are <b>fewer</b> metres: multiply by 0.3048 (or divide by 3.2808).' }] }],
          'Bed A: ' + t(sh.a + '\\times90=' + 90 * sh.a + '\\text{ cm}=' + fx(sh.A, 2) + '\\text{ m}') + '. Bed B: ' + t(sh.b + '\\text{ ft}\\times0.3048=' + N(rnd(sh.B, 6)) + '\\approx' + fx(sh.B, 2) + '\\text{ m}') + '.', ['Paces: count × 90 cm. Shoes: count feet × 0.3048.'], 'beds in metres');
      } },
      { id: 'e13b', sub: 'b', level: 'EMG', outcome: M2, make: function (r, sh) {
        var Af = sh.A * 3.2808;
        return fieldsPart('Now express both in feet, to the nearest tenth of a foot. (Is the order of the two beds the same either way?)', [{ label: 'Bed A', after: 'ft', x: Af, dp: 1, alts: [{ v: sh.A / 3.2808, code: 'divided', hint: 'A foot is shorter than a metre, so there are <b>more</b> feet: multiply by 3.2808.' }] }, { label: 'Bed B', after: 'ft', x: sh.b, dp: 1, alts: [] }],
          'Bed A: ' + t(fx(sh.A, 2) + '\\times3.2808\\approx' + fx(Af, 1) + '\\text{ ft}') + '. Bed B: ' + t(fx(sh.b, 1)) + ' ft already. B is longer in both units — converting multiplies both by the same positive factor, so the order can’t change.', ['Metres × 3.2808 = feet.'], 'beds in feet');
      } },
      { id: 'e13c', sub: 'c', level: 'EMG', make: function (r, sh) {
        var d = sh.B - sh.A;
        return fieldsPart('State the difference between the two beds in metres (nearest hundredth), and as a percent of the longer estimate (nearest tenth). Use the unrounded lengths, ' + t(fx(sh.A, 2)) + ' m and ' + t(N(rnd(sh.B, 6))) + ' m.', [{ label: 'Difference', after: 'm', x: d, dp: 2, alts: [] }, { label: 'Percent of the longer', after: '%', x: d / sh.B * 100, dp: 1, alts: [{ v: d / sh.A * 100, code: 'pct-base', hint: 'Divide by the <b>longer</b> estimate (bed B).' }] }],
          t(N(rnd(sh.B, 6)) + '-' + fx(sh.A, 2) + '=' + N(rnd(d, 6)) + '\\approx' + fx(d, 2)) + ' m. ' + t('\\frac{' + N(rnd(d, 6)) + '}{' + N(rnd(sh.B, 6)) + '}\\times100\\approx' + fx(d / sh.B * 100, 1) + '\\%') + '.', ['Subtract, then divide by the longer one.'], 'beds difference');
      } },
      { id: 'e13d', sub: 'd i', level: 'PRG', make: function (r, sh) {
        var v = [sh.A * 0.95, sh.A * 1.05, sh.B * 0.95, sh.B * 1.05];
        return fieldsPart('Each estimate could be out by as much as ' + t('5\\%') + '. Work out the interval of possible true lengths for each bed, to the nearest hundredth of a metre.', [{ label: 'Bed A from', after: 'm', x: v[0], dp: 2 }, { label: 'Bed A to', after: 'm', x: v[1], dp: 2 }, { label: 'Bed B from', after: 'm', x: v[2], dp: 2 }, { label: 'Bed B to', after: 'm', x: v[3], dp: 2 }].map(function (s) { s.alts = []; return s; }),
          'Bed A: ' + t(fx(sh.A, 2) + '\\times0.95=' + N(rnd(v[0], 6)) + '\\ \\text{to}\\ ' + fx(sh.A, 2) + '\\times1.05=' + N(rnd(v[1], 6))) + ', so ' + t('[' + fx(v[0], 2) + ',\\ ' + fx(v[1], 2) + ']') + ' m.<br>Bed B: ' + t(N(rnd(sh.B, 6)) + '\\times0.95\\approx' + fx(v[2], 2) + '\\ \\text{to}\\ ' + N(rnd(sh.B, 6)) + '\\times1.05\\approx' + fx(v[3], 2)) + ' m.', ['Multiply each estimate by 0.95 and by 1.05.'], 'possible-length intervals');
      } },
      { id: 'e13e', sub: 'd ii', level: 'PRG', make: function (r, sh) {
        var lap = sh.A * 1.05 >= sh.B * 0.95, lo = fx(sh.B * 0.95, 2), hi = fx(sh.A * 1.05, 2);
        return mc(r, 'Bed A could be ' + t(fx(sh.A * 0.95, 2)) + '–' + t(fx(sh.A * 1.05, 2)) + ' m and bed B ' + t(fx(sh.B * 0.95, 2)) + '–' + t(fx(sh.B * 1.05, 2)) + ' m. Does the evidence show that bed B is longer than bed A?', [
          { html: 'Yes — even the shortest possible length of B is longer than the longest possible length of A.', right: !lap, why: lap ? 'Check: B’s shortest, ' + lo + ' m, is not longer than A’s longest, ' + hi + ' m.' : null },
          { html: 'No — the intervals overlap, so A could actually be the longer one; it is undecided until something is measured.', right: lap, why: lap ? null : 'Check: B’s shortest, ' + lo + ' m, is already longer than A’s longest, ' + hi + ' m — they don’t overlap.' },
          { html: 'Yes — B’s estimate is the larger number.', why: 'The estimates could each be out by 5%. Compare the intervals, not just the estimates.' },
          { html: 'No — an estimate in paces can never be compared with one in shoe lengths.', why: 'Once both are in metres they can be compared; the question is whether the intervals overlap.' }],
          lap ? 'The intervals overlap (B’s lowest ' + lo + ' m ≤ A’s highest ' + hi + ' m): if A is near the top of its range and B near the bottom, A is longer. The evidence does <b>not</b> show B is longer.' : 'B’s lowest possible length, ' + lo + ' m, is above A’s highest, ' + hi + ' m: the intervals don’t overlap, so B <b>is</b> longer even in the worst case.',
          ['Compare B’s lowest possible value with A’s highest possible value.'], 'do the intervals overlap');
      } }] },
    /* ---------- Part F ---------- */
    { num: '14', section: 'Extra practice F — When a referent will not do', stem: 'For each task, decide whether a personal referent is good enough or a measuring instrument is required (and which). The deciding question is the <b>tolerance</b>: how far out you may be before the task fails.', parts: [
      { id: 'e14', sub: 'a–f', level: 'EMG', make: function (r) {
        var pools = { R: [['deciding whether a 1.90 m sofa will fit along a wall you have paced at about 3 m', 'about 1.1 m of slack — a 10% pacing error is only 0.3 m'], ['judging whether a trail is closer to 5 km or to 10 km', 'the two options differ by 2.5 km'], ['pegging out a vegetable bed that is to be “about 3 m by 5 m”', '“about” allows ±0.2 m or so'], ['checking roughly how far it is to the end of a soccer field to set up a game', 'a few metres either way doesn’t matter']],
          T: [['cutting a replacement pane of glass to sit in an existing window frame', 'glass is cut to the number: 1–2 mm'], ['setting a basketball hoop to the regulation height of 3.05 m', 'a few millimetres on 3.05 m'], ['cutting baseboard trim to fit a wall exactly', 'a millimetre or two']],
          M: [['turning a steel bolt to fit a hole of diameter 12.00 mm', 'hundredths of a millimetre'], ['checking that a wire is 1.25 mm thick', 'hundredths of a millimetre'], ['grinding a pin to a diameter of 20.00 mm', 'hundredths of a millimetre']] };
        var nR = r.pick([3, 3, 2]), nM = r.pick([1, 1, 2]), nT = 6 - nR - nM;
        var picks = r.sample(pools.R, nR).map(function (x) { return ['R', x]; }).concat(r.sample(pools.T, nT).map(function (x) { return ['T', x]; }), r.sample(pools.M, nM).map(function (x) { return ['M', x]; }));
        picks = r.shuffle(picks);
        var rows = picks.map(function (p, i) { return { id: 'r' + i, html: '(' + 'abcdef'.charAt(i) + ') ' + p[1][0] }; }), want = {};
        picks.forEach(function (p, i) { want['r' + i] = p[0]; });
        var cols = [{ id: 'R', html: 'Referent<br><small>is enough</small>', name: 'Referent is good enough' }, { id: 'T', html: 'Tape or<br>ruler <small>(1 mm)</small>', name: 'Tape or ruler (to 1 mm)' }, { id: 'M', html: 'Micro-<br>meter <small>(0.01 mm)</small>', name: 'Micrometer (to 0.01 mm)' }];
        return named(P.grid('Choose for each task.', rows, cols, want, { why: function (row) { var i = Number(row.slice(1)); return { code: 'row', hint: 'Check ' + rows[i].html.slice(4) + ': how far out could you be before the task fails?' }; } },
          picks.map(function (p, i) { return rows[i].html + ': <b>' + cols.filter(function (c) { return c.id === p[0]; })[0].name + '</b> (tolerance: ' + p[1][1] + ')'; }).join('<br>'), ['If the job has a margin built in, a referent will do. If something is cut, machined or set to the number, measure it.'], 'referent or instrument'), rows, cols);
      } },
      { id: 'e14g', sub: 'g', level: 'EMG', make: function (r) {
        return mc(r, 'Complete the sentence: “A referent is good enough exactly when…”', [
          { html: '…the decision has a margin wider than the referent’s likely error — and never when something is cut, machined or set <b>to</b> the measured number.', right: true },
          { html: '…the object is large.', why: 'A basketball hoop is large, but it must be set to 3.05 m within a few millimetres.' },
          { html: '…you are measuring in SI units.', why: 'The system of units has nothing to do with it; the tolerance does.' },
          { html: '…you can’t find a tape measure.', why: 'Then you might use one anyway — but whether the estimate is good enough depends on the task’s tolerance.' }],
          'Sofa, trail, vegetable bed: generous margins, so a referent will do. Glass, hoop, bolt: set to the number, so an instrument is required.', ['What do the tasks in the “referent” group have in common?'], 'when a referent is good enough');
      } }] },
    /* ---------- Part G ---------- */
    { num: '15', section: 'Extra practice G — Estimating a perimeter and an area', stem: function (sh) { return 'A rectangular rug is covered by Mira’s span, taken as 20 cm: it is ' + t(sh.a) + ' spans long and ' + t(sh.b) + ' spans wide, with no gaps and no overlaps.' + e15fig(sh.a, sh.b); },
      shared: function (r) { return { a: r.pick([11, 11, 9, 10, 12, 13]), b: r.pick([7, 7, 5, 6, 8]), t: r.pick([19, 19, 18]) }; }, parts: [
      { id: 'e15a', sub: 'a', level: 'BEG', make: function (r, sh) {
        var L = sh.a * 0.2, W = sh.b * 0.2, A = rnd(L * W, 4);
        return fieldsPart('Give the rug’s estimated length and width in metres, then its estimated area.', [{ label: 'Length', after: 'm', x: rnd(L, 4), exact: true, alts: unitAlts(L, 'm') }, { label: 'Width', after: 'm', x: rnd(W, 4), exact: true, alts: unitAlts(W, 'm') }, { label: 'Area', after: 'm²', x: A, exact: true, alts: [{ v: 2 * (L + W), code: 'perimeter', hint: 'That is the perimeter. Area = length × width.' }, { v: sh.a * sh.b * 20, code: 'area-units', hint: 'Multiply the lengths in metres: ' + t(fx(L, 2) + '\\times' + fx(W, 2)) + '.' }] }],
          'Length ' + t(sh.a + '\\times20=' + sh.a * 20 + '\\text{ cm}=' + fx(L, 2) + '\\text{ m}') + ', width ' + t(sh.b + '\\times20=' + sh.b * 20 + '\\text{ cm}=' + fx(W, 2) + '\\text{ m}') + '. Area ' + t(fx(L, 2) + '\\times' + fx(W, 2) + '=' + N(A) + '\\text{ m}^2') + '.', ['Count × 20 cm for each side; area = length × width (square metres).'], 'rug estimate');
      } },
      { id: 'e15b', sub: 'b', level: 'EMG', make: function (r, sh) {
        var L = sh.a * sh.t / 100, W = sh.b * sh.t / 100, A = rnd(L * W, 6);
        return fieldsPart('Mira’s span is really ' + t(sh.t) + ' cm. Give the rug’s true length, width and area (area exactly — don’t round).', [{ label: 'Length', after: 'm', x: rnd(L, 4), exact: true, alts: [] }, { label: 'Width', after: 'm', x: rnd(W, 4), exact: true, alts: [] }, { label: 'Area', after: 'm²', x: A, exact: true, alts: [] }],
          'Length ' + t(sh.a + '\\times' + sh.t + '=' + sh.a * sh.t + '\\text{ cm}=' + fx(L, 2) + '\\text{ m}') + ', width ' + t(sh.b + '\\times' + sh.t + '=' + sh.b * sh.t + '\\text{ cm}=' + fx(W, 2) + '\\text{ m}') + '. Area ' + t(fx(L, 2) + '\\times' + fx(W, 2) + '=' + N(A) + '\\text{ m}^2') + ' (kept exact for part c).', ['Use the true span for each side.'], 'rug true size');
      } },
      { id: 'e15c', sub: 'c', level: 'PRG', make: function (r, sh) {
        var e = (20 - sh.t) / sh.t * 100, ea = (400 / (sh.t * sh.t) - 1) * 100;
        return fieldsPart('Find the percent error in each <b>length</b>, and then the percent error in the <b>area</b>, to the nearest tenth. (Span used 20 cm, true span ' + t(sh.t) + ' cm.)', [{ label: 'Each length', after: '%', x: e, dp: 1, alts: [{ v: (20 - sh.t) / 20 * 100, code: 'pct-base', hint: 'Divide by the <b>true</b> length (true span ' + sh.t + ' cm).' }] }, { label: 'Area', after: '%', x: ea, dp: 1, alts: [{ v: 2 * e, code: 'pct-double', hint: 'Close, but not exactly double: compute the area error from the two areas, ' + t('\\frac{\\text{est.}-\\text{true}}{\\text{true}}\\times100') + '.' }, { v: e, code: 'pct-same', hint: 'The area multiplies two lengths that are both too long, so its error is bigger than one length’s.' }] }],
          'Each length: ' + t('\\frac{20-' + sh.t + '}{' + sh.t + '}\\times100\\approx' + fx(e, 1) + '\\%') + ' (the same for both sides). Area: ' + t('\\left(\\frac{20}{' + sh.t + '}\\right)^2-1\\approx' + fx(ea / 100, 4)) + ', so about ' + t(fx(ea, 1) + '\\%') + '.', ['Percent error = (estimate − true) ÷ true × 100, for the lengths and then for the areas.'], 'rug percent errors');
      } },
      { id: 'e15d', sub: 'd', level: 'ADV', make: function (r, sh) {
        var g = HW.ex.gcd(400, sh.t * sh.t), fr = [400 / g, sh.t * sh.t / g];
        var p = P.fraction('Write the ratio of estimated area to true area as a single fraction in lowest terms. (Hint: it is the square of a single fraction.)', fr, {},
          t('\\frac{\\text{estimated area}}{\\text{true area}}=\\frac{(' + sh.a + '\\times20)(' + sh.b + '\\times20)}{(' + sh.a + '\\times' + sh.t + ')(' + sh.b + '\\times' + sh.t + ')}=\\left(\\frac{20}{' + sh.t + '}\\right)^2=\\frac{' + fr[0] + '}{' + fr[1] + '}') + ' ' + t('\\approx' + fx(fr[0] / fr[1], 4)) + '. With ' + t('\\frac{20}{' + sh.t + '}=1+e') + ', ' + t('(1+e)^2=1+2e+e^2') + ': ' + t('2e') + ' is the “double” and ' + t('e^2') + ' is the “little more”.',
          ['The counts cancel; only the span values are left.'], 'area ratio as a square');
        return p;
      } },
      { id: 'e15e', sub: 'e i', level: 'ADV', make: function (r, sh) {
        var e = (20 - sh.t) / sh.t * 100, v = (8000 / Math.pow(sh.t, 3) - 1) * 100;
        return nearPart('Predict, without computing an area, the percent error in the <b>volume</b> of a box whose three dimensions were all estimated with the same span (used 20 cm, true ' + t(sh.t) + ' cm). Nearest tenth.', v, 1, '%', [{ v: 3 * e, code: 'pct-triple', hint: 'Close, but not exactly triple: the ratio is ' + t('\\left(\\frac{20}{' + sh.t + '}\\right)^3') + '.' }, { v: (400 / (sh.t * sh.t) - 1) * 100, code: 'pct-square', hint: 'A volume multiplies <b>three</b> lengths: cube the ratio.' }],
          t('\\left(\\frac{20}{' + sh.t + '}\\right)^3=\\frac{8\\,000}{' + F(Math.pow(sh.t, 3)) + '}\\approx' + fx(1 + v / 100, 4)) + ', an error of about ' + t(fx(v, 1) + '\\%') + ' — a little more than ' + t('3\\times' + fx(e, 1) + '\\%') + '.', ['Cube the ratio 20 ÷ true span.'], 'volume percent error');
      } },
      { id: 'e15f', sub: 'e ii', level: 'PRG', make: function (r) {
        return mc(r, 'If every length carries a factor ' + t('\\frac{a}{t}') + ' (assumed ÷ true), what is the general rule for a measurement in ' + t('k') + ' dimensions?', [
          { html: 'It carries ' + t('\\left(\\frac{a}{t}\\right)^k') + ', so its percent error is about ' + t('k') + ' times the length’s percent error (a little more).', right: true },
          { html: 'It carries ' + t('\\frac{a}{t}') + ', so its percent error equals the length’s.', why: 'The rug’s area error (two dimensions) was about double the length error.' },
          { html: 'It carries ' + t('k\\cdot\\frac{a}{t}') + ', so its percent error is exactly ' + t('k') + ' times the length’s.', why: 'The factors multiply, they don’t add: the area error was a little <b>more</b> than double.' },
          { html: 'It carries ' + t('\\left(\\frac{a}{t}\\right)^2') + ' whatever the number of dimensions.', why: 'A volume multiplies three lengths, so the factor is cubed.' }],
          'Each dimension contributes one factor ' + t('\\frac{a}{t}') + ', so ' + t('k') + ' dimensions give ' + t('\\left(\\frac{a}{t}\\right)^k') + ' — about ' + t('k') + ' times the length’s percent error, plus a little from the higher powers.', ['Area multiplies 2 lengths; volume multiplies 3.'], 'k-dimension error rule');
      } }] },
    { num: '16', stem: function (sh) { return 'A rectangular vegetable plot is paced out as ' + t(sh.L) + ' paces by ' + t(sh.W) + ' paces, with the pace taken as 90 cm.'; },
      shared: function (r) {
        for (var g = 0; g < 400; g++) { var L = r.int(15, 30), W = r.int(8, L - 4), p = r.pick([87, 87, 85, 86, 88, 92, 93]), n = 2 * (L + W), e = n * 0.9, tr = n * p / 100, pe = Math.ceil(e / 2.5 - 1e-9), pt = Math.ceil(tr / 2.5 - 1e-9);
          if (pe !== pt && Math.abs(e / 2.5 - Math.round(e / 2.5)) > 0.05 && Math.abs(tr / 2.5 - Math.round(tr / 2.5)) > 0.05) return { L: L, W: W, p: p, n: n, e: e, tr: tr, pe: pe, pt: pt }; }
        return { L: 23, W: 14, p: 87, n: 74, e: 66.6, tr: 64.38, pe: 27, pt: 26 };
      }, parts: [
      { id: 'e16a', sub: 'a', level: 'BEG', make: function (r, sh) {
        return fieldsPart('Give the perimeter first as a count of paces, then in metres.', [{ label: 'Perimeter', after: 'paces', x: sh.n, exact: true, alts: [{ v: sh.L + sh.W, code: 'half-perimeter', hint: 'That is two sides. A rectangle has four: ' + t('2(L+W)') + '.' }, { v: sh.L * sh.W, code: 'area', hint: 'That is the area in square paces. Perimeter = ' + t('2(L+W)') + '.' }] }, { label: '', name: 'In metres', after: 'm', x: rnd(sh.e, 4), exact: true, alts: unitAlts(sh.e, 'm') }],
          t('2(' + sh.L + '+' + sh.W + ')=' + sh.n) + ' paces; ' + t(sh.n + '\\times90=' + F(sh.n * 90) + '\\text{ cm}=' + fx(sh.e, 2) + '\\text{ m}') + '.', ['Perimeter = 2(length + width).'], 'plot perimeter');
      } },
      { id: 'e16b', sub: 'b', level: 'EMG', make: function (r, sh) {
        return exactPart('Fencing is sold in rigid panels 2.5 m long and cannot be cut. How many panels does the estimate (' + t(fx(sh.e, 2)) + ' m) call for?', sh.pe, 'panels', [{ v: sh.pe - 1, code: 'round-up', hint: t(fx(sh.e, 2) + '\\div2.5=' + fx(sh.e / 2.5, 2)) + ': panels can’t be cut, so round <b>up</b>.' }],
          t(fx(sh.e, 2) + '\\div2.5=' + fx(sh.e / 2.5, 2)) + '; panels can’t be cut, so round up: <b>' + sh.pe + ' panels</b>.', ['Divide, then round up to a whole panel.'], 'fence panels');
      } },
      { id: 'e16c', sub: 'c', level: 'PRG', make: function (r, sh) {
        return fieldsPart('The gardener’s pace is really ' + t(sh.p) + ' cm. Find the true perimeter, the number of panels actually needed, and the percent error of the estimate (' + t(fx(sh.e, 2)) + ' m), to the nearest tenth.',
          [{ label: 'True perimeter', after: 'm', x: rnd(sh.tr, 4), exact: true, alts: unitAlts(sh.tr, 'm') }, { label: 'Panels needed', after: 'panels', x: sh.pt, exact: true, alts: [{ v: sh.pt - 1, code: 'round-up', hint: 'Round <b>up</b> to a whole panel.' }] }, { label: 'Percent error', after: '%', x: pct(sh.e, sh.tr), dp: 1, alts: percAlts(sh.e, sh.tr) }],
          t(sh.n + '\\times' + sh.p + '=' + F(sh.n * sh.p) + '\\text{ cm}=' + fx(sh.tr, 2) + '\\text{ m}') + '; ' + t(fx(sh.tr, 2) + '\\div2.5=' + fx(sh.tr / 2.5, 3) + '\\rightarrow' + sh.pt) + ' panels; ' + pctTex(fx(sh.e, 2), fx(sh.tr, 2)) + '.', ['True perimeter = paces × true pace.'], 'true fence');
      } },
      { id: 'e16d', sub: 'd', level: 'PRG', make: function (r, sh) {
        return mc(r, 'The percent error is small (about ' + t(fx(pct(sh.e, sh.tr), 1) + '\\%') + '), yet the estimate orders the wrong number of panels. How — and what should the gardener do?', [
          { html: 'Rounding up to whole panels is a step: ' + t(fx(sh.tr / 2.5, 2)) + ' and ' + t(fx(sh.e / 2.5, 2)) + ' fall on opposite sides of a whole number, so a small error becomes a whole panel. Measure the sides with a tape (or measure his pace) before ordering.', right: true },
          { html: 'A ' + fx(pct(sh.e, sh.tr), 1) + '% error is too large for any purpose; he should pace more carefully.', why: 'The problem is the rounding step, and pacing more carefully won’t fix a wrong pace value.' },
          { html: 'The extra panel comes from rounding the pace count.', why: 'The counts are exact; the extra panel comes from rounding up the number of panels.' },
          { html: 'He should cut the last panel to fit.', why: 'The panels are rigid and can’t be cut.' }],
          'The number of panels jumps only when the length crosses a multiple of 2.5 m. Here it did, so ' + t(fx(pct(sh.e, sh.tr), 1) + '\\%') + ' became a whole extra panel. One tape measurement (or measuring his own pace once) fixes it.', ['Look at the two quotients before rounding up.'], 'small error, extra panel');
      } }] },
    /* ---------- Part H ---------- */
    { num: '17', section: 'Extra practice H — Error analysis', stem: function (sh) { return 'Asked to estimate the length of a running track’s straight, Jon used his hand width (10 cm). He counted the hands three separate times and got ' + t(sh.c[0]) + ', then ' + t(sh.c[1]) + ', then ' + t(sh.c[2]) + '. He reported the first count: “about ' + t(fx(sh.c[0] / 10, 0)) + ' m”.'; },
      shared: function (r) {
        for (var g = 0; g < 300; g++) { var T = 70 + 0.5 * r.int(0, 50), base = Math.round(T * 10 / 10) * 10, c = [base - 10 * r.int(1, 4), base + 10 * r.int(2, 5), base + 10 * r.pick([-1, 0, 1])];
          var below = c.filter(function (x) { return x < T * 10; }).length; if (below === 0 || below === 3) continue; if (c[0] === c[2] || c[1] === c[2]) continue; return { T: T, c: c }; }
        return { T: 87.5, c: [850, 910, 870] };
      }, parts: [
      { id: 'e17a', sub: 'a i', level: 'BEG', make: function (r, sh) {
        return fieldsPart('Convert all three counts to metres.', sh.c.map(function (c, i) { return { label: ['First', 'Second', 'Third'][i], after: 'm', x: c / 10, exact: true, alts: unitAlts(c / 10, 'm') }; }),
          sh.c.map(function (c) { return t(c + '\\times10=' + F(c * 10) + '\\text{ cm}=' + fx(c / 10, 1) + '\\text{ m}'); }).join('; '), ['Count × 10 cm, then ÷ 100 for metres.'], 'three hand counts to metres');
      } },
      { id: 'e17b', sub: 'a ii', level: 'EMG', make: function (r, sh) {
        return mc(r, 'Jon’s arithmetic is correct every time. Which part of count × referent has gone wrong?', [
          { html: 'The <b>count</b>: about ' + Math.round(sh.T * 10) + ' placements can’t be tracked (his three counts differ). The hand is far too small a referent for this distance.', right: true },
          { html: 'The <b>referent length</b>: his hand isn’t really 10 cm.', why: 'The same hand gave three different answers — a wrong hand width would push all three the same way. It’s the counts that disagree.' },
          { html: 'The <b>multiplication</b>: he should have divided.', why: 'Count × referent is right; and the question says his arithmetic is correct.' },
          { html: 'Nothing: any of the three answers is fine.', why: 'Three different answers from the same track means something in the method is unreliable.' }],
          'The hand width is fine; what failed is the count — hundreds of placements along a track can’t be tracked, as three different counts prove. The referent is far too small for a distance this size.', ['What changed between his three attempts?'], 'error is in the count');
      } },
      { id: 'e17c', sub: 'b', level: 'EMG', make: function (r, sh) {
        var m = sh.c.map(function (c) { return c / 10; }), sp = Math.max.apply(null, m) - Math.min.apply(null, m), mean = (m[0] + m[1] + m[2]) / 3;
        return fieldsPart('Find the spread of his three answers (largest − smallest) in metres, and express it as a percent of their mean (nearest tenth).', [{ label: 'Spread', after: 'm', x: rnd(sp, 4), exact: true, alts: [] }, { label: 'Percent of the mean', after: '%', x: sp / mean * 100, dp: 1, alts: [] }],
          'Spread ' + t(fx(Math.max.apply(null, m), 1) + '-' + fx(Math.min.apply(null, m), 1) + '=' + fx(sp, 1)) + ' m. Mean ' + t('\\frac{' + m.map(function (x) { return fx(x, 1); }).join('+') + '}{3}\\approx' + fx(mean, 2)) + ' m. ' + t('\\frac{' + fx(sp, 1) + '}{' + fx(mean, 2) + '}\\times100\\approx' + fx(sp / mean * 100, 1) + '\\%') + '.', ['Mean = sum ÷ 3.'], 'spread of counts');
      } },
      { id: 'e17d', sub: 'c i', level: 'EMG', make: function (r, sh) {
        return fieldsPart('The straight is later measured at ' + t(fx(sh.T, 2)) + ' m. Find the percent error of each of Jon’s three answers (nearest tenth).', sh.c.map(function (c, i) { return { label: ['First', 'Second', 'Third'][i], after: '%', x: pct(c / 10, sh.T), dp: 1, alts: percAlts(c / 10, sh.T) }; }),
          sh.c.map(function (c) { return pctTex(fx(c / 10, 1), fx(sh.T, 2)); }).join('<br>'), ['Percent error = |answer − measured| ÷ measured × 100.'], 'three percent errors');
      } },
      { id: 'e17e', sub: 'c ii', level: 'PRG', make: function (r, sh) {
        var below = sh.c.filter(function (c) { return c / 10 < sh.T; }).length;
        return mc(r, (below === 2 ? 'Two' : 'One') + ' of his answers fell below ' + t(fx(sh.T, 2)) + ' m and ' + (below === 2 ? 'one' : 'two') + ' above. What does that pattern say about his error?', [
          { html: 'The error scatters in both directions: the signature of a random counting error, not of a wrong referent value (which would push every answer the same way).', right: true },
          { html: 'His hand must be wider than 10 cm.', why: 'A wrong referent value would make every answer too small (or every one too large) — but his answers fall on both sides.' },
          { html: 'He must have counted the same way each time.', why: 'Three different counts show he didn’t.' },
          { html: 'The track must be changing length.', why: 'The track is fixed; the variation is in his counting.' }],
          'Answers on both sides of the true value mean the error is <b>random</b> (lost count, sloppy placement), not a <b>bias</b> from a wrong referent value — compare question 6, where a wrong pace pushed every estimate the same way.', ['Would a wrong hand width make the answers too big, too small, or both?'], 'random vs biased error');
      } },
      { id: 'e17f', sub: 'd', level: 'EMG', make: function (r, sh) {
        var v = sh.T * 100 / 90;
        return nearPart('Redo the estimate with a pace of 90 cm: how many paces is ' + t(fx(sh.T, 2)) + ' m, to the nearest whole pace?', v, 0, 'paces', [{ v: sh.T / 90, code: 'unit-slip', hint: 'Change the metres to centimetres first.' }],
          t(F(Math.round(sh.T * 100)) + '\\div90\\approx' + fx(v, 2) + '\\approx' + fx(v, 0)) + ' paces. Two reasons the pace is better: about ' + fx(v, 0) + ' is a count a person can hold (hundreds of hands is not), and the accumulated placement error is multiplied about ' + fx(v, 0) + ' times instead of hundreds of times.', ['Paces = length in cm ÷ 90.'], 'track in paces');
      } }] },
    { num: '18', stem: function (sh) { return 'Asked to estimate the width of a classroom, Amara stepped it out in ' + t(sh.n) + ' shoe lengths, took her shoe to be 12 in, and converted:<br>' + t(sh.lines.join(',\\qquad ')); },
      shared: function (r) {
        var n = r.pick([24, 24, 20, 23, 26, 30]), i = 12 * n, c = rnd(i * 2.54, 4), m = rnd(c / 100, 4), slip = r.pick([0, 0, 1, 2, 3]);
        var s1 = slip === 1 ? i + 10 * r.pick([-2, -1, 1, 2]) : i, s2 = slip === 2 ? rnd(s1 * 2.54 / 10, 4) : rnd(s1 * 2.54, 4), s3 = slip === 3 ? rnd(s2 / 10, 4) : rnd(s2 / 100, 4);
        return { n: n, i: i, c: c, m: m, slip: slip, rep: fx(s3, 3), sh: r.pick([[29, 32], [29, 32], [28, 31], [27, 30]]),
          lines: [n + '\\times12=' + F(s1) + '\\text{ in}', F(s1) + '\\times2.54=' + N(s2) + '\\text{ cm}', '\\text{width}=' + fx(s3, 3) + '\\text{ m}'] };
      }, parts: [
      { id: 'e18a', sub: 'a', level: 'EMG', make: function (r, sh) {
        var opts = [{ html: 'No — every line checks out.', right: sh.slip === 0, why: 'Recheck each line on your calculator.' }, { html: 'Yes — the first line.', right: sh.slip === 1, why: sh.slip ? 'Recheck that line on your calculator.' : 'Recheck: ' + t(sh.n + '\\times12=' + sh.i) + '.' }, { html: 'Yes — the second line.', right: sh.slip === 2, why: 'Recheck that line on your calculator.' }, { html: 'Yes — the third line (cm to m).', right: sh.slip === 3, why: 'Recheck that line: 100 cm = 1 m.' }];
        return mc(r, 'Check her conversion arithmetic. Is a single keystroke wrong?', opts, 'Correct work: ' + t(sh.n + '\\times12=' + sh.i + '\\text{ in}') + ', ' + t(F(sh.i) + '\\times2.54=' + N(sh.c) + '\\text{ cm}') + ', ' + t('=' + N(sh.m) + '\\text{ m}') + '. ' + (sh.slip ? 'Her line ' + sh.slip + ' is wrong.' : 'Every line of her arithmetic is right.'), ['Redo each line: in = shoes × 12; cm = in × 2.54; m = cm ÷ 100.'], 'check Amara’s arithmetic', true);
      } },
      { id: 'e18b', sub: 'b', level: 'EMG', make: function (r, sh) {
        return mc(r, 'Even with every keystroke right (' + t(N(sh.m)) + ' m), what is wrong with reporting the width to three decimal places?', [
          { html: '<b>False precision</b>: the decimals came from the conversion factor 2.54, not from any measurement. Her only inputs were a count and an assumed shoe length.', right: true },
          { html: 'She should have used ' + t('1\\text{ in}=2.5\\text{ cm}') + '.', why: '2.54 is the exact factor. The problem is how many digits she reported.' },
          { html: 'She should have reported it in centimetres instead.', why: 'Any unit is fine; the problem is claiming a precision her referent never had.' },
          { html: 'Nothing is wrong with it.', why: 'Could a shoe-length estimate really be good to the millimetre?' }],
          'A conversion can move a number between units but it can’t create precision. Her estimate rests on “my shoe is about 12 in”, so millimetres are meaningless.', ['Where did the digits after the decimal point come from?'], 'false precision');
      } },
      { id: 'e18c', sub: 'c', level: 'EMG', make: function (r, sh) {
        var lo = sh.n * sh.sh[0], hi = sh.n * sh.sh[1];
        return fieldsPart('Amara’s shoe is somewhere between ' + t(sh.sh[0]) + ' cm and ' + t(sh.sh[1]) + ' cm long. Work out the interval her estimate really lies in, and its width in centimetres.', [{ label: 'From', after: 'm', x: lo / 100, exact: true, alts: unitAlts(lo / 100, 'm') }, { label: 'To', after: 'm', x: hi / 100, exact: true, alts: unitAlts(hi / 100, 'm') }, { label: 'Width', after: 'cm', x: hi - lo, exact: true, alts: [] }],
          t(sh.n + '\\times' + sh.sh[0] + '=' + lo + '\\text{ cm}=' + fx(lo / 100, 2) + '\\text{ m}') + ' to ' + t(sh.n + '\\times' + sh.sh[1] + '=' + hi + '\\text{ cm}=' + fx(hi / 100, 2) + '\\text{ m}') + ': a band ' + t(hi - lo) + ' cm wide. Even the first decimal place isn’t secure.', ['Multiply the count by the shortest and the longest possible shoe.'], 'shoe interval');
      } },
      { id: 'e18d', sub: 'd', level: 'PRG', make: function (r, sh) {
        var lo = sh.n * sh.sh[0] / 100, hi = sh.n * sh.sh[1] / 100, mid = Math.round(sh.m);
        return mc(r, 'How should Amara have reported the width? (Her interval is ' + t(fx(lo, 2)) + '–' + t(fx(hi, 2)) + ' m.)', [
          { html: '“About ' + mid + ' m” — an estimate is never more precise than the referent it was built from.', right: true },
          { html: '“' + N(sh.m) + ' m”, because that is what the calculator gives.', why: 'The calculator’s digits come from 2.54, not from her shoe.' },
          { html: '“' + N(rnd(sh.m * 100, 4)) + ' cm”, to show more detail.', why: 'Changing the unit doesn’t make an estimate more precise.' },
          { html: '“' + fx(sh.m, 1) + ' m exactly”.', why: 'Her interval is ' + t(hi * 100 - lo * 100) + ' cm wide — nothing about it is exact.' }],
          'Round back to the precision the referent justifies: “about ' + mid + ' m” (somewhere between ' + fx(lo, 1) + ' and ' + fx(hi, 1) + ' m).', ['How wide is the interval from (c)?'], 'report an estimate sensibly');
      } }] },
    { num: '19', stem: function (sh) { return 'Estimating the length of a hallway, Kofi paced as far as a pillar and counted ' + t(sh.p) + ' paces (90 cm each). Past the pillar he switched to spans (20 cm) and counted ' + t(sh.s) + ' of them. He reported ' + t('(' + sh.p + '+' + sh.s + ')\\times90=' + F((sh.p + sh.s) * 90) + '\\text{ cm}=' + fx((sh.p + sh.s) * 0.9, 2) + '\\text{ m}') + '.'; },
      shared: function (r) { return { p: r.pick([20, 20, 14, 16, 18, 24]), s: r.pick([16, 16, 10, 12, 14, 18]) }; }, parts: [
      { id: 'e19a', sub: 'a', level: 'EMG', make: function (r, sh) {
        return mc(r, 'What is Kofi’s error?', [
          { html: 'He added ' + sh.p + ' paces and ' + sh.s + ' spans as if they were ' + (sh.p + sh.s) + ' of the same thing, then multiplied by one referent length: the spans were charged at 90 cm each instead of 20 cm.', right: true },
          { html: 'He should have multiplied the total ' + (sh.p + sh.s) + ' by 20 cm instead.', why: 'That charges the paces at 20 cm each — just as wrong the other way.' },
          { html: 'He forgot to change centimetres to metres.', why: 'His conversion is fine; look at what he added together.' },
          { html: 'You can’t use two referents on one hallway.', why: 'You can — as long as each count is multiplied by its own referent before adding.' }],
          'Counts of different referents are not like terms: ' + sh.p + ' paces + ' + sh.s + ' spans isn’t ' + (sh.p + sh.s) + ' paces. Multiply each count by its own referent, then add.', ['Are a pace and a span the same length?'], 'mixed referents error');
      } },
      { id: 'e19b', sub: 'b', level: 'EMG', make: function (r, sh) {
        var c = 90 * sh.p + 20 * sh.s;
        return fieldsPart('Give the correct estimate in centimetres and in metres.', [{ label: 'Estimate', after: 'cm', x: c, exact: true, alts: [{ v: (sh.p + sh.s) * 90, code: 'mixed-referents', hint: 'That is Kofi’s answer: each count needs its <b>own</b> referent length.' }, { v: (sh.p + sh.s) * 20, code: 'mixed-referents', hint: 'Each count needs its <b>own</b> referent length: paces × 90 and spans × 20.' }] }, { label: '', name: 'In metres', after: 'm', x: c / 100, exact: true, alts: unitAlts(c / 100, 'm') }],
          t(sh.p + '\\times90+' + sh.s + '\\times20=' + F(90 * sh.p) + '+' + 20 * sh.s + '=' + F(c) + '\\text{ cm}=' + fx(c / 100, 2) + '\\text{ m}') + '. In general, ' + t('\\text{estimate}=n_1r_1+n_2r_2') + '.', ['Multiply each count by its own referent, then add.'], 'two-referent estimate');
      } },
      { id: 'e19c', sub: 'c', level: 'EMG', make: function (r, sh) {
        var c = (90 * sh.p + 20 * sh.s) / 100, k = (sh.p + sh.s) * 0.9, e = k - c;
        return fieldsPart('Find the size of Kofi’s error in metres (he reported ' + t(fx(k, 2)) + ' m; the correct estimate is ' + t(fx(c, 2)) + ' m), and as a percent of the correct estimate (nearest tenth).', [{ label: 'Error', after: 'm', x: rnd(e, 4), exact: true, alts: [] }, { label: 'Percent', after: '%', x: e / c * 100, dp: 1, alts: [{ v: e / k * 100, code: 'pct-base', hint: 'Divide by the <b>correct</b> estimate.' }] }],
          t(fx(k, 2) + '-' + fx(c, 2) + '=' + fx(e, 2)) + ' m; ' + t('\\frac{' + fx(e, 2) + '}{' + fx(c, 2) + '}\\times100\\approx' + fx(e / c * 100, 1) + '\\%') + '.', ['Subtract, then divide by the correct estimate.'], 'size of Kofi’s error');
      } },
      { id: 'e19d', sub: 'd', level: 'PRG', make: function (r, sh) {
        var q = 20 * sh.s / 90, c = (90 * sh.p + 20 * sh.s) / 100;
        return fieldsPart('Rework the second stretch as a number of <b>paces</b> (nearest hundredth), then finish the estimate with a single multiplication by 90 cm, using the unrounded number of paces. (It should agree with (b).)', [{ label: 'Second stretch', after: 'paces', x: q, dp: 2, alts: [{ v: sh.s * 90 / 20, code: 'divided', hint: 'Spans are shorter than paces, so there are <b>fewer</b> paces: ' + t(sh.s + '\\times20\\div90') + '.' }] }, { label: 'Estimate', after: 'm', x: c, dp: 2, alts: [] }],
          t('\\frac{' + sh.s + '\\times20}{90}=' + fx(q, 4) + '\\ldots') + ' paces. Total ' + t(sh.p + '+' + fx(q, 4) + '\\ldots=' + fx(sh.p + q, 4) + '\\ldots') + ' paces; ' + t('\\times90=' + F(Math.round(c * 100)) + '\\text{ cm}=' + fx(c, 2) + '\\text{ m}') + ' ✓. Putting everything into one referent before adding makes a mismatch impossible.', ['Change the spans to centimetres, then to paces.'], 'convert spans to paces');
      } }] },
    /* ---------- Part I ---------- */
    { num: '20', section: 'Extra practice I — Stretch: two students, two referents, one wall', stem: function (sh) { return 'Nadia and Beckett each estimate the horizontal run of a climbing wall. Nadia counts ' + t(sh.c) + ' cubits and takes her cubit to be 45 cm. Beckett counts ' + t(sh.b) + ' paces and takes his pace to be 90 cm.'; },
      shared: function (r) {
        for (var g = 0; g < 500; g++) {
          var c = r.int(26, 36), b = r.int(11, 17), Nn = 45 * c, B = 90 * b, d = Math.abs(Nn - B) / B;
          if (Nn <= B || d < 0.05 || d > 0.16) continue;
          var ip = Nn / b, ic = B / c; if (ip < 92 || ip > 106 || ic < 38 || ic > 44) continue;
          var T = rnd(B / 100 + 0.05 * r.int(4, Math.floor((Nn - B) / 5) + 4), 2), eN = Math.abs(Nn / 100 - T), eB = Math.abs(B / 100 - T);
          if (Math.abs(eN - eB) < 0.15 || T > Nn / 100 + 0.3) continue;
          return { c: c, b: b, N: Nn, B: B, T: T };
        }
        return { c: 31, b: 14, N: 1395, B: 1260, T: 13.10 };
      }, parts: [
      { id: 'e20a', sub: 'a', level: 'EMG', make: function (r, sh) {
        var d = (sh.N - sh.B) / 100;
        return fieldsPart('Give both estimates in metres, the difference between them, and that difference as a percent of Beckett’s estimate (nearest tenth).', [{ label: 'Nadia', after: 'm', x: sh.N / 100, exact: true, alts: unitAlts(sh.N / 100, 'm') }, { label: 'Beckett', after: 'm', x: sh.B / 100, exact: true, alts: unitAlts(sh.B / 100, 'm') }, { label: 'Difference', after: 'm', x: rnd(d, 4), exact: true, alts: [] }, { label: 'Percent of Beckett’s', after: '%', x: d / (sh.B / 100) * 100, dp: 1, alts: [{ v: d / (sh.N / 100) * 100, code: 'pct-base', hint: 'The question asks for a percent of <b>Beckett’s</b> estimate.' }] }],
          'Nadia ' + t(sh.c + '\\times45=' + F(sh.N) + '\\text{ cm}=' + fx(sh.N / 100, 2) + '\\text{ m}') + '; Beckett ' + t(sh.b + '\\times90=' + F(sh.B) + '\\text{ cm}=' + fx(sh.B / 100, 2) + '\\text{ m}') + '. Difference ' + t(fx(d, 2)) + ' m; ' + t('\\frac{' + fx(d, 2) + '}{' + fx(sh.B / 100, 2) + '}\\times100\\approx' + fx(d / sh.B * 10000, 1) + '\\%') + '.', ['Count × referent for each.'], 'two wall estimates');
      } },
      { id: 'e20b', sub: 'b', level: 'PRG', make: function (r, sh) {
        return fieldsPart('Suppose Nadia’s estimate is correct: what would Beckett’s true pace have to be? Suppose instead Beckett’s is correct: what would Nadia’s true cubit have to be? (Nearest tenth of a centimetre.)', [{ label: 'Beckett’s pace', after: 'cm', x: sh.N / sh.b, dp: 1, alts: [{ v: sh.B / sh.c, code: 'swapped', hint: 'If <b>Nadia</b> is right, the wall is ' + F(sh.N) + ' cm, and Beckett took ' + sh.b + ' paces.' }] }, { label: 'Nadia’s cubit', after: 'cm', x: sh.B / sh.c, dp: 1, alts: [{ v: sh.N / sh.b, code: 'swapped', hint: 'If <b>Beckett</b> is right, the wall is ' + F(sh.B) + ' cm, and Nadia took ' + sh.c + ' cubits.' }] }],
          'If Nadia is right: ' + t('\\frac{' + F(sh.N) + '}{' + sh.b + '}\\approx' + fx(sh.N / sh.b, 1)) + ' cm per pace. If Beckett is right: ' + t('\\frac{' + F(sh.B) + '}{' + sh.c + '}\\approx' + fx(sh.B / sh.c, 1)) + ' cm per cubit.', ['Referent = wall length ÷ that student’s count.'], 'implied referents');
      } },
      { id: 'e20c', sub: 'c', level: 'PRG', make: function (r, sh) {
        var ip = fx(sh.N / sh.b, 1), ic = fx(sh.B / sh.c, 1);
        return mc(r, 'A ' + ip + '-cm pace and a ' + ic + '-cm cubit: what do these tell you?', [
          { html: 'Both are possible for a real person (a long stride; a short forearm), so neither estimate can be thrown out as absurd — the disagreement has to be settled by measuring.', right: true },
          { html: 'A ' + ip + '-cm pace is impossible, so Nadia’s estimate must be wrong.', why: 'A brisk adult stride easily reaches about a metre — it isn’t impossible.' },
          { html: 'A ' + ic + '-cm cubit is impossible, so Beckett’s estimate must be wrong.', why: 'Forearms (elbow to fingertip) of about 40 cm are common — it isn’t impossible.' },
          { html: 'Both are impossible, so both estimates are wrong.', why: 'Both lengths describe an ordinary person.' }],
          'Each reconciliation describes a perfectly ordinary body, so neither estimate is absurd. Inspecting the numbers can’t decide it — something has to be measured.', ['Is either length impossible for a real person?'], 'neither estimate absurd');
      } },
      { id: 'e20d', sub: 'd', level: 'PRG', make: function (r, sh) {
        return mc(r, 'Which estimate is <b>likelier</b> to be the closer one, and why?', [
          { html: 'Beckett’s, weakly: he laid his referent down ' + sh.b + ' times against Nadia’s ' + sh.c + ', so placement error accumulates less. (Against: a wrong referent <b>value</b> doesn’t depend on the count, so if Nadia knows her cubit better she could still win.)', right: true },
          { html: 'Nadia’s, because a smaller referent is always more precise.', why: 'Part C showed the opposite for placement error: more placements, more accumulated error.' },
          { html: 'Nadia’s, because her estimate is larger.', why: 'A larger estimate isn’t a more accurate one.' },
          { html: 'Neither can be favoured at all; the counts tell us nothing.', why: 'The counts matter: placement error grows with the number of placements.' }],
          'The argument the numbers support: placement error ' + t('=\\text{count}\\times\\text{error per placement}') + ', and Beckett placed his referent less than half as often. But the referent-value error doesn’t depend on the count, so the verdict is only weak.', ['Which student laid their referent down fewer times?'], 'likelier closer estimate');
      } },
      { id: 'e20e', sub: 'e', level: 'PRG', make: function (r) {
        return mc(r, 'What extra information would settle the disagreement? Distinguish what settles <b>how long the wall is</b> from what settles <b>whose method was better</b>.', [
          { html: 'A tape measure on the wall settles its length. Measuring each student’s own referent (Nadia’s cubit, Beckett’s pace) settles whose assumed value — and so whose method — was better.', right: true },
          { html: 'Averaging the two estimates settles both questions.', why: 'An average is still an estimate; it can’t say whose method was better.' },
          { html: 'Having both students count again settles both questions.', why: 'Recounting doesn’t test the referent values they assumed.' },
          { html: 'Converting both estimates to feet settles both questions.', why: 'Converting doesn’t add any information.' }],
          'Two different questions, two measurements: tape the wall (its length), and measure each referent (whose assumed value was closer to the truth). A student can get the wall nearly right with a badly known referent if two errors cancel.', ['What would you measure to know the wall’s length? To know each referent?'], 'what settles the disagreement');
      } },
      { id: 'e20f', sub: 'f i', level: 'ADV', make: function (r, sh) {
        var T = sh.T, Tc = rnd(T * 100, 4);
        return fieldsPart('A tape now gives the wall as ' + t(fx(T, 2)) + ' m. Find each student’s percent error (nearest tenth), then each student’s true referent length (nearest tenth of a centimetre). (Nadia: ' + sh.c + ' cubits, ' + t(fx(sh.N / 100, 2)) + ' m; Beckett: ' + sh.b + ' paces, ' + t(fx(sh.B / 100, 2)) + ' m.)',
          [{ label: 'Nadia’s % error', after: '%', x: pct(sh.N / 100, T), dp: 1, alts: percAlts(sh.N / 100, T) }, { label: 'Beckett’s % error', after: '%', x: pct(sh.B / 100, T), dp: 1, alts: percAlts(sh.B / 100, T) }, { label: 'Nadia’s true cubit', after: 'cm', x: Tc / sh.c, dp: 1, alts: [] }, { label: 'Beckett’s true pace', after: 'cm', x: Tc / sh.b, dp: 1, alts: [] }],
          'Nadia: ' + pctTex(fx(sh.N / 100, 2), fx(T, 2)) + '. Beckett: ' + pctTex(fx(sh.B / 100, 2), fx(T, 2)) + '.<br>True cubit ' + t('\\frac{' + N(Tc) + '}{' + sh.c + '}\\approx' + fx(Tc / sh.c, 1)) + ' cm; true pace ' + t('\\frac{' + N(Tc) + '}{' + sh.b + '}\\approx' + fx(Tc / sh.b, 1)) + ' cm.', ['True referent = tape length (in cm) ÷ count.'], 'tape settles it');
      } },
      { id: 'e20g', sub: 'f ii', level: 'EMG', make: function (r, sh) {
        var bOK = Math.abs(sh.B / 100 - sh.T) < Math.abs(sh.N / 100 - sh.T), pN = fx(pct(sh.N / 100, sh.T), 1), pB = fx(pct(sh.B / 100, sh.T), 1);
        return mc2(r, 'With the tape at ' + t(fx(sh.T, 2)) + ' m (Nadia ' + t(pN + '\\%') + ' off, Beckett ' + t(pB + '\\%') + ' off), does the verdict “Beckett’s estimate is likelier to be closer” survive?', [
          { html: '<b>Yes</b> — Beckett is closer.', right: bOK, why: bOK ? null : 'Compare the two percent errors: Nadia’s is the smaller this time.' },
          { html: '<b>No</b> — Nadia is closer.', right: !bOK, why: !bOK ? null : 'Compare the two percent errors: Beckett’s is the smaller.' }],
          (bOK ? 'Beckett is ' + pB + '% off and Nadia ' + pN + '%: the verdict survives.' : 'Nadia is ' + pN + '% off and Beckett ' + pB + '%: this time the verdict does not survive — “likelier” is not “certain”.'), [], 'verdict survives?');
      } }] },
    /* ---------- Part J ---------- */
    { num: '21', section: 'Extra practice J — Reading a vernier caliper and a micrometer', stem: 'State the coarse reading and the fine reading separately, then add them. Then find how far the thimble must still turn — in complete revolutions (one revolution ' + t('=50') + ' divisions ' + t('=0.50') + ' mm) and divisions — to bring the reading up to the next whole millimetre.',
      shared: function (r) { return { a: [2 * r.int(4, 14), r.int(3, 47)], b: [2 * r.int(4, 14), r.int(3, 47)] }; }, parts: [
      { id: 'e21a', sub: 'a i', level: 'PRG', make: function (r, sh) { return micSteps(sh.a[0], sh.a[1]); } },
      { id: 'e21b', sub: 'a ii', level: 'ADV', make: function (r, sh) { return micTurn(sh.a[0], sh.a[1]); } },
      { id: 'e21c', sub: 'b i', level: 'PRG', make: function (r, sh) { return micSteps(sh.b[0], sh.b[1]); } },
      { id: 'e21d', sub: 'b ii', level: 'ADV', make: function (r, sh) { return micTurn(sh.b[0], sh.b[1]); } }] },
    { num: '22', stem: 'A vernier caliper reads to 0.05 mm.', shared: function (r) { return { M: r.int(12, 90), n: r.int(2, 19) }; }, parts: [
      { id: 'e22a', sub: 'a', level: 'PRG', make: function (r, sh) {
        var M = sh.M, n = sh.n, x = M + 0.05 * n;
        var p = fieldsPart('State the coarse reading, the fine reading, and the total, written to the caliper’s own precision.' + vernSvg(M, n), [
          { label: 'Coarse (main scale)', after: 'mm', x: M, exact: true, alts: [{ v: M + n, code: 'vern-aligned', hint: 'The coarse reading is taken at the vernier’s <b>0</b> (the index), not where the lines meet.' }, { v: M + 1, code: 'vern-coarse', hint: 'The last whole millimetre <b>at or before</b> the index.' }] },
          { label: 'Fine (vernier)', after: 'mm', x: rnd(0.05 * n, 4), exact: true, alts: [{ v: 0.1 * n, code: 'vern-tenths', hint: 'Each vernier division is 0.05 mm.' }, { v: 0.01 * n, code: 'vern-tenths', hint: 'Each vernier division is 0.05 mm.' }] },
          { label: 'Reading', after: 'mm', x: rnd(x, 4), dp: 2, exact: true, alts: vernAlts(M, n) }],
          'Coarse: the index has passed ' + t(M) + ' mm but not ' + t(M + 1) + ': ' + t(M + '\\text{ mm}') + '. Fine: division ' + t(n) + ' lines up, ' + t(n + '\\times0.05=' + fx(0.05 * n, 2) + '\\text{ mm}') + '. Reading ' + t(M + '+' + fx(0.05 * n, 2) + '=' + fx(x, 2)) + ' mm.', ['Coarse at the index; fine where a vernier line meets a main-scale line.'], 'vernier coarse + fine ' + fx(x, 2));
        p.key[2] = fx(x, 2);
        return p;
      } },
      { id: 'e22b', sub: 'b', level: 'ADV', make: function (r, sh) {
        var M = sh.M, n = sh.n, x = M + 0.05 * n, d = rnd(M + 1 - x, 4);
        return fieldsPart('The caliper reads ' + t(fx(x, 2)) + ' mm (index past ' + t(M) + ', division ' + t(n) + ' lined up). How much further must the slide move for the vernier’s 0 to reach the next whole millimetre? Which vernier division would line up then, and what would the reading be?', [
          { label: 'Further', after: 'mm', x: d, exact: true, alts: [{ v: rnd(0.05 * n, 4), code: 'vern-backwards', hint: 'That is how far the index is <b>past</b> ' + M + ' mm. How far is it to ' + (M + 1) + ' mm?' }] },
          { label: 'Division lining up', x: 0, exact: true, alts: [{ v: 20, code: 'vern-zero', hint: 'When the index sits exactly on a whole millimetre, it is the vernier’s <b>0</b> mark that lines up.' }, { v: n + 1, code: 'vern-zero', hint: 'At a whole millimetre the fine reading is 0, so the division lining up is 0.' }] },
          { label: 'Reading', after: 'mm', x: M + 1, dp: 2, exact: true, alts: [] }],
          t((M + 1) + '-' + fx(x, 2) + '=' + fx(d, 2)) + ' mm further. Then the index sits on the ' + (M + 1) + ' mm line, so division <b>0</b> lines up and the reading is ' + t((M + 1) + '+0\\times0.05=' + fx(M + 1, 2)) + ' mm.', ['How far is the index from the next whole millimetre?'], 'vernier to next whole mm');
      } }] },
    { num: '23', stem: function (sh) { return '<b>The half-millimetre line.</b> A micrometer reads as shown.' + micSvg(sh.h, sh.f); }, shared: function (r) { return { h: 2 * r.int(3, 11) + 1, f: r.int(3, 47) }; }, parts: [
      { id: 'e23a', sub: 'a', level: 'PRG', make: function (r, sh) { var p = micSteps(sh.h, sh.f, true); p.prompt = 'State the coarse reading, the fine reading, and the total.'; return p; } },
      { id: 'e23b', sub: 'b', level: 'EMG', make: function (r, sh) {
        var w = Math.floor(sh.h / 2);
        return mc(r, 'Was the coarse reading given by a whole-millimetre mark or by a half-millimetre mark? How does the diagram tell you?', [
          { html: 'A <b>half</b>-millimetre mark: the last mark the thimble has uncovered is a short one <b>below</b> the index line, one half-step past the ' + w + ' mm mark.', right: true },
          { html: 'A <b>whole</b>-millimetre mark: the last numbered mark is the coarse reading.', why: 'Look below the line, just left of the thimble: a half-millimetre mark is showing past the last whole mm.' },
          { html: 'A <b>whole</b>-millimetre mark: the half marks are above the line.', why: 'The whole millimetres are above the line; the half millimetres are the short marks <b>below</b> it.' },
          { html: 'A <b>half</b>-millimetre mark: the thimble reading is more than 25.', why: 'The thimble reading doesn’t tell you about the sleeve. Look at the last sleeve mark the thimble has uncovered.' }],
          'Whole millimetres are marked above the index line, halves below it. The last uncovered mark is a short one below the line, half a step past ' + w + ' mm, so the coarse reading is ' + t(fx(sh.h / 2, 1)) + ' mm.', ['Which marks are above the line, and which are below?'], 'half-mm mark');
      } },
      { id: 'e23c', sub: 'c i', level: 'PRG', make: function (r, sh) {
        var x = 0.5 * sh.h + 0.01 * sh.f, w = Math.floor(sh.h / 2);
        return fieldsPart('A student takes the coarse reading from the last <b>whole</b>-millimetre mark (' + t(w) + ' mm) instead. What do they report, and by how much are they out? (The correct reading is ' + t(fx(x, 2)) + ' mm.)', [{ label: 'They report', after: 'mm', x: rnd(x - 0.5, 4), dp: 2, exact: true, alts: [] }, { label: 'Out by', after: 'mm', x: 0.5, dp: 2, exact: true, alts: [] }],
          t(w + '+' + fx(0.01 * sh.f, 2) + '=' + fx(x - 0.5, 2)) + ' mm, which is ' + t(fx(x, 2) + '-' + fx(x - 0.5, 2) + '=0.50') + ' mm too small.', ['Coarse = ' + w + ' mm (wrongly), plus the same fine reading.'], 'missed half mark');
      } },
      { id: 'e23d', sub: 'c ii', level: 'EMG', make: function (r) {
        return mc(r, 'Why is that mistake always exactly the same size?', [
          { html: 'The only thing skipped is one half-millimetre sleeve mark, and every sleeve mark is ' + t('0.50') + ' mm from its neighbour.', right: true },
          { html: 'Because the thimble always reads 50 divisions.', why: 'The thimble reading is the same in both answers; what changes is the sleeve reading.' },
          { html: 'It isn’t: it depends on the thimble reading.', why: 'The fine reading is added the same way either way, so it cancels in the difference.' },
          { html: 'Because micrometers are only accurate to 0.5 mm.', why: 'A micrometer reads to 0.01 mm. The size of the slip comes from the spacing of the sleeve marks.' }],
          'Skipping the half mark drops exactly one sleeve step, 0.50 mm — never 0.4 or 0.6. A micrometer reading that is out by half a millimetre almost always means this slip.', ['What is the distance between neighbouring sleeve marks?'], 'why the slip is 0.50 mm');
      } }] },
    { num: '24', stem: 'Name the best instrument for each job — think about both the <b>size</b> of the thing being measured and the <b>precision</b> the job needs.', parts: [
      { id: 'e24', sub: 'a–f', level: 'EMG', make: function (r) {
        var pools = { W: [['The perimeter of a school field', 'hundreds of metres, a tenth of a metre is plenty; it rolls along the ground'], ['The length of a walking trail', 'a long distance along the ground; a tenth of a metre is plenty']],
          T: [['The length and width of a classroom, for a flooring order', 'a few metres, to about the nearest centimetre'], ['The height of a doorway, for a new door', 'about 2 m, to the nearest millimetre or so']],
          R: [['The length of a bolt, about 60 mm, needed to the nearest millimetre', 'fits on a ruler, and the nearest millimetre is all that is wanted'], ['The width of a book cover, to the nearest millimetre', 'fits on a ruler; nearest millimetre is enough']],
          V: [['The inside diameter of a pipe fitting, about 30 mm, needed to 0.1 mm', 'inside jaws, and 0.05 mm precision is finer than the 0.1 mm needed'], ['The depth of a drilled hole, needed to 0.1 mm', 'its depth rod measures depths to 0.05 mm']],
          M: [['The diameter of a copper wire, for a current-carrying calculation', 'about a millimetre across; 0.01 mm precision is needed'], ['The thickness of one sheet of paper', 'measure a stack of 50 sheets and divide: one sheet is only about 0.1 mm']] };
        var keys = ['W', 'T', 'R', 'V', 'M'], picks = keys.map(function (k) { return [k, r.pick(pools[k])]; }), ex = r.pick(keys);
        picks.push([ex, pools[ex].filter(function (o) { return o !== picks[keys.indexOf(ex)][1]; })[0]]);
        picks = r.shuffle(picks);
        var rows = picks.map(function (p, i) { return { id: 'r' + i, html: '(' + 'abcdef'.charAt(i) + ') ' + p[1][0] }; }), want = {};
        picks.forEach(function (p, i) { want['r' + i] = p[0]; });
        var cols = [{ id: 'W', html: 'W', name: 'Trundle wheel' }, { id: 'T', html: 'T', name: 'Tape measure' }, { id: 'R', html: 'R', name: 'Ruler' }, { id: 'V', html: 'C', name: 'Vernier caliper' }, { id: 'M', html: 'M', name: 'Micrometer' }];
        return named(P.grid('Choose the best instrument for each job.<br><small><b>W</b> trundle wheel · <b>T</b> tape measure · <b>R</b> ruler · <b>C</b> vernier caliper · <b>M</b> micrometer</small>', rows, cols, want, { why: function (row) { var i = Number(row.slice(1)); return { code: 'row', hint: 'Check ' + rows[i].html.slice(4) + ': how big is it, and how precisely must it be known?' }; } },
          picks.map(function (p, i) { return rows[i].html + ': <b>' + cols.filter(function (c) { return c.id === p[0]; })[0].name + '</b> — ' + p[1][1] + '.'; }).join('<br>'), ['Trundle wheel: long distances on the ground. Tape: rooms. Ruler: desk-sized, to 1 mm. Caliper: small objects, inside sizes and depths, to 0.05 mm. Micrometer: thicknesses of tiny objects, to 0.01 mm.'], 'best instrument for each job'), rows, cols);
      } }] }
  ];

  /* ---------- extra-practice part makers ---------- */
  function e2err(sh, who, count, val, trueVal) {
    var est = rnd(count * val, 4), err = rnd(Math.abs(sh.L - est), 4), pc = err / sh.L * 100;
    return fieldsPart(who + ' multiplies the count (' + t(F(count)) + ') by ' + t(N(val)) + ' cm. State the estimate in metres, the error in centimetres and in metres, and the error as a percent of ' + t(FX(sh.L / 100, 2)) + ' m (nearest tenth).', [
      { label: 'Estimate', after: 'm', x: est / 100, exact: true, alts: unitAlts(est / 100, 'm') },
      { label: 'Error', after: 'cm', x: err, exact: true, alts: [] },
      { label: '', name: 'Error in metres', after: 'm', x: rnd(err / 100, 6), exact: true, alts: unitAlts(err / 100, 'm') },
      { label: 'Percent error', after: '%', x: pc, dp: 1, alts: [{ v: err / est * 100, code: 'pct-base', hint: 'Divide by the true length, ' + FX(sh.L / 100, 2) + ' m.' }, { v: err / sh.L, code: 'pct-no100', hint: 'Multiply by 100 for a percent.' }] }],
      t(F(count) + '\\times' + N(val) + '=' + N(est) + '\\text{ cm}=' + FX(est / 100, 2) + '\\text{ m}') + '. Error ' + t(F(sh.L) + '-' + N(est) + '=' + N(err) + '\\text{ cm}=' + N(err / 100) + '\\text{ m}') + ' (too ' + (est < sh.L ? 'small' : 'large') + '). ' + t('\\frac{' + N(err) + '}{' + F(sh.L) + '}\\times100\\approx' + fx(pc, 1) + '\\%') + '.',
      ['Estimate = count × the value used. Error = |true − estimate|.'], who + ' estimate and error');
  }
  function e4part(id, sub, level, plural, name, ref, lo, hi, step) {
    return { id: id, sub: sub, level: level, make: function (r) {
      var n = r.int(lo, hi) * (step || 1), c = rnd(n * ref, 4);
      return fieldsPart(t(n) + ' ' + plural + ', ' + name + ' ' + t('=' + N(ref)) + ' cm.', [{ label: 'Estimate', after: 'cm', x: c, exact: true, alts: [{ v: n / ref, code: 'divided', hint: 'Estimate = count <b>×</b> referent length.' }] }, { label: '', name: 'In metres', after: 'm', x: rnd(c / 100, 6), exact: true, alts: unitAlts(c / 100, 'm').concat([{ v: c / 1000, code: 'unit-slip', hint: 'There are 100 cm in a metre, not 1 000.' }]) }],
        t(n + '\\times' + N(ref) + '=' + N(c) + '\\text{ cm}=' + fx(c / 100, 2) + '\\text{ m}') + '.', ['Estimate = count × referent length; then ÷ 100 for metres.'], n + ' ' + plural);
    } };
  }
  function e5count(mTxt, cm, ref, name, plural) {
    var n = cm / ref;
    return exactPart('An estimate of ' + t(mTxt) + ' m using a ' + name + ' of ' + t(ref) + ' cm. How many ' + plural + '?', n, plural, [{ v: Number(mTxt) / ref, code: 'unit-slip', hint: 'Change the metres to centimetres first (×100).' }, { v: cm * ref, code: 'multiplied', hint: 'Count = estimate ÷ referent length.' }],
      t('\\text{count}=\\frac{\\text{estimate}}{\\text{referent}}=\\frac{' + F(cm) + '}{' + ref + '}=' + n) + ' ' + plural + ' (exactly).', ['Count = estimate ÷ referent, both in centimetres.'], plural + ' in ' + mTxt + ' m');
  }
  function e7part(sh, n, what) {
    var tr = rnd(n * sh.t, 4), es = n * 20, er = rnd(es - tr, 4);
    return fieldsPart('He lays his span end to end ' + t(n) + ' times along ' + what + '. Give the true length and Theo’s estimate, both in metres, and the error in centimetres.', [
      { label: 'True length', after: 'm', x: rnd(tr / 100, 6), exact: true, alts: [{ v: es / 100, code: 'used-assumed', hint: 'The true length uses the <b>true</b> span, ' + fx(sh.t, 1) + ' cm.' }] },
      { label: 'Estimate', after: 'm', x: es / 100, exact: true, alts: [] },
      { label: 'Error', after: 'cm', x: er, exact: true, alts: [{ v: er / 100, code: 'unit-slip', hint: 'Give the error in <b>centimetres</b>.' }] }],
      'True ' + t(n + '\\times' + fx(sh.t, 1) + '=' + N(tr) + '\\text{ cm}=' + N(tr / 100) + '\\text{ m}') + '; estimate ' + t(n + '\\times20=' + F(es) + '\\text{ cm}=' + fx(es / 100, 2) + '\\text{ m}') + '; error ' + t(N(er)) + ' cm too large — that is ' + t(fx(20 - sh.t, 1) + '\\text{ cm}\\times' + n) + '.', ['True = count × true span; estimate = count × 20 cm.'], 'span error over ' + n);
  }
  function e10part(v, k) {
    var e = v[0], m = v[1], u = v[2], dp = v[3];
    return nearPart('(' + k + ') estimate ' + t(fx(e, dp)) + ' ' + u + ', measured ' + t(fx(m, dp)) + ' ' + u, pct(e, m), 1, '%', percAlts(e, m).concat([{ v: Math.abs(e - m), code: 'pct-abs', hint: 'That is the error itself. Divide by the measured value and multiply by 100.' }]),
      pctTex(fx(e, dp), fx(m, dp)) + '.', ['Percent error = |estimate − measured| ÷ measured × 100.'], 'percent error ' + fx(e, dp) + ' vs ' + fx(m, dp));
  }
  function e15fig(a, b) {
    var c = 14, W = a * c + 70, H = b * c + 40, s = '';
    for (var i = 1; i < a; i++) s += L(20 + i * c, 10, 20 + i * c, 10 + b * c, { c: '#9fb3c8', w: 0.8 });
    for (var j = 1; j < b; j++) s += L(20, 10 + j * c, 20 + a * c, 10 + j * c, { c: '#9fb3c8', w: 0.8 });
    s += R(20, 10, a * c, b * c, 'none', { stroke: BLUE, sw: 2 });
    s += TX(20 + a * c / 2, 22 + b * c, a + ' spans', { size: 12 }); s += TX(26 + a * c, 10 + b * c / 2, b + ' spans', { size: 12, anchor: 'start' });
    return svgFit(W, H, s, 'rug covered by spans', W);
  }
  function micSteps(h, f, noFig) {
    var c = 0.5 * h, x = c + 0.01 * f, half = h % 2 === 1;
    var p = fieldsPart((noFig ? '' : micSvg(h, f)), [
      { label: 'Coarse (sleeve)', after: 'mm', x: c, exact: true, alts: half ? [{ v: c - 0.5, code: 'mic-half', hint: 'Look below the index line: a half-millimetre mark is showing.' }, { v: c + 0.5, code: 'mic-hidden', hint: 'Use the last mark the thimble has <b>uncovered</b>.' }] : [{ v: c + 0.5, code: 'mic-half', hint: 'No half-millimetre mark is showing below the line past the last whole mm.' }] },
      { label: 'Fine (thimble)', after: 'mm', x: rnd(0.01 * f, 4), exact: true, alts: [{ v: rnd(0.1 * f, 4), code: 'mic-tenths', hint: 'Each thimble division is 0.01 mm.' }, { v: rnd(0.01 * (f + 1), 4), code: 'mic-neighbour', hint: 'Read the mark exactly on the index line.' }, { v: rnd(0.01 * (f - 1), 4), code: 'mic-neighbour', hint: 'Read the mark exactly on the index line.' }] },
      { label: 'Reading', after: 'mm', x: rnd(x, 4), dp: 2, exact: true, alts: micAlts(h, f) }],
      'Coarse: the thimble edge has uncovered ' + t(fx(c, 1)) + ' mm' + (half ? ' (a half-mm mark below the line)' : ' but not ' + t(fx(c + 0.5, 1))) + '. Fine: division ' + t(f) + ', ' + t(f + '\\times0.01=' + fx(0.01 * f, 2) + '\\text{ mm}') + '. Reading ' + t(fx(c, 1) + '+' + fx(0.01 * f, 2) + '=' + fx(x, 2)) + ' mm.',
      ['Coarse: last uncovered sleeve mark (halves are below the line). Fine: thimble number on the index line × 0.01 mm.'], 'micrometer coarse + fine ' + fx(x, 2));
    if (!p.prompt) p.prompt = 'Read the micrometer.';
    p.key[2] = fx(x, 2);
    return p;
  }
  function micTurn(h, f) {
    var x = 0.5 * h + 0.01 * f, next = Math.floor(x + 1e-9) + 1, rem = rnd(next - x, 4), rev = Math.floor(rem / 0.5 + 1e-9), div = Math.round((rem - 0.5 * rev) / 0.01);
    var p = { prompt: 'This micrometer reads ' + t(fx(x, 2)) + ' mm. How far must the thimble still turn to bring the reading up to ' + t(next + '.00') + ' mm? (One revolution ' + t('=50') + ' divisions ' + t('=0.50') + ' mm.)' + micSvg(h, f),
      input: { type: 'fields', fields: [{ label: 'Complete revolutions', name: 'Revolutions' }, { label: 'plus divisions', name: 'Divisions' }] },
      check: function (resp) {
        resp = resp || []; var a = num(resp[0]), b = num(resp[1]);
        if (a == null || b == null) return form('blank', 'Fill in both boxes (use 0 if there are no complete revolutions).');
        var tot = 50 * a + b;
        if (near(tot, 50 * rev + div)) { if (b >= 50) return form('div-over-50', 'Right amount — but 50 divisions make a full revolution, so carry.'); return ok(); }
        if (near(a, 0) && near(b, Math.round(rem / 0.01))) return form('div-over-50', 'Right amount — but 50 divisions make a full revolution, so carry.');
        if (near(tot, f)) return wrong('mic-turn-back', 'That is how far the thimble has <b>already</b> turned past the last mark. How much is <b>left</b> to the next whole millimetre?');
        if (near(tot, 50 - f) && rev === 1) return wrong('mic-turn-half', 'That only reaches the next half-millimetre mark. A whole millimetre needs one more full revolution (0.50 mm).');
        return wrong('value', null);
      },
      key: [String(rev), String(div)], answer: rev + ' revolution' + (rev === 1 ? '' : 's') + ' + ' + div + ' divisions',
      solution: t(next + '.00-' + fx(x, 2) + '=' + fx(rem, 2)) + ' mm ' + t('=' + (rev ? '0.50+' : '') + fx(rem - 0.5 * rev, 2)) + ': <b>' + rev + ' full turn' + (rev === 1 ? '' : 's') + ' plus ' + div + ' divisions</b>.',
      hints: ['Remaining distance = next whole mm − reading.', 'One revolution is 0.50 mm; each division is 0.01 mm.'], text: 'thimble turns to next mm' };
    p.bad = [['0', String(f)], ['0', String(50 - f)]].filter(function (b) { return !(near(50 * Number(b[0]) + Number(b[1]), 50 * rev + div)); });
    return p;
  }

  HW.addCodes({
    'hand-1in': 'Used 1 in for a hand width (it is 4 in)', 'half-pace': 'Used a half-pace (45 cm) as the largest error', 'used-assumed': 'Used the assumed referent where the true one belongs', 'used-true': 'Used the true referent where the assumed one belongs',
    factor: 'Not factored', 'no-waste': 'Left out the 10% waste allowance', 'other-factor': 'Wrong conversion factor', perimeter: 'Gave the perimeter for an area', 'area-units': 'Area not computed in metres',
    'pct-double': 'Took the area error as exactly double', 'pct-same': 'Took the area error as the length error', 'pct-triple': 'Took the volume error as exactly triple', 'pct-square': 'Squared instead of cubed for a volume',
    'half-perimeter': 'Added only two sides of the rectangle', area: 'Gave the area for a perimeter', 'mixed-referents': 'Added counts of different referents', swapped: 'Swapped which estimate is assumed correct',
    'vern-backwards': 'Vernier: distance past the mark instead of to the next mark', 'vern-zero': 'Vernier: wrong division at a whole millimetre', 'div-over-50': '50 or more thimble divisions not carried',
    'mic-turn-back': 'Micrometer: gave the turn already made, not the turn left', 'mic-turn-half': 'Micrometer: stopped at the half-millimetre mark'
  });

  HW.defineLesson({
    id: 'u10l1', unit: 10, num: '1', title: 'Systems of Measurement, Referents, and Measuring Instruments', outcome: 'M1',
    blurb: 'Imperial and SI units, personal referents (estimate = count × referent), choosing the right unit and instrument, and reading a ruler, a vernier caliper and a micrometer.',
    questions: questions, extra: extra
  });
})(window);
