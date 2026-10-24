/* Math 10C · Unit 10 (Measurement: M1 referents and instruments, M2 conversions, M3 surface area and volume) — exit slips
 * for Lessons 10.1–10.6 (ids u10l1x … u10l6x, "Exit Slip 10.1" …). One HW.defineExit per lesson: 3–4 short questions (one
 * per box, Beginning → Progressing → Mastery) that check that day's main skills with new wording and contexts, at the
 * difficulty the lesson's assignment rates them. Every part is a generator with a key, worked solution, hints and typical
 * wrong answers (codes u10x-… plus the shared measurement codes). Calculator allowed (as on the Unit 10 test): use the π key
 * and round only the final answer. Lesson 10.6 (review) mixes M1, M2 and M3. */
(function (root) {
  'use strict';
  var HW = root.HW, K = HW.kit, P = K.P, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form, F = HW.fmt;
  var PI = Math.PI;

  HW.addCodes({
    'u10x-ref-count': 'Exit 10: gave the number of referents, not the length',
    'u10x-ref-unit': 'Exit 10: referent length converted with the wrong factor',
    'u10x-rate-one': 'Exit 10: converted only one of the two units in a rate',
    'u10x-cm3-l': 'Exit 10: litres not changed to cm³ (1 L = 1000 cm³)',
    'u10x-same-unit': 'Exit 10: subtracted lengths in different units',
    'u10x-yd-in': 'Exit 10: used the wrong number of inches in a yard',
    'u10x-slant-sub': 'Exit 10: working back from the surface area, solved the formula wrongly'
  });
  HW.addPartial({ 'u10x-ref-count': 'n', 'u10x-ref-unit': 'b', 'u10x-rate-one': 'b', 'u10x-cm3-l': 's', 'u10x-same-unit': 'n', 'u10x-yd-in': 'b', 'u10x-slant-sub': 'b' });

  /* ---------------- numbers ---------------- */
  function rd(x, dp) { return K.roundTo(x, dp); }
  function cl(x) { return Number(Number(x).toPrecision(12)); }
  function fx(x, dp) { return rd(x, dp).toFixed(dp); }
  function fxT(x, dp) { return F(fx(x, dp)); }
  function nT(x) { return F(String(cl(x))); }                 // an exact value in LaTeX
  function dots(x) { var v = Math.floor(Math.abs(x) * 1e3 + 1e-7) / 1e3; return (x < 0 ? '-' : '') + F(v.toFixed(3)) + '\\ldots'; }
  function near(a, b, rel) { return Math.abs(a - b) <= Math.max(1e-9, Math.abs(b) * (rel || 1e-9)); }
  function decs(x) { return (String(cl(x)).split('.')[1] || '').length; }
  function safe(x, dp, m) { var s = Math.abs(x) * Math.pow(10, dp), f = s - Math.floor(s); return Math.abs(f - 0.5) > (m == null ? 0.06 : m); }
  function find(gen, test, fb) { for (var i = 0; i < 600; i++) { var v = gen(); if (v && test(v)) return v; } return fb; }
  function A(v, code, hint) { return { v: v, code: code, hint: hint }; }
  function tenth(r, lo, hi) { return r.int(Math.round(lo * 10), Math.round(hi * 10)) / 10; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function U(u) { if (!u) return ''; var m = /^(.*?)([²³])$/.exec(u); if (m) return '\\text{ ' + m[1] + '}^{' + (m[2] === '²' ? 2 : 3) + '}'; return '\\text{ ' + u + '}'; }
  function uT(u) { return u.charAt(0) === 'µ' ? '\\mu\\text{' + u.slice(1) + '}' : '\\text{' + u + '}'; }
  function disp(s) { return '\\[' + s + '\\]'; }
  /* a unit-analysis chain: fs = [[num, numUnit, den, denUnit], …]; units on top and bottom are cancelled (from u10l2) */
  function chainT(fs) {
    var top = {}, bot = {}, ct = {}, cb = {};
    fs.forEach(function (f) { if (f[1]) top[f[1]] = (top[f[1]] || 0) + 1; if (f[3]) bot[f[3]] = (bot[f[3]] || 0) + 1; });
    Object.keys(top).forEach(function (u) { ct[u] = cb[u] = Math.min(top[u], bot[u] || 0); });
    function side(n, u, cnt) { var ut = u ? uT(u) : ''; if (u && cnt[u] > 0) { cnt[u]--; ut = '\\cancel{' + ut + '}'; } var nt = n == null ? '' : (typeof n === 'string' ? n : nT(n)); return nt && ut ? nt + '\\ ' + ut : (nt || ut || '1'); }
    return fs.map(function (f) { return '\\dfrac{' + side(f[0], f[1], ct) + '}{' + side(f[2], f[3], cb) + '}'; }).join('\\times ');
  }

  /* ---------------- checkers ---------------- */
  function unitTyped(s) { s = String(s == null ? '' : s); if (!/[a-zA-Zµμ'"′″%]/.test(s)) return false; var rest = s.replace(/\\text\{[^}]*\}|\\mu|[a-zA-Zµμ'"′″%{}\\/²³^]+/g, ' '); return HW.parse.number(rest).ok; }
  function wrapUnit(ch) {
    return function (resp) {
      var s = String(resp == null ? '' : resp);
      if (/^\s*\\?\$/.test(s) && HW.parse.number(s.replace(/^\s*\\?\$/, '')).ok) return form('unit-in-box', 'Leave out the ' + t('\\$') + ' sign — just type the number.');
      if (unitTyped(s)) return form('unit-in-box', 'Type just the number — the unit is already written after the box.');
      return ch(resp);
    };
  }
  /* an exact number; alts = [{v, code, hint}]; a power-of-ten slip is diagnosed unless o.places === false */
  function exactCheck(ans, alts, o) {
    o = o || {};
    alts = (alts || []).filter(function (a) { return isFinite(a.v) && !near(a.v, ans, 1e-9); });
    var dpA = decs(ans);
    var base = K.number(ans, function (v) {
      for (var i = 0; i < alts.length; i++) if (near(v, alts[i].v, 0.002)) return { code: alts[i].code, hint: alts[i].hint };
      if (o.places !== false && ans !== 0) for (var j = -9; j <= 9; j++) if (j && near(v, ans * Math.pow(10, j), 1e-6)) return { code: 'prefix-places', hint: 'The digits are right, but the decimal point is ' + Math.abs(j) + ' place' + (Math.abs(j) > 1 ? 's' : '') + ' off. Check how many powers of ten the conversion crosses.' };
      return null;
    });
    return wrapUnit(function (resp) {
      var p = HW.parse.number(resp);
      if (p.ok && !near(p.value, ans, 1e-9)) { var d = decs(p.value); if (d < dpA && near(rd(ans, d), p.value, 1e-9)) return form('exact-round', 'Close — but this comes out <b>exactly</b>. Don’t round: give every decimal place.'); }
      if (p.ok && o.abs && near(-p.value, ans, 1e-9)) return ok();
      return base(resp);
    });
  }
  /* a rounded value (K.near) that also accepts 4 for 4.0 */
  function nearCheck(x, dp, alts) {
    var c = K.near(x, dp, { alts: (alts || []).filter(function (a) { return isFinite(a.v); }) });
    return wrapUnit(function (resp) { var p = HW.parse.number(resp); if (p.ok && near(p.value, rd(x, dp), 1e-9)) return ok(); return c(resp); });
  }
  function badNear(x, dp, alts) { var seen = {}, out = []; seen[fx(x, dp)] = 1; (alts || []).forEach(function (a) { if (!isFinite(a.v) || a.v < 0) return; var s = fx(a.v, dp); if (!seen[s]) { seen[s] = 1; out.push(s); } }); return out; }
  function badExact(x, alts) { var out = []; (alts || []).forEach(function (a) { if (isFinite(a.v) && !near(a.v, x, 1e-9) && a.v >= 0) out.push(String(cl(a.v))); }); return out; }
  /* one number box: o = { unit, before, dp (rounded) | exact, alts } */
  function numPart(prompt, x, o, sol, hints, text) {
    var exact = o.dp == null, key = exact ? String(cl(x)) : fx(x, o.dp);
    var p = { prompt: prompt, input: { type: 'number', before: o.before, after: o.unit }, check: exact ? exactCheck(x, o.alts, o) : nearCheck(x, o.dp, o.alts), key: key,
      answer: (o.before ? o.before + ' ' : '') + t(F(key)) + (o.unit ? ' ' + esc(o.unit) : ''), solution: sol, hints: hints || [], text: text };
    p.bad = (exact ? badExact(x, o.alts) : badNear(x, o.dp, o.alts)).filter(function (b) { return p.check(b).v !== 'correct'; });
    return p;
  }
  /* several number boxes: specs [{ name, label, before, after, x, dp (or exact), alts } | { check, key, show }] */
  function fieldsPart(prompt, specs, sol, hints, text) {
    var fields = specs.map(function (s) { return { name: s.name || s.label, label: s.label, before: s.before, after: s.after }; });
    var checks = specs.map(function (s) { return s.check || (s.dp == null ? exactCheck(s.x, s.alts, s) : nearCheck(s.x, s.dp, s.alts)); });
    var keys = specs.map(function (s) { return s.key != null ? s.key : s.dp == null ? String(cl(s.x)) : fx(s.x, s.dp); });
    var ans = specs.map(function (s, i) { return (s.label ? s.label + ' ' : s.before ? s.before + ' ' : '') + (s.show || t(F(keys[i]))) + (s.after && !s.show ? ' ' + esc(s.after) : ''); }).join('<br>');
    var p = K.P.fields(prompt, fields, checks, keys, ans, sol, hints, text);
    var bad = [];
    specs.forEach(function (s, i) { var b0 = s.bad || (s.check ? [] : s.dp == null ? badExact(s.x, s.alts) : badNear(s.x, s.dp, s.alts)); b0.slice(0, 2).forEach(function (v) { var k = keys.slice(); k[i] = v; bad.push(k); }); });
    p.bad = bad.filter(function (b) { return p.check(b).v !== 'correct'; });
    return p;
  }

  /* ---------------- SVG primitives and instrument scales (from u10l1) ---------------- */
  var INK = '#2b3340', GREY = '#6a7182', RED = '#b3261e', SOFT = '#f4faf9';
  function L(x1, y1, x2, y2, o) { o = o || {}; return '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" stroke="' + (o.c || INK) + '" stroke-width="' + (o.w || 1) + '"' + (o.dash ? ' stroke-dasharray="' + o.dash + '"' : '') + '/>'; }
  function R(x, y, w, h, fill, o) { o = o || {}; return '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + Math.max(0, w).toFixed(1) + '" height="' + Math.max(0, h).toFixed(1) + '"' + (o.rx ? ' rx="' + o.rx + '"' : '') + ' fill="' + fill + '" stroke="' + (o.stroke || 'none') + '" stroke-width="' + (o.sw || 1) + '"/>'; }
  function TX(x, y, s, o) { o = o || {}; return '<text x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" font-size="' + (o.size || 13) + '" text-anchor="' + (o.anchor || 'middle') + '" dominant-baseline="central" fill="' + (o.c || INK) + '"' + (o.weight ? ' font-weight="' + o.weight + '"' : '') + (o.italic ? ' font-style="italic"' : '') + '>' + esc(s) + '</text>'; }
  function svgFit(W, H, body, aria, maxW) { return '<svg class="fig-svg" viewBox="0 0 ' + Math.ceil(W) + ' ' + Math.ceil(H) + '" width="100%" style="max-width:' + Math.ceil(maxW || W) + 'px" role="img" aria-label="' + esc(aria) + '">' + body + '</svg>'; }
  function svgScroll(W, H, body, aria, minW) {
    return '<div class="grid-scroll" style="margin:8px 0"><svg viewBox="0 0 ' + Math.ceil(W) + ' ' + Math.ceil(H) + '" style="display:block;width:100%;min-width:' + Math.ceil(minW || W) + 'px;max-width:' + Math.ceil(W * 1.25) + 'px;height:auto" role="img" aria-label="' + esc(aria) + '">' + body + '</svg></div>' +
      '<div style="font-size:12px;color:' + GREY + ';margin:-2px 0 6px">On a small screen, swipe the scale sideways to see all of it.</div>';
  }
  function vernSvg(M, Nf) {
    var u = 32, k = u / 0.74, lo = M - 3, hi = M + 21, padL = 20, W = (hi - lo) * u + 2 * padL;
    var X = function (m) { return padL + (m - lo) * u; };
    var top = 26, y0 = top + 1.05 * k, H = y0 + 1.0 * k + 30, p = M + 0.05 * Nf, xz = X(p), xe = xz + 19 * u, s = '';
    s += R(4, top, W - 8, 1.05 * k, '#f2f3f5', { stroke: '#b9bec6' });
    s += TX(padL, 12, 'Main scale (mm)', { weight: 700, size: 14, anchor: 'start' });
    for (var m = lo; m <= hi; m++) { var big = m % 5 === 0, x = X(m); s += L(x, y0, x, y0 - (big ? 0.55 : 0.32) * k, { w: big ? 1.5 : 1 }); if (big) s += TX(x, y0 - 0.55 * k - 9, String(m), { size: 14 }); }
    s += R(xz - 1.15 * k, y0, (xe - xz) + 1.7 * k, 1.0 * k, '#dcdfe4', { stroke: '#a3a9b2' });
    for (var n = 0; n <= 20; n++) { var xn = xz + 0.95 * n * u, bg = n % 5 === 0; s += L(xn, y0, xn, y0 + (bg ? 0.55 : 0.32) * k, { w: n === 0 ? 2.2 : bg ? 1.5 : 1, c: n === 0 ? RED : INK }); if (bg) s += TX(xn, y0 + 0.55 * k + 9, String(n), { size: 14, c: n === 0 ? RED : INK }); }
    s += L(4, y0, W - 4, y0, { w: 0.8, c: '#7d848e' });
    s += TX(xz - 7, y0 + 0.78 * k, 'index', { anchor: 'end', size: 13, c: RED });
    s += TX(Math.max(padL, xz - 1.15 * k + 4), H - 10, 'Vernier scale: 0.05 mm per division', { weight: 700, size: 14, anchor: 'start' });
    return svgScroll(W, H, s, 'vernier caliper scale', W);
  }
  function micSvg(h, f) {
    var k = 50, R0 = 0.5 * h + 0.01 * f, mlo = Math.max(0, Math.floor(R0 + 1e-9) - 6), mE = (R0 - mlo) * 0.55;
    var X = function (x) { return (x + 0.55) * k; }, Y = function (y) { return (1.45 - y) * k; };
    var W = X(mE + 3.05) + 4, H = Y(-1.35) + 52, s = '';
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
    for (var d = -6; d <= 6; d++) { var y = Y(-d * 0.22), v = ((f + d) % 50 + 50) % 50, maj = v % 5 === 0; s += L(X(mE + 0.12), y, X(mE + (maj ? 0.72 : 0.5)), y, { w: maj ? 1.6 : 1.1 }); if (maj) s += TX(X(mE + 0.78), y, String(v), { anchor: 'start', size: 16 }); }
    s += L(X(mE + 1.55), Y(0), X(mE + 3.0), Y(0), { c: RED, w: 1.6, dash: '5 4' });
    s += TX(X(mE + 2.95), Y(0) - 11, 'index line', { anchor: 'end', size: 14, c: RED });
    s += TX(W / 2, Y(-1.35) + 17, 'Sleeve: a mark every 0.5 mm', { weight: 700, size: 15 }); s += TX(W / 2, Y(-1.35) + 38, 'Thimble: 0.01 mm per division', { weight: 700, size: 15 });
    return svgFit(W, H, s, 'micrometer sleeve and thimble', Math.max(300, W));
  }
  function vernAlts(M, Nf) {
    var x = M + 0.05 * Nf;
    return [A(M + Nf, 'vern-aligned', 'You read the main-scale mark where the vernier line meets it. The <b>coarse reading</b> comes from the vernier’s own <b>0</b> mark (the red index): the last whole millimetre it has passed.'),
      A(M + 0.1 * Nf, 'vern-tenths', 'Each vernier division is worth ' + t('0.05') + ' mm, not ' + t('0.1') + ' mm: fine reading ' + t('=\\text{division number}\\times0.05') + '.'),
      A(M + 0.01 * Nf, 'vern-tenths', 'Each vernier division is worth ' + t('0.05') + ' mm, not ' + t('0.01') + ' mm.'),
      A(M, 'no-fine', 'That is only the <b>coarse</b> reading. Add the fine reading: find the vernier mark that lines up with a main-scale mark.'),
      A(0.05 * Nf, 'no-coarse', 'That is only the <b>fine</b> reading. Add the coarse reading from the main scale (the last whole mm before the index).'),
      A(M + 1 + 0.05 * Nf, 'vern-coarse', 'Check the coarse reading: it is the last whole-millimetre mark <b>at or to the left of</b> the index, not the next one.'),
      A(M + 0.05 * (Nf + 1), 'vern-neighbour', 'Very close — look again for the vernier mark that lines up <b>best</b>. Compare it with the marks on either side.'),
      A(M + 0.05 * (Nf - 1), 'vern-neighbour', 'Very close — look again for the vernier mark that lines up <b>best</b>. Compare it with the marks on either side.'),
      A(x / 10, 'unit-slip', 'That looks like centimetres. The reading is asked for in <b>millimetres</b>.')].filter(function (a) { return !near(a.v, x); });
  }
  function micAlts(h, f) {
    var c = 0.5 * h, x = c + 0.01 * f, half = h % 2 === 1, out = [];
    if (half) out.push(A(x - 0.5, 'mic-half', 'Look <b>below</b> the index line: a half-millimetre mark is showing past the last whole millimetre, so the coarse reading ends in ' + t('.5') + '.'));
    else out.push(A(x + 0.5, 'mic-half', 'No half-millimetre mark is showing past the last whole millimetre (the half marks are the short ones <b>below</b> the line), so don’t add ' + t('0.5') + ' mm.'));
    out.push(A(c + 0.1 * f, 'mic-tenths', 'Each thimble division is worth ' + t('0.01') + ' mm: fine reading ' + t('=\\text{division}\\times0.01') + '.'));
    out.push(A(c, 'no-fine', 'That is only the <b>coarse</b> (sleeve) reading. Add the fine reading from the thimble mark on the index line.'));
    out.push(A(0.01 * f, 'no-coarse', 'That is only the <b>fine</b> (thimble) reading. Add the coarse reading from the sleeve.'));
    out.push(A(x + 1, 'mic-coarse', 'Check the whole millimetres on the sleeve: count the marks above the line from the numbered one, and stop at the last one the thimble has uncovered.'));
    out.push(A(x + 0.01, 'mic-neighbour', 'Very close — read the thimble mark that sits exactly <b>on</b> the index line, not the one beside it.'));
    out.push(A(x - 0.01, 'mic-neighbour', 'Very close — read the thimble mark that sits exactly <b>on</b> the index line, not the one beside it.'));
    return out.filter(function (a) { return !near(a.v, x); });
  }
  function precisionWrap(ch, x, dp, what) {
    return function (resp) { var p = HW.parse.number(resp); if (p.ok && near(p.value, x) && (String(resp).replace(/\s/g, '').split('.')[1] || '').replace(/\D.*$/, '').length < dp) return form('precision', 'Right value! ' + what + ' reads to two decimal places, so state the reading as ' + t(fx(x, 2)) + ' mm.'); return ch(resp); };
  }
  /* percent error alternatives (from u10l1) */
  function percAlts(est, meas) { return [A(Math.abs(est - meas) / est * 100, 'pct-base', 'Divide by the <b>measured</b> (true) value, not the estimate.'), A(Math.abs(est - meas) / meas, 'pct-no100', 'Multiply by ' + t('100') + ' to make it a percent.')]; }

  /* ---------------- mixed measures (feet and inches), from u10l2 ---------------- */
  var FTIN = [{ u: 'ft', per: 12, name: 'feet', one: 'foot' }, { u: 'in', per: 1, name: 'inches', one: 'inch' }];
  function decomp(total, Us) { var rem = Math.round(total), out = []; Us.forEach(function (u) { var k = Math.floor(rem / u.per + 1e-9); out.push(k); rem -= k * u.per; }); return out; }
  function mixedCheck(total, Us, opt) {
    opt = opt || {};
    var want = decomp(total, Us), n = Us.length, exv = opt.exact != null ? opt.exact : total, big = Us[0], small = Us[n - 1];
    return function (resp) {
      resp = resp || []; var vals = [];
      for (var i = 0; i < n; i++) {
        var s = String(resp[i] == null ? '' : resp[i]).trim();
        if (!s) return form('blank-box', 'Fill in every box — type ' + t('0') + ' if there are no ' + Us[i].name + '.');
        if (unitTyped(s)) return form('unit-in-box', 'Type just the number in each box — the units are already written after the boxes.');
        var p = HW.parse.number(s); if (!p.ok) return form('notnumber', 'Each box takes a single number.');
        vals.push(p.value);
      }
      if (vals.every(function (v, i) { return v === want[i]; })) return ok();
      var sum = 0; vals.forEach(function (v, i) { sum += v * Us[i].per; });
      if (!vals.every(function (v) { return Number.isInteger(v); })) {
        if (Math.abs(sum - exv) < 0.6) return form('round', 'Nearly there — use whole numbers: whole ' + big.name + ', and the ' + small.name + ' rounded to the nearest ' + small.one + '.');
        if (Math.abs(vals[0] * big.per - exv) < 0.6 && vals.slice(1).every(function (v) { return v === 0; })) return form('mixed-decimal', 'That’s a decimal number of ' + big.name + '. Write it as whole ' + big.name + ' and the leftover ' + small.name + '.');
        return wrong('value', null);
      }
      if (sum === total) { if (vals[1] >= 12) return form('carry', 'Right total — but ' + t(vals[1] + '\\text{ in}') + ' is at least a foot. Carry each whole foot into the feet box.'); return wrong('value', null); }
      var dec = exv / big.per, qn = Math.floor(dec + 1e-9), fr = dec - qn;
      if (vals[0] === qn && fr > 1e-9) for (var j = 1; j <= 4; j++) { var dg = Math.round(fr * Math.pow(10, j)); if (dg > 0 && vals[1] === dg && dg !== want[1]) return wrong('dec-remainder', t(String(rd(dec, 4)) + '\\text{ ft}') + ' does not mean ' + qn + ' feet and ' + dg + ' inches: the decimal part is a fraction of a <b>foot</b>. Multiply the decimal part by ' + t('12') + ' to get the inches.'); }
      var al = opt.alts || [];
      for (var a = 0; a < al.length; a++) if (Math.round(al[a].total) !== total && Math.abs(sum - al[a].total) <= Math.max(0.51, Math.abs(al[a].total) * 0.002)) return wrong(al[a].code, al[a].hint);
      if (opt.exact != null && Math.abs(sum - total) === 1) return wrong('round-off', 'Very close — you are one inch off. Keep full precision until the end and round only the inches, once.');
      if (vals[1] === want[1]) return wrong('quotient-off', 'The inches are right — recount how many whole feet fit.');
      if (vals[0] === want[0]) return wrong('remainder-off', 'The number of feet is right — check what is left over in inches.');
      return wrong('value', null);
    };
  }

  /* ---------------- solid figures ---------------- */
  function solidFig(kind, o) { o.width = o.width || 220; return '<div class="fig">' + HW.solid(kind, o) + '</div>'; }
  function n1(v) { return (+v).toFixed(1); }
  function tx(x, y, s, o) { o = o || {}; return '<text x="' + n1(x) + '" y="' + n1(y) + '" font-size="' + (o.size || 13) + '" text-anchor="' + (o.anchor || 'middle') + '" dominant-baseline="central" fill="' + (o.color || INK) + '" paint-order="stroke" stroke="#fff" stroke-width="3" stroke-linejoin="round">' + esc(s) + '</text>'; }
  function ln(x1, y1, x2, y2, o) { o = o || {}; return '<line x1="' + n1(x1) + '" y1="' + n1(y1) + '" x2="' + n1(x2) + '" y2="' + n1(y2) + '" stroke="' + (o.color || INK) + '" stroke-width="' + (o.w || 2) + '"' + (o.dash ? ' stroke-dasharray="5 4"' : '') + ' stroke-linecap="round"/>'; }
  function pth(d, o) { o = o || {}; return '<path d="' + d + '" fill="' + (o.fill || 'none') + '" stroke="' + (o.stroke || INK) + '" stroke-width="' + (o.w == null ? 2 : o.w) + '"' + (o.dash ? ' stroke-dasharray="5 4"' : '') + '/>'; }
  function ellF(cx, cy, rx, ry, o) { o = o || {}; return '<ellipse cx="' + n1(cx) + '" cy="' + n1(cy) + '" rx="' + n1(rx) + '" ry="' + n1(ry) + '" fill="' + (o.fill || 'none') + '" stroke="' + (o.stroke || INK) + '" stroke-width="' + (o.w || 2) + '"' + (o.dash ? ' stroke-dasharray="5 4"' : '') + '/>'; }
  function ellH(cx, cy, rx, ry) { return pth('M' + n1(cx - rx) + ' ' + n1(cy) + ' A' + n1(rx) + ' ' + n1(ry) + ' 0 0 0 ' + n1(cx + rx) + ' ' + n1(cy)) + pth('M' + n1(cx - rx) + ' ' + n1(cy) + ' A' + n1(rx) + ' ' + n1(ry) + ' 0 0 1 ' + n1(cx + rx) + ' ' + n1(cy), { w: 1.4, dash: 1 }); }
  function dimV(x, y1, y2, lab, left) { return ln(x, y1, x, y2, { w: 1.2 }) + ln(x - 4, y1, x + 4, y1, { w: 1.2 }) + ln(x - 4, y2, x + 4, y2, { w: 1.2 }) + (lab ? tx(x + (left ? -6 : 6), (y1 + y2) / 2, lab, { anchor: left ? 'end' : 'start' }) : ''); }
  function dimH(y, x1, x2, lab, below) { return ln(x1, y, x2, y, { w: 1.2 }) + ln(x1, y - 4, x1, y + 4, { w: 1.2 }) + ln(x2, y - 4, x2, y + 4, { w: 1.2 }) + (lab ? tx((x1 + x2) / 2, y + (below ? 12 : -11), lab) : ''); }
  function svg(w, h, body, aria, maxw) { return '<svg class="fig-svg" viewBox="0 0 ' + w + ' ' + h + '" width="100%" style="max-width:' + (maxw || w) + 'px" role="img" aria-label="' + esc(aria || 'figure') + '">' + body + '</svg>'; }
  /* cylinder with a hemisphere on each end; the cylinder part is drawn in proportion to the numbers */
  function capsuleFig(o) {
    var cy = 92, R = 40, cylPx = Math.max(40, Math.min(170, 2 * R * o.cyl / o.d)), xL = 60 + R, xR = xL + cylPx, s = '';
    s += pth('M' + n1(xL) + ' ' + (cy - R) + ' L' + n1(xR) + ' ' + (cy - R) + ' A' + R + ' ' + R + ' 0 0 1 ' + n1(xR) + ' ' + (cy + R) + ' L' + n1(xL) + ' ' + (cy + R) + ' A' + R + ' ' + R + ' 0 0 1 ' + n1(xL) + ' ' + (cy - R), { fill: SOFT });
    [xL, xR].forEach(function (x) { s += ellF(x, cy, 11, R, { dash: 1, w: 1.3, stroke: '#8a93a3' }); });
    s += dimH(cy - R - 16, xL - R, xR + R, o.LLab) + dimV(xL - R - 14, cy - R, cy + R, o.dLab, true);
    return '<div class="fig">' + svg(Math.ceil(xR + R + 20), cy + R + 14, s, 'cylinder with a hemisphere on each end', Math.ceil(xR + R + 20)) + '</div>';
  }
  /* cylinder (radius r, height h) topped by a cone (height hc) */
  function siloFig(o) {
    var cx = 100, R = 50, ry = 12, cone = Math.max(22, Math.min(60, R * o.hc / o.r)), top = 20 + cone, cylH = Math.max(70, Math.min(140, R * o.h / o.r)), bot = top + cylH, s = '';
    s += '<rect x="' + (cx - R) + '" y="' + top + '" width="' + 2 * R + '" height="' + cylH + '" fill="' + SOFT + '"/>';
    s += '<polygon points="' + cx + ',' + (top - cone) + ' ' + (cx - R) + ',' + top + ' ' + (cx + R) + ',' + top + '" fill="' + SOFT + '" stroke="' + INK + '" stroke-width="2"/>';
    s += ellH(cx, top, R, ry) + ln(cx - R, top, cx - R, bot) + ln(cx + R, top, cx + R, bot) + ellH(cx, bot, R, ry);
    s += ln(cx, bot, cx + R, bot, { w: 1.4 }) + tx(cx + R / 2, bot - 11, o.rLab) + dimV(cx + R + 16, top, bot, o.hLab) + dimV(cx + R + 16, top - cone, top, o.hcLab);
    return '<div class="fig">' + svg(240, bot + ry + 10, s, 'silo: a cylinder topped by a cone', 240) + '</div>';
  }

  /* ======================================================================================================
   * EXIT SLIPS
   * ====================================================================================================== */

  /* ---------------- 10.1 ---------------- */
  var REFS = [
    { ref: 'one pace (about 1 yd)', per: 3, unit: 'ft', what: function (n) { return 'You pace out the length of a school hallway and count ' + t(n) + ' paces. Using one pace as about ' + t('1\\text{ yd}') + ', estimate the length of the hallway in <b>feet</b>.'; }, lo: 12, hi: 40,
      alts: function (n) { return [A(n, 'pace-ft', 'One pace is about <b>1 yard</b>, and a yard is ' + t('3') + ' feet. Multiply the number of paces by ' + t('3') + '.'), A(36 * n, 'gave-other-unit', 'That is the estimate in <b>inches</b>. The question asks for feet (' + t('1\\text{ yd}=3\\text{ ft}') + ').'), A(12 * n, 'u10x-ref-unit', 'A yard is ' + t('3') + ' feet (it is ' + t('36') + ' inches). Multiply by ' + t('3') + ' to get feet.')]; },
      sol: function (n) { return t(n + '\\text{ paces}\\times 1\\text{ yd}=' + n + '\\text{ yd}') + ', and ' + t('1\\text{ yd}=3\\text{ ft}') + ', so ' + t(n + '\\times 3=' + 3 * n + '\\text{ ft}') + '.'; } },
    { ref: 'one hand span (about 20 cm)', per: 0.2, unit: 'm', what: function (n) { return 'Laying your hand span along a whiteboard, it fits ' + t(n) + ' times. Using a hand span as about ' + t('20\\text{ cm}') + ', estimate the length of the whiteboard in <b>metres</b>.'; }, lo: 5, hi: 16,
      alts: function (n) { return [A(20 * n, 'gave-other-unit', 'That is the estimate in <b>centimetres</b>. Divide by ' + t('100') + ' to get metres.'), A(n, 'u10x-ref-count', 'That is the number of hand spans. Multiply by the size of one span (about ' + t('20\\text{ cm}') + '), then change to metres.')]; },
      sol: function (n) { return t(n + '\\times 20\\text{ cm}=' + 20 * n + '\\text{ cm}') + ', and ' + t(20 * n + '\\text{ cm}\\div 100=' + nT(0.2 * n) + '\\text{ m}') + '.'; } },
    { ref: 'the length of an adult foot (about 1 ft)', per: 12, unit: 'in', what: function (n) { return 'Placing your feet heel to toe along a rug, you count ' + t(n) + ' foot lengths. Using an adult foot as about ' + t('1\\text{ ft}') + ', estimate the length of the rug in <b>inches</b>.'; }, lo: 4, hi: 14,
      alts: function (n) { return [A(n, 'u10x-ref-count', 'That is the estimate in <b>feet</b>. There are ' + t('12') + ' inches in a foot.'), A(10 * n, 'u10x-ref-unit', 'There are ' + t('12') + ' inches in a foot, not ' + t('10') + '.'), A(3 * n, 'u10x-ref-unit', 'A foot is ' + t('12') + ' inches. Multiply the number of foot lengths by ' + t('12') + '.')]; },
      sol: function (n) { return t(n + '\\text{ ft}\\times 12=' + 12 * n + '\\text{ in}') + '.'; } },
    { ref: 'the width of a thumb (about 2.5 cm)', per: 25, unit: 'mm', what: function (n) { return 'Laying your thumb across a book again and again, it fits ' + t(n) + ' times. Using a thumb width as about ' + t('2.5\\text{ cm}') + ', estimate the width of the book in <b>millimetres</b>.'; }, lo: 6, hi: 14,
      alts: function (n) { return [A(2.5 * n, 'gave-other-unit', 'That is the estimate in <b>centimetres</b>. Multiply by ' + t('10') + ' to get millimetres.'), A(n, 'u10x-ref-count', 'That is the number of thumb widths. Multiply by the size of one thumb width.')]; },
      sol: function (n) { return t(n + '\\times 2.5\\text{ cm}=' + nT(2.5 * n) + '\\text{ cm}') + ', and ' + t(nT(2.5 * n) + '\\text{ cm}\\times 10=' + 25 * n + '\\text{ mm}') + '.'; } },
    { ref: 'the width of an adult hand (about 4 in)', per: 4, unit: 'in', what: function (n) { return 'A pony’s height is measured by placing a hand flat against it again and again: it is ' + t(n) + ' hands tall. Using a hand width as about ' + t('4\\text{ in}') + ', estimate the pony’s height in <b>inches</b>.'; }, lo: 9, hi: 15,
      alts: function (n) { return [A(n, 'u10x-ref-count', 'That is the number of hands. Each hand is about ' + t('4') + ' inches.'), A(4 * n / 12, 'gave-other-unit', 'That is the estimate in <b>feet</b>. The question asks for inches.')]; },
      sol: function (n) { return t(n + '\\times 4\\text{ in}=' + 4 * n + '\\text{ in}') + '.'; } }];
  var PCT_CTX = [
    { what: 'the length of a desk', unit: 'cm', est: function (r) { return 10 * r.int(8, 16); }, meas: function (r, e) { return e + r.pick([-1, 1]) * r.int(4, 18) + r.int(0, 9) / 10; } },
    { what: 'the height of a doorway', unit: 'cm', est: function (r) { return 10 * r.int(19, 22); }, meas: function (r, e) { return e + r.pick([-1, 1]) * r.int(3, 16) + r.int(0, 9) / 10; } },
    { what: 'the length of a classroom', unit: 'm', est: function (r) { return r.int(7, 14); }, meas: function (r, e) { return cl(e + r.pick([-1, 1]) * r.int(3, 15) / 10 + r.int(0, 9) / 100); } },
    { what: 'the width of a laptop screen', unit: 'in', est: function (r) { return r.int(11, 16); }, meas: function (r, e) { return e + r.pick([-1, 1]) * r.pick([0.5, 0.75, 1.25, 1.5, 1.75, 2]); } }];
  HW.defineExit({
    lesson: 'u10l1', calc: true, outcome: 'M1',
    blurb: 'An estimate from a personal referent, how far off an estimate is (as a percent), and reading a vernier caliper or a micrometer.',
    questions: [
      { num: '1', outcome: 'M1', stem: 'Use the referent to estimate the measurement.', parts: [
        { id: '1', outcome: 'M1', level: 'BEG', make: function (r) {
          var c = r.pick(REFS), n = r.int(c.lo, c.hi), x = cl(n * c.per);
          return numPart(c.what(n), x, { unit: c.unit, alts: c.alts(n), places: false }, 'Each ' + c.ref.replace(/ \(.*/, '') + ' is ' + c.ref.replace(/^.*\((.*)\)$/, '$1') + '.<br>' + c.sol(n),
            ['Multiply the count by the size of one referent.', 'Then change to the unit the question asks for.'], 'referent ' + c.unit + ' ' + n);
        } }] },
      { num: '2', outcome: 'M1', stem: 'Compare an estimate with the measured value.', parts: [
        { id: '2', outcome: 'M1', level: 'EMG', make: function (r) {
          var c = r.pick(PCT_CTX), e, m, pc;
          var s = find(function () { var e0 = c.est(r); return { e: e0, m: cl(c.meas(r, e0)) }; }, function (s) { var p = Math.abs(s.e - s.m) / s.m * 100; return s.m > 0 && p > 0.8 && p < 20 && safe(p, 0, 0.1); }, { e: 120, m: 127.5 });
          e = s.e; m = s.m; pc = Math.abs(e - m) / m * 100; var diff = cl(Math.abs(e - m)), u = c.unit;
          return fieldsPart('You estimated ' + c.what + ' as ' + t(nT(e) + U(u)) + ' using a referent. A tape measure gives ' + t(nT(m) + U(u)) + '. How far off was the estimate, and what percent of the measured value is that, to the nearest whole percent?',
            [{ name: 'Off by', label: 'Off by', after: u, x: diff, abs: true, places: false },
              { name: 'Percent', label: 'Percent', after: '%', x: pc, dp: 0, alts: percAlts(e, m).concat([A(diff, 'pct-abs', 'That is the difference itself. Divide it by the measured value and multiply by ' + t('100') + ' to get a percent.')]) }],
            'Difference: ' + t('|' + nT(e) + '-' + nT(m) + '|=' + nT(diff) + U(u)) + '.<br>Percent of the measured value: ' + t('\\dfrac{' + nT(diff) + '}{' + nT(m) + '}\\times 100=' + dots(pc) + '\\approx ' + fx(pc, 0) + '\\%') + '. (An estimate within about ' + t('10\\%') + ' is reasonable.)',
            ['Subtract to find how far off the estimate was.', 'Divide that difference by the <b>measured</b> value, then multiply by ' + t('100') + '.'], 'percent off ' + e + ' vs ' + m);
        } }] },
      { num: '3', outcome: 'M1', stem: 'Read the instrument to its precision.', parts: [
        { id: '3', outcome: 'M1', level: 'PRG', make: function (r) {
          if (r.chance(0.5)) {
            var M = r.int(14, 92), Nf = r.int(1, 19), x = cl(M + 0.05 * Nf), p = numPart('State the reading of this vernier caliper, in millimetres.' + vernSvg(M, Nf), x, { unit: 'mm', alts: vernAlts(M, Nf), places: false },
              '<b>Coarse</b> (main scale): the index — the vernier’s 0 — has passed the ' + t(M) + ' mm mark, so the coarse reading is ' + t(M + '\\text{ mm}') + '.<br><b>Fine</b> (vernier): mark ' + t(Nf) + ' lines up with a main-scale mark, so ' + t(Nf + '\\times0.05=' + fx(0.05 * Nf, 2) + '\\text{ mm}') + '.<br>' + t(M + '+' + fx(0.05 * Nf, 2) + '=' + fx(x, 2)) + ' mm.',
              ['Coarse reading: the last whole millimetre on the main scale <b>at or before</b> the vernier’s 0 (the red index).', 'Fine reading: find the one vernier mark that lines up exactly with a main-scale mark; multiply its number by ' + t('0.05') + ' mm.'], 'vernier ' + fx(x, 2));
            p.check = precisionWrap(p.check, x, 2, 'A vernier caliper'); p.key = fx(x, 2); p.answer = t(fx(x, 2)) + ' mm';
            return p;
          }
          var h = 2 * r.int(3, 11) + 1, f = r.int(10, 47), xm = cl(0.5 * h + 0.01 * f), c = 0.5 * h;
          var q = numPart('State the reading of this micrometer, in millimetres.' + micSvg(h, f), xm, { unit: 'mm', alts: micAlts(h, f), places: false },
            '<b>Coarse</b> (sleeve): the last mark the thimble has uncovered is the half-millimetre mark below the line past ' + t(Math.floor(c)) + ', so ' + t(fx(c, 1) + '\\text{ mm}') + '.<br><b>Fine</b> (thimble): the index line is on mark ' + t(f) + ', so ' + t(f + '\\times0.01=' + fx(0.01 * f, 2) + '\\text{ mm}') + '.<br>' + t(fx(c, 1) + '+' + fx(0.01 * f, 2) + '=' + fx(xm, 2)) + ' mm.',
            ['Coarse reading: the last sleeve mark the thimble has uncovered — whole millimetres above the line, half millimetres below it.', 'Fine reading: the thimble number on the index line, times ' + t('0.01') + ' mm.'], 'micrometer ' + fx(xm, 2));
          q.check = precisionWrap(q.check, xm, 2, 'A micrometer'); q.key = fx(xm, 2); q.answer = t(fx(xm, 2)) + ' mm';
          return q;
        } }] }]
  });

  /* ---------------- 10.2 ---------------- */
  var PFX = { k: 3, h: 2, da: 1, '': 0, d: -1, c: -2, m: -3 };
  var UNAME = { km: 'kilometres', m: 'metres', cm: 'centimetres', mm: 'millimetres', L: 'litres', kL: 'kilolitres', mL: 'millilitres', g: 'grams', kg: 'kilograms', mg: 'milligrams' };
  function pe(u) { return PFX[u.slice(0, -1)]; }
  function p10(e) { return F(String(Math.pow(10, Math.abs(e)))); }
  var METRIC = [
    { from: 'km', to: 'm', v: function (r) { return r.int(105, 985) / 100; } }, { from: 'm', to: 'cm', v: function (r) { return r.int(12, 95) / 10; } },
    { from: 'cm', to: 'm', v: function (r) { return r.int(120, 980); } }, { from: 'mm', to: 'm', v: function (r) { return r.int(35, 950); } },
    { from: 'km', to: 'cm', v: function (r) { return r.int(12, 85) / 10; } }, { from: 'm', to: 'km', v: function (r) { return r.int(120, 9800); } },
    { from: 'mm', to: 'cm', v: function (r) { return r.int(15, 480); } }, { from: 'kg', to: 'g', v: function (r) { return r.int(105, 950) / 100; } },
    { from: 'mL', to: 'L', v: function (r) { return r.int(25, 950); } }, { from: 'L', to: 'mL', v: function (r) { return r.int(12, 95) / 10; } }];
  HW.defineExit({
    lesson: 'u10l2', calc: true, outcome: 'M2',
    blurb: 'An SI conversion with prefixes, a rate conversion by unit analysis, and a conversion between imperial and SI.',
    questions: [
      { num: '1', outcome: 'M2', stem: 'Use the metric prefixes (each step on the number line is a factor of 10).', parts: [
        { id: '1', outcome: 'M2', level: 'BEG', make: function (r) {
          var c = r.pick(METRIC), v = c.v(r), d = pe(c.from) - pe(c.to), ans = cl(v * Math.pow(10, d));
          var dir = d > 0 ? 'Check the direction: ' + t(uT(c.to)) + ' is a <b>smaller</b> unit than ' + t(uT(c.from)) + ', so there are more of them and the number must get <b>bigger</b>. Multiply by ' + t(p10(d)) + '.' : 'Check the direction: ' + t(uT(c.to)) + ' is a <b>bigger</b> unit than ' + t(uT(c.from)) + ', so there are fewer of them and the number must get <b>smaller</b>. Divide by ' + t(p10(d)) + '.';
          return numPart('Convert ' + t(nT(v) + '\\text{ ' + c.from + '}') + ' to ' + UNAME[c.to] + '.', ans, { before: t(nT(v) + '\\text{ ' + c.from + '}='), unit: c.to, alts: [A(cl(v * Math.pow(10, -d)), 'conv-direction', dir)] },
            'From ' + t(uT(c.from)) + ' to ' + t(uT(c.to)) + ' is ' + Math.abs(d) + ' step' + (Math.abs(d) > 1 ? 's' : '') + ' on the metric number line — to a <b>' + (d > 0 ? 'smaller' : 'bigger') + '</b> unit, so ' + (d > 0 ? '<b>multiply</b>' : '<b>divide</b>') + ' by ' + t(p10(d)) + ' (move the decimal point ' + Math.abs(d) + ' place' + (Math.abs(d) > 1 ? 's' : '') + ' ' + (d > 0 ? 'right' : 'left') + '):<br>' + t(nT(v) + '\\text{ ' + c.from + '}' + (d > 0 ? '\\times ' : '\\div ') + p10(d) + '=' + nT(ans) + '\\text{ ' + c.to + '}'),
            ['Count the steps between the two prefixes on the metric number line (k, h, da, unit, d, c, m).', d > 0 ? 'Going to a smaller unit gives a bigger number.' : 'Going to a bigger unit gives a smaller number.'], 'metric ' + v + ' ' + c.from + '>' + c.to);
        } }] },
      { num: '2', outcome: 'M2', stem: 'Convert the rate using unit analysis. Round to the nearest tenth.', parts: [
        { id: '2', outcome: 'M2', level: 'EMG', make: function (r) {
          var toMs = r.chance(0.5), who = r.pick(['A cyclist', 'A train', 'A hockey puck', 'A ferry', 'A skateboarder']);
          if (toMs) {
            var v = find(function () { return r.int(18, 140); }, function (v) { return safe(v / 3.6, 1); }, 47), x = v / 3.6;
            return numPart(who + ' moves at ' + t(v + '\\text{ km/h}') + '. What is this speed in metres per second?', x, { before: t(v + '\\text{ km/h}\\approx'), unit: 'm/s', dp: 1, alts: [A(v * 3.6, 'conv-direction', 'A metre per second is a <b>bigger</b> speed unit than a km per hour (it is ' + t('3.6\\text{ km/h}') + '), so the number must get smaller. Divide by ' + t('3.6') + '.'),
              A(v * 1000 / 60, 'u10x-rate-one', 'That is metres per <b>minute</b>. An hour has ' + t('3600') + ' seconds, not ' + t('60') + '.'), A(v * 1000, 'u10x-rate-one', 'You changed kilometres to metres, but the time is still in hours. Divide by ' + t('3600') + ' s/h too.'), A(v / 3600, 'u10x-rate-one', 'You changed hours to seconds, but the distance is still in kilometres. Multiply by ' + t('1000') + ' m/km too.')] },
              disp(chainT([[v, 'km', 1, 'h'], [1000, 'm', 1, 'km'], [1, 'h', 3600, 's']]) + '=' + dots(x) + '\\text{ m/s}\\approx ' + fx(x, 1) + '\\text{ m/s}'),
              ['Write the rate as a fraction ' + t('\\frac{' + v + '\\text{ km}}{1\\text{ h}}') + ', then multiply by unit factors so km and h cancel.', 'Use ' + t('1\\text{ km}=1000\\text{ m}') + ' and ' + t('1\\text{ h}=3600\\text{ s}') + '.'], 'rate km/h ' + v);
          }
          var w = find(function () { return r.int(45, 350) / 10; }, function (w) { return safe(w * 3.6, 1) && w % 1 !== 0; }, 12.7), y = w * 3.6;
          return numPart(who + ' moves at ' + t(nT(w) + '\\text{ m/s}') + '. What is this speed in kilometres per hour?', y, { before: t(nT(w) + '\\text{ m/s}\\approx'), unit: 'km/h', dp: 1, alts: [A(w / 3.6, 'conv-direction', 'A km per hour is a <b>smaller</b> speed unit than a metre per second, so the number must get bigger. Multiply by ' + t('3.6') + '.'),
            A(w * 3600, 'u10x-rate-one', 'You changed seconds to hours, but the distance is still in metres. Divide by ' + t('1000') + ' m/km too.'), A(w / 1000, 'u10x-rate-one', 'You changed metres to kilometres, but the time is still in seconds. Multiply by ' + t('3600') + ' s/h too.'), A(w * 60 / 1000, 'u10x-rate-one', 'That is km per <b>minute</b>. An hour has ' + t('3600') + ' seconds.')] },
            disp(chainT([[w, 'm', 1, 's'], [1, 'km', 1000, 'm'], [3600, 's', 1, 'h']]) + '=' + dots(y) + '\\text{ km/h}\\approx ' + fx(y, 1) + '\\text{ km/h}'),
            ['Write the rate as ' + t('\\frac{' + nT(w) + '\\text{ m}}{1\\text{ s}}') + ' and multiply by unit factors so m and s cancel.', 'Use ' + t('1\\text{ km}=1000\\text{ m}') + ' and ' + t('1\\text{ h}=3600\\text{ s}') + '.'], 'rate m/s ' + w);
        } }] },
      { num: '3', outcome: 'M2', stem: 'Use ' + t('1\\text{ in}=2.54\\text{ cm}') + ' and ' + t('1\\text{ ft}=12\\text{ in}') + '.', parts: [
        { id: '3', outcome: 'M2', level: 'PRG', make: function (r) {
          var who = r.pick(['A basketball player', 'A bookshelf', 'A kayak', 'A doorway', 'A tall cabinet', 'A sofa']);
          if (r.chance(0.5)) {
            var fi = find(function () { return { Ft: r.int(4, 9), In: r.int(1, 11) }; }, function (q) { return safe((12 * q.Ft + q.In) * 0.0254, 2); }, { Ft: 6, In: 2 });
            var Ft = fi.Ft, In = fi.In, inch = 12 * Ft + In, x = inch * 0.0254;
            var al = [A(inch / 2.54 / 100, 'conv-direction', 'Check the direction: centimetres are smaller than inches, so multiply the inches by ' + t('2.54') + '.'), A(inch * 0.3048, 'conv-factor', t('0.3048') + ' changes <b>feet</b> to metres, but you have inches. Use ' + t('1\\text{ in}=2.54\\text{ cm}') + '.'), A(inch * 2.54, 'prefix-places', 'That’s the length in <b>centimetres</b>. Divide by ' + t('100') + ' for metres.')];
            if (In <= 9) al.push(A((Ft + In / 10) * 0.3048, 'ft-in-decimal', 'Careful: ' + t(Ft + '\\text{ ft }' + In + '\\text{ in}') + ' is <b>not</b> ' + t(Ft + '.' + In + '\\text{ ft}') + ' — a foot has ' + t('12') + ' inches. Change the whole length to inches first.'));
            al.push(A(Ft * 0.3048, 'forgot-part', 'Don’t forget the ' + t(In + '\\text{ in}') + ' — include every part of the measurement.'));
            return numPart(who + ' measures ' + t(Ft + '\\text{ ft }' + In + '\\text{ in}') + '. Convert this to metres, to two decimal places.', x, { before: t(Ft + '\\text{ ft }' + In + '\\text{ in}\\approx'), unit: 'm', dp: 2, alts: al },
              'Change it to one unit first: ' + t(Ft + '\\times 12+' + In + '=' + inch + '\\text{ in}') + '.' + disp(chainT([[inch, 'in', null, null], [2.54, 'cm', 1, 'in'], [1, 'm', 100, 'cm']]) + '=' + nT(cl(x)) + '\\text{ m}\\approx ' + fx(x, 2) + '\\text{ m}'),
              ['Write the length in inches first (' + t('12\\text{ in}') + ' per foot).', 'Then use ' + t('1\\text{ in}=2.54\\text{ cm}') + ' and ' + t('1\\text{ m}=100\\text{ cm}') + '.'], 'ft-in to m ' + Ft + ',' + In);
          }
          var X = find(function () { return r.int(135, 260) / 100; }, function (X) { var e = X * 100 / 2.54; return safe(e, 0, 0.1); }, 1.83), ex = X * 100 / 2.54, tot = Math.round(ex), w = decomp(tot, FTIN), xs = fx(X, 2);
          var ck = mixedCheck(tot, FTIN, { exact: ex, alts: [{ total: X * 100 * 2.54, code: 'conv-direction', hint: 'Check the direction: inches are bigger than centimetres, so there are fewer of them — divide the centimetres by ' + t('2.54') + '.' }, { total: X * 12, code: 'conv-factor', hint: 'Metres aren’t feet: change ' + t(xs + '\\text{ m}') + ' to centimetres, then use ' + t('1\\text{ in}=2.54\\text{ cm}') + '.' }] });
          var p = { prompt: who + ' measures ' + t(xs + '\\text{ m}') + '. Convert this to feet and inches, to the nearest inch.', input: { type: 'fields', fields: [{ name: 'Feet', after: 'ft' }, { name: 'Inches', after: 'in' }] }, check: ck, key: w.map(String), answer: t(w[0] + '\\text{ ft }' + w[1] + '\\text{ in}'),
            solution: disp(chainT([[xs, 'm', null, null], [100, 'cm', 1, 'm'], [1, 'in', 2.54, 'cm']]) + '=' + dots(ex) + '\\text{ in}\\approx ' + tot + '\\text{ in}') + 'Then ' + t(tot + '\\div 12=' + w[0] + '\\text{ R }' + w[1]) + ', so ' + t(xs + '\\text{ m}\\approx ' + w[0] + '\\text{ ft }' + w[1] + '\\text{ in}') + '.',
            hints: ['Change metres to centimetres, then centimetres to inches (' + t('\\div 2.54') + ').', 'Round to the nearest inch, then divide by ' + t('12') + ': the quotient is feet and the remainder is inches.'], text: 'm to ft-in ' + xs };
          var dd = ex / 12, q0 = Math.floor(dd), dg = Math.round((dd - q0) * 100);
          p.bad = [[String(q0), String(dg)], [String(w[0]), String((w[1] + 1) % 12)], decomp(Math.round(X * 100 * 2.54), FTIN).map(String)].filter(function (b) { return b.join() !== p.key.join() && ck(b).v !== 'correct'; });
          return p;
        } }] }]
  });

  /* ---------------- 10.3 ---------------- */
  HW.defineExit({
    lesson: 'u10l3', calc: true, outcome: 'M3',
    blurb: 'Volume and surface area of a rectangular prism, the surface area of a closed cylinder, and working back from a cylinder’s capacity to its diameter.',
    questions: [
      { num: '1', outcome: 'M3', stem: 'A right rectangular prism.', parts: [
        { id: '1', outcome: 'M3', level: 'BEG', make: function (r) {
          var l = r.int(8, 24), w, h; do { w = r.int(3, 14); h = r.int(4, 16); } while (w === l || h === l || w === h);
          var what = r.pick(['A storage box', 'A fish tank', 'A shipping carton', 'A planter box']), V = l * w * h, S = 2 * (l * w + l * h + w * h);
          return fieldsPart(what + ' is a right rectangular prism ' + t(l + '\\text{ cm}') + ' long, ' + t(w + '\\text{ cm}') + ' wide and ' + t(h + '\\text{ cm}') + ' high. Determine its volume and its surface area.' + solidFig('rectprism', { l: l + ' cm', w: w + ' cm', h: h + ' cm' }),
            [{ name: 'Volume', label: 'Volume:', after: 'cm³', x: V, places: false, alts: [A(l * w, 'v-base-only', 'That is the area of the base. Multiply by the height too: ' + t('V=lwh') + '.'), A(S, 'v-used-sa', 'That is the surface area. Volume is ' + t('l\\times w\\times h') + '.')] },
              { name: 'Surface area', label: 'Surface area:', after: 'cm²', x: S, places: false, alts: [A(S / 2, 'sa-half', 'That counts each pair of faces once. A prism has <b>six</b> faces: two of each size, so double it.'), A(V, 'v-used-sa', 'That is the volume. Surface area adds the areas of the six faces.'), A(S - l * w, 'sa-missing-face', 'You left out a face. A closed box has six faces (top and bottom, front and back, two ends).')] }],
            t('V=lwh=' + l + '\\times ' + w + '\\times ' + h + '=' + F(V) + '\\text{ cm}^3') + '<br>' + t('SA=2(lw+lh+wh)=2(' + l * w + '+' + l * h + '+' + w * h + ')=' + F(S) + '\\text{ cm}^2'),
            ['Volume = length × width × height.', 'Surface area: there are three different faces, and two of each.'], 'prism ' + l + 'x' + w + 'x' + h);
        } }] },
      { num: '2', outcome: 'M3', stem: 'Use the π key. Round to the nearest tenth.', parts: [
        { id: '2', outcome: 'M3', level: 'EMG', make: function (r) {
          var what = r.pick(['A closed tin can', 'A cylindrical oatmeal container (with its lid)', 'A closed water tank', 'A cylindrical candle']), unit = r.pick(['cm', 'cm', 'in']), d = r.int(5, 26), h = r.int(6, 30), rr = d / 2;
          var S = 2 * PI * rr * rr + 2 * PI * rr * h;
          if (!safe(S, 1)) { h += 1; S = 2 * PI * rr * rr + 2 * PI * rr * h; }
          var alts = [A(2 * PI * d * d + 2 * PI * d * h, 'diam-radius', 'You used the diameter as the radius. The radius is half of ' + t(d) + ': ' + t('r=' + nT(rr)) + '.'), A(PI * rr * rr + 2 * PI * rr * h, 'sa-one-base', 'A closed cylinder has <b>two</b> circular faces (top and bottom).'),
            A(2 * PI * rr * h, 'sa-lateral', 'That is only the curved side. Add the two circular ends.'), A(2 * PI * rr * rr + PI * rr * h, 'half-lateral', 'The curved side unrolls into a rectangle ' + t('2\\pi r') + ' wide (the circumference), so its area is ' + t('2\\pi rh') + '.'), A(PI * rr * rr * h, 'v-used-sa', 'That is the volume. Surface area is ' + t('2\\pi r^2+2\\pi rh') + '.')];
          return numPart(what + ' has a diameter of ' + t(d + U(unit)) + ' and a height of ' + t(h + U(unit)) + '. Determine its total surface area.' + solidFig('cylinder', { d: d + ' ' + unit, h: h + ' ' + unit }), S, { unit: unit + '²', dp: 1, alts: alts },
            t('r=' + d + '\\div 2=' + nT(rr) + U(unit)) + '<br>' + t('SA=2\\pi r^2+2\\pi rh=2\\pi(' + nT(rr) + ')^2+2\\pi(' + nT(rr) + ')(' + h + ')=' + dots(S) + '\\approx ' + fx(S, 1) + U(unit + '²')),
            ['Halve the diameter to get the radius.', 'Two circles ' + t('(2\\pi r^2)') + ' plus the curved side ' + t('(2\\pi rh)') + '.'], 'cyl SA d' + d + ' h' + h);
        } }] },
      { num: '3', outcome: 'M3', stem: 'Work backwards from the volume. ' + t('1\\text{ mL}=1\\text{ cm}^3') + '.', parts: [
        { id: '3', outcome: 'M3', level: 'PRG', make: function (r) {
          var inL = r.chance(0.4), what = inL ? r.pick(['A cylindrical cooler jug', 'A cylindrical paint can', 'A cylindrical rain barrel']) : r.pick(['A cylindrical water bottle', 'A soup can', 'A cylindrical drinking glass']);
          var s = find(function () { var V = inL ? r.int(12, 60) / 10 : 10 * r.int(25, 90), h = inL ? r.int(18, 40) : r.int(9, 24); return { V: V, h: h }; }, function (s) { var Vc = s.V * (inL ? 1000 : 1), dd = 2 * Math.sqrt(Vc / (PI * s.h)); return dd > 3 && dd < 2 * s.h && safe(dd, 1); }, { V: 750, h: 21 });
          var V = s.V, h = s.h, Vc = V * (inL ? 1000 : 1), rr = Math.sqrt(Vc / (PI * h)), d = 2 * rr;
          var alts = [A(rr, 'gave-radius', 'That is the <b>radius</b>. The question asks for the diameter: double it.'), A(2 * Vc / (PI * h), 'no-sqrt', 'That is ' + t('2r^2') + ' — you need the square root: ' + t('r=\\sqrt{\\dfrac{V}{\\pi h}}') + ', then ' + t('d=2r') + '.'), A(Vc / (PI * h), 'no-sqrt', 'That is ' + t('r^2') + '. Take the square root to get ' + t('r') + ', then double it.'),
            A(2 * Math.sqrt(V / (PI * h)), 'u10x-cm3-l', 'Change litres to cm³ first: ' + t('1\\text{ L}=1000\\text{ cm}^3') + '.'), A(rr / 2, 'gave-radius', 'The diameter is <b>twice</b> the radius, not half of it.'), A(2 * Math.sqrt(Vc / h), 'divided-pi', 'Divide by ' + t('\\pi') + ' too: ' + t('V=\\pi r^2h') + ', so ' + t('r^2=\\dfrac{V}{\\pi h}') + '.')];
          return numPart(what + ' holds ' + t(nT(V) + (inL ? '\\text{ L}' : '\\text{ mL}')) + ' when full, and its inside height is ' + t(h + '\\text{ cm}') + '. Determine its inside diameter, to the nearest tenth of a centimetre.', d, { before: t('d\\approx'), unit: 'cm', dp: 1, alts: alts },
            (inL ? t(nT(V) + '\\text{ L}=' + F(Vc) + '\\text{ cm}^3') + '<br>' : t(V + '\\text{ mL}=' + V + '\\text{ cm}^3') + '<br>') + t('V=\\pi r^2h\\ \\Rightarrow\\ ' + F(Vc) + '=\\pi r^2(' + h + ')') + '<br>' + t('r^2=\\dfrac{' + F(Vc) + '}{' + h + '\\pi}=' + dots(Vc / (PI * h)) + ',\\quad r=' + dots(rr) + '\\text{ cm}') + '<br>' + t('d=2r=' + dots(d) + '\\approx ' + fx(d, 1) + '\\text{ cm}'),
            ['Change the capacity to cm³ (' + t('1\\text{ mL}=1\\text{ cm}^3') + (inL ? ', ' + t('1\\text{ L}=1000\\text{ cm}^3') : '') + '), then substitute into ' + t('V=\\pi r^2h') + '.', 'Solve for ' + t('r^2') + ', take the square root, then double ' + t('r') + ' for the diameter.'], 'capacity to diameter ' + V + (inL ? 'L' : 'mL') + ' h' + h);
        } }] }]
  });

  /* ---------------- 10.4 ---------------- */
  var TRIP = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [6, 8, 10], [9, 12, 15], [12, 16, 20], [20, 21, 29], [9, 40, 41]];
  HW.defineExit({
    lesson: 'u10l4', calc: true, outcome: 'M3',
    blurb: 'Volume of a cone or pyramid, surface area when the slant height must be found first, and working back from a cone’s surface area to its slant height.',
    questions: [
      { num: '1', outcome: 'M3', stem: 'Use the π key where needed. Round to the nearest whole number.', parts: [
        { id: '1', outcome: 'M3', level: 'BEG', make: function (r) {
          if (r.chance(0.5)) {
            var useD = r.chance(0.5), rr = r.int(3, 15), h = r.int(5, 30), u = r.pick(['cm', 'm', 'in']), V = PI * rr * rr * h / 3;
            if (!safe(V, 0)) { h += 1; V = PI * rr * rr * h / 3; }
            var what = r.pick(['A cone-shaped paper cup', 'A conical pile of sand', 'A cone-shaped funnel (filled)', 'A traffic cone (solid)']);
            var alts = [A(PI * rr * rr * h, 'no-third', 'That is the volume of a <b>cylinder</b>. A cone that just fits inside holds one third: ' + t('V=\\tfrac13\\pi r^2h') + '.'), A(PI * rr * h / 3, 'no-square', 'Square the radius: ' + t('r^2=' + rr * rr) + '.'), A(PI * rr * rr * h / 2, 'half-not-third', 'A cone’s volume is one <b>third</b> of the cylinder’s, not one half.')];
            if (useD) alts.push(A(PI * 4 * rr * rr * h / 3, 'diam-radius', 'You used the diameter as the radius. Halve it first: ' + t('r=' + rr) + '.'));
            return numPart(what + ' has a ' + (useD ? 'base diameter of ' + t(2 * rr + U(u)) : 'base radius of ' + t(rr + U(u))) + ' and a height of ' + t(h + U(u)) + '. Determine its volume.' + solidFig('cone', useD ? { d: 2 * rr + ' ' + u, h: h + ' ' + u } : { r: rr + ' ' + u, h: h + ' ' + u }), V, { unit: u + '³', dp: 0, alts: alts },
              (useD ? t('r=' + 2 * rr + '\\div 2=' + rr) + '<br>' : '') + t('V=\\tfrac13\\pi r^2h=\\tfrac13\\pi(' + rr + ')^2(' + h + ')=' + dots(V) + '\\approx ' + F(fx(V, 0)) + U(u + '³')),
              ['A cone holds one third of the cylinder with the same base and height.', 'Use the radius, squared: ' + t('V=\\tfrac13\\pi r^2h') + '.'], 'cone V r' + rr + ' h' + h);
          }
          var sd = r.int(4, 24), hp = r.int(5, 30), up = r.pick(['cm', 'm', 'ft']), Vp = sd * sd * hp / 3, whatP = r.pick(['A square-based pyramid paperweight', 'A pyramid-shaped tent', 'A square-based pyramid monument']);
          return numPart(whatP + ' has a square base ' + t(sd + U(up)) + ' on each side and a height of ' + t(hp + U(up)) + '. Determine its volume.' + solidFig('sqpyramid', { s: sd + ' ' + up, h: hp + ' ' + up }), Vp, { unit: up + '³', dp: 0, alts: [A(sd * sd * hp, 'no-third', 'That is the volume of the <b>prism</b> with the same base and height. A pyramid holds one third of it.'), A(sd * hp / 3, 'no-square', 'The base is a square: its area is ' + t(sd + '^2=' + sd * sd) + '.'), A(sd * sd * hp / 2, 'half-not-third', 'A pyramid’s volume is one <b>third</b> of the prism’s, not one half.')] },
            t('V=\\tfrac13(\\text{base area})h=\\tfrac13(' + sd + '^2)(' + hp + ')=\\tfrac13(' + sd * sd + ')(' + hp + ')=' + (Number.isInteger(Vp) ? F(Vp) : dots(Vp) + '\\approx ' + F(fx(Vp, 0))) + U(up + '³')),
            ['A pyramid holds one third of the prism with the same base and height.', 'Base area of a square: side × side.'], 'pyramid V s' + sd + ' h' + hp);
        } }] },
      { num: '2', outcome: 'M3', stem: 'The surface area needs the <b>slant height</b>. Round to the nearest whole number.', parts: [
        { id: '2', outcome: 'M3', level: 'PRG', make: function (r) {
          var u = r.pick(['cm', 'm', 'in']);
          if (r.chance(0.5)) {
            var tr = r.pick(TRIP), k = r.pick([1, 1, 2]), rr = tr[0] * k, h = tr[1] * k; if (r.chance(0.5) && tr[1] * k <= 30) { rr = tr[1] * k; h = tr[0] * k; }
            var s = Math.sqrt(rr * rr + h * h), S = PI * rr * rr + PI * rr * s;
            var alts = [A(PI * rr * rr + PI * rr * h, 'sa-height', 'The curved surface uses the <b>slant height</b> ' + t('s') + ', not the height. Find ' + t('s=\\sqrt{r^2+h^2}') + ' first.'), A(PI * rr * s, 'sa-no-base', 'A closed cone also has its circular base: add ' + t('\\pi r^2') + '.'),
              A(PI * rr * rr * h / 3, 'v-used-sa', 'That is the volume. Surface area is ' + t('\\pi r^2+\\pi rs') + '.'), A(PI * rr * rr + 2 * PI * rr * s, 'u10x-slant-sub', 'The curved surface of a cone is ' + t('\\pi rs') + ', not ' + t('2\\pi rs') + '.')];
            return numPart('A closed cone has a base radius of ' + t(rr + U(u)) + ' and a perpendicular height of ' + t(h + U(u)) + '. Determine its total surface area.' + solidFig('cone', { r: rr + ' ' + u, h: h + ' ' + u }), S, { unit: u + '²', dp: 0, alts: alts },
              'Slant height: ' + t('s=\\sqrt{r^2+h^2}=\\sqrt{' + rr + '^2+' + h + '^2}=\\sqrt{' + (rr * rr + h * h) + '}=' + nT(rd(s, 6))) + (Number.isInteger(rd(s, 9)) ? '' : '\\ldots') + '.<br>' + t('SA=\\pi r^2+\\pi rs=\\pi(' + rr + ')^2+\\pi(' + rr + ')(' + (Number.isInteger(rd(s, 9)) ? s : dots(s)) + ')=' + dots(S) + '\\approx ' + F(fx(S, 0)) + U(u + '²')),
              ['The radius, height and slant height form a right triangle: ' + t('s^2=r^2+h^2') + '.', t('SA=\\pi r^2+\\pi rs') + ' (base + curved surface).'], 'cone SA r' + rr + ' h' + h);
          }
          var sd = 2 * r.int(3, 14), hp = r.int(4, 20), sl = Math.sqrt(hp * hp + sd * sd / 4), Sp = sd * sd + 2 * sd * sl;
          var altsP = [A(sd * sd + 2 * sd * hp, 'sa-height', 'Each triangular face uses the <b>slant height</b> (up the middle of the face), not the height of the pyramid. Find it first: ' + t('s=\\sqrt{h^2+(\\tfrac{b}{2})^2}') + '.'), A(2 * sd * sl, 'sa-no-base', 'Add the square base too: ' + t(sd + '^2') + '.'),
            A(sd * sd + 2 * sd * Math.sqrt(hp * hp + sd * sd), 'half-edge', 'The slant-height triangle uses <b>half</b> the base edge (from the middle of the base to the middle of an edge): ' + t(sd + '\\div 2=' + sd / 2) + '.'), A(sd * sd + 4 * sd * sl, 'tri-half', 'Each triangle’s area is ' + t('\\tfrac12bs') + ' — don’t forget the ½.')];
          return numPart('A square-based pyramid has base edges of ' + t(sd + U(u)) + ' and a height of ' + t(hp + U(u)) + '. Determine its total surface area, including the base.' + solidFig('sqpyramid', { s: sd + ' ' + u, h: hp + ' ' + u }), Sp, { unit: u + '²', dp: 0, alts: altsP },
            'Slant height (up the middle of a face): ' + t('s=\\sqrt{h^2+\\left(\\tfrac{b}{2}\\right)^2}=\\sqrt{' + hp + '^2+' + sd / 2 + '^2}=\\sqrt{' + (hp * hp + sd * sd / 4) + '}=' + (Number.isInteger(rd(sl, 9)) ? sl : dots(sl))) + '.<br>' + t('SA=b^2+4\\left(\\tfrac12 bs\\right)=' + sd + '^2+2(' + sd + ')(' + (Number.isInteger(rd(sl, 9)) ? sl : dots(sl)) + ')=' + (Number.isInteger(rd(Sp, 9)) ? F(Sp) : dots(Sp) + '\\approx ' + F(fx(Sp, 0))) + U(u + '²')),
            ['The height, half the base edge and the slant height form a right triangle.', 'Surface area = the square base + four triangles, each ' + t('\\tfrac12 bs') + '.'], 'pyr SA b' + sd + ' h' + hp);
        } }] },
      { num: '3', outcome: 'M3', stem: 'Work backwards from the surface area. Use ' + t('SA=\\pi r^2+\\pi rs') + '.', parts: [
        { id: '3', outcome: 'M3', level: 'ADV', make: function (r) {
          var s0 = find(function () { var rr = r.int(3, 12), s = tenth(r, rr + 2, rr + 14); return { r: rr, S: Math.round(PI * rr * rr + PI * rr * s) }; }, function (q) { var s = (q.S - PI * q.r * q.r) / (PI * q.r); return s > q.r + 1 && safe(s, 1); }, { r: 6, S: 270 });
          var rr = s0.r, S = s0.S, s = (S - PI * rr * rr) / (PI * rr), what = r.pick(['A closed cone-shaped gift box', 'A solid cone made of clay', 'A closed conical container']);
          var alts = [A(S / (PI * rr), 'no-subtract', 'Subtract the base first: the curved surface is ' + t('SA-\\pi r^2') + '; then divide by ' + t('\\pi r') + '.'), A((S - PI * rr * rr) / (2 * PI * rr), 'u10x-slant-sub', 'The curved surface of a cone is ' + t('\\pi rs') + ', so divide by ' + t('\\pi r') + ' (not ' + t('2\\pi r') + ').'),
            A((S - PI * rr * rr) / PI, 'u10x-slant-sub', 'Divide by ' + t('\\pi r') + ', not just ' + t('\\pi') + ': ' + t('s=\\dfrac{SA-\\pi r^2}{\\pi r}') + '.'), A(Math.sqrt(Math.max(0, s * s - rr * rr)), 'u10x-slant-sub', 'That is the perpendicular <b>height</b>. The question asks for the slant height ' + t('s') + '.')];
          return numPart(what + ' has a total surface area of ' + t(S + '\\text{ cm}^2') + ' and a base radius of ' + t(rr + '\\text{ cm}') + '. Determine its slant height, to the nearest tenth of a centimetre.' + solidFig('cone', { r: rr + ' cm', s: 's' }), s, { before: t('s\\approx'), unit: 'cm', dp: 1, alts: alts },
            t(S + '=\\pi(' + rr + ')^2+\\pi(' + rr + ')s') + '<br>' + t(S + '-' + rr * rr + '\\pi=' + rr + '\\pi s') + '<br>' + t('s=\\dfrac{' + S + '-' + rr * rr + '\\pi}{' + rr + '\\pi}=\\dfrac{' + dots(S - PI * rr * rr) + '}{' + dots(PI * rr) + '}=' + dots(s) + '\\approx ' + fx(s, 1) + '\\text{ cm}'),
            ['Substitute the surface area and the radius into ' + t('SA=\\pi r^2+\\pi rs') + '.', 'Subtract the base area ' + t('\\pi r^2') + ', then divide by ' + t('\\pi r') + '.'], 'cone s from SA ' + S + ' r' + rr);
        } }] }]
  });

  /* ---------------- 10.5 ---------------- */
  HW.defineExit({
    lesson: 'u10l5', calc: true, outcome: 'M3',
    blurb: 'Volume of a sphere, a sphere’s volume from its surface area, and the volume of a cylinder with hemispherical ends.',
    questions: [
      { num: '1', outcome: 'M3', stem: 'Use the π key. Round to the nearest tenth.', parts: [
        { id: '1', outcome: 'M3', level: 'BEG', make: function (r) {
          var useD = r.chance(0.5), u = r.pick(['cm', 'in', 'm']), rr = useD ? r.int(3, 15) : tenth(r, 2, 14), what = r.pick(['A bowling ball', 'A gumball', 'A spherical lamp shade', 'A globe', 'A snowball']);
          var V = 4 / 3 * PI * Math.pow(rr, 3); if (!safe(V, 1)) { rr = useD ? rr + 1 : cl(rr + 0.1); V = 4 / 3 * PI * Math.pow(rr, 3); }
          var alts = [A(PI * Math.pow(rr, 3), 'v-no-43', 'The sphere formula has ' + t('\\tfrac43') + ' in front: ' + t('V=\\tfrac43\\pi r^3') + '.'), A(4 / 3 * PI * rr * rr, 'v-r2', 'Cube the radius for a volume: ' + t('r^3') + '.'), A(4 * PI * Math.pow(rr, 3), 'v-no-3', 'Multiply by 4 <b>and</b> divide by 3: ' + t('\\tfrac43\\pi r^3') + '.'), A(4 * PI * rr * rr, 'v-used-sa', 'That is the surface area ' + t('4\\pi r^2') + '. Volume is ' + t('\\tfrac43\\pi r^3') + '.')];
          if (useD) alts.push(A(4 / 3 * PI * Math.pow(2 * rr, 3), 'd-as-r', 'You used the diameter as the radius. Halve it first: ' + t('r=' + rr) + '.'));
          return numPart(what + ' has a ' + (useD ? 'diameter of ' + t(2 * rr + U(u)) : 'radius of ' + t(nT(rr) + U(u))) + '. Determine its volume.' + solidFig('sphere', useD ? { d: 2 * rr + ' ' + u } : { r: nT(rr) + ' ' + u }), V, { unit: u + '³', dp: 1, alts: alts },
            (useD ? t('r=' + 2 * rr + '\\div 2=' + rr) + '<br>' : '') + t('V=\\tfrac43\\pi r^3=\\tfrac43\\pi(' + nT(rr) + ')^3=' + dots(V) + '\\approx ' + fxT(V, 1) + U(u + '³')),
            ['Use the radius (half the diameter).', t('V=\\tfrac43\\pi r^3') + ' — cube the radius.'], 'sphere V r' + rr);
        } }] },
      { num: '2', outcome: 'M3', stem: 'Find the radius first. Keep full calculator values until the end.', parts: [
        { id: '2', outcome: 'M3', level: 'PRG', make: function (r) {
          var what = r.pick(['A spherical water tower tank', 'A spherical weather balloon', 'A spherical buoy', 'A spherical gas storage tank']), S = r.pick([5, 10]) * r.int(12, 90), u = 'm';
          var rr = Math.sqrt(S / (4 * PI)), V = 4 / 3 * PI * Math.pow(rr, 3); if (!safe(V, 0)) { S += 5; rr = Math.sqrt(S / (4 * PI)); V = 4 / 3 * PI * Math.pow(rr, 3); }
          var v43 = function (x) { return 4 / 3 * PI * Math.pow(x, 3); };
          var alts = [A(v43(S / (4 * PI)), 'no-sqrt', 'From ' + t('S=4\\pi r^2') + ', ' + t('\\dfrac{S}{4\\pi}') + ' is ' + t('r^2') + ': take the square root to get ' + t('r') + '.'), A(v43(Math.sqrt(S / PI)), 'sa-no-4', 'Divide by ' + t('4\\pi') + ', not just ' + t('\\pi') + ': ' + t('r^2=\\dfrac{S}{4\\pi}') + '.'),
            A(v43(rd(rr, 1)), 'early-round', 'Close — but you rounded the radius first. Keep its full value in the calculator.'), A(rr, 'gave-r', 'That is the radius. Now use it to find the volume, ' + t('\\tfrac43\\pi r^3') + '.'), A(v43(Math.cbrt(S / (4 * PI))), 'cbrt-for-sqrt', 'Surface area has ' + t('r^2') + ', so undo it with a <b>square</b> root, not a cube root.')];
          return numPart(what + ' has a surface area of ' + t(F(S) + '\\text{ m}^2') + '. Determine its volume, to the nearest cubic metre.', V, { unit: 'm³', dp: 0, alts: alts },
            t(F(S) + '=4\\pi r^2\\ \\Rightarrow\\ r^2=\\dfrac{' + F(S) + '}{4\\pi}=' + dots(rr * rr) + ',\\quad r=' + dots(rr) + '\\text{ m}') + '<br>' + t('V=\\tfrac43\\pi r^3=\\tfrac43\\pi(' + dots(rr) + ')^3=' + dots(V) + '\\approx ' + F(fx(V, 0)) + '\\text{ m}^3'),
            ['Solve ' + t('S=4\\pi r^2') + ' for ' + t('r') + ': divide by ' + t('4\\pi') + ', then take the square root.', 'Then ' + t('V=\\tfrac43\\pi r^3') + ', rounding only at the end.'], 'sphere SA to V ' + S + u);
        } }] },
      { num: '3', outcome: 'M3', stem: 'A composite solid: a cylinder with a hemisphere on each end (diagram not to scale).', parts: [
        { id: '3', outcome: 'M3', level: 'ADV', make: function (r) {
          var ctx = r.pick([{ w: 'A propane tank', u: 'm', d: [8, 30], L: [3, 9], sc: 10 }, { w: 'A vitamin capsule', u: 'mm', d: [6, 10], L: [14, 26], sc: 1 }, { w: 'A water boiler', u: 'm', d: [12, 40], L: [4, 12], sc: 10 }]);
          var s = find(function () { var d = r.int(ctx.d[0], ctx.d[1]) / ctx.sc, Lt = r.int(ctx.L[0] * (ctx.sc === 1 ? 1 : 2), ctx.L[1] * (ctx.sc === 1 ? 1 : 2)) / (ctx.sc === 1 ? 1 : 2); return { d: d, L: Lt }; }, function (q) { var rr = q.d / 2, c = q.L - q.d, V = PI * rr * rr * c + 4 / 3 * PI * Math.pow(rr, 3); return c >= q.d * 0.6 && safe(V, 1); }, { d: 1.2, L: 4 });
          var d = s.d, Lt = s.L, rr = d / 2, c = Lt - d, Vc = PI * rr * rr * c, Vs = 4 / 3 * PI * Math.pow(rr, 3), V = Vc + Vs, u = ctx.u;
          var alts = [A(PI * rr * rr * Lt + Vs, 'full-length', 'The cylinder part is shorter than the whole length: the two hemispheres take up ' + t('r+r=d') + '. Use ' + t(nT(Lt) + '-' + nT(d) + '=' + nT(c)) + '.'), A(PI * rr * rr * (Lt - rr) + Vs, 'cap-length', 'Each end takes up one radius, so subtract the whole diameter: cylinder length ' + t('=' + nT(Lt) + '-' + nT(d) + '=' + nT(c)) + '.'),
            A(Vc + Vs / 2, 'part-missing', 'There are <b>two</b> hemispheres — together they make one whole sphere, ' + t('\\tfrac43\\pi r^3') + '.'), A(Vc, 'part-missing', 'Add the two hemispheres (one whole sphere) to the cylinder.'), A(PI * d * d * c + 4 / 3 * PI * Math.pow(d, 3), 'd-as-r', 'You used the diameter as the radius. ' + t('r=' + nT(d) + '\\div 2=' + nT(rr)) + '.'), A(PI * rr * rr * Lt, 'part-missing', 'That treats the whole solid as one cylinder. The ends are hemispheres.')];
          return numPart(ctx.w + ' is a cylinder with a hemisphere on each end. Its total length is ' + t(nT(Lt) + U(u)) + ' and its diameter is ' + t(nT(d) + U(u)) + '. Determine its volume, to the nearest tenth.' + capsuleFig({ d: d, cyl: c, LLab: nT(Lt) + ' ' + u, dLab: nT(d) + ' ' + u }), V, { unit: u + '³', dp: 1, alts: alts },
            t('r=' + nT(d) + '\\div 2=' + nT(rr) + U(u)) + '; the cylinder part is ' + t(nT(Lt) + '-' + nT(d) + '=' + nT(c) + U(u)) + ' long (each end takes one radius).<br>Cylinder: ' + t('\\pi r^2h=\\pi(' + nT(rr) + ')^2(' + nT(c) + ')=' + dots(Vc)) + '<br>Two hemispheres = one sphere: ' + t('\\tfrac43\\pi(' + nT(rr) + ')^3=' + dots(Vs)) + '<br>Total: ' + t(dots(Vc) + '+' + dots(Vs) + '=' + dots(V) + '\\approx ' + fxT(V, 1) + U(u + '³')),
            ['The two hemispheres together make one sphere with the same radius.', 'The cylinder part is the total length minus the two radii (one diameter).'], 'capsule ' + ctx.w + ' d' + d + ' L' + Lt);
        } }] }]
  });

  /* ---------------- 10.6 (unit review) ---------------- */
  var STEP_REF = [
    { ref: 'shoe', make: function (r) { var s = r.pick([8, 9, 10, 12]), n = find(function () { return r.int(3, 12); }, function (n) { return (36 * n) % s === 0 && 36 * n / s >= 9; }, 6); return { s: s, n: n, ans: 36 * n / s,
      text: 'Kai’s shoe is ' + t(s + '\\text{ in}') + ' long. To mark a line ' + t(n + '\\text{ yd}') + ' long, Kai places one foot in front of the other, heel to toe. How many shoe lengths does the line take?', alts: [A(36 * n, 'u10x-ref-count', 'That is the length of the line in inches. Divide by the shoe length to count the placements.'), A(12 * n / s, 'u10x-yd-in', 'A yard is ' + t('36') + ' inches (' + t('3\\text{ ft}\\times 12') + '), not ' + t('12') + '.'), A(3 * n / s, 'u10x-yd-in', 'Change the yards to <b>inches</b> (' + t('1\\text{ yd}=36\\text{ in}') + ') before dividing by the shoe length.')],
      sol: t(n + '\\text{ yd}=' + n + '\\times 36=' + 36 * n + '\\text{ in}') + ', and ' + t(36 * n + '\\div ' + s + '=' + 36 * n / s) + ' shoe lengths.' }; } },
    { ref: 'span', make: function (r) { var s = r.pick([15, 18, 20, 24, 25]), n = find(function () { return r.int(12, 48) / 10; }, function (n) { return Math.abs(Math.round(n * 100 / s) - n * 100 / s) < 1e-9 && n * 100 / s >= 6; }, 1.8); return { s: s, n: n, ans: cl(n * 100 / s),
      text: 'Ama’s hand span is about ' + t(s + '\\text{ cm}') + '. How many hand spans long is a table that measures ' + t(nT(n) + '\\text{ m}') + '?', alts: [A(n * 100, 'u10x-ref-count', 'That is the length in centimetres. Divide by the hand span.'), A(n / s, 'u10x-same-unit', 'Change the metres to centimetres first (' + t('1\\text{ m}=100\\text{ cm}') + ') so both are in the same unit.'), A(n * 10 / s, 'prefix-places', 'A metre is ' + t('100') + ' cm, not ' + t('10') + '.')],
      sol: t(nT(n) + '\\text{ m}=' + nT(n * 100) + '\\text{ cm}') + ', and ' + t(nT(n * 100) + '\\div ' + s + '=' + nT(n * 100 / s)) + ' spans.' }; } }];
  HW.defineExit({
    lesson: 'u10l6', calc: true, outcome: 'M3',
    blurb: 'Unit 10 review mix: an SI length calculation (M2), counting a personal referent (M1), the curved surface area of a cylinder (M3) and a speed conversion (M2).',
    questions: [
      { num: '1', outcome: 'M2', stem: 'Change to one unit before you subtract.', parts: [
        { id: '1', outcome: 'M2', level: 'BEG', make: function (r) {
          var Lm = r.int(105, 295) / 100, cut = r.int(12, Math.floor(Lm * 100) - 20), what = r.pick(['board', 'pipe', 'curtain rod', 'length of rope']);
          var rest = Math.round(Lm * 100 - cut) * 10;
          return numPart('A ' + what + ' is ' + t(nT(Lm) + '\\text{ m}') + ' long. A piece ' + t(cut + '\\text{ cm}') + ' long is cut off. How long is the rest of the ' + what.replace(/^length of /, '') + ', in millimetres?', rest, { unit: 'mm', alts: [A(Lm * 1000 - cut, 'u10x-same-unit', 'The two lengths are in different units: change ' + t(nT(Lm) + '\\text{ m}') + ' and ' + t(cut + '\\text{ cm}') + ' to millimetres first, then subtract.'), A(Math.abs(Lm - cut), 'u10x-same-unit', 'Change both lengths to the same unit before subtracting.')] },
            t(nT(Lm) + '\\text{ m}=' + F(Lm * 1000) + '\\text{ mm}') + ' and ' + t(cut + '\\text{ cm}=' + cut * 10 + '\\text{ mm}') + '.<br>' + t(F(Lm * 1000) + '-' + cut * 10 + '=' + F(rest) + '\\text{ mm}'),
            ['Change both lengths to millimetres (' + t('1\\text{ m}=1000\\text{ mm}') + ', ' + t('1\\text{ cm}=10\\text{ mm}') + ').', 'Then subtract.'], 'cut ' + Lm + 'm - ' + cut + 'cm');
        } }] },
      { num: '2', outcome: 'M1', stem: 'A personal referent used again and again.', parts: [
        { id: '2', outcome: 'M1', level: 'EMG', make: function (r) {
          var s = r.pick(STEP_REF).make(r);
          return numPart(s.text, s.ans, { alts: s.alts, places: false }, s.sol, ['Write the length and the referent in the <b>same</b> unit.', 'Then divide the length by the size of one referent.'], 'referent count ' + s.s + ' ' + s.n);
        } }] },
      { num: '3', outcome: 'M3', stem: 'Use the π key. Round to the nearest whole number.', parts: [
        { id: '3', outcome: 'M3', level: 'PRG', make: function (r) {
          var d = tenth(r, 5.5, 14), h = r.int(8, 22), what = r.pick(['can of soup', 'can of paint', 'tin of tea', 'can of beans']), x = PI * d * h, rr = d / 2;
          if (!safe(x, 0)) { h += 1; x = PI * d * h; }
          var alts = [A(2 * PI * d * h, 'diam-radius', 'You used the diameter as the radius. The label wraps once around: its width is the circumference ' + t('\\pi d') + '.'), A(PI * rr * h, 'half-lateral', 'The label’s width is the circumference ' + t('2\\pi r=\\pi d') + ', so its area is ' + t('\\pi dh') + '.'),
            A(x + 2 * PI * rr * rr, 'sa-extra-face', 'The label covers only the <b>curved</b> side — not the top and bottom.'), A(PI * rr * rr * h, 'v-used-sa', 'That is the volume of the can. The label is an area: circumference × height.')];
          return numPart('A paper label covers the whole curved side of a ' + what + '. The can has a diameter of ' + t(fx(d, 1) + '\\text{ cm}') + ' and a height of ' + t(h + '\\text{ cm}') + '. Determine the area of the label.' + solidFig('cylinder', { d: fx(d, 1) + ' cm', h: h + ' cm' }), x, { unit: 'cm²', dp: 0, alts: alts },
            'Unrolled, the label is a rectangle: its width is the circumference and its height is the can’s height.<br>' + t('A=\\pi dh=\\pi(' + fx(d, 1) + ')(' + h + ')=' + dots(x) + '\\approx ' + F(fx(x, 0)) + '\\text{ cm}^2'),
            ['Unroll the label: it is a rectangle.', 'Its width is the circumference ' + t('\\pi d') + ' and its height is the height of the can.'], 'label d' + d + ' h' + h);
        } }] },
      { num: '4', outcome: 'M2', stem: 'Use unit analysis. Round to the nearest tenth.', parts: [
        { id: '4', outcome: 'M2', level: 'PRG', make: function (r) {
          var D = r.pick([100, 200, 400, 800, 1500]), lo = { 100: [10.5, 16], 200: [21, 34], 400: [48, 80], 800: [110, 190], 1500: [230, 400] }[D];
          var T = find(function () { return r.int(Math.round(lo[0] * 100), Math.round(lo[1] * 100)) / 100; }, function (T) { return safe(D / T * 3.6, 1); }, lo[0] + 1.37), x = D / T * 3.6, who = r.pick(['A sprinter', 'A swimmer', 'A speed skater', 'A cyclist']);
          var alts = [A(D / T, 'u10x-rate-one', 'That is the speed in <b>m/s</b>. Change metres to kilometres and seconds to hours too (' + t('\\times 3.6') + ').'), A(D / T / 3.6, 'conv-direction', 'A km/h is a smaller speed unit than a m/s, so the number must get bigger: multiply by ' + t('3.6') + '.'), A(T / D * 3.6, 'rate-flip', 'Speed is distance ÷ time, not time ÷ distance.'), A(D / T * 60 / 1000, 'u10x-rate-one', 'That is km per <b>minute</b>. An hour has ' + t('3600') + ' seconds.')];
          return numPart(who + ' covers ' + t(F(D) + '\\text{ m}') + ' in ' + t(T.toFixed(2) + '\\text{ s}') + '. What is the average speed in kilometres per hour?', x, { unit: 'km/h', dp: 1, alts: alts },
            disp(chainT([[D, 'm', T.toFixed(2), 's'], [1, 'km', 1000, 'm'], [3600, 's', 1, 'h']]) + '=' + dots(x) + '\\text{ km/h}\\approx ' + fx(x, 1) + '\\text{ km/h}'),
            ['Speed = distance ÷ time gives metres per second.', 'Then multiply by unit factors: ' + t('\\frac{1\\text{ km}}{1000\\text{ m}}') + ' and ' + t('\\frac{3600\\text{ s}}{1\\text{ h}}') + '.'], 'speed ' + D + ' in ' + T);
        } }] }]
  });
})(window);
