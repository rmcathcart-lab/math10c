/* Geometry figures and helpers for Units 9 (trigonometry) and 10 (measurement). Needs js/kit.js, js/kitx.js.
 *
 * FIGURES (static SVG strings; labels are plain text — write x, 12 cm, 35°, θ, √ directly, not LaTeX)
 *   HW.fig(spec) -> svg. spec = {
 *     pts: { A: [x, y], … }            math coordinates (y up); the figure is scaled to fit
 *     segs: [['A', 'B', label?, { dash, color, width, side: 1|-1 }], …]   label drawn beside the middle of the segment
 *                                       (outside the figure by default; side flips it)
 *     right: [['C', 'A', 'B'], …]      right-angle box at C between CA and CB
 *     angles: [['B', 'A', 'C', '35°', { color, r }], …]   arc at the vertex B between BA and BC, with a label
 *     names: true | false | { A: 'A', … }   vertex labels (default: the point names; false hides them)
 *     fill: [['A', 'B', 'C'], …]        lightly shaded polygons
 *     extra: [{ type: 'ground', y, x0, x1 } | { type: 'dash', from: [x, y], to: [x, y] } | { type: 'text', at: [x, y], text }
 *             | { type: 'eye', at: [x, y] } | { type: 'person', at: [x, y], h } | { type: 'tree' | 'building' | 'tower', … }]
 *     width: 300 (max px), height: optional max px, pad: 30, aria }
 *   HW.tri(opt) -> svg: a right triangle, right angle at opt.names[2] (default C). opt = { w: run, h: rise (shape),
 *     names: ['A', 'B', 'C'], sides: { a: 'label of BC', b: 'label of AC', c: 'label of AB' }, angles: { A: '35°', B: 'θ' },
 *     rot: 0..3 (quarter turns), flip: true (mirror), width, hideNames }
 *     (vertex A at the end of the horizontal leg, B at the top of the vertical leg, C at the right angle, before rot/flip).
 *   HW.solid(kind, opt) -> svg: 'rectprism' {l, w, h}, 'cube' {s}, 'triprism' {b, ht, l, slant}, 'cylinder' {r | d, h},
 *     'cone' {r | d, h, s}, 'sqpyramid' {s, h, sl}, 'rectpyramid' {l, w, h, sl}, 'sphere' {r | d}, 'hemisphere' {r | d}.
 *     Each option is a label string (e.g. h: '12 cm'); missing labels draw no dimension line. opt.width (default 240).
 *
 * CHECKERS
 *   K.near(x, dp, opt) — K.approx (rounded to dp places) plus targeted alternatives: opt.alts = [{ v, code, hint }]; a
 *     response that rounds to an alternative gets its hint (wrong ratio, radian mode, rounded too early, …).
 *   K.P.near(prompt, x, dp, opt, sol, hints, text) — number box, opt.unit shown after it (e.g. 'cm', '°').
 *   HW.trig: sin, cos, tan, asin, acos, atan in DEGREES; radSin/radCos/radTan (value a calculator in RAD mode gives for a
 *     degree angle) for radian-mode diagnoses; round(x, dp).
 */
(function (root) {
  'use strict';
  var HW = root.HW, K = HW.kit, t = K.t;
  var INK = '#2b3340', COL = '#13807a', SOFT = '#e3f1ef';
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function txt(x, y, s, o) {
    o = o || {}; var it = /^[A-Za-zθαβ]$/.test(String(s)) ? ' font-style="italic"' : '';
    return '<text x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" font-size="' + (o.size || 14) + '" text-anchor="' + (o.anchor || 'middle') + '" dominant-baseline="central" fill="' + (o.color || INK) + '"' + it + (o.weight ? ' font-weight="' + o.weight + '"' : '') + ' paint-order="stroke" stroke="#fff" stroke-width="3" stroke-linejoin="round">' + esc(s).replace(/-/g, '−') + '</text>';
  }

  /* ---------------- trig in degrees ---------------- */
  var R = Math.PI / 180;
  HW.trig = {
    sin: function (d) { return Math.sin(d * R); }, cos: function (d) { return Math.cos(d * R); }, tan: function (d) { return Math.tan(d * R); },
    asin: function (v) { return Math.asin(v) / R; }, acos: function (v) { return Math.acos(v) / R; }, atan: function (v) { return Math.atan(v) / R; },
    radSin: function (d) { return Math.sin(d); }, radCos: function (d) { return Math.cos(d); }, radTan: function (d) { return Math.tan(d); },
    round: function (x, dp) { return K.roundTo(x, dp); }
  };

  /* ---------------- K.near ---------------- */
  K.near = function (x, dp, opt) {
    opt = opt || {};
    var alts = (opt.alts || []).filter(function (a) { return isFinite(a.v) && Math.abs(K.roundTo(a.v, dp) - K.roundTo(x, dp)) > 1e-9; });
    var tol = Math.pow(10, -dp) * 0.6;
    var o = {}; Object.keys(opt).forEach(function (k) { o[k] = opt[k]; });
    var base = opt.diag;
    o.diag = function (v) {
      var best = null, bd = Infinity;
      for (var i = 0; i < alts.length; i++) { var a = alts[i], d = Math.abs(v - a.v); if ((Math.abs(K.roundTo(v, dp) - K.roundTo(a.v, dp)) < 1e-9 || d <= Math.max(tol, Math.abs(a.v) * 0.0015)) && d < Math.abs(v - x)) { var rm = Math.abs(K.roundTo(v, dp) - K.roundTo(a.v, dp)) < 1e-9 ? 0 : 1; if (rm * 1e9 + d < bd) { bd = rm * 1e9 + d; best = a; } } }
      if (best) return { code: best.code || 'alt', hint: best.hint };
      return base ? base(v) : null;
    };
    o.diagFirst = true;
    var inner = K.approx(x, dp, o);
    return function (resp) {
      var raw = String(resp == null ? '' : resp), plain = raw.replace(/\\(text|mathrm|operatorname)\{\s*([^{}]*)\}/g, '$2').replace(/\^\{?\\circ\}?|\\degree/g, '°').replace(/\\[,;: ]|~/g, ' '); plain = HW.parse.plain ? HW.parse.plain(plain) : plain;
      if (!HW.parse.number(raw).ok && /^\s*-?[\d.,\s]*\d\s*(°|\^\{?\\circ\}?|\\circ|\\degree|[a-zA-Z]{1,3}(\^\{?[23]\}?|²|³)?)\s*\.?\s*$/.test(plain)) {
        var num = plain.replace(/(°|\^\{?\\circ\}?|\\circ|\\degree|[a-zA-Z]{1,3}(\^\{?[23]\}?|²|³)?)\s*\.?\s*$/, '');
        if (HW.parse.number(num).ok) return K.form('units', 'Leave the unit out — just type the number' + (opt.unit ? ' (the unit is already after the box).' : '.'));
      }
      return inner(resp);
    };
  };
  K.P.near = function (prompt, x, dp, opt, sol, hints, text) {
    opt = opt || {};
    var p = K.P.approx(prompt, x, dp, { nr: opt.nr, before: opt.before, after: opt.unit || opt.after }, sol, hints, text);
    p.check = K.near(x, dp, opt);
    if (opt.unit && !opt.noUnitInAnswer) p.answer = t(HW.fmt(K.roundTo(x, dp).toFixed(Math.max(dp, 0)))) + (/^°/.test(opt.unit) ? '' : ' ') + esc(opt.unit);
    return p;
  };

  if (HW.addCodes) HW.addCodes({ units: 'Typed a unit in the box' });

  /* ---------------- HW.fig ---------------- */
  HW.fig = function (spec) {
    var pts = spec.pts || {}, ids = Object.keys(pts), maxW = spec.width || 300;
    var longest = 0; (spec.segs || []).forEach(function (sg) { if (typeof sg[2] === 'string' || typeof sg[2] === 'number') longest = Math.max(longest, String(sg[2]).length); });
    var pad = spec.pad == null ? Math.max(30, 16 + longest * 7.2) : spec.pad;
    var xs = [], ys = [];
    ids.forEach(function (k) { xs.push(pts[k][0]); ys.push(pts[k][1]); });
    (spec.extra || []).forEach(function (e) { ['at', 'from', 'to'].forEach(function (f) { if (e[f]) { xs.push(e[f][0]); ys.push(e[f][1]); } }); if (e.type === 'ground') { xs.push(e.x0, e.x1); ys.push(e.y); } if (e.h && e.at) ys.push(e.at[1] + e.h); });
    var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
    var spanX = Math.max(x1 - x0, 1e-6), spanY = Math.max(y1 - y0, 1e-6);
    var inner = maxW - 2 * pad, sc = inner / spanX;
    var maxH = spec.height || maxW * 1.1;
    if (spanY * sc > maxH - 2 * pad) sc = (maxH - 2 * pad) / spanY;
    var Wd = spanX * sc + 2 * pad, Ht = spanY * sc + 2 * pad;
    var X = function (x) { return pad + (x - x0) * sc; }, Y = function (y) { return pad + (y1 - y) * sc; };
    var P = function (k) { return [X(pts[k][0]), Y(pts[k][1])]; };
    var cx = 0, cy = 0; ids.forEach(function (k) { var p = P(k); cx += p[0] / ids.length; cy += p[1] / ids.length; });
    var s = '';
    (spec.fill || []).forEach(function (poly) { s += '<polygon points="' + poly.map(function (k) { return P(k).map(function (v) { return v.toFixed(1); }).join(','); }).join(' ') + '" fill="' + SOFT + '" stroke="none"/>'; });
    (spec.extra || []).forEach(function (e) {
      if (e.type === 'ground') s += '<line x1="' + X(e.x0).toFixed(1) + '" y1="' + Y(e.y).toFixed(1) + '" x2="' + X(e.x1).toFixed(1) + '" y2="' + Y(e.y).toFixed(1) + '" stroke="#8a7a5c" stroke-width="2.5"/>';
      else if (e.type === 'dash') s += '<line x1="' + X(e.from[0]).toFixed(1) + '" y1="' + Y(e.from[1]).toFixed(1) + '" x2="' + X(e.to[0]).toFixed(1) + '" y2="' + Y(e.to[1]).toFixed(1) + '" stroke="' + (e.color || '#6a7182') + '" stroke-width="1.5" stroke-dasharray="5 4"/>';
      else if (e.type === 'person') { var bx = X(e.at[0]), by = Y(e.at[1]), hh = (e.h || 1.6) * sc; s += '<g stroke="' + INK + '" stroke-width="1.8" fill="none" stroke-linecap="round"><circle cx="' + bx + '" cy="' + (by - hh + hh * 0.1) + '" r="' + (hh * 0.1) + '"/><line x1="' + bx + '" y1="' + (by - hh * 0.8) + '" x2="' + bx + '" y2="' + (by - hh * 0.38) + '"/><line x1="' + bx + '" y1="' + (by - hh * 0.38) + '" x2="' + (bx - hh * 0.12) + '" y2="' + by + '"/><line x1="' + bx + '" y1="' + (by - hh * 0.38) + '" x2="' + (bx + hh * 0.12) + '" y2="' + by + '"/><line x1="' + (bx - hh * 0.16) + '" y1="' + (by - hh * 0.62) + '" x2="' + (bx + hh * 0.16) + '" y2="' + (by - hh * 0.62) + '"/></g>'; }
      else if (e.type === 'building' || e.type === 'tower') { var w = (e.w || 1) * sc, hgt = (e.h || 1) * sc, ex = X(e.at[0]), ey = Y(e.at[1]); s += '<rect x="' + (ex - w / 2).toFixed(1) + '" y="' + (ey - hgt).toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + hgt.toFixed(1) + '" fill="#eef0f3" stroke="' + INK + '" stroke-width="1.4"/>'; }
      else if (e.type === 'tree') { var th = (e.h || 1) * sc, tx = X(e.at[0]), ty = Y(e.at[1]); s += '<line x1="' + tx + '" y1="' + ty + '" x2="' + tx + '" y2="' + (ty - th * 0.35) + '" stroke="#7a5a3a" stroke-width="3"/><polygon points="' + tx + ',' + (ty - th) + ' ' + (tx - th * 0.22) + ',' + (ty - th * 0.3) + ' ' + (tx + th * 0.22) + ',' + (ty - th * 0.3) + '" fill="#cfe5d3" stroke="#3d7a4f" stroke-width="1.3"/>'; }
      else if (e.type === 'eye') s += '<circle cx="' + X(e.at[0]) + '" cy="' + Y(e.at[1]) + '" r="3.5" fill="' + INK + '"/>';
    });
    (spec.segs || []).forEach(function (sg) {
      var a = P(sg[0]), b = P(sg[1]), o = (sg[3] && typeof sg[3] === 'object') ? sg[3] : (sg[2] && typeof sg[2] === 'object' ? sg[2] : {});
      s += '<line x1="' + a[0].toFixed(1) + '" y1="' + a[1].toFixed(1) + '" x2="' + b[0].toFixed(1) + '" y2="' + b[1].toFixed(1) + '" stroke="' + (o.color || INK) + '" stroke-width="' + (o.width || 2.2) + '"' + (o.dash ? ' stroke-dasharray="6 4"' : '') + ' stroke-linecap="round"/>';
    });
    (spec.right || []).forEach(function (r) {
      var c = P(r[0]), a = P(r[1]), b = P(r[2]), u = norm([a[0] - c[0], a[1] - c[1]]), v = norm([b[0] - c[0], b[1] - c[1]]), k = 11;
      s += '<polyline points="' + [c[0] + u[0] * k, c[1] + u[1] * k, c[0] + (u[0] + v[0]) * k, c[1] + (u[1] + v[1]) * k, c[0] + v[0] * k, c[1] + v[1] * k].map(function (q) { return q.toFixed(1); }).join(' ') + '" fill="none" stroke="' + INK + '" stroke-width="1.4"/>';
    });
    (spec.angles || []).forEach(function (an) {
      var V = P(an[0]), A = P(an[1]), B = P(an[2]), o = an[4] || {}, rr = o.r || 22, u = norm([A[0] - V[0], A[1] - V[1]]), v = norm([B[0] - V[0], B[1] - V[1]]);
      var a1 = Math.atan2(u[1], u[0]), a2 = Math.atan2(v[1], v[0]), d = a2 - a1; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
      var p1 = [V[0] + rr * Math.cos(a1), V[1] + rr * Math.sin(a1)], p2 = [V[0] + rr * Math.cos(a1 + d), V[1] + rr * Math.sin(a1 + d)];
      s += '<path d="M' + p1[0].toFixed(1) + ' ' + p1[1].toFixed(1) + ' A' + rr + ' ' + rr + ' 0 0 ' + (d > 0 ? 1 : 0) + ' ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1) + '" fill="none" stroke="' + (o.color || COL) + '" stroke-width="1.8"/>';
      if (an[3]) { var mid = a1 + d / 2, lr = rr + 9 + String(an[3]).length * 2.6; s += txt(V[0] + lr * Math.cos(mid), V[1] + lr * Math.sin(mid), an[3], { color: o.color || COL, size: 13 }); }
    });
    (spec.segs || []).forEach(function (sg) {
      var lab = typeof sg[2] === 'string' || typeof sg[2] === 'number' ? String(sg[2]) : null; if (!lab) return;
      var a = P(sg[0]), b = P(sg[1]), o = (sg[3] && typeof sg[3] === 'object') ? sg[3] : {}, m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      var n = norm([-(b[1] - a[1]), b[0] - a[0]]); if ((m[0] - cx) * n[0] + (m[1] - cy) * n[1] < 0) n = [-n[0], -n[1]]; if (o.side === -1) n = [-n[0], -n[1]];
      var anc = n[0] > 0.35 ? 'start' : n[0] < -0.35 ? 'end' : 'middle';
      s += txt(m[0] + n[0] * 10, m[1] + n[1] * 12, lab, { color: o.labelColor || INK, anchor: anc });
    });
    var names = spec.names === undefined ? true : spec.names;
    if (names) ids.forEach(function (k) {
      var nm = names === true ? k : names[k]; if (!nm) return;
      var p = P(k), d = norm([p[0] - cx, p[1] - cy]); if (!isFinite(d[0])) d = [0, -1];
      s += txt(p[0] + d[0] * 14, p[1] + d[1] * 14, nm, { weight: 600 });
    });
    (spec.extra || []).forEach(function (e) { if (e.type === 'text') s += txt(X(e.at[0]), Y(e.at[1]), e.text, { size: e.size || 13, color: e.color }); });
    return '<svg class="fig-svg" viewBox="0 0 ' + Wd.toFixed(0) + ' ' + Ht.toFixed(0) + '" width="100%" style="max-width:' + Wd.toFixed(0) + 'px" role="img" aria-label="' + esc(spec.aria || 'figure') + '">' + s + '</svg>';
  };
  function norm(v) { var L = Math.hypot(v[0], v[1]) || 1; return [v[0] / L, v[1] / L]; }

  /* ---------------- HW.tri: right triangle ---------------- */
  HW.tri = function (opt) {
    opt = opt || {};
    var w = opt.w || 4, h = opt.h || 3, nm = opt.names || ['A', 'B', 'C'];
    var raw = { A: [w, 0], B: [0, h], C: [0, 0] };
    var tr = function (p) { var x = p[0], y = p[1]; if (opt.flip) x = -x; for (var i = 0; i < ((opt.rot || 0) % 4 + 4) % 4; i++) { var q = x; x = -y; y = q; } return [x, y]; };
    var pts = {}; pts[nm[0]] = tr(raw.A); pts[nm[1]] = tr(raw.B); pts[nm[2]] = tr(raw.C);
    var sd = opt.sides || {}, segs = [[nm[1], nm[2], sd.a], [nm[0], nm[2], sd.b], [nm[0], nm[1], sd.c]].map(function (q) { return q[2] == null || q[2] === '' ? [q[0], q[1]] : q; });
    var angs = [], ag = opt.angles || {};
    if (ag.A) angs.push([nm[0], nm[1], nm[2], ag.A]); if (ag.B) angs.push([nm[1], nm[0], nm[2], ag.B]);
    var names = opt.hideNames ? false : true;
    if (opt.vertexLabels) names = opt.vertexLabels;
    return HW.fig({ pts: pts, segs: segs, right: [[nm[2], nm[0], nm[1]]], angles: angs, names: names, width: opt.width || 280, height: opt.height, aria: opt.aria || 'right triangle', extra: opt.extra, fill: opt.fill ? [[nm[0], nm[1], nm[2]]] : undefined });
  };

  /* ---------------- HW.solid: 3-D solids with dimension labels ---------------- */
  HW.solid = function (kind, opt) {
    opt = opt || {};
    var W = opt.width || 240, s = '', H = 200, line = function (a, b, o) { o = o || {}; return '<line x1="' + a[0].toFixed(1) + '" y1="' + a[1].toFixed(1) + '" x2="' + b[0].toFixed(1) + '" y2="' + b[1].toFixed(1) + '" stroke="' + (o.color || INK) + '" stroke-width="' + (o.w || 2) + '"' + (o.dash ? ' stroke-dasharray="5 4"' : '') + ' stroke-linecap="round"/>'; };
    var dim = function (a, b, lab, side) { // dimension label beside the segment a-b
      if (!lab) return ''; var m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], n = norm([-(b[1] - a[1]), b[0] - a[0]]); if (side) n = [n[0] * side, n[1] * side];
      return txt(m[0] + n[0] * 9, m[1] + n[1] * 13, lab, { size: 13, anchor: n[0] > 0.35 ? 'start' : n[0] < -0.35 ? 'end' : 'middle' });
    };
    var ell = function (cx, cy, rx, ry, half, dashBack) {
      if (!half) return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="none" stroke="' + INK + '" stroke-width="2"/>';
      return '<path d="M' + (cx - rx) + ' ' + cy + ' A' + rx + ' ' + ry + ' 0 0 0 ' + (cx + rx) + ' ' + cy + '" fill="none" stroke="' + INK + '" stroke-width="2"/>' +
        '<path d="M' + (cx - rx) + ' ' + cy + ' A' + rx + ' ' + ry + ' 0 0 1 ' + (cx + rx) + ' ' + cy + '" fill="none" stroke="' + INK + '" stroke-width="1.5"' + (dashBack ? ' stroke-dasharray="5 4"' : '') + '/>';
    };
    var rad = opt.r || null, dia = opt.d || null;
    if (kind === 'rectprism' || kind === 'cube') {
      var A = [22, 160], B = [142, 160], C = [142, 70], D = [22, 70], dx = 50, dy = -35, Bp = [B[0] + dx, B[1] + dy], Cp = [C[0] + dx, C[1] + dy], Dp = [D[0] + dx, D[1] + dy], Ap = [A[0] + dx, A[1] + dy];
      s += '<polygon points="' + [A, B, C, D].map(function (p) { return p.join(','); }).join(' ') + '" fill="#f4faf9" stroke="' + INK + '" stroke-width="2"/>';
      s += line(B, Bp) + line(C, Cp) + line(D, Dp) + line(Cp, Dp) + line(Bp, Cp) + line(A, Ap, { dash: 1, w: 1.4 }) + line(Ap, Bp, { dash: 1, w: 1.4 }) + line(Ap, Dp, { dash: 1, w: 1.4 });
      if (kind === 'cube') s += dim(A, B, opt.s, 1); else s += dim(A, B, opt.l, 1) + dim(B, Bp, opt.w, 1) + dim(Bp, Cp, opt.h, 1);
    } else if (kind === 'triprism') {
      var a = [30, 165], b = [130, 165], c = [80, 80], k = [80, -35], a2 = [a[0] + k[0], a[1] + k[1]], b2 = [b[0] + k[0], b[1] + k[1]], c2 = [c[0] + k[0], c[1] + k[1]];
      s += '<polygon points="' + [a, b, c].map(function (p) { return p.join(','); }).join(' ') + '" fill="#f4faf9" stroke="' + INK + '" stroke-width="2"/>';
      s += line(b, b2) + line(c, c2) + line(b2, c2) + line(a, a2, { dash: 1, w: 1.4 }) + line(a2, b2, { dash: 1, w: 1.4 }) + line(a2, c2, { dash: 1, w: 1.4 });
      if (opt.ht) s += line(c, [80, 165], { dash: 1, w: 1.3 }) + txt(84, 128, opt.ht, { size: 13, anchor: 'start' });
      s += dim(a, b, opt.b, 1) + dim(b, b2, opt.l, 1) + dim(a, c, opt.slant, -1);
    } else if (kind === 'cylinder') {
      var cx = 110, rx = 62, ry = 18, top = 45, bot = 160;
      s += '<rect x="' + (cx - rx) + '" y="' + top + '" width="' + (2 * rx) + '" height="' + (bot - top) + '" fill="#f4faf9" stroke="none"/>';
      s += ell(cx, top, rx, ry) + ell(cx, bot, rx, ry, true, true) + line([cx - rx, top], [cx - rx, bot]) + line([cx + rx, top], [cx + rx, bot]);
      if (rad) s += line([cx, top], [cx + rx, top], { w: 1.4 }) + '<circle cx="' + cx + '" cy="' + top + '" r="2.4" fill="' + INK + '"/>' + txt(cx + rx / 2, top - ry - 9, rad, { size: 13 });
      if (dia) s += line([cx - rx, top], [cx + rx, top], { w: 1.4 }) + txt(cx, top - ry - 9, dia, { size: 13 });
      if (opt.h) s += line([cx + rx + 14, top], [cx + rx + 14, bot], { w: 1.2, dash: 1 }) + txt(cx + rx + 18, (top + bot) / 2, opt.h, { size: 13, anchor: 'start' });
    } else if (kind === 'cone') {
      var cx2 = 110, rx2 = 62, ry2 = 18, apex = [cx2, 30], base = 160;
      s += '<polygon points="' + apex.join(',') + ' ' + (cx2 - rx2) + ',' + base + ' ' + (cx2 + rx2) + ',' + base + '" fill="#f4faf9" stroke="none"/>';
      s += ell(cx2, base, rx2, ry2, true, true) + line(apex, [cx2 - rx2, base]) + line(apex, [cx2 + rx2, base]);
      if (opt.h) s += line(apex, [cx2, base], { w: 1.3, dash: 1 }) + txt(cx2 - 8, (30 + base) / 2 + 10, opt.h, { size: 13, anchor: 'end' });
      if (rad) s += line([cx2, base], [cx2 + rx2, base], { w: 1.4 }) + txt(cx2 + rx2 / 2, base + ry2 + 10, rad, { size: 13 });
      if (dia) s += line([cx2 - rx2, base], [cx2 + rx2, base], { w: 1.4 }) + txt(cx2, base + ry2 + 10, dia, { size: 13 });
      if (opt.s) s += txt((apex[0] + cx2 + rx2) / 2 + 10, (apex[1] + base) / 2 - 4, opt.s, { size: 13, anchor: 'start' });
      if (opt.h && (rad || dia)) s += '<polyline points="' + cx2 + ',' + (base - 9) + ' ' + (cx2 + 9) + ',' + (base - 9) + ' ' + (cx2 + 9) + ',' + base + '" fill="none" stroke="' + INK + '" stroke-width="1.2"/>';
    } else if (kind === 'sqpyramid' || kind === 'rectpyramid') {
      var p1 = [40, 160], p2 = [150, 160], p3 = [195, 130], p4 = [85, 130], ap = [117, 30], ctr = [117, 145];
      s += '<polygon points="' + [ap, p1, p2, p3].map(function (p) { return p.join(','); }).join(' ') + '" fill="#f4faf9" stroke="none"/>';
      s += line(p1, p2) + line(p2, p3) + line(ap, p1) + line(ap, p2) + line(ap, p3) + line(p1, p4, { dash: 1, w: 1.4 }) + line(p4, p3, { dash: 1, w: 1.4 }) + line(ap, p4, { dash: 1, w: 1.4 });
      if (opt.h) s += line(ap, ctr, { dash: 1, w: 1.3 }) + txt(ctr[0] + 5, 106, opt.h, { size: 13, anchor: 'start' });
      if (opt.sl) { var mf = [(p1[0] + p2[0]) / 2, 160]; s += line(ap, mf, { dash: 1, w: 1.3, color: COL }) + txt((ap[0] + mf[0]) / 2 - 6, (ap[1] + mf[1]) / 2 - 6, opt.sl, { size: 13, anchor: 'end', color: COL }); }
      if (kind === 'sqpyramid') s += dim(p1, p2, opt.s, 1); else s += dim(p1, p2, opt.l, 1) + dim(p2, p3, opt.w, 1);
    } else if (kind === 'sphere' || kind === 'hemisphere') {
      var cx3 = 110, cy3 = kind === 'sphere' ? 100 : 130, r3 = 72;
      if (kind === 'sphere') s += '<circle cx="' + cx3 + '" cy="' + cy3 + '" r="' + r3 + '" fill="#f4faf9" stroke="' + INK + '" stroke-width="2"/>' + ell(cx3, cy3, r3, 11, true, true);
      else s += '<path d="M' + (cx3 - r3) + ' ' + cy3 + ' A' + r3 + ' ' + r3 + ' 0 0 1 ' + (cx3 + r3) + ' ' + cy3 + '" fill="#f4faf9" stroke="' + INK + '" stroke-width="2"/>' + ell(cx3, cy3, r3, 11);
      if (rad) s += line([cx3, cy3], [cx3 + r3, cy3], { w: 1.4 }) + '<circle cx="' + cx3 + '" cy="' + cy3 + '" r="2.6" fill="' + INK + '"/>' + txt(cx3 + r3 / 2, cy3 - 20, rad, { size: 13 });
      if (dia) s += line([cx3 - r3, cy3], [cx3 + r3, cy3], { w: 1.4 }) + txt(cx3, cy3 - 20, dia, { size: 13 });
    }
    return '<svg class="fig-svg" viewBox="-6 0 262 ' + H + '" width="100%" style="max-width:' + W + 'px" role="img" aria-label="' + esc(kind) + '">' + s + '</svg>';
  };
})(window);
