/* Drawing inputs and their checkers: a graph pad (points, lines with solid / open / arrow ends, joined points),
 * a number line (dots + shading), an arrow-diagram drawer and an algebra-tile builder.
 * Needs js/kit.js, js/kitx.js, js/poly.js, js/relfn.js (and js/widgets.js in the browser for the widgets).
 *
 * VALUES (what check() receives)
 *   graphpad: { pts: [[x,y],…], pieces: [{ v: [[x,y],…], s: 'closed'|'open'|'arrow'|'none', e: … }], join: 'none'|'curve' }
 *             pts = plotted points; pieces = lines drawn vertex to vertex (s = style of the first end, e = of the last).
 *   numline:  { dots: [{ x, open }], shade: [[lo, hi], …] }  (lo/hi null = −∞ / +∞)
 *   arrowpad: [[left, right], …]  (labels as strings)
 *   tilepad:  poly mode { x2, x, one } ; rect mode { top: { x, one }, side: { x, one } }  (negative = white tiles)
 *
 * GEOMETRY  HW.draw.geom(value) -> canonical point set: { lines: { key: { A, B, C, iv: [{lo,hi,lc,hc}] } }, pts: [[x,y]] }
 *   (each straight line A·x + B·y = C carries the union of what is drawn on it, as intervals of x — of y for a vertical
 *   line; arrows make ±∞; open dots make excluded ends). Two drawings of the same set compare equal.
 *   HW.draw.same(a, b), HW.draw.domain(value), HW.draw.range(value) -> { parts:[{lo,hi,lc,hc}] },
 *   HW.draw.notFunction(value) -> null or { x, ys }, HW.draw.contains(value, [x,y]), HW.draw.phases(value) (story graphs),
 *   HW.draw.numlineSet(value) -> parts, HW.draw.partsTex(parts, v), HW.draw.toGraph(value) -> { points, segs } for HW.graph.
 *
 * CHECKERS (all return K.ok / K.wrong / K.form)
 *   K.graphExact(target, opt)   the drawing must be the same point set as target (a value). opt.join: also compare
 *                               joined vs not joined (points mode); opt.wrong: [{ is: value, code, hint }].
 *   K.graphRules(rules, opt)    open questions: rules = { domain: setTex, range: setTex, fn: true|false, through: [[x,y]],
 *                               avoid: [[x,y]], pieces: n, custom: function (value) -> { code, hint } | null }.
 *   K.graphStory(spec)          story graphs, checked by shape: spec = { phases: [{ dir: 'up'|'flat'|'down', text,
 *                               x0, x1, y0, y1 }], tol, start, end }.  Steeper/gentler: phase.steeper = index of a phase
 *                               this one must be steeper than.
 *   K.numline(targetTex, opt)   number line must show the set (HW.sets notation, e.g. '\\{x\\mid x\\ge -2\\}').
 *   K.arrows(pairs, opt)        arrow diagram must have exactly these arrows.
 *   K.tilePoly(poly), K.tileRect(poly)  tile counts / a rectangle whose sides multiply to poly.
 * PART BUILDERS  K.P.graph(prompt, input, check, key, sol, hints, text, answerExtra), K.P.numline(prompt, input, targetTex,
 *   sol, hints, text, opt), K.P.arrows(prompt, input, pairs, sol, hints, text, opt), K.P.tiles(prompt, input, target, sol, hints, text).
 *   input = the widget options ({ type: 'graphpad', x:[…], y:[…], mode: 'points'|'lines', join, defaultEnd, tools, … }).
 */
(function (root) {
  'use strict';
  var HW = root.HW, K = HW.kit, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form, P = HW.poly;
  var D = HW.draw = {};
  var INF = Infinity;
  function r6(x) { return x === INF || x === -INF ? x : Math.round(x * 1e6) / 1e6; }
  function feq(a, b) { return a === b || Math.abs(a - b) < 1e-6; }
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var c = a % b; a = b; b = c; } return a || 1; }
  function nT(x) { x = r6(x); if (x === INF) return '\\infty'; if (x === -INF) return '-\\infty'; return String(x); }
  function ptT(p) { return '(' + nT(p[0]) + ',\\ ' + nT(p[1]) + ')'; }
  D.ptT = ptT;
  function sameP(p, q) { return feq(p[0], q[0]) && feq(p[1], q[1]); }

  /* ---------------- normalising a drawing ---------------- */
  D.norm = function (v) {
    v = v || {};
    var pts = [], pieces = [];
    (v.pts || []).forEach(function (p) { var q = [r6(+p[0]), r6(+p[1])]; if (isFinite(q[0]) && isFinite(q[1]) && !pts.some(function (z) { return sameP(z, q); })) pts.push(q); });
    (v.pieces || []).forEach(function (pc) {
      var vs = [];
      (pc.v || []).forEach(function (p) { var q = [r6(+p[0]), r6(+p[1])]; if (!isFinite(q[0]) || !isFinite(q[1])) return; if (!vs.length || !sameP(vs[vs.length - 1], q)) vs.push(q); });
      if (vs.length >= 2) pieces.push({ v: vs, s: pc.s || 'closed', e: pc.e || 'closed' });
      else if (vs.length === 1 && (pc.s || 'closed') !== 'open' && !pts.some(function (z) { return sameP(z, vs[0]); })) pts.push(vs[0]);
    });
    return { pts: pts, pieces: pieces, join: v.join || 'none' };
  };
  D.empty = function (v) { v = D.norm(v); return !v.pts.length && !v.pieces.length; };

  /* ---------------- geometry: the point set a drawing shows ---------------- */
  function lineOf(p, q) {
    var A = Math.round((q[1] - p[1]) * 1000), B = Math.round((p[0] - q[0]) * 1000), g = gcd(A, B);
    A /= g; B /= g; if (A < 0 || (A === 0 && B < 0)) { A = -A; B = -B; }
    return { A: A, B: B, C: r6(A * p[0] + B * p[1]), key: A + ',' + B + ',' + r6(A * p[0] + B * p[1]) };
  }
  function par(L, p) { return L.B !== 0 ? p[0] : p[1]; }   // position along the line: x, or y for a vertical line
  function onLine(L, p) { return Math.abs(L.A * p[0] + L.B * p[1] - L.C) < 1e-5; }
  function inIv(iv, u) { return (u > iv.lo + 1e-9 && u < iv.hi - 1e-9) || (feq(u, iv.lo) && iv.lc) || (feq(u, iv.hi) && iv.hc); }
  function mergeIv(list) {
    var a = list.slice().sort(function (p, q) { return p.lo - q.lo || (q.lc ? 1 : 0) - (p.lc ? 1 : 0); }), out = [];
    a.forEach(function (iv) {
      var last = out[out.length - 1];
      if (last && (iv.lo < last.hi - 1e-9 || (feq(iv.lo, last.hi) && (iv.lc || last.hc)))) {
        if (iv.hi > last.hi + 1e-9) { last.hi = iv.hi; last.hc = iv.hc; } else if (feq(iv.hi, last.hi)) last.hc = last.hc || iv.hc;
        if (feq(iv.lo, last.lo)) last.lc = last.lc || iv.lc;
      } else out.push({ lo: iv.lo, hi: iv.hi, lc: iv.lc, hc: iv.hc });
    });
    out.forEach(function (iv) { if (iv.lo === -INF) iv.lc = false; if (iv.hi === INF) iv.hc = false; });
    return out;
  }
  D.geom = function (value) {
    var v = D.norm(value), lines = {}, pts = [];
    function add(L, iv) { if (!lines[L.key]) lines[L.key] = { A: L.A, B: L.B, C: L.C, iv: [] }; lines[L.key].iv.push(iv); }
    v.pieces.forEach(function (pc) {
      var n = pc.v.length;
      for (var i = 0; i < n - 1; i++) {
        var p = pc.v[i], q = pc.v[i + 1], L = lineOf(p, q), up = par(L, p), uq = par(L, q);
        var sp = i === 0 ? pc.s : 'closed', sq = i === n - 2 ? pc.e : 'closed';
        var end = function (u, other, st) { if (st === 'arrow') return { u: u > other ? INF : -INF, c: false }; return { u: u, c: st !== 'open' }; };
        var a = end(up, uq, sp), b = end(uq, up, sq);
        add(L, a.u <= b.u ? { lo: a.u, hi: b.u, lc: a.c, hc: b.c } : { lo: b.u, hi: a.u, lc: b.c, hc: a.c });
      }
    });
    if (v.join !== 'none' && v.pts.length > 1) {   // points joined by a curve or line: treat as the polyline through them (sorted by x)
      var sp2 = v.pts.slice().sort(function (p, q) { return p[0] - q[0]; });
      for (var j = 0; j < sp2.length - 1; j++) { var L2 = lineOf(sp2[j], sp2[j + 1]), u0 = par(L2, sp2[j]), u1 = par(L2, sp2[j + 1]); add(L2, { lo: Math.min(u0, u1), hi: Math.max(u0, u1), lc: true, hc: true }); }
    }
    Object.keys(lines).forEach(function (k) { lines[k].iv = mergeIv(lines[k].iv); });
    v.pts.forEach(function (p) {
      var absorbed = false;
      Object.keys(lines).forEach(function (k) {
        var L = lines[k]; if (!onLine(L, p)) return; var u = par(L, p);
        if (L.iv.some(function (iv) { return inIv(iv, u); })) { absorbed = true; return; }
        if (L.iv.some(function (iv) { return feq(u, iv.lo) || feq(u, iv.hi); })) { L.iv = mergeIv(L.iv.concat([{ lo: u, hi: u, lc: true, hc: true }])); absorbed = true; }
      });
      if (!absorbed && !pts.some(function (z) { return sameP(z, p); })) pts.push(p);
    });
    pts.sort(function (p, q) { return p[0] - q[0] || p[1] - q[1]; });
    return { lines: lines, pts: pts };
  };
  function geomKey(g) {
    var ivs = function (iv) { return iv.map(function (z) { return (z.lc ? '[' : '(') + r6(z.lo) + ',' + r6(z.hi) + (z.hc ? ']' : ')'); }).join('u'); };
    return Object.keys(g.lines).sort().map(function (k) { return k + ':' + ivs(g.lines[k].iv); }).join(';') + '|' + g.pts.map(function (p) { return p.join(','); }).join(';');
  }
  D.same = function (a, b) { return geomKey(D.geom(a)) === geomKey(D.geom(b)); };
  D.contains = function (value, p) {
    var g = D.geom(value);
    if (g.pts.some(function (z) { return sameP(z, p); })) return true;
    return Object.keys(g.lines).some(function (k) { var L = g.lines[k]; return onLine(L, p) && L.iv.some(function (iv) { return inIv(iv, par(L, p)); }); });
  };
  /* pieces of the graph as x-intervals with a y-function (vertical lines kept separately) */
  function graphBits(g) {
    var bits = [], verts = [];
    Object.keys(g.lines).forEach(function (k) {
      var L = g.lines[k];
      L.iv.forEach(function (iv) {
        if (L.B === 0) verts.push({ x: L.C / L.A, lo: iv.lo, hi: iv.hi, lc: iv.lc, hc: iv.hc });
        else bits.push({ lo: iv.lo, hi: iv.hi, lc: iv.lc, hc: iv.hc, f: (function (A, B, C) { return function (x) { return (C - A * x) / B; }; })(L.A, L.B, L.C), slope: -L.A / L.B });
      });
    });
    g.pts.forEach(function (p) { bits.push({ lo: p[0], hi: p[0], lc: true, hc: true, f: (function (y) { return function () { return y; }; })(p[1]), slope: 0, point: true }); });
    verts.forEach(function (vt) { if (feq(vt.lo, vt.hi)) bits.push({ lo: vt.x, hi: vt.x, lc: true, hc: true, f: (function (y) { return function () { return y; }; })(vt.lo), slope: 0, point: true }); });
    return { bits: bits, verts: verts.filter(function (vt) { return !feq(vt.lo, vt.hi); }) };
  }
  D.notFunction = function (value) {
    var gb = graphBits(D.geom(value)), b = gb.bits;
    if (gb.verts.length) { var vt = gb.verts[0], y0 = isFinite(vt.lo) ? vt.lo : (isFinite(vt.hi) ? vt.hi - 2 : 0); return { x: vt.x, ys: [y0, isFinite(vt.hi) ? vt.hi : y0 + 1], vertical: true }; }
    for (var i = 0; i < b.length; i++) for (var j = i + 1; j < b.length; j++) {
      var lo = Math.max(b[i].lo, b[j].lo), hi = Math.min(b[i].hi, b[j].hi);
      if (hi > lo + 1e-9) { var x = isFinite(lo) && isFinite(hi) ? (lo + hi) / 2 : isFinite(lo) ? lo + 1 : isFinite(hi) ? hi - 1 : 0; return { x: x, ys: [b[i].f(x), b[j].f(x)] }; }
      if (feq(hi, lo) && isFinite(lo) && inIv(b[i], lo) && inIv(b[j], lo) && !feq(b[i].f(lo), b[j].f(lo))) return { x: lo, ys: [b[i].f(lo), b[j].f(lo)] };
    }
    return null;
  };
  function mergeParts(list) { return mergeIv(list); }
  D.domain = function (value) {
    var g = D.geom(value), out = [];
    Object.keys(g.lines).forEach(function (k) { var L = g.lines[k]; L.iv.forEach(function (iv) { if (L.B === 0) out.push({ lo: L.C / L.A, hi: L.C / L.A, lc: true, hc: true }); else out.push({ lo: iv.lo, hi: iv.hi, lc: iv.lc, hc: iv.hc }); }); });
    g.pts.forEach(function (p) { out.push({ lo: p[0], hi: p[0], lc: true, hc: true }); });
    return { parts: mergeParts(out) };
  };
  D.range = function (value) {
    var g = D.geom(value), out = [];
    Object.keys(g.lines).forEach(function (k) {
      var L = g.lines[k];
      L.iv.forEach(function (iv) {
        if (L.B === 0) { out.push({ lo: iv.lo, hi: iv.hi, lc: iv.lc, hc: iv.hc }); return; }
        if (L.A === 0) { out.push({ lo: L.C / L.B, hi: L.C / L.B, lc: true, hc: true }); return; }
        var f = function (x) { return x === INF || x === -INF ? ((-L.A / L.B) * (x === INF ? 1 : -1) > 0 ? INF : -INF) : (L.C - L.A * x) / L.B; };
        var a = { u: f(iv.lo), c: iv.lc }, b = { u: f(iv.hi), c: iv.hc };
        out.push(a.u <= b.u ? { lo: a.u, hi: b.u, lc: a.c, hc: b.c } : { lo: b.u, hi: a.u, lc: b.c, hc: a.c });
      });
    });
    g.pts.forEach(function (p) { out.push({ lo: p[1], hi: p[1], lc: true, hc: true }); });
    return { parts: mergeParts(out) };
  };
  /* a set in HW.sets form -> parts */
  D.setParts = function (set) {
    if (!set) return [];
    if (set.kind === 'list') return mergeParts(set.vals.map(function (v) { return { lo: v, hi: v, lc: true, hc: true }; }));
    return mergeParts(set.parts.map(function (p) { return { lo: p.lo, hi: p.hi, lc: p.lc, hc: p.hc }; }));
  };
  D.partsSame = function (a, b) {
    a = mergeParts(a); b = mergeParts(b);
    return a.length === b.length && a.every(function (p, i) { var q = b[i]; return feq(p.lo, q.lo) && feq(p.hi, q.hi) && (p.lo === -INF || p.lc === q.lc) && (p.hi === INF || p.hc === q.hc); });
  };
  D.partsTex = function (parts, v) {
    v = v || 'x';
    parts = mergeParts(parts);
    if (!parts.length) return '\\varnothing';
    if (parts.every(function (p) { return feq(p.lo, p.hi); })) return '\\{' + parts.map(function (p) { return nT(p.lo); }).join(',\\ ') + '\\}';
    return parts.map(function (p) {
      if (feq(p.lo, p.hi)) return v + '=' + nT(p.lo);
      if (p.lo === -INF && p.hi === INF) return v + '\\in\\mathbb{R}';
      if (p.lo === -INF) return v + (p.hc ? '\\le ' : '<') + nT(p.hi);
      if (p.hi === INF) return v + (p.lc ? '\\ge ' : '>') + nT(p.lo);
      return nT(p.lo) + (p.lc ? '\\le ' : '<') + v + (p.hc ? '\\le ' : '<') + nT(p.hi);
    }).join('\\text{ or }');
  };
  function parseSetTex(tex) { var r = HW.sets.parse(tex); if (!r.ok) throw new Error('bad set ' + tex); return D.setParts(r.set); }

  /* ---------------- story graphs: the drawing as left-to-right phases ---------------- */
  D.phases = function (value) {
    var g = D.geom(value), segs = [];
    Object.keys(g.lines).forEach(function (k) {
      var L = g.lines[k];
      L.iv.forEach(function (iv) { if (L.B === 0 || !isFinite(iv.lo) || !isFinite(iv.hi) || feq(iv.lo, iv.hi)) return; var f = function (x) { return (L.C - L.A * x) / L.B; }; segs.push({ x0: iv.lo, x1: iv.hi, y0: f(iv.lo), y1: f(iv.hi), m: -L.A / L.B }); });
    });
    segs.sort(function (a, b) { return a.x0 - b.x0; });
    var out = [];
    segs.forEach(function (s) { var last = out[out.length - 1]; if (last && feq(last.x1, s.x0) && feq(last.y1, s.y0) && feq(last.m, s.m)) { last.x1 = s.x1; last.y1 = s.y1; } else out.push({ x0: s.x0, x1: s.x1, y0: s.y0, y1: s.y1, m: s.m }); });
    out.forEach(function (s) { s.dir = Math.abs(s.m) < 1e-9 ? 'flat' : s.m > 0 ? 'up' : 'down'; });
    var gaps = []; for (var i = 1; i < out.length; i++) if (!feq(out[i - 1].x1, out[i].x0) || !feq(out[i - 1].y1, out[i].y0)) gaps.push(i);
    return { phases: out, gaps: gaps, vertical: Object.keys(g.lines).some(function (k) { return g.lines[k].B === 0; }) };
  };

  /* ---------------- number line -> set ---------------- */
  D.numlineParts = function (value) {
    value = value || {}; var dots = (value.dots || []).map(function (d) { return { x: r6(+d.x), open: !!d.open }; });
    var at = function (x) { return dots.filter(function (d) { return feq(d.x, x); })[0]; }, out = [];
    (value.shade || []).forEach(function (s) {
      var lo = s[0] == null ? -INF : +s[0], hi = s[1] == null ? INF : +s[1], dl = at(lo), dh = at(hi);
      out.push({ lo: lo, hi: hi, lc: !!(dl && !dl.open), hc: !!(dh && !dh.open) });
    });
    dots.forEach(function (d) { if (!d.open) out.push({ lo: d.x, hi: d.x, lc: true, hc: true }); });
    return mergeParts(out);
  };

  /* ---------------- drawing -> HW.graph spec (for answers and solutions) ---------------- */
  function smooth(pts) {   // Catmull-Rom through points sorted by x, sampled
    var p = pts.slice().sort(function (a, b) { return a[0] - b[0]; }), out = [];
    for (var i = 0; i < p.length - 1; i++) {
      var p0 = p[i - 1] || p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] || p2;
      for (var s = 0; s < 12; s++) { var u = s / 12, u2 = u * u, u3 = u2 * u; out.push([0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * u + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * u2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * u3), 0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * u + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * u2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * u3)]); }
    }
    out.push(p[p.length - 1]); return out;
  }
  D.smooth = smooth;
  D.toGraph = function (value, color) {
    var v = D.norm(value), segs = [], points = [];
    v.pieces.forEach(function (pc) { segs.push({ pts: pc.v, start: pc.s, end: pc.e, color: color }); });
    if (v.join === 'curve' && v.pts.length > 1) segs.push({ pts: smooth(v.pts), color: color });
    if (v.join === 'line' && v.pts.length > 1) segs.push({ pts: v.pts.slice().sort(function (a, b) { return a[0] - b[0]; }), color: color });
    v.pts.forEach(function (p) { points.push({ x: p[0], y: p[1], color: color }); });
    return { segs: segs, points: points };
  };
  D.graphOf = function (input, value, extra) {
    var spec = {}; Object.keys(input || {}).forEach(function (k) { if (k !== 'type') spec[k] = input[k]; });
    var bg = input.bg || {}, dv = D.toGraph(value);
    spec.segs = (bg.segs || []).concat(dv.segs); spec.points = (bg.points || []).concat(dv.points); spec.fns = bg.fns || [];
    Object.keys(extra || {}).forEach(function (k) { spec[k] = extra[k]; });
    return HW.graph(spec);
  };

  /* ---------------- checkers ---------------- */
  function emptyForm(v) { return D.empty(v) ? form('empty', 'Draw your answer on the grid first.') : null; }
  K.graphExact = function (target, opt) {
    opt = opt || {};
    var T = D.norm(target), Tk = geomKey(D.geom(T)), wrongs = (opt.wrong || []).map(function (w) { return { k: geomKey(D.geom(w.is)), code: w.code || 'diag', hint: w.hint }; }).filter(function (w) { return w.k !== Tk; });
    return function (resp) {
      var e = emptyForm(resp); if (e) return e;
      var S = D.norm(resp), Sk = geomKey(D.geom(S));
      if (opt.joinMatters && T.pts.length && (S.join === 'none') !== (T.join === 'none')) {
        var S2 = D.norm(resp); S2.join = T.join;
        if (geomKey(D.geom(S2)) === Tk) return wrong(T.join === 'none' ? 'graph-joined' : 'graph-not-joined', T.join === 'none' ? 'Your points are right — but here only these separate values make sense, so don’t join them.' : 'Your points are right — now join them: every value in between makes sense too.');
      }
      if (Sk === Tk) return ok();
      for (var i = 0; i < wrongs.length; i++) if (wrongs[i].k === Sk) return wrong(wrongs[i].code, wrongs[i].hint);
      // diagnoses
      var swap = function (v) { var n = D.norm(v); return { pts: n.pts.map(function (p) { return [p[1], p[0]]; }), pieces: n.pieces.map(function (pc) { return { v: pc.v.map(function (p) { return [p[1], p[0]]; }), s: pc.s, e: pc.e }; }), join: n.join }; };
      if (geomKey(D.geom(swap(S))) === Tk) return wrong('graph-swap', 'You swapped the coordinates: in ' + t('(x,\\ y)') + ' go <b>across</b> to ' + t('x') + ' first, then <b>up or down</b> to ' + t('y') + '.');
      var Tg = D.geom(T), Sg = D.geom(S);
      var strip = function (g) { var c = JSON.parse(JSON.stringify(g, function (k, v) { return v === INF ? 'inf' : v === -INF ? '-inf' : v; })); Object.keys(c.lines).forEach(function (k) { c.lines[k].iv.forEach(function (iv) { iv.lc = iv.hc = true; }); }); return JSON.stringify(c); };
      if (strip(Sg) === strip(Tg)) return wrong('graph-ends', 'The lines are in the right places — check the <b>ends</b>: a solid dot means the end point is included, an open dot means it isn’t.');
      if (T.pts.length && !T.pieces.length && T.join === 'none') {
        var miss = T.pts.filter(function (p) { return !S.pts.some(function (q) { return sameP(p, q); }); }), extra = S.pts.filter(function (p) { return !T.pts.some(function (q) { return sameP(p, q); }); });
        if (S.pieces.length) return wrong('graph-lines', 'Only plot the points here — no lines.');
        if (miss.length && !extra.length) return wrong('graph-missing', 'Correct so far — but you’re missing ' + (miss.length === 1 ? 'a point' : miss.length + ' points') + '.');
        if (extra.length && !miss.length) return wrong('graph-extra', (extra.length === 1 ? 'One point' : extra.length + ' points') + ' shouldn’t be there: ' + extra.slice(0, 3).map(function (p) { return t(ptT(p)); }).join(', ') + '.');
        if (extra.length) return wrong('graph-points', extra.length === 1 ? t(ptT(extra[0])) + ' isn’t right — check it.' : 'Some points are misplaced, e.g. ' + t(ptT(extra[0])) + '.');
      }
      var Tarrow = Object.keys(Tg.lines).some(function (k) { return Tg.lines[k].iv.some(function (iv) { return !isFinite(iv.lo) || !isFinite(iv.hi); }); }), Sarrow = Object.keys(Sg.lines).some(function (k) { return Sg.lines[k].iv.some(function (iv) { return !isFinite(iv.lo) || !isFinite(iv.hi); }); });
      var sameLines = Object.keys(Tg.lines).sort().join() === Object.keys(Sg.lines).sort().join() && Tg.pts.length === Sg.pts.length;
      if (sameLines && Tarrow && !Sarrow) return wrong('graph-arrows', 'Right line — but it keeps going: put <b>arrows</b> on the ends (use the Ends tool).');
      if (sameLines && !Tarrow && Sarrow) return wrong('graph-noarrow', 'Right line — but it stops: the ends should be dots, not arrows.');
      if (sameLines) return wrong('graph-length', 'Right line — check where it starts and stops.');
      return wrong('graph', null);
    };
  };
  K.graphRules = function (rules, opt) {
    opt = opt || {};
    var dom = rules.domain ? parseSetTex(rules.domain) : null, rng = rules.range ? parseSetTex(rules.range) : null, v = rules.v || 'x', w = rules.w || 'y';
    return function (resp) {
      var e = emptyForm(resp); if (e) return e;
      if (rules.fn === true) { var nf = D.notFunction(resp); if (nf) return wrong('rule-fn', 'Not a function: at ' + t(v + '=' + nT(nf.x)) + ' your graph has more than one ' + t(w) + '-value' + (nf.vertical ? ' (a vertical line)' : '') + '. Every input may have only one output.'); }
      if (rules.fn === false && !D.notFunction(resp)) return wrong('rule-notfn', 'That graph is a function (it passes the vertical line test). Draw one that isn’t: some ' + t(v) + '-value needs two ' + t(w) + '-values.');
      if (dom) { var d = D.domain(resp).parts; if (!D.partsSame(d, dom)) return wrong('rule-domain', 'Your graph’s domain is ' + t(D.partsTex(d, v)) + ', not ' + t(D.partsTex(dom, v)) + '. Look at how far left and right it goes, and at its end dots and arrows.'); }
      if (rng) { var r = D.range(resp).parts; if (!D.partsSame(r, rng)) return wrong('rule-range', 'Your graph’s range is ' + t(D.partsTex(r, w)) + ', not ' + t(D.partsTex(rng, w)) + '. Look at how low and high it goes, and at its end dots and arrows.'); }
      var th = (rules.through || []).filter(function (p) { return !D.contains(resp, p); })[0]; if (th) return wrong('rule-through', 'Your graph has to pass through ' + t(ptT(th)) + '.');
      var av = (rules.avoid || []).filter(function (p) { return D.contains(resp, p); })[0]; if (av) return wrong('rule-avoid', 'Your graph must not include ' + t(ptT(av)) + '.');
      if (rules.custom) { var h = rules.custom(D.norm(resp)); if (h) return wrong(h.code || 'rule', h.hint); }
      return ok();
    };
  };
  K.graphStory = function (spec) {
    var tol = spec.tol == null ? 1e-6 : spec.tol, word = { up: 'go up', flat: 'stay level', down: 'go down' };
    return function (resp) {
      var e = emptyForm(resp); if (e) return e;
      var ph = D.phases(resp);
      if (ph.vertical) return wrong('story-vertical', 'A vertical line would mean being in two places at once. Every moment needs exactly one value.');
      if (D.notFunction(resp)) return wrong('story-fn', 'Your graph goes back on itself: at one time it shows two values. Draw it left to right, one value at each time.');
      if (ph.gaps.length) return wrong('story-gap', 'Your graph has a jump or a gap — the pieces should join end to end.');
      var S = ph.phases, T = spec.phases, near = function (a, b) { return Math.abs(a - b) <= tol + 1e-9; };
      if (spec.start != null && S.length && !near(S[0].y0, spec.start)) return wrong('story-start', spec.startHint || 'Check where the graph starts.');
      // compare directions after grouping by direction
      var grp = function (arr) { var g = []; arr.forEach(function (p) { if (g.length && g[g.length - 1].dir === p.dir) g[g.length - 1].n++; else g.push({ dir: p.dir, n: 1 }); }); return g; };
      var gs = grp(S), gt = grp(T);
      if (gs.length !== gt.length || gs.some(function (g, i) { return g.dir !== gt[i].dir; })) {
        for (var i = 0; i < Math.min(gs.length, gt.length); i++) if (gs[i].dir !== gt[i].dir) { var ti = gt.slice(0, i).reduce(function (s, g) { return s + g.n; }, 0); return wrong('story-dir', 'Part ' + (ti + 1) + ' of the story' + (T[ti].text ? ' (' + T[ti].text + ')' : '') + ' should ' + word[T[ti].dir] + '.'); }
        if (gs.length < gt.length) { var mi = gt.slice(0, gs.length).reduce(function (s2, g2) { return s2 + g2.n; }, 0); return wrong('story-count', 'Good so far — but the story isn’t finished: next' + (T[mi].text ? ' (' + T[mi].text + ')' : '') + ' the graph should ' + word[T[mi].dir] + '.'); }
        return wrong('story-count', 'The story has ' + gt.length + ' stage' + (gt.length === 1 ? '' : 's') + ' (' + gt.map(function (g) { return word[g.dir]; }).join(', then ') + '); your graph has ' + gs.length + '.');
      }
      if (S.length !== T.length) return wrong('story-speed', 'The ups and downs are right — now show the change of speed: ' + T.map(function (p) { return p.text; }).filter(Boolean).join(', then ') + '.');
      for (var j = 0; j < T.length; j++) {
        var a = S[j], b = T[j];
        if (b.x0 != null && !near(a.x0, b.x0) || b.x1 != null && !near(a.x1, b.x1)) return wrong('story-time', 'Stage ' + (j + 1) + (b.text ? ' (' + b.text + ')' : '') + ' should run from ' + t(nT(b.x0)) + ' to ' + t(nT(b.x1)) + (spec.xUnit ? ' ' + spec.xUnit : '') + '.');
        if (b.y0 != null && !near(a.y0, b.y0) || b.y1 != null && !near(a.y1, b.y1)) return wrong('story-height', 'Stage ' + (j + 1) + (b.text ? ' (' + b.text + ')' : '') + ' should go from ' + t(nT(b.y0)) + ' to ' + t(nT(b.y1)) + (spec.yUnit ? ' ' + spec.yUnit : '') + '.');
        if (b.steeper != null && !(Math.abs(a.m) > Math.abs(S[b.steeper].m) + 1e-9)) return wrong('story-steep', 'Stage ' + (j + 1) + (b.text ? ' (' + b.text + ')' : '') + ' should be <b>steeper</b> than stage ' + (b.steeper + 1) + ' — faster means steeper.');
      }
      if (spec.end != null && !near(S[S.length - 1].y1, spec.end)) return wrong('story-end', spec.endHint || 'Check where the graph ends.');
      if (spec.custom) { var h = spec.custom(S, D.norm(resp)); if (h) return wrong(h.code || 'story', h.hint); }
      return ok();
    };
  };
  K.numline = function (targetTex, opt) {
    opt = opt || {};
    var T = typeof targetTex === 'string' ? parseSetTex(targetTex) : targetTex, v = opt.v || 'x';
    return function (resp) {
      resp = resp || {};
      if (!(resp.dots || []).length && !(resp.shade || []).length) return form('empty', 'Mark your answer on the number line first.');
      var S = D.numlineParts(resp);
      if ((resp.dots || []).some(function (d) { return d.open; }) && !(resp.shade || []).length) return form('nl-noshade', 'An open dot on its own shows nothing — shade the numbers that are included (use Shade).');
      if (D.partsSame(S, T)) return ok();
      var ends = function (ps) { return ps.map(function (p) { return [p.lo, p.hi]; }); };
      if (S.length === T.length && ends(S).every(function (e2, i) { return feq(e2[0], T[i].lo) && feq(e2[1], T[i].hi); })) return wrong('nl-dot', 'Right numbers — check the dots: a <b>solid</b> dot means the number is included (' + t('\\le') + ' or ' + t('\\ge') + '), an <b>open</b> dot means it isn’t (' + t('<') + ' or ' + t('>') + ').');
      var tEnds = [], sEnds = []; T.forEach(function (p) { [p.lo, p.hi].forEach(function (x) { if (isFinite(x)) tEnds.push(r6(x)); }); }); S.forEach(function (p) { [p.lo, p.hi].forEach(function (x) { if (isFinite(x)) sEnds.push(r6(x)); }); });
      var uq = function (a) { return a.filter(function (x, i) { return a.indexOf(x) === i; }).sort(function (p, q) { return p - q; }).join(); };
      if (uq(tEnds) === uq(sEnds)) return wrong('nl-side', 'Right boundary number' + (tEnds.length > 1 ? 's' : '') + ' — but the wrong side is shaded. Test a number: is it in the set?');
      return wrong('nl-values', 'Your number line shows ' + t(D.partsTex(S, v)) + '. Check the boundary number' + (tEnds.length > 1 ? 's' : '') + '.');
    };
  };
  function pairKey(p) { return String(p[0]).trim() + '→' + String(p[1]).trim(); }
  K.arrows = function (pairs, opt) {
    opt = opt || {};
    var T = {}; pairs.forEach(function (p) { T[pairKey(p)] = 1; });
    return function (resp) {
      resp = resp || []; if (!resp.length) return form('empty', 'Draw the arrows first: tap a value on the left, then its partner on the right.');
      var S = {}; resp.forEach(function (p) { S[pairKey(p)] = 1; });
      var miss = Object.keys(T).filter(function (k) { return !S[k]; }), extra = Object.keys(S).filter(function (k) { return !T[k]; });
      if (!miss.length && !extra.length) return ok();
      if (opt.diag) { var h = opt.diag(resp); if (h) return wrong(h.code || 'arrows', h.hint); }
      var rev = extra.filter(function (k) { var a = k.split('→'); return T[a[1] + '→' + a[0]]; });
      if (rev.length) return wrong('arrows-flip', 'An arrow goes from the first coordinate (input, left) to the second (output, right).');
      if (miss.length && !extra.length) return wrong('arrows-missing', 'Correct so far — you’re missing ' + (miss.length === 1 ? 'an arrow' : miss.length + ' arrows') + '. Check every pair.');
      if (extra.length && !miss.length) return wrong('arrows-extra', (extra.length === 1 ? 'One arrow doesn’t' : extra.length + ' arrows don’t') + ' match a pair: ' + extra.slice(0, 2).map(function (k) { return k.replace('→', ' → '); }).join(', ') + '.');
      return wrong('arrows', null);
    };
  };
  function tilePolyOf(v) { return P.add(P.add(P.mono([v.x2 || 0, 1], { x: 2 }), P.mono([v.x || 0, 1], { x: 1 })), P.num(v.one || 0)); }
  K.tilePoly = function (target) {
    var T = P.lift(target);
    return function (resp) {
      resp = resp || {}; if (!resp.x2 && !resp.x && !resp.one) return form('empty', 'Add some tiles first.');
      var S = tilePolyOf(resp); if (P.eq(S, T)) return ok();
      var c = function (p, k) { return (p[k] && p[k].c[0] / p[k].c[1]) || 0; }, names = [['x2', 'x^{2}'], ['x1', 'x'], ['', '1']];
      for (var i = 0; i < names.length; i++) { var a = c(S, names[i][0]), b = c(T, names[i][0]); if (a !== b) return wrong('tile-count', 'Check your ' + t(names[i][1]) + '-tiles: ' + (Math.abs(a) === Math.abs(b) ? 'right number, wrong colour (shaded = positive, white = negative).' : 'you have ' + Math.abs(a) + (a < 0 ? ' white' : a > 0 ? ' shaded' : '') + ', but ' + Math.abs(b) + (b < 0 ? ' white' : ' shaded') + (Math.abs(b) === 1 ? ' is' : ' are') + ' needed.')); }
      return wrong('tile', null);
    };
  };
  D.tileFactors = function (v) { v = v || {}; var a = v.top || {}, b = v.side || {}; return [P.add(P.mono([a.x || 0, 1], { x: 1 }), P.num(a.one || 0)), P.add(P.mono([b.x || 0, 1], { x: 1 }), P.num(b.one || 0))]; };
  K.tileRect = function (target) {
    var T = P.lift(target);
    return function (resp) {
      resp = resp || {}; var a = resp.top || {}, b = resp.side || {};
      if ((!a.x && !a.one) || (!b.x && !b.one)) return form('empty', 'Put tiles along the top and down the side to build the rectangle.');
      var f = D.tileFactors(resp), S = P.mul(f[0], f[1]); if (P.eq(S, T)) return ok();
      var c = function (p, k) { return (p[k] && p[k].c[0] / p[k].c[1]) || 0; };
      if (c(S, 'x2') !== c(T, 'x2')) return wrong('tile-x2', 'Your rectangle has ' + Math.abs(c(S, 'x2')) + ' ' + t('x^{2}') + '-tile' + (Math.abs(c(S, 'x2')) === 1 ? '' : 's') + ' inside, but there are ' + Math.abs(c(T, 'x2')) + '. The ' + t('x') + '-tiles on the top and side make the ' + t('x^{2}') + '-tiles.');
      if (c(S, '') !== c(T, '')) return wrong('tile-one', 'The unit tiles inside come from (unit tiles on top) × (unit tiles on the side). You need ' + t(String(c(T, ''))) + ' in all' + (c(T, '') < 0 ? ' (negative: one side has white unit tiles)' : '') + '.');
      return wrong('tile-x', 'The corners are right, but the ' + t('x') + '-tiles inside don’t match: you have ' + t(String(c(S, 'x1'))) + ', you need ' + t(String(c(T, 'x1'))) + '. Try a different split of the unit tiles.');
    };
  };
  if (HW.addCodes) HW.addCodes({ 'graph-swap': 'Plotted (y, x) instead of (x, y)', 'graph-ends': 'Wrong end dots (open vs solid)', 'graph-missing': 'Point missing', 'graph-extra': 'Extra point', 'graph-points': 'Point misplaced', 'graph-lines': 'Drew lines instead of points', 'graph-arrows': 'Arrows missing', 'graph-noarrow': 'Arrows where the graph stops', 'graph-length': 'Line too long / too short', 'graph-joined': 'Joined discrete points', 'graph-not-joined': 'Did not join continuous points', graph: 'Graph not right',
    'rule-fn': 'Drew a non-function', 'rule-notfn': 'Drew a function (non-function asked)', 'rule-domain': 'Wrong domain in sketch', 'rule-range': 'Wrong range in sketch', 'rule-through': 'Misses a required point', 'rule-avoid': 'Includes an excluded point',
    'story-vertical': 'Vertical line in a story graph', 'story-fn': 'Story graph goes back in time', 'story-gap': 'Gap in story graph', 'story-start': 'Wrong starting value', 'story-end': 'Wrong ending value', 'story-dir': 'A stage goes the wrong way', 'story-count': 'Wrong number of stages', 'story-speed': 'Speed change not shown', 'story-time': 'Stage at the wrong times', 'story-height': 'Stage at the wrong values', 'story-steep': 'Steepness wrong',
    'nl-dot': 'Open vs solid dot', 'nl-side': 'Shaded the wrong side', 'nl-values': 'Wrong boundary number', 'nl-noshade': 'Open dot without shading', 'arrows-flip': 'Arrows reversed', 'arrows-missing': 'Arrow missing', 'arrows-extra': 'Extra arrow', 'tile-count': 'Wrong tile count', 'tile-x2': 'Rectangle: wrong x²-tiles', 'tile-one': 'Rectangle: wrong unit tiles', 'tile-x': 'Rectangle: wrong x-tiles' });

  /* ---------------- part builders ---------------- */
  function inputOf(type, inp) { var o = { type: type }; Object.keys(inp || {}).forEach(function (k) { o[k] = inp[k]; }); return o; }
  K.P.graph = function (prompt, inp, check, key, sol, hints, text, answerExtra) {
    var I = inputOf('graphpad', inp);
    return { prompt: prompt, input: I, check: check, key: key, answer: D.graphOf(I, key, Object.assign({ max: 300 }, answerExtra || {})), solution: sol, hints: hints || [], text: text };
  };
  K.P.numline = function (prompt, inp, targetTex, sol, hints, text, opt) {
    var I = inputOf('numline', inp), parts = parseSetTex(targetTex), key = D.numlineKey(parts);
    return { prompt: prompt, input: I, check: K.numline(parts, opt), key: key, answer: D.numlineSvg(I, key) + '<div>' + t(D.partsTex(parts, (opt && opt.v) || 'x')) + '</div>', solution: sol, hints: hints || [], text: text };
  };
  K.P.arrows = function (prompt, inp, pairs, sol, hints, text, opt) {
    var I = inputOf('arrowpad', inp), key = pairs.map(function (p) { return [String(p[0]), String(p[1])]; });
    return { prompt: prompt, input: I, check: K.arrows(key, opt), key: key, answer: HW.arrowDiagram(I.left, I.right, key, { leftTitle: I.leftTitle, rightTitle: I.rightTitle }), solution: sol, hints: hints || [], text: text };
  };
  K.P.tiles = function (prompt, inp, target, sol, hints, text, key) {
    var I = inputOf('tilepad', inp), rect = I.mode === 'rect';
    return { prompt: prompt, input: I, check: rect ? K.tileRect(target) : K.tilePoly(target), key: key, answer: D.tileSvg(I, key), solution: sol, hints: hints || [], text: text };
  };
  /* a number-line value showing the given parts (the key) */
  D.numlineKey = function (parts) {
    var dots = [], shade = [];
    parts.forEach(function (p) {
      if (feq(p.lo, p.hi)) { dots.push({ x: p.lo, open: false }); return; }
      if (isFinite(p.lo)) dots.push({ x: p.lo, open: !p.lc }); if (isFinite(p.hi)) dots.push({ x: p.hi, open: !p.hc });
      shade.push([isFinite(p.lo) ? p.lo : null, isFinite(p.hi) ? p.hi : null]);
    });
    return { dots: dots, shade: shade };
  };

  /* ---------------- drawings shared by widgets and answers ---------------- */
  var COL = '#13807a', INK = '#2b3340';
  function endMark(kind, px, py, dx, dy, col) {
    col = col || COL;
    if (kind === 'closed') return '<circle cx="' + px + '" cy="' + py + '" r="4.6" fill="' + col + '"/>';
    if (kind === 'open') return '<circle cx="' + px + '" cy="' + py + '" r="4.6" fill="#fff" stroke="' + col + '" stroke-width="2.2"/>';
    if (kind === 'arrow') { var L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, bx = px - ux * 11, by = py - uy * 11; return '<path d="M' + px + ' ' + py + ' L' + (bx - uy * 6) + ' ' + (by + ux * 6) + ' L' + (bx + uy * 6) + ' ' + (by - ux * 6) + ' Z" fill="' + col + '"/>'; }
    return '';
  }
  D.nlLayout = function (I) {
    var min = I.min == null ? -5 : I.min, max = I.max == null ? 5 : I.max, W = 340, padX = 22, y = 30;
    var X = function (x) { return padX + (x - min) / (max - min) * (W - 2 * padX); };
    return { min: min, max: max, W: W, H: 58, padX: padX, y: y, X: X, step: I.step || 1, labels: I.labels || I.step || 1 };
  };
  D.numlineSvg = function (I, value, extraBody) {
    var L = D.nlLayout(I), X = L.X, y = L.y, s = '';
    s += '<line x1="' + (L.padX - 14) + '" y1="' + y + '" x2="' + (L.W - L.padX + 14) + '" y2="' + y + '" stroke="' + INK + '" stroke-width="1.6" marker-start="url(#nlA)" marker-end="url(#nlA)"/>';
    for (var x = Math.ceil(L.min / L.step) * L.step; x <= L.max + 1e-9; x += L.step) {
      var xr = r6(x), big = Math.abs(xr / L.labels - Math.round(xr / L.labels)) < 1e-6;
      s += '<line x1="' + X(xr) + '" y1="' + (y - (big ? 6 : 4)) + '" x2="' + X(xr) + '" y2="' + (y + (big ? 6 : 4)) + '" stroke="' + INK + '" stroke-width="1.2"/>';
      if (big) s += '<text x="' + X(xr) + '" y="' + (y + 20) + '" font-size="12" text-anchor="middle" fill="#6a7182">' + (xr < 0 ? '−' + Math.abs(xr) : xr) + '</text>';
    }
    value = value || {};
    (value.shade || []).forEach(function (sh) {
      var lo = sh[0] == null ? null : +sh[0], hi = sh[1] == null ? null : +sh[1], x0 = lo == null ? L.padX - 12 : X(lo), x1 = hi == null ? L.W - L.padX + 12 : X(hi);
      s += '<line x1="' + x0 + '" y1="' + y + '" x2="' + x1 + '" y2="' + y + '" stroke="' + COL + '" stroke-width="5" stroke-linecap="round" opacity=".9"/>';
      if (lo == null) s += endMark('arrow', L.padX - 16, y, -1, 0); if (hi == null) s += endMark('arrow', L.W - L.padX + 16, y, 1, 0);
    });
    (value.dots || []).forEach(function (d) { s += endMark(d.open ? 'open' : 'closed', X(+d.x), y, 0, 0); });
    var defs = '<defs><marker id="nlA" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="' + INK + '"/></marker></defs>';
    return '<svg class="fig-svg nl-svg" viewBox="0 0 ' + L.W + ' ' + L.H + '" style="max-width:' + L.W + 'px" role="img" aria-label="number line">' + defs + s + (extraBody || '') + '</svg>';
  };
  D.tileSvg = function (I, v) {
    v = v || {};
    if (I.mode === 'rect') {
      var tok = function (side) { var o = []; for (var i = 0; i < Math.abs(side.x || 0); i++) o.push((side.x < 0 ? '-' : '') + 'x'); for (var j = 0; j < Math.abs(side.one || 0); j++) o.push((side.one < 0 ? '-' : '') + '1'); return o; };
      var tp = tok(v.top || {}), sd = tok(v.side || {});
      return tp.length && sd.length ? HW.tiles.frame(tp, sd, { fill: true }) : '<div class="muted">No rectangle yet.</div>';
    }
    var toks = HW.tiles.count({ x2: v.x2 || 0, x: v.x || 0, one: v.one || 0 });
    return toks.length ? HW.tiles.row(toks) : '<div class="muted">No tiles yet.</div>';
  };

  /* ================= widgets (browser only) ================= */
  var W = HW.widgets; if (!W || typeof document === 'undefined') return;
  var el = HW.el;
  function btn(label, cls, title) { var b = el('button', 'dr-btn' + (cls ? ' ' + cls : ''), label); b.type = 'button'; if (title) b.title = title; return b; }
  function svgPoint(svg, ev) { var pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY; var m = svg.getScreenCTM(); return m ? pt.matrixTransform(m.inverse()) : { x: 0, y: 0 }; }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function fmtC(x) { x = r6(x); return x < 0 ? '−' + Math.abs(x) : String(x); }

  /* ---------- graph pad ---------- */
  W.graphpad = function (opt) {
    opt = opt || {};
    var mode = opt.mode || 'lines', tools = opt.tools || (mode === 'points' ? ['point'] : ['line', 'ends', 'point']), defEnd = opt.defaultEnd || 'closed';
    var spec = {}; Object.keys(opt).forEach(function (k) { if (['type', 'mode', 'tools', 'defaultEnd', 'join', 'snap', 'snapX', 'snapY', 'bg', 'help'].indexOf(k) < 0) spec[k] = opt[k]; });
    var bg = opt.bg || {}; spec.segs = bg.segs || []; spec.points = bg.points || []; spec.fns = bg.fns || []; spec.max = opt.max || 360;
    var wrap = el('div', 'w-graphpad'), bar = el('div', 'dr-bar'), board = el('div', 'dr-board'), coord = el('div', 'dr-coord'), help = el('div', 'w-help'), enter = null;
    board.innerHTML = HW.graph(spec); var Lt = HW.graph.last, svg = board.querySelector('svg'); board.appendChild(coord);
    svg.style.touchAction = 'none'; svg.classList.add('dr-svg');
    var NS = 'http://www.w3.org/2000/svg', layer = document.createElementNS(NS, 'g'), ghost = document.createElementNS(NS, 'g'); svg.appendChild(layer); svg.appendChild(ghost);
    var sx = opt.snapX || opt.snap || opt.grid || 1, sy = opt.snapY || opt.snap || opt.gridY || opt.grid || 1;
    var state = { pts: [], pieces: [], join: 'none' }, chain = null, tool = tools[0], hist = [], disabled = false;
    var toolBtns = {};
    var names = { point: '● Point', line: '╱ Line', ends: '●○ Ends' }, tips = { point: 'Tap to place a point. Tap a point again to remove it.', line: 'Tap where the line starts, then tap each next corner. Tap the last point again to finish.', ends: 'Tap the end of a line to change it: solid dot → open dot → arrow → nothing.' };
    if (tools.length > 1) tools.forEach(function (k) { var b = btn(names[k], 'dr-tool'); b.addEventListener('click', function () { setTool(k); }); toolBtns[k] = b; bar.appendChild(b); });
    var joinBtn = null;
    if (opt.join) { joinBtn = btn('Join: off', 'dr-tool', 'Join the points with a smooth curve'); joinBtn.addEventListener('click', function () { if (disabled) return; push(); state.join = state.join === 'none' ? 'curve' : 'none'; render(); }); bar.appendChild(joinBtn); }
    var undoB = btn('Undo', 'dr-act'), clearB = btn('Clear', 'dr-act');
    undoB.addEventListener('click', function () { if (disabled || !hist.length) return; state = JSON.parse(hist.pop()); chain = null; render(); });
    clearB.addEventListener('click', function () { if (disabled) return; push(); state = { pts: [], pieces: [], join: state.join }; chain = null; render(); });
    bar.appendChild(undoB); bar.appendChild(clearB);
    wrap.appendChild(bar); wrap.appendChild(board); wrap.appendChild(help);
    function setTool(k) { finishChain(); tool = k; Object.keys(toolBtns).forEach(function (n) { toolBtns[n].classList.toggle('on', n === k); }); help.innerHTML = opt.help || tips[k]; render(); }
    function push() { hist.push(JSON.stringify(state)); if (hist.length > 60) hist.shift(); }
    function finishChain() { if (chain != null) { var pc = state.pieces[chain]; if (pc && pc.v.length < 2) state.pieces.splice(chain, 1); chain = null; } }
    function toData(ev) {
      var p = svgPoint(svg, ev), x = Lt.xr[0] + (p.x - Lt.padL) / Lt.ux, y = Lt.yr[1] - (p.y - Lt.padT) / Lt.uy;
      x = Math.round(x / sx) * sx; y = Math.round(y / sy) * sy;
      x = Math.max(Lt.xr[0], Math.min(Lt.xr[1], r6(x))); y = Math.max(Lt.yr[0], Math.min(Lt.yr[1], r6(y)));
      return [r6(x), r6(y)];
    }
    function act(P0) {
      if (tool === 'point') {
        push(); var i = state.pts.findIndex(function (q) { return sameP(q, P0); });
        if (i >= 0) state.pts.splice(i, 1); else state.pts.push(P0);
      } else if (tool === 'line') {
        if (chain == null) {
          push();
          var hit = -1; state.pieces.forEach(function (pc, k) { if (hit < 0 && sameP(pc.v[pc.v.length - 1], P0)) hit = k; else if (hit < 0 && sameP(pc.v[0], P0)) { pc.v.reverse(); var tmp = pc.s; pc.s = pc.e; pc.e = tmp; hit = k; } });
          if (hit >= 0) chain = hit; else { state.pieces.push({ v: [P0], s: defEnd, e: defEnd }); chain = state.pieces.length - 1; }
        } else {
          var pc = state.pieces[chain], last = pc.v[pc.v.length - 1];
          if (sameP(last, P0)) finishChain(); else { push(); pc.v.push(P0); }
        }
      } else if (tool === 'ends') {
        var order = ['closed', 'open', 'arrow', 'none'], done = false;
        state.pieces.forEach(function (pc) {
          if (done || pc.v.length < 2) return;
          if (sameP(pc.v[0], P0)) { push(); pc.s = order[(order.indexOf(pc.s) + 1) % 4]; done = true; }
          else if (sameP(pc.v[pc.v.length - 1], P0)) { push(); pc.e = order[(order.indexOf(pc.e) + 1) % 4]; done = true; }
        });
        if (!done) { help.innerHTML = '<b>Tap the end of a line</b> to change it.'; return; }
      }
      render();
    }
    function render() {
      var X = Lt.X, Y = Lt.Y, s = '';
      if (state.join !== 'none' && state.pts.length > 1) { var sm = smooth(state.pts); s += '<polyline points="' + sm.map(function (p) { return X(p[0]).toFixed(1) + ',' + Y(p[1]).toFixed(1); }).join(' ') + '" fill="none" stroke="' + COL + '" stroke-width="2.6"/>'; }
      state.pieces.forEach(function (pc, k) {
        if (pc.v.length >= 2) s += '<polyline points="' + pc.v.map(function (p) { return X(p[0]) + ',' + Y(p[1]); }).join(' ') + '" fill="none" stroke="' + COL + '" stroke-width="2.8" stroke-linejoin="round" stroke-linecap="round"/>';
        pc.v.forEach(function (p, i) { if (i > 0 && i < pc.v.length - 1) s += '<circle cx="' + X(p[0]) + '" cy="' + Y(p[1]) + '" r="2.4" fill="' + COL + '"/>'; });
        if (pc.v.length >= 2) {
          var a = pc.v[0], b = pc.v[1], z = pc.v[pc.v.length - 1], y2 = pc.v[pc.v.length - 2];
          s += endMark(pc.s, X(a[0]), Y(a[1]), X(a[0]) - X(b[0]), Y(a[1]) - Y(b[1])) + endMark(pc.e, X(z[0]), Y(z[1]), X(z[0]) - X(y2[0]), Y(z[1]) - Y(y2[1]));
        }
        if (k === chain) { var lv = pc.v[pc.v.length - 1]; s += '<circle cx="' + X(lv[0]) + '" cy="' + Y(lv[1]) + '" r="7" fill="none" stroke="#c4532a" stroke-width="2"/>'; }
      });
      state.pts.forEach(function (p) { s += '<circle cx="' + X(p[0]) + '" cy="' + Y(p[1]) + '" r="5" fill="' + COL + '"/>'; });
      layer.innerHTML = s;
      if (joinBtn) { joinBtn.textContent = state.join === 'none' ? 'Join: off' : 'Join: on'; joinBtn.classList.toggle('on', state.join !== 'none'); }
      undoB.disabled = !hist.length;
    }
    function showGhost(p) { if (!p) { ghost.innerHTML = ''; coord.style.display = 'none'; return; } ghost.innerHTML = '<circle cx="' + Lt.X(p[0]) + '" cy="' + Lt.Y(p[1]) + '" r="9" fill="rgba(196,83,42,.12)" stroke="#c4532a" stroke-width="1.6" stroke-dasharray="3 2"/>'; coord.textContent = '(' + fmtC(p[0]) + ', ' + fmtC(p[1]) + ')'; coord.style.display = 'block'; }
    var down = false, curP = null;
    svg.addEventListener('pointerdown', function (ev) { if (disabled) return; ev.preventDefault(); down = true; try { svg.setPointerCapture(ev.pointerId); } catch (e) {} curP = toData(ev); showGhost(curP); });
    svg.addEventListener('pointermove', function (ev) { if (disabled) return; if (down || ev.pointerType === 'mouse') { curP = toData(ev); showGhost(curP); } });
    svg.addEventListener('pointerup', function (ev) { if (disabled || !down) return; down = false; curP = toData(ev); if (ev.pointerType !== 'mouse') showGhost(null); act(curP); });
    svg.addEventListener('pointercancel', function () { down = false; showGhost(null); });
    svg.addEventListener('pointerleave', function (ev) { if (ev.pointerType === 'mouse' && !down) showGhost(null); });
    setTool(tool);
    var api = { node: wrap, kind: 'graphpad' };
    api.value = function () { var v = clone(state); v.pieces = v.pieces.filter(function (pc) { return pc.v.length >= 2; }); return v; };
    api.set = function (v) { state = clone(D.norm(v)); chain = null; render(); };
    api.clear = function () { state = { pts: [], pieces: [], join: 'none' }; chain = null; hist = []; render(); };
    api.disable = function (on) { disabled = !!on; wrap.classList.toggle('off', disabled); if (on) { finishChain(); showGhost(null); render(); } };
    api.focus = function () {}; api.onEnter = function (fn) { enter = fn; };
    return api;
  };
  W.graphpad.text = function (v) {
    v = D.norm(v); var out = [];
    if (v.pts.length) out.push('points ' + v.pts.map(function (p) { return '(' + p[0] + ', ' + p[1] + ')'; }).join(' ') + (v.join !== 'none' ? ' joined' : ''));
    var sym = { closed: '●', open: '○', arrow: '→', none: '' };
    v.pieces.forEach(function (pc) { out.push('line ' + sym[pc.s] + pc.v.map(function (p) { return '(' + p[0] + ', ' + p[1] + ')'; }).join('–') + sym[pc.e]); });
    return out.join('; ');
  };
  W.graphpad.html = function (v, I) { return D.graphOf(I, v, { max: 220 }); };

  /* ---------- number line ---------- */
  W.numline = function (opt) {
    opt = opt || {};
    var L = D.nlLayout(opt), wrap = el('div', 'w-numline'), bar = el('div', 'dr-bar'), board = el('div', 'dr-board'), help = el('div', 'w-help'), coord = el('div', 'dr-coord');
    var state = { dots: [], shade: [] }, tool = 'dot', hist = [], disabled = false, snap = opt.snap || L.step;
    var bDot = btn('● Dot', 'dr-tool'), bSh = btn('▬ Shade', 'dr-tool'), undoB = btn('Undo', 'dr-act'), clearB = btn('Clear', 'dr-act');
    [bDot, bSh, undoB, clearB].forEach(function (b) { bar.appendChild(b); });
    wrap.appendChild(bar); wrap.appendChild(board); wrap.appendChild(help); board.appendChild(coord);
    var tips = { dot: 'Tap a number to put a solid dot; tap it again for an open dot; a third tap removes it.', shade: 'Tap a stretch of the line to shade it (tap again to unshade). The dots split the line into stretches.' };
    function setTool(k) { tool = k; bDot.classList.toggle('on', k === 'dot'); bSh.classList.toggle('on', k === 'shade'); help.innerHTML = tips[k]; }
    bDot.addEventListener('click', function () { setTool('dot'); }); bSh.addEventListener('click', function () { setTool('shade'); });
    undoB.addEventListener('click', function () { if (disabled || !hist.length) return; state = JSON.parse(hist.pop()); render(); });
    clearB.addEventListener('click', function () { if (disabled) return; push(); state = { dots: [], shade: [] }; render(); });
    function push() { hist.push(JSON.stringify(state)); }
    function bounds() { return state.dots.map(function (d) { return d.x; }).sort(function (a, b) { return a - b; }); }
    function prune() { var bs = bounds(); state.shade = state.shade.filter(function (s) { var lo = s[0], hi = s[1]; var i = lo == null ? -1 : bs.indexOf(lo), j = hi == null ? bs.length : bs.indexOf(hi); return (lo == null || i >= 0) && (hi == null || j >= 0) && j === i + 1; }); }
    function render() {
      var s = D.numlineSvg(opt, state);
      board.innerHTML = ''; board.insertAdjacentHTML('afterbegin', s); board.appendChild(coord);
      var svg = board.querySelector('svg'); svg.style.touchAction = 'none'; svg.classList.add('dr-svg'); bind(svg);
      undoB.disabled = !hist.length;
    }
    function xOf(svg, ev) { var p = svgPoint(svg, ev); return (p.x - L.padX) / (L.W - 2 * L.padX) * (L.max - L.min) + L.min; }
    function bind(svg) {
      var down = false;
      svg.addEventListener('pointerdown', function (ev) { if (disabled) return; ev.preventDefault(); down = true; show(xOf(svg, ev)); });
      svg.addEventListener('pointermove', function (ev) { if (!disabled && (down || ev.pointerType === 'mouse')) show(xOf(svg, ev)); });
      svg.addEventListener('pointerup', function (ev) { if (disabled || !down) return; down = false; coord.style.display = 'none'; act(xOf(svg, ev)); });
      svg.addEventListener('pointerleave', function () { if (!down) coord.style.display = 'none'; });
    }
    function show(x) { if (tool !== 'dot') { coord.style.display = 'none'; return; } var v = r6(Math.round(x / snap) * snap); v = Math.max(L.min, Math.min(L.max, v)); coord.textContent = fmtC(v); coord.style.display = 'block'; }
    function act(x) {
      if (tool === 'dot') {
        var v = r6(Math.max(L.min, Math.min(L.max, Math.round(x / snap) * snap))), i = state.dots.findIndex(function (d) { return feq(d.x, v); });
        push();
        if (i < 0) state.dots.push({ x: v, open: false }); else if (!state.dots[i].open) state.dots[i].open = true; else { state.dots.splice(i, 1); prune(); }
      } else {
        var bs = bounds(), lo = null, hi = null;
        bs.forEach(function (b) { if (b <= x) lo = b; }); bs.slice().reverse().forEach(function (b) { if (b > x) hi = b; });
        if (lo != null && Math.abs(x - lo) < 1e-9) return;
        push();
        var k = state.shade.findIndex(function (s) { return s[0] === lo && s[1] === hi; });
        if (k >= 0) state.shade.splice(k, 1); else state.shade.push([lo, hi]);
      }
      render();
    }
    setTool('dot'); render();
    var api = { node: wrap, kind: 'numline' };
    api.value = function () { return clone(state); };
    api.set = function (v) { state = clone(v || { dots: [], shade: [] }); render(); };
    api.clear = function () { state = { dots: [], shade: [] }; hist = []; render(); };
    api.disable = function (on) { disabled = !!on; wrap.classList.toggle('off', disabled); };
    api.focus = function () {}; api.onEnter = function () {};
    return api;
  };
  W.numline.text = function (v) { try { return D.partsTex(D.numlineParts(v)).replace(/\\le /g, '≤').replace(/\\ge /g, '≥').replace(/\\infty/g, '∞').replace(/\\text\{ or \}/g, ' or ').replace(/\\in\\mathbb\{R\}/g, '∈ℝ').replace(/\\[{}]/g, function (m) { return m.slice(1); }).replace(/\\ /g, ' ').replace(/\\varnothing/, '∅'); } catch (e) { return ''; } };
  W.numline.html = function (v, I) { return D.numlineSvg(I, v); };

  /* ---------- arrow-diagram drawer ---------- */
  W.arrowpad = function (opt) {
    opt = opt || {};
    var left = (opt.left || []).map(String), right = (opt.right || []).map(String), wrap = el('div', 'w-arrowpad'), bar = el('div', 'dr-bar'), board = el('div', 'dr-board'), help = el('div', 'w-help');
    var state = [], sel = null, hist = [], disabled = false;
    var undoB = btn('Undo', 'dr-act'), clearB = btn('Clear', 'dr-act'); bar.appendChild(undoB); bar.appendChild(clearB);
    undoB.addEventListener('click', function () { if (disabled || !hist.length) return; state = JSON.parse(hist.pop()); sel = null; render(); });
    clearB.addEventListener('click', function () { if (disabled) return; hist.push(JSON.stringify(state)); state = []; sel = null; render(); });
    help.innerHTML = opt.help || 'Tap a value on the left, then the value it goes to on the right. Tap the same two again to remove that arrow.';
    wrap.appendChild(bar); wrap.appendChild(board); wrap.appendChild(help);
    function render() {
      var n = Math.max(left.length, right.length), rowH = 40, H = n * rowH + 40, lw = Math.max(40, Math.max.apply(null, left.concat(['']).map(function (s) { return s.length; })) * 4.8 + 18), rw = Math.max(40, Math.max.apply(null, right.concat(['']).map(function (s) { return s.length; })) * 4.8 + 18);
      var lx = lw + 10, Wd = Math.max(300, lx + lw + 110 + rw + 10), rx = Wd - rw - 10;
      var ly = function (i) { return 30 + (i + 0.5) * (n * rowH / left.length); }, ry = function (i) { return 30 + (i + 0.5) * (n * rowH / right.length); };
      var s = '<rect width="' + Wd + '" height="' + H + '" fill="#fff"/>';
      s += '<ellipse cx="' + lx + '" cy="' + (30 + n * rowH / 2) + '" rx="' + lw + '" ry="' + (n * rowH / 2 + 8) + '" fill="#f6f4ef" stroke="' + INK + '" stroke-width="1.4"/><ellipse cx="' + rx + '" cy="' + (30 + n * rowH / 2) + '" rx="' + rw + '" ry="' + (n * rowH / 2 + 8) + '" fill="#f6f4ef" stroke="' + INK + '" stroke-width="1.4"/>';
      if (opt.leftTitle) s += '<text x="' + lx + '" y="14" font-size="13" text-anchor="middle" fill="' + INK + '">' + HW.esc(opt.leftTitle) + '</text>';
      if (opt.rightTitle) s += '<text x="' + rx + '" y="14" font-size="13" text-anchor="middle" fill="' + INK + '">' + HW.esc(opt.rightTitle) + '</text>';
      state.forEach(function (p) { var i = left.indexOf(p[0]), j = right.indexOf(p[1]); if (i < 0 || j < 0) return; var x1 = lx + lw - 12, y1 = ly(i), x2 = rx - rw + 12, y2 = ry(j); s += '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + (x2 - 4) + '" y2="' + y2 + '" stroke="' + COL + '" stroke-width="2"/>' + endMark('arrow', x2, y2, x2 - x1, y2 - y1); });
      left.forEach(function (v, i) { var on = sel && sel.side === 'L' && sel.i === i; s += '<g class="ap-hit" data-side="L" data-i="' + i + '"><rect x="' + (lx - lw + 8) + '" y="' + (ly(i) - 16) + '" width="' + (2 * lw - 16) + '" height="32" rx="10" fill="' + (on ? '#e3f1ef' : 'transparent') + '" stroke="' + (on ? COL : 'none') + '" stroke-width="2"/><text x="' + lx + '" y="' + (ly(i) + 5) + '" font-size="15" text-anchor="middle" fill="#1c2230">' + HW.esc(v.replace(/^-/, '−')) + '</text></g>'; });
      right.forEach(function (v, j) { var on = sel && sel.side === 'R' && sel.i === j; s += '<g class="ap-hit" data-side="R" data-i="' + j + '"><rect x="' + (rx - rw + 8) + '" y="' + (ry(j) - 16) + '" width="' + (2 * rw - 16) + '" height="32" rx="10" fill="' + (on ? '#e3f1ef' : 'transparent') + '" stroke="' + (on ? COL : 'none') + '" stroke-width="2"/><text x="' + rx + '" y="' + (ry(j) + 5) + '" font-size="15" text-anchor="middle" fill="#1c2230">' + HW.esc(v.replace(/^-/, '−')) + '</text></g>'; });
      board.innerHTML = '<svg class="fig-svg dr-svg" viewBox="0 0 ' + Wd + ' ' + H + '" style="max-width:' + Wd + 'px" role="img" aria-label="arrow diagram to draw">' + s + '</svg>';
      Array.prototype.forEach.call(board.querySelectorAll('.ap-hit'), function (g) { g.style.cursor = 'pointer'; g.addEventListener('click', function () { tap(g.getAttribute('data-side'), +g.getAttribute('data-i')); }); });
      undoB.disabled = !hist.length;
    }
    function tap(side, i) {
      if (disabled) return;
      if (!sel || sel.side === side) { sel = sel && sel.side === side && sel.i === i ? null : { side: side, i: i }; render(); return; }
      var l = side === 'L' ? left[i] : left[sel.i], r = side === 'R' ? right[i] : right[sel.i];
      hist.push(JSON.stringify(state));
      var k = state.findIndex(function (p) { return p[0] === l && p[1] === r; }); if (k >= 0) state.splice(k, 1); else state.push([l, r]);
      sel = null; render();
    }
    render();
    var api = { node: wrap, kind: 'arrowpad' };
    api.value = function () { return clone(state); }; api.set = function (v) { state = clone(v || []); render(); };
    api.clear = function () { state = []; hist = []; sel = null; render(); }; api.disable = function (on) { disabled = !!on; wrap.classList.toggle('off', disabled); };
    api.focus = function () {}; api.onEnter = function () {};
    return api;
  };
  W.arrowpad.text = function (v) { return (v || []).map(function (p) { return p[0] + '→' + p[1]; }).join(', '); };
  W.arrowpad.html = function (v, I) { return HW.arrowDiagram(I.left, I.right, v || [], { leftTitle: I.leftTitle, rightTitle: I.rightTitle }); };

  /* ---------- algebra-tile builder: tap a tile to add it, or drag it into place; tap a placed tile to remove it ---------- */
  var TCOL = { pos: '#9aa3ad', neg: '#ffffff', stroke: '#2b3340' };
  function tileChip(tok, scale) {
    var neg = tok.charAt(0) === '-', k = tok.replace('-', ''), s = scale || 1, w = k === 'x2' ? 26 : k === 'x' ? 9 : 9, h = k === 'x2' ? 26 : k === 'x' ? 26 : 9;
    if (k === 'xh') { w = 26; h = 9; }
    return '<svg viewBox="0 0 ' + (w + 2) + ' ' + (h + 2) + '" width="' + (w + 2) * s + '" height="' + (h + 2) * s + '" aria-hidden="true"><rect x="1" y="1" width="' + w + '" height="' + h + '" rx="1.5" fill="' + (neg ? TCOL.neg : TCOL.pos) + '" stroke="' + TCOL.stroke + '" stroke-width="1.3"/></svg>';
  }
  var TLAB = { x2: 'x^{2}', '-x2': '-x^{2}', x: 'x', '-x': '-x', '1': '1', '-1': '-1' };
  function sortToks(a) { var order = { x2: 0, '-x2': 1, x: 2, '-x': 3, '1': 4, '-1': 5 }; return a.slice().sort(function (p, q) { return order[p] - order[q]; }); }
  function countsOf(a) { var c = { x2: 0, x: 0, one: 0 }; a.forEach(function (tk) { var n = tk.charAt(0) === '-' ? -1 : 1, k = tk.replace('-', ''); if (k === 'x2') c.x2 += n; else if (k === 'x') c.x += n; else c.one += n; }); return c; }
  W.tilepad = function (opt) {
    opt = opt || {};
    var rect = opt.mode === 'rect', wrap = el('div', 'w-tilepad'), pal = el('div', 'tp-pal'), zonesBox = el('div', 'tp-zones'), view = el('div', 'tp-view'), bar = el('div', 'dr-bar'), help = el('div', 'w-help');
    var disabled = false, hist = [], zones = rect ? ['top', 'side'] : ['mat'], active = zones[0];
    var state = rect ? { top: [], side: [] } : { mat: [] }, lim = opt.limit || 12;
    var kinds = rect ? ['x', '-x', '1', '-1'] : ['x2', '-x2', 'x', '-x', '1', '-1'];
    kinds.forEach(function (k) {
      var b = el('button', 'tp-tile'); b.type = 'button'; b.setAttribute('data-tok', k); b.title = 'Add a ' + (k.charAt(0) === '-' ? 'negative ' : '') + k.replace('-', '').replace('x2', 'x²') + '-tile';
      b.innerHTML = tileChip(rect && k.replace('-', '') === 'x' ? (k.charAt(0) === '-' ? '-x' : 'x') : k, 1.2) + '<span>' + HW.k(TLAB[k]) + '</span>';
      pal.appendChild(b);
    });
    var zoneEls = {};
    zones.forEach(function (z) {
      var box = el('div', 'tp-zone'); box.setAttribute('data-zone', z);
      box.innerHTML = '<div class="tp-zlab">' + (z === 'top' ? 'Along the top' : z === 'side' ? 'Down the side' : 'Your tiles') + '</div><div class="tp-zbody"></div>';
      box.addEventListener('click', function (e) { if (disabled) return; if (e.target.closest('.tp-placed')) return; active = z; render(); });
      zonesBox.appendChild(box); zoneEls[z] = box;
    });
    var undoB = btn('Undo', 'dr-act'), clearB = btn('Clear', 'dr-act');
    undoB.addEventListener('click', function () { if (disabled || !hist.length) return; state = JSON.parse(hist.pop()); render(); });
    clearB.addEventListener('click', function () { if (disabled) return; push(); zones.forEach(function (z) { state[z] = []; }); render(); });
    bar.appendChild(undoB); bar.appendChild(clearB);
    help.innerHTML = HW.tex(opt.help || (rect ? 'Tap a tile to add it to the highlighted side (tap “Along the top” or “Down the side” to switch), or drag it there. The rectangle fills in. Tap a placed tile to remove it.' : 'Tap a tile to add it, or drag it onto the mat. Tap a placed tile to remove it.')) + ' ' + HW.tex(HW.tiles.legend());
    wrap.appendChild(pal); wrap.appendChild(zonesBox); if (rect) wrap.appendChild(view); wrap.appendChild(bar); wrap.appendChild(help);
    function push() { hist.push(JSON.stringify(state)); if (hist.length > 80) hist.shift(); }
    function add(z, tok) { if (disabled) return; if (state[z].length >= lim) return; push(); state[z].push(rect ? tok.replace('x2', 'x') : tok); render(); }
    function render() {
      zones.forEach(function (z) {
        var body = zoneEls[z].querySelector('.tp-zbody'), list = sortToks(state[z]);
        zoneEls[z].classList.toggle('on', z === active && zones.length > 1);
        body.innerHTML = list.length ? '' : '<span class="muted tp-empty">' + (rect ? 'tap or drag tiles here' : 'tap or drag tiles here') + '</span>';
        list.forEach(function (tok) { var c = el('button', 'tp-placed'); c.type = 'button'; c.title = 'Remove'; c.innerHTML = tileChip(rect && z === 'top' ? tok.replace('x', 'xh') : tok, 1.25); c.addEventListener('click', function (e) { e.stopPropagation(); if (disabled) return; var i = state[z].indexOf(tok); if (i >= 0) { push(); state[z].splice(i, 1); render(); } }); body.appendChild(c); });
      });
      if (rect) {
        var tp = sortToks(state.top), sd = sortToks(state.side);
        view.innerHTML = tp.length && sd.length ? HW.tiles.frame(tp, sd, { fill: true }) + (opt.caption ? '<div class="tp-cap">' + HW.k('(' + P.tex(D.tileFactors(api.value())[0]) + ')(' + P.tex(D.tileFactors(api.value())[1]) + ')') + '</div>' : '') : '<div class="muted tp-empty">Put tiles along the top and down the side to see the rectangle.</div>';
      }
      undoB.disabled = !hist.length;
    }
    // drag from the palette
    var drag = null;
    pal.addEventListener('pointerdown', function (e) {
      var b = e.target.closest('.tp-tile'); if (!b || disabled) return;
      e.preventDefault(); drag = { tok: b.getAttribute('data-tok'), x: e.clientX, y: e.clientY, moved: false, ghost: null };
      try { b.setPointerCapture(e.pointerId); } catch (er) {}
    });
    pal.addEventListener('pointermove', function (e) {
      if (!drag) return;
      if (!drag.moved && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 6) { drag.moved = true; drag.ghost = el('div', 'tp-ghost'); drag.ghost.innerHTML = tileChip(drag.tok, 1.6); document.body.appendChild(drag.ghost); }
      if (drag.ghost) { drag.ghost.style.left = e.clientX + 'px'; drag.ghost.style.top = e.clientY + 'px'; var over = document.elementFromPoint(e.clientX, e.clientY); zones.forEach(function (z) { zoneEls[z].classList.toggle('drop', !!(over && over.closest && over.closest('.tp-zone') === zoneEls[z])); }); }
    });
    function endDrag(e, cancel) {
      if (!drag) return; var d = drag; drag = null;
      if (d.ghost) { d.ghost.remove(); zones.forEach(function (z) { zoneEls[z].classList.remove('drop'); }); }
      if (cancel) return;
      if (!d.moved) { add(active, d.tok); return; }
      var over = document.elementFromPoint(e.clientX, e.clientY), zone = over && over.closest ? over.closest('.tp-zone') : null;
      if (zone && wrap.contains(zone)) { active = zone.getAttribute('data-zone'); add(active, d.tok); }
    }
    pal.addEventListener('pointerup', function (e) { endDrag(e, false); });
    pal.addEventListener('pointercancel', function (e) { endDrag(e, true); });
    var api = { node: wrap, kind: 'tilepad' };
    api.value = function () {
      if (rect) { var a = countsOf(state.top), b = countsOf(state.side); return { top: { x: a.x, one: a.one }, side: { x: b.x, one: b.one }, raw: clone(state) }; }
      var c = countsOf(state.mat); return { x2: c.x2, x: c.x, one: c.one, raw: clone(state) };
    };
    api.set = function (v) {
      if (!v) return;
      if (v.raw) state = clone(v.raw);
      else if (rect) { var mk = function (s) { var o = []; for (var i = 0; i < Math.abs(s.x || 0); i++) o.push((s.x < 0 ? '-' : '') + 'x'); for (var j = 0; j < Math.abs(s.one || 0); j++) o.push((s.one < 0 ? '-' : '') + '1'); return o; }; state = { top: mk(v.top || {}), side: mk(v.side || {}) }; }
      else state = { mat: HW.tiles.count({ x2: v.x2 || 0, x: v.x || 0, one: v.one || 0 }) };
      render();
    };
    api.clear = function () { zones.forEach(function (z) { state[z] = []; }); hist = []; render(); };
    api.disable = function (on) { disabled = !!on; wrap.classList.toggle('off', disabled); };
    api.focus = function () {}; api.onEnter = function () {};
    render();
    return api;
  };
  W.tilepad.text = function (v) { v = v || {}; if (v.top) { var f = D.tileFactors(v); return '(' + P.tex(f[0]) + ')(' + P.tex(f[1]) + ')'; } return P.tex(tilePolyOf(v)); };
  W.tilepad.html = function (v, I) { return D.tileSvg(I, v); };
})(window);
