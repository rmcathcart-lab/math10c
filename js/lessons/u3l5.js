/* Math 10C · Unit 3 · Lesson 5 — Applying Polynomial Products to Area, Volume, and Equations (AN4)
 * Assignment questions 1–14 (u3_L05.tex) and the whole Lesson 5 Extra Practice (u3_EP05.tex, Parts A–G, Q1–19).
 * Every part is a generator: it keeps the structure of the booklet question (signs, which factor has the coefficient,
 * number of pieces, the kind of answer) and changes the numbers; the booklet's numbers are among the possible values.
 * Figures are inline SVG drawn from the generated numbers (labels match the question; proportions are drawn at the
 * question's evaluation value, softened so thin pieces stay readable on a phone).
 * Local tools (top of file): polyPart / numPart / fracPart wrappers, a "polynomial with π" checker (piCheck: π is read
 * as a letter so the exact polynomial checker and its form nudges still apply), and a small SVG kit (canvas, labels,
 * dimension arrows) with one drawing function per figure type. */
(function (root) {
  'use strict';
  var HW = root.HW, F = HW.fmt, K = HW.kit, ex = HW.ex, B = K.P, P = HW.poly, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form;

  HW.addCodes({
    'one-piece': 'Found only one of the pieces', 'bounding-box': 'Used the bounding box without removing the missing corner', 'fl-only': 'Multiplied only First and Last terms',
    added: 'Added the removed piece instead of subtracting', 'outer-only': 'Gave the outer area only', 'sub-sign': 'Subtracted a bracket without changing every sign',
    'no-middle': 'Squared a binomial without the middle term', 'middle-once': 'Middle term of a square not doubled', 'not-increase': 'Gave the new area, not the increase',
    'corner-missing': 'Left out the small corner piece', 'one-bed': 'Subtracted only one of the beds', 'side-scaled': 'Multiplied the side instead of the area',
    'whole-circle': 'Forgot to remove the hole', 'wrong-circle': 'Used the wrong circle', 'circumference': 'Used circumferences instead of areas', 'width-circle': 'Treated the ring as a circle of radius t',
    'not-doubled': 'Middle terms not doubled (solving)', 'minus-first': 'Minus sign applied only to the first term', 'perimeter': 'Used perimeter instead of area',
    'side-not-x': 'Gave x instead of the requested length', 'mm-cm': 'Unit conversion (mm³ to cm³)', 'one-die': 'Found one die instead of the container', 'cube-terms': 'Cubed each term separately',
    'square-only': 'Squared but did not multiply by the third factor', 'conj-sign': 'Sum × difference written with +', 'sa-half': 'Surface area without the factor 2', 'sa-face': 'Left out a pair of faces',
    'one-end': 'Only one end of the cylinder', 'no-ends': 'Left out the ends of the cylinder', 'no-square': 'Forgot to square the radius', 'diameter': 'Used the diameter as the radius',
    'pi-decimal': 'Replaced π with a decimal', 'no-pi': 'Left π out', 'one-end-border': 'Added the border at one end only', 'swap': 'Matched the increases to the wrong sides',
    'given-x': 'Gave the value of x, not the answer asked', 'rounded-x': 'Rounded too early', 'plus-k': 'Substituted the wrong sign'
  });

  /* ---------- small helpers ---------- */
  function gen(f) { for (var i = 0; i < 4000; i++) { var v = f(); if (v) return v; } throw new Error('u3l5: generator failed'); }
  function lin(a, b, v) { var o = {}; o[v || 'x'] = 1; return P.add(P.mono(a, o), P.num(b)); }
  function mono(c, v, e) { var o = {}; o[v || 'x'] = e == null ? 1 : e; return P.mono(c, o); }
  function tx(p) { return P.tex(p); }
  function bt(p) { return P.btex(p); }
  function rat(x) { for (var q = 1; q <= 10000; q *= 10) { var n = Math.round(x * q); if (Math.abs(n / q - x) < 1e-9) return ex.norm(n, q); } return [x, 1]; }
  function cl(n) { return Math.round(n * 1e9) / 1e9; }
  function at(p, x, v) { var env = {}; env[v || 'x'] = rat(x); var r = P.atExact(p, env); return cl(r[0] / r[1]); }
  function N(n) { return F(cl(n)); }
  function sg(n) { return n < 0 ? '(' + N(n) + ')' : N(n); }
  function gcd(a, b) { return ex.gcd(Math.abs(a), Math.abs(b)); }
  function frTex(p, q) { return ex.texRat(ex.norm(p, q)); }
  function isInt(p, q) { return p % q === 0; }
  function lead(p) { var ts = P.sorted(p); return P.mono(ts[0].c, ts[0].v); }
  /* subtracting a bracket but changing only the sign of its first (leading) term */
  function badSub(a, b) { return P.sub(P.add(a, b), P.scale(lead(b), 2)); }
  /* First × First + Last × Last only */
  function firstLast(a, b) { var la = lead(a), lb = lead(b); return P.add(P.mul(la, lb), P.mul(P.sub(a, la), P.sub(b, lb))); }
  /* (a+b)^2 without the middle term */
  function sqNoMid(a) { var la = lead(a), rest = P.sub(a, la); return P.add(P.mul(la, la), P.mul(rest, rest)); }
  function sqMidOnce(a) { var la = lead(a), rest = P.sub(a, la); return P.add(P.mul(la, la), P.mul(la, rest), P.mul(rest, rest)); }
  function steps(lines) { return lines.map(function (l) { return t(l); }).join('<br>'); }
  var CM = '\\text{ cm}', CM2 = '\\text{ cm}^{2}', CM3 = '\\text{ cm}^{3}', M2 = '\\text{ m}^{2}', M3 = '\\text{ m}^{3}', MM3 = '\\text{ mm}^{3}';
  function u(s) { return s.replace(/^\\text\{ /, '\\text{'); }

  /* ---------- part wrappers ---------- */
  function polyPart(prompt, target, wr, sol, hints, text, opt) {
    opt = Object.assign({}, opt || {});
    var T0 = P.lift(target), seen = [];
    var ws = (wr || []).filter(function (w) {
      if (!w || !w.is) return false; var p = P.lift(w.is);
      if (P.eq(p, T0) || seen.some(function (q) { return P.eq(q, p); })) return false; seen.push(p); return true;
    });
    opt.wrong = ws;
    var part = B.poly(prompt, T0, opt, sol, hints, text);
    part.bad = ws.map(function (w) { return P.tex(P.lift(w.is)); });
    if (opt.good) part.good = opt.good;
    return part;
  }
  function diagFn(ans, diags) {
    var ds = (diags || []).filter(function (d) { return d && isFinite(d[0]) && Math.abs(d[0] - ans) > 1e-9; });
    var f = function (v) { for (var i = 0; i < ds.length; i++) if (Math.abs(v - ds[i][0]) < 1e-9) return { code: ds[i][1], hint: ds[i][2] }; return null; };
    f.list = ds; return f;
  }
  function numPart(prompt, ans, diags, sol, hints, text, unit) {
    ans = cl(ans); var d = diagFn(ans, diags);
    var p = B.number(prompt, ans, d, sol, hints, text, unit ? { after: t(u(unit)) } : null);
    if (unit) p.answer = t(N(ans) + unit);
    p.bad = d.list.map(function (x) { return String(cl(x[0])); });
    return p;
  }
  function fracPart(prompt, fr, diags, sol, hints, text, before) {
    fr = ex.norm(fr[0], fr[1]); var v = fr[0] / fr[1], d = diagFn(v, diags);
    var p = B.fraction(prompt, fr, { before: before, diag: function (val) { return d(val); } }, sol, hints, text);
    p.bad = d.list.map(function (x) { var r = rat(x[0]); return r[1] === 1 ? String(r[0]) : '\\frac{' + r[0] + '}{' + r[1] + '}'; }).filter(function (s) { return /^-?\d+$|^\\frac\{-?\d+\}\{\d+\}$/.test(s); });
    return p;
  }
  function numF(label, unit) { return { name: label.replace(/\\\(|\\\)/g, ''), label: label, after: unit ? t(u(unit)) : undefined }; }
  function polyF(label, vars) { return { name: label.replace(/\\\(|\\\)/g, ''), label: label, mode: 'math', keys: 'poly', vars: vars || ['x'] }; }
  function fieldsPart(prompt, fields, checkers, keys, answer, sol, hints, text) { return B.fields(prompt, fields, checkers, keys, answer, sol, hints, text); }
  function mcPart(r, prompt, opts, sol, hints, text, keepOrder) { return B.mc(r, prompt, opts, sol, hints, text, keepOrder); }

  /* ---------- polynomials containing π: π is read as a letter ---------- */
  var PI = 'PI', PISYM = '\u03c0'; // π is carried as the letter PI inside polynomials
  function piMul(p) { return P.mul(P.v(PI), p); }
  function piParts(p) {
    var a = {}, b = {};
    P.terms(p).forEach(function (T) { var v = Object.assign({}, T.v); if (v[PI]) { delete v[PI]; b = P.add(b, P.mono(T.c, v)); } else a = P.add(a, P.mono(T.c, v)); });
    return [a, b]; // p = a + π·b
  }
  function piTex(p) {
    var pr = piParts(p), s = P.isZero(pr[0]) ? '' : P.tex(pr[0]);
    P.sorted(pr[1]).forEach(function (T) {
      var neg = T.c[0] < 0, c = [Math.abs(T.c[0]), T.c[1]], m = P.monoTex(T.v);
      var cs = c[1] === 1 ? (c[0] === 1 ? '' : String(c[0])) : '\\frac{' + c[0] + '}{' + c[1] + '}';
      s += (neg ? '-' : s ? '+' : '') + cs + '\\pi' + (m ? ' ' + m : '');
    });
    return s || '0';
  }
  function piAst(a) {
    if (!a || typeof a !== 'object') return a;
    if (a.t === 'pi') return { t: 'var', n: PI };
    var o = Array.isArray(a) ? [] : {};
    Object.keys(a).forEach(function (k) { o[k] = typeof a[k] === 'object' ? piAst(a[k]) : a[k]; });
    return o;
  }
  function piCheck(target, opt) {
    opt = opt || {};
    var T = target, ws = (opt.wrong || []).filter(function (w) { return w && w.is && !P.eq(w.is, T); });
    var tParts = piParts(T), tVars = P.vars(T).filter(function (v) { return v !== PI; });
    function env(S, piVal, k) { var e = {}; tVars.concat(P.vars(S)).forEach(function (v, i) { if (v !== PI) e[v] = 1.37 + 0.71 * i + k; }); e[PI] = piVal; return e; }
    return function (resp) {
      var a = K.read(resp); if (a.res) return a.res;
      var ast = piAst(a.ast), r = P.read(ast);
      if (!r.ok) return r.why === 'not-poly' ? wrong('not-poly', 'That isn’t a polynomial: a variable has ended up in a denominator or an exponent. Check your work.') : wrong('value', null);
      var S = r.p;
      if (P.eq(S, T)) { var fi = P.formIssue(ast); if (fi && fi.code !== 'not-poly') return form(fi.code, fi.msg || 'Right answer — now simplify it fully.'); return ok(); }
      if (P.vars(S).indexOf(PI) < 0 && !P.isZero(tParts[1])) {
        var close = [0, 1.9].every(function (k) { var e = env(S, Math.PI, k), sv = P.at(S, e), tv = P.at(T, e); return Math.abs(sv - tv) <= 0.004 * Math.max(1, Math.abs(tv)); });
        if (close) return form('pi-decimal', 'Leave ' + t('\\pi') + ' in your answer as the symbol ' + t('\\pi') + ' (use the ' + t('\\pi') + ' key) — don’t replace it with a decimal.');
        if (P.eq(S, P.add(tParts[0], tParts[1]))) return wrong('no-pi', 'Your answer has lost the ' + t('\\pi') + '. Every term that comes from a circle’s area keeps its ' + t('\\pi') + '.');
      }
      for (var i = 0; i < ws.length; i++) if (P.eq(S, ws[i].is)) return wrong(ws[i].code, ws[i].hint);
      if (P.eq(S, P.neg(T))) return wrong('sign-all', 'Every sign in your answer is the opposite of what it should be. Check what you subtracted from what.');
      var keys = Object.keys(S).concat(Object.keys(T)).filter(function (k, j, arr) { return arr.indexOf(k) === j; });
      var diff = keys.filter(function (k) { var v = (S[k] || T[k]).v, c1 = P.coef(S, v), c2 = P.coef(T, v); return c1[0] * c2[1] !== c2[0] * c1[1]; });
      if (diff.length === 1 && P.count(T) > 1) { var dv = (S[diff[0]] || T[diff[0]]).v; return wrong('term', 'Most of your answer is right — check your ' + t(piTex(P.mono(1, dv))) + ' term again.'); }
      return wrong('value', null);
    };
  }
  function piPart(prompt, target, wr, sol, hints, text, vars) {
    var ws = []; (wr || []).forEach(function (w) { if (w && w.is && !P.eq(w.is, target) && !ws.some(function (q) { return P.eq(q.is, w.is); })) ws.push(w); });
    var p = B.math(prompt, piCheck(target, { wrong: ws }), piTex(target), sol, hints, text, { keys: 'poly', vars: (vars || ['x']).concat([PISYM]) });
    p.bad = ws.map(function (w) { return piTex(w.is); });
    return p;
  }

  /* ---------- SVG kit ---------- */
  var INK = '#1c2230', SH = '#d3d8df', SH2 = '#e9ecf0', GR = '#8a93a3';
  function f1(n) { return Math.round(n * 10) / 10; }
  function ptsStr(arr) { return arr.map(function (p) { return f1(p[0]) + ',' + f1(p[1]); }).join(' '); }
  function svgLab(s) {
    var out = '';
    String(s).split(/(\\text\{[^}]*\})/).forEach(function (seg) {
      var m = /^\\text\{([^}]*)\}$/.exec(seg);
      if (m) { out += HW.esc(m[1]); return; }
      seg = seg.replace(/\\left|\\right/g, '').replace(/\\,/g, '').replace(/\\pi/g, 'π').replace(/\\times/g, '×').replace(/\\ /g, ' ');
      for (var i = 0; i < seg.length; i++) {
        var c = seg[i];
        if (c === '^') { var mm = /^\^\{([^}]*)\}/.exec(seg.slice(i)) || /^\^(.)/.exec(seg.slice(i)); out += '<tspan dy="-6" font-size="11">' + HW.esc(mm[1]) + '</tspan><tspan dy="6"> </tspan>'; i += mm[0].length - 1; continue; }
        if (/[a-z]/i.test(c)) { out += '<tspan font-style="italic">' + c + '</tspan>'; continue; }
        if ((c === '-' || c === '+') && i > 0 && seg[i - 1] !== '(') { out += ' ' + (c === '-' ? '−' : '+') + ' '; continue; }
        if (c === '-') { out += '−'; continue; }
        out += HW.esc(c);
      }
    });
    return out;
  }
  function textEl(x, y, s, o) {
    o = o || {};
    var px = o.rot ? x + 5 : x, py = o.rot ? y : y + 5;
    return '<text x="' + f1(px) + '" y="' + f1(py) + '" text-anchor="' + (o.anchor || 'middle') + '"' + (o.rot ? ' transform="rotate(-90 ' + f1(px) + ' ' + f1(py) + ')"' : '') +
      (o.size ? ' font-size="' + o.size + '"' : '') + (o.fill ? ' fill="' + o.fill + '"' : '') + '>' + (o.plain ? HW.esc(s) : svgLab(s)) + '</text>';
  }
  function lineEl(x1, y1, x2, y2, o) {
    o = o || {};
    return '<line x1="' + f1(x1) + '" y1="' + f1(y1) + '" x2="' + f1(x2) + '" y2="' + f1(y2) + '" stroke="' + (o.stroke || INK) + '" stroke-width="' + (o.w || 1.3) + '"' + (o.dash ? ' stroke-dasharray="' + o.dash + '"' : '') + '/>';
  }
  function arrowEl(x1, y1, x2, y2) {
    var dx = x2 - x1, dy = y2 - y1, L = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / L, uy = dy / L, h = 6, w = 3;
    function head(x, y, sx, sy) { return '<polygon points="' + ptsStr([[x, y], [x - sx * h - sy * w, y - sy * h + sx * w], [x - sx * h + sy * w, y - sy * h - sx * w]]) + '" fill="' + INK + '"/>'; }
    return lineEl(x1, y1, x2, y2, { w: 1.1 }) + head(x2, y2, ux, uy) + head(x1, y1, -ux, -uy);
  }
  /* a drawing area in "units" (y up), scaled to fit pw × ph pixels, with margins m = [top, right, bottom, left] */
  function canvas(Wu, Hu, o) {
    o = o || {};
    var pw = o.pw || 230, ph = o.ph || 165, m = o.m || [28, 34, 30, 34], s = Math.min(pw / Wu, ph / Hu), parts = [];
    var c = { s: s, m: m };
    c.X = function (x) { return m[3] + x * s; };
    c.Y = function (y) { return m[0] + (Hu - y) * s; };
    c.w = m[3] + Wu * s + m[1]; c.h = m[0] + Hu * s + m[2];
    c.add = function (str) { parts.push(str); return c; };
    c.poly = function (pts, fill, o2) { o2 = o2 || {}; return c.add('<polygon points="' + ptsStr(pts.map(function (p) { return [c.X(p[0]), c.Y(p[1])]; })) + '" fill="' + (fill || 'none') + '" stroke="' + (o2.stroke || INK) + '" stroke-width="' + (o2.w || 2) + '"' + (o2.dash ? ' stroke-dasharray="' + o2.dash + '"' : '') + ' stroke-linejoin="round"/>'); };
    c.rect = function (x, y, w, h, fill, o2) { return c.poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], fill, o2); };
    c.line = function (x1, y1, x2, y2, o2) { return c.add(lineEl(c.X(x1), c.Y(y1), c.X(x2), c.Y(y2), o2)); };
    c.dash = function (x1, y1, x2, y2) { return c.line(x1, y1, x2, y2, { stroke: GR, dash: '5 4', w: 1.4 }); };
    c.text = function (x, y, str, o2) { return c.add(textEl(c.X(x), c.Y(y), str, o2)); };
    c.ptext = function (px, py, str, o2) { return c.add(textEl(px, py, str, o2)); };
    /* a side label: horizontal segment (x1..x2 at height y) labelled above/below; vertical segment labelled left/right */
    c.hlab = function (x1, x2, y, str, side, o2) { o2 = o2 || {}; var px = (c.X(x1) + c.X(x2)) / 2, py = c.Y(y) + (side === 'above' ? -(o2.off || 13) : (o2.off || 15)); if (o2.arrow) c.add(arrowEl(c.X(x1), c.Y(y), c.X(x2), c.Y(y))); return c.ptext(px, py, str); };
    c.vlab = function (y1, y2, x, str, side, o2) { o2 = o2 || {}; var py = (c.Y(y1) + c.Y(y2)) / 2, px = c.X(x) + (side === 'left' ? -(o2.off || 14) : (o2.off || 14)); if (o2.arrow) c.add(arrowEl(c.X(x), c.Y(y1), c.X(x), c.Y(y2))); return c.ptext(px, py, str, { rot: true }); };
    c.svg = function (label, maxw) {
      return '<svg class="fig-svg" viewBox="0 0 ' + f1(c.w) + ' ' + f1(c.h) + '" width="100%" style="max-width:' + Math.round(Math.min(maxw || 400, c.w * 1.25)) + 'px" role="img" aria-label="' + HW.esc(label || 'figure') + '" font-family="KaTeX_Main, \'Times New Roman\', Times, serif" font-size="16" fill="' + INK + '">' + parts.join('') + '</svg>';
    };
    return c;
  }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  /* L-shaped figure: overall W × H with a rectangular notch nw × nh missing from the top-right ('tr') or bottom-right ('br') corner.
   * labs: { bottom, left, top, right, armTop, bandRight, armLeft } ; join: draw the dashed/dotted line that splits it into two rectangles */
  function figL(W, H, nw, nh, corner, labs, o) {
    o = o || {};
    var c = canvas(W, H, { pw: o.pw || 220, ph: o.ph || 165, m: [28, 36, 30, 34] }), pts;
    if (corner === 'tr') pts = [[0, 0], [W, 0], [W, H - nh], [W - nw, H - nh], [W - nw, H], [0, H]];
    else pts = [[0, 0], [W - nw, 0], [W - nw, nh], [W, nh], [W, H], [0, H]];
    if (o.notch !== false) { if (corner === 'tr') c.rect(W - nw, H - nh, nw, nh, 'none', { stroke: GR, dash: '5 4', w: 1.3 }); else c.rect(W - nw, 0, nw, nh, 'none', { stroke: GR, dash: '5 4', w: 1.3 }); }
    c.poly(pts, SH2);
    if (o.join) { if (corner === 'tr') c.line(0, H - nh, W - nw, H - nh, { stroke: GR, dash: '2 3', w: 1.6 }); else c.line(0, nh, W - nw, nh, { stroke: GR, dash: '5 4', w: 1.4 }); }
    if (labs.bottom) c.hlab(0, corner === 'br' ? W - nw : W, 0, labs.bottom, 'below');
    if (labs.left) c.vlab(0, corner === 'br' ? nh : H, 0, labs.left, 'left');
    if (labs.leftAll) c.vlab(0, H, 0, labs.leftAll, 'left');
    if (labs.top) { if (corner === 'tr') c.hlab(W - nw, W, H, labs.top, 'above'); else c.hlab(0, W, H, labs.top, 'above'); }
    if (labs.right) { if (corner === 'tr') c.vlab(H - nh, H, W, labs.right, 'right'); else c.vlab(nh, H, W, labs.right, 'right'); }
    if (labs.armTop) c.hlab(0, W - nw, H, labs.armTop, 'above');
    if (labs.bandRight) c.vlab(0, H - nh, W, labs.bandRight, 'right');
    return c.svg(o.label || 'L-shaped figure', o.maxw || 360);
  }
  /* rectangular frame / border: outer OW × OH with a centred opening IW × IH. o: top, left, inW, inH (labels with arrows inside the opening),
   * inner: [line1, line2] text in the opening, border: label of a uniform border width (arrows across the band) */
  function figFrame(OW, OH, IW, IH, o) {
    var c = canvas(OW, OH, { pw: o.pw || 240, ph: o.ph || 160, m: [o.top ? 28 : 8, 10, 8, o.left ? 34 : 10] }), ix = (OW - IW) / 2, iy = (OH - IH) / 2;
    if (o.shadeInner) { c.rect(0, 0, OW, OH, SH); c.rect(ix, iy, IW, IH, '#ffffff'); }
    else c.add('<path d="M' + f1(c.X(0)) + ' ' + f1(c.Y(0)) + 'H' + f1(c.X(OW)) + 'V' + f1(c.Y(OH)) + 'H' + f1(c.X(0)) + 'Z M' + f1(c.X(ix)) + ' ' + f1(c.Y(iy)) + 'H' + f1(c.X(ix + IW)) + 'V' + f1(c.Y(iy + IH)) + 'H' + f1(c.X(ix)) + 'Z" fill="' + SH + '" fill-rule="evenodd"/>');
    c.rect(0, 0, OW, OH, 'none'); c.rect(ix, iy, IW, IH, 'none');
    if (o.top) c.hlab(0, OW, OH, o.top, 'above');
    if (o.left) c.vlab(0, OH, 0, o.left, 'left');
    var top = c.Y(iy + IH), bot = c.Y(iy), lft = c.X(ix), rgt = c.X(ix + IW);
    if (o.inW) { c.add(arrowEl(lft + 2, top + 11, rgt - 2, top + 11)); c.ptext((lft + rgt) / 2 - (o.inH ? 8 : 0), top + 26, o.inW); }
    if (o.inH) { c.add(arrowEl(rgt - 11, top + 2, rgt - 11, bot - 2)); c.ptext(rgt - 25, (top + bot) / 2 + (o.inW ? 8 : 0), o.inH, { rot: true }); }
    if (o.inner) { var cy = (top + bot) / 2, n = o.inner.length; o.inner.forEach(function (s, i) { c.ptext((lft + rgt) / 2, cy + (i - (n - 1) / 2) * 17, s, { size: 14 }); }); }
    if (o.border) {
      var yA = c.Y(OH * 0.3), xL = c.X(0), xI = lft; c.add(arrowEl(xL + 1, yA, xI - 1, yA)); c.ptext((xL + xI) / 2, yA - 10, o.border, { size: 14 });
      var xB = c.X(OW * 0.72), yT = c.Y(OH), yI = top; c.add(arrowEl(xB, yT + 1, xB, yI - 1)); c.ptext(xB + 11, (yT + yI) / 2, o.border, { size: 14 });
    }
    return c.svg(o.label || 'frame', o.maxw || 380);
  }
  function figRect(W, H, o) {
    var c = canvas(W, H, { pw: o.pw || 200, ph: o.ph || 110, m: [o.top ? 28 : 10, 18, o.bottom ? 30 : 10, o.left ? 34 : 10] });
    c.rect(0, 0, W, H, o.fill || SH2);
    if (o.top) c.hlab(0, W, H, o.top, 'above');
    if (o.bottom) c.hlab(0, W, 0, o.bottom, 'below');
    if (o.left) c.vlab(0, H, 0, o.left, 'left');
    if (o.inside) c.text(W / 2, H / 2, o.inside);
    if (o.grid) { c.dash(W / 2, 0, W / 2, H); c.dash(0, H / 2, W, H / 2); }
    return c;
  }
  function sideBySide(svgs, sep) {
    return '<div style="display:flex;flex-wrap:wrap;align-items:center;gap:6px 14px;max-width:440px">' + svgs.map(function (s) { return '<div style="flex:1 1 140px;min-width:120px;max-width:220px">' + s + '</div>'; }).join(sep ? '<div style="font-size:22px">' + sep + '</div>' : '') + '</div>';
  }
  function figSquareBeds(G, b, n, lg, lb) {
    var c = canvas(1, 1, { pw: 175, ph: 175, m: [28, 14, 12, 34] }), bd = clamp(b / G, 0.25, 0.88 / n), g = (1 - n * bd) / (n + 1);
    c.rect(0, 0, 1, 1, '#ffffff');
    for (var i = 0; i < n; i++) { var p0 = g + i * (bd + g); c.rect(p0, p0, bd, bd, SH); }
    c.hlab(0, 1, 1, lg, 'above'); c.vlab(0, 1, 0, lg, 'left');
    var x0 = c.X(g), x1 = c.X(g + bd), yt = c.Y(g + bd); c.add(arrowEl(x0 + 2, yt + 10, x1 - 2, yt + 10)); c.ptext((x0 + x1) / 2, yt + 25, lb, { size: 14 });
    return c.svg('square garden with flower beds', 300);
  }
  function figWasher(sL, tL) {
    var cx = 110, cy = 92, R = 76, r = 46;
    var s = '<path d="M' + (cx - R) + ' ' + cy + 'a' + R + ' ' + R + ' 0 1 0 ' + 2 * R + ' 0a' + R + ' ' + R + ' 0 1 0 ' + (-2 * R) + ' 0Z M' + (cx - r) + ' ' + cy + 'a' + r + ' ' + r + ' 0 1 0 ' + 2 * r + ' 0a' + r + ' ' + r + ' 0 1 0 ' + (-2 * r) + ' 0Z" fill="' + SH + '" fill-rule="evenodd" stroke="' + INK + '" stroke-width="2"/>';
    s += arrowEl(cx, cy, cx - r + 1, cy) + textEl(cx - r / 2, cy - 11, sL) + '<circle cx="' + cx + '" cy="' + cy + '" r="2.2" fill="' + INK + '"/>';
    s += arrowEl(cx, cy - r - 1, cx, cy - R + 1) + textEl(cx + 11, cy - (r + R) / 2, tL);
    return '<svg class="fig-svg" viewBox="0 0 220 184" width="100%" style="max-width:220px" role="img" aria-label="washer" font-family="KaTeX_Main, \'Times New Roman\', Times, serif" font-size="16" fill="' + INK + '">' + s + '</svg>';
  }
  /* right triangle: legs b (horizontal) and h (vertical), right angle at the bottom left */
  function figTri(bv, hv, lb, lh, lc) {
    var hd = clamp(hv, bv * 0.35, bv * 1.25), c = canvas(bv, hd, { pw: 210, ph: 150, m: [14, 50, 30, 34] });
    c.poly([[0, 0], [bv, 0], [0, hd]], SH2);
    var q = 12 / c.s; c.poly([[0, 0], [q, 0], [q, q], [0, q]], 'none', { w: 1.2 });
    c.hlab(0, bv, 0, lb, 'below'); c.vlab(0, hd, 0, lh, 'left');
    var mx = (c.X(0) + c.X(bv)) / 2, my = (c.Y(0) + c.Y(hd)) / 2, nx = hd * c.s, ny = bv * c.s, nl = Math.sqrt(nx * nx + ny * ny);
    c.ptext(mx + nx / nl * 12, my - ny / nl * 12, lc, { anchor: 'start' });
    return c.svg('right triangle', 360);
  }
  /* rectangular prism: front face len × ht, depth dp drawn as an oblique offset */
  function figPrism(len, ht, dp, ll, lh, ld, o) {
    o = o || {};
    var dx = dp * 0.55, dy = dp * 0.45, c = canvas(len + dx, ht + dy, { pw: o.pw || 220, ph: o.ph || 140, m: [12, 58, 30, 34] });
    c.dash(0, 0, dx, dy); c.dash(dx, dy, len + dx, dy); c.dash(dx, dy, dx, ht + dy);
    c.rect(0, 0, len, ht, SH2);
    c.poly([[len, 0], [len + dx, dy], [len + dx, ht + dy], [len, ht]], SH);
    c.poly([[0, ht], [len, ht], [len + dx, ht + dy], [dx, ht + dy]], '#f3f5f7');
    c.hlab(0, len, 0, ll, 'below'); c.vlab(0, ht, 0, lh, 'left');
    c.ptext(c.X(len + dx / 2) + 8, c.Y(dy / 2) + 2, ld, { anchor: 'start' });
    return c.svg(o.label || 'rectangular prism', o.maxw || 360);
  }
  function figCylinder(lr, lh) {
    var s = '', cx = 80, rx = 52, ry = 15, top = 48, bot = 158;
    s += '<path d="M' + (cx - rx) + ' ' + top + 'V' + bot + 'A' + rx + ' ' + ry + ' 0 0 0 ' + (cx + rx) + ' ' + bot + 'V' + top + '" fill="' + SH2 + '" stroke="' + INK + '" stroke-width="2"/>';
    s += '<path d="M' + (cx - rx) + ' ' + bot + 'A' + rx + ' ' + ry + ' 0 0 1 ' + (cx + rx) + ' ' + bot + '" fill="none" stroke="' + GR + '" stroke-width="1.3" stroke-dasharray="5 4"/>';
    s += '<ellipse cx="' + cx + '" cy="' + top + '" rx="' + rx + '" ry="' + ry + '" fill="#f3f5f7" stroke="' + INK + '" stroke-width="2"/>';
    s += '<circle cx="' + cx + '" cy="' + top + '" r="2.2" fill="' + INK + '"/>' + arrowEl(cx, top, cx + rx - 1, top) + textEl(cx + rx / 2, top - 26, lr);
    s += lineEl(cx + rx / 2, top - 4, cx + rx / 2, top - 17, { stroke: GR, w: 1 });
    s += arrowEl(cx + rx + 14, top, cx + rx + 14, bot) + textEl(cx + rx + 22, (top + bot) / 2, lh, { anchor: 'start' });
    return '<svg class="fig-svg" viewBox="0 0 230 184" width="100%" style="max-width:240px" role="img" aria-label="cylinder" font-family="KaTeX_Main, \'Times New Roman\', Times, serif" font-size="15" fill="' + INK + '">' + s + '</svg>';
  }
  function figCircleSquare(ls) {
    var x0 = 30, y0 = 12, S = 150, r = S / 2, cx = x0 + r, cy = y0 + r;
    var s = '<path d="M' + x0 + ' ' + y0 + 'h' + S + 'v' + S + 'h' + (-S) + 'Z M' + (cx - r) + ' ' + cy + 'a' + r + ' ' + r + ' 0 1 0 ' + S + ' 0a' + r + ' ' + r + ' 0 1 0 ' + (-S) + ' 0Z" fill="' + SH + '" fill-rule="evenodd"/>';
    s += '<rect x="' + x0 + '" y="' + y0 + '" width="' + S + '" height="' + S + '" fill="none" stroke="' + INK + '" stroke-width="2"/><circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + INK + '" stroke-width="2"/>';
    s += lineEl(cx, cy, cx + r, cy, { stroke: GR, dash: '5 4' }) + '<circle cx="' + cx + '" cy="' + cy + '" r="2.2" fill="' + INK + '"/>' + textEl(cx, y0 + S + 16, ls);
    return '<svg class="fig-svg" viewBox="0 0 210 192" width="100%" style="max-width:220px" role="img" aria-label="circle inscribed in a square" font-family="KaTeX_Main, \'Times New Roman\', Times, serif" font-size="15" fill="' + INK + '">' + s + '</svg>';
  }
  function figTrap(a, bTop, h, la, lb, lh) {
    var off = (a - bTop) * 0.35, c = canvas(a, h, { pw: 220, ph: 120, m: [28, 14, 30, 14] });
    c.poly([[0, 0], [a, 0], [off + bTop, h], [off, h]], SH2);
    c.dash(off, h, off, 0);
    c.hlab(0, a, 0, la, 'below'); c.hlab(off, off + bTop, h, lb, 'above'); c.vlab(0, h, off, lh, 'right', { off: 12 });
    return c.svg('trapezoid', 340);
  }
  function figGrow(lw, ww, k, kl) {
    var c = canvas(lw + k, ww + k, { pw: 210, ph: 140, m: [28, 30, 30, 34] });
    c.rect(0, ww, lw + k, k, SH); c.rect(lw, 0, k, ww, SH);
    c.rect(0, 0, lw, ww, '#ffffff'); c.rect(0, 0, lw + k, ww + k, 'none');
    c.dash(lw, 0, lw, ww + k); c.dash(0, ww, lw + k, ww);
    c.text(lw / 2, ww / 2, 'lw');
    c.hlab(0, lw, 0, 'l', 'below'); c.vlab(0, ww, 0, 'w', 'left');
    c.hlab(lw, lw + k, 0, kl, 'below'); c.vlab(ww, ww + k, 0, kl, 'left');
    return c.svg('rectangle with both sides increased', 320);
  }

  function figCard(lc, lp) {
    var c = canvas(1, 1, { pw: 160, ph: 160, m: [10, 14, 30, 14] });
    c.rect(0, 0, 1, 1, SH); c.rect(0.29, 0.29, 0.42, 0.42, '#ffffff');
    c.hlab(0, 1, 0, lc, 'below'); c.text(0.5, 0.5, lp);
    return c.svg('square photo on a square card', 220);
  }
  /* ---------- shared generators ---------- */
  /* right triangle with legs (3x+p), (4x+q) and hypotenuse (5x+r): x² terms cancel, x = x0 */
  var TRIPLES = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [9, 40, 41], [12, 35, 37]];
  function triGen(r, xlo, xhi) {
    return gen(function () {
      var tr = r.pick(TRIPLES), k = r.int(1, 6), A = tr[0] * k, Bv = tr[1] * k, C = tr[2] * k;
      if (r.chance(0.5)) { var s0 = A; A = Bv; Bv = s0; }
      var x0 = r.int(xlo, xhi), p = A - 3 * x0, q = Bv - 4 * x0, rr = C - 5 * x0;
      if (!p || !q || !rr || Math.abs(p) > 12 || Math.abs(q) > 12 || Math.abs(rr) > 12 || 10 * rr - 6 * p - 8 * q === 0) return null;
      return { p: p, q: q, r: rr, x0: x0, A: A, B: Bv, C: C, l3: lin(3, p), l4: lin(4, q), hyp: lin(5, rr) };
    });
  }
  function triSolution(T) {
    var L3 = P.pow(T.l3, 2), L4 = P.pow(T.l4, 2), H = P.pow(T.hyp, 2), rs = P.add(L3, L4), co = 10 * T.r - 6 * T.p - 8 * T.q, k = T.p * T.p + T.q * T.q - T.r * T.r;
    return steps([bt(T.hyp) + '^{2}=' + bt(T.l3) + '^{2}+' + bt(T.l4) + '^{2}', tx(H) + '=(' + tx(L3) + ')+(' + tx(L4) + ')', tx(H) + '=' + tx(rs)]) +
      '<br>The ' + t('25x^{2}') + ' terms cancel: ' + t(tx(P.sub(H, mono(25, 'x', 2))) + '=' + tx(P.sub(rs, mono(25, 'x', 2)))) + ', so ' + t((co === 1 ? '' : co === -1 ? '-' : co) + 'x=' + k) + ' and ' + t('x=' + T.x0) + '.';
  }
  /* (x+a)^2 = (x+b)(x+c) with a positive whole-number solution */
  function sqRectGen(r, a0, b0, c0) {
    return gen(function () {
      var a = r.int(2, 9), b = r.int(1, 14), c = r.int(1, 14), den = 2 * a - b - c, num = b * c - a * a;
      if (b === c || b === a || c === a || !den || !num || num % den) return null;
      var x = num / den; if (x < 1 || x > 15) return null;
      return { a: a, b: b, c: c, x: x };
    });
  }
  /* rectangular prism parts: l, w, h linear polynomials */
  function prismWrongs(l, w, h) {
    return [{ is: P.mul(l, w), code: 'square-only', hint: 'That is only the area of one face (' + t('lw') + '). Volume multiplies all three dimensions: ' + t('V=lwh') + '.' },
      { is: P.add(P.mul(l, w), h), code: 'square-only', hint: 'Multiply all three dimensions — don’t add the third one.' }];
  }
  function saOf(l, w, h) { return P.scale(P.add(P.mul(l, w), P.mul(l, h), P.mul(w, h)), 2); }
  function saWrongs(l, w, h) {
    var s3 = P.add(P.mul(l, w), P.mul(l, h), P.mul(w, h));
    return [{ is: s3, code: 'sa-half', hint: 'A closed box has <b>two</b> of each face (top and bottom, front and back, two ends): ' + t('SA=2(lw+lh+wh)') + '.' },
      { is: P.scale(P.add(P.mul(l, w), P.mul(l, h)), 2), code: 'sa-face', hint: 'You have only two pairs of faces. Add the pair with area ' + t('wh') + ' too.' },
      { is: P.scale(P.add(P.mul(l, w), P.mul(w, h)), 2), code: 'sa-face', hint: 'You have only two pairs of faces. Add the pair with area ' + t('lh') + ' too.' },
      { is: P.scale(P.add(P.mul(l, h), P.mul(w, h)), 2), code: 'sa-face', hint: 'You have only two pairs of faces. Add the pair with area ' + t('lw') + ' too.' },
      { is: P.mul(l, w, h), code: 'perimeter', hint: 'That is the volume. Surface area adds the areas of the six faces: ' + t('SA=2(lw+lh+wh)') + '.' }];
  }
  function saSolution(l, w, h, unit) {
    var lw = P.mul(l, w), lh = P.mul(l, h), wh = P.mul(w, h), s3 = P.add(lw, lh, wh);
    return steps(['lw=' + bt(l) + bt(w) + '=' + tx(lw), 'lh=' + bt(l) + bt(h) + '=' + tx(lh), 'wh=' + bt(w) + bt(h) + '=' + tx(wh)]) +
      '<br>' + t('lw+lh+wh=' + tx(s3)) + ', so ' + t('SA=2(' + tx(s3) + ')=' + tx(P.scale(s3, 2))) + ' ' + t(u(unit)) + '.';
  }
  function volSolution(l, w, h, unit) {
    var lw = P.mul(l, w);
    return 'Multiply two factors first: ' + t(bt(l) + bt(w) + '=' + tx(lw)) + '.<br>Then ' + t('V=(' + tx(lw) + ')' + bt(h) + '=' + tx(P.mul(lw, h))) + ' ' + t(u(unit)) + '.';
  }

  /* ================================================================== */
  HW.defineLesson({
    id: 'u3l5', unit: 3, num: '5', title: 'Applying Polynomial Products to Area, Volume, and Equations', outcome: 'AN4',
    blurb: 'Composite areas, framed regions, boxes and cylinders as expanded polynomials, and equations that must be expanded before they can be solved.',
    questions: [
      /* ---------- Q1(a): L-shape, add the two rectangles ---------- */
      { num: '1', stem: function (sh) {
          return 'The figure is made of horizontal and vertical segments: a rectangle ' + t(bt(sh.aw)) + ' wide and ' + t(bt(sh.ah)) + ' tall, joined along its top edge to a rectangle ' + t(bt(sh.tw)) + ' wide and ' + t(bt(sh.th)) + ' tall.' +
            figL(sh.X + sh.rr, 3 * sh.X + sh.q - sh.s, sh.rr - sh.p, 2 * sh.X + sh.q, 'br', { bottom: tx(sh.aw), left: tx(sh.ah), top: tx(sh.tw), right: tx(sh.th) }, { join: true, notch: false });
        },
        shared: function (r) {
          return gen(function () {
            var p = r.int(1, 3), q = r.int(3, 7), rr = p + r.int(2, 5), s = r.int(1, 4), X = r.int(s + 2, s + 4);
            var aw = lin(1, p), ah = lin(2, q), tw = lin(1, rr), th = lin(1, -s), A1 = P.mul(aw, ah), A2 = P.mul(tw, th), area = P.add(A1, A2);
            if (X > 8 || !P.coef(area, { x: 1 })[0] || !P.constant(area)[0]) return null;
            return { p: p, q: q, rr: rr, s: s, X: X, aw: aw, ah: ah, tw: tw, th: th, A1: A1, A2: A2, area: area, box: P.mul(tw, P.add(ah, th)) };
          });
        },
        parts: [
          { id: '1a1', sub: 'a i', level: 'PRG', make: function (r, sh) {
            var a = P.coef(sh.area, { x: 2 })[0], b = P.coef(sh.area, { x: 1 })[0], c = P.constant(sh.area)[0];
            return polyPart('Write the area of the figure as a trinomial ' + t('ax^{2}+bx+c') + '.', sh.area, [
              { is: sh.A1, code: 'one-piece', hint: 'That is only the lower rectangle. Add the area of the top rectangle too.' },
              { is: sh.A2, code: 'one-piece', hint: 'That is only the top rectangle. Add the area of the lower rectangle too.' },
              { is: sh.box, code: 'bounding-box', hint: 'That is the whole bounding box. A corner of it is missing from the figure — add the two rectangles instead (or subtract the missing corner).' },
              { is: P.add(firstLast(sh.aw, sh.ah), firstLast(sh.tw, sh.th)), code: 'fl-only', hint: 'Each product of binomials has four products, not two: you also need the Outside and Inside products (the ' + t('x') + ' terms).' }],
              '<b>Add the two rectangles.</b><br>' + steps([bt(sh.aw) + bt(sh.ah) + '=' + tx(sh.A1), bt(sh.tw) + bt(sh.th) + '=' + tx(sh.A2)]) + '<br>Area ' + t('=' + tx(sh.area)) + ', so ' + t('a=' + a + ',\\ b=' + b + ',\\ c=' + c) + '.',
              ['Split the figure along the dashed line into two rectangles. Find each area as (width)(height).', 'Add the two expanded products and collect like terms.'], 'L-shape area as trinomial');
          } },
          { id: '1a2', sub: 'a ii', level: 'BEG', make: function (r, sh) {
            var X = sh.X, v = at(sh.area, X), w1 = at(sh.aw, X), h1 = at(sh.ah, X), w2 = at(sh.tw, X), h2 = at(sh.th, X);
            return numPart('Evaluate the area when ' + t('x=' + X) + '.', v, [[at(sh.A1, X), 'one-piece', 'That is only one of the two rectangles.'], [at(sh.A2, X), 'one-piece', 'That is only one of the two rectangles.'], [at(sh.box, X), 'bounding-box', 'That is the whole bounding box. Remove the missing corner.']],
              'At ' + t('x=' + X) + ' the lower rectangle is ' + t(w1 + '\\times ' + h1) + ' and the top one is ' + t(w2 + '\\times ' + h2) + ': ' + t(w1 * h1 + '+' + w2 * h2 + '=' + N(v)) + '.<br>Check with the trinomial: ' + t(tx(sh.area).replace(/x/g, '(' + X + ')') + '=' + N(v)) + '.',
              ['Substitute ' + t('x=' + X) + ' into your trinomial, or work out both rectangles with real numbers.'], 'L-shape area at x=' + X);
          } }] },
      /* ---------- Q1(b): frame ---------- */
      { num: '1', stem: function (sh) {
          return 'A rectangular frame has outer dimensions ' + t(bt(sh.ow) + '\\text{ by }' + bt(sh.oh)) + ', with a rectangular opening ' + t(bt(sh.iw) + '\\text{ by }' + bt(sh.ih)) + ' cut from its interior. The shaded frame is the figure.' +
            figFrame(at(sh.ow, sh.X), at(sh.oh, sh.X), clamp(at(sh.iw, sh.X), 0.5 * at(sh.ow, sh.X), 0.8 * at(sh.ow, sh.X)), clamp(at(sh.ih, sh.X), 0.42 * at(sh.oh, sh.X), 0.7 * at(sh.oh, sh.X)), { top: tx(sh.ow), left: tx(sh.oh), inW: tx(sh.iw), inH: tx(sh.ih), label: 'frame' });
        },
        shared: function (r) {
          return gen(function () {
            var a = r.int(3, 4), b = r.int(1, 5), c = r.int(2, 3), d = r.int(2, 6), e = r.int(2, 6), f = r.int(1, 3), X = r.pick([0.5, 1.5, 2.5]);
            var ow = lin(a, b), oh = lin(c, d), iw = lin(1, e), ih = lin(1, f), O = P.mul(ow, oh), I = P.mul(iw, ih), area = P.sub(O, I);
            if (at(ow, X) - at(iw, X) < 1.5 || at(oh, X) - at(ih, X) < 1.5 || !P.coef(area, { x: 1 })[0] || !P.constant(area)[0]) return null;
            return { X: X, ow: ow, oh: oh, iw: iw, ih: ih, O: O, I: I, area: area };
          });
        },
        parts: [
          { id: '1b1', sub: 'b i', level: 'PRG', make: function (r, sh) {
            var a = P.coef(sh.area, { x: 2 })[0], b = P.coef(sh.area, { x: 1 })[0], c = P.constant(sh.area)[0];
            return polyPart('Write the area of the shaded frame as a trinomial ' + t('ax^{2}+bx+c') + '.', sh.area, [
              { is: P.add(sh.O, sh.I), code: 'added', hint: 'The opening is cut <b>out</b>, so its area is subtracted from the outer rectangle, not added.' },
              { is: sh.O, code: 'outer-only', hint: 'That is the whole outer rectangle. Subtract the area of the opening.' },
              { is: badSub(sh.O, sh.I), code: 'sub-sign', hint: 'When you subtract the opening, the minus sign applies to <b>every</b> term of its area: ' + t('-(' + tx(sh.I) + ')=' + tx(P.neg(sh.I))) + '.' }],
              '<b>Outer rectangle minus the opening.</b><br>' + steps([bt(sh.ow) + bt(sh.oh) + '=' + tx(sh.O), bt(sh.iw) + bt(sh.ih) + '=' + tx(sh.I)]) + '<br>Area ' + t('=(' + tx(sh.O) + ')-(' + tx(sh.I) + ')=' + tx(sh.area)) + ', so ' + t('a=' + a + ',\\ b=' + b + ',\\ c=' + c) + '.',
              ['Find the area of the outer rectangle and the area of the opening.', 'Shaded area = outer − opening. Put the opening’s area in brackets when you subtract.'], 'frame area trinomial');
          } },
          { id: '1b2', sub: 'b ii', level: 'EMG', make: function (r, sh) {
            var X = sh.X, v = at(sh.area, X), ow = at(sh.ow, X), oh = at(sh.oh, X), iw = at(sh.iw, X), ih = at(sh.ih, X);
            return numPart('Evaluate the area when ' + t('x=' + X) + '.', v, [[at(sh.O, X), 'outer-only', 'That is the whole outer rectangle — subtract the opening.'], [at(P.add(sh.O, sh.I), X), 'added', 'Subtract the opening’s area; don’t add it.'], [at(badSub(sh.O, sh.I), X), 'sub-sign', 'Check your trinomial: subtract every term of the opening’s area.']],
              'At ' + t('x=' + X) + ': ' + t(tx(sh.area).replace(/x/g, '(' + X + ')') + '=' + N(v)) + '.<br>Check with the figure: ' + t(N(ow) + '\\times ' + N(oh) + '-' + N(iw) + '\\times ' + N(ih) + '=' + N(ow * oh) + '-' + N(iw * ih) + '=' + N(v)) + '.',
              ['Substitute ' + t('x=' + X) + ' into your trinomial (a calculator is fine).'], 'frame area at x=' + X);
          } }] },
      /* ---------- Q2: bounding box minus notch, in y ---------- */
      { num: '2', stem: function (sh) {
          var X = -sh.k;
          return 'A figure consists of a rectangular bounding box of width ' + t('(' + sh.wT + ')') + ' and height ' + t(bt(sh.h)) + ', with a rectangular notch of width ' + t('(' + sh.nwT + ')') + ' and height ' + t('(' + sh.nhT + ')') + ' removed from one corner.' +
            figL(at(sh.w, X, 'y'), at(sh.h, X, 'y'), at(sh.nw, X, 'y'), at(sh.nh, X, 'y'), 'tr', { bottom: sh.wT, left: tx(sh.h), top: sh.nwT, right: sh.nhT }, { label: 'bounding box with a notch' });
        },
        shared: function (r) {
          return gen(function () {
            var A = r.int(5, 8), Bh = r.int(8, 12), C = r.int(1, 3), D = r.int(2, 4), k = r.int(2, 4);
            if (C >= A - 1 || D + k >= Bh - k - 1 || C === D) return null;
            var w = P.parse(A + '-y'), h = lin(1, Bh, 'y'), nw = P.parse(C + '-y'), nh = P.parse(D + '-y'), box = P.mul(w, h), notch = P.mul(nw, nh), area = P.sub(box, notch);
            if (!P.coef(area, { y: 1 })[0]) return null;
            return { A: A, Bh: Bh, C: C, D: D, k: k, w: w, h: h, nw: nw, nh: nh, box: box, notch: notch, area: area, wT: P.seq([String(A), '-y']), nwT: P.seq([String(C), '-y']), nhT: P.seq([String(D), '-y']) };
          });
        },
        parts: [
          { id: '2a', level: 'PRG', make: function (r, sh) {
            return polyPart('Determine the area of the figure in the form ' + t('ay^{2}+by+c') + '.', sh.area, [
              { is: P.add(sh.box, sh.notch), code: 'added', hint: 'The notch is <b>removed</b>, so subtract its area from the bounding box.' },
              { is: sh.box, code: 'outer-only', hint: 'That is the bounding box. Subtract the area of the notch.' },
              { is: badSub(sh.box, sh.notch), code: 'sub-sign', hint: 'Subtract every term of the notch’s area: ' + t('-(' + tx(sh.notch) + ')=' + tx(P.neg(sh.notch))) + '.' }],
              '<b>Bounding box minus the notch.</b><br>' + steps(['(' + sh.wT + ')' + bt(sh.h) + '=' + tx(sh.box), '(' + sh.nwT + ')(' + sh.nhT + ')=' + tx(sh.notch)]) + '<br>Area ' + t('=(' + tx(sh.box) + ')-(' + tx(sh.notch) + ')=' + tx(sh.area)) + '.',
              ['Area = bounding box − notch. Expand each product carefully: ' + t('(-y)(-y)=+y^{2}') + '.', 'Keep the notch’s area in brackets when you subtract it.'], 'notch figure area in y');
          } },
          { id: '2b', level: 'EMG', make: function (r, sh) {
            var X = -sh.k, v = at(sh.area, X, 'y'), w = at(sh.w, X, 'y'), h = at(sh.h, X, 'y'), nw = at(sh.nw, X, 'y'), nh = at(sh.nh, X, 'y');
            return numPart('Determine the area of the figure when ' + t('y=' + X) + '.', v, [[at(sh.area, sh.k, 'y'), 'plus-k', 'Substitute ' + t('y=' + X) + ' (a negative number) — use brackets: ' + t('(' + X + ')^{2}=' + X * X) + '.'], [at(P.add(sh.box, sh.notch), X, 'y'), 'added', 'Subtract the notch; don’t add it.'], [at(sh.box, X, 'y'), 'outer-only', 'That is the whole bounding box — subtract the notch.']],
              'At ' + t('y=' + X) + ': ' + t(tx(sh.area).replace(/y/g, '(' + X + ')') + '=' + N(v)) + '.<br>Check against the figure: box ' + t(w + '\\times ' + h + '=' + w * h) + ', notch ' + t(nw + '\\times ' + nh + '=' + nw * nh) + ', and ' + t(w * h + '-' + nw * nh + '=' + N(v)) + '.',
              ['Substitute ' + t('y=' + X) + ' with brackets around the negative number.', 'Check with the figure: work out the four side lengths at ' + t('y=' + X) + ' first.'], 'notch area at y=' + X);
          } }] },
      /* ---------- Q3: heated square plate ---------- */
      { num: '3', stem: function (sh) { return 'A square metal plate of side ' + t(sh.S + CM) + ' is heated so that each side increases in length by ' + t('x' + CM) + '.'; },
        shared: function (r) { var S = r.pick([20, 25, 30, 40, 50]), xv = r.pick([0.1, 0.2, 0.3, 0.4, 0.5]); return { S: S, xv: xv, side: lin(1, S), area: P.pow(lin(1, S), 2) }; },
        parts: [
          { id: '3a', level: 'BEG', make: function (r, sh) {
            return polyPart('Write and simplify an expression for the area of the heated plate (in ' + t(u(CM2)) + ').', sh.area, [
              { is: sqNoMid(sh.side), code: 'no-middle', hint: t('(x+' + sh.S + ')^{2}') + ' is ' + t('(x+' + sh.S + ')(x+' + sh.S + ')') + ': it has a middle term, ' + t('2(' + sh.S + ')x') + '.' },
              { is: sqMidOnce(sh.side), code: 'middle-once', hint: 'The middle term of a square is <b>doubled</b>: ' + t('x\\cdot ' + sh.S + '+' + sh.S + '\\cdot x=' + 2 * sh.S + 'x') + '.' }],
              'Each side becomes ' + t('(x+' + sh.S + ')' + CM) + '. ' + t('(x+' + sh.S + ')^{2}=x^{2}+' + 2 * sh.S + 'x+' + sh.S * sh.S) + '.',
              ['Write the new side length first, then square it.', t('(a+b)^{2}=a^{2}+2ab+b^{2}') + '.'], 'heated plate area');
          } },
          { id: '3b', level: 'EMG', make: function (r, sh) {
            var inc = P.sub(sh.area, P.num(sh.S * sh.S));
            return polyPart('Write and simplify an expression for the <b>increase</b> in area of the plate.', inc, [
              { is: sh.area, code: 'not-increase', hint: 'That is the new area. The increase is new area − original area, and the original area is ' + t(sh.S + '^{2}=' + F(sh.S * sh.S)) + '.' },
              { is: mono(2 * sh.S), code: 'corner-missing', hint: 'Almost — the two strips give ' + t(2 * sh.S + 'x') + ', but there is also the small corner square, ' + t('x^{2}') + '.' },
              { is: P.sub(sqMidOnce(sh.side), P.num(sh.S * sh.S)), code: 'middle-once', hint: 'Check the middle term of ' + t('(x+' + sh.S + ')^{2}') + ': it is doubled.' }],
              'Increase ' + t('=(x^{2}+' + 2 * sh.S + 'x+' + sh.S * sh.S + ')-' + sh.S + '^{2}=x^{2}+' + 2 * sh.S + 'x') + ' ' + t(u(CM2)) + '.',
              ['Increase = heated area − original area.'], 'increase in plate area');
          } },
          { id: '3c', level: 'BEG', make: function (r, sh) {
            var x = sh.xv, v = cl(x * x + 2 * sh.S * x);
            return numPart('If ' + t('x=' + x) + ', calculate the increase in area.', v, [[cl(2 * sh.S * x), 'corner-missing', 'Include the ' + t('x^{2}') + ' term: ' + t('(' + x + ')^{2}=' + cl(x * x)) + '.'], [cl(Math.pow(sh.S + x, 2)), 'not-increase', 'That is the new area. Find the increase.'], [cl(x * x + sh.S * x), 'middle-once', 'The middle term is ' + t(2 * sh.S + 'x') + '.']],
              t('(' + x + ')^{2}+' + 2 * sh.S + '(' + x + ')=' + cl(x * x) + '+' + cl(2 * sh.S * x) + '=' + v) + ' ' + t(u(CM2)) + '.', ['Substitute into your answer to (b).'], 'plate increase at x=' + x, CM2);
          } }] },
      /* ---------- Q4: square garden with square beds ---------- */
      { num: '4', stem: function (sh) {
          return 'A square garden with side length ' + t(bt(sh.g) + '\\text{ m}') + ' contains ' + (sh.n === 2 ? 'two' : 'three') + ' square flower beds, each with side length ' + t(bt(sh.b) + '\\text{ m}') + '. The remainder of the garden is grass.' +
            figSquareBeds(at(sh.g, 3), at(sh.b, 3), sh.n, tx(sh.g), tx(sh.b));
        },
        shared: function (r) {
          return gen(function () {
            var a = r.int(3, 5), b = r.int(1, 3), n = r.chance(0.7) ? 2 : 3, c = r.int(1, 3), g = lin(a, b), bd = lin(1, c);
            if (n * (3 + c) > 3 * a + b - 1) return null;
            var G = P.pow(g, 2), Bd = P.scale(P.pow(bd, 2), n);
            return { a: a, bb: b, n: n, c: c, g: g, b: bd, G: G, Bd: Bd, grass: P.sub(G, Bd) };
          });
        },
        parts: [
          { id: '4a', level: 'EMG', make: function (r, sh) {
            var g = bt(sh.g), b = bt(sh.b), n = sh.n;
            return mcPart(r, 'Which expression gives the area of grass? <i>(The drawing above replaces part (a) of the booklet.)</i>', [
              { html: t(g + '^{2}-' + n + b + '^{2}'), right: true },
              { html: t(g + '^{2}-' + b + '^{2}'), why: 'There are ' + n + ' beds. Each one has area ' + t(b + '^{2}') + '.' },
              { html: t(g + '^{2}-(' + tx(P.scale(sh.b, n)) + ')^{2}'), why: 'That squares ' + n + ' times the side, which is ' + n * n + ' beds’ worth. Square one bed’s side, then multiply by ' + n + '.' },
              { html: t('4' + g + '-' + 4 * n + b), why: t('4\\times\\text{side}') + ' is a perimeter. Area of a square is side squared.' }],
              'Grass = garden − beds = ' + t(g + '^{2}-' + n + b + '^{2}') + '.', ['Area of a square = (side)². How many beds are there?'], 'grass area set-up');
          } },
          { id: '4b', level: 'PRG', make: function (r, sh) {
            var g = bt(sh.g), b = bt(sh.b), n = sh.n, B1 = P.pow(sh.b, 2);
            return polyPart('Write and simplify an expression for the area of grass in the garden (in ' + t('\\text{m}^{2}') + ').', sh.grass, [
              { is: P.sub(sh.G, B1), code: 'one-bed', hint: 'Subtract <b>all ' + n + '</b> beds: ' + t(n + b + '^{2}') + '.' },
              { is: P.sub(sh.G, P.pow(P.scale(sh.b, n), 2)), code: 'side-scaled', hint: t('(' + tx(P.scale(sh.b, n)) + ')^{2}') + ' is the area of one big square, not ' + n + ' beds. Use ' + t(n + b + '^{2}') + '.' },
              { is: P.sub(sqNoMid(sh.g), sh.Bd), code: 'no-middle', hint: t(g + '^{2}') + ' has a middle term: ' + t(g + '^{2}=' + tx(sh.G)) + '.' },
              { is: P.sub(sh.G, P.scale(sqNoMid(sh.b), n)), code: 'no-middle', hint: t(b + '^{2}') + ' has a middle term: ' + t(b + '^{2}=' + tx(B1)) + '.' },
              { is: badSub(sh.G, sh.Bd), code: 'sub-sign', hint: 'Subtract every term of the beds’ area: ' + t('-(' + tx(sh.Bd) + ')=' + tx(P.neg(sh.Bd))) + '.' }],
              steps(['\\text{Garden}=' + g + '^{2}=' + tx(sh.G), '\\text{Beds}=' + n + b + '^{2}=' + n + '(' + tx(B1) + ')=' + tx(sh.Bd), '\\text{Grass}=(' + tx(sh.G) + ')-(' + tx(sh.Bd) + ')=' + tx(sh.grass)]) + ' ' + t('\\text{m}^{2}'),
              ['Garden area minus the area of all the beds.', 'Square each binomial first (don’t forget the middle term), then multiply by the number of beds.'], 'grass area');
          } }] },
      /* ---------- Q5: washer ---------- */
      { num: '5', stem: function (sh) { return 'A metal washer has internal radius ' + t(sh.s + '\\text{ mm}') + ' and width ' + t(sh.w + '\\text{ mm}') + '.' + figWasher(sh.s, sh.w); },
        shared: function (r) { var pr = r.pick([['s', 't'], ['s', 't'], ['r', 'w'], ['a', 'b'], ['p', 'q'], ['m', 'n']]); return { s: pr[0], w: pr[1] }; },
        parts: [
          { id: '5a', level: 'BEG', make: function (r, sh) {
            var s = sh.s, w = sh.w, tgt = P.parse(s + '+' + w);
            return polyPart('Write an expression for the outer radius of the washer.', tgt, [
              { is: P.parse(w), code: 'width-circle', hint: t(w) + ' is only the width of the ring. The outer radius goes from the centre all the way to the outer edge.' },
              { is: P.parse('2' + s + '+' + w), code: 'diameter', hint: 'A radius goes from the centre to the edge once: inner radius, then the width.' },
              { is: P.parse(s + '-' + w), code: 'sign', hint: 'The outer radius is longer than the inner radius.' }],
              'From the centre: the inner radius ' + t(s) + ', then the width ' + t(w) + '. Outer radius ' + t('=(' + s + '+' + w + ')\\text{ mm}') + '.', ['Follow a line from the centre to the outer edge. Which two lengths does it pass through?'], 'washer outer radius', { vars: [s, w] });
          } },
          { id: '5b', level: 'EMG', make: function (r, sh) {
            var s = sh.s, w = sh.w, R = '(' + s + '+' + w + ')';
            return mcPart(r, 'Which expression gives the area of the washer, ' + t('A') + '?', [
              { html: t('\\pi' + R + '^{2}-\\pi ' + s + '^{2}'), right: true },
              { html: t('\\pi' + R + '^{2}'), why: 'That is the whole outer circle. The hole in the middle is not part of the washer.' },
              { html: t('\\pi ' + w + '^{2}'), why: 'A circle of radius ' + t(w) + ' is much smaller than the ring. The ring is the big circle with the small circle removed.' },
              { html: t('2\\pi' + R + '-2\\pi ' + s), why: t('2\\pi r') + ' is a circumference (a length). Area uses ' + t('\\pi r^{2}') + '.' }],
              'The washer is the outer circle (radius ' + t(R) + ') with the hole (radius ' + t(s) + ') removed: ' + t('A=\\pi' + R + '^{2}-\\pi ' + s + '^{2}') + '.', ['The washer is a big circle with a small circle cut out.'], 'washer area set-up');
          } },
          { id: '5c', level: 'EMG', make: function (r, sh) {
            var s = sh.s, w = sh.w, R = P.parse(s + '+' + w), tgt = piMul(P.pow(R, 2));
            return piPart('To show that ' + t('A=2\\pi ' + s + w + '+\\pi ' + w + '^{2}') + ', first expand the area of the outer circle, ' + t('\\pi(' + s + '+' + w + ')^{2}') + '.', tgt, [
              { is: piMul(sqNoMid(R)), code: 'no-middle', hint: t('(' + s + '+' + w + ')^{2}') + ' has a middle term, ' + t('2' + s + w) + '. Square first, then multiply every term by ' + t('\\pi') + '.' },
              { is: piMul(sqMidOnce(R)), code: 'middle-once', hint: 'The middle term of a square is doubled: ' + t('2' + s + w) + '.' },
              { is: P.add(P.mul(P.v(PI), P.pow(P.v(s), 2)), P.scale(P.mul(P.v(s), P.v(w)), 2), P.pow(P.v(w), 2)), code: 'no-pi', hint: 'Multiply <b>every</b> term of ' + t('(' + s + '+' + w + ')^{2}') + ' by ' + t('\\pi') + '.' }],
              steps(['\\pi(' + s + '+' + w + ')^{2}=\\pi(' + s + '^{2}+2' + s + w + '+' + w + '^{2})=\\pi ' + s + '^{2}+2\\pi ' + s + w + '+\\pi ' + w + '^{2}', 'A=(\\pi ' + s + '^{2}+2\\pi ' + s + w + '+\\pi ' + w + '^{2})-\\pi ' + s + '^{2}=2\\pi ' + s + w + '+\\pi ' + w + '^{2}\\ \\checkmark']),
              ['Square the binomial first: ' + t('(a+b)^{2}=a^{2}+2ab+b^{2}') + '.', 'Then multiply each term by ' + t('\\pi') + ' (use the ' + t('\\pi') + ' key).'], 'expand π(s+t)²', [s, w]);
          } }] },
      /* ---------- Q6: equations ---------- */
      { num: '6', stem: 'Solve each equation, where the variable is a real number. Expand both sides first: the squared terms cancel.', parts: [
        { id: '6a', level: 'PRG', make: function (r) {
          var s = gen(function () {
            var a = r.int(2, 3), b = r.pick([-3, -2, -1, 1, 2, 3]), c = r.pick([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]), y0 = r.pick([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]);
            if ((b * c) % y0) return null; var dn = a * c + b + b * c / y0; if (dn % a) return null; var d = dn / a;
            if (!d || d === c || Math.abs(d) > 9) return null; return { a: a, b: b, c: c, d: d, y0: y0 };
          });
          var Lp = P.mul(lin(s.a, s.b, 'y'), lin(1, s.c, 'y')), Rp = P.mul(mono(s.a, 'y'), lin(1, s.d, 'y')), co = s.a * s.c + s.b - s.a * s.d;
          return fracPart(t(bt(lin(s.a, s.b, 'y')) + bt(lin(1, s.c, 'y')) + '=' + s.a + 'y' + bt(lin(1, s.d, 'y'))), [s.y0, 1], [],
            steps(['\\text{LS}=' + tx(Lp), '\\text{RS}=' + tx(Rp)]) + '<br>The ' + t(s.a + 'y^{2}') + ' terms cancel: ' + t(tx(P.sub(Lp, mono(s.a, 'y', 2))) + '=' + tx(P.sub(Rp, mono(s.a, 'y', 2)))) + ', so ' + t('y=' + s.y0) + '.',
            ['Expand both sides, then subtract ' + t(s.a + 'y^{2}') + ' from both sides.', 'Collect the ' + t('y') + ' terms on one side and the numbers on the other.'], 'solve (ay+b)(y+c)=ay(y+d)', 'y=');
        } },
        { id: '6b', level: 'EMG', make: function (r) {
          var k = r.int(2, 6), t0 = r.int(1, 4), m = 2 * k * t0 + k * k;
          return fracPart(t('(t+' + k + ')^{2}=t^{2}+' + m), [t0, 1], [[2 * t0, 'not-doubled', 'Check the middle term: ' + t('(t+' + k + ')^{2}=t^{2}+' + 2 * k + 't+' + k * k) + '.']],
            steps(['t^{2}+' + 2 * k + 't+' + k * k + '=t^{2}+' + m, 2 * k + 't=' + (m - k * k), 't=' + t0]), ['Expand ' + t('(t+' + k + ')^{2}') + ' — remember the middle term.', 'The ' + t('t^{2}') + ' terms cancel, leaving a one-step equation.'], 'solve (t+k)²=t²+m', 't=');
        } },
        { id: '6c', level: 'PRG', make: function (r) {
          var s = gen(function () { var k = r.int(3, 9), m0 = r.int(Math.ceil((k + 1) / 2), k + 3), R = 2 * k * m0 - k * k; return R > 0 && m0 !== k - m0 ? { k: k, m0: m0, R: R } : null; });
          return fracPart(t('m^{2}-(m-' + s.k + ')^{2}=' + s.R), [s.m0, 1], [[s.k - s.m0, 'minus-first', 'The minus sign in front of the bracket changes the sign of <b>every</b> term: ' + t('-(m^{2}-' + 2 * s.k + 'm+' + s.k * s.k + ')=-m^{2}+' + 2 * s.k + 'm-' + s.k * s.k) + '.']],
            steps(['(m-' + s.k + ')^{2}=m^{2}-' + 2 * s.k + 'm+' + s.k * s.k, 'm^{2}-(m^{2}-' + 2 * s.k + 'm+' + s.k * s.k + ')=' + s.R, 2 * s.k + 'm-' + s.k * s.k + '=' + s.R, 2 * s.k + 'm=' + (s.R + s.k * s.k) + ',\\ m=' + s.m0]),
            ['Expand ' + t('(m-' + s.k + ')^{2}') + ' and keep it in brackets.', 'Subtracting a bracket changes the sign of every term inside.'], 'solve m²-(m-k)²=R', 'm=');
        } },
        { id: '6d', level: 'PRG', make: function (r) {
          var s = gen(function () {
            var a = r.int(2, 6), b = r.int(1, 6), c = r.int(1, 6), den = 2 * a - b + c, num = a * a - b * c;
            if (!den || !num || b === c || num % den === 0 || num / den <= 0 || den > 9 || den < 2) return null; return { a: a, b: b, c: c, den: den, num: num };
          });
          var Ls = P.add(mono(2, 'n', 2), P.neg(P.pow(lin(1, -s.a, 'n'), 2))), Rs = P.mul(lin(1, s.b, 'n'), lin(1, -s.c, 'n'));
          var wd = 2 * s.a + s.b - s.c, wn = s.a * s.a + s.b * s.c;
          return fracPart(t('2n^{2}-(n-' + s.a + ')^{2}=(n+' + s.b + ')(n-' + s.c + ')'), [s.num, s.den], wd ? [[wn / wd, 'minus-first', 'The minus sign in front of ' + t('(n-' + s.a + ')^{2}') + ' changes every sign: ' + t('-(n^{2}-' + 2 * s.a + 'n+' + s.a * s.a + ')=-n^{2}+' + 2 * s.a + 'n-' + s.a * s.a) + '.']] : [],
            steps(['\\text{LS}=2n^{2}-(n^{2}-' + 2 * s.a + 'n+' + s.a * s.a + ')=' + tx(Ls), '\\text{RS}=' + tx(Rs), tx(P.sub(Ls, mono(1, 'n', 2))) + '=' + tx(P.sub(Rs, mono(1, 'n', 2))), (s.den === 1 ? '' : s.den) + 'n=' + s.num + ',\\ n=' + frTex(s.num, s.den)]),
            ['Expand each side; keep ' + t('(n-' + s.a + ')^{2}') + ' in brackets while you subtract it.', 'The answer may be a fraction — leave it as an exact fraction.'], 'solve 2n²-(n-a)²=(n+b)(n-c)', 'n=');
        } }] },
      /* ---------- Q7: Pythagorean equation ---------- */
      { num: '7', stem: function (sh) {
          return 'The hypotenuse of a right triangle is ' + t(bt(sh.hyp) + CM) + ' long, and the other two sides are ' + t(bt(sh.l4) + CM) + ' and ' + t(bt(sh.l3) + CM) + '.' + figTri(sh.B, sh.A, tx(sh.l4), tx(sh.l3), tx(sh.hyp));
        },
        shared: function (r) { return triGen(r, 3, 8); },
        parts: [
          { id: '7a', level: 'PRG', make: function (r, sh) {
            return numPart('Form an equation using the Pythagorean theorem and solve it. ' + t('x=') + ' ?', sh.x0, [[2 * sh.x0, 'not-doubled', 'Check the middle term of each square: ' + t('(a+b)^{2}=a^{2}+2ab+b^{2}') + '.'], [-sh.x0, 'sign', 'Check the signs when you expand the squares.']],
              triSolution(sh), ['Hypotenuse² = leg² + leg². Expand all three squares.', 'The ' + t('x^{2}') + ' terms cancel (' + t('9x^{2}+16x^{2}=25x^{2}') + '), leaving a linear equation.'], 'Pythagorean equation for x');
          } },
          { id: '7b', level: 'BEG', make: function (r, sh) {
            return fieldsPart('Determine the lengths of the three sides.', [numF(t(bt(sh.l3)), CM), numF(t(bt(sh.l4)), CM), numF('hypotenuse ' + t(bt(sh.hyp)), CM)],
              [K.number(sh.A), K.number(sh.B), K.number(sh.C)], [String(sh.A), String(sh.B), String(sh.C)], t(sh.A + CM + ',\\ ' + sh.B + CM + ',\\ ' + sh.C + CM),
              'With ' + t('x=' + sh.x0) + ': ' + t('3(' + sh.x0 + ')' + (sh.p < 0 ? '' : '+') + sh.p + '=' + sh.A) + ', ' + t('4(' + sh.x0 + ')' + (sh.q < 0 ? '' : '+') + sh.q + '=' + sh.B) + ', ' + t('5(' + sh.x0 + ')' + (sh.r < 0 ? '' : '+') + sh.r + '=' + sh.C) + '.<br>Check: ' + t(sh.A + '^{2}+' + sh.B + '^{2}=' + F(sh.A * sh.A + sh.B * sh.B) + '=' + sh.C + '^{2}') + ' ✓',
              ['Substitute ' + t('x=' + sh.x0) + ' into each side length.'], 'triangle side lengths');
          } }] },
      /* ---------- Q8: rectangles (5a-2) by (3a+4) ---------- */
      { num: '8', stem: function (sh) { return 'Consider a set of rectangles with sides ' + t(bt(sh.s1) + CM) + ' and ' + t(bt(sh.s2) + CM) + '.'; },
        shared: function (r) {
          return gen(function () {
            var p = r.int(3, 6), rr = r.int(2, p - 1), q = r.int(1, 4), s = r.int(1, 6);
            if ((s + q) % (p - rr)) return null; var aq = (s + q) / (p - rr); if (aq < 2 || aq > 6) return null;
            var ab = r.pick([2.5, 3, 3.5, 4, 4.5, 5.5]); if (ab === aq) return null;
            var s1 = lin(p, -q, 'a'), s2 = lin(rr, s, 'a'); if (p * ab - q <= 0) return null;
            return { p: p, rr: rr, q: q, s: s, aq: aq, ab: ab, s1: s1, s2: s2, per: 2 * ((p + rr) * ab + s - q) };
          });
        },
        parts: [
          { id: '8a', level: 'PRG', make: function (r, sh) {
            var A = P.mul(sh.s1, sh.s2);
            return polyPart('Write and simplify an expression in ' + t('a') + ' for the area of one of these rectangles (in ' + t(u(CM2)) + ').', A, [
              { is: firstLast(sh.s1, sh.s2), code: 'fl-only', hint: 'You need all four products: First, Outside, Inside, Last. The Outside and Inside products give the ' + t('a') + ' terms.' },
              { is: P.scale(P.add(sh.s1, sh.s2), 2), code: 'perimeter', hint: 'That is the perimeter. Area = length × width.' }],
              t(bt(sh.s1) + bt(sh.s2) + '=' + tx(A)) + ' ' + t(u(CM2)) + '.', ['Area = length × width. Multiply every term of one bracket by every term of the other.'], 'rectangle area in a');
          } },
          { id: '8b', level: 'PRG', make: function (r, sh) {
            var v1 = at(sh.s1, sh.ab, 'a'), v2 = at(sh.s2, sh.ab, 'a'), ah = (sh.per - sh.s + sh.q) / (sh.p + sh.rr), d1 = cl(sh.p * ah - sh.q);
            return fieldsPart('One of these rectangles has a perimeter of ' + t(sh.per + CM) + '. Determine its side lengths.', [numF('side ' + t(bt(sh.s1)), CM), numF('side ' + t(bt(sh.s2)), CM)],
              [K.number(v1, function (v) { return Math.abs(v - d1) < 1e-9 ? { code: 'perimeter', hint: 'The perimeter is <b>twice</b> (length + width): ' + t('2[' + bt(sh.s1) + '+' + bt(sh.s2) + ']') + '.' } : Math.abs(v - sh.ab) < 1e-9 ? { code: 'side-not-x', hint: 'That is the value of ' + t('a') + '. Substitute it into the side length.' } : null; }), K.number(v2)],
              [String(v1), String(v2)], t(N(v1) + CM + '\\text{ and }' + N(v2) + CM),
              steps(['P=2[' + bt(sh.s1) + '+' + bt(sh.s2) + ']=2(' + tx(P.add(sh.s1, sh.s2)) + ')=' + tx(P.scale(P.add(sh.s1, sh.s2), 2)), tx(P.scale(P.add(sh.s1, sh.s2), 2)) + '=' + sh.per + '\\ \\Rightarrow\\ a=' + sh.ab]) + '<br>Sides: ' + t(N(v1) + CM) + ' and ' + t(N(v2) + CM) + '. Check: ' + t('2(' + N(v1) + '+' + N(v2) + ')=' + sh.per) + ' ✓',
              ['Perimeter = 2(length + width). Write it in terms of ' + t('a') + ' and set it equal to ' + t(sh.per) + '.', 'Solve for ' + t('a') + ', then substitute into each side.'], 'sides from perimeter');
          } },
          { id: '8c', level: 'EMG', make: function (r, sh) {
            var side = at(sh.s1, sh.aq, 'a');
            return numPart('Another of these rectangles is a square. Determine the length of each side.', side, [[sh.aq, 'side-not-x', 'That is the value of ' + t('a') + '. Substitute it to find the side length.']],
              'A square has equal sides: ' + t(tx(sh.s1) + '=' + tx(sh.s2)) + ', so ' + (sh.p - sh.rr === 1 ? t('a=' + sh.aq) : t((sh.p - sh.rr) + 'a=' + (sh.s + sh.q)) + ' and ' + t('a=' + sh.aq)) + '.<br>Side ' + t('=' + sh.p + '(' + sh.aq + ')-' + sh.q + '=' + side + CM) + ' (check: ' + t(sh.rr + '(' + sh.aq + ')+' + sh.s + '=' + side) + ' ✓).',
              ['In a square the two sides are equal. Set the two expressions equal.'], 'square side', CM);
          } }] },
      /* ---------- Q9: trinomial × binomial rectangle ---------- */
      { num: '9', stem: function (sh) { return 'A rectangle has length ' + t(bt(sh.len) + CM) + ' and width ' + t(bt(sh.wid) + CM) + '.'; },
        shared: function (r) {
          return gen(function () {
            var b = r.int(2, 6), c = r.int(1, 5), d = r.int(2, 3), e = r.int(1, 5), X = r.pick([1.5, 2.5, 3.5]);
            var len = P.add(mono(1, 'x', 2), lin(b, -c)), wid = lin(d, -e), A = P.mul(len, wid);
            if (d * X - e <= 0 || at(len, X) <= 0 || P.count(A) < 4 || at(wid, X) < 1 || !Number.isInteger(cl(at(A, X) * 100))) return null;
            return { b: b, c: c, d: d, e: e, X: X, len: len, wid: wid, A: A };
          });
        },
        parts: [
          { id: '9a', level: 'PRG', make: function (r, sh) {
            return polyPart('Write and simplify an expression for the area of the rectangle in ' + t(u(CM2)) + '.', sh.A, [
              { is: P.sub(P.mul(sh.len, mono(sh.d)), P.num(sh.e)), code: 'fl-only', hint: 'Multiply <b>every</b> term of the trinomial by ' + t('-' + sh.e) + ' as well, not just one of them.' },
              { is: P.add(sh.len, sh.wid), code: 'perimeter', hint: 'Area = length × width: multiply, don’t add.' }],
              'Multiply each term of ' + t(bt(sh.wid)) + ' by each term of the trinomial:<br>' + t(bt(sh.len) + bt(sh.wid) + '=' + P.seq([P.mul(mono(1, 'x', 2), mono(sh.d)), P.mul(mono(1, 'x', 2), P.num(-sh.e)), P.mul(mono(sh.b), mono(sh.d)), P.mul(mono(sh.b), P.num(-sh.e)), P.mul(P.num(-sh.c), mono(sh.d)), P.num(sh.c * sh.e)]) + '=' + tx(sh.A)) + ' ' + t(u(CM2)) + '.',
              ['Multiply ' + t('x^{2}') + ', ' + t(sh.b + 'x') + ' and ' + t('-' + sh.c) + ' each by both terms of ' + t(bt(sh.wid)) + ' — six products.', 'Collect like terms.'], 'trinomial × binomial area');
          } },
          { id: '9b', level: 'EMG', make: function (r, sh) {
            var X = sh.X, l = at(sh.len, X), w = at(sh.wid, X), v = at(sh.A, X);
            return numPart('If ' + t('x=' + X) + ', calculate the area of the rectangle.', v, [[cl(2 * (l + w)), 'perimeter', 'That is the perimeter. Area = length × width.']],
              'At ' + t('x=' + X) + ': length ' + t('=' + N(l) + CM) + ', width ' + t('=' + N(w) + CM) + '. Area ' + t('=' + N(l) + '\\times ' + N(w) + '=' + N(v)) + ' ' + t(u(CM2)) + '.',
              ['Substitute ' + t('x=' + X) + ' into your expression (or find the length and width first and multiply).'], 'area at x=' + X, CM2);
          } }] },
      /* ---------- Q10: dice ---------- */
      { num: '10', stem: function (sh) { return 'Dice for a children’s board game are cubes with an edge length of ' + t(bt(sh.e) + '\\text{ mm}') + '.'; },
        shared: function (r) {
          return gen(function () { var a = r.int(2, 3), b = r.int(1, 2), X = r.int(4, 10), e = lin(a, -b), ev = at(e, X); return gcd(a, b) === 1 && ev >= 9 && ev <= 21 ? { a: a, b: b, X: X, e: e, ev: ev, k: r.pick([2, 3, 3, 4]) } : null; });
        },
        parts: [
          { id: '10a', level: 'PRG', make: function (r, sh) {
            var V = P.pow(sh.e, 3), sq = P.pow(sh.e, 2);
            return polyPart('Write and simplify an expression for the volume of a die in ' + t('\\text{mm}^{3}') + '.', V, [
              { is: P.sub(mono(sh.a * sh.a * sh.a, 'x', 3), P.num(sh.b * sh.b * sh.b)), code: 'cube-terms', hint: 'You can’t cube each term separately: ' + t(bt(sh.e) + '^{3}=' + bt(sh.e) + bt(sh.e) + bt(sh.e)) + '. Square first, then multiply by the third factor.' },
              { is: sq, code: 'square-only', hint: 'That is ' + t(bt(sh.e) + '^{2}') + '. A cube’s volume needs one more factor of ' + t(bt(sh.e)) + '.' }],
              'Square first, then multiply by the third factor:<br>' + steps([bt(sh.e) + '^{2}=' + tx(sq), bt(sh.e) + '(' + tx(sq) + ')=' + tx(V)]) + ' ' + t('\\text{mm}^{3}'),
              ['Volume of a cube = (edge)³ = (edge)(edge)(edge).', 'Square the binomial, then multiply that trinomial by the binomial again.'], 'cube of a binomial');
          } },
          { id: '10b', level: 'ADV', make: function (r, sh) {
            var k = sh.k, n = k * k * k, E = k * sh.ev, mm = E * E * E, v = cl(mm / 1000), one = sh.ev * sh.ev * sh.ev;
            return numPart('The manufacturer packages dice in cubic containers holding ' + t(n) + ' dice. Determine the volume of the container in ' + t('\\text{cm}^{3}') + ' if ' + t('x=' + sh.X) + '.', v,
              [[mm, 'mm-cm', 'That is in ' + t('\\text{mm}^{3}') + '. ' + t('1\\text{ cm}^{3}=10\\times10\\times10=1000\\text{ mm}^{3}') + '.'], [cl(mm / 100), 'mm-cm', 'Check the conversion: ' + t('1\\text{ cm}=10\\text{ mm}') + ', so ' + t('1\\text{ cm}^{3}=1000\\text{ mm}^{3}') + '.'], [cl(mm / 10), 'mm-cm', 'Check the conversion: ' + t('1\\text{ cm}^{3}=1000\\text{ mm}^{3}') + '.'],
                [cl(one / 1000), 'one-die', 'That is one die. The container holds ' + t(n) + ' of them.'], [one, 'one-die', 'That is one die, in ' + t('\\text{mm}^{3}') + '.']],
              'At ' + t('x=' + sh.X) + ' the edge is ' + t(tx(sh.e).replace('x', '(' + sh.X + ')') + '=' + sh.ev + '\\text{ mm}') + ', so one die is ' + t(sh.ev + '^{3}=' + F(one) + MM3) + '.<br>' + t(n + '=' + k + '\\times' + k + '\\times' + k) + ', so the container is ' + k + ' dice along each edge: edge ' + t('=' + E + '\\text{ mm}') + ', ' + t('V=' + E + '^{3}=' + F(mm) + MM3) + '.<br>' + t('1\\text{ cm}^{3}=1000\\text{ mm}^{3}') + ', so ' + t('V=' + N(v) + CM3) + '.',
              ['How many dice fit along one edge of the container? (' + t(n + '=?\\times?\\times?') + ')', 'Work in mm, then convert: ' + t('1\\text{ cm}^{3}=1000\\text{ mm}^{3}') + '.'], 'dice container volume', '\\text{ cm}^{3}');
          } }] },
      /* ---------- Q11: prism with a conjugate pair ---------- */
      { num: '11', stem: function (sh) { return 'A rectangular prism has length ' + t(bt(sh.l) + CM) + ', width ' + t(bt(sh.w) + CM) + ', and height ' + t(bt(sh.h) + CM) + '.' + figPrism(at(sh.l, sh.X), clamp(at(sh.h, sh.X), 0.35 * at(sh.l, sh.X), at(sh.l, sh.X)), clamp(at(sh.w, sh.X), 0.4 * at(sh.l, sh.X), at(sh.l, sh.X)), tx(sh.l), tx(sh.h), tx(sh.w)); },
        shared: function (r) {
          return gen(function () {
            var a = r.int(2, 5), b = r.int(1, 3), c = r.int(2, 3), d = r.int(1, 5), X = r.int(2, 5);
            if (c * X - d < 1 || a * X - b < 1 || a === c * 2 && b === d) return null;
            return { X: X, l: lin(a, -b), w: lin(c, d), h: lin(c, -d), c: c, d: d };
          });
        },
        parts: [
          { id: '11a', level: 'PRG', make: function (r, sh) {
            var wh = P.mul(sh.w, sh.h), V = P.mul(sh.l, wh);
            return polyPart('Write and simplify an expression for the volume of the prism in ' + t(u(CM3)) + '.', V, prismWrongs(sh.l, sh.w, sh.h).concat([
              { is: P.mul(sh.l, P.add(mono(sh.c * sh.c, 'x', 2), P.num(sh.d * sh.d))), code: 'conj-sign', hint: t(bt(sh.w) + bt(sh.h)) + ' is a sum times a difference: the last term is ' + t('(' + sh.d + ')(-' + sh.d + ')=-' + sh.d * sh.d) + '.' }]),
              'Multiply the sum-and-difference pair first: ' + t(bt(sh.w) + bt(sh.h) + '=' + tx(wh)) + '.<br>' + t('V=' + bt(sh.l) + '(' + tx(wh) + ')=' + tx(V)) + ' ' + t(u(CM3)) + '.',
              ['Volume = length × width × height.', 'Two of the factors are a sum and a difference of the same terms — multiply those first.'], 'prism volume');
          } },
          { id: '11b', level: 'PRG', make: function (r, sh) {
            var SA = saOf(sh.l, sh.w, sh.h);
            return polyPart('Write and simplify an expression for the surface area of the prism in ' + t(u(CM2)) + '.', SA, saWrongs(sh.l, sh.w, sh.h), saSolution(sh.l, sh.w, sh.h, CM2),
              [t('SA=2(lw+lh+wh)') + ': three different faces, two of each.', 'Expand the three products, add them, then double.'], 'prism surface area');
          } },
          { id: '11c', level: 'EMG', make: function (r, sh) {
            var X = sh.X, l = at(sh.l, X), w = at(sh.w, X), h = at(sh.h, X), V = l * w * h, S = 2 * (l * w + l * h + w * h);
            return fieldsPart('If ' + t('x=' + X) + ', calculate the volume and the surface area of the prism.', [numF('volume', CM3), numF('surface area', CM2)],
              [K.number(V, function (v) { return v === S ? { code: 'swap', hint: 'That is the surface area.' } : null; }), K.number(S, function (v) { return v === S / 2 ? { code: 'sa-half', hint: 'Two of each face: double it.' } : v === V ? { code: 'swap', hint: 'That is the volume.' } : null; })],
              [String(V), String(S)], 'volume ' + t(F(V) + CM3) + ', surface area ' + t(F(S) + CM2),
              'At ' + t('x=' + X) + ': ' + t('l=' + l + ',\\ w=' + w + ',\\ h=' + h) + ' (cm).<br>' + t('V=' + l + '\\times' + w + '\\times' + h + '=' + F(V)) + ' ' + t(u(CM3)) + '; ' + t('SA=2(' + l * w + '+' + l * h + '+' + w * h + ')=' + F(S)) + ' ' + t(u(CM2)) + '.',
              ['Find the three dimensions at ' + t('x=' + X) + ' first, or substitute into your expressions.'], 'prism V and SA at x=' + X);
          } }] },
      /* ---------- Q12: MC zero parameters ---------- */
      { num: '12', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '12', level: 'EMG', make: function (r) {
          var p = r.int(2, 6), q = r.chance(0.25) ? p : r.pick([2, 3, 4, 5, 6, 7].filter(function (v) { return v !== p; }));
          var V = P.mul(P.v('y'), lin(1, -p, 'y'), lin(1, q, 'y')), zeros = 4 - P.count(V);
          var opts = [0, 1, 2, 3].map(function (n) {
            return { html: t(n), right: n === zeros, why: n === 0 ? 'Look at the constant term ' + t('d') + ': every term of the product contains a factor ' + t('y') + '.' : n === 3 ? 'Only the terms that are actually missing count. Expand fully and look at each coefficient.' : n < zeros ? 'Expand fully: ' + t('y(y-' + p + ')(y+' + q + ')') + '. Is the ' + t('y^{2}') + ' coefficient really nonzero?' : 'Check the ' + t('y^{2}') + ' coefficient: it is ' + t(q + '-' + p + '=' + (q - p)) + '.' };
          });
          return mcPart(r, 'A box is a rectangular prism. Its length is ' + t('y\\text{ cm}') + ', its width is ' + t(p + '\\text{ cm}') + ' less than the length, and its height is ' + t(q + '\\text{ cm}') + ' more than the length. If its volume is written ' + t('V=ay^{3}+by^{2}+cy+d') + ' with integers ' + t('a,b,c,d') + ', how many of ' + t('a,b,c,d') + ' are equal to zero?', opts,
            t('V=y(y-' + p + ')(y+' + q + ')=y(' + tx(P.mul(lin(1, -p, 'y'), lin(1, q, 'y'))) + ')=' + tx(V)) + '. So ' + t('a=1,\\ b=' + (q - p) + ',\\ c=' + (-p * q) + ',\\ d=0') + ': ' + (zeros === 1 ? 'exactly one parameter is zero.' : 'two parameters are zero.'),
            ['Write the width and height in terms of ' + t('y') + ', multiply all three, and look at every coefficient.'], 'MC zero parameters', true);
        } }] },
      /* ---------- Q13: NR equal areas ---------- */
      { num: '13', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '13', level: 'PRG', make: function (r) {
          var s = gen(function () { var p = r.int(1, 5), q = r.int(p + 1, p + 9), x = p * q / (q - p); return Number.isInteger(x) || x > 99 || Math.abs((x * 10) % 1 - 0.5) < 1e-6 ? null : { p: p, q: q, x: x }; });
          var x = s.x;
          return B.approx('A square has side length ' + t('x\\text{ cm}') + '. A rectangle has side lengths ' + t('(x-' + s.p + ')\\text{ cm}') + ' and ' + t('(x+' + s.q + ')\\text{ cm}') + '. If the square and the rectangle are equal in area, the value of ' + t('x') + ', to the nearest tenth, is ________.', x, 1,
            { nr: true, diag: function (v) { var w = K.roundTo(s.p * s.q / (s.q + s.p), 1); return Math.abs(v - w) < 1e-9 ? { code: 'sign', hint: 'Check the ' + t('x') + ' term of ' + t('(x-' + s.p + ')(x+' + s.q + ')') + ': it is ' + t('(' + s.q + '-' + s.p + ')x') + '.' } : null; } },
            steps(['x^{2}=(x-' + s.p + ')(x+' + s.q + ')=' + tx(P.mul(lin(1, -s.p), lin(1, s.q))), '0=' + (s.q - s.p === 1 ? '' : s.q - s.p) + 'x-' + s.p * s.q + '\\ \\Rightarrow\\ x=' + frTex(s.p * s.q, s.q - s.p) + '\\approx ' + K.roundTo(x, 1).toFixed(1)]),
            ['Set the two areas equal and expand: the ' + t('x^{2}') + ' terms cancel.'], 'NR equal areas');
        } }] },
      /* ---------- Q14: NR Pythagoras with x and x-p ---------- */
      { num: '14', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '14', level: 'PRG', make: function (r) {
          var s = gen(function () { var p = r.pick([2, 4, 5, 8]), Lg = r.int(8, 30), x = (p * p + Lg * Lg) / (2 * p), per = 2 * x - p + Lg; return Lg > p + 3 && Math.abs(per - Math.round(per) - 0.5) > 1e-6 && Math.abs(per - Math.round(per) + 0.5) > 1e-6 && per < 9999 && !Number.isInteger(per) ? { p: p, L: Lg, x: x, per: per } : null; });
          return B.approx('A right triangle has one leg of length ' + t('(x-' + s.p + ')\\text{ cm}') + ', the other leg of length ' + t(s.L + CM) + ', and a hypotenuse of length ' + t('x\\text{ cm}') + '. The perimeter of the triangle, to the nearest centimetre, is ________ cm.' + figTri(s.L, Math.max(1, s.x - s.p), s.L + '\\text{ cm}', 'x-' + s.p, 'x'), s.per, 0,
            { nr: true, diag: function (v) { return Math.abs(v - Math.round(s.x)) < 1e-9 || Math.abs(v - Math.floor(s.x)) < 1e-9 ? { code: 'given-x', hint: 'That is about the value of ' + t('x') + ' (the hypotenuse). The question asks for the perimeter: add all three sides.' } : null; } },
            steps(['x^{2}=(x-' + s.p + ')^{2}+' + s.L + '^{2}=x^{2}-' + 2 * s.p + 'x+' + s.p * s.p + '+' + s.L * s.L, '0=-' + 2 * s.p + 'x+' + (s.p * s.p + s.L * s.L) + '\\ \\Rightarrow\\ x=' + N(cl(s.x))]) + '<br>Sides: ' + t(N(cl(s.x - s.p)) + ',\\ ' + s.L + ',\\ ' + N(cl(s.x))) + '. Perimeter ' + t('=' + N(cl(s.per)) + '\\approx ' + Math.round(s.per) + CM) + '.',
            ['Pythagorean theorem: ' + t('x^{2}=(x-' + s.p + ')^{2}+' + s.L + '^{2}') + '. The ' + t('x^{2}') + ' terms cancel.', 'Then add the three sides.'], 'NR triangle perimeter');
        } }] }
    ],
    extra: [
      /* ---------- EP1: photo on a mat of constant width ---------- */
      { num: '1', section: 'Extra practice A — Shaded and composite regions', stem: function (sh) {
          return 'A rectangular photograph measuring ' + t(bt(sh.pl) + CM) + ' by ' + t(bt(sh.pw) + CM) + ' is mounted on a rectangular mat. The mat is a uniform ' + t(sh.w + CM) + ' wide on all four sides. The shaded region is the mat itself.' +
            figFrame(at(sh.lo, sh.X), at(sh.wo, sh.X), at(sh.pl, sh.X), at(sh.pw, sh.X), { inner: [tx(sh.pl), '\\text{by }' + tx(sh.pw)], border: String(sh.w), label: 'photo on a mat' });
        },
        shared: function (r) {
          return gen(function () {
            var a = r.int(2, 4), b = r.int(1, 6), c = r.int(1, 3), d = r.int(1, 6), w = r.int(2, 5), X = r.int(2, 6);
            if (c > a || (a === c && b === d)) return null;
            var pl = lin(a, b), pw = lin(c, d), lo = lin(a, b + 2 * w), wo = lin(c, d + 2 * w), O = P.mul(lo, wo), Ph = P.mul(pl, pw);
            return { a: a, b: b, c: c, d: d, w: w, X: X, pl: pl, pw: pw, lo: lo, wo: wo, O: O, Ph: Ph, mat: P.sub(O, Ph), O1: P.mul(lin(a, b + w), lin(c, d + w)) };
          });
        },
        parts: [
          { id: 'e1a', level: 'BEG', make: function (r, sh) {
            var hint1 = 'The mat adds ' + t(sh.w) + ' at <b>both</b> ends of each side, so each dimension grows by ' + t('2(' + sh.w + ')=' + 2 * sh.w) + '.';
            return fieldsPart('Write the outer length and the outer width of the mat in terms of ' + t('x') + '.', [polyF('outer length'), polyF('outer width')],
              [K.poly(sh.lo, { wrong: [{ is: lin(sh.a, sh.b + sh.w), code: 'one-end-border', hint: hint1 }] }), K.poly(sh.wo, { wrong: [{ is: lin(sh.c, sh.d + sh.w), code: 'one-end-border', hint: hint1 }] })],
              [tx(sh.lo), tx(sh.wo)], t(tx(sh.lo) + CM) + ' by ' + t(tx(sh.wo) + CM),
              'Each dimension gains ' + t(sh.w) + ' at both ends: ' + t('+' + 2 * sh.w) + '.<br>' + t(bt(sh.pl) + '+' + 2 * sh.w + '=' + tx(sh.lo)) + ' and ' + t(bt(sh.pw) + '+' + 2 * sh.w + '=' + tx(sh.wo)) + '.',
              ['Follow the long side from one outer edge to the other: mat, photo, mat.'], 'mat outer dimensions');
          } },
          { id: 'e1b', level: 'PRG', make: function (r, sh) {
            return polyPart('Expand the outer area and the photograph’s area, then subtract to find the shaded area (in ' + t(u(CM2)) + ').', sh.mat, [
              { is: P.sub(sh.O1, sh.Ph), code: 'one-end-border', hint: 'Check the outer sides: the mat is ' + t(sh.w) + ' wide on <b>both</b> ends, so each side grows by ' + t(2 * sh.w) + '.' },
              { is: sh.O, code: 'outer-only', hint: 'That is the whole outer rectangle. Subtract the photograph.' },
              { is: badSub(sh.O, sh.Ph), code: 'sub-sign', hint: 'Subtract every term of the photograph’s area: ' + t('-(' + tx(sh.Ph) + ')=' + tx(P.neg(sh.Ph))) + '.' }],
              steps(['\\text{Outer}=' + bt(sh.lo) + bt(sh.wo) + '=' + tx(sh.O), '\\text{Photo}=' + bt(sh.pl) + bt(sh.pw) + '=' + tx(sh.Ph), '\\text{Mat}=(' + tx(sh.O) + ')-(' + tx(sh.Ph) + ')=' + tx(sh.mat)]) + ' ' + t(u(CM2)),
              ['Outer area − photograph area.', 'The ' + t('x^{2}') + ' terms should cancel.'], 'mat area');
          } },
          { id: 'e1c', level: 'BEG', make: function (r, sh) {
            var X = sh.X, v = at(sh.mat, X), lo = at(sh.lo, X), wo = at(sh.wo, X), pl = at(sh.pl, X), pw = at(sh.pw, X);
            return numPart('Find the shaded area when ' + t('x=' + X) + '.', v, [[at(P.sub(sh.O1, sh.Ph), X), 'one-end-border', 'Each outer side is ' + t(2 * sh.w) + ' longer than the photo, not ' + t(sh.w) + '.'], [at(sh.O, X), 'outer-only', 'Subtract the photograph.']],
              t(tx(sh.mat).replace(/x/g, '(' + X + ')') + '=' + N(v)) + ' ' + t(u(CM2)) + '.<br>Check: outer ' + t(lo + '\\times' + wo + '=' + lo * wo) + ', photo ' + t(pl + '\\times' + pw + '=' + pl * pw) + ', ' + t(lo * wo + '-' + pl * pw + '=' + N(v)) + ' ✓',
              ['Substitute into your answer to (b), or work out both real rectangles and subtract.'], 'mat area at x=' + X, CM2);
          } },
          { id: 'e1d', level: 'EMG', make: function (r, sh) {
            var x2 = sh.a * sh.c === 1 ? 'x^{2}' : sh.a * sh.c + 'x^{2}';
            return mcPart(r, 'Your answer to (b) is not a quadratic — the ' + t('x^{2}') + ' terms cancelled. Why does a mat of <b>constant</b> width force that?', [
              { html: 'The mat adds only a <b>number</b> to each side, so the outer sides still start with ' + t(sh.a + 'x') + ' and ' + t(sh.c === 1 ? 'x' : sh.c + 'x') + '. Both areas have the same ' + t(x2) + ', and subtracting removes it.', right: true },
              { html: 'Because the mat width ' + t(sh.w) + ' is a whole number.', why: 'A width of ' + t('2.5') + ' would cancel just the same. What matters is that the width is a constant, not that it is whole.' },
              { html: 'Because the ' + t('x^{2}') + ' terms always cancel when one area is subtracted from another.', why: 'Not always — in Question 4 the path is ' + t('x') + ' wide and the ' + t('x^{2}') + ' terms do <b>not</b> cancel.' },
              { html: 'Because the mat is smaller than the photograph.', why: 'Compare the leading terms of the two areas you subtracted. Where does each ' + t('x^{2}') + ' term come from?' }],
              'Outer ' + t('=' + bt(sh.lo) + bt(sh.wo)) + ' and photo ' + t('=' + bt(sh.pl) + bt(sh.pw)) + ' both start with ' + t(x2) + ' because the border only changes the constant terms of the sides. What is left is the border itself: strips ' + t(sh.w) + ' cm wide (degree 1) plus the corner squares.',
              ['Look at where the ' + t('x^{2}') + ' term of each area comes from.'], 'why x² cancels');
          } }] },
      /* ---------- EP2: L-shape with an arm ---------- */
      { num: '2', stem: function (sh) {
          var X = sh.X;
          return 'The L-shaped figure is ' + t(bt(sh.W)) + ' wide and ' + t(bt(sh.H)) + ' tall overall. Its upright arm is ' + t(tx(sh.arm)) + ' wide and its bottom band is ' + t(bt(sh.band)) + ' tall. The dashed rectangle is the missing corner.' +
            figL(at(sh.W, X), at(sh.H, X), at(sh.nw, X), at(sh.nh, X), 'tr', { bottom: tx(sh.W), left: tx(sh.H), armTop: tx(sh.arm), bandRight: tx(sh.band) }, { join: true, label: 'L-shaped figure' });
        },
        shared: function (r) {
          return gen(function () {
            var k = r.int(2, 4), e = r.int(1, 3), m = r.int(1, 5), d = r.int(1, 3), X = r.int(2, 3), a = k + e, f = m + d;
            if (k * X - m < 1 || a > 7) return null;
            var W = lin(a, m), H = lin(k + 1, d), arm = mono(e), band = lin(1, f), up = lin(k, -m), nw = lin(k, m), nh = up;
            var bottom = P.mul(W, band), upright = P.mul(arm, up), area = P.add(bottom, upright), box = P.mul(W, H), notch = P.mul(nw, nh);
            return { k: k, e: e, m: m, d: d, f: f, a: a, X: X, W: W, H: H, arm: arm, band: band, up: up, nw: nw, nh: nh, bottom: bottom, upright: upright, area: area, box: box, notch: notch };
          });
        },
        parts: [
          { id: 'e2a', level: 'EMG', make: function (r, sh) {
            return polyPart('Cut the figure along the dotted line into a bottom rectangle and an upright rectangle. Only the width of the upright rectangle is printed. What is its <b>height</b>?', sh.up, [
              { is: sh.H, code: 'one-piece', hint: 'That is the height of the whole figure. The upright rectangle sits on top of the bottom band.' },
              { is: sh.band, code: 'one-piece', hint: 'That is the height of the bottom band. The upright rectangle is the part above it.' },
              { is: P.add(sh.H, sh.band), code: 'added', hint: 'The upright rectangle is the overall height <b>minus</b> the band.' }],
              'Overall height minus the band: ' + t(bt(sh.H) + '-' + bt(sh.band) + '=' + tx(sh.up)) + '.', ['The overall height is made of the band plus the upright rectangle.'], 'upright height');
          } },
          { id: 'e2b', level: 'PRG', make: function (r, sh) {
            return polyPart('Write the total area as the sum of the two rectangles, and simplify.', sh.area, [
              { is: sh.box, code: 'bounding-box', hint: 'That is the whole bounding box, including the missing corner.' },
              { is: sh.bottom, code: 'one-piece', hint: 'That is only the bottom rectangle. Add the upright one.' },
              { is: P.add(sh.bottom, P.mul(sh.arm, sh.H)), code: 'one-piece', hint: 'The upright rectangle is only ' + t(bt(sh.up)) + ' tall, not the full height — the band is already counted.' }],
              steps(['\\text{Bottom}=' + bt(sh.W) + bt(sh.band) + '=' + tx(sh.bottom), '\\text{Upright}=' + tx(sh.arm) + bt(sh.up) + '=' + tx(sh.upright), '\\text{Area}=' + tx(sh.area)]) +
                '<br>Check: box minus notch ' + t('=(' + tx(sh.box) + ')-(' + tx(sh.notch) + ')=' + tx(sh.area)) + ' ✓',
              ['Bottom rectangle: full width × band height. Upright rectangle: arm width × the height you found in (a).'], 'L-shape by adding pieces');
          } },
          { id: 'e2c', level: 'EMG', make: function (r, sh) {
            return fieldsPart('<b>Bounding box minus the notch.</b> Neither side of the dashed notch is printed. Write its width and its height.', [polyF('notch width'), polyF('notch height')],
              [K.poly(sh.nw, { wrong: [{ is: sh.W, code: 'one-piece', hint: 'That is the full width. Take away the arm.' }, { is: lin(sh.k, -sh.m), code: 'sign', hint: 'Width = overall width − arm: ' + t(bt(sh.W) + '-' + tx(sh.arm)) + '.' }] }), K.poly(sh.nh, { wrong: [{ is: sh.band, code: 'one-piece', hint: 'That is the band. The notch is beside the upright arm.' }] })],
              [tx(sh.nw), tx(sh.nh)], 'width ' + t(tx(sh.nw)) + ', height ' + t(tx(sh.nh)),
              'Width ' + t('=' + bt(sh.W) + '-' + tx(sh.arm) + '=' + tx(sh.nw)) + '; height ' + t('=' + bt(sh.H) + '-' + bt(sh.band) + '=' + tx(sh.nh)) + '.', ['The notch is the part of the bounding box to the right of the arm and above the band.'], 'notch dimensions');
          } },
          { id: 'e2d', level: 'EMG', make: function (r, sh) {
            return polyPart('Find the area of the notch, ' + t(bt(sh.nw) + bt(sh.nh)) + '. (It is a difference of squares.)', sh.notch, [
              { is: P.add(mono(sh.k * sh.k, 'x', 2), P.num(sh.m * sh.m)), code: 'conj-sign', hint: 'The last term is ' + t('(' + sh.m + ')(-' + sh.m + ')=-' + sh.m * sh.m) + '.' }],
              t(bt(sh.nw) + bt(sh.nh) + '=' + tx(sh.notch)) + ' (the ' + t('x') + ' terms cancel).<br>Then ' + t('(' + tx(sh.box) + ')-(' + tx(sh.notch) + ')=' + tx(sh.area)) + ', the same as (b).', ['Sum × difference: ' + t('(a+b)(a-b)=a^{2}-b^{2}') + '.'], 'notch area');
          } },
          { id: 'e2e', level: 'BEG', make: function (r, sh) {
            var X = sh.X, v = at(sh.area, X);
            return numPart('Check: find the area of the figure when ' + t('x=' + X) + '.', v, [[at(sh.box, X), 'bounding-box', 'Remove the missing corner.']],
              'At ' + t('x=' + X) + ': bottom ' + t(at(sh.W, X) + '\\times' + at(sh.band, X)) + ', upright ' + t(at(sh.arm, X) + '\\times' + at(sh.up, X)) + ': ' + t(at(sh.bottom, X) + '+' + at(sh.upright, X) + '=' + v) + '.<br>Box minus notch: ' + t(at(sh.box, X) + '-' + at(sh.notch, X) + '=' + v) + ' ✓',
              ['Substitute into your trinomial, or work out the real rectangles.'], 'L-shape at x=' + X);
          } }] },
      /* ---------- EP3: circle inscribed in a square ---------- */
      { num: '3', stem: function (sh) { return 'A circle is inscribed in a square of side ' + t(bt(sh.side) + CM) + ' — it touches all four sides. The shaded region is what is left of the square outside the circle.' + figCircleSquare(tx(sh.side)); },
        shared: function (r) { var k = r.int(1, 5), X = r.int(1, 4), side = lin(2, 2 * k), rad = lin(1, k); return { k: k, X: X, side: side, rad: rad, Sq: P.pow(side, 2), Ci: piMul(P.pow(rad, 2)) }; },
        parts: [
          { id: 'e3a', level: 'BEG', make: function (r, sh) {
            return polyPart('Write the radius of the circle in terms of ' + t('x') + '.', sh.rad, [{ is: sh.side, code: 'diameter', hint: 'The side of the square is the circle’s <b>diameter</b>. The radius is half of it.' }],
              'The diameter equals the side of the square, so ' + t('r=\\tfrac12' + bt(sh.side) + '=' + tx(sh.rad)) + ' cm.', ['The circle touches both sides of the square: its diameter is the side length.'], 'inscribed radius');
          } },
          { id: 'e3b', level: 'PRG', make: function (r, sh) {
            var tgt = P.sub(sh.Sq, sh.Ci);
            return piPart('Write the shaded area, leaving ' + t('\\pi') + ' in your answer. Expand both the square’s area and the circle’s area.', tgt, [
              { is: P.sub(sh.Sq, piMul(P.pow(sh.side, 2))), code: 'diameter', hint: 'The circle’s radius is ' + t(bt(sh.rad)) + ', half the side.' },
              { is: P.sub(sh.Sq, piMul(sqNoMid(sh.rad))), code: 'no-middle', hint: t(bt(sh.rad) + '^{2}') + ' has a middle term: ' + t(tx(P.pow(sh.rad, 2))) + '.' },
              { is: P.sub(sqNoMid(sh.side), sh.Ci), code: 'no-middle', hint: t(bt(sh.side) + '^{2}') + ' has a middle term: ' + t(tx(sh.Sq)) + '.' },
              { is: badSub(sh.Sq, sh.Ci), code: 'sub-sign', hint: 'Subtract every term of the circle’s area: ' + t('-\\pi(' + tx(P.pow(sh.rad, 2)) + ')=' + piTex(P.neg(sh.Ci))) + '.' },
              { is: P.sub(sh.Sq, piMul(sh.rad)), code: 'no-square', hint: 'The circle’s area is ' + t('\\pi r^{2}') + ': square the radius.' }],
              steps(['\\text{Square}=' + bt(sh.side) + '^{2}=' + tx(sh.Sq), '\\text{Circle}=\\pi' + bt(sh.rad) + '^{2}=\\pi(' + tx(P.pow(sh.rad, 2)) + ')=' + piTex(sh.Ci), '\\text{Shaded}=' + piTex(tgt)]) + ' ' + t(u(CM2)),
              ['Shaded = square − circle, with ' + t('r=' + tx(sh.rad)) + '.', 'Multiply each term of ' + t(bt(sh.rad) + '^{2}') + ' by ' + t('\\pi') + ' (use the ' + t('\\pi') + ' key), then subtract.'], 'square minus circle with π');
          } },
          { id: 'e3c', level: 'EMG', make: function (r, sh) {
            var X = sh.X, s = at(sh.side, X), rr = at(sh.rad, X), v = s * s - Math.PI * rr * rr;
            return B.approx('Find the shaded area when ' + t('x=' + X) + ', to the nearest tenth of a square centimetre.', v, 1, { after: t(u(CM2)), diag: function (val) { return Math.abs(val - K.roundTo(Math.PI * rr * rr, 1)) < 1e-9 ? { code: 'wrong-circle', hint: 'That is the circle. The shaded part is the square minus the circle.' } : Math.abs(val - K.roundTo(s * s - Math.PI * s * s, 1)) < 1e-9 ? { code: 'diameter', hint: 'Use the radius, not the side.' } : null; } },
              'At ' + t('x=' + X) + ' the side is ' + t(s + CM) + ' and the radius is ' + t(rr + CM) + ': ' + t(s + '^{2}-\\pi(' + rr + ')^{2}=' + s * s + '-' + rr * rr + '\\pi\\approx ' + K.roundTo(v, 1).toFixed(1)) + ' ' + t(u(CM2)) + '.',
              ['Substitute into your answer to (b), or use the real side and radius. Use the ' + t('\\pi') + ' key on your calculator.'], 'shaded area at x=' + X);
          } },
          { id: 'e3d', level: 'PRG', make: function (r, sh) {
            return mcPart(r, 'Divide the circle’s area by the square’s area and simplify. What do you find?', [
              { html: t('\\dfrac{\\pi}{4}\\approx 0.785') + ': the ' + t('x') + ' cancels, so the circle always covers about ' + t('78.5\\%') + ' of <b>any</b> such square.', right: true },
              { html: t('\\dfrac{\\pi}{2}') + ', because the radius is half the side.', why: 'The radius is half the side, but areas use the <b>square</b> of the radius: ' + t('\\left(\\tfrac12\\right)^{2}=\\tfrac14') + '.' },
              { html: 'It depends on ' + t('x') + ': a bigger square has a larger share covered by its circle.', why: 'Write the square’s side as ' + t('2' + bt(sh.rad)) + '. What happens to ' + t(bt(sh.rad) + '^{2}') + ' when you divide?' },
              { html: 'It can’t be simplified, so there is no fixed fraction.', why: t('(2x+' + 2 * sh.k + ')^{2}=4(x+' + sh.k + ')^{2}') + '. Now divide.' }],
              t('\\dfrac{\\pi' + bt(sh.rad) + '^{2}}{' + bt(sh.side) + '^{2}}=\\dfrac{\\pi' + bt(sh.rad) + '^{2}}{4' + bt(sh.rad) + '^{2}}=\\dfrac{\\pi}{4}\\approx0.785') + '. The ' + t('x') + ' cancels completely, so an inscribed circle always covers about ' + t('78.5\\%') + ' of its square.',
              ['Factor the side: ' + t(tx(sh.side) + '=2' + bt(sh.rad)) + '.'], 'circle-to-square ratio');
          } }] },
      /* ---------- EP4: path of width x around a garden ---------- */
      { num: '4', stem: function (sh) {
          return 'A rectangular garden measures ' + t(bt(sh.gl) + '\\text{ m}') + ' by ' + t(bt(sh.gw) + '\\text{ m}') + '. A gravel path of uniform width ' + t('x\\text{ m}') + ' is laid all the way around the outside of it. The shaded region is the path.' +
            figFrame(at(sh.lo, sh.X), at(sh.wo, sh.X), at(sh.gl, sh.X), at(sh.gw, sh.X), { inner: ['\\text{garden}', bt(sh.gl) + '\\text{ by }' + bt(sh.gw)], border: 'x', label: 'garden with a path' });
        },
        shared: function (r) {
          return gen(function () {
            var a = r.int(2, 4), b = r.int(1, 4), c = r.int(1, 3), d = r.int(1, 5), X = r.int(2, 4);
            if (c > a || (a === c && b === d)) return null;
            var gl = lin(a, b), gw = lin(c, d), lo = lin(a + 2, b), wo = lin(c + 2, d), O = P.mul(lo, wo), G = P.mul(gl, gw);
            return { a: a, b: b, c: c, d: d, X: X, gl: gl, gw: gw, lo: lo, wo: wo, O: O, G: G, path: P.sub(O, G), O1: P.mul(lin(a + 1, b), lin(c + 1, d)) };
          });
        },
        parts: [
          { id: 'e4a', level: 'EMG', make: function (r, sh) {
            var h = 'The path is ' + t('x') + ' wide at <b>both</b> ends, so each dimension grows by ' + t('2x') + '.';
            return fieldsPart('Write the outer length and the outer width of the gravelled rectangle in terms of ' + t('x') + '.', [polyF('outer length'), polyF('outer width')],
              [K.poly(sh.lo, { wrong: [{ is: lin(sh.a + 1, sh.b), code: 'one-end-border', hint: h }] }), K.poly(sh.wo, { wrong: [{ is: lin(sh.c + 1, sh.d), code: 'one-end-border', hint: h }] })],
              [tx(sh.lo), tx(sh.wo)], t(tx(sh.lo) + '\\text{ m}') + ' by ' + t(tx(sh.wo) + '\\text{ m}'),
              'Add ' + t('x') + ' at each end: ' + t(bt(sh.gl) + '+2x=' + tx(sh.lo)) + ' and ' + t(bt(sh.gw) + '+2x=' + tx(sh.wo)) + '.', ['Across the long side: path, garden, path.'], 'path outer dimensions');
          } },
          { id: 'e4b', level: 'PRG', make: function (r, sh) {
            return polyPart('Determine a simplified expression for the area of the path (in ' + t('\\text{m}^{2}') + ').', sh.path, [
              { is: P.sub(sh.O1, sh.G), code: 'one-end-border', hint: 'Each outer side is ' + t('2x') + ' longer than the garden (the path is on both ends).' },
              { is: sh.O, code: 'outer-only', hint: 'That is the whole outer rectangle. Subtract the garden.' },
              { is: badSub(sh.O, sh.G), code: 'sub-sign', hint: 'Subtract every term of the garden’s area: ' + t('-(' + tx(sh.G) + ')=' + tx(P.neg(sh.G))) + '.' }],
              steps(['\\text{Outer}=' + bt(sh.lo) + bt(sh.wo) + '=' + tx(sh.O), '\\text{Garden}=' + bt(sh.gl) + bt(sh.gw) + '=' + tx(sh.G), '\\text{Path}=' + tx(sh.path)]) + ' ' + t('\\text{m}^{2}'),
              ['Outer rectangle − garden.'], 'path area');
          } },
          { id: 'e4c', level: 'BEG', make: function (r, sh) {
            var X = sh.X, v = at(sh.path, X), lo = at(sh.lo, X), wo = at(sh.wo, X), gl = at(sh.gl, X), gw = at(sh.gw, X);
            return numPart('Calculate the area of the path when ' + t('x=' + X) + '.', v, [[at(sh.O, X), 'outer-only', 'Subtract the garden.']],
              t(tx(sh.path).replace(/x/g, '(' + X + ')') + '=' + v) + ' ' + t('\\text{m}^{2}') + '. Check: ' + t(lo + '\\times' + wo + '-' + gl + '\\times' + gw + '=' + lo * wo + '-' + gl * gw + '=' + v) + ' ✓',
              ['Substitute into your answer to (b).'], 'path area at x=' + X, M2);
          } },
          { id: 'e4d', level: 'PRG', make: function (r, sh) {
            return mcPart(r, 'Around the photograph in Question 1 the mat was a fixed number of centimetres wide, and the ' + t('x^{2}') + ' terms cancelled. Here they do not. Why?', [
              { html: 'This border is ' + t('x') + ' wide, so it grows with ' + t('x') + ': the outer sides become ' + t(tx(sh.lo)) + ' and ' + t(tx(sh.wo)) + ', and the outer area has a bigger ' + t('x^{2}') + ' term than the garden.', right: true },
              { html: 'Because a garden is measured in metres and a photograph in centimetres.', why: 'Units don’t change the algebra. Compare the leading terms of the outer area and the garden area.' },
              { html: 'Because the garden is not a square.', why: 'The photograph wasn’t a square either. Look at how the border changes the ' + t('x') + ' terms of the sides.' },
              { html: 'Because here we subtract the garden from the outer rectangle instead of adding.', why: 'Both questions subtract the inside rectangle. The difference is in the border width.' }],
              'With a fixed border the outer sides keep ' + t('ax') + ' and ' + t('cx') + ', so both areas have the same ' + t('x^{2}') + ' term. With a border of width ' + t('x') + ' the outer sides are ' + t(tx(sh.lo)) + ' and ' + t(tx(sh.wo)) + ': outer area ' + t(tx(sh.O)) + ' against the garden’s ' + t(tx(sh.G)) + ', leaving ' + t(tx(sh.path)) + '.',
              ['Compare the ' + t('x') + ' terms of the outer sides in the two questions.'], 'why x² stays');
          } }] },
      /* ---------- EP5: cylinder ---------- */
      { num: '5', section: 'Extra practice B — Volume and surface area', stem: function (sh) { return 'A closed cylindrical can has radius ' + t(bt(sh.r) + CM) + ' and height ' + t(tx(sh.h) + CM) + '. Leave ' + t('\\pi') + ' in every answer.' + figCylinder(tx(sh.r), tx(sh.h)); },
        shared: function (r) {
          var a, b, X; gen(function () { a = r.int(1, 4); b = r.int(2, 4); X = r.int(1, 2); var R0 = X + a, H0 = b * X; return R0 * R0 * H0 !== 2 * R0 * R0 + 2 * R0 * H0; });
          var rr = lin(1, a), h = mono(b), r2 = P.pow(rr, 2);
          return { a: a, b: b, X: X, r: rr, h: h, r2: r2, V: piMul(P.mul(r2, h)), SA: P.add(piMul(P.scale(r2, 2)), piMul(P.scale(P.mul(rr, h), 2))) };
        },
        parts: [
          { id: 'e5a', level: 'PRG', make: function (r, sh) {
            return piPart('Write and simplify an expression for the volume in ' + t(u(CM3)) + ', using ' + t('V=\\pi r^{2}h') + '.', sh.V, [
              { is: piMul(P.mul(sqNoMid(sh.r), sh.h)), code: 'no-middle', hint: t(bt(sh.r) + '^{2}') + ' has a middle term: ' + t(tx(sh.r2)) + '.' },
              { is: piMul(P.mul(sh.r, sh.h)), code: 'no-square', hint: 'Square the radius first: ' + t('r^{2}=' + bt(sh.r) + '^{2}') + '.' },
              { is: piMul(sh.r2), code: 'square-only', hint: 'That is the area of the circular end. Multiply by the height ' + t(tx(sh.h)) + '.' }],
              steps(['r^{2}=' + bt(sh.r) + '^{2}=' + tx(sh.r2), 'V=\\pi(' + tx(sh.r2) + ')(' + tx(sh.h) + ')=' + piTex(sh.V)]) + ' ' + t(u(CM3)),
              ['Square the radius binomial first, then multiply by the height and by ' + t('\\pi') + '.'], 'cylinder volume with π');
          } },
          { id: 'e5b', level: 'PRG', make: function (r, sh) {
            var ends = piMul(P.scale(sh.r2, 2)), wall = piMul(P.scale(P.mul(sh.r, sh.h), 2));
            return piPart('Write and simplify an expression for the total surface area in ' + t(u(CM2)) + ', using ' + t('SA=2\\pi r^{2}+2\\pi rh') + '.', sh.SA, [
              { is: P.add(piMul(sh.r2), wall), code: 'one-end', hint: 'A closed can has <b>two</b> circular ends: ' + t('2\\pi r^{2}') + '.' },
              { is: wall, code: 'no-ends', hint: 'That is only the curved wall. Add the two circular ends, ' + t('2\\pi r^{2}') + '.' },
              { is: P.add(piMul(P.scale(sqNoMid(sh.r), 2)), wall), code: 'no-middle', hint: t(bt(sh.r) + '^{2}') + ' has a middle term: ' + t(tx(sh.r2)) + '.' }],
              steps(['\\text{Ends: }2\\pi(' + tx(sh.r2) + ')=' + piTex(ends), '\\text{Wall: }2\\pi' + bt(sh.r) + '(' + tx(sh.h) + ')=' + piTex(wall), 'SA=' + piTex(sh.SA)]) + ' ' + t(u(CM2)),
              ['Two circular ends plus the curved wall.', 'Expand each part, then collect like terms (keep ' + t('\\pi') + ' in every term).'], 'cylinder surface area with π');
          } },
          { id: 'e5c', level: 'BEG', make: function (r, sh) {
            var piHint = { code: 'no-pi', hint: t('\\pi') + ' is a number, not a variable, so it doesn’t count toward the degree.' };
            return fieldsPart('State the degree of each answer in ' + t('x') + '.', [numF('degree of the volume'), numF('degree of the surface area')],
              [K.number(3, function (v) { return v === 4 ? piHint : null; }), K.number(2, function (v) { return v === 3 ? piHint : null; })], ['3', '2'], 'volume: degree ' + t(3) + '; surface area: degree ' + t(2),
              'Volume: highest power ' + t('x^{3}') + ' (degree 3). Surface area: highest power ' + t('x^{2}') + ' (degree 2). Volume multiplies three lengths (' + t('r\\times r\\times h') + '); each surface-area term multiplies only two.',
              ['The degree is the highest power of ' + t('x') + '. ' + t('\\pi') + ' is just a number.'], 'degrees of V and SA');
          } },
          { id: 'e5d', level: 'EMG', make: function (r, sh) {
            var X = sh.X, rv = X + sh.a, hv = sh.b * X, V = rv * rv * hv, S = 2 * rv * rv + 2 * rv * hv, f = { mode: 'math', keys: 'poly', vars: [PISYM] };
            return fieldsPart('Evaluate both when ' + t('x=' + X) + ', leaving ' + t('\\pi') + ' in the answers.', [Object.assign({ name: 'volume', label: 'volume', after: t(u(CM3)) }, f), Object.assign({ name: 'surface area', label: 'surface area', after: t(u(CM2)) }, f)],
              [piCheck(P.mono(V, { PI: 1 })), piCheck(P.mono(S, { PI: 1 }))], [V + '\\pi', S + '\\pi'], t('V=' + V + '\\pi' + CM3) + ', ' + t('SA=' + S + '\\pi' + CM2),
              'At ' + t('x=' + X) + ': ' + t('r=' + rv + CM) + ', ' + t('h=' + hv + CM) + '.<br>' + t('V=\\pi(' + rv + ')^{2}(' + hv + ')=' + V + '\\pi') + ' ' + t(u(CM3)) + '; ' + t('SA=2\\pi(' + rv + ')^{2}+2\\pi(' + rv + ')(' + hv + ')=' + S + '\\pi') + ' ' + t(u(CM2)) + '.',
              ['Find the real radius and height first, then use the formulas.'], 'cylinder at x=' + X);
          } }] },
      /* ---------- EP6: storage bin ---------- */
      { num: '6', stem: function (sh) {
          var X = sh.X1;
          return 'A closed rectangular storage bin has length ' + t(bt(sh.l) + '\\text{ m}') + ', width ' + t(bt(sh.w) + '\\text{ m}') + ' and height ' + t(bt(sh.h) + '\\text{ m}') + '.' + figPrism(at(sh.l, X), clamp(at(sh.h, X), 0.35 * at(sh.l, X), at(sh.l, X)), clamp(at(sh.w, X), 0.4 * at(sh.l, X), at(sh.l, X)), tx(sh.l), tx(sh.h), tx(sh.w));
        },
        shared: function (r) {
          var a = r.int(3, 8), b = r.int(2, 5), c = b + r.int(2, 3), X1 = c + r.int(3, 5), X2 = r.int(b + 1, c - 1), l = lin(1, a), w = lin(1, -b), h = lin(1, -c);
          return { a: a, b: b, c: c, X1: X1, X2: X2, l: l, w: w, h: h, V: P.mul(l, w, h) };
        },
        parts: [
          { id: 'e6a', level: 'PRG', make: function (r, sh) {
            return polyPart('Write and simplify an expression for the volume in ' + t('\\text{m}^{3}') + '.', sh.V, prismWrongs(sh.l, sh.w, sh.h), volSolution(sh.l, sh.w, sh.h, M3),
              ['Multiply two of the binomials first, then multiply the trinomial by the third binomial.'], 'bin volume');
          } },
          { id: 'e6b', level: 'BEG', make: function (r, sh) {
            var X = sh.X1, l = at(sh.l, X), w = at(sh.w, X), h = at(sh.h, X), v = l * w * h;
            return numPart('Calculate the volume when ' + t('x=' + X) + '.', v, [],
              t(tx(sh.V).replace(/x/g, '(' + X + ')') + '=' + F(v)) + ' ' + t('\\text{m}^{3}') + '. Check: ' + t(l + '\\times' + w + '\\times' + h + '=' + F(v)) + ' ✓', ['Substitute into your expression, or multiply the three real dimensions.'], 'bin at x=' + X, M3);
          } },
          { id: 'e6c', level: 'BEG', make: function (r, sh) {
            var X = sh.X2, v = at(sh.V, X);
            return numPart('Now substitute ' + t('x=' + X) + '. What number does your expression produce?', v, [[-v, 'sign', 'Check the signs: one of the dimensions is negative at ' + t('x=' + X) + '.']],
              t(tx(sh.V).replace(/x/g, '(' + X + ')') + '=' + v) + '.', ['Substitute carefully; the answer can be negative.'], 'bin expression at x=' + X);
          } },
          { id: 'e6d', level: 'EMG', make: function (r, sh) {
            var X = sh.X2, l = at(sh.l, X), w = at(sh.w, X), h = at(sh.h, X), v = at(sh.V, X);
            return mcPart(r, 'At ' + t('x=' + X) + ' the expression gives ' + t(v) + ', which must be rejected. Which dimension makes the bin impossible?', [
              { html: 'The length, ' + t(tx(sh.l) + '=' + l + '\\text{ m}'), why: 'Work out all three dimensions at ' + t('x=' + X) + '. The length is positive.' },
              { html: 'The width, ' + t(tx(sh.w) + '=' + w + '\\text{ m}'), why: t(w + '\\text{ m}') + ' is a positive length. Check the height.' },
              { html: 'The height, ' + t(tx(sh.h) + '=' + h + '\\text{ m}'), right: true },
              { html: 'None — a volume can be negative.', why: 'A volume is an amount of space; it can’t be negative. Look for the side length that is negative.' }],
              'At ' + t('x=' + X) + ': length ' + t(l) + ' m, width ' + t(w) + ' m, height ' + t(h) + ' m. The <b>height</b> is negative, so no bin exists; ' + t(l + '\\times' + w + '\\times(' + h + ')=' + v) + ' is the algebra reporting it.',
              ['Substitute ' + t('x=' + X) + ' into each dimension.'], 'which dimension is negative', true);
          } },
          { id: 'e6e', level: 'PRG', make: function (r, sh) {
            var x = sh.c + 1, l = at(sh.l, x), w = at(sh.w, x), h = at(sh.h, x), v = l * w * h;
            return fieldsPart('Every dimension must be positive. Give the smallest whole-number value of ' + t('x') + ' for which the bin exists, and the bin’s volume there.', [numF('smallest ' + t('x')), numF('volume', M3)],
              [K.number(x, function (val) { return val === sh.c ? { code: 'plus-k', hint: 'At ' + t('x=' + sh.c) + ' the height is ' + t('0') + ': no bin. ' + t('x') + ' must be <b>greater</b> than ' + t(sh.c) + '.' } : val === sh.b + 1 ? { code: 'plus-k', hint: 'Check the height ' + t(tx(sh.h)) + ' as well: it must be positive too.' } : null; }), K.number(v)],
              [String(x), String(v)], t('x=' + x) + ', volume ' + t(v + M3),
              'Need ' + t(tx(sh.l) + '>0') + ', ' + t(tx(sh.w) + '>0') + ' and ' + t(tx(sh.h) + '>0') + '; the strictest is ' + t('x>' + sh.c) + '.<br>Smallest whole number: ' + t('x=' + x) + ', giving ' + t(l + '\\times' + w + '\\times' + h + '=' + v) + ' ' + t('\\text{m}^{3}') + '.',
              ['Which dimension is the last one to become positive as ' + t('x') + ' increases?'], 'smallest valid x');
          } }] },
      /* ---------- EP7: closed prism ---------- */
      { num: '7', stem: function (sh) {
          var X = sh.X;
          return 'A closed rectangular prism has length ' + t(bt(sh.l) + CM) + ', width ' + t(bt(sh.w) + CM) + ' and height ' + t(bt(sh.h) + CM) + '.' + figPrism(at(sh.l, X), clamp(at(sh.h, X), 0.35 * at(sh.l, X), at(sh.l, X)), clamp(at(sh.w, X), 0.4 * at(sh.l, X), at(sh.l, X)), tx(sh.l), tx(sh.h), tx(sh.w));
        },
        shared: function (r) {
          return gen(function () {
            var a = r.int(2, 3), b = r.int(1, 4), c = r.int(1, 5), d = r.int(2, 3), e = r.int(1, 3), X = r.int(2, 3), l = lin(a, b), w = lin(1, c), h = lin(d, -e);
            if (P.count(P.mul(l, w, h)) < 4) return null;
            return { X: X, l: l, w: w, h: h, V: P.mul(l, w, h), SA: saOf(l, w, h) };
          });
        },
        parts: [
          { id: 'e7a', level: 'PRG', make: function (r, sh) {
            return polyPart('Write and simplify an expression for the volume in ' + t(u(CM3)) + '.', sh.V, prismWrongs(sh.l, sh.w, sh.h), volSolution(sh.l, sh.w, sh.h, CM3), ['Multiply two factors first, then distribute the third.'], 'prism volume');
          } },
          { id: 'e7b', level: 'PRG', make: function (r, sh) {
            return polyPart('Write and simplify an expression for the surface area in ' + t(u(CM2)) + ', using ' + t('SA=2(lw+lh+wh)') + '.', sh.SA, saWrongs(sh.l, sh.w, sh.h), saSolution(sh.l, sh.w, sh.h, CM2), ['Expand the three face areas, add, then double.'], 'prism surface area');
          } },
          { id: 'e7c', level: 'EMG', make: function (r, sh) {
            return mcPart(r, 'The volume has degree ' + t(3) + ' and the surface area has degree ' + t(2) + '. Why does the volume always come out one degree higher, whatever the three (degree-1) sides are?', [
              { html: 'Each volume term multiplies <b>three</b> lengths (' + t('lwh') + '), and degrees add when you multiply: ' + t('1+1+1=3') + '. Each face area multiplies only two: ' + t('1+1=2') + '.', right: true },
              { html: 'Because volume is measured in ' + t('\\text{cm}^{3}') + ' and the units decide the degree.', why: 'The units follow from the algebra, not the other way round. How many degree-1 factors are multiplied in each term?' },
              { html: 'Because the surface-area formula has a factor ' + t('2') + ' that lowers the degree.', why: 'Multiplying by a number never changes the degree.' },
              { html: 'It only happens for these particular numbers; other boxes could have equal degrees.', why: 'Try any three binomials: ' + t('lwh') + ' always has an ' + t('x^{3}') + ' term, and no face area does.' }],
              'Volume ' + t('=lwh') + ': three degree-1 factors, degree ' + t('3') + '. Every surface-area term is one face, ' + t('lw') + ', ' + t('lh') + ' or ' + t('wh') + ': two factors, degree ' + t('2') + '.',
              ['When polynomials are multiplied, their degrees add.'], 'why volume degree is higher');
          } },
          { id: 'e7d', level: 'EMG', make: function (r, sh) {
            var X = sh.X, l = at(sh.l, X), w = at(sh.w, X), h = at(sh.h, X), V = l * w * h, S = 2 * (l * w + l * h + w * h);
            return fieldsPart('Evaluate both when ' + t('x=' + X) + '.', [numF('volume', CM3), numF('surface area', CM2)],
              [K.number(V), K.number(S, function (v) { return v === S / 2 ? { code: 'sa-half', hint: 'Two of each face: double it.' } : null; })], [String(V), String(S)], 'volume ' + t(F(V) + CM3) + ', surface area ' + t(F(S) + CM2),
              'At ' + t('x=' + X) + ': ' + t('l=' + l + ',\\ w=' + w + ',\\ h=' + h) + '. ' + t('V=' + l + '\\times' + w + '\\times' + h + '=' + F(V)) + '; ' + t('SA=2(' + l * w + '+' + l * h + '+' + w * h + ')=' + F(S)) + '.',
              ['Work out the three real dimensions first.'], 'prism at x=' + X);
          } }] },
      /* ---------- EP8: equations where the leading terms cancel ---------- */
      { num: '8', section: 'Extra practice C — Equations where the leading terms cancel', stem: 'Expand <b>both</b> sides. The highest-degree terms are identical on the two sides and cancel, leaving a linear equation. Give exact fractions where they occur.',
        shared: function (r) {
          var A = gen(function () { var a = r.int(1, 7), b = r.int(1, 5), c = r.int(1, 7), d = r.int(1, 5), k = a - b - c + d, n = a * b - c * d; if (!k || a === c || isInt(n, k) || n / k <= 0 || Math.abs(k) > 6) return null; return { a: a, b: b, c: c, d: d, k: k, n: n }; });
          var Bq = gen(function () { var p = r.int(2, 3), q = r.int(1, 7), s = r.int(1, 9), D = p * (p * s - 2 * q); if (gcd(p, q) !== 1 || !D || D < 0 || isInt(q * q, D) || D > 24) return null; return { p: p, q: q, s: s, D: D }; });
          var C = gen(function () { var a = r.int(2, 7), b = r.int(1, 5), m0 = r.int(1, 8), c = a * a + b * b - 2 * b * m0; return c >= 1 && c <= 40 ? { a: a, b: b, c: c, m0: m0 } : null; });
          var D = gen(function () { var k = r.int(2, 4), a = r.int(1, 4), b = r.int(1, 3), c = r.int(1, 6), den = k * a + b * k - c, N0 = r.int(1, 20); if (den < 2 || den > 9 || isInt(N0, den) || b * c + N0 < 1) return null; return { k: k, a: a, b: b, c: c, den: den, N: N0, R: b * c + N0 }; });
          var E = gen(function () { var a = r.int(1, 3), x0 = r.pick([-2, -1, 1, 2, 3]); return { a: a, x0: x0, R: 3 * a * a * x0 + a * a * a }; });
          var Fq = gen(function () { var a = r.int(1, 3), b = r.int(a + 1, 5), c = r.int(b + 1, 7), S = a + b + c, d = r.int(1, 3), e = S - d; if (e <= d) return null; var den = a * b + b * c + c * a - d * e; if (!den || (a * b * c) % den) return null; var n = -a * b * c / den; return n && Math.abs(n) <= 6 ? { a: a, b: b, c: c, d: d, e: e, n: n, S: S } : null; });
          return { A: A, B: Bq, C: C, D: D, E: E, F: Fq };
        },
        parts: [
          { id: 'e8a', level: 'EMG', make: function (r, sh) {
            var s = sh.A, L1 = P.mul(lin(1, s.a), lin(1, -s.b)), R1 = P.mul(lin(1, s.c), lin(1, -s.d));
            return fracPart(t('(x+' + s.a + ')(x-' + s.b + ')=(x+' + s.c + ')(x-' + s.d + ')'), [s.n, s.k], [],
              steps(['\\text{LS}=' + tx(L1), '\\text{RS}=' + tx(R1), tx(P.sub(L1, mono(1, 'x', 2))) + '=' + tx(P.sub(R1, mono(1, 'x', 2))), (s.k === 1 ? '' : s.k === -1 ? '-' : s.k) + 'x=' + s.n + ',\\ x=' + frTex(s.n, s.k)]),
              ['Expand both sides; the ' + t('x^{2}') + ' terms cancel.', 'Leave the answer as an exact fraction.'], 'solve product = product', 'x=');
          } },
          { id: 'e8b', level: 'PRG', make: function (r, sh) {
            var s = sh.B, p2 = s.p * s.p, Ls = P.pow(lin(s.p, s.q, 'y'), 2), Rs = P.mul(mono(p2, 'y'), lin(1, s.s, 'y')), wd = p2 * s.s - s.p * s.q;
            return fracPart(t(bt(lin(s.p, s.q, 'y')) + '^{2}=' + p2 + 'y(y+' + s.s + ')'), [s.q * s.q, s.D], wd ? [[s.q * s.q / wd, 'not-doubled', 'The middle term of ' + t(bt(lin(s.p, s.q, 'y')) + '^{2}') + ' is ' + t(2 * s.p * s.q + 'y') + ' — doubled.']] : [],
              steps(['\\text{LS}=' + tx(Ls), '\\text{RS}=' + tx(Rs), tx(P.sub(Ls, mono(p2, 'y', 2))) + '=' + tx(P.sub(Rs, mono(p2, 'y', 2))), s.D + 'y=' + s.q * s.q + ',\\ y=' + frTex(s.q * s.q, s.D)]),
              ['Expand the square (with its middle term) and the right side.', 'The ' + t(p2 + 'y^{2}') + ' terms cancel.'], 'solve square = monomial × binomial', 'y=');
          } },
          { id: 'e8c', level: 'EMG', make: function (r, sh) {
            var s = sh.C, rs = P.sub(P.pow(lin(1, -s.b, 'm'), 2), P.num(s.c)), wv = (s.b * s.b - s.c - s.a * s.a) / (2 * s.b);
            return fracPart(t('(m-' + s.a + ')(m+' + s.a + ')=(m-' + s.b + ')^{2}-' + s.c), [s.m0, 1], [[wv, 'conj-sign', t('(m-' + s.a + ')(m+' + s.a + ')=m^{2}-' + s.a * s.a) + ' — a sum times a difference gives a <b>minus</b>.']],
              steps(['\\text{LS}=m^{2}-' + s.a * s.a, '\\text{RS}=' + tx(P.pow(lin(1, -s.b, 'm'), 2)) + '-' + s.c + '=' + tx(rs), '-' + s.a * s.a + '=' + tx(P.sub(rs, mono(1, 'm', 2))) + ',\\ m=' + s.m0]),
              ['The left side is a difference of squares.', 'Expand the square on the right, then let the ' + t('m^{2}') + ' terms cancel.'], 'solve difference of squares = square', 'm=');
          } },
          { id: 'e8d', level: 'PRG', make: function (r, sh) {
            var s = sh.D, A1 = P.mul(mono(s.k, 't'), lin(1, s.a, 't')), A2 = P.mul(lin(1, -s.b, 't'), lin(s.k, s.c, 't')), Ls = P.sub(A1, A2), wd = s.k * s.a + s.c - s.b * s.k;
            return fracPart(t(s.k + 't(t+' + s.a + ')-(t-' + s.b + ')(' + s.k + 't+' + s.c + ')=' + s.R), [s.N, s.den], wd ? [[(s.R + s.b * s.c) / wd, 'minus-first', 'The minus sign in front of the second product changes the sign of <b>every</b> term: ' + t('-(' + tx(A2) + ')=' + tx(P.neg(A2))) + '.']] : [],
              steps([tx(A1) + '-(' + tx(A2) + ')=' + s.R, tx(Ls) + '=' + s.R, s.den + 't=' + s.N + ',\\ t=' + frTex(s.N, s.den)]),
              ['Expand both products; keep the second one in brackets while you subtract it.'], 'solve with subtracted product', 't=');
          } },
          { id: 'e8e', level: 'PRG', make: function (r, sh) {
            var s = sh.E, a = s.a, cube = P.pow(lin(1, a), 3), rhs = P.add(mono(1, 'x', 3), mono(3 * a, 'x', 2), P.num(s.R)), wv = (s.R - a * a * a) / (3 * a);
            return fracPart(t('(x+' + a + ')^{3}=' + tx(rhs)), [s.x0, 1], [[wv, 'cube-terms', 'Check ' + t('(x+' + a + ')^{3}') + ': square first, ' + t(tx(P.pow(lin(1, a), 2))) + ', then multiply by ' + t('(x+' + a + ')') + ' again.']],
              steps(['(x+' + a + ')^{2}=' + tx(P.pow(lin(1, a), 2)), '(x+' + a + ')^{3}=' + tx(cube), tx(cube) + '=' + tx(rhs), (3 * a * a) + 'x+' + a * a * a + '=' + s.R + ',\\ x=' + s.x0]) + '<br>The ' + t('x^{3}') + ' <b>and</b> ' + t(3 * a + 'x^{2}') + ' terms cancel.',
              ['Expand ' + t('(x+' + a + ')^{3}') + ' as ' + t('(x+' + a + ')^{2}(x+' + a + ')') + '.'], 'solve cube equation', 'x=');
          } },
          { id: 'e8f', level: 'PRG', make: function (r, sh) {
            var s = sh.F, Ls = P.mul(lin(1, s.a, 'n'), lin(1, s.b, 'n'), lin(1, s.c, 'n')), Rs = P.mul(P.v('n'), lin(1, s.d, 'n'), lin(1, s.e, 'n')), co = s.a * s.b + s.b * s.c + s.c * s.a - s.d * s.e;
            return fracPart(t('(n+' + s.a + ')(n+' + s.b + ')(n+' + s.c + ')=n(n+' + s.d + ')(n+' + s.e + ')'), [s.n, 1], [],
              steps(['\\text{LS}=' + tx(Ls), '\\text{RS}=' + tx(Rs), tx(P.sub(Ls, P.add(mono(1, 'n', 3), mono(s.S, 'n', 2)))) + '=' + tx(P.sub(Rs, P.add(mono(1, 'n', 3), mono(s.S, 'n', 2)))), co + 'n=' + (-s.a * s.b * s.c) + ',\\ n=' + s.n]),
              ['Multiply two brackets first on each side, then the third.', 'Cancel everything that matches on both sides.'], 'solve three-binomial equation', 'n=');
          } },
          { id: 'e8g', level: 'PRG', make: function (r, sh) {
            var s = sh.F;
            return mcPart(r, 'In parts (e) and (f) <b>two</b> degrees cancelled, not one. Which two, and what has to be true of the two sides?', [
              { html: 'The cubic terms <b>and</b> the squared terms: the two sides must have the same leading coefficient and the same ' + t('n^{2}') + ' coefficient (in (f), ' + t(s.a + '+' + s.b + '+' + s.c + '=' + s.d + '+' + s.e) + ').', right: true },
              { html: 'Only the cubic terms; the squared terms happened to be zero.', why: 'Expand (f): both sides have ' + t(s.S + 'n^{2}') + '. They aren’t zero — they are equal, so they cancel.' },
              { html: 'The linear terms and the constants, because the brackets hold the same numbers.', why: 'If the linear terms cancelled there would be nothing left to solve for.' },
              { html: 'The squared and linear terms; the cubes stay, so it is really a cubic equation.', why: t('n^{3}') + ' appears on both sides with coefficient ' + t(1) + ', so it cancels first.' }],
              'The ' + t('n^{3}') + ' terms and the ' + t('n^{2}') + ' terms cancelled. That needs the same leading coefficient and the same next coefficient on both sides: in (f) each side is ' + t('n^{3}+' + s.S + 'n^{2}+\\cdots') + ' because ' + t(s.a + '+' + s.b + '+' + s.c + '=' + s.d + '+' + s.e + '=' + s.S) + '.',
              ['Write both sides of (f) in expanded form and compare them term by term.'], 'which degrees cancel');
          } }] },
      /* ---------- EP9: square = rectangle ---------- */
      { num: '9', stem: function (sh) {
          var X = sh.x, sv = X + sh.a;
          return 'A square has side length ' + t('(x+' + sh.a + ')' + CM) + '. A rectangle measures ' + t('(x+' + sh.b + ')' + CM) + ' by ' + t('(x+' + sh.c + ')' + CM) + '. The two figures have equal areas.' +
            sideBySide([figRect(sv, sv, { bottom: 'x+' + sh.a, left: 'x+' + sh.a, pw: 90, ph: 90 }).svg('square', 200), figRect(X + sh.b, X + sh.c, { bottom: 'x+' + sh.b, left: 'x+' + sh.c, pw: 120, ph: 90 }).svg('rectangle', 220)], '=');
        },
        shared: function (r) { var s = sqRectGen(r); if (s.b < s.c) { var q = s.b; s.b = s.c; s.c = q; } return s; },
        parts: [
          { id: 'e9a', level: 'PRG', make: function (r, sh) {
            var Lq = P.pow(lin(1, sh.a), 2), Rq = P.mul(lin(1, sh.b), lin(1, sh.c)), co = 2 * sh.a - sh.b - sh.c;
            return numPart('Write an equation, expand both sides, and solve for ' + t('x') + '.', sh.x, [[-sh.x, 'sign', 'Check the signs when you move the terms across.']],
              steps(['(x+' + sh.a + ')^{2}=(x+' + sh.b + ')(x+' + sh.c + ')', tx(Lq) + '=' + tx(Rq), (2 * sh.a) + 'x+' + sh.a * sh.a + '=' + (sh.b + sh.c) + 'x+' + sh.b * sh.c, 'x=' + sh.x]),
              ['Square area = rectangle area. Expand both; the ' + t('x^{2}') + ' terms cancel.'], 'square = rectangle');
          } },
          { id: 'e9b', level: 'BEG', make: function (r, sh) {
            var s = sh.x + sh.a, L1 = sh.x + sh.b, W1 = sh.x + sh.c;
            return fieldsPart('State the side length of the square and the two side lengths of the rectangle.', [numF('square side', CM), numF('rectangle ' + t('(x+' + sh.b + ')'), CM), numF('rectangle ' + t('(x+' + sh.c + ')'), CM)],
              [K.number(s), K.number(L1), K.number(W1)], [String(s), String(L1), String(W1)], t(s + CM) + '; ' + t(L1 + CM) + ' by ' + t(W1 + CM),
              'At ' + t('x=' + sh.x) + ': square ' + t(sh.x + '+' + sh.a + '=' + s) + '; rectangle ' + t(sh.x + '+' + sh.b + '=' + L1) + ' by ' + t(sh.x + '+' + sh.c + '=' + W1) + '.', ['Substitute your value of ' + t('x') + '.'], 'side lengths');
          } },
          { id: 'e9c', level: 'BEG', make: function (r, sh) {
            var s = sh.x + sh.a, A = s * s;
            return numPart('Calculate the (equal) area of the two figures.', A, [], 'Square: ' + t(s + '^{2}=' + A) + '. Rectangle: ' + t((sh.x + sh.b) + '\\times' + (sh.x + sh.c) + '=' + A) + '. They agree ✓', ['Use the side lengths from (b).'], 'equal areas', CM2);
          } }] },
      /* ---------- EP10: Pythagorean ---------- */
      { num: '10', stem: function (sh) { return 'In the right triangle below the legs measure ' + t(bt(sh.l3) + CM) + ' and ' + t(bt(sh.l4) + CM) + ', and the hypotenuse measures ' + t(bt(sh.hyp) + CM) + '.' + figTri(sh.A, sh.B, tx(sh.l3), tx(sh.l4), tx(sh.hyp)); },
        shared: function (r) { return triGen(r, 4, 14); },
        parts: [
          { id: 'e10a', level: 'PRG', make: function (r, sh) {
            return numPart('Apply the Pythagorean theorem, expand all three squares, and solve for ' + t('x') + '.', sh.x0, [[2 * sh.x0, 'not-doubled', 'Check the middle term of each square — it is doubled.'], [-sh.x0, 'sign', 'Check your signs.']], triSolution(sh),
              ['leg² + leg² = hypotenuse². Expand all three squares.', 'Show that the ' + t('x^{2}') + ' terms cancel, then solve.'], 'Pythagorean x');
          } },
          { id: 'e10b', level: 'BEG', make: function (r, sh) {
            return fieldsPart('State the three side lengths.', [numF('leg ' + t(bt(sh.l3)), CM), numF('leg ' + t(bt(sh.l4)), CM), numF('hypotenuse', CM)], [K.number(sh.A), K.number(sh.B), K.number(sh.C)], [String(sh.A), String(sh.B), String(sh.C)],
              t(sh.A + ',\\ ' + sh.B + ',\\ ' + sh.C) + ' cm', 'With ' + t('x=' + sh.x0) + ': legs ' + t(sh.A) + ' and ' + t(sh.B) + ' cm, hypotenuse ' + t(sh.C) + ' cm. Check: ' + t(sh.A + '^{2}+' + sh.B + '^{2}=' + F(sh.A * sh.A + sh.B * sh.B) + '=' + sh.C + '^{2}') + ' ✓',
              ['Substitute ' + t('x') + ' into each side.'], 'triangle sides');
          } },
          { id: 'e10c', level: 'EMG', make: function (r, sh) {
            var Pm = sh.A + sh.B + sh.C, Ar = sh.A * sh.B / 2;
            return fieldsPart('Determine the perimeter and the area of the triangle.', [numF('perimeter', CM), numF('area', CM2)],
              [K.number(Pm), K.number(Ar, function (v) { return v === sh.A * sh.B ? { code: 'side-not-x', hint: 'A triangle’s area is <b>half</b> of base × height.' } : null; })], [String(Pm), String(Ar)], 'perimeter ' + t(Pm + CM) + ', area ' + t(F(Ar) + CM2),
              'Perimeter ' + t('=' + sh.A + '+' + sh.B + '+' + sh.C + '=' + Pm) + ' cm. Area ' + t('=\\tfrac12(' + sh.A + ')(' + sh.B + ')=' + F(Ar)) + ' ' + t(u(CM2)) + ' (the legs are the base and height).', ['The legs are perpendicular, so they are the base and the height.'], 'triangle perimeter and area');
          } }] },
      /* ---------- EP11: rectangle, rejecting values ---------- */
      { num: '11', section: 'Extra practice D — Evaluating, and when to reject an answer', stem: function (sh) { return 'A rectangle has length ' + t(bt(sh.l) + CM) + ' and width ' + t(bt(sh.w) + CM) + '.' + figRect(at(sh.l, sh.X1), clamp(at(sh.w, sh.X1), 0.3 * at(sh.l, sh.X1), at(sh.l, sh.X1)), { bottom: tx(sh.l), left: tx(sh.w) }).svg('rectangle', 300); },
        shared: function (r) { var a = r.int(2, 3), b = r.int(1, 6), c = r.int(2, 5), X1 = r.int(c + 2, c + 5), X2 = r.int(1, c - 1), l = lin(a, b), w = lin(1, -c); return { a: a, b: b, c: c, X1: X1, X2: X2, l: l, w: w, A: P.mul(l, w) }; },
        parts: [
          { id: 'e11a', level: 'EMG', make: function (r, sh) {
            return polyPart('Write and simplify an expression for the area in ' + t(u(CM2)) + '.', sh.A, [{ is: firstLast(sh.l, sh.w), code: 'fl-only', hint: 'Include the Outside and Inside products too (the ' + t('x') + ' terms).' }, { is: P.scale(P.add(sh.l, sh.w), 2), code: 'perimeter', hint: 'That is the perimeter. Area = length × width.' }],
              t(bt(sh.l) + bt(sh.w) + '=' + tx(sh.A)) + ' ' + t(u(CM2)) + '.', ['Multiply each term of the first bracket by each term of the second.'], 'rectangle area');
          } },
          { id: 'e11b', level: 'BEG', make: function (r, sh) {
            var X = sh.X1, l = at(sh.l, X), w = at(sh.w, X), v = l * w;
            return numPart('Calculate the area when ' + t('x=' + X) + '.', v, [[2 * (l + w), 'perimeter', 'That is the perimeter.']], t(tx(sh.A).replace(/x/g, '(' + X + ')') + '=' + v) + ' ' + t(u(CM2)) + '. Check: sides ' + t(l) + ' and ' + t(w) + ' cm, ' + t(l + '\\times' + w + '=' + v) + ' ✓', ['Substitute into your expression.'], 'area at x=' + X, CM2);
          } },
          { id: 'e11c', level: 'EMG', make: function (r, sh) {
            var X = sh.X2, l = at(sh.l, X), w = at(sh.w, X), v = l * w;
            return mcPart(r, 'Substituting ' + t('x=' + X) + ' into the expression gives ' + t(v) + '. Why must this be rejected?', [
              { html: 'The width is ' + t(tx(sh.w) + '=' + w + '\\text{ cm}') + ': a side can’t be negative, so no rectangle exists.', right: true },
              { html: 'The length is ' + t(tx(sh.l) + '=' + l + '\\text{ cm}') + ', which is too short.', why: t(l + '\\text{ cm}') + ' is a perfectly good length. Check the other side.' },
              { html: 'It doesn’t need to be rejected: a negative area just means the rectangle is upside down.', why: 'An area is an amount of surface; it can’t be negative. Find the side that causes it.' },
              { html: 'Because ' + t('x') + ' must be bigger than the area.', why: 'There is no such rule. Substitute ' + t('x=' + X) + ' into each side length.' }],
              'At ' + t('x=' + X) + ': length ' + t(l) + ' cm (fine), width ' + t(w) + ' cm (negative). No rectangle exists, so ' + t(v) + ' is not an area.', ['Work out both side lengths at ' + t('x=' + X) + '.'], 'reject negative side');
          } },
          { id: 'e11d', level: 'EMG', make: function (r, sh) {
            var x = sh.c + 1, l = at(sh.l, x), v = l * 1;
            return fieldsPart('The rectangle exists only when both sides are positive, that is, ' + t('x>' + sh.c) + '. Give the smallest whole-number value of ' + t('x') + ' that works, and the area at that value.', [numF('smallest ' + t('x')), numF('area', CM2)],
              [K.number(x, function (val) { return val === sh.c ? { code: 'plus-k', hint: 'At ' + t('x=' + sh.c) + ' the width is ' + t('0') + '. ' + t('x') + ' must be <b>greater</b> than ' + t(sh.c) + '.' } : null; }), K.number(v)], [String(x), String(v)], t('x=' + x) + ', area ' + t(v + CM2),
              'Need ' + t(tx(sh.w) + '>0') + ', so ' + t('x>' + sh.c) + '. Smallest whole number: ' + t('x=' + x) + ': sides ' + t(l) + ' cm and ' + t(1) + ' cm, area ' + t(v) + ' ' + t(u(CM2)) + '.', ['Which side becomes positive last?'], 'smallest valid x');
          } }] },
      /* ---------- EP12: trapezoid ---------- */
      { num: '12', stem: function (sh) { return 'A trapezoid has parallel sides ' + t(bt(sh.a1) + CM) + ' and ' + t(bt(sh.a2) + CM) + ', and height ' + t(tx(sh.h) + CM) + '. Its area is ' + t('A=\\tfrac12h(a+b)') + '.' + figTrap(at(sh.a1, sh.X1), clamp(at(sh.a2, sh.X1), 0.3 * at(sh.a1, sh.X1), at(sh.a1, sh.X1)), clamp(at(sh.h, sh.X1), 0.35 * at(sh.a1, sh.X1), 0.8 * at(sh.a1, sh.X1)), tx(sh.a1), tx(sh.a2), tx(sh.h)); },
        shared: function (r) {
          var a = r.int(2, 3), b = r.int(1, 4), c = r.int(3, 6), X1 = r.int(c + 1, c + 3), X2 = r.int(1, c - 1), a1 = lin(a, b), a2 = lin(1, -c), h = mono(2);
          return { a: a, b: b, c: c, X1: X1, X2: X2, a1: a1, a2: a2, h: h, A: P.mul(P.v('x'), P.add(a1, a2)) };
        },
        parts: [
          { id: 'e12a', level: 'PRG', make: function (r, sh) {
            return polyPart('Write and simplify an expression for the area in ' + t(u(CM2)) + '. Add inside the bracket before you multiply.', sh.A, [
              { is: P.mul(sh.h, P.add(sh.a1, sh.a2)), code: 'side-scaled', hint: 'Don’t forget the ' + t('\\tfrac12') + ': ' + t('\\tfrac12(2x)=x') + '.' },
              { is: P.mul(sh.a1, sh.a2, P.v('x')), code: 'perimeter', hint: 'The parallel sides are <b>added</b>, then multiplied by half the height.' }],
              t('A=\\tfrac12(2x)\\left[' + bt(sh.a1) + '+' + bt(sh.a2) + '\\right]=x(' + tx(P.add(sh.a1, sh.a2)) + ')=' + tx(sh.A)) + ' ' + t(u(CM2)) + '.', ['Add the parallel sides first. ' + t('\\tfrac12\\times 2x=x') + '.'], 'trapezoid area');
          } },
          { id: 'e12b', level: 'BEG', make: function (r, sh) {
            var X = sh.X1, v = at(sh.A, X);
            return numPart('Calculate the area when ' + t('x=' + X) + '.', v, [], t(tx(sh.A).replace(/x/g, '(' + X + ')') + '=' + v) + '. Check: sides ' + t(at(sh.a1, X)) + ' and ' + t(at(sh.a2, X)) + ', height ' + t(2 * X) + ': ' + t('\\tfrac12(' + 2 * X + ')(' + at(sh.a1, X) + '+' + at(sh.a2, X) + ')=' + v) + ' ✓', ['Substitute into your expression.'], 'trapezoid at x=' + X, CM2);
          } },
          { id: 'e12c', level: 'EMG', make: function (r, sh) {
            var X = sh.X2, v = at(sh.A, X), top = at(sh.a2, X);
            return mcPart(r, 'Substitute ' + t('x=' + X) + '. The expression gives ' + t(v) + '. Why must it be rejected?', [
              { html: 'The top side is ' + t(tx(sh.a2) + '=' + top + '\\text{ cm}') + ', a negative length, so no trapezoid exists.', right: true },
              { html: 'It gives ' + t(v) + ', so the figure is fine and this is its area.', why: 'Work out all three measurements at ' + t('x=' + X) + '. Is every one positive?' },
              { html: 'The height ' + t('2x=' + 2 * X) + ' is too small for a trapezoid.', why: 'Any positive height works. Check the parallel sides.' },
              { html: 'Areas must be whole numbers of square centimetres.', why: 'Areas can be any positive number. The problem is one of the side lengths.' }],
              'At ' + t('x=' + X) + ': top side ' + t(top) + ' cm. A negative length means no trapezoid, so ' + t(v) + ' is meaningless here.', ['Substitute ' + t('x=' + X) + ' into each measurement.'], 'reject negative side');
          } },
          { id: 'e12d', level: 'PRG', make: function (r, sh) {
            var X = sh.c, v = at(sh.A, X), base = at(sh.a1, X);
            return mcPart(r, 'Substitute ' + t('x=' + X) + '. The expression gives ' + t(v) + ', a positive number, but the figure is still not a trapezoid. What has it become?', [
              { html: 'A triangle: the top side has length ' + t(0) + ', and ' + t(v) + ' is the triangle’s area, ' + t('\\tfrac12(' + base + ')(' + 2 * X + ')') + '.', right: true },
              { html: 'A rectangle, because the top and bottom are now equal.', why: 'Work out the top side at ' + t('x=' + X) + ': ' + t(X + '-' + sh.c) + '.' },
              { html: 'A parallelogram with area ' + t(v) + '.', why: 'A parallelogram has two equal parallel sides. What is the top side here?' },
              { html: 'Nothing — a side of length ' + t(0) + ' means the area is ' + t(0) + '.', why: 'Only one side has shrunk to a point; the shape still has a base and a height.' }],
              'At ' + t('x=' + X) + ' the top side is ' + t(X + '-' + sh.c + '=0') + ': it shrinks to a point and the figure is a <b>triangle</b> with base ' + t(base) + ' cm and height ' + t(2 * X) + ' cm. Its area is ' + t('\\tfrac12(' + base + ')(' + 2 * X + ')=' + v) + ' ' + t(u(CM2)) + '.',
              ['Work out the top side at ' + t('x=' + X) + '.'], 'degenerate trapezoid');
          } },
          { id: 'e12e', level: 'EMG', make: function (r, sh) {
            return mcPart(r, 'For which values of ' + t('x') + ' is this really a trapezoid?', [
              { html: t('x>' + sh.c), right: true },
              { html: t('x\\ge ' + sh.c), why: 'At ' + t('x=' + sh.c) + ' the top side is ' + t(0) + ' and the figure is a triangle.' },
              { html: t('x>0'), why: 'The height ' + t('2x') + ' needs ' + t('x>0') + ', but the top side ' + t(tx(sh.a2)) + ' needs more.' },
              { html: t('x>' + (2 * sh.c)), why: 'Solve ' + t(tx(sh.a2) + '>0') + '.' }],
              'Every measurement must be positive: ' + t(tx(sh.a1) + '>0') + ', ' + t(tx(sh.a2) + '>0') + ', ' + t('2x>0') + '. The strictest is ' + t('x>' + sh.c) + ' (and ' + t('x=' + sh.c) + ' gives the triangle).', ['Each of the three measurements must be positive.'], 'valid x for trapezoid');
          } }] },
      /* ---------- EP13: find the error — perimeters subtracted ---------- */
      { num: '13', section: 'Extra practice E — Find the error', stem: function (sh) {
          var o1 = bt(sh.ow), o2 = bt(sh.oh), i1 = bt(sh.iw), i2 = bt(sh.ih);
          return 'A picture frame has outer dimensions ' + t(o1 + CM) + ' by ' + t(o2 + CM) + ', with a rectangular opening ' + t(i1 + CM) + ' by ' + t(i2 + CM) + ' cut out of the middle. Asked for the shaded area, a student wrote' +
            '\\[\\begin{aligned}&2\\big[' + o1 + '+' + o2 + '\\big]\\\\&\\quad-2\\big[' + i1 + '+' + i2 + '\\big]\\\\&=2(' + tx(P.add(sh.ow, sh.oh)) + ')-2(' + tx(P.add(sh.iw, sh.ih)) + ')=' + tx(sh.stu) + '\\end{aligned}\\]' +
            figFrame(at(sh.ow, 2), at(sh.oh, 2), clamp(at(sh.iw, 2), 0.45 * at(sh.ow, 2), 0.75 * at(sh.ow, 2)), clamp(at(sh.ih, 2), 0.4 * at(sh.oh, 2), 0.65 * at(sh.oh, 2)), { top: tx(sh.ow), left: tx(sh.oh), inner: [tx(sh.iw), '\\text{by }' + tx(sh.ih)], label: 'picture frame' });
        },
        shared: function (r) {
          return gen(function () {
            var a = r.int(2, 3), b = r.int(3, 8), c = r.int(2, 3), d = r.int(1, 4), e = r.int(1, 4), f = r.int(1, 3);
            var ow = lin(a, b), oh = lin(c, d), iw = lin(1, e), ih = lin(1, f);
            if (e === f || at(ow, 2) - at(iw, 2) < 3 || at(oh, 2) - at(ih, 2) < 2) return null;
            var O = P.mul(ow, oh), I = P.mul(iw, ih);
            return { ow: ow, oh: oh, iw: iw, ih: ih, O: O, I: I, area: P.sub(O, I), stu: P.sub(P.scale(P.add(ow, oh), 2), P.scale(P.add(iw, ih), 2)) };
          });
        },
        parts: [
          { id: 'e13a', level: 'EMG', make: function (r, sh) {
            return mcPart(r, 'What is the student’s mistake?', [
              { html: 'They subtracted the two <b>perimeters</b>, ' + t('2(l+w)') + ', instead of the two <b>areas</b>, ' + t('l\\times w') + '.', right: true },
              { html: 'They forgot to multiply the opening by ' + t(2) + '.', why: 'They did multiply by ' + t(2) + '. Look at what ' + t('2(l+w)') + ' measures.' },
              { html: 'They subtracted in the wrong order: it should be the opening minus the outer rectangle.', why: 'Outer minus opening is the right order. The problem is <b>what</b> was subtracted.' },
              { html: 'They made a sign error when expanding the second bracket.', why: 'Their arithmetic is right — the method is wrong. ' + t('2(l+w)') + ' is a perimeter, a length.' }],
              'The student worked out ' + t('2(l+w)') + ' for each rectangle — perimeters. A difference of perimeters is a length, not a region. The shaded area is outer area minus opening area.', ['What does ' + t('2(l+w)') + ' measure?'], 'name the error');
          } },
          { id: 'e13b', level: 'PRG', make: function (r, sh) {
            return polyPart('Determine the correct shaded area (in ' + t(u(CM2)) + ').', sh.area, [
              { is: sh.stu, code: 'perimeter', hint: 'That is the student’s answer — a difference of perimeters. Use areas: ' + t('l\\times w') + '.' },
              { is: badSub(sh.O, sh.I), code: 'sub-sign', hint: 'Subtract every term of the opening’s area: ' + t('-(' + tx(sh.I) + ')=' + tx(P.neg(sh.I))) + '.' },
              { is: P.add(sh.O, sh.I), code: 'added', hint: 'The opening is cut out, so subtract its area.' }],
              steps(['\\text{Outer}=' + bt(sh.ow) + bt(sh.oh) + '=' + tx(sh.O), '\\text{Opening}=' + bt(sh.iw) + bt(sh.ih) + '=' + tx(sh.I), '\\text{Shaded}=' + tx(sh.area)]) + ' ' + t(u(CM2)),
              ['Outer area − opening area.'], 'correct frame area');
          } },
          { id: 'e13c', level: 'EMG', make: function (r, sh) {
            var v = at(sh.area, 2), sv = at(sh.stu, 2);
            return fieldsPart('Substitute ' + t('x=2') + ' into the correct expression and into the student’s expression.', [numF('correct area', CM2), numF('student’s value')],
              [K.number(v, function (val) { return val === sv ? { code: 'perimeter', hint: 'That is the student’s value.' } : null; }), K.number(sv)], [String(v), String(sv)], 'correct ' + t(v) + ', student ' + t(sv),
              'At ' + t('x=2') + ': outer ' + t(at(sh.ow, 2) + '\\times' + at(sh.oh, 2) + '=' + at(sh.O, 2)) + ', opening ' + t(at(sh.iw, 2) + '\\times' + at(sh.ih, 2) + '=' + at(sh.I, 2)) + ', so the real shaded area is ' + t(v) + '. The correct expression gives ' + t(v) + ' ✓; the student’s gives ' + t(sv) + '.',
              ['Substitute ' + t('x=2') + ' into each expression.'], 'compare at x=2');
          } },
          { id: 'e13d', level: 'PRG', make: function (r, sh) {
            return mcPart(r, 'The student’s answer has degree ' + t(1) + ' and the correct one has degree ' + t(2) + '. How could the degree alone have caught the error before any numbers were substituted?', [
              { html: 'An area multiplies two lengths; with degree-1 sides it must have degree ' + t('1+1=2') + '. A degree-1 answer is a length, so it can’t be the area.', right: true },
              { html: 'Answers of degree ' + t(1) + ' are always wrong.', why: 'A length (like a perimeter) is correctly degree ' + t(1) + '. It depends on what is being measured.' },
              { html: 'The degree of an area must equal the number of rectangles in the figure.', why: 'The degree comes from multiplying lengths, not from counting pieces.' },
              { html: 'A larger degree always means a larger answer, and the shaded area must be large.', why: 'Degree doesn’t measure size. Think about how many lengths an area multiplies.' }],
              'Area = length × length: degree ' + t('1+1=2') + '. A degree-1 expression is a length, so ' + t(tx(sh.stu)) + ' cannot be an area.', ['How many degree-1 factors does an area multiply?'], 'degree check');
          } }] },
      /* ---------- EP14: doubling the sides ---------- */
      { num: '14', stem: function (sh) {
          var X = 2;
          return 'A rectangle measures ' + t(bt(sh.l) + CM) + ' by ' + t(bt(sh.w) + CM) + '. A student claims: “If I double the length and double the width, the area doubles too.”' +
            sideBySide([figRect(at(sh.l, X), at(sh.w, X), { bottom: tx(sh.l), left: tx(sh.w), pw: 90, ph: 60 }).svg('rectangle', 200), figRect(2 * at(sh.l, X), 2 * at(sh.w, X), { bottom: '2' + bt(sh.l), left: '2' + bt(sh.w), pw: 130, ph: 90, grid: true }).svg('doubled rectangle', 260)]);
        },
        shared: function (r) {
          var a = r.int(1, 5), b = r.int(2, 3), c = r.int(1, 3), l = lin(1, a), w = lin(b, -c);
          return { a: a, b: b, c: c, l: l, w: w, A: P.mul(l, w), A2: P.mul(P.scale(l, 2), P.scale(w, 2)), k: r.pick([3, 3, 4, 5]), m: r.pick([2, 2, 3]) };
        },
        parts: [
          { id: 'e14a', level: 'EMG', make: function (r, sh) {
            return polyPart('Expand the original area.', sh.A, [{ is: firstLast(sh.l, sh.w), code: 'fl-only', hint: 'Include the Outside and Inside products (the ' + t('x') + ' terms).' }],
              t(bt(sh.l) + bt(sh.w) + '=' + tx(sh.A)) + ' ' + t(u(CM2)) + '.', ['Multiply each term of one bracket by each term of the other.'], 'original area');
          } },
          { id: 'e14b', level: 'EMG', make: function (r, sh) {
            var l2 = P.scale(sh.l, 2), w2 = P.scale(sh.w, 2);
            return polyPart('Write the two doubled side lengths as polynomials and expand the new area.', sh.A2, [
              { is: P.scale(sh.A, 2), code: 'side-scaled', hint: 'That just doubles the area — it assumes the claim. Write the new sides, ' + t(tx(l2)) + ' and ' + t(tx(w2)) + ', and multiply them.' }],
              'New sides ' + t(tx(l2)) + ' and ' + t(tx(w2)) + ': ' + t(bt(l2) + bt(w2) + '=' + tx(sh.A2) + '=4(' + tx(sh.A) + ')') + '.', ['Double each side first: ' + t('2' + bt(sh.l) + '=' + tx(l2)) + '.'], 'doubled area');
          } },
          { id: 'e14c', level: 'EMG', make: function (r, sh) {
            var a1 = at(sh.A, 2), a2 = at(sh.A2, 2);
            return fieldsPart('Test it at ' + t('x=2') + ' with both sets of real dimensions. By what factor did the area really change?', [numF('original area', CM2), numF('new area', CM2), numF('factor')],
              [K.number(a1), K.number(a2, function (v) { return v === 2 * a1 ? { code: 'side-scaled', hint: 'Work out the doubled sides at ' + t('x=2') + ' and multiply them.' } : null; }), K.number(4, function (v) { return v === 2 ? { code: 'side-scaled', hint: 'Divide the new area by the original area.' } : null; })],
              [String(a1), String(a2), '4'], t(a1 + '\\to ' + a2) + ', factor ' + t(4),
              'At ' + t('x=2') + ': original ' + t(at(sh.l, 2) + '\\times' + at(sh.w, 2) + '=' + a1) + '; doubled ' + t(2 * at(sh.l, 2) + '\\times' + 2 * at(sh.w, 2) + '=' + a2) + '. ' + t(a2 + '\\div' + a1 + '=4') + ': the area is multiplied by ' + t(4) + ', not ' + t(2) + '.',
              ['Find both real rectangles, then divide the new area by the old one.'], 'scale factor of area');
          } },
          { id: 'e14d', level: 'EMG', make: function (r, sh) {
            return mcPart(r, 'The dashed lines on the doubled rectangle show why. Which explanation do they give?', [
              { html: 'They cut the big rectangle into <b>four</b> copies of the original: doubling the length gives ' + t(2) + ' across, doubling the width gives ' + t(2) + ' rows, and ' + t('2\\times2=4') + '.', right: true },
              { html: 'They cut it into two halves, so the area doubles.', why: 'Count the pieces the dashed lines make.' },
              { html: 'They show the perimeter doubled, so the area doubles.', why: 'The perimeter does double — but the area is length × width, and both are doubled.' },
              { html: 'They show that the new rectangle is a square.', why: 'Doubling both sides keeps the same shape. Count the copies of the original inside it.' }],
              'Each dashed line halves the doubled rectangle in one direction, giving a ' + t('2\\times2') + ' grid of copies of the original: ' + t(4) + ' times the area.', ['Count the small rectangles.'], 'why the factor is 4');
          } },
          { id: 'e14e', level: 'PRG', make: function (r, sh) {
            var k = sh.k, m = sh.m;
            return fieldsPart('By what factor does area change if every dimension of a rectangle is multiplied by ' + t(k) + '? By what factor does the volume of a box change if every one of its three dimensions is multiplied by ' + t(m) + '?', [numF('area factor'), numF('volume factor')],
              [K.number(k * k, function (v) { return v === k ? { code: 'side-scaled', hint: 'Both the length and the width are multiplied by ' + t(k) + '.' } : v === 2 * k ? { code: 'side-scaled', hint: 'Multiply the factors: ' + t(k + '\\times' + k) + '.' } : null; }), K.number(m * m * m, function (v) { return v === m * m ? { code: 'side-scaled', hint: 'A box has <b>three</b> dimensions.' } : v === 3 * m ? { code: 'side-scaled', hint: 'Multiply the factors: ' + t(m + '\\times' + m + '\\times' + m) + '.' } : null; })],
              [String(k * k), String(m * m * m)], 'area ' + t('\\times' + k * k) + ', volume ' + t('\\times' + m * m * m),
              'Area has two dimensions: ' + t(k + '\\times' + k + '=' + k * k) + '. Volume has three: ' + t(m + '\\times' + m + '\\times' + m + '=' + m * m * m) + '. Each scaled dimension adds its own factor.', ['Each dimension that is scaled contributes its own factor.'], 'area and volume scale factors');
          } }] },
      /* ---------- EP15: square vs rectangle, constant gap ---------- */
      { num: '15', section: 'Extra practice F — Stretch', stem: function (sh) {
          var X = 3;
          return 'A square has side ' + t('(x+' + sh.a + ')' + CM) + ' and a rectangle measures ' + t('(x+' + (sh.a + sh.d) + ')' + CM) + ' by ' + t((sh.a - sh.d ? '(x+' + (sh.a - sh.d) + ')' : 'x') + CM) + ': ' + (sh.d === 1 ? 'a centimetre' : t(sh.d) + ' centimetres') + ' longer and ' + (sh.d === 1 ? 'a centimetre' : t(sh.d) + ' centimetres') + ' shorter than the square.' +
            sideBySide([figRect(X + sh.a, X + sh.a, { bottom: 'x+' + sh.a, left: 'x+' + sh.a, pw: 90, ph: 90 }).svg('square', 200), figRect(X + sh.a + sh.d, X + sh.a - sh.d, { bottom: 'x+' + (sh.a + sh.d), left: tx(lin(1, sh.a - sh.d)), pw: 120, ph: 90 }).svg('rectangle', 220)]);
        },
        shared: function (r) { var a = r.int(2, 6), d = r.int(1, 3); if (d >= a) d = 1; return { a: a, d: d, S: P.pow(lin(1, a), 2), R: P.mul(lin(1, a + d), lin(1, a - d)) }; },
        parts: [
          { id: 'e15a', level: 'BEG', make: function (r, sh) {
            return fieldsPart('Expand each of the two areas.', [polyF('square'), polyF('rectangle')],
              [K.poly(sh.S, { wrong: [{ is: sqNoMid(lin(1, sh.a)), code: 'no-middle', hint: t('(x+' + sh.a + ')^{2}') + ' has a middle term, ' + t(2 * sh.a + 'x') + '.' }] }), K.poly(sh.R)], [tx(sh.S), tx(sh.R)], 'square ' + t(tx(sh.S)) + ', rectangle ' + t(tx(sh.R)),
              steps(['(x+' + sh.a + ')^{2}=' + tx(sh.S), bt(lin(1, sh.a + sh.d)) + bt(lin(1, sh.a - sh.d)) + '=' + tx(sh.R)]), ['Square the binomial; multiply the two binomials.'], 'two areas');
          } },
          { id: 'e15b', level: 'EMG', make: function (r, sh) {
            var D = P.sub(sh.S, sh.R);
            return polyPart('Subtract the rectangle’s area from the square’s. Simplify completely.', D, [{ is: P.neg(D), code: 'sign-all', hint: 'Square minus rectangle, not the other way round.' }, { is: P.add(sh.S, sh.R), code: 'added', hint: 'Subtract the rectangle’s area.' }],
              t('(' + tx(sh.S) + ')-(' + tx(sh.R) + ')=' + tx(D)) + ' ' + t(u(CM2)) + ' — no ' + t('x') + ' at all.', ['Put the rectangle’s area in brackets and subtract every term.'], 'difference of areas');
          } },
          { id: 'e15c', level: 'PRG', make: function (r, sh) {
            var D = sh.d * sh.d;
            return mcPart(r, 'What does your answer to (b) mean about these two figures? Would making ' + t('x') + ' enormous ever let the rectangle catch up?', [
              { html: 'The square is <b>always exactly ' + t(D) + ' cm²</b> bigger, whatever ' + t('x') + ' is, so the rectangle never catches up.', right: true },
              { html: 'The two areas are equal once ' + t('x') + ' is large enough.', why: 'The difference has no ' + t('x') + ' in it, so it never changes.' },
              { html: 'The rectangle is bigger, because its longer side wins as ' + t('x') + ' grows.', why: 'Check the sign of your answer to (b): square minus rectangle is positive.' },
              { html: 'The gap grows as ' + t('x') + ' grows, since both areas grow.', why: 'Both areas grow by exactly the same ' + t('x^{2}+' + 2 * sh.a + 'x') + ', so the gap stays the same.' }],
              'Both areas share ' + t('x^{2}+' + 2 * sh.a + 'x') + '; only the constants differ (' + t(sh.a * sh.a) + ' against ' + t(sh.a * sh.a - D) + '). The square is always ' + t(D) + ' cm² larger, and making ' + t('x') + ' enormous grows both equally.',
              ['Look at your answer to (b): does it depend on ' + t('x') + '?'], 'constant gap');
          } }] },
      /* ---------- EP16: growing a rectangle ---------- */
      { num: '16', stem: function (sh) { return 'A rectangle has length ' + t('l') + ' and width ' + t('w') + '. Both the length and the width are increased by ' + t(sh.k) + '.' + figGrow(3, 2, 0.45, String(sh.k)); },
        shared: function (r) { var k = r.pick([1, 1, 2, 3]), l0 = r.int(5, 12), w0 = r.int(3, l0 - 1), m = r.int(1, 4), n = r.int(1, 4); return { k: k, l0: l0, w0: w0, m: m, n: n }; },
        parts: [
          { id: 'e16a', level: 'BEG', make: function (r, sh) {
            var k = sh.k, tgt = P.mul(P.parse('l+' + k), P.parse('w+' + k));
            return polyPart('Write the new area as a product, then expand it.', tgt, [{ is: P.parse('lw+' + k * k), code: 'fl-only', hint: 'You need all four products: ' + t('lw') + ', ' + t(k === 1 ? 'l' : k + 'l') + ', ' + t(k === 1 ? 'w' : k + 'w') + ' and ' + t(k * k) + '.' }],
              t('(l+' + k + ')(w+' + k + ')=' + tx(tgt)) + '.', ['Multiply each term of ' + t('(l+' + k + ')') + ' by each term of ' + t('(w+' + k + ')') + '.'], 'grown area', { vars: ['l', 'w'] });
          } },
          { id: 'e16b', level: 'EMG', make: function (r, sh) {
            var k = sh.k, tgt = P.parse(k + 'l+' + k + 'w+' + k * k);
            return polyPart('Subtract the original area to find the <b>increase</b>, and simplify.', tgt, [
              { is: P.parse(k + 'l+' + k + 'w'), code: 'corner-missing', hint: 'Don’t forget the small corner square, ' + t(k + '\\times' + k + '=' + k * k) + '.' },
              { is: P.mul(P.parse('l+' + k), P.parse('w+' + k)), code: 'not-increase', hint: 'That is the new area. Subtract the original area ' + t('lw') + '.' }],
              t('(lw+' + (k === 1 ? '' : k) + 'l+' + (k === 1 ? '' : k) + 'w+' + k * k + ')-lw=' + tx(tgt)) + '.', ['Increase = new area − ' + t('lw') + '.'], 'increase in area', { vars: ['l', 'w'] });
          } },
          { id: 'e16c', level: 'BEG', make: function (r, sh) {
            var k = sh.k, l = sh.l0, w = sh.w0, inc = (l + k) * (w + k) - l * w;
            return numPart('Test your result with ' + t('l=' + l) + ' and ' + t('w=' + w) + ': what is the increase in area?', inc, [[(l + k) * (w + k), 'not-increase', 'That is the new area. Subtract the original ' + t(l + '\\times' + w + '=' + l * w) + '.'], [k * l + k * w, 'corner-missing', 'Include the corner piece, ' + t(k * k) + '.']],
              'Old: ' + t(l + '\\times' + w + '=' + l * w) + '. New: ' + t((l + k) + '\\times' + (w + k) + '=' + (l + k) * (w + k)) + '. Increase: ' + t(inc) + '. Formula: ' + t(k + '(' + l + ')+' + k + '(' + w + ')+' + k * k + '=' + inc) + ' ✓', ['Work out both areas with real numbers and subtract.'], 'increase with numbers');
          } },
          { id: 'e16d', level: 'EMG', make: function (r, sh) {
            var k = sh.k, kl = k === 1 ? 'l' : k + 'l', kw = k === 1 ? 'w' : k + 'w';
            return mcPart(r, 'The shaded part of the figure is exactly the increase. How do its three pieces match the terms of your answer to (b)?', [
              { html: 'Top strip ' + t('l') + ' by ' + t(k) + ' gives ' + t(kl) + '; side strip ' + t(k) + ' by ' + t('w') + ' gives ' + t(kw) + '; the corner ' + t(k) + ' by ' + t(k) + ' gives ' + t(k * k) + '.', right: true },
              { html: 'Top strip gives ' + t('lw') + ', side strip gives ' + t(kw) + ', corner gives ' + t(k) + '.', why: t('lw') + ' is the original (white) rectangle, not part of the increase.' },
              { html: 'The two strips give ' + t(kl) + ' and ' + t(kw) + '; the corner is counted inside the strips.', why: 'Look at the dashed lines: the corner is a separate piece of area ' + t(k * k) + '.' },
              { html: 'Each strip gives ' + t(k * k) + ' and the corner gives ' + t('lw') + '.', why: 'A strip is ' + t(k) + ' wide and as long as a whole side.' }],
              'Top strip: ' + t('l\\times' + k + '=' + kl) + '. Side strip: ' + t(k + '\\times w=' + kw) + '. Corner: ' + t(k + '\\times' + k + '=' + k * k) + '. Together: ' + t(kl + '+' + kw + '+' + k * k) + '.', ['Read each shaded piece’s length and width from the figure.'], 'match pieces to terms');
          } },
          { id: 'e16e', level: 'ADV', make: function (r, sh) {
            var m = sh.m, n = sh.n, tgt = P.sub(P.mul(P.parse('l+' + m), P.parse('w+' + n)), P.parse('lw'));
            return polyPart('Now the length is increased by ' + t(m) + ' and the width by ' + t(n) + '. Give the increase in area.', tgt, [
              { is: P.parse(m + 'l+' + n + 'w+' + m * n), code: 'swap', hint: 'The strip along the length is ' + t('l') + ' long and ' + t(n) + ' wide (the width increase): ' + t(n === 1 ? 'l' : n + 'l') + '.' },
              { is: P.parse(n + 'l+' + m + 'w'), code: 'corner-missing', hint: 'Don’t forget the corner piece, ' + t(m + '\\times' + n + '=' + m * n) + '.' }],
              t('(l+' + m + ')(w+' + n + ')-lw=' + tx(P.mul(P.parse('l+' + m), P.parse('w+' + n))) + '-lw=' + tx(tgt)) + '. Check with ' + t('l=' + sh.l0 + ',\\ w=' + sh.w0) + ': ' + t((sh.l0 + m) * (sh.w0 + n) + '-' + sh.l0 * sh.w0 + '=' + (sh.n * sh.l0 + sh.m * sh.w0 + sh.m * sh.n)) + ' ✓',
              ['Expand ' + t('(l+' + m + ')(w+' + n + ')') + ' and subtract ' + t('lw') + '.'], 'general increase', { vars: ['l', 'w'] });
          } }] },
      /* ---------- EP17: cube vs prism ---------- */
      { num: '17', stem: function (sh) {
          var X = 2, a = sh.a, d = sh.d, e = X + a;
          return 'A cube has edge length ' + t('(x+' + a + ')' + CM) + '. A rectangular prism has dimensions ' + t(bt(sh.p1) + CM) + ', ' + t('(x+' + a + ')' + CM) + ' and ' + t('(x+' + (a + d) + ')' + CM) + ' — the same middle measurement, with the other two moved ' + t(d) + ' cm apart.' +
            sideBySide([figPrism(e, e, e, 'x+' + a, 'x+' + a, 'x+' + a, { pw: 80, ph: 80, label: 'cube', maxw: 220 }), figPrism(X + a + d, Math.max(X + a - d, 0.6), e, 'x+' + (a + d), tx(sh.p1), 'x+' + a, { pw: 100, ph: 80, maxw: 240 })]);
        },
        shared: function (r) {
          var a = r.int(2, 5), d = r.int(1, 3); if (d > a) d = 1;
          var c = lin(1, a), p1 = lin(1, a - d), C = P.pow(c, 3), Pr = P.mul(p1, c, lin(1, a + d));
          return { a: a, d: d, c: c, p1: p1, C: C, Pr: Pr, D: P.sub(C, Pr) };
        },
        parts: [
          { id: 'e17a', level: 'PRG', make: function (r, sh) {
            var sq = P.pow(sh.c, 2);
            return polyPart('Expand the cube’s volume.', sh.C, [{ is: P.add(mono(1, 'x', 3), P.num(Math.pow(sh.a, 3))), code: 'cube-terms', hint: 'You can’t cube each term separately. Square first, then multiply by ' + t('(x+' + sh.a + ')') + ' again.' }, { is: sq, code: 'square-only', hint: 'That is ' + t('(x+' + sh.a + ')^{2}') + '. Multiply by the third factor.' }],
              steps(['(x+' + sh.a + ')^{2}=' + tx(sq), '(' + tx(sq) + ')(x+' + sh.a + ')=' + tx(sh.C)]) + ' ' + t(u(CM3)), ['Square first, then multiply by the binomial again.'], 'cube volume');
          } },
          { id: 'e17b', level: 'PRG', make: function (r, sh) {
            var p3 = lin(1, sh.a + sh.d), two = P.mul(sh.p1, p3);
            return polyPart('Expand the prism’s volume. Multiply two factors first, then the third.', sh.Pr, prismWrongs(sh.p1, sh.c, p3),
              'Multiply the outer pair first: ' + t(bt(sh.p1) + bt(p3) + '=' + tx(two)) + '.<br>Then ' + t('(' + tx(two) + ')(x+' + sh.a + ')=' + tx(sh.Pr)) + ' ' + t(u(CM3)) + '.', ['Pick two binomials to multiply first, then multiply the trinomial by the third.'], 'prism volume');
          } },
          { id: 'e17c', level: 'PRG', make: function (r, sh) {
            return polyPart('Subtract to find how much larger the cube’s volume is, and simplify. (Two whole degrees cancel.)', sh.D, [{ is: P.neg(sh.D), code: 'sign-all', hint: 'Cube minus prism.' }, { is: badSub(sh.C, sh.Pr), code: 'sub-sign', hint: 'Subtract every term of the prism’s volume.' }],
              t('(' + tx(sh.C) + ')-(' + tx(sh.Pr) + ')=' + tx(sh.D)) + '. The ' + t('x^{3}') + ' <b>and</b> ' + t('x^{2}') + ' terms cancel. Factored: ' + t(sh.d * sh.d + '(x+' + sh.a + ')') + '.', ['Put the prism’s volume in brackets and subtract term by term.'], 'cube minus prism');
          } },
          { id: 'e17d', level: 'BEG', make: function (r, sh) {
            var X = 2, e = X + sh.a, Cv = e * e * e, Pv = (e - sh.d) * e * (e + sh.d);
            return numPart('Check your difference at ' + t('x=2') + ' by computing both volumes from their real dimensions. What is the difference?', Cv - Pv, [[Cv, 'one-piece', 'That is the cube alone. Subtract the prism.']],
              'At ' + t('x=2') + ': cube edge ' + t(e) + ', so ' + t(e + '^{3}=' + Cv) + '; prism ' + t((e - sh.d) + '\\times' + e + '\\times' + (e + sh.d) + '=' + Pv) + '. Difference ' + t(Cv - Pv) + '; ' + t(tx(sh.D).replace(/x/g, '(2)') + '=' + (Cv - Pv)) + ' ✓',
              ['Work out both volumes with real numbers.'], 'difference at x=2', CM3);
          } },
          { id: 'e17e', level: 'PRG', make: function (r, sh) {
            var z = -sh.a, D2 = sh.d * sh.d;
            return mcPart(r, 'Setting your difference equal to zero gives ' + t('x=' + z) + '. Why doesn’t that give a cube and prism with equal volumes?', [
              { html: 'At ' + t('x=' + z) + ' the cube’s edge is ' + t(0) + ' and a prism side is negative, so no solids exist. For real solids ' + t('x+' + sh.a + '>0') + ', so ' + t(D2 + '(x+' + sh.a + ')>0') + ': the cube always wins.', right: true },
              { html: 'It does: at ' + t('x=' + z) + ' both solids have volume ' + t(0) + ', so they are equal.', why: 'A solid with an edge of ' + t(0) + ' (or a negative side) isn’t a solid at all.' },
              { html: 'Because the equation was set up wrong; the prism is actually always bigger.', why: 'Test ' + t('x=2') + ': the cube was bigger. Check the sign of the difference for real sizes.' },
              { html: 'Because ' + t('x') + ' must be a whole number.', why: t(z) + ' is a whole number. The problem is what the side lengths become.' }],
              'At ' + t('x=' + z) + ' the cube’s edge is ' + t(0) + ' cm and the prism’s sides are ' + t(-sh.d) + ', ' + t(0) + ', ' + t(sh.d) + ' cm, so no solids exist. Every side positive means ' + t('x>' + (sh.d - sh.a)) + ', so ' + t('x+' + sh.a + '>0') + ' and the difference ' + t(D2 + '(x+' + sh.a + ')') + ' is always positive.',
              ['Substitute ' + t('x=' + z) + ' into each side length.'], 'cube always larger');
          } }] },
      /* ---------- EP18: MC card and photo ---------- */
      { num: '18', section: 'Extra practice G — Multiple choice and numerical response', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: 'e18', level: 'EMG', make: function (r) {
          var s = gen(function () { var a = r.int(3, 7), b = r.int(1, 4); return a > b + 1 ? { a: a, b: b } : null; });
          var card = lin(2, s.a), ph = lin(1, s.b), C = P.pow(card, 2), Ph = P.pow(ph, 2), ans = P.sub(C, Ph);
          var A = P.pow(lin(1, s.a - s.b), 2), Cw = P.sub(C, sqNoMid(ph)), D = P.sub(P.scale(card, 4), P.scale(ph, 4));
          return mcPart(r, 'A square photograph of side ' + t(bt(ph) + CM) + ' is mounted centred on a square card of side ' + t(bt(card) + CM) + '. The shaded area of card still showing is' + figCard(tx(card), tx(ph)), [
            { html: t(tx(A)), why: 'That squares the difference of the sides. Find card area minus photo area.' },
            { html: t(tx(ans)), right: true },
            { html: t(tx(Cw)), why: 'Check ' + t(bt(ph) + '^{2}') + ': it has a middle term, ' + t(tx(Ph)) + '.' },
            { html: t(tx(D)), why: 'That subtracts perimeters, a degree-1 length. Use areas.' }],
            'Shaded ' + t('=' + bt(card) + '^{2}-' + bt(ph) + '^{2}=(' + tx(C) + ')-(' + tx(Ph) + ')=' + tx(ans)) + ' ' + t(u(CM2)) + '.', ['Card area − photo area; square each binomial with its middle term.'], 'MC card minus photo', true);
        } }] },
      { num: '19', stem: '<i>(Numerical Response)</i>', parts: [
        { id: 'e19', level: 'PRG', make: function (r) {
          var s = sqRectGen(r), Lq = P.pow(lin(1, s.a), 2), Rq = P.mul(lin(1, s.b), lin(1, s.c));
          return B.nr('A square of side ' + t('(x+' + s.a + ')' + CM) + ' has exactly the same area as a rectangle measuring ' + t('(x+' + s.b + ')' + CM) + ' by ' + t('(x+' + s.c + ')' + CM) + '. The value of ' + t('x') + ' is ________.', s.x,
            function (v) { return v === -s.x ? { code: 'sign', hint: 'Check your signs when you collect the ' + t('x') + ' terms.' } : null; },
            steps([tx(Lq) + '=' + tx(Rq), (2 * s.a) + 'x+' + s.a * s.a + '=' + (s.b + s.c) + 'x+' + s.b * s.c, 'x=' + s.x]) + '<br>Check: ' + t((s.x + s.a) + '^{2}=' + Math.pow(s.x + s.a, 2)) + ' and ' + t((s.x + s.b) + '\\times' + (s.x + s.c) + '=' + (s.x + s.b) * (s.x + s.c)) + ' ✓',
            ['Set the areas equal and expand; the ' + t('x^{2}') + ' terms cancel.'], 'NR square = rectangle');
        } }] }
    ]
  });
})(window);
