/* Math 10C · Unit 10 · Lesson 3 — Surface Area and Volume of Prisms and Cylinders (M3; unit conversions M2)
 * Assignment questions 1–16 (u10_L03.tex) and the Lesson 3 Extra Practice (u10_EP03.tex, Parts A–I).
 * Every part is a generator: the booklet's numbers are one possible version, and every version keeps the same solid,
 * the same faces and the same kind of trap (diameter given, open top, wall thickness, mixed units …).
 * Exact π throughout, full precision carried, rounded once at the end — exactly as the booklet does.
 * Rounded answers use K.P.near-style checkers with targeted alternatives for the classic slips (diameter used as the
 * radius, curved surface only, a base missing or extra, the area formula used for a volume, a linear factor used
 * for square or cubic units …). Format slips (not rounded, wrong number of places) are nudges, not tries. */
(function (root) {
  'use strict';
  var HW = root.HW, F = HW.fmt, K = HW.kit, t = K.t, ok = K.ok;
  var PI = Math.PI, INK = '#2b3340', COL = '#13807a';
  var USG = 3.7854, UKG = 4.5461, FT2 = 0.092903, FT3 = 0.0283168, M3FT3 = 35.3147;

  HW.addCodes({
    'diam-radius': 'Used the diameter as the radius', 'sa-lateral': 'Lateral / curved surface only (bases left out)',
    'sa-one-base': 'Only one base counted', 'sa-extra-face': 'Counted a face that isn’t there (lid, hidden or buried face)',
    'sa-missing-face': 'Left out a face', 'sa-half': 'Counted one face of each pair (forgot ×2)', 'half-missing': 'Forgot the ½ (triangle or trapezoid area)',
    'hyp-leg': 'Used the hypotenuse as a leg (base or height)', 'v-used-sa': 'Mixed up surface area and volume', 'v-base-only': 'Base area only — didn’t multiply by the height',
    'conv-direction': 'Conversion done backwards (× instead of ÷)', 'conv-factor': 'Wrong metric conversion factor', 'conv-missing': 'Left out a unit conversion',
    'conv-gallon': 'Used the wrong gallon (US vs UK)', 'conv-linear': 'Used the linear factor for square/cubic units', 'conv-square': 'Used the square factor for cubic units',
    'conv-cube': 'Used the cubic factor for square units', 'round-early': 'Rounded an intermediate value', 'thick-once': 'Took the wall thickness off one side only',
    'thick-none': 'Ignored the wall thickness (outer dimensions)', 'no-sqrt': 'Forgot the square root (left r²)', 'no-pi': 'Left π out', 'gave-radius': 'Gave the radius, not the diameter',
    'root-index': 'Square root instead of cube root', 'mult-div': 'Multiplied instead of dividing', 'divided-pi': 'Divided by π an extra time', 'sa-backwards-bases': 'Working backwards: didn’t take off the bases',
    'half-lateral': 'Used πrh for the curved surface', 'wrong-height': 'Used the wrong dimension as the height', 'ft-decimal': 'Read decimal feet as inches',
    'area-rect': 'Used the whole bounding rectangle', 'area-part': 'Left out part of a composite area', 'area-trap-full': 'Used the full depth for the trapezoid part',
    'per-rate': 'Multiplied by the coverage instead of dividing', 'count-missing': 'Forgot to multiply by the number of items', 'circ-area': 'Mixed up circumference and area of a circle',
    'net-face': 'Read the wrong face off the net', 'swap-roll': 'Mixed up which side becomes the circumference', 'hole-wall': 'Left out the inside wall of the hole',
    'hole-circles': 'Didn’t remove the circles drilled out', 'hole-ignored': 'Ignored the hole', 'composite-overlap': 'Counted the hidden (joined) faces', 'units-mixed': 'Multiplied lengths in different units',
    'pct-base': 'Percent of the wrong total', 'cents-dollars': 'Gave dollars instead of cents', 'ratio-2': 'Thought doubling r doubles the volume', 'per-missing': 'Missed edges of the perimeter',
    'circles-count': 'Wrong number of circular ends', 'gave-diameter': 'Gave the diameter, not the radius', 'inner-dims': 'Used inside dimensions for an outside surface', 'wrong-face': 'Took off the wrong face', 'composite-sub': 'Subtracted a part that should be added', 'one-side': 'Counted one side face instead of four', 'area-overlap': 'Counted an overlap twice'
  });

  /* ---------- numbers ---------- */
  function rd(x, dp) { return K.roundTo(x, dp); }
  function fx(x, dp) { return F(rd(x, dp).toFixed(dp)); }
  function cl(x) { return +(+x).toFixed(6); }                 // remove floating noise
  function n(x) { return F(cl(x)); }                          // a given / exact value in LaTeX
  function ps(x) { return String(cl(x)); }                    // plain number for figure labels
  function p1(x) { return (+x).toFixed(1); }                  // plain, one decimal (14.0)
  function d1(x) { return F((+x).toFixed(1)); }               // LaTeX, one decimal
  function decs(x) { var s = String(cl(x)); return (s.split('.')[1] || '').length; }
  function U(u) { if (!u) return ''; var m = /^(.*?)([²³])$/.exec(u); if (m) return '\\text{ ' + m[1] + '}^{' + (m[2] === '²' ? 2 : 3) + '}'; return '\\text{ ' + u.replace(/%/g, '\\%') + '}'; }
  function A(v, code, hint) { return { v: v, code: code, hint: hint }; }
  function bold(x, dp, u) { return '\\approx\\mathbf{' + fx(x, dp) + '}' + U(u); }
  function boldEx(x, u) { return '=\\mathbf{' + n(x) + '}' + U(u); }

  /* ---------- checkers & part builders ---------- */
  function nearK(x, dp, alts, nr) {
    var c = K.near(x, dp, { alts: alts || [], nr: nr });
    return function (resp) {
      var raw = String(resp == null ? '' : resp), p = HW.parse.number(raw);
      if (p.ok && Math.abs(p.value - x) <= 1e-9 * Math.max(1, Math.abs(x)) && !(nr && raw.replace(/\s/g, '').length > 4)) return ok();
      return c(resp);
    };
  }
  function badOf(x, dp, alts) {
    var w = rd(x, dp), out = [];
    (alts || []).forEach(function (a) { if (isFinite(a.v)) { var v = rd(a.v, dp); if (Math.abs(v - w) > 1e-9 && out.indexOf(v.toFixed(dp)) < 0) out.push(v.toFixed(dp)); } });
    return out;
  }
  function nearPart(prompt, x, dp, unit, alts, sol, hints, text, o) {
    o = o || {};
    var key = rd(x, dp).toFixed(dp);
    return { prompt: prompt, input: { type: 'number', nr: !!o.nr, before: o.before, after: unit || undefined }, check: nearK(x, dp, alts, o.nr), key: key,
      answer: t((o.before ? '\\$' : '') + F(key) + U(unit)), solution: sol, hints: hints || [], text: text, bad: badOf(x, dp, alts) };
  }
  function exactPart(prompt, x, unit, alts, sol, hints, text, o) { return nearPart(prompt, x, Math.min(6, decs(x)), unit, alts, sol, hints, text, o); }
  /* specs: [{ label, x, dp (omit = exact), unit, alts }] */
  function fieldsPart(prompt, specs, sol, hints, text) {
    var checks = [], keys = [], fields = [], ans = [], dps = [];
    specs.forEach(function (s) {
      var dp = s.dp == null ? Math.min(4, decs(s.x)) : s.dp; dps.push(dp);
      checks.push(nearK(s.x, dp, s.alts)); var k = rd(s.x, dp).toFixed(dp); keys.push(k);
      fields.push({ label: s.label, after: s.unit || undefined, before: s.before }); ans.push(s.label + ' ' + t((s.before ? '\\$' : '') + F(k) + U(s.unit)));
    });
    var p = K.P.fields(prompt, fields, checks, keys, ans.join('<br>'), sol, hints, text);
    p.bad = [];
    specs.forEach(function (s, i) { var b = badOf(s.x, dps[i], s.alts); if (b.length) { var kk = keys.slice(); kk[i] = b[0]; p.bad.push(kk); } });
    return p;
  }
  function mc(r, prompt, opts, sol, hints, text) { return K.P.mc(r, prompt, opts, sol, hints, text); }

  /* ---------- standard hints ---------- */
  var H = {
    diam: 'The question gives the <b>diameter</b>. Halve it first: ' + t('r=d\\div 2') + '.',
    lateral: 'That is only the curved side. A closed cylinder also has two circular ends: ' + t('SA=2\\pi r^{2}+2\\pi rh') + '.',
    oneBase: 'You counted only one circular end. A closed cylinder has two: ' + t('2\\pi r^{2}') + '.',
    cylV: 'That’s a surface-area expression. Volume is base area × height: ' + t('V=\\pi r^{2}h') + '.',
    baseOnly: 'That’s the area of the base. Multiply it by the height to get the volume: ' + t('V=A_{\\text{Base}}\\times h') + '.',
    half: 'A triangle’s area is ' + t('\\tfrac12') + ' × base × height — the ' + t('\\tfrac12') + ' is missing.',
    early: 'Close — but you rounded part-way through. Keep the full calculator value (or exact ' + t('\\pi') + ') until the very end.'
  };

  /* ---------- figures ---------- */
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function txt(x, y, s, o) {
    o = o || {}; var it = /^[A-Za-zθ]$/.test(String(s)) ? ' font-style="italic"' : '';
    return '<text x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" font-size="' + (o.size || 13) + '" text-anchor="' + (o.anchor || 'middle') + '" dominant-baseline="central" fill="' + (o.color || INK) + '"' + it + (o.weight ? ' font-weight="' + o.weight + '"' : '') + ' paint-order="stroke" stroke="#fff" stroke-width="3" stroke-linejoin="round">' + esc(s) + '</text>';
  }
  function ln(a, b, o) { o = o || {}; return '<line x1="' + a[0].toFixed(1) + '" y1="' + a[1].toFixed(1) + '" x2="' + b[0].toFixed(1) + '" y2="' + b[1].toFixed(1) + '" stroke="' + (o.color || INK) + '" stroke-width="' + (o.w || 2) + '"' + (o.dash ? ' stroke-dasharray="5 4"' : '') + ' stroke-linecap="round"/>'; }
  function pg(pts, fill, o) { o = o || {}; return '<polygon points="' + pts.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' ') + '" fill="' + (fill || 'none') + '" stroke="' + (o.stroke || INK) + '" stroke-width="' + (o.w || 2) + '" stroke-linejoin="round"/>'; }
  function svgWrap(w, h, body, aria) { return '<svg class="fig-svg" viewBox="0 0 ' + Math.round(w) + ' ' + Math.round(h) + '" width="100%" style="max-width:' + Math.round(w) + 'px" role="img" aria-label="' + esc(aria || 'figure') + '">' + body + '</svg>'; }
  /* HW.solid with a wider viewBox (its right-hand labels, e.g. the prism's height, are cut off at 262) */
  function solid(kind, o) {
    o = Object.assign({ width: 270 }, o);
    return HW.solid(kind, o).replace('viewBox="-6 0 262 ', 'viewBox="-6 0 300 ');
  }
  /* a right prism drawn obliquely from its front face (any simple polygon, math coordinates, y up).
   * o = { dd: drawn depth, labels: [[edgeIndex, text, 'out' | 'in' | 'back']], depthLabel, depthAt, right: [vertexIndex],
   *       dash: [[p, q, label]], text: [[p, text, opts]], pts: extra bounding points, inner: fn(S, sc) -> svg, width, height } */
  function prism3d(poly, o) {
    o = o || {};
    var ang = 33 * PI / 180, dd = o.dd, dx = dd * Math.cos(ang), dy = dd * Math.sin(ang), N = poly.length, i;
    var back = poly.map(function (p) { return [p[0] + dx, p[1] + dy]; });
    var all = poly.concat(back).concat(o.pts || []);
    var xs = all.map(function (p) { return p[0]; }), ys = all.map(function (p) { return p[1]; });
    var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
    var maxW = o.width || 290, padL = o.padL || 64, padR = o.padR || 64, padY = o.padY || 24, maxH = o.height || 210;
    var sc = (maxW - padL - padR) / (x1 - x0); if ((y1 - y0) * sc > maxH - 2 * padY) sc = (maxH - 2 * padY) / (y1 - y0);
    var Wd = (x1 - x0) * sc + padL + padR, Ht = (y1 - y0) * sc + 2 * padY + (o.extraBottom || 0);
    var S = function (p) { return [padL + (p[0] - x0) * sc, padY + (y1 - p[1]) * sc]; };
    var area = 0; for (i = 0; i < N; i++) { var a = poly[i], b = poly[(i + 1) % N]; area += a[0] * b[1] - b[0] * a[1]; }
    var ccw = area > 0, vis = [], nrm = [];
    for (i = 0; i < N; i++) {
      var p = poly[i], q = poly[(i + 1) % N], ex = q[0] - p[0], ey = q[1] - p[1], nx = ccw ? ey : -ey, ny = ccw ? -ex : ex, L = Math.hypot(nx, ny) || 1;
      nrm.push([nx / L, ny / L]); vis.push(nx * dx + ny * dy > 1e-9);
    }
    var s = '';
    for (i = 0; i < N; i++) if (vis[i]) { var j = (i + 1) % N; s += pg([S(poly[i]), S(poly[j]), S(back[j]), S(back[i])], '#e3f1ef'); }
    s += pg(poly.map(S), '#f4faf9');
    for (i = 0; i < N; i++) {
      var j2 = (i + 1) % N, pv = (i - 1 + N) % N;
      if (!vis[i]) s += ln(S(back[i]), S(back[j2]), { dash: 1, w: 1.3 });
      if (!vis[i] && !vis[pv]) s += ln(S(poly[i]), S(back[i]), { dash: 1, w: 1.3 });
    }
    if (o.inner) s += o.inner(S, sc);
    (o.right || []).forEach(function (k) {
      var c = S(poly[k]), u = S(poly[(k + 1) % N]), v = S(poly[(k - 1 + N) % N]), nu = [u[0] - c[0], u[1] - c[1]], nv = [v[0] - c[0], v[1] - c[1]], lu = Math.hypot(nu[0], nu[1]), lv = Math.hypot(nv[0], nv[1]), m = 10;
      nu = [nu[0] / lu * m, nu[1] / lu * m]; nv = [nv[0] / lv * m, nv[1] / lv * m];
      s += '<polyline points="' + [c[0] + nu[0], c[1] + nu[1], c[0] + nu[0] + nv[0], c[1] + nu[1] + nv[1], c[0] + nv[0], c[1] + nv[1]].map(function (z) { return z.toFixed(1); }).join(' ') + '" fill="none" stroke="' + INK + '" stroke-width="1.3"/>';
    });
    (o.dash || []).forEach(function (d) { var a2 = S(d[0]), b2 = S(d[1]); s += ln(a2, b2, { dash: 1, w: 1.3 }); if (d[2]) s += txt((a2[0] + b2[0]) / 2 + 6, (a2[1] + b2[1]) / 2, d[2], { anchor: 'start' }); });
    (o.labels || []).forEach(function (Lb) {
      var k = Lb[0], where = Lb[2] || 'out', src = where === 'back' ? back : poly, a3 = S(src[k]), b3 = S(src[(k + 1) % N]), m3 = [(a3[0] + b3[0]) / 2, (a3[1] + b3[1]) / 2];
      var sx = nrm[k][0], sy = -nrm[k][1]; if (where === 'in') { sx = -sx; sy = -sy; }
      s += txt(m3[0] + sx * 9, m3[1] + sy * 12, Lb[1], { anchor: sx > 0.35 ? 'start' : sx < -0.35 ? 'end' : 'middle' });
    });
    if (o.depthLabel) {
      var at = o.depthAt;
      if (at == null) { at = 0; for (i = 1; i < N; i++) if (poly[i][0] > poly[at][0] + 1e-9 || (Math.abs(poly[i][0] - poly[at][0]) < 1e-9 && poly[i][1] < poly[at][1])) at = i; }
      var c1 = S(poly[at]), c2 = S(back[at]);
      s += txt((c1[0] + c2[0]) / 2 + 7, (c1[1] + c2[1]) / 2 + 11, o.depthLabel, { anchor: 'start' });
    }
    (o.text || []).forEach(function (T) { var p2 = S(T[0]); s += txt(p2[0], p2[1], T[1], T[2]); });
    return svgWrap(Wd, Ht, s, o.aria || 'prism');
  }
  function rectFig(l, w, h) { return solid('rectprism', { l: l, w: w, h: h }); }
  function rightTriPrism(a, b, L, o) { // a = horizontal leg, b = vertical leg (drawn to scale), L = length label
    o = o || {};
    var big = Math.max(a, b), A2 = a / big * 4, B2 = b / big * 4;
    var labels = [[0, o.aLab], [2, o.bLab]]; if (o.cLab) labels.push([1, o.cLab]);
    return prism3d([[0, 0], [A2, 0], [0, B2]], { dd: 3.2, labels: labels.filter(function (x) { return x[1]; }), right: [0], depthLabel: L, aria: 'right triangular prism' });
  }
  function cylFig(o) { return solid('cylinder', o); }

  /* ======================= Q1: volume ↔ capacity ======================= */
  var CONV_HINTS = [t('1\\text{ cm}^{3}=1\\text{ mL}') + ', ' + t('1000\\text{ mL}=1\\text{ L}') + ', ' + t('1\\text{ m}^{3}=1000\\text{ L}') + '.', 'Going to a <b>bigger</b> unit gives a <b>smaller</b> number (divide); going to a smaller unit gives a bigger number (multiply).'];
  var DIR = 'Check the direction: ', BIGGER = DIR + 'a bigger unit needs a smaller number — divide.', SMALLER = DIR + 'a smaller unit needs a bigger number — multiply.';

  /* ======================= shared generators ======================= */
  function q2Shared(r) {
    var l, w, h, a, b;
    do { l = r.int(180, 300) / 10; w = r.int(120, 200) / 10; h = r.int(40, 95) / 10; } while (l - w < 3 || w - h < 3);
    do { a = r.int(30, 90) / 10; b = r.int(40, 95) / 10; } while (Math.abs(a - b) < 1.2);
    return { l: l, w: w, h: h, a: a, b: b, L: r.int(80, 150) / 10 };
  }
  function q3Shared(r) {
    var L = r.pick([30, 35, 40, 45, 50]), d1v = r.pick([1, 1.2, 1.5, 2]), D, b;
    do { D = r.pick([3, 3.5, 4, 4.5, 5]); } while (D - d1v < 1.5);
    b = r.int(10, Math.min(20, L - 12));
    return { L: L, d1: d1v, D: D, b: b, W: r.int(15, 25) };
  }
  function poolArea(s) { return s.L * s.d1 + 0.5 * (s.L + s.b) * (s.D - s.d1); }
  function poolFig(s) {
    var v = 2.6, xl = (s.L - s.b) / 2;
    return HW.fig({ pts: { A: [0, 0], B: [s.L, 0], C: [s.L, -s.d1 * v], E: [xl + s.b, -s.D * v], G: [xl, -s.D * v], J: [0, -s.d1 * v] },
      segs: [['A', 'B', ps(s.L) + ' m'], ['B', 'C', ps(s.d1) + ' m'], ['C', 'E'], ['E', 'G', ps(s.b) + ' m'], ['G', 'J'], ['J', 'A', ps(s.d1) + ' m']],
      fill: [['A', 'B', 'C', 'E', 'G', 'J']], names: false, width: 330, pad: 46,
      extra: [{ type: 'dash', from: [s.L / 2, 0], to: [s.L / 2, -s.D * v] }, { type: 'text', at: [s.L / 2 + s.L * 0.07, -s.D * v * 0.55], text: ps(s.D) + ' m' }], aria: 'pool cross section' });
  }
  function drumShared(r) { return { d: r.pick([40, 44, 48, 52, 56, 60]), h: r.pick([70, 75, 80, 85, 90, 95, 100]), N: r.pick([200, 250, 300, 400, 500, 600]), c: r.pick([8, 8.5, 9, 9.5, 10, 10.5, 11, 12]) }; }
  function caseShared(r) { return { D: r.pick([28, 30, 32, 34, 36, 38, 40]), W: r.pick([20, 22, 24, 26, 28, 30]), H: r.pick([30, 34, 36, 40, 44, 48]), th: r.pick([1, 1.5, 2, 2.5]) }; }
  function truckShared(r) { var L = r.int(8, 12), W; do { W = r.int(5, 8); } while (W >= L); return { L: L, W: W, H: r.pick([3, 3.5, 4, 4.5]) }; }
  function truckStem(sh) {
    return 'A delivery truck carries gravel in an open-top box shaped like a right rectangular prism, ' + t(sh.L + '\\text{ ft}') + ' long, ' + t(sh.W + '\\text{ ft}') + ' wide, and ' + t(n(sh.H) + '\\text{ ft}') + ' high. The box has no top; a tarp covers the gravel once loaded. (Use ' + t('1\\text{ ft}=0.3048\\text{ m}') + '.)' + rectFig(sh.L + ' ft', sh.W + ' ft', ps(sh.H) + ' ft');
  }

  /* ======================= extra-practice figures ======================= */
  function trapPrism(a, b, ht, L, o) {
    var k = 4 / a, A2 = a * k, B2 = b * k, Hh = Math.max(ht * k, 1.3), off = (A2 - B2) / 2;
    o = o || {};
    if (o.invert) return prism3d([[off, 0], [off + B2, 0], [A2, Hh], [0, Hh]], { dd: 2.6, labels: [[0, o.bLab || ps(b)], [2, o.aLab || ps(a)]], dash: [[[A2 / 2, 0], [A2 / 2, Hh], o.hLab || ps(ht)]], depthLabel: L, depthAt: 1, aria: 'trapezoidal prism' });
    return prism3d([[0, 0], [A2, 0], [off + B2, Hh], [off, Hh]], { dd: 2.6, labels: [[0, o.aLab || ps(a)], [2, o.bLab || ps(b)]], dash: [[[A2 / 2, 0], [A2 / 2, Hh], o.hLab || ps(ht)]], depthLabel: L, aria: 'trapezoidal prism' });
  }
  function shedFig(s) {
    var k = 4 / s.w, w = 4, H = s.H * k, R = s.R * k;
    return prism3d([[0, 0], [w, 0], [w, H], [w / 2, H + R], [0, H]], { dd: 3.4, labels: [[0, p1(s.w) + ' m'], [4, p1(s.H) + ' m']], dash: [[[w / 2, H], [w / 2, H + R], p1(s.R) + ' m']], depthLabel: p1(s.len) + ' m', aria: 'shed' });
  }
  function boxNet(l, w, h) { // B (l×h) / A (l×w, with E and F at the sides) / C (l×h) / D (l×w)
    var k = Math.min(230 / (l + 2 * h), 300 / (2 * h + 2 * w)), ox = 62 + h * k, oy = 12, L = l * k, Wd = w * k, Hh = h * k, s = '';
    var rects = [['B', ox, oy, L, Hh], ['A', ox, oy + Hh, L, Wd], ['C', ox, oy + Hh + Wd, L, Hh], ['D', ox, oy + 2 * Hh + Wd, L, Wd], ['E', ox - Hh, oy + Hh, Hh, Wd], ['F', ox + L, oy + Hh, Hh, Wd]];
    rects.forEach(function (q) { s += '<rect x="' + q[1].toFixed(1) + '" y="' + q[2].toFixed(1) + '" width="' + q[3].toFixed(1) + '" height="' + q[4].toFixed(1) + '" fill="#f4faf9" stroke="' + INK + '" stroke-width="1.8"/>' + txt(q[1] + q[3] / 2, q[2] + q[4] / 2, q[0], { size: 15, weight: 700, color: COL }); });
    s += txt(ox + L / 2, oy + 2 * Hh + 2 * Wd + 12, p1(l) + ' cm') + txt(ox - 6, oy + Hh / 2, p1(h) + ' cm', { anchor: 'end' }) + txt(ox - Hh - 6, oy + Hh + Wd / 2, p1(w) + ' cm', { anchor: 'end' });
    return svgWrap(ox + L + Hh + 20, oy + 2 * Hh + 2 * Wd + 26, s, 'net of a rectangular prism');
  }
  function triNet(p, q, c, L) { // rectangles p, q, c (stacked, width L); right triangles on the q-rectangle
    var k = Math.min(230 / (L + 2 * p), 300 / (p + q + c)), x0 = 62 + p * k, y0 = 12, W = L * k, s = '';
    var ys = [y0, y0 + p * k, y0 + (p + q) * k, y0 + (p + q + c) * k];
    for (var i = 0; i < 3; i++) s += '<rect x="' + x0.toFixed(1) + '" y="' + ys[i].toFixed(1) + '" width="' + W.toFixed(1) + '" height="' + (ys[i + 1] - ys[i]).toFixed(1) + '" fill="#f4faf9" stroke="' + INK + '" stroke-width="1.8"/>';
    s += pg([[x0, ys[1]], [x0, ys[2]], [x0 - p * k, ys[1]]], '#e3f1ef', { w: 1.8 }) + pg([[x0 + W, ys[1]], [x0 + W, ys[2]], [x0 + W + p * k, ys[1]]], '#e3f1ef', { w: 1.8 });
    s += txt(x0 + W / 2, y0 - 2 + 0, '', {}) + txt(x0 + W / 2, ys[3] + 12, p1(L) + ' cm') + txt(x0 - 6, (ys[0] + ys[1]) / 2, p1(p) + ' cm', { anchor: 'end' }) +
      txt(x0 + 6, (ys[1] + ys[2]) / 2, p1(q) + ' cm', { anchor: 'start' }) + txt(x0 - 6, (ys[2] + ys[3]) / 2, p1(c) + ' cm', { anchor: 'end' });
    return svgWrap(x0 + W + p * k + 16, ys[3] + 26, s, 'net of a triangular prism');
  }
  function cylNet(rr, hh) {
    var R = 30, rw = 2 * PI * R, rh = Math.max(60, Math.min(130, rw * hh / (2 * PI * rr))), x = 40, ytop = 12 + 2 * R, s = '';
    s += '<circle cx="' + (x + R) + '" cy="' + (ytop - R) + '" r="' + R + '" fill="#f4faf9" stroke="' + INK + '" stroke-width="1.8"/>' + ln([x + R, ytop - R], [x + 2 * R, ytop - R], { w: 1.3 }) + txt(x + 2 * R + 6, ytop - R - 2, 'r = ' + p1(rr) + ' cm', { anchor: 'start' });
    s += '<rect x="' + x + '" y="' + ytop + '" width="' + rw.toFixed(1) + '" height="' + rh.toFixed(1) + '" fill="#e3f1ef" stroke="' + INK + '" stroke-width="1.8"/>';
    s += '<circle cx="' + (x + R) + '" cy="' + (ytop + rh + R) + '" r="' + R + '" fill="#f4faf9" stroke="' + INK + '" stroke-width="1.8"/>';
    s += txt(x + rw / 2, ytop + rh / 2, 'width = ' + p1(hh) + ' cm') + txt(x + rw / 2 + 30, ytop + rh + 14, 'length = ?', { color: COL });
    return svgWrap(x + rw + 20, ytop + rh + 2 * R + 14, s, 'net of a cylinder');
  }
  function sheetFig(a, b) {
    return HW.fig({ pts: { P: [0, 0], Q: [a, 0], R: [a, b], S: [0, b] }, segs: [['P', 'Q', p1(a) + ' cm'], ['Q', 'R', p1(b) + ' cm'], ['R', 'S'], ['S', 'P']], fill: [['P', 'Q', 'R', 'S']], names: false, width: 260, aria: 'tin sheet' });
  }
  function lFig(s) {
    var W = s.W, Hh = s.H, tb = s.tb, wv = s.wv;
    return prism3d([[0, 0], [W, 0], [W, tb], [wv, tb], [wv, Hh], [0, Hh]], { dd: s.D * 0.55, labels: [[0, p1(W)], [5, p1(Hh)], [4, p1(wv), 'in'], [2, p1(W - wv), 'in'], [3, p1(Hh - tb)], [1, p1(tb)]], depthLabel: p1(s.D), depthAt: 1, aria: 'L-shaped prism' });
  }
  function plateFig(s) {
    var k = 4 / s.s, w = 4, T = s.T * k, rr = s.d / 2 * k;
    return prism3d([[0, 0], [w, 0], [w, T], [0, T]], { dd: 4, labels: [[0, p1(s.s) + ' cm'], [3, p1(s.T) + ' cm']], depthLabel: p1(s.s) + ' cm', pts: [[0, T + 3.2]],
      inner: function (S, sc) {
        var ang = 33 * PI / 180, c = S([w / 2 + 2 * Math.cos(ang), T + 2 * Math.sin(ang)]), rx = rr * sc, ry = rx * 0.42, dep = T * sc;
        return '<ellipse cx="' + c[0].toFixed(1) + '" cy="' + c[1].toFixed(1) + '" rx="' + rx.toFixed(1) + '" ry="' + ry.toFixed(1) + '" fill="#fff" stroke="' + INK + '" stroke-width="1.8"/>' +
          ln([c[0] - rx, c[1]], [c[0] - rx, c[1] + dep], { dash: 1, w: 1.2 }) + ln([c[0] + rx, c[1]], [c[0] + rx, c[1] + dep], { dash: 1, w: 1.2 }) +
          ln([c[0] - rx, c[1]], [c[0] + rx, c[1]], { w: 1.2 }) + txt(c[0], c[1] - ry - 9, p1(s.d) + ' cm', { size: 12 });
      }, aria: 'plate with a hole' });
  }
  function ornamentFig(s) {
    var k = 4 / s.s, w = 4, T = s.t * k, rr = s.r * k, hh = s.h * k, ang = 33 * PI / 180, ctr = [w / 2 + 2 * Math.cos(ang), T + 2 * Math.sin(ang)];
    return prism3d([[0, 0], [w, 0], [w, T], [0, T]], { dd: 4, labels: [[0, p1(s.s) + ' cm'], [3, p1(s.t) + ' cm']], depthLabel: p1(s.s) + ' cm', pts: [[ctr[0], ctr[1] + hh + rr * 0.5], [ctr[0] + rr + 1.8, ctr[1]]], height: 240,
      inner: function (S, sc) {
        var c = S(ctr), rx = rr * sc, ry = rx * 0.35, H = hh * sc, top = c[1] - H;
        return '<rect x="' + (c[0] - rx).toFixed(1) + '" y="' + top.toFixed(1) + '" width="' + (2 * rx).toFixed(1) + '" height="' + H.toFixed(1) + '" fill="#f4faf9" stroke="none"/>' +
          '<path d="M' + (c[0] - rx).toFixed(1) + ' ' + c[1].toFixed(1) + ' A' + rx.toFixed(1) + ' ' + ry.toFixed(1) + ' 0 0 0 ' + (c[0] + rx).toFixed(1) + ' ' + c[1].toFixed(1) + '" fill="#f4faf9" stroke="' + INK + '" stroke-width="2"/>' +
          ln([c[0] - rx, c[1]], [c[0] - rx, top]) + ln([c[0] + rx, c[1]], [c[0] + rx, top]) +
          '<ellipse cx="' + c[0].toFixed(1) + '" cy="' + top.toFixed(1) + '" rx="' + rx.toFixed(1) + '" ry="' + ry.toFixed(1) + '" fill="#f4faf9" stroke="' + INK + '" stroke-width="2"/>' +
          ln([c[0], top], [c[0] + rx, top], { w: 1.2 }) + txt(c[0] + rx / 2, top - ry - 9, 'r = ' + p1(s.r) + ' cm', { size: 12 }) + txt(c[0] + rx + 6, top + H / 2, p1(s.h) + ' cm', { anchor: 'start', size: 12 });
      }, aria: 'cylinder on a square prism' });
  }

  /* ======================= EP shared generators ======================= */
  var TRIS = [[7.5, 18, 19.5], [6, 8, 10], [9, 12, 15], [5, 12, 13], [8, 15, 17], [4.5, 6, 7.5], [10.5, 14, 17.5]];
  function ep1Shared(r) { var tr = r.pick(TRIS); return { h: r.pick([12, 13, 14, 15, 16]), tv: tr[0], th: tr[1], tc: tr[2], ta: r.int(12, 18), tb: r.int(6, 11), tht: r.int(4, 8), r: r.int(30, 60) / 10 }; }
  function ep2Shared(r) { return { w: r.pick([4, 6, 8]), H: r.int(25, 40) / 10, R: r.int(12, 25) / 10, len: r.int(12, 24) / 2 }; }
  function shedArea(s) { return s.w * s.H + 0.5 * s.w * s.R; }
  function ep3Shared(r) { var l, w, h; do { l = r.int(10, 16); w = r.int(6, 10); h = r.int(4, 7); } while (l - w < 3 || w - h < 2); return { l: l, w: w, h: h }; }
  function ep4Shared(r) { var tr = r.pick([[6, 8, 10], [4.5, 6, 7.5], [7.5, 10, 12.5], [9, 12, 15], [5, 12, 13], [3, 4, 5]]); return { p: tr[0], q: tr[1], c: tr[2], L: r.int(10, 20) }; }
  function ep5Shared(r) { return { r: r.int(30, 70) / 10, h: r.int(80, 160) / 10 }; }
  function ep6Shared(r) { var a = r.int(20, 30), b = r.int(12, a - 4); return { a: a, b: b }; }
  function ep8Shared(r) {
    for (var g = 0; g < 200; g++) {
      var len = r.pick([80, 100, 120, 150]), dd = r.pick([20, 25, 30]), a = r.pick([30, 35, 40, 45]), b = a + r.pick([20, 25, 30, 35]), Ab = 0.5 * (a + b) * dd;
      if (Ab % 1 === 0 && decs(Ab * len / 1000) <= 1) return { len: len, dd: dd, a: a, b: b, Ab: Ab, cap: cl(Ab * len / 1000) };
    }
    return { len: 120, dd: 25, a: 40, b: 70, Ab: 1375, cap: 165 };
  }
  function ep9Shared(r) { var rr = r.pick([6, 7, 8, 9, 10, 11, 12, 14]), h = r.int(15, 40), cs = rd(2 * PI * rr * h, 1); return { r: rr, h: h, cs: cs }; }
  /* T ≠ d: when the thickness equals the diameter, the net change 2πr(T − r) equals the two circles 2πr², and two (c) options read the same */
  function ep10Shared(r) { var s = r.pick([10, 12, 14, 15, 16]), d, T; do { d = r.pick([4, 5, 6, 7, 8]); T = r.int(3, 7); } while (d > s - 4 || T <= d / 2 + 0.5 || T === d); return { s: s, d: d, T: T }; }
  function ep11Shared(r) { var W = r.int(8, 12), H = r.int(7, 10), tb = r.int(3, 5), wv = r.int(3, 5); while (H - tb < 3) tb--; while (W - wv < 4) wv--; return { W: W, H: H, tb: tb, wv: wv, D: r.int(5, 9) }; }
  function lArea(s) { return s.W * s.H - (s.W - s.wv) * (s.H - s.tb); }
  function ep12Shared(r) { var s = r.pick([24, 30, 36]), rr; do { rr = r.int(5, 10); } while (rr > s / 2 - 4); return { s: s, t: r.pick([8, 10, 12]), r: rr, h: r.int(15, 25) }; }
  function ep13Shared(r) { return { L: r.pick([60, 70, 80, 90, 100]), W: r.pick([30, 35, 40]), D: r.pick([30, 35, 40, 45, 50]) }; }
  function ep15Shared(r) { return { lm: r.pick([0.9, 1.0, 1.2, 1.5]), wc: r.pick([35, 40, 45, 50]), dmm: r.pick([300, 350, 380, 400, 420]) }; }
  function ep16Shared(r) { return { d: r.pick([1.8, 2.0, 2.4, 2.6, 3.0]), h: r.pick([2.0, 2.5, 3.0, 3.5]), pr: r.pick([39.5, 42, 47.5, 52.25]) }; }
  function ep20Shared(r) { return { s: r.pick([10, 12, 16, 20]) }; }

  var LESSON = HW.defineLesson({
    id: 'u10l3', unit: 10, num: '3', title: 'Surface Area and Volume of Prisms and Cylinders', outcome: 'M3',
    blurb: 'Volume is base area × height for every right prism and cylinder; surface area is the total area of every face. Volume and capacity units, diameters, open tops and working backwards.',
    questions: [
      /* ================= Q1 ================= */
      { num: '1', section: 'Volume and capacity units', stem: 'Convert the following volumes to the indicated unit. Round to the nearest thousandth where necessary.', parts: [
        { id: '1a', level: 'BEG', outcome: 'M2', make: function (r) {
          var c = r.int(1001, 9999); if (c % 100 === 0) c += 7; var x = c / 1000;
          return exactPart('(a) ' + t(F(c) + '\\text{ cm}^{3}') + ' to litres', x, 'L',
            [A(c * 1000, 'conv-direction', BIGGER), A(c / 100, 'conv-factor', 'Check the factor: ' + t('1\\text{ cm}^{3}=1\\text{ mL}') + ' and ' + t('1000\\text{ mL}=1\\text{ L}') + ', so divide by ' + t('1000') + '.')],
            t('1\\text{ cm}^{3}=1\\text{ mL}') + ', so ' + t(F(c) + '\\text{ cm}^{3}=' + F(c) + '\\text{ mL}') + '.<br>' + t(F(c) + '\\div 1000' + boldEx(x, 'L')), CONV_HINTS, 'cm³ → L: ' + c);
        } },
        { id: '1b', level: 'BEG', outcome: 'M2', make: function (r) {
          var L = r.chance(0.7) ? r.int(12, 98) / 10 : r.int(101, 999) / 100; if (L % 1 === 0) L += 0.3; L = cl(L); var x = Math.round(L * 1000);
          return exactPart('(b) ' + t(n(L)) + ' litres to ' + t('\\text{cm}^{3}'), x, 'cm³',
            [A(L / 1000, 'conv-direction', SMALLER), A(L * 100, 'conv-factor', t('1\\text{ L}=1000\\text{ mL}=1000\\text{ cm}^{3}') + ' — multiply by ' + t('1000') + '.')],
            t('1\\text{ L}=1000\\text{ mL}=1000\\text{ cm}^{3}') + '.<br>' + t(n(L) + '\\times 1000' + boldEx(x, 'cm³')), CONV_HINTS, 'L → cm³: ' + L);
        } },
        { id: '1c', level: 'BEG', outcome: 'M2', make: function (r) {
          var m = cl(r.int(10010, 99990) / 100), x = Math.round(m * 1000);
          return exactPart('(c) ' + t(n(m) + '\\text{ m}^{3}') + ' to litres', x, 'L',
            [A(m / 1000, 'conv-direction', SMALLER), A(m * 1e6, 'conv-factor', 'That treats the cubic metres as if they were converted to cm³. Use ' + t('1\\text{ m}^{3}=1000\\text{ L}') + '.'), A(m * 100, 'conv-factor', 'Use ' + t('1\\text{ m}^{3}=1000\\text{ L}') + '.')],
            t('1\\text{ m}^{3}=1000\\text{ L}') + '.<br>' + t(n(m) + '\\times 1000' + boldEx(x, 'L')), CONV_HINTS, 'm³ → L: ' + m);
        } },
        { id: '1d', level: 'BEG', outcome: 'M2', make: function (r) {
          var L = r.int(4, 90) * 1000 + r.pick([0, 0, 0, 500, 250]), x = L / 1000;
          return exactPart('(d) ' + t(F(L)) + ' litres to ' + t('\\text{m}^{3}'), x, 'm³',
            [A(L * 1000, 'conv-direction', BIGGER), A(L / 100, 'conv-factor', 'Use ' + t('1\\text{ m}^{3}=1000\\text{ L}') + ': divide by ' + t('1000') + '.')],
            t('1\\text{ m}^{3}=1000\\text{ L}') + ', so divide.<br>' + t(F(L) + '\\div 1000' + boldEx(x, 'm³')), CONV_HINTS, 'L → m³: ' + L);
        } },
        { id: '1e', level: 'BEG', outcome: 'M2', make: function (r) {
          var g = r.int(2, 19) * 5, x = g * USG;
          return nearPart('(e) ' + t(g) + ' US gallons to litres', x, 3, 'L',
            [A(g / USG, 'conv-direction', SMALLER + ' (' + t('1\\text{ US gal}=3.7854\\text{ L}') + ').'), A(g * UKG, 'conv-gallon', 'That’s the <b>imperial (UK)</b> gallon. A US gallon is ' + t('3.7854\\text{ L}') + '.')],
            t('1\\text{ US gal}=3.7854\\text{ L}') + '.<br>' + t(g + '\\times 3.7854' + (decs(x) > 3 ? '=' + n(x) + bold(x, 3, 'L') : boldEx(x, 'L'))),
            [t('1\\text{ US gallon}=3.7854\\text{ L}') + ' and ' + t('1\\text{ imperial (UK) gallon}=4.5461\\text{ L}') + '.', CONV_HINTS[1]], 'US gal → L: ' + g);
        } },
        { id: '1f', level: 'EMG', outcome: 'M2', make: function (r) {
          var L = r.int(5, 95) * 10, x = L / UKG;
          return nearPart('(f) ' + t(L) + ' litres to UK gallons', x, 3, 'UK gal',
            [A(L * UKG, 'conv-direction', BIGGER + ' (' + t('1\\text{ UK gal}=4.5461\\text{ L}') + ').'), A(L / USG, 'conv-gallon', 'That’s the <b>US</b> gallon. A UK (imperial) gallon is ' + t('4.5461\\text{ L}') + '.')],
            t('1\\text{ UK gal}=4.5461\\text{ L}') + ', so divide.<br>' + t(L + '\\div 4.5461=' + x.toFixed(5) + '\\ldots' + bold(x, 3, 'UK gal')),
            [t('1\\text{ imperial (UK) gallon}=4.5461\\text{ L}') + '.', 'A gallon is bigger than a litre, so there are fewer gallons than litres.'], 'L → UK gal: ' + L);
        } }] },

      /* ================= Q2 ================= */
      { num: '2', section: 'Surface area and volume', shared: q2Shared, stem: 'Calculate the surface area and volume of each right prism. Round to the nearest tenth where necessary.', parts: [
        { id: '2a', sub: 'a SA', level: 'BEG', make: function (r, s) {
          var lw = s.l * s.w, lh = s.l * s.h, wh = s.w * s.h, SA = 2 * (lw + lh + wh), V = lw * s.h;
          return nearPart('(a) Surface area of this right rectangular prism:' + rectFig(ps(s.l) + ' mm', ps(s.w) + ' mm', ps(s.h) + ' mm'), SA, 1, 'mm²',
            [A(lw + lh + wh, 'sa-half', 'That’s one face of each size. A rectangular prism has <b>two</b> of each — double it.'), A(V, 'v-used-sa', 'That’s the volume (mm³). Surface area adds the areas of the six faces.'), A(2 * (lw + lh), 'sa-missing-face', 'One pair of faces is missing. Count all six: front/back, top/bottom, left/right.')],
            'Six faces in three matching pairs:<br>' + t('SA=2(lw+lh+wh)=2(' + n(lw) + '+' + n(lh) + '+' + n(wh) + ')') + '<br>' + t('=2(' + n(lw + lh + wh) + ')=' + n(SA) + bold(SA, 1, 'mm²')),
            ['Find the area of the front, the top and the side, then double the total.', 'Area units are squared: mm².'], 'SA rect prism ' + [s.l, s.w, s.h].join('×'));
        } },
        { id: '2a2', sub: 'a V', level: 'BEG', make: function (r, s) {
          var lw = s.l * s.w, V = lw * s.h, SA = 2 * (lw + s.l * s.h + s.w * s.h);
          return nearPart('(a) Volume of this right rectangular prism:' + rectFig(ps(s.l) + ' mm', ps(s.w) + ' mm', ps(s.h) + ' mm'), V, 1, 'mm³',
            [A(SA, 'v-used-sa', 'That’s the surface area. Volume = base area × height.'), A(lw, 'v-base-only', H.baseOnly)],
            t('V=A_{\\text{Base}}\\times h=(' + n(s.l) + '\\times ' + n(s.w) + ')\\times ' + n(s.h) + '=' + n(lw) + '\\times ' + n(s.h) + '=' + n(V) + bold(V, 1, 'mm³')),
            ['Volume of a right prism: ' + t('V=A_{\\text{Base}}\\times h') + '.', 'Multiply all three dimensions.'], 'V rect prism ' + [s.l, s.w, s.h].join('×'));
        } },
        { id: '2b', sub: 'b SA', level: 'PRG', make: function (r, s) {
          var a = s.a, b = s.b, L = s.L, c = Math.sqrt(a * a + b * b), B = a * b / 2, P = a + b + c, SA = 2 * B + P * L;
          return nearPart('(b) Surface area of this right triangular prism (the triangular ends are right triangles):' + rightTriPrism(a, b, ps(L) + ' m', { aLab: ps(a) + ' m', bLab: ps(b) + ' m' }), SA, 1, 'm²',
            [A(4 * B + P * L, 'half-missing', H.half), A(P * L, 'sa-lateral', 'That’s only the three rectangles. Add the two triangular ends.'), A(B + P * L, 'sa-one-base', 'Only one triangular end is counted — a prism has two.'),
              A(2 * B + (a + b) * L, 'sa-missing-face', 'The sloping rectangle is missing. Its width is the hypotenuse of the triangle — find it with the Pythagorean theorem.'), A(B * L, 'v-used-sa', 'That’s the volume. Surface area adds the areas of the five faces.')],
            'The third side is needed: ' + t('c=\\sqrt{' + n(a) + '^{2}+' + n(b) + '^{2}}=\\sqrt{' + n(a * a + b * b) + '}=' + c.toFixed(5) + '\\ldots\\text{ m}') + '.<br>' +
            'Two triangles: ' + t('2\\times\\tfrac12(' + n(a) + ')(' + n(b) + ')=' + n(2 * B) + '\\text{ m}^{2}') + '.<br>' +
            'Three rectangles = perimeter × length: ' + t('(' + n(a) + '+' + n(b) + '+' + c.toFixed(5) + ')\\times ' + n(L) + '=' + (P * L).toFixed(3) + '\\text{ m}^{2}') + '.<br>' +
            t('SA=' + n(2 * B) + '+' + (P * L).toFixed(3) + '=' + SA.toFixed(3) + '\\ldots' + bold(SA, 1, 'm²')),
            ['Five faces: two triangles and three rectangles. The rectangles are all ' + t(n(L) + '\\text{ m}') + ' long.', 'The sloping face is as wide as the hypotenuse: ' + t('c^{2}=a^{2}+b^{2}') + '.'], 'SA right tri prism ' + [a, b, L].join(', '));
        } },
        { id: '2b2', sub: 'b V', level: 'EMG', make: function (r, s) {
          var a = s.a, b = s.b, L = s.L, B = a * b / 2, V = B * L, c = Math.sqrt(a * a + b * b);
          return nearPart('(b) Volume of this right triangular prism (the triangular ends are right triangles):' + rightTriPrism(a, b, ps(L) + ' m', { aLab: ps(a) + ' m', bLab: ps(b) + ' m' }), V, 1, 'm³',
            [A(2 * V, 'half-missing', H.half), A(B, 'v-base-only', H.baseOnly), A(2 * B + (a + b + c) * L, 'v-used-sa', 'That’s the surface area. Volume = base area × length.')],
            t('A_{\\text{Base}}=\\tfrac12(' + n(a) + ')(' + n(b) + ')=' + n(B) + '\\text{ m}^{2}') + '<br>' + t('V=A_{\\text{Base}}\\times h=' + n(B) + '\\times ' + n(L) + '=' + n(V) + bold(V, 1, 'm³')),
            ['The base is the right triangle: its legs are its base and height.', t('V=A_{\\text{Base}}\\times h') + ', where ' + t('h') + ' is the length of the prism.'], 'V right tri prism ' + [a, b, L].join(', '));
        } }] },

      /* ================= Q3 ================= */
      { num: '3', shared: q3Shared, stem: function (s) { return 'A cross section of the water in a swimming pool is shown below. (The top is a rectangle ' + t(n(s.d1) + '\\text{ m}') + ' deep; below it the pool narrows to a flat bottom.)' + poolFig(s); }, parts: [
        { id: '3a', level: 'EMG', make: function (r, s) {
          var Ar = s.L * s.d1, tH = s.D - s.d1, At = 0.5 * (s.L + s.b) * tH, X = Ar + At;
          return exactPart('(a) Calculate the area of the cross section.', X, 'm²',
            [A(s.L * s.D, 'area-rect', 'That’s the whole ' + t(s.L + '\\times ' + n(s.D)) + ' rectangle — the bottom corners are cut off. Split it into a rectangle and a trapezoid.'),
              A(Ar + 0.5 * (s.L + s.b) * s.D, 'area-trap-full', 'The trapezoid is only ' + t(n(s.D) + '-' + n(s.d1) + '=' + n(tH) + '\\text{ m}') + ' tall — the top ' + t(n(s.d1) + '\\text{ m}') + ' is the rectangle.'),
              A(Ar + 2 * At, 'half-missing', 'Trapezoid area is ' + t('\\tfrac12(a+b)h') + ' — the ' + t('\\tfrac12') + ' is missing.'), A(At, 'area-part', 'That’s just the trapezoid. Add the rectangle on top.'), A(0.5 * (s.L + s.b) * s.D, 'area-trap-full', 'That treats the whole shape as one trapezoid, but the sides are straight down for the first ' + t(n(s.d1) + '\\text{ m}') + '. Use a rectangle plus a trapezoid.')],
            'Rectangle on top: ' + t(s.L + '\\times ' + n(s.d1) + '=' + n(Ar) + '\\text{ m}^{2}') + '.<br>Trapezoid below: parallel sides ' + t(s.L) + ' and ' + t(s.b) + ', height ' + t(n(s.D) + '-' + n(s.d1) + '=' + n(tH)) + ':<br>' +
            t('\\tfrac12(' + s.L + '+' + s.b + ')(' + n(tH) + ')=' + n(At) + '\\text{ m}^{2}') + '<br>' + t('A=' + n(Ar) + '+' + n(At) + boldEx(X, 'm²')),
            ['Cut the shape into a rectangle on top and a trapezoid below.', 'Trapezoid: ' + t('A=\\tfrac12(a+b)h') + '.'], 'pool cross section');
        } },
        { id: '3b', level: 'PRG', make: function (r, s) {
          var X = poolArea(s), V = X * s.W, Lt = Math.round(V * 1000);
          return exactPart('(b) The cross-section area is ' + t(n(X) + '\\text{ m}^{2}') + '. If the pool is ' + t(s.W) + ' metres wide, determine the number of litres of water it holds when full.', Lt, 'L',
            [A(V, 'conv-missing', 'That’s the volume in m³. The question asks for <b>litres</b>: ' + t('1\\text{ m}^{3}=1000\\text{ L}') + '.'), A(V * 100, 'conv-factor', 'Use ' + t('1\\text{ m}^{3}=1000\\text{ L}') + '.'), A(V / 1000, 'conv-direction', SMALLER),
              A(s.L * s.D * s.W * 1000, 'area-rect', 'Use the cross-section area, not the full rectangle ' + t(s.L + '\\times ' + n(s.D)) + '.')],
            'The water is a prism: its base is the cross section and its length is the pool’s width.<br>' + t('V=A_{\\text{Base}}\\times h=' + n(X) + '\\times ' + s.W + '=' + n(V) + '\\text{ m}^{3}') + '<br>' + t(n(V) + '\\times 1000' + boldEx(Lt, 'L')),
            ['Volume = cross-section area × width of the pool.', t('1\\text{ m}^{3}=1000\\text{ L}') + '.'], 'pool litres');
        } }] },

      /* ================= Q4 ================= */
      { num: '4', shared: function (r) { return { r: r.int(40, 75) / 10, h: r.int(120, 220) / 10 }; },
        stem: function (s) { return 'Calculate the volume and surface area of the cylinder shown. Answer in appropriate units to the nearest tenth.' + cylFig({ d: 'd = ' + ps(2 * s.r) + ' in', h: 'h = ' + ps(s.h) + ' in' }); }, parts: [
        { id: '4a', sub: 'V', level: 'EMG', make: function (r, s) {
          var R = s.r, d = cl(2 * R), V = PI * R * R * s.h;
          return nearPart('Volume', V, 1, 'in³',
            [A(PI * d * d * s.h, 'diam-radius', H.diam), A(2 * PI * R * s.h, 'v-used-sa', H.cylV), A(PI * R * R, 'v-base-only', H.baseOnly), A(2 * PI * R * R + 2 * PI * R * s.h, 'v-used-sa', 'That’s the surface area. Volume: ' + t('V=\\pi r^{2}h') + '.')],
            'The diameter is given, so ' + t('r=' + n(d) + '\\div 2=' + n(R) + '\\text{ in}') + '.<br>' + t('V=\\pi r^{2}h=\\pi(' + n(R) + ')^{2}(' + n(s.h) + ')=' + n(R * R * s.h) + '\\pi=' + V.toFixed(4) + '\\ldots' + bold(V, 1, 'in³')),
            [H.diam, t('V=\\pi r^{2}h') + '. Keep ' + t('\\pi') + ' exact and round only at the end.'], 'cylinder V, d=' + d);
        } },
        { id: '4b', sub: 'SA', level: 'EMG', make: function (r, s) {
          var R = s.r, d = cl(2 * R), SA = 2 * PI * R * R + 2 * PI * R * s.h;
          return nearPart('Surface area', SA, 1, 'in²',
            [A(2 * PI * d * d + 2 * PI * d * s.h, 'diam-radius', H.diam), A(2 * PI * R * s.h, 'sa-lateral', H.lateral), A(PI * R * R + 2 * PI * R * s.h, 'sa-one-base', H.oneBase), A(PI * R * R * s.h, 'v-used-sa', 'That’s the volume. Surface area: ' + t('SA=2\\pi r^{2}+2\\pi rh') + '.')],
            t('r=' + n(d) + '\\div 2=' + n(R) + '\\text{ in}') + '<br>' + t('SA=2\\pi r^{2}+2\\pi rh=2\\pi(' + n(R) + ')^{2}+2\\pi(' + n(R) + ')(' + n(s.h) + ')') + '<br>' + t('=' + n(2 * R * R) + '\\pi+' + n(2 * R * s.h) + '\\pi=' + n(2 * R * R + 2 * R * s.h) + '\\pi=' + SA.toFixed(4) + '\\ldots' + bold(SA, 1, 'in²')),
            [H.diam, 'Two circular ends plus the curved side: ' + t('SA=2\\pi r^{2}+2\\pi rh') + '.'], 'cylinder SA, d=' + d);
        } }] },

      /* ================= Q5 ================= */
      { num: '5', shared: drumShared, stem: function (s) { return 'Chemical waste is stored in metal drums with a diameter of ' + t(s.d + '\\text{ cm}') + ' and a height of ' + t(s.h + '\\text{ cm}') + '. Sketch a drum on paper and label its dimensions before you start.'; }, parts: [
        { id: '5a', level: 'PRG', make: function (r, s) {
          var R = s.d / 2, V = PI * R * R * s.h, VL = V / 1000;
          return nearPart('(a) Determine the volume of the drum to the nearest tenth of a litre.', VL, 1, 'L',
            [A(PI * s.d * s.d * s.h / 1000, 'diam-radius', H.diam), A(V / 100, 'conv-factor', t('1\\text{ cm}^{3}=1\\text{ mL}') + ' and ' + t('1000\\text{ mL}=1\\text{ L}') + ': divide the cm³ by ' + t('1000') + '.'), A(V, 'conv-missing', 'That’s the volume in cm³ (= mL). Convert to <b>litres</b>.'), A(2 * PI * R * s.h / 1000, 'v-used-sa', H.cylV)],
            t('r=' + s.d + '\\div 2=' + R + '\\text{ cm}') + ', ' + t('h=' + s.h + '\\text{ cm}') + '.<br>' + t('V=\\pi r^{2}h=\\pi(' + R + ')^{2}(' + s.h + ')=' + F(R * R * s.h) + '\\pi=' + F(V.toFixed(3)) + '\\ldots\\text{ cm}^{3}') + '<br>' +
            t('1\\text{ cm}^{3}=1\\text{ mL}') + ', so this is ' + t(F(V.toFixed(1)) + '\\text{ mL}=' + VL.toFixed(4) + '\\text{ L}' + bold(VL, 1, 'L')),
            [H.diam, 'Find the volume in cm³, then ' + t('1\\text{ cm}^{3}=1\\text{ mL}') + ' and ' + t('1000\\text{ mL}=1\\text{ L}') + '.'], 'drum litres d=' + s.d + ' h=' + s.h);
        } },
        { id: '5b', level: 'PRG', outcome: 'M2', make: function (r, s) {
          var R = s.d / 2, VL = PI * R * R * s.h / 1000, G = VL / USG;
          return nearPart('(b) Determine the volume of the drum in US gallons, to the nearest tenth.', G, 1, 'US gal',
            [A(VL * USG, 'conv-direction', BIGGER + ' (' + t('1\\text{ US gal}=3.7854\\text{ L}') + ').'), A(VL / UKG, 'conv-gallon', 'That’s the UK gallon. A <b>US</b> gallon is ' + t('3.7854\\text{ L}') + '.'), A(PI * s.d * s.d * s.h / 1000 / USG, 'diam-radius', H.diam), A(VL, 'conv-missing', 'That’s litres. Convert to US gallons: ' + t('1\\text{ US gal}=3.7854\\text{ L}') + '.')],
            'Volume: ' + t('\\pi(' + R + ')^{2}(' + s.h + ')=' + F(V3(R, s.h)) + '\\ldots\\text{ cm}^{3}=' + VL.toFixed(4) + '\\ldots\\text{ L}') + '.<br>Carry the unrounded litres and divide by ' + t('3.7854') + ':<br>' + t(VL.toFixed(4) + '\\div 3.7854=' + G.toFixed(5) + '\\ldots' + bold(G, 1, 'US gal')),
            ['Find the volume in litres first (' + t('r=d\\div 2') + ').', t('1\\text{ US gallon}=3.7854\\text{ L}') + ' — there are fewer gallons than litres.'], 'drum US gal');
        } },
        { id: '5c', level: 'ADV', make: function (r, s) {
          var R = s.d / 2, one = 2 * PI * R * s.h + PI * R * R, m2 = one / 10000, tot = m2 * s.N, P = tot / s.c, full = 2 * PI * R * s.h + 2 * PI * R * R;
          return nearPart('(c) The exterior of the drum, except the base, is to be painted blue. Determine how many litres of paint are needed to paint ' + t(s.N) + ' drums if one litre of paint covers ' + t(n(s.c) + '\\text{ m}^{2}') + '. Answer to the nearest tenth of a litre.', P, 1, 'L',
            [A(full / 10000 * s.N / s.c, 'sa-extra-face', 'The base is <b>not</b> painted — count the curved side and the top circle only.'), A(2 * PI * R * s.h / 10000 * s.N / s.c, 'sa-lateral', 'The top of the drum is painted too: add one circle, ' + t('\\pi r^{2}') + '.'),
              A(one / 100 * s.N / s.c, 'conv-linear', 'Square the factor for area units: ' + t('1\\text{ m}^{2}=100^{2}=10\\,000\\text{ cm}^{2}') + ', not ' + t('100') + '.'), A(tot * s.c, 'per-rate', 'Each litre covers ' + t(n(s.c) + '\\text{ m}^{2}') + ', so <b>divide</b> the area by ' + t(n(s.c)) + '.'),
              A(m2 / s.c, 'count-missing', 'That’s the paint for <b>one</b> drum. Multiply by the number of drums.'), A((2 * PI * s.d * s.h + PI * s.d * s.d) / 10000 * s.N / s.c, 'diam-radius', H.diam)],
            'Painted: the curved side and the top (not the base). ' + t('r=' + R + '\\text{ cm}') + '.<br>' + t('2\\pi rh+\\pi r^{2}=2\\pi(' + R + ')(' + s.h + ')+\\pi(' + R + ')^{2}=' + F(2 * R * s.h + R * R) + '\\pi=' + F(one.toFixed(2)) + '\\ldots\\text{ cm}^{2}') + ' per drum.<br>' +
            t('1\\text{ m}^{2}=10\\,000\\text{ cm}^{2}') + ', so ' + t(m2.toFixed(6) + '\\text{ m}^{2}') + ' per drum.<br>' + t(s.N) + ' drums: ' + t(s.N + '\\times ' + m2.toFixed(6) + '=' + F(tot.toFixed(4)) + '\\text{ m}^{2}') + '.<br>' +
            'Paint: ' + t(F(tot.toFixed(4)) + '\\div ' + n(s.c) + '=' + P.toFixed(4) + '\\ldots' + bold(P, 1, 'L')),
            ['Which surfaces get paint? The curved side and the top circle — not the base.', 'Convert cm² to m² with ' + t('1\\text{ m}^{2}=10\\,000\\text{ cm}^{2}') + ', then divide the total area by the coverage per litre.'], 'paint for drums');
        } }] },

      /* ================= Q6–8 ================= */
      { num: '6', section: 'Working backwards from the volume', stem: '', parts: [
        { id: '6', level: 'PRG', make: function (r) {
          var sd = r.int(4, 15), Vml = sd * sd * sd, VL = Vml / 1000;
          return exactPart('A cube has a volume of ' + t(n(VL)) + ' litres. Determine the length of each side of the cube in cm.', sd, 'cm',
            [A(Math.cbrt(VL), 'conv-missing', 'Convert the litres to cm³ first: ' + t('1\\text{ L}=1000\\text{ mL}=1000\\text{ cm}^{3}') + '.'), A(Math.cbrt(VL * 1e6), 'conv-factor', t('1\\text{ L}=1000\\text{ cm}^{3}') + ' (not ' + t('1\\,000\\,000') + ').'),
              A(Math.sqrt(Vml), 'root-index', 'A cube’s volume is ' + t('s^{3}') + ', so take the <b>cube</b> root, not the square root.'), A(Vml / 3, 'root-index', 'Dividing by 3 doesn’t undo cubing — take the cube root: ' + t('s=\\sqrt[3]{V}') + '.')],
            t(n(VL) + '\\text{ L}=' + F(Vml) + '\\text{ mL}') + ', and ' + t('1\\text{ mL}=1\\text{ cm}^{3}') + ', so ' + t('V=' + F(Vml) + '\\text{ cm}^{3}') + '.<br>' + t('V=s^{3}') + ', so ' + t('s=\\sqrt[3]{' + F(Vml) + '}=\\mathbf{' + sd + '}\\text{ cm}') + ' (since ' + t(sd + '^{3}=' + F(Vml)) + ').',
            ['Change litres to cm³ first.', 'For a cube ' + t('V=s^{3}') + ', so ' + t('s=\\sqrt[3]{V}') + '.'], 'cube from ' + VL + ' L');
        } }] },
      { num: '7', stem: '', parts: [
        { id: '7', level: 'EMG', make: function (r) {
          var V = r.int(300, 650), h = r.int(50, 95) / 10, B = V / h;
          return nearPart('A cylindrical jar of jam has a volume of ' + t(V + '\\text{ cm}^{3}') + '. If the height of the jar is ' + t(n(h) + '\\text{ cm}') + ', determine the area of the bottom of the jar to the nearest tenth of a ' + t('\\text{cm}^{2}') + '.' + cylFig({ h: ps(h) + ' cm' }), B, 1, 'cm²',
            [A(V * h, 'mult-div', t('V=A_{\\text{Base}}\\times h') + ', so ' + t('A_{\\text{Base}}=V\\div h') + ' — divide, don’t multiply.'), A(B / PI, 'divided-pi', 'The bottom’s area <i>is</i> ' + t('\\pi r^{2}') + ' — you don’t need to divide by ' + t('\\pi') + '. Just ' + t('V\\div h') + '.'), A(Math.sqrt(B / PI), 'circ-area', 'That’s the radius. The question asks for the <b>area</b> of the bottom.')],
            t('V=A_{\\text{Base}}\\times h') + ', so ' + t('A_{\\text{Base}}=\\dfrac{V}{h}=\\dfrac{' + V + '}{' + n(h) + '}=' + B.toFixed(4) + '\\ldots' + bold(B, 1, 'cm²')),
            ['Use ' + t('V=A_{\\text{Base}}\\times h') + ' and solve for ' + t('A_{\\text{Base}}') + '.', 'You don’t need the radius at all.'], 'jar base area');
        } }] },
      { num: '8', stem: '', parts: [
        { id: '8', level: 'PRG', make: function (r) {
          var V = r.int(50, 150) * 5, h = r.int(80, 150) / 10, R = Math.sqrt(V / (PI * h)), D = 2 * R;
          return nearPart('A cylindrical soda can has a volume of ' + t(V + '\\text{ mL}') + '. Determine, to the nearest ' + t('0.1\\text{ cm}') + ', the diameter of the can if the height is ' + t(n(h) + '\\text{ cm}') + '.', D, 1, 'cm',
            [A(R, 'gave-radius', 'That’s the radius. The question asks for the <b>diameter</b>: ' + t('d=2r') + '.'), A(2 * V / (PI * h), 'no-sqrt', 'You found ' + t('r^{2}') + ' — take the square root to get ' + t('r') + ', then double it.'),
              A(2 * Math.sqrt(V / h), 'no-pi', 'The base area is ' + t('\\pi r^{2}') + ', so divide by ' + t('\\pi') + ' before taking the square root.'), A(V / (PI * h), 'no-sqrt', 'That’s ' + t('r^{2}') + '. Take the square root, then double.')],
            t(V + '\\text{ mL}=' + V + '\\text{ cm}^{3}') + '.<br>' + t('A_{\\text{Base}}=\\dfrac{' + V + '}{' + n(h) + '}=' + (V / h).toFixed(5) + '\\ldots\\text{ cm}^{2}') + '<br>' + t('\\pi r^{2}=' + (V / h).toFixed(5) + '\\ldots') + ', so ' + t('r^{2}=' + (V / h / PI).toFixed(5) + '\\ldots') + ' and ' + t('r=' + R.toFixed(5) + '\\ldots\\text{ cm}') + '.<br>' + t('d=2r=' + D.toFixed(5) + '\\ldots' + bold(D, 1, 'cm')),
            [t('1\\text{ mL}=1\\text{ cm}^{3}') + '. Then ' + t('V=\\pi r^{2}h') + ' — solve for ' + t('r') + '.', 'Divide by ' + t('\\pi h') + ', take the square root, then double to get the diameter.'], 'soda can diameter');
        } }] },

      /* ================= Q9 ================= */
      { num: '9', section: 'Problems', shared: caseShared, stem: function (s) { return 'A wooden display case is built in the shape of a rectangular prism with outer dimensions ' + t(s.D + '\\text{ cm}') + ' (depth) × ' + t(s.W + '\\text{ cm}') + ' (width) × ' + t(s.H + '\\text{ cm}') + ' (height). The wood used is ' + t(n(s.th) + '\\text{ cm}') + ' thick on all sides.' + rectFig(s.W + ' cm', s.D + ' cm', s.H + ' cm'); }, parts: [
        { id: '9a', level: 'PRG', make: function (r, s) {
          var t2 = 2 * s.th, a = s.D - t2, b = s.W - t2, c = s.H - t2, V = a * b * c;
          return exactPart('(a) Determine the volume of the interior space of the case.', V, 'cm³',
            [A((s.D - s.th) * (s.W - s.th) * (s.H - s.th), 'thick-once', 'The wood is on <b>both</b> sides of each dimension, so take off ' + t('2\\times ' + n(s.th) + '=' + n(t2) + '\\text{ cm}') + ' from each.'), A(s.D * s.W * s.H, 'thick-none', 'That’s the outer volume. The interior is smaller — the wood takes up ' + t(n(s.th) + '\\text{ cm}') + ' on every side.')],
            'Take ' + t('2(' + n(s.th) + ')=' + n(t2) + '\\text{ cm}') + ' off each dimension:<br>depth ' + t(s.D + '-' + n(t2) + '=' + n(a)) + ', width ' + t(s.W + '-' + n(t2) + '=' + n(b)) + ', height ' + t(s.H + '-' + n(t2) + '=' + n(c)) + '.<br>' + t('V=' + n(a) + '\\times ' + n(b) + '\\times ' + n(c) + boldEx(V, 'cm³')),
            ['The interior is smaller than the outside by the wood on <b>both</b> sides.', 'Subtract ' + t('2\\times') + ' the thickness from each dimension, then multiply.'], 'case interior');
        } },
        { id: '9b', level: 'PRG', make: function (r, s) {
          var L = s.D, W = s.W, H2 = s.H, tot = 2 * (L * W + L * H2 + W * H2), fr = W * H2, X = tot - fr;
          return exactPart('(b) All outer faces except the front face (' + t(W + '\\text{ cm}\\times ' + H2 + '\\text{ cm}') + ') are to be varnished. Determine the surface area to be varnished.', X, 'cm²',
            [A(tot, 'sa-extra-face', 'The front face is not varnished — subtract it.'), A(tot - 2 * fr, 'sa-missing-face', 'Only the <b>front</b> is left unvarnished; the back face is still varnished.'), A(tot - L * H2, 'wrong-face', 'The front face is the ' + t(W + '\\times ' + H2) + ' face.'),
              A(2 * ((L - 2 * s.th) * (W - 2 * s.th) + (L - 2 * s.th) * (H2 - 2 * s.th) + (W - 2 * s.th) * (H2 - 2 * s.th)) - (W - 2 * s.th) * (H2 - 2 * s.th), 'inner-dims', 'Varnish goes on the <b>outside</b>: use the outer dimensions.')],
            'Use the outer dimensions:<br>' + t('SA_{\\text{total}}=2(' + L + '\\times ' + W + '+' + L + '\\times ' + H2 + '+' + W + '\\times ' + H2 + ')=2(' + F(L * W + L * H2 + W * H2) + ')=' + F(tot) + '\\text{ cm}^{2}') + '<br>The front face ' + t(W + '\\times ' + H2 + '=' + F(fr) + '\\text{ cm}^{2}') + ' is not varnished:<br>' + t(F(tot) + '-' + F(fr) + boldEx(X, 'cm²')),
            ['Find the total surface area of the outside, then subtract the front face.'], 'case varnish');
        } }] },

      /* ================= Q10 ================= */
      { num: '10', stem: '', parts: [
        { id: '10', level: 'ADV', make: function (r) {
          var Ar, V, L;
          for (var g = 0; g < 300; g++) { Ar = r.int(10, 20); V = r.int(15, 40) / 10; L = V * M3FT3 / Ar; var fr = L - Math.floor(L); if (L > 3.5 && L < 12 && Math.abs(fr - 0.5) > 0.15) break; }
          if (g === 300) { Ar = 14; V = 2.8; L = V * M3FT3 / Ar; }
          var fig = prism3d([[0, 0], [4.4, 0], [2.2, 3]], { dd: 2.6, text: [[[2.2, 0.8], 'Area = ' + Ar + ' ft²', { size: 12 }]], depthLabel: 'L = ?', aria: 'tent' });
          return nearPart('A pup tent in the shape of a triangular prism has a triangular entrance with an area of ' + t(Ar + '\\text{ ft}^{2}') + '. If the space inside the tent has a volume of ' + t(n(V) + '\\text{ m}^{3}') + ', determine the length of the tent to the nearest foot. (Use ' + t('1\\text{ ft}=0.3048\\text{ m}') + '.)' + fig, L, 0, 'ft',
            [A(V / Ar, 'conv-missing', 'The area is in ft² but the volume is in m³ — convert the volume to ft³ first.'), A(V / 0.3048 / Ar, 'conv-linear', 'For cubic units, <b>cube</b> the linear factor: ' + t('1\\text{ m}^{3}=\\left(\\tfrac{1}{0.3048}\\right)^{3}\\approx 35.3147\\text{ ft}^{3}') + '.'),
              A(V / 0.3048 / 0.3048 / Ar, 'conv-square', 'Volume units are cubic: cube the factor, don’t square it (' + t('1\\text{ m}^{3}\\approx 35.3147\\text{ ft}^{3}') + ').'), A(V * M3FT3 * Ar, 'mult-div', t('V=A_{\\text{Base}}\\times L') + ', so ' + t('L=V\\div A_{\\text{Base}}') + '.')],
            'The base area is in ft² but the volume is in m³, so convert the volume. Cube the linear factor: ' + t('1\\text{ m}^{3}=\\left(\\tfrac{1}{0.3048}\\right)^{3}\\text{ ft}^{3}=35.3147\\text{ ft}^{3}') + '.<br>' + t(n(V) + '\\times 35.3147=' + (V * M3FT3).toFixed(4) + '\\text{ ft}^{3}') + '<br>' + t('L=\\dfrac{V}{A_{\\text{Base}}}=\\dfrac{' + (V * M3FT3).toFixed(4) + '}{' + Ar + '}=' + L.toFixed(4) + '\\ldots' + bold(L, 0, 'ft')),
            ['Put both measurements in the same units first. Volume units are cubic, so cube the length factor.', t('V=A_{\\text{Base}}\\times L') + ' — divide the volume by the entrance area.'], 'tent length');
        } }] },

      /* ================= Q11 ================= */
      { num: '11', section: 'Multiple choice and numerical response', stem: '', parts: [
        { id: '11', level: 'EMG', make: function (r) {
          var who = r.pick(['Yin', 'Maya', 'Arjun', 'Tess', 'Kofi']), sc = r.pick([
            who + ' cuts the lid off a cylindrical can. Which expression gives the surface area of the remaining can (curved side and bottom only, no top)?',
            who + ' is making a cylindrical flower pot that is open at the top. Which expression gives the surface area of the pot (curved side and bottom)?',
            'A cylindrical pail has a bottom but no lid. Which expression gives the area of metal needed to make it?']);
          return mc(r, sc, [
            { html: t('2\\pi r^{2}+2\\pi rh'), why: 'That counts <b>two</b> circles — the top is gone, so only one circle is left.', code: 'two-circles' },
            { html: t('\\pi r^{2}+2\\pi rh'), right: true },
            { html: t('\\pi r^{2}+\\pi rh'), why: 'The curved surface is still the whole rectangle: circumference × height ' + t('=2\\pi rh') + '. Only a circle was removed.', code: 'half-curved' },
            { html: t('2\\pi r(r+h)'), why: t('2\\pi r(r+h)') + ' is just ' + t('2\\pi r^{2}+2\\pi rh') + ' factored — still the whole closed can.', code: 'factored-full' }],
            'A closed cylinder has ' + t('SA=2\\pi r^{2}+2\\pi rh') + ' (two circles + the curved side). With no top, one circle is gone: ' + t('\\pi r^{2}+2\\pi rh') + '.', ['Count the circles: how many circular ends are left?'], 'open-top cylinder SA expression');
        } }] },
      /* ================= Q12–14 (truck box) ================= */
      { num: '12', shared: truckShared, stem: truckStem, parts: [
        { id: '12', level: 'EMG', outcome: 'M2', make: function (r, s) {
          var V = s.L * s.W * s.H, ok3 = V * FT3, f = function (x) { return t(F(x < 100 ? x.toFixed(1) : x.toFixed(1)) + '\\text{ m}^{3}'); };
          return mc(r, 'The volume of gravel the truck can transport, in ' + t('\\text{m}^{3}') + ', is closest to', [
            { html: f(ok3), right: true },
            { html: f(V * FT2), why: 'That uses the <b>square</b> factor ' + t('0.3048^{2}') + '. Volume units are cubic: ' + t('1\\text{ ft}^{3}=0.3048^{3}\\text{ m}^{3}') + '.', code: 'square' },
            { html: f(V * 0.3048), why: 'That uses the linear factor once. For cubic units, cube it: ' + t('1\\text{ ft}^{3}=0.3048^{3}\\approx 0.0283\\text{ m}^{3}') + '.', code: 'linear' },
            { html: f(V / FT3), why: 'A cubic metre is much bigger than a cubic foot, so the number of m³ must be <b>smaller</b> than ' + t(n(V)) + '.', code: 'direction' }],
            t('V=' + s.L + '\\times ' + s.W + '\\times ' + n(s.H) + '=' + n(V) + '\\text{ ft}^{3}') + '. Cube the linear factor: ' + t('1\\text{ ft}^{3}=0.3048^{3}=0.0283168\\text{ m}^{3}') + '.<br>' + t(n(V) + '\\times 0.0283168=' + ok3.toFixed(4) + '\\approx ' + ok3.toFixed(1) + '\\text{ m}^{3}') + '.',
            ['Find the volume in ft³ first.', 'For cubic units, cube the length factor: ' + t('0.3048^{3}') + '.'], 'truck volume m³');
        } }] },
      { num: '13', shared: truckShared, stem: truckStem, parts: [
        { id: '13', level: 'ADV', make: function (r, s) {
          var one = s.L * s.W + 2 * s.L * s.H + 2 * s.W * s.H, ft = 2 * one, m2 = ft * FT2;
          return nearPart('<i>Numerical response.</i> Before the box is attached to the truck, all of the inside <b>and</b> outside faces of the box are coated with primer. The amount of primer needed, to the nearest ' + t('0.1\\text{ m}^{2}') + ', is ____.', m2, 1, 'm²',
            [A(one * FT2, 'sa-one-side', 'That’s one coat of the box. The inside <b>and</b> the outside are primed — double it.'), A(2 * (one + s.L * s.W) * FT2, 'sa-extra-face', 'The box has no top — count the bottom and four sides only.'),
              A(ft * 0.3048, 'conv-linear', 'For square units, <b>square</b> the linear factor: ' + t('1\\text{ ft}^{2}=0.3048^{2}=0.092903\\text{ m}^{2}') + '.'), A(ft * FT3, 'conv-cube', 'Area units are square: use ' + t('0.3048^{2}') + ', not ' + t('0.3048^{3}') + '.'), A(ft, 'conv-missing', 'That’s in ft². Convert to m²: ' + t('1\\text{ ft}^{2}=0.3048^{2}\\text{ m}^{2}') + '.')],
            'Open top: the bottom and four sides.<br>' + t(s.L + '(' + s.W + ')+2(' + s.L + ')(' + n(s.H) + ')+2(' + s.W + ')(' + n(s.H) + ')=' + n(s.L * s.W) + '+' + n(2 * s.L * s.H) + '+' + n(2 * s.W * s.H) + '=' + n(one) + '\\text{ ft}^{2}') + '<br>Inside and outside: ' + t('2\\times ' + n(one) + '=' + n(ft) + '\\text{ ft}^{2}') + '.<br>' + t('1\\text{ ft}^{2}=0.3048^{2}=0.092903\\text{ m}^{2}') + ': ' + t(n(ft) + '\\times 0.092903=' + m2.toFixed(4) + '\\ldots' + bold(m2, 1, 'm²')),
            ['Which faces does an open-top box have? Then remember the inside <b>and</b> the outside.', 'For area units, square the factor: ' + t('0.3048^{2}') + '.'], 'truck primer', { nr: true });
        } }] },
      { num: '14', shared: truckShared, stem: truckStem, parts: [
        { id: '14', level: 'ADV', make: function (r, s) {
          var B = s.L * s.W, T, hft, a, b, list = r.shuffle([8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
          for (var i = 0; i < list.length; i++) { T = list[i]; hft = T / FT3 / B; a = Math.floor(hft); var inch = (hft - a) * 12; b = Math.round(inch); if (b < 12 && b > 0 && Math.abs(inch - Math.floor(inch) - 0.5) > 0.15) break; }
          var ans = a + b, tenths = Math.floor((hft - a) * 10 + 1e-9), hund = Math.floor((hft - a) * 100 + 1e-9);
          var h2 = T / FT2 / B, a2 = Math.floor(h2), b2 = Math.round((h2 - a2) * 12);
          return nearPart('<i>Numerical response.</i> Designers want a new box that holds ' + t(T + '\\text{ m}^{3}') + ' of gravel, keeping the same ' + t(s.L + '\\text{ ft}') + ' length and ' + t(s.W + '\\text{ ft}') + ' width — only the height changes. The new height can be written as ' + t('a') + ' feet and ' + t('b') + ' inches, to the nearest inch. The value of ' + t('a+b') + ' is ____.', ans, 0, null,
            [A(a + tenths, 'ft-decimal', 'The decimal part of the feet is not inches: ' + t('0.1\\text{ ft}\\ne 1\\text{ in}') + '. Multiply the decimal part by ' + t('12') + '.'), A(a + hund, 'ft-decimal', 'The decimal part of the feet is not inches. Multiply it by ' + t('12') + ' to get inches.'),
              A(a2 + (b2 === 12 ? 0 : b2) + (b2 === 12 ? 1 : 0), 'conv-square', 'Volume units are cubic: ' + t('1\\text{ ft}^{3}=0.3048^{3}=0.0283168\\text{ m}^{3}') + '.'), A(a, 'incomplete', 'That’s just ' + t('a') + '. Add the inches, ' + t('b') + '.')],
            'Convert the volume to ft³: ' + t(T + '\\div 0.0283168=' + (T / FT3).toFixed(4) + '\\text{ ft}^{3}') + '.<br>Base area ' + t('=' + s.L + '\\times ' + s.W + '=' + B + '\\text{ ft}^{2}') + ', so height ' + t('=\\dfrac{' + (T / FT3).toFixed(4) + '}{' + B + '}=' + hft.toFixed(5) + '\\text{ ft}') + '.<br>' +
            t((hft - a).toFixed(5) + '\\times 12=' + ((hft - a) * 12).toFixed(2) + '\\text{ in}') + ', so the height is ' + t(a + '\\text{ ft }' + b + '\\text{ in}') + ': ' + t('a=' + a) + ', ' + t('b=' + b) + '.<br>' + t('a+b=\\mathbf{' + ans + '}'),
            ['Convert ' + t('\\text{m}^{3}') + ' to ' + t('\\text{ft}^{3}') + ' (cube the factor), then height = volume ÷ base area.', 'Turn the decimal part of the feet into inches by multiplying by ' + t('12') + '.'], 'truck new height', { nr: true });
        } }] },
      { num: '15', stem: '', parts: [
        { id: '15', level: 'EMG', outcome: 'M2', make: function (r) {
          var v = r.pick([[1, 'US'], [1, 'US'], [1, 'UK'], [2, 'US'], [3, 'US'], [2, 'UK'], [3, 'UK']]), k = v[0], gal = v[1] === 'US' ? USG : UKG, oth = v[1] === 'US' ? UKG : USG, x = gal / 8 * k * 1000;
          var what = k === 1 ? 'a ' + v[1] + ' pint' : k + ' ' + v[1] + ' pints';
          return nearPart('<i>Numerical response.</i> To the nearest mL, the number of mL in ' + what + ' is ____. (' + t('1\\text{ US gallon}=3.7854\\text{ L}') + ', ' + t('1\\text{ UK gallon}=4.5461\\text{ L}') + ', ' + t('1\\text{ gallon}=8\\text{ pints}') + ')', x, 0, 'mL',
            [A(oth / 8 * k * 1000, 'conv-gallon', 'Use the <b>' + v[1] + '</b> gallon: ' + t('1\\text{ ' + v[1] + ' gal}=' + gal + '\\text{ L}') + '.'), A(gal * 8 * k * 1000, 'conv-direction', 'A pint is <b>smaller</b> than a gallon: divide by ' + t('8') + '.'), A(gal / 8 * k * 100, 'conv-factor', t('1\\text{ L}=1000\\text{ mL}') + '.')],
            t('1\\text{ ' + v[1] + ' pint}=' + gal + '\\div 8=' + cl(gal / 8) + '\\text{ L}=' + cl(gal / 8 * 1000) + '\\text{ mL}') + (k > 1 ? '<br>' + t(k + '\\times ' + cl(gal / 8 * 1000) + '=' + cl(x)) : '') + t(bold(x, 0, 'mL')),
            ['A gallon is 8 pints, so a pint is the gallon ÷ 8.', 'Then change litres to millilitres: × ' + t('1000') + '.'], 'mL in ' + what, { nr: true });
        } }] },

      /* ================= Q16 ================= */
      { num: '16', section: 'Working backwards from the surface area', stem: 'Work backwards from the surface area to find the unknown dimension.', parts: [
        { id: '16a', level: 'PRG', make: function (r) {
          var R, SA, h;
          do { R = r.pick([3, 3.5, 4, 4.5, 5, 5.5, 6]); SA = r.int(25, 60) * 10; h = (SA - 2 * PI * R * R) / (2 * PI * R); } while (h < 4 || h > 20);
          return nearPart('(a) A closed can has a surface area of ' + t(SA + '\\text{ cm}^{2}') + ' and a radius of ' + t(n(R) + '\\text{ cm}') + '. Determine its height, to the nearest tenth of a centimetre.', h, 1, 'cm',
            [A(SA / (2 * PI * R), 'sa-backwards-bases', 'Part of the ' + t(SA + '\\text{ cm}^{2}') + ' is the two circular ends. Subtract ' + t('2\\pi r^{2}') + ' first, then divide by ' + t('2\\pi r') + '.'), A((SA - PI * R * R) / (2 * PI * R), 'sa-one-base', 'A closed can has <b>two</b> circular ends: subtract ' + t('2\\pi r^{2}') + '.'),
              A((SA - 2 * PI * R * R) / (PI * R), 'half-lateral', 'The curved surface is ' + t('2\\pi rh') + ', so divide by ' + t('2\\pi r') + ', not ' + t('\\pi r') + '.')],
            t(SA + '=2\\pi(' + n(R) + ')^{2}+2\\pi(' + n(R) + ')h=' + n(2 * R * R) + '\\pi+' + n(2 * R) + '\\pi h') + '<br>' + t(n(2 * R) + '\\pi h=' + SA + '-' + n(2 * R * R) + '\\pi=' + (SA - 2 * PI * R * R).toFixed(3) + '\\ldots') + '<br>' + t('h=\\dfrac{' + (SA - 2 * PI * R * R).toFixed(3) + '\\ldots}{' + (2 * PI * R).toFixed(3) + '\\ldots}=' + h.toFixed(4) + '\\ldots' + bold(h, 1, 'cm')),
            ['Write ' + t('SA=2\\pi r^{2}+2\\pi rh') + ' and substitute everything you know.', 'Subtract the two circles, then divide by ' + t('2\\pi r') + '.'], 'can height from SA');
        } },
        { id: '16b', level: 'EMG', make: function (r) {
          var s = r.int(4, 12), h = r.int(3, 15); while (h === s) h = r.int(3, 15); var SA = 2 * s * s + 4 * s * h;
          return exactPart('(b) A closed box has a square base ' + t(s + '\\text{ cm}') + ' on a side and a surface area of ' + t(SA + '\\text{ cm}^{2}') + '. Determine its height.', h, 'cm',
            [A((SA - s * s) / (4 * s), 'sa-one-base', 'A closed box has <b>two</b> square faces (top and bottom): subtract ' + t('2s^{2}') + '.'), A(SA / (4 * s), 'sa-backwards-bases', 'Subtract the two square faces first, then divide by the four sides.'), A((SA - 2 * s * s) / s, 'one-side', 'There are <b>four</b> rectangular sides, each ' + t(s + '\\times h') + ': divide by ' + t(4 * s) + '.')],
            'Two square bases: ' + t('2(' + s + ')(' + s + ')=' + 2 * s * s + '\\text{ cm}^{2}') + '. Four sides, each ' + t(s + '\\times h') + ': ' + t(4 * s + 'h') + '.<br>' + t(SA + '=' + 2 * s * s + '+' + 4 * s + 'h') + ', so ' + t(4 * s + 'h=' + (SA - 2 * s * s)) + ' and ' + t('h=\\mathbf{' + h + '}\\text{ cm}') + '.<br>Check: ' + t(2 * s * s + '+' + 4 * s + '(' + h + ')=' + SA) + ' ✓',
            ['Two square faces plus four rectangular sides.', 'Subtract the squares, then divide by ' + t('4\\times') + ' the side length.'], 'box height from SA');
        } }] }
    ],

    extra: [
      /* ================= EP Part A ================= */
      { num: '1', section: 'Extra practice A — One formula, three bases', shared: ep1Shared, stem: function (s) { return 'Every right prism and right cylinder obeys ' + t('V=A_{\\text{Base}}\\times h') + '. The three solids all have the same height, ' + t('h=' + d1(s.h) + '\\text{ cm}') + '; only the base changes. Use exact ' + t('\\pi') + ' and round only at the end, to the nearest tenth.'; }, parts: [
        { id: 'e1a', sub: 'a i', level: 'BEG', make: function (r, s) {
          var B = s.tv * s.th / 2;
          return exactPart('Right triangular prism: the area of one base' + rightTriPrism(s.th, s.tv, p1(s.h) + ' cm', { aLab: p1(s.th) + ' cm', bLab: p1(s.tv) + ' cm', cLab: p1(s.tc) + ' cm' }), B, 'cm²',
            [A(2 * B, 'half-missing', H.half), A(s.tv * s.tc / 2, 'hyp-leg', t(d1(s.tc) + '\\text{ cm}') + ' is the hypotenuse, not a leg. The base and height of a right triangle are its two legs.'), A(s.th * s.tc / 2, 'hyp-leg', 'Use the two legs (the sides at the right angle), not the hypotenuse.')],
            'Base: a right triangle with legs ' + t(d1(s.tv)) + ' and ' + t(d1(s.th)) + ' (' + t(d1(s.tc)) + ' is the hypotenuse).<br>' + t('A_{\\text{Base}}=\\tfrac12(' + d1(s.tv) + ')(' + d1(s.th) + ')' + boldEx(B, 'cm²')),
            ['The legs meet at the right angle: they are the base and height of the triangle.'], 'tri base area');
        } },
        { id: 'e1a2', sub: 'a ii', level: 'BEG', make: function (r, s) {
          var B = s.tv * s.th / 2, V = B * s.h;
          return exactPart('Right triangular prism: the volume' + rightTriPrism(s.th, s.tv, p1(s.h) + ' cm', { aLab: p1(s.th) + ' cm', bLab: p1(s.tv) + ' cm', cLab: p1(s.tc) + ' cm' }), V, 'cm³',
            [A(2 * V, 'half-missing', H.half), A(s.tv * s.tc / 2 * s.h, 'hyp-leg', 'The base area uses the two legs, not the hypotenuse.'), A(B, 'v-base-only', H.baseOnly)],
            t('A_{\\text{Base}}=\\tfrac12(' + d1(s.tv) + ')(' + d1(s.th) + ')=' + n(B) + '\\text{ cm}^{2}') + '<br>' + t('V=A_{\\text{Base}}\\times h=' + n(B) + '\\times ' + d1(s.h) + boldEx(V, 'cm³')),
            [t('V=A_{\\text{Base}}\\times h') + '.'], 'tri prism V');
        } },
        { id: 'e1b', sub: 'b i', level: 'BEG', make: function (r, s) {
          var B = (s.ta + s.tb) * s.tht / 2;
          return exactPart('Right trapezoidal prism: the area of one base' + trapPrism(s.ta, s.tb, s.tht, p1(s.h) + ' cm', { aLab: p1(s.ta) + ' cm', bLab: p1(s.tb) + ' cm', hLab: p1(s.tht) + ' cm' }), B, 'cm²',
            [A(2 * B, 'half-missing', 'Trapezoid area is ' + t('\\tfrac12(a+b)h') + ' — the ' + t('\\tfrac12') + ' is missing.'), A(s.ta * s.tht, 'area-rect', 'The top is shorter than the bottom: use ' + t('\\tfrac12(a+b)h') + '.'), A(s.ta * s.tb * s.tht / 2, 'mult-div', 'Add the parallel sides, don’t multiply them: ' + t('\\tfrac12(a+b)h') + '.')],
            t('A_{\\text{Base}}=\\tfrac12(a+b)h=\\tfrac12(' + d1(s.ta) + '+' + d1(s.tb) + ')(' + d1(s.tht) + ')' + boldEx(B, 'cm²')),
            ['Trapezoid: ' + t('A=\\tfrac12(a+b)h') + ' with the two parallel sides ' + t('a') + ' and ' + t('b') + '.'], 'trap base area');
        } },
        { id: 'e1b2', sub: 'b ii', level: 'BEG', make: function (r, s) {
          var B = (s.ta + s.tb) * s.tht / 2, V = B * s.h;
          return exactPart('Right trapezoidal prism: the volume' + trapPrism(s.ta, s.tb, s.tht, p1(s.h) + ' cm', { aLab: p1(s.ta) + ' cm', bLab: p1(s.tb) + ' cm', hLab: p1(s.tht) + ' cm' }), V, 'cm³',
            [A(2 * V, 'half-missing', 'Trapezoid area is ' + t('\\tfrac12(a+b)h') + '.'), A(B, 'v-base-only', H.baseOnly)],
            t('A_{\\text{Base}}=\\tfrac12(' + d1(s.ta) + '+' + d1(s.tb) + ')(' + d1(s.tht) + ')=' + n(B) + '\\text{ cm}^{2}') + '<br>' + t('V=' + n(B) + '\\times ' + d1(s.h) + boldEx(V, 'cm³')),
            [t('V=A_{\\text{Base}}\\times h') + ' — the trapezoid is the base.'], 'trap prism V');
        } },
        { id: 'e1c', sub: 'c i', level: 'BEG', make: function (r, s) {
          var B = PI * s.r * s.r;
          return nearPart('Right cylinder: the area of one base' + cylFig({ r: 'r = ' + p1(s.r) + ' cm', h: p1(s.h) + ' cm' }), B, 1, 'cm²',
            [A(2 * PI * s.r, 'circ-area', 'That’s the circumference ' + t('2\\pi r') + '. The area of a circle is ' + t('\\pi r^{2}') + '.'), A(PI * 4 * s.r * s.r, 'diam-radius', 'Use the radius ' + t(d1(s.r)) + ' itself.'), A(PI * s.r, 'circ-area', 'Square the radius: ' + t('A=\\pi r^{2}') + '.')],
            t('A_{\\text{Base}}=\\pi r^{2}=\\pi(' + d1(s.r) + ')^{2}=' + n(s.r * s.r) + '\\pi=' + B.toFixed(5) + '\\ldots' + bold(B, 1, 'cm²')),
            ['Area of a circle: ' + t('\\pi r^{2}') + '.'], 'circle base area');
        } },
        { id: 'e1c2', sub: 'c ii', level: 'EMG', make: function (r, s) {
          var B = PI * s.r * s.r, V = B * s.h;
          return nearPart('Right cylinder: the volume' + cylFig({ r: 'r = ' + p1(s.r) + ' cm', h: p1(s.h) + ' cm' }), V, 1, 'cm³',
            [A(rd(B, 1) * s.h, 'round-early', H.early), A(2 * PI * s.r * s.h, 'v-used-sa', H.cylV), A(B, 'v-base-only', H.baseOnly)],
            t('V=A_{\\text{Base}}\\times h=' + n(s.r * s.r) + '\\pi\\times ' + d1(s.h) + '=' + n(s.r * s.r * s.h) + '\\pi=' + V.toFixed(5) + '\\ldots' + bold(V, 1, 'cm³')) + (Math.abs(rd(rd(B, 1) * s.h, 1) - rd(V, 1)) > 1e-9 ? '<br>(Rounding the base to ' + t(fx(B, 1)) + ' first gives ' + t(fx(rd(B, 1) * s.h, 1)) + ' — wrong in the tenths place.)' : ''),
            ['Keep the base area unrounded (' + t(n(s.r * s.r) + '\\pi') + '), then multiply by the height.'], 'cylinder V');
        } },
        { id: 'e1d', sub: 'd', level: 'EMG', make: function (r, s) {
          return mc(r, '(d) The same formula ' + t('V=A_{\\text{Base}}\\times h') + ' worked for all three solids. Why does a cylinder obey the same rule as a prism, even though its base has no straight sides?', [
            { html: 'Every slice parallel to the base is the same circle, so the volume is that base area stacked through the height.', right: true },
            { html: 'Because ' + t('\\pi') + ' is about ' + t('3') + ', so a circle is close to a polygon.', why: 'Exact ' + t('\\pi') + ' is used — the rule doesn’t depend on approximating the circle. What stays the same from bottom to top?', code: 'pi-approx' },
            { html: 'Because the height is the same for all three solids.', why: 'The height being equal here is a coincidence of this question. The rule works for any height — think about the cross sections.', code: 'same-h' },
            { html: 'It doesn’t really — the cylinder needs ' + t('\\tfrac13A_{\\text{Base}}\\times h') + '.', why: 'The ' + t('\\tfrac13') + ' belongs to pyramids and cones, which narrow to a point. A cylinder keeps the same cross section all the way up.', code: 'third' }],
            'The only quantity that changed was the base area; the height stayed ' + t(d1(s.h) + '\\text{ cm}') + '. A cylinder’s cross section is the same circle from bottom to top, so stacking the area ' + t('\\pi r^{2}') + ' through the height gives ' + t('V=\\pi r^{2}h') + ' — exactly like stacking a triangle or trapezoid.', ['What does every horizontal slice of the cylinder look like?'], 'why cylinder uses A×h');
        } }] },
      { num: '2', shared: ep2Shared, stem: function (s) { return 'A storage shed is a prism whose base is the cross section shown — a rectangle with a triangular roof on top. The shed is ' + t(d1(s.len) + '\\text{ m}') + ' long.' + shedFig(s); }, parts: [
        { id: 'e2a', level: 'EMG', make: function (r, s) {
          var Ar = s.w * s.H, At = s.w * s.R / 2, X = Ar + At;
          return exactPart('(a) Find the area of the cross section, in ' + t('\\text{m}^{2}') + '.', X, 'm²',
            [A(Ar + 2 * At, 'half-missing', H.half), A(s.w * (s.H + s.R), 'area-rect', 'The roof is a triangle, not a rectangle: its area is ' + t('\\tfrac12bh') + '.'), A(Ar, 'area-part', 'Add the triangular roof.')],
            'Rectangle: ' + t(d1(s.w) + '\\times ' + d1(s.H) + '=' + n(Ar) + '\\text{ m}^{2}') + '. Triangle: ' + t('\\tfrac12(' + d1(s.w) + ')(' + d1(s.R) + ')=' + n(At) + '\\text{ m}^{2}') + '.<br>' + t('A_{\\text{Base}}=' + n(Ar) + '+' + n(At) + boldEx(X, 'm²')),
            ['Split the cross section into a rectangle and a triangle.'], 'shed cross section');
        } },
        { id: 'e2b', level: 'BEG', make: function (r, s) {
          var X = shedArea(s), V = X * s.len;
          return exactPart('(b) The cross section has area ' + t(n(X) + '\\text{ m}^{2}') + '. Find the volume of the shed, in ' + t('\\text{m}^{3}') + '.', V, 'm³',
            [A(X, 'v-base-only', H.baseOnly), A(s.w * (s.H + s.R) * s.len, 'area-rect', 'Use the cross-section area ' + t(n(X)) + '.')],
            t('V=A_{\\text{Base}}\\times h=' + n(X) + '\\times ' + d1(s.len) + boldEx(V, 'm³')) + '<br>The ' + t(d1(s.len) + '\\text{ m}') + ' length is the distance between the two end walls, so it plays the part of ' + t('h') + '.',
            [t('V=A_{\\text{Base}}\\times h') + ' — here ' + t('h') + ' is the length of the shed.'], 'shed V');
        } },
        { id: 'e2c', level: 'BEG', outcome: 'M2', make: function (r, s) {
          var V = cl(shedArea(s) * s.len), Lt = Math.round(V * 1000);
          return exactPart('(c) The shed’s volume is ' + t(n(V) + '\\text{ m}^{3}') + '. Express it in litres.', Lt, 'L',
            [A(V / 1000, 'conv-direction', SMALLER), A(V * 100, 'conv-factor', t('1\\text{ m}^{3}=1000\\text{ L}') + '.'), A(V, 'conv-missing', 'Convert: ' + t('1\\text{ m}^{3}=1000\\text{ L}') + '.')],
            t('1\\text{ m}^{3}=1000\\text{ L}') + ', so ' + t(n(V) + '\\times 1000' + boldEx(Lt, 'L')), [t('1\\text{ m}^{3}=1000\\text{ L}') + '.'], 'm³ → L');
        } }] },

      /* ================= EP Part B: nets ================= */
      { num: '3', section: 'Extra practice B — Surface area read off a net', shared: ep3Shared, stem: function (s) { return 'The net below folds into a right rectangular prism.' + boxNet(s.l, s.w, s.h); }, parts: [
        { id: 'e3a', sub: 'a i', level: 'BEG', make: function (r, s) {
          var lw = s.l * s.w, lh = s.l * s.h, wh = s.w * s.h, ar = { A: lw, B: lh, C: lh, D: lw, E: wh, F: wh };
          var specs = ['A', 'B', 'C', 'D', 'E', 'F'].map(function (f) {
            return { label: 'Face ' + f, x: ar[f], unit: 'cm²', alts: [A(2 * (s.l + s.w), 'net-face', 'That’s a perimeter. Area = length × width of the face.')].concat([lw, lh, wh].filter(function (v) { return v !== ar[f]; }).map(function (v) { return A(v, 'net-face', 'That’s the area of a different-sized face. Read the two edges of face ' + f + ' off the net.'); })) };
          });
          return fieldsPart('(a) Give the area of each of the six faces.', specs,
            'A and D: ' + t(d1(s.l) + '\\times ' + d1(s.w) + '=' + n(lw)) + '; B and C: ' + t(d1(s.l) + '\\times ' + d1(s.h) + '=' + n(lh)) + '; E and F: ' + t(d1(s.w) + '\\times ' + d1(s.h) + '=' + n(wh)) + ' (all in ' + t('\\text{cm}^{2}') + ').',
            ['Each face is a rectangle: find its two edge lengths on the net.', 'Faces that touch share an edge, so they share that length.'], 'net face areas');
        } },
        { id: 'e3a2', sub: 'a ii', level: 'LIM', make: function (r, s) {
          return mc(r, '(a) Which faces are congruent to each other?', [
            { html: 'A and D, B and C, E and F', right: true },
            { html: 'A and B, C and D, E and F', why: 'A is ' + t(d1(s.l) + '\\times ' + d1(s.w)) + ' but B is ' + t(d1(s.l) + '\\times ' + d1(s.h)) + ' — not the same.', code: 'ab' },
            { html: 'A and C, B and D, E and F', why: 'Compare the dimensions: C matches B, and D matches A.', code: 'ac' },
            { html: 'A and E, B and F, C and D', why: 'E is one of the small ' + t(d1(s.w) + '\\times ' + d1(s.h)) + ' end faces.', code: 'ae' }],
            'A rectangular prism always has its faces in three congruent pairs: A ≅ D (' + t(d1(s.l) + '\\times ' + d1(s.w)) + '), B ≅ C (' + t(d1(s.l) + '\\times ' + d1(s.h)) + '), E ≅ F (' + t(d1(s.w) + '\\times ' + d1(s.h)) + ').', ['Match the faces with the same two dimensions.'], 'congruent faces');
        } },
        { id: 'e3b', level: 'BEG', make: function (r, s) {
          var SA = 2 * (s.l * s.w + s.l * s.h + s.w * s.h);
          return exactPart('(b) Total the six areas to get the surface area of the prism.', SA, 'cm²',
            [A(SA / 2, 'sa-half', 'Six faces — each size appears twice.'), A(s.l * s.w * s.h, 'v-used-sa', 'That’s the volume. Add the six face areas.')],
            t('SA=2(' + n(s.l * s.w) + '+' + n(s.l * s.h) + '+' + n(s.w * s.h) + ')=2(' + n(SA / 2) + ')' + boldEx(SA, 'cm²')), ['Add all six faces: A + B + C + D + E + F.'], 'net SA');
        } },
        { id: 'e3c', sub: 'c i', level: 'BEG', make: function (r, s) {
          var V = s.l * s.w * s.h;
          return exactPart('(c) Find the volume of the prism.', V, 'cm³',
            [A(2 * (s.l * s.w + s.l * s.h + s.w * s.h), 'v-used-sa', 'That’s the surface area. Volume = base area × height.'), A(s.l * s.w, 'v-base-only', H.baseOnly)],
            t('V=A_{\\text{Base}}\\times h=(' + d1(s.l) + '\\times ' + d1(s.w) + ')\\times ' + d1(s.h) + '=' + n(s.l * s.w) + '\\times ' + d1(s.h) + boldEx(V, 'cm³')), ['The prism is ' + t(d1(s.l)) + ' by ' + t(d1(s.w)) + ' by ' + t(d1(s.h)) + '.'], 'net V');
        } },
        { id: 'e3c2', sub: 'c ii', level: 'EMG', make: function (r, s) {
          return mc(r, '(c) Why does the net give the surface area immediately, but not the volume without further thought?', [
            { html: 'The net shows every face flat, so surface area is just a sum of areas; volume is the space enclosed, which only exists once the net is folded and you know which edges meet.', right: true },
            { html: 'Volume needs ' + t('\\pi') + ', and nets never show ' + t('\\pi') + '.', why: 'This is a rectangular prism — no ' + t('\\pi') + ' anywhere. Think about what a net shows and what it doesn’t.', code: 'pi' },
            { html: 'The net is drawn smaller than the prism.', why: 'The scale doesn’t matter — the dimensions are labelled. What does volume measure that a flat net can’t show?', code: 'scale' },
            { html: 'Volume is the surface area divided by ' + t('6') + '.', why: 'Surface area (cm²) and volume (cm³) are different kinds of quantity; there is no such rule.', code: 'div6' }],
            'Surface area is a sum of the flat faces you can read straight off the net. Volume is the space inside, which doesn’t exist until the net is folded: you must first work out which measurement is the base and which is the height.', ['What does each one measure?'], 'net vs volume');
        } }] },
      { num: '4', shared: ep4Shared, stem: function (s) { return 'The net below folds into a right triangular prism whose triangular ends are right triangles (legs ' + t(d1(s.p)) + ' and ' + t(d1(s.q)) + ', hypotenuse ' + t(d1(s.c)) + ').' + triNet(s.p, s.q, s.c, s.L); }, parts: [
        { id: 'e4a', level: 'BEG', make: function (r, s) {
          var T = s.p * s.q / 2;
          return fieldsPart('(a) There are five faces: two triangles and three rectangles. Give the area of each kind.', [
            { label: 'One triangle', x: T, unit: 'cm²', alts: [A(2 * T, 'half-missing', H.half), A(s.p * s.c / 2, 'hyp-leg', 'Use the two legs, not the hypotenuse.')] },
            { label: 'Rectangle on the ' + p1(s.p) + ' cm side', x: s.p * s.L, unit: 'cm²' },
            { label: 'Rectangle on the ' + p1(s.q) + ' cm side', x: s.q * s.L, unit: 'cm²' },
            { label: 'Rectangle on the ' + p1(s.c) + ' cm side', x: s.c * s.L, unit: 'cm²' }],
            'Triangles: ' + t('\\tfrac12(' + d1(s.p) + ')(' + d1(s.q) + ')=' + n(T)) + ' each. Rectangles, all ' + t(d1(s.L)) + ' long: ' + t(n(s.p * s.L) + ',\\ ' + n(s.q * s.L) + ',\\ ' + n(s.c * s.L)) + ' (cm²).',
            ['Each rectangle is ' + t(d1(s.L) + '\\text{ cm}') + ' long and as wide as one side of the triangle.'], 'tri net faces');
        } },
        { id: 'e4b', level: 'BEG', make: function (r, s) {
          var T = s.p * s.q / 2, Lat = (s.p + s.q + s.c) * s.L, SA = 2 * T + Lat;
          return exactPart('(b) Find the surface area of the prism.', SA, 'cm²',
            [A(T + Lat, 'sa-one-base', 'There are <b>two</b> triangles.'), A(Lat, 'sa-lateral', 'Add the two triangular ends.'), A(4 * T + Lat, 'half-missing', H.half)],
            t('SA=2(' + n(T) + ')+' + n(s.p * s.L) + '+' + n(s.q * s.L) + '+' + n(s.c * s.L) + boldEx(SA, 'cm²')), ['Add all five faces.'], 'tri net SA');
        } },
        { id: 'e4c', sub: 'c i', level: 'EMG', make: function (r, s) {
          var P = s.p + s.q + s.c;
          return fieldsPart('(c) Find the perimeter of the triangle, then (perimeter) × ' + t(d1(s.L) + '\\text{ cm}') + '. Compare it with the total of the three rectangles.', [
            { label: 'Perimeter', x: P, unit: 'cm', alts: [A(s.p + s.q, 'per-missing', 'Include all three sides — the hypotenuse too.')] },
            { label: 'Perimeter × length', x: P * s.L, unit: 'cm²' }],
            'Perimeter ' + t('=' + d1(s.p) + '+' + d1(s.q) + '+' + d1(s.c) + '=' + n(P) + '\\text{ cm}') + '; ' + t(n(P) + '\\times ' + d1(s.L) + '=' + n(P * s.L) + '\\text{ cm}^{2}') + ', the same as ' + t(n(s.p * s.L) + '+' + n(s.q * s.L) + '+' + n(s.c * s.L)) + '.',
            ['Add the three sides of the triangle.'], 'lateral = P × L');
        } },
        { id: 'e4c2', sub: 'c ii', level: 'EMG', make: function (r, s) {
          return mc(r, '(c) Why does “lateral area = perimeter of the base × length” always work for a right prism?', [
            { html: 'Every side face is a rectangle with the same length, and its width is one side of the base — factoring out the length leaves the sum of the sides.', right: true },
            { html: 'Because the base is a right triangle.', why: 'It works for any right prism — rectangular, trapezoidal, L-shaped… What do all the side faces have in common?', code: 'right-tri' },
            { html: 'Because the perimeter and the area of a triangle are equal.', why: 'They aren’t (and they have different units). Look at the widths of the side rectangles.', code: 'equal' },
            { html: 'It only works when the prism is a cube.', why: 'Check this net: ' + t(n((s.p + s.q + s.c) * s.L)) + ' matched the three rectangles exactly.', code: 'cube' }],
            'Each side face is ' + t(d1(s.L)) + ' long and as wide as one side of the base, so the side areas are ' + t(d1(s.L) + '\\times\\text{side}_1') + ', ' + t(d1(s.L) + '\\times\\text{side}_2') + ', ' + t(d1(s.L) + '\\times\\text{side}_3') + '. Factor out the length: lateral area = (perimeter) × length.', ['What do the side rectangles have in common?'], 'why P × h');
        } }] },
      { num: '5', shared: ep5Shared, stem: function (s) { return 'The net of a right cylinder is two circles and one rectangle. The cylinder has radius ' + t(d1(s.r) + '\\text{ cm}') + ' and height ' + t(d1(s.h) + '\\text{ cm}') + '.' + cylNet(s.r, s.h); }, parts: [
        { id: 'e5a', sub: 'a i', level: 'LIM', make: function (r, s) {
          return mc(r, '(a) The rectangle’s <b>length</b> is the blank in the diagram. Which measurement of the cylinder does it equal?', [
            { html: 'The circumference of the circular base', right: true },
            { html: 'The diameter of the base', why: 'Unrolling the curved side lays the whole rim out flat — the whole way around the circle.', code: 'diam' },
            { html: 'The height of the cylinder', why: 'The height is the rectangle’s <b>width</b> (' + t(d1(s.h) + '\\text{ cm}') + ').', code: 'height' },
            { html: 'The area of the base', why: 'A length can’t equal an area. The rectangle wraps once around the rim.', code: 'area' }],
            'Unrolling the curved surface lays the rim out in a straight line without stretching it, so the rectangle’s length is the circumference, ' + t('2\\pi r') + '.', ['Picture peeling the label off a can.'], 'net length = circumference');
        } },
        { id: 'e5a2', sub: 'a ii', level: 'BEG', make: function (r, s) {
          var C = 2 * PI * s.r;
          return nearPart('(a) Compute the rectangle’s length (the circumference) to the nearest hundredth of a centimetre.', C, 2, 'cm',
            [A(PI * s.r, 'circ-area', 'Circumference is ' + t('2\\pi r') + ' (or ' + t('\\pi d') + ').'), A(PI * s.r * s.r, 'circ-area', 'That’s the area of the circle. Circumference is ' + t('2\\pi r') + '.')],
            t('C=2\\pi r=2\\pi(' + d1(s.r) + ')=' + n(2 * s.r) + '\\pi=' + C.toFixed(5) + '\\ldots' + bold(C, 2, 'cm')), [t('C=2\\pi r') + '.'], 'circumference');
        } },
        { id: 'e5b', level: 'EMG', make: function (r, s) {
          var R = 2 * PI * s.r * s.h, Cc = 2 * PI * s.r * s.r, SA = R + Cc;
          return fieldsPart('(b) Find the area of the rectangle and the combined area of the two circles, each to the nearest tenth. Add them to get the surface area.', [
            { label: 'Rectangle', x: R, dp: 1, unit: 'cm²', alts: [A(PI * s.r * s.h, 'half-lateral', 'The rectangle is circumference × height ' + t('=2\\pi rh') + '.')] },
            { label: 'Two circles', x: Cc, dp: 1, unit: 'cm²', alts: [A(PI * s.r * s.r, 'sa-one-base', 'That’s one circle — double it.'), A(4 * PI * s.r, 'circ-area', 'Area of a circle is ' + t('\\pi r^{2}') + '.')] },
            { label: 'Surface area', x: SA, dp: 1, unit: 'cm²', alts: [A(R + PI * s.r * s.r, 'sa-one-base', H.oneBase), A(rd(R, 1) + rd(Cc, 1), 'round-early', H.early)] }],
            'Rectangle: ' + t('2\\pi r\\times h=' + n(2 * s.r) + '\\pi\\times ' + d1(s.h) + '=' + n(2 * s.r * s.h) + '\\pi' + bold(R, 1)) + '.<br>Two circles: ' + t('2\\pi r^{2}=' + n(2 * s.r * s.r) + '\\pi' + bold(Cc, 1)) + '.<br>' + t('SA=' + n(2 * s.r * s.h + 2 * s.r * s.r) + '\\pi=' + SA.toFixed(5) + '\\ldots' + bold(SA, 1, 'cm²')),
            ['Rectangle: length (circumference) × width (height).', 'Carry full precision into the total.'], 'cylinder net SA');
        } },
        { id: 'e5c', sub: 'c i', level: 'BEG', make: function (r, s) {
          var V = PI * s.r * s.r * s.h;
          return nearPart('(c) Find the volume of the cylinder to the nearest tenth.', V, 1, 'cm³',
            [A(2 * PI * s.r * s.h, 'v-used-sa', H.cylV), A(2 * PI * s.r * s.r + 2 * PI * s.r * s.h, 'v-used-sa', 'That’s the surface area. ' + t('V=\\pi r^{2}h') + '.')],
            t('V=\\pi r^{2}h=\\pi(' + d1(s.r) + ')^{2}(' + d1(s.h) + ')=' + n(s.r * s.r * s.h) + '\\pi=' + V.toFixed(5) + '\\ldots' + bold(V, 1, 'cm³')), [t('V=\\pi r^{2}h') + '.'], 'cylinder V');
        } },
        { id: 'e5c2', sub: 'c ii', level: 'LIM', make: function (r, s) {
          return mc(r, '(c) Which number in this question is used for the volume but plays no part in the area of the two circles?', [
            { html: 'The height, ' + t(d1(s.h) + '\\text{ cm}'), right: true },
            { html: 'The radius, ' + t(d1(s.r) + '\\text{ cm}'), why: 'The circles’ area ' + t('2\\pi r^{2}') + ' uses the radius.', code: 'r' },
            { html: t('\\pi'), why: t('\\pi') + ' is in both formulas.', code: 'pi' },
            { html: 'None — both use the same numbers.', why: 'Look at ' + t('2\\pi r^{2}') + ': which measurement is missing?', code: 'none' }],
            'The circles depend on ' + t('r') + ' alone (' + t('2\\pi r^{2}') + '). The height enters only through the rectangle and the volume.', ['Write the two formulas side by side.'], 'height not in circles');
        } }] },
      { num: '6', shared: ep6Shared, stem: function (s) { return 'A flat rectangular sheet of tin measures ' + t(d1(s.a) + '\\text{ cm}') + ' by ' + t(d1(s.b) + '\\text{ cm}') + '. It is rolled into an open tube (no ends) so that two opposite edges meet exactly, with no overlap.' + sheetFig(s.a, s.b); }, parts: [
        { id: 'e6a', level: 'PRG', make: function (r, s) {
          var R = s.b / (2 * PI), V = PI * R * R * s.a, Vo = s.a * s.a * s.b / (4 * PI);
          return fieldsPart('(a) The ' + t(d1(s.b) + '\\text{ cm}') + ' side becomes the circumference (the ' + t(d1(s.a) + '\\text{ cm}') + ' edges are brought together). Find the radius to the nearest hundredth and the volume to the nearest tenth.', [
            { label: 'Radius', x: R, dp: 2, unit: 'cm', alts: [A(s.b / PI, 'gave-diameter', 'That’s the diameter: ' + t('C=\\pi d') + ', but ' + t('r=C\\div 2\\pi') + '.'), A(s.a / (2 * PI), 'swap-roll', 'The circumference is the ' + t(d1(s.b)) + ' side this time.'), A(Math.sqrt(s.b / PI), 'circ-area', 'Circumference is ' + t('2\\pi r') + ', not ' + t('\\pi r^{2}') + '.')] },
            { label: 'Volume', x: V, dp: 1, unit: 'cm³', alts: [A(PI * rd(R, 2) * rd(R, 2) * s.a, 'round-early', H.early), A(Vo, 'swap-roll', 'Here the tube’s height is ' + t(d1(s.a)) + ' and its circumference is ' + t(d1(s.b)) + '.')] }],
            t('C=' + d1(s.b)) + ', ' + t('h=' + d1(s.a)) + '.<br>' + t('r=\\dfrac{' + d1(s.b) + '}{2\\pi}=' + R.toFixed(6) + '\\ldots' + bold(R, 2, 'cm')) + '<br>' + t('V=\\pi r^{2}h=\\pi(' + R.toFixed(6) + '\\ldots)^{2}(' + d1(s.a) + ')=' + V.toFixed(5) + '\\ldots' + bold(V, 1, 'cm³')),
            ['The side that wraps around is the circumference: ' + t('2\\pi r=C') + '.', 'The other side is the height of the tube.'], 'tube r, V (short side around)');
        } },
        { id: 'e6b', level: 'PRG', make: function (r, s) {
          var R = s.a / (2 * PI), V = PI * R * R * s.b, Vo = s.b * s.b * s.a / (4 * PI);
          return fieldsPart('(b) Now roll the same sheet the other way, so the ' + t(d1(s.a) + '\\text{ cm}') + ' side becomes the circumference. Find the new radius (nearest hundredth) and volume (nearest tenth).', [
            { label: 'Radius', x: R, dp: 2, unit: 'cm', alts: [A(s.a / PI, 'gave-diameter', 'That’s the diameter. ' + t('r=C\\div 2\\pi') + '.'), A(s.b / (2 * PI), 'swap-roll', 'The circumference is now the ' + t(d1(s.a)) + ' side.')] },
            { label: 'Volume', x: V, dp: 1, unit: 'cm³', alts: [A(PI * rd(R, 2) * rd(R, 2) * s.b, 'round-early', H.early), A(Vo, 'swap-roll', 'Now the height is ' + t(d1(s.b)) + '.')] }],
            t('C=' + d1(s.a)) + ', ' + t('h=' + d1(s.b)) + '.<br>' + t('r=\\dfrac{' + d1(s.a) + '}{2\\pi}=' + R.toFixed(6) + '\\ldots' + bold(R, 2, 'cm')) + '<br>' + t('V=\\pi r^{2}h=' + V.toFixed(5) + '\\ldots' + bold(V, 1, 'cm³')),
            ['The ' + t(d1(s.a)) + ' side wraps around now.'], 'tube r, V (long side around)');
        } },
        { id: 'e6c', level: 'EMG', make: function (r, s) {
          var V1 = s.a * s.a * s.b / (4 * PI), V2 = s.b * s.b * s.a / (4 * PI);
          return mc(r, '(c) Both tubes use the same tin, so their curved surfaces are equal. Which way of rolling gives the larger volume, and why?', [
            { html: 'The ' + t(d1(s.a)) + ' side as the circumference: ' + t('V=\\pi r^{2}h') + ' grows with the <b>square</b> of the radius but only the first power of the height.', right: true },
            { html: 'The ' + t(d1(s.b)) + ' side as the circumference: the taller tube holds more.', why: 'Check your volumes: ' + t(fx(V1, 1)) + ' vs ' + t(fx(V2, 1)) + '. Height counts once; the radius counts twice.', code: 'taller' },
            { html: 'Neither — the same tin gives the same volume.', why: 'Equal surface area doesn’t mean equal volume: compare ' + t(fx(V1, 1)) + ' and ' + t(fx(V2, 1)) + '.', code: 'same' },
            { html: 'The ' + t(d1(s.a)) + ' side as the circumference, because that tube has more surface area.', why: 'Right tube, wrong reason — both curved surfaces are exactly ' + t(n(s.a * s.b) + '\\text{ cm}^{2}') + '.', code: 'more-sa' }],
            'Both curved surfaces are ' + t(d1(s.a) + '\\times ' + d1(s.b) + '=' + n(s.a * s.b) + '\\text{ cm}^{2}') + '. But ' + t('V=\\pi r^{2}h') + ' depends on ' + t('r^{2}') + ', so making the tube fatter gains more than making it taller: ' + t(fx(V1, 1) + '\\text{ cm}^{3}') + ' against ' + t(fx(V2, 1) + '\\text{ cm}^{3}') + '.', ['Compare the two volumes, then look at the powers in ' + t('V=\\pi r^{2}h') + '.'], 'which roll holds more');
        } }] },

      /* ================= EP Part C ================= */
      { num: '7', section: 'Extra practice C — Running the formulas backwards', stem: 'Solve each of the following for the dimension named. Round only at the end.', parts: [
        { id: 'e7a', level: 'BEG', make: function (r) {
          var B = r.int(40, 90), h = r.int(15, 40), V = B * h;
          return exactPart('(a) A right prism has volume ' + t(F(V) + '\\text{ cm}^{3}') + ' and a base of area ' + t(d1(B) + '\\text{ cm}^{2}') + '. Find its height.', h, 'cm',
            [A(V * B, 'mult-div', 'Solve ' + t(F(V) + '=' + B + 'h') + ' by dividing.')],
            t(F(V) + '=' + d1(B) + '\\times h') + ', so ' + t('h=\\dfrac{' + F(V) + '}{' + d1(B) + '}=\\mathbf{' + d1(h) + '}\\text{ cm}'), [t('V=A_{\\text{Base}}\\times h') + '.'], 'prism height');
        } },
        { id: 'e7b', level: 'PRG', make: function (r) {
          var V = r.int(12, 30) * 100, h = r.int(10, 20), R = Math.sqrt(V / (PI * h));
          return nearPart('(b) A right cylinder has volume ' + t(F(V) + '\\text{ cm}^{3}') + ' and height ' + t(d1(h) + '\\text{ cm}') + '. Find its radius, to the nearest tenth of a centimetre.', R, 1, 'cm',
            [A(V / (PI * h), 'no-sqrt', 'That’s ' + t('r^{2}') + ' — take the square root.'), A(Math.sqrt(V / h), 'no-pi', 'Divide by ' + t('\\pi') + ' as well as by ' + t('h') + '.'), A(V / (2 * PI * h), 'no-sqrt', 'Undo ' + t('r^{2}') + ' with a square root, not by halving.')],
            t(F(V) + '=\\pi r^{2}(' + d1(h) + ')') + '<br>' + t('r^{2}=\\dfrac{' + F(V) + '}{' + h + '\\pi}=' + (V / PI / h).toFixed(5) + '\\ldots') + '<br>' + t('r=\\sqrt{' + (V / PI / h).toFixed(5) + '\\ldots}=' + R.toFixed(5) + '\\ldots' + bold(R, 1, 'cm')),
            ['Substitute into ' + t('V=\\pi r^{2}h') + ' and isolate ' + t('r^{2}') + '.', 'The unknown is squared — finish with a square root.'], 'cylinder radius from V');
        } },
        { id: 'e7c', level: 'EMG', make: function (r) {
          var s = r.int(4, 15), SA = 6 * s * s, V = s * s * s;
          return fieldsPart('(c) A cube has surface area ' + t(F(SA) + '\\text{ cm}^{2}') + '. Find the length of one edge, then the volume of the cube.', [
            { label: 'Edge', x: s, unit: 'cm', alts: [A(Math.sqrt(SA), 'sa-half', 'A cube has <b>six</b> faces: divide by ' + t('6') + ' first.'), A(SA / 6, 'no-sqrt', 'That’s ' + t('s^{2}') + ' — take the square root.'), A(Math.cbrt(SA), 'root-index', t('SA=6s^{2}') + ': divide by 6, then square root.')] },
            { label: 'Volume', x: V, unit: 'cm³', alts: [A(SA, 'v-used-sa', 'Volume is ' + t('s^{3}') + '.')] }],
            t('SA=6s^{2}') + ': ' + t(F(SA) + '=6s^{2}\\Rightarrow s^{2}=' + s * s + '\\Rightarrow s=\\mathbf{' + s + '}\\text{ cm}') + '.<br>' + t('V=s^{3}=' + s + '^{3}=\\mathbf{' + F(V) + '}\\text{ cm}^{3}') + ' — the unit changes from cm² to cm³.',
            ['A cube has six congruent square faces: ' + t('SA=6s^{2}') + '.'], 'cube from SA');
        } },
        { id: 'e7d', level: 'EMG', make: function (r) {
          return mc(r, '(d) Three unknowns: (a) the height of a right prism, given its volume and base area; (b) the radius of a cylinder, given its volume and height; (c) the edge of a cube, given its surface area. Exactly one can be found by a single division. Which one, and why?', [
            { html: '(a) — the height appears to the first power, multiplied by a known number.', right: true },
            { html: '(b) — ' + t('\\pi') + ' is just a number, so divide by ' + t('\\pi h') + '.', why: 'Dividing by ' + t('\\pi h') + ' only isolates ' + t('r^{2}') + ' — a square root is still needed.', code: 'b' },
            { html: '(c) — divide the surface area by ' + t('6') + '.', why: 'That gives ' + t('s^{2}') + ', not ' + t('s') + '. A square root is still needed.', code: 'c' },
            { html: 'All three — every formula can be undone by dividing.', why: 'When the unknown is raised to a power (' + t('r^{2}') + ', ' + t('s^{2}') + '), you need the matching root.', code: 'all' }],
            'Only (a): ' + t('h') + ' appears to the first power. In (b) and (c) the unknown sits inside ' + t('r^{2}') + ' or ' + t('s^{2}') + ', so after dividing you still need a square root.', ['Where is the unknown in each formula — is it squared?'], 'single division');
        } }] },
      { num: '8', shared: ep8Shared, stem: function (s) { return 'A water trough is a right prism whose base is a trapezoid. The trough is ' + t(s.len + '\\text{ cm}') + ' long and ' + t(s.dd + '\\text{ cm}') + ' deep, the bottom of the trapezoid is ' + t(s.a + '\\text{ cm}') + ' across, and the trough holds exactly ' + t(n(s.cap) + '\\text{ L}') + ' when filled to the brim.' + trapPrism(s.b, s.a, s.dd, s.len + ' cm', { invert: true, aLab: '?', bLab: s.a + ' cm', hLab: s.dd + ' cm' }); }, parts: [
        { id: 'e8a', level: 'EMG', make: function (r, s) {
          var V = cl(s.cap * 1000);
          return fieldsPart('(a) Convert the capacity to ' + t('\\text{cm}^{3}') + ', then find the area of the trapezoidal base.', [
            { label: 'Capacity', x: V, unit: 'cm³', alts: [A(s.cap * 100, 'conv-factor', t('1\\text{ L}=1000\\text{ mL}=1000\\text{ cm}^{3}') + '.'), A(s.cap / 1000, 'conv-direction', SMALLER)] },
            { label: 'Base area', x: s.Ab, unit: 'cm²', alts: [A(V / s.dd, 'wrong-height', 'The prism’s “height” is its <b>length</b>, ' + t(s.len + '\\text{ cm}') + ' — the distance between the two trapezoid ends.')] }],
            t(n(s.cap) + '\\text{ L}=' + n(s.cap) + '\\times 1000=' + F(V) + '\\text{ cm}^{3}') + '.<br>' + t(F(V) + '=A_{\\text{Base}}\\times ' + s.len + '\\Rightarrow A_{\\text{Base}}=' + F(s.Ab) + '\\text{ cm}^{2}'),
            [t('1\\text{ L}=1000\\text{ cm}^{3}') + '. Then ' + t('V=A_{\\text{Base}}\\times h') + ' with ' + t('h') + ' = the length of the trough.'], 'trough base area');
        } },
        { id: 'e8b', level: 'PRG', make: function (r, s) {
          return exactPart('(b) The trapezoidal base has area ' + t(F(s.Ab) + '\\text{ cm}^{2}') + '. Use ' + t('A=\\tfrac12(a+b)h') + ' to find the width across the top of the trough.', s.b, 'cm',
            [A(s.Ab / s.dd - s.a, 'half-missing', 'Don’t forget the ' + t('\\tfrac12') + ': multiply the area by 2 first.'), A(2 * s.Ab / s.len - s.a, 'wrong-height', 'The trapezoid’s height is the depth ' + t(s.dd + '\\text{ cm}') + ', not the length of the trough.'), A(2 * s.Ab / s.dd, 'incomplete', 'That’s ' + t('a+b') + ' — subtract the bottom width.')],
            'Here ' + t('a=' + s.a) + ' (bottom), ' + t('h=' + s.dd) + ' (depth, not the length).<br>' + t(F(s.Ab) + '=\\tfrac12(' + s.a + '+b)(' + s.dd + ')') + '<br>' + t(F(2 * s.Ab) + '=(' + s.a + '+b)(' + s.dd + ')\\Rightarrow ' + (2 * s.Ab / s.dd) + '=' + s.a + '+b\\Rightarrow b=\\mathbf{' + s.b + '}\\text{ cm}'),
            ['Substitute ' + t('A') + ', ' + t('a') + ' and ' + t('h') + ', then solve for ' + t('b') + '.', 'Multiply by 2, divide by the depth, then subtract.'], 'trough top width');
        } }] },
      { num: '9', shared: ep9Shared, stem: function (s) { return 'The <b>curved</b> surface of a cylindrical hot-water tank — the side only, with neither circular end — has area ' + t(F(s.cs.toFixed(1)) + '\\text{ cm}^{2}') + '. The tank is ' + t(d1(s.h) + '\\text{ cm}') + ' tall.'; }, parts: [
        { id: 'e9a', level: 'EMG', make: function (r, s) {
          var R = s.cs / (2 * PI * s.h);
          return nearPart('(a) Solve the curved-surface formula for the radius, to the nearest tenth of a centimetre.', R, 1, 'cm',
            [A(s.cs / (PI * s.h), 'gave-diameter', 'That’s the diameter: the curved surface is ' + t('2\\pi rh') + ', so divide by ' + t('2\\pi h') + '.'), A(Math.sqrt(s.cs / (PI * s.h)), 'circ-area', 'The curved surface is ' + t('2\\pi rh') + ' — ' + t('r') + ' is not squared.'), A((s.cs - 0) / (2 * PI * s.h) / 2, 'half-lateral', 'Divide by ' + t('2\\pi h') + ' once.')],
            'Curved surface only: ' + t('SA_{\\text{curved}}=2\\pi rh') + '.<br>' + t(F(s.cs.toFixed(1)) + '=2\\pi r(' + d1(s.h) + ')\\Rightarrow r=\\dfrac{' + F(s.cs.toFixed(1)) + '}{' + 2 * s.h + '\\pi}=' + R.toFixed(6) + '\\ldots' + bold(R, 1, 'cm')),
            ['Curved surface = circumference × height ' + t('=2\\pi rh') + '.'], 'radius from curved SA');
        } },
        { id: 'e9b', level: 'EMG', make: function (r, s) {
          var R = s.r, SA = 2 * PI * R * R + 2 * PI * R * s.h;
          return nearPart('(b) The radius is ' + t(d1(R) + '\\text{ cm}') + '. Find the <b>total</b> surface area of the closed tank, to the nearest tenth.', SA, 1, 'cm²',
            [A(PI * R * R + 2 * PI * R * s.h, 'sa-one-base', H.oneBase), A(2 * PI * R * s.h, 'sa-lateral', H.lateral), A(2 * PI * R * R + s.cs, 'round-early', 'Close — use the radius to compute ' + t('2\\pi rh') + ' too.')],
            t('SA=2\\pi r^{2}+2\\pi rh=2\\pi(' + d1(R) + ')^{2}+2\\pi(' + d1(R) + ')(' + d1(s.h) + ')=' + n(2 * R * R) + '\\pi+' + n(2 * R * s.h) + '\\pi=' + n(2 * R * R + 2 * R * s.h) + '\\pi' + bold(SA, 1, 'cm²')),
            ['Now add the two circular ends to the curved surface.'], 'tank total SA');
        } },
        { id: 'e9c', level: 'EMG', make: function (r, s) {
          var R = s.r, V = PI * R * R * s.h;
          return fieldsPart('(c) The radius is ' + t(d1(R) + '\\text{ cm}') + '. Find the volume of the tank to the nearest tenth, and its capacity in litres to the nearest tenth.', [
            { label: 'Volume', x: V, dp: 1, unit: 'cm³', alts: [A(2 * PI * R * s.h, 'v-used-sa', H.cylV)] },
            { label: 'Capacity', x: V / 1000, dp: 1, unit: 'L', alts: [A(V / 100, 'conv-factor', t('1\\text{ cm}^{3}=1\\text{ mL}') + ' and ' + t('1000\\text{ mL}=1\\text{ L}') + '.'), A(V, 'conv-missing', 'Convert to litres: divide by ' + t('1000') + '.')] }],
            t('V=\\pi(' + d1(R) + ')^{2}(' + d1(s.h) + ')=' + n(R * R * s.h) + '\\pi=' + V.toFixed(5) + '\\ldots' + bold(V, 1, 'cm³')) + '<br>' + t('1\\text{ cm}^{3}=1\\text{ mL}') + ': ' + t((V / 1000).toFixed(5) + '\\ldots\\text{ L}' + bold(V / 1000, 1, 'L')),
            [t('V=\\pi r^{2}h') + ', then ' + t('1000\\text{ cm}^{3}=1\\text{ L}') + '.'], 'tank V and L');
        } }] },

      /* ================= EP Part D: composite ================= */
      { num: '10', section: 'Extra practice D — Composite solids: surfaces added and removed', shared: ep10Shared, stem: function (s) { return 'A square steel plate measures ' + t(d1(s.s) + '\\text{ cm}') + ' by ' + t(d1(s.s) + '\\text{ cm}') + ' and is ' + t(d1(s.T) + '\\text{ cm}') + ' thick. A circular hole of diameter ' + t(d1(s.d) + '\\text{ cm}') + ' is drilled straight through the ' + t(d1(s.T) + '\\text{ cm}') + ' thickness.' + plateFig(s); }, parts: [
        { id: 'e10a', level: 'PRG', make: function (r, s) {
          var R = s.d / 2, V = s.s * s.s * s.T - PI * R * R * s.T;
          return nearPart('(a) Find the volume of the plate that remains, to the nearest tenth.', V, 1, 'cm³',
            [A(s.s * s.s * s.T - PI * s.d * s.d * s.T, 'diam-radius', H.diam), A(s.s * s.s * s.T, 'hole-ignored', 'Subtract the cylinder drilled out.'), A(s.s * s.s * s.T - PI * R * R, 'v-base-only', 'The hole is a cylinder: ' + t('\\pi r^{2}h') + ' with ' + t('h=' + d1(s.T)) + '.')],
            'Solid plate minus the drilled cylinder (' + t('r=' + n(R)) + ', ' + t('h=' + d1(s.T)) + '):<br>' + t('V=' + d1(s.s) + '(' + d1(s.s) + ')(' + d1(s.T) + ')-\\pi(' + n(R) + ')^{2}(' + d1(s.T) + ')=' + n(s.s * s.s * s.T) + '-' + n(R * R * s.T) + '\\pi' + bold(V, 1, 'cm³')),
            ['Volume of the solid plate − volume of the hole.', 'The hole’s radius is half its diameter.'], 'plate V');
        } },
        { id: 'e10b', level: 'ADV', make: function (r, s) {
          var R = s.d / 2, base = 2 * s.s * s.s + 4 * s.s * s.T, rem = 2 * PI * R * R, add = 2 * PI * R * s.T, SA = base - rem + add;
          return nearPart('(b) Find the surface area of the plate that remains, to the nearest tenth. (Work in three lines: the six faces of the solid plate, the area <b>removed</b>, the area <b>added</b>.)', SA, 1, 'cm²',
            [A(base - rem, 'hole-wall', 'Drilling exposes a new surface: the inside wall of the hole, ' + t('2\\pi rh') + '. Add it.'), A(base + add, 'hole-circles', 'The two circles punched out of the faces are gone — subtract ' + t('2\\pi r^{2}') + '.'), A(base, 'hole-ignored', 'Subtract the two circles drilled out, and add the inside wall of the hole.'),
              A(base - 2 * PI * s.d * s.d + 2 * PI * s.d * s.T, 'diam-radius', H.diam), A(base - PI * R * R + add, 'sa-one-base', 'The hole goes all the way through: a circle is removed from <b>both</b> big faces.')],
            'Six faces: ' + t('2(' + d1(s.s) + '\\times ' + d1(s.s) + ')+4(' + d1(s.s) + '\\times ' + d1(s.T) + ')=' + n(base) + '\\text{ cm}^{2}') + '.<br>Removed — two circles: ' + t('2\\pi(' + n(R) + ')^{2}=' + n(2 * R * R) + '\\pi') + '.<br>Added — the inside wall: ' + t('2\\pi(' + n(R) + ')(' + d1(s.T) + ')=' + n(2 * R * s.T) + '\\pi') + '.<br>' +
            t('SA=' + n(base) + '-' + n(2 * R * R) + '\\pi+' + n(2 * R * s.T) + '\\pi=' + n(base) + '+' + n(2 * R * s.T - 2 * R * R) + '\\pi' + bold(SA, 1, 'cm²')),
            ['Two things change: the circles cut out of the top and bottom are removed, and the wall inside the hole is new surface.'], 'plate SA');
        } },
        { id: 'e10c', level: 'PRG', make: function (r, s) {
          var R = s.d / 2, dlt = 2 * PI * R * s.T - 2 * PI * R * R, f = function (x) { return t(fx(x, 1) + '\\text{ cm}^{2}'); };
          return mc(r, '(c) A classmate says “drilling a hole takes metal away, so the surface area must go down.” What actually happened to the surface area?', [
            { html: 'It went <b>up</b> by ' + f(dlt), right: true },
            { html: 'It went <b>down</b> by ' + f(dlt), why: 'Compare what was removed (two circles, ' + f(2 * PI * R * R) + ') with what was added (the wall, ' + f(2 * PI * R * s.T) + ').', code: 'down' },
            { html: 'It went <b>down</b> by ' + f(2 * PI * R * R), why: 'Removing the circles is only half the story — the inside wall of the hole is new surface.', code: 'circles' },
            { html: 'It went <b>up</b> by ' + f(2 * PI * R * s.T), why: 'The wall was added, but the two circles were also removed. Net change = added − removed.', code: 'wall' }],
            'Removed: ' + t('2\\pi r^{2}=' + n(2 * R * R) + '\\pi') + '. Added: ' + t('2\\pi rh=' + n(2 * R * s.T) + '\\pi') + '. Net: ' + t('+' + n(2 * R * s.T - 2 * R * R) + '\\pi\\approx ' + fx(dlt, 1) + '\\text{ cm}^{2}') + '. Cutting creates new surface wherever the cut goes; a deep, narrow hole creates more than it destroys.', ['Change = area added − area removed.'], 'hole raises SA');
        } }] },
      { num: '11', shared: ep11Shared, stem: function (s) { return 'The solid below is a right prism whose base is an L-shape. All dimensions are in centimetres.' + lFig(s); }, parts: [
        { id: 'e11a', level: 'EMG', make: function (r, s) {
          var X = lArea(s);
          return exactPart('(a) Find the area of the L-shaped base. (Try it two ways: split it into two rectangles, or subtract the notch from a large rectangle.)', X, 'cm²',
            [A(s.W * s.H, 'area-rect', 'That’s the whole ' + t(d1(s.W) + '\\times ' + d1(s.H)) + ' rectangle — subtract the ' + t(d1(s.W - s.wv) + '\\times ' + d1(s.H - s.tb)) + ' notch.'), A(s.W * s.tb + s.wv * s.H, 'area-overlap', 'Those two rectangles overlap in the corner — count the ' + t(d1(s.wv) + '\\times ' + d1(s.tb)) + ' square once.')],
            '<b>Splitting:</b> ' + t(d1(s.W) + '\\times ' + d1(s.tb) + '+' + d1(s.wv) + '\\times ' + d1(s.H - s.tb) + '=' + n(s.W * s.tb) + '+' + n(s.wv * (s.H - s.tb)) + '=' + n(X)) + '.<br><b>Subtracting:</b> ' + t(d1(s.W) + '\\times ' + d1(s.H) + '-' + d1(s.W - s.wv) + '\\times ' + d1(s.H - s.tb) + '=' + n(s.W * s.H) + '-' + n((s.W - s.wv) * (s.H - s.tb)) + '=' + n(X)) + '.<br>' + t('A_{\\text{Base}}' + boldEx(X, 'cm²')),
            ['Split the L into two rectangles that don’t overlap.'], 'L area');
        } },
        { id: 'e11b', level: 'EMG', make: function (r, s) {
          var X = lArea(s), V = X * s.D;
          return exactPart('(b) The L-shaped base has area ' + t(n(X) + '\\text{ cm}^{2}') + '. Find the volume of the solid.', V, 'cm³',
            [A(s.W * s.H * s.D, 'area-rect', 'Use the L-shaped area, not the full rectangle.'), A(X, 'v-base-only', H.baseOnly)],
            t('V=A_{\\text{Base}}\\times h=' + n(X) + '\\times ' + d1(s.D) + boldEx(V, 'cm³')) + '. The ' + t(d1(s.D)) + ' is the distance between the two L-shaped faces.', [t('V=A_{\\text{Base}}\\times h') + ' — the L-shape is the base.'], 'L prism V');
        } },
        { id: 'e11c', level: 'PRG', make: function (r, s) {
          var X = lArea(s), P = 2 * (s.W + s.H), Lat = P * s.D, SA = 2 * X + Lat;
          return fieldsPart('(c) Find the perimeter of the L-shaped base, then the total area of the rectangular side faces, then the surface area of the whole solid. (The L has area ' + t(n(X) + '\\text{ cm}^{2}') + '.)', [
            { label: 'Perimeter', x: P, unit: 'cm', alts: [A(s.W + s.H + s.wv + s.tb, 'per-missing', 'Walk all the way round the L — there are six edges.')] },
            { label: 'Side faces', x: Lat, unit: 'cm²' },
            { label: 'Surface area', x: SA, unit: 'cm²', alts: [A(X + Lat, 'sa-one-base', 'There are <b>two</b> L-shaped ends.'), A(Lat, 'sa-lateral', 'Add the two L-shaped ends.'), A(2 * s.W * s.H + Lat, 'area-rect', 'The ends are L-shaped: use ' + t(n(X)) + ', not the full rectangle.')] }],
            'Perimeter: ' + t(d1(s.W) + '+' + d1(s.tb) + '+' + d1(s.W - s.wv) + '+' + d1(s.H - s.tb) + '+' + d1(s.wv) + '+' + d1(s.H) + '=' + n(P) + '\\text{ cm}') + '.<br>Side faces: ' + t(n(P) + '\\times ' + d1(s.D) + '=' + n(Lat) + '\\text{ cm}^{2}') + '.<br>' + t('SA=2(' + n(X) + ')+' + n(Lat) + boldEx(SA, 'cm²')),
            ['Lateral area = perimeter × depth. Then add the two L-shaped ends.'], 'L prism SA');
        } },
        { id: 'e11d', level: 'EMG', make: function (r, s) {
          return mc(r, '(d) The perimeter of the L equals the perimeter of the ' + t(d1(s.W) + '\\times ' + d1(s.H)) + ' rectangle it fits inside (' + t(n(2 * (s.W + s.H))) + ' cm). Why did cutting the notch change the area but not the perimeter?', [
            { html: 'The two edges removed are replaced by two new edges of exactly the same lengths, just rerouted inward.', right: true },
            { html: 'Perimeter never changes when you cut a shape.', why: 'A notch cut out of the middle of a side <b>would</b> add edges. This only works for a corner notch — why?', code: 'never' },
            { html: 'Because the notch is a rectangle.', why: 'The shape of the notch isn’t the reason. Compare the edges that disappear with the ones that appear.', code: 'rect' },
            { html: 'It’s a coincidence of these numbers.', why: 'Try any corner notch — it always happens. Look at the two new edges.', code: 'coincidence' }],
            'The notch removes a ' + t(d1(s.W - s.wv)) + ' edge and a ' + t(d1(s.H - s.tb)) + ' edge from the rectangle’s boundary and replaces them with two new edges of the same lengths facing the other way. The boundary is rerouted, not lengthened. (A notch in the middle of a side would add two extra edges.)', ['Compare the edges taken away with the edges added.'], 'corner notch perimeter');
        } }] },
      { num: '12', shared: ep12Shared, stem: function (s) { return 'A concrete garden ornament is a cylinder sitting centred on top of a square prism. The prism is ' + t(d1(s.s) + '\\times ' + d1(s.s) + '\\times ' + d1(s.t) + '\\text{ cm}') + '; the cylinder has radius ' + t(d1(s.r) + '\\text{ cm}') + ' and height ' + t(d1(s.h) + '\\text{ cm}') + '. The ornament rests on the ground, and every surface <b>except</b> the bottom of the prism is to be sealed.' + ornamentFig(s); }, parts: [
        { id: 'e12a', level: 'EMG', make: function (r, s) {
          var Vp = s.s * s.s * s.t, Vc = PI * s.r * s.r * s.h, V = Vp + Vc;
          return nearPart('(a) Find the total volume of the ornament, to the nearest tenth.', V, 1, 'cm³',
            [A(Vp - Vc, 'composite-sub', 'The cylinder sits on top — its volume is <b>added</b>.'), A(Vp + 2 * PI * s.r * s.h, 'v-used-sa', H.cylV)],
            'Prism: ' + t(d1(s.s) + '(' + d1(s.s) + ')(' + d1(s.t) + ')=' + F(Vp) + '\\text{ cm}^{3}') + '. Cylinder: ' + t('\\pi(' + d1(s.r) + ')^{2}(' + d1(s.h) + ')=' + F(s.r * s.r * s.h) + '\\pi') + '.<br>' + t('V=' + F(Vp) + '+' + F(s.r * s.r * s.h) + '\\pi=' + F(V.toFixed(5)) + '\\ldots' + bold(V, 1, 'cm³')),
            ['Volumes of joined solids simply add.'], 'ornament V');
        } },
        { id: 'e12b', level: 'ADV', make: function (r, s) {
          var sides = 4 * s.s * s.t, top = s.s * s.s, cs = 2 * PI * s.r * s.h, c = PI * s.r * s.r, SA = sides + top + cs;
          return nearPart('(b) Find the total area to be sealed, to the nearest tenth. List every surface you count and every one you leave out before adding.', SA, 1, 'cm²',
            [A(SA + top, 'sa-extra-face', 'The prism’s bottom is on the ground — it isn’t sealed.'), A(SA - c, 'sa-missing-face', 'The cylinder’s top circle is exposed and must be sealed.'), A(SA + c, 'composite-overlap', 'The cylinder’s bottom circle is glued to the prism — it isn’t a surface. And the patch of prism top under it is hidden.'),
              A(2 * top + sides + 2 * c + cs, 'composite-overlap', 'Joining the solids hides the cylinder’s bottom and a circle of the prism’s top; and the prism’s bottom is on the ground.')],
            '<b>Counted:</b> prism’s four sides ' + t('4(' + d1(s.s) + '\\times ' + d1(s.t) + ')=' + F(sides)) + '; prism top less the hidden circle ' + t(F(top) + '-' + n(s.r * s.r) + '\\pi') + '; curved side ' + t('2\\pi(' + d1(s.r) + ')(' + d1(s.h) + ')=' + n(2 * s.r * s.h) + '\\pi') + '; cylinder top ' + t(n(s.r * s.r) + '\\pi') + '.<br><b>Not counted:</b> the prism’s bottom (on the ground) and the cylinder’s bottom (glued on).<br>' +
            t('SA=' + F(sides) + '+' + F(top) + '-' + n(s.r * s.r) + '\\pi+' + n(2 * s.r * s.h) + '\\pi+' + n(s.r * s.r) + '\\pi=' + F(sides + top) + '+' + n(2 * s.r * s.h) + '\\pi' + bold(SA, 1, 'cm²')),
            ['Which surfaces can you touch once it’s on the ground?', 'The circle the cylinder stands on is hidden, but the cylinder’s own top is exposed.'], 'ornament sealed area');
        } },
        { id: 'e12c', level: 'EMG', make: function (r, s) {
          return mc(r, '(c) When you total the area to be sealed, two circles of radius ' + t(d1(s.r) + '\\text{ cm}') + ' appear in the work: one is subtracted and one is added. What is their combined effect?', [
            { html: 'They cancel exactly: the patch of prism top under the cylinder is removed, and the cylinder’s own top is added.', right: true },
            { html: 'They double the circle’s area, because both are counted.', why: 'One is subtracted and one is added — what is ' + t('-\\pi r^{2}+\\pi r^{2}') + '?', code: 'double' },
            { html: 'They remove two circles, because the cylinder covers both.', why: 'The cylinder only covers one patch (on the prism). Its own top is exposed.', code: 'remove2' },
            { html: 'They cancel, because the cylinder’s bottom and top are both hidden.', why: 'The cylinder’s top is exposed. The subtracted circle is the patch of the prism’s top.', code: 'wrong-pair' }],
            'Subtracted: the circle of prism top the cylinder stands on (buried). Added: the cylinder’s top (exposed). ' + t('-' + n(s.r * s.r) + '\\pi+' + n(s.r * s.r) + '\\pi=0') + '. This only cancels because the cylinder’s top is the same size as its footprint — keep both lines in your work.', ['Name where each circle comes from.'], 'circles cancel');
        } }] },

      /* ================= EP Part E: open containers ================= */
      { num: '13', section: 'Extra practice E — Open containers: the wording decides the faces', shared: ep13Shared, stem: function (s) { return 'An open-topped glass aquarium is a rectangular prism ' + t(s.L + '\\text{ cm}') + ' long, ' + t(s.W + '\\text{ cm}') + ' wide and ' + t(s.D + '\\text{ cm}') + ' deep. It has no lid.' + rectFig(s.L + ' cm', s.W + ' cm', s.D + ' cm'); }, parts: [
        { id: 'e13a', level: 'EMG', make: function (r, s) {
          var g = s.L * s.W + 2 * s.L * s.D + 2 * s.W * s.D;
          return exactPart('(a) Find the total area of glass required.', g, 'cm²',
            [A(g + s.L * s.W, 'sa-extra-face', 'The tank has no lid — leave the top out.'), A(g - s.L * s.W, 'sa-missing-face', 'The base is glass too.'), A(s.L * s.W * s.D, 'v-used-sa', 'That’s the volume. Add the areas of the glass faces.')],
            'Base and four walls (no top):<br>' + t(s.L + '\\times ' + s.W + '+2(' + s.L + '\\times ' + s.D + ')+2(' + s.W + '\\times ' + s.D + ')=' + F(s.L * s.W) + '+' + F(2 * s.L * s.D) + '+' + F(2 * s.W * s.D) + boldEx(g, 'cm²')),
            ['List the faces first: which ones are glass?'], 'aquarium glass');
        } },
        { id: 'e13b', level: 'BEG', make: function (r, s) {
          var V = s.L * s.W * s.D, Lt = V / 1000;
          return exactPart('(b) Find the capacity of the aquarium in litres when it is filled to the brim.', Lt, 'L',
            [A(V, 'conv-missing', 'That’s cm³ (= mL). Convert to litres.'), A(V / 100, 'conv-factor', t('1000\\text{ mL}=1\\text{ L}') + '.')],
            t('V=' + s.L + '\\times ' + s.W + '\\times ' + s.D + '=' + F(V) + '\\text{ cm}^{3}=' + F(V) + '\\text{ mL}' + boldEx(Lt, 'L')), [t('1\\text{ cm}^{3}=1\\text{ mL}') + ', ' + t('1000\\text{ mL}=1\\text{ L}') + '.'], 'aquarium litres');
        } },
        { id: 'e13c', level: 'EMG', make: function (r, s) {
          var g = s.L * s.W + 2 * s.L * s.D + 2 * s.W * s.D, lid = s.L * s.W, nw = g + lid, pc = lid / g * 100;
          return fieldsPart('(c) A glass lid is added. State the new total area of glass, and the percentage increase to the nearest tenth of a percent. (Without the lid: ' + t(F(g) + '\\text{ cm}^{2}') + '.)', [
            { label: 'New total', x: nw, unit: 'cm²', alts: [A(g + s.L * s.D, 'wrong-face', 'The lid is the same size as the base: ' + t(s.L + '\\times ' + s.W) + '.')] },
            { label: 'Increase', x: pc, dp: 1, unit: '%', alts: [A(lid / nw * 100, 'pct-base', 'Percentage increase compares the change with the <b>original</b> amount, ' + t(F(g)) + '.')] }],
            'The lid is ' + t(s.L + '\\times ' + s.W + '=' + F(lid) + '\\text{ cm}^{2}') + '. New total: ' + t(F(g) + '+' + F(lid) + '=\\mathbf{' + F(nw) + '}\\text{ cm}^{2}') + '.<br>' + t('\\dfrac{' + F(lid) + '}{' + F(g) + '}\\times 100=' + pc.toFixed(5) + '\\ldots' + bold(pc, 1, '%')),
            ['Percentage increase = change ÷ original × 100.'], 'lid % increase');
        } },
        { id: 'e13d', level: 'EMG', make: function (r, s) {
          return mc(r, '(d) Why do the glass area and the capacity need different units, and why can’t either be reported in the other’s unit?', [
            { html: 'Glass area is two lengths multiplied (cm²); capacity is three lengths multiplied (cm³ or L). They are different kinds of quantity, so no factor converts one to the other.', right: true },
            { html: 'They could both be in cm² — litres are just a bigger unit of area.', why: 'Litres measure space inside (volume/capacity), not area.', code: 'litre-area' },
            { html: 'Divide the cm² by ' + t('1000') + ' to get litres.', why: 'cm² ÷ 1000 is still an area. Converting area to volume would need another length.', code: 'div1000' },
            { html: 'Only because the tank has no lid.', why: 'Even a closed tank has an area in cm² and a capacity in L. The exponent on the unit counts the lengths multiplied.', code: 'lid' }],
            'Area: two dimensions multiplied → cm². Capacity: three dimensions → cm³ (or L). ' + t(F(s.L * s.W + 2 * s.L * s.D + 2 * s.W * s.D) + '\\text{ cm}^{2}') + ' of glass and ' + t(n(s.L * s.W * s.D / 1000) + '\\text{ L}') + ' of water are not comparable.', ['Count the lengths multiplied in each.'], 'area vs capacity units');
        } }] },
      { num: '14', shared: function (r) { return { r: r.int(3, 6), h: r.int(20, 35) }; }, stem: function (s) { return 'Three cylindrical objects all have radius ' + t(d1(s.r) + '\\text{ cm}') + ' and height ' + t(d1(s.h) + '\\text{ cm}') + '. Object I is a sealed can. Object II is a cup, open at the top only. Object III is a length of drainpipe, open at <b>both</b> ends; only its outer surface is to be found.' + cylFig({ r: 'r = ' + p1(s.r) + ' cm', h: p1(s.h) + ' cm' }); }, parts: [
        { id: 'e14a', level: 'EMG', make: function (r, s) {
          var c = PI * s.r * s.r, cs = 2 * PI * s.r * s.h, I = 2 * c + cs, II = c + cs, III = cs;
          var al = function (v) { return [I, II, III].filter(function (x) { return x !== v; }).map(function (x) { return A(x, 'circles-count', 'Count the circular ends this object actually has: sealed can → 2, open-top cup → 1, pipe → 0.'); }); };
          return fieldsPart('(a) Find the surface area of each object, to the nearest tenth.', [
            { label: 'I (sealed)', x: I, dp: 1, unit: 'cm²', alts: al(I) }, { label: 'II (open top)', x: II, dp: 1, unit: 'cm²', alts: al(II) }, { label: 'III (pipe)', x: III, dp: 1, unit: 'cm²', alts: al(III) }],
            'I: two circles + side: ' + t('2\\pi r^{2}+2\\pi rh=' + n(2 * s.r * s.r + 2 * s.r * s.h) + '\\pi' + bold(I, 1)) + '.<br>II: one circle + side: ' + t('\\pi r^{2}+2\\pi rh=' + n(s.r * s.r + 2 * s.r * s.h) + '\\pi' + bold(II, 1)) + '.<br>III: no circles: ' + t('2\\pi rh=' + n(2 * s.r * s.h) + '\\pi' + bold(III, 1)) + ' (cm²).',
            ['Write each expression first, saying how many circles it includes.'], 'three cylinders SA');
        } },
        { id: 'e14b', level: 'BEG', make: function (r, s) {
          var c = PI * s.r * s.r;
          return nearPart('(b) The surface areas of the three objects differ only by whole circular ends. State the area of one circle, to the nearest tenth.', c, 1, 'cm²',
            [A(2 * PI * s.r, 'circ-area', 'That’s the circumference. Area is ' + t('\\pi r^{2}') + '.'), A(2 * c, 'sa-half', 'One circle, not two.')],
            t('\\pi r^{2}=\\pi(' + d1(s.r) + ')^{2}=' + n(s.r * s.r) + '\\pi' + bold(c, 1, 'cm²')) + '. I − II is exactly one circle and I − III exactly two — a quick check for any open-container answer.', [t('A=\\pi r^{2}') + '.'], 'one circle');
        } },
        { id: 'e14c', level: 'BEG', make: function (r, s) {
          var V = PI * s.r * s.r * s.h;
          return nearPart('(c) All three objects have the same volume. State it, to the nearest tenth.', V, 1, 'cm³',
            [A(2 * PI * s.r * s.h, 'v-used-sa', H.cylV)],
            t('V=\\pi(' + d1(s.r) + ')^{2}(' + d1(s.h) + ')=' + n(s.r * s.r * s.h) + '\\pi' + bold(V, 1, 'cm³')) + ' for all three. The walls are in the same place, so a lid can’t change the space inside — it only changes which faces are counted for surface area.', [t('V=\\pi r^{2}h') + '.'], 'same volume');
        } }] },

      /* ================= EP Part F: units ================= */
      { num: '15', section: 'Extra practice F — Reconciling units before you start', shared: ep15Shared, stem: function (s) { return 'A planter box, open at the top, is ' + t(n(s.lm) + '\\text{ m}') + ' long, ' + t(s.wc + '\\text{ cm}') + ' wide and ' + t(s.dmm + '\\text{ mm}') + ' deep.' + rectFig(ps(s.lm) + ' m', s.wc + ' cm', s.dmm + ' mm'); }, parts: [
        { id: 'e15a', level: 'PRG', make: function (r, s) {
          var l = cl(s.lm * 100), d = s.dmm / 10, V = l * s.wc * d;
          return fieldsPart('(a) Convert all three dimensions to centimetres, then find the volume of soil the box holds in ' + t('\\text{cm}^{3}') + ', and in litres.', [
            { label: 'Volume', x: V, unit: 'cm³', alts: [A(s.lm * s.wc * s.dmm, 'units-mixed', 'Convert first: ' + t(n(s.lm) + '\\text{ m}=' + l + '\\text{ cm}') + ' and ' + t(s.dmm + '\\text{ mm}=' + d + '\\text{ cm}') + '.'), A(l * s.wc * s.dmm, 'units-mixed', 'The depth is in mm: ' + t(s.dmm + '\\text{ mm}=' + d + '\\text{ cm}') + '.')] },
            { label: 'Capacity', x: V / 1000, unit: 'L', alts: [A(V / 100, 'conv-factor', t('1000\\text{ cm}^{3}=1\\text{ L}') + '.'), A(V, 'conv-missing', 'Convert: ' + t('1000\\text{ cm}^{3}=1\\text{ L}') + '.')] }],
            t(n(s.lm) + '\\text{ m}=' + l + '\\text{ cm}') + ', ' + t(s.dmm + '\\text{ mm}=' + d + '\\text{ cm}') + '.<br>' + t('V=' + l + '\\times ' + s.wc + '\\times ' + d + '=' + F(V) + '\\text{ cm}^{3}') + '<br>' + t(F(V) + '\\text{ cm}^{3}=' + F(V) + '\\text{ mL}' + boldEx(V / 1000, 'L')),
            ['Change every dimension to cm before multiplying.', t('1\\text{ m}=100\\text{ cm}') + ', ' + t('1\\text{ cm}=10\\text{ mm}') + '.'], 'planter V');
        } },
        { id: 'e15b', level: 'EMG', make: function (r, s) {
          var w = s.wc / 100, d = s.dmm / 1000, V = cl(s.lm * w * d);
          return exactPart('(b) Redo the volume working entirely in metres, giving the answer in ' + t('\\text{m}^{3}') + '.', V, 'm³',
            [A(V * 1000, 'conv-direction', 'That’s the number of litres. ' + t('1\\text{ m}^{3}=1000\\text{ L}') + '.'), A(s.lm * s.wc * s.dmm, 'units-mixed', 'Change every dimension to metres first.')],
            t(s.wc + '\\text{ cm}=' + n(w) + '\\text{ m}') + ', ' + t(s.dmm + '\\text{ mm}=' + n(d) + '\\text{ m}') + '.<br>' + t('V=' + n(s.lm) + '\\times ' + n(w) + '\\times ' + n(d) + boldEx(V, 'm³')) + '<br>Check: ' + t(n(V) + '\\times 1000=' + n(V * 1000) + '\\text{ L}') + ' ✓',
            [t('1\\text{ m}=100\\text{ cm}=1000\\text{ mm}') + '.'], 'planter m³');
        } },
        { id: 'e15c', level: 'PRG', make: function (r, s) {
          var l = cl(s.lm * 100), d = s.dmm / 10, w = s.wc, S = l * w + 2 * l * d + 2 * w * d;
          return fieldsPart('(c) Find the area of timber needed to build the box (five faces — no top), first in ' + t('\\text{cm}^{2}') + ' and then in ' + t('\\text{m}^{2}') + '.', [
            { label: 'Timber', x: S, unit: 'cm²', alts: [A(S + l * w, 'sa-extra-face', 'No top: five faces.'), A(S - l * w, 'sa-missing-face', 'The base needs timber too.')] },
            { label: 'Timber', x: cl(S / 10000), unit: 'm²', alts: [A(S / 100, 'conv-linear', 'Square the factor: ' + t('1\\text{ m}^{2}=100^{2}=10\\,000\\text{ cm}^{2}') + '.'), A(S / 1e6, 'conv-cube', 'Area: square the factor (' + t('10\\,000') + '), don’t cube it.')] }],
            'Base ' + t(l + '\\times ' + w + '=' + F(l * w)) + '; long sides ' + t('2(' + l + '\\times ' + d + ')=' + F(2 * l * d)) + '; ends ' + t('2(' + w + '\\times ' + d + ')=' + F(2 * w * d)) + '.<br>' + t('SA=' + F(S) + '\\text{ cm}^{2}') + '; ' + t(F(S) + '\\div 10\\,000=' + n(S / 10000) + '\\text{ m}^{2}'),
            ['Base + four walls, all in cm.', t('1\\text{ m}^{2}=100^{2}\\text{ cm}^{2}') + '.'], 'planter timber');
        } },
        { id: 'e15d', level: 'BEG', outcome: 'M2', make: function (r) {
          return mc(r, '(d) The conversion from cm² to m² is not the same number as the conversion from cm³ to m³. Which pair is right?', [
            { html: t('1\\text{ m}^{2}=10\\,000\\text{ cm}^{2}') + ' and ' + t('1\\text{ m}^{3}=1\\,000\\,000\\text{ cm}^{3}'), right: true },
            { html: t('1\\text{ m}^{2}=100\\text{ cm}^{2}') + ' and ' + t('1\\text{ m}^{3}=100\\text{ cm}^{3}'), why: 'That’s the linear factor. A square metre is 100 cm by 100 cm.', code: 'linear' },
            { html: t('1\\text{ m}^{2}=200\\text{ cm}^{2}') + ' and ' + t('1\\text{ m}^{3}=300\\text{ cm}^{3}'), why: 'Square and cube the factor — don’t multiply it by 2 or 3.', code: 'times' },
            { html: t('1\\text{ m}^{2}=10\\,000\\text{ cm}^{2}') + ' and ' + t('1\\text{ m}^{3}=1000\\text{ cm}^{3}'), why: '1000 cm³ is one <b>litre</b>, not one cubic metre: ' + t('100^{3}=1\\,000\\,000') + '.', code: 'litre' }],
            'The linear factor is ' + t('1\\text{ m}=100\\text{ cm}') + '. Area is two lengths multiplied, so square it: ' + t('100^{2}=10\\,000') + '. Volume is three lengths, so cube it: ' + t('100^{3}=1\\,000\\,000') + '.', ['Square the factor for area, cube it for volume.'], 'square vs cube factor');
        } }] },

      /* ================= EP Part G ================= */
      { num: '16', section: 'Extra practice G — What it is made of versus what it holds', shared: ep16Shared, stem: function (s) { return 'An open-topped cylindrical water tank is built from sheet steel. It has a base diameter of ' + t(d1(s.d) + '\\text{ m}') + ' and a height of ' + t(d1(s.h) + '\\text{ m}') + '. Sheet steel costs ' + t('\\$' + s.pr.toFixed(2)) + ' per square metre; the tank has a steel base but no lid.' + cylFig({ d: 'd = ' + p1(s.d) + ' m', h: p1(s.h) + ' m' }); }, parts: [
        { id: 'e16a', level: 'EMG', make: function (r, s) {
          var R = s.d / 2, SA = PI * R * R + 2 * PI * R * s.h;
          return nearPart('(a) Find the area of steel needed, to the nearest hundredth of a square metre.', SA, 2, 'm²',
            [A(2 * PI * R * R + 2 * PI * R * s.h, 'sa-extra-face', 'There is no lid — count only one circle (the base).'), A(2 * PI * R * s.h, 'sa-lateral', 'The tank has a steel base: add one circle.'), A(PI * s.d * s.d + 2 * PI * s.d * s.h, 'diam-radius', H.diam)],
            t('r=' + d1(s.d) + '\\div 2=' + n(R) + '\\text{ m}') + '. Counted: the curved side and the base circle (no lid).<br>' + t('SA=\\pi r^{2}+2\\pi rh=\\pi(' + n(R) + ')^{2}+2\\pi(' + n(R) + ')(' + d1(s.h) + ')=' + n(R * R + 2 * R * s.h) + '\\pi=' + SA.toFixed(5) + '\\ldots' + bold(SA, 2, 'm²')),
            [H.diam, 'One circle (the base) plus the curved side.'], 'tank steel');
        } },
        { id: 'e16b', level: 'EMG', make: function (r, s) {
          var R = s.d / 2, SA = PI * R * R + 2 * PI * R * s.h, C = SA * s.pr;
          return nearPart('(b) The tank needs ' + t(fx(SA, 2) + '\\text{ m}^{2}') + ' of steel (that’s ' + t(n(R * R + 2 * R * s.h) + '\\pi\\text{ m}^{2}') + ' exactly). Find the cost of the steel, to the nearest cent.', C, 2, null,
            [A(rd(SA, 2) * s.pr, 'round-early', H.early + ' Use ' + t(n(R * R + 2 * R * s.h) + '\\pi') + '.'), A(SA / s.pr, 'mult-div', 'Cost = area × price per square metre.')],
            t(n(R * R + 2 * R * s.h) + '\\pi\\times ' + s.pr.toFixed(2) + '=' + C.toFixed(5) + '\\ldots\\approx\\mathbf{\\$' + fx(C, 2) + '}') + (Math.abs(rd(rd(SA, 2) * s.pr, 2) - rd(C, 2)) > 1e-9 ? '<br>(Using the rounded ' + t(fx(SA, 2)) + ' gives ' + t('\\$' + fx(rd(SA, 2) * s.pr, 2)) + ' — a few cents out.)' : ''),
            ['Multiply the exact area by the price per m².'], 'steel cost', { before: '$' });
        } },
        { id: 'e16c', level: 'EMG', make: function (r, s) {
          var R = s.d / 2, V = PI * R * R * s.h;
          return fieldsPart('(c) Find the capacity of the tank in ' + t('\\text{m}^{3}') + ' and in litres, each to the nearest tenth.', [
            { label: 'Capacity', x: V, dp: 1, unit: 'm³', alts: [A(PI * s.d * s.d * s.h, 'diam-radius', H.diam)] },
            { label: 'Capacity', x: V * 1000, dp: 1, unit: 'L', alts: [A(V * 100, 'conv-factor', t('1\\text{ m}^{3}=1000\\text{ L}') + '.'), A(rd(V, 1) * 1000, 'round-early', H.early)] }],
            t('V=\\pi(' + n(R) + ')^{2}(' + d1(s.h) + ')=' + n(R * R * s.h) + '\\pi=' + V.toFixed(5) + '\\ldots' + bold(V, 1, 'm³')) + '<br>' + t('1\\text{ m}^{3}=1000\\text{ L}') + ': ' + t(F((V * 1000).toFixed(5)) + '\\ldots' + bold(V * 1000, 1, 'L')),
            [H.diam, t('1\\text{ m}^{3}=1000\\text{ L}') + ' — use the unrounded m³.'], 'tank capacity');
        } },
        { id: 'e16d', level: 'PRG', make: function (r, s) {
          var R = s.d / 2, SA = PI * R * R + 2 * PI * R * s.h, C = rd(SA * s.pr, 2), Lt = rd(PI * R * R * s.h * 1000, 1), c = C / Lt * 100; // the card shows only the rounded cost and litres, so the key uses them
          return nearPart('(d) The steel costs ' + t('\\$' + fx(C, 2)) + ' and the tank holds ' + t(F((Lt).toFixed(1)) + '\\text{ L}') + '. Find the cost of the steel per litre of capacity, in <b>cents</b>, to the nearest tenth of a cent.', c, 1, 'cents per litre',
            [A(C / Lt, 'cents-dollars', 'That’s in <b>dollars</b> per litre. Multiply by 100 for cents.'), A(Lt / C, 'mult-div', 'Cost per litre = cost ÷ litres.')],
            t('\\dfrac{\\$' + fx(C, 2) + '}{' + F(Lt.toFixed(1)) + '\\text{ L}}=\\$' + (C / Lt).toFixed(5) + '\\ldots') + ' per litre ' + t('=' + c.toFixed(4) + '\\ldots' + bold(c, 1, 'cents/L')) + '. A builder compares designs by cost per litre — the total alone just grows with size.',
            ['Cost ÷ capacity, then dollars → cents.'], 'cost per litre');
        } }] },

      /* ================= EP Part H: error analysis ================= */
      { num: '17', section: 'Extra practice H — Error analysis', shared: function (r) { return { d: r.pick([10, 12, 14, 16, 18, 20]), h: r.pick([15, 18, 20, 22, 25]) }; }, stem: function (s) { return '<b>The student who used the diameter as the radius.</b> A cylindrical tin has diameter ' + t(d1(s.d) + '\\text{ cm}') + ' and height ' + t(d1(s.h) + '\\text{ cm}') + '. Asked for its volume to the nearest tenth, a student wrote ' + t('V=\\pi r^{2}h=\\pi(' + d1(s.d) + ')^{2}(' + d1(s.h) + ')=' + fx(PI * s.d * s.d * s.h, 1) + '\\text{ cm}^{3}') + '.'; }, parts: [
        { id: 'e17a', level: 'EMG', make: function (r, s) {
          var R = s.d / 2, V = PI * R * R * s.h;
          return nearPart('(a) Give the correct volume, to the nearest tenth.', V, 1, 'cm³',
            [A(PI * s.d * s.d * s.h, 'diam-radius', 'That’s the student’s answer. Halve the diameter first.'), A(PI * s.d * s.h, 'no-sqrt', 'Square the radius: ' + t('r^{2}') + '.')],
            'The error: the diameter was substituted for ' + t('r') + '. ' + t('r=' + d1(s.d) + '\\div 2=' + d1(R)) + '.<br>' + t('V=\\pi(' + d1(R) + ')^{2}(' + d1(s.h) + ')=' + n(R * R * s.h) + '\\pi' + bold(V, 1, 'cm³')), [t('r=d\\div 2') + '.'], 'corrected V');
        } },
        { id: 'e17b', level: 'EMG', make: function (r, s) {
          return exactPart('(b) Divide the student’s answer by the correct one. What whole number do you get?', 4, null,
            [A(2, 'ratio-2', 'The radius is <b>squared</b> in the formula: ' + t('(2r)^{2}=4r^{2}') + '.'), A(8, 'ratio-2', 'Only ' + t('r') + ' is doubled, and it’s squared (not cubed): ' + t('(2r)^{2}=4r^{2}') + '.')],
            t('\\dfrac{\\pi(' + d1(s.d) + ')^{2}(' + d1(s.h) + ')}{\\pi(' + d1(s.d / 2) + ')^{2}(' + d1(s.h) + ')}=\\mathbf{4}') + '. Using ' + t('2r') + ' for ' + t('r') + ': ' + t('\\pi(2r)^{2}h=4\\pi r^{2}h') + ' — always exactly 4 times too big, never 2.', ['Which power of ' + t('r') + ' is in the volume formula?'], 'd for r ratio');
        } },
        { id: 'e17c', level: 'EMG', make: function (r, s) {
          return mc(r, '(c) Which one-line check, available before any arithmetic, would have caught this error?', [
            { html: 'The tin fits inside a box ' + t(d1(s.d) + '\\times ' + d1(s.d) + '\\times ' + d1(s.h)) + ' (' + t(F(s.d * s.d * s.h) + '\\text{ cm}^{3}') + '); the cylinder must hold less than that.', right: true },
            { html: 'Check that the answer is in cm³.', why: 'The student’s unit was cm³ — that check passes, but the answer is still wrong.', code: 'unit' },
            { html: 'Round ' + t('\\pi') + ' to 3.14 and redo it.', why: 'Using 3.14 repeats the same mistake with a worse ' + t('\\pi') + '.', code: 'pi' },
            { html: 'Check that the answer has one decimal place.', why: 'That checks rounding, not the size of the answer.', code: 'round' }],
            'Bounding box: ' + t(d1(s.d) + '\\times ' + d1(s.d) + '\\times ' + d1(s.h) + '=' + F(s.d * s.d * s.h) + '\\text{ cm}^{3}') + '. The student’s ' + t(fx(PI * s.d * s.d * s.h, 1)) + ' is more than that, so it’s impossible. (Also: write ' + t('r=d/2') + ' on its own line every time a diameter is given.)', ['What simple solid fits around the cylinder?'], 'bounding-box check');
        } }] },
      { num: '18', shared: function (r) { return { s: r.int(5, 12) }; }, stem: function (s) { return '<b>The student whose unit gave the game away.</b> Asked for the <i>surface area</i> of a cube with edge ' + t(d1(s.s) + '\\text{ cm}') + ', a student wrote ' + t(d1(s.s) + '\\times ' + d1(s.s) + '\\times ' + d1(s.s) + '=' + F(s.s * s.s * s.s) + '\\text{ cm}^{3}') + '.'; }, parts: [
        { id: 'e18a', level: 'LIM', make: function (r, s) {
          return mc(r, '(a) Without redoing the arithmetic, which single symbol proves the answer cannot be a surface area?', [
            { html: 'The exponent ' + t('3') + ' in ' + t('\\text{cm}^{3}'), right: true },
            { html: 'The ' + t('\\times') + ' signs', why: 'Areas use multiplication too. What does the unit say about how many lengths were multiplied?', code: 'times' },
            { html: 'The number ' + t(F(s.s * s.s * s.s)), why: 'A number alone can’t tell you whether it’s an area. Look at the unit.', code: 'number' },
            { html: 'The ' + t('.0') + ' in ' + t(d1(s.s)), why: 'That’s just precision. Look at the unit.', code: 'decimal' }],
            'The exponent ' + t('3') + ' in cm³ shows three lengths were multiplied — a volume. A surface area must be in cm².', ['Look at the unit.'], 'unit exponent');
        } },
        { id: 'e18b', level: 'BEG', make: function (r, s) {
          var SA = 6 * s.s * s.s;
          return exactPart('(b) Give the correct surface area.', SA, 'cm²',
            [A(s.s * s.s * s.s, 'v-used-sa', 'That’s the volume (the student’s answer). A cube has six square faces.'), A(s.s * s.s, 'sa-missing-face', 'That’s one face. A cube has six.'), A(4 * s.s * s.s, 'sa-missing-face', 'Six faces, not four.')],
            t('SA=6s^{2}=6(' + d1(s.s) + ')^{2}=6(' + s.s * s.s + ')' + boldEx(SA, 'cm²')) + '. Rule: the exponent on the unit = the number of lengths multiplied together.', ['A cube has six congruent square faces.'], 'cube SA');
        } }] },
      { num: '19', shared: function (r) { return { d: r.pick([20, 24, 30, 36, 40]), L: r.pick([150, 200, 250, 300]) }; }, stem: function (s) { var R = s.d / 2; return '<b>The student who capped an open pipe.</b> A length of drainpipe is open at both ends. Its outside diameter is ' + t(s.d + '\\text{ cm}') + ' and it is ' + t(s.L + '\\text{ cm}') + ' long. Asked for the area of the outside surface to be coated, a student wrote ' + t('SA=2\\pi r^{2}+2\\pi rh=2\\pi(' + R + ')^{2}+2\\pi(' + R + ')(' + s.L + ')=' + fx(2 * PI * R * R + 2 * PI * R * s.L, 1) + '\\text{ cm}^{2}') + '.' + cylFig({ d: 'd = ' + s.d + ' cm', h: s.L + ' cm' }); }, parts: [
        { id: 'e19a', level: 'LIM', make: function (r, s) {
          return mc(r, '(a) Which term in the student’s expression should not be there?', [
            { html: t('2\\pi r^{2}') + ' — the pipe has no circular ends', right: true },
            { html: t('2\\pi rh') + ' — the curved side isn’t coated', why: 'The curved outside surface is exactly what is coated.', code: 'curved' },
            { html: 'Neither — the student just used the diameter', why: 'The student did halve the diameter (' + t('r=' + s.d / 2) + '). Count the pipe’s ends.', code: 'diam' },
            { html: 'Both — the answer should be the volume', why: 'The question asks for an area. Which faces does an open pipe have?', code: 'both' }],
            'Both ends of the pipe are holes, so there are no flat faces: ' + t('2\\pi r^{2}') + ' should not be there. Only ' + t('2\\pi rh') + ' belongs.', ['How many circular ends does an open pipe have?'], 'pipe extra term');
        } },
        { id: 'e19b', level: 'EMG', make: function (r, s) {
          var R = s.d / 2, ok2 = 2 * PI * R * s.L, ov = 2 * PI * R * R;
          return fieldsPart('(b) Give the correct area to be coated, and the amount the student over-counted, each to the nearest tenth.', [
            { label: 'Correct area', x: ok2, dp: 1, unit: 'cm²', alts: [A(ok2 + ov, 'sa-extra-face', 'That’s the student’s answer. Leave out the circles.'), A(ok2 + ov / 2, 'sa-one-base', 'Open at <b>both</b> ends: no circles at all.')] },
            { label: 'Over-count', x: ov, dp: 1, unit: 'cm²', alts: [A(ov / 2, 'sa-one-base', 'The student counted <b>two</b> circles.')] }],
            t('SA=2\\pi rh=2\\pi(' + R + ')(' + s.L + ')=' + F(2 * R * s.L) + '\\pi' + bold(ok2, 1, 'cm²')) + '<br>Over-count: ' + t('2\\pi r^{2}=' + 2 * R * R + '\\pi' + bold(ov, 1, 'cm²')),
            ['Curved surface only: ' + t('2\\pi rh') + '.'], 'pipe area');
        } },
        { id: 'e19c', level: 'EMG', make: function (r, s) {
          return mc(r, '(c) Which change to the wording would make the student’s expression correct?', [
            { html: 'Change “open at both ends” to “sealed at both ends” and ask for the <b>total</b> surface area.', right: true },
            { html: 'Change the diameter to a radius.', why: 'That changes the numbers, not which faces exist.', code: 'radius' },
            { html: 'Ask for the volume instead.', why: t('2\\pi r^{2}+2\\pi rh') + ' is an area expression, not a volume.', code: 'volume' },
            { html: 'Make it open at one end only.', why: 'Then there would be one circle: ' + t('\\pi r^{2}+2\\pi rh') + '.', code: 'one-end' }],
            'Sealed at both ends, the pipe is a closed cylinder, for which ' + t('SA=2\\pi r^{2}+2\\pi rh') + ' is exactly right. The formula wasn’t wrong — the wording decides which formula applies.', ['When does a cylinder have two circular faces?'], 'rewording');
        } }] },

      /* ================= EP Part I: stretch ================= */
      { num: '20', section: 'Extra practice I — Stretch: same volume, different material', shared: ep20Shared, stem: function (s) { var a = s.s, V = a * a * a; return 'Three closed containers each hold exactly ' + t(F(V) + '\\text{ cm}^{3}') + '. Container A is a cube of edge ' + t(d1(a) + '\\text{ cm}') + '. Container B is a rectangular prism ' + t(d1(2 * a) + '\\times ' + d1(a) + '\\times ' + d1(a / 2) + '\\text{ cm}') + '. Container C is a closed cylinder of height ' + t(d1(a) + '\\text{ cm}') + '.'; }, parts: [
        { id: 'e20a', level: 'PRG', make: function (r, s) {
          var a = s.s, V = a * a * a, R = Math.sqrt(V / (PI * a));
          return nearPart('(a) Find the radius of cylinder C, to the nearest hundredth of a centimetre.', R, 2, 'cm',
            [A(V / (PI * a), 'no-sqrt', 'That’s ' + t('r^{2}') + ' — take the square root.'), A(2 * R, 'gave-diameter', 'That’s the diameter.'), A(Math.sqrt(V / a), 'no-pi', 'Divide by ' + t('\\pi') + ' too.')],
            t('\\pi r^{2}(' + d1(a) + ')=' + F(V) + '\\Rightarrow r^{2}=\\dfrac{' + F(V) + '}{' + a + '\\pi}=' + (V / PI / a).toFixed(5) + '\\ldots') + '<br>' + t('r=' + R.toFixed(6) + '\\ldots' + bold(R, 2, 'cm')),
            ['Solve ' + t('V=\\pi r^{2}h') + ' for ' + t('r') + '.'], 'cylinder r for equal V');
        } },
        { id: 'e20b', level: 'PRG', make: function (r, s) {
          var a = s.s, V = a * a * a, R = Math.sqrt(V / (PI * a)), SA = 6 * a * a, SB = 2 * (2 * a * a + a * a / 2 * 2 + a * a / 2), SC = 2 * PI * R * R + 2 * PI * R * a;
          return fieldsPart('(b) Find the surface area of each container, to the nearest tenth. (Cylinder C has radius ' + t(R.toFixed(4) + '\\ldots\\text{ cm}') + '.)', [
            { label: 'A', x: SA, dp: 1, unit: 'cm²', alts: [A(V, 'v-used-sa', 'That’s the volume.')] },
            { label: 'B', x: SB, dp: 1, unit: 'cm²', alts: [A(SB / 2, 'sa-half', 'Each face size appears twice.')] },
            { label: 'C', x: SC, dp: 1, unit: 'cm²', alts: [A(PI * R * R + 2 * PI * R * a, 'sa-one-base', H.oneBase), A(2 * PI * R * a, 'sa-lateral', H.lateral), A(2 * PI * rd(R, 2) * rd(R, 2) + 2 * PI * rd(R, 2) * a, 'round-early', H.early)] }],
            'A: ' + t('6(' + d1(a) + ')^{2}=' + F(SA)) + '. B: ' + t('2(' + n(2 * a * a) + '+' + n(a * a) + '+' + n(a * a / 2) + ')=' + F(SB)) + '.<br>C: ' + t('2\\pi r^{2}=' + F(2 * V / a) + '\\text{ exactly}') + ', ' + t('2\\pi rh=' + (2 * PI * R * a).toFixed(5)) + ', so ' + t('SA=' + SC.toFixed(5) + '\\ldots' + bold(SC, 1, 'cm²')),
            ['Closed on every face.', 'Carry the unrounded radius for C.'], 'three containers SA');
        } },
        { id: 'e20c', level: 'EMG', make: function (r, s) {
          var a = s.s, V = a * a * a, R = Math.sqrt(V / (PI * a)), SC = 2 * PI * R * R + 2 * PI * R * a, SB = 7 * a * a;
          return mc(r, '(c) Rank the containers from least to most material (A: ' + t(F(6 * a * a)) + ', B: ' + t(F(SB)) + ', C: ' + t(fx(SC, 1)) + ' cm²). Which is cheapest, and by how much does it beat the most expensive?', [
            { html: 'C < A < B; C beats B by ' + t(fx(SB - SC, 1) + '\\text{ cm}^{2}'), right: true },
            { html: 'A < C < B; A beats B by ' + t(F(SB - 6 * a * a) + '\\text{ cm}^{2}'), why: 'Compare A (' + t(F(6 * a * a)) + ') and C (' + t(fx(SC, 1)) + ') again.', code: 'cube' },
            { html: 'C < A < B; C beats B by ' + t(fx(6 * a * a - SC, 1) + '\\text{ cm}^{2}'), why: 'That’s how much C beats A. The most expensive is B.', code: 'vsA' },
            { html: 'B < A < C; B beats C by ' + t(fx(SC - SB < 0 ? SB - SC : SC - SB, 1) + '\\text{ cm}^{2}'), why: 'Less material means a smaller surface area. Which number is smallest?', code: 'reverse' }],
            'Least to most: C (' + t(fx(SC, 1)) + ') < A (' + t(F(6 * a * a)) + ') < B (' + t(F(SB)) + '). C is cheapest; it beats B by ' + t(F(SB) + '-' + fx(SC, 1) + '\\approx ' + fx(SB - SC, 1) + '\\text{ cm}^{2}') + ' for the same volume.', ['Less surface area = less material.'], 'rank material');
        } },
        { id: 'e20d', level: 'EMG', make: function (r, s) {
          var a = s.s;
          return mc(r, '(d) Container B holds the same as cube A but uses more material. Which rule do the containers illustrate, and which needs more material: a cube of edge ' + t(d1(a)) + ' or a ' + t(d1(4 * a) + '\\times ' + d1(a / 2) + '\\times ' + d1(a / 2)) + ' box (same volume)?', [
            { html: 'For a fixed volume, the more stretched out a shape is, the more surface it needs — the long box needs more.', right: true },
            { html: 'Same volume always means the same surface area — they need the same.', why: 'A and B already show that’s false: same volume, different surface area.', code: 'same' },
            { html: 'Longer shapes need less material — the long box needs less.', why: 'B is more stretched out than A and needed more. Check: long box ' + t(F(2 * (2 * a * a + 2 * a * a + a * a / 4))) + ' vs cube ' + t(F(6 * a * a)) + '.', code: 'longer' },
            { html: 'The cube needs more, because it has more edges.', why: 'Both have 12 edges. Compactness is what matters.', code: 'edges' }],
            'Compact, round shapes need the least skin for a given volume; stretched-out ones need more. The ' + t(d1(4 * a) + '\\times ' + d1(a / 2) + '\\times ' + d1(a / 2)) + ' box: ' + t('2(' + F(2 * a * a) + '+' + F(2 * a * a) + '+' + n(a * a / 4) + ')=' + F(2 * (4 * a * a + a * a / 4))) + ' cm², more than the cube’s ' + t(F(6 * a * a)) + ' cm².', ['Compare A and B: which is more stretched out?'], 'compactness rule');
        } }] },
      { num: '21', stem: 'A cylinder is called <b>equilateral</b> when its height equals its diameter, so ' + t('h=2r') + '.' + cylFig({ r: 'r', h: 'h = 2r' }), parts: [
        { id: 'e21a', level: 'PRG', make: function (r) {
          return mc(r, '(a) Which pair gives ' + t('SA') + ' and ' + t('V') + ' for an equilateral cylinder in terms of ' + t('r') + ' alone?', [
            { html: t('SA=6\\pi r^{2},\\ V=2\\pi r^{3}'), right: true },
            { html: t('SA=4\\pi r^{2},\\ V=2\\pi r^{3}'), why: 'Substitute into both terms: ' + t('2\\pi r^{2}+2\\pi r(2r)=2\\pi r^{2}+4\\pi r^{2}') + '.', code: 'sa4' },
            { html: t('SA=6\\pi r^{2},\\ V=4\\pi r^{3}'), why: t('V=\\pi r^{2}h=\\pi r^{2}(2r)=2\\pi r^{3}') + ' — only ' + t('h') + ' is replaced.', code: 'v4' },
            { html: t('SA=2\\pi r^{2}+4\\pi r,\\ V=2\\pi r^{2}'), why: t('r\\times 2r=2r^{2}') + ' — multiply the powers of ' + t('r') + ' properly.', code: 'powers' }],
            t('SA=2\\pi r^{2}+2\\pi r(2r)=2\\pi r^{2}+4\\pi r^{2}=6\\pi r^{2}') + '; ' + t('V=\\pi r^{2}(2r)=2\\pi r^{3}') + '.', ['Replace every ' + t('h') + ' with ' + t('2r') + ' and simplify.'], 'equilateral formulas');
        } },
        { id: 'e21b', level: 'PRG', make: function (r) {
          return mc(r, '(b) Using ' + t('SA=6\\pi r^{2}') + ' and ' + t('V=2\\pi r^{3}') + ', what is the simplified ratio ' + t('SA:V') + ', and what does it say about large containers?', [
            { html: t('3:r') + ' — larger containers have less surface per unit of volume.', right: true },
            { html: t('3r:1') + ' — larger containers have more surface per unit of volume.', why: t('\\dfrac{r^{2}}{r^{3}}=\\dfrac1r') + ', so ' + t('r') + ' ends up in the denominator.', code: '3r' },
            { html: t('3:1') + ' — the ratio is the same for every size.', why: 'The powers of ' + t('r') + ' don’t cancel completely: ' + t('r^{2}/r^{3}=1/r') + '.', code: '3' },
            { html: t('3\\pi:r') + ' — it depends on ' + t('\\pi') + '.', why: 'Both formulas contain ' + t('\\pi') + ', so it cancels.', code: 'pi' }],
            t('\\dfrac{SA}{V}=\\dfrac{6\\pi r^{2}}{2\\pi r^{3}}=\\dfrac{3}{r}') + ', so ' + t('SA:V=3:r') + '. It falls as ' + t('r') + ' grows: a big container needs less skin per cm³ — bulk storage is cheap per litre.', ['Divide: the ' + t('\\pi') + ' cancels and ' + t('r^{2}/r^{3}=1/r') + '.'], 'SA:V ratio');
        } },
        { id: 'e21c', level: 'ADV', make: function (r) {
          var V = r.pick([500, 750, 1000, 1500, 2000]), R = Math.cbrt(V / (2 * PI)), h = 2 * R, SA = 6 * PI * R * R;
          return fieldsPart('(c) An equilateral cylinder (' + t('V=2\\pi r^{3}') + ', ' + t('SA=6\\pi r^{2}') + ') holds ' + t(F(V) + '\\text{ cm}^{3}') + '. Find ' + t('r') + ', then ' + t('h') + ', then ' + t('SA') + ', each to the nearest tenth.', [
            { label: t('r'), x: R, dp: 1, unit: 'cm', alts: [A(Math.sqrt(V / (2 * PI)), 'root-index', t('r^{3}') + ' needs a <b>cube</b> root.'), A(V / (2 * PI), 'no-sqrt', 'That’s ' + t('r^{3}') + ' — take the cube root.')] },
            { label: t('h'), x: h, dp: 1, unit: 'cm', alts: [A(R, 'gave-radius', t('h=2r') + '.')] },
            { label: t('SA'), x: SA, dp: 1, unit: 'cm²', alts: [A(6 * PI * rd(R, 1) * rd(R, 1), 'round-early', H.early), A(4 * PI * R * R, 'sa-missing-face', t('SA=6\\pi r^{2}') + '.')] }],
            t('2\\pi r^{3}=' + F(V) + '\\Rightarrow r^{3}=\\dfrac{' + F(V) + '}{2\\pi}=' + (V / 2 / PI).toFixed(5) + '\\ldots\\Rightarrow r=' + R.toFixed(6) + '\\ldots' + bold(R, 1, 'cm')) + '<br>' + t('h=2r=' + h.toFixed(6) + '\\ldots' + bold(h, 1, 'cm')) + '<br>' + t('SA=6\\pi r^{2}=' + SA.toFixed(5) + '\\ldots' + bold(SA, 1, 'cm²')) + (Math.abs(rd(6 * PI * rd(R, 1) * rd(R, 1), 1) - rd(SA, 1)) > 1e-9 ? '<br>(Rounding ' + t('r') + ' first gives ' + t(fx(6 * PI * rd(R, 1) * rd(R, 1), 1)) + '.)' : ''),
            ['Solve ' + t('2\\pi r^{3}=V') + ' with a cube root.', 'Carry the unrounded ' + t('r') + ' into ' + t('SA') + '.'], 'equilateral from V');
        } },
        { id: 'e21d', level: 'PRG', make: function (r) {
          var V = r.pick([1000, 8000, 3375, 1728, 512]), s = Math.round(Math.cbrt(V)), R = Math.cbrt(V / (2 * PI)), SAc = 6 * PI * R * R, SAq = 6 * s * s;
          return fieldsPart('(d) A cube also holds ' + t(F(V) + '\\text{ cm}^{3}') + '. Find its surface area, and how much more material it needs than an equilateral cylinder of the same volume (to the nearest tenth).', [
            { label: 'Cube SA', x: SAq, unit: 'cm²', alts: [A(s * s, 'sa-missing-face', 'Six faces: ' + t('6s^{2}') + '.')] },
            { label: 'Extra material', x: SAq - SAc, dp: 1, unit: 'cm²', alts: [A(SAq - 6 * PI * rd(R, 1) * rd(R, 1), 'round-early', H.early)] }],
            t('s=\\sqrt[3]{' + F(V) + '}=' + s) + ', ' + t('SA=6s^{2}=\\mathbf{' + F(SAq) + '}\\text{ cm}^{2}') + '.<br>Cylinder: ' + t('r=\\sqrt[3]{\\tfrac{' + F(V) + '}{2\\pi}}=' + R.toFixed(5) + '\\ldots') + ', ' + t('SA=6\\pi r^{2}=' + SAc.toFixed(4) + '\\ldots') + '.<br>Difference ' + t(bold(SAq - SAc, 1, 'cm²')) + ': the cylinder saves material, so on material cost alone a manufacturer should choose it.',
            ['Cube: ' + t('s=\\sqrt[3]{V}') + ', ' + t('SA=6s^{2}') + '.'], 'cube vs cylinder');
        } }] }
    ]
  });
  /* parts with a sub-label (a i, b SA …) already show their letter: drop the duplicate "(a) " from the prompt */
  LESSON.items.forEach(function (it) {
    if (!it.p.sub) return;
    var mk = it.p.make;
    it.p.make = function (r, sh) { var o = mk(r, sh); o.prompt = String(o.prompt).replace(/^\([a-z]\)\s*/, ''); o.prompt = o.prompt.charAt(0).toUpperCase() + o.prompt.slice(1); return o; };
  });
  function V3(R, h) { return (PI * R * R * h).toFixed(3); }
})(window);
