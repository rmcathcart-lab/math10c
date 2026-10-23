/* Math 10C · Unit 10 · Lesson 4 — Surface Area and Volume of Pyramids and Cones (M3)
 * Assignment questions 1–18 (u10_L04.tex) and the Lesson 4 Extra Practice (u10_EP04.tex, Parts A–H).
 * Every part is a generator: it keeps the idea and difficulty of the booklet question (the booklet's numbers are one
 * of the possible versions) and changes the numbers. Rounded answers use K.P.near (js/geom.js) with targeted
 * alternatives for the classic slips: forgot the ⅓, slant height in a volume, perpendicular height in a surface area,
 * base missing from (or added to) a surface area, diameter used as radius, full edge instead of half an edge in the
 * slant-height triangle, rounding too early. Figures: HW.solid, plus a few local SVGs for composite solids.
 * Levels: LIM BEG EMG PRG ADV MAS. */
(function (root) {
  'use strict';
  var HW = root.HW, K = HW.kit, B = K.P, ex = HW.ex, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form, F = HW.fmt;
  var PI = Math.PI;

  /* ---------------- numbers and units ---------------- */
  function nn(x) { return F(String(+(+x).toFixed(4))); }                       // 12, 4.5, 1\,500
  function d1(x) { return (+x).toFixed(1); }                                   // 6.0
  function dd(x) { return F((+x).toFixed(3)) + '\\ldots'; }                     // 1017.876…
  function rr(x, dp) { return F(K.roundTo(x, dp).toFixed(dp)); }               // rounded
  function pc(c) {                                                             // coefficient in front of π (fraction if needed)
    if (Math.abs(c - 1) < 1e-12) return '';
    if (Math.abs(c - Math.round(c)) < 1e-9) return nn(Math.round(c));
    var ds = [2, 3, 4, 6, 8, 12]; for (var i = 0; i < ds.length; i++) { var n = c * ds[i]; if (Math.abs(n - Math.round(n)) < 1e-9) return '\\tfrac{' + Math.round(n) + '}{' + ds[i] + '}'; }
    return nn(c);
  }
  function uT(u, p) { return '\\text{ ' + u + '}' + (p > 1 ? '^{' + p + '}' : ''); }
  function uP(u, p) { return u + (p === 2 ? '²' : p === 3 ? '³' : ''); }
  function hyp(a, b) { return Math.sqrt(a * a + b * b); }
  function leg(c, a) { return Math.sqrt(c * c - a * a); }
  function sqfree(m) { for (var f = 2; f * f <= m; f++) if (m % (f * f) === 0) return false; return true; }
  function simp(m) { var c = 1; for (var f = 2; f * f <= m; f++) while (m % (f * f) === 0) { m /= f * f; c *= f; } return [c, m]; }
  function radT(c, m) { return (c === 1 ? '' : c) + '\\sqrt{' + m + '}'; }

  /* Pythagorean triples [leg, leg, hypotenuse], both leg orders */
  var BASE = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [12, 35, 37], [9, 40, 41]];
  var TRIPLES = (function () { var out = []; BASE.forEach(function (b) { for (var k = 1; b[2] * k <= 120; k++) { out.push([b[0] * k, b[1] * k, b[2] * k]); out.push([b[1] * k, b[0] * k, b[2] * k]); } }); return out; })();
  function triple(r, f) { var L = TRIPLES.filter(function (x) { return f(x[0], x[1], x[2]); }); return r.pick(L); }

  /* ---------------- part builders ---------------- */
  // rounded answer with targeted alternatives; bad = the alternatives (rounded) so the test checks each is rejected
  function near(prompt, x, dp, unit, alts, sol, hints, text, opt) {
    opt = opt || {};
    alts = (alts || []).filter(function (a) { return a && isFinite(a.v) && a.v > 0; });
    var p = B.near(prompt, x, dp, { unit: unit, alts: alts, nr: opt.nr }, sol, hints, text);
    var want = K.roundTo(x, dp);
    p.answer = (opt.nr ? t(want.toFixed(dp)) : t(F(want.toFixed(dp)))) + (unit ? ' ' + unit : '');
    p.bad = alts.filter(function (a) { return Math.abs(K.roundTo(a.v, dp) - want) > 1e-9; }).map(function (a) { return K.roundTo(a.v, dp).toFixed(dp); })
      .filter(function (b) { return !opt.nr || b.length <= 4; });
    return p;
  }
  // an exact number (no rounding) with targeted alternatives
  function exact(prompt, ans, unit, alts, sol, hints, text) {
    alts = (alts || []).filter(function (a) { return a && isFinite(a.v) && Math.abs(a.v - ans) > 1e-6; });
    var chk = K.number(ans, function (v) { for (var i = 0; i < alts.length; i++) if (Math.abs(v - alts[i].v) < 1e-6 * Math.max(1, Math.abs(alts[i].v))) return { code: alts[i].code, hint: alts[i].hint }; return null; });
    var check = function (resp) {
      var res = chk(resp);
      if (res.v === 'wrong' && res.code === 'value') { var p = HW.parse.number(resp); if (p.ok && Math.abs(p.value - ans) < 0.5 && Math.abs(p.value - ans) > 1e-9 && String(p.value).indexOf('.') > 0) return form('round', 'Close — this answer comes out exactly. Check your rounding: carry full precision and the value is a whole number.'); }
      return res;
    };
    return { prompt: prompt, input: { type: 'number', after: unit }, check: check, key: String(ans), answer: t(F(ans)) + (unit ? ' ' + unit : ''),
      solution: sol, hints: hints || [], text: text, bad: alts.map(function (a) { return String(+a.v.toFixed(4)); }) };
  }
  // an exact multiple of π, written as cπ (opt.alts: [{c, code, hint}] in units of π)
  function piCheck(c, alts) {
    var T = c * PI;
    return function (resp) {
      var a = K.read(resp); if (a.res) return a.res;
      var sh = ex.shape(a.ast);
      if (Math.abs(a.val - T) < 1e-9 * Math.max(1, T)) {
        if (sh.ops || sh.divs || sh.pow || sh.roots || sh.muls > 1 || sh.paren) return form('simplify', 'Right value — now simplify it to a single multiple of ' + t('\\pi') + ', like ' + t(nn(c) + '\\pi') + '.');
        return ok();
      }
      if (!sh.pi && Math.abs(a.val - T) < 0.02 * T) return form('exact-pi', 'That’s a decimal. The question wants the <b>exact</b> value: leave ' + t('\\pi') + ' as a symbol (use the ' + t('\\pi') + ' key), e.g. ' + t('25\\pi') + '.');
      for (var i = 0; i < (alts || []).length; i++) if (Math.abs(a.val - alts[i].c * PI) < 1e-6 * Math.max(1, T)) return wrong(alts[i].code, alts[i].hint);
      return wrong('value', null);
    };
  }
  function piP(prompt, c, unit, alts, sol, hints, text) {
    var p = B.math(prompt, piCheck(c, alts), pc(c) + '\\pi', sol, hints, text, { keys: 'expr', after: unit });
    p.answer = t(pc(c) + '\\pi') + ' ' + unit;
    p.good = [nn(c).replace(/\\,/g, '') + '\\pi', nn(c).replace(/\\,/g, '') + 'π'];
    p.bad = (alts || []).filter(function (x) { return Math.abs(x.c - c) > 1e-9; }).map(function (x) { return String(+x.c.toFixed(4)) + '\\pi'; }).concat([(c * PI).toFixed(1)]);
    return p;
  }
  function mc(r, prompt, opts, sol, hints, text, keep) { return B.mc(r, prompt, opts, sol, hints, text, keep); }

  HW.addCodes({
    'no-third': 'Forgot the ⅓ (gave the prism/cylinder volume)', 'third-flip': 'Used ⅓ the wrong way (divided instead of multiplying, or vice versa)',
    'vol-slant': 'Used the slant height in a volume', 'sa-height': 'Used the perpendicular height in a surface area (slant height not found)',
    'sa-no-base': 'Left the base out of a surface area', 'extra-base': 'Counted a base the object doesn’t have', 'extra-circle': 'Counted a hidden or ground face of a composite solid',
    'diam-radius': 'Used the diameter as the radius', 'half-edge': 'Used the full base edge (not half) in the slant-height triangle', 'tri-half': 'Forgot the ½ in the area of a triangular face',
    'pyth-add': 'Pythagoras the wrong way (added for a leg / subtracted for the hypotenuse)', 'r-h-swap': 'Swapped the radius and the height', 'no-square': 'Forgot to square the radius or side',
    'one-slant': 'Used one slant height for every face of a rectangular pyramid', 'slant-swap': 'Paired each slant height with the wrong edge', 'early-round': 'Rounded an intermediate value too early',
    'no-sqrt': 'Forgot the square root at the end', 'scale-linear': 'Scaled a volume by the length factor instead of its square', 'scale-flip': 'Ratio of volumes upside down',
    'no-convert': 'Didn’t convert to the unit asked for', 'conv-linear': 'Converted a volume with the length factor (not cubed)', 'conv-square': 'Converted a volume with the squared factor',
    'conv-flip': 'Conversion factor used the wrong way', 'exact-pi': 'Gave a decimal instead of an exact multiple of π', 'copied-error': 'Repeated the student’s error',
    'half-not-third': 'Used ½ instead of ⅓ for the volume', 'cyl-third': 'Put a ⅓ in a cylinder volume', 'pct-base': 'Percent worked out from the wrong base', 'no-subtract': 'Didn’t subtract the base area first',
    'lat-total': 'Lateral area and total surface area mixed up', 'sq-diam': 'Used the diameter as the square’s edge', 'frac-linear': 'Volume fraction from the length ratio (not cubed)',
    'missing-part': 'Left out one part of a composite solid', 'cyl-wall': 'Cylinder wall not 2πrh', 'wrong-h': 'Used the wrong height for the small cone'
  });

  /* ---------------- hints for the classic slips ---------------- */
  var Hh = {
    noThirdCone: 'That’s the volume of the <b>cylinder</b> with the same base and height. A cone holds exactly ' + t('\\tfrac13') + ' of it: ' + t('V=\\tfrac13\\pi r^2h') + '.',
    noThirdPyr: 'That’s the volume of the <b>prism</b> with the same base and height. A pyramid holds exactly ' + t('\\tfrac13') + ' of it: ' + t('V=\\tfrac13 A_{\\text{Base}}h') + '.',
    volSlant: 'Volume uses the <b>perpendicular height</b> ' + t('h') + ' (apex straight down to the centre of the base), not the slant height ' + t('s') + '.',
    saHeight: 'Surface area uses the <b>slant height</b> ' + t('s') + ', not the perpendicular height. Find ' + t('s') + ' with Pythagoras first.',
    noBaseCone: 'That’s only the curved surface ' + t('\\pi rs') + '. A closed cone also has its circular base: add ' + t('\\pi r^2') + '.',
    noBasePyr: 'That’s only the triangular faces. The surface area of a closed pyramid includes the base too.',
    diam: 'The given length is a <b>diameter</b>. The formulas need the radius: ' + t('r=d\\div 2') + '.',
    halfEdge: 'The slant height lands on the <b>midpoint</b> of a base edge, so the horizontal leg of the right triangle is <b>half</b> the edge, not the whole edge.',
    triHalf: 'Each triangular face has area ' + t('\\tfrac12\\times\\text{base}\\times s') + ' — check the ' + t('\\tfrac12') + '.',
    pythLeg: 'The slant height ' + t('s') + ' is the <b>hypotenuse</b>, so to find a leg you subtract: ' + t('\\text{leg}^2=s^2-\\text{other leg}^2') + '.',
    pythHyp: 'The slant height is the hypotenuse, the longest side: ' + t('s^2=h^2+r^2') + ' (add the squares).',
    early: 'Close, but you rounded part-way. Keep the unrounded value in your calculator and round only the final answer.',
    noSquare: 'Check the formula: the radius is <b>squared</b> — ' + t('\\pi r^2') + '.'
  };

  /* ---------------- local figures (style of js/geom.js) ---------------- */
  var INK = '#2b3340', COL = '#13807a', FILL = '#f4faf9';
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function tx(x, y, s, anchor, color) {
    var it = /^[A-Za-zθ]$/.test(String(s)) ? ' font-style="italic"' : '';
    return '<text x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" font-size="13" text-anchor="' + (anchor || 'middle') + '" dominant-baseline="central" fill="' + (color || INK) + '"' + it + ' paint-order="stroke" stroke="#fff" stroke-width="3" stroke-linejoin="round">' + esc(s) + '</text>';
  }
  function ln(a, b, o) { o = o || {}; return '<line x1="' + a[0].toFixed(1) + '" y1="' + a[1].toFixed(1) + '" x2="' + b[0].toFixed(1) + '" y2="' + b[1].toFixed(1) + '" stroke="' + (o.color || INK) + '" stroke-width="' + (o.w || 2) + '"' + (o.dash ? ' stroke-dasharray="5 4"' : '') + ' stroke-linecap="round"/>'; }
  function ellH(cx, cy, rx, ry, backDash, frontColor) { // front (lower) arc solid, back (upper) arc dashed
    return '<path d="M' + (cx - rx) + ' ' + cy + ' A' + rx + ' ' + ry + ' 0 0 0 ' + (cx + rx) + ' ' + cy + '" fill="none" stroke="' + (frontColor || INK) + '" stroke-width="2"/>' +
      '<path d="M' + (cx - rx) + ' ' + cy + ' A' + rx + ' ' + ry + ' 0 0 1 ' + (cx + rx) + ' ' + cy + '" fill="none" stroke="' + INK + '" stroke-width="1.4"' + (backDash ? ' stroke-dasharray="5 4"' : '') + '/>';
  }
  function svg(w, h, inner, maxW, aria) { return '<svg class="fig-svg" viewBox="0 0 ' + w + ' ' + h + '" width="100%" style="max-width:' + (maxW || 260) + 'px" role="img" aria-label="' + esc(aria || 'figure') + '">' + inner + '</svg>'; }
  function dimV(x, y0, y1, lab, side) { // vertical dimension line with a label (side 1 = right, -1 = left)
    return ln([x, y0], [x, y1], { w: 1.2, dash: 1 }) + ln([x - 4, y0], [x + 4, y0], { w: 1.2 }) + ln([x - 4, y1], [x + 4, y1], { w: 1.2 }) + tx(x + 6 * (side || 1), (y0 + y1) / 2, lab, (side || 1) > 0 ? 'start' : 'end');
  }
  /* cylinder topped by a cone (silo) */
  function siloSvg(o) {
    var cx = 110, rx = 62, ry = 16, top = 92, bot = 205, apex = [cx, 30], s = '';
    s += '<rect x="' + (cx - rx) + '" y="' + top + '" width="' + (2 * rx) + '" height="' + (bot - top) + '" fill="' + FILL + '"/>';
    s += '<polygon points="' + apex.join(',') + ' ' + (cx - rx) + ',' + top + ' ' + (cx + rx) + ',' + top + '" fill="' + FILL + '"/>';
    s += ellH(cx, top, rx, ry, true) + ellH(cx, bot, rx, ry, true) + ln([cx - rx, top], [cx - rx, bot]) + ln([cx + rx, top], [cx + rx, bot]) + ln(apex, [cx - rx, top]) + ln(apex, [cx + rx, top]);
    if (o.hc) s += ln(apex, [cx, top], { w: 1.3, dash: 1 }) + tx(cx + 6, (apex[1] + top) / 2 + 6, o.hc, 'start');
    if (o.sc) s += tx((apex[0] + cx + rx) / 2 + 9, (apex[1] + top) / 2 - 4, o.sc, 'start');
    if (o.H) s += dimV(cx + rx + 16, top, bot, o.H, 1);
    if (o.r) s += ln([cx, bot], [cx + rx, bot], { w: 1.4 }) + '<circle cx="' + cx + '" cy="' + bot + '" r="2.4" fill="' + INK + '"/>' + tx(cx + rx / 2, bot + ry + 9, o.r);
    if (o.ground) s += ln([cx - rx - 22, bot + 1], [cx + rx + 6, bot + 1], { color: '#8a7a5c', w: 2.5 });
    return svg(250, 240, s, 260, 'cylinder topped by a cone');
  }
  /* square prism topped by a square pyramid (tower) */
  function towerSvg(o) {
    var A = [66, 220], Bp = [176, 220], dx = 48, dy = -30, Hp = 110, s = '';
    var Ab = [A[0] + dx, A[1] + dy], Bb = [Bp[0] + dx, Bp[1] + dy], TA = [A[0], A[1] - Hp], TB = [Bp[0], Bp[1] - Hp], TBb = [Bb[0], Bb[1] - Hp], TAb = [Ab[0], Ab[1] - Hp];
    var ctr = [(TA[0] + TBb[0]) / 2, (TA[1] + TBb[1]) / 2], apex = [ctr[0], 28];
    s += '<polygon points="' + [A, Bp, TB, TA].map(function (p) { return p.join(','); }).join(' ') + '" fill="' + FILL + '"/>';
    s += '<polygon points="' + [Bp, Bb, TBb, TB].map(function (p) { return p.join(','); }).join(' ') + '" fill="#eaf4f2"/>';
    s += '<polygon points="' + [TA, TB, TBb, apex].map(function (p) { return p.join(','); }).join(' ') + '" fill="' + FILL + '"/>';
    s += ln(A, Bp) + ln(Bp, TB) + ln(TB, TA) + ln(TA, A) + ln(Bp, Bb) + ln(Bb, TBb) + ln(TB, TBb);
    s += ln(A, Ab, { dash: 1, w: 1.3 }) + ln(Ab, Bb, { dash: 1, w: 1.3 }) + ln(Ab, TAb, { dash: 1, w: 1.3 }) + ln(TAb, TBb, { dash: 1, w: 1.3 }) + ln(TAb, TA, { dash: 1, w: 1.3 });
    s += ln(apex, TA) + ln(apex, TB) + ln(apex, TBb) + ln(apex, TAb, { dash: 1, w: 1.3 });
    if (o.hp) s += ln(apex, ctr, { dash: 1, w: 1.3 }) + tx(ctr[0] + 6, (apex[1] + ctr[1]) / 2 + 4, o.hp, 'start');
    if (o.a) s += tx((A[0] + Bp[0]) / 2, A[1] + 13, o.a) + tx((Bp[0] + Bb[0]) / 2 + 10, (Bp[1] + Bb[1]) / 2 + 8, o.a, 'start');
    if (o.H) s += dimV(A[0] - 14, TA[1], A[1], o.H, -1);
    return svg(280, 245, s, 280, 'square prism topped by a square pyramid');
  }
  /* cone lying on its side (booklet Q5b) */
  function sideConeSvg(rLab, hLab) {
    var cx = 52, cy = 95, ry = 62, rx = 18, ap = [228, 95], s = '';
    s += '<polygon points="' + cx + ',' + (cy - ry) + ' ' + ap.join(',') + ' ' + cx + ',' + (cy + ry) + '" fill="' + FILL + '"/>';
    s += '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="' + FILL + '" stroke="' + INK + '" stroke-width="2"/>';
    s += ln([cx, cy - ry], ap) + ln([cx, cy + ry], ap) + ln([cx, cy], ap, { dash: 1, w: 1.3 }) + ln([cx, cy], [cx, cy - ry], { w: 2.2 }) + '<circle cx="' + cx + '" cy="' + cy + '" r="2.4" fill="' + INK + '"/>';
    s += tx(cx + 6, cy - ry / 2, rLab, 'start');
    s += ln([cx, cy + ry + 4], [cx, cy + ry + 26], { w: 1, dash: 1 }) + ln([ap[0], cy + 4], [ap[0], cy + ry + 26], { w: 1, dash: 1 }) + ln([cx, cy + ry + 20], [ap[0], cy + ry + 20], { w: 1.2 }) + tx((cx + ap[0]) / 2, cy + ry + 32, hLab);
    return svg(250, 205, s, 260, 'cone lying on its side');
  }
  /* cone inside the smallest cylinder that holds it */
  function coneInCylSvg(rLab, hLab) {
    var cx = 110, rx = 62, ry = 16, top = 40, bot = 175, s = '';
    s += '<rect x="' + (cx - rx) + '" y="' + top + '" width="' + (2 * rx) + '" height="' + (bot - top) + '" fill="#fbfdfd"/>';
    s += '<polygon points="' + cx + ',' + top + ' ' + (cx - rx) + ',' + bot + ' ' + (cx + rx) + ',' + bot + '" fill="#e3f1ef"/>';
    s += '<ellipse cx="' + cx + '" cy="' + top + '" rx="' + rx + '" ry="' + ry + '" fill="none" stroke="' + INK + '" stroke-width="1.6"/>' + ellH(cx, bot, rx, ry, true) + ln([cx - rx, top], [cx - rx, bot], { w: 1.6 }) + ln([cx + rx, top], [cx + rx, bot], { w: 1.6 });
    s += ln([cx, top], [cx - rx, bot], { w: 2.6, color: COL }) + ln([cx, top], [cx + rx, bot], { w: 2.6, color: COL }) + ln([cx, top], [cx, bot], { dash: 1, w: 1.3 });
    s += ln([cx, bot], [cx + rx, bot], { w: 1.4 }) + tx(cx + rx / 2, bot + ry + 9, rLab) + dimV(cx + rx + 16, top, bot, hLab, 1);
    return svg(250, 210, s, 260, 'cone inside a cylinder');
  }
  /* cone cut parallel to its base */
  function cutConeSvg(RLab, HLab, cLab, frac) {
    var cx = 140, rx = 78, ry = 18, apex = [cx, 22], base = 188, yc = base - frac * (base - apex[1]), rc = rx * (1 - frac), s = '';
    s += '<polygon points="' + apex.join(',') + ' ' + (cx - rx) + ',' + base + ' ' + (cx + rx) + ',' + base + '" fill="' + FILL + '"/>';
    s += '<polygon points="' + apex.join(',') + ' ' + (cx - rc) + ',' + yc + ' ' + (cx + rc) + ',' + yc + '" fill="#e3f1ef"/>';
    s += ellH(cx, base, rx, ry, true) + ln(apex, [cx - rx, base]) + ln(apex, [cx + rx, base]);
    s += '<ellipse cx="' + cx + '" cy="' + yc + '" rx="' + rc + '" ry="' + (ry * (1 - frac)) + '" fill="none" stroke="' + COL + '" stroke-width="1.8" stroke-dasharray="6 4"/>';
    s += ln([cx, base], [cx + rx, base], { w: 1.4 }) + tx(cx + rx / 2, base + ry + 9, RLab);
    s += dimV(cx + rx + 14, apex[1], base, HLab, 1) + dimV(cx - rx - 10, yc, base, cLab, -1);
    return svg(285, 225, s, 285, 'cone cut by a plane parallel to its base');
  }
  function cone(o) { return HW.solid('cone', o); }

  /* ================= assignment makers ================= */

  /* Q1: one third relationships */
  function q1(r, kind) {
    var U = r.pick({ coneOf: ['ft', 'cm', 'in', 'm'], cylOf: ['m', 'cm', 'ft', 'yd'], pyrOf: ['in', 'cm', 'm', 'ft'], prismOf: ['mm', 'cm', 'm', 'in'] }[kind]);
    var given, ans, alt, prompt, sol, hint;
    if (kind === 'coneOf' || kind === 'pyrOf') {
      given = 3 * r.int(kind === 'coneOf' ? 4 : 30, kind === 'coneOf' ? 40 : 120); ans = given / 3; alt = given * 3;
      prompt = kind === 'coneOf' ? 'A cylinder has a volume of ' + t(nn(given) + uT(U, 3)) + '. State the volume of a cone that just fits inside the cylinder.'
        : 'A rectangular prism has a volume of ' + t(nn(given) + uT(U, 3)) + '. State the volume of a rectangular pyramid that just fits inside the prism.';
      sol = (kind === 'coneOf' ? 'Cone' : 'Pyramid') + ' ' + t('=\\tfrac13') + ' of the ' + (kind === 'coneOf' ? 'cylinder' : 'prism') + ': ' + t(nn(given) + '\\div 3=' + nn(ans)) + ' ' + uP(U, 3) + '.';
      hint = 'The ' + (kind === 'coneOf' ? 'cone' : 'pyramid') + ' is the <b>smaller</b> solid — it holds one third of the ' + (kind === 'coneOf' ? 'cylinder' : 'prism') + ', so divide by 3.';
    } else {
      given = kind === 'cylOf' ? r.int(4, 40) : r.int(12, 90); ans = given * 3; alt = given / 3;
      prompt = kind === 'cylOf' ? 'A cone has a volume of ' + t(nn(given) + uT(U, 3)) + '. State the volume of a cylinder that just holds the cone.'
        : 'A pentagonal right pyramid has a volume of ' + t(nn(given) + uT(U, 3)) + '. State the volume of a pentagonal right prism that just holds the pyramid.';
      sol = (kind === 'cylOf' ? 'Cylinder' : 'Prism') + ' ' + t('=3\\times') + ' the ' + (kind === 'cylOf' ? 'cone' : 'pyramid') + ': ' + t(nn(given) + '\\times 3=' + nn(ans)) + ' ' + uP(U, 3) + '.';
      hint = 'The ' + (kind === 'cylOf' ? 'cylinder' : 'prism') + ' is the <b>bigger</b> solid — the ' + (kind === 'cylOf' ? 'cone' : 'pyramid') + ' fills only a third of it, so it takes three of them: multiply by 3.';
    }
    var p = exact(prompt, ans, uP(U, 3), [{ v: alt, code: 'third-flip', hint: hint }], sol, ['Same base and same height: the pointed solid holds exactly ' + t('\\tfrac13') + ' of the straight-sided one.'], kind + ' ' + given);
    return p;
  }

  function coneVolSol(rv, hv, U, pre) { var c = rv * rv * hv / 3; return (pre || '') + t('V=\\tfrac13\\pi r^2h=\\tfrac13\\pi(' + nn(rv) + ')^2(' + nn(hv) + ')=' + pc(c) + '\\pi=' + dd(c * PI)) + ', so ' + t('V\\approx ' + rr(c * PI, 0)) + ' ' + uP(U, 3) + '.'; }

  /* Q2(a) cone volume from r and h */
  function q2a(r) {
    var U = r.pick(['mm', 'cm', 'm', 'in']), rv = r.int(3, 15), hv = r.int(5, 25); if (r.chance(0.15)) { rv = 9; hv = 12; U = 'mm'; }
    if (rv === hv) hv++;
    var V = PI * rv * rv * hv / 3;
    return near('Make a sketch of a cone with base radius ' + t(rv + uT(U)) + ' and height ' + t(hv + uT(U)) + ', and calculate its volume to the nearest whole number.', V, 0, uP(U, 3),
      [{ v: 3 * V, code: 'no-third', hint: Hh.noThirdCone }, { v: PI * rv * hv / 3, code: 'no-square', hint: Hh.noSquare }, { v: PI * hv * hv * rv / 3, code: 'r-h-swap', hint: 'Check which number is the radius: ' + t('r=' + rv) + ' is squared, and ' + t('h=' + hv) + ' is not.' }],
      cone({ r: 'r = ' + rv + ' ' + U, h: hv + ' ' + U, width: 200 }) + '<br>Both given lengths are the ones volume needs: ' + t('r=' + rv) + ' and the perpendicular height ' + t('h=' + hv) + '.<br>' + coneVolSol(rv, hv, U),
      ['Use ' + t('V=\\tfrac13\\pi r^2h') + ' with the ' + t('\\pi') + ' key.'], 'cone V r=' + rv + ' h=' + hv);
  }
  /* Q2(b) square pyramid volume (side and height from a slant-friendly triple so it matches Q3b) */
  function q2b(r) {
    var T = triple(r, function (m, h) { return m >= 5 && m <= 15 && h >= 6 && h <= 24; }), a = 2 * T[0], hv = T[1], s = T[2], U = r.pick(['cm', 'm', 'in', 'cm']);
    var V = a * a * hv / 3;
    return near('Make a sketch of a square-based pyramid with side ' + t(a + uT(U)) + ' and height ' + t(hv + uT(U)) + ', and calculate its volume to the nearest whole number.', V, 0, uP(U, 3),
      [{ v: 3 * V, code: 'no-third', hint: Hh.noThirdPyr }, { v: a * hv / 3, code: 'no-square', hint: 'The base is a square: its area is ' + t(a + '^2') + ', not ' + t(a) + '.' }, { v: a * a * hv / 2, code: 'half-not-third', hint: 'A pyramid is one <b>third</b> of the prism, not one half: ' + t('V=\\tfrac13 A_{\\text{Base}}h') + '.' }],
      HW.solid('sqpyramid', { s: a + ' ' + U, h: hv + ' ' + U, width: 200 }) + '<br>' + t('A_{\\text{Base}}=' + a + '^2=' + nn(a * a)) + ' ' + uP(U, 2) + ' and ' + t('h=' + hv) + ' ' + U + ' is the perpendicular height.<br>' + t('V=\\tfrac13 A_{\\text{Base}}h=\\tfrac13(' + nn(a * a) + ')(' + hv + ')=' + (Number.isInteger(V) ? nn(V) : dd(V))) + ', so ' + t('V\\approx ' + rr(V, 0)) + ' ' + uP(U, 3) + '.',
      ['Base area first (a square), then ' + t('V=\\tfrac13 A_{\\text{Base}}h') + '.'], 'square pyramid V a=' + a + ' h=' + hv);
  }
  /* Q2(c) cone volume from diameter and slant height */
  function q2c(r) {
    var T = triple(r, function (a, b) { return a >= 5 && a <= 15 && b >= 8 && b <= 40; }), rv = T[0], hv = T[1], s = T[2], d = 2 * rv, U = r.pick(['ft', 'cm', 'm', 'in']);
    var V = PI * rv * rv * hv / 3, hd = s > d ? leg(s, d) : hv;
    return near('Make a sketch of a cone with base diameter ' + t(d + uT(U)) + ' and slant height ' + t(s + uT(U)) + ', and calculate its volume to the nearest whole number.', V, 0, uP(U, 3),
      [{ v: PI * rv * rv * s / 3, code: 'vol-slant', hint: Hh.volSlant + ' Find ' + t('h') + ' from ' + t('s') + ' and ' + t('r') + ' first.' }, { v: PI * d * d * hd / 3, code: 'diam-radius', hint: Hh.diam }, { v: PI * d * d * hv / 3, code: 'diam-radius', hint: Hh.diam }, { v: PI * rv * rv * hv, code: 'no-third', hint: Hh.noThirdCone }, { v: PI * rv * rv * hyp(s, rv) / 3, code: 'pyth-add', hint: Hh.pythLeg }],
      cone({ d: d + ' ' + U, s: s + ' ' + U, width: 200 }) + '<br>' + t('r=' + d + '\\div2=' + rv) + ' ' + U + '. The ' + t(s) + ' ' + U + ' is the <b>slant</b> height, which volume can’t use, so find the perpendicular height:<br>' +
      t('h=\\sqrt{s^2-r^2}=\\sqrt{' + s + '^2-' + rv + '^2}=\\sqrt{' + (s * s - rv * rv) + '}=' + hv) + ' ' + U + '.<br>' + coneVolSol(rv, hv, U),
      ['Two traps here: the diameter (halve it) and the slant height (volume needs the perpendicular height).'], 'cone V d=' + d + ' s=' + s);
  }
  /* Q2(d) cone volume from slant and vertical height (radius missing) */
  function q2d(r) {
    var T = triple(r, function (a, b) { return a >= 5 && a <= 15 && b >= 10 && b <= 40; }), rv = T[0], hv = T[1], s = T[2], U = r.pick(['in', 'cm', 'm', 'ft']);
    var V = PI * rv * rv * hv / 3, rb = hyp(s, hv);
    return near('Make a sketch of a cone with slant height ' + t(s + uT(U)) + ' and vertical height ' + t(hv + uT(U)) + ', and calculate its volume to the nearest whole number.', V, 0, uP(U, 3),
      [{ v: PI * rb * rb * hv / 3, code: 'pyth-add', hint: Hh.pythLeg }, { v: PI * rv * rv * s / 3, code: 'vol-slant', hint: Hh.volSlant }, { v: PI * rv * rv * hv, code: 'no-third', hint: Hh.noThirdCone }, { v: PI * hv * hv * s / 3, code: 'r-h-swap', hint: 'The radius is missing here — the ' + t(hv) + ' is the height, not the radius. Find ' + t('r') + ' with Pythagoras.' }],
      cone({ h: hv + ' ' + U, s: s + ' ' + U, width: 200 }) + '<br>The perpendicular height ' + t('h=' + hv) + ' is given; the <b>radius</b> is missing and the ' + t(s) + ' is the slant height.<br>' +
      t('r=\\sqrt{s^2-h^2}=\\sqrt{' + s + '^2-' + hv + '^2}=\\sqrt{' + (s * s - hv * hv) + '}=' + rv) + ' ' + U + '.<br>' + coneVolSol(rv, hv, U),
      ['The slant height is the hypotenuse of the right triangle with legs ' + t('r') + ' and ' + t('h') + '.'], 'cone V s=' + s + ' h=' + hv);
  }
  /* Q2(e) pyramid from base area */
  function q2e(r) {
    var A = r.int(20, 60), hv = r.int(4, 15), U = r.pick(['m', 'cm', 'ft']); if (r.chance(0.15)) { A = 42; hv = 9; U = 'm'; }
    var V = A * hv / 3;
    return near('Make a sketch of a triangular-based pyramid with base area ' + t(A + uT(U, 2)) + ' and height ' + t(hv + uT(U)) + ', and calculate its volume to the nearest whole number.', V, 0, uP(U, 3),
      [{ v: A * hv, code: 'no-third', hint: Hh.noThirdPyr }, { v: A * hv / 2, code: 'half-not-third', hint: 'The ' + t('\\tfrac12') + ' belongs in the area of a triangle — but the base area is already given. A pyramid’s volume is ' + t('\\tfrac13 A_{\\text{Base}}h') + '.' }],
      'The base area is given outright, so no base geometry is needed, and ' + t(hv) + ' ' + U + ' is the perpendicular height.<br>' + t('V=\\tfrac13 A_{\\text{Base}}h=\\tfrac13(' + A + ')(' + hv + ')=' + (Number.isInteger(V) ? V : dd(V))) + ', so ' + t('V\\approx ' + rr(V, 0)) + ' ' + uP(U, 3) + '.',
      ['Any pyramid: ' + t('V=\\tfrac13 A_{\\text{Base}}h') + ', whatever the shape of the base.'], 'pyramid V A=' + A + ' h=' + hv);
  }
  /* Q3(a) cone SA from r and h */
  function q3a(r) {
    var T = triple(r, function (a, b) { return a >= 5 && a <= 15 && b >= 5 && b <= 30; }), rv = T[0], hv = T[1], s = T[2], U = r.pick(['mm', 'cm', 'in', 'm']);
    var SA = PI * rv * rv + PI * rv * s;
    return near('A cone has base radius ' + t(rv + uT(U)) + ' and height ' + t(hv + uT(U)) + '. Calculate its surface area to the nearest whole number.', SA, 0, uP(U, 2),
      [{ v: PI * rv * rv + PI * rv * hv, code: 'sa-height', hint: Hh.saHeight }, { v: PI * rv * s, code: 'sa-no-base', hint: Hh.noBaseCone }, { v: PI * rv * hv, code: 'sa-height', hint: Hh.saHeight + ' (And a closed cone has a base too.)' }],
      'Surface area needs the slant height: ' + t('s=\\sqrt{h^2+r^2}=\\sqrt{' + hv + '^2+' + rv + '^2}=\\sqrt{' + s * s + '}=' + s) + ' ' + U + '.<br>' +
      t('SA=\\pi r^2+\\pi rs=\\pi(' + rv + ')^2+\\pi(' + rv + ')(' + s + ')=' + (rv * rv) + '\\pi+' + (rv * s) + '\\pi=' + (rv * rv + rv * s) + '\\pi=' + dd(SA)) + ', so ' + t('SA\\approx ' + rr(SA, 0)) + ' ' + uP(U, 2) + '.',
      ['Find the slant height with Pythagoras, then ' + t('SA=\\pi r^2+\\pi rs') + '.'], 'cone SA r=' + rv + ' h=' + hv);
  }
  /* Q3(b) square pyramid SA from side and height */
  function q3b(r) {
    var T = triple(r, function (m, h) { return m >= 5 && m <= 15 && h >= 6 && h <= 24; }), m = T[0], a = 2 * m, hv = T[1], s = T[2], U = r.pick(['cm', 'm', 'in']);
    var SA = a * a + 2 * a * s, sf = hyp(hv, a);
    return near('A square-based pyramid has side ' + t(a + uT(U)) + ' and height ' + t(hv + uT(U)) + '. Calculate its surface area to the nearest whole number.', SA, 0, uP(U, 2),
      [{ v: a * a + 2 * a * sf, code: 'half-edge', hint: Hh.halfEdge }, { v: a * a + 2 * a * hv, code: 'sa-height', hint: Hh.saHeight }, { v: 2 * a * s, code: 'sa-no-base', hint: Hh.noBasePyr }, { v: a * a + 4 * a * s, code: 'tri-half', hint: Hh.triHalf }],
      'The slant height runs to the <b>midpoint</b> of a base edge, so its horizontal leg is half a side, ' + t(a + '\\div2=' + m) + ' ' + U + ':<br>' + t('s=\\sqrt{h^2+' + m + '^2}=\\sqrt{' + hv + '^2+' + m + '^2}=\\sqrt{' + s * s + '}=' + s) + ' ' + U + '.<br>' +
      t('SA=\\text{base}+4(\\text{face})=' + a + '^2+4\\left(\\tfrac12(' + a + ')(' + s + ')\\right)=' + nn(a * a) + '+' + nn(2 * a * s) + '=' + nn(SA)) + ' ' + uP(U, 2) + '.',
      ['Find the slant height first (half a side is one leg), then add the base and four triangles.'], 'sq pyramid SA a=' + a + ' h=' + hv);
  }
  /* Q3(c) cone SA from diameter and slant height */
  function q3c(r) {
    var rv = r.int(5, 15), s = rv + r.int(4, 18), U = r.pick(['ft', 'cm', 'm']); if (r.chance(0.15)) { rv = 10; s = 26; U = 'ft'; }
    var d = 2 * rv, SA = PI * rv * rv + PI * rv * s;
    return near('A cone has base diameter ' + t(d + uT(U)) + ' and slant height ' + t(s + uT(U)) + '. Calculate its surface area to the nearest whole number.', SA, 0, uP(U, 2),
      [{ v: PI * d * d + PI * d * s, code: 'diam-radius', hint: Hh.diam }, { v: PI * rv * s, code: 'sa-no-base', hint: Hh.noBaseCone }, { v: PI * rv * rv + PI * rv * leg(s, rv), code: 'sa-height', hint: 'The slant height ' + t(s) + ' is given, and it is exactly what surface area needs — no Pythagoras required.' }, { v: PI * d * d / 4 + PI * d * s, code: 'diam-radius', hint: 'The base uses ' + t('r') + ' but so does the curved surface: ' + t('\\pi rs') + ' with ' + t('r=' + rv) + '.' }],
      t('r=' + d + '\\div2=' + rv) + ' ' + U + '. The slant height ' + t('s=' + s) + ' is given outright, and surface area uses ' + t('s') + ', so no Pythagoras is needed.<br>' +
      t('SA=\\pi r^2+\\pi rs=\\pi(' + rv + ')^2+\\pi(' + rv + ')(' + s + ')=' + (rv * rv + rv * s) + '\\pi=' + dd(SA)) + ', so ' + t('SA\\approx ' + rr(SA, 0)) + ' ' + uP(U, 2) + '.',
      ['Halve the diameter, then ' + t('SA=\\pi r^2+\\pi rs') + '.'], 'cone SA d=' + d + ' s=' + s);
  }

  /* Q5 cones from figures: (a) h and s given, (b) lying on its side */
  function q5Sol(c, U, which) {
    var rv = c.r, hv = c.h, s = c.s, V = PI * rv * rv * hv / 3, SA = PI * rv * rv + PI * rv * s;
    return which === 'V' ? t('V=\\tfrac13\\pi r^2h=\\tfrac13\\pi(' + rv + ')^2(' + hv + ')=' + pc(rv * rv * hv / 3) + '\\pi=' + dd(V)) + ', so ' + t('V\\approx ' + rr(V, 1)) + ' ' + uP(U, 3) + ' (uses ' + t('h=' + hv) + ').'
      : t('SA=\\pi r^2+\\pi rs=\\pi(' + rv + ')^2+\\pi(' + rv + ')(' + s + ')=' + (rv * rv + rv * s) + '\\pi=' + dd(SA)) + ', so ' + t('SA\\approx ' + rr(SA, 1)) + ' ' + uP(U, 2) + ' (uses ' + t('s=' + s) + ').';
  }

  /* ================= the lesson ================= */
  HW.defineLesson({
    id: 'u10l4', unit: 10, num: '4', title: 'Surface Area and Volume of Pyramids and Cones', outcome: 'M3',
    blurb: 'A pyramid or cone holds exactly one third of the prism or cylinder on the same base; surface area uses the slant height, volume uses the perpendicular height.',
    questions: [
      { num: '1', stem: 'Each part describes one solid that “just fits” inside another (identical base, identical height). Use the ' + t('\\tfrac13') + ' volume relationship to state the requested volume — no formula needed.', parts: [
        { id: '1a', sub: 'a', level: 'LIM', make: function (r) { return q1(r, 'coneOf'); } },
        { id: '1b', sub: 'b', level: 'BEG', make: function (r) { return q1(r, 'cylOf'); } },
        { id: '1c', sub: 'c', level: 'LIM', make: function (r) { return q1(r, 'pyrOf'); } },
        { id: '1d', sub: 'd', level: 'BEG', make: function (r) { return q1(r, 'prismOf'); } }] },
      { num: '2', stem: 'In each part, make a sketch of the figure and calculate its volume to the nearest whole number. (Use the ' + t('\\pi') + ' key and round once, at the end.)', parts: [
        { id: '2a', sub: 'a', level: 'BEG', make: q2a },
        { id: '2b', sub: 'b', level: 'BEG', make: q2b },
        { id: '2c', sub: 'c', level: 'PRG', make: q2c },
        { id: '2d', sub: 'd', level: 'PRG', make: q2d },
        { id: '2e', sub: 'e', level: 'BEG', make: q2e }] },
      { num: '3', stem: 'Calculate the surface area of each solid (like the figures in Question 2, parts (a)–(c)). Answer to the nearest whole number.', parts: [
        { id: '3a', sub: 'a', level: 'PRG', make: q3a },
        { id: '3b', sub: 'b', level: 'PRG', make: q3b },
        { id: '3c', sub: 'c', level: 'EMG', make: q3c }] },
      { num: '4', stem: function (o) { return 'Consider the rectangular-based pyramid shown: base ' + t(o.l + uT('in')) + ' by ' + t(o.w + uT('in')) + ', with a height of ' + t(o.h + uT('in')) + '.<br>' + HW.solid('rectpyramid', { l: o.l + ' in', w: o.w + ' in', h: o.h + ' in', width: 230 }); },
        shared: function (r) {
          var l = r.pick([12, 14, 16, 18, 20, 22, 24]), w = r.pick([8, 10, 12, 14, 16].filter(function (x) { return x < l; })), h = r.pick([6, 9, 12, 15]);
          if (r.chance(0.15)) { l = 18; w = 14; h = 12; }
          return { l: l, w: w, h: h, sl: hyp(h, w / 2), sw: hyp(h, l / 2) };
        },
        parts: [
          { id: '4a', sub: 'a', level: 'PRG', make: function (r, o) {
            var c1 = K.near(o.sl, 1, { alts: [{ v: o.sw, code: 'slant-swap', hint: 'For the faces on the ' + o.l + '-in edges, the slant height runs from the apex to the midpoint of an ' + o.l + '-in edge. Its horizontal leg goes from the centre across to that edge: half of the <b>other</b> side, ' + t(o.w + '\\div2') + '.' }, { v: hyp(o.h, o.w), code: 'half-edge', hint: Hh.halfEdge }, { v: hyp(o.h, o.l), code: 'half-edge', hint: Hh.halfEdge }] });
            var c2 = K.near(o.sw, 1, { alts: [{ v: o.sl, code: 'slant-swap', hint: 'For the faces on the ' + o.w + '-in edges, the horizontal leg goes from the centre across to an ' + o.w + '-in edge: half of the <b>other</b> side, ' + t(o.l + '\\div2') + '.' }, { v: hyp(o.h, o.l), code: 'half-edge', hint: Hh.halfEdge }, { v: hyp(o.h, o.w), code: 'half-edge', hint: Hh.halfEdge }] });
            var k1 = K.roundTo(o.sl, 1).toFixed(1), k2 = K.roundTo(o.sw, 1).toFixed(1);
            var p = B.fields('The net of this pyramid has two pairs of triangles with <b>different</b> slant heights. Find both, to the nearest tenth of an inch. (The ' + o.h + ' in height is inside the solid, so it is not an edge of the net.)',
              [{ label: 'slant height of the faces on the ' + o.l + '-in edges', after: 'in' }, { label: 'slant height of the faces on the ' + o.w + '-in edges', after: 'in' }], [c1, c2], [k1, k2],
              t('s_{' + o.l + '}\\approx ' + k1) + ' in, ' + t('s_{' + o.w + '}\\approx ' + k2) + ' in',
              'The base is a rectangle, so the two pairs of faces have different slant heights.<br>To the ' + o.l + '-in faces the horizontal leg is half of ' + o.w + ': ' + t(o.w / 2) + ' in, so ' + t('s_{' + o.l + '}=\\sqrt{' + o.h + '^2+' + (o.w / 2) + '^2}=\\sqrt{' + (o.h * o.h + o.w * o.w / 4) + '}\\approx ' + k1) + ' in.<br>' +
              'To the ' + o.w + '-in faces the horizontal leg is half of ' + o.l + ': ' + t(o.l / 2) + ' in, so ' + t('s_{' + o.w + '}=\\sqrt{' + o.h + '^2+' + (o.l / 2) + '^2}=\\sqrt{' + (o.h * o.h + o.l * o.l / 4) + '}\\approx ' + k2) + ' in.<br>The net: the ' + o.l + '×' + o.w + ' rectangle with a triangle on each edge, each triangle’s height being its slant height.',
              ['Each slant height is the hypotenuse of a right triangle: the height ' + t(o.h) + ' and a horizontal leg from the centre of the base to the <b>middle</b> of that edge.'], 'rect pyramid slant heights ' + o.l + 'x' + o.w + ' h=' + o.h);
            p.bad = [[k2, k1]]; return p;
          } },
          { id: '4b', sub: 'b', level: 'PRG', make: function (r, o) {
            var SA = o.l * o.w + o.l * o.sl + o.w * o.sw, s1 = K.roundTo(o.sl, 1), s2 = K.roundTo(o.sw, 1);
            return near('Determine the surface area of the pyramid to the nearest square inch.', SA, 0, 'in²',
              [{ v: o.l * o.w + (o.l + o.w) * o.sl, code: 'one-slant', hint: 'The two pairs of faces have <b>different</b> slant heights — each pair needs its own.' }, { v: o.l * o.w + (o.l + o.w) * o.sw, code: 'one-slant', hint: 'The two pairs of faces have <b>different</b> slant heights — each pair needs its own.' },
                { v: o.l * o.w + o.l * o.sw + o.w * o.sl, code: 'slant-swap', hint: 'Check the pairing: the faces on the ' + o.l + '-in edges use the slant height whose horizontal leg is ' + t(o.w + '\\div 2') + '.' }, { v: o.l * o.sl + o.w * o.sw, code: 'sa-no-base', hint: Hh.noBasePyr },
                { v: o.l * o.w + (o.l + o.w) * o.h, code: 'sa-height', hint: Hh.saHeight }, { v: o.l * o.w + 2 * o.l * o.sl + 2 * o.w * o.sw, code: 'tri-half', hint: Hh.triHalf }, { v: o.l * o.w + o.l * s1 + o.w * s2, code: 'early-round', hint: Hh.early }],
              'Slant heights: ' + t('s_{' + o.l + '}=\\sqrt{' + o.h + '^2+' + (o.w / 2) + '^2}=' + dd(o.sl)) + ' and ' + t('s_{' + o.w + '}=\\sqrt{' + o.h + '^2+' + (o.l / 2) + '^2}=' + dd(o.sw)) + '.<br>' +
              'Lateral ' + t('=2\\left(\\tfrac12(' + o.l + ')(' + dd(o.sl) + ')\\right)+2\\left(\\tfrac12(' + o.w + ')(' + dd(o.sw) + ')\\right)=' + dd(o.l * o.sl + o.w * o.sw)) + ' in².<br>Base ' + t('=' + o.l + '(' + o.w + ')=' + o.l * o.w) + ' in².<br>' +
              t('SA=' + dd(SA) + '\\approx ' + rr(SA, 0)) + ' in².',
              ['Two triangles on the ' + o.l + '-in edges, two on the ' + o.w + '-in edges (each with its own slant height), plus the rectangular base.'], 'rect pyramid SA ' + o.l + 'x' + o.w + ' h=' + o.h);
          } },
          { id: '4c', sub: 'c', level: 'BEG', make: function (r, o) {
            var V = o.l * o.w * o.h / 3;
            return exact('Determine the volume of the pyramid.', V, 'in³', [{ v: 3 * V, code: 'no-third', hint: Hh.noThirdPyr }, { v: o.l * o.w * o.sw / 3, code: 'vol-slant', hint: Hh.volSlant }, { v: o.l * o.w * o.sl / 3, code: 'vol-slant', hint: Hh.volSlant }],
              'Volume uses the perpendicular height ' + t(o.h) + ' in — neither slant height appears.<br>' + t('V=\\tfrac13 A_{\\text{Base}}h=\\tfrac13(' + o.l + ')(' + o.w + ')(' + o.h + ')=\\tfrac13(' + nn(o.l * o.w * o.h) + ')=' + nn(V)) + ' in³.',
              ['Base area ' + t('=lw') + ', then ' + t('\\tfrac13 A_{\\text{Base}}h') + '.'], 'rect pyramid V');
          } }] },
      { num: '5', stem: 'Determine the volume and surface area of each cone below. Answer to one decimal place.',
        shared: function (r) {
          var A = triple(r, function (a, b) { return a >= 5 && a <= 12 && b >= 8 && b <= 24; }), Bt = triple(r, function (a, b) { return a >= 5 && a <= 12 && b >= 4 && b <= 12; });
          if (r.chance(0.15)) { A = [8, 15, 17]; Bt = [8, 6, 10]; }
          return { A: { r: A[0], h: A[1], s: A[2], U: r.pick(['yd', 'cm', 'm']) }, B: { r: Bt[0], h: Bt[1], s: Bt[2], U: r.pick(['m', 'cm', 'ft']) } };
        },
        parts: [
          { id: '5aV', sub: 'a V', level: 'PRG', make: function (r, o) {
            var c = o.A, U = c.U, V = PI * c.r * c.r * c.h / 3, rb = hyp(c.s, c.h);
            return near('Cone (a): find its <b>volume</b>, to one decimal place.<br>' + cone({ h: c.h + ' ' + U, s: c.s + ' ' + U, width: 210 }), V, 1, uP(U, 3),
              [{ v: PI * rb * rb * c.h / 3, code: 'pyth-add', hint: Hh.pythLeg }, { v: PI * c.r * c.r * c.s / 3, code: 'vol-slant', hint: Hh.volSlant }, { v: PI * c.r * c.r * c.h, code: 'no-third', hint: Hh.noThirdCone }],
              'The ' + t(c.h) + ' ' + U + ' is the perpendicular height and the ' + t(c.s) + ' ' + U + ' is the slant height; the radius is missing.<br>' + t('r=\\sqrt{s^2-h^2}=\\sqrt{' + c.s + '^2-' + c.h + '^2}=\\sqrt{' + (c.s * c.s - c.h * c.h) + '}=' + c.r) + ' ' + U + '.<br>' + q5Sol(c, U, 'V'),
              ['Find the radius first: ' + t('s') + ' is the hypotenuse.'], 'cone V from h,s');
          } },
          { id: '5aS', sub: 'a SA', level: 'PRG', make: function (r, o) {
            var c = o.A, U = c.U, SA = PI * c.r * c.r + PI * c.r * c.s, rb = hyp(c.s, c.h);
            return near('Cone (a): find its <b>surface area</b>, to one decimal place.<br>' + cone({ h: c.h + ' ' + U, s: c.s + ' ' + U, width: 210 }), SA, 1, uP(U, 2),
              [{ v: PI * rb * rb + PI * rb * c.s, code: 'pyth-add', hint: Hh.pythLeg }, { v: PI * c.r * c.r + PI * c.r * c.h, code: 'sa-height', hint: Hh.saHeight }, { v: PI * c.r * c.s, code: 'sa-no-base', hint: Hh.noBaseCone }],
              t('r=\\sqrt{' + c.s + '^2-' + c.h + '^2}=' + c.r) + ' ' + U + '.<br>' + q5Sol(c, U, 'SA'),
              ['Find the radius first, then ' + t('SA=\\pi r^2+\\pi rs') + '.'], 'cone SA from h,s');
          } },
          { id: '5bV', sub: 'b V', level: 'EMG', make: function (r, o) {
            var c = o.B, U = c.U, V = PI * c.r * c.r * c.h / 3;
            return near('Cone (b) is lying on its side. Find its <b>volume</b>, to one decimal place.<br>' + sideConeSvg(c.r + ' ' + U, c.h + ' ' + U), V, 1, uP(U, 3),
              [{ v: PI * c.h * c.h * c.r / 3, code: 'r-h-swap', hint: 'The cone is on its side: the ' + t(c.r) + ' runs from the centre of the circular base to its edge (the radius), and the ' + t(c.h) + ' runs along the axis (the height).' }, { v: PI * c.r * c.r * c.h, code: 'no-third', hint: Hh.noThirdCone }, { v: PI * c.r * c.r * c.s / 3, code: 'vol-slant', hint: Hh.volSlant }],
              'The cone is drawn on its side: the ' + t(c.r) + ' ' + U + ' is the base radius and the ' + t(c.h) + ' ' + U + ' runs along the axis, so it is the perpendicular height.<br>' + q5Sol(c, U, 'V'),
              ['Which length goes from the centre of the circle to its edge? That is ' + t('r') + '.'], 'side cone V');
          } },
          { id: '5bS', sub: 'b SA', level: 'PRG', make: function (r, o) {
            var c = o.B, U = c.U, SA = PI * c.r * c.r + PI * c.r * c.s;
            return near('Cone (b) is lying on its side. Find its <b>surface area</b>, to one decimal place.<br>' + sideConeSvg(c.r + ' ' + U, c.h + ' ' + U), SA, 1, uP(U, 2),
              [{ v: PI * c.r * c.r + PI * c.r * c.h, code: 'sa-height', hint: Hh.saHeight }, { v: PI * c.r * c.s, code: 'sa-no-base', hint: Hh.noBaseCone }, { v: PI * c.h * c.h + PI * c.h * c.s, code: 'r-h-swap', hint: 'The ' + t(c.r) + ' is the radius (centre of the circle to its edge); the ' + t(c.h) + ' runs along the axis.' }],
              'The slant height is missing: ' + t('s=\\sqrt{h^2+r^2}=\\sqrt{' + c.h + '^2+' + c.r + '^2}=\\sqrt{' + c.s * c.s + '}=' + c.s) + ' ' + U + '.<br>' + q5Sol(c, U, 'SA'),
              ['Find the slant height with Pythagoras, then ' + t('SA=\\pi r^2+\\pi rs') + '.'], 'side cone SA');
          } }] },
      { num: '6', stem: function (o) { return 'Cups Incorporated makes conical paper cups for water dispensers. One of its cups has a diameter of ' + t(o.d + uT('cm')) + ', a height of ' + t(o.h + uT('cm')) + ', and no base.'; },
        shared: function (r) { var d = r.int(6, 12), h = r.int(8, 14); if (r.chance(0.15)) { d = 9; h = 11; } return { d: d, h: h, r: d / 2, s: hyp(d / 2, h) }; },
        parts: [
          { id: '6a', sub: 'a', level: 'EMG', make: function (r, o) {
            return near('Determine the slant height of the cup to the nearest ' + t('0.1') + ' cm.', o.s, 1, 'cm',
              [{ v: hyp(o.d, o.h), code: 'diam-radius', hint: Hh.diam }, { v: leg(o.h, o.r), code: 'pyth-add', hint: Hh.pythHyp }],
              'The diameter is ' + t(o.d) + ' cm, so ' + t('r=' + nn(o.r)) + ' cm, and ' + t('h=' + o.h) + ' cm is the perpendicular height.<br>' + t('s=\\sqrt{r^2+h^2}=\\sqrt{' + nn(o.r) + '^2+' + o.h + '^2}=\\sqrt{' + nn(o.r * o.r + o.h * o.h) + '}=' + dd(o.s) + '\\approx ' + rr(o.s, 1)) + ' cm.',
              ['Right triangle: legs ' + t('r') + ' and ' + t('h') + ', hypotenuse ' + t('s') + '.'], 'cup slant');
          } },
          { id: '6b', sub: 'b', level: 'EMG', make: function (r, o) {
            var V = PI * o.r * o.r * o.h / 3;
            return near('To the nearest whole number, how many mL of water will the cup hold? (' + t('1\\text{ cm}^3=1\\text{ mL}') + ')', V, 0, 'mL',
              [{ v: PI * o.r * o.r * o.s / 3, code: 'vol-slant', hint: Hh.volSlant }, { v: PI * o.d * o.d * o.h / 3, code: 'diam-radius', hint: Hh.diam }, { v: PI * o.r * o.r * o.h, code: 'no-third', hint: Hh.noThirdCone }],
              'Capacity is a volume, so use the perpendicular height ' + t('h=' + o.h) + ' cm and ' + t('r=' + nn(o.r)) + ' cm.<br>' + t('V=\\tfrac13\\pi r^2h=\\tfrac13\\pi(' + nn(o.r) + ')^2(' + o.h + ')=' + pc(o.r * o.r * o.h / 3) + '\\pi=' + dd(V)) + ' cm³.<br>Since ' + t('1\\text{ cm}^3=1\\text{ mL}') + ', the cup holds ' + t(rr(V, 0)) + ' mL.',
              ['Volume of a cone, with the radius (half the diameter).'], 'cup volume');
          } },
          { id: '6c', sub: 'c', level: 'PRG', make: function (r, o) {
            var A = PI * o.r * o.s;
            return near('Determine how much paper is required, to the nearest square cm, to make the cup.', A, 0, 'cm²',
              [{ v: A + PI * o.r * o.r, code: 'extra-base', hint: 'The cup has <b>no base</b> — only the curved surface ' + t('\\pi rs') + ' is paper.' }, { v: PI * o.r * o.h, code: 'sa-height', hint: Hh.saHeight }, { v: PI * o.d * hyp(o.d, o.h), code: 'diam-radius', hint: Hh.diam }, { v: PI * o.d * o.s, code: 'diam-radius', hint: Hh.diam }, { v: PI * o.r * K.roundTo(o.s, 1), code: 'early-round', hint: Hh.early }],
              'Paper is a surface area, so use the slant height ' + t('s=\\sqrt{' + nn(o.r) + '^2+' + o.h + '^2}=' + dd(o.s)) + ' cm. The cup has no base, so only the curved surface counts.<br>' + t('A=\\pi rs=\\pi(' + nn(o.r) + ')(' + dd(o.s) + ')=' + dd(A) + '\\approx ' + rr(A, 0)) + ' cm².',
              ['Curved surface of a cone: ' + t('\\pi rs') + ' (slant height, not the height).'], 'cup paper');
          } }] },
      { num: '7', stem: function (o) { return 'Devon constructs a cube with interior edges of ' + t(o.e + uT('cm')) + '.'; },
        shared: function (r) { return { e: r.pick([6, 9, 12, 15, 18, 21]) }; },
        parts: [
          { id: '7a', sub: 'a', level: 'EMG', make: function (r, o) {
            var e = o.e, V = e * e * e / 3;
            return exact('Determine the volume of the largest possible pyramid that will just fit inside the cube.', V, 'cm³', [{ v: 3 * V, code: 'no-third', hint: Hh.noThirdPyr }, { v: e * e * e / 2, code: 'half-not-third', hint: 'A pyramid is ' + t('\\tfrac13') + ' of the prism (here the cube) with the same base and height.' }],
              'The largest pyramid uses a whole ' + e + '×' + e + ' face as its base and the full edge as its height.<br>' + t('V=\\tfrac13(' + e + ')^2(' + e + ')=\\tfrac13(' + nn(e * e * e) + ')=' + nn(V)) + ' cm³ — exactly one third of the cube.',
              ['Base: a face of the cube. Height: an edge of the cube.'], 'pyramid in cube');
          } },
          { id: '7b', sub: 'b', level: 'EMG', make: function (r, o) {
            var e = o.e, V = PI * e * e * e / 4;
            return near('Determine, to the nearest cubic centimetre, the volume of the largest possible cylinder that will just fit inside the cube.', V, 0, 'cm³',
              [{ v: PI * e * e * e, code: 'diam-radius', hint: 'The cylinder’s <b>diameter</b> is the edge of the cube, so its radius is half the edge.' }, { v: V / 3, code: 'cyl-third', hint: 'A cylinder is not a pointed solid — there is no ' + t('\\tfrac13') + ' in ' + t('V=\\pi r^2h') + '.' }],
              'The largest cylinder has ' + t('r=' + e + '\\div2=' + nn(e / 2)) + ' cm and ' + t('h=' + e) + ' cm (no ' + t('\\tfrac13') + ' — it is a cylinder).<br>' + t('V=\\pi r^2h=\\pi(' + nn(e / 2) + ')^2(' + e + ')=' + pc(e * e * e / 4) + '\\pi=' + dd(V) + '\\approx ' + rr(V, 0)) + ' cm³.',
              ['The circle just touches all four sides of a face: its diameter is the edge.'], 'cylinder in cube');
          } },
          { id: '7c', sub: 'c', level: 'EMG', make: function (r, o) {
            var e = o.e, V = PI * e * e * e / 12;
            return near('Determine, to the nearest cubic centimetre, the volume of the largest possible cone that will just fit inside the cube.', V, 0, 'cm³',
              [{ v: 3 * V, code: 'no-third', hint: Hh.noThirdCone }, { v: PI * e * e * e / 3, code: 'diam-radius', hint: 'The cone’s base circle has <b>diameter</b> equal to the edge, so ' + t('r=' + e + '\\div 2') + '.' }],
              'Same base circle and height as the cylinder: ' + t('r=' + nn(e / 2)) + ' cm, ' + t('h=' + e) + ' cm — and now the ' + t('\\tfrac13') + ' applies.<br>' + t('V=\\tfrac13\\pi(' + nn(e / 2) + ')^2(' + e + ')=' + pc(e * e * e / 12) + '\\pi=' + dd(V) + '\\approx ' + rr(V, 0)) + ' cm³.',
              ['Radius = half the edge, height = the edge, and a cone is ' + t('\\tfrac13') + ' of its cylinder.'], 'cone in cube');
          } }] },
      { num: '8', stem: '', parts: [
        { id: '8', level: 'BEG', make: function (r) {
          var a = r.pick([150, 180, 210, 240, 270, 300, 330, 360]), hv = r.pick([30, 40, 45, 50, 55, 60, 70]); if (r.chance(0.15)) { a = 300; hv = 50; }
          var V = a * a * hv / 3;
          return exact('An engineering firm designs a ceremonial mound in the shape of a square-based pyramid, with a base ' + t(a + uT('m')) + ' by ' + t(a + uT('m')) + ' and a height of ' + t(hv + uT('m')) + '. Determine the volume of the pyramid in cubic metres.', V, 'm³',
            [{ v: 3 * V, code: 'no-third', hint: Hh.noThirdPyr }, { v: a * hv / 3, code: 'no-square', hint: 'The base is ' + a + ' m by ' + a + ' m: its area is ' + t(a + '^2') + '.' }],
            t('A_{\\text{Base}}=' + a + '^2=' + F(a * a)) + ' m² and ' + t('h=' + hv) + ' m.<br>' + t('V=\\tfrac13 A_{\\text{Base}}h=\\tfrac13(' + F(a * a) + ')(' + hv + ')=' + F(V)) + ' m³.',
            ['Base area (a square), then ' + t('\\tfrac13 A_{\\text{Base}}h') + '.'], 'mound volume a=' + a + ' h=' + hv);
        } }] },
      { num: '9', stem: '', parts: [
        { id: '9', level: 'PRG', make: function (r) {
          var a = 10 * r.int(6, 24), hv = 3 * r.int(10, 40); if (r.chance(0.15)) { a = 180; hv = 90; }
          var V = a * a * hv / 3;
          return near('A pyramid-shaped grain storage monument has a volume of ' + t(F(V) + uT('m', 3)) + ' and a height of ' + t(hv + uT('m')) + '. The base is square. Determine the length of each side of the base to the nearest metre.', a, 0, 'm',
            [{ v: a * a, code: 'no-sqrt', hint: 'That is the <b>area</b> of the base, ' + t('\\text{side}^2') + '. Take the square root to get the side.' }, { v: a / Math.sqrt(3), code: 'no-third', hint: 'Use ' + t('V=\\tfrac13(\\text{side})^2h') + ': multiply the volume by 3 before dividing by the height.' }, { v: a * a / 3, code: 'no-sqrt', hint: 'Undo each step: multiply by 3, divide by the height, then take the square root.' }, { v: V / hv, code: 'no-sqrt', hint: 'Undo each step: ' + t('\\text{side}^2=\\frac{3V}{h}') + ', then take the square root.' }],
            'Work backwards from ' + t('V=\\tfrac13(\\text{side})^2h') + ':<br>' + t('\\text{side}^2=\\dfrac{3V}{h}=\\dfrac{3(' + F(V) + ')}{' + hv + '}=' + F(a * a)) + '<br>' + t('\\text{side}=\\sqrt{' + F(a * a) + '}=' + a) + ' m.',
            ['Rearrange ' + t('V=\\tfrac13 s^2h') + ' for ' + t('s^2') + ', then take the square root.'], 'pyramid side from V=' + V + ' h=' + hv);
        } }] },
      { num: '10', stem: function (o) { return 'A right pyramid has a height of ' + t('\\sqrt{' + o.k + '}') + ' feet and a regular hexagonal base with six sides of ' + t(o.a) + ' feet. Give <u>exact</u> answers (simplest radical form).'; },
        shared: function (r) {
          var opts = [];
          [2, 4, 6].forEach(function (a) { [2, 5, 6, 7, 10, 11].forEach(function (k) { var m = k + 3 * a * a / 4, sm = simp(m); if (Math.round(Math.sqrt(m)) ** 2 !== m && sm[1] !== 3) opts.push([a, k]); }); });
          var c = r.chance(0.2) ? [4, 5] : r.pick(opts); return { a: c[0], k: c[1] };
        },
        parts: [
          { id: '10V', sub: 'volume', level: 'ADV', make: function (r, o) {
            var a = o.a, k = o.k, sv = simp(3 * k), coef = a * a / 2 * sv[0], m = sv[1], val = coef * Math.sqrt(m), s2 = k + 3 * a * a / 4;
            var p = B.radical('Determine the exact <b>volume</b> of the pyramid.', { k: coef, n: 2, m: m }, 'mixed',
              'Hexagonal base = six equilateral triangles of side ' + t(a) + ': ' + t('A_{\\text{Base}}=\\tfrac{3\\sqrt3}{2}(' + a + ')^2=' + radT(3 * a * a / 2, 3)) + ' ft².<br>Volume uses the perpendicular height ' + t('h=\\sqrt{' + k + '}') + ':<br>' +
              t('V=\\tfrac13 A_{\\text{Base}}h=\\tfrac13(' + radT(3 * a * a / 2, 3) + ')(\\sqrt{' + k + '})=' + radT(a * a / 2, 3 * k) + (sv[0] > 1 ? '=' + radT(coef, m) : '')) + ' ft³.',
              ['A regular hexagon splits into 6 equilateral triangles, each with area ' + t('\\tfrac{\\sqrt3}{4}a^2') + '.', 'Multiply radicals: ' + t('\\sqrt a\\cdot\\sqrt b=\\sqrt{ab}') + '.'], 'hex pyramid exact V',
              { diag: function (v) { if (Math.abs(v - 3 * val) < 1e-6 * val) return { code: 'no-third', hint: Hh.noThirdPyr }; if (Math.abs(v - a * a / 2 * Math.sqrt(3) * Math.sqrt(s2)) < 1e-6 * v) return { code: 'vol-slant', hint: Hh.volSlant }; return null; } });
            p.input.after = 'ft³'; p.answer = t(radT(coef, m)) + ' ft³'; p.bad = [radT(3 * coef, m)];
            return p;
          } },
          { id: '10S', sub: 'surface area', level: 'ADV', make: function (r, o) {
            var a = o.a, k = o.k, s2 = k + 3 * a * a / 4, ss = simp(s2), c1 = 3 * a * a / 2, c2 = 3 * a * ss[0], target = c1 * Math.sqrt(3) + c2 * Math.sqrt(ss[1]);
            var keyT = radT(c1, 3) + '+' + radT(c2, ss[1]);
            var altsList = [{ v: c2 * Math.sqrt(ss[1]), code: 'sa-no-base', hint: Hh.noBasePyr }, { v: c1 * Math.sqrt(3) + 3 * a * Math.sqrt(k), code: 'sa-height', hint: Hh.saHeight }, { v: c1 * Math.sqrt(3) + 3 * a * Math.sqrt(k + a * a), code: 'half-edge', hint: 'The slant height’s horizontal leg is the hexagon’s <b>apothem</b> (centre to the midpoint of a side), ' + t('\\tfrac{\\sqrt3}{2}a') + ' — not the side ' + t('a') + '.' }, { v: c1 * Math.sqrt(3) + 6 * a * Math.sqrt(s2), code: 'tri-half', hint: Hh.triHalf }];
            var check = function (resp) {
              var x = K.read(resp); if (x.res) return x.res;
              var sh = ex.shape(x.ast), raw = String(resp);
              if (Math.abs(x.val - target) < 1e-9 * target) {
                if (sh.decimals) return form('decimal', 'Right value — but give it exactly, with whole numbers and radicals only.');
                if (sh.divs || sh.pow || sh.paren) return form('simplify', 'Right value — now simplify it to the form ' + t('a\\sqrt{b}+c\\sqrt{d}') + '.');
                var ms = []; raw.replace(/\\sqrt\{(\d+)\}|sqrt\((\d+)\)|√(\d+)|\\sqrt(\d)/g, function (_, p1, p2, p3, p4) { ms.push(+(p1 || p2 || p3 || p4)); return _; });
                var bad = ms.filter(function (m) { return !sqfree(m); });
                if (bad.length) return form('not-simplest', 'Right value, but ' + t('\\sqrt{' + bad[0] + '}') + ' is not in simplest form: take out the perfect-square factor.');
                if (sh.roots > 2 || sh.ops > 1) return form('simplify', 'Right value — now collect it into two terms, ' + t('a\\sqrt{b}+c\\sqrt{d}') + '.');
                return ok();
              }
              if (!sh.roots && Math.abs(x.val - target) < 0.02 * target) return form('decimal', 'That’s a decimal approximation. The question asks for the <b>exact</b> value — leave the radicals in, like ' + t('a\\sqrt{b}+c\\sqrt{d}') + '.');
              for (var i = 0; i < altsList.length; i++) if (Math.abs(x.val - altsList[i].v) < 1e-6 * target) return wrong(altsList[i].code, altsList[i].hint);
              return wrong('value', null);
            };
            var p = B.math('Determine the exact <b>surface area</b> of the pyramid, base included.', check, keyT,
              'Base: ' + t('A_{\\text{Base}}=\\tfrac{3\\sqrt3}{2}(' + a + ')^2=' + radT(c1, 3)) + ' ft².<br>Surface area uses the slant height. Its horizontal leg is the apothem ' + t('\\tfrac{' + a + '\\sqrt3}{2}=' + radT(a / 2, 3)) + ' ft, so<br>' +
              t('s=\\sqrt{h^2+(' + radT(a / 2, 3) + ')^2}=\\sqrt{' + k + '+' + (3 * a * a / 4) + '}=\\sqrt{' + s2 + '}' + (ss[0] > 1 ? '=' + radT(ss[0], ss[1]) : '')) + ' ft.<br>' +
              'Lateral area ' + t('=6\\times\\tfrac12(' + a + ')(' + radT(ss[0], ss[1]) + ')=' + radT(c2, ss[1])) + ' ft², so<br>' + t('SA=' + keyT) + ' ft² (leave both radicals; don’t use decimals).',
              ['Base: 6 equilateral triangles. Faces: 6 triangles of base ' + t(a) + ' and height ' + t('s') + '.', 'The slant height’s horizontal leg is the apothem, ' + t('\\tfrac{\\sqrt3}{2}a') + '.'], 'hex pyramid exact SA', { keys: 'radical', after: 'ft²' });
            p.answer = t(keyT) + ' ft²'; p.good = [radT(c2, ss[1]) + '+' + radT(c1, 3)]; p.bad = [target.toFixed(2)].concat(altsList.map(function (z) { return String(z.v.toFixed(3)); }));
            return p;
          } }] },
      { num: '11', stem: function (o) { return 'An architecture firm designs two square-based glass pyramid atriums. Atrium A has a height of ' + t(o.hA + uT('ft')) + ' and a square base with sides of ' + t(o.aA + uT('ft')) + '; it is covered with ' + t(o.nR) + ' rhombus-shaped and ' + t(o.nT) + ' triangular glass panels (the base is not glass). Atrium B has a height of ' + t(o.hB + uT('ft')) + ' and a square base with sides of ' + t(o.aB + uT('ft')) + '.'; },
        shared: function (r) {
          var k = r.pick([8, 10, 12, 14, 15, 16, 18, 20]), swap = r.chance(0.35), m = swap ? 4 * k : 3 * k, hA = swap ? 3 * k : 4 * k;
          var aB = r.pick([40, 50, 60, 70]), hB = r.pick([30, 35, 40, 45, 50]);
          if (r.chance(0.15)) { k = 15; m = 45; hA = 60; aB = 60; hB = 45; }
          return { aA: 2 * m, m: m, hA: hA, sA: 5 * k, aB: aB, hB: hB, nR: r.pick([360, 480, 600]), nT: r.pick([48, 60, 72]) };
        },
        parts: [
          { id: '11a', sub: 'a', level: 'PRG', make: function (r, o) {
            var L = 2 * o.aA * o.sA, want = Math.round(L / 100) * 100, alts = [{ v: L + o.aA * o.aA, code: 'extra-base', hint: 'The base is <b>not</b> glass — count only the four triangular faces.' }, { v: 2 * o.aA * o.hA, code: 'sa-height', hint: Hh.saHeight }, { v: 2 * o.aA * hyp(o.hA, o.aA), code: 'half-edge', hint: Hh.halfEdge }, { v: 4 * o.aA * o.sA, code: 'tri-half', hint: Hh.triHalf }];
            var check = function (resp) {
              var p = HW.parse.number(resp); if (!p.ok) return form(p.code === 'empty' ? 'empty' : 'notnumber', p.code === 'empty' ? 'Type your answer first.' : 'Enter a single number.');
              if (Math.abs(p.value - want) < 1e-9) return ok();
              if (Math.abs(p.value - L) < 1 && Math.round(p.value / 100) * 100 === want) return form('round', 'Right — now round it to the nearest hundred square feet.');
              for (var i = 0; i < alts.length; i++) if (Math.abs(p.value - alts[i].v) <= Math.max(60, alts[i].v * 0.003)) return wrong(alts[i].code, alts[i].hint);
              return wrong('value', null);
            };
            return { prompt: 'To the nearest hundred square feet, how many square feet of glass are in Atrium A?', input: { type: 'number', after: 'ft²' }, check: check, key: String(want), answer: t(F(want)) + ' ft²',
              solution: 'Glass is the four triangular faces only (the base is not glass), so use the slant height. Half a base side is ' + t(o.aA + '\\div2=' + o.m) + ' ft:<br>' + t('s=\\sqrt{' + o.hA + '^2+' + o.m + '^2}=\\sqrt{' + F(o.sA * o.sA) + '}=' + o.sA) + ' ft.<br>' +
                'Lateral ' + t('=4\\left(\\tfrac12(' + o.aA + ')(' + o.sA + ')\\right)=' + F(L)) + ' ft² ' + (want === L ? '— already a multiple of 100.' : t('\\approx ' + F(want)) + ' ft².') + '<br>(The panel counts aren’t needed — they only say how the same area is cut up.)',
              hints: ['Glass = the four triangles. Each has base ' + t(o.aA) + ' and height = the slant height.'], text: 'atrium glass', bad: alts.map(function (z) { return String(Math.round(z.v / 100) * 100); }).filter(function (b) { return b !== String(want); }) };
          } },
          { id: '11b', sub: 'b', level: 'PRG', make: function (r, o) {
            var VA = o.aA * o.aA * o.hA / 3, VB = o.aB * o.aB * o.hB / 3, q = VA / VB;
            return near('How many times as great as the volume of Atrium B is the volume of Atrium A? Answer to the nearest tenth.', q, 1, 'times',
              [{ v: VB / VA, code: 'scale-flip', hint: 'Divide Atrium A’s volume by Atrium B’s (A is compared with B).' }, { v: (o.aA * o.hA) / (o.aB * o.hB), code: 'no-square', hint: 'Each base is a square: its area is the side <b>squared</b>.' }, { v: o.aA / o.aB, code: 'scale-linear', hint: 'Compare the volumes, not the side lengths: ' + t('V=\\tfrac13 s^2h') + ' for each atrium.' }, { v: (o.aA * o.aA * hyp(o.hA, o.aA / 2)) / (o.aB * o.aB * hyp(o.hB, o.aB / 2)), code: 'vol-slant', hint: Hh.volSlant }],
              'Volume uses each atrium’s perpendicular height.<br>' + t('V_A=\\tfrac13(' + o.aA + ')^2(' + o.hA + ')=' + F(VA)) + ' ft³<br>' + t('V_B=\\tfrac13(' + o.aB + ')^2(' + o.hB + ')=' + F(VB)) + ' ft³<br>' + t('\\dfrac{V_A}{V_B}=\\dfrac{' + F(VA) + '}{' + F(VB) + '}=' + (Number.isInteger(q * 1000) ? nn(q) : dd(q)) + '\\approx ' + rr(q, 1)) + ' times.',
              ['Find both volumes, then divide A’s by B’s.'], 'atrium volume ratio');
          } }] },
      { num: '12', stem: '', parts: [
        { id: '12', level: 'ADV', make: function (r) {
          var d = r.pick([12, 14, 16, 18, 20, 22, 24]), hv = r.pick([5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9]); if (r.chance(0.15)) { d = 18; hv = 7.5; }
          var rf = d / 2, rm = rf * 0.3048, hm = hv * 0.3048, V = PI * rm * rm * hm / 3, Vft = PI * rf * rf * hv / 3;
          return near('Sand dropped from a conveyor belt forms a conical pile with a diameter of ' + t(d1(d) + uT('ft')) + ' and a height of ' + t(d1(hv) + uT('ft')) + '. Determine the volume of the sand pile to the nearest ' + t('0.01\\text{ m}^3') + '. (' + t('1\\text{ ft}=0.3048\\text{ m}') + ')', V, 2, 'm³',
            [{ v: Vft, code: 'no-convert', hint: 'That’s the volume in <b>cubic feet</b>. The answer is wanted in m³: convert the lengths to metres first.' }, { v: Vft * 0.3048, code: 'conv-linear', hint: 'A volume can’t be converted with the length factor: ' + t('1\\text{ ft}^3=0.3048^3\\text{ m}^3') + '. Easier: convert the radius and height to metres first.' }, { v: Vft * 0.3048 * 0.3048, code: 'conv-square', hint: 'Cubic units need the factor <b>cubed</b>: ' + t('1\\text{ ft}^3=0.3048^3\\text{ m}^3') + '.' }, { v: 4 * V, code: 'diam-radius', hint: Hh.diam }, { v: 3 * V, code: 'no-third', hint: Hh.noThirdCone }, { v: Vft / 0.3048, code: 'conv-flip', hint: 'Feet to metres: multiply by 0.3048 (a metre is longer, so the number gets smaller).' }],
            t('r=' + d1(d) + '\\div2=' + nn(rf)) + ' ft and ' + t('h=' + d1(hv)) + ' ft. Convert the two lengths first:<br>' + t('r=' + nn(rf) + '(0.3048)=' + nn(rm)) + ' m, ' + t('h=' + d1(hv) + '(0.3048)=' + nn(hm)) + ' m.<br>' +
            t('V=\\tfrac13\\pi r^2h=\\tfrac13\\pi(' + nn(rm) + ')^2(' + nn(hm) + ')=' + dd(V) + '\\approx ' + rr(V, 2)) + ' m³.<br>(Converting at the end needs the cubed factor: ' + t(dd(Vft) + '\\times 0.3048^3') + ' gives the same.)',
            ['Convert the radius and height to metres, then use ' + t('V=\\tfrac13\\pi r^2h') + '.'], 'sand pile m3');
        } }] },
      { num: '13', stem: '', parts: [
        { id: '13', level: 'PRG', make: function (r) {
          var k = r.pick([3, 3, 4, 5]), word = { 3: 'tripled', 4: 'quadrupled', 5: 'multiplied by 5' }[k];
          var fr = function (n) { return t('\\dfrac{1}{' + n + '}'); };
          return mc(r, '<i>(Multiple choice)</i> A square-based pyramid has each side length of its base ' + word + ', but the height remains the same. The volume of the original pyramid is what fraction of the volume of the new pyramid?', [
            { html: fr(k * k), right: true },
            { html: fr(k), why: 'The side appears <b>squared</b> in ' + t('V=\\tfrac13 s^2h') + ', so the volume changes by ' + t(k + '^2') + ', not ' + t(k) + '.', code: 'linear' },
            { html: fr(2 * k), why: 'Try it: ' + t('V_{\\text{new}}=\\tfrac13(' + k + 's)^2h') + '. What does ' + t('(' + k + 's)^2') + ' simplify to?', code: 'double' },
            { html: fr(k * k * k), why: 'Only the two base dimensions grew — the height stayed the same — so it is ' + t(k + '^2') + ', not ' + t(k + '^3') + '.', code: 'cube' }],
            t('V_{\\text{orig}}=\\tfrac13 s^2h') + '. With the side ' + word + ': ' + t('V_{\\text{new}}=\\tfrac13(' + k + 's)^2h=' + (k * k) + '\\left(\\tfrac13 s^2h\\right)=' + (k * k) + 'V_{\\text{orig}}') + '.<br>So the original is ' + t('\\tfrac{1}{' + (k * k) + '}') + ' of the new one — the side is squared in the formula.',
            ['Write the volume with ' + t(k + 's') + ' in place of ' + t('s') + ' and simplify.'], 'side x' + k + ' volume fraction');
        } }] },
      { num: '14', stem: '', parts: [
        { id: '14', level: 'PRG', make: function (r) {
          var c = r.pick([[3, 3], [3, 3], [2, 2], [2, 4], [3, 9], [4, 8], [4, 16], [2, 3], [3, 2], [4, 4], [3, 6]]), a = c[0], b = c[1], q = a * a / b;
          var aw = { 2: 'doubled', 3: 'tripled', 4: 'quadrupled' }[a];
          var qt = Number.isInteger(q) ? String(q) : ex.texRat(ex.norm(a * a, b));
          var common = 'The radius is squared but the height is not: ' + t('\\times' + a + '^2=\\times' + (a * a)) + ' from the radius and ' + t('\\times\\tfrac{1}{' + b + '}') + ' from the height, so overall ' + t('\\times' + qt) + '.';
          var opts = [{ html: 'The new volume equals the original volume.', right: q === 1, why: common, code: 'eq' }, { html: 'The new volume is twice the original volume.', right: q === 2, why: common, code: 'twice' },
            { html: 'The new volume is three times the original volume.', right: q === 3, why: common, code: 'three' }, { html: 'None of the above is correct.', right: [1, 2, 3].indexOf(q) < 0, why: 'Work it out: ' + t('\\tfrac13\\pi(' + a + 'r)^2\\left(\\tfrac{h}{' + b + '}\\right)') + ' — the factor is one of the listed ones.', code: 'none' }];
          return mc(r, '<i>(Multiple choice)</i> A cone has its radius ' + aw + ' and its height reduced to ' + t('\\dfrac{1}{' + b + '}') + ' of its original value. Which statement is correct?', opts,
            t('V_{\\text{new}}=\\tfrac13\\pi(' + a + 'r)^2\\left(\\tfrac{h}{' + b + '}\\right)=\\tfrac{' + (a * a) + '}{' + b + '}\\left(\\tfrac13\\pi r^2h\\right)=' + qt + 'V_{\\text{orig}}') + '. ' + ([1, 2, 3].indexOf(q) >= 0 ? '' : 'That is none of the listed multiples. ') + 'The radius is squared but the height is not.',
            ['Put ' + t(a + 'r') + ' and ' + t('\\tfrac{h}{' + b + '}') + ' into ' + t('V=\\tfrac13\\pi r^2h') + '.'], 'cone r x' + a + ' h /' + b, true);
        } }] },
      { num: '15', stem: '', parts: [
        { id: '15', level: 'PRG', make: function (r) {
          var rv, V, hv; do { rv = r.int(8, 15); V = 500 * r.int(6, 18); hv = 3 * V / (PI * rv * rv); } while (hv < 10 || hv > 99); if (r.chance(0.15)) { rv = 12; V = 5000; hv = 3 * V / (PI * 144); }
          return near('<i>(Numerical response)</i> An engineer is designing a cone-shaped storage silo with a base radius of ' + t(rv + uT('m')) + ' that is to hold ' + t(F(V) + uT('m', 3)) + ' of grain. The height of the silo, to the nearest tenth of a metre, is ____.', hv, 1, '',
            [{ v: hv / 3, code: 'no-third', hint: 'Rearrange ' + t('V=\\tfrac13\\pi r^2h') + ': the ' + t('\\tfrac13') + ' becomes a factor of 3 on top — ' + t('h=\\frac{3V}{\\pi r^2}') + '.' }, { v: hv * rv, code: 'no-square', hint: Hh.noSquare }, { v: hv / 4, code: 'diam-radius', hint: 'The ' + t(rv) + ' m is already the radius — don’t halve it or double it.' }],
            'Rearrange for the perpendicular height: ' + t('h=\\dfrac{3V}{\\pi r^2}=\\dfrac{3(' + F(V) + ')}{\\pi(' + rv + ')^2}=\\dfrac{' + F(3 * V) + '}{' + (rv * rv) + '\\pi}=' + dd(hv) + '\\approx ' + rr(hv, 1)) + ' m.',
            ['Multiply the volume by 3, then divide by ' + t('\\pi r^2') + '.'], 'silo height from V', { nr: true });
        } }] },
      { num: '16', stem: '', parts: [
        { id: '16', level: 'ADV', make: function (r) {
          var l, W, hv; do { l = r.int(4, 9); W = r.int(5, 13); hv = r.int(9, 18); } while ((l * W * hv) % 3 || W === l); if (r.chance(0.15)) { l = 6; W = 9; hv = 15; }
          var V = l * W * hv / 3, cm = W * 30.48;
          return near('<i>(Numerical response)</i> A rectangular-based pyramid has a base length of ' + t(l + uT('ft')) + ' and a height of ' + t(hv + uT('ft')) + '. It has a volume of ' + t(V + uT('ft', 3)) + '. The base width of the pyramid, to the nearest <b>centimetre</b>, is ____. (' + t('1\\text{ ft}=30.48\\text{ cm}') + ')', cm, 0, '',
            [{ v: W, code: 'no-convert', hint: 'That’s the width in <b>feet</b>. The answer is wanted in centimetres: ' + t('1\\text{ ft}=30.48\\text{ cm}') + '.' }, { v: W * 12, code: 'no-convert', hint: 'That’s inches. The answer is wanted in centimetres: ' + t('1\\text{ ft}=30.48\\text{ cm}') + '.' }, { v: cm / 3, code: 'no-third', hint: 'Rearrange ' + t('V=\\tfrac13 LWh') + ': ' + t('W=\\frac{3V}{Lh}') + '.' }, { v: W / 30.48, code: 'conv-flip', hint: 'Feet to centimetres: multiply by 30.48 (centimetres are smaller, so the number gets bigger).' }],
            'For a rectangular base, ' + t('V=\\tfrac13 LWh') + ', so ' + t('W=\\dfrac{3V}{Lh}=\\dfrac{3(' + V + ')}{(' + l + ')(' + hv + ')}=\\dfrac{' + 3 * V + '}{' + l * hv + '}=' + W) + ' ft.<br>In centimetres: ' + t(W + '(30.48)=' + nn(cm)) + ' cm ' + t('\\to ' + Math.round(cm)) + '.',
            ['Solve for the width in feet first, then convert.'], 'pyramid width cm', { nr: true });
        } }] },
      { num: '17', stem: function (o) { return 'A closed cone has a surface area of ' + t(o.SA + uT('cm', 2)) + ' and a base radius of ' + t(o.r + uT('cm')) + '.'; },
        shared: function (r) {
          var rv, SA, s; do { rv = r.int(3, 9); SA = 10 * r.int(8, 60); s = SA / (PI * rv) - rv; } while (s < rv + 1.5 || s > 2.6 * rv); if (r.chance(0.15)) { rv = 6; SA = 300; s = SA / (PI * 6) - 6; }
          return { r: rv, SA: SA, s: s, h: leg(s, rv) };
        },
        parts: [
          { id: '17a', sub: 'a', level: 'ADV', make: function (r, o) {
            return near('Determine the slant height ' + t('s') + ', to the nearest tenth of a centimetre.', o.s, 1, 'cm',
              [{ v: o.SA / (PI * o.r), code: 'sa-no-base', hint: 'The cone is <b>closed</b>: ' + t('SA=\\pi r^2+\\pi rs') + '. Subtract the base ' + t('\\pi r^2') + ' before dividing by ' + t('\\pi r') + '.' }, { v: (o.SA - PI * o.r * o.r) / PI, code: 'no-subtract', hint: 'After subtracting the base, divide by ' + t('\\pi r') + ' (that is, by ' + t('\\pi') + ' <b>and</b> by ' + t(o.r) + ').' }, { v: (o.SA - o.r * o.r) / (PI * o.r), code: 'no-subtract', hint: 'The base area is ' + t('\\pi r^2') + ' — include the ' + t('\\pi') + '.' }],
              t('SA=\\pi r^2+\\pi rs') + '<br>' + t(o.SA + '=\\pi(' + o.r + ')^2+\\pi(' + o.r + ')s=' + (o.r * o.r) + '\\pi+' + o.r + '\\pi s') + '<br>' + t(o.r + '\\pi s=' + o.SA + '-' + (o.r * o.r) + '\\pi=' + dd(o.SA - PI * o.r * o.r)) + '<br>' + t('s=\\dfrac{' + dd(o.SA - PI * o.r * o.r) + '}{' + dd(PI * o.r) + '}=' + dd(o.s) + '\\approx ' + rr(o.s, 1)) + ' cm.',
              ['Substitute into ' + t('SA=\\pi r^2+\\pi rs') + ' and solve for ' + t('s') + '.'], 'cone s from SA');
          } },
          { id: '17b', sub: 'b', level: 'ADV', make: function (r, o) {
            var sR = K.roundTo(o.s, 1);
            return near('The slant height is ' + t('s\\approx ' + rr(o.s, 1)) + ' cm (keep the unrounded value from ' + t('SA=\\pi r^2+\\pi rs') + ' in your calculator). Use ' + t('s') + ' to determine the perpendicular height ' + t('h') + ', to the nearest tenth of a centimetre.', o.h, 1, 'cm',
              [{ v: hyp(o.s, o.r), code: 'pyth-add', hint: Hh.pythLeg }, { v: leg(sR, o.r), code: 'early-round', hint: Hh.early }],
              t('s=\\dfrac{' + o.SA + '-' + (o.r * o.r) + '\\pi}{' + o.r + '\\pi}=' + dd(o.s)) + ' cm.<br>' + t('h=\\sqrt{s^2-r^2}=\\sqrt{' + dd(o.s) + '^2-' + o.r + '^2}=\\sqrt{' + dd(o.s * o.s - o.r * o.r) + '}=' + dd(o.h) + '\\approx ' + rr(o.h, 1)) + ' cm (using the unrounded ' + t('s') + ').',
              ['The slant height is the hypotenuse: ' + t('h^2=s^2-r^2') + '.'], 'cone h from s');
          } }] },
      { num: '18', stem: function (o) { return 'A grain silo is a cylinder with radius ' + t(o.r + uT('m')) + ' and height ' + t(o.H + uT('m')) + ', topped by a cone with the same radius and a height of ' + t(o.hc + uT('m')) + '. The silo stands on the ground.<br>' + siloSvg({ r: 'r = ' + o.r + ' m', H: o.H + ' m', hc: o.hc + ' m', ground: 1 }); },
        shared: function (r) { var rv = r.int(2, 5), H = r.int(6, 14), hc = r.int(1, 4); if (r.chance(0.15)) { rv = 3; H = 10; hc = 2; } return { r: rv, H: H, hc: hc, s: hyp(rv, hc) }; },
        parts: [
          { id: '18a', sub: 'a', level: 'PRG', make: function (r, o) {
            var Vc = PI * o.r * o.r * o.H, Vk = PI * o.r * o.r * o.hc / 3, V = Vc + Vk;
            return near('Determine the volume of the silo, to the nearest tenth of a cubic metre.', V, 1, 'm³',
              [{ v: Vc + 3 * Vk, code: 'no-third', hint: 'The roof is a cone: ' + t('\\tfrac13\\pi r^2h') + '.' }, { v: Vc / 3 + Vk, code: 'cyl-third', hint: 'Only the cone gets the ' + t('\\tfrac13') + ' — the cylinder is ' + t('\\pi r^2h') + '.' }, { v: Vc + PI * o.r * o.r * o.s / 3, code: 'vol-slant', hint: Hh.volSlant }, { v: Vc, code: 'missing-part', hint: 'Add the volume of the cone roof too.' }],
              'Cylinder: ' + t('\\pi r^2h=\\pi(' + o.r + ')^2(' + o.H + ')=' + (o.r * o.r * o.H) + '\\pi') + '. Cone: ' + t('\\tfrac13\\pi r^2h=\\tfrac13\\pi(' + o.r + ')^2(' + o.hc + ')=' + pc(o.r * o.r * o.hc / 3) + '\\pi') + '.<br>' + t('V=' + pc(o.r * o.r * o.H + o.r * o.r * o.hc / 3) + '\\pi=' + dd(V) + '\\approx ' + rr(V, 1)) + ' m³.',
              ['Volume of a composite solid = the sum of the parts.'], 'silo volume');
          } },
          { id: '18b', sub: 'b', level: 'ADV', make: function (r, o) {
            var W = 2 * PI * o.r * o.H, R = PI * o.r * o.s, A = W + R;
            return near('Determine the area of the outside of the silo that must be painted (walls and roof, not the ground), to the nearest tenth of a square metre.', A, 1, 'm²',
              [{ v: A + PI * o.r * o.r, code: 'extra-circle', hint: 'You added a circle. Neither circle is painted: the one where the cone meets the cylinder is hidden inside, and the bottom one is on the ground.' }, { v: A + 2 * PI * o.r * o.r, code: 'extra-circle', hint: 'Neither circle is painted: the one where the cone meets the cylinder is hidden inside, and the bottom one is on the ground.' }, { v: W + PI * o.r * o.hc, code: 'sa-height', hint: 'The roof’s surface uses its <b>slant height</b>: ' + t('s=\\sqrt{h^2+r^2}') + '.' }, { v: PI * o.r * o.H + R, code: 'cyl-wall', hint: 'The cylinder’s curved wall is ' + t('2\\pi rh') + ' (the circumference times the height).' }, { v: W + PI * o.r * K.roundTo(o.s, 1), code: 'early-round', hint: Hh.early }],
              'Wall (curved surface only): ' + t('2\\pi rh=2\\pi(' + o.r + ')(' + o.H + ')=' + (2 * o.r * o.H) + '\\pi=' + dd(W)) + ' m².<br>Roof: ' + t('s=\\sqrt{' + o.hc + '^2+' + o.r + '^2}=\\sqrt{' + (o.hc * o.hc + o.r * o.r) + '}=' + dd(o.s)) + ' m, so ' + t('\\pi rs=' + dd(R)) + ' m².<br>Total ' + t('=' + dd(A) + '\\approx ' + rr(A, 1)) + ' m².',
              ['Wall ' + t('2\\pi rh') + ' plus roof ' + t('\\pi rs') + ' — no circles.'], 'silo paint');
          } },
          { id: '18c', sub: 'c', level: 'EMG', make: function (r, o) {
            return mc(r, 'Why is the circle where the cone meets the cylinder not included in the painted area?', [
              { html: 'It is the top of the cylinder <b>and</b> the base of the cone, hidden inside the silo — it is not on the outside surface.', right: true },
              { html: 'It is on the ground, so it can’t be painted.', why: 'That’s the <b>bottom</b> circle. The one where the cone meets the cylinder is up at the top of the wall.', code: 'ground' },
              { html: 'The cone’s curved surface ' + t('\\pi rs') + ' already includes it.', why: t('\\pi rs') + ' is only the sloping part of the cone. The circle is a separate flat face — but where is it?', code: 'included' },
              { html: 'Its area, ' + t('\\pi r^2') + ', is too small to matter.', why: t('\\pi(' + o.r + ')^2\\approx ' + rr(PI * o.r * o.r, 1)) + ' m² is not small. It is left out for a different reason.', code: 'small' }],
              'That circle is a shared face: the top of the cylinder and the base of the cone. It is inside the silo, so it is removed from <b>both</b> parts. (The ground circle is left out for a different reason: the silo stands on it.)',
              ['Where is that circle once the roof is on?'], 'silo hidden face');
          } }] }
    ],

    extra: [
      { num: '1', section: 'Extra practice A — Two Heights, One Right Triangle', stem: 'Each solid has its perpendicular height ' + t('h') + ' (dashed, apex to the centre of the base) and its slant height ' + t('s') + '. Surface area uses ' + t('s') + '; volume uses ' + t('h') + '.', parts: [
        { id: 'e1a', sub: 'a i', level: 'LIM', make: function (r) {
          return B.grid('Right circular cone. Match each segment to its name.<br>' + cone({ r: 'r', h: 'h', s: 's', width: 240 }), [{ id: 'v', html: 'from the apex straight down to the centre of the base' }, { id: 'e', html: 'from the apex down the surface to the rim of the base' }, { id: 'c', html: 'from the centre of the base out to the rim' }],
            [{ id: 'h', html: 'perpendicular height ' + t('h') }, { id: 's', html: 'slant height ' + t('s') }, { id: 'r', html: 'radius ' + t('r') }], { v: 'h', e: 's', c: 'r' }, { why: function (row) { return row === 'e' ? 'The slant height runs along the <b>surface</b> of the cone.' : row === 'v' ? 'The height is measured straight down, perpendicular to the base.' : null; } },
            'Apex → centre: ' + t('h') + '. Apex → rim along the surface: ' + t('s') + '. Centre → rim: ' + t('r') + '.', ['The slant height lies on the surface; the height is inside the cone.'], 'cone segments');
        } },
        { id: 'e1a2', sub: 'a iii', level: 'BEG', make: function (r) {
          return mc(r, 'In the right circular cone, which equation links ' + t('r') + ', ' + t('h') + ' and ' + t('s') + '?<br>' + cone({ r: 'r', h: 'h', s: 's', width: 190 }), [
            { html: t('s^2=r^2+h^2'), right: true },
            { html: t('h^2=r^2+s^2'), why: 'The hypotenuse is opposite the right angle (at the centre of the base). Which segment is that?', code: 'h-hyp' },
            { html: t('r^2=h^2+s^2'), why: 'The radius is a leg — it meets the height at the right angle.', code: 'r-hyp' },
            { html: t('s=r+h'), why: 'Lengths in a right triangle don’t add like that — use Pythagoras.', code: 'add' }],
            'Legs ' + t('h') + ' and ' + t('r') + ' meet at the right angle at the centre; the hypotenuse is ' + t('s') + '. So ' + t('s^2=r^2+h^2') + ', and ' + t('s>h') + ', ' + t('s>r') + ' in every cone.', ['The hypotenuse is the side opposite the right angle.'], 'cone pythagoras');
        } },
        { id: 'e1b', sub: 'b', level: 'EMG', make: function (r) {
          return mc(r, 'A right square-based pyramid has base edge ' + t('a') + '. The slant height runs from the apex to the <b>midpoint</b> of a base edge. Which equation links ' + t('h') + ', ' + t('s') + ' and ' + t('a') + '?<br>' + HW.solid('sqpyramid', { s: 'a', h: 'h', sl: 's', width: 200 }), [
            { html: t('s^2=h^2+\\left(\\tfrac{a}{2}\\right)^2'), right: true },
            { html: t('s^2=h^2+a^2'), why: Hh.halfEdge, code: 'full' },
            { html: t('h^2=s^2+\\left(\\tfrac{a}{2}\\right)^2'), why: 'The slant height is the hypotenuse here, so it is ' + t('s^2') + ' that equals the sum.', code: 'h-hyp' },
            { html: t('s^2=h^2+2a^2'), why: 'The horizontal leg goes from the centre of the square to the middle of one edge.', code: 'diag' }],
            'Legs: ' + t('h') + ' and the segment from the centre of the square to the midpoint of an edge, ' + t('\\tfrac{a}{2}') + '. Hypotenuse: ' + t('s') + '. So ' + t('s^2=h^2+\\left(\\tfrac a2\\right)^2') + '.', ['Where does the horizontal leg start and end?'], 'pyramid pythagoras');
        } },
        { id: 'e1c', sub: 'c', level: 'EMG', make: function (r) {
          return mc(r, 'In a right square-based pyramid with base edge ' + t('a') + ' and height ' + t('h') + ', the slant height’s horizontal leg is ' + t('\\tfrac{a}{2}') + ', not ' + t('a') + '. What would ' + t('\\sqrt{h^2+a^2}') + ' measure?', [
            { html: 'Nothing in the solid: its horizontal leg would overshoot the base edge and end <b>outside</b> the square.', right: true },
            { html: 'The slant height ' + t('s') + '.', why: 'The slant height lands on the midpoint of an edge, which is only ' + t('\\tfrac a2') + ' from the centre.', code: 'slant' },
            { html: 'The lateral edge (apex to a corner).', why: 'A corner is ' + t('\\tfrac a2') + ' across and ' + t('\\tfrac a2') + ' along from the centre: the lateral edge is ' + t('\\sqrt{h^2+\\tfrac{a^2}{4}+\\tfrac{a^2}{4}}') + ', shorter than ' + t('\\sqrt{h^2+a^2}') + '.', code: 'edge' },
            { html: 'The perpendicular height ' + t('h') + '.', why: 'The height is a leg, not a hypotenuse.', code: 'h' }],
            'The slant height lands on the midpoint of a base edge, so its horizontal partner runs from the centre to that midpoint: ' + t('\\tfrac a2') + '. A horizontal leg of length ' + t('a') + ' would end outside the square, so ' + t('\\sqrt{h^2+a^2}') + ' is not a length of the pyramid.', ['From the centre of a square to the middle of a side is half a side.'], 'why a/2');
        } }] },
      { num: '2', stem: 'Find the missing height. Give an exact value where one exists, otherwise round to the nearest tenth.', parts: [
        { id: 'e2a', sub: 'a', level: 'EMG', make: function (r) {
          var T = triple(r, function (a, b, c) { return a >= 5 && a <= 12 && b > a && c <= 45; }); if (r.chance(0.15)) T = [9, 40, 41];
          return exact('A cone with ' + t('r=' + T[0] + uT('cm')) + ' and ' + t('s=' + T[2] + uT('cm')) + '. Find the perpendicular height ' + t('h') + '.', T[1], 'cm', [{ v: hyp(T[0], T[2]), code: 'pyth-add', hint: Hh.pythLeg }],
            'Cone; finding the <b>perpendicular</b> height from the slant height. ' + t('h^2=s^2-r^2=' + T[2] + '^2-' + T[0] + '^2=' + (T[1] * T[1])) + ', so ' + t('h=' + T[1]) + ' cm (exact).', ['The slant height is the hypotenuse.'], 'cone h from r,s');
        } },
        { id: 'e2b', sub: 'b', level: 'BEG', make: function (r) {
          var rv = r.int(4, 14), hv = r.int(3, 12), s; while (Number.isInteger(hyp(rv, hv))) hv++; s = hyp(rv, hv); if (r.chance(0.15)) { rv = 11; hv = 5; s = hyp(11, 5); }
          return near('A cone with ' + t('r=' + d1(rv) + uT('m')) + ' and ' + t('h=' + d1(hv) + uT('m')) + '. Find the slant height ' + t('s') + ' (nearest tenth).', s, 1, 'm', [{ v: Math.sqrt(Math.abs(rv * rv - hv * hv)), code: 'pyth-add', hint: Hh.pythHyp }, { v: rv + hv, code: 'pyth-add', hint: 'Use Pythagoras: ' + t('s^2=r^2+h^2') + ', then take the square root.' }],
            'Cone; finding the <b>slant</b> height. ' + t('s^2=' + d1(rv) + '^2+' + d1(hv) + '^2=' + (rv * rv + hv * hv)) + ', so ' + t('s=\\sqrt{' + (rv * rv + hv * hv) + '}=' + dd(s) + '\\approx ' + rr(s, 1)) + ' m.', ['The slant height is the hypotenuse of the triangle with legs ' + t('r') + ' and ' + t('h') + '.'], 'cone s from r,h');
        } },
        { id: 'e2c', sub: 'c', level: 'EMG', make: function (r) {
          var T = triple(r, function (m, h) { return m >= 4 && m <= 12 && h >= 6 && h <= 24; }); if (r.chance(0.15)) T = [8, 15, 17];
          var a = 2 * T[0];
          return near('A square pyramid with base edge ' + t(a + uT('in')) + ' and ' + t('h=' + T[1] + uT('in')) + '. Find the slant height ' + t('s') + '.', T[2], 0, 'in', [{ v: hyp(a, T[1]), code: 'half-edge', hint: Hh.halfEdge }],
            'The horizontal leg is half the base edge: ' + t(a + '\\div2=' + T[0]) + ' in.<br>' + t('s^2=h^2+\\left(\\tfrac a2\\right)^2=' + T[1] + '^2+' + T[0] + '^2=' + T[2] * T[2]) + ', so ' + t('s=' + T[2]) + ' in (exact).', ['The slant height goes to the middle of an edge.'], 'pyramid s from a,h');
        } },
        { id: 'e2d', sub: 'd', level: 'EMG', make: function (r) {
          var T = triple(r, function (m, h) { return m >= 3 && m <= 12 && h >= 4 && h <= 24; }); if (r.chance(0.15)) T = [5, 12, 13];
          var a = 2 * T[0];
          return near('A square pyramid with base edge ' + t(a + uT('cm')) + ' and ' + t('s=' + T[2] + uT('cm')) + '. Find the perpendicular height ' + t('h') + '.', T[1], 0, 'cm', [{ v: Math.sqrt(Math.max(0, T[2] * T[2] - a * a)), code: 'half-edge', hint: Hh.halfEdge }, { v: hyp(T[2], T[0]), code: 'pyth-add', hint: Hh.pythLeg }],
            'Half the base edge is ' + t(a + '\\div2=' + T[0]) + ' cm.<br>' + t('h^2=s^2-\\left(\\tfrac a2\\right)^2=' + T[2] + '^2-' + T[0] + '^2=' + T[1] * T[1]) + ', so ' + t('h=' + T[1]) + ' cm (exact).', ['The slant height is the hypotenuse; one leg is half the edge.'], 'pyramid h from a,s');
        } }] },
      { num: '3', stem: 'Two measurement reports are impossible.', parts: [
        { id: 'e3a', sub: 'a', level: 'EMG', make: function (r) {
          var hv = r.int(8, 15), s = hv - r.int(1, 4); if (r.chance(0.15)) { hv = 10; s = 8; }
          return mc(r, '“A cone of perpendicular height ' + t(hv + uT('cm')) + ' and slant height ' + t(s + uT('cm')) + '.” Why can’t this cone exist?', [
            { html: 'The slant height is the hypotenuse, so it must be longer than the height: every cone has ' + t('s>h') + '.', right: true },
            { html: 'The slant height must be exactly twice the height.', why: 'There is no fixed ratio — but there is an inequality. Which side of a right triangle is the longest?', code: 'twice' },
            { html: 'The radius would have to be ' + t(hv - s) + ' cm, which is too small.', why: 'Try Pythagoras: ' + t('r^2=s^2-h^2=' + (s * s) + '-' + (hv * hv)) + '. What is wrong with that?', code: 'diff' },
            { html: 'Nothing is wrong: the radius is ' + t('\\sqrt{' + (s * s + hv * hv) + '}') + ' cm.', why: 'The radius is a leg: ' + t('r^2=s^2-h^2') + ', which is negative here.', code: 'fine' }],
            t('s^2=r^2+h^2') + ' gives ' + t('r^2=' + s + '^2-' + hv + '^2=' + (s * s - hv * hv)) + ', and no real radius has a negative square. The slant height is the hypotenuse, so every cone has ' + t('s>h') + ' (and ' + t('s>r') + ').', ['Which side of a right triangle is the longest?'], 'impossible cone');
        } },
        { id: 'e3b', sub: 'b', level: 'EMG', make: function (r) {
          var m = r.int(8, 15); if (r.chance(0.15)) m = 12;
          return mc(r, '“A square pyramid of base edge ' + t((2 * m) + uT('cm')) + ' and slant height ' + t(m + uT('cm')) + '.” What do these two numbers actually describe?', [
            { html: 'A flat square: ' + t('h^2=' + m + '^2-' + m + '^2=0') + ', so the apex would sit on the base.', right: true },
            { html: 'A very tall, thin pyramid.', why: 'Compute ' + t('h^2=s^2-\\left(\\tfrac a2\\right)^2') + ' with these numbers.', code: 'tall' },
            { html: 'A pyramid with height ' + t('\\sqrt{' + (m * m + 4 * m * m) + '}') + ' cm.', why: 'The height is a leg, so subtract: ' + t('h^2=s^2-\\left(\\tfrac a2\\right)^2') + '.', code: 'add' },
            { html: 'A cube.', why: 'Compute ' + t('h^2=s^2-\\left(\\tfrac a2\\right)^2') + ' with these numbers.', code: 'cube' }],
            t('\\tfrac a2=' + m) + ' cm, so ' + t('h^2=' + m + '^2-' + m + '^2=0') + ': the apex lies <b>on</b> the base. These numbers describe a flat ' + (2 * m) + ' cm square. Every real pyramid on this base needs ' + t('s>' + m) + ' cm.', ['Find ' + t('h') + '.'], 'impossible pyramid');
        } }] },
      { num: '4', section: 'Extra practice B — Surface Area Takes s, Volume Takes h', stem: function (o) { return 'A solid cone has base radius ' + t(d1(o.r) + uT('cm')) + ' and perpendicular height ' + t(d1(o.h) + uT('cm')) + '.<br>' + cone({ r: 'r = ' + d1(o.r) + ' cm', h: d1(o.h) + ' cm', width: 200 }); },
        shared: function (r) { var T = r.chance(0.3) ? [6, 8, 10] : triple(r, function (a, b) { return a >= 3 && a <= 12 && b >= 4 && b <= 16; }); return { r: T[0], h: T[1], s: T[2] }; },
        parts: [
          { id: 'e4a', sub: 'a', level: 'PRG', make: function (r, o) {
            var SA = PI * o.r * o.r + PI * o.r * o.s;
            return near('Determine the total surface area, to the nearest tenth of a square centimetre.', SA, 1, 'cm²', [{ v: PI * o.r * o.r + PI * o.r * o.h, code: 'sa-height', hint: Hh.saHeight }, { v: PI * o.r * o.s, code: 'sa-no-base', hint: Hh.noBaseCone }],
              'Surface area uses the slant height: ' + t('s=\\sqrt{' + o.r + '^2+' + o.h + '^2}=' + o.s) + ' cm.<br>' + t('SA=\\pi(' + o.r + ')^2+\\pi(' + o.r + ')(' + o.s + ')=' + (o.r * o.r + o.r * o.s) + '\\pi=' + dd(SA) + '\\approx ' + rr(SA, 1)) + ' cm².', ['Find ' + t('s') + ' first.'], 'cone SA');
          } },
          { id: 'e4b', sub: 'b', level: 'BEG', make: function (r, o) {
            var V = PI * o.r * o.r * o.h / 3;
            return near('Determine the volume, to the nearest tenth of a cubic centimetre.', V, 1, 'cm³', [{ v: PI * o.r * o.r * o.s / 3, code: 'vol-slant', hint: Hh.volSlant }, { v: 3 * V, code: 'no-third', hint: Hh.noThirdCone }],
              'Volume uses ' + t('h=' + o.h) + ' cm: ' + t('V=\\tfrac13\\pi(' + o.r + ')^2(' + o.h + ')=' + pc(o.r * o.r * o.h / 3) + '\\pi=' + dd(V) + '\\approx ' + rr(V, 1)) + ' cm³.', [t('V=\\tfrac13\\pi r^2h') + '.'], 'cone V');
          } },
          { id: 'e4c', sub: 'c', level: 'EMG', make: function (r, o) {
            var h2 = r.pick([7, 9, 10, 12]), s2 = hyp(6, h2), SA2 = 36 * PI + 6 * PI * s2, V2 = 12 * PI * h2;
            return mc(r, 'For a cone with ' + t('r=6.0') + ' cm and ' + t('h=8.0') + ' cm, the surface area and the volume both come out as ' + t('96\\pi\\approx 301.6') + '. What does that show?', [
              { html: 'Only that the <b>numerals</b> match: one is ' + t('\\text{cm}^2') + ' (a covering), the other ' + t('\\text{cm}^3') + ' (a capacity). With ' + t('h=' + h2 + '.0') + ' cm they differ: ' + t(rr(SA2, 1)) + ' cm² vs ' + t(rr(V2, 1)) + ' cm³.', right: true },
              { html: 'The surface area of a cone always equals its volume.', why: 'Try a different height, e.g. ' + t('h=' + h2) + ': ' + t('SA\\approx ' + rr(SA2, 1)) + ', ' + t('V\\approx ' + rr(V2, 1)) + '.', code: 'always' },
              { html: 'The surface area and the volume are equal for this cone.', why: 'An area and a volume can’t be equal — they measure different things in different units.', code: 'equal' },
              { html: 'One of the two calculations must be wrong.', why: 'Both are right: ' + t('36\\pi+60\\pi=96\\pi') + ' and ' + t('\\tfrac13\\pi(36)(8)=96\\pi') + '. It’s a coincidence of these numbers.', code: 'wrong' }],
              'The results are ' + t('96\\pi') + ' cm² and ' + t('96\\pi') + ' cm³ — the same numeral with different units. With ' + t('h=' + h2 + '.0') + ' cm: ' + t('s=\\sqrt{36+' + h2 * h2 + '}=' + dd(s2)) + ', ' + t('SA\\approx ' + rr(SA2, 1)) + ' cm², ' + t('V=' + (12 * h2) + '\\pi\\approx ' + rr(V2, 1)) + ' cm³ — not equal any more.', ['Look at the units.'], 'SA vs V coincidence');
          } }] },
      { num: '5', stem: function (o) { return 'A right pyramid has a square base of edge ' + t(o.a + uT('cm')) + ' and a slant height of ' + t(o.s + uT('cm')) + '.<br>' + HW.solid('sqpyramid', { s: o.a + ' cm', sl: 's = ' + o.s + ' cm', width: 200 }); },
        shared: function (r) { var T = r.chance(0.2) ? [9, 12, 15] : triple(r, function (m, h) { return m >= 3 && m <= 12 && h >= 4 && h <= 20; }); return { a: 2 * T[0], m: T[0], h: T[1], s: T[2] }; },
        parts: [
          { id: 'e5a', sub: 'a', level: 'BEG', make: function (r, o) {
            var SA = o.a * o.a + 2 * o.a * o.s;
            return near('Determine the total surface area, to the nearest square centimetre.', SA, 0, 'cm²', [{ v: 2 * o.a * o.s, code: 'sa-no-base', hint: Hh.noBasePyr }, { v: o.a * o.a + 4 * o.a * o.s, code: 'tri-half', hint: Hh.triHalf }, { v: o.a * o.a + 2 * o.a * o.h, code: 'sa-height', hint: 'The slant height ' + t(o.s) + ' is given and is exactly what the faces need.' }],
              'Base: ' + t(o.a + '^2=' + o.a * o.a) + ' cm². Four faces: ' + t('4\\times\\tfrac12(' + o.a + ')(' + o.s + ')=' + 2 * o.a * o.s) + ' cm².<br>' + t('SA=' + o.a * o.a + '+' + 2 * o.a * o.s + '=' + SA) + ' cm².', ['Base + four triangles of height ' + t('s') + '.'], 'pyramid SA from s');
          } },
          { id: 'e5b', sub: 'b', level: 'PRG', make: function (r, o) {
            var V = o.a * o.a * o.h / 3;
            return near('Determine the volume, to the nearest cubic centimetre.', V, 0, 'cm³', [{ v: o.a * o.a * o.s / 3, code: 'vol-slant', hint: Hh.volSlant + ' Find it from ' + t('s') + ' and half the edge.' }, { v: o.s > o.a ? o.a * o.a * leg(o.s, o.a) / 3 : NaN, code: 'half-edge', hint: Hh.halfEdge }, { v: o.a * o.a * o.h, code: 'no-third', hint: Hh.noThirdPyr }],
              'Volume needs ' + t('h') + ': ' + t('h^2=s^2-\\left(\\tfrac a2\\right)^2=' + o.s + '^2-' + o.m + '^2=' + o.h * o.h) + ', ' + t('h=' + o.h) + ' cm.<br>' + t('V=\\tfrac13(' + o.a * o.a + ')(' + o.h + ')=' + (Number.isInteger(V) ? V : dd(V))) + (Number.isInteger(V) ? '' : t('\\approx ' + rr(V, 0))) + ' cm³.', ['Find the perpendicular height first.'], 'pyramid V from s');
          } },
          { id: 'e5c', sub: 'c', level: 'EMG', make: function (r, o) {
            var Vw = o.a * o.a * o.s / 3;
            return near('What volume would you get if you used the slant height in the volume formula by mistake? (Nearest cubic centimetre.)', Vw, 0, 'cm³', [{ v: o.a * o.a * o.h / 3, code: 'copied-error', hint: 'That’s the correct volume. The question asks what the <b>mistake</b> gives: put ' + t('s=' + o.s) + ' where ' + t('h') + ' goes.' }],
              t('\\tfrac13(' + o.a * o.a + ')(' + o.s + ')=' + (Number.isInteger(Vw) ? Vw : dd(Vw))) + (Number.isInteger(Vw) ? '' : t('\\approx ' + rr(Vw, 0))) + ' cm³ — too large, because ' + t('s>h') + '.', ['Use ' + t('s') + ' in place of ' + t('h') + '.'], 'wrong-height volume');
          } },
          { id: 'e5c2', sub: 'c %', level: 'PRG', make: function (r, o) {
            var pct = (o.s / o.h - 1) * 100;
            return near('Suppose the slant height ' + t(o.s + uT('cm')) + ' were used in the volume formula by mistake. By what percent would that wrong volume be too large, compared with the correct volume? (Nearest tenth of a percent.)', pct, 1, '%', [{ v: (1 - o.h / o.s) * 100, code: 'pct-base', hint: 'Compare with the <b>correct</b> volume: divide the extra by the correct value, not by the wrong one.' }, { v: o.s / o.h * 100, code: 'pct-base', hint: 'That’s the wrong volume as a percent of the right one. How much <b>more</b> is it?' }],
              'Correct: ' + t('\\tfrac13(' + o.a * o.a + ')(' + o.h + ')') + '; wrong: ' + t('\\tfrac13(' + o.a * o.a + ')(' + o.s + ')') + '. Their ratio is ' + t('\\tfrac{' + o.s + '}{' + o.h + '}' + (Number.isInteger(o.s * 10000 / o.h) ? '=' + nn(o.s / o.h) : '\\approx ' + nn(o.s / o.h))) + ', so the wrong answer is ' + t(rr(pct, 1) + '\\%') + ' too large.', ['Ratio of the two volumes, minus 1, as a percent.'], 'percent too large');
          } }] },
      { num: '6', stem: '', parts: [
        { id: 'e6', level: 'PRG', make: function (r) {
          var T = r.chance(0.2) ? [7, 24, 25] : triple(r, function (a, b) { return a >= 4 && a <= 12 && b >= 8 && b <= 30; }), d = 2 * T[0], V = PI * T[0] * T[0] * T[1] / 3;
          return near('A conical coffee filter has a base diameter of ' + t(d1(d) + uT('cm')) + ' and a slant height of ' + t(d1(T[2]) + uT('cm')) + '. How many millilitres of water does it hold when filled to the brim? (' + t('1\\text{ cm}^3=1\\text{ mL}') + ') Answer to the nearest millilitre.', V, 0, 'mL',
            [{ v: PI * T[0] * T[0] * T[2] / 3, code: 'vol-slant', hint: Hh.volSlant }, { v: T[2] > d ? PI * d * d * leg(T[2], d) / 3 : NaN, code: 'diam-radius', hint: Hh.diam }, { v: 3 * V, code: 'no-third', hint: Hh.noThirdCone }],
            t('r=' + T[0]) + ' cm. Volume needs ' + t('h') + ': ' + t('h^2=' + T[2] + '^2-' + T[0] + '^2=' + T[1] * T[1]) + ', ' + t('h=' + T[1]) + ' cm.<br>' + t('V=\\tfrac13\\pi(' + T[0] + ')^2(' + T[1] + ')=' + pc(T[0] * T[0] * T[1] / 3) + '\\pi=' + dd(V)) + ' cm³ ' + t('\\approx ' + rr(V, 0)) + ' mL.', ['Halve the diameter, find ' + t('h') + ', then the volume.'], 'filter volume');
        } }] },
      { num: '7', section: 'Extra practice C — Exactly One Third', stem: function (o) { return 'A cone of base radius ' + t(d1(o.r) + uT('cm')) + ' and perpendicular height ' + t(d1(o.h) + uT('cm')) + ' sits inside the smallest cylinder that contains it.<br>' + coneInCylSvg(d1(o.r) + ' cm', d1(o.h) + ' cm'); },
        shared: function (r) { var T = r.chance(0.25) ? [5, 12, 13] : triple(r, function (a, b) { return a >= 3 && a <= 9 && b >= 4 && b <= 16; }); return { r: T[0], h: T[1], s: T[2] }; },
        parts: [
          { id: 'e7a', sub: 'a cone', level: 'BEG', make: function (r, o) {
            var c = o.r * o.r * o.h / 3;
            return piP('Find the volume of the <b>cone</b>, exactly in terms of ' + t('\\pi') + '.', c, 'cm³', [{ c: 3 * c, code: 'no-third', hint: Hh.noThirdCone }, { c: o.r * o.r * o.s / 3, code: 'vol-slant', hint: Hh.volSlant }],
              t('V_{\\text{cone}}=\\tfrac13\\pi(' + o.r + ')^2(' + o.h + ')=' + pc(c) + '\\pi') + ' cm³ ' + t('\\approx ' + rr(c * PI, 1)) + ' cm³.', ['Keep ' + t('\\pi') + ' as a symbol.'], 'cone V exact');
          } },
          { id: 'e7a2', sub: 'a cylinder', level: 'BEG', make: function (r, o) {
            var c = o.r * o.r * o.h;
            return piP('Find the volume of the <b>cylinder</b>, exactly in terms of ' + t('\\pi') + '.', c, 'cm³', [{ c: c / 3, code: 'cyl-third', hint: 'A cylinder has no ' + t('\\tfrac13') + ': ' + t('V=\\pi r^2h') + '.' }],
              t('V_{\\text{cyl}}=\\pi(' + o.r + ')^2(' + o.h + ')=' + pc(c) + '\\pi') + ' cm³ ' + t('\\approx ' + rr(c * PI, 1)) + ' cm³.', [t('V=\\pi r^2h') + '.'], 'cylinder V exact');
          } },
          { id: 'e7a3', sub: 'a ratio', level: 'BEG', make: function (r, o) {
            return B.fraction('Form the ratio ' + t('\\dfrac{V_{\\text{cone}}}{V_{\\text{cylinder}}}') + ' as a fraction in lowest terms.', [1, 3], {},
              t('\\dfrac{' + pc(o.r * o.r * o.h / 3) + '\\pi}{' + pc(o.r * o.r * o.h) + '\\pi}=\\dfrac13') + ' exactly. (Rounded decimals would only <i>look</i> like a third.)', ['Divide the exact volumes; the ' + t('\\pi') + ' cancels.'], 'cone:cylinder ratio');
          } },
          { id: 'e7b', sub: 'b', level: 'EMG', make: function (r, o) {
            return mc(r, 'Why is ' + t('\\dfrac{V_{\\text{cone}}}{V_{\\text{cylinder}}}=\\dfrac13') + ' for <b>every</b> radius and height?', [
              { html: t('\\dfrac{\\tfrac13\\pi r^2h}{\\pi r^2h}') + ': the ' + t('\\pi') + ', the ' + t('r^2') + ' and the ' + t('h') + ' all cancel, leaving ' + t('\\tfrac13') + '.', right: true },
              { html: 'Because ' + t('\\pi\\approx 3') + '.', why: t('\\pi') + ' appears in both volumes and cancels — it has nothing to do with the 3.', code: 'pi3' },
              { html: 'It only works when ' + t('h') + ' is a multiple of 3.', why: 'Write the ratio with letters: nothing about ' + t('h') + ' survives the cancelling.', code: 'mult3' },
              { html: 'Because the slant height is three times the radius.', why: 'The slant height isn’t in either volume formula.', code: 'slant' }],
              t('\\dfrac{V_{\\text{cone}}}{V_{\\text{cyl}}}=\\dfrac{\\tfrac13\\pi r^2h}{\\pi r^2h}=\\dfrac13') + ': every ' + t('r') + ', every ' + t('h') + ' and ' + t('\\pi') + ' cancel.', ['Write both formulas and divide.'], 'one third proof');
          } },
          { id: 'e7c', sub: 'c', level: 'EMG', make: function (r, o) {
            var c = 2 * o.r * o.r * o.h / 3, V = c * PI;
            return near('Determine the volume of the empty space between the cone and the cylinder, to the nearest tenth. (It is ' + t('\\tfrac23') + ' of the cylinder — check!)', V, 1, 'cm³', [{ v: V / 2, code: 'third-flip', hint: 'That’s the cone itself. The empty space is the cylinder <b>minus</b> the cone.' }, { v: 3 * V / 2, code: 'third-flip', hint: 'That’s the whole cylinder. Subtract the cone.' }],
              t('V_{\\text{gap}}=' + pc(o.r * o.r * o.h) + '\\pi-' + pc(o.r * o.r * o.h / 3) + '\\pi=' + pc(c) + '\\pi=' + dd(V) + '\\approx ' + rr(V, 1)) + ' cm³ — ' + t('\\tfrac23') + ' of the cylinder, twice the cone.', ['Cylinder minus cone.'], 'gap volume');
          } },
          { id: 'e7d', sub: 'd', level: 'PRG', make: function (r, o) {
            var cc = o.r * o.s, cy = 2 * o.r * o.h;
            return mc(r, 'Is the cone’s <b>curved surface</b> also one third of the cylinder’s curved surface?', [
              { html: 'No: cone ' + t('\\pi rs=' + cc + '\\pi') + ', cylinder ' + t('2\\pi rh=' + cy + '\\pi') + '; the ratio is ' + t(ex.texRat(ex.norm(cc, cy))) + '. The ⅓ rule is about volume only.', right: true },
              { html: 'Yes: everything about a cone is one third of its cylinder.', why: 'Compute both: the cone’s curved surface uses the slant height ' + t('s=' + o.s) + ', the cylinder’s uses ' + t('h') + '.', code: 'yes' },
              { html: 'No: cone ' + t('\\pi rh=' + (o.r * o.h) + '\\pi') + ', cylinder ' + t(cy + '\\pi') + ', so it is one half.', why: Hh.saHeight, code: 'half' },
              { html: 'Yes: ' + t('\\tfrac13\\times' + cy + '\\pi=' + pc(cy / 3) + '\\pi') + '.', why: 'That assumes the answer. The cone’s curved surface is ' + t('\\pi rs') + ' — compute it.', code: 'assume' }],
              t('s=\\sqrt{' + o.r + '^2+' + o.h + '^2}=' + o.s) + ' cm. Cone: ' + t('\\pi rs=' + cc + '\\pi') + '; cylinder: ' + t('2\\pi rh=' + cy + '\\pi') + '. Ratio ' + t(ex.texRat(ex.norm(cc, cy))) + ' — not ' + t('\\tfrac13') + '. The one-third rule is about volume only.', ['The cone’s curved surface needs the slant height.'], 'curved surface ratio');
          } }] },
      { num: '8', stem: function (o) { return 'A solid block is a square prism with base edge ' + t(d1(o.a) + uT('cm')) + ' and height ' + t(d1(o.h) + uT('cm')) + '. The largest possible pyramid on the same square base and with the same height is carved from it; the rest is waste.'; },
        shared: function (r) { var a = r.int(5, 12), h = r.int(8, 25); while ((a * a * h) % 3) h++; if (r.chance(0.2)) { a = 9; h = 20; } return { a: a, h: h, V: a * a * h }; },
        parts: [
          { id: 'e8a', sub: 'a', level: 'LIM', make: function (r, o) { return exact('Find the volume of the block.', o.V, 'cm³', [{ v: o.V / 3, code: 'cyl-third', hint: 'The block is a prism — no ' + t('\\tfrac13') + '.' }], t('V=(' + o.a + ')^2(' + o.h + ')=' + o.V) + ' cm³.', ['Base area × height.'], 'block volume'); } },
          { id: 'e8b', sub: 'b', level: 'BEG', make: function (r, o) { return exact('Find the volume of the pyramid <b>without</b> using the pyramid formula.', o.V / 3, 'cm³', [{ v: o.V * 3, code: 'third-flip', hint: 'The pyramid is the <b>smaller</b> solid: one third of the block.' }], 'Same base and same height, so the pyramid is ' + t('\\tfrac13') + ' of the block: ' + t('\\tfrac13(' + o.V + ')=' + o.V / 3) + ' cm³.', ['One third of the block.'], 'pyramid from block'); } },
          { id: 'e8c', sub: 'c', level: 'BEG', make: function (r, o) { return exact('Find the volume of the waste.', 2 * o.V / 3, 'cm³', [{ v: o.V / 3, code: 'third-flip', hint: 'That’s the pyramid. The waste is the block minus the pyramid.' }], t(o.V + '-' + o.V / 3 + '=' + 2 * o.V / 3) + ' cm³.', ['Block minus pyramid.'], 'waste'); } },
          { id: 'e8d', sub: 'd', level: 'EMG', make: function (r, o) {
            return mc(r, 'Why is the waste exactly twice the pyramid?', [
              { html: 'The pyramid is ' + t('\\tfrac13') + ' of the block, so the waste is the other ' + t('\\tfrac23') + ', and ' + t('\\tfrac23=2\\times\\tfrac13') + '.', right: true },
              { html: 'Because a square has two diagonals.', why: 'Think in thirds: how much of the block is the pyramid?', code: 'diag' },
              { html: 'Because the height is twice the base edge.', why: 'It works for any square prism, whatever its shape. Think in thirds.', code: 'height' },
              { html: 'It isn’t exact — it only rounds to twice.', why: 'Check: ' + t(2 * o.V / 3 + '=2\\times' + o.V / 3) + ' exactly.', code: 'approx' }],
              'Pyramid ' + t('=\\tfrac13') + ' of the block, so waste ' + t('=1-\\tfrac13=\\tfrac23') + ' of it ' + t('=2\\times\\tfrac13') + '. In numbers: ' + t(2 * o.V / 3 + '=2\\times' + o.V / 3) + '.', ['How much of the block does the pyramid fill?'], 'waste twice');
          } }] },
      { num: '9', section: 'Extra practice D — Running the Formulas Backwards', stem: function (o) { return 'A conical paper cup holds exactly ' + t(o.V + uT('mL')) + ' when filled to the brim, and the radius of its rim is ' + t(d1(o.r) + uT('cm')) + '.'; },
        shared: function (r) { var V = r.pick([150, 180, 200, 250, 300]), rv = r.pick([3, 3.5, 4, 4.5, 5]); if (r.chance(0.2)) { V = 250; rv = 4; } var h = 3 * V / (PI * rv * rv); return { V: V, r: rv, h: h, s: hyp(h, rv) }; },
        parts: [
          { id: 'e9a', sub: 'a', level: 'PRG', make: function (r, o) {
            return near('Determine the perpendicular height of the cup, to the nearest tenth of a centimetre.', o.h, 1, 'cm', [{ v: o.h / 3, code: 'no-third', hint: 'Rearranging ' + t('V=\\tfrac13\\pi r^2h') + ' gives ' + t('h=\\frac{3V}{\\pi r^2}') + ' — multiply by 3.' }, { v: o.h * o.r, code: 'no-square', hint: Hh.noSquare }],
              t(o.V + '\\text{ mL}=' + o.V + '\\text{ cm}^3') + '. ' + t('h=\\dfrac{3V}{\\pi r^2}=\\dfrac{3(' + o.V + ')}{\\pi(' + nn(o.r) + ')^2}=' + dd(o.h) + '\\approx ' + rr(o.h, 1)) + ' cm.', ['1 mL = 1 cm³. Rearrange the cone volume formula for ' + t('h') + '.'], 'cup height from V');
          } },
          { id: 'e9b', sub: 'b', level: 'PRG', make: function (r, o) {
            return near('The perpendicular height is ' + t('h\\approx ' + rr(o.h, 1)) + ' cm (keep the unrounded value). Determine the slant height, to the nearest tenth of a centimetre.', o.s, 1, 'cm', [{ v: leg(o.h, o.r), code: 'pyth-add', hint: Hh.pythHyp }, { v: hyp(K.roundTo(o.h, 1), o.r), code: 'early-round', hint: Hh.early }],
              t('h=\\dfrac{3(' + o.V + ')}{\\pi(' + nn(o.r) + ')^2}=' + dd(o.h)) + ' cm.<br>' + t('s=\\sqrt{' + nn(o.r) + '^2+' + dd(o.h) + '^2}=' + dd(o.s) + '\\approx ' + rr(o.s, 1)) + ' cm.', [t('s^2=r^2+h^2') + ' with the unrounded ' + t('h') + '.'], 'cup slant');
          } },
          { id: 'e9c', sub: 'c', level: 'ADV', make: function (r, o) {
            var A = PI * o.r * o.s;
            return near('The cup has no base. Determine the area of paper needed, to the nearest square centimetre. (Start from the volume and radius; carry full precision.)', A, 0, 'cm²', [{ v: A + PI * o.r * o.r, code: 'extra-base', hint: 'No base: only the curved surface ' + t('\\pi rs') + '.' }, { v: PI * o.r * o.h, code: 'sa-height', hint: Hh.saHeight }, { v: PI * o.r * K.roundTo(o.s, 1), code: 'early-round', hint: Hh.early }, { v: PI * o.r * hyp(K.roundTo(o.h, 1), o.r), code: 'early-round', hint: Hh.early }],
              t('h=' + dd(o.h)) + ' cm, ' + t('s=' + dd(o.s)) + ' cm. “No base” means the lateral area only:<br>' + t('A=\\pi rs=\\pi(' + nn(o.r) + ')(' + dd(o.s) + ')=' + dd(A) + '\\approx ' + rr(A, 0)) + ' cm².', ['Height from the volume, slant height by Pythagoras, then ' + t('\\pi rs') + '.'], 'cup paper from V');
          } }] },
      { num: '10', stem: function (o) { return 'A monument is a right pyramid on a square base. Its volume is ' + t(F(o.V) + uT('m', 3)) + ' and its perpendicular height is ' + t(o.h + uT('m')) + '.'; },
        shared: function (r) { var a = r.int(8, 20), h = r.int(12, 40); while ((a * a * h) % 3) h++; if (r.chance(0.2)) { a = 12; h = 25; } return { a: a, h: h, V: a * a * h / 3, s: hyp(h, a / 2) }; },
        parts: [
          { id: 'e10a', sub: 'a', level: 'PRG', make: function (r, o) {
            return exact('Determine the length of a base edge.', o.a, 'm', [{ v: o.a * o.a, code: 'no-sqrt', hint: 'That’s the base <b>area</b> ' + t('a^2') + '. Take the square root.' }, { v: o.a / Math.sqrt(3), code: 'no-third', hint: 'Multiply the volume by 3 first: ' + t('a^2=\\frac{3V}{h}') + '.' }],
              t(F(o.V) + '=\\tfrac13a^2(' + o.h + ')\\Rightarrow a^2=\\dfrac{3(' + F(o.V) + ')}{' + o.h + '}=' + o.a * o.a) + ', so ' + t('a=' + o.a) + ' m.', ['Rearrange for ' + t('a^2') + ', then square root.'], 'base edge from V');
          } },
          { id: 'e10b', sub: 'b', level: 'PRG', make: function (r, o) {
            return near('The base edge is ' + t(o.a + uT('m')) + '. Determine the slant height, to the nearest tenth of a metre.', o.s, 1, 'm', [{ v: hyp(o.h, o.a), code: 'half-edge', hint: Hh.halfEdge }],
              'Half the edge: ' + t(nn(o.a / 2)) + ' m. ' + t('s=\\sqrt{' + o.h + '^2+' + nn(o.a / 2) + '^2}=\\sqrt{' + nn(o.h * o.h + o.a * o.a / 4) + '}=' + dd(o.s) + '\\approx ' + rr(o.s, 1)) + ' m.', ['Legs: the height and half the edge.'], 'monument slant');
          } },
          { id: 'e10c', sub: 'c', level: 'PRG', make: function (r, o) {
            var A = 2 * o.a * o.s;
            return near('The base edge is ' + t(o.a + uT('m')) + '. Determine the total area of the four triangular faces, to the nearest square metre.', A, 0, 'm²', [{ v: 2 * o.a * o.h, code: 'sa-height', hint: Hh.saHeight }, { v: A + o.a * o.a, code: 'extra-base', hint: 'Only the four triangular faces — not the base.' }, { v: 2 * o.a * K.roundTo(o.s, 1), code: 'early-round', hint: Hh.early }, { v: 4 * o.a * o.s, code: 'tri-half', hint: Hh.triHalf }],
              t('s=' + dd(o.s)) + ' m. ' + t('A=4\\times\\tfrac12(' + o.a + ')(' + dd(o.s) + ')=' + dd(A) + '\\approx ' + rr(A, 0)) + ' m².', ['Each face has height ' + t('s') + ', not ' + t('h') + '.'], 'monument faces');
          } }] },
      { num: '11', stem: function (o) { return 'The curved surface of a cone has an area of exactly ' + t(o.L + '\\pi' + uT('cm', 2)) + ', and the base radius is ' + t(d1(o.r) + uT('cm')) + '.'; },
        shared: function (r) { var rv = r.int(3, 9), s = rv + r.int(3, 12); while (Number.isInteger(leg(s, rv))) s++; if (r.chance(0.2)) { rv = 6; s = 16; } return { r: rv, s: s, L: rv * s, h: leg(s, rv) }; },
        parts: [
          { id: 'e11a', sub: 'a', level: 'EMG', make: function (r, o) { return exact('Determine the slant height.', o.s, 'cm', [{ v: o.L, code: 'no-subtract', hint: 'Divide by ' + t('\\pi r') + ': ' + t('s=\\frac{' + o.L + '\\pi}{\\pi(' + o.r + ')}') + '.' }, { v: o.L / (o.r * o.r), code: 'no-square', hint: 'The curved surface is ' + t('\\pi rs') + ' — ' + t('r') + ' is not squared there.' }], t('\\pi rs=' + o.L + '\\pi\\Rightarrow s=\\dfrac{' + o.L + '\\pi}{' + o.r + '\\pi}=' + o.s) + ' cm (exact — the ' + t('\\pi') + ' cancels).', ['Curved surface ' + t('=\\pi rs') + '.'], 'cone s from lateral'); } },
          { id: 'e11b', sub: 'b', level: 'EMG', make: function (r, o) { return near('The slant height is ' + t(o.s + uT('cm')) + '. Determine the perpendicular height, to the nearest tenth of a centimetre.', o.h, 1, 'cm', [{ v: hyp(o.s, o.r), code: 'pyth-add', hint: Hh.pythLeg }], t('h=\\sqrt{' + o.s + '^2-' + o.r + '^2}=\\sqrt{' + (o.s * o.s - o.r * o.r) + '}=' + dd(o.h) + '\\approx ' + rr(o.h, 1)) + ' cm.', [t('h^2=s^2-r^2') + '.'], 'cone h from s'); } },
          { id: 'e11c', sub: 'c', level: 'PRG', make: function (r, o) {
            var V = PI * o.r * o.r * o.h / 3;
            return near('The slant height is ' + t(o.s + uT('cm')) + '. Determine the volume, to the nearest tenth of a cubic centimetre.', V, 1, 'cm³', [{ v: PI * o.r * o.r * o.s / 3, code: 'vol-slant', hint: Hh.volSlant }, { v: PI * o.r * o.r * K.roundTo(o.h, 1) / 3, code: 'early-round', hint: Hh.early }, { v: 3 * V, code: 'no-third', hint: Hh.noThirdCone }],
              t('h=\\sqrt{' + (o.s * o.s - o.r * o.r) + '}=' + dd(o.h)) + ' cm (unrounded). ' + t('V=\\tfrac13\\pi(' + o.r + ')^2(' + dd(o.h) + ')=' + dd(V) + '\\approx ' + rr(V, 1)) + ' cm³.', ['Find ' + t('h') + ' and keep it unrounded.'], 'cone V from lateral');
          } },
          { id: 'e11d', sub: 'd', level: 'EMG', make: function (r, o) {
            return piP('Determine the total surface area, exactly in terms of ' + t('\\pi') + '.', o.L + o.r * o.r, 'cm²', [{ c: o.L, code: 'sa-no-base', hint: Hh.noBaseCone }, { c: o.L + 2 * o.r, code: 'no-square', hint: 'The base is ' + t('\\pi r^2=\\pi(' + o.r + ')^2') + '.' }],
              t('SA=\\pi r^2+\\pi rs=' + (o.r * o.r) + '\\pi+' + o.L + '\\pi=' + (o.L + o.r * o.r) + '\\pi') + ' cm².', ['Add the base ' + t('\\pi r^2') + ' to the curved surface.'], 'cone total SA exact');
          } }] },
      { num: '12', section: 'Extra practice E — Lateral Area or Total Surface Area? The Wording Decides', stem: function (o) { return 'Three objects are all cones of base radius ' + t(o.r + uT('cm')) + ' and perpendicular height ' + t(o.h + uT('cm')) + '. Answer to the nearest tenth of a square centimetre.<br>' + cone({ r: 'r = ' + o.r + ' cm', h: o.h + ' cm', width: 190 }); },
        shared: function (r) { var T = r.chance(0.2) ? [12, 16, 20] : triple(r, function (a, b) { return a >= 5 && a <= 15 && b >= 6 && b <= 24; }); return { r: T[0], h: T[1], s: T[2] }; },
        parts: [
          { id: 'e12a', sub: 'a', level: 'EMG', make: function (r, o) { var L = PI * o.r * o.s; return near('A party hat rolled from one piece of card and <b>open at the bottom</b>. How much card?', L, 1, 'cm²', [{ v: L + PI * o.r * o.r, code: 'extra-base', hint: '“Open at the bottom”: no base circle — lateral area ' + t('\\pi rs') + ' only.' }, { v: PI * o.r * o.h, code: 'sa-height', hint: Hh.saHeight }], t('s=\\sqrt{' + o.r + '^2+' + o.h + '^2}=' + o.s) + ' cm. Open at the bottom → lateral area: ' + t('\\pi rs=' + o.r * o.s + '\\pi\\approx ' + rr(L, 1)) + ' cm².', ['Which surfaces does the hat have?'], 'party hat'); } },
          { id: 'e12b', sub: 'b', level: 'EMG', make: function (r, o) { var S = PI * o.r * o.s + PI * o.r * o.r; return near('A <b>solid</b> clay cone dipped entirely in glaze. How much glazed surface?', S, 1, 'cm²', [{ v: PI * o.r * o.s, code: 'sa-no-base', hint: '“Dipped entirely”: the base disc gets glaze too.' }, { v: PI * o.r * o.h + PI * o.r * o.r, code: 'sa-height', hint: Hh.saHeight }], t('s=' + o.s) + ' cm. Whole outside → total surface area: ' + t('\\pi rs+\\pi r^2=' + o.r * o.s + '\\pi+' + o.r * o.r + '\\pi=' + (o.r * o.s + o.r * o.r) + '\\pi\\approx ' + rr(S, 1)) + ' cm².', ['Is the base glazed?'], 'glazed cone'); } },
          { id: 'e12c', sub: 'c', level: 'PRG', make: function (r, o) {
            var L = PI * o.r * o.s, Bs = PI * o.r * o.r;
            var c1 = K.near(L, 1, { alts: [{ v: L + Bs, code: 'lat-total', hint: 'The groundsheet is nylon, not canvas: the canvas is the walls only.' }, { v: Bs, code: 'lat-total', hint: 'That’s the floor. The canvas is the sloping walls, ' + t('\\pi rs') + '.' }, { v: PI * o.r * o.h, code: 'sa-height', hint: Hh.saHeight }] });
            var c2 = K.near(Bs, 1, { alts: [{ v: L, code: 'lat-total', hint: 'The groundsheet is the circular floor: ' + t('\\pi r^2') + '.' }, { v: PI * 4 * o.r * o.r, code: 'diam-radius', hint: Hh.diam }, { v: 2 * PI * o.r, code: 'lat-total', hint: 'That’s the circumference. The groundsheet is an area: ' + t('\\pi r^2') + '.' }] });
            var k1 = K.roundTo(L, 1).toFixed(1), k2 = K.roundTo(Bs, 1).toFixed(1);
            var p = B.fields('A tent with canvas walls and a sewn-in circular nylon groundsheet. How much canvas, and how much nylon?', [{ label: 'canvas', after: 'cm²' }, { label: 'nylon', after: 'cm²' }], [c1, c2], [k1, k2], 'canvas ' + t(k1) + ' cm², nylon ' + t(k2) + ' cm²',
              '“Canvas walls” = lateral area: ' + t('\\pi rs=' + o.r * o.s + '\\pi\\approx ' + k1) + ' cm².<br>“Circular groundsheet” = the base: ' + t('\\pi r^2=' + o.r * o.r + '\\pi\\approx ' + k2) + ' cm².', ['Same two pieces as a solid cone, but different materials.'], 'tent canvas nylon');
            p.bad = [[k2, k1]]; return p;
          } }] },
      { num: '13', stem: function (o) { return 'A cylindrical grain bin is topped by a conical steel roof of base diameter ' + t(d1(o.d) + uT('m')) + ' and slant height ' + t(d1(o.s) + uT('m')) + '.<br>' + cone({ d: d1(o.d) + ' m', s: d1(o.s) + ' m', width: 190 }); },
        shared: function (r) { var T = r.chance(0.25) ? [4, 3, 5] : triple(r, function (a, b) { return a >= 3 && a <= 12 && b >= 2 && b < a; }); return { r: T[0], h: T[1], s: T[2], d: 2 * T[0] }; },
        parts: [
          { id: 'e13a', sub: 'a', level: 'EMG', make: function (r, o) { var A = PI * o.r * o.s; return near('How many square metres of steel sheeting does the roof need, to the nearest tenth?', A, 1, 'm²', [{ v: A + PI * o.r * o.r, code: 'extra-base', hint: 'A roof is the sloping surface only — the circle underneath is the open top of the bin.' }, { v: PI * o.d * o.s, code: 'diam-radius', hint: Hh.diam }], t('r=' + o.r) + ' m. Roof = lateral area: ' + t('\\pi rs=\\pi(' + o.r + ')(' + o.s + ')=' + o.r * o.s + '\\pi\\approx ' + rr(A, 1)) + ' m².', ['Only the sloping surface is steel.'], 'roof steel'); } },
          { id: 'e13b', sub: 'b', level: 'EMG', make: function (r, o) {
            return mc(r, 'Why is the circle at the bottom of the roof not part of the steel sheeting?', [
              { html: 'It is the opening the roof sits over (the top of the bin): once built, it is inside the structure, not part of the roof.', right: true },
              { html: 'It is included in ' + t('\\pi rs') + '.', why: t('\\pi rs') + ' is only the sloping surface.', code: 'incl' },
              { html: 'Circles can’t be made from steel.', why: 'They can — but this one would never be cut. Where is it?', code: 'steel' },
              { html: 'It is on the ground.', why: 'The roof is on top of the bin, far from the ground.', code: 'ground' }],
              'That circle is the opening the roof covers. Once the roof is on, it is inside the structure. Including it would order ' + t('\\pi(' + o.r + ')^2\\approx ' + rr(PI * o.r * o.r, 1)) + ' m² of steel that is never used.', ['Where is that circle?'], 'roof circle');
          } },
          { id: 'e13c', sub: 'c', level: 'PRG', make: function (r, o) { var V = PI * o.r * o.r * o.h / 3; return near('How much space does the roof enclose above the bin, to the nearest tenth of a cubic metre?', V, 1, 'm³', [{ v: PI * o.r * o.r * o.s / 3, code: 'vol-slant', hint: Hh.volSlant }, { v: 3 * V, code: 'no-third', hint: Hh.noThirdCone }, { v: o.s > o.d ? PI * o.d * o.d * leg(o.s, o.d) / 3 : NaN, code: 'diam-radius', hint: Hh.diam }], 'Volume needs ' + t('h') + ': ' + t('h=\\sqrt{' + o.s + '^2-' + o.r + '^2}=' + o.h) + ' m.<br>' + t('V=\\tfrac13\\pi(' + o.r + ')^2(' + o.h + ')=' + pc(o.r * o.r * o.h / 3) + '\\pi\\approx ' + rr(V, 1)) + ' m³.', ['Find the perpendicular height first.'], 'roof volume'); } }] },
      { num: '14', section: 'Extra practice F — Composite Solids: The Joining Face Belongs to Neither Surface', stem: function (o) { return 'A grain silo is a cylinder of radius ' + t(d1(o.r) + uT('m')) + ' and height ' + t(d1(o.H) + uT('m')) + ', topped by a cone of the same radius and perpendicular height ' + t(d1(o.hc) + uT('m')) + '. The silo stands on the ground.<br>' + siloSvg({ r: 'r = ' + d1(o.r) + ' m', H: d1(o.H) + ' m', hc: d1(o.hc) + ' m', ground: 1 }); },
        shared: function (r) { var T = r.chance(0.3) ? [3, 4, 5] : triple(r, function (a, b) { return a >= 3 && a <= 8 && b >= 3 && b <= 8; }); return { r: T[0], hc: T[1], s: T[2], H: r.chance(0.3) ? 8 : r.int(6, 14) }; },
        parts: [
          { id: 'e14a', sub: 'a', level: 'PRG', make: function (r, o) { var c = o.r * o.r * o.H + o.r * o.r * o.hc / 3, V = c * PI; return near('Determine the total volume, to the nearest tenth of a cubic metre.', V, 1, 'm³', [{ v: PI * o.r * o.r * (o.H + o.hc), code: 'no-third', hint: 'The cone part needs its ' + t('\\tfrac13') + '.' }, { v: PI * o.r * o.r * (o.H + o.s / 3), code: 'vol-slant', hint: Hh.volSlant }], 'Cylinder: ' + t('\\pi(' + o.r + ')^2(' + o.H + ')=' + o.r * o.r * o.H + '\\pi') + '. Cone: ' + t('\\tfrac13\\pi(' + o.r + ')^2(' + o.hc + ')=' + pc(o.r * o.r * o.hc / 3) + '\\pi') + '.<br>Total ' + t('=' + pc(c) + '\\pi\\approx ' + rr(V, 1)) + ' m³.', ['Add the two volumes.'], 'silo V'); } },
          { id: 'e14b', sub: 'b', level: 'PRG', make: function (r, o) { var A = 2 * PI * o.r * o.H + PI * o.r * o.s; return near('The curved wall of the cylinder and the curved surface of the cone are to be painted. Determine the area to be painted, to the nearest tenth of a square metre.', A, 1, 'm²', [{ v: A + PI * o.r * o.r, code: 'extra-circle', hint: 'No circles are painted: the joining circle is inside, and the bottom is on the ground.' }, { v: 2 * PI * o.r * o.H + PI * o.r * o.hc, code: 'sa-height', hint: 'The cone’s surface uses its <b>slant</b> height ' + t('s=\\sqrt{r^2+h^2}') + '.' }], t('s=\\sqrt{' + o.r + '^2+' + o.hc + '^2}=' + o.s) + ' m.<br>Wall ' + t('2\\pi rh=' + 2 * o.r * o.H + '\\pi') + ', cone ' + t('\\pi rs=' + o.r * o.s + '\\pi') + '. Painted ' + t('=' + (2 * o.r * o.H + o.r * o.s) + '\\pi\\approx ' + rr(A, 1)) + ' m².', ['Wall + cone surface.'], 'silo paint'); } },
          { id: 'e14c', sub: 'c', level: 'EMG', make: function (r, o) {
            return mc(r, 'Two circles of this solid appear in no painted surface. Which statement names them, with the right reasons?', [
              { html: 'The circle where the cone meets the cylinder (hidden inside the solid) and the bottom circle (against the ground).', right: true },
              { html: 'Both circles are hidden inside the solid.', why: 'The bottom circle is on the outside — it just isn’t painted because the silo stands on it.', code: 'both-inside' },
              { html: 'Both are against the ground.', why: 'Only one circle touches the ground. Where is the other?', code: 'both-ground' },
              { html: 'The top of the cone and the bottom circle.', why: 'The cone has a point at the top, not a circle.', code: 'top' }],
              '(i) The joining circle is <b>internal</b>: ' + t('\\pi(' + o.r + ')^2\\approx ' + rr(PI * o.r * o.r, 1)) + ' m² a careless student adds in. (ii) The bottom circle is on the outside but against the ground, so it isn’t painted.', ['One is hidden, one is on the ground.'], 'silo circles');
          } }] },
      { num: '15', stem: function (o) { return 'A church tower is a square prism of base edge ' + t(d1(o.a) + uT('m')) + ' and height ' + t(d1(o.H) + uT('m')) + ', capped by a right pyramid on the same square base with a perpendicular height of ' + t(d1(o.h) + uT('m')) + '.<br>' + towerSvg({ a: d1(o.a) + ' m', H: d1(o.H) + ' m', hp: d1(o.h) + ' m' }); },
        shared: function (r) { var T = r.chance(0.3) ? [3, 4, 5] : triple(r, function (m, h) { return m >= 2 && m <= 6 && h >= 2 && h <= 8; }); return { a: 2 * T[0], m: T[0], h: T[1], s: T[2], H: r.chance(0.3) ? 15 : r.int(10, 24) }; },
        parts: [
          { id: 'e15a', sub: 'a', level: 'PRG', make: function (r, o) { var V = o.a * o.a * o.H + o.a * o.a * o.h / 3; return near('Determine the total volume of the tower, to the nearest cubic metre.', V, 0, 'm³', [{ v: o.a * o.a * (o.H + o.h), code: 'no-third', hint: 'The pyramid roof needs its ' + t('\\tfrac13') + '.' }, { v: o.a * o.a * (o.H + o.s / 3), code: 'vol-slant', hint: Hh.volSlant }], 'Prism: ' + t(o.a + '^2(' + o.H + ')=' + o.a * o.a * o.H) + ' m³. Pyramid: ' + t('\\tfrac13(' + o.a * o.a + ')(' + o.h + ')=' + nn(o.a * o.a * o.h / 3)) + ' m³.<br>Total ' + t('=' + nn(V)) + ' m³.', ['Prism + pyramid.'], 'tower V'); } },
          { id: 'e15b', sub: 'b', level: 'PRG', make: function (r, o) { var A = 4 * o.a * o.H + 2 * o.a * o.s; return near('The four tower walls and the four roof faces are to be clad. Determine the area to be clad, to the nearest square metre.', A, 0, 'm²', [{ v: A + o.a * o.a, code: 'extra-circle', hint: 'Neither square is clad: the one under the roof is inside, the bottom one is on the ground.' }, { v: A + 2 * o.a * o.a, code: 'extra-circle', hint: 'Neither square is clad: the one under the roof is inside, the bottom one is on the ground.' }, { v: 4 * o.a * o.H + 2 * o.a * o.h, code: 'sa-height', hint: Hh.saHeight }, { v: 4 * o.a * o.H + 2 * o.a * hyp(o.h, o.a), code: 'half-edge', hint: Hh.halfEdge }], 'Roof slant height: ' + t('s=\\sqrt{' + o.h + '^2+' + o.m + '^2}=' + o.s) + ' m. Roof faces: ' + t('4\\times\\tfrac12(' + o.a + ')(' + o.s + ')=' + 2 * o.a * o.s) + ' m². Walls: ' + t('4(' + o.a + ')(' + o.H + ')=' + 4 * o.a * o.H) + ' m².<br>Clad ' + t('=' + A) + ' m².', ['Walls use the tower height; roof faces use the slant height.'], 'tower clad'); } },
          { id: 'e15c', sub: 'c', level: 'EMG', make: function (r, o) {
            return mc(r, 'Two squares of area ' + t(o.a * o.a + uT('m', 2)) + ' lie in this solid but on no clad surface. Which are they?', [
              { html: 'The square where the roof sits on the tower (inside the solid) and the square the tower stands on (the ground).', right: true },
              { html: 'The two largest walls.', why: 'The walls are rectangles ' + o.a + ' m by ' + o.H + ' m, and they are clad.', code: 'walls' },
              { html: 'The top of the pyramid and the ground square.', why: 'A pyramid ends in a point at the top.', code: 'top' },
              { html: 'Two of the roof faces.', why: 'The roof faces are triangles, and they are clad.', code: 'roof' }],
              'The square under the roof is <b>internal</b>; the bottom square is against the ground. Each is ' + t(o.a + '\\times' + o.a + '=' + o.a * o.a) + ' m².', ['Where does a square face appear?'], 'tower squares');
          } }] },
      { num: '16', section: 'Extra practice G — Error Analysis: Four Students, Four Different Failures', stem: 'For each student: find the error, then give the correct answer.', parts: [
        { id: 'e16a', sub: 'a error', level: 'EMG', make: function (r) {
          var T = r.chance(0.3) ? [3, 4, 5] : triple(r, function (a, b) { return a >= 3 && a <= 9 && b >= 4 && b <= 12; });
          return mc(r, '<b>Dana</b> — a cone with ' + t('r=' + T[0]) + ' cm, ' + t('h=' + T[1]) + ' cm and ' + t('s=' + T[2]) + ' cm. Dana writes ' + t('V=\\tfrac13\\pi r^2s=\\tfrac13\\pi(' + T[0] + ')^2(' + T[2] + ')') + '. What is her error?', [
            { html: 'She used the slant height in the volume formula; volume takes the perpendicular height.', right: true },
            { html: 'She forgot the ' + t('\\tfrac13') + '.', why: 'The ' + t('\\tfrac13') + ' is there. Look at the height she used.', code: 'third' },
            { html: 'She should have used the diameter.', why: 'The formula uses the radius, as she did.', code: 'diam' },
            { html: 'She should have added the base ' + t('\\pi r^2') + '.', why: 'That belongs to surface area, not volume.', code: 'base' }],
            'Dana put ' + t('s') + ' into the volume formula. Volume always takes the perpendicular height ' + t('h') + '.', ['Which height does volume use?'], 'Dana error');
        } },
        { id: 'e16a2', sub: 'a fix', level: 'PRG', make: function (r) {
          var T = r.chance(0.3) ? [3, 4, 5] : triple(r, function (a, b) { return a >= 3 && a <= 9 && b >= 4 && b <= 12; }), V = PI * T[0] * T[0] * T[1] / 3, Vd = PI * T[0] * T[0] * T[2] / 3;
          return near('<b>Dana</b> — a cone with ' + t('r=' + T[0]) + ' cm, ' + t('h=' + T[1]) + ' cm and ' + t('s=' + T[2]) + ' cm. Dana writes ' + t('V=\\tfrac13\\pi(' + T[0] + ')^2(' + T[2] + ')\\approx ' + rr(Vd, 1)) + ' cm³. Give the correct volume, to the nearest tenth.', V, 1, 'cm³', [{ v: Vd, code: 'copied-error', hint: 'That’s Dana’s answer. Use the perpendicular height ' + t(T[1]) + ' cm instead.' }, { v: 3 * V, code: 'no-third', hint: Hh.noThirdCone }],
            t('V=\\tfrac13\\pi(' + T[0] + ')^2(' + T[1] + ')=' + pc(T[0] * T[0] * T[1] / 3) + '\\pi\\approx ' + rr(V, 1)) + ' cm³. The ' + t('s=' + T[2]) + ' belongs only in ' + t('\\pi rs') + '.', ['Replace ' + t('s') + ' with ' + t('h') + '.'], 'Dana fix');
        } },
        { id: 'e16b', sub: 'b error', level: 'EMG', make: function (r) {
          var T = r.chance(0.3) ? [8, 6, 10] : triple(r, function (m, h) { return m >= 3 && m <= 12 && h >= 4 && h <= 16; }), a = 2 * T[0];
          return mc(r, '<b>Ellis</b> — a square pyramid with base edge ' + t(a) + ' cm and perpendicular height ' + t(T[1]) + ' cm. Ellis writes ' + t('s=\\sqrt{' + T[1] + '^2+' + a + '^2}') + '. What is the error?', [
            { html: 'The horizontal leg should be half the edge, ' + t(T[0]) + ' cm: the slant height lands on the midpoint of an edge.', right: true },
            { html: 'He should have subtracted: ' + t('\\sqrt{' + a + '^2-' + T[1] + '^2}') + '.', why: 'The slant height is the hypotenuse, so adding is right. Check the leg lengths.', code: 'sub' },
            { html: 'He should have used the lateral edge.', why: 'The slant height goes down the middle of a face, not along an edge.', code: 'edge' },
            { html: 'Nothing — that is the slant height.', why: Hh.halfEdge, code: 'fine' }],
            'Ellis used the full edge as the horizontal leg; it should be half the edge, ' + t(T[0]) + ' cm.', ['From the centre of the base to the middle of an edge is how far?'], 'Ellis error');
        } },
        { id: 'e16b2', sub: 'b fix', level: 'PRG', make: function (r) {
          var T = r.chance(0.3) ? [8, 6, 10] : triple(r, function (m, h) { return m >= 3 && m <= 12 && h >= 4 && h <= 16; }), a = 2 * T[0], wrongS = hyp(T[1], a);
          return near('<b>Ellis</b> — a square pyramid with base edge ' + t(a) + ' cm and perpendicular height ' + t(T[1]) + ' cm. Ellis writes ' + t('s=\\sqrt{' + T[1] + '^2+' + a + '^2}\\approx ' + rr(wrongS, 1)) + ' cm. Give the correct slant height.', T[2], 0, 'cm', [{ v: wrongS, code: 'copied-error', hint: 'That’s Ellis’s answer. ' + Hh.halfEdge }],
            t('s=\\sqrt{' + T[1] + '^2+' + T[0] + '^2}=\\sqrt{' + T[2] * T[2] + '}=' + T[2]) + ' cm.', ['Use half the edge.'], 'Ellis fix');
        } },
        { id: 'e16c', sub: 'c error', level: 'EMG', make: function (r) {
          var a = r.int(6, 14), hv = r.int(6, 15);
          return mc(r, '<b>Farid</b> — a square pyramid with base edge ' + t(a) + ' cm and perpendicular height ' + t(hv) + ' cm. Farid writes ' + t('V=(' + a + ')^2(' + hv + ')=' + a * a * hv) + ' cm³. What is the error?', [
            { html: 'He left out the ' + t('\\tfrac13') + ': that is the volume of the prism on the same base.', right: true },
            { html: 'He used the wrong height.', why: t(hv) + ' cm is the perpendicular height — the right one for volume.', code: 'height' },
            { html: 'He should have used the slant height.', why: 'Volume uses the perpendicular height, as he did.', code: 'slant' },
            { html: 'He should have halved the edge.', why: 'Halving the edge is for the slant-height triangle, not the base area.', code: 'half' }],
            'Farid computed the prism. A pyramid is ' + t('\\tfrac13') + ' of it.', ['Pyramid vs prism.'], 'Farid error');
        } },
        { id: 'e16c2', sub: 'c fix', level: 'BEG', make: function (r) {
          var a = r.int(6, 14), hv = r.int(6, 15); if (r.chance(0.2)) { a = 10; hv = 12; } var V = a * a * hv / 3;
          return near('<b>Farid</b> — a square pyramid with base edge ' + t(a) + ' cm and perpendicular height ' + t(hv) + ' cm. Farid writes ' + t('V=(' + a + ')^2(' + hv + ')=' + a * a * hv) + ' cm³. Give the correct volume, to the nearest cubic centimetre.', V, 0, 'cm³', [{ v: a * a * hv, code: 'copied-error', hint: 'That’s Farid’s answer. ' + Hh.noThirdPyr }],
            t('V=\\tfrac13(' + a + ')^2(' + hv + ')=\\tfrac13(' + a * a * hv + ')=' + (Number.isInteger(V) ? V : dd(V))) + (Number.isInteger(V) ? '' : t('\\approx ' + rr(V, 0))) + ' cm³.', ['Divide by 3.'], 'Farid fix');
        } },
        { id: 'e16d', sub: 'd error', level: 'EMG', make: function (r) {
          return mc(r, '<b>Gwen</b> — a cylinder of radius 5 cm and height 10 cm with a cone of the same radius and perpendicular height 12 cm on top. Gwen writes ' + t('SA=25\\pi+100\\pi+25\\pi+65\\pi') + ' (bottom circle, cylinder wall, top of the cylinder, cone). What is the error?<br>' + siloSvg({ r: 'r = 5 cm', H: '10 cm', hc: '12 cm' }), [
            { html: 'She counted the top of the cylinder: it is where the cone sits, hidden inside the solid.', right: true },
            { html: 'She should have left out the bottom circle.', why: 'Nothing says this solid stands on the ground — the bottom is part of its outside.', code: 'bottom' },
            { html: 'The cone should be ' + t('\\pi rh=60\\pi') + '.', why: 'The cone’s surface uses its slant height: ' + t('s=\\sqrt{5^2+12^2}=13') + ', so ' + t('65\\pi') + ' is right.', code: 'cone' },
            { html: 'The wall should be ' + t('\\pi r^2h') + '.', why: t('\\pi r^2h') + ' is a volume. The wall is ' + t('2\\pi rh=100\\pi') + '.', code: 'wall' }],
            'The top of the cylinder is where the cone sits: it is internal and is on no exterior surface. The other three terms are right.', ['Which circle can you not see or touch?'], 'Gwen error');
        } },
        { id: 'e16d2', sub: 'd fix', level: 'ADV', make: function (r) {
          var T = r.chance(0.3) ? [5, 12, 13] : triple(r, function (a, b) { return a >= 3 && a <= 9 && b >= 4 && b <= 15; }), rv = T[0], hc = T[1], s = T[2], H = r.chance(0.3) ? 10 : r.int(6, 14);
          var c = rv * rv + 2 * rv * H + rv * s, A = c * PI;
          return near('A cylinder of radius ' + t(rv) + ' cm and height ' + t(H) + ' cm has a cone of the same radius and perpendicular height ' + t(hc) + ' cm on top. Gwen’s surface area counts the bottom circle, the cylinder wall, the top of the cylinder and the cone. Give the correct surface area, to the nearest tenth.<br>' + siloSvg({ r: 'r = ' + rv + ' cm', H: H + ' cm', hc: hc + ' cm' }), A, 1, 'cm²',
            [{ v: A + rv * rv * PI, code: 'copied-error', hint: 'That includes the top of the cylinder, which is hidden under the cone.' }, { v: A - rv * rv * PI, code: 'sa-no-base', hint: 'The bottom circle is on the outside of this solid — keep it.' }, { v: (rv * rv + 2 * rv * H + rv * hc) * PI, code: 'sa-height', hint: 'The cone’s surface uses its slant height.' }],
            t('s=\\sqrt{' + rv + '^2+' + hc + '^2}=' + s) + ' cm.<br>' + t('SA=\\underbrace{' + rv * rv + '\\pi}_{\\text{bottom}}+\\underbrace{' + 2 * rv * H + '\\pi}_{\\text{wall}}+\\underbrace{' + rv * s + '\\pi}_{\\text{cone}}=' + c + '\\pi\\approx ' + rr(A, 1)) + ' cm².', ['Bottom + wall + cone surface — no joining circle.'], 'Gwen fix');
        } }] },
      { num: '17', section: 'Extra practice H — Stretch', stem: function (o) { return 'A conical funnel has base radius ' + t(o.R + uT('cm')) + ' and perpendicular height ' + t(o.H + uT('cm')) + '. A plane parallel to the base cuts it ' + t(o.c + uT('cm')) + ' above the base, and the small cone above the cut is removed.<br>' + cutConeSvg(o.R + ' cm', o.H + ' cm', o.c + ' cm', o.c / o.H); },
        shared: function (r) { var k = r.pick([2, 2, 3]), R = k * r.int(3, 6), H = k * r.pick([3, 6, 9]); if (R === H) R += k; if (r.chance(0.2)) { k = 2; R = 12; H = 18; } return { k: k, R: R, H: H, c: H - H / k, rs: R / k, hs: H / k }; },
        parts: [
          { id: 'e17a', sub: 'a', level: 'PRG', make: function (r, o) {
            return mc(r, 'Why is the small cone’s base radius ' + t(o.rs + uT('cm')) + '?', [
              { html: 'The small cone is <b>similar</b> to the whole cone; its height is ' + t(o.hs) + ' cm, which is ' + t('\\tfrac{1}{' + o.k + '}') + ' of ' + t(o.H) + ', so every length is ' + t('\\tfrac{1}{' + o.k + '}') + ' of the original.', right: true },
              { html: 'The radius always shrinks by the same number of centimetres as the cut is above the base.', why: 'Radius and height shrink in <b>proportion</b> (same scale factor), not by equal amounts.', code: 'subtract' },
              { html: 'The radius shrinks by the same fraction as the volume.', why: 'Volume shrinks by the <b>cube</b> of the scale factor; a length such as the radius shrinks by the scale factor itself. Compare the heights to find it.', code: 'vol' },
              { html: 'It’s a coincidence of these numbers.', why: 'It follows from similar triangles every time.', code: 'luck' }],
              'The cut is parallel to the base, so the small cone is similar to the whole. Its height is ' + t(o.H + '-' + o.c + '=' + o.hs) + ' cm ' + t('=\\tfrac{1}{' + o.k + '}(' + o.H + ')') + ', so its radius is ' + t('\\tfrac{1}{' + o.k + '}(' + o.R + ')=' + o.rs) + ' cm.', ['Compare the small cone’s height with the whole height.'], 'similar cone');
          } },
          { id: 'e17b', sub: 'b whole', level: 'EMG', make: function (r, o) { var c = o.R * o.R * o.H / 3; return piP('Find the volume of the <b>whole</b> cone, exactly in terms of ' + t('\\pi') + '.', c, 'cm³', [{ c: 3 * c, code: 'no-third', hint: Hh.noThirdCone }], t('\\tfrac13\\pi(' + o.R + ')^2(' + o.H + ')=' + pc(c) + '\\pi') + ' cm³.', [t('\\tfrac13\\pi r^2h') + ', keeping ' + t('\\pi') + '.'], 'whole cone exact'); } },
          { id: 'e17b2', sub: 'b small', level: 'PRG', make: function (r, o) { var c = o.rs * o.rs * o.hs / 3; return piP('The small cone has radius ' + t(o.rs) + ' cm. Find its volume, exactly in terms of ' + t('\\pi') + '.', c, 'cm³', [{ c: 3 * c, code: 'no-third', hint: Hh.noThirdCone }, { c: o.rs * o.rs * o.c / 3, code: 'wrong-h', hint: 'The small cone’s height is from the cut up to the apex: ' + t(o.H + '-' + o.c + '=' + o.hs) + ' cm.' }], 'Height ' + t(o.H + '-' + o.c + '=' + o.hs) + ' cm. ' + t('\\tfrac13\\pi(' + o.rs + ')^2(' + o.hs + ')=' + pc(c) + '\\pi') + ' cm³.', ['Its height is the part above the cut.'], 'small cone exact'); } },
          { id: 'e17c', sub: 'c', level: 'PRG', make: function (r, o) { var c = o.R * o.R * o.H / 3 - o.rs * o.rs * o.hs / 3, V = c * PI; return near('Find the volume of the piece that remains, to the nearest tenth of a cubic centimetre.', V, 1, 'cm³', [{ v: o.R * o.R * o.H / 3 * (1 - 1 / o.k) * PI, code: 'frac-linear', hint: 'Removing ' + t('\\tfrac{1}{' + o.k + '}') + ' of the height does not remove ' + t('\\tfrac{1}{' + o.k + '}') + ' of the volume. Subtract the small cone’s volume.' }, { v: o.rs * o.rs * o.hs / 3 * PI, code: 'third-flip', hint: 'That’s the piece removed. The remaining piece is the whole minus the small cone.' }], t(pc(o.R * o.R * o.H / 3) + '\\pi-' + pc(o.rs * o.rs * o.hs / 3) + '\\pi=' + pc(c) + '\\pi\\approx ' + rr(V, 1)) + ' cm³.', ['Whole cone minus small cone.'], 'frustum volume'); } },
          { id: 'e17d', sub: 'd', level: 'ADV', make: function (r, o) {
            var den = o.k * o.k * o.k;
            var p = B.fraction('What fraction of the original volume was removed?', [1, den], { diag: function (v) { if (Math.abs(v - 1 / o.k) < 1e-9) return { code: 'frac-linear', hint: 'Every length is ' + t('\\tfrac1{' + o.k + '}') + ', but volume scales by the <b>cube</b> of the length factor.' }; if (Math.abs(v - 1 / (o.k * o.k)) < 1e-9) return { code: 'frac-linear', hint: 'Volume has three dimensions: cube the length factor.' }; if (Math.abs(v - (1 - 1 / den)) < 1e-9) return { code: 'third-flip', hint: 'That is what <b>remains</b>. What fraction was removed?' }; return null; } },
              t('\\dfrac{' + pc(o.rs * o.rs * o.hs / 3) + '\\pi}{' + pc(o.R * o.R * o.H / 3) + '\\pi}=\\dfrac{1}{' + den + '}') + '. Every length is ' + t('\\tfrac1{' + o.k + '}') + ', and volume scales by the cube: ' + t('\\left(\\tfrac1{' + o.k + '}\\right)^3=\\tfrac1{' + den + '}') + '.', ['Divide the small volume by the whole volume.'], 'fraction removed');
            p.bad = ['\\frac{1}{' + o.k + '}', '\\frac{1}{' + o.k * o.k + '}']; return p;
          } }] },
      { num: '18', stem: 'A cone has a slant height exactly equal to its base <b>diameter</b>: ' + t('s=2r') + '.', parts: [
        { id: 'e18a', sub: 'a', level: 'PRG', make: function (r) {
          return mc(r, 'Which expression is the perpendicular height ' + t('h') + '?', [
            { html: t('h=r\\sqrt3'), right: true },
            { html: t('h=r\\sqrt5'), why: 'The slant height is the hypotenuse: ' + t('h^2=s^2-r^2=4r^2-r^2') + '.', code: 'add' },
            { html: t('h=r'), why: 'Compute ' + t('h^2=(2r)^2-r^2') + '.', code: 'r' },
            { html: t('h=\\sqrt3'), why: 'Close — ' + t('\\sqrt{3r^2}') + ' keeps the ' + t('r') + ': ' + t('\\sqrt{3}\\cdot r') + '.', code: 'lost-r' }],
            t('h^2=s^2-r^2=(2r)^2-r^2=3r^2') + ', so ' + t('h=r\\sqrt3') + '.', [t('h^2=s^2-r^2') + ' with ' + t('s=2r') + '.'], 's=2r height');
        } },
        { id: 'e18b', sub: 'b', level: 'PRG', make: function (r) {
          return mc(r, 'What is the total surface area of such a cone, in terms of ' + t('r') + '?', [
            { html: t('3\\pi r^2') + ' — and the curved surface ' + t('2\\pi r^2') + ' is exactly twice the base.', right: true },
            { html: t('2\\pi r^2'), why: 'That is the curved surface only. Add the base ' + t('\\pi r^2') + '.', code: 'lat' },
            { html: t('\\pi r^2+2\\pi r'), why: t('\\pi rs=\\pi r(2r)=2\\pi r^2') + ' — the ' + t('r') + ' multiplies too.', code: 'lost-r' },
            { html: t('\\pi r^2+\\pi r^2\\sqrt3'), why: Hh.saHeight, code: 'h' }],
            t('SA=\\pi r^2+\\pi r(2r)=\\pi r^2+2\\pi r^2=3\\pi r^2') + '. The curved part ' + t('2\\pi r^2') + ' is twice the base ' + t('\\pi r^2') + '.', ['Substitute ' + t('s=2r') + ' into ' + t('\\pi r^2+\\pi rs') + '.'], 's=2r SA');
        } },
        { id: 'e18c', sub: 'c', level: 'ADV', make: function (r) {
          var SA = 50 * r.int(3, 12); if (r.chance(0.2)) SA = 300; var rv = Math.sqrt(SA / (3 * PI));
          return near('One such cone (' + t('s=2r') + ', so ' + t('SA=3\\pi r^2') + ') has a total surface area of ' + t(SA + uT('cm', 2)) + '. Find ' + t('r') + ', to the nearest tenth of a centimetre.', rv, 1, 'cm', [{ v: SA / (3 * PI), code: 'no-sqrt', hint: 'That is ' + t('r^2') + '. Take the square root.' }, { v: Math.sqrt(SA / PI), code: 'sa-no-base', hint: 'Use ' + t('SA=3\\pi r^2') + ': divide by ' + t('3\\pi') + '.' }, { v: Math.sqrt(SA / (2 * PI)), code: 'sa-no-base', hint: t('2\\pi r^2') + ' is only the curved part. The total is ' + t('3\\pi r^2') + '.' }],
            t('3\\pi r^2=' + SA + '\\Rightarrow r^2=\\dfrac{' + SA + '}{3\\pi}=' + dd(rv * rv) + '\\Rightarrow r=' + dd(rv) + '\\approx ' + rr(rv, 1)) + ' cm.', ['Solve ' + t('3\\pi r^2=' + SA) + '.'], 's=2r radius');
        } },
        { id: 'e18d', sub: 'd', level: 'ADV', make: function (r) {
          var SA = 50 * r.int(3, 12); if (r.chance(0.2)) SA = 300; var rv = Math.sqrt(SA / (3 * PI)), V = PI * Math.sqrt(3) / 3 * rv * rv * rv, rR = K.roundTo(rv, 1);
          return near('One such cone (' + t('s=2r') + ', ' + t('h=r\\sqrt3') + ') has a total surface area of ' + t(SA + uT('cm', 2)) + ', so ' + t('r\\approx ' + rr(rv, 1)) + ' cm. Find its volume, to the nearest tenth of a cubic centimetre (carry the unrounded ' + t('r') + ').', V, 1, 'cm³',
            [{ v: PI * Math.sqrt(3) / 3 * rR * rR * rR, code: 'early-round', hint: Hh.early + ' Use ' + t('r=\\sqrt{\\frac{' + SA + '}{3\\pi}}') + '.' }, { v: PI * rv * rv * 2 * rv / 3, code: 'vol-slant', hint: 'Volume uses ' + t('h=r\\sqrt3') + ', not ' + t('s=2r') + '.' }, { v: 3 * V, code: 'no-third', hint: Hh.noThirdCone }],
            t('r=\\sqrt{\\tfrac{' + SA + '}{3\\pi}}=' + dd(rv)) + ' cm, ' + t('h=r\\sqrt3=' + dd(rv * Math.sqrt(3))) + ' cm.<br>' + t('V=\\tfrac13\\pi r^2h=' + dd(V) + '\\approx ' + rr(V, 1)) + ' cm³. (Rounding ' + t('r') + ' first gives ' + t(rr(PI * Math.sqrt(3) / 3 * rR * rR * rR, 1)) + ' — off.)', [t('V=\\tfrac13\\pi r^2(r\\sqrt3)') + ' with the unrounded ' + t('r') + '.'], 's=2r volume');
        } }] },
      { num: '19', stem: function (o) { return 'A cone and a right square-based pyramid have the same perpendicular height, ' + t(d1(o.h) + uT('cm')) + ', and equal volumes. The cone’s base radius is ' + t(d1(o.r) + uT('cm')) + '.'; },
        shared: function (r) { var rv = r.int(4, 12), h = r.int(8, 20); if (r.chance(0.2)) { rv = 8; h = 15; } return { r: rv, h: h, a: rv * Math.sqrt(PI) }; },
        parts: [
          { id: 'e19a', sub: 'a', level: 'ADV', make: function (r, o) {
            return near('Determine the pyramid’s base edge, to the nearest tenth of a centimetre.', o.a, 1, 'cm', [{ v: 2 * o.r, code: 'sq-diam', hint: 'Equal volumes and equal heights mean equal <b>base areas</b>: ' + t('a^2=\\pi r^2') + '. A square with edge = the diameter is bigger than the circle.' }, { v: PI * o.r * o.r, code: 'no-sqrt', hint: 'That is the base area ' + t('a^2') + '. Take the square root.' }, { v: o.r * Math.sqrt(PI / 3), code: 'no-third', hint: 'Both volumes have the ' + t('\\tfrac13') + ' — it cancels.' }],
              'Same height and same volume force equal base areas: ' + t('a^2=\\pi r^2=\\pi(' + o.r + ')^2=' + o.r * o.r + '\\pi') + ', so ' + t('a=' + o.r + '\\sqrt{\\pi}=' + dd(o.a) + '\\approx ' + rr(o.a, 1)) + ' cm.', [t('\\tfrac13 a^2h=\\tfrac13\\pi r^2h') + ' — what cancels?'], 'equal volume edge');
          } },
          { id: 'e19b', sub: 'b', level: 'PRG', make: function (r, o) {
            var D = 4 * o.r * o.r - PI * o.r * o.r;
            return near('A classmate guesses the base edge is ' + t(d1(2 * o.r) + uT('cm')) + ', “because that is the diameter.” By how many square centimetres would the square base (edge ' + t(d1(2 * o.r)) + ' cm) and the cone’s circular base differ?', D, 1, 'cm²', [{ v: 4 * o.r * o.r - 2 * PI * o.r, code: 'no-square', hint: 'Compare <b>areas</b>: the circle is ' + t('\\pi r^2') + '.' }, { v: 2 * o.r * o.r - PI * o.r * o.r, code: 'no-square', hint: 'The square’s area is ' + t('(' + 2 * o.r + ')^2') + '.' }],
              'Square: ' + t('(' + 2 * o.r + ')^2=' + 4 * o.r * o.r) + ' cm². Circle: ' + t('\\pi(' + o.r + ')^2=' + dd(PI * o.r * o.r)) + ' cm². Difference ' + t('=' + dd(D) + '\\approx ' + rr(D, 1)) + ' cm² — the four corners outside the circle, so ' + t(d1(2 * o.r)) + ' cm is too big.', ['Square area minus circle area.'], 'square vs circle base');
          } }] }
    ]
  });
})(window);
