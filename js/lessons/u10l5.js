/* Math 10C · Unit 10 · Lesson 5 — Surface Area and Volume of Spheres and Hemispheres (M3)
 * Assignment questions 1–16 (u10_L05.tex) and the Lesson 5 Extra Practice (u10_EP05.tex, Parts A–I).
 * Every part is a generator: it keeps the idea and difficulty of the booklet question (the booklet's numbers are one
 * of the possible versions) and changes the numbers. Rounded answers use K.P.near (js/geom.js) with targeted
 * alternatives for the classic slips (diameter as radius, hemisphere base, 4/3 forgotten, r² vs r³, missing root, …);
 * exact answers "in terms of π" use a local checker. Figures: HW.solid and local SVG for composite solids.
 * Levels: LIM BEG EMG PRG ADV MAS. */
(function (root) {
  'use strict';
  var HW = root.HW, K = HW.kit, ex = HW.ex, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form, F = HW.fmt;
  var PI = Math.PI, RT = K.roundTo;

  /* ---------------- numbers ---------------- */
  function trim(x) { return String(Number(Number(x).toFixed(8))); }
  function D(x, dp) { return F(dp == null ? trim(x) : Number(x).toFixed(dp)); }          // display (TeX, thin spaces)
  function fracOf(x) { for (var q = 1; q <= 20000; q++) { var p = Math.round(x * q); if (Math.abs(p / q - x) < 1e-9 * Math.max(1, Math.abs(x))) return [p, q]; } return null; }
  function coefT(c) {   // exact coefficient: a terminating decimal, else a fraction
    var fr = fracOf(c); if (!fr) return trim(c);
    var q = fr[1]; while (q % 2 === 0) q /= 2; while (q % 5 === 0) q /= 5;
    if (q === 1 && String(trim(c)).replace(/^-?\d*\.?/, '').length <= 6) return trim(c);
    return (fr[0] < 0 ? '-' : '') + '\\frac{' + Math.abs(fr[0]) + '}{' + fr[1] + '}';
  }
  function piT(c) { return (Math.abs(c - 1) < 1e-12 ? '' : coefT(c)) + '\\pi'; }       // c·π as TeX
  function exT(k, c) { return k ? trim(k) + (c < 0 ? '-' + piT(-c) : '+' + piT(c)) : piT(c); }   // k + c·π
  function exTF(k, c) { return k ? D(k) + (c < 0 ? '-' + piT(-c) : '+' + piT(c)) : piT(c); }
  function U(u) { return { l: u, a: u + '²', v: u + '³', tl: '\\text{ ' + u + '}', ta: '\\text{ ' + u + '}^2', tv: '\\text{ ' + u + '}^3' }; }
  function A(v, code, hint) { return { v: v, code: code, hint: hint }; }
  function placeName(dp) { return dp === 0 ? 'Nearest whole number' : dp === 1 ? 'Nearest tenth' : dp === 2 ? 'Nearest hundredth' : dp + ' decimal places'; }
  function roughly(x, dp) { return t('\\approx ' + D(RT(x, dp), dp)); }

  /* ---------------- part builders ---------------- */
  // rounded answer with targeted alternatives; bad = the alternatives that round differently from the answer
  function nearP(prompt, x, dp, unit, alts, sol, hints, text, o) {
    o = o || {}; alts = (alts || []).filter(function (a) { return isFinite(a.v) && a.v > 0; });
    var p = K.P.near(prompt, x, dp, { unit: unit || undefined, alts: alts, nr: !!o.nr, before: o.before }, sol, hints, text);
    var w = RT(x, dp);
    p.answer = (o.before ? o.before : '') + t(D(w, dp)) + (unit ? ' ' + unit : '');
    var seen = {}; seen[w.toFixed(dp)] = 1;
    p.bad = alts.map(function (a) { return RT(a.v, dp).toFixed(dp); }).filter(function (s) { if (seen[s] || (o.nr && s.length > 4)) return false; seen[s] = 1; return true; });
    return p;
  }
  // exact value k + c·π: π kept as a symbol, one multiple of π, nothing left to multiply out
  function exactCheck(k, c, alts) {
    var T = k + c * PI;
    return function (resp) {
      var a = K.read(resp); if (a.res) return a.res;
      var s = String(resp == null ? '' : resp), npi = (s.match(/\\pi|π|pi/g) || []).length, sh = ex.shape(a.ast);
      if (ex.eq(a.val, T, 1e-9)) {
        if (!sh.pi) return form('pi-symbol', 'For the exact answer, leave ' + t('\\pi') + ' as a symbol.');
        if (npi > 1 || sh.pow || sh.roots || (!k && sh.ops)) return form('simplify', 'Right value — now simplify it to ' + (k ? 'one number and one multiple of ' + t('\\pi') : 'a single number times ' + t('\\pi')) + '.');
        return ok();
      }
      if (!sh.pi && Math.abs(a.val - T) <= 0.005 * Math.abs(T)) return form('pi-decimal', 'That’s the decimal value. The <b>exact</b> answer keeps ' + t('\\pi') + ' as a symbol, like ' + t('24.5\\pi') + '.');
      if (sh.pi && Math.abs(a.val - T) <= 0.002 * Math.abs(T)) return form('pi-coef', 'Very close — but keep the number in front of ' + t('\\pi') + ' exact (use a fraction if its decimal doesn’t end).');
      for (var i = 0; i < (alts || []).length; i++) { var al = alts[i]; if (isFinite(al.v) && Math.abs(a.val - al.v) <= 0.002 * Math.abs(al.v)) return wrong(al.code, al.hint); }
      return wrong('value', null);
    };
  }
  // two boxes: exact (in terms of π) and rounded
  function exactNearP(prompt, k, c, dp, unit, alts, sol, hints, text) {
    var T = k + c * PI, w = RT(T, dp), keyEx = exT(k, c);
    alts = (alts || []).filter(function (a) { return isFinite(a.v) && a.v > 0; });
    var fields = [{ label: 'Exact', name: 'Exact', mode: 'math', keys: 'expr', after: unit }, { label: placeName(dp), name: placeName(dp), after: unit }];
    var p = K.P.fields(prompt, fields, [exactCheck(k, c, alts), K.near(T, dp, { alts: alts })], [keyEx, w.toFixed(dp)],
      t(exTF(k, c)) + ' ' + unit + ' ' + t('\\approx ' + D(w, dp)) + ' ' + unit, sol, hints, text);
    p.bad = alts.filter(function (a) { return Math.abs(RT(a.v, dp) - w) > 1e-9; }).map(function (a) { return [keyEx, RT(a.v, dp).toFixed(dp)]; }).slice(0, 3);
    p.good = [[keyEx.replace(/\\pi$/, '') === '' ? '\\pi' : keyEx, D(w, dp).replace(/\\,/g, ' ')]];
    return p;
  }
  // a formula in letters (equivalent forms accepted; numbers multiplied out; opt.form 'radical' | 'power')
  function countVars(ast) { var n = 0; (function w(x) { if (!x || typeof x !== 'object') return; if (x.t === 'var') n++; ['a', 'b', 'n'].forEach(function (k) { if (x[k]) w(x[k]); }); })(ast); return n; }
  function fracExp(ast) { var f = false; (function w(x) { if (!x || typeof x !== 'object') return; if (x.t === 'pow') { var e = ex.value(x.b); if (isFinite(e) && Math.abs(e - Math.round(e)) > 1e-9) f = true; } ['a', 'b', 'n'].forEach(function (k) { if (x[k]) w(x[k]); }); })(ast); return f; }
  function symP(prompt, targetTex, vars, opt, sol, hints, text) {
    opt = opt || {};
    var tp = ex.parse(targetTex).ast, tn = opt.maxNums || ex.shape(tp).nums, tv = countVars(tp);
    var diags = (opt.diags || []).map(function (d) { return { ast: ex.parse(d.tex).ast, code: d.code, hint: d.hint, tex: d.tex }; });
    var check = function (resp) {
      var a = K.read(resp); if (a.res) return a.res;
      if (ex.equiv(a.ast, tp, vars, 6)) {
        if (opt.form === 'radical' && fracExp(a.ast)) return form('not-radical', 'Right — now write it in <b>radical form</b>, with a root sign instead of the exponent ' + t('\\frac{1}{3}') + '.');
        if (opt.form === 'power' && ex.shape(a.ast).roots) return form('not-power', 'Right — now write it as a <b>power</b>: use the exponent ' + t('\\frac{1}{3}') + ' instead of the root sign.');
        if (ex.shape(a.ast).nums > tn || countVars(a.ast) > tv) return form('simplify', 'Right — now simplify: multiply the numbers together and write each letter only once.');
        return ok();
      }
      for (var i = 0; i < diags.length; i++) if (ex.equiv(a.ast, diags[i].ast, vars, 6)) return wrong(diags[i].code, diags[i].hint);
      return wrong('value', null);
    };
    return { prompt: prompt, input: { type: 'math', keys: 'expo', vars: vars, pi: true, before: opt.before }, check: check, key: targetTex,
      answer: t((opt.before ? opt.lhs || '' : '') + targetTex), solution: sol, hints: hints || [], text: text,
      good: opt.good || [], bad: diags.map(function (d) { return d.tex; }) };
  }
  function mcP(r, prompt, opts, sol, hints, text, keepOrder) { return K.P.mc(r, prompt, opts, sol, hints, text, keepOrder); }
  function intP(prompt, ans, alts, sol, hints, text, after) {
    var p = K.P.number(prompt, ans, function (v) { for (var i = 0; i < alts.length; i++) if (Math.abs(v - alts[i].v) < 1e-9) return { code: alts[i].code, hint: alts[i].hint }; return null; }, sol, hints, text, after ? { after: after } : null);
    p.answer = t(F(ans)) + (after ? ' ' + after : '');
    p.bad = alts.filter(function (a) { return a.v !== ans; }).map(function (a) { return String(a.v); });
    return p;
  }
  function intField(ans, alts) { return function (resp) { var c = K.number(ans, function (v) { for (var i = 0; i < alts.length; i++) if (Math.abs(v - alts[i].v) < 1e-9) return { code: alts[i].code, hint: alts[i].hint }; return null; }); return c(resp); }; }

  /* ---------------- common hints ---------------- */
  var H = {
    dr: 'You used the <b>diameter</b> as the radius. Halve the diameter first: ' + t('r=d\\div 2') + '.',
    circ: t('\\pi r^2') + ' is the area of one flat circle. A sphere’s surface is <b>four</b> of those circles: ' + t('SA=4\\pi r^2') + '.',
    saR3: 'In ' + t('SA=4\\pi r^2') + ' the radius is <b>squared</b>, not cubed.',
    vForSa: 'That’s the <b>volume</b>. Surface area uses ' + t('SA=4\\pi r^2') + '.',
    saHalf: t('2\\pi r^2') + ' is only half a sphere’s surface. A whole sphere is ' + t('4\\pi r^2') + '.',
    no43: 'Don’t forget the ' + t('\\frac{4}{3}') + ': ' + t('V=\\frac{4}{3}\\pi r^3') + '.',
    no3: 'You multiplied by ' + t('4') + ' but didn’t divide by ' + t('3') + ': ' + t('V=\\frac{4}{3}\\pi r^3') + '.',
    r2: 'Volume needs the radius <b>cubed</b> (' + t('r^3') + '), not squared.',
    saForV: 'That’s the <b>surface area</b>. Volume uses ' + t('V=\\frac{4}{3}\\pi r^3') + '.',
    flip43: 'The fraction is ' + t('\\frac{4}{3}') + ', not ' + t('\\frac{3}{4}') + '.',
    halvedR: 'The <b>radius</b> was given — don’t halve it.',
    hWhole: 'That’s the whole sphere. A hemisphere is <b>half</b> a sphere: ' + t('V=\\frac{2}{3}\\pi r^3') + '.',
    hHalfR: 'You halved the <b>radius</b> instead of halving the volume. Halving ' + t('r') + ' makes the volume 8 times smaller, not 2. Use ' + t('V=\\frac{2}{3}\\pi r^3') + '.',
    hNoBase: 'You left out the <b>flat circular base</b>. Nothing in the question excludes it, so add ' + t('\\pi r^2') + ': ' + t('SA=2\\pi r^2+\\pi r^2=3\\pi r^2') + '.',
    hBase: 'Read the wording again: the flat base is <b>not</b> part of this surface, so count only the curved part, ' + t('2\\pi r^2') + '.',
    hWholeSa: t('4\\pi r^2') + ' is a whole sphere. A hemisphere’s curved surface is half of that, ' + t('2\\pi r^2') + '.',
    hFive: 'The curved part of a hemisphere is <b>half</b> of ' + t('4\\pi r^2') + ', so ' + t('2\\pi r^2') + '; then add the base ' + t('\\pi r^2') + '.',
    noCbrt: 'You found ' + t('r^3') + '. Take the <b>cube root</b> to get ' + t('r') + '.',
    sqrtCbrt: 'The radius is cubed in the volume formula, so undo it with a <b>cube</b> root, not a square root.',
    noSqrt: 'You found ' + t('r^2') + '. Take the <b>square root</b> to get ' + t('r') + '.',
    cbrtSqrt: 'The radius is squared in ' + t('SA=4\\pi r^2') + ', so undo it with a <b>square</b> root.',
    sa4: 'Divide by ' + t('4\\pi') + ' (not just ' + t('\\pi') + '): ' + t('r^2=\\frac{SA}{4\\pi}') + '.',
    gaveD: 'That’s the <b>diameter</b>. The question asks for the radius — don’t double it.',
    gaveR: 'That’s the <b>radius</b>. The question asks for the diameter: ' + t('d=2r') + '.',
    early: 'You rounded the radius before using it. Keep the unrounded radius in your calculator and round only the final answer.'
  };
  function saAlts(r, giv) {
    var a = []; if (giv === 'd') a.push(A(16 * PI * r * r, 'd-as-r', H.dr));
    a.push(A(PI * r * r, 'sa-circle', H.circ), A(4 * PI * r * r * r, 'sa-r3', H.saR3), A(4 / 3 * PI * r * r * r, 'v-for-sa', H.vForSa), A(2 * PI * r * r, 'sa-half', H.saHalf));
    return a;
  }
  function vAlts(r, giv) {
    var a = []; if (giv === 'd') a.push(A(32 / 3 * PI * r * r * r, 'd-as-r', H.dr));
    a.push(A(PI * r * r * r, 'v-no-43', H.no43), A(4 * PI * r * r * r, 'v-no-3', H.no3), A(4 / 3 * PI * r * r, 'v-r2', H.r2), A(4 * PI * r * r, 'sa-for-v', H.saForV), A(0.75 * PI * r * r * r, 'v-43-flip', H.flip43));
    if (giv === 'r') a.push(A(PI * r * r * r / 6, 'halved-r', H.halvedR));
    return a;
  }
  function hvAlts(r, giv) {
    var a = []; if (giv === 'd') a.push(A(16 / 3 * PI * r * r * r, 'd-as-r', H.dr));
    a.push(A(4 / 3 * PI * r * r * r, 'hemi-whole', H.hWhole), A(PI * r * r * r / 6, 'hemi-half-r', H.hHalfR), A(2 / 3 * PI * r * r, 'v-r2', H.r2), A(2 * PI * r * r * r, 'v-no-3', 'Divide by ' + t('3') + ': ' + t('V=\\frac{2}{3}\\pi r^3') + '.'));
    return a;
  }
  function hsAlts(r, giv, base) {
    var a = []; if (giv === 'd') a.push(A((base ? 12 : 8) * PI * r * r, 'd-as-r', H.dr));
    if (base) a.push(A(2 * PI * r * r, 'hemi-no-base', H.hNoBase), A(4 * PI * r * r, 'hemi-whole', H.hWholeSa), A(5 * PI * r * r, 'hemi-whole', H.hFive), A(1.5 * PI * r * r, 'hemi-whole', H.hFive));
    else a.push(A(3 * PI * r * r, 'hemi-base', H.hBase), A(4 * PI * r * r, 'hemi-whole', H.hWholeSa), A(PI * r * r, 'sa-circle', 'That’s just the flat circle. The curved surface of a hemisphere is ' + t('2\\pi r^2') + '.'));
    return a;
  }
  function rvAlts(V, hemi) {   // radius from a volume
    var c = hemi ? 2 / 3 : 4 / 3, r = Math.cbrt(V / (c * PI));
    return [A(V / (c * PI), 'no-cbrt', H.noCbrt), A(Math.sqrt(V / (c * PI)), 'sqrt-for-cbrt', H.sqrtCbrt), A(Math.cbrt(V * c / PI), 'v-43-flip', 'To undo ' + t('\\times\\frac{' + (hemi ? 2 : 4) + '}{3}') + ', multiply by ' + t('3') + ' and divide by ' + t((hemi ? 2 : 4) + '\\pi') + '.'),
      A(Math.cbrt(V / PI), 'v-no-43', 'Divide by the whole ' + t('\\frac{' + (hemi ? 2 : 4) + '}{3}\\pi') + ', not just ' + t('\\pi') + '.'), A(2 * r, 'gave-d', H.gaveD), A(Math.cbrt(V), 'v-no-43', 'Isolate ' + t('r^3') + ' first: divide by ' + t('\\frac{' + (hemi ? 2 : 4) + '}{3}\\pi') + ', then take the cube root.')];
  }
  function rsAlts(S) {   // radius from a sphere's surface area
    var r = Math.sqrt(S / (4 * PI));
    return [A(S / (4 * PI), 'no-sqrt', H.noSqrt), A(Math.cbrt(S / (4 * PI)), 'cbrt-for-sqrt', H.cbrtSqrt), A(Math.sqrt(S / PI), 'sa-no-4', H.sa4), A(2 * r, 'gave-d', H.gaveD)];
  }

  /* ---------------- figures (static SVG, style of js/geom.js) ---------------- */
  var INK = '#2b3340', SOFT = '#f4faf9', WAT = '#d4e8f6', COL = '#13807a', GRY = '#e4e7ec';
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function n1(v) { return (+v).toFixed(1); }
  function tx(x, y, s, o) { o = o || {}; return '<text x="' + n1(x) + '" y="' + n1(y) + '" font-size="' + (o.size || 13) + '" text-anchor="' + (o.anchor || 'middle') + '" dominant-baseline="central" fill="' + (o.color || INK) + '"' + (o.it ? ' font-style="italic"' : '') + ' paint-order="stroke" stroke="#fff" stroke-width="3" stroke-linejoin="round">' + esc(s) + '</text>'; }
  function ln(x1, y1, x2, y2, o) { o = o || {}; return '<line x1="' + n1(x1) + '" y1="' + n1(y1) + '" x2="' + n1(x2) + '" y2="' + n1(y2) + '" stroke="' + (o.color || INK) + '" stroke-width="' + (o.w || 2) + '"' + (o.dash ? ' stroke-dasharray="5 4"' : '') + ' stroke-linecap="round"/>'; }
  function pth(d, o) { o = o || {}; return '<path d="' + d + '" fill="' + (o.fill || 'none') + '" stroke="' + (o.stroke || INK) + '" stroke-width="' + (o.w == null ? 2 : o.w) + '"' + (o.dash ? ' stroke-dasharray="5 4"' : '') + '/>'; }
  function ellF(cx, cy, rx, ry, o) { o = o || {}; return '<ellipse cx="' + n1(cx) + '" cy="' + n1(cy) + '" rx="' + n1(rx) + '" ry="' + n1(ry) + '" fill="' + (o.fill || 'none') + '" stroke="' + (o.stroke || INK) + '" stroke-width="' + (o.w || 2) + '"' + (o.dash ? ' stroke-dasharray="5 4"' : '') + '/>'; }
  function ellH(cx, cy, rx, ry, o) {   // front (lower) half solid, back (upper) half dashed
    o = o || {};
    return pth('M' + n1(cx - rx) + ' ' + n1(cy) + ' A' + n1(rx) + ' ' + n1(ry) + ' 0 0 0 ' + n1(cx + rx) + ' ' + n1(cy), { stroke: o.stroke, w: o.w }) +
      (o.noBack ? '' : pth('M' + n1(cx - rx) + ' ' + n1(cy) + ' A' + n1(rx) + ' ' + n1(ry) + ' 0 0 1 ' + n1(cx + rx) + ' ' + n1(cy), { stroke: o.stroke, w: 1.4, dash: !o.solidBack }));
  }
  function dimV(x, y1, y2, lab, left) { return ln(x, y1, x, y2, { w: 1.2 }) + ln(x - 4, y1, x + 4, y1, { w: 1.2 }) + ln(x - 4, y2, x + 4, y2, { w: 1.2 }) + (lab ? tx(x + (left ? -6 : 6), (y1 + y2) / 2, lab, { anchor: left ? 'end' : 'start' }) : ''); }
  function dimH(y, x1, x2, lab, below) { return ln(x1, y, x2, y, { w: 1.2 }) + ln(x1, y - 4, x1, y + 4, { w: 1.2 }) + ln(x2, y - 4, x2, y + 4, { w: 1.2 }) + (lab ? tx((x1 + x2) / 2, y + (below ? 12 : -11), lab) : ''); }
  function svg(w, h, body, aria, maxw) { return '<svg class="fig-svg" viewBox="0 0 ' + w + ' ' + h + '" width="100%" style="max-width:' + (maxw || w) + 'px" role="img" aria-label="' + esc(aria || 'figure') + '">' + body + '</svg>'; }
  function side(a, b) { return '<div style="display:flex;gap:8px;align-items:flex-end;flex-wrap:wrap">' + '<div style="flex:1 1 200px;min-width:0">' + a + '</div><div style="flex:1 1 200px;min-width:0">' + b + '</div></div>'; }
  function sphereG(cx, cy, R, o) { o = o || {}; return '<circle cx="' + n1(cx) + '" cy="' + n1(cy) + '" r="' + n1(R) + '" fill="' + (o.fill || SOFT) + '" stroke="' + (o.stroke || INK) + '" stroke-width="2"/>' + ellH(cx, cy, R, R * 0.18, { stroke: o.stroke }); }

  var FIG = {
    // sphere (radius R px) in a cylinder of the same radius whose height is hr × the sphere's diameter
    sphereCyl: function (o) {
      var cx = 105, R = 52, ry = 13, top = 22, hr = o.hr || 1, bot = top + 2 * R * hr, cy = bot - R, s = '';
      s += '<rect x="' + (cx - R) + '" y="' + top + '" width="' + 2 * R + '" height="' + n1(bot - top) + '" fill="' + (o.shade ? GRY : SOFT) + '"/>';
      s += pth('M' + (cx - R) + ' ' + n1(bot) + ' A' + R + ' ' + ry + ' 0 0 0 ' + (cx + R) + ' ' + n1(bot), { fill: o.shade ? GRY : SOFT, w: 0 });
      s += sphereG(cx, cy, R, { stroke: COL });
      s += ellF(cx, top, R, ry, { fill: o.shade ? GRY : SOFT }) + ln(cx - R, top, cx - R, bot) + ln(cx + R, top, cx + R, bot) + ellH(cx, bot, R, ry);
      s += ln(cx, cy, cx + R, cy, { w: 1.4 }) + '<circle cx="' + cx + '" cy="' + n1(cy) + '" r="2.4" fill="' + INK + '"/>' + tx(cx + R / 2, cy - 20, o.rLab || 'r', { it: !o.rLab });
      s += dimV(cx + R + 16, top, bot, o.hLab || '2r');
      return svg(230, Math.ceil(bot + ry + 8), s, 'sphere in a cylinder', 230);
    },
    hemiCyl: function (o) {
      var cx = 100, R = 56, ry = 13, top = 26, bot = top + R, s = '';
      s += '<rect x="' + (cx - R) + '" y="' + top + '" width="' + 2 * R + '" height="' + R + '" fill="' + GRY + '"/>';
      s += pth('M' + (cx - R) + ' ' + bot + ' A' + R + ' ' + R + ' 0 0 1 ' + (cx + R) + ' ' + bot + ' A' + R + ' ' + ry + ' 0 0 1 ' + (cx - R) + ' ' + bot, { fill: SOFT, stroke: COL });
      s += ellF(cx, top, R, ry) + ln(cx - R, top, cx - R, bot) + ln(cx + R, top, cx + R, bot) + ellH(cx, bot, R, ry);
      s += ln(cx, bot, cx + R, bot, { w: 1.4 }) + tx(cx + R / 2, bot - 10, 'r', { it: true }) + dimV(cx + R + 16, top, bot, 'r');
      return svg(220, bot + ry + 8, s, 'hemisphere in a cylinder', 220);
    },
    deodorant: function (o) {
      var cx = 90, R = 38, ry = 10, top = 58, bot = 200, s = '';
      s += '<rect x="' + (cx - R) + '" y="' + top + '" width="' + 2 * R + '" height="' + (bot - top) + '" fill="' + WAT + '"/>' + pth('M' + (cx - R) + ' ' + bot + ' A' + R + ' ' + ry + ' 0 0 0 ' + (cx + R) + ' ' + bot, { fill: WAT, w: 0 });
      s += '<circle cx="' + cx + '" cy="' + top + '" r="' + R + '" fill="' + SOFT + '" stroke="none"/>';
      s += pth('M' + (cx - R) + ' ' + top + ' A' + R + ' ' + R + ' 0 0 1 ' + (cx + R) + ' ' + top) + pth('M' + (cx - R) + ' ' + top + ' A' + R + ' ' + R + ' 0 0 0 ' + (cx + R) + ' ' + top, { dash: 1, w: 1.4 });
      s += ellH(cx, top, R, ry) + ln(cx - R, top, cx - R, bot) + ln(cx + R, top, cx + R, bot) + ellH(cx, bot, R, ry);
      s += tx(cx + R + 8, top - 30, 'ball', { anchor: 'start' }) + tx(cx, 150, 'liquid', { size: 12 });
      s += dimV(cx + R + 16, top, bot, o.hLab) + tx(cx, bot + ry + 12, o.rLab);
      return svg(250, bot + ry + 24, s, 'roll-on deodorant', 250);
    },
    thermo: function (o) {
      var cx = 60, by = 212, BR = 30, w = 7, sTop = 50, sBot = by - Math.sqrt(BR * BR - w * w), s = '';
      s += pth('M' + (cx - w) + ' ' + n1(sBot) + ' L' + (cx - w) + ' ' + sTop + ' A' + w + ' ' + w + ' 0 0 1 ' + (cx + w) + ' ' + sTop + ' L' + (cx + w) + ' ' + n1(sBot), { fill: SOFT });
      s += ellH(cx, sTop, w, 2.4, { w: 1.2 });
      s += sphereG(cx, by, BR);
      s += ln(cx + w, sTop - 4, 92, 26, { color: '#8a93a3', w: 1 }) + tx(95, 20, 'cap: inside radius', { anchor: 'start', size: 12 }) + tx(95, 35, o.capLab, { anchor: 'start', size: 12 });
      s += dimV(cx + 22, sTop, sBot, o.stemLab);
      s += ln(cx + BR - 4, by + 12, 104, by + 20, { color: '#8a93a3', w: 1 }) + tx(107, by + 14, 'bulb diameter', { anchor: 'start', size: 12 }) + tx(107, by + 29, o.bulbLab, { anchor: 'start', size: 12 });
      s += tx(205, 120, 'not to scale', { it: true, size: 12 });
      return svg(260, 262, s, 'model thermometer', 260);
    },
    capsule: function (o) {
      var cy = 92, R = 42, xL = 116, xR = 222, s = '';
      s += pth('M' + xL + ' ' + (cy - R) + ' L' + xR + ' ' + (cy - R) + ' A' + R + ' ' + R + ' 0 0 1 ' + xR + ' ' + (cy + R) + ' L' + xL + ' ' + (cy + R) + ' A' + R + ' ' + R + ' 0 0 1 ' + xL + ' ' + (cy - R), { fill: SOFT });
      [xL, xR].forEach(function (x) { s += ellF(x, cy, 11, R, { dash: 1, w: 1.3, stroke: o.seamColor || '#8a93a3' }); });
      s += dimH(cy - R - 16, xL - R, xR + R, o.LLab) + dimV(xL - R - 14, cy - R, cy + R, o.dLab, true);
      if (o.cap) s += tx((xL + xR) / 2, cy + R + 16, o.cap, { size: 12, color: o.seamColor || '#6a7182' });
      return svg(280, cy + R + (o.cap ? 30 : 12), s, o.aria || 'cylinder with hemispherical ends', 300);
    },
    silo: function (o) {
      var cx = 100, R = 50, ry = 12, top = 84, bot = 206, s = '';
      s += pth('M' + (cx - R) + ' ' + bot + ' L' + (cx - R) + ' ' + top + ' A' + R + ' ' + R + ' 0 0 1 ' + (cx + R) + ' ' + top + ' L' + (cx + R) + ' ' + bot + ' A' + R + ' ' + ry + ' 0 0 1 ' + (cx - R) + ' ' + bot, { fill: SOFT });
      s += ellH(cx, top, R, ry, { w: 1.5 }) + ellH(cx, bot, R, ry, { noBack: true });
      s += ln(cx - R - 22, bot + ry, cx + R + 22, bot + ry, { color: '#8a7a5c', w: 3 }) + tx(cx, bot + ry + 12, 'concrete pad', { size: 11, color: '#6a7182' });
      s += dimV(cx + R + 16, top, bot, o.hLab) + dimH(top, cx - R, cx + R, o.dLab);
      return svg(250, bot + ry + 22, s, 'grain silo', 250);
    },
    earring: function (o) {
      var cx = 95, R = 50, y0 = 118, apex = y0 - 2 * R, s = '';
      s += pth('M' + (cx - R) + ' ' + y0 + ' L' + cx + ' ' + apex + ' L' + (cx + R) + ' ' + y0 + ' A' + R + ' ' + R + ' 0 0 1 ' + (cx - R) + ' ' + y0, { fill: SOFT });
      s += ellH(cx, y0, R, 11) + ln(cx, apex, cx, y0, { dash: 1, w: 1.2 });
      s += dimV(cx + R + 16, apex, y0, o.hLab) + dimH(y0 + R + 14, cx - R, cx + R, o.dLab, true);
      return svg(240, y0 + R + 36, s, 'earring: cone on a hemisphere', 240);
    },
    jar: function (o) {   // jar with water; a ball beside it (o.inside: ball resting on the bottom)
      var cx = 130, R = 56, ry = 13, top = 30, bot = 196, wy = bot - (bot - top) * (o.wf || 0.55), rb = R * (o.br || 0.5), s = '';
      s += '<rect x="' + (cx - R) + '" y="' + n1(wy) + '" width="' + 2 * R + '" height="' + n1(bot - wy) + '" fill="' + WAT + '"/>' + pth('M' + (cx - R) + ' ' + bot + ' A' + R + ' ' + ry + ' 0 0 0 ' + (cx + R) + ' ' + bot, { fill: WAT, w: 0 });
      s += ellF(cx, wy, R, ry, { fill: WAT, stroke: '#7fa8c7', w: 1.2 });
      if (o.inside) s += sphereG(cx, bot - rb, rb, { fill: '#cfd5dd' });
      s += ellF(cx, top, R, ry) + ln(cx - R, top, cx - R, bot) + ln(cx + R, top, cx + R, bot) + ellH(cx, bot, R, ry);
      s += dimV(cx - R - 12, wy, bot, o.depthLab, true) + tx(cx, top - ry - 9, o.DLab);
      if (!o.inside) s += sphereG(cx + R + 30 + rb, 70, rb, { fill: '#cfd5dd' }) + tx(cx + R + 30 + rb, 70 + rb + 14, o.ballLab, { size: 12 });
      else s += tx(cx + R + 8, bot - rb, o.ballLab, { anchor: 'start', size: 12 });
      var W = o.inside ? 315 : Math.ceil(cx + R + 40 + 2 * rb); return svg(W, bot + ry + 8, s, 'cylindrical jar of water', W);
    },
    twoSpheres: function (o) {   // o.a = {R, f, lab1, lab2}, o.b = {...}
      var s = '', cx = 60;
      [o.a, o.b].forEach(function (q, i) {
        var R = q.R, cy = 110 - (i ? 0 : 0), x = i ? 175 : 60; cx = x;
        var lo = 0, hi = 2; for (var k = 0; k < 40; k++) { var m = (lo + hi) / 2; if (m * m * (3 - m) / 4 < q.f) lo = m; else hi = m; }
        var hgt = lo * R, wy = cy + R - hgt, hw = Math.sqrt(Math.max(0, R * R - (wy - cy) * (wy - cy)));
        s += '<circle cx="' + x + '" cy="' + cy + '" r="' + R + '" fill="' + SOFT + '" stroke="none"/>';
        s += pth('M' + n1(x - hw) + ' ' + n1(wy) + ' A' + R + ' ' + R + ' 0 ' + (wy < cy ? 1 : 0) + ' 0 ' + n1(x + hw) + ' ' + n1(wy) + ' Z', { fill: WAT, w: 0 });
        s += '<circle cx="' + x + '" cy="' + cy + '" r="' + R + '" fill="none" stroke="' + INK + '" stroke-width="2"/>';
        s += tx(x, cy + R + 14, q.lab1, { size: 12 }) + tx(x, cy + R + 29, q.lab2, { size: 12 });
      });
      return svg(250, 212, s, 'two spheres partly full of water', 250);
    },
    cubeBall: function (o) {
      var A = [40, 160], B = [160, 160], C = [160, 70], Dd = [40, 70], dx = 46, dy = -34, s = '';
      var Ap = [A[0] + dx, A[1] + dy], Bp = [B[0] + dx, B[1] + dy], Cp = [C[0] + dx, C[1] + dy], Dp = [Dd[0] + dx, Dd[1] + dy];
      s += sphereG(100 + dx / 2, 115 + dy / 2, 55, { stroke: COL });
      s += '<polygon points="' + [A, B, C, Dd].map(function (p) { return p.join(','); }).join(' ') + '" fill="none" stroke="' + INK + '" stroke-width="2"/>';
      s += ln(B[0], B[1], Bp[0], Bp[1]) + ln(C[0], C[1], Cp[0], Cp[1]) + ln(Dd[0], Dd[1], Dp[0], Dp[1]) + ln(Cp[0], Cp[1], Dp[0], Dp[1]) + ln(Bp[0], Bp[1], Cp[0], Cp[1]);
      s += ln(A[0], A[1], Ap[0], Ap[1], { dash: 1, w: 1.3 }) + ln(Ap[0], Ap[1], Bp[0], Bp[1], { dash: 1, w: 1.3 }) + ln(Ap[0], Ap[1], Dp[0], Dp[1], { dash: 1, w: 1.3 });
      if (o.sLab) s += tx(100, 176, o.sLab);
      return svg(225, 190, s, 'sphere in a cube', 225);
    },
    carved: function (o) {
      var A = [30, 170], B = [170, 170], C = [170, 70], Dd = [30, 70], dx = 56, dy = -40, s = '';
      var Cp = [C[0] + dx, C[1] + dy], Dp = [Dd[0] + dx, Dd[1] + dy], Bp = [B[0] + dx, B[1] + dy];
      s += '<polygon points="' + [A, B, C, Dd].map(function (p) { return p.join(','); }).join(' ') + '" fill="' + SOFT + '" stroke="' + INK + '" stroke-width="2"/>';
      s += '<polygon points="' + [Dd, C, Cp, Dp].map(function (p) { return p.join(','); }).join(' ') + '" fill="#eaf2f0" stroke="' + INK + '" stroke-width="2"/>';
      s += '<polygon points="' + [B, Bp, Cp, C].map(function (p) { return p.join(','); }).join(' ') + '" fill="#e2ebe9" stroke="' + INK + '" stroke-width="2"/>';
      var ex0 = 100 + dx / 2, ey = 70 + dy / 2, rx = 140 * o.k, ry = rx * 0.3;
      s += ellF(ex0, ey, rx, ry, { fill: '#cbd9d6' }) + pth('M' + n1(ex0 - rx) + ' ' + n1(ey) + ' A' + n1(rx) + ' ' + n1(rx * 0.95) + ' 0 0 0 ' + n1(ex0 + rx) + ' ' + n1(ey), { dash: 1, w: 1.4, stroke: COL });
      s += ln(ex0, ey, ex0 + rx, ey, { w: 1.3 }) + tx(ex0 + rx * 0.45, ey + ry + 12, o.rLab, { size: 12 });
      s += tx(100, 186, o.sLab);
      return svg(240, 200, s, 'cube with a hemispherical bowl carved in', 240);
    }
  };
  function solid(kind, o) { o.width = o.width || 200; return HW.solid(kind, o); }

  /* ---------------- sphere / hemisphere part makers ---------------- */
  function sphereSA(prompt, r, giv, u, dp, text) {
    var x = 4 * PI * r * r;
    return nearP(prompt, x, dp, u.a, saAlts(r, giv),
      (giv === 'd' ? t('r=' + D(2 * r) + '\\div 2=' + D(r) + u.tl) + '<br>' : '') + t('SA=4\\pi r^2=4\\pi(' + D(r) + ')^2=' + piT(4 * r * r) + '\\approx ' + D(RT(x, dp), dp) + u.ta),
      [giv === 'd' ? 'Halve the diameter to get the radius, then use ' + t('SA=4\\pi r^2') + '.' : 'Use ' + t('SA=4\\pi r^2') + '.', 'Square the radius first, then multiply by ' + t('4\\pi') + '.'], text);
  }
  function sphereV(prompt, r, giv, u, dp, text) {
    var x = 4 / 3 * PI * r * r * r;
    return nearP(prompt, x, dp, u.v, vAlts(r, giv),
      (giv === 'd' ? t('r=' + D(2 * r) + '\\div 2=' + D(r) + u.tl) + '<br>' : '') + t('V=\\frac{4}{3}\\pi r^3=\\frac{4}{3}\\pi(' + D(r) + ')^3=' + piT(4 / 3 * r * r * r) + '\\approx ' + D(RT(x, dp), dp) + u.tv),
      [giv === 'd' ? 'Halve the diameter first, then use ' + t('V=\\frac{4}{3}\\pi r^3') + '.' : 'Use ' + t('V=\\frac{4}{3}\\pi r^3') + '.', 'Cube the radius, multiply by ' + t('\\pi') + ', then by ' + t('\\frac{4}{3}') + '.'], text);
  }
  function hemiV(prompt, r, giv, u, dp, text) {
    var x = 2 / 3 * PI * r * r * r;
    return nearP(prompt, x, dp, u.v, hvAlts(r, giv),
      (giv === 'd' ? t('r=' + D(2 * r) + '\\div 2=' + D(r) + u.tl) + '<br>' : '') + 'Half of a sphere: ' + t('V=\\frac{1}{2}\\cdot\\frac{4}{3}\\pi r^3=\\frac{2}{3}\\pi r^3') + '<br>' + t('V=\\frac{2}{3}\\pi(' + D(r) + ')^3=' + piT(2 / 3 * r * r * r) + '\\approx ' + D(RT(x, dp), dp) + u.tv),
      ['A hemisphere is half a sphere: ' + t('V=\\frac{2}{3}\\pi r^3') + '.'], text);
  }
  function hemiSA(prompt, r, giv, u, dp, base, why, text) {
    var c = base ? 3 : 2, x = c * PI * r * r;
    return nearP(prompt, x, dp, u.a, hsAlts(r, giv, base),
      (giv === 'd' ? t('r=' + D(2 * r) + '\\div 2=' + D(r) + u.tl) + '<br>' : '') + (why ? why + '<br>' : '') +
      (base ? t('SA=\\underbrace{2\\pi r^2}_{\\text{curved}}+\\underbrace{\\pi r^2}_{\\text{base}}=3\\pi r^2') : t('SA=2\\pi r^2') + ' (curved surface only)') + '<br>' + t('SA=' + c + '\\pi(' + D(r) + ')^2=' + piT(c * r * r) + '\\approx ' + D(RT(x, dp), dp) + u.ta),
      [base ? 'Curved surface ' + t('2\\pi r^2') + ' plus the flat base ' + t('\\pi r^2') + '.' : 'Only the curved surface counts here: ' + t('2\\pi r^2') + '.'], text);
  }
  function rFromV(prompt, V, hemi, u, dp, text, o) {
    o = o || {};
    var c = hemi ? 2 / 3 : 4 / 3, r3 = V / (c * PI), r = Math.cbrt(r3);
    return nearP(prompt, r, dp, u.l, rvAlts(V, hemi),
      (o.pre || '') + t(D(V) + '=\\frac{' + (hemi ? 2 : 4) + '}{3}\\pi r^3') + '<br>' + t('r^3=\\frac{3(' + D(V) + ')}{' + (hemi ? 2 : 4) + '\\pi}=' + D(RT(r3, 2), 2)) + '<br>' + t('r=\\sqrt[3]{' + D(RT(r3, 2), 2) + '}\\approx ' + D(RT(r, dp), dp) + u.tl),
      ['Set ' + t(D(V) + '=\\frac{' + (hemi ? 2 : 4) + '}{3}\\pi r^3') + ' and isolate ' + t('r^3') + '.', 'Then take the cube root.'], text);
  }
  function rFromSA(prompt, S, u, dp, text) {
    var r2 = S / (4 * PI), r = Math.sqrt(r2);
    return nearP(prompt, r, dp, u.l, rsAlts(S),
      t('SA=4\\pi r^2\\ \\Rightarrow\\ r=\\sqrt{\\frac{SA}{4\\pi}}') + '<br>' + t('r^2=\\frac{' + D(S) + '}{4\\pi}=' + D(RT(r2, 4), 4)) + '<br>' + t('r=\\sqrt{' + D(RT(r2, 4), 4) + '}\\approx ' + D(RT(r, dp), dp) + u.tl) + ' (a radius can’t be negative).',
      ['Divide by ' + t('4\\pi') + ', then take the square root.'], text);
  }
  function vFromSA(prompt, S, u, dp, text) {
    var r = Math.sqrt(S / (4 * PI)), V = 4 / 3 * PI * r * r * r, rr = RT(r, 1);
    var alts = [A(4 / 3 * PI * rr * rr * rr, 'early-round', H.early), A(S / (4 * PI), 'gave-r', 'That’s ' + t('r^2') + ', not the volume. Take the square root to get ' + t('r') + ', then use ' + t('V=\\frac{4}{3}\\pi r^3') + '.'),
      A(r, 'gave-r', 'That’s the radius. Now use it in ' + t('V=\\frac{4}{3}\\pi r^3') + '.'), A(4 / 3 * PI * Math.pow(S / (4 * PI), 3), 'no-sqrt', H.noSqrt), A(4 / 3 * PI * Math.pow(Math.sqrt(S / PI), 3), 'sa-no-4', H.sa4),
      A(PI * r * r * r, 'v-no-43', H.no43), A(4 / 3 * PI * Math.pow(Math.cbrt(S / (4 * PI)), 3), 'cbrt-for-sqrt', H.cbrtSqrt)];
    return nearP(prompt, V, dp, u.v, alts,
      'First the radius: ' + t('r^2=\\frac{' + D(S) + '}{4\\pi}=' + D(RT(r * r, 4), 4) + ',\\ r=' + D(RT(r, 4), 4) + u.tl) + '<br>Then the volume (unrounded ' + t('r') + '): ' + t('V=\\frac{4}{3}\\pi r^3=\\frac{4}{3}\\pi(' + D(RT(r, 4), 4) + ')^3\\approx ' + D(RT(V, dp), dp) + u.tv),
      ['Work backwards from ' + t('SA=4\\pi r^2') + ' to find ' + t('r') + ' first.', 'Then substitute the unrounded ' + t('r') + ' into ' + t('V=\\frac{4}{3}\\pi r^3') + '.'], text);
  }

  /* ---------------- shared data for the extra practice ---------------- */
  var EP6 = (function () {   // sphere radius a, hemisphere radius b: percentage difference a whole number
    var out = [];
    for (var a = 4; a <= 15; a++) for (var b = 4; b <= 15; b++) {
      var s = 4 * a * a, h = 3 * b * b; if (s === h) continue; var lo = Math.min(s, h), pct = Math.abs(s - h) / lo * 100;
      if (Math.abs(pct - Math.round(pct)) < 1e-9 && pct >= 2 && pct <= 30) out.push([a, b]);
    }
    return out;
  })();

  HW.addCodes({
    'd-as-r': 'Used the diameter as the radius', 'halved-r': 'Halved a radius (treated it as a diameter)', 'gave-d': 'Gave the diameter instead of the radius', 'gave-r': 'Gave the radius (or r²) instead of what was asked',
    'sa-circle': 'Used πr² (one circle) for a sphere’s surface', 'sa-r3': 'Cubed r in the surface-area formula', 'sa-half': 'Used half the sphere’s surface (2πr²)', 'v-for-sa': 'Gave the volume instead of the surface area',
    'sa-for-v': 'Gave the surface area instead of the volume', 'v-no-43': 'Forgot the 4/3 (or 2/3) in the volume', 'v-no-3': 'Multiplied by 4 (or 2) but didn’t divide by 3', 'v-r2': 'Squared r instead of cubing it (volume)',
    'v-43-flip': 'Used 3/4 instead of 4/3', 'hemi-whole': 'Hemisphere: used the whole sphere (or mixed up the halves)', 'hemi-half-r': 'Hemisphere: halved the radius instead of the volume',
    'hemi-no-base': 'Hemisphere: left out the flat base', 'hemi-base': 'Hemisphere: counted a flat base the wording excludes', 'no-cbrt': 'Solving for r: forgot the cube root', 'sqrt-for-cbrt': 'Solving for r: square root instead of cube root',
    'no-sqrt': 'Solving for r: forgot the square root', 'cbrt-for-sqrt': 'Solving for r: cube root instead of square root', 'sa-no-4': 'Solving for r: divided by π instead of 4π', 'early-round': 'Rounded an intermediate value too early',
    'joint-counted': 'Counted a hidden joining circle (or a base that isn’t there)', 'part-missing': 'Left a piece of the composite solid out', 'unit-conv': 'Area/volume unit conversion not squared/cubed', 'no-convert': 'Didn’t convert units',
    'sub-sphere': 'Subtracted a whole sphere instead of a hemisphere', 'no-subtract': 'Didn’t subtract the part that isn’t there', 'added': 'Added a part that should be subtracted', 'full-length': 'Used the total length as the cylinder’s length',
    'no-pct': 'Didn’t apply the percentage', 'pct-flip': 'Used the other percentage', 'pct-ball': 'Took the percentage of the wrong volume', 'no-zipper': 'Left out the zipper cost', 'zipper-once': 'Counted the zipper only once',
    'cost-rate': 'Fabric rate not per 100 cm²', 'cents-dollars': 'Cents and dollars mixed up', 'rise-only': 'Gave the rise instead of the new depth', 'jar-d': 'Used the jar’s diameter as its radius', 'ratio-flip': 'Ratio upside down',
    'cube-sa': 'Gave the cube’s surface area', 'h-for-s': 'Used the height instead of the slant height', 'cone-no-third': 'Forgot the 1/3 in the cone volume', 'h-r': 'Used h = r for the cylinder that holds the sphere',
    'tin-as-sphere': 'Used the sphere formula for the cylinder', 'third': 'Used the leftover third instead of two thirds', 'full': 'Used the whole cylinder', 'cap-length': 'Wrong cylinder length for the capsule',
    'one-circle': 'Counted only one of the two circles', 'factor-2': 'Thought doubling r doubles the volume/area', 'factor-sq': 'Squared instead of cubed (or vice versa) for the scale factor', 'round-up': 'Rounded up a “whole number that fits”',
    'pct-base': 'Percentage of the wrong base', 'pct-diff': 'Gave the difference instead of the percentage', 'pi-symbol': 'Exact answer: π not kept as a symbol', 'pi-decimal': 'Gave a decimal for an exact answer', 'pi-coef': 'Rounded the coefficient of π',
    'hole-kept': 'Didn’t remove the circle cut out of the face', 'wording-base': 'Counted a base the wording excludes', 'scale-cube': 'Volume factor not cubed', 'scale-sq': 'Area factor not squared'
  });

  /* ======================================================================================== */
  HW.defineLesson({
    id: 'u10l5', unit: 10, num: '5', title: 'Surface Area and Volume of Spheres and Hemispheres', outcome: 'M3',
    blurb: 'A sphere fills two thirds of the cylinder that just holds it: SA = 4πr², V = 4/3 πr³. Hemispheres are half a sphere — and the wording decides whether the flat base counts.',
    questions: [
      /* ---------- Q1 ---------- */
      { num: '1', section: 'Spheres and hemispheres', stem: 'Calculate the following to the nearest tenth.', shared: function (r) {
          return { moon: r.pick(['Xylo', 'Zorb', 'Quill', 'Vantor', 'Myrr']), dm: r.pick([10000, 6000, 8000, 12000, 7000, 9000, 5000, 4000]), rh: r.pick([3.6, 2.4, 4.2, 4.8, 5.4, 6.2, 3.2]) };
        }, parts: [
        { id: '1a', sub: 'a', level: 'EMG', make: function (r) {
          var o = r.pick([['basketball', [24, 22, 23, 25]], ['volleyball', [20, 21, 22]], ['beach ball', [30, 36, 40, 45]], ['soccer ball', [22, 21, 23]]]), d = r.pick(o[1]), u = U('cm');
          return sphereSA('the surface area of a ' + o[0] + ' with a diameter of ' + t(d) + ' cm' + solid('sphere', { d: 'd = ' + d + ' cm', width: 230 }), d / 2, 'd', u, 1, 'SA sphere d=' + d);
        } },
        { id: '1b', sub: 'b', level: 'BEG', make: function (r) {
          var rr = r.pick([10, 8, 9, 11, 12, 15, 7]), u = U('in');
          return sphereV('the volume of a decorative globe with a radius of ' + t(rr) + ' in' + solid('sphere', { r: 'r = ' + rr + ' in', width: 230 }), rr, 'r', u, 1, 'V sphere r=' + rr);
        } },
        { id: '1c', sub: 'c i', level: 'EMG', make: function (r, sh) { return moonP(sh, 'V'); } },
        { id: '1c2', sub: 'c ii', level: 'EMG', make: function (r, sh) { return moonP(sh, 'SA'); } },
        { id: '1d', sub: 'd i', level: 'BEG', make: function (r, sh) {
          return hemiV('the <b>volume</b> of a hemisphere with a radius of ' + t(D(sh.rh)) + ' m' + solid('hemisphere', { r: 'r = ' + D(sh.rh) + ' m', width: 230 }), sh.rh, 'r', U('m'), 1, 'V hemisphere r=' + sh.rh);
        } },
        { id: '1d2', sub: 'd ii', level: 'EMG', make: function (r, sh) {
          return hemiSA('the <b>surface area</b> of a hemisphere with a radius of ' + t(D(sh.rh)) + ' m' + solid('hemisphere', { r: 'r = ' + D(sh.rh) + ' m', width: 230 }), sh.rh, 'r', U('m'), 1, true, 'Nothing in the question excludes the flat base, so it is counted.', 'SA hemisphere r=' + sh.rh);
        } }] },
      /* ---------- Q2 ---------- */
      { num: '2', stem: function (sh) { return 'The diagram shows a roll-on deodorant: a cylindrical container of radius ' + t(D(sh.r)) + ' cm and height ' + t(D(sh.h)) + ' cm, into which a ball of the same radius is set. The centre of the ball is level with the top of the container, so half of the ball is inside the container. Liquid deodorant completely fills the space below the ball.' + FIG.deodorant({ hLab: 'h = ' + D(sh.h) + ' cm', rLab: 'r = ' + D(sh.r) + ' cm' }); },
        shared: function (r) { return { r: r.pick([2.5, 2, 3, 2.2, 2.8, 2.4]), h: r.pick([8, 7, 9, 10, 7.5, 8.5]) }; }, parts: [
        { id: '2', level: 'PRG', make: function (r, sh) {
          var R = sh.r, h = sh.h, cyl = PI * R * R * h, hem = 2 / 3 * PI * R * R * R, x = cyl - hem;
          return nearP('Calculate, to the nearest mL, the volume of liquid deodorant in the container. (' + t('1\\text{ cm}^3=1\\text{ mL}') + ')', x, 0, 'mL', [
            A(cyl - 2 * hem, 'sub-sphere', 'Only <b>half</b> of the ball is inside the container. Subtract a hemisphere, ' + t('\\frac{2}{3}\\pi r^3') + ', not a whole sphere.'),
            A(cyl, 'no-subtract', 'That’s the whole cylinder. The lower half of the ball takes up some of that space — subtract it.'),
            A(cyl + hem, 'added', 'The ball takes space away from the liquid. <b>Subtract</b> the hemisphere.'),
            A(hem, 'part-missing', 'That’s only the half-ball. The liquid is the cylinder <b>minus</b> the half-ball.')],
            t('V_{\\text{cyl}}=\\pi r^2h=\\pi(' + D(R) + ')^2(' + D(h) + ')=' + piT(R * R * h)) + '<br>' + t('V_{\\text{hemi}}=\\frac{2}{3}\\pi(' + D(R) + ')^3=' + piT(2 / 3 * R * R * R)) + '<br>' + t('V_{\\text{liquid}}=' + piT(R * R * h) + '-' + piT(2 / 3 * R * R * R) + '\\approx ' + D(RT(x, 0), 0)) + ' mL',
            ['The liquid fills the cylinder except where the lower half of the ball sits.', 'Liquid = cylinder − hemisphere.'], 'deodorant r=' + R + ' h=' + h);
        } }] },
      /* ---------- Q3 ---------- */
      { num: '3', stem: function (sh) { return sh.hemi ? 'A hemisphere of radius ' + t('r') + ' has volume ' + t('V=\\frac{2}{3}\\pi r^3') + '.' : 'A sphere of radius ' + t('r') + ' has volume ' + t('V=\\frac{4}{3}\\pi r^3') + '.'; },
        shared: function (r) { return { hemi: r.chance(0.3) }; }, parts: [
        { id: '3a', sub: 'a i', level: 'PRG', make: function (r, sh) { return solveR(sh.hemi, 'radical'); } },
        { id: '3a2', sub: 'a ii', level: 'EMG', make: function (r, sh) { return solveR(sh.hemi, 'power'); } },
        { id: '3b', sub: 'b', level: 'PRG', make: function (r) {
          var V = r.pick([65000, 50000, 40000, 72000, 30000, 85000, 58000]);
          return rFromV('The volume of a <b>spherical</b> beach ball is ' + t(F(V)) + ' cm³. Calculate its radius to the nearest tenth of a centimetre.', V, false, U('cm'), 1, 'r from V=' + V);
        } }] },
      /* ---------- Q4 ---------- */
      { num: '4', stem: function (sh) { return 'A model mercury thermometer consists of a spherical bulb, topped by a thin cylindrical stem, topped by a small hemispherical cap. The stem has the same inside radius as the cap, ' + t(D(sh.r)) + ' cm. The stem is ' + t(D(sh.L)) + ' cm long and the bulb’s diameter is ' + t(D(sh.d)) + ' cm. Answer to the nearest hundredth.' + FIG.thermo({ capLab: '= ' + D(sh.r) + ' cm', stemLab: D(sh.L) + ' cm', bulbLab: '= ' + D(sh.d) + ' cm' }); },
        shared: function (r) {
          for (var i = 0; i < 100; i++) { var d = r.pick([0.42, 0.44, 0.46, 0.48, 0.5, 0.4]), rr = r.pick([0.18, 0.15, 0.16, 0.17]), L = r.pick([11.2, 10.5, 12, 11.6, 9.8, 10.8]); if (rr <= d / 2 - 0.02) return { d: d, r: rr, L: L }; }
          return { d: 0.42, r: 0.18, L: 11.2 };
        }, parts: [
        { id: '4a', sub: 'a', level: 'ADV', make: function (r, sh) {
          var R = sh.d / 2, q = sh.r, L = sh.L, bulb = 4 / 3 * PI * R * R * R, stem = PI * q * q * L, cap = 2 / 3 * PI * q * q * q, x = bulb + stem + cap;
          return nearP('Determine the volume of the space inside the thermometer.', x, 2, 'cm³', [
            A(32 / 3 * PI * R * R * R + stem + cap, 'd-as-r', 'Check the bulb: ' + t(D(sh.d) + '\\text{ cm}') + ' is its <b>diameter</b>. Halve it first.'),
            A(bulb + stem, 'part-missing', 'Don’t forget the small hemispherical cap on top: ' + t('\\frac{2}{3}\\pi r^3') + '.'),
            A(bulb + stem + 2 * cap, 'hemi-whole', 'The cap is a <b>hemisphere</b> — half a sphere, ' + t('\\frac{2}{3}\\pi r^3') + '.'),
            A(stem + cap, 'part-missing', 'Include the spherical bulb too: ' + t('\\frac{4}{3}\\pi R^3') + '.'),
            A(bulb + cap, 'part-missing', 'Include the cylindrical stem: ' + t('\\pi r^2h') + '.')],
            'Bulb radius ' + t('R=' + D(sh.d) + '\\div 2=' + D(R)) + ' cm; stem and cap radius ' + t('r=' + D(q)) + ' cm; stem length ' + t(D(L)) + ' cm.<br>' +
            t('V=\\underbrace{\\tfrac{4}{3}\\pi(' + D(R) + ')^3}_{\\text{bulb}}+\\underbrace{\\pi(' + D(q) + ')^2(' + D(L) + ')}_{\\text{stem}}+\\underbrace{\\tfrac{2}{3}\\pi(' + D(q) + ')^3}_{\\text{cap}}') + '<br>' + t('=' + D(RT(bulb, 4), 4) + '+' + D(RT(stem, 4), 4) + '+' + D(RT(cap, 4), 4) + '\\approx ' + D(RT(x, 2), 2)) + ' cm³',
            ['Add the three pieces: a sphere, a cylinder and a hemisphere.', 'The bulb’s ' + t(D(sh.d)) + ' cm is a diameter.'], 'thermometer volume');
        } },
        { id: '4b', sub: 'b', level: 'MAS', make: function (r, sh) {
          var R = sh.d / 2, q = sh.r, L = sh.L, bulb = 4 * PI * R * R - PI * q * q, stem = 2 * PI * q * L, cap = 2 * PI * q * q, x = bulb + stem + cap;
          return nearP('The thermometer is made of glass. Determine the surface area of glass required to build it. Assume the missing glass where the stem meets the bulb equals the area of the base of the cylindrical stem.', x, 2, 'cm²', [
            A(x + PI * q * q, 'joint-counted', 'Check the joints: the bulb loses a circle where the stem joins it (subtract ' + t('\\pi r^2') + '), and the cap’s flat face is the joint with the stem, so the cap is <b>curved surface only</b>.'),
            A(x + 2 * PI * q * q, 'joint-counted', 'The stem is open at both ends (they join the bulb and the cap), so it has no circular ends — only its curved side, ' + t('2\\pi rh') + '.'),
            A(x + 3 * PI * q * q, 'joint-counted', 'No flat circles belong in this total: the stem’s ends and the cap’s base are all joints. Subtract the hole in the bulb, too.'),
            A(16 * PI * R * R - PI * q * q + stem + cap, 'd-as-r', 'The bulb’s ' + t(D(sh.d)) + ' cm is a <b>diameter</b>. Halve it first.'),
            A(x - cap, 'part-missing', 'Include the cap’s curved surface, ' + t('2\\pi r^2') + '.'),
            A(x - stem + PI * q * q * L, 'part-missing', 'The stem’s glass is its curved side, ' + t('2\\pi rh') + ' — not its volume.')],
            'The bulb loses a circle of radius ' + t(D(q)) + ' cm where the stem joins it, and the cap’s flat face is that same joint, so the cap contributes its curved surface only.<br>' +
            t('SA=\\underbrace{4\\pi(' + D(R) + ')^2-\\pi(' + D(q) + ')^2}_{\\text{bulb less the hole}}+\\underbrace{2\\pi(' + D(q) + ')(' + D(L) + ')}_{\\text{stem, curved}}+\\underbrace{2\\pi(' + D(q) + ')^2}_{\\text{cap, curved}}') + '<br>' + t('\\approx ' + D(RT(bulb, 4), 4) + '+' + D(RT(stem, 4), 4) + '+' + D(RT(cap, 4), 4) + '\\approx ' + D(RT(x, 2), 2)) + ' cm²',
            ['Bulb: a sphere minus the circle where the stem attaches. Stem: curved side only. Cap: curved half of a sphere only.', 'No flat circle is part of the glass surface.'], 'thermometer surface area');
        } }] },
      /* ---------- Q5 ---------- */
      { num: '5', stem: function (sh) { return 'Priya designs a pencil case in the shape of a hemisphere and plans to sew ' + t(sh.N) + ' of them. The fabric costs ' + sh.c + ' cents per hundred square centimetres, and each zipper costs ' + sh.z + ' cents. Each case uses exactly one zipper, and adding the zipper does not change the amount of fabric needed. The diameter of each case is ' + t(sh.d) + ' cm.' + solid('hemisphere', { d: 'd = ' + sh.d + ' cm', width: 230 }); },
        shared: function (r) {
          for (var i = 0; i < 200; i++) {
            var o = { d: r.pick([18, 16, 20, 14, 22]), N: r.pick([400, 300, 500, 250]), c: r.pick([5, 4, 6]), z: r.pick([6, 8, 5, 7]) };
            var sa = 3 * PI * Math.pow(o.d / 2, 2), a = RT(o.N * (sa / 100 * o.c / 100 + o.z / 100), 2), b = RT(o.N * (RT(sa, 1) / 100 * o.c / 100 + o.z / 100), 2);
            if (Math.abs(a - b) < 1e-9) return o;
          }
          return { d: 18, N: 400, c: 5, z: 6 };
        }, parts: [
        { id: '5a', sub: 'a', level: 'PRG', make: function (r, sh) { return hemiSA('Calculate the surface area of each case, to one decimal place.', sh.d / 2, 'd', U('cm'), 1, true, 'Nothing excludes the flat face, so it is fabric too.', 'pencil case SA d=' + sh.d); } },
        { id: '5b', sub: 'b', level: 'ADV', make: function (r, sh) {
          var rr = sh.d / 2, sa = 3 * PI * rr * rr, fab = sa / 100 * sh.c / 100, z = sh.z / 100, x = sh.N * (fab + z);
          return nearP('Determine the total cost of making all ' + t(sh.N) + ' pencil cases.', x, 2, '', [
            A(sh.N * fab, 'no-zipper', 'Don’t forget the zipper on each case: add ' + t('\\$' + z.toFixed(2)) + ' per case.'),
            A(sh.N * fab + z, 'zipper-once', 'Every case has its own zipper — add the zipper cost to <b>each</b> case before multiplying by ' + t(sh.N) + '.'),
            A(sh.N * (2 * PI * rr * rr / 100 * sh.c / 100 + z), 'hemi-no-base', 'Use the fabric for the whole case, flat face included: ' + t('SA=3\\pi r^2') + '.'),
            A(sh.N * (sa * sh.c / 100 + z), 'cost-rate', 'The fabric costs ' + sh.c + ' cents per <b>hundred</b> square centimetres. Divide the area by ' + t('100') + ' first.'),
            A(x * 100, 'cents-dollars', 'Give the answer in dollars: ' + t('100') + ' cents ' + t('=\\$1') + '.'),
            A(sh.N * (12 * PI * rr * rr / 100 * sh.c / 100 + z), 'd-as-r', H.dr)],
            'Fabric per case: ' + t('\\frac{' + D(RT(sa, 1), 1) + '}{100}\\times\\$' + (sh.c / 100).toFixed(2) + '=\\$' + D(RT(fab, 4), 4)) + '<br>With the zipper: ' + t('\\$' + D(RT(fab, 4), 4) + '+\\$' + z.toFixed(2) + '=\\$' + D(RT(fab + z, 4), 4)) + ' per case.<br>' + t(sh.N + '\\times\\$' + D(RT(fab + z, 4), 4) + '=\\$' + D(RT(x, 2), 2)),
            ['Find the cost of one case first: fabric (per ' + t('100\\text{ cm}^2') + ') plus one zipper.', 'Then multiply by the number of cases.'], 'pencil case cost', { before: '$' });
        } }] },
      /* ---------- Q6, Q7 ---------- */
      { num: '6', stem: 'A spherical fuel tank', parts: [
        { id: '6', level: 'PRG', make: function (r) { var S = r.pick([380, 250, 300, 420, 500, 340]); return vFromSA('The surface area of a spherical fuel tank is ' + t(S) + ' m². Determine its volume to the nearest cubic metre.', S, U('m'), 0, 'V from SA=' + S); } }] },
      { num: '7', stem: 'A bowling ball', parts: [
        { id: '7', level: 'PRG', make: function (r) { var S = r.pick([254.5, 201.1, 314.2, 153.9, 227.0, 283.5]); return vFromSA('A bowling ball has a surface area of ' + t(D(S)) + ' in². Determine its volume to the nearest tenth of a cubic inch.', S, U('in'), 1, 'V from SA=' + S); } }] },
      /* ---------- Q8 ---------- */
      { num: '8', stem: function (sh) { return 'A silver miniature soccer ball is packaged as an award inside a cubic container that just fits the ball. The container has a volume of ' + t(F(sh.s * sh.s * sh.s)) + ' cm³.' + FIG.cubeBall({}); },
        shared: function (r) { return { s: r.pick([13, 12, 14, 15, 11, 9, 10]), p: r.pick([75, 60, 80, 70, 50]) }; }, parts: [
        { id: '8a', sub: 'a', level: 'ADV', make: function (r, sh) {
          var s = sh.s, rr = s / 2, x = 4 * PI * rr * rr;
          var alts = saAlts(rr, 'd').concat([A(6 * s * s, 'cube-sa', 'That’s the surface area of the <b>cube</b>. The ball’s diameter equals the cube’s edge.'), A(4 * PI * Math.pow(s * s * s / 6, 2), 'no-cbrt', 'Find the cube’s edge with a <b>cube root</b>: ' + t('s=\\sqrt[3]{V}') + '.')]);
          return nearP('Calculate the surface area of the silver ball, to the nearest cm².', x, 0, 'cm²', alts,
            'The cube’s edge is ' + t('\\sqrt[3]{' + F(s * s * s) + '}=' + s) + ' cm. The ball just fits, so its <b>diameter</b> is ' + t(s) + ' cm and ' + t('r=' + D(rr)) + ' cm.<br>' + t('SA=4\\pi(' + D(rr) + ')^2=' + piT(4 * rr * rr) + '\\approx ' + D(RT(x, 0), 0)) + ' cm²',
            ['The ball just fits the cube, so its diameter equals the cube’s edge.', 'Edge: ' + t('\\sqrt[3]{V}') + '.'], 'ball in cube SA s=' + s);
        } },
        { id: '8b', sub: 'b', level: 'ADV', make: function (r, sh) {
          var s = sh.s, rr = s / 2, vb = 4 / 3 * PI * rr * rr * rr, rem = s * s * s - vb, x = sh.p / 100 * rem;
          return nearP('Once the ball is inside the cube, bubble wrap fills ' + t(sh.p + '\\%') + ' of the remaining space in the container. Determine the volume of bubble wrap used, to the nearest cm³.', x, 0, 'cm³', [
            A(rem, 'no-pct', 'That’s all of the remaining space. The bubble wrap fills only ' + t(sh.p + '\\%') + ' of it.'),
            A((100 - sh.p) / 100 * rem, 'pct-flip', 'You used ' + t((100 - sh.p) + '\\%') + '. The bubble wrap fills ' + t(sh.p + '\\%') + ' of the remaining space.'),
            A(sh.p / 100 * vb, 'pct-ball', 'Take the percentage of the space <b>left over</b> (cube − ball), not of the ball.'),
            A(sh.p / 100 * s * s * s, 'pct-ball', 'Subtract the ball’s volume from the cube’s first, then take ' + t(sh.p + '\\%') + '.'),
            A(sh.p / 100 * (s * s * s - 2 / 3 * PI * rr * rr * rr), 'hemi-whole', 'The ball is a whole sphere: ' + t('\\frac{4}{3}\\pi r^3') + '.')],
            t('V_{\\text{ball}}=\\frac{4}{3}\\pi(' + D(rr) + ')^3\\approx ' + D(RT(vb, 2), 2)) + ' cm³<br>Remaining space ' + t('=' + F(s * s * s) + '-' + D(RT(vb, 2), 2) + '=' + D(RT(rem, 2), 2)) + ' cm³<br>Bubble wrap ' + t('=' + D(sh.p / 100) + '(' + D(RT(rem, 2), 2) + ')\\approx ' + D(RT(x, 0), 0)) + ' cm³',
            ['Remaining space = cube − ball.', 'Then take ' + t(sh.p + '\\%') + ' of it.'], 'bubble wrap s=' + s + ' p=' + sh.p);
        } }] },
      /* ---------- Q9, Q10 (multiple choice) ---------- */
      { num: '9', section: 'Multiple choice and numerical response', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '9', level: 'PRG', make: function (r) {
          var V = r.pick([90, 120, 150, 65, 180]), rr = Math.cbrt(3 * V / (4 * PI)), d = 2 * rr, right = Math.round(d * 2) / 2, rad = Math.round(rr * 2) / 2;
          var pool = [-1.5, -1, 1, 1.5, 2.5].map(function (k) { return right + k; }).filter(function (v) { return v > rad + 0.4 && Math.abs(v - right) > 0.1; });
          var two = r.sample(pool, 2), vals = [rad, right].concat(two).sort(function (a, b) { return a - b; });
          var opts = vals.map(function (v) { return { html: t(D(v)) + ' cm', right: v === right, why: v === right ? null : v === rad ? 'That size matches the scoop’s <b>radius</b>. A cone opening has to fit the scoop’s <b>diameter</b>: ' + t('d=2r') + '.' : 'Find ' + t('r') + ' from ' + t('V=\\frac{4}{3}\\pi r^3') + ' (cube root!), then double it.' }; });
          return mcP(r, 'Chocolate Rules Ice Cream Company scoops a spherical ball of ice cream with a volume of ' + t(V) + ' mL onto a cone. Which cone diameter would best fit the scoop?', opts,
            t(V + '\\text{ mL}=' + V + '\\text{ cm}^3') + ', so ' + t('r^3=\\frac{3(' + V + ')}{4\\pi}=' + D(RT(rr * rr * rr, 3), 3)) + ' and ' + t('r\\approx ' + D(RT(rr, 2), 2)) + ' cm.<br>' + t('d=2r\\approx ' + D(RT(d, 2), 2)) + ' cm; the closest cone diameter is ' + t(D(right)) + ' cm.',
            ['Find the radius from the volume, then the diameter.'], 'cone diameter for V=' + V, true);
        } }] },
      { num: '10', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '10', level: 'EMG', make: function (r) {
          var S = r.pick([415, 320, 500, 260, 610, 380]), rr = Math.sqrt(S / (4 * PI)), q = S / (4 * PI), vals = [RT(rr, 1), RT(q, 1), RT(2 * rr, 1), RT(Math.cbrt(q), 1)];
          if (vals.filter(function (v, i) { return vals.indexOf(v) === i; }).length < 4) vals[3] = RT(rr / 2, 1);
          var why = [null, H.noSqrt, H.gaveD, H.cbrtSqrt];
          var opts = vals.map(function (v, i) { return { html: t(D(v, 1)), right: i === 0, why: why[i] || (i === 3 ? 'Check your square root step.' : null) }; });
          return mcP(r, 'The surface area of a sphere is ' + t(S) + ' m². Its radius, to the nearest tenth of a metre, is', opts,
            t('r=\\sqrt{\\frac{SA}{4\\pi}}=\\sqrt{\\frac{' + S + '}{4\\pi}}=\\sqrt{' + D(RT(q, 3), 3) + '}\\approx ' + D(RT(rr, 1), 1)) + ' m',
            ['Divide by ' + t('4\\pi') + ', then take the square root.'], 'r from SA=' + S);
        } }] },
      /* ---------- Q11–Q16 (numerical response) ---------- */
      { num: '11', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '11', level: 'PRG', make: function (r) {
          var rr = r.pick([21, 18, 24, 15, 27, 12]), mm = 4 / 3 * PI * rr * rr * rr, x = mm / 1000;
          return nearP('A sphere has a radius of ' + t(rr) + ' mm. The volume of the sphere, in cm³ to the nearest tenth, is ________.', x, 1, 'cm³', [
            A(mm / 10, 'unit-conv', t('1\\text{ cm}=10\\text{ mm}') + ', so ' + t('1\\text{ cm}^3=10^3=1000\\text{ mm}^3') + '. Divide by ' + t('1000') + ', not ' + t('10') + '.'),
            A(mm / 100, 'unit-conv', 'A volume conversion uses the factor <b>cubed</b>: ' + t('1\\text{ cm}^3=1000\\text{ mm}^3') + '.'),
            A(4 / 3 * PI * Math.pow(rr / 10, 2), 'v-r2', H.r2), A(PI * Math.pow(rr / 10, 3), 'v-no-43', H.no43), A(4 / 3 * PI * Math.pow(rr / 20, 3), 'halved-r', H.halvedR)],
            t('V=\\frac{4}{3}\\pi(' + rr + ')^3=' + piT(4 / 3 * rr * rr * rr) + '\\approx ' + D(RT(mm, 2), 2)) + ' mm³<br>' + t('1\\text{ cm}^3=1000\\text{ mm}^3') + ': ' + t(D(RT(mm, 2), 2) + '\\div 1000\\approx ' + D(RT(x, 1), 1)) + ' cm³ (or convert first: ' + t('r=' + D(rr / 10) + '\\text{ cm}') + ').',
            ['Convert the radius to centimetres first (' + t('10\\text{ mm}=1\\text{ cm}') + '), then use ' + t('V=\\frac{4}{3}\\pi r^3') + '.'], 'mm radius → cm³', { nr: true });
        } }] },
      { num: '12', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '12', level: 'ADV', make: function (r) {
          var o; for (var i = 0; i < 100; i++) { o = { D: r.pick([8, 10, 12, 9]), h: r.pick([6, 5, 7, 8]), d: r.pick([4, 5, 6, 3]) }; if (o.d <= o.D - 3 && o.d < o.h) break; }
          var R = o.D / 2, rb = o.d / 2, vb = 4 / 3 * PI * rb * rb * rb, rise = vb / (PI * R * R), x = o.h + rise;
          return nearP('A cylindrical jar has diameter ' + t(o.D) + ' cm and contains water to a depth of ' + t(o.h) + ' cm. A sphere of diameter ' + t(o.d) + ' cm is dropped into the jar and sinks to the bottom. The new water depth, to the nearest tenth of a centimetre, is ________.' + FIG.jar({ wf: o.h / 12, br: o.d / o.D * 0.9, DLab: 'd = ' + o.D + ' cm', depthLab: o.h + ' cm', ballLab: 'd = ' + o.d + ' cm' }), x, 1, 'cm', [
            A(rise, 'rise-only', 'That’s how much the water <b>rises</b>. Add it to the original depth.'),
            A(o.h + 8 * vb / (PI * R * R), 'd-as-r', 'The sphere’s ' + t(o.d) + ' cm is a <b>diameter</b>. Halve it.'),
            A(o.h + vb / (PI * o.D * o.D), 'jar-d', 'The jar’s ' + t(o.D) + ' cm is a <b>diameter</b>. Its cross-section is ' + t('\\pi(' + D(R) + ')^2') + '.'),
            A(o.h + 2 / 3 * PI * rb * rb * rb / (PI * R * R), 'hemi-whole', 'The whole sphere is under water: use ' + t('\\frac{4}{3}\\pi r^3') + '.')],
            'Jar radius ' + t(D(R)) + ' cm; sphere radius ' + t(D(rb)) + ' cm.<br>' + t('V_{\\text{sphere}}=\\frac{4}{3}\\pi(' + D(rb) + ')^3=' + piT(4 / 3 * rb * rb * rb)) + '<br>Rise ' + t('=\\frac{' + piT(4 / 3 * rb * rb * rb) + '}{\\pi(' + D(R) + ')^2}\\approx ' + D(RT(rise, 3), 3)) + ' cm<br>New depth ' + t('=' + o.h + '+' + D(RT(rise, 3), 3) + '\\approx ' + D(RT(x, 1), 1)) + ' cm',
            ['The water rises by the sphere’s volume spread over the jar’s circular cross-section.', 'New depth = old depth + rise.'], 'jar displacement', { nr: true });
        } }] },
      { num: '13', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '13', level: 'MAS', make: function (r) {
          var pr = r.pick([[75, 25], [80, 20], [60, 30], [90, 30], [50, 25], [60, 20]]), dA = r.pick([10, 8, 12, 9, 6, 14]), k = pr[0] / pr[1], dB = dA * Math.cbrt(k), rA = dA / 2;
          return nearP('Sphere A is ' + t(pr[0] + '\\%') + ' full of water and Sphere B is ' + t(pr[1] + '\\%') + ' full of water. Sphere A has a diameter of ' + t(dA) + ' cm. If both spheres contain an equal volume of water, the diameter of Sphere B, to the nearest tenth of a centimetre, is ________.' +
            FIG.twoSpheres({ a: { R: 32, f: pr[0] / 100, lab1: 'Sphere A', lab2: 'diameter = ' + dA + ' cm' }, b: { R: 32 * Math.min(1.8, Math.cbrt(k)), f: pr[1] / 100, lab1: 'Sphere B', lab2: '' } }), dB, 1, 'cm', [
            A(dB / 2, 'gave-r', H.gaveR), A(dA * k, 'no-cbrt', 'The volumes are in the ratio ' + t(k + ':1') + ', but volume depends on ' + t('r^3') + '. Take the <b>cube root</b> of the ratio.'),
            A(dA * Math.sqrt(k), 'sqrt-for-cbrt', H.sqrtCbrt), A(dA / Math.cbrt(k), 'ratio-flip', 'Sphere B holds the same water at a <b>smaller</b> percentage, so B must be the <b>bigger</b> sphere.'), A(2 * dA * Math.cbrt(k), 'd-as-r', H.dr)],
            'Sphere A: ' + t('r=' + D(rA)) + ' cm, water ' + t('=' + D(pr[0] / 100) + '\\cdot\\frac{4}{3}\\pi(' + D(rA) + ')^3=' + piT(pr[0] / 100 * 4 / 3 * rA * rA * rA)) + '<br>Sphere B (radius ' + t('R') + '): water ' + t('=' + D(pr[1] / 100) + '\\cdot\\frac{4}{3}\\pi R^3') + '<br>' + t('R^3=' + D(k) + '(' + D(rA) + ')^3=' + D(k * rA * rA * rA) + ',\\ R\\approx ' + D(RT(dB / 2, 3), 3)) + ' cm<br>Diameter ' + t('=2R\\approx ' + D(RT(dB, 1), 1)) + ' cm',
            ['Write the water in each sphere as a percentage of ' + t('\\frac{4}{3}\\pi r^3') + ' and set them equal.', 'Solve for ' + t('R^3') + ', take the cube root, then double.'], 'spheres A and B', { nr: true });
        } }] },
      { num: '14', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '14', level: 'ADV', make: function (r) {
          var o; for (var i = 0; i < 100; i++) { o = { L: r.pick([16, 14, 18, 20, 12, 15]), d: r.pick([5, 4, 6]) }; if (o.L - o.d >= 6) break; }
          var rr = o.d / 2, h = o.L - o.d, cyl = PI * rr * rr * h, sp = 4 / 3 * PI * rr * rr * rr, x = cyl + sp;
          return nearP('A boiler is shaped like a cylinder with a hemispherical end cap on each side. Its total length is ' + t(o.L) + ' m and its diameter is ' + t(o.d) + ' m. Its cubic content, to the nearest m³, is ________.' + FIG.capsule({ LLab: o.L + ' m', dLab: o.d + ' m', aria: 'boiler' }), x, 0, 'm³', [
            A(PI * rr * rr * o.L + sp, 'full-length', 'The caps use up part of the ' + t(o.L) + ' m: each adds one radius. The cylinder is ' + t(o.L + '-' + o.d + '=' + h) + ' m long.'),
            A(PI * rr * rr * o.L, 'full-length', 'The ' + t(o.L) + ' m includes the two caps. Cylinder length ' + t('=' + o.L + '-2r') + ', then add the two hemispheres (one whole sphere).'),
            A(cyl + 2 * sp, 'hemi-whole', 'Two hemispherical caps make <b>one</b> whole sphere, not two.'),
            A(cyl + sp / 2, 'hemi-whole', 'There is a cap on <b>each</b> end: two hemispheres = one whole sphere.'),
            A(PI * rr * rr * (o.L - rr) + sp, 'cap-length', 'Each cap takes one radius off the length — two caps take ' + t('2r=' + o.d) + ' m.')],
            t('r=' + D(rr)) + ' m. The two caps make one whole sphere and use ' + t('2r=' + o.d) + ' m of the length, so the cylinder is ' + t('h=' + o.L + '-' + o.d + '=' + h) + ' m long.<br>' + t('V=\\pi(' + D(rr) + ')^2(' + h + ')+\\frac{4}{3}\\pi(' + D(rr) + ')^3=' + piT(rr * rr * h) + '+' + piT(4 / 3 * rr * rr * rr) + '\\approx ' + D(RT(x, 0), 0)) + ' m³',
            ['The two hemispherical caps together make one sphere.', 'Subtract the caps from the total length to get the cylinder’s length.'], 'boiler', { nr: true });
        } }] },
      { num: '15', stem: function (sh) { return '<i>(Numerical Response)</i> A solid gold earring is shaped like a hemisphere topped by a cone. The diameter of the hemisphere and the height of the cone are each ' + t(D(sh.d)) + ' mm. The mass of ' + t('1') + ' cubic centimetre of gold is ' + t('19.3') + ' grams.' + FIG.earring({ dLab: 'd = ' + D(sh.d) + ' mm', hLab: 'h = ' + D(sh.d) + ' mm' }); },
        shared: function (r) { return { d: r.pick([7.4, 6.8, 8, 7, 8.6, 6.4]) }; }, parts: [
        { id: '15', level: 'ADV', make: function (r, sh) {
          var rc = sh.d / 20, hc = sh.d / 10, vh = 2 / 3 * PI * rc * rc * rc, vc = PI * rc * rc * hc / 3, V = vh + vc, x = 19.3 * V;
          return nearP('The mass of the earring, to the nearest tenth of a gram, is ________.', x, 1, 'g', [
            A(19.3 * V * 1000, 'no-convert', 'The density is per <b>cm³</b>. Convert: ' + t('1\\text{ cm}^3=1000\\text{ mm}^3') + '.'),
            A(19.3 * V * 100, 'unit-conv', 'Volume conversions use the factor <b>cubed</b>: ' + t('1\\text{ cm}^3=1000\\text{ mm}^3') + '.'),
            A(19.3 * V * 10, 'unit-conv', 'Volume conversions use the factor <b>cubed</b>: ' + t('1\\text{ cm}^3=1000\\text{ mm}^3') + '.'),
            A(19.3 * vh, 'part-missing', 'Include both pieces: the hemisphere <b>and</b> the cone.'),
            A(19.3 * (2 * vh + vc), 'hemi-whole', 'The bottom is a <b>hemisphere</b>: ' + t('\\frac{2}{3}\\pi r^3') + '.'),
            A(19.3 * (vh + 3 * vc), 'cone-no-third', 'A cone is ' + t('\\frac{1}{3}') + ' of a cylinder: ' + t('V=\\frac{1}{3}\\pi r^2h') + '.'),
            A(19.3 * 8 * V, 'd-as-r', H.dr), A(V, 'part-missing', 'That’s the volume. Multiply by ' + t('19.3') + ' g per cm³ to get the mass.')],
            'Work in centimetres (the density is per cm³): ' + t('r=' + D(sh.d) + '\\div 2=' + D(sh.d / 2) + '\\text{ mm}=' + D(rc) + '\\text{ cm}') + ', ' + t('h=' + D(hc) + '\\text{ cm}') + '.<br>' +
            t('V=\\tfrac{2}{3}\\pi(' + D(rc) + ')^3+\\tfrac{1}{3}\\pi(' + D(rc) + ')^2(' + D(hc) + ')\\approx ' + D(RT(V, 6), 6)) + ' cm³<br>Mass ' + t('=' + D(RT(V, 6), 6) + '\\times 19.3\\approx ' + D(RT(x, 1), 1)) + ' g',
            ['Volume = hemisphere + cone, in cm³.', 'Mass = volume × 19.3 g/cm³.'], 'earring mass', { nr: true });
        } }] },
      { num: '16', stem: function (sh) { return '<i>(Numerical Response)</i> A solid gold earring is shaped like a hemisphere topped by a cone. The diameter of the hemisphere and the height of the cone are each ' + t(D(sh.d)) + ' mm.' + FIG.earring({ dLab: 'd = ' + D(sh.d) + ' mm', hLab: 'h = ' + D(sh.d) + ' mm' }); },
        shared: function (r) { return { d: r.pick([7.4, 6.8, 8, 7, 8.6, 6.4]) }; }, parts: [
        { id: '16', level: 'MAS', make: function (r, sh) {
          var rr = sh.d / 2, h = sh.d, s = Math.sqrt(rr * rr + h * h), x = 2 * PI * rr * rr + PI * rr * s;
          return nearP('The surface area of the earring, to the nearest square millimetre, is ________.', x, 0, 'mm²', [
            A(x + PI * rr * rr, 'joint-counted', 'The flat circle where the cone meets the hemisphere is <b>inside</b> the earring — it isn’t part of the surface.'),
            A(x + 2 * PI * rr * rr, 'joint-counted', 'Neither piece has a flat base showing: the circle where they meet is inside the solid.'),
            A(2 * PI * rr * rr + PI * rr * h, 'h-for-s', 'The cone’s curved surface uses the <b>slant height</b>: ' + t('s=\\sqrt{r^2+h^2}') + ', not the height.'),
            A(x / 100, 'unit-conv', t('1\\text{ cm}^2=100\\text{ mm}^2') + '. Give the answer in mm².'),
            A(x / 10, 'unit-conv', t('1\\text{ cm}^2=100\\text{ mm}^2') + ' (the factor is squared).'),
            A(4 * x, 'd-as-r', H.dr), A(4 * PI * rr * rr + PI * rr * s, 'hemi-whole', 'The bottom is a hemisphere: its curved surface is ' + t('2\\pi r^2') + '.')],
            t('r=' + D(rr)) + ' mm, ' + t('h=' + D(h)) + ' mm. Slant height ' + t('s=\\sqrt{' + D(rr) + '^2+' + D(h) + '^2}\\approx ' + D(RT(s, 4), 4)) + ' mm.<br>Only the curved hemisphere and the cone’s side show — the joining circle is inside the earring:<br>' +
            t('SA=2\\pi(' + D(rr) + ')^2+\\pi(' + D(rr) + ')(' + D(RT(s, 4), 4) + ')\\approx ' + D(RT(x, 0), 0)) + ' mm²',
            ['Exposed surfaces: the curved half of a sphere and the cone’s lateral surface.', 'Find the slant height with the Pythagorean theorem.'], 'earring SA', { nr: true });
        } }] }
    ],

    /* ======================================================================================== */
    extra: [
      /* ---------- Part A ---------- */
      { num: '1', section: 'Extra practice A — Two thirds of the cylinder that just contains it', stem: 'A sphere of radius ' + t('r') + ' sits inside the smallest cylinder that will contain it: the sphere touches the flat top, the flat bottom and the curved wall all at once. The shaded region is the space left over.' + FIG.sphereCyl({ shade: true, hLab: '?' }), parts: [
        { id: 'e1a', sub: 'a', level: 'LIM', make: function (r) {
          return mcP(r, 'What are the cylinder’s radius and height, in terms of ' + t('r') + '?', [
            { html: 'radius ' + t('r') + ', height ' + t('2r'), right: true },
            { html: 'radius ' + t('r') + ', height ' + t('r'), why: 'The sphere touches the top <b>and</b> the bottom, so the height is the sphere’s full width — its diameter.' },
            { html: 'radius ' + t('2r') + ', height ' + t('2r'), why: 'The sphere touches the curved wall all the way round, so the cylinder has the <b>same radius</b> as the sphere.' },
            { html: 'radius ' + t('2r') + ', height ' + t('r'), why: 'Same radius as the sphere (it touches the wall); height equal to the diameter (it touches top and bottom).' }],
            'The sphere touches the curved wall, so the cylinder’s radius is ' + t('r') + '. It touches the top and bottom, so the height is the sphere’s diameter, ' + t('2r') + '.', ['Which measurement of the sphere fits exactly between the top and the bottom?'], 'snug cylinder dimensions');
        } },
        { id: 'e1b', sub: 'b', level: 'BEG', make: function () {
          return symP('Write the cylinder’s volume in terms of ' + t('r') + ' alone, simplified.', '2\\pi r^{3}', ['r'], { before: t('V_{\\text{cyl}}='), lhs: 'V_{\\text{cyl}}=', diags: [
            { tex: '\\pi r^{3}', code: 'h-r', hint: 'The height is ' + t('2r') + ', not ' + t('r') + ': ' + t('V=\\pi r^2(2r)') + '.' }, { tex: '2\\pi r^{2}', code: 'v-r2', hint: t('r^2\\times r=r^3') + '.' },
            { tex: '4\\pi r^{3}', code: 'd-as-r', hint: 'The radius is ' + t('r') + ' (not ' + t('2r') + '); only the height is ' + t('2r') + '.' }, { tex: '8\\pi r^{3}', code: 'd-as-r', hint: 'The radius is ' + t('r') + '; only the height is ' + t('2r') + '.' }] },
            t('V_{\\text{cyl}}=\\pi r^2h=\\pi r^2(2r)=2\\pi r^3'), ['Use ' + t('V=\\pi r^2h') + ' with ' + t('h=2r') + '.'], 'cylinder volume 2πr³');
        } },
        { id: 'e1c', sub: 'c', level: 'EMG', make: function () {
          return symP('Mika’s overflow experiment showed that the sphere fills exactly <b>two thirds</b> of this cylinder. Starting from ' + t('V_{\\text{cyl}}=2\\pi r^3') + ', write the sphere’s volume.', '\\frac{4}{3}\\pi r^{3}', ['r'], { before: t('V_{\\text{sphere}}='), lhs: 'V_{\\text{sphere}}=', good: ['\\frac{4\\pi r^{3}}{3}'], diags: [
            { tex: '\\frac{2}{3}\\pi r^{3}', code: 'v-no-43', hint: 'Take two thirds of the <b>whole</b> cylinder volume, ' + t('2\\pi r^3') + ' — keep its 2.' },
            { tex: '3\\pi r^{3}', code: 'v-43-flip', hint: 'Two thirds <b>of</b> something means multiply by ' + t('\\frac{2}{3}') + '.' },
            { tex: '\\frac{4}{3}\\pi r^{2}', code: 'v-r2', hint: 'Keep the ' + t('r^3') + ' from the cylinder volume.' }] },
            t('V_{\\text{sphere}}=\\frac{2}{3}V_{\\text{cyl}}=\\frac{2}{3}(2\\pi r^3)=\\frac{4}{3}\\pi r^3') + '. The 4 is ' + t('2\\times 2') + ': one 2 from the two thirds, one from the height ' + t('2r') + '.', ['Multiply ' + t('2\\pi r^3') + ' by ' + t('\\frac{2}{3}') + '.'], 'derive 4/3πr³');
        } },
        { id: 'e1d', sub: 'd i', level: 'EMG', make: function () {
          return symP('<b>The leftover third.</b> Write the volume of the shaded space in terms of ' + t('r') + '.', '\\frac{2}{3}\\pi r^{3}', ['r'], { before: t('V_{\\text{gap}}='), lhs: 'V_{\\text{gap}}=', good: ['\\frac{2\\pi r^{3}}{3}'], diags: [
            { tex: '\\frac{4}{3}\\pi r^{3}', code: 'third', hint: 'That’s the sphere. The gap is cylinder − sphere.' }, { tex: '2\\pi r^{3}', code: 'full', hint: 'That’s the whole cylinder. Subtract the sphere.' }] },
            'By subtraction: ' + t('2\\pi r^3-\\frac{4}{3}\\pi r^3=\\frac{6\\pi r^3-4\\pi r^3}{3}=\\frac{2}{3}\\pi r^3') + '. From the two-thirds statement: ' + t('\\frac{1}{3}(2\\pi r^3)=\\frac{2}{3}\\pi r^3') + ' ✓ (the volume of a hemisphere of radius ' + t('r') + '!).', ['Gap = cylinder − sphere = ' + t('2\\pi r^3-\\frac{4}{3}\\pi r^3') + '.'], 'gap volume');
        } },
        { id: 'e1d2', sub: 'd ii', level: 'BEG', make: function () {
          return K.P.fraction('What fraction of the cylinder is the shaded space?', [1, 3], {}, 'The sphere fills ' + t('\\frac{2}{3}') + ', so the gap is ' + t('1-\\frac{2}{3}=\\frac{1}{3}') + ' of the cylinder: ' + t('\\frac{\\frac{2}{3}\\pi r^3}{2\\pi r^3}=\\frac{1}{3}') + '.', ['The sphere fills two thirds. What is left?'], 'gap fraction 1/3');
        } }] },
      { num: '2', stem: function (sh) { return 'A cylindrical gift tin holds a spherical glass ornament snugly — the ornament touches the lid, the base and the curved wall. The tin’s interior volume is exactly ' + t(F(sh.V)) + ' cm³.' + FIG.sphereCyl({ rLab: 'r', hLab: '2r' }); },
        shared: function (r) { return { V: r.pick([1620, 1200, 2400, 900, 3000, 1350, 1800]) }; }, parts: [
        { id: 'e2a', sub: 'a i', level: 'EMG', make: function (r, sh) {
          return intP('<b>Using the ratio only</b> (without finding the radius), state the volume of the ornament.', sh.V * 2 / 3, [A(sh.V / 3, 'third', 'That’s the leftover third (the air). The ornament fills <b>two thirds</b> of the tin.'), A(sh.V * 4 / 3, 'v-43-flip', 'The sphere is <b>two thirds</b> of its snug cylinder — smaller than the tin, not bigger.'), A(sh.V / 2, 'third', 'The fraction is two thirds, not one half.')],
            'The tin is the cylinder that just contains the sphere, so the ornament is ' + t('\\frac{2}{3}') + ' of it: ' + t('\\frac{2}{3}(' + F(sh.V) + ')=' + F(sh.V * 2 / 3)) + ' cm³.', ['A sphere fills two thirds of the cylinder that just contains it.'], 'ornament by ratio', 'cm³');
        } },
        { id: 'e2a2', sub: 'a ii', level: 'EMG', make: function (r, sh) {
          return intP('<b>Using the ratio only</b>, state the volume of air around the ornament.', sh.V / 3, [A(sh.V * 2 / 3, 'third', 'That’s the ornament. The air is the <b>leftover third</b>.')],
            'The air is the leftover third: ' + t('\\frac{1}{3}(' + F(sh.V) + ')=' + F(sh.V / 3)) + ' cm³. Check: ' + t(F(sh.V * 2 / 3) + '+' + F(sh.V / 3) + '=' + F(sh.V)) + ' ✓', ['The ornament is two thirds; the air is what’s left.'], 'air by ratio', 'cm³');
        } },
        { id: 'e2b', sub: 'b', level: 'PRG', make: function (r, sh) {
          var r3 = sh.V / (2 * PI), x = Math.cbrt(r3);
          return nearP('Now do it the long way: find the ornament’s radius from the tin’s volume, to the nearest tenth of a centimetre.', x, 1, 'cm', [
            A(Math.cbrt(sh.V / PI), 'h-r', 'The tin’s height is ' + t('2r') + ', so ' + t('V_{\\text{tin}}=\\pi r^2(2r)=2\\pi r^3') + '.'),
            A(Math.cbrt(3 * sh.V / (4 * PI)), 'tin-as-sphere', t(F(sh.V)) + ' cm³ is the <b>tin’s</b> (cylinder’s) volume: ' + t('2\\pi r^3=' + F(sh.V)) + '.'),
            A(Math.sqrt(r3), 'sqrt-for-cbrt', H.sqrtCbrt), A(r3, 'no-cbrt', H.noCbrt), A(2 * x, 'gave-d', H.gaveD)],
            t('V_{\\text{tin}}=2\\pi r^3=' + F(sh.V) + '\\ \\Rightarrow\\ r^3=\\frac{' + F(sh.V) + '}{2\\pi}\\approx ' + D(RT(r3, 4), 4)) + '<br>' + t('r=\\sqrt[3]{' + D(RT(r3, 4), 4) + '}\\approx ' + D(RT(x, 1), 1)) + ' cm. (With the unrounded ' + t('r') + ', ' + t('\\frac{4}{3}\\pi r^3=' + F(sh.V * 2 / 3)) + ' cm³ ✓)',
            ['The tin is a cylinder of radius ' + t('r') + ' and height ' + t('2r') + ': ' + t('V=2\\pi r^3') + '.'], 'tin radius');
        } },
        { id: 'e2c', sub: 'c', level: 'EMG', make: function (r) {
          return mcP(r, 'The two-thirds shortcut needed no calculator. What must be true of a cylinder before the shortcut can be used?', [
            { html: 'It must <b>just contain</b> the sphere: same radius as the sphere and height equal to the sphere’s diameter.', right: true },
            { html: 'It must hold more than the sphere’s volume.', why: 'Any bigger cylinder holds more — but then the sphere fills less than two thirds of it.' },
            { html: 'Its height must equal the sphere’s radius.', why: 'The sphere touches the top and the bottom, so the height is the <b>diameter</b>, ' + t('2r') + '.' },
            { html: 'Nothing — a sphere always fills two thirds of any cylinder it is in.', why: 'If the tin were taller or wider, the sphere would fill a smaller fraction of it.' }],
            'The ratio ' + t('\\frac{2}{3}') + ' comes from ' + t('\\frac{4}{3}\\pi r^3\\div 2\\pi r^3') + ', which needs radius ' + t('r') + ' and height ' + t('2r') + '. A taller or wider tin would give a smaller fraction.', ['Where did the two thirds come from?'], 'condition for 2/3');
        } }] },
      { num: '3', stem: 'The same two-thirds idea works one level down. A <b>hemisphere</b> of radius ' + t('r') + ' is set inside a cylinder of radius ' + t('r') + ' whose height is ' + t('r') + ', so that it just fits.' + FIG.hemiCyl({}), parts: [
        { id: 'e3a', sub: 'a', level: 'EMG', make: function () {
          return K.P.fraction('What fraction of this cylinder does the hemisphere fill? (Start from ' + t('V_{\\text{hemisphere}}=\\frac{1}{2}\\cdot\\frac{4}{3}\\pi r^3') + '.)', [2, 3], {},
            t('V_{\\text{hemi}}=\\frac{2}{3}\\pi r^3') + ', ' + t('V_{\\text{cyl}}=\\pi r^2(r)=\\pi r^3') + ' (here ' + t('h=r') + ').<br>' + t('\\frac{\\frac{2}{3}\\pi r^3}{\\pi r^3}=\\frac{2}{3}') + ' for every radius.', ['Divide the hemisphere’s volume by ' + t('\\pi r^2(r)') + '.'], 'hemisphere in cylinder fraction');
        } },
        { id: 'e3b', sub: 'b', level: 'EMG', make: function (r) {
          var R = r.pick([9, 6, 7.5, 12, 10.5, 4.5]), x = 2 / 3 * R;
          return nearP('A hemispherical bowl of radius ' + t(D(R, 1)) + ' cm is filled level with its rim and poured into a cylindrical glass of radius ' + t(D(R, 1)) + ' cm and height ' + t(D(R, 1)) + ' cm. How far up the glass does the water rise, to the nearest tenth of a centimetre? (Try it without computing a volume.)', x, 1, 'cm', [
            A(R / 3, 'third', 'The bowl holds <b>two thirds</b> of the glass, so the water rises two thirds of the way up.'), A(R, 'full', 'The bowl holds only two thirds of the glass.'), A(4 / 3 * R, 'v-43-flip', 'The bowl holds less than the glass: two thirds of it.')],
            'By part (a) the bowl holds ' + t('\\frac{2}{3}') + ' of the glass. The glass has the same cross-section all the way up, so ' + t('\\frac{2}{3}') + ' of the volume fills ' + t('\\frac{2}{3}') + ' of the height: ' + t('\\frac{2}{3}(' + D(R, 1) + ')=' + D(RT(x, 1), 1)) + ' cm.',
            ['The bowl is two thirds of this glass.', 'In a cylinder, a fraction of the volume is the same fraction of the height.'], 'bowl into glass R=' + R);
        } },
        { id: 'e3c', sub: 'c', level: 'EMG', make: function (r) {
          return mcP(r, 'Why is the rise always the same fraction of the glass’s height, whatever the common radius is?', [
            { html: 'A cylinder has the same cross-section at every level, so ' + t('\\frac{2}{3}') + ' of its volume fills ' + t('\\frac{2}{3}') + ' of its height; the rise is ' + t('\\frac{2}{3}r') + '.', right: true },
            { html: 'Water always fills two thirds of any glass.', why: 'It depends on the bowl: a different bowl holds a different amount.' },
            { html: 'Because ' + t('\\pi') + ' is the same for every circle.', why: t('\\pi') + ' does cancel, but the key is that the bowl is exactly ' + t('\\frac{2}{3}') + ' of the matching cylinder and the cylinder’s cross-section is constant.' },
            { html: 'The fraction is really ' + t('\\frac{1}{3}') + ', the leftover part.', why: 'The bowl’s water is ' + t('\\frac{2}{3}') + ' of the glass; ' + t('\\frac{1}{3}') + ' is the empty part above it.' }],
            'Rise ' + t('=\\frac{\\frac{2}{3}\\pi r^3}{\\pi r^2}=\\frac{2}{3}r') + ': the ' + t('\\pi') + ' and one ' + t('r^2') + ' cancel, leaving ' + t('\\frac{2}{3}') + ' of the height ' + t('r') + '.', ['Write the rise as volume ÷ base area.'], 'why 2/3 of the height');
        } }] },
      /* ---------- Part B ---------- */
      { num: '4', section: 'Extra practice B — The diameter is not the radius', stem: 'Give the exact value in terms of ' + t('\\pi') + ' <b>and</b> the decimal value to the nearest tenth. Every question here gives a <b>diameter</b>: halve it first.', parts: [
        { id: 'e4a', sub: 'a i', level: 'EMG', make: function (r) {
          var d = r.pick([4.6, 3.8, 5.2, 4.2, 6.4, 2.6]), rr = d / 2, c = 4 * rr * rr;
          return exactNearP('The <b>surface area</b> of a spherical weather balloon of diameter ' + t(D(d)) + ' m.' + solid('sphere', { d: 'd = ' + D(d) + ' m', width: 230 }), 0, c, 1, 'm²', saAlts(rr, 'd'),
            t('r=' + D(d) + '\\div 2=' + D(rr)) + ' m (halve first)<br>' + t('SA=4\\pi(' + D(rr) + ')^2=4\\pi(' + D(rr * rr) + ')=' + piT(c) + '\\approx ' + D(RT(c * PI, 1), 1)) + ' m²', ['Halve the diameter, then ' + t('SA=4\\pi r^2') + '. Keep ' + t('\\pi') + ' as a symbol for the exact answer.'], 'balloon SA exact d=' + d);
        } },
        { id: 'e4a2', sub: 'a ii', level: 'EMG', make: function (r) {
          var d = r.pick([4.6, 3.8, 5.2, 4.2, 6.4, 2.6]), rr = d / 2, c = 4 / 3 * rr * rr * rr;
          return exactNearP('The <b>volume</b> of a spherical weather balloon of diameter ' + t(D(d)) + ' m.' + solid('sphere', { d: 'd = ' + D(d) + ' m', width: 230 }), 0, c, 1, 'm³', vAlts(rr, 'd'),
            t('r=' + D(rr)) + ' m<br>' + t('V=\\frac{4}{3}\\pi(' + D(rr) + ')^3=\\frac{4}{3}\\pi(' + D(rr * rr * rr) + ')=' + piT(c) + '\\approx ' + D(RT(c * PI, 1), 1)) + ' m³', ['Halve the diameter, then ' + t('V=\\frac{4}{3}\\pi r^3') + '. If the number in front of ' + t('\\pi') + ' doesn’t end, leave it as a fraction.'], 'balloon V exact d=' + d);
        } },
        { id: 'e4b', sub: 'b i', level: 'EMG', make: function (r) {
          var d = r.pick([8.4, 6.6, 7.2, 9.6, 5.4, 6]), rr = d / 2, c = 2 / 3 * rr * rr * rr;
          return exactNearP('The <b>volume</b> of a solid hemispherical paperweight of diameter ' + t(D(d)) + ' cm.' + solid('hemisphere', { d: 'd = ' + D(d) + ' cm', width: 230 }), 0, c, 1, 'cm³', hvAlts(rr, 'd'),
            t('r=' + D(rr)) + ' cm<br>' + t('V=\\frac{2}{3}\\pi(' + D(rr) + ')^3=\\frac{2}{3}\\pi(' + D(rr * rr * rr) + ')=' + piT(c) + '\\approx ' + D(RT(c * PI, 1), 1)) + ' cm³', ['A hemisphere is half a sphere: ' + t('V=\\frac{2}{3}\\pi r^3') + '.'], 'paperweight V d=' + d);
        } },
        { id: 'e4b2', sub: 'b ii', level: 'PRG', make: function (r) {
          var d = r.pick([8.4, 6.6, 7.2, 9.6, 5.4, 6]), rr = d / 2, c = 3 * rr * rr;
          return exactNearP('The area of glass to be polished on a solid hemispherical paperweight of diameter ' + t(D(d)) + ' cm, if <b>every</b> outside surface is polished, flat face included.' + solid('hemisphere', { d: 'd = ' + D(d) + ' cm', width: 230 }), 0, c, 1, 'cm²', hsAlts(rr, 'd', true),
            t('r=' + D(rr)) + ' cm. Every surface: curved part and flat base.<br>' + t('SA=2\\pi r^2+\\pi r^2=3\\pi(' + D(rr) + ')^2=' + piT(c) + '\\approx ' + D(RT(c * PI, 1), 1)) + ' cm²', ['Curved part ' + t('2\\pi r^2') + ' plus flat base ' + t('\\pi r^2') + '.'], 'paperweight SA d=' + d);
        } }] },
      { num: '5', stem: function (sh) { return 'Sphere P has a <b>diameter</b> of ' + t(D(sh.D, 1)) + ' cm. Sphere Q has a <b>radius</b> of ' + t(D(sh.D, 1)) + ' cm.' + side(solid('sphere', { d: 'P: d = ' + D(sh.D, 1) + ' cm', width: 230 }), solid('sphere', { r: 'Q: r = ' + D(sh.D, 1) + ' cm', width: 230 })); },
        shared: function (r) { return { D: r.pick([14, 10, 12, 16, 18, 8]) }; }, parts: [
        { id: 'e5a', sub: 'a', level: 'EMG', make: function (r, sh) {
          return intP('<b>Before calculating anything</b>, predict: Q’s volume is how many times P’s volume?', 8, [A(2, 'factor-2', 'Q’s radius is twice P’s, but the radius is <b>cubed</b> in the volume formula.'), A(4, 'factor-sq', 'Volume depends on ' + t('r^3') + ', not ' + t('r^2') + ': the factor is ' + t('2^3') + '.'), A(6, 'factor-2', 'The factor is ' + t('2^3=2\\times 2\\times 2') + '.')],
            t('r_P=' + D(sh.D / 2) + '\\text{ cm},\\ r_Q=' + D(sh.D) + '\\text{ cm}') + ', so ' + t('r_Q=2r_P') + '. In ' + t('V=\\frac{4}{3}\\pi r^3') + ' the radius is cubed: ' + t('\\frac{4}{3}\\pi(2r)^3=8\\left(\\frac{4}{3}\\pi r^3\\right)') + '. Q’s volume is <b>8</b> times P’s.', ['Compare the radii. What happens to ' + t('r^3') + ' when ' + t('r') + ' doubles?'], 'predict factor 8');
        } },
        { id: 'e5b', sub: 'b i', level: 'EMG', make: function (r, sh) {
          var rr = sh.D / 2, c = 4 / 3 * rr * rr * rr;
          return exactNearP('Find the volume of sphere <b>P</b>, exactly in terms of ' + t('\\pi') + ' and to the nearest tenth.', 0, c, 1, 'cm³', vAlts(rr, 'd'), t('r_P=' + D(rr)) + ' cm<br>' + t('V_P=\\frac{4}{3}\\pi(' + D(rr) + ')^3=' + piT(c) + '\\approx ' + D(RT(c * PI, 1), 1)) + ' cm³', ['P’s ' + t(D(sh.D, 1)) + ' cm is a diameter.'], 'V_P exact');
        } },
        { id: 'e5b2', sub: 'b ii', level: 'BEG', make: function (r, sh) {
          var rr = sh.D, c = 4 / 3 * rr * rr * rr;
          return exactNearP('Find the volume of sphere <b>Q</b>, exactly in terms of ' + t('\\pi') + ' and to the nearest tenth. Then check: is it 8 times P’s?', 0, c, 1, 'cm³', vAlts(rr, 'r'), t('V_Q=\\frac{4}{3}\\pi(' + D(rr) + ')^3=' + piT(c) + '\\approx ' + D(RT(c * PI, 1), 1)) + ' cm³<br>' + t('\\frac{' + piT(c) + '}{' + piT(c / 8) + '}=8') + ' ✓', ['Q’s ' + t(D(sh.D, 1)) + ' cm is already the radius.'], 'V_Q exact');
        } },
        { id: 'e5c', sub: 'c', level: 'EMG', make: function (r) {
          return mcP(r, 'What does this pair of spheres tell you about reading a diameter as a radius?', [
            { html: 'It makes a volume <b>8 times</b> too big (and a surface area 4 times too big), because it doubles ' + t('r') + ' and ' + t('r') + ' is cubed.', right: true },
            { html: 'It makes the answer twice as big.', why: 'The radius doubles, but in ' + t('V=\\frac{4}{3}\\pi r^3') + ' it is cubed: ' + t('2^3=8') + '.' },
            { html: 'It makes the answer a little too big — only a rounding difference.', why: 'Compare P and Q: the difference is a factor of 8.' },
            { html: 'It makes a volume 4 times too big.', why: '4 is the factor for an <b>area</b> (' + t('2^2') + '). Volume uses ' + t('2^3') + '.' }],
            'Reading a diameter as a radius doubles ' + t('r') + ': volume ' + t('\\times 2^3=8') + ', surface area ' + t('\\times 2^2=4') + '.', ['Look at your answers for P and Q.'], 'cost of d as r');
        } }] },
      { num: '6', stem: function (sh) { return 'Which has the greater surface area: a <b>sphere</b> of diameter ' + t(D(2 * sh.a, 1)) + ' cm, or a <b>solid hemisphere</b> of diameter ' + t(D(2 * sh.b, 1)) + ' cm whose curved surface <i>and</i> flat base are both counted?'; },
        shared: function (r) { var p = r.pick(EP6.filter(function (q) { return q[0] === 10 && q[1] === 12; }).concat(r.sample(EP6, 4))); return { a: p[0], b: p[1] }; }, parts: [
        { id: 'e6a', sub: 'a i', level: 'EMG', make: function (r, sh) {
          var cs = 4 * sh.a * sh.a, ch = 3 * sh.b * sh.b;
          return K.P.fields('Write both surface areas exactly, in terms of ' + t('\\pi') + '.', [{ label: 'Sphere', name: 'Sphere', mode: 'math', keys: 'expr', after: 'cm²' }, { label: 'Hemisphere', name: 'Hemisphere', mode: 'math', keys: 'expr', after: 'cm²' }],
            [exactCheck(0, cs, saAlts(sh.a, 'd')), exactCheck(0, ch, hsAlts(sh.b, 'd', true))], [piT(cs), piT(ch)], 'Sphere ' + t(piT(cs)) + ' cm², hemisphere ' + t(piT(ch)) + ' cm²',
            'Sphere: ' + t('r=' + sh.a + ',\\ SA=4\\pi(' + sh.a + ')^2=' + piT(cs)) + ' cm²<br>Hemisphere: ' + t('r=' + sh.b + ',\\ SA=3\\pi(' + sh.b + ')^2=' + piT(ch)) + ' cm²', ['Halve each diameter. Sphere: ' + t('4\\pi r^2') + '; hemisphere with its base: ' + t('3\\pi r^2') + '.'], 'sphere vs hemisphere exact');
        } },
        { id: 'e6a2', sub: 'a ii', level: 'BEG', make: function (r, sh) {
          var cs = 4 * sh.a * sh.a, ch = 3 * sh.b * sh.b, big = cs > ch ? 's' : 'h';
          return mcP(r, 'Compare the coefficients ' + t(piT(cs)) + ' (sphere) and ' + t(piT(ch)) + ' (hemisphere). Which has the greater surface area?', [
            { html: 'the sphere', right: big === 's', why: big === 's' ? null : 'Compare the numbers in front of ' + t('\\pi') + ': ' + t(ch + '>' + cs) + '.' },
            { html: 'the hemisphere', right: big === 'h', why: big === 'h' ? null : 'Compare the numbers in front of ' + t('\\pi') + ': ' + t(cs + '>' + ch) + '.' },
            { html: 'They are equal.', why: 'The coefficients ' + t(cs) + ' and ' + t(ch) + ' are different.' }],
            t(piT(Math.max(cs, ch)) + '>' + piT(Math.min(cs, ch))) + ', so the <b>' + (big === 's' ? 'sphere' : 'hemisphere') + '</b> has the greater surface area — no calculator needed.', ['Both areas are (number)' + t('\\pi') + '. Compare the numbers.'], 'which is greater');
        } },
        { id: 'e6b', sub: 'b i', level: 'PRG', make: function (r, sh) {
          var cs = 4 * sh.a * sh.a, ch = 3 * sh.b * sh.b, L = Math.max(cs, ch), S = Math.min(cs, ch), p = Math.round((L - S) / S * 100);
          return intP('By what percentage is the larger surface area greater than the smaller? (It comes out as a whole number.)', p, [A(RT((L - S) / L * 100, 0), 'pct-base', 'A percentage <b>increase</b> is compared with the smaller value: divide by ' + t(S + '\\pi') + '.'), A(L - S, 'pct-diff', 'That’s the difference in coefficients. Divide it by the smaller one and multiply by ' + t('100\\%') + '.'), A(RT(L / S * 100, 0), 'pct-base', 'That’s the larger as a percentage of the smaller. Subtract ' + t('100\\%') + '.')],
            t('\\frac{' + L + '\\pi-' + S + '\\pi}{' + S + '\\pi}\\times 100\\%=\\frac{' + (L - S) + '}{' + S + '}\\times 100\\%=' + p + '\\%'), ['Percentage increase = (larger − smaller) ÷ smaller × 100%.'], 'percent greater', '%');
        } },
        { id: 'e6b2', sub: 'b ii', level: 'EMG', make: function (r) {
          return mcP(r, 'Why did ' + t('\\pi') + ' cancel in the percentage?', [
            { html: 'Both areas are (a number)' + t('\\times\\pi') + ', so ' + t('\\pi') + ' is a common factor of the top and bottom of the ratio.', right: true },
            { html: 'Because ' + t('\\pi') + ' is close to 3, so it doesn’t matter much.', why: 'It cancels <b>exactly</b>, whatever its value — it is a common factor.' },
            { html: 'Because percentages never use ' + t('\\pi') + '.', why: 'They can — here it cancels because both areas contain the factor ' + t('\\pi') + '.' },
            { html: 'Because we rounded both answers first.', why: 'Rounding would make the answer slightly <i>inexact</i>. Keeping ' + t('\\pi') + ' exact is what lets it cancel.' }],
            'A ratio of two like quantities is a pure number: ' + t('\\frac{a\\pi}{b\\pi}=\\frac{a}{b}') + '.', ['Write the ratio with ' + t('\\pi') + ' on the top and bottom.'], 'why π cancels');
        } }] },
      /* ---------- Part C ---------- */
      { num: '7', section: 'Extra practice C — A hemisphere’s flat base: the wording decides', stem: function (sh) { return 'Three different objects are each a hemisphere of diameter ' + t(D(sh.d, 1)) + ' cm: <b>(a)</b> a <i>solid wooden</i> hemisphere, to be varnished all over; <b>(b)</b> a hemispherical <i>dome</i> sitting on a flat roof, the outside to be painted; <b>(c)</b> a hemispherical <i>bowl</i>, open at the top, the outside to be glazed.' + solid('hemisphere', { d: 'd = ' + D(sh.d, 1) + ' cm', width: 230 }); },
        shared: function (r) { return { d: r.pick([21, 18, 16, 24, 15, 19]) }; }, parts: [
        { id: 'e7i', sub: 'i', level: 'BEG', make: function (r, sh) {
          var cols = [{ id: 'c', html: 'curved surface only' }, { id: 'cb', html: 'curved surface + flat base' }];
          return K.P.grid('For each object, which surfaces are counted?', [{ id: 'a', html: '(a) solid wood, varnished all over' }, { id: 'b', html: '(b) dome on a roof, outside painted' }, { id: 'c', html: '(c) open bowl, outside glazed' }], cols, { a: 'cb', b: 'c', c: 'c' },
            { why: function (row) { return row === 'a' ? 'The solid has a real flat face, and “all over” includes it.' : row === 'b' ? 'The dome sits on the roof: the roof is the floor, so the dome has no flat face of its own.' : 'An open bowl has nothing across the top — no flat surface to glaze.'; } },
            '(a) curved + flat base: the flat face is real wood and “all over” includes it. (b) curved only: the roof is the floor. (c) curved only: the bowl is open.', ['Is there material across the flat circle, and does the wording include it?'], 'which surfaces count');
        } },
        { id: 'e7a', sub: 'a', level: 'EMG', make: function (r, sh) { return hemiSA('(a) The solid wooden hemisphere, varnished all over: area to the nearest tenth.', sh.d / 2, 'd', U('cm'), 1, true, 'Curved surface AND flat base: the flat face is a real surface and “all over” includes it.', 'varnish SA d=' + sh.d); } },
        { id: 'e7b', sub: 'b', level: 'EMG', make: function (r, sh) { return hemiSA('(b) The dome on the flat roof, outside painted: area to the nearest tenth.', sh.d / 2, 'd', U('cm'), 1, false, 'Curved surface only: the roof is the floor, so the dome has no flat face to paint.', 'dome SA d=' + sh.d); } },
        { id: 'e7c', sub: 'c', level: 'EMG', make: function (r, sh) { return hemiSA('(c) The open bowl, outside glazed: area to the nearest tenth.', sh.d / 2, 'd', U('cm'), 1, false, 'Curved surface only: the bowl is open at the top — nothing there to glaze.', 'bowl SA d=' + sh.d); } },
        { id: 'e7d', sub: 'd', level: 'EMG', make: function (r) {
          return mcP(r, 'Two of the three answers are identical. Which rule explains when to count a hemisphere’s flat base?', [
            { html: 'Count the flat base only when material really lies across it <b>and</b> the wording includes it.', right: true },
            { html: 'Always count the flat base — a hemisphere has two surfaces.', why: 'The dome and the bowl have no flat surface being painted or glazed.' },
            { html: 'Never count the flat base — it’s on the bottom.', why: 'The solid wooden hemisphere has a real flat face, and “all over” includes it.' },
            { html: 'Count it only for objects that sit on the ground.', why: 'The dome sits on a roof and the base still doesn’t count — the roof is the floor.' }],
            '(b) and (c) are identical (' + t('2\\pi r^2') + '): in (b) the circle belongs to the roof, in (c) it is empty air. Only (a) has a real, included flat face.', ['Why do the dome and the bowl give the same answer?'], 'flat base rule');
        } }] },
      { num: '8', stem: function (sh) { return 'A hemispherical observatory dome is built with <b>no floor</b>. Its curved surface area is ' + t(sh.A) + ' m².'; },
        shared: function (r) { return { A: r.pick([150, 120, 200, 180, 90, 240]) }; }, parts: [
        { id: 'e8a', sub: 'a', level: 'PRG', make: function (r, sh) {
          var r2 = sh.A / (2 * PI), x = Math.sqrt(r2);
          return nearP('Determine the dome’s radius, to the nearest tenth of a metre.', x, 1, 'm', [
            A(Math.sqrt(sh.A / (3 * PI)), 'hemi-base', '“No floor” excludes the flat base: the curved surface is ' + t('2\\pi r^2=' + sh.A) + '.'),
            A(Math.sqrt(sh.A / (4 * PI)), 'hemi-whole', 'A hemisphere’s curved surface is ' + t('2\\pi r^2') + ', half of a sphere’s ' + t('4\\pi r^2') + '.'),
            A(r2, 'no-sqrt', H.noSqrt), A(Math.sqrt(sh.A / PI), 'sa-no-4', 'Divide by ' + t('2\\pi') + ', not just ' + t('\\pi') + '.'), A(2 * x, 'gave-d', H.gaveD)],
            'No floor: curved surface only, ' + t('2\\pi r^2=' + sh.A) + '.<br>' + t('r^2=\\frac{' + sh.A + '}{2\\pi}\\approx ' + D(RT(r2, 4), 4) + ',\\ r\\approx ' + D(RT(x, 1), 1)) + ' m',
            ['Which expression does “no floor” tell you to use: ' + t('2\\pi r^2') + ' or ' + t('3\\pi r^2') + '?'], 'dome radius A=' + sh.A);
        } },
        { id: 'e8b', sub: 'b', level: 'EMG', make: function (r, sh) {
          var r2 = sh.A / (2 * PI), x = sh.A / 2, rr = RT(Math.sqrt(r2), 1);
          return nearP('Determine the floor area the dome encloses (the circle it stands on), to the nearest tenth of a square metre. Use the <b>unrounded</b> radius.', x, 1, 'm²', [
            A(PI * rr * rr, 'early-round', H.early), A(2 * PI * r2, 'hemi-base', 'The floor is one circle, ' + t('\\pi r^2') + ' — not the curved surface.'), A(PI * Math.sqrt(r2), 'v-r2', 'The area of a circle is ' + t('\\pi r^2') + ' (square the radius).')],
            'Floor ' + t('=\\pi r^2=\\pi\\left(\\frac{' + sh.A + '}{2\\pi}\\right)=' + D(x) + '=' + D(x, 1)) + ' m² exactly — the ' + t('\\pi') + ' cancels. (With the rounded ' + t('r=' + D(rr, 1)) + ' you’d get ' + t(D(RT(PI * rr * rr, 1), 1)) + ' m².)',
            ['The floor is a circle: ' + t('\\pi r^2') + '.', 'Use the unrounded ' + t('r^2=\\frac{' + sh.A + '}{2\\pi}') + '.'], 'dome floor');
        } },
        { id: 'e8c', sub: 'c', level: 'EMG', make: function (r, sh) {
          return mcP(r, 'The floor area came out to exactly half of ' + t(sh.A) + '. Why is a hemisphere’s curved surface always exactly twice its base?', [
            { html: t('\\frac{2\\pi r^2}{\\pi r^2}=2') + ' for every ' + t('r') + ', because ' + t('\\pi r^2') + ' cancels.', right: true },
            { html: 'Because the dome is twice as tall as it is wide.', why: 'A hemisphere is as tall as its radius and twice as wide. Compare the formulas instead.' },
            { html: 'It only works for this radius.', why: 'Write the ratio with letters: ' + t('\\frac{2\\pi r^2}{\\pi r^2}') + '. What’s left?' },
            { html: 'Because a sphere’s surface is ' + t('2\\pi r^2') + '.', why: 'A sphere’s surface is ' + t('4\\pi r^2') + '; the hemisphere’s curved half is ' + t('2\\pi r^2') + '.' }],
            t('\\frac{\\text{curved}}{\\text{base}}=\\frac{2\\pi r^2}{\\pi r^2}=2') + '. So the base is always half the curved surface — a ten-second check: ' + t('\\frac{' + sh.A + '}{2}=' + D(sh.A / 2)) + ' m².', ['Divide the two formulas.'], 'curved = 2 × base');
        } }] },
      /* ---------- Part D ---------- */
      { num: '9', section: 'Extra practice D — Running the formulas backwards', stem: function (sh) { return 'A spherical helium balloon holds ' + t(F(sh.V)) + ' cm³ of gas.'; },
        shared: function (r) { return { V: r.pick([12500, 9000, 15000, 20000, 6000, 8000]) }; }, parts: [
        { id: 'e9a', sub: 'a', level: 'EMG', make: function () { var p = solveR(false, 'either'); p.prompt = 'Rearrange ' + t('V=\\frac{4}{3}\\pi r^3') + ' to isolate ' + t('r') + ' (as a radical or as a power).'; return p; } },
        { id: 'e9b', sub: 'b', level: 'PRG', make: function (r, sh) { return rFromV('Determine the balloon’s radius to the nearest tenth of a centimetre.', sh.V, false, U('cm'), 1, 'balloon r V=' + sh.V); } },
        { id: 'e9c', sub: 'c', level: 'EMG', make: function (r, sh) {
          var rr = Math.cbrt(3 * sh.V / (4 * PI)), x = 2 * rr;
          return nearP('Determine the balloon’s <b>diameter</b> to the nearest tenth of a centimetre (double first, then round).', x, 1, 'cm', [A(2 * RT(rr, 1), 'early-round', 'Double the <b>unrounded</b> radius, then round.'), A(rr, 'gave-r', H.gaveR), A(4 * rr, 'd-as-r', 'The diameter is ' + t('2r') + '.')].concat(rvAlts(sh.V, false).slice(0, 3)),
            t('r=\\sqrt[3]{\\frac{3(' + F(sh.V) + ')}{4\\pi}}\\approx ' + D(RT(rr, 4), 4)) + ' cm<br>' + t('d=2r\\approx ' + D(RT(x, 4), 4) + '\\approx ' + D(RT(x, 1), 1)) + ' cm',
            ['Find the unrounded radius, double it, then round.'], 'balloon diameter');
        } }] },
      { num: '10', stem: 'A spherical steel buoy', parts: [
        { id: 'e10', level: 'PRG', make: function (r) { var S = r.pick([92, 75, 110, 64, 130, 55]); return rFromSA('A spherical steel buoy has a surface area of ' + t(D(S, 1)) + ' m². Rearrange ' + t('SA=4\\pi r^2') + ' to isolate ' + t('r') + ', then determine the radius to the nearest tenth of a metre.', S, U('m'), 1, 'buoy r SA=' + S); } }] },
      { num: '11', stem: function (sh) { return 'A spherical propane tank has a surface area of ' + t(D(sh.S, 1)) + ' m².'; },
        shared: function (r) {
          var pool = [95, 80, 120, 60, 150, 70, 110].filter(function (S) { var q = Math.sqrt(S / (4 * PI)); return RT(4 / 3 * PI * Math.pow(q, 3), 1) !== RT(4 / 3 * PI * Math.pow(RT(q, 1), 3), 1); });
          return { S: r.pick(pool) };
        }, parts: [
        { id: 'e11a', sub: 'a', level: 'PRG', make: function (r, sh) { return vFromSA('Determine its volume to the nearest tenth of a cubic metre, via the radius. Carry the <b>unrounded</b> radius into the volume step.', sh.S, U('m'), 1, 'tank V SA=' + sh.S); } },
        { id: 'e11b', sub: 'b i', level: 'EMG', make: function (r, sh) {
          var q = Math.sqrt(sh.S / (4 * PI)), rr = RT(q, 1), x = 4 / 3 * PI * rr * rr * rr, good = 4 / 3 * PI * q * q * q;
          return nearP('Repeat the volume calculation, but this time round the radius to the nearest tenth <b>before</b> substituting. What volume do you get, to the nearest tenth?', x, 1, 'm³', [A(good, 'early-round', 'That’s the accurate answer from (a). This time use the radius <b>rounded</b> to ' + t(D(rr, 1)) + ' m.')],
            t('r\\approx ' + D(rr, 1)) + ' m, ' + t('V=\\frac{4}{3}\\pi(' + D(rr, 1) + ')^3\\approx ' + D(RT(x, 1), 1)) + ' m³ — off by ' + t(D(RT(Math.abs(RT(good, 1) - RT(x, 1)), 1), 1)) + ' m³ from ' + t(D(RT(good, 1), 1)) + ' m³.', ['Round ' + t('r') + ' to one decimal place, then use ' + t('V=\\frac{4}{3}\\pi r^3') + '.'], 'rounded-r volume');
        } },
        { id: 'e11b2', sub: 'b ii', level: 'BEG', make: function (r) {
          return mcP(r, 'Which volume should be reported?', [
            { html: 'The one from (a): the radius was only a stepping stone, so it must be carried at full precision.', right: true },
            { html: 'The one from (b): rounded numbers are easier to check.', why: 'Rounding the radius first throws away accuracy, and cubing magnifies the error.' },
            { html: 'Either — they are both correct.', why: 'They disagree in the tenths place, and only one used full precision.' },
            { html: 'Their average.', why: 'The accurate answer is the one with no early rounding.' }],
            'Report the volume from (a). Round only the final answer; cubing a rounded radius magnifies its error about three times.', ['Which calculation rounded too early?'], 'which to report');
        } },
        { id: 'e11c', sub: 'c', level: 'EMG', make: function (r) {
          return mcP(r, 'Which line shows that ' + t('V=\\frac{1}{3}\\,SA\\cdot r') + ' for every sphere?', [
            { html: t('\\frac{1}{3}(4\\pi r^2)\\,r=\\frac{4\\pi r^3}{3}=\\frac{4}{3}\\pi r^3=V'), right: true },
            { html: t('\\frac{1}{3}(4\\pi r^2)\\,r=\\frac{4}{9}\\pi r^3'), why: 'Only one factor of ' + t('\\frac{1}{3}') + ' appears: ' + t('\\frac{1}{3}\\times 4=\\frac{4}{3}') + '.' },
            { html: t('\\frac{1}{3}\\left(\\frac{4}{3}\\pi r^3\\right)r=\\frac{4}{9}\\pi r^4'), why: 'SA is ' + t('4\\pi r^2') + ', not the volume formula.' },
            { html: t('\\frac{1}{3}(4\\pi r^2)\\,r=\\frac{4}{3}\\pi r^2'), why: t('r^2\\times r=r^3') + '.' }],
            t('\\frac{1}{3}\\,SA\\cdot r=\\frac{1}{3}(4\\pi r^2)r=\\frac{4}{3}\\pi r^3=V') + '. So with the unrounded radius, ' + t('V=\\frac{1}{3}(SA)(r)') + ' is a single multiplication.', ['Substitute ' + t('SA=4\\pi r^2') + '.'], 'V = SA·r/3');
        } }] },
      /* ---------- Part E ---------- */
      { num: '12', section: 'Extra practice E — Composite solids: joining circles belong to neither surface', stem: function (sh) { return 'A pharmaceutical capsule is a cylinder with a hemisphere on each end. Its total length is ' + t(D(sh.L, 1)) + ' mm and its diameter is ' + t(D(sh.d, 1)) + ' mm. The dashed circles mark where the caps meet the cylinder.' + FIG.capsule({ LLab: D(sh.L, 1) + ' mm', dLab: D(sh.d, 1) + ' mm', seamColor: '#c4532a', cap: 'dashed: the joining circles', aria: 'capsule' }); },
        shared: function (r) { for (var i = 0; i < 100; i++) { var o = { L: r.pick([21, 18, 24, 20, 16, 22]), d: r.pick([7, 6, 8, 5]) }; if (o.L - o.d >= 9) return o; } return { L: 21, d: 7 }; }, parts: [
        { id: 'e12a', sub: 'a i', level: 'EMG', make: function (r, sh) {
          var h = sh.L - sh.d;
          return nearP('Find the length of the cylindrical middle.', h, 1, 'mm', [A(sh.L - sh.d / 2, 'cap-length', 'There are <b>two</b> caps, each adding one radius ' + t('(' + D(sh.d / 2) + '\\text{ mm})') + ' to the length.'), A(sh.L - 2 * sh.d, 'cap-length', 'Each cap adds one <b>radius</b>, not a diameter.'), A(sh.L, 'full-length', 'The total length includes the two caps.')],
            t('r=' + D(sh.d / 2)) + ' mm. Each cap adds ' + t('r') + ' to the length: ' + t('h=' + D(sh.L, 1) + '-2(' + D(sh.d / 2) + ')=' + D(h, 1)) + ' mm', ['How much of the total length does each hemispherical cap use?'], 'capsule cylinder length');
        } },
        { id: 'e12a2', sub: 'a ii', level: 'BEG', make: function () {
          return K.P.grid('Which are part of the capsule’s outside surface?', [{ id: 'w', html: 'the curved wall of the cylinder' }, { id: 'c', html: 'the curved surfaces of the two caps' }, { id: 'j', html: 'the two joining circles' }, { id: 'e', html: 'the cylinder’s two circular ends' }],
            [{ id: 'y', html: 'outside' }, { id: 'n', html: 'not a surface' }], { w: 'y', c: 'y', j: 'n', e: 'n' },
            { why: function (row) { return row === 'j' || row === 'e' ? 'The joining circles (which are the cylinder’s ends) are sealed against the caps — they are inside the capsule.' : 'You can touch this part from outside.'; } },
            'Outside: the cylinder’s curved wall and the two curved caps. The joining circles — the same circles as the cylinder’s ends — are inside the capsule.', ['Imagine running a finger over the capsule. What can you touch?'], 'capsule surfaces');
        } },
        { id: 'e12b', sub: 'b', level: 'PRG', make: function (r, sh) {
          var rr = sh.d / 2, h = sh.L - sh.d, c = rr * rr * h + 4 / 3 * rr * rr * rr;
          return exactNearP('Determine the capsule’s <b>volume</b>, exactly in terms of ' + t('\\pi') + ' and to the nearest tenth. (The two hemispherical ends make one whole sphere.)', 0, c, 1, 'mm³', [
            A(PI * (rr * rr * sh.L + 4 / 3 * rr * rr * rr), 'full-length', 'The cylinder is only ' + t(D(h, 1)) + ' mm long — the caps take up the rest.'), A(PI * (rr * rr * h + 8 / 3 * rr * rr * rr), 'hemi-whole', 'Two hemispheres make <b>one</b> sphere.'),
            A(PI * (rr * rr * h + 2 / 3 * rr * rr * rr), 'hemi-whole', 'There are <b>two</b> caps: together one whole sphere, ' + t('\\frac{4}{3}\\pi r^3') + '.'), A(8 * c * PI, 'd-as-r', H.dr)],
            t('r=' + D(rr)) + ' mm, ' + t('h=' + D(h)) + ' mm<br>' + t('V=\\pi r^2h+\\frac{4}{3}\\pi r^3=\\pi(' + D(rr) + ')^2(' + D(h) + ')+\\frac{4}{3}\\pi(' + D(rr) + ')^3') + '<br>' + t('=' + piT(rr * rr * h) + '+' + piT(4 / 3 * rr * rr * rr) + '=' + piT(c) + '\\approx ' + D(RT(c * PI, 1), 1)) + ' mm³',
            ['Cylinder ' + t('\\pi r^2h') + ' plus one whole sphere ' + t('\\frac{4}{3}\\pi r^3') + '.'], 'capsule volume');
        } },
        { id: 'e12c', sub: 'c', level: 'PRG', make: function (r, sh) {
          var rr = sh.d / 2, h = sh.L - sh.d, c = 2 * rr * h + 4 * rr * rr;
          return exactNearP('Determine the capsule’s <b>surface area</b>, exactly in terms of ' + t('\\pi') + ' and to the nearest tenth.', 0, c, 1, 'mm²', [
            A(PI * (c + 2 * rr * rr), 'joint-counted', 'The cylinder’s circular ends are sealed against the caps — leave them out.'), A(PI * (c + rr * rr), 'joint-counted', 'No flat circle is part of the outside.'),
            A(PI * (2 * rr * sh.L + 4 * rr * rr), 'full-length', 'The cylinder is only ' + t(D(h, 1)) + ' mm long.'), A(PI * (2 * rr * h + 2 * rr * rr), 'hemi-whole', 'Two caps: two curved halves of a sphere, ' + t('2(2\\pi r^2)=4\\pi r^2') + '.'), A(PI * (2 * rr * h + 6 * rr * rr), 'hemi-no-base', 'The caps’ flat faces are the joints — count only their curved surfaces.')],
            t('SA=\\underbrace{2\\pi rh}_{\\text{curved wall}}+\\underbrace{4\\pi r^2}_{\\text{two caps}}=2\\pi(' + D(rr) + ')(' + D(h) + ')+4\\pi(' + D(rr) + ')^2') + '<br>' + t('=' + piT(2 * rr * h) + '+' + piT(4 * rr * rr) + '=' + piT(c) + '\\approx ' + D(RT(c * PI, 1), 1)) + ' mm²',
            ['Count only what you can touch: the curved wall ' + t('2\\pi rh') + ' and the two curved caps (one sphere’s worth, ' + t('4\\pi r^2') + ').'], 'capsule SA');
        } },
        { id: 'e12d', sub: 'd', level: 'EMG', make: function (r, sh) {
          var rr = sh.d / 2, x = 2 * PI * rr * rr;
          return nearP('A student adds ' + t('2\\pi r^2') + ' to the surface area, “one circle for each end of the cylinder”. By how many square millimetres is their answer too large? (Nearest tenth.)', x, 1, 'mm²', [A(PI * rr * rr, 'one-circle', 'They added <b>two</b> circles.'), A(8 * PI * rr * rr, 'd-as-r', H.dr)],
            t('2\\pi r^2=2\\pi(' + D(rr) + ')^2=' + piT(2 * rr * rr) + '\\approx ' + D(RT(x, 1), 1)) + ' mm² too large. Those circles are sealed against the caps — inside the capsule, not on its surface.', ['Evaluate ' + t('2\\pi r^2') + ' with the capsule’s radius.'], 'extra circles');
        } }] },
      { num: '13', stem: function (sh) { return 'A grain silo is a cylinder of diameter ' + t(D(sh.d, 1)) + ' m and height ' + t(D(sh.h, 1)) + ' m, capped by a hemispherical roof of the same diameter. The silo stands on a concrete pad.' + FIG.silo({ dLab: 'd = ' + D(sh.d, 1) + ' m', hLab: D(sh.h, 1) + ' m' }); },
        shared: function (r) { return { d: r.pick([8.4, 6, 7.2, 9, 10, 6.4]), h: r.pick([12.5, 10, 15, 11, 14]) }; }, parts: [
        { id: 'e13a', sub: 'a', level: 'PRG', make: function (r, sh) {
          var rr = sh.d / 2, c = rr * rr * sh.h + 2 / 3 * rr * rr * rr;
          return exactNearP('Determine the silo’s total interior volume, exactly in terms of ' + t('\\pi') + ' and to the nearest tenth.', 0, c, 1, 'm³', [
            A(PI * (rr * rr * sh.h + 4 / 3 * rr * rr * rr), 'hemi-whole', 'The roof is a <b>hemisphere</b>: ' + t('\\frac{2}{3}\\pi r^3') + '.'), A(PI * rr * rr * sh.h, 'part-missing', 'Add the roof’s volume too.'), A(PI * 4 * rr * rr * sh.h + PI * 16 / 3 * rr * rr * rr, 'd-as-r', H.dr), A(PI * rr * rr * (sh.h - rr) + PI * 2 / 3 * rr * rr * rr, 'full-length', 'The ' + t(D(sh.h, 1)) + ' m is the cylinder’s own height — the roof sits on top of it.')],
            t('r=' + D(rr)) + ' m<br>' + t('V=\\pi(' + D(rr) + ')^2(' + D(sh.h) + ')+\\frac{2}{3}\\pi(' + D(rr) + ')^3=' + piT(rr * rr * sh.h) + '+' + piT(2 / 3 * rr * rr * rr) + '=' + piT(c) + '\\approx ' + D(RT(c * PI, 1), 1)) + ' m³',
            ['Cylinder ' + t('\\pi r^2h') + ' plus hemisphere ' + t('\\frac{2}{3}\\pi r^3') + '.'], 'silo volume');
        } },
        { id: 'e13b', sub: 'b', level: 'ADV', make: function (r, sh) {
          var rr = sh.d / 2, c = 2 * rr * sh.h + 2 * rr * rr;
          return exactNearP('The whole exterior is to be painted <b>except</b> the circular base resting on the pad. Determine the area to be painted, exactly in terms of ' + t('\\pi') + ' and to the nearest tenth.', 0, c, 1, 'm²', [
            A(PI * (c + rr * rr), 'wording-base', 'Two circles are not painted: the base on the pad (the wording) and the joint under the roof (inside the silo).'), A(PI * (c + 2 * rr * rr), 'joint-counted', 'Neither flat circle is painted: one rests on the pad, the other is inside where the roof joins the wall.'),
            A(PI * (2 * rr * sh.h + 4 * rr * rr), 'hemi-whole', 'The roof is a hemisphere: its curved surface is ' + t('2\\pi r^2') + '.'), A(PI * (2 * rr * sh.h + 3 * rr * rr), 'hemi-no-base', 'The roof’s flat face is the joint with the wall — count only its curved surface.'), A(4 * c * PI, 'd-as-r', H.dr)],
            'Painted: the curved wall and the curved roof only.<br>' + t('SA=2\\pi rh+2\\pi r^2=2\\pi(' + D(rr) + ')(' + D(sh.h) + ')+2\\pi(' + D(rr) + ')^2=' + piT(2 * rr * sh.h) + '+' + piT(2 * rr * rr) + '=' + piT(c) + '\\approx ' + D(RT(c * PI, 1), 1)) + ' m²',
            ['List the surfaces you can see and paint: the cylinder wall and the dome.'], 'silo paint');
        } },
        { id: 'e13c', sub: 'c', level: 'EMG', make: function () {
          return K.P.grid('Two circles of area ' + t('\\pi r^2') + ' are missing from your answer to (b). Why is each one left out?', [{ id: 'j', html: 'the circle at the top of the cylinder, where the roof is fixed on' }, { id: 'p', html: 'the circular base resting on the pad' }],
            [{ id: 'g', html: 'geometry: it’s inside the silo' }, { id: 'w', html: 'the wording of the question' }], { j: 'g', p: 'w' },
            { why: function (row) { return row === 'j' ? 'The joint under the roof is inside the finished silo — it isn’t a surface at all.' : 'The base is a real surface; it is left out only because the question says so.'; } },
            'The joining circle is internal (geometry). The base is a genuine surface, excluded only by the wording “except the circular base”.', ['Could each circle ever be painted?'], 'why circles excluded');
        } }] },
      { num: '14', stem: function (sh) { return 'A hemispherical bowl of radius ' + t(D(sh.r, 1)) + ' cm is carved down into the centre of the top face of a solid wooden cube of edge ' + t(D(sh.s, 1)) + ' cm.' + FIG.carved({ k: sh.r / sh.s, rLab: 'r = ' + D(sh.r, 1) + ' cm', sLab: D(sh.s, 1) + ' cm' }); },
        shared: function (r) { for (var i = 0; i < 100; i++) { var o = { s: r.pick([12, 10, 14, 15, 16]), r: r.pick([5, 4, 6, 3]) }; if (o.r <= o.s / 2 - 1) return o; } return { s: 12, r: 5 }; }, parts: [
        { id: 'e14a', sub: 'a', level: 'PRG', make: function (r, sh) {
          var k = sh.s * sh.s * sh.s, c = -2 / 3 * sh.r * sh.r * sh.r;
          return exactNearP('Determine the volume of wood remaining, exactly in terms of ' + t('\\pi') + ' and to the nearest tenth.', k, c, 1, 'cm³', [
            A(k + 2 / 3 * PI * Math.pow(sh.r, 3), 'added', 'The bowl is carved <b>out</b> — subtract it.'), A(k - 4 / 3 * PI * Math.pow(sh.r, 3), 'hemi-whole', 'The bowl is a <b>hemisphere</b>: ' + t('\\frac{2}{3}\\pi r^3') + '.'), A(k, 'no-subtract', 'Subtract the wood carved out for the bowl.')],
            t('V=s^3-\\frac{2}{3}\\pi r^3=' + D(sh.s) + '^3-\\frac{2}{3}\\pi(' + D(sh.r) + ')^3=' + exTF(k, c) + '\\approx ' + D(RT(k + c * PI, 1), 1)) + ' cm³',
            ['Wood left = cube − hemisphere.'], 'carved cube volume');
        } },
        { id: 'e14b', sub: 'b', level: 'ADV', make: function (r, sh) {
          var k = 6 * sh.s * sh.s, c = sh.r * sh.r;
          return exactNearP('Determine the total surface area of the carved block, exactly in terms of ' + t('\\pi') + ' and to the nearest tenth. (The circle of wood removed from the top face is no longer a surface.)', k, c, 1, 'cm²', [
            A(k + 2 * PI * c, 'hole-kept', 'The circle cut out of the top face is now a hole — subtract ' + t('\\pi r^2') + ' from the cube’s surface.'), A(k - PI * c, 'part-missing', 'Add the curved inside of the bowl, ' + t('2\\pi r^2') + '.'),
            A(k + 3 * PI * c, 'hole-kept', 'Remove the hole from the top face, and the bowl has no flat face: ' + t('6s^2-\\pi r^2+2\\pi r^2') + '.'), A(k, 'no-subtract', 'Carving changes the surface: −' + t('\\pi r^2') + ' (hole) + ' + t('2\\pi r^2') + ' (bowl).'), A(k + 3 * PI * c - PI * c, 'hole-kept', 'The bowl has no flat face of its own.')],
            t('SA=\\underbrace{6s^2}_{\\text{cube}}-\\underbrace{\\pi r^2}_{\\text{hole}}+\\underbrace{2\\pi r^2}_{\\text{bowl}}=' + F(k) + '-' + piT(c) + '+' + piT(2 * c) + '=' + exTF(k, c) + '\\approx ' + D(RT(k + c * PI, 1), 1)) + ' cm²',
            ['Start from the cube’s ' + t('6s^2') + '. Remove the circle that became a hole; add the bowl’s curved surface.'], 'carved cube SA');
        } },
        { id: 'e14c', sub: 'c', level: 'EMG', make: function (r) {
          return mcP(r, 'Carving the bowl increased the surface area by exactly ' + t('\\pi r^2') + '. If a hemisphere of the same radius were <b>glued onto</b> the top face instead, how would the surface area change?', [
            { html: 'It would also increase by ' + t('\\pi r^2') + ': ' + t('+2\\pi r^2') + ' (curved surface) ' + t('-\\pi r^2') + ' (the circle it covers).', right: true },
            { html: 'It would increase by ' + t('2\\pi r^2') + '.', why: 'The hemisphere’s flat base covers a circle of the top face — that ' + t('\\pi r^2') + ' stops being a surface.' },
            { html: 'It would increase by ' + t('3\\pi r^2') + '.', why: 'The hemisphere’s flat base is glued down: it is a joint, not a surface — and it hides part of the top face.' },
            { html: 'It would decrease by ' + t('\\pi r^2') + '.', why: 'The curved surface ' + t('2\\pi r^2') + ' is added; only ' + t('\\pi r^2') + ' is hidden.' }],
            'In both cases one flat circle (' + t('\\pi r^2') + ') stops being a surface and one curved hemisphere (' + t('2\\pi r^2') + ') starts being one: change ' + t('=+\\pi r^2') + '. Only the volume tells them apart.', ['What is added, and what is hidden, when the hemisphere is glued on?'], 'glued vs carved');
        } }] },
      /* ---------- Part F ---------- */
      { num: '15', section: 'Extra practice F — Scaling: where the 4 and the 8 come from', stem: function (sh) { return 'Sphere S has radius ' + t(D(sh.a, 1)) + ' cm. Sphere T has radius ' + t(D(sh.k * sh.a, 1)) + ' cm.'; },
        shared: function (r) { return { a: r.pick([5, 4, 6, 3]), k: r.pick([2, 2, 3]) }; }, parts: [
        { id: 'e15a', sub: 'a', level: 'EMG', make: function (r, sh) {
          var k = sh.k;
          return K.P.fields('<b>Without computing any numbers</b>, use the exponents in ' + t('SA=4\\pi r^2') + ' and ' + t('V=\\frac{4}{3}\\pi r^3') + ': by what factor do the surface area and the volume grow from S to T?', [{ label: 'SA factor', name: 'SA factor' }, { label: 'V factor', name: 'V factor' }],
            [intField(k * k, [A(k, 'scale-sq', 'The radius is <b>squared</b> in ' + t('4\\pi r^2') + ': the factor is ' + t(k + '^2') + '.'), A(k * k * k, 'scale-sq', 'Surface area uses ' + t('r^2') + ', so the factor is ' + t(k + '^2') + ', not ' + t(k + '^3') + '.')]), intField(k * k * k, [A(k, 'scale-cube', 'The radius is <b>cubed</b> in the volume: ' + t(k + '^3') + '.'), A(k * k, 'scale-cube', 'Volume uses ' + t('r^3') + ': the factor is ' + t(k + '^3') + '.')])],
            [String(k * k), String(k * k * k)], 'SA ' + t('\\times ' + k * k) + ', V ' + t('\\times ' + k * k * k),
            'Replace ' + t('r') + ' by ' + t(k + 'r') + ': ' + t('4\\pi(' + k + 'r)^2=' + k * k + '(4\\pi r^2)') + ' and ' + t('\\frac{4}{3}\\pi(' + k + 'r)^3=' + k * k * k + '\\left(\\frac{4}{3}\\pi r^3\\right)') + '.', ['T’s radius is ' + k + ' times S’s. Square it for area, cube it for volume.'], 'scale factors k=' + k);
        } },
        { id: 'e15b', sub: 'b', level: 'EMG', make: function (r, sh) {
          var a = sh.a, b = sh.k * a, v = [4 * PI * a * a, 4 / 3 * PI * a * a * a, 4 * PI * b * b, 4 / 3 * PI * b * b * b], labs = ['S: SA', 'S: V', 'T: SA', 'T: V'], un = ['cm²', 'cm³', 'cm²', 'cm³'];
          var chks = v.map(function (x, i) { var rr = i < 2 ? a : b; return K.near(x, 1, { alts: (i % 2 ? vAlts(rr, 'r') : saAlts(rr, 'r')) }); });
          return K.P.fields('Compute all four quantities to the nearest tenth, then check the factors from (a).', labs.map(function (l, i) { return { label: l, name: l, after: un[i] }; }), chks, v.map(function (x) { return RT(x, 1).toFixed(1); }),
            labs.map(function (l, i) { return l + ' ' + t('\\approx ' + D(RT(v[i], 1), 1)) + ' ' + un[i]; }).join('<br>'),
            'S: ' + t('SA=4\\pi(' + D(a) + ')^2=' + piT(4 * a * a) + '\\approx ' + D(RT(v[0], 1), 1)) + ', ' + t('V=\\frac{4}{3}\\pi(' + D(a) + ')^3=' + piT(4 / 3 * a * a * a) + '\\approx ' + D(RT(v[1], 1), 1)) + '<br>T: ' + t('SA=' + piT(4 * b * b) + '\\approx ' + D(RT(v[2], 1), 1)) + ', ' + t('V=' + piT(4 / 3 * b * b * b) + '\\approx ' + D(RT(v[3], 1), 1)) + '<br>Checks: ' + t('\\frac{' + piT(4 * b * b) + '}{' + piT(4 * a * a) + '}=' + sh.k * sh.k) + ', ' + t('\\frac{' + piT(4 / 3 * b * b * b) + '}{' + piT(4 / 3 * a * a * a) + '}=' + Math.pow(sh.k, 3)) + ' ✓',
            ['Use ' + t('4\\pi r^2') + ' and ' + t('\\frac{4}{3}\\pi r^3') + ' for each sphere.'], 'four quantities');
        } },
        { id: 'e15c', sub: 'c', level: 'BEG', make: function (r) {
          return mcP(r, 'A sphere’s radius is multiplied by ' + t('k') + '. Its surface area and volume are multiplied by', [
            { html: t('k^2') + ' and ' + t('k^3'), right: true }, { html: t('k') + ' and ' + t('k'), why: 'Area has ' + t('r^2') + ' and volume ' + t('r^3') + ' — the factor gets squared and cubed.' },
            { html: t('2k') + ' and ' + t('3k'), why: 'Exponents mean repeated multiplication: ' + t('k\\times k') + ', not ' + t('2\\times k') + '.' }, { html: t('k^2') + ' and ' + t('k^2'), why: 'Volume has ' + t('r^3') + ': the factor is ' + t('k^3') + '.' }],
            t('k^2') + ' for area and ' + t('k^3') + ' for volume — the same rule as unit conversions: ' + t('1\\text{ ft}=0.3048\\text{ m}') + ' gives ' + t('1\\text{ ft}^2=0.3048^2\\text{ m}^2') + ' and ' + t('1\\text{ ft}^3=0.3048^3\\text{ m}^3') + '. Every length is multiplied by ' + t('k') + ' either way.', ['Look at the exponents of ' + t('r') + ' in the formulas.'], 'k² and k³');
        } },
        { id: 'e15d', sub: 'd', level: 'PRG', make: function (r) {
          var k = r.pick([3, 2, 4, 5, 10]), V = k * k * k;
          return K.P.fields('A sphere’s volume is multiplied by ' + t(F(V)) + '. By what factor was its radius multiplied, and by what factor its surface area?', [{ label: 'radius factor', name: 'radius factor' }, { label: 'SA factor', name: 'SA factor' }],
            [intField(k, [A(V / 3, 'scale-cube', 'Volume grows by ' + t('k^3') + '. Undo the cube with a <b>cube root</b>, not by dividing by 3.'), A(Math.sqrt(V), 'scale-cube', 'Volume grows by ' + t('k^3') + ': take the <b>cube</b> root.')]),
              intField(k * k, [A(k, 'scale-sq', 'Surface area grows by ' + t('k^2') + ': square the radius factor.'), A(V, 'scale-sq', 'Surface area grows by ' + t('k^2') + ', not ' + t('k^3') + '.'), A(V / 3, 'scale-sq', 'Find the radius factor first, then square it.')])],
            [String(k), String(k * k)], 'radius ' + t('\\times ' + k) + ', SA ' + t('\\times ' + k * k),
            t('k^3=' + F(V) + '\\Rightarrow k=\\sqrt[3]{' + F(V) + '}=' + k) + '; then the surface area is multiplied by ' + t('k^2=' + k * k) + '.', ['Volume factor ' + t('=k^3') + '. Find ' + t('k') + ', then square it.'], 'scale backwards V×' + V);
        } }] },
      { num: '16', stem: function (sh) { return 'A chocolate truffle has a diameter of ' + t(D(sh.d, 1)) + ' cm. A giant display truffle has a diameter of ' + t(D(sh.d * sh.k, 1)) + ' cm.'; },
        shared: function (r) { return { d: r.pick([5, 4, 6, 3]), k: r.pick([3, 2, 4]) }; }, parts: [
        { id: 'e16a', sub: 'a', level: 'EMG', make: function (r, sh) {
          var k = sh.k;
          return intP('Using the scaling rule alone — no volume formula — how many ordinary truffles’ worth of chocolate does the display truffle contain?', k * k * k, [A(k, 'scale-cube', 'Chocolate is a <b>volume</b>: the factor is cubed, ' + t(k + '^3') + '.'), A(k * k, 'scale-cube', 'That’s the factor for a surface. Volume uses ' + t(k + '^3') + '.')],
            t('\\frac{' + D(sh.d * k) + '}{' + D(sh.d) + '}=' + k) + ', so volume scales by ' + t(k + '^3=' + k * k * k) + '.', ['How many times larger is each length? Cube that for volume.'], 'truffle chocolate factor');
        } },
        { id: 'e16b', sub: 'b', level: 'EMG', make: function (r, sh) {
          var a = sh.d / 2, b = sh.d * sh.k / 2, v1 = 4 / 3 * PI * a * a * a, v2 = 4 / 3 * PI * b * b * b;
          return K.P.fields('Verify by computing both volumes to the nearest tenth.', [{ label: 'ordinary', name: 'ordinary', after: 'cm³' }, { label: 'display', name: 'display', after: 'cm³' }], [K.near(v1, 1, { alts: vAlts(a, 'd') }), K.near(v2, 1, { alts: vAlts(b, 'd') })],
            [RT(v1, 1).toFixed(1), RT(v2, 1).toFixed(1)], t(D(RT(v1, 1), 1)) + ' cm³ and ' + t(D(RT(v2, 1), 1)) + ' cm³',
            t('\\frac{4}{3}\\pi(' + D(a) + ')^3=' + piT(4 / 3 * a * a * a) + '\\approx ' + D(RT(v1, 1), 1)) + ' cm³; ' + t('\\frac{4}{3}\\pi(' + D(b) + ')^3=' + piT(4 / 3 * b * b * b) + '\\approx ' + D(RT(v2, 1), 1)) + ' cm³. Ratio: ' + t(Math.pow(sh.k, 3)) + ' ✓', ['Halve each diameter first.'], 'truffle volumes');
        } },
        { id: 'e16c', sub: 'c', level: 'EMG', make: function (r, sh) {
          var k = sh.k;
          return intP('The truffles are coated in foil. How many times as much foil does the display truffle need?', k * k, [A(k * k * k, 'scale-sq', 'Foil covers a <b>surface</b>: the factor is squared, ' + t(k + '^2') + '.'), A(k, 'scale-sq', 'Area scales by the square of the length factor: ' + t(k + '^2') + '.')],
            'Foil is a surface: ' + t(k + '^2=' + k * k) + ' times as much (check: ' + t('\\frac{4\\pi(' + D(sh.d * k / 2) + ')^2}{4\\pi(' + D(sh.d / 2) + ')^2}=' + k * k) + '). The big truffle has ' + t(k * k * k) + ' times the chocolate but only ' + t(k * k) + ' times the foil.', ['Square the length factor for an area.'], 'truffle foil factor');
        } }] },
      /* ---------- Part G ---------- */
      { num: '17', section: 'Extra practice G — Capacity, packing, and displacement', stem: function (sh) { return 'A spherical water tank has a diameter of ' + t(D(sh.d, 1)) + ' m.'; },
        shared: function (r) { return { d: r.pick([3.6, 3, 4.2, 2.4, 4.8]), u: r.pick([310, 250, 400, 280, 350]) }; }, parts: [
        { id: 'e17a', sub: 'a', level: 'EMG', make: function (r, sh) { return sphereV('Determine the tank’s volume, to the nearest hundredth of a cubic metre.', sh.d / 2, 'd', U('m'), 2, 'tank V d=' + sh.d); } },
        { id: 'e17b', sub: 'b', level: 'PRG', make: function (r, sh) {
          var rr = sh.d / 2, V = 4 / 3 * PI * rr * rr * rr, x = V * 1000;
          return nearP('Report the tank’s capacity in litres, to the nearest litre. (' + t('1\\text{ m}^3=1000\\text{ L}') + ')', x, 0, 'L', [A(RT(V, 2) * 1000, 'early-round', 'Multiply the <b>unrounded</b> volume by ' + t('1000') + '.'), A(V * 100, 'unit-conv', t('1\\text{ m}^3=1000\\text{ L}') + '.'), A(V, 'no-convert', 'Convert: ' + t('1\\text{ m}^3=1000\\text{ L}') + '.'), A(8000 * V, 'd-as-r', H.dr)],
            t('V=\\frac{4}{3}\\pi(' + D(rr) + ')^3=' + piT(4 / 3 * rr * rr * rr) + '\\text{ m}^3') + '<br>' + t(piT(4 / 3 * rr * rr * rr) + '\\times 1000=' + piT(4000 / 3 * rr * rr * rr) + '\\approx ' + D(RT(x, 0), 0)) + ' L',
            ['Multiply cubic metres by ' + t('1000') + ' to get litres (use the unrounded volume).'], 'tank litres');
        } },
        { id: 'e17c', sub: 'c', level: 'PRG', make: function (r, sh) {
          var rr = sh.d / 2, L = 4000 / 3 * PI * rr * rr * rr, days = L / sh.u, ans = Math.floor(days);
          return intP('A household draws ' + t(sh.u) + ' L per day. For how many <b>whole</b> days does one full tank last?', ans, [A(Math.ceil(days), 'round-up', 'On the last of those days there isn’t a full day’s water left. Round <b>down</b>: only whole days count.'), A(Math.floor(days / 1000), 'no-convert', 'Use the capacity in <b>litres</b>.')],
            t('\\frac{' + D(RT(L, 2), 2) + '\\text{ L}}{' + sh.u + '\\text{ L/day}}\\approx ' + D(RT(days, 3), 3)) + ' days, so the tank lasts <b>' + ans + '</b> whole days. The leftover fraction is not a full day’s supply, so round down.', ['Divide the capacity in litres by the daily use.', 'Only <b>whole</b> days count.'], 'tank days', 'days');
        } }] },
      { num: '18', stem: function (sh) { return 'Spherical scoops of ice cream ' + t(D(sh.s, 1)) + ' cm in diameter are packed into a cylindrical tub of diameter ' + t(D(sh.D, 1)) + ' cm and height ' + t(D(sh.H, 1)) + ' cm. Assume the ice cream is pressed down so no air is trapped: this is purely a comparison of volumes.'; },
        shared: function (r) {
          for (var i = 0; i < 200; i++) { var o = { s: r.pick([6, 5, 4, 8]), D: r.pick([15, 12, 18, 20]), H: r.pick([12, 10, 15]) }; var q = (o.D * o.D / 4 * o.H) / (4 / 3 * Math.pow(o.s / 2, 3)), f = q - Math.floor(q); if (q >= 4 && q <= 200 && f > 0.15 && f < 0.85) return o; }
          return { s: 6, D: 15, H: 12 };
        }, parts: [
        { id: 'e18a', sub: 'a i', level: 'PRG', make: function (r, sh) {
          var ct = sh.D * sh.D / 4 * sh.H, cs = 4 / 3 * Math.pow(sh.s / 2, 3), q = ct / cs, ans = Math.floor(q);
          return intP('How many <b>whole</b> scoops does the tub hold?', ans, [A(Math.ceil(q), 'round-up', 'The last part-scoop doesn’t make a whole scoop. Round <b>down</b>.'), A(Math.floor(q / 8), 'd-as-r', 'The scoop’s ' + t(D(sh.s, 1)) + ' cm is a <b>diameter</b>.'), A(Math.floor(4 * q), 'jar-d', 'The tub’s ' + t(D(sh.D, 1)) + ' cm is a <b>diameter</b>.')],
            'Tub: ' + t('\\pi(' + D(sh.D / 2) + ')^2(' + D(sh.H) + ')=' + piT(ct)) + ' cm³. Scoop: ' + t('\\frac{4}{3}\\pi(' + D(sh.s / 2) + ')^3=' + piT(cs)) + ' cm³.<br>' + t('\\frac{' + piT(ct) + '}{' + piT(cs) + '}=' + D(RT(q, 4))) + ', so <b>' + ans + '</b> whole scoops.', ['Divide the tub’s volume by one scoop’s volume.', 'Only whole scoops count.'], 'scoops in tub', 'scoops');
        } },
        { id: 'e18a2', sub: 'a ii', level: 'PRG', make: function (r, sh) {
          var ct = sh.D * sh.D / 4 * sh.H, cs = 4 / 3 * Math.pow(sh.s / 2, 3), n = Math.floor(ct / cs), x = PI * (ct - n * cs);
          return nearP('State the volume left over after the whole scoops, to the nearest tenth of a cubic centimetre.', x, 1, 'cm³', [A(PI * ((n + 1) * cs - ct), 'round-up', 'Leftover = tub − (whole scoops × one scoop).'), A(ct - n * cs, 'pi-symbol', 'Multiply by ' + t('\\pi') + ' for the decimal value.'), A(PI * cs, 'part-missing', 'That’s one scoop. Leftover = tub − ' + n + ' scoops.')],
            t(piT(ct) + '-' + n + '(' + piT(cs) + ')=' + piT(ct - n * cs) + '\\approx ' + D(RT(x, 1), 1)) + ' cm³', ['Tub volume minus the whole scoops’ volume.'], 'scoop leftover');
        } },
        { id: 'e18b', sub: 'b', level: 'EMG', make: function (r) {
          return mcP(r, 'The whole number of scoops needed no decimal for ' + t('\\pi') + '. Why?', [
            { html: 'Both volumes are ' + t('\\pi') + ' × a number, so ' + t('\\pi') + ' cancels when you divide one by the other.', right: true },
            { html: 'Because ' + t('\\pi') + ' rounds to 3.', why: 'No rounding happened: ' + t('\\pi') + ' cancels exactly.' },
            { html: 'Because ice cream is measured in mL.', why: 'Units don’t remove ' + t('\\pi') + '; dividing two (number)' + t('\\pi') + ' volumes does.' },
            { html: 'Because a cylinder and a sphere have the same formula.', why: 'They don’t — but both formulas contain the factor ' + t('\\pi') + '.' }],
            'Comparing two volumes of the same kind cancels every common factor, ' + t('\\pi') + ' included. Only the leftover volume, which is reported, needs a decimal.', ['Write the ratio of the two volumes.'], 'π cancels in packing');
        } }] },
      { num: '19', stem: function (sh) { return 'A cylindrical jar of diameter ' + t(D(sh.D, 1)) + ' cm contains water to a depth of ' + t(D(sh.h, 1)) + ' cm. A solid steel ball of diameter ' + t(D(sh.d, 1)) + ' cm is lowered in and comes to rest on the bottom, completely below the surface. No water is spilled.' + FIG.jar({ inside: true, wf: 0.62, br: sh.d / sh.D, DLab: 'd = ' + D(sh.D, 1) + ' cm', depthLab: D(sh.h, 1) + ' cm', ballLab: 'ball d = ' + D(sh.d, 1) + ' cm' }); },
        shared: function (r) { for (var i = 0; i < 200; i++) { var o = { D: r.pick([14, 12, 16, 10]), h: r.pick([10, 9, 12]), d: r.pick([9, 8, 6, 7]) }; if (o.d <= o.D - 3 && o.d < o.h) return o; } return { D: 14, h: 10, d: 9 }; }, parts: [
        { id: 'e19a', sub: 'a', level: 'PRG', make: function (r, sh) {
          var R = sh.D / 2, rb = sh.d / 2, x = 4 * rb * rb * rb / (3 * R * R);
          return nearP('Determine the rise in the water level, to the nearest tenth of a centimetre.', x, 1, 'cm', [A(8 * x, 'd-as-r', 'The ball’s ' + t(D(sh.d, 1)) + ' cm is a <b>diameter</b>.'), A(x / 4, 'jar-d', 'The jar’s ' + t(D(sh.D, 1)) + ' cm is a <b>diameter</b>: its radius is ' + t(D(R)) + ' cm.'), A(sh.h + x, 'rise-only', 'That’s the new depth. The question asks for the <b>rise</b>.'), A(x / 2, 'hemi-whole', 'The whole ball is under water: use ' + t('\\frac{4}{3}\\pi r^3') + '.')],
            'Ball ' + t('r=' + D(rb)) + ' cm; jar ' + t('R=' + D(R)) + ' cm.<br>' + t('\\pi(' + D(R) + ')^2\\,\\Delta h=\\frac{4}{3}\\pi(' + D(rb) + ')^3\\ \\Rightarrow\\ ' + D(R * R) + '\\Delta h=' + D(4 / 3 * rb * rb * rb)) + '<br>' + t('\\Delta h\\approx ' + D(RT(x, 4), 4) + '\\approx ' + D(RT(x, 1), 1)) + ' cm',
            ['The ball’s volume becomes a cylindrical slab of water with the jar’s radius.', t('\\pi R^2\\,\\Delta h=\\frac{4}{3}\\pi r^3') + '.'], 'rise in jar');
        } },
        { id: 'e19b', sub: 'b', level: 'ADV', make: function (r, sh) {
          var num = 2 * sh.d * sh.d * sh.d, den = 3 * sh.D * sh.D, g = HW.ex.gcd(num, den);
          return K.P.fraction('The ' + t('\\pi') + ' cancels before any arithmetic happens. State the <b>exact</b> rise as a fraction (in cm).', [num / g, den / g], {},
            t('\\Delta h=\\frac{\\frac{4}{3}\\pi r^3}{\\pi R^2}=\\frac{4r^3}{3R^2}=\\frac{4(' + D(sh.d / 2) + ')^3}{3(' + D(sh.D / 2) + ')^2}=\\frac{' + num / g + '}{' + den / g + '}') + ' cm',
            ['Write ' + t('\\Delta h=\\frac{\\frac{4}{3}\\pi r^3}{\\pi R^2}') + ', cancel ' + t('\\pi') + ', then simplify the fraction.', 'Clear the decimals: multiply the top and bottom by a power of 10 (or 8 and 4).'], 'exact rise');
        } },
        { id: 'e19c', sub: 'c', level: 'EMG', make: function (r, sh) {
          var R = sh.D / 2, rb = sh.d / 2, rise = 4 * rb * rb * rb / (3 * R * R), x = sh.h + rise;
          return nearP('State the new depth to the nearest tenth. (Then compare it with the ball’s diameter to confirm the ball is submerged.)', x, 1, 'cm', [A(rise, 'rise-only', 'Add the rise to the original depth.'), A(sh.h + 8 * rise, 'd-as-r', H.dr), A(sh.h + rise / 4, 'jar-d', 'Use the jar’s radius, ' + t(D(R)) + ' cm.')],
            'New depth ' + t('=' + D(sh.h) + '+' + D(RT(rise, 4), 4) + '\\approx ' + D(RT(x, 1), 1)) + ' cm. The top of the ball is ' + t(D(sh.d)) + ' cm above the base, and ' + t(D(RT(x, 1), 1) + '>' + D(sh.d)) + ', so the ball is fully submerged ✓',
            ['New depth = old depth + rise.'], 'new depth');
        } }] },
      /* ---------- Part H ---------- */
      { num: '20', section: 'Extra practice H — Error analysis: three students, three different failures', stem: function (sh) { return 'A solid sphere has a diameter of ' + t(D(sh.d, 1)) + ' cm. <b>Devon</b> wrote ' + t('V=\\frac{4}{3}\\pi(' + D(sh.d, 1) + ')^3=' + D(RT(4 / 3 * PI * Math.pow(sh.d, 3), 1), 1)) + ' cm³.'; },
        shared: function (r) { return { d: r.pick([16, 12, 14, 18, 10]) }; }, parts: [
        { id: 'e20a', sub: 'a i', level: 'BEG', make: function (r) {
          return mcP(r, 'What is Devon’s error?', [
            { html: 'He used the diameter in place of the radius.', right: true }, { html: 'He used the surface-area formula.', why: 'The formula ' + t('\\frac{4}{3}\\pi r^3') + ' is the right one — look at the number he put in it.' },
            { html: 'He forgot the ' + t('\\frac{4}{3}') + '.', why: 'The ' + t('\\frac{4}{3}') + ' is there. Check the number inside the brackets.' }, { html: 'He should have squared instead of cubing.', why: 'Volume does use ' + t('r^3') + '. The problem is which length he cubed.' }],
            'He substituted the diameter for ' + t('r') + '.', ['Is the number in the brackets a radius?'], 'Devon’s error');
        } },
        { id: 'e20a2', sub: 'a ii', level: 'EMG', make: function (r, sh) { return sphereV('Give the correct volume to the nearest tenth of a cubic centimetre.', sh.d / 2, 'd', U('cm'), 1, 'correct V d=' + sh.d); } },
        { id: 'e20a3', sub: 'a iii', level: 'EMG', make: function () {
          return intP('Devon’s answer is how many times the correct answer?', 8, [A(2, 'factor-2', 'He doubled ' + t('r') + ', and ' + t('r') + ' is <b>cubed</b>: ' + t('2^3') + '.'), A(4, 'factor-sq', 'Volume uses ' + t('r^3') + ': the factor is ' + t('2^3') + ', not ' + t('2^2') + '.')],
            'Devon doubled the radius; ' + t('r') + ' is cubed, so his answer is ' + t('2^3=8') + ' times too large.', ['Divide his answer by yours.'], 'Devon factor');
        } },
        { id: 'e20b', sub: 'b i', level: 'BEG', make: function (r, sh) {
          return intP('The sphere fits exactly inside a cube of edge ' + t(D(sh.d, 1)) + ' cm. Compute that cube’s volume.', sh.d * sh.d * sh.d, [A(sh.d * sh.d, 'v-r2', 'A cube’s volume is ' + t('s^3') + '.'), A(6 * sh.d * sh.d, 'cube-sa', 'That’s the cube’s surface area. Volume is ' + t('s^3') + '.')],
            t('V=' + D(sh.d) + '^3=' + F(sh.d * sh.d * sh.d)) + ' cm³', ['Use ' + t('V=s^3') + '.'], 'cube volume', 'cm³');
        } },
        { id: 'e20b2', sub: 'b ii', level: 'EMG', make: function (r, sh) {
          return mcP(r, 'Which reasonableness check kills Devon’s answer on sight?', [
            { html: 'A sphere fits inside the cube of its diameter, so its volume must be less than ' + t(F(sh.d * sh.d * sh.d)) + ' cm³ (about 52% of it).', right: true },
            { html: 'A volume should always be bigger than the diameter.', why: 'That is true of Devon’s answer too, so it can’t catch his error.' },
            { html: 'The answer should have one decimal place.', why: 'Devon’s answer does — the problem is its size.' },
            { html: 'The answer should be close to ' + t('4\\pi r^2') + '.', why: 'Volume and surface area are different quantities with different units.' }],
            'The sphere is inside the cube, so ' + t('V_{\\text{sphere}}<' + F(sh.d * sh.d * sh.d)) + ' cm³. Devon’s ' + t(D(RT(4 / 3 * PI * Math.pow(sh.d, 3), 1), 1)) + ' cm³ is more than four times that.', ['Can a sphere be bigger than the box it fits in?'], 'reasonableness check');
        } },
        { id: 'e20c', sub: 'c', level: 'EMG', make: function (r, sh) {
          var rr = sh.d / 2;
          return mcP(r, '<b>Fern</b> halved the diameter correctly but then wrote ' + t('V=\\frac{4}{3}\\pi(' + D(rr, 1) + ')^2=' + D(RT(4 / 3 * PI * rr * rr, 1), 1)) + ' cm³. What is her error, and what unit does her expression really produce?', [
            { html: 'She squared ' + t('r') + ' instead of cubing it; her expression multiplies two lengths, so it gives cm² (an area).', right: true },
            { html: 'She forgot the ' + t('\\frac{4}{3}') + '; her answer is in cm³.', why: 'The ' + t('\\frac{4}{3}') + ' is there. Look at the exponent.' },
            { html: 'She used the diameter; her answer is in cm³.', why: 'She halved correctly. Look at the exponent — and count the lengths being multiplied.' },
            { html: 'She squared ' + t('r') + ' instead of cubing it; the unit is still cm³.', why: t('(\\text{cm})^2') + ' is cm². A volume needs three lengths multiplied.' }],
            'Wrong exponent: the volume needs ' + t('r^3') + '. ' + t('\\frac{4}{3}\\pi(' + D(rr) + '\\text{ cm})^2') + ' is in cm² — a volume must multiply three lengths, so the unit alone convicts her. Correct: ' + t(D(RT(4 / 3 * PI * rr * rr * rr, 1), 1)) + ' cm³.', ['Count the lengths multiplied in her expression.'], 'Fern’s error');
        } },
        { id: 'e20d', sub: 'd i', level: 'BEG', make: function (r, sh) {
          var rr = sh.d / 2;
          return mcP(r, '<b>Idris</b> was asked for the area of a hemispherical dome of diameter ' + t(D(sh.d, 1)) + ' cm built <b>with no floor</b>, and answered ' + t('3\\pi r^2=' + D(RT(3 * PI * rr * rr, 1), 1)) + ' cm². What is his error?', [
            { html: 'He counted the flat circular base, which the wording excludes.', right: true }, { html: 'He used the diameter as the radius.', why: 'Check: ' + t('3\\pi(' + D(rr) + ')^2=' + D(RT(3 * PI * rr * rr, 1), 1)) + ' — he used the radius.' },
            { html: '' + t('3\\pi r^2') + ' is never a correct formula.', why: 'It is right for a hemisphere <i>with</i> its base — just not for this question.' }, { html: 'He should have used ' + t('4\\pi r^2') + '.', why: 'That’s a whole sphere. A dome is half a sphere.' }],
            '“No floor” leaves only the curved surface, ' + t('2\\pi r^2') + '. ' + t('3\\pi r^2') + ' answers a different question. Only rereading the wording catches this one.', ['What does “with no floor” remove?'], 'Idris’s error');
        } },
        { id: 'e20d2', sub: 'd ii', level: 'EMG', make: function (r, sh) { return hemiSA('Give the correct area of Idris’s dome to the nearest tenth.', sh.d / 2, 'd', U('cm'), 1, false, 'No floor: curved surface only.', 'dome correct SA'); } },
        { id: 'e20d3', sub: 'd iii', level: 'EMG', make: function (r, sh) {
          var rr = sh.d / 2, x = PI * rr * rr;
          return nearP('Exactly how much area did Idris wrongly include? (Nearest tenth.)', x, 1, 'cm²', [A(2 * x, 'hemi-base', 'He included only the flat base, ' + t('\\pi r^2') + '.'), A(4 * x, 'd-as-r', H.dr)],
            'The base: ' + t('\\pi r^2=\\pi(' + D(rr) + ')^2=' + piT(rr * rr) + '\\approx ' + D(RT(x, 1), 1)) + ' cm²', ['The extra piece is the flat circle.'], 'wrongly included');
        } }] },
      /* ---------- Part I ---------- */
      { num: '21', section: 'Extra practice I — Stretch: the largest sphere that fits', stem: function (sh) { return 'The largest possible sphere is placed inside each container: <b>(a)</b> a cube of edge ' + t(D(sh.s, 1)) + ' cm; <b>(b)</b> a cylinder of diameter ' + t(D(sh.s, 1)) + ' cm and height ' + t(D(sh.s, 1)) + ' cm; <b>(c)</b> a cylinder of diameter ' + t(D(sh.s, 1)) + ' cm and height ' + t(D(sh.H, 1)) + ' cm.'; },
        shared: function (r) { return r.pick([{ s: 12, H: 20 }, { s: 10, H: 15 }, { s: 6, H: 10 }, { s: 8, H: 12 }, { s: 12, H: 18 }, { s: 9, H: 15 }]); }, parts: [
        { id: 'e21a', sub: 'a', level: 'PRG', make: function (r, sh) {
          var x = PI / 6 * 100;
          return K.P.fields('(a) The cube: state the sphere’s radius, and the percentage of the cube it occupies (nearest tenth).' + FIG.cubeBall({ sLab: D(sh.s, 1) + ' cm' }), [{ label: 'radius', name: 'radius', after: 'cm' }, { label: 'percent', name: 'percent', after: '%' }],
            [K.near(sh.s / 2, 1, { alts: [A(sh.s, 'd-as-r', 'The sphere’s <b>diameter</b> equals the edge; the radius is half of it.')] }), K.near(x, 1, { alts: [A(200 / 3, 'third', 'That’s the cylinder’s fraction. For the cube: ' + t('\\frac{\\frac{4}{3}\\pi r^3}{s^3}') + '.'), A(x / 100, 'no-convert', 'Give a percentage: multiply by 100.'), A(8 * x, 'd-as-r', H.dr)] })],
            [D(sh.s / 2, 1), RT(x, 1).toFixed(1)], t('r=' + D(sh.s / 2, 1)) + ' cm, ' + t('52.4\\%'),
            t('r=' + D(sh.s / 2)) + ' cm. ' + t('V_{\\text{cube}}=' + F(sh.s * sh.s * sh.s)) + ', ' + t('V_{\\text{sphere}}=\\frac{4}{3}\\pi(' + D(sh.s / 2) + ')^3=' + piT(4 / 3 * Math.pow(sh.s / 2, 3))) + '.<br>' + t('\\frac{' + piT(4 / 3 * Math.pow(sh.s / 2, 3)) + '}{' + F(sh.s * sh.s * sh.s) + '}=\\frac{\\pi}{6}\\approx 52.4\\%'),
            ['The sphere’s diameter is the cube’s edge.', 'Fraction = sphere volume ÷ cube volume.'], 'sphere in cube %');
        } },
        { id: 'e21b', sub: 'b', level: 'EMG', make: function (r, sh) {
          return K.P.fields('(b) The cylinder with height ' + t(D(sh.s, 1)) + ' cm: what fraction of it does the sphere occupy (exact), and what percentage (nearest tenth)?' + FIG.sphereCyl({ hr: 1, rLab: 'r = ' + D(sh.s / 2, 1) + ' cm', hLab: D(sh.s, 1) + ' cm' }), [{ label: 'fraction', name: 'fraction', mode: 'math', keys: 'fraction' }, { label: 'percent', name: 'percent', after: '%' }],
            [K.fraction([2, 3]), K.near(200 / 3, 1, { alts: [A(100 / 3, 'third', 'The sphere fills two thirds; the gap is one third.'), A(PI / 6 * 100, 'third', 'That’s the cube’s fraction.')] })], ['\\frac{2}{3}', '66.7'], t('\\frac{2}{3}') + ', ' + t('66.7\\%'),
            'This is the snug cylinder of Part A (' + t('h=2r') + '): ' + t('\\frac{\\frac{4}{3}\\pi r^3}{2\\pi r^3}=\\frac{2}{3}\\approx 66.7\\%') + '.', ['Is this the cylinder that just contains the sphere?'], 'sphere in snug cylinder');
        } },
        { id: 'e21c', sub: 'c', level: 'PRG', make: function (r, sh) {
          var num = 2 * sh.s, den = 3 * sh.H, g = HW.ex.gcd(num, den), x = num / den * 100;
          return K.P.fields('(c) The cylinder with height ' + t(D(sh.H, 1)) + ' cm: what fraction of it does the sphere occupy (exact), and what percentage (nearest tenth)?' + FIG.sphereCyl({ hr: Math.min(2, sh.H / sh.s), rLab: 'r = ' + D(sh.s / 2, 1) + ' cm', hLab: D(sh.H, 1) + ' cm' }), [{ label: 'fraction', name: 'fraction', mode: 'math', keys: 'fraction' }, { label: 'percent', name: 'percent', after: '%' }],
            [K.fraction([num / g, den / g], { diag: function (v) { return Math.abs(v - 2 / 3) < 1e-9 ? { code: 'third', hint: 'Two thirds is only for the cylinder with ' + t('h=2r') + '. This one is taller.' } : null; } }), K.near(x, 1, { alts: [A(200 / 3, 'third', 'This cylinder is taller than ' + t('2r') + ', so the sphere fills less than two thirds.')] })],
            ['\\frac{' + num / g + '}{' + den / g + '}', RT(x, 1).toFixed(1)], t('\\frac{' + num / g + '}{' + den / g + '}') + ', ' + t(D(RT(x, 1), 1) + '\\%'),
            'The sphere still has ' + t('r=' + D(sh.s / 2)) + ' cm (limited by the diameter).<br>' + t('V_{\\text{cyl}}=\\pi(' + D(sh.s / 2) + ')^2(' + D(sh.H) + ')=' + piT(sh.s * sh.s / 4 * sh.H)) + ', ' + t('V_{\\text{sphere}}=' + piT(4 / 3 * Math.pow(sh.s / 2, 3))) + '<br>' + t('\\frac{' + piT(4 / 3 * Math.pow(sh.s / 2, 3)) + '}{' + piT(sh.s * sh.s / 4 * sh.H) + '}=\\frac{' + num / g + '}{' + den / g + '}\\approx ' + D(RT(x, 1), 1) + '\\%'),
            ['The sphere can’t grow past the cylinder’s diameter.', 'Divide the two volumes; ' + t('\\pi') + ' cancels.'], 'sphere in tall cylinder');
        } },
        { id: 'e21d', sub: 'd', level: 'ADV', make: function () {
          return symP('Show that for a cube of <b>any</b> edge ' + t('s') + ' the fraction in (a) is always the same. Write that exact fraction.', '\\frac{\\pi}{6}', ['s'], { maxNums: 2, good: ['\\frac{1}{6}\\pi'], diags: [{ tex: '\\frac{2}{3}', code: 'third', hint: 'Two thirds is the snug <b>cylinder</b>. For the cube, use ' + t('r=\\frac{s}{2}') + ' in ' + t('\\frac{\\frac{4}{3}\\pi r^3}{s^3}') + '.' }, { tex: '\\frac{4\\pi}{3}', code: 'd-as-r', hint: 'The radius is ' + t('\\frac{s}{2}') + ', not ' + t('s') + '.' }, { tex: '\\frac{\\pi}{8}', code: 'v-no-43', hint: 'Keep the ' + t('\\frac{4}{3}') + ': ' + t('\\frac{4}{3}\\cdot\\frac{1}{8}=\\frac{1}{6}') + '.' }] },
            t('r=\\frac{s}{2}') + ': ' + t('V_{\\text{sphere}}=\\frac{4}{3}\\pi\\frac{s^3}{8}=\\frac{\\pi s^3}{6}') + ', so ' + t('\\frac{V_{\\text{sphere}}}{V_{\\text{cube}}}=\\frac{\\pi s^3/6}{s^3}=\\frac{\\pi}{6}') + ' — the ' + t('s^3') + ' cancels.', ['Use ' + t('r=\\frac{s}{2}') + ' and divide by ' + t('s^3') + '.'], 'π/6 for any cube');
        } },
        { id: 'e21e', sub: 'e', level: 'EMG', make: function (r, sh) {
          var g = HW.ex.gcd(2 * sh.s, 3 * sh.H), fc = '\\frac{' + 2 * sh.s / g + '}{' + 3 * sh.H / g + '}';
          return K.P.order(r, 'Rank the three containers from best fit (largest fraction filled) to worst.', [{ id: 'b', html: '(b) cylinder, ' + t('h=' + D(sh.s, 1)) + ': ' + t('\\frac{2}{3}') }, { id: 'a', html: '(a) cube: ' + t('\\frac{\\pi}{6}') }, { id: 'c', html: '(c) cylinder, ' + t('h=' + D(sh.H, 1)) + ': ' + t(fc) }],
            { first: 'best fit', last: 'worst fit', why: function () { return 'Compare the fractions as percentages: ' + t('66.7\\%') + ', ' + t('52.4\\%') + ', ' + t(D(RT(200 * sh.s / (3 * sh.H), 1), 1) + '\\%') + '.'; } },
            '(b) ' + t('66.7\\%') + ', (a) ' + t('52.4\\%') + ', (c) ' + t(D(RT(200 * sh.s / (3 * sh.H), 1), 1) + '\\%') + '. A taller cylinder only adds empty space: the sphere can’t grow past the diameter. The best cylinder is the snug one with ' + t('h=2r') + ' — two thirds is the most a sphere can fill.', ['Turn each fraction into a percentage.'], 'rank the fits');
        } }] }
    ]
  });

  /* ---------- makers that need the helpers above ---------- */
  function moonP(sh, what) {
    var d = sh.dm, r = d / 2, u = U('km');
    var x = what === 'V' ? 4 / 3 * PI * r * r * r : 4 * PI * r * r, alts = what === 'V' ? vAlts(r, 'd') : saAlts(r, 'd');
    var p = K.P.sci('the ' + (what === 'V' ? '<b>volume</b>' : '<b>surface area</b>') + ' of a (fictional) spherical moon named ' + sh.moon + ', with a diameter of ' + t(F(d)) + ' km. Write it in scientific notation, with the number in front rounded to the nearest tenth.' + solid('sphere', { d: 'd = ' + F(d, true) + ' km', width: 230 }), x,
      { sig: 2, diag: function (v) { for (var i = 0; i < alts.length; i++) if (Number(v.toPrecision(2)) === Number(alts[i].v.toPrecision(2))) return { code: alts[i].code, hint: alts[i].hint }; return null; } },
      t('r=' + F(d) + '\\div 2=' + F(r)) + ' km<br>' + (what === 'V' ? t('V=\\frac{4}{3}\\pi(' + F(r) + ')^3=' + K.sciTex(4 / 3 * PI * r * r * r, 6) + '\\approx ' + K.sciTex(x, 2) + u.tv) : t('SA=4\\pi(' + F(r) + ')^2=' + K.sciTex(x, 6) + '\\approx ' + K.sciTex(x, 2) + u.ta)),
      ['Halve the diameter first.', what === 'V' ? 'Use ' + t('V=\\frac{4}{3}\\pi r^3') + ', then write the result as ' + t('a\\times 10^{n}') + '.' : 'Use ' + t('SA=4\\pi r^2') + ', then write the result as ' + t('a\\times 10^{n}') + '.'], 'moon ' + what + ' d=' + d);
    p.input.after = what === 'V' ? 'km³' : 'km²'; p.answer = t(K.sciTex(x, 2)) + ' ' + p.input.after;
    var seen = {}; seen[K.sciTex(x, 2)] = 1;
    p.bad = alts.map(function (a) { return K.sciTex(a.v, 2); }).filter(function (s) { if (seen[s]) return false; seen[s] = 1; return true; });
    return p;
  }
  function solveR(hemi, mode) {
    var k = hemi ? 2 : 4, fr = '\\frac{3V}{' + k + '\\pi}', rad = '\\sqrt[3]{' + fr + '}', pow = '\\left(' + fr + '\\right)^{\\frac{1}{3}}';
    var target = mode === 'power' ? pow : rad;
    var p = symP('Solve the equation ' + t('V=\\frac{' + (hemi ? 2 : 4) + '}{3}\\pi r^3') + ' for ' + t('r') + '. Write the answer as ' + (mode === 'power' ? 'a <b>power</b> (rational exponent).' : 'a <b>radical</b>.'), target, ['V'],
      { form: mode === 'either' ? null : mode, maxNums: mode === 'either' ? ex.shape(ex.parse(pow).ast).nums : null, before: t('r='), lhs: 'r=', good: mode === 'power' ? ['(3V/(' + k + '\\pi))^{1/3}'] : [], diags: [
        { tex: fr, code: 'no-cbrt', hint: 'That’s ' + t('r^3') + '. Take the cube root to get ' + t('r') + '.' },
        { tex: '\\sqrt{' + fr + '}', code: 'sqrt-for-cbrt', hint: H.sqrtCbrt },
        { tex: '\\sqrt[3]{\\frac{' + k + 'V}{3\\pi}}', code: 'v-43-flip', hint: 'To undo ' + t('\\times\\frac{' + k + '}{3}') + ', multiply both sides by ' + t('3') + ' and divide by ' + t(k + '\\pi') + ': ' + t('r^3=' + fr) + '.' },
        { tex: '\\sqrt[3]{\\frac{' + k + '\\pi}{3V}}', code: 'flip', hint: 'Your fraction is upside down: ' + t('r^3=' + fr) + '.' },
        { tex: '\\sqrt[3]{\\frac{3V}{' + k + '}}', code: 'v-no-43', hint: 'Divide by ' + t('\\pi') + ' too: ' + t('r^3=' + fr) + '.' },
        { tex: '\\sqrt[3]{3V-' + k + '\\pi}', code: 'v-no-43', hint: 'The ' + t('\\frac{' + k + '}{3}\\pi') + ' multiplies ' + t('r^3') + ', so <b>divide</b> by it (don’t subtract).' }] },
      t('V=\\frac{' + k + '}{3}\\pi r^3\\ \\Rightarrow\\ 3V=' + k + '\\pi r^3\\ \\Rightarrow\\ r^3=' + fr) + '<br>' + t('r=' + rad + '=' + pow),
      ['Multiply both sides by ' + t('3') + ', then divide by ' + t(k + '\\pi') + ' to isolate ' + t('r^3') + '.', 'Then take the cube root (or raise to the power ' + t('\\frac{1}{3}') + ').'], 'solve for r (' + (mode || 'radical') + ')');
    if (mode === 'either') p.good = [pow];
    return p;
  }
})(window);
